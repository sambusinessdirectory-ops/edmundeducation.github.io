// Task 1 Bar Charts 2: authored from the 1968/2018 weekly-income chart and model report.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看圖表或回想報告，再依原文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
  'The bar chart shows how families in one country spent their weekly income on eight kinds of things in 1968 and 2018. The figures are percentages.',
  'Overall, families spent their money quite differently in the two years, 50 years apart.',
  'In 1968, food took up much more of the budget than anything else. By 2018, its share had dropped a lot, while free-time activities, housing and travel took larger shares.',
  'A few of the smaller spending groups went down, but spending on things for the home stayed about the same.',
  'In 1968, families spent about 35% of their income on food. That was over three times the share for housing or clothes and shoes, each about 10%.',
  'Spending on free-time activities was just below 10%, and travel was about 8%. Both were fairly small.',
  'Things for the home and personal items each took about 7–8% of income. Fuel and energy took a little less, at about 6%.',
  'By 2018, spending on free-time activities was the biggest share, at just over 20%.',
  'Housing rose from about 10% to about 19%, nearly twice as much as before. Travel rose to about 14%.',
  'But food fell to about 17%, clothes and shoes fell by half to 5%, and personal items, fuel and energy each fell to about 4%.',
  'Spending on things for the home hardly changed and stayed near 7%.',
];
const vocabulary=[
  v(['compares','shows','比較／展示'],['proportions','percentages','比例'],['categories','kinds of things','支出類別']),
  v(['household spending','families spent their money','家庭支出'],['shifted noticeably','quite differently','明顯改變'],['50-year period','50 years apart','相隔五十年']),
  v(['by far the dominant item','much more of the budget than anything else','遠遠最主要的項目'],['share fell sharply','share had dropped a lot','比例大幅下降'],['leisure','free-time activities','休閒活動'],['transport','travel','交通／出行'],['much more significant','larger shares','佔比顯著增加']),
  v(['Several smaller categories','A few of the smaller spending groups','幾個較小類別'],['declined','went down','下降'],['household goods','things for the home','家居用品'],['remained broadly stable','stayed about the same','大致穩定']),
  v(['allocated','spent','分配／花費'],['more than three times the proportion','over three times the share','比例超過三倍'],['clothing and footwear','clothes and shoes','服裝及鞋類'],['at around','about','大約']),
  v(['Leisure','free-time activities','休閒'],['transport','travel','交通'],['relatively modest','fairly small','相對較低'],['just under','just below','略低於'],['respectively','free-time activities was just below 10%, and travel was about 8%','按先後順序分別對應']),
  v(['Household goods','Things for the home','家居用品'],['personal goods','personal items','個人用品'],['accounted for similar shares','each took about 7–8%','佔比相近'],['fuel and power','Fuel and energy','燃料和能源'],['slightly lower','a little less','稍低']),
  v(['leisure','free-time activities','休閒'],['largest category','biggest share','最大支出類別'],['rising to','at','升至'],['just over a fifth','just over 20%','略高於五分之一']),
  v(['almost doubled','nearly twice as much as before','幾乎翻倍'],['approximately','about','大約'],['transport increased','Travel rose','交通支出增加']),
  v(['In contrast','But','相比之下'],['dropped','fell','下降'],['clothing and footwear','clothes and shoes','服裝及鞋類'],['halved','fell by half','減半'],['personal goods','personal items','個人用品'],['fuel and power','fuel and energy','燃料和能源']),
  v(['Household goods','things for the home','家居用品'],['changed very little','hardly changed','變化很小'],['remaining near','stayed near','維持在附近']),
];

const structures=[
  f('The line graph compares the share of workers using buses in 2010 and 2020.','介紹比較的比例、對象與年份',[1,4,7],{
    formula:'The [圖表類型] compares [所比較的比例與對象] in [年份]',meaning:'先交代圖表比較八類每週支出所佔收入的比例，以及 1968、2018 兩個年份。',usage:'介紹比例圖表時，說清楚比例以甚麼為分母、比較哪些類別及年份。',
    parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares'),slot(' the proportions of weekly income that families in one country spent on eight categories','所比較的比例與對象'),link(' in'),slot(' 1968 and 2018.','年份')],
  }),
  f('Overall, travel habits shifted noticeably over the ten-year period.','用 Overall 先概括整段時間的明顯變化',[0,3,10],{
    formula:'Overall, [討論對象] shifted [變化程度] over [期間]',meaning:'概覽先指出 50 年間家庭支出結構明顯轉變，暫不列個別類別數值。',usage:'多個類別在兩個時間點的組合有明顯變化時，先說整體格局，再交代細節。',
    parts:[link('Overall,'),slot(' household spending','討論對象'),link(' shifted'),slot(' noticeably','變化程度'),link(' over'),slot(' the 50-year period.','期間')],
  }),
  f('Buses were the leading mode in 2010, but their share dropped by 2020, when trains had become more common.','先說原本最大的類別，再用 but 與 when 帶出新格局',[1,3,8],{
    formula:'[早期最大類別], but [其後下降], when [其他類別變得重要]',meaning:'食物在 1968 年遠遠最多，但到 2018 年佔比大跌；同時休閒、住房和交通的重要性增加。',usage:'整體主導類別隨時間下降，而其他類別上升時，先說早期格局，再交代轉變。',
    parts:[slot('Food was by far the dominant item in 1968','早期最大類別'),link(', but'),slot(' its share fell sharply by 2018','其後下降'),link(', when'),slot(' leisure, housing and transport had become much more significant.','其他類別變得重要')],
  }),
  f('Several smaller activities declined, while reading stayed broadly stable.','用 while 對照下降與大致穩定的類別',[1,2,9],{
    formula:'[若干組別下降], while [另一組別保持穩定]',meaning:'幾個較小的支出類別下降，但家居用品所佔比例大致穩定。',usage:'一組數據下降而另一組大致不變時，用 while 突出不同走勢。',
    parts:[slot('Several smaller categories declined','下降的類別'),link(', while'),slot(' household goods remained broadly stable.','大致穩定的類別')],
  }),
  f('In 2010, schools spent 35% of the budget on staff, more than three times the proportion for technology or materials, each at around 10%.','用倍數比較主項與較小項，並交代兩者約數',[0,5,8],{
    formula:'In [年份], [主要類別佔比], more than [倍數比較], each at around [較小類別佔比]',meaning:'1968 年食物約佔 35%；這超過住房或服裝鞋類各約 10% 的三倍。',usage:'某類別的比例明顯高於其他類別時，可用倍數比較，但倍數必須由圖上數值支持。',
    parts:[link('In'),slot(' 1968','年份'),link(','),slot(' families allocated about 35% of their income to food','主要類別佔比'),link(', more than three times'),slot(' the proportion spent on housing or clothing and footwear','比較對象'),link(', each at around'),slot(' 10%.','較小類別佔比')],
  }),
  f('Cycling and walking were modest, at 8% and 6% respectively.','以 respectively 把兩個類別按順序配對兩個數值',[3,4,6],{
    formula:'[兩類別的總體評價], at [兩個數值] respectively',meaning:'休閒與交通都屬較小支出；略低於 10% 和約 8% 依前述順序各自對應。',usage:'一次列兩個類別及兩個數值時，確認先後順序後才用 respectively。',
    parts:[slot('Leisure and transport were also relatively modest','兩類別的總體評價'),link(', at'),slot(' just under 10% and about 8%','兩個數值'),link(' respectively.')],
  }),
  f('Tea and coffee accounted for similar shares, at 20–22%, while juice was lower, at around 9%.','先把相近的兩組合寫，再以 while 對照較低第三組',[3,5,10],{
    formula:'[兩類別] accounted for similar shares, at [相近數值], while [第三類別較低], at [第三數值]',meaning:'家居用品與個人用品同在約 7% 至 8%；燃料能源較低，約 6%。',usage:'兩組比例接近而第三組較低時，先合寫相近組，再對照第三組。',
    parts:[slot('Household goods and personal goods','兩類別'),link(' accounted for similar shares, at'),slot(' roughly 7–8%','相近數值'),link(', while'),slot(' fuel and power was slightly lower','第三類別較低'),link(', at around'),slot(' 6%.','第三數值')],
  }),
  f('By 2020, trains had become the most popular mode, rising to just over a third of trips.','交代最後年份的最高排名，並補上上升後佔比',[2,4,10],{
    formula:'By [最後年份], [類別成為最大], rising to [末期佔比]',meaning:'到 2018 年休閒成為最大支出項目，佔比升至略高於五分之一。',usage:'某類別到最後時間點成為最大時，同時交代它的末期比例。',
    parts:[link('By'),slot(' 2018','最後年份'),link(','),slot(' leisure had become the largest category','類別成為最大'),link(', rising to'),slot(' just over a fifth of income.','末期佔比')],
  }),
  f('Bus use almost doubled to 18%, and train use increased to about 25%.','並列兩類上升，但分別保留倍增與一般增加的程度',[4,6,9],{
    formula:'[第一類近乎翻倍] to [第一末值], and [第二類增加] to [第二末值]',meaning:'住房幾乎翻倍至約 19%，交通則增加至約 14%；兩者都是上升，但程度不同。',usage:'兩個類別都增加、幅度不相同時，分別寫出變化程度與末值。',
    parts:[slot('Housing almost doubled','第一類近乎翻倍'),link(' to'),slot(' approximately 19%','第一末值'),link(', and'),slot(' transport increased','第二類增加'),link(' to'),slot(' about 14%.','第二末值')],
  }),
  f('In contrast, car use fell to 30%, walking halved to 10%, and cycling dropped to 5%.','用 In contrast 轉到下降類別，並分別報告三組末值',[2,3,8],{
    formula:'In contrast, [第一類下降], [第二類減半], and [其餘類別下降]',meaning:'與休閒、住房和交通上升相反，食物降至約 17%、服裝鞋類減半至 5%，其餘兩類降至約 4%。',usage:'前段已寫上升組別，接着要概括多個下降類別時，可分項報出各自的末值。',
    parts:[link('In contrast,'),slot(' food dropped to around 17%','第一類下降'),link(','),slot(' clothing and footwear halved to 5%','第二類減半'),link(', and'),slot(' personal goods and fuel and power both fell to about 4%.','其餘類別下降')],
  }),
  f('Spending on books changed very little, remaining near 7%.','主句說變化很小，再用 remaining 補上維持的約數',[1,6,7],{
    formula:'[某類別變化很小], remaining near [約數]',meaning:'家居用品比例變化很小，2018 年仍約為 7%。',usage:'一項數據近乎穩定時，可先描述變化程度，再補充其大致水平。',
    parts:[slot('Household goods changed very little','某類別變化很小'),link(', remaining near'),slot(' 7%.','約數')],
  }),
];
const intro=[
  quiz('圖表的百分比以甚麼為基礎？',[
    '一個國家的家庭每週收入，用於八種支出的比例',
    '八個國家的人口，參與各項活動的比例',
    '每戶家庭每月花費的實際美元金額',
    '1968 至 2018 年每一年的家庭總收入',
  ],'縱軸是每週收入所佔百分比；圖表只比較 1968 與 2018 兩年，不是五十年間逐年的走勢。'),
  {type:'multi',prompt:'概覽應先鎖定哪兩項主要變化？',detail:'選兩項，再按「確認」。',options:[
    '食物由最主要支出大幅回落；休閒、住房和交通的重要性上升',
    '部分較小類別下降，而家居用品比例大致穩定',
    '八個類別在五十年間都以相同速度增加',
    '2018 年食物仍佔 35%，沒有任何變動',
  ],correct:[0,1],why:'先概括支出重心轉移及穩定的例外；個別百分比留到細節段。'},
];
const route=[sequence('依照範文次序，排好四段報告',[
  ['圖表介紹','說明 1968、2018 兩年，以及家庭每週收入在八類支出中的比例。'],
  ['整體概覽','指出食物由主導地位下降；休閒、住房、交通上升，家居用品較穩定。'],
  ['1968 年細節','先列食物 35%，再比較住房、服裝鞋類及幾個較小類別。'],
  ['2018 年細節','按最大休閒、上升的住房交通、下降的類別及穩定的家居用品收束。'],
],'圖表介紹 → 支出格局轉移 → 1968 年基準 → 2018 年新格局。')];
const evidence=[
  quiz('1968 年食物約佔每週收入多少？',['約 35%，超過住房或服裝鞋類的三倍','約 17%，低於交通','約 10%，與住房完全相同','約 5%，是最小支出'],'食物在 1968 年遠遠最高，約 35%；住房和服裝鞋類各約 10%。'),
  quiz('1968 年休閒與交通的比例，依次約是多少？',['略低於 10% 與約 8%','約 22% 與約 14%','各約 35%','約 8% 與略低於 10%'],'respectively 保留「休閒在前、交通在後」的順序；22% 與 14% 屬 2018 年。'),
  quiz('1968 年家居用品、個人用品與燃料能源，哪項比較正確？',['前兩者約 7–8%，燃料能源約 6%，略低','三者都各約 35%','燃料能源約 20%，遠高於其他兩者','家居用品是零，個人用品約 14%'],'原文將相近的兩組合寫，再以 while 對照稍低的燃料能源。'),
  quiz('2018 年哪一類支出成為最大？',['休閒，略高於每週收入的五分之一','食物，仍佔 35%','燃料能源，約 25%','服裝鞋類，約 20%'],'休閒由 1968 年略低於 10% 升至 2018 年略高於 20%，成為最大類別。'),
  quiz('2018 年住房與交通的支出比例約為多少？',['住房 19%；交通 14%','住房 5%；交通 4%','住房 35%；交通 22%','住房 14%；交通 19%'],'住房幾乎翻倍至約 19%；交通增加至約 14%，兩者不可對調。'),
  quiz('哪一項同時描述 2018 年的下降與大致穩定類別？',['食物約 17%、服裝鞋類 5%；家居用品仍約 7%','食物約 35%、服裝鞋類 10%；家居用品升至 22%','食物和家居用品都降至 4%','服裝鞋類升至 19%，家居用品變為零'],'食物與服裝鞋類下降，家居用品卻變化很小，仍約 7%。'),
];
const logic=[
  sequence('1968 年細節：由最大支出轉到較小類別',[
    ['食物主導','食物約佔 35%，遠高於其他項目。'],
    ['住房與服裝鞋類','兩類各約 10%；食物是它們的三倍多。'],
    ['休閒與交通','依次略低於 10% 與約 8%。'],
    ['更小的三類','家居用品與個人用品約 7–8%，燃料能源約 6%。'],
  ],'先寫最顯眼的 35%，再按大小和相近數值分組；不要把 2018 年的值混進 1968 年。'),
  sequence('2018 年細節：按上升、下降與穩定整理新格局',[
    ['休閒成為最大','升至收入的五分之一以上。'],
    ['住房與交通上升','住房近乎翻倍至約 19%；交通升至約 14%。'],
    ['多項支出下降','食物約 17%，服裝鞋類 5%，個人用品與燃料能源約 4%。'],
    ['家居用品為例外','變化很小，仍接近 7%。'],
  ],'同一年內分上升、下降、穩定三組；保留最重要的末期比例。'),
];
const transfers=[
  transfer('另一張圖表比較 2000、2020 年家庭每月開支在六類項目中的百分比。','哪句準確介紹圖表及分母？',[
    '圖表比較兩個年份家庭每月開支在六類項目中的比例。',
    '圖表列出每戶家庭每月收入的實際美元總額。',
    '圖表比較六個國家在二十年內每一年的物價。',
    '圖表證明家庭為甚麼偏好某一類商品。',
  ],['交代年份、家庭開支、六類項目及百分比基礎。','把開支比例誤當收入金額。','把六類項目誤當六國，又捏造逐年資料。','圖表只給數據，不能證明消費動機。'],[0],'原文第 1 句說的是每週收入花在八類項目上的比例；引言必須鎖定百分比的分母。'),
  transfer('一張圖顯示家庭在十年間由主要買實體書，轉向數碼內容。','哪項概覽先說整體格局？',[
    '整體而言，家庭的內容支出結構在十年間明顯改變。',
    '第一年實體書支出剛好為 13.7%。',
    '數碼內容上升一定是因為某家公司減價。',
    '所有類別的支出在每一年都完全相同。',
  ],['先概括明顯轉移，細節可在後段補數字。','只列單一細節，沒有概括整體轉變。','圖表沒有提供減價原因。','與已說明的結構轉變矛盾。'],[1],'原文概覽先指出 50 年間家庭支出結構明顯轉變，再說哪些類別升降。'),
  transfer('某圖中 A 在早期遠高於其他組；到末年 A 大跌，B、C 上升。','哪項同時保留早期主導與後期轉移？',[
    '早期 A 遠遠最多，但末年大跌，B 和 C 變得更重要。',
    'A 在兩個年份都維持不變，B 和 C 完全消失。',
    'B 和 C 早期遠遠最多，末年兩者都跌至零。',
    'A、B、C 在早期和末年比例完全相等。',
  ],['先說早期主導者，再說其下降及其他組上升。','把下降和上升都寫反。','將早期主導者錯換成 B、C。','圖表已給高低差異，不能說全相等。'],[2],'原文以食物 1968 年的主導位置，對照 2018 年食物下降及休閒、住房、交通上升。'),
  transfer('A、B 兩個較小組別下降，C 幾乎沒有變化。','哪項最清楚對照不同走勢？',[
    'A、B 的比例下降，而 C 大致保持穩定。',
    'A、B、C 的比例都大幅增加。',
    'C 的比例下降，而 A、B 完全不變。',
    '三組在每一年都剛好有同一數值。',
  ],['用下降對照穩定，沒有把三組硬寫成同一趨勢。','三組的變化方向都被寫錯。','把下降與穩定的組別對調。','資料只描述走勢，沒有支持數值完全相同。'],[3],'原文「幾個較小類別下降，家居用品大致穩定」以 while 對比，不能統稱全部下降。'),
  transfer('某年度 A 佔 36%，B 和 C 各佔 10%。','哪句正確運用倍數比較？',[
    'A 約佔 36%，超過 B 或 C 各自比例的三倍。',
    'A 約佔 36%，剛好是 B 和 C 總和的一半。',
    'B 和 C 各佔 10%，都是 A 的三倍。',
    'A、B、C 三組都各約佔 36%。',
  ],['36% 大於 10% 的三倍，且逐一比較 B、C。','36% 並非 20% 的一半。','把主次及倍數方向倒轉。','把 B、C 的 10% 錯寫成 36%。'],[4],'原文 1968 年食物約 35%，超過住房或服裝鞋類各約 10% 的三倍；倍數方向必須核對。'),
  transfer('圖表先列跑步、游泳，數值依次為 12% 和 8%。','哪句正確保留依次對應？',[
    '跑步和游泳的比例分別為 12% 和 8%。',
    '跑步和游泳的比例分別為 8% 和 12%。',
    '兩項活動都佔 12%，沒有差別。',
    '游泳約佔 12%，跑步比例不明。',
  ],['按先說跑步、後說游泳的次序配上 12%、8%。','把兩個百分比對調。','把不同的兩個值寫成同一值。','忽略已提供的跑步值，又對調游泳值。'],[5],'原文休閒和交通依次略低於 10% 及約 8%；respectively 使兩個值的對應明確。'),
  transfer('新圖中 X、Y 分別約 20%、21%；Z 約 9%。','哪項最有效率地分組報告？',[
    'X、Y 比例相近，約 20% 至 21%；Z 較低，約 9%。',
    'X 約 9%，Y 與 Z 都約 21%。',
    'X、Y、Z 各約 20%，沒有高低。',
    'Z 遠高於 X、Y，約有 90%。',
  ],['先合寫相近的 X、Y，再對照較低的 Z。','把 Z 的 9% 錯放到 X。','忽略 Z 明顯較低。','把 9% 誇大為 90%，高低方向也錯。'],[6],'原文把家居用品和個人用品合寫為約 7–8%，再對照燃料能源約 6%。'),
  transfer('某類支出在 2020 年升至 22%，成為全部類別中最高。','哪句同時保留末年排名及比例？',[
    '到 2020 年，該類成為最大支出，佔比升至 22%。',
    '到 2020 年，該類跌至 22%，成為最小支出。',
    '該類在早期一直最高，末年數值卻未知。',
    '22% 是每戶實際花費的美元金額。',
  ],['同時說出最後年份、最大排名及末期百分比。','把上升改成下降，最大改成最小。','漏掉已知的末年比例和排名。','百分比不是實際美元金額。'],[7],'原文休閒到 2018 年升至略高於五分之一，並成為最大支出類別。'),
  transfer('甲類由 10% 增至 19%；乙類由 8% 增至 14%。','哪句保留兩類不同的上升幅度？',[
    '甲類近乎翻倍至 19%，乙類上升至 14%。',
    '甲類由 19% 跌至 10%，乙類由 14% 跌至 8%。',
    '甲乙兩類都剛好翻倍，最後各佔 19%。',
    '甲類沒有變化，乙類也沒有變化。',
  ],['甲幾乎翻倍；乙上升，但不到翻倍。','把時間方向及增減全部顛倒。','乙由 8% 至 14% 並非剛好翻倍。','兩類均有明顯上升。'],[8],'原文住房幾乎翻倍至 19%，交通增加至 14%；兩者不應寫成同一幅度。'),
  transfer('早期多組上升；另有 A 降至 17%、B 減半至 5%、C 和 D 降至約 4%。','哪句正確整理下降組別？',[
    '相比之下，A 約 17%，B 減半至 5%，C、D 各約 4%。',
    'A 升至 17%，B 也升至 5%，C、D 變成最大。',
    'A、B、C、D 都保持早期原值，沒有變化。',
    'B 增加一倍至 5%，A、C、D 的數值全未知。',
  ],['以「相比之下」轉到下降組，逐組保留末值與減半幅度。','把多組下降全部改寫為上升。','與已知下降或減半相矛盾。','把 B 的減半改成倍增，且漏掉其他數值。'],[9],'原文在寫完休閒、住房、交通上升後，以 In contrast 轉到食物、服裝鞋類及其他下降項目。'),
  transfer('某項目兩年佔比分別為 7% 與 7.2%。','哪句最準確描述這項目？',[
    '該項目變化很小，比例仍接近 7%。',
    '該項目由 7% 大幅上升至 72%。',
    '該項目比例減半，跌至約 3.5%。',
    '兩年之間完全沒有任何數值差異。',
  ],['7% 與 7.2% 很接近；大致穩定較準確。','把 7.2% 誤讀成 72%。','沒有減半，第二年反而略高。','0.2 個百分點的差異仍存在。'],[10],'原文家居用品比例變化很小，維持約 7%；不能誤說完全不變或大幅上升。'),
];
const balancedTransferOptions=[
 ['圖表比較兩年家庭每月六類開支各佔多少比例。','圖表比較兩年家庭每月六類收入各佔多少比例。','圖表比較六國二十年間每一年的物價變化。','圖表解釋家庭偏好六類商品的心理原因。'],
 ['整體而言，家庭由實體書轉向數碼內容，結構改變。','整體而言，實體書與數碼內容每年所佔都相同。','整體而言，數碼上升必然由單一公司減價造成。','整體而言，兩類內容支出在十年內完全沒有改變。'],
 ['早期甲遠最多，末年大跌，乙丙的重要性上升。','早期甲遠最多，末年不變，乙丙都完全消失。','早期乙丙最多，末年兩組都降至接近零。','早期甲乙丙相等，末年三組仍完全一樣。'],
 ['甲乙比例下降，丙大致不變，三者走勢不同。','甲乙丙比例都大幅增加，三者走勢相同。','丙比例下降，甲乙完全沒有任何數值變化。','甲乙丙每年都剛好相同，沒有任何差別。'],
 ['甲約三成六，超過乙或丙各自比例的三倍。','甲約三成六，只及乙丙比例總和的一半。','乙丙各一成，兩者各是甲比例的三倍。','甲乙丙三組比例相同，都約為三成六。'],
 ['跑步和游泳依次佔一成二與百分之八。','跑步和游泳依次佔百分之八與一成二。','跑步和游泳比例相同，都約為一成二。','游泳約佔一成二，跑步比例則沒有提供。'],
 ['甲乙相近，約兩成至兩成一；丙約百分之九。','甲約百分之九；乙丙都約為兩成一。','甲乙丙三組各約兩成，彼此沒有高低。','丙約九成，遠遠高於甲乙兩組比例。'],
 ['二〇二〇年該類升至兩成二，成為最大支出。','二〇二〇年該類降至兩成二，成為最小支出。','該類早期一直最高，二〇二〇年比例未知。','兩成二代表每戶實際花費的美元金額。'],
 ['甲由一成近乎翻倍至近兩成，乙升至一成四。','甲由兩成降至一成，乙由一成四降至百分之八。','甲乙兩組都剛好翻倍，末年同佔近兩成。','甲與乙兩組在整段期間都完全沒有變化。'],
 ['相比之下，甲降至一成七，乙減半至百分之五。','相比之下，甲升至一成七，乙也升至百分之五。','相比之下，甲乙丙丁均保持起始比例不變。','相比之下，乙翻倍至百分之五，其餘值未知。'],
 ['比例由百分之七至七點二，整體變化很小。','比例由百分之七升至七成二，增幅很大。','比例由百分之七減半，跌至三點五。','兩年的比例完全相同，沒有任何差異。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-bar-charts:2',meta:{topic:'家庭每週支出比例',summary:'比較 1968 年與 2018 年支出結構的轉變，先概述食物下降與休閒、住房及交通上升，再按年份列出比例。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
