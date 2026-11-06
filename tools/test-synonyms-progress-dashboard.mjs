import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  dashboardDates, formatDuration, hkDate, mergeAnswer, moduleIdForQuestionKey
} from '../synonyms/progress.mjs';

const ids = ['important', 'social-media', 'lesson-v2-003', 'lesson-src-abc123'];
assert.equal(moduleIdForQuestionKey('1-1', ids), 'important');
assert.equal(moduleIdForQuestionKey('social-3-2', ids), 'social-media');
assert.equal(moduleIdForQuestionKey('lesson-v2-003-4-2', ids), 'lesson-v2-003');
assert.equal(moduleIdForQuestionKey('lesson-src-abc123-9-1', ids), 'lesson-src-abc123');
assert.equal(moduleIdForQuestionKey('unknown-1-1', ids), null);

assert.deepEqual(mergeAnswer({ attempts: 3, mastered: true, lastChoice: 'B' }, {
  attempts: 2, mastered: false, last_choice: 'A', last_correct: false
}), { attempts: 3, mastered: true, lastChoice: 'B' });
assert.deepEqual(mergeAnswer(null, {
  attempts: 2, mastered: true, last_choice: 'C', last_correct: true, updated_at: '2026-11-06T01:00:00Z'
}), { attempts: 2, mastered: true, lastChoice: 'C', lastCorrect: true, answeredAt: '2026-11-06T01:00:00Z' });

assert.equal(hkDate('2026-11-05T16:30:00Z'), '2026-11-06');
assert.deepEqual(dashboardDates('7', [], [], new Date('2026-11-06T03:00:00Z')), [
  '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'
]);
assert.deepEqual(dashboardDates('all', [{ date: '2026-11-01' }], [{ date: '2026-11-03' }], new Date('2026-11-06T03:00:00Z')), [
  '2026-11-01', '2026-11-03', '2026-11-06'
]);
assert.equal(formatDuration(90500), '1 分 30 秒');
assert.equal(formatDuration(3720000), '1 小時 02 分');

const app = fs.readFileSync(new URL('../synonyms/app.mjs', import.meta.url), 'utf8');
const sql = fs.readFileSync(new URL('../supabase/migrations/20261106154500_synonyms_progress_dashboard.sql', import.meta.url), 'utf8');
assert.match(app, /mergeAllModuleProgress/);
assert.match(app, /synonyms_progress_dashboard/);
assert.match(app, /synonyms_progress_record_time/);
assert.match(app, /data-dashboard-range/);
assert.match(sql, /auth\.uid\(\) is null/);
assert.match(sql, /on conflict \(student_id, system_key, event_key\) do update/);
assert.doesNotMatch(sql, /pg_catalog\.least/);
assert.match(sql, /grant execute on function public\.synonyms_progress_dashboard\(uuid\) to authenticated/);
assert.match(sql, /grant execute on function public\.synonyms_progress_record_time\(uuid, integer\) to authenticated/);

console.log('PASS: Synonyms account-wide progress, dashboard ranges, duration formatting, and owner-scoped RPC wiring.');
