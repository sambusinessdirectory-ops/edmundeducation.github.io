const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'tools/mascot-art/wardrobe/all-brown-shearling-lace-boots');
const characters=['eddy','noir','celeste','phoebe','elsie'];
const columns=[
 ['BOOTS · DARK OPEN','3d-dark-open'],
 ['BOOTS · BLINK','3d-blink'],
 ['BOOTS · LIGHT OPEN','3d-light-open'],
 ['HIGH-RISK COMBO · OPEN','combination-3d-open'],
 ['HIGH-RISK COMBO · BLINK','combination-3d-blink']
];
const tile=400,gap=18,left=140,top=152,rowHeight=tile+62;
const width=left+columns.length*(tile+gap)+gap,height=top+characters.length*rowHeight+gap;
const escape=value=>String(value).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

(async()=>{
 const composites=[];
 for(let row=0;row<characters.length;row++){
  const character=characters[row],y=top+row*rowHeight;
  for(let col=0;col<columns.length;col++){
   const input=await sharp(path.join(dir,`qa-${character}-${columns[col][1]}.jpg`)).resize(tile,tile,{fit:'fill'}).jpeg({quality:92}).toBuffer();
   composites.push({input,left:left+col*(tile+gap),top:y});
  }
 }
 const headings=columns.map((column,i)=>`<text x="${left+i*(tile+gap)+tile/2}" y="122" text-anchor="middle">${escape(column[0])}</text>`).join('');
 const rows=characters.map((character,i)=>{
  const y=top+i*rowHeight+tile/2;
  return `<text x="66" y="${y}" text-anchor="middle" transform="rotate(-90 66 ${y})">${character.toUpperCase()}</text>`;
 }).join('');
 const svg=Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`+
  '<rect width="100%" height="100%" fill="#191817"/>'+
  '<text x="38" y="54" fill="#fff8ed" font-family="Arial,sans-serif" font-size="31" font-weight="700">BROWN SHEARLING LACE-UP BOOTS · VISUAL APPROVAL V1</text>'+
  '<text x="38" y="84" fill="#cfc2b2" font-family="Arial,sans-serif" font-size="18">80 registered directions · exact ground contact · open/blink · light/dark · boys jacket + girls long-gown compatibility</text>'+
  `<g fill="#efe7db" font-family="Arial,sans-serif" font-size="15" font-weight="700">${headings}${rows}</g></svg>`
 );
 const board=path.join(dir,'qa-approval-v1.jpg');
 await sharp({create:{width,height,channels:3,background:'#191817'}}).composite([{input:svg,left:0,top:0},...composites]).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(board);

 const assetNames=[...characters.map(character=>`assets/speaking-system/cosmetics/${character}/brown-shearling-lace-boots.webp`),'assets/speaking-system/cosmetics/shared/brown-shearling-lace-boots-display.png'];
 const evidenceNames=[];
 for(const character of characters)for(const column of columns)evidenceNames.push(`tools/mascot-art/wardrobe/all-brown-shearling-lace-boots/qa-${character}-${column[1]}.jpg`);
 evidenceNames.push('tools/mascot-art/wardrobe/all-brown-shearling-lace-boots/qa-approval-v1.jpg');
 const manifest={
  schemaVersion:1,itemId:'brown-shearling-lace-boots',catalogGroup:'all',revision:'v1',status:'pending',humanVisualAcceptance:false,
  characters,
  reviewRequirements:[
   'all 16 directions for Eddy, Noir, Celeste, Phoebe and Elsie in the actual 3D renderer',
   'open-eye and blink states',
   'dark, midtone and light renderer backgrounds',
   'character-specific boot fit with no stretched shared overlay',
   'identical canonical sole ground contact with no leg-length change or floating',
   'correct toe, profile, heel and diagonal direction without reversed views',
   'boys blue-jacket and girls long ivory-gown compatibility',
   'no doubled hoof, tail contamination, torso patch, clipping or stray generation-edge pixels'
  ],
  assets:Object.fromEntries(assetNames.map(name=>[name,hash(path.join(root,name))])),
  evidence:Object.fromEntries(evidenceNames.map(name=>[name,hash(path.join(root,name))]))
 };
 fs.writeFileSync(path.join(dir,'visual-acceptance-v1.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(board);console.log(path.join(dir,'visual-acceptance-v1.json'));
})().catch(error=>{console.error(error);process.exitCode=1;});
