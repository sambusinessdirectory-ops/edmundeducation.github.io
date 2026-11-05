import {explanation,animateIn,expandDetails} from './literary-device-reading.mjs';
export function createGuide(devices,root){
  const groups=[...new Set(devices.map(d=>d.group))];
  let group=groups[0],query='';
  const open=new Set(),recent=[];
  function element(tag,cls,text){
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function visit(index){
    const old=recent.indexOf(index);
    if(old>=0)recent.splice(old,1);
    recent.unshift(index);recent.splice(3);
    recentList();
  }
  function recentList(){
    const list=root.querySelector('.recent-list');
    list.replaceChildren();
    if(!recent.length){list.append(element('p','quiet','展開一則手法，即可在這裡快速重讀。'));return;}
    for(const index of recent){
      const d=devices[index],btn=element('button','recent-item',d.en+' · '+d.zh);
      btn.onclick=()=>{group=d.group;query='';open.add(index);render();
        const target=root.querySelector('#device-'+index+' summary');target.focus();target.scrollIntoView({block:'nearest'});};
      list.append(btn);
    }
  }
  function change(next){
    group=next;query='';render();animateIn(root.querySelector('.guide-page'));root.querySelector('.page-heading').focus({preventScroll:true});
  }
  function entries(){
    const q=query.trim().toLowerCase(),list=root.querySelector('.entries');
    const rows=devices.map((d,i)=>[d,i]).filter(([d])=>q?(d.en+' '+d.zh+' '+d.group+' '+d.body).toLowerCase().includes(q):d.group===group);
    root.querySelector('.page-heading').textContent=q?'搜尋結果':group;
    root.querySelector('.found').textContent=rows.length+' 項';
    root.querySelector('.page-turn').hidden=!!q;
    root.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(!q&&b.dataset.group===group)));
    list.replaceChildren();
    if(!rows.length)list.append(element('p','no-match','找不到相符的手法。試試英文名稱、中文名稱或例句關鍵詞。'));
    for(const [d,i] of rows){
      const row=element('details','entry');row.id='device-'+i;row.open=open.has(i);
      const title=element('summary');
      title.append(element('span','serial',String(i+1).padStart(2,'0')),element('b','device-en',d.en),element('span','device-zh',d.zh));
      row.append(title);
      const body=element('div','entry-body');
      body.innerHTML=explanation(d.body);
      row.append(body);list.append(row);expandDetails(row);
      row.addEventListener('toggle',()=>{
        if(!row.isConnected)return;
        if(row.open){if(!open.has(i)){open.add(i);visit(i);}}
        else open.delete(i);
      });
    }
  }
  function render(){
    root.innerHTML='<div class="guide-grid page-enter"><aside class="index-panel"><small>CHAPTER INDEX</small><h2>篇章目錄</h2><div class="chapters"></div><div class="recent"><small>READING HISTORY</small><h3>最近查閱</h3><div class="recent-list"></div></div></aside><section class="guide-page"><label class="search"><span>查找手法</span><input type="search" placeholder="名稱、關鍵詞或例句" autocomplete="off"></label><div class="section-strip"><h2 class="page-heading" tabindex="-1"></h2><span class="found" role="status"></span></div><div class="entries"></div><div class="page-turn"></div></section></div>';
    const search=root.querySelector('input');search.value=query;
    search.oninput=()=>{query=search.value;entries();};
    const buttons=root.querySelector('.chapters');
    groups.forEach((g,i)=>{
      const b=element('button','chapter');b.dataset.group=g;
      b.append(element('span','serial',String(i+1).padStart(2,'0')),element('span','',g));b.onclick=()=>change(g);buttons.append(b);
    });
    const index=groups.indexOf(group),turn=root.querySelector('.page-turn');
    for(const [text,delta] of [['‹ 上一章',-1],['下一章 ›',1]]){
      const b=element('button','',text);b.disabled=!groups[index+delta];b.onclick=()=>change(groups[index+delta]);turn.append(b);
      if(delta===-1)turn.append(element('small','',(index+1)+' / '+groups.length));
    }
    entries();recentList();
  }
  return render;
}
