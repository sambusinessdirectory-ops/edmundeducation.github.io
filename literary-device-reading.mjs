export const escapeHTML=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
// Preserve punctuation, closing quotation marks and decimals while separating sentences.
export function prose(text){return String(text).replace(/([。]|\.(?!\d))([”’"」』）)]*)\s*/g,'$1$2\n').split('\n').map(escapeHTML).join('<br>');}
export function explanation(text){
 const blocks=[];let current;
 for(const line of String(text).split(/\n/).map(x=>x.trim()).filter(Boolean)){
  const kind=/^核心[：:]/.test(line)?'core':/^Example[:：]/i.test(line)?'example':/判斷|注意|區別|補充|不同/.test(line)?'note':line.startsWith('•')?'breakdown':'note';
  if(!current||current.kind!==kind){current={kind,lines:[]};blocks.push(current);}current.lines.push(line);
 }
 const titles={core:'核心概念',example:'例句與翻譯',breakdown:'拆解觀察',note:'辨析與提醒'};
 const marks={core:'Ⅰ',example:'Ⅱ',breakdown:'Ⅲ',note:'Ⅳ'};
 return '<div class="reading-blocks">'+blocks.map(b=>'<section class="reading-card reading-'+b.kind+'"><h3><span>'+marks[b.kind]+'</span>'+titles[b.kind]+'</h3>'+b.lines.map(l=>'<p>'+prose(l.replace(/^核心[：:]\s*|^Example[:：]\s*|^•\s*/gi,''))+'</p>').join('')+'</section>').join('')+'</div>';
}
export function animateIn(node,direction=1){if(!node||matchMedia('(prefers-reduced-motion: reduce)').matches)return;node.animate([{opacity:0,transform:`translate(${direction*12}px,5px)`},{opacity:1,transform:'translate(0,0)'}],{duration:380,easing:'cubic-bezier(.2,.75,.2,1)'});}
export function expandDetails(row){const summary=row.querySelector('summary'),body=row.querySelector('.entry-body');let motion;
 summary.addEventListener('click',e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;e.preventDefault();if(motion)return;const opening=!row.open;const start=row.getBoundingClientRect().height;if(opening)row.open=true;const end=opening?row.getBoundingClientRect().height:summary.getBoundingClientRect().height;row.style.overflow='hidden';motion=row.animate({height:[start+'px',end+'px']},{duration:320,easing:'cubic-bezier(.2,.75,.2,1)'});motion.onfinish=()=>{row.open=opening;row.style.overflow='';motion=null;};if(opening)animateIn(body);});}
