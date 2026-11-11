import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const modules = [["causative-constructions",283],["cleft-pseudo-cleft-sentences",257],["transitivity-verb-valency",272],["complements-complementation",348],["sentence-structure-types",289],["inversion",273]];
const widths = [390,768,1024,1440];
const output = "/tmp/grammar-six-guides-qa";
const assetDir = process.env.GRAMMAR_QA_ASSET_DIR;
const qaPoses = assetDir ? Array.from({length:32}, (_, index) => `data:image/webp;base64,${fs.readFileSync(path.join(assetDir, `eddy-${String(index + 1).padStart(2,"0")}.webp`)).toString("base64")}`) : null;
const qaBoard = assetDir ? `data:image/webp;base64,${fs.readFileSync(path.join(assetDir, "blackboard-imagegen-framed-v2.webp")).toString("base64")}` : null;
fs.mkdirSync(output, { recursive:true });

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ deviceScaleFactor:1 });
  for (const [slug,count] of modules) {
    const page = await context.newPage();
    await page.setViewportSize({width:390,height:1000});
    await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="learning-portal-shell" data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main></body></html>');
    await page.addStyleTag({path:"learning-portal-scaffold.css"});
    await page.addStyleTag({path:"grammar-system.css"});
    await page.addScriptTag({path:"grammar-six-reading-guides-data.js"});
    await page.evaluate(slug => {
      window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA = window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA.filter(lesson => lesson.slug === slug);
    }, slug);
    if (qaPoses) {
      await page.evaluate(poses => { window.__GRAMMAR_QA_POSES = poses; }, qaPoses);
      const source = fs.readFileSync("grammar-new-curations.js", "utf8");
      const runtime = source.replace(/const poses = Array\.from\(\{ length: poseCount \}, \(_, index\) =>[\s\S]*?EDDY_POSE_VERSION\}`\);/, "const poses = window.__GRAMMAR_QA_POSES.slice(0, poseCount);");
      assert.notEqual(runtime, source, "QA pose injection must replace the production URL builder");
      await page.addStyleTag({content:`.grammar-eddy-dialogue__art{background-image:url("${qaBoard}")!important}`});
      await page.addScriptTag({content:runtime});
    } else {
      await page.addScriptTag({path:"grammar-new-curations.js"});
    }
    await page.addScriptTag({path:"grammar-dialogue-propagation.js"});
    await page.evaluate(async slug => {
      document.querySelector("[data-grammar-library]").hidden=true;
      const view=document.querySelector(`[data-new-grammar-curation="${slug}"]`);
      view.hidden=false;
      const sources=[...new Set([...view.querySelectorAll("img")].map(image => image.src))];
      await Promise.all(sources.map(source => new Promise((resolve,reject) => {
        const image=new Image(); image.onload=resolve; image.onerror=reject; image.src=source;
      })));
      window.EDMUND_GRAMMAR_EDDY.schedule(view);
    }, slug);
    console.log(`${slug}: decoded ${count} portraits`);
    const cards=page.locator(`[data-new-grammar-curation="${slug}"] .grammar-eddy-dialogue`);
    assert.equal(await cards.count(),count);
    const failedImages = await page.locator(`[data-new-grammar-curation="${slug}"] img`).evaluateAll(images => images.filter(image => image.naturalWidth === 0).map(image => image.src));
    assert.deepEqual([...new Set(failedImages)], [], `${slug}: every Eddy pose asset must load`);
    await page.evaluate(async () => {
      const value = getComputedStyle(document.querySelector(".grammar-eddy-dialogue__art")).backgroundImage;
      const source = value.match(/url\(["']?(.+?)["']?\)/)?.[1];
      if (!source) throw new Error("Blackboard image URL missing");
      await new Promise((resolve, reject) => { const image = new Image(); image.onload=resolve; image.onerror=reject; image.src=source; });
    });
    for (const width of widths) {
      await page.setViewportSize({width,height:1000});
      await page.evaluate(slug => {
        const view=document.querySelector(`[data-new-grammar-curation="${slug}"]`);
        window.EDMUND_GRAMMAR_EDDY.schedule(view);
        view.querySelector(".grammar-new-topic")?.scrollIntoView({block:"start"});
      },slug);
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
      assert.equal(metrics.empty,0);
      assert.equal(metrics.steps,0);
      if (width===390||width===1440) for (const number of [1,Math.ceil(count/2),count]) await cards.nth(number-1).screenshot({path:path.join(output,`${slug}-${String(number).padStart(3,"0")}-${width}.png`)});
      console.log(`${slug}: ${width}px passed`);
    }
    await page.close();
  }
  await context.close();
  console.log(`Six-guide browser QA passed for all 1,722 cards at 390/768/1024/1440px; risk screenshots: ${output}`);
} finally { await browser.close(); }
