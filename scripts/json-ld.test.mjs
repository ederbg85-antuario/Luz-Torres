import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeJsonLd } from '../src/lib/json-ld.ts';

test('JSON-LD keeps public text intact while preventing a script-closing payload', () => {
  const listing = { name: '</script><script>alert("x")</script>', description: 'Casa < 100 m² & jardín' };
  const serialized = serializeJsonLd(listing);
  assert.equal(serialized.includes('<'), false);
  assert.deepEqual(JSON.parse(serialized), listing);
});
