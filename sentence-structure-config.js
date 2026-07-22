(function configureSentenceStructureSystem() {
  "use strict";

  const existing = window.EDMUND_SENTENCE_STRUCTURE_CONFIG || {};

  window.EDMUND_SENTENCE_STRUCTURE_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-sentence-structure.edmundeducation.workers.dev",
    adminUsername: "Sam Sentence Structure",
    studentLoginRpc: "flashcard_student_login",
    ...existing
  });
})();
