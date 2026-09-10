import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const app=await readFile(new URL('../professional-english/app.js',import.meta.url),'utf8');
const enhancements=await readFile(new URL('../professional-english/professional-enhancements.js',import.meta.url),'utf8');
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props});
const context={f:{jsx,jsxs:jsx,Fragment:'fragment'},EdmundTeamColors:['#c9f47d','#73c9ff']};
vm.createContext(context);
vm.runInContext(app.slice(app.indexOf('function EdmundBilingualLabel('),app.indexOf('function EdmundTeamEffortPanel(')),context);
// Sample each cubic to ensure that smooth curves never invent values outside adjacent points.
for(const values of [[0,0,0,0,0,0,25],[25,0,0,0,0,0,25],[0,10,5,20,0,0],[0,0],[25,25]]){
 const points=values.map((value,index)=>[index*100,300-value*8]);
 const numbers=context.EdmundTeamPath(points).match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
 for(let i=1;i<points.length;i++){
  const offset=2+(i-1)*6,lo=Math.min(points[i-1][1],points[i][1]),hi=Math.max(points[i-1][1],points[i][1]);
  const ys=[points[i-1][1],numbers[offset+1],numbers[offset+3],numbers[offset+5]];
  for(let step=0;step<=100;step++){
   const t=step/100,y=(1-t)**3*ys[0]+3*(1-t)**2*t*ys[1]+3*(1-t)*t*t*ys[2]+t**3*ys[3];
   assert.ok(y>=lo-.011&&y<=hi+.011,'curve must not invent values between samples');
  }
 }
}
assert.equal(context.EdmundActivityPath([[0,300,0],[100,300,0]]),'','all-zero dates must not create a coloured line');
assert.match(context.EdmundActivityPath([[0,300,0],[100,100,25]]),/^M 100 100$/,'a single positive day is one point without a false ramp');
const gap=context.EdmundActivityPath([[0,100,25],[100,300,0],[200,100,25],[300,90,26]]);
assert.equal((gap.match(/M /g)||[]).length,2,'zero-activity dates break coloured lines');
const flatten=node=>[...(node?.type?[node]:[]),...(Array.isArray(node)?node:node?.props?.children?[node.props.children]:[]).flatMap(flatten)];
const translate=text=>({First:'First · 第一組',cards:'cards · 張字卡',Completed:'Completed · 已完成'}[text]||text);
for(const [start,end,completed] of [[1,30,true],[31,45,false],[11,20,true]]){
 const range=flatten(context.EdmundRangeContents({label:translate('First'),start,end,completed,translate}));
 assert.equal(range.find(n=>n.props.className==='pro-range-numbers').props.children,`${start}–${end}`);
 assert.equal(range.find(n=>n.props.className==='pro-range-count').props.children,`${end-start+1} cards · 張字卡`);
 assert.equal(range.filter(n=>n.props.className==='range-status').length,Number(completed));
 const title=range.find(n=>n.props.className==='pro-bilingual-label');
 assert.equal(title.props.children[0].props.children,'第一組');
 assert.equal(title.props.children[1].props.children,'First');
}
vm.runInContext(app.slice(app.indexOf('function YC('),app.indexOf('function PC(',app.indexOf('function YC('))),context);
const zeroChart=flatten(context.YC({points:[{cards:0,known:0,review:0,durationMs:0,label:'1'},{cards:0,known:0,review:0,durationMs:0,label:'2'}],type:'cards',label:'Practice'}));
assert.equal(zeroChart.filter(node=>node.type==='path'||node.type==='circle').length,0,'zero activity is shown by the neutral axes only');
const mixedChart=flatten(context.YC({points:[{cards:3,known:3,review:0,durationMs:0,label:'1'}],type:'cards',label:'Practice'}));
assert.equal(mixedChart.filter(node=>node.type==='circle').length,2,'the zero-review series has no marker');
assert.match(app,/Known now/);assert.match(app,/Marked for review during practice/);
const today=new Date().toLocaleDateString('en-CA');
const chart=flatten(context.EdmundTeamChart({course:{members:[{account_id:'qa',username:'QA'}],daily:[{account_id:'qa',date:today,cards:39}]}}));
assert.equal(chart.find(n=>n.props.className==='team-chart-count').props.children,'39 cards · 張字卡');
assert.equal(chart.filter(n=>n.type==='circle').length,2,'one day must have both member and total markers');
for(const circle of chart.filter(n=>n.type==='circle'))assert.ok(Number.isFinite(circle.props.cx)&&Number.isFinite(circle.props.cy));

const dom=new JSDOM('<header class="app-header"><div class="header-actions"></div></header>',{url:'https://example.test/professional-english/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;let starts=0,contextCount=0,resumeAudio;
w.AudioContext=class{
 constructor(){contextCount++;this.state='suspended';this.currentTime=10;this.destination={};this.resumePromise=new Promise(resolve=>{resumeAudio=()=>{this.state='running';resolve();};});}
 resume(){return this.resumePromise;}
 createOscillator(){return{frequency:{},connect(){return{connect(){}}},start(){assert.equal(w.testContextState,'resumed');starts++},stop(){},disconnect(){}};}
 createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},disconnect(){}};}
};
const observers=[];const NativeObserver=w.MutationObserver;
w.MutationObserver=class extends NativeObserver {constructor(callback){super(callback);observers.push(this);}};
w.eval(enhancements);
const button=w.document.querySelector('[data-professional-sound-toggle]');
assert.doesNotMatch(button.textContent,/[🔔🔕]/u);
const flush=()=>new Promise(resolve=>setTimeout(resolve,10));
const mark=value=>w.document.dispatchEvent(new w.CustomEvent('professional-card-marked',{detail:{mark:value}}));
mark('red');await flush();assert.equal(starts,0);
mark('green');await flush();assert.equal(starts,0,'wait for suspended audio to resume');
w.testContextState='resumed';resumeAudio();await flush();assert.equal(starts,3);
mark('green');await flush();assert.equal(starts,6);assert.equal(contextCount,1,'reuse the unlocked audio context');
button.click();assert.equal(button.getAttribute('aria-pressed'),'false');assert.equal(w.localStorage.getItem('edmund-professional-sound-effects-v1'),'off');
mark('green');await flush();assert.equal(starts,6,'muted green marks stay silent');
button.click();await flush();assert.equal(starts,9,'enabling sound plays a preview');
// Exercise the actual accepted-mark function: blocked and unflipped cards must remain silent.
w.R={flipped:false};w.Q={id:'qa'};w.Ut={current:false};w.i=()=>{};w.SL=()=>({marks:{},study:{}});w.M={marks:{}};w.ml=()=>{};
w.eval(app.slice(app.indexOf('function at(S)'),app.indexOf('function ni(S)')));
w.at('green');await flush();assert.equal(starts,9);
w.R.flipped=true;w.at('green');await flush();assert.equal(starts,12);
w.Ut.current=true;w.at('green');await flush();assert.equal(starts,12);
observers.forEach(observer=>observer.disconnect());
await new Promise(resolve=>setTimeout(resolve,30));
w.close();
console.log('Professional feedback: no negative curve overshoot, visible single-day counts, separated bilingual ranges, accepted marks, audio resume and mute passed.');
