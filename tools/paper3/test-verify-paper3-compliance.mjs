import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const verifier = path.join(root, 'tools/paper3/verify-paper3-compliance.mjs');
const run = args => spawnSync(process.execPath, [verifier, ...args], {
  cwd: root,
  encoding: 'utf8'
});

const clean = run([]);
assert.equal(clean.status, 0, clean.stderr || clean.stdout);
assert.match(clean.stdout, /Paper 3 governance valid/);

const probe = path.join(os.tmpdir(), `paper3-compliance-probe-${process.pid}.txt`);
try {
  fs.writeFileSync(probe, [
    'paper3/__compliance_probe__.js',
    'docs/paper3/PAPER3_COMPLIANCE_REPORT.md',
    'tools/paper3/paper3-compliance.json'
  ].join('\n'));
  const blocked = run(['--changed-files', probe]);
  assert.notEqual(blocked.status, 0, 'an implementation change without complete evidence must fail');
  assert.match(blocked.stderr, /line-by-line reference|missing implementation evidence|implementation changes are blocked/);
} finally {
  fs.rmSync(probe, {force: true});
}

console.log('Paper 3 compliance verifier accepts governance and fails closed on unevidenced implementation changes.');
