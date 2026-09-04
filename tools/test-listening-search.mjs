import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchEntries,resultHref,highlightedSnippet,loadSearchIndex} from '../listening-search.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const dse=JSON.parse(read('assets/listening/search/dse.json')).entries;
const ielts=JSON.parse(read('assets/listening/search/ielts.json')).entries;
assert.equal(dse.length,44);assert.equal(ielts.length,80);
assert.equal(new Set([...dse,...ielts].map(x=>x.id)).size,124);
const emoji=searchEntries(dse,'EMOJI');
assert.equal(emoji[0].year,2023);assert.equal(emoji[0].part,4);
assert.equal(resultHref(emoji[0]),'listening-system.html?section=dse&year=2023&task=4');
assert.ok(searchEntries(ielts,'carers').some(x=>x.practice===2&&x.part===1));
assert.ok(searchEntries(dse,'2023 emoji').every(x=>x.year===2023));
assert.deepEqual(searchEntries(dse,' '),[]);assert.deepEqual(searchEntries(dse,'qzxqzxzznohit'),[]);
assert.deepEqual(searchEntries([{title:'題目',text:'學習音樂',year:2023,part:1,section:'dse'}],'音樂').length,1);
assert.throws(()=>resultHref({section:'dse',year:'javascript:alert(1)',part:1}));
assert.throws(()=>resultHref({section:'ielts',practice:2,part:5}));
assert.equal(highlightedSnippet('<img src=x> [.* emoji','[.*'), '&lt;img src=x&gt; <mark>[.*</mark> emoji');
assert.ok(highlightedSnippet('Emojis are fun','emoji').includes('<mark>Emoji</mark>s'));
assert.ok(!read('listening-system.js').includes('按圖放大原圖 ↗'));
assert.ok(read('listening-system.html').includes('data-listening-search="dse"'));
assert.ok(read('listening-system.html').includes('data-listening-search="ielts"'));
assert.ok(read('listening-system.js').includes('openDseYear(entry.year,entry.part)'));
assert.ok(read('listening-system.js').includes('openPractice(entry.practice,entry.part)'));
// No network work on import; concurrent searches share one index request; errors are retryable.
let calls=0;const oldFetch=globalThis.fetch;
try{
 globalThis.fetch=async()=>{calls++;return {ok:true,json:async()=>({version:1,entries:dse})};};
 assert.equal(calls,0);
 await Promise.all([loadSearchIndex('dse'),loadSearchIndex('dse')]);assert.equal(calls,1);
 globalThis.fetch=async()=>{calls++;throw Error('offline');};
 await assert.rejects(loadSearchIndex('ielts'));
 globalThis.fetch=async()=>{calls++;return {ok:true,json:async()=>({version:1,entries:ielts})};};
 await loadSearchIndex('ielts');assert.equal(calls,3);
}finally{globalThis.fetch=oldFetch;}
console.log('Listening search: 124 parts, emoji→2023 Task 4, IELTS content, Chinese, direct links, escaped highlights, lazy loading, single-flight and retry passed.');
