/*
 * Leave blank to serve audio from the website repository.
 * Set this once to the public audio-delivery root,
 * for example: "https://audio.example.com".
 */
window.EDMUND_AUDIO_BASE_URL = "";

// Part 1 and Part 3 use immutable object keys through the same read-only
// audio service. Part 2, flashcards, and writing audio keep their existing paths.
window.EDMUND_SPEAKING_CLOUD_AUDIO_BASE_URL = "https://edmund-neural-audio.edmundeducation.workers.dev";
window.EDMUND_SPEAKING_PART3_AUDIO_BASE_URL = window.EDMUND_SPEAKING_CLOUD_AUDIO_BASE_URL;

window.EDMUND_AUDIO_URL = function edmundAudioUrl(path) {
  const value = String(path || "");
  if (!value || /^(?:https?:)?\/\//i.test(value)) return value;
  const speakingBase = String(window.EDMUND_SPEAKING_CLOUD_AUDIO_BASE_URL || window.EDMUND_SPEAKING_PART3_AUDIO_BASE_URL || "").replace(/\/+$/, "");
  const cloudSpeakingPath = value.startsWith("assets/speaking-system/audio/edmund-neural/part1/")
    || value.startsWith("assets/speaking-system/audio/edmund-neural/part3/")
    || value.startsWith("assets/speaking-system/audio/edmund-neural/exam/");
  const base = cloudSpeakingPath && speakingBase
    ? speakingBase
    : String(window.EDMUND_AUDIO_BASE_URL || "").replace(/\/+$/, "");
  return base ? `${base}/${value.replace(/^\/+/, "")}` : value;
};
