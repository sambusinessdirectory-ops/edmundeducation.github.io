import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const source = readFileSync(new URL('../pronunciation-checker.js', import.meta.url), 'utf8');
const uiSource = readFileSync(new URL('../flashcard-pronunciation.js', import.meta.url), 'utf8');
function harness({ unsupported = false, startError, ui = false } = {}) {
  let now = 0, serial = 0, observer;
  const timers = new Map(), instances = [], states = [], listeners = {};
  const advance = async milliseconds => {
    const end = now + milliseconds;
    for (;;) {
      const next = [...timers].filter(([, t]) => t.at <= end).sort((a,b) => a[1].at-b[1].at)[0];
      if (!next) break;
      timers.delete(next[0]); now = next[1].at; next[1].callback(); await Promise.resolve();
    }
    now = end; await Promise.resolve();
  };
  class Recognition {
    constructor() { this.stops = 0; this.aborts = 0; instances.push(this); }
    start() { this.started = true; if (startError) throw startError; }
    stop() { this.stops++; }
    abort() { this.aborts++; }
    emit(name, event = {}) { this[`on${name}`]?.(event); }
    result(text, isFinal = true) {
      this.emit('result', { results: [Object.assign([{ transcript: text }], { isFinal })], resultIndex: 0 });
    }
  }
  class Element {
    constructor() {
      this.children=[]; this.dataset={}; this.attributes={}; this.events={}; this.isConnected=true; this.disabled=false; this.textContent=''; this.className='';
      this.classList = {
        add: t => this.classList.toggle(t,true), remove: t => this.classList.toggle(t,false),
        contains: t => this.className.split(/\s+/).includes(t),
        toggle: (t, force) => { const all=new Set(this.className.split(/\s+/).filter(Boolean)); if (force ?? !all.has(t)) all.add(t); else all.delete(t); this.className=[...all].join(' '); }
      };
    }
    setAttribute(k,v) { this.attributes[k]=v; }
    addEventListener(k,v) { this.events[k]=v; }
    append(c) { this.children.push(c); }
    replaceChildren(...c) { this.children=c; }
    insertAdjacentElement(_,c) { elements.mic=c; }
  }
  const elements={ term:new Element(), speaker:new Element() }; elements.term.textContent='participants';
  const document={ body:new Element(), head:new Element(), hidden:false, createElement:()=>new Element(),
    querySelector:s => s==='[data-front-term]' ? elements.term : s==='[data-speak-card]' ? elements.speaker : s==='[data-check-pronunciation]' ? elements.mic : s==='[data-pronunciation-toast]' ? document.body.children[0] : null,
    addEventListener:(k,v)=>{listeners[k]=v;}
  };
  const window={ webkitSpeechRecognition:unsupported ? undefined : Recognition, dispatchEvent:e=>listeners[e.type]?.(), addEventListener:(k,v)=>{listeners[k]=v;} };
  const context=vm.createContext({ window, document,
    navigator:{mediaDevices:{getUserMedia(){throw Error('Must not open a second microphone');}}},
    performance:{now:()=>now}, setTimeout:(callback,delay)=>{timers.set(++serial,{at:now+delay,callback}); return serial;}, clearTimeout:id=>timers.delete(id),
    Event:class{constructor(type){this.type=type;}}, MutationObserver:class{constructor(callback){observer=callback;} observe(){}}
  });
  vm.runInContext(source,context); if(ui) vm.runInContext(uiSource,context);
  return { window, instances, states, advance, timers, elements, document, listeners,
    begin:options=>window.EdmundPronunciation.recognizeAndCompare({expectedText:'participants',onState:s=>states.push(s),...options}),
    observe:()=>observer?.(), click:()=>elements.mic.events.click({stopPropagation(){}}), toast:()=>document.body.children[0] };
}
for(const [spoken,passed] of [['participants',true],['PARTICIPANTS!',true],['banana',false]]) test(`grades final ${spoken} as ${passed}`,async()=>{
  const h=harness(), p=h.begin(), r=h.instances[0]; assert.ok(r.started); assert.equal(r.continuous,true);
  r.emit('start'); r.result(spoken); r.emit('end'); const result=await p;
  assert.equal(result.passed,passed); assert.equal(result.scored,true); assert.equal(result.transcript,spoken); assert.equal(h.timers.size,0);
});
test('retains final transcript two seconds after manual stop',async()=>{
  const h=harness(),p=h.begin(),r=h.instances[0]; r.emit('start'); h.window.EdmundPronunciation.stop();
  await h.advance(2000); r.result('participants'); r.emit('end'); assert.equal((await p).passed,true);
});
test('waits for final correction instead of grading interim misrecognition',async()=>{
  const h=harness(); let settled=false; const p=h.begin().then(r=>{settled=true;return r;}),r=h.instances[0];
  r.emit('start'); r.result('party',false); await h.advance(2500); assert.equal(settled,false); assert.equal(r.stops,0);
  r.result('participants'); r.emit('end'); assert.equal((await p).passed,true);
});
test('interim-only result is unscored',async()=>{
  const h=harness(),p=h.begin(),r=h.instances[0]; r.emit('start');r.result('participants',false);r.emit('end');
  const result=await p;assert.equal(result.scored,false);assert.equal(result.reason,'unrecognized');
});
test('permission delay does not consume the eight-second speaking window',async()=>{
  const h=harness(),p=h.begin({maxSeconds:3}),r=h.instances[0];await h.advance(12000);assert.equal(r.stops,0);
  r.emit('start');await h.advance(7999);assert.equal(r.stops,0);r.result('participants');r.emit('end');assert.equal((await p).passed,true);
});
test('early empty Safari startup retries once and succeeds',async()=>{
  const h=harness(),p=h.begin(),first=h.instances[0];first.emit('start');await h.advance(100);first.emit('end');await h.advance(300);
  assert.equal(h.instances.length,2);assert.equal(first.onstart,null);const r=h.instances[1];r.emit('start');r.result('participants');r.emit('end');assert.equal((await p).passed,true);
});
test('repeated empty startup is bounded and unscored',async()=>{
  const h=harness(),p=h.begin();h.instances[0].emit('end');await h.advance(300);h.instances[1].emit('end');
  const result=await p;assert.equal(result.reason,'recognition-unavailable');assert.equal(result.scored,false);await h.advance(30000);assert.equal(h.instances.length,2);
});
for(const [error,reason] of Object.entries({'no-speech':'no-speech','not-allowed':'permission-denied','service-not-allowed':'service-not-allowed',network:'network','audio-capture':'audio-capture','language-not-supported':'language-not-supported',aborted:'recognition-interrupted'})) test(`${error} is unscored and preserves its cause`,async()=>{
  const h=harness(),p=h.begin();h.instances[0].emit('error',{error});const result=await p;
  assert.equal(result.reason,reason);assert.equal(result.scored,false);assert.equal(result.passed,false);assert.equal(h.timers.size,0);assert.equal(h.instances.length,1);
});
test('silence and punctuation-only results never pass',async()=>{
  const h=harness(),p=h.begin(),r=h.instances[0];r.emit('start');r.result('...');await h.advance(4000);r.emit('end');const result=await p;
  assert.equal(result.scored,false);assert.equal(result.passed,false);
});
test('unsupported API and thrown permission errors are handled',async()=>{
  const h=harness({unsupported:true});assert.equal((await h.begin()).reason,'recognition-unavailable');
  const denied=harness({startError:{name:'NotAllowedError'}});assert.equal((await denied.begin()).reason,'permission-denied');assert.equal(denied.timers.size,0);
});
test('no startup events or missing final events time out',async()=>{
  const h=harness(),p=h.begin();await h.advance(15000);assert.equal((await p).reason,'recognition-timeout');
  const second=h.begin();h.instances[1].emit('start');await h.advance(15000);assert.equal((await second).reason,'recognition-timeout');assert.equal(h.timers.size,0);
});
test('keeps final result when Safari omits end',async()=>{
  const h=harness(),p=h.begin(),r=h.instances[0];r.emit('start');r.result('participants');await h.advance(6600);assert.equal((await p).passed,true);
});
test('cancellation and repeated attempts ignore stale events',async()=>{
  const h=harness(),first=h.begin(),stale=h.instances[0].onresult,second=h.begin();assert.equal((await first).reason,'cancelled');
  stale({results:[Object.assign([{transcript:'wrong'}],{isFinal:true})]});const r=h.instances[1];r.emit('start');r.result('participants');r.emit('end');assert.equal((await second).passed,true);
  const third=h.begin();h.window.EdmundPronunciation.cancel();assert.equal((await third).reason,'cancelled');assert.equal(h.timers.size,0);
});
test('UI shows startup, listening and processing without depending on model audio',async()=>{
  const h=harness({ui:true});let paused=false;h.listeners['edmund-pronunciation-start']=()=>{paused=true;};h.click();
  assert.equal(paused,true);assert.equal(h.elements.speaker.disabled,true);assert.match(h.toast().children[0].textContent,/Starting microphone/);
  const r=h.instances[0];r.emit('start');assert.match(h.toast().children[0].textContent,/Speak now/);h.click();assert.match(h.toast().children[0].textContent,/Checking/);
  await h.advance(2000);r.result('participants');r.emit('end');await h.advance(0);assert.match(h.toast().children[0].textContent,/Phrase recognised/);
  assert.match(h.toast().children[1].textContent,/participants/);assert.equal(h.elements.speaker.disabled,false);assert.equal(h.elements.mic.attributes['aria-pressed'],'false');
});
test('UI uses neutral technical errors and retry for actual wrong words',async()=>{
  const h=harness({ui:true});h.click();h.instances[0].emit('error',{error:'network'});await h.advance(0);
  assert.ok(h.toast().classList.contains('is-info'));assert.match(h.toast().children[0].textContent,/connection failed/);
  h.click();const r=h.instances[1];r.emit('start');r.result('banana');r.emit('end');await h.advance(0);assert.ok(h.toast().classList.contains('is-retry'));assert.match(h.toast().children[1].textContent,/banana/);
});
test('transcript text cannot inject HTML',async()=>{
  const h=harness({ui:true});h.click();const r=h.instances[0];r.emit('start');r.result('<img src=x onerror=alert(1)>');r.emit('end');await h.advance(0);
  assert.match(h.toast().children[1].textContent,/<img/);assert.equal(h.toast().children[1].children.length,0);
});
test('changing cards cancels and suppresses obsolete results',async()=>{
  const h=harness({ui:true});h.click();const old=h.instances[0];h.elements.term.textContent='swimmers';h.observe();await h.advance(0);
  assert.ok(old.aborts);assert.equal(h.toast().classList.contains('is-visible'),false);h.click();const r=h.instances[1];r.emit('start');r.result('swimmers');r.emit('end');await h.advance(0);assert.match(h.toast().children[1].textContent,/swimmers/);
});
test('leaving the page cancels capture',async()=>{
  const h=harness({ui:true});h.click();h.listeners.pagehide();await h.advance(0);assert.ok(h.instances[0].aborts);assert.equal(h.elements.speaker.disabled,false);
});
test('HTML loads the new version and stops detached model playback',()=>{
  const html=readFileSync(new URL('../flashcards.html',import.meta.url),'utf8');
  assert.match(html,/pronunciation-checker\.js\?v=20260910-natural4/);assert.match(html,/flashcard-pronunciation\.js\?v=20260910-natural4/);
  assert.match(html,/addEventListener\("edmund-pronunciation-start", \(\) => stopNeuralSpeech\(\)\)/);
  assert.match(uiSource,/\.recognizeAndCompare\(/);assert.doesNotMatch(uiSource,/\.recordAndCompare\(/);
});

for (const [expected, actual] of [
  ['after a break of', 'After a break off'],
  ['after a break of', 'After a break'],
  ['after a break of', 'after a brake of'],
  ['after a break of', 'after a breakof'],
  ['after a break of', 'after break'],
  ['I am going to meet you', "I'm gonna meet you"],
  ['I want to see you', 'I wanna see you'],
  ['would you like to', 'would you like too'],
  ['could you give me a minute', 'could you gimme a minute'],
  ['I cannot come', "I can't come"],
  ['a kind of music', 'a kinda music'],
  ['the centre of the city', 'the center of the city'],
  ['after a break of thirty years', 'after a break of 30 years'],
  ['twenty one students', '21 students']
]) test(`natural speech accepts ${JSON.stringify(actual)} for ${JSON.stringify(expected)}`, () => {
  const result = harness().window.EdmundPronunciation.analyseNaturalTextMatch(expected, actual);
  assert.equal(result.passed, true, JSON.stringify(result));
});
for (const [expected, actual] of [
  ['after a break of', 'after a banana'], ['after a break of', 'before a break'],
  ['I can come', "I can't come"], ['I do not like it', 'I do like it'],
  ['after thirty years', 'after thirteen years'], ['after thirty years', 'after 13 years'],
  ['the appointment has been confirmed yet', 'the appointment'],
  ['participants', 'banana'], ['ship', 'sheep'], ['cat', 'cap'], ['of', ''], ['of', 'the'],
  ['students help teachers', 'teachers help students'], ['after a break of', 'banana after a break']
]) test(`natural speech still rejects ${JSON.stringify(actual)} for ${JSON.stringify(expected)}`, () => {
  assert.equal(harness().window.EdmundPronunciation.analyseNaturalTextMatch(expected, actual).passed, false);
});
test('uses real recognizer alternatives without guessing the target as a transcript', async () => {
  const h=harness(),p=h.begin({expectedText:'after a break of'}),r=h.instances[0];
  r.emit('start'); assert.equal(r.maxAlternatives,5);
  r.emit('result',{results:[Object.assign([{transcript:'after a brick'},{transcript:'after a break off'}],{isFinal:true})]});
  r.emit('end'); const result=await p; assert.equal(result.passed,true); assert.equal(result.transcript,'after a break off');
});
test('keeps listening beyond the first final segment and joins the full phrase',async()=>{
  const h=harness(),p=h.begin({expectedText:'after a break of thirty years'}),r=h.instances[0];
  r.emit('start'); r.result('after a break'); await h.advance(1000); assert.equal(r.stops,0);
  r.emit('result',{results:[Object.assign([{transcript:'after a break'}],{isFinal:true}),Object.assign([{transcript:'of thirty years'}],{isFinal:true})]});
  r.emit('end'); const result=await p; assert.equal(result.passed,true); assert.equal(result.transcript,'after a break of thirty years');
});
test('continued interim speech cancels the previous segment endpoint timer',async()=>{
  const h=harness(),p=h.begin({expectedText:'after a break of thirty years'}),r=h.instances[0];
  r.emit('start');r.result('after a break');await h.advance(1000);
  r.emit('result',{results:[Object.assign([{transcript:'after a break'}],{isFinal:true}),Object.assign([{transcript:'of thirty'}],{isFinal:false})]});
  await h.advance(2000);assert.equal(r.stops,0);
  r.result('after a break of thirty years');r.emit('end');assert.equal((await p).passed,true);
});
test('the injected on-device engine works without a browser recognition API',async()=>{
  const h=harness({unsupported:true});let local;
  class Local {constructor(){local=this;}start(){this.onstart?.();}stop(){}abort(){}}
  const p=h.begin({recognitionClass:Local});assert.equal(h.instances.length,0);
  local.onresult({results:[Object.assign([{transcript:'participants'}],{isFinal:true})]});local.onend();assert.equal((await p).passed,true);
});
test('ordinary words cannot resolve inherited properties in normalization tables',()=>{
  const match=harness().window.EdmundPronunciation.analyseNaturalTextMatch;
  assert.equal(match('constructor','constructor').passed,true);
  assert.equal(match('after a break of','constructor').passed,false);
});
