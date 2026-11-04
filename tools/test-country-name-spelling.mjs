import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { HK_DISTRICTS, HK_GROUPS, MTR_STATIONS, WORLD_COUNTRIES, WORLD_REGIONS } from "../country-name-spelling-data.mjs";
import { HK_GEOMETRY, MTR_COORDINATES, WORLD_GEOMETRY } from "../country-name-spelling-map/map-geometry.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const html = readFileSync(join(root, "country-name-spelling.html"), "utf8");
const css = readFileSync(join(root, "country-name-spelling-terminal-v2.css"), "utf8");
const app = readFileSync(join(root, "country-name-spelling-terminal-v2.mjs"), "utf8");

function assertUnique(items, label) {
  assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${label} ids must be unique`);
  assert.equal(new Set(items.map((item) => item.name.toLowerCase())).size, items.length, `${label} names must be unique`);
}

function assertCoordinates(items, label, fields) {
  for (const item of items) {
    assert.equal(typeof item.zh === "string" && item.zh.length > 0, true, `${label} ${item.name} needs a Chinese clue`);
    assert.equal(typeof item.trap === "string" && item.trap.length > 0, true, `${label} ${item.name} needs a spelling trap`);
    for (const [field, min, max] of fields) {
      assert.equal(Number.isFinite(item[field]), true, `${label} ${item.name} needs numeric ${field}`);
      assert.equal(item[field] >= min && item[field] <= max, true, `${label} ${item.name} ${field} is outside the map`);
    }
  }
}

assert.equal(WORLD_COUNTRIES.length, 59, "world edition should contain the curated 59-country essentials list");
assert.equal(HK_DISTRICTS.length, 18, "Hong Kong edition must include all 18 districts");
assert.equal(MTR_STATIONS.length, 61, "Hong Kong edition should include the curated familiar MTR station list");
assert.equal(WORLD_REGIONS.join("|"), "All|Europe|Asia|Americas|Africa|Oceania");
assert.equal(HK_GROUPS.join("|"), "Districts|MTR stations");
assert.equal(WORLD_GEOMETRY.length >= 200, true, "Natural Earth layer should include the full world country geometry");
assert.equal(HK_GEOMETRY.length, 18, "official district boundary layer must contain 18 districts");
assert.equal(Object.keys(MTR_COORDINATES).length >= 150, true, "geographic MTR station layer should contain the full public station set");
assert.deepEqual(new Set(HK_GEOMETRY.map((item) => item.id)), new Set(HK_DISTRICTS.map((item) => item.id)), "official district geometry must map one-to-one to lesson districts");

assertUnique(WORLD_COUNTRIES, "country");
assertUnique(HK_DISTRICTS, "district");
assertUnique(MTR_STATIONS, "MTR station");
assertCoordinates(WORLD_COUNTRIES, "country", [["lat", -90, 90], ["lon", -180, 180]]);
assertCoordinates(HK_DISTRICTS, "district", [["x", 0, 100], ["y", 0, 100]]);
assertCoordinates(MTR_STATIONS, "MTR station", [["x", 0, 100], ["y", 0, 100]]);

for (const required of [
  "France", "Germany", "Spain", "Poland", "Russia", "the United States",
  "the United Kingdom", "Japan", "Laos", "China", "Australia", "Canada"
]) {
  assert.equal(WORLD_COUNTRIES.some((item) => item.name === required), true, `missing required country ${required}`);
}
assert.equal(WORLD_COUNTRIES.some((item) => ["German", "Polant"].includes(item.name)), false, "misspellings must never be answer entries");

for (const required of ["Central and Western", "Yau Tsim Mong", "Sha Tin", "Sai Kung", "Tuen Mun", "Yuen Long"]) {
  assert.equal(HK_DISTRICTS.some((item) => item.name === required), true, `missing district ${required}`);
}
for (const required of ["Central", "Admiralty", "Tsim Sha Tsui", "Mong Kok", "Tsuen Wan", "Kwun Tong", "Sha Tin", "Hong Kong"]) {
  assert.equal(MTR_STATIONS.some((item) => item.name === required), true, `missing familiar MTR station ${required}`);
}

for (const item of WORLD_COUNTRIES) {
  const flagPath = join(root, "country-name-spelling-flags", `${item.code}.svg`);
  assert.equal(existsSync(flagPath), true, `missing flag for ${item.name}`);
  assert.doesNotMatch(readFileSync(flagPath, "utf8"), /<script\b/i, `flag for ${item.name} must not contain scripts`);
}
assert.equal(existsSync(join(root, "country-name-spelling-flags/hk.svg")), true, "missing Hong Kong flag");
for (const [file, minimum] of [["world-relief.jpg", 100_000], ["hong-kong-relief.png", 300_000]]) {
  const path = join(root, "country-name-spelling-map", file);
  assert.equal(existsSync(path), true, `missing terrain asset ${file}`);
  assert.equal(statSync(path).size >= minimum, true, `${file} is too small to be the production relief layer`);
}
assert.equal(existsSync(join(root, "country-name-spelling-map/SOURCES.md")), true, "map sources and licences must be documented");

assert.match(html, /country-name-spelling-terminal-v2\.mjs/);
assert.match(html, /country-name-spelling-terminal-v2\.css/);
assert.match(html, /data-edition="world"/);
assert.match(html, /data-edition="hong-kong"/);
assert.match(html, /data-terrain-map/);
assert.match(html, /data-location-inset/);
assert.match(html, /data-map-regions/);
assert.match(html, /data-flag/);
assert.match(html, /country-name-spelling-flags\/gb\.svg/);
assert.doesNotMatch(html, /assets\/country-name-spelling\/flags/);
assert.match(html, /SPELL TO IDENTIFY/);
assert.doesNotMatch(html, /Content will be added in future/i);
assert.doesNotMatch(html, /data-target-name>FRANCE/i);
assert.doesNotMatch(html, /M70 315L245 220/i, "old invented continent geometry must not remain in the page");

assert.match(css, /perspective\(/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /@media\s*\(max-width:\s*720px\)/);
assert.match(css, /\.map-region\.is-target/);
assert.match(css, /\.mission-visual__inset/);
assert.match(css, /\.rail-line\.is-active/);
assert.match(app, /SpeechSynthesisUtterance/);
assert.match(app, /localStorage\.setItem/);
assert.match(app, /normaliseAnswer/);
assert.match(app, /localhost/);
assert.match(app, /MTR_COORDINATES/);
assert.match(app, /WORLD_GEOMETRY/);
assert.match(app, /HK_GEOMETRY/);
assert.match(app, /editDistance/);
assert.match(app, /REVEAL FULL NAME/);
assert.match(app, /country-name-spelling-flags/);
assert.doesNotMatch(app, /assets\/country-name-spelling\/flags/);

console.log(`country spelling release verified: ${WORLD_COUNTRIES.length} countries, ${HK_DISTRICTS.length} districts, ${MTR_STATIONS.length} MTR stations`);
