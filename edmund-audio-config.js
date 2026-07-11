/*
 * Leave blank to serve audio from the website repository.
 * For a future Cloudflare R2 move, set this once to the public custom-domain root,
 * for example: "https://audio.example.com".
 */
window.EDMUND_AUDIO_BASE_URL = "";

window.EDMUND_AUDIO_URL = function edmundAudioUrl(path) {
  const value = String(path || "");
  if (!value || /^(?:https?:)?\/\//i.test(value)) return value;
  const base = String(window.EDMUND_AUDIO_BASE_URL || "").replace(/\/+$/, "");
  return base ? `${base}/${value.replace(/^\/+/, "")}` : value;
};
