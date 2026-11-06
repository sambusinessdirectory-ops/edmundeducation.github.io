import {esc} from './catalogue.mjs?v=20261024-books10-16-730';
import importedTargetPatterns from './advanced-targets.generated.mjs?v=20261024-books10-16-730';

// Reviewed surface forms. New lessons must add their forms before publication.
export const targetPatterns={
 'advanced-native-001':String.raw`\bstay(?:s|ed|ing)?\s+in\s+(?:my|your|his|her|our|their|one['’]s)\s+comfort\s+zone\b`,
 'advanced-native-002':String.raw`\bcoast(?:s|ed|ing)?\s+along\b`,
 'advanced-native-003':String.raw`\bwake[- ]up\s+call\b`,
 'advanced-native-004':String.raw`\b(?:throw|throws|threw|throwing|thrown)(?:\s+(?:me|you|him|her|us|them))?\s+in\s+at\s+the\s+deep\s+end\b`,
 'advanced-native-005':String.raw`\bthe\s+making\s+of\s+(?:me|you|him|her|us|them|someone|a\s+person)\b`,
 'advanced-native-006':String.raw`\bback(?:s|ed|ing)?\s+out\b`,
 'advanced-native-007':String.raw`\b(?:get|gets|got|getting)\s+through\s+(?:it|this(?=$|[.!?,;:]|\s+(?:with|by|together|after|before|despite|while|although|and|because|when)\b)|(?:a|the|this|that)\s+(?:storm|ordeal|crisis|difficult\s+week|hard\s+period|recovery)(?=$|[.!?,;:]|\s+(?:with|by|together|after|before|despite|while|although|and|because|when)\b))\b`,
 'advanced-native-008':String.raw`\b(?:come|comes|came|coming)\s+out\s+stronger\b`,
 'advanced-native-009':String.raw`\bstepping\s+stones?\b`,
 'advanced-native-010':String.raw`\bstumbling\s+block\b`,
 ...importedTargetPatterns
};

// Keep the last two words together without changing the spoken/source text.
// Intersect highlight ranges with the tail so inflected targets still match.
export function englishText(value,moduleId,tone){
 const text=String(value),pattern=tone&&targetPatterns[moduleId];
 const ranges=pattern?[...text.matchAll(new RegExp(pattern,'gi'))].map(m=>[m.index,m.index+m[0].length]):[];
 // A hyphen is also a legal word boundary: keeping "solving skills" together
 // allows a long "problem-solving skills" tail to fit a narrow phone screen.
 const finalWord=/\S+\s*$/.exec(text);
 // A cloze is a visual cue, not a word to bind to the preceding possessive.
 const ending=/[^\s-]+[\s-]+[^\s-]+\s*$/.exec(text);
 let tail=finalWord?.[0].includes('_')?finalWord.index:ending?.index??text.length;
 // A standalone separator is not the first of two words. Bind the preceding
 // word too, so an alternative such as "control / plans" stays meaningful.
 if(!finalWord?.[0].includes('_')&&ending&&/^[^A-Za-z0-9_]+\s/.test(ending[0])){
  const preceding=/[^\s-]+[\s-]+$/.exec(text.slice(0,ending.index));
  if(preceding)tail=preceding.index;
 }
 const render=(start,end)=>{
  let cursor=start,html='';
  for(const [a,b] of ranges){
   const left=Math.max(start,a),right=Math.min(end,b);
   if(left>=right)continue;
   html+=esc(text.slice(cursor,left))+`<mark class="target-highlight target-${tone}">${esc(text.slice(left,right))}</mark>`;cursor=right;
  }
  return html+esc(text.slice(cursor,end));
 };
 return render(0,tail)+(tail<text.length?`<span class="text-tail">${render(tail,text.length)}</span>`:'');
}

export function chineseText(value,negative=false){
 const text=String(value),parts=[];let start=0;
 for(let i=0;i<text.length;i++)if('，。！？；：'.includes(text[i])){
  while(i+1<text.length&&'）)」』】〉》〕］]'.includes(text[i+1]))i++;
  parts.push(text.slice(start,i+1));start=i+1;
 }
 if(start<text.length)parts.push(text.slice(start));
 const safe=value=>{
  const html=esc(value);
  return negative?html.replace(/不充分支持|未完整呈現|理解錯了|不足以|不屬於|不符合|不正確|不適合|不合適|不恰當|不支持|不利於|不代表|不表示|不一定|不宜|不像|不是|不能|不應|不可|不必|不夠|不由|未能|未必|沒有|並非|而非|忽略/g,word=>`<strong class="negative-cue">${word}</strong>`):html;
 };
 return parts.map(part=>{
  const tail=/[\u3400-\u9fff]{2}[，。！？；：）)」』】〉》〕］\]？?！!]*$/.exec(part)
   ||/[A-Za-z][A-Za-z0-9’']*[\s-]+[A-Za-z][A-Za-z0-9’']*[，。！？；：.,;:!?）)」』】〉》〕］\]]*$/.exec(part);
  const content=tail?safe(part.slice(0,tail.index))+`<span class="text-tail">${safe(tail[0])}</span>`:safe(part);
  return `<span class="zh-phrase">${content}</span>`;
 }).join('');
}

export function promptText(value){
 const text=String(value),question=/(?:哪句|哪個|哪一|哪種|哪項|哪段|何者)[^。！？]*[？?]$/.exec(text);
 return question?.index>0?chineseText(text.slice(0,question.index),true)+`<span class="question-ask">${chineseText(question[0],true)}</span>`:chineseText(text,true);
}
