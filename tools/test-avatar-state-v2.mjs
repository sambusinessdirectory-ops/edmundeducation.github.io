import test from 'node:test';
import assert from 'node:assert/strict';
let n=0;
async function fixture(handler){
 const cache=new Map();
 globalThis.localStorage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)};globalThis.sessionStorage={};
 const account={id:'id:student-a',token:'token-a'};
 globalThis.window={addEventListener(){},confirm:()=>true,EdmundSystemNav:{getStudentSession:()=>account},EDMUND_SUPABASE:{url:'fixture',anonKey:'fixture'},supabase:{createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async(_name,args)=>handler(args)})}};
 return {m:await import('../eddy-cosmetics.mjs?v2test='+ ++n),account,cache};
}
test('normalized shared identity beats a portal key and a failed restore is retryable',async()=>{
 let calls=0;const {m}=await fixture(async args=>{assert.equal(args.p_token,'token-a');return ++calls===1?{error:Error('offline')}:{data:{equipped:{top:'blue-swordsman-jacket'}}};});
 await m.restoreCosmetics('portal-specific-key');await m.restoreCosmetics('another-key');
 assert.equal(calls,2);assert.equal(m.cosmeticsState().owner,'student-a');assert.equal(m.cosmeticsState().savedEquipment.top,'blue-swordsman-jacket');
});
test('discard never saves a draft; cancel keeps it; a clean reversal needs no warning',async()=>{
 let writes=0;const {m}=await fixture(async args=>{if(args.p_equipped)writes++;return {data:{equipped:{top:'cream-cable-knit'}}};});await m.restoreCosmetics();m.beginCosmeticsPreview();m.equipCosmetic('blue-swordsman-jacket');
 window.confirm=message=>{assert.match(message,/previously saved avatar will remain unchanged/);return false;};assert.equal(m.confirmDiscardCosmetics(),false);assert.equal(m.cosmeticsState().equipped.top,'blue-swordsman-jacket');
 window.confirm=()=>true;assert.equal(m.confirmDiscardCosmetics(),true);assert.equal(m.cosmeticsState().equipped.top,'cream-cable-knit');assert.equal(writes,0);
 m.beginCosmeticsPreview();m.equipCosmetic('white-fedora');m.equipCosmetic('white-fedora');assert.equal(m.hasUnsavedCosmetics(),false);
});
test('saved default renderer ignores unsaved draft and failed save preserves saved state',async()=>{
 const {m}=await fixture(async args=>args.p_equipped?{error:Error('save failed')}:{data:{equipped:{}}});await m.restoreCosmetics();m.beginCosmeticsPreview();m.equipCosmetic('white-fedora');const base={naturalWidth:1};assert.equal(m.cosmeticAtlas('eddy',base),base);
 await assert.rejects(m.saveAvatar(),/save failed/);assert.deepEqual(m.cosmeticsState().savedEquipment,{});assert.equal(m.hasUnsavedCosmetics(),true);assert.equal(m.cosmeticsState().saving,false);
});
test('late server restore updates discard baseline without overwriting draft',async()=>{
 let finish;const {m}=await fixture(()=>new Promise(r=>finish=r));const p=m.restoreCosmetics();await new Promise(r=>setTimeout(r,0));m.beginCosmeticsPreview();m.equipCosmetic('white-fedora');finish({data:{equipped:{top:'charcoal-turtleneck'}}});await p;
 assert.equal(m.cosmeticsState().equipped.headwear,'white-fedora');m.discardCosmeticsPreview();assert.deepEqual(m.cosmeticsState().equipped,{top:'charcoal-turtleneck'});
});
