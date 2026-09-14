const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function({page,map,viewport,out,sharp,assertOverview}){
 const range=a=>Math.max(...a)-Math.min(...a);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-phrasal-chapter=bakery]').click();await page.waitForTimeout(250);
 await page.waitForFunction(()=>[...document.querySelectorAll('.bakery-background,.bakery-sprite')].every(image=>image.complete&&image.naturalWidth>0));
 assert.equal(await page.locator('[data-bakery]').count(),30);assert.equal(await page.locator('.desert-platform').count(),30);assert.equal(await page.locator('.night-coin').count(),30);
 assert.equal(await page.locator('.bakery-decoration').count(),6);
 assert.equal(await page.locator('.bakery-decoration').evaluateAll(es=>new Set(es.map(e=>e.dataset.bakeryDecoration)).size),6,'Every decorative group is different');
 assert.ok(await page.locator('.bakery-sprinkle').count()>=120,'Rainbow sugar remains visible between stops and around bends');
 const glow=await page.locator('.bakery-moon-motion').evaluate(e=>getComputedStyle(e).filter);assert.ok(glow.includes('drop-shadow'),'Croissant has a warm light halo');
 assert.equal(await page.locator('[data-map-open]').isVisible(),true);assert.equal(await page.locator('[data-phrasal-chapter=bakery]').getAttribute('aria-pressed'),'true');
 const focal=await page.evaluate(()=>{const v=document.querySelector('.expression-map-viewport').getBoundingClientRect();return ['moon','galaxy','saturn'].map(name=>{const b=document.querySelector('.bakery-'+name).getBoundingClientRect();return {name,inside:b.left>=v.left-1&&b.right<=v.right+1&&b.top>=v.top-1&&b.bottom<=v.bottom+1};});});assert.ok(focal.every(f=>f.inside),JSON.stringify(focal));
 await map.screenshot({path:path.join(out,'bakery-standard.png')});
 await page.emulateMedia({reducedMotion:'no-preference'});await viewport.focus();await page.waitForTimeout(100);
 const frames=[],pixelsA=await viewport.screenshot();let pixelsB;
 for(let i=0;i<29;i++){
  frames.push(await page.evaluate(()=>{
   const angle=(s,yAxis=false)=>{const m=new DOMMatrix(getComputedStyle(document.querySelector(s)).transform);return Math.atan2(yAxis?-m.m13:m.b,m.a)*180/Math.PI;};
   return {time:+document.querySelector('.phrasal-bakery-section').dataset.motionTime,moon:angle('.bakery-moon-motion'),galaxy:angle('.bakery-galaxy-motion'),saturn:angle('.bakery-saturn-motion',true),stars:[...document.querySelectorAll('.bakery-large-star')].map(e=>+getComputedStyle(e).opacity),puffs:[...document.querySelectorAll('.bakery-smoke-puff')].map(e=>({opacity:+getComputedStyle(e).opacity,y:new DOMMatrix(getComputedStyle(e).transform).f})),steam:[...document.querySelectorAll('.bakery-steam-veil')].map(e=>e.getAttribute('d'))};
  }));
  if(i===11)pixelsB=await viewport.screenshot();await page.waitForTimeout(500);
 }
 assert.ok(Math.min(...frames.map(f=>f.moon))<-10&&Math.max(...frames.map(f=>f.moon))>10,'Croissant swings both ways');
 assert.ok(range(frames.map(f=>f.galaxy))>40,'Galaxy spirals at ordinary playback');assert.ok(Math.min(...frames.map(f=>f.saturn))<-28&&Math.max(...frames.map(f=>f.saturn))>28,'Saturn turns left and right at ordinary playback');
 for(let i=0;i<17;i++)assert.ok(range(frames.map(f=>f.stars[i]))>.55,`Large star ${i} twinkles`);
 for(let i=0;i<5;i++){assert.ok(range(frames.map(f=>f.puffs[i].y))>110,`Puff ${i} rises`);assert.ok(range(frames.map(f=>f.puffs[i].opacity))>.45,`Puff ${i} fades at its loop`);}
 for(let i=0;i<6;i++)assert.ok(new Set(frames.map(f=>f.steam[i])).size>20,`Steam ${i} changes its curls`);
 async function compare(a,b,regions){const result={};for(const [name,x,y,width,height,moving] of regions){const region=await page.evaluate(({x,y,width,height})=>{const a=document.querySelector('.bakery-background').getBoundingClientRect(),v=document.querySelector('.expression-map-viewport').getBoundingClientRect(),s=+document.querySelector('[data-phrasal-map]').dataset.scale;return {left:Math.round(a.left-v.left+x*s),top:Math.round(a.top-v.top+y*s),width:Math.floor(width*s),height:Math.floor(height*s)};},{x,y,width,height});const [aa,bb]=await Promise.all([a,b].map(buffer=>sharp(buffer).extract(region).removeAlpha().raw().toBuffer()));let changed=0,total=0;for(let i=0;i<aa.length;i++){const d=Math.abs(aa[i]-bb[i]);total+=d;if(d>5)changed++;}result[name]={changedFraction:changed/aa.length,meanDelta:total/aa.length};if(moving)assert.ok(result[name].changedFraction>.004,`${name} changes visible pixels: ${JSON.stringify(result[name])}`);else assert.equal(changed,0,`${name} stays still`);}return result;}
 const skyPixels=await compare(pixelsA,pixelsB,[['croissant',70,57,210,215,true],['galaxy',900,40,320,230,true],['saturn',1160,10,435,435,true],['chimney-smoke',764,90,90,148,true],['large-star',378,169,28,28,true],['bakery-door',833,389,36,53,false],['cupcake',405,401,42,50,false]]);
 await viewport.evaluate(v=>v.scrollTop=(3545+680)*Number(document.querySelector('[data-phrasal-map]').dataset.scale));await page.waitForTimeout(150);
 const cupA=await viewport.screenshot();await page.waitForTimeout(2100);const cupB=await viewport.screenshot();
 const cupPixels=await compare(cupA,cupB,[['chocolate-steam',1210,825,185,203,true],['mug-body',1268,1060,66,44,false]]);
 await viewport.screenshot({path:path.join(out,'bakery-cup-steam.png')});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-phrasal-chapter=bakery]').click();await page.waitForTimeout(100);await page.emulateMedia({reducedMotion:'no-preference'});
 // Controlled time covers two complete galaxy rotations and Saturn turning cycles, alongside the ordinary-speed observation above.
 const loops={};for(const [name,period] of [['galaxy',80000],['saturn',10000]]){
  const poses=[];for(const fraction of [0,.25,.5,.75,1,1.25,1.5,1.75,2]){
   poses.push(await page.locator(`.bakery-${name}-motion`).evaluate((e,{fraction,period})=>{const a=e.getAnimations()[0];a.pause();a.effect.updateTiming({delay:0});a.currentTime=fraction*period;const m=new DOMMatrix(getComputedStyle(e).transform);return {fraction,a:m.a,b:m.b,c:m.c,d:m.d,is2D:m.is2D,yAngle:Math.atan2(-m.m13,m.m11)*180/Math.PI,m13:m.m13,m31:m.m31,m33:m.m33,parentTransform:getComputedStyle(e.parentElement).transform};},{fraction,period}));
   if(fraction<=1)await viewport.screenshot({path:path.join(out,`bakery-${name}-pose-${fraction}.png`)});
  }
  for(const p of poses){
   if(name==='galaxy'){assert.ok(Math.abs(p.a-Math.cos(p.fraction*2*Math.PI))<.001);assert.ok(Math.abs(p.b-Math.sin(p.fraction*2*Math.PI))<.001);}
   else{assert.ok(Math.abs(p.yAngle-(-32*Math.cos(p.fraction*2*Math.PI)))<.01,'Saturn alternates left/front/right around Y');assert.ok(Math.abs(p.b)<.001&&Math.abs(p.c)<.001&&Math.abs(p.d-1)<.001,'Saturn has no clockwise Z spin or X tilt');assert.ok(Math.abs(p.m13+p.m31)<.001&&Math.abs(p.a-p.m33)<.001,'Ring and sphere turn together around the vertical axis');}
  }loops[name]=poses;
  await page.locator(`.bakery-${name}-motion`).evaluate(e=>e.getAnimations()[0].play());
 }
 await page.locator('[data-phrasal-chapter=day]').click();await page.waitForTimeout(3500);assert.equal(await page.locator('.phrasal-bakery-section').getAttribute('data-visible'),'false');assert.equal(await page.locator('.bakery-smoke-puff').first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-phrasal-chapter=bakery]').click();await page.waitForTimeout(150);
 for(const selector of ['.bakery-large-star','.bakery-moon-motion','.bakery-galaxy-motion','.bakery-saturn-motion','.bakery-smoke-puff'])assert.equal(await page.locator(selector).first().evaluate(e=>getComputedStyle(e).animationName),'none');
 const steam=await page.locator('.bakery-steam-veil').first().getAttribute('d');await page.waitForTimeout(500);assert.equal(await page.locator('.bakery-steam-veil').first().getAttribute('d'),steam);
 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await page.reload();await page.waitForFunction(()=>window.desertTest);await page.evaluate(()=>desertTest.login());await map.scrollIntoViewIfNeeded();await page.locator('[data-phrasal-chapter=bakery]').click();await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-map-open]').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await map.screenshot({path:path.join(out,`bakery-${name}-standard.png`)});
  await page.locator('[data-map-overview]').click();await assertOverview();assert.equal(await page.locator('[data-phrasal-chapter=bakery]').getAttribute('aria-pressed'),'true');
  await map.screenshot({path:path.join(out,`bakery-${name}-overview.png`)});await page.locator('.expression-map-picker select').selectOption('phrasal-verb-90');assert.equal(await page.locator('[data-map-open]').isVisible(),true);await map.screenshot({path:path.join(out,`bakery-${name}-last-stop.png`)});
 }
 fs.writeFileSync(path.join(out,'bakery-motion-review.json'),JSON.stringify({frames,skyPixels,cupPixels,loops,focal},null,2));
 console.log('PASS: Y-axis turning, relocated galaxy, varied scenery, filled steam, fixed scenery, reduced motion and three responsive chapter views');
};
