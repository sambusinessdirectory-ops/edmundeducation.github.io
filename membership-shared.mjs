// Shared display/validation helpers. Never stores credentials or decides paid access.
export const SALES_ENABLED = false;
export const CURRENCIES = ['HKD', 'USD'];
export const SYSTEMS = [
  ['flashcards', 'Flash Cards 閃卡'], ['writing-practice', 'Fill in the Blanks 寫作練習'],
  ['writing-submission', 'Writing 交文系統'], ['listening', '英語聆聽'],
  ['speaking', 'Speaking 說話練習'], ['grammar', 'Grammar 文法'],
  ['sentence-structure', 'Sentence Structure 句子結構'], ['idiom', 'Idiom 慣用語'],
  ['proverb', 'Proverb 諺語'], ['phrasal-verb', 'Phrasal Verb 動詞片語'],
  ['video-class', '課堂影片'], ['schedule', '功課及溫習安排'], ['song-appreciation', '英文歌聆聽練習'],
  ['reading-comprehension', 'Reading Comprehension 閱讀理解']
];
export function safeHttps(value) {
  if (!value) return '';
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
export function amountFromInput(value) {
  if (String(value).trim() === '') return null;
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(String(value))) throw new Error('月費請填有效金額，最多兩位小數。');
  const cents = Math.round(Number(value) * 100);
  if (cents <= 0 || cents > 100000000) throw new Error('月費必須大於 0。');
  return cents;
}
export function formatAmount(minor, currency = 'HKD') {
  if (minor === null || minor === undefined) return '價格待公布';
  return new Intl.NumberFormat('en-HK', { style: 'currency', currency, maximumFractionDigits: 2 }).format(minor / 100);
}
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export function newPlan() {
  return { id: crypto.randomUUID(), title: '新會員計劃', summary: '', amount_minor: null, currency: 'HKD', benefits: [], system_ids: [], stripe_test_price_id: '', stripe_live_price_id: '', visible: false };
}
