import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Load the same ordered scripts as Writing Practice, including the separately released Part B pack.
export function loadVerifiedWritingAudio() {
  const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
  const html = read("writing-practice.html");
  const scripts = [...html.matchAll(/<script src="(writing-audio(?:-dse-part-b)?-manifest\.js)\?v=[^"]+"><\/script>/g)].map(match => match[1]);
  assert.deepEqual(scripts, ["writing-audio-manifest.js", "writing-audio-dse-part-b-manifest.js"]);
  const window = {};
  for (const file of scripts) vm.runInNewContext(read(file), { window }, { filename: file });
  const base = window.EDMUND_WRITING_AUDIO_META;
  const extra = window.EDMUND_DSE_WRITING_PART_B_WRITING_AUDIO_META;
  assert.equal(extra.complete, true);
  assert.equal(extra.count, 86);
  assert.equal(base.count, 321);
  assert.equal(Object.keys(window.EDMUND_WRITING_AUDIO).length, base.count + extra.count);
  return window;
}
