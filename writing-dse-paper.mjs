const key='edmund-writing-dse-paper-v1';
export function mountWritingPaperSkin(stack,input){
 if(!stack||!input)return;
 const controls=document.createElement('div');controls.className='writing-paper-controls';
 const label=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.dataset.dsePaperToggle='';label.append(toggle,document.createTextNode(' DSE Paper 2 skin · DSE 卷二答題紙'));
 controls.append(label);stack.parentElement.before(controls);
 const head=document.createElement('section');head.className='dse-paper-head';head.hidden=true;
 head.innerHTML='<strong>FOR PART B ONLY</strong><p>Put an ‘X’ inside the question number box to indicate the question (Q.2–Q.9) that you have chosen.</p><fieldset><legend>試題編號 Question No.</legend><div class="dse-question-boxes"></div></fieldset>';
 for(let n=2;n<=9;n++){const item=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.addEventListener('change',()=>{if(box.checked)head.querySelectorAll('[data-dse-question]').forEach(other=>{if(other!==box)other.checked=false;});});box.name='dse-paper-question';box.value=n;box.dataset.dseQuestion='';item.append(document.createTextNode(String(n)),box);head.querySelector('.dse-question-boxes').append(item);}
 stack.before(head);
 const guides=document.createElement('div');guides.className='dse-paper-guides';guides.setAttribute('aria-hidden','true');stack.prepend(guides);
 const footer=document.createElement('small');footer.className='dse-paper-footer';footer.textContent='Answers written in the margins will not be marked.';footer.hidden=true;stack.after(footer);
 const mirror=document.createElement('div');mirror.className='dse-paper-measure';mirror.setAttribute('aria-hidden','true');document.body.append(mirror);
 const oldHeight=input.style.height;
 let frame=0;
 function layout(){frame=0;if(!toggle.checked||!stack.getClientRects().length)return;const style=getComputedStyle(input);Object.assign(mirror.style,{width:Math.max(1,input.clientWidth-104)+'px',font:style.font,letterSpacing:style.letterSpacing,lineHeight:'32px'});mirror.textContent=(input.value||'')+'\u200b';const rows=Math.max(22,Math.ceil(mirror.getBoundingClientRect().height/32));const total=rows<=22?22:rows<=44?44:rows<=68?68:rows<=92?92:92+Math.ceil((rows-92)/24)*24;input.style.height=(total*32+80)+'px';guides.replaceChildren();for(let n=5;n<=total;n+=5){const number=document.createElement('span');number.textContent=n;number.style.top=(40+(n-1)*32+6)+'px';guides.append(number);}for(const n of [22,44,...Array.from({length:Math.max(0,Math.ceil((total-44)/24))},(_,i)=>68+i*24)].filter(n=>n<total)){const line=document.createElement('i');line.style.top=(40+n*32)+'px';guides.append(line);}}
 function schedule(){if(!frame)frame=requestAnimationFrame(layout);}
 function apply(){stack.classList.toggle('is-dse-paper',toggle.checked);head.hidden=footer.hidden=!toggle.checked;if(toggle.checked)schedule();else input.style.height=oldHeight;try{localStorage.setItem(key,toggle.checked?'on':'off');}catch{}}
 try{toggle.checked=localStorage.getItem(key)==='on';}catch{}toggle.onchange=apply;input.addEventListener('input',schedule);input.addEventListener('change',schedule);input.addEventListener('focus',schedule);window.addEventListener('resize',schedule);const observer=window.ResizeObserver?new ResizeObserver(schedule):null;observer?.observe(stack);apply();
}
