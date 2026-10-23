#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const base = resolve(repo, 'course-materials/advanced-native');

function digest(manifestName, directory, key) {
  const manifest = JSON.parse(readFileSync(resolve(base, manifestName), 'utf8'));
  const files = manifest[key];
  const hash = createHash('sha256');
  for (const name of files) {
    hash.update(name, 'utf8');
    hash.update('\0');
    hash.update(readFileSync(resolve(base, directory, name)));
    hash.update('\0');
  }
  return {manifest: manifestName, files: files.length, sha256: hash.digest('hex')};
}

console.log(JSON.stringify({
  method: 'sha256(filename UTF-8 + NUL + raw file bytes + NUL, in manifest order)',
  selected: digest('drafts-books10-16/batch-manifest.json', 'drafts-books10-16', 'batchFiles'),
  decisions: digest('books10-16/editorial-decision-manifest.json', 'books10-16', 'decisionFiles'),
}, null, 2));
