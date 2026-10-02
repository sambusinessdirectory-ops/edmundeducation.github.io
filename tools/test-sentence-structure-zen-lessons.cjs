// Local-only fixture. External services are blocked and no student data is written.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));

const root = path.resolve(__dirname, "..");
const output = process.env.ZEN_LESSON_ARTIFACTS || "/private/tmp/sentence-zen-lesson-qa";
fs.mkdirSync(output, { recursive: true });
const mime = { ".css":"text/css", ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript", ".json":"application/json", ".png":"image/png", ".svg":"image/svg+xml", ".webp":"image/webp" };
const server = http.createServer((request, response) => {
  const file = path.resolve(root, `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`);
  if (!file.startsWith(`${root}${path.sep}`)) return response.writeHead(403).end();
  fs.readFile(file, (error, body) => {
    if (error) return response.writeHead(404).end();
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(body);
  });
});

async function main() {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless:true });
  try {
    const page = await browser.newPage({ viewport:{ width:1440, height:1000 }, deviceScaleFactor:1 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/sentence-structure.js?*", async route => {
      const source = fs.readFileSync(path.join(root,"sentence-structure.js"),"utf8")
        .replace(/\ninitialise\(\)\.catch\([\s\S]*$/, "");
      await route.fulfill({
        contentType:"text/javascript",
        body:`${source}\nbindEvents();window.zenLessonTest={async open(id,page=1){await lessonLibrary.catalog();state.user={id:'zen-fixture',name:'Garden Test',role:'student'};state.authToken='fixture';state.dashboardLoaded=true;renderLessonChoices();await openLesson(id,{page});},page:n=>setLessonPage(n),dashboard:()=>showView('dashboard')};`
      });
    });
    for (const file of ["shared-system-nav.js","pwa-register.js"]) {
      await page.route(`**/${file}*`, route => route.fulfill({contentType:"text/javascript",body:""}));
    }
    await page.route("https://**/*", route => route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/sentence-structure.html`);
    await page.waitForFunction(() => window.zenLessonTest);

    for (const id of ["ss61","ss75","ss90"]) {
      await page.evaluate(id => window.zenLessonTest.open(id), id);
      await page.waitForSelector(".sentence-zen-lesson .info-page");
      assert.equal(await page.locator(".sentence-zen-lesson .lesson-stepper button").count(),4);
      assert.match(await page.locator("[data-seaside-level]").innerText(),/^LEVEL (61|75|90) · 庭園慢行$/);
      assert.match(await page.locator(".sentence-zen-lesson").evaluate(el => getComputedStyle(el,"::before").backgroundImage),/lesson-garden-v1\.webp/);
      assert.ok(await page.locator(".formula-display p").count() >= 1,`${id}: formula rows`);
      assert.ok(await page.locator(".example-block").count() >= 1,`${id}: examples`);
      if (id === "ss61") await page.locator(".sentence-zen-lesson").screenshot({path:path.join(output,"61-formula-desktop.png")});
      await page.evaluate(() => window.zenLessonTest.page(2));
      assert.ok(await page.locator(".benefit-card").count() >= 4,`${id}: benefits`);
      if (id === "ss61") await page.locator(".sentence-zen-lesson").screenshot({path:path.join(output,"61-benefits-desktop.png")});
      await page.evaluate(() => window.zenLessonTest.page(3));
      assert.ok(await page.locator(".rule-card").count() >= 4,`${id}: rules`);
      if (id === "ss61") await page.locator(".sentence-zen-lesson").screenshot({path:path.join(output,"61-rules-desktop.png")});
      await page.evaluate(() => window.zenLessonTest.page(4));
      assert.equal(await page.locator(".question-card").count(),50,`${id}: exercises`);
      assert.equal(await page.locator(".question-card[data-edmund-prompt-text]").count(),50,`${id}: audio and recording hook`);
      await page.waitForFunction(() => document.querySelectorAll(".question-card .edmund-speaking-practice").length === 50);
      if (id === "ss61") await page.locator(".sentence-zen-lesson").screenshot({path:path.join(output,"61-exercise-desktop.png")});
    }
    for (const id of ["ss60", "ss91"]) {
      await page.evaluate(id => window.zenLessonTest.open(id), id);
      assert.equal(await page.locator(".sentence-zen-lesson").count(), 0, `${id}: garden theme must stop at level boundary`);
      assert.equal(await page.locator("body.has-sentence-zen-lesson").count(), 0, `${id}: garden body class must clear`);
    }
    for (const width of [820,390]) {
      await page.setViewportSize({width,height:900});
      for (const stage of [1,2,3,4]) {
        await page.evaluate(stage => window.zenLessonTest.open("ss90",stage),stage);
        await page.waitForSelector(stage === 4 ? ".question-card" : ".info-page");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(overflow <= 1,`${width}px stage ${stage}: horizontal overflow ${overflow}px`);
        if (width === 390) await page.locator(".sentence-zen-lesson").screenshot({path:path.join(output,`90-page-${stage}-phone.png`)});
      }
    }
    await page.evaluate(() => window.zenLessonTest.dashboard());
    assert.equal(await page.locator("body.has-sentence-zen-lesson").count(),0,"theme body class clears on exit");
    assert.deepEqual(errors,[]);
    console.log("PASS: levels 61, 75, 90; four native pages; 50 exercises; desktop/tablet/phone; no overflow");
  } finally {
    await browser.close();
    server.close();
  }
}
main().catch(error => {console.error(error);process.exitCode=1;server.close();});
