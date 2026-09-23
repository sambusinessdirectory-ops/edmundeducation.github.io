import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanEquipment,cleanWardrobe,equipCosmetic,equipOutfit,clearCosmetics,cosmeticsState,restoreCosmetics,saveAvatar} from '../eddy-cosmetics.mjs';
test('independent headwear/top slots allow shared Eddy and Noir catalog items',()=>{
 clearCosmetics();equipCosmetic('white-fedora');equipCosmetic('cream-cable-knit');
 assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora',top:'cream-cable-knit'});
 equipCosmetic('charcoal-turtleneck');assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora',top:'charcoal-turtleneck'});
 equipCosmetic('unknown');assert.equal(cosmeticsState().equipped.top,'charcoal-turtleneck');
 equipCosmetic('white-fedora');assert.deepEqual(cosmeticsState().equipped,{top:'charcoal-turtleneck'});
 clearCosmetics();assert.deepEqual(cosmeticsState().equipped,{});
 assert.deepEqual(cleanEquipment({headwear:'cream-cable-knit',top:'white-fedora',unknown:'x'}),{});
});
test('malformed saved outfits are bounded and cannot add unowned item types',()=>{
 assert.deepEqual(cleanWardrobe({outfits:[null,{name:' '},{name:'  Winter  ',equipped:{top:'charcoal-turtleneck',headwear:'bad'}}]}).outfits,[{name:'Winter',equipped:{top:'charcoal-turtleneck'}}]);
 assert.equal(cleanWardrobe({outfits:Array.from({length:100},()=>({name:'x'.repeat(100)}))}).outfits.length,50);
 assert.equal(cleanWardrobe({outfits:[{name:'x'.repeat(100)}]}).outfits[0].name.length,60);
});
test('stale restore cannot overwrite an edit or another student',async()=>{
 const cache=new Map();globalThis.localStorage={getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)};globalThis.sessionStorage={};
 let account={id:'student-a',token:'token-a'},resolve;
 globalThis.window={EdmundSystemNav:{getStudentSession:()=>account},EDMUND_SUPABASE:{url:'fixture',anonKey:'fixture'},supabase:{createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:()=>new Promise(r=>resolve=r)})}};
 const pending=restoreCosmetics();await new Promise(r=>setTimeout(r,0));equipCosmetic('white-fedora');
 resolve({data:{equipped:{top:'cream-cable-knit'},outfits:[]}});await pending;
 assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora'});
 const saving=saveAvatar();await new Promise(r=>setTimeout(r,0));const old=resolve;
 account={id:'student-b',token:''};await restoreCosmetics();
 old({data:{equipped:{headwear:'white-fedora'},outfits:[]}});
 await assert.rejects(saving,/account changed/);assert.deepEqual(cosmeticsState().equipped,{});
 await assert.rejects(saveAvatar(),/sign in/);equipOutfit('not found');assert.deepEqual(cosmeticsState().equipped,{});
});

test('swordsman jacket replaces a top, preserves a hat, and remains an allowed saved item',()=>{
 clearCosmetics();equipCosmetic('white-fedora');equipCosmetic('cream-cable-knit');
 equipCosmetic('blue-swordsman-jacket');
 assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora',top:'blue-swordsman-jacket'});
 assert.deepEqual(cleanWardrobe({outfits:[{name:'Swordsman',equipped:cosmeticsState().equipped}]}).outfits,
  [{name:'Swordsman',equipped:{headwear:'white-fedora',top:'blue-swordsman-jacket'}}]);
 assert.deepEqual(cleanEquipment({headwear:'blue-swordsman-jacket'}),{});
 equipCosmetic('blue-swordsman-jacket');assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora'});
 clearCosmetics();
});

test('new shared tops occupy the existing slot and survive saved-set cleaning',()=>{
 for(const id of ['brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie']){
  clearCosmetics();equipCosmetic('white-fedora');equipCosmetic(id);
  assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora',top:id});
  assert.deepEqual(cleanWardrobe({equipped:cosmeticsState().equipped,outfits:[{name:id,equipped:cosmeticsState().equipped}]}).outfits[0].equipped,{headwear:'white-fedora',top:id});
 }
 clearCosmetics();
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
 assert.deepEqual(cosmeticsState().equipped,{headwear:'white-fedora',top:'blue-swordsman-jacket',elsieTop:'pink-rain-jacket'});
 for(const c of ['celeste','phoebe','elsie'])assert.deepEqual(cosmeticsForCharacter(c).map(x=>x.id),['cream-sherpa-jacket','pink-rain-jacket']);
 clearCosmetics('phoebe');assert.equal(cosmeticsState().equipped.elsieTop,'pink-rain-jacket');
 equipCosmetic('cream-sherpa-jacket','phoebe');clearCosmetics('elsie');
 assert.equal(cosmeticsState().equipped.phoebeTop,'cream-sherpa-jacket');assert.equal(cosmeticsState().equipped.elsieTop,undefined);assert.equal(cosmeticsState().equipped.celesteTop,undefined);
 for(const c of ['eddy','celeste','phoebe','elsie'])clearCosmetics(c);
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
 const {createRequire}=await import('node:module');let sharp;try{sharp=createRequire(import.meta.url)('sharp');}catch{}
 const hashes=[];
 for(const character of ['celeste','phoebe','elsie']){
  const file=new URL('../assets/speaking-system/cosmetics/'+character+'/pink-rain-jacket.webp',import.meta.url),bytes=readFileSync(file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length);assert.equal(bytes.toString('ascii',12,16),'VP8L');assert.equal(bytes[20],0x2f);
  const width=1+bytes[21]+((bytes[22]&63)<<8),height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);
  assert.equal(width,1024);assert.equal(height,1024);assert.ok(bytes[24]&16,'the WebP sprite sheet must have alpha');assert.ok(bytes.length>100000);
  if(sharp){const raw=await sharp(bytes).ensureAlpha().raw().toBuffer();for(let cell=0;cell<16;cell++){let count=0;for(let y=Math.floor(cell/4)*256;y<(Math.floor(cell/4)+1)*256;y++)for(let x=(cell%4)*256;x<(cell%4+1)*256;x++)if(raw[(y*1024+x)*4+3])count++;assert.ok(count>100,character+' cell '+cell+' must contain its fitted garment');}}
  hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,3);
 const display=new URL('../assets/speaking-system/cosmetics/girls/pink-rain-jacket-display.png',import.meta.url),thumb=readFileSync(display);
 const displayMeta=await sharp(thumb).metadata();assert.equal(displayMeta.width,1254);assert.equal(displayMeta.height,1254);assert.equal(displayMeta.hasAlpha,true);
 const alpha=await sharp(thumb).ensureAlpha().raw().toBuffer();let transparent=0;for(let i=3;i<alpha.length;i+=4)if(alpha[i]<10)transparent++;assert.ok(transparent>thumb.length/5,'inventory thumbnail keeps a transparent background');
});
