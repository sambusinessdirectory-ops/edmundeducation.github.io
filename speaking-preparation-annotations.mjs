const COLORS={red:'#ef4444',blue:'#3b82f6',yellow:'#facc15',green:'#22c55e'};
const NS='http://www.w3.org/2000/svg';
export function mountPreparationAnnotations(root,session,save){
 const surface=root.querySelector('[data-annotation-surface]');if(!surface)return;
 const svg=surface.querySelector('[data-annotation-overlay]');let color=null,draft=null,pointer=null;
 const strokes=()=>Array.isArray(session.preparationAnnotations)?session.preparationAnnotations:[];
 const draw=()=>{svg.replaceChildren();for(const stroke of [...strokes(),...(draft?[draft]:[])]){if(!COLORS[stroke.color]||!Array.isArray(stroke.points))continue;const line=document.createElementNS(NS,'polyline');line.setAttribute('points',stroke.points.filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(p=>p.join(',')).join(' '));line.setAttribute('stroke',COLORS[stroke.color]);line.setAttribute('stroke-width','18');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');line.setAttribute('fill','none');line.setAttribute('opacity','.32');svg.append(line);}};
 const point=e=>{const r=svg.getBoundingClientRect();return [Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))];};
 root.querySelectorAll('[data-highlight-color]').forEach(button=>button.addEventListener('click',()=>{color=button.dataset.highlightColor;svg.classList.add('is-drawing');root.querySelectorAll('[data-highlight-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.querySelector('[data-highlight-scroll]')?.setAttribute('aria-pressed','false');}));
 root.querySelector('[data-highlight-scroll]')?.addEventListener('click',()=>{color=null;svg.classList.remove('is-drawing');root.querySelectorAll('[data-highlight-color]').forEach(b=>b.setAttribute('aria-pressed','false'));root.querySelector('[data-highlight-scroll]').setAttribute('aria-pressed','true');});
 root.querySelector('[data-highlight-undo]')?.addEventListener('click',()=>{session.preparationAnnotations=strokes().slice(0,-1);save();draw();});
 svg.addEventListener('pointerdown',e=>{if(!color||session.phase!=='preparation'||e.button!==0)return;e.preventDefault();e.stopPropagation();pointer=e.pointerId;svg.setPointerCapture(pointer);draft={color,points:[point(e)]};draw();});
 svg.addEventListener('pointermove',e=>{if(pointer!==e.pointerId||!draft)return;e.preventDefault();if(draft.points.length<3000)draft.points.push(point(e));draw();});
 const finish=e=>{if(pointer!==e.pointerId||!draft)return;draft.points.push(point(e));session.preparationAnnotations=[...strokes(),draft].slice(-500);draft=null;pointer=null;save();draw();};
 svg.addEventListener('pointerup',finish);svg.addEventListener('pointercancel',e=>{if(pointer!==e.pointerId)return;draft=null;pointer=null;draw();});draw();
}
