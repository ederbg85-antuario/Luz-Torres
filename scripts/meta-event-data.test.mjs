import test from 'node:test';
import assert from 'node:assert/strict';
import { hashMetaValue, normalizeMetaPhone, metaSourceUrl, metaClickId } from '../src/lib/meta-event-data.ts';

test('normaliza números mexicanos antes de hashing', () => {
  assert.equal(normalizeMetaPhone('56 5669 9894'), '525656699894');
  assert.equal(normalizeMetaPhone('+52 1 56 5669 9894'), '525656699894');
  assert.equal(normalizeMetaPhone('+52 56 5669 9894'), '525656699894');
  assert.equal(hashMetaValue('test@example.com').length, 64);
});
test('la URL del evento excluye datos privados y páginas ajenas', () => {
  assert.equal(metaSourceUrl('https://luztorres.com/contacto?email=test@example.com#x', 'https://luztorres.com'), 'https://luztorres.com/contacto');
  assert.equal(metaSourceUrl('https://dashboard.luztorres.com/admin/crm', 'https://luztorres.com'), 'https://luztorres.com');
  assert.equal(metaSourceUrl('https://other.example/form', 'https://luztorres.com'), 'https://luztorres.com');
});
test('no inventa identificadores publicitarios y conserva el clic original', () => {
  assert.equal(metaClickId('fb.1.1780000000000.originalclick', null), 'fb.1.1780000000000.originalclick');
  assert.equal(metaClickId(undefined, 'https://luztorres.com'), undefined);
  assert.match(metaClickId(undefined, 'https://luztorres.com?fbclid=real_click_12345'), /^fb\.1\.\d+\.real_click_12345$/);
});
