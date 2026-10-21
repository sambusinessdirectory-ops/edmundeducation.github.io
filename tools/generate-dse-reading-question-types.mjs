// Rebuild after editing any dse-reading-data paper.
import {readFile, writeFile} from 'node:fs/promises';
import {readdir} from 'node:fs/promises';

export const TYPES = [
  ['true-false-not-given', 'True / False / Not Given', '是非／未提及', ['true false', 'tfng', '正確 錯誤 未提及']],
  ['multiple-choice', 'Multiple Choice', '單選題', ['mc', '選擇題']],
  ['multiple-response', 'Choose Several', '多選題', ['tick two', 'tick three', '多項選擇']],
  ['matching', 'Matching', '配對題', ['match', '配對']],
  ['completion', 'Sentence / Summary Completion', '句子／摘要填空', ['fill blank', 'complete', '填空']],
  ['table-diagram', 'Table / Diagram', '表格／圖表題', ['table', 'diagram', '表格', '圖表']],
  ['editing-proofreading', 'Editing / Proofreading', '改錯／校對', ['correction', 'mistake', 'error', '改錯']],
  ['short-answer', 'Short Answer', '簡答題', ['open question', '簡答']],
  ['vocabulary', 'Vocabulary in Context', '語境詞義', ['meaning', 'word meaning', '詞義']],
  ['reference', 'Pronoun / Reference', '指代關係', ['refer to', '指代']],
  ['purpose-main-idea', 'Purpose / Main Idea', '目的／主旨', ['title', 'heading', '主旨']],
  ['inference', 'Inference', '推論題', ['imply', 'suggest', '推論']],
  ['tone-attitude', 'Tone / Attitude', '語氣／態度', ['tone', 'attitude', '語氣']],
  ['text-evidence', 'Evidence from Text', '文本證據', ['support', 'justify', 'evidence', '證據']]
].map(([id, en, zh, aliases]) => ({id, en, zh, aliases}));

export function classifyQuestion(question) {
  const prompt = String(question.prompt || '');
  const content = [prompt, question.context, ...(question.parts || []).map(part => part.label)].join(' ');
  const lower = content.toLowerCase();
  const parts = question.parts || [];
  const partOptions = parts.flatMap(part => part.options || []).map(String);
  const options = [...(question.options || []), ...partOptions].map(String);
  const types = [];
  const add = id => { if (!types.includes(id)) types.push(id); };

  if (/\b(?:one|five|six|several) mistakes?\b|\bproofread(?:ing)?\b|\bfind (?:the|an?) errors?\b|\bcorrect (?:the|each) (?:error|mistake)\b/i.test(content)) add('editing-proofreading');
  else if (/true\s*\(?t\)?\s*[,/ ]+false|true\s*or\s*false|not\s*given|\bT\s*\/\s*F\s*\/\s*NG\b/i.test(content) ||
      (options.includes('T') && options.includes('F'))) add('true-false-not-given');
  else if (/\bmatch\b|matching|pair (?:each|the|up)|corresponding (?:paragraph|heading)|which (?:person|speaker|paragraph) (?:said|mentions|expresses)/i.test(content)) add('matching');
  else if (question.type === 'multiple' || /tick (?:the )?(?:two|three|four|all|more than one)|choose (?:the )?(?:two|three|four)|select (?:the )?(?:two|three|four)/i.test(content)) add('multiple-response');
  else if (/\bcomplete\b|fill in|fill (?:each|the|a) blank|\bblanks?\b|_{3,}/i.test(content)) add('completion');
  else if (question.type === 'choice' || parts.some(part => part.type === 'choice')) add('multiple-choice');
  else if (/\bdiagram\b|\btable\b|\bchart\b|\bgraph\b/i.test(content)) add('table-diagram');
  else if (parts.some(part => part.type === 'select') || options.length) add('matching');
  else add('short-answer');

  if (/\bdiagram\b|\btable\b|\bchart\b|\bgraph\b/i.test(content)) add('table-diagram');
  if (!types.includes('editing-proofreading') && /meaning of|mean by|closest in meaning|word (?:that|which|in)|expression (?:that|which)|synonym|opposite in meaning|vocabulary|what does .{0,50} mean/i.test(content)) add('vocabulary');
  if (/\b(?:what|who|which) (?:does|do|is|are) [^?]{0,80}\brefer(?:s)? to\b|\b(?:it|they|them|this|that|these|those)\b[^?]{0,35}\brefers? to\b/i.test(content)) add('reference');
  if (/main (?:idea|point|message|purpose)|purpose of|best (?:title|subtitle|heading)|most suitable (?:title|heading)|why (?:does|did) the (?:writer|author) (?:write|mention|use)|what is the (?:writer|author).{0,25}(?:purpose|intention)/i.test(content)) add('purpose-main-idea');
  if (/\bimply|\binfer|\bsuggest|can (?:we|you) conclude|what can be concluded|most likely|probably|would (?:the|a) (?:writer|author)/i.test(content)) add('inference');
  if (/\btone\b|\battitude\b|\bfeeling\b|\bfeel about\b|writer.s view|writer.s opinion/i.test(content)) add('tone-attitude');
  if (/\bevidence\b|\bjustify\b|\bsupport (?:your|the) answer|give (?:one|two|three|a) reason|quote from|cite from/i.test(content)) add('text-evidence');
  return types;
}

async function main() {
  const files = (await readdir('dse-reading-data')).filter(name => /^dse-20\d\d-(?:a|b1|b2)\.json$/.test(name)).sort();
  const papers = [];
  for (const file of files) {
    const paper = JSON.parse(await readFile(`dse-reading-data/${file}`, 'utf8'));
    papers.push({
      id: paper.id, year: paper.year, section: paper.section, title: paper.title,
      questions: paper.questions.map(question => ({number: question.number, types: classifyQuestion(question)}))
    });
  }
  if (papers.length !== 45 || papers.some(paper => !paper.questions.length || paper.questions.some(question => !question.types.length))) throw new Error('DSE classification must cover every question in all 45 papers.');
  const index = {version:'20261021-dse-types1',paperCount:papers.length,questionCount:papers.reduce((total,paper)=>total+paper.questions.length,0),types:TYPES,papers};
  await writeFile('dse-reading-question-types.json', JSON.stringify(index));
  console.log(`${index.paperCount} DSE papers and ${index.questionCount} questions classified across ${TYPES.length} types.`);
}
if (process.argv[1]?.endsWith('generate-dse-reading-question-types.mjs')) await main();
