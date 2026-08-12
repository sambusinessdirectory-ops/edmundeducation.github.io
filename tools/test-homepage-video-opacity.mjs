import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "index.html"), "utf8");
const start = source.indexOf("function normaliseVideoCover(");
const end = source.indexOf("function playBackgroundSource(", start);
assert.notEqual(start, -1);
assert.notEqual(end, -1);

const writes = new Map();
const helpers = vm.runInNewContext(`(() => {
  const MAX_BACKGROUND_VIDEO_OPACITY = 0.432;
  const VIDEO_COVER_REDUCTION_FACTOR = 0.8;
  const MIN_BACKGROUND_VIDEO_COVER_ALPHA = 0.30;
  ${source.slice(start, end)}
  return { setVideoStrength };
})()`, { document: { documentElement: { style: { setProperty(name, value) { writes.set(name, value); } } } }, writes });

helpers.setVideoStrength({ opacity: "0.72", cover: "rgba(245,245,247,0.20)" });
assert.equal(writes.get("--video-opacity"), "0.432");
assert.equal(writes.get("--video-cover"), "rgba(245,245,247,0.30)");
helpers.setVideoStrength({ opacity: "0.342", cover: "rgba(245,245,247,0.50)" });
assert.equal(writes.get("--video-opacity"), "0.342");
assert.equal(writes.get("--video-cover"), "rgba(245,245,247,0.40)", "the white cover must be exactly 20% less opaque");
helpers.setVideoStrength({ opacity: "invalid", cover: "invalid" });
assert.equal(writes.get("--video-opacity"), "0.342");
assert.equal(writes.get("--video-cover"), "rgba(245,245,247,0.40)");
console.log("Homepage background-video opacity checks passed.");
