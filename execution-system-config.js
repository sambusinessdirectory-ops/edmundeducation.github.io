(function configureExecutionSystem() {
  "use strict";

  window.EDMUND_EXECUTION_CONFIG = Object.freeze({
    sessionKey: "edmund-execution-system-session-v1",
    universalStudentSessionKey: "edmund-universal-student-session-v1",
    progressPrefix: "edmund-execution-system-progress-v1",
    adminUsername: "Sam Execution Psychology Table",
    studentLoginRpc: "flashcard_student_login",
    studentProfileRpc: "flashcard_student_session_profile",
    adminLoginRpc: "execution_system_admin_login",
    adminMeRpc: "execution_system_admin_me",
    adminLogoutRpc: "execution_system_admin_logout",
    achievementLoadRpc: "execution_system_step_achievements_load",
    achievementAdjustRpc: "execution_system_step_achievement_adjust",
    plannerCapacityRpc: "execution_system_planner_day_capacity",
    plannerCapacityAddRpc: "execution_system_planner_capacity_add",
    plannerTasksLoadRpc: "execution_system_planner_tasks_load",
    plannerTaskSaveRpc: "execution_system_planner_task_save",
    plannerTaskArchiveRpc: "execution_system_planner_task_archive"
  });
})();
