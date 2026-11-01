import {interactiveDiagrams} from './interactive-diagrams.mjs';

export function renderInteractiveDiagram(question,image,numbers,esc){
 const diagram=interactiveDiagrams[question.id];
 if(!diagram)throw new Error(`Missing interactive diagram for ${question.id}`);
 const regions=diagram.zones.map((zone,index)=>{
  const id=zone.key||`region-${index}`,mark=`diagram-${id}`;
  numbers.set(id,{id,label:zone.label,value:Number.isFinite(zone.value)?zone.value:null});
  const common=`class="markable diagram-hotspot${zone.path?' diagram-route':''}" data-mark="${esc(mark)}" data-number="${esc(id)}" role="button" tabindex="0" aria-label="${esc(zone.label)}${Number.isFinite(zone.value)?` · ${zone.value}`:''}"`;
  const shape=zone.path?`<svg x="${zone.box.x}" y="${zone.box.y}" width="${zone.box.w}" height="${zone.box.h}" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible"><path d="${esc(zone.path)}" fill="none" stroke-width="7" ${common}><title>${esc(zone.label)}</title></path></svg>`:`<rect x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}" rx="1.2" ${common}><title>${esc(zone.label)}</title></rect>`;
  const item=`<button type="button" class="markable diagram-index-item" data-mark="${esc(mark)}" data-number="${esc(id)}">${esc(zone.label)}${Number.isFinite(zone.value)?` · ${zone.value}`:''}</button>`;
  return {shape,item};
 });
 const figure=`<svg class="diagram-artwork" viewBox="0 0 100 100" preserveAspectRatio="none" role="group" aria-label="${esc(question.prompt)} interactive diagram" style="aspect-ratio:${diagram.width}/${diagram.height}"><image href="${esc(image)}" x="0" y="0" width="100" height="100" preserveAspectRatio="none" pointer-events="none" aria-hidden="true"/>${regions.map(region=>region.shape).join('')}</svg>`;
 return `<div class="interactive-original-diagram"><div class="diagram-controls"><span>點選原圖中的物件、區域、箭嘴或數據，可分組與排序。</span><button type="button" data-toggle-diagram-zones aria-pressed="false">顯示可選區域</button></div>${figure}<details class="diagram-index"><summary>圖中可選元素 · ${regions.length}</summary><div>${regions.map(region=>region.item).join('')}</div></details></div>`;
}
export function diagramCoverage(){return Object.fromEntries(Object.entries(interactiveDiagrams).map(([id,item])=>[id,item.zones.length]));}
