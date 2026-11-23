import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '../..');
const dataPath = path.join(root, 'paper3/2013-b2/super-curation-podcast-data.js');
const transcriptPath = path.join(root, 'dse-listening-2013-transcript.js');
const controllerPath = path.join(root, 'paper3/2013-b2/super-curation.js');
const indexPath = path.join(root, 'paper3/2013-b2/index.html');
const docsDir = path.join(root, 'docs/paper3');

const context = {window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(dataPath, 'utf8'), context, {filename:dataPath});
vm.runInContext(fs.readFileSync(transcriptPath, 'utf8'), context, {filename:transcriptPath});
const model = context.window.EDMUND_2013_B2_PODCAST;
const partB = context.window.EDMUND_DSE_LISTENING_2013_TRANSCRIPT.partB;
const rows = partB.map((row, sourceIndex) => ({...row, sourceIndex}))
  .filter(row => row.sourceIndex >= model.transcript.startIndex && row.sourceIndex <= model.transcript.endIndex);
const controller = fs.readFileSync(controllerPath, 'utf8').split('\n');
const data = fs.readFileSync(dataPath, 'utf8').split('\n');
const index = fs.readFileSync(indexPath, 'utf8').split('\n');
const cueByTranscriptIndex = new Map();
for (const cue of model.cues) for (const sourceIndex of cue.transcriptIndices || []) cueByTranscriptIndex.set(sourceIndex, cue);
const pointIndices = new Set(model.transcript.pointIndices || []);

const canonical = value => String(value).normalize('NFKC').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-');
const slug = value => canonical(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 7).join('-') || 'utterance';
const lineOf = (lines, fragment) => Math.max(1, lines.findIndex(line => line.includes(fragment)) + 1);
const esc = value => String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const stamp = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}.${String(Math.round((value % 1) * 100)).padStart(2, '0')}`;
const bounded = value => stamp(Math.max(0, value - model.audio.segmentStart));

const cueRows = model.cues.map(cue => ({
  id:`podcast-cue-${cue.id}`,
  type:'guided cue',
  cueId:cue.id,
  audio:`${bounded(cue.replayStart)}-${bounded(cue.endpoint)} (source ${stamp(cue.replayStart)}-${stamp(cue.endpoint)})`,
  quote:cue.quote,
  translation:'—',
  classification:'guided cue',
  field:cue.destination ? model.noteFields[cue.destination]?.label || cue.destination : 'No note entry (programme close)',
  target:(cue.transcriptIndices || []).map(index => `partB[${index}]`).join(', '),
  implementation:`paper3/2013-b2/super-curation-podcast-data.js:${lineOf(data, `cue('${cue.id}'`)}; paper3/2013-b2/super-curation.js:${lineOf(controller, 'for (const item of podcastModel.cues) podcastSteps.push')}`
}));

const reviewRows = rows.map(row => {
  const cue = cueByTranscriptIndex.get(row.sourceIndex);
  return {
    id:`podcast-review-${Math.round(row.start * 100)}-${slug(row.text)}`,
    type:'transcript review',
    cueId:cue?.id || 'context / distractor / transition',
    audio:`${bounded(row.start)}-${bounded(row.end)} (source ${stamp(row.start)}-${stamp(row.end)})`,
    quote:row.text,
    translation:model.transcript.translations[row.sourceIndex],
    classification:pointIndices.has(row.sourceIndex) && !cue?.rejected ? 'usable point' : 'non-point — red strike after endpoint',
    field:cue?.destination ? model.noteFields[cue.destination]?.label || cue.destination : 'No generated note',
    target:`partB[${row.sourceIndex}]`,
    implementation:`dse-listening-2013-transcript.js:1 (partB[${row.sourceIndex}]); paper3/2013-b2/super-curation-podcast-data.js:${lineOf(data, `${row.sourceIndex}:'`)}; paper3/2013-b2/super-curation.js:${lineOf(controller, 'for (const row of transcriptRows)')}`
  };
});

const mapping = [
  {
    id:'podcast-orientation-travel-report', type:'orientation', cueId:'—', audio:'0:00.00 segment entry (source 6:28.20)',
    quote:'Travel Report · 2013 Part B recording', translation:'—', classification:'orientation', field:'All five fields on Data File page 3', target:'Note-sheet heading',
    implementation:`paper3/2013-b2/super-curation.js:${lineOf(controller, "id:'podcast-orientation-travel-report'")}; paper3/2013-b2/index.html:${lineOf(index, 'id="doc-2013-travel-report-notes"')}`
  },
  ...cueRows,
  {
    id:'podcast-transcript-review-intro', type:'review orientation', cueId:'—', audio:'Recording complete at 9:51.82',
    quote:'Recording complete · transcript review', translation:'—', classification:'review orientation', field:'No generated note', target:'All partB[18]-partB[171]',
    implementation:`paper3/2013-b2/super-curation.js:${lineOf(controller, "id:'podcast-transcript-review-intro'")}`
  },
  ...reviewRows,
  {
    id:'podcast-stage-complete', type:'completion', cueId:'—', audio:'Recording complete at 9:51.82',
    quote:'Travel Report recording and transcript review complete', translation:'—', classification:'completion', field:'Final note-sheet verification', target:'Data File page 3 heading',
    implementation:`paper3/2013-b2/super-curation.js:${lineOf(controller, "id:'podcast-stage-complete'")}`
  }
];

if (mapping.length !== 185) throw new Error(`Expected 185 Stage 3 steps, got ${mapping.length}`);
if (new Set(mapping.map(row => row.id)).size !== mapping.length) throw new Error('Duplicate Stage 3 mapping IDs');

const mappingDoc = `# 2013 B2 Stage 3 source mapping

Generated from the implemented 2013 podcast model and the supplied timed 2013 Part B transcript. This maps every one of the **${mapping.length}** Stage 3 steps; it does not contain Stage 4 Data File extraction or Stage 5 writing content.

Audio display time is bounded to the taught segment beginning at source **${stamp(model.audio.segmentStart)}**. All source material is on the 2013 Data File note sheet, page 3. Transcript targets are stable source-array indices because the supplied aligned transcript has no independent sentence IDs.

| Step ID | Type | Cue ID | Audio display / source time | Exact quotation | Traditional Chinese teaching translation | Point decision | Note-sheet field | Transcript target | Implementation location |
|---|---|---|---|---|---|---|---|---|---|
${mapping.map(row => `| ${esc(row.id)} | ${esc(row.type)} | ${esc(row.cueId)} | ${esc(row.audio)} | ${esc(row.quote)} | ${esc(row.translation)} | ${esc(row.classification)} | ${esc(row.field)} | ${esc(row.target)} | ${esc(row.implementation)} |`).join('\n')}
`;

const noteFieldRows = Object.entries(model.noteFields).map(([id, field]) => {
  const cueIds = model.cues.filter(cue => cue.destination === id).map(cue => cue.id).join(', ') || 'verification only';
  return `| ${esc(id)} | ${esc(field.label)} | ${esc(field.learner || field.learners?.join(', ') || 'preprinted value')} | ${esc(field.generated)} | ${esc(cueIds)} |`;
}).join('\n');

const ledgerDoc = `# 2013 B2 Stage 3 cue ledger

## Recording provenance

- Authoritative title: **${model.audio.sourceTitle}**
- URL: ${model.audio.url}
- Catalogue: ${model.audio.catalogue}
- Full recording duration: **${model.audio.sourceDuration.toFixed(6)} seconds**
- Taught segment: source **${stamp(model.audio.segmentStart)}-${stamp(model.audio.segmentEnd)}**; display **0:00.00-${stamp(model.audio.segmentDuration)}** (${model.audio.segmentDuration.toFixed(2)} seconds)
- Format: ${model.audio.format}
- SHA-256: \`${model.audio.sourceSha256}\`
- Transcript: ${model.transcript.provenance}; 154 aligned English rows, partB[18]-partB[171]
- Traditional Chinese teaching layer: **154 complete Hong Kong Traditional Chinese rows**, keyed one-to-one to the supplied English alignment. It is clearly presented as a translation and never replaces the source English.
- Point decisions: ${pointIndices.size} usable-point rows and ${rows.length - pointIndices.size} non-point rows. A non-point receives a red strike only after its endpoint is crossed; rewind removes the strike.
- Timing method: ${model.cues[0].timestampMethod}. Every cue is marked high-confidence and was exercised against the actual MP3 at 0.75x, 1x, 1.25x, 1.5x and 2x.

## Note-sheet fields

The original page-3 structure is preserved. Generated notes render beside the editable learner fields and never overwrite learner text.

| Field ID | Original field | Learner control | Generated output | Cue IDs |
|---|---|---|---|---|
${noteFieldRows}

## Complete 28-cue ledger

| # | Stable cue ID | Playback start | Answer / replay start | Endpoint | Speaker | Exact distinguishing quotation | Field | Note content | Task | Decision / correction | Transcript target | Confidence / method |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
${model.cues.map(cue => `| ${cue.number} | ${esc(cue.id)} | ${bounded(cue.playbackStart)} / ${stamp(cue.playbackStart)} source | ${bounded(cue.sourceStart)} / ${stamp(cue.replayStart)} source | ${bounded(cue.endpoint)} / ${stamp(cue.endpoint)} source | ${esc(cue.speaker)} | ${esc(cue.quote)} | ${esc(cue.destination ? model.noteFields[cue.destination]?.label || cue.destination : 'No note entry')} | ${esc(cue.writes?.join('; ') || 'No generated note')} | ${esc(cue.task || 'listening only')} | ${esc(`${cue.decision}: ${cue.finalDecision}${cue.corrects ? `; rejects/corrects “${cue.corrects}”` : ''}`)} | ${esc((cue.transcriptIndices || []).map(index => `partB[${index}]`).join(', '))} | ${cue.timestampConfidence}; ${esc(cue.timestampMethod)} |`).join('\n')}

## Corrections, qualifications and rejected information

| Cue ID | Type | Earlier / risky interpretation | Final taught decision |
|---|---|---|---|
${model.cues.filter(cue => cue.rejected || cue.corrects || ['correction','qualification','personal-opinion','task-c-rejected'].includes(cue.decision)).map(cue => `| ${esc(cue.id)} | ${esc(cue.decision)} | ${esc(cue.corrects || cue.quote)} | ${esc(cue.finalDecision)} |`).join('\n')}

## Boundaries and limitations

- The source alignment identifies most programme speech only as “Travel Report guests”. Named speakers are assigned only where the 2013 paper/fact-line evidence explicitly identifies the turn; unresolved context rows remain labelled as unresolved rather than guessed.
- The first two “Why people travel” cues and the statistics/hotel cues complete the authentic listening sheet but are not forced into Task A, B or C evidence.
- Task A cues are confined to the historic-travel content. Task C cues distinguish negative context, safety qualification and positive effects. There is no Task B podcast evidence in this 2013 note sheet.
- Cue 28 reaches the true recording close, including the delayed final “Thank you”; it generates no note.
`;

fs.mkdirSync(docsDir, {recursive:true});
fs.writeFileSync(path.join(docsDir, '2013_B2_STAGE3_SOURCE_MAPPING.md'), mappingDoc);
fs.writeFileSync(path.join(docsDir, '2013_B2_STAGE3_CUE_LEDGER.md'), ledgerDoc);
console.log(JSON.stringify({steps:mapping.length, cues:model.cues.length, reviewRows:reviewRows.length}, null, 2));
