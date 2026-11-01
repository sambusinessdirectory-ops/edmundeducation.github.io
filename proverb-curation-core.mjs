export const stages = [[1,'一眼懂','Meaning at a glance'],[2,'找線索','Spot the clue'],[3,'選語氣','Choose the tone'],[5,'用諺語回應','Say it naturally'],[6,'避開誤用','Know the boundary'],[7,'出手檢查','Ready to use'],[8,'60 題練習','Practice']];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Stable Fisher–Yates shuffle uses IDs alone, never correctness or answer length.
export function shuffled(options, id) {
 let seed=2166136261; for(const c of id) seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const out=options.map((option,index)=>({...option,sourceIndex:index}));
 for(let i=out.length-1;i>0;i--){seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);const j=Math.floor(((t^(t>>>14))>>>0)/4294967296*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}
export function evaluate(options,index){
 const choice=options[index];if(!choice)return null;
 return {correct:choice.correct===true,reasons:choice.correct?options.map(o=>o.reasonZh):[choice.reasonZh]};
}

export function highlightedOptions(options) {
  const texts = options.map((option) => String(option || ""));
  const words = texts.map((value) => [...value.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)]
    .map((match) => ({ value: match[0].toLocaleLowerCase("en"), start: match.index, end: match.index + match[0].length })));
  const renderRanges = (text, ranges) => {
    let cursor = 0;
    let result = "";
    for (const { start, end } of ranges) {
      result += `${escapeHtml(text.slice(cursor, start))}<mark class="diff">${escapeHtml(text.slice(start, end))}</mark>`;
      cursor = end;
    }
    return result + escapeHtml(text.slice(cursor));
  };

  // Progressively align the words shared by every option. A pairwise LCS keeps
  // the work quadratic as the number of choices grows.
  const commonWords = words.slice(1).reduce((shared, next) => {
    const lengths = Array.from({ length: shared.length + 1 }, () => new Uint16Array(next.length + 1));
    for (let i = shared.length - 1; i >= 0; i -= 1) {
      for (let j = next.length - 1; j >= 0; j -= 1) {
        lengths[i][j] = shared[i] === next[j].value
          ? 1 + lengths[i + 1][j + 1]
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
      }
    }
    const result = [];
    let i = 0;
    let j = 0;
    while (i < shared.length && j < next.length) {
      if (shared[i] === next[j].value) {
        result.push(shared[i]);
        i += 1; j += 1;
      } else if (lengths[i + 1][j] >= lengths[i][j + 1]) i += 1;
      else j += 1;
    }
    return result;
  }, words[0].map((word) => word.value));
  const shared = words.map(() => new Set());
  words.forEach((optionWords, optionIndex) => {
    let commonIndex = 0;
    optionWords.forEach((word, wordIndex) => {
      if (word.value === commonWords[commonIndex]) {
        shared[optionIndex].add(wordIndex);
        commonIndex += 1;
      }
    });
  });
  return texts.map((value, optionIndex) => {
    const ranges = [];
    words[optionIndex].forEach((word, wordIndex) => {
      if (shared[optionIndex].has(wordIndex)) return;
      const previous = ranges.at(-1);
      if (previous && previous.lastWordIndex === wordIndex - 1) {
        previous.end = word.end;
        previous.lastWordIndex = wordIndex;
      } else ranges.push({ start: word.start, end: word.end, lastWordIndex: wordIndex });
    });
    return renderRanges(value, ranges);
  });
}

