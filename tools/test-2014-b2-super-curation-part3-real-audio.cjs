const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const origin = process.env.CURATION_ORIGIN || 'http://127.0.0.1:8815';
const outputDir = path.resolve(__dirname, '../outputs/2014-b2-part3');
fs.mkdirSync(outputDir, {recursive:true});
const close = (a,b,tolerance=.18) => Math.abs(a-b) <= tolerance;

(async () => {
  const browser = await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
  const context = await browser.newContext({viewport:{width:1600,height:1000}});
  const page = await context.newPage();
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') failures.push(`console: ${message.text()}`); });
  try {
    await page.goto(`${origin}/paper3/2014-b2/index.html?curation=1`, {waitUntil:'networkidle'});
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage3Version);
    await page.evaluate(() => {
      window.EDMUND_2014_B2_CURATION_DEBUG.reset();
      window.EDMUND_2014_B2_CURATION_DEBUG.setStage('podcast');
    });
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG.getAudio().readyState >= 1, null, {timeout:30000});
    const metadata = await page.evaluate(() => {
      const debug = window.EDMUND_2014_B2_CURATION_DEBUG;
      const audio = debug.getAudio();
      return {duration:audio.duration, readyState:audio.readyState, src:audio.currentSrc};
    });
    assert(close(metadata.duration, 871.816417, .08), `actual MP3 duration mismatch: ${metadata.duration}`);
    assert.match(metadata.src, /DSE%202014%20Part%20B\.mp3|DSE 2014 Part B\.mp3/);

    await page.locator('#page-3 textarea[data-note="3-5"]').fill('learner-authored line');
    await page.selectOption('.curation-podcast-speed', '3');
    const cues = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.cueLedger);
    const transactions = [];
    for (let index=0; index<cues.length; index++) {
      const cue = cues[index];
      await page.evaluate(id => window.EDMUND_2014_B2_CURATION_DEBUG.playCue(id, true), cue.id);
      const timeout = Math.ceil(((cue.sourceEnd - cue.playbackStart) / 3 + 15) * 1000);
      await page.waitForFunction(id => window.EDMUND_2014_B2_CURATION_DEBUG.getState().heard.includes(id), cue.id, {timeout});
      const transaction = await page.evaluate(id => {
        const debug = window.EDMUND_2014_B2_CURATION_DEBUG;
        const cue = debug.cueLedger.find(item => item.id === id);
        const state = debug.getState();
        const audio = debug.getAudio();
        const field = cue.field ? document.querySelector(`#page-3 textarea[data-note="${cue.field}"]`)?.value : null;
        return {id,playbackStart:cue.playbackStart,sourceStart:cue.sourceStart,sourceEnd:cue.sourceEnd,currentTime:audio.currentTime,paused:audio.paused,field,note:cue.note,destination:cue.field,heard:state.heard.includes(id)};
      }, cue.id);
      assert.equal(transaction.paused, true, `${cue.id}: audio did not pause`);
      assert(close(transaction.currentTime, cue.sourceEnd), `${cue.id}: stopped at ${transaction.currentTime}, expected ${cue.sourceEnd}`);
      if (cue.note) assert.equal(transaction.field.split('\n').filter(line => line === cue.note).length, 1, `${cue.id}: note missing or duplicated`);
      transactions.push(transaction);
      process.stdout.write(`cue ${index + 1}/${cues.length} ${cue.id} @ ${transaction.currentTime.toFixed(2)}\n`);
    }
    const fullState = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState());
    assert.equal(fullState.heard.length, 21);
    assert.equal(fullState.podcast.completedThrough, 20);
    assert.equal(fullState.completedStages.includes('podcast'), true);
    assert.equal((await page.locator('#page-3 textarea[data-note="3-5"]').inputValue()).includes('learner-authored line'), true);
    fs.writeFileSync(path.join(outputDir,'real-audio-cue-transactions.json'), JSON.stringify({metadata,transactions}, null, 2));

    const rates = [0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3];
    const rateChecks = [];
    for (const rate of rates) {
      await page.selectOption('.curation-podcast-speed', String(rate));
      await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.playCue('p3-cue-20-ten-years', true));
      await page.waitForFunction(() => !window.EDMUND_2014_B2_CURATION_DEBUG.getAudio().paused, null, {timeout:5000});
      await page.waitForFunction(() => {
        const debug=window.EDMUND_2014_B2_CURATION_DEBUG, audio=debug.getAudio();
        return audio.paused && Math.abs(audio.currentTime - debug.cueLedger[19].sourceEnd) < .18;
      }, null, {timeout:Math.ceil((8.42/rate+25)*1000)});
      const observed = await page.evaluate(() => ({rate:window.EDMUND_2014_B2_CURATION_DEBUG.getAudio().playbackRate,time:window.EDMUND_2014_B2_CURATION_DEBUG.getAudio().currentTime}));
      assert.equal(observed.rate, rate);
      rateChecks.push(observed);
      process.stdout.write(`rate ${rate}x @ ${observed.time.toFixed(2)}\n`);
    }
    assert.equal((await page.locator('#page-3 textarea[data-note="3-6"]').inputValue()).split('\n').filter(line => line === 'programme has run for 10 years').length, 1);
    assert.deepEqual(failures, []);
    fs.writeFileSync(path.join(outputDir,'real-audio-transactions.json'), JSON.stringify({metadata,transactions,rateChecks}, null, 2));
    await page.screenshot({path:path.join(outputDir,'stage3-complete.png'),fullPage:false});
    console.log(`2014 B2 Stage 3 real-audio contract: PASS cues=${transactions.length} rates=${rateChecks.length}`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode=1; });
