import assert from 'node:assert/strict';
import {chromium} from '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:1200,height:850}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/error-admin-test.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body><div class="edmund-system-header__actions"></div><div data-view="dashboard"><section data-error-id-modes><div class="error-id-mode-grid"><button class="error-id-mode-card">單句</button><button class="error-id-mode-card">文章</button></div></section><section data-error-id-single hidden></section><section data-error-id-passage hidden></section><section data-error-id-bar hidden></section></div></body></html>'}));
  await page.goto('http://127.0.0.1:8633/error-admin-test.html');
  await page.addStyleTag({path:'error-identifier.css'});
  await page.evaluate(()=>{
    window.EDMUND_LEARNING_PORTAL_CONTEXT={getSession:()=>({user:{id:'qa'},token:'student-token'}),rpc:async(name,args)=>{
      if(name==='error_identifier_admin_login')return {token:'teacher-token',name:'Teacher'};
      if(name==='error_identifier_admin_answers')return {single:[],jayden:[],passages:[],indefinite:[{number:1,sentence:'Someone left a scarf.',mark:'tick',wrong:'',fix:'',correct_sentence:'Someone left a scarf.',reason:'Someone 指未指名的人。'}]};
      if(name==='error_identifier_jayden_action')return {answers:{},feedback:{}};
      throw Error(`Unexpected RPC ${name} ${JSON.stringify(args)}`);
    }};
  });
  await page.addScriptTag({path:'error-identifier-jayden-questions.js'});
  await page.addScriptTag({path:'error-identifier-jayden.js'});
  await page.locator('[data-error-admin-open]').click();
  await page.locator('[data-admin-form] [name=username]').fill('Teacher');
  await page.locator('[data-admin-form] [name=password]').fill('test');
  await page.locator('[data-admin-form] button').click();
  await page.locator('[data-admin-library]').waitFor({state:'visible'});
  await page.locator('[data-admin-set]').selectOption('indefinite');
  assert.match(await page.locator('[data-admin-answers]').innerText(),/Someone 指未指名的人/);
  assert.match(await page.locator('[data-admin-page]').innerText(),/共 1 題/);
  assert.deepEqual(errors,[]);
  console.log('PASS: fourth Error Identifier answer bank appears after admin login and renders its reference answer.');
}finally{await browser.close();}
