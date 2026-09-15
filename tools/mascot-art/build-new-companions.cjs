// Builds registered 16-view runtime atlases from the approved chroma extraction sheet.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'assets/speaking-system/mascots/v4');
const angles=[0,30,60,75,90,115,145,160,180,210,235,250,270,300,330,350];
(async()=>{
const blinkBuild=process.argv.includes('--blink');
const source=process.argv[2];if(!source)throw Error('Pass the chroma source sheet');
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const rgba=Buffer.alloc(info.width*info.height*4);
for(let i=0;i<info.width*info.height;i++){
 const r=data[i*3],g=data[i*3+1],b=data[i*3+2];
 const spill=Math.max(0,g-Math.max(r,b));const alpha=255-Math.min(255,spill*1.6);
 rgba[i*4]=r;rgba[i*4+1]=Math.min(g,Math.max(r,b)+8);rgba[i*4+2]=b;rgba[i*4+3]=alpha<30?0:alpha;
}
const sheet=await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
const manifestFile=path.join(root,'speaking-mascot-views.mjs'),text=fs.readFileSync(manifestFile,'utf8');const manifest=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
for(const [name,offset,selection] of [
 ['noir',0,[[0,0],[1,0],[6,1],[2,1],[2,1],[3,1],[3,1],[4,0],[4,0],[3,0],[3,0],[2,0],[2,0],[6,0],[7,0],[0,0]]],
 ['celeste',2,[[0,0],[1,0],[6,1],[2,1],[2,1],[3,0],[3,0],[4,0],[4,0],[3,1],[3,1],[2,0],[2,0],[6,0],[7,1],[0,0]]]
]){
 const cells=[];
 for(let i=0;i<8;i++){
  const left=Math.round((offset+i%2)*info.width/4),top=Math.round(Math.floor(i/2)*info.height/4);
  const width=Math.round((offset+i%2+1)*info.width/4)-left,height=Math.round((Math.floor(i/2)+1)*info.height/4)-top;
  const raw=await sharp(sheet).extract({left,top,width,height}).raw().toBuffer();
  const seen=new Uint8Array(width*height);let largest=[];
  for(let q=0;q<seen.length;q++){if(seen[q]||raw[q*4+3]<40)continue;const part=[q];seen[q]=1;for(let k=0;k<part.length;k++){const a=part[k];for(const b of [a-width,a+width,...(a%width?[a-1]:[]),...(a%width<width-1?[a+1]:[])])if(b>=0&&b<seen.length&&!seen[b]&&raw[b*4+3]>=40){seen[b]=1;part.push(b);}}if(part.length>largest.length)largest=part;}
  const keep=new Uint8Array(seen.length);for(const q of largest)keep[q]=1;for(let q=0;q<seen.length;q++)if(!keep[q])raw[q*4+3]=0;
  cells.push(await sharp(await sharp(raw,{raw:{width,height,channels:4}}).png().toBuffer()).trim({threshold:10}).resize({width:220,height:232,fit:'inside'}).png().toBuffer());
 }
 const layers=[];
 for(let i=0;i<16;i++){
  const [cell,mirror]=selection[i];const buf=mirror?await sharp(cells[cell]).flop().png().toBuffer():cells[cell];const m=await sharp(buf).metadata();
  layers.push({input:buf,left:(i%4)*256+Math.round((256-m.width)/2),top:Math.floor(i/4)*256+244-m.height});
 }
 const atlas=await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(layers).png().toBuffer();
 fs.writeFileSync(path.join(out,name+(blinkBuild?'-blink-draft.png':'-standing.png')),atlas);
 if(!blinkBuild)await sharp(atlas).webp({quality:95}).toFile(path.join(out,name+'-standing-clean.webp'));
 if(!blinkBuild)fs.writeFileSync(path.join(out,name+'-standing.flow'),Buffer.alloc(512*512*4,128));
 manifest[name]={standing:{sourceCoat:name==='noir'?'#393634':'#eee9e7',folder:'v4',image:name+'-standing.png',blinkImage:fs.existsSync(path.join(out,name+'-blink-v1.png'))?name+'-blink-v1.png':name+'-standing.png',flow:name+'-standing.flow',flowSize:128,flowGrid:[4,4],flowRange:0,views:angles.map((angle,i)=>({rect:[i%4/4,1-(Math.floor(i/4)+1)/4,.25,.25],layout:[0,0,1,1],mouth:[.5,.5,0],sourceCell:i,angle}))}};
}
if(!blinkBuild)fs.writeFileSync(manifestFile,'// Measured crop, mouth and view data. Source PNGs are unchanged.\nexport const MASCOT_VIEWS = '+JSON.stringify(manifest)+';\n');
})();
