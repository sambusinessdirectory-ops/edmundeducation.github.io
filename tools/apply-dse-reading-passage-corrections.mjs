import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const corrections = JSON.parse(await readFile(new URL('./dse-reading-passage-corrections.json', import.meta.url), 'utf8'));
for (const [id, correction] of Object.entries(corrections)) {
  const file = new URL(`dse-reading-data/${id}.json`, root);
  const data = JSON.parse(await readFile(file, 'utf8'));
  const questions = JSON.stringify(data.questions);
  if (correction.keepParagraphs) data.paragraphs = data.paragraphs.slice(0, correction.keepParagraphs);
  if (correction.replaceLeading && data.paragraphs.length === correction.originalParagraphCount) {
    const {count, paragraphs} = correction.replaceLeading;
    const imageFields = Object.fromEntries(Object.entries(data.paragraphs[0]).filter(([key]) => ['image', 'images'].includes(key)));
    data.paragraphs = [...paragraphs.map((text, index) => ({...(index === 0 ? imageFields : {}), text})), ...data.paragraphs.slice(count)]
      .map((paragraph, index) => ({...paragraph, number:index + 1, label:`Paragraph ${index + 1}`}));
  }
  if (correction.title) { data.title = correction.title; data.sourceHeading = correction.title; }
  if (correction.sourceHeading) data.sourceHeading = correction.sourceHeading;
  for (const [before, after] of correction.replaceAllText || []) {
    data.paragraphs.forEach(paragraph => { paragraph.text = paragraph.text.replaceAll(before, after); });
  }
  if (correction.paragraphs) {
    const images = data.paragraphs.flatMap(paragraph => [...(paragraph.images || []), ...(paragraph.image ? [paragraph.image] : [])]);
    data.paragraphs = correction.paragraphs.map((text, index) => ({ number: index + 1, label: `Paragraph ${index + 1}`, text }));
    for (const image of images) {
      const anchor = correction.imageAnchors?.[image.src] || correction.imageAfterParagraph;
      assert.ok(data.paragraphs[anchor - 1], `${id}: image anchor missing`);
      (data.paragraphs[anchor - 1].images ||= []).push(image);
    }
  }
  for (const [index, text] of Object.entries(correction.replaceText || {})) data.paragraphs[index].text = text;
  for (const [index, replacements] of Object.entries(correction.textRepairs || {})) {
    for (const [before, after] of replacements) {
      if (after && data.paragraphs[index].text.includes(after)) continue;
      if (data.paragraphs[index].text.includes(before)) data.paragraphs[index].text = data.paragraphs[index].text.replace(before, after);
      else assert.ok(data.paragraphs[index].text.includes(after), `${id}: repair source missing`);
    }
  }
  if (correction.splitBefore && data.paragraphs.length === (correction.originalParagraphCount || 13)) {
    for (const [index, replacements] of Object.entries(correction.replaceStrings || {})) {
      for (const [before, after] of replacements) {
        assert.ok(data.paragraphs[index].text.includes(before), `${id}: expected source fragment missing`);
        data.paragraphs[index].text = data.paragraphs[index].text.replace(before, after);
      }
    }
    data.paragraphs = data.paragraphs.flatMap((paragraph, index) => {
      const markers = correction.splitBefore[index];
      if (!markers) return [paragraph];
      const pieces = [];
      let remaining = paragraph.text;
      for (const marker of Array.isArray(markers) ? markers : [markers]) {
        const offset = remaining.indexOf(marker);
        assert.ok(offset > 0, `${id}: paragraph split marker missing`);
        pieces.push({...(!pieces.length ? paragraph : {}), text:remaining.slice(0, offset).trim()});
        remaining = remaining.slice(offset);
      }
      return [...pieces, {text:remaining}];
    }).map((paragraph, index) => ({...paragraph, number:index + 1, label:`Paragraph ${index + 1}`}));
  }
  for (const [index, label] of Object.entries(correction.headings || {})) data.paragraphs[index].label = label;
  if (correction.removeFooter && data.paragraphs.at(-1).text === correction.removeFooter) data.paragraphs.pop();
  if (correction.sourceNote) data.sourceNote = correction.sourceNote;
  if (correction.passageNotes) data.passageNotes = correction.passageNotes;
  assert.equal(JSON.stringify(data.questions), questions);
  await writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`${id}: ${data.paragraphs.length} verified passage paragraphs; questions unchanged`);
}
