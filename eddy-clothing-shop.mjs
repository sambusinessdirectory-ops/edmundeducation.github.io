import {mountClosetInventory} from './eddy-closet-inventory.mjs?v=20260928-emerald-shop1';

// Use the same account, catalogue and purchase flow as the dressing room.
export function openClothingShop({character='eddy',signal}={}) {
 if(signal?.aborted)return;
 if(!document.querySelector('link[data-clothing-shop-style]')){
  const style=document.createElement('link');style.rel='stylesheet';style.dataset.clothingShopStyle='';
  style.href=new URL('./eddy-clothing-shop.css?v=20260928-emerald-shop1',import.meta.url).href;document.head.append(style);
 }
 const dialog=document.createElement('dialog');dialog.className='eddy-clothing-shop';
 dialog.setAttribute('aria-labelledby','clothing-shop-title');
 dialog.innerHTML='<header class="clothing-shop-header"><div><p>EDMUND ATELIER</p><h2 id="clothing-shop-title">服裝商店</h2></div><button type="button" data-close-shop aria-label="返回衣櫥">返回衣櫥 ×</button></header><div class="clothing-shop-catalog expression-closet-inventory"></div>';
 document.body.append(dialog);
 const controller=new AbortController();
 const close=()=>{controller.abort();dialog.close();dialog.remove();signal?.removeEventListener('abort',close);};
 signal?.addEventListener('abort',close,{once:true});
 dialog.querySelector('[data-close-shop]').addEventListener('click',close,{signal:controller.signal});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();},{signal:controller.signal});
 mountClosetInventory(dialog.querySelector('.clothing-shop-catalog'),controller.signal,{character,shop:true});
 dialog.querySelector('h3').id='clothing-shop-inventory-title';
 dialog.querySelector('input').id='clothing-shop-outfit-name';
 dialog.querySelector('label').htmlFor='clothing-shop-outfit-name';
 dialog.showModal();
 return {close};
}
