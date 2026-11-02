import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const key=fs.readFileSync('course-materials/grammar/answer-keys/indefinite-pronouns-250.tsv','utf8').trimEnd().split('\n').slice(1).map(line=>{
  const [number,answer,explanation]=line.split('\t');return {number:Number(number),answer,explanation};
});
const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:1200,height:850}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/grammar-admin-test.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body><div class="edmund-system-header__actions"></div><div data-learning-portal-root><section data-view="dashboard">Student view</section></div></body></html>'}));
  for(const file of ['grammar-admin.js','grammar-admin-connection.mjs','grammar-admin-export.mjs'])await page.route(`**/${file}*`,route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(file,'utf8')}));
  await page.goto('http://127.0.0.1:8633/grammar-admin-test.html');
  await page.addStyleTag({path:'grammar-admin.css'});
  await page.addScriptTag({path:'grammar-indefinite-pronouns-data.js'});
  await page.evaluate(answerKey=>{
    window.qaKey=answerKey;
    window.EDMUND_SUPABASE={url:'https://example.test',anonKey:'public-test'};
    window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'test'}}}})},rpc:async(name)=>{
      if(name==='grammar_admin_login'||name==='grammar_admin_profile')return {data:[{session_token:'teacher-token',name:'Teacher'}]};
      if(name==='grammar_admin_indefinite_pronouns_answers')return {data:window.qaKey};
      throw Error(`Unexpected RPC ${name}`);
    }})};
  },key);
  await page.addScriptTag({url:'http://127.0.0.1:8633/grammar-admin.js',type:'module'});
  await page.locator('.learning-portal-header-button').click();
  await page.locator('[data-admin-login] [name=username]').fill('Teacher');
  await page.locator('[data-admin-login] [name=password]').fill('test');
  await page.locator('[data-admin-login] button[type=submit]').click();
  await page.locator('[data-admin-content]').waitFor({state:'visible'});
  assert.equal(await page.locator('.grammar-admin__module').count(),1);
  await page.locator('[data-answer-module="indefinite-pronouns"][data-answer-kind="exercises"]').click();
  await page.locator('[data-answer-browser]').waitFor({state:'visible'});
  assert.match(await page.locator('[data-answer-results]').innerText(),/參考答案：someone/);
  assert.match(await page.locator('[data-answer-count]').innerText(),/共 250 項/);
  assert.deepEqual(errors,[]);
  console.log('PASS: Grammar admin authenticates, fetches the private 250-answer key, and renders answers with explanations.');
}finally{await browser.close();}
