// Adapt the public catalogue to the shared map without loading lesson exercises.
export const SENTENCE_MAP_LIMIT = 30;
const LABELS = [
  'to + verb', 'Adjective + noun', 'Adjective + to-infinitive', 'Although',
  'While · concession', 'Despite', 'Whereas', 'From X to Y', 'Between A and B',
  'A few / A little', 'Few / Little', 'Without + V-ing', 'With + noun + -ing',
  'So + must', 'Whose', 'Instead of', 'Instead', 'Rather', 'By contrast', 'Even',
  'Not even', 'Even if', 'Given that', 'Provided / Providing that',
  'WH non-specific clauses', 'In case', 'That way', 'Had better',
  'Otherwise / Or', 'As · changes over time'
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
