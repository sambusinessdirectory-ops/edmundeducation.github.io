(function initialiseProfessionalEnhancements() {
  "use strict";
  const SOUND_KEY = "edmund-professional-sound-effects-v1";
  let soundContext = null;
  const soundEffectsEnabled = () => {
    try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; }
  };
  async function readySoundContext() {
    if (!soundEffectsEnabled()) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!soundContext || soundContext.state === "closed") soundContext = new AudioContextClass();
    if (soundContext.state !== "running") await soundContext.resume();
    return soundContext.state === "running" ? soundContext : null;
  }

  async function playSuccessSound() {
    try {
      const context = await readySoundContext();
      if (!context || !soundEffectsEnabled()) return;
      const start = context.currentTime + .015;
      [[523.25, 0, .17], [659.25, .1, .2], [783.99, .21, .3]].forEach(([frequency, delay, length]) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, start + delay);
        gain.gain.exponentialRampToValueAtTime(.18, start + delay + .018);
        gain.gain.exponentialRampToValueAtTime(.0001, start + delay + length);
        oscillator.connect(gain).connect(context.destination);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(start + delay);
        oscillator.stop(start + delay + length + .03);
      });
    } catch { /* A later user gesture can retry audio if the browser interrupted it. */ }
  }

  // Unlock during the gesture, including swipe and keyboard marking.
  ["pointerdown", "keydown"].forEach(type => document.addEventListener(type, () => {
    readySoundContext().catch(() => {});
  }, {capture: true, passive: true}));

  function ensureSoundToggle() {
    if (document.querySelector("[data-professional-sound-toggle]")) return;
    const host = document.querySelector(".header-actions") || document.querySelector(".app-header");
    if (!host) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "professional-sound-toggle";
    button.dataset.professionalSoundToggle = "";
    const render = () => {
      const enabled = soundEffectsEnabled();
      button.classList.toggle("is-muted", !enabled);
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute("aria-label", enabled ? "Mute correct-answer sound effects" : "Enable correct-answer sound effects");
      button.innerHTML = `<strong>答對音效<small>Sound ${enabled ? "on" : "off"}</small></strong>`;
    };
    button.addEventListener("click", () => {
      try { localStorage.setItem(SOUND_KEY, soundEffectsEnabled() ? "off" : "on"); } catch {}
      render();
      if (soundEffectsEnabled()) playSuccessSound();
    });
    render();
    host.append(button);
  }

  // The app emits this only after a mark is accepted, for every input method.
  document.addEventListener("professional-card-marked", event => {
    if (event.detail?.mark === "green") playSuccessSound();
  });

  const dialogs = window.EDMUND_PROFESSIONAL_DIALOGUES || [];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  function lessonMarkup() {
    return `<div class="pro-practice-heading"><div><span>PROFESSIONAL ENGLISH · DIALOGUE PRACTICE</span><h3>情境英語填充練習</h3><p>先聆聽完整對話及查看中文翻譯，再選擇練習模式。每篇對話均在獨立頁面開啟。</p></div><strong>${dialogs.length} dialogues</strong></div>
      <div class="pro-lesson-grid">${[1, 2].map(lesson => `<section class="pro-lesson-card"><span>0${lesson}</span><h4>${lesson === 1 ? "第一課：基本互動" : "第二課：進階互動"}</h4><p>${lesson === 1 ? "Class 1 · Basic Interaction" : "Class 2 · Advanced Interactions"}</p><div>${dialogs.filter(item => item.lesson === lesson).map(item => `<a class="pro-dialogue-link" href="./dialogue.html?id=${item.id}"><b>${item.variant==='beginner'?'初階版本 · Beginner':'專業版本 · Professional'}</b><span>${escapeHtml(item.titleZh)}</span><small>${escapeHtml(item.title)}</small></a>`).join("")}</div></section>`).join("")}</div>`;
  }

  function enhanceCourse(course) {
    const team = course.querySelector(":scope > .team-effort");
    const flash = [...course.querySelectorAll(":scope > .learning-panel")].find(panel => !panel.classList.contains("learning-panel--future"));
    const practice = course.querySelector(":scope > .learning-panel--future");
    const dashboards = course.querySelector(":scope > .course-dashboards");
    if (flash) flash.classList.add("learning-panel--practice-glow", "learning-panel--flash-first");
    if (practice && !practice.dataset.enhanced) {
      practice.dataset.enhanced = "true";
      practice.classList.add("learning-panel--practice-glow");
      practice.innerHTML = lessonMarkup();
    }
    const desired = [flash, practice, team, dashboards].filter(Boolean);
    const positions = desired.map(node => [...course.children].indexOf(node));
    if (positions.some((position, index) => index > 0 && position < positions[index - 1])) {
      desired.forEach(node => course.append(node));
    }
  }

  function enhance() {
    document.querySelectorAll(".course-section").forEach(enhanceCourse);
    ensureSoundToggle();
  }
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["points"] });
  enhance();
})();

(function optimiseProfessionalMobileAndReporting() {
  "use strict";
  const API = "https://ookkxzgpdclzrrhfmvqx.supabase.co/rest/v1/rpc/";
  const KEY = "sb_publishable_0BOvquSJ_34TVHCoboQjVg_gRrggI7x";
  const session = () => { try { return JSON.parse(localStorage.getItem("special-flash-session-v1") || "null"); } catch { return null; } };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);

  function removeUnneededControls() {
    document.querySelectorAll(".course-link-note").forEach(node => node.remove());
    document.querySelectorAll(".mode-grid--classic > button").forEach(button => {
      if (/^\s*(10|20|30|40)\s*(cards|張字卡)/i.test(button.textContent)) button.remove();
    });
    document.querySelectorAll(".course-section > .section-heading h2").forEach(title => {
      if (title.textContent.includes("_")) title.textContent = title.textContent.replaceAll("_", " ");
    });
    document.querySelectorAll(".mode-grid button,.study-footer button,.grade-controls button,.resume").forEach(button => {
      if (button.dataset.bilingualStacked === "true") return;
      const label = button.textContent.replace(/\s+/g, " ").trim();
      if (!/[\u3400-\u9fff]/.test(label) || !/[A-Za-z]/.test(label)) return;
      const parts = label.split(/\s*·\s*/).filter(Boolean);
      const zh = parts.filter(part => /[\u3400-\u9fff]/.test(part)).join(" · ");
      const en = parts.filter(part => !/[\u3400-\u9fff]/.test(part)).join(" · ");
      if (!zh || !en) return;
      button.dataset.bilingualStacked = "true";
      button.innerHTML = `<span class="pro-zh">${esc(zh)}</span><span class="pro-en">${esc(en)}</span>`;
    });
  }

  function addReportButton() {
    if (document.querySelector("[data-professional-report-bug]")) return;
    const current = session();
    if (!current?.token) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pro-report-bug";
    button.dataset.professionalReportBug = "";
    button.innerHTML = "<strong>!</strong><span>回報問題<small>Report a bug</small></span>";
    button.addEventListener("click", () => openReportDialog());
    document.body.append(button);
  }

  function openReportDialog() {
    let dialog = document.querySelector("[data-professional-bug-dialog]");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "pro-bug-dialog";
      dialog.dataset.professionalBugDialog = "";
      dialog.innerHTML = `<form method="dialog"><header><div><small>SUPPORT TICKET</small><h2>回報網站問題</h2><p>Report a bug</p></div><button type="button" data-bug-close aria-label="Close">×</button></header><label>問題標題 · Subject<input name="subject" required maxlength="160" placeholder="例如：字卡無法翻面"></label><label>詳細情況 · What happened<textarea name="body" required maxlength="5000" rows="7" placeholder="請告訴我們您按了甚麼，以及畫面出現甚麼。"></textarea></label><p class="pro-bug-privacy">系統只會附上您的帳戶、此頁網址及瀏覽器資料。報告會建立支援單並通知 Sam Business Directory。</p><p role="status"></p><button class="pro-bug-submit" type="submit">提交支援單 · Send ticket</button></form>`;
      document.body.append(dialog);
      dialog.querySelector("[data-bug-close]").onclick = () => dialog.close();
      dialog.querySelector("form").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget, status = form.querySelector("[role=status]"), submit = form.querySelector(".pro-bug-submit");
        const current = session();
        if (!current?.token) { status.textContent = "登入已失效，請重新登入。"; return; }
        submit.disabled = true; status.textContent = "正在建立支援單…";
        try {
          const response = await fetch(API + "special_flash_report_bug", { method:"POST", headers:{apikey:KEY,"Content-Type":"application/json"}, body:JSON.stringify({p_token:current.token,p_subject:form.elements.subject.value,p_body:form.elements.body.value,p_page_url:location.href,p_user_agent:navigator.userAgent}), signal:AbortSignal.timeout(15000) });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload.message || "未能提交支援單。");
          status.textContent = `已建立支援單 #${payload.ticket_number || payload.ticketNumber || ""}。謝謝您的回報。`;
          form.reset(); setTimeout(() => dialog.close(), 1800);
        } catch (error) { status.textContent = error.message; } finally { submit.disabled = false; }
      });
    }
    dialog.showModal(); dialog.querySelector("input")?.focus();
  }

  let rangeStarting = false;
  document.addEventListener("click", event => {
    const range = event.target.closest(".range-grid--thirty button,.range-grid--ten button");
    if (range && !rangeStarting) {
      rangeStarting = true;
      setTimeout(() => {
        const start = [...document.querySelectorAll(".study-settings button")].find(button => /Start|開始/.test(button.textContent));
        start?.click(); rangeStarting = false;
      }, 80);
    }
    const navigation = event.target.closest(".study-footer button,.grade-controls button");
    if (navigation && (/Next|下一張/.test(navigation.textContent) || navigation.closest(".grade-controls"))) {
      setTimeout(() => document.querySelector(".front-display-card")?.scrollIntoView({behavior:"smooth",block:"start"}), 90);
    }
  }, true);

  let swipe = null;
  document.addEventListener("pointerdown", event => {
    if (event.target.closest(".flashcard-back-card")) swipe = {x:event.clientX,y:event.clientY};
  }, true);
  document.addEventListener("pointerup", event => {
    if (!swipe) return;
    const horizontal = Math.abs(event.clientX - swipe.x) > 45 && Math.abs(event.clientX - swipe.x) > Math.abs(event.clientY - swipe.y);
    swipe = null;
    if (horizontal) setTimeout(() => document.querySelector(".front-display-card")?.scrollIntoView({behavior:"smooth",block:"start"}), 120);
  }, true);

  function enhance() { removeUnneededControls(); addReportButton(); }
  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.body,{childList:true,subtree:true}); enhance();
})();
