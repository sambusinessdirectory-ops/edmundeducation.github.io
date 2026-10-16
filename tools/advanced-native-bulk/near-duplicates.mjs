#!/usr/bin/env node
// Lexical similarity flags request editorial comparison; never auto-delete content.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalise} from './schema.mjs';
function signature(text){
 const core=String(text||'').replace(/^新情境[：:]\s*/,'').replace(/用一至兩句英文[\s\S]*$/,'').replace(/哪(?:句|個|一)[^。]*[？?]$/,'');
 const plain=normalise(core).replace(/[\p{P}\p{S}]/gu,' ').replace(/\d+/g,'NUMBER').replace(/\s+/g,' ').trim();
 const tokens=new Set(),words=plain.match(/[a-z]+(?:'[a-z]+)?/g)||[],zh=(plain.match(/[\u3400-\u9fff]/g)||[]).join('');
 for(let i=0;i+3<words.length;i++)tokens.add('en:'+words.slice(i,i+4).join(' '));
 for(let i=0;i+2<zh.length;i++)tokens.add('zh:'+zh.slice(i,i+3));
 return {plain,tokens};
}
export function nearDuplicates(records,{threshold=.62}={}){
 const flags=[];
 for(const field of ['listening','scene','dialogue','writing']){
  const rows=records.map(r=>{const q=r[field],text=field==='listening'?q?.en:field==='writing'?q?.promptZh:q?.promptZh||q?.promptEn;return {id:r.id,text,...signature(text)};}).filter(r=>r.tokens.size>=5);
  const frequency=new Map();for(const r of rows)for(const t of r.tokens)frequency.set(t,(frequency.get(t)||0)+1);
  const maxFrequency=Math.max(5,Math.floor(rows.length*.2));
  for(const r of rows)r.tokens=new Set([...r.tokens].filter(t=>frequency.get(t)<=maxFrequency));
  const index=new Map(),exact=new Map();
  for(let i=0;i<rows.length;i++){
   const r=rows[i],candidates=new Map();
   if(exact.has(r.plain))candidates.set(exact.get(r.plain),Infinity);
   for(const t of r.tokens)for(const j of index.get(t)||[])candidates.set(j,(candidates.get(j)||0)+1);
   for(const [j,shared] of candidates){
    if(shared<3)continue;const other=rows[j],same=r.plain===other.plain;
    const intersection=[...r.tokens].filter(t=>other.tokens.has(t)).length;
    const total=r.tokens.size+other.tokens.size,score=same?1:total?2*intersection/total:0;
    if(score>=threshold)flags.push({field,lessonA:other.id,lessonB:r.id,score:Number(score.toFixed(4)),kind:same?'exact-normalized-task':'near-duplicate-wording',textA:other.text,textB:r.text,decision:'editorial-comparison-pending'});
   }
   exact.set(r.plain,i);for(const t of r.tokens){if(!index.has(t))index.set(t,[]);index.get(t).push(i);}
  }
 }
 return flags.sort((a,b)=>b.score-a.score||a.lessonA.localeCompare(b.lessonA));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016'),dir=path.join(root,'drafts');
 const records=fs.readdirSync(dir).filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f)).flatMap(f=>{const d=JSON.parse(fs.readFileSync(path.join(dir,f)));return Array.isArray(d)?d:d.lessons;});
 const flags=nearDuplicates(records),report={checkedAt:new Date().toISOString(),lessons:records.length,method:'Rare English four-word and Chinese three-character shingles; Sørensen–Dice similarity, threshold0.62; generic task instructions excluded',limitations:'Lexical screening, not proof of semantic equivalence or of originality. Every flag requires contextual review; low overlap cannot certify diverse learning decisions.',flags};
 fs.writeFileSync(path.join(root,'near-duplicate-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({lessons:records.length,flags:flags.length,highest:flags.slice(0,5)},null,2));
}
