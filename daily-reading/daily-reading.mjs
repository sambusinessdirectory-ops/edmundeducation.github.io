const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const sessionKey = 'edmund-daily-reading-session-v1';
const draftPrefix = 'edmund-daily-reading-parking-meter-v1:';
let authGeneration = 0;

const passage = [
  'The Transport Department said a software update triggered a citywide malfunction of Hong Kong’s parking meter system on Tuesday.',
  'The department said preliminary investigations found that a software update in the morning caused a back-end software fault, which prevented the system from making a normal connection with the parking meters.',
  'It added that about 11,000 parking meters were affected across the city.',
  'The department has instructed the operator to conduct a thorough investigation into the cause of the outage and submit a detailed report.',
  'There is no evidence that the system was attacked at the moment, the department said, adding it has reported the matter to the Digital Policy Office.',
  'The operator will arrange for full refunds for all meter transactions between 8am and 12.15pm to users, and will strive to complete the approval of the refunds within this week, it added.',
  'The Transport Department received a report at around 8.20am from the operator that the parking meter system had malfunctioned, with payment functions suspended or meter displays not operating normally.',
  'The system resumed normal operations at 12.15pm.'
];

const sections = [
  ['A','Understanding the news report','理解新聞報道'],
  ['B','Explaining the technical problem','解釋技術問題'],
  ['C','Responsibility, investigation and uncertainty','責任、調查與不確定性'],
  ['D','Time, refunds and careful interpretation','時間、退款與審慎理解'],
  ['E','Organisation, editing and writer’s language','組織、編輯與作者語言']
];
const choices = (...items) => items;
const selectOptions = items => items.map(value => ({value,label:value}));
const tfn = selectOptions(['T','F','NG']);
const yesNo = selectOptions(['YES','NO']);
const ab = selectOptions(['A','B']);
const paragraphs = selectOptions(['1','4','6','8']);

const questions = [
  {id:1,section:'A',marks:1,refs:[1],prompt:'What type of text is this? Choose ONE answer.',fields:[{type:'choice',options:choices('A personal account of a driver’s experience','A report of a public-service disruption','An advertisement for a payment service','A guide to using parking meters'),answer:'1'}],sample:'B. A report of a public-service disruption',why:'The passage reports an interruption to a public parking service and the official response.'},
  {id:2,section:'A',marks:1,refs:[1,2,3],prompt:'Which is the best alternative headline for the article?',fields:[{type:'choice',options:choices('Hong Kong Parking Charges to Rise After System Upgrade','Parking Meter Operator Completes Cyberattack Investigation','Software Fault Disrupts Thousands of Parking Meters','New Parking Meters Installed Throughout Hong Kong'),answer:'2'}],sample:'C. Software Fault Disrupts Thousands of Parking Meters',why:'It captures both the reported cause and the scale without adding unsupported claims.'},
  {id:3,section:'A',marks:4,refs:[1,3,4,6,7],prompt:'Are the following statements True (T), False (F), or Not Given (NG)?',fields:[
    {label:'(i) The disruption was limited to a single district of Hong Kong.',type:'select',options:tfn,answer:'F',marks:1},
    {label:'(ii) The Transport Department had already received the operator’s full investigation report when the news was announced.',type:'select',options:tfn,answer:'F',marks:1},
    {label:'(iii) Every person who used a parking meter during the affected period had contacted the operator to request a refund.',type:'select',options:tfn,answer:'NG',marks:1},
    {label:'(iv) The article says some meter screens were not working as they normally should.',type:'select',options:tfn,answer:'T',marks:1}
  ],sample:'(i) F　(ii) F　(iii) NG　(iv) T',why:'“Citywide” contradicts (i); a report was ordered, not received; user contact is unstated; display failure is explicit.'},
  {id:4,section:'A',marks:1,refs:[3],prompt:'In paragraph 3, what does the word “about” suggest concerning the figure 11,000?',fields:[{type:'textarea',keywords:[['approximate','estimate','not exact','rough']],marks:1}],sample:'The figure is approximate—an estimate rather than exactly 11,000.',why:'“About” qualifies the number instead of presenting it as exact.'},
  {id:5,section:'A',marks:1,refs:[1],prompt:'Find ONE word in paragraph 1 meaning “affecting the whole city”.',fields:[{type:'text',accept:['citywide'],marks:1}],sample:'citywide',why:'The compound adjective directly expresses whole-city scope.'},

  {id:6,section:'B',marks:2,refs:[2],prompt:'Complete the cause-and-effect notes using NO MORE THAN THREE WORDS from paragraph 2.',fields:[
    {label:'A software update led to a …',type:'text',accept:['back-end software fault','backend software fault'],marks:1},
    {label:'The system could not make a normal … with the meters.',type:'text',accept:['connection'],marks:1}
  ],sample:'(i) back-end software fault　(ii) connection',why:'These are the two linked stages stated in paragraph 2.'},
  {id:7,section:'B',marks:1,refs:[2],prompt:'What does “which” in paragraph 2 refer to?',fields:[{type:'text',accept:['a back-end software fault','back-end software fault','a backend software fault','backend software fault'],marks:1}],sample:'a back-end software fault',why:'The relative clause immediately follows and describes the fault.'},
  {id:8,section:'B',marks:2,refs:[7],prompt:'According to paragraph 7, which TWO problems were reported? Tick TWO boxes only.',fields:[{type:'multi',options:choices('Parking meters were physically removed from the streets.','Some payment functions stopped working.','The prices displayed on meters were increased.','Some meter displays did not operate normally.','The city’s road traffic lights went out.'),answer:['1','3'],max:2,marks:2}],sample:'B and D',why:'Paragraph 7 explicitly reports suspended payment functions and abnormal meter displays.'},
  {id:9,section:'B',marks:1,refs:[2,7],prompt:'Which conclusion about the parking meters themselves is most justified by the article? Choose ONE answer.',fields:[{type:'choice',options:choices('All the individual meters had to be replaced.','A connection problem affected meter operations, but physical damage is not established.','The meters were intentionally switched off for maintenance.','Each meter had a separate hardware fault.'),answer:'1'}],sample:'B. A connection problem affected meter operations, but physical damage is not established.',why:'The passage identifies a back-end connection failure, not proven hardware damage.'},

  {id:10,section:'C',marks:3,refs:[4,6,7],prompt:'Match each action with the organisation that the article explicitly assigns it to. Write A (Transport Department) or B (Operator). Each letter may be used more than once.',fields:[
    {label:'(i) Instructed another party to investigate the cause of the outage.',type:'select',options:ab,answer:'A',marks:1},
    {label:'(ii) Informed the department about the malfunction at around 8.20am.',type:'select',options:ab,answer:'B',marks:1},
    {label:'(iii) Will arrange refunds for affected meter transactions.',type:'select',options:ab,answer:'B',marks:1}
  ],sample:'(i) A　(ii) B　(iii) B',why:'The article assigns each action to a named actor.'},
  {id:11,section:'C',marks:1,refs:[4],prompt:'Find ONE word in paragraph 4 meaning “careful and complete”.',fields:[{type:'text',accept:['thorough'],marks:1}],sample:'thorough',why:'“Thorough” means detailed, careful and complete.'},
  {id:12,section:'C',marks:1,refs:[2],prompt:'What does “preliminary” in paragraph 2 tell readers about the investigation at that stage? Explain in your own words.',fields:[{type:'textarea',keywords:[['early','initial','provisional','not final','incomplete']],marks:1}],sample:'The findings were initial or provisional; the investigation was not yet final.',why:'The word limits the certainty and completeness of the findings.'},
  {id:13,section:'C',marks:1,refs:[5],prompt:'Which statement best reflects the department’s position on a possible attack?',fields:[{type:'choice',options:choices('It proved an attack could never have occurred.','It currently has no evidence of an attack.','It confirmed an attack caused the outage.','It decided not to examine the cause further.'),answer:'1'}],sample:'B. It currently has no evidence of an attack.',why:'The statement is time-limited and does not rule out every future possibility.'},
  {id:14,section:'C',marks:1,refs:[5],prompt:'Identify ONE phrase in paragraph 5 which limits the department’s statement to the information available at the time.',fields:[{type:'text',accept:['at the moment'],marks:1}],sample:'at the moment',why:'The phrase explicitly makes the claim temporary.'},
  {id:15,section:'C',marks:1,refs:[5],prompt:'What was the role of the Digital Policy Office in the article? Choose ONE answer.',fields:[{type:'choice',options:choices('It was informed of the incident.','It operated all the parking meters.','It promised to reimburse drivers directly.','It announced the cause of the malfunction.'),answer:'0'}],sample:'A. It was informed of the incident.',why:'The matter was reported to the Office; no further role is stated.'},
  {id:16,section:'C',marks:1,refs:[2,4],prompt:'Why is the instruction to submit a detailed report significant, given paragraph 2?',fields:[{type:'textarea',keywords:[['preliminary','initial','provisional'],['fuller','further','detailed','complete','establish']],marks:1}],sample:'The initial findings were only preliminary, so a fuller investigation was still needed to establish the cause in detail.',why:'This answer integrates the limited early finding with the later demand for a complete account.'},

  {id:17,section:'D',marks:3,refs:[6,7,8],prompt:'Complete the timeline with the correct time for each event.',fields:[
    {label:'(i) Start of the period covered by the refund arrangement',type:'text',accept:['8am','8 am','8:00am','8:00 am'],marks:1},
    {label:'(ii) The Transport Department received the operator’s report',type:'text',accept:['around 8.20am','8.20am','around 8:20am','8:20am','8.20 am','8:20 am'],marks:1},
    {label:'(iii) Normal operation of the parking meter system resumed',type:'text',accept:['12.15pm','12:15pm','12.15 pm','12:15 pm'],marks:1}
  ],sample:'(i) 8am　(ii) around 8.20am　(iii) 12.15pm',why:'The three times come from the refund, report and resumption details.'},
  {id:18,section:'D',marks:2,refs:[6],prompt:'Decide whether each transaction falls within the time window specified for refunds. Write YES or NO. Assume each is a parking-meter transaction; do not make assumptions about whether the transaction was successful.',fields:[
    {label:'(i) 8.10am',type:'select',options:yesNo,answer:'YES',marks:1},
    {label:'(ii) 12.30pm',type:'select',options:yesNo,answer:'NO',marks:1}
  ],sample:'(i) YES　(ii) NO',why:'The stated interval runs from 8am to 12.15pm.'},
  {id:19,section:'D',marks:2,refs:[6],prompt:'Complete using ONE word from paragraph 6 for each blank.',fields:[
    {label:'The operator promised … refunds.',type:'text',accept:['full'],marks:1},
    {label:'It aimed to complete their … within the week.',type:'text',accept:['approval'],marks:1}
  ],sample:'(i) full　(ii) approval',why:'The passage distinguishes refund extent from the approval process.'},
  {id:20,section:'D',marks:1,refs:[6],prompt:'What does “strive” suggest about completing approvals within the week?',fields:[{type:'choice',options:choices('Completion has already happened.','Completion is intended, but not guaranteed.','Completion is cancelled.','Completion will take exactly seven days.'),answer:'1'}],sample:'B. Completion is intended, but not guaranteed.',why:'“Strive” expresses effort or intention, not certainty.'},
  {id:21,section:'D',marks:2,refs:[6],prompt:'Has the article confirmed that all users had received their refunds by the time of reporting? Answer YES or NO, and give ONE reason from the article.',fields:[
    {label:'Answer',type:'select',options:yesNo,answer:'NO',marks:1},
    {label:'Reason',type:'textarea',keywords:[['will arrange','strive','approval','not paid','not received','future']],marks:1}
  ],sample:'NO. It only says refunds will be arranged and approval will be attempted; it does not say everyone was paid.',why:'A future arrangement and its approval are not proof of completed payment.'},
  {id:22,section:'D',marks:1,refs:[6],prompt:'What information would you need to calculate the exact refund amount for one particular driver, which the article does not provide? Give ONE example.',fields:[{type:'textarea',keywords:[['amount paid','payment amount','number of transactions','value of transactions','transaction value','parking duration']],marks:1}],sample:'The amount paid, or the number/value of that driver’s affected transactions.',why:'The article gives an eligibility window but no individual transaction value.'},

  {id:23,section:'E',marks:4,refs:[1,4,6,8],prompt:'Match each paragraph function to the appropriate paragraph number (1, 4, 6 or 8). Use each paragraph number ONCE only.',fields:[
    {label:'(i) Announces the overall incident',type:'select',options:paragraphs,answer:'1',marks:1},
    {label:'(ii) Explains what the authority demanded',type:'select',options:paragraphs,answer:'4',marks:1},
    {label:'(iii) Sets out the compensation arrangement',type:'select',options:paragraphs,answer:'6',marks:1},
    {label:'(iv) Confirms service returned',type:'select',options:paragraphs,answer:'8',marks:1}
  ],sample:'(i) 1　(ii) 4　(iii) 6　(iv) 8',why:'The answer follows each paragraph’s communicative function, not merely a repeated word.'},
  {id:24,section:'E',marks:2,refs:[2,3,5,6],prompt:'What is the overall tone of the report? Choose ONE answer and give ONE piece of evidence from its language or presentation.',fields:[
    {type:'choice',options:choices('Celebratory','Accusatory','Factual and cautious','Humorous'),answer:'2',marks:1},
    {label:'Evidence',type:'textarea',keywords:[['preliminary','about 11,000','at the moment','strive','official','factual']],marks:1}
  ],sample:'C. Factual and cautious; for example, “preliminary investigations” or “at the moment”.',why:'The report relies on attributed facts and qualified language rather than humour or accusation.'}
];

const state = {user:null,token:'',checked:new Set(),scores:new Map()};
const views = Object.fromEntries($$('[data-view]').map(view => [view.dataset.view,view]));

function showView(name){
  Object.entries(views).forEach(([id,view])=>{view.hidden=id!==name;});
  const logged=Boolean(state.user&&state.token);
  $('[data-user]').hidden=!logged;$('[data-logout]').hidden=!logged;$('[data-library-home]').hidden=!logged||name==='library';
  if(logged)$('[data-user]').textContent=state.user.name;
}
async function rpc(name,args){
  const config = window.EDMUND_SUPABASE || {};
  if(!config.url||!config.anonKey)throw Error('登入服務暫時未能載入，請重新整理頁面。');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  let response;
  try{response=await fetch(`${config.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:config.anonKey,'Content-Type':'application/json'},body:JSON.stringify(args),cache:'no-store',credentials:'omit',signal:controller.signal});}
  catch(error){if(error?.name==='AbortError')throw Error('登入服務回應逾時，請再試一次。');throw Error('登入服務暫時未能連接，請檢查網絡後重試。');}
  finally{clearTimeout(timeout);}
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw Error(data?.message||'登入服務暫時未能連接。');
  return Array.isArray(data)?data[0]:data;
}
function remember(row,token){
  state.user={id:String(row.id||''),name:String(row.name||'Student'),role:'student'};state.token=String(token||row.session_token||'');
  try{sessionStorage.setItem(sessionKey,JSON.stringify({...state.user,token:state.token}));}catch{}
  try{window.EdmundSystemNav?.rememberStudentSession?.({...state.user,token:state.token});}catch{}
  $('[data-welcome]').textContent=`您好，${state.user.name}。今天的閱讀練習已準備好。`;
}
function forget(){authGeneration++;state.user=null;state.token='';try{sessionStorage.removeItem(sessionKey);}catch{}try{window.EdmundSystemNav?.forgetStudentSession?.();}catch{}showView('login');}
async function restore(){
  const generation=authGeneration;let shared=null,own=null;try{shared=window.EdmundSystemNav?.getStudentSession?.();}catch{}try{own=JSON.parse(sessionStorage.getItem(sessionKey)||'null');}catch{}
  const candidate=shared?.role==='student'?shared:own?.role==='student'?own:null;if(!candidate?.token)return false;
  const row=await rpc('flashcard_student_session_profile',{p_token:String(candidate.token)});if(generation!==authGeneration)return false;if(!row?.session_token||!row?.name)throw Error('登入時段已失效，請重新登入。');
  remember(row,row.session_token);showView('library');return true;
}

function normalize(value){return String(value||'').toLowerCase().trim().replace(/[.,!?;:'’“”"()]/g,'').replace(/[-–—]/g,' ').replace(/\s+/g,' ');}
function answerKey(q,index){return `q${q.id}-f${index}`;}
function controlValue(q,field,index,card){
  const name=answerKey(q,index);
  if(field.type==='choice')return card.querySelector(`input[name="${name}"]:checked`)?.value||'';
  if(field.type==='multi')return [...card.querySelectorAll(`input[name="${name}"]:checked`)].map(input=>input.value);
  return card.querySelector(`[name="${name}"]`)?.value||'';
}
function fieldScore(field,value){
  const marks=field.marks??1;
  if(field.type==='multi'){
    if(value.length>(field.max||field.answer.length))return 0;
    return value.filter(item=>field.answer.includes(item)).length*(marks/field.answer.length);
  }
  if(field.answer!==undefined)return normalize(value)===normalize(field.answer)?marks:0;
  if(field.accept)return field.accept.some(answer=>normalize(value)===normalize(answer))?marks:0;
  if(field.keywords){const text=normalize(value);return field.keywords.every(group=>group.some(word=>text.includes(normalize(word))))?marks:0;}
  return 0;
}
function renderField(q,field,index){
  const name=answerKey(q,index),label=field.label?`<label>${field.label}</label>`:'';
  if(field.type==='choice'||field.type==='multi'){
    const kind=field.type==='choice'?'radio':'checkbox';
    return `<div class="field-block">${label}<div class="option-list">${field.options.map((option,i)=>`<label class="option"><input type="${kind}" name="${name}" value="${i}"><span>${'ABCDE'[i]}. ${option}</span></label>`).join('')}</div></div>`;
  }
  if(field.type==='select')return `<div class="field-row">${label}<select name="${name}"><option value="">請選擇</option>${field.options.map(option=>`<option value="${option.value}">${option.label}</option>`).join('')}</select></div>`;
  if(field.type==='textarea')return `<div class="field-block">${label}<textarea class="open-answer" name="${name}" placeholder="在此作答"></textarea></div>`;
  return `<div class="field-row">${label}<input name="${name}" type="text" autocomplete="off" placeholder="輸入答案"></div>`;
}
function renderQuestions(){
  const root=$('[data-questions]');root.replaceChildren();
  for(const [section,title,zh] of sections){
    const heading=document.createElement('h3');heading.className='section-heading';heading.id=`section-${section}`;heading.textContent=`${section}. ${title}｜${zh}`;root.append(heading);
    for(const q of questions.filter(item=>item.section===section)){
      const card=document.createElement('article');card.className='question-card';card.id=`question-${q.id}`;card.dataset.question=String(q.id);card.dataset.refs=q.refs.join(',');
      card.innerHTML=`<div class="question-meta"><span>QUESTION ${String(q.id).padStart(2,'0')}</span><span>${q.marks} MARK${q.marks>1?'S':''}</span></div><p class="question-prompt">${q.prompt}</p><div class="field-list">${q.fields.map((field,index)=>renderField(q,field,index)).join('')}</div><div class="question-actions"><button type="button" class="check-button">檢查答案</button><span class="marks-earned"></span></div><div class="feedback" hidden><strong></strong><span></span></div>`;
      card.querySelector('.check-button').onclick=()=>checkQuestion(q,card,true);card.addEventListener('focusin',()=>highlight(q.refs));card.addEventListener('click',()=>highlight(q.refs));
      card.querySelectorAll('input,textarea,select').forEach(control=>control.addEventListener('change',saveDraft));root.append(card);
    }
  }
  const nav=$('[data-section-nav]');nav.replaceChildren(...sections.map(([id,title])=>{const b=document.createElement('button');b.type='button';b.textContent=`${id} · ${title}`;b.onclick=()=>document.getElementById(`section-${id}`).scrollIntoView({behavior:'smooth'});return b;}));
}
function highlight(refs){$$('.passage-paragraph').forEach(p=>p.classList.toggle('is-referenced',refs.includes(Number(p.dataset.number))));}
function checkQuestion(q,card,announce=false){
  let score=0;q.fields.forEach((field,index)=>{score+=fieldScore(field,controlValue(q,field,index,card));});score=Math.round(score*100)/100;
  state.checked.add(q.id);state.scores.set(q.id,score);card.classList.remove('is-correct','is-partial','is-wrong');card.classList.add(score===q.marks?'is-correct':score>0?'is-partial':'is-wrong');
  const feedback=card.querySelector('.feedback');feedback.hidden=false;feedback.querySelector('strong').textContent=`參考答案：${q.sample}`;feedback.querySelector('span').textContent=q.why;card.querySelector('.marks-earned').textContent=`本題 ${score} / ${q.marks} 分`;
  updateProgress();saveDraft();if(announce)feedback.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function updateProgress(){
  const score=[...state.scores.values()].reduce((sum,value)=>sum+value,0),checked=state.checked.size;
  $('[data-score]').textContent=String(score);$('[data-progress-text]').textContent=`已檢查 ${checked} / ${questions.length} 題`;$('[data-progress-bar]').style.width=`${checked/questions.length*100}%`;
}
function draftKey(){return draftPrefix+(state.user?.id||'student');}
function saveDraft(){
  if(!state.user)return;const values={};$$('[data-question]').forEach(card=>{const q=questions.find(item=>String(item.id)===card.dataset.question);q.fields.forEach((field,index)=>{values[answerKey(q,index)]=controlValue(q,field,index,card);});});
  localStorage.setItem(draftKey(),JSON.stringify({values,checked:[...state.checked]}));
}
function restoreDraft(){
  let draft=null;try{draft=JSON.parse(localStorage.getItem(draftKey())||'null');}catch{}if(!draft)return;
  for(const [name,value] of Object.entries(draft.values||{})){
    const controls=$$(`[name="${name}"]`);if(Array.isArray(value))controls.forEach(control=>{control.checked=value.includes(control.value);});else if(controls[0]?.type==='radio')controls.forEach(control=>{control.checked=control.value===value;});else if(controls[0])controls[0].value=value;
  }
  for(const id of draft.checked||[]){const q=questions.find(item=>item.id===Number(id)),card=document.querySelector(`[data-question="${id}"]`);if(q&&card)checkQuestion(q,card);}
}
function resetDraft(){if(!confirm('確定清除本篇所有答案及分數？'))return;localStorage.removeItem(draftKey());state.checked.clear();state.scores.clear();renderQuestions();updateProgress();window.scrollTo({top:0,behavior:'smooth'});}
function finish(){
  questions.forEach(q=>{const card=document.querySelector(`[data-question="${q.id}"]`);if(!state.checked.has(q.id))checkQuestion(q,card);});
  const score=[...state.scores.values()].reduce((sum,value)=>sum+value,0),result=$('[data-final-result]');result.hidden=false;result.innerHTML=`<p class="panel-label">COMPLETE · 完成</p><h3>${score} / 40</h3><p>已檢查全部 24 題。請重看標示為部分正確或需要修正的答案，並以文章證據核實。</p>`;result.scrollIntoView({behavior:'smooth'});
}

$('[data-passage]').replaceChildren(...passage.map((text,index)=>{const p=document.createElement('p');p.className='passage-paragraph';p.dataset.number=String(index+1);p.textContent=text;return p;}));
renderQuestions();updateProgress();
$('[data-login-form]').onsubmit=async event=>{
  event.preventDefault();
  const form=event.currentTarget,status=$('[data-login-status]'),button=$('[data-login-button]'),values=new FormData(form);
  const username=String(values.get('username')||'').trim(),password=String(values.get('password')||'');
  if(!username||!password){status.textContent='請輸入學生帳戶名稱及密碼。';form.dataset.loginFeedback='error';return;}
  const generation=++authGeneration,originalLabel=button.textContent;
  status.textContent='正在驗證學生帳戶…';form.dataset.loginFeedback='pending';form.setAttribute('aria-busy','true');button.disabled=true;button.textContent='正在登入…';
  try{
    const row=await rpc('flashcard_student_login',{p_name:username,p_password:password});
    if(generation!==authGeneration)return;
    if(!row?.session_token)throw Error('學生帳戶或密碼不正確。');
    remember(row,row.session_token);form.reset();status.textContent='登入成功，正在開啟文章目錄…';form.dataset.loginFeedback='complete';showView('library');
  }catch(error){if(generation===authGeneration){status.textContent=error?.message||'登入失敗，請再試一次。';form.dataset.loginFeedback='error';}}
  finally{if(generation===authGeneration){form.removeAttribute('aria-busy');button.disabled=false;button.textContent=originalLabel;}}
};
$('[data-password-toggle]').onclick=event=>{const input=$('[name="password"]'),show=input.type==='password';input.type=show?'text':'password';event.currentTarget.textContent=show?'隱藏':'顯示';event.currentTarget.setAttribute('aria-pressed',String(show));};
$('[data-open-article]').onclick=()=>{showView('exercise');restoreDraft();window.scrollTo({top:0,behavior:'smooth'});};
$('[data-back]').onclick=$('[data-library-home]').onclick=()=>{showView('library');window.scrollTo({top:0,behavior:'smooth'});};
$('[data-logout]').onclick=forget;$('[data-reset]').onclick=resetDraft;$('[data-finish]').onclick=finish;
restore().catch(error=>{forget();$('[data-login-status]').textContent=error?.message||'登入時段已失效，請重新登入。';$('[data-login-form]').dataset.loginFeedback='error';});
