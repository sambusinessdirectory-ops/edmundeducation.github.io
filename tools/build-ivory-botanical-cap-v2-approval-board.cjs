const path=require('node:path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const qa=path.join(root,'tools/mascot-art/wardrobe/ivory-botanical-cap');
const characters=['eddy','noir','celeste','phoebe','elsie'];
const labels={eddy:'Eddy',noir:'Noir',celeste:'Celeste',phoebe:'Phoebe',elsie:'Elsie'};
const width=2240,rowHeight=540,header=150;

const svgText=(text,x,y,size,weight=600)=>Buffer.from(`<svg width="${width}" height="${header+rowHeight*characters.length}" xmlns="http://www.w3.org/2000/svg"><text x="${x}" y="${y}" fill="#f7f2e7" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}">${text}</text></svg>`);

(async()=>{
 const height=header+rowHeight*characters.length;
 const composites=[
  {input:Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#282725"/><text x="70" y="70" fill="#f7f2e7" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">Ivory botanical cap V2 — visual approval board</text><text x="290" y="128" fill="#bdb4a6" font-family="Arial, Helvetica, sans-serif" font-size="22">Cap alone · open</text><text x="810" y="128" fill="#bdb4a6" font-family="Arial, Helvetica, sans-serif" font-size="22">Cap alone · blink</text><text x="1288" y="128" fill="#bdb4a6" font-family="Arial, Helvetica, sans-serif" font-size="22">Combination · open</text><text x="1808" y="128" fill="#bdb4a6" font-family="Arial, Helvetica, sans-serif" font-size="22">Combination · blink</text></svg>`)},
 ];
 for(let index=0;index<characters.length;index++){
  const character=characters[index],top=header+index*rowHeight;
  composites.push({input:svgText(labels[character],28,top+52,30),left:0,top:0});
  for(const [column,file] of [
   [0,`qa-${character}-3d-open.jpg`],
   [1,`qa-${character}-3d-blink.jpg`],
   [2,`qa-${character}-combination-3d-open.jpg`],
   [3,`qa-${character}-combination-3d-blink.jpg`],
  ]){
   const input=await sharp(path.join(qa,file)).resize(500,500,{fit:'contain'}).jpeg({quality:92}).toBuffer();
   composites.push({input,left:140+column*520,top:top+20});
  }
 }
 await sharp({create:{width,height,channels:3,background:'#282725'}}).composite(composites).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile(path.join(qa,'qa-approval-v2.jpg'));
 console.log(path.join(qa,'qa-approval-v2.jpg'));
})().catch(error=>{console.error(error);process.exitCode=1;});
