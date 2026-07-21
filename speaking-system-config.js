(function configureEdmundSpeakingSystem() {
  "use strict";

  /*
   * Set workerBaseUrl after the Cloudflare Worker is deployed, for example:
   *   workerBaseUrl: "https://speaking-api.example.workers.dev"
   * If a custom API hostname is used instead of *.workers.dev, add that exact
   * HTTPS origin to `connect-src` in speaking-system.html's CSP.
   *
   * The admin password is a Worker secret. Never add it to this public file.
   */
  const existing = window.EDMUND_SPEAKING_CONFIG || {};
  const existingEndpoints = existing.endpoints || {};

  window.EDMUND_SPEAKING_CONFIG = Object.freeze({
    workerBaseUrl: "https://edmund-speaking-system.edmundeducation.workers.dev",
    adminUsername: "Sam Admin Speaking",
    studentLoginRpc: "flashcard_student_login",
    maxRecordingSeconds: 300,
    maxUploadBytes: 3 * 1024 * 1024,
    clientZipMaxFiles: 40,
    clientZipMaxBytes: 32 * 1024 * 1024,
    endpoints: Object.freeze({
      adminLogin: "/v1/admin/login",
      adminMe: "/v1/admin/me",
      adminLogout: "/v1/admin/logout",
      studentMe: "/v1/student/me",
      examAttempts: "/v1/exam-attempts",
      recordings: "/v1/recordings",
      recordingFileSuffix: "",
      recordingsZip: "/v1/recordings/export",
      ...existingEndpoints
    }),
    ...existing,
    endpoints: Object.freeze({
      adminLogin: "/v1/admin/login",
      adminMe: "/v1/admin/me",
      adminLogout: "/v1/admin/logout",
      studentMe: "/v1/student/me",
      examAttempts: "/v1/exam-attempts",
      recordings: "/v1/recordings",
      recordingFileSuffix: "",
      recordingsZip: "/v1/recordings/export",
      ...existingEndpoints
    })
  });
})();
