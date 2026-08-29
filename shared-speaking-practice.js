(function initialiseSharedSpeakingPractice() {
  "use strict";

  const CONFIG = window.EDMUND_SPEAKING_CONFIG || {};
  const WORKER = String(CONFIG.workerBaseUrl || "").replace(/\/+$/, "");
  const MAX_SECONDS = Math.min(300, Math.max(30, Number(CONFIG.maxRecordingSeconds || 300)));
  const MAX_UPLOAD_BYTES = Math.min(3 * 1024 * 1024, Math.max(512, Number(CONFIG.maxUploadBytes || 3 * 1024 * 1024)));
  const state = {
    audio: null,
    audioButton: null,
    audioUrls: new Map(),
    recorder: null,
    stream: null,
    chunks: [],
    card: null,
    startedAt: 0,
    timer: 0,
    stopTimer: 0,
    mp3: null,
    mp3Url: "",
    durationMs: 0,
    saving: false,
    toastTimer: 0
  };

  function studentToken() {
    const shared = window.EdmundSystemNav?.getStudentSession?.();
    return shared?.role === "student" && /^[0-9a-f-]{36}$/i.test(String(shared.token || ""))
      ? String(shared.token)
      : "";
  }

  function apiUrl(path) {
    if (!WORKER) throw new Error("錄音服務尚未設定。");
    return `${WORKER}${path}`;
  }

  async function apiFetch(path, options = {}) {
    const token = studentToken();
    if (!token) throw new Error("請先登入學生帳戶。");
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(apiUrl(path), { ...options, headers });
    if (!response.ok) {
      let message = "服務暫時未能使用，請稍後再試。";
      try {
        const body = await response.json();
        if (body?.code === "STUDENT_STORAGE_QUOTA_REACHED") message = "錄音共用儲存量已達 150 MB；請先匯出及刪除舊錄音。";
        else if (body?.error) message = String(body.error);
      } catch { /* Keep the safe message. */ }
      throw new Error(message);
    }
    return response;
  }

  function toast(message) {
    let node = document.querySelector("[data-edmund-speaking-toast]");
    if (!node) {
      node = document.createElement("div");
      node.className = "edmund-speaking-toast";
      node.dataset.edmundSpeakingToast = "";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    window.clearTimeout(state.toastTimer);
    node.textContent = message;
    node.hidden = false;
    state.toastTimer = window.setTimeout(() => { node.hidden = true; }, 4200);
  }

  function stopNarration() {
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
      state.audio = null;
    }
    window.speechSynthesis?.cancel();
    if (state.audioButton) {
      state.audioButton.classList.remove("is-playing");
      state.audioButton.removeAttribute("aria-pressed");
      state.audioButton = null;
    }
  }

  function fallbackVoice(text, button) {
    if (!("speechSynthesis" in window)) throw new Error("這個瀏覽器未能播放語音。");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.04;
    utterance.pitch = 1.02;
    const preferred = /(?:Aaron|Eddy|Reed|Alex|Evan|Nathan|Joey|Justin|Matthew|Brian|Guy|Davis|Eric|Fred|Tom)/i;
    utterance.voice = speechSynthesis.getVoices().find(voice => /^en-US/i.test(voice.lang) && preferred.test(voice.name))
      || speechSynthesis.getVoices().find(voice => /^en-US/i.test(voice.lang))
      || null;
    utterance.onend = utterance.onerror = () => stopNarration();
    state.audioButton = button;
    button.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    speechSynthesis.speak(utterance);
    toast("雲端示範聲線暫時未能使用，現正使用裝置上的美式英語聲線。");
  }

  async function playVoice(button, text) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return;
    if (state.audioButton === button) {
      stopNarration();
      return;
    }
    stopNarration();
    button.disabled = true;
    try {
      let url = state.audioUrls.get(normalized);
      if (!url) {
        const response = await apiFetch("/v1/learning-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: normalized })
        });
        const blob = await response.blob();
        if (!blob.size || !/^audio\//i.test(blob.type)) throw new Error("語音檔案無效。");
        url = URL.createObjectURL(blob);
        state.audioUrls.set(normalized, url);
      }
      const audio = new Audio(url);
      state.audio = audio;
      state.audioButton = button;
      button.classList.add("is-playing");
      button.setAttribute("aria-pressed", "true");
      audio.onended = audio.onerror = () => stopNarration();
      await audio.play();
    } catch (error) {
      console.warn("Learning voice playback failed", error);
      fallbackVoice(normalized, button);
    } finally {
      button.disabled = false;
    }
  }

  function formatBytes(value) {
    const bytes = Math.max(0, Number(value) || 0);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatClock(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function dock() {
    let node = document.querySelector("[data-edmund-recorder-dock]");
    if (node) return node;
    node = document.createElement("aside");
    node.className = "edmund-recorder-dock";
    node.dataset.edmundRecorderDock = "";
    node.hidden = true;
    node.setAttribute("aria-label", "錄音工具");
    node.innerHTML = `
      <div class="edmund-recorder-dock__top"><h2>練習錄音</h2><span class="edmund-recorder-dock__clock" data-recorder-clock>00:00</span></div>
      <p class="edmund-recorder-dock__status" data-recorder-status>準備錄音。</p>
      <audio controls preload="metadata" data-recorder-preview hidden></audio>
      <div class="edmund-recorder-dock__actions">
        <button type="button" data-recorder-stop hidden>■ 完成錄音</button>
        <button type="button" data-recorder-save hidden>儲存到我的錄音</button>
        <button type="button" data-recorder-download hidden>下載 MP3</button>
        <button type="button" data-recorder-discard hidden>捨棄</button>
        <a href="speaking-system.html?library=1">我的錄音</a>
      </div>`;
    document.body.append(node);
    return node;
  }

  function setDockStatus(message) {
    dock().querySelector("[data-recorder-status]").textContent = message;
  }

  function syncClock() {
    const elapsed = state.startedAt ? Date.now() - state.startedAt : state.durationMs;
    dock().querySelector("[data-recorder-clock]").textContent = formatClock(elapsed);
  }

  async function recordingQuota() {
    const response = await apiFetch("/v1/recordings/quota");
    const body = await response.json();
    if (body.canRecord !== true) throw new Error("錄音共用儲存量已達 150 MB；請先到「我的錄音」匯出及刪除舊錄音。");
    return body;
  }

  function bestRecorderMime() {
    const choices = ["audio/webm;codecs=opus", "audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm"];
    return choices.find(type => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  async function startRecording(card, button) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toast("這個瀏覽器未能使用咪高峰錄音。");
      return;
    }
    if (state.recorder && ["recording", "paused"].includes(state.recorder.state)) {
      if (state.card === card) stopRecording();
      else toast("請先完成目前的錄音。");
      return;
    }
    button.disabled = true;
    try {
      const quota = await recordingQuota();
      state.stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false
      });
      state.card = card;
      state.chunks = [];
      state.durationMs = 0;
      const mimeType = bestRecorderMime();
      state.recorder = mimeType ? new MediaRecorder(state.stream, { mimeType }) : new MediaRecorder(state.stream);
      state.recorder.ondataavailable = event => { if (event.data?.size) state.chunks.push(event.data); };
      state.recorder.onstop = () => finaliseRecording(state.recorder?.mimeType || mimeType || "audio/webm");
      state.recorder.start(1000);
      state.startedAt = Date.now();
      card.querySelector("[data-edmund-record-toggle]")?.classList.add("is-recording");
      const panel = dock();
      panel.hidden = false;
      panel.querySelector("[data-recorder-stop]").hidden = false;
      panel.querySelector("[data-recorder-save]").hidden = true;
      panel.querySelector("[data-recorder-download]").hidden = true;
      panel.querySelector("[data-recorder-discard]").hidden = true;
      panel.querySelector("[data-recorder-preview]").hidden = true;
      setDockStatus(`錄音中；目前共用儲存量 ${formatBytes(quota.usage?.storageBytes)} / 150 MB。`);
      syncClock();
      state.timer = window.setInterval(syncClock, 250);
      state.stopTimer = window.setTimeout(stopRecording, MAX_SECONDS * 1000);
    } catch (error) {
      console.warn("Recording could not start", error);
      toast(String(error?.message || "未能開始錄音。"));
      state.stream?.getTracks().forEach(track => track.stop());
      state.stream = null;
    } finally {
      button.disabled = false;
    }
  }

  function stopRecording() {
    if (!state.recorder || !["recording", "paused"].includes(state.recorder.state)) return;
    state.durationMs = Math.min(MAX_SECONDS * 1000, Date.now() - state.startedAt);
    state.startedAt = 0;
    window.clearInterval(state.timer);
    window.clearTimeout(state.stopTimer);
    state.timer = 0;
    state.stopTimer = 0;
    state.recorder.stop();
    state.stream?.getTracks().forEach(track => track.stop());
    state.stream = null;
    state.card?.querySelector("[data-edmund-record-toggle]")?.classList.remove("is-recording");
    dock().querySelector("[data-recorder-stop]").hidden = true;
    setDockStatus("錄音完成，正在製作真正的 MP3…");
    syncClock();
  }

  function sampleToInt16(value) {
    const sample = Math.max(-1, Math.min(1, value));
    return sample < 0 ? sample * 32768 : sample * 32767;
  }

  async function encodeMp3(source) {
    if (!window.lamejs?.Mp3Encoder) throw new Error("MP3 工具未能載入，請重新整理後再試。");
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("瀏覽器未能轉換錄音。");
    const context = new Context();
    let audioBuffer;
    try { audioBuffer = await context.decodeAudioData(await source.arrayBuffer()); }
    finally { context.close().catch(() => {}); }
    const sampleRate = audioBuffer.sampleRate;
    const sampleLimit = Math.min(audioBuffer.length, Math.floor(sampleRate * MAX_SECONDS));
    const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, index) => audioBuffer.getChannelData(index));
    const encoder = new lamejs.Mp3Encoder(1, sampleRate, 64);
    const blocks = [];
    const pcm = new Int16Array(1152);
    for (let offset = 0; offset < sampleLimit; offset += 1152) {
      const length = Math.min(1152, sampleLimit - offset);
      for (let index = 0; index < length; index += 1) {
        let sample = 0;
        for (const channel of channels) sample += channel[offset + index] / channels.length;
        pcm[index] = sampleToInt16(sample);
      }
      const encoded = encoder.encodeBuffer(length === 1152 ? pcm : pcm.subarray(0, length));
      if (encoded.length) blocks.push(new Uint8Array(encoded));
      if (offset && offset % (1152 * 200) === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    const flushed = encoder.flush();
    if (flushed.length) blocks.push(new Uint8Array(flushed));
    const mp3 = new Blob(blocks, { type: "audio/mpeg" });
    if (!mp3.size || mp3.size > MAX_UPLOAD_BYTES) throw new Error("錄音檔案過大，請縮短後再試。");
    return mp3;
  }

  async function finaliseRecording(sourceMime) {
    const source = new Blob(state.chunks, { type: sourceMime });
    state.chunks = [];
    try {
      state.mp3 = await encodeMp3(source);
      if (state.mp3Url) URL.revokeObjectURL(state.mp3Url);
      state.mp3Url = URL.createObjectURL(state.mp3);
      const panel = dock();
      const preview = panel.querySelector("[data-recorder-preview]");
      preview.src = state.mp3Url;
      preview.hidden = false;
      panel.querySelector("[data-recorder-save]").hidden = false;
      panel.querySelector("[data-recorder-download]").hidden = false;
      panel.querySelector("[data-recorder-discard]").hidden = false;
      setDockStatus(`MP3 已準備完成（${formatBytes(state.mp3.size)}，${formatClock(state.durationMs)}）。`);
    } catch (error) {
      console.warn("MP3 conversion failed", error);
      setDockStatus(String(error?.message || "未能製作 MP3，請重新錄音。"));
      dock().querySelector("[data-recorder-discard]").hidden = false;
    }
  }

  function stableId(card) {
    const system = (document.body.dataset.commonExpressionSystem || location.pathname.split("/").pop()?.replace(/\.html$/i, "") || "learning")
      .toLowerCase().replace(/[^a-z0-9.-]+/g, "-").slice(0, 36);
    const source = String(card.dataset.edmundRecordId || card.dataset.questionId || "question");
    const slug = source.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 68) || "question";
    let hash = 2166136261;
    for (const character of source) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
    return `learning:${system}:${slug}:${hash.toString(16)}`.slice(0, 120);
  }

  async function saveRecording(button) {
    if (!state.mp3 || !state.card || state.saving) return;
    state.saving = true;
    button.disabled = true;
    try {
      const form = new FormData();
      const id = stableId(state.card);
      const title = String(state.card.dataset.edmundRecordTitle || `${document.title} · ${state.card.dataset.questionId || "練習"}`)
        .replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 240);
      form.append("file", state.mp3, `${id.replace(/[:]/g, "-")}.mp3`);
      form.append("exerciseId", id);
      form.append("exerciseTitle", title || "Learning practice recording");
      form.append("exam", "learning-practice");
      form.append("durationMs", String(Math.max(1, Math.round(state.durationMs))));
      await apiFetch("/v1/recordings", { method: "POST", body: form });
      const latestQuota = await recordingQuota().catch(() => null);
      const used = latestQuota?.usage?.storageBytes;
      setDockStatus(`已儲存到「我的錄音」${Number.isFinite(Number(used)) ? `；共用儲存量 ${formatBytes(used)} / 150 MB` : ""}。`);
      button.hidden = true;
      toast("錄音已安全儲存。");
    } catch (error) {
      console.warn("Recording upload failed", error);
      setDockStatus(String(error?.message || "未能儲存錄音，請下載備份後再試。"));
    } finally {
      state.saving = false;
      button.disabled = false;
    }
  }

  function downloadRecording() {
    if (!state.mp3Url) return;
    const link = document.createElement("a");
    link.href = state.mp3Url;
    link.download = `${stableId(state.card).replace(/[:]/g, "-")}.mp3`;
    document.body.append(link);
    link.click();
    link.remove();
  }

  function discardRecording() {
    if (state.mp3Url) URL.revokeObjectURL(state.mp3Url);
    state.mp3 = null;
    state.mp3Url = "";
    state.durationMs = 0;
    state.card = null;
    const panel = dock();
    const preview = panel.querySelector("[data-recorder-preview]");
    preview.pause();
    preview.removeAttribute("src");
    preview.load();
    panel.hidden = true;
  }

  function hasAnswerFeedback(card) {
    return Boolean(card.querySelector(".answer-reveal, .feedback-panel"));
  }

  function enhanceCard(card) {
    if (!(card instanceof HTMLElement) || card.dataset.edmundSpeakingReady === "true") return;
    const prompt = String(card.dataset.edmundPromptText || "").trim();
    const answer = String(card.dataset.edmundAnswerText || "").trim();
    if (!prompt) return;
    const controls = document.createElement("div");
    controls.className = "edmund-speaking-practice";
    controls.innerHTML = `
      <button class="edmund-speaking-practice__button" type="button" data-edmund-voice-kind="prompt" aria-pressed="false">▶ 播放原句</button>
      <button class="edmund-speaking-practice__button edmund-speaking-practice__answer" type="button" data-edmund-voice-kind="answer" aria-pressed="false">▶ 播放新句／參考答案</button>
      <button class="edmund-speaking-practice__button" type="button" data-edmund-record-toggle>● 錄音練習</button>
      <a class="edmund-speaking-practice__library" href="speaking-system.html?library=1">我的錄音</a>`;
    controls.querySelector(".edmund-speaking-practice__answer").hidden = !answer || !hasAnswerFeedback(card);
    const promptContainer = card.querySelector(".question-prompt, .prompt-zh, .prompt-en") || card.firstElementChild;
    if (promptContainer?.parentNode) promptContainer.parentNode.insertBefore(controls, promptContainer.nextSibling);
    else card.append(controls);
    card.dataset.edmundSpeakingReady = "true";
  }

  function enhanceAll() {
    document.querySelectorAll(".question-card[data-edmund-prompt-text]").forEach(enhanceCard);
    const header = document.querySelector(".header-actions, .edmund-system-header__actions");
    if (header && !header.querySelector("[data-edmund-my-recordings]")) {
      const link = document.createElement("a");
      link.className = "header-button";
      link.href = "speaking-system.html?library=1";
      link.dataset.edmundMyRecordings = "";
      link.textContent = "我的錄音";
      const logout = header.querySelector("[data-logout]");
      header.insertBefore(link, logout || null);
    }
    const headerLink = document.querySelector("[data-edmund-my-recordings]");
    const logout = document.querySelector("[data-logout]");
    if (headerLink && logout) headerLink.hidden = logout.hidden;
  }

  document.addEventListener("click", event => {
    const voice = event.target.closest("[data-edmund-voice-kind]");
    if (voice) {
      const card = voice.closest(".question-card");
      const text = voice.dataset.edmundVoiceKind === "answer" ? card?.dataset.edmundAnswerText : card?.dataset.edmundPromptText;
      playVoice(voice, text);
      return;
    }
    const record = event.target.closest("[data-edmund-record-toggle]");
    if (record) {
      const card = record.closest(".question-card");
      if (card) startRecording(card, record);
      return;
    }
    if (event.target.closest("[data-recorder-stop]")) stopRecording();
    else if (event.target.closest("[data-recorder-save]")) saveRecording(event.target.closest("[data-recorder-save]"));
    else if (event.target.closest("[data-recorder-download]")) downloadRecording();
    else if (event.target.closest("[data-recorder-discard]")) discardRecording();
  });

  window.addEventListener("beforeunload", () => {
    stopNarration();
    state.stream?.getTracks().forEach(track => track.stop());
    for (const url of state.audioUrls.values()) URL.revokeObjectURL(url);
    if (state.mp3Url) URL.revokeObjectURL(state.mp3Url);
  });

  const observer = new MutationObserver(enhanceAll);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhanceAll, { once: true });
  else enhanceAll();
})();
