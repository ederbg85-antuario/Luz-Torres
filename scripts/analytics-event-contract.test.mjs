import test from 'node:test';
import assert from 'node:assert/strict';
import * as formDraft from '../src/lib/form-draft.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import * as analytics from '../src/lib/gtm.ts';
import * as phone from '../src/lib/phone.ts';

// No browser, CRM, Google or Meta network calls: source is evaluated with
// explicit dependency doubles. Hook replay exercises the real effect bodies;
// it is not a substitute for browser QA after deployment.
const denyNetwork = () => { throw new Error('Network is forbidden in this suite'); };
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
let browser;
test.beforeEach(() => {
  browser = {
    dataLayer: [],
    location: { origin: 'https://example.test', pathname: '/propiedades/prueba', href: 'https://example.test/propiedades/prueba' },
    addEventListener() {}, removeEventListener() {},
  };
  globalThis.window = browser;
  globalThis.fetch = denyNetwork;
});
test.afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  globalThis.fetch = originalFetch;
});

function loadSource(relative, dependencies = {}, globals = {}) {
  const filename = fileURLToPath(new URL(`../src/${relative}`, import.meta.url));
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const evaluate = runInNewContext(`(function(require, module, exports) { ${code}\n})`, {
    window: browser, document: { body: { style: {} } },
    crypto: { randomUUID }, fetch: denyNetwork, FormData, Date, console,
    ...globals,
  }, { filename });
  evaluate((name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unmocked dependency: ${name}`);
  }, module, module.exports);
  return module.exports;
}

const jsx = (type, props) => ({ type, props: props ?? {} });
const icons = new Proxy({}, { get: (_, name) => name });
function componentHarness({ state = { status: 'idle', message: '' }, stateOverrides = {}, actions = {}, fetch = denyNetwork } = {}) {
  let cursor = 0;
  let effects = [];
  let currentState = state;
  let formAction;
  const slots = [];
  const meta = [];
  const react = {
    useActionState(action) { cursor++; formAction = action; return [currentState, () => {}, false]; },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = Object.hasOwn(stateOverrides, index) ? stateOverrides[index] : initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useEffect(effect) { cursor++; effects.push(effect); },
  };
  const dependencies = {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' }, 'lucide-react': icons,
    '@/lib/gtm': analytics,
    '@/lib/phone': phone,
    '@/lib/form-draft': formDraft,
    '@/lib/acquisition-browser': {
      attachLeadSubmission() {}, finishLeadSubmission() {},
      getLeadSubmission: () => ({ submission_id: randomUUID(), retry_token: randomUUID(), acquisition: {} }),
    },
    '@/lib/meta': { trackMetaEvent: (...args) => meta.push(args) },
    '@/lib/constants': {
      CONTACT_INTEREST_LABELS: { compra: 'Compra', renta: 'Renta', venta: 'Venta', inversion: 'Inversión' },
      FINANCING_LABELS: { por_definir: 'Por definir' }, FINANCING_OPTIONS: ['por_definir'],
      whatsappLink: (message = '') => `https://wa.me/525500000000?text=${encodeURIComponent(message)}`,
    },
    '@/lib/format': { cn: (...args) => args.filter(Boolean).join(' '), formatPrice: String },
    '@/lib/supabase/config': { SITE_URL: 'https://example.test' },
    'next/navigation': { usePathname: () => '/contacto' },
    '@/lib/actions/contact': { submitContactForm() { throw new Error('Use a mocked result'); } },
    '@/lib/actions/seller': { submitSellerForm() { throw new Error('Use a mocked result'); } },
    '@/lib/actions/visits': { requestVisit() { throw new Error('Use a mocked result'); } },
    ...actions,
  };
  return {
    meta, slots,
    setResult(value) { currentState = value; },
    runFormAction: (data) => formAction(currentState, data),
    load: (name) => loadSource(`components/site/${name}.tsx`, dependencies, { fetch }),
    render(Component, props = {}) {
      cursor = 0; effects = [];
      const tree = Component(props);
      for (const effect of effects) effect();
      return tree;
    },
    replayEffects() { for (const effect of effects) effect(); },
  };
}

function findNode(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (Array.isArray(tree)) {
    for (const child of tree) { const found = findNode(child, predicate); if (found) return found; }
    return undefined;
  }
  if (predicate(tree)) return tree;
  return findNode(tree.props?.children, predicate);
}

function actionHarness({ insertError = null, configured = true } = {}) {
  const stored = [];
  const sent = [];
  const deps = {
    '@/lib/lead-persistence': { isLeadRetryConflict: () => false, persistWebLead: async (_client, payload) => {
      if (insertError) throw insertError;
      stored.push(payload);
      return { ok: true, created: true, eventId: 'server-event-1', leadId: 'lead-1', interest: payload.interest, propertyId: payload.property_id ?? null };
    } },
    '@/lib/supabase/public': {
      isSupabaseConfigured: () => configured,
      createSupabasePublicClient: () => ({ from: (table) => ({ insert: async (row) => {
        assert.equal(table, 'contacts'); stored.push(row); return { error: insertError };
      } }) }),
    },
    '@/lib/meta-conversions': {
      createMetaEventId: () => 'server-event-1',
      sendMetaServerEvent: async (event) => { sent.push(event); return { sent: false, reason: 'mocked' }; },
    },
  };
  return { ...loadSource('lib/actions/contact.ts', deps), stored, sent };
}
function contactData(overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    full_name: 'Persona QA', email: 'qa@example.test', phone: '5500000000',
    interest: 'renta', property_id: 'property-a', source_url: 'https://example.test/contacto', ...overrides,
  })) form.set(key, value);
  return form;
}

const viewA = { id: 'property-a', title: 'Ficha A', price: 3500000, operation: 'venta' };

test('server-safe helper emits nothing without a browser', () => {
  delete globalThis.window;
  assert.equal(analytics.pushEvent('view_property', { property_id: 'property-a' }), false);
});

test('closed event/parameter contract excludes PII and monetary lead value', () => {
  analytics.pushEvent('contacto_whatsapp', {
    ubicacion: 'fab', event_id: 'click-1', email: 'qa@example.test', phone: '5500000000',
    message: 'private', financing: 'credito_bancario', source_url: 'https://example.test?email=private',
    value: 3500000, event: 'purchase',
  });
  const event = browser.dataLayer[0];
  assert.equal(event.event, 'contacto_whatsapp');
  assert.equal(event.value, null); assert.equal(event.financing, null);
  for (const key of ['email', 'phone', 'message', 'source_url']) assert.equal(Object.hasOwn(event, key), false);
  assert.equal(analytics.pushEvent('purchase', {}), false);
  assert.equal(browser.dataLayer.length, 1);
});

test('generic contact clears previous property and lead context without replacing the queue', () => {
  const queue = browser.dataLayer;
  analytics.pushEvent('solicitud_visita', { property_id: 'property-a', property_title: 'Ficha A', operation: 'venta', property_price: 3500000, interest: 'compra', lead_type: 'visit' });
  analytics.pushEvent('contacto_whatsapp', { ubicacion: 'header_desktop', event_id: 'click-2' });
  const model = Object.assign({}, ...browser.dataLayer);
  for (const key of ['property_id', 'property_title', 'operation', 'property_price', 'interest', 'lead_type']) assert.equal(model[key], null);
  assert.equal(browser.dataLayer, queue);
});

test('broken analytics queue does not throw or prevent the separate Meta success event', () => {
  browser.dataLayer.push = () => { throw new Error('Mock blocked queue'); };
  const harness = componentHarness({ state: { status: 'success', message: 'OK', eventId: 'contact-1', interest: 'compra', propertyId: null } });
  const { ContactForm } = harness.load('ContactForm');
  assert.doesNotThrow(() => harness.render(ContactForm));
  assert.equal(harness.meta.length, 1);
  assert.equal(harness.meta[0][2], 'contact-1');
});

test('unconfirmed, failed and honeypot results never generate a lead event', () => {
  for (const result of [
    { status: 'idle' }, { status: 'error', eventId: 'old-id' }, { status: 'success' },
    { ok: false, eventId: 'old-id' }, { ok: true }, { ok: true, eventId: 'qa@example.test' },
  ]) assert.equal(analytics.pushLeadEvent(result, 'visit'), false);
  assert.equal(browser.dataLayer.length, 0);
});

test('successful visits use listing attributes instead of lead revenue', () => {
  assert.equal(analytics.pushLeadEvent({ ok: true, eventId: 'server-visit-1' }, 'visit', {
    property_id: 'property-a', property_price: 3500000, operation: 'venta', value: 3500000,
  }), true);
  const event = browser.dataLayer[0];
  assert.equal(event.event, 'solicitud_visita'); assert.equal(event.event_id, 'server-visit-1');
  assert.equal(event.lead_type, 'visit'); assert.equal(event.form_id, 'visit_request');
  assert.equal(event.property_price, 3500000); assert.equal(event.value, null);
});

test('property view effects replay once per current view and allow A → B → A', () => {
  const harness = componentHarness();
  const { PropertyTracking } = harness.load('PropertyTracking');
  harness.render(PropertyTracking, viewA); harness.replayEffects(); harness.render(PropertyTracking, viewA);
  assert.equal(browser.dataLayer.length, 1);
  const event = browser.dataLayer[0];
  assert.equal(event.property_id, 'property-a'); assert.equal(event.property_title, 'Ficha A');
  assert.equal(event.property_price, 3500000); assert.equal(event.value, null);
  assert.equal(harness.meta[0][0], 'ViewContent'); assert.equal(harness.meta[0][1].value, 3500000);
  assert.equal(harness.meta[0][2], event.event_id);
  harness.render(PropertyTracking, { ...viewA, id: 'property-b' });
  harness.render(PropertyTracking, viewA);
  assert.deepEqual(browser.dataLayer.map((event) => event.property_id), ['property-a', 'property-b', 'property-a']);
});

test('contact server returns the selected, saved interest and shares its event ID with CAPI', async () => {
  const harness = actionHarness();
  const result = await harness.submitContactForm({ status: 'idle', message: '' }, contactData());
  assert.equal(result.status, 'success'); assert.equal(result.interest, 'renta');
  assert.equal(result.propertyId, 'property-a'); assert.equal(harness.stored[0].interest, 'renta');
  assert.equal(result.eventId, harness.sent[0].eventId);
  assert.equal(harness.sent[0].contentName, 'Contacto web · renta');
  // A mocked CAPI failure does not undo a successful persisted contact.
  assert.equal(harness.stored.length, 1);
});

test('invalid contact, honeypot and failed persistence have no success ID/CAPI', async () => {
  for (const data of [contactData({ email: 'invalid' }), contactData({ company: 'bot' })]) {
    const harness = actionHarness();
    const result = await harness.submitContactForm({ status: 'idle', message: '' }, data);
    assert.equal(result.eventId, undefined); assert.equal(harness.stored.length, 0); assert.equal(harness.sent.length, 0);
  }
  const harness = actionHarness({ insertError: new Error('Mock DB error') });
  const result = await harness.submitContactForm({ status: 'idle', message: '' }, contactData());
  assert.equal(result.status, 'error'); assert.equal(result.eventId, undefined); assert.equal(harness.sent.length, 0);
});

test('contact normalizes an invalid interest before returning it', async () => {
  const harness = actionHarness();
  const result = await harness.submitContactForm({ status: 'idle', message: '' }, contactData({ interest: 'unsupported' }));
  assert.equal(result.interest, 'compra'); assert.equal(harness.stored[0].interest, 'compra');
});

test('contact UI uses confirmed server interest and deduplicates replay/rerender', () => {
  const harness = componentHarness({ state: { status: 'success', message: 'OK', eventId: 'contact-1', interest: 'renta', propertyId: 'property-a' } });
  const { ContactForm } = harness.load('ContactForm');
  const props = { defaultInterest: 'compra', propertyId: 'property-a', propertyTitle: 'Ficha A' };
  harness.render(ContactForm, props); harness.replayEffects();
  harness.render(ContactForm, { ...props, defaultInterest: 'venta' });
  assert.equal(browser.dataLayer.length, 1); assert.equal(harness.meta.length, 1);
  const event = browser.dataLayer[0];
  assert.equal(event.interest, 'renta'); assert.equal(event.lead_type, 'contact'); assert.equal(event.form_id, 'contact');
  assert.equal(harness.meta[0][1].content_name, 'Contacto web · renta'); assert.equal(harness.meta[0][2], event.event_id);
  harness.setResult({ status: 'success', message: 'OK', eventId: 'contact-2', interest: 'compra', propertyId: null });
  harness.render(ContactForm, props);
  assert.equal(browser.dataLayer.length, 2); assert.equal(browser.dataLayer[1].property_id, null);
});

test('contact UI does not track error, honeypot or missing confirmed interest', () => {
  const harness = componentHarness(); const { ContactForm } = harness.load('ContactForm');
  for (const result of [
    { status: 'error', message: 'Failed' }, { status: 'success', message: 'Honeypot' },
    { status: 'success', message: 'No confirmed interest', eventId: 'contact-1' },
  ]) { harness.setResult(result); harness.render(ContactForm); harness.replayEffects(); }
  assert.equal(browser.dataLayer.length, 0); assert.equal(harness.meta.length, 0);
});

test('seller UI distinguishes seller and clears property context with replay guard', () => {
  analytics.pushEvent('view_property', { property_id: 'property-a', operation: 'venta' });
  const harness = componentHarness({ state: { status: 'success', message: 'OK', eventId: 'seller-1' } });
  const { SellerForm } = harness.load('SellerForm');
  harness.render(SellerForm); harness.replayEffects(); harness.render(SellerForm);
  assert.equal(browser.dataLayer.length, 2); assert.equal(harness.meta.length, 1);
  const event = browser.dataLayer[1];
  assert.equal(event.lead_type, 'seller'); assert.equal(event.form_id, 'seller'); assert.equal(event.interest, 'venta');
  assert.equal(event.property_id, null); assert.equal(harness.meta[0][0], 'SellerLead'); assert.equal(harness.meta[0][2], event.event_id);
});

test('contact and seller network rejection stays inline, preserves retry context and emits no success',async()=>{
  for(const [name,fn]of [['ContactForm','submitContactForm'],['SellerForm','submitSellerForm']]){
    const calls=[];const path=name==='ContactForm'?'contact':'seller';
    const harness=componentHarness({actions:{
      [`@/lib/actions/${path}`]:{[fn]:async()=>{throw Error('Mock response lost');}},
      '@/lib/acquisition-browser':{attachLeadSubmission:()=>calls.push('attach'),finishLeadSubmission:()=>calls.push('finish')},
    }});
    const module=harness.load(name);harness.render(module[name]);
    const result=await harness.runFormAction(new FormData());
    assert.equal(result.status,'error');assert.equal(result.eventId,undefined);assert.deepEqual(calls,['attach']);
    harness.setResult(result);harness.render(module[name]);assert.equal(browser.dataLayer.length,0);assert.equal(harness.meta.length,0);
  }
});

for (const [name, actionName, extra] of [
  ['ContactForm', 'submitContactForm', { interest: 'renta' }],
  ['SellerForm', 'submitSellerForm', { property_type: 'Departamento', location: 'Zona QA', estimated_value: '$3,500,000' }],
]) {
  test(`${name} retains its controlled draft after server error, lost response and retry conflict`, async () => {
    const values = { full_name: 'A', email: 'qa@example.test', phone: '5500000000', message: 'Borrador privado de QA', ...extra };
    for (const failure of [{ status: 'error', message: 'Rejected by server' }, new Error('Response lost'), { status: 'error', message: 'Changed payload', retryConflict: true }]) {
      const actionPath = name === 'ContactForm' ? 'contact' : 'seller';
      const harness = componentHarness({ actions: { [`@/lib/actions/${actionPath}`]: { [actionName]: async () => {
        if (failure instanceof Error) throw failure;
        return failure;
      } } } });
      const Component = harness.load(name)[name];
      const props = name === 'ContactForm' ? { defaultInterest: 'compra' } : {};
      let tree = harness.render(Component, props);
      for (const [field, value] of Object.entries(values)) {
        const node = findNode(tree, (item) => item.props?.name === field);
        assert.ok(node, field); assert.equal(typeof node.props.onChange, 'function', field);
        node.props.onChange({ target: { value } });
      }
      tree = harness.render(Component, props);
      const body = new FormData();
      for (const [field, value] of Object.entries(values)) body.set(field, value);
      const result = await harness.runFormAction(body);
      assert.equal(result.status, 'error');
      harness.setResult(result);
      tree = harness.render(Component, props);
      for (const [field, value] of Object.entries(values)) {
        const node = findNode(tree, (item) => item.props?.name === field);
        assert.equal(node.props.value, value, `${field} must survive React action reset`);
        assert.equal(Object.hasOwn(node.props, 'defaultValue'), false, field);
      }
      assert.equal(browser.dataLayer.length, 0); assert.equal(harness.meta.length, 0);
    }
  });
}

test('explicit new submission after an acknowledged payload conflict rotates context before sending',async()=>{
  const calls=[];
  const harness=componentHarness({state:{status:'error',message:'Already received',retryConflict:true},actions:{
    '@/lib/actions/contact':{submitContactForm:async()=>{calls.push('submit');return {status:'success',message:'OK',eventId:'new-event',interest:'compra'};}},
    '@/lib/acquisition-browser':{attachLeadSubmission:()=>calls.push('attach'),finishLeadSubmission:()=>calls.push('finish')},
  }});
  const {ContactForm}=harness.load('ContactForm');harness.render(ContactForm);
  const result=await harness.runFormAction(new FormData());
  assert.equal(result.status,'success');assert.deepEqual(calls,['finish','attach','submit','finish']);
});

test('WhatsApp preserves href and shares one click ID with Meta/CAPI; global CTA clears context', () => {
  const requests = [];
  const harness = componentHarness({ fetch: async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return {}; } });
  const { TrackedLink } = harness.load('TrackedLink');
  const href = 'https://wa.me/520000000000?text=Hola';
  const first = harness.render(TrackedLink, { href, event: 'contacto_whatsapp', params: { ubicacion: 'ficha_propiedad', property_id: 'property-a', property_title: 'Ficha A' } });
  assert.equal(first.props.href, href); first.props.onClick();
  const second = harness.render(TrackedLink, { href, event: 'contacto_whatsapp', params: { ubicacion: 'fab' } });
  second.props.onClick();
  assert.equal(browser.dataLayer.length, 2); assert.equal(requests.length, 2);
  for (let i = 0; i < 2; i++) {
    assert.equal(browser.dataLayer[i].event_id, harness.meta[i][2]);
    assert.equal(browser.dataLayer[i].event_id, requests[i].body.eventId);
  }
  assert.notEqual(browser.dataLayer[0].event_id, browser.dataLayer[1].event_id);
  assert.equal(browser.dataLayer[1].property_id, null);
  assert.equal(requests[1].body.propertyId, undefined);
});

function visitHarness(requestVisit, formOverrides = {}) {
  const props = { propertyId: 'property-a', propertyTitle: 'Ficha A', operation: 'venta', price: 3500000, location: 'Prueba' };
  const harness = componentHarness({
    stateOverrides: { 0: false, 1: { full_name: 'Persona QA', phone: '+52 55 0000 0000', email: '', financing: 'por_definir', message: '', company: '', ...formOverrides } },
    actions: { '@/lib/actions/visits': { requestVisit } },
  });
  // Obtain the private modal from the real parent JSX, without exporting it for tests.
  const module = harness.load('VisitBooking');
  harness.slots[0] = true;
  const node = findNode(harness.render(module.VisitBooking, props), (item) => typeof item.type === 'function' && item.type.name === 'VisitRequestModal');
  harness.slots.length = 0;
  const tree = harness.render(node.type, node.props);
  const form = findNode(tree, (item) => item.type === 'form');
  assert.ok(form);
  return { ...harness, tree, submit: () => form.props.onSubmit({ preventDefault() {} }) };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('visit UI waits for success, blocks concurrent submit, and reuses the server ID once', async () => {
  let finish; let calls = 0;
  const harness = visitHarness((input) => {
    calls++;
    assert.equal(input.email, '');
    assert.equal(Object.hasOwn(input, 'preferred_date'), false);
    assert.equal(Object.hasOwn(input, 'preferred_time'), false);
    return new Promise((resolve) => { finish = resolve; });
  });
  assert.equal(findNode(harness.tree, (node) => node.type === 'input' && ['date', 'time'].includes(node.props.type)), undefined);
  const email = findNode(harness.tree, (node) => node.type === 'input' && node.props.type === 'email');
  assert.ok(email); assert.notEqual(email.props.required, true);
  harness.submit(); harness.submit();
  assert.equal(calls, 1); assert.equal(browser.dataLayer.length, 0);
  finish({ ok: true, eventId: 'visit-1' }); await flush();
  assert.equal(browser.dataLayer.length, 1); assert.equal(harness.meta.length, 1);
  const event = browser.dataLayer[0];
  assert.equal(event.event, 'solicitud_visita'); assert.equal(event.lead_type, 'visit');
  assert.equal(event.property_price, 3500000); assert.equal(event.value, null); assert.equal(event.financing, null);
  assert.equal(harness.meta[0][0], 'Lead'); assert.equal(harness.meta[0][2], 'visit-1');
  assert.equal(Object.hasOwn(harness.meta[0][1], 'value'), false);
  harness.submit(); finish({ ok: true, eventId: 'visit-1' }); await flush();
  assert.equal(browser.dataLayer.length, 1); assert.equal(harness.meta.length, 1);
});

test('simple visit form blocks invalid name, Mexican WhatsApp and optional email before the request', async () => {
  let calls = 0;
  for (const overrides of [{ full_name: 'A' }, { phone: '123' }, { email: 'invalid' }]) {
    const harness = visitHarness(async () => { calls++; return { ok: true, eventId: 'invalid-success' }; }, overrides);
    harness.submit(); await flush();
    assert.equal(browser.dataLayer.length, 0); assert.equal(harness.meta.length, 0);
  }
  assert.equal(calls, 0);
});

test('visit UI error, honeypot and network rejection emit no conversions', async () => {
  for (const result of [{ ok: false, error: 'Mock failure' }, { ok: true }, new Error('Mock network rejection')]) {
    const harness = visitHarness(async () => { if (result instanceof Error) throw result; return result; });
    harness.submit(); await flush();
    assert.equal(browser.dataLayer.length, 0); assert.equal(harness.meta.length, 0);
    assert.equal(harness.slots[3], false); // pending resets even on rejection
  }
});

test('current visit server accepts WhatsApp-only contact with null dates and shared Meta ID', async () => {
  const requests = []; const meta = [];
  const { requestVisit } = loadSource('lib/actions/visits.ts', {
    '@/lib/phone': phone,
    '@/lib/lead-persistence': { isLeadRetryConflict: () => false, persistWebLead: async (client, payload) => {
      const { error } = await client.rpc('submit_web_lead', { p_payload: payload });
      if (error) throw error;
      return { ok: true, created: true, eventId: 'visit-server-1', leadId: 'lead-1', interest: 'compra', propertyId: payload.property_id };
    } },
    '@/lib/supabase/public': {
      isSupabaseConfigured: () => true,
      createSupabasePublicClient: () => ({ rpc: async (name, params) => {
        requests.push({ name, params }); return { data: { ok: true }, error: null };
      } }),
    },
    '@/lib/meta-conversions': {
      createMetaEventId: () => 'visit-server-1',
      sendMetaServerEvent: async (event) => { meta.push(event); return { sent: true }; },
    },
  });
  const result = await requestVisit({ property_id: 'property-a', full_name: 'Persona QA', phone: '+52 55 0000 0000', financing: 'por_definir', message: '' });
  assert.equal(result.ok, true); assert.equal(result.eventId, 'visit-server-1');
  assert.equal(requests.length, 1); assert.equal(requests[0].name, 'submit_web_lead');
  assert.equal(requests[0].params.p_payload.phone, '+525500000000');
  for (const key of ['email', 'preferred_date', 'preferred_time']) assert.equal(requests[0].params.p_payload[key], null);
  assert.equal(meta[0].eventId, result.eventId); assert.equal(meta[0].email, undefined);
});

test('active WhatsApp preset follows its property and cleans up when leaving the ficha', () => {
  const requests = [];
  const context = { preset: null, setPreset(value) { context.preset = value; } };
  const harness = componentHarness({ fetch: async (_, options) => { requests.push(JSON.parse(options.body)); return {}; } });
  const { TrackedLink } = harness.load('TrackedLink');
  const preset = loadSource('components/site/WhatsAppPreset.tsx', {
    react: {
      createContext: () => ({}),
      useContext: () => context,
      useEffect: (effect) => { context.cleanup = effect(); },
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@/lib/constants': { whatsappLink: (message = '') => `https://wa.me/525500000000?text=${encodeURIComponent(message)}` },
    './TrackedLink': { TrackedLink },
  });
  preset.PropertyWhatsAppPreset({ message: 'Me interesa A', propertyId: 'property-a', propertyTitle: 'Ficha A' });
  let node = preset.WhatsAppCta({ fallbackMessage: 'Consulta general', ubicacion: 'fab' });
  assert.match(node.props.href, /Me%20interesa%20A/);
  harness.render(node.type, node.props).props.onClick();
  assert.equal(browser.dataLayer[0].property_id, 'property-a');
  context.cleanup();
  node = preset.WhatsAppCta({ fallbackMessage: 'Consulta general', ubicacion: 'fab' });
  assert.match(node.props.href, /Consulta%20general/);
  harness.render(node.type, node.props).props.onClick();
  assert.equal(browser.dataLayer[1].property_id, null);
  assert.equal(requests[1].propertyId, undefined);
});
