const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const assets = [
  'correct-answer-pop.mp3', 'eddy-pyjama-night.mp3', 'elsie-loading.mp3',
  'homepage-dialogue-next.mp3', 'homepage-morning-music.mp3',
  'mc-finally-correct.mp3', 'homework-two-days-incomplete.mp3',
  'wrong-login.mp3', 'homework-slot-click.mp3',
  'homepage-card-open.mp3', 'public-announcement.mp3'
];
for (const asset of assets) assert.ok(fs.statSync(path.join(root, 'assets/sfx', asset)).size > 1000, `${asset} is present`);
const pagesKeepList = read('tools/pages-media-saved-links.txt');
for (const asset of assets) assert.match(pagesKeepList, new RegExp(`^assets/sfx/${asset}$`, 'm'), `${asset} is preserved in Pages`);

const shared = read('shared-learning-tools.js');
assert.match(shared, /correct-answer-pop\.mp3/);
assert.match(shared, /mcWrongAttempts>=3/);
assert.match(shared, /mc-finally-correct\.mp3/);
assert.match(read('spelling-practice.js'), /correct-answer-pop\.mp3/);
assert.match(read('song-appreciation.js'), /correct-answer-pop\.mp3/);
assert.match(read('professional-english/synonyms-practice.mjs'), /mc-finally-correct.*correct-answer-pop/s);

const dialogues = read('eddy-global-dialogues.js');
assert.match(dialogues, /next\.kind === 'bedtime'.*eddy-pyjama-night\.mp3/s);
assert.match(dialogues, /factPageIndex \+= 1;\s*playEffect\('\/assets\/sfx\/homepage-dialogue-next\.mp3'\)/);

assert.match(read('homepage-loading.js'), /variant === 'elsie'.*elsie-loading\.mp3/s);
assert.match(read('eddy-schedule-incomplete-dialogue.js'), /days === 2.*homework-two-days-incomplete\.mp3/s);

const soundscape = read('homepage-soundscape.js');
assert.match(soundscape, /hour >= 8 && hour < 12/);
assert.match(soundscape, /fadeDuration = 2000/);
assert.match(soundscape, /edmund:eddy-global-dialogue-finished/);
assert.match(soundscape, /music\.loop = true/);
assert.match(soundscape, /pointerdown.*a\.category.*homepage-card-open\.mp3/s);

const nav = read('shared-system-nav.js');
assert.match(nav, /Safari on iPhone\/iPad/);
assert.match(nav, /touchend/);
assert.match(nav, /wrong-login\.mp3/);
assert.match(read('schedule-system.js'), /data-slot-date.*homework-slot-click\.mp3/s);
assert.match(read('site-announcements.js'), /public-announcement\.mp3/);

console.log('Sound-effect contract checks passed.');
