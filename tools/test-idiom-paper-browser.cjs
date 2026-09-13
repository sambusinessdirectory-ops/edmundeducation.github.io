// Isolated local fixture; no student credentials and no external services.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.MAP_TEST_ARTIFACTS||'/tmp/idiom-paper-browser';fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});
});
let browser;
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
  let page=await context.newPage();const errors=[],external=[];page.setDefaultTimeout(18000);

  const installFixture=async target=>{target.setDefaultTimeout(18000);
  target.on('pageerror',e=>errors.push(e.message));
  await target.route('**/idiom-system.js?*',route=>{
    const source=fs.readFileSync(root+'/idiom-system.js','utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*$/,'');
    return route.fulfill({contentType:'text/javascript',body:source+`
bindEvents();
window.paperTest={
  login(id='paper-fixture-a'){state.user={id,name:'Paper Preview',role:'student'};state.authToken='local-fixture';state.dashboardLoaded=true;renderLessonChoices();showView('dashboard',{preserveScroll:true});},
  dashboard(){renderLessonChoices();showView('dashboard',{preserveScroll:true});},
  logout(){clearSession();showView('login',{preserveScroll:true});},
  state,lessons:()=>lessonList(),openLesson
};`});
  });
  for(const f of ['shared-system-nav.js','pwa-register.js','shared-speaking-practice.js'])await target.route(`**/${f}*`,r=>r.fulfill({contentType:'text/javascript',body:''}));
  await target.route('https://**/*',r=>{external.push({url:r.request().url(),method:r.request().method()});return r.abort();});
  };await installFixture(page);
  await page.goto(origin+'/idiom-system.html');await page.waitForFunction(()=>window.paperTest);await page.evaluate(()=>paperTest.login());
  await page.waitForSelector('.expression-map-stone');await page.waitForFunction(()=>document.querySelector('.paper-effects')?.dataset.ready==='true');
  let map=page.locator('[data-idiom-map]'),viewport=page.locator('.expression-map-viewport');await map.scrollIntoViewIfNeeded();await viewport.focus();await page.waitForTimeout(800);
  assert.equal(await page.locator('.expression-map-stone').count(),30);
  assert.equal(await page.locator('[data-remaining-lesson-grid] [data-open-lesson]').count(),108);
  const framing=await viewport.evaluate(el=>({scale:+document.querySelector('[data-idiom-map]').dataset.scale,zoom:+document.querySelector('[data-idiom-map]').dataset.zoom,scrollTop:el.scrollTop,scrollLeft:el.scrollLeft,width:el.clientWidth,height:el.clientHeight,labelSize:parseFloat(getComputedStyle(document.querySelector('.expression-map-stone-caption')).fontSize)*+document.querySelector('[data-idiom-map]').dataset.scale}));
  await map.screenshot({path:path.join(out,'paper-standard.png')});
  const collisions=await page.evaluate(()=>{const a=[...document.querySelectorAll('.expression-map-stone')].map(n=>({id:n.dataset.mapLevel,caption:n.querySelector('.expression-map-stone-caption').getBoundingClientRect(),platform:n.querySelector('.paper-level-platform').getBoundingClientRect()})),bad=[],hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;for(const x of a)for(const y of a)if(x!==y&&(hit(x.caption,y.caption)||hit(x.caption,y.platform)))bad.push([x.id,y.id]);return bad;});
  const preview=page.locator('.paper-lesson-preview');
  await page.waitForFunction(()=>document.querySelector('.paper-lesson-preview')?.naturalWidth>0);
  const thumbnail=await preview.evaluate(el=>({src:el.getAttribute('src'),width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,alt:el.alt}));
  assert.match(thumbnail.src,/start-the-ball-rolling\.webp$/);assert.equal(thumbnail.width,88);assert.equal(thumbnail.height,68);assert.ok(thumbnail.alt.length>10);
  await page.locator('.expression-map-lesson-card').screenshot({path:path.join(out,'lesson-thumbnail.png')});
  // Hash actual painted pixels during ordinary animation, not just pose equations.
  await page.evaluate(async()=>{
    const geo=await import('./idiom-paper-geometry.mjs');
    const regions={mill:[geo.PAPER_MILL.x-105,geo.PAPER_MILL.y-105,210,210],pigeon:[500,25,540,225],water:[550,565,80,42]};
    geo.PAPER_FLAGS.forEach((f,i)=>regions['flag'+i]=[f.x-2,f.y-9,f.width+13,f.height+24]);
    geo.PAPER_BOATS.forEach((b,i)=>regions['boat'+i]=[b.x-95,b.y-130,190,157]);
    geo.PAPER_CLOUDS.forEach((c,i)=>regions['cloud'+i]=[c.x-c.width*.6-c.amplitude,0,c.width*1.2+c.amplitude*2,c.y+48]);
    geo.paperPlants().forEach((p,i)=>regions['plant'+i]=[p.x-p.w*.65,p.y-p.h-4,p.w*1.3,p.h*.75]);
    window.paperPixels=()=>{const c=document.querySelector('.paper-effects'),g=c.getContext('2d'),hashes={};for(const [name,rect] of Object.entries(regions)){const [x,y,w,h]=rect.map(Math.floor),d=g.getImageData(Math.max(0,x),Math.max(0,y),w,h).data;let v=2166136261;for(let k=0;k<d.length;k+=4){v=Math.imul(v^d[k],16777619);v=Math.imul(v^d[k+3],16777619);}hashes[name]=v>>>0;}return {time:+c.dataset.time,pose:JSON.parse(c.dataset.motion),hashes};};
  });
  const sampleStarted=Date.now();const frames=[];for(let i=0;i<75;i++){frames.push(await page.evaluate(()=>paperPixels()));await page.waitForTimeout(180);}
  const distinct=Object.fromEntries(Object.keys(frames[0].hashes).map(k=>[k,new Set(frames.map(f=>f.hashes[k])).size]));
  for(const [name,count]of Object.entries(distinct))assert.ok(count>4,`${name} must visibly repaint (${count})`);
  const seconds=frames.at(-1).time-frames[0].time;fs.writeFileSync(path.join(out,'motion-sample-debug.json'),JSON.stringify({seconds,distinct},null,2));assert.ok(seconds>10);
  const span=a=>Math.max(...a)-Math.min(...a);
  const observed={seconds,wallSeconds:(Date.now()-sampleStarted)/1000,uniquePixelStates:distinct,boatTravelPixels:[0,1].map(i=>span(frames.map(f=>f.pose.boats[i].x))*framing.scale),cloudTravelPixels:[0,1].map(i=>span(frames.map(f=>f.pose.clouds[i].x))*framing.scale),pigeonTravelPixels:span(frames.map(f=>f.pose.pigeon.x))*framing.scale,millDegrees:span(frames.map(f=>f.pose.mill))*180/Math.PI};
  assert.ok(observed.boatTravelPixels.every(n=>n>20));assert.ok(observed.cloudTravelPixels.every(n=>n>7));assert.ok(observed.pigeonTravelPixels>30);assert.ok(observed.millDegrees>275);
  // Full-cycle hinge/turnaround poses rendered by the same Canvas renderer.
  const poses=await page.evaluate(async()=>{
    const {createPaperEffects}=await import('./idiom-paper-effects.mjs');const c=document.createElement('canvas');c.width=1600;c.height=1950;const fx=createPaperEffects(c);await fx.ready;
    const sheet=document.createElement('canvas');sheet.width=960;sheet.height=400;const g=sheet.getContext('2d');
    const times=[0,1.45/4,1.45*3/4,17,34,51];times.forEach((t,i)=>{fx.paint(t);const p=JSON.parse(c.dataset.motion).pigeon,x=i%3*320,y=Math.floor(i/3)*200;g.fillStyle='#379ec4';g.fillRect(x,y,320,200);g.drawImage(c,p.x-140,p.y-120,280,165,x+20,y+5,280,165);g.fillStyle='#fff9e9';g.font='15px sans-serif';g.fillText(`t = ${t.toFixed(3)} s`,x+15,y+188);});fx.destroy();return sheet.toDataURL();
  });
  fs.writeFileSync(path.join(out,'pigeon-poses.png'),Buffer.from(poses.split(',')[1],'base64'));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(180);
  const still=await page.evaluate(()=>paperPixels());await page.waitForTimeout(450);assert.deepEqual((await page.evaluate(()=>paperPixels())).hashes,still.hashes);assert.equal(still.time,0);
  // Reveal the full scroll surface solely for a route overview screenshot.
  const oldViewportStyle=await viewport.getAttribute('style');
  await viewport.evaluate(el=>{el.style.setProperty('height',`${1950*+document.querySelector('[data-idiom-map]').dataset.scale}px`,'important');el.style.setProperty('max-height','none','important');el.scrollTop=0;});
  await page.waitForTimeout(120);await map.screenshot({path:path.join(out,'paper-full-trail.png')});
  await viewport.evaluate((el,old)=>old===null?el.removeAttribute('style'):el.setAttribute('style',old),oldViewportStyle);
  await page.waitForTimeout(150);
  const ids=await page.evaluate(()=>paperTest.lessons().slice(0,30).map(l=>l.id));
  const opened=[];
  for(const id of ids){
    await page.locator('.expression-map-picker select').selectOption(id);await page.waitForFunction(id=>document.querySelector('.expression-map-lesson-card')?.hidden===false&&document.querySelector('.expression-map-picker select').value===id,id);
    const imageState=await preview.evaluate(el=>({hidden:el.hidden,display:getComputedStyle(el).display}));if(id!==ids[0])assert.deepEqual(imageState,{hidden:true,display:'none'});
    await page.locator('[data-map-open]').click();
    const lesson=await page.evaluate(()=>({id:paperTest.state.lessonId,page:paperTest.state.lessonPage,view:paperTest.state.currentView,attempts:paperTest.state.attempts.length}));
    assert.equal(lesson.id,id);assert.equal(lesson.page,1);assert.equal(lesson.view,'lesson');assert.equal(lesson.attempts,0);opened.push(lesson.id);
    assert.equal(await map.getAttribute('data-animating'),'false');await page.evaluate(()=>paperTest.dashboard());
  }
  await page.locator('[data-character="elsie"]').click();await page.locator('[data-save-location]').click();
  await page.evaluate(()=>paperTest.logout());assert.ok(await map.isHidden());await page.evaluate(()=>paperTest.login('paper-fixture-b'));
  assert.equal(await page.locator('.expression-map-picker select').inputValue(),ids[0]);assert.equal(await page.locator('[data-character="eddy"]').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>{paperTest.logout();paperTest.login('paper-fixture-a');});
  assert.equal(await page.locator('.expression-map-picker select').inputValue(),ids.at(-1));assert.equal(await page.locator('[data-character="elsie"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),ids.at(-1));
  await page.locator('[data-idiom-map-toggle]').click();assert.ok(await map.isHidden());assert.equal(await page.locator('#idiom-lesson-list [data-open-lesson]').count(),138);
  await page.locator('[data-idiom-map-toggle]').click();await page.locator('[data-idiom-remaining] summary').click();
  const continuation=page.locator('[data-remaining-lesson-grid] [data-open-lesson]').last(),lastId=await continuation.getAttribute('data-open-lesson');await continuation.click();assert.equal(await page.evaluate(()=>paperTest.state.lessonId),lastId);await page.evaluate(()=>paperTest.dashboard());
  await page.locator('.expression-map-picker select').selectOption(ids[0]);
  const responsive=[];
  for(const [name,width,height]of [['tablet',820,1180],['phone',390,844]]){
    await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();await page.waitForTimeout(200);await map.screenshot({path:path.join(out,`paper-${name}.png`)});
    const metrics=await page.evaluate(()=>{const r=document.querySelector('[data-idiom-map]'),card=r.querySelector('.expression-map-lesson-card'),img=r.querySelector('.paper-lesson-preview'),c=card.getBoundingClientRect(),i=img.getBoundingClientRect(),v=r.querySelector('.expression-map-viewport');return{documentWidth:document.documentElement.scrollWidth,innerWidth,zoom:+r.dataset.zoom,scale:+r.dataset.scale,cardWidth:c.width,cardFits:c.left>=0&&c.right<=innerWidth,previewFits:i.left>=c.left&&i.right<=c.right,panAvailable:v.scrollWidth>v.clientWidth};});
    assert.ok(metrics.documentWidth<=width+1);assert.ok(metrics.cardFits&&metrics.previewFits);assert.ok(metrics.panAvailable);responsive.push({name,...metrics});
  }
  await page.setViewportSize({width:1440,height:1050});await map.scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(600);assert.ok(+(await page.locator('.paper-effects').getAttribute('data-time'))>0);
  const atlasReview=await page.evaluate(async()=>{
    const {loadPaperArtwork,drawPaperSprite,PAPER_SPRITES}=await import('./idiom-paper-artwork.mjs?v=20260913-paper3');const art=await loadPaperArtwork();
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1200;const g=canvas.getContext('2d');
    const keys=Object.keys(PAPER_SPRITES),backgrounds=['#183a3b','#faf0d6','#8b9b56'];
    keys.forEach((key,i)=>{const x=i%4*300,y=Math.floor(i/4)*240;g.fillStyle=backgrounds[i%3];g.fillRect(x,y,300,240);const r=PAPER_SPRITES[key].rect,w=Math.min(260,190*r[2]/r[3]),h=w*r[3]/r[2];drawPaperSprite(g,art,key,x+150-w/2,y+15,w,h);g.fillStyle=i%3?'#1d3630':'#fff8dc';g.font='16px sans-serif';g.fillText(key,x+15,y+225);});
    const sheets={};for(const name of ['plants','props','bird','flags']){const c=art[name],d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let clear=0,opaque=0,spill=0;for(let i=0;i<d.length;i+=4){if(!d[i+3])clear++;if(d[i+3]>245)opaque++;if(d[i+3]>32&&Math.min(d[i],d[i+2])-d[i+1]>12)spill++;}sheets[name]={clear,opaque,spill};}
    return {png:canvas.toDataURL(),sheets};
  });
  fs.writeFileSync(path.join(out,'cutout-review.png'),Buffer.from(atlasReview.png.split(',')[1],'base64'));
  fs.writeFileSync(path.join(out,'cutout-statistics.json'),JSON.stringify(atlasReview.sheets,null,2));
  for(const [name,s] of Object.entries(atlasReview.sheets)){console.log('Cutout',name,s);assert.ok(s.clear>100000&&s.opaque>100000);assert.equal(s.spill,0);}
  const retinaContext=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:2});
  await page.close();page=await retinaContext.newPage();await installFixture(page);await page.goto(origin+'/idiom-system.html');await page.waitForFunction(()=>window.paperTest);await page.evaluate(()=>paperTest.login());await page.waitForFunction(()=>document.querySelector('.paper-effects')?.dataset.ready==='true');
  map=page.locator('[data-idiom-map]');viewport=page.locator('.expression-map-viewport');
  await map.scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(180);
  const retina=await page.evaluate(()=>({dpr:devicePixelRatio,canvasWidth:document.querySelector('.paper-effects').width,worldWidth:1600,backgroundNativeWidth:document.querySelector('.paper-background').naturalWidth,backgroundDisplayWidth:document.querySelector('.paper-background').getBoundingClientRect().width}));
  assert.equal(retina.dpr,2);assert.equal(retina.canvasWidth,3200);assert.ok(retina.backgroundNativeWidth>=retina.backgroundDisplayWidth);
  await map.screenshot({path:path.join(out,'paper-retina.png')});assert.ok(fs.readFileSync(path.join(out,'paper-retina.png')).readUInt32BE(16)>2700);
  for(const [name,box]of Object.entries({bird:[540,15,470,245],mill:[1365,250,230,270],trees:[0,58,480,250],castle:[1070,0,445,355],timber:[400,240,520,160],stone:[700,485,700,270]})){
    const clip=await viewport.evaluate((el,b)=>{const r=el.getBoundingClientRect(),s=+document.querySelector('[data-idiom-map]').dataset.scale;return{x:r.x+(b[0]+800)*s-el.scrollLeft,y:r.y+b[1]*s-el.scrollTop,width:b[2]*s,height:b[3]*s};},box);await page.screenshot({path:path.join(out,`detail-${name}.png`),clip});
  }
  // Minimum zoom exposes a deliberate paper matte, with no stretched scenery.
  for(let i=0;i<4;i++){if(await page.locator('[data-zoom="out"]').isDisabled())break;await page.locator('[data-zoom="out"]').click();}
  const overview=await viewport.evaluate(el=>({zoom:+document.querySelector('[data-idiom-map]').dataset.zoom,covered:el.scrollWidth>=el.clientWidth&&el.scrollHeight>=el.clientHeight}));assert.ok(overview.zoom<1&&overview.covered);assert.equal(await page.locator(".paper-edge,.paper-surround").count(),0);await map.screenshot({path:path.join(out,'paper-overview.png')});
  const postRequests=external.filter(r=>r.method!=='GET');assert.deepEqual(postRequests,[]);
  assert.deepEqual(errors,[]);assert.deepEqual(collisions,[]);assert.equal(framing.zoom,1);assert.equal(framing.scrollTop,0);assert.ok(framing.labelSize>=14);
  fs.writeFileSync(path.join(out,'browser-verification.json'),JSON.stringify({framing,collisions,thumbnail,observed,opened,continuationLastId:lastId,accountIsolation:true,reducedMotion:true,responsive,retina,overview,cutouts:atlasReview.sheets,errors,externalRequests:external},null,2));
  console.log('PASS: standard layout; actual animated pixel changes for every object and plant; reduced motion; all 30 lesson entry links; full catalogue; account isolation; thumbnail; tablet and phone layout.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
