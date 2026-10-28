import {shuffled} from './proverb-curation-core.mjs?v=20261028-1';
export const COMPASS_VERSION='2026-10-28.1';
const scoredCount=lesson=>lesson.scoredCount??50;
export function compassStorageKey(owner,lessonId){return `edmund-proverb-compass:${COMPASS_VERSION}:${encodeURIComponent(owner)}:${lessonId}`;}
export function readCompassCache(storage,owner,lessonId){
 const empty={selections:{},bookmarks:{},pending:{},exercise:null};if(!owner)return empty;
 try{const raw=JSON.parse(storage.getItem(compassStorageKey(owner,lessonId))||'{}');for(const field of ['selections','bookmarks','pending'])if(raw[field]&&typeof raw[field]==='object'&&!Array.isArray(raw[field]))empty[field]=raw[field];if(raw.exercise?.lessonId===lessonId)empty.exercise=raw.exercise;}catch{}return empty;
}
export function writeCompassCache(storage,owner,lessonId,cache){if(!owner)return false;try{storage.setItem(compassStorageKey(owner,lessonId),JSON.stringify(cache));return true;}catch{return false;}}
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
