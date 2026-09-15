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
 assert.deepEqual(COSMETIC_CHARACTERS,['eddy','noir']);assert.equal(supportsCosmetics('celeste'),false);
 for(const item of [...COSMETICS.map(x=>x.id),'hat-hide']){
  const hashes=COSMETIC_CHARACTERS.map(character=>{const b=readFileSync(new URL('../assets/speaking-system/cosmetics/'+character+'/'+item+'.webp',import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.ok(b.length>500,item+' '+character+' must contain fitted artwork');return createHash('sha256').update(b).digest('hex');});
  assert.notEqual(hashes[0],hashes[1],item+' must be fitted separately for both characters');
 }
});
