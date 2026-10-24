import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = process.argv[2];
if (!sourceDirectory) {
  console.error('Usage: node tools/verify-idiom-31-108-source-pdfs.mjs <source-PDF-directory>');
  process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'idiom-import-manifest.json'), 'utf8'));
const sources = manifest.sources.filter((source) => source.order >= 31 && source.order <= 108);
assert.equal(sources.length, 78);
let verified = 0;
for (const source of sources) {
  const file = path.join(sourceDirectory, source.sourceFile);
  if (!fs.existsSync(file)) throw new Error(`${source.lessonId}: source PDF missing: ${source.sourceFile}`);
  const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(hash, source.sha256, `${source.lessonId}: source PDF SHA-256 mismatch`);
  verified++;
}
console.log(`${verified}/78 owner source PDFs match the import manifest SHA-256 values.`);
