#!/usr/bin/env node
// Editorial allocation only. This file does not publish or rewrite any lesson.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import lessons from '../natural-english/imported-lessons.mjs';

export const styles = Object.freeze({
  scene:'情境抉擇',
  tone:'語氣比較',
  audio:'聽出意思',
  branch:'對話分支',
  reverse:'反向配對',
  repair:'修正近似說法',
  contrast:'意思對照',
  detail:'抓關鍵細節',
  rewrite:'改寫訊息',
  continue:'接續談話',
  speak:'即時口說',
  transfer:'換場景運用',
  explain:'說明判斷依據',
  final:'無提示挑戰',
});

// Preferences guide an editor; they never forbid a style that fits a particular lesson.
const families={
  social:['tone','branch','continue','rewrite','scene','explain','transfer'],
  request:['scene','repair','branch','reverse','continue','transfer','explain','tone','rewrite'],
  object:['reverse','detail','contrast','scene','transfer','repair','explain'],
  condition:['contrast','detail','scene','transfer','explain','repair','rewrite'],
  action:['scene','detail','repair','transfer','branch','continue','explain'],
};
const draftFiles=fs.readdirSync(new URL('../natural-english/',import.meta.url))
  .filter(name=>/^lesson-\d{3}\.mjs$/.test(name)&&name!=='lesson-102.mjs');
export const authored=new Map(await Promise.all(draftFiles.map(async name=>{
  const number=Number(name.slice(7,10));
  const draft=(await import(new URL('../natural-english/'+name,import.meta.url))).default;
  if(draft?.revision!==2)throw new Error(`${name}: expected editorial revision 2`);
  return [number,draft.steps.map(step=>step.style)];
})));

const hash=(...parts)=>Number.parseInt(createHash('sha256').update(parts.join(':')).digest('hex').slice(0,8),16);
function familyOf(lesson){
  const target=lesson.titleEn.trim(),title=lesson.titleZh;
  if(/^(?:after you|i(?:'|’)(?:m|ll|d|ve)|can(?:'|’)t complain|hang in there|no problem|you(?:'|’)re|we(?:'|’)re)/i.test(target)
    && /邀|拒|近況|關心|鼓勵|我|你|對方|客人/.test(title))return 'social';
  if(/[?？]$/.test(target)||/^(?:can|could|would|please|may|do you|is there|are there|what|where|when|how)/i.test(target))return 'request';
  if(!/[.!?]$/.test(target)&&target.split(/\s+/).length<=4)return 'object';
  if(/壞|塞|漏|痛|暈|癢|聲|掉|鬆|硬|軟|乾|熱|冷|髒|濕|腫|卡|臭|味/.test(title))return 'condition';
  return 'action';
}

function chooseStyles(lesson,previous,uses){
  const family=familyOf(lesson),pool=families[family];
  const count=authored.get(lesson.number)?.length??5+hash(lesson.id,'count')%2;
  const chosen=authored.has(lesson.number)?[...authored.get(lesson.number)]:['audio'];
  if(!authored.has(lesson.number)){
    if(hash(lesson.id,'speak')%4!==0)chosen.push('speak');
    if(hash(lesson.id,'final')%4!==0)chosen.push('final');
    const rest=Object.keys(styles).filter(style=>!chosen.includes(style));
    rest.sort((a,b)=>(uses[a]-uses[b])+(pool.includes(a)?-9:0)-(pool.includes(b)?-9:0)||hash(lesson.id,a)-hash(lesson.id,b));
    chosen.push(...rest.slice(0,count-chosen.length));
    chosen.sort((a,b)=>hash(lesson.id,'order',a)-hash(lesson.id,'order',b));
  }
  const unique=[...new Set(chosen)];
  if(unique.length!==count)throw new Error(`${lesson.id}: duplicate style`);
  if(previous&&unique.join(',')===previous.join(','))unique.reverse();
  for(const style of unique)uses[style]++;
  return {family,styles:unique};
}

export function plan(){
  const uses=Object.fromEntries(Object.keys(styles).map(style=>[style,0]));
  const rows=[];let previous=null;
  for(const lesson of lessons){
    if(lesson.number===102)continue; // Lesson 102 already has an editorial revision.
    const selected=chooseStyles(lesson,previous,uses);
    rows.push({number:lesson.number,id:lesson.id,title:lesson.titleZh,...selected,sourceSha256:lesson.sourceSha256,status:authored.has(lesson.number)?'draft-needs-editorial-review':'needs-content-authoring'});
    previous=selected.styles;
  }
  return {styles,uses,rows};
}

if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href){
  const result=plan();
  if(process.argv.includes('--write')){
    const path=new URL('../natural-english/redesign-plan.json',import.meta.url);
    fs.writeFileSync(path,JSON.stringify(result,null,2)+'\n');
    console.log(`Wrote ${result.rows.length} editorial allocations to ${path.pathname}`);
  }else console.log(JSON.stringify({lessons:result.rows.length,uses:result.uses,examples:result.rows.filter(row=>[7,8,9,10,250,549].includes(row.number))},null,2));
}
