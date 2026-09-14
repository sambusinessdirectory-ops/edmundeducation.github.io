import {trophyProgress,awardDateMarkup,tierName} from './horsey-awards.mjs';
import {syncTrophyExtras,visibilityButton,handleVisibilityClick} from './horsey-trophy-ui.mjs';
export {awardDateMarkup};
const shelfBindings = new WeakMap();
export const GOLDEN_EDDIE_ART = 'assets/sentence-structure/rewards/golden-eddie-v1.webp';
export const GOLDEN_EDDIE_MAP_ART = 'assets/sentence-structure/rewards/golden-eddie-map-v2.webp';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// One trophy per module, earned from one complete 50-question attempt.
// Use the existing account-scoped attempts; never combine partial attempts or
// maintain a second reward store. Older records may contain counts without IDs.
export function sentenceTrophyState(lesson, attempts = []) {
  const result = trophyProgress(lesson, attempts);
  return lesson?.questions?.length === 50 ? result : {...result,eligible:false,tier:null,earned:false};
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

export function syncSentenceTrophyCounter(root, collection) {
  const heading = root?.querySelector('.expression-map-heading');
  if (!heading) return;
  let counter = heading.querySelector('[data-sentence-trophy-counter]');
  if (!counter) {
    const copy = document.createElement('div');
    copy.className = 'ss-trophy-journey-copy';
    copy.append(...heading.childNodes);
    heading.append(copy);
    heading.classList.add('ss-trophy-heading');
    counter = document.createElement('button');
    counter.type = 'button'; counter.className = 'ss-trophy-counter';
    counter.setAttribute('data-sentence-trophy-counter', '');
    counter.setAttribute('data-view-sentence-trophies', '');
    counter.innerHTML = `<img src="${GOLDEN_EDDIE_ART}" alt="" width="64" height="72" draggable="false"><span><strong data-trophy-counter-value aria-live="polite" aria-atomic="true"></strong><small>金色獎座</small></span>`;
    heading.prepend(counter);
  }
  const earned = collection.filter(item => item.earned).length;
  const value = `${earned} / ${collection.length}`;
  const label = counter.querySelector('[data-trophy-counter-value]');
  if (label.textContent !== value) label.textContent = value;
  counter.setAttribute('aria-label', `查看我的金色 Horsey 獎座：已獲得 ${earned} 座，目前共可獲得 ${collection.length} 座`);
}

function trophySparkles() {
  return `<span class="ss-trophy-sparkles" aria-hidden="true">${'<i></i>'.repeat(10)}</span>`;
}

function sculpture(art, { order, preview = false, eager = false, marker = false } = {}) {
  return `<span class="ss-trophy-sculpture" style="--trophy-art:url('${art}')"><img ${marker ? 'class="ss-trophy-marker"' : ''} src="${art}" width="768" height="768" alt="" loading="${eager ? 'eager' : 'lazy'}" draggable="false">${order == null ? '' : `<span class="ss-trophy-engraving" aria-hidden="true">${escape(String(order).padStart(2, '0'))}</span>`}${preview ? '' : '<span class="ss-trophy-sheen" aria-hidden="true"></span>'}</span>${preview ? '' : trophySparkles()}`;
}

export function goldenEddieFigure(order, { preview = false, eager = false, tier = 'gold' } = {}) {
  const title = tierName(tier) + ' Eddie 獎座';
  return `<figure class="ss-trophy-figure${preview ? ' is-preview' : ''}" data-trophy-tier="${tier}">${preview ? `<span class="ss-trophy-preview" aria-label="${title}預覽">${sculpture(GOLDEN_EDDIE_ART, {order, preview, eager})}</span>` : `<button type="button" class="ss-trophy-interactive" data-trophy-interact aria-label="讓${title}浮起搖擺 · 句型 ${order}">${sculpture(GOLDEN_EDDIE_ART, {order, eager})}</button>`}</figure>`;
}

export function animateSentenceTrophy(button) {
  if (!button || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const body = button.querySelector('.ss-trophy-sculpture');
  if (!body) return;
  button.classList.remove('is-bouncing');
  void body.offsetWidth; // Restart a short, user-requested animation on repeated clicks.
  button.classList.add('is-bouncing');
  body.onanimationend = event => {
    if (event.animationName === 'ss-trophy-wiggle') button.classList.remove('is-bouncing');
  };
}

const preferenceKey = owner => `edmund-sentence-trophies-v1:${owner}`;
export function syncSentenceTrophyControls(root, owner = '') {
  const tools = root?.querySelector('.expression-map-tools');
  if (!tools) return;
  const ownerChanged = root.dataset.trophyOwner !== owner;
  if (ownerChanged) {
    root.dataset.trophyOwner = owner;
    let hidden = false;
    try { hidden = Boolean(owner) && localStorage.getItem(preferenceKey(owner)) === 'hidden'; } catch {}
    root.dataset.trophiesHidden = String(hidden);
  }
  let toggle = tools.querySelector('[data-toggle-map-trophies]');
  if (!toggle) {
    toggle = document.createElement('button'); toggle.type = 'button';
    toggle.className = 'ss-trophy-visibility'; toggle.setAttribute('data-toggle-map-trophies', '');
    tools.insertBefore(toggle, tools.querySelector('.expression-map-zoom'));
    toggle.addEventListener('click', () => {
      const hidden = root.dataset.trophiesHidden !== 'true';
      root.dataset.trophiesHidden = String(hidden);
      root.querySelectorAll('.is-bouncing').forEach(button => button.classList.remove('is-bouncing'));
      try { if (root.dataset.trophyOwner) localStorage.setItem(preferenceKey(root.dataset.trophyOwner), hidden ? 'hidden' : 'visible'); } catch {}
      syncSentenceTrophyControls(root, root.dataset.trophyOwner);
    });
  }
  const hidden = root.dataset.trophiesHidden === 'true';
  toggle.textContent = hidden ? '顯示獎座' : '隱藏獎座';
  toggle.setAttribute('aria-label', '隱藏地圖獎座');
  toggle.setAttribute('aria-pressed', String(hidden));
  if(ownerChanged) root.dispatchEvent(new CustomEvent('horsey-owner-change'));
}

export function renderSentenceTrophyShelf(root, collection, owner = '') {
  if (!root) return;
  let binding=shelfBindings.get(root);
  if(!binding){binding={};shelfBindings.set(root,binding);window.addEventListener('horsey-visibility-change',event=>{if(event.detail===binding.owner && root.isConnected)renderSentenceTrophyShelf(root,binding.collection,binding.owner);});}
  Object.assign(binding,{collection,owner});
  root.onclick=event=>handleVisibilityClick(event,owner);
  const earned = collection.filter(item => item.earned);
  const silver = collection.filter(item => item.tier === 'silver');
  const next = collection.filter(item => !item.tier).sort((a, b) => b.correct - a.correct || a.order - b.order)[0];
  const bronze = collection.filter(item => item.tier === 'bronze');
  const cards = [...earned, ...silver, ...bronze, ...(next ? [next] : [])];
  root.innerHTML = `<summary class="ss-trophy-summary"><img src="${GOLDEN_EDDIE_ART}" alt="" width="72" height="72" draggable="false"><span><small>THE HORSEY COLLECTION</small><strong>我的 Horsey 獎座</strong><span>25–39 題：銅色 · 40–49 題：銀色 · 50 題：金色。</span></span><b data-trophy-count>${earned.length} / ${collection.length}<small>金色獎座 · ${silver.length} 銀色 · ${bronze.length} 銅色</small></b><i aria-hidden="true">⌄</i></summary>
    <div class="ss-trophy-cabinet"><div class="ss-trophy-cabinet-heading"><h2>你的努力，閃閃發光</h2><p>已獲得 ${earned.length} 座金色、${silver.length} 座銀色、${bronze.length} 座銅色獎座。點一下 Eddie，讓牠開心地跳一跳。</p></div><div class="ss-trophy-grid">${cards.map(item => `<article class="ss-trophy-display${item.earned ? ' is-earned' : item.tier ? ' is-silver' : ' is-locked'}" data-trophy-lesson="${escape(item.lesson.id)}" data-trophy-earned="${item.earned}" data-trophy-tier="${item.tier || 'none'}"><span class="ss-trophy-status">${item.earned ? '✓ 金色獎座 · GOLD' : item.tier ? tierName(item.tier) + '獎座' : '下一座獎座 · UP NEXT'}</span>${goldenEddieFigure(item.order, {preview: !item.tier, tier: item.tier || 'gold'})}<div class="ss-trophy-nameplate"><small>MODULE ${String(item.order).padStart(2, '0')}</small><h3>${escape(item.lesson.titleEn || item.lesson.title)}</h3><p>${escape(item.lesson.title || item.lesson.titleZh || '')}</p><span>${item.correct} / 50 題已完成</span>${awardDateMarkup(item)}</div>${visibilityButton(item,owner)}<button type="button" class="ss-trophy-action" data-open-lesson="${escape(item.lesson.id)}">${item.earned ? '重溫句型' : '繼續學習'} <span aria-hidden="true">→</span></button></article>`).join('')}</div></div>`;
}

// Trophy buttons sit beside the original platform buttons, avoiding nested
// controls. Platform navigation and student progress remain independent.
export function syncSentenceMapTrophies(root, lessons, collection) {
  const world = root?.querySelector('.expression-map-world');
  if (!world) return;
  const tiers = new Map(collection.filter(item => item.tier).map(item => [item.lesson.id, item.tier]));
  const platforms = [...root.querySelectorAll('[data-map-level]')];
  const rooms = new Map();
  for (const platform of platforms) if (platform.dataset.hotelRoom) rooms.set(platform.dataset.hotelRoom, (rooms.get(platform.dataset.hotelRoom) || 0) + 1);
  for (const platform of platforms) {
    const level = platform.dataset.mapLevel, lesson = lessons[Number(level)], tier = tiers.get(lesson?.id);
    const hotel = platform.hasAttribute('data-hotel'), paired = hotel && rooms.get(platform.dataset.hotelRoom) > 1;
    platform.dataset.trophyEarned = String(tier === 'gold');
    platform.dataset.trophyTier = tier || 'none';
    let button = world.querySelector(`[data-trophy-level="${level}"]`);
    if (!tier) { button?.remove(); continue; }
    if (!button) {
      button = document.createElement('button'); button.type = 'button';
      button.className = 'ss-map-trophy ss-trophy-interactive';
      button.dataset.trophyLevel = level; button.setAttribute('data-trophy-interact', '');
      button.innerHTML = sculpture(hotel ? GOLDEN_EDDIE_ART : GOLDEN_EDDIE_MAP_ART, {marker:true});
      button.style.setProperty('--sheen-delay', `${-(Number(level) % 7) * .7}s`);
      let press = null;
      button.addEventListener('pointerdown', event => { press = {x:event.clientX, y:event.clientY}; });
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        if (!event.detail || !press || Math.hypot(event.clientX-press.x,event.clientY-press.y) <= 6) animateSentenceTrophy(button);
        press = null;
      });
      world.append(button);
    }
    button.dataset.trophyTier = tier;
    button.dataset.hotelTrophy = String(hotel);
    button.setAttribute('aria-label', `${tierName(tier)} Eddie · ${lesson.titleEn || lesson.title} · 點一下浮起搖擺`);
    const size = paired ? 52 : hotel ? 72 : 154;
    const offsetX = paired ? platform.classList.contains('hotel-door-secondary') ? 31 : -14 : (platform.offsetWidth-size)/2;
    const offsetY = paired ? 31 : hotel ? 7 : -107;
    button.style.width = button.style.height = `${size}px`;
    button.style.left = `${platform.offsetLeft+offsetX}px`;
    button.style.top = `${platform.offsetTop+offsetY}px`;
  }
  syncTrophyExtras(root, lessons, collection);
}
