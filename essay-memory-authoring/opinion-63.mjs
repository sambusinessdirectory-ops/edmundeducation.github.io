const simple=[
  'Some people say important services like shops, schools, and shopping areas should move out of the middle of cities.',
  'I strongly disagree because this would make important places harder to reach and make cities less active for both people and businesses.',
  'The main reason to keep these services in the centre is that people can get to them easily.',
  'City centres are often where bus and train routes come together, so people from different areas can reach schools, shops, and jobs without long trips.',
  'If these services move to the outside of a city, many people will need a car or will spend longer on public transport.',
  'This would be especially hard for families with small children, older people, and workers with little money, who may lack the money or freedom to travel far every day.',
  'For example, a parent who can now take a child to a school nearby and then walk to work may instead have to make an expensive journey.',
  'So moving the services would not make a city work better; it would only make everyday life harder and less fair.',
  'Another reason is that these places help the middle of a city stay busy.',
  'Shops, schools, and shopping centres bring people to the streets, provide jobs, and help people meet regularly.',
  'Without them, the middle of the city could become an empty place that people pass through instead of a place where neighbours actually live and meet.',
  'Moving businesses to the outside could also make people depend more on cars, adding traffic jams and dirty air instead of reducing them.',
  'A good city centre should not be a quiet area with only offices and roads; it should have different useful places where people can study, work, shop, and meet in one area.',
  'In short, I strongly disagree that important services should move out of city centres.',
  'Keeping them there makes services easier to reach, keeps city life active, and makes cities work better for people who use them each day.',
];
const vocabulary=[
  [['Some people argue','Some people say','有些人認為'],['key services','important services','主要服務'],['commercial centres','shopping areas','商業中心'],['moved away from central urban areas','move out of the middle of cities','搬離市中心']],
  [['completely disagree','strongly disagree','完全不同意'],['reduce access to essential facilities','make important places harder to reach','降低基本設施可及性'],['weaken the social and economic life of cities','make cities less active for both people and businesses','削弱社會經濟活力']],
  [['strongest reason','main reason','最有力理由'],['keeping these services in city centres','keep these services in the centre','服務留在市中心'],['accessibility','people can get to them easily','可及性']],
  [['Central districts','City centres','中心地區'],['transport networks meet','bus and train routes come together','交通網絡匯聚'],['different neighbourhoods','different areas','不同社區'],['reach','reach','到達'],['without travelling far','without long trips','不用長途跋涉']],
  [['pushed to the outskirts','move to the outside of a city','被推往外圍'],['residents','people','居民'],['rely on cars','need a car','依賴汽車'],['longer public-transport journeys','spend longer on public transport','更長公共交通旅程']],
  [['especially harmful','especially hard','尤其不利'],['young children','small children','年幼子女'],['elderly people','older people','長者'],['low-income workers','workers with little money','低收入工人'],['money or flexibility','money or freedom','金錢或時間彈性'],['long distances every day','far every day','每天長距離']],
  [['For example','For example','例如'],['nearby school','school nearby','附近學校'],['walk to work','walk to work','步行上班'],['forced into a costly commute','have to make an expensive journey','被迫昂貴通勤']],
  [['Relocation','moving the services','搬遷'],['better organised','work better','規劃更好'],['daily life','everyday life','日常生活'],['less convenient and less fair','harder and less fair','更不方便不公平']],
  [['Another important point','Another reason','另一重要觀點'],['these services','these places','這些服務'],['keep city centres alive','help the middle of a city stay busy','維持市中心活力']],
  [['commercial centres','shopping centres','商業中心'],['foot traffic','people to the streets','人流'],['employment','jobs','就業'],['regular human interaction','help people meet regularly','持續互動']],
  [['central areas','middle of the city','中心地區'],['empty spaces','empty place','空洞空間'],['pass through','pass through','經過'],['communities actually function','neighbours actually live and meet','社區真正運作']],
  [['edge of the city','outside','城市邊緣'],['car-dependent development','make people depend more on cars','依賴汽車的發展'],['increasing congestion and pollution','adding traffic jams and dirty air','增加擠塞污染'],['instead of reducing them','instead of reducing them','而非減少']],
  [['healthy city centre','good city centre','健康市中心'],['silent monument of offices and roads','quiet area with only offices and roads','辦公室道路的沉默紀念碑'],['mixed, active environment','different useful places','混合活躍環境'],['buy goods','shop','購物'],['in the same area','in one area','同一區域']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['major services','important services','主要服務'],['relocated out of city centres','move out of city centres','搬離市中心']],
  [['Keeping them there','Keeping them there','保留在當地'],['protects accessibility','makes services easier to reach','保障可及性'],['supports urban life','keeps city life active','支持城市生活'],['more practical','work better','更實用'],['use them every day','use them each day','每天使用']],
];
const chunkOverrides=[
  ['Some people argue that key services, including shops, schools and commercial centres,','should be moved away from central urban areas.'],
  ['I completely disagree,','because this would reduce access to essential facilities and weaken the social and economic life of cities.'],
  ['The strongest reason for keeping these services in city centres','is accessibility.'],
  ['Central districts are usually where transport networks meet,','so people from different neighbourhoods can reach schools, shops and workplaces without travelling far.'],
  ['If these services were pushed to the outskirts,','many residents would have to rely on cars or longer public-transport journeys.'],
  ['This would be especially harmful for families with young children, elderly people and low-income workers,','who may not have the money or flexibility to travel long distances every day.'],
  ['For example, a parent who can now take a child to a nearby school and then walk to work','might be forced into a costly commute.'],
  ['Relocation, therefore, would not make cities better organised;','it would simply make daily life less convenient and less fair.'],
  ['Another important point is that','these services keep city centres alive.'],
  ['Shops, schools and commercial centres create foot traffic,','employment and regular human interaction.'],
  ['Without them, central areas could become empty spaces','that people pass through rather than places where communities actually function.'],
  ['Moving businesses to the edge of the city could also encourage car-dependent development,','increasing congestion and pollution instead of reducing them.'],
  ['A healthy city centre should not be a silent monument of offices and roads;','it should be a mixed, active environment where people can learn, work, buy goods and meet others in the same area.'],
  ['In conclusion, I completely disagree','that major services should be relocated out of city centres.'],
  ['Keeping them there protects accessibility, supports urban life','and makes cities more practical for the people who use them every day.'],
];
const simpleChunkOverrides=[
  ['Some people say important services like shops, schools, and shopping areas','should move out of the middle of cities.'],
  ['I strongly disagree','because this would make important places harder to reach and make cities less active for both people and businesses.'],
  ['The main reason to keep these services in the centre','is that people can get to them easily.'],
  ['City centres are often where bus and train routes come together,','so people from different areas can reach schools, shops, and jobs without long trips.'],
  ['If these services move to the outside of a city,','many people will need a car or will spend longer on public transport.'],
  ['This would be especially hard for families with small children, older people, and workers with little money,','who may lack the money or freedom to travel far every day.'],
  ['For example, a parent who can now take a child to a school nearby and then walk to work','may instead have to make an expensive journey.'],
  ['So moving the services would not make a city work better;','it would only make everyday life harder and less fair.'],
  ['Another reason is that','these places help the middle of a city stay busy.'],
  ['Shops, schools, and shopping centres bring people to the streets,','provide jobs, and help people meet regularly.'],
  ['Without them, the middle of the city could become an empty place','that people pass through instead of a place where neighbours actually live and meet.'],
  ['Moving businesses to the outside could also make people depend more on cars,','adding traffic jams and dirty air instead of reducing them.'],
  ['A good city centre should not be a quiet area with only offices and roads;','it should have different useful places where people can study, work, shop, and meet in one area.'],
  ['In short, I strongly disagree','that important services should move out of city centres.'],
  ['Keeping them there makes services easier to reach, keeps city life active,','and makes cities work better for people who use them each day.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Some people argue that key services, including libraries and clinics, should be moved away from small towns.','including 插入具體設施；主句仍是應否搬遷的主張。','這句是他人觀點，不是作者立場。',[1,2,13],F('Some people argue that [主要服務], including [例子], should be moved away from [原地]','準確介紹待回應的搬遷提議。','題目主張把一類設施移走時，先列出其具體成員。',[['Some people argue that ','link','引述主張'],['key services','slot','主要服務'],[', including ','link','列舉'],['shops, schools and commercial centres','slot','例子'],[', should be moved away from ','link','建議搬離'],['central urban areas.','slot','原地']])),
  S('I completely disagree, because this would make schools harder to reach and weaken village life.','because 預告可及性和地方活力兩條不同理由。','作者不是只表達喜好，而是列出具體後果。',[0,2,8],F('I completely disagree, because this would [損害可及性] and [削弱地方活力]','在立場句預告兩段理由。','反對一項搬遷提議時，要交代受眾與地方各受甚麼損失。',[['I completely disagree, because this would ','link','明確反對並說明後果'],['reduce access to essential facilities','slot','損害可及性'],[' and ','link','以及'],['weaken the social and economic life of cities.','slot','削弱地方活力']])),
  S('The strongest reason for keeping these services in village centres is accessibility.','以 accessibility 作首項理由的核心名詞，後續才展開。','這是段落主張，交通細節在下一句。',[1,3,8],F('The strongest reason for keeping [服務] in [中心] is accessibility','以簡短句明示第一段的衡量標準。','主體段要先交代為甚麼某設施應留在容易到達的位置時。',[['The strongest reason for keeping ','link','最有力理由'],['these services','slot','服務'],[' in ','link','在'],['city centres','slot','中心'],[' is accessibility.','link','是可及性']])),
  S('Central schools are usually where bus routes meet, so pupils from different villages can reach lessons without travelling far.','so 連接交通匯聚與跨社區可到達性。','中心地段的價值是交通連結，不是只因位於地圖中間。',[2,4,5],F('[中心地區] are where [交通路線] meet, so [不同地區的人] can reach [服務] without travelling far','說明交通樞紐如何降低日常行程負擔。','提出可及性之後，需要解釋路線匯聚如何幫助不同地方的人時。',[['Central districts','slot','中心地區'],[' are usually where ','link','通常是'],['transport networks','slot','交通路線'],[' meet, so ','link','匯聚，因此'],['people from different neighbourhoods','slot','不同地區的人'],[' can reach ','link','能到達'],['schools, shops and workplaces','slot','服務'],[' without travelling far.','link','不用遠行']])),
  S('If health centres were pushed to the outskirts, many patients would have to rely on cars or longer bus journeys.','If 設搬遷情境；would have to 指後果與被迫選擇。','句子寫多數人的交通負擔，不宣稱人人都有車。',[3,5,6],F('If [服務] were pushed to [外圍], many [人] would have to rely on [較費力交通]','用反面假設展示搬遷的實際代價。','要讓讀者看見把服務移遠後，使用者交通如何改變時。',[['If ','link','設假設'],['these services','slot','服務'],[' were pushed to ','link','移到'],['the outskirts','slot','外圍'],[', many ','link','許多'],['residents','slot','人'],[' would have to rely on ','link','被迫依賴'],['cars or longer public-transport journeys.','slot','較費力交通']])),
  S('This would be especially harmful for elderly residents and poorer families, who may not have the money or time to travel far each day.','especially 指受影響更大的群體；who 補上原因。','不是說所有弱勢者都完全無法出行，而是負擔較重。',[3,4,6],F('This would be especially harmful for [較脆弱群體], who may not have [出行資源]','指出一般交通代價分配得不公平。','已說明普遍負擔後，要分析哪些人承受得更困難及原因時。',[['This would be especially harmful for ','link','對...尤其不利'],['families with young children, elderly people and low-income workers','slot','較脆弱群體'],[', who may not have ','link','因未必有'],['the money or flexibility to travel long distances every day.','slot','出行資源']])),
  S('For example, a parent who can now take a child to a nearby library and then walk to work might be forced into a costly commute.','具體人物與前後行程讓交通負擔可想像。','例子不只是說通勤會增加，而是日常兩件事的連鎖。',[4,5,7],F('For example, [目前可串連兩件日常事的人] might be forced into [昂貴行程]','用一個人展示搬遷如何打亂既有日常路線。','抽象的交通代價需要轉成家庭可感受的具體一天時。',[['For example, ','link','舉例'],['a parent who can now take a child to a nearby school and then walk to work','slot','目前可串連兩件日常事的人'],[' might be forced into ','link','可能被迫'],['a costly commute.','slot','昂貴行程']])),
  S('Relocation, therefore, would not make schools better organised; it would simply make daily life less convenient and less fair.','would not...; it would... 駁回預期好處並提出實際後果。','作者不否認管理問題可能存在，只說此搬遷不能改善。',[4,6,8],F('[搬遷], therefore, would not make [地方] better organised; it would make daily life [兩項負面結果]','以對照句收束可及性及公平論證。','對方認為改動能改善組織時，要檢查它是否反而增加使用者負擔。',[['Relocation','slot','搬遷'],[', therefore, would not make ','link','因此不會使'],['cities','slot','地方'],[' better organised; it would simply make daily life ','link','更有規劃；反而使生活'],['less convenient and less fair.','slot','兩項負面結果']])),
  S('Another important point is that libraries keep town centres alive.','另一理由由個人可及性轉向整個地方的活力。','不是重複首段交通時間。',[2,7,9],F('Another important point is that [服務] keep [中心地方] alive','開第二段，指出服務對整體地方的作用。','前段談使用者方便後，需要再談設施如何維持地方的活動量時。',[['Another important point is that ','link','另一重要觀點'],['these services','slot','服務'],[' keep ','link','維持'],['city centres','slot','中心地方'],[' alive.','link','活力']])),
  S('Libraries, clinics and markets create foot traffic, employment and regular human interaction.','三項平行結果由人流推到工作及人際往來。','不能把市中心活力只理解為商店營業額。',[8,10,11],F('[多類服務] create [人流], [就業] and [定期互動]','把「活力」拆成可觀察的三個面向。','提出地方活力後，需要指出實際會增加哪些活動時。',[['Shops, schools and commercial centres','slot','多類服務'],[' create ','link','帶來'],['foot traffic','slot','人流'],[', ','link','並列'],['employment','slot','就業'],[' and ','link','再加'],['regular human interaction.','slot','定期互動']])),
  S('Without them, village centres could become empty spaces that people pass through rather than places where communities actually function.','Without them 設移走服務；rather than 對照通道與真正社區。','可能變空洞，不是必然完全無人。',[8,9,12],F('Without [服務], [中心] could become [只供經過的空間] rather than [真正運作的社區]','以反面情境說明服務對地方社會功能的重要。','要展示失去設施後地方可能只剩通行而缺少生活時。',[['Without ','link','提出失去條件'],['them','slot','服務'],[', ','link','承接主語'],['central areas','slot','中心'],[' could become ','link','可能變成'],['empty spaces that people pass through','slot','只供經過的空間'],[' rather than ','link','而非'],['places where communities actually function.','slot','真正運作的社區']])),
  S('Moving clinics to the edge of a town could also encourage car-dependent travel, increasing congestion and pollution instead of reducing them.','-ing 後果補充：車依賴可能增加擠塞與污染，與原本目標相反。','could 表示可能，不是每個搬遷都必然如此。',[4,9,10],F('Moving [服務] to [外圍] could encourage [車依賴], increasing [兩項負擔] instead of reducing them','補上搬遷帶來的次生交通與環境後果。','要說明一項措施可能產生與目標相反的結果，並用 instead of 點出反差時。',[['Moving ','link','搬遷'],['businesses','slot','服務'],[' to ','link','去'],['the edge of the city','slot','外圍'],[' could also encourage ','link','也可能鼓勵'],['car-dependent development','slot','車依賴'],[', increasing ','link','增加'],['congestion and pollution','slot','兩項負擔'],[' instead of reducing them.','link','而非減少']])),
  S('A healthy school should not be a silent monument of desks and walls; it should be a mixed, active environment where pupils can read, play and meet others in the same area.','not...; it should... 駁回單一沉默用途並提出混合活躍場所。','作者希望市中心多功能，不是只要求熱鬧噪音。',[8,10,11],F('A healthy [地方] should not be [沉默單一用途]; it should be [混合活躍環境] where [人] can [多項活動]','以清晰的正反圖像表達地方設計原則。','已列人流、工作與交流後，要描畫一個真正有活力的場所時。',[['A healthy ','link','評價地方'],['city centre','slot','地方'],[' should not be ','link','不應只是'],['a silent monument of offices and roads','slot','沉默單一用途'],['; it should be ','link','而應是'],['a mixed, active environment','slot','混合活躍環境'],[' where ','link','讓'],['people','slot','人'],[' can ','link','可'],['learn, work, buy goods and meet others in the same area.','slot','多項活動']])),
  S('In conclusion, I completely disagree that schools should be relocated out of town centres.','結論直接回到是否搬遷，不轉成折衷立場。','前文兩理由均支持留在中心。',[0,1,14],F('In conclusion, I completely disagree that [主要服務] should be relocated out of [中心]','末段明確重申題目中的搬遷問題。','全文持明確反對立場時，結論要直接回應原題。',[['In conclusion, I completely disagree that ','link','總結反對'],['major services','slot','主要服務'],[' should be relocated out of ','link','不應搬離'],['city centres.','slot','中心']])),
  S('Keeping them there protects access, supports village life and makes towns more practical for people who use them every day.','三個平行動詞回收可及性、城市活力及日常實用性。','結論重述已論好處，沒有加入新理由。',[2,8,13],F('Keeping them there protects [可及性], supports [地方活力] and makes [地方] more practical for [日常使用者]','一句回收兩段主體的好處。','重申反對搬遷後，要簡潔合併個人與地方層面的理由時。',[['Keeping them there protects ','link','保留可保障'],['accessibility','slot','可及性'],[', supports ','link','支持'],['urban life','slot','地方活力'],[' and makes ','link','並使'],['cities','slot','地方'],[' more practical for ','link','更實用於'],['the people who use them every day.','slot','日常使用者']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對把主要服務搬離市中心持甚麼立場？',['完全反對；外移使服務較難到達，也削弱市中心活力','完全同意；應全部搬走','沒有立場；只描述市中心地圖','只支持搬遷商店，不談其他設施'],'引言寫 completely disagree，並預告可及性與城市生活。'),
  {type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['中心是交通匯聚處，搬遷增加通勤及弱勢家庭負擔','商店學校帶來人流、工作與交流，維持中心活力','所有居民都有私家車及足夠通勤時間','市中心只應由辦公室和道路組成'],correct:[0,1],why:'第一段論可及性及公平；第二段論地方活力及次生交通。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 完全反對外移','搬離商店、學校及商業中心會削弱可及性與城市生活。'],
  ['主體一 · 可及性與公平','中心交通匯聚；外移增加較脆弱群體的通勤成本。'],
  ['主體二 · 保持市中心活力','服務帶來人流、就業及互動；外移亦可能增加汽車依賴。'],
  ['結論 · 保留主要服務','保護方便、活力與每天使用城市者的實際需要。'],
],'交通樞紐 → 外移負擔 → 地方活力 → 反對搬遷。')];
const evidence=[
  Q('為何市中心較容易到達？',['交通網絡通常在中心匯聚，來自不同社區的人不必遠行','因為市中心沒有道路','因為每位居民都住在中心','因為學校不需要交通'],'transport networks meet。'),
  Q('服務外移後，居民可能如何出行？',['依賴汽車或乘坐更久的公共交通','完全毋須交通','只需在家步行兩步','所有人立即找到附近服務'],'cars or longer public-transport journeys。'),
  Q('哪些群體特別可能承受外移負擔？',['有年幼子女家庭、長者與低收入工人','只有地產發展商','只有外國遊客','只有擁有多輛汽車者'],'尤其可能缺少金錢或時間彈性。'),
  Q('家長例子中，搬遷會打亂甚麼日常路線？',['先送孩子到附近學校，再步行上班','先去機場再到港口','只在週末去商店','每天乘飛機上班'],'原文連兩件可串連的日常事。'),
  Q('第二段的「活力」有哪些可觀察面向？',['人流、就業與經常的人際互動','只有樓宇高度','只有辦公室租金','只有道路寬度'],'foot traffic, employment, regular human interaction。'),
  Q('把商業設施搬到邊緣可能增加甚麼？',['對汽車的依賴、交通擠塞與污染','中心行人一定更多','醫院必然空置','所有通勤時間立即縮短'],'could encourage car-dependent development。'),
];
const logic=[
  sequence('第一主體段：搬遷如何傷害可及性？',[
    ['主張','主要服務留在中心的核心理由是容易到達。'],
    ['交通機制','路線在中心匯聚，讓不同社區不用遠行。'],
    ['搬遷後果','外圍設施使人更依賴車或長時間公共交通。'],
    ['不公平分布','有孩子家庭、長者及低收入者尤其難承受。'],
    ['家長例子','送孩子上學再步行上班的路線變成昂貴通勤。'],
    ['段落結論','外移並不改善組織，反而使生活不便又不公平。'],
  ],'中心交通 → 方便到達 → 外移增加出行 → 弱勢承擔更多。'),
  sequence('第二主體段：服務如何維持中心活力？',[
    ['另一理由','這些服務讓市中心保持活力。'],
    ['具體活動','人流、就業和經常交流。'],
    ['反面情況','沒有服務，中心可能只剩經過而非生活。'],
    ['次生交通','外移可能鼓勵車依賴與污染。'],
    ['城市圖像','健康中心應讓人同區學習、工作、購物與相遇。'],
  ],'服務聚集 → 人流與社區功能 → 防止空洞化與車依賴。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('鎮議會要把唯一公共圖書館搬到外圍工業區。','哪項可及性檢查最重要？',['比較各區居民到新舊館的路線、時間及交通費用','只比較新館外牆顏色，毋須理會讀者通勤','假設每名長者都有汽車，故毋須問實際路線','只記錄新館面積，不評估居民能否到達'],['中心交通匯聚，外移可增加使用門檻。','裝潢不替代可到達性。','長者不一定能開車。','面積未說明通勤代價。'],[2,3,4,5],'accessibility；transport networks meet。'),
  T('一個城市打算把學校移往郊外，聲稱只會改善規劃。','哪項反問最貼近第一段？',['學生與家長是否因此更依賴汽車或花更久通勤？','校舍名稱是否比原來更短、更容易印在信封？','只要搬出中心，所有家庭的交通便必然改善','學校外牆顏色是否比舊校舍看起來更鮮明？'],['先查日常出行，再評估「更有規劃」。','校名不是交通影響。','土地成本不足以代表家庭成本。','學生通勤是題目關鍵。'],[3,4,6,7],'cars or longer public-transport journeys。'),
  T('一位家長目前可先送孩子上學，再步行去工作。','怎樣把外移的影響寫得具體？',['描寫兩件日常事原本順路，外移後可能多一程昂貴交通','只寫「城市變差」，不說哪一段路線受到影響','只比較學校和公司建築高度，不提家長時間','聲稱任何家長搬遷後都必然立即失去工作'],['原文以一個家長的串連行程具體化代價。','要說明具體哪段行程變長。','距離之外還有費用。','不同家庭資源不同。'],[5,6],'parent...nearby school...walk to work。'),
  T('搬遷服務對不同居民的影響未必相同。','哪項公平分析最準確？',['有孩子家庭、長者及低收入者可能較缺錢與時間彈性','所有人都擁有相同收入和交通選擇，無須分群','只問有車人士的意見，就足以代表全城家庭','服務外移只影響遊客，不影響每天使用它的居民'],['especially harmful...who may not have money or flexibility。','有車者不足以代表各群體。','長者也是服務使用者。','收入影響交通選擇。'],[4,5],'especially harmful；money or flexibility。'),
  T('某鎮把市場和診所都搬走，中心只剩車道和空辦公樓。','文章如何解釋這種損失？',['沒有日常服務，中心可變成只供經過而缺少社區生活的地方','車道越多就必然創造更多就業與人際互動','只要保留大樓外觀，中心的社會功能便完全不變','居民仍會每天專程走到空辦公樓交流和購物'],['pass through rather than communities function。','空樓不能代替社區互動。','只經過正是失去公共生活。','外觀存在未必保留功能。'],[8,9,10,12],'empty spaces people pass through。'),
  T('有人說「服務搬走後，中心只是安靜一些，並無損失」。','哪項反駁更完整？',['商店與學校帶來人流、工作和互動，消失後不只是聲音變小','中心只要安靜，就必然更能滿足所有居民需要','只需計算商店招牌數目，不用看人如何使用中心','服務搬遷只會影響租金，與社區活動完全無關'],['活力包括三種可觀察活動。','安靜可能伴隨失去商業活力。','招牌數不等於人流。','社交也是中心功能。'],[8,9,10],'foot traffic, employment, interaction。'),
  T('一間社區診所搬到郊外後，多數人需駕車前往。','哪項次生後果符合文章？',['汽車依賴可能增加道路擠塞及污染，未必改善城市環境','市郊診所一開，所有人便必然立即改乘單車','搬遷對交通模式毫無影響，也不會增加任何車程','只要新診所設備較好，交通和環境代價便不存在'],['could encourage car-dependent development。','更好設備不消除交通代價。','車程是主要反對理由。','多開車可能增污染。'],[4,11],'car-dependent development；congestion and pollution。'),
  T('某校只保留教室和走廊，取消食堂、圖書館和相遇空間。','哪個城市設計原則可轉用？',['健康場所要能讓人學習、工作及相遇，不能只剩單一功能','只要有課室，學生便永遠不需要其他公共空間','把全部走廊擴闊，便能取代每一項日常服務','學校沒有商店，所以不能比較場所的混合功能'],['mixed, active environment 是跨題原則。','課室以外也要有共享功能。','圖書與用餐是日常用途。','課時未衡量相遇機會。'],[9,10,12],'mixed, active environment。'),
  T('市政府以「讓中心更有秩序」為搬遷理由，但居民的日常行程變長。','如何評估這個說法？',['檢查聲稱的組織改善是否抵得上更不方便與不公平的生活','只重複「更有秩序」，無須查居民是否真的受惠','若地圖看起來整齊，居民通勤便一定更省時','只訪問規劃部門，不問每天使用服務的人'],['would not make better organised; less convenient/fair。','遷前需評估實際代價。','地圖整齊不等於居民方便。','使用者意見不可省略。'],[5,6,7],'not make cities better organised。'),
  T('某商業區只有辦公室，夜間與週末幾乎沒有人停留。','文章會建議甚麼方向？',['讓學習、工作、購物和交流等用途在同一區域並存','把剩下的商店與學校全部搬到更遠郊區','只興建更多道路，便能形成持續人際交流','只保留辦公樓外牆，社區活力便會自然回來'],['健康中心應有混合活躍用途。','辦公樓夜間少人。','混合用途應規劃在同區。','外觀不代替商店學校。'],[8,9,10,12],'learn, work, buy goods and meet。'),
  T('要評估一項外移計劃是否公正。','文章提示不能只看甚麼？',['不能只看設施能否建成，還要看誰可到達及誰負擔通勤','只需知道新設施開幕日，便可判定每戶的交通負擔','只需估計商戶租金，居民可及性無須檢查','只問有車人士即可，因為他們代表所有使用者'],['可及性與弱勢分布是第一段關鍵。','落成不等於人人能到。','可及性也是公平標準。','弱勢者負擔可能更重。'],[2,3,4,5,6],'accessibility；especially harmful。'),
  T('要一句話概括全文。','哪項最準確？',['保留主要服務於中心可維持易達、公平與日常活力，外移還可能增加車依賴','作者認為所有主要服務都應搬往郊外才會更公平','文章只談道路顏色，沒有討論居民使用服務的問題','城市中心只需安靜的辦公大樓，不需要商店學校'],['整合首段交通公平、次段活力與車依賴。','通勤問題需在決策前看。','只留辦公樓會失活力。','公平是全文核心之一。'],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],'accessibility；urban life；car dependence。'),
];
const balancedOptions=[["比較新舊館的路線、時間及交通費","先比較新館裝潢，通勤可在搬遷後評估","假定長者可開車，再計館舍面積","只看新館面積，不查居民交通負擔"],["搬校後家長學生是否更依賴汽車通勤","先看校舍名稱，交通安排可留待下學期","搬出市中心後，可先只比較土地成本","先看外牆設計，不查學生通勤變化"],["原來順路，外移後或多一程昂貴交通","只說城市變差，家長路線可不具體描述","只比較學校與公司距離，不計花費","家長受影響，便可當作每家都同樣受影響"],["家庭長者及低收入者較缺時間金錢彈性","有車家庭較方便，可先只問他們意見","服務外移可減市區人流，長者需求可後看","收入不同，但先假定交通選項相同"],["服務搬走後，中心或失去社區生活","車道仍在，中心社區功能可由辦公樓承接","市場診所搬走，居民可只在中心短暫經過","舊建築仍在，便不必查人流與互動"],["商店學校帶來人流工作，不只影響安靜","中心安靜有益，商店人流可先不計","先計招牌數量，不看居民如何使用街道","服務外移影響租金，人際交流可後評估"],["診所外移或增車程擠塞和污染","診所設備更好，交通成本可稍後比較","市郊位置可擴面積，車程增加可略過","居民改開車，排放影響可待後續研究"],["健康場所要讓人學習工作也能相遇","課室足以教學，其他相遇空間可後建","走廊擴闊，圖書與用餐可另行安排","只看課時數，不評估校園日常互動"],["看秩序收益是否換來通勤和公平代價","秩序改善可見，居民通勤可待搬遷後查","地圖整齊有益，時間費用可暫不計","先問規劃部門，居民使用感可後查"],["學習購物交流等用途宜在同區並存","只增辦公樓，夜間人流可由保安代替","道路建好後，可再安排商店與學校","先改外牆設計，區域用途可慢慢調整"],["公平要看誰能到達及誰負擔通勤","先看設施落成，通勤負擔可另案評估","只問商戶租金，不查居民能否到達","先問有車人士，低收入使用者可後問"],["保留中心服務有助易達公平與活力","外移服務可增空間，但通勤問題可後解","中心只留道路辦公樓，商店可搬到外圍","保留服務有助活力，公平性可暫不看"]];
transfer.forEach((item,index)=>{item.options=balancedOptions[index]});
export default {key:'opinion:63',meta:{topic:'主要服務是否應搬離市中心',summary:'作者完全反對把商店、學校及商業中心搬離市中心。首段說明中心交通匯聚，服務外移會增加居民通勤，尤其傷害有孩子家庭、長者和低收入工人；次段指出主要服務帶來人流、就業與交流，維持市中心多功能活力，搬到外圍亦可能增加汽車依賴、擠塞和污染。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
