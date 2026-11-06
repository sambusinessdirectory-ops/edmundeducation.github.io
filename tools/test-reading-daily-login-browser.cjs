const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const playwright = require(process.env.PLAYWRIGHT_MODULE || process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const server = http.createServer((request,response)=>{
  const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname === '/' ? '/daily-reading.html' : new URL(request.url,'http://localhost').pathname);
  const file = path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
  response.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(response);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`,browser=await playwright.chromium.launch({headless:true});
  try{
    for(const storageBlocked of [false,true]){
      const context=await browser.newContext();
      if(storageBlocked)await context.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('Blocked','SecurityError');}});});
      await context.route('**/shared-system-nav.js*',route=>route.fulfill({contentType:'text/javascript',body:storageBlocked?'window.EdmundSystemNav={getStudentSession(){throw Error("blocked")},rememberStudentSession(){throw Error("blocked")},forgetStudentSession(){throw Error("blocked")}};':''}));
      await context.route('**/rest/v1/rpc/**',async route=>{
        const name=new URL(route.request().url()).pathname.split('/').pop(),args=route.request().postDataJSON();
        await new Promise(resolve=>setTimeout(resolve,80));
        if(name==='flashcard_student_login')return route.fulfill({json:args.p_name==='learner'&&args.p_password==='secret'?[{id:'student-1',name:'Learner',role:'student',session_token:'valid-token'}]:[]});
        if(name==='flashcard_student_session_profile')return route.fulfill({json:args.p_token==='valid-token'?[{id:'student-1',name:'Learner',role:'student',session_token:'valid-token'}]:[]});
        return route.fulfill({json:[]});
      });
      const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+'/daily-reading.html');
      if(!storageBlocked){
        await page.locator('[name=username]').fill('wrong');await page.locator('[name=password]').fill('wrong');await page.locator('[data-login-button]').click();
        await page.getByText('學生帳戶或密碼不正確。',{exact:true}).waitFor();assert.equal(await page.locator('[data-login-button]').isDisabled(),false);
      }
      await page.locator('[name=username]').fill('learner');await page.locator('[name=password]').fill('secret');await page.locator('[data-login-button]').click();
      await page.locator('[data-view=library]').waitFor({state:'visible'});assert.equal(await page.locator('[data-view=login]').isVisible(),false);assert.match(await page.locator('[data-welcome]').innerText(),/Learner/);assert.deepEqual(errors,[]);
      await context.close();
    }
    console.log('PASS: Daily Reading login reports failures and opens the library even when browser/shared session storage is unavailable.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
