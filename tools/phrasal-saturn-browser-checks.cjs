const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async function({page,out,sharp}){
 const live=await page.locator('.bakery-saturn-motion').evaluate(e=>({renderer:e.dataset.renderer,issue:e.dataset.renderIssue,transform:getComputedStyle(e).transform}));
 assert.equal(live.issue,'',`The 3D shader must compile and link: ${JSON.stringify(live)}`);
 assert.equal(live.renderer,'webgl','The normal browser uses the depth-tested sphere mesh');assert.equal(live.transform,'none','No flat-plane transform');
 const result={live};
 for(const fallback of [false,true]){
  const poses=await page.evaluate(async fallback=>{
   const {mountSaturn,saturnPose}=await import('./phrasal-verb-bakery-saturn.mjs?v=20260914-bakery4');
   const host=document.createElement('span');const original=HTMLCanvasElement.prototype.getContext;
   if(fallback)HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};
   let renderer;try{renderer=mountSaturn(host);}finally{HTMLCanvasElement.prototype.getContext=original;}
   const frames=[0,3,6,9,12,15,18,21,24].map(t=>{renderer.draw(t);return {t,pose:saturnPose(t),mode:host.dataset.renderer,image:host.querySelector('canvas').toDataURL()};});renderer.destroy();return frames;
  },fallback);
  const rendered=[];
  for(const f of poses){
   const png=Buffer.from(f.image.split(',')[1],'base64'),{data,info}=await sharp(png).raw().toBuffer({resolveWithObject:true});
   let minX=info.width,minY=info.height,maxX=-1,maxY=-1;
   for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*4,[r,g,b,a]=data.subarray(i,i+4);if(a>200&&r>70&&r>g*1.18&&b>g*1.08){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
   const bounds={width:maxX-minX+1,height:maxY-minY+1,left:minX,top:minY};assert.ok(bounds.width>info.width*.55,JSON.stringify(bounds));
   assert.ok(Math.abs(bounds.width-bounds.height)<info.width*.025,'The rendered pink globe stays round at every Y pose');
   rendered.push({t:f.t,pose:f.pose,mode:f.mode,bounds});
   if(f.t<=12)fs.writeFileSync(path.join(out,`saturn-${fallback?'fallback':'3d'}-${f.t}s.png`),png);
  }
  const widths=rendered.map(f=>f.bounds.width);assert.ok(Math.max(...widths)-Math.min(...widths)<(fallback?12:6),'Turning does not squeeze the globe');
  assert.ok(poses[0].image===poses[4].image,'First loop returns without a jump');assert.ok(poses[0].image===poses[8].image,'Second loop also closes');
  const a=await sharp(Buffer.from(poses[0].image.split(',')[1],'base64')).resize(310,310).extract({left:115,top:98,width:80,height:70}).removeAlpha().raw().toBuffer();
  const b=await sharp(Buffer.from(poses[1].image.split(',')[1],'base64')).resize(310,310).extract({left:115,top:98,width:80,height:70}).removeAlpha().raw().toBuffer();
  let changed=0;for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>10)changed++;
  assert.ok(changed/a.length>.035,'Raised sugar visibly moves across the globe interior');
  result[fallback?'fallback':'webgl']={frames:rendered,interiorChangedFraction:changed/a.length};
 }
 fs.writeFileSync(path.join(out,'saturn-model-review.json'),JSON.stringify(result,null,2));
 return result;
};
