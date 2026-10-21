// Sentence functions transcribed from the supplied writing-planning sheet.
export const WRITING_FUNCTIONS = Object.freeze([
  ['intro-background', 'Introduction', '引言', 'Background', '背景介紹'],
  ['intro-transition', 'Introduction', '引言', 'Transitional sentence', '過渡句'],
  ['intro-effect', 'Introduction', '引言', 'Expected effect', '預期效果'],
  ['intro-stance', 'Introduction', '引言', 'Stance', '表明立場'],
  ['intro-thesis', 'Introduction', '引言', 'Thesis Statement (all arguments)', '中心論點（概述所有分論點）'],
  ['body1-topic', 'Body paragraph 1', '正文段落一', 'Topic Sentence', '主題句'],
  ['body1-explanation', 'Body paragraph 1', '正文段落一', 'Supporting Detail 1 - Explanation', '分論點一：解釋'],
  ['body1-examples', 'Body paragraph 1', '正文段落一', 'Supporting Detail 1 - Examples', '分論點一：舉例'],
  ['body1-action', 'Body paragraph 1', '正文段落一', 'Supporting Detail 1 - Action Plan', '分論點一：具體行動方案'],
  ['body1-conclusion', 'Body paragraph 1', '正文段落一', 'Supporting Detail 1 - Conclusion', '分論點一：小結'],
  ['body2-topic', 'Body paragraph 2', '正文段落二', 'Topic Sentence', '主題句'],
  ['body2-explanation', 'Body paragraph 2', '正文段落二', 'Supporting Detail 2 - Explanation', '分論點二：解釋'],
  ['body2-examples', 'Body paragraph 2', '正文段落二', 'Supporting Detail 2 - Examples', '分論點二：舉例'],
  ['body2-action', 'Body paragraph 2', '正文段落二', 'Supporting Detail 2 - Action Plan', '分論點二：具體行動方案'],
  ['body2-conclusion', 'Body paragraph 2', '正文段落二', 'Supporting Detail 2 - Conclusion', '分論點二：小結'],
  ['rebuttal-opponent-topic', 'Rebuttal - Opponent', '反駁段－反方', "Opponent's argument (topic sentence)", '反方論點（主題句）'],
  ['rebuttal-opponent-explanations', 'Rebuttal - Opponent', '反駁段－反方', "Opponent's explanations", '反方論點：解釋'],
  ['rebuttal-opponent-examples', 'Rebuttal - Opponent', '反駁段－反方', "Opponent's examples", '反方論點：例子'],
  ['rebuttal-opponent-conclusion', 'Rebuttal - Opponent', '反駁段－反方', "Opponent's conclusion", '反方小結'],
  ['rebuttal-your-topic', 'Rebuttal - Your view', '反駁段－己方', 'Your arguments (topic sentence)', '己方反駁：論點（主題句）'],
  ['rebuttal-your-explanations', 'Rebuttal - Your view', '反駁段－己方', 'Your explanations', '己方反駁：解釋'],
  ['rebuttal-your-examples', 'Rebuttal - Your view', '反駁段－己方', 'Your examples', '己方反駁：例子'],
  ['rebuttal-your-conclusions', 'Rebuttal - Your view', '反駁段－己方', 'Your conclusions', '己方反駁：小結'],
  ['conclusion-stance', 'Conclusion', '結論', 'Reiterating Stance', '重申立場'],
  ['conclusion-arguments', 'Conclusion', '結論', 'Reiterating Arguments', '重申各項論點'],
  ['conclusion-action', 'Conclusion', '結論', 'Next Action', '提出具體行動建議'],
  ['conclusion-closing', 'Conclusion', '結論', 'Closing line', '總結句']
].map(([id, group, groupZh, title, titleZh]) => Object.freeze({ id, group, groupZh, title, titleZh })));

const FUNCTION_IDS = new Set(WRITING_FUNCTIONS.map(item => item.id));

export function normalizeFunctionHelper(value) {
  const source = value && typeof value === 'object' ? value : {};
  const enabled = Array.isArray(source.enabled)
    ? source.enabled.filter(id => FUNCTION_IDS.has(id))
    : WRITING_FUNCTIONS.map(item => item.id);
  const values = {};
  for (const item of WRITING_FUNCTIONS) {
    const text = source.values?.[item.id];
    values[item.id] = typeof text === 'string' ? text.slice(0, 100000) : '';
  }
  return {
    active: source.active === true,
    enabled: [...new Set(enabled)],
    values,
    unassigned: typeof source.unassigned === 'string' ? source.unassigned.slice(0, 100000) : ''
  };
}

export function composeFunctionAnswer(helper) {
  const record = normalizeFunctionHelper(helper);
  const enabled = new Set(record.enabled);
  const parts = [record.unassigned.trim()];
  for (const item of WRITING_FUNCTIONS) {
    if (enabled.has(item.id)) parts.push(record.values[item.id].trim());
  }
  return parts.filter(Boolean).join('\n\n');
}
