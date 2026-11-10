import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const modules = [["nominalisation",327],["linking-verbs",213],["english-prefixes",271],["quantifiers",396],["english-suffixes",327],["phrase-types",288],["nouns-noun-phrases",248]];
const output = "/tmp/grammar-seven-guides-qa";
fs.mkdirSync(output, { recursive:true });
const browser = await chromium.launch();
try {
  for (const width of [390,768,1024,1440]) {
    const page = await browser.newPage({ viewport:{width,height:1000}, deviceScaleFactor:1 });
    await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="learning-portal-shell" data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main></body></html>');
    await page.addStyleTag({path:"learning-portal-scaffold.css"});
    await page.addStyleTag({path:"grammar-system.css"});
    await page.addScriptTag({path:"grammar-seven-reading-guides-data.js"});
    await page.addScriptTag({path:"grammar-new-curations.js"});
    await page.addScriptTag({path:"grammar-dialogue-propagation.js"});
    for (const [slug,count] of modules) {
      await page.evaluate(slug => {
        document.querySelector("[data-grammar-library]").hidden=true;
        document.querySelectorAll("[data-new-grammar-curation]").forEach(view => { view.hidden=view.dataset.newGrammarCuration!==slug; });
        const view=document.querySelector(`[data-new-grammar-curation="${slug}"]`);
        window.EDMUND_GRAMMAR_EDDY.schedule(view);
        view.querySelector(".grammar-new-topic")?.scrollIntoView({block:"start"});
      },slug);
      const cards=page.locator(`[data-new-grammar-curation="${slug}"] .grammar-eddy-dialogue`);
      assert.equal(await cards.count(),count);
      await cards.first().waitFor({state:"visible"});
      await page.waitForTimeout(350);
      const metrics=await page.evaluate(slug => {
        const view=document.querySelector(`[data-new-grammar-curation="${slug}"]`), reference=view.querySelector(".grammar-relative-reference");
        view.querySelector(`.grammar-new-chapters a[href^="#${slug}-overview-"]`)?.click();
        const opened=reference.open; reference.open=false;
        const cards=[...view.querySelectorAll(".grammar-eddy-dialogue")];
        return {opened,stream:view.querySelector(".grammar-new-stream")?.firstElementChild?.id,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          lesson:cards.filter(card=>{const n=card.querySelector(".grammar-eddy-dialogue__lesson");return n.scrollHeight>n.clientHeight+2}).length,
          note:cards.filter(card=>{const n=card.querySelector(".grammar-eddy-dialogue__copy");return n.scrollHeight>n.clientHeight+2}).map(card=>card.dataset.rule),
          empty:cards.filter(card=>!card.querySelector("figcaption")?.textContent.trim()).length,
          steps:cards.filter(card=>!card.textContent.includes("① 先明白意思")||!card.textContent.includes("⑥ 最後看限制或例外")).length};
      },slug);
      assert.equal(metrics.opened,true,`${slug} ${width}: Overview expansion`);
      assert.equal(metrics.stream,`${slug}-rules-1`);
      assert.ok(metrics.overflow<=2,`${slug} ${width}: page overflow`);
      assert.equal(metrics.lesson,0,`${slug} ${width}: clipped board text`);
      assert.equal(metrics.note.length,0,`${slug} ${width}: clipped notes ${metrics.note}`);
      assert.equal(metrics.empty,0); assert.equal(metrics.steps,0);
      if (width===390||width===1440) for (const number of [1,Math.ceil(count/2),count]) await cards.nth(number-1).screenshot({path:path.join(output,`${slug}-${String(number).padStart(3,"0")}-${width}.png`)});
    }
    await page.close();
  }
  console.log(`Seven-guide browser QA passed for all 2,070 cards at 390/768/1024/1440px; risk screenshots: ${output}`);
} finally { await browser.close(); }
