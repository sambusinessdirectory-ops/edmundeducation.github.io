// Task 1 Bar Charts 1: individually authored from the exact chart and model report.
// Source image: https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/writing-practice/questions/ielts-task1/model-essay-1-ielts-task1-bar-charts.webp
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看圖表或回想報告，再依原文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;

const simple=[
  'The bar chart shows the number of US families in five yearly income groups in 2007, 2011 and 2015. The numbers are in millions.',
  'Overall, the groups below $50,000 and the group at $100,000 or more had the most families. The two middle groups always had fewer.',
  'By 2015, the $100,000-or-more group became the biggest group. The $75,000–$99,999 group had the fewest in every year.',
  'In 2007, about 25 million families earned less than $25,000. About 27 million were in the $25,000–$49,999 income group.',
  'By 2011, both groups had grown: almost 29 million in the first group and about 30 million in the second.',
  'By 2015, the two groups had fallen a little, to about 28 and 29 million families. They were still among the biggest groups.',
  'The other three income groups did not all change in the same way.',
  'The number of families in the $50,000–$74,999 group stayed near 21 million in 2007, 2011 and 2015.',
  'The $75,000–$99,999 group was the smallest in all three years, with about 14 to 15 million families.',
  'But the group earning $100,000 or more fell from about 29 million in 2007 to 28 million in 2011, then went up quickly to about 33 million in 2015.',
];
const vocabulary=[
  v(['compares','shows','比較／展示'],['households','families','家庭／住戶'],['annual income bands','yearly income groups','年收入組別'],['measured in millions','numbers are in millions','以百萬戶為單位']),
  v(['distribution was dominated by','had the most families','佔最多'],['households','families','家庭／住戶'],['middle-income groups','middle groups','中等收入組別'],['consistently smaller','always had fewer','一直較少']),
  v(['highest-income category','$100,000-or-more group','最高收入組別'],['became clearly the largest','became the biggest group','明顯成為最多'],['least common throughout','fewest in every year','整段期間都最少']),
  v(['households','families','家庭／住戶'],['earned under','earned less than','收入低於'],['compared with roughly','About','相比之下，約有'],['bracket','income group','收入組別']),
  v(['Both groups increased','both groups had grown','兩組均增加'],['just under','almost','接近但未到'],['around','about','大約'],['respectively','in the first group and about 30 million in the second','分別按前述順序對應']),
  v(['edged down slightly','fallen a little','輕微回落'],['approximately','about','大約'],['largest categories','biggest groups','最大的組別']),
  v(['remaining three bands','other three income groups','其餘三個收入組別'],['less uniform movement','did not all change in the same way','變化不一致']),
  v(['households','families','家庭／住戶'],['stayed almost unchanged','stayed near','幾乎不變'],['all three years','2007, 2011 and 2015','三個年份']),
  v(['range','group','收入組別'],['consistently the smallest group','smallest in all three years','一直最少'],['at around','with about','約有']),
  v(['By contrast','But','相比之下'],['households with incomes of at least','group earning','收入至少達到該門檻的家庭'],['dipped','fell','輕微下降'],['before rising sharply','then went up quickly','之後大幅上升'],['approximately','about','大約']),
];

const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({
  example,distractors,frame,
  answerReason:`這句${relation}，用法與原文一致。`,
  distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`,
});
const structures=[
  f('The table compares the number of commuters, measured in thousands, across four transport types in 2010 and 2020.','先交代圖表、比較對象、單位、分類和年份',[1,3,9],{
    formula:'The [圖表類型] compares [比較對象], measured in [單位], across [分類與年份]',
    meaning:'這句先交代家庭數量、百萬戶單位、五個收入組別及三個年份；尚未開始分析走勢。',
    usage:'介紹一張圖表時，先交代它比較甚麼、數字的單位、分類及時間。',
    parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares'),slot(' the number of US households','比較對象'),link(', measured in'),slot(' millions','單位'),link(', across'),slot(' five annual income bands in 2007, 2011 and 2015.','分類與年份')],
  }),
  f('Overall, buses carried the most passengers, while ferries remained less common.','用 Overall 概述主要高低差異，再用 while 對照另一組',[0,3,7],{
    formula:'Overall, [較大的組別], while [較小的組別]',
    meaning:'整體比較三個年份後，先指出較大的收入組別，再以 while 對照較小的兩組。',
    usage:'寫圖表概覽時，選最顯著的高低差異，不必逐一列出每個數字。',
    parts:[link('Overall,'),slot(' the distribution was dominated by households earning below $50,000 and by those earning $100,000 or more','較大的組別'),link(', while'),slot(' the two middle-income groups were consistently smaller.','較小的組別')],
  }),
  f('Car use rose by 2020, whereas cycling stayed almost unchanged.','用 whereas 並排對照兩組不同走勢',[1,4,9],{
    formula:'[第一組的排名或走勢] whereas [第二組的排名或走勢]',
    meaning:'2015 年最高收入組成為最多；與此相對，另一收入組一直最少。',
    usage:'兩組在排名、數值或變化方向上不同時，用 whereas 直接呈現對照。',
    parts:[slot('The highest-income category became clearly the largest by 2015, ','第一組的排名'),link('whereas'),slot(' the $75,000–$99,999 group remained the least common throughout.','第二組的排名')],
  }),
  f('In 2010, about 40 thousand people took trains, compared with roughly 20 thousand bus users.','用 compared with 比較同一年兩組數值',[0,4,8],{
    formula:'In [年份], [第一組數值], compared with [第二組數值]',
    meaning:'先定在 2007 年，報告低收入第一組約 2,500 萬戶，再比較第二組約 2,700 萬戶。',
    usage:'比較同一時間點的兩組數值時，先交代年份，再用 compared with 接第二組。',
    parts:[link('In'),slot(' 2007','年份'),link(','),slot(' about 25 million households earned under $25,000','第一組數值'),link(', compared with'),slot(' roughly 27 million in the $25,000–$49,999 bracket.','第二組數值')],
  }),
  f('Both age groups increased by 2020, reaching 40% and 45%, respectively.','用 reaching 列末值，再用 respectively 按原次序對應兩組',[3,5,7],{
    formula:'[兩組共同變化], reaching [兩個末值], respectively',
    meaning:'兩個較低收入組都上升；接近 2,900 萬及約 3,000 萬，依前文順序分別對應兩組。',
    usage:'先提兩組，再列兩個結果數值時，用 respectively 明確表示先後對應。',
    parts:[slot('Both groups increased by 2011','兩組共同變化'),link(', reaching'),slot(' just under 29 million and around 30 million','兩個末值'),link(', respectively.')],
  }),
  f('By 2020, bus use had fallen slightly, to about 25%, although it remained the leading choice.','先報告下降與末值，再用 although 補充仍成立的排名',[4,7,9],{
    formula:'By [年份], [變化], to [數值], although [仍成立的情況]',
    meaning:'兩組到 2015 年略降至約 2,800 萬及 2,900 萬戶，卻仍屬數量較大的組別。',
    usage:'數值出現變化，但整體排名或其他重要情況仍成立時，用 although 補上保留。',
    parts:[link('By'),slot(' 2015','年份'),link(','),slot(' they had edged down slightly','變化'),link(', to'),slot(' approximately 28 million and 29 million','數值'),link(', although'),slot(' they were still among the largest categories.','仍成立的情況')],
  }),
  f('The remaining three regions showed less uniform growth.','從已分析的組別轉向其餘組別，概括它們的變化不一致',[0,2,8],{
    formula:'The remaining [組別] showed [共同或不同的變化]',
    meaning:'前段已討論兩個較低收入組；這句轉到其餘三組，指出它們的變化不一致。',
    usage:'分組報告數據時，轉到尚未分析的類別，先概括它們有甚麼共同點或差異。',
    parts:[link('The remaining'),slot(' three bands','其餘組別'),link(' showed'),slot(' less uniform movement.','變化概括')],
  }),
  f('The number of train passengers stayed almost unchanged at around 20 thousand in both years.','用 stayed almost unchanged 指出數量大致穩定，並交代值與期間',[4,6,9],{
    formula:'The number of [組別] stayed [穩定程度] at [數值] in [期間]',
    meaning:'50,000 至 74,999 美元的組別在三個年份都約為 2,100 萬戶，變化很小。',
    usage:'一組數據在多個時間點差異很小時，交代它大致穩定的值和時間範圍。',
    parts:[link('The number of'),slot(' households earning $50,000–$74,999','組別'),link(' stayed'),slot(' almost unchanged','穩定程度'),link(' at'),slot(' about 21 million','數值'),link(' in'),slot(' all three years.','期間')],
  }),
  f('Those in the 18–24 age group were consistently the most active, at around 70%.','用 consistently 交代持續排名，再補上約數',[2,3,7],{
    formula:'Those in [組別] were consistently [排名], at around [數值]',
    meaning:'75,000 至 99,999 美元收入組一直最少，大約在 1,400 萬至 1,500 萬戶之間。',
    usage:'某組別在整個期間保持同一高低排名時，同時交代其大致數值。',
    parts:[link('Those in'),slot(' the $75,000–$99,999 range','組別'),link(' were consistently'),slot(' the smallest group','持續排名'),link(', at around'),slot(' 14–15 million.','約數')],
  }),
  f('By contrast, car use dipped from 60% to 50% in 2015, before rising sharply to 65% in 2020.','用 dipped ... before rising 按時間交代先降後升',[2,5,7],{
    formula:'By contrast, [組別] dipped from [起點] to [低點], before rising sharply to [終點]',
    meaning:'最高收入組先從約 2,900 萬戶降至 2011 年的 2,800 萬戶，再於 2015 年升至約 3,300 萬戶。',
    usage:'一組數據與前述組別走勢不同，且先下降再明顯上升時，按時間列出起點、低點和終點。',
    parts:[link('By contrast,'),slot(' households with incomes of at least $100,000','組別'),link(' dipped from'),slot(' about 29 million','起點'),link(' to'),slot(' 28 million in 2011','低點'),link(', before rising sharply to'),slot(' approximately 33 million in 2015.','終點')],
  }),
];

const intro=[
  quiz('這張圖表比較甚麼？',[
    '美國家庭在五個年收入組別中的數量；年份為 2007、2011、2015，單位為百萬戶',
    '五個國家的家庭收入比例；年份只有 2015，單位為百分比',
    '美國家庭的每月支出；年份為 2007、2011、2015，單位為美元',
    '三個國家的家庭總收入；年份為 2007 至 2015，單位為十億美元',
  ],'先鎖定圖表類型、比較對象、單位和三個年份，才不會把家庭數量誤寫成收入金額。'),
  {type:'multi',prompt:'只寫概覽時，應選出哪兩項最重要的特徵？',detail:'選兩項，再按「確認」。',options:[
    '兩個低收入組和最高收入組較大；中間兩組較小',
    '最高收入組到 2015 年成為最大；75,000–99,999 美元組一直最小',
    '所有收入組在三個年份中每次都上升',
    '50,000–74,999 美元組在 2015 年翻倍',
  ],correct:[0,1],why:'概覽抓整體高低與最顯著的最終排名；細節段才列出各組數字。'},
];
const route=[sequence('依照範文次序，排好四段的報告工作',[
  ['圖表介紹','說明美國家庭、五個收入組別、三個年份和百萬戶單位。'],
  ['整體概覽','先比較較大與較小的組別，再點出 2015 年最大和一直最小的組別。'],
  ['較低收入組細節','依 2007、2011、2015 的順序，追蹤前兩組先升後略降。'],
  ['其餘三組細節','分別交代中間組大致穩定、75,000–99,999 組最小、最高組先降後升。'],
],'圖表介紹 → 主要特徵 → 前兩組數值 → 其餘三組走勢；概覽不應被逐項數字淹沒。')];
const evidence=[
  quiz('圖表縱軸的「25」代表甚麼？',['2,500 萬戶家庭','25% 的家庭','每戶收入 25 美元','25 個收入組別'],'縱軸標示 households (millions)；25 即 25 million households，並非百分比或收入。'),
  quiz('2007 年兩個低於 50,000 美元的收入組，約各有多少家庭？',['低於 25,000 美元約 2,500 萬；25,000–49,999 美元約 2,700 萬','兩組各約 2,100 萬','前組約 2,700 萬；後組約 2,500 萬','前組約 1,500 萬；後組約 3,300 萬'],'原文按兩組的先後次序列出約 25 million 和 27 million。'),
  quiz('到 2011 年，前兩個低收入組發生甚麼變化？',['兩組均增加，依次接近 2,900 萬和約 3,000 萬','兩組均降至約 1,400 萬','第一組上升，第二組完全消失','兩組保持 2007 年原值'],'兩組由 2007 年的約 2,500 萬、2,700 萬，上升到接近 2,900 萬、約 3,000 萬。'),
  quiz('到 2015 年，前兩個低收入組的數值怎樣？',['略降至約 2,800 萬和 2,900 萬，仍屬較大的組別','大幅上升至各約 3,500 萬','分別降至約 1,400 萬和 1,500 萬','完全沒有變化，仍為 2011 年的數值'],'兩組較 2011 年略低；下降不等於變成最小組別。'),
  quiz('哪一個組別在三個年份都大致維持約 2,100 萬戶？',['50,000–74,999 美元','低於 25,000 美元','75,000–99,999 美元','100,000 美元或以上'],'50,000–74,999 美元組接近水平；不要與一直最小的 75,000–99,999 組混淆。'),
  quiz('最高收入組的三個年份數值，哪項次序正確？',['約 2,900 萬 → 2,800 萬 → 3,300 萬','約 2,800 萬 → 2,900 萬 → 3,300 萬','約 3,300 萬 → 2,900 萬 → 2,800 萬','約 1,500 萬 → 2,100 萬 → 3,300 萬'],'這組先在 2011 年略降，再於 2015 年升到全圖最高的約 3,300 萬。'),
];
const logic=[
  sequence('第一組細節：按年份接好兩個較低收入組',[
    ['2007 起點','低於 25,000 美元約 2,500 萬戶；25,000–49,999 美元約 2,700 萬戶。'],
    ['2011 共同上升','兩組依次接近 2,900 萬戶和約 3,000 萬戶。'],
    ['2015 輕微回落','兩組依次約為 2,800 萬戶和 2,900 萬戶。'],
    ['保留整體排名','即使略降，這兩組仍屬數量較大的收入組別。'],
  ],'先交代兩組的起點，再依年份寫升跌，最後避免把「略降」誤讀為「最小」。'),
  sequence('第二組細節：分清其餘三個收入組的不同走勢',[
    ['先轉到其餘組別','剩下三組並非沿着同一方向變化。'],
    ['中間組大致穩定','50,000–74,999 美元組三年都約 2,100 萬戶。'],
    ['較高組一直最小','75,000–99,999 美元組一直約 1,400 萬至 1,500 萬戶。'],
    ['最高組先降後升','100,000 美元或以上組約 2,900 萬 → 2,800 萬 → 3,300 萬戶。'],
  ],'不要把三組寫成同一趨勢：一組穩定、一組始終最小、一組先降後升。'),
];

const transfers=[
  transfer('另一張柱狀圖比較 2010、2015、2020 年三種交通工具的乘客數，縱軸單位是千人。','哪一句能完整而準確地介紹新圖表？',[
    '柱狀圖比較三種交通工具在三個年份的乘客數，單位為千人。',
    '柱狀圖顯示三種交通工具的收入，單位為每人美元。',
    '圖表證明交通工具改變了乘客的生活習慣。',
    '圖表只比較 2020 年的乘客百分比和票價。',
  ],['先交代對象、年份和單位，沒有捏造原因。','把乘客數誤寫成收入，單位也錯。','圖表只提供數據，不能直接證明生活習慣的原因。','遺漏兩個年份，並把數量改成百分比和票價。'],[0],'原文第 1 句先交代美國家庭、收入組別、三個年份及百萬戶單位；新圖表亦應先鎖定這四項。'),
  transfer('一張圖表有五種運動；跑步與游泳的人數較多，其餘三種較少。','哪項適合作為不堆數字的概覽？',[
    '整體而言，跑步和游泳較普遍，其餘三種活動的人數較少。',
    '跑步在第一年有 24,613 人，游泳有 22,718 人。',
    '五種活動的人數必定每年以相同速度上升。',
    '因為天氣炎熱，所以所有人改為跑步和游泳。',
  ],['概括較大與較小組別，保留概覽的層次。','單列兩個精確值，還未說明整體格局。','資料只說高低，沒有支持每年同速增長。','圖表沒有提供天氣或選擇活動的原因。'],[1],'原文概覽先指出兩個低收入組和最高收入組較大、兩個中間組較小，沒有逐項列值。'),
  transfer('新圖表顯示 A 組在最後一年成為最多；B 組在每一年都最少。','哪項最準確保留這兩種不同排名？',[
    '最後一年 A 組成為最多，而 B 組在整段期間一直最少。',
    'A 和 B 兩組在最後一年都成為最多。',
    'B 組只在最後一年最少，之前一直最多。',
    '兩組最後一年數值一樣，所以無法比較。',
  ],['分清「最後一年成為最多」與「全程一直最少」。','把一直最少的 B 組說成最多。','把持續排名錯改為只在最後一年出現。','題目已提供高低排名，不能說兩組相同。'],[2],'原文把最高收入組到 2015 年成為最大，與 75,000–99,999 美元組一直最小並列對照。'),
  transfer('某市 2018 年乘巴士的人約 4 萬，乘火車的人約 6 萬。','哪一句在同一年正確比較兩組？',[
    '2018 年乘巴士者約 4 萬，相比之下乘火車者約 6 萬。',
    '2018 年巴士和火車乘客各約 6 萬。',
    '2018 年火車乘客約 4 萬，巴士乘客約 6 萬。',
    '巴士乘客由 4 萬升至 6 萬，但沒有其他年份。',
  ],['同一年、同一單位比較兩組，數值順序正確。','錯把兩組寫成相同。','把巴士與火車的數值倒轉。','沒有第二個年份，不能寫成時間趨勢。'],[3],'原文在 2007 年並排比較兩個收入組的約 2,500 萬與 2,700 萬戶，沒有把兩組數值倒轉。'),
  transfer('A、B 兩組均增加，到 2020 年分別為 40% 和 55%。','哪一句正確表達「分別」的對應？',[
    '兩組都上升，到 2020 年 A 組為 40%，B 組為 55%。',
    '兩組都上升，到 2020 年 A 組為 55%，B 組為 40%。',
    'A 組上升到 40%，B 組卻下降到 55%。',
    '兩組都上升，但無法知道哪組對應 40%。',
  ],['按 A、B 的次序對應 40% 與 55%。','把兩組數值的先後對調。','題目說兩組均增加，不能把 B 寫成下降。','「分別」已提供清楚的對應次序。'],[4],'原文說兩組依次達到接近 2,900 萬和約 3,000 萬戶；respectively 鎖定前述兩組的順序。'),
  transfer('產品 A 的市佔率由 32% 略降至 30%，但它仍是四種產品中最高。','哪項同時保留變化與排名？',[
    'A 的佔有率略降至 30%，但仍為四種產品中最高。',
    'A 的佔有率略降，因此一定變成最小。',
    'A 的佔有率升至 30%，並取代所有產品。',
    'A 仍是最高，所以它的數值不可能下降。',
  ],['數值小降與排名仍高可以同時成立。','下降不必然改變最高排名。','把下降誤寫為上升，又誇大結果。','最高排名不代表數值完全不變。'],[5],'原文兩個低收入組到 2015 年略降，卻仍屬較大的組別；although 補上沒有改變的整體排名。'),
  transfer('圖表有五個區域；報告已寫完首兩個區域，餘下三個走勢各異。','哪一句適合作為下一段的轉接？',[
    '其餘三個區域的變化不一致。',
    '五個區域每一年都完全相同。',
    '首兩個區域已經失去所有人口。',
    '其餘三個區域都保持固定不變。',
  ],['先轉到未討論的組別，準確概括它們走勢各異。','題目已說餘下三區不同，不能寫成五區相同。','沒有資料支持首兩區人口消失。','把各異走勢錯寫成全部穩定。'],[6],'原文第 4 段以「其餘三個組別變化不一致」轉入新的數據組，而非重述前兩組。'),
  transfer('某組數值在三年分別為 65、66、65，單位都是百分比。','哪一項最合適描述整段期間？',[
    '該組在三年間大致穩定，約為 65%。',
    '該組每年都持續大幅上升。',
    '該組由 65% 一直下降至 0%。',
    '該組三年間剛好完全沒有變化。',
  ],['65、66、65 有輕微波動，故說「大致穩定」。','中間只差一點，末年又回到起點。','數據沒有降到 0%。','第二年為 66%，不能說完全不變。'],[7],'原文 50,000–74,999 美元組三年約為 2,100 萬戶，使用「幾乎不變」而非「完全一樣」。'),
  transfer('三組數值分別為 A：30、31、32；B：11、12、10；C：20、21、22。','哪一項正確概括 B 組的排名？',[
    'B 在三個時間點一直最小，大約在 10 至 12 之間。',
    'B 只在第一個時間點最小，其後成為最大。',
    'B 在三個時間點都剛好是 11。',
    'B 由 11 大幅上升至 32，最後超過 A。',
  ],['每個時間點 B 都低於 A 和 C；數值也落在 10 至 12。','B 在後兩個時間點仍小於其他組別。','B 的三個值為 11、12、10，並非完全不變。','32 是 A 的值，不能移到 B 組。'],[8],'原文 75,000–99,999 美元組在三個年份都是最小，約為 1,400 萬至 1,500 萬戶。'),
  transfer('某產品銷量為 2010 年 100、2015 年 90、2020 年 140。','哪一句依時間正確描述走勢？',[
    '銷量先由 100 降至 90，再升至 140。',
    '銷量每五年都按同一速度上升。',
    '銷量先升至 140，再跌回 90。',
    '銷量一直維持在 100 左右，沒有變化。',
  ],['先降後升，三個數值及時間次序均正確。','第一段由 100 降至 90，並非持續上升。','把 140 和 90 的時間次序倒轉。','最後 140 已明顯高於起點 100。'],[9],'原文最高收入組由約 2,900 萬降至 2,800 萬，再升至約 3,300 萬，必須保留先降後升的順序。'),
];

const balancedTransferOptions=[
 ['柱狀圖比較三類交通工具三年乘客數，單位千人。','柱狀圖比較三類交通工具三年收入，單位美元。','柱狀圖比較三類交通工具三年票價，單位千人。','柱狀圖只比較二〇二〇年乘客比例，單位百分比。'],
 ['整體而言，跑步和游泳較普遍，其餘活動人數較少。','整體而言，五種運動各年人數都以相同速度上升。','整體而言，跑步和游泳都比其餘三種活動少人。','整體而言，五種運動的差異只來自當年天氣。'],
 ['最後一年甲組最多，乙組在整段期間一直最少。','最後一年甲乙兩組並列最多，之前乙組最少。','乙組只在最後一年最少，此前長期位列最多。','甲乙兩組最後一年的數值相同，無法比較。'],
 ['二〇一八年巴士約四萬人，火車約六萬人。','二〇一八年巴士與火車乘客均約六萬人。','二〇一八年火車約四萬人，巴士約六萬人。','巴士乘客由四萬增至六萬，卻只給一個年份。'],
 ['兩組都上升；二〇二〇年甲為四成、乙為五成半。','兩組都上升；二〇二〇年甲為五成半、乙為四成。','甲升至四成，乙卻下降到五成半，與題目相反。','兩組雖都上升，但題目沒說哪組對應四成。'],
 ['甲佔有率略降至三成，仍是四種產品中最高。','甲佔有率略降至三成，所以必定變成最小。','甲佔有率上升至三成，並超過所有其他產品。','甲仍維持最高排名，因此數值一定沒有下降。'],
 ['其餘三個區域各有不同變化，可轉入下一段比較。','五個區域每一年數值相同，毋須再分組討論。','首兩個區域人口歸零，其餘三區仍持續上升。','其餘三個區域都固定不變，所以走勢完全一致。'],
 ['該組三年只有輕微波動，大致維持在六成半。','該組三年連續明顯上升，最後遠高於起點。','該組由六成半一直下降，末年接近零。','該組三年數值完全相同，沒有任何變動。'],
 ['乙組在三個時間點都最小，約在十至十二間。','乙組只在第一年最小，後兩年都成為最大。','乙組三年數值完全相同，每年恰好都是十一。','乙組由十一升至三十二，最後超過甲組。'],
 ['銷量先由一百降至九十，再升至一百四十。','銷量每隔五年都按同一幅度持續增加。','銷量先升至一百四十，再跌回九十。','銷量始終接近一百，沒有明顯升跌。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-bar-charts:1',meta:{topic:'美國家庭收入組別',summary:'先概述最大與最小組別，再按收入層次比較三個年份的具體數值。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
