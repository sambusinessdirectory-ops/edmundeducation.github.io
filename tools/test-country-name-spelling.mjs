import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { HK_DISTRICTS, HK_GROUPS, MTR_STATIONS, WORLD_COUNTRIES, WORLD_REGIONS } from "../country-name-spelling-data.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const html = readFileSync(join(root, "country-name-spelling.html"), "utf8");
const css = readFileSync(join(root, "country-name-spelling-terminal.css"), "utf8");
const app = readFileSync(join(root, "country-name-spelling-terminal.mjs"), "utf8");

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
  const flagPath = join(root, "assets/country-name-spelling/flags", `${item.code}.svg`);
  assert.equal(existsSync(flagPath), true, `missing flag for ${item.name}`);
  assert.doesNotMatch(readFileSync(flagPath, "utf8"), /<script\b/i, `flag for ${item.name} must not contain scripts`);
}
assert.equal(existsSync(join(root, "assets/country-name-spelling/flags/hk.svg")), true, "missing Hong Kong flag");

assert.match(html, /country-name-spelling-terminal\.mjs/);
assert.match(html, /data-edition="world"/);
assert.match(html, /data-edition="hong-kong"/);
assert.match(html, /data-world-map/);
assert.match(html, /data-hong-kong-map/);
assert.match(html, /data-flag/);
assert.match(html, /SPELL TO IDENTIFY/);
assert.doesNotMatch(html, /Content will be added in future/i);
assert.doesNotMatch(html, /data-target-name>FRANCE/i);

assert.match(css, /perspective:/);
assert.match(css, /transform-style:\s*preserve-3d/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /@media\s*\(max-width:\s*720px\)/);
assert.match(app, /SpeechSynthesisUtterance/);
assert.match(app, /localStorage\.setItem/);
assert.match(app, /normaliseAnswer/);
assert.match(app, /localhost/);
assert.match(app, /mtr-segment/);

console.log(`country spelling release verified: ${WORLD_COUNTRIES.length} countries, ${HK_DISTRICTS.length} districts, ${MTR_STATIONS.length} MTR stations`);
