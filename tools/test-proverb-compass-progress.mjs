import test from 'node:test';import assert from 'node:assert/strict';
import {PROVERB_COMPASS} from '../proverb-compass-data.mjs';
import {COMPASS_VERSION,readCompassCache,writeCompassCache,applyCompassAnswer,hydrateCompassSelections,replayPending,reviewedOriginalCount} from '../proverb-compass-progress.mjs';
import {shuffled} from '../proverb-curation-core.mjs';
const lesson=PROVERB_COMPASS['proverb-01'],question=lesson.items[0];
const exercise=()=>({lessonId:lesson.id,correctIds:[],questionState:{},correctionIds:[],collapsedCorrectIds:[]});
test('new correct answers persist their actual wording and version; legacy credit survives a failed retry',()=>{
 const ex=exercise();ex.correctIds.push(question.id);ex.questionState[question.id]={status:'correct',lastAnswer:'legacy answer',reveal:true};
 applyCompassAnswer(ex,question,question.options[1]);assert.deepEqual(ex.correctIds,[question.id]);assert.equal(ex.questionState[question.id].lastAnswer,'legacy answer');assert.equal(reviewedOriginalCount(lesson,ex),0);
 applyCompassAnswer(ex,question,question.options[0]);assert.equal(ex.correctIds.length,1);assert.equal(ex.questionState[question.id].curationVersion,COMPASS_VERSION);assert.equal(reviewedOriginalCount(lesson,ex),1);
 const cache={selections:{[question.id]:-1}};assert.equal(hydrateCompassSelections(lesson,ex,cache)[question.id],shuffled(question.options,question.id).findIndex(o=>o.correct));
});
test('all 150 new keys count once; extension answers never enter original score payloads',()=>{
 for(const l of Object.values(PROVERB_COMPASS)){const ex=exercise();ex.lessonId=l.id;for(const q of l.items){applyCompassAnswer(ex,q,q.options.find(o=>o.correct));applyCompassAnswer(ex,q,q.options.find(o=>o.correct));}assert.equal(ex.correctIds.length,50);assert.equal(Object.keys(ex.questionState).length,50);assert.equal(reviewedOriginalCount(l,ex),50);}
});
test('pending work and bonus selections are isolated by account and survive reopening',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 const index=shuffled(question.options,question.id).findIndex(o=>o.correct),cache={selections:{[question.id]:index,'proverb-01-x01':2},bookmarks:{},pending:{[question.id]:{index,stamp:'retry'}},exercise:exercise()};
 assert(writeCompassCache(storage,'student-A',lesson.id,cache));assert.deepEqual(readCompassCache(storage,'student-B',lesson.id).selections,{});
 const restored=readCompassCache(storage,'student-A',lesson.id),ex=exercise();replayPending(lesson,ex,restored);assert.equal(reviewedOriginalCount(lesson,ex),1);assert.equal(restored.selections['proverb-01-x01'],2);assert.equal(ex.correctIds.length,1);
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.deepEqual(readCompassCache(blocked,'A',lesson.id).pending,{});assert.equal(writeCompassCache(blocked,'A',lesson.id,cache),false);
});
