import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<section data-professional-records></section>',{url:'https://edmundeducation.com/speaking-system.html'});
const root=dom.window.document.querySelector('section');
const account={token:'test',id:'owner-a'};
const record=(i,phase='results')=>({id:'record-'+i,session:{id:'record-'+i,createdAt:1700000000000+i,topic:{title:i===0?'<script>test</script>':'Discussion '+i},phase,candidates:[{id:'a',name:'Alice'},{id:'b',name:'Bob'}]}});
dom.window.localStorage.setItem('edmund-speaking-professional-v1:other:history',JSON.stringify([record(500).session]));
const calls=[];let fail=true;
const context=vm.createContext({window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,Date,Map,encodeURIComponent,
 hubSession:()=>account,hubRequest:async(g,a,p)=>{calls.push(p.offset);if(fail){fail=false;throw Error('Temporary network failure');}return p.offset===0?Array.from({length:30},(_,i)=>record(i,i===0?'group':'results')):[record(30)];},
 e:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')});
const source=(await fs.readFile(new URL('../speaking-professional-library.mjs',import.meta.url),'utf8')).replace(/^import[^\n]+\n/,'').replaceAll('export ','');
vm.runInContext(source+';globalThis.mount=mountProfessionalLibrary;',context);
await context.mount(root);assert.ok(root.querySelector('[data-pro-more]'));assert.equal(root.querySelectorAll('.pro-library-record').length,0);
root.querySelector('[data-pro-more]').click();await new Promise(r=>setTimeout(r,0));
assert.equal(root.querySelectorAll('.pro-library-record').length,30);assert.equal(root.querySelectorAll('script').length,0);assert.equal(root.querySelectorAll('.is-active').length,1);
assert.ok(root.querySelector('a[href="speaking-professional.html?record=record-0"]'));
root.querySelector('[data-pro-more]').click();await new Promise(r=>setTimeout(r,0));
assert.equal(root.querySelectorAll('.pro-library-record').length,31);assert.equal(root.querySelector('[data-pro-more]'),null);assert.deepEqual(calls,[0,0,30]);assert.ok(!root.textContent.includes('Discussion 500'));
const app=await fs.readFile(new URL('../speaking-system.js',import.meta.url),'utf8');
const cover=app.slice(app.indexOf('  function examCoverHtml()'),app.indexOf('  function renderExamModes()'));
const state={route:{exam:'dse',view:'dse-practice'}};const c=vm.createContext({state});
vm.runInContext(cover+';globalThis.cover=examCoverHtml;',c);assert.match(c.cover(),/dse-exam-practice-mode-v1.png/);state.route={exam:'ielts',view:'exam-practice'};assert.match(c.cover(),/ielts-exam-practice-mode.png/);
dom.window.close();console.log('Professional library: scoped records, safe titles, retry/pagination and DSE/IELTS banner selection passed.');
