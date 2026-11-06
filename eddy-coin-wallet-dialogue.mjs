/* Greet a student before showing the shared Edmund Coins wallet. */
const lines = [
  { main: '哦哦哦！這、這不是錢嗎！？', sub: '嘿嘿嘿……光是看著就覺得好幸福啊！要是能再多一點就好了……！' },
  '金光閃閃的……亮晶晶的……嘿嘿！Eddy 的眼睛都快變成錢幣啦！',
  '咳咳！Eddy 才不是貪財呢！只是覺得……這些錢放在這裡有點可惜嘛！',
  '哇啊！發現寶藏啦！這麼多錢，能買多少好吃的東西啊！？',
  '嘿嘿……一枚、兩枚、三枚……唔！怎麼數都數不夠啦！再多來一點嘛！',
  '什麼！？有錢可以賺！？咳咳！那 Eddy 可就要拿出百分之兩百的幹勁啦！',
  '哇！好多錢！嘿嘿，Eddy 的眼睛都亮起來啦！'
];
let active = false;
async function ensureStyle() {
  if (document.querySelector('link[href*="eddy-global-dialogues.css"]')) return true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/eddy-global-dialogues.css?v=20261101-morning-strength1';
  return new Promise(resolve => {
    link.onload = () => resolve(true);
    link.onerror = () => { link.remove(); resolve(false); };
    document.head.append(link);
  });
}
export async function showCoinEddy(onDismiss) {
  if (active) return true;
  if (document.hidden || document.querySelector('dialog[open], .eddy-global-overlay, .eddy-first-question-overlay')
    || window.EdmundEddyGlobalDialogue?.isBlocking() || !await ensureStyle()) return false;
  active = true;
  const previousFocus = document.activeElement;
  const copy = lines[Math.floor(Math.random() * lines.length)];
  const main = typeof copy === 'string' ? copy : copy.main;
  const sub = typeof copy === 'string' ? '' : copy.sub;
  const overlay = document.createElement('div');
  overlay.className = 'eddy-global-overlay eddy-coin-wallet-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Eddy 的金幣問候');
  overlay.innerHTML = '<button type="button"><span class="eddy-global-art"><img src="https://edmund-public-media.edmundeducation.workers.dev/eddy-coin-wallet-dialogue.png" alt="" aria-hidden="true"><span class="eddy-global-copy" lang="zh-Hant"><strong></strong><span></span></span></span></button>';
  overlay.querySelector('strong').textContent = main;
  const subtitle = overlay.querySelector('.eddy-global-copy span');
  subtitle.textContent = sub;
  subtitle.hidden = !sub;
  overlay.querySelector('button').setAttribute('aria-label', `${main} ${sub} 點擊、輕觸或按鍵查看金幣`);
  function finish() {
    if (!active) return;
    active = false;
    overlay.remove();
    document.removeEventListener('keydown', onKey, true);
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    onDismiss();
  }
  function onKey(event) {
    if (!['Enter', ' ', 'Escape', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finish();
  }
  overlay.addEventListener('click', finish);
  document.body.append(overlay);
  overlay.querySelector('button').focus({ preventScroll: true });
  document.addEventListener('keydown', onKey, true);
  return true;
}
