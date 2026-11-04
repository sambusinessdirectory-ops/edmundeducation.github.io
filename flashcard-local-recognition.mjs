import { loadEnglishModel } from './speaking-local-transcription.mjs?v=20260910-practice5';

// A SpeechRecognition-shaped adapter for the existing, self-hosted Vosk model.
// It uses unrestricted recognition: the expected answer is never supplied as a
// grammar, so silence or unrelated speech cannot be forced into a correct answer.
export function localRecognitionClass(model, scope = window) {
  return class LocalRecognition {
    constructor() {
      this.finals = [];
      this.aborted = false;
      this.stopping = false;
    }
    start() {
      const Context = scope.AudioContext || scope.webkitAudioContext;
      if (!Context || !scope.navigator.mediaDevices?.getUserMedia) throw new Error('Microphone capture unavailable');
      this.context = new Context();
      // Called directly from the start-practice tap, after the model is loaded.
      const resumed = this.context.resume();
      void resumed.catch(() => {});
      const media = scope.navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      void (async () => {
        const stream = await media;
        if (this.aborted) { stream.getTracks().forEach(track => track.stop()); return; }
        this.stream = stream;
        await resumed;
        if (this.aborted) return;
        this.recognizer = new model.KaldiRecognizer(this.context.sampleRate);
        this.recognizer.on('result', message => {
          if (this.aborted) return;
          const text = message.result?.text?.trim();
          if (text) this.finals.push(text);
          this.deliver('');
        });
        this.recognizer.on('partialresult', message => {
          if (!this.aborted && !this.stopping) this.deliver(message.result?.partial || '');
        });
        this.recognizer.on('error', () => this.fail('recognition-unavailable'));
        this.source = this.context.createMediaStreamSource(stream);
        this.processor = this.context.createScriptProcessor(4096, 1, 1);
        this.silent = this.context.createGain();
        this.silent.gain.value = 0;
        this.processor.onaudioprocess = event => {
          if (this.aborted || this.stopping) return;
          try { this.recognizer.acceptWaveform(event.inputBuffer); }
          catch { this.fail('recognition-unavailable'); }
        };
        this.source.connect(this.processor);
        this.processor.connect(this.silent);
        this.silent.connect(this.context.destination);
        this.onstart?.();
      })().catch(error => {
        // The context may reject resume independently of microphone permission.
        void resumed.catch(() => {});
        if (!this.aborted) this.fail(error?.name === 'NotAllowedError' ? 'not-allowed' : 'audio-capture');
      });
    }
    deliver(partial) {
      const results = this.finals.map(text => Object.assign([{ transcript: text }], { isFinal: true }));
      if (partial) results.push(Object.assign([{ transcript: partial }], { isFinal: false }));
      if (results.length) this.onresult?.({ results, resultIndex: Math.max(0, results.length - 1) });
    }
    stop() {
      if (this.stopping || this.aborted) return;
      this.stopping = true;
      this.disconnectInput();
      if (!this.recognizer) { this.abort(); this.onend?.(); return; }
      // Keep the unrestricted recognizer alive long enough to flush queued audio
      // and retrieveFinalResult responses before ending the shared session.
      this.flushTimer = scope.setTimeout(() => {
        this.cleanup();
        this.onend?.();
      }, 2000);
      try { this.recognizer.retrieveFinalResult(); }
      catch { this.fail('recognition-unavailable'); }
    }
    disconnectInput() {
      if (this.processor) this.processor.onaudioprocess = null;
      this.processor?.disconnect();
      this.source?.disconnect();
      this.silent?.disconnect();
      this.stream?.getTracks().forEach(track => track.stop());
    }
    cleanup() {
      scope.clearTimeout(this.flushTimer);
      this.disconnectInput();
      this.recognizer?.remove();
      this.recognizer = null;
      void this.context?.close().catch(() => {});
    }
    fail(error) {
      if (this.aborted) return;
      this.cleanup();
      this.onerror?.({ error });
    }
    abort() {
      this.aborted = true;
      this.cleanup();
    }
  };
}

export async function prepareLocalRecognition() {
  return localRecognitionClass(await loadEnglishModel());
}
