// 2023 podcast integration v4: use the authentic page-3 note sheet as the
// single source of truth while preserving the original 2023 recording data.
const podcastNoteFieldsV4=[
  {id:'live-study-cook',note:'3-1',title:'Live, Study, Cook',tasks:'',cues:[0],from:6,to:18,tip:'記下最終集數。這是聆聽筆記內容，但不放進三篇 B2 寫作。'},
  {id:'filming-schedule',note:'3-2',title:'Filming schedule',tasks:'',cues:[1],from:19,to:20,tip:'七月是原定時間；最終延期至十月。這是聆聽筆記內容，但不放進三篇 B2 寫作。'},
  {id:'food-kinds',note:'3-3',title:'Kinds of food in the competition',tasks:'',cues:[2,3],from:21,to:28,tip:'早餐方案被放棄；最後記下主菜和甜品。這是聆聽筆記內容，但不放進三篇 B2 寫作。'},
  {id:'william-video',note:'3-4',title:'William Puddle’s viral video',tasks:'AB',cues:[4,5,6,7,8,9],from:29,to:53,tip:'水浸及影片誤會支援 Task A；由事件引出的社交媒體培訓和完成三科的獎勵條件支援 Task B。'},
  {id:'golden-sun',note:'3-5',title:'Golden Sun Tower Private Kitchen complaints',tasks:'B',cues:[10,11,12],from:54,to:71,tip:'燶多士不是已證實的火警；防火培訓支援 Task B。五千元補償是會議筆記，但不屬三篇寫作內容。'},
  {id:'viewers-choice',note:'3-6',title:'New show: Viewer’s Choice',tasks:'C',cues:[13,14,15,16],from:72,to:81,tip:'節目名稱、觀眾選材料及全程直播支援 Task C；故事板和後來電郵仍要再核對。'}
];
const generatedPodcastLinesV4=new Map();
function podcastRootV4(){return native?.querySelector('.source')||null}
function safePodcastReadV4(key){try{return readerStore23.getItem(key)}catch{return null}}
function safePodcastWriteV4(key,value){try{readerStore23.setItem(key,value)}catch{}}
function podcastFieldV4(index){return podcastRootV4()?.querySelector('#notes-'+podcastNoteFieldsV4[index]?.id)||null}
function migratePodcastNotesV4(){
  if(safePodcastReadV4('cur23-podcast-note-migration-v4')==='1')return;
  const old=[0,1,2,3,4,5].map(index=>safePodcastReadV4('cur23-usernote'+index)||'');
  const values=[old[0],'',old[1],[old[2],old[3]].filter(Boolean).join('\n'),old[4],old[5]];
  values.forEach((value,index)=>{const key='cur23-reader-note:'+podcastNoteFieldsV4[index].note;if(value&&safePodcastReadV4(key)===null)safePodcastWriteV4(key,value)});
  safePodcastWriteV4('cur23-podcast-note-migration-v4','1');
}
function podcastNoteSnapshotV4(){return Object.fromEntries(podcastNoteFieldsV4.map(field=>[field.note,safePodcastReadV4('cur23-reader-note:'+field.note)||'']))}
function restorePodcastNotesV4(values){if(!values||typeof values!=='object')return;for(const field of podcastNoteFieldsV4)if(typeof values[field.note]==='string')safePodcastWriteV4('cur23-reader-note:'+field.note,values[field.note])}
function bindPodcastFieldsV4(){
  const root=podcastRootV4();if(!root)return;
  for(const field of root.querySelectorAll('#page-3 .note-sheet textarea')){
    if(field.dataset.podcastBound)return;field.dataset.podcastBound='1';
    field.addEventListener('input',event=>{if(!event.isTrusted)return;if(typing){clearInterval(typing);typing=0;field.classList.remove('curation-note-writing');E('next').disabled=false}});
  }
}
function renderPodcastNotesV4(n,partial=''){
  const root=podcastRootV4();if(!root?.querySelector('#page-3'))return;
  const known=new Set(cues.map(cue=>cue[2]).filter(Boolean));
  podcastNoteFieldsV4.forEach((config,fieldIndex)=>{
    const field=podcastFieldV4(fieldIndex);if(!field)return;
    const previous=new Set(generatedPodcastLinesV4.get(config.id)||[]);
    const authored=field.value.split('\n').filter(line=>line.trim()&&!known.has(line.trim())&&!previous.has(line.trim()));
    const generated=config.cues.filter(index=>index<n&&cues[index][2]).map(index=>cues[index][2]);
    if(partial&&config.cues.includes(n))generated.push(partial);
    generatedPodcastLinesV4.set(config.id,generated);
    field.value=[...generated,...authored].join('\n');
    safePodcastWriteV4('cur23-reader-note:'+config.note,field.value);
    const heardTasks=new Set(config.cues.filter(index=>index<n||(index===n&&partial)).map(index=>cues[index][1]).filter(task=>task>=1&&task<=3).map(task=>'ABC'[task-1]));
    for(const task of 'ABC')field.classList.toggle('curation-note-highlight-'+task,heardTasks.has(task));
  });
  bindPodcastFieldsV4();
}
function classificationVisibleV4(config){
  const step=rows.findIndex(row=>row.stage===1&&row.leaf===3&&row.q===config.title);
  return rows[i]?.stage>1||(rows[i]?.stage===1&&step>=0&&i>=step);
}
function makeEvidenceV4(sheet,config){
  const field=sheet.querySelector('#notes-'+config.id);if(!field||sheet.querySelector('[data-notes-section="'+config.id+'"]'))return;
  const details=document.createElement('details');details.className='notes-evidence';details.dataset.notesSection=config.id;
  const summary=document.createElement('summary');summary.textContent='顯示相關錄音內容';summary.setAttribute('aria-label',config.title+'：顯示或收起相關錄音內容');
  const content=document.createElement('div');content.className='notes-evidence-content';
  const scope=document.createElement('p');scope.className='notes-evidence-scope';scope.textContent=config.tasks?'三篇寫作 · '+config.tasks.split('').map(task=>'Task '+task).join(' + '):'聆聽筆記 · 不納入三篇寫作';
  const tip=document.createElement('p');tip.className='notes-evidence-tip';tip.textContent=config.tip;
  const firstCue=config.cues[0],start=transcript[config.from]?.start||426;
  const play=document.createElement('button');play.type='button';play.className='notes-section-play';play.textContent='▶ 從此段播放 · '+tstr(Math.max(0,start-426));
  play.setAttribute('aria-label','播放 '+config.title+' 相關錄音');
  play.onclick=()=>{if(!active)jump23(rows.findIndex(row=>row.stage===2));listen(firstCue,true);update23(true)};
  const box=document.createElement('div');box.className='notes-evidence-transcript';box.tabIndex=0;box.setAttribute('role','region');box.setAttribute('aria-label',config.title+' 相關錄音稿');
  for(let turn=config.from;turn<=config.to;turn++){
    const item=transcript[turn];if(!item)continue;
    const line=document.createElement('div');line.className='speech';
    const speaker=document.createElement('strong');speaker.className='speaker';speaker.textContent=item.speaker;
    const text=document.createElement('p');text.textContent=item.text;line.append(speaker,text);
    if(zhTurns[turn-6]){const spacer=document.createElement('span'),translation=document.createElement('p');translation.className='translation';translation.textContent=zhTurns[turn-6];line.append(spacer,translation)}
    box.append(line);
  }
  content.append(scope,tip,play,box);details.append(summary,content);
  details.addEventListener('toggle',()=>summary.textContent=details.open?'收起相關錄音內容':'顯示相關錄音內容');field.before(details);
}
function ensurePodcastSemanticsV4(sheet){
  const headings=[...sheet.querySelectorAll('.notes-form-body>h3')],fields=[...sheet.querySelectorAll('.notes-form-body>textarea')];
  podcastNoteFieldsV4.forEach((config,index)=>{
    if(headings[index]){headings[index].id='notes-heading-'+config.id;headings[index].dataset.noteMark=config.id}
    if(fields[index]){fields[index].id='notes-'+config.id;fields[index].setAttribute('aria-labelledby','notes-heading-'+config.id)}
  });
}
function enhancePodcastSheet23(root=podcastRootV4()){
  const sheet=root?.querySelector('#page-3 .conference-notes');if(!sheet)return;
  sheet.classList.add('note-sheet');ensurePodcastSemanticsV4(sheet);migratePodcastNotesV4();
  podcastNoteFieldsV4.forEach(config=>{
    const heading=sheet.querySelector('#notes-heading-'+config.id),field=sheet.querySelector('#notes-'+config.id);if(!heading||!field)return;
    const stored=safePodcastReadV4('cur23-reader-note:'+config.note);if(stored!==null&&!field.value)field.value=stored;
    heading.classList.add(config.tasks?'curation-note-task':'curation-note-noise');
    if(config.tasks){
      heading.dataset.task=config.tasks;heading.classList.add('curation-note-task-'+config.tasks);
      let badges=heading.querySelector('.curation-note-task-badges');
      if(!badges){badges=document.createElement('span');badges.className='curation-note-task-badges';badges.setAttribute('aria-label',config.tasks.split('').map(task=>'Task '+task).join(' plus '));for(const task of config.tasks){const badge=document.createElement('span');badge.className='curation-note-task-badge curation-note-task-badge-'+task;badge.textContent='Task '+task;badges.append(badge)}heading.append(badges)}
    }
    else if(!heading.querySelector('.curation-pen-line')){const ink=document.createElement('span');ink.className='curation-pen-line';while(heading.firstChild)ink.append(heading.firstChild);heading.append(ink)}
    heading.classList.toggle('is-revealed',classificationVisibleV4(config));makeEvidenceV4(sheet,config);
  });
  bindPodcastFieldsV4();
  // V6 owns an atomic typewriter transaction. Re-enhancement may decorate the
  // current sheet, but it must not project a complete answer over an in-flight
  // partial note and then let the older field reference overwrite it again.
  if(!window.podcastTransactionV5)renderPodcastNotesV4(cueIndex,done?cues[cueIndex]?.[2]||'':'');
}
notes=function(n,partial=''){
  renderPodcastNotesV4(n,partial);
  if(!active)return;
  E('meta').textContent='會議錄音 · '+(cueIndex+1)+' / '+cues.length;
  E('q').textContent=done?transcript[cues[cueIndex][0]].text:'聆聽至下一個關鍵點';
  E('a').textContent=done?cueHelp[cueIndex]:'留意講者有沒有更正早前的說法。';
};
function podcastBoundary23V4(){
  if(!active||audio.paused||done)return;
  const end=transcript[cues[cueIndex][0]].end;if(audio.currentTime+.035<end)return;
  audio.pause();audio.currentTime=end;done=true;clearInterval(typing);
  const word=cues[cueIndex][2],field=podcastFieldV4(fieldIds[cueIndex]);let count=0;notes(cueIndex);
  if(!word||!field){notes(cueIndex,word);E('next').disabled=false;paint();return}
  field.classList.add('curation-note-writing');
  typing=setInterval(()=>{count+=2;notes(cueIndex,word.slice(0,count));if(count>=word.length){clearInterval(typing);typing=0;field.classList.remove('curation-note-writing');E('next').disabled=false}},25);paint();
}
function modernizePodcastChromeV4(){
  panel.classList.add('curation-player');scriptWindow.classList.add('curation-transcript-window');
  panel.querySelector('b')?.classList.add('curation-player-title');E('seek').classList.add('curation-player-seek');E('time').classList.add('curation-player-time');E('pins').classList.add('curation-player-pins-toggle');E('rate').parentElement?.classList.add('curation-player-speed');
  let timeline=panel.querySelector('.curation-player-timeline');if(!timeline){timeline=document.createElement('div');timeline.className='curation-player-timeline';E('seek').before(timeline);timeline.append(E('seek'),E('ticks'))}E('ticks').classList.add('curation-player-pins');
  [...E('ticks').children].forEach((pin,index)=>{const at=transcript[cues[index][0]].end;pin.className='curation-player-pin';pin.textContent='';pin.style.left=Math.max(0,Math.min(100,(at-426)/(838.79-426)*100))+'%';pin.setAttribute('aria-label',(index+1)+'. '+(cues[index][2]||'會議結束')+' · '+tstr(at-426))});
  const head=scriptWindow.querySelector('header'),body=E('turns');head.classList.add('curation-transcript-window-head');body.classList.add('curation-transcript-window-body');
  for(const line of body.children){const turn=transcript[Number(line.dataset.id)],index=Number(line.dataset.id)-6;line.classList.add('speech');line.replaceChildren();const speaker=document.createElement('strong');speaker.className='speaker';speaker.textContent=turn.speaker;const copy=document.createElement('p');copy.textContent=turn.text;line.append(speaker,copy);if(zhTurns[index]){const spacer=document.createElement('span'),translation=document.createElement('p');translation.className='translation';translation.textContent=zhTurns[index];line.append(spacer,translation)}}
  if(!E('transcript-translate')){const translate=document.createElement('button');translate.id='transcript-translate';translate.type='button';translate.className='curation-transcript-translate';translate.textContent='中譯';translate.setAttribute('aria-pressed','false');translate.onpointerdown=event=>event.stopPropagation();translate.onclick=()=>{const show=scriptWindow.classList.toggle('show-translation');translate.setAttribute('aria-pressed',String(show))};head.append(translate)}
  if(!scriptWindow.querySelector('.curation-resize-handle'))for(const corner of ['nw','ne','sw','se']){const handle=document.createElement('i');handle.className='curation-resize-handle curation-resize-'+corner;handle.dataset.corner=corner;scriptWindow.append(handle);handle.onpointerdown=event=>{event.preventDefault();event.stopPropagation();const start=scriptWindow.getBoundingClientRect(),x=event.clientX,y=event.clientY;handle.setPointerCapture(event.pointerId);handle.onpointermove=move=>{let left=start.left,top=start.top,width=start.width,height=start.height;if(corner.includes('e'))width=Math.max(300,start.width+move.clientX-x);if(corner.includes('s'))height=Math.max(180,start.height+move.clientY-y);if(corner.includes('w')){width=Math.max(300,start.width-(move.clientX-x));left=start.right-width}if(corner.includes('n')){height=Math.max(180,start.height-(move.clientY-y));top=start.bottom-height}Object.assign(scriptWindow.style,{left:Math.max(0,left)+'px',right:'auto',top:Math.max(0,top)+'px',width:Math.min(innerWidth-left,width)+'px',height:Math.min(innerHeight-top,height)+'px'})};handle.onpointerup=()=>handle.onpointermove=null}}
}
const nativePageBeforePodcastV4=nativePage;
nativePage=function(page,row){nativePageBeforePodcastV4(page,row);if(page===3)enhancePodcastSheet23()};
const updateBeforePodcastV4=update23;
function connectPodcastHostV4(){const liveSection=document.querySelector('main>section');if(nativeHost.parentElement!==liveSection)liveSection.prepend(nativeHost);nativeHost.style.setProperty('display','block','important');nativeHost.style.width='100%';return liveSection}
update23=function(force=false){updateBeforePodcastV4(force);const podcastOpen=opened&&rows[i].stage===2;document.body.classList.toggle('cur23-podcast-active',podcastOpen);if(podcastOpen){const liveSection=connectPodcastHostV4();nativeHost.hidden=false;liveSection.classList.add('native-active');nativePage(3,rows[i]);enhancePodcastSheet23()}};
const renderBeforePodcastV4=render;
render=function(){renderBeforePodcastV4();if(rows[i].stage===2){const liveSection=connectPodcastHostV4();surface.hidden=true;nativeHost.hidden=false;liveSection.classList.add('native-active');nativePage(3,rows[i]);enhancePodcastSheet23()}};
modernizePodcastChromeV4();update23(true);
