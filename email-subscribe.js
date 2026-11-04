import {EMAIL_TOPICS} from './email-shared.mjs';
const form=document.querySelector('[data-signup]'),result=document.querySelector('[data-result]');
const chosen=new URLSearchParams(location.search).get('topic');
for(const [key,topic] of Object.entries(EMAIL_TOPICS)){
 const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='topic';input.value=key;input.checked=key===chosen;label.append(input,document.createTextNode(topic.title));document.querySelector('[data-topics]').append(label);
}
const base=String(window.EDMUND_SCHEDULE_CONFIG?.workerBaseUrl||'').replace(/\/+$/,'');
async function send(action,body){const response=await fetch(`${base}/v1/email/subscriptions/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw new Error(data.error||'服務暫時未能完成，請稍後再試。');return data;}
form.onsubmit=async event=>{
 event.preventDefault();const data=new FormData(form);const topics=data.getAll('topic');if(!topics.length){result.textContent='請至少選擇一個頁面。';return;}
 const button=form.querySelector('button');button.disabled=true;result.textContent='正在提交…';
 try{const response=await send('request',{name:data.get('name'),email:data.get('email'),topics,website:data.get('website'),consent:data.get('consent')==='on'});result.textContent=response.message||'請查看確認電郵。';}
 catch(error){result.textContent=error.message;}finally{button.disabled=false;result.scrollIntoView({block:'nearest'});}
};
const fragment=new URLSearchParams(location.hash.slice(1));
const action=fragment.has('confirm')?'confirm':fragment.has('unsubscribe')?'unsubscribe':null;
if(action){
 const token=fragment.get(action);history.replaceState(null,'',location.pathname+location.search);
 form.hidden=true;document.querySelector('[data-action]').hidden=false;
 document.querySelector('[data-action-title]').textContent=action==='confirm'?'確認你的訂閱':'取消所有頁面更新通知';
 document.querySelector('[data-action-description]').textContent=action==='confirm'?'按下方按鈕完成訂閱。':'按下方按鈕取消；你可日後重新訂閱。';
 const button=document.querySelector('[data-action-button]');button.textContent=action==='confirm'?'確認訂閱':'確認取消訂閱';
 button.onclick=async()=>{button.disabled=true;try{await send(action,{token});result.textContent=action==='confirm'?'訂閱成功！公開頁面更新時，我們會透過電郵通知你。':'已取消訂閱。';button.hidden=true;}catch(error){result.textContent=error.message;button.disabled=false;}};
}
