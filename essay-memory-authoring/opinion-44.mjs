const simple=[
  'Harm to the environment is a problem we face now, and governments must choose carefully how to spend limited public money.',
  'Some people say local environmental problems should get less money so governments can spend more on global warming.',
  'I strongly disagree because local problems can harm people’s health right away and are also linked to the larger climate problem.',
  'First, problems with the local environment are not small just because they happen near us.',
  'Dirty rivers, bad air, waste dumped in the wrong places, and unsafe drinking water can harm daily life more directly than predictions about the future climate.',
  'If local and national governments spend less on these problems, ordinary people may face breathing problems, dirty neighbourhoods, and a poorer quality of life.',
  'For example, a city that does not collect rubbish or look after drains may soon have blocked waterways, floods, and illness after heavy rain.',
  'So money spent on local environmental problems is not an extra; it helps keep the public safe.',
  'Second, action against global warming needs strong work in local places.',
  'Carbon pollution comes from real streets, homes, factories, and transport, not from some separate place called “global.”',
  'When governments pay for cleaner buses, better recycling, buildings that use less energy, and green spaces in cities, they help local areas and the climate at the same time.',
  'Cutting this money would be like taking bricks out of a house while trying to make its roof stronger.',
  'A good plan for the climate needs both a plan for the whole country and real work in local places.',
  'In short, I strongly disagree that governments should take money away from local environmental problems.',
  'Global warming is certainly urgent, but we cannot solve it by ignoring smaller local efforts that keep people safe and lower pollution.',
  'A better plan is to make local environmental work stronger, because wider action on climate change is built on it.',
];
const vocabulary=[
  [['Environmental damage','Harm to the environment','環境破壞'],['no longer a distant concern','a problem we face now','不再遙遠'],['decide carefully','choose carefully','謹慎決定'],['limited public money','limited public money','有限公共資金']],
  [['Some argue','Some people say','有些人認為'],['local environmental issues','local environmental problems','本地環境問題'],['receive less funding','get less money','獲較少資金'],['global warming','global warming','全球暖化']],
  [['completely disagree','strongly disagree','完全不同意'],['immediate threats to public health','harm people’s health right away','對公共健康的即時威脅'],['part of the wider climate crisis','linked to the larger climate problem','更廣泛氣候危機的一部分']],
  [['local environmental problems','problems with the local environment','本地環境問題'],['not minor','not small','並非小事'],['close to home','near us','發生在身邊']],
  [['Polluted rivers','Dirty rivers','受污染河流'],['poor air quality','bad air','空氣質素差'],['illegal dumping','waste dumped in the wrong places','非法傾倒垃圾'],['unsafe drinking water','unsafe drinking water','不安全飲用水'],['distant climate projections','predictions about the future climate','遙遠的氣候預測']],
  [['councils and national authorities','local and national governments','地方與中央政府'],['cut spending','spend less','削減開支'],['ordinary citizens','ordinary people','普通市民'],['respiratory illness','breathing problems','呼吸系統疾病'],['contaminated neighbourhoods','dirty neighbourhoods','受污染社區'],['declining living standards','a poorer quality of life','生活水平下降']],
  [['waste collection','collect rubbish','垃圾收集'],['drainage','drains','排水'],['blocked waterways','blocked waterways','水道堵塞'],['flooding','floods','水浸'],['disease','illness','疾病']],
  [['In this sense','So','從這意義上說'],['local environmental funding','money spent on local environmental problems','本地環境資金'],['not a luxury','not an extra','並非奢侈'],['basic form of public protection','helps keep the public safe','基本公共保障']],
  [['tackling global warming','action against global warming','應對全球暖化'],['depends on','needs','有賴於'],['strong local action','strong work in local places','強而有力本地行動']],
  [['Carbon emissions','Carbon pollution','碳排放'],['produced','comes from','產生'],['real streets, homes, factories and transport systems','real streets, homes, factories, and transport','街道家庭工廠與交通'],['abstract global arena','some separate place called “global.”','抽象全球場域']],
  [['invest in','pay for','投資'],['cleaner buses','cleaner buses','更清潔巴士'],['better recycling systems','better recycling','更完善回收'],['energy-efficient buildings','buildings that use less energy','節能建築'],['urban green spaces','green spaces in cities','城市綠化空間'],['at the same time','at the same time','同時']],
  [['Reducing this funding','Cutting this money','削減這筆資金'],['removing the bricks from a house','taking bricks out of a house','從房子拆走磚塊'],['strengthen its roof','make its roof stronger','加固屋頂']],
  [['serious climate strategy','good plan for the climate','認真的氣候策略'],['national vision','plan for the whole country','國家層面願景'],['practical local delivery','real work in local places','本地實際執行']],
  [['In conclusion','In short','總結'],['strongly disagree','strongly disagree','強烈不同意'],['divert money away from','take money away from','轉移資金'],['local environmental problems','local environmental problems','本地環境問題']],
  [['undeniably urgent','certainly urgent','無疑緊急'],['neglecting','ignoring','忽視'],['smaller environmental battles','smaller local efforts','較小型環境行動'],['protect communities','keep people safe','保護社區'],['reduce emissions','lower pollution','減少排放']],
  [['wiser approach','better plan','更明智做法'],['strengthen local environmental programmes','make local environmental work stronger','加強本地環境計劃'],['foundation','built on it','基礎'],['broader climate action','wider action on climate change','更廣泛氣候行動']],
];
const chunkOverrides=[
  ['Environmental damage is no longer a distant concern,','and governments must decide carefully where limited public money should go.'],
  ['Some argue that local environmental issues should receive less funding','so that more can be spent on global warming.'],
  ['I completely disagree with this view,','because local problems are often immediate threats to public health','and are also part of the wider climate crisis.'],
  ['First, local environmental problems are not minor','just because they happen close to home.'],
  ['Polluted rivers, poor air quality, illegal dumping and unsafe drinking water','can damage people’s daily lives far more directly than distant climate projections.'],
  ['If councils and national authorities cut spending in these areas,','ordinary citizens may pay the price through respiratory illness, contaminated neighbourhoods and declining living standards.'],
  ['For example, a city that neglects waste collection and drainage','may soon face blocked waterways, flooding and disease after heavy rain.'],
  ['In this sense, local environmental funding is not a luxury;','it is a basic form of public protection.'],
  ['Second, tackling global warming','actually depends on strong local action.'],
  ['Carbon emissions are produced in real streets, homes, factories and transport systems,','not in some abstract global arena.'],
  ['When governments invest in cleaner buses, better recycling systems, energy-efficient buildings and urban green spaces,','they are addressing local problems and climate change at the same time.'],
  ['Reducing this funding would therefore be like removing the bricks from a house','while trying to strengthen its roof.'],
  ['A serious climate strategy needs both a national vision','and practical local delivery.'],
  ['In conclusion, I strongly disagree','that governments should divert money away from local environmental problems.'],
  ['Global warming is undeniably urgent,','but it cannot be solved by neglecting the smaller environmental battles that protect communities and reduce emissions.'],
  ['The wiser approach is to strengthen local environmental programmes,','because they are the foundation on which broader climate action is built.'],
];
const simpleChunkOverrides=[
  ['Harm to the environment is a problem we face now,','and governments must choose carefully how to spend limited public money.'],
  ['Some people say local environmental problems should get less money','so governments can spend more on global warming.'],
  ['I strongly disagree because local problems can harm people’s health right away','and are also linked to the larger climate problem.'],
  ['First, problems with the local environment are not small','just because they happen near us.'],
  ['Dirty rivers, bad air, waste dumped in the wrong places, and unsafe drinking water','can harm daily life more directly than predictions about the future climate.'],
  ['If local and national governments spend less on these problems,','ordinary people may face breathing problems, dirty neighbourhoods, and a poorer quality of life.'],
  ['For example, a city that does not collect rubbish or look after drains','may soon have blocked waterways, floods, and illness after heavy rain.'],
  ['So money spent on local environmental problems is not an extra;','it helps keep the public safe.'],
  ['Second, action against global warming','needs strong work in local places.'],
  ['Carbon pollution comes from real streets, homes, factories, and transport,','not from some separate place called “global.”'],
  ['When governments pay for cleaner buses, better recycling, buildings that use less energy, and green spaces in cities,','they help local areas and the climate at the same time.'],
  ['Cutting this money would be like taking bricks out of a house','while trying to make its roof stronger.'],
  ['A good plan for the climate needs both a plan for the whole country','and real work in local places.'],
  ['In short, I strongly disagree','that governments should take money away from local environmental problems.'],
  ['Global warming is certainly urgent,','but we cannot solve it by ignoring smaller local efforts that keep people safe and lower pollution.'],
  ['A better plan is to make local environmental work stronger,','because wider action on climate change is built on it.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Flood risk is no longer a distant concern, and councils must decide carefully where limited public money should go.','no longer a distant concern 指問題當前；limited public money 引出資源分配。','作者在此建立預算情境，還未贊成削減本地開支。',[1,2,8],F('[環境破壞] is no longer [遙遠問題], and [政府] must decide carefully where [有限公帑] should go','以當前問題和預算限制導入政策選擇。','要說明一項公共問題已迫近，資源分配需謹慎時。',[['Environmental damage','slot','環境破壞'],[' is no longer ','link','不再是'],['a distant concern','slot','遙遠問題'],[', and ','link','而'],['governments','slot','政府'],[' must decide carefully where ','link','須慎定'],['limited public money','slot','有限公帑'],[' should go.','link','投向何處']])),
  S('Some argue that local flood defences should receive less funding so that more can be spent on national emergency planning.','so that 表目的：削減本地開支以增加全球暖化資金。','此句陳述反方的資金轉移方案，非作者主張。',[0,2,9],F('Some argue that [本地環境問題] should receive [較少資金] so that [更多資金可用於全球暖化]','交代待回應的預算轉移主張。','要呈現某方主張削減一處開支以加碼另一處時。',[['Some argue that ','link','引入主張'],['local environmental issues','slot','本地環境問題'],[' should receive ','link','應得到'],['less funding','slot','較少資金'],[' so that ','link','以便'],['more can be spent on global warming.','slot','更多資金可用於全球暖化']])),
  S('I completely disagree with this proposal, because local floods threaten residents now and are also part of a wider climate challenge.','because 後兩理由：即時公共健康與更廣氣候危機。','作者沒有否認全球暖化緊急。',[1,3,8],F('I completely disagree with [此觀點], because [本地問題即時威脅公共健康] and [也是氣候危機一部分]','引言立場和兩條主體論證一一對應。','反對把資源由一個目標轉往另一目標時，要預告原目標的直接與整體作用。',[['I completely disagree with ','link','表明反對'],['this view','slot','此觀點'],[', because ','link','第一理由'],['local problems are often immediate threats to public health','slot','本地問題即時威脅公共健康'],[' and are also ','link','而且'],['part of the wider climate crisis.','slot','也是氣候危機一部分']])),
  S('First, neighbourhood safety issues are not minor just because they happen close to home.','not minor just because 否定「近所以小」的錯誤判斷。','下一句用污染河流和空氣說明實際影響。',[2,4,5],F('[本地環境問題] are not [小事] just because [發生在身邊]','先糾正對本地問題重要性的低估。','當人們因問題的地理範圍小便輕視其危害時。',[['First, ','link','引出第一理由'],['local environmental problems','slot','本地環境問題'],[' are not ','link','並非'],['minor','slot','小事'],[' just because ','link','只因'],['they happen close to home.','slot','發生在身邊']])),
  S('Unsafe drinking water can damage families’ daily lives far more directly than distant forecasts.','具體列本地污染類型；far more directly than 比較即時可感風險。','作者並非說氣候預測不重要。',[3,5,6],F('[河流污染、空氣差、非法棄置及不安全飲水] can damage [日常生活] far more directly than [遙遠氣候預測]','以可見健康危害說明本地開支的重要。','要比較近身具體危害與較遠期風險的影響方式時。',[['Polluted rivers, poor air quality, illegal dumping and unsafe drinking water','slot','河流污染、空氣差、非法棄置及不安全飲水'],[' can damage ','link','可傷害'],['people’s daily lives','slot','日常生活'],[' far more directly than ','link','比...更直接'],['distant climate projections.','slot','遙遠氣候預測']])),
  S('If councils cut drainage maintenance, ordinary citizens may pay the price through flooded homes and unsafe streets.','If 設削支條件；may pay the price through 列居民可能承受的具體代價。','may 不等於所有削支都會帶來全部後果。',[4,6,7],F('If [地方與國家政府削減這些開支], [普通市民] may pay the price through [呼吸疾病、污染社區與生活水平下降]','把預算決策連到居民健康與生活後果。','要說明某項公共服務削減可能由誰承擔代價時。',[['If ','link','設定削支'],['councils and national authorities cut spending in these areas','slot','地方與國家政府削減這些開支'],[', ','link','則'],['ordinary citizens','slot','普通市民'],[' may pay the price through ','link','可能以...為代價'],['respiratory illness, contaminated neighbourhoods and declining living standards.','slot','呼吸疾病、污染社區與生活水平下降']])),
  S('For example, a town that leaves its drains blocked may soon face flooding and disease after heavy rain.','For example 給城市情境；may 保留暴雨後可能的後果。','此例並非聲稱每次下雨都會引起疾病。',[4,5,7],F('For example, [忽視垃圾收集和排水的城市] may face [暴雨後水道堵塞、水浸和疾病]','用一個城市服務例子具體化本地環境保護。','已提出一項風險後，要用可觀察情境說明缺少維護會造成甚麼後果。',[['For example, ','link','引出例子'],['a city that neglects waste collection and drainage','slot','忽視垃圾收集和排水的城市'],[' may soon face ','link','可能很快面對'],['blocked waterways, flooding and disease after heavy rain.','slot','暴雨後水道堵塞、水浸和疾病']])),
  S('In this sense, maintaining drains is not a luxury; it is a basic form of public protection.','not a luxury; it is... 將本地資金從可有可無改為基本保障。','此句回應削支理由，沒有給出精確成本。',[5,6,8],F('[本地環境資金] is not [奢侈品]; it is [基本公共保障]','把健康與城市例子收束為公共責任。','已說明某項開支保護使用者時，要糾正它只是奢侈享受的印象。',[['In this sense, ','link','由上述例子推論'],['local environmental funding','slot','本地環境資金'],[' is not ','link','並非'],['a luxury','slot','奢侈品'],['; it is ','link','而是'],['a basic form of public protection.','slot','基本公共保障']])),
  S('Second, reducing climate risks actually depends on practical action in each town.','actually depends on 反轉削減本地開支有助全球氣候的假設。','後文列排放來源及可同時改善兩方面的投資。',[2,9,10],F('[應對全球暖化] actually depends on [強力本地行動]','提出第二段的核心依賴關係。','當人們想處理大範圍問題卻忽略執行地點時。',[['Second, ','link','引出第二理由'],['tackling global warming','slot','應對全球暖化'],[' actually depends on ','link','其實有賴於'],['strong local action.','slot','強力本地行動']])),
  S('Vehicle emissions are produced in real streets and homes, not in some abstract global arena.','not in some abstract global arena 對比實際排放來源與抽象「全球」。','不是否認排放有全球效應，而是說其產生地具體。',[8,10,11],F('[碳排放] are produced in [街道、家庭、工廠和交通], not in [抽象全球場域]','說明全球問題由本地活動構成。','要把一個宏觀問題追溯到具體產生地點時。',[['Carbon emissions','slot','碳排放'],[' are produced in ','link','產生於'],['real streets, homes, factories and transport systems','slot','街道、家庭、工廠和交通'],[', not in ','link','而非'],['some abstract global arena.','slot','抽象全球場域']])),
  S('When councils invest in drainage and safer buildings, they are addressing local problems and climate change at the same time.','When...they...at the same time 顯示同一組投資兼顧本地和全球。','作者並非說每個項目都能同等程度處理兩個問題。',[8,9,11],F('When [政府投資巴士、回收、節能建築及綠地], they address [本地問題] and [氣候變化] at the same time','用具體措施證明本地與全球行動可合一。','要指出一項地方投資如何同時服務兩個政策目標時。',[['When ','link','設定投資'],['governments invest in cleaner buses, better recycling systems, energy-efficient buildings and urban green spaces','slot','政府投資巴士、回收、節能建築及綠地'],[', they are addressing ','link','便同時處理'],['local problems','slot','本地問題'],[' and ','link','以及'],['climate change','slot','氣候變化'],[' at the same time.','link','同時']])),
  S('Reducing local protection would therefore be like removing the bricks from a house while trying to strengthen its roof.','bricks/roof 比喻本地執行是更大氣候策略的承托結構。','不是建築工程建議，而是指出政策自相矛盾。',[9,10,12],F('[削減本地資金] would be like [拆走房屋磚塊] while [加固屋頂]','以比喻呈現「削基礎、強上層」的矛盾。','當提議為加強大目標而削弱其必要基礎時。',[['Reducing this funding','slot','削減本地資金'],[' would therefore be like ','link','便像'],['removing the bricks from a house','slot','拆走房屋磚塊'],[' while trying to ','link','同時想'],['strengthen its roof.','slot','加固屋頂']])),
  S('A serious safety strategy needs both a national vision and practical local delivery.','both...and... 並列上層願景和地方執行，回應前句房屋比喻。','作者沒有說單靠願景或地方行動足夠。',[8,10,11],F('[認真氣候策略] needs both [國家願景] and [本地實際執行]','用兩層協作方案收束第二段。','要說明大規模政策須兼有方向及落地執行時。',[['A serious climate strategy','slot','認真氣候策略'],[' needs both ','link','兩者皆需'],['a national vision','slot','國家願景'],[' and ','link','以及'],['practical local delivery.','slot','本地實際執行']])),
  S('In conclusion, I strongly disagree that councils should divert money away from neighbourhood flood prevention.','In conclusion 直接回應題目所提的 divert money。','作者不是主張忽視全球暖化。',[2,12,15],F('In conclusion, I strongly disagree that [政府應轉走本地環境資金]','結論明確拒絕預算轉移。','完成兩條理由後，要明確重申是否支持題目所提的資金轉移時。',[['In conclusion, I strongly disagree that ','link','總結反對'],['governments should divert money away from local environmental problems.','slot','政府應轉走本地環境資金']])),
  S('Climate adaptation is undeniably urgent, but it cannot be solved by neglecting local measures that keep homes safe.','but 把承認全球暖化迫切與反對忽視本地行動連起來。','「smaller」只指規模，沒有說本地行動不重要。',[8,13,15],F('[全球暖化] is undeniably [迫切], but it cannot be solved by [忽視保社區及減排的本地行動]','承認大問題重要，同時拒絕錯誤解法。','當某重大目標被用來否定支持它的較小措施時。',[['Global warming','slot','全球暖化'],[' is undeniably ','link','無疑'],['urgent','slot','迫切'],[', but it cannot be solved by ','link','卻不能靠'],['neglecting the smaller environmental battles that protect communities and reduce emissions.','slot','忽視保社區及減排的本地行動']])),
  S('The wiser approach is to strengthen local safety programmes, because they are the foundation on which broader climate action is built.','because 解釋加強本地計畫的理由：它們是廣泛氣候行動的基礎。','結論主張加強本地環境計畫，並非減少對全球問題的關注。',[8,11,14],F('The wiser approach is to [加強本地環境計畫], because they are [更廣氣候行動的基礎]','以本地行動支撐宏觀策略作結。','結尾要以一句建議說明較小單位的執行如何支持較大目標時。',[['The wiser approach is to ','link','提出更明智做法'],['strengthen local environmental programmes','slot','加強本地環境計畫'],[', because they are ','link','原因是它們是'],['the foundation on which broader climate action is built.','slot','更廣氣候行動的基礎']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否贊成削減本地環境開支以增加全球暖化預算？',['完全反對：本地問題直接威脅健康，本地行動亦支撐氣候策略','完全贊成：本地污染與居民無關','只贊成取消所有回收系統','沒有立場：文章只談有限公帑'],'I completely disagree；immediate threats to public health；part of wider climate crisis。'),
  {type:'multi',prompt:'選出文章兩條不同的反對理由',detail:'選兩項，再按「確認」。',options:['本地污染可直接傷及居民健康和生活，削支可能增加疾病與水浸風險','全球排放源自本地活動，清潔巴士、回收與節能建築可同時改善地方與氣候','全球暖化完全不緊急','本地環境計畫只能處理垃圾，與排放無關'],correct:[0,1],why:'第一段聚焦居民直接保障，第二段聚焦本地措施對全球氣候的作用。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對資金轉移','本地問題兼具健康危害與氣候關聯。'],
  ['主體段一 · 本地公共保障','河流、空氣、棄置及飲水問題直接影響居民；排水例子具體說明。'],
  ['主體段二 · 地方支撐全球','排放出自具體地方；地方投資能同時減排，國家願景需本地執行。'],
  ['結論 · 加強本地計畫','全球暖化迫切，卻不能靠削弱本地行動解決。'],
],'本地直接危害 → 本地資金保障 → 全球排放源在地方 → 地方執行支撐國家策略。')];
const evidence=[
  Q('文章列出哪些本地環境危害？',['河流污染、空氣差、非法棄置及不安全飲水','只列偏遠地區冰川變化','只列商場的室內裝飾','只列遙遠氣候預測，不談居民生活'],'四項本地問題可直接傷害日常生活。'),
  Q('削減地方環境開支可能令居民付甚麼代價？',['呼吸疾病、受污染社區與生活水平下降','保證每人免於疾病','只影響動物，居民毫無影響','必然使所有交通免費'],'may pay the price through... 是原文的可能後果。'),
  Q('垃圾與排水例子說明甚麼？',['忽視城市維護，暴雨後可能出現堵塞、水浸與疾病','任何暴雨都一定完全無害','只有全球會議能處理排水','垃圾收集與健康絕無關係'],'city neglects waste collection and drainage...may face...。'),
  Q('全球暖化為何需要本地環境行動？',['排放發生在街道、家庭、工廠與交通等真實地方','排放只發生在抽象全球場域','所有地方行動都無法影響排放','國家願景可完全取代實際執行'],'全球排放由具體地方活動產生，行動亦須落地。'),
  Q('哪些投資可同時處理本地問題與氣候變化？',['清潔巴士、較好回收、節能建築及城市綠地','只削減排水和垃圾收集','只增加演講而取消執行','只把本地預算轉走，不做任何項目'],'When governments invest in...they address both at the same time。'),
  Q('房屋「拆磚加屋頂」比喻指甚麼？',['削減支撐氣候行動的本地資金，卻想改善更大氣候目標，做法自相矛盾','作者真的建議拆掉所有房屋','屋頂工程是本文唯一環境政策','只要有國家願景，就不需地方執行'],'磚塊象徵本地基礎，屋頂象徵較廣氣候目標。'),
];
const logic=[
  sequence('第一主體段：本地環境開支為何是基本保障？',[
    ['糾正低估','本地問題不因發生在身邊便無關緊要。'],
    ['直接危害','河流、空氣、垃圾及飲水問題傷害日常生活。'],
    ['削支代價','居民可能面對呼吸疾病、污染社區與生活質素下降。'],
    ['城市例子','忽視垃圾及排水可使暴雨後堵塞、水浸及疾病出現。'],
    ['段落判斷','本地資金是基本公共保障而非奢侈。'],
  ],'近身問題有直接危害 → 削支由居民承擔 → 公共環境維護是基本保障。'),
  sequence('第二主體段：地方如何支撐全球氣候行動？',[
    ['中心關係','全球暖化應對依賴強力本地行動。'],
    ['排放來源','碳排放出自街道、家庭、工廠及交通。'],
    ['兼顧措施','清潔巴士、回收、節能建築與綠地同時服務地方和氣候。'],
    ['房屋比喻','削本地資金如拆磚卻想加固屋頂。'],
    ['政策結論','國家願景與實際本地執行兩者皆需。'],
  ],'宏觀排放有地方來源 → 地方投資能減排 → 不能削基礎 → 願景須落地。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一座城市為支持全球氣候基金，準備取消污染河流的清理預算。','本文第一主體段會指出甚麼？',['保留河流清理，因本地污染直接損及居民健康','只資助全球基金，不查河流對居民的影響','保留河流清理，但只按景觀美觀程度判斷','只改善全球指標，將飲水問題留給家庭'],['本地污染直接威脅健康，清理是基本公共保障。','全球目標不能取消居民面對的直接危害。','美觀不是河流清理的唯一或主要理由。','飲水安全是公共責任，不能只留給家庭。'],[3,4,7],'local environmental funding...basic form of public protection。'),
  T('某市削減垃圾收集與排水維護；其後暴雨使水道堵塞。','文章的例子會補上哪類風險？',['維護垃圾收集與排水，避免堵塞水浸和疾病','只重開排水設施，不處理堆積的垃圾','只清理暴雨後道路，不檢查水道與疾病','只用未來氣候預測，代替本地排水維護'],['原文的暴雨例子連起垃圾、排水、水浸與疾病。','只處理排水未必消除垃圾堵塞。','暴雨後清理也須關注水道與健康。','預測不能代替地方維護。'],[5,6,7],'neglects waste collection and drainage...blocked waterways, flooding and disease。'),
  T('有人認為本地空氣污染不重要，因它不像全球暖化那麼「大」。','哪項反駁最貼近文章？',['本地空氣差仍可直接傷人，不因範圍小而輕微','只看污染是否跨國，不問居民呼吸健康','只看全球暖化數字，不查本地空氣質素','本地空氣差會傷人，但無須任何治理支出'],['鄰近不代表危害輕微，空氣質素可直接傷害生活。','是否跨國不是健康影響的唯一尺度。','全球數字未代替本地空氣檢查。','承認危害後仍須考慮治理。'],[3,4,5],'local environmental problems are not minor just because they happen close to home。'),
  T('一國宣布減排，但不改善街道交通、住屋或工廠設施。','第二主體段指出甚麼缺口？',['國家減排目標需在街道住屋與工廠落實','國家減排目標只需文字承諾，不用設施','只改善國際報告，不查地方排放來源','只設總體數字，不問交通與建築怎樣改'],['排放源於真實街道、家居、工廠與交通系統。','承諾若無地方實行便不足。','報告不能代替排放來源的改善。','總體數字仍需具體地方措施。'],[8,9,12],'Carbon emissions are produced in real streets, homes, factories and transport systems。'),
  T('政府資助清潔巴士與節能公共建築，既改善本地空氣也減少排放。','這支持文章哪個推論？',['本地巴士與節能建築可同時改善空氣及減排','清潔巴士只改外觀，不需檢查能源使用','節能建築只求省錢，不看本地空氣影響','兩者改善本地環境，卻不可能影響氣候'],['cleaner buses 與 energy-efficient buildings 可兼顧兩層目標。','外觀變化未必改善排放。','建築節能也可有環境效益。','地方措施也可能影響整體氣候。'],[8,9,10],'addressing local problems and climate change at the same time。'),
  T('某部門要完成全國減排目標，卻削減地方回收與城市綠化預算。','房屋比喻如何套用？',['削弱地方回收，可能妨礙全國減排目標落實','保留全國目標，地方回收便可全數取消','先削地方綠化，再假定國家減排會更快','只看比喻的屋頂，不查實際地方執行'],['房屋比喻指地方計畫支撐更大氣候目標。','削掉基礎可能削弱總目標。','地方綠化並非與減排無關。','比喻必須還原成地方執行的邏輯。'],[10,11,12,15],'removing the bricks from a house while trying to strengthen its roof。'),
  T('一份政策文件只有「全國零排放」願景，沒有地方交通或建築措施。','作者會要求補上甚麼？',['國家願景要配合地方交通與建築的具體行動','只訂國家願景，不安排任何具體地方執行','只推地方活動，卻不需整體政策的方向','只列建築名稱，不查是否真的減少排放'],['原文明說 national vision 與 practical local delivery 都需要。','願景沒有執行不足以改變排放。','地方行動也需整體方向。','措施效果須檢查，名稱不足。'],[10,11,12],'both a national vision and practical local delivery。'),
  T('另一議題中，政府打算削減社區防災，以增加全國危機應對基金。','哪個可跨題檢查最有用？',['先查社區防災是否支撐全國應對及居民安全','先增加全國基金，不查地方災害的風險','只看基金名稱，不評估它與社區的連結','只保留地方措施，毋須任何全國性規劃'],['跨題要檢查地方服務的直接保障和對全國目標的作用。','全國基金不能自動代替社區防災。','名稱不能證明兩層政策如何相連。','原文也主張全國願景。'],[2,5,8,12,15],'local problems...part of wider climate crisis；foundation。'),
  T('有人把作者立場寫成：「全球暖化不緊急，所以只處理本地垃圾。」','哪項修正準確？',['承認暖化迫切，也支持以本地行動應對','認為暖化不急，只須處理本地垃圾','承認暖化迫切，卻取消所有地方計畫','只追求國家願景，不問地方如何實行'],['undeniably urgent 保留暖化緊迫性，地方行動是解法之一。','把暖化說成不急與結論相反。','取消地方計畫削弱實行基礎。','作者要求具體地方執行。'],[2,8,12,14,15],'Global warming is undeniably urgent, but it cannot be solved by neglecting...。'),
  T('市政府評估安全飲用水與綠化計畫，認為它們只處理小地方事務。','文章可補上哪兩層價值？',['飲水保居民健康；地方綠化亦可支援更廣目標','只看綠化的美觀，不問飲水的健康問題','只看全球氣候目標，不查本地直接危害','只處理飲水健康，不評估綠化減排效果'],['文章分別說明本地直接健康益處與更廣氣候作用。','美觀不能取代飲水保障。','忽略本地危害會漏掉第一理由。','地方綠化也可支撐氣候行動。'],[4,7,8,10,15],'public protection；addressing local problems and climate change。'),
  T('某人說：「若資金有限，環境政策只能選本地或全球其中一個。」','本文最直接的回答是甚麼？',['本地投資可同時保居民並減排，毋須二選一','兩者互斥，全球目標必須先取消本地工作','地方投資只保護居民，絕不影響排放','兩者皆重要，但不必比較實際項目成效'],['很多本地措施同時改善生活與減排，非必然零和。','原文反對以全球名義取消地方支出。','地方投資可能影響排放。','並行仍需評估項目成效。'],[0,8,9,10,12],'addressing local problems and climate change at the same time。'),
  T('要用一句話準確概括全文。','哪項最好？',['保留地方環境支出，兼顧居民保障與減排','只資助全球暖化工作，不處理飲水問題','只處理本地污染，不承認暖化的急迫性','只宣布國家願景，不支援地方實際執行'],['結論把地方公共保障與更廣氣候行動相連。','飲水是原文所列直接危害。','作者承認暖化迫切。','願景需要地方實行才有效。'],[2,3,7,8,10,13,14,15],'local problems...immediate threats；foundation on which broader climate action is built。'),
];
export default {
  key:'opinion:44',
  meta:{topic:'本地環境資金與全球暖化行動',summary:'作者反對削減本地環境資金以增加全球暖化開支。本地河流、空氣、垃圾及飲水問題可直接危及居民健康與生活；地方行動亦是全球氣候策略的實際基礎。清潔巴士、回收、節能建築和綠地等投資可同時改善本地與氣候問題。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
