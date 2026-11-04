import assert from "node:assert/strict";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const url = process.env.COUNTRY_SPELLING_URL || "http://127.0.0.1:4181/country-name-spelling.html?preview=1&qa=mastery-audio";
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1920, height:1080 }, deviceScaleFactor:1 });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("Applying inline style violates")) errors.push(message.text());
});
await page.goto(url, { waitUntil:"networkidle" });
await page.evaluate(() => localStorage.removeItem("edmund-country-name-spelling-progress-v2"));
await page.reload({ waitUntil:"networkidle" });
await page.locator('[data-view="content"]').waitFor({ state:"visible" });

const toggle = page.locator("[data-mastery-colour-toggle]");
assert.equal(await toggle.getAttribute("aria-checked"), "true");

await page.locator("[data-answer]").fill("United Kingdom");
await page.locator("[data-check]").click();
const uk = page.locator('.map-regions .map-region[data-region="gb"]');
await uk.waitFor();
assert.equal(await uk.evaluate((node) => node.classList.contains("is-mastered")), true);
assert.match(await uk.evaluate((node) => getComputedStyle(node).fill), /rgba?\(68,\s*151,\s*111/);

await toggle.click();
assert.equal(await toggle.getAttribute("aria-checked"), "false");
assert.equal(await page.locator('.map-regions .map-region[data-region="gb"]').evaluate((node) => node.classList.contains("is-mastered")), false);
await page.reload({ waitUntil:"networkidle" });
await page.locator('[data-view="content"]').waitFor({ state:"visible" });
assert.equal(await page.locator("[data-mastery-colour-toggle]").getAttribute("aria-checked"), "false");
assert.equal(await page.locator('.map-regions .map-region[data-region="gb"]').evaluate((node) => node.classList.contains("is-mastered")), false);
const restoredToggle = page.locator("[data-mastery-colour-toggle]");
await restoredToggle.click();
assert.equal(await restoredToggle.getAttribute("aria-checked"), "true");
assert.equal(await page.locator('.map-regions .map-region[data-region="gb"]').evaluate((node) => node.classList.contains("is-mastered")), true);
await page.screenshot({ path:"/private/tmp/country-spelling-world-mastered.png", fullPage:true });

await page.locator('[data-edition="hong-kong"]').click();
await page.locator("[data-answer]").fill("Central and Western");
await page.locator("[data-check]").click();
const centralWestern = page.locator('.map-regions .map-region[data-region="central-and-western"]');
assert.equal(await centralWestern.evaluate((node) => node.classList.contains("is-mastered")), true);
await page.screenshot({ path:"/private/tmp/country-spelling-hk-mastered.png", fullPage:true });

await page.getByRole("button", { name:"MTR STATIONS / 港鐵站" }).click();
await page.locator("[data-answer]").fill("Kennedy Town");
await page.locator("[data-check]").click();
assert.equal(await page.locator(".rail-station.is-mastered").count() > 0, true);

const audioResponse = page.waitForResponse((response) => response.url().endsWith("/country-name-spelling-audio/hong-kong/mtr/kennedy-town.mp3"));
await page.locator("[data-speak]").click();
assert.equal((await audioResponse).status(), 200);
await page.waitForTimeout(250);
assert.equal(errors.length, 0, errors.join("\n"));

const mobile = await context.newPage();
await mobile.setViewportSize({ width:390, height:844 });
await mobile.goto(`${url}&edition=hong-kong`, { waitUntil:"networkidle" });
await mobile.locator('[data-view="content"]').waitFor({ state:"visible" });
assert.equal(await mobile.locator("[data-mastery-colour-toggle]").isVisible(), true);
assert.equal(await mobile.locator("[data-mastery-colour-toggle]").getAttribute("aria-checked"), "true");
await mobile.screenshot({ path:"/private/tmp/country-spelling-mobile-toggle.png", fullPage:true });

await browser.close();
console.log("country spelling browser verified: world + Hong Kong mastery colours, toggle persistence, Kokoro MP3, mobile control");
