const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const root = path.resolve(__dirname, "..");
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) return response.writeHead(403).end();
  fs.readFile(file, (error, body) => {
    if (error) return response.writeHead(404).end();
    response.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    response.end(body);
  });
});

async function main() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.route("**/sentence-structure.js?*", async (route) => {
      const source = fs.readFileSync(path.join(root, "sentence-structure.js"), "utf8")
        .replace(/\ninitialise\(\)\.catch\([\s\S]*$/, "");
      await route.fulfill({
        contentType: "text/javascript",
        body: `${source}\nbindEvents();window.autumnLessonTest={async open(id,page=1){await lessonLibrary.catalog();state.user={id:'autumn-test',name:'Autumn Test',role:'student'};state.authToken='fixture';state.dashboardLoaded=true;renderLessonChoices();await openLesson(id,{page});},page:n=>setLessonPage(n)};`,
      });
    });
    for (const file of ["shared-system-nav.js", "pwa-register.js", "shared-speaking-practice.js"]) {
      await page.route(`**/${file}*`, (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
    }
    await page.route("https://**/*", (route) => route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/sentence-structure.html`);
    await page.waitForFunction(() => window.autumnLessonTest);

    for (const lessonId of ["ss31", "ss45", "ss60"]) {
      await page.evaluate((id) => window.autumnLessonTest.open(id), lessonId);
      await page.waitForSelector(".sentence-autumn-lesson .info-page");
      assert.equal(await page.locator(".lesson-stepper button").count(), 4, `${lessonId}: four learning stages`);
      assert.deepEqual(await page.locator(".lesson-stepper button strong").allInnerTexts(), ["發現 · Discover", "理解 · Understand", "記住 · Remember", "練習 · Practise"]);
      assert.match(await page.locator("[data-seaside-level]").innerText(), /^LEVEL (31|45|60) · 森林漫步$/);
      assert.match(await page.locator(".sentence-autumn-lesson").evaluate((node) => getComputedStyle(node, "::before").backgroundImage), /lesson-header-v4\.webp/);

      await page.evaluate(() => window.autumnLessonTest.page(1));
      await page.waitForSelector(".formula-display");
      assert.ok(await page.locator(".example-block").count(), `${lessonId}: formula examples render`);

      await page.evaluate(() => window.autumnLessonTest.page(2));
      await page.waitForSelector(".benefit-card");
      assert.ok((await page.locator(".benefit-card").count()) >= 3, `${lessonId}: benefit rows render`);

      await page.evaluate(() => window.autumnLessonTest.page(3));
      await page.waitForSelector(".rule-card");
      assert.ok((await page.locator(".rule-card").count()) >= 3, `${lessonId}: rule rows render`);

      await page.evaluate(() => window.autumnLessonTest.page(4));
      await page.waitForSelector(".question-card");
      assert.equal(await page.locator(".question-card").count(), 50, `${lessonId}: all 50 exercises render`);
      assert.equal(await page.locator(".autumn-field-scene,.autumn-clearing-scene,.autumn-ranger-scene,.autumn-chapters,.autumn-trail-checkpoint").count(), 0, `${lessonId}: retired theme markup is absent`);
    }

    for (const viewport of [{ width: 820, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.autumnLessonTest.open("ss31", 1));
      await page.waitForSelector(".sentence-autumn-lesson .info-page");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 1, `${viewport.width}px: no horizontal overflow (${overflow}px)`);
      await page.evaluate(() => window.autumnLessonTest.page(4));
      await page.waitForSelector(".question-card");
      const exerciseOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(exerciseOverflow <= 1, `${viewport.width}px exercise: no horizontal overflow (${exerciseOverflow}px)`);
    }

    console.log("Autumn lesson reference UI checks passed for levels 31, 45 and 60.");
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  server.close();
});
