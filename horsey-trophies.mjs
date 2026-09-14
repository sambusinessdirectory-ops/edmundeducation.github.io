import {trophyProgress,awardDateMarkup,tierName} from './horsey-awards.mjs';
import {visibilityButton,handleVisibilityClick} from './horsey-trophy-ui.mjs';
import { GOLDEN_EDDIE_ART, goldenEddieFigure, animateSentenceTrophy, syncSentenceTrophyCounter, syncSentenceTrophyControls, syncSentenceMapTrophies } from './sentence-structure-trophies.mjs?v=20260915-smooth1';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Use real catalogue totals and IDs; never pool separate partial attempts.
export function horseyState(lesson, attempts = [], answers = null) {
  return trophyProgress(lesson, attempts, answers);
}
export function horseyCollection(lessons, { attempts = [], answersFor } = {}) {
  const grouped = new Map();
  for (const attempt of attempts) {
    if (!grouped.has(attempt.lessonId)) grouped.set(attempt.lessonId, []);
    grouped.get(attempt.lessonId).push(attempt);
  }
  return lessons.map((lesson, i) => ({lesson, order:i + 1, ...horseyState(lesson, grouped.get(lesson.id), answersFor?.(lesson.id))})).filter(item => item.eligible);
}

export function createHorseyTrophies({ systemKey, root, getLessons, getMapLessons = getLessons, getOwner, getAttempts = () => [], answersFor, openLesson, mapTitle }) {
  let collection = [], shelf, signature = '', shelfOwner = '';
  root.setAttribute('data-horsey-map', '');
  const ownerKey = () => systemKey + ':' + (getOwner() || '');
  const interact = event => {
    if (handleVisibilityClick(event,ownerKey())) return;
    const button = event.target.closest('[data-trophy-interact]');
    if (button) { event.stopPropagation(); animateSentenceTrophy(button); }
    const lessonButton = event.target.closest('[data-horsey-open]');
    if (lessonButton) openLesson(lessonButton.dataset.horseyOpen);
  };
  function syncMap() {
    if (mapTitle) {
      const title = root.querySelector('.expression-map-heading h2');
      if (title?.firstChild?.nodeType === 3) title.firstChild.nodeValue = mapTitle;
      const kicker = root.querySelector('.expression-map-heading p');
      if (kicker) kicker.textContent = 'THE PROVERB JOURNEY';
    }
    syncSentenceTrophyCounter(root, collection);
    syncSentenceTrophyControls(root, `${systemKey}:${getOwner() || ''}`);
    syncSentenceMapTrophies(root, getMapLessons(), collection);
    const counter = root.querySelector('[data-sentence-trophy-counter]');
    if (counter) counter.onclick = () => { if (!shelf) return; shelf.open = true; shelf.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'}); };
    root.querySelectorAll('.ss-map-trophy').forEach(button => {
      if (button.dataset.hotelTrophy === 'true') return;
      const platform = root.querySelector(`[data-map-level="${button.dataset.trophyLevel}"]`);
      const size = Math.min(154, Math.max(80, platform.offsetWidth * 1.05));
      button.style.width = button.style.height = `${size}px`;
      button.style.left = `${platform.offsetLeft + (platform.offsetWidth - size) / 2}px`;
      button.style.top = `${platform.offsetTop - size * .695}px`;
    });
  }
  // Observe the lazily built shell, not character movement or our own markers.
  new MutationObserver(syncMap).observe(root, {childList:true});
  new ResizeObserver(syncMap).observe(root);
  function sync() {
    collection = getOwner() ? horseyCollection(getLessons(), {attempts:getAttempts(), answersFor}) : [];
    if (!shelf) {
      shelf = document.createElement('details'); shelf.className = 'ss-trophy-shelf';
      shelf.dataset.horseyShelf = systemKey; root.after(shelf); shelf.addEventListener('click', interact);
    }
    if (shelfOwner !== getOwner()) { shelf.open = false; shelfOwner = getOwner(); }
    const nextSignature = JSON.stringify([getOwner(), collection.map(x => [x.lesson.id, x.correct, x.total, x.tier, x.earnedAt])]);
    if (signature !== nextSignature) {
      signature = nextSignature;
      const gold = collection.filter(x => x.earned).length, silver = collection.filter(x => x.tier === 'silver').length, bronze = collection.filter(x => x.tier === 'bronze').length;
      const next = collection.filter(x => !x.tier).sort((a,b) => b.correct/b.total-a.correct/a.total)[0];
      const cards = [...collection.filter(x => x.tier), ...(next ? [next] : [])];
      shelf.innerHTML = `<summary class="ss-trophy-summary"><img src="${GOLDEN_EDDIE_ART}" width="72" height="72" alt="" draggable="false"><span><small>THE HORSEY COLLECTION</small><strong>我的 Horsey 獎座</strong><span>完成 50% 獲得銅色，80% 升級銀色，100% 升級金色。</span></span><b>${gold} / ${collection.length}<small>金色獎座 · ${silver} 座銀色 · ${bronze} 座銅色</small></b><i aria-hidden="true">⌄</i></summary><div class="ss-trophy-cabinet"><div class="ss-trophy-cabinet-heading"><h2>你的努力，閃閃發光</h2><p>點一下 Eddie，讓牠開心地跳一跳。</p></div><div class="ss-trophy-grid">${cards.map(item => `<article class="ss-trophy-display ${item.earned ? 'is-earned' : item.tier ? 'is-silver' : 'is-locked'}" data-trophy-tier="${item.tier || 'none'}"><span class="ss-trophy-status">${item.earned ? 'GOLD · 金色獎座' : item.tier ? tierName(item.tier) + '獎座' : 'UP NEXT · 下一座獎座'}</span>${goldenEddieFigure(item.order, {preview:!item.tier,tier:item.tier || 'gold'}).replace('句型', '課題')}<div class="ss-trophy-nameplate"><h3>${esc(item.lesson.titleEn || item.lesson.title)}</h3><p>${esc(item.lesson.titleZh || '')}</p><span>${item.correct} / ${item.total} 題已完成</span>${awardDateMarkup(item)}</div>${visibilityButton(item,ownerKey())}<button class="ss-trophy-action" type="button" data-horsey-open="${esc(item.lesson.id)}">繼續學習 →</button></article>`).join('')}</div></div>`;
    }
    shelf.hidden = !getOwner();
    syncMap();
  }
  function celebrate(host, lesson, correctIds) {
    host.querySelector('[data-horsey-celebration]')?.remove();
    const saved = collection.find(item=>item.lesson.id===lesson.id);
    const progress = horseyState(lesson, [], Object.fromEntries(correctIds.map(id => [id,{correct:true}])));
    if(saved?.tier===progress.tier) progress.earnedAt=saved.earnedAt;
    if (!progress.tier) return;
    const section = document.createElement('section'); section.className = 'ss-trophy-celebration';
    section.dataset.horseyCelebration = progress.tier;
    section.innerHTML = `${goldenEddieFigure(getLessons().findIndex(x => x.id === lesson.id)+1,{tier:progress.tier}).replace('句型','課題')}<h3>${tierName(progress.tier)} Horsey 獎座！</h3>${awardDateMarkup(progress)}<p>${progress.correct} / ${progress.total} 題已完成${progress.earned ? ' · 全部答對！' : ' · 繼續向金色獎座前進！'}</p>`;
    section.addEventListener('click', interact); host.prepend(section);
  }
  window.addEventListener('horsey-visibility-change',event=>{if(event.detail===ownerKey()){signature='';sync();}});
  return {sync, celebrate};
}
