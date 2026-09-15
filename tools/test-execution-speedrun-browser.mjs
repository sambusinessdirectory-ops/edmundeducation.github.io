// UI integration test with an isolated RPC fake; SQL integration is tested separately.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import {mapperSections} from '../execution-time-mapper-core.mjs';
import { transition } from '../execution-speedrun-core.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const output = process.env.SPEEDRUN_QA_DIR || '/tmp/execution-speedrun-qa';
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
let meters = [], runs = [], offline = false, blockChallengeSync = false;
const events = new Set(), errors = [];
await context.exposeFunction('__qaRpc',async (name,p) => {
  if (offline && name.startsWith('execution_speedrun') || blockChallengeSync && ['execution_speedrun_start','execution_speedrun_event'].includes(name)) return {data:null,error:{message:'Simulated network outage'}};
  let data;
  if (name === 'execution_system_admin_me') data = [{id:'qa-admin',name:'測試帳戶'}];
  else if (name === 'execution_speedrun_meter_save') {
    const old = meters.find(m => m.id === p.p_id);
    const m = {favourite:old?.favourite||false,sort_order:old?.sort_order||0,updated_at:new Date().toISOString(),id:p.p_id,title:p.p_title,sections:p.p_sections,version:old ? old.version + (JSON.stringify(old.sections) === JSON.stringify(p.p_sections) ? 0 : 1) : 1};
    meters = [m,...meters.filter(m => m.id !== p.p_id)]; data = m;
  } else if(name==='execution_speedrun_mapper_save') {
    let r=runs.find(r=>r.id===p.p_run_id);
    if(!r){
      const m={id:p.p_id,title:p.p_title,sections:p.p_sections,version:1,sort_order:0,favourite:false,updated_at:new Date().toISOString()};meters.unshift(m);
      r={id:p.p_run_id,meter_id:m.id,title:m.title,sections:m.sections,meter_version:1,status:'completed',source:'mapper',elapsed_ms:p.p_splits.reduce((n,s)=>n+s.elapsed_ms,0),splits:p.p_splits.map(s=>({elapsed_ms:s.elapsed_ms,completed:true})),started_at:p.p_splits[0].started_at,ended_at:p.p_splits.at(-1).ended_at,revision:p.p_splits.length};runs.push(r);
    }
    data={id:r.meter_id,run_id:r.id};
  } else if(name==='execution_speedrun_mapper_open') {
    const r=runs.find(r=>r.id===p.p_run_id),m=meters.find(m=>m.id===r.meter_id);
    let n=0;
    data={id:m.id,run_id:r.id,title:m.title,base_revision:r.revision,meter_updated_at:m.updated_at,current:null,inputs:{main:'',sub:'',choice:'same'},parts:r.mapper_parts||r.sections.flatMap(section=>(section.items.length ? section.items : [section]).map(item=>({id:section.items.length ? item.id : `part-${section.id}`,section_id:section.id,section_title:section.title,title:section.items.length ? item.title : null,elapsed_ms:r.splits[n++].elapsed_ms,anchor:null,started_at:r.started_at,ended_at:r.ended_at})))};
  } else if(name==='execution_speedrun_mapper_update') {
    const r=runs.find(r=>r.id===p.p_run_id),m=meters.find(m=>m.id===r.meter_id);
    if(r.mapper_request!==p.p_request_id) {
      assert.equal(p.p_revision,r.revision);
      m.sections=mapperSections(p.p_parts);m.version++;m.updated_at=new Date().toISOString();
      Object.assign(r,{sections:m.sections,meter_version:m.version,mapper_parts:p.p_parts,mapper_request:p.p_request_id,revision:r.revision+1,elapsed_ms:p.p_parts.reduce((n,x)=>n+x.elapsed_ms,0),splits:p.p_parts.map(x=>({elapsed_ms:x.elapsed_ms,completed:true}))});
    }
    data={id:m.id,run_id:r.id};
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

  // Time Mapper: standalone, same-section conversion, new nested and standalone
  // sections, immediate split freeze, pause, reload recovery and offline retry.
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('[data-mapper-open]').click();
  await page.locator('[data-map-title]').fill('Measured learning');
  await page.locator('[data-map-main]').fill('Reading');
  await page.locator('[data-map-go]').click();
  await page.waitForTimeout(1100);
  await page.locator('[data-map-next]').click();
  const mappedTime=await page.locator('[data-map-total]').textContent();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('[data-map-total]').textContent(),mappedTime);
  assert.equal(await page.locator('[data-map-convert]').isVisible(),true);
  await page.locator('[data-map-sub]').fill('Answer');
  await page.locator('[data-map-go]').click();
  await page.waitForTimeout(250);await page.locator('[data-map-pause]').click();
  const mapperFrozen=await page.locator('[data-map-clock]').textContent();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('[data-map-clock]').textContent(),mapperFrozen);
  await page.locator('[data-map-close]').click();
  await page.reload();await page.locator('[data-app]').waitFor({state:'visible'});
  await page.locator('[data-mapper-open]').click();
  assert.equal(await page.locator('[data-map-clock]').textContent(),mapperFrozen);
  await page.locator('[data-map-pause]').click();await page.waitForTimeout(100);
  await page.locator('[data-map-next]').click();
  assert.equal(await page.locator('.mapper-section>div').count(),2);
  await page.locator('[data-map-choice]').selectOption('new');
  await page.locator('[data-map-main]').fill('Review');await page.locator('[data-map-sub]').fill('Vocabulary');
  await page.locator('[data-map-go]').click();await page.waitForTimeout(150);await page.locator('[data-map-next]').click();
  await page.locator('[data-map-choice]').selectOption('new');
  await page.locator('[data-map-main]').fill('Check');await page.locator('[data-map-go]').click();
  await page.waitForTimeout(200);
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.querySelector('[data-mapper]').scrollWidth<=document.querySelector('[data-mapper]').clientWidth));
  await page.screenshot({path:`${output}/mapper-mobile.png`,fullPage:true});
  offline=true;await page.locator('[data-map-finish]').click();
  await page.locator('[data-map-error]').waitFor({state:'visible'});
  const savedCount=await page.locator('[data-map-count]').textContent();
  assert.equal(savedCount,'（4）');
  offline=false;await page.locator('[data-map-finish]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-mapper]').open);
  await page.waitForFunction(()=>document.querySelector('[data-selected-title]').textContent==='Measured learning');
  const mapped=meters.find(m=>m.title==='Measured learning');
  assert.equal(mapped.sections.length,3);assert.equal(mapped.sections[0].items.length,2);
  assert.equal(mapped.sections[1].items.length,1);assert.equal(mapped.sections[2].items.length,0);
  const mappedRun=runs.find(r=>r.meter_id===mapped.id);
  assert.equal(mappedRun.splits.length,4);assert.equal(mappedRun.status,'completed');
  assert.ok(mappedRun.elapsed_ms<4000,'Naming and paused time must be excluded');
  assert.equal(await page.locator('[data-stat="completed"]').textContent(),'1');
  assert.match(await page.locator('[data-history]').textContent(),/Time Mapper/);
  await page.locator('[data-start]').click();await page.locator('[data-end]').click();await page.locator('[data-confirm-end]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-start]').hidden);
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('[data-mapper-open]').click();
  assert.equal(await page.locator('[data-map-title]').inputValue(),'');
  await page.screenshot({path:`${output}/mapper-desktop.png`,fullPage:true});
  await page.locator('[data-map-title]').fill('First nested mapping');
  await page.locator('[data-map-main]').fill('Main');await page.locator('[data-map-sub]').fill('First subsection');
  await page.locator('[data-map-go]').click();await page.waitForTimeout(100);
  await page.reload();await page.locator('[data-app]').waitFor({state:'visible'});
  await page.locator('[data-mapper-open]').click();
  assert.equal(await page.locator('[data-map-status]').textContent(),'正在測量本項時間');
  await page.locator('[data-map-next]').click();
  const beforeFinish=await page.locator('[data-map-total]').textContent();
  await page.waitForTimeout(200);await page.locator('[data-map-finish]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-mapper]').open);
  const firstNested=meters.find(m=>m.title==='First nested mapping');
  assert.equal(firstNested.sections[0].items[0].title,'First subsection');
  assert.equal(runs.find(r=>r.meter_id===firstNested.id).splits.length,1,'Finish while naming must not append a phantom split');

  // Reopen a finished mapping, resume an earlier part, insert in an earlier main
  // section, and save back to the same attempt after an offline failure.
  await page.locator('[data-history] summary').first().click();
  const continuation=runs.find(r=>r.meter_id===firstNested.id), previousTime=continuation.elapsed_ms;
  await page.locator(`[data-continue-mapper="${continuation.id}"]`).click();
  await page.locator('[data-map-continue="0"]').click();await page.waitForTimeout(160);
  await page.locator('[data-map-next]').click();
  await page.locator('[data-map-choice]').selectOption('new');
  await page.locator('[data-map-main]').fill('Later section');await page.locator('[data-map-go]').click();
  await page.waitForTimeout(100);await page.locator('[data-map-next]').click();
  await page.locator('[data-map-choice]').selectOption(firstNested.sections[0].id);
  await page.locator('[data-map-sub]').fill('Extra earlier subsection');await page.locator('[data-map-go]').click();
  await page.waitForTimeout(100);await page.locator('[data-map-next]').click();
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.querySelector('[data-mapper]').scrollWidth<=document.querySelector('[data-mapper]').clientWidth));
  await page.screenshot({path:`${output}/mapper-continue-mobile.png`,fullPage:true});
  offline=true;await page.locator('[data-map-finish]').click();await page.locator('[data-map-error]').waitFor({state:'visible'});
  offline=false;await page.locator('[data-map-finish]').click();
  await page.waitForFunction(()=>!document.querySelector('[data-mapper]').open);
  assert.equal(runs.filter(r=>r.meter_id===firstNested.id).length,1);
  assert.ok(continuation.elapsed_ms>previousTime && continuation.elapsed_ms<previousTime+2000);
  assert.equal(continuation.sections[0].items.length,2);
  assert.equal(continuation.sections[0].items[1].title,'Extra earlier subsection');
  assert.equal(continuation.sections[1].title,'Later section');
  assert.equal(continuation.splits.length,3);
  await page.locator('[data-history] summary').first().click();
  await page.locator(`[data-continue-mapper="${continuation.id}"]`).click();
  assert.equal(await page.locator('[data-map-count]').textContent(),'（3）');
  await page.locator('[data-map-close]').click();

  await page.locator('[data-page="records"]').click();await page.locator('[data-app]').waitFor({state:'visible'});
  await page.locator(`details:has([data-continue-mapper="${continuation.id}"]) summary`).click();
  await page.locator(`[data-continue-mapper="${continuation.id}"]`).click();
  await page.locator('[data-mapper][open]').waitFor();
  assert.equal(await page.locator('[data-map-count]').textContent(),'（3）');
  await page.locator('[data-map-close]').click();
  // Mapper remains usable with an editor draft, pending challenge sync, or
  // a different tab owning the challenge timer. Saving must preserve that work.
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('[data-mapper-open]').click();
  page.once('dialog',d=>d.accept());
  await page.locator('[data-map-discard]').click();
  await page.locator('[data-new]').first().click();
  await page.locator('[name=title]').fill('Keep this editor draft');
  await page.locator('[data-section-title="0"]').fill('Unfinished editor section');
  async function saveIndependentMapping(target,title) {
    await target.locator('[data-mapper-open]').click();
    await target.locator('[data-mapper][open]').waitFor();
    await target.locator('[data-map-title]').fill(title);
    await target.locator('[data-map-main]').fill('Independent task');
    await target.locator('[data-map-go]').click();
    await target.waitForTimeout(120);
    await target.locator('[data-map-finish]').click();
    await target.waitForFunction(()=>!document.querySelector('[data-mapper]').open);
  }
  await saveIndependentMapping(page,'Mapping alongside an editor');
  assert.equal(await page.locator('[data-editor]').isVisible(),true);
  assert.equal(await page.locator('[name=title]').inputValue(),'Keep this editor draft');
  assert.equal(await page.locator('[data-section-title="0"]').inputValue(),'Unfinished editor section');
  await page.locator('[data-cancel-edit]').click();
  await page.locator('[data-start]').click();
  await page.waitForFunction(()=>document.querySelector('[data-sync]').textContent.includes('所有計時操作已同步'));
  const parallelChallenge=runs.find(r=>r.status==='running');
  blockChallengeSync=true;
  await page.locator('[data-pause]').click();
  await page.waitForFunction(()=>document.querySelector('[data-sync-bar]').dataset.state==='error');
  const pendingBefore=await page.evaluate(()=>localStorage.getItem('edmund-speedrun-recovery-v1:admin:qa-admin'));
  assert.equal(JSON.parse(pendingBefore).queue.length,1);
  await saveIndependentMapping(page,'Mapping alongside unsynced challenge');
  assert.equal(await page.evaluate(()=>localStorage.getItem('edmund-speedrun-recovery-v1:admin:qa-admin')),pendingBefore);
  assert.equal(await page.locator('[data-pause]').textContent(),'繼續');
  blockChallengeSync=false;
  await page.locator('[data-retry]').click();
  await page.waitForFunction(()=>document.querySelector('[data-sync]').textContent.includes('所有計時操作已同步'));
  assert.equal(runs.find(r=>r.id===parallelChallenge.id).status,'paused');

  const second=await context.newPage();second.on('pageerror',e=>errors.push(e.message));
  await second.goto(`http://127.0.0.1:8765/execution-speedrun.html?mapper=${continuation.id}`);
  await second.locator('[data-mapper][open]').waitFor();
  assert.equal(await second.locator('[data-start]').isDisabled(),true,'Challenge ownership remains in the first tab');
  await second.locator('[data-map-continue="0"]').click();await second.waitForTimeout(120);
  await second.locator('[data-map-finish]').click();
  await second.waitForFunction(()=>!document.querySelector('[data-mapper]').open);
  assert.equal(runs.find(r=>r.id===parallelChallenge.id).status,'paused');
  await saveIndependentMapping(second,'Mapping from another timer tab');
  assert.equal(runs.find(r=>r.id===parallelChallenge.id).status,'paused');
  await second.close();
  await page.locator('[data-pause]').click();
  await page.waitForFunction(()=>document.querySelector('[data-sync]').textContent.includes('所有計時操作已同步'));
  assert.equal(runs.find(r=>r.id===parallelChallenge.id).status,'running','The original challenge still resumes normally');

  assert.deepEqual(errors,[]);
  console.log('Browser QA passed: saved mapping continuation, same-attempt updates, earlier-section insertion, records-page reopening, Time Mapper creation, mapping hierarchy, immediate freeze, running and paused refresh recovery, finish while naming, offline retry, mobile layout; standalone and nested sections, favourites, custom/A–Z ordering, records filtering/deletion, column widths and persistence, split timing, offline/conflict recovery, floating resize, desktop and mobile.');
} finally { await browser.close(); }
