// Connect original textbook turns to translations/recordings; keep PDF wording intact.
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url)),{JSDOM}=require('jsdom');
const materials=JSON.parse(fs.readFileSync('professional-english/content/lesson-materials.json')),dialogues=JSON.parse(fs.readFileSync('professional-english/dialogues.json')).dialogues;
const text=el=>{const copy=el.cloneNode(true);copy.querySelectorAll('br').forEach(b=>b.replaceWith(' '));return copy.textContent.replace(/\s+/g,' ').trim();};
const norm=x=>x.toLowerCase().replace(/[^a-z0-9]/g,'');
const specs=[[1,2,0,'l1d1'],[1,3,0,'l1d2'],[1,6,0,'l1d3'],[2,1,0,'l2d1'],[2,2,0,'l2d2'],[2,4,0,'l2d3'],[3,1,1,'l3d1-professional'],[3,2,1,'l3d2-professional'],[3,4,1,'l3d3-professional'],[3,5,1,'l3d4-professional']];
const support={version:1,pages:{},upgrades:[]},turns=new Map();
for(const [lesson,page,table,id] of specs){const doc=new JSDOM(materials[lesson-1].pages[page-1].html).window.document;const rows=[...doc.querySelectorAll('table')[table].rows];let line=0;for(const[row,r]of rows.entries()){if(r.cells.length!==(lesson===1?2:4))continue;for(const variant of lesson===1?['professional']:['beginner','professional']){const dialogue=variant==='professional'?id:id.replace('-professional','')+'-beginner',d=dialogues.find(d=>d.id===dialogue),cell=variant==='beginner'?1:lesson===1?1:3,en=text(r.cells[cell]);if(!d?.lines[line])throw Error('Missing turn '+dialogue+':'+line);let zh=d.lines[line].zh;if(dialogue==='l1d3'&&line===6)zh=zh.replace('10 樓','24 樓');if(dialogue==='l1d3'&&line===16)zh=zh.replace('Flora','Martin');const value={table,row,cell,dialogue,line,en,zh,audio:norm(en)===norm(d.lines[line].en),lesson,page};(support.pages[lesson+':'+page]??=[]).push(value);turns.set(dialogue+':'+line,value);}line++;}}
const same=(id,lines)=>lines.map(line=>[id,line]);
const upgrades=[
 [1,2,same('l1d1',[8,2,10,4,10,6,0])],
 [1,4,same('l1d2',[1,11,5,9,5,5,5,7,9,9,9])],
 [1,6,same('l1d3',[6,6,10,14])],
 [2,3,[['l2d1',2],['l2d1',6],['l2d2',5],['l2d1',6],['l2d1',4],...same('l2d2',[8,9,0,2,5,7,1,9])]],
 [2,5,same('l2d3',[3,5,7,9,7,11,11])],
 [3,3,same('l3d1-professional',[1,3,5,7,7,9,9,7,2,8,6,4])],
 [3,6,[...same('l3d2-professional',[3,5,7,9,9]),...same('l3d3-professional',[1,3,7,9,9]),...same('l3d4-professional',[1,3,5,5,7,7]),['l3d3-professional',9],['l3d4-professional',9]]]
];
for(const[lesson,page,answers]of upgrades){const doc=new JSDOM(materials[lesson-1].pages[page-1].html).window.document;const prompts=lesson===1?[...doc.querySelectorAll('p')].map((p,index)=>({selector:`p`,index,prompt:text(p)})).filter(p=>/^Rewrite/.test(p.prompt)):[...doc.querySelectorAll('tr')].map((r,index)=>({selector:'tr',index,prompt:r.cells[0]?text(r.cells[0]):'',answer:r.cells[1]?text(r.cells[1]):''})).filter(r=>/_{5}/.test(r.answer));if(prompts.length!==answers.length)throw Error(`Prompt mismatch ${lesson}:${page}: ${prompts.length}/${answers.length}`);prompts.forEach((p,index)=>{const source=turns.get(answers[index].join(':'));if(!source)throw Error('Missing source '+answers[index]);support.upgrades.push({lesson,page,selector:p.selector,index:p.index,prompt:p.prompt.replace(/_{5,}/g,'').trim(),answer:source.en,translation:source.zh,source:{lesson:source.lesson,page:source.page,dialogue:source.dialogue,line:source.line},note:lesson===3&&page===6&&index===16?'維修時間的表達參考對話 3；對話 4 的結尾沒有承諾維修時間。':''});});}
fs.writeFileSync('professional-english/content/reader-support.json',JSON.stringify(support,null,2)+'\n');console.log(`${Object.values(support.pages).flat().length} translated turns; ${support.upgrades.length} answers sourced from original dialogues.`);
