const SHEET = new URL('./assets/common-expression-written/garden/duck-directions.webp', import.meta.url).href;
// Pixel anchors from the generated 362-square cells, aligned at the waterline.
const ANCHORS = [[188,328],[176.5,326],[186,325],[190.5,322],[187.5,315],[173.5,308],[176.5,309],[186.5,313],[188,295],[185,297],[180.5,305],[176.5,297]];

export function duckPose(time, offset = 0, reduced = false) {
  const clock=reduced?offset*700:time+offset*3500;
  const phase=clock*.00015;
  const angle=((Math.atan2(-24*Math.sin(phase),8*Math.cos(phase))*180/Math.PI)+360)%360;
  const frame=angle/45, first=Math.floor(frame)%8;
  const cardinal=Math.round(angle/90)%4;
  const cardinalDistance=Math.abs(((angle-cardinal*90+540)%360)-180);
  const blink=(clock/1000)%6.7;
  return {
    x:Math.cos(phase)*24, y:Math.sin(phase)*8,
    angle, first, second:(first+1)%8, mix:frame-Math.floor(frame),
    closed:!reduced && cardinalDistance<23 && blink>5.5 && blink<5.72,
    blinkFrame:8+cardinal
  };
}

export function mountGardenDucks(root, reduced) {
  const ducks=[...root.querySelectorAll('.garden-duck')].map(node=>({node,canvas:node.querySelector('canvas'),offset:Number(node.dataset.duckPhase)}));
  const image=new Image(); let disposed=false;
  function draw(time) {
    if(disposed || !image.complete || !image.naturalWidth) return;
    for(const {node,canvas,offset} of ducks) {
      const pose=duckPose(time,offset,reduced.matches), ctx=canvas.getContext('2d');
      node.style.transform=`translate(${pose.x}px,${pose.y}px)`;
      node.dataset.facing=pose.angle.toFixed(1);node.dataset.blinking=String(pose.closed);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const sw=image.naturalWidth/4, sh=image.naturalHeight/3;
      const frame=(index,alpha)=>{
        ctx.globalAlpha=alpha;
        const [center,bottom]=ANCHORS[index];
        ctx.drawImage(image,(index%4)*sw,Math.floor(index/4)*sh,sw,sh,canvas.width*(.5-center/362),canvas.height*(.8-bottom/362),canvas.width,canvas.height);
      };
      // Adjacent, genuinely drawn angles dissolve through each turn. No reflection.
      if(pose.closed) frame(pose.blinkFrame,1);
      else {frame(pose.first,1-pose.mix);frame(pose.second,pose.mix);}
      ctx.globalAlpha=1;
    }
  }
  const ready=()=>draw(performance.now());
  image.addEventListener('load',ready);image.src=SHEET;
  return {draw,destroy(){disposed=true;image.removeEventListener('load',ready);}};
}
