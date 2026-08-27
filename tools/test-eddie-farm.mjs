import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { randomUUID } from "node:crypto";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const source = read("eddie-farm-api.js");
function runtime(fetch, { storage = new Map(), getStudent = () => ({ id: "qa-student", name: "QA", token: "qa-token", role: "student" }) } = {}) {
  const window = { EDMUND_SUPABASE: { url: "https://api.example.test", anonKey: "publishable-test-key" }, EdmundSystemNav: { getStudentSession: getStudent } };
  const sessionStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
  vm.runInNewContext(source, { window, sessionStorage, fetch, crypto: { randomUUID }, AbortSignal });
  return { api: window.EddieFarmAPI, storage };
}
const ok = (data) => ({ ok: true, status: 200, json: async () => data });

test("homepage card 59 and all 18 seed types are connected", () => {
  const home = read("index.html");
  const cards = [...home.matchAll(/<a class="category(?:\s|\")[\s\S]*?<\/a>/g)];
  assert.equal(cards.length, 60);
  assert.match(cards[58][0], /href="eddie-farm.html"/);
  assert.match(cards[58][0], /Eddie Farm<br>積分系統/);
  const context = { window: {} };
  vm.runInNewContext(read("eddy-carrot-patch/asset-registry.js"), context);
  const cropIds = [...JSON.stringify(context.window).matchAll(/"assetId":"CROP-([^"]+)-001","name"/g)].map((m) => m[1].toLowerCase().replaceAll("-", "_"));
  const sql = read("supabase/migrations/20260827103531_eddie_farm_points.sql");
  assert.equal(cropIds.length, 18);
  for (const id of cropIds) assert.ok(sql.includes(`('${id}',`), `${id} must be sold in the shop`);
  assert.match(read("eddy-carrot-patch/game.js"), /await farmAction\("plant"/);
  assert.match(read("eddy-carrot-patch/game.js"), /await farmAction\("harvest"/);
});

test("student snapshot is account-scoped and never cached", async () => {
  const { api } = runtime(async (url, request) => {
    assert.equal(url, "https://api.example.test/rest/v1/rpc/eddie_farm_snapshot");
    assert.deepEqual(JSON.parse(request.body), { p_token: "qa-token" });
    assert.equal(request.cache, "no-store");
    assert.equal(request.credentials, "omit");
    return ok({ balance: 12 });
  });
  assert.equal((await api.snapshot()).balance, 12);
});

test("older shared-login pages can register return-day visits", () => {
  for (const file of ["flashcards.html", "writing-practice.html", "index.html", "ielts-reading-analysis.html", "video-class.html"]) {
    const html = read(file);
    assert.ok(html.indexOf('src="supabase-config.js"') > 0, `${file} has public connection configuration`);
    assert.ok(html.indexOf('src="supabase-config.js"') < html.indexOf('src="shared-system-nav.js'), `${file} config loads before return-day hook`);
  }
});

test("an uncertain purchase survives reload and reuses the same receipt", async () => {
  const storage = new Map(); const calls = [];
  const first = runtime(async (_url, request) => { calls.push(JSON.parse(request.body)); throw new Error("network dropped after commit"); }, { storage });
  await assert.rejects(first.api.perform("purchase", { p_seed: "carrot" }), /retry/);
  assert.equal(storage.size, 1);
  const reloaded = runtime(async (_url, request) => { calls.push(JSON.parse(request.body)); return ok({ balance: 5 }); }, { storage });
  assert.equal((await reloaded.api.perform("purchase", { p_seed: "carrot" })).balance, 5);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].p_request, calls[1].p_request);
  assert.equal(storage.size, 0);
});

test("confirmed insufficient funds clears the pending action", async () => {
  const { api, storage } = runtime(async () => ({ ok: false, status: 400, json: async () => ({ message: "Not enough points." }) }));
  await assert.rejects(api.perform("purchase", { p_seed: "carrot" }), /Not enough points/);
  assert.equal(storage.size, 0);
});

test("a changed account cannot receive an old account's snapshot", async () => {
  let token = "one";
  const { api } = runtime(async () => { token = "two"; return ok({ balance: 99 }); }, { getStudent: () => ({ id: token, token, role: "student" }) });
  await assert.rejects(api.snapshot(), /Account changed/);
});

test("unknown actions and logged-out purchases fail closed", async () => {
  const { api } = runtime(async () => { throw new Error("must not reach network"); }, { getStudent: () => null });
  await assert.rejects(api.perform("credit", {}), /Unsupported/);
  await assert.rejects(api.perform("purchase", { p_seed: "carrot" }), /Log in/);
  assert.equal(await api.snapshot(), null);
});

test("private settings have no frontend defaults or password material", () => {
  const page = read("eddie-farm.html");
  const frontend = page + read("eddie-farm.js") + source + read("eddy-carrot-patch/game.js");
  assert.doesNotMatch(frontend, /service_role|password_hash|exercise_count\s*:\s*\d/);
  assert.match(page, /data-farm-rules><\/div>/);
  const sql = read("supabase/migrations/20260827103531_eddie_farm_points.sql");
  assert.match(sql, /revoke all on all tables in schema eddie_farm/);
  assert.match(sql, /revoke all on all functions in schema eddie_farm/);
  assert.doesNotMatch(sql, /insert into eddie_farm\.admin_accounts/);
  assert.doesNotMatch(sql, /insert into eddie_farm\.rules/);
});
