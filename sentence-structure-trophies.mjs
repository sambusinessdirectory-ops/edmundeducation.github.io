export const GOLDEN_EDDIE_ART = 'assets/sentence-structure/rewards/golden-eddie-v1.webp';
export const GOLDEN_EDDIE_MAP_ART = 'assets/sentence-structure/rewards/golden-eddie-map-v2.webp';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// One trophy per module, earned from one complete 50-question attempt.
// Use the existing account-scoped attempts; never combine partial attempts or
// maintain a second reward store. Older records may contain counts without IDs.
export function sentenceTrophyState(lesson, attempts = []) {
  const questions = lesson?.questions || [];
  const expected = new Set(questions.map(q => q.id));
  const eligible = questions.length === 50 && expected.size === 50;
  let correct = 0, earned = false;
  for (const attempt of attempts) {
    if (attempt.lessonId !== lesson?.id) continue;
    const count = Number(attempt.correctCount);
    if (!Number.isFinite(count) || count < 0) continue;
    const ids = attempt.result?.correctIds;
    const actual = Array.isArray(ids) ? new Set(ids.filter(id => expected.has(id))).size : count;
    correct = Math.max(correct, Math.min(50, count, actual));
    if (eligible && attempt.status === 'completed' && Number(attempt.totalCount) === 50
      && count === 50 && actual === 50) earned = true;
  }
  return { eligible, earned, correct: Math.floor(correct), total: 50 };
}

export function sentenceTrophyCollection(lessons, attempts = []) {
  const grouped = new Map();
  for (const attempt of attempts) {
    if (!grouped.has(attempt.lessonId)) grouped.set(attempt.lessonId, []);
    grouped.get(attempt.lessonId).push(attempt);
  }
  return lessons.map((lesson, index) => ({ lesson, order: index + 1,
    ...sentenceTrophyState(lesson, grouped.get(lesson.id) || []) })).filter(item => item.eligible);
}

function trophySparkles() {
  return `<span class="ss-trophy-sparkles" aria-hidden="true">${'<i></i>'.repeat(6)}</span>`;
}

export function goldenEddieFigure(order, { preview = false, eager = false } = {}) {
  return `<figure class="ss-trophy-figure${preview ? ' is-preview' : ''}"><img src="${GOLDEN_EDDIE_ART}" width="768" height="768" alt="${preview ? '金色 Eddie 獎座預覽' : '金色 Eddie Horsey 獎座與金色底座'}" loading="${eager ? 'eager' : 'lazy'}" draggable="false"><span class="ss-trophy-engraving" aria-hidden="true">${escape(String(order).padStart(2, '0'))}</span>${preview ? "" : trophySparkles()}</figure>`;
}

export function renderSentenceTrophyShelf(root, collection) {
  if (!root) return;
  const earned = collection.filter(item => item.earned);
  const next = collection.filter(item => !item.earned).sort((a, b) => b.correct - a.correct || a.order - b.order)[0];
  const cards = [...earned, ...(next ? [next] : [])];
  root.innerHTML = `<summary class="ss-trophy-summary"><img src="${GOLDEN_EDDIE_ART}" alt="" width="72" height="72" draggable="false"><span><small>THE GOLDEN HORSEY COLLECTION</small><strong>我的金色 Horsey 獎座</strong><span>每完成一個句型的全部 50 題，就能獲得一座金色 Eddie。</span></span><b data-trophy-count>${earned.length} / ${collection.length}<small>已獲得獎座</small></b><i aria-hidden="true">⌄</i></summary>
    <div class="ss-trophy-cabinet"><div class="ss-trophy-cabinet-heading"><h2>你的努力，閃閃發光</h2><p>${earned.length ? `已獲得 ${earned.length} 座獎座。每座底座上的數字，代表你已完成的句型。` : '第一座金色 Eddie 正在等你。完成下面句型的全部 50 題，就能把它放上你的展示台。'}</p></div><div class="ss-trophy-grid">${cards.map(item => `<article class="ss-trophy-display${item.earned ? ' is-earned' : ' is-locked'}" data-trophy-lesson="${escape(item.lesson.id)}" data-trophy-earned="${item.earned}"><span class="ss-trophy-status">${item.earned ? '✓ 已獲得 · EARNED' : '下一座獎座 · UP NEXT'}</span>${goldenEddieFigure(item.order, {preview: !item.earned})}<div class="ss-trophy-nameplate"><small>MODULE ${String(item.order).padStart(2, '0')}</small><h3>${escape(item.lesson.titleEn || item.lesson.title)}</h3><p>${escape(item.lesson.title || item.lesson.titleZh || '')}</p><span>${item.correct} / 50 題已完成</span></div><button type="button" class="ss-trophy-action" data-open-lesson="${escape(item.lesson.id)}">${item.earned ? '重溫句型' : '繼續學習'} <span aria-hidden="true">→</span></button></article>`).join('')}</div></div>`;
}

// An elevated trophy on the existing walkable platform. It does not replace
// the platform, change its route, or write completion data.
export function syncSentenceMapTrophies(root, lessons, earnedIds) {
  if (!root) return;
  const platforms = [...root.querySelectorAll('[data-map-level]')];
  const rooms = new Map();
  for (const platform of platforms) if (platform.dataset.hotelRoom) rooms.set(platform.dataset.hotelRoom, (rooms.get(platform.dataset.hotelRoom) || 0) + 1);
  for (const platform of platforms) {
    if (platform.dataset.hotelRoom) platform.dataset.trophyRoomPaired = String(rooms.get(platform.dataset.hotelRoom) > 1);
    const lesson = lessons[Number(platform.dataset.mapLevel)];
    const earned = earnedIds.has(lesson?.id);
    let marker = platform.querySelector('.ss-trophy-marker');
    if (earned && !marker) {
      marker = document.createElement('img');
      marker.className = 'ss-trophy-marker'; marker.src = platform.hasAttribute('data-hotel') ? GOLDEN_EDDIE_ART : GOLDEN_EDDIE_MAP_ART;
      marker.alt = ''; marker.setAttribute('aria-hidden', 'true'); marker.draggable = false;
      marker.width = 72; marker.height = 72; marker.loading = 'lazy';
      platform.append(marker);
      platform.insertAdjacentHTML('beforeend', trophySparkles());
    } else if (!earned) { marker?.remove(); platform.querySelector('.ss-trophy-sparkles')?.remove(); }
    platform.dataset.trophyEarned = String(earned);
  }
}
