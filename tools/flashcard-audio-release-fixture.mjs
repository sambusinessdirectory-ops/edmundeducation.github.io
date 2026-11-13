import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const PACKED_AUDIO_PREFIX = "assets/flashcards/audio/edmund-neural/v1/";
let packedAudioPaths;

function loadPackedAudioPaths(root) {
  if (packedAudioPaths) return packedAudioPaths;
  const indexPath = path.join(root, "workers/edmund-site-assets/src/flashcard-pack-index-v1.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  assert.equal(index.meta?.r2UploadComplete, true, "Flashcard audio pack release is incomplete");
  assert.equal(
    index.audioPathPrefix,
    `site-assets/v1/${PACKED_AUDIO_PREFIX}`,
    "Flashcard audio pack path prefix changed"
  );

  packedAudioPaths = new Map();
  for (const [shard, entries] of Object.entries(index.entries || {})) {
    for (const [suffix, tuple] of Object.entries(entries || {})) {
      packedAudioPaths.set(`${PACKED_AUDIO_PREFIX}${shard}/${shard}${suffix}.mp3`, tuple);
    }
  }
  assert.equal(packedAudioPaths.size, index.meta.entryCount, "Flashcard audio pack entry count changed");
  return packedAudioPaths;
}

export function assertPublishedFlashcardAudio(root, audioUrl, label) {
  const localPath = path.join(root, audioUrl);
  if (fs.existsSync(localPath)) {
    assert.ok(fs.statSync(localPath).size > 1000, `${label}: local audio file is too small`);
    return;
  }

  assert.ok(audioUrl.startsWith(PACKED_AUDIO_PREFIX), `${label}: local audio file is missing`);
  const tuple = loadPackedAudioPaths(root).get(audioUrl);
  assert.ok(tuple, `${label}: packed audio entry is missing`);
  assert.ok(
    Array.isArray(tuple) && tuple.length === 2 && tuple[1] > 1000,
    `${label}: packed audio entry is invalid`
  );
}
