import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const out = "/tmp/grammar-conditionals-qa";
fs.mkdirSync(out, { recursive:true });
const asDataUrl = file => `data:image/webp;base64,${fs.readFileSync(file).toString("base64")}`;
const blackboardAsset = process.env.GRAMMAR_QA_BLACKBOARD ? asDataUrl(process.env.GRAMMAR_QA_BLACKBOARD) : null;
const eddyAsset = process.env.GRAMMAR_QA_EDDY ? asDataUrl(process.env.GRAMMAR_QA_EDDY) : null;
const browser = await chromium.launch();
try {
  for (const width of [390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport:{ width, height:1000 }, deviceScaleFactor:1 });
    await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="learning-portal-shell" data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main></body></html>');
    await page.addStyleTag({ path:"learning-portal-scaffold.css" });
    await page.addStyleTag({ path:"grammar-system.css" });
    await page.addScriptTag({ path:"grammar-conditionals-data.js" });
    await page.addScriptTag({ path:"grammar-new-curations.js" });
    await page.addScriptTag({ path:"grammar-dialogue-propagation.js" });
    await page.evaluate(({ blackboardAsset, eddyAsset }) => {
      if (eddyAsset) document.querySelectorAll(".grammar-eddy-dialogue img").forEach(image => { image.src = eddyAsset; });
      if (blackboardAsset) {
        const style = document.createElement("style");
        style.textContent = `.grammar-eddy-dialogue__art{background-image:url("${blackboardAsset}") !important}`;
        document.head.append(style);
      }
      const library = document.querySelector("[data-grammar-library]");
      library.hidden = true;
      const view = document.querySelector('[data-new-grammar-curation="conditionals"]');
      view.hidden = false;
      window.EDMUND_GRAMMAR_EDDY.schedule(view);
      view.querySelector(".grammar-new-topic")?.scrollIntoView({ block:"start" });
    }, { blackboardAsset, eddyAsset });
    const cards = page.locator('[data-new-grammar-curation="conditionals"] .grammar-eddy-dialogue');
    assert.equal(await cards.count(), 298);
    await cards.first().waitFor({ state:"visible" });
    if (eddyAsset) await cards.first().locator("img").evaluate(image => image.decode());
    await page.waitForTimeout(300);
    const metrics = await page.evaluate(() => {
      const view = document.querySelector('[data-new-grammar-curation="conditionals"]');
      const allCards = [...view.querySelectorAll(".grammar-eddy-dialogue")];
      const visibleCards = allCards.filter(card => card.getBoundingClientRect().width > 0);
      return {
        referencePresent:!!view.querySelector(".grammar-relative-reference"),
        referenceOpen:view.querySelector(".grammar-relative-reference")?.open,
        firstStreamId:view.querySelector(".grammar-new-stream")?.firstElementChild?.id,
        bodyOverflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
        clippedLessons:visibleCards.filter(card => { const copy=card.querySelector(".grammar-eddy-dialogue__lesson"); return copy.scrollHeight > copy.clientHeight + 2; }).length,
        clippedNotes:visibleCards.filter(card => { const copy=card.querySelector(".grammar-eddy-dialogue__copy"); return copy.scrollHeight > copy.clientHeight + 2; }).length,
        emptyNotes:visibleCards.filter(card => !card.querySelector("figcaption")?.textContent.trim()).length,
        asideCount:visibleCards.filter(card => card.classList.contains("grammar-eddy-dialogue--eddy-aside")).length,
      };
    });
    assert.equal(metrics.referencePresent, true, `${width}px must render the reference disclosure`);
    assert.equal(metrics.referenceOpen, false, `${width}px reference disclosure must start collapsed`);
    assert.equal(metrics.firstStreamId, "conditionals-rules-1", `${width}px cards must begin after the collapsed reference`);
    assert.ok(metrics.bodyOverflow <= 2, `${width}px must not create horizontal page overflow`);
    assert.equal(metrics.clippedLessons, 0, `${width}px must show every teaching line`);
    assert.equal(metrics.clippedNotes, 0, `${width}px must show every Eddy note`);
    assert.equal(metrics.emptyNotes, 0, `${width}px must have 298 rule-specific notes`);
    for (const number of [1, 32, 33, 149, 298]) {
      await cards.nth(number - 1).screenshot({ path:path.join(out, `conditionals-${String(number).padStart(3,"0")}-${width}.png`) });
    }
    await page.close();
  }
  console.log(`Conditionals browser QA passed for all 298 cards at 390/768/1024/1440px; screenshots: ${out}`);
} finally {
  await browser.close();
}
