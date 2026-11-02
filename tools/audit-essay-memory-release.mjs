// Catalogue-wide release gate. A canonical source bundle is not an approved lesson.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const context={window:{}};
for(const file of ['essay-memory-catalog.js','essay-memory-release-manifest.js','essay-80-memory-data.js','essay-80-learning-support.js','essay-memory-lessons-data.js','essay-memory-new-support.js'])
  vm.runInNewContext(read(file),context,{filename:file});

const catalog=context.window.ESSAY_MEMORY_CATALOG;
assert.equal(catalog.length,288);
const sentenceGroups=JSON.parse(read('tools/essay-memory-sentence-groups.json'));
assert.equal(sentenceGroups.totals.essays,288);
assert.equal(sentenceGroups.totals.missingTerminalPunctuation,0);
const sourceFor=meta=>{
  if(meta.key==='opinion:80')return context.window.ESSAY_80_MEMORY_DATA;
  if(context.window.ESSAY_MEMORY_LESSONS?.[meta.key])return context.window.ESSAY_MEMORY_LESSONS[meta.key];
  const supportFile=`essay-memory-support/${meta.id}.js`;
  if(context.window.ESSAY_MEMORY_APPROVED?.[meta.key]||fs.existsSync(new URL(`../${supportFile}`,import.meta.url))){
    vm.runInNewContext(read(`essay-memory-lessons/${meta.id}.js`),context);
    vm.runInNewContext(read(supportFile),context);
    return context.window.ESSAY_MEMORY_LESSONS?.[meta.key];
  }
  const local={window:{}};
  vm.runInNewContext(read(`essay-memory-lessons/${meta.id}.js`),local);
  return local.window.ESSAY_MEMORY_LESSONS?.[meta.key];
};
const normalized=text=>String(text||'').replace(/\s+/g,' ').trim();
const checks=[];
for(const meta of catalog){
  const essay=sourceFor(meta);
  const issues=[];
  const fullSentences=sentenceGroups.essays[meta.key];
  if(!fullSentences?.length||[...new Set(fullSentences.flatMap(row=>row.sourceIndices))].join(',')!==essay?.sentences?.map((_,i)=>i).join(','))
    issues.push('incomplete-full-sentence-map');
  if(fullSentences?.some(row=>!/[。！？][”」』）]*$/.test(row.chinese.trim().replace(/\]$/,''))))
    issues.push('incomplete-chinese-sentence-ending');
  if(fullSentences?.some(row=>/原始 PDF 未提供中文翻譯|\btranslation missing\b/i.test(row.chinese)))
    issues.push('placeholder-chinese-translation');
  if(!essay || essay.id!==meta.id || essay.sentences?.length!==meta.sentenceCount)issues.push('canonical-source-mismatch');
  if(!essay?.audio || !essay?.sentences?.every(sentence=>sentence.english&&sentence.chinese&&sentence.words?.length))
    issues.push('incomplete-source-or-narration');
  const teachingSentences=essay?.learningSentences||essay?.sentences;
  if(essay?.learningSentences&&(!fullSentences||teachingSentences.length!==fullSentences.length||
      teachingSentences.some((row,i)=>row.english!==fullSentences[i].english||row.chinese!==fullSentences[i].chinese||
        row.sourceIndices?.join(',')!==fullSentences[i].sourceIndices.join(','))))issues.push('grouped-teaching-source-mismatch');
  if(meta.exam==='IELTS Writing Task 1' && !essay?.questionImages?.length)issues.push('missing-task1-question-image');
  const support=meta.key==='opinion:80'?context.window.ESSAY_80_LEARNING_SUPPORT:essay?.support;
  if(!support)issues.push('missing-teaching-support');
  if(support && meta.key!=='opinion:80'){
    if(!essay.meta?.topic||!essay.meta?.summary)issues.push('missing-lesson-orientation');
    if(support.sentences?.length!==teachingSentences.length)issues.push('sentence-support-count');
    else for(let i=0;i<teachingSentences.length;i++){
      const row=support.sentences[i],source=teachingSentences[i];
      if(!row.simple || normalized(row.simple).toLowerCase()===normalized(source.english).toLowerCase())issues.push(`simple-english-${i+1}`);
      if(normalized(row.chunks?.join(' '))!==normalized(source.english))issues.push(`source-chunks-${i+1}`);
      if(normalized(row.simpleChunks?.join(' '))!==normalized(row.simple))issues.push(`simple-chunks-${i+1}`);
      if((!meta.curated&&(row.chunks?.length<2||row.simpleChunks?.length<2))||row.chunks?.some(chunk=>!chunk)||row.simpleChunks?.some(chunk=>!chunk))
        issues.push(`one-choice-chunks-${i+1}`);
      const legitimatelyPlain=meta.curated&&source.english.split(/\s+/).length<=5;
      if((!row.synonyms?.length&&!legitimatelyPlain)||row.synonyms?.some(item=>!item.original||!item.simple||!item.meaning||
        !source.english.toLowerCase().includes(item.original.toLowerCase())||(!meta.curated&&!row.simple.toLowerCase().includes(item.simple.toLowerCase()))))
        issues.push(`unverified-vocabulary-${i+1}`);
    }
    if(support.structures?.length!==teachingSentences.length)issues.push('structure-count');
    else for(const [i,row] of support.structures.entries()){
      const source=teachingSentences[i];
      if(row.source?.paragraph!==source.paragraph+1||row.source?.sentence!==source.index+1)issues.push(`structure-source-${i+1}`);
      if((row.parts||[]).map(part=>part.text).join('')!==source.english)issues.push(`structure-spans-${i+1}`);
      if(!row.meaning||!row.usage||!row.frame)issues.push(`structure-explanation-${i+1}`);
      if((row.frame?.match(/\[[^\]]+\]/g)||[]).length!==(row.parts||[]).filter(part=>part.kind==='slot').length)
        issues.push(`structure-formula-slot-count-${i+1}`);
      if(/清楚陳述一項意思|在引言公平介紹題目中的一方觀點|列出具體內容後，接着說明觀眾/.test(row.usage||''))
        issues.push(`rejected-structure-usage-${i+1}`);
      if(/instead of/i.test(row.frame||'')&&/後續結果|預期結果不同/.test(row.usage||''))
        issues.push(`misread-instead-of-usage-${i+1}`);
      if(/\bso\b/i.test(row.frame||'')&&/觀眾預期|觀眾能從中得到/.test(row.usage||''))
        issues.push(`topic-bound-so-usage-${i+1}`);
      if(row.parts?.some(part=>!part.text||!['slot','link'].includes(part.kind)||!part.label))issues.push(`structure-part-label-${i+1}`);
      if(row.options?.length!==4||new Set(row.options).size!==4||row.explanations?.length!==4||row.explanations?.some(note=>!note)||!Number.isInteger(row.correct)||row.correct<0||row.correct>3)
        issues.push(`structure-choices-${i+1}`);
      else {
        const answer=row.options[row.correct].toLowerCase();
        let cursor=0;
        for(const part of row.parts||[]){
          if(part.kind!=='link')continue;
          const at=answer.indexOf(part.text.toLowerCase(),cursor);
          if(at<0){issues.push(`structure-answer-fixed-wording-${i+1}`);break;}
          cursor=at+part.text.length;
        }
      }
    }
    if(!support.intro?.length||!support.route?.length||!support.evidence?.length||!support.logic?.length)issues.push('missing-argument-map-stages');
    if((support.transfer?.length||0)<10)issues.push('fewer-than-ten-transfer-tasks');
    else for(const [i,item] of support.transfer.entries()){
      if(item.options?.length!==4||new Set(item.options).size!==4||item.explanations?.length!==4||item.explanations?.some(note=>!note)||!Number.isInteger(item.correct)||item.correct<0||item.correct>3)
        issues.push(`transfer-choices-${i+1}`);
      if(!item.context||!item.question||item.options?.some(option=>!/[\u3400-\u9fff]/.test(option)))issues.push(`transfer-language-${i+1}`);
      if(item.options?.length===4){
        const hanCounts=item.options.map(option=>(option.match(/[\u3400-\u9fff]/g)||[]).length);
        if(hanCounts.every(Boolean)&&Math.max(...hanCounts)-Math.min(...hanCounts)>3)
          issues.push(`transfer-answer-length-cue-${i+1}`);
      }
      if(!item.modelLink||!item.sourceSentenceIndices?.length||item.sourceSentenceIndices.some(n=>!Number.isInteger(n)||n<0||n>=teachingSentences.length))
        issues.push(`transfer-source-link-${i+1}`);
    }
    const coveredParagraphs=new Set(support.transfer?.flatMap(item=>item.sourceSentenceIndices||[]).map(index=>teachingSentences[index]?.paragraph));
    if(meta.exam==='IELTS Writing Task 2'&&(!coveredParagraphs.has(1)||!coveredParagraphs.has(2)))issues.push('transfer-misses-body-paragraph');
    if(meta.exam==='IELTS Writing Task 1'&&(!coveredParagraphs.has(1)||!coveredParagraphs.has(2)||!coveredParagraphs.has(3)))issues.push('transfer-misses-chart-section');
  }
  checks.push({key:meta.key,id:meta.id,exam:meta.exam,sourceSentences:essay?.sentences?.length||0,
    completeSentences:fullSentences?.length||0,
    released:context.window.ESSAY_MEMORY_APPROVED?.[meta.key]===true,teachingSupportPresent:!!support,issues});
}
const summaries={total:checks.length,sourceSentences:checks.reduce((sum,row)=>sum+row.sourceSentences,0),
  completeSentences:checks.reduce((sum,row)=>sum+row.completeSentences,0),
  sourceReady:checks.filter(row=>!row.issues.some(issue=>issue.includes('source')||issue.includes('narration')||issue.includes('image'))).length,
  released:checks.filter(row=>row.released).length,
  supportPresent:checks.filter(row=>row.teachingSupportPresent).length,
  unpublished:checks.filter(row=>!row.released).length,
  reviewedSupportPassing:checks.filter(row=>row.released&&row.issues.length===0).length,
  candidateSupportPassing:checks.filter(row=>!row.released&&row.teachingSupportPresent&&row.issues.length===0).length};
fs.writeFileSync(new URL('./essay-memory-release-ledger.json',import.meta.url),JSON.stringify({summaries,lessons:checks},null,2)+'\n');
console.log(JSON.stringify(summaries,null,2));
for(const row of checks.filter(row=>row.released&&row.issues.length))console.error(row.key,row.issues.join(','));
if(process.argv.includes('--require-complete') && (summaries.released!==summaries.total||checks.some(row=>row.issues.length)))
  throw Error('Full catalogue is not approved for release.');
