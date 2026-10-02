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
 equipCosmetic('white-fedora');equipCosmetic('blue-swordsman-jacket');equipCosmetic('ivory-botanical-cap','celeste');equipCosmetic('pink-rain-jacket','elsie');
 assert.deepEqual(cosmeticsState().equipped,{eddyHeadwear:'white-fedora',eddyTop:'blue-swordsman-jacket',celesteHeadwear:'ivory-botanical-cap',elsieTop:'pink-rain-jacket'});
 for(const c of ['celeste','phoebe','elsie'])assert.deepEqual(cosmeticsForCharacter(c).map(x=>x.id),['ivory-botanical-cap','white-oversized-tee','cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','camel-coat-dress','ivory-tiered-dress','brown-shearling-lace-boots']);
 clearCosmetics('phoebe');assert.equal(cosmeticsState().equipped.elsieTop,'pink-rain-jacket');
 equipCosmetic('cream-sherpa-jacket','phoebe');clearCosmetics('elsie');
 assert.equal(cosmeticsState().equipped.phoebeTop,'cream-sherpa-jacket');assert.equal(cosmeticsState().equipped.elsieTop,undefined);assert.equal(cosmeticsState().equipped.celesteTop,undefined);
 for(const c of ['eddy','celeste','phoebe','elsie'])clearCosmetics(c);
});
test('the botanical cap is independently fitted and equippable for all five characters',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');const hashes=[];
 for(const character of ['eddy','noir','celeste','phoebe','elsie']){
  clearCosmetics(character);equipCosmetic('ivory-botanical-cap',character);
  assert.equal(cosmeticsState().equipped[character+'Headwear'],'ivory-botanical-cap');
  for(const file of ['ivory-botanical-cap.webp','ivory-botanical-cap-hide.webp']){
   const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/'+file,import.meta.url));
   assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');assert.ok(bytes.length>10000);
   if(file==='ivory-botanical-cap.webp')hashes.push(createHash('sha256').update(bytes).digest('hex'));
  }
 }
 assert.equal(new Set(hashes).size,5);
 const display=readFileSync(new URL('../assets/speaking-system/cosmetics/shared/ivory-botanical-cap-display.png',import.meta.url));
 assert.deepEqual([...display.subarray(0,8)],[137,80,78,71,13,10,26,10]);
});
test('the shearling lace boots have five independent feet-slot atlases and remain compatible with full-body clothing',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');const hashes=[];
 for(const character of ['eddy','noir','celeste','phoebe','elsie']){
  clearCosmetics(character);equipCosmetic('brown-shearling-lace-boots',character);
  assert.equal(cosmeticsState().equipped[character+'Feet'],'brown-shearling-lace-boots');
  const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/brown-shearling-lace-boots.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16);assert.ok(bytes.length>40000);hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,5);
 for(const character of ['eddy','noir','celeste','phoebe','elsie'])clearCosmetics(character);
 equipCosmetic('ivory-tiered-dress','elsie');equipCosmetic('brown-shearling-lace-boots','elsie');
 assert.deepEqual(cosmeticsState().equipped,{elsieFullBody:'ivory-tiered-dress',elsieFeet:'brown-shearling-lace-boots'});
 const thumb=readFileSync(new URL('../assets/speaking-system/cosmetics/shared/brown-shearling-lace-boots-display.png',import.meta.url));
 assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(thumb.readUInt32BE(16),512);assert.equal(thumb.readUInt32BE(20),512);assert.ok([4,6].includes(thumb[25]));
});
test('the boots migration registers all five independent feet slots',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync(new URL('../supabase/migrations/20261002124607_brown_shearling_lace_boots_all_characters.sql',import.meta.url),'utf8');
 assert.match(sql,/values \('brown-shearling-lace-boots','Brown shearling lace-up boots',35,true\)/);
 for(const character of ['eddy','noir','celeste','phoebe','elsie']){
  assert.match(sql,new RegExp("not\\(value\\?'"+character+"Feet'\\) or value->>'"+character+"Feet'='brown-shearling-lace-boots'"));
  assert.match(sql,new RegExp("p_character\\|\\|'Feet'"));
 }
});
test('the white oversized tee has five independent top-slot atlases and preserves headwear and feet',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');const hashes=[];
 for(const character of ['eddy','noir','celeste','phoebe','elsie']){
  clearCosmetics(character);equipCosmetic('white-oversized-tee',character);
  assert.equal(cosmeticsState().equipped[character+'Top'],'white-oversized-tee');
  const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/white-oversized-tee.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16);assert.ok(bytes.length>40000);hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,5);
 for(const character of ['eddy','noir','celeste','phoebe','elsie'])clearCosmetics(character);
 equipCosmetic('ivory-botanical-cap','elsie');equipCosmetic('brown-shearling-lace-boots','elsie');equipCosmetic('white-oversized-tee','elsie');
 assert.deepEqual(cosmeticsState().equipped,{elsieHeadwear:'ivory-botanical-cap',elsieFeet:'brown-shearling-lace-boots',elsieTop:'white-oversized-tee'});
 equipCosmetic('ivory-tiered-dress','elsie');
 assert.deepEqual(cosmeticsState().equipped,{elsieHeadwear:'ivory-botanical-cap',elsieFeet:'brown-shearling-lace-boots',elsieFullBody:'ivory-tiered-dress'});
 equipCosmetic('white-oversized-tee','elsie');
 assert.deepEqual(cosmeticsState().equipped,{elsieHeadwear:'ivory-botanical-cap',elsieFeet:'brown-shearling-lace-boots',elsieTop:'white-oversized-tee'});
 const thumb=readFileSync(new URL('../assets/speaking-system/cosmetics/shared/white-oversized-tee-display.png',import.meta.url));
 assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(thumb.readUInt32BE(16),512);assert.equal(thumb.readUInt32BE(20),512);assert.ok([4,6].includes(thumb[25]));
 clearCosmetics('elsie');
});
test('the white oversized tee migration registers all five independent top slots',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync(new URL('../supabase/migrations/20261002140131_white_oversized_tee_all_characters.sql',import.meta.url),'utf8');
 assert.match(sql,/values \('white-oversized-tee','White oversized crew-neck T-shirt',20,true\)/);
 for(const slot of ['eddyTop','noirTop','celesteTop','phoebeTop','elsieTop'])assert.match(sql,new RegExp("not\\(value\\?'"+slot+"'\\) or value->>'"+slot+"'.*'white-oversized-tee'"));
 for(const character of ['celeste','phoebe','elsie'])assert.match(sql,new RegExp("not\\(value\\?'"+character+"FullBody' and value\\?'"+character+"Top'\\)"));
});
test('the retro shirt trio is boys-only with independent Eddy and Noir atlases',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const ids=['black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt'];
 for(const id of ids){
  const hashes=[];
  for(const character of ['eddy','noir']){
   clearCosmetics(character);equipCosmetic(id,character);assert.equal(cosmeticsState().equipped[character+'Top'],id);
   const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/'+id+'.webp',import.meta.url));
   assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
   const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
   assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16);assert.ok(bytes.length>40000);hashes.push(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.notEqual(hashes[0],hashes[1]);
  const thumb=readFileSync(new URL('../assets/speaking-system/cosmetics/shared/'+id+'-display.png',import.meta.url));
  assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(thumb.readUInt32BE(16),512);assert.equal(thumb.readUInt32BE(20),512);assert.ok([4,6].includes(thumb[25]));
  for(const character of ['celeste','phoebe','elsie'])assert.equal((await import('../eddy-cosmetics.mjs')).cosmeticsForCharacter(character).some(item=>item.id===id),false);
 }
 for(const character of ['eddy','noir'])clearCosmetics(character);
});
test('the retro shirt migration registers all three catalog items in both boys top slots',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync(new URL('../supabase/migrations/20261002225000_boys_retro_shirt_trio.sql',import.meta.url),'utf8');
 for(const [id,name,price] of [
  ['black-ivory-retro-bowling-shirt','Black ivory retro bowling shirt',30],
  ['burgundy-hot-rod-bowling-shirt','Burgundy hot-rod bowling shirt',35],
  ['ivory-black-flame-shirt','Ivory black-flame camp shirt',30]
 ])assert.match(sql,new RegExp("\\('"+id+"','"+name+"',"+price+",true\\)"));
 for(const slot of ['top','eddyTop','noirTop'])for(const id of ['black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt'])assert.match(sql,new RegExp("value->>'"+slot+"'.*'"+id+"'"));
 for(const slot of ['celesteTop','phoebeTop','elsieTop'])assert.doesNotMatch(sql,new RegExp("value->>'"+slot+"'.*'black-ivory-retro-bowling-shirt'"));
});
test('the beige utility shirt is boys-only and the migration allows both boys slots',async()=>{
 const {readFileSync}=await import('node:fs');
 const {cosmeticsForCharacter}=await import('../eddy-cosmetics.mjs');
 const item=cosmeticsForCharacter('eddy').find(x=>x.id==='beige-utility-shirt');
 assert.equal(item?.slot,'top');
 assert.equal(item?.display,'shared/beige-utility-shirt-display.png');
 assert.equal(cosmeticsForCharacter('noir').some(x=>x.id===item.id),true);
 for(const character of ['celeste','phoebe','elsie'])
  assert.equal(cosmeticsForCharacter(character).some(x=>x.id===item.id),false);
 const sql=readFileSync(new URL('../supabase/migrations/20261002170119_beige_utility_shirt_eddy_noir.sql',import.meta.url),'utf8');
 assert.match(sql,/values \('beige-utility-shirt','Beige rolled-sleeve utility shirt',30,true\)/);
 for(const slot of ['top','eddyTop','noirTop'])
  assert.match(sql,new RegExp("value->>'"+slot+"'.*'beige-utility-shirt'"));
 for(const slot of ['celesteTop','phoebeTop','elsieTop'])
  assert.doesNotMatch(sql,new RegExp("value->>'"+slot+"'.*'beige-utility-shirt'"));
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
test('included full-body dresses never call the unavailable purchase catalog and save locally',async()=>{
 clearCosmetics('elsie');let savedArgs;
 rpcHandler=async(method,args)=>{
  if(method==='eddie_farm_owned_cosmetics')return {data:['cream-sherpa-jacket','pink-rain-jacket']};
  if(method==='character_closet_sync'){savedArgs=args;return {data:{equipped:{},outfits:[]}};}
  return {data:{equipped:{},outfits:[]}};
 };
 await restoreCosmetics(undefined,{force:true});
 assert.ok(cosmeticsState().owned.includes('camel-coat-dress'));
 assert.ok(cosmeticsState().owned.includes('ivory-tiered-dress'));
 equipCosmetic('ivory-tiered-dress','elsie');await saveAvatar(undefined,'elsie');
 assert.deepEqual(savedArgs.p_equipped,{});assert.deepEqual(savedArgs.p_outfits,[]);
 assert.equal(cosmeticsState().savedEquipment.elsieFullBody,'ivory-tiered-dress');
 assert.equal(cosmeticsState().equipped.elsieFullBody,'ivory-tiered-dress');
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
test('the sleeveless navy knit vest has three independent transparent 16-view overlays and a shallow-V shop image',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const hashes=[];
 for(const character of ['celeste','phoebe','elsie']){
  const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/navy-cream-knit-vest.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16);assert.ok(bytes.length>40000);hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,3);
 const thumb=readFileSync(new URL('../assets/speaking-system/cosmetics/girls/navy-cream-knit-vest-display.png',import.meta.url));
 assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.ok(thumb.readUInt32BE(16)>=1000);assert.ok(thumb.readUInt32BE(20)>=1000);assert.ok([4,6].includes(thumb[25]));
});
test('the vest release migration registers the item and all three independent top slots',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync(new URL('../supabase/migrations/20261002170000_girls_navy_cream_knit_vest.sql',import.meta.url),'utf8');
 assert.match(sql,/values \('navy-cream-knit-vest','Navy cream-trim knit vest',30,true\)/);
 for(const slot of ['celesteTop','phoebeTop','elsieTop'])assert.match(sql,new RegExp(slot+"'\\) or value->>'"+slot+"' in \\('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest'\\)"));
 for(const character of ['celeste','phoebe','elsie'])assert.match(sql,new RegExp("not\\(value\\?'"+character+"FullBody' and value\\?'"+character+"Top'\\)"));
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
test('the ivory asymmetric gown has three independent transparent 16-view overlays and a shop image',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 const hashes=[];
 for(const character of ['celeste','phoebe','elsie']){
  const bytes=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/ivory-tiered-dress.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16);assert.ok(bytes.length>60000);hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,3);
 const thumb=readFileSync(new URL('../assets/speaking-system/cosmetics/girls/ivory-tiered-dress-display.png',import.meta.url));
 assert.deepEqual([...thumb.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(thumb.readUInt32BE(16),509);assert.equal(thumb.readUInt32BE(20),768);assert.ok([4,6].includes(thumb[25]));
});
