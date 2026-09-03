import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expected = new Map([[2012,53],[2013,58],[2014,60],[2015,58],[2017,54],[2018,51],[2019,53],[2020,52]]);

for (const [year, questionCount] of expected) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, `dse-listening-${year}-transcript.js`), "utf8"), context);
  vm.runInNewContext(fs.readFileSync(path.join(root, `dse-listening-${year}-data.js`), "utf8"), context);
  const data = context.window[`EDMUND_DSE_LISTENING_${year}`];
  assert.equal(data.year, year);
  assert.equal(data.questionCount, questionCount);
  assert.equal(data.tasks.length, 4);
  assert.equal(data.tasks.reduce((sum, task) => sum + task.marks, 0), questionCount);
  const placeholders = data.tasks.flatMap(task => task.blocks.flatMap(block => [
    ...[...String(block.html || "").matchAll(/\{\{(\d+)\}\}/g)].map(match => Number(match[1])),
    ...(Number.isInteger(block.number) ? [block.number] : [])
  ]));
  assert.deepEqual(Array.from(placeholders).sort((a,b)=>a-b), Array.from({length:questionCount},(_,i)=>i+1));
  for (const task of data.tasks) {
    const rows = data.transcript.partA[String(task.number)];
    assert.ok(Array.isArray(rows) && rows.length > 0, `${year} Task ${task.number} transcript missing`);
    assert.ok(rows.every((row,index) => Number.isFinite(row.start) && row.end > row.start && (!index || row.start >= rows[index-1].start)), `${year} Task ${task.number} transcript timings invalid`);
  }
  assert.ok(Array.isArray(data.transcript.partB) && data.transcript.partB.length > 0, `${year} Part B transcript missing`);
}

console.log("2012-2015 and 2017-2020 DSE listening archive validated: 439 question fields, 32 Part A task transcripts and eight Part B transcripts.");
