/* Shared visual layer for every flashcard deck and language edition.
   Progress is supplied by the existing account/language-scoped familiarity store. */
(function () {
  'use strict';
  const assetBase = new URL('assets/flashcards/range-worlds/', document.currentScript.src).href;
  const svgNS = 'http://www.w3.org/2000/svg';
  const worlds = {
    standard: { title: '標準模式', subtitle: 'THE STUDY ABACUS', legend: '全卡組掌握後，金色算珠會亮起', kind: 'bead' },
    '30': { title: '30 張卡範圍', subtitle: 'THE MEDAL CABINET', legend: '掌握範圍內所有卡片，獲得雙側桂冠', kind: 'medal' },
    '10': { title: '10 張卡範圍', subtitle: 'THE JEWEL COLLECTION', legend: '掌握範圍內所有卡片，寶石鑲上金邊', kind: 'gem' }
  };
  const gems = [
    {id:'ivory-round',shape:'round',color:'ivory',ink:'dark'},
    {id:'burgundy-oval',shape:'oval',color:'burgundy'},
    {id:'emerald-step',shape:'emerald-cut',color:'emerald'},
    {id:'royal-round',shape:'round',color:'royal-blue'},
    {id:'blush-pear',shape:'pear',color:'blush',ink:'dark'},
    {id:'aqua-clover',shape:'four-leaf-clover',color:'aquamarine',ink:'dark'},
    {id:'amethyst-cushion',shape:'cushion',color:'amethyst'},
    {id:'amber-marquise',shape:'marquise',color:'amber',ink:'dark'},
    {id:'teal-hexagon',shape:'hexagon',color:'teal'}
  ];
  // Each of the eleven ranges gets its own woven ribbon palette and stripe layout.
  const ribbons = [
    ['#741d35','#efd09a','#741d35',[.12,.24,.76,.88]],
    ['#184982','#ecdfc5','#214879',[.18,.28,.72,.82]],
    ['#26252d','#91313a','#29272e',[.08,.15,.85,.92]],
    ['#466351','#eae0b4','#385644',[.23,.35,.65,.77]],
    ['#963737','#edce9a','#8b3037',[.04,.12,.88,.96]],
    ['#315968','#e4e1c9','#2f4b56',[.29,.34,.66,.71]],
    ['#53294f','#c1aedb','#572d5a',[.13,.19,.81,.87]],
    ['#b88640','#722339','#b9803d',[.3,.38,.62,.7]],
    ['#1e4172','#d4a747','#1a3768',[.07,.1,.9,.93]],
    ['#884534','#f0ceb0','#8a4032',[.17,.23,.77,.83]],
    ['#394543','#cdcdb5','#4c5e58',[.36,.43,.57,.64]]
  ];
  function ribbon(index) {
    const svg=document.createElementNS(svgNS,'svg'), id=`range-ribbon-${index}`;
    svg.setAttribute('viewBox','0 0 200 200');svg.setAttribute('aria-hidden','true');svg.classList.add('range-ribbon');
    const [base,stripe,center,stops]=ribbons[index % ribbons.length];
    const [a,b,c,d]=stops.map(n=>(n*100).toFixed(1)+'%');
    // Use the original alpha silhouette and fabric luminance, leaving the brass loop intact.
    svg.innerHTML=`<defs><linearGradient id="${id}-palette"><stop stop-color="${base}"/><stop offset="${a}" stop-color="${base}"/><stop offset="${a}" stop-color="${stripe}"/><stop offset="${b}" stop-color="${stripe}"/><stop offset="${b}" stop-color="${center}"/><stop offset="${c}" stop-color="${center}"/><stop offset="${c}" stop-color="${stripe}"/><stop offset="${d}" stop-color="${stripe}"/><stop offset="${d}" stop-color="${base}"/></linearGradient><filter id="${id}-alpha"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter><filter id="${id}-texture"><feColorMatrix type="saturate" values="0"/></filter><clipPath id="${id}-clip"><path d="M56 8 H144 V70 H110 V61 H88 V70 H56Z"/></clipPath><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><image href="${assetBase}medal.webp" width="200" height="200" filter="url(#${id}-alpha)"/></mask><pattern id="${id}-weave" width="1" height="1.1" patternUnits="userSpaceOnUse"><path d="M0 .3 H1" stroke="#fff9db" stroke-width=".22" opacity=".25"/></pattern><linearGradient id="${id}-shade"><stop stop-color="#000" stop-opacity=".22"/><stop offset=".2" stop-color="#fff" stop-opacity=".12"/><stop offset=".65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient></defs><g clip-path="url(#${id}-clip)" mask="url(#${id}-mask)"><rect x="56" y="8" width="88" height="62" fill="url(#${id}-palette)"/><image href="${assetBase}medal.webp" width="200" height="200" filter="url(#${id}-texture)" style="mix-blend-mode:soft-light" opacity=".32"/><rect x="56" y="8" width="88" height="62" fill="url(#${id}-weave)"/><rect x="56" y="8" width="88" height="62" fill="url(#${id}-shade)"/></g>`;
    return svg;
  }
  function gemBezel(src) {
    const svg=document.createElementNS(svgNS,'svg'),id=`range-gold-${++ornament.nextId}`;
    svg.setAttribute('viewBox','0 0 200 200');svg.setAttribute('aria-hidden','true');svg.classList.add('range-ornament','range-gem-bezel');
    // Derive the rim from the actual transparent silhouette, including the clover waists.
    svg.innerHTML=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff5c4"/><stop offset=".25" stop-color="#edbf59"/><stop offset=".5" stop-color="#986226"/><stop offset=".75" stop-color="#ffe8a0"/><stop offset="1" stop-color="#b98737"/></linearGradient><filter id="${id}-edge" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="outer"/><feComposite in="outer" in2="SourceAlpha" operator="out"/></filter><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200" style="mask-type:alpha"><image href="${src}" width="200" height="200" filter="url(#${id}-edge)"/></mask></defs><rect width="200" height="200" fill="url(#${id})" mask="url(#${id}-mask)"/>`;
    return svg;
  }
  const spacerObservers=new WeakMap();
  function observeSpacers(grid) {
    if(spacerObservers.has(grid))return;
    const layer=element('div','range-spacer-layer');layer.setAttribute('aria-hidden','true');grid.append(layer);
    const layout=()=>{
      const rect=grid.getBoundingClientRect();if(!rect.width){layer.replaceChildren();return;}
      const tokens=[...grid.querySelectorAll('.range-token')].map(el=>el.getBoundingClientRect());
      const fragment=document.createDocumentFragment();
      for(let i=0;i<tokens.length-1;i++){
        const a=tokens[i],b=tokens[i+1];if(Math.abs(a.top-b.top)>4)continue;
        const left=a.left+a.width*.91,right=b.left+b.width*.09,gap=right-left;
        if(gap<18)continue;
        const count=gap>=85?3:gap>=48?2:1;
        const width=Math.min(30,gap*.6/count),height=Math.min(a.height*.56,width*2.5),spacing=(gap-width*count)/(count+1);
        for(let n=0;n<count;n++){
          const bead=element('img','range-spacer-bead');bead.src=assetBase+'spacer-walnut.webp';bead.alt='';bead.decoding='async';
          bead.style.cssText=`left:${left-rect.left-grid.clientLeft+spacing+n*(width+spacing)}px;top:${a.top-rect.top-grid.clientTop+a.height*.51-height/2}px;width:${width}px;height:${height}px;`;
          fragment.append(bead);
        }
      }
      layer.replaceChildren(fragment);
    };
    const observer=new ResizeObserver(layout);observer.observe(grid);spacerObservers.set(grid,observer);requestAnimationFrame(layout);
  }
  function element(tag, cls, text) {
    const el = document.createElement(tag); el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function ornament(kind) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('range-ornament');
    // Gradients are scoped to each instance; SVG fragment references must be unique.
    const id = `range-gold-${++ornament.nextId}`;
    let drawing = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4b7"/><stop offset=".3" stop-color="#eaba58"/><stop offset=".55" stop-color="#96602a"/><stop offset=".77" stop-color="#ffe39a"/><stop offset="1" stop-color="#b77b30"/></linearGradient></defs>`;
    if (kind === 'medal') {
      for (const mirror of [false, true]) {
        drawing += `<g${mirror ? ' transform="translate(200 0) scale(-1 1)"' : ''}><path d="M82 184 C28 174 16 127 44 77" fill="none" stroke="url(#${id})" stroke-width="2.5"/>`;
        const stems = [[48,83],[39,94],[32,107],[28,121],[29,136],[34,150],[43,163],[55,174]];
        for (let i = 0; i < stems.length; i++) {
          const [x,y] = stems[i];
          drawing += `<g transform="translate(${x} ${y}) rotate(${-15 + i * 8})"><path d="M0 0 C-10 -2 -15 -11 -12 -18 C-3 -16 2 -7 0 0Z" fill="url(#${id})"/><path d="M0 0 C1 -9 7 -17 14 -18 C15 -9 9 -1 0 0Z" fill="url(#${id})"/><path d="M0 0 L-10 -15 M0 0 L11 -15" stroke="#fff0b3" stroke-width=".6" opacity=".65"/></g>`;
        }
        drawing += '</g>';
      }
      drawing += `<path d="M100 53 L104 62 L114 63 L107 70 L109 80 L100 75 L91 80 L93 70 L86 63 L96 62Z" fill="url(#${id})" stroke="#ffeabb" stroke-width="1"/>`;
    } else {
      drawing += `<path d="M100 20 Q104 20 108 24 L177 91 Q185 100 177 109 L108 178 Q100 186 92 178 L23 109 Q15 100 23 91 L92 24 Q96 20 100 20Z" fill="none" stroke="url(#${id})" stroke-width="6"/><path d="M100 23 L179 100 L100 181 L21 100Z" fill="none" stroke="#fff0ba" stroke-width="1"/>`;
      for (const [x,y] of [[100,20],[180,100],[100,182],[20,100]]) drawing += `<circle cx="${x}" cy="${y}" r="4.5" fill="url(#${id})" stroke="#fff0b3" stroke-width=".8"/>`;
    }
    svg.innerHTML = drawing; return svg;
  }
  ornament.nextId = 0;
  function decorate(root) {
    root.classList.add('range-worlds');
    root.id = 'flashcard-range-worlds';
    root.querySelectorAll('.mode-block').forEach(block => {
      const key = block.dataset.rangeSection || 'standard';
      const world = worlds[key]; if (!world || block.dataset.rangeWorld) return;
      block.dataset.rangeWorld = key;
      const heading = block.querySelector('.embedded-mode-heading');
      heading.replaceChildren(element('small', 'range-world-eyebrow', world.subtitle), element('span', 'range-world-title', world.title));
      const legend = element('p', 'range-world-legend', world.legend);
      const summary = element('span', 'range-world-summary');
      legend.append(summary); heading.after(legend);
      const grid = block.querySelector('.mode-grid');
      grid.querySelectorAll('[data-start-mode]').forEach((button, index) => {
        const title = Array.from(button.childNodes).filter(node => node.nodeType === 3).map(node => node.textContent).join('').trim();
        const description = button.querySelector('span')?.textContent.trim() || '';
        button.dataset.originalTitle = title; button.dataset.originalDescription = description;
        const token = element('span', 'range-token');
        const image = element('img', 'range-object');
        const gem = world.kind === 'gem' ? gems[index % gems.length] : null;
        image.src = assetBase + (gem ? 'gems-v2/'+gem.id : world.kind) + '.webp'; image.alt = ''; image.loading = key === 'standard' ? 'eager' : 'lazy'; image.decoding = 'async';
        token.append(image);
        if (world.kind === 'medal') {token.append(ribbon(index));token.append(ornament('medal'));button.dataset.ribbon = String(index);}
        if (gem) token.append(gemBezel(image.src));
        token.append(element('span', 'range-number'));
        const titleNode = element('span', 'range-choice-title', title);
        const progress = element('span', 'range-progress');
        const state = element('span', 'range-state');
        const desc = element('span', 'range-description', description);
        button.replaceChildren(token, titleNode, progress, state, desc);
        button.classList.add('range-choice'); button.dataset.material = world.kind;
        button.style.setProperty('--choice-index', index);
        if (gem) {button.dataset.gemShape=gem.shape;button.dataset.gemColor=gem.color;button.dataset.gemInk=gem.ink || 'light';}
      });
      if (world.kind === 'bead') observeSpacers(grid);
    });
  }
  function progressFor(count, start, end, familiarity) {
    const first = Math.max(1, Math.trunc(Number(start) || 1));
    const last = end ? Math.min(count, Math.trunc(Number(end) || 0)) : count;
    const green = new Set((familiarity?.green || []).map(String));
    const red = new Set((familiarity?.red || []).map(String));
    let correct = 0, total = Math.max(0, last - first + 1);
    for (let card = first; card <= last; card++) if (green.has(String(card - 1)) && !red.has(String(card - 1))) correct++;
    return {first, last, correct, total, completed: total > 0 && correct === total};
  }
  function refresh({root, count, familiarity, hasOwner}) {
    if (!root) return;
    decorate(root);
    // Never render another person's rewards from an ownerless or cleared session.
    const record = hasOwner ? familiarity : {green:[], red:[]};
    const whole = progressFor(count, 1, 0, record);
    root.querySelectorAll('[data-start-mode]').forEach(button => {
      const mode = button.dataset.startMode;
      const isRange = mode === 'range';
      const progress = isRange ? progressFor(count, button.dataset.rangeStart, button.dataset.rangeEnd, record) : whole;
      const complete = !!hasOwner && progress.completed;
      button.classList.toggle('range-completed', complete);
      button.dataset.complete = String(complete);
      const number = button.querySelector('.range-number');
      const title = button.querySelector('.range-choice-title');
      const badge = button.querySelector('.range-progress');
      const state = button.querySelector('.range-state');
      if (isRange) {
        const first = Number(button.dataset.rangeStart);
        const last = progress.total ? progress.last : Number(button.dataset.rangeEnd) || null;
        number.textContent = last ? `${first}–${last}` : `${first}+`;
        title.textContent = progress.total ? `${progress.total} 張卡` : '暫無卡片';
        if (progress.total) button.dataset.rangeLabel = `第 ${first}–${last} 張卡`;
        badge.textContent = `${progress.correct} / ${progress.total}`;
      } else {
        number.textContent = button.dataset.cardLimit || ({order:'原序',random:'隨機','red-only':'紅卡','green-only':'綠卡'}[mode]);
        badge.textContent = `${whole.correct} / ${whole.total}`;
      }
      state.textContent = complete ? '✓ 已掌握' : (button.disabled ? '尚未提供' : '未完成');
      const rangeLabel = isRange ? `第 ${number.textContent} 張卡` : button.dataset.originalTitle;
      const description = isRange && progress.total ? `按原定次序練習第 ${progress.first} 至 ${progress.last} 張卡。` : button.dataset.originalDescription;
      button.setAttribute('aria-label', `${rangeLabel}。${description} 掌握 ${progress.correct} / ${progress.total}。${state.textContent}`);
    });
    root.querySelectorAll('[data-range-world]').forEach(block => {
      const active = [...block.querySelectorAll('[data-start-mode]')].filter(button => !button.disabled);
      const summary = block.querySelector('.range-world-summary');
      summary.textContent = block.dataset.rangeWorld === 'standard' ? `已掌握 ${whole.correct} / ${whole.total} 張` : `${active.filter(b=>b.dataset.complete === 'true').length} / ${active.length} 範圍已掌握`;
    });
  }
  window.FlashcardRangeWorlds = {refresh, progressFor, gems, ribbons};
})();
