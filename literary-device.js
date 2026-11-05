import {explanation,prose,animateIn} from './literary-device-reading.mjs';
import {devices,quiz as bank} from './literary-device-data.js?v=360';
import {newRound} from './literary-device-shuffle.mjs';
import {usage} from './literary-device-usage.js';
import {createGuide} from './literary-device-guide.mjs';
const rounds=new Map();
const root=document.querySelector('#content'),hint=document.querySelector('#hint'),E=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));

const renderGuide=createGuide(devices,root);
function render(){const mode=location.hash, ex=['#exercise','#correct-usage'].includes(mode);
document.querySelectorAll('nav a').forEach(a=>{
 if(a.hash===(ex?mode:'#learning'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
});
if(!ex){renderGuide();return;}
const source=mode==='#correct-usage'?usage:bank;
if(!rounds.has(mode))rounds.set(mode,{quiz:newRound(source),i:0,attempts:new Map(),choices:new Map()});
const round=rounds.get(mode),{quiz,i,attempts,choices}=round;
const q=quiz[i],multi=q.multi,done=attempts.has(i),selected=choices.get(i)||new Set(),ans=q.options.filter(o=>o.correct).map(o=>o.letter).join('');
root.innerHTML='<article class="quiz-page"><div class="section-strip"><h2>'+ (mode==='#correct-usage'?'正確用法練習':'標準練習')+'</h2><span>練習手冊</span></div><small>QUESTION '+(i+1)+' / '+quiz.length+'　 ·　'+E(q.level)+'</small><progress aria-label="本輪作答進度" max="'+quiz.length+'" value="'+attempts.size+'"></progress><p class="sentence">'+prose(q.sentence)+'</p><p class="translation">（'+prose(q.zh)+'）</p><h3>'+E(q.ask.replace(/（.*$/,''))+'</h3><p>'+ (multi?'選出所有適用答案。':'選出最貼切的一個答案。')+'</p>'+q.options.map((o,j)=>'<div class="option '+(done?(o.correct?'right':selected.has(o.letter)?'wrong':''):'')+'"><label><input name="answer" type="'+(multi?'checkbox':'radio')+'" value="'+o.letter+'" '+(selected.has(o.letter)?' checked':'')+(done?' disabled':'')+'> '+o.letter+'. '+prose(o.label)+(o.zh?'<br><span class="translation">（'+prose(o.zh)+'）</span>':'')+'</label><button class="help" data-hint="'+j+'" aria-label="'+E(o.label)+'：查看手法解說">?</button>'+(done?'<p class="why"><b>'+ (o.correct?'正確選項':'非正確選項')+'：</b>'+prose(o.why)+'</p>':'')+'</div>').join('')+'<div class="result" role="status">'+(done?(attempts.get(i)?'答對了':'再看一下解說')+' · 答案：'+ans.split('').join('、')+(q.note?'<p>補充觀察：'+prose(q.note)+'</p>':''):'')+'</div><div class="controls"><button data-prev '+(!i?'disabled':'')+'>上一題</button><button class="primary" data-submit '+(done?'disabled':'')+'>提交答案</button><button data-next '+(i===quiz.length-1?'disabled':'')+'>下一題</button>'+(done?'<button data-retry>重答本題</button>':'')+'</div><p>已提交 '+attempts.size+' / '+quiz.length+'　·　答對 '+[...attempts.values()].filter(Boolean).length+' 題</p></article>';
root.querySelectorAll('input').forEach(el=>el.onchange=()=>choices.set(i,new Set([...root.querySelectorAll('input:checked')].map(v=>v.value))));
root.querySelectorAll('[data-hint]').forEach(el=>el.onclick=()=>{const name=q.options[+el.dataset.hint].device;const d=name==='Tricolon'?{en:'Tricolon',zh:'三段排比法',body:'核心：\n三個結構相近的詞組或分句連續並列，形成三拍節奏。例如：We planned, we practised, we performed. 判斷時既要數出三個單位，也要看它們的結構是否呼應。一般平行結構不限定三項。'}:devices.find(d=>d.en===name);hint.querySelector('h2').textContent=d.en+' · '+d.zh;hint.querySelector('.body').innerHTML=explanation(d.body);hint.showModal()});
root.querySelector('[data-submit]').onclick=()=>{const pick=[...(choices.get(i)||[])].sort().join('');if(!pick){root.querySelector('.result').textContent='請先選擇答案。';return;}attempts.set(i,pick===ans);render();animateIn(root.querySelector('.result'));const result=root.querySelector('.result');result.tabIndex=-1;result.focus({preventScroll:true})};
function turn(delta){round.i+=delta;render();animateIn(root.querySelector('article'),delta);const sentence=root.querySelector('.sentence');sentence.tabIndex=-1;sentence.focus({preventScroll:true});sentence.scrollIntoView({block:'nearest'});root.querySelector('article').classList.add('page-enter');}
root.querySelector('[data-prev]').onclick=()=>turn(-1);root.querySelector('[data-next]').onclick=()=>turn(1);const retry=root.querySelector('[data-retry]');if(retry)retry.onclick=()=>{choices.delete(i);attempts.delete(i);render()};
}
window.addEventListener('hashchange',()=>{render();animateIn(root);});render();

export function resetProgress(){rounds.clear();render();}
