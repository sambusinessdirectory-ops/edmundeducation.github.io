"""Build static Traditional Chinese and bilingual Churchill pages from the English originals.

Requires Beautiful Soup 4 and opencc-python-reimplemented at build time. The committed
zh-hant.json is the translation catalogue; the public pages need no runtime API.
"""
from pathlib import Path
import json,re,sys
from bs4 import BeautifulSoup, NavigableString, Doctype
from opencc import OpenCC

ROOT=Path(__file__).resolve().parents[1]
CATALOG=json.loads((ROOT/'i18n'/'zh-hant.json').read_text())
OVERRIDES=json.loads((ROOT/'i18n'/'editorial-overrides.json').read_text())
CC=OpenCC('s2t')

def norm(text):return re.sub(r'\s+',' ',text.strip())

def translate(text):
 key=norm(text)
 if key in OVERRIDES:value=OVERRIDES[key]
 elif key in CATALOG:value=CC.convert(CATALOG[key])
 else:return None
 for old,new in [
  ('輔政署','殖民地部'),('殖民辦公室','殖民地部'),('殖民地辦公室','殖民地部'),
  ('殖民部','殖民地部'),('金鐘','海軍部'),('總理','首相'),('温斯頓','溫斯頓'),
  ('投資組合','職務範圍'),
  ('內政辦公室','內政部'),('國土安全部','內政部'),
  ('海軍部第一大臣','海軍大臣'),('第一海軍大臣','海軍大臣'),
  ('第一勳爵','海軍大臣'),('英超','首相任期'),('預約','任職'),
  ('帖子','貼文'),('丘吉爾','邱吉爾'),('爲','為'),('帳戶','記述'),
  ('希特勒','希特拉'),('伊登','艾登'),('肯亞','肯尼亞'),
  ('義大利','意大利'),('德勒斯登','德累斯頓'),('饑','飢'),
  ('摩薩臺','摩薩台'),('勞埃德‧喬治','勞合·喬治'),('史賓塞','斯賓塞'),
  ('公衆','公眾'),('賬戶','記述'),('來源暫存器','資料來源清單'),
  ('選區分類帳','選區年表'),
 ]:value=value.replace(old,new)
 if 'appointment' in key.lower():value=value.replace('約會','任職')
 if 'campaign' in key.lower() and '競選' in value and not re.search(r'\b(election|electoral|party|vot|political campaign)\b',key,re.I):
  value=value.replace('競選','戰役')
 if 'yr' in key:value=re.sub(r'(\d+)\s*歲',r'\1 年',value)
 return value

def eligible(node):
 if isinstance(node,Doctype):return False
 parent=node.parent
 if parent.name in ('script','style','svg','noscript'):return False
 if parent.find_parent(class_='reference') or 'reference' in parent.get('class',[]):return False
 if parent.find_parent(class_='language-bar') or parent.has_attr('data-language-target'):return False
 if parent.has_attr('class') and any(c in parent['class'] for c in ('brand-mark','mark')):return False
 key=norm(str(node))
 return bool(re.search('[A-Za-z]',key)) and not bool(re.fullmatch(r'\[R\d+\]|R\d+|[A-Z]{1,3}|[a-z0-9./-]+\.[a-z]{2,4}.*',key))

def build(source, mode):
 soup=BeautifulSoup(source.read_text(),'html.parser')
 soup.html['lang']='zh-Hant' if mode=='zh' else 'en'
 soup.html['data-language-mode']=mode
 if mode=='bi':soup.body['class']=soup.body.get('class',[])+['bilingual-mode']
 active=soup.select_one(f'.language-bar [data-language-target="{mode}"]')
 for link in soup.select('.language-bar [data-language-target]'):link.attrs.pop('aria-current',None)
 active['aria-current']='page'
 missing=set()
 for node in list(soup.find_all(string=True)):
  if not eligible(node):continue
  key=norm(str(node));zh=translate(key)
  if zh is None:
   missing.add(key);continue
  raw=str(node)
  leading=re.match(r'^\s*',raw).group();trailing=re.search(r'\s*$',raw).group()
  if mode=='zh':node.replace_with(NavigableString(leading+zh+trailing))
  else:
   en_span=soup.new_tag('span',attrs={'class':'lang-en','lang':'en'});en_span.string=raw
   zh_span=soup.new_tag('span',attrs={'class':'lang-zh','lang':'zh-Hant'});zh_span.string=zh
   node.replace_with(en_span);en_span.insert_after(zh_span)
 for el in soup.find_all(True):
  if el.find_parent(class_='language-bar') or 'language-bar' in el.get('class',[]):continue
  for attr in ('title','alt','aria-label','placeholder','content'):
   if attr not in el.attrs or (attr=='content' and el.name!='meta'):continue
   zh=translate(el[attr])
   if zh and mode=='zh':el[attr]=zh
   elif zh and mode=='bi' and attr in ('aria-label','placeholder','title'):el[attr]=el[attr]+' / '+zh
  href=el.get('href','')
  if source.parent==ROOT:
   if href.startswith('churchill-research/'):
    suffix=href[len('churchill-research/'):]
    el['href']='churchill-research/index-'+mode+'.html'+suffix
  elif href.startswith('../') and not href.startswith('../#'):
   el['href']=href.replace('../','../index-'+mode+'.html',1)
  elif href=='../':el['href']='../index-'+mode+'.html'
 if source.parent!=ROOT:
  for el in soup.select('a.download'):
   el.append(NavigableString(' · 英文原稿' if mode=='zh' else ' / English original · 英文原稿'))
 if mode=='bi':
  style=soup.new_tag('style')
  style.string='''\n.bilingual-mode .lang-zh{color:#28577c;font-size:.93em}.bilingual-mode .lang-zh::before{content:" / ";color:#8194a4}.bilingual-mode p>.lang-zh,.bilingual-mode h1>.lang-zh,.bilingual-mode h2>.lang-zh,.bilingual-mode h3>.lang-zh,.bilingual-mode h4>.lang-zh,.bilingual-mode td>.lang-zh,.bilingual-mode th>.lang-zh,.bilingual-mode summary>.lang-zh,.bilingual-mode .org>.lang-zh,.bilingual-mode .headline>.lang-zh,.bilingual-mode .entry-title>.lang-zh,.bilingual-mode .mini-stat>span>.lang-zh,.bilingual-mode .mini-stat>b>.lang-zh{display:block;margin-top:3px;line-height:1.45}.bilingual-mode p>.lang-zh::before,.bilingual-mode h1>.lang-zh::before,.bilingual-mode h2>.lang-zh::before,.bilingual-mode h3>.lang-zh::before,.bilingual-mode h4>.lang-zh::before,.bilingual-mode td>.lang-zh::before,.bilingual-mode th>.lang-zh::before,.bilingual-mode summary>.lang-zh::before,.bilingual-mode .org>.lang-zh::before,.bilingual-mode .headline>.lang-zh::before,.bilingual-mode .entry-title>.lang-zh::before,.bilingual-mode .mini-stat>span>.lang-zh::before,.bilingual-mode .mini-stat>b>.lang-zh::before{content:none}.bilingual-mode .role-prose .lang-zh,.bilingual-mode .prose p>.lang-zh{font-size:.97em}'''
  soup.head.append(style)
 title=soup.title
 if title:
  original=norm(source.read_text().split('<title>',1)[1].split('</title>',1)[0])
  title.string=(translate(original) or original) if mode=='zh' else original+' · 中英雙語'
 if source.parent==ROOT:
  for item in soup.select('#experienceEntries .experience-item'):
   item['data-search']=item.get('data-search','')+' '+item.get_text(' ',strip=True).lower()
  # The main behaviour script is the first script; the last preserves language-switch hashes.
  scripts=soup.find_all('script')
  if scripts:
   script=scripts[0]
   code=script.string or ''
   if mode=='zh':
    changes={
     "'What actually happened? +'":"'實際發生了甚麼？＋'",
     "'Hide history note −'":"'收起史實說明 −'",
     "'Enter a word to search this profile.'":"'請輸入關鍵字搜尋此人物檔案。'",
     "'Showing the first matching section.'":"'已顯示第一個相符章節。'",
     "'No matching section found.'":"'找不到相符章節。'",
     "'★ Saved profile'":"'★ 已儲存人物檔案'",
     "'☆ Save profile'":"'☆ 儲存人物檔案'",
     "'Showing '+visible+' of 89 entries'":"'顯示 89 筆中的 '+visible+' 筆'",
     "'Showing all 89 entries'":"'顯示全部 89 筆條目'",
    }
   else:
    changes={
     "'What actually happened? +'":"'What actually happened? / 實際發生了甚麼？＋'",
     "'Hide history note −'":"'Hide history note / 收起史實說明 −'",
     "'Enter a word to search this profile.'":"'Enter a word / 請輸入關鍵字。'",
     "'Showing the first matching section.'":"'Showing the first matching section / 已顯示第一個相符章節。'",
     "'No matching section found.'":"'No matching section found / 找不到相符章節。'",
     "'★ Saved profile'":"'★ Saved profile / 已儲存'",
     "'☆ Save profile'":"'☆ Save profile / 儲存檔案'",
     "'Showing '+visible+' of 89 entries'":"'Showing '+visible+' of 89 entries / 顯示 89 筆中的 '+visible+' 筆'",
     "'Showing all 89 entries'":"'Showing all 89 entries / 顯示全部 89 筆條目'",
    }
   for a,b in changes.items():
    assert a in code,a
    code=code.replace(a,b)
   script.string=code
 else:
  references_section=soup.select_one('#section-appendix-d-full-reference-register .section-heading')
  if references_section:
   note=soup.new_tag('p',attrs={'class':'reference-language-note'})
   note.string=('參考資料保留原始英文題名及註釋，方便核對來源。' if mode=='zh' else 'Reference titles and annotations remain in their original English for source checking. / 參考資料保留原始英文題名及註釋，方便核對來源。')
   references_section.insert_after(note)
  scripts=soup.find_all('script')
  if scripts:
   script=scripts[0];code=script.string or ''
   if mode=='zh':
    code=code.replace("'Showing '+ec+' career entries and '+rc+' references.'","'顯示 '+ec+' 筆生涯條目及 '+rc+' 項參考資料。'")
    code=code.replace("'Open an entry to read its full account and linked references.'","'展開條目，閱讀完整內容及相關參考資料。'")
   else:
    code=code.replace("'Showing '+ec+' career entries and '+rc+' references.'","'Showing '+ec+' career entries and '+rc+' references / 顯示 '+ec+' 筆生涯條目及 '+rc+' 項參考資料。'")
    code=code.replace("'Open an entry to read its full account and linked references.'","'Open an entry to read its full account and linked references / 展開條目以閱讀完整內容及參考資料。'")
   script.string=code
 # Do not ship silently untranslated interface copy.
 if missing:
  raise ValueError(f'{source}: {len(missing)} missing translations; examples: {list(missing)[:8]}')
 out=source.with_name('index-'+mode+'.html')
 out.write_text(str(soup))
 print('built',out,'bytes',out.stat().st_size)

if __name__=='__main__':
 for src in (ROOT/'index.html',ROOT/'churchill-research'/'index.html'):
  for mode in ('zh','bi'):build(src,mode)
