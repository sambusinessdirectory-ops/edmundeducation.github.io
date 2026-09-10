(function initialiseFlashcardPronunciation() {
  "use strict";
  let busy = false;
  let activeButton = null;
  let activeText = "";
  let localClass = null;
  let preparingLocal = false;
  let prepareTicket = 0;
  let prepareText = "";

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
    const heard = result.transcript ? `Heard: “${result.transcript}” · 辨認結果` : "";
    if (result.passed) {
      showMessage("✓ Phrase recognised · 已辨認到詞句", `${heard} — Natural linking is welcome. · 可以自然連讀。`, "success", 7000);
    } else if (result.scored) {
      showMessage("Try again · 再試一次", `${heard} — Check the key words, then try at your normal speaking pace. · 請留意關鍵字詞，再以自然語速朗讀。`, "retry", 8000);
    } else {
      const messages = {
        "no-speech": ["No speech detected · 未偵測到語音", "Tap the microphone and wait for ‘Speak now’, then read aloud. · 按咪高峰，看到「請開始朗讀」後再讀。"],
        "uncertain": ["The recognizer may have missed a word · 辨認結果可能有遺漏", `${heard} — Keep speaking naturally; you do not need to separate every word. · 請自然連讀，毋須逐字分開。`],
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
    if (!result.passed && !['no-reference', 'permission-denied', 'audio-capture', 'no-speech'].includes(result.reason)) offerLocalRecognition();
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
        const button = document.querySelector('[data-check-pronunciation]');
        if (button) void check(button);
      });
      return;
    }
    if (preparingLocal || !navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext) || !window.WebAssembly) return;
    addToastAction("Use on-device recognition · 使用裝置辨認（首次下載約 45 MB）", prepareLocal);
  }

  async function prepareLocal() {
    if (busy || preparingLocal) return;
    preparingLocal = true;
    const ticket = ++prepareTicket;
    const text = currentText();
    prepareText = text;
    showMessage("Loading English recognition… · 正在載入英文辨認…", "First use downloads about 45 MB. Audio will be processed on this device. The microphone is still off. · 首次下載約 45 MB，語音會在此裝置處理；咪高峰尚未開啟。");
    addToastAction("Cancel · 取消", () => { ++prepareTicket; preparingLocal = false; ensureToast().classList.remove("is-visible"); });
    try {
      const { prepareLocalRecognition } = await import('./flashcard-local-recognition.mjs?v=20260910-natural4');
      const ready = await prepareLocalRecognition();
      if (ticket !== prepareTicket) return;
      localClass = ready;
      if (currentText() !== text) return;
      showMessage("On-device recognition ready · 裝置辨認已就緒", "Speak naturally, with words linked together. No Siri is needed. · 請自然連讀，毋須 Siri。");
      addToastAction("Start practice · 開始朗讀", () => {
        const button = document.querySelector('[data-check-pronunciation]');
        if (button) void check(button);
      });
    } catch {
      if (ticket === prepareTicket) showMessage("Could not load English recognition · 未能載入英文辨認", "Check your connection and try again. Browser recognition is still available where supported. · 請檢查網絡再試；支援的瀏覽器仍可使用原有辨認。", "info", 9000);
    } finally { if (ticket === prepareTicket) preparingLocal = false; }
  }

  function currentText() {
    return document.querySelector("[data-front-term]")?.textContent?.trim() || "";
  }

  async function check(button) {
    if (preparingLocal) return;
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
          button.classList.toggle("is-recording", state === "listening");
          button.setAttribute("aria-pressed", String(state === "listening"));
          if (state === "starting") {
            button.setAttribute("aria-label", "正在啟動咪高峰；再次按下可停止");
            showMessage("Starting microphone… · 正在啟動咪高峰…", "Allow access if asked. Wait for ‘Speak now’. · 如有提示請允許使用，然後等候「請開始朗讀」。");
          } else if (state === "listening") {
            button.setAttribute("aria-label", "正在聆聽；再次按下可停止");
            showMessage("Speak now · 請開始朗讀", `Read naturally: ${text} · 請自然連讀，毋須逐字分開。讀完會自動檢查，再按咪高峰可停止。`);
          } else if (state === "processing") {
            button.setAttribute("aria-label", "正在辨認語音，請稍候");
            showMessage("Checking… · 正在辨認…", "Waiting for the final words. · 正在等候完整辨認結果。");
          }
        },
        onTranscript: transcript => {
          if (transcript) showMessage("Listening… · 正在聆聽…", `Heard so far: ${transcript} · 正在辨認，尚未評分。`);
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
      button.classList.remove("is-recording");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "錄下我的讀音並檢查");
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

  function enhance() {
    cancelIfCardChanged();
    const speak = document.querySelector("[data-speak-card]");
    if (!speak || document.querySelector("[data-check-pronunciation]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pronunciation-mic-button";
    button.dataset.checkPronunciation = "";
    button.setAttribute("aria-label", "錄下我的讀音並檢查");
    button.title = "Pronunciation check · 讀音檢查";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Z"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v3M8 21h8"/></svg>';
    speak.insertAdjacentElement("afterend", button);
    button.addEventListener("click", event => { event.stopPropagation(); void check(button); });
  }

  const style = document.createElement("style");
  style.textContent = `
    .pronunciation-mic-button{position:relative;display:grid;place-items:center;width:52px;height:52px;border:1px solid #c8d8ef;border-radius:14px;background:#fff;color:#102f5a;cursor:pointer;box-shadow:0 8px 24px #0c2d5414;transition:transform .18s,box-shadow .18s,background .18s}.pronunciation-mic-button:hover{transform:translateY(-2px);box-shadow:0 10px 28px #0c2d5428}.pronunciation-mic-button svg{width:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.pronunciation-mic-button.is-recording{color:#fff;background:#e53b47;box-shadow:0 0 0 calc(4px + 8px * var(--mic-level,0)) #e53b4730,0 0 30px #e53b4780;animation:edmundMicPulse 1s infinite}.pronunciation-toast{position:fixed;z-index:100000;left:50%;bottom:24px;width:min(520px,calc(100vw - 28px));padding:16px 20px;border-radius:17px;color:#fff;box-shadow:0 22px 65px #0006;transform:translate(-50%,calc(100% + 60px));opacity:0;transition:transform .42s cubic-bezier(.2,.8,.2,1),opacity .3s}.pronunciation-toast.is-visible{transform:translate(-50%,0);opacity:1}.pronunciation-toast.is-success{background:linear-gradient(135deg,#17794c,#38a96e)}.pronunciation-toast.is-info{background:linear-gradient(135deg,#214777,#376b9c)}.pronunciation-toast.is-retry{background:linear-gradient(135deg,#a3202a,#e34a55)}.pronunciation-toast-action{display:block;margin-top:12px;padding:10px 14px;border:1px solid #ffffff80;border-radius:10px;background:#fff;color:#173961;font:inherit;font-size:.85rem;cursor:pointer}.pronunciation-toast strong,.pronunciation-toast span{display:block;overflow-wrap:anywhere}.pronunciation-toast strong{font-size:1.05rem}.pronunciation-toast span{margin-top:4px;font-size:.9rem}@keyframes edmundMicPulse{50%{transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.pronunciation-mic-button,.pronunciation-toast{transition:none;animation:none}}
  `;
  document.head.append(style);
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("pagehide", () => { ++prepareTicket; preparingLocal = false; window.EdmundPronunciation?.cancel(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && busy) {
      window.EdmundPronunciation?.cancel();
      ensureToast().classList.remove("is-visible");
    }
  });
  enhance();
})();
