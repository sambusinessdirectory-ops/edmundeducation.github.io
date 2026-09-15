// Run with: node tools/test-common-expression-map-browser.cjs
// Uses a local fixture account; no student service is contacted.
const path = require('node:path');
const http = require('node:http');
let playwright;
try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require(path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const { chromium } = playwright;
const fs = require('fs');
const assert = require('assert/strict');
const root=path.resolve(__dirname,'..');
const system='business-speaking';
const written=system==='written', coast=system==='rhetorical-speaking';
const lessonCount=26, last=lessonCount-1, lastId=`common-expression-${lessonCount}`;
const artifactDir='/private/tmp/proverb-shore-qa';
fs.mkdirSync(artifactDir,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(body);});
});

let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/proverb-system.js?*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(root+'/proverb-system.js','utf8').replace('initialise().catch(', 'Promise.resolve().catch(')+`\nwindow.mapTest={login(){bindEvents();state.user={id:'black-shore-test',name:'Map Preview',role:'student'};state.authToken='fixture';renderLessonChoices();showView('dashboard');},state,lessons:lessonList()};`}));
 for(const file of ['shared-system-nav.js','pwa-register.js','shared-speaking-practice.js'])await page.route(`**/${file}*`,r=>r.fulfill({contentType:'text/javascript',body:''}));await page.route('https://**/*',r=>r.abort());
 await page.goto(origin+'/proverb-system.html');await page.waitForFunction(()=>window.mapTest);await page.evaluate(()=>mapTest.login());await page.waitForSelector('.black-motion');await page.locator('[data-proverb-map]').scrollIntoViewIfNeeded();await page.waitForFunction(()=>Number(document.querySelector('.black-motion').dataset.seconds)>.3);
 assert.equal(await page.locator('[data-map-level]').count(),3);assert.equal(await page.locator('[data-black-reserved]').count(),27);assert.equal(await page.locator('.expression-map-picker option').count(),3);const records=await page.evaluate(()=>JSON.stringify(mapTest.state.attempts));
 await page.locator('[data-map-level="2"]').click();await page.waitForTimeout(3400);assert.equal(await page.locator('[data-map-level="2"]').getAttribute('data-arrived'),'true');
 await page.locator('[data-map-overview]').click();await page.locator('[data-black-reserved="30"]').click();await page.waitForTimeout(3400);assert.equal(await page.locator('[data-map-open]').isVisible(),false);assert.match(await page.locator('.black-reservation-note').innerText(),/30/);assert.equal(await page.evaluate(()=>JSON.stringify(mapTest.state.attempts)),records);await page.locator('[data-proverb-map]').screenshot({path:artifactDir+'/overview.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const still=await page.locator('.black-motion').evaluate(c=>c.toDataURL());await page.waitForTimeout(180);assert.equal(await page.locator('.black-motion').evaluate(c=>c.toDataURL()),still);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('[data-proverb-map]').screenshot({path:artifactDir+'/phone.png'});
 await page.setViewportSize({width:1600,height:2100});const evidence=await page.evaluate(async()=>{
  const {PROVERB_BLACK_SAND:theme,prepareBlackSand}=await import('./proverb-black-sand.mjs?v=20260915-black3');await prepareBlackSand();const root=document.createElement('div');root.id='shore-review';root.className='expression-map';root.dataset.theme='proverb-black-sand';root.style.cssText='width:1600px;height:1950px;position:relative';const lessons=mapTest.lessons,nodes=theme.positions(lessons);root.innerHTML='<div class="expression-map-heading"><small></small></div><div class="expression-map-stage"><div class="expression-map-viewport" style="height:1950px;max-height:none"><div style="position:relative;width:1600px;height:1950px">'+theme.terrain(nodes,lessons)+nodes.map((p,i)=>`<button class="expression-map-stone" data-map-level="${i}" style="left:${p.x}px;top:${p.y}px"><span class="expression-map-stone-number">${i+1}</span><span class="expression-map-stone-caption">${lessons[i].titleEn||lessons[i].title}</span></button>`).join('')+'</div></div></div>';document.body.append(root);const motion=theme.mount(root,{matches:false},{explore(){}});await new Promise(r=>setTimeout(r,100));
  const ctx=root.querySelector('canvas').getContext('2d'),regions={clouds:[600,30,800,180],waves:[500,340,600,200],poolLeft:[20,915,60,35],poolRight:[1530,1330,55,85],flying:[400,180,800,140],star0:[95,870,85,90],star1:[1460,1325,80,90],gull0:[120,400,180,170],gull1:[1360,425,180,170],rockLeft:[290,515,60,55],rockRight:[1200,420,75,45],sand:[580,950,380,620]};const sample=()=>Object.fromEntries(Object.entries(regions).map(([k,r])=>[k,Array.from(ctx.getImageData(...r).data)]));motion.draw(1000);const a=sample();for(let i=1;i<=220;i++)motion.draw(1000+i*32);const b=sample();window.shoreReview={root,motion};return Object.fromEntries(Object.keys(a).map(k=>[k,a[k].reduce((n,v,i)=>n+(v!==b[k][i]),0)]));
 });
 for(const [key,value] of Object.entries(evidence)){if(key==='sand'||key.startsWith('rock'))assert.equal(value,0);else assert.ok(value>20,key+' moves');}fs.writeFileSync(artifactDir+'/motion.json',JSON.stringify(evidence,null,2));await page.locator('#shore-review').screenshot({path:artifactDir+'/detail.png'});assert.equal(errors.length,0,errors.join('\n'));console.log('Proverb black-sand browser passed: 3 real lessons, 27 reservations, no progress mutation, gulls/clouds/waves/starfish motion, static sand, reduced motion and phone containment.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
