import assert from 'node:assert/strict';
import {hasLongUnsavedDraft} from '../schedule-entry-draft-guard.mjs';
assert.equal(hasLongUnsavedDraft('a'.repeat(100)),false);
assert.equal(hasLongUnsavedDraft('a'.repeat(101)),true);
assert.equal(hasLongUnsavedDraft('文'.repeat(101)),true);
assert.equal(hasLongUnsavedDraft('🙂'.repeat(60)),false);
assert.equal(hasLongUnsavedDraft('a'.repeat(101),'a'.repeat(101)),false);
console.log('Long draft guard: threshold, Chinese, Unicode and unchanged content passed.');
