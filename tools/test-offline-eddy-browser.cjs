const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.css':'text/css'};
const server=http.createServer((request,response)=>{
 const pathname=new URL(request.url,'http://localhost').pathname;
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
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
