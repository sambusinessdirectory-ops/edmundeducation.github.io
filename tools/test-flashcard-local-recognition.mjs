import assert from 'node:assert/strict';
import test from 'node:test';
import { localRecognitionClass } from '../flashcard-local-recognition.mjs';

function setup({ delayed = false, denied = false } = {}) {
  const events=[],timers=new Map();let recognizer,resolveMedia,trackStops=0,closes=0;
  const node=()=>({connect(){},disconnect(){},gain:{value:1}});
  class Context {
    sampleRate=16000;destination={};
    resume(){return Promise.resolve();} close(){closes++;return Promise.resolve();}
    createMediaStreamSource(){return node();} createScriptProcessor(){return node();}createGain(){return node();}
  }
  const stream={getTracks:()=>[{stop(){trackStops++;}}]};
  const media=denied ? Promise.reject({name:'NotAllowedError'}) : delayed ? new Promise(r=>resolveMedia=r) : Promise.resolve(stream);
  const scope={AudioContext:Context,navigator:{mediaDevices:{getUserMedia:()=>media}},setTimeout:(f,ms)=>{timers.set(1,{f,ms});return 1;},clearTimeout:id=>timers.delete(id)};
  class KaldiRecognizer {
    constructor(...args){assert.deepEqual(args,[16000],'must not constrain grammar to the expected answer');this.listeners={};recognizer=this;}
    on(name,callback){this.listeners[name]=callback;}
    acceptWaveform(input){this.input=input;}
    retrieveFinalResult(){this.flushed=true;}
    remove(){this.removed=true;}
    emit(name,text){this.listeners[name]?.({result:name==='partialresult'?{partial:text}:{text}});}
  }
  const Local=localRecognitionClass({KaldiRecognizer},scope),r=new Local();
  r.onstart=()=>events.push('start');r.onend=()=>events.push('end');r.onerror=e=>events.push(e.error);
  const results=[];r.onresult=e=>results.push(e.results);
  return {r,events,results,timers,get engine(){return recognizer;},resolveMedia:()=>resolveMedia(stream),get trackStops(){return trackStops;},get closes(){return closes;}};
}
const tick=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
test('local capture yields unrestricted interim and final phrases, then flushes and releases input',async()=>{
  const h=setup();h.r.start();await tick();assert.deepEqual(h.events,['start']);
  h.engine.emit('partialresult','after a');assert.equal(h.results.at(-1)[0].isFinal,false);
  h.engine.emit('result','after a break');h.r.stop();assert.equal(h.engine.flushed,true);assert.ok(h.trackStops);
  h.engine.emit('result','of thirty years');assert.equal(h.results.at(-1).map(r=>r[0].transcript).join(' '),'after a break of thirty years');
  h.timers.get(1).f();assert.ok(h.engine.removed);assert.ok(h.closes);assert.equal(h.events.at(-1),'end');
});
test('cancelled permission request releases a late microphone stream',async()=>{
  const h=setup({delayed:true});h.r.start();h.r.abort();h.resolveMedia();await tick();assert.ok(h.trackStops);assert.equal(h.engine,undefined);assert.deepEqual(h.events,[]);
});
test('permission denial is reported without producing a transcript',async()=>{
  const h=setup({denied:true});h.r.start();await tick();assert.deepEqual(h.events,['not-allowed']);assert.equal(h.results.length,0);assert.ok(h.closes);
});
test('cancellation ignores delayed transcription results',async()=>{
  const h=setup();h.r.start();await tick();h.r.abort();h.engine.emit('result','participants');assert.equal(h.results.length,0);assert.ok(h.engine.removed);
});
