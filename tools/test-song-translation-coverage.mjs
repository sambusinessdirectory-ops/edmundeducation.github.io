import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const js=fs.readFileSync('song-appreciation.js','utf8');
const render=js.slice(js.indexOf('  function renderExerciseQuestions()'),js.indexOf('  async function startExercise('));
class Element {constructor(){this.children=[];this.dataset={};this.classList={toggle(){}};}append(...x){this.children.push(...x);}replaceChildren(){this.children=[];}}
let count=0,lines=0;
for(const file of fs.readdirSync('tools/song-content').filter(f=>f.endsWith('.json'))){
 const song=JSON.parse(fs.readFileSync('tools/song-content/'+file));
 for(const mode of song.exercises||[]){
  if(!mode.listeningLines?.length)continue;
  const holder=new Element();const state={exercise:{mode:{...mode,questions:[]},results:{}},activeSong:song,showChinese:true};
  const ctx=vm.createContext({state,$:()=>holder,document:{createElement:()=>new Element(),createTextNode:x=>x},questionTimeline:()=>[],lyricTimeline:()=>[],applyCheckedResults(){},updateExerciseProgress(){}});
  vm.runInContext(render,ctx);ctx.renderExerciseQuestions();
  assert.equal(holder.children.length,mode.listeningLines.length);
  for(let i=0;i<holder.children.length;i++){
   const expected=song.translations.find(r=>r.lineId===mode.listeningLines[i].lineId)?.chinese;
   assert.ok(expected,`${file}/${mode.id}/${i} missing source Chinese`);
   assert.equal(holder.children[i].children[1]?.textContent,expected,`${file}/${mode.id}/${i} hidden without timing`);lines++;
  }
  state.showChinese=false;ctx.renderExerciseQuestions();assert.ok(holder.children.every(x=>x.children.length===1));count++;
 }
}
console.log(`${count} listening modes / ${lines} lines: Chinese displays without audio timing; hide toggle works.`);
