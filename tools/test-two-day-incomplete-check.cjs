const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

(async () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'schedule-system.js'), 'utf8');
  const start = source.indexOf('const checkedIncompleteHomeworkDays = new Set();');
  const end = source.indexOf('async function loadWeek(', start);
  assert.ok(start > 0 && end > start);
  const calendar = await import('../schedule-calendar.mjs');
  const run = async ({ today, loadedWeek, loadedEntries, fetchedEntries = {}, studentRole = 'student' }) => {
    const calls = [];
    const events = [];
    const state = { currentUser: { role: studentRole, id: 's1', studentToken: 'token' } };
    const context = vm.createContext({
      ...calendar,
      state,
      loadedWeek,
      loadedEntries,
      console,
      Set,
      hongKongDayKey: () => today,
      parseScheduleMessage: (message) => ({ text: message || '', resources: [] }),
      callRpc: async (name, args) => { calls.push(args.p_week_start); return { entries: fetchedEntries[args.p_week_start] || [] }; },
      document: { dispatchEvent: (event) => events.push(event) },
      CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
    });
    vm.runInContext(source.slice(start, end), context);
    await vm.runInContext('checkTwoDayIncompleteHomework({id:"s1"}, "token", loadedWeek, loadedEntries)', context);
    return { calls, events };
  };
  const overdue = (date, done = false) => ({ scheduleDate: date, message: 'Assigned task', isCompleted: done });
  const monday = await run({ today: '2026-10-26', loadedWeek: '2026-10-26', loadedEntries: [], fetchedEntries: { '2026-10-19': [overdue('2026-10-24'), overdue('2026-10-25')] } });
  assert.deepEqual(monday.calls, ['2026-10-19']);
  assert.equal(monday.events.length, 1, 'Monday checks Saturday and Sunday across a week boundary');
  const tuesday = await run({ today: '2026-10-27', loadedWeek: '2026-10-26', loadedEntries: [overdue('2026-10-26')], fetchedEntries: { '2026-10-19': [overdue('2026-10-25', true)] } });
  assert.deepEqual(tuesday.calls, ['2026-10-19']);
  assert.equal(tuesday.events.length, 0, 'a completed prior-day task suppresses the reminder');
  const empty = await run({ today: '2026-10-26', loadedWeek: '2026-10-26', loadedEntries: [], fetchedEntries: { '2026-10-19': [] } });
  assert.equal(empty.events.length, 0, 'no assigned homework does not trigger a reminder');
  console.log('Two-day incomplete homework date and completion checks passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
