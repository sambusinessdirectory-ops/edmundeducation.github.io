// UI integration test with an isolated RPC fake; SQL integration is tested separately.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { transition } from '../execution-speedrun-core.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const output = process.env.SPEEDRUN_QA_DIR || '/tmp/execution-speedrun-qa';
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
let meters = [], runs = [], offline = false;
const events = new Set(), errors = [];
await context.exposeFunction('__qaRpc',async (name,p) => {
  if (offline && name.startsWith('execution_speedrun')) return {data:null,error:{message:'Simulated network outage'}};
  let data;
  if (name === 'execution_system_admin_me') data = [{id:'qa-admin',name:'測試帳戶'}];
  else if (name === 'execution_speedrun_meter_save') {
    const old = meters.find(m => m.id === p.p_id);
    const m = {id:p.p_id,title:p.p_title,sections:p.p_sections,version:old ? old.version + (JSON.stringify(old.sections) === JSON.stringify(p.p_sections) ? 0 : 1) : 1};
    meters = [m,...meters.filter(m => m.id !== p.p_id)]; data = m;
  } else if (name === 'execution_speedrun_start') {
    const m = meters.find(m => m.id === p.p_meter_id);
    data = runs.find(r => r.id === p.p_id);
    if (!data) { data = {id:p.p_id,meter_id:m.id,meter_version:m.version,title:m.title,sections:structuredClone(m.sections),status:'running',elapsed_ms:0,splits:[],anchor_at:p.p_at,started_at:p.p_at,ended_at:null,revision:0}; runs.push(data); }
  } else if (name === 'execution_speedrun_event') {
    const index = runs.findIndex(r => r.id === p.p_run_id);
    if (!events.has(p.p_id)) {
      const old = runs[index];
      if (old.revision !== p.p_revision) return {data:null,error:{code:'40001',message:'Stale revision'}};
      const adjusted = {...old,elapsed_ms:p.p_elapsed_ms,anchor_at:old.status === 'running' ? p.p_at : null};
      runs[index] = transition(adjusted,p.p_action,Date.parse(p.p_at)); events.add(p.p_id);
    }
    data = runs[index];
  } else if (name === 'execution_speedrun_load') {
    const active = runs.find(r => ['running','paused'].includes(r.status)) || null;
    const m = meters.find(m => m.id === (p.p_meter_id || active?.meter_id)) || meters[0];
    const history = runs.filter(r => r.meter_id === m?.id && ['completed','ended'].includes(r.status)).toReversed();
    const complete = history.filter(r => r.meter_version === m?.version && r.status === 'completed');
    const best_segments = [];
    history.filter(r => r.meter_version === m?.version).forEach(r => r.splits.forEach((s,i) => { best_segments[i] = Math.min(best_segments[i] ?? Infinity,s.elapsed_ms); }));
    data = {meters,active,selected_id:m?.id,history:history.slice(p.p_offset,p.p_offset+30),history_count:history.length,stats:{completed:complete.length,fastest:complete.length ? Math.min(...complete.map(r => r.elapsed_ms)) : null,slowest:complete.length ? Math.max(...complete.map(r => r.elapsed_ms)) : null,average:complete.length ? complete.reduce((n,r) => n+r.elapsed_ms,0)/complete.length : null,best_segments}};
  } else data = [];
  return {data:structuredClone(data),error:null};
});
await context.addInitScript(() => {
  sessionStorage.setItem('edmund-execution-system-session-v1',JSON.stringify({role:'admin',token:'qa-token'}));
  window.supabase = {createClient:() => ({auth:{getSession:async () => ({data:{session:{user:{id:'qa'}}}}),onAuthStateChange:() => ({data:{subscription:{unsubscribe(){}}}})},rpc:window.__qaRpc})};
});
await context.route('https://**/*',route => route.abort());
const page = await context.newPage(); page.on('pageerror',e => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:8765/execution-speedrun.html');
  await page.locator('[data-app]').waitFor({state:'visible'});
  await page.locator('[data-new]').first().click();
  await page.locator('[name=title]').fill('英文閱讀挑戰');
  await page.locator('[data-section-title="0"]').fill('閱讀理解');
  await page.locator('[data-item-title="0:0"]').fill('閱讀文章');
  await page.locator('[data-item-time="0:0"]').fill('0:01');
  await page.locator('[data-add-item="0"]').click();
  await page.locator('[data-item-title="0:1"]').fill('回答問題');
  await page.locator('[data-item-time="0:1"]').fill('5:00');
  await page.locator('[data-add-section]').click();
  await page.locator('[data-section-title="1"]').fill('檢查');
  await page.locator('[data-item-title="1:0"]').fill('核對答案');
  await page.locator('[data-item-time="1:0"]').fill('2:00');
  assert.equal(await page.locator('[data-editor-total]').textContent(),'7:01');
  await page.locator('[data-save]').click();
  await page.locator('[data-selected]').waitFor({state:'visible'});
  await page.locator('[data-start]').click();
  await page.waitForFunction(() => document.querySelector('[data-clock]').textContent.startsWith('0:01'));
  await page.locator('[data-split]').click();
  assert.ok((await page.locator('[data-split-index="0"] [data-delta]').getAttribute('class')).includes('behind'));
  await page.locator('[data-pause]').click();
  const frozen = await page.locator('[data-clock]').textContent();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('[data-clock]').textContent(),frozen);
  await page.reload(); await page.locator('[data-app]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-pause]').textContent(),'繼續');
  assert.equal(await page.locator('[data-clock]').textContent(),frozen);
  await page.locator('[data-pause]').click();
  await page.locator('[data-split]').click();
  assert.ok((await page.locator('[data-split-index="1"] [data-delta]').getAttribute('class')).includes('ahead'));
  await page.locator('[data-float]').click();
  const before = await page.locator('[data-race-meter]').boundingBox();
  const handle = await page.locator('[data-drag]').boundingBox();
  await page.mouse.move(handle.x+80,handle.y+25); await page.mouse.down(); await page.mouse.move(handle.x-120,handle.y+75,{steps:5}); await page.mouse.up();
  const moved = await page.locator('[data-race-meter]').boundingBox();
  assert.ok(moved.x < before.x-100); assert.ok(moved.y > before.y);
  for (const corner of ['nw','ne','sw','se']) {
    const previous = await page.locator('[data-race-meter]').boundingBox();
    const h = await page.locator(`[data-corner="${corner}"]`).boundingBox();
    await page.mouse.move(h.x+h.width/2,h.y+h.height/2); await page.mouse.down();
    await page.mouse.move(h.x+h.width/2+(corner.includes('w') ? -15 : 15),h.y+h.height/2+(corner.includes('n') ? -12 : 12),{steps:3}); await page.mouse.up();
    const next = await page.locator('[data-race-meter]').boundingBox();
    assert.ok(next.width>previous.width,`${corner} width`); assert.ok(next.height>previous.height,`${corner} height`);
  }
  await page.screenshot({path:`${output}/floating-desktop.png`,fullPage:true});
  await page.locator('[data-float]').click();
  await page.locator('[data-split]').click();
  await page.waitForFunction(() => document.querySelector('[data-stat="completed"]').textContent === '1');
  await page.locator('[data-start]').click();
  offline = true;
  await page.locator('[data-split]').click();
  await page.locator('[data-end]').click(); await page.locator('[data-confirm-end]').click();
  await page.waitForFunction(() => document.querySelector('[data-sync-bar]').dataset.state === 'error');
  assert.ok(await page.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('edmund-speedrun-recovery'))));
  offline = false;
  await page.locator('[data-retry]').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-history] details').length === 2);
  assert.equal(await page.locator('[data-stat="completed"]').textContent(),'1');
  await page.locator('[data-history] summary').first().click();
  assert.match(await page.locator('[data-history]').textContent(),/未完成/);
  await page.screenshot({path:`${output}/desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
  await page.screenshot({path:`${output}/mobile.png`,fullPage:true});
  await page.locator('[data-float]').click();
  const mobile = await page.locator('[data-race-meter]').boundingBox();
  assert.ok(mobile.x>=0 && mobile.x+mobile.width<=390 && mobile.y+mobile.height<=844);
  await page.screenshot({path:`${output}/floating-mobile.png`});
  assert.deepEqual(errors,[]);
  console.log('Browser QA passed: editor, totals, split colors, pause/reload/resume, history, offline retry, four-corner resize, desktop and mobile.');
} finally { await browser.close(); }
