/*
 * Leave blank to serve audio from the website repository.
 * For a future Cloudflare R2 move, set this once to the public custom-domain root,
 * for example: "https://audio.example.com".
 */
window.EDMUND_AUDIO_BASE_URL = "";

// Part 3 is intentionally kept out of GitHub Pages because the complete
// 16-book library would push the published site beyond its 1 GB limit. The
// read-only Worker serves the matching immutable R2 object keys.
window.EDMUND_SPEAKING_PART3_AUDIO_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev";

window.EDMUND_AUDIO_URL = function edmundAudioUrl(path) {
  const value = String(path || "");
  if (!value || /^(?:https?:)?\/\//i.test(value)) return value;
  const part3Base = String(window.EDMUND_SPEAKING_PART3_AUDIO_BASE_URL || "").replace(/\/+$/, "");
  const base = value.startsWith("assets/speaking-system/audio/edmund-neural/part3/") && part3Base
    ? part3Base
    : String(window.EDMUND_AUDIO_BASE_URL || "").replace(/\/+$/, "");
  return base ? `${base}/${value.replace(/^\/+/, "")}` : value;
};
