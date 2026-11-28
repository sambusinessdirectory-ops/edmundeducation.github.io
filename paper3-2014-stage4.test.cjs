const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const origin = process.env.CURATION_ORIGIN || 'http://127.0.0.1:8815';
const output = path.join(__dirname, 'outputs/2014-b2-part4/screenshots');
fs.mkdirSync(output, {recursive:true});

(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1920, height:1080}, deviceScaleFactor:1});
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(`${origin}/paper3/2014-b2/index.html?curation=1`, {waitUntil:'networkidle'});
    await page.evaluate(() => localStorage.clear());
    await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage4Version);

    const counts = await page.evaluate(() => Object.fromEntries(Object.entries(window.EDMUND_2014_B2_CURATION_DEBUG.stepsByStage).map(([stage, steps]) => [stage, steps.length])));
    assert.deepEqual(counts, {instruction:47, categorize:20, podcast:21, data:174, writing:237});
    assert.deepEqual(await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.targetAudit), []);
    assert.equal(await page.locator('.curation-stage-item[data-stage="data"]').isEnabled(), true);
    assert.equal(await page.locator('.curation-stage-item[data-stage="writing"]').isEnabled(), true);

    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.setStage('data'));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#curation-step-id').count(), 0, 'internal step IDs must not be rendered');
    assert.equal((await page.locator('.curation-dock').innerText()).includes('STEP ID'), false);
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p11-neelay-email-009'));
    const neelayMetadata = await page.locator('#curation-explanation').innerText();
    assert.equal(neelayMetadata.includes('來源 11/11'), false, 'generated source-order metadata must not be shown');
    assert.equal(neelayMetadata.includes('Neelay Shah（AFCD） → Kerry Lam'), false, 'generated writer/reader metadata must not be shown');
    assert.equal(neelayMetadata.includes('recent AFCD open day 之後'), false, 'generated source-date metadata must not be shown');
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p04-online-today-001'));
    const first = await page.evaluate(() => ({
      step:window.EDMUND_2014_B2_CURATION_DEBUG.getState().stepId,
      visibleSourceBars:[...document.querySelectorAll('.curation-stage4-source-bar')].filter(node => !node.hidden).length,
      readerWidth:document.querySelector('#reader').getBoundingClientRect().width,
      writingDisabled:document.querySelector('.curation-stage-item[data-stage="writing"]').disabled
    }));
    assert.equal(first.step, 'p04-online-today-001');
    assert.equal(first.visibleSourceBars, 1);
    assert(first.readerWidth >= 900, `wide reader expected, got ${first.readerWidth}`);
    assert.equal(first.writingDisabled, false);
    await page.screenshot({path:path.join(output, 'stage4-first-source.png'), fullPage:false});

    const middleId = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.stepsByStage.data[86].id);
    await page.evaluate(id => window.EDMUND_2014_B2_CURATION_DEBUG.goById(id), middleId);
    await page.waitForTimeout(100);
    const middle = await page.evaluate(() => ({
      position:window.EDMUND_2014_B2_CURATION_DEBUG.getState().position,
      visibleMarks:document.querySelectorAll('.curation-stage4-mark.is-revealed').length,
      bankCounts:[...document.querySelectorAll('.curation-task-map section:not([hidden]) strong')].map(node => Number(node.textContent)),
      futureVisible:[...document.querySelectorAll('.curation-stage4-mark.is-revealed')].some(mark => (mark.dataset.stepIds || '').split(',').every(id => window.EDMUND_2014_B2_CURATION_DEBUG.stepsByStage.data.find(item => item.id === id)?.index > 86))
    }));
    assert.equal(middle.position, 86);
    assert(middle.visibleMarks > 30);
    assert.equal(middle.futureVisible, false);
    assert(middle.bankCounts.reduce((sum, count) => sum + count, 0) > 20);
    await page.screenshot({path:path.join(output, 'stage4-middle-evidence-bank.png'), fullPage:false});

    const noiseId = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.evidenceLedger.find(record => record.type === 6 && record.targetKind === 'text').id);
    await page.evaluate(id => window.EDMUND_2014_B2_CURATION_DEBUG.goById(id), noiseId);
    const noise = await page.evaluate(id => {
      const mark = [...document.querySelectorAll('.curation-stage4-mark.is-current')].find(node => (node.dataset.stepIds || '').split(',').includes(id));
      return {type:mark?.dataset.type, noise:mark?.classList.contains('curation-stage4-mark-noise'), decoration:mark ? getComputedStyle(mark).textDecorationLine : ''};
    }, noiseId);
    assert.deepEqual(noise, {type:'6', noise:true, decoration:'line-through'});

    const contentId = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.evidenceLedger.find(record => [1,2,3].includes(record.type) && record.targetKind === 'text').id);
    await page.evaluate(id => window.EDMUND_2014_B2_CURATION_DEBUG.goById(id), contentId);
    const contentDecoration = await page.evaluate(id => {
      const mark = [...document.querySelectorAll('.curation-stage4-mark.is-current')].find(node => (node.dataset.stepIds || '').split(',').includes(id));
      return mark ? getComputedStyle(mark).textDecorationLine : 'missing';
    }, contentId);
    assert.notEqual(contentDecoration, 'line-through');

    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p09-squeers-letter-011'));
    await page.locator('[data-detour-id="p09-squeers-letter-011"]').click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.curation-stage4-detour-target').count(), 1);
    assert.equal(await page.locator('[data-return-stage4="p09-squeers-letter-011"]').isVisible(), true);
    await page.screenshot({path:path.join(output, 'stage4-source-detour.png'), fullPage:false});
    await page.locator('[data-return-stage4="p09-squeers-letter-011"]').click();
    assert.equal(await page.locator('.curation-stage4-detour-target').count(), 0);

    const beforeBack = await page.locator('.curation-stage4-mark.is-revealed').count();
    await page.locator('#curation-prev').click();
    const afterBack = await page.locator('.curation-stage4-mark.is-revealed').count();
    assert(afterBack <= beforeBack, 'Back must never reveal future marks');

    const bankButton = page.locator('.curation-evidence-jump').last();
    const bankTarget = await bankButton.getAttribute('data-evidence-id');
    await bankButton.click();
    assert.equal((await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().stepId)), bankTarget);

    const lastId = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.stepsByStage.data.at(-1).id);
    await page.evaluate(id => window.EDMUND_2014_B2_CURATION_DEBUG.goById(id), lastId);
    await page.locator('#curation-next').click();
    const finalState = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState());
    assert(finalState.completedStages.includes('data'));
    assert.equal(finalState.completed.data.length, 174);
    assert.equal(await page.locator('.curation-stage-item[data-stage="writing"]').isEnabled(), true);
    await page.screenshot({path:path.join(output, 'stage4-final-all-sources.png'), fullPage:false});

    await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage4Version);
    const restored = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState());
    assert.equal(restored.currentStage, 'writing');
    assert.equal(restored.stepId, 'writing-A-0');
    assert(restored.completedStages.includes('data'));

    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.setStage('podcast'));
    const transcriptAudit = await page.evaluate(() => ({
      rows:document.querySelectorAll('.curation-transcript-row').length,
      translated:[...document.querySelectorAll('.curation-transcript-translation')].every(node => node.lang === 'zh-Hant' && node.textContent.trim().length > 0)
    }));
    assert(transcriptAudit.rows > 0);
    assert.equal(transcriptAudit.translated, true);
    const fifthEnd = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.cueLedger[4].sourceEnd);
    await page.evaluate(time => {
      const audio = window.EDMUND_2014_B2_CURATION_DEBUG.getAudio();
      audio.pause(); audio.currentTime = time; audio.dispatchEvent(new Event('seeked'));
    }, fifthEnd);
    await page.waitForTimeout(50);
    const forwardAudio = await page.evaluate(() => ({
      heard:window.EDMUND_2014_B2_CURATION_DEBUG.getState().heard.length,
      transcript:document.querySelectorAll('.curation-transcript-row.is-revealed').length,
      generatedNotes:[...document.querySelectorAll('[data-curation-field]')].reduce((count, field) => count + field.value.split('\n').filter(Boolean).length, 0)
    }));
    assert(forwardAudio.heard >= 5);
    assert(forwardAudio.transcript > 0);
    assert(forwardAudio.generatedNotes > 0);
    const segmentStart = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.audio.segmentStart);
    await page.evaluate(time => {
      const audio = window.EDMUND_2014_B2_CURATION_DEBUG.getAudio();
      audio.currentTime = time; audio.dispatchEvent(new Event('seeked'));
    }, segmentStart);
    await page.waitForTimeout(50);
    const backwardAudio = await page.evaluate(() => ({
      heard:window.EDMUND_2014_B2_CURATION_DEBUG.getState().heard.length,
      transcript:document.querySelectorAll('.curation-transcript-row.is-revealed').length,
      generatedNotes:[...document.querySelectorAll('[data-curation-field]')].reduce((count, field) => count + field.value.split('\n').filter(Boolean).length, 0)
    }));
    assert.equal(backwardAudio.heard, 0);
    assert.equal(backwardAudio.transcript, 0);
    assert.equal(backwardAudio.generatedNotes, 0);

    for (const width of [1440, 1600, 2560]) {
      await page.setViewportSize({width, height:1000});
      await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.setStage('data'));
      const readerWidth = await page.locator('#reader').evaluate(node => node.getBoundingClientRect().width);
      assert(readerWidth >= 680, `${width}px viewport produced an overly narrow ${readerWidth}px reader`);
    }

    await page.setViewportSize({width:390, height:844});
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p04-online-today-001'));
    await page.waitForTimeout(50);
    const mobile = await page.evaluate(() => ({
      overflow:document.documentElement.scrollWidth - innerWidth,
      overflowMode:getComputedStyle(document.documentElement).overflowX,
      dockBottom:document.querySelector('.curation-dock').getBoundingClientRect().bottom,
      targetBottom:document.querySelector('.curation-target').getBoundingClientRect().bottom,
      targetTop:document.querySelector('.curation-target').getBoundingClientRect().top
    }));
    assert.equal(mobile.overflowMode, 'clip');
    assert(mobile.targetBottom > mobile.dockBottom, 'mobile source must remain visible below the teaching panel');
    assert.equal(await page.locator('.curation-mobile-evidence-bank').isVisible(), true);
    await page.screenshot({path:path.join(output, 'stage4-mobile.png'), fullPage:false});

    await page.setViewportSize({width:1920, height:1080});
    await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p11-neelay-email-011'));
    assert.equal(await page.locator('#page-11 .reference-scan').evaluate(node => node.open), true, 'scan-only records must open their explicit native scan target');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.curation-dock').evaluate(node => getComputedStyle(node).display), 'none');
    assert.equal(await page.locator('.curation-stage4-source-bar').first().evaluate(node => getComputedStyle(node).display), 'none');
    await page.emulateMedia({media:'screen'});
    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({status:'pass', counts, screenshots:fs.readdirSync(output).sort(), pageErrors}, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
