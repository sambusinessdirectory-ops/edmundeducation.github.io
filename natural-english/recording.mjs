// Voice files stay on this device; only practice status is synced.
let dbPromise;
function db(){return dbPromise ||=new Promise((resolve,reject)=>{const r=indexedDB.open('edmund-natural-english-audio',1);r.onupgradeneeded=()=>r.result.createObjectStore('recordings');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function stored(key,value){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('recordings',value?'readwrite':'readonly'),r=value?t.objectStore('recordings').put(value,key):t.objectStore('recordings').get(key);t.oncomplete=()=>resolve(r.result);t.onerror=()=>reject(t.error);});}
export function mountRecorder(host,{key,onRecorded,onSkip}){
 let alive=true,recorder=null,stream=null,url=null,timer=null,pending=false;
 host.innerHTML='<p class="eyebrow">選做 · 錄音朗讀</p><h3>換你說一次</h3><p>看著上面的示範句朗讀，錄好後可以重聽、比較及重錄。不需要模仿特定口音。</p><div class="record-actions"><button data-record>🎙 開始錄音</button><button data-stop hidden>停止錄音</button><button data-skip>這次先跳過</button></div><audio controls hidden aria-label="我的錄音"></audio><p data-record-status role="status"></p><small>錄音最長 60 秒，只存於此裝置的瀏覽器，不會上傳。清除瀏覽器資料會移除錄音。錄過音不代表發音已被評為正確。</small>';
 const status=t=>{if(alive)host.querySelector('[data-record-status]').textContent=t;};
 function playBlob(blob){if(!alive||!blob)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);const a=host.querySelector('audio');a.src=url;a.hidden=false;}
 stored(key).then(playBlob).catch(()=>{});
 function stop(){clearTimeout(timer);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());stream=null;}
 host.querySelector('[data-record]').onclick=async()=>{
  if(pending||recorder?.state==='recording')return;
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('此瀏覽器暫不支援錄音。你可以先自行朗讀，或跳過這一步。');return;}
  pending=true;host.querySelector('[data-record]').disabled=true;status('請允許使用麥克風…');
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true});if(!alive){stream.getTracks().forEach(t=>t.stop());return;}
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);const chunks=[];let started=Date.now();
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>{status('錄音未能完成，請重試或跳過。');stop();};
   recorder.onstop=async()=>{if(!alive)return;host.querySelector('[data-stop]').hidden=true;host.querySelector('[data-record]').disabled=false;const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});if(!blob.size||Date.now()-started<600){status('錄音太短，請再試一次。');return;}playBlob(blob);onRecorded();status('✓ 已完成口說練習，可以播放或重新錄音。');try{await stored(key,blob);}catch{status('✓ 已錄好，可在本頁重聽；此瀏覽器未能保存錄音，離開後可能無法重聽。');}};
   recorder.start();host.querySelector('[data-stop]').hidden=false;status('正在錄音…讀完後按「停止錄音」。');timer=setTimeout(stop,60000);
  }catch{status('未能使用麥克風。請檢查瀏覽器權限，或按「這次先跳過」。');if(alive)host.querySelector('[data-record]').disabled=false;stream?.getTracks().forEach(t=>t.stop());}
  finally{pending=false;}
 };
 host.querySelector('[data-stop]').onclick=stop;
 host.querySelector('[data-skip]').onclick=()=>{stop();onSkip();status('已跳過，可以繼續。之後仍可回來練習。');};
 return()=>{alive=false;stop();if(url)URL.revokeObjectURL(url);host.querySelector('audio')?.pause();};
}
