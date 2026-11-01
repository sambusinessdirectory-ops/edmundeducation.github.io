const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);

const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8765';
const student = {
  id: '00000000-0000-4000-8000-000000000001',
  token: '00000000-0000-4000-8000-000000000002',
  name: 'Preview Student', role: 'student'
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    await context.addInitScript((session) => {
      sessionStorage.setItem('edmund-universal-student-session-v1', JSON.stringify(session));
    }, student);
    const answers = {};
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/rest/v1/rpc/')) {
        const name = url.pathname.split('/').at(-1);
        const payload = route.request().postDataJSON();
        if (name === 'ielts_preview_student_sync' && payload.p_question_id) {
          if (payload.p_answer) answers[payload.p_question_id] = payload.p_answer;
          else delete answers[payload.p_question_id];
        }
        const results = Object.fromEntries(Object.entries(answers).map(([id, selected]) => [id, {
          selected, answer: id === 'T2-001' ? 'Opinions' : 'Direct question',
          correct: selected === (id === 'T2-001' ? 'Opinions' : 'Direct question')
        }]));
        const data = name === 'ielts_preview_student_feedback' ? { results } : { answers };
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
      }
      if (url.origin === origin) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/ielts-writing-question-preview.html#task2`);
    await page.locator('#learning-content').waitFor({ state: 'visible' });
    await page.locator('#task2-rows tr').first().waitFor();
    assert.equal(await page.locator('#task2-head th').count(), 3);
    assert.equal(await page.locator('#task2-rows tr').count(), 242);
    const first = page.locator('#task2-rows tr').first();
    assert.equal(await first.locator('.task2-meta-cell .question-audio').count(), 1);
    const prompt = await first.locator('.prompt-cell').boundingBox();
    const choice = await first.locator('td').last().boundingBox();
    assert.ok(prompt.width > choice.width * 1.8, 'Question has substantially more width than the choice');
    await first.locator('.answer-trigger').click();
    await page.locator('#choice-menu [data-value="Opinions"]').click();
    await first.locator('.task2-feedback.is-correct').waitFor();
    assert.match(await page.locator('#task2-count').innerText(), /^1 \/ 242/);
    assert.equal(await page.locator('#task2-progress').getAttribute('aria-valuenow'), '1');
    await page.locator('[data-task2-view="unanswered"]').click();
    assert.equal(await first.isVisible(), false);
    assert.equal(await page.locator('#task2-rows tr').nth(1).isVisible(), true);
    await page.locator('[data-task2-view="all"]').click();
    await page.screenshot({ path: '/private/tmp/ielts-preview-workspace-desktop.png' });
    await page.locator('#tab-task1').click();
    await page.locator('#task1-rows tr').first().waitFor();
    assert.equal(await page.locator('#task1-rows tr').count(), 60);
    assert.equal(await page.locator('#task1-progress').getAttribute('aria-valuenow'), '0');
    assert.equal(await page.locator('#task1-rows .diagram-button').first().isVisible(), true);
    await page.screenshot({ path: '/private/tmp/ielts-preview-workspace-task1-desktop.png' });
    await page.locator('#tab-task2').click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile page has no horizontal overflow');
    assert.ok((await first.locator('.prompt-cell').boundingBox()).width < 390, 'Mobile prompt wraps within the viewport');
    assert.equal(await first.locator('.question-audio').isVisible(), true);
    await page.screenshot({ path: '/private/tmp/ielts-preview-workspace-mobile.png' });
    assert.equal(await page.locator('#task2-topic').isVisible(), false, 'Secondary mobile controls start collapsed');
    await page.locator('#study-tools-toggle').click();
    assert.equal(await page.locator('#task2-topic').isVisible(), true, 'Mobile study tools expand on request');
    assert.equal(await page.locator('#playback-speed').isVisible(), true, 'Playback speed remains accessible on mobile');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Expanded mobile tools do not overflow');
    await page.locator('#tab-task1').click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Task 1 mobile cards do not overflow');
    await page.screenshot({ path: '/private/tmp/ielts-preview-workspace-task1-mobile.png' });
    assert.deepEqual(errors, [], 'No browser runtime errors');
    await context.close();
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    await adminContext.addInitScript(() => {
      sessionStorage.setItem('edmund-ielts-preview-admin-v1', JSON.stringify({ token: 'preview-admin', name: 'Preview Admin' }));
    });
    await adminContext.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/rest/v1/rpc/')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ students: [], answers: {} }) });
      if (url.origin === origin) return route.continue();
      return route.abort();
    });
    const adminPage = await adminContext.newPage();
    await adminPage.goto(`${origin}/ielts-writing-question-preview.html#task2`);
    await adminPage.locator('#learning-content').waitFor({ state: 'visible' });
    await adminPage.locator('#task2-rows tr').first().waitFor();
    assert.equal(await adminPage.locator('#task2-head th').count(), 3, 'One admin student column follows metadata and prompt');
    await adminPage.getByRole('button', { name: '新增學生欄' }).click();
    assert.equal(await adminPage.locator('#task2-head th').count(), 4, 'Admin can add another student column');
    await adminPage.screenshot({ path: '/private/tmp/ielts-preview-workspace-admin.png' });
    await adminPage.setViewportSize({ width: 1024, height: 768 });
    assert.equal(await adminPage.locator('#task2-head select').first().isVisible(), true, 'Student selectors remain visible on iPad');
    assert.ok(await adminPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'iPad admin page has no viewport overflow');
    await adminPage.setViewportSize({ width: 390, height: 844 });
    assert.ok(await adminPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Admin mobile view has no horizontal overflow');
    assert.equal(await adminPage.locator('#task2-head select').first().isVisible(), true, 'Student selectors remain visible on iPhone');
    await adminPage.screenshot({ path: '/private/tmp/ielts-preview-workspace-admin-mobile.png' });
    await adminContext.close();
    console.log('IELTS preview workspace: desktop, answer feedback, progress, filtering and mobile reflow passed.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
