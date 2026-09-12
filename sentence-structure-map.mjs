// Adapt the public catalogue to the shared map without loading lesson exercises.
export const SENTENCE_MAP_LIMIT = 120;
const LABELS = [
  'to + verb', 'Adjective + noun', 'Adjective + to-infinitive', 'Although',
  'While · concession', 'Despite', 'Whereas', 'From X to Y', 'Between A and B',
  'A few / A little', 'Few / Little', 'Without + V-ing', 'With + noun + -ing',
  'So + must', 'Whose', 'Instead of', 'Instead', 'Rather', 'By contrast', 'Even',
  'Not even', 'Even if', 'Given that', 'Provided / Providing that',
  'WH non-specific clauses', 'In case', 'That way', 'Had better',
  'Otherwise / Or', 'As · changes over time',
  'As · identity / role', 'Whether / If · questions', 'Whether or not',
  'While · contrast', 'It + adjective + to', 'It + adjective + that',
  'Noun + to-infinitive', 'There is / are', 'There is / are + -ing',
  'Another', 'Each · individuals', 'Every', 'Each · distribution',
  'Each other / One another', 'One of the', 'Something / Anything / Everything',
  'Somewhere / Nowhere / Elsewhere', 'Everywhere / Anywhere',
  'Something + adjective', 'Somewhere + adjective', 'Anywhere + adjective',
  'Someone + adjective', 'In order to', 'So that · purpose', 'Gerund as subject',
  'Verb + to-infinitive', 'Verb + bare infinitive', 'Verb + gerund',
  'As long as', 'So long as',
  'Have no choice but to', 'If only', 'Only if', 'Be about to',
  'It’s time to', 'It’s time + past tense', 'Used to', 'Be used to',
  'Nonetheless / Nevertheless', 'Would rather', 'Wish + past tense',
  'Too + adjective + to', 'So + adjective + that', 'Let alone',
  'Not to mention', 'As if / As though', 'Why not … if …?', 'By itself',
  'Double negatives', '… is that …', 'So as to', 'Granted … However …',
  'Whenever / Whatever / Whoever', 'Enough + to', 'The more … the more …',
  'Negative questions', 'Rhetorical questions', 'Verb + more / less than',
  'Adverb comparatives', 'Comparative sentences',
  'Superlatives', 'Comparative nouns', 'As + adjective + as',
  'Hardly / Rarely / Barely', 'Adverbs of frequency', 'Negative frequency adverbs',
  'Inversion', 'Just as … as', 'Well + adjective / participle',
  'Different kinds / sorts / types', 'All + classification + of',
  'Adjective + with / without', 'By / With / From', 'Either … or …',
  'Neither … nor …', 'Whether … or …', 'The sooner … the better',
  'Not only … but also …', 'The former / The latter', 'As such',
  'Such that', 'Such … that …', 'So much so that', 'Not so much A as B',
  'Far from + adjective', 'Once', 'By the time', 'The moment / The minute',
  'Now that', 'Reduced adverb clauses'
];
export function sentenceMapLessons(lessons) {
  return lessons.slice(0, SENTENCE_MAP_LIMIT).map((lesson, index) => ({
    id: lesson.id, order: index + 1, titleEn: lesson.titleEn,
    titleZh: lesson.title || lesson.titleZh || '',
    mapLabel: /^ss\d+$/.test(lesson.id) ? LABELS[Number(lesson.id.slice(2)) - 1] : lesson.titleEn,
    questions: lesson.questions
  }));
}
// Match the existing list's best-attempt completion semantics; moving or pinning
// on the map never creates an attempt or adds study time.
export function sentenceMapCompleted(attempts, lesson) {
  const counts = attempts.filter(a => a.lessonId === lesson.id)
    .map(a => Number(a.correctCount)).filter(Number.isFinite);
  return Math.max(0, Math.min(lesson.questions.length, Math.max(0, ...counts)));
}
