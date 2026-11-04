import {paper3Topic} from './paper3-writing-topics.mjs';
const API='https://edmund-writing-submission.edmundeducation.workers.dev';
const PROXY='https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/writing-submission-proxy';
const sourceValue=fields=>fields.map(f=>f.value||'').join('\n').trim();
function fillSource(fields,text){if(!fields.length)return;const lines=text.split('\n');fields.forEach((field,i)=>{field.value=i===fields.length-1?lines.slice(i).join('\n'):fields.length===1?text:lines[i]||'';});}
async function request(path,token,body){const response=await fetch(body?PROXY+'?submissionId='+encodeURIComponent(body.id):API+path,{method:body?'PUT':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body.payload)}:{}),cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(result.message||result.error||'未能連接交文系統');return result;}
export function mountPaper3Writing(root,{year,level,session:sessionGetter,sources={},activeTask=null}) {
  if(!root)return;
  if(!document.querySelector('link[data-paper3-writing-style]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/paper3-writing-bridge.css?v=20260906-classroom2';css.dataset.paper3WritingStyle='';document.head.append(css);}
  root.classList.add('paper3-writing-bridge');root.replaceChildren();
  const heading=document.createElement('h2');heading.textContent='Part B · 寫作及交文';root.append(heading);
  const intro=document.createElement('p');intro.textContent='在這裡提交的文章會存入 Writing Submission System。從交文系統提交同一題目，也可在這裡查看最新文章。';root.append(intro);
  for(const task of level.toLowerCase()==='b1'?[5,6,7]:[8,9,10]){
    const topic=paper3Topic(`paper3-${year}-${level.toLowerCase()}-task-${task}`);if(!topic)continue;
    const details=document.createElement('details');details.id=`paper3-task-${task}`;details.open=activeTask?Number(activeTask)===task:false;
    const summary=document.createElement('summary');summary.textContent=topic.label;details.append(summary);
    const input=document.createElement('textarea');input.rows=15;input.maxLength=100000;input.setAttribute('aria-label',topic.label+' writing');input.placeholder='在這裡輸入你的答案，或使用上方答題簿的內容。';
    const actions=document.createElement('div');actions.className='paper3-writing-actions';const submit=document.createElement('button');submit.type='button';submit.textContent='提交到 Writing Submission';const refresh=document.createElement('button');refresh.type='button';refresh.textContent='載入最新已交文章';const link=document.createElement('a');link.textContent='到 Writing Submission 查看';link.hidden=true;actions.append(submit,refresh,link);
    const status=document.createElement('p');status.setAttribute('role','status');
    details.append(input,actions,status);root.append(details);
    const actor=()=>sessionGetter?.()||window.EdmundSystemNav?.getStudentSession();
    const initialActor=actor(),owner=initialActor?.id||initialActor?.name||'';
    const storageKey=`edmund-paper3-writing-v1:${owner}:${topic.id}`;
    let dirty=false,pendingId='',pendingText='',lastSaved=null;
    try{const local=JSON.parse(localStorage.getItem(storageKey)||'null');if(local&&owner){input.value=local.text||'';dirty=!!local.dirty;pendingId=local.pendingId||'';pendingText=local.pendingText||'';}}catch{}
    const persist=()=>{if(!owner)return;try{localStorage.setItem(storageKey,JSON.stringify({text:input.value,dirty,pendingId,pendingText}));}catch{status.textContent='此瀏覽器未能儲存草稿，請提交前勿關閉頁面。';}};
    const currentActor=()=>{const user=actor();if(!user?.token||!owner||(user.id||user.name)!==owner)throw new Error('請先登入 Integrated Skills 或 Writing Submission，然後重新開啟本頁。');return user;};
    const fields=sources[task]||[];
    input.oninput=()=>{dirty=true;persist();};
    fields.forEach(field=>field.addEventListener('input',()=>{input.value=sourceValue(fields);dirty=true;persist();}));
    if(fields.length){const pull=document.createElement('button');pull.type='button';pull.textContent='使用答題簿的內容';pull.onclick=()=>{input.value=sourceValue(fields);dirty=true;persist();details.open=true;};actions.prepend(pull);const next=document.createElement('button');next.type='button';next.className='paper3-submit-from-source';next.textContent=`Task ${task} · 檢查答案及交文`;next.onclick=()=>{input.value=sourceValue(fields);dirty=true;persist();details.open=true;details.scrollIntoView({behavior:'smooth',block:'start'});};fields[fields.length-1].insertAdjacentElement('afterend',next);}
    async function load(explicit=false){
      refresh.disabled=true;try{const user=currentActor();const before=input.value;const payload=await request(`/v1/paper3/${year}/${level.toLowerCase()}/${task}`,user.token);if(!details.isConnected)return;lastSaved=payload.submission;if(lastSaved){link.href='/writing-submission.html?submission='+encodeURIComponent(lastSaved.id);link.hidden=false;if((explicit||!dirty)&&input.value===before){input.value=lastSaved.answer||'';dirty=false;fillSource(fields,input.value);persist();status.textContent='已載入最新交文：'+new Date(lastSaved.submittedAt).toLocaleString();}else status.textContent='這裡保留了你的未交草稿。可按「載入最新已交文章」查看已提交版本。';}else status.textContent=dirty?'已還原這部裝置上的草稿。':'這項任務尚未交文。';}catch(error){status.textContent=error.message;}finally{refresh.disabled=false;}}
    refresh.onclick=()=>load(true);
    submit.onclick=async()=>{const text=input.value.trim();if(!text||submit.disabled){if(!text)status.textContent='請先輸入答案。';return;}let user;try{user=currentActor();}catch(error){status.textContent=error.message;return;}if(lastSaved?.answer===text){location.href='/writing-submission.html?submission='+lastSaved.id;return;}
      if(!pendingId||pendingText!==text){pendingId=crypto.randomUUID();pendingText=text;persist();}submit.disabled=true;status.textContent='正在交文…';
      try{const payload=await request('',user.token,{id:pendingId,payload:{topic:topic.label,answer:text,durationSeconds:0,topicResource:topic}});lastSaved=payload.submission;dirty=false;pendingId='';pendingText='';persist();status.textContent='已提交，正在開啟你的文章…';location.href='/writing-submission.html?submission='+encodeURIComponent(lastSaved.id);}catch(error){status.textContent='未能交文：'+error.message+'。你的文字仍保留，可重試。';submit.disabled=false;}
    };
    load();
  }
}
