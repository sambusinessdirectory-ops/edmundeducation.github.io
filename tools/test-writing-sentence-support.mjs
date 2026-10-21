import assert from 'node:assert/strict';
import test from 'node:test';
import { exampleHtml } from '../writing-sentence-support.mjs';

test('example sentences distinguish fixed wording from bracketed substitutions', () => {
  const first = exampleHtml(
    'I completely disagree that [前述情況] should lead us back towards [舊做法].',
    'I completely disagree that this should lead us back towards traditional medicine.'
  );
  assert.match(first, /writing-structure-match">I completely disagree that<\/mark> <mark class="writing-structure-variable">this<\/mark>/);
  assert.match(first, /writing-structure-match">should lead us back towards<\/mark> <mark class="writing-structure-variable">traditional medicine<\/mark>\./);

  const second = exampleHtml(
    'I do not think [籠統說法] is true, even when [看似可信的條件]',
    'I do not think all news is true, even when it is produced by established media organisations.'
  );
  assert.match(second, /writing-structure-variable">all news<\/mark>/);
  assert.match(second, /writing-structure-variable">it is produced by established media organisations<\/mark>\./);
});

test('unmatched wording remains escaped without guessed substitutions', () => {
  assert.equal(exampleHtml('Unrelated [內容]', '<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});
