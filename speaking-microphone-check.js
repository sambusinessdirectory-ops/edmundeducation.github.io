/* A one-shot input check; audio stays local and is never connected to speakers. */
(function () {
  "use strict";
  window.EdmundSpeakingMicrophoneCheck = function (stream, { isActive, onQuiet }) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return () => {};
    let context, source, timer, stopped = false;
    function stop() {
      stopped = true;
      clearInterval(timer);
      try { source?.disconnect(); } catch {}
      if (context && context.state !== "closed") context.close().catch(() => {});
    }
    try {
      context = new AudioContext();
      source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let elapsed = 0, previousTime = performance.now(), activeFrames = 0;
      // Measure waveform energy after removing DC offset. Require several audible
      // frames so a single device-startup click does not count as working speech.
      context.resume().catch(() => {});
      timer = setInterval(() => {
        if (stopped) return;
        const now = performance.now();
        const delta = Math.min(150, now - previousTime);
        previousTime = now;
        if (!isActive()) return;
        elapsed += delta;
        analyser.getFloatTimeDomainData(samples);
        const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        const rms = Math.sqrt(samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length);
        if (context.state === "running" && rms > 0.003) activeFrames++;
        if (activeFrames >= 3) { stop(); return; }
        if (elapsed >= 2000) { stop(); onQuiet(); }
      }, 50);
    } catch { stop(); }
    return stop;
  };
})();
