// Account-scoped equipment shared by the 2D maps and 3D standing characters.
export const COSMETICS=Object.freeze([
 {id:'white-fedora',slot:'headwear',name:'White fedora',description:'白色 Fedora 帽'},
 {id:'cream-cable-knit',slot:'top',name:'Cream cable-knit crewneck',description:'奶油色麻花針織毛衣'},
 {id:'charcoal-turtleneck',slot:'top',name:'Charcoal gray turtleneck',description:'炭灰色高領毛衣'},
 {id:'blue-swordsman-jacket',slot:'top',name:'Blue swordsman jacket',description:'藍色劍士外套 · 銀色飾邊'},
 {id:'brown-leather-bomber',slot:'top',name:'Brown leather bomber jacket',description:'棕色皮革飛行外套 · 拉鍊與翻蓋口袋'},
 {id:'sunburst-hoodie',slot:'top',name:'Charcoal sunburst hoodie',description:'炭黑連帽衫 · 背面太陽圖案'},
 {id:'black-blazer-hoodie',slot:'top',name:'Black blazer over hoodie',description:'黑色雙排扣西裝外套 · 連帽衫內搭'},
 {id:'cream-sherpa-jacket',slot:'girlsTop',group:'girls',name:'Cream sherpa jacket',description:'奶油色羊羔絨拉鍊外套',display:'girls/cream-sherpa-display.png'}
]);
export const cleanEquipment=value=>Object.fromEntries(COSMETICS.filter(item=>value?.[item.slot]===item.id).map(item=>[item.slot,item.id]));
export function cleanWardrobe(value){return {equipped:cleanEquipment(value?.equipped),outfits:(Array.isArray(value?.outfits)?value.outfits:[]).slice(0,50).filter(x=>typeof x?.name==='string'&&x.name.trim()).map(x=>({name:x.name.trim().slice(0,60),equipped:cleanEquipment(x.equipped),...(x.favorite===true?{favorite:true}:{}),...(x.group==='girls'?{group:'girls'}:{})}))};}
export const COSMETIC_CHARACTERS=Object.freeze(['eddy','noir','celeste','phoebe','elsie']);
export const supportsCosmetics=id=>COSMETIC_CHARACTERS.includes(id);
export const wardrobeGroup=id=>['celeste','phoebe','elsie'].includes(id)?'girls':'boys';
export const cosmeticsForCharacter=id=>supportsCosmetics(id)?COSMETICS.filter(item=>(item.group||'boys')===wardrobeGroup(id)):[];
const groupEquipment=(value,character)=>Object.fromEntries(cosmeticsForCharacter(character).filter(item=>value[item.slot]===item.id).map(item=>[item.slot,item.id]));
const sameGroup=(outfit,character)=>(outfit.group||'boys')===wardrobeGroup(character);
export const cosmeticAsset=(id,character='eddy')=>new URL('./assets/speaking-system/cosmetics/'+(supportsCosmetics(character)?character:'eddy')+'/'+id+'.webp?v=20260916-girls-fleece1',import.meta.url).href;
let owner='',token='',wardrobe=cleanWardrobe(),equipped={},revision=0,client,connection,pendingRestore,previewActive=false,lastSync=0,saveEpoch=0,saving=0;
const listeners=new Set(),images=new Map(),atlases=new Map();
const session=()=>globalThis.window?.EdmundSystemNav?.getStudentSession?.();
const key=id=>'edmund-eddy-wardrobe-v1:'+id;
const notify=()=>{revision++;atlases.clear();for(const fn of listeners)fn();};
export function subscribeCosmetics(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function cosmeticsState(){return {owner,equipped:{...equipped},savedEquipment:{...wardrobe.equipped},previewActive,dirty:hasUnsavedCosmetics(),saving:saving>0,outfits:wardrobe.outfits.map(x=>({...x,equipped:{...x.equipped}})),revision};}
export function hasUnsavedCosmetics(){return COSMETICS.some(item=>equipped[item.slot]!==wardrobe.equipped[item.slot]);}
export function beginCosmeticsPreview(){equipped={...wardrobe.equipped};previewActive=true;notify();}
export function discardCosmeticsPreview(){equipped={...wardrobe.equipped};previewActive=false;notify();}
export const UNSAVED_OUTFIT_MESSAGE='You have unsaved outfit changes. Leave without saving? These changes will be discarded, and your previously saved avatar will remain unchanged across all systems. Choose Cancel to stay and save.\n\n造型尚未儲存。確定離開？未儲存的更改將會放棄，所有系統仍使用原先儲存的造型。選擇「取消」可返回儲存。';
export function confirmDiscardCosmetics(){if(saving)return false;if(previewActive&&hasUnsavedCosmetics()&&!window.confirm(UNSAVED_OUTFIT_MESSAGE))return false;discardCosmeticsPreview();return true;}
export function equipCosmetic(id){const item=COSMETICS.find(x=>x.id===id);if(!item)return;equipped={...equipped};if(equipped[item.slot]===id)delete equipped[item.slot];else equipped[item.slot]=id;notify();}
export function clearCosmetics(character='eddy'){equipped={...equipped};for(const item of cosmeticsForCharacter(character))delete equipped[item.slot];notify();}
export function equipOutfit(name,character='eddy'){const outfit=wardrobe.outfits.find(x=>x.name===name&&sameGroup(x,character));if(outfit){equipped={...equipped};for(const item of cosmeticsForCharacter(character))delete equipped[item.slot];Object.assign(equipped,groupEquipment(outfit.equipped,character));notify();}}
async function rpc(args){
 const config=globalThis.window?.EDMUND_SUPABASE;
 if(!config?.url||!window.supabase?.createClient)throw Error('Account saving is unavailable. Please reload and try again.');
 client ||= window.supabase.createClient(config.url,config.anonKey,{auth:{storageKey:'edmund-closet-auth-v1',storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 connection ||= (async()=>{const current=await client.auth.getSession();if(current.error)throw current.error;if(!current.data?.session){const login=await client.auth.signInAnonymously();if(login.error)throw login.error;}})().catch(e=>{connection=null;throw e;});
 await connection;const {data,error}=await client.rpc('eddy_closet_sync',args);if(error)throw error;return cleanWardrobe(data);
}
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
 const request=rpc({p_token:requestToken}).then(result=>{
  if(owner!==requestOwner||token!==requestToken||epoch!==saveEpoch)return;
  const keepDraft=hasUnsavedCosmetics();wardrobe=result;if(!keepDraft)equipped={...result.equipped};lastSync=Date.now();
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
 if(name!==undefined){name=String(name).trim();if(!name||name.length>60)throw Error('Use an outfit name from 1 to 60 characters.');const i=outfits.findIndex(x=>x.name===name&&sameGroup(x,character));const item={name,equipped:groupEquipment(equipped,character),...(wardrobeGroup(character)==='girls'?{group:'girls'}:{}),...(i>=0&&outfits[i].favorite?{favorite:true}:{})};if(i>=0)outfits[i]=item;else {if(outfits.length>=50)throw Error('You can save up to 50 outfits.');outfits.push(item);}}
 const result=await rpc({p_token:requestToken,p_equipped:{...equipped},p_outfits:outfits});
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
 const result=await rpc({p_token:requestToken,p_outfits:outfits});
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=result;try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}notify();return result;
 }finally{saving--;}
}
function load(id,character='eddy'){const key=character+':'+id;if(images.has(key))return images.get(key);const img=new Image();images.set(key,img);img.onload=()=>{atlases.clear();for(const fn of listeners)fn();};img.src=cosmeticAsset(id,character);return img;}
// One composite per equipment/base combination, never one per animation frame.
export function cosmeticAtlas(id,base,{preview=false}={}){
 const selected=groupEquipment(preview?equipped:wardrobe.equipped,id);
 const rendered=wardrobeGroup(id)==='girls'?{...(selected.girlsTop?{top:selected.girlsTop}:{})}:selected;
 if(!supportsCosmetics(id)||!base?.naturalWidth||!Object.keys(rendered).length)return base;
 const cacheKey=id+'|'+base.src+'|'+JSON.stringify(rendered);if(atlases.has(cacheKey))return atlases.get(cacheKey);
 const ids=[rendered.top,rendered.headwear,rendered.headwear&&'hat-hide'].filter(Boolean);
 if(ids.map(item=>load(item,id)).some(img=>!img.complete||!img.naturalWidth))return base;
 const canvas=document.createElement('canvas');canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;
 const ctx=canvas.getContext('2d');ctx.drawImage(base,0,0);
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
