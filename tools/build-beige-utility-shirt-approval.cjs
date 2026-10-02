const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'tools/mascot-art/wardrobe/beige-utility-shirt');
const item='beige-utility-shirt';
const characters=['eddy','noir'];
const columns=[
 ['BARE · DARK OPEN','bare-3d-dark-open'],
 ['SHIRT · DARK OPEN',item+'-3d-dark-open'],
 ['SHIRT · MID BLINK',item+'-3d-blink'],
 ['SHIRT · LIGHT OPEN',item+'-3d-light-open'],
 ['CAP + SHIRT + BOOTS · OPEN',item+'-combination-3d-open'],
 ['CAP + SHIRT + BOOTS · BLINK',item+'-combination-3d-blink']
];
const tile=390,gap=14,left=165,top=135,rowHeight=tile+62;
const width=left+columns.length*(tile+gap)+gap,height=top+characters.length*rowHeight+gap;
const hash=name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
const escape=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
(async()=>{
 const composites=[];
 for(let row=0;row<characters.length;row++)for(let col=0;col<columns.length;col++){
  const character=characters[row],suffix=columns[col][1];
  const name='qa-'+character+'-'+suffix+'.jpg';
  const input=await sharp(path.join(dir,name)).resize(tile,tile,{fit:'fill'}).jpeg({quality:92}).toBuffer();
  composites.push({input,left:left+col*(tile+gap),top:top+row*rowHeight});
 }
 const headings=columns.map(([label],i)=>'<text x="'+(left+i*(tile+gap)+tile/2)+'" y="111" text-anchor="middle">'+escape(label)+'</text>').join('');
 const rowLabels=characters.map((name,i)=>'<text x="84" y="'+(top+i*rowHeight+tile/2)+'" text-anchor="middle">'+name.toUpperCase()+'</text>').join('');
 const svg=Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">'+
  '<rect width="100%" height="100%" fill="#191817"/>'+
  '<text x="32" y="51" fill="#fff8ed" font-family="Arial,sans-serif" font-size="30" font-weight="700">BEIGE ROLLED-SLEEVE UTILITY SHIRT · REVIEW V1</text>'+
  '<text x="32" y="79" fill="#cfc2b2" font-family="Arial,sans-serif" font-size="17">Actual 3D standing renderer · 16 views per character · open/blink · light/dark · cap and boots</text>'+
  '<g fill="#efe7db" font-family="Arial,sans-serif" font-size="13" font-weight="700">'+headings+rowLabels+'</g></svg>'
 );
 const board=path.join(dir,'qa-approval-v1.jpg');
 await sharp({create:{width,height,channels:3,background:'#191817'}})
  .composite([{input:svg,left:0,top:0},...composites])
  .jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(board);
 const assetNames=[
  ...characters.map(c=>'assets/speaking-system/cosmetics/'+c+'/'+item+'.webp'),
  'assets/speaking-system/cosmetics/shared/'+item+'-display.png'
 ];
 const evidenceNames=[];
 for(const character of characters)for(const [,suffix] of columns)
  evidenceNames.push('tools/mascot-art/wardrobe/beige-utility-shirt/qa-'+character+'-'+suffix+'.jpg');
 evidenceNames.push('tools/mascot-art/wardrobe/beige-utility-shirt/qa-approval-v1.jpg');
 evidenceNames.push('tools/mascot-art/wardrobe/beige-utility-shirt/qa-detail-v1.jpg');
 const manifest={
  schemaVersion:1,itemId:item,catalogGroup:'boys',revision:'v1',status:'pending-review',
  humanVisualAcceptance:false,characters,
  reviewRequirements:[
   'same-angle bare and shirt comparison for Eddy and Noir in the actual standing 3D renderer',
   'all 16 directions for both characters, including fronts, profiles, rear and diagonals',
   'open-eye and blink states with exact runtime atlases',
   'dark, midtone and light renderer backgrounds',
   'independent shirt fit with pointed collar, twin flap pockets, rolled sleeves and curved hem',
   'face, eyes, ears, bridle, mane, wrist hooves, legs and tail retain canonical identity and occlusion',
   'botanical-cap plus shirt plus shearling-boots compatibility',
   'no clipping, background matte, white halo, missing cells or copied character overlay'
  ],
  assets:Object.fromEntries(assetNames.map(name=>[name,hash(name)])),
  evidence:Object.fromEntries(evidenceNames.map(name=>[name,hash(name)]))
 };
 const file=path.join(dir,'visual-acceptance-beige-utility-shirt-v1.json');
 fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
 console.log(board);
 console.log(file);
})().catch(error=>{console.error(error);process.exitCode=1;});
