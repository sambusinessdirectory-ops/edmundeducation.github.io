// Keep pointer movement outside React state so the card follows the finger directly.
export function swipeMark(dx,dy,width,elapsed=Infinity){
  if(Math.abs(dx)<=Math.abs(dy)*1.1)return null;
  const distance=Math.min(64,Math.max(32,width*.12));
  const flick=Math.abs(dx)>=28&&Math.abs(dx)/Math.max(1,elapsed)>=.5;
  return Math.abs(dx)>=distance||flick?(dx>0?'green':'red'):null;
}
export function attachCardSwipe(node,onMark){
  let gesture=null,active=true,busy=false,suppressUntil=0,animation=null;
  const view=node.ownerDocument.defaultView;
  const transform=x=>`translate3d(${x}px,0,0) rotate(${Math.max(-7,Math.min(7,x/35))}deg)`;
  function reset(){node.classList.remove('is-dragging','is-swiping');node.style.removeProperty('transform');delete node.dataset.swipe;}
  function release(id){try{if(node.hasPointerCapture(id))node.releasePointerCapture(id);}catch{}}
  function down(event){
    if(event.pointerType==='touch'&&'ontouchstart' in view)return;
    if(!active||busy||event.button!==0||event.isPrimary===false||event.target.closest('button,a,input,select,textarea'))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,at:event.timeStamp,width:node.getBoundingClientRect().width,axis:null};
  }
  function move(event){
    const g=gesture;if(!g||event.pointerId!==g.id)return;
    const dx=event.clientX-g.x,dy=event.clientY-g.y;
    if(!g.axis){
      if(Math.hypot(dx,dy)<10)return;
      if(Math.abs(dy)>18&&Math.abs(dy)>Math.abs(dx)*1.3){gesture=null;suppressUntil=Date.now()+400;return;}
      if(Math.abs(dx)<Math.abs(dy)*1.15)return;
      g.axis='horizontal';node.classList.add('is-dragging');
      if(typeof g.id==='number')try{node.setPointerCapture(g.id);}catch{}
    }
    if(event.cancelable)event.preventDefault();
    suppressUntil=Date.now()+500;
    node.dataset.swipe=dx>=0?'green':'red';node.style.transform=transform(dx);
  }
  function cancel(event){
    // Touch starts with implicit capture on the text child. Moving capture to
    // the card emits a bubbling lost event for that child, not a cancellation.
    if(event.type==='lostpointercapture'&&event.target!==node)return;
    if(!gesture||event.pointerId!==gesture.id)return;
    const id=gesture.id;gesture=null;suppressUntil=Date.now()+500;reset();release(id);
  }
  function up(event){
    const g=gesture;if(!g||event.pointerId!==g.id)return;
    gesture=null;release(g.id);
    if(!g.axis)return;
    suppressUntil=Date.now()+600;
    const dx=event.clientX-g.x,dy=event.clientY-g.y,mark=swipeMark(dx,dy,g.width,event.timeStamp-g.at);
    node.classList.remove('is-dragging');
    if(!mark){reset();return;}
    busy=true;node.classList.add('is-swiping');
    const finish=()=>{if(!active||!busy)return;busy=false;reset();onMark(mark);};
    const reduced=view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduced||!node.animate){finish();return;}
    const exit=(mark==='green'?1:-1)*(view.innerWidth+g.width);
    animation=node.animate([{transform:transform(dx),opacity:1},{transform:transform(exit),opacity:0}],{duration:180,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
    animation.finished.then(finish,()=>{});
  }
  function touch(event){
    if(event.type==='touchstart'&&event.touches.length!==1)return;
    const point=[...event.changedTouches].find(t=>event.type==='touchstart'||gesture?.id==='touch:'+t.identifier);
    if(!point)return;
    const input={type:event.type,target:event.target,button:0,isPrimary:true,pointerId:'touch:'+point.identifier,clientX:point.clientX,clientY:point.clientY,timeStamp:event.timeStamp,cancelable:event.cancelable,preventDefault:()=>event.preventDefault()};
    if(event.touches.length>1){cancel(input);return;}
    if(event.type==='touchstart')down(input);
    else if(event.type==='touchmove')move(input);
    else if(event.type==='touchend')up(input);
    else cancel(input);
  }
  const touchEvents=['touchstart','touchmove','touchend','touchcancel'];
  touchEvents.forEach(name=>node.addEventListener(name,touch,{passive:false}));
  function click(event){if(busy||Date.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}}
  const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel]];
  listeners.forEach(([name,fn])=>node.addEventListener(name,fn,{passive:false}));node.addEventListener('click',click,true);
  return()=>{active=false;gesture=null;busy=false;animation?.cancel();reset();touchEvents.forEach(name=>node.removeEventListener(name,touch));listeners.forEach(([name,fn])=>node.removeEventListener(name,fn));node.removeEventListener('click',click,true);};
}
