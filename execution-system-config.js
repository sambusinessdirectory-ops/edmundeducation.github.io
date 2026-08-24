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
    plannerCompletedTasksRpc: "execution_system_planner_completed_tasks_load",
    plannerTaskTagsRpc: "execution_system_planner_task_tags_set",
    plannerTaskTimeSetRpc: "execution_system_planner_task_time_set",
    plannerPrioritiesRpc: "execution_system_planner_priorities_save",
    plannerDaySummaryRpc: "execution_system_planner_day_summary",
    plannerStep20Rpc: "execution_system_planner_step20_load",
    plannerTaggedTasksRpc: "execution_system_planner_tagged_tasks_load",
    plannerMetricsRpc: "execution_system_planner_metrics_load",
    taskTags: Object.freeze([
      Object.freeze({ key: "reluctant", label: "唔想做...", color: "#ab12e6", textColor: "#ffffff" }),
      Object.freeze({ key: "favourite", label: "我最喜愛功課", color: "#ff3473", textColor: "#25182b" }),
      Object.freeze({ key: "teacher-added", label: "老師新加", color: "#920909", textColor: "#ffffff" }),
      Object.freeze({ key: "well-done", label: "Well done!", color: "#ffd591", textColor: "#25182b" }),
      Object.freeze({ key: "break-15", label: "每15分鐘休息一次", color: "#a1ff80", textColor: "#25182b" }),
      Object.freeze({ key: "prepare-materials", label: "準備材料", color: "#32cd32", textColor: "#143714" }),
      Object.freeze({ key: "hardest-today", label: "本日最難", color: "#7f1734", textColor: "#ffffff" }),
      Object.freeze({ key: "easiest-today", label: "本日最簡單", color: "#74c9f1", textColor: "#173b51" })
    ])
  });
})();
