import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const modules = [
  ["comparative-superlative", 319],
  ["dependent-independent-clauses", 316],
  ["adverbs-of-frequency", 265],
  ["parts-of-speech-functions", 309],
];
const out = "/tmp/grammar-four-guides-qa";
fs.mkdirSync(out, { recursive:true });
const asDataUrl = file => `data:image/webp;base64,${fs.readFileSync(file).toString("base64")}`;
const blackboardAsset = process.env.GRAMMAR_QA_BLACKBOARD ? asDataUrl(process.env.GRAMMAR_QA_BLACKBOARD) : null;
const eddyAsset = process.env.GRAMMAR_QA_EDDY ? asDataUrl(process.env.GRAMMAR_QA_EDDY) : null;
const browser = await chromium.launch();
try {
  for (const [slug, count] of modules) {
    for (const width of [390, 768, 1024, 1440]) {
      const page = await browser.newPage({ viewport:{ width, height:1000 }, deviceScaleFactor:1 });
      await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="learning-portal-shell" data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main></body></html>');
      await page.addStyleTag({ path:"learning-portal-scaffold.css" });
      await page.addStyleTag({ path:"grammar-system.css" });
      await page.addScriptTag({ path:"grammar-four-reading-guides-data.js" });
      await page.addScriptTag({ path:"grammar-new-curations.js" });
      await page.addScriptTag({ path:"grammar-dialogue-propagation.js" });
      await page.evaluate(({ slug, blackboardAsset, eddyAsset }) => {
        if (eddyAsset) document.querySelectorAll(".grammar-eddy-dialogue img").forEach(image => { image.src = eddyAsset; });
        if (blackboardAsset) {
          const style = document.createElement("style");
          style.textContent = `.grammar-eddy-dialogue__art{background-image:url("${blackboardAsset}") !important}`;
          document.head.append(style);
        }
        const library = document.querySelector("[data-grammar-library]");
        library.hidden = true;
        document.querySelectorAll("[data-new-grammar-curation]").forEach(view => { view.hidden = view.dataset.newGrammarCuration !== slug; });
        const view = document.querySelector(`[data-new-grammar-curation="${slug}"]`);
        window.EDMUND_GRAMMAR_EDDY.schedule(view);
        view.querySelector(".grammar-new-topic")?.scrollIntoView({ block:"start" });
      }, { slug, blackboardAsset, eddyAsset });
      const cards = page.locator(`[data-new-grammar-curation="${slug}"] .grammar-eddy-dialogue`);
      assert.equal(await cards.count(), count);
      await cards.first().waitFor({ state:"visible" });
      if (eddyAsset) await cards.first().locator("img").evaluate(image => image.decode());
      await page.waitForTimeout(500);
      const metrics = await page.evaluate((slug) => {
        const view = document.querySelector(`[data-new-grammar-curation="${slug}"]`);
        const reference = view.querySelector(".grammar-relative-reference");
        const overview = view.querySelector(`.grammar-new-chapters a[href^="#${slug}-overview-"]`);
        overview.click();
        const openedByLink = reference.open;
        reference.open = false;
        window.EDMUND_GRAMMAR_EDDY.schedule(view);
        const visibleCards = [...view.querySelectorAll(".grammar-eddy-dialogue")].filter(card => card.getBoundingClientRect().width > 0);
        return {
          referencePresent:!!reference,
          referenceOpen:reference.open,
          openedByLink,
          firstStreamId:view.querySelector(".grammar-new-stream")?.firstElementChild?.id,
          bodyOverflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
          clippedLessons:visibleCards.filter(card => { const copy=card.querySelector(".grammar-eddy-dialogue__lesson"); return copy.scrollHeight > copy.clientHeight + 2; }).length,
          clippedNotes:visibleCards.filter(card => { const copy=card.querySelector(".grammar-eddy-dialogue__copy"); return copy.scrollHeight > copy.clientHeight + 2; }).length,
          emptyNotes:visibleCards.filter(card => !card.querySelector("figcaption")?.textContent.trim()).length,
          labelledSteps:visibleCards.filter(card => !card.textContent.includes("① 先明白意思") || !card.textContent.includes("⑥ 最後看限制或例外")).length,
          tables:view.querySelectorAll(".grammar-new-table-wrap").length,
        };
      }, slug);
      assert.equal(metrics.referencePresent, true, `${slug} ${width}px must render the reference disclosure`);
      assert.equal(metrics.referenceOpen, false, `${slug} ${width}px reference disclosure must start collapsed`);
      assert.equal(metrics.openedByLink, true, `${slug} ${width}px overview links must expand hidden content`);
      assert.equal(metrics.firstStreamId, `${slug}-rules-1`, `${slug} ${width}px cards must begin after the collapsed reference`);
      assert.ok(metrics.bodyOverflow <= 2, `${slug} ${width}px must not create horizontal page overflow`);
      assert.equal(metrics.clippedLessons, 0, `${slug} ${width}px must show every teaching line`);
      assert.equal(metrics.clippedNotes, 0, `${slug} ${width}px must show every Eddy note`);
      assert.equal(metrics.emptyNotes, 0, `${slug} ${width}px must have ${count} rule-specific notes`);
      assert.equal(metrics.labelledSteps, 0, `${slug} ${width}px must retain the authored step labels`);
      assert.ok(metrics.tables > 0, `${slug} must retain authored tables`);
      for (const number of [1, Math.ceil(count / 2), count]) {
        await cards.nth(number - 1).screenshot({ path:path.join(out, `${slug}-${String(number).padStart(3,"0")}-${width}.png`) });
      }
      await page.close();
    }
  }
  console.log(`Four-guide browser QA passed for all 1,209 cards at 390/768/1024/1440px; screenshots: ${out}`);
} finally {
  await browser.close();
}
