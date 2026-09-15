import {createExpressionMap} from './common-expression-map.mjs?v=20260915-jacket1';
import {loadPuzzleArtwork,drawPuzzlePlatform,drawPuzzleRoad} from './ielts-puzzle-artwork.mjs';
import {puzzlePositions,createPuzzleNavigation,PUZZLE_LIMIT} from './ielts-puzzle-geometry.mjs';
import {mountPuzzleEffects} from './ielts-puzzle-effects.mjs';

export function puzzleLessons(practices){
 return practices.filter(p=>Number.isInteger(p.practice)&&p.practice>=1&&p.practice<=PUZZLE_LIMIT)
  .sort((a,b)=>a.practice-b.practice)
  .map(p=>({id:p.id,order:p.practice,titleEn:`IELTS Listening Practice ${p.practice}`,titleZh:`${p.parts.length} 個部分 · Parts 1–${p.parts.length}`,mapLabel:`Practice ${p.practice}`,questions:Array.from({length:40},(_,i)=>({id:String(i+1)}))}));
}
export async function mountIeltsMap({root,toggle,grid,practices,openPractice,getCompleted=()=>0}){
 const lessons=puzzleLessons(practices),count=Math.max(...lessons.map(l=>l.order));
 const extended=count>20,height=extended?1760:900,art=await loadPuzzleArtwork(extended),navigation=createPuzzleNavigation(count);
 const theme={
  id:'ielts-puzzle',title:'IELTS 聆聽探索之旅',kicker:'THE PUZZLE ISLANDS',width:1600,height,
  positions:puzzlePositions,navigation,minimumZoom:.5,cameraPadding:{left:800,right:800},
  cameraTop:({point,scale,height:h})=>point.y<860&&h>=900*scale-2?0:Math.max(0,point.y*scale-h*.55),
  terrain:()=>`<div class="puzzle-landscape" aria-hidden="true"></div>${extended?'<div class="puzzle-landscape puzzle-continuation" aria-hidden="true"></div>':''}<canvas class="puzzle-water" data-puzzle-water aria-hidden="true"></canvas><canvas class="puzzle-road" data-puzzle-road data-world-height="${height}" aria-hidden="true"></canvas><canvas class="puzzle-effects" data-puzzle-effects aria-hidden="true"></canvas>`,
  mount(mapRoot,reduced){
   drawPuzzleRoad(mapRoot.querySelector('[data-puzzle-road]'),art,navigation.route);
   mapRoot.querySelectorAll('[data-map-level]').forEach((button,index)=>{
    const c=document.createElement('canvas');c.className='puzzle-platform';c.setAttribute('aria-hidden','true');button.prepend(c);drawPuzzlePlatform(c,art,lessons[index].order-1);
   });
   mapRoot.querySelector('.expression-map-heading small').textContent=`${lessons.length} 套練習 · 全部開放`;
   mapRoot.querySelector('.expression-map-picker>span').textContent='前往練習';
   mapRoot.querySelector('.expression-map-picker select').setAttribute('aria-label','前往練習 · Choose a listening practice');
   mapRoot.querySelector('.expression-map-viewport').setAttribute('aria-label','IELTS 聆聽練習地圖；拖動探索，點選拼圖選擇練習。可用方向鍵或 WASD 走動。');
   mapRoot.querySelector('.expression-map-lesson-card').setAttribute('aria-label','聆聽練習');
   mapRoot.querySelector('[data-map-open]>span').innerHTML='進入練習<small>Start practice</small>';
   const animation=mountPuzzleEffects(mapRoot,art,height,reduced);
   return {...animation,update(){
    mapRoot.querySelectorAll('[data-map-level]').forEach((button,index)=>{
     const lesson=lessons[index];button.setAttribute('aria-label',`${lesson.titleEn} · ${lesson.titleZh}`);
     button.querySelector('.expression-map-stone-status').textContent=`${getCompleted(lesson.id)} / 40`;
    });
   }};
  }
 };
 return createExpressionMap({root,toggle,grid,lessons,getCompleted,systemKey:'listening-system-ielts',theme,
  openLesson:id=>{const practice=practices.find(p=>p.id===id);if(practice)openPractice(practice.practice);}});
}
