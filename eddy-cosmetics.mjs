// Account-owned clothes with independent saved equipment and outfits per character.
export const COSMETICS=Object.freeze([
 {id:'white-fedora',slot:'headwear',price:15,name:'White fedora',description:'白色 Fedora 帽',hide:'hat-hide'},
 {id:'ivory-botanical-cap',slot:'headwear',group:'all',price:15,name:'Ivory botanical baseball cap',description:'象牙白棉質棒球帽 · 橄欖綠植物刺繡',display:'shared/ivory-botanical-cap-display.png',hide:'ivory-botanical-cap-hide'},
 {id:'cream-cable-knit',slot:'top',price:25,name:'Cream cable-knit crewneck',description:'奶油色麻花針織毛衣'},
 {id:'charcoal-turtleneck',slot:'top',price:25,name:'Charcoal gray turtleneck',description:'炭灰色高領毛衣'},
 {id:'blue-swordsman-jacket',slot:'top',price:35,name:'Blue swordsman jacket',description:'藍色劍士外套 · 銀色飾邊'},
 {id:'brown-leather-bomber',slot:'top',price:35,name:'Brown leather bomber jacket',description:'棕色皮革飛行外套 · 拉鍊與翻蓋口袋'},
 {id:'sunburst-hoodie',slot:'top',price:30,name:'Charcoal sunburst hoodie',description:'炭黑連帽衫 · 背面太陽圖案'},
 {id:'black-blazer-hoodie',slot:'top',price:35,name:'Black blazer over hoodie',description:'黑色雙排扣西裝外套 · 連帽衫內搭'},
 {id:'olive-plain-tee',slot:'top',price:20,name:'Olive plain crew-neck T-shirt',description:'橄欖綠純色圓領短袖T恤',display:'eddy/olive-plain-tee-display.png'},
 {id:'cream-sherpa-jacket',slot:'girlsTop',group:'girls',price:35,name:'Cream sherpa jacket',description:'奶油色羊羔絨拉鍊外套',display:'girls/cream-sherpa-display.png'},
 {id:'pink-rain-jacket',slot:'girlsTop',group:'girls',price:35,name:'Pink-piped rain jacket',description:'炭黑色連帽雨衣 · 桃紅色滾邊',display:'girls/pink-rain-jacket-display.png'},
 {id:'navy-cream-knit-vest',slot:'girlsTop',group:'girls',price:30,name:'Navy cream-trim knit vest',description:'海軍藍無袖針織背心 · 奶油白淺V領',display:'girls/navy-cream-knit-vest-display.png'},
 {id:'camel-coat-dress',slot:'fullBody',coverage:['top','lower'],group:'girls',price:45,name:'Camel tailored coat dress',description:'駝色修身翻領大衣連身裙 · 全身服裝',display:'girls/camel-coat-dress-display.png'},
 {id:'ivory-tiered-dress',slot:'fullBody',coverage:['top','lower'],group:'girls',price:45,name:'Ivory asymmetric chiffon gown',description:'象牙白荷葉袖不對稱長款雪紡禮服 · 全身服裝',display:'girls/ivory-tiered-dress-display.png'},
 {id:'brown-shearling-lace-boots',slot:'feet',group:'all',price:35,name:'Brown shearling lace-up boots',description:'深棕色皮革繫帶靴 · 奶油白羊羔絨鞋口',display:'shared/brown-shearling-lace-boots-display.png'}
]);
const GIRLS=Object.freeze(['celeste','phoebe','elsie']);
const INCLUDED_COSMETICS=Object.freeze(['camel-coat-dress','ivory-tiered-dress']);
const slotKind=item=>item.slot==='girlsTop'?'top':item.slot;
const SLOT_SUFFIX=Object.freeze({headwear:'Headwear',top:'Top',lower:'Lower',fullBody:'FullBody',feet:'Feet',accessory:'Accessory'});
const equipmentSlot=(item,character)=>character+SLOT_SUFFIX[slotKind(item)];
const OUTFIT_CHARACTERS=['eddy','noir',...GIRLS];
const itemForCharacter=(item,character)=>item.group==='all'||(item.group||'boys')===(GIRLS.includes(character)?'girls':'boys');
const characterSlots=character=>[...new Set(cosmeticsForCharacter(character).map(item=>equipmentSlot(item,character)))];
function normalizeCharacterEquipment(value,character){
 const result={...value};
 if(result[character+'FullBody']){delete result[character+'Top'];delete result[character+'Lower'];}
 return result;
}
export function cleanEquipment(value){
 let result={};
 for(const character of OUTFIT_CHARACTERS){
  for(const item of COSMETICS.filter(item=>itemForCharacter(item,character))){
   const slot=equipmentSlot(item,character);
   const legacy=character==='eddy'?value?.[item.slot]:slotKind(item)==='top'&&GIRLS.includes(character)?value?.girlsTop:undefined;
   const id=value?.[slot]??legacy;
   if(id===item.id)result[slot]=id;
  }
  result=normalizeCharacterEquipment(result,character);
 }
 return result;
}
export function cleanWardrobe(value){
 const outfits=[],counts=new Map();
 for(const x of (Array.isArray(value?.outfits)?value.outfits:[]).slice(0,200)){
  if(typeof x?.name!=='string'||!x.name.trim())continue;
  const characters=x.group==='girls'?(x.character===undefined?GIRLS:GIRLS.includes(x.character)?[x.character]:[]):(x.character===undefined?['eddy']:['eddy','noir'].includes(x.character)?[x.character]:[]);
  for(const character of characters){
   const count=counts.get(character)||0;if(count>=50)continue;counts.set(character,count+1);
   const cleaned=cleanEquipment(x.equipped);
   const selected=Object.fromEntries(Object.entries(cleaned).filter(([slot])=>characterSlots(character).includes(slot)));
   outfits.push({name:x.name.trim().slice(0,60),equipped:selected,...(x.favorite===true?{favorite:true}:{}),group:GIRLS.includes(character)?'girls':'boys',character});
  }
 }
 return {equipped:cleanEquipment(value?.equipped),outfits:outfits.slice(0,200)};
}
export const COSMETIC_CHARACTERS=Object.freeze(['eddy','noir','celeste','phoebe','elsie']);
export const supportsCosmetics=id=>COSMETIC_CHARACTERS.includes(id);
export const wardrobeGroup=id=>GIRLS.includes(id)?'girls':'boys';
export const cosmeticsForCharacter=id=>supportsCosmetics(id)?COSMETICS.filter(item=>itemForCharacter(item,id)):[];
const groupEquipment=(value,character)=>Object.fromEntries(cosmeticsForCharacter(character).filter(item=>value[equipmentSlot(item,character)]===item.id).map(item=>[equipmentSlot(item,character),item.id]));
const sameGroup=(outfit,character)=>outfit.character===character;
export const outfitsForCharacter=(outfits,character)=>outfits.filter(outfit=>sameGroup(outfit,character));
export const isCosmeticEquipped=(value,item,character)=>value[equipmentSlot(item,character)]===item.id;
export const cosmeticAsset=(id,character='eddy')=>new URL('./assets/speaking-system/cosmetics/'+(supportsCosmetics(character)?character:'eddy')+'/'+id+'.webp?v=20261002-shearling-boots1',import.meta.url).href;
let owner='',token='',wardrobe=cleanWardrobe(),includedWardrobe=cleanWardrobe(),equipped={},ownedCosmetics=new Set(INCLUDED_COSMETICS),revision=0,client,connection,pendingRestore,previewActive=false,lastSync=0,saveEpoch=0,saving=0;
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
const includedKey=id=>'edmund-included-wardrobe-v1:'+id;
const hasIncluded=item=>Object.values(item?.equipped||{}).some(id=>INCLUDED_COSMETICS.includes(id));
function includedPart(value){const cleaned=cleanWardrobe(value);return cleanWardrobe({equipped:Object.fromEntries(Object.entries(cleaned.equipped).filter(([,id])=>INCLUDED_COSMETICS.includes(id))),outfits:cleaned.outfits.filter(hasIncluded)});}
function mergeIncluded(value){const base=cleanWardrobe(value),local=cleanWardrobe(includedWardrobe);return cleanWardrobe({equipped:{...base.equipped,...local.equipped},outfits:[...base.outfits.filter(x=>!local.outfits.some(y=>x.character===y.character&&x.name===y.name)),...local.outfits]});}
function updateIncludedCharacter(value,character){const selected=includedPart(value),keptEquipment={...includedWardrobe.equipped};for(const item of cosmeticsForCharacter(character))delete keptEquipment[equipmentSlot(item,character)];includedWardrobe=cleanWardrobe({equipped:{...keptEquipment,...selected.equipped},outfits:[...includedWardrobe.outfits.filter(x=>!sameGroup(x,character)),...outfitsForCharacter(selected.outfits,character)]});}
const persistIncluded=()=>{try{if(owner)localStorage.setItem(includedKey(owner),JSON.stringify(includedWardrobe));}catch{}};
const notify=()=>{revision++;atlases.clear();for(const fn of listeners)fn();};
export function subscribeCosmetics(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function cosmeticsState(){return {owner,equipped:{...equipped},savedEquipment:{...wardrobe.equipped},owned:[...ownedCosmetics],previewActive,dirty:hasUnsavedCosmetics(),saving:saving>0,outfits:wardrobe.outfits.map(x=>({...x,equipped:{...x.equipped}})),revision};}
export function hasUnsavedCosmetics(){return OUTFIT_CHARACTERS.flatMap(character=>characterSlots(character)).some(slot=>equipped[slot]!==wardrobe.equipped[slot]);}
export function beginCosmeticsPreview(){equipped={...wardrobe.equipped};previewActive=true;notify();}
export function discardCosmeticsPreview(){equipped={...wardrobe.equipped};previewActive=false;notify();}
export const UNSAVED_OUTFIT_MESSAGE='You have unsaved outfit changes. Leave without saving? These changes will be discarded, and your previously saved avatar will remain unchanged across all systems. Choose Cancel to stay and save.\n\n造型尚未儲存。確定離開？未儲存的更改將會放棄，所有系統仍使用原先儲存的造型。選擇「取消」可返回儲存。';
export function confirmDiscardCosmetics(){if(saving)return false;if(previewActive&&hasUnsavedCosmetics()&&!window.confirm(UNSAVED_OUTFIT_MESSAGE))return false;discardCosmeticsPreview();return true;}
export function applyCosmeticSelection(value,item,character){
 const next={...value},slot=equipmentSlot(item,character),kind=slotKind(item);
 if(next[slot]===item.id){delete next[slot];return next;}
 if(kind==='fullBody'){delete next[character+'Top'];delete next[character+'Lower'];}
 else if((item.coverage||[kind]).some(area=>area==='top'||area==='lower'))delete next[character+'FullBody'];
 next[slot]=item.id;return next;
}
export function equipCosmetic(id,character='eddy'){const item=cosmeticsForCharacter(character).find(x=>x.id===id);if(!item||!ownedCosmetics.has(id))return;equipped=applyCosmeticSelection(equipped,item,character);notify();}
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
 if(changed){owner=next;token=nextToken;pendingRestore=null;lastSync=0;saveEpoch++;wardrobe=cleanWardrobe();includedWardrobe=cleanWardrobe();previewActive=false;
  try{if(owner)wardrobe=cleanWardrobe(JSON.parse(localStorage.getItem(key(owner))||'null'));}catch{}
  try{if(owner)includedWardrobe=includedPart(JSON.parse(localStorage.getItem(includedKey(owner))||'null'));}catch{}
  wardrobe=mergeIncluded(wardrobe);
  equipped={...wardrobe.equipped};notify();
 }
 if(!owner||!token||saving)return Promise.resolve();
 if(pendingRestore)return pendingRestore;
 if(!force&&lastSync&&Date.now()-lastSync<30000)return Promise.resolve();
 const requestOwner=owner,requestToken=token,epoch=saveEpoch;
 const request=rpc({p_token:requestToken}).then(async result=>{
  if(owner!==requestOwner||token!==requestToken||epoch!==saveEpoch)return;
  const keepDraft=hasUnsavedCosmetics();wardrobe=mergeIncluded(result);if(!keepDraft)equipped={...wardrobe.equipped};let owned=await rpcRaw({p_token:requestToken},'eddie_farm_owned_cosmetics').catch(()=>[]);try{const adminToken=sessionStorage.getItem('eddie-farm-admin-session-v1');if(adminToken){const preview=await rpcRaw({p_token:adminToken},'eddie_farm_admin_preview_cosmetics').catch(()=>[]);owned=[...new Set([...owned,...preview])];}}catch{}ownedCosmetics=new Set([...owned,...INCLUDED_COSMETICS]);lastSync=Date.now();
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
 if(name!==undefined){name=String(name).trim();if(!name||name.length>60)throw Error('Use an outfit name from 1 to 60 characters.');const i=outfits.findIndex(x=>x.name===name&&sameGroup(x,character));const item={name,equipped:groupEquipment(equipped,character),group:wardrobeGroup(character),character,...(i>=0&&outfits[i].favorite?{favorite:true}:{})};if(i>=0)outfits[i]=item;else {if(outfitsForCharacter(outfits,character).length>=50)throw Error('You can save up to 50 outfits for this character.');outfits.push(item);}}
 const intended=cleanWardrobe({equipped:groupEquipment(equipped,character),outfits:outfitsForCharacter(outfits,character)});updateIncludedCharacter(intended,character);persistIncluded();
 const remoteEquipment=Object.fromEntries(Object.entries(groupEquipment(equipped,character)).filter(([,id])=>!INCLUDED_COSMETICS.includes(id)));
 const remoteOutfits=outfitsForCharacter(outfits,character).filter(x=>!hasIncluded(x));
 const result=await rpc({p_token:requestToken,p_character:character,p_equipped:remoteEquipment,p_outfits:remoteOutfits},'character_closet_sync');
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=mergeIncluded(result);try{localStorage.setItem(key(owner),JSON.stringify(wardrobe));}catch{}
 if(revision===requestRevision)equipped={...wardrobe.equipped};notify();return wardrobe;
 }finally{saving--;}
}
export async function toggleOutfitFavorite(name,character='eddy'){
 if(!owner||!token)throw Error('Please sign in to save favorites.');
 const requestOwner=owner,requestToken=token;saveEpoch++;saving++;
 try {
 const outfits=wardrobe.outfits.map(x=>x.name===name&&sameGroup(x,character)?{...x,favorite:!x.favorite}:{...x});includedWardrobe=includedPart({equipped:wardrobe.equipped,outfits});persistIncluded();
 const result=await rpc({p_token:requestToken,p_character:character,p_outfits:outfitsForCharacter(outfits,character).filter(x=>!hasIncluded(x))},'character_closet_sync');
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=mergeIncluded(result);try{localStorage.setItem(key(owner),JSON.stringify(wardrobe));}catch{}notify();return wardrobe;
 }finally{saving--;}
}
function load(id,character='eddy'){const key=character+':'+id;if(images.has(key))return images.get(key);const img=new Image();images.set(key,img);img.onload=()=>{atlases.clear();for(const fn of listeners)fn();};img.src=cosmeticAsset(id,character);return img;}
// One composite per equipment/base combination, never one per animation frame.
export function cosmeticAtlas(id,base,{preview=false,wardrobe:wardrobeOverride=null}={}){
 const selected=groupEquipment(wardrobeOverride|| (preview?equipped:wardrobe.equipped),id);
 const rendered={...(selected[id+'Top']?{top:selected[id+'Top']}:{}) ,...(selected[id+'Lower']?{lower:selected[id+'Lower']}:{}) ,...(selected[id+'FullBody']?{fullBody:selected[id+'FullBody']}:{}) ,...(selected[id+'Feet']?{feet:selected[id+'Feet']}:{}) ,...(selected[id+'Headwear']?{headwear:selected[id+'Headwear']}:{})};
 if(!supportsCosmetics(id)||!base?.naturalWidth)return base;
 const cacheKey=id+'|'+base.src+'|'+JSON.stringify(rendered);if(atlases.has(cacheKey))return atlases.get(cacheKey);
 const corrected=closeInterlegWhiteMarks(id,base);
 const headwearHide=rendered.headwear?(COSMETICS.find(item=>item.id===rendered.headwear)?.hide||'hat-hide'):null;
 const ids=[rendered.top,rendered.lower,rendered.fullBody,rendered.feet,rendered.headwear,headwearHide].filter(Boolean);
 if(ids.map(item=>load(item,id)).some(img=>!img.complete||!img.naturalWidth))return corrected;
 if(!ids.length){atlases.set(cacheKey,corrected);return corrected;}
 const canvas=document.createElement('canvas');canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;
 const ctx=canvas.getContext('2d');ctx.drawImage(corrected,0,0);
 // Tailored overlays already follow the neck, cuffs and tail cutouts.
 if(rendered.top)ctx.drawImage(load(rendered.top,id),0,0,canvas.width,canvas.height);
 if(rendered.lower)ctx.drawImage(load(rendered.lower,id),0,0,canvas.width,canvas.height);
 if(rendered.fullBody)ctx.drawImage(load(rendered.fullBody,id),0,0,canvas.width,canvas.height);
 if(rendered.feet)ctx.drawImage(load(rendered.feet,id),0,0,canvas.width,canvas.height);
 if(rendered.headwear){ctx.globalCompositeOperation='destination-out';ctx.drawImage(load(headwearHide,id),0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';ctx.drawImage(load(rendered.headwear,id),0,0,canvas.width,canvas.height);}
 canvas.naturalWidth=canvas.width;canvas.naturalHeight=canvas.height;canvas.complete=true;
 atlases.set(cacheKey,canvas);return canvas;
}
if(typeof window!=='undefined'){
 window.addEventListener('storage',e=>{if(owner&&(e.key===key(owner)||e.key===includedKey(owner))){try{if(e.key===includedKey(owner))includedWardrobe=includedPart(JSON.parse(e.newValue));const keepDraft=previewActive&&hasUnsavedCosmetics();wardrobe=mergeIncluded(e.key===key(owner)?JSON.parse(e.newValue):wardrobe);if(!keepDraft)equipped={...wardrobe.equipped};saveEpoch++;notify();}catch{}}});
 window.addEventListener('edmund-student-session-change',()=>{if(!session()?.id){owner='';token='';wardrobe=cleanWardrobe();equipped={};previewActive=false;saveEpoch++;notify();}void restoreCosmetics();});
 window.addEventListener('focus',()=>{void restoreCosmetics(undefined,{force:true});});
 window.addEventListener('pageshow',()=>{void restoreCosmetics(undefined,{force:true});});
 window.addEventListener('beforeunload',event=>{if(previewActive&&hasUnsavedCosmetics()){event.preventDefault();event.returnValue='';}});
 window.addEventListener('pagehide',discardCosmeticsPreview);
}
