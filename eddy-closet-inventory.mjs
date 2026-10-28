import {cosmeticsForCharacter,outfitsForCharacter,isCosmeticEquipped,wardrobeGroup,cosmeticAsset,cosmeticsState,equipCosmetic,previewCosmetic,unownedPreviewItems,equipOutfit,clearCosmetics,saveAvatar,restoreCosmetics,subscribeCosmetics,toggleOutfitFavorite} from './eddy-cosmetics.mjs?v=20261028-free-try-on1';
export function mountClosetInventory(host,signal,{character='eddy'}={}){
 host.innerHTML='<p class="expression-closet-inventory-kicker">EDDIE’S COLLECTION</p><h3 id="expression-closet-inventory-title">Inventory <small>物品欄</small></h3><p class="closet-coin-balance" data-closet-coins>🪙 Coins · 金幣：<strong>…</strong></p><p data-shop-status role="status" aria-live="polite"></p><button type="button" data-shop-retry hidden>Retry · 重新載入</button><p class="closet-try-on-help">Try on any item for free. Only the Buy button spends coins.<br>點選服裝即可免費試穿；只有按「購買」才會扣除金幣。</p><div class="closet-equipment-grid"></div><div class="closet-outfit-actions"><button type="button" data-save-avatar>✦ Save avatar · 儲存造型</button><button type="button" data-remove-outfit>↺ Remove all · 全部脫下</button></div><form data-outfit-form><label for="closet-outfit-name">Name this outfit · 造型名稱</label><input id="closet-outfit-name" maxlength="60" required placeholder="My favourite outfit" autocomplete="off"><button type="submit">＋ Save outfit set · 儲存套裝</button></form><h4>My outfit sets · 我的套裝</h4><div data-outfit-sets></div><p class="closet-save-status" role="status" aria-live="polite"></p>';
 host.querySelector('.expression-closet-inventory-kicker').textContent=character.toUpperCase()+'’S COLLECTION';
 const grid=host.querySelector('.closet-equipment-grid'),status=host.querySelector('.closet-save-status'),sets=host.querySelector('[data-outfit-sets]'),coinValue=host.querySelector('[data-closet-coins] strong');
 const buttons=[];
 let shopBalance=null,purchasing=false,shopItems=new Map();
 const showBalance=value=>{shopBalance=value===null||value===undefined?null:Number(value);coinValue.textContent=shopBalance===null||!Number.isFinite(shopBalance)?'—':shopBalance.toLocaleString();};
 const showCatalog=snapshot=>{shopItems=new Map((snapshot?.cosmetics||[]).map(item=>[item.id,item]));showBalance(snapshot?.balance);render();};
 const shopStatus=host.querySelector('[data-shop-status]'),retry=host.querySelector('[data-shop-retry]');
 let refreshing=false;
 async function refreshBalance(){
  if(refreshing||signal.aborted)return;
  refreshing=true;retry.hidden=true;shopStatus.textContent='Loading wardrobe… · 正在載入衣櫥…';
  try{
   // The wardrobe is also opened by portals that do not load the farm script.
   if(!window.EddieFarmAPI)await import('./eddie-farm-api.js?v=20260928-closet-shop1');
   if(signal.aborted)return;
   const api=window.EddieFarmAPI;
   if(!api?.student()?.token){showCatalog(null);shopStatus.textContent='Sign in to shop · 登入後可購買服裝';return;}
   const snapshot=await api.snapshot();
   if(signal.aborted)return;
   if(!snapshot)throw Error('Please sign in again · 請重新登入');
   showCatalog(snapshot);await restoreCosmetics(undefined,{force:true});
   if(!signal.aborted)shopStatus.textContent='';
  }catch(error){if(!signal.aborted){showCatalog(null);shopStatus.textContent=error.message||'Could not load wardrobe · 衣櫥載入失敗';retry.hidden=false;}}
  finally{refreshing=false;}
 }
 retry.addEventListener('click',refreshBalance,{signal});
 const display={
  'blue-swordsman-jacket':'jacket-display.png',
  'brown-leather-bomber':'brown-leather-bomber-display.png',
  'sunburst-hoodie':'sunburst-hoodie-display.png',
  'black-blazer-hoodie':'black-blazer-hoodie-display.png'
 };
 for(const item of cosmeticsForCharacter(character)){
  const button=document.createElement('button');button.type='button';button.className='expression-closet-item';button.dataset.cosmetic=item.id;
  const image=document.createElement('img');image.src=item.display?new URL('./assets/speaking-system/cosmetics/'+item.display,import.meta.url).href:item.slot==='top'?new URL('./assets/speaking-system/cosmetics/eddy/'+(display[item.id]||'sweaters-display.png'),import.meta.url).href:cosmeticAsset(item.id+'-icon');image.alt='';image.draggable=false;
  const title=document.createElement('strong');title.textContent=item.name;
  const description=document.createElement('small');description.textContent=item.description;
  const state=document.createElement('span');state.className='closet-equipped-status';
  const picture=document.createElement('span');picture.className='closet-item-picture '+item.id;picture.append(image);button.append(picture,title,description,state);
  const card=document.createElement('div');card.className='closet-shop-card';
  const buy=document.createElement('button');buy.type='button';buy.className='closet-buy-button';buy.dataset.buyCosmetic=item.id;
  card.append(button,buy);grid.append(card);buttons.push([item,button,state,buy]);
  button.addEventListener('click',()=>{
   if(busy||purchasing)return;
   const owned=cosmeticsState().owned.includes(item.id);
   if(owned)equipCosmetic(item.id,character);else previewCosmetic(item.id,character);
   status.textContent=owned?'Preview updated. Save avatar to keep this look. · 儲存後套用至所有地圖':'Free preview — no coins spent. Buy this item to keep it. · 免費試穿，未扣除金幣；喜歡才購買。';
  },{signal});
  buy.addEventListener('click',async()=>{
   const data=cosmeticsState(),api=window.EddieFarmAPI,account=api?.student();
   if(busy||purchasing||data.owned.includes(item.id)||!isCosmeticEquipped(data.equipped,item,character))return;
   if(!account?.token){status.textContent='Sign in to buy this item with Edmund Coins. · 請先登入以金幣購買造型。';return;}
   const price=shopItems.get(item.id)?.price??item.price;
   if(!Number.isFinite(shopBalance)||shopBalance<price){status.textContent='Not enough coins. You can still try it on for free. · 金幣不足，仍可免費試穿。';return;}
   purchasing=true;render();status.textContent=`Buying ${item.name}… · 購買中…`;
   const sameAccount=()=>api.student()?.token===account.token;
   try{
    const snapshot=await api.perform('cosmetic',{p_item:item.id});
    if(signal.aborted||!sameAccount())return;
    showCatalog(snapshot);
    await restoreCosmetics(undefined,{force:true});
    if(signal.aborted||!sameAccount())return;
    // The item is already on the preview avatar. Do not toggle it off after buying.
    status.textContent=cosmeticsState().owned.includes(item.id)?`${item.name} purchased. Save avatar to keep this look. · 已購買，請儲存造型。`:'Purchase received. Refresh the wardrobe to verify ownership before saving. · 請重新載入衣櫥確認購買狀態。';
   }catch(error){if(!signal.aborted&&sameAccount()){status.textContent=error.message||'Purchase failed. Please try again.';await refreshBalance();}}
   finally{purchasing=false;if(!signal.aborted)render();}
  },{signal});
 }
 let busy=false,lastSets='';
 const render=()=>{
  const data=cosmeticsState();data.outfits=outfitsForCharacter(data.outfits,character);
  for(const [item,button,state,buy] of buttons){
   const yes=isCosmeticEquipped(data.equipped,item,character),owned=data.owned.includes(item.id),price=shopItems.get(item.id)?.price??item.price;
   button.setAttribute('aria-pressed',String(yes));button.disabled=purchasing||busy;
   state.textContent=yes?(owned?'✓ Equipped · 已裝備':'✓ Trying on · 試穿中'):owned?'Equip · 裝備':'Try on free · 免費試穿';
   buy.hidden=owned;
   const affordable=Number.isFinite(shopBalance)&&shopBalance>=price;
   buy.disabled=purchasing||busy||!yes||!affordable;
   buy.textContent=`Buy · 購買 ${price} coins`;
   buy.setAttribute('aria-label',`Buy ${item.name} for ${price} coins · 購買`);
   buy.title=!yes?'Try this item on first · 請先點選服裝試穿':!affordable?'Not enough coins · 金幣不足':'';
  }
  const trial=unownedPreviewItems(character).length>0;
  host.querySelector('[data-save-avatar]').disabled=busy||purchasing||trial;
  host.querySelector('[data-outfit-form] button').disabled=busy||purchasing||trial;
  host.querySelector('[data-save-avatar]').title=trial?'Buy or remove preview items before saving · 請先購買或脫下試穿服裝':'';

  const serialized=JSON.stringify(data.outfits);
  if(serialized!==lastSets){lastSets=serialized;sets.replaceChildren();if(!data.outfits.length)sets.textContent='No saved sets yet · 尚未儲存套裝';
   for(const outfit of [...data.outfits].sort((a,b)=>Number(b.favorite)-Number(a.favorite))){const button=document.createElement('button');button.type='button';button.textContent=outfit.name;button.dataset.outfit=outfit.name;const row=document.createElement('div');row.className='closet-saved-set';const heart=document.createElement('button');heart.type='button';heart.dataset.favorite=outfit.name;heart.textContent=outfit.favorite?'♥':'♡';heart.setAttribute('aria-label',(outfit.favorite?'Unfavorite ':'Favorite ')+outfit.name);heart.setAttribute('aria-pressed',String(!!outfit.favorite));row.append(button,heart);sets.append(row);}
  }
 };
 async function save(name){if(busy||purchasing)return;busy=true;host.querySelectorAll('button,input').forEach(e=>e.disabled=true);status.textContent='Saving… · 儲存中';
  try{await saveAvatar(name,character);status.textContent='Saved to your account. '+(wardrobeGroup(character)==='girls'?character.charAt(0).toUpperCase()+character.slice(1):character.charAt(0).toUpperCase()+character.slice(1))+' will wear this outfit across all maps. · 已儲存';}
  catch(error){status.textContent=error.message||'Could not save. Please try again.';}
  finally{busy=false;if(!signal.aborted){host.querySelectorAll('button,input').forEach(e=>e.disabled=false);render();}}
 }
 sets.addEventListener('click',event=>{const heart=event.target.closest('[data-favorite]');if(heart&&!busy&&!purchasing){busy=true;heart.disabled=true;toggleOutfitFavorite(heart.dataset.favorite,character).then(()=>{status.textContent='Favorites saved · 已儲存最愛';}).catch(e=>{status.textContent=e.message;}).finally(()=>{busy=false;heart.disabled=false;render();});return;}const button=event.target.closest('[data-outfit]');if(button&&!busy&&!purchasing){equipOutfit(button.dataset.outfit,character);void save();}},{signal});
 host.querySelector('[data-save-avatar]').addEventListener('click',()=>void save(),{signal});
 host.querySelector('[data-remove-outfit]').addEventListener('click',()=>{if(busy||purchasing)return;clearCosmetics(character);status.textContent='All items removed. Save avatar to keep this look.';},{signal});
 host.querySelector('form').addEventListener('submit',event=>{event.preventDefault();void save(host.querySelector('input').value);},{signal});
 const unsubscribe=subscribeCosmetics(render);signal.addEventListener('abort',unsubscribe,{once:true});render();void restoreCosmetics();void refreshBalance();
 window.addEventListener('focus',refreshBalance,{signal});window.addEventListener('edmund-coin-wallet-refresh',refreshBalance,{signal});
}
