#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const reader=path.join(root,'paper3/2023-b2/curation');
const source=fs.readFileSync(path.join(reader,'manual-verbatim.js'),'utf8');
const manualBaseRows23=Array.from({length:49},(_,index)=>({stage:3,p:index<8?5:index<17?6:index<24?7:index<31?8:index<41?9:10,t:5,q:`source-${index+1}`,a:'legacy'}));
const rows=[...manualBaseRows23];
vm.runInNewContext(source,{manualBaseRows23,rows,Error},{filename:'manual-verbatim.js'});

assert.equal(manualBaseRows23.length,49,'the manual must contain exactly 49 authored Data File units');
assert.deepEqual(manualBaseRows23.map(row=>row.manualPdfPage),[
  28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,42,43,44,45,46,47,48,50,51,
  52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76
],'manual PDF page mapping must preserve shared and continued pages');
for(const [index,row] of manualBaseRows23.entries()){
  assert.equal(row.origin,'manual',`unit ${index+1} must retain manual provenance`);
  assert.match(row.manualType,/^類型：/,`unit ${index+1} needs the authored type line`);
  assert.ok(Array.isArray(row.manualAnalysis)&&row.manualAnalysis.length>=2,`unit ${index+1} needs every authored analysis bullet`);
  assert.equal(row.a,row.manualAnalysis.join('\n'),`unit ${index+1} must render the verbatim analysis without a paraphrase`);
}

const mary=manualBaseRows23[22];
assert.equal(mary.manualPdfPage,50);
assert.equal(mary.manualType,'類型：3 Task 3 直接可用');
assert.deepEqual(Array.from(mary.manualAnalysis),[
  '這一段是 Task 3 的關鍵更新。',
  '原 storyboard 設定：每集有一位不同的 mystery guest。',
  'William 在聊天中說 Mary Steward 想擔任 co-star；Archie 同意改動，並表示確認後要把她寫進宣傳片。',
  '此時仍待 Mary 正式確認；Dante 後來的 email 已確認她參演。',
  '寫 Task 3 講稿時，介紹 Mary 是 William 的 co-star，刪去「每集神秘嘉賓」的舊設定。'
]);
assert.deepEqual(Array.from(manualBaseRows23[33].manualAnalysis),[
  '這課和錄音檔裡的 fire problem / staff didn’t know what to do 非常吻合。',
  '真正可抽出的工作好處是：',
  'recognise fire hazards','use a fire extinguisher','keep fire exits clear','keep everyone safe',
  '這些都是可直接寫進推薦電郵的實際功能。'
]);
assert.deepEqual(Array.from(manualBaseRows23[39].manualAnalysis),[
  '真正有用的核心只有第一句：','only saying what you mean and meaning what you say','這和錄音檔裡的需求：',
  'behaving properly online','people don’t misinterpret what you’re saying','how not to offend people',
  '是語義上完全對得上的。','所以這課是 social media training 的正解',
  '後面那些 social media angel / KOL / yoga mums 等，主要是宣傳味，不是推薦電郵的主體。'
]);

const lesson=fs.readFileSync(path.join(reader,'lesson.js'),'utf8');
const shell=fs.readFileSync(path.join(reader,'reference-shell.js'),'utf8');
const interactions=fs.readFileSync(path.join(reader,'reference/interactions.js'),'utf8');
const html=fs.readFileSync(path.join(reader,'index.html'),'utf8');
assert.match(lesson,/origin:'evidence'/,'evidence-only additions must be labelled');
assert.match(lesson,/origin:'editorial'/,'editorial additions must be labelled');
assert.match(shell,/manualAnalysis/,'the card must render the verbatim bullets');
assert.match(shell,/curationSearchText23/,'the card search must index all manual fields');
assert.match(interactions,/entry\.search/,'the final picker override must preserve full-field search');
assert.match(html,/data-reader-source="manual-verbatim\.js"[\s\S]*這一段是 Task 3 的關鍵更新。/,'the deployable single-file reader must embed the manual ledger');

if(process.argv[2]){
  const pdfText=fs.readFileSync(process.argv[2],'utf8');
  const normalize=value=>value.normalize('NFKC').replace(/[\s\u200b\u200c\u200d\ufeff]/g,'');
  const haystack=normalize(pdfText);
  const imageBacked=new Set([30,33,35,36,37,39,41,42,46,59,61,63,66,67,68,71,72,73,74,75,76]);
  const missing=[];
  for(const row of manualBaseRows23){
    if(imageBacked.has(row.manualPdfPage))continue;
    for(const line of row.manualAnalysis)if(!haystack.includes(normalize(line)))missing.push(`PDF ${row.manualPdfPage}: ${line}`);
  }
  assert.deepEqual(missing,[],'machine-readable PDF pages contain a non-verbatim analysis line');
}

console.log('PASS: 49/49 manual units, Mary passage, provenance, search and embedded reader verified.');
