const TAU=Math.PI*2;
export function gesture(t,start,duration,period){const p=(((t%period)+period)%period-start)/duration;return p<=0||p>=1?0:Math.sin(Math.PI*p*p*(3-2*p))**2;}
export function dogMotion(t){return {tilt:gesture(t,.6,5.6,11)*Math.sin((((t%11)+11)%11-.6)*TAU/5.6)*.15,blink:Math.max(gesture(t,1.7,.36,5.7),gesture(t,2.2,.28,11.4)),key:t*TAU/10};}
export function marbleMotion(t,m){const dx=m.direction*m.amplitude*Math.sin(t*TAU/m.period+m.phase);return {x:m.x+dx,y:m.y,roll:-dx/m.r};}
export function planeMotion(t,p){return {left:Math.sin(t*TAU/5.8+p.phase)*.17,right:Math.sin(t*TAU/5.8+p.phase+.45)*-.15,rock:Math.sin(t*TAU/8+p.phase)*.025};}
