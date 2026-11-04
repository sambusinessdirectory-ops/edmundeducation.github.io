import assert from "node:assert/strict";
import { chromium } from "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const url = process.env.COUNTRY_SPELLING_ACCOUNT_URL || "http://127.0.0.1:4181/country-name-spelling.html?qa=account-sync";
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1440, height:960 } });
const page = await context.newPage();
const errors = [];
const ignoredError = (copy) => copy.includes("Applying inline style violates")
  || copy.includes("eddie_farm_visit")
  || copy.includes("schedule_student_record_system_visit")
  || copy.includes("edmund-speaking-system.edmundeducation.workers.dev")
  || copy === "Failed to load resource: the server responded with a status of 401 ()";
page.on("pageerror", (error) => {
  const copy = String(error);
  if (!ignoredError(copy)) errors.push(copy);
});
page.on("console", (message) => {
  const copy = message.text();
  if (message.type() === "error" && !ignoredError(copy)) errors.push(copy);
});

await page.route("**/supabase-config.js", async (route) => {
  await route.fulfill({
    contentType:"application/javascript",
    body:`
      window.EDMUND_SUPABASE = { url:"https://ookkxzgpdclzrrhfmvqx.supabase.co", anonKey:"qa" };
      window.supabase = { createClient(){
        const account = (token) => token === "token-a"
          ? { id:"student-a", name:"Test Account A", token:"token-a" }
          : token === "token-b" ? { id:"student-b", name:"Test Account B", token:"token-b" } : null;
        const remoteKey = (token) => "qa-country-remote:" + token;
        return {
          auth:{
            async getSession(){ return { data:{ session:{ access_token:"qa" } } }; },
            async signInAnonymously(){ return { data:{ session:{ access_token:"qa" } }, error:null }; }
          },
          async rpc(name,args){
            if(name === "flashcard_student_login"){
              const suffix = String(args.p_name || "").endsWith("B") ? "b" : "a";
              const item = account("token-" + suffix);
              return { data:[{ id:item.id, name:item.name, role:"student", session_token:item.token }], error:null };
            }
            if(name === "flashcard_student_session_profile"){
              const item = account(args.p_token);
              return { data:item ? [{ id:item.id, name:item.name, role:"student", session_token:item.token }] : [], error:null };
            }
            if(name === "flashcard_student_get_state_v2"){
              const saved = JSON.parse(localStorage.getItem(remoteKey(args.p_token)) || "null");
              return { data:saved ? [{ key:"edmundCountrySpellingProgressV1", value:saved.value, version:saved.version, value_checksum:"qa" }] : [], error:null };
            }
            if(name === "flashcard_student_upsert_state_v2"){
              const key = remoteKey(args.p_token);
              const saved = JSON.parse(localStorage.getItem(key) || "null") || { version:0, value:{} };
              if(Number(args.p_expected_version) !== saved.version){
                return { data:{ status:"conflict", code:"version_conflict", resultingVersion:saved.version }, error:null };
              }
              const next = { version:saved.version + 1, value:args.p_value };
              localStorage.setItem(key, JSON.stringify(next));
              return { data:{ status:"accepted", code:"saved", resultingVersion:next.version, resultingChecksum:"qa" }, error:null };
            }
            return { data:null, error:{ message:"Unexpected RPC " + name } };
          }
        };
      }};
    `
  });
});

async function login(name) {
  await page.locator('[name="username"]').fill(name);
  await page.locator('[name="password"]').fill("qa");
  await page.locator("[data-login-form]").getByRole("button", { name:/ENTER TERMINAL/ }).click();
  await page.locator('[data-view="content"]').waitFor({ state:"visible" });
  await page.locator('[data-sync-status][data-sync-state="saved"]').waitFor();
}

await page.goto(url, { waitUntil:"networkidle" });
await login("Test Account A");
await page.locator("[data-answer]").fill("United Kingdom");
await page.locator("[data-check]").click();
await page.locator('[data-sync-status][data-sync-state="saved"]').waitFor();
assert.equal(await page.locator('.map-region[data-region="gb"].is-mastered').count() > 0, true);

await page.evaluate(() => localStorage.removeItem("edmund-country-name-spelling-progress-v3:student-a"));
await page.reload({ waitUntil:"networkidle" });
await page.locator('[data-view="content"]').waitFor({ state:"visible" });
await page.locator('[data-sync-status][data-sync-state="saved"]').waitFor();
assert.equal(await page.locator('.map-region[data-region="gb"].is-mastered').count() > 0, true, "server progress must restore after the device backup is removed");

await page.evaluate(() => sessionStorage.clear());
await page.reload({ waitUntil:"networkidle" });
await page.locator('[data-view="login"]').waitFor({ state:"visible" });
await login("Test Account B");
assert.equal(await page.locator('.map-region[data-region="gb"].is-mastered').count(), 0, "a second student must not inherit the first student's green map");

await page.evaluate(() => sessionStorage.clear());
await page.reload({ waitUntil:"networkidle" });
await page.locator('[data-view="login"]').waitFor({ state:"visible" });
await login("Test Account A");
assert.equal(await page.locator('.map-region[data-region="gb"].is-mastered').count() > 0, true, "returning to the first account must restore its own green map");

assert.equal(errors.length, 0, errors.join("\n"));
await browser.close();
console.log("country spelling account browser verified: server restore, reload persistence, account isolation, and returning-account mastery");
