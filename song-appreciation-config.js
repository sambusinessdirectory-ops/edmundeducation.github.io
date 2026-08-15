(function configureSongAppreciation() {
  "use strict";

  window.EDMUND_SONG_APPRECIATION_CONFIG = Object.freeze({
    sessionKey: "edmund-song-appreciation-session-v1",
    dashboardPreferenceKey: "edmund-song-appreciation-dashboard-v1",
    adminUsername: "Sam Admin Song Appreciation Control",
    studentLoginRpc: "flashcard_student_login",
    rpc: Object.freeze({
      adminLogin: "song_appreciation_admin_login",
      adminMe: "song_appreciation_admin_me",
      adminLogout: "song_appreciation_admin_logout",
      studentMe: "song_appreciation_student_me",
      listSongs: "song_appreciation_student_list_songs",
      getSong: "song_appreciation_student_get_song",
      listBookmarks: "song_appreciation_bookmark_list",
      addBookmark: "song_appreciation_bookmark_add",
      deleteBookmark: "song_appreciation_bookmark_delete",
      listAttempts: "song_appreciation_attempt_list",
      saveAttempt: "song_appreciation_attempt_save",
      adminListSongs: "song_appreciation_admin_list_songs",
      adminUpsertSong: "song_appreciation_admin_upsert_song",
      adminListStudents: "song_appreciation_admin_list_students_with_access",
      adminSetAccess: "song_appreciation_admin_set_access"
    })
  });
})();
