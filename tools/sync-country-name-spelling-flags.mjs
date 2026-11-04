#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_STANDARD_COUNTRIES } from "../country-name-spelling-data.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(root, "country-name-spelling-flags");
await mkdir(destination, { recursive:true });

let added = 0;
for (const country of ALL_STANDARD_COUNTRIES) {
  const target = join(destination, `${country.code}.svg`);
  if (existsSync(target)) continue;
  const url = `https://flagcdn.com/${country.code}.svg`;
  const response = await fetch(url, { headers:{ "user-agent":"EdmundEducation static asset synchronizer" } });
  if (!response.ok) throw new Error(`${response.status} while downloading ${url}`);
  const source = await response.text();
  if (!/<svg\b/i.test(source) || /<script\b/i.test(source)) throw new Error(`Unsafe or invalid SVG for ${country.name}`);
  await writeFile(target, source.endsWith("\n") ? source : `${source}\n`, "utf8");
  added += 1;
  if (added % 20 === 0) process.stdout.write(`Flag assets: ${added} added\n`);
}

for (const country of ALL_STANDARD_COUNTRIES) {
  const source = await readFile(join(destination, `${country.code}.svg`), "utf8");
  if (!/<svg\b/i.test(source) || /<script\b/i.test(source)) throw new Error(`Invalid local SVG for ${country.name}`);
}
console.log(`Flag assets complete: ${ALL_STANDARD_COUNTRIES.length} standard countries (${added} newly added)`);
