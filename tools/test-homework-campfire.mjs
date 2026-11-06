import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';import {JSDOM} from './email-qa/node_modules/jsdom/lib/api.js';
const html=fs.readFileSync('schedule-system.html','utf8'),script=fs.readFileSync('homework-eddy-toggle.js','utf8');
assert.ok(html.includes('data-homework-campfire-toggle'));assert.ok(html.includes('homework-eddy.css?v=20261028-camp1'));
for(const reduced of [false,true])for(const blocked of [false,true]){
 const dom=new JSDOM(html,{url:'https://edmundeducation.com/schedule-system.html',runScripts:'outside-only'});dom.window.matchMedia=()=>({matches:reduced});if(blocked)Object.defineProperty(dom.window,'localStorage',{get(){throw Error('blocked')}});
 vm.runInContext(script,dom.getInternalVMContext());const b=dom.window.document.querySelector('[data-homework-campfire-toggle]'),img=b.querySelector('img');assert.equal(b.getAttribute('aria-pressed'),String(!reduced));assert.equal(img.src.includes('.gif'),!reduced);
 b.click();assert.equal(b.getAttribute('aria-pressed'),String(reduced));b.click();assert.equal(b.getAttribute('aria-pressed'),String(!reduced));
 if(!blocked){const saved=dom.window.localStorage.getItem('edmund-homework-eddy-playing');assert.equal(saved,String(!reduced));}
 dom.window.close();
}
for(const path of ['poster.png','poster-v2.png','eddy-campfire.gif','eddy-campfire-v2.gif',...Array.from({length:5},(_,i)=>`stills/eddy-0${i+1}.png`),...Array.from({length:5},(_,i)=>`stills/eddy-0${i+1}-v2.png`)])assert.ok(fs.statSync('homework-eddy/'+path).size>1000);
assert.ok(script.includes('eddy-campfire-v2.gif'), 'the live toggle must use the versioned animation that remains on Pages');
assert.ok(script.includes('-v2.png'), 'paused frames must use versioned images that remain on Pages');
assert.ok(html.includes('homework-eddy/poster-v2.png'), 'the initial poster must use the versioned Pages path');
console.log('PASS: mascot assets, pause/resume, persisted preference, reduced motion and unavailable storage.');
