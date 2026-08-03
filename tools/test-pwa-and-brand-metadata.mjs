#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const pathFromWebUrl = (value) => decodeURIComponent(value.split("?")[0].replace(/^\//, ""));

const htmlPages = [
  "about.html",
  "course.html",
  "cre.html",
  "daily-newsletter.html",
  "english-study.html",
  "exam-resources.html",
  "flashcards.html",
  "forum.html",
  "idiom-system.html",
  "index.html",
  "major-music.html",
  "model-essay-downloads.html",
  "music-post.html",
  "news-analysis.html",
  "news-post.html",
  "phrasal-verb-system.html",
  "proverb-system.html",
  "recorded.html",
  "resources.html",
  "schedule-system.html",
  "sentence-structure.html",
  "speaking-system.html",
  "student-progress.html",
  "vs.html",
  "writing-practice.html",
  "writing-submission.html"
];

function pngSize(buffer) {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", "asset is not a PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const tests = [];
const test = (name, run) => tests.push({ name, run });

test("every public page carries the complete mobile PWA identity", async () => {
  const rootHtmlPages = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && entry.name !== "offline.html")
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(rootHtmlPages, [...htmlPages].sort(), "update the PWA page inventory when adding a root HTML page");
  for (const page of htmlPages) {
    const html = await read(page);
    const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
    assert.ok(head, `${page}: missing head`);
    for (const snippet of [
      'rel="manifest" href="/manifest.webmanifest"',
      'rel="icon" href="/favicon.ico" sizes="any"',
      'sizes="48x48" href="/assets/icons/favicon-48x48.png"',
      'rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"',
      'rel="apple-touch-icon" sizes="167x167" href="/assets/icons/apple-touch-icon-167x167.png"',
      'rel="apple-touch-icon" sizes="152x152" href="/assets/icons/apple-touch-icon-152x152.png"',
      'name="mobile-web-app-capable" content="yes"',
      'name="apple-mobile-web-app-capable" content="yes"',
      'name="apple-mobile-web-app-title" content="EdmundEducation"',
      'name="apple-mobile-web-app-status-bar-style" content="default"',
      'href="/pwa-ui.css"',
      'src="/pwa-register.js"'
    ]) assert.ok(head.includes(snippet), `${page}: missing ${snippet}`);
    assert.equal((head.match(/name="theme-color"/g) || []).length, 1, `${page}: needs one theme color`);
    const viewport = head.match(/<meta name="viewport" content="([^"]+)">/i)?.[1] || "";
    assert.ok(viewport.includes("viewport-fit=cover"), `${page}: viewport must support safe areas`);
    assert.doesNotMatch(viewport, /user-scalable\s*=\s*no/i, `${page}: zoom must remain available`);
    assert.doesNotMatch(viewport, /maximum-scale\s*=\s*1(?:\D|$)/i, `${page}: zoom must not be locked`);
    const csp = head.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/i)?.[1] || "";
    if (csp) {
      assert.match(csp, /script-src[^;]*'self'/, `${page}: the external PWA registrar must be allowed`);
      assert.match(csp, /style-src[^;]*'self'/, `${page}: the shared PWA styles must be allowed`);
      if (/worker-src/i.test(csp)) {
        assert.match(csp, /worker-src[^;]*'self'/, `${page}: the same-origin service worker must be allowed`);
        assert.doesNotMatch(csp, /worker-src[^;]*'none'/, `${page}: worker-src none blocks PWA registration`);
      }
    }
  }
});

test("the manifest is installable and has safe Android and Apple artwork", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.id, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.start_url, "/?source=pwa");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "any");
  assert.match(manifest.lang, /^zh-Hant/);
  assert.ok(manifest.name && manifest.short_name && manifest.description);
  assert.deepEqual(manifest.categories, ["education", "productivity"]);
  assert.ok(manifest.shortcuts.length >= 5);
  assert.ok(
    manifest.shortcuts.some(({ url }) => url === "/writing-submission.html?source=pwa-shortcut"),
    "Writing Submission must be available from installed-app shortcuts"
  );
  assert.ok(
    manifest.shortcuts.some(({ url }) => url === "/student-progress.html?source=pwa-shortcut"),
    "Student Progress must be available from installed-app shortcuts"
  );

  const expectedManifestIcons = new Map([
    ["/assets/icons/icon-192x192.png", { width: 192, height: 192, purpose: "any" }],
    ["/assets/icons/icon-512x512.png", { width: 512, height: 512, purpose: "any" }],
    ["/assets/icons/icon-maskable-192x192.png", { width: 192, height: 192, purpose: "maskable" }],
    ["/assets/icons/icon-maskable-512x512.png", { width: 512, height: 512, purpose: "maskable" }]
  ]);
  for (const icon of manifest.icons) {
    const expected = expectedManifestIcons.get(icon.src);
    assert.ok(expected, `unexpected manifest icon ${icon.src}`);
    assert.equal(icon.type, "image/png");
    assert.equal(icon.purpose, expected.purpose);
    assert.equal(icon.sizes, `${expected.width}x${expected.height}`);
    const actual = pngSize(await readFile(new URL(pathFromWebUrl(icon.src), root)));
    assert.deepEqual(actual, { width: expected.width, height: expected.height });
    expectedManifestIcons.delete(icon.src);
  }
  assert.equal(expectedManifestIcons.size, 0, "all required any and maskable icons must be declared");

  for (const [path, width] of [
    ["apple-touch-icon.png", 180],
    ["assets/icons/apple-touch-icon-152x152.png", 152],
    ["assets/icons/apple-touch-icon-167x167.png", 167],
    ["assets/icons/apple-touch-icon-180x180.png", 180]
  ]) {
    assert.deepEqual(pngSize(await readFile(new URL(path, root))), { width, height: width }, path);
  }
  const favicon = await readFile(new URL("favicon.ico", root));
  assert.ok(favicon.length > 100, "favicon.ico must not be empty");
  assert.equal(favicon.readUInt8(6), 48, "Google favicon width must be 48px");
  assert.equal(favicon.readUInt8(7), 48, "Google favicon height must be 48px");
});

test("the service worker is a small privacy-safe offline shell", async () => {
  const worker = await read("service-worker.js");
  assert.match(worker, /const RELEASE_ID = "__EDMUND_RELEASE__";/);
  assert.match(worker, /const CACHE_NAME = `\$\{CACHE_PREFIX\}\$\{RELEASE_ID\}`;/);
  assert.match(worker, /request\.method !== "GET"/);
  assert.match(worker, /request\.headers\.has\("Authorization"\)/);
  assert.match(worker, /request\.headers\.has\("Range"\)/);
  assert.match(worker, /url\.origin !== self\.location\.origin/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /fetch\(request, \{ cache: "no-store" \}\)\.catch\(\(\) => caches\.match\(OFFLINE_URL\)\)/);
  assert.match(worker, /url\.pathname === "\/pwa-register\.js"/);
  assert.match(worker, /fetch\(request, \{ cache: "no-store" \}\)\.catch\(\(\) => caches\.match\("\/pwa-register\.js"\)\)/);
  assert.match(worker, /name\.startsWith\(CACHE_PREFIX\)/);
  assert.match(worker, /SKIP_WAITING/);
  assert.equal(
    (worker.match(/cache\.put\(/g) || []).length,
    1,
    "only the immutable, same-origin Harper runtime may use runtime caching"
  );
  assert.match(worker, /if \(url\.pathname\.startsWith\(HARPER_PATH_PREFIX\)\)[\s\S]*cache\.put\(request, response\.clone\(\)\)/);
  assert.doesNotMatch(worker, /supabase|workers\.dev|r2\.dev|\.pdf|\.zip|\.mp3|\.wav|recording/i);

  const shellBlock = worker.match(/const SHELL_URLS = \[([\s\S]*?)\];/)?.[1] || "";
  const shellUrls = Array.from(shellBlock.matchAll(/"([^"]+)"/g), (match) => match[1]);
  assert.ok(shellUrls.length >= 8 && shellUrls.length <= 16, "precache must remain deliberately small");
  for (const url of shellUrls) {
    await stat(new URL(pathFromWebUrl(url), root));
    if (url !== "/offline.html") {
      assert.doesNotMatch(url, /\.html$/i, "only the offline HTML may be precached");
    }
  }
  assert.deepEqual(shellUrls.filter((url) => url.endsWith(".html")), ["/offline.html"]);

  const offline = await read("offline.html");
  assert.match(offline, /name="robots" content="noindex, nofollow"/);
  assert.match(offline, /尚未送出的內容並未上載/);
});

test("installation and updates stay user-controlled", async () => {
  const register = await read("pwa-register.js");
  assert.match(register, /beforeinstallprompt/);
  assert.match(register, /iPad\|iPhone\|iPod/);
  assert.match(register, /加入主畫面/);
  assert.match(register, /updateViaCache: "none"/);
  assert.match(register, /網站有新版本可用/);
  assert.match(register, /稍後更新/);
  assert.match(register, /registration\.waiting/);
  assert.match(register, /watchUpdateWorker\(registration\.installing\)/);
  assert.match(register, /registration\.addEventListener\("updatefound"/);
  assert.match(register, /checkForUpdate\(registration, \{ force: true \}\)/);
  assert.match(register, /window\.addEventListener\("pageshow", checkWhenActive\)/);
  assert.match(register, /window\.addEventListener\("focus", checkWhenActive\)/);
  assert.match(register, /document\.addEventListener\("visibilitychange"/);
  assert.match(register, /worker\.postMessage\(\{ type: "SKIP_WAITING" \}\)/);
  assert.doesNotMatch(register, /location\.reload\(\).*updatefound/s, "detecting an update must not force a reload");

  const css = await read("pwa-ui.css");
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(css, /cursor: auto !important/);
  assert.match(css, /min-height: 100dvh/);
});

test("the Pages artifact receives a unique service-worker release for every commit", async () => {
  const workflow = await read(".github/workflows/pages.yml");
  const prepareIndex = workflow.indexOf("- name: Prepare site files");
  const stampIndex = workflow.indexOf("- name: Stamp PWA release");
  const uploadIndex = workflow.indexOf("- name: Upload GitHub Pages artifact");
  assert.ok(prepareIndex >= 0 && stampIndex > prepareIndex && uploadIndex > stampIndex);
  assert.ok(workflow.includes("grep -Fq '__EDMUND_RELEASE__' _site/service-worker.js"));
  assert.ok(workflow.includes('sed -i "s/__EDMUND_RELEASE__/${GITHUB_SHA}/g" _site/service-worker.js'));
  assert.ok(workflow.includes('grep -Fq "${GITHUB_SHA}" _site/service-worker.js'));
  assert.match(workflow, /if grep -Fq '__EDMUND_RELEASE__' _site\/service-worker\.js;/);
});

test("the home page gives Google a stable favicon and verified brand entity", async () => {
  const html = await read("index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/edmundeducation\.com\/">/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.match(html, /property="og:site_name" content="EdmundEducation"/);
  assert.match(html, /property="og:image" content="https:\/\/edmundeducation\.com\/assets\/icons\/edmundeducation-logo-512\.png"/);

  const jsonLdSource = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLdSource, "home page must expose Organization and WebSite JSON-LD");
  const jsonLd = JSON.parse(jsonLdSource);
  const graph = jsonLd["@graph"];
  const organization = graph.find((entry) => entry["@type"] === "EducationalOrganization");
  const website = graph.find((entry) => entry["@type"] === "WebSite");
  assert.equal(organization.name, "EdmundEducation");
  assert.equal(organization.url, "https://edmundeducation.com/");
  assert.equal(organization.logo.url, "https://edmundeducation.com/assets/icons/edmundeducation-logo-512.png");
  assert.ok(organization.sameAs.includes("https://www.instagram.com/edmundeducationedu/"));
  assert.ok(organization.sameAs.includes("https://www.youtube.com/@learnenglishforfreehongkong"));
  assert.equal(website.publisher["@id"], organization["@id"]);
  assert.deepEqual(
    pngSize(await readFile(new URL("assets/icons/edmundeducation-logo-512.png", root))),
    { width: 512, height: 512 }
  );
});

test("robots and sitemap expose the canonical public site", async () => {
  const robots = await read("robots.txt");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/edmundeducation\.com\/sitemap\.xml$/m);

  const sitemap = await read("sitemap.xml");
  const urls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  assert.ok(urls.length >= 15);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes("https://edmundeducation.com/"));
  assert.ok(urls.every((url) => url.startsWith("https://edmundeducation.com/")));
  assert.ok(!urls.some((url) => /(?:news|music)-post\.html/.test(url)), "query-driven templates need individual canonicals before sitemap inclusion");
});

let failed = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error?.stack || error);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} PWA and brand checks passed.`);
if (failed) process.exitCode = 1;
