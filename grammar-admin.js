import {grammarAdminConnection,loginError} from './grammar-admin-connection.mjs?v=20261019-admin3';
import {grammarModules, exportSections, exportText, exportHtml} from './grammar-admin-export.mjs?v=20261027-three-practice1';
const root=document.querySelector('[data-learning-portal-root]');
const context=grammarAdminConnection();
if(root && context?.rpc) {
  const key='edmund-grammar-admin-session-v1';
  let token='',busy=false;
  const panel=document.createElement('main');
  panel.className='learning-portal-shell grammar-admin';
  panel.hidden=true;
  panel.innerHTML=`<section class="panel"><div class="grammar-admin__head"><div><p class="eyebrow">GRAMMAR ADMIN</p><h1>語法系統管理員</h1></div><button type="button" class="grammar-button--ghost" data-admin-close>返回學生入口</button></div><form data-admin-login><label>管理員用戶名稱<input name="username" autocomplete="username" maxlength="160" required></label><label>密碼<input name="password" type="password" autocomplete="current-password" maxlength="200" required></label><label class="grammar-admin__answers"><input type="checkbox" data-admin-show-password> 顯示密碼</label><button class="grammar-button" type="submit">管理員登入</button></form><p data-admin-status role="status" aria-live="polite"></p><div data-admin-content hidden><p data-admin-name></p><p>選擇模組查看全部答案，或匯出完整內容。PDF 會開啟列印頁；請在列印目的地選擇「儲存為 PDF」。</p><p>每份練習匯出均包括全部題目、每題參考答案及完整逐步解析。</p><div data-admin-modules></div><section data-answer-browser hidden class="grammar-admin__browser"><h2 data-answer-heading></h2><label>搜尋題號、題目或答案<input type="search" data-answer-search placeholder="輸入關鍵字"></label><p data-answer-count role="status"></p><div data-answer-results></div><div class="grammar-admin__pagination"><button type="button" class="grammar-button--ghost" data-answer-prev>上一頁</button><span data-answer-page></span><button type="button" class="grammar-button--ghost" data-answer-next>下一頁</button></div></section><button class="grammar-button--ghost" type="button" data-admin-logout>登出管理員</button></div></section>`;
  root.after(panel);
  const find=s=>panel.querySelector(s);
  const status=find('[data-admin-status]'),form=find('form'),content=find('[data-admin-content]');
  const entry=document.createElement('button');
  entry.type='button';entry.className='learning-portal-header-button';entry.textContent='管理員入口';
  document.querySelector('.edmund-system-header__actions')?.append(entry);
  function store(value){try{if(value)sessionStorage.setItem(key,value);else sessionStorage.removeItem(key);}catch{/* In-memory session still works. */}}
  function clear(message=''){find('[data-answer-browser]').hidden=true;find('[data-answer-results]').replaceChildren();answerSections=[];token='';store('');form.hidden=false;content.hidden=true;status.textContent=message;find('[data-admin-name]').textContent='';}
  function open(){root.hidden=true;panel.hidden=false;entry.hidden=true;find('input')?.focus();}
  function close(){panel.hidden=true;root.hidden=false;entry.hidden=false;}
  async function validate(){
    if(!token)return false;
    try { const rows=await context.rpc('grammar_admin_profile',{p_token:token});
      if(!rows?.[0]?.session_token){clear('管理員登入已過期，請重新登入。');return false;}
      return rows[0];
    }catch(error){status.textContent=loginError(error);return false;}
  }
  function signedIn(row){token=row.session_token;store(token);form.hidden=true;content.hidden=false;find('[data-admin-name]').textContent=`已登入：${row.name}`;status.textContent='';}
  find('[data-admin-show-password]').addEventListener('change',event=>{find('[name=password]').type=event.target.checked?'text':'password';});
  entry.addEventListener('click',open);
  find('[data-admin-close]').addEventListener('click',close);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;busy=true;
    const button=form.querySelector('button');button.disabled=true;status.textContent='正在驗證管理員…';
    try{const data=new FormData(form);const rows=await context.rpc('grammar_admin_login',{p_name:String(data.get('username')).trim(),p_password:String(data.get('password'))});
      if(!rows?.[0]?.session_token)throw new Error('管理員用戶名稱或密碼不正確。');
      signedIn(rows[0]);form.reset();find('[name=password]').type='password';
    }catch(error){clear(loginError(error));}finally{busy=false;button.disabled=false;}
  });
  find('[data-admin-logout]').addEventListener('click',async()=>{
    const previous=token;clear('已登出管理員。');
    try{await context.rpc('grammar_admin_logout',{p_token:previous});}catch{status.textContent='本機已登出。連線中斷，伺服器登入將於到期後失效。';}
  });
  let answerSections=[],answerPage=0;
  const pageSize=10;
  function renderAnswers(){
    if(!token)return;
    const query=find('[data-answer-search]').value.trim().toLocaleLowerCase();
    const filtered=answerSections.filter(section=>(section.title+' '+section.body).toLocaleLowerCase().includes(query));
    const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
    answerPage=Math.min(answerPage,pages-1);
    const results=find('[data-answer-results]');results.replaceChildren();
    for(const section of filtered.slice(answerPage*pageSize,(answerPage+1)*pageSize)){
      const article=document.createElement('article');article.className='grammar-admin__answer';
      const heading=document.createElement('h3');heading.textContent=section.title;
      const body=document.createElement('p');body.textContent=section.body.replace('答案：________________________________\n\n','');
      article.append(heading,body);results.append(article);
    }
    find('[data-answer-count]').textContent=`共 ${filtered.length} 項${query?'符合搜尋條件':''} · 每項均顯示答案及解析`;
    find('[data-answer-page]').textContent=`${answerPage+1} / ${pages}`;
    find('[data-answer-prev]').disabled=answerPage===0;
    find('[data-answer-next]').disabled=answerPage>=pages-1;
  }
  find('[data-answer-search]').addEventListener('input',()=>{answerPage=0;renderAnswers();});
  for(const [selector,delta] of [['[data-answer-prev]',-1],['[data-answer-next]',1]])find(selector).addEventListener('click',()=>{answerPage+=delta;renderAnswers();find('[data-answer-heading]').scrollIntoView({block:'start'});});
  const modules=grammarModules(window,document);
  for(const module of modules){
    const card=document.createElement('article');card.className='grammar-admin__module';
    const title=document.createElement('h2');title.textContent=module.title;card.append(title);
    const count=document.createElement('p');count.textContent=`${module.questions.length} 題 · ${module.topics.length?`${module.topics.length} 個教學主題${module.appendix?'及附錄':''}`:'教學內容為全部題目的逐步解析'}`;card.append(count);
    for(const kind of ['exercises','curation']){
      const button=document.createElement('button');button.type='button';button.className='grammar-button';
      button.textContent=kind==='exercises'?'查看全部題目與答案':'查看教學內容與檢查題答案';
      button.dataset.answerModule=module.id;button.dataset.answerKind=kind;
      button.addEventListener('click',async()=>{
        if(busy)return;busy=true;button.disabled=true;const session=token;
        try{
          if(!await validate()||token!==session)return;
          answerSections=exportSections(module,kind);answerPage=0;
          find('[data-answer-heading]').textContent=`${module.title} · ${kind==='exercises'?'全部題目與答案':'教學內容與檢查題答案'}`;
          find('[data-answer-search]').value='';find('[data-answer-browser]').hidden=false;renderAnswers();
          find('[data-answer-browser]').scrollIntoView({block:'start'});find('[data-answer-search]').focus({preventScroll:true});
        }finally{busy=false;button.disabled=false;}
      });card.append(button);
    }
    for(const kind of ['curation','exercises'])for(const format of ['pdf','txt']){
      const button=document.createElement('button');button.type='button';button.className='grammar-button--ghost';
      button.textContent=`${kind==='curation'?'教學內容':'全部練習'} · ${format.toUpperCase()}`;
      button.dataset.exportModule=module.id;button.dataset.exportKind=kind;button.dataset.exportFormat=format;
      button.addEventListener('click',async()=>{
        if(busy)return;busy=true;button.disabled=true;
        // Open within the user gesture so Safari does not block the print window.
        const popup=format==='pdf'?window.open('about:blank','_blank'):null;
        if(popup){popup.opener=null;popup.document.body.textContent='正在驗證管理員…';}
        try{
          if(!await validate()){popup?.close();return;}

          if(format==='txt'){
            const url=URL.createObjectURL(new Blob(['\uFEFF',exportText(module,kind)],{type:'text/plain;charset=utf-8'}));
            const link=document.createElement('a');link.href=url;link.download=`grammar-${module.id}-${kind}${kind==='exercises'?'-with-explanations':''}.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
            status.textContent='文字檔已匯出。';
          }else{
            if(!popup)throw new Error('請允許此網站開啟彈出視窗，再匯出 PDF。');
            popup.document.open();popup.document.write(exportHtml(module,kind));popup.document.close();
            status.textContent='PDF 列印頁已開啟。請按「列印 / 儲存為 PDF」。';
          }
        }catch(error){popup?.close();status.textContent=error.message || '匯出失敗，請重試。';}finally{busy=false;button.disabled=false;}
      });card.append(button);
    }find('[data-admin-modules]').append(card);
  }
  try{token=sessionStorage.getItem(key)||'';}catch{/* Optional restoration. */}
  if(token)validate().then(row=>{if(row){signedIn(row);open();}});
  window.addEventListener('focus',()=>{if(token)validate();});
  setInterval(()=>{if(token)validate();},60000);
}
