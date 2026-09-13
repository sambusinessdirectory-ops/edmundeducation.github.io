import {createDesertTheme} from './phrasal-verb-desert.mjs?v=20260913-bakery1';
import {nightTerrain,nightCoin,mountNight} from './phrasal-verb-night.mjs?v=20260913-bakery1';
import {bakeryTerrain,bakeryPlatform,mountBakery} from './phrasal-verb-bakery.mjs?v=20260913-bakery2';
import {DESERT_HEIGHT} from './phrasal-verb-desert-geometry.mjs?v=20260913-night1';
import {NIGHT_OFFSET,NIGHT_HEIGHT} from './phrasal-verb-night-geometry.mjs?v=20260913-night1';
import {BAKERY_OFFSET} from './phrasal-verb-bakery-geometry.mjs?v=20260913-bakery2';
import {journeyHeight,journeyPositions,createJourneyNavigation,journeyOverview} from './phrasal-verb-journey-geometry.mjs?v=20260913-bakery2';
export {PHRASAL_MAP_LIMIT,phrasalJourneyLessons} from './phrasal-verb-journey-geometry.mjs?v=20260913-bakery2';
export {phrasalMapCompleted} from './phrasal-verb-desert.mjs?v=20260913-bakery1';
let instance=0;
export function createPhrasalJourney(lessons){
 const day=createDesertTheme(lessons.slice(0,30));if(lessons.length<=30)return day;
 const nodes=journeyPositions(lessons),id=`phrasal-journey-${++instance}`,hasBakery=lessons.length>60;
 const chapters=[{key:'day',start:0,label:'日光綠洲',range:'01–30'},{key:'night',start:30,label:'月夜沙丘',range:'31–60'},...(hasBakery?[{key:'bakery',start:60,label:'星空烘焙',range:'61–90'}]:[])];
 function terrain(){return `<div class="phrasal-day-section" data-map-chapter="day" style="height:${DESERT_HEIGHT}px">${day.terrain()}</div><div class="phrasal-chapter-divider" style="top:${DESERT_HEIGHT}px;height:${NIGHT_OFFSET-DESERT_HEIGHT}px"><span>31–60</span><strong>月夜沙丘</strong><small>THE MOONLIT CARAVAN</small></div>${nightTerrain(nodes.slice(30,60),id)}${hasBakery?`<div class="phrasal-chapter-divider phrasal-bakery-divider" style="top:${NIGHT_OFFSET+NIGHT_HEIGHT}px;height:${BAKERY_OFFSET-NIGHT_OFFSET-NIGHT_HEIGHT}px"><span>61–90</span><strong>星空烘焙</strong><small>THE COSMIC BAKERY</small></div>${bakeryTerrain(nodes.slice(60),id)}`:''}`;}
 function mount(root,reduced){
  root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{stone.dataset.mapChapter=i>=60?'bakery':i>=30?'night':'day';if(i>=60){stone.dataset.bakery='true';stone.insertAdjacentHTML('afterbegin',bakeryPlatform(i,id));}else if(i>=30){stone.dataset.night='true';stone.insertAdjacentHTML('afterbegin',nightCoin(i,id));}});
  const first=day.mount(root,reduced),night=mountNight(root,reduced),bakery=hasBakery?mountBakery(root,reduced):null,viewport=root.querySelector('.expression-map-viewport'),picker=root.querySelector('.expression-map-picker select');
  viewport.setAttribute('aria-label',`動詞片語第 1 至 ${lessons.length} 課；${chapters.map(c=>c.label).join('、')}。點選地面自由走動、拖動探索，或使用方向鍵 / WASD。`);
  root.querySelector('.expression-map-desktop-hint').textContent='點選地面自由走動 · 拖動探索 · 方向鍵 / WASD';
  root.querySelector('.expression-map-tools').insertAdjacentHTML('afterend',`<nav class="phrasal-chapters" aria-label="選擇地圖區域">${chapters.map(c=>`<button type="button" data-phrasal-chapter="${c.key}" aria-pressed="${c.start===0}"><span>${c.range}</span> ${c.label}</button>`).join('')}</nav>`);
  const controls=root.querySelector('.phrasal-chapters');
  function jump(event){const button=event.target.closest('[data-phrasal-chapter]');if(!button)return;const chapter=chapters.find(c=>c.key===button.dataset.phrasalChapter);picker.value=lessons[chapter.start].id;picker.dispatchEvent(new Event('change',{bubbles:true}));}
  function syncChapter(){const scale=Number(root.dataset.scale)||1,chapter=root.dataset.overview==='true'?root.dataset.overviewSection:journeyOverview({y:viewport.scrollTop/scale+viewport.clientHeight/scale*.4}).key;root.dataset.currentChapter=chapter;controls.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.phrasalChapter===chapter)));}
  // Reduced motion does not run a continuous draw loop; controls still follow navigation.
  const afterSelection=()=>queueMicrotask(syncChapter);
  controls.addEventListener('click',jump);
  viewport.addEventListener('scroll',syncChapter,{passive:true});picker.addEventListener('change',afterSelection);
  return {draw(now){first.draw(now);night.draw(now);bakery?.draw(now);syncChapter();},destroy(){controls.removeEventListener('click',jump);viewport.removeEventListener('scroll',syncChapter);picker.removeEventListener('change',afterSelection);first.destroy();night.destroy();bakery?.destroy();}};
 }
 return {...day,title:'動詞片語 · 探索之旅',kicker:'THE PHRASAL VERB JOURNEY',height:journeyHeight(lessons.length),positions:()=>nodes,terrain,mount,navigation:createJourneyNavigation(nodes),overviewBounds:journeyOverview,cameraTop:({point,scale,height,zoom,overview})=>{
  const chapter=journeyOverview(point),local=point.y-chapter.top;
  if(overview)return chapter.top*scale;
  if(chapter.key==='day')return day.cameraTop({point,scale,height,zoom});
  return zoom===1&&local<(chapter.key==='bakery'?600:450)&&local*scale<height-155?chapter.top*scale:point.y*scale-height*.4;
 }};
}
