import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { isArticleLocked } from "../ielts-reading-analysis-loader.mjs";

const context = { window: {} };
vm.runInNewContext(
  await readFile(new URL("../ielts-reading-analysis-availability.js", import.meta.url), "utf8"),
  context,
);
const manifest = context.window.EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY;
for (const entry of Object.values(manifest.articles)) {
  if (!isArticleLocked(entry)) continue;
  if (entry.source !== "json") throw new Error(`Locked article ${entry.id} must not be bundled.`);
  const file = entry.file || `${entry.id}.json`;
  if (!/^[a-z0-9][a-z0-9._-]*\.json$/i.test(file) || file.includes("..")) {
    throw new Error(`Invalid locked article filename: ${file}`);
  }
  console.log(`/ielts-reading-analysis-data/${file}`);
}
