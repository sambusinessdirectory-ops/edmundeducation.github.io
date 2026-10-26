// One lazy ledger per practice. Keep the original pilot and its saved progress intact.
const cache=new Map();
export async function loadCuration(content){
 const n=content.practice;
 if(!Number.isInteger(n)||n<1||n>20)throw Error('此練習未提供 Super Curation。');
 if(!cache.has(n)){
  const ledger=n===2?(await import('./ielts-practice2-curation-data.mjs?v=20261025-1')).curation:await fetch(`ielts-curation-data/practice-${n}.json?v=20261026-1`,{credentials:'omit'}).then(r=>{if(!r.ok)throw Error('Curation 資料未能載入。');return r.json();});
  if(ledger.practice!==n||ledger.parts?.length!==4)throw Error('Curation 練習版本不相符。');
  cache.set(n,ledger);
 }
 const curation=cache.get(n);
 // Practice 1 predates the common import schema. Supply metadata without mutating
 // the original content object or existing transcript/bookmark row identifiers.
 if(n===1){
  const parts={};
  for(const p of curation.parts){
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(content.transcript[p.part]))))].map(b=>b.toString(16).padStart(2,'0')).join('');
   if(hash!==p.transcriptSha256)throw Error('Practice 1 錄音稿已更新，請先核對 Curation。');
   parts[p.part]={...content.timings.parts[p.part],audioUrl:p.audioUrl,audioSha256:p.audioSha256,transcriptSha256:hash};
  }
  content={...content,timings:{...content.timings,parts}};
 }
 return {curation,content};
}
