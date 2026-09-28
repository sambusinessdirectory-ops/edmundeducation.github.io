let dbPromise;
const db = () => dbPromise ||= new Promise((resolve,reject) => {
  const request=indexedDB.open('edmund-synonyms-audio',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('recordings');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
});
function cache(key,value) {
  return db().then(database=>new Promise((resolve,reject)=>{
    const transaction=database.transaction('recordings',value?'readwrite':'readonly');
    const request=value?transaction.objectStore('recordings').put(value,key):transaction.objectStore('recordings').get(key);
    transaction.oncomplete=()=>resolve(request.result);
    transaction.onerror=()=>reject(transaction.error);
  }));
}
export function localRecordings(owner) {
  return db().then(database=>new Promise((resolve,reject)=>{
    const transaction=database.transaction('recordings','readonly'),items=[];
    const request=transaction.objectStore('recordings').openCursor();
    request.onsuccess=()=>{const cursor=request.result;if(!cursor)return;if(String(cursor.key).startsWith(owner+':'))items.push(cursor.value);cursor.continue();};
    transaction.oncomplete=()=>resolve(items);
    transaction.onerror=()=>reject(transaction.error);
  }));
}
export async function saveRecording({owner,token,question,blob,rpc}) {
  if(blob.size>2097152)throw Error('錄音超過 2 MB，請縮短後再試。');
  const item={id:crypto.randomUUID(),owner,question,mime:blob.type.split(';')[0]||'audio/webm',blob,at:new Date().toISOString(),synced:false};
  let local=false;
  try{await cache(owner+':'+item.id,item);local=true;}catch{}
  try{await uploadRecording(item,token,rpc);return {item,synced:true};}
  catch(error){if(local)return {item,synced:false};throw error;}
}
export async function uploadRecording(item,token,rpc) {
  const audio=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(item.blob);});
  await rpc('synonyms_important_recording',{p_token:token,p_action:'save',p_payload:{id:item.id,question:item.question,mime:item.mime,audio}});
  item.synced=true;
  try{await cache(item.owner+':'+item.id,item);}catch{}
}
export async function allRecordings(owner,token,rpc) {
  const [local,remote]=await Promise.allSettled([localRecordings(owner),rpc('synonyms_important_recording',{p_token:token,p_action:'list',p_payload:{}})]);
  const merged=new Map();
  if(local.status==='fulfilled')for(const item of local.value)merged.set(item.id,item);
  if(remote.status==='fulfilled')for(const item of remote.value||[])merged.set(item.id,{...merged.get(item.id),...item,owner,synced:true});
  return {items:[...merged.values()].sort((a,b)=>String(b.at||'').localeCompare(String(a.at||''))),offline:remote.status==='rejected'};
}
export async function recordingBlob(item,token,rpc) {
  if(item.blob)return item.blob;
  const data=await rpc('synonyms_important_recording',{p_token:token,p_action:'get',p_payload:{id:item.id}});
  return new Blob([Uint8Array.from(atob(data.audio),character=>character.charCodeAt(0))],{type:data.mime});
}
export function mountRecorder(host,{owner,token,question,rpc,onClose}) {
  let alive=true,stream=null,recorder=null,timer=null,url=null;
  host.innerHTML='<div class="syn-recorder-panel"><div class="syn-recorder-top"><div><p class="syn-kicker">YOUR TURN · 錄音朗讀</p><h4>換你說一次</h4></div><button type="button" data-close-recorder aria-label="收起錄音面板">收起</button></div><p>看著原句朗讀。錄好後可重聽，也可在「我的錄音」查看。</p><div class="syn-recorder-actions"><button type="button" data-start-record><img class="syn-icon" src="/synonyms/icons/microphone.svg" alt="" aria-hidden="true">開始錄音</button><button type="button" data-stop-record hidden>停止錄音</button></div><audio controls hidden aria-label="我的錄音"></audio><p data-record-status role="status"></p></div>';
  const status=message=>{if(alive)host.querySelector('[data-record-status]').textContent=message;};
  const play=blob=>{if(!alive)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);const player=host.querySelector('audio');player.src=url;player.hidden=false;host.querySelector('[data-start-record]').textContent='重新錄音';};
  const stop=()=>{clearTimeout(timer);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(track=>track.stop());stream=null;};
  host.querySelector('[data-close-recorder]').onclick=()=>{stop();onClose();};
  host.querySelector('[data-stop-record]').onclick=stop;
  host.querySelector('[data-start-record]').onclick=async()=>{
    if(recorder?.state==='recording')return;
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('此瀏覽器暫不支援錄音。');return;}
    const start=host.querySelector('[data-start-record]');start.disabled=true;status('請允許使用麥克風…');
    try{
      stream=await navigator.mediaDevices.getUserMedia({audio:true});if(!alive){stream.getTracks().forEach(track=>track.stop());return;}
      const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
      recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:96000});
      const chunks=[];const began=Date.now();
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>{status('錄音未能完成，請重試。');stop();};
      recorder.onstop=async()=>{
        if(alive)host.querySelector('[data-stop-record]').hidden=true;start.disabled=false;
        const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
        if(!blob.size||Date.now()-began<600){status('錄音太短，請再試一次。');return;}
        play(blob);status('正在儲存錄音…');
        try{const saved=await saveRecording({owner,token,question,blob,rpc});status(saved.synced?'已儲存至學生帳戶。':'已保留在此裝置；請在「我的錄音」重試上傳。');}
        catch(error){status(error?.message||'未能儲存錄音，請重試。');}
      };
      recorder.start();host.querySelector('[data-stop-record]').hidden=false;status('正在錄音…最長 60 秒。');timer=setTimeout(stop,60000);
    }catch{status('未能使用麥克風。請檢查瀏覽器權限。');}finally{if(alive)start.disabled=false;}
  };
  void allRecordings(owner,token,rpc).then(({items})=>{const latest=items.find(item=>item.question===question);if(!latest||!alive)return;return recordingBlob(latest,token,rpc).then(blob=>{if(!alive)return;play(blob);status(latest.synced?'已有錄音，可重聽或重新錄音。':'錄音在此裝置，請到「我的錄音」重試上傳。');});}).catch(()=>{});
  return ()=>{alive=false;stop();host.querySelector('audio')?.pause();if(url)URL.revokeObjectURL(url);};
}
