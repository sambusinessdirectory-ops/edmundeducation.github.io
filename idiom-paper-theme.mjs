import {PAPER_WIDTH,PAPER_HEIGHT,paperPositions,paperTrailPath,paperPath,paperStep} from './idiom-paper-geometry.mjs?v=20260913-paper2';
import {createPaperEffects} from './idiom-paper-effects.mjs?v=20260913-paper2';
import {loadPaperArtwork,drawPaperPlatform} from './idiom-paper-artwork.mjs?v=20260913-paper2';
const ART='./assets/idiom-system/paper/v2/';
function terrain(nodes) {
  const d=paperTrailPath(nodes);
  return `<div class="paper-core"><img class="paper-background" src="${ART}landscape.webp" width="1672" height="941" alt="" decoding="async"><img class="paper-foreground" src="${ART}foreground.webp" width="1691" height="930" alt="" decoding="async"></div><svg class="paper-trail" viewBox="0 0 1600 1950" aria-hidden="true"><defs><filter id="idiom-path-shadow"><feGaussianBlur stdDeviation="4"/></filter><pattern id="paper-path-material" patternUnits="userSpaceOnUse" width="90" height="45" viewBox="1192 745 90 45"><image href="${ART}props.webp" width="1536" height="1024"/></pattern><mask id="idiom-bridge-gap"><rect width="1600" height="1950" fill="white"/><path d="M545 315C597 280 658 285 703 299C735 311 768 325 793 330M1240 612C1190 564 1105 523 1020 533C961 535 904 569 856 600" fill="none" stroke="black" stroke-width="74"/></mask></defs><g mask="url(#idiom-bridge-gap)"><path class="paper-trail-shadow" d="${d}"/><path class="paper-trail-edge" d="${d}"/><path class="paper-trail-top" d="${d}"/><path class="paper-trail-fiber" d="${d}"/><path class="paper-trail-stitch" d="${d}"/></g></svg><canvas class="paper-effects" width="1600" height="1950" aria-hidden="true"></canvas>`;
}
function mount(root,reduced) {
  const viewport=root.querySelector('.expression-map-viewport');
  viewport.setAttribute('aria-label','慣用語紙藝地圖，第 1 至 30 課；拖動探索，點選課題，或用方向鍵 / WASD 走動。');
  const platforms=[...root.querySelectorAll('.expression-map-stone')].map(stone=>{const c=document.createElement('canvas');c.className='paper-level-platform';c.setAttribute('aria-hidden','true');stone.prepend(c);return c;});
  let disposed=false;
  loadPaperArtwork().then(art=>{if(!disposed)platforms.forEach(c=>drawPaperPlatform(c,art));}).catch(()=>{});
  const effects=createPaperEffects(root.querySelector('.paper-effects'));
  let elapsed=0,last=0,lastPaint=-Infinity;
  return {
    draw(now) {
      if(last&&!reduced.matches)elapsed+=Math.min(100,Math.max(0,now-last))/1000;
      last=now;const t=reduced.matches?0:elapsed;
      if(reduced.matches||t-lastPaint>=1/30){effects?.paint(t);lastPaint=t;}
    },
    destroy(){disposed=true;effects?.destroy();}
  };
}
export const IDIOM_PAPER_THEME=Object.freeze({
  id:'idiom-paper',title:'慣用語探索之旅',kicker:'IDIOM SYSTEM',
  width:PAPER_WIDTH,height:PAPER_HEIGHT,cameraPadding:{left:800,right:800},minimumZoom:.5,
  cameraViewWidth:()=>1600,cameraScaleFloor:()=>.7,
  positions:paperPositions,terrain,mount,navigation:{path:paperPath,step:paperStep},
  cameraTop:({point,scale,height,zoom})=>zoom===1&&height>=600&&point.y*scale<=height-50?0:point.y*scale-height*.4
});
