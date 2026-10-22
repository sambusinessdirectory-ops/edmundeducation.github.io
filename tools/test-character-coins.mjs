import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { selectedCompanion, selectCompanion } from '../shared-companion.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const characters = ['eddy', 'phoebe', 'elsie', 'noir', 'celeste'];
const nav = readFileSync(join(root, 'shared-system-nav.js'), 'utf8');

test('every selectable map companion has a usable coin asset', () => {
  for (const character of characters) {
    const version = character === 'eddy' ? 'v3' : 'v1';
    const file = join(root, 'assets', 'edmund-coins', `${character}-${version}.webp`);
    const header = readFileSync(file).subarray(0, 12);
    assert.equal(header.toString('ascii', 0, 4), 'RIFF', file);
    assert.equal(header.toString('ascii', 8, 12), 'WEBP', file);
    assert.ok(statSync(file).size < 100_000, `${file} should be lightweight`);
  }
  assert.match(nav, /eddy-v3\.webp/);
  assert.match(nav, /\$\{character\}-\$\{character === "eddy" \? "v3" : "v1"\}/);
});

test('selecting a map companion persists and announces the change', () => {
  const entries = new Map();
  const storage = {
    get length() { return entries.size; },
    key(index) { return [...entries.keys()][index]; },
    getItem(key) { return entries.get(key) ?? null; },
    setItem(key, value) { entries.set(key, value); }
  };
  const oldEvent = globalThis.CustomEvent;
  const oldDispatch = globalThis.dispatchEvent;
  let announced;
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  globalThis.dispatchEvent = event => { announced = event; };
  try {
    for (const character of characters) {
      assert.equal(selectCompanion('student-1', character, storage), true);
      assert.equal(selectedCompanion('student-1', storage), character);
      assert.equal(announced.type, 'edmund-companion-change');
      assert.equal(announced.detail.character, character);
    }
  } finally {
    globalThis.CustomEvent = oldEvent;
    globalThis.dispatchEvent = oldDispatch;
  }
});

test('pages request the current shared navigation assets', () => {
  for (const name of readdirSync(root).filter(name => name.endsWith('.html'))) {
    const html = readFileSync(join(root, name), 'utf8');
    if (html.includes('shared-system-nav.js?v=')) {
      assert.ok(html.includes('shared-system-nav.js?v=20261022-character-coins1'), name);
    }
    if (html.includes('shared-system-nav.css?v=')) {
      assert.ok(html.includes('shared-system-nav.css?v=20261022-character-coins1'), name);
    }
  }
});
