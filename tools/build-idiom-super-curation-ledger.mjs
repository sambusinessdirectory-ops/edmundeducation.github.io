import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });
for (const name of ['idiom-system-data.js', 'idiom-first-five-curation.js',
  'idiom-compass-06-30-curation.js', 'idiom-compass-06-30-bonus.js',
  'idiom-compass-31-108-curation.js']) {
  const file = path.join(root, name);
  if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
const lessons = context.window.EDMUND_IDIOM_SYSTEM_DATA.lessons.filter((lesson) => lesson.order <= 108);
const guides = context.window.EDMUND_IDIOM_COMPASS || {};
const quote = (value) => `"${String(value ?? '').replaceAll('"', '""').replaceAll(/\r?\n/g, ' ')}"`;
const headers = ['lesson_order', 'lesson_id', 'lemma', 'item_id', 'item_number', 'source_type',
  'source_pdf', 'source_page', 'answer_source_page', 'english_prompt_present', 'chinese_prompt_present',
  'source_answer_present', 'compass_guide_present', 'candidate_mc_present', 'theme', 'actor_role',
  'relationship', 'tense_aspect', 'sentence_shape', 'foil_categories', 'truth_condition',
  'score_sense_accuracy', 'score_natural_correct_english', 'score_fact_preservation',
  'score_one_defensible_key', 'score_realistic_situation', 'score_three_diagnostic_foils',
  'score_option_shape_fairness', 'score_english_clarity', 'score_faithful_chinese',
  'score_option_specific_rationale', 'score_neutral_difference_marks',
  'score_reveal_and_progress', 'four_options_checked', 'one_key_checked',
  'english_semantic_review', 'chinese_review', 'foil_review', 'rationale_review',
  'difference_mark_review', 'audio_review', 'reviewer', 'reviewed_at', 'release_status'];
const rows = [];
for (const lesson of lessons) {
  const guide = guides[lesson.id];
  const questions = [...lesson.questions];
  const bonus = guide?.bonusPractice || [];
  for (let number = 51; number <= 60; number++) {
    questions.push(bonus[number - 51] || { id: `${lesson.id}-bonus-${String(number - 50).padStart(2, '0')}`, number });
  }
  for (const item of questions) {
    const candidate = Boolean(guide && item.prompt && item.answer);
    const row = {
      lesson_order: lesson.order,
      lesson_id: lesson.id,
      lemma: lesson.titleEn,
      item_id: item.id,
      item_number: item.number,
      source_type: item.number <= 50 ? 'original' : 'extension',
      source_pdf: lesson.source?.file || '',
      source_page: item.sourcePage || '',
      answer_source_page: item.answerSourcePage || '',
      english_prompt_present: Boolean(item.prompt),
      chinese_prompt_present: Boolean(item.promptZh),
      source_answer_present: Boolean(item.answer),
      compass_guide_present: Boolean(guide),
      candidate_mc_present: candidate,
      theme: item.theme || '',
      actor_role: '',
      relationship: '',
      tense_aspect: '',
      sentence_shape: '',
      foil_categories: '',
      truth_condition: '',
      score_sense_accuracy: 'UNSCORED',
      score_natural_correct_english: 'UNSCORED',
      score_fact_preservation: 'UNSCORED',
      score_one_defensible_key: 'UNSCORED',
      score_realistic_situation: 'UNSCORED',
      score_three_diagnostic_foils: 'UNSCORED',
      score_option_shape_fairness: 'UNSCORED',
      score_english_clarity: 'UNSCORED',
      score_faithful_chinese: 'UNSCORED',
      score_option_specific_rationale: 'UNSCORED',
      score_neutral_difference_marks: 'UNSCORED',
      score_reveal_and_progress: 'UNSCORED',
      four_options_checked: 'NOT_ITEM_REVIEWED',
      one_key_checked: 'NOT_ITEM_REVIEWED',
      english_semantic_review: 'AI_REVIEW_PENDING',
      chinese_review: 'AI_REVIEW_PENDING',
      foil_review: 'AI_REVIEW_PENDING',
      rationale_review: 'AI_REVIEW_PENDING',
      difference_mark_review: 'AI_REVIEW_PENDING',
      audio_review: 'NOT_APPLICABLE_FINAL_MC',
      reviewer: '',
      reviewed_at: '',
      release_status: candidate ? 'STRUCTURAL_CANDIDATE_ONLY' : 'MISSING_COMPASS_CONTENT',
    };
    rows.push(headers.map((key) => quote(row[key])).join(','));
  }
}
const out = path.join(root, 'content', 'idiom-super-curation-item-review-ledger-001-108.csv');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, [headers.join(','), ...rows].join('\n') + '\n');
console.log(`${rows.length} item review records -> ${out}`);
