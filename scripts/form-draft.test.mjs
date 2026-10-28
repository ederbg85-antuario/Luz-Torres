import test from 'node:test';
import assert from 'node:assert/strict';
import { preserveFormDraft } from '../src/lib/form-draft.ts';

test('native reset retains a draft while attached and cleanup restores normal reset', () => {
  // Model the platform's cancelable reset contract, independently of React's
  // delegated events, which are disabled during its form-reset commit.
  class Form extends EventTarget {
    selection = 'renta';
    reset() {
      if (this.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))) {
        this.selection = 'compra';
      }
    }
  }
  const form = new Form();
  const detach = preserveFormDraft(form);
  form.reset();
  assert.equal(form.selection, 'renta');
  detach();
  form.reset();
  assert.equal(form.selection, 'compra');
});
