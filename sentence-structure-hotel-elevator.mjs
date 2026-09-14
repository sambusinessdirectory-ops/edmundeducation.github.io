import {HOTEL_FLOORS,HOTEL_OFFSET,HOTEL_SCALE,hotelElevatorState} from './sentence-structure-hotel-geometry.mjs?v=20260914-hotel2';

// The reference's bronze cabin is revealed through a tall, feathered oval in
// the wall shader. Shaft rails stay fixed; the cabin and passenger share a floor.
export function createHotelElevator(reference,canvas){
 canvas.width=320;canvas.height=576;
 const ctx=canvas.getContext('2d');
 return {paint(position,avatar){
  const state=hotelElevatorState(position),rect={x:145,y:state.y-232,w:160,h:288};
  canvas.dataset.alpha=String(state.alpha);canvas.dataset.riding=String(state.riding);canvas.dataset.floor=String(state.y);canvas.dataset.passenger=avatar?.parentElement?.dataset.character||'';
  if(!state.alpha)return {canvas,rect,alpha:0,state};
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,160,288);
  const shade=ctx.createLinearGradient(0,0,160,0);shade.addColorStop(0,'#281b20');shade.addColorStop(.5,'#674137');shade.addColorStop(1,'#29191c');ctx.fillStyle=shade;ctx.fillRect(0,0,160,288);
  // Masonry and landings move past the cabin instead of travelling with it.
  for(const floor of HOTEL_FLOORS){const y=(floor-HOTEL_OFFSET)/HOTEL_SCALE-rect.y;ctx.fillStyle='#2d171b';ctx.fillRect(0,y,160,9);ctx.fillStyle='#b58150';ctx.fillRect(0,y,160,2);}
  for(const x of [18,23,137,142]){const rail=ctx.createLinearGradient(x-2,0,x+2,0);rail.addColorStop(0,'#533021');rail.addColorStop(.5,'#d2a064');rail.addColorStop(1,'#6d442a');ctx.fillStyle=rail;ctx.fillRect(x-2,0,4,288);}
  const boltStart=((-rect.y%28)+28)%28;for(let y=boltStart;y<288;y+=28)for(const x of [18,142]){ctx.fillStyle='#e6b877';ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#d9b180';ctx.lineWidth=1;for(const x of [77,84]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,49);ctx.stroke();}
  const left=28,top=27,width=104,height=202,scale=width/reference.width;
  ctx.drawImage(reference,0,54,reference.width,reference.height-54,left,top,width,height);
  if(avatar){const x=state.passengerX-rect.x;ctx.save();ctx.shadowColor='#21121270';ctx.shadowBlur=5;ctx.drawImage(avatar,x-32,232-111,64,102);ctx.restore();}
  // Foreground bronze gate bars place the passenger inside the cabin.
  [70,98,127,158,188,216].forEach((x,i)=>{const shift=(i<3?-1:1)*state.gate*24;ctx.drawImage(reference,x-5,270,10,285,left+(x-5)*scale+shift,top+(270-54)*scale,10*scale,285*scale);});
  ctx.drawImage(reference,40,554,200,31,left+40*scale,top+(554-54)*scale,200*scale,31*scale);
  ctx.fillStyle='#ffdca82a';ctx.beginPath();ctx.ellipse(80,78,37,12,0,0,Math.PI*2);ctx.fill();
  return {canvas,rect,alpha:state.alpha,state};
 },destroy(){canvas.width=canvas.height=1;}};
}
