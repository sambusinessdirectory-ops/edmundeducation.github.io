import {sourceSpecs,sourceTicks,sourceLines,sourceBars} from './source-specs.mjs';
const shades=['#222','#777','#bbb','#555','#eee','#999'];
const tickValues=(lesson,panelIndex,min,max)=>sourceTicks(lesson,panelIndex,min,max);
const btn=(mark,label,extra='',className='')=>`<button type="button" class="markable ${className}" data-mark="${mark}" ${extra}>${label}</button>`;

function barPanel(panel,lesson,panelIndex,numbers,esc,format){
 const categories=panel.categories||lesson.categories;
 const series=panel.series||lesson.series;
 const axisTicks=tickValues(lesson,panelIndex,panel.min??lesson.min??0,panel.max??lesson.max);
 const min=axisTicks[0],max=axisTicks.at(-1);
 const unit=panel.unit||lesson.unit||'';
 const approximate=panel.approximate??lesson.approximate??false;
 const idPrefix=`panel-${panelIndex}`;
 const legend=`<div class="recon-legend">${series.map((item,index)=>btn(`${idPrefix}-legend-${index}`,`<i class="recon-pattern-${sourceBars(lesson)[index]||'dark'}"></i>${esc(item.name)}`,'','recon-legend-item')).join('')}</div>`;
 const title=panel!==lesson&&panel.title?`<h3>${btn(`${idPrefix}-heading`,esc(panel.title))}</h3>`:'';
 if(panel.orientation==='horizontal'||lesson.orientation==='horizontal'){
  const ticks=`<div class="recon-horizontal-axis">${tickValues(lesson,panelIndex,min,max).map((value,i)=>btn(`${idPrefix}-axis-${i}`,format(value))).join('')}</div>`;
  const rows=categories.map((category,categoryIndex)=>`<div class="recon-horizontal-row">${btn(`${idPrefix}-category-${categoryIndex}`,esc(category),'','recon-category')}<div class="recon-horizontal-tracks" style="--grid-step:${100/(axisTicks.length-1)}%">${series.map((item,seriesIndex)=>{
   const value=item.values[categoryIndex],datumId=`${idPrefix}-${categoryIndex}-${seriesIndex}`;
   numbers.set(datumId,{id:datumId,value,label:`${category} · ${item.name}${approximate?' (approximately)':''}`});
   const width=Math.max(0,Math.min(100,(value-min)/(max-min)*100));
   return `<div class="recon-horizontal-track" style="--bar-width:${width}%">${btn(`bar-${datumId}`,'',`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${approximate?'approximately ':''}${format(value)} ${esc(unit)}" style="width:${width}%"`,`recon-horizontal-bar recon-pattern-${sourceBars(lesson)[seriesIndex]||'dark'}`)}${btn(`value-${datumId}`,`${approximate?'≈':''}${format(value)}`,`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${format(value)} ${esc(unit)}"`,'recon-horizontal-value')}</div>`;
  }).join('')}</div></div>`).join('');
  return `<section class="recon-panel">${title}<div class="recon-horizontal">${rows}${ticks}</div>${legend}<p class="recon-unit">${esc(unit)}${approximate?' · ≈ indicates a value estimated from the printed scale':''}</p></section>`;
 }
 const ticks=tickValues(lesson,panelIndex,min,max).slice().reverse();
 const axis=`<div class="recon-vertical-axis">${ticks.map((value,i)=>btn(`${idPrefix}-axis-${i}`,format(value))).join('')}</div>`;
 const columns=categories.map((category,categoryIndex)=>`<div class="recon-category-column"><div class="recon-bars">${series.map((item,seriesIndex)=>{
  const value=item.values[categoryIndex],datumId=`${idPrefix}-${categoryIndex}-${seriesIndex}`;
  numbers.set(datumId,{id:datumId,value,label:`${category} · ${item.name}${approximate?' (approximately)':''}`});
  const height=Math.max(0,Math.min(100,(value-min)/(max-min)*100));
  return `<div class="recon-bar-stack" style="--bar-height:${height}%">${btn(`value-${datumId}`,`${approximate?'≈':''}${format(value)}`,`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${format(value)} ${esc(unit)}"`,'recon-vertical-value')}${btn(`bar-${datumId}`,'',`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${approximate?'approximately ':''}${format(value)} ${esc(unit)}"`,`recon-vertical-bar recon-pattern-${sourceBars(lesson)[seriesIndex]||'dark'}`)}</div>`;
 }).join('')}</div>${btn(`${idPrefix}-category-${categoryIndex}`,esc(category),'','recon-category')}</div>`).join('');
 return `<section class="recon-panel">${title}<div class="recon-vertical">${axis}<div class="recon-column-area"><div class="recon-grid">${ticks.map((_,i)=>`<i style="bottom:${i*100/(ticks.length-1)}%"></i>`).join('')}</div><div class="recon-columns">${columns}</div></div></div>${legend}<p class="recon-unit">${esc(unit)}${approximate?' · ≈ indicates a value estimated from the printed scale':''}</p></section>`;
}
const dashArray={solid:'',dash:'10 7',dot:'2 6',dashdot:'12 5 2 5',hatch:'12 4 3 4'};
function marker(type,x,y,colour){
 const open=type.endsWith('-open'),shape=type.replace('-open',''),fill=open?'#fff':'#555';
 if(shape==='none')return `<circle cx="${x}" cy="${y}" r="8" class="recon-invisible-point"/>`;
 if(shape==='circle')return `<circle cx="${x}" cy="${y}" r="5" fill="${fill}" stroke="${colour}" stroke-width="2"/>`;
 if(shape==='square')return `<rect x="${x-5}" y="${y-5}" width="10" height="10" fill="${fill}" stroke="${colour}" stroke-width="2"/>`;
 if(shape==='triangle')return `<path d="M ${x} ${y-6} L ${x+6} ${y+5} L ${x-6} ${y+5} Z" fill="${fill}" stroke="${colour}" stroke-width="2"/>`;
 if(shape==='diamond')return `<path d="M ${x} ${y-6} L ${x+6} ${y} L ${x} ${y+6} L ${x-6} ${y} Z" fill="${fill}" stroke="${colour}" stroke-width="2"/>`;
 return `<path d="M ${x-5} ${y-5} L ${x+5} ${y+5} M ${x+5} ${y-5} L ${x-5} ${y+5}" fill="none" stroke="${colour}" stroke-width="2"/>`;
}
function smoothPath(points){
 if(points.length<2)return '';
 return `M ${points[0][0]} ${points[0][1]} `+points.slice(1).map(([x,y],i)=>{
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  return `C ${p1[0]+(p2[0]-p0[0])/6} ${p1[1]+(p2[1]-p0[1])/6}, ${p2[0]-(p3[0]-p1[0])/6} ${p2[1]-(p3[1]-p1[1])/6}, ${x} ${y}`;
 }).join(' ');
}
function linePanel(panel,lesson,panelIndex,numbers,esc,format){
 const categories=panel.categories||lesson.categories,series=panel.series||lesson.series;
 const ticks=tickValues(lesson,panelIndex,panel.min??lesson.min??0,panel.max??lesson.max);
 const min=ticks[0],max=ticks.at(-1),unit=panel.unit||lesson.unit||'';
 const approximate=panel.approximate??lesson.approximate??false;
 const left=93,top=32,width=810,height=390,px=index=>left+(categories.length===1?0:index/(categories.length-1)*width),py=value=>top+(max-value)/(max-min)*height;
 const prefix=`panel-${panelIndex}`,styles=sourceLines(lesson,panelIndex),isHistory=!!sourceSpecs[lesson.id]?.historyUntil;
 const axis=ticks.map((value,index)=>{const y=py(value);return `<line x1="${left}" x2="${left+width}" y1="${y}" y2="${y}" class="recon-svg-grid"/><text x="${left-11}" y="${y+4}" text-anchor="end" role="button" tabindex="0" class="markable recon-svg-label" data-mark="${prefix}-axis-${index}">${esc(format(value))}</text>`;}).join('');
 const xAxis=categories.map((category,index)=>`<text x="${px(index)}" y="${top+height+25}" text-anchor="middle" role="button" tabindex="0" class="markable recon-svg-label" data-mark="${prefix}-category-${index}">${esc(category)}</text>`).join('');
 const lineColours=series.length>4?['#303030','#555','#777','#999','#444','#aaa']:['#333','#666','#555','#888'];
 const lines=series.map((item,seriesIndex)=>{
  const colour=lineColours[seriesIndex%lineColours.length],[stroke,mark]=styles[seriesIndex]||['solid','circle'];
  const pointCoords=item.values.map((value,index)=>[px(index),py(value)]);
  const d=sourceSpecs[lesson.id]?.smooth?smoothPath(pointCoords):`M ${pointCoords.map(([x,y])=>`${x} ${y}`).join(' L ')}`;
  const path=`<path d="${d}" fill="none" stroke="${colour}" stroke-width="2.5" stroke-dasharray="${dashArray[stroke]||''}" stroke-linejoin="round" stroke-linecap="round" role="button" tabindex="0" class="markable recon-line" data-mark="${prefix}-line-${seriesIndex}"><title>${esc(item.name)}</title></path>`;
  const points=item.values.map((value,index)=>{
   const datumId=`${prefix}-${index}-${seriesIndex}`,x=px(index),y=py(value);
   numbers.set(datumId,{id:datumId,value,label:`${categories[index]} · ${item.name}${approximate?' (approximately)':''}`});
   return `<g role="button" tabindex="0" class="markable recon-point" data-mark="point-${datumId}" data-number="${datumId}" aria-label="${esc(categories[index])} · ${esc(item.name)} ${approximate?'approximately ':''}${format(value)} ${esc(unit)}"><circle cx="${x}" cy="${y}" r="10" class="recon-point-hit"/>${marker(mark,x,y,colour)}<title>${esc(categories[index])} · ${esc(item.name)} ${approximate?'≈':''}${format(value)} ${esc(unit)}</title></g>`;
  }).join('');
  return path+points;
 }).join('');
 const legend=`<div class="recon-legend recon-line-legend">${series.map((item,index)=>{const [stroke,mark]=styles[index]||['solid','circle'];return btn(`${prefix}-legend-${index}`,`<svg viewBox="0 0 46 18" aria-hidden="true"><line x1="1" y1="9" x2="45" y2="9" stroke="#444" stroke-width="2" stroke-dasharray="${dashArray[stroke]||''}"/>${marker(mark,23,9,'#444')}</svg>${esc(item.name)}`,'','recon-legend-item');}).join('')}</div>`;
 const panelTitle=panel!==lesson&&panel.title?`<h3>${btn(`${prefix}-heading`,esc(panel.title))}</h3>`:'';
 const history=isHistory?`<text x="${left+width*.24}" y="485" text-anchor="middle" class="recon-svg-phase">History</text><text x="${left+width*.76}" y="485" text-anchor="middle" class="recon-svg-phase">Projections</text>`:'';
 return `<section class="recon-panel recon-line-panel">${panelTitle}<svg viewBox="0 0 980 ${isHistory?510:475}" role="img" aria-label="${esc(panel.title||lesson.title)} interactive line graph" class="recon-line-svg"><line x1="${left}" x2="${left}" y1="${top}" y2="${top+height}" class="recon-svg-axis"/><line x1="${left}" x2="${left+width}" y1="${top+height}" y2="${top+height}" class="recon-svg-axis"/>${axis}${xAxis}${lines}${history}</svg>${legend}<p class="recon-unit">${esc(unit)}${approximate?' · ≈ indicates a value estimated from the printed scale':''}</p></section>`;
}
const piePatterns=['white','light','medium','dark','black','hatch','cross','dots','slash','mid'];
function patternDefs(prefix){return `<defs>
 <pattern id="${prefix}-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><path d="M -2 8 L 8 -2 M 2 10 L 10 2" stroke="#666" stroke-width="1.4"/></pattern>
 <pattern id="${prefix}-slash" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f6f6f6"/><path d="M -2 8 L 8 -2 M 2 10 L 10 2" stroke="#555" stroke-width="1.6"/></pattern>
 <pattern id="${prefix}-cross" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><path d="M -2 8 L 8 -2 M 2 10 L 10 2 M -2 0 L 8 10 M 2 -2 L 10 6" stroke="#777" stroke-width="1"/></pattern>
 <pattern id="${prefix}-dots" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#f7f7f7"/><circle cx="3.5" cy="3.5" r="1.5" fill="#777"/></pattern></defs>`;}
function pieFill(type,prefix){return type==='black'?'#161616':type==='dark'?'#555':type==='medium'?'#888':type==='mid'?'#aaa':type==='light'?'#ccc':type==='white'?'#fff':`url(#${prefix}-${type})`;}
function piePanel(panel,lesson,panelIndex,numbers,esc,format){
 const categories=panel.categories||lesson.categories,values=panel.values;
 const total=values.reduce((sum,value)=>sum+value,0),prefix=`panel-${panelIndex}`,patterns=sourceSpecs[lesson.id]?.pies||piePatterns;
 const visualOrder=lesson.id==='T1-021'?[1,2,3,4,5,0]:values.map((_,i)=>i);
 const labelInside=['T1-018','T1-054','T1-056'].includes(lesson.id);
 let angle=-Math.PI/2;
 const slices=visualOrder.map(index=>{
  const value=values[index],start=angle,sweep=value/total*Math.PI*2;angle+=sweep;
  const end=angle,mid=start+sweep/2,polar=(a,r)=>`${160+Math.cos(a)*r},${160+Math.sin(a)*r}`;
  const d=`M 160 160 L ${polar(start,126)} A 126 126 0 ${sweep>Math.PI?1:0} 1 ${polar(end,126)} Z`;
  const id=`${prefix}-${index}`,label=`${panel.title||lesson.title} · ${categories[index]}`;
  numbers.set(id,{id,value,label});
  const localNames=['T1-021','T1-023'].includes(lesson.id);
  const textRadius=labelInside?79:lesson.id==='T1-023'?154:localNames?169:145;
  let tx=160+Math.cos(mid)*textRadius,ty=160+Math.sin(mid)*textRadius;
  let anchor=localNames?(Math.cos(mid)>0?'start':'end'):'middle';
  if(lesson.id==='T1-021'&&panelIndex===0){
   const overrides={4:[154,355,'middle'],5:[-5,315,'end']};
   if(overrides[index])[tx,ty,anchor]=overrides[index];
  }
  const dark=['black','dark','medium','mid'].includes(patterns[index]);
  const leader=localNames?`<path d="M ${polar(mid,127)} L ${polar(mid,155)}" fill="none" stroke="#444" stroke-width="1.3"/>`:'';
  const labelText=localNames?`<tspan x="${tx}">${esc(categories[index])}</tspan><tspan x="${tx}" dy="15">${esc(format(value))}%</tspan>`:`${esc(format(value))}%`;
  return `<path d="${d}" fill="${pieFill(patterns[index],prefix)}" stroke="#333" stroke-width="1.4" role="button" tabindex="0" class="markable recon-pie-slice" data-mark="slice-${id}" data-number="${id}" aria-label="${esc(label)} ${format(value)}%"><title>${esc(label)} ${format(value)}%</title></path>${leader}<text x="${tx}" y="${ty+4}" text-anchor="${anchor}" fill="${dark&&labelInside?'#fff':'#222'}" class="recon-pie-label${localNames?' recon-pie-local-label':''}" role="button" tabindex="0" data-mark="slice-label-${id}" data-number="${id}">${labelText}</text>`;
 }).join('');
 const legend=categories.map((category,index)=>{const id=`${prefix}-${index}`,label=`${category} · ${format(values[index])}%`;return `<div class="recon-pie-key">${btn(`legend-${id}`,`<i style="background:${pieFill(patterns[index],prefix)}" class="recon-pattern-${patterns[index]}"></i>${esc(category)}`,'','recon-legend-item')}${btn(`value-${id}`,`${format(values[index])}%`,`data-number="${id}" aria-label="${esc(label)}"`,'recon-pie-value')}</div>`}).join('');
 const showLegend=lesson.kind==='mixed'||lesson.id==='T1-020';
 return `<section class="recon-panel recon-pie-panel">${panel!==lesson?`<h3>${btn(`${prefix}-heading`,esc(panel.title||lesson.title))}</h3>`:''}<div class="recon-pie-layout"><svg class="recon-pie-svg" viewBox="${['T1-021','T1-023'].includes(lesson.id)?'-100 -50 520 420':'0 0 320 320'}" role="img" aria-label="${esc(panel.title||lesson.title)} interactive pie chart">${patternDefs(prefix)}${slices}</svg>${showLegend?`<div class="recon-pie-keys">${legend}</div>`:''}</div></section>`;
}
function tablePanel(panel,lesson,panelIndex,numbers,esc,format){
 const prefix=`panel-${panelIndex}`;
 const headings=panel.columns.map((heading,index)=>`<th scope="col">${lesson.id==='T1-051'&&index===0?'':btn(`${prefix}-column-${index}`,esc(heading))}</th>`).join('');
 const spanning=lesson.id==='T1-051'?`<tr><th scope="col">${btn(`${prefix}-group-country`,'Country')}</th><th colspan="3" scope="colgroup">${btn(`${prefix}-group-unit`,'Consumption (calories per person per day)')}</th></tr>`:'';
 const rows=panel.rows.map((row,rowIndex)=>`<tr>${row.map((cell,columnIndex)=>{
  const id=`${prefix}-${rowIndex}-${columnIndex}`;
  let display=typeof cell==='number'&&columnIndex>0&&!(lesson.id==='T1-045'&&columnIndex===1)?format(cell):String(cell);
  const normalized=String(cell).replace('−','-').replace(/,/g,'');
  const value=typeof cell==='number'?cell:/^[-+]?\d[\d,.]*(?:\s*%|\s*cents)?$/.test(normalized)?Number.parseFloat(normalized):null;
  if(lesson.id==='T1-056'&&columnIndex>0&&/^\d/.test(display))display+='m';
  if(['T1-057','T1-058'].includes(lesson.id)&&columnIndex===1)display=display.replace(/^\+/,'▲ ').replace(/^[−-]/,'▼ ');
  const label=`${row[0]} · ${panel.columns[columnIndex]}`;
  numbers.set(id,{id,value,label});
  return `<${columnIndex?'td':'th scope="row"'}>${btn(`cell-${id}`,esc(display),`data-number="${id}" aria-label="${esc(label)} ${esc(display)}"`,'recon-table-cell')}</${columnIndex?'td':'th'}>`;
 }).join('')}</tr>`).join('');
 return `<section class="recon-panel recon-table-panel">${panel.title?`<h3>${btn(`${prefix}-heading`,esc(panel.title))}</h3>`:''}<div class="recon-table-scroll"><table class="recon-table"><thead>${spanning}<tr>${headings}</tr></thead><tbody>${rows}</tbody></table></div>${panel.unit&&lesson.id!=='T1-051'?`<p class="recon-unit">${esc(panel.unit)}</p>`:''}</section>`;
}
function processPanel(panel,lesson,panelIndex,numbers,esc,format){
 const prefix=`panel-${panelIndex}`,stages=panel.stages||lesson.stages;
 const steps=stages.map((stage,index)=>{
  const id=`${prefix}-${index}`,title=typeof stage==='string'?stage:stage.label,detail=typeof stage==='string'?'':stage.detail||'';
  numbers.set(id,{id,value:null,label:title});
  let tokenIndex=0;const detailParts=detail.split(/(\d+(?:[.,]\d+)?%?)/g).filter(Boolean).map(part=>{const numeric=/^\d/.test(part),partId=`${id}-detail-${tokenIndex++}`;if(numeric)numbers.set(partId,{id:partId,value:Number.parseFloat(part.replace(',','.')),label:`${title} · ${part}`});return btn(`detail-${partId}`,esc(part),numeric?`data-number="${partId}"`:'','recon-flow-detail-part')}).join('');
  const card=`<div class="recon-flow-stage">${btn(`stage-number-${id}`,String(index+1),'','recon-flow-number')}${btn(`stage-${id}`,esc(title),`data-number="${id}"`,'recon-flow-title')}${detail?`<div class="recon-flow-detail">${detailParts}</div>`:''}</div>`;
  return index?`${btn(`connector-${prefix}-${index-1}`,'→',`aria-label="${esc(stages[index-1].label||stages[index-1])} to ${esc(title)}"`,'recon-flow-arrow')}${card}`:card;
 }).join('');
 const extras=(panel.extras||[]).map((item,index)=>btn(`${prefix}-extra-${index}`,esc(item),'','recon-flow-extra')).join('');
 const repeat=panel.cycle?btn(`${prefix}-cycle`,'↺ '+esc(panel.cycle),'','recon-flow-cycle'):'';
 return `<section class="recon-panel recon-process-panel">${panel!==lesson?`<h3>${btn(`${prefix}-heading`,esc(panel.title||lesson.title))}</h3>`:''}<div class="recon-flow">${steps}</div>${extras?`<div class="recon-flow-extras">${extras}</div>`:''}${repeat}</section>`;
}
function mapPanel(panel,lesson,panelIndex,numbers,esc,format){
 const prefix=`panel-${panelIndex}`;
 const paths=(panel.paths||[]).map((path,index)=>`<path d="${esc(path.d)}" class="markable recon-map-path recon-map-${esc(path.kind||'road')}" data-mark="${prefix}-path-${index}" role="button" tabindex="0" aria-label="${esc(path.label||path.kind||'route')}"><title>${esc(path.label||path.kind||'route')}</title></path>`).join('');
 const features=panel.features.map((feature,index)=>{
  const id=`${prefix}-${index}`,f=typeof feature==='string'?{label:feature,x:10+(index%4)*22,y:15+Math.floor(index/4)*22}:feature;
  numbers.set(id,{id,value:Number.isFinite(f.value)?f.value:null,label:`${panel.title||lesson.title} · ${f.label}`});
  return btn(`feature-${id}`,esc(f.label),`data-number="${id}" aria-label="${esc(f.label)}" style="left:${f.x}%;top:${f.y}%;width:${f.w||16}%;height:${f.h||12}%"` ,`recon-map-feature recon-map-feature-${esc(f.kind||'facility')}`);
 }).join('');
 return `<section class="recon-panel recon-map-panel">${panel!==lesson?`<h3>${btn(`${prefix}-heading`,esc(panel.title||lesson.title))}</h3>`:''}<div class="recon-map-canvas"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="false">${paths}</svg>${features}</div><p class="recon-map-note">Select a place, road or area to group it and add it to Organization.</p></section>`;
}
export function renderReconstruction(lesson,numbers,esc,format){
 if(!['bar','line','pie','table','mixed','process','map'].includes(lesson.kind))throw new Error(`Unsupported reconstruction: ${lesson.kind}`);
 const panels=lesson.panels||[lesson],spec=sourceSpecs[lesson.id]||{};
 const contents=panels.map((panel,index)=>(panel.kind||lesson.kind)==='bar'?barPanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='line'?linePanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='pie'?piePanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='table'?tablePanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='process'?processPanel(panel,lesson,index,numbers,esc,format):mapPanel(panel,lesson,index,numbers,esc,format)).join('');
 const pieLegend=lesson.kind==='pie'&&!['T1-020','T1-021','T1-023'].includes(lesson.id)?`<div class="recon-shared-legend">${lesson.categories.map((name,index)=>btn(`chart-pie-legend-${index}`,`<i class="recon-pattern-${spec.pies?.[index]||'light'}"></i>${esc(name)}`,'','recon-legend-item')).join('')}</div>`:'';
 const note=lesson.id==='T1-044'?`<p class="recon-source-note">* Fairtrade: a category of products for which farmers from developing countries have been paid an officially agreed fair price.</p>`:'';
 const layout=lesson.kind==='pie'?`recon-pie-grid recon-pie-cols-${spec.pieColumns||1}${spec.pieLastCentered?' recon-pie-center-last':''}`:spec.mixedLayout?`recon-mixed-${spec.mixedLayout}`:'';
 return `<div class="reconstructed-chart recon-source-${lesson.id}"><div class="recon-chart-title">${btn('chart-heading',esc(lesson.title))}</div><div class="${layout}">${contents}</div>${pieLegend}${note}</div>`;
}
