import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('shared-speaking-practice.js','utf8');
const saveFunction=source.slice(source.indexOf('  async function saveRecording('),source.indexOf('  function downloadRecording('));
async function exercise({duration=6000,fail=false}={}){
 const calls=[],events=[],statuses=[];const state={mp3:new Blob(['mock mp3']),card:{dataset:{edmundRecordId:'essay80-10-0',edmundRecordTitle:'Sentence 1',edmundMinRecordingMs:'4000'}},durationMs:duration,saving:false};
 const ctx={state,FormData,CustomEvent:class{constructor(name,options){this.name=name;this.detail=options.detail;}},document:{dispatchEvent:e=>events.push(e)},studentToken:()=> 'owner',stableId:()=> 'learning:essay80:sentence1',apiFetch:async(path,options)=>{calls.push({path,form:options.body});if(fail)throw Error('Upload failed');},recordingQuota:async()=>({usage:{storageBytes:10}}),formatBytes:String,setDockStatus:s=>statuses.push(s),toast:()=>{},console:{warn:()=>{}}};vm.createContext(ctx);vm.runInContext(saveFunction,ctx);await ctx.saveRecording({disabled:false});return{calls,events,statuses};
}
let r=await exercise();assert.equal(r.calls.length,1);assert.equal(r.calls[0].form.get('exerciseTitle'),'Sentence 1');assert.equal(r.events[0].name,'edmund:recording-saved');assert.equal(r.events[0].detail.recordId,'essay80-10-0');
r=await exercise({duration:100});assert.equal(r.calls.length,0);assert.equal(r.events.length,0);
r=await exercise({fail:true});assert.equal(r.events.length,0);
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');const browser=await chromium.launch({headless:true});const page=await browser.newPage();
await page.addInitScript(()=>{window.Audio=class extends EventTarget{constructor(src){super();this.src=src;this.readyState=1;this.paused=true;this.currentTime=0;window.lastAudio=this;}play(){this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}load(){}};});
await page.goto('http://127.0.0.1:8633/essay-memorization.html');await page.locator('[data-stage="8"]').click();await page.locator('[data-play-chunk]').click();
const timing=await page.evaluate(()=>{const words=ESSAY_80_MEMORY_DATA.sentences[0].words;const n=ESSAY_80_LEARNING_SUPPORT.sentences[0].chunks[0].split(/\s+/).length;return{start:words[0][1],end:words[n-1][2],actual:lastAudio.currentTime,whole:ESSAY_80_MEMORY_DATA.sentences[0].end};});assert.equal(timing.actual,timing.start);assert(timing.end<timing.whole);await page.evaluate(end=>{lastAudio.currentTime=end;},timing.end);await page.waitForTimeout(80);assert(await page.evaluate(()=>lastAudio.paused));
await page.locator('#step-select').evaluate(el=>{el.value='1';el.dispatchEvent(new Event('change'));});await page.locator('[data-play-chunk]').click();assert(await page.evaluate(()=>lastAudio.currentTime>ESSAY_80_MEMORY_DATA.sentences[0].words[0][1]));
await browser.close();console.log('PASS: upload success signals completion; failed/short uploads do not; displayed chunk starts/stops at its own word timestamps.');
