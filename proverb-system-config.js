(function configureProverbSystem() {
  "use strict";

  const existing = window.EDMUND_PROVERB_SYSTEM_CONFIG || {};

  window.EDMUND_PROVERB_SYSTEM_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-proverb-system.edmundeducation.workers.dev",
    adminUsername: "Sam Proverb Admin",
    studentLoginRpc: "flashcard_student_login",
    ...existing
  });
})();
