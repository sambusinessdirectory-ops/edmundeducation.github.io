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
assert.notEqual(start, -1, "homepage must normalise the background-video cover");
assert.notEqual(end, -1, "homepage video-strength helpers must remain testable");

const writes = new Map();
const helpers = vm.runInNewContext(`(() => {
  const MAX_BACKGROUND_VIDEO_OPACITY = 0.432;
  const MIN_BACKGROUND_VIDEO_COVER_ALPHA = 0.38;
  ${source.slice(start, end)}
  return { normaliseVideoCover, setVideoStrength };
})()`, {
  document: {
    documentElement: {
      style: {
        setProperty(name, value) { writes.set(name, value); }
      }
    }
  },
  writes
});

helpers.setVideoStrength({ opacity: "0.72", cover: "rgba(245,245,247,0.20)" });
assert.equal(writes.get("--video-opacity"), "0.432", "legacy video tiers must not become highly opaque after loading");
assert.equal(writes.get("--video-cover"), "rgba(245,245,247,0.38)", "loaded videos must retain a legible cover");

helpers.setVideoStrength({ opacity: "0.342", cover: "rgba(245,245,247,0.50)" });
assert.equal(writes.get("--video-opacity"), "0.342", "already subdued videos should keep their configured opacity");
assert.equal(writes.get("--video-cover"), "rgba(245,245,247,0.50)");

helpers.setVideoStrength({ opacity: "invalid", cover: "invalid" });
assert.equal(writes.get("--video-opacity"), "0.342", "malformed configuration must fall back to the subdued opacity");
assert.equal(writes.get("--video-cover"), "rgba(245,245,247,0.50)");

console.log("Homepage background-video opacity checks passed.");
