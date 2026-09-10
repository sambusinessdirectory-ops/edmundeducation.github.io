(function initialiseFlashcardPronunciation() {
  "use strict";
  let busy = false;

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

  function showResult(result) {
    const toast = ensureToast();
    toast.className = `pronunciation-toast ${result.passed ? "is-success" : "is-retry"} is-visible`;
    const percent = Math.round(result.score * 100);
    if (result.passed) {
      toast.innerHTML = `<strong>✓ Success · 成功</strong><span>Your pronunciation is accurate. · 你的讀音準確（${percent}%）</span>`;
    } else if (result.reason === "no-speech") {
      toast.innerHTML = "<strong>No speech detected · 未偵測到語音</strong><span>Speak clearly after tapping the microphone, then try again. · 請按咪高峰後清楚朗讀。</span>";
    } else if (result.reason === "unrecognized") {
      toast.innerHTML = "<strong>Could not match the words · 未能辨認字詞</strong><span>Listen once more and repeat the exact word or phrase. · 請再聆聽並讀出相同字詞。</span>";
    } else if (result.reason === "recognition-unavailable") {
      toast.innerHTML = "<strong>Pronunciation check unavailable · 暫未能檢查讀音</strong><span>Please use a browser with English speech recognition enabled. · 請使用支援英文語音辨認的瀏覽器。</span>";
    } else {
      toast.innerHTML = `<strong>Try again · 再試一次</strong><span>The spoken words did not match closely enough. · 讀出的字詞未達準確要求（${percent}%）</span>`;
    }
    clearTimeout(showResult.timer);
    showResult.timer = setTimeout(() => toast.classList.remove("is-visible"), 4800);
  }

  function currentReference() {
    const text = document.querySelector("[data-front-term]")?.textContent?.trim() || "";
    const path = window.EDMUND_FLASHCARD_AUDIO?.[text];
    return { text, path: path ? new URL(path, location.href).href : "" };
  }

  async function check(button) {
    if (busy) {
      window.EdmundPronunciation?.stop();
      return;
    }
    const { text, path } = currentReference();
    if (!text || !path) {
      showResult({ passed: false, score: 0 });
      return;
    }
    busy = true;
    button.classList.add("is-recording");
    button.setAttribute("aria-label", "正在錄音；再次按下可停止");
    try {
      const result = await window.EdmundPronunciation.recordAndCompare({
        expectedText: text,
        modelUrl: path,
        maxSeconds: Math.min(10, Math.max(3, text.split(/\s+/).length * .75)),
        onLevel: level => button.style.setProperty("--mic-level", level.toFixed(2))
      });
      showResult(result);
    } catch (error) {
      const toast = ensureToast();
      toast.className = "pronunciation-toast is-retry is-visible";
      toast.innerHTML = `<strong>Microphone unavailable · 未能使用咪高峰</strong><span>${error?.message || "Please allow microphone access and try again."}</span>`;
      setTimeout(() => toast.classList.remove("is-visible"), 5000);
    } finally {
      busy = false;
      button.classList.remove("is-recording");
      button.style.removeProperty("--mic-level");
      button.setAttribute("aria-label", "錄下我的讀音並檢查");
    }
  }

  function enhance() {
    const speak = document.querySelector("[data-speak-card]");
    if (!speak || document.querySelector("[data-check-pronunciation]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pronunciation-mic-button";
    button.dataset.checkPronunciation = "";
    button.setAttribute("aria-label", "錄下我的讀音並檢查");
    button.title = "Pronunciation check · 讀音檢查";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Z"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v3M8 21h8"/></svg>';
    speak.insertAdjacentElement("afterend", button);
    button.addEventListener("click", event => { event.stopPropagation(); void check(button); });
  }

  const style = document.createElement("style");
  style.textContent = `
    .pronunciation-mic-button{position:relative;display:grid;place-items:center;width:52px;height:52px;border:1px solid #c8d8ef;border-radius:14px;background:#fff;color:#102f5a;cursor:pointer;box-shadow:0 8px 24px #0c2d5414;transition:transform .18s,box-shadow .18s,background .18s}.pronunciation-mic-button:hover{transform:translateY(-2px);box-shadow:0 10px 28px #0c2d5428}.pronunciation-mic-button svg{width:25px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.pronunciation-mic-button.is-recording{color:#fff;background:#e53b47;box-shadow:0 0 0 calc(4px + 8px * var(--mic-level,0)) #e53b4730,0 0 30px #e53b4780;animation:edmundMicPulse 1s infinite}.pronunciation-toast{position:fixed;z-index:100000;left:50%;bottom:24px;width:min(520px,calc(100vw - 28px));padding:16px 20px;border-radius:17px;color:#fff;box-shadow:0 22px 65px #0006;transform:translate(-50%,calc(100% + 60px));opacity:0;transition:transform .42s cubic-bezier(.2,.8,.2,1),opacity .3s}.pronunciation-toast.is-visible{transform:translate(-50%,0);opacity:1}.pronunciation-toast.is-success{background:linear-gradient(135deg,#17794c,#38a96e)}.pronunciation-toast.is-retry{background:linear-gradient(135deg,#a3202a,#e34a55)}.pronunciation-toast strong,.pronunciation-toast span{display:block}.pronunciation-toast strong{font-size:1.05rem}.pronunciation-toast span{margin-top:4px;font-size:.9rem}@keyframes edmundMicPulse{50%{transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.pronunciation-mic-button,.pronunciation-toast{transition:none;animation:none}}
  `;
  document.head.append(style);
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  enhance();
})();
