import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'idiom-system-data.js'), 'utf8'), context);
const lessons = context.window.EDMUND_IDIOM_SYSTEM_DATA.lessons.filter((lesson) => lesson.order >= 31 && lesson.order <= 108);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'idiom-import-manifest.json'), 'utf8'));
const sourceByOrder = new Map(manifest.sources.map((source) => [source.order, source]));
const stop = new Set('a an the and or but to of in on for with at by from is are was were be been being it this that these those his her their my your our we you they he she i someone something as so because when after before into then very can will would should could has have had not do did does one two first'.split(' '));
const tokens = (s) => new Set((s.toLocaleLowerCase('en').match(/[a-z]+/g) || []).filter((word) => word.length > 2 && !stop.has(word)));
const similarity = (a, b) => {
  const overlap = [...a].filter((word) => b.has(word)).length;
  return overlap / Math.max(1, new Set([...a, ...b]).size);
};
const chooseDiverse = (questions, count = 5) => {
  const eligible = questions.filter((q) => {
    const words = q.answer.trim().split(/\s+/).length;
    return words >= 7 && words <= 28 && q.prompt && q.promptZh && q.answerZh;
  });
  const selected = eligible.slice(0, 1);
  while (selected.length < count && selected.length < eligible.length) {
    let best = null;
    let bestScore = -Infinity;
    for (const q of eligible) {
      if (selected.includes(q)) continue;
      const words = tokens(q.prompt);
      const minDistance = Math.min(...selected.map((other) => 1 - similarity(words, tokens(other.prompt))));
      const averageDistance = selected.reduce((sum, other) => sum + 1 - similarity(words, tokens(other.prompt)), 0) / selected.length;
      const score = minDistance * 2 + averageDistance - Math.abs(q.number - 25) / 500;
      if (score > bestScore) { bestScore = score; best = q; }
    }
    if (!best) break;
    selected.push(best);
  }
  return selected.map((q) => ({ id: q.id, number: q.number, promptEn: q.prompt, promptZh: q.promptZh,
    answerEn: q.answer, answerZh: q.answerZh, highlight: q.highlight,
    sourcePage: q.sourcePage, answerSourcePage: q.answerSourcePage }));
};
const semanticRules = (rules) => rules.filter((rule) =>
  /meaning|must|only|not|avoid|there|important|genuine|repeated|actual|strong|real|risk|person|people|two|both|whole|earlier|result|should/i.test(rule.titleEn) &&
  !/article|plural|tense|verb|preposition|hyphen|form|word|phrase|fixed|pronoun|subject|change|preserve|grammar|exact/i.test(rule.titleEn)
).slice(0, 6).map(({ number, titleEn, titleZh, en, zh }) => ({ number, titleEn, titleZh, en, zh }));

const editorialCautions = {
  31: 'The source targets British “fight like cat and dog”; “fight like cats and dogs” is valid American English. Do not call the American form universally wrong.',
  41: 'The source teaches two related “eat dirt” senses: enduring humiliation and an embarrassing admission after being proved wrong. Keep each item’s sense explicit.',
  68: '“Black sheep” reports a group judgement; the person may merely be different. Do not present the label as an objective moral verdict.',
  72: 'Only an exercise PDF was supplied, with no separate teaching pages. The compact definition was independently repaired; every new guide decision needs direct semantic review.',
  77: '“Shoulder to shoulder” can be physical or figurative; these lessons target united effort. Literal proximity alone is not the same decision.',
  82: 'Preferred classroom form is “walk on eggshells”; source explicitly accepts “walk on eggs” as a valid alternative. Neither may be a false wrong option.',
  87: 'Check which “go hot and cold” sense the source questions actually use. Do not import a different temperature or vacillation sense by title alone.',
  104: '“Back-seat driver” has a literal passenger and a figurative interference sense; both require unwanted advice or control.',
  108: 'The saying covers contribution to a dispute and mutual participation in an agreement/activity. Do not merge these into one vague key.',
};

const dossiers = lessons.map((lesson) => ({
  lessonId: lesson.id,
  order: lesson.order,
  lemma: lesson.titleEn,
  sourcePdf: lesson.source?.file,
  sourcePdfSha256: sourceByOrder.get(lesson.order)?.sha256,
  sourcePdfPageCount: sourceByOrder.get(lesson.order)?.pageCount,
  sourcePages: lesson.source?.contentPdfPages,
  answerKeyPages: lesson.source?.answerKeyPdfPages,
  meaningEn: lesson.meaning?.en,
  meaningZh: lesson.meaning?.zh,
  registerEn: lesson.register?.labelEn,
  registerZh: lesson.register?.labelZh,
  registerContextEn: lesson.register?.summaryEn,
  registerContextZh: lesson.register?.summaryZh,
  fixed: lesson.fixedVariable?.fixed,
  surfaceForms: [...new Set(lesson.questions.map((q) => q.highlight))].slice(0, 8),
  memoryEn: lesson.origin?.memoryEn,
  memoryZh: lesson.origin?.memoryZh,
  semanticRules: semanticRules(lesson.rules || []),
  candidateQuestions: chooseDiverse(lesson.questions),
  sourceQuestionCount: lesson.questions.length,
  editorialCaution: editorialCautions[lesson.order] || '',
  editorialStatus: 'SOURCE_EXTRACTED_AWAITING_BILINGUAL_REVIEW',
}));
const out = path.join(root, 'content', 'idiom-super-curation-dossiers-31-108.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ version: '2026-10-23', scope: 'idiom-31..idiom-108', dossiers }, null, 2) + '\n');
console.log(`${dossiers.length} source-grounded dossiers -> ${out}`);
