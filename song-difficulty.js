(() => {
  'use strict';
  const labels = ['用字','字量','速度','清晰度','連讀與弱讀','俚語與俗語'];
  const english = ['Lexical resources','Lyrical density','Speed / BPM','Vocal clarity','Connected speech & reductions','Slang & idioms'];
  let entranceObserver;
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
    const heading=element('div','difficulty-heading');const title=element('div');title.append(element('p','difficulty-kicker','LISTENING PROFILE'),element('h3','','聆聽難度參考'));const summary=element('div','difficulty-summary');summary.append(stars(data),element('strong','',`${total} / 60`));heading.append(title,summary);section.append(heading);
    const button=element('button','difficulty-chart');button.type='button';button.setAttribute('aria-label','重新播放六項難度圖動畫；完整分數列於下方');
    const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 440 360');svg.setAttribute('aria-hidden','true');
    const point=(i,r)=>[220+Math.cos(-Math.PI/2+i*Math.PI/3)*r,175+Math.sin(-Math.PI/2+i*Math.PI/3)*r];
    const polygon=r=>scores.map((v,i)=>point(i,typeof r==='number'?r:r[i]).join(',')).join(' ');
    for(let ring=1;ring<=5;ring++){const el=document.createElementNS(ns,'polygon');el.setAttribute('points',polygon(ring*22));el.setAttribute('class','radar-grid');svg.append(el);}
    scores.forEach((v,i)=>{const xy=point(i,110);const line=document.createElementNS(ns,'line');for(const [k,n] of Object.entries({x1:220,y1:175,x2:xy[0],y2:xy[1]}))line.setAttribute(k,n);line.setAttribute('class','radar-grid');svg.append(line);const t=document.createElementNS(ns,'text'),pos=point(i,147);t.setAttribute('x',pos[0]);t.setAttribute('y',pos[1]);t.setAttribute('text-anchor','middle');t.textContent=labels[i];const score=document.createElementNS(ns,'tspan');score.setAttribute('x',pos[0]);score.setAttribute('dy','19');score.textContent=v+' / 10';t.append(score);svg.append(t);});
    const shape=document.createElementNS(ns,'polygon');shape.setAttribute('points',polygon(scores.map(v=>v*11)));shape.setAttribute('class','radar-area');svg.append(shape);button.append(svg,element('span','difficulty-replay','↻ 點擊圖表，展開難度輪廓'));section.append(button);
    // Animate SVG vertices directly: Safari and reduced-motion CSS can suppress transforms.
    let frame = 0;
    const finalPoints = polygon(scores.map(v=>v*11));
    const expand = () => {
      cancelAnimationFrame(frame);
      shape.setAttribute('points',polygon(0));
      const started = performance.now();
      const draw = now => {
        if (!shape.isConnected) return;
        const progress = Math.min(1,(now-started)/1200);
        const eased = progress*progress*(3-2*progress);
        shape.setAttribute('points',polygon(scores.map(v=>v*11*eased)));
        if(progress<1) frame=requestAnimationFrame(draw);
        else {frame=0;shape.setAttribute('points',finalPoints);}
      };
      frame=requestAnimationFrame(draw);
    };
    // A click is an explicit request to replay, including with reduced motion enabled.
    button.addEventListener('click',expand);
    entranceObserver?.disconnect();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shape.setAttribute('points',polygon(0));
      entranceObserver=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){entranceObserver.disconnect();expand();}
      },{threshold:0.5});
      entranceObserver.observe(button);
    }
    const list=element('dl','difficulty-values');scores.forEach((v,i)=>{const row=element('div','difficulty-value');const dt=element('dt');dt.append(element('span','',labels[i]),element('small','',english[i]));const dd=element('dd','',v+' / 10');const meter=element('div','difficulty-meter');meter.setAttribute('aria-hidden','true');const fill=element('span');fill.style.width=(v*10)+'%';meter.append(fill);row.append(dt,dd,meter);list.append(row);});section.append(list);
    return section;
  }
  window.SongDifficulty=Object.freeze({panel,card,starLevel});
})();
