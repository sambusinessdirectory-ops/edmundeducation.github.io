(function initialiseEdmundPronunciation() {
  "use strict";

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let activeStop = null;

  function normalizeWords(value) {
    return String(value || "").toLocaleLowerCase().replace(/[’']/g, "'").match(/[a-z0-9']+/g) || [];
  }

  function editSimilarity(expected, actual) {
    const a = normalizeWords(expected).join(" ");
    const b = normalizeWords(actual).join(" ");
    if (!a || !b) return null;
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const previous = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = previous;
      }
    }
    return Math.max(0, 1 - row[b.length] / Math.max(a.length, b.length, 1));
  }

  function monoSamples(buffer, start = 0, end = buffer.duration) {
    const from = Math.max(0, Math.floor(start * buffer.sampleRate));
    const to = Math.min(buffer.length, Math.ceil(end * buffer.sampleRate));
    const output = new Float32Array(Math.max(0, to - from));
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const input = buffer.getChannelData(channel);
      for (let index = from; index < to; index += 1) output[index - from] += input[index] / buffer.numberOfChannels;
    }
    return output;
  }

  function resample(input, sourceRate, targetRate = 8000) {
    if (!input.length || sourceRate === targetRate) return input;
    const output = new Float32Array(Math.max(1, Math.floor(input.length * targetRate / sourceRate)));
    for (let index = 0; index < output.length; index += 1) {
      const position = index * sourceRate / targetRate;
      const left = Math.floor(position);
      const mix = position - left;
      output[index] = (input[left] || 0) * (1 - mix) + (input[left + 1] || input[left] || 0) * mix;
    }
    return output;
  }

  function acousticProfile(samples, sampleRate) {
    const data = resample(samples, sampleRate);
    if (data.length < 160) return { bands: Array(12).fill(0), envelope: [], duration: data.length / 8000 };
    let peak = 0;
    for (const value of data) peak = Math.max(peak, Math.abs(value));
    const scale = peak > 0 ? 1 / peak : 1;
    const frequencies = [140, 190, 260, 350, 470, 630, 850, 1150, 1550, 2100, 2850, 3800];
    const bands = Array(frequencies.length).fill(0);
    const envelope = [];
    const frame = 320;
    const step = 240;
    for (let offset = 0; offset + frame <= data.length; offset += step) {
      let rms = 0;
      for (let i = 0; i < frame; i += 1) rms += (data[offset + i] * scale) ** 2;
      envelope.push(Math.sqrt(rms / frame));
      frequencies.forEach((frequency, bandIndex) => {
        const omega = 2 * Math.PI * frequency / 8000;
        const coefficient = 2 * Math.cos(omega);
        let q0 = 0, q1 = 0, q2 = 0;
        for (let i = 0; i < frame; i += 1) {
          q0 = data[offset + i] * scale + coefficient * q1 - q2;
          q2 = q1;
          q1 = q0;
        }
        bands[bandIndex] += Math.max(0, q1 * q1 + q2 * q2 - coefficient * q1 * q2);
      });
    }
    const total = bands.reduce((sum, value) => sum + value, 0) || 1;
    return { bands: bands.map(value => Math.sqrt(value / total)), envelope, duration: data.length / 8000 };
  }

  function cosine(left, right) {
    let dot = 0, a = 0, b = 0;
    for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
      dot += left[index] * right[index];
      a += left[index] ** 2;
      b += right[index] ** 2;
    }
    return a && b ? Math.max(0, Math.min(1, dot / Math.sqrt(a * b))) : 0;
  }

  function envelopeSimilarity(left, right) {
    if (!left.length || !right.length) return 0;
    const points = 20;
    const sample = (values, index) => values[Math.min(values.length - 1, Math.floor(index * values.length / points))] || 0;
    const a = Array.from({ length: points }, (_, index) => sample(left, index));
    const b = Array.from({ length: points }, (_, index) => sample(right, index));
    const meanA = a.reduce((sum, value) => sum + value, 0) / points;
    const meanB = b.reduce((sum, value) => sum + value, 0) / points;
    return cosine(a.map(value => Math.max(0, value - meanA + .12)), b.map(value => Math.max(0, value - meanB + .12)));
  }

  async function decode(context, source) {
    if (source instanceof AudioBuffer) return source;
    const bytes = source instanceof Blob ? await source.arrayBuffer() : await (await fetch(source, { cache: "force-cache" })).arrayBuffer();
    return context.decodeAudioData(bytes.slice(0));
  }

  function startRecognition(expectedText) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return { stop() {}, result: Promise.resolve("") };
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    let finalText = "";
    const result = new Promise(resolve => {
      recognition.onresult = event => {
        finalText = Array.from(event.results).map(item => item[0]?.transcript || "").join(" ").trim();
      };
      recognition.onerror = () => resolve(finalText);
      recognition.onend = () => resolve(finalText);
    });
    try { recognition.start(); } catch { return { stop() {}, result: Promise.resolve("") }; }
    return { stop() { try { recognition.stop(); } catch {} }, result, expectedText };
  }

  async function record({ expectedText = "", maxSeconds = 7, onLevel } = {}) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !AudioContextClass) {
      throw new Error("This browser cannot record microphone audio.");
    }
    if (activeStop) activeStop();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const context = new AudioContextClass();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const meter = new Float32Array(analyser.fftSize);
    const chunks = [];
    const recorder = new MediaRecorder(stream);
    const recognition = startRecognition(expectedText);
    let heardVoice = false;
    let lastVoiceAt = performance.now();
    let stopped = false;
    let frameId = 0;
    let timeoutId = 0;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      recognition.stop();
      if (recorder.state !== "inactive") recorder.stop();
    };
    activeStop = stop;
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    const finished = new Promise((resolve, reject) => {
      recorder.onerror = () => reject(new Error("Microphone recording was interrupted."));
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        source.disconnect();
        const transcript = await Promise.race([recognition.result, new Promise(done => setTimeout(() => done(""), 500))]);
        activeStop = null;
        resolve({ blob: new Blob(chunks, { type: recorder.mimeType || "audio/webm" }), transcript, context });
      };
    });
    recorder.start(100);
    const startedAt = performance.now();
    const monitor = () => {
      if (stopped) return;
      analyser.getFloatTimeDomainData(meter);
      let energy = 0;
      for (const value of meter) energy += value * value;
      const level = Math.sqrt(energy / meter.length);
      onLevel?.(Math.min(1, level * 12));
      if (level > .025) { heardVoice = true; lastVoiceAt = performance.now(); }
      if (heardVoice && performance.now() - lastVoiceAt > 650 && performance.now() - startedAt > 850) stop();
      else frameId = requestAnimationFrame(monitor);
    };
    frameId = requestAnimationFrame(monitor);
    timeoutId = setTimeout(stop, Math.max(2, maxSeconds) * 1000);
    return { stop, finished };
  }

  async function recordAndCompare({ expectedText, modelUrl, modelStart = 0, modelEnd, maxSeconds, onLevel } = {}) {
    const session = await record({ expectedText, maxSeconds, onLevel });
    const captured = await session.finished;
    try {
      const [studentBuffer, modelBuffer] = await Promise.all([
        decode(captured.context, captured.blob),
        decode(captured.context, modelUrl)
      ]);
      const student = acousticProfile(monoSamples(studentBuffer), studentBuffer.sampleRate);
      const model = acousticProfile(monoSamples(modelBuffer, modelStart, modelEnd ?? modelBuffer.duration), modelBuffer.sampleRate);
      const spectrum = cosine(student.bands, model.bands);
      const rhythm = envelopeSimilarity(student.envelope, model.envelope);
      const duration = Math.min(student.duration, model.duration) / Math.max(student.duration, model.duration, .01);
      const acoustic = .56 * spectrum + .24 * rhythm + .20 * duration;
      const words = editSimilarity(expectedText, captured.transcript);
      const score = words == null ? Math.min(.99, .62 + .38 * acoustic) : .68 * words + .32 * acoustic;
      return { score, passed: score >= .8, transcript: captured.transcript, acoustic, duration: student.duration };
    } finally {
      captured.context.close().catch(() => {});
    }
  }

  window.EdmundPronunciation = Object.freeze({ recordAndCompare, stop() { activeStop?.(); } });
})();
