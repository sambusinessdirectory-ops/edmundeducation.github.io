import {grammarAdminConnection,loginError} from './grammar-admin-connection.mjs?v=20261102-indefinite-answers1';
import {grammarModules,exerciseReviewItems,exportText,exportHtml} from './grammar-admin-export.mjs?v=20261123-expanded-review1';

const root=document.querySelector('[data-learning-portal-root]');
const context=grammarAdminConnection();

if(root && context?.rpc) {
  const key='edmund-grammar-admin-session-v1';
  let token='',busy=false,activeModule=null,reviewItems=[];
  const panel=document.createElement('main');
  panel.className='learning-portal-shell grammar-admin';
  panel.hidden=true;
  panel.innerHTML=`
    <section class="panel grammar-admin__gate" data-admin-gate>
      <div class="grammar-admin__head">
        <div><p class="eyebrow">GRAMMAR ADMIN</p><h1>語法系統管理員</h1><p>登入後可用與學生相同的模組目錄查看完整答案。</p></div>
        <button type="button" class="grammar-button--ghost" data-admin-close>返回學生入口</button>
      </div>
      <form class="grammar-admin__login" data-admin-login>
        <label>管理員用戶名稱<input name="username" autocomplete="username" maxlength="160" required></label>
        <label>密碼<input name="password" type="password" autocomplete="current-password" maxlength="200" required></label>
        <label class="grammar-admin__answers"><input type="checkbox" data-admin-show-password> 顯示密碼</label>
        <button class="grammar-button" type="submit">管理員登入</button>
      </form>
      <p data-admin-status role="status" aria-live="polite"></p>
    </section>
    <section class="panel grammar-library grammar-admin__library" data-admin-content hidden aria-labelledby="grammar-admin-library-title">
      <div class="grammar-admin__library-head">
        <div><p class="eyebrow">GRAMMAR ANSWER LIBRARY</p><h1 id="grammar-admin-library-title">語法練習 · 答案與解析</h1><p>選擇練習模組；每題答案及完整逐步解析會一次全部展開。</p><p class="grammar-admin__signed-in" data-admin-name></p></div>
        <div class="grammar-admin__head-actions"><button type="button" class="grammar-button--ghost" data-admin-close>返回學生入口</button><button class="grammar-button--ghost" type="button" data-admin-logout>登出管理員</button></div>
      </div>
      <p class="grammar-admin__notice"><strong>管理員檢視</strong><span>此目錄只顯示練習、答案與逐步解析。</span></p>
      <p data-admin-library-status role="status" aria-live="polite"></p>
      <div class="grammar-admin__modules" data-admin-modules></div>
    </section>
    <section class="panel grammar-admin__review" data-answer-browser hidden aria-labelledby="grammar-admin-review-title">
      <header class="grammar-admin__review-hero">
        <div class="grammar-admin__review-nav"><button class="grammar-button--ghost" type="button" data-review-back>返回練習目錄</button><button class="grammar-button--ghost" type="button" data-admin-close>返回學生入口</button></div>
        <p class="eyebrow" data-review-eyebrow>ADMIN REVIEW</p>
        <h1 id="grammar-admin-review-title" data-answer-heading></h1>
        <p data-review-summary></p>
      </header>
      <div class="grammar-admin__review-tools">
        <label class="grammar-admin__search"><span>搜尋題號、題目、答案或解析</span><input type="search" data-answer-search placeholder="輸入關鍵字即時篩選"></label>
        <label class="grammar-admin__jump"><span>快速跳到</span><select data-answer-jump aria-label="快速跳到題目"></select></label>
        <div class="grammar-admin__exports" aria-label="匯出完整練習"><button class="grammar-button--ghost" type="button" data-export-format="pdf">全部練習 · PDF</button><button class="grammar-button--ghost" type="button" data-export-format="txt">全部練習 · TXT</button></div>
        <p data-answer-count role="status" aria-live="polite"></p>
        <p data-review-status role="status" aria-live="polite"></p>
      </div>
      <div class="grammar-admin__expanded-note"><strong>全部展開</strong><span>每題的參考答案和逐步解析均已直接顯示，不必逐項點開。</span></div>
      <div data-answer-results class="grammar-admin__results"></div>
      <p data-answer-empty class="grammar-admin__empty" hidden>找不到符合搜尋條件的題目。</p>
      <button class="grammar-button--ghost grammar-admin__back-to-top" type="button" data-review-top>返回本頁頂部</button>
    </section>`;
  root.after(panel);

  const find=selector=>panel.querySelector(selector);
  const findAll=selector=>[...panel.querySelectorAll(selector)];
  const gate=find('[data-admin-gate]');
  const status=find('[data-admin-status]');
  const libraryStatus=find('[data-admin-library-status]');
  const reviewStatus=find('[data-review-status]');
  const form=find('[data-admin-login]');
  const content=find('[data-admin-content]');
  const review=find('[data-answer-browser]');
  const results=find('[data-answer-results]');
  const entry=document.createElement('button');
  entry.type='button';
  entry.className='learning-portal-header-button';
  entry.textContent='管理員入口';
  document.querySelector('.edmund-system-header__actions')?.append(entry);

  function store(value){try{if(value)sessionStorage.setItem(key,value);else sessionStorage.removeItem(key);}catch{/* In-memory session still works. */}}
  function setMessage(message=''){(gate.hidden?(review.hidden?libraryStatus:reviewStatus):status).textContent=message;}
  function showLibrary(){review.hidden=true;content.hidden=false;results.replaceChildren();reviewItems=[];activeModule=null;reviewStatus.textContent='';find('[data-answer-search]').value='';window.scrollTo({top:0,behavior:'smooth'});}
  function clear(message=''){
    token='';store('');activeModule=null;reviewItems=[];results.replaceChildren();
    gate.hidden=false;content.hidden=true;review.hidden=true;form.hidden=false;
    status.textContent=message;libraryStatus.textContent='';reviewStatus.textContent='';find('[data-admin-name]').textContent='';
  }
  function open(){root.hidden=true;panel.hidden=false;entry.hidden=true;if(!gate.hidden)find('[name="username"]')?.focus();}
  function close(){panel.hidden=true;root.hidden=false;entry.hidden=false;}
  async function validate(){
    if(!token)return false;
    try {
      const rows=await context.rpc('grammar_admin_profile',{p_token:token});
      if(!rows?.[0]?.session_token){clear('管理員登入已過期，請重新登入。');return false;}
      return rows[0];
    }catch(error){setMessage(loginError(error));return false;}
  }
  function signedIn(row){
    token=row.session_token;store(token);gate.hidden=true;content.hidden=false;review.hidden=true;
    find('[data-admin-name]').textContent=`已登入：${row.name}`;status.textContent='';libraryStatus.textContent='';reviewStatus.textContent='';
  }

  function removeDataAttributes(element){
    for(const node of [element,...element.querySelectorAll('*')])for(const attribute of [...node.attributes])if(attribute.name.startsWith('data-'))node.removeAttribute(attribute.name);
  }
  function fallbackModuleCard(module,index){
    const card=document.createElement('article');
    const themes=['',' grammar-lesson-card--articles',' grammar-lesson-card--new-curation'];
    card.className=`grammar-lesson-card${themes[Math.min(index,2)]}`;
    const copy=document.createElement('div');copy.className='grammar-lesson-card__copy';
    const eyebrow=document.createElement('p');eyebrow.className='eyebrow';
    const title=document.createElement('h3');
    const [english,...chineseParts]=module.title.split(' · ');title.append(document.createTextNode(english));
    if(chineseParts.length){title.append(' ');const chinese=document.createElement('span');chinese.lang='zh-Hant';chinese.textContent=chineseParts.join(' · ');title.append(chinese);}
    const description=document.createElement('p');copy.append(eyebrow,title,description);card.append(copy);
    return card;
  }
  function buildModuleCard(module,index,learnerCards){
    const card=(learnerCards[index]?.cloneNode(true)) || fallbackModuleCard(module,index);
    removeDataAttributes(card);card.classList.add('grammar-admin__module-card');
    const copy=card.querySelector('.grammar-lesson-card__copy') || card;
    const eyebrow=copy.querySelector('.eyebrow') || document.createElement('p');
    eyebrow.classList.add('eyebrow');eyebrow.textContent=`MODULE ${String(index+1).padStart(2,'0')} · ${module.questions.length} QUESTIONS`;
    if(!eyebrow.parentNode)copy.prepend(eyebrow);
    let description=copy.querySelector('p:last-child');
    if(description===eyebrow){description=document.createElement('p');copy.append(description);}
    description.textContent='查看全部題目、參考答案與每題完整逐步解析；進入後所有內容會自動展開。';
    let stats=card.querySelector('.grammar-lesson-card__stats');
    if(!stats){stats=document.createElement('div');stats.className='grammar-lesson-card__stats';card.append(stats);}
    stats.replaceChildren();stats.classList.add('grammar-admin__module-action');
    const count=document.createElement('div');const strong=document.createElement('strong');const label=document.createElement('span');
    strong.textContent=String(module.questions.length);label.textContent='題完整解答';count.append(strong,label);
    const button=document.createElement('button');button.type='button';button.className='grammar-button';button.textContent='查看練習答案與解析';
    button.addEventListener('click',()=>openReview(module,index,button));stats.append(count,button);
    return card;
  }

  function addText(parent,tag,className,value){
    if(!value)return null;const element=document.createElement(tag);if(className)element.className=className;element.textContent=value;parent.append(element);return element;
  }
  function renderQuestion(item,module){
    const article=document.createElement('article');
    article.className='grammar-admin__question';article.id=`admin-${module.id}-question-${item.number}`;
    article.dataset.search=[item.number,item.section,item.instruction,item.context,item.prompt,item.translation,item.answer,item.completeSentence,...item.options.flatMap(option=>[option.label,option.text]),...item.steps.flatMap(step=>[step.title,step.body])].join(' ').toLocaleLowerCase();
    const header=document.createElement('header');header.className='grammar-admin__question-head';
    const number=document.createElement('span');number.className='grammar-admin__question-number';number.textContent=`第 ${item.number} 題`;
    header.append(number);addText(header,'span','grammar-admin__question-section',item.section);addText(header,'span','grammar-admin__expanded-badge','答案與解析已展開');article.append(header);
    if(item.instruction){const instruction=document.createElement('aside');instruction.className='grammar-admin__instruction';addText(instruction,'strong','', '題目要求');addText(instruction,'p','',item.instruction);article.append(instruction);}
    if(item.context){const contextBox=document.createElement('div');contextBox.className='grammar-admin__context';addText(contextBox,'span','', '語境 / Context');addText(contextBox,'p','',item.context);article.append(contextBox);}
    addText(article,'p','grammar-admin__prompt',item.prompt);
    addText(article,'p','grammar-admin__translation',item.translation);
    if(item.options.length){const options=document.createElement('ol');options.className='grammar-admin__options';for(const option of item.options){const choice=document.createElement('li');addText(choice,'strong','',`${option.label}.`);choice.append(document.createTextNode(` ${option.text}`));options.append(choice);}article.append(options);}
    const answerBox=document.createElement('section');answerBox.className='grammar-admin__reference-answer';addText(answerBox,'span','', 'REFERENCE ANSWER · 參考答案');addText(answerBox,'strong','',item.answer || '—');
    if(item.completeSentence && item.completeSentence!==item.answer)addText(answerBox,'p','',item.completeSentence);article.append(answerBox);
    const explanation=document.createElement('section');explanation.className='grammar-admin__steps';
    const explanationHead=document.createElement('div');explanationHead.className='grammar-admin__steps-head';addText(explanationHead,'span','', 'STEP-BY-STEP');addText(explanationHead,'h3','', '完整逐步解析');explanation.append(explanationHead);
    const list=document.createElement('ol');
    for(const step of item.steps){const row=document.createElement('li');addText(row,'h4','',step.title);addText(row,'p','',step.body);list.append(row);}
    explanation.append(list);article.append(explanation);return article;
  }
  function renderReview(module){
    results.replaceChildren();const fragment=document.createDocumentFragment();
    for(const item of reviewItems)fragment.append(renderQuestion(item,module));results.append(fragment);
    const jump=find('[data-answer-jump]');jump.replaceChildren();
    const prompt=document.createElement('option');prompt.value='';prompt.textContent='選擇題目';jump.append(prompt);
    for(const item of reviewItems){const option=document.createElement('option');option.value=String(item.number);option.textContent=`第 ${item.number} 題${item.section?` · ${item.section}`:''}`;jump.append(option);}
    filterReview();
  }
  function filterReview(){
    const query=find('[data-answer-search]').value.trim().toLocaleLowerCase();let visible=0;
    for(const article of results.children){const show=!query || article.dataset.search.includes(query);article.hidden=!show;if(show)visible++;}
    find('[data-answer-count]').textContent=`顯示 ${visible} / ${reviewItems.length} 題 · 每題答案與逐步解析均已展開`;
    find('[data-answer-empty]').hidden=visible!==0;
  }
  async function openReview(module,index,button){
    if(busy)return;busy=true;button.disabled=true;libraryStatus.textContent='正在驗證並載入完整答案…';
    const session=token;
    try{
      if(!await validate()||token!==session)return;
      activeModule=module;reviewItems=exerciseReviewItems(module);
      find('[data-review-eyebrow]').textContent=`ADMIN REVIEW · MODULE ${String(index+1).padStart(2,'0')}`;
      find('[data-answer-heading]').textContent=module.title;
      find('[data-review-summary]').textContent=`共 ${module.questions.length} 題 · 參考答案和每一步解析已全部直接顯示。`;
      find('[data-answer-search]').value='';content.hidden=true;review.hidden=false;reviewStatus.textContent='';renderReview(module);libraryStatus.textContent='';
      window.scrollTo({top:0,behavior:'smooth'});find('[data-answer-search]').focus({preventScroll:true});
    }catch(error){libraryStatus.textContent=error.message || '答案載入失敗，請重試。';}finally{busy=false;button.disabled=false;}
  }

  async function exportExercises(format,button){
    if(!activeModule||busy)return;busy=true;button.disabled=true;
    const popup=format==='pdf'?window.open('about:blank','_blank'):null;
    if(popup){popup.opener=null;popup.document.body.textContent='正在驗證管理員…';}
    try{
      if(!await validate()){popup?.close();return;}
      if(format==='txt'){
        const url=URL.createObjectURL(new Blob(['\uFEFF',exportText(activeModule,'exercises')],{type:'text/plain;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download=`grammar-${activeModule.id}-exercises-with-explanations.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);reviewStatus.textContent='完整練習文字檔已下載。';
      }else{
        if(!popup)throw new Error('請允許此網站開啟彈出視窗，再匯出 PDF。');
        popup.document.open();popup.document.write(exportHtml(activeModule,'exercises'));popup.document.close();reviewStatus.textContent='PDF 列印頁已開啟。';
      }
    }catch(error){popup?.close();setMessage(error.message || '匯出失敗，請重試。');}finally{busy=false;button.disabled=false;}
  }

  const modules=grammarModules(window,document);
  const learnerCards=[...root.querySelectorAll('.grammar-lesson-card')];
  const moduleList=find('[data-admin-modules]');
  for(const [index,module] of modules.entries())moduleList.append(buildModuleCard(module,index,learnerCards));

  find('[data-admin-show-password]').addEventListener('change',event=>{find('[name="password"]').type=event.target.checked?'text':'password';});
  entry.addEventListener('click',open);
  findAll('[data-admin-close]').forEach(button=>button.addEventListener('click',close));
  find('[data-review-back]').addEventListener('click',showLibrary);
  find('[data-review-top]').addEventListener('click',()=>review.scrollIntoView({block:'start',behavior:'smooth'}));
  find('[data-answer-search]').addEventListener('input',filterReview);
  find('[data-answer-jump]').addEventListener('change',event=>{if(!event.target.value||!activeModule)return;document.getElementById(`admin-${activeModule.id}-question-${event.target.value}`)?.scrollIntoView({block:'start',behavior:'smooth'});});
  findAll('[data-export-format]').forEach(button=>button.addEventListener('click',()=>exportExercises(button.dataset.exportFormat,button)));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;busy=true;
    const button=form.querySelector('button[type="submit"]');button.disabled=true;status.textContent='正在驗證管理員…';
    try{
      const data=new FormData(form);const rows=await context.rpc('grammar_admin_login',{p_name:String(data.get('username')).trim(),p_password:String(data.get('password'))});
      if(!rows?.[0]?.session_token)throw new Error('管理員用戶名稱或密碼不正確。');
      signedIn(rows[0]);form.reset();find('[name="password"]').type='password';
    }catch(error){clear(loginError(error));}finally{busy=false;button.disabled=false;}
  });
  find('[data-admin-logout]').addEventListener('click',async()=>{
    const previous=token;clear('已登出管理員。');
    try{await context.rpc('grammar_admin_logout',{p_token:previous});}catch{status.textContent='本機已登出。連線中斷，伺服器登入將於到期後失效。';}
  });
  try{token=sessionStorage.getItem(key)||'';}catch{/* Optional restoration. */}
  if(token)validate().then(row=>{if(row){signedIn(row);open();}});
  window.addEventListener('focus',()=>{if(token)validate();});
  setInterval(()=>{if(token)validate();},60000);
}
