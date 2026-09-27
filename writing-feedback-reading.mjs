let disposePrevious=()=>{};
const preference='edmund-writing-feedback-animation-v1';
export function mountFeedbackReading(panel){
 disposePrevious();
 let enabled=true;try{enabled=localStorage.getItem(preference)!=='off';}catch{}
 const controls=document.createElement('label');controls.className='feedback-animation-toggle';
 const toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=enabled;
 controls.append(toggle,document.createTextNode(' Smooth feedback animation · 平滑評語動畫'));
 panel.querySelector('.teacher-feedback-view-head')?.append(controls);
 const progress=document.createElement('div');progress.className='feedback-reading-progress';progress.hidden=true;
 progress.innerHTML='<div class="feedback-reading-progress-track" role="progressbar" aria-label="Feedback reading progress" aria-valuemin="0" aria-valuemax="100"><span></span></div><small></small>';
 document.body.append(progress);
 const chunks=[...panel.querySelectorAll('.teacher-feedback-read-pair,.teacher-feedback-enhancement-card,.teacher-feedback-learning-point,.teacher-feedback-transcription-field,.teacher-feedback-synonym-read-table tbody tr')];
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 let observer=null,frame=0;
 function apply(){observer?.disconnect();observer=null;chunks.forEach(c=>c.classList.remove('feedback-reveal','is-revealed'));
  if(!enabled||reduced||!window.IntersectionObserver)return;
  observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');observer.unobserve(e.target);}}),{threshold:0,rootMargin:'0px 0px -35px 0px'});
  chunks.forEach(c=>{c.classList.add('feedback-reveal');if(c.getBoundingClientRect().top<innerHeight-35)c.classList.add('is-revealed');else observer.observe(c);});
 }
 function update(){frame=0;if(!panel.isConnected||!panel.getClientRects().length){progress.hidden=true;return;}const r=panel.getBoundingClientRect();progress.hidden=r.bottom<=0||r.top>=innerHeight;const range=Math.max(1,r.height-innerHeight);const value=Math.round(Math.min(1,Math.max(0,-r.top/range))*100);progress.querySelector('span').style.width=value+'%';progress.querySelector('[role=progressbar]').setAttribute('aria-valuenow',value);progress.querySelector('small').textContent='Feedback · 評語 '+value+'%';}
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 toggle.onchange=()=>{enabled=toggle.checked;try{localStorage.setItem(preference,enabled?'on':'off');}catch{}apply();};
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 const header=document.querySelector('.edmund-system-header');const headerSize=window.ResizeObserver?new ResizeObserver(()=>{progress.style.top=Math.max(0,header?.getBoundingClientRect().bottom||0)+'px';schedule();}):null;if(header)headerSize?.observe(header);progress.style.top=Math.max(0,header?.getBoundingClientRect().bottom||0)+'px';const size=window.ResizeObserver?new ResizeObserver(schedule):null;size?.observe(panel);
 apply();update();
 disposePrevious=()=>{observer?.disconnect();size?.disconnect();headerSize?.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);cancelAnimationFrame(frame);progress.remove();};
}
