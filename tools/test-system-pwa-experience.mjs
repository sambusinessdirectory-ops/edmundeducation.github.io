#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const nav = await read("shared-system-nav.js");
const systems = Array.from(nav.matchAll(/\{ id: "([^"]+)", href: "([^"]+)", zh: "([^"]+)", en: "([^"]+)" \}/g),
  ([, id, href, zh, en]) => ({ id, href, zh, en }));
assert.equal(systems.length, 43, "all 43 genuine learning/account systems must remain catalogued");

const manifests = [];
for (const system of systems) {
  const manifest = JSON.parse(await read(`pwa-manifests/${system.id}.webmanifest`));
  manifests.push(manifest);
  assert.equal(manifest.id, `/apps/${system.id}`);
  assert.equal(manifest.start_url, `/${system.href}?source=pwa`);
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.name.includes(system.zh));
  assert.ok(manifest.short_name);
  assert.ok(manifest.icons.some(({ src }) => src === "/assets/icons/edmundeducation-logo-512.png"));
  const html = await read(system.href);
  if (!["schedule-system.html", "writing-submission.html"].includes(system.href)) {
    assert.match(html, new RegExp(`rel="manifest" href="/pwa-manifests/${system.id}\\.webmanifest"`));
  }
}
assert.equal(new Set(manifests.map(({ id }) => id)).size, systems.length, "manifest ids must be unique");
assert.equal(new Set(manifests.map(({ start_url }) => start_url)).size, systems.length, "launch URLs must be unique");
assert.equal(new Set(manifests.map(({ short_name }) => short_name)).size, systems.length, "installed labels must be distinct");

for (const id of ["schedule", "flashcards", "writing", "sentence", "video-class", "parent-communication"]) {
  assert.ok(manifests.some((manifest) => manifest.id === `/apps/${id}`), `${id} must be independently installable`);
}

const register = await read("pwa-register.js");
assert.match(register, /DISMISS_KEY_PREFIX/);
assert.match(register, /`\$\{DISMISS_KEY_PREFIX\}:\$\{appIdentity\.id\}`/);
assert.match(register, /button\.textContent = `安裝 \$\{appIdentity\.shortName\}`/);
assert.match(register, /appleTitle\.content = appIdentity\.shortName/);
assert.match(register, /const IDLE_MILLISECONDS = 25 \* 60 \* 1000/);
assert.match(register, /window\.EdmundIdleBreak = Object\.freeze/);
for (const event of ["edmund:idle-break-start", "edmund:idle-break-resume", "edmund:idle-break-logout"]) {
  assert.match(register, new RegExp(event));
}
assert.match(register, /isAuthenticated\(\)/);
assert.match(register, /\[data-logout\], \[data-action='logout'\]/);
assert.match(register, /!media\.paused && !media\.ended/);
assert.match(register, /\[data-record-toggle\]\[aria-pressed='true'\]/);
assert.doesNotMatch(register, /\.exam-practice-view|\[data-exam-prep-timer\]|\[data-recording-clock\]/);
assert.match(register, /username\.addEventListener\("blur"[\s\S]*?reveal\(true\)/);
assert.match(register, /username\.addEventListener\("change", \(\) => reveal\(Boolean\(username\.value\.trim\(\)\)\)\)/);
assert.match(register, /password\.scrollIntoView\(\{ block: "center", behavior: "smooth" \}\)/);

const allHtml = (await readdir(root)).filter((name) => name.endsWith(".html"));
const adminOnlyPasswordPages = new Set(["daily-newsletter.html", "english-study.html", "forum.html", "major-music.html", "news-analysis.html", "schedule-motivation-admin.html"]);
for (const name of allHtml) {
  const html = await read(name);
  if (!/type="password"/.test(html) || adminOnlyPasswordPages.has(name)) continue;
  assert.ok(systems.some(({ href }) => href === name), `${name}: authenticated user portal needs a system manifest`);
  assert.match(html, /src="\/pwa-register\.js"/, `${name}: universal mobile login behavior must load`);
}

const home = await read("index.html");
assert.match(home, /學習系統<br>快速切換/);
assert.match(home, /data-system-directory-dialog/);
assert.match(home, /homepage-system-directory\.js/);
assert.match(await read("homepage-system-directory.js"), /window\.EdmundSystemNav\?\.systems/);
assert.equal(JSON.parse(await read("manifest.webmanifest")).name, "港大 Edmund Sir 英文補習");
assert.match(home, /apple-mobile-web-app-title" content="港大 Edmund Sir 英文補習"/);

console.log("System PWA, homepage directory, mobile-login and idle-break checks passed.");
