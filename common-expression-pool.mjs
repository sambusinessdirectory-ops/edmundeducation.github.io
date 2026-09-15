const ART='./assets/common-expression-business/pool/';
export const POOL_TOP=4800;
export const POOL_COLORS=['#efb811','#124aad','#c91f30','#61247e','#e66614','#096047','#7d192c','#171b20'];
export function poolPositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6,index=i%15;return {order:i+121,x:280+col*208,y:POOL_TOP+370+row*120,color:POOL_COLORS[index<8?index:index-8],striped:index>=8};});}
export const POOL_DECORATIONS=[{x:640,y:205,r:25,color:'#f1ead2',number:0},{x:1030,y:238,r:25,color:POOL_COLORS[1],number:10},{x:145,y:685,r:24,color:POOL_COLORS[2],number:3},{x:1440,y:812,r:25,color:POOL_COLORS[5],number:14}];
export function decorativeBallPosition(ball,index,seconds){const phase=index*1.7;return {x:ball.x+Math.sin(seconds*.22+phase)*9,y:ball.y+Math.sin(seconds*.16+phase)*5};}
let prepared;
export function preparePool(){return prepared ||= (async()=>{const background=new Image();background.src=ART+'table-v1.jpg';await background.decode();return {background};})().catch(e=>{prepared=null;throw e;});}
export function poolTerrain(){const nodes=poolPositions();
 return `<section class="pool-realm" style="top:${POOL_TOP}px" aria-label="桌球旅程，平台 121 至 150"><img class="pool-background" src="${ART}table-v1.jpg" width="1600" height="1200" draggable="false" alt="胡桃木框綠絨桌球檯，球桿、三角球架與彩色桌球"><canvas class="pool-motion" width="1600" height="1200" aria-hidden="true"></canvas>${nodes.map(p=>`<button type="button" class="pool-platform${p.striped?' is-striped':''}" data-pool-platform="${p.order}" style="left:${p.x}px;top:${p.y-POOL_TOP}px;--ball-color:${p.color}" aria-label="平台 ${p.order}，課題準備中"><span class="pool-ball"><span class="pool-ball-number">${p.order}</span></span><small>課題準備中</small></button>`).join('')}</section>`;
}
function drawBall(ctx,p,index,seconds){const {x,y}=decorativeBallPosition(p,index,seconds),r=p.r;
 ctx.save();ctx.translate(x,y);ctx.save();ctx.scale(1,.35);const shadow=ctx.createRadialGradient(7,r*2,2,7,r*2,r*1.25);shadow.addColorStop(0,'#05231dc0');shadow.addColorStop(1,'#05231d00');ctx.fillStyle=shadow;ctx.fillRect(-r*1.5,-r,r*3.2,r*4);ctx.restore();
 ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();ctx.fillStyle=p.number>8?'#eee9d4':p.color;ctx.fillRect(-r,-r,r*2,r*2);
 if(p.number>8){ctx.save();ctx.rotate(Math.sin(seconds*.22+index)*.035);ctx.fillStyle=p.color;ctx.fillRect(-r,-r*.57,r*2,r*1.14);ctx.restore();}
 const shade=ctx.createRadialGradient(-r*.4,-r*.45,1,r*.15,r*.15,r*1.4);shade.addColorStop(0,'#ffffff60');shade.addColorStop(.45,'#ffffff00');shade.addColorStop(.75,'#00000022');shade.addColorStop(1,'#001510c0');ctx.fillStyle=shade;ctx.fillRect(-r,-r,r*2,r*2);
 if(p.number){ctx.fillStyle='#f9f4df';ctx.beginPath();ctx.ellipse(1,2,r*.4,r*.43,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17231e';ctx.font=`bold ${r*.52}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.number,1,3);}
 const shine=ctx.createRadialGradient(-r*.35,-r*.5,0,-r*.35,-r*.5,r*.42);shine.addColorStop(0,'#ffffffdc');shine.addColorStop(.55,'#ffffff50');shine.addColorStop(1,'#ffffff00');ctx.fillStyle=shine;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
}
export function mountPool(root,reduced){const canvas=root.querySelector('.pool-motion'),ctx=canvas.getContext('2d');let dead=false,elapsed=0,last=0,painted=-1;
 function render(seconds){if(dead)return;ctx.clearRect(0,0,1600,1200);POOL_DECORATIONS.forEach((p,i)=>drawBall(ctx,p,i,seconds));canvas.dataset.seconds=seconds.toFixed(2);}
 render(0);return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;canvas.width=canvas.height=0;}};
}
