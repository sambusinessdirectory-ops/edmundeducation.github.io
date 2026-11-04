const drafts = new Map();
export function clearListening(){drafts.clear();}
const normalize = s => s.toLowerCase().trim().replace(/[,$.!?]/g,'').replace(/[-‐‑]/g,' ').replace(/\s+/g,' ');
const alternatives = {
  'two':['2'], '2':['two'], '1000000':['one million','1 million','a million'],
  'a full body scan':['full body scan'], 'two weeks':['2 weeks'],
  '250 miles':['250'], 'a tank top and shorts':['tank top and shorts']
};
const matches = (value,key) => [key,...(alternatives[normalize(key)]||[])].some(s=>normalize(value)===normalize(s));

export function renderListening(box,items,index,move,replay){
  const q=items[index], multi=q.id==='L04';
  if(!drafts.has(q.id))drafts.set(q.id,{values:[],graded:false});
  const state=drafts.get(q.id);
  const add=(tag,text,parent=box)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
  const action=(text,fn,parent=box)=>{const b=add('button',text,parent);b.type='button';b.onclick=fn;return b;};
  box.replaceChildren();
  const select=add('select','');select.setAttribute('aria-label','選擇聽力題組');
  items.forEach((row,i)=>select.add(new Option(row.id+' · '+row.title.split('｜').at(-1),i)));
  select.value=index;select.onchange=()=>move(Number(select.value));
  add('h3',q.title);const stamp=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
  action('▶ 重聽片段　'+stamp(q.start)+'–'+stamp(q.end),()=>replay(q.start,q.end));
  add('p',q.instruction);
  const form=add('form','');form.className='listen-form';
  let fieldCount=0;
  function field(parent){
    const i=fieldCount++,options=q.id==='L11'?['F','P','R']:q.id==='L12'?['1','2','3','4','5']:q.id==='L13'?['1','2','3','4']:null;
    const el=document.createElement(options?'select':'input');
    if(options){el.add(new Option('—',''));for(const opt of options)el.add(new Option(opt,opt));}
    el.setAttribute('aria-label','答案 '+(i+1));el.required=true;el.disabled=state.graded;el.value=state.values[i]||'';
    el.oninput=()=>{state.values[i]=el.value;};parent.append(el);
  }
  function inline(parent,text){
    const parts=text.split(/(_{3,}|\[  \])/);
    for(const p of parts){if(/^_{3,}$|^\[  \]$/.test(p))field(parent);else parent.append(p);}
  }
  let pre=null,table=null;
  for(const raw of q.prompt.split('\n')){
    const s=raw.trim();if(s.startsWith('```')){pre=pre?null:add('pre','',form);continue;}
    if(pre){inline(pre,raw+'\n');continue;}
    if(!s)continue;
    if(s.startsWith('|')){
      if(/^\|[-| ]+\|$/.test(s))continue;
      const first=!table;if(first)table=add('table','',form);const tr=table.insertRow();
      for(const cell of s.slice(1,-1).split('|'))inline(add(first?'th':'td','',tr),cell.trim());continue;
    }
    inline(add('p','',form),s.replace(/^- |> /,''));
  }
  q.choices.forEach((choice,i)=>{
    const letter='ABCDE'[i],label=add('label','',form),el=document.createElement('input');
    el.type=multi?'checkbox':'radio';el.name=q.id;el.value=letter;el.checked=state.values.includes(letter);el.disabled=state.graded;
    el.onchange=()=>{state.values=[...form.querySelectorAll('input:checked')].map(node=>node.value);};
    label.append(el,' '+letter+'. '+choice);
  });
  if(!state.graded){
    const submit=add('button','核對答案',form);submit.className='primary';
    const status=add('p','',form);status.setAttribute('role','status');
    form.onsubmit=e=>{e.preventDefault();
      if(state.values.filter(v=>v?.trim()).length!==q.answers.length){status.textContent=multi?'請選出三項。':'請完成每一項。';return;}
      state.graded=true;renderListening(box,items,index,move,replay);
    };
  }else{
    const result=add('section','',form);result.setAttribute('role','status');
    const correct=q.answers.filter((key,i)=>matches(state.values[i]||'',key)).length;
    add('strong',correct===q.answers.length?'全部答對！':'再聽一次，核對答案。',result);
    add('p','參考答案　'+q.key.join(' → '),result);
    if(q.id==='L12')add('p','A 至 E 各事件的名次　'+q.answers.join('、'),result);
    add('p','聆聽依據　'+q.evidence,result);
    action('重做本題',()=>{drafts.delete(q.id);renderListening(box,items,index,move,replay);},result);
  }
  action('上一題',()=>move(index-1)).disabled=index===0;
  action('下一題',()=>move(index+1)).disabled=index===items.length-1;
}
