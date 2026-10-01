import test,{beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {cleanEquipment,cleanWardrobe,equipCosmetic,equipOutfit,clearCosmetics,cosmeticsState,restoreCosmetics,saveAvatar,applyCosmeticSelection} from '../eddy-cosmetics.mjs';
import {COSMETICS} from '../eddy-cosmetics.mjs';
let rpcHandler,fixtureAccount;
const ownedIds=COSMETICS.map(item=>item.id);
beforeEach(async()=>{
 const cache=new Map();globalThis.localStorage={getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)};globalThis.sessionStorage={};
 fixtureAccount={id:'cosmetic-test-student',token:'cosmetic-test-token'};
 globalThis.window={EdmundSystemNav:{getStudentSession:()=>fixtureAccount},EDMUND_SUPABASE:{url:'fixture',anonKey:'fixture'},supabase:{createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:(method,args)=>rpcHandler(method,args)})}};
 rpcHandler=async method=>method==='eddy_closet_sync'?{data:{equipped:{},outfits:[]}}:{data:ownedIds};
 await restoreCosmetics(undefined,{force:true});
});
test('Eddy and Noir can wear different purchased tops and hats',()=>{
 clearCosmetics('eddy');clearCosmetics('noir');
 equipCosmetic('olive-plain-tee','eddy');equipCosmetic('white-fedora','eddy');
 assert.deepEqual(cosmeticsState().equipped,{eddyTop:'olive-plain-tee',eddyHeadwear:'white-fedora'});
 equipCosmetic('blue-swordsman-jacket','noir');
 assert.deepEqual(cosmeticsState().equipped,{eddyTop:'olive-plain-tee',eddyHeadwear:'white-fedora',noirTop:'blue-swordsman-jacket'});
 clearCosmetics('eddy');assert.deepEqual(cosmeticsState().equipped,{noirTop:'blue-swordsman-jacket'});
 clearCosmetics('noir');assert.deepEqual(cosmeticsState().equipped,{});
});
test('legacy shared clothing and outfits migrate to Eddy only',()=>{
 const migrated=cleanWardrobe({equipped:{top:'olive-plain-tee',headwear:'white-fedora'},outfits:[{name:'Green',equipped:{top:'olive-plain-tee'}}]});
 assert.deepEqual(migrated.equipped,{eddyTop:'olive-plain-tee',eddyHeadwear:'white-fedora'});
 assert.deepEqual(migrated.outfits,[{name:'Green',equipped:{eddyTop:'olive-plain-tee'},group:'boys',character:'eddy'}]);
 assert.deepEqual(cleanWardrobe(migrated),migrated);
});
test('Eddy and Noir outfit sets remain separate even with the same name',()=>{
 const outfits=cleanWardrobe({outfits:[
  {name:'Everyday',group:'boys',character:'eddy',equipped:{eddyTop:'olive-plain-tee'}},
  {name:'Everyday',group:'boys',character:'noir',equipped:{noirTop:'charcoal-turtleneck'}}
 ]}).outfits;
 assert.deepEqual(outfits.map(x=>x.character),['eddy','noir']);
 assert.deepEqual(outfits.map(x=>x.equipped),[{eddyTop:'olive-plain-tee'},{noirTop:'charcoal-turtleneck'}]);
});
test('malformed saved outfits are bounded',()=>{
 assert.deepEqual(cleanWardrobe({outfits:[null,{name:' '},{name:'  Winter  ',equipped:{top:'charcoal-turtleneck',headwear:'bad'}}]}).outfits,[{name:'Winter',equipped:{eddyTop:'charcoal-turtleneck'},group:'boys',character:'eddy'}]);
 assert.equal(cleanWardrobe({outfits:Array.from({length:100},()=>({name:'x'.repeat(100)}))}).outfits.length,50);
});
test('stale restore cannot overwrite an edit or another student',async()=>{
 const cache=new Map();globalThis.localStorage={getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)};globalThis.sessionStorage={};
 let account={id:'student-a',token:'token-a'},resolve;
 globalThis.window.EdmundSystemNav.getStudentSession=()=>account;
 rpcHandler=method=>method==='eddie_farm_owned_cosmetics'?Promise.resolve({data:ownedIds}):new Promise(r=>resolve=r);
 const pending=restoreCosmetics();await new Promise(r=>setTimeout(r,0));equipCosmetic('white-fedora','eddy');
 resolve({data:{equipped:{eddyTop:'cream-cable-knit'},outfits:[]}});await pending;
 assert.deepEqual(cosmeticsState().equipped,{eddyHeadwear:'white-fedora'});
 const saving=saveAvatar(undefined,'eddy');await new Promise(r=>setTimeout(r,0));const old=resolve;
 account={id:'student-b',token:''};await restoreCosmetics();
 old({data:{equipped:{eddyHeadwear:'white-fedora'},outfits:[]}});
 await assert.rejects(saving,/account changed/);assert.deepEqual(cosmeticsState().equipped,{});
 await assert.rejects(saveAvatar(),/sign in/);equipOutfit('not found');assert.deepEqual(cosmeticsState().equipped,{});
});
test('saving Noir sends only Noir slots and outfits',async()=>{
 clearCosmetics('eddy');clearCosmetics('noir');equipCosmetic('olive-plain-tee','eddy');equipCosmetic('charcoal-turtleneck','noir');
 let savedArgs;
 rpcHandler=async(method,args)=>{
  if(method==='character_closet_sync'){savedArgs=args;return {data:{equipped:{eddyTop:'olive-plain-tee',noirTop:'charcoal-turtleneck'},outfits:args.p_outfits}};}
  return {data:ownedIds};
 };
 await saveAvatar('Night', 'noir');
 assert.equal(savedArgs.p_character,'noir');
 assert.deepEqual(savedArgs.p_equipped,{noirTop:'charcoal-turtleneck'});
 assert.deepEqual(savedArgs.p_outfits,[{name:'Night',equipped:{noirTop:'charcoal-turtleneck'},group:'boys',character:'noir'}]);
 assert.deepEqual(cosmeticsState().savedEquipment,{eddyTop:'olive-plain-tee',noirTop:'charcoal-turtleneck'});
});
test('favorites survive cleaning only as booleans',()=>{
 const favorite=cleanWardrobe({outfits:[{name:'Blue',equipped:{top:'blue-swordsman-jacket'},favorite:true}]}).outfits[0];
 assert.equal(favorite.favorite,true);
 assert.equal(cleanWardrobe({outfits:[{name:'Blue',equipped:{},favorite:'true'}]}).outfits[0].favorite,undefined);
});
test('every shared item ships independent Eddy and Noir fits',async()=>{
 const {COSMETICS,COSMETIC_CHARACTERS,supportsCosmetics}=await import('../eddy-cosmetics.mjs');
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 assert.deepEqual(COSMETIC_CHARACTERS,['eddy','noir','celeste','phoebe','elsie']);assert.equal(supportsCosmetics('celeste'),true);
 for(const item of [...COSMETICS.filter(x=>x.group!=='girls').map(x=>x.id),'hat-hide']){
  const hashes=['eddy','noir'].map(character=>{const b=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/'+item+'.webp',import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.ok(b.length>500,item+' '+character+' must contain fitted artwork');return createHash('sha256').update(b).digest('hex');});
  assert.notEqual(hashes[0],hashes[1],item+' must be fitted separately for both characters');
 }
});


test('girls share availability but have independent equipped slots',async()=>{
 const {cosmeticsForCharacter}=await import('../eddy-cosmetics.mjs');
 clearCosmetics('eddy');for(const c of ['celeste','phoebe','elsie'])clearCosmetics(c);
 equipCosmetic('white-fedora');equipCosmetic('blue-swordsman-jacket');equipCosmetic('pink-rain-jacket','elsie');
 assert.deepEqual(cosmeticsState().equipped,{eddyHeadwear:'white-fedora',eddyTop:'blue-swordsman-jacket',elsieTop:'pink-rain-jacket'});
 for(const c of ['celeste','phoebe','elsie'])assert.deepEqual(cosmeticsForCharacter(c).map(x=>x.id),['cream-sherpa-jacket','pink-rain-jacket','camel-coat-dress']);
 clearCosmetics('phoebe');assert.equal(cosmeticsState().equipped.elsieTop,'pink-rain-jacket');
 equipCosmetic('cream-sherpa-jacket','phoebe');clearCosmetics('elsie');
 assert.equal(cosmeticsState().equipped.phoebeTop,'cream-sherpa-jacket');assert.equal(cosmeticsState().equipped.elsieTop,undefined);assert.equal(cosmeticsState().equipped.celesteTop,undefined);
 for(const c of ['eddy','celeste','phoebe','elsie'])clearCosmetics(c);
});
test('full-body clothing replaces tops and lower-body clothing but preserves shoes and headwear',async()=>{
 const {cosmeticsForCharacter}=await import('../eddy-cosmetics.mjs');
 const dress=cosmeticsForCharacter('elsie').find(x=>x.id==='camel-coat-dress');
 const top=cosmeticsForCharacter('elsie').find(x=>x.id==='cream-sherpa-jacket');
 const dressed=applyCosmeticSelection({elsieTop:'cream-sherpa-jacket',elsieLower:'future-trousers',elsieFeet:'future-shoes',elsieHeadwear:'future-hat'},dress,'elsie');
 assert.deepEqual(dressed,{elsieFeet:'future-shoes',elsieHeadwear:'future-hat',elsieFullBody:'camel-coat-dress'});
 assert.deepEqual(applyCosmeticSelection(dressed,top,'elsie'),{elsieFeet:'future-shoes',elsieHeadwear:'future-hat',elsieTop:'cream-sherpa-jacket'});
 assert.deepEqual(cleanEquipment({elsieTop:'pink-rain-jacket',elsieFullBody:'camel-coat-dress'}),{elsieFullBody:'camel-coat-dress'});
 clearCosmetics('elsie');equipCosmetic('camel-coat-dress','elsie');
 assert.equal(cosmeticsState().equipped.elsieFullBody,'camel-coat-dress');
});
test('the included camel coat never calls the unavailable purchase catalog and saves locally',async()=>{
 clearCosmetics('elsie');let savedArgs;
 rpcHandler=async(method,args)=>{
  if(method==='eddie_farm_owned_cosmetics')return {data:['cream-sherpa-jacket','pink-rain-jacket']};
  if(method==='character_closet_sync'){savedArgs=args;return {data:{equipped:{},outfits:[]}};}
  return {data:{equipped:{},outfits:[]}};
 };
 await restoreCosmetics(undefined,{force:true});
 assert.ok(cosmeticsState().owned.includes('camel-coat-dress'));
 equipCosmetic('camel-coat-dress','elsie');await saveAvatar(undefined,'elsie');
 assert.deepEqual(savedArgs.p_equipped,{});assert.deepEqual(savedArgs.p_outfits,[]);
 assert.equal(cosmeticsState().savedEquipment.elsieFullBody,'camel-coat-dress');
 assert.equal(cosmeticsState().equipped.elsieFullBody,'camel-coat-dress');
});
test('legacy looks and sets migrate into independent character copies',()=>{
 const value=cleanWardrobe({equipped:{girlsTop:'cream-sherpa-jacket'},outfits:[{name:'Winter',group:'girls',equipped:{girlsTop:'cream-sherpa-jacket'},favorite:true}]});
 assert.deepEqual(value.equipped,{celesteTop:'cream-sherpa-jacket',phoebeTop:'cream-sherpa-jacket',elsieTop:'cream-sherpa-jacket'});
 assert.deepEqual(value.outfits.map(x=>x.character),['celeste','phoebe','elsie']);
 for(const x of value.outfits){assert.deepEqual(x.equipped,{[x.character+'Top']:'cream-sherpa-jacket'});assert.equal(x.favorite,true);}
 assert.deepEqual(cleanWardrobe(value),value);
});
test('the shared fleece has three independent transparent fit assets',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const hashes=['celeste','phoebe','elsie'].map(character=>{const b=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/cream-sherpa-jacket.webp',import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.ok(b.length>10000);return createHash('sha256').update(b).digest('hex');});
 assert.equal(new Set(hashes).size,3);
});
test('the pink rain jacket has three independent transparent 16-view overlays',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const hashes=[];
 for(const character of ['celeste','phoebe','elsie']){
  const file=new URL('../assets/speaking-system/cosmetics/'+character+'/pink-rain-jacket.webp',import.meta.url),bytes=readFileSync(file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length);assert.equal(bytes.toString('ascii',12,16),'VP8L');assert.equal(bytes[20],0x2f);
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16,'the WebP sprite sheet must have alpha');assert.ok(bytes.length>100000);
  hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,3);
 const display=new URL('../assets/speaking-system/cosmetics/girls/pink-rain-jacket-display.png',import.meta.url),thumb=readFileSync(display);
 assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10],'inventory thumbnail is a PNG');
 assert.equal(thumb.toString('ascii',12,16),'IHDR');
 assert.equal(thumb.readUInt32BE(16),1254);assert.equal(thumb.readUInt32BE(20),1254);
 assert.ok([4,6].includes(thumb[25]),'inventory thumbnail format supports alpha transparency');
});
test('the camel coat dress has three independent transparent 16-view overlays and a shop image',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const hashes=[];
 for(const character of ['celeste','phoebe','elsie']){
  const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/camel-coat-dress.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16);assert.ok(bytes.length>100000);hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,3);
 const thumb=readFileSync(new URL('../assets/speaking-system/cosmetics/girls/camel-coat-dress-display.png',import.meta.url));
 assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(thumb.readUInt32BE(16),1254);assert.equal(thumb.readUInt32BE(20),1254);
});
