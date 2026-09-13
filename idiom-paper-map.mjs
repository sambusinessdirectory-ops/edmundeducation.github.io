import {createExpressionMap} from './common-expression-map.mjs?v=20260912-toy1';
import {IDIOM_PAPER_THEME} from './idiom-paper-theme.mjs?v=20260913-paper3';
export const IDIOM_MAP_LIMIT=30;
export function idiomMapLessons(lessons) {
  return lessons.slice(0,IDIOM_MAP_LIMIT).map((lesson,index)=>({
    id:lesson.id,order:index+1,titleEn:lesson.titleEn||lesson.id,titleZh:lesson.title||lesson.titleZh||'',
    mapLabel:lesson.titleEn||lesson.id,questions:lesson.questions||[],image:lesson.image||'',imageAlt:lesson.imageAlt||lesson.titleEn||''
  }));
}
// An obsolete, differently-sized attempt must not mark the current lesson done.
export function idiomMapCompleted(attempts,lesson) {
  const total=lesson?.questions.length||0;
  if(!total)return 0;
  const current=attempts.filter(a=>a.lessonId===lesson.id&&a.totalCount===total);
  if(current.some(a=>a.status==='completed'&&a.correctCount>=total))return total;
  const best=Math.max(0,...current.map(a=>Number(a.correctCount)||0));
  return Math.min(total-1,best);
}
export function mountIdiomMap({root,toggle,grid,remaining,lessons,getAttempts,openLesson}) {
  const mapped=idiomMapLessons(lessons);
  const theme={...IDIOM_PAPER_THEME,mount(scene,reduced){
    const motion=IDIOM_PAPER_THEME.mount(scene,reduced);
    const card=scene.querySelector('.expression-map-lesson-card');
    const preview=document.createElement('img');preview.className='paper-lesson-preview';
    preview.width=88;preview.height=68;preview.decoding='async';preview.hidden=true;
    card.querySelector('.expression-map-selected-copy').after(preview);
    const update=()=>{
      const lesson=mapped.find(l=>l.id===scene.querySelector('.expression-map-picker select').value);
      preview.hidden=!lesson?.image;card.classList.toggle('paper-has-preview',Boolean(lesson?.image));
      if(lesson?.image){if(preview.getAttribute('src')!==lesson.image)preview.src=lesson.image;preview.alt=lesson.imageAlt;}
    };
    update();return {...motion,update};
  }};
  const map=createExpressionMap({root,toggle,grid,lessons:mapped,
    getCompleted:id=>idiomMapCompleted(getAttempts(),mapped.find(l=>l.id===id)),openLesson,
    systemKey:'idiom-system',theme});
  const sync=()=>{if(remaining)remaining.hidden=root.hidden||lessons.length<=IDIOM_MAP_LIMIT;};
  const observer=new MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['hidden']});
  sync();
  return {...map,update(owner){map.update(owner);sync();},reset(){map.reset();sync();},destroy(){observer.disconnect();map.destroy();}};
}
