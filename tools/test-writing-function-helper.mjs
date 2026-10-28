import test from 'node:test';
import assert from 'node:assert/strict';
import { WRITING_FUNCTIONS, composeFunctionAnswer, normalizeFunctionHelper } from '../writing-function-helper.mjs';

test('all supplied sentence functions are available in source order', () => {
  assert.equal(WRITING_FUNCTIONS.length, 35);
  assert.equal(WRITING_FUNCTIONS[0].id, 'intro-background');
  assert.equal(WRITING_FUNCTIONS.at(-1).id, 'conclusion-closing');
  assert.equal(new Set(WRITING_FUNCTIONS.map(item => item.id)).size, 35);
});

test('turning off a function excludes it from the essay without discarding its text', () => {
  const helper = normalizeFunctionHelper({
    active: true,
    enabled: ['intro-stance', 'body1-topic'],
    unassigned: 'Opening paragraph.',
    values: { 'intro-stance': 'I support the plan.', 'body1-topic': 'It saves time.' }
  });
  assert.equal(composeFunctionAnswer(helper), 'Opening paragraph.\n\nI support the plan.\n\nIt saves time.');
  helper.enabled = ['body1-topic'];
  assert.equal(composeFunctionAnswer(helper), 'Opening paragraph.\n\nIt saves time.');
  assert.equal(helper.values['intro-stance'], 'I support the plan.');
});
