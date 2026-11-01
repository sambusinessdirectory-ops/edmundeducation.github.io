const shades=['#314f43','#718f83','#adbea9','#a28e69','#817391','#4e7791'];
const tickValues=(min,max)=>Array.from({length:6},(_,i)=>min+(max-min)*i/5);
const btn=(mark,label,extra='',className='')=>`<button type="button" class="markable ${className}" data-mark="${mark}" ${extra}>${label}</button>`;

function barPanel(panel,lesson,panelIndex,numbers,esc,format){
 const categories=panel.categories||lesson.categories;
 const series=panel.series||lesson.series;
 const min=panel.min??lesson.min??0,max=panel.max??lesson.max;
 const unit=panel.unit||lesson.unit||'';
 const approximate=panel.approximate??lesson.approximate??false;
 const idPrefix=`panel-${panelIndex}`;
 const legend=`<div class="recon-legend">${series.map((item,index)=>btn(`${idPrefix}-legend-${index}`,`<i style="--series-colour:${shades[index%shades.length]}"></i>${esc(item.name)}`,'','recon-legend-item')).join('')}</div>`;
 const title=panel!==lesson&&panel.title?`<h3>${btn(`${idPrefix}-heading`,esc(panel.title))}</h3>`:'';
 if(panel.orientation==='horizontal'||lesson.orientation==='horizontal'){
  const ticks=`<div class="recon-horizontal-axis">${tickValues(min,max).map((value,i)=>btn(`${idPrefix}-axis-${i}`,format(value))).join('')}</div>`;
  const rows=categories.map((category,categoryIndex)=>`<div class="recon-horizontal-row">${btn(`${idPrefix}-category-${categoryIndex}`,esc(category),'','recon-category')}<div class="recon-horizontal-tracks">${series.map((item,seriesIndex)=>{
   const value=item.values[categoryIndex],datumId=`${idPrefix}-${categoryIndex}-${seriesIndex}`;
   numbers.set(datumId,{id:datumId,value,label:`${category} · ${item.name}${approximate?' (approximately)':''}`});
   const width=Math.max(0,Math.min(100,(value-min)/(max-min)*100));
   return `<div class="recon-horizontal-track" style="--series-colour:${shades[seriesIndex%shades.length]};--bar-width:${width}%">${btn(`bar-${datumId}`,'',`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${approximate?'approximately ':''}${format(value)} ${esc(unit)}" style="width:${width}%"`,'recon-horizontal-bar')}${btn(`value-${datumId}`,`${approximate?'≈':''}${format(value)}`,`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${format(value)} ${esc(unit)}"`,'recon-horizontal-value')}</div>`;
  }).join('')}</div></div>`).join('');
  return `<section class="recon-panel">${title}<div class="recon-horizontal">${rows}${ticks}</div>${legend}<p class="recon-unit">${esc(unit)}${approximate?' · ≈ indicates a value estimated from the printed scale':''}</p></section>`;
 }
 const ticks=tickValues(min,max).reverse();
 const axis=`<div class="recon-vertical-axis">${ticks.map((value,i)=>btn(`${idPrefix}-axis-${i}`,format(value))).join('')}</div>`;
 const columns=categories.map((category,categoryIndex)=>`<div class="recon-category-column"><div class="recon-bars">${series.map((item,seriesIndex)=>{
  const value=item.values[categoryIndex],datumId=`${idPrefix}-${categoryIndex}-${seriesIndex}`;
  numbers.set(datumId,{id:datumId,value,label:`${category} · ${item.name}${approximate?' (approximately)':''}`});
  const height=Math.max(0,Math.min(100,(value-min)/(max-min)*100));
  return `<div class="recon-bar-stack" style="--bar-height:${height}%;--series-colour:${shades[seriesIndex%shades.length]}">${btn(`value-${datumId}`,`${approximate?'≈':''}${format(value)}`,`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${format(value)} ${esc(unit)}"`,'recon-vertical-value')}${btn(`bar-${datumId}`,'',`data-number="${datumId}" aria-label="${esc(category)} · ${esc(item.name)} ${approximate?'approximately ':''}${format(value)} ${esc(unit)}"`,'recon-vertical-bar')}</div>`;
 }).join('')}</div>${btn(`${idPrefix}-category-${categoryIndex}`,esc(category),'','recon-category')}</div>`).join('');
 return `<section class="recon-panel">${title}<div class="recon-vertical">${axis}<div class="recon-column-area"><div class="recon-grid">${ticks.map((_,i)=>`<i style="bottom:${i*20}%"></i>`).join('')}</div><div class="recon-columns">${columns}</div></div></div>${legend}<p class="recon-unit">${esc(unit)}${approximate?' · ≈ indicates a value estimated from the printed scale':''}</p></section>`;
}
function linePanel(panel,lesson,panelIndex,numbers,esc,format){
 const categories=panel.categories||lesson.categories,series=panel.series||lesson.series;
 const min=panel.min??lesson.min??0,max=panel.max??lesson.max,unit=panel.unit||lesson.unit||'';
 const approximate=panel.approximate??lesson.approximate??false;
 const left=78,top=32,width=830,height=390,px=index=>left+(categories.length===1?0:index/(categories.length-1)*width),py=value=>top+(max-value)/(max-min)*height;
 const prefix=`panel-${panelIndex}`;
 const axis=tickValues(min,max).map((value,index)=>{const y=py(value);return `<line x1="${left}" x2="${left+width}" y1="${y}" y2="${y}" class="recon-svg-grid"/><text x="${left-12}" y="${y+4}" text-anchor="end" role="button" tabindex="0" class="markable recon-svg-label" data-mark="${prefix}-axis-${index}">${esc(format(value))}</text>`;}).join('');
 const xAxis=categories.map((category,index)=>`<text x="${px(index)}" y="${top+height+28}" text-anchor="middle" role="button" tabindex="0" class="markable recon-svg-label" data-mark="${prefix}-category-${index}">${esc(category)}</text>`).join('');
 const lines=series.map((item,seriesIndex)=>{
  const colour=shades[seriesIndex%shades.length];
  const points=item.values.map((value,index)=>`${px(index)},${py(value)}`).join(' ');
  const path=`<polyline points="${points}" fill="none" stroke="${colour}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" role="button" tabindex="0" class="markable recon-line" data-mark="${prefix}-line-${seriesIndex}"><title>${esc(item.name)}</title></polyline>`;
  const dots=item.values.map((value,index)=>{
   const datumId=`${prefix}-${index}-${seriesIndex}`;
   numbers.set(datumId,{id:datumId,value,label:`${categories[index]} · ${item.name}${approximate?' (approximately)':''}`});
   return `<g role="button" tabindex="0" class="markable recon-point" data-mark="point-${datumId}" data-number="${datumId}" aria-label="${esc(categories[index])} · ${esc(item.name)} ${approximate?'approximately ':''}${format(value)} ${esc(unit)}"><circle cx="${px(index)}" cy="${py(value)}" r="7" fill="${colour}" stroke="#fffef9" stroke-width="2"/><title>${esc(categories[index])} · ${esc(item.name)} ${approximate?'≈':''}${format(value)} ${esc(unit)}</title></g>`;
  }).join('');
  return path+dots;
 }).join('');
 const legend=`<div class="recon-legend">${series.map((item,index)=>btn(`${prefix}-legend-${index}`,`<i style="--series-colour:${shades[index%shades.length]}"></i>${esc(item.name)}`,'','recon-legend-item')).join('')}</div>`;
 const panelTitle=panel!==lesson&&panel.title?`<h3>${btn(`${prefix}-heading`,esc(panel.title))}</h3>`:'';
 return `<section class="recon-panel recon-line-panel">${panelTitle}<svg viewBox="0 0 980 485" role="img" aria-label="${esc(panel.title||lesson.title)} interactive line graph" class="recon-line-svg"><line x1="${left}" x2="${left}" y1="${top}" y2="${top+height}" class="recon-svg-axis"/><line x1="${left}" x2="${left+width}" y1="${top+height}" y2="${top+height}" class="recon-svg-axis"/>${axis}${xAxis}${lines}</svg>${legend}<p class="recon-unit">${esc(unit)}${approximate?' · ≈ indicates a value estimated from the printed scale':''}</p></section>`;
}
function piePanel(panel,lesson,panelIndex,numbers,esc,format){
 const categories=panel.categories||lesson.categories,values=panel.values;
 const total=values.reduce((sum,value)=>sum+value,0),prefix=`panel-${panelIndex}`;
 let angle=-Math.PI/2;
 const slices=values.map((value,index)=>{
  const start=angle,sweep=value/total*Math.PI*2;angle+=sweep;
  const end=angle,polar=(a,r)=>`${160+Math.cos(a)*r},${160+Math.sin(a)*r}`;
  const d=`M 160 160 L ${polar(start,135)} A 135 135 0 ${sweep>Math.PI?1:0} 1 ${polar(end,135)} Z`;
  const id=`${prefix}-${index}`,label=`${panel.title||lesson.title} · ${categories[index]}`;
  numbers.set(id,{id,value,label});
  return `<path d="${d}" fill="${shades[index%shades.length]}" stroke="#fffef9" stroke-width="3" role="button" tabindex="0" class="markable recon-pie-slice" data-mark="slice-${id}" data-number="${id}" aria-label="${esc(label)} ${format(value)}%"><title>${esc(label)} ${format(value)}%</title></path>`;
 }).join('');
 const legend=categories.map((category,index)=>{const id=`${prefix}-${index}`,label=`${category} · ${format(values[index])}%`;return `<div class="recon-pie-key">${btn(`legend-${id}`,`<i style="--series-colour:${shades[index%shades.length]}"></i>${esc(category)}`,'','recon-legend-item')}${btn(`value-${id}`,`${format(values[index])}%`,`data-number="${id}" aria-label="${esc(label)}"`,'recon-pie-value')}</div>`}).join('');
 return `<section class="recon-panel recon-pie-panel">${panel!==lesson?`<h3>${btn(`${prefix}-heading`,esc(panel.title||lesson.title))}</h3>`:''}<div class="recon-pie-layout"><svg class="recon-pie-svg" viewBox="0 0 320 320" role="img" aria-label="${esc(panel.title||lesson.title)} interactive pie chart">${slices}</svg><div class="recon-pie-keys">${legend}</div></div></section>`;
}
function tablePanel(panel,lesson,panelIndex,numbers,esc,format){
 const prefix=`panel-${panelIndex}`;
 const headings=panel.columns.map((heading,index)=>`<th scope="col">${btn(`${prefix}-column-${index}`,esc(heading))}</th>`).join('');
 const rows=panel.rows.map((row,rowIndex)=>`<tr>${row.map((cell,columnIndex)=>{
  const id=`${prefix}-${rowIndex}-${columnIndex}`,display=typeof cell==='number'&&columnIndex>0?format(cell):String(cell),normalized=display.replace('−','-').replace(/,/g,''),value=typeof cell==='number'?cell:/^[-+]?\d[\d,.]*(?:\s*%|\s*cents)?$/.test(normalized)?Number.parseFloat(normalized):null;
  const label=`${row[0]} · ${panel.columns[columnIndex]}`;
  numbers.set(id,{id,value,label});
  return `<${columnIndex?'td':'th scope="row"'}>${btn(`cell-${id}`,esc(display),`data-number="${id}" aria-label="${esc(label)} ${esc(display)}"`,'recon-table-cell')}</${columnIndex?'td':'th'}>`;
 }).join('')}</tr>`).join('');
 return `<section class="recon-panel recon-table-panel">${panel.title?`<h3>${btn(`${prefix}-heading`,esc(panel.title))}</h3>`:''}<div class="recon-table-scroll"><table class="recon-table"><thead><tr>${headings}</tr></thead><tbody>${rows}</tbody></table></div>${panel.unit?`<p class="recon-unit">${esc(panel.unit)}</p>`:''}</section>`;
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
 const panels=lesson.panels||[lesson];
 return `<div class="reconstructed-chart"><div class="recon-chart-title">${btn('chart-heading',esc(lesson.title))}</div>${panels.map((panel,index)=>(panel.kind||lesson.kind)==='bar'?barPanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='line'?linePanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='pie'?piePanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='table'?tablePanel(panel,lesson,index,numbers,esc,format):(panel.kind||lesson.kind)==='process'?processPanel(panel,lesson,index,numbers,esc,format):mapPanel(panel,lesson,index,numbers,esc,format)).join('')}</div>`;
}
