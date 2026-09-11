// Artwork and layout only. Lesson state and navigation belong to the shared map.
import { gardenPath, gardenStep } from './common-expression-garden-navigation.mjs?v=20260912-garden1';
import { mountGardenDucks } from './common-expression-garden-ducks.mjs?v=20260912-garden1';
const ART = './assets/common-expression-written/garden/';

function terrain(nodes, lessons) {
  const route = nodes.map((p, i) => {
    if (!i) return `M${p.x} ${p.y}`;
    const a = nodes[i - 1];
    if (a.x === p.x) {
      const bend = p.x > 800 ? 85 : -85;
      return `C${a.x + bend} ${a.y + 70} ${p.x + bend} ${p.y - 70} ${p.x} ${p.y}`;
    }
    return `C${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  const trees = [[60,780,190,0],[1540,780,210,2],[55,1450,195,4],[1550,1450,190,1]];
  const ducks = [[1375,222,48,0],[1470,259,39,3],[1340,1770,76,2],[1470,1850,64,5]];
  return `<div class="garden-scenery" aria-hidden="true">
    <img class="garden-background" src="${ART}background.webp" width="1600" height="1950" alt="" decoding="async">
    <svg class="garden-route" viewBox="0 0 1600 1950" xmlns="http://www.w3.org/2000/svg">
      <path d="${route}" fill="none" stroke="#61713e" stroke-width="65" stroke-linecap="round" opacity=".22" transform="translate(0 7)"/>
      <path d="${route}" fill="none" stroke="#c5b58e" stroke-width="59" stroke-linecap="round"/>
      <path d="${route}" fill="none" stroke="#f6e7c5" stroke-width="49" stroke-linecap="round"/>
      <path d="${route}" fill="none" stroke="#fff8e8" stroke-width="2" stroke-dasharray="3 20" stroke-linecap="round"/>
    </svg>
    ${trees.map(([x,y,size,delay])=>`<span class="garden-tree" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;--delay:-${delay}s"><span class="garden-sprite"></span></span>`).join('')}
    ${nodes.map((node,i)=>lessons[i].order%10===0?`<span class="garden-milestone" data-milestone="${lessons[i].order}" style="left:${node.x-112}px;top:${node.y-28}px"><span class="garden-sprite"></span><b>${lessons[i].order}</b></span>`:'').join('')}
    ${ducks.map(([x,y,size,delay])=>`<span class="garden-duck" data-duck-phase="${delay}" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px"><span class="garden-duck-wake"></span><canvas width="192" height="192" aria-hidden="true"></canvas></span>`).join('')}
  </div>`;
}

export const WRITTEN_GARDEN = Object.freeze({
  id: 'blossom',
  title: '常用語寫作花園',
  kicker: 'THE WRITING GARDEN',
  width: 1600,
  height: 1950,
  layout: { startY: 300, rowGap: 330 },
  terrain,
  navigation: { path: gardenPath, step: gardenStep },
  mount: mountGardenDucks,
  // This layer belongs to the viewport, so petals enter from its upper-right edge
  // even after the student scrolls to the bottom of the illustrated world.
  overlay: `<div class="garden-petals" aria-hidden="true">${Array.from({length:8},(_,i)=>`<span class="garden-petal" style="--start:${72+i*4}%;--drift:${-200-i*51}px;--duration:${12+i*1.3}s;--delay:-${i*2.7}s;--size:${25+i%3*9}px"></span>`).join('')}</div>`
});
