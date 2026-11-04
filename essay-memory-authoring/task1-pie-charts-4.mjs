// Task 1 Pie Charts 4: Australian household energy use versus greenhouse emissions.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清兩張圖的分母，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two pie charts show how an average Australian home uses energy and how much greenhouse gas comes from each use.',
 'Overall, heating and heating water use most household energy, but greenhouse gas from different uses is spread more evenly.',
 'Heating uses much more energy than any other use, but it makes a much smaller share of greenhouse gas. On the other hand, other appliances, fridges and lights have bigger gas shares than energy shares.',
 'In the first chart, heating uses 42% of all household energy, making it the largest use.',
 'Heating water comes second at 30%. Together with heating, it uses 72% of household energy, close to three quarters.',
 'The other uses are much smaller: other appliances 15%, fridges 7%, lights 4% and cooling only 2%.',
 'In the greenhouse gas chart, heating water has the largest share, at 32%. Other appliances make 28% of the gas, almost twice their 15% energy share.',
 'But heating makes only 15% of the greenhouse gas.',
 'Fridges and lights also have bigger gas shares, at 14% and 8% in that order. Cooling is still the smallest, at 3%.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['energy consumption','uses energy','能源消耗'],['greenhouse gas emissions','greenhouse gas','溫室氣體排放'],['produced by each use','comes from each use','各用途產生']),
 v(['account for most','use most','佔大部分'],['water heating','heating water','加熱用水'],['whereas','but','而'],['more evenly distributed','spread more evenly','分布更平均']),
 v(['by far the largest consumer','uses much more energy than any other use','遠高於其他能源用途'],['produces','makes','產生'],['emissions','greenhouse gas','排放'],['by contrast','On the other hand','相對地'],['refrigeration','fridges','冷藏'],['lighting','lights','照明'],['proportionally more','bigger gas shares than energy shares','排放佔比較能源佔比大']),
 v(['makes up','uses','佔'],['total energy consumption','all household energy','總能源消耗'],['dominant category','largest use','最大用途']),
 v(['Water heating','Heating water','熱水加熱'],['second','second','第二'],['together represent','Together with heating, it uses','合計佔'],['almost three quarters','close to three quarters','接近四分之三'],['household energy demand','household energy','家庭能源需求']),
 v(['remaining categories','other uses','其他用途'],['refrigeration','fridges','冷藏'],['lighting','lights','照明'],['just','only','僅']),
 v(['emissions chart','greenhouse gas chart','排放圖'],['leading source','largest share','最大來源'],['almost double','almost twice','幾乎兩倍'],['producing','make','產生']),
 v(['however','But','然而'],['responsible for','makes','佔／造成'],['only','only','只有']),
 v(['Refrigeration','Fridges','冷藏'],['lighting','lights','照明'],['higher emission figures','bigger gas shares','較高排放份額'],['respectively','in that order','依上述順序'],['remains the smallest contributor','still the smallest','仍是最小來源']),
];
const structures=[
 f('The two pie charts compare energy consumption in an average household in Country A with the proportions of greenhouse gas emissions produced by each use.','引言同時界定能源使用與各用途造成的排放份額',[2,4,8],{formula:'The [兩張圖] compare energy consumption in [家庭對象] with the proportions of greenhouse gas emissions produced by each use',meaning:'第一圖是澳洲一般家庭能源用途份額；第二圖是相應用途的溫室氣體排放份額。',usage:'兩圖分母不同：第一圖各用途共佔總能源 100%，第二圖各用途共佔總排放 100%。',parts:[link('The'),slot(' two pie charts','兩張圖'),link(' compare energy consumption in'),slot(' an average Australian household','家庭對象'),link(' with the proportions of greenhouse gas emissions produced by each use.')]}),
 f('Overall, space heating and water heating account for most household energy use, whereas emissions are more evenly distributed.','概覽對照能源由兩項集中與排放較分散',[0,3,6],{formula:'Overall, [能源用途甲] and [能源用途乙] account for most household energy use, whereas emissions are more evenly distributed',meaning:'供暖 42% 加熱水 30%=72% 能源；排放則由熱水 32%、其他電器 28% 等較平均分攤。',usage:'「較平均」是與能源圖的集中程度相比；不要誤寫成六種排放恰好相等。',parts:[link('Overall,'),slot(' heating','能源用途甲'),link(' and'),slot(' water heating','能源用途乙'),link(' account for most household energy use, whereas emissions are more evenly distributed.')]}),
 f('Although air conditioning is by far the largest consumer of energy, it produces a much smaller share of emissions; by contrast, computers, refrigeration and lighting generate proportionally more greenhouse gas than the energy they use.','對照同一用途在兩圖的相對份額，指出方向相反的用途',[1,4,7],{formula:'Although [用途甲] is by far the largest consumer of energy, it produces a much smaller share of emissions; by contrast, [用途組乙] generate proportionally more greenhouse gas than the energy they use',meaning:'供暖能源 42% 但排放 15%；其他電器 15→28%、冷藏 7→14%、照明 4→8%，排放份額都較高。',usage:'是兩種份額的比較，不能從圓餅圖直接推算實際排放總量或設備效率。',parts:[link('Although'),slot(' heating','用途甲'),link(' is by far the largest consumer of energy, it produces a much smaller share of emissions; by contrast,'),slot(' other appliances, refrigeration and lighting','用途組乙'),link(' generate proportionally more greenhouse gas than the energy they use.')]}),
 f('In the first chart, heating makes up 40% of total energy consumption, making it the dominant category.','用第一圖精確比例支持最高能源用途',[0,5,7],{formula:'In the first chart, [用途] makes up [比例] of total energy consumption, making it the dominant category',meaning:'第一圖供暖佔家庭能源使用 42%，是六項之首。',usage:'此處 42% 屬能源圖；供暖在排放圖只有 15%，不可跨圖錯配。',parts:[link('In the first chart,'),slot(' heating','用途'),link(' makes up'),slot(' 42%','比例'),link(' of total energy consumption, making it the dominant category.')]}),
 f('Water heating is second at 29%, so these two uses together represent almost three quarters of household energy demand.','把首兩項相加後，用近四分之三作概括',[0,3,8],{formula:'[第二用途] is second at [比例], so these two uses together represent almost three quarters of household energy demand',meaning:'熱水加熱 30% 居第二；加上供暖 42% 共 72%，接近 75%。',usage:'「這兩種」指供暖與熱水加熱；72% 是能源圖兩扇區之和，不是排放份額。',parts:[slot('Water heating','第二用途'),link(' is second at'),slot(' 30%','比例'),link(', so these two uses together represent almost three quarters of household energy demand.')]}),
 f('The remaining categories are much smaller: other appliances account for 14%, refrigeration for 8%, lighting for 5%, and cooling for just 2%.','以固定順序列出能源圖其餘四項，保留省略動詞的平行結構',[1,3,7],{formula:'The remaining categories are much smaller: [甲] account for [甲值], [乙] for [乙值], [丙] for [丙值], and [丁] for just [丁值]',meaning:'能源圖其餘項目依次是其他電器 15%、冷藏 7%、照明 4%、冷氣 2%。',usage:'四數加總 28%，與供暖及熱水加熱 72% 合為 100%；順序不能與排放圖的 28%、14%、8%、3% 混淆。',parts:[link('The remaining categories are much smaller:'),slot(' other appliances','甲'),link(' account for'),slot(' 15%','甲值'),link(','),slot(' refrigeration','乙'),link(' for'),slot(' 7%','乙值'),link(','),slot(' lighting','丙'),link(' for'),slot(' 4%','丙值'),link(', and'),slot(' cooling','丁'),link(' for just'),slot(' 2%.','丁值')]}),
 f('In the emissions chart, water heating is the leading source, at 31%, while other appliances almost double their energy share, producing 27% of emissions.','在第二圖指出新首位，並將其他電器排放份額對照能源份額',[0,4,8],{formula:'In the emissions chart, [首位用途] is the leading source, at [首位值], while [另一用途] almost double their energy share, producing [排放值] of emissions',meaning:'排放圖熱水加熱 32% 最高；其他電器排放 28%，接近其能源 15% 的兩倍。',usage:'28÷15≈1.87，故 almost double；不是精確兩倍，也不是其他電器「增長」到 28%，兩圖不是時間序列。',parts:[link('In the emissions chart,'),slot(' water heating','首位用途'),link(' is the leading source, at'),slot(' 32%','首位值'),link(', while'),slot(' other appliances','另一用途'),link(' almost double their energy share, producing'),slot(' 28%','排放值'),link(' of emissions.')]}),
 f('Heating, however, is responsible for only 16%.','以插入語轉折，對照供暖能源圖中的高份額',[1,4,6],{formula:'[用途], however, is responsible for only [排放份額]',meaning:'供暖在能源圖 42% 最大，但在排放圖只佔 15%。',usage:'however 對照上一段能源份額與本段排放份額；不要把 15% 誤當能源比例。',parts:[slot('Heating','用途'),link(', however, is responsible for only'),slot(' 15%.','排放份額')]}),
 f('Refrigeration and lighting also have higher emission figures, at 13% and 9% respectively, while cooling remains the smallest contributor, at 4%.','依序配對冷藏和照明排放，最後交代冷氣仍最小',[0,3,5],{formula:'[用途甲] and [用途乙] also have higher emission figures, at [甲值] and [乙值] respectively, while [用途丙] remains the smallest contributor, at [丙值]',meaning:'排放圖冷藏 14%、照明 8%、冷氣 3%；前兩者高於各自能源份額 7%、4%。',usage:'14 對冷藏、8 對照明；cooling 3% 最低。三數均屬排放圖。',parts:[slot('Refrigeration','用途甲'),link(' and'),slot(' lighting','用途乙'),link(' also have higher emission figures, at'),slot(' 14%','甲值'),link(' and'),slot(' 8%','乙值'),link(' respectively, while'),slot(' cooling','用途丙'),link(' remains the smallest contributor, at'),slot(' 3%.','丙值')]}),
];
const intro=[
 quiz('兩張圖的百分比各以甚麼為分母？',['第一圖是家庭總能源，第二圖是家庭溫室氣體總排放','兩圖都以全球能源總量為分母','第一圖是家庭人口，第二圖是電費','兩圖都顯示不同年份的能源'],'每圖六項各合為 100%，但量度對象分別是能源使用和排放。'),
 {type:'multi',prompt:'哪兩項最適合放進整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '供暖和熱水加熱合佔能源 72%；排放分布較分散',
  '供暖能源 42% 但排放 15%；其他電器、冷藏和照明的排放份額高於能源份額',
  '供暖在兩張圖都以 42% 居首',
  '所有用途的能源和排放比例都完全相同',
 ],correct:[0,1],why:'先看兩張圖的集中程度與各用途份額方向；排放圖首位其實是熱水加熱 32%。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','第一圖家庭能源份額，第二圖同六用途的溫室氣體排放份額。'],
 ['整體概覽','能源集中在供暖及熱水加熱；排放較分散，同用途在兩圖的份額可相反。'],
 ['能源圖細節','供暖 42%、熱水 30% 共 72%；其餘四項為 15、7、4、2%。'],
 ['排放圖細節','熱水 32%、其他電器 28% 居前；供暖 15%，冷藏 14%、照明 8%、冷氣 3%。'],
],'按兩張圖分段，再在同一用途上比較兩種份額；不能把兩圖讀成年份變化。')];
const evidence=[
 quiz('供暖在能源與排放圖分別是多少？',['42% 能源、15% 排放','15% 能源、42% 排放','兩圖均 42%','30% 能源、32% 排放'],'供暖能源圖最大 42%，排放圖只有 15%。'),
 quiz('供暖與熱水加熱的能源份額合共多少？',['72%，接近四分之三','75%，精確四分之三','47%，不足一半','30%，只是熱水比例'],'42%+30%=72%，接近 75%，但不等於 75%。'),
 quiz('排放圖哪個用途最大？',['熱水加熱 32%','供暖 42%','其他電器 15%','冷氣 3%'],'排放圖熱水加熱 32% 最大；供暖在能源圖才是首位。'),
 quiz('其他電器在能源與排放圖分別是多少？',['15% 與 28%','28% 與 15%','15% 與 15%','2% 與 3%'],'其能源 15%、排放 28%，28÷15≈1.87，接近兩倍。'),
 quiz('冷藏與照明的能源→排放份額如何？',['冷藏 7→14%，照明 4→8%','冷藏 14→7%，照明 8→4%','兩者均無變化','冷藏 2→3%，照明 30→32%'],'兩用途的排放份額均為能源份額的兩倍。'),
 quiz('冷氣在兩圖如何？',['能源 2%、排放 3%，兩圖都最小','能源 3%、排放 2%，兩圖都最大','兩圖均 15%','能源 42%、排放 32%'],'冷氣是六項中最小，能源 2%、排放 3%。'),
 quiz('「其他電器幾乎兩倍」比較的是甚麼？',['排放份額 28% 相對能源份額 15%','2000 年與 2010 年能源','澳洲與其他國家家庭數','排放噸數與電費金額'],'這是兩張不同量度圖的份額比，並非時間上的增長。'),
];
const logic=[
 sequence('先把六個用途在兩張圖配準',[
  ['供暖','能源 42% 最大；排放 15%，明顯較低。'],
  ['熱水加熱','能源 30% 第二；排放 32% 第一。'],
  ['其他電器','能源 15%；排放 28%，約 1.87 倍。'],
  ['冷藏／照明／冷氣','能源 7／4／2%；排放 14／8／3%。'],
 ],'同一用途在兩張圖中的位置與份額可以不同，讀數前先看圖題。'),
 sequence('由圖中份額寫出概覽及細節',[
  ['能源集中','供暖 42% + 熱水 30%=72%，接近四分之三。'],
  ['排放首位改變','熱水 32% 居首，其他電器 28% 居第二。'],
  ['相對份額','供暖排放份額遠低於其能源份額；其他電器、冷藏、照明相反。'],
  ['避免誤讀','兩圖不是不同年份，也不能只憑百分比計出實際能源量或排放噸數。'],
 ],'描述兩種分布的差異；「幾乎兩倍」只指份額的數值關係。'),
];
const transfers=[
 transfer('兩圖分別顯示一個國家家庭的能源用途份額和相應排放份額。','哪句引言清楚區分兩種量度？',['兩個圓餅圖比較家庭能源用途與各用途產生的排放比例。','兩個圓餅圖比較 2000 和 2010 年的能源用量。','兩圖都只顯示家庭人數。','圖表解釋排放增加的確切原因。'],['能源與排放兩種分母都清楚。','兩圖不是時間序列。','扇區代表用途。','沒有原因數據。'],[0],'原文引言分清澳洲家庭能源圖與溫室氣體排放圖。'),
 transfer('A、B 合佔能源 70%；排放在六用途間較平均。','哪句概覽保留兩圖分布差別？',['A 和 B 佔多數能源，但排放在各用途間分布較平均。','A 和 B 佔全部排放的 70%，能源則完全平均。','六用途的排放比例完全一樣。','A 和 B 的能源比例都只有 5%。'],['能源集中、排放較分散都表達。','把兩種分母對調。','較平均不等於相等。','兩項合計 70%。'],[1],'原文供暖及熱水合佔能源 72%，排放較平均。'),
 transfer('A 用途的能源 40%、排放 16%；B、C 的排放份額各高於自身能源份額。','哪句保留同用途跨圖的反向對照？',['A 能源份額最大但排放份額較小；相對地，B、C 的排放份額高於能源份額。','A 的排放份額是 40%，能源只 16%。','B、C 的排放份額都低於能源份額。','三個用途在兩圖的份額完全一致。'],['同用途兩圖的方向均準確。','A 的兩個份額倒置。','B、C 方向相反。','題目說份額不同。'],[2],'原文供暖 42% 能源／15% 排放，其他電器、冷藏、照明的排放份額較高。'),
 transfer('第一張能源圖中，A 用途 40%，高於其他五項。','哪句以百分比支持第一圖首位？',['在第一圖中，A 佔總能源 40%，是最大用途。','在第二張排放圖中，A 佔總能源 40%。','A 在六項中最小。','40% 是家庭總排放而非能源。'],['圖號、分母、數值、排名都配準。','圖號及分母不符。','A 最大。','數值屬能源圖。'],[3],'原文第一圖供暖能源份額 42%，居首。'),
 transfer('能源圖 A 42%、B 30%，分別第一、第二。','哪句合計與措辭都準確？',['A 與 B 共佔能源 72%，接近四分之三。','A 與 B 共佔能源 75%，恰好四分之三。','A 與 B 共佔排放 72%。','A 與 B 共佔能源 30%。'],['42+30=72，接近而非等於 75%。','合計不是 75%。','題目說能源圖。','30 只屬 B。'],[4],'原文供暖 42% 加熱水 30% 為 72%，almost three quarters。'),
 transfer('能源圖剩下四項依次為 C 15%、D 7%、E 4%、F 2%。','哪句保持四用途與數值順序？',['C、D、E、F 分別佔能源的 15%、7%、4%、2%。','C、D、E、F 分別佔能源的 2%、4%、7%、15%。','四項各佔 15%。','F 是最大能源用途，佔 42%。'],['四組名稱與比例逐一配對。','順序顛倒。','四值不同。','F 只有 2%。'],[5],'原文其他電器 15%、冷藏 7%、照明 4%、冷氣 2%。'),
 transfer('排放圖 A 32% 居首，B 排放 28%，但 B 能源只有 15%。','哪句不把兩圖讀成時間增長？',['排放圖 A 以 32% 居首；B 排放份額 28%，接近其能源份額 15% 的兩倍。','B 從 15% 增長到 28%，表示十年間排放上升。','A 在能源圖也一定是 32%。','B 的能源份額是 28%，排放是 15%。'],['兩圖份額與約 1.87 倍關係都準確。','兩圖沒有年份。','未提供 A 能源 32%。','B 的兩份額倒置。'],[6],'原文熱水排放 32% 居首；其他電器排放 28% 對能源 15%，約 1.87 倍。'),
 transfer('能源圖 A 是 40% 的最大用途，排放圖 A 卻只有 16%。','哪句以轉折提醒分母已換？',['然而，A 只佔排放的 16%。','因此，A 也佔能源的 16%。','然而，A 佔排放的 40%。','A 在兩圖都完全相同。'],['轉折接住能源首位，改寫排放圖較低值。','16% 屬排放。','排放不是 40%。','40 與 16 不同。'],[7],'原文供暖能源 42% 最大，排放只有 15%。'),
 transfer('排放圖 D 14%、E 8%，F 3% 最低。','哪句讓 respectively 與最小值都配對正確？',['D、E 的排放分別為 14%、8%；F 以 3% 最低。','D、E 的排放分別為 8%、14%；F 以 3% 最高。','D、E、F 在排放圖完全相同。','F 的排放是 14%，D 只有 3%。'],['D 對 14、E 對 8、F 對最小的 3。','D/E 及 F 排名錯。','三值不同。','D/F 對調。'],[8],'原文冷藏排放 14%、照明 8%、冷氣 3% 最低。'),
 transfer('某用途能源 12%、排放 23%。','哪句對「幾乎兩倍」最嚴謹？',['排放份額約為能源份額的 1.92 倍，可說幾乎兩倍。','兩份額精確相等。','排放份額恰好是能源份額兩倍。','12% 比 23% 大。'],['23÷12≈1.92，接近但非精確 2。','兩值不同。','精確兩倍應是 24%。','12 小於 23。'],[6],'原文其他電器排放 28% 對能源 15%，約 1.87 倍。'),
];
const balancedTransferOptions=[
 ['兩圖比較家庭各用途的能源份額與排放份額。','兩圖分別比較家庭在2000及2010年的能源用量。','兩圖分別比較家庭人數及每戶成員的數目。','兩圖解釋家庭能源排放增加的確切原因。'],
 ['A與B佔能源多數，排放份額則分布得較平均。','A與B佔排放多數，能源份額則分布得較平均。','六種用途的排放份額完全相等，沒有差異。','A與B的能源份額各僅佔5%，合計遠非多數。'],
 ['A能源佔40%、排放佔16%；B與C的排放份額反而較高。','A排放佔40%、能源佔16%；B與C的排放份額較高。','A能源佔40%、排放佔16%；B與C的排放份額更低。','A、B與C在兩圖的能源及排放份額都完全相同。'],
 ['第一圖A佔能源40%，高於另外五項用途。','第二圖A佔能源40%，高於另外五項用途。','第一圖A佔能源40%，卻是六項中最小。','第一圖A佔排放40%，高於另外五項用途。'],
 ['A與B合佔能源72%，接近但不足四分之三。','A與B合佔能源75%，恰好是四分之三。','A與B合佔排放72%，接近四分之三。','A與B合佔能源30%，兩者比其餘還少。'],
 ['C、D、E、F的能源份額依次是15%、7%、4%、2%。','C、D、E、F的能源份額依次是2%、4%、7%、15%。','C、D、E、F的能源份額全部都是15%。','C、D、E、F中，F以42%成為最大能源用途。'],
 ['排放圖A佔32%居首；B的28%約為其能源15%的兩倍。','B由能源15%升至排放28%，顯示十年間排放上升。','排放圖A佔32%居首，能源圖也必定佔32%。','B能源佔28%，排放僅15%，兩圖的數值對調。'],
 ['然而A的排放份額只有16%，低於能源40%。','因此A的能源份額只有16%，低於排放40%。','然而A的排放份額仍佔40%，與能源相同。','A在兩張圖都佔40%，兩個份額完全一樣。'],
 ['D排放14%、E排放8%；F僅排放3%，是全圖最低。','D排放8%、E排放14%；F排放3%，三者最高。','D、E及F排放份額全相同，都恰好是14%。','F排放14%、D排放3%；兩個用途的數值對調。'],
 ['排放23%約是能源12%的1.92倍，接近兩倍。','排放23%與能源12%數值相同，兩份額相等。','排放23%恰好是能源12%的兩倍，完全精確。','能源12%的份額大於排放23%，因此差額為負。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
transfers[2].explanations[0]='A 的兩個份額及 B、C 的跨圖方向都與給定資料一致。';
export default {key:'task1-pie-charts:4',meta:{topic:'澳洲家庭能源用途與溫室氣體排放份額',summary:'分清能源圖與排放圖的兩種分母；供暖能源 42% 但排放 15%，熱水排放居首，其他電器 28% 接近其能源 15% 的兩倍。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
