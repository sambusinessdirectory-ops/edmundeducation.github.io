import {createHash} from 'node:crypto';
import {existsSync,readdirSync,readFileSync} from 'node:fs';
import {dirname,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const wardrobe=join(root,'tools/mascot-art/wardrobe');
const allowPending=process.argv.includes('--allow-pending');
const expectedCharacters=['eddy','noir','celeste','phoebe','elsie'];
const manifests=[];

for(const entry of readdirSync(wardrobe,{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 for(const file of readdirSync(join(wardrobe,entry.name))){
  if(/^visual-acceptance(?:-[\w-]+)?\.json$/.test(file))manifests.push(join(wardrobe,entry.name,file));
 }
}
if(!manifests.length)throw Error('No wardrobe visual-acceptance manifests were found.');

const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const file of manifests){
 const label=relative(root,file),manifest=JSON.parse(readFileSync(file,'utf8'));
 if(manifest.schemaVersion!==1)throw Error(`${label}: unsupported schemaVersion`);
 if(!manifest.itemId||!manifest.revision)throw Error(`${label}: itemId and revision are required`);
 if(JSON.stringify(manifest.characters)!==JSON.stringify(expectedCharacters))throw Error(`${label}: all five characters must be listed in canonical order`);
 if(!Array.isArray(manifest.reviewRequirements)||manifest.reviewRequirements.length<6)throw Error(`${label}: visual review requirements are incomplete`);
 for(const group of ['assets','evidence']){
  const entries=Object.entries(manifest[group]||{});
  if(!entries.length)throw Error(`${label}: ${group} cannot be empty`);
  for(const [name,expected] of entries){
   const absolute=join(root,name);
   if(!existsSync(absolute))throw Error(`${label}: missing ${group} file ${name}`);
   if(!/^[0-9a-f]{64}$/.test(expected))throw Error(`${label}: invalid SHA-256 for ${name}`);
   const actual=hash(absolute);
   if(actual!==expected)throw Error(`${label}: ${name} changed after its review evidence was recorded`);
  }
 }
 if(!Object.keys(manifest.evidence).some(name=>name.endsWith('/qa-approval-v2.jpg')))throw Error(`${label}: a consolidated visual approval board is required`);
 if(manifest.status!=='accepted'||manifest.humanVisualAcceptance!==true||typeof manifest.approvedBy!=='string'||!manifest.approvedBy.trim()||!Number.isFinite(Date.parse(manifest.approvedAt))){
  const message=`${label}: visual approval is pending. Review the locked evidence and record explicit human acceptance before release.`;
  if(!allowPending)throw Error(message);
  console.warn('PENDING',message);
  continue;
 }
 console.log('ACCEPTED',manifest.itemId,manifest.revision,'by',manifest.approvedBy,'at',manifest.approvedAt);
}
console.log(`Validated ${manifests.length} wardrobe visual-acceptance manifest(s)${allowPending?' (pending review allowed locally)':''}.`);
