import assert from 'node:assert/strict';
import {BLINK_FRAME_SECONDS,COAT_COLOURS,viewPair,seatedForPhase,mouthOpening,blinkAmount,listenerNod,updateAttention,wrapAngle,screenFacingAngle} from '../speaking-mascot-behaviour.mjs';

assert.deepEqual(COAT_COLOURS,{eddy:'#A35627',elsie:'#C56523',phoebe:'#A76742'});
for (const [dx,dy,expected] of [[0,1,0],[1,1,45],[1,0,90],[1,-1,135],[0,-1,180],[-1,-1,225],[-1,0,270],[-1,1,315]]) assert.ok(Math.abs(screenFacingAngle(dx,dy)-expected)<1e-9,'screen direction must match the sprite atlas');
assert.equal(screenFacingAngle(0,0),0);
for(const phase of ['preparation','group','individual-wait','individual'])assert.equal(seatedForPhase(phase),true);
for(const phase of [undefined,'lobby','results'])assert.equal(seatedForPhase(phase),false);
const angles=[0,20,45,67,90,115,140,160,180,205,230,250,270,300,320,345];
for(let angle=-720;angle<=720;angle+=.25){const pair=viewPair(angle*Math.PI/180,angles);assert.ok(pair.blend>=0&&pair.blend<=1);const end=pair.second===0?360:angles[pair.second];const reconstructed=(angles[pair.first]+(end-angles[pair.first])*pair.blend)%360;assert.ok(Math.abs(wrapAngle((reconstructed-angle)*Math.PI/180))<1e-9,'intermediate views must move continuously through wrap-around');}
const speech=Array.from({length:500},(_,i)=>mouthOpening(i/100,true));assert.ok(Math.max(...speech)>.85);assert.ok(speech.some(value=>value===0),'speech has closed-mouth pauses');
for(let i=0;i<100;i++){assert.equal(mouthOpening(i/17,false),0);assert.equal(mouthOpening(i/17,true,true),0);assert.equal(blinkAmount(i/17,2,true),0);}
for(const seed of [1,5,9]){const samples=Array.from({length:3000},(_,i)=>blinkAmount(i/100,seed));assert.ok(Math.max(...samples)>.95,'each character fully closes its eyes');assert.ok(samples.filter(value=>value>.5).length<140,'blinks stay brief');}
assert.notDeepEqual(Array.from({length:500},(_,i)=>blinkAmount(i/50,1)),Array.from({length:500},(_,i)=>blinkAmount(i/50,5)),'characters do not blink in lockstep');
const sampleStep=1/240;for(let seed=0;seed<64;seed++){let run=0,maxRun=0;for(let time=0;time<60;time+=sampleStep){run=blinkAmount(time,seed)>.5?run+sampleStep:0;maxRun=Math.max(maxRun,run);}assert.ok(maxRun<=BLINK_FRAME_SECONDS+sampleStep+1e-9,"seed "+seed+": a closed-eye frame cannot exceed the 0.12-second cap");assert.ok(maxRun<1,"seed "+seed+": no blink may approach one second");}
const a={id:'A',x:-1,z:-2,facingYaw:.2,lookYaw:0},b={id:'B',x:1,z:-2,facingYaw:-.2,lookYaw:0};for(let i=0;i<60;i++){updateAttention(a,b,1/60);updateAttention(b,a,1/60);}assert.ok(a.lookYaw>.9&&a.lookYaw<1.35,'A looks right toward B');assert.ok(b.lookYaw<-.9&&b.lookYaw> -1.35,'B looks left toward A');const was=a.lookYaw;updateAttention(a,a,1/60);assert.ok(a.lookYaw<was,'speaker returns toward their normal facing');for(let i=0;i<200;i++)updateAttention(a,null,1/60);assert.ok(Math.abs(a.lookYaw)<.0001,'clearing the active speaker releases attention');
let peaks=0,previous=0,different=false;for(let t=0;t<20;t+=.02){const nod=listenerNod(t,0,true);assert.ok(nod>=0&&nod<=.043);if(previous===0&&nod>0)peaks++;previous=nod;if(nod!==listenerNod(t,1,true))different=true;assert.equal(listenerNod(t,0,false),0);assert.equal(listenerNod(t,0,true,true),0);}assert.ok(peaks>=3&&peaks<=5,'listeners nod every few seconds');assert.ok(different,'listeners do not nod in lockstep');
console.log('Mascot behaviour: palettes, seated phases, angle wrap, speech cycles, staggered natural blinks, target tracking, nods and reduced motion passed.');
