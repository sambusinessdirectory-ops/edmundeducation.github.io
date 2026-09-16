import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {swipeMark,attachCardSwipe} from '../professional-english/flashcard-swipe.mjs';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
assert.equal(swipeMark(80,5,390,400),'green');assert.equal(swipeMark(-80,5,390,400),'red');
assert.equal(swipeMark(32,3,390,40),'green','short deliberate flick');
assert.equal(swipeMark(32,3,390,600),null,'slow short drag');
assert.equal(swipeMark(80,90,390,40),null,'vertical scroll');
assert.equal(swipeMark(8,1,390,1),null,'tiny tap movement');
const dom=new JSDOM('<div id="card"><span>Answer</span></div>',{pretendToBeVisual:true});
const w=dom.window,node=w.document.getElementById('card');let animations=[],marks=[];
w.matchMedia=()=>({matches:false});node.getBoundingClientRect=()=>({width:360});
let capture=null;node.setPointerCapture=id=>{capture=id};node.hasPointerCapture=id=>capture===id;node.releasePointerCapture=()=>{capture=null};
node.animate=(frames,options)=>{let resolve;const finished=new Promise(r=>{resolve=r});const animation={frames,options,finished,resolve,cancel(){}};animations.push(animation);return animation;};
node.addEventListener('click',()=>marks.push('tap'));
let destroy=attachCardSwipe(node,mark=>marks.push(mark));
function pointer(type,x,y,time=0,id=1){const e=new w.Event(type,{bubbles:true,cancelable:true});for(const [key,value]of Object.entries({clientX:x,clientY:y,timeStamp:time,pointerId:id,button:0,isPrimary:true}))Object.defineProperty(e,key,{value});node.dispatchEvent(e);return e;}
const tick=()=>Promise.resolve().then(()=>Promise.resolve());
for(const dx of [90,-90]){
 pointer('pointerdown',180,100,0);pointer('pointermove',180+dx,102,200);
 const transfer=new w.Event('lostpointercapture',{bubbles:true});Object.defineProperty(transfer,'pointerId',{value:1});node.querySelector('span').dispatchEvent(transfer);
 assert.ok(node.classList.contains('is-dragging'),'implicit child capture can transfer to the card');assert.ok(node.style.transform.includes(`${dx}px`));
 pointer('pointerup',180+dx,102,220);const before=marks.length;node.click();assert.equal(marks.length,before,'synthetic click cannot double-mark');
 const a=animations.at(-1);assert.equal(a.options.duration,180);assert.equal(marks.length,before,'commit waits for departure animation');a.resolve();await tick();assert.equal(marks.at(-1),dx>0?'green':'red');
}
const count=marks.length;
pointer('pointerdown',100,100,0);pointer('pointermove',118,102,400);pointer('pointerup',118,102,500);node.click();assert.equal(marks.length,count);assert.equal(node.style.transform,'');
pointer('pointerdown',100,100);pointer('pointermove',103,140,200);pointer('pointermove',190,140,300);pointer('pointerup',190,140,400);node.click();assert.equal(marks.length,count,'vertical lock cannot become a mark');
pointer('pointerdown',100,100);pointer('pointermove',180,101,100);pointer('pointercancel',180,101,120);pointer('pointerup',180,101,140);node.click();assert.equal(marks.length,count);assert.equal(node.style.transform,'');
pointer('pointerdown',100,100);pointer('pointermove',190,101,100);pointer('pointerup',190,101,120);const pending=animations.at(-1);destroy();pending.resolve();await tick();assert.equal(marks.length,count,'navigation cancels pending mark');
w.matchMedia=()=>({matches:true});destroy=attachCardSwipe(node,mark=>marks.push(mark));
pointer('pointerdown',100,100);pointer('pointermove',190,101,100);pointer('pointerup',190,101,120);assert.equal(marks.length,count+1,'reduced motion commits without animation');assert.equal(animations.length,3);
destroy();destroy=attachCardSwipe(node,mark=>marks.push(mark));
function touch(type,x,y,time,id=11){const e=new w.Event(type,{bubbles:true,cancelable:true});const point={identifier:id,clientX:x,clientY:y};Object.defineProperties(e,{touches:{value:type==='touchend'||type==='touchcancel'?[]:[point]},changedTouches:{value:[point]},timeStamp:{value:time}});node.dispatchEvent(e);return e;}
const touchStartCount=marks.length;
touch('touchstart',180,100,0);touch('touchmove',184,108,20);touch('touchmove',115,113,170);touch('touchend',115,113,200);assert.equal(marks.at(-1),'red','small initial vertical drift does not cancel a deliberate horizontal touch swipe');
touch('touchstart',180,100,0);touch('touchmove',245,104,170);touch('touchend',245,104,200);assert.equal(marks.at(-1),'green');assert.equal(marks.length,touchStartCount+2);
touch('touchstart',180,100,0);touch('touchmove',184,150,170);touch('touchend',184,150,200);assert.equal(marks.length,touchStartCount+2,'touch scrolling cannot grade');
destroy();w.close();console.log('Mobile flashcards: left/right drag and flick thresholds, vertical lock, cancel, short-drag snapback, delayed single commit, synthetic-click suppression, navigation cleanup and reduced motion passed.');
