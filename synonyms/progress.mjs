export function moduleIdForQuestionKey(questionKey, moduleIds) {
  const key = String(questionKey || '');
  if (/^\d+-\d+$/.test(key)) return 'important';
  if (/^social-\d+-\d+$/.test(key)) return 'social-media';
  return [...moduleIds]
    .filter(id => id !== 'important' && id !== 'social-media')
    .sort((a, b) => b.length - a.length)
    .find(id => key.startsWith(`${id}-`)) || null;
}

export function mergeAnswer(local, row) {
  const remote = {
    attempts: Number(row?.attempts) || 1,
    mastered: row?.mastered === true,
    lastChoice: row?.last_choice,
    lastCorrect: row?.last_correct === true,
    answeredAt: row?.updated_at
  };
  if (local && Number(local.attempts) > remote.attempts) {
    return { ...local, mastered: Boolean(local.mastered || remote.mastered) };
  }
  return { ...remote, mastered: Boolean(local?.mastered || remote.mastered) };
}

export function hkDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(value));
}

export function dashboardDates(range, activityDays = [], timeDays = [], now = new Date()) {
  const today = hkDate(now);
  if (range === 'all') {
    return [...new Set([
      ...activityDays.map(row => row.date),
      ...timeDays.map(row => row.date),
      today
    ])].filter(Boolean).sort();
  }
  const count = range === '30' ? 30 : 7;
  const dates = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(`${today}T12:00:00+08:00`);
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(hkDate(date));
  }
  return dates;
}

export function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${hours} 小時 ${String(minutes).padStart(2, '0')} 分`
    : `${minutes} 分 ${String(remainder).padStart(2, '0')} 秒`;
}
