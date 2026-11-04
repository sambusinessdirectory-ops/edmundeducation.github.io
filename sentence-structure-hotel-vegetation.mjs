import {HOTEL_ART,HOTEL_PLANTS,HOTEL_TREES,HOTEL_SILHOUETTE,HOTEL_TRAIN_OUTLINE} from './sentence-structure-hotel-geometry.mjs?v=20260914-hotel3b';
const {width:W,height:H}=HOTEL_ART;
const canvas=(w=W,h=H)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
function polygon(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
// Each canopy is a single rigid piece of the original artwork. Snow and
// branches share the same transform; no colour-dependent UV displacement.
export function hotelCanopyPose(t,index,height,plant=false){
 const phase=index*2.399963,amplitude=plant?(height>70?.075:.055):Math.min(.043,6.5/height);
 return amplitude*(Math.sin(t*(plant?.95:.76)+phase)*.85+Math.sin(t*.31+phase*.7)*.15);
}
export function createHotelVegetation(plate,restoration){
 const out=canvas(),ctx=out.getContext('2d'),under=canvas(),bg=under.getContext('2d');bg.drawImage(plate,0,0);
 // The vegetation-only edit retained the original parked car. Apply its
 // existing removal mask before exposing any of this background under trees.
 const clean=canvas(),cc=clean.getContext('2d');cc.drawImage(restoration,0,0,W,H);cc.save();const xs=HOTEL_TRAIN_OUTLINE.map(p=>p[0]),ys=HOTEL_TRAIN_OUTLINE.map(p=>p[1]);cc.beginPath();cc.rect(Math.min(...xs)-5,Math.min(...ys)-5,Math.max(...xs)-Math.min(...xs)+10,Math.max(...ys)-Math.min(...ys)+10);cc.clip();cc.drawImage(plate,0,0);cc.restore();
 const source=plate.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
 const protectedArt=canvas(),protect=protectedArt.getContext('2d');
 polygon(protect,HOTEL_SILHOUETTE);protect.fill();
 // The stone viaducts, railway, street lamps and signs sit in front of trees.
 for(const points of [
  [[0,349],[126,389],[126,425],[0,382]],[[0,572],[126,568],[126,620],[0,621]],
  [[1263,291],[1384,237],[1384,267],[1263,321]],
  [[1182,958],[1382,958],[1382,1086],[1182,1086]],
 ]){polygon(protect,points);protect.fill();}
 protect.fillRect(43,836,27,171);protect.fillRect(1326,830,33,160);
 protect.fillRect(1244,15,140,94);
 const roots=[331,440,441,551,667,772,774,781,888,891,972,981,982,973];
 const trees=HOTEL_TREES.map((a,i)=>({a,i,plant:false})),plants=HOTEL_PLANTS.map((a,i)=>({a:[...a.slice(0,4),roots[i]],i:i+trees.length,plant:true}));
 const mask=canvas(),mc=mask.getContext('2d'),soft=canvas(),sm=soft.getContext('2d'),patch=canvas(),pc=patch.getContext('2d'),sprite=canvas(),sc=sprite.getContext('2d');
 const sprites=[...trees,...plants].map(({a:[x,y,rx,ry,root],i,plant})=>{
  mc.globalCompositeOperation='source-over';mc.clearRect(0,0,W,H);
  if(plant&&i<trees.length+10){
   const im=mc.createImageData(W,H),d=im.data;
   for(let yy=Math.max(0,Math.floor(y-ry*1.3));yy<Math.min(H,root);yy++)for(let xx=Math.max(0,Math.floor(x-rx*1.2));xx<Math.min(W,x+rx*1.2);xx++){
    const q=((xx-x)/(rx*1.2))**2+((yy-y)/(ry*1.3))**2;if(q>1)continue;
    const k=(yy*W+xx)*4,r=source[k],g=source[k+1],b=source[k+2],alpha=Math.min(1,Math.max(0,(g-r+19)/10))*Math.min(1,Math.max(0,(170-(r+g+b)/3)/22));
    d[k+3]=Math.round(alpha*255);
   }mc.putImageData(im,0,0);
  }else{
   // An irregular conifer silhouette includes its snow, not just green pixels.
   const profile=[[0,-1.12],[-.12,-.88],[-.25,-.73],[-.14,-.75],[-.40,-.46],[-.26,-.49],[-.58,-.16],[-.40,-.23],[-.79,.18],[-.57,.10],[-1,.51],[-.76,.43],[-1.08,.79],[-.45,.84],[-.13,1],[.13,1],[.46,.84],[1.08,.79],[.76,.43],[1,.51],[.57,.10],[.79,.18],[.40,-.23],[.58,-.16],[.26,-.49],[.40,-.46],[.14,-.75],[.25,-.73],[.12,-.88]];
   polygon(mc,profile.map(([u,v])=>[x+u*rx,Math.min(root,y+v*ry)]));mc.fill();
  }
  if(!plant||i>=trees.length+10){sm.clearRect(0,0,W,H);sm.filter='blur(4px)';sm.drawImage(mask,0,0);sm.filter='none';mc.clearRect(0,0,W,H);mc.drawImage(soft,0,0);}
  mc.globalCompositeOperation='destination-out';if(!plant)mc.drawImage(protectedArt,0,0);
  mc.fillRect(0,root,W,H-root);mc.globalCompositeOperation='source-over';
  // Only pixels hidden by a moving canopy are restored. The original facade,
  // cliffs and all other artwork outside these mattes remain untouched.
  pc.globalCompositeOperation='source-over';pc.clearRect(0,0,W,H);pc.drawImage(clean,0,0,W,H);pc.globalCompositeOperation='destination-in';pc.drawImage(mask,0,0);bg.drawImage(patch,0,0);
  sc.globalCompositeOperation='source-over';sc.clearRect(0,0,W,H);sc.drawImage(plate,0,0);sc.globalCompositeOperation='destination-in';sc.drawImage(mask,0,0);
  const left=Math.max(0,Math.floor(x-rx*1.25-2)),top=Math.max(0,Math.floor(y-ry*1.35-2)),w=Math.min(W-left,Math.ceil(rx*2.5+4)),h=Math.min(H-top,Math.ceil(root-top+2));
  const crop=canvas(w,h);crop.getContext('2d').drawImage(sprite,left,top,w,h,0,0,w,h);
  return {canvas:crop,x,y:root,left,top,w,h,plant,index:i,height:root-top};
 });
 const foreground=canvas(),fg=foreground.getContext('2d');fg.drawImage(under,0,0);fg.globalCompositeOperation='destination-in';fg.drawImage(protectedArt,0,0);
 return {sprites,under,paint(t,still=false){ctx.clearRect(0,0,W,H);if(still){ctx.drawImage(plate,0,0);return out;}ctx.drawImage(under,0,0);for(const s of sprites){if(s.index===trees.length)ctx.drawImage(foreground,0,0);ctx.save();if(s.plant){ctx.beginPath();ctx.rect(0,0,W,s.y);ctx.clip();}ctx.translate(s.x,s.y);ctx.rotate(hotelCanopyPose(t,s.index,s.height,s.plant));ctx.drawImage(s.canvas,s.left-s.x,s.top-s.y);ctx.restore();}return out;}};
}
