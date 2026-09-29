import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const layouts = JSON.parse(readFileSync(join(root, 'dse-reading-page-layout.json'), 'utf8'));
const catalogue = JSON.parse(readFileSync(join(root, 'dse-reading-catalogue.json'), 'utf8'));
const ids = catalogue.years.flatMap((year) => Object.values(year.sections).filter(Boolean).map((entry) => entry.id));
const failures = [];

for (const id of ids) {
  const data = JSON.parse(readFileSync(join(root, 'dse-reading-data', `${id}.json`), 'utf8'));
  const layout = layouts[id];
  if (!layout) { failures.push(`${id}: missing page layout`); continue; }
  for (const [kind, itemKey, numberKey] of [['passagePages', 'paragraphs', 'paragraphs'], ['questionPages', 'questions', 'questions']]) {
    const pages = layout[kind];
    if (!Array.isArray(pages) || !pages.length) { failures.push(`${id}: missing ${kind}`); continue; }
    const numbers = pages.flatMap((page) => page[itemKey].map(Number));
    const expected = data[numberKey].map((item) => Number(item.number));
    if (JSON.stringify(numbers) !== JSON.stringify(expected)) failures.push(`${id}: ${kind} content is missing, duplicated or out of order`);
    if (new Set(pages.map((page) => page.sourcePage)).size !== pages.length) failures.push(`${id}: duplicate ${kind} source page`);
    for (const [index, page] of pages.entries()) {
      if (!page[itemKey].length && !page.cover) failures.push(`${id}: empty ${kind} page ${index + 1}`);
      if (page.layout && !['two-column', 'slide-grid'].includes(page.layout)) failures.push(`${id}: unknown ${kind} layout on page ${index + 1}`);
    }
  }
}
if (JSON.stringify(layouts['dse-2017-b1']?.passagePages[0]?.paragraphs) !== JSON.stringify([1, 2, 3, 4, 5, 6])) failures.push('dse-2017-b1: slide grid includes material from the next source page');
if (Object.keys(layouts).length !== ids.length) failures.push(`layout has ${Object.keys(layouts).length} papers; catalogue has ${ids.length}`);
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${ids.length} papers, each paragraph and question once in source-page order.`);
