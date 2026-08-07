#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const release = "20260804-mobile-submit1";
const systems = ["idiom-system", "proverb-system", "sentence-structure"];

for (const system of systems) {
  const [css, html] = await Promise.all([
    readFile(new URL(`${system}.css`, root), "utf8"),
    readFile(new URL(`${system}.html`, root), "utf8")
  ]);

  const mobileStart = css.indexOf("@media (max-width: 720px)");
  const mobileEnd = css.indexOf("@media (max-width: 430px)", mobileStart);
  assert.ok(mobileStart >= 0 && mobileEnd > mobileStart, `${system} must keep its phone breakpoint`);

  const baseCss = css.slice(0, mobileStart);
  const mobileCss = css.slice(mobileStart, mobileEnd);
  const mobileActions = mobileCss.match(/\.exercise-actions\s*\{([^}]*)\}/s)?.[1] || "";

  assert.match(baseCss, /\.exercise-actions\s*\{[^}]*position:\s*sticky/s, `${system} base submit bar must remain sticky`);
  assert.match(mobileActions, /position:\s*sticky/, `${system} phone submit bar must remain visible while scrolling`);
  assert.doesNotMatch(mobileActions, /position:\s*static/, `${system} phone breakpoint must not disable stickiness`);
  assert.match(
    mobileActions,
    /bottom:\s*calc\(8px\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\)/,
    `${system} phone submit bar must clear the device safe area`
  );
  assert.match(mobileCss, /\.exercise-action-copy\s*\{[^}]*display:\s*none/s, `${system} phone bar must stay compact`);
  assert.match(
    mobileCss,
    /\.exercise-action-buttons\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
    `${system} phone submit buttons must share a compact row`
  );
  assert.match(html, /viewport-fit=cover/, `${system} must expose the device safe area`);
  assert.match(
    html,
    new RegExp(`${system}\\.css\\?v=${release}`),
    `${system} must load the mobile submit-bar release`
  );
}

console.log(`Mobile exercise action tests passed for ${systems.length} systems.`);
