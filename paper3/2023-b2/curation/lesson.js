const fieldNames=['Live, Study, Cook · Filming schedule','Kinds of food in the competition','William Puddle’s viral video','Staff training','Golden Sun Tower Private Kitchen complaints','New show: Viewer’s Choice'];
const fieldIds=[0,0,1,1,2,2,2,3,3,3,4,4,4,5,5,5,5];
notes=function(n,partial=''){const box=E('notes23');if(!box)return;box.replaceChildren();fieldNames.forEach((name,j)=>{let field=document.createElement('section');field.innerHTML='<b></b>';field.firstChild.textContent=name;for(let k=0;k<=n&&k<cues.length;k++){let value=k<n?cues[k][2]:partial;if(fieldIds[k]!==j||!value)continue;let p=document.createElement('p');p.textContent=value;p.style.background=inks[cues[k][1]];field.append(p)}box.append(field)})};
const originalPaint=paint;paint=function(){originalPaint();[...E('turns').children].forEach(p=>{let k=+p.dataset.id;p.classList.toggle('heard-noise',transcript[k].end<=audio.currentTime+.06&&noiseTurns.has(k))})};
function read23Record(key){try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}}
const positions=read23Record('cur23-task-progress');const persistUsage=()=>localStorage.setItem('cur23-task-progress',JSON.stringify(positions));const evidenceUsed=t=>new Set(rows.flatMap((r,j)=>r.t===t&&r.pattern&&j<=(positions[t]??-1)?r.used:[]));
function renderBank23(r){let bank=E('bank');bank.replaceChildren();for(let t=1;t<=3;t++){let detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Task '+['A · 8','B · 9','C · 10'][t-1];detail.open=t===r.t;detail.append(summary);let used=evidenceUsed(t);facts.forEach((f,id)=>{if(f[0]!==t)return;let heard=f[1]===19&&rows[i].stage>2;let reached=r.stage===4||heard||rows.slice(0,i+1).some(x=>x.stage===3&&x.p===f[1]&&x.q.includes(f[2]));if(!reached)return;let btn=document.createElement('button');btn.textContent=f[2];if(used.has(id))btn.className='spent';btn.onclick=()=>sourceVisit(id);detail.append(btn)});bank.append(detail)}}
const routes=new Map([['see the article',5],['present his side',7],['Corporate Training Intranet',9],['both William and Dante',8],['Listen to our discussion',3],['Check which delivery company',8],['If she confirms soon',8]]);
let routing=false;const underlying=render;render=function(){routing=false;underlying();let r=rows[i];if(r.stage===4){if(r.pattern||r.draft){positions[r.t]=i;persistUsage()}E('pdf').hidden=true;surface.hidden=false;surface.className='paper';surface.replaceChildren();if(r.draft){surface.textContent=['先列出公眾指控、真正錯誤及澄清，再起草網站公告。','先列三組「課程、提供者、實際用途」，再起草員工電郵。','先按畫面卡排列節目介紹、投票及大獎，再寫旁白。'][r.t-1]}else{const text=models[r.t-1].replace(/\s+/g,' ');let at=text.indexOf(r.q);if(at<0)surface.textContent=text;else{surface.append(text.slice(0,at));let current=document.createElement('span');current.className='current-model';current.append(...[...E('q').childNodes].map(x=>x.cloneNode(true)));surface.append(current,text.slice(at+r.q.length))}}}
if(r.leaf){surface.hidden=false;E('pdf').hidden=true;let text=leaves[r.leaf],hits=new Map();rows.slice(0,i+1).filter(x=>x.stage===r.stage&&x.leaf===r.leaf).forEach(x=>{let at=text.indexOf(x.q);if(at>=0)hits.set(at,x)});let pos=0;surface.replaceChildren();for(let [at,x] of [...hits].sort((a,b)=>a[0]-b[0])){if(at<pos)continue;surface.append(text.slice(pos,at));let m=document.createElement('span');m.textContent=x.q;m.style.background=inks[x.t<=3?x.t:x.state==='REJECT'?x.topic:x.t];if(x===r)m.classList.add('focus23');if(x.t===6||x.state==='REJECT')m.classList.add('heard-noise');surface.append(m);pos=at+x.q.length}surface.append(text.slice(pos));let target=surface.querySelector('.focus23');if(target)surface.scrollTop+=target.getBoundingClientRect().top-surface.getBoundingClientRect().top-surface.clientHeight*.3}
renderBank23(r);let route=[...routes].find(([q])=>r.q.includes(q));if(route){let b=document.createElement('button');b.className='route23';b.textContent='➜ 第 '+route[1]+' 頁\n'+leaves[route[1]].split('\n')[0];b.onclick=()=>{routing=true;E('src').hidden=true;showPage(excerpt,route[1],[],false);head.firstChild.textContent='資料指路 · 第 '+route[1]+' 頁　';diag.show()};E('refs').append(b)}};
const priorNext=E('next').onclick;E('next').onclick=()=>{if(routing){diag.close();routing=false;return}if(!diag.open&&E('refs').querySelector('.route23')&&!E('refs').querySelector('.route23').dataset.seen){let b=E('refs').querySelector('.route23');b.dataset.seen=1;b.click();return}priorNext()};render();
leaves[20]=markingPage;
const hands=fact(1,20,'the parts of the video where he washed his hands had been edited out','washed them','評分指引 8.5 核實洗手；聊天原句是 cleaned everything。');
essayUnits[6].used.push(hands);
function insertParts(r,parts){let j=rows.indexOf(r);for(let [text,why] of parts){let at=r.q.indexOf(text);if(at!==0)throw Error('Model boundary '+text);r.q=r.q.slice(text.length).trim();rows.splice(j++,0,{stage:4,p:r.p,t:r.t,q:text,a:why,pattern:text,refs:[],used:[]})}}
insertParts(essayUnits[0],[['Public announcement concerning the accusations against William Puddle','標題指明公告處理的指控及當事人，方便公眾立即辨認主題。']]);
insertParts(essayUnits[14],[['Dear all,','用群體稱呼向全體同事開信。']]);
insertParts(essayUnits[26],[['Viewer’s Choice: A New Way to Enjoy Live Cooking','標題以節目名帶出直播賣點。'],['TITLE CARD: VIEWER’S CHOICE','指示製作組在畫面顯示節目名。'],['VOICEOVER:','旁白提示不讀出，由配音員讀後文。']]);
insertParts(essayUnits[29],[['EPISODE 1 CARD: Fruit Pie','畫面標示第一集題目，提示畫面切換。'],['VOICEOVER:','由旁白接續介紹觀眾選擇。']]);
insertParts(essayUnits[31],[['PRIZE CARD','轉到獎品畫面。'],['VOICEOVER:','旁白解釋參加者如何得獎。']]);
for(const r of rows.filter(x=>x.draft)){const prep=r.t===1?['公眾需要知道甚麼？','先列真錯誤、水浸原因與三組誤會。']:r.t===2?['員工需要哪些技能？','列出三門課程、提供者、實際得益及兩項獎勵。']:['觀眾如何參與？','排列節目名、直播形式、兩位主持、投票、獎品與送遞。'];rows.splice(rows.indexOf(r),0,{stage:4,p:r.p,t:r.t,q:prep[0],a:prep[1],refs:[],plan:true})}
E('jump23').replaceChildren(...rows.map((r,j)=>new Option((j+1)+' · '+(r.q||r.a).slice(0,48),j)));
const choose=document.createElement('div');choose.className='tasks23';for(let t=1;t<=3;t++){let b=document.createElement('button');b.textContent='Task '+['A','B','C'][t-1];b.onclick=()=>{i=positions[t]??rows.findIndex(r=>r.stage===4&&r.t===t);render()};choose.append(b)}dock.querySelector('.tools23').append(choose);
const coreRender=render;render=function(){coreRender();if(rows[i].plan){surface.hidden=false;E('pdf').hidden=true;surface.textContent=rows[i].a}E('prev').disabled=i===0;E('next').disabled=active?!done:i===rows.length-1};render();
const shownByTask=read23Record('cur23-shown');const previousBank=renderBank23;renderBank23=function(r){previousBank(r);for(let t=1;t<=3;t++){let progress=shownByTask[t]||{},used=new Set(rows.flatMap((x,j)=>x.pattern&&x.t===t?(j<progress.i?x.used:j===progress.i?x.used.slice(0,progress.n):[]):[]));let group=E('bank').children[t-1];for(let button of group.querySelectorAll('button')){let id=facts.findIndex(f=>f[0]===t&&f[2]===button.textContent);button.classList.toggle('spent',used.has(id))}}};let lastStep=-1;
const finalView=render;render=function(){let r=rows[i];if(r.stage===4&&i!==lastStep){let old=shownByTask[r.t];if(!old||old.i!==i)shownByTask[r.t]={i,n:0};localStorage.setItem('cur23-shown',JSON.stringify(shownByTask))}finalView();lastStep=i;visitIndex=shownByTask[r.t]?.i===i?shownByTask[r.t].n:0;renderBank23(r)};
const previewSource=sourceVisit;sourceVisit=function(id){let r=rows[i];if(r.pattern&&r.used.includes(id)){shownByTask[r.t]={i,n:Math.max(shownByTask[r.t]?.n||0,r.used.indexOf(id)+1)};localStorage.setItem('cur23-shown',JSON.stringify(shownByTask));renderBank23(r)}previewSource(id);const v=facts[id];if(v[1]===20)head.firstChild.textContent='評分指引 · Task 8 · 8.5　';if(v[1]===19){let c=cues.find(k=>transcript[k[0]].text.includes(v[2]));if(c){let note=document.createElement('p');note.textContent='筆記 · '+c[2];note.className='applied';excerpt.prepend(note)}}};
for(let t of [1,2,3]){let b=choose.children[t-1];b.onclick=()=>{i=shownByTask[t]?.i??rows.findIndex(x=>x.plan&&x.t===t);render()}}
const oldListen=listen;listen=function(j,p){oldListen(j,p);localStorage.setItem('cur23-cue',j)};const savedCue=Number(localStorage.getItem('cur23-cue')||0);render();if(active&&cues[savedCue])listen(savedCue,false);
const store=document.createElement('details');store.innerHTML='<summary>存檔 · 匯出／匯入</summary><select aria-label="存檔位置"></select><button>儲存</button><button>載入</button><button>匯出</button><input type="file" accept=".json">';dock.append(store);let slot=store.querySelector('select');for(let n=1;n<=5;n++)slot.add(new Option('位置 '+n,n));const snapshot=()=>({version:2,key:key23(rows[i]),i,shown:stableUsage(),cue:cueIndex,notes:[1,2,3].map(t=>localStorage.getItem('2023-draft-'+t)||'')});function restore(v){if(!v||![1,2].includes(v.version))return;let oldRows=v.version===1?rows.filter(r=>r.stage!==3||!editorial23.some(d=>d[3]===r.q)):null;let oldIndex=n=>oldRows?.[n]?entry23(key23(oldRows[n])):-1;let target=v.version===2?entry23(v.key):oldIndex(v.i);if(!Number.isInteger(target)||!rows[target])return;i=target;for(const [t,state] of Object.entries(v.shown||{})){let index=v.version===2?entry23(state.key):oldIndex(state.i);if(index>=0)shownByTask[t]={i:index,n:state.n}}(v.notes||[]).forEach((s,j)=>localStorage.setItem('2023-draft-'+(j+1),s));render();if(active&&cues[v.cue])listen(v.cue,false)}const sb=store.querySelectorAll('button');sb[0].onclick=()=>localStorage.setItem('cur23-slot'+slot.value,JSON.stringify(snapshot()));sb[1].onclick=()=>restore(JSON.parse(localStorage.getItem('cur23-slot'+slot.value)));sb[2].onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(snapshot())],{type:'application/json'}));a.download='2023-B2-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};store.querySelector('input').onchange=async e=>{try{restore(JSON.parse(await e.target.files[0].text()))}catch{e.target.setCustomValidity('存檔格式無效');e.target.reportValidity()}};
// Picking a step explicitly replays that unit. A task tab resumes its saved position.
E('jump23').onchange=e=>{i=Number(e.target.value);const r=rows[i];if(r.stage===4)shownByTask[r.t]={i,n:0};render()};
const cueHelp=['財務部確認十集。八集是舊數字。','原定七月撞正暑假，最後改在十月。','早餐方案被放棄，改為主菜。','甜品是另一類選擇，與主菜分行記錄。','先記水浸；稍後用聊天紀錄解釋原因。','水浸屬實，食安指控仍須查證。','錄音澄清流眼水是切洋蔥所致。','全體員工需要社交媒體訓練。','清楚表達可以避免誤解及冒犯。','三個條件缺一不可：首十名、完成全部三科、額外一日假。','是多士燶了，不能誇大為已證實的火警。','防火是員工需要。用課程簡介核對實際技能。','一萬元是要求；五千元是回應，這個數字不屬三篇寫作的內容。','新節目名稱是 Viewer’s Choice。','觀眾選材料，由 William 在節目上即場煮。','全程直播是可以用於宣傳的已確認特色。','會議結束，核對筆記再開始逐句取證。'];
const noteView=notes;notes=function(n,partial){noteView(n,partial);if(!active)return;E('meta').textContent='會議錄音 · '+(cueIndex+1)+' / '+cues.length;E('q').textContent=done?transcript[cues[cueIndex][0]].text:'聆聽至下一個關鍵點';E('a').textContent=done?cueHelp[cueIndex]:'留意講者有沒有更正早前的說法。';const box=E('notes23');if(!box)return;for(let [j,node] of [...box.children].entries()){const note=document.createElement('input');note.placeholder='我的補充筆記';note.setAttribute('aria-label',fieldNames[j]+' · 我的筆記');note.value=localStorage.getItem('cur23-usernote'+j)||'';note.oninput=()=>localStorage.setItem('cur23-usernote'+j,note.value);node.append(note)}};
audio.onerror=()=>{showAudioFailure();E('a').textContent='未能載入會議錄音。可先閱讀逐字稿，再按重試載入錄音。'};audio.onloadedmetadata=()=>{if(active&&audio.currentTime<426)audio.currentTime=426};
const linkRender=render;render=function(){linkRender();const r=rows[i];if(r.leaf){E('open').href='originals/page-'+String(r.leaf).padStart(2,'0')+'.webp';E('meta').textContent='Data File 第 '+r.leaf+' 頁 · '+(r.tag?'暫標 '+r.tag:'類型 '+r.t)}else E('open').href='benchmark.pdf#page='+r.p;if(active)notes(cueIndex);};render();
// Add the precise original source wording for each scored evidence item even when a
// workbook decision groups several sentences under the same numbered teaching note.
const writtenEnd=rows.findIndex(r=>r.stage===4);
const evidenceRows=facts.filter(f=>f[1]>=5&&f[1]<=10&&!rows.some(r=>r.stage===3&&r.leaf===f[1]&&r.q===f[2])).map(f=>({stage:3,p:f[1],leaf:f[1],t:f[0],topic:f[0],q:f[2],a:f[4],state:'CURRENT'}));
rows.splice(writtenEnd,0,...evidenceRows);
const editorial23=[
 [7,6,3,'Archie:Go on.','簡短催促對話繼續，沒有可用於三篇寫作的新事實。'],
 [7,6,3,'William:Oh, I see. Good decision!','只是對免費 app 投票的反應；實際方法須引用 Archie 前一句。'],
 [8,6,2,'File　 Message Junk　 Delete　 Reply　 Reply All　 Forward　 Move　 Mark Unread　 Follow up','郵件介面的操作字樣，不屬員工培訓內容。'],
 [8,4,2,'Dear All','這是群體電郵的稱呼格式，可借用於 Task 9；本身不是培訓事實。'],
 [8,6,2,'Keep up the good work and Bon Appetit!','禮貌結語沒有新增課程、獎勵或節目資料。'],
 [9,6,2,'Yoga mums and fitness dads also welcome!','課程廣告的招徠語，不足以證明它適合本次員工需要。'],
 [9,6,2,'monetise your brand today!','品牌變現的宣傳語，不是本次急需的溝通技能。'],
 [10,6,2,'He’s a surfer, just like me','講師的私人興趣，與室內廚房員工的課程選擇無關。'],
 [10,6,2,'That purple backdrop was to die for','個人審美評價，不能作為課程工作效益。']
];
for(const [page,type,topic,quote,why] of editorial23){
 if(!leaves[page].includes(quote))throw Error('Missing source passage: '+quote);
 rows.splice(writtenEnd,0,{stage:3,p:page,leaf:page,t:type,topic,q:quote,a:why,state:'CURRENT'});
}
// Audited v6 separates source directions, unverified claims and usable evidence.
// Retain the earlier identifiers for existing positions, slots and bookmarks.
const auditedEdits = [
  [0,'present his side',5,'跟隨 Archie 與 William 的對話，核對當事人的解說。'],
  [0,'both William and Dante',5,'William 和 Dante 都提供過更新。從聊天和電郵核對最新安排。'],
  [3,'Viewers expressed shock',5,'小報交代影片瘋傳及公眾反應。讀到這裡仍須區分已知事實與指控。'],
  [3,'Experts agree',5,'這是小報引述的評價。留意發言人的立場，公告須認真回應公眾疑慮。'],
  [3,'“His eyes were clearly',5,'Cooke 把眼睛泛淚解讀成情緒失控。這是對方的推斷，須再查錄音。'],
  [3,'Neither Puddle',5,'記者聯絡不到兩人回應，交代了公司發公告的背景。'],
  [3,'Archie:Yes, but only',5,'只有粉絲熟悉其他影片，公司須向一般讀者交代完整背景。'],
  [3,'Those of you who listened',2,'培訓範圍已由廚師擴展至全體員工。選課和解釋工作用途時，要照顧不同職務。'],
  [3,'Similarly, staff',2,'導師須獲 Health Advisory Board（HAB）認可。比較食品衞生課程時，先核對這項硬條件。'],
  [3,'We run training sessions',2,'The Grill Gurus 的所有導師均獲 HAB 認可，符合 Dante 對食品衞生培訓的要求。'],
  [3,'The instructors gave out',5,'這位學員欣賞食安貼士，但正面評價不能取代 HAB 認可。']
];
for(const [stage,prefix,type,reason] of auditedEdits){
  const row=rows.find(r=>r.stage===stage&&r.q.startsWith(prefix));
  if(row){row.originalType=row.t;row.t=type;row.a=reason;}
}
for(const row of rows.filter(r=>r.stage===3&&r.q.startsWith('William:I’m so sorry!'))){
  row.originalQuote=row.q;
  const split=row.q.indexOf('I thought everyone');
  if(row.t===1)row.q=row.q.slice(0,split).trim();
  else{row.originalType=row.t;row.t=5;row.q=row.q.slice(split);row.a='William 擔心自己能否繼續主持節目。這句把話題帶到新節目，沒有補充水浸的原因。';}
}
const bodyRows=rows.filter(r=>r.stage===3).sort((a,b)=>a.p-b.p||leaves[a.p].indexOf(a.q)-leaves[b.p].indexOf(b.q));rows.splice(rows.findIndex(r=>r.stage===3),bodyRows.length,...bodyRows);
E('jump23').replaceChildren(...rows.map((r,j)=>new Option((j+1)+' · '+(r.q||r.a).slice(0,48),j)));
const routeView=render;render=function(){routeView();let r=rows[i];let button=E('refs').querySelector('.route23');if(button){button.firstChild.textContent=button.firstChild.textContent.replace('➜ ','');button.insertAdjacentHTML('afterbegin','<svg width="46" height="26" viewBox="0 0 46 26" aria-hidden="true"><path d="M2 23 Q13 1 37 8 M30 2 L39 8 L31 15" fill="none" stroke="#d0282d" stroke-width="2.5" stroke-linecap="round"/></svg>')}if(r.stage===3){E('meta').textContent='Data File 第 '+r.p+' 頁 · 逐句判讀 · 類型 '+r.t+(r.topic?' · Task '+['A','B','C'][r.topic-1]:'');if(r.state==='SUPERSEDED'&&r.p===6){E('a').textContent='這是故事板初稿。先保留候選，讀過 William 的聊天及 Dante 的更新才判斷是否採用。'}}};render();
const key23=r=>[r.stage,r.originalType??r.t,r.p,r.originalQuote??r.q].join('|');const entry23=key=>rows.findIndex(r=>key23(r)===key);
const stableUsage=()=>Object.fromEntries(Object.entries(shownByTask).filter(([t,v])=>rows[v.i]).map(([t,v])=>[t,{key:key23(rows[v.i]),n:v.n}]));
function remember23(){localStorage.setItem('cur23-stable',key23(rows[i]));localStorage.setItem('cur23-stableUse',JSON.stringify(stableUsage()));if(active)localStorage.setItem('cur23-audioState',JSON.stringify({j:cueIndex,done,time:audio.currentTime}))}
const stableView=render;render=function(){stableView();remember23()};const blueView=sourceVisit;sourceVisit=function(id){blueView(id);remember23()};
if(savedUse23){for(const [t,v] of Object.entries(read23Record('cur23-stableUse'))){if(!v||typeof v.key!=='string')continue;const index=entry23(v.key);if(index>=0)shownByTask[t]={i:index,n:Number(v.n)||0}}}
if(savedEntry23&&entry23(savedEntry23)>=0)i=entry23(savedEntry23);render();

window.addEventListener('pagehide',remember23);audio.addEventListener('pause',remember23);
const goBack23=E('prev').onclick;E('prev').onclick=()=>{if(diag.open&&!routing&&rows[i].pattern){let t=rows[i].t;diag.close();visitIndex=Math.max(0,visitIndex-1);shownByTask[t]={i,n:visitIndex};renderBank23(rows[i]);E('next').textContent='下一步 →';remember23();return}goBack23()};
const seekWrap=document.createElement('span');seekWrap.className='seek-wrap';E('seek').before(seekWrap);seekWrap.append(E('seek'));const pinLayer=document.createElement('span');pinLayer.className='pin-layer';pinLayer.hidden=true;seekWrap.append(pinLayer);for(let c of cues){let pin=document.createElement('i');pin.style.left=(transcript[c[0]].end-426)/(838.79-426)*100+'%';pin.title=c[2];pinLayer.append(pin)}E('pins').addEventListener('click',()=>{pinLayer.hidden=E('ticks').hidden});
const reject23=[['vote for free through','The voting hotline number will be on the screen in each episode.',6,3],['Mary Steward has confirmed','Our regular chef, plus one mystery guest each week',6,3],['instructors lost their HAB approval','3. Food Hygiene Basics',9,2],['only for management-level staff','1. Advanced Fire Safety',9,2],['he works at an indoor kitchen','B: The Fire Chef’s Manual',9,2]];
const decisionsView=render;render=function(){decisionsView();let r=rows[i];if(r.stage!==3)return;let record=reject23.find(v=>r.q.includes(v[0]));if(!record)return;let [trigger,span,page,task]=record,b=document.createElement('button');b.className='route23';b.textContent='第 '+page+' 頁\n核對早前方案';b.onclick=()=>{routing=true;head.firstChild.textContent='原文 · 早前方案已淘汰　';E('src').hidden=true;excerpt.className='paper';let txt=leaves[page],at=txt.indexOf(span),m=document.createElement('span');m.textContent=span;m.style.background=inks[task];m.className='heard-noise';excerpt.replaceChildren(txt.slice(0,at),m,txt.slice(at+span.length));diag.show();excerpt.scrollTop+=m.getBoundingClientRect().top-excerpt.getBoundingClientRect().top-excerpt.clientHeight/3};E('refs').append(b)};render();

if(active&&savedAudio23){const v=read23Record('cur23-audioState');if(cues[v.j]){listen(v.j,false);done=!!v.done;audio.currentTime=Number(v.time)||426;notes(v.j+(done?1:0));E('next').disabled=!done;paint()}}
const sourceLabel=v=>v[1]===20?'評分指引 · 8.5':v[1]===19?'網上會議 · 錄音':'Data File 第 '+v[1]+' 頁';
const ledger=renderBank23;renderBank23=function(r){ledger(r);for(let t=1;t<=3;t++){let group=E('bank').children[t-1];for(const b of group.querySelectorAll('button')){const v=facts.find(f=>f[0]===t&&f[2]===b.textContent);if(!v)continue;b.title=sourceLabel(v)+' · '+v[4];let label=document.createElement('small');label.textContent=sourceLabel(v)+(v[1]===5?' · 小報說法':'');b.after(label)}}};
const finalLabel=render;render=function(){finalLabel();const r=rows[i];if(r.pattern){E('meta').textContent=['公開網站公告 · 公眾','培訓推薦電郵 · 全體員工','宣傳短片講稿 · 觀眾'][r.t-1]+' · Task '+(7+r.t);for(let [k,btn] of [...E('refs').querySelectorAll('button')].entries()){let id=r.used[k];if(id==null)continue;btn.textContent=sourceLabel(facts[id])+' · 核對原文';btn.onclick=()=>sourceVisit(id)}}};if(!active)render();
const extraLinks=[
 [0,1,5,'quickly went viral after appearing on Puddle’s social media accounts','circulation','改寫小報對影片傳播的描述。'],
 [3,1,7,'We’ve just switched from an automatic tap to a manual one and I forgot it wouldn’t turn off by itself!','automatic tap','automatic 與 manual 的對照交代錯誤原因。'],
 [8,1,7,'I used a clean one!','clean towel','用 William 的澄清回應小報指控。'],
 [15,2,9,'2. Hazard Awareness','Hazard Awareness','推薦指定課程，與同供應者的管理層課程分開。'],
 [17,2,9,'A: The Chef’s Special','The Chef’s Special','選用具 HAB 資格導師教授的課程。'],
 [18,2,10,'Great tips on how to have a food-safe kitchen.','food-safe kitchen','此為一名參加者的評價。'],
 [20,2,9,'Option 1: Be Your Best!','Be Your Best!','用課程正式名稱。'],
 [21,2,19,"So how not to offend people, that kind of thing.",'cause offence','會議點出避免冒犯的培訓需要。'],
 [26,3,7,'Mary Steward? The Queen of TV Cooking?','Queen of TV cooking','稱號來自聊天；出席另由較新的電郵確認。'],
 [32,3,6,'The finished dish → straight to your door!','winner’s door','故事板交代目的地，電郵補充無人機及公司。']];
for(let [u,t,p,q,k,h] of extraLinks){let id=facts.findIndex(f=>f[0]===t&&f[1]===p&&f[2]===q);if(id<0)id=fact(t,p,q,k,h);if(!essayUnits[u].used.includes(id))essayUnits[u].used.push(id)}
const sign=essayUnits[25];sign.q='Regards,';rows.splice(rows.indexOf(sign)+1,0,{stage:4,p:12,t:2,q:'Nico Lin',pattern:'Nico Lin',a:'署名交代寫信人身分。',used:[],refs:[]});
E('jump23').replaceChildren(...rows.map((r,j)=>new Option((j+1)+' · '+(r.q||r.a).slice(0,48),j)));if(savedEntry23&&entry23(savedEntry23)>=0)i=entry23(savedEntry23);if(!active)render();
const planText=[['組織公告','先表明支持，再承認水浸；把洗手、茶巾和洋蔥三組指控與澄清逐一配對。','核對公告','公眾可否看清哪一項是真的？核對手動水龍頭、剪片、150 條茶巾和洋蔥。'],['列課程選擇表','每行列課名、供應者、實際技能及工作用途；把培訓學分和有條件的額外假期分開。','核對員工電郵','檢查三個課程與供應者配對、HAB 資格和首十名完成三科的條件。'],['編排畫面與旁白','先用畫面卡介紹節目，再用旁白邀請觀眾投票，最後揭曉獎品。','核對宣傳講稿','核對常任拍檔、全程直播、首集餡料、免費 app、幸運投票者及 FlyingFood 無人機。']];
for(const d of rows.filter(r=>r.draft)){const [q,a,q2,a2]=planText[d.t-1];let j=rows.indexOf(d);rows.splice(j,0,{stage:4,t:d.t,p:d.p,q,a,plan:true});rows.splice(j+2,0,{stage:4,t:d.t,p:d.p,q:q2,a:a2,plan:true})}
E('jump23').replaceChildren(...rows.map((r,j)=>new Option((j+1)+' · '+(r.q||r.a).slice(0,48),j)));if(savedEntry23&&entry23(savedEntry23)>=0)i=entry23(savedEntry23);if(!active)render();
