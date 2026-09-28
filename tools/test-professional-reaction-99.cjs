const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium, webkit} = require(process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const server = http.createServer((request, response) => {
  if (request.url === '/__reaction') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end('<div id="root"><div id="team"></div></div><script type="module">import {mountTeam} from "/professional-english/community.mjs"; mountTeam(document.querySelector("#team"), {courseId:"qa-course"});</script>');
    return;
  }
  const file = path.join(root, new URL(request.url, 'http://local').pathname);
  fs.readFile(file, (error, bytes) => {
    response.writeHead(error ? 404 : 200, {'Content-Type': path.extname(file) === '.mjs' ? 'text/javascript' : 'text/plain'});
    response.end(error ? '' : bytes);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    for (const engine of [chromium, webkit]) {
      const browser = await engine.launch({headless: true});
      try {
        const page = await browser.newPage({viewport: {width: 2482, height: 900}});
        let hearts = 99;
        const saves = [];
        await page.addInitScript(() => {
          if (!localStorage.getItem('special-flash-session-v1')) {
            localStorage.setItem('special-flash-session-v1', JSON.stringify({token: 'alice-old', user: {id: 'alice', username: 'Alice', role: 'student'}}));
          }
        });
        await page.route('**/rest/v1/rpc/**', route => {
          const name = route.request().url().split('/').at(-1);
          const args = route.request().postDataJSON();
          let result = {};
          if (name === 'special_flash_encouragement') {
            if (args.p_request) { saves.push(args); hearts += args.p_heart; }
            result = {heart: hearts, thumb: 0, flex: 0};
          } else if (name === 'special_flash_team_effort') {
            result = {generated_at: new Date().toISOString(), courses: [{course_id: 'qa-course', total_cards: 1, members: [{account_id: 'alice', username: 'Alice', cards: 1, card_questions: 1, blank_questions: 0, polysemy_words: 0}], daily: [{account_id: 'alice', date: '2026-09-28', cards: 1}]}]};
          }
          return route.fulfill({json: result});
        });
        await page.goto(`http://127.0.0.1:${server.address().port}/__reaction`);
        await page.locator('[data-reaction-count="heart"]').filter({hasText: '99'}).waitFor();
        await page.evaluate(() => localStorage.setItem('special-flash-session-v1', JSON.stringify({token: 'alice-new', user: {id: 'alice', username: 'Alice', role: 'student'}})));
        await page.locator('[data-reaction="heart"]').click();
        await page.locator('[data-reaction-count="heart"]').filter({hasText: '100'}).waitFor();
        await page.waitForFunction(() => !JSON.parse(localStorage.getItem('professional-encouragement:alice:qa-course') || '[]').length);
        assert.equal(hearts, 100);
        assert.equal(saves[0].p_token, 'alice-new');
        await page.reload();
        await page.locator('[data-reaction-count="heart"]').filter({hasText: '100'}).waitFor();
        await page.locator('[data-reaction="heart"]').click();
        await page.locator('[data-reaction-count="heart"]').filter({hasText: '101'}).waitFor();
        await page.waitForFunction(() => !JSON.parse(localStorage.getItem('professional-encouragement:alice:qa-course') || '[]').length);
        assert.equal(hearts, 101);
        await page.evaluate(() => localStorage.setItem('special-flash-session-v1', JSON.stringify({token: 'bob', user: {id: 'bob', username: 'Bob', role: 'student'}})));
        await page.locator('[data-reaction="heart"]').click();
        assert.equal(hearts, 101);
        assert.match(await page.locator('[data-team-status]').innerText(), /帳戶已切換/);
        console.log(`${engine === webkit ? 'WebKit' : 'Chromium'}: 99 → 100 → 101 after same-account token change; different account blocked.`);
      } finally {
        await browser.close();
      }
    }
  } finally {
    server.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
