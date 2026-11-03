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
  const rail = $s('.curation-stage'), bank = $s('.curation-bank'), dock = $s('.curation-dock');
  let frame = 0, needsFocus = false, lastStep = '';
  function targets() {
    if (!opened || diag.open) return [];
    switch (rows[i].stage) {
      case 0: case 1: case 3: return [...native.querySelectorAll('mark.target')];
      case 2: return [...document.querySelectorAll('#turns .cur23-review-sentence')];
      case 4: return [...surface.querySelectorAll('.current-model')];
    }
    return [];
  }
  function schedule(focus = false) {
    needsFocus ||= focus;
    if (!frame) frame = requestAnimationFrame(position);
  }
  function position() {
    frame = 0;
    const focus = needsFocus;
    needsFocus = false;
    const rects = targets().flatMap(el => [...el.getClientRects()]).filter(r => r.width && r.height);
    if (!rects.length) { masks.forEach(el => el.hidden = true); return; }
    const left = Math.max(0,Math.min(...rects.map(r=>r.left))-7);
    const right = Math.min(innerWidth,Math.max(...rects.map(r=>r.right))+7);
    const top = Math.min(...rects.map(r=>r.top))-7;
    const bottom = Math.max(...rects.map(r=>r.bottom))+7;
    let start = Math.max(rail.getBoundingClientRect().bottom,$s('.toolbar').getBoundingClientRect().bottom)+8;
    let end = innerHeight-10;
    if (innerWidth < 1100) {
      const b = bank.getBoundingClientRect();
      if (right>b.left && left<b.right) start = Math.max(start,b.bottom+8);
      end = Math.min(end,dock.getBoundingClientRect().top-8);
    }
    if (focus && rows[i].stage !== 2 && (top<start || bottom>end)) {
      const anchor = start+Math.max(0,(end-start-(bottom-top))/2);
      window.scrollBy({top:top-anchor,behavior:'instant'});
      schedule();
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
  }
  const update = update23;
  update23 = function(force=false) {
    update(force);
    const row=rows[i], key=[opened,i,diag.open,visitIndex,lang,row.stage===2?$s('#curation-step-jump').textContent:''].join('|');
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
      const page=benchmarkPages23.get(row.q);
      if(opened && page && (row.stage===0 || row.stage===3) && !guide.querySelector('.cur23-benchmark')){
        const link=document.createElement('a');
        link.className='cur23-benchmark';link.target='_blank';link.rel='noopener';
        link.href='benchmark.pdf?v=audited-v6#page='+page;
        link.textContent='對照審訂教材 · 第 '+page+' 頁';guide.append(link);
      }
      if(key!==lastStep) $s('.curation-content').scrollTop=0;
      schedule(key!==lastStep);lastStep=key;
    }
  };
  for (const event of ['resize','scroll']) window.addEventListener(event,()=>schedule(event==='resize'),{passive:true,capture:true});
  $s('#curation-spotlight').addEventListener('change',()=>schedule(true));
  new ResizeObserver(()=>schedule(true)).observe(dock);
  window.addEventListener('load',()=>schedule(true));
  update23(true);
})();
