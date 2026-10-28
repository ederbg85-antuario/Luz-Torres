import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as acquisition from '../src/lib/acquisition.ts';

// Install only in a temporary directory; never point this test at a database URL.
const modulePath = process.env.LUZ_PGLITE_MODULE;
const migration = '../supabase/migrations/20261028034149_lead_attribution_receipts.sql';
const text = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const denyNetwork = () => { throw new Error('Unexpected network forbidden'); };
const originalFetch = globalThis.fetch;
const TEAM = crypto.randomUUID();
const OUTSIDER = crypto.randomUUID();
const PROPERTY = crypto.randomUUID();
let db;
let capi = [];
let calls = [];

test.before(async () => {
  assert.ok(modulePath, 'Set LUZ_PGLITE_MODULE to a temporary @electric-sql/pglite dist/index.js; no production fallback');
  const { PGlite } = await import(pathToFileURL(modulePath).href);
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to anon, authenticated;`);
  const schema = text('../supabase/migrations/0001_schema.sql').split('--  STORAGE')[0].replace('create extension if not exists "pgcrypto";', '');
  await db.exec(schema);
  for (const file of ['0004_visitas.sql','0005_solicitudes_visita.sql','0007_contacto_para_agendar.sql']) await db.exec(text(`../supabase/migrations/${file}`));
  await db.exec('grant usage on schema public to anon, authenticated; grant all on all tables in schema public to anon, authenticated;');
  await db.exec(text(migration));
  await db.query('insert into auth.users(id,raw_user_meta_data) values ($1,$2)', [TEAM, JSON.stringify({full_name:'Equipo QA'})]);
  await db.query(`insert into public.properties(id,slug,title,price,estado,municipio) values ($1,'fixture','Ficha QA',4950000,'CDMX','Prueba')`,[PROPERTY]);
  globalThis.fetch = denyNetwork;
});
test.after(async () => { globalThis.fetch = originalFetch; if (db) await db.close(); });
test.beforeEach(() => { capi=[]; calls=[]; });

async function rpc(name, params) {
  assert.equal(name, 'submit_web_lead');
  assert.deepEqual(Object.keys(params).sort(), ['p_acquisition','p_payload','p_retry_hash','p_submission_id']);
  calls.push(params);
  try {
    const result = await db.query('select public.submit_web_lead($1::uuid,$2::text,$3::jsonb,$4::jsonb) as result', [params.p_submission_id,params.p_retry_hash,JSON.stringify(params.p_payload),JSON.stringify(params.p_acquisition)]);
    return {data:result.rows[0].result,error:null};
  } catch(error) { return {data:null,error}; }
}

function loadSource(relative) {
  const filename=fileURLToPath(new URL(`../src/${relative}`,import.meta.url));
  const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const module={exports:{}};
  const dependencies={
    'node:crypto':crypto,
    '@/lib/supabase/public':{isSupabaseConfigured:()=>true,createSupabasePublicClient:()=>({rpc})},
    '@/lib/meta-conversions':{sendMetaServerEvent:async (event)=>{capi.push(event);return {sent:false,reason:'isolated'};}},
    '@/lib/supabase/config':{SITE_URL:'https://luztorres.com'},
  };
  const evaluate=runInNewContext(`(function(require,module,exports){${code}\n})`,{FormData,Date,URL,console,fetch:denyNetwork},{filename});
  evaluate((name)=>{
    if(Object.hasOwn(dependencies,name))return dependencies[name];
    if(name.startsWith('@/lib/'))return loadSource(`lib/${name.slice('@/lib/'.length)}.ts`);
    throw new Error(`Unmocked dependency ${name}`);
  },module,module.exports);
  return module.exports;
}
function context(){const touch={landing_path:'/propiedades/venta',referrer_host:'google.com',observed_at:new Date().toISOString(),channel:'organic_search'};return {submission_id:crypto.randomUUID(),retry_token:crypto.randomUUID(),acquisition:{first_touch:touch,last_touch:touch,conversion_path:'/contacto'}};}
function contactForm(ctx,extra={}){const data=new FormData();for(const[k,v]of Object.entries({full_name:'Persona QA',phone:'5500000000',email:'qa@example.test',interest:'renta',message:'Prueba aislada',lead_context:JSON.stringify(ctx),...extra}))data.set(k,v);return data;}
const counts=async()=> (await db.query('select (select count(*)::int from contacts) contacts,(select count(*)::int from appointments) appointments,(select count(*)::int from lead_submissions) receipts')).rows[0];

test('real contact action → real adapter → SQL: IDs persist, retry does not insert or resend CAPI',async()=>{
  const action=loadSource('lib/actions/contact.ts');const ctx=context();
  const before=await counts();
  const first=await action.submitContactForm({status:'idle',message:''},contactForm(ctx));
  const retry=await action.submitContactForm({status:'idle',message:''},contactForm(ctx));
  assert.equal(first.status,'success');assert.equal(retry.eventId,first.eventId);assert.equal(retry.leadId,first.leadId);assert.equal(first.interest,'renta');
  const after=await counts();assert.equal(after.contacts,before.contacts+1);assert.equal(after.receipts,before.receipts+1);assert.equal(after.appointments,before.appointments);assert.equal(capi.length,1);assert.equal(capi[0].eventId,first.eventId);
  assert.equal(Object.hasOwn(capi[0],'leadId'),false);
  const row=(await db.query('select acquisition,event_id,contact_id from lead_submissions where id=$1',[ctx.submission_id])).rows[0];
  assert.equal(row.event_id,first.eventId);assert.equal(row.contact_id,first.leadId);assert.equal(row.acquisition.first_touch.channel,'organic_search');
  assert.equal(JSON.stringify(row.acquisition).includes('qa@example.test'),false);
});

test('same key with wrong token or changed payload does not reveal IDs or alter accepted contact',async()=>{
  const action=loadSource('lib/actions/contact.ts');const ctx=context();
  await action.submitContactForm({status:'idle',message:''},contactForm(ctx));
  const before=await counts();
  for(const input of [contactForm({...ctx,retry_token:crypto.randomUUID()}),contactForm(ctx,{interest:'compra'})]){
    const result=await action.submitContactForm({status:'idle',message:''},input);
    assert.equal(result.status,'error');assert.equal(result.eventId,undefined);assert.equal(result.leadId,undefined);
  }
  assert.deepEqual(await counts(),before);
  // Direct RPC bypass: no client-supplied fingerprint exists to hold constant.
  const accepted=calls[0];
  const altered=await rpc('submit_web_lead',{...accepted,p_payload:{...accepted.p_payload,interest:'compra'}});
  assert.equal(altered.data.ok,false);assert.equal(altered.data.lead_id,undefined);assert.equal(altered.data.event_id,undefined);
  assert.deepEqual(await counts(),before);
  const wrongToken=await rpc('submit_web_lead',{...accepted,p_retry_hash:'0'.repeat(64)});
  assert.equal(wrongToken.data.reason,undefined);
  const conflicted=await action.submitContactForm({status:'idle',message:''},contactForm(ctx,{interest:'compra'}));
  assert.equal(conflicted.retryConflict,true);
});

test('missing browser crypto/context falls back to server UUIDs and unknown acquisition',async()=>{
  const {submitContactForm}=loadSource('lib/actions/contact.ts');const data=contactForm(context());data.delete('lead_context');
  const result=await submitContactForm({status:'idle',message:''},data);
  assert.equal(result.status,'success');assert.ok(result.leadId);assert.ok(result.eventId);
  const snapshot=(await db.query('select acquisition from lead_submissions where contact_id=$1',[result.leadId])).rows[0].acquisition;
  assert.equal(snapshot.source_basis,'unknown');assert.equal(snapshot.source_confidence,'unknown');assert.equal(snapshot.first_touch,null);
});

test('SQL derives channel instead of trusting a forged organic enum; app/SQL normalize campaign flags consistently',async()=>{
  const now=Date.now();
  const examples=[
    ['https://luztorres.com/contacto?utm_source=instagram&utm_medium=paid_social&utm_campaign=property_alpes_2026','https://instagram.com'],
    ['https://luztorres.com/contacto?utm_source=private%40example.com','https://google.com'],
    ['https://luztorres.com/contacto?gclid=never-copy','https://google.com'],
    ['https://luztorres.com/contacto?msclkid=never-copy','https://bing.com'],
    ['https://luztorres.com/contacto?fbclid=never-copy','https://facebook.com'],
    ['https://luztorres.com/contacto',''],
    ['https://luztorres.com/contacto','https://google.com'],
  ];
  for(const [href,referrer]of examples){
    const touch=acquisition.touchFromLocation(href,referrer,now);
    const result=(await db.query('select public.clean_lead_touch($1::jsonb) result',[JSON.stringify({...touch,channel:'organic_search'})])).rows[0].result;
    assert.equal(result.channel,touch.channel,href);
    assert.equal(result.utm_medium,touch.utm_medium);
    assert.equal(result.campaign_rejected,touch.campaign_rejected);
    assert.equal(result.paid_click_present,touch.paid_click_present);
    assert.equal(result.social_click_present,touch.social_click_present);
  }
});

test('real visit action preserves optional email/date and atomically joins appointment, lead and event',async()=>{
  const {requestVisit}=loadSource('lib/actions/visits.ts');const ctx=context();const before=await counts();
  const input={property_id:PROPERTY,full_name:'Persona QA',phone:'55 0000 0000',email:'',financing:'por_definir',message:'',lead_context:ctx};
  const first=await requestVisit(input);const retry=await requestVisit(input);
  assert.equal(first.ok,true);assert.equal(retry.eventId,first.eventId);assert.equal(retry.leadId,first.leadId);assert.equal(capi.length,1);
  const after=await counts();assert.equal(after.contacts,before.contacts+1);assert.equal(after.appointments,before.appointments+1);assert.equal(after.receipts,before.receipts+1);
  const row=(await db.query('select c.email,c.phone,a.starts_at,a.status from contacts c join appointments a on a.contact_id=c.id where c.id=$1',[first.leadId])).rows[0];
  assert.equal(row.email,null);assert.equal(row.phone,'+525500000000');assert.equal(row.starts_at,null);assert.equal(row.status,'solicitud');
});

test('seller action keeps seller segment and persistent ID; invalid/honeypot produce zero rows',async()=>{
  const {submitSellerForm}=loadSource('lib/actions/seller.ts');const ctx=context();
  const data=contactForm(ctx,{property_type:'Casa',location:'Zona QA',estimated_value:'',message:''});
  const result=await submitSellerForm({status:'idle',message:''},data);
  assert.equal(result.status,'success');assert.ok(result.leadId);assert.equal(capi[0].eventId,result.eventId);assert.equal(capi[0].eventName,'SellerLead');
  const receipt=(await db.query('select lead_type,contact_id from lead_submissions where id=$1',[ctx.submission_id])).rows[0];assert.equal(receipt.lead_type,'seller');assert.equal(receipt.contact_id,result.leadId);
  const before=await counts();const {submitContactForm}=loadSource('lib/actions/contact.ts');
  for(const data of [contactForm(context(),{email:'bad'}),contactForm(context(),{company:'bot'})]){const r=await submitContactForm({status:'idle',message:''},data);assert.equal(r.eventId,undefined);}
  assert.deepEqual(await counts(),before);
});

test('failed appointment rolls back contact and receipt in the same SQL transaction',async()=>{
  const before=await counts();
  await db.exec(`create function public.fixture_reject_appointment() returns trigger language plpgsql as $$begin raise exception 'fixture rejection';end$$;
    create trigger fixture_reject before insert on public.appointments for each row execute function public.fixture_reject_appointment();`);
  const {requestVisit}=loadSource('lib/actions/visits.ts');
  const result=await requestVisit({property_id:PROPERTY,full_name:'Persona QA',phone:'5500000000',financing:'por_definir',message:'',lead_context:context()});
  assert.equal(result.ok,false);assert.equal(result.eventId,undefined);assert.equal(capi.length,0);assert.deepEqual(await counts(),before);
  await db.exec('drop trigger fixture_reject on public.appointments; drop function public.fixture_reject_appointment();');
});

test('permissions: anon cannot read receipts; profile team can; authenticated outsider sees zero',async()=>{
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.lead_submissions'),/permission denied/);
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[OUTSIDER]);
  await db.exec('set role authenticated');
  assert.equal((await db.query('select count(*)::int n from public.lead_submissions')).rows[0].n,0);
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[TEAM]);
  await db.exec('set role authenticated');
  assert.ok((await db.query('select contact_id,event_id,lead_type,acquisition,created_at from public.lead_submissions')).rows.length>0);
  for(const field of ['retry_hash','payload_hash','id']) await assert.rejects(db.query(`select ${field} from public.lead_submissions`),/permission denied/);
  await assert.rejects(db.query('delete from public.lead_submissions'),/permission denied/);
  await db.exec('reset role');
});

test('anonymous intake stays executable; SQL itself strips attribution PII and does not guess history',async()=>{
  const payload={lead_type:'contact',full_name:'Persona QA',phone:'5500000000',email:'qa@example.test',interest:'compra'};
  const ctx=context();
  const acquisition={first_touch:{...ctx.acquisition.first_touch,landing_path:'/contacto?email=private',email:'private@example.test'},last_touch:{...ctx.acquisition.last_touch,utm_campaign:'private@example.test',utm_content:'5500000000',utm_term:'a'.repeat(64),referrer_host:'google.com/private?token=secret',secret:'never'},conversion_path:'/contacto#private',email:'never'};
  await db.exec('set role anon');
  const result=await rpc('submit_web_lead',{p_submission_id:ctx.submission_id,p_retry_hash:'a'.repeat(64),p_payload:payload,p_acquisition:acquisition});
  assert.equal(result.data.ok,true);assert.equal(Object.hasOwn(result.data,'email'),false);
  await db.exec('reset role');
  const stored=(await db.query('select acquisition from lead_submissions where id=$1',[ctx.submission_id])).rows[0].acquisition;
  assert.equal(stored.first_touch,null);assert.equal(stored.conversion_path,null);assert.equal(stored.last_touch.utm_campaign,null);assert.equal(stored.last_touch.utm_content,null);assert.equal(stored.last_touch.utm_term,null);assert.equal(stored.last_touch.referrer_host,null);
  assert.equal(JSON.stringify(stored).includes('private'),false);assert.equal(JSON.stringify(stored).includes('never'),false);
  const old=(await db.query("select pronargs from pg_proc where proname='request_visit'")).rows;assert.equal(old.length,1);assert.equal(old[0].pronargs,8);
});
