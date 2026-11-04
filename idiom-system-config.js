(function configureIdiomSystem() {
  "use strict";

  const existing = window.EDMUND_IDIOM_SYSTEM_CONFIG || {};

  window.EDMUND_IDIOM_SYSTEM_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-idiom-system.edmundeducation.workers.dev",
    adminUsername: "Sam Admin Idiom",
    studentLoginRpc: "flashcard_student_login",
    ...existing
  });
})();
