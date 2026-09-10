(function initialiseFlashcardPronunciation() {
  "use strict";
  let busy = false;
  let activeButton = null;
  let activeText = "";
  let microphoneState = "idle";
  let localClass = null;
  let preparingLocal = false;
  let prepareTicket = 0;
  let prepareText = "";
  let deletingLocal = false;
  let settingsDialog = null;
  let settingsStatus = null;

  function ensureToast() {
    let toast = document.querySelector("[data-pronunciation-toast]");
    if (toast) return toast;
    toast = document.createElement("div");
    toast.className = "pronunciation-toast";
    toast.dataset.pronunciationToast = "";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
    return toast;
  }

  function showMessage(title, detail, tone = "info", hideAfter = 0) {
    const toast = ensureToast();
    clearTimeout(showMessage.timer);
    toast.className = `pronunciation-toast is-${tone} is-visible`;
    const heading = document.createElement("strong");
    const description = document.createElement("span");
    heading.textContent = title;
    description.textContent = detail;
    toast.replaceChildren(heading, description);
    if (hideAfter) showMessage.timer = setTimeout(() => toast.classList.remove("is-visible"), hideAfter);
  }

  function showResult(result) {
    if (result.reason === "cancelled") return;
    if (result.passed) {
      showMessage("✓ Passed · 通過", "Good effort. Keep speaking naturally. · 做得好，請繼續自然連讀。", "success", 7000);
    } else if (result.scored) {
      showMessage("✗ Not passed · 未通過", "Read the word or phrase on this card, then try again at your normal pace. · 請朗讀這張字卡的字詞，再以自然語速試一次。", "retry", 8000);
    } else {
      const messages = {
        "no-speech": ["No speech detected · 未偵測到語音", "Tap the microphone and wait for ‘Speak now’, then read aloud. · 按咪高峰，看到「請開始朗讀」後再讀。"],
        "unrecognized": ["No final transcript · 暫未能辨認語音", "Your attempt was not scored. Tap the microphone to try again. · 這次未作評分，請按咪高峰重試。"],
        "permission-denied": ["Microphone permission needed · 請允許咪高峰", "Allow microphone and speech recognition access for this website in your browser settings, then retry. · 請在瀏覽器設定允許此網站使用咪高峰及語音辨認，再重試。"],
        "service-not-allowed": ["Speech recognition is disabled · 語音辨認未啟用", "Allow speech recognition in your browser settings, or use on-device recognition below. · 請允許瀏覽器使用語音辨認，或使用下方的裝置辨認。"],
        "audio-capture": ["Microphone unavailable · 未能使用咪高峰", "Close other apps using the microphone and try again. · 請關閉正在使用咪高峰的其他應用程式，再重試。"],
        "network": ["Speech service connection failed · 無法連接語音服務", "Check your internet connection and try again. This attempt was not scored. · 請檢查網絡後重試，這次未作評分。"],
        "recognition-timeout": ["Speech service did not respond · 語音服務未有回應", "Try again or switch recognition methods if available. This attempt was not scored. · 請重試，或選擇其他辨認方式；這次未作評分。"],
        "recognition-interrupted": ["Listening was interrupted · 聆聽已中斷", "Tap the microphone to try again. This attempt was not scored. · 請按咪高峰重試，這次未作評分。"],
        "no-reference": ["Choose a flashcard first · 請先選擇字卡", "Open a card with an English word or phrase. · 請開啟有英文字詞的字卡。"],
        "language-not-supported": ["English recognition unavailable · 暫不支援英文語音辨認", "Enable English speech recognition in your browser or device settings. · 請在瀏覽器或裝置設定啟用英文語音辨認。"]
      };
      const message = messages[result.reason] || ["Speech recognition unavailable · 暫未能使用語音辨認", "Browser recognition works where supported, including Chrome on Android and computers. On-device recognition below does not need Siri or a browser speech service. · 可使用 Android 或電腦上的 Chrome 等支援的瀏覽器；下方裝置辨認毋須 Siri 或瀏覽器語音服務。"];
      showMessage(...message, "info", 9000);
    }
    if (!result.passed && !result.scored && !['no-reference', 'permission-denied', 'audio-capture', 'no-speech'].includes(result.reason)) offerLocalRecognition();
  }

  function addToastAction(label, action) {
    clearTimeout(showMessage.timer);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pronunciation-toast-action";
    button.textContent = label;
    button.addEventListener("click", event => { event.stopPropagation(); action(); });
    ensureToast().append(button);
  }

  function offerLocalRecognition() {
    if (localClass) {
      if (window.SpeechRecognition || window.webkitSpeechRecognition) addToastAction("Try browser recognition · 改用瀏覽器辨認", () => {
        localClass = null;
        const button = currentPracticeButton();
        if (button) void check(button);
      });
      return;
    }
    if (preparingLocal || !navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext) || !window.WebAssembly) return;
    addToastAction("Use on-device recognition · 使用裝置辨認（首次下載約 45 MB）", prepareLocal);
    addToastAction("Why? · 為甚麼？", openSettings);
  }

  async function prepareLocal() {
    if (busy || preparingLocal || deletingLocal) return;
    if (settingsStatus) settingsStatus.textContent = "";
    settingsDialog?.close();
    preparingLocal = true;
    const ticket = ++prepareTicket;
    const text = currentText();
    prepareText = text;
    showMessage("Loading English recognition… · 正在載入英文辨認…", "First use downloads about 45 MB. Audio will be processed on this device. The microphone is still off. · 首次下載約 45 MB，語音會在此裝置處理；咪高峰尚未開啟。");
    addToastAction("Cancel · 取消", () => { ++prepareTicket; preparingLocal = false; ensureToast().classList.remove("is-visible"); });
    try {
      const { prepareLocalRecognition } = await import('./flashcard-local-recognition.mjs?v=20260910-practice5');
      const ready = await prepareLocalRecognition();
      if (ticket !== prepareTicket) return;
      localClass = ready;
      if (settingsStatus) settingsStatus.textContent = "裝置辨認已就緒；可隨時在下方刪除資料。";
      if (currentText() !== text) return;
      showMessage("On-device recognition ready · 裝置辨認已就緒", "Speak naturally, with words linked together. No Siri is needed. · 請自然連讀，毋須 Siri。");
      addToastAction("Start practice · 開始朗讀", () => {
        const button = currentPracticeButton();
        if (button) void check(button);
      });
    } catch {
      if (ticket === prepareTicket) showMessage("Could not load English recognition · 未能載入英文辨認", "Check your connection and try again. Browser recognition is still available where supported. · 請檢查網絡再試；支援的瀏覽器仍可使用原有辨認。", "info", 9000);
    } finally { if (ticket === prepareTicket) preparingLocal = false; }
  }

  function openSettings() {
    if (!settingsDialog) {
      settingsDialog = document.createElement("dialog");
      settingsDialog.className = "pronunciation-settings";
      settingsDialog.setAttribute("aria-labelledby", "pronunciation-settings-title");
      const heading = document.createElement("h2");
      heading.id = "pronunciation-settings-title";
      heading.textContent = "語音設定與下載資料";
      const explanation = document.createElement("p");
      explanation.textContent = "為甚麼需要約 45 MB？這是英文語音辨認資料，讓支援的瀏覽器直接在裝置上辨認英文，毋須依賴 Siri，Apple 及非 Apple 裝置均可使用。這個模式的錄音不會上傳。";
      const storage = document.createElement("p");
      storage.textContent = "通常只需下載一次。你可隨時在咪高峰旁的「語音設定」刪除辨認資料，釋放儲存空間；再次使用時會重新載入。刪除不會影響字卡或學習紀錄。45 MB 是約數，解壓後的資料及瀏覽器快取可能佔用更多空間。";
      const guidance = document.createElement("p");
      guidance.textContent = "練習以約 80% 的詞句配對為通過標準，接受自然連讀及輕微差異，毋須逐字分開。讀成其他字詞則不會通過。";
      const download = document.createElement("button");
      download.type = "button";
      download.className = "pronunciation-settings-download";
      download.textContent = "下載／啟用裝置辨認（約 45 MB）";
      download.addEventListener("click", () => void prepareLocal());
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pronunciation-settings-delete";
      remove.textContent = "刪除裝置語音辨認資料";
      const status = document.createElement("p");
      settingsStatus = status;
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      remove.addEventListener("click", async () => {
        if (deletingLocal) return;
        deletingLocal = true;
        remove.disabled = download.disabled = true;
        ++prepareTicket;
        preparingLocal = false;
        localClass = null;
        window.EdmundPronunciation?.cancel();
        clearTimeout(showMessage.timer);
        ensureToast().classList.remove("is-visible");
        status.textContent = "正在刪除語音辨認資料…";
        try {
          const { deleteEnglishModel } = await import('./speaking-local-transcription.mjs?v=20260910-practice5');
          await deleteEnglishModel();
          status.textContent = "已刪除裝置語音辨認資料。字卡及學習紀錄已保留；瀏覽器可能仍保留短期下載快取。需要時可再次下載。";
        } catch {
          status.textContent = "未能完成刪除。請先關閉其他正在使用語音辨認的網頁，再按刪除重試。";
        } finally {
          deletingLocal = false;
          remove.disabled = download.disabled = false;
        }
      });
      const close = document.createElement("button");
      close.type = "button";
      close.textContent = "關閉";
      close.addEventListener("click", () => settingsDialog.close());
      settingsDialog.append(heading, explanation, storage, guidance, download, remove, status, close);
      document.body.append(settingsDialog);
    }
    settingsDialog.showModal();
  }

  function currentText() {
    const term = document.querySelector("[data-front-term]");
    // Use the English answer on either side, including Chinese-first decks.
    return (term?.dataset.pronunciationText ?? term?.textContent ?? "").trim();
  }

  function currentPracticeButton() {
    const back = document.querySelector("[data-back-card]");
    return (back && !back.classList.contains("hidden") && back.querySelector("[data-check-pronunciation]"))
      || document.querySelector("[data-check-pronunciation]");
  }

  function syncMicrophone(button) {
    button.classList.toggle("is-recording", microphoneState === "listening");
    button.setAttribute("aria-pressed", String(microphoneState === "listening"));
    button.setAttribute("aria-label", {
      starting: "正在啟動咪高峰；再次按下可停止",
      listening: "正在聆聽；再次按下可停止",
      processing: "正在辨認語音，請稍候"
    }[microphoneState] || "錄下我的讀音並檢查");
    button.disabled = !currentText();
  }

  function setMicrophoneState(state) {
    microphoneState = state;
    document.querySelectorAll("[data-check-pronunciation]").forEach(syncMicrophone);
  }

  async function check(button) {
    if (preparingLocal || deletingLocal) return;
    if (busy) {
      window.EdmundPronunciation?.stop();
      return;
    }
    const text = currentText();
    if (!text) { showResult({ reason: "no-reference" }); return; }
    if (!window.EdmundPronunciation?.recognizeAndCompare) {
      showResult({ reason: "recognition-unavailable" });
      return;
    }
    busy = true;
    activeButton = button;
    activeText = text;
    // Stop the detached model Audio element before recognition takes the mic.
    window.dispatchEvent(new Event("edmund-pronunciation-start"));
    window.speechSynthesis?.cancel();
    const speaker = document.querySelector("[data-speak-card]");
    const speakerWasDisabled = speaker?.disabled;
    if (speaker) speaker.disabled = true;
    try {
      const result = await window.EdmundPronunciation.recognizeAndCompare({
        expectedText: text,
        recognitionClass: localClass || undefined,
        maxSeconds: Math.min(20, Math.max(8, text.split(/\s+/).length * 1.2 + 3)),
        onState: state => {
          setMicrophoneState(state);
          if (state === "starting") {
            showMessage("Starting microphone… · 正在啟動咪高峰…", "Allow access if asked. Wait for ‘Speak now’. · 如有提示請允許使用，然後等候「請開始朗讀」。");
          } else if (state === "listening") {
            showMessage("Speak now · 請開始朗讀", `Read naturally: ${text} · 請自然連讀，毋須逐字分開。讀完會自動檢查，再按咪高峰可停止。`);
          } else if (state === "processing") {
            showMessage("Checking… · 正在辨認…", "Waiting for the final words. · 正在等候完整辨認結果。");
          }
        }
      });
      if (button.isConnected && currentText() === text) showResult(result);
    } catch {
      if (button.isConnected && currentText() === text) showResult({ reason: "recognition-unavailable" });
    } finally {
      busy = false;
      activeButton = null;
      activeText = "";
      if (speaker) speaker.disabled = speakerWasDisabled;
      setMicrophoneState("idle");
    }
  }

  function cancelIfCardChanged() {
    if (preparingLocal && currentText() !== prepareText) {
      ++prepareTicket;
      preparingLocal = false;
      ensureToast().classList.remove("is-visible");
    }
    if (busy && (!activeButton?.isConnected || currentText() !== activeText)) {
      window.EdmundPronunciation?.cancel();
      clearTimeout(showMessage.timer);
      ensureToast().classList.remove("is-visible");
    }
  }

  function createControls(side) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pronunciation-mic-button";
    button.dataset.checkPronunciation = side;
    button.setAttribute("aria-label", "錄下我的讀音並檢查");
    button.title = "Pronunciation check · 讀音檢查";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Z"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v3M8 21h8"/></svg>';
    button.addEventListener("click", event => { event.stopPropagation(); void check(button); });
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "pronunciation-settings-button";
    settings.textContent = "語音設定";
    settings.setAttribute("aria-label", "語音設定：下載說明及刪除辨認資料");
    settings.addEventListener("click", event => { event.stopPropagation(); openSettings(); });
    // Card context-menu gestures mark an answer; controls must not trigger them.
    for (const control of [button, settings]) control.addEventListener("contextmenu", event => event.stopPropagation());
    syncMicrophone(button);
    return { button, settings };
  }

  function enhance() {
    cancelIfCardChanged();
    const speak = document.querySelector("[data-speak-card]");
    if (speak && !document.querySelector('[data-check-pronunciation="front"]')) {
      const { button, settings } = createControls("front");
      speak.insertAdjacentElement("afterend", button);
      button.insertAdjacentElement("afterend", settings);
    }
    // The answer is rebuilt by renderStudyCard on every reveal/navigation.
    const back = document.querySelector("[data-back-card]");
    if (back && !back.querySelector("[data-check-pronunciation]")) {
      const toolbar = document.createElement("div");
      toolbar.className = "pronunciation-back-controls";
      toolbar.setAttribute("role", "group");
      toolbar.setAttribute("aria-label", "背面讀音練習");
      const { button, settings } = createControls("back");
      toolbar.append(button, settings);
      back.prepend(toolbar);
    }
    setMicrophoneState(microphoneState);
  }

  const style = document.createElement("style");
  style.textContent = `
    .pronunciation-back-controls{display:flex;align-items:center;justify-content:flex-end;gap:12px;width:100%;margin-bottom:14px}.pronunciation-back-controls .pronunciation-settings-button{min-height:44px}

    .pronunciation-settings-button{position:relative;max-width:70px;padding:7px 5px;border:1px solid #c8d8ef;border-radius:9px;background:#fff;color:#173961;font:inherit;font-size:12px;cursor:pointer}
    .pronunciation-settings{position:fixed;inset:0;box-sizing:border-box;width:min(540px,calc(100vw - 28px));max-height:85vh;overflow:auto;margin:auto;padding:24px;border:1px solid #c8d8ef;border-radius:18px;background:#fff;color:#173961;box-shadow:0 22px 65px #0006;font:16px/1.65 system-ui,sans-serif;z-index:100002}
    .pronunciation-settings::backdrop{background:#10243e88}.pronunciation-settings h2{font-size:1.25rem;margin:0 0 12px}.pronunciation-settings p{margin:10px 0}.pronunciation-settings button{display:block;width:100%;margin-top:12px;padding:11px;border:1px solid #c8d8ef;border-radius:10px;background:#f5f8fd;color:#173961;font:inherit;cursor:pointer}.pronunciation-settings .pronunciation-settings-delete{color:#a3202a;border-color:#e6b6ba}.pronunciation-settings button:disabled{opacity:.5;cursor:wait}.pronunciation-settings-button:focus-visible,.pronunciation-settings button:focus-visible{outline:3px solid #337ddd;outline-offset:3px}

    .pronunciation-mic-button{position:relative;display:grid;place-items:center;width:52px;height:52px;border:1px solid #c8d8ef;border-radius:14px;background:#fff;color:#102f5a;cursor:pointer;box-shadow:0 8px 24px #0c2d5414;transition:transform .18s,box-shadow .18s,background .18s}.pronunciation-mic-button:hover{transform:translateY(-2px);box-shadow:0 10px 28px #0c2d5428}.pronunciation-mic-button svg{width:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.pronunciation-mic-button.is-recording{color:#fff;background:#e53b47;box-shadow:0 0 0 calc(4px + 8px * var(--mic-level,0)) #e53b4730,0 0 30px #e53b4780;animation:edmundMicPulse 1s infinite}.pronunciation-toast{position:fixed;z-index:100000;left:50%;bottom:24px;width:min(520px,calc(100vw - 28px));padding:16px 20px;border-radius:17px;color:#fff;box-shadow:0 22px 65px #0006;transform:translate(-50%,calc(100% + 60px));opacity:0;transition:transform .42s cubic-bezier(.2,.8,.2,1),opacity .3s}.pronunciation-toast.is-visible{transform:translate(-50%,0);opacity:1}.pronunciation-toast.is-success{background:linear-gradient(135deg,#17794c,#38a96e)}.pronunciation-toast.is-info{background:linear-gradient(135deg,#214777,#376b9c)}.pronunciation-toast.is-retry{background:linear-gradient(135deg,#a3202a,#e34a55)}.pronunciation-toast-action{display:block;margin-top:12px;padding:10px 14px;border:1px solid #ffffff80;border-radius:10px;background:#fff;color:#173961;font:inherit;font-size:.85rem;cursor:pointer}.pronunciation-toast strong,.pronunciation-toast span{display:block;overflow-wrap:anywhere}.pronunciation-toast strong{font-size:1.05rem}.pronunciation-toast span{margin-top:4px;font-size:.9rem}@keyframes edmundMicPulse{50%{transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.pronunciation-mic-button,.pronunciation-toast{transition:none;animation:none}}
  `;
  document.head.append(style);
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("edmund-local-model-removed", () => {
    localClass = null;
    ++prepareTicket;
    preparingLocal = false;
    window.EdmundPronunciation?.cancel();
  });
  window.addEventListener("pagehide", () => { ++prepareTicket; preparingLocal = false; window.EdmundPronunciation?.cancel(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && busy) {
      window.EdmundPronunciation?.cancel();
      ensureToast().classList.remove("is-visible");
    }
  });
  enhance();
})();
