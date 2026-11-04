// Keep the active source readable between the fixed controls on every viewport.
(() => {
  const masks = ['top','left','right','bottom'].map(side => {
    const el = document.createElement('div');
    el.className = 'curation-mask curation-mask-' + side;
    el.hidden = true;
    el.setAttribute('aria-hidden','true');
    shell.append(el);
    return el;
  });
  const routeArrow=document.createElementNS('http://www.w3.org/2000/svg','svg');
  routeArrow.id='curation-route-arrow';routeArrow.hidden=true;routeArrow.setAttribute('aria-hidden','true');
  const routePath=document.createElementNS('http://www.w3.org/2000/svg','path');routePath.classList.add('curation-route-path');routeArrow.append(routePath);
  const routeCallout=document.createElement('div');routeCallout.className='curation-route-callout';routeCallout.hidden=true;routeCallout.setAttribute('aria-live','polite');
  shell.append(routeArrow,routeCallout);
  const rail = $s('.curation-stage'), bank = $s('.curation-bank'), dock = $s('.curation-dock');
  let frame = 0, needsFocus = false, lastStep = '',trackUntil=0,lastArrowKey='';
  function targets() {
    if (!opened || diag.open) return [];
    switch (rows[i].stage) {
      case 0:
        if(routePhase()==='visit')return [...native.querySelectorAll('.paper-page > header')];
        return [...native.querySelectorAll('.curation-boss-sentence.target,mark.target')];
      case 1: case 3:
        if(routePhase()==='visit')return [...native.querySelectorAll('.paper-page > header')];
        return [...native.querySelectorAll('mark.target')];
      case 2: return [...document.querySelectorAll('#turns .curation-transcript-sentence.curation-target')];
      case 4: return [...surface.querySelectorAll('.curation-essay-unit.is-current')];
    }
    return [];
  }
  function schedule(focus = false) {
    needsFocus ||= focus;
    if (!frame) frame = requestAnimationFrame(position);
  }
  function routeCue(){return E('refs').querySelector('[data-destination]')}
  function updateRouteArrow(rects){
    const cue=routeCue(),phase=routePhase();
    if(!opened||!cue||!rects.length||![0,3].includes(rows[i].stage)){
      routeArrow.hidden=true;routeCallout.hidden=true;lastArrowKey='';return;
    }
    const r={left:Math.min(...rects.map(x=>x.left)),right:Math.max(...rects.map(x=>x.right)),top:Math.min(...rects.map(x=>x.top)),bottom:Math.max(...rects.map(x=>x.bottom))};
    if(r.bottom<148||r.top>innerHeight-70){routeArrow.hidden=true;routeCallout.hidden=true;return;}
    const page=Number(cue.dataset.destination),faded=phase==='returned',key=`${i}:${page}:${phase||'cue'}`;
    routeArrow.hidden=false;routeCallout.hidden=false;
    routeArrow.classList.toggle('is-faded',faded);routeCallout.classList.toggle('is-faded',faded);
    routeCallout.replaceChildren();const strong=document.createElement('strong'),label=document.createElement('span');strong.textContent=`第 ${page} 頁`;label.textContent=pageRouteTitles[page]||'指定原頁';routeCallout.append(strong,label);
    routeArrow.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
    const labelWidth=Math.min(248,Math.max(170,routeCallout.scrollWidth)),safeRight=Math.max(190,Math.min(innerWidth-12,bank.hidden?innerWidth-12:bank.getBoundingClientRect().left-14)),safeLeft=innerWidth<=620?12:Math.max(12,dock.getBoundingClientRect().right+16);
    const rightward=r.right+labelWidth+54<safeRight,leftward=!rightward&&r.left-labelWidth-54>safeLeft;
    const labelX=rightward?r.right+42:leftward?r.left-labelWidth-42:Math.max(12,Math.min(safeRight-labelWidth,Math.max(safeLeft,r.left+30)));
    const labelY=Math.max(155,Math.min(innerHeight-75,rightward||leftward?r.top+Math.min((r.bottom-r.top)/2,26)-24:r.bottom+76));
    Object.assign(routeCallout.style,{left:`${labelX}px`,top:`${labelY}px`});
    let path;
    if(rightward||leftward){
      const startX=rightward?r.right+5:r.left-5,endX=rightward?labelX-7:labelX+labelWidth+7,startY=Math.max(155,Math.min(innerHeight-70,r.top+Math.min((r.bottom-r.top)/2,26))),endY=labelY+routeCallout.offsetHeight/2,bend=Math.min(35,Math.abs(endX-startX)*.3)*(rightward?1:-1);
      path=`M ${startX} ${startY} C ${startX+bend} ${startY}, ${endX-bend} ${endY}, ${endX} ${endY}`;
    }else{
      const startX=r.left+Math.min((r.right-r.left)*.65,180),startY=r.bottom+4,endX=labelX+labelWidth/2,endY=labelY-7;
      path=`M ${startX} ${startY} C ${startX} ${startY+14}, ${endX} ${endY-14}, ${endX} ${endY}`;
    }
    routePath.setAttribute('d',path);
    if(lastArrowKey!==key){routeArrow.classList.remove('is-drawing');void routeArrow.getBoundingClientRect();if(!faded)routeArrow.classList.add('is-drawing');lastArrowKey=key;}
  }
  function position() {
    frame = 0;
    const focus = needsFocus;
    needsFocus = false;
    const rects = targets().flatMap(el => [...el.getClientRects()]).filter(r => r.width && r.height);
    updateRouteArrow(rects);
    if (!rects.length) { masks.forEach(el => el.hidden = true); return; }
    const left = Math.max(0,Math.min(...rects.map(r=>r.left))-9);
    const right = Math.min(innerWidth,Math.max(...rects.map(r=>r.right))+9);
    const top = Math.min(...rects.map(r=>r.top))-9;
    const bottom = Math.max(...rects.map(r=>r.bottom))+9;
    let start = Math.max(rail.getBoundingClientRect().bottom,$s('.toolbar').getBoundingClientRect().bottom)+8;
    let end = innerHeight-10;
    if (innerWidth < 1100) {
      const b = bank.getBoundingClientRect();
      if (right>b.left && left<b.right) start = Math.max(start,b.bottom+8);
      end = Math.min(end,dock.getBoundingClientRect().top-8);
    }
    if (focus && rows[i].stage !== 2 && (top<start || bottom>end)) {
      const anchor = start+Math.max(0,(end-start-(bottom-top))/2);
      const routed=!!routeCue(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollBy({top:top-anchor,behavior:routed||reduced?'instant':'smooth'});
      trackUntil=performance.now()+900;schedule();
      return;
    }
    const y = Math.max(0,top), z = Math.min(innerHeight,bottom);
    const visible = $s('#curation-spotlight').checked && right>left && z>y;
    const areas = [[0,0,innerWidth,y],[0,y,left,z-y],[right,y,innerWidth-right,z-y],[0,z,innerWidth,innerHeight-z]];
    masks.forEach((el,j) => {
      el.hidden = !visible;
      if (visible) {
        const [x,y,w,h] = areas[j];
        Object.assign(el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
      }
    });
    if(performance.now()<trackUntil)schedule();
  }
  const update = update23;
  update23 = function(force=false) {
    update(force);
    const row=rows[i], key=[opened,i,diag.open,visitIndex,lang,routePhase(),row.stage===2?$s('#curation-step-jump').textContent:''].join('|');
    if (key!==lastStep || force) {
      const guide=$s('#curation-explanation'), target=native.querySelector('mark.target');
      if (opened && (row.stage===0 || row.stage===3) && target && !guide.querySelector('.curation-translation')) {
        const translation=target.closest('.bilingual')?.querySelector('.translation');
        if (translation) {
          const line=document.createElement('p');
          line.className='curation-translation';line.lang='zh-Hant';
          line.textContent='原段中譯 · '+translation.textContent.trim();guide.prepend(line);
        }
      }
      const page=benchmarkPages23.get(row.q)||[...benchmarkPages23].find(([quote])=>row.q.includes(quote))?.[1];
      if(opened && page && (row.stage===0 || row.stage===3) && !guide.querySelector('.cur23-benchmark')){
        const link=document.createElement('a');
        link.className='cur23-benchmark';link.target='_blank';link.rel='noopener';
        link.href='benchmark.pdf?v=audited-v6#page='+page;
        link.textContent='對照審訂教材 · 第 '+page+' 頁';guide.append(link);
      }
      const phase=routePhase();
      if(opened && phase==='visit'){
        const page=Number(E('refs').querySelector('[data-destination]').dataset.destination);
        $s('#curation-source').textContent='Data File 第 '+page+' 頁 · 由第 '+row.leaf+' 頁前往';
        $s('#curation-title').textContent='資料指路 · '+pageRouteTitles[page];
        $s('#curation-quote').textContent=row.q;
        guide.replaceChildren();
        const why=document.createElement('p');why.className='curation-process';why.textContent=row.a;
        const back=document.createElement('p');back.textContent='先辨認文件及來源。下一步返回第 '+row.leaf+' 頁的提示句。';
        guide.append(why,back);$s('#curation-step-actions').replaceChildren();
        $s('#curation-next').textContent='返回原句 →';$s('#curation-prev').disabled=false;
        $s('#curation-step-jump').textContent+=' · 來源頁';
      }else if(opened && phase==='returned'){
        const arrow=$s('#curation-step-actions [data-destination]');if(arrow)arrow.dataset.seen='1';
        $s('#curation-step-jump').textContent+=' · 已返回';
      }
      if(key!==lastStep) $s('.curation-content').scrollTop=0;
      schedule(key!==lastStep);lastStep=key;
    }
  };
  for (const event of ['resize','scroll']) window.addEventListener(event,()=>schedule(event==='resize'),{passive:true,capture:true});
  $s('#curation-spotlight').addEventListener('change',()=>schedule(true));
  new ResizeObserver(()=>schedule(true)).observe(dock);
  window.addEventListener('load',()=>schedule(true));
  const unknownSave=savedEntry23 && entry23(savedEntry23)<0;
  if(unknownSave)jump23(0);
  update23(true);
  if(unknownSave){
    const status=$s('#curation-save-status');
    status.textContent='原有步驟已更新，已返回任務指示。草稿及筆記仍可使用。';
    status.dataset.noticeUntil=String(Date.now()+10000);
  }
  if($s('#curation-step-jump').textContent.trim() && $s('#curation-bank-groups').children.length===3)
    document.documentElement.removeAttribute('data-loading');
})();
