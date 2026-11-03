// A standard image viewer sees the warning PNG. Only watermarked pixels are packed.
(()=>{
 const key=crypto.subtle.importKey('raw',Uint8Array.from(atob('Y+pZYENE1hrEw5XkJOMLHoWvAaJa3Ek82wq71jjqUqo='),c=>c.charCodeAt(0)),{name:'AES-GCM'},false,['decrypt']);
 const cache=new Map();
 function load(n){if(!cache.has(n))cache.set(n,(async()=>{
 const r=await fetch('/protected-reviews/'+n+'.png');if(!r.ok)throw Error('review');const bytes=new Uint8Array(await r.arrayBuffer()),offset=13763;
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(offset,offset+12)},await key,bytes.slice(offset+12));
 const url=URL.createObjectURL(new Blob([plain],{type:'image/webp'}));try{const im=new Image();im.src=url;await im.decode();return im;}finally{URL.revokeObjectURL(url);}
 })().catch(e=>{cache.delete(n);throw e;}));return cache.get(n);}
 async function paint(el){try{const im=await load(el.dataset.reviewCanvas);el.width=im.naturalWidth;el.height=im.naturalHeight;el.getContext('2d').drawImage(im,0,0);}catch{el.replaceWith(document.createTextNode('評價圖片未能載入，請重新整理。'));}}
 function start(){const obs='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){obs.unobserve(e.target);paint(e.target);}},{rootMargin:'300px'}):null;document.querySelectorAll('[data-review-canvas]').forEach(c=>obs?obs.observe(c):paint(c));}
 for(const evt of ['contextmenu','dragstart'])document.addEventListener(evt,e=>{if(e.target.closest('.protected-review'))e.preventDefault()});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
