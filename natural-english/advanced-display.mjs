import {esc} from './catalogue.mjs?v=20261015-bilingual-v1';

// Reviewed surface forms. New lessons must add their forms before publication.
export const targetPatterns={
 'advanced-native-001':String.raw`\bstay(?:s|ed|ing)?\s+in\s+(?:my|your|his|her|our|their|one['’]s)\s+comfort\s+zone\b`,
 'advanced-native-002':String.raw`\bcoast(?:s|ed|ing)?\s+along\b`,
 'advanced-native-003':String.raw`\bwake[- ]up\s+call\b`,
 'advanced-native-004':String.raw`\b(?:throw|throws|threw|throwing|thrown)(?:\s+(?:me|you|him|her|us|them))?\s+in\s+at\s+the\s+deep\s+end\b`,
 'advanced-native-005':String.raw`\bthe\s+making\s+of\s+(?:me|you|him|her|us|them|someone|a\s+person)\b`,
 'advanced-native-006':String.raw`\bback(?:s|ed|ing)?\s+out\b`,
 'advanced-native-007':String.raw`\b(?:get|gets|got|getting)\s+through\s+(?:it|this)\b`,
 'advanced-native-008':String.raw`\b(?:come|comes|came|coming)\s+out\s+stronger\b`,
 'advanced-native-009':String.raw`\bstepping\s+stone\b`,
 'advanced-native-010':String.raw`\bstumbling\s+block\b`
};

// Keep the last two words together without changing the spoken/source text.
// Intersect highlight ranges with the tail so inflected targets still match.
export function englishText(value,moduleId,tone){
 const text=String(value),pattern=tone&&targetPatterns[moduleId];
 const ranges=pattern?[...text.matchAll(new RegExp(pattern,'gi'))].map(m=>[m.index,m.index+m[0].length]):[];
 const tail=/\S+\s+\S+\s*$/.exec(text)?.index??text.length;
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
  return negative?html.replace(/不宜|不像|不符合|不正確|不適合|不是|不能|不應|不可/g,word=>`<strong class="negative-cue">${word}</strong>`):html;
 };
 return parts.map(part=>{
  const tail=/[\u3400-\u9fff]{2}[，。！？；：）)」』】〉》〕］\]？?！!]*$/.exec(part);
  const content=tail?safe(part.slice(0,tail.index))+`<span class="text-tail">${safe(tail[0])}</span>`:safe(part);
  return `<span class="zh-phrase">${content}</span>`;
 }).join('');
}

export function promptText(value){
 const text=String(value),question=/(?:哪句|哪個|哪一)[^。！？]*[？?]$/.exec(text);
 return question?.index>0?chineseText(text.slice(0,question.index),true)+`<span class="question-ask">${chineseText(question[0],true)}</span>`:chineseText(text,true);
}
