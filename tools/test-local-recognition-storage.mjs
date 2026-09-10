import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnglishModelStore } from '../speaking-local-transcription.mjs';
function harness({ blocked = false, delayedScript = false } = {}) {
  const models=[],deleted=[],cacheDeleted=[],events=[],scripts=[],timers=new Map();
  let serial=0, request;
  class Model {
    constructor(url){this.url=url;this.listeners={};this.worker={terminate:()=>{this.terminated=true;}};models.push(this);}
    on(name,handler){this.listeners[name]=handler;}
    emit(name,message){this.listeners[name]?.(message);}
  }
  const base=new URL('../',import.meta.url);
  const resources=['assets/speaking-system/models/english-us-0.15.tar.gz?v=old','vendor/vosk/vosk-0.0.8.js','flashcards.html','student-progress.json'].map(path=>({url:new URL(path,base).href}));
  const scope={
    Vosk:delayedScript?undefined:{Model},
    document:{createElement:()=>({}),head:{append:script=>scripts.push(script)}},
    Event:class {constructor(type){this.type=type;}},dispatchEvent:event=>events.push(event.type),
    setTimeout:(callback)=>{timers.set(++serial,callback);return serial;},clearTimeout:id=>timers.delete(id),
    indexedDB:{deleteDatabase:name=>{deleted.push(name);request={};if(!blocked)queueMicrotask(()=>request.onsuccess());return request;}},
    caches:{keys:async()=>['site-cache'],open:async()=>({keys:async()=>resources,delete:async request=>{cacheDeleted.push(request.url);return true;}})}
  };
  return {scope,store:createEnglishModelStore(scope),models,deleted,cacheDeleted,events,scripts,timers,Model,completeDelete:()=>request.onsuccess()};
}
test('deletes only recognition data, unloads worker, and permits a fresh model',async()=>{
  const h=harness(),first=h.store.load();h.models[0].emit('load',{result:true});await first;
  assert.equal(h.store.load(),first);await h.store.remove();
  assert.equal(h.models[0].terminated,true);assert.deepEqual(h.deleted,['/vosk']);
  assert.equal(h.cacheDeleted.length,2);assert.ok(h.cacheDeleted.every(url=>!url.includes('student-progress')&&!url.includes('flashcards.html')));
  assert.deepEqual(h.events,['edmund-local-model-removed']);
  const second=h.store.load();assert.notEqual(second,first);assert.equal(h.models.length,2);
  h.models[1].emit('load',{result:true});assert.equal(await second,h.models[1]);assert.equal(h.timers.size,0);
});
test('deleting while downloading rejects pending load and ignores late completion',async()=>{
  const h=harness(),pending=h.store.load(),rejected=assert.rejects(pending,{name:'AbortError'});
  await h.store.remove();await rejected;assert.equal(h.models[0].terminated,true);
  h.models[0].emit('load',{result:true});const fresh=h.store.load();h.models[1].emit('load',{result:true});assert.equal(await fresh,h.models[1]);
});
test('deletion before library load cannot start a late model download',async()=>{
  const h=harness({delayedScript:true}),pending=h.store.load(),rejected=assert.rejects(pending,{name:'AbortError'});
  await h.store.remove();await rejected;h.scope.Vosk={Model:h.Model};h.scripts[0].onload();await Promise.resolve();await Promise.resolve();
  assert.equal(h.models.length,0);
});
test('blocked deletion never reports success, disallows concurrent loads, and can retry',async()=>{
  const h=harness({blocked:true}),pending=h.store.remove();
  assert.equal(h.store.remove(),pending);await assert.rejects(h.store.load(),/being deleted/);
  const rejected=assert.rejects(pending,/Close other/);[...h.timers.values()][0]();await rejected;
  const retry=h.store.remove();h.completeDelete();await retry;
});
test('load failures release the worker and allow retry instead of hanging forever',async()=>{
  const h=harness(),pending=h.store.load(),rejected=assert.rejects(pending,/Could not load/);
  h.models[0].emit('error',{});await rejected;assert.equal(h.models[0].terminated,true);
  const fresh=h.store.load();h.models[1].emit('load',{result:true});await fresh;
});
test('another tab can release its model before deletion closes IndexedDB',async()=>{
  const h=harness();let channel;
  h.scope.BroadcastChannel=class{constructor(name){assert.equal(name,'edmund-local-recognition-storage');channel=this;}postMessage(data){this.sent=data;}};
  const store=createEnglishModelStore(h.scope),pending=store.load(),rejected=assert.rejects(pending,{name:'AbortError'});
  channel.onmessage({data:'release'});await rejected;assert.equal(h.models[0].terminated,true);
  await store.remove();assert.equal(channel.sent,'release');
});
