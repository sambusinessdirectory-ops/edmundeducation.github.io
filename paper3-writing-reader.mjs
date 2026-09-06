import {mountPaper3Writing} from '/paper3-writing-bridge.mjs?v=20260906-classroom2';
const route=location.pathname.match(/(?:paper3\/|paper3-)(20\d\d)[/-]?(b[12])/i)||location.pathname.match(/paper3-(20\d\d)-(b[12])/i);
if(route){
  const year=Number(route[1]),level=route[2].toLowerCase(),sources={};
  const fields=[...document.querySelectorAll('input[data-save]:not([type=checkbox]),textarea[data-save]')];
  const drafts=fields.filter(f=>/^draft-/.test(f.dataset.save));
  fields.forEach(field=>{
    const id=field.dataset.save;let task=Number(field.dataset.wordTask)||Number(id.match(/^(?:task|t)(\d+)[-_]/)?.[1]);
    if(year===2025&&level==='b1'){if(/^email-/.test(id))task=6;if(/^script-/.test(id))task=7;}
    if(!task&&drafts.includes(field))task=(level==='b1'?5:8)+drafts.indexOf(field);
    if((level==='b1'?[5,6,7]:[8,9,10]).includes(task))(sources[task]||=[]).push(field);
  });
  const root=document.createElement('section');(document.querySelector('main')||document.body).append(root);
  mountPaper3Writing(root,{year,level,sources,activeTask:location.hash.match(/task-(\d+)/)?.[1]});
}
