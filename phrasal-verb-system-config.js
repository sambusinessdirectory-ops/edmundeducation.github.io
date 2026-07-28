(function configurePhrasalVerbSystem() {
  "use strict";

  const existing = window.EDMUND_PHRASAL_VERB_SYSTEM_CONFIG || {};

  window.EDMUND_PHRASAL_VERB_SYSTEM_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-phrasal-verb-system.edmundeducation.workers.dev",
    adminUsername: "Sam Phrasal Verb Admin",
    studentLoginRpc: "flashcard_student_login",
    ...existing
  });
})();
