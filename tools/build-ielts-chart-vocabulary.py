"""Build the scenario vocabulary bank from the user's 110-page teaching book."""
import json,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'tools/content-sources/ielts-chart-vocabulary/book-extraction.json').read_text())
categories=dict([
 ('foundations','基本概念與分析'),('charts','圖表種類與單位'),('intro','引言與描述圖表'),('paraphrase','改寫與主題名詞'),('overview','Overview 整體概述'),('body','段落分組與連接'),('up','上升與高峰'),('down','下降與低點'),('steady','穩定與波動'),('degree','幅度與速度'),('structures','動詞與名詞句式'),('prepositions','介詞與數值變化'),('proportions','比例與分數'),('approx','約數'),('compare','比較、排名與倍數'),('time','時間、時態與預測'),('process','流程與被動語態'),('maps','地圖變化'),('location','位置與方向'),('mixed','混合圖表'),('mistakes','常見用字錯誤')])
entries=[]
def clean(s):return re.sub(r'\s+',' ',str(s or '')).strip().replace('。','.')
def add(cat,english,note,page,kind='vocabulary',example=''):
 english=re.sub(r'^\d+\.\s*','',clean(english));note=clean(note);example=clean(example)
 if not english or not re.search('[A-Za-z]',english):return
 assert cat in categories
 existing=next((e for e in entries if e['category']==cat and e['english'].casefold()==english.casefold() and e['kind']==kind),None)
 if existing:
  if page not in existing['pages']:existing['pages'].append(page)
  if example and example not in existing['examples']:existing['examples'].append(example)
  if note and note not in existing['notes']:existing['notes'].append(note)
 else:entries.append({'id':f'v{len(entries)+1:04}','category':cat,'english':english,'notes':[note] if note else [],'pages':[page],'kind':kind,'examples':[example] if example else []})
def rows(page,index=0):return source[page-1]['tables'][index][1:]
def alternatives(text):return [clean(v) for v in text.split(' / ')]
def listtable(page,cat,index=0,kind='vocabulary'):
 for row in rows(page,index):
  for term in alternatives(row[1]):add(cat,term,row[0],page,kind)
def manual(cat,page,items,kind='vocabulary'):
 for line in items.strip().split('\n'):
  if not line.strip():continue
  term,note=line.split('|',1)
  for t in term.split(' / '):add(cat,t,note,page,kind)
# Complete explicit language tables.
listtable(61,'up');listtable(62,'down');listtable(62,'steady',1)
listtable(64,'degree');listtable(65,'degree')
for page in [64,65]:
 for row in rows(page,1):add('structures',row[0],'原書例句：形容詞修飾名詞；副詞修飾動詞。',page,'example')
for row in rows(63):
 add('structures',row[0],'動詞句式；可改為：'+row[1],63,'example')
 add('structures',row[1],'名詞句式；對應：'+row[0],63,'example')
manual('structures',63,'a significant rise|顯著上升；名詞片語\na slight fall|輕微下降；名詞片語')
for row in rows(66):
 for term in alternatives(row[1]):add('structures',term,'正確形式；原書錯例：'+row[0],66,'correction')
for structure,example,meaning in rows(67):add('prepositions',structure,meaning,67,'phrase',example)
add('prepositions','percentage points','百分點：17% → 67% 是增加 50 個百分點，不是增加原值的 50%。',68,'vocabulary','increased by 50 percentage points')
for term,example in rows(69):add('proportions',term,'佔某比例；保留原文主語、數值及時態配合。',69,'phrase',example)
for percentage,fraction in rows(70):add('proportions',fraction,percentage+('（近似值）' if percentage in ['33%','66%'] else ''),70)
listtable(71,'approx')
for structure,meaning,example in rows(72):
 expanded={'more / fewer / less than':['more than','fewer than','less than'],'higher / lower proportion':['higher proportion','lower proportion'],'most / least popular':['most popular','least popular']}.get(structure,alternatives(structure))
 for term in expanded:add('compare',term,meaning,72,'phrase',example)
for meaning,terms in rows(73):
 for term in alternatives(terms):add('time',term,meaning,73,'guidance')
for row in rows(74):add('time',row[0],'未來預測；依圖表所示時間使用。',74,'phrase')
for context,terms in rows(76):
 for term in alternatives(terms):add('time',term,'地圖時間情境：'+context,76,'guidance')
for english,note in [('limestone is crushed','石灰石被壓碎'),('the mixture is heated','混合物被加熱'),('cement is packed into bags','水泥被裝袋')]:add('process',english,note,77,'example')
for note,english in rows(78):add('maps',english,note,78,'example')
for note,terms in rows(94):
 terms=alternatives(terms)
 for i,term in enumerate(terms):
  if i and terms[0].startswith('be ') and not term.startswith('be '):term='be '+term
  add('maps',term,note,94,'phrase')
listtable(95,'location')
# Introduction, paraphrase and opening structures.
for original,terms in rows(36):
 add('intro',original,'引言動詞；可替換為：'+terms,36,'phrase')
 for term in alternatives(terms):add('intro',term,'引言用法；原詞：'+original,36,'phrase')
for original,terms in rows(37):
 add('paraphrase',original,'依語境可改寫為：'+terms,37)
 for term in alternatives(terms):add('paraphrase',term,'對應原詞：'+original+'；按語境選用，不可機械替換。',37)
manual('intro',35,'''The line graph / The bar chart / The table / The maps / The diagrams|引言中的圖表主語
illustrates / shows / displays / presents / provides information about|接圖表主題
household spending|家庭開支
energy consumption|能源消耗
population changes|人口變化
in the UK|地點
from 2000 to 2020|時間範圍
in three countries|比較範圍''','phrase')
manual('paraphrase',38,'''sodium|鈉；技術名稱不需強行改寫
added sugar|添加糖；技術名稱不需強行改寫
hydropower|水力發電；技術名稱不需強行改寫''')
manual('time',40,'''from…to… / between…and… / over a period of…|交代圖表時間範圍
forecasts / projections|預測資料''','phrase')
manual('maps',40,'how the place changed / how the place will change|描述地點過去或未來的變化','phrase')
manual('process',40,'how something is made / how something is produced / how something is recycled / how something is developed|流程圖引言','phrase')
# All overview model sentences and body openers.
for row in rows(43):add('overview',row[0],'概述主要特徵；依實際圖表替換主語。',43,'example')
for page,cat in [(45,'overview'),(46,'overview'),(47,'process'),(48,'maps'),(51,'body'),(80,'overview'),(88,'overview'),(93,'maps')]:
 for note,english in rows(page):
  if not re.search('[\u3400-\u9fff]',english):
   variants={'X increased / showed an upward trend':['X increased','X showed an upward trend'],'Y declined / followed a downward trend':['Y declined','Y followed a downward trend'],'It is a linear / cyclical process。':['It is a linear process.','It is a cyclical process.']}.get(english,[english])
   for v in variants:add(cat,v,note,page,'example')
manual('overview',44,'''Overall|總覽開首；概括主要特徵
while / although / both|對比或共同特徵''','phrase')
manual('body',12,'''this / these|指代已提及的資料
the former|兩者中的前者
the latter|兩者中的後者''','phrase')
manual('body',13,'''however|轉折；只在需要時使用，注意標點
furthermore / moreover|補充；不可每句機械加入''','phrase')
manual('body',104,'while / whereas|真正的對比；不要以連接詞取代合理分組','phrase')
manual('body',51,'Regarding / In terms of / By contrast|引入某組資料或對比','phrase')
# Terminology and analysis vocabulary across the whole book.
for page,cat in [(18,'charts'),(55,'foundations'),(56,'compare'),(57,'charts'),(58,'maps'),(59,'process'),(79,'charts'),(81,'charts'),(84,'charts')]:
 for row in rows(page):
  if re.search('[A-Za-z]',row[0]) and not re.search('[\u3400-\u9fff]',row[0]):
   for term in alternatives(row[0]):add(cat,term,'；'.join(clean(c) for c in row[1:] if c),page)
for page,cat in [(90,'process'),(92,'maps')]:
 for row in rows(page):
  for term in alternatives(re.sub(r'^\d+\.\s*','',row[0])):add(cat,term,'分析圖表時需要找出的特徵。',page)
manual('foundations',4,'''describe visual information|描述圖中提供的內容
summarize main features|概括最重要特徵
select information|選取資料，不是全部寫出
report accurately|準確報告數據、類別及時態
compare where relevant|在適當地方比較
stay objective|保持客觀''','phrase')
manual('foundations',5,'''summarize|概括
select|選取
compare|比較''')
manual('foundations',9,'''Task Achievement|完成題目要求
Coherence and Cohesion|連貫與銜接
Lexical Resource|詞彙資源
Grammatical Range and Accuracy|文法範圍與準確度
paragraphing|分段
logical flow|邏輯流暢
linking|銜接
information organization|資料組織
vocabulary range|詞彙範圍
accuracy|準確度
paraphrase|改寫
tense|時態
sentence structures|句式
subject-verb agreement|主謂一致
complex sentences|複合句''')
manual('foundations',7,'''report / short report / formal report|Task 1 的報告文體
visual information|圖像資料
overview|整體概述
big picture|整體面貌
main features / key features|主要特徵
details|細節
summary|摘要''')
manual('charts',14,'''chart / graph|圖表
table|表格
diagram|示意圖
map|地圖
process|流程
percentage|百分比
proportion|比例
share|份額
figure|數值
amount|數量；常接不可數名詞
number|數目；常接可數名詞
stage / step|階段或步驟''')
manual('process',14,'''be mixed|被混合
be heated|被加熱
be packaged|被包裝''','phrase')
manual('prepositions',14,'''increase from X to Y|由起點 X 上升至終點 Y
rise by X|上升幅度為 X
account for X%|佔 X%''','phrase')
manual('compare',14,'higher than / lower than|高於或低於','phrase')
manual('charts',19,'''dynamic data / dynamic chart|有時間變化的資料或圖表
static data / static chart|單一時間點或沒有時間變化的資料或圖表
start / end|起點或終點''')
manual('up',20,'''which categories increased|找上升類別
one line overtook another|一條線超越另一條
rising group|上升組''','phrase')
manual('down',20,'which categories fell|找下降類別\nfalling group|下降組','phrase')
manual('steady',20,'which fluctuated|找波動類別\nwhich remained stable|找穩定類別','phrase')
manual('compare',21,'''highest / lowest|最高或最低
largest share|最大份額
smallest proportion|最小比例
similarities / differences|相似與差異''')
manual('compare',22,'''largest category / smallest category|最大或最小類別
greatest difference|最大差距
similar figures|相近數值
high group / low group|高值組或低值組
category that stands out|突出的例外類別''','phrase')
manual('charts',31,'''title|標題
axes / axis|座標軸
labels|標籤
units|單位
percent|百分比
million|百萬
thousand|千
money|金錢
age|年齡
tonnes|公噸
time periods|時間段''')
manual('body',24,'''Introduction|引言
Overview|整體概述
Body paragraph 1 / Body paragraph 2|兩段主體
main groupings|主要分組''')
manual('foundations',28,'''Read|讀題
Identify|辨認題型
Analyze|分析
Group|分組
Check|檢查''')
manual('maps',32,'''before / after|變化前後
current / proposed|現況或建議方案
added / removed / replaced|新增、移除、取代
expanded / reduced|擴大或縮小
stayed the same|保持原貌
additions / removals|新增或移除事項''')
manual('process',33,'''number of stages|階段數
function of each stage|每個階段的功能
end result|最終結果
two parts|兩部分''')
manual('process',47,'''raw materials|原料
finished product|製成品
multi-stage linear process|多階段線性流程
simpler mixing process|較簡單的混合流程''')
manual('maps',48,'''residential facilities|住宅設施
commercial and residential areas|商業及住宅地區
major changes|主要變化
rural area|鄉郊地區
urbanized|城市化的''')
manual('body',52,'''baseline|起點基準
final result|最終結果
data points|數據點
selected data|經選取的數據''')
manual('proportions',71,'''exact percentages|準確百分比
fractions|分數
approximations|約數
large proportion / small proportion|較大或較小比例''')
manual('steady',14,'fluctuate|波動')
manual('time',73,'''past|過去
present|現在
future|未來
prediction language|預測用語''')
manual('process',75,'''present simple|一般流程通常使用現在簡單式
passive voice|被動語態；重點在步驟而非操作者''','guidance')
manual('maps',76,'future passive|未來被動語態；用於未來地圖方案','guidance')
manual('process',77,'''crush|壓碎
heat|加熱
pack|包裝
limestone|石灰石
mixture|混合物
cement|水泥''')
manual('charts',87,'''proportions / percentages|比例或百分比
slice|圓餅圖的份額
categories|類別
prediction|預測''')
manual('process',89,'''stages|階段
linear|線性的
cyclical|循環的
final product|最終產品''')
manual('process',91,'''manufacturing process|製造流程
life cycle|生命週期
active voice|主動語態
cycle|循環''')
manual('maps',92,'''spatial changes|空間變化
compass|指南針或方位標記
roads|道路
buildings|建築物
land use|土地用途''')
manual('maps',93,'''rural / urban|鄉郊或城市
open land / open spaces|空地
facilities|設施
redeveloped|重新發展的
tourism development|旅遊發展
retained features|保留的設施或特徵''')
manual('mixed',96,'''total|總量
per capita|人均
trend|趨勢
distribution|分布
common categories|共同類別''')
manual('mixed',97,'''total emissions|排放總量
per capita emissions|人均排放量
per-person comparison|人均比較
category comparison|類別比較''')
manual('maps',99,'A new mall will be built.|客觀描述新增商場，不加個人評價。','example')
manual('maps',102,'will be built / will be removed|未來地圖：將會新建或移除','phrase')
# Keep explicit error tables as warnings, never as suggested writing.
for page in [39,101]:
 for wrong,note in rows(page):add('mistakes',wrong,'原書錯誤改寫示例：'+note,page,'warning')
manual('mistakes',15,'''skyrocket|原書提醒：不要用來描述小幅上升。
children → juveniles / offspring / teenagers|原書提醒：不要為避免重複而改變年齡範圍或語域。''','warning')
manual('mistakes',99,'''In conclusion|原書提醒：Task 1 應寫 Overview，可用 Overall 開首。
This is because people became richer.|原書錯例：圖中沒有交代的原因不要自行加入。
This is a positive development.|原書錯例：不要加入個人評價。
The new mall will make life better.|原書錯例：改成客觀描述新增設施。
The population rose due to immigration.|原書提醒：除非圖中交代，否則不要推測移民原因。''','warning')
manual('mistakes',103,'''a 50% increase|原書錯例：17% → 67% 應是增加 50 percentage points。
one third|原書提醒：28% 不應寫成三分之一，可寫 just over a quarter。''','warning')
manual('foundations',105,'''Analysis-only practice|只練分析
Opening sentence practice|引言句練習
Overview-only practice|只練總覽
Grouping practice|分組練習
Data sentence practice|數據句練習
Full 20-minute report|20 分鐘完整報告
Error analysis|錯誤分析
brief outline|簡短大綱''')
manual('foundations',107,'''Data selection|資料選取
Data accuracy|資料準確度
Coherence|連貫
Cohesion|銜接
Vocabulary|詞彙
Grammar|文法
Preposition|介詞
Numbers|數字
Timing|時間控制''')
manual('foundations',109,'''Word count|字數
Structure|結構
Selection|選材
Comparisons|比較
Punctuation|標點
spelling|拼字''')
# Correct a PDF reading-order artefact in the passive examples for source browsing.
source[76]['tables'][1]=[['Active-like idea','Passive Task 1 style'],['workers crush limestone','limestone is crushed'],['a machine heats the mixture','the mixture is heated'],['people pack cement','cement is packed into bags']]
source[76]['text']=re.sub(r'Process examples.*','Process examples\nworkers crush limestone → limestone is crushed\na machine heats the mixture → the mixture is heated\npeople pack cement → cement is packed into bags',source[76]['text'],flags=re.S)
result={'source':{'title':'IELTS Writing - Task 1 - Skills Overview · Book 1 (Basic)','pages':110,'sha256':'d89f19e4991327998b9ded70f10006ce7d0bd9f6ded56315c181ae9499d188a4'},'categories':[{'id':k,'label':v} for k,v in categories.items()],'entries':entries,'bookPages':source}
(root/'ielts-chart-teaching/vocabulary-data.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
assert len(source)==110 and all(1<=p<=110 for e in entries for p in e['pages'])
assert all(any(e['category']==cat for e in entries) for cat in categories)
print(f'Built {len(entries)} entries in {len(categories)} scenarios; retained all 110 source pages and {sum(len(p["tables"]) for p in source)} tables.')
