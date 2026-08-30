(function configureWritingSubmissionSystem() {
  "use strict";

  const existing = window.EDMUND_WRITING_SUBMISSION_CONFIG || {};

  window.EDMUND_WRITING_SUBMISSION_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-writing-submission.edmundeducation.workers.dev",
    submissionProxyUrl: "https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/writing-submission-proxy",
    adminUsername: "Sam Admin Writing Grammar Check",
    studentLoginRpc: "flashcard_student_login",
    ...existing
  });
})();
