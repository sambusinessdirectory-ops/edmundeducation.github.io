import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorPattern = /\b(?:supabase|cloudflare|github)\b/i;
const publicFiles = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && /\.(?:html|js)$/i.test(entry.name))
  .map(entry => entry.name)
  .sort();

function visibleHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|ensp|emsp);/gi, " ")
    .replace(/\s+/g, " ");
}

function isTechnicalString(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (/^(?:https?|wss?):\/\//i.test(text)) return true;
  if (/^default-src\s/i.test(text)) return true;
  if (/supabase-config\.js/i.test(text)) return true;
  if (/^(?:\.\.?\/)?[\w./@:${}?=&*\[\]-]+$/i.test(text) && !/^(?:supabase|cloudflare|github)$/i.test(text)) return true;
  return false;
}

const failures = [];
for (const filename of publicFiles) {
  const source = await readFile(path.join(root, filename), "utf8");
  if (/\.html$/i.test(filename) && vendorPattern.test(visibleHtml(source))) {
    failures.push(`${filename}: visible HTML copy contains an infrastructure vendor name`);
  }

  for (const line of source.split(/\r?\n/)) {
    if (!vendorPattern.test(line)) continue;
    const strings = line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g);
    for (const match of strings) {
      const value = match[2];
      if (vendorPattern.test(value) && !isTechnicalString(value)) {
        failures.push(`${filename}: public string ${JSON.stringify(value.slice(0, 160))}`);
      }
    }
  }
}

assert.deepEqual(failures, [], failures.join("\n"));
console.log(`✓ ${publicFiles.length} public HTML/JS files contain no user-facing infrastructure vendor wording`);
