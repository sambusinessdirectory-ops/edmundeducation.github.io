import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const indexPath = 'workers/edmund-public-media/src/media.json';
const indexSource = fs.existsSync(indexPath)
  ? fs.readFileSync(indexPath, 'utf8')
  : execFileSync('git', ['show', `HEAD:${indexPath}`], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
const { entries } = JSON.parse(indexSource);
assert.ok(entries && typeof entries === 'object', 'public-media index entries are required');

const songs = fs.readdirSync('tools/song-content')
  .filter(name => name.endsWith('.json'))
  .map(name => JSON.parse(fs.readFileSync(`tools/song-content/${name}`, 'utf8')));
const published = new Set();
let checked = 0;

for (const song of songs) {
  for (const [field, expectedType] of [['cover_url', 'image/'], ['audio_url', 'audio/']]) {
    assert.ok(song[field], `${song.slug}: ${field} is required`);
    const key = new URL(song[field], 'https://edmundeducation.com/').pathname.replace(/^\//, '');
    assert.ok(key.startsWith('song-media/'), `${song.slug}: unexpected ${field} path ${key}`);
    const entry = entries[key];
    assert.ok(entry, `${song.slug}: ${key} is missing from the public-media index`);
    assert.ok(entry[2] > 5_000, `${song.slug}: ${key} is unexpectedly small`);
    assert.ok(String(entry[3]).startsWith(expectedType), `${song.slug}: ${key} has invalid media type ${entry[3]}`);
    published.add(key);
    checked += 1;
  }
}

assert.equal(checked, songs.length * 2, 'every Song lesson must have cover and audio media');
console.log(`PASS: ${songs.length} Song lessons and ${checked} media references (${published.size} unique) are indexed with valid sizes and types.`);
