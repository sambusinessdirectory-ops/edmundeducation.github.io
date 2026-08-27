#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const nav = await read("shared-system-nav.js");
const systems = Array.from(nav.matchAll(/\{ id: "([^"]+)", href: "([^"]+)", zh: "([^"]+)", en: "([^"]+)"(?:, homepageCard: \d+)? \}/g),
  ([, id, href, zh, en]) => ({ id, href, zh, en }));
assert.equal(systems.length, 52, "all 52 genuine learning/account systems must remain catalogued");

const customApps = Object.freeze({
  schedule: { name: "Edmund 每週功課安排系統", page: "schedule-system.html" },
  progress: { name: "Edmund 英文發展進度表", page: "student-progress.html" },
  "parent-communication": { name: "Edmund 家長溝通", page: "parent-communication.html" },
  listening: { name: "Edmund 英語聆聽", page: "listening-system.html" },
  speaking: { name: "Edmund 英語說話", page: "speaking-system.html" },
  "phrasal-verbs": { name: "動詞片語系統", page: "phrasal-verb-system.html" },
  proverbs: { name: "Edmund 諺語系統", page: "proverb-system.html" },
  idioms: { name: "Edmund 英文成語", page: "idiom-system.html" }
});

function pngSize(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const manifests = [];
for (const system of systems) {
  const manifest = JSON.parse(await read(`pwa-manifests/${system.id}.webmanifest`));
  manifests.push(manifest);
  assert.equal(manifest.id, `/apps/${system.id}`);
  assert.equal(manifest.start_url, `/${system.href}?source=pwa`);
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.name, customApps[system.id]?.name || `${system.zh}｜EdmundEducation`);
  assert.ok(manifest.short_name);
  if (customApps[system.id]) {
    assert.equal(manifest.short_name, customApps[system.id].name);
    for (const icon of manifest.icons) {
      assert.match(icon.src, new RegExp(`^/assets/icons/apps/${system.id}/`));
      const path = icon.src.slice(1);
      await stat(new URL(path, root));
      const expectedSize = Number(icon.sizes.split("x")[0]);
      assert.deepEqual(pngSize(await readFile(new URL(path, root))), { width: expectedSize, height: expectedSize });
    }
  } else {
    assert.ok(manifest.icons.some(({ src }) => src === "/assets/icons/edmundeducation-logo-512.png"));
  }
  const html = await read(system.href);
  if (!["schedule-system.html", "writing-submission.html"].includes(system.href)) {
    assert.match(html, new RegExp(`rel="manifest" href="/pwa-manifests/${system.id}\\.webmanifest"`));
  }
}

for (const [id, app] of Object.entries(customApps)) {
  const html = await read(app.page);
  assert.match(html, new RegExp(`name="apple-mobile-web-app-title" content="${app.name}"`));
  for (const size of [152, 167, 180]) {
    const iconPath = `/assets/icons/apps/${id}/apple-touch-icon-${size}.png`;
    assert.match(html, new RegExp(`rel="apple-touch-icon" sizes="${size}x${size}" href="${iconPath.replaceAll("/", "\\/")}"`));
    assert.deepEqual(pngSize(await readFile(new URL(iconPath.slice(1), root))), { width: size, height: size });
  }
}
assert.equal(manifests.find(({ id }) => id === "/apps/parent-communication").theme_color, "#72598f");
assert.equal(manifests.find(({ id }) => id === "/apps/parent-communication").background_color, "#f3edfb");
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
const adminOnlyPasswordPages = new Set(["daily-newsletter.html", "english-study.html", "forum.html", "major-music.html", "membership-admin.html", "news-analysis.html", "schedule-motivation-admin.html"]);
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

const progressHtml = await read("student-progress.html");
const parentHtml = await read("parent-communication.html");
const listeningHtml = await read("listening-system.html");
const progressCss = await read("student-progress.css");
const listeningCss = await read("listening-system.css");
assert.match(progressHtml, /class="hero-dashboard-illustration"[^>]*dashboard-system\.webp/);
assert.match(parentHtml, /class="hero-dashboard-illustration"[^>]*dashboard-system\.webp/);
assert.match(parentHtml, /name="theme-color" content="#72598f"/);
assert.match(progressCss, /body\[data-progress-portal="parent"\][\s\S]*#72598f/);
assert.match(progressCss, /\.hero-chart\s*\{[\s\S]*height:\s*138px/);
assert.match(progressCss, /\.hero-dashboard-illustration\s*\{/);
assert.match(listeningHtml, /class="listening-hero-illustration"[^>]*listening-system\.webp/);
assert.match(listeningCss, /\.listening-hero-illustration\s*\{/);
for (const asset of ["assets/portal-illustrations/dashboard-system.webp", "assets/portal-illustrations/listening-system.webp"]) {
  assert.ok((await stat(new URL(asset, root))).size > 10_000, `${asset} must be a real optimized illustration`);
}

console.log("System PWA, homepage directory, mobile-login and idle-break checks passed.");
