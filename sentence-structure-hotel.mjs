import {HOTEL_OFFSET,HOTEL_HEIGHT,HOTEL_SCALE,HOTEL_ROOMS,hotelCompanionVisible} from './sentence-structure-hotel-geometry.mjs?v=20260914-hotel3';
import {makeHotelPlate,createHotelScenery,createHotelEffects} from './sentence-structure-hotel-scenery.mjs?v=20260914-hotel3';
import {createHotelElevator} from './sentence-structure-hotel-elevator.mjs?v=20260914-hotel3';
const ART='./assets/sentence-structure/hotel/';
export function hotelTerrain(){return `<div class="sentence-hotel-realm" style="top:${HOTEL_OFFSET}px;height:${HOTEL_HEIGHT}px" aria-hidden="true"><img class="hotel-background" src="${ART}reference.png" width="1402" height="1122" alt=""><canvas class="hotel-scenery" width="1402" height="1122"></canvas><canvas class="hotel-elevator" hidden></canvas><div class="hotel-train-layer"></div><canvas class="hotel-effects" width="1402" height="1122"></canvas><div class="hotel-road-sign"><span>150 Rooms</span><span>The Grand English Hotel</span></div><canvas class="hotel-companion-card" width="140" height="94"></canvas><div class="hotel-companion-portrait"><canvas width="74" height="96"></canvas><span>Eddie</span></div></div>`;}
export function decorateHotelDoors(root){
 const buttons=[...root.querySelectorAll('.expression-map-stone')];
 for(const room of HOTEL_ROOMS)for(const i of room.indices){const button=buttons[i];if(!button)continue;button.dataset.hotel='true';button.dataset.hotelRoom=String(room.room);button.dataset.hotelLabel=room.indices.map(i=>i+1).join(' · ');button.classList.toggle('hotel-door-secondary',i!==room.indices[0]);button.tabIndex=i===room.indices[0]?0:-1;}
}
export function mountHotel(root,reduced){
 let disposed=false,elapsed=0,last=0,scenery,effects,elevator,ready=false,lastRoom='',lastCharacter='',lastLiftKey='';
 const viewport=root.querySelector('.expression-map-viewport'),background=root.querySelector('.hotel-background'),canvas=root.querySelector('.hotel-scenery'),fx=root.querySelector('.hotel-effects'),horse=root.querySelector('.expression-map-horse'),shadow=root.querySelector('.expression-map-shadow'),picker=root.querySelector('.expression-map-picker select'),popup=root.querySelector('.expression-map-lesson-card');
 const choices=document.createElement('div');choices.className='hotel-room-lessons';choices.hidden=true;choices.setAttribute('role','group');choices.setAttribute('aria-label','這個房間的課題 · Lessons in this room');popup.prepend(choices);
 const abort=new AbortController();
 root.dataset.hotelReady='false';
 const liftCanvas=root.querySelector('.hotel-elevator');
 // Clamp manual panning to this artwork whenever the hotel is in view.
 // Other realms retain their wider illustrated camera padding.
 function constrainCamera(){
  const s=Number(root.dataset.scale)||1,top=HOTEL_OFFSET*s,bottom=(HOTEL_OFFSET+HOTEL_HEIGHT)*s;
  if(viewport.scrollTop+viewport.clientHeight<=top||viewport.scrollTop>=bottom)return;
  const left=parseFloat(root.querySelector('.expression-map-world').style.left)||0,width=1600*s;
  const wanted=width<=viewport.clientWidth?left+(width-viewport.clientWidth)/2:Math.max(left,Math.min(left+width-viewport.clientWidth,viewport.scrollLeft));
  if(Math.abs(viewport.scrollLeft-wanted)>.5)viewport.scrollLeft=wanted;
 }
 viewport.addEventListener('scroll',constrainCamera,{passive:true,signal:abort.signal});
 const currentPosition=()=>({x:parseFloat(horse.style.left)||0,y:(parseFloat(horse.style.top)||0)+12});
 choices.addEventListener('click',event=>{const b=event.target.closest('[data-hotel-lesson]');if(!b)return;event.stopPropagation();picker.value=b.dataset.hotelLesson;picker.dispatchEvent(new Event('change',{bubbles:true}));},{signal:abort.signal});
 function update(){
  const p={x:parseFloat(horse.style.left)||0,y:(parseFloat(horse.style.top)||0)+12};
  const inHotel=p.y>=HOTEL_OFFSET;horse.classList.toggle('hotel-companion',inHotel);shadow.classList.toggle('hotel-companion-shadow',inHotel);horse.classList.toggle('hotel-in-service-passage',!hotelCompanionVisible(p));shadow.classList.toggle('hotel-in-service-passage',!hotelCompanionVisible(p));
  const index=Number(picker.value.slice(2))-1,room=HOTEL_ROOMS.find(r=>r.indices.includes(index));
  const key=room?`${room.room}:${index}`:'';
  if(key!==lastRoom){lastRoom=key;choices.replaceChildren();choices.hidden=!room||room.indices.length<2;root.querySelectorAll('[data-hotel]').forEach(b=>b.dataset.hotelActive=String(room?.room===Number(b.dataset.hotelRoom)));if(room&&room.indices.length>1)for(const i of room.indices){const b=document.createElement('button'),option=picker.querySelector(`option[value="ss${i+1}"]`);b.type='button';b.dataset.hotelLesson=`ss${i+1}`;b.textContent=option.textContent;b.setAttribute('aria-pressed',String(i===index));choices.append(b);}}
  const active=root.querySelector('[data-character][aria-pressed=true]');
  if(active){const name=active.dataset.character;if(name!==lastCharacter){lastCharacter=name;root.querySelector('.hotel-companion-portrait span').textContent=active.textContent.trim();}const portrait=root.querySelector('.hotel-companion-portrait canvas'),ctx=portrait.getContext('2d');ctx.clearRect(0,0,74,96);ctx.drawImage(active.querySelector('canvas'),0,0);}
  const flag=root.querySelector('.expression-map-flag');flag.classList.toggle('is-hotel',Number(flag.dataset.flagLevel?.slice(2))>150);
 }
 function paint(force=false){if(!ready)return;constrainCamera();const t=reduced.matches?0:elapsed,p=currentPosition(),key=`${p.x.toFixed(1)}:${p.y.toFixed(1)}`;if(force||!reduced.matches||key!==lastLiftKey){const lift=elevator.paint(p,root.querySelector('[data-character][aria-pressed=true] canvas'));scenery?.paint(t,reduced.matches,lift);effects.paint(t,reduced.matches);liftCanvas.hidden=canvas.dataset.renderer!=='static'||!lift.alpha;liftCanvas.style.cssText=`left:${lift.rect.x*HOTEL_SCALE}px;top:${lift.rect.y*HOTEL_SCALE}px;width:${lift.rect.w*HOTEL_SCALE}px;height:${lift.rect.h*HOTEL_SCALE}px;opacity:${lift.alpha}`;root.dataset.elevator=lift.state.riding&&lift.alpha?'riding':lift.alpha?'boarding':'hidden';lastLiftKey=key;}}
 const reference=new Image(),restoration=new Image(),train=new Image(),liftImage=new Image(),vegetationPlate=new Image(),images=[reference,restoration,train,liftImage,vegetationPlate];
 Promise.all(images.map((img,i)=>new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=new URL(ART+['reference.png','restoration.png','funicular-complete.png','elevator-reference.png','vegetation-clean.png'][i],import.meta.url).href;}))).then(()=>{
  if(disposed)return;const plate=makeHotelPlate(reference,restoration);background.src=plate.toDataURL('image/png');root.querySelector('.hotel-companion-card').getContext('2d').drawImage(plate,1244,15,140,94,0,0,140,94);
  try{scenery=createHotelScenery(canvas,plate,vegetationPlate);if(canvas.dataset.renderer==='static')canvas.hidden=true;}catch(error){canvas.hidden=true;canvas.dataset.renderer='static';console.warn('Hotel scenery uses the still compatibility plate.',error);}
  effects=createHotelEffects(fx,reference,train,{trainLayer:root.querySelector('.hotel-train-layer')});elevator=createHotelElevator(liftImage,liftCanvas);ready=true;root.dataset.hotelReady='true';paint(true);
 }).catch(()=>{if(!disposed){root.dataset.hotelReady='error';root.querySelector('.hotel-road-sign').hidden=true;root.querySelector('.hotel-companion-portrait').hidden=true;}});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.hidden=true;canvas.dataset.renderer='static';},{signal:abort.signal});
 reduced.addEventListener('change',()=>paint(true),{signal:abort.signal});
 return {update,draw(now){const scale=Number(root.dataset.scale)||1,top=HOTEL_OFFSET*scale-viewport.scrollTop,inView=top<viewport.clientHeight&&top+HOTEL_HEIGHT*scale>0;if(last&&inView)elapsed+=Math.min(100,Math.max(0,now-last))/1000;last=now;effects?.setVisible(inView&&!document.hidden);if(inView)paint();update();},destroy(){disposed=true;abort.abort();images.forEach(img=>{img.onload=img.onerror=null;});scenery?.destroy();effects?.destroy();elevator?.destroy();choices.remove();}};
}
