const path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'tools/mascot-art/wardrobe/girls-navy-cream-knit-vest');
const characters=['celeste','phoebe','elsie'];
const columns=[
 ['3D DARK · OPEN','3d-dark-open'],
 ['3D MID · BLINK','3d-blink'],
 ['3D LIGHT · OPEN','3d-light-open'],
 ['CAP COMBO · OPEN','combination-3d-open'],
 ['CAP COMBO · BLINK','combination-3d-blink']
];
const tile=348,gap=18,left=130,top=142,rowHeight=tile+62;
const width=left+columns.length*(tile+gap)+gap,height=top+characters.length*rowHeight+gap;
const escape=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

(async()=>{
 const composite=[];
 for(let row=0;row<characters.length;row++){
  const character=characters[row],y=top+row*rowHeight;
  for(let col=0;col<columns.length;col++){
   const file=path.join(dir,'qa-'+character+'-'+columns[col][1]+'.jpg');
   const input=await sharp(file).resize(tile,tile,{fit:'fill'}).jpeg({quality:92}).toBuffer();
   composite.push({input,left:left+col*(tile+gap),top:y});
  }
 }
 const headings=columns.map((column,i)=>'<text x="'+(left+i*(tile+gap)+tile/2)+'" y="112" text-anchor="middle">'+escape(column[0])+'</text>').join('');
 const rows=characters.map((character,i)=>{
  const y=top+i*rowHeight+tile/2;
  return '<text x="62" y="'+y+'" text-anchor="middle" transform="rotate(-90 62 '+y+')">'+character.toUpperCase()+'</text>';
 }).join('');
 const svg=Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">'+
  '<rect width="100%" height="100%" fill="#161922"/>'+
  '<text x="38" y="52" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="700">NAVY / CREAM SLEEVELESS KNIT VEST · VISUAL APPROVAL V1</text>'+
  '<text x="38" y="82" fill="#c7ccda" font-family="Arial,sans-serif" font-size="18">48 registered directions · original arms exposed · shallow V · open/blink · light/dark · compatible cap</text>'+
  '<g fill="#e9ebf3" font-family="Arial,sans-serif" font-size="16" font-weight="700">'+headings+rows+'</g></svg>'
 );
 await sharp({create:{width,height,channels:3,background:'#161922'}})
  .composite([{input:svg,left:0,top:0},...composite])
  .jpeg({quality:94,chromaSubsampling:'4:4:4'})
  .toFile(path.join(dir,'qa-approval-v1.jpg'));
 console.log(path.join(dir,'qa-approval-v1.jpg'));
})();
