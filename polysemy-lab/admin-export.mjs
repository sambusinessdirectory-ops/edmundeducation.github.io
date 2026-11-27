const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,character=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[character]);
const clean=value=>String(value??'').replace(/\r/g,'').trim();
const safeName=value=>String(value??'module').normalize('NFKD').replace(/[^a-zA-Z0-9\u3400-\u9fff-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase().slice(0,100)||'module';
const stamp=()=>new Date().toISOString().replace(/[:.]/g,'-');

function download(name,text){
 const blob=new Blob(['\uFEFF',text],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}

function labelMap(module){
 return new Map([...(module.senses||[]),...(module.mcqMeanings||[])].map(item=>[item.id,item]));
}

function labelFor(labels,id){
 const item=labels.get(id);
 return [id,item?.title||item?.zh||item?.en||item?.form].filter(Boolean).join(' — ');
}

function questionMarkdown(module,question,index){
 const labels=labelMap(module),correctId=question.correctOption||question.sense;
 const sense=labels.get(correctId)||labels.get(question.sense);
 const explanation=question.explanation||question.optionReasons?.[correctId]||sense?.note||sense?.zh||sense?.title||'No explanation recorded';
 const options=(question.options||[]).map(id=>`- ${labelFor(labels,id)}`).join('\n');
 const translation=clean(question.zh);
 return `## ${index+1}. ${clean(question.en||question.masked||question.id)}\n\n**Question ID:** ${clean(question.id)}\n\n${translation?`**Translation:** ${translation}\n\n`:''}${options?`### Options\n\n${options}\n\n`:''}**Answer:** ${labelFor(labels,correctId)}\n\n### Explanation\n\n${clean(explanation)}\n`;
}

function moduleMarkdown(module){
 const questions=Array.isArray(module.questions)?module.questions:[];
 return `---\nsystem: Polysemy\nmodule: ${clean(module.word)}\nmodule_id: ${clean(module.id)}\nmodule_number: ${module.number}\nmodule_version: ${module.version??''}\nquestion_count: ${questions.length}\nexported_at: ${new Date().toISOString()}\nsource: https://edmundeducation.com/polysemy-lab.html?module=${encodeURIComponent(module.id)}\n---\n\n# ${clean(module.word)}\n\n${questions.map((question,index)=>questionMarkdown(module,question,index)).join('\n')}`;
}

async function currentModule(id){
 const nonce=Date.now();
 if(id==='show'){
  const source=await import(`./show.mjs?admin-export=${nonce}`);
  return {...source.showModule,id:'show',number:1,questions:source.questions};
 }
 const source=await import(`./content/${encodeURIComponent(id)}.mjs?admin-export=${nonce}`);
 return source.default;
}

export async function createPolysemyAdminExport(root){
 const status=root.querySelector('[data-admin-export-status]'),list=root.querySelector('[data-admin-modules]'),search=root.querySelector('[data-admin-search]'),dialog=root.querySelector('[data-admin-preview-dialog]');
 let destroyed=false,busy=false;
 status.textContent='正在讀取目前上線的單元目錄…';
 const catalogue=await import(`./catalogue.mjs?admin-export=${Date.now()}`);
 const modules=catalogue.modules.map(module=>({id:module.id,word:module.word,number:module.number,questionCount:module.questions.length}));
 const render=()=>{
  const query=search.value.trim().toLocaleLowerCase('en'),visible=query?modules.filter(module=>`${module.word} ${module.id} ${module.number}`.toLocaleLowerCase('en').includes(query)):modules;
  list.innerHTML=visible.map(module=>`<article class="admin-module-card"><div><strong>${String(module.number).padStart(2,'0')} · ${escapeHtml(module.word)}</strong><small>${module.questionCount} questions</small></div><div><button type="button" data-admin-preview="${escapeHtml(module.id)}">預覽</button><button type="button" data-admin-download="${escapeHtml(module.id)}">匯出 .md</button></div></article>`).join('')||'<p>找不到符合的單元。</p>';
  status.textContent=`目前上線共有 ${modules.length} 個單元；顯示 ${visible.length} 個。`;
 };
 const act=async event=>{
  const button=event.target.closest('[data-admin-preview],[data-admin-download]');
  if(!button||busy||destroyed)return;
  const id=button.dataset.adminPreview||button.dataset.adminDownload;
  busy=true;button.disabled=true;status.textContent=`正在讀取 ${id} 的最新題目、答案及解釋…`;
  try{
   const module=await currentModule(id),markdown=moduleMarkdown(module);
   if(button.dataset.adminPreview){dialog.querySelector('pre').textContent=markdown;dialog.showModal();}
   else download(`polysemy_${safeName(module.id)}_${stamp()}.md`,markdown);
   status.textContent=`${module.word}：已讀取 ${module.questions.length} 題最新內容。`;
  }catch(error){status.textContent=`未能匯出 ${id}：${error.message||'請重試。'}`;}
  finally{busy=false;button.disabled=false;}
 };
 const close=event=>{if(event.target.closest('[data-admin-preview-close]'))dialog.close();};
 search.addEventListener('input',render);root.addEventListener('click',act);root.addEventListener('click',close);render();
 return {destroy(){destroyed=true;search.removeEventListener('input',render);root.removeEventListener('click',act);root.removeEventListener('click',close);dialog.close?.();list.innerHTML='';root.hidden=true;}};
}
