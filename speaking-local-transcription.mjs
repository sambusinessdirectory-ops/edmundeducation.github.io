// Shared ownership keeps a deleted model from being retained or written back by
// an in-flight download. Only the recognizer's /vosk database is removed.
export function createEnglishModelStore(scope = window) {
  let current = null;
  let scriptPromise = null;
  let deleting = null;
  const modelURL = new URL('./assets/speaking-system/models/english-us-0.15.tar.gz', import.meta.url).href;
  const scriptURL = new URL('./vendor/vosk/vosk-0.0.8.js', import.meta.url).href;
  const channel = scope.BroadcastChannel ? new scope.BroadcastChannel('edmund-local-recognition-storage') : null;
  channel?.unref?.();
  const cancelled = () => Object.assign(new Error('Local recognition data was removed.'), { name: 'AbortError' });
  function release() {
    const previous = current;
    current = null;
    if (previous) {
      scope.clearTimeout(previous.timer);
      previous.reject(cancelled());
      // The pinned Vosk 0.0.8 worker owns the IndexedDB connection and download.
      // Force termination also works before the model finishes loading, when
      // Vosk's graceful terminate message cannot yet dispose of its model.
      if (previous.model?.worker) previous.model.worker.terminate();
      else previous.model?.terminate();
    }
    scope.dispatchEvent?.(new scope.Event('edmund-local-model-removed'));
  }
  if (channel) channel.onmessage = event => { if (event.data === 'release') release(); };
  function load() {
    if (deleting) return Promise.reject(new Error('Recognition data is being deleted.'));
    if (current) return current.promise;
    const entry = {};
    entry.promise = new Promise((resolve, reject) => { entry.resolve = resolve; entry.reject = reject; });
    current = entry;
    const fail = error => {
      if (current !== entry) return;
      scope.clearTimeout(entry.timer);
      entry.model?.worker?.terminate();
      current = null;
      entry.reject(error);
    };
    entry.timer = scope.setTimeout(() => fail(new Error('English model loading timed out.')), 180000);
    void (async () => {
      if (!scope.Vosk) {
        if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
          const script = scope.document.createElement('script');
          script.src = scriptURL;
          script.onload = resolve;
          script.onerror = () => reject(new Error('Could not load the offline recognizer.'));
          scope.document.head.append(script);
        }).catch(error => { scriptPromise = null; throw error; });
        await scriptPromise;
      }
      if (current !== entry) return;
      entry.model = new scope.Vosk.Model(modelURL, -1);
      entry.model.on('load', message => {
        if (current !== entry) return;
        if (!message.result) { fail(new Error('Could not load the English model.')); return; }
        scope.clearTimeout(entry.timer);
        entry.resolve(entry.model);
      });
      entry.model.on('error', () => fail(new Error('Could not load the English model.')));
    })().catch(fail);
    return entry.promise;
  }
  function removeDatabase() {
    if (!scope.indexedDB) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const request = scope.indexedDB.deleteDatabase('/vosk');
      // A different, older tab may still own an IDB connection. Never claim
      // deletion succeeded until the browser confirms it actually completed.
      const timer = scope.setTimeout(() => reject(new Error('Close other speech recognition tabs and retry.')), 10000);
      request.onsuccess = () => { scope.clearTimeout(timer); resolve(); };
      request.onerror = () => { scope.clearTimeout(timer); reject(request.error || new Error('Could not delete recognition data.')); };
    });
  }
  async function removeCachedDownloads() {
    if (!scope.caches) return;
    const targets = [modelURL, scriptURL].map(value => { const url = new URL(value); return url.origin + url.pathname; });
    for (const name of await scope.caches.keys()) {
      const cache = await scope.caches.open(name);
      for (const request of await cache.keys()) {
        const url = new URL(request.url);
        if (targets.includes(url.origin + url.pathname)) await cache.delete(request);
      }
    }
  }
  function remove() {
    if (deleting) return deleting;
    release();
    channel?.postMessage('release');
    deleting = (async () => { await removeDatabase(); await removeCachedDownloads(); })()
      .finally(() => { deleting = null; });
    return deleting;
  }
  return { load, remove };
}
let englishModelStore;
const store = () => englishModelStore ||= createEnglishModelStore();
export const loadEnglishModel = () => store().load();
export const deleteEnglishModel = () => store().remove();

export class LocalEnglishTranscriber {
 async start(stream){this.model=await loadEnglishModel();this.stream=stream;this.context=new AudioContext();await this.context.resume();this.source=this.context.createMediaStreamSource(stream);this.processor=this.context.createScriptProcessor(4096,1,1);this.processor.onaudioprocess=e=>{if(this.recognizer&&!this.paused)this.recognizer.acceptWaveform(e.inputBuffer);};const silent=this.context.createGain();silent.gain.value=0;this.source.connect(this.processor);this.processor.connect(silent);silent.connect(this.context.destination);}
 async finishTarget(){const r=this.recognizer;this.recognizer=null;if(!r)return;await new Promise(resolve=>{let settled=false;const done=()=>{if(settled)return;settled=true;clearTimeout(timer);r.remove();resolve();};r.on('result',done);const timer=setTimeout(done,1500);r.retrieveFinalResult();});}
 target(onText){this.finishTarget();const r=new this.model.KaldiRecognizer(this.context.sampleRate);r.setWords(true);r.on('result',m=>{if(m.result?.text)onText(m.result.text,false);});r.on('partialresult',m=>onText(m.result?.partial||'',true));this.recognizer=r;return r;}
 async stop(){await this.finishTarget();this.processor?.disconnect();this.source?.disconnect();await this.context?.close();}
}
