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
    const m = {favourite:old?.favourite||false,sort_order:old?.sort_order||0,updated_at:new Date().toISOString(),id:p.p_id,title:p.p_title,sections:p.p_sections,version:old ? old.version + (JSON.stringify(old.sections) === JSON.stringify(p.p_sections) ? 0 : 1) : 1};
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
  } else if (name === 'execution_speedrun_library_update') {
    const meter = meters.find(m => m.id === p.p_id);
    if (p.p_action === 'favourite') meter.favourite = p.p_favourite;
    else {
      const ordered = [...meters].sort((a,b) => a.sort_order-b.sort_order || b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id));
      const index=ordered.findIndex(m => m.id===p.p_id), other=index+(p.p_action==='up' ? -1 : 1);
      if (ordered[other]) {[ordered[index],ordered[other]]=[ordered[other],ordered[index]];ordered.forEach((m,i) => m.sort_order=i+1);}
    }
    data = null;
  } else if (name === 'execution_speedrun_records') {
    const records = runs.filter(r => !p.p_meter_id || r.meter_id===p.p_meter_id).toReversed();
    data={history:records.slice(p.p_offset,p.p_offset+30),history_count:records.length};
  } else if (name === 'execution_speedrun_delete') {
    runs=runs.filter(r => p.p_kind==='meter' ? r.meter_id!==p.p_id : r.id!==p.p_id);
    if(p.p_kind==='meter')meters=meters.filter(m => m.id!==p.p_id);
    data=null;
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
  await page.locator('[data-float]').click();
  await page.locator('[data-start]').click();
  await page.waitForFunction(() => document.querySelector('[data-sync]').textContent.includes('所有計時操作已同步'));
  const remote = runs.find(r => r.status === 'running');
  remote.status = 'paused'; remote.anchor_at = null; remote.elapsed_ms = 1000; remote.revision++;
  await page.locator('[data-split]').click();
  await page.locator('[data-latest]').waitFor({state:'visible'});
  const download = page.waitForEvent('download');
  await page.locator('[data-latest]').click(); await download;
  await page.waitForFunction(() => document.querySelector('[data-pause]').textContent === '繼續');
  assert.equal(await page.locator('[data-latest]').isVisible(),false);
  assert.ok(await page.evaluate(() => Object.keys(localStorage).some(k => k.includes(':conflict:'))));
  // New library, standalone-section, column width and deletion journeys.
  await page.locator('[data-end]').click(); await page.locator('[data-confirm-end]').click();
  await page.waitForFunction(() => document.querySelector('[data-start]').disabled === false);
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('[data-new]').first().click();
  await page.locator('[name=title]').fill('Zulu French learning');
  await page.locator('[data-section-title="0"]').fill('Find website');
  await page.locator('[data-remove-item="0:0"]').click();
  await page.locator('[data-section-time="0"]').fill('1:30');
  await page.locator('[data-add-section]').click();
  await page.locator('[data-section-title="1"]').fill('Extract text');
  await page.locator('[data-item-title="1:0"]').fill('Read text');
  await page.locator('[data-item-time="1:0"]').fill('0:05');
  assert.equal(await page.locator('[data-editor-total]').textContent(),'1:35');
  await page.locator('[data-save]').click(); await page.locator('[data-selected]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-split-index]').count(),2);
  assert.equal(await page.locator('[data-split-index="0"] .split-name').textContent(),'Find website');
  assert.equal(await page.locator('[data-section-start]').count(),1);
  await page.locator('[data-start]').click(); await page.locator('[data-split]').click(); await page.locator('[data-split]').click();
  await page.waitForFunction(() => document.querySelector('[data-stat="completed"]').textContent==='1');
  const zulu=meters.find(m => m.title==='Zulu French learning');
  await page.locator(`[data-library-action="favourite"][data-id="${zulu.id}"]`).click();
  await page.waitForFunction(id => document.querySelector(`[data-library-action="favourite"][data-id="${id}"]`).getAttribute('aria-pressed')==='true',zulu.id);
  for(let i=0;i<4;i++) {
    const handle=page.locator(`[data-column-resize="${i}"]`); await handle.scrollIntoViewIfNeeded();
    const r=await handle.boundingBox();
    await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+30,r.y+r.height/2,{steps:3});await page.mouse.up();
  }
  const columns=await page.locator('[data-race-meter]').evaluate(el => el.style.getPropertyValue('--speedrun-columns'));
  assert.ok(columns.includes('px'));
  await page.locator('[data-float]').click();await page.locator('[data-float]').click();
  assert.equal(await page.locator('[data-race-meter]').evaluate(el => el.style.getPropertyValue('--speedrun-columns')),columns);
  await page.reload();await page.locator('[data-app]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-race-meter]').evaluate(el => el.style.getPropertyValue('--speedrun-columns')),columns);
  await page.locator('[data-new]').first().click();
  await page.locator('[name=title]').fill('Alpha single section');
  await page.locator('[data-section-title="0"]').fill('Read');
  await page.locator('[data-remove-item="0:0"]').click();await page.locator('[data-section-time="0"]').fill('1:00');
  await page.locator('[data-save]').click();await page.locator('[data-selected]').waitFor({state:'visible'});
  await page.waitForFunction(() => !document.querySelector('[data-start]').disabled);
  await page.locator('[data-start]').click();await page.locator('[data-split]').click();
  await page.waitForFunction(() => document.querySelector('[data-run-status]').textContent==='挑戰完成');
  await page.waitForFunction(() => !document.querySelector('[data-start]').disabled);
  const initial=await page.locator('[data-meter-id] strong').allTextContents();
  await page.locator('[data-library-action="down"]').first().click();
  await page.waitForFunction(first => document.querySelector('[data-meter-id] strong').textContent !== first,initial[0]);
  const custom=await page.locator('[data-meter-id] strong').allTextContents();
  await page.reload();await page.locator('[data-app]').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('[data-meter-id] strong').allTextContents(),custom);
  await page.locator('[data-sort]').selectOption('alpha');
  assert.equal(await page.locator('[data-meter-id] strong').first().textContent(),'Alpha single section');
  await page.reload();await page.locator('[data-app]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-sort]').inputValue(),'alpha');
  await page.locator('[data-sort]').selectOption('custom');
  await page.screenshot({path:`${output}/library-v2.png`,fullPage:true});
  await page.locator('[data-page="favourites"]').click();await page.locator('[data-app]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-meter-id]').count(),1);
  assert.equal(await page.locator('[data-meter-id] strong').textContent(),'Zulu French learning');
  await page.locator('[data-library-action="favourite"]').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-meter-id]').length===0);
  await page.locator('[data-page="records"]').click();await page.locator('[data-app]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-history] details').count(),runs.length);
  await page.locator('[data-records-filter]').selectOption(zulu.id);
  await page.waitForFunction(() => document.querySelectorAll('[data-history] details').length===1);
  await page.locator('[data-history] summary').click();
  await page.screenshot({path:`${output}/records-v2.png`,fullPage:true});
  await page.locator('[data-delete-run]').click();await page.locator('[data-cancel-delete]').click();
  assert.equal(await page.locator('[data-history] details').count(),1);
  await page.locator('[data-delete-run]').click();await page.locator('[data-confirm-delete]').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-history] details').length===0);
  assert.equal(runs.filter(r => r.meter_id===zulu.id).length,0);
  await page.locator('[data-page="all"]').click();await page.locator('[data-app]').waitFor({state:'visible'});
  await page.locator(`[data-meter-id="${zulu.id}"]`).click();
  await page.waitForFunction(() => document.querySelector('[data-selected-title]').textContent==='Zulu French learning');
  assert.equal(await page.locator('[data-stat="completed"]').textContent(),'0');
  const original=meters.find(m => m.title==='英文閱讀挑戰');
  await page.locator(`[data-delete-meter="${original.id}"]`).click();
  assert.match(await page.locator('[data-delete-copy]').textContent(),/所有歷史嘗試/);
  await page.locator('[data-confirm-delete]').click();
  await page.waitForFunction(id => !document.querySelector(`[data-meter-id="${id}"]`),original.id);
  assert.ok(!meters.some(m => m.id===original.id));assert.ok(!runs.some(r => r.meter_id===original.id));
  assert.ok(meters.some(m => m.id===zulu.id));
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${output}/mobile-v2.png`,fullPage:true});

  assert.deepEqual(errors,[]);
  console.log('Browser QA passed: standalone and nested sections, favourites, custom/A–Z ordering, records filtering/deletion, column widths and persistence, split timing, offline/conflict recovery, floating resize, desktop and mobile.');
} finally { await browser.close(); }
