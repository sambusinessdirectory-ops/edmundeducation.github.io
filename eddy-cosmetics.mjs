// Account-scoped equipment shared by the 2D maps and 3D standing characters.
export const COSMETICS=Object.freeze([
 {id:'white-fedora',slot:'headwear',price:15,name:'White fedora',description:'白色 Fedora 帽'},
 {id:'cream-cable-knit',slot:'top',price:25,name:'Cream cable-knit crewneck',description:'奶油色麻花針織毛衣'},
 {id:'charcoal-turtleneck',slot:'top',price:25,name:'Charcoal gray turtleneck',description:'炭灰色高領毛衣'},
 {id:'blue-swordsman-jacket',slot:'top',price:35,name:'Blue swordsman jacket',description:'藍色劍士外套 · 銀色飾邊'},
 {id:'brown-leather-bomber',slot:'top',price:35,name:'Brown leather bomber jacket',description:'棕色皮革飛行外套 · 拉鍊與翻蓋口袋'},
 {id:'sunburst-hoodie',slot:'top',price:30,name:'Charcoal sunburst hoodie',description:'炭黑連帽衫 · 背面太陽圖案'},
 {id:'black-blazer-hoodie',slot:'top',price:35,name:'Black blazer over hoodie',description:'黑色雙排扣西裝外套 · 連帽衫內搭'},
 {id:'olive-plain-tee',slot:'top',price:20,name:'Olive plain crew-neck T-shirt',description:'橄欖綠純色圓領短袖T恤',display:'eddy/olive-plain-tee-display.png'},
 {id:'cream-sherpa-jacket',slot:'girlsTop',group:'girls',price:35,name:'Cream sherpa jacket',description:'奶油色羊羔絨拉鍊外套',display:'girls/cream-sherpa-display.png'},
 {id:'pink-rain-jacket',slot:'girlsTop',group:'girls',price:35,name:'Pink-piped rain jacket',description:'炭黑色連帽雨衣 · 桃紅色滾邊',display:'girls/pink-rain-jacket-display.png'}
]);
const GIRLS=Object.freeze(['celeste','phoebe','elsie']);
const equipmentSlot=(item,character)=>item.group==='girls'?character+'Top':item.slot;
export function cleanEquipment(value){
 const result=Object.fromEntries(COSMETICS.filter(item=>item.group!=='girls'&&value?.[item.slot]===item.id).map(item=>[item.slot,item.id]));
 for(const character of GIRLS){const slot=character+'Top',id=value?.[slot]??value?.girlsTop;if(COSMETICS.some(item=>item.group==='girls'&&item.id===id))result[slot]=id;}
 return result;
}
export function cleanWardrobe(value){
 const outfits=[],counts=new Map();
 for(const x of (Array.isArray(value?.outfits)?value.outfits:[]).slice(0,200)){
  if(typeof x?.name!=='string'||!x.name.trim())continue;
  const characters=x.group==='girls'?(x.character===undefined?GIRLS:GIRLS.includes(x.character)?[x.character]:[]):[null];
  for(const character of characters){
   const count=counts.get(character)||0;if(count>=50)continue;counts.set(character,count+1);
   const cleaned=cleanEquipment(x.equipped),selected=character?Object.fromEntries(Object.entries(cleaned).filter(([slot])=>slot===character+'Top')):Object.fromEntries(Object.entries(cleaned).filter(([slot])=>slot==='top'||slot==='headwear'));
   outfits.push({name:x.name.trim().slice(0,60),equipped:selected,...(x.favorite===true?{favorite:true}:{}),...(character?{group:'girls',character}:{})});
  }
 }
 return {equipped:cleanEquipment(value?.equipped),outfits:outfits.slice(0,200)};
}
export const COSMETIC_CHARACTERS=Object.freeze(['eddy','noir','celeste','phoebe','elsie']);
export const supportsCosmetics=id=>COSMETIC_CHARACTERS.includes(id);
export const wardrobeGroup=id=>GIRLS.includes(id)?'girls':'boys';
export const cosmeticsForCharacter=id=>supportsCosmetics(id)?COSMETICS.filter(item=>(item.group||'boys')===wardrobeGroup(id)):[];
const groupEquipment=(value,character)=>Object.fromEntries(cosmeticsForCharacter(character).filter(item=>value[equipmentSlot(item,character)]===item.id).map(item=>[equipmentSlot(item,character),item.id]));
const sameGroup=(outfit,character)=>wardrobeGroup(character)==='girls'?outfit.character===character:outfit.group!=='girls';
export const outfitsForCharacter=(outfits,character)=>outfits.filter(outfit=>sameGroup(outfit,character));
export const isCosmeticEquipped=(value,item,character)=>value[equipmentSlot(item,character)]===item.id;
export const cosmeticAsset=(id,character='eddy')=>new URL('./assets/speaking-system/cosmetics/'+(supportsCosmetics(character)?character:'eddy')+'/'+id+'.webp?v=20260923-coin-cosmetics1',import.meta.url).href;
let owner='',token='',wardrobe=cleanWardrobe(),equipped={},ownedCosmetics=new Set(),revision=0,client,connection,pendingRestore,previewActive=false,lastSync=0,saveEpoch=0,saving=0;
const listeners=new Set(),images=new Map(),atlases=new Map();
const correctedAtlases=new WeakMap();
function closeInterlegWhiteMarks(character,base){
 if(!['eddy','noir'].includes(character)||base?.naturalWidth!==1024||base?.naturalHeight!==1024||typeof document==='undefined')return base;
 if(correctedAtlases.has(base))return correctedAtlases.get(base);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return base;
 ctx.drawImage(base,0,0);const image=ctx.getImageData(0,0,1024,1024),pixels=image.data;
 const pale=(r,g,b,a)=>a>=96&&Math.min(r,g,b)>145&&Math.max(r,g,b)-Math.min(r,g,b)<85;
 let changed=false;
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const x0=col*256+88,y0=row*256+188,w=80,h=58,seen=new Uint8Array(w*h),mask=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=((y0+y)*1024+x0+x)*4;mask[y*w+x]=pale(pixels[p],pixels[p+1],pixels[p+2],pixels[p+3])?1:0;}
  for(let sy=0;sy<h;sy++)for(let sx=0;sx<w;sx++){
   const start=sy*w+sx;if(!mask[start]||seen[start])continue;
   const queue=[start],component=[];seen[start]=1;
   for(let head=0;head<queue.length;head++){
    const at=queue[head],y=Math.floor(at/w),x=at%w;component.push([x,y]);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     const nx=x+dx,ny=y+dy,n=ny*w+nx;
     if((dx||dy)&&nx>=0&&nx<w&&ny>=0&&ny<h&&mask[n]&&!seen[n]){seen[n]=1;queue.push(n);}
    }
   }
   const xs=component.map(p=>p[0]),ys=component.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
   if(component.length<14||maxX-minX>7||maxY-minY<7)continue;
   const byRow=new Map();for(const [x,y] of component){if(!byRow.has(y))byRow.set(y,[]);byRow.get(y).push(x);}
   for(const [y,rowXs] of byRow){
    const leftXs=[],rightXs=[];
    for(let d=1;d<=8;d++){
     const lx=x0+Math.min(...rowXs)-d,rx=x0+Math.max(...rowXs)+d,py=(y0+y)*1024;
     if(lx>=x0&&pixels[(py+lx)*4+3]>=96&&!pale(pixels[(py+lx)*4],pixels[(py+lx)*4+1],pixels[(py+lx)*4+2],pixels[(py+lx)*4+3]))leftXs.push(lx);
     if(rx<x0+w&&pixels[(py+rx)*4+3]>=96&&!pale(pixels[(py+rx)*4],pixels[(py+rx)*4+1],pixels[(py+rx)*4+2],pixels[(py+rx)*4+3]))rightXs.push(rx);
     if(leftXs.length&&rightXs.length)break;
    }
    if(!leftXs.length||!rightXs.length)continue;
    const l=leftXs[0],r=rightXs[0],lp=(y0+y)*1024+l,rp=(y0+y)*1024+r;
    const lc=[pixels[lp*4],pixels[lp*4+1],pixels[lp*4+2]],rc=[pixels[rp*4],pixels[rp*4+1],pixels[rp*4+2]],lo=Math.min(...rowXs),hi=Math.max(...rowXs);
    for(const x of rowXs){const t=(x-lo+1)/(hi-lo+2),p=((y0+y)*1024+x0+x)*4;for(let k=0;k<3;k++)pixels[p+k]=Math.round(lc[k]*(1-t)+rc[k]*t);pixels[p+3]=255;changed=true;}
   }
  }
 }
 if(!changed){correctedAtlases.set(base,base);return base;}
 ctx.putImageData(image,0,0);canvas.naturalWidth=canvas.width;canvas.naturalHeight=canvas.height;canvas.complete=true;
 correctedAtlases.set(base,canvas);return canvas;
}
const session=()=>globalThis.window?.EdmundSystemNav?.getStudentSession?.();
const key=id=>'edmund-eddy-wardrobe-v1:'+id;
const notify=()=>{revision++;atlases.clear();for(const fn of listeners)fn();};
export function subscribeCosmetics(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function cosmeticsState(){return {owner,equipped:{...equipped},savedEquipment:{...wardrobe.equipped},owned:[...ownedCosmetics],previewActive,dirty:hasUnsavedCosmetics(),saving:saving>0,outfits:wardrobe.outfits.map(x=>({...x,equipped:{...x.equipped}})),revision};}
export function hasUnsavedCosmetics(){return ['headwear','top',...GIRLS.map(c=>c+'Top')].some(slot=>equipped[slot]!==wardrobe.equipped[slot]);}
export function beginCosmeticsPreview(){equipped={...wardrobe.equipped};previewActive=true;notify();}
export function discardCosmeticsPreview(){equipped={...wardrobe.equipped};previewActive=false;notify();}
export const UNSAVED_OUTFIT_MESSAGE='You have unsaved outfit changes. Leave without saving? These changes will be discarded, and your previously saved avatar will remain unchanged across all systems. Choose Cancel to stay and save.\n\n造型尚未儲存。確定離開？未儲存的更改將會放棄，所有系統仍使用原先儲存的造型。選擇「取消」可返回儲存。';
export function confirmDiscardCosmetics(){if(saving)return false;if(previewActive&&hasUnsavedCosmetics()&&!window.confirm(UNSAVED_OUTFIT_MESSAGE))return false;discardCosmeticsPreview();return true;}
export function equipCosmetic(id,character='eddy'){const item=cosmeticsForCharacter(character).find(x=>x.id===id);if(!item||!ownedCosmetics.has(id))return;const slot=equipmentSlot(item,character);equipped={...equipped};if(equipped[slot]===id)delete equipped[slot];else equipped[slot]=id;notify();}
export function clearCosmetics(character='eddy'){equipped={...equipped};for(const item of cosmeticsForCharacter(character))delete equipped[equipmentSlot(item,character)];notify();}
export function equipOutfit(name,character='eddy'){const outfit=wardrobe.outfits.find(x=>x.name===name&&sameGroup(x,character));if(outfit){equipped={...equipped};for(const item of cosmeticsForCharacter(character))delete equipped[equipmentSlot(item,character)];Object.assign(equipped,groupEquipment(outfit.equipped,character));notify();}}
async function rpcRaw(args,method='eddy_closet_sync'){
 const config=globalThis.window?.EDMUND_SUPABASE;
 if(!config?.url||!window.supabase?.createClient)throw Error('Account saving is unavailable. Please reload and try again.');
 client ||= window.supabase.createClient(config.url,config.anonKey,{auth:{storageKey:'edmund-closet-auth-v1',storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 connection ||= (async()=>{const current=await client.auth.getSession();if(current.error)throw current.error;if(!current.data?.session){const login=await client.auth.signInAnonymously();if(login.error)throw login.error;}})().catch(e=>{connection=null;throw e;});
 await connection;const {data,error}=await client.rpc(method,args);if(error)throw error;return data;
}
async function rpc(args,method='eddy_closet_sync'){return cleanWardrobe(await rpcRaw(args,method));}

export function restoreCosmetics(fallbackOwner,{force=false}={}){
 const shared=session(),normalize=value=>String(value||'').replace(/^id:/,'');
 // A portal preference key is not an account identity. The shared login owns the avatar.
 const next=normalize(shared?.id)||normalize(fallbackOwner??owner);
 const nextToken=normalize(shared?.id)===next?String(shared?.token||''):'';
 const changed=owner!==next||token!==nextToken;
 if(changed){owner=next;token=nextToken;pendingRestore=null;lastSync=0;saveEpoch++;wardrobe=cleanWardrobe();previewActive=false;
  try{if(owner)wardrobe=cleanWardrobe(JSON.parse(localStorage.getItem(key(owner))||'null'));}catch{}
  equipped={...wardrobe.equipped};notify();
 }
 if(!owner||!token||saving)return Promise.resolve();
 if(pendingRestore)return pendingRestore;
 if(!force&&lastSync&&Date.now()-lastSync<30000)return Promise.resolve();
 const requestOwner=owner,requestToken=token,epoch=saveEpoch;
 const request=rpc({p_token:requestToken}).then(async result=>{
  if(owner!==requestOwner||token!==requestToken||epoch!==saveEpoch)return;
  const keepDraft=hasUnsavedCosmetics();wardrobe=result;if(!keepDraft)equipped={...result.equipped};ownedCosmetics=new Set(await rpcRaw({p_token:requestToken},'eddie_farm_owned_cosmetics').catch(()=>[]));lastSync=Date.now();
  try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}notify();
 }).catch(()=>{/* Keep saved cache; a later focus/restore retries. Explicit Save reports errors. */})
 .finally(()=>{if(pendingRestore===request)pendingRestore=null;});
 pendingRestore=request;return request;
}
export async function saveAvatar(name,character='eddy'){
 if(!owner||!token)throw Error('Please sign in to save your avatar.');
 const requestOwner=owner,requestToken=token;saving++;
 try {
 if(pendingRestore)await pendingRestore;
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 const requestRevision=revision;saveEpoch++;
 const outfits=wardrobe.outfits.map(x=>({...x}));
 if(name!==undefined){name=String(name).trim();if(!name||name.length>60)throw Error('Use an outfit name from 1 to 60 characters.');const i=outfits.findIndex(x=>x.name===name&&sameGroup(x,character));const item={name,equipped:groupEquipment(equipped,character),...(wardrobeGroup(character)==='girls'?{group:'girls',character}:{}),...(i>=0&&outfits[i].favorite?{favorite:true}:{})};if(i>=0)outfits[i]=item;else {if(outfitsForCharacter(outfits,character).length>=50)throw Error('You can save up to 50 outfits for this character.');outfits.push(item);}}
 const result=await rpc({p_token:requestToken,p_character:wardrobeGroup(character)==='girls'?character:'boys',p_equipped:groupEquipment(equipped,character),p_outfits:outfitsForCharacter(outfits,character)},'character_closet_sync');
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=result;try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}
 if(revision===requestRevision)equipped={...result.equipped};notify();return result;
 }finally{saving--;}
}
export async function toggleOutfitFavorite(name,character='eddy'){
 if(!owner||!token)throw Error('Please sign in to save favorites.');
 const requestOwner=owner,requestToken=token;saveEpoch++;saving++;
 try {
 const outfits=wardrobe.outfits.map(x=>x.name===name&&sameGroup(x,character)?{...x,favorite:!x.favorite}:{...x});
 const result=await rpc({p_token:requestToken,p_character:wardrobeGroup(character)==='girls'?character:'boys',p_outfits:outfitsForCharacter(outfits,character)},'character_closet_sync');
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=result;try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}notify();return result;
 }finally{saving--;}
}
function load(id,character='eddy'){const key=character+':'+id;if(images.has(key))return images.get(key);const img=new Image();images.set(key,img);img.onload=()=>{atlases.clear();for(const fn of listeners)fn();};img.src=cosmeticAsset(id,character);return img;}
// One composite per equipment/base combination, never one per animation frame.
export function cosmeticAtlas(id,base,{preview=false,wardrobe:wardrobeOverride=null}={}){
 const selected=groupEquipment(wardrobeOverride|| (preview?equipped:wardrobe.equipped),id);
 const rendered=wardrobeGroup(id)==='girls'?{...(selected[id+'Top']?{top:selected[id+'Top']}:{})}:selected;
 if(!supportsCosmetics(id)||!base?.naturalWidth)return base;
 const cacheKey=id+'|'+base.src+'|'+JSON.stringify(rendered);if(atlases.has(cacheKey))return atlases.get(cacheKey);
 const corrected=closeInterlegWhiteMarks(id,base);
 const ids=[rendered.top,rendered.headwear,rendered.headwear&&'hat-hide'].filter(Boolean);
 if(ids.map(item=>load(item,id)).some(img=>!img.complete||!img.naturalWidth))return corrected;
 if(!ids.length){atlases.set(cacheKey,corrected);return corrected;}
 const canvas=document.createElement('canvas');canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;
 const ctx=canvas.getContext('2d');ctx.drawImage(corrected,0,0);
 // Tailored overlays already follow the neck, cuffs and tail cutouts.
 if(rendered.top)ctx.drawImage(load(rendered.top,id),0,0,canvas.width,canvas.height);
 if(rendered.headwear){ctx.globalCompositeOperation='destination-out';ctx.drawImage(load('hat-hide',id),0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';ctx.drawImage(load(rendered.headwear,id),0,0,canvas.width,canvas.height);}
 canvas.naturalWidth=canvas.width;canvas.naturalHeight=canvas.height;canvas.complete=true;
 atlases.set(cacheKey,canvas);return canvas;
}
if(typeof window!=='undefined'){
 window.addEventListener('storage',e=>{if(owner&&e.key===key(owner)){try{const keepDraft=previewActive&&hasUnsavedCosmetics();wardrobe=cleanWardrobe(JSON.parse(e.newValue));if(!keepDraft)equipped={...wardrobe.equipped};saveEpoch++;notify();}catch{}}});
 window.addEventListener('edmund-student-session-change',()=>{if(!session()?.id){owner='';token='';wardrobe=cleanWardrobe();equipped={};previewActive=false;saveEpoch++;notify();}void restoreCosmetics();});
 window.addEventListener('focus',()=>{void restoreCosmetics(undefined,{force:true});});
 window.addEventListener('pageshow',()=>{void restoreCosmetics(undefined,{force:true});});
 window.addEventListener('beforeunload',event=>{if(previewActive&&hasUnsavedCosmetics()){event.preventDefault();event.returnValue='';}});
 window.addEventListener('pagehide',discardCosmeticsPreview);
}
