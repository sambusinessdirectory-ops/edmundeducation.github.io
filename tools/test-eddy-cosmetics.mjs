import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanEquipment,cleanWardrobe,equipCosmetic,equipOutfit,clearCosmetics,cosmeticsState,restoreCosmetics,saveAvatar} from '../eddy-cosmetics.mjs';
test('independent headwear/top slots allow only Eddy catalog items',()=>{
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
