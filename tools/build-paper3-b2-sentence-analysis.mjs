import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('dse-paper3-analysis-data.js','utf8'), context);
const source = context.window.EDMUND_DSE_PAPER3_DATA;
const resource = source.resources['2025-b2'];
const records = [];
for (const section of resource.analysisSections) {
  if (['podcast','final-integration'].includes(section.id)) continue;
  let current;
  const blocks = section.pages.flatMap(page=>page.blocks.map(text=>({text,page:page.pageNumber})));
  for (let i=0;i<blocks.length;i++) {
    const page = blocks[i].page;
    let block = blocks[i].text;
    // PDF extraction splits two quoted speeches over separate blocks.
    if (block.startsWith('"') && block.lastIndexOf('"') === 0) {
      while (i+1<blocks.length && !block.endsWith('"')) block += ' ' + blocks[++i].text;
    }
    const followsTranslation = blocks[i+1]?.text.startsWith('[');
    if (block.endsWith('"') && followsTranslation) {
      current = {id:`${section.id}-${records.filter(r=>r.section===section.id).length+1}`,
        section:section.id, sectionTitle:section.title, quote:block.replace(/^"/,'').slice(0,-1),
        pages:[page], blocks:[]};
      records.push(current);
    } else if (current) {
      current.blocks.push(block);
      if (!current.pages.includes(page)) current.pages.push(page);
    }
  }
}
// One explicitly reviewed wording difference between the reconstructed file and benchmark.
const family = records.find(record=>record.quote.includes("my dad's over there"));
family.aliases = [family.quote.replace("Sure. ", '').replace('over there','over here')];
const notes = JSON.parse(fs.readFileSync('paper3/2025-b2/sentence-analysis-notes.json','utf8'));
for (const [i,note] of notes.entries()) records.push({...note,id:`guide-${i+1}`,
  supplemental:true, sectionTitle:'逐句導讀補充', blocks:[note.note]});
const data = {source:source.generatedFrom, records};
fs.writeFileSync('paper3/2025-b2/sentence-analysis-data.js',
  `/* Generated from the existing benchmark analysis; do not edit by hand. */\nwindow.EDMUND_B2_SENTENCE_ANALYSIS = ${JSON.stringify(data,null,2)};\n`);
console.log(`Generated ${records.length} source-cited analysis entries.`);
