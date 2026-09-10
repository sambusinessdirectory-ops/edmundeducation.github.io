(function initialiseEdmundPronunciation() {
  "use strict";

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let activeStop = null;
  let activeCancel = null;

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

  function wordSimilarity(expected, actual) {
    const a = normalizeWords(expected);
    const b = normalizeWords(actual);
    if (!a.length || !b.length) return null;
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

  function analyseTextMatch(expected, actual, acoustic = 0) {
    const characterMatch = editSimilarity(expected, actual) || 0;
    const wordMatch = wordSimilarity(expected, actual) || 0;
    const lexical = .45 * characterMatch + .55 * wordMatch;
    const score = lexical >= .985
      ? Math.min(1, .985 + .015 * acoustic)
      : .92 * lexical + .08 * acoustic;
    return { score, lexical, passed: lexical >= .78 && score >= .80 };
  }

  const weakWords = new Set(['a', 'an', 'the', 'of', 'to', 'and']);
  const spokenForms = {
    "can't": 'can not', cannot: 'can not', "won't": 'will not', "shan't": 'shall not',
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not',
    "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not',
    "hasn't": 'has not', "hadn't": 'had not', "couldn't": 'could not', "wouldn't": 'would not',
    "shouldn't": 'should not', "mustn't": 'must not',
    "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
    "it's": 'it is', "he's": 'he is', "she's": 'she is', "that's": 'that is',
    "i've": 'i have', "you've": 'you have', "we've": 'we have', "they've": 'they have',
    "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will', "we'll": 'we will', "they'll": 'they will',
    "could've": 'could have', "would've": 'would have', "should've": 'should have',
    gonna: 'going to', wanna: 'want to', gotta: 'got to', hafta: 'have to',
    gimme: 'give me', lemme: 'let me', kinda: 'kind of', sorta: 'sort of',
    lotta: 'lot of', outta: 'out of', coulda: 'could have', woulda: 'would have', shoulda: 'should have'
  };
  const soundSpellings = new Map();
  // These are transcript spellings of the same spoken word, not synonyms.
  for (const group of [['break', 'brake'], ['see', 'sea'], ['meet', 'meat'], ['right', 'write', 'rite'],
    ['hear', 'here'], ['their', 'there'], ['wear', 'where'], ['week', 'weak'], ['peace', 'piece'],
    ['colour', 'color'], ['favour', 'favor'], ['centre', 'center'], ['organise', 'organize'], ['recognise', 'recognize']]) {
    for (const word of group) soundSpellings.set(word, group[0]);
  }
  const smallNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
  function naturalWords(text) {
    const words = normalizeWords(text).flatMap(word => (Object.prototype.hasOwnProperty.call(spokenForms, word) ? spokenForms[word] : word).split(' '));
    const output = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (typeof tens[word] === "number") {
        const unit = smallNumbers.indexOf(words[i + 1]);
        output.push(String(tens[word] + (unit > 0 && unit < 10 ? unit : 0)));
        if (unit > 0 && unit < 10) i++;
      } else output.push(smallNumbers.includes(word) ? String(smallNumbers.indexOf(word)) : soundSpellings.get(word) || word);
    }
    return output;
  }

  function analyseNaturalTextMatch(expected, actual) {
    const a = naturalWords(expected), b = naturalWords(actual);
    if (!a.length || !b.length) return { score: 0, passed: false, close: false, variation: false };
    if (a.join('') === b.join('')) return { score: 1, passed: true, close: false, variation: normalizeWords(expected).join(' ') !== normalizeWords(actual).join(' ') };
    const weight = word => weakWords.has(word) ? .15 : 1;
    const append = (state, cost, missing = 0, extra = 0) => ({ cost: state.cost + cost, missing: state.missing + missing, extra: state.extra + extra });
    const grid = Array.from({ length: a.length + 1 }, () => []);
    grid[0][0] = { cost: 0, missing: 0, extra: 0 };
    for (let i = 1; i <= a.length; i++) grid[i][0] = append(grid[i - 1][0], weight(a[i - 1]), +!weakWords.has(a[i - 1]));
    for (let j = 1; j <= b.length; j++) grid[0][j] = append(grid[0][j - 1], weight(b[j - 1]), 0, +!weakWords.has(b[j - 1]));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      const left = a[i - 1], right = b[j - 1];
      const same = left === right;
      const softSpelling = (left === 'of' && right === 'off') || (left === 'to' && right === 'too');
      // Allow small recognition/pronunciation differences in longer words.
      // Short minimal pairs (cat/cap, ship/sheep) still need a real match.
      const similarity = Math.min(left.length, right.length) >= 5 ? editSimilarity(left, right) : 0;
      const substitution = similarity >= .8 ? 1 - similarity : Math.max(weight(left), weight(right));
      const choices = [
        append(grid[i - 1][j - 1], same ? 0 : softSpelling ? .08 : substitution,
          +( !same && !softSpelling && !weakWords.has(left)), +( !same && !softSpelling && !weakWords.has(right))),
        append(grid[i - 1][j], weight(left), +!weakWords.has(left)),
        append(grid[i][j - 1], weight(right), 0, +!weakWords.has(right))
      ];
      // Word boundaries may differ in connected speech ("breakof" / "break of").
      if (i > 1 && a[i - 2] + left === right) choices.push(append(grid[i - 2][j - 1], 0));
      if (j > 1 && b[j - 2] + right === left) choices.push(append(grid[i - 1][j - 2], 0));
      choices.sort((x, y) => x.cost - y.cost || (x.missing + x.extra) - (y.missing + y.extra));
      grid[i][j] = choices[0];
    }
    const alignment = grid[a.length][b.length];
    const total = Math.max(a.reduce((sum, word) => sum + weight(word), 0), b.reduce((sum, word) => sum + weight(word), 0));
    const score = Math.max(0, 1 - alignment.cost / total);
    const anchors = a.filter(word => !weakWords.has(word));
    // Eighty percent of the weighted phrase is sufficient. Keep negation and
    // numbers intact: changing these reverses the answer rather than its accent.
    const critical = words => words.filter(word => ['not', 'never', 'no'].includes(word) || /^\d+$/.test(word)).join(' ');
    const passed = anchors.length > 0 && critical(a) === critical(b) && score + Number.EPSILON >= .8;
    return { score, passed, close: !passed && score >= .65, variation: passed, missingKeyWords: alignment.missing };
  }

  function finalTranscriptCandidates(results) {
    let candidates = [''];
    for (const result of results) {
      if (!result.isFinal) continue;
      const alternatives = Array.from(result).slice(0, 5).map(item => item.transcript?.trim()).filter(Boolean);
      if (!alternatives.length) continue;
      candidates = candidates.flatMap(prefix => alternatives.map(text => `${prefix} ${text}`.trim())).slice(0, 25);
    }
    return [...new Set(candidates.filter(text => normalizeWords(text).length))];
  }

  function bestNaturalMatch(expected, candidates) {
    return candidates.map(transcript => ({ ...analyseNaturalTextMatch(expected, transcript), transcript }))
      .sort((a, b) => Number(b.passed) - Number(a.passed) || b.score - a.score)[0];
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
    if (data.length < 160) return { bands: Array(12).fill(0), envelope: [], duration: data.length / 8000, peak: 0, rms: 0, voicedFraction: 0 };
    let peak = 0;
    let totalEnergy = 0;
    for (const value of data) {
      peak = Math.max(peak, Math.abs(value));
      totalEnergy += value * value;
    }
    const rawRms = Math.sqrt(totalEnergy / data.length);
    const scale = peak > 0 ? 1 / peak : 1;
    const frequencies = [140, 190, 260, 350, 470, 630, 850, 1150, 1550, 2100, 2850, 3800];
    const bands = Array(frequencies.length).fill(0);
    const envelope = [];
    let voicedFrames = 0;
    const frame = 320;
    const step = 240;
    for (let offset = 0; offset + frame <= data.length; offset += step) {
      let rms = 0;
      for (let i = 0; i < frame; i += 1) rms += (data[offset + i] * scale) ** 2;
      const frameRms = Math.sqrt(rms / frame);
      envelope.push(frameRms);
      if (frameRms > .075) voicedFrames += 1;
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
    return {
      bands: bands.map(value => Math.sqrt(value / total)),
      envelope,
      duration: data.length / 8000,
      peak,
      rms: rawRms,
      voicedFraction: envelope.length ? voicedFrames / envelope.length : 0
    };
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
    if (!Recognition) return { supported: false, stop() {}, result: Promise.resolve("") };
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
    try { recognition.start(); } catch { return { supported: false, stop() {}, result: Promise.resolve("") }; }
    return { supported: true, stop() { try { recognition.stop(); } catch {} }, result, expectedText };
  }

  // Flashcards need a transcript, not a second microphone capture. In Safari,
  // getUserMedia/MediaRecorder can compete with SpeechRecognition's audio session.
  // Start recognition directly in the tap handler and let it own the microphone.
  function recognizeAndCompare({ expectedText = "", maxSeconds = 10, onState, onTranscript, recognitionClass } = {}) {
    activeCancel?.();
    activeStop?.();
    const Recognition = recognitionClass || window.SpeechRecognition || window.webkitSpeechRecognition;
    const unscored = reason => ({ passed: false, scored: false, score: 0, transcript: "", reason });
    if (!Recognition) return Promise.resolve(unscored("recognition-unavailable"));
    if (!normalizeWords(expectedText).length) return Promise.resolve(unscored("no-reference"));

    return new Promise(resolve => {
      let recognition;
      let settled = false;
      let stopping = false;
      let started = false;
      let heardSpeech = false;
      let transcript = "";
      let candidates = [];
      let lastPreview = "";
      let phraseTimer;
      let startedAt = 0;
      let retries = 0;
      let timer;
      let retryTimer;
      const clearTimers = () => { clearTimeout(timer); clearTimeout(retryTimer); clearTimeout(phraseTimer); };
      const detach = () => {
        if (!recognition) return;
        recognition.onstart = recognition.onaudiostart = recognition.onspeechstart = null;
        recognition.onspeechend = recognition.onresult = recognition.onend = recognition.onerror = null;
      };
      const finish = result => {
        if (settled) return;
        settled = true;
        clearTimers();
        if (recognition) {
          detach();
          try { recognition.abort(); } catch {}
        }
        if (activeStop === stop) activeStop = null;
        if (activeCancel === cancel) activeCancel = null;
        onState?.("idle");
        resolve(result);
      };
      const compare = () => {
        const match = bestNaturalMatch(expectedText, candidates);
        if (!match) { finish(unscored("unrecognized")); return; }
        finish({ ...match, scored: true, reason: match.passed ? "matched" : "mismatch" });
      };
      const stop = () => {
        if (settled || stopping) return;
        stopping = true;
        clearTimers();
        onState?.("processing");
        // stop() requests a final result asynchronously. A 500ms race dropped
        // valid Safari/network results; retain listeners until end or timeout.
        timer = setTimeout(() => transcript ? compare() : finish(unscored("recognition-timeout")), 5000);
        try { recognition?.stop(); } catch { finish(unscored("recognition-unavailable")); }
      };
      const cancel = () => finish(unscored("cancelled"));
      activeStop = stop;
      activeCancel = cancel;
      const start = () => {
        if (settled || stopping) return;
        started = false;
        onState?.("starting");
        timer = setTimeout(() => finish(unscored("recognition-timeout")), 15000);
        try {
          recognition = new Recognition();
          recognition.lang = "en-US";
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 5;
          const ready = () => {
            if (settled || stopping || started) return;
            started = true;
            startedAt = performance.now();
            clearTimeout(timer);
            onState?.("listening");
            // Permission/startup time is not part of the student's speaking time.
            timer = setTimeout(stop, Math.min(30, Math.max(8, Number(maxSeconds) || 10)) * 1000);
          };
          recognition.onstart = ready;
          recognition.onaudiostart = ready;
          const waitForPhrase = () => {
            if (settled || stopping) return;
            clearTimeout(phraseTimer);
            phraseTimer = setTimeout(stop, 1600);
          };
          recognition.onspeechstart = () => { heardSpeech = true; clearTimeout(phraseTimer); };
          recognition.onspeechend = waitForPhrase;
          recognition.onresult = event => {
            if (settled) return;
            const results = Array.from(event.results);
            const preview = results.map(item => item[0]?.transcript || "").join(" ").trim();
            if (normalizeWords(preview).length) heardSpeech = true;
            onTranscript?.(preview);
            // Interim hypotheses can be empty or wrong while the user is speaking.
            // Never grade them. Rebuild finals because result indices can change.
            candidates = finalTranscriptCandidates(results);
            const changed = preview !== lastPreview || (candidates[0] || "") !== transcript;
            transcript = candidates[0] || "";
            lastPreview = preview;
            // Final may mean just one segment, not the end of the student's phrase.
            // Keep listening through linking and natural pauses before requesting stop.
            if (changed) {
              clearTimeout(phraseTimer);
              const hasInterim = results.some(item => !item.isFinal && normalizeWords(item[0]?.transcript).length);
              if (transcript && !hasInterim) waitForPhrase();
            }
          };
          recognition.onerror = event => {
            if (settled) return;
            const reasons = {
              "not-allowed": "permission-denied",
              "service-not-allowed": "service-not-allowed",
              "audio-capture": "audio-capture",
              "network": "network",
              "language-not-supported": "language-not-supported",
              "no-speech": "no-speech",
              "aborted": "recognition-interrupted"
            };
            if (event.error === "no-speech" && transcript) compare();
            else finish(unscored(reasons[event.error] || "recognition-unavailable"));
          };
          recognition.onend = () => {
            if (settled) return;
            if (transcript) { compare(); return; }
            // Some Safari sessions end empty during audio-session startup. Retry
            // once, without judging the student or restarting permission errors.
            if (!stopping && !heardSpeech && retries === 0 && (!started || performance.now() - startedAt < 1500)) {
              retries += 1;
              clearTimeout(timer);
              detach();
              onState?.("starting");
              retryTimer = setTimeout(start, 300);
              return;
            }
            finish(unscored(heardSpeech ? "unrecognized" : (!started || performance.now() - startedAt < 1500) ? "recognition-unavailable" : "no-speech"));
          };
          recognition.start();
        } catch (error) {
          finish(unscored(error?.name === "NotAllowedError" ? "permission-denied" : "recognition-unavailable"));
        }
      };
      start();
    });
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
    let voiceFrames = 0;
    let meterFrames = 0;
    let maximumLevel = 0;
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
        resolve({
          blob: new Blob(chunks, { type: recorder.mimeType || "audio/webm" }),
          transcript,
          context,
          recognitionSupported: recognition.supported,
          voiceActivity: { heardVoice, voiceFrames, meterFrames, maximumLevel }
        });
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
      meterFrames += 1;
      maximumLevel = Math.max(maximumLevel, level);
      onLevel?.(Math.min(1, level * 12));
      if (level > .018) { heardVoice = true; voiceFrames += 1; lastVoiceAt = performance.now(); }
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
      const hasSpeech = captured.voiceActivity.heardVoice
        && captured.voiceActivity.voiceFrames >= 2
        && captured.voiceActivity.maximumLevel >= .018
        && student.duration >= .18
        && student.peak >= .012
        && student.rms >= .0015
        && student.voicedFraction >= .04;
      if (!hasSpeech) {
        return { score: 0, passed: false, reason: "no-speech", transcript: "", acoustic: 0, duration: student.duration };
      }
      if (!captured.recognitionSupported) {
        return { score: 0, passed: false, reason: "recognition-unavailable", transcript: "", acoustic: 0, duration: student.duration };
      }
      if (!normalizeWords(captured.transcript).length) {
        return { score: 0, passed: false, reason: "unrecognized", transcript: "", acoustic: 0, duration: student.duration };
      }
      const spectrum = cosine(student.bands, model.bands);
      const rhythm = envelopeSimilarity(student.envelope, model.envelope);
      const duration = Math.min(student.duration, model.duration) / Math.max(student.duration, model.duration, .01);
      const acoustic = .56 * spectrum + .24 * rhythm + .20 * duration;
      const textMatch = analyseTextMatch(expectedText, captured.transcript, acoustic);
      return {
        score: textMatch.score,
        passed: textMatch.passed,
        reason: textMatch.passed ? "matched" : "mismatch",
        transcript: captured.transcript,
        acoustic,
        lexical: textMatch.lexical,
        duration: student.duration
      };
    } finally {
      captured.context.close().catch(() => {});
    }
  }

  window.EdmundPronunciation = Object.freeze({ recordAndCompare, recognizeAndCompare, analyseTextMatch, analyseNaturalTextMatch, stop() { activeStop?.(); }, cancel() { activeCancel?.(); } });
})();
