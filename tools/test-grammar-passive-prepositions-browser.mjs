import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const out = "/tmp/grammar-passive-prepositions-qa";
fs.mkdirSync(out, { recursive:true });
const asDataUrl = file => `data:image/webp;base64,${fs.readFileSync(file).toString("base64")}`;
const blackboardAsset = asDataUrl("grammar-eddy-dialogues/blackboard-imagegen-framed-v2.webp");
const eddyAsset = asDataUrl("grammar-eddy-dialogues/unless/eddy-01.webp");
const browser = await chromium.launch();
try {
  for (const width of [390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport:{ width, height:1000 }, deviceScaleFactor:1 });
    await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="learning-portal-shell" data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main></body></html>');
    await page.addStyleTag({ path:"learning-portal-scaffold.css" });
    await page.addStyleTag({ path:"grammar-system.css" });
    await page.addScriptTag({ path:"grammar-passive-voice-data.js" });
    await page.addScriptTag({ path:"grammar-prepositions-data.js" });
    await page.addScriptTag({ path:"grammar-new-curations.js" });
    await page.addScriptTag({ path:"grammar-dialogue-propagation.js" });
    await page.evaluate(({ blackboardAsset, eddyAsset }) => {
      document.querySelectorAll(".grammar-eddy-dialogue img").forEach(image => { image.src = eddyAsset; });
      const style = document.createElement("style");
      style.textContent = `.grammar-eddy-dialogue__art{background-image:url("${blackboardAsset}") !important}`;
      document.head.append(style);
    }, { blackboardAsset, eddyAsset });
    for (const slug of ["passive-voice", "prepositions"]) {
      await page.evaluate(selected => {
        document.querySelector("[data-grammar-library]").hidden = true;
        document.querySelectorAll("[data-new-grammar-curation]").forEach(view => { view.hidden = view.dataset.newGrammarCuration !== selected; });
        const view = document.querySelector(`[data-new-grammar-curation="${selected}"]`);
        window.EDMUND_GRAMMAR_EDDY.schedule(view);
        view.querySelector(".grammar-new-topic")?.scrollIntoView({ block:"start" });
      }, slug);
      const card = page.locator(`[data-new-grammar-curation="${slug}"] .grammar-eddy-dialogue`).first();
      await card.waitFor({ state:"visible" });
      await card.locator("img").waitFor({ state:"visible" });
      await page.waitForTimeout(250);
      const metrics = await page.evaluate(selected => {
        const view = document.querySelector(`[data-new-grammar-curation="${selected}"]`);
        const card = view.querySelector(".grammar-eddy-dialogue");
        const board = card.querySelector(".grammar-eddy-dialogue__art");
        const caption = card.querySelector("figcaption");
        const lesson = card.querySelector(".grammar-eddy-dialogue__lesson");
        const rect = element => { const r = element.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
        const allCards = [...view.querySelectorAll(".grammar-eddy-dialogue")];
        return {
          bodyOverflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
          clippedLessons:allCards.filter(item => { const copy = item.querySelector(".grammar-eddy-dialogue__lesson"); return copy.scrollHeight > copy.clientHeight + 2; }).length,
          clippedNotes:allCards.filter(item => { const copy = item.querySelector(".grammar-eddy-dialogue__copy"); return copy.scrollHeight > copy.clientHeight + 2; }).length,
          card:rect(card), board:rect(board), caption:rect(caption), lesson:rect(lesson),
        };
      }, slug);
      assert.ok(metrics.bodyOverflow <= 2, `${slug} ${width}px must not create horizontal page overflow`);
      assert.ok(metrics.card.width > 250 && metrics.card.width <= width + 1);
      assert.ok(metrics.board.height > 260, `${slug} ${width}px board must retain teaching space`);
      assert.ok(metrics.caption.height > 35, `${slug} ${width}px Eddy note must remain visible`);
      assert.ok(metrics.lesson.width > 180, `${slug} ${width}px live lesson copy must remain readable`);
      assert.equal(metrics.clippedLessons, 0, `${slug} ${width}px must show every teaching line without an inner scrollbar`);
      assert.equal(metrics.clippedNotes, 0, `${slug} ${width}px must show every Eddy note without an inner scrollbar`);
      await card.screenshot({ path:path.join(out, `${slug}-${width}.png`) });
    }
    await page.close();
  }
  console.log(`Browser QA passed at 390/768/1024/1440px; screenshots: ${out}`);
} finally {
  await browser.close();
}
