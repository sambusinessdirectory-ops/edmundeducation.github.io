// Soft volumetric steam: translucent overlapping billows, rooted at the liquid surface.
export function drawHotSteam(ctx,seconds,{x,y,width=32,height=100}){
 ctx.save();
 for(let i=0;i<18;i++){
  const p=(seconds/6+i/18)%1,spread=width*(.18+p*.46);
  const px=x+Math.sin(i*2.4+seconds*.55)*spread,py=y-p*height;
  const radius=width*(.18+p*.24),alpha=.13*Math.sin(Math.PI*p);
  const g=ctx.createRadialGradient(px,py,0,px,py,radius);
  g.addColorStop(0,`rgba(249,244,232,${alpha})`);g.addColorStop(.45,`rgba(249,244,232,${alpha*.65})`);g.addColorStop(1,'rgba(249,244,232,0)');
  ctx.fillStyle=g;ctx.fillRect(px-radius,py-radius,radius*2,radius*2);
 }
 ctx.filter='blur(3px)';
 for(let i=0;i<4;i++){
  const phase=(seconds/7+i/4)%1,h=height*(.65+phase*.35),drift=Math.sin(seconds*.7+i)*width*.32;
  const g=ctx.createLinearGradient(0,y,0,y-h);g.addColorStop(0,'rgba(249,244,232,0)');g.addColorStop(.25,`rgba(249,244,232,${.25*Math.sin(Math.PI*phase)})`);g.addColorStop(1,'rgba(249,244,232,0)');
  ctx.strokeStyle=g;ctx.lineWidth=width*.24;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+(i-1.5)*width*.13,y);ctx.bezierCurveTo(x-drift,y-h*.32,x+drift*1.5,y-h*.65,x+drift,y-h);ctx.stroke();
 }
 ctx.restore();
}
