// Export the second mass-import batch in PDF sentence order for the three
// established local Kokoro voices. These assignments are stable across shuffles.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.argv[2] || '/private/tmp/polysemy-batch2-audio';
const batches = Number(process.argv[3] || 8);
if (!Number.isInteger(batches) || batches < 1 || batches > 16) throw Error('Use 1–16 batches');
const report = JSON.parse(fs.readFileSync(path.join(root, 'polysemy-lab/import-report-2.json')));
const cycle = ['american-female', 'british-female', 'british-male'];
const rows = [];
for (const source of report.imported) {
  const module = (await import(`../polysemy-lab/content/${encodeURIComponent(source.word)}.mjs`)).default;
  if (module.number !== source.number || module.questions.length !== source.questions) {
    throw Error(`Import report mismatch: ${source.number} ${source.word}`);
  }
  for (const question of module.questions) {
    if (!Number.isInteger(question.sentenceIndex) || !question.en) {
      throw Error(`Missing source sentence: ${question.id}`);
    }
    rows.push({
      id: question.id,
      en: question.en,
      index: question.sentenceIndex,
      voice: cycle[question.sentenceIndex % cycle.length],
      module: module.id,
      number: module.number,
    });
  }
}
if (rows.length !== 23329 || new Set(rows.map(row => row.id)).size !== rows.length) {
  throw Error(`Unexpected question count or duplicate ID: ${rows.length}`);
}
fs.mkdirSync(output, {recursive: true});
for (let batch = 0; batch < batches; batch++) {
  const part = rows.filter(row => row.number % batches === batch);
  fs.writeFileSync(path.join(output, `local-${batch}.json`), JSON.stringify(part) + '\n');
}
fs.writeFileSync(path.join(output, 'all.json'), JSON.stringify(rows) + '\n');
console.log(JSON.stringify({questions: rows.length, modules: report.imported.length,
  voices: Object.fromEntries(cycle.map(voice => [voice, rows.filter(row => row.voice === voice).length]))}));
