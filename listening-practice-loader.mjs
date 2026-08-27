// One schema and renderer for every practice. Existing Practice 1 bookmark row
// indexes are deliberately retained by the legacy adapter.
const cache = new Map();
const pending = new Map();
export function validatePractice(data, number) {
  if (data?.schemaVersion !== 1 || data.practice !== number || data.parts?.length !== 4) throw new Error('練習資料格式不正確。');
  const numbers = data.parts.flatMap(part => part.questions.flatMap(q => q.numbers || [q.number]));
  if (numbers.length !== 40 || new Set(numbers).size !== 40 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 40)) throw new Error('題目資料不完整。');
  if (new Set(data.parts.map(part => part.part)).size !== 4 || data.parts.some(part => ![1,2,3,4].includes(part.part))) throw new Error('錄音部分資料不完整。');
  if (Object.keys(data.analysis || {}).length !== 40) throw new Error('答案解析資料不完整。');
  for (const part of data.parts) {
    const rows = data.transcript?.[part.part];
    const ranges = data.timings?.parts?.[part.part]?.lines;
    if (!rows?.length || !ranges || ranges.length !== rows.length) throw new Error('錄音稿或時間資料不完整。');
    if (rows.some(row => !row.en || !row.zh)) throw new Error('中英錄音稿資料不完整。');
    if (number !== 1 && ranges.some(range => !Number.isFinite(range.start) || !Number.isFinite(range.end) || range.start < 0 || range.end <= range.start)) throw new Error('逐行錄音時間未完成核對。');
  }
  return data;
}
export function getLoadedPractice(number) { return cache.get(Number(number)) || null; }
export async function loadPractice(number) {
  number = Number(number);
  if (!Number.isInteger(number) || number < 1) throw new Error('無效的練習編號。');
  if (cache.has(number)) return cache.get(number);
  if (pending.has(number)) return pending.get(number);
  const request = (async () => {
    let data;
    if (number === 1 && globalThis.window?.EDMUND_IELTS_LISTENING_PRACTICE_1) {
      data = { ...window.EDMUND_IELTS_LISTENING_PRACTICE_1, schemaVersion: 1, practice: 1,
        transcript: window.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT,
        analysis: window.EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS,
        timings: window.EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS };
    } else {
      const response = await fetch(`assets/listening/practices/practice-${number}.json?v=20260827-import1`, { credentials: 'omit' });
      if (!response.ok) throw new Error(`Practice ${number} 未能載入，請按「重試」。`);
      data = await response.json();
    }
    validatePractice(data, number);
    cache.set(number, data);
    return data;
  })().finally(() => pending.delete(number));
  pending.set(number, request);
  return request;
}
