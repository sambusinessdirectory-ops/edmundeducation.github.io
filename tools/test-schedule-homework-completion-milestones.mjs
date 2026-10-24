import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../schedule-system.js', import.meta.url), 'utf8');
const start = source.indexOf('function completedHomeworkCountForDate(date) {');
const end = source.indexOf('function homeworkTypeDefinition(type) {', start);
assert.ok(start >= 0 && end > start);
const events = [];
const state = {
  currentUser: { role: 'student' },
  weekPayload: { entries: [] }
};
const context = vm.createContext({
  state,
  Map,
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  document: { dispatchEvent(event) { events.push(event); } },
  activeStudent() { return { id: 'student-1' }; },
  parseScheduleMessage(message) { return { text: message || '', resources: [] }; }
});
vm.runInContext(source.slice(start, end), context);
const run = (before) => vm.runInContext(`celebrateHomeworkCompletionMilestones(new Map(${JSON.stringify(before)}))`, context);
const entry = (date, completed, message = 'Homework') => ({ scheduleDate: date, isCompleted: completed, message });
const today = '2026-10-25';
const tomorrow = '2026-10-26';

state.weekPayload.entries = [entry(today, true), entry(today, true, ''), entry(tomorrow, true)];
assert.equal(run([[today, 0]]), true);
assert.deepEqual(JSON.parse(JSON.stringify(events.at(-1).detail.milestones)), [{ date: today, count: 1 }]);
assert.equal(run([[tomorrow, 1]]), false, 'another column does not affect this date');
state.weekPayload.entries.push(entry(today, true), entry(today, true));
assert.equal(run([[today, 1]]), true);
assert.deepEqual(JSON.parse(JSON.stringify(events.at(-1).detail.milestones)), [
  { date: today, count: 2 }, { date: today, count: 3 }
]);
state.weekPayload.entries.push(entry(today, true));
assert.equal(run([[today, 3]]), false, 'fourth completed homework has no milestone');
state.currentUser.role = 'admin';
assert.equal(run([[today, 0]]), false, 'admin edits do not show student dialogue');
console.log('Eddy schedule homework milestone count checks passed.');
