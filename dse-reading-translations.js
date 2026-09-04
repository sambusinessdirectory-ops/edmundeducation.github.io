/* Shared source inventory for the protected DSE translation payload. */
(function (root) {
  'use strict';
  const textKeys = new Set(['title', 'sourceLabel', 'sourceHeading', 'sourceNote', 'label', 'text', 'prompt', 'context', 'optionBank', 'caption', 'alt', 'placeholder']);
  const excluded = new Set(['id', 'year', 'section', 'number', 'key', 'group', 'type', 'value', 'src', 'part', 'parts', 'questionRevision']);
  const copies = new WeakMap();
  function sources(data) {
    const result = [];
    function visit(value, path) {
      if (typeof value === 'string') {
        const key = path.at(-1), parent = path.at(-2);
        const arrayText = ['options', 'optionBank', 'passageNotes'].includes(parent) || (path.includes('rows') && parent !== 'parts');
        const paragraphText = path.length === 3 && path[0] === 'paragraphs' && key === 'text';
        if (paragraphText || ((textKeys.has(key) || parent === 'instructions' || arrayText) && !excluded.has(key) && /[A-Za-z]{2}/.test(value)
          && !/^[\s\d()[\].,:/–—_✓ivxA-E-]+$/.test(value))) {
          result.push({ path: path.join('/'), source: value });
        }
      } else if (Array.isArray(value)) value.forEach((item, index) => visit(item, [...path, String(index)]));
      else if (value && typeof value === 'object') Object.keys(value).forEach(key => {
        if (!key.endsWith('Translation') && key !== 'translation' && key !== 'dseTranslation') visit(value[key], [...path, key]);
      });
    }
    visit(data, []);
    return result;
  }
  function apply(data, content) {
    if (!content || content.schemaVersion !== 1 || content.articleId !== data.id || content.locale !== 'zh-Hant' || !Array.isArray(content.entries)) return false;
    const expected = sources(data);
    if (expected.length !== content.entries.length || !expected.every((item, index) => {
      const entry = content.entries[index];
      return entry?.path === item.path && entry.source === item.source && typeof entry.translation === 'string'
        && entry.translation.trim() && /[\u3400-\u9fff]/u.test(entry.translation) && !/(?:TODO|待翻譯|翻譯待補)/i.test(entry.translation);
    })) return false;
    data.dseTranslation = Object.fromEntries(content.entries.map(entry => [entry.path, entry.translation]));
    content.entries.forEach(entry => {
      const path = entry.path.split('/'), key = path.pop();
      const owner = path.reduce((object, item) => object[item], data);
      if (!copies.has(owner)) copies.set(owner, new Map());
      copies.get(owner).set(key, entry.translation);
    });
    data.paragraphs.forEach((paragraph, index) => { paragraph.translation = data.dseTranslation[`paragraphs/${index}/text`]; });
    return true;
  }
  const get = (object, key) => copies.get(object)?.get(String(key)) || '';
  root.DseReadingTranslations = Object.freeze({ sources, apply, get });
})(globalThis);
