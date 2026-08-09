(function configureCommonExpressionSystem() {
  "use strict";

  const existing = window.EDMUND_COMMON_EXPRESSION_CONFIG || {};
  window.EDMUND_COMMON_EXPRESSION_CONFIG = Object.freeze({
    studentLoginRpc: "flashcard_student_login",
    snapshotRpc: "common_expression_student_snapshot",
    saveStateRpc: "common_expression_save_lesson_state",
    setBookmarkRpc: "common_expression_set_bookmark",
    ...existing
  });
})();
