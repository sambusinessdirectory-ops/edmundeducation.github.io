#!/usr/bin/env node
import assert from 'node:assert/strict';
import worker from '../../workers/edmund-audio/src/index.js';
const host='https://edmund-neural-audio.edmundeducation.workers.dev';
const key='assets/natural-english/audio/advanced-native/v1/'+'a'.repeat(64)+'.mp3';
const bytes=new Uint8Array(2048).fill(5),calls=[];
const object={size:bytes.length,httpEtag:'"approved-audio"',writeHttpMetadata:headers=>headers.set('Content-Type','audio/mpeg')};
const env={EDMUND_ASSETS:{
 async head(requested){calls.push(requested);return requested===key?object:null;},
 async get(requested,options){calls.push(requested);if(requested!==key)return null;const range=options.range?.get('Range');if(range)return {...object,range:{offset:10,length:20},body:bytes.slice(10,30)};return {...object,body:bytes};}
}};
const full=await worker.fetch(new Request(`${host}/${key}`),env);
assert.equal(full.status,200);assert.equal(full.headers.get('Content-Type'),'audio/mpeg');assert.equal((await full.arrayBuffer()).byteLength,2048);
assert.equal(full.headers.get('Access-Control-Allow-Origin'),'*');
assert.match(full.headers.get('Cache-Control'),/immutable/);
const head=await worker.fetch(new Request(`${host}/${key}`,{method:'HEAD'}),env);
assert.equal(head.status,200);assert.equal(head.headers.get('Content-Length'),'2048');
const range=await worker.fetch(new Request(`${host}/${key}`,{headers:{Range:'bytes=10-29'}}),env);
assert.equal(range.status,206);assert.equal(range.headers.get('Content-Range'),'bytes 10-29/2048');assert.equal((await range.arrayBuffer()).byteLength,20);
const missing=await worker.fetch(new Request(`${host}/${key.replace('a'.repeat(64),'b'.repeat(64))}`),env);assert.equal(missing.status,404);
const before=calls.length;
for(const pathname of ['/assets/natural-english/audio/advanced-native/v1/private.json','/assets/unapproved/test.mp3']){
 const response=await worker.fetch(new Request(host+pathname),env);assert.equal(response.status,404);
}
assert.equal(calls.length,before);
console.log('Advanced Native audio hosting: GET, HEAD, Range, CORS, immutable cache, missing/unsupported assets passed.');
