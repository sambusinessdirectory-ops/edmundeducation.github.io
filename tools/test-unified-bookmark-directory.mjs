import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [sql, html, js, home, nav] = await Promise.all([
  read("supabase-unified-bookmark-directory-20260821.sql"), read("bookmark-directory.html"),
  read("bookmark-directory.js"), read("index.html"), read("shared-system-nav.js")
]);

assert.match(sql, /student_unified_bookmark_directory\(p_student_token uuid\)/);
assert.match(sql, /if \(select auth\.uid\(\)\) is null/);
assert.match(sql, /flashcard_session_student_id\(p_student_token\)/);
assert.match(sql, /raise exception 'Invalid or expired student session'/);
for (const source of [
  "flashcard_student_state", "writing_student_state", "common_expression_bookmarks",
  "idiom_system_bookmarks", "proverb_system_bookmarks", "phrasal_verb_system_bookmarks",
  "sentence_structure_bookmarks", "song_appreciation_bookmarks", "video_class_bookmarks",
  "writing_submission_feedback_fragment_bookmarks"
]) assert.match(sql, new RegExp(`public\\.${source}`));
assert.match(sql, /revoke all on function public\.student_unified_bookmark_directory\(uuid\) from public, anon, authenticated/);
assert.match(sql, /grant execute on function public\.student_unified_bookmark_directory\(uuid\) to authenticated/);

assert.match(html, /學生使用[\s\S]*書簽總目錄/);
assert.match(html, /data-system="bookmark-directory"/);
assert.match(js, /student_unified_bookmark_directory/);
assert.match(js, /flashcard_student_login/);
assert.match(js, /bridgeStudentSession/);
assert.match(js, /className = "bookmark-card-content"/);
assert.match(js, /detail\.textContent = item\.detail \|\| item\.title/);
assert.match(js, /在目錄中閱讀/);
assert.match(js, /iframe\.src = href/);
assert.match(js, /前往原系統位置/);
assert.match(home, /href="bookmark-directory\.html"/);
assert.match(nav, /id: "bookmark-directory"/);

console.log("Unified owner-scoped bookmark directory contracts passed.");
