const simple=[
  'I think cities should certainly be planned to please both the people who live there and visitors from other countries.',
  'A good city is more than somewhere people live or visit for a short time; its streets, buildings, and open places should make everyday life better and show the city proudly to people elsewhere.',
  'The main reason is that pleasant city planning makes life better for local people.',
  'When a city has parks, safe walking paths, good buses and trains, and friendly places to meet, people who live there are more likely to walk, see one another, rest, and feel that the area is theirs.',
  'This matters because people do not know a city only by its famous sights; they know it through ordinary days, like travelling to work or taking children to play areas.',
  'For example, a carefully planned open space with shade, seats, trees, and shops nearby can become a small place where neighbours meet.',
  'It gives people a place to stop, speak, and rest.',
  'So making a city pleasant to look at is not an unnecessary extra; it helps everyone feel better.',
  'At the same time, making cities appealing to visitors from other countries matters just as much because visitors can help local businesses and help a place show what makes its culture special.',
  'Visitors like cities that are clean, easy to reach, different from other places, and simple to walk around.',
  'If cities take good care of old streets, museums, places beside the water, and public markets, visitors will buy from local shops and also learn what makes the city special.',
  'Even more important, this kind of planning does not need to help visitors by taking something away from local people.',
  'An old area that is cared for, a busy street for walking, or a transport system that is easy to use helps everyone.',
  'Good city planning can therefore help people share local culture instead of keeping it out of sight.',
  'In short, I fully agree that cities should be pleasant for both local people and visitors from other countries.',
  'When planners do this well, the city is a good place for residents to live and a place visitors remember.',
];
const vocabulary=[
  [['In my view','I think','在我看來'],['definitely','certainly','確實'],['designed to appeal to','planned to please','設計得吸引'],['residents','people who live there','居民'],['international visitors','visitors from other countries','國際旅客']],
  [['successful city','good city','成功城市'],['not merely','more than','不僅僅'],['pass through','visit for a short time','經過'],['open spaces','open places','開放空間'],['daily life richer','everyday life better','日常生活更豐富'],['presenting the city confidently','show the city proudly','自信展現城市'],['wider world','people elsewhere','更廣世界']],
  [['strongest reason','main reason','最有力原因'],['attractive urban design','pleasant city planning','具吸引力城市設計'],['improves the lives','makes life better','改善生活'],['local people','local people','本地人']],
  [['contains green parks','has parks','擁有綠色公園'],['safe pavements','safe walking paths','安全人行道'],['efficient public transport','good buses and trains','高效公共交通'],['welcoming community spaces','friendly places to meet','親切社區空間'],['residents','people who live there','居民'],['feel attached to their surroundings','feel that the area is theirs','產生歸屬感']],
  [['major landmarks','famous sights','主要地標'],['daily routines','ordinary days','日常生活'],['commuting to work','travelling to work','上班通勤'],['taking their children to playgrounds','taking children to play areas','帶孩子去遊樂場']],
  [['well-designed square','carefully planned open space','設計良好廣場'],['shade','shade','遮蔭'],['seating','seats','座位'],['nearby shops','shops nearby','附近商店'],['small social heart of a neighbourhood','small place where neighbours meet','社區社交核心']],
  [['somewhere to pause','a place to stop','可停下來的地方'],['talk','speak','交談'],['breathe','rest','喘息']],
  [['In this sense','So','從這意義上'],['beauty','making a city pleasant to look at','美感'],['not a luxury','not an unnecessary extra','不是奢侈品'],['public well-being','everyone feel better','公共福祉']],
  [['At the same time','At the same time','同時'],['attract foreign tourists','appealing to visitors from other countries','吸引外國遊客'],['equally important','matters just as much','同樣重要'],['tourism','visitors','旅遊業'],['strengthen both the economy and cultural identity','help local businesses and help a place show what makes its culture special','加強經濟與文化身份']],
  [['Visitors are drawn to','Visitors like','遊客被吸引'],['accessible','easy to reach','交通便利'],['distinctive','different from other places','獨特'],['easy to explore','simple to walk around','容易探索']],
  [['historic streets','old streets','歷史街道'],['waterfronts','places beside the water','海濱'],['carefully maintained','take good care','細心維護'],['spend money in local businesses','buy from local shops','在本地商店消費'],['character of the city','what makes the city special','城市特色']],
  [['More importantly','Even more important','更重要'],['this kind of design','this kind of planning','這種設計'],['serve outsiders','help visitors','服務外來者'],['at the expense of residents','by taking something away from local people','犧牲居民利益']],
  [['preserved old district','old area that is cared for','保留下來的舊區'],['lively pedestrian street','busy street for walking','熱鬧行人街'],['clear transport system','transport system that is easy to use','清晰交通系統'],['benefits everyone','helps everyone','惠及所有人']],
  [['urban design','city planning','城市設計'],['turn local culture into something shared','help people share local culture','讓本地文化共同分享'],['rather than something hidden','instead of keeping it out of sight','而非隱藏']],
  [['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['made attractive','pleasant','具吸引力'],['foreign tourists','visitors from other countries','外國遊客']],
  [['When this is done well','When planners do this well','做好時'],['liveable for its residents','good place for residents to live','居民宜居'],['memorable for its visitors','place visitors remember','遊客難忘']],
];
const chunkOverrides=[
  ['In my view, cities should definitely be designed','to appeal to both residents and international visitors.'],
  ['A successful city is not merely a place where people live or pass through;','it is a public home whose streets, buildings, and open spaces should make daily life richer while also presenting the city confidently to the wider world.'],
  ['The strongest reason is that','attractive urban design improves the lives of local people.'],
  ['When a city contains green parks, safe pavements, efficient public transport, and welcoming community spaces,','residents are more likely to walk, meet, relax, and feel attached to their surroundings.'],
  ['This matters because people do not experience a city only through major landmarks;','they experience it through their daily routines, from commuting to work to taking their children to playgrounds.'],
  ['For example, a well-designed square with shade, seating, trees, and nearby shops','can become a small social heart of a neighbourhood.'],
  ['It gives people somewhere to pause,','talk, and breathe.'],
  ['In this sense, beauty is not a luxury;','it is part of public well-being.'],
  ['At the same time, designing cities to attract foreign tourists is equally important','because tourism can strengthen both the economy and cultural identity of a place.'],
  ['Visitors are drawn to cities','that are clean, accessible, distinctive, and easy to explore.'],
  ['If historic streets, museums, waterfronts, and public markets are carefully maintained,','tourists will spend money in local businesses while also learning about the character of the city.'],
  ['More importantly, this kind of design does not have to serve outsiders','at the expense of residents.'],
  ['A preserved old district, a lively pedestrian street, or a clear transport system','benefits everyone.'],
  ['Good urban design can therefore turn local culture into something shared','rather than something hidden.'],
  ['In conclusion, I fully agree','that cities should be made attractive for both local people and foreign tourists.'],
  ['When this is done well,','a city becomes liveable for its residents and memorable for its visitors.'],
];
const simpleChunkOverrides=[
  ['I think cities should certainly be planned','to please both the people who live there and visitors from other countries.'],
  ['A good city is more than somewhere people live or visit for a short time;','its streets, buildings, and open places should make everyday life better and show the city proudly to people elsewhere.'],
  ['The main reason is that','pleasant city planning makes life better for local people.'],
  ['When a city has parks, safe walking paths, good buses and trains, and friendly places to meet,','people who live there are more likely to walk, see one another, rest, and feel that the area is theirs.'],
  ['This matters because people do not know a city only by its famous sights;','they know it through ordinary days, like travelling to work or taking children to play areas.'],
  ['For example, a carefully planned open space with shade, seats, trees, and shops nearby','can become a small place where neighbours meet.'],
  ['It gives people a place to stop,','speak, and rest.'],
  ['So making a city pleasant to look at is not an unnecessary extra;','it helps everyone feel better.'],
  ['At the same time, making cities appealing to visitors from other countries matters just as much','because visitors can help local businesses and help a place show what makes its culture special.'],
  ['Visitors like cities','that are clean, easy to reach, different from other places, and simple to walk around.'],
  ['If cities take good care of old streets, museums, places beside the water, and public markets,','visitors will buy from local shops and also learn what makes the city special.'],
  ['Even more important, this kind of planning does not need to help visitors','by taking something away from local people.'],
  ['An old area that is cared for, a busy street for walking, or a transport system that is easy to use','helps everyone.'],
  ['Good city planning can therefore help people share local culture','instead of keeping it out of sight.'],
  ['In short, I fully agree','that cities should be pleasant for both local people and visitors from other countries.'],
  ['When planners do this well,','the city is a good place for residents to live and a place visitors remember.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('In my view, schools should definitely be designed to appeal to both pupils and parents.','In my view 直接表明立場；both...and... 列兩類受眾。','這是立場句，未展開兩段理由。',[1,2,14],F('In my view, [地方] should definitely be designed to appeal to both [兩類人]','引言直接回答是否應兼顧兩類受眾。','題目問一個地方是否應同時吸引兩類使用者時。',[['In my view, ','link','表明立場'],['cities','slot','地方'],[' should definitely be designed to appeal to both ','link','應兼顧'],['residents and international visitors.','slot','兩類人']])),
  S('A successful library is not merely a place where people borrow books; it is a public home whose rooms and shared spaces should support daily learning while also welcoming newcomers.','not merely...; it is... 重新界定場所；whose 與 while also 並列兩項功能。','作者把城市視為公共家園，不是只作遊客裝飾。',[0,3,7],F('A successful [地方] is not merely [單一用途]; it is [公共角色] whose [設施] should [本地功能] while also [對外功能]','用一句較完整的比喻界定兩種受眾如何並存。','引言表態後，要展示一個場所不只具有單一用途時。',[['A successful ','link','評價地方'],['city','slot','地方'],[' is not merely ','link','不只是'],['a place where people live or pass through','slot','單一用途'],['; it is ','link','也是'],['a public home','slot','公共角色'],[' whose ','link','其'],['streets, buildings, and open spaces','slot','設施'],[' should ','link','應'],['make daily life richer','slot','本地功能'],[' while also ','link','同時'],['presenting the city confidently to the wider world.','slot','對外功能']])),
  S('The strongest reason is that better school design improves the lives of pupils.','The strongest reason is that 先指出最重要的本地受益者。','不是說旅遊完全不重要；次段會談旅客。',[0,3,8],F('The strongest reason is that [設計] improves the lives of [本地使用者]','在第一主體段清楚提出本地人的好處。','先要論證一項設計對每天使用它的人有甚麼價值時。',[['The strongest reason is that ','link','最有力原因'],['attractive urban design','slot','設計'],[' improves the lives of ','link','改善生活'],['local people.','slot','本地使用者']])),
  S('When a school contains a library, safe paths, and shared gardens, pupils are more likely to read, meet, relax, and feel attached to the place.','When 列具體設施；more likely 保留機率；結果包括行動與歸屬感。','不是只談美觀，還談居民如何使用。',[2,4,5],F('When [地方] contains [多項友善設施], [使用者] are more likely to [活動與歸屬]','說明設計元素如何改變日常行為和感受。','提出設計改善生活後，需要列出設施與可觀察結果時。',[['When ','link','設條件'],['a city','slot','地方'],[' contains ','link','具備'],['green parks, safe pavements, efficient public transport, and welcoming community spaces','slot','多項友善設施'],[', ','link','則'],['residents','slot','使用者'],[' are more likely to ','link','更可能'],['walk, meet, relax, and feel attached to their surroundings.','slot','活動與歸屬']])),
  S('This matters because pupils do not experience a school only through exam results; they experience it through their daily routines, from arriving in the morning to meeting friends at lunch.','not...only through...; ...through... 對照少數地標與真正的日常體驗。','作者不是否定地標存在，而是說日常路徑更能代表居民經驗。',[3,5,7],F('This matters because [人] do not experience [地方] only through [醒目標誌]; they experience it through [日常路徑], from [活動一] to [活動二]','把評價標準從名勝轉到日常生活。','某地方常用地標或宣傳照評價時，要提醒讀者使用者每天真正經歷甚麼。',[['This matters because ','link','解釋重要性'],['people','slot','人'],[' do not experience ','link','體驗'],['a city','slot','地方'],[' only through ','link','不只透過'],['major landmarks','slot','醒目標誌'],['; they experience it through ','link','更透過'],['their daily routines','slot','日常路徑'],[', from ','link','從'],['commuting to work','slot','活動一'],[' to ','link','到'],['taking their children to playgrounds.','slot','活動二']])),
  S('For example, a school garden with seats, shade, and a path can become a small social heart of a campus.','具體小空間與設施清單支持「社交核心」這一形象。','例子重點是居民可停留和互動，不只綠化外觀。',[3,4,6],F('For example, [有多項設施的小空間] can become [社區交流核心]','以可想像的小場景說明設計如何促成交流。','抽象地說空間有吸引力後，需要一個可描畫的社區例子時。',[['For example, ','link','舉例'],['a well-designed square with shade, seating, trees, and nearby shops','slot','有多項設施的小空間'],[' can become ','link','可成為'],['a small social heart of a neighbourhood.','slot','社區交流核心']])),
  S('It gives people somewhere to pause, talk, and read.','三個短動詞把小空間的日常用途寫得清楚易記。','這不是重複廣場外觀，而是描寫人會做甚麼。',[4,5,7],F('It gives people somewhere to [活動一], [活動二], and [活動三]','用簡短平行動詞收束一個場景例子。','已描寫場所後，要具體指出使用者能在那裏做甚麼時。',[['It gives people somewhere to ','link','提供地方'],['pause','slot','活動一'],[', ','link','並列'],['talk','slot','活動二'],[', and ','link','再加'],['breathe.','slot','活動三']])),
  S('In this sense, quiet is not a luxury; it is part of student well-being.','not a luxury; it is... 把看似額外的品質提升為福祉要素。','不是說所有漂亮設計都自動有效；前面已有功能例子。',[4,5,6],F('In this sense, [品質] is not a luxury; it is part of [公共福祉]','總結第一段，重界定美感的公共價值。','有人把一項人本品質視為奢侈品時，要用已論作用說明其基本價值。',[['In this sense, ','link','從前文推論'],['beauty','slot','品質'],[' is not a luxury; it is part of ','link','不是奢侈而是'],['public well-being.','slot','公共福祉']])),
  S('At the same time, designing schools to attract new families is equally important because inclusion can strengthen both attendance and community identity.','At the same time 引第二受眾；because 後以經濟和文化兩項效益作原因。','不是把遊客利益放在居民之上。',[2,7,9],F('At the same time, designing [地方] to attract [第二受眾] is equally important because [活動] can strengthen both [兩方面效益]','由本地使用者轉向另一受眾，並提出兩方面好處。','已論第一類使用者後，要說明第二類使用者也值得設計照顧時。',[['At the same time, designing ','link','同時設計'],['cities','slot','地方'],[' to attract ','link','吸引'],['foreign tourists','slot','第二受眾'],[' is equally important because ','link','同樣重要，因為'],['tourism','slot','活動'],[' can strengthen both ','link','同時加強'],['the economy and cultural identity of a place.','slot','兩方面效益']])),
  S('Families are drawn to parks that are safe, green, welcoming, and easy to reach.','are drawn to 後列可檢查的吸引力條件，而不只說漂亮。','遊客偏好不是由單一著名地標決定。',[8,10,12],F('[訪客] are drawn to [地方] that are [多項可感知品質]','把抽象的吸引力拆成具體設計品質。','提出吸引另一受眾後，要列出他們真正需要的場所特性時。',[['Visitors','slot','訪客'],[' are drawn to ','link','被吸引到'],['cities','slot','地方'],[' that are ','link','具有'],['clean, accessible, distinctive, and easy to explore.','slot','多項可感知品質']])),
  S('If school libraries and playgrounds are carefully maintained, families will spend time there while also learning about the school community.','If 將維護作條件；while also 並列實際消費和文化認識。','不是只讓遊客拍照，而是讓本地商戶及文化受益。',[8,9,11],F('If [有特色的地方] are carefully maintained, [訪客] will spend [本地收益] while also learning about [地方特色]','把具體維護與經濟及文化結果接起來。','已列吸引力品質後，要說明維護場所如何產生兩種效益時。',[['If ','link','設維護條件'],['historic streets, museums, waterfronts, and public markets','slot','有特色的地方'],[' are carefully maintained, ','link','得到細心維護'],['tourists','slot','訪客'],[' will spend ','link','會花費'],['money in local businesses','slot','本地收益'],[' while also learning about ','link','同時了解'],['the character of the city.','slot','地方特色']])),
  S('More importantly, a visitor programme does not have to serve newcomers at the expense of long-term residents.','does not have to...at the expense of... 拒絕兩類受眾必然零和的假設。','不是說任何遊客設計都自動惠及居民，後句會舉共享設施。',[8,10,12],F('More importantly, [方案] does not have to serve [新受眾] at the expense of [原有受眾]','化解兩類使用者利益必然衝突的疑慮。','有人認為服務新受眾必然犧牲原有使用者時。',[['More importantly, ','link','更重要'],['this kind of design','slot','方案'],[' does not have to serve ','link','不必只服務'],['outsiders','slot','新受眾'],[' at the expense of ','link','以犧牲...為代價'],['residents.','slot','原有受眾']])),
  S('A repaired old classroom, a lively reading corner, or a clear timetable benefits everyone.','三個不同類型的設施共用同一個 benefits everyone 結論。','例子是共享好處，不是只屬遊客的專用設施。',[9,11,13],F('A [設施一], a [設施二], or a [系統三] benefits everyone','以三個具體例子證明共用效益。','要化解兩群人競爭的疑慮時，可舉能同時惠及雙方的設施。',[['A ','link','列第一項'],['preserved old district','slot','設施一'],[', a ','link','第二項'],['lively pedestrian street','slot','設施二'],[', or a ','link','第三項'],['clear transport system','slot','系統三'],[' benefits everyone.','link','惠及所有人']])),
  S('Good school design can therefore turn student work into something shared rather than something hidden.','therefore 從共用設施推出文化可被分享的結果。','作者沒有主張為遊客掩蓋本地文化。',[10,12,14],F('Good [設計] can therefore turn [本地文化] into something shared rather than something hidden','以共享原則回收本地文化與對外展示。','前面已說明多方受惠後，需要指出文化如何更易被看見時。',[['Good ','link','評價設計'],['urban design','slot','設計'],[' can therefore turn ','link','因此可把'],['local culture','slot','本地文化'],[' into something shared rather than something hidden.','link','由隱藏變共享']])),
  S('In conclusion, I fully agree that schools should be made attractive for both pupils and visiting families.','結論重申 both...and...，對應引言的兩類人。','沒有改為只服務旅客或只服務居民。',[0,11,15],F('In conclusion, I fully agree that [地方] should be made attractive for both [兩類受眾]','在結論直接回答兩類使用者的題目。','全文主張兼顧兩方時，末段要保持相同的雙方立場。',[['In conclusion, I fully agree that ','link','重申立場'],['cities','slot','地方'],[' should be made attractive for both ','link','兼顧兩方'],['local people and foreign tourists.','slot','兩類受眾']])),
  S('When this is done well, a school becomes welcoming for its pupils and memorable for its visitors.','When this is done well 保留實施品質條件；兩個形容詞平行指向兩類人。','不是說任何城市設計都必然同時成功。',[0,13,14],F('When this is done well, [地方] becomes [本地好處] for its [居民] and [訪客好處] for its [旅客]','以平衡句概括兩方受益。','結尾要把兼顧兩類人濃縮為兩個對稱結果時。',[['When this is done well, ','link','若做好'],['a city','slot','地方'],[' becomes ','link','成為'],['liveable','slot','本地好處'],[' for its ','link','給其'],['residents','slot','居民'],[' and ','link','以及'],['memorable','slot','訪客好處'],[' for its ','link','給其'],['visitors.','slot','旅客']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者主張城市設計應吸引哪些人？',['同時吸引本地居民與外國遊客','只吸引外國遊客','只服務本地居民','完全不應重視設計'],'引言的 both residents and international visitors 明確回答兩方。'),
  {type:'multi',prompt:'哪兩項分別是兩段主體的不同理由？',detail:'選兩項，再按「確認」。',options:['友善的日常空間讓居民步行、交流、休息並有歸屬感','維護特色場所可讓遊客消費並認識文化，且不必犧牲居民','只要有名勝，居民的日常通勤就完全不重要','外國遊客必須使用居民不能進入的專用區'],correct:[0,1],why:'首段談本地日常；次段談遊客、商業和文化，並指出共享設施。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 同時吸引兩類人','城市是公共家園，應改善日常生活並向外展示自己。'],
  ['主體一 · 居民的日常','公園、步道、交通和廣場讓居民使用、相遇與休息。'],
  ['主體二 · 旅客與本地文化','維護特色地方帶來本地消費與文化認識，且設施可共同使用。'],
  ['結論 · 兩方受益','城市既要宜居，也要讓旅客留下深刻印象。'],
],'公共家園 → 居民日常 → 旅客經濟與文化 → 共享而非零和。')];
const evidence=[
  Q('第一段列出哪些居民設計元素？',['綠色公園、安全人行道、公共交通及社區空間','只有大酒店','只有地標建築的外牆','只增加私人停車位'],'When a city contains... 後列四種。'),
  Q('作者為何說居民不只透過地標體驗城市？',['日常通勤及帶孩子去遊樂場等路徑同樣構成體驗','居民每天只參觀博物館','地標從來不存在','遊客與居民永不走同一條路'],'daily routines, from...to...。'),
  Q('廣場例子列出甚麼細節？',['遮蔭、座位、樹木和附近商店','只有廣告牌','只有停車位','只有門票價格'],'具體設施使「社交核心」可信。'),
  Q('第二段說遊客喜歡甚麼樣的城市？',['潔淨、交通便利、獨特且容易探索','只看最高樓宇','只看旅館數目','只看機場廣告'],'clean, accessible, distinctive, and easy to explore。'),
  Q('維護歷史街道等地方可帶來哪兩種結果？',['本地商戶消費與了解城市特色','只有交通擠塞','只有私人住宅增加','只有更昂貴的門票'],'spend money...while also learning...。'),
  Q('作者如何處理旅客與居民利益可能衝突？',['指出舊區、行人街和交通系統可同時惠及兩方','主張遊客永遠優先','主張居民永遠不能使用景點','認為任何設計都必然造成犧牲'],'does not have to serve outsiders at expense of residents。'),
];
const logic=[
  sequence('第一主體段：設計如何惠及本地居民？',[
    ['主張','吸引人的城市設計首先改善居民生活。'],
    ['設施','公園、步道、公共交通與親切社區空間。'],
    ['機制','居民更可能步行、見面、放鬆並有歸屬感。'],
    ['評價標準','城市體驗來自每天的通勤與家庭活動，不只有地標。'],
    ['廣場例子','有遮蔭、座位、樹木及商店的小型社交核心。'],
    ['段落結論','美感與公共福祉相連，而非奢侈裝飾。'],
  ],'日常設施 → 行為與歸屬 → 具體場景 → 公共福祉。'),
  sequence('第二主體段：遊客與居民如何共同受益？',[
    ['另一理由','吸引旅客也可加強經濟及文化身份。'],
    ['品質','潔淨、易到達、獨特與易探索。'],
    ['維護例子','歷史街道等場所帶來本地消費與文化認識。'],
    ['化解疑慮','服務遊客不一定要犧牲居民。'],
    ['共享設施','保留舊區、行人街和清晰交通惠及所有人。'],
    ['段落結論','城市設計讓本地文化被分享。'],
  ],'有特色的維護 → 經濟與文化效益 → 雙方共享 → 文化可見。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一所學校設計新校舍，既要照顧在校學生，也希望來訪家長容易了解校園。','哪項設計原則最貼近文章？',['先改善學生每天使用的空間，同時讓來訪者容易理解學校','只興建一個巨大入口標誌，不檢查學生平日通行','完全以家長拍照為準，讓學生只能使用側門','只談學生使用，故意令來訪家長找不到任何路'],['居民日常與訪客體驗可兼顧。','入口形象不代替學生常用空間。','學生不應被迫繞行。','訪客容易理解校園也是目標。'],[0,1,2,3,4,14,15],'both residents and international visitors。'),
  T('城市宣傳照只展示著名地標，居民每天使用的人行道卻破損。','哪項評價更完整？',['同時檢查日常通勤及公共空間，不能只看醒目地標','地標好看就足以證明整座城市都方便居民','只看遊客打卡數量，因居民日常不屬城市體驗','只處理步道顏色，毋須檢查是否安全和可通行'],['原文以 daily routines 對照 major landmarks。','步道影響居民與旅客。','打卡量不代表日常通行。','安全可通行要先評估。'],[3,4,5,6],'not only through major landmarks；daily routines。'),
  T('一個社區廣場有座位、樹蔭和商店，老人、孩子與上班族都會停留。','這最能支撐哪一項論證？',['細小公共空間可促成停留、交流和休息，改善日常福祉','廣場必須變成最高地標，才可能對居民產生作用','只有外地遊客可以使用，因此不涉及本地人的生活','只要設施數量夠多，就不必觀察居民是否真正使用'],['廣場是小型社交核心，接着寫人會做甚麼。','設施數量不足以證明福祉。','情境重點是多種本地使用者。','須說明設施如何促交流。'],[4,5,6,7],'small social heart；pause, talk, and breathe。'),
  T('某計劃認為校園美感只是奢侈，無須了解學生是否願意停留。','怎樣轉用第一段段末？',['若設計促成休息與交流，美感便可能是福祉的一部分','只要外牆顏色漂亮，便可自動改善全部學習成果','任何美感都不必考慮使用者，只要攝影效果理想','學校完全不需空間設計，學生只要有課本即可'],['not a luxury 由具體使用功能支撐。','美感若服務人，還需休息交流機制。','學生使用感是設計標準。','課本不取代空間作用。'],[5,6,7],'beauty is not a luxury；public well-being。'),
  T('某城市希望旅客多到訪，又想讓本地文化真正被看見。','哪項措施最符合第二段？',['維護有特色的街道、市場與博物館，讓消費與文化認識並行','只增加城市廣告數量，卻不維護旅客實際到訪的地方','把本地文化藏在封閉展館，避免遊客與居民共同使用','只計算旅客人數，不問他們是否了解地方特色'],['維護條件連到經濟與文化兩項效益。','廣告不能代替可到訪的特色場所。','作者希望消費與文化認識並行。','人數不足以證明了解。'],[8,9,10,13],'maintained；spend money while also learning。'),
  T('有居民擔心改善旅遊步行街一定會剝奪他們的使用權。','文章如何化解這個疑慮？',['選用居民和旅客都可使用的街道與交通設施，避免零和安排','把全部步行街劃給旅客，居民必須繞道通行','因為有疑慮，所以任何改善步行環境都應停止','聲稱所有旅遊設計自動公平，完全不用檢查用途'],['does not have to serve outsiders at expense of residents。','劃給旅客會使居民失去共享利益。','疑慮應透過設計處理。','公平需看實際使用。'],[10,11,12],'benefits everyone。'),
  T('一間圖書館想吸引新讀者，同時照顧原有使用者。','哪個跨題原則最合適？',['改善清晰指示與舒適空間，讓新舊讀者都能容易使用','只服務新讀者，並取消原有讀者借閱權利','完全不改善指示，讓新讀者自行猜測館內安排','只增加宣傳標語，無須檢查館內空間是否可用'],['共享設施可兼顧兩類受眾。','原有讀者也需要空間。','新讀者需清晰指示。','宣傳不代替可用空間。'],[1,9,11,12],'clear transport system benefits everyone。'),
  T('城市只在機場擺放漂亮海報，街道卻髒亂而難以步行。','按第二段，問題出在哪裏？',['吸引力需要潔淨、易到達和易探索的實際城市品質','遊客只看海報，不會親自使用城市街道','只要海報有特色，交通安排便不再影響旅程','城市特色只由機場決定，與本地街道和市場無關'],['clean, accessible, distinctive, easy to explore。','海報後仍要使用街道。','交通與可到達性重要。','機場不是整座城市體驗。'],[8,9,10],'visitors drawn to cities that are...。'),
  T('設計者說「改善本地居民生活」與「吸引外國遊客」必須二選一。','哪項文章證據最能反駁？',['舊區、行人街和交通系統可同時被居民與旅客使用','兩類人從來不會走入同一座城市的公共空間','每一個旅客場所都必然禁止居民使用','只要居民受益，遊客便不可能記住城市'],['benefits everyone 是直接反例。','共享設施可同時惠及兩類人。','居民用途不應延後。','旅客能否到達也是目標。'],[11,12,13,15],'benefits everyone；liveable and memorable。'),
  T('要把「文化身份」從口號變成可觀察的設計結果。','哪項做法最貼近文章？',['維護本地特色場所，使人能走進其中並了解城市故事','只在宣傳品寫「文化豐富」，不讓人接觸任何場所','把所有老街市場移出城市，避免外地人看到','只靠遊客住宿數字，便判定文化已被充分分享'],['places maintained → learning about city character。','口號不等於可接觸文化。','搬遠可能削弱實際體驗。','住宿量不等於文化認識。'],[8,10,13],'turn local culture into something shared。'),
  T('某社區改善一條行人街後，居民更常相聚，旅客也較容易探索。','哪項結論保持了文章的分寸？',['同一設施可以帶來雙方好處，但成效仍取決於設計品質','任何行人街一旦改建，就必然令所有人都滿意','因旅客也使用，居民所得的好處便必然消失','只要居民喜歡，城市便不用再照顧旅客通行'],['When this is done well 保留品質條件。','居民也是同一設施受益者。','旅客通行亦應安排。','仍需評估品質與維護。'],[3,11,12,15],'When this is done well...。'),
  T('要用一句話總結全文。','哪項最準確？',['城市應讓居民日常更宜居，也讓旅客從共享設施認識地方特色','城市只須讓旅客拍照，居民的日常生活可完全忽略','城市只須服務居民，外國旅客與本地經濟文化無關','只建著名地標便已足夠，步道、市場與交通都不重要'],['含兩類受眾與兩段理由。','作者明確重視居民日常。','共享設施可讓旅客認識地方。','地標不取代街道市場交通。'],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'liveable for residents；memorable for visitors。'),
];
const balancedOptions=[["先照顧學生常用空間，也方便家長來訪","先建醒目入口，學生通行問題可後處理","校園先供家長拍照，學生可改走側門","先照顧學生，家長來訪路線可不標示"],["同看居民日常通行，不只看著名地標","地標可吸引旅客，步道損壞可稍後處理","先計遊客打卡量，不查居民日常通勤","先改步道外觀，安全通行可另行評估"],["小廣場讓不同人停留交流，改善日常生活","廣場設施多，便不必看居民是否停留","先談旅客拍照，居民用途可稍後研究","只列座位樹蔭數，交流可由讀者推想"],["設計若促休息交流，美感也是福祉一部分","外牆好看可吸引人，休息空間可後考慮","先看攝影效果，學生使用感可稍後查","先增課本，空間設計可留待下期預算"],["維護特色街市，兼顧旅遊消費與文化認識","先增廣告，再看街道市場是否值得維護","地方文化可保存，但旅客參與可暫緩","先看旅客人數，不查有否認識城市特色"],["選居民旅客共享的設施，避免兩方互斥","旅遊步行街可先劃給旅客，居民另找路","居民擔心有理，步行環境可暫不改善","先宣布公平設計，不查居民如何使用"],["清晰指示與舒適空間讓新舊讀者都易用","先招新讀者，舊使用者空間可待日後改","保留原有安排，新讀者指示可稍後增","先做宣傳標語，不查館內空間是否易用"],["潔淨易達的街道，比機場海報更能留客","機場海報先吸客，街道質素可留待後改","海報特色足夠，交通路線可另行規劃","街道雖難行，旅客可只按機場設施評估"],["街道交通可同時被居民與旅客使用","兩類使用者不同，公共空間可分開設計","旅客專用區增多，居民用途可後處理","居民受益後，可先不查旅客是否易達"],["保留特色場所，讓人走進並了解城市故事","先寫文化豐富口號，場所維護可慢慢做","把老街市場搬遠，旅客仍可看宣傳照片","先計住宿量，文化接觸可另作調查"],["同一行人街可惠及雙方，仍要看設計成效","行人街方便旅客，居民休息需要可後看","居民使用增加，旅客通行可另行安排","成效已見，但不必再看設計是否可持續"],["城市宜居，旅客也能由共享設施認識文化","只服務旅客拍照，居民需求可待後續計畫","只服務居民，旅客認識地方可另靠廣告","先建著名地標，步道市場可暫不改善"]];
transfer.forEach((item,index)=>{item.options=balancedOptions[index]});
export default {key:'opinion:62',meta:{topic:'城市設計應同時吸引居民與旅客',summary:'作者完全同意城市應同時吸引本地居民與外國遊客。首段指出公園、步道、交通及小廣場改善居民每天的活動、交流與歸屬感；次段說明維護歷史街道、市場等地方可帶來本地消費及文化認識。共享舊區、行人街和交通系統可兼顧兩方，城市因而既宜居又令人難忘。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
