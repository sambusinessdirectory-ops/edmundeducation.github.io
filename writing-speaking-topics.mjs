export const SPEAKING_TOPIC_CATEGORIES = Object.freeze([
  { id: 'dse-group', label: 'DSE 小組討論', search: 'dse dsc hkdse paper 4 speaking group discussion discussions 小組討論 說話' },
  { id: 'dse-individual', label: 'DSE 個人回應', search: 'dse dsc hkdse paper 4 speaking individual response responses 個人回應 說話' },
  { id: 'ielts-1', label: 'IELTS Speaking Part 1', search: 'ielts speaking part 1 part one 口語 說話' },
  { id: 'ielts-2', label: 'IELTS Speaking Part 2', search: 'ielts speaking part 2 part two cue card 口語 說話' },
  { id: 'ielts-3', label: 'IELTS Speaking Part 3', search: 'ielts speaking part 3 part three 口語 說話' }
]);

const categoryById = new Map(SPEAKING_TOPIC_CATEGORIES.map(category => [category.id, category]));

export function speakingTopicLabel(topic) {
  const category = categoryById.get(topic.category);
  if (!category) return '';
  if (topic.category.startsWith('dse-')) {
    return `${category.label} · ${topic.year} · ${topic.set} · ${topic.title} · ${topic.number}`;
  }
  return `${category.label} · Book ${topic.book} · ${topic.title}${topic.number ? ` · ${topic.number}` : ''}`;
}

export function speakingTopicPrompt(topic, contexts = {}) {
  const label = speakingTopicLabel(topic);
  if (!label) return '';
  const lines = [label];
  if (topic.category.startsWith('dse-') && contexts[topic.contextId]) {
    lines.push(`Source material:\n${contexts[topic.contextId]}`);
  }
  lines.push(topic.question);
  if (topic.category === 'ielts-2' && topic.hints?.length) {
    lines.push(`You should say:\n${topic.hints.map(hint => `• ${hint}`).join('\n')}`);
  }
  return lines.join('\n\n');
}

export function speakingTopicSearchText(value) {
  return String(value || '').normalize('NFKC').replace(/[’]/g, "'")
    .toLocaleLowerCase().replace(/[^a-z0-9一-鿿]+/g, ' ').trim();
}

export function speakingTopicSearchHaystack(topic, contexts = {}) {
  const category = categoryById.get(topic.category);
  return speakingTopicSearchText([
    category?.search,
    category?.label,
    topic.year,
    topic.set,
    topic.book ? `book ${topic.book}` : '',
    topic.title,
    topic.titleZh,
    topic.question,
    topic.questionZh,
    ...(topic.hints || []),
    contexts[topic.contextId] || ''
  ].join(' '));
}
