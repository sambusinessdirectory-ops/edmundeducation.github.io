(function configureEdmundVideoClass() {
  "use strict";

  window.EDMUND_VIDEO_CLASS = Object.freeze({
    apiBase: "https://edmund-video-class.edmundeducation.workers.dev",
    turnstileSiteKey: "0x4AAAAAAEMnAs-IVJ4ESqn3",
    requestTimeoutMs: 20000,
    heartbeatIntervalMs: 15000
  });
})();
