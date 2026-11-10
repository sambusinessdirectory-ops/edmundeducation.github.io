import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const modules = [
  ["abstract-meaning",342], ["sentence-fragments",196], ["misplaced-dangling-modifiers",232],
  ["reporting-structures",312], ["auxiliary-verbs",270], ["conjunctions-connectives",258],
  ["subjunctive",182], ["imperatives",310], ["negation-negatives",292],
  ["reflexive-verbs-pronouns",260], ["non-finite-verbs",270], ["question-tags",236],
  ["either-or-neither-nor",196], ["that-clauses",233], ["subject-object-pronouns",237],
  ["whether-vs-if",186], ["all-question-forms",322],
];
const output = "/tmp/grammar-seventeen-guides-qa";
fs.mkdirSync(output, { recursive:true });
const browser = await chromium.launch();
try {
  for (const width of [390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport:{ width, height:1000 }, deviceScaleFactor:1 });
    await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="learning-portal-shell" data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main></body></html>');
    await page.addStyleTag({ path:"learning-portal-scaffold.css" });
    await page.addStyleTag({ path:"grammar-system.css" });
    await page.addScriptTag({ path:"grammar-seventeen-reading-guides-data.js" });
    await page.addScriptTag({ path:"grammar-new-curations.js" });
    await page.addScriptTag({ path:"grammar-dialogue-propagation.js" });
    for (const [slug, count] of modules) {
      await page.evaluate(slug => {
        document.querySelector("[data-grammar-library]").hidden = true;
        document.querySelectorAll("[data-new-grammar-curation]").forEach(view => { view.hidden = view.dataset.newGrammarCuration !== slug; });
        const view = document.querySelector(`[data-new-grammar-curation="${slug}"]`);
        window.EDMUND_GRAMMAR_EDDY.schedule(view);
        view.querySelector(".grammar-new-topic")?.scrollIntoView({ block:"start" });
      }, slug);
      const cards = page.locator(`[data-new-grammar-curation="${slug}"] .grammar-eddy-dialogue`);
      assert.equal(await cards.count(), count);
      await cards.first().waitFor({ state:"visible" });
      await page.waitForTimeout(350);
      const metrics = await page.evaluate(slug => {
        const view = document.querySelector(`[data-new-grammar-curation="${slug}"]`);
        const reference = view.querySelector(".grammar-relative-reference");
        view.querySelector(`.grammar-new-chapters a[href^="#${slug}-overview-"]`)?.click();
        const openedByLink = reference.open;
        reference.open = false;
        const cards = [...view.querySelectorAll(".grammar-eddy-dialogue")];
        return {
          openedByLink,
          stream:view.querySelector(".grammar-new-stream")?.firstElementChild?.id,
          overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
          clippedLesson:cards.filter(card => { const node=card.querySelector(".grammar-eddy-dialogue__lesson"); return node.scrollHeight > node.clientHeight + 2; }).length,
          clippedNote:cards.filter(card => { const node=card.querySelector(".grammar-eddy-dialogue__copy"); return node.scrollHeight > node.clientHeight + 2; }).map(card => ({ rule:card.dataset.rule, text:card.querySelector("figcaption")?.textContent, scroll:card.querySelector(".grammar-eddy-dialogue__copy").scrollHeight, client:card.querySelector(".grammar-eddy-dialogue__copy").clientHeight })),
          emptyNote:cards.filter(card => !card.querySelector("figcaption")?.textContent.trim()).length,
          missingStep:cards.filter(card => !card.textContent.includes("① 先明白意思") || !card.textContent.includes("⑥ 最後看限制或例外")).length,
        };
      }, slug);
      assert.equal(metrics.openedByLink, true, `${slug} ${width}: overview link`);
      assert.equal(metrics.stream, `${slug}-rules-1`, `${slug} ${width}: rule stream order`);
      assert.ok(metrics.overflow <= 2, `${slug} ${width}: horizontal overflow`);
      assert.equal(metrics.clippedLesson, 0, `${slug} ${width}: clipped teaching content`);
      assert.equal(metrics.clippedNote.length, 0, `${slug} ${width}: clipped Eddy notes ${JSON.stringify(metrics.clippedNote)}`);
      assert.equal(metrics.emptyNote, 0, `${slug} ${width}: empty Eddy notes`);
      assert.equal(metrics.missingStep, 0, `${slug} ${width}: missing authored steps`);
      if (width === 390 || width === 1440) {
        for (const number of [1, Math.ceil(count / 2), count]) {
          await cards.nth(number - 1).screenshot({ path:path.join(output, `${slug}-${String(number).padStart(3,"0")}-${width}.png`) });
        }
      }
    }
    await page.close();
  }
  console.log(`Seventeen-guide browser QA passed for all 4,334 cards at 390/768/1024/1440px; risk screenshots: ${output}`);
} finally {
  await browser.close();
}
