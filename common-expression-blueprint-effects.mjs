import {BLUEPRINT_SPRITES,drawBlueprintSprite,blueprintInkMask} from './common-expression-blueprint-artwork.mjs';
import {BLUEPRINT_WIDTH as W,BLUEPRINT_HEIGHT as H,blueprintRoute,lampAngle,compassAngle,pencilAngle} from './common-expression-blueprint-geometry.mjs';
const toWorld=([x,y])=>({x:x*W/1536,y:y*H/1024});
export const BLUEPRINT_TRACES=[
 [[456,226],[815,125],[883,201],[1104,159],[1238,317]],
 [[487,608],[794,522],[847,691],[1189,590]],
 [[171,792],[188,882],[517,785],[564,886]],
 [[885,201],[881,359],[1066,438],[1335,377],[1406,414],[1520,561]],
 [[714,207],[714,134],[540,186],[541,285]],
 [[841,829],[1137,740],[1134,654],[1407,578]]
].map(points=>points.map(toWorld));
function samplePolyline(points){let distance=0;const lengths=points.slice(1).map((p,i)=>{const n=Math.hypot(p.x-points[i].x,p.y-points[i].y);distance+=n;return n;});return {points,lengths,distance};}
const traces=BLUEPRINT_TRACES.map(samplePolyline);
export function traceWindow(index,t){const cycle=11,local=(t+index*3.9)%cycle,active=local<7;return {active,progress:local/7,alpha:active?Math.sin(Math.PI*Math.min(1,local/7))*.7:0};}
function pointAlong(trace,d){let left=Math.max(0,Math.min(trace.distance,d));for(let i=0;i<trace.lengths.length;i++){const len=trace.lengths[i];if(left<=len||i===trace.lengths.length-1){const a=trace.points[i],b=trace.points[i+1],f=left/len;return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}left-=len;}return trace.points.at(-1);}
function traceSegment(trace,start,end){const points=[];for(let d=start;d<=end;d+=4)points.push(pointAlong(trace,d));points.push(pointAlong(trace,end));return points;}
export const LAMP_PLACEMENT={x:1570,y:35,scale:.46};
export function lampMouth(t){const p=BLUEPRINT_SPRITES.lamp,a=lampAngle(t),dx=(p.mouth[0]-p.pivot[0])*LAMP_PLACEMENT.scale,dy=(p.mouth[1]-p.pivot[1])*LAMP_PLACEMENT.scale;return {x:LAMP_PLACEMENT.x+dx*Math.cos(a)-dy*Math.sin(a),y:LAMP_PLACEMENT.y+dx*Math.sin(a)+dy*Math.cos(a)};}
function drawLamp(g,art,t){
 const {x,y,scale:s}=LAMP_PLACEMENT,lamp=BLUEPRINT_SPRITES.lamp;
 g.save();g.translate(x,y);g.rotate(lampAngle(t));g.scale(s,s);g.translate(-lamp.pivot[0],-lamp.pivot[1]);
 // Light lives in the same transform as the shade, so it cannot detach.
 const [mx,my]=lamp.mouth;g.save();g.translate(mx,my);g.rotate(.14);
 const glow=g.createLinearGradient(0,0,0,440);glow.addColorStop(0,'#fff2bd55');glow.addColorStop(.45,'#ffe7a71a');glow.addColorStop(1,'#ffe7a700');
 g.fillStyle=glow;g.beginPath();g.moveTo(-116,0);g.quadraticCurveTo(-190,200,-270,440);g.lineTo(220,440);g.quadraticCurveTo(175,200,116,0);g.closePath();g.fill();
 for(const offset of [-60,0,60]){const beam=g.createLinearGradient(0,0,0,400);beam.addColorStop(0,'#fff8d52b');beam.addColorStop(1,'#fff8d500');g.fillStyle=beam;g.beginPath();g.moveTo(offset-17,0);g.lineTo(offset*2-36,400);g.lineTo(offset*2+36,400);g.lineTo(offset+17,0);g.fill();}
 g.restore();
 // The articulated arm moves; its wall plate is painted in a fixed pose.
 g.save();g.beginPath();g.rect(-2,-2,476,415);g.clip();drawBlueprintSprite(g,art,'lamp',0,0,532,410);g.restore();g.restore();
 g.drawImage(art.tools,481,15,68,119,x+(481-18-lamp.pivot[0])*s,y-lamp.pivot[1]*s,68*s,119*s);
}
function drawPivotTool(g,art,name,x,y,scale,angle){const p=BLUEPRINT_SPRITES[name];g.save();g.translate(x,y);g.rotate(angle);drawBlueprintSprite(g,art,name,-p.pivot[0]*scale,-p.pivot[1]*scale,p.rect[2]*scale,p.rect[3]*scale);g.restore();}
export function createBlueprintRenderer(c,art){
 const d=Math.min(2,devicePixelRatio||1);c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.scale(d,d);const mask=blueprintInkMask(art,W,H);
 const mg=mask.getContext('2d');mg.globalCompositeOperation='destination-out';mg.lineWidth=63;mg.lineCap='round';mg.stroke(new Path2D(blueprintRoute().d));mg.globalCompositeOperation='source-over';
 // Each tracing front is at most 150 world pixels long. Composite only its
 // small bounds, rather than masking a full Retina scene every frame.
 const patch=document.createElement('canvas');patch.width=patch.height=192*d;const pg=patch.getContext('2d');pg.scale(d,d);
 function paint(t){
  g.clearRect(0,0,W,H);
  // At most two small tracing fronts run at once; long pauses keep it calm.
  for(let slot=0;slot<2;slot++){
   const index=(Math.floor((t+slot*3.9)/11)*2+slot*3)%traces.length,trace=traces[index],state=traceWindow(slot,t);
   if(!state.active)continue;const end=state.progress*trace.distance,start=Math.max(0,end-150);
   const points=traceSegment(trace,start,end),x=Math.floor(Math.min(...points.map(p=>p.x)))-10,y=Math.floor(Math.min(...points.map(p=>p.y)))-10;
   const width=Math.ceil(Math.max(...points.map(p=>p.x))-x)+10,height=Math.ceil(Math.max(...points.map(p=>p.y))-y)+10;
   pg.clearRect(0,0,192,192);pg.save();pg.translate(-x,-y);pg.beginPath();points.forEach((p,i)=>i?pg.lineTo(p.x,p.y):pg.moveTo(p.x,p.y));
   pg.lineCap='round';pg.strokeStyle=`rgba(255,225,147,${state.alpha*.3})`;pg.lineWidth=8;pg.stroke();pg.strokeStyle=`rgba(255,213,116,${state.alpha})`;pg.lineWidth=3;pg.stroke();
   pg.globalCompositeOperation='destination-in';pg.drawImage(mask,x,y,width,height,x,y,width,height);pg.restore();
   g.drawImage(patch,0,0,width*d,height*d,x,y,width,height);
  }
  drawLamp(g,art,t);
  drawBlueprintSprite(g,art,'paper',8,966,114,127);
  drawPivotTool(g,art,'compass',42,1090,.28,compassAngle(t));
  drawBlueprintSprite(g,art,'square',1344,920,191,177);
  drawPivotTool(g,art,'pencil',1330,1095,.44,pencilAngle(t));
  c.dataset.ready='true';c.dataset.paintTime=t.toFixed(3);
 }
 paint(0);return {paint};
}
export function mountBlueprintEffects(root,art,reduced){const c=root.querySelector('[data-blueprint-effects]'),renderer=createBlueprintRenderer(c,art);let last=0,elapsed=0,wasReduced=reduced.matches;return {
 draw(now){if(reduced.matches){if(!wasReduced)renderer.paint(0);wasReduced=true;last=0;return;}wasReduced=false;if(last)elapsed+=Math.min(100,now-last)/1000;last=now;renderer.paint(elapsed);},
 destroy(){last=0;c.width=1;}
};}
