const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'tools/mascot-art/wardrobe/boys-smart-casual-trio');
const characters=['eddy','noir'];
const garments=[
 ['white-shirt-black-tie','WHITE SHIRT / BLACK TIE'],
 ['black-v-neck-collar-sweater','BLACK V-NECK SWEATER'],
 ['navy-blazer-cream-sweatshirt','NAVY BLAZER / CREAM']
];
const columns=[
 ['DARK · OPEN','3d-dark-open'],
 ['MID · BLINK','3d-blink'],
 ['LIGHT · OPEN','3d-light-open'],
 ['CAP + TOP + BOOTS · OPEN','combination-3d-open'],
 ['CAP + TOP + BOOTS · BLINK','combination-3d-blink']
];
const rows=garments.flatMap(([id,label])=>characters.map(character=>({id,label,character})));
const tile=400,gap=18,left=212,top=154,rowHeight=tile+58;
const width=left+columns.length*(tile+gap)+gap,height=top+rows.length*rowHeight+gap;
const escape=value=>String(value).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

(async()=>{
 const composites=[];
 for(let row=0;row<rows.length;row++){
  const {id,character}=rows[row],y=top+row*rowHeight;
  for(let col=0;col<columns.length;col++){
   const input=await sharp(path.join(dir,'qa-'+character+'-'+id+'-'+columns[col][1]+'.jpg')).resize(tile,tile,{fit:'fill'}).jpeg({quality:92}).toBuffer();
   composites.push({input,left:left+col*(tile+gap),top:y});
  }
 }
 const headings=columns.map((column,i)=>'<text x="'+(left+i*(tile+gap)+tile/2)+'" y="124" text-anchor="middle">'+escape(column[0])+'</text>').join('');
 const rowLabels=rows.map((row,i)=>{
  const y=top+i*rowHeight+tile/2;
  return '<text x="104" y="'+(y-9)+'" text-anchor="middle">'+escape(row.label)+'</text><text x="104" y="'+(y+18)+'" text-anchor="middle" fill="#b8aa99">'+row.character.toUpperCase()+'</text>';
 }).join('');
 const svg=Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">'+
  '<rect width="100%" height="100%" fill="#191817"/>'+
  '<text x="38" y="54" fill="#fff8ed" font-family="Arial,sans-serif" font-size="31" font-weight="700">BOYS SMART-CASUAL TRIO · VISUAL APPROVAL V1</text>'+
  '<text x="38" y="84" fill="#cfc2b2" font-family="Arial,sans-serif" font-size="18">96 registered directions · open/blink · light/dark · cap + boots · independent Eddy/Noir fits</text>'+
  '<g fill="#efe7db" font-family="Arial,sans-serif" font-size="14" font-weight="700">'+headings+rowLabels+'</g></svg>'
 );
 const board=path.join(dir,'qa-approval-v1.jpg');
 await sharp({create:{width,height,channels:3,background:'#191817'}}).composite([{input:svg,left:0,top:0},...composites]).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(board);

 for(const [id] of garments){
  const assetNames=[...characters.map(character=>'assets/speaking-system/cosmetics/'+character+'/'+id+'.webp'),'assets/speaking-system/cosmetics/shared/'+id+'-display.png'];
  const evidenceNames=[];for(const character of characters)for(const column of columns)evidenceNames.push('tools/mascot-art/wardrobe/boys-smart-casual-trio/qa-'+character+'-'+id+'-'+column[1]+'.jpg');
  evidenceNames.push('tools/mascot-art/wardrobe/boys-smart-casual-trio/qa-approval-v1.jpg');
  const manifest={
   schemaVersion:1,itemId:id,catalogGroup:'boys',revision:'v1',status:'pending',humanVisualAcceptance:false,characters,
   reviewRequirements:[
    'all 16 directions for Eddy and Noir in the actual 3D renderer',
    'open-eye and blink states',
    'dark, midtone and light renderer backgrounds',
    'independent Eddy and Noir fits with the correct front, side and rear garment construction',
    'tie, tie bar, collar, cuffs, V-neck, lapels, brass buttons and pocket square preserve the reference design where visible',
    'mane, tail, arms, hoof-hands, legs and identity preserve correct occlusion',
    'botanical-cap plus top plus shearling-boots compatibility',
    'garment overlay is confined to the upper-body band with zero generated body, mane, tail, leg or foot pixels',
    'no clipping, halos, holes, stretched shared overlay, colour contamination or stray extraction pixels'
   ],
   assets:Object.fromEntries(assetNames.map(name=>[name,hash(path.join(root,name))])),
   evidence:Object.fromEntries(evidenceNames.map(name=>[name,hash(path.join(root,name))]))
  };
  fs.writeFileSync(path.join(dir,'visual-acceptance-'+id+'-v1.json'),JSON.stringify(manifest,null,2)+'\n');
 }
 console.log(board);for(const [id] of garments)console.log(path.join(dir,'visual-acceptance-'+id+'-v1.json'));
})().catch(error=>{console.error(error);process.exitCode=1;});
