import assert from 'node:assert/strict';
import fs from 'node:fs';
import {replay} from '../polysemy-lab/core.mjs';
const app=fs.readFileSync('polysemy-lab/app.mjs','utf8');
const css=fs.readFileSync('polysemy-lab/style.css','utf8');
const recorder=fs.readFileSync('polysemy-lab/recording.mjs','utf8');
assert.match(app,/Math.min\(5,Math.floor\(state.streak\/5\)\)/);
const events=[{id:'start',kind:'start',run:'art-test',at:new Date().toISOString()}];
for(let i=0;i<=25;i++){
 const state=replay(events);
 assert.equal(state.streak,i);
 assert.equal(Math.min(5,Math.floor(state.streak/5)),Math.floor(i/5));
 if(i<25)events.push({id:'answer-'+i,kind:'answer',run:'art-test',round:state.round,question:state.question.id,choice:state.question.sense,at:new Date(Date.now()+i+1).toISOString()});
}
assert.match(css,/background-size:600% 200%/);
assert.match(css,/background-position:var\(--eddy-stage-x\) 100%/);
assert.match(recorder,/data-close-recorder/);
assert.match(recorder,/host.classList.add\('has-recording'\)/);
assert.match(recorder,/if\(!alive\)return;host.querySelector/);
for(const name of ['eddy-streak-six-stages-v5.webp']){
 const data=fs.readFileSync('assets/polysemy-lab/'+name);
 assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.ok(data.length>1000);
 assert.ok(css.includes(name)||recorder.includes(name));
}
console.log('PASS: six streak thresholds, matching blink frames, recording artwork, close control and valid WebP assets');

assert.match(recorder,/eddy-recording-audio-exact-v6\.png/);
assert.deepEqual([...fs.readFileSync('assets/polysemy-lab/eddy-recording-audio-exact-v6.png').subarray(0,8)],[137,80,78,71,13,10,26,10]);

assert.match(recorder,/eddy-recording-microphone-exact-v7\.png/);
assert.match(css,/recorder-star-twinkle/);
assert.match(recorder,/mascot.src='\/assets\/polysemy-lab\/eddy-recording-audio-exact-v6\.png'/);

assert.match(css,/animation:eddy-frame-blink/);
assert.match(css,/::after\{display:none;animation:none\}/);

assert.match(css,/animation:eddy-eyes-only-blink/);
assert.match(css,/-webkit-mask-image:var\(--eddy-eye-mask\)/);
assert.match(css,/--eddy-closed-y:93\.333%/);
