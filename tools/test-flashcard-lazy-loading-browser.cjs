const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");

const root = path.resolve(__dirname, "..");
const url = "https://edmundeducation.com/flashcards.html";
const htmlBytes = fs.statSync(path.join(root, "flashcards.html")).size;

(async () => {
  assert.ok(htmlBytes < 1_000_000, `Login HTML is too large: ${htmlBytes.toLocaleString()} bytes`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  const localRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => {
    const requestUrl = new URL(request.url());
    if (requestUrl.hostname === "edmundeducation.com") localRequests.push(requestUrl.pathname);
  });
  await page.route("https://edmundeducation.com/**", async route => {
    const requestUrl = new URL(route.request().url());
    const file = path.resolve(root, "." + decodeURIComponent(requestUrl.pathname));
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "flashcards.html")) return route.abort();
    if (requestUrl.pathname === "/flashcards.html") return route.fulfill({ contentType: "text/html", path: path.join(root, "flashcards.html") });
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return route.fulfill({ path: file });
    return route.abort();
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.querySelector("[data-login-form] button[type=submit]").disabled);

    const catalogChoice = await page.evaluate(() => {
      const entry = Object.entries(window.EDMUND_FLASHCARD_DATA_CATALOG)
        .find(([deckId, row]) => deckId.startsWith("business-english/") && row.u.includes("flashcards-business-concepts-book1-data.js"));
      if (!entry) throw new Error("Business lazy-load catalog entry not found");
      return { deckId: entry[0], url: entry[1].u.split("?")[0], count: entry[1].c };
    });
    const heavyStartupFiles = [
      "/flashcards-core-data.js",
      "/flashcards-audio-manifest.js",
      "/flashcards-dse-writing-part-b-audio.js",
      "/" + catalogChoice.url
    ];
    for (const file of heavyStartupFiles) {
      assert.equal(localRequests.includes(file), false, `${file} loaded before a deck or audio was requested`);
    }

    const opened = await page.evaluate(deckId => openDeckStart(deckId), catalogChoice.deckId);
    assert.equal(opened, true);
    await page.waitForFunction(deckId => getDeckCards(deckId).length > 0, catalogChoice.deckId);
    const loadedCount = await page.evaluate(deckId => getDeckCards(deckId).length, catalogChoice.deckId);
    assert.equal(loadedCount, catalogChoice.count);
    assert.equal(localRequests.filter(item => item === "/" + catalogChoice.url).length, 1);
    assert.equal(localRequests.includes("/flashcards-core-data.js"), false);
    assert.equal(localRequests.includes("/flashcards-audio-manifest.js"), false);
    assert.deepEqual(errors, []);

    console.log(JSON.stringify({
      htmlBytes,
      startupLocalRequests: localRequests.length - 1,
      selectedDeck: catalogChoice.deckId,
      selectedDeckCards: loadedCount,
      selectedBundleRequests: 1
    }));
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
