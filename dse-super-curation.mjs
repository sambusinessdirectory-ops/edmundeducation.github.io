import {openSuperCuration} from './ielts-super-curation.mjs?v=20261026-dse1';
import {nativeBlock,handleMazeClick} from './dse-listening-question-ui.mjs?v=20261026-dse1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fingerprint=async value=>{
 // Pages moves known images to the asset host; that does not change the paper.
 const text=JSON.stringify(value).replaceAll('https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/','');
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join('');
};
const image=(src,alt)=>`<a href="${esc(src)}" target="_blank" rel="noopener" aria-label="放大原題圖：${esc(alt)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="eager"></a>`;
const routes={17:{A4:'O',B4:'O',B5:'O',B6:'M'},18:{A5:'O',B5:'O',B4:'O',B3:'O',C3:'O',D3:'O',E3:'O',E4:'O',F4:'O'}};
let cached;
export async function openDseSuperCuration({data,guide,tracks,task=1,storageScope='local'}){
 if(data?.year!==2018||guide?.year!==2018)throw Error('目前只開放 2018 Part A 試行。');
 if(!cached){const r=await fetch('dse-curation-data/2018.json?v=20261026-dse1',{credentials:'omit'});if(!r.ok)throw Error('DSE Curation 資料未能載入。');cached=await r.json();}
 const {curation,content:base}=cached;
 const [dataHash,guideHash]=await Promise.all([fingerprint(data),fingerprint(guide)]);
 if(dataHash!==curation.source.questionDataSha256||guideHash!==curation.source.guideSha256)throw Error('2018 題目或題解書已更新，請先重新核對 Curation。');
 for(const p of curation.parts){
  if(tracks.get(`2018:part-a:${p.part}`)?.url!==p.audioUrl)throw Error('2018 錄音版本不相符，請重新載入錄音庫。');
  if(await fingerprint(base.transcript[p.part])!==p.transcriptSha256)throw Error('2018 錄音稿版本不相符。');
 }
 const content={...base,
  renderOriginal(p){
   const blocks=p.blocks.map((b,i)=>{
    let html=b.type==='template'?b.html.replace(/\{\{(\d+)\}\}/g,'<b class="isc-source-blank">($1) _____</b>'):b.type==='heading'?`<h3>${esc(b.text)}</h3>`:b.type==='image'?image(b.src,b.alt):b.type==='maze'?nativeBlock({...b,example:true,cells:b.cells||{}},new Map()).replace('<h4>Example</h4>',`<h4>${b.example?'Example':`Q${b.number} · ${esc(b.prompt)}`}</h4>`):'';
    return `<section>${html}<details><summary>題目中文對照</summary><p class="isc-source-zh">${esc(p.translation.blocks[i])}</p></details></section>`;
   }).join('');
   return `<p>${esc(p.instruction)}</p><p lang="zh-Hant">${esc(p.translation.instruction)}</p>${blocks}<details><summary>查看原卷頁面 · 可按圖放大</summary>${p.pages.map(page=>image(`assets/dse-listening/2018/paper-page-${page}.jpg`,`2018 Part A 原卷第 ${page} 頁`)).join('')}</details>`;
  },
  renderContext(q){
   if(q.number===14){const example=base.parts[1].blocks.find(b=>b.type==='maze'&&b.example);return `<details class="isc-context" open><summary>Monster Maze 圖例 · Q14–16</summary><p>Q14 _____（上方）</p>${nativeBlock(example,new Map())}<p>Q15 _____（下方）</p><p>↑ Forward · ← Left · → Right · ↓ Backward</p><p>灰格 = Q16 _____ · O = route taken · M = landed on a hidden monster</p></details>`;}
   if(q.number>=30&&q.number<=33)return `<details class="isc-context" open><summary>原題畫作 · Q30–33</summary>${image('assets/dse-listening/2018/games-painting.webp','上方圈 Q30；右方圈 Q31；左方小圈 Q32；下方大圈 Q33')}<p>上方 Q30 · 右方 Q31 · 左方小圈 Q32 · 下方大圈 Q33<br>錄音依序講 Q32 → Q31 → Q30 → Q33；按位置填答。</p></details>`;
   if(q.number>=34&&q.number<=37)return `<p class="isc-source-sentence">Most of these games use (34) ____ because the game designers enjoy the challenge of using (35) ____ with (36) ____ to make (37) ____.</p>`;
   return '';
  },
  renderAnswer(q,value){return q.maze?`<div class="isc-maze-answer"><p>你的路線 · ↑ Forward · ← Left · → Right · ↓ Backward</p>${nativeBlock(q.maze,new Map([[q.number,value]]))}</div>`:null;},
  handleAnswerClick(target,drafts){const answers=new Map(Object.entries(drafts).map(([q,a])=>[Number(q),a]));if(!handleMazeClick(target,answers))return false;for(const [q,a] of answers)drafts[q]=a;return true;},
  renderSolution(q,cue,revealed){return q.maze&&revealed?`<div class="isc-maze-solution" aria-label="Q${q.number} 示範路線">${nativeBlock({...q.maze,example:true,cells:routes[q.number]},new Map()).replace('<h4>Example</h4>','<h4>示範路線 · 對照自己的格子</h4>')}</div>`:'';}
 };
 return openSuperCuration({prepared:{curation,content},part:task,storageScope});
}
