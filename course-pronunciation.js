// Read-aloud practice only. A recorder may supply its own live audio track.
(() => {
 const stamp='/eddy-pronunciation-pass-mic.webp';
 function output(host,message,passed=false){
  if(!host?.isConnected)return;
  let node=[...host.children].find(x=>x.classList.contains('course-reading-result'));
  if(!node){node=document.createElement('span');node.className='course-reading-result';node.setAttribute('role','status');host.append(node);}
  node.replaceChildren();
  if(passed){const im=new Image(48,48);im.alt='';im.src=stamp;node.append(im);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)im.animate([{transform:'scale(1.4) rotate(-10deg)'},{transform:'scale(1)'}],{duration:280});}
  node.append(document.createTextNode(message));
 }
 function attachRecorder(recorder,text,host){
  if(!text?.trim()||!host)return;
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R){output(host,'錄音可繼續；瀏覽器未支援發音評分。');return;}
  const r=new R();let transcript='',failed=false;
  r.lang='en-US';r.continuous=true;r.interimResults=false;
  r.onresult=e=>{transcript=Array.from(e.results).filter(x=>x.isFinal).map(x=>x[0].transcript).join(' ');};
  r.onerror=()=>{failed=true;};
  r.onend=()=>{const ok=!failed&&transcript.trim();const pass=ok&&window.EdmundPronunciation?.analyseNaturalTextMatch(text,transcript).passed;output(host,!ok?'未能評分 · Not scored':pass?'通過 · Passed':'請再試 · Try again',!!pass);};
  try{r.start(recorder.stream.getAudioTracks()[0]);recorder.addEventListener('stop',()=>{try{r.stop();}catch{}},{once:true});}catch{output(host,'未能評分 · Not scored');}
 }
 const selectors='.sentence[lang=en],.syn-original p[lang=en],.syn-word-card h4,.model .model-sentence:not(.speaking-cloze),[data-edmund-voice-kind],.part1-answer-message .part1-message-en,.part3-step-en,.response-en';
 function expected(el){if(el.dataset.edmundVoiceKind){const c=el.closest('[data-edmund-prompt-text]');return c?.dataset[el.dataset.edmundVoiceKind==='answer'?'edmundAnswerText':'edmundPromptText']||'';}return el.textContent.trim();}
 function enhance(){
 const select=document.querySelector('[data-reading-model]');
 if(select){const lines=[...document.querySelectorAll('.part1-answer-message .part1-message-en,.part3-step-en,.response-en')];if(lines.length && select.dataset.signature!==JSON.stringify(lines.map(l=>l.textContent))){select.dataset.signature=JSON.stringify(lines.map(l=>l.textContent));select.replaceChildren();for(const [i,l] of lines.entries())select.add(new Option((i+1)+'. '+l.textContent.trim().slice(0,75),l.textContent.trim()));select.parentElement.hidden=false;}}
 for(const el of document.querySelectorAll(selectors)){
  if(location.pathname.endsWith('/speaking-system.html')&&!select)continue;
  if(el.nextElementSibling?.classList.contains('course-reading-check')||!expected(el)||el.hidden||el.closest('[hidden]'))continue;
  const wrap=document.createElement('span');wrap.className='course-reading-check';const btn=document.createElement('button');btn.type='button';btn.textContent='發音檢查';wrap.append(btn);el.after(wrap);
  btn.onclick=async()=>{const target=expected(el);btn.disabled=true;output(wrap,'請朗讀 · Speak now');try{const r=await window.EdmundPronunciation.recognizeAndCompare({expectedText:target,maxSeconds:Math.min(180,Math.max(12,target.split(/\s+/).length*1.4))});if(expected(el)===target)output(wrap,r.passed?'通過 · Passed':r.scored?'請再試 · Try again':'未能評分 · Not scored',r.passed);}catch{output(wrap,'未能評分 · Not scored');}finally{btn.disabled=false;}};
 }}
 window.CourseReading={attachRecorder};let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance();});}}).observe(document.body,{childList:true,subtree:true});enhance();
})();
