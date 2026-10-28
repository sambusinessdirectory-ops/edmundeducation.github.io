import { WRITING_FUNCTIONS, normalizeFunctionHelper } from './writing-function-helper.mjs?v=20261028';
import { safeWritingPromptImage } from './writing-submission-core.js?v=20261028';
export function normalizeQuestionImages(value) {
  return (Array.isArray(value)?value:[]).slice(0,8).flatMap(image=>{
    const src=String(image?.src||'');
    return src.length<=1500000 && (/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(src)||safeWritingPromptImage(src)) ? [{src,alt:String(image?.alt||'題目圖片').slice(0,300)}] : [];
  });
}
export function combineQuestionImages(...groups) {
  const seen=new Set();
  return normalizeQuestionImages(groups.flat()).filter(image=>!seen.has(image.src)&&seen.add(image.src));
}
export function planningText(value) {
  const helper=normalizeFunctionHelper(value);
  return [helper.unassigned,...WRITING_FUNCTIONS.map(item=>helper.values[item.id]?.trim()?`${item.group} · ${item.title}\n${helper.values[item.id]}`:'')].filter(Boolean).join('\n\n');
}
export async function readQuestionImage(file) {
  if (file.size>30*1024*1024) throw Error('單張原圖請小於 30 MB。');
  const url=URL.createObjectURL(file);
  try {
    const image=new Image();image.src=url;await image.decode();
    if(!image.naturalWidth||!image.naturalHeight) throw Error('無法讀取圖片。');
    let size=Math.min(1,2400/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    for(let attempt=0;attempt<8;attempt++) {
      canvas.width=Math.max(1,Math.round(image.naturalWidth*size));canvas.height=Math.max(1,Math.round(image.naturalHeight*size));
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      const src=canvas.toDataURL('image/jpeg',0.9);
      if(src.length<=1500000) return {src,alt:file.name.slice(0,300)};
      size*=0.78;
    }
    throw Error('圖片過大，請先縮小再上載。');
  } catch(error) {throw Error(error.message==='圖片過大，請先縮小再上載。'?error.message:'無法讀取此圖片格式。請使用 PNG、JPG、WebP、GIF 或瀏覽器支援的圖片。');}
  finally {URL.revokeObjectURL(url);}
}
export function imageGallery(images) {
  const box=document.createElement('div');box.className='writing-question-images';
  for(const item of normalizeQuestionImages(images)){const img=document.createElement('img');img.src=item.src;img.alt=item.alt;box.append(img);}
  return box;
}
export function imageUploader({images=[],onChange}) {
  const box=document.createElement('section');box.className='writing-image-upload';
  const label=document.createElement('label');label.textContent='附加題目圖片 · PNG / JPG 或其他圖片（最多八張）';
  const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;label.append(input);
  const status=document.createElement('p');status.setAttribute('role','status');
  const preview=document.createElement('div');box.append(label,status,preview);
  let current=normalizeQuestionImages(images);
  const render=()=>{preview.replaceChildren();current.forEach((item,index)=>{const card=imageGallery([item]);const remove=document.createElement('button');remove.type='button';remove.textContent='移除此圖片';remove.onclick=async()=>{const next=current.filter((_,i)=>i!==index);await change(next);};card.append(remove);preview.append(card);});};
  async function change(next){input.disabled=true;box.querySelectorAll('button').forEach(b=>b.disabled=true);try{const warning=await onChange(next);current=next;status.textContent=warning || '圖片已加入目前題目。';render();}catch(e){status.textContent=e.message;}finally{input.disabled=false;box.querySelectorAll('button').forEach(b=>b.disabled=false);}}
  input.onchange=async()=>{box.dataset.processing='true';input.disabled=true;status.textContent='正在處理圖片…';try{if(current.length+input.files.length>8)throw Error('最多可加入八張圖片。');const additions=[];for(const file of input.files)additions.push(await readQuestionImage(file));await change([...current,...additions]);}catch(e){status.textContent=e.message;}finally{delete box.dataset.processing;input.disabled=false;input.value='';}};
  box.setImages=images=>{current=normalizeQuestionImages(images);render();};render();return box;
}
