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
    plannerTaskArchiveRpc: "execution_system_planner_task_archive",
    plannerTaskTimerRpc: "execution_system_planner_task_timer",
    plannerTaskRatingRpc: "execution_system_planner_task_rating",
    plannerTaskMoveRpc: "execution_system_planner_task_move_tomorrow",
    plannerTaskReactivateRpc: "execution_system_planner_task_reactivate",
    plannerAnalyticsRpc: "execution_system_planner_analytics_load",
    plannerThinkingRecordRpc: "execution_system_planner_thinking_record",
    plannerThinkingLogsRpc: "execution_system_planner_thinking_logs_load",
    plannerHourBlocksLoadRpc: "execution_system_planner_hour_blocks_load",
    plannerHourBlockSaveRpc: "execution_system_planner_hour_block_save",
    plannerCompletedTasksRpc: "execution_system_planner_completed_tasks_load"
  });
})();
