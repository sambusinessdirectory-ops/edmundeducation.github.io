// Task 1 Tables 2: Fairtrade coffee and banana sales, five markets, 1999/2004, €m.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'分開看咖啡與香蕉，每表單位同為百萬歐元。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先各表概覽，再按咖啡、香蕉兩段交代國家數據。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The tables show Fairtrade coffee and banana sales, in millions of euros, in five European countries in 1999 and 2004.',
 'Overall, coffee sales rose in all five countries. The UK had the biggest rise and sold the most coffee in 2004.',
 'Banana sales were more mixed: Switzerland stayed the largest and grew a lot, but Sweden and Denmark sold less.',
 'For coffee in 1999, Switzerland sold the most at 3 million euros. Denmark was next at 1.8 million and the UK at 1.5 million.',
 'By 2004, UK coffee sales had jumped to 20 million euros, more than three times Switzerland’s 6 million euros.',
 'Coffee sales in the other countries rose only a little: Denmark to 2 million, Belgium to 1.7 million and Sweden to 1 million.',
 'Switzerland sold the most bananas in both years: 15 million euros in 1999 and 47 million in 2004, much more than the others.',
 'UK and Belgian banana sales also rose a lot, to 5.5 million and 4 million euros in that order in 2004.',
 'In comparison, Swedish banana sales fell from 1.8 million to 1 million, and Danish sales from 2 million to 0.9 million, the lowest in 2004.',
];
const vocabulary=[
 v(['compare','show','比較／展示'],['sales','sales','銷售額'],['measured in millions of euros','in millions of euros','以百萬歐元計'],['five European countries','five European countries','五個歐洲國家']),
 v(['increased in every market','rose in all five countries','每個市場均升'],['most striking rise','biggest rise','最大升幅'],['leading purchaser','sold the most coffee','最大咖啡市場']),
 v(['less even pattern','more mixed','較不一致走勢'],['remained dominant','stayed the largest','保持領先'],['grew sharply','grew a lot','大幅增長'],['experienced declines','sold less','出現下降']),
 v(['Regarding coffee','For coffee','就咖啡而言'],['highest figure','sold the most','最高銷售額'],['followed by','was next','其次']),
 v(['surged','jumped','急升'],['more than three times','more than three times','逾三倍'],['figure of 6 million','6 million','六百萬']),
 v(['remaining countries','other countries','其餘國家'],['modest growth','rose only a little','溫和增長'],['edging up','to','微升至']),
 v(['Banana sales were led','sold the most bananas','香蕉銷售領先'],['rising from','15 million euros in 1999 and','由某值上升'],['far ahead','much more than','遠超']),
 v(['increased substantially','rose a lot','大幅上升'],['reaching','to','達到'],['respectively','in that order','依次分別']),
 v(['By contrast','In comparison','相反'],['fell from','fell from','由某值下降'],['dropped from','from','由某值下跌'],['smallest market','lowest in 2004','最小市場']),
];
const structures=[
 f('The tables compare sales of Fairtrade-labelled tea and cocoa, measured in millions of euros, in five European countries in 1999 and 2004.','引言交代兩種商品、金額單位、五國和兩年份',[1,3,6],{formula:'The tables compare sales of Fairtrade-labelled [商品一] and [商品二], measured in millions of euros, in five European countries in 1999 and 2004',meaning:'兩表分別是 coffee 與 bananas 銷售額，單位 €m，年份 1999／2004。',usage:'題目是銷售金額，不是消費量公斤或市場佔比。',parts:[link('The tables compare sales of Fairtrade-labelled'),slot(' coffee','商品一'),link(' and'),slot(' bananas','商品二'),link(', measured in millions of euros, in five European countries in 1999 and 2004.')]}),
 f('Overall, coffee sales increased in every market, with France recording by far the most striking rise and becoming the leading purchaser by 2004.','概覽同一商品全國上升及領先市場轉移',[0,4,8],{formula:'Overall, coffee sales increased in every market, with [升最多市場] recording by far the most striking rise and becoming the leading purchaser by 2004',meaning:'五國咖啡皆升；UK 1.5→20m 最大變動，2004 居首。',usage:'coffee 的全升不能套到 banana；後者兩國下降。',parts:[link('Overall, coffee sales increased in every market, with'),slot(' the UK','升最多市場'),link(' recording by far the most striking rise and becoming the leading purchaser by 2004.')]}),
 f('Banana sales showed a less even pattern: Brazil remained dominant and grew sharply, whereas Spain and Italy experienced declines.','用冒號對比香蕉上升領先者與下降市場',[0,4,7],{formula:'Banana sales showed a less even pattern: [領先市場] remained dominant and grew sharply, whereas [兩下降市場] experienced declines',meaning:'Swiss 15→47m；Sweden 1.8→1m、Denmark 2→0.9m 下降。',usage:'香蕉表與咖啡表要分開；Belgium 香蕉 0.6→4m 是上升，不屬下降國。',parts:[link('Banana sales showed a less even pattern:'),slot(' Switzerland','領先市場'),link(' remained dominant and grew sharply, whereas'),slot(' Sweden and Denmark','兩下降市場'),link(' experienced declines.')]}),
 f('Regarding coffee, Norway had the highest figure in 1999, at 4 million euros, followed by Finland at 2 million and Ireland at 1 million.','在 1999 咖啡表依次報前三國',[0,4,7],{formula:'Regarding coffee, [第一國] had the highest figure in 1999, at [第一額], followed by [第二國] at [第二額] and [第三國] at [第三額]',meaning:'1999 咖啡 Swiss 3m、Denmark 1.8m、UK 1.5m。',usage:'highest 僅指 1999 咖啡；到 2004 UK 已超前。',parts:[link('Regarding coffee,'),slot(' Switzerland','第一國'),link(' had the highest figure in 1999, at'),slot(' 3 million euros','第一額'),link(', followed by'),slot(' Denmark','第二國'),link(' at'),slot(' 1.8 million','第二額'),link(' and'),slot(' the UK','第三國'),link(' at'),slot(' 1.5 million','第三額'),link('.')]}),
 f('By 2004, however, France had surged to 18 million euros, more than three times Germany’s figure of 5 million.','以 by/however 呈現英國躍升至首及與瑞士倍率',[0,3,8],{formula:'By 2004, however, the UK had surged to [英國額], more than three times Switzerland’s figure of [瑞士額]',meaning:'UK coffee 2004 €20m，Swiss €6m；20/6>3。',usage:'more than three times 是 2004 兩國咖啡銷售比較，不是英國自身變化倍數。',parts:[link('By 2004, however,'),slot(' the UK','躍首市場'),link(' had surged to'),slot(' 20 million euros','英國額'),link(', more than three times'),slot(' Switzerland’s','對照市場'),link(' figure of'),slot(' 6 million','瑞士額'),link('.')]}),
 f('The remaining countries saw only modest growth, with Spain edging up to 2.2 million, Portugal to 1.8 million and Norway to 1.1 million.','列其餘三國較小咖啡增長及終值',[0,4,8],{formula:'The remaining countries saw only modest growth, with Denmark edging up to [丹麥額], Belgium to [比利時額] and Sweden to [瑞典額]',meaning:'2004 coffee Denmark 2m、Belgium 1.7m、Sweden 1m。',usage:'三個終值與上句 UK／Swiss 同在咖啡表，不要讀成香蕉數字。',parts:[link('The remaining countries saw only modest growth, with'),slot(' Denmark','市場一'),link(' edging up to'),slot(' 2 million','丹麥額'),link(','),slot(' Belgium','市場二'),link(' to'),slot(' 1.7 million','比利時額'),link(' and'),slot(' Sweden','市場三'),link(' to'),slot(' 1 million','瑞典額'),link('.')]}),
 f('Banana sales were led by Brazil in both years, rising from 14 to 45 million euros, which was far ahead of all other markets.','將香蕉瑞士首位與兩年升幅放在同句',[0,4,8],{formula:'Banana sales were led by Switzerland in both years, rising from [起額] to [終額] million euros, which was far ahead of all other markets',meaning:'Swiss banana €15m→€47m，兩年均高於其餘四國。',usage:'15/47 為 €m 金額，不是百分比；瑞士咖啡是 3/6m。',parts:[link('Banana sales were led by'),slot(' Switzerland','領先市場'),link(' in both years, rising from'),slot(' 15','起額'),link(' to'),slot(' 47','終額'),link(' million euros, which was far ahead of all other markets.')]}),
 f('France and Germany also increased substantially, reaching 6 million and 4.5 million respectively in 2004.','以 respectively 配對兩國香蕉終值',[0,4,8],{formula:'The UK and Belgium also increased substantially, reaching [英國額] and [比利時額] respectively in 2004',meaning:'2004 bananas UK 5.5m、Belgium 4m；依先後對應。',usage:'這句承接香蕉段；UK coffee 2004 是 20m，不能混用。',parts:[slot('The UK and Belgium','兩市場'),link(' also increased substantially, reaching'),slot(' 5.5 million','英國額'),link(' and'),slot(' 4 million','比利時額'),link(' respectively in 2004.')]}),
 f('By contrast, Spain fell from 2 to 1 million, while Italy dropped from 2.5 to 0.8 million, becoming the smallest market.','在同一香蕉表對照兩下降國及最低終值',[0,4,7],{formula:'By contrast, Sweden fell from [瑞典起終額], while Denmark dropped from [丹麥起終額], becoming the smallest market',meaning:'Sweden banana 1.8→1m；Denmark 2→0.9m，2004 最小。',usage:'Denmark 2004 0.9m 低於 Sweden 1m；但咖啡 2004 Sweden 也是 1m，需留意商品。',parts:[link('By contrast,'),slot(' Sweden','市場一'),link(' fell from'),slot(' 1.8 to 1 million','瑞典起終額'),link(', while'),slot(' Denmark','市場二'),link(' dropped from'),slot(' 2 to 0.9 million','丹麥起終額'),link(', becoming the smallest market.')]}),
];
const intro=[quiz('兩張表的數值單位？',['百萬歐元的銷售額','每人每日公斤數','百分比市場份額','五國人口總數'],'兩表欄頭 millions of euros。'),{type:'multi',prompt:'哪兩項可作整體概覽？',detail:'選兩項，再按「確認」。',options:['咖啡五國全升，英國增最多且 2004 居首','香蕉瑞士仍領先，但瑞典、丹麥下降','咖啡與香蕉兩商品五國全都上升','香蕉 2004 最小市場是瑞士'],correct:[0,1],why:'兩表各自的主導方向不同。'}];
const route=[sequence('依範文排 Fairtrade 兩表報告',[
 ['引言','五國 1999／2004 公平貿易咖啡與香蕉銷售，單位 €m。'],['概覽','咖啡全升、UK 躍首；香蕉 Swiss 仍首、Sweden 與 Denmark 下降。'],['咖啡細節','1999 Swiss 3、Denmark 1.8、UK 1.5；2004 UK 20、Swiss 6，另三國小升。'],['香蕉細節','Swiss 15→47；UK／Belgium 2004 5.5／4；Sweden 1.8→1、Denmark 2→0.9。'],
],'同國可在兩種商品表各有不同數值與方向。')];
const evidence=[
 quiz('咖啡 1999 最高市場？',['瑞士 €3m','英國 €20m','丹麥 €2m','瑞典 €1m'],'Coffee 1999 Swiss 3m。'),
 quiz('咖啡 2004 最高市場？',['英國 €20m','瑞士 €6m','丹麥 €2m','比利時 €1.7m'],'UK 由 1.5→20m 躍首。'),
 quiz('咖啡五國增跌方向？',['五國全部上升','只有英國上升','瑞典與丹麥下降','五國全部下降'],'兩欄每國 2004 均大於 1999。'),
 quiz('香蕉瑞士銷售？',['€15m→€47m','€3m→€6m','€1m→€5.5m','€2m→€0.9m'],'香蕉表 Swiss 15/47；3/6 是咖啡。'),
 quiz('香蕉 2004 UK 與 Belgium 終值？',['€5.5m 與 €4m','€20m 與 €1.7m','€1m 與 €0.9m','€6m 與 €2m'],'香蕉表兩國 5.5/4。'),
 quiz('香蕉哪兩國下降？',['瑞典和丹麥','英國和比利時','瑞士和英國','五國全都上升'],'Sweden 1.8→1；Denmark 2→0.9。'),
 quiz('香蕉 2004 最小市場？',['丹麥 €0.9m','瑞典 €1m','比利時 €4m','瑞士 €47m'],'Denmark 0.9 < Sweden 1。'),
];
const logic=[sequence('咖啡：全升，但領先市場轉換',[
 ['1999 前列','Swiss 3m、Denmark 1.8m、UK 1.5m。'],['2004 躍首','UK 20m > Swiss 6m，且超過三倍。'],['其餘三國','Denmark 2m、Belgium 1.7m、Sweden 1m，皆小升。'],['概覽界線','「五國全升」只適用 coffee。'],
 ],'金額皆為百萬歐元；UK 從 1.5 至 20 是商品銷售額。'),sequence('香蕉：瑞士領先，兩國下降',[
 ['瑞士','15→47m，兩年都最大。'],['英國與比利時','2004 各 5.5／4m，均上升。'],['瑞典','1.8→1m，下降。'],['丹麥','2→0.9m，下降且 2004 最小。'],
 ],'同國 coffee/banana 數字不可混讀；例如 UK coffee 20m、banana 5.5m。')];
const transfers=[
 transfer('另一套表格比較五國兩年兩種 Fairtrade 商品，單位百萬歐元。','哪句引言完整？',['兩表比較五國在兩年公平貿易咖啡與香蕉的銷售額，以百萬歐元計。','兩表只顯示五國人口。','兩表比較香蕉重量與咖啡面積。','單位是百分比市場份額。'],['商品、年份、金額單位齊。','沒有人口。','不是重量面積。','是 €m。'],[0],'原文 two product sales，five countries，€m，1999/2004。'),
 transfer('咖啡表五國均增；UK 從 1.5→20m。','哪句概覽抓住最大變化？',['咖啡銷售每個市場都升，英國增幅最突出並在 2004 居首。','咖啡只有英國上升。','英國咖啡 2004 仍最少。','英國咖啡由 20m 降至 1.5m。'],['全升及英國躍首均準。','另四國也升。','英國 20m 最高。','方向反。'],[1],'原文 coffee every market up，UK striking rise/leader。'),
 transfer('香蕉瑞士上升，但瑞典與丹麥下降。','哪句呈現較不一致走勢？',['香蕉市場走勢較混合：瑞士仍居首並大增，瑞典與丹麥則下跌。','香蕉五國無例外均上升。','比利時是唯一下降國。','瑞士變為 2004 最小市場。'],['領先與下降國都對。','兩國下跌。','比利時上升。','瑞士最大。'],[2],'原文 bananas less even，Swiss up，Sweden/Denmark down。'),
 transfer('1999 咖啡 Swiss3、Denmark1.8、UK1.5（€m）。','哪句排序正確？',['1999 瑞士咖啡銷售最高 €3m，其次丹麥 €1.8m、英國 €1.5m。','1999 英國 €20m 已居首。','瑞士 1999 咖啡只有 €0.9m。','這三數字是香蕉銷售。'],['前三國順序與商品對。','20m 是 2004。','Swiss coffee 3m。','是 coffee。'],[3],'原文 1999 coffee Swiss 3→Denmark 1.8→UK 1.5。'),
 transfer('2004 UK 咖啡 €20m，Swiss €6m。','哪句倍數比較可核算？',['英國咖啡 €20m，超過瑞士 €6m 的三倍。','瑞士 €6m 超過英國三倍。','英國比瑞士多 20 倍。','兩數字是百分比。'],['20/6≈3.33。','方向反。','倍數不對。','是金額。'],[4],'原文 UK 20m >3×Swiss 6m。'),
 transfer('咖啡 2004 Denmark2、Belgium1.7、Sweden1（€m）。','哪句保留三國終值？',['其餘三國咖啡僅小幅上升，終值分別為丹麥 2、比利時 1.7、瑞典 1 百萬歐元。','三國都大幅跌至零。','瑞典咖啡 2004 是 47m。','這三值是香蕉 1999 的數據。'],['三國商品、順序、單位對。','均升。','47m 是瑞士香蕉。','屬咖啡 2004。'],[5],'原文 remaining coffee countries modest growth。'),
 transfer('香蕉 Swiss15→47m。','哪句突出領先？',['瑞士香蕉銷售由 €15m 升至 €47m，兩年都遠高於其他市場。','瑞士咖啡由 €15m 升至 €47m。','瑞士香蕉一路下跌。','2004 瑞士香蕉小於丹麥 €0.9m。'],['商品、數值、排名準。','咖啡是 3→6。','方向反。','Swiss 最大。'],[6],'原文 Swiss banana 15→47m，far ahead。'),
 transfer('2004 香蕉 UK5.5、Belgium4（€m）。','哪句依次配對？',['英國與比利時香蕉銷售在 2004 依次達 €5.5m 與 €4m。','英國 €4m、比利時 €5.5m。','兩國香蕉 2004 都下跌至零。','UK 香蕉 €20m 是 2004 終值。'],['UK→5.5，Belgium→4。','對調。','均上升。','20m 是咖啡。'],[7],'原文 UK and Belgium bananas 5.5/4 respectively。'),
 transfer('香蕉 Sweden1.8→1，Denmark2→0.9（€m）。','哪句低點準確？',['瑞典與丹麥香蕉均下降，丹麥在 2004 以 €0.9m 成為最小市場。','瑞典與丹麥香蕉均大升。','2004 丹麥 €2m 高於瑞典。','這些數字是咖啡的五國總額。'],['兩方向和 2004 最小者對。','均跌。','丹麥 0.9m。','是香蕉。'],[8],'原文 banana Sweden/Denmark down，Denmark smallest 2004。'),
 transfer('同一國可能在咖啡與香蕉表有不同值，例如 UK 2004 20m 與 5.5m。','哪個讀數方式正確？',['先固定商品和年份，再比較該表的國家數字。','把 UK 咖啡與香蕉數字當成同一格。','UK 兩種商品值一定相等。','將香蕉 €5.5m 說成咖啡 €5.5m。'],['先選表、再選年和國家。','兩表分開。','數值不同。','UK coffee 20m。'],[4,7],'原文 UK 在兩表 2004 的商品值不同。'),
];
export default {key:'task1-tables:2',meta:{topic:'Fairtrade 咖啡與香蕉五國銷售額',summary:'咖啡五國皆升，英國 1.5→20m 於 2004 躍首；香蕉瑞士 15→47m 持續領先，瑞典及丹麥下跌。兩表同為百萬歐元，需先固定商品。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
