import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildWritingSpeakingTopics } from './build-writing-speaking-topics.mjs';
import {
  SPEAKING_TOPIC_CATEGORIES,
  speakingTopicLabel,
  speakingTopicPrompt,
  speakingTopicSearchHaystack
} from '../writing-speaking-topics.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const published = JSON.parse(fs.readFileSync(path.join(root, 'writing-speaking-topics.json'), 'utf8'));

test('published speaking catalog contains every canonical DSE and IELTS question', () => {
  const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(fingerprint(published), fingerprint(buildWritingSpeakingTopics()));
  const counts = Object.fromEntries(SPEAKING_TOPIC_CATEGORIES.map(category => [
    category.id,
    published.questions.filter(item => item.category === category.id).length
  ]));
  assert.deepEqual(counts, {
    'dse-group': 846,
    'dse-individual': 2256,
    'ielts-1': 828,
    'ielts-2': 153,
    'ielts-3': 564
  });
  assert.equal(new Set(published.questions.map(item => item.id)).size, published.questions.length);
});

test('DSE source context and IELTS Part 2 cue points survive writing prompt selection', () => {
  const dse = published.questions.find(item => item.category === 'dse-group');
  const dsePrompt = speakingTopicPrompt(dse, published.contexts);
  assert.match(dsePrompt, /Source material:/);
  assert.ok(dsePrompt.includes(published.contexts[dse.contextId]));
  assert.ok(dsePrompt.includes(dse.question));
  assert.match(speakingTopicLabel(dse), /DSE 小組討論/);

  const part2 = published.questions.find(item => item.category === 'ielts-2');
  const part2Prompt = speakingTopicPrompt(part2, published.contexts);
  assert.ok(part2Prompt.includes(part2.question));
  assert.ok(part2Prompt.includes(part2.hints[0]));
  assert.match(speakingTopicSearchHaystack(part2), /ielts speaking part 2/);
});

test('search index covers Chinese and English question wording and DSE source context', () => {
  const part1 = published.questions.find(item => item.category === 'ielts-1');
  const part1Search = speakingTopicSearchHaystack(part1, published.contexts);
  assert.ok(part1Search.includes('accommodation'));
  assert.ok(part1Search.includes('住所'));
  const dse = published.questions.find(item => item.category === 'dse-individual');
  const dseSearch = speakingTopicSearchHaystack(dse, published.contexts);
  assert.ok(dseSearch.includes('internship'));
  assert.ok(dseSearch.includes('individual response'));
});
