import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {newProverbs} from './proverb-new-lessons/specs.mjs';
import {practice} from './proverb-new-lessons/practice.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const check=process.argv.includes('--check');
const write=(name,body)=>{const file=path.join(root,name);if(check){if(fs.readFileSync(file,'utf8')!==body)throw Error(`Stale ${name}`);}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);}};
const title=s=>s.titleEn.toLowerCase();
const marks={
 'proverb-04':'♡', 'proverb-05':'?','proverb-06':'↗','proverb-07':'△','proverb-08':'◌',
 'proverb-09':'⌁','proverb-10':'◷','proverb-11':'!','proverb-12':'◎'
};
for(const spec of newProverbs){
 const rows=practice[spec.id];
 if(!rows||rows.length!==12)throw Error(`${spec.id}: expected 12 authored items`);
 const items=rows.map((row,i)=>{
  if(row.lines.length!==4||row.reasons.length!==4)throw Error(`${spec.id} item ${i+1}: four choices/reasons required`);
  const number=i+1,id=`${spec.id}-q${String(number).padStart(2,'0')}`;
  const options=row.lines.map((line,k)=>({id:k?'foil-'+k:'key',text:`${line}—${title(spec)}.`,reasonZh:row.reasons[k],correct:k===0}));
  return {id,number,promptEn:row.en,promptZh:row.zh,options};
 });
 const compass={id:spec.id,titleEn:spec.titleEn,titleZh:spec.titleZh,version:'2026-10-28.1',scoredCount:12,items,guide:spec.guide};
 const lesson={
  id:spec.id,order:Number(spec.id.slice(-2)),slug:spec.slug,version:'1',title:spec.titleZh,titleEn:spec.titleEn,titleZh:spec.titleZh,
  image:`assets/proverb-system/${spec.slug}.svg`,imageWidth:1200,imageHeight:900,
  imageAlt:`Illustrated learning card for ${spec.titleEn}.`,imageAltZh:`「${spec.titleZh}」學習插圖。`,
  source:{kind:'newly-authored',reference:'Oxford proverb index; original teaching scenes and questions',date:'2026-10-28'},
  meaning:{en:spec.sense,zh:spec.guide.meaning.zh},
  formulas:[{labelEn:'Target Proverb',labelZh:'目標諺語',formula:title(spec),highlight:title(spec)}],
  examples:[{labelEn:'Model',labelZh:'示例',en:spec.guide.model.en,zh:spec.guide.model.zh,highlight:title(spec)}],
  instructions:{en:`Choose the one sentence that keeps the situation’s facts and uses “${title(spec)}” accurately.`,zh:`選出唯一保留情境事實、又正確使用「${title(spec)}」的英文句子。`},
  questions:items.map(q=>({id:q.id,number:q.number,prompt:q.promptEn,promptZh:q.promptZh,starter:q.options[0].text.split(' ')[0],answer:q.options[0].text,answerZh:q.promptZh,highlight:title(spec)}))
 };
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#fff4df"/><stop offset="1" stop-color="#e7efe9"/></linearGradient></defs><rect width="1200" height="900" fill="url(#g)"/><circle cx="600" cy="370" r="245" fill="#f7e3ba"/><circle cx="600" cy="370" r="205" fill="#fefaf2" stroke="#be9870" stroke-width="4"/><text x="600" y="455" text-anchor="middle" font-family="Georgia,serif" font-size="220" fill="#24524f">${marks[spec.id]}</text><path d="M170 690H1030" stroke="#be9870" stroke-width="3"/><text x="600" y="750" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#3c3932">${spec.titleEn.replaceAll('&','&amp;')}</text><text x="600" y="800" text-anchor="middle" font-family="serif" font-size="30" fill="#6a4c3a">${spec.titleZh}</text></svg>\n`;
 write(`content/proverb-compass/${spec.id}.json`,JSON.stringify(compass,null,2)+'\n');
 write(`tools/proverb-lessons/lesson-${spec.id.slice(-2)}-${spec.slug}.json`,JSON.stringify(lesson,null,2)+'\n');
 write(`assets/proverb-system/${spec.slug}.svg`,svg);
}
console.log(`${check?'Verified':'Wrote'} ${newProverbs.length} new Proverb guides and ${newProverbs.length*12} authored four-choice items.`);
