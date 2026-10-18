const encoder = new TextEncoder();
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const SCALE = 2;
const FIELD_LABELS = Object.freeze({originalFragment: '學生原句', edmundComment: 'Edmund 評語', suggestedWriting: '建議寫法', originalSentence: '原句', enhancement: '改良寫法', benefit: '好處／作用', label: '練習', url: '連結'});

function printable(value, depth = 0) {
  if (depth > 5 || value == null) return [];
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item, index) => printable(item, depth + 1).map((text, line) => line ? `   ${text}` : `${index + 1}. ${text}`));
  if (typeof value !== 'object') return [];
  if (typeof value.text === 'string') return printable(value.text, depth + 1);
  const ignored = /^(id|position|status|version|bookmarked|bookmarkVersion|updatedAt|publishedAt|submissionId|topicResource|extensions|.*Formatting|.*Copy.*|.*_formatting|.*_version|.*_updated_at)$/i;
  return Object.entries(value).filter(([key]) => !ignored.test(key)).flatMap(([key, item]) => printable(item, depth + 1).map(text => `${FIELD_LABELS[key] || key}: ${text}`));
}

export function archivePdfSections(bundle) {
  const {submission, feedback} = bundle;
  const sections = [
    {title: '學生', body: submission.studentName || '未命名學生'},
    {title: '提交日期', body: submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('zh-HK', {timeZone: 'Asia/Hong_Kong'}) : ''},
    {title: '字數', body: String(submission.wordCount || 0)},
    {title: '寫作題目', body: submission.topic || ''},
    {title: '學生原文', body: submission.answer || '（文章內容為空）'}
  ];
  if (!feedback || feedback.status !== 'published') return sections;
  const groups = [
    ['整體評語', feedback.overallComment],
    ['逐段評語與建議', feedback.fragments],
    ['最後評語', feedback.finalComment],
    ['文法評語', feedback.grammarPoints],
    ['保留原意改良版', feedback.improvedVersion],
    ['改良謄寫', feedback.transcriptionImproved],
    ['示範謄寫', feedback.transcriptionModel],
    ['句子結構提升', feedback.sentenceStructureParts],
    ['句子結構練習連結', feedback.sentenceStructureLinks],
    ['修辭技巧提升', feedback.rhetoricalParts],
    ['動詞片語提升', feedback.phrasalVerbParts],
    ['Idiom 慣用語提升', feedback.idiomParts],
    ['Proverb 諺語提升', feedback.proverbParts],
    ['Writing Common Expression 提升', feedback.writingCommonExpressionParts],
    ['修辭 Common Expression 提升', feedback.rhetoricalCommonExpressionParts],
    ['同義詞改善', feedback.synonymImprovementParts]
  ];
  sections.push({title: 'Edmund Sir 寫作評語', body: `已發布${feedback.publishedAt ? ` · ${feedback.publishedAt}` : ''}`});
  for (const [title, value] of groups) {
    const lines = printable(value);
    if (lines.length) sections.push({title, body: lines.join('\n\n')});
  }
  return sections;
}

function wrap(ctx, value, maxWidth) {
  const output = [];
  for (const paragraph of String(value || '').replace(/\r\n?/g, '\n').split('\n')) {
    if (!paragraph) { output.push(''); continue; }
    let line = '';
    for (const char of paragraph) {
      if (line && ctx.measureText(line + char).width > maxWidth) { output.push(line); line = char; }
      else line += char;
    }
    output.push(line);
  }
  return output;
}

function pdfFromJpegs(jpegs) {
  const chunks = [];
  const offsets = [0];
  let size = 0;
  const append = bytes => { chunks.push(bytes); size += bytes.length; };
  const add = string => append(encoder.encode(string));
  function object(number, header, stream) {
    offsets[number] = size;
    add(`${number} 0 obj\n${header}`);
    if (stream) { add('\nstream\n'); append(stream); add('\nendstream'); }
    add('\nendobj\n');
  }
  add('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  const kids = jpegs.map((_, index) => `${3 + index * 3} 0 R`).join(' ');
  object(2, `<< /Type /Pages /Kids [${kids}] /Count ${jpegs.length} >>`);
  for (let index = 0; index < jpegs.length; index += 1) {
    const page = 3 + index * 3;
    const content = encoder.encode(`q ${PAGE_WIDTH} 0 0 ${PAGE_HEIGHT} 0 0 cm /Im0 Do Q`);
    object(page, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /XObject << /Im0 ${page + 1} 0 R >> >> /Contents ${page + 2} 0 R >>`);
    object(page + 1, `<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH * SCALE} /Height ${PAGE_HEIGHT * SCALE} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegs[index].length} >>`, jpegs[index]);
    object(page + 2, `<< /Length ${content.length} >>`, content);
  }
  const xrefAt = size;
  const count = 3 + jpegs.length * 3;
  add(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let number = 1; number < count; number += 1) add(`${String(offsets[number]).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
  const output = new Uint8Array(size);
  let cursor = 0;
  for (const chunk of chunks) { output.set(chunk, cursor); cursor += chunk.length; }
  return output;
}

export async function renderArchivePdf(bundle) {
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH * SCALE;
  canvas.height = PAGE_HEIGHT * SCALE;
  const ctx = canvas.getContext('2d', {alpha: false});
  if (!ctx) throw new Error('瀏覽器無法建立 PDF 畫布。');
  ctx.scale(SCALE, SCALE);
  const images = [];
  let y = 0;
  let pageNumber = 0;
  function startPage() {
    pageNumber += 1;
    if (pageNumber > 250) throw new Error('文章或評語過長，超出單份 PDF 的頁數上限。');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    ctx.fillStyle = '#244364'; ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('EdmundEducation · Writing Submission', 42, 38);
    ctx.strokeStyle = '#cbd4df'; ctx.beginPath(); ctx.moveTo(42, 48); ctx.lineTo(PAGE_WIDTH - 42, 48); ctx.stroke();
    ctx.fillStyle = '#667381'; ctx.font = '10px system-ui, sans-serif'; ctx.fillText(String(pageNumber), PAGE_WIDTH - 48, PAGE_HEIGHT - 25);
    y = 74;
  }
  async function finishPage() {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) throw new Error('PDF 頁面影像生成失敗。');
    images.push(new Uint8Array(await blob.arrayBuffer()));
  }
  async function ensure(height) { if (y + height > PAGE_HEIGHT - 48) { await finishPage(); startPage(); } }
  startPage();
  const sections = archivePdfSections(bundle);
  for (const section of sections) {
    await ensure(58);
    ctx.fillStyle = '#1e5266'; ctx.font = 'bold 14px system-ui, "PingFang TC", sans-serif';
    for (const line of wrap(ctx, section.title, PAGE_WIDTH - 84)) { ctx.fillText(line, 42, y); y += 20; }
    y += 3;
    ctx.fillStyle = '#23313d'; ctx.font = '12px system-ui, "PingFang TC", sans-serif';
    const lines = wrap(ctx, section.body, PAGE_WIDTH - 84);
    for (const line of lines) {
      await ensure(19);
      if (line) ctx.fillText(line, 42, y);
      y += 19;
    }
    y += 15;
  }
  await finishPage();
  return pdfFromJpegs(images);
}
