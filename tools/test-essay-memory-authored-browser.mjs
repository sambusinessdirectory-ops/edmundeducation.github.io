// Exercise unpublished authored lessons locally without adding them to the release manifest.
import assert from 'node:assert/strict';
const keys=process.argv.slice(2);
if(!keys.length)throw Error('Pass one or more essay keys, e.g. opinion:4');
const {chromium}=await import('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
if(process.env.MEMORY_QA_REAL_MANIFEST!=='1'){
  const approved=Object.fromEntries(['opinion:80','opinion:3','discuss-both-views:4','cause-solution:2',...keys].map(key=>[key,true]));
  await page.route('**/essay-memory-release-manifest.js*',route=>route.fulfill({contentType:'application/javascript',body:`window.ESSAY_MEMORY_APPROVED=Object.freeze(${JSON.stringify(approved)});`}));
}
await page.addInitScript(()=>{
  sessionStorage.setItem('edmund-essay-memory-student-v1',JSON.stringify({id:'browser-qa',name:'Learner',role:'student',token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}));
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},
    rpc:async(_name,args)=>({error:null,data:[{id:'browser-qa',name:'Learner',role:'student',session_token:args.p_token}]})})};
});
const base=process.env.MEMORY_QA_BASE||'http://127.0.0.1:8764';
let choicesChecked=0;
for(const key of keys){
  const url=`${base}/essay-memorization.html?essay=${encodeURIComponent(key)}`;
  for(const width of [320,390,768])for(const scale of [1,1.15,1.3]){
    await page.setViewportSize({width,height:900});
    await page.goto(url);
    await page.evaluate(value=>localStorage.setItem('edmund-memory-font-scale',String(value)),scale);
    await page.reload();
    await page.locator('.shell').waitFor({state:'visible'});
    assert.equal(await page.locator('[data-stage]').count(),11,`${key}: eleven missions`);
    if(key.startsWith('task1-')){
      assert.equal(await page.locator('.memory-task1-visual img').count()>0,true,`${key}: source graphic`);
      assert.equal((await page.locator('[data-stage="0"]').innerText()).includes('看懂圖表'),true,`${key}: chart orientation`);
      assert.equal((await page.locator('[data-stage="4"]').innerText()).includes('跨圖表描述應用'),true,`${key}: report transfer`);
    }
    await page.locator('[data-stage="4"]').click();
    const rounds=await page.locator('#step-select option').count();
    assert(rounds>=10,`${key}: ten transfer rounds`);
    for(let i=0;i<rounds;i++){
      await page.locator('#step-select').evaluate((select,index)=>{select.value=String(index);select.dispatchEvent(new Event('change'));},i);
      const result=await page.locator('#game-card .choice-text').evaluateAll(spans=>spans.map(span=>{
        const lines=new Map(),walker=document.createTreeWalker(span,NodeFilter.SHOW_TEXT);
        let node;while((node=walker.nextNode()))for(let j=0;j<node.textContent.length;j++){
          const range=document.createRange();range.setStart(node,j);range.setEnd(node,j+1);
          const rect=range.getBoundingClientRect();if(!rect.width&&!rect.height)continue;
          const y=Math.round(rect.top);lines.set(y,(lines.get(y)||'')+node.textContent[j]);
        }
        return {text:span.textContent,last:[...lines].sort((a,b)=>a[0]-b[0]).at(-1)?.[1]?.trim()||'',lineCount:lines.size};
      }));
      assert.equal(result.length,4,`${key} transfer ${i+1}: four choices`);
      for(const row of result)assert(!(row.lineCount>1&&/^[\u3400-\u9fff]{1,3}[。！？]?$/.test(row.last)),
        `${key} ${width}px ${scale}× transfer ${i+1}: orphan ${row.last} in ${row.text}`);
      choicesChecked+=result.length;
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth
        ? [...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1)
          .slice(0,6).map(el=>`${el.tagName}.${el.className||''}: ${Math.round(el.getBoundingClientRect().right)}px ${el.textContent?.trim().slice(0,45)}`):[]);
      assert(!overflow.length,`${key} ${width}px ${scale}× transfer ${i+1}: overflow ${overflow.join('; ')}; ${JSON.stringify(await page.locator('.choice-card').first().evaluate(el=>{let a=el,o=[];for(let i=0;i<6&&a;i++,a=a.parentElement)o.push([a.className,a.getBoundingClientRect().width,a.getBoundingClientRect().left,a.getBoundingClientRect().right]);return o}))}`);
    }
  }
}
assert.deepEqual(errors,[]);
await browser.close();
console.log(`PASS: ${keys.length} authored lessons, ${choicesChecked} transfer-choice renders, three widths, three font scales, no 1–3-character Chinese tails or overflow.`);
