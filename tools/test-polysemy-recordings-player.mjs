import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const { chromium } = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || "playwright");
const root = path.resolve(import.meta.dirname, "..");
const audioIndex = JSON.parse(fs.readFileSync(path.join(root, "polysemy-lab/audio.json"), "utf8"));
const audioRow = Object.values(audioIndex)[0];
const audio = fs.readFileSync(path.join(root, "polysemy-lab", audioRow.path)).toString("base64");
const student = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Recording Student",
  role: "student",
  session_token: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
};
const recording = {
  id: "22222222-2222-4222-8222-222222222222",
  module: "show",
  question: "depict-1",
  mime: "audio/mpeg",
  at: "2026-09-28T05:41:22.000Z"
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: "block", viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));

await context.route("**/polysemy-lab.html", async route => {
  const response = await route.fetch();
  await route.fulfill({ response, body: (await response.text()).replace(/ integrity="[^"]+"/g, "") });
});
await context.route("**/supabase.min.js", route => route.fulfill({
  contentType: "application/javascript",
  body: `window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:"transport"}}}})},rpc:(name,args)=>({abortSignal:()=>fetch("https://ookkxzgpdclzrrhfmvqx.supabase.co/rest/v1/rpc/"+name,{method:"POST",body:JSON.stringify(args)}).then(async response=>({data:await response.json(),error:null}))})})};`
}));
await context.route("**/rest/v1/**", async route => {
  const name = route.request().url().split("/").at(-1);
  const args = route.request().postDataJSON() || {};
  if (name === "flashcard_student_login") return route.fulfill({ json: [student] });
  if (name === "flashcard_student_session_profile") return route.fulfill({ json: [student] });
  if (name === "polysemy_lab_modules_sync") return route.fulfill({ json: { events: [], timeDays: [] } });
  if (name === "polysemy_lab_modules_recording") {
    if (args.p_action === "list") return route.fulfill({ json: [recording] });
    if (args.p_action === "get") return route.fulfill({ json: { ...recording, audio } });
  }
  return route.fulfill({ json: {} });
});

await page.goto((process.env.POLYSEMY_QA_BASE || "http://127.0.0.1:8633") + "/polysemy-lab.html");
await page.locator("[name=username]").fill("recording-student");
await page.locator("[name=password]").fill("correct");
await page.locator("[data-login-form] [type=submit]").click();
await page.locator("[data-app]").waitFor({ state: "visible" });
await page.locator("[data-recordings]").click();
const card = page.locator(".recording-item");
await card.waitFor();

assert.equal(await card.count(), 1);
assert.match(await card.innerText(), /REC 001/);
assert.match(await card.innerText(), /The photograph shows a family sitting around a table/);
assert.equal(await card.locator(".recording-waveform i").count(), 46);
const barMetrics = await card.locator(".recording-waveform i").first().evaluate(node => ({ outer: node.outerHTML, attr: node.getAttribute('style'), rect: node.getBoundingClientRect().toJSON(), height: getComputedStyle(node).height, display: getComputedStyle(node).display, flex: getComputedStyle(node).flex, custom: getComputedStyle(node).getPropertyValue('--bar') }));
assert.ok(barMetrics.rect.height >= 6, "Waveform bars are visible before playback: " + JSON.stringify(barMetrics));
assert.equal(await card.locator(".recording-skip").count(), 2);
assert.equal(await card.locator("[data-seek]").isDisabled(), true);
assert.match(await page.locator("[data-recording-count]").innerText(), /1 RECORDING/);
await card.screenshot({ path: "/tmp/polysemy-recordings-desktop.png" });

await card.locator("[data-play]").click();
await page.waitForFunction(() => document.querySelector(".recording-item audio").readyState >= 2);
assert.equal(await card.locator("[data-seek]").isEnabled(), true);
assert.equal(await card.locator("a[download]").isVisible(), true);
assert.equal(await card.locator("[data-play]").getAttribute("aria-label"), "暫停錄音 · Pause recording");
assert.equal(await card.evaluate(node => node.classList.contains("is-playing")), true);
await card.locator("[data-play]").click();
await page.waitForFunction(() => document.querySelector(".recording-item [data-play]").getAttribute("aria-label") === "播放錄音 · Play recording");
assert.equal(await card.locator("[data-play]").getAttribute("aria-label"), "播放錄音 · Play recording");
await card.locator('[data-skip="5"]').click();
await page.waitForFunction(() => document.querySelector(".recording-item audio").currentTime > 0);

for (const width of [768, 390, 320]) {
  await page.setViewportSize({ width, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Recordings layout fits " + width);
}
await card.screenshot({ path: "/tmp/polysemy-recordings-mobile.png" });

await page.emulateMedia({ reducedMotion: "reduce" });
assert.equal(await card.evaluate(node => getComputedStyle(node).animationName), "none");
assert.deepEqual(errors, []);
await browser.close();
console.log("PASS: Polysemy recording studio player, waveform, playback, download, responsive layout and reduced motion.");
