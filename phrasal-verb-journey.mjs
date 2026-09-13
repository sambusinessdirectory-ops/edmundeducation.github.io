import {createDesertTheme} from './phrasal-verb-desert.mjs?v=20260913-night1';
import {nightTerrain,nightCoin,mountNight} from './phrasal-verb-night.mjs?v=20260913-night1';
import {DESERT_HEIGHT} from './phrasal-verb-desert-geometry.mjs?v=20260913-night1';
import {NIGHT_OFFSET,JOURNEY_HEIGHT,journeyPositions,createJourneyNavigation,journeyOverview} from './phrasal-verb-night-geometry.mjs?v=20260913-night1';
export {PHRASAL_MAP_LIMIT,phrasalJourneyLessons} from './phrasal-verb-night-geometry.mjs?v=20260913-night1';
export {phrasalMapCompleted} from './phrasal-verb-desert.mjs?v=20260913-night1';
let instance=0;
export function createPhrasalJourney(lessons){
 const day=createDesertTheme(lessons.slice(0,30));if(lessons.length<=30)return day;
 const nodes=journeyPositions(lessons),id=`phrasal-night-${++instance}`;
 function terrain(){return `<div class="phrasal-day-section" style="height:${DESERT_HEIGHT}px">${day.terrain()}</div><div class="phrasal-chapter-divider" style="top:${DESERT_HEIGHT}px;height:${NIGHT_OFFSET-DESERT_HEIGHT}px"><span>31–60</span><strong>月夜沙丘</strong><small>THE MOONLIT CARAVAN</small></div>${nightTerrain(nodes.slice(30),id)}`;}
 function mount(root,reduced){
  root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{if(i>=30){stone.dataset.night='true';stone.insertAdjacentHTML('afterbegin',nightCoin(i,id));}});
  const first=day.mount(root,reduced),night=mountNight(root,reduced),viewport=root.querySelector('.expression-map-viewport'),picker=root.querySelector('.expression-map-picker select');
  viewport.setAttribute('aria-label','動詞片語第 1 至 60 課；日光綠洲與月夜沙丘。點選沙地自由走動、拖動探索，或使用方向鍵 / WASD。');
  root.querySelector('.expression-map-tools').insertAdjacentHTML('afterend',`<nav class="phrasal-chapters" aria-label="選擇地圖區域"><button type="button" data-phrasal-chapter="day" aria-pressed="true"><span>01–30</span> 日光綠洲</button><button type="button" data-phrasal-chapter="night" aria-pressed="false"><span>31–60</span> 月夜沙丘</button></nav>`);
  const controls=root.querySelector('.phrasal-chapters');
  function jump(event){const chapter=event.target.closest('[data-phrasal-chapter]');if(!chapter)return;picker.value=lessons[chapter.dataset.phrasalChapter==='night'?30:0].id;picker.dispatchEvent(new Event('change',{bubbles:true}));}
  function syncChapter(){const scale=Number(root.dataset.scale)||1,chapter=root.dataset.overview==='true'?root.dataset.overviewSection:viewport.scrollTop/scale+viewport.clientHeight/scale*.4>=NIGHT_OFFSET?'night':'day';root.dataset.currentChapter=chapter;controls.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.phrasalChapter===chapter)));}
  // Reduced motion does not run a continuous draw loop; controls still follow navigation.
  const afterSelection=()=>queueMicrotask(syncChapter);
  controls.addEventListener('click',jump);
  viewport.addEventListener('scroll',syncChapter,{passive:true});picker.addEventListener('change',afterSelection);
  return {draw(now){first.draw(now);night.draw(now);syncChapter();},destroy(){controls.removeEventListener('click',jump);viewport.removeEventListener('scroll',syncChapter);picker.removeEventListener('change',afterSelection);first.destroy();night.destroy();}};
 }
 return {...day,height:JOURNEY_HEIGHT,positions:()=>nodes,terrain,mount,navigation:createJourneyNavigation(nodes),overviewBounds:journeyOverview,cameraTop:({point,scale,height,zoom,overview})=>{
  const chapter=journeyOverview(point),local=point.y-chapter.top;
  if(overview)return chapter.top*scale;
  if(chapter.key==='day')return day.cameraTop({point,scale,height,zoom});
  return zoom===1&&local<450&&local*scale<height-155?chapter.top*scale:point.y*scale-height*.4;
 }};
}
