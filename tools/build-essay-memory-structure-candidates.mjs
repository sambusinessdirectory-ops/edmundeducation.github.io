// Build a review ledger from the authored Task 2 mapping and sentence-support bank.
// These are candidates. No record is released without item-level editorial review.
import fs from 'node:fs';
import vm from 'node:vm';
const read = file => fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const catalogContext={window:{}};
vm.runInNewContext(read('essay-memory-catalog.js'),catalogContext);
const catalog=catalogContext.window.ESSAY_MEMORY_CATALOG;
const authored=JSON.parse(read('tools/essay-memory-structure-mapping.json'));
const bank=JSON.parse(read('writing-sentence-support-data.json'));
const formulaOverrides=JSON.parse(read('tools/essay-memory-formula-overrides.json'));
const curated={window:{}};
for(const file of ['essay-memory-lessons-data.js','essay-80-memory-data.js'])vm.runInNewContext(read(file),curated);

function sourceFor(meta){
  const current=curated.window.ESSAY_MEMORY_LESSONS?.[meta.key] || (meta.key==='opinion:80' && curated.window.ESSAY_80_MEMORY_DATA);
  if(current)return current;
  const context={window:{}};
  vm.runInNewContext(read(`essay-memory-lessons/${meta.id}.js`),context);
  return context.window.ESSAY_MEMORY_LESSONS?.[meta.key];
}

function matchFormula(formula,source){
  const pieces=String(formula).split(/(\[[^\]]+\])/).filter(Boolean);
  if(pieces.some((piece,index)=>index>0 && piece.startsWith('[') && pieces[index-1].startsWith('[')))return null;
  const fixed=pieces.map((piece,index)=>({text:piece.trim(),index}))
    .filter(item=>!item.text.startsWith('[') && (/[a-z]{3}/i.test(item.text)||/\b(?:so|if)\b/i.test(item.text)||/^[,;:]$/.test(item.text)));
  if(!fixed.length)return null;
  let cursor=0,score=0;
  const spans=[];
  for(const {text:literal,index} of fixed){
    const lower=source.toLowerCase(),needle=literal.toLowerCase();
    let start=lower.indexOf(needle,cursor);
    while(start>=0 && ((/[a-z]/i.test(needle[0]) && start>0 && /[a-z]/i.test(source[start-1])) ||
      (/[a-z]/i.test(needle.at(-1)) && start+needle.length<source.length && /[a-z]/i.test(source[start+needle.length]))))
      start=lower.indexOf(needle,start+1);
    if(start<0)return null;
    // A sentence-opening frame cannot be borrowed from a word buried in a clause.
    if(index===0 && start!==0)return null;
    spans.push({start,end:start+needle.length,index});
    cursor=start+needle.length;
    score+=literal.replace(/[^a-z]/gi,'').length;
  }
  const parts=[];
  cursor=0;
  let previousPiece=-1;
  for(const span of spans){
    if(span.start>cursor){
      const slot=pieces.slice(previousPiece+1,span.index).find(piece=>piece.startsWith('['));
      if(!slot)return null;
      parts.push({text:source.slice(cursor,span.start),kind:'slot',label:slot.slice(1,-1)});
    } else if(pieces.slice(previousPiece+1,span.index).some(piece=>piece.startsWith('[')))return null;
    parts.push({text:source.slice(span.start,span.end),kind:'link',label:'句型固定部分'});
    cursor=span.end;
    previousPiece=span.index;
  }
  const trailing=pieces.slice(previousPiece+1).find(piece=>piece.startsWith('['));
  if(cursor<source.length){
    if(!trailing)return null;
    parts.push({text:source.slice(cursor),kind:'slot',label:trailing.slice(1,-1)});
  } else if(trailing)return null;
  if(parts.length<2)return null;
  if(parts.map(part=>part.text).join('')!==source)throw Error(`Lossy structure match: ${source}`);
  return {parts,score};
}
function displayedParts(parts,override){
  if(!override?.formula)return parts;
  const labels=[...override.formula.matchAll(/\[([^\]]+)\]/g)].map(match=>match[1]);
  let cursor=0;
  return parts.map(part=>part.kind==='slot'?{...part,label:labels[cursor++]||part.label}:part);
}
function structurePriority(row,match){
  const literals=row.formula.replace(/\[[^\]]+\]/g,' ').toLowerCase();
  const clauseRelation=/\b(?:because|instead of|rather than|although|whereas|while|so|if|when|unless|despite|which|as a result|by contrast)\b/.test(literals);
  const discourseRelation=/\b(?:however|therefore|nevertheless)\b/.test(literals);
  return (clauseRelation?150:discourseRelation?60:0)+match.score;
}

const result={};
const totals={task1:{sentences:0,mapped:0,bank:0,unmatched:0},task2:{sentences:0,mapped:0,bank:0,unmatched:0}};
for(const meta of catalog){
  const essay=sourceFor(meta);
  if(!essay?.sentences?.length)throw Error(`Missing source: ${meta.key}`);
  const group=meta.exam.endsWith('1')?'task1':'task2';
  result[meta.key]=essay.sentences.map((sentence,index)=>{
    totals[group].sentences++;
    const mapped=(authored[meta.key]||[])
      .filter(row=>row.paragraph===sentence.paragraph+1&&row.sentence===sentence.index+1)
      .map(row=>({row,match:matchFormula(row.formula,sentence.english)}))
      .filter(candidate=>candidate.match)
      .sort((a,b)=>structurePriority(b.row,b.match)-structurePriority(a.row,a.match)||a.row.row-b.row.row);
    if(mapped.length){
      totals[group].mapped++;
      const {row,match}=mapped[0];
      const explanation=formulaOverrides[row.formula] || row;
      return {index,source:{paragraph:sentence.paragraph+1,sentence:sentence.index+1},
        english:sentence.english,chinese:sentence.chinese,origin:'essay-mapping',sourceRow:row.row,
        formula:explanation.formula||row.formula,meaning:explanation.meaning,usage:explanation.usage,parts:displayedParts(match.parts,formulaOverrides[row.formula]),
        alternativeRows:mapped.slice(1).map(item=>({sourceRow:item.row.row,formula:formulaOverrides[item.row.formula]?.formula||item.row.formula})),reviewStatus:'candidate'};
    }
    const general=bank.map(row=>({row,match:matchFormula(row.formula,sentence.english)}))
      .filter(candidate=>candidate.match?.score>=4)
      .sort((a,b)=>b.match.score-a.match.score);
    if(general.length){
      totals[group].bank++;
      const {row,match}=general[0];
      const explanation=formulaOverrides[row.formula] || row;
      return {index,source:{paragraph:sentence.paragraph+1,sentence:sentence.index+1},
        english:sentence.english,chinese:sentence.chinese,origin:'sentence-support-bank',sourceRow:row.id,
        formula:explanation.formula||row.formula,meaning:explanation.meaning,usage:explanation.usage,parts:displayedParts(match.parts,formulaOverrides[row.formula]),reviewStatus:'candidate'};
    }
    totals[group].unmatched++;
    return {index,source:{paragraph:sentence.paragraph+1,sentence:sentence.index+1},
      english:sentence.english,chinese:sentence.chinese,origin:'unmatched',reviewStatus:'needs-authorship'};
  });
}
const output=new URL('./essay-memory-structure-candidates.json',import.meta.url);
fs.writeFileSync(output,JSON.stringify({totals,essays:result},null,2)+'\n');
console.log(JSON.stringify(totals,null,2));
