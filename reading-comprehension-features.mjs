// Count answer slots, not cards or radio options. Multiple blanks in one question
// use distinct part IDs; a choose-two group may declare slots: 2.
export function calculateAnswerProgress(controls) {
  const parts = new Map();
  for (const control of controls) {
    const key = control.part || control.name;
    if (!key) continue;
    const part = parts.get(key) || { slots: 1, values: new Set() };
    part.slots = Math.max(part.slots, Math.floor(Number(control.slots) || 1));
    const values = Array.isArray(control.value) ? control.value : [control.value];
    const selected = !['radio', 'checkbox'].includes(control.type) || control.checked;
    if (selected) values.forEach((value) => {
      if (value !== null && value !== undefined && String(value).trim()) part.values.add(String(value).trim());
    });
    parts.set(key, part);
  }
  const total = [...parts.values()].reduce((sum, part) => sum + part.slots, 0);
  const answered = [...parts.values()].reduce((sum, part) => sum + Math.min(part.slots, part.values.size), 0);
  return { answered, total, percent: total ? Math.round(answered / total * 1000) / 10 : 0 };
}

export function scanningSections(question) {
  return (question?.sections || []).filter((section) =>
    /^(scan|scanning)$/i.test(String(section.id || '').trim()) ||
    /^(scan|scanning)(?:\s+tips)?$/i.test(String(section.title || '').trim()));
}

export const BOOKMARK_LABELS = {
  passage: '文章與題目組', questions: '整組題目', paragraph: '個別段落', question: '個別題目',
  skimming: 'Skimming Tips', scanning: 'Scanning Tips', analysis: '答案解析', section: '分析小節', word: '重點字詞'
};

export function bookmarkTarget(key) {
  const word = /^word:([^:]+):([pqg])(\d+):w\d+$/.exec(key);
  if (word) return { article: word[1], kind: 'word', number: Number(word[3]), context: word[2] };
  const match = /^([^:]+):(passage|questions|paragraph|question|skimming|scanning|analysis|q\d+)(?::(\d+))?(?::([\w-]+))?$/.exec(key);
  if (!match) return null;
  const [, article, kind, number, section] = match;
  if (/^q\d+$/.test(kind)) return { article, kind: 'analysis', number: Number(kind.slice(1)) };
  return { article, kind: kind === 'analysis' && section ? 'section' : kind, number: Number(number || 0), ...(section ? { section } : {}) };
}

export function readingBookmarkLink(target) {
  const params = new URLSearchParams({ passage: /^p([123])-/.exec(target.article)?.[1] || '1', article: target.article });
  const paragraph = ['paragraph', 'skimming'].includes(target.kind) || (target.kind === 'word' && target.context === 'p');
  if (['skimming', 'scanning', 'analysis', 'section'].includes(target.kind)) {
    params.set('view', target.kind === 'section' ? 'analysis' : target.kind);
    params.set(paragraph ? 'paragraph' : 'question', String(target.number));
    if (target.section) params.set('section', target.section);
  }
  const anchor = target.kind === 'questions' ? 'questions-title' : target.number ? `${paragraph ? 'paragraph' : 'question'}-${target.number}` : '';
  return `reading-comprehension.html?${params}${anchor ? `#${anchor}` : ''}`;
}
