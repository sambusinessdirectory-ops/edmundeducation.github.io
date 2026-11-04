import { DSE_IMAGE_ENHANCEMENTS } from './dse-listening-image-manifest.mjs?v=20260904-reconstruct3';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Upgrade only known, authored exam illustrations. Question data and originals stay unchanged.
// The page loads compact responsive copies; existing enlargement links open the 4K copy.
export function upgradeDseImages(html) {
  return String(html).replace(/<img\b[^>]*>/gi, tag => {
    const match = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const image = match && DSE_IMAGE_ENHANCEMENTS[match[2]];
    if (!image) return tag;
    const maxWidth = Math.round(Math.min(760, 430 * image.sourceWidth / image.sourceHeight));
    return tag.replace(/\s+(?:src|srcset|sizes|loading|decoding)\s*=\s*(["']).*?\1/gi, '')
      .replace(/\s*\/?>$/, ` src="${escape(image.small.src)}" srcset="${escape(image.small.src)} ${image.small.width}w, ${escape(image.preview.src)} ${image.preview.width}w" sizes="(max-width: 650px) min(90vw, ${maxWidth}px), ${maxWidth}px" loading="lazy" decoding="async">`);
  }).replace(/(<a\b[^>]*\bhref\s*=\s*)(["'])(.*?)\2/gi, (tag, prefix, quote, src) => {
    const image = DSE_IMAGE_ENHANCEMENTS[src];
    return image ? `${prefix}${quote}${escape(image.full.src)}${quote}` : tag;
  });
}
