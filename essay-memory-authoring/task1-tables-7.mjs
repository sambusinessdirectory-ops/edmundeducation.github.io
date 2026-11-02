// Task 1 Tables 7: international arrivals, displayed million counts and reported percentage changes.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'人次以百萬計；Change 欄為表內另行列出的百分比。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先最大目的地與整體方向，再比較增長和唯一下降。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows international tourist arrivals in the listed places in 2009 and 2010, in millions, plus the percentage change.',
 'Overall, France had the most international arrivals in both years, although its number did not rise.',
 'Most places had more arrivals in 2010. The larger places mostly rose only a little, while Germany, China and Turkey rose much more.',
 'Hong Kong was the only place with fewer arrivals in 2010.',
 'Among the top places, France had 76 million arrivals in both years, far more than the US, which rose a little from 66 to 67 million.',
 'Spain and the UK both had 55 million in 2009, but the UK rose faster to 57 million, just above Spain at 56 million.',
 'Italy rose a little too, from 44 to 45 million.',
 'The other places had much bigger percentage changes.',
 'Turkey, China and Germany each had 12 million more arrivals, rising from 33 to 45 million, from 22 to 34 million, and from 11 to 23 million, in that order.',
 'Germany started at the smallest number, so the same 12-million gain was the biggest percentage increase, reported as 109%.',
 'In contrast, Hong Kong fell from 10 to 9 million; the table reports a decrease of 11%.',
];
const vocabulary=[
 v(['compares','shows','比較'],['international tourist arrivals','international tourist arrivals','國際旅客抵達人次'],['measured in millions','in millions','以百萬計'],['percentage change','percentage change','百分比變化']),
 v(['remained the most visited destination','had the most international arrivals in both years','一直是最多旅客抵達的目的地'],['despite recording no growth','although its number did not rise','即使沒有增長']),
 v(['Most places attracted more tourists','Most places had more arrivals','大多目的地旅客增加'],['generally modest','mostly rose only a little','通常升幅輕微'],['far stronger','rose much more','增長更大']),
 v(['only destination to decline','only place with fewer arrivals','唯一減少的目的地'],['Hong Kong','Hong Kong','香港']),
 v(['leading destinations','top places','主要目的地'],['received','had','接待／錄得'],['staying well ahead of','far more than','仍遠超'],['edged up','rose a little','微升']),
 v(['were level','both had','持平'],['grew more quickly','rose faster','增長較快'],['narrowly overtaking','just above','以小差距超越']),
 v(['increased slightly','rose a little','輕微增加'],['from 44 to 45 million','from 44 to 45 million','由四千四百萬至四千五百萬']),
 v(['remaining destinations','other places','其餘目的地'],['much sharper relative changes','much bigger percentage changes','相對變動更大']),
 v(['each gained 12 million arrivals','each had 12 million more arrivals','各增加一千二百萬人次'],['climbing from','rising from','由起值增加'],['respectively','in that order','按先後次序']),
 v(['started from the lowest base','started at the smallest number','起點最低'],['represented the largest percentage rise','was the biggest percentage increase','百分比升幅最大'],['at 109%','reported as 109%','表列百分之一百零九']),
 v(['By contrast','In contrast','相反'],['fell from','fell from','由某值下降'],['a decrease of 11%','a decrease of 11%','表列跌百分之十一']),
];
const structures=[
 f('The table compares international tourist arrivals, measured in millions, in the listed destinations in 2011 and 2012, together with the percentage change over the period.','引言同時交代人次單位和另列的變動百分比',[1,4,8],{formula:'The table compares international tourist arrivals, measured in millions, in [目的地範圍] in [起年] and [終年], together with the percentage change over the period',meaning:'2009、2010 各地國際旅客抵達百萬人次及變化百分比。',usage:'表有九個目的地列，避免重複題目「八個國家」的數目。',parts:[link('The table compares international tourist arrivals, measured in millions, in '),slot('the listed destinations','目的地'),link(' in '),slot('2009','起年'),link(' and '),slot('2010','終年'),link(', together with the percentage change over the period.')]}),
 f('Overall, Country A remained the most visited destination, despite recording no growth.','概覽最大目的地與其零增長並存',[0,4,8],{formula:'Overall, [目的地] remained the most visited destination, despite recording no growth',meaning:'France 兩年都 76m，保持最多但增長 0%。',usage:'最多人次與增長最多是不同比較。',parts:[link('Overall, '),slot('France','最多目的地'),link(' remained the most visited destination, despite recording no growth.')]}),
 f('Most places attracted more tourists in the second year, but the increases were generally modest among the larger markets and far stronger among Countries A, B and C.','用 but 比較較大與較小市場的變化幅度',[0,4,8],{formula:'Most places attracted more tourists in the second year, but the increases were generally modest among the larger markets and far stronger among [快速增長組]',meaning:'多數目的地升；US/Spain/UK/Italy 小幅升，Germany/China/Turkey 增幅較大。',usage:'France 不升、Hong Kong 下降，故只說 Most places。',parts:[link('Most places attracted more tourists in the second year, but the increases were generally modest among the larger markets and far stronger among '),slot('Germany, China and Turkey','增幅較大組'),link('.')]}),
 f('Place Q was the only destination to decline.','獨立凸顯唯一下降例外',[0,4,8],{formula:'[目的地] was the only destination to decline',meaning:'Hong Kong 10→9m；其他八列持平或上升。',usage:'only 指下降類別唯一，不代表只有這一列沒有增長：France 持平。',parts:[slot('Hong Kong','唯一下降目的地'),link(' was the only destination to decline.')]}),
 f('Among the leading destinations, Country A received 80 million tourists in both years, staying well ahead of Country B, whose figure edged up from 65 to 66 million.','報領先者持平及第二名小幅上升',[0,3,8],{formula:'Among the leading destinations, [首位] received [值] million tourists in both years, staying well ahead of [第二位], whose figure edged up from [起值] to [終值] million',meaning:'France 76m 不變；US 66→67m。',usage:'whose figure 指 US 的抵達人次，不是 France 的數字。',parts:[link('Among the leading destinations, '),slot('France','首位'),link(' received '),slot('76','持平值'),link(' million tourists in both years, staying well ahead of '),slot('the US','第二位'),link(', whose figure edged up from '),slot('66','起值'),link(' to '),slot('67','終值'),link(' million.')]}),
 f('Country A and Country B were level at 40 million in 2009, but Country B grew more quickly, reaching 44 million and narrowly overtaking Country A, which rose to 43 million.','先交代起點並列，再說次年細微排名交叉',[0,3,8],{formula:'[兩目的地] were level at [共同起值] in [起年], but [較快者] grew more quickly, reaching [終值] and narrowly overtaking [較慢者], which rose to [終值]',meaning:'Spain/UK 2009 均 55m；2010 UK 57m、Spain 56m。',usage:'排名只差 1m，narrowly 是小幅超越；不能說 UK 一直領先。',parts:[slot('Spain and the UK','原本並列'),link(' were level at '),slot('55','共同起值'),link(' million in '),slot('2009','起年'),link(', but '),slot('the UK','較快者'),link(' grew more quickly, reaching '),slot('57','較快者終值'),link(' million and narrowly overtaking '),slot('Spain','較慢者'),link(', which rose to '),slot('56','較慢者終值'),link(' million.')]}),
 f('Country C also increased slightly, from 41 to 42 million.','簡短補上另一個小幅上升的大市場',[0,3,8],{formula:'[目的地] also increased slightly, from [起值] to [終值] million',meaning:'Italy 44→45m，增加 1m。',usage:'起終值同單位百萬人次；不能把表列 2.3% 當成 2.3m。',parts:[slot('Italy','目的地'),link(' also increased slightly, from '),slot('44','起值'),link(' to '),slot('45','終值'),link(' million.')]}),
 f('The remaining destinations showed more pronounced proportional changes.','由絕對人次轉向相對百分比幅度',[0,3,6],{formula:'The remaining destinations showed much sharper relative changes [時段]',meaning:'Turkey/China/Germany 上升的百分比遠大於 US/Spain/UK/Italy；Hong Kong 下降。',usage:'relative changes 指比例變化；同樣增加 12m，底數較小可得到較大比例。',parts:[link('The remaining destinations '),slot('showed much sharper relative changes','變化幅度'),link('.')]}),
 f('Countries A, B and C each gained 10 million arrivals, climbing from 30 to 40 million, 20 to 30 million and 10 to 20 million respectively.','用 each 與 respectively 配對三組相同絕對增量',[0,3,6],{formula:'[三目的地] each gained [共同增量] million arrivals, climbing from [第一對], [第二對] and [第三對] respectively',meaning:'Turkey 33→45、China 22→34、Germany 11→23m，各加 12m。',usage:'respectively 須按 Turkey、China、Germany 配對，不可把三個比例或起點混掉。',parts:[slot('Turkey, China and Germany','三目的地'),link(' each gained '),slot('12','共同增量'),link(' million arrivals, climbing from '),slot('33 to 45 million','第一對'),link(', '),slot('22 to 34 million','第二對'),link(' and '),slot('11 to 23 million','第三對'),link(' respectively.')]}),
 f('Because Country C started from the lowest base, this represented the largest percentage rise, at 120%.','說明相同絕對增量對最低基數產生最大比例',[0,3,6],{formula:'Because [目的地] started from the lowest base, this represented the largest percentage rise, at [百分比]',meaning:'Germany 11→23m；表列 +109%，為最大比例增長。',usage:'Turkey/China/Germany 都加 12m；109% 用 Germany 自身 11m 起點作分母。',parts:[link('Because '),slot('Germany','最低起點'),link(' started from the lowest base, this represented the largest percentage rise, at '),slot('109%','表列增幅'),link('.')]}),
 f('By contrast, Place Q fell from 8 to 7 million, a decrease of 12%.','以唯一負向列收束細節',[0,3,6],{formula:'By contrast, [目的地] fell from [起值] to [終值] million, a decrease of [表列百分比]',meaning:'Hong Kong 10→9m；變化欄列 −11%。',usage:'顯示的整百萬數與百分比欄未必精確相除；報表列值，不把 −11% 改寫成 −10%。',parts:[link('By contrast, '),slot('Hong Kong','下降目的地'),link(' fell from '),slot('10','起值'),link(' to '),slot('9','終值'),link(' million, a decrease of '),slot('11%','表列百分比'),link('.')]}),
];
const intro=[quiz('表格同時給出哪兩類數據？',['兩年抵達人次（百萬）與變化百分比','兩年旅客消費與酒店房價','移民人口與出生率','八個城市的國內通勤量'],'標題和欄名列 2009/2010 millions 及 Change。'),{type:'multi',prompt:'哪兩句適合概覽？',detail:'選兩項，再按「確認」。',options:['France 兩年都是抵達人次最多，但持平','大多目的地上升；Hong Kong 是唯一下降','Germany 的抵達人次絕對值最高','所有目的地都大幅增長'],correct:[0,1],why:'一項說最高列，一項說普遍方向與例外。'}];
const route=[sequence('按原文重排國際抵達人次報告',[
 ['引言','列出 2009、2010 百萬人次及表列變化百分比。'],['概覽','France 最多且持平；大多升，Hong Kong 唯一下降。'],['較大目的地','France 76 不變；US 66→67；Spain/UK 55 並列後 UK 超前；Italy 44→45。'],['其他目的地','Turkey/China/Germany 各加 12m；Germany 比例最大；Hong Kong 10→9m。'],
 ],'同樣絕對增量可對應不同相對增幅。')];
const evidence=[
 quiz('哪個目的地兩年都有最多抵達人次？',['France 76m','US 67m','UK 57m','Turkey 45m'],'France 最大，且 0% 變化。'),
 quiz('Hong Kong 的方向？',['10→9m，唯一減少','9→10m，上升','10→10m，持平','9→23m，倍增'],'Hong Kong 是唯一負變化列。'),
 quiz('2009 Spain 與 UK 的共同值及 2010 排序？',['同為 55m；UK 57m > Spain 56m','同為 55m；Spain 57m > UK 56m','同為 66m；兩者持平','同為 45m；UK 下降'],'先同值，再 UK 小幅超前。'),
 quiz('哪三列各增加 12m？',['Turkey、China、Germany','France、US、Spain','Spain、UK、Italy','US、Italy、Hong Kong'],'33→45、22→34、11→23。'),
 quiz('三列同加 12m，哪列百分比增幅最大？',['Germany，表列 109%','Turkey，表列 109%','China，表列 109%','三列比例相等'],'Germany 起點 11m 最低。'),
];
const logic=[sequence('分開絕對人次與比例變化',[
 ['絕對最大','France 76m，不增長。'],['共同絕對增量','Turkey、China、Germany 各 +12m。'],['不同起點','分別由 33、22、11m 開始。'],['相對最大','Germany 起點最小，變化欄報 +109%。'],
 ],'相同的 12m 不能推成相同百分比。'),sequence('檢查表格的顯示精度',[
 ['原始欄','Turkey 33→45m；Hong Kong 10→9m。'],['變化欄','分別報 +33% 和 −11%。'],['注意','用顯示的整百萬值直算會得到不同近似值。'],['寫作','表內變化百分比照報；不聲稱可由顯示整數精確推得。'],
 ],'不同欄可能經過不同精度的取整；可準確描述顯示資料而不自行改值。')];
const transfers=[
 transfer('另一表有兩年國際旅客抵達人次（百萬）及百分比變動欄。','哪句引言包含兩種量度？',['表格比較各目的地兩年的國際旅客百萬人次及期間百分比變化。','表格只列旅客的平均消費。','變化欄是增減百萬人次。','兩年數字都是酒店價格。'],['兩個量度都涵蓋。','無消費。','Change 為百分比。','無房價。'],[0],'原文 measured in millions，together with percentage change。'),
 transfer('France 2009、2010 都 76m，仍排首位。','哪句不把最大人次誤作最快增長？',['France 兩年旅客人次最多，但沒有增長。','France 以 109% 增長最快。','France 2010 旅客減至 9m。','France 與 Germany 同樣有 76m。'],['規模最大與零增長並存。','109% 是 Germany。','Hong Kong 9m。','Germany 23m。'],[1],'原文 most visited despite no growth。'),
 transfer('大多數列 2010 上升；France 持平，Hong Kong 下降。','哪句概覽避免「全部上升」？',['多數目的地增加；較大市場一般升幅較小，部分較小市場升幅更大。','全部目的地都增加。','只有 France 增加。','所有大市場都翻倍。'],['Most 保留例外。','兩列未增。','France 不變。','大市場變化小。'],[2],'原文 Most places，generally modest among larger markets。'),
 transfer('France 持平，Hong Kong 10→9m。','哪個是唯一下降目的地？',['香港','法國','美國','英國'],['Hong Kong 是唯一負向列。','France 0%。','US 上升。','UK 上升。'],[3],'原文 Hong Kong only destination to decline。'),
 transfer('France 76→76m，US 66→67m。','哪句正確比較前兩個大目的地？',['France 保持 76m，遠高於微升至 67m 的 US。','US 兩年都遠高於 France。','France 跌至 67m。','兩地同為 76m。'],['最大列與小幅升列正確。','US 較低。','France 不變。','不相等。'],[4],'原文 France 76 both years，US edged 66→67。'),
 transfer('Spain/UK 2009 都 55m；2010 Spain 56m、UK 57m。','哪句交代排名交叉？',['起年兩地持平；次年 UK 小幅超過 Spain。','起年 UK 已遠超 Spain。','次年 Spain 比 UK 多 1m。','兩地 2010 均跌至 45m。'],['從並列到 UK 高 1m。','起年相等。','UK 高。','兩者升。'],[5],'原文 were level，UK narrowly overtaking Spain。'),
 transfer('Italy 44→45m。','哪句沒有誇大變化？',['Italy 只輕微增長 1m。','Italy 增長 12m。','Italy 減少 1m。','Italy 旅客已達 76m。'],['44→45。','12m 是另外三列。','方向反。','France 76。'],[6],'原文 Italy increased slightly。'),
 transfer('Turkey/China/Germany 的相對變化比多數大市場大。','哪句作段落承接？',['其餘幾個目的地的百分比變化更顯著。','其餘目的地的實際人次都超過 France。','所有目的地的百分比完全相同。','表格沒有變化欄。'],['relative changes 指比例幅度。','人次較少。','比例不同。','有 Change。'],[7],'原文 remaining destinations sharper relative changes。'),
 transfer('Turkey 33→45、China 22→34、Germany 11→23m。','哪句按次序配對同增量？',['Turkey、China、Germany 各增加 12m，但起點分別為 33、22、11m。','三地各增加 33m。','Germany 由 33m 至 45m。','三地 2010 都是 45m。'],['三對差值均 12m。','33m 是 Turkey 起點。','Germany 11→23。','終值不同。'],[8],'原文 each gained 12m，respectively。'),
 transfer('同增 12m；Germany 起點 11m，比 Turkey 33m、China 22m 小。','哪句解釋最大相對增幅？',['Germany 起點最低，因此表列百分比升幅最大，為 109%。','三地同增 12m，所以百分比必定相等。','Turkey 起點最低。','Germany 2010 人次最多。'],['比例用各自起值作基數。','分母不同。','Germany 最低。','France 最多。'],[9],'原文 lowest base，largest percentage rise 109%。'),
 transfer('Hong Kong 顯示 10→9m，變化欄標 −11%。','哪句遵從表內數值又不冒稱精算？',['Hong Kong 由 10m 降至 9m；變化欄報減少 11%。','Hong Kong 增至 11m。','Hong Kong 的百分比升幅為 +109%。','由顯示整數可精確推得 −11%。'],['直接報兩欄，保留精度界限。','方向反。','109% 是 Germany。','10→9 直算為 −10%，顯示值未揭露底層精度。'],[10],'原文 Hong Kong 10→9m，table reports −11%。'),
];
const balancedTransferOptions=[
  ['表格比較各地兩年的旅客人次和百分比變動。','表格比較各地兩年的旅客消費和百分比變動。','表格比較各地兩年的旅客人次和房價變動。','表格比較各地兩年的旅客人次和百萬人增減。'],
  ['法國兩年最多，旅客人次卻沒有增加。','法國兩年都最多，並以 109% 增長最快。','法國兩年都最多，但次年下跌至 9m。','法國與德國兩年都同有 76m 旅客。'],
  ['多數目的地增加，法國持平，香港則下降。','各個目的地都增加，法國和香港也上升。','多數目的地下降，法國持平，香港則增加。','多數目的地增加，法國和香港卻都下降。'],
  ['香港旅客由 10m 降至 9m，是唯一負向列。','法國旅客由 76m 降至 75m，是唯一負向列。','美國旅客由 67m 降至 66m，是唯一負向列。','英國旅客由 57m 降至 55m，是唯一負向列。'],
  ['法國維持 76m，美國小幅升至 67m。','美國維持 76m，法國小幅升至 67m。','法國跌至 67m，美國小幅升至 76m。','法國與美國次年都維持在 76m。'],
  ['西班牙與英國起年同為 55m，次年英國領先。','西班牙與英國起年同為 55m，次年西班牙領先。','西班牙起年為 56m，英國起年為 57m，並不相同。','西班牙與英國起年同為 55m，次年依然相同。'],
  ['意大利由 44m 升至 45m，只增加 1m。','意大利由 44m 升至 56m，增加 12m。','意大利由 45m 降至 44m，減少 1m。','意大利由 44m 升至 76m，增幅最大。'],
  ['其餘幾個目的地的百分比增幅較為顯著。','其餘幾個目的地的旅客人次均超過法國。','其餘幾個目的地的百分比增幅完全相同。','其餘幾個目的地只有人次，沒有變動率。'],
  ['土耳其、中國、德國各增加 12m，起點不同。','土耳其、中國、德國各增加 33m，起點不同。','土耳其、中國、德國各增加 12m，起點相同。','土耳其、中國、德國終年均到達 45m。'],
  ['德國起點最低，同增 12m 時相對升幅最高。','土耳其起點最低，同增 12m 時相對升幅最高。','三地同增 12m，所以相對百分比升幅相同。','德國旅客總人次最高，因此相對升幅最高。'],
  ['香港由 10m 降至 9m，變動欄另報跌 11%。','香港由 10m 升至 11m，變動欄另報升 11%。','香港由 10m 降至 9m，變動欄另報升 109%。','香港由 10m 降至 9m，可精確算出跌 11%。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:7',meta:{topic:'2009–2010 國際旅客抵達人次與變動',summary:'France 76m 兩年最多但持平；大多數目的地上升，Hong Kong 唯一下降。Turkey、China、Germany 各加 12m；Germany 起點最低，表列相對升幅 109% 最大。表內共九個目的地列，部分 Change 百分比無法由顯示的整百萬值精確重算，須分別按欄報告。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
