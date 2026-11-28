const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const origin = process.env.CURATION_ORIGIN || 'http://127.0.0.1:8815';
const outputDir = path.resolve(__dirname, '../outputs/2014-b2-part3');
fs.mkdirSync(outputDir, {recursive:true});

(async () => {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1600,height:1000}, reducedMotion:'reduce'});
  const page = await context.newPage();
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') failures.push(`console: ${message.text()}`); });
  try {
    await page.goto(`${origin}/paper3/2014-b2/index.html?curation=1`, {waitUntil:'networkidle'});
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage3Version);
    assert.equal(await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.stage3Version), '2014-b2-super-curation-stage3-v1');
    assert.equal(await page.locator('.curation-stage-item[data-stage="instruction"]').isEnabled(), true);
    assert.equal(await page.locator('.curation-stage-item[data-stage="categorize"]').isEnabled(), true);
    assert.equal(await page.locator('.curation-stage-item[data-stage="podcast"]').isEnabled(), true);
    assert.equal(await page.locator('.curation-stage-item[data-stage="data"]').isEnabled(), true, 'Stage 4 is released while Stage 3 remains freely available');
    assert.equal(await page.locator('.curation-stage-item[data-stage="writing"]').isEnabled(), true, 'Stage 5 is released while Stage 3 remains freely available');

    await page.locator('.curation-stage-item[data-stage="podcast"]').click();
    await page.locator('#curation-podcast-player').waitFor({state:'visible'});
    await page.locator('#curation-podcast-transcript').waitFor({state:'visible'});
    assert.equal(await page.locator('.curation-podcast-pin').count(), 21);
    assert.equal(await page.locator('.curation-transcript-row').count(), 77);
    assert.equal(await page.locator('#curation-step-jump option').count(), 21);
    assert.equal(await page.locator('#curation-next').isEnabled(), true, 'free browsing must not be blocked by unheard cues');
    assert.equal(await page.locator('.curation-transcript-zh').isDisabled(), false);
    assert.equal(await page.locator('.curation-transcript-translation:visible').count(), 77, 'all transcript turns need visible Traditional Chinese translations');
    assert.match(await page.locator('.curation-transcript-row[data-turn-id="p3-turn-31"] .curation-transcript-translation').innerText(), /蜜袋鼯/);
    assert.match(await page.locator('#curation-title').innerText(), /定義/);
    assert.match(await page.locator('#curation-explanation').innerText(), /原始五頁錄音稿遺漏/);

    await page.locator('#page-3 textarea[data-note="3-1"]').fill('my own note');
    await page.locator('#page-3 textarea[data-note="3-2"]').fill('learner reason');
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG.getAudio().readyState >= 1);
    await page.locator('.curation-podcast-seek').evaluate((seek) => {
      seek.value = '518';
      seek.dispatchEvent(new Event('input', {bubbles:true}));
    });
    assert.match(await page.locator('#page-3 textarea[data-note="3-1"]').inputValue(), /wild animal kept as a pet/);
    const forwardReasons = await page.locator('#page-3 textarea[data-note="3-2"]').inputValue();
    assert.match(forwardReasons, /learner reason/);
    assert.match(forwardReasons, /want an unusual/);
    assert.match(forwardReasons, /impress friends/);
    const impressMark = page.locator('.curation-podcast-source-phrase', {hasText:'impress their friends'});
    assert.equal(await impressMark.evaluate(node => getComputedStyle(node, '::after').content), 'none', 'a content point must not receive a red strike');
    assert.equal(await page.locator('.curation-transcript-row.is-revealed .curation-podcast-noise').count() > 0, true, 'revealed non-point wording must receive red strike markup');
    const reasonsHeading = page.locator('#page-3 h3', {hasText:'Reasons to have an exotic pet'});
    assert.equal((await reasonsHeading.evaluate(node => getComputedStyle(node.querySelector('.curation-subheading-title')).textDecorationLine)).includes('line-through'), false, 'required listening-note headings must not be crossed out');
    assert.equal(await reasonsHeading.locator('.curation-subheading-tag-listening').innerText(), '聆聽筆記');
    await impressMark.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(outputDir, 'stage3-seek-forward.png'), fullPage:false});
    await page.locator('.curation-podcast-seek').evaluate((seek) => {
      seek.value = '500';
      seek.dispatchEvent(new Event('input', {bubbles:true}));
    });
    assert.equal(await page.locator('#page-3 textarea[data-note="3-2"]').inputValue(), 'learner reason', 'backward seek must remove later generated notes but preserve learner text');
    assert.match(await page.locator('#page-3 textarea[data-note="3-1"]').inputValue(), /wild animal kept as a pet/);
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.completeCueForTest('p3-cue-01-definition'));
    const fieldValue = await page.locator('#page-3 textarea[data-note="3-1"]').inputValue();
    assert.match(fieldValue, /my own note/);
    assert.match(fieldValue, /wild animal kept as a pet/);
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.completeCueForTest('p3-cue-01-definition'));
    assert.equal((await page.locator('#page-3 textarea[data-note="3-1"]').inputValue()).match(/wild animal kept as a pet/g).length, 1, 'replay must not duplicate generated notes');

    await page.selectOption('#curation-step-jump', 'p3-cue-20-ten-years');
    assert.match(await page.locator('#curation-title').innerText(), /10 年/);
    assert.equal(await page.locator('#curation-next').isEnabled(), true);
    await page.selectOption('#curation-step-jump', 'p3-cue-13-communication');
    assert.equal(await page.locator('.curation-transcript-row.is-source.is-task-A').count() > 0, true);
    assert.equal(await page.locator('.curation-transcript-row.is-source.is-listening-only').count(), 0);

    const playerBox = await page.locator('#curation-podcast-player').boundingBox();
    const transcriptBox = await page.locator('#curation-podcast-transcript').boundingBox();
    assert(playerBox.x >= 0 && playerBox.x + playerBox.width <= 1600 && playerBox.y >= 0 && playerBox.y + playerBox.height <= 1000);
    assert(transcriptBox.x >= 0 && transcriptBox.x + transcriptBox.width <= 1600 && transcriptBox.y >= 0 && transcriptBox.y + transcriptBox.height <= 1000);
    await page.screenshot({path:path.join(outputDir, 'stage3-desktop.png'), fullPage:false});

    await page.setViewportSize({width:2668,height:1400});
    const widePaperBox = await page.locator('#page-3').boundingBox();
    const wideDocumentBox = await page.locator('#page-3 > .native-document').boundingBox();
    const wideDockBox = await page.locator('.curation-dock').boundingBox();
    const wideTaskMapBox = await page.locator('.curation-task-map').boundingBox();
    const wideTranscriptBox = await page.locator('#curation-podcast-transcript').boundingBox();
    assert(widePaperBox.width >= 1200, `wide paper canvas was squeezed to ${widePaperBox.width}px`);
    assert(wideDocumentBox.width >= 890, `wide source document was squeezed to ${wideDocumentBox.width}px`);
    assert(wideDockBox.x + wideDockBox.width < wideDocumentBox.x, 'left dock overlaps the source document');
    assert(wideDocumentBox.x + wideDocumentBox.width < wideTaskMapBox.x, 'task map overlaps the source document');
    assert(wideTaskMapBox.x + wideTaskMapBox.width < wideTranscriptBox.x, 'task map overlaps the transcript');
    await page.screenshot({path:path.join(outputDir, 'stage3-wide-desktop.png'), fullPage:false});

    await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage3Version);
    assert.equal((await page.locator('#page-3 textarea[data-note="3-1"]').inputValue()).includes('my own note'), true, 'learner text must survive reload');
    assert.equal((await page.locator('#page-3 textarea[data-note="3-1"]').inputValue()).match(/wild animal kept as a pet/g).length, 1, 'generated note must survive reload exactly once');

    await page.setViewportSize({width:390,height:844});
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.setStage('podcast'));
    await page.waitForTimeout(100);
    const mobilePlayer = await page.locator('#curation-podcast-player').boundingBox();
    const mobileTranscript = await page.locator('#curation-podcast-transcript').boundingBox();
    assert(mobilePlayer.x >= 0 && mobilePlayer.x + mobilePlayer.width <= 390);
    assert(mobileTranscript.x >= 0 && mobileTranscript.x + mobileTranscript.width <= 390);
    assert(mobileTranscript.y >= 0 && mobileTranscript.y + mobileTranscript.height <= 844);
    await page.screenshot({path:path.join(outputDir, 'stage3-mobile.png'), fullPage:false});

    assert.deepEqual(failures, []);
    console.log('2014 B2 Super Curation Part 3 browser contract: PASS');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
