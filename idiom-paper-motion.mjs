const TAU=Math.PI*2;
export function paperBoatMotion(t,b) {
  const phase=TAU*t/b.period+b.phase;
  return {x:b.x+Math.sin(phase)*b.amplitude,y:b.y+Math.sin(phase*1.7)*2,roll:Math.sin(phase*1.35)*.027};
}
export function paperCloudMotion(t,c) {return {x:c.x+Math.sin(TAU*t/c.period+c.phase)*c.amplitude,y:c.y+Math.sin(t*.12+c.phase)*3};}
export function paperPlantMotion(t,p) {return Math.sin(TAU*t/p.period+p.phase)*p.amplitude;}
export function paperMillMotion(t) {return TAU*t/13;}
export function paperFlagMotion(t,f) {return {wave:Math.sin(t*2.6+f.phase),fold:Math.sin(t*2.6+f.phase-.9)};}
export function paperPigeonMotion(t,p) {
  const phase=TAU*t/p.period;
  return {x:p.x+Math.sin(phase)*p.amplitude,y:p.y+Math.sin(t*.55)*8,
    yaw:Math.atan2(Math.cos(phase),.18),flap:.55+.45*Math.sin(TAU*t/1.45),velocity:Math.cos(phase)*p.amplitude*TAU/p.period};
}
