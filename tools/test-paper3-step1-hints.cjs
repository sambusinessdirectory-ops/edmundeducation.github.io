const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
  if(!file.startsWith(root+'/'))return res.writeHead(403).end();
  fs.readFile(file,(error,data)=>{
    if(error)return res.writeHead(404).end();
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data);
  });
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('https://**/*',route=>route.abort());
    const url=`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`;
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#curation-dock').waitFor({state:'visible'});
    await page.locator('#curation-spotlight').uncheck();
    async function jump(query){
      await page.locator('#curation-step-jump').click();
      await page.locator('#curation-picker-search').fill(query);
      await page.locator('.curation-picker-option:visible').first().click();
    }
    const bankItems=()=>page.locator('#curation-bank-groups li').count();
    const navyMarks=()=>page.locator('.curation-essay-source-used').count();
    assert.equal(await bankItems(),0,'a fresh Step 1 has an empty evidence bank');
    assert.equal(await navyMarks(),0,'a fresh Step 1 has no essay-source strokes');

    await page.locator('[data-chapter="data"]').click();
    await page.locator('#page-7 .sentence-item').filter({hasText:'I really struggled during the exams'}).first().click();
    await page.locator('#curation-next').click();
    assert.ok(await bankItems()>0,'a source enters the bank during guided evidence collection');

    await page.locator('[data-chapter="writing"]').click();
    await jump('核對原文第');
    assert.ok(await navyMarks()>0,'a reached model-essay source receives its blue stroke');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-paper3-2025-b2-curation-v1')));
    assert.ok(Object.values(saved.slots['1'].evidence).some(ids=>ids.length),'collected evidence remains in the save');

    await page.locator('[data-chapter="boss"]').click();
    assert.equal(await bankItems(),0,'returning to Step 1 hides later evidence');
    assert.equal(await navyMarks(),0,'returning to Step 1 hides later blue strokes');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#curation-dock').waitFor({state:'visible'});
    assert.equal(await bankItems(),0,'a restored Step 1 still hides later evidence');
    assert.equal(await navyMarks(),0,'a restored Step 1 still hides later blue strokes');

    await page.locator('[data-chapter="writing"]').click();
    await jump('');
    assert.equal(await navyMarks(),0,'the first writing step hides later essay-source strokes');
    await jump('核對原文第');
    assert.ok(await navyMarks()>0,'returning to the reached source restores its blue stroke');
    assert.deepEqual(errors,[]);
    console.log('Paper 3 Step 1 hint gating browser test passed');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
