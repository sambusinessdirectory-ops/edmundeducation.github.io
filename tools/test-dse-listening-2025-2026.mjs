import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { questionNumbers } from '../dse-listening-question-ui.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('listening-system.html');
const app = read('listening-system.js');
const catalogue = read('listening-system-catalog.js');
for (const year of [2025, 2026]) {
  const context = {window:{}};
  vm.runInNewContext(read(`dse-listening-${year}-transcript.js`), context);
  vm.runInNewContext(read(`dse-listening-${year}-data.js`), context);
  const paper = context.window[`EDMUND_DSE_LISTENING_${year}`];
  assert.equal(paper.year, year);
  assert.equal(paper.questionCount, 53);
  assert.equal(paper.tasks.length, 4);
  assert.equal(paper.tasks.reduce((sum, task) => sum + task.marks, 0), 53);
  assert.deepEqual(Array.from(paper.tasks).flatMap(questionNumbers), Array.from({length:53},(_,index)=>index+1));
  assert.match(html,new RegExp(`dse-listening-${year}-transcript\\.js[^]*dse-listening-${year}-data\\.js`));
  assert.match(app,new RegExp(`\\[${year}, window\\.EDMUND_DSE_LISTENING_${year}`));
  assert.match(catalogue,new RegExp(`2024, 2025, 2026\\]\\.includes\\(year\\)`));
  for (const task of paper.tasks) {
    assert.ok(task.titleZh && task.instructionZh, `${year} Task ${task.number} Chinese heading/instructions`);
    assert.ok(task.blocks.every(block => typeof block.translation === 'string' && block.translation.trim()), `${year} Task ${task.number} per-block translations`);
    const transcript = paper.transcript.partA[task.number];
    assert.ok(transcript.length >= 40, `${year} Task ${task.number} transcript is too short`);
    assert.ok(transcript.every((row, index) => row.text && Number.isFinite(row.start) && row.end > row.start && (!index || row.start >= transcript[index-1].start)), `${year} Task ${task.number} transcript timing`);
    for (const block of task.blocks) {
      for (const match of String(block.html || '').matchAll(/src="(assets\/listening\/[^\"]+)"/g)) {
        assert.ok(fs.existsSync(path.join(root,match[1])),`${year} missing figure ${match[1]}`);
      }
    }
  }
}
console.log('2025 and 2026 DSE Listening: eight tasks, 106 numbered answers, per-block Traditional Chinese translations, timed source transcripts and native figures validated.');
