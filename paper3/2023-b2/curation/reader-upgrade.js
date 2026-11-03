// The 2023 Data File and Question-Answer Book have different page systems.
// Keep the source pages intact and put the optional study aids around them.
(()=>{
  const labels=[
    '資料檔封面','情境與目錄','聆聽筆記表','任務指示電郵',
    'Big Cheese 報道','宣傳片分鏡草稿','William 與 Archie 對話',
    '全體員工電郵','課程資料','課程評價',
    'Task 8 · 網站公告','Task 8 · 續答 1','Task 8 · 續答 2',
    'Task 9 · 員工電郵','Task 9 · 續答',
    'Task 10 · 宣傳片劇本','Task 10 · 續答 1','Task 10 · 續答 2'
  ];
  const prep={
    8:'先分開已承認的水浸與三組誤會，再核對 William 的說法及錄音。',
    9:'選三門課程，逐項寫出提供者、實際技能和工作用途；核對培訓學分及額外假期的條件。',
    10:'先核對故事板與後來的更新：嘉賓、直播、免費 app 投票、首集餡料、獎品及無人機送遞。'
  };
  const nativeRoot=native.querySelector('.source');
  const readerRoute=document.createElement('div');
  readerRoute.className='reader-route';
  readerRoute.innerHTML='<details open><summary>閱讀路線 <output id="reader-read-count">0 / 18 已讀</output></summary><progress id="reader-read-progress" max="18" value="0"></progress><p>10 頁 Data File · 8 頁 Question-Answer Book</p><nav aria-label="2023 B2 頁面導覽"></nav></details>';
  section23.before(readerRoute);
  const compactRoute=matchMedia('(max-width: 700px)');
  const sizeRoute=()=>{readerRoute.querySelector('details').open=!compactRoute.matches};
  compactRoute.addEventListener('change',sizeRoute);sizeRoute();
  const pageNav=readerRoute.querySelector('nav');
  labels.forEach((label,j)=>{
    const button=document.createElement('button');
    button.type='button';button.dataset.page=String(j+1);
    button.innerHTML='<strong>'+String(j+1).padStart(2,'0')+'</strong><span></span>';
    button.querySelector('span').textContent=label;
    pageNav.append(button);
  });
  function safeRead(key){try{return localStorage.getItem(key)}catch{return null}}
  function safeWrite(key,value){try{localStorage.setItem(key,value)}catch{}}
  function updateCounts(root){
    for(const area of root.querySelectorAll('textarea[data-count-id]')){
      const target=root.querySelector('[data-count-for="'+area.dataset.countId+'"]');
      if(target)target.textContent=(area.value.trim().match(/\S+/g)||[]).length+' words';
    }
  }
  function updateProgress(){
    let count=0;for(let n=1;n<=18;n++)if(safeRead('cur23-reader-read:'+n)==='1')count++;
    readerRoute.querySelector('#reader-read-count').textContent=count+' / 18 已讀';
    readerRoute.querySelector('#reader-read-progress').value=count;
  }
  function hydrate(root){
    for(const box of root.querySelectorAll('input[type="checkbox"][data-read]'))
      box.checked=safeRead('cur23-reader-read:'+box.dataset.read)==='1';
    for(const area of root.querySelectorAll('textarea[data-note]')){
      let value=safeRead('cur23-reader-note:'+area.dataset.note);
      if(value===null){
        const task={'11-response':1,'14-response':2,'16-response':3}[area.dataset.note];
        if(task)value=safeRead('2023-draft-'+task);
      }
      if(value!==null)area.value=value;
    }
    updateCounts(root);updateProgress();
  }
  nativeRoot.addEventListener('input',event=>{
    const area=event.target.closest('textarea[data-note]');if(!area)return;
    safeWrite('cur23-reader-note:'+area.dataset.note,area.value);
    const task={'11-response':1,'14-response':2,'16-response':3}[area.dataset.note];
    if(task)safeWrite('2023-draft-'+task,area.value);
    updateCounts(nativeRoot);
  });
  nativeRoot.addEventListener('change',event=>{
    const box=event.target.closest('input[type="checkbox"][data-read]');if(!box)return;
    safeWrite('cur23-reader-read:'+box.dataset.read,box.checked?'1':'0');
    updateProgress();
  });
  function intro(){
    const box=document.createElement('div');box.className='reader-intro';
    box.innerHTML='<h1>2023 B2 · Data File 分析 + PP</h1><p>逐頁閱讀原文、聆聽會議，再完成三項寫作。資料檔、問答冊、錄音稿和教學範文分開標示。</p><p class="reader-source-note">收錄 10 頁 Data File 及 8 頁 Question-Answer Book。錄音逐字稿與參考範文是學習輔助；答案只儲存於此瀏覽器。</p>';
    return box;
  }
  function addTranscript(){
    const card=document.createElement('section');card.className='reader-transcript';
    card.innerHTML='<span class="reader-eyebrow">MEETING RECORDING · TRANSCRIPT</span><h2>網上員工會議逐字稿</h2><p>錄音稿按講者順序排列；中文只作對照，不取代原文證據。</p>';
    transcript.slice(6,82).forEach((turn,j)=>{
      const line=document.createElement('p');line.className='reader-turn';
      const name=document.createElement('strong');name.textContent=turn.speaker+'：';
      line.append(name,document.createTextNode(turn.text));
      if(lang){const translation=document.createElement('span');translation.className='reader-turn-zh';translation.textContent=zhTurns[j];line.append(translation)}
      card.append(line);
    });
    nativeRoot.append(card);
  }
  function addTask(task,start,end){
    const card=document.createElement('section');card.className='practice-prep';
    card.innerHTML='<span class="reader-eyebrow">STUDY WORKSPACE · TASK '+task+'</span><h2>先構思，再寫作</h2><p></p><label>Planning notes / 證據整理<textarea data-note="plan-'+task+'" rows="4" aria-label="Task '+task+' planning notes"></textarea></label>';
    card.querySelector('p').textContent=prep[task];
    nativeRoot.append(card);
    nativeRoot.insertAdjacentHTML('beforeend',nativePages23.slice(start-1,end).join(''));
    const model=document.createElement('details');model.className='reader-model';
    model.innerHTML='<summary>查看 Task '+task+' 參考範文 · 完成初稿後開啟</summary><pre></pre>';
    model.querySelector('pre').textContent=models[task-8];
    nativeRoot.append(model);
  }
  function renderReader(){
    if(opened)return;
    readerRoute.hidden=false;
    nativeHost.hidden=false;
    nativeRoot.replaceChildren(intro());
    nativeRoot.classList.toggle('translated',lang);
    if(tab==='all'||tab==='data')nativeRoot.insertAdjacentHTML('beforeend',nativePages23.slice(0,10).join(''));
    if(tab==='all'||tab==='transcript')addTranscript();
    if(tab==='all'||tab==='practice'){
      addTask(8,11,13);addTask(9,14,15);addTask(10,16,18);
    }
    hydrate(nativeRoot);
  }
  pageNav.addEventListener('click',event=>{
    const button=event.target.closest('button[data-page]');if(!button)return;
    const page=Number(button.dataset.page);
    tab=page<=10?'data':'practice';
    update23(true);
    native.querySelector('#page-'+page)?.scrollIntoView({block:'start',behavior:'smooth'});
  });
  const oldNativePage=nativePage;
  nativePage=function(page,row){oldNativePage(page,row);if(opened)hydrate(nativeRoot)};
  const oldUpdate23=update23;
  update23=function(force=false){
    oldUpdate23(force);
    if(opened){readerRoute.hidden=true;return}
    renderReader();
  };
  const mobile=$s('#page-jump');
  function fillMobile(){
    mobile.replaceChildren(new Option('跳至頁面',''));
    labels.forEach((label,j)=>mobile.add(new Option((j+1)+' · '+label,String(j+1))));
    mobile.add(new Option('錄音稿','transcript'));
    mobile.add(new Option('PP 練習','practice'));
  }
  fillMobile();
  mobile.onchange=()=>{
    const value=mobile.value;if(!value)return;
    if(value==='transcript'||value==='practice'){
      if(opened)jump23(rows.findIndex(r=>r.stage===(value==='transcript'?2:4)));
      else{tab=value;update23(true);nativeRoot.scrollIntoView({block:'start'})}
    }else{
      const page=Number(value);
      if(opened){const row=rows.findIndex(r=>r.leaf===page);if(row>=0)jump23(row);else if(page>10)jump23(rows.findIndex(r=>r.stage===4&&r.t===(page<=13?1:page<=15?2:3)));}
      else{tab=page<=10?'data':'practice';update23(true);native.querySelector('#page-'+page)?.scrollIntoView({block:'start'})}
    }
    mobile.value='';
  };
  readerRoute.hidden=true;
  updateProgress();
  update23(true);
})();
