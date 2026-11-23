import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.CURATION_OUTPUT_DIR || path.join(root, 'test-results/2016-b2-part3');
fs.mkdirSync(output, {recursive: true});
const requireRuntime = createRequire(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'));
const {chromium, firefox} = requireRuntime('playwright');
const mime = new Map([
  ['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],
  ['.mp3','audio/mpeg'],['.webp','image/webp'],['.png','image/png'],['.svg','image/svg+xml']
]);

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  let file = path.join(root, pathname);
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return response.writeHead(404).end('Not found');
  const stat = fs.statSync(file);
  response.setHeader('Accept-Ranges', 'bytes');
  response.setHeader('Content-Type', mime.get(path.extname(file)) || 'application/octet-stream');
  const range = request.headers.range;
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
    if (!match || start > end || start >= stat.size) return response.writeHead(416, {'Content-Range': `bytes */${stat.size}`}).end();
    response.writeHead(206, {'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1});
    return fs.createReadStream(file, {start, end}).pipe(response);
  }
  response.setHeader('Content-Length', stat.size);
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/paper3/2016-b2/?curation=1`;

async function openStage3(browserType, name, full = false) {
  const browser = await browserType.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const page = await context.newPage();
  const errors = [];
  const networkIssues = [];
  const harmlessRelayCookieWarning = text => text.includes('__cf_bm') && text.includes('invalid domain');
  page.on('pageerror', error => { if (!harmlessRelayCookieWarning(error.message)) errors.push(error.message); });
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:') && !harmlessRelayCookieWarning(message.text())) errors.push(message.text());
  });
  page.on('response', response => { if (response.status() >= 400) networkIssues.push(`${response.status()} ${response.url()}`); });
  try {
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await page.locator('#curation-title').waitFor();
    await page.waitForFunction(() => Boolean(window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG));
    assert.equal(await page.locator('.curation-stage-item[data-stage="podcast"]').isDisabled(), false, `${name}: Stage 3 must be directly accessible`);
    await page.locator('.curation-stage-item[data-stage="podcast"]').click();
    await page.waitForFunction(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG?.getState().active === true);
    const contract = await page.evaluate(() => ({
      steps: window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.steps.length,
      fields: window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.fields.length,
      cues: window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.cues.length,
      transcript: window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.transcript.length,
      options: document.querySelectorAll('#curation-step-jump option').length,
      disabledOptions: document.querySelectorAll('#curation-step-jump option:disabled').length,
      nativeFields: document.querySelectorAll('#page-3 textarea.curation-native-note-field').length,
      evidencePanels: document.querySelectorAll('#page-3 .curation-notes-evidence').length,
      pins: document.querySelectorAll('#curation-player-pins-2016 .curation-player-pin').length,
      transcriptRows: document.querySelectorAll('.curation-transcript-turn').length,
      disabledStages: [...document.querySelectorAll('.curation-stage-item:disabled')].map(node => node.dataset.stage),
      title: document.querySelector('#page-3 .conference-notes > h2').textContent.trim(),
      badges: [...document.querySelectorAll('#page-3 .curation-stage3-heading-state')].map(node => node.textContent),
      audioSrc: document.querySelector('#curation-player-2016 audio').getAttribute('src')
    }));
    assert.deepEqual(contract, {
      steps:61, fields:4, cues:13, transcript:44, options:61, disabledOptions:0,
      nativeFields:4, evidencePanels:4, pins:13, transcriptRows:44,
      disabledStages:['data','writing'], title:'Listening note-taking sheet for podcast Nosing Around',
      badges:['不取材','B','不取材','A'], audioSrc:'https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/public-audio-relay/DSE%20Listening%20-%20Recordings/DSE%202016%20Part%20B.mp3'
    }, `${name}: Stage 3 DOM contract`);
    assert.equal(contract.title.includes('?'), false, `${name}: podcast title must not have question mark`);
    assert.equal(await page.locator('#page-4 .curation-file-stamp:not([hidden])').count(), 0, `${name}: boss letter must not have a stamp`);
    assert.equal((await page.locator('body').innerText()).includes('你會先標哪個任務？'), false);

    if (!full) {
      await page.locator('.curation-transcript-translate').click();
      assert.equal(await page.locator('.curation-transcript-window').getAttribute('class').then(value => value.includes('show-translation')), true);
      assert.equal(errors.length, 0, `${name}: ${errors.join('\n')}`);
      assert.equal(networkIssues.length, 0, `${name}: ${networkIssues.join('\n')}`);
      return {page, context, browser, errors, networkIssues};
    }

    await page.locator('textarea[data-note="3-1"]').fill('Learner-authored line');
    await page.evaluate(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.goById('p3-cue-museum-purpose'));
    await page.waitForFunction(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.audio.readyState >= 1);
    await page.evaluate(async () => {
      const debug = window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG;
      debug.audio.currentTime = 496.55;
      await debug.audio.play();
    });
    await page.waitForFunction(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.transactionLog.some(item => item.cueId === 'museum-purpose'), null, {timeout: 10000});
    await page.waitForFunction(() => document.querySelector('textarea[data-note="3-1"]').value.includes('Visitors experience daily life'), null, {timeout: 10000});
    const firstNote = await page.locator('textarea[data-note="3-1"]').inputValue();
    assert.match(firstNote, /^Learner-authored line/m);
    assert.equal((firstNote.match(/Visitors experience daily life/g) || []).length, 1);

    await page.evaluate(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.commitCue('museum-purpose'));
    await page.waitForTimeout(500);
    const replayed = await page.locator('textarea[data-note="3-1"]').inputValue();
    assert.equal((replayed.match(/Visitors experience daily life/g) || []).length, 1, 'replay must not duplicate generated note');

    await page.locator('.curation-player-seek').evaluate(node => {
      node.value = '400';
      node.dispatchEvent(new Event('change', {bubbles:true}));
    });
    const rewound = await page.locator('textarea[data-note="3-1"]').inputValue();
    assert.equal(rewound, 'Learner-authored line', 'rewind removes future generated notes and preserves authored text');

    await page.selectOption('#curation-step-jump', 'p3-review-part-b-turn-42');
    assert.match(await page.locator('#curation-step-id').innerText(), /p3-review-part-b-turn-42/);
    const selective = await page.evaluate(() => ({
      taskSpans: document.querySelectorAll('[data-transcript-index="41"] .curation-transcript-inline-task-A').length,
      wholeBackground: getComputedStyle(document.querySelector('[data-transcript-index="41"] .curation-transcript-copy')).backgroundColor,
      strikes: document.querySelectorAll('[data-transcript-index="39"] .curation-transcript-copy').length
    }));
    assert.equal(selective.taskSpans, 2);
    assert.equal(selective.wholeBackground, 'rgba(0, 0, 0, 0)', 'task rows must not be coloured word-for-word');
    assert.equal(selective.strikes, 1);
    await page.locator('.curation-transcript-translate').click();
    assert.equal(await page.locator('[data-transcript-index="41"] .curation-transcript-translation').isVisible(), true);

    const before = await page.locator('.curation-transcript-window').boundingBox();
    const head = await page.locator('.curation-transcript-window-head').boundingBox();
    await page.mouse.move(head.x + 30, head.y + 20);
    await page.mouse.down();
    await page.mouse.move(head.x - 55, head.y + 55, {steps:5});
    await page.mouse.up();
    const moved = await page.locator('.curation-transcript-window').boundingBox();
    assert.notEqual(Math.round(moved.x), Math.round(before.x));
    const handle = await page.locator('.curation-resize-se').boundingBox();
    await page.mouse.move(handle.x + 10, handle.y + 10);
    await page.mouse.down();
    await page.mouse.move(handle.x + 55, handle.y + 45, {steps:5});
    await page.mouse.up();
    const resized = await page.locator('.curation-transcript-window').boundingBox();
    assert.ok(resized.width > moved.width || resized.height > moved.height);

    await page.locator('.curation-player-pins-toggle').click();
    await page.locator('#curation-bookmark').click();
    await page.screenshot({path: path.join(output, '2016-b2-stage3-transcript-selective.png'), fullPage:false});
    const persistedStep = (await page.evaluate(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.getState())).stepId;
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG?.getState().active === true);
    const restored = await page.evaluate(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.getState());
    assert.equal(restored.stepId, persistedStep);
    assert.equal(restored.transcriptTranslation, true);
    assert.equal(restored.pinsShown, true);
    assert.equal(restored.bookmarks.includes(persistedStep), true);
    assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), 'Learner-authored line');

    await page.locator('.curation-stage-item[data-stage="categorize"]').click();
    await page.waitForFunction(() => window.EDMUND_2016_B2_CURATION_STAGE2_DEBUG?.getState().active === true);
    assert.equal((await page.evaluate(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.getState())).active, false);
    await page.locator('.curation-stage-item[data-stage="podcast"]').click();
    await page.waitForFunction(() => window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG?.getState().active === true);
    assert.equal(await page.locator('.curation-player').isVisible(), true);

    await page.setViewportSize({width: 390, height: 844});
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.curation-player').isVisible(), true);
    assert.equal(await page.locator('.curation-transcript-window').isVisible(), true);
    const mobileBoxes = {
      rail: await page.locator('.curation-stage').boundingBox(),
      player: await page.locator('.curation-player').boundingBox(),
      transcript: await page.locator('.curation-transcript-window').boundingBox()
    };
    assert.ok(mobileBoxes.rail.y < 20 && mobileBoxes.player.y < 120 && mobileBoxes.transcript.y < 190, JSON.stringify(mobileBoxes));
    await page.screenshot({path: path.join(output, '2016-b2-stage3-mobile.png'), fullPage:false});
    assert.equal(errors.length, 0, `${name}: ${errors.join('\n')}`);
    assert.equal(networkIssues.length, 0, `${name}: ${networkIssues.join('\n')}`);
    return {page, context, browser, errors, networkIssues};
  } catch (error) {
    await browser.close();
    throw error;
  }
}

let chromiumRun;
let firefoxRun;
try {
  chromiumRun = await openStage3(chromium, 'Chromium', true);
  await chromiumRun.browser.close();
  firefoxRun = await openStage3(firefox, 'Firefox', false);
  await firefoxRun.browser.close();
  fs.writeFileSync(path.join(output, '2016-b2-stage3-browser-test-report.md'), `# 2016 B2 Stage 3 browser test report

- Result: **PASS**
- Chromium: full lifecycle, real MP3 endpoint, native-note commit, replay idempotency, rewind preservation, selective transcript colour, translation, move/resize, persistence, Stage 2 switch and mobile layout
- Firefox: direct Stage 3 entry, 4/13/44/61 DOM contract, free steps, Chinese transcript toggle, and zero console/network failures
- Stages 4–5: remained disabled
- Boss-letter stamp: absent
- Podcast heading question mark: absent
`);
  console.log('2016 B2 Super Curation Stage 3 browser regression: PASS (Chromium + Firefox)');
} finally {
  await new Promise(resolve => server.close(resolve));
}
