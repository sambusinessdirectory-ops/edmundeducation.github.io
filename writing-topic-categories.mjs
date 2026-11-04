export const TOPIC_PICKER_TRACKS = Object.freeze({
  dse: Object.freeze([
    { id: 'dse-writing-a', label: 'Writing Part A', category: 'dse-writing-a' },
    { id: 'dse-writing-b', label: 'Writing Part B', category: 'dse-writing-b' },
    { id: 'dse-speaking', label: 'Speaking' },
    { id: 'dse-integrated', label: 'Integrated Skills' }
  ]),
  ielts: Object.freeze([
    { id: 'ielts-writing', label: 'Writing' },
    { id: 'ielts-speaking', label: 'Speaking' }
  ]),
  'non-exam': Object.freeze([
    { id: 'manual', label: '我建立的題目', category: 'manual' },
    { id: 'nonexam-other', label: '其他練習', category: 'nonexam-other' }
  ])
});
export const TOPIC_PICKER_LEAVES = Object.freeze({
  'dse-speaking': Object.freeze([{ id: 'dse-group', label: '小組討論' }, { id: 'dse-individual', label: '個人回應' }]),
  'dse-integrated': Object.freeze([{ id: 'dse-integrated-b1', label: 'Part B · B1' }, { id: 'dse-integrated-b2', label: 'Part B · B2' }]),
  'ielts-writing': Object.freeze([{ id: 'ielts-task-1', label: 'Task 1' }, { id: 'ielts-task-2', label: 'Task 2' }]),
  'ielts-speaking': Object.freeze([{ id: 'ielts-1', label: 'Part 1' }, { id: 'ielts-2', label: 'Part 2' }, { id: 'ielts-3', label: 'Part 3' }])
});

export function writingTopicInPickerCategory(resource, category) {
  if (resource.speakingCategory) return resource.speakingCategory === category;
  const section = resource.sectionKey;
  const detail = resource.detail || '';
  if (category === 'manual') return (resource.type === 'manual-writing-topic' || resource.id?.startsWith('writing-submission:manual:'));
  if (category === 'nonexam-other') return !(resource.type === 'manual-writing-topic' || resource.id?.startsWith('writing-submission:manual:'))
    && !['dse-writing', 'dse-paper3', 'ielts-writing'].includes(section);
  if (category === 'dse-writing-a') return section === 'dse-writing' && /\bPart A\b/i.test(detail);
  if (category === 'dse-writing-b') return section === 'dse-writing' && /\bPart B\b/i.test(detail);
  if (category === 'dse-integrated-b1') return section === 'dse-paper3' && /\bB1\b/i.test(detail);
  if (category === 'dse-integrated-b2') return section === 'dse-paper3' && /\bB2\b/i.test(detail);
  if (category === 'ielts-task-1') return section === 'ielts-writing' && /\bTask 1\b/i.test(detail);
  if (category === 'ielts-task-2') return section === 'ielts-writing' && /\bTask 2\b/i.test(detail);
  return false;
}

