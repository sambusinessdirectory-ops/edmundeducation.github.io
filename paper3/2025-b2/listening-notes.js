(() => {
  'use strict';
  const page = document.getElementById('page-3');
  if (!page) return;
  const groups = [
    {id:'slogan', title:'Slogan / 口號', scope:'亞運週 · B1 資料', ranges:[[12,3,11],[13,0,1]], tip:'最後確認的口號是 One Games, One Asia，中間有逗號。Passion, Pride, Performance 只是先提出的建議，不是最後採用的口號。'},
    {id:'opening', title:'Opening Event / 開幕活動', scope:'亞運週 · B1 資料', ranges:[[13,2,13],[14,0,2]], tip:'最後決定：10 月 13 日、下午、Main Hall（禮堂）。10 月 6 日和 sports ground（運動場）都曾被提出，但後來更改；不可把亞運週的十月日期用作健康月日期。'},
    {id:'wellness', title:'The Wellness Month / 健康月', scope:'健康月 · B2 Task 1', ranges:[[12,3,3],[14,3,11],[15,0,5]], tip:'健康月在七月、考試後舉行，主題是 Relax and Recover，不是 hiking。再次舉辦 Yoga and Meditation，宣傳重點是改善 focus and attention span，並有兩位知名導師；人選確認前不要寫導師姓名。'},
    {id:'topic', title:'Speech topic / 演講主題', scope:'亞運週 · B1 資料', ranges:[[15,7,11]], tip:'嘉賓運動員會解釋為甚麼自己的運動應加入亞運。校長會先調查學生有興趣的運動；嘉賓姓名尚未確定，不要自行填上人名。'},
    {id:'after', title:'After the speech / 演講之後', scope:'亞運週 · B1 資料', ranges:[[16,0,4]], tip:'演講後安排討論該項運動，並預留充足時間讓學生提問。重點是增加互動，不是另一次演講。'},
    {id:'parents', title:'Parent Involvement / 家長參與', scope:'健康月 · B2 Task 3', ranges:[[16,5,11],[17,0,6]], tip:'家長需要參加 briefing session（簡介會），並透過 school app 報名。school website 隨即被更正，不能使用。家長的具體職責要結合 Mr Singh 的電郵；錄音沒有列出所有職責。'}
  ];
  // Relative to the meeting cut at 46:36.5 in the supplied full exam recording.
  const starts = {slogan:20.3, opening:80.6, wellness:167.4, topic:310.7, after:365, parents:403.1};
  const make = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const player = make('section','','notes-audio');
  player.setAttribute('aria-label','2025 Part B 會議錄音');
  player.append(make('p','2025 · PART B','notes-audio-kicker'),make('h3','會議錄音 · 邊聽邊記筆記'));
  player.append(make('p','完整會議約 8 分 38 秒。按播放開始聆聽，或在各筆記欄展開對話並從該段開始播放。','notes-audio-help'));
  const audio = make('audio');
  audio.controls = true;
  audio.preload = 'metadata';
  audio.src = '/paper3/2025-b2/part-b-meeting.m4a';
  audio.setAttribute('aria-label','2025 Part B 會議錄音播放器');
  const audioStatus = make('p','','notes-audio-status');
  audioStatus.setAttribute('role','status');
  const retry = make('button','重新載入錄音','notes-audio-retry');
  retry.type='button'; retry.hidden=true;
  retry.addEventListener('click',()=>{retry.hidden=true;audioStatus.textContent='正在重新載入錄音…';audio.load();});
  audio.addEventListener('error',()=>{audioStatus.textContent='錄音暫時未能載入，請檢查網絡後重試。你仍可展開下方的相關錄音稿。';retry.hidden=false;});
  audio.addEventListener('loadedmetadata',()=>{audioStatus.textContent='';retry.hidden=true;});
  player.append(audio,audioStatus,retry);
  page.querySelector('.source-paper').prepend(player);
  let pendingSeek = null;
  audio.addEventListener('loadedmetadata',()=>{
    if (pendingSeek !== null) {audio.currentTime=pendingSeek;pendingSeek=null;}
  });
  for (const group of groups) {
    const field = document.getElementById(`notes-${group.id}`);
    if (!field) continue;
    const details = make('details', '', 'notes-evidence');
    details.dataset.notesSection = group.id;
    const summary = make('summary', '顯示相關錄音內容');
    summary.setAttribute('aria-label',`${group.title}：顯示或收起相關錄音內容`);
    const content = make('div', '', 'notes-evidence-content');
    content.append(make('p',group.scope,'notes-evidence-scope'),make('p',group.tip,'notes-evidence-tip'));
    const start=starts[group.id];
    const minutes=Math.floor(start/60), seconds=String(Math.floor(start%60)).padStart(2,'0');
    const play=make('button',`▶ 從此段播放 · ${minutes}:${seconds}`,'notes-section-play');
    play.type='button';
    play.dataset.audioStart=String(start);
    play.setAttribute('aria-label',`播放 ${group.title} 相關錄音，由 ${minutes} 分 ${seconds} 秒開始`);
    play.addEventListener('click',()=>{
      pendingSeek=start;
      if(audio.readyState>=1){audio.currentTime=start;pendingSeek=null;}
      audioStatus.textContent=`正在播放：${group.title}`;
      audio.play().catch(()=>{audioStatus.textContent='未能開始播放，請按上方播放器的播放鍵重試。';});
    });
    content.append(play);
    const transcript = make('div','','notes-evidence-transcript');
    transcript.setAttribute('role','region');
    transcript.setAttribute('aria-label',`${group.title} 相關錄音稿`);
    transcript.tabIndex = 0;
    for (const [pageNumber, first, last] of group.ranges) {
      const speeches = document.querySelectorAll(`#page-${pageNumber} .recording-script .speech`);
      for (let i = first; i <= last; i++) {
        if (!speeches[i]) continue;
        transcript.append(speeches[i].cloneNode(true));
      }
    }
    content.append(transcript);
    details.append(summary,content);
    details.addEventListener('toggle',()=>{summary.textContent=details.open ? '收起相關錄音內容' : '顯示相關錄音內容';});
    field.before(details);
  }
})();
