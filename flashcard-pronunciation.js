(function initialiseFlashcardPronunciation() {
  "use strict";
  let busy = false;
  let activeButton = null;
  let activeText = "";

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
      showMessage("✓ Words matched · 字詞正確", heard, "success", 7000);
    } else if (result.scored) {
      showMessage("Try again · 再試一次", `${heard} — Listen and repeat the word or phrase. · 請聆聽後再讀一次。`, "retry", 8000);
    } else {
      const messages = {
        "no-speech": ["No speech detected · 未偵測到語音", "Tap the microphone and wait for ‘Speak now’, then read aloud. · 按咪高峰，看到「請開始朗讀」後再讀。"],
        "unrecognized": ["No final transcript · 暫未能辨認語音", "Your attempt was not scored. Tap the microphone to try again. · 這次未作評分，請按咪高峰重試。"],
        "permission-denied": ["Microphone permission needed · 請允許咪高峰", "Allow microphone and speech recognition access for this website in your browser settings, then retry. · 請在瀏覽器設定允許此網站使用咪高峰及語音辨認，再重試。"],
        "service-not-allowed": ["Speech recognition is disabled · 語音辨認未啟用", "On iPad or iPhone, enable Siri and allow speech recognition, then reopen Safari. · iPad 或 iPhone 請啟用 Siri 並允許語音辨認，再重新開啟 Safari。"],
        "audio-capture": ["Microphone unavailable · 未能使用咪高峰", "Close other apps using the microphone and try again. · 請關閉正在使用咪高峰的其他應用程式，再重試。"],
        "network": ["Speech service connection failed · 無法連接語音服務", "Check your internet connection and try again. This attempt was not scored. · 請檢查網絡後重試，這次未作評分。"],
        "recognition-timeout": ["Speech service did not respond · 語音服務未有回應", "Try again or reopen Safari. On iPad/iPhone, check that Siri is enabled. This attempt was not scored. · 請重試或重新開啟 Safari，並確認 Siri 已啟用。這次未作評分。"],
        "recognition-interrupted": ["Listening was interrupted · 聆聽已中斷", "Tap the microphone to try again. This attempt was not scored. · 請按咪高峰重試，這次未作評分。"],
        "no-reference": ["Choose a flashcard first · 請先選擇字卡", "Open a card with an English word or phrase. · 請開啟有英文字詞的字卡。"],
        "language-not-supported": ["English recognition unavailable · 暫不支援英文語音辨認", "Enable English speech recognition in your browser or device settings. · 請在瀏覽器或裝置設定啟用英文語音辨認。"]
      };
      const message = messages[result.reason] || ["Speech recognition unavailable · 暫未能使用語音辨認", "Use Safari or Chrome with speech recognition enabled. On iPad/iPhone, check that Siri is enabled. · 請使用已啟用語音辨認的 Safari 或 Chrome；iPad/iPhone 請確認 Siri 已啟用。"];
      showMessage(...message, "info", 9000);
    }
  }

  function currentText() {
    return document.querySelector("[data-front-term]")?.textContent?.trim() || "";
  }

  async function check(button) {
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
        maxSeconds: Math.min(20, Math.max(8, text.split(/\s+/).length * 1.2 + 3)),
        onState: state => {
          button.classList.toggle("is-recording", state === "listening");
          button.setAttribute("aria-pressed", String(state === "listening"));
          if (state === "starting") {
            button.setAttribute("aria-label", "正在啟動咪高峰；再次按下可停止");
            showMessage("Starting microphone… · 正在啟動咪高峰…", "Allow access if asked. Wait for ‘Speak now’. · 如有提示請允許使用，然後等候「請開始朗讀」。");
          } else if (state === "listening") {
            button.setAttribute("aria-label", "正在聆聽；再次按下可停止");
            showMessage("Speak now · 請開始朗讀", `Read: ${text} · 讀完會自動檢查，再按咪高峰可停止。`);
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
    .pronunciation-mic-button{position:relative;display:grid;place-items:center;width:52px;height:52px;border:1px solid #c8d8ef;border-radius:14px;background:#fff;color:#102f5a;cursor:pointer;box-shadow:0 8px 24px #0c2d5414;transition:transform .18s,box-shadow .18s,background .18s}.pronunciation-mic-button:hover{transform:translateY(-2px);box-shadow:0 10px 28px #0c2d5428}.pronunciation-mic-button svg{width:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.pronunciation-mic-button.is-recording{color:#fff;background:#e53b47;box-shadow:0 0 0 calc(4px + 8px * var(--mic-level,0)) #e53b4730,0 0 30px #e53b4780;animation:edmundMicPulse 1s infinite}.pronunciation-toast{position:fixed;z-index:100000;left:50%;bottom:24px;width:min(520px,calc(100vw - 28px));padding:16px 20px;border-radius:17px;color:#fff;box-shadow:0 22px 65px #0006;transform:translate(-50%,calc(100% + 60px));opacity:0;transition:transform .42s cubic-bezier(.2,.8,.2,1),opacity .3s}.pronunciation-toast.is-visible{transform:translate(-50%,0);opacity:1}.pronunciation-toast.is-success{background:linear-gradient(135deg,#17794c,#38a96e)}.pronunciation-toast.is-info{background:linear-gradient(135deg,#214777,#376b9c)}.pronunciation-toast.is-retry{background:linear-gradient(135deg,#a3202a,#e34a55)}.pronunciation-toast strong,.pronunciation-toast span{display:block;overflow-wrap:anywhere}.pronunciation-toast strong{font-size:1.05rem}.pronunciation-toast span{margin-top:4px;font-size:.9rem}@keyframes edmundMicPulse{50%{transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.pronunciation-mic-button,.pronunciation-toast{transition:none;animation:none}}
  `;
  document.head.append(style);
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("pagehide", () => window.EdmundPronunciation?.cancel());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && busy) {
      window.EdmundPronunciation?.cancel();
      ensureToast().classList.remove("is-visible");
    }
  });
  enhance();
})();
