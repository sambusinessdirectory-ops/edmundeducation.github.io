#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const siteDir = fileURLToPath(new URL("../", import.meta.url));
const bundlePath = "eddy-carrot-patch";
const bundleDir = path.join(siteDir, bundlePath);
const publicOrigin = "https://edmundeducation.com";
const gameUrl = `${publicOrigin}/eddy-carrot-patch/`;
const startGateScript = "start-gate.js";
const runtimeScripts = [
  "loader.js",
  "asset-registry.js",
  "production-runtime.js",
  "game.js"
];
const placedAnimalIds = [
  "hen-1",
  "hen-2",
  "hen-3",
  "duck-1",
  "duck-2",
  "butterfly-1",
  "butterfly-2",
  "rabbit-1",
  "cow-1",
  "pig-1",
  "sheep-1",
  "goat-1",
  "dog-1",
  "cat-1",
  "frog-1",
  "bird-1",
  "firefly-actor"
];

const tests = [];
const test = (name, run) => tests.push({ name, run });
const read = (relativePath) => readFile(path.join(siteDir, relativePath), "utf8");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${escapeRegExp(name)}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2] ?? null;
}

function normalisedPathname(value, baseUrl) {
  return new URL(value, baseUrl).pathname.replace(/\/{2,}/g, "/");
}

async function assertNonEmptyFile(relativePath) {
  const file = await stat(path.join(siteDir, relativePath));
  assert.ok(file.isFile(), `${relativePath} must be a file`);
  assert.ok(file.size > 0, `${relativePath} must not be empty`);
  return file;
}

async function assertPng(relativePath) {
  await assertNonEmptyFile(relativePath);
  const header = await readFile(path.join(siteDir, relativePath));
  assert.equal(
    header.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    `${relativePath} must have a valid PNG signature`
  );
}

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(path.join(directory, entry.name), relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

function evaluateRegistry(source) {
  const context = { window: {} };
  context.self = context.window;
  vm.runInNewContext(
    `${source}\n;globalThis.__publicationRegistry = typeof EddyProductionAssets !== "undefined"\n` +
      `  ? EddyProductionAssets\n` +
      `  : window.EddyProductionAssets;`,
    context,
    { filename: "eddy-carrot-patch/asset-registry.js", timeout: 10_000 }
  );
  const registry = context.__publicationRegistry;
  assert.ok(registry && typeof registry === "object", "asset-registry.js must expose EddyProductionAssets");
  return registry;
}

function evaluateStartGateClassifier(source, {
  connection = null,
  userAgent = "Mozilla/5.0 (X11; Linux x86_64)",
  userAgentDataMobile = false,
  maxTouchPoints = 0,
  coarsePointer = false
} = {}) {
  const listeners = new Map();
  const cover = {
    dataset: { src: "assets/game-cover.png" },
    getAttribute() { return null; },
    set src(_value) {}
  };
  const stub = {
    hidden: false,
    open: false,
    disabled: false,
    textContent: "",
    dataset: {},
    classList: { add() {}, remove() {} },
    setAttribute() {},
    removeAttribute() {},
    querySelector() { return cover; },
    addEventListener(type, callback) { listeners.set(type, callback); },
    showModal() { this.open = true; },
    close() { this.open = false; }
  };
  const windowObject = {
    matchMedia() { return { matches: coarsePointer }; }
  };
  const context = {
    window: windowObject,
    navigator: {
      connection,
      userAgent,
      userAgentData: { mobile: userAgentDataMobile },
      maxTouchPoints
    },
    document: {
      getElementById() { return stub; },
      createElement() { return { dataset: {}, addEventListener() {} }; },
      head: { appendChild() {} },
      body: { appendChild() {} },
      documentElement: { classList: { add() {} } }
    },
    console
  };
  vm.runInNewContext(source, context, {
    filename: "eddy-carrot-patch/start-gate.js",
    timeout: 1_000
  });
  return windowObject.EddyGameLaunchGate.requiresMobileDataWarning();
}

function evaluatePlacedAnimalBindings(registrySource, runtimeSource, gameSource) {
  const warnings = [];
  const context = {
    window: {},
    console: {
      warn(...args) { warnings.push(args); }
    }
  };
  vm.runInNewContext(registrySource, context, {
    filename: "eddy-carrot-patch/asset-registry.js",
    timeout: 10_000
  });
  vm.runInNewContext(runtimeSource, context, {
    filename: "eddy-carrot-patch/production-runtime.js",
    timeout: 10_000
  });

  const start = gameSource.indexOf("  function animalClip(");
  const end = gameSource.indexOf("  // Fireflies live outside", start);
  assert.ok(start >= 0 && end > start, "game.js animal binding contract could not be isolated");
  const bindingSource =
    `(function () {\n` +
    `  var productionRuntime = window.EddyProductionRuntime;\n` +
    `${gameSource.slice(start, end)}\n` +
    `  return animals;\n` +
    `})()`;
  const actors = vm.runInNewContext(bindingSource, context, {
    filename: "eddy-carrot-patch/animal-bindings.publication-test.js",
    timeout: 10_000
  });
  const runtime = context.window.EddyProductionRuntime;
  assert.ok(runtime && typeof runtime.entry === "function", "production runtime API was not created");
  return { actors: Array.from(actors), runtime, warnings };
}

function registryLeaves(value, currentPath = [], leaves = [], seen = new WeakSet()) {
  if (typeof value === "string") {
    leaves.push({ path: currentPath, value });
    return leaves;
  }
  if (!value || typeof value !== "object" || seen.has(value)) return leaves;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    registryLeaves(child, [...currentPath, key], leaves, seen);
  }
  return leaves;
}

function findUnapprovedEddyReferences(value) {
  const problems = [];
  const seen = new WeakSet();
  const stagedToken = /(?:^|[\/_.-])(?:candidate|reject(?:ed)?)(?:$|[\/_.-])/i;
  const governanceKey = /^(?:status|decision|gateStatus|sourceArtStatus|registrationStatus)$/i;
  const identityKey = /^(?:assetId|asset_id|id|key|name|package)$/i;
  const pathLike = /(?:^|\/|\\|\.)(?:assets?|packages?|qa|production|char[_-]eddy)|\.(?:png|json|md)$/i;

  function visit(node, currentPath = [], inheritedEddyContext = false) {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);

    const eddyContext = inheritedEddyContext ||
      currentPath.some((part) => /eddy/i.test(part)) ||
      Object.entries(node).some(([key, item]) =>
        identityKey.test(key) && typeof item === "string" && /eddy/i.test(item));

    if (eddyContext && node.productionApproval === false) {
      problems.push(`${currentPath.join(".") || "registry"}.productionApproval=false`);
    }

    for (const [key, child] of Object.entries(node)) {
      const childPath = [...currentPath, key];
      const childEddyContext = eddyContext || /eddy/i.test(key) ||
        (identityKey.test(key) && typeof child === "string" && /eddy/i.test(child));

      if (childEddyContext && stagedToken.test(key)) {
        problems.push(`${childPath.join(".")} uses a candidate/rejected key`);
      }
      if (typeof child === "string") {
        if (childEddyContext && governanceKey.test(key) && /candidate|reject/i.test(child)) {
          problems.push(`${childPath.join(".")}=${JSON.stringify(child)}`);
        }
        if (childEddyContext && pathLike.test(child) && stagedToken.test(child)) {
          problems.push(`${childPath.join(".")} references ${child}`);
        }
      } else {
        visit(child, childPath, childEddyContext);
      }
    }
  }

  visit(value);
  return [...new Set(problems)];
}

test("homepage defers the lightweight Eddy cover until the page has loaded", async () => {
  const homepage = await read("index.html");
  const cards = Array.from(homepage.matchAll(/<a\b[^>]*>/gi))
    .filter(({ 0: tag }) => (attribute(tag, "class") || "").split(/\s+/).includes("homepage-game-card"));
  assert.equal(cards.length, 1, "index.html must contain exactly one .homepage-game-card link");

  const cardTag = cards[0][0];
  assert.equal(
    normalisedPathname(attribute(cardTag, "href"), `${publicOrigin}/`),
    "/eddy-carrot-patch/",
    "the homepage game card must link to the public game directory"
  );
  assert.ok(attribute(cardTag, "aria-label")?.trim(), "the homepage game card needs an accessible name");

  const cardStart = cards[0].index;
  const cardEnd = homepage.indexOf("</a>", cardStart);
  assert.ok(cardEnd > cardStart, "the homepage game card must have a closing tag");
  const cardMarkup = homepage.slice(cardStart, cardEnd + 4);
  const covers = Array.from(cardMarkup.matchAll(/<img\b[^>]*>/gi));
  assert.equal(covers.length, 1, "the homepage card must keep one lightweight Game cover image");
  const coverTag = covers[0][0];
  assert.equal(attribute(coverTag, "id"), "homepageGameCover");
  assert.equal(attribute(coverTag, "src"), null, "the cover must not have an eager src attribute");
  assert.equal(attribute(coverTag, "data-src"), "assets/homepage-optimized/game-cover.webp");
  assert.equal(attribute(coverTag, "fetchpriority"), "low");
  assert.equal((homepage.match(/assets\/homepage-optimized\/game-cover\.webp/gi) || []).length, 1);
  assert.doesNotMatch(homepage, /assets\/eddy-game\//i, "no full-size game media may appear on the homepage");
  assert.match(homepage, /window\.addEventListener\("load"[\s\S]*requestIdleCallback\(loadCoverLast/);
  assert.match(homepage, /cover\.src\s*=\s*cover\.dataset\.src/);
  assert.doesNotMatch(
    homepage,
    /<link\b[^>]*\brel\s*=\s*(["'])(?:preload|prefetch|prerender)\1[^>]*eddy-carrot-patch/i,
    "the homepage must never preload, prefetch or prerender the game"
  );

  const serviceWorker = await read("service-worker.js");
  assert.doesNotMatch(serviceWorker, /eddy-carrot-patch|assets\/eddy-game/i, "the PWA shell must not precache game files");
});

test("sitemap contains the canonical Eddy game URL exactly once", async () => {
  const sitemap = await read("sitemap.xml");
  const urls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1].trim());
  assert.equal(urls.filter((url) => url === gameUrl).length, 1);
});

test("public game bundle begins with a lightweight start gate and no eager game payload", async () => {
  for (const relativePath of [
    `${bundlePath}/index.html`,
    `${bundlePath}/styles.css`,
    `${bundlePath}/${startGateScript}`,
    ...runtimeScripts.map((file) => `${bundlePath}/${file}`),
    `${bundlePath}/assets/game-cover.png`
  ]) await assertNonEmptyFile(relativePath);

  const [html, gate] = await Promise.all([
    read(`${bundlePath}/index.html`),
    read(`${bundlePath}/${startGateScript}`)
  ]);
  const stylesheetTags = Array.from(html.matchAll(/<link\b[^>]*>/gi), (match) => match[0])
    .filter((tag) => (attribute(tag, "rel") || "").toLowerCase().split(/\s+/).includes("stylesheet"));
  assert.equal(stylesheetTags.length, 0, "the initial game page must not request the game stylesheet");

  const scriptTags = Array.from(html.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["']).*?\1[^>]*>/gi), (match) => match[0]);
  const localScriptTags = scriptTags.filter((tag) =>
    normalisedPathname(attribute(tag, "src"), gameUrl).startsWith("/eddy-carrot-patch/"));
  assert.deepEqual(
    localScriptTags.map((tag) => path.posix.basename(normalisedPathname(attribute(tag, "src"), gameUrl))),
    [startGateScript],
    "only the lightweight start gate may load before the user starts the game"
  );
  for (const tag of localScriptTags) {
    assert.match(tag, /\sdefer(?:\s|=|>)/i, `${attribute(tag, "src")} must be deferred`);
  }

  assert.match(gate, /loadStylesheet\("styles\.css"\)/, "the game stylesheet must be requested only inside the explicit start path");
  let previousRuntimeIndex = -1;
  for (const filename of runtimeScripts) {
    const runtimeIndex = gate.indexOf(`"${filename}"`);
    assert.ok(runtimeIndex > previousRuntimeIndex, `${filename} must be declared in runtime order`);
    previousRuntimeIndex = runtimeIndex;
  }
  assert.match(html, /\bid\s*=\s*(["'])gameShell\1[^>]*\shidden(?:\s|>|=)/i, "the game shell must remain hidden before start");
  assert.match(html, /\bid\s*=\s*(["'])gameLoadingScreen\1[^>]*\shidden(?:\s|>|=)/i, "the loading screen must remain hidden before start");

  const homeTag = Array.from(html.matchAll(/<a\b[^>]*>/gi), (match) => match[0])
    .find((tag) => attribute(tag, "id") === "backToHome");
  assert.ok(homeTag, "game index must expose #backToHome");
  assert.equal(normalisedPathname(attribute(homeTag, "href"), gameUrl), "/index.html");
  assert.doesNotMatch(homeTag, /\shidden(?:\s|=|>)/i, "the home link must not be hidden");
  assert.notEqual(attribute(homeTag, "aria-hidden"), "true", "the home link must remain accessible");
});

test("game cover is demand-loaded and stays visible until the public ready handshake", async () => {
  const [html, css, gate, loader, game] = await Promise.all([
    read(`${bundlePath}/index.html`),
    read(`${bundlePath}/styles.css`),
    read(`${bundlePath}/${startGateScript}`),
    read(`${bundlePath}/loader.js`),
    read(`${bundlePath}/game.js`)
  ]);
  const loadingTag = html.match(/<[^>]+\bid\s*=\s*(["'])gameLoadingScreen\1[^>]*>/i)?.[0];
  assert.ok(loadingTag, "game index must contain #gameLoadingScreen");
  const coverTag = html.match(/<img\b[^>]*\bdata-src\s*=\s*(["'])assets\/game-cover\.png\1[^>]*>/i)?.[0];
  assert.ok(coverTag, "the loading cover must be held in data-src before consent");
  assert.equal(attribute(coverTag, "src"), null, "the browser must not receive a cover src before start");
  await assertPng(`${bundlePath}/assets/game-cover.png`);
  assert.match(gate, /cover\.src\s*=\s*cover\.dataset\.src/, "the start gate must attach the cover only after explicit start");

  assert.match(css, /\.eddy-game-ready\s+\.game-loading-screen\s*\{[^}]*visibility:\s*hidden/i);
  assert.match(game, /__EDDY_PUBLIC_LOADER__\.markReady\(\)/, "the game must release the cover after rendering starts");

  const htmlClasses = new Set();
  const bodyClasses = new Set();
  const dispatchedEvents = [];
  class CustomEventStub {
    constructor(type) { this.type = type; }
  }
  const loaderWindow = {
    dispatchEvent(event) { dispatchedEvents.push(event.type); }
  };
  vm.runInNewContext(loader, {
    window: loaderWindow,
    document: {
      documentElement: { classList: { add(value) { htmlClasses.add(value); } } },
      body: { classList: { add(value) { bodyClasses.add(value); } } }
    },
    CustomEvent: CustomEventStub
  }, { filename: "eddy-carrot-patch/loader.js", timeout: 1_000 });

  assert.equal(loaderWindow.__EDDY_PUBLIC_LOADER__?.ready, false);
  loaderWindow.__EDDY_PUBLIC_LOADER__.markReady();
  assert.equal(loaderWindow.__EDDY_PUBLIC_LOADER__.ready, true);
  assert.ok(htmlClasses.has("eddy-game-ready"));
  assert.ok(bodyClasses.has("game-ready"));
  assert.deepEqual(dispatchedEvents, ["eddy:game-ready"]);
});

test("mobile and data-saving users must confirm before any runtime request", async () => {
  const [html, gate] = await Promise.all([
    read(`${bundlePath}/index.html`),
    read(`${bundlePath}/${startGateScript}`)
  ]);
  for (const id of ["gameStartButton", "mobileDataWarning", "mobileDataContinue", "mobileDataCancel"]) {
    assert.match(html, new RegExp(`\\bid\\s*=\\s*(["'])${id}\\1`), `${id} is required`);
  }
  assert.match(gate, /connection\.saveData\s*===\s*true/, "Save-Data users must be warned");
  assert.match(gate, /type\s*===\s*["']cellular["']/, "known cellular connections must be warned");
  assert.match(gate, /likelyMobileDevice\(\)/, "mobile browsers without reliable connection type must fail safely to the warning");
  assert.match(gate, /if\s*\(!mobileDataConfirmed\s*&&\s*requiresMobileDataWarning\(\)\)/, "the warning must precede runtime start");
  assert.match(gate, /warningContinue\.addEventListener\(["']click["'][\s\S]*?mobileDataConfirmed\s*=\s*true[\s\S]*?beginRuntime\(\)/, "only Continue may approve mobile-data loading");
  assert.match(gate, /warningCancel\.addEventListener\(["']click["'],\s*closeWarning\)/, "Not now must close without starting");

  const cases = [
    ["known cellular desktop", { connection: { type: "cellular", saveData: false } }, true],
    ["Save-Data on Wi-Fi", { connection: { type: "wifi", saveData: true } }, true],
    ["known Wi-Fi mobile", { connection: { type: "wifi", saveData: false }, userAgentDataMobile: true }, false],
    ["known Ethernet mobile", { connection: { type: "ethernet", saveData: false }, userAgentDataMobile: true }, false],
    ["missing API on mobile", { connection: null, userAgentDataMobile: true }, true],
    ["4G effective type without transport on mobile", { connection: { effectiveType: "4g", saveData: false }, userAgentDataMobile: true }, true],
    ["unknown transport on mobile", { connection: { type: "unknown", saveData: false }, userAgentDataMobile: true }, true],
    ["missing API on desktop", { connection: null }, false]
  ];
  for (const [label, signals, expected] of cases) {
    assert.equal(evaluateStartGateClassifier(gate, signals), expected, label);
  }
});

test("player-facing bundle exposes no local QA library, workshop, or Eddy rig", async () => {
  const files = await listFiles(bundleDir);
  assert.ok(files.length > 0, "public game bundle must not be empty");
  for (const relativePath of files) {
    assert.doesNotMatch(relativePath, /skin[-_ ]?rig/i, `${relativePath} exposes the legacy skin rig`);
    assert.doesNotMatch(relativePath, /char[-_ ]eddy[-_ ]rig[-_ ]001/i, `${relativePath} exposes the construction rig package`);
  }

  const [html, registrySource] = await Promise.all([
    read(`${bundlePath}/index.html`),
    read(`${bundlePath}/asset-registry.js`)
  ]);
  assert.doesNotMatch(html, /asset[\s_-]*library/i, "game markup exposes the local Asset Library");
  assert.doesNotMatch(html, /workshop/i, "game markup exposes the local Farm Workshop");
  assert.doesNotMatch(html, /skin[-_ ]?rig/i, "game markup loads or links the legacy skin rig");
  assert.doesNotMatch(registrySource, /CHAR-EDDY-RIG-001/i, "public registry exposes the construction rig package");
});

test("all 17 placed animal actors resolve complete runtime/registry bindings", async () => {
  const [registrySource, runtimeSource, gameSource] = await Promise.all([
    read(`${bundlePath}/asset-registry.js`),
    read(`${bundlePath}/production-runtime.js`),
    read(`${bundlePath}/game.js`)
  ]);
  const { actors, runtime, warnings } = evaluatePlacedAnimalBindings(registrySource, runtimeSource, gameSource);
  assert.deepEqual(
    actors.map((actor) => actor.id),
    placedAnimalIds,
    "the publication gate must exercise the complete, ordered placed-animal roster"
  );

  const problems = [];
  const incompleteWarningIds = warnings
    .filter((args) => args[0] === "Animal identity binding is incomplete; unsafe fallback is disabled.")
    .map((args) => String(args[1] || "unknown"));
  if (incompleteWarningIds.length) {
    problems.push(`runtime emitted incomplete-binding warnings for ${incompleteWarningIds.join(", ")}`);
  }

  for (const actor of actors) {
    const binding = actor.identityBinding;
    if (!Number.isFinite(actor.worldX) || !Number.isFinite(actor.worldY)) {
      problems.push(`${actor.id}: actor is not placed at a finite world position`);
    }
    if (!binding || binding.entityId !== actor.id) {
      problems.push(`${actor.id}: identity binding is missing or belongs to another entity`);
      continue;
    }

    const model = binding.model;
    const modelAssetId = model?.assetId || "";
    const modelEntry = modelAssetId ? runtime.entry(modelAssetId) : null;
    if (!modelEntry) {
      problems.push(`${actor.id}: model ${model?.assetId || "(missing id)"} is absent from the public registry`);
    } else if (!model.valid) {
      problems.push(
        `${actor.id}: model ${model.assetId} has no exact ${model.identityVariant}/${model.state || "(state)"}/${model.component || "(component)"} diffuse output`
      );
    } else if (model.runtimeVariant !== actor.identityVariant) {
      problems.push(`${actor.id}: model resolved ${model.runtimeVariant} instead of exact identity variant ${actor.identityVariant}`);
    }

    const clips = Array.from(binding.clips || []);
    if (!clips.length) problems.push(`${actor.id}: no animation clip is bound`);
    for (const clip of clips) {
      const clipEntry = runtime.entry(clip.assetId);
      const reasons = [];
      if (!clipEntry) reasons.push("registry entry absent");
      if (clip.outputCount < 1) reasons.push("no exact runtime frames");
      if (!Array.from(clip.modelDependencyAssetIds || []).includes(modelAssetId)) {
        reasons.push(`missing Animals dependency ${modelAssetId || "(missing model id)"}`);
      }
      if (clip.variantBinding !== "exact") {
        const isApprovedWhiteChickenFlapAlias =
          (actor.id === "hen-1" || actor.id === "hen-3") &&
          clip.action === "flap" &&
          clip.assetId === "ANIMSEQ-CHICKEN-FLAP-001" &&
          clip.identityVariant === "white" &&
          clip.runtimeVariant === "base" &&
          clip.compatibleIdentityVariant === "white";
        if (!isApprovedWhiteChickenFlapAlias) reasons.push(`unapproved ${clip.variantBinding} identity alias`);
      }
      if (!clip.valid && !reasons.length) reasons.push("binding validity contract failed");
      if (reasons.length) {
        problems.push(`${actor.id}/${clip.action}/${clip.assetId}: ${reasons.join(", ")}`);
      }
    }

    const primaryClip = binding.clipByAction && binding.clipByAction[actor.primaryAction];
    if (!primaryClip?.valid) {
      problems.push(`${actor.id}: primary action ${actor.primaryAction || "(missing)"} has no valid clip`);
    }
    if (!binding.valid) problems.push(`${actor.id}: aggregate identity binding is invalid`);
  }

  if (problems.length) {
    assert.fail(`placed-animal runtime/registry regression:\n${problems.map((problem) => `- ${problem}`).join("\n")}`);
  }
});

let registryPngCount = 0;
test("public registry has no candidate/rejected Eddy assets and every nested PNG URL exists", async () => {
  const source = await read(`${bundlePath}/asset-registry.js`);
  const registry = evaluateRegistry(source);
  const leaves = registryLeaves(registry);
  assert.ok(leaves.some(({ path: leafPath, value }) =>
    leafPath.some((part) => /eddy/i.test(part)) || /eddy/i.test(value)), "public registry must contain Eddy runtime art");
  assert.doesNotMatch(source, /CHAR-EDDY-RIG-001/i);

  const unapprovedEddy = findUnapprovedEddyReferences(registry);
  assert.deepEqual(
    unapprovedEddy,
    [],
    `public registry contains candidate/rejected Eddy data:\n${unapprovedEddy.join("\n")}`
  );

  const pngUrls = [...new Set(leaves
    .map(({ value }) => value)
    .filter((value) => /\.png(?:[?#][^\s"'<>]*)?$/i.test(value) && !/\s/.test(value)))];
  assert.ok(pngUrls.length > 0, "asset-registry.js must reference at least one PNG");

  for (const pngUrl of pngUrls) {
    const resolved = new URL(pngUrl, gameUrl);
    assert.equal(resolved.origin, publicOrigin, `${pngUrl} must be a same-origin public asset`);
    const relativePath = decodeURIComponent(resolved.pathname).replace(/^\/+/, "");
    const absolutePath = path.resolve(siteDir, relativePath);
    assert.ok(
      absolutePath.startsWith(`${path.resolve(siteDir)}${path.sep}`),
      `${pngUrl} must not escape the Pages site root`
    );
    const file = await stat(absolutePath).catch(() => null);
    assert.ok(file?.isFile(), `asset-registry.js references missing PNG: ${pngUrl}`);
    assert.ok(file.size > 0, `asset-registry.js references empty PNG: ${pngUrl}`);
  }
  registryPngCount = pngUrls.length;
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

console.log(`\n${tests.length - failed}/${tests.length} Eddy game publication checks passed.`);
if (!failed) console.log(`Verified ${registryPngCount} recursively referenced registry PNGs.`);
if (failed) process.exitCode = 1;
