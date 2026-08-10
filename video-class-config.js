(function configureEdmundVideoClass() {
  "use strict";

  window.EDMUND_VIDEO_CLASS = Object.freeze({
    apiBase: "https://edmund-video-class.edmundeducation.workers.dev",
    requestTimeoutMs: 20000,
    heartbeatIntervalMs: 15000
  });
})();
