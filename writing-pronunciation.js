(function initialiseWritingPronunciation() {
  "use strict";
  const TARGET_ID = "model-essay-9-ielts-advantage-disadvantage";
  let dialog;
  let sentenceIndex = 0;
  let currentAudio;

  function exercise() {
    return window.EDMUND_IELTS_WRITING_ADVANTAGE_2_30_EXERCISES?.[TARGET_ID] || null;
  }

  function sentences() {
    return (exercise()?.paragraphs || []).flatMap(paragraph => (paragraph.sentences || []).map(sentence => ({
      section: paragraph.label,
      text: (sentence.parts || []).map(part => typeof part === "string" ? part : (part.answer || "")).join("")
    })));
  }

  function wordRange(text) {
    const audio = window.EDMUND_WRITING_AUDIO?.[TARGET_ID];
    if (!audio?.words?.length) return null;
    const target = String(text).toLowerCase().match(/[a-z0-9']+/g) || [];
    const words = audio.words.map(item => String(item[0]).toLowerCase().replace(/[^a-z0-9']/g, ""));
    outer: for (let start = 0; start <= words.length - target.length; start += 1) {
      for (let index = 0; index < target.length; index += 1) if (words[start + index] !== target[index]) continue outer;
      return { start: Math.max(0, audio.words[start][1] - .08), end: audio.words[start + target.length - 1][2] + .16 };
    }
    return null;
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "writing-pronunciation-dialog";
    dialog.innerHTML = `
      <form method="dialog" class="writing-pronunciation-sheet">
        <div class="writing-pronunciation-heading"><div><span>PRONUNCIATION PRACTICE</span><h2>逐句讀音練習</h2></div><button value="close" aria-label="關閉">×</button></div>
        <div class="writing-pronunciation-progress"><span data-wp-count></span><i><b data-wp-bar></b></i></div>
        <p class="writing-pronunciation-section" data-wp-section></p>
        <blockquote data-wp-sentence></blockquote>
        <div class="writing-pronunciation-actions">
          <button type="button" data-wp-play>▶ Listen · 聆聽示範</button>
          <button type="button" class="record" data-wp-record>● Record · 錄音檢查</button>
        </div>
        <p class="writing-pronunciation-status" data-wp-status aria-live="polite">先聆聽示範，再錄下自己的讀音。錄音只在此頁即時分析，不會儲存。</p>
        <div class="writing-pronunciation-navigation"><button type="button" data-wp-previous>← 上一句</button><button type="button" data-wp-next disabled>下一句 →</button></div>
      </form>`;
    document.body.append(dialog);
    dialog.querySelector("[data-wp-play]").addEventListener("click", playModel);
    dialog.querySelector("[data-wp-record]").addEventListener("click", recordStudent);
    dialog.querySelector("[data-wp-previous]").addEventListener("click", () => { sentenceIndex = Math.max(0, sentenceIndex - 1); render(); });
    dialog.querySelector("[data-wp-next]").addEventListener("click", () => { sentenceIndex = Math.min(sentences().length - 1, sentenceIndex + 1); render(); });
    dialog.addEventListener("close", () => { currentAudio?.pause(); window.EdmundPronunciation?.stop(); });
    return dialog;
  }

  function render() {
    const items = sentences();
    const item = items[sentenceIndex];
    if (!item) return;
    dialog.querySelector("[data-wp-count]").textContent = `${sentenceIndex + 1} / ${items.length}`;
    dialog.querySelector("[data-wp-bar]").style.width = `${(sentenceIndex + 1) / items.length * 100}%`;
    dialog.querySelector("[data-wp-section]").textContent = item.section;
    dialog.querySelector("[data-wp-sentence]").textContent = item.text;
    dialog.querySelector("[data-wp-status]").textContent = "先聆聽示範，再錄下自己的讀音。錄音只在此頁即時分析，不會儲存。";
    dialog.querySelector("[data-wp-status]").dataset.tone = "";
    dialog.querySelector("[data-wp-previous]").disabled = sentenceIndex === 0;
    dialog.querySelector("[data-wp-next]").disabled = true;
  }

  function playModel() {
    const item = sentences()[sentenceIndex];
    const audio = window.EDMUND_WRITING_AUDIO?.[TARGET_ID];
    const range = wordRange(item?.text);
    if (!item || !audio?.path || !range) return;
    currentAudio?.pause();
    currentAudio = new Audio(new URL(audio.path, location.href).href);
    currentAudio.currentTime = range.start;
    currentAudio.addEventListener("timeupdate", () => { if (currentAudio.currentTime >= range.end) currentAudio.pause(); });
    currentAudio.play().catch(() => {});
  }

  async function recordStudent() {
    const button = dialog.querySelector("[data-wp-record]");
    const status = dialog.querySelector("[data-wp-status]");
    const item = sentences()[sentenceIndex];
    const audio = window.EDMUND_WRITING_AUDIO?.[TARGET_ID];
    const range = wordRange(item?.text);
    if (!item || !audio?.path || !range) return;
    button.disabled = true;
    button.classList.add("is-recording");
    status.textContent = "正在錄音…讀完句子後，系統會自動停止。";
    try {
      const result = await window.EdmundPronunciation.recordAndCompare({
        expectedText: item.text,
        modelUrl: new URL(audio.path, location.href).href,
        modelStart: range.start,
        modelEnd: range.end,
        maxSeconds: Math.min(24, Math.max(6, item.text.split(/\s+/).length * .65)),
        onLevel: level => button.style.setProperty("--mic-level", level.toFixed(2))
      });
      status.dataset.tone = result.passed ? "success" : "retry";
      status.textContent = result.passed
        ? `✓ Pass · ${Math.round(result.score * 100)}% — Your pronunciation is accurate. You may continue.`
        : `Try again · ${Math.round(result.score * 100)}% — Practice the pronunciation before moving on.`;
      dialog.querySelector("[data-wp-next]").disabled = !result.passed || sentenceIndex === sentences().length - 1;
    } catch (error) {
      status.dataset.tone = "retry";
      status.textContent = error?.message || "未能使用咪高峰，請允許咪高峰權限後再試。";
    } finally {
      button.disabled = false;
      button.classList.remove("is-recording");
      button.style.removeProperty("--mic-level");
    }
  }

  function targetIsOpen() {
    const text = document.querySelector("main")?.textContent || document.body.textContent || "";
    return /Model Essay 9/i.test(text) && /school uniform/i.test(text);
  }

  function enhance() {
    const actions = document.querySelector(".practice-head-actions");
    if (!actions || actions.querySelector("[data-open-writing-pronunciation]") || !targetIsOpen()) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button pronunciation-practice-toggle";
    button.dataset.openWritingPronunciation = "";
    button.textContent = "🎙 Pronunciation practice · 讀音練習";
    button.addEventListener("click", () => { sentenceIndex = 0; ensureDialog(); render(); dialog.showModal(); });
    actions.insertBefore(button, actions.firstChild);
  }

  const style = document.createElement("style");
  style.textContent = `.pronunciation-practice-toggle{border-color:#7b5eea!important;color:#5636c8!important;background:#f4f0ff!important}.writing-pronunciation-dialog{width:min(760px,calc(100vw - 24px));max-height:90dvh;padding:0;border:0;border-radius:24px;color:#17203a;background:#fff;box-shadow:0 28px 100px #15102c70}.writing-pronunciation-dialog::backdrop{background:#12213e99;backdrop-filter:blur(5px)}.writing-pronunciation-sheet{padding:28px}.writing-pronunciation-heading{display:flex;justify-content:space-between;gap:20px;align-items:start}.writing-pronunciation-heading span,.writing-pronunciation-section{color:#6b4bd2;font-size:.75rem;font-weight:850;letter-spacing:.13em}.writing-pronunciation-heading h2{margin:5px 0 0;font-size:1.8rem}.writing-pronunciation-heading>button{width:42px;height:42px;border-radius:50%;font-size:1.5rem}.writing-pronunciation-progress{margin:24px 0 10px;display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center}.writing-pronunciation-progress i{height:9px;overflow:hidden;border-radius:999px;background:#e6e1f4}.writing-pronunciation-progress b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#6a45db,#ad62e8);transition:width .3s}.writing-pronunciation-section{margin:25px 0 8px}.writing-pronunciation-dialog blockquote{margin:0;padding:26px;border:1px solid #ddd5f5;border-radius:18px;background:#fbf9ff;font:600 clamp(1.2rem,2.8vw,1.65rem)/1.6 Georgia,serif}.writing-pronunciation-actions,.writing-pronunciation-navigation{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.writing-pronunciation-actions button,.writing-pronunciation-navigation button{padding:13px 18px;border:1px solid #d2c8ed;border-radius:999px;background:#fff;cursor:pointer}.writing-pronunciation-actions .record{color:#fff;background:#a33164;border-color:#a33164}.writing-pronunciation-actions .record.is-recording{box-shadow:0 0 0 calc(4px + 10px * var(--mic-level,0)) #e43f7760;animation:wpPulse 1s infinite}.writing-pronunciation-status{min-height:56px;margin:18px 0 0;padding:14px 16px;border-radius:14px;background:#f4f1fb}.writing-pronunciation-status[data-tone=success]{color:#17633d;background:#e5f8ec}.writing-pronunciation-status[data-tone=retry]{color:#9f2631;background:#ffeaec}.writing-pronunciation-navigation{justify-content:space-between}.writing-pronunciation-navigation button:disabled{opacity:.4;cursor:not-allowed}@keyframes wpPulse{50%{transform:scale(1.03)}}@media(max-width:600px){.writing-pronunciation-sheet{padding:20px}.writing-pronunciation-actions button{width:100%}}@media(prefers-reduced-motion:reduce){.writing-pronunciation-dialog *{animation:none!important;transition:none!important}}`;
  document.head.append(style);
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  enhance();
})();
