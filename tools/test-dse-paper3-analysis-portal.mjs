#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("dse-paper3-analysis.html");
const css = read("dse-paper3-analysis.css");
const js = read("dse-paper3-analysis.js");
const dataSource = read("dse-paper3-analysis-data.js");
const context = { window: {} };
vm.runInNewContext(dataSource, context, { filename: "dse-paper3-analysis-data.js" });
const data = context.window.EDMUND_DSE_PAPER3_DATA;

assert.match(html, /data-edmund-system-switcher data-system="dse-paper3-analysis"/);
assert.match(html, /shared-system-nav\.js\?v=20260821-header-order1/);
assert.match(html, /dse-paper3-analysis-data\.js\?v=20260809-2/);
assert.match(html, /dse-paper3-analysis\.js\?v=20260812-1/);
assert.match(html, /data-login-form/);
assert.match(html, /autocomplete="username"/);
assert.match(html, /autocomplete="current-password"/);
assert.match(html, /data-library-screen/);
assert.match(html, /data-fast-navigation/);
assert.match(html, /aria-live="polite"/);

assert.match(js, /flashcard_student_login/);
assert.match(js, /flashcard_student_session_profile/);
assert.match(js, /signInAnonymously/);
assert.match(js, /access\.dse !== true/);
assert.match(js, /access\["dse-paper3"\] === false/);
assert.match(js, /EdmundSystemNav\?\.rememberStudentSession/);
assert.match(js, /EdmundSystemNav\?\.forgetStudentSession/);
assert.match(js, /edmund-dse-paper3-analysis-session-v1/);
assert.match(js, /edmund-dse-paper3-year-sort-v1/);
assert.match(js, /localStorage\.setItem\(SORT_KEY/);
assert.match(js, /state\.sort === "asc" \? a - b : b - a/);
assert.match(js, /data-select-year/);
assert.match(js, /data-select-level/);
assert.match(js, /data-select-material/);
assert.match(js, /<details class="essay-card"/);
assert.match(js, /<details class="analysis-accordion"/);
assert.match(js, /data-details-action="expand"/);
assert.match(js, /data-details-action="collapse"/);
assert.match(js, /scrollIntoView/);
assert.doesNotMatch(js, /Sam Admin|password\s*[:=]\s*["']/i, "the portal must not embed admin credentials");
assert.doesNotMatch(`${html}\n${js}`, /即將推出/);

assert.match(css, /\.local-toolbar\s*\{[\s\S]*?position:\s*sticky/);
assert.match(css, /\.analysis-accordion\s*\{[\s\S]*?scroll-margin-top/);
assert.match(css, /@media \(max-width:\s*620px\)/);
assert.match(css, /@media print/);
assert.match(css, /\.selection-grid\.level-grid,[\s\S]*?repeat\(2/);
assert.match(css, /\.analysis-page/);
assert.match(css, /\.essay-document h3/);

assert.deepEqual(Array.from(data.years), Array.from({ length: 14 }, (_, index) => 2025 - index));
assert.deepEqual(Array.from(data.levels, ({ label }) => label), ["B1", "B2"]);
assert.deepEqual(Array.from(data.materialTypes, ({ id }) => id), ["model-essay", "data-file-analysis"]);
assert.equal(data.resources["2025-b2"].modelEssays.length, 3);
assert.equal(data.resources["2025-b2"].analysisSections.length, 13);

console.log("DSE Paper 3 portal checks passed: shared login, 14 years, B1/B2, 2 resource types, 3 essays and 13 analysis sections.");
