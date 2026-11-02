const simple=[
  'Dirty air is a serious problem in many places, and people often criticise flying because planes use a lot of fuel.',
  'But I strongly disagree that limiting flights is the only way to stop this problem.',
  'That plan looks at just one cause of pollution, although better plans can deal with more causes in a fairer way.',
  'The first reason is that many things people do every day make air dirty, not just flying.',
  'Cars, lorries, factories, places that make electricity, and building sites can all put harmful gases or tiny pieces into the air.',
  'If governments only cut flights but still let old cars run, factories follow weak rules, and cities use dirty energy, the air will still be dirty.',
  'For example, a city with fewer flights from other countries may still have very dirty air if millions of people drive petrol cars to work every day.',
  'Blaming only flying is like cleaning one window while leaving dust all over the rest of the house.',
  'A better plan is to make all transport and energy less polluting.',
  'Governments can pay for buses and trains that work well, help people use electric cars, set stronger pollution rules for factories, and make electricity in cleaner ways.',
  'These steps would change how people travel each day and how factories work, so they would reach much further than only asking people to fly less.',
  'At the same time, plane companies can use fuel more carefully and choose cleaner technology, instead of only being told to cut flights.',
  'This makes more sense because flights also help businesses, visitors, and families who live far apart stay connected.',
  'In short, limiting flights may cut some pollution, but it is certainly not the only way to make air cleaner.',
  'I strongly believe cities need bigger changes in transport, factories, and energy, not just attention to flights.',
];
const vocabulary=[
  [['Air pollution','Dirty air','空氣污染'],['serious concern','serious problem','嚴重問題'],['aviation','flying','航空業'],['criticised','criticise','受到批評'],['aircraft','planes','飛機'],['burn large amounts of fuel','use a lot of fuel','燃燒大量燃料']],
  [['However','But','然而'],['completely disagree','strongly disagree','完全不同意'],['restricting air travel','limiting flights','限制航空旅行'],['only way','only way','唯一方法'],['prevent this problem','stop this problem','防止問題']],
  [['Such a policy','That plan','這項政策'],['focuses too narrowly','looks at just','過於狹窄聚焦'],['one source of pollution','one cause of pollution','單一污染源'],['more effective and balanced solutions','better plans can deal with more causes in a fairer way','更有效平衡方案']],
  [['air pollution','air dirty','空氣污染'],['many everyday activities','many things people do every day','許多日常活動'],['aviation alone','just flying','不只航空業']],
  [['Cars, lorries, factories','Cars, lorries, factories','汽車貨車工廠'],['power stations','places that make electricity','發電站'],['construction sites','building sites','建築工地'],['release','put','釋放'],['harmful gases or particles','harmful gases or tiny pieces','有害氣體或微粒']],
  [['simply limit flights','only cut flights','只限制航班'],['old vehicles','old cars','舊車'],['industrial plants','factories','工業廠房'],['weak standards','weak rules','寬鬆標準'],['dirty energy','dirty energy','污染能源'],['remain polluted','still be dirty','仍受污染']],
  [['fewer international flights','fewer flights from other countries','較少國際航班'],['thick smog','very dirty air','濃厚煙霧'],['millions of commuters','millions of people','數百萬通勤者'],['petrol cars','petrol cars','汽油車']],
  [['Blaming air travel alone','Blaming only flying','只責怪航空'],['cleaning one window','cleaning one window','只清潔一扇窗'],['rest of the house covered in dust','dust all over the rest of the house','房子其餘部分滿灰塵']],
  [['A better approach','A better plan','更好做法'],['reduce pollution','less polluting','減少污染'],['whole transport and energy system','all transport and energy','整個交通與能源系統']],
  [['invest in reliable public transport','pay for buses and trains that work well','投資可靠公共交通'],['encourage electric vehicles','help people use electric cars','鼓勵電動車'],['tighten emissions standards','set stronger pollution rules','收緊排放標準'],['shift electricity production towards cleaner sources','make electricity in cleaner ways','轉向清潔發電']],
  [['These measures','These steps','這些措施'],['daily habits','how people travel each day','日常習慣'],['industrial behaviour','how factories work','工業行為'],['far broader','reach much further','影響更廣泛'],['discouraging people from flying','asking people to fly less','勸人少乘飛機']],
  [['aviation industry','plane companies','航空業'],['improve fuel efficiency','use fuel more carefully','提高燃油效率'],['adopt cleaner technology','choose cleaner technology','採用清潔技術'],['instead of being treated','instead of only being told','而非只被視為'],['restriction','cut flights','限制']],
  [['more practical','makes more sense','更實際'],['air travel','flights','航空旅行'],['supports business, tourism','help businesses, visitors','支撐商業旅遊'],['family connections across long distances','families who live far apart stay connected','遠距家庭聯繫']],
  [['In conclusion','In short','總結'],['restricting air travel','limiting flights','限制航空旅行'],['small role','some','小作用'],['reducing emissions','cut some pollution','減少排放'],['tackle air pollution','make air cleaner','處理空氣污染']],
  [['strongly believe','strongly believe','強烈認為'],['cleaner cities','cities','更清潔城市'],['wider reforms','bigger changes','更廣改革'],['industry','factories','工業'],['narrow focus on flights alone','just attention to flights','只狹隘聚焦航班']],
];
const chunkOverrides=[
  ['Air pollution has become a serious concern in many parts of the world,','and aviation is often criticised because aircraft burn large amounts of fuel.'],
  ['However, I completely disagree with the view','that restricting air travel is the only way to prevent this problem.'],
  ['Such a policy focuses too narrowly on one source of pollution,','while more effective and balanced solutions are available.'],
  ['The first reason is that air pollution is produced by many everyday activities,','not by aviation alone.'],
  ['Cars, lorries, factories, power stations and construction sites','can all release harmful gases or particles into the air.'],
  ['If governments simply limit flights while allowing old vehicles to run,','industrial plants to operate with weak standards and cities to depend on dirty energy,','the air will remain polluted.'],
  ['For example, a city with fewer international flights may still suffer from thick smog','if millions of commuters drive petrol cars every day.'],
  ['Blaming air travel alone is like cleaning one window','while leaving the rest of the house covered in dust.'],
  ['A better approach is to reduce pollution','across the whole transport and energy system.'],
  ['Governments can invest in reliable public transport, encourage electric vehicles,','tighten emissions standards for factories and shift electricity production towards cleaner sources.'],
  ['These measures would affect people’s daily habits and industrial behaviour,','so their impact would be far broader than simply discouraging people from flying.'],
  ['At the same time, the aviation industry itself can be pushed to improve fuel efficiency and adopt cleaner technology,','instead of being treated as a problem that can only be solved by restriction.'],
  ['This is more practical because air travel also supports business, tourism','and family connections across long distances.'],
  ['In conclusion, restricting air travel may play a small role in reducing emissions,','but it is certainly not the only way to tackle air pollution.'],
  ['I strongly believe that cleaner cities require wider reforms in transport, industry and energy,','rather than a narrow focus on flights alone.'],
];
const simpleChunkOverrides=[
  ['Dirty air is a serious problem in many places,','and people often criticise flying because planes use a lot of fuel.'],
  ['But I strongly disagree','that limiting flights is the only way to stop this problem.'],
  ['That plan looks at just one cause of pollution,','although better plans can deal with more causes in a fairer way.'],
  ['The first reason is that many things people do every day make air dirty,','not just flying.'],
  ['Cars, lorries, factories, places that make electricity, and building sites','can all put harmful gases or tiny pieces into the air.'],
  ['If governments only cut flights but still let old cars run,','factories follow weak rules, and cities use dirty energy,','the air will still be dirty.'],
  ['For example, a city with fewer flights from other countries may still have very dirty air','if millions of people drive petrol cars to work every day.'],
  ['Blaming only flying is like cleaning one window','while leaving dust all over the rest of the house.'],
  ['A better plan is to make all transport and energy','less polluting.'],
  ['Governments can pay for buses and trains that work well, help people use electric cars,','set stronger pollution rules for factories, and make electricity in cleaner ways.'],
  ['These steps would change how people travel each day and how factories work,','so they would reach much further than only asking people to fly less.'],
  ['At the same time, plane companies can use fuel more carefully and choose cleaner technology,','instead of only being told to cut flights.'],
  ['This makes more sense because flights also help businesses, visitors,','and families who live far apart stay connected.'],
  ['In short, limiting flights may cut some pollution,','but it is certainly not the only way to make air cleaner.'],
  ['I strongly believe cities need bigger changes in transport, factories, and energy,','not just attention to flights.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Air pollution is serious, and planes are criticised because they use much fuel.','and 連問題與被指責行業；because 解釋批評緣由。','作者承認飛機耗油，並未在此同意只限制航班。',[1,2,3],F('[空氣污染] has become [嚴重問題], and [航空業] is often criticised because [飛機耗大量燃料]','先承認問題及航空業被討論的理由。','要開始評估一種限制措施時，先交代其對象為何受到關注。',[['Air pollution','slot','空氣污染'],[' has become ','link','已成為'],['a serious concern in many parts of the world','slot','嚴重問題'],[', and ','link','而'],['aviation','slot','航空業'],[' is often criticised because ','link','常受批評因為'],['aircraft burn large amounts of fuel.','slot','飛機耗大量燃料']])),
  S('I disagree that limiting air travel is the only solution.','the only way 是作者反對的絕對主張，不是否定所有限制作用。','結論承認限制或有小作用。',[0,2,13],F('However, I completely disagree with the view that [限制航空旅行] is [防止空氣污染的唯一方法]','引言精確反對題目的「唯一方法」。','要反駁某措施是唯一出路，同時保留它可能有部分作用時。',[['However, I completely disagree with the view that ','link','轉折並反對'],['restricting air travel','slot','限制航空旅行'],[' is ','link','是'],['the only way to prevent this problem.','slot','防止空氣污染的唯一方法']])),
  S('The plan focuses on one pollution source despite broader, more balanced options.','too narrowly 指範圍不足；while 對比其他更有效和平衡的方案。','作者後文列交通、能源、工業措施。',[1,3,8],F('[限制航空政策] focuses too narrowly on [單一污染源], while [更有效平衡方案] are available','概述單一措施過窄及替代方案存在。','要指出一項政策只處理部分成因而非整體問題時。',[['Such a policy','slot','限制航空政策'],[' focuses too narrowly on ','link','過狹地針對'],['one source of pollution','slot','單一污染源'],[', while ','link','但'],['more effective and balanced solutions','slot','更有效平衡方案'],[' are available.','link','仍可採用']])),
  S('Everyday activities besides flying produce air pollution.','many...not...alone 指污染源多樣，否定航空獨佔。','作者沒有說航空完全不污染。',[2,4,5],F('[空氣污染] is produced by [許多日常活動], not by [航空業] alone','建立多來源論證。','要反駁把複雜問題完全歸於單一來源時。',[['The first reason is that ','link','引出第一理由'],['air pollution','slot','空氣污染'],[' is produced by ','link','由...產生'],['many everyday activities','slot','許多日常活動'],[', not by ','link','不只由'],['aviation','slot','航空業'],[' alone.','link','單獨造成']])),
  S('Cars, factories, power stations and building sites also release harmful material.','列五類來源和 gases/particles 兩類污染物，支持多來源論。','can 表可造成，不是所有工廠每時每刻都同樣排放。',[3,5,6],F('[車輛、工廠、發電站與工地] can release [有害氣體或微粒] into the air','把抽象多來源變為具體清單。','已說問題有多個成因，要列出主要來源作證時。',[['Cars, lorries, factories, power stations and construction sites','slot','車輛、工廠、發電站與工地'],[' can all release ','link','都可釋放'],['harmful gases or particles','slot','有害氣體或微粒'],[' into the air.','link','進入空氣']])),
  S('Cutting flights alone leaves pollution if old vehicles, weak industrial rules and dirty energy continue.','If...while... 設單一政策與其他來源持續的條件；結果空氣仍受污染。','這是政策覆蓋不足，不是說減少航班無任何作用。',[3,4,7],F('If [只限航班而舊車、弱工廠標準、污染能源仍在], [空氣] will remain [污染]','推導只管航班無法處理其他排放源。','要測試一項單一措施在其他成因未變時能否解決整體問題。',[['If ','link','設定政策'],['governments simply limit flights while allowing old vehicles to run, industrial plants to operate with weak standards and cities to depend on dirty energy','slot','只限航班而舊車、弱工廠標準、污染能源仍在'],[', ','link','則'],['the air','slot','空氣'],[' will remain ','link','仍會'],['polluted.','slot','污染']])),
  S('A city may have smog despite fewer flights if millions still drive petrol cars.','For example 以通勤車輛說明航班少與空氣清潔不等同。','may 保留情境可能性，沒有說每個城市如此。',[4,5,7],F('For example, [國際航班較少的城市] may still suffer [煙霧] if [數百萬人每天開汽油車通勤]','以城市通勤例子檢驗單一政策效果。','要用一個具體對照證明減少一來源仍未解決另一來源時。',[['For example, ','link','引出例子'],['a city with fewer international flights','slot','國際航班較少的城市'],[' may still suffer from ','link','仍可能受困於'],['thick smog','slot','煙霧'],[' if ','link','若'],['millions of commuters drive petrol cars every day.','slot','數百萬人每天開汽油車通勤']])),
  S('Blaming only planes is like cleaning one window while the rest of the house stays dusty.','window/house 比喻一個污染源與完整系統。','不是字面房屋清潔建議。',[5,6,8],F('[只怪航空旅行] is like [只清潔一扇窗] while [整屋其他地方仍有灰塵]','用比喻收束「只管一來源」的缺陷。','要讓讀者看出局部改善不等於整體問題解決時。',[['Blaming air travel alone','slot','只怪航空旅行'],[' is like ','link','猶如'],['cleaning one window','slot','只清潔一扇窗'],[' while ','link','同時'],['leaving the rest of the house covered in dust.','slot','整屋其他地方仍有灰塵']])),
  S('A broader plan should reduce pollution throughout transport and energy.','whole transport and energy system 將治理範圍從航空擴大。','下一句提供各種具體措施。',[3,7,9],F('A better approach is to reduce [污染] across [整個交通與能源系統]','提出較完整的政策範圍。','批評只處理單一來源後，要提出涵蓋整個系統的替代方向時。',[['A better approach is to reduce ','link','更好做法是減少'],['pollution','slot','污染'],[' across ','link','遍及'],['the whole transport and energy system.','slot','整個交通與能源系統']])),
  S('Public transport, electric vehicles, factory standards and cleaner electricity form a broader package.','can 代表可採取的政策；四項分別覆蓋日常交通、工業與能源。','原文沒有說只靠任一措施即可清除全部污染。',[8,10,11],F('[政府] can [投資公交、鼓勵電車、收緊工廠標準、改用清潔發電]','將系統性治理具體化成四類措施。','已提出廣泛治理方向，要列出對不同來源的配套措施時。',[['Governments','slot','政府'],[' can ','link','可以'],['invest in reliable public transport, encourage electric vehicles, tighten emissions standards for factories and shift electricity production towards cleaner sources.','slot','投資公交、鼓勵電車、收緊工廠標準、改用清潔發電']])),
  S('A package affecting daily habits and industry reaches more broadly than discouraging flights alone.','so 從涉及居民與產業的措施推出影響範圍較廣。','far broader 比較範圍，文章未提供精確減排量。',[8,9,11],F('[這些措施] would affect [日常習慣與工業行為], so their impact would be [比只勸人少飛更廣]','說明多來源配套為何比單一限制覆蓋更廣。','要比較一組措施與單一措施對不同群體的作用範圍時。',[['These measures','slot','這些措施'],[' would affect ','link','會影響'],['people’s daily habits and industrial behaviour','slot','日常習慣與工業行為'],[', so their impact would be ','link','故影響'],['far broader than simply discouraging people from flying.','slot','比只勸人少飛更廣']])),
  S('Aviation itself can improve efficiency and technology rather than only face restrictions.','At the same time 補充航空業不能被忽略；instead of 對比改善與只限制。','作者不是主張讓航空業完全不受政策要求。',[9,10,12],F('At the same time, [航空業] can improve [燃油效率及清潔技術] instead of [只被視為能靠限制解決]','提出航空業內部的改善方法。','已提出其他來源的對策後，要說明原受關注對象自身也可如何改善時。',[['At the same time, ','link','同時'],['the aviation industry itself','slot','航空業'],[' can be pushed to improve ','link','可被推動改善'],['fuel efficiency and adopt cleaner technology','slot','燃油效率及清潔技術'],[', instead of being treated as ','link','而不只被視為'],['a problem that can only be solved by restriction.','slot','只被視為能靠限制解決']])),
  S('Improvement is practical because flights support business, tourism and distant families.','because 交代不能只粗暴限制的社會作用。','支持航空用途不等於航空污染可忽略。',[10,11,13],F('This is more practical because [航空旅行] supports [商業、旅遊及遠距家庭聯繫]','解釋改善技術比單一限制更可行。','要評估一項限制時，同時考慮受限服務帶來的正面功能。',[['This is more practical because ','link','更實際因為'],['air travel','slot','航空旅行'],[' also supports ','link','亦支持'],['business, tourism and family connections across long distances.','slot','商業、旅遊及遠距家庭聯繫']])),
  S('Flight restrictions may help a little but are not the only air-pollution remedy.','may play a small role 承認部分作用；but certainly not the only way 否定唯一性。','這是有條件反對，並非「限制必然完全無效」。',[1,11,14],F('[限制航空旅行] may play [小作用], but is certainly not [治理空污唯一方法]','結論以精準讓步避免過度否定。','反對「唯一方法」時，要承認該方法可能有部分效益時。',[['In conclusion, ','link','總結'],['restricting air travel','slot','限制航空旅行'],[' may play ','link','或發揮'],['a small role in reducing emissions','slot','小作用'],[', but it is certainly not ','link','卻絕非'],['the only way to tackle air pollution.','slot','治理空污唯一方法']])),
  S('Cleaner cities need transport, industry and energy reform rather than attention to flights alone.','rather than 對比系統改革與只聚焦航班，總結全文。','作者未給出某城市的具體排放數據。',[2,9,13],F('[更清潔城市] require [交通、工業和能源廣泛改革] rather than [只聚焦航班]','把多污染源與配套政策收束為最終判斷。','結論要把單一措施的局限與多領域改革清楚對比時。',[['I strongly believe that ','link','強調判斷'],['cleaner cities','slot','更清潔城市'],[' require ','link','需要'],['wider reforms in transport, industry and energy','slot','交通、工業和能源廣泛改革'],[', rather than ','link','而非'],['a narrow focus on flights alone.','slot','只聚焦航班']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否認為限制飛行是防止空氣污染的唯一方法？',['完全不同意「唯一」的說法，但承認限制或能稍微減排','完全同意：只有航班造成空污','沒有立場：只列飛機用途','反對所有航空業改善技術'],'I completely disagree...only way；may play a small role。'),
  {type:'multi',prompt:'選出文章兩條不同的主體論證',detail:'選兩項，再按「確認」。',options:['空污源頭不只航空，舊車、工廠與污染能源仍可能令空氣受污染','公交、電車、工廠標準及清潔發電可形成較廣政策，航空業也可改進技術','只要航班減少，所有城市必然空氣清潔','航空旅行對商業、旅遊及家庭完全沒有作用'],correct:[0,1],why:'第一段拆解單一來源論，第二段提出廣泛治理與航空業改善。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對唯一方法','飛機耗油，但只限制航空過於狹窄。'],
  ['主體段一 · 多種污染源','車輛、工廠、發電及工地都可能污染；少航班城市仍可有煙霧。'],
  ['主體段二 · 廣泛配套','公交、電動車、工廠標準與清潔發電，航空業也可提高效率。'],
  ['結論 · 限制可有小作用','清潔城市須更廣改革，不能只看航班。'],
],'飛機受批評 → 多來源 → 廣泛政策與航空改善 → 否定唯一性。')];
const evidence=[
  Q('除了航空，文章列出哪些空污來源？',['汽車、貨車、工廠、發電站及建築工地','只有公園與圖書館','只有國際航班','只有海洋塑膠'],'原文以五類來源支持多來源論。'),
  Q('為何限制航班後空氣仍可能受污染？',['舊車、弱工廠排放標準和污染能源若繼續，其他來源仍在','所有舊車都立即停止運作','工廠不可能排放','電力生產與空氣完全無關'],'If...while...the air will remain polluted。'),
  Q('少國際航班城市的例子指出甚麼？',['若數百萬通勤者每天開汽油車，城市仍可能有濃厚煙霧','航班一少，煙霧必然即時消失','所有通勤者都在機場工作','汽油車完全沒有排放'],'航班數與整體空氣品質不能直接等同。'),
  Q('較廣政策包括哪四類措施？',['可靠公共交通、電動車、較嚴工廠標準與清潔發電','只限制所有家庭出門','只減少航班，不管其他來源','取消公共交通和電力改善'],'第二段列四種不同污染源配套。'),
  Q('文章如何處理航空業本身？',['推動提高燃油效率及採用較清潔技術，而非只視限制為出路','完全免除航空業任何改善責任','要求所有航班永遠停止','航空技術與燃料毫無關係'],'At the same time 補充航空業內部改革。'),
  Q('結論如何限定限制航空的作用？',['或能稍微減排，但絕非處理空污的唯一方法','限制完全無效，不能有任何作用','限制能單獨消除全部污染','文章沒有談限制航班'],'may play a small role；certainly not the only way。'),
];
const logic=[
  sequence('第一主體段：為何只限制航空不足？',[
    ['多來源中心','空污由多種日常活動造成，非航空獨有。'],
    ['來源清單','車輛、工廠、發電站與工地也可排放。'],
    ['單一政策缺口','只限航班，舊車與污染能源仍在，空氣仍可能差。'],
    ['城市例子','少航班城市仍可能因大量汽油車而有煙霧。'],
    ['窗與房屋比喻','清一扇窗不等於清理整屋。'],
  ],'污染源多 → 航空只是一部分 → 單一限制不保證整體空氣改善。'),
  sequence('第二主體段：更廣方案如何形成？',[
    ['系統範圍','交通與能源整體減污。'],
    ['具體措施','公交、電車、工廠標準和清潔發電。'],
    ['覆蓋效果','影響日常交通和工業行為，範圍比勸人少飛廣。'],
    ['航空改善','提高燃油效率與較清潔技術。'],
    ['實際考慮','飛行亦支援商業、旅遊和遠距家庭。'],
  ],'多部門政策 → 更廣影響 → 航空亦改革 → 兼顧交通用途。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某市削減國際航班，但舊巴士、工廠與燃煤發電仍大量排放。','哪項最符合文章第一段？',['只管航班未處理其他污染源，空氣仍可能受污染','只要航班減少，所有空污必然消失','工廠及電力不會影響空氣','只有飛機可排放有害微粒'],['原文列多來源並設同類條件。','唯一方法正被反對。','與來源清單相反。','其他來源也可排放。'],[3,4,5],'the air will remain polluted。'),
  T('一個城市航班少，卻有數百萬居民每天開汽油車通勤。','文章哪個例子最貼近？',['少航班仍可能有濃厚煙霧，因汽油車是另一來源','航班少便必然零煙霧','通勤車不屬日常活動','飛機是唯一可管制的來源'],['原文直接用少航班及汽油車對照。','不是必然。','通勤是日常。','其他來源可治理。'],[5,6],'fewer international flights...thick smog if millions...drive petrol cars。'),
  T('一名學生說：「只怪航空就夠了，其他污染不用理。」','房屋比喻如何回應？',['只清一扇窗而留下整屋灰塵，不能處理完整問題','作者真的討論家庭打掃方法','屋內灰塵必然只來自飛機','只要一扇窗乾淨，整屋必然乾淨'],['比喻指出局部治理不等於全面治理。','非字面主題。','污染源不只航空。','與比喻相反。'],[4,5,7],'cleaning one window while leaving the rest of the house covered in dust。'),
  T('政府想減少城市空污，卻只在機場做宣傳。','哪組行動較接近作者替代方案？',['改善公交、鼓勵電車、收緊工廠標準並轉向清潔發電','只要求居民少乘飛機，其他不變','停用所有公共交通','讓工廠自行決定是否排放而不設標準'],['四項涵蓋交通、工業與能源。','範圍過窄。','作者主張投資公交。','原文主張收緊標準。'],[8,9,10],'reliable public transport...electric vehicles...factory standards...cleaner sources。'),
  T('飛機製造商研發省油設備與較清潔引擎。','這對應文章哪項處理航空業的方法？',['推動航空本身提高效率和採用較清潔技術','只可用全面禁飛處理航空','航空業完全不需減少污染','省油技術只適用工廠'],['原文提出航空內部改善。','作者反對只限限制。','航空仍須改進。','原文指 aviation。'],[11,12],'improve fuel efficiency and adopt cleaner technology。'),
  T('某政策限制旅行，卻忽略長途家人探訪與商業往來的作用。','文章為何說改善技術更實際？',['飛行支援商業、旅遊與遠距家庭聯繫，治理污染時也須考慮這些用途','飛行從不帶來任何社會作用','只有旅遊有用，家庭聯繫無關','因作者認為航空不應改善排放'],['作者兼顧交通用途及減污。','與原文相反。','家庭也是用途。','作者主張改善。'],[11,12],'air travel also supports business, tourism and family connections。'),
  T('另一議題中，有人說「禁止塑膠袋是處理海洋垃圾的唯一方法」。','可跨題使用哪個檢查？',['先列出所有重要來源及其他可行措施，再判斷單一禁令是否足以解決全局','只要禁令名稱好聽便必然足夠','完全不用處理其他垃圾來源','任何限制都完全不可能有作用'],['文章反對未檢查其他來源就說唯一。','非效果證據。','多來源需處理。','限制可有小作用。'],[1,2,3,4,13],'not by aviation alone；not the only way。'),
  T('研究者轉述：「作者認為限制航班毫無減排效果。」','哪項修正準確？',['作者承認它或有小作用，但否定它是唯一或最完整方案','轉述完全正確','作者說限制必然消除所有污染','作者只談旅遊，不談空污'],['may play a small role 是明確讓步。','與結論相反。','作者否定唯一性。','污染是核心。'],[1,13],'may play a small role in reducing emissions。'),
  T('市長想比較「只勸人少飛」與「改變每天交通及工業排放」。','文章的比較準則是甚麼？',['看措施能否觸及更多人的日常習慣及工業行為，覆蓋更廣污染源','只看機場宣傳標語數量','只要政策便宜便不需考慮效果','假定任何單一措施必然覆蓋所有來源'],['These measures...far broader 說明覆蓋範圍。','與效果無關。','需比較來源。','單一有限。'],[9,10],'affect people’s daily habits and industrial behaviour...far broader。'),
  T('某市同時改善巴士、更新工廠設備和更換清潔能源，仍保留必要航班。','這最符合作者哪種政策思路？',['從交通、工業與能源多線減污，航空亦可改進技術','空污只有航班造成','保留航班代表完全沒有環境政策','所有工業改善都不重要'],['多來源配套且不只靠禁飛。','與來源清單相反。','政策仍多線減污。','工業是重點。'],[8,9,10,11,14],'wider reforms in transport, industry and energy。'),
  T('一項政策只針對最顯眼的來源，其他來源完全不管。','本文的核心批評如何轉用？',['把多來源問題縮成單一來源，可能留下大部分成因未處理','最顯眼來源必然是唯一來源','其他成因會自動消失','只要限制一處，就不需監察成效'],['too narrowly on one source 是可轉用原則。','顯眼不等於唯一。','沒有此保證。','仍需整體評估。'],[2,3,5,7],'focuses too narrowly on one source of pollution。'),
  T('要用一句話不誇大地概括全文。','哪項最好？',['作者認為限制飛行或有小作用，但清潔城市更需交通、工業、能源及航空技術的廣泛改善','作者說航空完全不污染','作者主張只靠禁飛解決所有空污','作者否定公交和工廠標準'],['結論保留小作用並主張廣泛改革。','引言承認飛機耗油。','作者反對唯一性。','原文支持。'],[0,1,9,10,11,13,14],'small role；wider reforms in transport, industry and energy。'),
];
const reviewedExamples={
  0:'City noise has become a serious concern, and road traffic is often criticised because it is loud at night.',
  1:'However, I completely disagree with the view that homework is the only way to learn.',
  2:'The plan focuses too narrowly on one school, while better alternatives are available.',
  3:'The first reason is that waste is produced by homes and factories, not by shops alone.',
  4:'Cars and factories can all release chemicals into the air.',
  5:'If factories keep burning coal, pollution will remain high.',
  6:'For example, a town may still suffer from flooding if rivers are blocked.',
  8:'A better approach is to reduce waste across homes and businesses.',
  9:'Cleaner buses can reduce city noise.',
  10:'The changes would affect daily travel, so their impact would be much wider.',
  11:'At the same time, bus companies can be pushed to improve vehicle safety, instead of being treated as enemies of public transport.',
  12:'This is more practical because public transport also supports workers who cannot drive.',
  13:'In conclusion, banning plastic may play a small part, but it is certainly not the only answer.',
  14:'I strongly believe that cleaner streets require better transport, rather than a ban on all cars.',
};
for(const [index,example] of Object.entries(reviewedExamples))structures[Number(index)].example=example;
const reviewedTransfer=[
  [
    ['只管航班而不改舊巴士與工廠，空污仍可能持續','航班減少後便停止監察巴士與工廠排放','只算航班數目，未查其他日常污染的來源','認定舊巴士排放無關，毋須檢查工廠能源'],
    ['多個來源仍排放，限航單獨不足以清潔空氣。','巴士和工廠仍可能產生污染。','航班數字未涵蓋其他主要來源。','舊巴士與工廠能源都需要檢查。']
  ],
  [
    ['航班少仍可能有煙霧，汽油車也是污染來源','只看航班數量，便認為市內空氣一定清潔','只記汽油車數量，卻不量度它們的排放','因航班較少，便取消對工廠和道路的監察'],
    ['少航班不會消除數百萬汽油車的排放。','航班不是城市唯一污染來源。','車數以外，還要看排放及其他來源。','其他污染源仍需監察。']
  ],
  [
    ['只清一扇窗，整屋仍有塵；單一措施不足夠','只清一扇窗，就認定屋內其他地方也乾淨','只列出屋中灰塵，卻不檢查任何清潔措施','因屋內有塵，便認為清潔那扇窗完全無用'],
    ['比喻指出單一措施不能處理多來源問題。','其他地方的灰塵仍未處理。','指出來源仍須配合實際清理。','局部清潔有用，只是不足以完成全局。']
  ],
  [
    ['同時改善公交、工廠標準與清潔能源','只在機場勸旅客少飛，忽略公交和工廠排放','只改善公交，卻不檢查工廠與電力來源','只改電力供應，未監察交通與工業排放'],
    ['多線處理交通、工業與能源來源。','機場宣傳仍漏掉其他來源。','公交改善只是較廣方案的一部分。','能源改革也要配合交通與工業。']
  ],
  [
    ['促使航空業提高效率並採用較清潔技術','只限制航班數量，未要求航空設備改善效率','只換機場宣傳標語，未改善飛機燃料與設備','只保留現有引擎，卻聲稱航空污染已下降'],
    ['原文提出改善航空本身的效率和技術。','限航不是唯一可用的航空減排方式。','標語不能代替設備和燃料技術改進。','沒有改進或數據，不能宣稱排放下降。']
  ],
  [
    ['飛行有商業與家庭用途，減污時應兼顧這些需要','只計航班排放，未衡量遠距家庭與商業往來','只談旅遊收入，忽略家人探訪與其他交通選擇','因航班有用，便完全不檢查航空業排放與效率'],
    ['技術改進兼顧減污和有價值的飛行用途。','排放要治理，但也須看政策影響的需求。','旅遊只是飛行用途之一。','用途存在不等於航空無須改善。']
  ],
  [
    ['先查垃圾各來源與其他措施，再評估單一禁令','直接認定一項禁令可解決所有海洋垃圾','只量塑膠袋數量，不查其他垃圾與來源','因禁令未能包辦全局，便否定它可能的作用'],
    ['多來源問題要比較不同來源及可用措施。','單一禁令未必涵蓋全部海洋垃圾。','塑膠袋只是可能來源之一。','有限作用仍可能值得保留。']
  ],
  [
    ['承認限航或有小作用，但否定它是唯一方案','把限航說成完全無效，因而不再比較其他辦法','只談限航的小作用，未比較更廣泛的減排措施','認定限制航班已足夠，不再檢查道路與工廠'],
    ['文章否定唯一解法，沒有否定任何小作用。','完全無效是比原文更強的主張。','只列小作用，仍未說明為何不是唯一方案。','其他大量排放來源仍未處理。']
  ],
  [
    ['比較措施覆蓋多少日常交通及工業排放','只看航空乘客數，未算日常通勤與工業排放','只比較政策成本，不檢查排放來源的覆蓋面','只看機場宣傳效果，忽略每天道路上的車輛'],
    ['覆蓋日常習慣與工業行為，減排範圍才更廣。','乘客數不能代表全部城市排放。','成本要和觸及的排放來源一同看。','機場以外仍有大量每日排放。']
  ],
  [
    ['交通、工業、能源多線減污，航空技術也改進','只改革航空，維持舊巴士與工廠原有排放','只更新工廠設備，不處理通勤與電力來源','因航班仍保留，便斷定其他減排都沒有用'],
    ['多來源減污，同時改善航空本身。','只處理航空，仍漏掉其他來源。','工廠改革之外還有交通與能源。','保留必要航班不使其他改革無效。']
  ],
  [
    ['只抓顯眼來源會漏掉其他成因，難以全面減污','只看一種來源的數字，便判斷所有排放都下降','只比較最顯眼來源，未追查其他日常污染','因來源很多，便認定各項減污措施都無效'],
    ['把多來源問題縮成單一來源，會留下重要成因。','單一來源下降不代表總排放下降。','仍未調查顯眼來源以外的成因。','多來源要求更廣方案，不代表措施無效。']
  ],
  [
    ['限飛或有小作用，仍須多線減排及改進航空技術','只限制航空旅行，便認為道路和工廠不用改善','只改善道路排放，卻不看工業能源與航空技術','因飛行有用途，便主張完全不治理航空排放'],
    ['保留有限效果，也提出跨來源與航空技術改善。','只限飛仍漏掉其他重要來源。','道路只是綜合方案的一部分。','飛行有用途仍須改善效率。']
  ],
];
reviewedTransfer.forEach(([options,explanations],i)=>{
  transfer[i].options=options;
  transfer[i].explanations=explanations;
  transfer[i].why=explanations[0];
});
export default {
  key:'opinion:48',
  meta:{topic:'限制航空旅行與多污染源空氣治理',summary:'作者反對限制航空旅行是防止空氣污染唯一方法的說法，亦承認限飛可能有小作用。車輛、工廠、發電站及工地等也是污染源；只減少航班，其他來源仍可令空氣受污染。較完整的方案是改善公共交通、電動車、工廠標準和清潔發電，同時推動航空業提高燃油效率與採用清潔技術。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
