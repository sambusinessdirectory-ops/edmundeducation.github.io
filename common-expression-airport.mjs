// Airport artwork and motion only; the shared map owns lesson/account state.
const ART='./assets/common-expression-business/airport/';
const W=1600,H=1200;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
let assets;
export function airportPositions(lessons) {
  return lessons.map((lesson,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6;return {id:lesson.id,x:400+col*160,y:470+row*150};});
}
export function airportFlight(seconds,second=false) {
  const period=second?61:48,phase=((seconds+(second?32:8))%period)/period;
  let x,y,angle,stage;
  const ground=second?306:345;
  if(phase<.38){const t=phase/.38;x=mix(-350,520,t);y=mix(30,ground,1-(1-t)**2);angle=mix(9,0,t);stage='landing';}
  else if(phase<.65){const t=(phase-.38)/.27;x=mix(520,970,t);y=ground;angle=0;stage='rolling';}
  else {const t=(phase-.65)/.35;x=mix(970,1960,t);y=mix(ground,-90,t*t);angle=-12*t;stage='takeoff';}
  return {x:second?W-x:x,y,angle:second?-angle:angle,ground,stage,phase};
}
export const DEPARTURES=['10:20  LONDON      ON TIME','11:45  TOKYO       ON TIME','13:10  SINGAPORE   ON TIME','15:25  NEW YORK    ON TIME'];
export function departureText(seconds,row) {
  const text=DEPARTURES[row],typing=text.length*.115,period=typing+2.6+.8;
  const phase=(seconds+row*.72)%period;
  return phase<typing?text.slice(0,Math.floor(phase/.115)):phase<typing+2.6?text:'';
}
const PLANTS=[{x:303,y:470,h:160},{x:1297,y:465,h:155},{x:66,y:690,h:175},{x:1532,y:685,h:165}];
const LAMPS=[{x:135,y:400,h:82,kind:'lamp'},{x:1484,y:400,h:60,kind:'candle'},{x:185,y:1003,h:103,kind:'candle'},{x:1433,y:1008,h:135,kind:'lamp'}];
export const AIRPORT_INVENTORY={planes:2,runwayLights:30,plants:PLANTS,lamps:LAMPS,platforms:30};
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
export async function prepareAirport() {
  if(assets)return assets;
  assets=Promise.all([image(ART+'lounge-v1.jpg'),image(ART+'sprites-v1.png')]).then(([background,atlas])=>{
    const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas,0,0);
    // Source rectangles are calibrated to the retained 1536 x 1024 atlas.
    const regions={plane:[0,0,1090,465],plant:[1100,0,436,535],lamp:[220,510,520,490],candle:[960,545,330,450]};
    const sprites={};
    for(const [key,[x,y,w,h]] of Object.entries(regions)){
      const p=ctx.getImageData(x,y,w,h);let l=w,r=0,t=h,b=0;
      for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(p.data[(yy*w+xx)*4+3]>50){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);}
      const out=document.createElement('canvas');out.width=r-l+1;out.height=b-t+1;out.getContext('2d').drawImage(c,x+l,y+t,out.width,out.height,0,0,out.width,out.height);sprites[key]=out;
    }
    return {background,sprites};
  }).catch(error=>{assets=null;throw error;});
  return assets;
}
function terrain(nodes,lessons){
  const all=airportPositions(Array.from({length:30},(_,i)=>({id:`reserved-${i+1}`})));
  const path=all.map((p,i)=>{if(!i)return `M${p.x} ${p.y}`;const a=all[i-1];return a.x===p.x?`C${p.x+(p.x>800?95:-95)} ${a.y} ${p.x+(p.x>800?95:-95)} ${p.y} ${p.x} ${p.y}`:`L${p.x} ${p.y}`;}).join(' ');
  return `<div class="airport-scenery"><img class="airport-background" src="${ART}lounge-v1.jpg" alt="夕陽下的機場貴賓室與跑道" width="1600" height="1200"><canvas class="airport-motion" width="1600" height="1200" aria-hidden="true"></canvas><div class="airport-departures" aria-label="航班顯示板：London、Tokyo、Singapore、New York"><strong>✈ Departures</strong>${DEPARTURES.map((_,i)=>`<div data-departure-row="${i}" aria-hidden="true"></div>`).join('')}</div><svg class="airport-route" viewBox="0 0 1600 1200" aria-hidden="true"><path d="${path}" fill="none" stroke="#5f503b40" stroke-width="67" transform="translate(0 6)"/><path d="${path}" fill="none" stroke="#ddbf7c" stroke-width="66"/><path d="${path}" fill="none" stroke="#527171" stroke-width="57"/><path d="${path}" fill="none" stroke="#d7d8bd55" stroke-width="2" stroke-dasharray="6 18"/></svg></div>${all.slice(lessons.length).map((p,i)=>`<div class="expression-map-stone airport-reserved" style="left:${p.x}px;top:${p.y}px" aria-label="${lessons.length+i+1} · 尚未開放"><span class="expression-map-stone-number">${lessons.length+i+1}</span><span class="expression-map-stone-caption">即將推出<small>Coming soon</small></span></div>`).join('')}`;
}
function mount(root,reduced){
  const canvas=root.querySelector('.airport-motion'),ctx=canvas.getContext('2d'),rows=[...root.querySelectorAll('[data-departure-row]')];
  let ready,dead=false,elapsed=0,last=0,painted=-1;
  prepareAirport().then(value=>{if(!dead){ready=value;render(0);}});
  root.querySelector('.expression-map-heading small').textContent=`${root.querySelectorAll('[data-map-level]').length || 26} 個課題已開放 · 30 個登機平台`;
  function glow(x,y,r,strength,color='255,221,137'){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${strength})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function render(seconds){
    if(!ready||dead)return;const {sprites}=ready;ctx.clearRect(0,0,W,H);
    ctx.save();ctx.beginPath();ctx.rect(82,0,1450,386);ctx.clip();
    for(let k=0;k<2;k++){
      const p=airportFlight(seconds,k===1),s=sprites.plane,width=k?230:345,height=width*s.height/s.width;
      ctx.save();ctx.globalAlpha=.22*clamp(1-Math.abs(p.y-p.ground)/200,0,1);ctx.fillStyle='#30313a';ctx.beginPath();ctx.ellipse(p.x,p.ground+3,width*.39,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle*Math.PI/180);ctx.scale(k?-1:1,1);ctx.drawImage(s,-width/2,-height,width,height);ctx.restore();
    }
    for(let i=0;i<30;i++){const x=100+(i%15)*99,y=i<15?301:358,pulse=.35+.55*(.5+.5*Math.sin(seconds*.85+i*1.4));glow(x,y,10,pulse*.7);ctx.fillStyle=`rgba(255,236,166,${pulse})`;ctx.fillRect(x-1.5,y-1.5,3,3);}
    // The physical monitor occludes objects beyond the window.
    ctx.clearRect(1193,17,326,166);ctx.restore();
    for(let i=0;i<PLANTS.length;i++){
      const p=PLANTS[i],s=sprites.plant,w=p.h*s.width/s.height,split=.66,sway=reduced.matches?0:Math.sin(seconds*.75+i*1.7)*.022;
      ctx.save();ctx.fillStyle='#473c3029';ctx.beginPath();ctx.ellipse(p.x,p.y+1,w*.24,5,0,0,Math.PI*2);ctx.fill();ctx.translate(p.x,p.y-p.h*(1-split));
      // Foliage bends at the pot rim while the planter stays on the floor.
      ctx.save();ctx.transform(1,0,sway,1,0,0);ctx.drawImage(s,0,0,s.width,s.height*split,-w/2,-p.h*split,w,p.h*split+1);ctx.restore();
      ctx.drawImage(s,0,s.height*split,s.width,s.height*(1-split),-w/2,0,w,p.h*(1-split));ctx.restore();
    }
    for(let i=0;i<LAMPS.length;i++){
      const p=LAMPS[i],s=sprites[p.kind],w=p.h*s.width/s.height,pulse=reduced.matches?.8:.58+.25*Math.sin(seconds*.65+i*2);
      const cy=p.y-p.h*(p.kind==='lamp'?.75:.64);glow(p.x,cy,p.h*.48,pulse*.25);ctx.save();ctx.filter=`brightness(${.88+pulse*.23})`;ctx.drawImage(s,p.x-w/2,p.y-p.h,w,p.h);ctx.restore();glow(p.x,cy,p.h*.21,pulse*.18);
    }
    rows.forEach((row,i)=>{const text=reduced.matches?DEPARTURES[i]:departureText(seconds,i);if(row.textContent!==text)row.textContent=text;});
    canvas.dataset.seconds=seconds.toFixed(2);canvas.dataset.flight=airportFlight(seconds).stage;
  }
  return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;ready=null;canvas.width=canvas.height=0;}};
}
const floorPoint=p=>({x:clamp(p.x,340,1260),y:clamp(p.y,445,1140)});
export const BUSINESS_AIRPORT=Object.freeze({id:'airport',title:'商務會話啟航之旅',kicker:'BUSINESS SPEAKING · DEPARTURE LOUNGE',width:W,height:H,positions:airportPositions,terrain,mount,fitOverview:true,minimumZoom:.7,cameraScaleFloor:()=>.55,cameraTop:({point,scale,height,overview})=>overview?0:point.y<790?0:point.y*scale-height*.55,navigation:{path:(_from,to)=>[floorPoint(to)],step:(_from,to)=>floorPoint(to)}});
