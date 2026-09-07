let modelPromise;
export function loadEnglishModel(){
 if(!modelPromise)modelPromise=(async()=>{
  if(!window.Vosk)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL('./vendor/vosk/vosk-0.0.8.js',import.meta.url);s.onload=resolve;s.onerror=()=>reject(new Error('Could not load the offline recognizer.'));document.head.append(s);});
  return window.Vosk.createModel(new URL('./assets/speaking-system/models/english-us-0.15.tar.gz',import.meta.url).href,-1);
 })().catch(error=>{modelPromise=null;throw error;});return modelPromise;
}
export class LocalEnglishTranscriber {
 async start(stream){this.model=await loadEnglishModel();this.stream=stream;this.context=new AudioContext();await this.context.resume();this.source=this.context.createMediaStreamSource(stream);this.processor=this.context.createScriptProcessor(4096,1,1);this.processor.onaudioprocess=e=>{if(this.recognizer&&!this.paused)this.recognizer.acceptWaveform(e.inputBuffer);};const silent=this.context.createGain();silent.gain.value=0;this.source.connect(this.processor);this.processor.connect(silent);silent.connect(this.context.destination);}
 async finishTarget(){const r=this.recognizer;this.recognizer=null;if(!r)return;await new Promise(resolve=>{let settled=false;const done=()=>{if(settled)return;settled=true;clearTimeout(timer);r.remove();resolve();};r.on('result',done);const timer=setTimeout(done,1500);r.retrieveFinalResult();});}
 target(onText){this.finishTarget();const r=new this.model.KaldiRecognizer(this.context.sampleRate);r.setWords(true);r.on('result',m=>{if(m.result?.text)onText(m.result.text,false);});r.on('partialresult',m=>onText(m.result?.partial||'',true));this.recognizer=r;return r;}
 async stop(){await this.finishTarget();this.processor?.disconnect();this.source?.disconnect();await this.context?.close();}
}
