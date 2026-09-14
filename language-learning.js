/* Language editions reuse the full study interfaces, with independent stores. */
(function(){
  const requested=new URLSearchParams(location.search).get('language');
  const language=['it','fr','de','es','ja','ko'].includes(requested)?requested:'en';
  const label={en:'Original',it:'Italian',fr:'French',de:'German',es:'Spanish',ja:'Japanese',ko:'Korean'}[language];
  const categories=[['food-cooking','Food and Cooking'],['culture','Culture'],['history','History'],['news','News'],['conversations','Conversations'],['travelling','Travelling']];
  const sharedKeys=new Set(['edmundFlashcardSession','edmundFlashcardAdminPassword','edmundWritingSession','edmundWritingAdminPassword']);
  const localKey=key=>language==='en'||sharedKeys.has(key)?key:`language:${language}:${key}`;
  const storage={getItem:key=>localStorage.getItem(localKey(key)),setItem:(key,value)=>localStorage.setItem(localKey(key),value),removeItem:key=>localStorage.removeItem(localKey(key)),key:index=>localStorage.key(index),get length(){return localStorage.length;}};
  const recordOperation= /^(flashcard|writing)_(student|admin)_(?:get_(?:student_)?state(?:_v2)?|upsert_(?:student_)?state(?:_v2)?|append_(?:student_)?attempt|list_(?:student_)?attempts|delete_(?:student_)?attempts_by_exercise)$/;
  window.EdmundLanguage={language,label,categories,active:language!=='en',storage:language==='en'?localStorage:storage,localKey,
    async rpc(client,name,args){
      if(language!=='en'&&recordOperation.test(name))return client.rpc('language_learning_rpc',{p_language:language,p_system:name.startsWith('flashcard_')?'flashcard':'writing',p_operation:name,p_args:args});
      // Account deletion from a language edition would also remove original
      // accounts. Keep that global account operation in the original system.
      if(language!=='en'&&/^(flashcard|writing)_admin_delete_student(?:_with_state)?$/.test(name))return {data:null,error:{message:'共用帳戶請在原系統管理；本語言的進度可在此重設。'}};
      if(language==='en')return client.rpc(name,args);
      const system=name.startsWith('flashcard_')?'flashcard':'writing';
      const access=(a,write=false)=>client.rpc('language_learning_access',{p_language:language,p_system:system,p_args:a,p_write:write});
      if(/_admin_set_student_access$/.test(name)){
        const result=await access(args,true);if(result.error)return result;
        const listed=await client.rpc(system+'_admin_list_students',{p_admin_name:args.p_admin_name,p_admin_password:args.p_admin_password});
        if(listed.error)return listed;
        return {data:(listed.data||[]).filter(row=>row.name===args.p_student_name).map(row=>({...row,access:result.data})),error:null};
      }
      if(/_admin_upsert_student$/.test(name)){
        const original=await client.rpc(system+'_admin_list_students',{p_admin_name:args.p_admin_name,p_admin_password:args.p_admin_password});
        if(original.error)return original;
        const existing=original.data?.find(s=>s.name.toLowerCase()===args.p_student_name.trim().toLowerCase());
        const {p_access,...accountArgs}=args;
        const result=await client.rpc(name,existing?{...accountArgs,p_access:existing.access}:accountArgs);
        if(result.error)return result;
        const saved=await access(args,true);return saved.error?saved:result;
      }
      const result=await client.rpc(name,args);
      if(!result.error&&Array.isArray(result.data)&&/_(?:admin_list_students|student_login|student_session_profile|student_session_from_flashcard)$/.test(name)){
        for(const row of result.data){
          const a=name.includes('_admin_')?{...args,p_student_name:row.name}:{p_token:row.session_token||args.p_token};
          const scope=await access(a);if(scope.error)return scope;row.access=scope.data||{};
        }
      }
      return result;
    }
  };
  if(language!=='en')document.documentElement.dataset.learningLanguage=language;
  document.addEventListener('DOMContentLoaded',()=>{
    if(!/\/(flashcards|writing-practice)\.html$/.test(location.pathname))return;
    const kind=location.pathname.includes('flashcards')?'Flashcard':'Practice System';
    if(language!=='en'){
      document.title=`${label} ${kind}｜EdmundEducation`;
      document.querySelectorAll('.edmund-system-switcher__copy small').forEach(el=>el.textContent=`${label} ${kind}`);
    }

  });
})();
