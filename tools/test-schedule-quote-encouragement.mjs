import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SCHEDULE_QUOTES,
  SCHEDULE_QUOTE_ROTATION_START,
  moveQuoteHistoryDay,
  quoteForHongKongDay,
  quoteHistoryState,
  quoteIndexForHongKongDay
} from "../schedule-quotes.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, js, sql, importer] = await Promise.all([
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("supabase-schedule-quote-encouragement.sql"),
  read("tools/import-schedule-quotes.py")
]);

assert.equal(SCHEDULE_QUOTE_ROTATION_START, "2026-08-11");
assert.equal(SCHEDULE_QUOTES.length, 513, "the complete ordered PDF catalogue must be present");
assert.equal(new Set(SCHEDULE_QUOTES.map((quote) => quote.id)).size, 513);
assert.deepEqual(SCHEDULE_QUOTES[0], {
  id: "QUOTE-0001",
  englishQuote: "“The only thing we have to fear is fear itself.”",
  englishAttribution: "Franklin D. Roosevelt, President of the United States",
  chineseQuote: "「我們唯一應當畏懼的，正是畏懼本身。」",
  chineseAttribution: "富蘭克林・D・羅斯福，美國總統"
});
assert.equal(SCHEDULE_QUOTES.at(-1).id, "QUOTE-0513");
assert.equal(SCHEDULE_QUOTES.at(-1).englishAttribution, "Dwight Morrow, American businessman, diplomat and politician");
for (const [index, quote] of SCHEDULE_QUOTES.entries()) {
  assert.equal(quote.id, `QUOTE-${String(index + 1).padStart(4, "0")}`);
  for (const field of ["englishQuote", "englishAttribution", "chineseQuote", "chineseAttribution"]) {
    assert.ok(quote[field].trim(), `${quote.id}.${field} must not be empty`);
    assert.doesNotMatch(quote[field], /’/, `${quote.id}.${field} must follow the site ASCII-apostrophe rule`);
  }
  assert.match(quote.englishQuote, /^“[\s\S]+”$/);
  assert.match(quote.chineseQuote, /^「[\s\S]+」$/);
}
assert.equal(quoteIndexForHongKongDay("2026-08-11"), 0);
assert.equal(quoteIndexForHongKongDay("2026-08-12"), 1);
assert.equal(quoteIndexForHongKongDay("2026-08-10"), 512);
assert.equal(quoteIndexForHongKongDay("2028-01-06"), 513 % 513);
assert.equal(quoteForHongKongDay("2026-08-11"), SCHEDULE_QUOTES[0]);
assert.deepEqual(quoteHistoryState("2026-08-11", "2026-08-20"), {
  dayKey: "2026-08-11",
  firstDayKey: "2026-08-11",
  todayDayKey: "2026-08-20",
  quote: SCHEDULE_QUOTES[0],
  isPublished: true,
  isToday: false,
  canPrevious: false,
  canNext: true
});
assert.equal(quoteHistoryState("2026-08-01", "2026-08-20").dayKey, "2026-08-11", "history must stop at the first published quote");
assert.equal(quoteHistoryState("2026-08-21", "2026-08-20").dayKey, "2026-08-20", "future scheduled quotes must never be exposed");
assert.equal(moveQuoteHistoryDay("2026-08-20", 1, "2026-08-20").dayKey, "2026-08-20", "next must stay disabled on today");
assert.equal(moveQuoteHistoryDay("2026-08-20", -1, "2026-08-20").dayKey, "2026-08-19");
assert.equal(moveQuoteHistoryDay("2026-08-11", -1, "2026-08-20").dayKey, "2026-08-11");
assert.throws(() => quoteIndexForHongKongDay("2026-02-30"), RangeError);
assert.throws(() => quoteIndexForHongKongDay("11/08/2026"), TypeError);

const toolbarAt = html.indexOf("data-copy-week-link");
const quoteAt = html.indexOf("data-daily-quote");
const encouragementAt = html.indexOf("data-weekly-encouragement");
const tableAt = html.indexOf("data-table-region");
assert.ok(toolbarAt >= 0 && toolbarAt < quoteAt && quoteAt < encouragementAt && encouragementAt < tableAt);
assert.match(html, /data-toggle-daily-quote[^>]*aria-pressed="false"[^>]*>隱藏名人語錄</);
assert.match(html, /data-quote-previous[^>]*aria-label="查看上一日名人語錄"/);
assert.match(html, /data-quote-date[^>]*aria-live="polite"/);
assert.match(html, /data-quote-today>返回今日</);
assert.match(html, /data-quote-next[^>]*aria-label="查看下一日名人語錄"/);
assert.match(html, /data-toggle-encouragement[^>]*aria-pressed="false"[^>]*>隱藏打氣說話</);
assert.match(html, /\.daily-quote-panel\s*\{[^}]*font-family:\s*"Times New Roman"/s);
assert.match(html, /\.daily-quote-language\s*\{[^}]*grid-template-columns:/s);
assert.match(html, /\.daily-quote-text\s*\{[^}]*text-align:\s*left/s);
assert.match(html, /\.daily-quote-language\[lang="en"\] \.daily-quote-text\s*\{[^}]*font-size:\s*clamp\(24px,[^}]*31px\)/s);
assert.match(html, /\.daily-quote-language\[lang="zh-Hant"\] \.daily-quote-text\s*\{[^}]*font-size:\s*clamp\(17px,[^}]*21px\)/s);
assert.match(html, /\.daily-quote-attribution\s*\{[^}]*text-align:\s*right/s);
assert.match(html, /\.daily-quote-attribution\s*\{[^}]*white-space:\s*pre-line/s);
assert.match(html, /\.weekly-reflection-panels\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*align-items:\s*stretch[^}]*width:\s*min\(100%,\s*1280px\)/s);
assert.match(html, /\.weekly-reflection-side\s*\{[^}]*display:\s*grid[^}]*gap:\s*14px/s);
assert.match(html, /<div class="weekly-reflection-side">[\s\S]*data-weekly-encouragement[\s\S]*data-reminder-email[\s\S]*<\/div>\s*<\/div>/s);
assert.match(html, /\.daily-quote-panel,\s*\.weekly-encouragement-panel\s*\{[^}]*background:\s*#4a5568/s);
assert.match(html, /\.daily-quote-text\s*\{[^}]*color:\s*#ffc04c/s);
assert.match(html, /\.weekly-encouragement-panel h2\s*\{[^}]*color:\s*#ffc04c/s);
assert.match(html, /\.weekly-encouragement-panel textarea\s*\{[^}]*min-height:\s*72px/s);
assert.match(html, /data-encouragement-message[^>]*maxlength="600"/);
assert.match(html, /data-use-last-encouragement hidden>沿用上週</);
assert.doesNotMatch(html, /A NOTE TO MYSELF · 本週自我鼓勵/);
assert.doesNotMatch(html, /這段說話只會儲存在目前學生帳戶的這一星期。/);
assert.match(html, /\.schedule-slot\.has-entry\.is-more-than-half-completed\s*\{[^}]*#dfa900[^}]*255,\s*224,\s*88/s);
assert.match(html, /\.more-than-half-completed-badge\s*\{[^}]*#ffe05a/i);
assert.match(html, /\.print-entry-more-than-half-completed\s*\{[^}]*#ffe36f/i);

assert.match(js, /moveQuoteHistoryDay,[\s\S]*?quoteHistoryState[\s\S]*?from "\.\/schedule-quotes\.mjs\?v=20260820-1"/);
assert.match(js, /function nextHongKongMidnightTimestamp\(/);
assert.match(js, /Date\.UTC\(year, month - 1, day \+ 1\) - \(8 \* 60 \* 60 \* 1000\)/);
assert.match(js, /const history = quoteHistoryState\(dailyQuoteSelectedDayKey \|\| todayDayKey, todayDayKey\)/);
assert.match(js, /elements\.quoteNext\.disabled = !history\.canNext/);
assert.match(js, /elements\.quoteToday\.hidden = history\.isToday/);
assert.match(js, /function quoteAttributionWithTitleBreak\(/);
assert.match(js, /attribution\.search\(\/\[,，\]\//);
assert.match(js, /`\$\{prefix\} \$\{author\}\$\{separator\}\\n\$\{title\}`/);
assert.match(js, /scheduleDailyQuoteRefresh\(\)/);
assert.match(js, /hideDailyQuote:\s*value\?\.hideDailyQuote === true/);
assert.match(js, /hideEncouragement:\s*value\?\.hideEncouragement === true/);
assert.match(js, /schedule_(?:student|admin)_get_encouragement/g);
assert.match(js, /schedule_(?:student|admin)_save_encouragement/g);
assert.match(js, /schedule_(?:student|admin)_use_previous_encouragement/g);
assert.match(
  js,
  /const \[payload, encouragementPayload, motivationPayload, wellbeingPayload, learningPurposePayload, reminderEmailPayload\][\s\S]*?Promise\.all/s,
);
assert.match(js, /state\.encouragementRequestId === requestId[\s\S]*?state\.weekStart === requestedWeek/s);

assert.match(sql, /create table if not exists public\.schedule_weekly_encouragements/);
assert.match(sql, /primary key \(student_id, week_start\)/);
assert.match(sql, /references public\.flashcard_students\(id\) on delete cascade/);
assert.match(sql, /check \(extract\(isodow from week_start\) = 1\)/);
assert.match(sql, /check \(char_length\(btrim\(message\)\) between 1 and 600\)/);
assert.match(sql, /alter table public\.schedule_weekly_encouragements enable row level security/);
assert.match(sql, /revoke all on table public\.schedule_weekly_encouragements from public, anon, authenticated/);
assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all)[^;]*schedule_weekly_encouragements/i);
assert.match(sql, /on conflict \(student_id, week_start\) do update/);
assert.match(sql, /note\.week_start = p_week_start - 7/g);
assert.match(sql, /This week already has an encouragement message/);
assert.match(sql, /scheduleHideDailyQuote/);
assert.match(sql, /scheduleHideEncouragement/);
for (const rpc of [
  "schedule_student_get_encouragement(uuid, date)",
  "schedule_student_save_encouragement(uuid, date, text)",
  "schedule_student_use_previous_encouragement(uuid, date)",
  "schedule_admin_get_encouragement(uuid, uuid, date)",
  "schedule_admin_save_encouragement(uuid, uuid, date, text)",
  "schedule_admin_use_previous_encouragement(uuid, uuid, date)"
]) {
  assert.match(sql, new RegExp(`grant execute on function public\\.${rpc.replace(/[().]/g, "\\$&")}\\s+to authenticated`));
}
for (const helper of [
  "_schedule_display_preferences(uuid)",
  "_schedule_set_display_preferences(uuid, jsonb)",
  "_schedule_encouragement_payload(uuid, date)",
  "_schedule_save_encouragement(uuid, date, text)",
  "_schedule_use_previous_encouragement(uuid, date)"
]) {
  assert.match(sql, new RegExp(`revoke all on function public\\.${helper.replace(/[().]/g, "\\$&")}\\s+from public, anon, authenticated`));
}

assert.match(importer, /DEFAULT_SOURCE = Path\("\/Users\/sammak\/Downloads\/Quote and Translation Database for Website\.pdf"\)/);
assert.match(importer, /if len\(records\) != 513:/);
assert.match(importer, /replace\("’", "'"\)/);

console.log("Schedule quote and weekly encouragement tests passed.");
