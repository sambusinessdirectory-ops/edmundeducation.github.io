const fs=require('fs'),path=require('path');const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'assets/speaking-system/mascots/v4');
(async()=>{for(const name of ['noir','celeste']){
 const open=await sharp(path.join(dir,name+'-standing.png')).raw().toBuffer(),closed=await sharp(path.join(dir,name+'-blink-draft.png')).raw().toBuffer(),result=Buffer.from(open),regions=[];
 for(let cell=0;cell<16;cell++){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256,points=[];
  for(let y=40;y<115;y++)for(let x=30;x<225;x++){
   const p=((oy+y)*1024+ox+x)*4,[r,g,b,a]=open.subarray(p,p+4);
   if(a>200&&(name==='noir'?g>45&&b>80&&b>r+25&&b>g+9:r>g+10&&b>g+15))points.push([x,y]);
  }
  // Group disconnected irises; each generated eye is blended independently.
  const groups=[];for(const pt of points){let group=groups.find(g=>g.some(q=>Math.hypot(q[0]-pt[0],q[1]-pt[1])<5));if(!group)groups.push(group=[]);group.push(pt);}
  for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){if(groups[i].some(a=>groups[j].some(b=>Math.hypot(a[0]-b[0],a[1]-b[1])<8))){groups[i].push(...groups.splice(j,1)[0]);j=i;}}
  for(const pts of groups.filter(g=>g.length>=30)){
   const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,rx=(Math.max(...xs)-Math.min(...xs))/2+(name==='celeste'?15:10),ry=(Math.max(...ys)-Math.min(...ys))/2+(name==='celeste'?13:9);
   regions.push({cell,cx,cy,rx,ry,count:pts.length});
   for(let y=Math.max(0,Math.floor(cy-ry));y<Math.min(256,cy+ry);y++)for(let x=Math.max(0,Math.floor(cx-rx));x<Math.min(256,cx+rx);x++){
    const d=Math.hypot((x-cx)/rx,(y-cy)/ry),mix=Math.min(1,Math.max(0,(1-d)*6));if(!mix)continue;
    const p=((oy+y)*1024+ox+x)*4;for(let c=0;c<3;c++)result[p+c]=Math.round(open[p+c]*(1-mix)+closed[p+c]*mix);
   }
  }
 }
 await sharp(result,{raw:{width:1024,height:1024,channels:4}}).png().toFile(path.join(dir,name+'-blink-v1.png'));
 await sharp(result,{raw:{width:1024,height:1024,channels:4}}).webp({quality:95}).toFile(path.join(dir,name+'-blink-v1-clean.webp'));
 fs.writeFileSync(path.join(__dirname,'new-companions',name+'-blink-regions.json'),JSON.stringify(regions,null,2)+'\n');console.log(name,regions.length,'eye regions');
}
const p=path.join(root,'speaking-mascot-views.mjs');let s=fs.readFileSync(p,'utf8');for(const name of ['noir','celeste'])s=s.replace('"blinkImage":"'+name+'-standing.png"','"blinkImage":"'+name+'-blink-v1.png"');fs.writeFileSync(p,s);
})();
