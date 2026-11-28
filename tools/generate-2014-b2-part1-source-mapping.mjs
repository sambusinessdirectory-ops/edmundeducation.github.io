import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRelative = 'paper3/2014-b2/super-curation-data.js';
const dataPath = path.join(root, dataRelative);
const outputPath = path.join(root, 'docs/paper3/2014_B2_PART1_SOURCE_MAPPING.md');
const source = fs.readFileSync(dataPath, 'utf8');
const sandbox = {window: {}};
vm.runInNewContext(source, sandbox, {filename: dataPath});
const lesson = sandbox.window.EDMUND_2014_B2_CURATION;
const lines = source.split('\n');
const primaryCount = Array.from(lesson.steps).filter(step => !step.sourceJump && !step.routeReturn && !step.final).length;
const visitCount = Array.from(lesson.steps).filter(step => step.sourceJump).length;
const returnCount = Array.from(lesson.steps).filter(step => step.routeReturn).length;

const escapeCell = value => String(value ?? '')
  .replace(/\|/g, '\\|')
  .replace(/\r?\n/g, ' ')
  .trim();
const lineFor = id => lines.findIndex(line => line.includes(`id: '${id}'`)) + 1;
const roleFor = step => step.final ? 'Stage completion' : step.sourceJump ? 'Source visit' : step.routeReturn ? 'Source return' : 'Primary source unit';

const rows = Array.from(lesson.steps, (step, index) => {
  const phrase = step.phrase || step.quote;
  return `| ${index + 1} | \`${escapeCell(step.id)}\` | ${escapeCell(roleFor(step))} | ${escapeCell(step.sourcePage)} | ${escapeCell(phrase)} | \`${dataRelative}:${lineFor(step.id)}\` |`;
});

const document = `# 2014 B2 Super Curation Part 1 source mapping

Generated from \`${dataRelative}\`. Part 1 contains **${lesson.steps.length} learner steps**: ${primaryCount} primary source units, ${visitCount} source visits, ${returnCount} source returns and 1 terminal completion step. Source visits and returns are interaction transactions; they do not duplicate the primary source-inventory count.

Only the Situation on Data File page 2, Kerry Lam's instruction email on Data File page 4, and the headings needed to verify explicit routes on pages 3, 7 and 9 are taught in this stage. No evidence from the routed documents is revealed.

| # | Stable step ID | Role | 2014 source page | Exact source phrase / focus | Implementation location |
| ---: | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Shared runtime locations

- Compatibility loader for the legacy Stage 1 entry: \`paper3/2014-b2/super-curation.js\`.
- Integrated Stage 1–2 reveal, migration, saved-state restore, backward-navigation rewind and debug API: \`paper3/2014-b2/super-curation-v2.js\`.
- Wide desktop dock, five-stage rail, task colours, spotlight masks, route overlay and reduced-motion rules: \`paper3/2014-b2/super-curation.css\`.
- Native reconstructed source documents and script/style load order: \`paper3/2014-b2/index.html\`.

## Scope boundary

Stage 2 Data Categorization is now available through the integrated controller. Stage 3 Podcast, Stage 4 Data File reading and Stage 5 Writing remain disabled. Part 1 route steps still confirm only a document title and return to Kerry's instruction; they intentionally do not display source evidence.
`;

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, document, 'utf8');
console.log(path.relative(root, outputPath));
