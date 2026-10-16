#!/usr/bin/env node
// Derive production status from saved records. A count is never a sign-off.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateCatalogue} from './schema.mjs';
const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const expressions=read(path.join(root,'sources/expressions.json'));
const occurrences=read(path.join(root,'sources/occurrences.json'));
const draftDir=path.join(root,'drafts');
const draftFiles=fs.existsSync(draftDir)?fs.readdirSync(draftDir).filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f)).sort():[];
const records=[],fileErrors=[];
for(const file of draftFiles){
 try{const value=read(path.join(draftDir,file));records.push(...(Array.isArray(value)?value:value.lessons||[]));}
 catch(error){fileErrors.push({file,error:error.message});}
}
const validation=validateCatalogue(records);
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const hashes=new Map(records.map(record=>[record.id,createHash('sha256').update(JSON.stringify(canonical(record))).digest('hex')]));
const rawHashes=new Map(records.map(record=>[record.id,createHash('sha256').update(JSON.stringify(record)).digest('hex')]));
const reviewedIds=new Set();
const passedHashes=new Map(),sourceOnlyTransforms=[];
const reviewsDir=path.join(root,'reviews');
if(fs.existsSync(reviewsDir))for(const file of fs.readdirSync(reviewsDir).filter(f=>f.endsWith('.json'))){
 try{const review=read(path.join(reviewsDir,file));if(review.type==='verified-source-only-transformation')sourceOnlyTransforms.push(...review.changes||[]);const rows=Array.isArray(review.lessons)?review.lessons:Array.isArray(review.records)?review.records:[];for(const row of rows){
  const id=row.lessonId||row.moduleId||row.id,hash=row.reviewedRecordSha256||row.canonicalContentSha256||row.contentSha256;
  const passed=row.assessment==='no_blocking_editorial_issue_found_in_AI_review'||row.assessment==='targeted_text_changes_acceptable_in_AI_review'||row.findingResolution==='resolved_in_AI_followup'||row.state==='editorial-passed'||review.result==='editorial-passed'||row.english==='passed'&&row.traditionalChinese==='passed';
  if(passed&&hash){if(!passedHashes.has(id))passedHashes.set(id,new Set());passedHashes.get(id).add(hash);if(hash===hashes.get(id)||hash===rawHashes.get(id))reviewedIds.add(id);}
 }}catch(error){fileErrors.push({file,error:error.message});}
}
// Provenance additions cannot silently erase an earlier language review, but
// inherit it only after verifying the exact prior record and unchanged teaching data.
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const teaching=value=>{const copy=structuredClone(value);delete copy.sources;return copy;};
const proofRecords=new Map([...records,...sourceOnlyTransforms.map(c=>c.beforeRecord).filter(Boolean)].map(r=>[digest(r),r]));
for(let pass=0;pass<=sourceOnlyTransforms.length;pass++){
 let added=false;
 for(const change of sourceOnlyTransforms){
  const before=change.beforeRecord,after=proofRecords.get(change.afterSha256),known=passedHashes.get(change.moduleId);
  if(!before||!after||!known?.has(change.beforeSha256)||known.has(change.afterSha256))continue;
  if(before.id===change.moduleId&&after.id===change.moduleId&&digest(before)===change.beforeSha256&&digest(teaching(before))===digest(teaching(after))){known.add(change.afterSha256);added=true;}
 }
 if(!added)break;
}
for(const [id,hash] of hashes)if(passedHashes.get(id)?.has(hash))reviewedIds.add(id);
const aliases=new Map();
for(const file of fs.existsSync(draftDir)?fs.readdirSync(draftDir).filter(f=>/^aliases-.*\.json$/.test(f)):[]){
 const data=read(path.join(draftDir,file));for(const alias of Array.isArray(data)?data:data.aliases||[]){
  const id=alias.inventoryId||alias.sourceInventoryId;if(id)aliases.set(id,alias);
 }
}
const states={};for(const record of records){const state=record.review?.state||'unrecorded';states[state]=(states[state]||0)+1;}
const draftedIds=new Set(records.map(r=>r.id));
const reservation=expressions.map((expression,index)=>({
 inventoryId:expression.inventory_id,moduleId:`advanced-native-${String(index+1).padStart(3,'0')}`,
 number:index+1,sourcePhrase:expression.phrase,occurrences:expression.occurrence_ids,
 state:index<10?'existing-approved-baseline':aliases.has(expression.inventory_id)?'mapped-alias':draftedIds.has(`advanced-native-${String(index+1).padStart(3,'0')}`)?records.find(r=>r.number===index+1)?.review?.state||'drafted':'received',
 ...(aliases.has(expression.inventory_id)?{canonicalModuleId:aliases.get(expression.inventory_id).canonicalId||aliases.get(expression.inventory_id).targetModuleId}:{}),
 needsSenseReview:expression.needs_sense_review
}));
const audioDir=path.join(root,'audio-state');
const audioRecords=fs.existsSync(audioDir)?fs.readdirSync(audioDir).filter(f=>/^[a-f\d]{64}\.json$/.test(f)).map(f=>read(path.join(audioDir,f))):[];
const status={updatedAt:new Date().toISOString(),sourceOccurrences:occurrences.length,uniqueSourceLabels:expressions.length,existingBaselineLessons:10,savedDraftLessons:records.length,aiEditorialReviewedCurrentRevision:reviewedIds.size,aliasesMapped:aliases.size,states,structuralErrors:validation.errors.length,structuralWarnings:validation.warnings.length,fileErrors,newAudioFiles:audioRecords.filter(r=>r.status==='produced').length,newAudioListeningReviewed:audioRecords.filter(r=>r.listeningReview==='passed').length,newLessonsLive:records.filter(r=>r.review?.state==='live').length,pendingSourceLabels:reservation.filter(r=>r.state==='received').length,completion:false};
fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(path.join(root,'reservation-register.json'),JSON.stringify(reservation,null,2)+'\n');
fs.writeFileSync(path.join(root,'progress.json'),JSON.stringify(status,null,2)+'\n');
fs.writeFileSync(path.join(root,'validation-current.json'),JSON.stringify(validation,null,2)+'\n');
fs.writeFileSync(path.join(root,'editorial-coverage.json'),JSON.stringify({reviewedCurrentIds:[...reviewedIds].sort(),reviewedCurrentRecords:[...reviewedIds].sort().map(id=>({id,canonicalContentSha256:hashes.get(id)})),notReviewedCurrentIds:records.filter(record=>!reviewedIds.has(record.id)).map(record=>record.id),humanApprovalClaimed:false},null,2)+'\n');
console.log(JSON.stringify(status,null,2));
