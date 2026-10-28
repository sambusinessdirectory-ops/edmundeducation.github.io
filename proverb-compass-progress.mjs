import {shuffled} from './proverb-curation-core.mjs?v=20261028-1';
export const COMPASS_VERSION='2026-10-28.1';
const scoredCount=lesson=>lesson.scoredCount??50;
const memoryCache=new Map(), writeQueues=new Map(), hydratedOwners=new Set();
let databasePromise;
function compassDatabase(){
 if(!globalThis.indexedDB)return Promise.reject(new Error('IndexedDB unavailable'));
 if(!databasePromise)databasePromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open('edmund-proverb-compass',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('progress');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('IndexedDB open failed'));
  request.onblocked=()=>reject(new Error('IndexedDB open blocked'));
 }).catch(error=>{databasePromise=undefined;throw error;});
 return databasePromise;
}
function laterThan(first,second){
 try{const a=JSON.parse(first);let b;try{b=JSON.parse(second);}catch{return true;}return Number(a?.savedAt||0)>Number(b?.savedAt||0);}catch{return false;}
}
function storeInDatabase(key,value,onFailure){
 const previous=writeQueues.get(key)||Promise.resolve();
 const task=previous.catch(()=>{}).then(async()=>{
  const db=await compassDatabase();
  await new Promise((resolve,reject)=>{
   const transaction=db.transaction('progress','readwrite');
   transaction.objectStore('progress').put(value,key);
   transaction.oncomplete=resolve;
   transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB write failed'));
   transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB write aborted'));
  });
 });
 writeQueues.set(key,task);
 task.catch(error=>onFailure?.(error));
 task.finally(()=>{if(writeQueues.get(key)===task)writeQueues.delete(key);}).catch(()=>{});
}
export async function flushCompassFallbackWrites(){await Promise.allSettled([...writeQueues.values()]);}
export async function hydrateCompassFallback(owner,lessonIds){
 if(!owner||hydratedOwners.has(owner)||!globalThis.indexedDB)return;
 try{
  const db=await compassDatabase();
  const keys=lessonIds.map(id=>compassStorageKey(owner,id));
  const rows=await Promise.all(keys.map(key=>new Promise((resolve,reject)=>{
   const transaction=db.transaction('progress','readonly');
   const request=transaction.objectStore('progress').get(key);
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error||new Error('IndexedDB read failed'));
  })));
  for(let i=0;i<keys.length;i++)if(typeof rows[i]==='string'&&(!memoryCache.has(keys[i])||laterThan(rows[i],memoryCache.get(keys[i]))))memoryCache.set(keys[i],rows[i]);
  hydratedOwners.add(owner);
 }catch(error){console.warn('Proverb device progress fallback unavailable',error);}
}
export function compassStorageKey(owner,lessonId){return `edmund-proverb-compass:${COMPASS_VERSION}:${encodeURIComponent(owner)}:${lessonId}`;}
export function readCompassCache(storage,owner,lessonId){
 const empty={selections:{},bookmarks:{},pending:{},exercise:null};if(!owner)return empty;
 const key=compassStorageKey(owner,lessonId);let stored='';
 try{stored=storage.getItem(key)||'';}catch{}
 const fallback=memoryCache.get(key)||'';
 try{const raw=JSON.parse(fallback&&(!stored||laterThan(fallback,stored))?fallback:stored||'{}');for(const field of ['selections','bookmarks','pending'])if(raw[field]&&typeof raw[field]==='object'&&!Array.isArray(raw[field]))empty[field]=raw[field];if(raw.exercise?.lessonId===lessonId)empty.exercise=raw.exercise;}catch{}return empty;
}
export function writeCompassCache(storage,owner,lessonId,cache,onFallbackFailure){
 if(!owner)return false;
 const key=compassStorageKey(owner,lessonId),value=JSON.stringify({...cache,savedAt:Date.now()});
 memoryCache.set(key,value);
 let localSaved=false;
 try{storage.setItem(key,value);localSaved=true;}catch{}
 if(globalThis.indexedDB)storeInDatabase(key,value,localSaved?undefined:onFallbackFailure);
 return localSaved||Boolean(globalThis.indexedDB);
}
export function hydrateCompassSelections(lesson,exercise,cache){
 const selections={...cache.selections};for(const q of lesson.items.slice(0,scoredCount(lesson))){const saved=exercise?.questionState?.[q.id];if(saved?.curationVersion!==COMPASS_VERSION)continue;const opts=shuffled(q.options,q.id);const index=opts.findIndex(o=>o.text===saved.lastAnswer);if(index>=0&&(saved.status!=='correct'||opts[index].correct))selections[q.id]=index;}
 return selections;
}
export function applyCompassAnswer(exercise,question,option){
 if(!exercise||question.number>50)return false;
 const wasCorrect=exercise.correctIds.includes(question.id);
 // A failed new-version try must never erase an earned legacy score.
 if(option.correct||!wasCorrect)exercise.questionState[question.id]={status:option.correct?'correct':'wrong',lastAnswer:option.text,reveal:option.correct,curationVersion:COMPASS_VERSION};
 if(option.correct&&!wasCorrect)exercise.correctIds.push(question.id);
 exercise.awaitingNextRound=false;exercise.correctionMode=false;exercise.correctionIds=[];exercise.collapsedCorrectIds=[];
 return true;
}
export function reviewedOriginalCount(lesson,exercise){return lesson.items.slice(0,scoredCount(lesson)).filter(q=>{const s=exercise?.questionState?.[q.id];return s?.status==='correct'&&s.curationVersion===COMPASS_VERSION&&s.lastAnswer===q.options.find(o=>o.correct).text;}).length;}
export function replayPending(lesson,exercise,cache){
 for(const [id,p]of Object.entries(cache.pending)){const q=lesson.items.slice(0,scoredCount(lesson)).find(q=>q.id===id),option=q&&shuffled(q.options,id)[p.index];if(option)applyCompassAnswer(exercise,q,option);}
 return exercise;
}
