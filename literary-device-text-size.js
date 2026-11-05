const storageKey='literary-device-text-scale-v1';
const toggle=document.querySelector('#text-size-toggle'),panel=document.querySelector('#text-size-panel');
const values=Array.from({length:9},(_,i)=>1+i*.25);
function apply(value){
 if(!values.includes(value))value=1;
 document.documentElement.style.setProperty('--reading-scale',value);
 document.documentElement.dataset.largeText=String(value>=1.75);
 toggle.textContent='字級 '+value+'×';
 panel.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.scale===value)));
 try{localStorage.setItem(storageKey,String(value));}catch{}
}
function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
for(const value of values){const button=document.createElement('button');button.type='button';button.dataset.scale=value;button.textContent=value+'×';button.setAttribute('aria-label','閱讀字級 '+value+' 倍');button.onclick=()=>apply(value);panel.append(button);}
toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));};
document.addEventListener('click',event=>{if(!event.target.closest('.text-size-control'))close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){close();toggle.focus();}});
let initial=1;try{initial=Number(localStorage.getItem(storageKey))||1;}catch{}apply(initial);
