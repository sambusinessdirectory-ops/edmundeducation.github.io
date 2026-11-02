// Task 1 Bar Charts 3: authored from the five-city coffee/tea chart and model report.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看圖表或回想報告，再依原文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
  'The bar chart gives information about five Australian cities: Sydney, Melbourne, Brisbane, Adelaide and Hobart. It shows the percentages of people who bought fresh coffee, bought instant coffee, or went to a café for coffee or tea in the last four weeks.',
  'Overall, going to a café was the most common choice in four of the five cities. Buying fresh coffee was the least common choice in every city.',
  'More people bought instant coffee than fresh coffee in all five cities. Adelaide was the only city where going to a café did not rank first.',
  'Café visits were especially common in Melbourne (about 64%) and Hobart (about 63%). Sydney came next, with a little over 60%.',
  'The share was lower in Brisbane (about 56%) and lowest in Adelaide (just under 50%).',
  'For instant coffee, Hobart had about 54% and Brisbane about 53%, both fairly high.',
  'Adelaide had about 50%. Melbourne had about 48%, and Sydney about 45%.',
  'But fresh coffee was less popular in every city: about 44% in Sydney, 43% in Melbourne, 39% in Hobart, 34% in Brisbane, and 35% in Adelaide.',
];
const vocabulary=[
  v(['proportions','percentages','比例'],['residents','people','居民'],['visited a café','went to a café','到咖啡店'],['previous four weeks','last four weeks','過去四星期']),
  v(['most common habit','most common choice','最常見的習慣'],['most cities','four of the five cities','大部分城市'],['consistently the least popular option','least common choice in every city','一直是最少的選項']),
  v(['more widely purchased','More people bought','購買比例較高'],['every city','all five cities','每個城市'],['did not occupy first position','did not rank first','並非排行第一']),
  v(['Café-going','Café visits','到咖啡店'],['especially popular','especially common','尤其普遍'],['followed by Sydney','Sydney came next','悉尼緊隨其後'],['just over three fifths','a little over 60%','略多於五分之三']),
  v(['figures were lower','share was lower','比例較低'],['at around','about','大約'],['weakest city','lowest in Adelaide','比例最低的城市']),
  v(['In terms of coffee purchases','For instant coffee','就咖啡購買而言'],['recorded relatively high figures','both fairly high','比例相對較高'],['roughly','about','大約']),
  v(['stood at','had','約為'],['slightly lower','Melbourne had about 48%, and Sydney about 45%','稍低'],['approximately','about','大約']),
  v(['By contrast','But','相比之下'],['attracted smaller shares','was less popular','比例較低'],['everywhere','in every city','所有城市'],['around','about','大約']),
];
const structures=[
  f('The bar chart compares the percentages of residents in five regions who used buses or trains over the previous month.','先交代城市、比較行為、百分比及回溯期間',[1,5,7],{
    formula:'The [圖表類型] compares [地點與人口的比例] who [比較的行為] over [期間]',meaning:'引言交代五個澳洲城市、三種購買或到店行為，以及「過去四星期」的百分比。',usage:'調查型圖表的引言須說明地點、受訪者、行為、時間範圍與百分比。',
    parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares'),slot(' the proportions of residents in Sydney, Melbourne, Brisbane, Adelaide and Hobart','地點與人口的比例'),link(' who'),slot(' bought fresh or instant coffee, or visited a café for coffee or tea,','比較的行為'),link(' over'),slot(' the previous four weeks.','期間')],
  }),
  f('Overall, bus travel was common in most regions, while cycling was least popular everywhere.','用 Overall 與 while 概述多數地方的最高和持續最低選項',[0,2,7],{
    formula:'Overall, [大多數地點最常見的選項], while [持續較少的選項]',meaning:'概覽比較五城：咖啡店到訪在大多數城市最常見，新鮮咖啡購買則一直最少。',usage:'跨地點的排名有共同特徵時，概述最常見及最少見的選項，不必先列各城市數字。',
    parts:[link('Overall,'),slot(' going to a café was the most common habit in most cities','大多數地點最常見的選項'),link(', while'),slot(' buying fresh coffee was consistently the least popular option.','持續較少的選項')],
  }),
  f('Bus use exceeded cycling in each region, and Region E was the only place where trains were not first.','先寫所有地點共同的比較，再指出唯一例外',[1,3,6],{
    formula:'[所有地點成立的比較], and [唯一的排名例外]',meaning:'每城即溶咖啡都比新鮮咖啡更常購買；阿德萊德是咖啡店到訪不排第一的唯一城市。',usage:'概覽先說各地都成立的關係，再指出一個值得留意的例外。',
    parts:[slot('Instant coffee was more widely purchased than fresh coffee in every city','所有地點成立的比較'),link(', and'),slot(' Adelaide was the only place where café visits did not occupy first position.','唯一的排名例外')],
  }),
  f('Train use was strongest in A and B, at 60% and 58% respectively, followed by C, where 55% of residents used trains.','先報告最高的兩地及各自比例，再寫緊隨其後的第三地',[2,4,5],{
    formula:'[最高的兩地], at [依次對應的比例], followed by [下一地及比例]',meaning:'墨爾本及霍巴特咖啡店到訪率約 64%、63%；悉尼以略高於 60% 緊隨其後。',usage:'幾個地點排名相近時，可先合寫最突出兩地，再以 followed by 引出下一地。',
    parts:[slot('Café-going was especially popular in Melbourne and Hobart','最高的兩地'),link(', at'),slot(' about 64% and 63% respectively','依次對應的比例'),link(', followed by'),slot(' Sydney','下一地'),link(', where'),slot(' just over three fifths of residents reported doing so.','下一地比例')],
  }),
  f('The shares were lower in D, at 45%, and E, at 42%, making it the weakest region.','比較較低的兩地，再指出其中最低者',[3,6,7],{
    formula:'[第一地比例較低], at [其比例], and [第二地], at [其比例], making it [最低排名]',meaning:'布里斯本約 56%，阿德萊德略低於 50%；阿德萊德為五城咖啡店到訪率最低。',usage:'列完較高地點後，報告較低兩地，並據數值指出最低者。',
    parts:[slot('The figures were lower in Brisbane','第一地比例較低'),link(', at'),slot(' around 56%','第一地比例'),link(', and'),slot(' Adelaide','第二地'),link(', at'),slot(' just under 50%','第二地比例'),link(', making it'),slot(' the weakest city for café visits.','最低排名')],
  }),
  f('In terms of library use, online borrowing was high in A and B, at 51% and 50%.','轉到另一種行為，再列其兩個較高地點與數值',[0,3,6],{
    formula:'In terms of [新比較範疇], [行為在兩地較高], at [兩個數值]',meaning:'由到咖啡店轉到購買咖啡，先報告霍巴特與布里斯本即溶咖啡約 54%、53%。',usage:'報告由一種行為轉到另一種行為時，先標明比較範疇，再選有代表性的地點和數值。',
    parts:[link('In terms of'),slot(' coffee purchases','新比較範疇'),link(','),slot(' instant coffee recorded relatively high figures in Hobart and Brisbane','行為在兩地較高'),link(', at'),slot(' roughly 54% and 53%.','兩個數值')],
  }),
  f('Region C stood at 40%, while A and B were lower, at 38% and 35% respectively.','用 while 比較一地與較低兩地，並保留兩地數值次序',[2,4,5],{
    formula:'[第一地數值], while [另外兩地較低], at [兩個依次對應的數值]',meaning:'阿德萊德即溶咖啡約 50%；墨爾本與悉尼稍低，依次約 48%、45%。',usage:'一地的比例略高於另外兩地時，可把後兩地合寫，並核對其數值順序。',
    parts:[slot('Adelaide stood at about 50%','第一地數值'),link(', while'),slot(' Melbourne and Sydney were slightly lower','另外兩地較低'),link(', at'),slot(' approximately 48% and 45% respectively.','兩個依次對應的數值')],
  }),
  f('By contrast, bicycle use was lower everywhere: 30% in A, 28% in B, and 25% in C.','用 By contrast 轉到各地都較低的另一種行為，再列數值',[1,5,6],{
    formula:'By contrast, [另一行為各地較低]: [按地點列出的比例]',meaning:'與即溶咖啡相比，新鮮咖啡在每城都較少；其後逐城列出約 34% 至 44%。',usage:'另一個系列在所有地點都較低時，可先概括普遍差異，再以冒號列出代表性數值。',
    parts:[link('By contrast,'),slot(' fresh coffee attracted smaller shares everywhere','另一行為各地較低'),link(':'),slot(' around 44% in Sydney, 43% in Melbourne, 39% in Hobart, and only about 34% in Brisbane and 35% in Adelaide.','按地點列出的比例')],
  }),
];
const intro=[
  quiz('這張圖表比較的三種行為是甚麼？',[
    '購買新鮮咖啡、購買即溶咖啡、到咖啡店喝咖啡或茶',
    '種植咖啡豆、出口咖啡豆、開設咖啡店',
    '在家喝茶、在辦公室喝茶、在學校喝茶',
    '購買新鮮咖啡、購買咖啡機、飲用瓶裝茶',
  ],'三個系列是兩種咖啡購買方式與一次到店喝咖啡或茶的行為，單位是居民百分比。'),
  {type:'multi',prompt:'不先列各城數值，哪兩項應放進概覽？',detail:'選兩項，再按「確認」。',options:[
    '到咖啡店在五城中的四城最常見；新鮮咖啡在每城最少',
    '即溶咖啡在每城都比新鮮咖啡更常購買；阿德萊德是到店非第一的唯一城市',
    '每個城市到咖啡店的比例都正好是 50%',
    '悉尼購買即溶咖啡的人比新鮮咖啡少',
  ],correct:[0,1],why:'概覽抓跨城市普遍成立的排名，以及阿德萊德這個唯一例外。'},
];
const route=[sequence('依照範文次序，排好四段的報告工作',[
  ['圖表介紹','交代五個澳洲城市、三種行為、過去四星期及居民百分比。'],
  ['整體概覽','先說咖啡店到訪通常最多、新鮮咖啡一直最少，再指出阿德萊德例外。'],
  ['咖啡店到訪細節','由墨爾本、霍巴特、悉尼的較高值，寫到布里斯本及阿德萊德。'],
  ['兩種咖啡購買細節','先列即溶咖啡各地數值，再對照新鮮咖啡在每城都較低。'],
],'圖表介紹 → 共通排名與例外 → 到店比例 → 即溶與新鮮咖啡購買比例。')];
const evidence=[
  quiz('哪兩個城市的咖啡店到訪比例最高？',['墨爾本約 64%，霍巴特約 63%','悉尼約 44%，墨爾本約 43%','布里斯本約 34%，阿德萊德約 35%','阿德萊德約 50%，悉尼約 45%'],'墨爾本與霍巴特的咖啡店到訪柱最高；不要混入購買咖啡的系列。'),
  quiz('哪個城市是咖啡店到訪沒有排第一的唯一例外？',['阿德萊德：即溶咖啡約 50%，到店略低於 50%','墨爾本：新鮮咖啡約 43%，到店約 64%','悉尼：即溶咖啡約 45%，到店約 61%','霍巴特：新鮮咖啡約 39%，到店約 63%'],'阿德萊德即溶咖啡購買率略高於到店率；其他四城到店較高。'),
  quiz('哪種咖啡在每個城市都比較多人購買？',['即溶咖啡都高於新鮮咖啡','新鮮咖啡都高於即溶咖啡','兩種咖啡在每城都完全相同','兩種咖啡都高於到店率'],'即溶與新鮮是兩個「購買」系列；即溶在五城都較高。'),
  quiz('悉尼咖啡店到訪率大約是多少？',['略高於 60%，排在墨爾本與霍巴特之後','約 44%，是新鮮咖啡購買率','約 45%，是即溶咖啡購買率','略低於 50%，是阿德萊德到店率'],'原文以 just over three fifths 表示悉尼到店率略高於 60%。'),
  quiz('哪個城市的咖啡店到訪率最低？',['阿德萊德，略低於 50%','布里斯本，約 56%','悉尼，略高於 60%','霍巴特，約 63%'],'阿德萊德低於 50%，比布里斯本約 56% 更低。'),
  quiz('即溶咖啡在霍巴特與布里斯本依次約有多少？',['54% 和 53%','39% 和 34%','63% 和 56%','45% 和 48%'],'54%、53% 是即溶咖啡的兩個較高值；39%、34% 屬新鮮咖啡。'),
  quiz('新鮮咖啡在五城中哪兩個城市最低？',['布里斯本約 34%，阿德萊德約 35%','悉尼約 44%，墨爾本約 43%','霍巴特約 54%，布里斯本約 53%','墨爾本約 64%，霍巴特約 63%'],'五城新鮮咖啡購買率都低於其他系列；布里斯本和阿德萊德尤其低。'),
];
const logic=[
  sequence('咖啡店到訪：由最高地點寫到最低地點',[
    ['先交代最高兩城','墨爾本約 64%，霍巴特約 63%。'],
    ['悉尼緊隨其後','到店率略高於 60%。'],
    ['布里斯本較低','約 56%。'],
    ['阿德萊德最低','略低於 50%，也是唯一到店不排第一的城市。'],
  ],'同一行為先按城市高低整理；不要把 64%、63% 寫成購買咖啡比例。'),
  sequence('咖啡購買：先即溶，再用新鮮咖啡作跨城對照',[
    ['即溶的較高兩城','霍巴特約 54%，布里斯本約 53%。'],
    ['即溶的其餘三城','阿德萊德約 50%，墨爾本約 48%，悉尼約 45%。'],
    ['轉到新鮮咖啡','它在每一個城市都低於即溶咖啡。'],
    ['逐城收束新鮮咖啡','悉尼 44%、墨爾本 43%、霍巴特 39%、布里斯本 34%、阿德萊德 35%。'],
  ],'先固定即溶咖啡的五城比較，再以新鮮咖啡作全城都較低的對照。'),
];
const transfers=[
  transfer('另一張調查圖比較五個城市居民在上個月使用巴士、火車或單車的百分比。','哪句準確介紹比較範圍？',[
    '圖表比較五城居民在上個月使用三種交通工具的比例。',
    '圖表比較三個城市居民在五年間使用巴士的實際人數。',
    '圖表比較五城政府每月投入交通的金額。',
    '圖表解釋五城居民選擇交通工具的原因。',
  ],['交代城市、人口、三種行為、月份與百分比。','把五城、三種行為及上個月都改錯。','把居民行為比例誤作政府金額。','調查數據不能直接說明選擇原因。'],[0],'原文開首先定五個城市、三種咖啡或到店行為、四星期與居民比例；新圖也要先定這四項。'),
  transfer('五城調查中，巴士在四城最多；單車在五城都最少。','哪項最適合放在整體概覽？',[
    '巴士在大多數城市最常用，單車在每城都最少見。',
    '每個城市巴士與單車的比例完全相同。',
    '單車在四城最多，巴士在五城都最少。',
    '第一城巴士剛好 61.4%，單車剛好 22.7%。',
  ],['概括跨城排名，不先堆兩個精細數字。','與已提供的高低排名相反。','把最多和最少兩個系列對調。','只有兩個細節值，未概括五城格局。'],[1],'原文概覽不列五城所有百分比，先說到咖啡店通常最多、新鮮咖啡在每城最少。'),
  transfer('五城中，甲活動在每城都多於乙活動；只有 D 城丙活動不是第一。','哪項同時保留共通關係和唯一例外？',[
    '甲在每城都高於乙；D 是丙沒有排第一的唯一城市。',
    '甲只在 D 城高於乙；丙在五城都排第一。',
    '甲與乙在各城相同；D 的丙依然排第一。',
    '甲在四城高於乙；丙在兩城沒有排第一。',
  ],['保留「每城」及「唯一」兩個範圍。','把全城共通關係縮成一城，也抹去例外。','把高低差及唯一例外都抹去。','把五城與唯一城市的數目改錯。'],[2],'原文同時說即溶咖啡在五城都高於新鮮咖啡，以及阿德萊德是到店非第一的唯一例外。'),
  transfer('A、B 兩城到店率為 64%、63%，C 為 61%。','哪句按高低和數值順序報告？',[
    'A、B 最高，分別約 64%、63%；C 以約 61% 緊隨其後。',
    'C 最高，約 64%；A、B 均低於 60%。',
    'A、B 分別約 63%、64%；C 約 61%。',
    '三城都剛好是 61%，沒有先後差別。',
  ],['先列最高兩城，數值按 A、B 次序，再帶出 C。','把 C 的排名和數值寫錯。','把 A、B 的兩個值對調。','三個值本來不同，不能說完全相同。'],[3],'原文先合寫墨爾本與霍巴特約 64%、63%，再以 followed by 帶出悉尼略高於 60%。'),
  transfer('A 城到店率 56%，B 城 49%，其他三城更高。','哪項正確指出最低城市？',[
    'A 約 56%，B 低於 50%，因此 B 在五城中最低。',
    'A 約 56%，因此 A 比 49% 的 B 更低。',
    'B 低於 50%，因此必定是五城中最高。',
    'A 與 B 都約 56%，兩城並列最低。',
  ],['比較兩個較低值後，根據其餘三城更高判定 B 最低。','56% 高於 49%，不能說 A 更低。','把低於 50% 說成最高。','把 B 的 49% 改成 56%。'],[4],'原文先說布里斯本約 56%、阿德萊德低於 50%，再判定阿德萊德的到店率最低。'),
  transfer('報告已寫完到店率，下一段要分析兩種咖啡購買率。','哪句自然地轉換比較範疇？',[
    '至於咖啡購買，先看即溶咖啡在各城市的比例。',
    '因此每個人去咖啡店的原因都完全相同。',
    '到店率的數值證明各城咖啡價格一樣。',
    '以上數值代表新鮮咖啡在所有城市最高。',
  ],['明確由到店行為轉到購買行為，再指出下一個系列。','圖表沒有提供個人動機。','到店率不能證明商品價格。','與圖上新鮮咖啡較低的普遍關係矛盾。'],[5],'原文以 In terms of coffee purchases 明確切換到購買系列，再寫即溶咖啡較高的兩城。'),
  transfer('D 城約 50%；E、F 城分別為 48%、45%。','哪句不會把後兩城的數值對調？',[
    'D 約 50%；E、F 稍低，分別約為 48%、45%。',
    'D 約 50%；E、F 稍低，分別約為 45%、48%。',
    'E 約 50%；D、F 分別為 48%、45%。',
    'D、E、F 三城的比例都剛好約 50%。',
  ],['D 稍高，E、F 依前述順序配上 48%、45%。','把 E、F 的數字倒轉。','把 D、E 的比例錯換。','E、F 比 D 略低，不能說三城相同。'],[6],'原文阿德萊德約 50%，墨爾本和悉尼依次約 48%、45%，respectively 保留對應順序。'),
  transfer('另一種活動在五個城市都低於已報告的活動。','哪項先概括普遍關係再列地點值？',[
    '相比之下，這項活動在每城都較少：A 44%、B 43%、C 39%。',
    '相比之下，這項活動只在 A 城較少，其他城市未知。',
    '相比之下，這項活動在每城都更多：A 44%、B 43%、C 39%。',
    '這項活動必定令 A、B、C 的居民更健康。',
  ],['先交代所有城市都較低，再以冒號補代表性數值。','把「五城都較低」縮成只有 A 城。','把較低的方向反寫為更多。','圖表沒有提供健康影響。'],[7],'原文用 By contrast 先說新鮮咖啡在每城都較低，再按城市列出比例。'),
  transfer('某城受訪者的 61% 曾在上月到健身室。','哪項與「略高於五分之三」相符？',[
    '約 61%，即略高於五分之三。',
    '約 61%，即略低於五分之三。',
    '約 61%，即略高於二分之一。',
    '約 61%，即接近四分之三。',
  ],['五分之三是 60%，61% 稍高於這個比例。','61% 高於 60%，不是稍低。','二分之一是 50%，差距較大。','四分之三是 75%，並不接近 61%。'],[3],'原文以 just over three fifths 表示悉尼咖啡店到訪率略高於 60%，比例換算須準確。'),
  transfer('四城的甲活動都排第一；D 城甲為 49%，乙為 50%。','概覽中的例外應怎樣寫？',[
    'D 是唯一甲沒有排第一的城市，乙略高於甲。',
    'D 的甲以 49% 排第一，乙的 50% 較低。',
    '甲在所有五城都排第一，完全沒有例外。',
    'D 城甲乙兩者都是 50%，因此並列第一。',
  ],['比較 49% 與 50%，保留 D 城唯一例外。','50% 高於 49%，所以乙較高。','D 城甲並非第一，不能抹去例外。','把甲的 49% 改成 50%。'],[2,4],'阿德萊德即溶咖啡約 50%，到店率略低於 50%，使它成為到店並非第一的唯一城市。'),
];
export default {key:'task1-bar-charts:3',meta:{topic:'五個澳洲城市的咖啡與茶習慣',summary:'先概述咖啡店到訪在多數城市最多、購買新鮮咖啡一直最少，再分到訪和購買兩組比較各城市比例。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
