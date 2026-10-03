const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/all-fish-bucket-race-cap');
const characters=['eddy','noir','celeste','phoebe','elsie'];
const labels={eddy:'Eddy',noir:'Noir',celeste:'Celeste',phoebe:'Phoebe',elsie:'Elsie'};
const hats=[
 {id:'navy-fish-bucket-hat',label:'NAVY FISH BUCKET HAT'},
 {id:'ivory-racecar-baseball-cap',label:'IVORY RACE-CAR BASEBALL CAP'}
];
const states=[
 ['3d-dark-open','Dark · open'],['3d-mid-blink','Mid · blink'],['3d-light-open','Light · open'],
 ['combination-3d-open','Clothes + boots · open'],['combination-3d-blink','Clothes + boots · blink']
];
const labelWidth=150,tile=270,gap=10,header=175,row=300,width=labelWidth+hats.length*states.length*(tile+gap)+30,height=header+characters.length*row;
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
 const text=[];
 text.push(`<rect width="100%" height="100%" fill="#282725"/>`);
 text.push(`<text x="34" y="48" fill="#f7f2e7" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">Two all-character hats — actual-renderer approval board</text>`);
 for(let hi=0;hi<hats.length;hi++){
  const groupX=labelWidth+hi*states.length*(tile+gap),groupWidth=states.length*(tile+gap)-gap;
  text.push(`<text x="${groupX+groupWidth/2}" y="88" text-anchor="middle" fill="${hi?'#e9dcc4':'#a9c1e8'}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">${escape(hats[hi].label)}</text>`);
  for(let si=0;si<states.length;si++)text.push(`<text x="${groupX+si*(tile+gap)+tile/2}" y="130" text-anchor="middle" fill="#bdb4a6" font-family="Arial, Helvetica, sans-serif" font-size="14">${escape(states[si][1])}</text>`);
 }
 for(let ci=0;ci<characters.length;ci++)text.push(`<text x="28" y="${header+ci*row+55}" fill="#f7f2e7" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">${labels[characters[ci]]}</text>`);
 const composites=[{input:Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${text.join('')}</svg>`)}];
 for(let ci=0;ci<characters.length;ci++)for(let hi=0;hi<hats.length;hi++)for(let si=0;si<states.length;si++){
  const character=characters[ci],hat=hats[hi],state=states[si][0];
  const image=await sharp(path.join(qa,`qa-${character}-${hat.id}-${state}.jpg`)).resize(tile,tile,{fit:'contain'}).jpeg({quality:91}).toBuffer();
  composites.push({input:image,left:labelWidth+(hi*states.length+si)*(tile+gap),top:header+ci*row});
 }
 const board=path.join(qa,'qa-approval-v1.jpg');
 await sharp({create:{width,height,channels:3,background:'#282725'}}).composite(composites).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile(board);
 for(const hat of hats){
  const assetNames=[
   ...characters.flatMap(character=>[`assets/speaking-system/cosmetics/${character}/${hat.id}.webp`,`assets/speaking-system/cosmetics/${character}/${hat.id}-hide.webp`]),
   `assets/speaking-system/cosmetics/shared/${hat.id}-display.png`
  ];
  const evidenceNames=[];
  for(const character of characters)for(const state of states)evidenceNames.push(`tools/mascot-art/wardrobe/all-fish-bucket-race-cap/qa-${character}-${hat.id}-${state[0]}.jpg`);
  evidenceNames.push('tools/mascot-art/wardrobe/all-fish-bucket-race-cap/qa-approval-v1.jpg');
  const manifest={
   schemaVersion:1,itemId:hat.id,catalogGroup:'all',revision:'v1',status:'pending-review',humanVisualAcceptance:false,characters,
   reviewRequirements:[
    'all 16 directions for all five characters in the actual 3D renderer',
    'open-eye and blink states',
    'dark, midtone and light renderer backgrounds',
    'independent character fits above the eyes with character-specific ear openings',
    'the navy item remains a cylindrical bucket hat with a continuous 360-degree brim and no baseball visor',
    'the ivory item remains a six-panel baseball cap with a curved front visor and red race-car embroidery',
    'high-risk compatible clothing plus shearling-boots combinations',
    'no mane through the crown, eye obstruction, floating hat, flat rectangular cut, reversed view, halo or edge speckle'
   ],
   assets:Object.fromEntries(assetNames.map(name=>[name,hash(path.join(root,name))])),
   evidence:Object.fromEntries(evidenceNames.map(name=>[name,hash(path.join(root,name))]))
  };
  fs.writeFileSync(path.join(qa,`visual-acceptance-${hat.id}-v1.json`),JSON.stringify(manifest,null,2)+'\n');
 }
 console.log(board);for(const hat of hats)console.log(path.join(qa,`visual-acceptance-${hat.id}-v1.json`));
})().catch(error=>{console.error(error);process.exitCode=1;});
