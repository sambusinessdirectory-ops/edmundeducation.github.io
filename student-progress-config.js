(function configureStudentProgressPortal() {
  "use strict";

  const existing = window.EDMUND_STUDENT_PROGRESS_CONFIG || {};

  window.EDMUND_STUDENT_PROGRESS_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-student-progress.edmundeducation.workers.dev",
    adminUsername: "Sam Admin Dashboard",
    studentLoginRpc: "flashcard_student_login",
    ...existing
  });
})();
