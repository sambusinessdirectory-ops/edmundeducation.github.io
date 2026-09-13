import {PAPER_WIDTH,PAPER_HEIGHT,paperPositions,paperTrailPath,paperPath,paperStep} from './idiom-paper-geometry.mjs?v=20260913-paper1';
import {createPaperEffects} from './idiom-paper-effects.mjs?v=20260913-paper1';
const ART='./assets/idiom-system/paper/';
function terrain(nodes) {
  const d=paperTrailPath(nodes);
  return `<img class="paper-background" src="${ART}background.webp" width="3200" height="1950" alt="" decoding="async"><svg class="paper-trail" viewBox="0 0 1600 1950" aria-hidden="true"><defs><filter id="idiom-path-shadow"><feGaussianBlur stdDeviation="4"/></filter><mask id="idiom-bridge-gap"><rect width="1600" height="1950" fill="white"/><path d="M574 348Q650 305 807 393M1117 732C1040 659 905 609 832 688" fill="none" stroke="black" stroke-width="73"/></mask></defs><g mask="url(#idiom-bridge-gap)"><path class="paper-trail-shadow" d="${d}"/><path class="paper-trail-edge" d="${d}"/><path class="paper-trail-top" d="${d}"/><path class="paper-trail-stitch" d="${d}"/></g></svg><canvas class="paper-effects" width="1600" height="1950" aria-hidden="true"></canvas>`;
}
function mount(root,reduced) {
  const viewport=root.querySelector('.expression-map-viewport');
  viewport.setAttribute('aria-label','慣用語紙藝地圖，第 1 至 30 課；拖動探索，點選課題，或用方向鍵 / WASD 走動。');
  root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{
    const colors=['#bd7453','#5f8990','#869357','#b99457'];
    stone.insertAdjacentHTML('afterbegin',`<svg class="paper-level-platform" viewBox="0 0 180 96" aria-hidden="true"><ellipse cx="90" cy="80" rx="75" ry="8" fill="#476045" opacity=".12"/><path d="M12 20L27 12H154L169 27V65L150 81H30L11 65Z" fill="#ad9870"/><path d="M12 17L27 8H152L168 20V58L151 72H27L11 58Z" fill="#e2d3ad" stroke="#bda779" stroke-width="1.5"/><path d="M14 14L29 4H151L166 16V54L150 67H28L14 55Z" fill="#f3e9ce" stroke="#f9f1df" stroke-width="1.8"/><path d="M29 4L29 66M150 5V65" stroke="${colors[i%4]}" stroke-width="3" opacity=".62"/><path d="M153 5L166 16L153 18Z" fill="#d3bf94"/></svg>`);
  });
  const effects=createPaperEffects(root.querySelector('.paper-effects'));
  let elapsed=0,last=0,lastPaint=-Infinity;
  return {
    draw(now) {
      if(last&&!reduced.matches)elapsed+=Math.min(100,Math.max(0,now-last))/1000;
      last=now;const t=reduced.matches?0:elapsed;
      if(reduced.matches||t-lastPaint>=1/30){effects?.paint(t);lastPaint=t;}
    },
    destroy(){effects?.destroy();}
  };
}
export const IDIOM_PAPER_THEME=Object.freeze({
  id:'idiom-paper',title:'慣用語探索之旅',kicker:'IDIOM SYSTEM',
  width:PAPER_WIDTH,height:PAPER_HEIGHT,cameraPadding:{left:800,right:800},minimumZoom:.5,
  cameraViewWidth:()=>1800,cameraScaleFloor:()=>.7,
  positions:paperPositions,terrain,mount,navigation:{path:paperPath,step:paperStep},
  cameraTop:({point,scale,height,zoom})=>zoom===1&&height>=600&&point.y*scale<=height-50?0:point.y*scale-height*.4
});
