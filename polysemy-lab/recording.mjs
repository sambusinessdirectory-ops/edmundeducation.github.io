// Device cache protects recordings while their account upload is pending.
let dbPromise;
function db(){return dbPromise ||=new Promise((resolve,reject)=>{const r=indexedDB.open('edmund-polysemy-lab-audio',1);r.onupgradeneeded=()=>r.result.createObjectStore('recordings');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function stored(key,value){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('recordings',value?'readwrite':'readonly'),r=value?t.objectStore('recordings').put(value,key):t.objectStore('recordings').get(key);t.oncomplete=()=>resolve(r.result);t.onerror=()=>reject(t.error||new Error('Device cache failed'));t.onabort=()=>reject(t.error||new Error('Device cache aborted'));});}
export function mountRecorder(host,{key,companion,loadRecording,onRecorded,onSkip}){
 let alive=true,recorder=null,stream=null,url=null,timer=null,pending=false;
 host.classList.remove('has-recording');
 try{host.classList.toggle('has-recording',localStorage.getItem('edmund-polysemy-recorded:'+key)==='1');}catch{}
 const portrait=companion&&companion!=='eddy' ? `<span class="recorder-eddy companion-recorder-art" role="img" aria-label="${companion} 準備麥克風錄音"></span>` : '<img class="recorder-eddy" src="/assets/polysemy-lab/eddy-recording-microphone-exact-v7.png" alt="Eddie 戴著耳機，邀請你拿起麥克風朗讀">';
 host.innerHTML='<button class="recorder-close" data-close-recorder aria-label="收起錄音面板 · Close recording panel">✕ 收起</button>'+portrait+'<p class="eyebrow">選做 · 錄音朗讀</p><h3>換你說一次</h3><p>看著上面的示範句朗讀，錄好後可以重聽、比較及重錄。不需要模仿特定口音。</p><div class="record-actions"><button data-record>開始錄音</button><button data-stop hidden>停止錄音</button><button data-skip>這次先跳過</button></div><audio controls hidden aria-label="我的錄音"></audio><p data-record-status role="status"></p><small>錄音最長 60 秒，會儲存至你的學生帳戶，可從頁首「我的錄音」重聽。離線時先保留在此裝置，請稍後重試上傳。錄過音不代表發音已被評為正確。</small>';
 const stars=document.createElement('span');stars.className='recorder-stardust';stars.setAttribute('aria-hidden','true');stars.innerHTML=Array.from({length:24},(_,i)=>`<i style="--star-x:${(i*37+13)%100}%;--star-y:${(i*29+7)%100}%;--star-delay:${-(i%9)*.63}s"></i>`).join('');host.prepend(stars);
 const status=t=>{if(alive)host.querySelector('[data-record-status]').textContent=t;};
 function playBlob(blob){if(!alive||!blob)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);const a=host.querySelector('audio');a.src=url;a.hidden=false;const mascot=host.querySelector('.recorder-eddy');mascot.src='/assets/polysemy-lab/eddy-recording-audio-exact-v6.png';mascot.alt='Eddy 開心地捧著你錄好的音訊';host.classList.add('has-recording');}
 
 // Restore the latest recording for this student and question on every reopen.
 let recordingStarted=false;
 Promise.resolve().then(()=>loadRecording?.()).then(item=>{
  if(!alive||recordingStarted||!item?.blob)return;
  playBlob(item.blob);
  status(item.synced?'✓ 已保存，可重聽或選擇重錄。':'✓ 已保留在此裝置，可重聽；請到「我的錄音」重試上傳。');
  host.querySelector('[data-record]').textContent='重新錄音';
 }).catch(()=>{if(alive&&!recordingStarted&&host.classList.contains('has-recording'))status('此題已錄過音；暫未能載入播放，請稍後重開或到「我的錄音」重試。');});
 function stop(){clearTimeout(timer);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;}
 host.querySelector('[data-record]').onclick=async()=>{
  if(pending||recorder?.state==='recording')return;
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('此瀏覽器暫不支援錄音。你可以先自行朗讀，或跳過這一步。');return;}
  recordingStarted=true;pending=true;host.querySelector('[data-record]').disabled=true;status('請允許使用麥克風…');
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true});if(!alive){stream.getTracks().forEach(t=>t.stop());return;}
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:96000});const chunks=[];let started=Date.now();
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>{status('錄音未能完成，請重試或跳過。');stop();};
   recorder.onstop=async()=>{if(!alive)return;host.querySelector('[data-stop]').hidden=true;host.querySelector('[data-record]').disabled=false;const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});if(!blob.size||Date.now()-started<600){status('錄音太短，請再試一次。');return;}playBlob(blob);status('正在保存錄音…');try{const synced=await onRecorded(blob);status(synced===false?'已保留在此裝置；請到「我的錄音」重試上傳。':'✓ 已保存，可從「我的錄音」重聽。');}catch{status('✓ 已錄好，可在本頁重聽；此瀏覽器未能保存錄音，離開後可能無法重聽。');}};
   recorder.start();host.querySelector('[data-stop]').hidden=false;status('正在錄音…讀完後按「停止錄音」。');timer=setTimeout(stop,60000);
  }catch{status('未能使用麥克風。請檢查瀏覽器權限，或按「這次先跳過」。');if(alive)host.querySelector('[data-record]').disabled=false;stream?.getTracks().forEach(t=>t.stop());}
  finally{pending=false;}
 };
 host.querySelector('[data-stop]').onclick=stop;
 host.querySelector('[data-close-recorder]').onclick=()=>{stop();onSkip();};
 host.onclick=e=>{if(e.target===host){stop();onSkip();}};
 host.querySelector('[data-skip]').onclick=()=>{stop();onSkip();status('已跳過，可以繼續。之後仍可回來練習。');};
 return()=>{alive=false;stop();if(url)URL.revokeObjectURL(url);host.querySelector('audio')?.pause();};
}
export async function storeRecording(item){const {blob,...meta}=item;await stored(item.owner+':record:'+item.id,{...meta,mime:blob.type,bytes:await blob.arrayBuffer()});}
export async function listRecordings(owner){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('recordings','readonly'),rows=[],r=tx.objectStore('recordings').openCursor();r.onsuccess=()=>{const c=r.result;if(!c)return;const k=String(c.key);if(k.startsWith(owner+':')){if(c.value?.id)rows.push(c.value.bytes?{...c.value,blob:new Blob([c.value.bytes],{type:c.value.mime})}:c.value);else if(c.value instanceof Blob){const parts=k.split(':');rows.push({id:null,owner,run:parts[1],slot:parts[2],blob:c.value,legacy:true,at:null});}}c.continue();};tx.oncomplete=()=>resolve(rows);tx.onerror=()=>reject(tx.error);});}
