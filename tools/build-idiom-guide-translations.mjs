#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={window:{}};vm.createContext(context);
for(const name of ['idiom-system-data.js','idiom-first-five-curation.js','idiom-compass-06-30-curation.js','idiom-compass-06-30-bonus.js','idiom-compass-31-curation.js','idiom-compass-32-108-curation.js','idiom-compass-109-138-curation.js'])vm.runInContext(read(name),context);
const guides=context.window.EDMUND_IDIOM_COMPASS;
const rows=name=>read(name).trim().split('\n').filter(Boolean).map(row=>row.split('|'));
const translationRoot='content/idiom-compass-guide-zh/';
const response=new Map(rows(translationRoot+'response-32-138.txt').map(([n,...zh])=>[Number(n),zh]));
const boundary=new Map(rows(translationRoot+'boundary-32-138.txt').map(([n,...zh])=>[Number(n),zh]));
const early=new Map(rows(translationRoot+'early-choices.txt').map(([n,p,...zh])=>[`${Number(n)}:${p}`,zh]));
const earlyBoundary=new Map(rows(translationRoot+'early-boundary-foil.txt').map(([n,zh])=>[Number(n),zh]));
const scenes=new Map(['32-108','109-138'].flatMap(batch=>rows(`content/idiom-compass-${batch}/situation-decisions.txt`).map(([n,...pairs])=>[Number(n),pairs.filter((_,i)=>i%2===1)])));
const meta=JSON.parse(read('content/idiom-compass-109-138/guide-metadata.json'));
const tone={
 'It cautiously asks for evidence without expressing disbelief.':'它審慎地要求證據，沒有表達懷疑。',
 'It is a neutral description with no implication for how the subject is viewed.':'這是中性描述，沒有暗示如何看待當事人或事物。',
 'It is modern technical terminology with a precise specialist definition.':'這是現代技術術語，有精確的專業定義。',
 'It is the plainest and most direct wording for a practical instruction.':'這是實際指示中最平實、最直接的措辭。',
 'It offers straightforward praise without judging anyone or anything.':'它直接表達讚賞，沒有評價任何人或事物。',
 'It sincerely reassures the listener that the predicted event will happen.':'它真誠地向聽者保證，所預測的事情會發生。',
 'Its figurative wording makes it suitable only for highly ceremonial speeches.':'它的比喻措辭令它只適用於非常隆重的典禮演說。',
 'Its use here is necessarily a personal insult, whatever the relationship.':'不論雙方關係如何，在這裏使用它必然是人身侮辱。'
};
const result={};let count=0;
for(const [id,guide] of Object.entries(guides)){
 const n=Number(id.split('-')[1]);result[id]={};
 for(const p of ['2','3','5','6']){
  const c=guide.choices[p];let zh;
  if(n<=31){
   zh=early.get(`${n}:${p}`)||[...c.options];
   if(p==='6'&&earlyBoundary.has(n))zh[2]=earlyBoundary.get(n);
  }else if(p==='2')zh=scenes.get(n);
  else if(p==='5')zh=response.get(n);
  else if(p==='6')zh=[guide.boundary,...boundary.get(n)];
  else if(n>=109)zh=[meta[n].socialZh,meta[n].wrong1Zh,meta[n].wrong2Zh];
  else zh=[guide.where,...c.optionsEn.slice(1).map(en=>tone[en])];
  if(!zh||zh.length!==c.optionsEn.length||zh.some(z=>!z||!/[\u3400-\u9fff]/.test(z)))throw Error(`Missing translation ${id}:${p}: ${JSON.stringify(zh)}`);
  if(new Set(zh).size!==zh.length)throw Error(`Duplicate translated options ${id}:${p}`);
  result[id][p]={optionsEn:c.optionsEn,optionsZh:zh};count+=zh.length;
 }
}
const body=`/* Direct Traditional Chinese guide-choice translations, separate from answer explanations. */\n(function registerGuideTranslations(){\nconst translations=${JSON.stringify(result)};\nconst guides={...window.EDMUND_IDIOM_COMPASS};\nfor(const [id,pages] of Object.entries(translations)){\n const guide=guides[id]; if(!guide)continue;\n const choices={...guide.choices};\n for(const [page,entry] of Object.entries(pages)){\n  const choice=choices[page];\n  if(JSON.stringify(choice.optionsEn)!==JSON.stringify(entry.optionsEn))throw new Error('Stale guide translation: '+id+':'+page);\n  choices[page]={...choice,optionsZh:entry.optionsZh};\n }\n guides[id]={...guide,choices};\n}\nwindow.EDMUND_IDIOM_COMPASS=Object.freeze(guides);\n})();\n`;
fs.writeFileSync(path.join(root,'idiom-compass-guide-zh.js'),body);
fs.writeFileSync(path.join(root,translationRoot+'translation-report.json'),JSON.stringify({lessons:Object.keys(result).length,decisions:count/3,optionTranslations:count,source:'Authored Traditional Chinese translations paired to exact English choices; rationales remain separate.',removedStage:'Build the phrase / 拆句式',internalPageIdsPreserved:true},null,2)+'\n');
console.log(`Built ${count} option translations for ${Object.keys(result).length} guides.`);
