import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import * as acquisition from '../src/lib/acquisition.ts';
import { summarizeLeadSources } from '../src/lib/lead-attribution-report.ts';

function loadBrowser({ blocked=false, writeBlocked=false, corrupt=false, cryptoMissing=false, ssr=false }={}) {
  const entries=new Map(corrupt ? [['lt.acquisition.v1','{bad-json']] : []);
  const location={href:'https://luztorres.com/propiedades/venta?utm_source=google&utm_medium=organic#private'};
  const document={referrer:'https://www.google.com/search?q=private&email=never'};
  const window={location,sessionStorage:{getItem(k){if(blocked)throw Error('blocked');return entries.get(k)??null;},setItem(k,v){if(blocked||writeBlocked)throw Error('blocked');entries.set(k,v);},removeItem(k){if(blocked)throw Error('blocked');entries.delete(k);}}};
  const code=ts.transpileModule(readFileSync(new URL('../src/lib/acquisition-browser.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const module={exports:{}};
  const evaluate=runInNewContext(`(function(require,module,exports){${code}\n})`,{window:ssr?undefined:window,document:ssr?undefined:document,Date,URL,crypto:cryptoMissing?undefined:{randomUUID},FormData,fetch(){throw Error('No network allowed');}});
  evaluate((name)=>{assert.equal(name,'@/lib/acquisition');return acquisition;},module,module.exports);
  return {...module.exports,entries,location,document};
}

test('public paths and referrer hosts remove query, fragment and private routes',()=>{
  assert.equal(acquisition.cleanPublicPath('/contacto?email=private#secret'),'/contacto');
  for(const value of ['/admin/crm/private','/api/auth','https://foreign.test/contacto','/propiedades/private@example.com'])assert.equal(acquisition.cleanPublicPath(value),null);
  assert.equal(acquisition.cleanReferrerHost('https://www.google.com/private?token=secret'),'google.com');
  for(const value of ['https://luztorres.com/private','https://accounts.google.com/private','http://localhost:3000/private'])assert.equal(acquisition.cleanReferrerHost(value),null);
});

test('campaigns accept underscores while excluding email, phone, UUID, token and oversized values',()=>{
  assert.equal(acquisition.cleanCampaignValue('PROPERTY_alpes_2026'),'property_alpes_2026');
  for(const value of ['private@example.com','5500000000','phone-5500000000',randomUUID(),'a'.repeat(64),'token.with.signature','x'.repeat(81)])assert.equal(acquisition.cleanCampaignValue(value),null);
});

test('paid_social is paid social; raw UTM is retained and flags do not contain click IDs',()=>{
  const touch=acquisition.touchFromLocation('https://luztorres.com/contacto?utm_source=instagram&utm_medium=paid_social&utm_campaign=property_alpes_2026&fbclid=never-copy-this','https://l.instagram.com/path?private=yes');
  assert.equal(touch.channel,'paid_social');assert.equal(touch.utm_medium,'paid_social');assert.equal(touch.social_click_present,true);assert.equal(JSON.stringify(touch).includes('never-copy-this'),false);
});

test('rejected UTM, Google ad click, or social click alone never becomes organic',()=>{
  for(const query of ['utm_source=private%40example.com','utm_campaign=token.with.signature','gclid=never-copy','msclkid=never-copy','fbclid=never-copy','gclid=never-copy&utm_source=google&utm_medium=organic']){
    const touch=acquisition.touchFromLocation(`https://luztorres.com/contacto?${query}`,'https://google.com/search');
    assert.equal(touch.channel,'unknown',query);assert.equal(JSON.stringify(touch).includes('never-copy'),false);
  }
});

test('without acquisition evidence the result is unknown; external search is observed not verified',()=>{
  assert.equal(acquisition.touchFromLocation('https://luztorres.com/contacto','').channel,'unknown');
  assert.equal(acquisition.touchFromLocation('https://luztorres.com/contacto','https://luztorres.com/propiedades').channel,'unknown');
  assert.equal(acquisition.touchFromLocation('https://luztorres.com/contacto','https://google.com/search').channel,'organic_search');
  const result=acquisition.normalizeAcquisition(null);assert.equal(result.source_basis,'unknown');assert.equal(result.source_confidence,'unknown');
});

test('SPA internal paths preserve first/last acquisition, conversion path follows the form',()=>{
  const browser=loadBrowser();const first=browser.captureAcquisition(true);
  browser.location.href='https://luztorres.com/contacto?email=private#secret';
  const next=browser.captureAcquisition(false);
  assert.equal(next.first_touch.landing_path,first.first_touch.landing_path);assert.equal(next.last_touch.landing_path,first.last_touch.landing_path);assert.equal(next.conversion_path,'/contacto');
  assert.equal(JSON.stringify(next).includes('private'),false);
  browser.location.href='https://luztorres.com/propiedades?utm_source=instagram&utm_medium=paid_social';
  assert.equal(browser.captureAcquisition(false).last_touch.channel,'organic_search');
});

test('later tagged arrival updates last touch without replacing first touch',()=>{
  const browser=loadBrowser();browser.captureAcquisition(true);
  browser.location.href='https://luztorres.com/contacto?utm_source=instagram&utm_medium=paid_social&utm_campaign=alpes_2026';
  const next=browser.captureAcquisition(true);
  assert.equal(next.first_touch.channel,'organic_search');assert.equal(next.last_touch.channel,'paid_social');
  assert.equal(next.source_basis,'browser_observed');assert.equal(next.source_confidence,'low');
});

test('blocked storage preserves memory and retry nonce without breaking acquisition',()=>{
  const browser=loadBrowser({blocked:true});browser.captureAcquisition(true);
  const a=browser.getLeadSubmission('contact');browser.location.href='https://luztorres.com/contacto';const b=browser.getLeadSubmission('contact');
  assert.equal(a.submission_id,b.submission_id);assert.equal(a.retry_token,b.retry_token);assert.equal(b.acquisition.first_touch.landing_path,'/propiedades/venta');
  browser.finishLeadSubmission('contact');assert.notEqual(browser.getLeadSubmission('contact').submission_id,a.submission_id);
});

test('readable but unwritable storage cannot replace fresh memory with an older journey',()=>{
  const browser=loadBrowser({writeBlocked:true});
  const old=acquisition.touchFromLocation('https://luztorres.com/propiedades','https://google.com');
  browser.entries.set('lt.acquisition.v1',JSON.stringify(acquisition.normalizeAcquisition({first_touch:old,last_touch:old})));
  browser.location.href='https://luztorres.com/contacto?utm_source=instagram&utm_medium=paid_social';
  assert.equal(browser.captureAcquisition(true).last_touch.channel,'paid_social');
  browser.location.href='https://luztorres.com/contacto';
  assert.equal(browser.captureAcquisition(false).last_touch.channel,'paid_social');
});

test('corrupt storage recovers; successful finish rotates key and secrets stay in POST body',()=>{
  const browser=loadBrowser({corrupt:true});const form=new FormData();browser.attachLeadSubmission(form,'seller');
  const context=JSON.parse(form.get('lead_context'));assert.equal(acquisition.isUuid(context.submission_id),true);assert.equal(acquisition.isUuid(context.retry_token),true);
  assert.equal(browser.location.href.includes(context.retry_token),false);assert.equal(JSON.stringify(context.acquisition).includes('search?q='),false);
  browser.finishLeadSubmission('seller');assert.equal(browser.entries.has('lt.submission.v1:seller'),false);
});

test('missing crypto or SSR omits context without blocking form; no weak random secret',()=>{
  for(const options of [{cryptoMissing:true,blocked:true},{ssr:true}]){
    const browser=loadBrowser(options);const form=new FormData();form.set('lead_context','stale');form.set('full_name','Persona QA');
    assert.doesNotThrow(()=>browser.attachLeadSubmission(form,'contact'));
    assert.equal(form.has('lead_context'),false);assert.equal(form.get('full_name'),'Persona QA');assert.equal(browser.getLeadSubmission('contact'),undefined);
  }
});

test('expired or future observations are discarded, no historical acquisition invented',()=>{
  const now=Date.now();const raw={landing_path:'/',referrer_host:'google.com',observed_at:new Date(now-acquisition.ACQUISITION_MAX_AGE_MS-1).toISOString()};
  assert.equal(acquisition.normalizeTouch(raw,now),null);assert.equal(acquisition.normalizeTouch({...raw,observed_at:new Date(now+600000).toISOString()},now),null);
});

test('CRM summary reconciles records by first touch, current interest and stage; old contacts stay unknown',()=>{
  const contacts=[{id:'a',stage:'nuevo',interest:'compra'},{id:'b',stage:'cerrado',interest:'renta'},{id:'c',stage:'nuevo',interest:'venta'},{id:'d',stage:'calificado',interest:'inversion'}];
  const first={channel:'organic_search'};
  const receipts=[{contact_id:'a',lead_type:'contact',acquisition:{first_touch:first,last_touch:{channel:'paid_social'}}},{contact_id:'c',lead_type:'seller',acquisition:{first_touch:first}}];
  const result=summarizeLeadSources(contacts,receipts);
  assert.equal(result.reduce((sum,row)=>sum+row.count,0),contacts.length);
  assert.equal(result.filter(row=>row.channel==='organic_search').reduce((sum,row)=>sum+row.count,0),2);
  assert.equal(result.find(row=>row.segment==='renta').channel,'unknown');
  assert.equal(result.find(row=>row.segment==='seller').count,1);
  assert.equal(result.find(row=>row.segment==='compra').channel,'organic_search');
  assert.equal(JSON.stringify(result).includes('contact_id'),false);
});

test('CRM acquisition distinguishes an unavailable query from a successful missing receipt',async()=>{
  const code=ts.transpileModule(readFileSync(new URL('../src/lib/admin-data.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const response of [{data:[],error:null},{data:null,error:new Error('DB unavailable')},new Error('Network blocked')]){
    const module={exports:{}};
    const evaluate=runInNewContext(`(function(require,module,exports){${code}\n})`,{fetch(){throw Error('No network');}});
    evaluate((name)=>{
      if(name==='server-only')return {};
      assert.equal(name,'./supabase/server');
      return {createSupabaseServerClient:async()=>{if(response instanceof Error)throw response;return {from:()=>({select:()=>({eq:()=>response})})};}};
    },module,module.exports);
    const result=await module.exports.getLeadAttributions('a');
    assert.equal(result.available,!(response instanceof Error)&&!response.error);assert.equal(result.receipts.length,0);
  }
});
