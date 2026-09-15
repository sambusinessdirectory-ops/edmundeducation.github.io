import {COSMETICS,cosmeticAsset,cosmeticsState,equipCosmetic,equipOutfit,clearCosmetics,saveAvatar,restoreCosmetics,subscribeCosmetics} from './eddy-cosmetics.mjs?v=20260915-fitting2';
export function mountClosetInventory(host,signal){
 host.innerHTML='<p class="expression-closet-inventory-kicker">EDDIE’S COLLECTION</p><h3 id="expression-closet-inventory-title">Inventory <small>物品欄</small></h3><p>Combine one hat and one top. Save your avatar to wear it across all maps.</p><div class="closet-equipment-grid"></div><div class="closet-outfit-actions"><button type="button" data-save-avatar>Save avatar · 儲存造型</button><button type="button" data-remove-outfit>Remove all · 全部脫下</button></div><form data-outfit-form><label for="closet-outfit-name">Name this outfit · 造型名稱</label><input id="closet-outfit-name" maxlength="60" required placeholder="My favourite outfit" autocomplete="off"><button type="submit">Save outfit set · 儲存套裝</button></form><h4>My outfit sets · 我的套裝</h4><div data-outfit-sets></div><p class="closet-save-status" role="status" aria-live="polite"></p>';
 const grid=host.querySelector('.closet-equipment-grid'),status=host.querySelector('[role=status]'),sets=host.querySelector('[data-outfit-sets]');
 const buttons=[];
 for(const item of COSMETICS){
  const button=document.createElement('button');button.type='button';button.className='expression-closet-item';button.dataset.cosmetic=item.id;
  const image=document.createElement('img');image.src=cosmeticAsset(item.id+'-icon');image.alt='';image.draggable=false;
  const title=document.createElement('strong');title.textContent=item.name;
  const description=document.createElement('small');description.textContent=item.description;
  const state=document.createElement('span');state.className='closet-equipped-status';
  button.append(image,title,description,state);grid.append(button);buttons.push([item,button,state]);
  button.addEventListener('click',()=>{equipCosmetic(item.id);status.textContent='Preview updated. Save avatar to keep this look. · 儲存後套用至所有地圖';},{signal});
 }
 let busy=false,lastSets='';
 const render=()=>{
  const data=cosmeticsState();
  for(const [item,button,state] of buttons){const yes=data.equipped[item.slot]===item.id;button.setAttribute('aria-pressed',String(yes));state.textContent=yes?'✓ Equipped · 已裝備':'Equip · 裝備';}
  const serialized=JSON.stringify(data.outfits);
  if(serialized!==lastSets){lastSets=serialized;sets.replaceChildren();if(!data.outfits.length)sets.textContent='No saved sets yet · 尚未儲存套裝';
   for(const outfit of data.outfits){const button=document.createElement('button');button.type='button';button.textContent=outfit.name;button.dataset.outfit=outfit.name;sets.append(button);}
  }
 };
 async function save(name){if(busy)return;busy=true;host.querySelectorAll('button,input').forEach(e=>e.disabled=true);status.textContent='Saving… · 儲存中';
  try{await saveAvatar(name);status.textContent='Saved to your account. Eddy will wear this outfit across all maps. · 已儲存';}
  catch(error){status.textContent=error.message||'Could not save. Please try again.';}
  finally{busy=false;if(!signal.aborted){host.querySelectorAll('button,input').forEach(e=>e.disabled=false);render();}}
 }
 sets.addEventListener('click',event=>{const button=event.target.closest('[data-outfit]');if(button&&!busy){equipOutfit(button.dataset.outfit);void save();}},{signal});
 host.querySelector('[data-save-avatar]').addEventListener('click',()=>void save(),{signal});
 host.querySelector('[data-remove-outfit]').addEventListener('click',()=>{clearCosmetics();status.textContent='All items removed. Save avatar to keep this look.';},{signal});
 host.querySelector('form').addEventListener('submit',event=>{event.preventDefault();void save(host.querySelector('input').value);},{signal});
 const unsubscribe=subscribeCosmetics(render);signal.addEventListener('abort',unsubscribe,{once:true});render();void restoreCosmetics();
}
