import {PROGRESS_KEY,mergeProgress,normalizeProgress} from './literary-device-progress.mjs?v=1';
import {createAuthenticatedRpc} from './literary-device-supabase.mjs?v=ledger8';
const key='edmund-universal-student-session-v1',gate=document.querySelector('#student-gate'),app=document.querySelector('#student-app'),form=document.querySelector('#student-login'),status=document.querySelector('#login-status');
let session,expiryTimer,loaded=false,learning;
let authStorage;try{authStorage=sessionStorage;}catch{}
const rpc=createAuthenticatedRpc({config:window.EDMUND_SUPABASE,supabase:window.supabase,storage:authStorage});
function lock(message=''){clearTimeout(expiryTimer);session=null;learning?.resetProgress();app.hidden=true;gate.hidden=false;document.querySelector('#hint').close();status.textContent=message;try{sessionStorage.removeItem(key);}catch{} }
function localKey(studentId){return PROGRESS_KEY+':'+studentId;}
function readLocal(studentId){try{return JSON.parse(localStorage.getItem(localKey(studentId))||'null');}catch{return null;}}
function writeLocal(studentId,value){try{localStorage.setItem(localKey(studentId),JSON.stringify(value));}catch{}}
async function loadProgress(){
 const rows=await rpc('flashcard_student_get_state_v2',{p_token:session.token});
 const remote=rows.find(row=>row.key===PROGRESS_KEY)?.value;
 const merged=mergeProgress(remote,readLocal(session.id));
 writeLocal(session.id,merged);
 return merged;
}
async function saveProgress(value){
 const normalized=normalizeProgress(value);normalized.updatedAt=Date.now();writeLocal(session.id,normalized);
 const ok=await rpc('flashcard_student_upsert_state',{p_token:session.token,p_key:PROGRESS_KEY,p_value:normalized});
 if(ok!==true)throw Error('學習進度暫時未能儲存。');
 return normalized;
}
async function enter(candidate){
 const rows=await rpc('song_appreciation_student_me',{p_student_token:candidate.token});const student=rows[0];
 if(!student){lock('登入已失效，請重新登入。');return false;}
 session={token:candidate.token,id:student.id,name:student.name,role:'student'};
 try{sessionStorage.setItem(key,JSON.stringify(session));}catch{}
 if(!loaded){learning=await import(document.querySelector('[data-learning-module]').dataset.learningModule);loaded=true;}
 await learning.configureProgressStore({load:loadProgress,save:saveProgress});
 document.querySelector('#student-name').textContent=student.name;gate.hidden=true;app.hidden=false;form.reset();
 const remaining=new Date(student.session_expires_at).getTime()-Date.now();clearTimeout(expiryTimer);expiryTimer=setTimeout(()=>lock('登入已到期，請重新登入。'),Math.min(Math.max(remaining,0),2147483647));
 return true;
}
form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='正在驗證學生帳戶…';try{const rows=await rpc('flashcard_student_login',{p_name:form.elements.username.value.trim(),p_password:form.elements.password.value});const student=rows[0];if(!student||student.role!=='student'){status.textContent='學生姓名或密碼不正確。';return;}await enter({token:student.session_token});}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
document.querySelector('#student-logout').onclick=()=>{lock('已登出。');location.reload();};
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&session){try{await enter(session);}catch{lock('請重新登入以驗證連線。');}}});
try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved?.role==='student'&&saved.token){status.textContent='正在驗證登入狀態…';enter(saved).catch(()=>lock('請登入學生帳戶。'));}}catch{}
