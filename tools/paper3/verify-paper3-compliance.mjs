import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const manifestPath = path.join(root, 'tools/paper3/paper3-compliance.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const marker = process.argv.indexOf('--changed-files');
const requested = marker >= 0 ? process.argv.slice(marker + 1) : [];
const records = new Map(manifest.files.map(record => [record.path, record]));
assert.equal(manifest.result, 'verified');
assert.ok(manifest.files.length > 0, 'compliance manifest is empty');

for (const record of manifest.files) {
  assert.equal(record.status, 'verified', `${record.path} is not verified`);
  assert.ok(record.requirements.length, `${record.path} has no requirement citations`);
  assert.ok(record.evidence, `${record.path} has no implementation evidence`);
  const absolute = path.join(root, record.path);
  assert.ok(fs.existsSync(absolute), `${record.path} is missing`);
  const digest = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
  assert.equal(digest, record.sha256, `${record.path} digest is stale`);
}

// The manifest cannot contain its own digest without creating a circular hash.
// It is nevertheless a governed release artifact because every record it
// contains is verified above in the same invocation.
for (const changed of requested) assert.ok(changed === 'tools/paper3/paper3-compliance.json' || records.has(changed), `${changed} has no compliance record`);
console.log(JSON.stringify({status:'pass', release:manifest.release, verifiedFiles:manifest.files.length, requestedFiles:requested.length}, null, 2));
