const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.WRITING_QA_BASE || 'http://127.0.0.1:8775';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
    await page.addInitScript(() => {
      sessionStorage.setItem('edmund-writing-submission-session-v1', JSON.stringify({
        token: 'local-test-token', id: 'local-test-student', name: 'Test student', role: 'student'
      }));
      sessionStorage.setItem('edmund-writing-submission-draft-v1:local-test-student', JSON.stringify({
        documentId: '11111111-1111-4111-8111-111111111111',
        topic: 'IELTS chart question',
        answer: '',
        selectedTopicResource: {
          id: 'fill:model-essay-1-ielts-task1-line-graph',
          type: 'fill-blanks',
          label: 'Model Essay 1 - IELTS Task 1 - Line Graph',
          sectionKey: 'ielts-writing',
          questionPrompt: ['IELTS chart question'],
          questionImages: [{
            src: 'assets/writing-practice/questions/ielts-task1/model-essay-1-ielts-task1-line-graph.webp',
            alt: 'IELTS line graph'
          }]
        }
      }));
    });
    await page.route('**/v1/**', route => {
      const pathname = new URL(route.request().url()).pathname;
      const body = pathname.endsWith('/student/me')
        ? { student: { id: 'local-test-student', name: 'Test student', access: { 'ielts-writing': true } } }
        : pathname.endsWith('/preferences')
          ? { preferences: { grammarDetectionEnabled: false } }
          : {};
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(`${base}/writing-submission.html`);
    const editor = page.locator('[data-writing-input]');
    await editor.waitFor({ state: 'visible' });
    await editor.scrollIntoViewIfNeeded();
    const dock = page.locator('[data-writing-image-dock]');
    await dock.waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
    assert.equal(await dock.evaluate(node => node.parentElement === document.body), true);
    assert.equal(await page.locator('[data-writing-image-photo]').evaluate(node => node.complete && node.naturalWidth > 0), true);

    for (let move = 0; move < 2; move += 1) {
      const header = await page.locator('[data-writing-image-drag]').boundingBox();
      const before = await dock.boundingBox();
      await page.mouse.move(header.x + 28, header.y + header.height / 2);
      await page.mouse.down();
      await page.mouse.move(header.x - 72, header.y - 55, { steps: 8 });
      await page.mouse.up();
      const after = await dock.boundingBox();
      assert.ok(after.x < before.x - 80, `drag ${move + 1} moved the dock left`);
      assert.ok(after.x >= 7 && after.y >= 7 && after.x + after.width <= 1181 && after.y + after.height <= 801);
      assert.equal(await dock.isVisible(), true);
    }

    const corner = await page.locator('[data-writing-image-resize="se"]').boundingBox();
    const beforeResize = await dock.boundingBox();
    await page.mouse.move(corner.x + corner.width / 2, corner.y + corner.height / 2);
    await page.mouse.down();
    await page.mouse.move(corner.x + corner.width / 2 + 50, corner.y + corner.height / 2 + 30, { steps: 6 });
    await page.mouse.up();
    const afterResize = await dock.boundingBox();
    assert.ok(afterResize.width > beforeResize.width + 40 && afterResize.height > beforeResize.height + 20,
      JSON.stringify({ beforeResize, afterResize, corner }));
    assert.equal(await dock.isVisible(), true);

    await page.evaluate(() => {
      const input = document.querySelector('[data-writing-input]');
      window.scrollTo(0, input.getBoundingClientRect().bottom + window.scrollY - 50);
    });
    await page.waitForTimeout(100);
    assert.equal(await dock.isVisible(), true, 'the dock remains while the writing form is still on screen');

    await page.locator('[data-writing-image-minimise]').click();
    assert.equal(await dock.isVisible(), false);
    await page.locator('[data-writing-image-restore]').click();
    assert.equal(await dock.isVisible(), true);
    console.log('PASS: writing image loads, survives repeated viewport drags, resizing and scrolling, and restores after minimising.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
