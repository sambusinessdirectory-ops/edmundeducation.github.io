const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.css':'text/css'};
let serveOldRelease=false;
const server=http.createServer((request,response)=>{
 const pathname=new URL(request.url,'http://localhost').pathname;
 if(pathname==='/service-worker.js'){
  let body=fs.readFileSync(path.join(root,'service-worker.js'),'utf8').replace('__EDMUND_RELEASE__',serveOldRelease?'old-release':'new-release');
  if(serveOldRelease)body=body.replace('      .then(() => self.skipWaiting())','').replace('  "/eddy-offline-dialogue.png"','');
  response.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'}).end(body);return;
 }
 if(pathname==='/offline.html'&&serveOldRelease){response.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><title>Old offline page</title><h1>Old offline page</h1>');return;}
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep))return response.writeHead(403).end();
 fs.readFile(file,(error,body)=>{response.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});response.end(error?'':body);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const origin=`http://127.0.0.1:${server.address().port}`;
  await page.goto(origin+'/offline.html');
  await page.evaluate(()=>navigator.serviceWorker.register('/service-worker.js'));
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,null,{timeout:20000});
  await context.setOffline(true);
  await page.goto(origin+'/unavailable-system.html');
  assert.equal(await page.locator('h1').innerText(),'暫時未能連線');
  assert.equal(await page.locator('.offline-eddy img').evaluate(image=>image.complete&&image.naturalWidth>0),true);
  assert((await page.locator('.offline-eddy-message').innerText()).length>15);
  assert.equal(await page.locator('button').innerText(),'重新連線');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  await context.close();
  console.log('PASS: offline navigation shows cached Eddy art and message with retry button on mobile');

  serveOldRelease=true;
  const upgradeContext=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
  const upgradePage=await upgradeContext.newPage();
  await upgradePage.goto(origin+'/offline.html');
  await upgradePage.evaluate(()=>navigator.serviceWorker.register('/service-worker.js'));
  await upgradePage.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.includes('/service-worker.js'),null,{timeout:20000});
  serveOldRelease=false;
  await upgradePage.evaluate(()=>navigator.serviceWorker.ready.then(registration=>registration.update()));
  let upgraded=false;
  for(let tries=0;tries<100;tries++){
   upgraded=await upgradePage.evaluate(async()=>{
    const registration=await navigator.serviceWorker.ready;
    if(registration.waiting||registration.active?.state!=='activated'||!navigator.serviceWorker.controller)return false;
    const release=await new Promise(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=event=>resolve(event.data.release);navigator.serviceWorker.controller.postMessage({type:'GET_RELEASE_ID'},[channel.port2]);});
    return release==='new-release'&&!(await caches.keys()).includes('edmund-pwa-old-release');
   });
   if(upgraded)break;
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert(upgraded,'new worker should control the page and delete the old cache');
  await upgradeContext.setOffline(true);
  await upgradePage.goto(origin+'/unavailable-system.html');
  assert.equal(await upgradePage.locator('h1').innerText(),'暫時未能連線');
  assert.equal(await upgradePage.locator('.offline-eddy img').evaluate(image=>image.complete&&image.naturalWidth>0),true);
  await upgradeContext.close();
  console.log('PASS: existing installed browser upgrades its offline page without a manual update prompt');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
