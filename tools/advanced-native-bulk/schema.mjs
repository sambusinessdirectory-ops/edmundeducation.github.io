/** Canonical Advanced Native authoring format; pure validation and compilation. */
import pronunciationConfig from './pronunciation-overrides.json' with {type:'json'};
export const PRONUNCIATION_OVERRIDE_VERSION=pronunciationConfig.version;
export function requiredPronunciationVersion(text){return new RegExp(pronunciationConfig.textPattern,'i').test(String(text))?pronunciationConfig.version:undefined;}
export function audioIdentityPayload(clip){
 const version=requiredPronunciationVersion(clip.text);
 return {text:clip.text,voice:clip.voice,lang:clip.lang,speed:clip.speed,v:1,...(version?{pronunciationOverrideVersion:version}:{})};
}
export function hasRequiredPronunciation(clip,row){
 const version=requiredPronunciationVersion(clip.text);
 if(!version)return true;
 const evidence=row?.pronunciation,lexemes=[...String(clip.text).matchAll(new RegExp(pronunciationConfig.textPattern,'gi'))].map(m=>m[0].toLowerCase());
 if(row?.pronunciationOverrideVersion!==version||evidence?.version!==version||typeof evidence.phonemesBefore!=='string'||typeof evidence.phonemesAfter!=='string'||!evidence.phonemesBefore||evidence.phonemesBefore===evidence.phonemesAfter||!Array.isArray(evidence.replacements))return false;
 const expected=new Map();for(const word of lexemes)expected.set(word,(expected.get(word)||0)+1);
 if(evidence.replacements.length!==expected.size)return false;
 const seen=new Set();
 const listed=evidence.replacements.every(change=>{
  const rule=pronunciationConfig.languages[clip.lang]?.[change.lexeme];
  if(!rule||seen.has(change.lexeme)||change.count!==expected.get(change.lexeme)||change.before!==rule.before||change.after!==rule.after)return false;
  seen.add(change.lexeme);return true;
 });
 if(!listed)return false;
 // Reproduce the Python whole-token/count substitution, rather than trusting a
 // version label or a declared list of replacements in stale/tampered metadata.
 const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const separators=pronunciationConfig.phonemeSeparators.replace(/[\\\]\[\-^]/g,'\\$&');
 let corrected=evidence.phonemesBefore;
 for(const [word,count] of [...expected].sort(([a],[b])=>a.localeCompare(b,'en'))){
  const rule=pronunciationConfig.languages[clip.lang]?.[word];
  const token=new RegExp(`(?<![^${separators}])${escape(rule.before)}(?=$|[${separators}])`,'g');
  if([...corrected.matchAll(token)].length!==count)return false;
  corrected=corrected.replace(token,()=>rule.after);
 }
 return corrected===evidence.phonemesAfter;
}
export const SCHEMA_VERSION=1;
export const CATEGORIES={
 'phrasal-verb':'動詞片語 · Phrasal verb',
 idiom:'慣用語 · Idiom or set phrase',
 figurative:'比喻用法 · Figurative use',
 natural:'自然英文 · Natural English'
};
export const AUDIO_SETTINGS=[
 {role:'listening',voice:'af_heart',lang:'en-us',speed:.96},
 {role:'speaking',voice:'bm_fable',lang:'en-gb',speed:.98},
 {role:'takeaway-1',voice:'bm_fable',lang:'en-gb',speed:.98},
 {role:'takeaway-2',voice:'bf_isabella',lang:'en-gb',speed:1.05}
];
export const normalise=value=>String(value).normalize('NFC').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().toLocaleLowerCase('en');
const chinese=/[\u3400-\u9fff]/;
const english=/[a-zA-Z]{2}/;
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const includesEnglish=value=>english.test(value||'');
const newRegex=pattern=>new RegExp(pattern,'i');
export function targetRanges(text,pattern){return [...String(text).matchAll(new RegExp(pattern,'gi'))].map(match=>({start:match.index,end:match.index+match[0].length,text:match[0]}));}
export function validateRecord(record,{release=false}={}){
 const errors=[],warnings=[];
 const fail=(path,message)=>errors.push({lessonId:record?.id||null,path,message});
 const warn=(path,message)=>warnings.push({lessonId:record?.id||null,path,message});
 const requireText=(value,path)=>{if(!nonempty(value))fail(path,'Required nonempty text.');};
 const requireZh=(value,path)=>{requireText(value,path);if(nonempty(value)&&!chinese.test(value))fail(path,'Traditional Chinese support is missing.');};
 if(!record||typeof record!=='object'||Array.isArray(record))return {errors:[{path:'record',message:'Lesson must be an object.'}],warnings};
 if(!/^advanced-native-\d{3,}$/.test(record.id||''))fail('id','Expected immutable advanced-native-NNN lesson ID.');
 if(!Number.isSafeInteger(record.number)||record.number<1)fail('number','Expected positive display number.');
 for(const field of ['titleEn','titleZh'])requireText(record[field],field);
 requireZh(record.titleZh,'titleZh');
 if(!CATEGORIES[record.category])fail('category','Use phrasal-verb, idiom, figurative, or natural.');
 if(record.cardTitleLines!==undefined&&(!Array.isArray(record.cardTitleLines)||record.cardTitleLines.join('')!==record.titleZh))fail('cardTitleLines','Title lines must reconstruct the complete Chinese title.');
 let pattern=null;
 try{pattern=newRegex(record.target?.pattern);if(!nonempty(record.target?.pattern)||pattern.test(''))fail('target.pattern','Reviewed pattern must not match empty text.');}
 catch(error){fail('target.pattern',`Invalid regular expression: ${error.message}`);}
 for(const field of ['meaningEn','meaningZh','grammar','register','boundaryZh','misconceptionZh','outcomeZh'])requireText(record.brief?.[field],`brief.${field}`);
 if(!Array.isArray(record.sources)||!record.sources.length)fail('sources','Keep at least one exact source occurrence.');
 for(const [index,source] of (Array.isArray(record.sources)?record.sources:[]).entries()){
  if(!source||typeof source!=='object'){fail(`sources[${index}]`,'Source occurrence must be an object.');continue;}
  for(const field of ['file','sentence','expression'])requireText(source[field],`sources[${index}].${field}`);
  if(!['source_sentence','guide_original_example'].includes(source.referenceSentenceKind))fail(`sources[${index}].referenceSentenceKind`,'Distinguish the original source sentence from an example newly written by the guide.');
  if(!/^[a-f\d]{64}$/.test(source.sha256||''))fail(`sources[${index}].sha256`,'Required source file SHA-256.');
  if(!Number.isSafeInteger(source.page)||source.page<1)fail(`sources[${index}].page`,'Use one-based actual PDF page.');
  for(const field of ['book','question','sample'])if((source[field]===null||source[field]===undefined)&&!nonempty(source.locatorNote))fail(`sources[${index}].${field}`,'Missing locator needs an explicit locatorNote; do not invent one.');
 }
 const checkTarget=(text,path)=>{if(pattern&&!pattern.test(text||''))fail(path,'Required teaching target is not covered by the reviewed pattern.');};
 const checkSentence=(sentence,path)=>{
  requireText(sentence?.en,`${path}.en`);requireZh(sentence?.zh,`${path}.zh`);
  if(sentence?.en&&(/[<>]|_{3,}/.test(sentence.en)))fail(`${path}.en`,'Teaching sentences must be plain text without HTML or blank cues.');
 };
 const checkQuestion=(q,path,{reply=false,listening=false}={})=>{
  if(!q){fail(path,'Required question missing.');return;}
  if(!nonempty(q.promptEn)&&!nonempty(q.promptZh))fail(`${path}.prompt`,'A question prompt is required.');
  if(nonempty(q.promptEn))requireZh(q.promptZh,`${path}.promptZh`);
  requireZh(q.explanationZh,`${path}.explanationZh`);
  if(/第[一二三四1234](?:句|項(?!好處)|個選項)|選項\s*[ABCDＡＢＣＤ]|[ABCDＡＢＣＤ]\s*選項/.test(q.explanationZh||''))fail(`${path}.explanationZh`,'Options are shuffled: explain the wording or meaning, never a displayed position or letter.');
  if(!Array.isArray(q.options)){fail(`${path}.options`,'Options must be an array.');return;}
  if(q.options.length<(reply||listening?4:3)||q.options.length>4)fail(`${path}.options`,reply||listening?'Exactly four options required.':'Use three or four options.');
  const ids=new Set(),texts=new Set();
  for(const [index,option] of (q.options||[]).entries()){
   if(!option||typeof option!=='object'){fail(`${path}.options[${index}]`,'Option must be an object.');continue;}
   requireText(option.id,`${path}.options[${index}].id`);requireText(option.en,`${path}.options[${index}].en`);
   if(!/^[a-z][a-z\d-]*$/.test(option.id||''))fail(`${path}.options[${index}].id`,'Option ID must be a stable lowercase token.');
   if(includesEnglish(option.en)&&!chinese.test(option.en))requireZh(option.zh,`${path}.options[${index}].zh`);
   if(ids.has(option.id))fail(`${path}.options[${index}].id`,'Duplicate option identity.');ids.add(option.id);
   const text=normalise(option.en);if(texts.has(text))fail(`${path}.options[${index}].en`,'Duplicate option text.');texts.add(text);
  }
  const key=reply?q.goldenId:q.answerId;
  if(!ids.has(key))fail(`${path}.${reply?'goldenId':'answerId'}`,'Key does not reference an existing option ID.');
  if(reply&&pattern){
   const matched=(q.options||[]).filter(o=>o&&pattern.test(o.en));
   if(matched.length!==1||matched[0]?.id!==q.goldenId)fail(`${path}.goldenId`,'Exactly one reply must match the target and it must be the golden reply.');
  }
 };
 checkSentence(record.listening,'listening');checkTarget(record.listening?.en,'listening.en');checkQuestion(record.listening,'listening',{listening:true});
 checkQuestion(record.reply,'reply',{reply:true});
 for(const key of ['scene','contrast','dialogue'])checkQuestion(record[key],key);
 checkSentence(record.speaking,'speaking');checkTarget(record.speaking?.en,'speaking.en');requireZh(record.speaking?.promptZh,'speaking.promptZh');
 const span=record.speaking?.targetSpan,text=record.speaking?.en||'';
 if(!span||!Number.isInteger(span.start)||!Number.isInteger(span.end)||span.start<0||span.end<=span.start||span.end>text.length)fail('speaking.targetSpan','Required exact UTF-16 target span {start,end}.');
 else{
  const removed=text.slice(span.start,span.end);
  if(pattern&&!pattern.test(removed))fail('speaking.targetSpan','Selected speaking chunk does not contain the target.');
  const cloze=text.slice(0,span.start)+'__________________'+text.slice(span.end);
  if(pattern&&pattern.test(cloze))fail('speaking.targetSpan','Target still leaks through the cloze.');
  if(record.speaking.cloze!==undefined&&record.speaking.cloze!==cloze)fail('speaking.cloze','Only the approved target span may be replaced.');
 }
 requireZh(record.writing?.promptZh,'writing.promptZh');requireZh(record.writing?.selfCheckZh,'writing.selfCheckZh');
 const examples=Array.isArray(record.writing?.examples)?record.writing.examples:[];
 if(examples.length!==2)fail('writing.examples','Exactly two complete suggested answers required.');
 for(const [index,example] of examples.entries()){checkSentence(example,`writing.examples[${index}]`);checkTarget(example?.en,`writing.examples[${index}].en`);if(nonempty(example?.en)&&!/[.!?]["'’”]?$/.test(example.en.trim()))fail(`writing.examples[${index}].en`,'Use complete punctuated suggested answers.');}
 const glossary=Array.isArray(record.writing?.glossary)?record.writing.glossary:[];
 if(glossary.length<4||glossary.length>6)fail('writing.glossary','Use four to six useful answer-derived rows.');
 const glossaryKeys=new Set();
 for(const [index,row] of glossary.entries()){
  if(!row||typeof row!=='object'){fail(`writing.glossary[${index}]`,'Glossary row must be an object.');continue;}
  const base=`writing.glossary[${index}]`;requireText(row.en,`${base}.en`);requireZh(row.zh,`${base}.zh`);
  const example=examples[row.exampleIndex],sourceText=example?.en||'';
  if(!Number.isInteger(row.exampleIndex)||row.exampleIndex<0||row.exampleIndex>=examples.length)fail(`${base}.exampleIndex`,'Point to an actual suggested answer, zero based.');
  if(!row.span||!Number.isInteger(row.span.start)||!Number.isInteger(row.span.end)||row.span.start<0||row.span.end<=row.span.start||row.span.end>sourceText.length||normalise(sourceText.slice(row.span.start,row.span.end))!==normalise(row.en))fail(`${base}.span`,'Exact glossary source span is missing or stale.');
  if(!normalise(sourceText).includes(normalise(row.en)))fail(`${base}.en`,'Glossary row is not an exact contiguous answer span.');
  if(pattern&&pattern.test(row.en||''))fail(`${base}.en`,'Glossary reveals a target form.');
  for(const forbidden of record.target?.glossaryForbidden||[]){try{if(newRegex(forbidden).test(row.en||''))fail(`${base}.en`,'Glossary reveals a reviewed target fragment.');}catch{fail('target.glossaryForbidden','Invalid exclusion pattern.');}}
  if(row.span&&example&&pattern&&targetRanges(sourceText,record.target.pattern).some(range=>row.span.start<range.end&&row.span.end>range.start))fail(`${base}.span`,'Glossary overlaps the target in its source answer.');
  const key=normalise(row.en);if(glossaryKeys.has(key))fail(`${base}.en`,'Duplicate glossary row.');glossaryKeys.add(key);
 }
 if(record.takeaways?.length!==2)fail('takeaways','Exactly two takeaway sentences required.');
 for(const [index,takeaway] of (Array.isArray(record.takeaways)?record.takeaways:[]).entries()){
  checkSentence(takeaway,`takeaways[${index}]`);checkTarget(takeaway?.en,`takeaways[${index}].en`);
 }
 const clipTexts=[record.listening?.en,record.speaking?.en,...(Array.isArray(record.takeaways)?record.takeaways:[]).map(t=>t?.en)];
 for(const [index,text] of clipTexts.entries())if(typeof text==='string'&&(text.length>240||/[_<]/.test(text)))fail(`audio[${index}]`,'Audio text must be at most 240 characters and contain no cloze or markup, matching the pinned generator.');
 if(clipTexts.every(nonempty)&&new Set(clipTexts.map(normalise)).size!==4)fail('audio','Four distinct teaching sentences are required so exact-text audio keys cannot overwrite the British speaking voice.');
 const stage=record.review?.state;
 if(!stage)warn('review.state','Record production state before handoff.');
 if(release){
  for(const key of ['english','chinese','media','qa']){
   const evidence=record.review?.[key];
   if(evidence?.status!=='passed'||!nonempty(evidence.reviewer)||!nonempty(evidence.evidence))fail(`review.${key}`,'Release needs a passed review with named reviewer and evidence.');
  }
  if(record.review?.holdReason)fail('review.holdReason','An unresolved hold cannot be released.');
 }
 return {errors,warnings};
}
export function validateCatalogue(records,options={}){
 const errors=[],warnings=[],ids=new Set(),numbers=new Set(),expressions=new Map();
 for(const record of records){
  const result=validateRecord(record,options);errors.push(...result.errors);warnings.push(...result.warnings);
  if(!record||typeof record!=='object')continue;
  if(ids.has(record.id))errors.push({lessonId:record.id,path:'id',message:'Duplicate lesson ID.'});ids.add(record.id);
  if(numbers.has(record.number))errors.push({lessonId:record.id,path:'number',message:'Duplicate display number.'});numbers.add(record.number);
  const expression=normalise(record.titleEn);
  if(expressions.has(expression))warnings.push({lessonId:record.id,path:'titleEn',message:`Duplicate normalized expression; compare sense with ${expressions.get(expression)}.`});else expressions.set(expression,record.id);
 }
 return {errors,warnings};
}
const STEP_COPY=[
 ['audio','先聽意思','聽懂情境','先只聽英文，不看逐字稿；判斷說話者的意思。'],
 ['reply','回應提問','四種回答，都說得通','有人問你一個問題。四個回應都正確；選出使用本課表達的回應，會得到金句標記。'],
 ['scene','選對情境','甚麼時候會這樣說？','讀一個新情境，判斷表達是否合適。'],
 ['contrast','分清界線','避免用得太闊','辨別相似但意思不同的情況。'],
 ['branch','接續對話','把表達放入對話','既要自然，也要照顧對方的語境。'],
 ['speak','聽後開口','先聽示範，再自己說','先聽完整示範，再看保留空格的句子說出本課表達；錄音屬選做，也可跳過。'],
 ['final','換境應用','在新情境自己寫','先寫自己的英文，再對照多個自然示例。這是自我檢查，不會按字面一致評分。']
];
const rotate=(values,id)=>{const hash=[...id].reduce((v,c)=>((v*33)^c.codePointAt(0))>>>0,5381),shift=hash%values.length;return [...values.slice(shift),...values.slice(0,shift)];};
export function compileRecord(record){
 const result=validateRecord(record);if(result.errors.length)throw new Error(`${record.id}: ${result.errors.map(error=>`${error.path}: ${error.message}`).join('\n')}`);
 const qid=style=>`${record.id}-${style==='reply'?'v2':'v1'}-${style}`;
 const mc=(source,style,allCorrect=false)=>{
  const options=rotate(source.options.map(o=>o.en),qid(style)),golden=source.options.find(o=>o.id===source.goldenId)?.en;
  return {id:qid(style),type:'mc',style,prompt:source.promptEn||source.promptZh,promptZh:source.promptEn?source.promptZh:undefined,options,optionZh:Object.fromEntries(source.options.map(o=>[o.en,o.zh])),optionIds:Object.fromEntries(source.options.map(o=>[o.en,o.id])),answers:allCorrect?[...options]:[source.options.find(o=>o.id===source.answerId).en],...(allCorrect?{allCorrect:true,golden}:{}),explanation:source.explanationZh};
 };
 const questions=[mc(record.listening,'audio'),mc(record.reply,'reply',true),mc(record.scene,'scene'),mc(record.contrast,'contrast'),mc(record.dialogue,'branch'),{id:qid('final'),type:'open',style:'final',prompt:record.writing.promptZh,answers:record.writing.examples.map(e=>e.en),answersZh:Object.fromEntries(record.writing.examples.map(e=>[e.en,e.zh])),explanation:record.writing.selfCheckZh,glossary:record.writing.glossary.map(row=>[row.en,row.zh])}];
 const span=record.speaking.targetSpan,cloze=record.speaking.en.slice(0,span.start)+'__________________'+record.speaking.en.slice(span.end);
 const steps=STEP_COPY.map(([style,label,title,intro])=>({id:qid(style),style,label,title,intro,questions:style==='speak'?[]:[qid(style)],...(style==='audio'?{model:record.listening.en,zh:record.listening.zh,audioOnly:true}:{}),...(style==='speak'?{model:record.speaking.en,displayModel:cloze,zh:record.speaking.zh,speakingPrompt:record.speaking.promptZh,recording:'phrase'}:{})}));
 return {id:record.id,number:record.number,titleZh:record.titleZh,titleEn:record.titleEn,...(record.cardTitleLines?{cardTitleLines:record.cardTitleLines}:{}),kind:CATEGORIES[record.category],summary:record.brief.outcomeZh,meaning:record.brief.meaningZh,course:'advanced-native',slug:record.id,heading:record.titleEn,surpriseLabel:'',steps,questions,takeaways:record.takeaways.map(t=>t.en),takeawaysZh:Object.fromEntries(record.takeaways.map(t=>[t.en,t.zh])),completionTitle:'本課練習已完成！',targetPattern:record.target.pattern,contentRevision:record.contentRevision||1};
}
export function audioQueue(record){return AUDIO_SETTINGS.map((setting,index)=>{
 const text=[record.listening.en,record.speaking.en,...record.takeaways.map(t=>t.en)][index],version=requiredPronunciationVersion(text);
 return {moduleId:record.id,text,...setting,...(version?{pronunciationOverrideVersion:version}:{})};
});}
