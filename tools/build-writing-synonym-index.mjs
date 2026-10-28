import fs from 'node:fs';
import {catalog, legacyCatalog} from '../synonyms/lesson-catalog.mjs';
import {importantModule} from '../synonyms/important-data.mjs';
import {socialMediaModule} from '../synonyms/social-media-data.mjs';
const entries = [{...importantModule, headword:'important'}, ...[...catalog, ...legacyCatalog].sort((a,b)=>a.rank-b.rank || Number(a.legacy||false)-Number(b.legacy||false)), {...socialMediaModule, headword:'social media'}];
const index = entries.map(entry => {
  const lesson = entry.words ? entry : JSON.parse(fs.readFileSync(new URL('../synonyms/' + entry.dataFile.replace(/^\.\//,''), import.meta.url)));
  return {dataFile:entry.dataFile || null, id:entry.id, title:entry.title, headword:entry.headword || entry.title, subtitle:entry.subtitle || '', questions:entry.questionCount ?? lesson.words.reduce((n,w)=>n+w.exercises.length,0), terms:lesson.words.map(w=>[w.word,w.meaning])};
});
fs.writeFileSync(new URL('../synonyms/writing-search-index.json', import.meta.url), JSON.stringify(index));
console.log(`Indexed ${index.length} synonym lessons`);
