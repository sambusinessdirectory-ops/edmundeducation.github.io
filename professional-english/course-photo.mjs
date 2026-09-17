import {rpc,session} from './learning-state.mjs?v=20260916-ui-polish1';
import {escapeHtml as esc} from './library-core.mjs?v=20260916-ui-polish1';
export async function compressPhoto(file){
 if(!file||!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)||file.size>20*1024*1024)throw Error('請選擇 20 MB 以下的照片（JPEG、PNG 或 WebP）。');
 const url=URL.createObjectURL(file),image=new Image();
 try{image.src=url;await image.decode();const scale=Math.min(1,1000/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);for(const quality of [.86,.72,.56,.4]){let data=canvas.toDataURL('image/webp',quality);if(!data.startsWith('data:image/webp;')){const {default:encode}=await import('./vendor/webp/encode.js');const bytes=new Uint8Array(await encode(ctx.getImageData(0,0,canvas.width,canvas.height),{quality:quality*100}));let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);data='data:image/webp;base64,'+btoa(binary);}if(data.length<=500000)return data;}throw Error('照片太大，請選擇較小的照片。');}catch(error){if(error.name==='EncodingError')throw Error('未能讀取照片，請另存為 JPEG 或 PNG 後再試。');throw error;}finally{URL.revokeObjectURL(url);}
}
function mountPhotoSlot(host,owner,preferredCourse='',slot='right'){
 let active=true,courses=[],selected='',revision=-1,currentImage=null,busy=false,uploading=false,preview=null;
 const owns=()=>active&&session()?.token===owner.token&&session()?.user?.id===owner.user.id;
 host.className='course-photo-slot';host.dataset.photoSlot=slot;host.hidden=true;
 const notice=text=>{const n=host.querySelector('[data-photo-status]');if(n)n.textContent=text;};
 function render(canEdit){
  if(!owns())return;host.hidden=!canEdit&&!currentImage&&courses.length<2;host.innerHTML=`${courses.length>1?`<label class="course-photo-course">課程照片<select data-photo-course>${courses.map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.title.replaceAll('_',' '))}</option>`).join('')}</select></label>`:''}<div class="course-photo-frame">${currentImage?`<button type="button" data-photo-view aria-label="放大課程照片"><img src="${currentImage}" alt="課程分享照片"></button>`:'<span class="course-photo-empty">課程照片<br><small>Course photo</small></span>'}</div>${canEdit?`<div class="course-photo-edit"><button type="button" data-photo-upload>${currentImage?'更換照片':'加入照片'}</button>${currentImage?'<button type="button" data-photo-remove>移除</button>':''}<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-photo-file hidden></div>`:''}<p data-photo-status role="status"></p>`;
 }
 async function refresh(){if(!owns()||busy||uploading||document.hidden||!selected)return;busy=true;const id=selected;try{const row=await rpc('course_photo_slot',{p_course:id,p_slot:slot,p_revision:revision},owner);if(!owns()||id!==selected)return;if(row.changed||revision<0){currentImage=row.image||null;revision=row.revision;render(row.can_edit);}}catch(error){if(owns()){host.hidden=false;if(!host.querySelector('[data-photo-status]'))host.innerHTML='<p data-photo-status role="status"></p><button type="button" data-photo-retry>重試照片</button>';notice(error.message);}}finally{busy=false;}}
 function closePreview(){preview?.close();preview?.remove();preview=null;}
 host.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b||!owns())return;
  if(b.matches('[data-photo-upload]'))host.querySelector('[data-photo-file]').click();
  else if(b.matches('[data-photo-retry]'))void initialise();
  else if(b.matches('[data-photo-view]')&&currentImage){closePreview();preview=document.createElement('dialog');preview.className='course-photo-preview';preview.innerHTML=`<button type="button" aria-label="關閉照片">關閉 · Close</button><img src="${currentImage}" alt="課程分享照片">`;preview.querySelector('button').onclick=closePreview;preview.addEventListener('click',e=>{if(e.target===preview)closePreview();});document.body.append(preview);preview.showModal();}
  else if(b.matches('[data-photo-remove]')&&!uploading&&confirm('移除這張課程照片？同課程的學生將不再看到它。')){await publish(null);}
 });
 async function publish(image){if(!owns()||uploading)return;uploading=true;const id=selected;host.querySelectorAll('button,select').forEach(b=>b.disabled=true);notice('正在更新課程照片…');try{const row=await rpc('course_photo_slot',{p_course:id,p_slot:slot,p_action:image?'save':'remove',p_image:image,p_revision:revision},owner);if(!owns()||selected!==id)return;currentImage=row.image||null;revision=row.revision;render(row.can_edit);notice('已更新，同課程的學生可看到。');}catch(error){if(owns()){notice(error.message+' 照片未更新，請重新整理後再試。');}}finally{uploading=false;if(owns())host.querySelectorAll('button,select').forEach(b=>b.disabled=false);}}
 host.addEventListener('change',async event=>{
  if(!owns())return;
  if(event.target.matches('[data-photo-course]')){selected=event.target.value;revision=-1;currentImage=null;render(courses.find(c=>c.id===selected)?.can_edit);void refresh();}
  if(event.target.matches('[data-photo-file]')){const file=event.target.files[0];if(!file)return;const id=selected;notice('正在處理照片…');event.target.value='';try{const image=await compressPhoto(file);if(owns()&&selected===id)await publish(image);}catch(error){notice(error.message);}}
 });
 async function initialise(){try{const result=await rpc('course_photo_slot',{p_slot:slot},owner);if(!owns())return;courses=result.courses||[];selected=courses.find(c=>c.id===preferredCourse)?.id||courses[0]?.id||'';if(!selected)return;render(courses.find(c=>c.id===selected)?.can_edit);await refresh();}catch{if(owns()){host.hidden=false;host.innerHTML='<p data-photo-status>課程照片暫時未能載入。</p><button type="button" data-photo-retry>重試</button>';}}}
 void initialise();const timer=setInterval(refresh,15000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
 return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);closePreview();};
}

export function mountCoursePhoto(host,owner,preferredCourse=''){
 host.className='course-photo-group';
 const cleanups=['left','right'].map(slot=>{const child=document.createElement('div');host.append(child);return mountPhotoSlot(child,owner,preferredCourse,slot);});
 return()=>{cleanups.forEach(cleanup=>cleanup());host.replaceChildren();};
}
