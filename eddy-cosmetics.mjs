// Account-scoped equipment shared by the 2D maps and 3D standing characters.
export const COSMETICS=Object.freeze([
 {id:'white-fedora',slot:'headwear',name:'White fedora',description:'白色 Fedora 帽'},
 {id:'cream-cable-knit',slot:'top',name:'Cream cable-knit crewneck',description:'奶油色麻花針織毛衣'},
 {id:'charcoal-turtleneck',slot:'top',name:'Charcoal gray turtleneck',description:'炭灰色高領毛衣'},
 {id:'blue-swordsman-jacket',slot:'top',name:'Blue swordsman jacket',description:'藍色劍士外套 · 銀色飾邊'}
]);
export const cleanEquipment=value=>Object.fromEntries(COSMETICS.filter(item=>value?.[item.slot]===item.id).map(item=>[item.slot,item.id]));
export function cleanWardrobe(value){return {equipped:cleanEquipment(value?.equipped),outfits:(Array.isArray(value?.outfits)?value.outfits:[]).slice(0,50).filter(x=>typeof x?.name==='string'&&x.name.trim()).map(x=>({name:x.name.trim().slice(0,60),equipped:cleanEquipment(x.equipped),...(x.favorite===true?{favorite:true}:{})}))};}
export const cosmeticAsset=id=>new URL('./assets/speaking-system/cosmetics/eddy/'+id+'.webp?v=20260915-closet2',import.meta.url).href;
let owner='',token='',wardrobe=cleanWardrobe(),equipped={},revision=0,client,connection,pendingRestore;
const listeners=new Set(),images=new Map(),atlases=new Map();
const session=()=>globalThis.window?.EdmundSystemNav?.getStudentSession?.();
const key=id=>'edmund-eddy-wardrobe-v1:'+id;
const notify=()=>{revision++;atlases.clear();for(const fn of listeners)fn();};
export function subscribeCosmetics(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function cosmeticsState(){return {owner,equipped:{...equipped},outfits:wardrobe.outfits.map(x=>({...x,equipped:{...x.equipped}})),revision};}
export function equipCosmetic(id){const item=COSMETICS.find(x=>x.id===id);if(!item)return;equipped={...equipped};if(equipped[item.slot]===id)delete equipped[item.slot];else equipped[item.slot]=id;notify();}
export function clearCosmetics(){equipped={};notify();}
export function equipOutfit(name){const outfit=wardrobe.outfits.find(x=>x.name===name);if(outfit){equipped={...outfit.equipped};notify();}}
async function rpc(args){
 const config=globalThis.window?.EDMUND_SUPABASE;
 if(!config?.url||!window.supabase?.createClient)throw Error('Account saving is unavailable. Please reload and try again.');
 client ||= window.supabase.createClient(config.url,config.anonKey,{auth:{storageKey:'edmund-closet-auth-v1',storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 connection ||= (async()=>{const current=await client.auth.getSession();if(current.error)throw current.error;if(!current.data?.session){const login=await client.auth.signInAnonymously();if(login.error)throw login.error;}})().catch(e=>{connection=null;throw e;});
 await connection;const {data,error}=await client.rpc('eddy_closet_sync',args);if(error)throw error;return cleanWardrobe(data);
}
export function restoreCosmetics(fallbackOwner){
 const shared=session();const next=String(fallbackOwner??shared?.id??owner).replace(/^id:/,'');const nextToken=String(shared?.id||'')===next?shared?.token||'':'';
 if(owner===next&&token===nextToken)return pendingRestore||Promise.resolve();
 owner=next;token=nextToken;wardrobe=cleanWardrobe();
 try{if(owner)wardrobe=cleanWardrobe(JSON.parse(localStorage.getItem(key(owner))||'null'));}catch{}
 equipped={...wardrobe.equipped};notify();
 if(!owner||!token)return Promise.resolve();
 const requestOwner=owner,requestToken=token,requestRevision=revision;
 pendingRestore=rpc({p_token:requestToken}).then(result=>{
  if(owner!==requestOwner||token!==requestToken||revision!==requestRevision)return;
  wardrobe=result;equipped={...result.equipped};try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}notify();
 }).catch(()=>{/* Cached outfit stays available; explicit Save reports failures. */});
 return pendingRestore;
}
export async function saveAvatar(name){
 if(!owner||!token)throw Error('Please sign in to save your avatar.');
 const requestOwner=owner,requestToken=token,requestRevision=revision;
 const outfits=wardrobe.outfits.map(x=>({...x}));
 if(name!==undefined){name=String(name).trim();if(!name||name.length>60)throw Error('Use an outfit name from 1 to 60 characters.');const i=outfits.findIndex(x=>x.name===name);const item={name,equipped:{...equipped},...(i>=0&&outfits[i].favorite?{favorite:true}:{})};if(i>=0)outfits[i]=item;else {if(outfits.length>=50)throw Error('You can save up to 50 outfits.');outfits.push(item);}}
 const result=await rpc({p_token:requestToken,p_equipped:{...equipped},p_outfits:outfits});
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=result;try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}
 if(revision===requestRevision)equipped={...result.equipped};notify();return result;
}
export async function toggleOutfitFavorite(name){
 if(!owner||!token)throw Error('Please sign in to save favorites.');
 const requestOwner=owner,requestToken=token;
 const outfits=wardrobe.outfits.map(x=>x.name===name?{...x,favorite:!x.favorite}:{...x});
 const result=await rpc({p_token:requestToken,p_outfits:outfits});
 if(owner!==requestOwner||token!==requestToken)throw Error('The account changed. Please reopen the closet.');
 wardrobe=result;try{localStorage.setItem(key(owner),JSON.stringify(result));}catch{}notify();return result;
}
function load(id){if(images.has(id))return images.get(id);const img=new Image();images.set(id,img);img.onload=()=>{atlases.clear();for(const fn of listeners)fn();};img.src=cosmeticAsset(id);return img;}
// One composite per equipment/base combination, never one per animation frame.
export function cosmeticAtlas(id,base){
 if(id!=='eddy'||!base?.naturalWidth||!Object.keys(equipped).length)return base;
 const cacheKey=base.src+'|'+JSON.stringify(equipped);if(atlases.has(cacheKey))return atlases.get(cacheKey);
 const ids=[equipped.top,equipped.headwear,equipped.headwear&&'hat-hide'].filter(Boolean);
 if(ids.map(load).some(img=>!img.complete||!img.naturalWidth))return base;
 const canvas=document.createElement('canvas');canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;
 const ctx=canvas.getContext('2d');ctx.drawImage(base,0,0);
 // Tailored overlays already follow the neck, cuffs and tail cutouts.
 if(equipped.top)ctx.drawImage(load(equipped.top),0,0,canvas.width,canvas.height);
 if(equipped.headwear){ctx.globalCompositeOperation='destination-out';ctx.drawImage(load('hat-hide'),0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';ctx.drawImage(load(equipped.headwear),0,0,canvas.width,canvas.height);}
 canvas.naturalWidth=canvas.width;canvas.naturalHeight=canvas.height;canvas.complete=true;
 atlases.set(cacheKey,canvas);return canvas;
}
if(typeof window!=='undefined'){
 window.addEventListener('storage',e=>{if(e.key===key(owner)){try{wardrobe=cleanWardrobe(JSON.parse(e.newValue));equipped={...wardrobe.equipped};notify();}catch{}}});
 window.addEventListener('edmund-student-session-change',()=>{owner='';void restoreCosmetics();});
}
