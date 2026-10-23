import {COMPANIONS,REGIONS,freshProfile,normalizeProfile,stats,companionStage,planExpedition,recordAnswer,advance} from './idiom-adventure-core.mjs?v=20261024-isles1';
import {creature,landscape} from './idiom-adventure-art.mjs?v=20261024-isles1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,cls='',attrs='')=>`<button type="button" class="ia-button ${cls}" data-ia-action="${action}" ${attrs}>${label}</button>`;
const bilingual=(zh,en)=>`<span>${esc(zh)}</span><small lang="en">${esc(en)}</small>`;
export function mountAdventure({root,bridge}) {
 let owner='',profile=freshProfile(),lessonId='',dialog=null,returnFocus=null,busy=false,generation=0,storageFailed=false,notice='',audio=null;
 function chime(){
  if(!profile.sound)return;
  try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});
   [523.25,659.25,783.99].forEach((frequency,i)=>{const tone=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.09;tone.frequency.value=frequency;tone.type='sine';tone.connect(gain);gain.connect(audio.destination);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.035,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.24);tone.start(t);tone.stop(t+.25);tone.onended=()=>{tone.disconnect();gain.disconnect();};});
  }catch{/* Audio is optional; learning remains available. */}
 }
 const key=()=>`edmund-idiom-isles-v1:${owner}`;
 const lessons=()=>bridge.lessons();
 const selected=()=>lessons().find(l=>l.id===lessonId)||lessons()[profile.region*23]||lessons()[0];
 const companion=()=>COMPANIONS.find(c=>c.id===profile.companion)||COMPANIONS[0];
 function save(){try{localStorage.setItem(key(),JSON.stringify(profile));storageFailed=false;}catch{storageFailed=true;}}
 function load(){try{profile=normalizeProfile(JSON.parse(localStorage.getItem(key())||'null'));}catch{profile=freshProfile();storageFailed=true;}}
 function regionLessons(){return lessons().slice(profile.region*23,profile.region*23+23);}
 function storageNote(){return `<p class="ia-storage">${storageFailed?'此裝置未能儲存冒險進度；關閉後可能遺失。':'夥伴、經驗與探險印章儲存在此裝置；原有題目沿用帳戶進度。'}</p>`;}
 function render(){
  if(!owner)return;
  const s=stats(profile),c=companion(),growth=companionStage(profile,c.id),r=REGIONS[profile.region],l=selected();
  const due=bridge.questions(l.id).filter(q=>profile.records[q.id]?.due<=Date.now()).length;
  root.innerHTML=`<div class="ia-hub">
   <div class="ia-topline"><span class="ia-wordmark">✦ 語境群島 <small>IDIOM ISLES</small></span><span class="ia-player">探索者 Lv.${s.level} <span>✧ ${s.xp} XP</span></span></div>
   <div class="ia-hero"><div class="ia-intro"><p class="ia-eyebrow">每一次出發，都帶回一句新本領</p><h1>把英文，<br>變成你的冒險。</h1><p>帶上夥伴，走六步小旅程。讀懂線索、運用慣用語，讓群島隨你一起成長。</p><div class="ia-hero-actions">${button(profile.active?'resume':'start',profile.active?'繼續未完的旅程 ↗':'開始六步探險 ↗','ia-primary')}${button('catalogue','自由選課 ↓','ia-quiet')}</div><span class="ia-gentle">沒有倒數。答錯就發現新線索。</span></div>
    <div class="ia-world">${landscape(profile.region)}<span class="ia-world-label"><b>0${profile.region+1}</b> ${r.name}<small>${r.en}</small></span><div class="ia-world-friend">${creature(c.id,growth.level)}</div><span class="ia-map-note">${s.seals} / ${lessons().length} 個課題留下足跡</span></div></div>
   <div class="ia-hub-body">${profile.active?`<div class="ia-resume-note"><span>你有一趟未完的旅程，隨時可以接著走。</span>${button('discard','收起旅程，另選路線','ia-text')}</div>`:''}<div class="ia-section-heading"><div><p class="ia-eyebrow">CHOOSE YOUR NEXT CHAPTER</p><h2>今天，往哪裡走？</h2></div><span>所有地區均可自由探索</span></div>
   <div class="ia-regions" aria-label="選擇探索地區">${REGIONS.map((x,i)=>`<button type="button" class="ia-region ${i===profile.region?'is-active':''}" data-ia-action="region" data-value="${i}" aria-pressed="${i===profile.region}" style="--region:${x.color}"><span class="ia-island-icon">${['♧','≈','◇','△','❋','✧'][i]}</span><span>${esc(x.name)}<small>${i*23+1}–${Math.min(i*23+23,lessons().length)} 課</small></span></button>`).join('')}</div>
   <div class="ia-preparation"><section class="ia-route-card"><div class="ia-section-heading"><h3>選一條路線</h3><span>06 ENCOUNTERS</span></div><label class="ia-label" for="ia-lesson">這次探索的慣用語</label><select id="ia-lesson" data-ia-lesson>${regionLessons().map(x=>`<option value="${esc(x.id)}" ${x.id===l.id?'selected':''}>${x.order}. ${esc(x.titleZh||x.title)} · ${esc(x.titleEn)}</option>`).join('')}</select><div class="ia-paths"><button type="button" data-ia-action="start" class="ia-path"><span class="ia-path-icon">↗</span><b>開拓新路</b><small>優先探索未完成的題目</small></button><button type="button" data-ia-action="review" class="ia-path"><span class="ia-path-icon">↺</span><b>記憶迴廊</b><small>先重訪到期或已完成的題目</small></button></div><p class="ia-route-note">${due?`${due} 道本課題目等你重訪。`:'每次答對後，會安排日後重訪。'} ${button('guide','先看本課指南 →','ia-text')}</p></section>
   <section class="ia-team-card"><div class="ia-section-heading"><h3>你的探險小隊</h3><span>選一位同行</span></div><div class="ia-team">${COMPANIONS.map(x=>{const g=companionStage(profile,x.id);return `<button type="button" class="ia-companion ${c.id===x.id?'is-active':''}" data-ia-action="companion" data-value="${x.id}" aria-pressed="${c.id===x.id}">${creature(x.id,g.level)}<b>${x.name}</b><small>${x.role}</small><span>階段 ${g.level}</span></button>`;}).join('')}</div><p class="ia-skill-description"><b>${c.skill}</b> · ${c.description}<small>每趟可支援兩次；完成第 12、36 道不同題目，夥伴會成長。</small></p></section></div>
   <div class="ia-journal"><div><span>探險手札</span><strong>${s.learned}<small>探索過的題目</small></strong></div><div><span>收集足跡</span><strong>${s.seals}<small>課題印章</small></strong></div><div><span>小旅行</span><strong>${profile.runs}<small>已完成探險</small></strong></div><div class="ia-level-track"><span>下一個探索等級</span><strong>再 ${s.next} XP</strong><progress value="${120-s.next}" max="120" aria-label="距離下一個探索等級的進度"></progress><small>新題 +10 · 到期重訪 +5</small></div></div>
   ${s.seals?`<details class="ia-collection"><summary>查看我的課題印章 · ${s.seals} 枚</summary><div>${lessons().filter(x=>profile.seals[x.id]).map(x=>`<button type="button" data-ia-action="visit" data-value="${esc(x.id)}">✦ ${esc(x.titleZh||x.title)}<small>${esc(x.titleEn)}</small></button>`).join('')}</div></details>`:''}${storageNote()}</div></div>`;
  root.hidden=false;
 }
 function ensureDialog(){if(dialog)return;dialog=document.createElement('dialog');dialog.className='ia-dialog';dialog.setAttribute('aria-labelledby','ia-dialog-title');document.body.append(dialog);dialog.addEventListener('click',handle);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('close',()=>{document.body.classList.remove('ia-playing');});}
 function openDialog(){ensureDialog();returnFocus=document.activeElement;if(!dialog.open)dialog.showModal();document.body.classList.add('ia-playing');drawRoom();}
 function close(){if(!dialog)return;generation++;busy=false;dialog.close();document.body.classList.remove('ia-playing');save();bridge.dashboard();render();returnFocus?.focus?.();}
 function activeQuestion(){const a=profile.active;return a?bridge.questions(a.lessonId).find(q=>q.id===a.ids[a.index]):null;}
 function start(mode='new',id){
  if(profile.active){resume();return;}
  const l=id?lessons().find(x=>x.id===id):selected();if(!l)return;
  lessonId=l.id;bridge.begin(l.id);
  const ids=planExpedition(bridge.questions(l.id),profile,mode,bridge.completed(l.id));
  if(ids.length!==6)return;
  profile.active={lessonId:l.id,ids,index:0,charges:2,solved:false,attempted:false,help:false,selection:null,earned:0,companion:profile.companion,mode};save();notice='';openDialog();
 }
 function resume(){const a=profile.active;if(!a)return start();if(!lessons().some(l=>l.id===a.lessonId)||!a.ids.every(id=>bridge.questions(a.lessonId).some(q=>q.id===id))){profile.active=null;save();render();return;}
  profile.companion=COMPANIONS.some(c=>c.id===a.companion)?a.companion:profile.companion;lessonId=a.lessonId;bridge.begin(a.lessonId);notice='';openDialog();}
 function drawRoom(){
  const a=profile.active;if(!a)return;
  const l=lessons().find(l=>l.id===a.lessonId),c=companion(),s=companionStage(profile,c.id),r=REGIONS[Math.min(5,Math.floor((l.order-1)/23))];
  if(a.index===6){dialog.innerHTML=`<div class="ia-result"><div class="ia-result-spark">✦</div>${creature(c.id,s.level)}<p class="ia-eyebrow">EXPEDITION COMPLETE</p><h2 id="ia-dialog-title">你又走遠了一點。</h2><p>六個情境，六次練習。<br><b>${esc(l.titleZh||l.title)}</b> 的探險印章已收入手札。</p><div class="ia-result-stats"><strong>+${a.earned}<small>本次 XP</small></strong><strong>${s.count}<small>${c.name}一起完成的不同題目</small></strong></div><p>${s.next?`再探索 ${Math.max(0,s.next-s.count)} 道不同題目，${c.name}就會成長。`:`${c.name}已長成星冠夥伴！`}</p><p class="ia-muted">探險印章記錄這次旅程；不代表已完成本課所有題目。</p>${button('finish','收好印章，返回群島','ia-primary')}${button('more','繼續探索本課','ia-secondary')}${storageNote()}</div>`;dialog.querySelector('button')?.focus();return;}
  const q=activeQuestion();if(!q){close();return;}
  const mc=bridge.options(q,l),boss=a.index===5,help=a.help,firstWrong=mc.options.findIndex((_,i)=>i!==mc.correctAt);
  const texts=help&&c.id==='ember'?bridge.highlight(mc.options):mc.options.map(esc);
  const explanation=a.solved?`<b>✦ 道路亮起了！</b><p>${esc(mc.rationales[mc.correctAt])}</p><details><summary>看看其他選項的分別</summary>${mc.rationales.map((x,i)=>`<p><b>${String.fromCharCode(65+i)}.</b> ${esc(x)}</p>`).join('')}</details>`:Number.isInteger(a.selection)?`<b>發現一個線索</b><p>${esc(mc.rationales[a.selection])}</p><span>不用重來，帶著線索再選一次。</span>`:'';
  dialog.innerHTML=`<div class="ia-expedition"><header class="ia-expedition-head"><span>✦ 語境群島 <small>${esc(r.name)}</small></span><div class="ia-header-actions">${button('sound',profile.sound?'音效：開':'音效：關','ia-quiet',`aria-pressed="${profile.sound}"`)}${button('close','儲存並休息 ×','ia-quiet')}</div></header><div class="ia-expedition-body"><aside class="ia-journey"><p class="ia-eyebrow">${boss?'THE GATEKEEPER':'ON THE TRAIL'}</p><h2 id="ia-dialog-title">${boss?'星門挑戰':'找回失落的星光'}</h2><p>${boss?'最後一步：把慣用語用在另一個情境。':'讀懂情境，就是讓道路亮起的力量。'}</p><div class="ia-encounter-art ${a.solved?'is-celebrating':''}">${creature(c.id,s.level)}<span class="ia-spark">${a.solved?'✦':'✧'}</span></div><b class="ia-companion-name">${c.name} · 階段 ${s.level}</b><div class="ia-stops" aria-label="六步旅程，第 ${a.index+1} 步">${a.ids.map((_,i)=>`<span class="${i<a.index?'is-done':i===a.index?'is-current':''}">${i<a.index?'✓':i===5?'✦':i+1}</span>`).join('')}</div><p class="ia-journey-caption">${a.index+1} / 6 · ${boss?'星門':'探索'}<br>這次已獲得 ${a.earned} XP</p><div class="ia-support"><b>${c.skill}</b><p>${c.description}</p>${button('skill',help?'支援已啟動':`請夥伴幫忙 · ${a.charges} / 2`,'ia-secondary',help||!a.charges||a.solved?'disabled':'')}</div><details class="ia-field-guide"><summary>隨身筆記 · 查看意思</summary><p>${esc(l.meaning?.zh)}</p><small>${esc(l.meaning?.en)}</small></details></aside><section class="ia-encounter"><div class="ia-question-heading"><span class="ia-tag">${boss?'✦ 星門情境':'情境碎片 '+(a.index+1)}</span><span>第 ${l.order} 課 · ${esc(l.titleEn)}</span></div><h3>${esc(q.promptZh||q.prompt)}</h3>${q.promptZh?`<p class="ia-english" lang="en">${esc(q.prompt)}</p>`:''}<p class="ia-instruction">哪一句保留原意，也自然地用上慣用語？</p>${help&&c.id==='moss'?`<div class="ia-clue"><b>✦ 語意燈籠</b><p>${esc(l.meaning?.zh)}</p><small>${esc(l.meaning?.en)}</small></div>`:''}<div class="ia-answers">${mc.options.map((x,i)=>{const eliminated=help&&c.id==='tide'&&i===firstWrong;return `<button type="button" data-ia-action="answer" data-value="${i}" class="ia-answer ${a.solved&&i===mc.correctAt?'is-correct':a.selection===i&&i!==mc.correctAt?'is-wrong':''} ${eliminated?'is-eliminated':''}" ${busy||a.solved||eliminated?'disabled':''}><span>${eliminated?'−':String.fromCharCode(65+i)}</span><div lang="en">${texts[i]}</div>${eliminated?'<small>迷霧已排除</small>':''}</button>`;}).join('')}</div><div class="ia-feedback ${a.solved?'is-success':''}" role="status" aria-live="polite">${busy?'正在記錄答案…':explanation}${notice?`<p>${esc(notice)}</p>`:''}</div>${a.solved?button('next',boss?'穿過星門，領取印章 ✦':'前往下一個情境 →','ia-primary ia-next'):''}<p class="ia-muted">可以隨時休息。答錯不會扣分，也不會失去夥伴。</p>${storageFailed?storageNote():''}</section></div></div>`;
  if(a.solved)dialog.querySelector('[data-ia-action="next"]')?.focus();
 }
 async function answer(index){
  const a=profile.active,q=activeQuestion();if(!a||!q||a.solved||busy||!Number.isInteger(index))return;
  const l=lessons().find(l=>l.id===a.lessonId),mc=bridge.options(q,l);if(index<0||index>=mc.options.length)return;
  const now=Date.now(),correct=index===mc.correctAt;
  a.selection=index;notice='';
  if(!correct){a.attempted=true;recordAnswer(profile,q.id,false,{now});save();drawRoom();return;}
  const token=generation,account=owner;busy=true;drawRoom();
  try{
   const accepted=await bridge.answer(a.lessonId,q.id,index);
   if(account!==owner||token!==generation)return;
   if(!accepted){a.selection=null;notice='未能記錄這次答案，請再試一次。';return;}
   const gained=recordAnswer(profile,q.id,true,{now,firstTry:!a.attempted,assisted:a.help});a.earned+=gained;a.solved=true;chime();
   notice=gained?`+${gained} XP · ${companion().name}陪你向前一步。`:'這道題已探索過；到期重訪時可再次獲得 XP。';save();
  }catch{if(account===owner&&token===generation){a.selection=null;notice='連線暫時不穩定，請再試一次。';}}
  finally{if(account===owner&&token===generation){busy=false;drawRoom();}}
 }
 function handle(e){
  const b=e.target.closest('[data-ia-action]');if(!b||!owner)return;
  const act=b.dataset.iaAction,value=b.dataset.value;
  if(act==='close')return close();
  if(act==='sound'){profile.sound=!profile.sound;save();if(profile.sound)chime();drawRoom();return;}
  if(busy)return;
  if(act==='region'){profile.region=Number(value);lessonId=regionLessons()[0]?.id;save();render();root.querySelector(`[data-ia-action="region"][data-value="${value}"]`)?.focus();}
  if(act==='companion'&&COMPANIONS.some(c=>c.id===value)){profile.companion=value;save();render();root.querySelector(`[data-ia-action="companion"][data-value="${value}"]`)?.focus();}
  if(act==='start'||act==='review')start(act==='review'?'review':'new');
  if(act==='resume')resume();
  if(act==='discard'){profile.active=null;save();render();}
  if(act==='guide')bridge.guide(selected().id);
  if(act==='visit'){lessonId=value;profile.region=Math.floor((selected().order-1)/23);save();render();}
  if(act==='catalogue')document.querySelector('.lesson-search-panel')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(act==='answer')answer(Number(value));
  if(act==='skill'&&profile.active&&!profile.active.help&&profile.active.charges>0&&!profile.active.solved){profile.active.charges--;profile.active.help=true;save();drawRoom();}
  if(act==='next'&&profile.active?.solved){advance(profile);save();notice='';drawRoom();if(profile.active.index<6)dialog.querySelector('.ia-answer')?.focus();}
  if(act==='finish'||act==='more'){if(profile.active?.index!==6)return;const id=profile.active.lessonId;profile.active=null;save();close();if(act==='more')start('new',id);}
 }
 root.addEventListener('click',handle);
 root.addEventListener('change',e=>{if(e.target.matches('[data-ia-lesson]'))lessonId=e.target.value;});
 return {
  sync(id){id=String(id||'');if(owner!==id){generation++;busy=false;dialog?.close();owner=id;load();lessonId=profile.active?.lessonId||'';}if(owner)render();else root.hidden=true;},
  open(id){if(!owner)return;start('new',id);},
  reset(){generation++;busy=false;audio?.suspend().catch(()=>{});dialog?.close();owner='';profile=freshProfile();root.hidden=true;root.innerHTML='';}
 };
}
