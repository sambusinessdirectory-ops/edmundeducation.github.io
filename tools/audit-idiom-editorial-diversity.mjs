import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lessonId = process.argv[2] || 'idiom-31';
if (!/^idiom-\d{2,3}$/.test(lessonId)) throw new Error(`Invalid lesson ID ${lessonId}`);
const directory = path.join(root, 'content', 'idiom-compass-editorial-31-108');
const sourceOrder = lessonId.slice(6).padStart(3, '0');
const sourceFile = fs.readdirSync(path.join(root, 'tools', 'idiom-lessons'))
  .find((name) => name.startsWith(`lesson-${sourceOrder}-`) && name.endsWith('.json'));
if (!sourceFile) throw new Error(`No source for ${lessonId}`);
const source = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'idiom-lessons', sourceFile), 'utf8')).lesson;
const guide = JSON.parse(fs.readFileSync(path.join(directory, `${lessonId}.json`), 'utf8'));
const metadataPath = path.join(directory, `${lessonId}-item-metadata.json`);
const metadata = fs.existsSync(metadataPath)
  ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')).items || {}
  : {};
const originals = new Map(source.questions.map((question) => [question.id, question]));
const extensions = new Map(guide.bonusBlueprint.map((row, index) => [
  `${lessonId}-q${String(index + 51).padStart(2, '0')}`,
  { answer: row[3], prompt: row[1], theme: row[0] }
]));
const drafts = new Map();
for (const name of fs.readdirSync(directory).filter((name) => name.startsWith(`${lessonId}-practice-`) && name.endsWith('.json'))) {
  const file = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
  for (const [id, item] of Object.entries(file.items)) {
    if (drafts.has(id)) throw new Error(`Duplicate item ${id}`);
    drafts.set(id, item);
  }
}
const tally = (values) => Object.fromEntries([...values.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map())]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
const words = (value) => String(value).trim().split(/\s+/).filter(Boolean);
const frame = (answer) => {
  const first = answer.toLowerCase();
  if (/^(if|unless)\b/.test(first)) return 'conditional-leading';
  if (/^(although|even though)\b/.test(first)) return 'concession-leading';
  if (/^(because|rather than)\b/.test(first)) return 'reason-or-purpose-leading';
  if (/^(while|whenever|since|after|before|at first)\b/.test(first)) return 'time-leading';
  if (/\b(if|unless)\b/.test(first)) return 'conditional-later';
  if (/\b(because|so|rather than)\b/.test(first)) return 'reason-or-purpose-later';
  if (/\b(but|although|even though)\b/.test(first)) return 'contrast-later';
  if (/\b(when|whenever|since|after|before)\b/.test(first)) return 'time-later';
  return 'single-main-clause';
};
const aspect = (answer) => {
  const text = answer.toLowerCase();
  if (/\b(used to|do not .*any more)\b/.test(text)) return 'past-habit-or-cessation';
  if (/\b(will|would|may|might)\b/.test(text)) return 'modal-or-future';
  if (/\b(have been|has been|had been)\b/.test(text)) return 'perfect-progressive';
  if (/\b(have|has|had) fought\b/.test(text)) return 'perfect';
  if (/\b(fought|were fighting|was fighting|kept fighting|began fighting)\b/.test(text)) return 'past';
  return 'present-or-other';
};
const rows = [...originals.keys(), ...extensions.keys()].map((id) => {
  const item = drafts.get(id);
  const truth = originals.get(id) || extensions.get(id);
  const tags = metadata[id] || {};
  if (!item || !truth) throw new Error(`Missing draft or source for ${id}`);
  const optionLengths = [truth.answer, ...item.foils.map((foil) => foil.text)].map((line) => words(line).length).sort((a, b) => a - b);
  const median = (optionLengths[1] + optionLengths[2]) / 2;
  return {
    id,
    sourceType: originals.has(id) ? 'original' : 'extension',
    theme: tags.theme || truth.theme || null,
    actorRole: tags.actorRole || null,
    relationship: tags.relationship || null,
    useFunction: tags.useFunction || null,
    frame: frame(truth.answer),
    aspect: aspect(truth.answer),
    lead: words(truth.answer).slice(0, 3).join(' ').toLowerCase(),
    foilKinds: item.foils.map((foil) => foil.kind),
    optionLengths,
    longestToMedian: Number((optionLengths[3] / median).toFixed(2)),
    shortestToMedian: Number((optionLengths[0] / median).toFixed(2))
  };
});
const consecutiveSameFrame = [];
for (let index = 2; index < rows.length; index++) {
  if (rows[index].frame === rows[index - 1].frame && rows[index].frame === rows[index - 2].frame) {
    consecutiveSameFrame.push(rows.slice(index - 2, index + 1).map((row) => row.id));
  }
}
const result = {
  lessonId,
  itemCount: rows.length,
  originalCount: originals.size,
  extensionCount: extensions.size,
  originalThemeTagged: rows.filter((row) => row.sourceType === 'original' && row.theme).length,
  originalIdsMissingMetadata: rows.filter((row) => row.sourceType === 'original' && (!row.theme || !row.actorRole || !row.relationship || !row.useFunction)).map((row) => row.id),
  extensionThemes: [...new Set(rows.filter((row) => row.sourceType === 'extension').map((row) => row.theme))],
  distinctActorRolesTagged: new Set(rows.map((row) => row.actorRole).filter(Boolean)).size,
  distinctUseFunctionsTagged: new Set(rows.map((row) => row.useFunction).filter(Boolean)).size,
  frames: tally(rows.map((row) => row.frame)),
  aspects: tally(rows.map((row) => row.aspect)),
  foilKinds: tally(rows.flatMap((row) => row.foilKinds)),
  repeatedThreeWordLeads: Object.fromEntries(Object.entries(tally(rows.map((row) => row.lead))).filter(([, count]) => count >= 3)),
  consecutiveSameFrame,
  lengthOutliers: rows.filter((row) => row.longestToMedian > 1.3 || row.shortestToMedian < 0.7).map((row) => ({ id: row.id, lengths: row.optionLengths })),
  limits: 'These are structural/lexical signals, not semantic-diversity or 12-axis editorial approval.'
};
console.log(JSON.stringify(result, null, 2));
