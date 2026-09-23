import {createMedia} from './media.mjs?v=20260924-polysemy-audio4';
import {modules,moduleMap,allQuestionMap,selectModule,showModule,questions,senses,questionMap,orderedOptions,isCorrectAnswer,replay,summary,dailyAnswers,hkDate,esc,highlighted} from './core.mjs?v=20260924-polysemy-fixes1';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let client,user=null,events=[],outbox=[],timeDays=[],syncing=null,mode='directory',feedback=null,clockSeconds=0,lastAction=Date.now(),lastTick=Date.now(),generation=0,range='7',cacheWarning=false;
const media=createMedia({getUser:()=>user,getModule:()=>showModule,rpc});
const key=()=>`edmund-polysemy-lab-v1:${user.id}`;
const unique=list=>[...new Map(list.map(e=>[e.id,e])).values()];
const setStatus=(message,error=false)=>{$('[data-sync]').textContent=message;$('[data-sync]').classList.toggle('error',error);$('[data-sync-retry]').hidden=!error;};
function persist(){if(!user)return;try{localStorage.setItem(key(),JSON.stringify({events,outbox,timeDays}));}catch{cacheWarning=true;setStatus('此瀏覽器未能保留本機進度。請保持連線並等候雲端儲存。',true);}}
async function rpc(name,args){
 if(!client){const c=window.EDMUND_SUPABASE;if(!window.supabase||!c?.url||!c?.anonKey)throw Error('登入服務未能載入，請重新整理。');client=window.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:true,storage:sessionStorage,autoRefreshToken:true,detectSessionInUrl:false}});}
 const current=await client.auth.getSession();if(current.error)throw current.error;if(!current.data?.session){const r=await client.auth.signInAnonymously();if(r.error)throw r.error;}
 const {data,error}=await client.rpc(name,args).abortSignal(AbortSignal.timeout(12000));if(error)throw error;return data;
}
function addEvent(data){if(!user)return;const e={module:showModule.id,id:crypto.randomUUID(),at:new Date(Math.max(Date.now(),...events.map(e=>Date.parse(e.at)+1))).toISOString(),...data};outbox.push(e);if(e.kind!=='time')events.push(e);persist();void sync();return e;}
async function sync(){
 if(!user||syncing)return syncing;
 const owner=user.id,token=user.token,gen=generation;
 const task=(async()=>{try{
  do{const batch=outbox.slice(0,100),ids=new Set(batch.map(e=>e.id));setStatus('正在儲存…');const data=await rpc('polysemy_lab_modules_sync',{p_token:token,p_events:batch});if(generation!==gen||user?.id!==owner)return;
   outbox=outbox.filter(e=>!ids.has(e.id));events=unique([...(data.events||[]),...outbox.filter(e=>e.kind!=='time')]);timeDays=data.timeDays||[];persist();refreshProgress();renderCharts();
  }while(outbox.length);
  setStatus(cacheWarning?'已儲存至帳戶；本機儲存不可用。':'已儲存至學生帳戶');
 }catch(error){if(generation!==gen)return;setStatus(/expired|session|Sign in|28000/i.test(error.message||'')?'登入已過期，請重新登入。未同步的進度已保留在此裝置。':'暫時未能連線。進度已保留在此裝置，連線後會再同步。',true);}
 })();syncing=task;await task;if(generation===gen)syncing=null;
}
function refreshProgress(){const s=summary(events);$('#directory-progress').max=showModule.senses.length;$('#directory-progress').value=s.seen.size;$('[data-view-count]').textContent=`已瀏覽 ${s.seen.size} / ${showModule.senses.length} 個用法 · ${Math.round(s.seen.size/showModule.senses.length*100)}%`;
 $$('[data-sense]').forEach(d=>{const yes=s.seen.has(d.dataset.sense);d.querySelector('.seen').textContent=yes?'✓ 已瀏覽':'';});
 $('[data-mode=practice]').innerHTML=`${replay(events)?'繼續練習':'開始練習'} <small>Practise in context</small>`;
 renderModuleCards();
}
function moduleProgress(module){const moduleEvents=events.filter(e=>(e.module||'show')===module.id),validSenses=new Set(module.senses.map(s=>s.id)),validQuestions=new Map(module.questions.map(q=>[q.id,q.sense]));return {seen:new Set(moduleEvents.filter(e=>e.kind==='view'&&validSenses.has(e.sense)).map(e=>e.sense)).size,mastered:new Set(moduleEvents.filter(e=>e.kind==='answer'&&isCorrectAnswer(module.questions.find(q=>q.id===e.question),e.choice)).map(e=>e.question)).size};}
function renderModuleCards(){if(!user)return;$('[data-modules]').innerHTML=modules.map(module=>{const progress=moduleProgress(module),active=module.id===showModule.id,complete=progress.mastered===module.questions.length;return `<button class="module-card${active?' active':''}${complete?' complete':''}" data-module="${module.id}" aria-pressed="${active}"><span class="module-card-number">${String(module.number).padStart(2,'0')}</span><span class="module-card-word" lang="en">${esc(module.word)}</span><span class="module-card-progress"><span>${progress.seen} / ${module.senses.length} 個用法</span><span>${progress.mastered} / ${module.questions.length} 題</span></span><span class="module-card-bar"><i style="width:${Math.round(progress.mastered/module.questions.length*100)}%"></i></span><span class="module-card-state">${complete?'✓ 已完成':active?'目前單元':'開啟單元'}</span></button>`;}).join('');}
function routedModule(){const id=new URLSearchParams(location.search).get('module');return id&&moduleMap.has(id)?id:null;}
function changeModule(id,push=true){if(!user||!moduleMap.has(id)||id===showModule.id)return;captureTime();media.stop();feedback=null;selectModule(id);try{localStorage.setItem(key()+':module',showModule.id);}catch{}renderDirectory();setMode('directory');if(push)history.pushState({module:id},'',`?module=${encodeURIComponent(id)}`);$('.module-heading').scrollIntoView({behavior:'smooth',block:'start'});}
function renderDirectory(){
 $('.module-heading .eyebrow').textContent=`MODULE ${String(showModule.number).padStart(2,'0')} / 詞義與用法`;
 $('.module-heading h1').textContent=showModule.word;
 const counts=$$('.module-numbers strong');counts[0].textContent=showModule.senses.length;counts[1].textContent=questions.length;
 const manual=$('[data-manual]');manual.hidden=!showModule.source;manual.href=showModule.source?'polysemy-lab/'+showModule.source.path:'#';

 $('[data-meanings]').innerHTML=showModule.senses.map((s,i)=>`<details class="meaning" data-sense="${s.id}"><summary><span class="meaning-number">${String(i+1).padStart(2,'0')}</span><span class="meaning-title">${esc(s.title)}<small lang="en">${esc(s.form)}</small></span><span class="seen"></span></summary><div class="meaning-body"><p lang="en">${esc(s.en)}</p><p>${esc(s.zh)}</p>${s.examples.map(([en,zh])=>`<div class="example"><p lang="en">${highlighted(en)}</p><small>${esc(zh)}</small></div>`).join('')}<p class="note">${esc(s.note)}</p></div></details>`).join('');
 $('[data-comparisons]').innerHTML=showModule.comparisons.map(([title,en,zh])=>`<article><h3>${esc(title)}</h3><p class="comparison-example" lang="en">${esc(en)}</p><p class="comparison-explanation">${esc(zh).replace(/\b([a-z]+)\b/gi,'<strong lang="en">$1</strong>').replace(/；/g,'<br>')}</p></article>`).join('');
 $$('[data-sense]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&user){lastAction=Date.now();if(!summary(events).seen.has(d.dataset.sense)){addEvent({kind:'view',sense:d.dataset.sense});refreshProgress();}}}));refreshProgress();
}
function setMode(next){if(!user)return;media.stop();captureTime();mode=next;lastAction=Date.now();$$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('[data-directory]').hidden=mode!=='directory';$('[data-practice]').hidden=mode!=='practice';$('[data-library]').hidden=mode!=='recordings';$('.module-heading').hidden=mode==='recordings';if(mode==='recordings')void media.library($('[data-library]'));if(mode==='practice'){if(!replay(events))addEvent({kind:'start',run:crypto.randomUUID()});renderPractice();}}
function maskChineseTranslation(q){
 const zh=String(q.zh||"").trim();
 const hasHan=value=>/[\u3400-\u9fff]/u.test(String(value||""));
 if(!zh)return "中文翻譯暫缺";
 if(hasHan(q.masked))return String(q.masked).trim();
 const sense=senses.get(q.sense);
 const candidates=[sense?.title,sense?.zh,...Object.values(q.optionReasons||{}),q.explanation]
  .flatMap(value=>String(value||"").split(/[；;、，,：:。！？!?「」『』（）()\s]+/u))
  .filter(value=>[...value].filter(hasHan).length>=2)
  .sort((a,b)=>b.length-a.length);
 for(const candidate of candidates){if(zh.includes(candidate)){
  let masked=zh.replace(candidate,"____");
  const alternatives=[sense?.title,sense?.zh].flatMap(value=>String(value||"").split(/[；;、，,：:。！？!?「」『』（）()／/\s]+/u)).filter(value=>[...value].filter(hasHan).length>=2).sort((a,b)=>b.length-a.length);
  for(const alternative of alternatives){
   const escaped=alternative.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
   masked=masked.replace(new RegExp(`${escaped}[／/]____|____[／/]${escaped}`,"gu"),"____");
  }
  return masked;
 }}
 const english=String(q.en||"");
 const targets=Array.isArray(q.targets)&&q.targets.length?[...q.targets]:[String(q.target||"")].filter(Boolean);
 const target=targets.sort((a,b)=>b.length-a.length)[0]||"";
 const targetAt=target?(q.targetOccurrence==="last"?english.toLowerCase().lastIndexOf(target.toLowerCase()):english.toLowerCase().indexOf(target.toLowerCase())):-1;
 const ratio=targetAt>=0&&english.length?Math.max(0,Math.min(1,(targetAt+target.length/2)/english.length)):0.5;
 const points=[...zh].map((char,index)=>({char,index})).filter(item=>hasHan(item.char));
 if(!points.length)return "____";
 const width=Math.max(2,Math.min(8,Math.round((target.length||5)*0.55)));
 const center=Math.round(ratio*(points.length-1));
 const first=Math.max(0,Math.min(points.length-width,center-Math.floor(width/2)));
 const start=points[first].index,end=points[Math.min(points.length-1,first+width-1)].index+1;
 return zh.slice(0,start)+"____"+zh.slice(end);
}

function renderPractice(){
 media.stop();
 const state=replay(events);if(!state)return;const root=$('[data-practice]');
 if(state.complete&&!feedback){root.innerHTML=`<div class="panel complete"><div class="completion-check" aria-hidden="true">✓</div><p class="eyebrow">${esc(showModule.word.toUpperCase())} / MODULE COMPLETE</p><h2>${questions.length} / ${questions.length} 題，全部答對！</h2><p>你已完成所有語境題，以及本次需要重溫的題目。</p><progress max="${questions.length}" value="${questions.length}" aria-label="練習全部完成"></progress><button data-redo class="primary">再練一次</button><button data-reference>返回詞義總覽</button></div>`;return;}
 const q=feedback?.question||state.question,round=feedback?.round||state.round,pos=feedback?.position??state.position;
 const explanationParts=String(q.explanation||"").split(/(?<=[。！？!?])\s*/u).map(part=>part.trim()).filter(Boolean);
 root.innerHTML=`<div class="practice-toolbar"><p>第 ${pos+1} 題 · 隨機練習${(feedback?.review??state.review)?' · 重溫題目':(feedback?.filler??state.filler)?' · 穿插鞏固':''}</p><button data-reference>查看詞義總覽</button></div><div class="progress-wrap"><label for="practice-progress">本次練習已答對 ${state.correct.size} / ${questions.length} 題</label><progress id="practice-progress" max="${questions.length}" value="${state.correct.size}"></progress></div><section class="polysemy-streak" aria-live="polite" data-streak-stage="${Math.min(3,Math.floor(state.streak/5))}"><div class="polysemy-streak-copy"><img class="polysemy-streak-fire" src="/assets/schedule/day-streak-fire.gif" alt="" aria-hidden="true"><div><strong>連續答對 ${state.streak} 題</strong><small>最高連勝 ${state.bestStreak} 題</small></div></div><div class="polysemy-streak-eddy" role="group" aria-label="Eddie 連勝鼓勵"><span class="eddy-streak-sprite" role="img" aria-label="Eddie 為你的連勝打氣"></span><span class="eddy-streak-cheer">${state.streak>=15?`連中 ${state.streak} 題！太厲害了！`:state.streak>=5?`連中 ${state.streak} 題！做得好！`:state.streak>=2?`連中 ${state.streak} 題，繼續！`:"你做得到！"}</span></div></section><article class="question-card ${feedback?(isCorrectAnswer(q,feedback.choice)?"is-correct":"is-wrong"):""}"><p class="eyebrow">${q.passage?'ORIGINAL CONTEXT / 原句挑戰':'READ THE CONTEXT / 閱讀語境'}</p><h2 class="sentence" tabindex="-1" lang="en">${highlighted(q.en)}</h2><div data-sentence-media></div><p class="question-translation" lang="zh-Hant"><strong>中文翻譯：</strong>${esc(maskChineseTranslation(q))}</p><p class="masked" lang="en">${esc(q.masked)}</p><p>這句中的標示詞語是甚麼意思？</p><div class="answer-grid" role="group" aria-label="六個意思選項">${orderedOptions(q,round).map((id,i)=>`<button data-answer="${id}" ${feedback?'disabled':''} class="${feedback?(isCorrectAnswer(q,id)?'correct':id===feedback.choice?'wrong':''):''}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(senses.get(id).title)}${feedback&&isCorrectAnswer(q,id)?' ✓':''}</span></button>`).join('')}</div>${feedback?`<section class="feedback ${isCorrectAnswer(q,feedback.choice)?'':'wrong'}" role="status"><h3 class="feedback-step" style="--feedback-step:0">${isCorrectAnswer(q,feedback.choice)?'答對了！':'再留意句子中的線索。'}</h3><div class="feedback-step" style="--feedback-step:1"><strong>正確意思</strong><p>${esc(senses.get(isCorrectAnswer(q,feedback.choice)?feedback.choice:q.sense).title)}；${esc(senses.get(isCorrectAnswer(q,feedback.choice)?feedback.choice:q.sense).zh)}</p></div><div class="feedback-explanation"><strong class="feedback-step" style="--feedback-step:2">語境解釋</strong>${explanationParts.map((part,index)=>`<p class="feedback-step feedback-explanation-fragment" style="--feedback-step:${3+index}">${esc(part)}</p>`).join('')}</div><div class="feedback-step" style="--feedback-step:${3+explanationParts.length}"><strong>完整翻譯</strong><p>${esc(q.zh)}</p></div>${!isCorrectAnswer(q,feedback.choice)?`<small class="feedback-step" style="--feedback-step:${4+explanationParts.length}">這題會在另外 5–6 題之後再出現。綠色選項為正確答案。</small>`:''}</section><button class="primary" data-next>${state.complete?'查看結果':'下一題'}</button>`:''}</article><p class="timer-note">可以隨時查看詞義總覽。進度會儲存；隱藏分頁或閒置 10 分鐘後，計時會暫停。</p>`;
 media.controls($('[data-sentence-media]'),q);
}
function allTimeDays(){const map=new Map(timeDays.map(d=>[d.date,Number(d.seconds)]));outbox.filter(e=>e.kind==='time').forEach(e=>map.set(hkDate(e.at),(map.get(hkDate(e.at))||0)+e.seconds));return map;}
function duration(n){return `${Math.floor(n/60)} 分 ${Math.floor(n%60).toString().padStart(2,'0')} 秒`;}
function renderCharts(){if(!user)return;const answers=dailyAnswers(events),times=allTimeDays(),today=hkDate(new Date()),allDates=[...new Set([...answers.map(d=>d.date),...times.keys(),today])].sort();
 let dates=allDates;if(range!=='all'){dates=[];for(let i=Number(range)-1;i>=0;i--){const d=new Date(today+'T12:00:00+08:00');d.setUTCDate(d.getUTCDate()-i);dates.push(hkDate(d));}}
 const amap=new Map(answers.map(d=>[d.date,d]));
 $('[data-charts]').innerHTML=[['questions','每日完成題數','Questions completed',dates.map(d=>amap.get(d)?.correct||0)],['time','每日練習時間','Study time',dates.map(d=>times.get(d)||0)]].map(([kind,title,en,values])=>{const max=Math.max(...values,1),sum=values.reduce((a,b)=>a+b,0),points=values.map((v,i)=>({x:30+(dates.length===1?.5:i/(dates.length-1))*340,y:125-v/max*95,date:dates[i],value:v}));return `<article class="dashboard-card"><h3>${title}<small>${en}</small></h3><p class="stat">${kind==='time'?duration(sum):sum+' 題'}</p><small>${range==='all'?'全部時間':'最近 '+range+' 天'} · ${kind==='questions'?'答對題目；不包含詞義瀏覽':'只計可見頁面的活躍學習時間'}</small><div class="chart-scroll"><svg class="chart" viewBox="0 0 400 170" aria-label="${title}，點選日期查看記錄"><line x1="30" y1="125" x2="370" y2="125"/><text x="5" y="35">${kind==='time'?Math.ceil(max/60)+'m':max}</text><polyline points="${points.map(p=>p.x+','+p.y).join(' ')}"/>${points.map((p,i)=>`<g tabindex="0" role="button" data-day="${p.date}" data-chart-kind="${kind}" aria-label="${p.date}：${kind==='time'?duration(p.value):p.value+' 題'}"><title>${p.date}：${kind==='time'?duration(p.value):p.value+' 題'}</title><circle cx="${p.x}" cy="${p.y}" r="6"/></g>${i===0||i===points.length-1||i%Math.ceil(points.length/5)===0?`<text x="${p.x}" y="153" text-anchor="middle">${p.date.slice(5)}</text>`:''}`).join('')}</svg></div></article>`;}).join('');}
function dayDetails(date,kind){const target=$('[data-day-detail]');target.hidden=false;if(kind==='time'){target.innerHTML=`<h3>${esc(date)} · 練習時間</h3><p>所有單元的詞義總覽及語境練習：${duration(allTimeDays().get(date)||0)}</p>`;return;}const rows=events.filter(e=>e.kind==='answer'&&hkDate(e.at)===date&&allQuestionMap.has(e.question));target.innerHTML=`<h3>${esc(date)} · 作答記錄</h3>${rows.length?`<ul>${rows.map(e=>`<li>${isCorrectAnswer(allQuestionMap.get(e.question),e.choice)?'✓ 答對':'✕ 待重溫'} · 第 ${e.round} 次作答 — ${esc(allQuestionMap.get(e.question).word)}：${esc(allQuestionMap.get(e.question).en)}</li>`).join('')}</ul>`:'<p>當天尚未有作答記錄。</p>'}`;}
function captureTime(){if(!user||!clockSeconds)return;const seconds=Math.min(60,Math.floor(clockSeconds));clockSeconds-=seconds;if(seconds)addEvent({kind:'time',seconds});}
setInterval(()=>{const now=Date.now(),elapsed=Math.min(2,Math.max(0,(now-lastTick)/1000));lastTick=now;if(user&&!$('[data-app]').inert&&!document.hidden&&now-lastAction<600000){clockSeconds+=elapsed;if(clockSeconds>=30)captureTime();}},1000);
['pointerdown','keydown'].forEach(name=>document.addEventListener(name,()=>{lastAction=Date.now();},{passive:true}));
document.addEventListener('visibilitychange',()=>{captureTime();if(document.hidden)media.suspend();lastTick=Date.now();if(!document.hidden){lastAction=Date.now();void sync();}});
window.addEventListener('pagehide',()=>{media.stop();captureTime();persist();});window.addEventListener('online',()=>void sync());
window.addEventListener('beforeunload',event=>{if(user&&mode==='practice'&&replay(events)&&!replay(events).complete){persist();event.preventDefault();event.returnValue='';}});
setInterval(()=>{if(user&&!document.hidden)void sync();},60000);
window.addEventListener('storage',event=>{if(!user||event.key!==key()||!event.newValue)return;try{const c=JSON.parse(event.newValue);events=unique([...events,...c.events]);outbox=unique([...outbox,...c.outbox]);refreshProgress();void sync();}catch{}});
async function enter(token){const gen=++generation;const rows=await rpc('flashcard_student_session_profile',{p_token:token});if(gen!==generation)return false;const row=rows?.[0];if(!row?.id||!row.session_token)return false;user={id:row.id,name:row.name,role:'student',token:row.session_token};events=[];outbox=[];timeDays=[];feedback=null;clockSeconds=0;cacheWarning=false;
 try{const c=JSON.parse(localStorage.getItem(key())||'null');if(c&&Array.isArray(c.events)&&Array.isArray(c.outbox)){events=c.events;outbox=c.outbox;timeDays=c.timeDays||[];}}catch{}
 try{selectModule(routedModule()||localStorage.getItem(key()+':module')||'show');}catch{selectModule('show');}
 window.EdmundSystemNav?.rememberStudentSession(user);$('[data-login]').hidden=true;$('[data-app]').inert=true;$('[data-app]').hidden=false;$('[data-logout]').hidden=false;$('[data-recordings]').hidden=false;$('[data-student]').textContent=row.name;$('[data-login-form]').reset();$('[data-dashboards]').open=false;renderDirectory();renderCharts();setMode('directory');await sync();if(gen===generation)$('[data-app]').inert=false;return true;}
function clear(){media.stop();$('[data-library]').innerHTML='';$('[data-recordings]').hidden=true;generation++;user=null;events=[];outbox=[];timeDays=[];feedback=null;syncing=null;clockSeconds=0;$('[data-app]').hidden=true;$('[data-login]').hidden=false;$('[data-student]').textContent='';$('[data-logout]').hidden=true;}
$('[data-login-form]').addEventListener('submit',async event=>{event.preventDefault();const b=event.currentTarget.querySelector('button[type=submit]'),form=new FormData(event.currentTarget);b.disabled=true;$('[data-login-status]').textContent='正在登入…';try{const rows=await rpc('flashcard_student_login',{p_name:String(form.get('username')).trim(),p_password:String(form.get('password'))});if(!rows?.[0]?.session_token||!await enter(rows[0].session_token))throw Error('用戶名稱或密碼不正確，請再試。');$('[data-login-status]').textContent='';}catch(error){$('[data-login-status]').textContent=error.message||'登入失敗，請重試。';}finally{b.disabled=false;}});
$('[data-logout]').addEventListener('click',async()=>{if(outbox.length&&!confirm('部分進度尚未同步。登出後會保留在此裝置，登入同一帳戶後再同步。確定登出？'))return;captureTime();await sync();clear();window.EdmundSystemNav?.forgetStudentSession();});
window.addEventListener('edmund-student-session-change',()=>{const current=window.EdmundSystemNav?.getStudentSession?.();if(user&&current?.id!==user.id){captureTime();persist();clear();}});
window.addEventListener('popstate',()=>{if(user)changeModule(routedModule()||'show',false);});
$('[data-sync-retry]').addEventListener('click',()=>void sync());$('[data-range]').addEventListener('change',e=>{range=e.target.value;renderCharts();$('[data-day-detail]').hidden=true;});
$('[data-collapse]').addEventListener('click',()=>$$('[data-sense]').forEach(d=>d.open=false));
document.addEventListener('click',event=>{const b=event.target.closest('button,[data-day]');if(!b||!user)return;if(b.dataset.module)changeModule(b.dataset.module);else if(b.matches('[data-recordings]'))setMode('recordings');else if(b.dataset.mode)setMode(b.dataset.mode);else if(b.matches('[data-start]'))setMode('practice');else if(b.matches('[data-reference]'))setMode('directory');else if(b.matches('[data-redo]')){if(!confirm('開始新一輪練習？之前的完成記錄會保留。'))return;feedback=null;addEvent({kind:'start',run:crypto.randomUUID()});renderPractice();}else if(b.dataset.answer&&!feedback){const s=replay(events);if(!s||s.complete)return;feedback={question:s.question,choice:b.dataset.answer,round:s.round,position:s.position,total:s.queue.length,review:s.review,filler:s.filler};document.dispatchEvent(new CustomEvent('edmund:answer-result',{detail:{correct:isCorrectAnswer(s.question,b.dataset.answer)}}));addEvent({kind:'answer',run:s.run,round:s.round,question:s.question.id,choice:b.dataset.answer});renderPractice();$('[data-next]')?.focus({preventScroll:true});}else if(b.matches('[data-next]')){feedback=null;renderPractice();$('.sentence')?.focus({preventScroll:true});}else if(b.dataset.day)dayDetails(b.dataset.day,b.dataset.chartKind);});
document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches('[data-day]')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
(async()=>{const saved=window.EdmundSystemNav?.getStudentSession?.();if(saved?.role==='student'&&saved.token){$('[data-login-status]').textContent='正在恢復學生登入…';try{if(await enter(saved.token))return;}catch{}$('[data-login-status]').textContent='請重新登入以繼續。';clear();}})();
