const encoder = new TextEncoder();
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
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
    object(page + 1, `<< /Type /XObject /Subtype /Image /Width ${jpegs[index].width} /Height ${jpegs[index].height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegs[index].bytes.length} >>`, jpegs[index].bytes);
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

// Paginate the same HTML/CSS used by individual exports, then capture one A4
// page at a time. This bounds canvas memory even for long feedback archives.
export async function renderArchivePdf(bundle, {renderHtml, onProgress = () => {}} = {}) {
  if (typeof renderHtml !== 'function') throw new Error('未能載入統一 PDF 版面，請重新整理後再試。');
  const frame = document.createElement('iframe');
  frame.title = 'PDF 排版';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-12000px;top:0;width:1000px;height:1200px;border:0;pointer-events:none';
  document.body.append(frame);
  try {
    const doc = frame.contentDocument;
    doc.open(); doc.write(renderHtml(bundle)); doc.close();
    const win = frame.contentWindow;
    doc.querySelector('.print-toolbar')?.remove();
    await doc.fonts.ready;
    // Number badges contain lazy mascot images; offscreen pagination must load
    // them eagerly, just as the individual print window does.
    const sourceImages = [...doc.images];
    sourceImages.forEach(image => { image.loading = 'eager'; });
    let imageTimeout;
    try {
      await Promise.race([
        Promise.all(sourceImages.map(image => image.decode().catch(() => {}))),
        new Promise((_, reject) => { imageTimeout = setTimeout(() => reject(new Error('PDF 圖像載入逾時，請重試。')), 20000); })
      ]);
    } finally { clearTimeout(imageTimeout); }
    const content = doc.querySelector('main').outerHTML;
    const css = [...doc.querySelectorAll('style')].map(style => style.textContent).join('\n')
      .replace(/@media print/g, '@media all');
    doc.body.replaceChildren();
    win.PagedConfig = {auto: false};
    async function library(path) {
      await new Promise((resolve, reject) => {
        const script = doc.createElement('script');
        script.src = new URL(path, location.href).href;
        script.onload = resolve;
        script.onerror = () => reject(new Error('PDF 排版工具載入失敗，請重試。'));
        doc.head.append(script);
      });
    }
    await library('vendor/pagedjs/paged.polyfill.js');
    await library('vendor/html2canvas/html2canvas.min.js');
    // Paged.js owns page margins and forced section breaks from the print CSS.
    const preview = new win.Paged.Previewer();
    preview.chunker.hooks.afterPageLayout.register(() => {
      if (preview.chunker.pages.length > 250) throw new Error('文章或評語超出 250 頁上限。');
    });
    await preview.preview(content, [{[new URL('writing-export.css', location.href).href]: css}], doc.body);
    const pages = [...doc.querySelectorAll('.pagedjs_page')];
    if (!pages.length || pages.length > 250) throw new Error('PDF 頁數無效或超出 250 頁上限。');
    const images = [];
    for (const [index, page] of pages.entries()) {
      onProgress(index + 1, pages.length);
      const canvas = await win.html2canvas(page, {scale: 2, backgroundColor: '#fff', logging: false, useCORS: true, windowWidth: 1000});
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) throw new Error('PDF 頁面影像生成失敗。');
      images.push({bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height});
      canvas.width = 0; canvas.height = 0;
    }
    return pdfFromJpegs(images);
  } finally { frame.remove(); }
}
