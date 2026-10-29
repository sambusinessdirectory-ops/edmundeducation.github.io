// Local-only browser regression. All account, persistence and network data are synthetic.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'flashcards.html'),'utf8');
const rows=new Map();let revision=0;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':file.endsWith('.html')?'text/html':'text/plain');res.end(data);});
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({headless:true});
const bridge=`
initialiseFlashcardPortal=async()=>{};
const fixtureDeck='dse/speaking/2023/passage/3.3';
const fixtureCards=Array.from({length:60},(_,i)=>({front:'Card '+(i+1),meaning:'卡片 '+(i+1),examples:[]}));
let fixtureStore={};
getDeckCards=()=>fixtureCards;deckDataRevision=()=>'';
readJson=(key,fallback)=>structuredClone(fixtureStore[key]??fallback);
writeJson=(key,value)=>{fixtureStore[key]=structuredClone(value);return true;};
cachePendingFamiliarityDeck=()=>{};
requireFlashcardStateReady=()=>true;captureSupabaseStateSaveContext=()=>({});isSupabaseStateHydrated=()=>true;
ensureSupabaseSession=async()=>{};
currentUser={id:'11111111-1111-4111-8111-111111111111',name:'Fixture',role:'student'};studentSessionToken='fixture';
currentDeckId=fixtureDeck;currentDeckTitle='DSE / Speaking / 2023 / Passage / 3.3';
showAppPanel=view=>{currentView=view;};
window.__qa={
 ready:()=>!!classroomLive,
 start:(offset)=>startDeckSession('range',0,offset+1,offset+10,'第 '+(offset+1)+'–'+(offset+10)+' 張卡'),
 mark:()=>{studySession.flipped=true;markCard('green');},
 refresh:async()=>{classroomLive.refresh();await new Promise(r=>setTimeout(r,120));},
 snapshot:()=>({session:structuredClone(studySession),store:structuredClone(fixtureStore),text:document.querySelector('[data-front-term]').textContent}),
 restore:state=>{fixtureStore=structuredClone(state.store);resumeDeckSession();},
 saved:()=>getDeckFamiliarity(fixtureDeck),
};
`;
const shim=`window.supabase={createClient:()=>({rpc:(name,args)=>fetch('/fixture-rpc/'+name,{method:'POST',body:JSON.stringify(args)}).then(async r=>({data:await r.json(),error:null}))})};`;
async function device(){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.pathname.startsWith('/fixture-rpc/')){
   const a=route.request().postDataJSON();const key=a.p_scope;
   if(a.p_payload)rows.set(key,{revision:++revision,payload:a.p_payload});
   const row=rows.get(key);return route.fulfill({json:row?{revision:row.revision,payload:row.revision!==a.p_since?row.payload:null}:{revision:0}});
  }
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return route.fulfill({contentType:'text/javascript',body:shim});
  if(u.origin!==base)return route.abort();
  if(u.pathname==='/flashcards.html')return route.fulfill({contentType:'text/html',body:source.replace(/ integrity="[^"]+"/g,'').replace('    void initialiseFlashcardPortal().catch',bridge+'\n    void initialiseFlashcardPortal().catch')});
  if(/\/(pwa-register|shared-system-nav|eddy-global-dialogues|eddy-five-streak-dialogue|page-loader|pronunciation-checker|flashcard-pronunciation)\.js/.test(u.pathname))return route.fulfill({contentType:'text/javascript',body:''});
  return route.continue();
 });
 await page.goto(base+'/flashcards.html');await page.waitForFunction(()=>window.__qa?.ready());return {page,context,errors};
}
try{
 const a=await device();await a.page.evaluate(()=>__qa.start(0));
 for(let i=0;i<10;i++)await a.page.evaluate(()=>__qa.mark());
 await a.page.waitForTimeout(1500);
 const done=await a.page.evaluate(()=>__qa.snapshot());assert.equal(done.session.completed,true);assert.equal(done.session.roundQueue.length,0);
 assert.equal(Object.values(rows.values().next().value.payload.session.outcomes).length,10);
 // Seed the exact legacy deck-wide completion shape that caused the production bug.
 rows.set('dse/speaking/2023/passage/3.3',{revision:++revision,payload:{deckId:'dse/speaking/2023/passage/3.3',deckRevision:'',cardCount:60,session:done.session,familiarity:{green:Array.from({length:10},(_,i)=>String(i)),red:[]}}});
 await a.page.evaluate(()=>__qa.start(10));await a.page.evaluate(()=>__qa.refresh());
 let fresh=await a.page.evaluate(()=>__qa.snapshot());assert.equal(fresh.text,'Card 11');assert.equal(fresh.session.completed,false);assert.equal(fresh.session.roundNumber,1);
 // Second device restores the same saved attempt, not a newly created attempt.
 const b=await device();await b.page.evaluate(s=>__qa.restore(s),fresh);
 await a.page.evaluate(()=>__qa.mark());
 await b.page.waitForFunction(()=>__qa.snapshot().session.outcomes['10']==='green');
 assert.equal((await b.page.evaluate(()=>__qa.snapshot())).text,'Card 12');
 for(let i=1;i<10;i++)await a.page.evaluate(()=>__qa.mark());
 await b.page.waitForFunction(()=>__qa.snapshot().session.completed);
 const completed=await a.page.evaluate(()=>__qa.snapshot());
 const attempt=completed.store.edmundFlashcardAttempts.find(x=>x.id===completed.session.attemptId);
 assert.equal(attempt.completed,true);assert.deepEqual(attempt.cardOutcomes.map(x=>x.index),Array.from({length:10},(_,i)=>i+10));
 assert.equal((await a.page.evaluate(()=>__qa.saved())).green.length,20);
 // Starting the same range again must not inherit its old completion either.
 await a.page.evaluate(()=>__qa.start(10));await a.page.evaluate(()=>__qa.refresh());
 fresh=await a.page.evaluate(()=>__qa.snapshot());assert.equal(fresh.session.completed,false);assert.equal(fresh.text,'Card 11');assert.notEqual(fresh.session.attemptId,completed.session.attemptId);
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 await a.context.close();await b.context.close();
 console.log('PASS browser: stale completion ignored, cards 11–20 saved at correct indexes, same-attempt second-device updates, same-range restart remains fresh; no page errors.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
