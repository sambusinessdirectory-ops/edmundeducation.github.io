(function initialiseProfessionalEnhancements() {
  "use strict";
  const SOUND_KEY = "edmund-professional-sound-effects-v1";
  let soundContext = null;
  const soundEffectsEnabled = () => {
    try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; }
  };
  function playSuccessSound() {
    if (!soundEffectsEnabled()) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    soundContext ||= new AudioContextClass();
    if (soundContext.state === "suspended") soundContext.resume().catch(() => {});
    const start = soundContext.currentTime + .015;
    [[523.25, 0, .17], [659.25, .1, .2], [783.99, .21, .3]].forEach(([frequency, delay, length]) => {
      const oscillator = soundContext.createOscillator();
      const gain = soundContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start + delay);
      gain.gain.exponentialRampToValueAtTime(.12, start + delay + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, start + delay + length);
      oscillator.connect(gain).connect(soundContext.destination);
      oscillator.start(start + delay);
      oscillator.stop(start + delay + length + .03);
    });
  }

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
      button.innerHTML = `<span aria-hidden="true">${enabled ? "🔔" : "🔕"}</span><strong>答對音效<small>Sound ${enabled ? "on" : "off"}</small></strong>`;
    };
    button.addEventListener("click", () => {
      try { localStorage.setItem(SOUND_KEY, soundEffectsEnabled() ? "off" : "on"); } catch {}
      render();
      if (soundEffectsEnabled()) playSuccessSound();
    });
    render();
    host.append(button);
  }

  document.addEventListener("click", event => {
    const knownButton = event.target.closest(".grade-controls button.tick");
    if (knownButton && !knownButton.disabled) playSuccessSound();
  }, true);

  function smoothPath(points) {
    if (points.length < 2) return "";
    const control = (current, previous, next, reverse = false) => {
      const p = previous || current;
      const n = next || current;
      const length = Math.hypot(n[0] - p[0], n[1] - p[1]) * .18;
      const angle = Math.atan2(n[1] - p[1], n[0] - p[0]) + (reverse ? Math.PI : 0);
      return [current[0] + Math.cos(angle) * length, current[1] + Math.sin(angle) * length];
    };
    return points.reduce((path, point, index) => {
      if (!index) return `M ${point[0]} ${point[1]}`;
      const start = control(points[index - 1], points[index - 2], point);
      const end = control(point, points[index - 1], points[index + 1], true);
      return `${path} C ${start[0]} ${start[1]}, ${end[0]} ${end[1]}, ${point[0]} ${point[1]}`;
    }, "");
  }

  function smoothDashboardCharts() {
    document.querySelectorAll("svg.axis-chart polyline.chart-line").forEach(line => {
      const points = String(line.getAttribute("points") || "").trim().split(/\s+/).map(pair => pair.split(",").map(Number)).filter(pair => pair.length === 2 && pair.every(Number.isFinite));
      if (points.length < 2) return;
      let path = line.nextElementSibling?.matches?.("path[data-editorial-curve]") ? line.nextElementSibling : null;
      if (!path) {
        path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        [...line.attributes].forEach(attribute => attribute.name !== "points" && path.setAttribute(attribute.name, attribute.value));
        path.dataset.editorialCurve = "";
        line.insertAdjacentElement("afterend", path);
      }
      path.setAttribute("d", smoothPath(points));
      line.style.opacity = "0";
    });
  }
  const dialogs = [
    {
      lesson: 1, id: "l1d1", title: "Confirmed Appointment", titleZh: "已確認的預約",
      lines: [
        ["Security", "Good morning. Welcome to Three Garden Road. How may I assist you today?"],
        ["Visitor", "Morning. I have a 10:30 meeting with Vivian Chan at Bright Star Consulting."],
        ["Security", "Certainly. May I have your name and company, please?"],
        ["Visitor", "Daniel Roberts, from Eastgate Partners."],
        ["Security", "Thank you, Mr Roberts. Could I also confirm the floor listed in your meeting invitation?"],
        ["Visitor", "It says the 23rd floor."],
        ["Security", "Great. If I understood you correctly, that's Vivian Chan, Bright Star Consulting, 23rd floor, at 10:30. Is that correct?"],
        ["Visitor", "That's correct."],
        ["Security", "Thank you. Please allow me a moment to verify the appointment with their office. Would you mind waiting in the reception area?"],
        ["Visitor", "No problem."],
        ["Security", "Thank you for waiting, Mr Roberts. Your appointment has been confirmed. Please proceed to the visitor registration counter. My colleague will issue your pass and direct you to Lift B."],
        ["Visitor", "Perfect. Thank you."],
        ["Security", "You're welcome. Enjoy your visit."]
      ]
    },
    {
      lesson: 1, id: "l1d2", title: "Unannounced Visitor", titleZh: "未預約訪客",
      lines: [
        ["Visitor", "Hi. I need to see Raymond Cheung at Sterling Asset Management. It's urgent."],
        ["Security", "Good afternoon. I understand it's urgent. May I ask whether Mr Cheung is expecting you today?"],
        ["Visitor", "No, but he knows who I am. I only need five minutes."],
        ["Security", "I see. May I have your name and company so I can contact his office?"],
        ["Visitor", "Elaine Foster, Westfield Advisory. Can I just go up? I'm already late."],
        ["Security", "I'm afraid I'm unable to grant access until the office confirms the visit. What I can do is call them now and let them know you're waiting."],
        ["Visitor", "How long is that going to take?"],
        ["Security", "It usually only takes a few minutes, but I don't want to promise a time before I reach them. Would you mind waiting by the Customer Services Counter?"],
        ["Visitor", "Fine, but please tell them it's confidential."],
        ["Security", "Certainly. I'll only say that you've arrived and would like to speak with Mr Cheung. I won't discuss the nature of your visit."],
        ["Visitor", "Thank you."],
        ["Security", "You're welcome. I'll update you as soon as I hear back."]
      ]
    },
    {
      lesson: 1, id: "l1d3", title: "Contradictory Floor Information", titleZh: "樓層資料不一致",
      lines: [
        ["Security", "Good afternoon. Welcome to Three Garden Road. How may I assist you today?"],
        ["Visitor", "Hi. I'm here to see Anthony Lau at Apex Consulting."],
        ["Security", "Certainly. May I have your name, please?"],
        ["Visitor", "Sophia Flora. I have a meeting with Mr Lau this afternoon."],
        ["Security", "Thank you, Ms Flora. Could I confirm the floor with you?"],
        ["Visitor", "It says the 14th floor."],
        ["Security", "I see. There seems to be a discrepancy. Our building directory currently lists Apex Consulting on the 10th floor, rather than the 14th."],
        ["Visitor", "Really? Are you sure the directory is up to date?"],
        ["Security", "That's a good question. Let me contact Apex Consulting and confirm their current location."],
        ["Visitor", "But my email definitely says the 14th floor."],
        ["Security", "I understand your concern. Just to confirm, you're here to see Mr Anthony Lau at Apex Consulting, and your email states the 14th floor. Is that correct?"],
        ["Visitor", "Yes, that's correct."],
        ["Security", "Thank you. Please allow me a moment to check with their office. Would you mind waiting in the reception area while I verify the floor?"],
        ["Visitor", "Sure. How long will it take?"],
        ["Security", "It should only take a few minutes, but I'll update you as soon as I receive confirmation."],
        ["Visitor", "All right. Thank you."],
        ["Security", "You're welcome, Ms Flora. Thank you for your patience."]
      ]
    },
    {
      lesson: 2, id: "l2d1", title: "Correct Lift Zone", titleZh: "正確升降機分區",
      lines: [
        ["Security", "Thanks, Mr Daniels. Your appointment has been confirmed, and you'll be visiting the 23rd floor."],
        ["Visitor", "Great. I'll just take the nearest lifts here."],
        ["Security", "Just a moment, please. Those lifts do not serve the 23rd floor. Please use Lift H on your right to access the 23rd floor."],
        ["Visitor", "I see. I wasn't aware the lifts were zoned."],
        ["Security", "No problem at all. I'll accompany you to the correct lift bank."],
        ["Visitor", "Thank you. And what is this QR receipt for?"],
        ["Security", "Please keep the QR receipt with you during your visit. When you return to G/F, scan the QR code at the exit gate to leave the secured area."],
        ["Visitor", "Do I need to return to the counter afterwards?"],
        ["Security", "Not unless you need assistance. Please keep the QR receipt until you have passed through the exit gate."],
        ["Visitor", "Perfect. Thanks for explaining."],
        ["Security", "My pleasure. Enjoy your visit."]
      ]
    },
    {
      lesson: 2, id: "l2d2", title: "Escorting a Visitor Back", titleZh: "陪同訪客返回地下",
      lines: [
        ["Visitor", "Excuse me. I'm ready to leave, but I'm not sure how to get back to the ground floor."],
        ["Security", "No problem. I can show you to the ground floor."],
        ["Visitor", "Thank you. Which lift should we use?"],
        ["Security", "Please follow me. We'll use this lift back to G/F."],
        ["Visitor", "Okay."],
        ["Security", "We're on the ground floor now. The exit gate is on your left."],
        ["Visitor", "Do I use the QR receipt here?"],
        ["Security", "Yes. Please scan the QR code at the gate."],
        ["Visitor", "Thank you for showing me the way."],
        ["Security", "You're welcome. Have a good day."]
      ]
    },
    {
      lesson: 2, id: "l2d3", title: "After Office Hours", titleZh: "辦公時間後到訪",
      lines: [
        ["Visitor", "Good evening. I'm here for a meeting with Jenny Chan."],
        ["Security", "Good evening. Welcome to Three Garden Road. May I have your name, company and appointment time, please?"],
        ["Visitor", "Eric Wong from Metro Design Ltd. My appointment was for 6:30 p.m."],
        ["Security", "Thank you, Mr Wong. The tenant's normal office hours have already ended, so I'll need to verify that Ms Chan is still available."],
        ["Visitor", "She told me she would still be in the office. Can you just call upstairs?"],
        ["Security", "Certainly. What I can do is contact the office now and let them know you've arrived."],
        ["Visitor", "Can I go up while you're calling? I'm already late."],
        ["Security", "I understand your concern. However, I'm unable to send you upstairs until I receive confirmation from the tenant."],
        ["Visitor", "How long will that take?"],
        ["Security", "I'll check immediately, but I don't want to promise a time before I reach them. Would you mind waiting by the CS counter?"],
        ["Visitor", "Okay."],
        ["Security", "Thank you for waiting, Mr Wong. The tenant has confirmed that Ms Chan is in the office. You may proceed to the 19th floor. Please keep your QR receipt for the exit gate when you leave."]
      ]
    }
  ];
  let active = null;
  let clozeRate = .35;
  let hintMode = "both";

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  function voiceFor(role, lesson) {
    const british = role === "Visitor";
    const female = role === "Visitor" ? lesson === 2 : lesson === 1;
    const voices = speechSynthesis.getVoices();
    const locale = british ? "en-GB" : "en-US";
    const names = female ? /Serena|Samantha|Ava|Jenny|Zira|Libby|Kate|female/i : /Daniel|Alex|Guy|Andrew|Oliver|Arthur|male/i;
    return voices.find(voice => voice.lang === locale && names.test(voice.name)) || voices.find(voice => voice.lang === locale) || null;
  }

  function speak(role, text, lesson) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = role === "Visitor" ? (lesson === 1 ? "en-GB" : "en-GB") : "en-US";
    utterance.voice = voiceFor(role, lesson);
    utterance.rate = .88;
    speechSynthesis.speak(utterance);
  }

  function selectedWordIndices(words, lineIndex) {
    const candidates = words.map((word, index) => /[a-z]/i.test(word) && word.replace(/[^a-z]/gi, "").length > 2 ? index : -1).filter(index => index >= 0);
    return new Set(candidates.filter((_, index) => (index * 7 + lineIndex * 3) % 100 < clozeRate * 100));
  }

  function hint(answer) {
    const letters = answer.replace(/[^a-z]/gi, "");
    if (!letters) return "";
    if (hintMode === "first") return letters[0];
    if (hintMode === "last") return letters.at(-1);
    if (hintMode === "both") return letters.length > 1 ? `${letters[0]}…${letters.at(-1)}` : letters;
    return "";
  }

  function clozeLine(line, lineIndex) {
    const parts = line[1].split(/(\s+)/);
    const wordPositions = selectedWordIndices(parts, lineIndex);
    return parts.map((part, index) => wordPositions.has(index)
      ? `<label class="pro-cloze"><span>${escapeHtml(hint(part))}</span><input data-answer="${escapeHtml(part)}" aria-label="Missing word" autocomplete="off"></label>`
      : escapeHtml(part)).join("");
  }

  function ensureModal() {
    let modal = document.querySelector("[data-dialogue-practice]");
    if (modal) return modal;
    modal = document.createElement("dialog");
    modal.className = "pro-dialogue-modal";
    modal.dataset.dialoguePractice = "";
    modal.addEventListener("close", () => speechSynthesis.cancel());
    document.body.append(modal);
    return modal;
  }

  function renderModal(showExercise = false) {
    const modal = ensureModal();
    modal.innerHTML = `<div class="pro-dialogue-sheet">
      <header><div><span>LESSON ${active.lesson} · DIALOGUE PRACTICE</span><h2>${escapeHtml(active.titleZh)}</h2><p>${escapeHtml(active.title)}</p></div><button type="button" data-close-dialogue aria-label="Close">×</button></header>
      <section class="pro-dialogue-reference"><div class="pro-section-title"><div><strong>完整對話</strong><small>Full dialogue first</small></div><button type="button" data-play-dialogue>▶ 播放整段 · Play all</button></div>
        ${active.lines.map((line, index) => `<article class="pro-dialogue-line ${line[0].toLowerCase()}"><button type="button" data-speak-line="${index}" aria-label="Play line">♫</button><div><span>${line[0] === "Visitor" ? "訪客 · Visitor" : "保安人員 · Security"}</span><p>${escapeHtml(line[1])}</p></div></article>`).join("")}
      </section>
      ${showExercise ? `<section class="pro-dialogue-exercise"><div class="pro-section-title"><div><strong>填充練習</strong><small>Fill in the blanks</small></div><div class="pro-cloze-controls"><select data-cloze-rate aria-label="Difficulty"><option value=".25">Standard 25%</option><option value=".4" ${clozeRate === .4 ? "selected" : ""}>Medium 40%</option><option value=".6" ${clozeRate === .6 ? "selected" : ""}>Hard 60%</option><option value=".8" ${clozeRate === .8 ? "selected" : ""}>Hell 80%</option></select><select data-hint-mode aria-label="Hints"><option value="none">No hints</option><option value="first">First letter</option><option value="last">Last letter</option><option value="both" ${hintMode === "both" ? "selected" : ""}>First + last</option></select></div></div>
        ${active.lines.map((line, index) => `<article class="pro-cloze-line"><span>${line[0]}</span><p>${clozeLine(line, index)}</p></article>`).join("")}
        <div class="pro-exercise-actions"><button type="button" data-check-cloze>Check answers · 檢查答案</button><p data-cloze-status aria-live="polite"></p></div>
      </section>` : `<button class="pro-start-exercise" type="button" data-start-cloze>開始填充練習 · Start exercise ↓</button>`}
    </div>`;
    modal.querySelector("[data-close-dialogue]").addEventListener("click", () => modal.close());
    modal.querySelectorAll("[data-speak-line]").forEach(button => button.addEventListener("click", () => { const line = active.lines[Number(button.dataset.speakLine)]; speak(line[0], line[1], active.lesson); }));
    modal.querySelector("[data-play-dialogue]").addEventListener("click", () => {
      speechSynthesis.cancel();
      active.lines.forEach(line => { const utterance = new SpeechSynthesisUtterance(line[1]); utterance.lang = line[0] === "Visitor" ? "en-GB" : "en-US"; utterance.voice = voiceFor(line[0], active.lesson); utterance.rate = .88; speechSynthesis.speak(utterance); });
    });
    modal.querySelector("[data-start-cloze]")?.addEventListener("click", () => renderModal(true));
    modal.querySelector("[data-cloze-rate]")?.addEventListener("change", event => { clozeRate = Number(event.target.value); renderModal(true); });
    modal.querySelector("[data-hint-mode]")?.addEventListener("change", event => { hintMode = event.target.value; renderModal(true); });
    modal.querySelector("[data-check-cloze]")?.addEventListener("click", () => {
      const inputs = [...modal.querySelectorAll("[data-answer]")];
      let correct = 0;
      let newlyCorrect = 0;
      inputs.forEach(input => {
        const normalize = value => String(value).toLowerCase().replace(/[^a-z]/g, "");
        const passed = normalize(input.value) === normalize(input.dataset.answer);
        if (passed && input.dataset.wasCorrect !== "true") newlyCorrect += 1;
        input.dataset.wasCorrect = String(passed);
        input.classList.toggle("correct", passed); input.classList.toggle("wrong", !passed); if (passed) correct += 1;
      });
      if (newlyCorrect) playSuccessSound();
      modal.querySelector("[data-cloze-status]").textContent = `${correct} / ${inputs.length} correct · 答對 ${correct} 題`;
      try { localStorage.setItem(`professional-dialogue:${active.id}`, JSON.stringify({ correct, total: inputs.length, at: Date.now() })); } catch {}
    });
  }

  function openDialogue(id) {
    active = dialogs.find(item => item.id === id);
    if (!active) return;
    renderModal(false);
    ensureModal().showModal();
  }

  function lessonMarkup() {
    return `<div class="pro-practice-heading"><div><span>THEME THE FLEX PRACTICE</span><h3>情境英語填充練習</h3><p>先讀完整對話，再開始填充。按 ♫ 可聆聽英式及美式角色讀音。</p></div><strong>6 dialogues</strong></div>
      <div class="pro-lesson-grid">${[1, 2].map(lesson => `<section class="pro-lesson-card"><span>0${lesson}</span><h4>${lesson === 1 ? "第一課：基本互動" : "第二課：進階互動"}</h4><p>${lesson === 1 ? "Class 1 · Basic Interaction" : "Class 2 · Advanced Interactions"}</p><div>${dialogs.filter(item => item.lesson === lesson).map((item, index) => `<button type="button" data-dialogue="${item.id}"><b>Dialogue ${index + 1}</b><span>${escapeHtml(item.titleZh)}</span><small>${escapeHtml(item.title)}</small></button>`).join("")}</div></section>`).join("")}</div>`;
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
      practice.querySelectorAll("[data-dialogue]").forEach(button => button.addEventListener("click", () => openDialogue(button.dataset.dialogue)));
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
    smoothDashboardCharts();
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
    document.querySelectorAll(".mode-grid button,.range-grid button,.study-footer button,.grade-controls button,.resume").forEach(button => {
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
