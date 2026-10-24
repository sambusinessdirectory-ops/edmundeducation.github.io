// One renderer for the reading exercise and its curation workspace.
export function createReadingQuestionRenderer({escapeHtml, dseTranslationCopy=()=>'', isDse=()=>true, getChinese=()=>'', interactiveWords=text=>escapeHtml(text)}) {
  const normalizedOption = option => typeof option === 'string' ? {value:option,label:option,translation:''} : option;
function renderAnswerControl(control, name, partId) {
  const type = control.type || 'text'; const options = control.options || [];
  if (['choice', 'multiple'].includes(type)) return `<div class="choice-list">${options.map((entry, index) => { const option = normalizedOption(entry); return `<label><input type="${type === 'multiple' ? 'checkbox' : 'radio'}" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" data-answer-slots="${control.slots || 1}" value="${escapeHtml(option.value)}"><span><strong>${escapeHtml(option.label)}</strong>${option.translation ? `<small class="option-translation" data-question-translation hidden><br>${escapeHtml(option.translation)}</small>` : ''}${typeof entry === 'string' ? dseTranslationCopy(options, index) : dseTranslationCopy(entry, 'label')}</span></label>`; }).join('')}</div>${type === 'multiple' && control.selectionLimit !== false ? `<small>請選擇 ${control.slots || 1} 項。</small>` : ''}`;
  if (type === 'select') return `<select class="answer-input" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" aria-label="${escapeHtml(control.label || '選擇答案')}"><option value="">選擇答案</option>${options.map((entry, index) => { const option = normalizedOption(entry); const chinese = isDse() ? getChinese(typeof entry === 'string' ? options : entry, typeof entry === 'string' ? index : 'label') : ''; return `<option value="${escapeHtml(option.value)}"${chinese ? ` data-english-label="${escapeHtml(option.label)}" data-chinese-label="${escapeHtml(chinese)}"` : ''}>${escapeHtml(option.label)}</option>`; }).join('')}</select>`;
  if (type === 'textarea') return `<textarea class="answer-input" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" aria-label="${escapeHtml(control.label || '輸入答案')}" autocomplete="off" maxlength="1200" placeholder="${escapeHtml(control.placeholder || '輸入答案')}"></textarea>${dseTranslationCopy(control, 'placeholder')}`;
  return `<input class="answer-input" name="${escapeHtml(name)}" data-answer-part="${escapeHtml(partId)}" aria-label="${escapeHtml(control.label || '輸入答案')}" autocomplete="off" maxlength="300" placeholder="${escapeHtml(control.placeholder || '輸入答案')}">${dseTranslationCopy(control, 'placeholder')}`;
}
function renderQuestionControls(question) {
  if (question.tables?.length) {
    const remainingParts = question.parts?.filter((part) => !part.inTable);
    const remainingControls = !question.parts?.length || remainingParts?.length ? renderQuestionControls({ ...question, tables: undefined, parts: remainingParts }) : '';
    return question.tables.map((table) => renderSourceTable(table, question)).join('') + remainingControls;
  }
  if (question.parts?.length) return `<div class="question-parts">${question.parts.map((part) => { const name = `q${question.number}_${part.key}`; return `<div class="question-part"><span>${escapeHtml(part.label)}${dseTranslationCopy(part, 'label')}</span>${renderAnswerControl(part, name, name)}</div>`; }).join('')}</div>`;
  return renderAnswerControl(question, `q${question.number}`, `q${question.number}`);
}
function renderSourceTable(table, question = null, scope = 'question', paragraphNumber = null) {
  const columns = Math.max(...table.rows.map(row => row.reduce((count, cell) => count + (cell.colSpan || 1), 0)));
  const renderText = text => scope === 'passage' ? interactiveWords(text, `p${paragraphNumber}-table`, true) : escapeHtml(text);
  return `<div class="source-table-scroll" role="region" aria-label="${escapeHtml(table.caption || 'Source table')}" tabindex="0"><table class="source-table${table.compact ? ' is-compact' : ''}${table.flow ? ' is-flow' : ''}${columns > 2 ? ' is-wide' : ''}">${table.caption ? `<caption>${renderText(table.caption)}${dseTranslationCopy(table, 'caption', scope, paragraphNumber)}</caption>` : ''}<tbody>${table.rows.map((row) => `<tr>${row.map((cell, cellIndex) => {
    const item = typeof cell === 'string' ? { text: cell } : cell;
    const tag = item.header ? 'th' : 'td';
    const fields = (item.parts || (item.part ? [item.part] : [])).map((key) => question?.parts?.find((entry) => entry.key === key)).filter(Boolean);
    const controls = fields.map((part) => { const name = `q${question.number}_${part.key}`; const control = renderAnswerControl(part, name, name); return fields.length > 1 ? `<div class="table-answer-field"><span>${escapeHtml(part.label)}${dseTranslationCopy(part, 'label')}</span>${control}</div>` : dseTranslationCopy(part, 'label') + control; }).join('');
    return `<${tag}${item.colSpan > 1 ? ` colspan="${item.colSpan}"` : ''}${item.rowSpan > 1 ? ` rowspan="${item.rowSpan}"` : ''}>${renderText(item.text || '')}${typeof cell === 'string' ? dseTranslationCopy(row, cellIndex, scope, paragraphNumber) : dseTranslationCopy(cell, 'text', scope, paragraphNumber)}${controls}</${tag}>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
}
  return {renderAnswerControl,renderQuestionControls,renderSourceTable};
}
