(() => {
  'use strict';
  const labels = ['用字','字量','速度','清晰度','連讀與弱讀','俚語與俗語'];
  const english = ['Lexical resources','Lyrical density','Speed / BPM','Vocal clarity','Connected speech & reductions','Slang & idioms'];
  const hints = ['詞彙是否常見、抽象或帶比喻','單位時間內需處理的歌詞量','節拍與實際唱詞的推進速度','辨清人聲的難度；越難辨聽，分數越高','音與音相連、省音和弱讀的程度','口語縮略、慣用語及文化表達的負擔'];
  const starLevel = total => total<=16?1:total<=27?2:total<=38?3:total<=49?4:5;
  const getData = song => window.SONG_DIFFICULTY_DATA?.[song.slug];
  const element = (tag, className, text) => {const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
  function stars(data) {const total=data.scores.reduce((a,b)=>a+b,0), level=starLevel(total);const el=element('span','difficulty-stars','★'.repeat(level)+'☆'.repeat(5-level));el.setAttribute('aria-label',`難度 ${level} / 5 星，${total} / 60 分`);return el;}
  function card(song) {
    const data=getData(song);if(!data)return null;
    const box=element('div','song-card-difficulty');
    const rating=element('div','song-card-difficulty__rating');rating.append(element('small','','聆聽難度'),stars(data),element('small','',`${data.scores.reduce((a,b)=>a+b,0)} / 60`));
    const facts=element('div','song-card-difficulty__facts');
    for(const [label,value] of [['BPM',`≈ ${data.bpm}`],['曲風',data.genre],['年份',String(data.year)]]) {const item=element('span');item.append(element('small','',label),element('strong','',value));facts.append(item);}
    box.append(rating,facts);return box;
  }
  function panel(song) {
    const data=getData(song);if(!data)return null;
    const scores=data.scores,total=scores.reduce((a,b)=>a+b,0);
    const section=element('section','song-difficulty-panel');
    const heading=element('div','difficulty-heading');const title=element('div');title.append(element('p','difficulty-kicker','LISTENING PROFILE'),element('h3','','聆聽難度參考'));const summary=element('div','difficulty-summary');summary.append(stars(data),element('strong','',`${total} / 60`));heading.append(title,summary);section.append(heading,element('p','difficulty-scale','教學估評 · 每項 1–10 分，越高越難；清晰度分數表示辨清人聲的難度。')); 
    const button=element('button','difficulty-chart');button.type='button';button.setAttribute('aria-label','重新播放六項難度圖動畫；完整分數列於下方');
    const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 440 360');svg.setAttribute('aria-hidden','true');
    const point=(i,r)=>[220+Math.cos(-Math.PI/2+i*Math.PI/3)*r,175+Math.sin(-Math.PI/2+i*Math.PI/3)*r];
    const polygon=r=>scores.map((v,i)=>point(i,typeof r==='number'?r:r[i]).join(',')).join(' ');
    for(let ring=1;ring<=5;ring++){const el=document.createElementNS(ns,'polygon');el.setAttribute('points',polygon(ring*22));el.setAttribute('class','radar-grid');svg.append(el);}
    scores.forEach((v,i)=>{const xy=point(i,110);const line=document.createElementNS(ns,'line');for(const [k,n] of Object.entries({x1:220,y1:175,x2:xy[0],y2:xy[1]}))line.setAttribute(k,n);line.setAttribute('class','radar-grid');svg.append(line);const t=document.createElementNS(ns,'text'),pos=point(i,147);t.setAttribute('x',pos[0]);t.setAttribute('y',pos[1]);t.setAttribute('text-anchor','middle');t.textContent=labels[i];const score=document.createElementNS(ns,'tspan');score.setAttribute('x',pos[0]);score.setAttribute('dy','19');score.textContent=v+' / 10';t.append(score);svg.append(t);});
    const shape=document.createElementNS(ns,'polygon');shape.setAttribute('points',polygon(scores.map(v=>v*11)));shape.setAttribute('class','radar-area');svg.append(shape);button.append(svg,element('span','difficulty-replay','↻ 點擊圖表，展開難度輪廓'));section.append(button);
    button.addEventListener('click',()=>{shape.getAnimations().forEach(a=>a.cancel());if(!matchMedia('(prefers-reduced-motion: reduce)').matches)shape.animate([{transform:'scale(0)'},{transform:'scale(1)'}],{duration:750,easing:'cubic-bezier(.16,1,.3,1)'});});
    const list=element('dl','difficulty-values');scores.forEach((v,i)=>{const row=element('div','difficulty-value');const dt=element('dt');dt.append(element('span','',labels[i]),element('small','',english[i]));dt.title=hints[i];const dd=element('dd','',v+' / 10');const meter=element('div','difficulty-meter');meter.setAttribute('aria-hidden','true');const fill=element('span');fill.style.width=(v*10)+'%';meter.append(fill);row.append(dt,dd,meter);list.append(row);});section.append(list);
    section.append(element('p','difficulty-song-note',data.note));
    const details=element('details','difficulty-method');details.append(element('summary','','評分方式與歌曲資料來源'));
    details.append(element('p','','教學估評，每項 1–10 分，分數越高越難。清晰度評的是辨聽難度。1–3 分表示負擔較低，4–6 分為中等，7–8 分較具挑戰，9–10 分為高度挑戰。星級按六項總分劃分：1 星 6–16；2 星 17–27；3 星 28–38；4 星 39–49；5 星 50–60。這是歌曲本身的參考難度，個別練習模式另有挑戰。'));
    details.append(element('p','','BPM 為約數；半拍、雙倍拍及不同錄音可能得出不同數值，節拍快慢也不等於唱詞密度。年份採本課所用版本的首次發行年份，通常以原專輯為準；重新灌錄另計。曲風採概括分類。'));
    if(data.metadataNote)details.append(element('p','',data.metadataNote));
    const sources=element('p','difficulty-sources');data.sources.forEach((source,i)=>{const a=element('a','',source.label);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';if(i)sources.append(document.createTextNode(' · '));sources.append(a);});details.append(sources);section.append(details);return section;
  }
  window.SongDifficulty=Object.freeze({panel,card,starLevel});
})();
