export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize=value=>String(value??'').normalize('NFKC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
export function excerpt(text,query,size=190){const q=normalize(query),clean=String(text).replace(/\s+/g,' ').trim(),at=normalize(clean).indexOf(q),start=Math.max(0,at-65);return(start?'…':'')+clean.slice(start,start+size)+(start+size<clean.length?'…':'');}
export function sourceLabel(source){return source?.page?`第 ${source.label||source.page} 頁${String(source.label||source.page)!==String(source.page)?`（PDF 第 ${source.page} 頁）`:''}`:'課文未有完全相同的詞形';}
export function sourceLink(source){return source?.page?`<a class="poly-source" href="./library.html?view=materials&amp;lesson=${Number(source.lesson)}&amp;page=${Number(source.page)}" target="_blank" rel="noopener">課文首次出現：${escapeHtml(sourceLabel(source))} ↗</a>`:'';}
export function searchContent({materials,dialogues,polysemy},query){
 const q=normalize(query);if(!q)return [];const results=[];
 for(const lesson of materials)for(const page of lesson.pages)if(normalize(page.text).includes(q))results.push({kind:'課文',lesson:lesson.lesson,title:lesson.title,location:sourceLabel(page),text:excerpt(page.text,q),href:`./library.html?view=materials&lesson=${lesson.lesson}&page=${page.page}&q=${encodeURIComponent(query)}`});
 for(const d of dialogues)for(const [i,line]of d.lines.entries())if(normalize(line.en+' '+line.zh).includes(q))results.push({kind:'對話',lesson:d.lesson,title:d.titleZh,location:`${d.variant==='beginner'?'初階':'專業'} · 第 ${i+1} 句`,text:line.en+' '+line.zh,href:`./dialogue.html?id=${encodeURIComponent(d.id)}&line=${i}&q=${encodeURIComponent(query)}`});
 for(const data of polysemy)for(const w of data.words)if(normalize([w.word,...w.senses.map(s=>s.zh),...w.questions.map(s=>s.en+' '+s.zh)].join(' ')).includes(q))results.push({kind:'一詞多義',lesson:data.lesson,title:w.word,location:sourceLabel(w.source),text:w.senses.map(s=>s.zh).join(' · '),href:`./polysemy.html?lesson=${data.lesson}&word=${encodeURIComponent(w.id)}`});
 return results;
}
export function phraseKey(dialogue,line,start,end){return `bookmark:phrase:${dialogue}:${line}:${start}:${end}`;}
export function phraseRanges(saved,dialogue,line){return saved.filter(b=>b.type==='phrase'&&b.dialogue===dialogue&&b.line===line&&Number.isInteger(b.start)&&Number.isInteger(b.end)&&b.end>b.start);}
export function playlistItems(playlist,saved){const byKey=new Map(saved.map(b=>[b.key,b]));return [...new Set(playlist.items||[])].map(key=>byKey.get(key)).filter(Boolean);}
