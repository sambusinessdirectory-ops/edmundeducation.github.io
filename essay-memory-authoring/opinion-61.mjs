// Sentence 2 is the complete `Although... I completely agree...` sentence, merged from source rows 1–2.
const simple=[
  'There is less free land in cities now, so people must think carefully about what to do with empty pieces of land.',
  'Although many people want to build homes on these places, I strongly agree they should be kept for trees and parks because that would make city life healthier and able to last well into the future.',
  'The clearest reason is that trees make crowded places much better to live in.',
  'In many towns, people already live among roads, hard buildings, and cars, so we should not simply fill the few open places left with more buildings.',
  'Trees give shade, cut dust, make noise less harsh, and provide a quiet place where people can walk or rest.',
  'A city with no plants can feel like an oven made of concrete, especially when the weather is hot.',
  'For example, a little area with trees near homes can give children a safe place to play, older people a place to move, and workers a place to relax after work.',
  'This does more than make a street look nicer; it helps people stay healthy and feel better in daily life.',
  'Second, putting homes on every empty piece of land is a poor answer that ignores what cities will need later.',
  'A lack of homes is a real problem, but cities can deal with it by planning better, reusing empty buildings, and making better use of land already set aside for homes.',
  'If every open place becomes a block of flats, a city may add some homes but lose the natural areas that help it stay healthy.',
  'More buildings can also bring more cars, make it harder for drains to handle water, and make crowded areas feel even more stressful.',
  'Trees, on the other hand, work like useful public systems that need little attention: they make the air cooler, take in dirty air, and lessen the harm from heavy rain.',
  'After we remove these green places, bringing them back is very hard.',
  'In short, I strongly agree that empty city land should be used to plant trees instead of building more homes.',
  'People need homes, but cities also need trees to stay healthy, pleasant for people, and able to last into the future.',
];
const vocabulary=[
  [['Urban land','land in cities','城市土地'],['becoming scarce','less free','變得稀缺'],['decisions about empty plots','what to do with empty pieces of land','空地決定'],['require careful judgement','must think carefully','需要審慎判斷']],
  [['Although many people believe','Although many people want','儘管許多人認為'],['residential buildings','homes','住宅樓宇'],['completely agree','strongly agree','完全同意'],['reserved for trees and green areas','kept for trees and parks','保留作樹木綠化'],['more sustainable','able to last well into the future','更可持續']],
  [['most immediate reason','clearest reason','最直接原因'],['densely populated areas','crowded places','人口密集地區'],['far more liveable','much better to live in','更加宜居']],
  [['residents','people','居民'],['surrounded by roads, concrete walls, and traffic','among roads, hard buildings, and cars','被道路混凝土和交通包圍'],['few remaining open spaces','few open places left','僅餘少量空地'],['should not simply be swallowed by more construction','should not simply fill the few open places left with more buildings','不應只被更多建築吞噬']],
  [['provide shade','give shade','提供陰涼'],['reduce dust','cut dust','減少塵埃'],['soften noise','make noise less harsh','緩和噪音'],['somewhere calm','a quiet place','寧靜地方']],
  [['without greenery','with no plants','沒有綠化'],['concrete oven','oven made of concrete','混凝土焗爐'],['hot seasons','when the weather is hot','炎熱季節']],
  [['small tree-filled space','little area with trees','種滿樹木的小空間'],['apartment blocks','homes','公寓大樓'],['elderly people','older people','長者'],['clear their minds','relax','放鬆頭腦']],
  [['does not merely improve','does more than make','不只是改善'],['appearance of a neighbourhood','a street look nicer','社區外觀'],['supports public health','helps people stay healthy','支持公共健康'],['everyday well-being','feel better in daily life','日常福祉']],
  [['Another reason','Second','另一原因'],['building housing','putting homes','興建住房'],['every vacant plot','every empty piece of land','每塊空地'],['short-sighted solution','poor answer that ignores what cities will need later','短視解方']],
  [['Housing shortages','A lack of homes','住房短缺'],['addressed through better planning','deal with it by planning better','透過更好規劃處理'],['redevelopment of abandoned buildings','reusing empty buildings','重建廢棄建築'],['more efficient use','making better use','更有效利用'],['existing residential land','land already set aside for homes','現有住宅用地']],
  [['every empty area','every open place','每片空地'],['turned into apartments','becomes a block of flats','改建公寓'],['gain a few more homes','add some homes','增加一些住房'],['natural spaces that help them breathe','natural areas that help it stay healthy','幫城市呼吸的自然空間']],
  [['increase traffic','bring more cars','增加交通'],['put pressure on drainage systems','make it harder for drains to handle water','加重排水壓力'],['crowded districts','crowded areas','擁擠地區'],['even more stressful','even more stressful','更壓抑']],
  [['By contrast','on the other hand','相比之下'],['quiet public infrastructure','useful public systems that need little attention','安靜公共基建'],['cool the air','make the air cooler','降低氣溫'],['absorb pollution','take in dirty air','吸收污染'],['reduce the impact of heavy rain','lessen the harm from heavy rain','減輕暴雨影響']],
  [['Once','After','一旦'],['green spaces','green places','綠色空間'],['destroyed','remove','破壞'],['extremely difficult to restore','bringing them back is very hard','極難恢復']],
  [['In conclusion','In short','總結'],['strongly agree','strongly agree','強烈同意'],['vacant urban areas','empty city land','城市空地'],['planting trees','plant trees','種樹'],['rather than constructing more housing','instead of building more homes','而非建更多住房']],
  [['Homes are necessary','People need homes','住房必要'],['green lungs','trees','綠色肺'],['humane','pleasant for people','人性化'],['sustainable','able to last into the future','可持續']],
];
const chunkOverrides=[
  ['Urban land is becoming scarce,','so decisions about empty plots in cities and towns require careful judgement.'],
  ['Although many people believe these spaces should be used for residential buildings,','I completely agree that they should be reserved for trees and green areas, because this would make urban life healthier and more sustainable.'],
  ['The most immediate reason is that','trees make densely populated areas far more liveable.'],
  ['In many towns, residents already spend their daily lives surrounded by roads, concrete walls, and traffic,','so the few remaining open spaces should not simply be swallowed by more construction.'],
  ['Trees provide shade, reduce dust, soften noise,','and give people somewhere calm to walk or rest.'],
  ['A city without greenery can feel like a concrete oven,','especially during hot seasons.'],
  ['For example, a small tree-filled space near apartment blocks can become a place','where children play safely, elderly people exercise, and office workers clear their minds after work.'],
  ['This does not merely improve the appearance of a neighbourhood;','it supports public health and everyday well-being.'],
  ['Another reason is that building housing on every vacant plot','is a short-sighted solution to urban problems.'],
  ['Housing shortages are serious,','but they should be addressed through better planning, redevelopment of abandoned buildings, and more efficient use of existing residential land.'],
  ['If every empty area is turned into apartments,','cities may gain a few more homes but lose the natural spaces that help them breathe.'],
  ['More buildings can also increase traffic, put pressure on drainage systems,','and make crowded districts even more stressful.'],
  ['By contrast, trees act as quiet public infrastructure:','they cool the air, absorb pollution, and reduce the impact of heavy rain.'],
  ['Once these green spaces are destroyed,','they are extremely difficult to restore.'],
  ['In conclusion, I strongly agree','that vacant urban areas should be used for planting trees rather than constructing more housing.'],
  ['Homes are necessary,','but cities also need green lungs if they are to remain healthy, humane, and sustainable.'],
];
const simpleChunkOverrides=[
  ['There is less free land in cities now,','so people must think carefully about what to do with empty pieces of land.'],
  ['Although many people want to build homes on these places,','I strongly agree they should be kept for trees and parks because that would make city life healthier and able to last well into the future.'],
  ['The clearest reason is that','trees make crowded places much better to live in.'],
  ['In many towns, people already live among roads, hard buildings, and cars,','so we should not simply fill the few open places left with more buildings.'],
  ['Trees give shade, cut dust, make noise less harsh,','and provide a quiet place where people can walk or rest.'],
  ['A city with no plants can feel like an oven made of concrete,','especially when the weather is hot.'],
  ['For example, a little area with trees near homes can give children a safe place to play,','older people a place to move, and workers a place to relax after work.'],
  ['This does more than make a street look nicer;','it helps people stay healthy and feel better in daily life.'],
  ['Second, putting homes on every empty piece of land','is a poor answer that ignores what cities will need later.'],
  ['A lack of homes is a real problem,','but cities can deal with it by planning better, reusing empty buildings, and making better use of land already set aside for homes.'],
  ['If every open place becomes a block of flats,','a city may add some homes but lose the natural areas that help it stay healthy.'],
  ['More buildings can also bring more cars, make it harder for drains to handle water,','and make crowded areas feel even more stressful.'],
  ['Trees, on the other hand, work like useful public systems that need little attention:','they make the air cooler, take in dirty air, and lessen the harm from heavy rain.'],
  ['After we remove these green places,','bringing them back is very hard.'],
  ['In short, I strongly agree','that empty city land should be used to plant trees instead of building more homes.'],
  ['People need homes,','but cities also need trees to stay healthy, pleasant for people, and able to last into the future.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('School time is becoming scarce, so decisions about daily lessons require careful judgement.','so 把有限資源連到必須審慎選擇的任務。','這是背景判斷，不是後文方案的證明。',[1,2,8],F('[有限資源] is becoming scarce, so decisions about [用途] require careful judgement','以資源有限建立選擇的重要性。','引言要說明一項稀缺資源為何需審慎分配時。',[['Urban land','slot','有限資源'],[' is becoming scarce, so decisions about ','link','稀缺，因此要審慎決定'],['empty plots in cities and towns','slot','用途'],[' require careful judgement.','link','需要審慎判斷']])),
  S('Although many people believe these hours should be used for tests, I completely agree that they should be reserved for reading, because this would make learning deeper and more enjoyable.','Although 呈現另一種用途；主句清楚選擇；because 說明理由。','作者並非同意建房而反對樹木，主句支持保留綠地。',[0,3,9],F('Although many people believe [另一種用途], I completely agree that [我的選擇], because [理由]','承認替代用途有人支持，仍明確表明自己選擇。','題目要求在兩種競爭用途之間選擇並說明原因時。',[['Although many people believe ','link','承認另一方'],['these spaces should be used for residential buildings','slot','另一種用途'],[', I completely agree that ','link','明確同意'],['they should be reserved for trees and green areas','slot','我的選擇'],[', because ','link','說明原因'],['this would make urban life healthier and more sustainable.','slot','理由']])),
  S('The most immediate reason is that quiet streets make crowded areas far more pleasant.','most immediate reason 指先談當下可見的生活效益。','首段尚未處理住房的長遠替代方案。',[1,3,8],F('The most immediate reason is that [措施] make [人群或地方] far more [正面結果]','在首段先提出最直接受益。','先要討論人們最容易立即感受到的效益時。',[['The most immediate reason is that ','link','提出最直接理由'],['trees','slot','措施'],[' make ','link','使'],['densely populated areas','slot','人群或地方'],[' far more ','link','更'],['liveable.','slot','正面結果']])),
  S('In many schools, pupils already spend their day surrounded by tests and deadlines, so the few remaining free hours should not simply be swallowed by more exams.','so 把已飽和的環境連到保護僅餘空間的判斷。','不是說任何建築都不應存在，而是勿填滿僅餘空地。',[2,4,9],F('In many [地方], [人] already face [擁擠現況], so [僅餘空間] should not be swallowed by [更多同類壓力]','展示資源已被佔用，支持保留剩餘空間。','要說明某環境已十分擁擠，新增同類用途會進一步壓縮空間時。',[['In many ','link','設定地方'],['towns','slot','地方'],[', ','link','描述現況'],['residents already spend their daily lives surrounded by roads, concrete walls, and traffic','slot','擁擠現況'],[', so ','link','因此'],['the few remaining open spaces','slot','僅餘空間'],[' should not simply be swallowed by ','link','不應再被吞噬'],['more construction.','slot','更多同類壓力']])),
  S('Libraries provide information, reduce isolation, soften stress, and give people somewhere calm to read or study.','四個平行動詞把抽象好處變成具體功能。','各功能並列，並非只說外觀好看。',[3,6,7],F('[公共設施] provide [功能一], reduce [問題二], soften [問題三], and give people [活動場所]','以平行清單列出一項公共設施的多重日常作用。','提出生活品質好處後，需要用可感知的功能支撐時。',[['Trees','slot','公共設施'],[' provide ','link','提供'],['shade','slot','功能一'],[', reduce ','link','減少'],['dust','slot','問題二'],[', soften ','link','緩和'],['noise','slot','問題三'],[', and give people ','link','並給人'],['somewhere calm to walk or rest.','slot','活動場所']])),
  S('A school without books can feel like a locked library, especially during exam seasons.','can feel like 是形象比喻；especially 限定最明顯的時段。','比喻表達感受，並非真的把城市變成焗爐。',[4,7,12],F('A [缺少重要元素的地方] can feel like a [形象比喻], especially during [特定時段]','用容易想像的比喻強化缺失感。','已列具體功能，還要讓讀者感受到缺少它時的環境時。',[['A ','link','設定地方'],['city without greenery','slot','缺少重要元素的地方'],[' can feel like a ','link','比喻'],['concrete oven','slot','形象比喻'],[', especially during ','link','尤其在'],['hot seasons','slot','特定時段'],['.','link','句末']])),
  S('For example, a quiet room near classrooms can become a place where pupils read, teachers prepare, and parents speak after school.','where 後把一個地方如何服務三類人具體化。','例子不只在談樹木數量，而是日常用途。',[4,5,7],F('For example, [小型空間] can become a place where [多類人各自受益]','以一個小空間展示多個群體能如何使用。','列出設施的一般好處後，需要具體描畫不同使用者時。',[['For example, ','link','舉例'],['a small tree-filled space near apartment blocks','slot','小型空間'],[' can become a place where ','link','可成為地方'],['children play safely, elderly people exercise, and office workers clear their minds after work.','slot','多類人各自受益']])),
  S('This does not merely improve the appearance of a school; it supports learning and everyday confidence.','not merely...; it... 將外觀好處推進到人的實際福祉。','作者沒有否定美觀，而是說其價值不止美觀。',[4,6,8],F('This does not merely improve [外觀]; it supports [實際的人身好處]','總結一段：由可見外觀轉向更深層的公共效益。','例子容易被誤當成美化工程時，要指出實際的人本價值。',[['This does not merely improve ','link','不只是改善'],['the appearance of a neighbourhood','slot','外觀'],['; it supports ','link','更支持'],['public health and everyday well-being.','slot','實際的人身好處']])),
  S('Another reason is that adding tests after every lesson is a short-sighted solution to weak reading skills.','Another reason 開第二段；short-sighted 指只看眼前收益。','作者承認住房短缺嚴重，反對的是佔用每塊空地。',[2,9,10],F('Another reason is that [把每處都用於單一方案] is a short-sighted solution to [問題]','提出長期規劃上的第二條理由。','某解方看似立即增加數量，卻可能犧牲未來需要時。',[['Another reason is that ','link','另一理由'],['building housing on every vacant plot','slot','把每處都用於單一方案'],[' is a short-sighted solution to ','link','是短視解法'],['urban problems.','slot','問題']])),
  S('Classroom shortages are serious, but they should be addressed through better timetables, repair of unused rooms, and more efficient use of existing space.','but 先承認短缺真實，再提供不侵佔僅餘空間的替代做法。','作者並非否認住房需要，而是反對粗糙的唯一方案。',[8,10,14],F('[短缺] are serious, but they should be addressed through [多項替代措施]','承認對方關切，再提出更周全的處理途徑。','要反駁某個解方，但不能否認它針對的問題確實存在時。',[['Housing shortages','slot','短缺'],[' are serious, but they should be addressed through ','link','嚴重，但應透過'],['better planning, redevelopment of abandoned buildings, and more efficient use of existing residential land.','slot','多項替代措施']])),
  S('If every school hall is turned into classrooms, schools may gain a few more seats but lose the shared spaces that help pupils meet.','If 設全面改用；may gain...but lose... 寫出收益與被犧牲的價值。','不是說增加住房毫無好處，而是收益可能伴隨重要損失。',[9,11,13],F('If every [原有空間] is turned into [新用途], [地方] may gain a few more [短期收益] but lose [長期價值]','把單一用途的得失並列，避免只看新增數量。','一項方案能增加產出，但會失去難替代的原有功能時。',[['If every ','link','設全面改用'],['empty area','slot','原有空間'],[' is turned into ','link','改成'],['apartments','slot','新用途'],[', ','link','則'],['cities','slot','地方'],[' may gain a few more ','link','可能多得'],['homes','slot','短期收益'],[' but lose ','link','卻失去'],['the natural spaces that help them breathe.','slot','長期價值']])),
  S('More school buses can also increase traffic, put pressure on parking areas, and make crowded streets even more stressful.','三個平行動詞列出額外建設的連鎖負擔。','句子用 can，列的是可能後果，不是每個地點必然如此。',[9,10,12],F('More [建設] can also increase [負擔一], put pressure on [系統二], and make [地方] even more stressful','指出只增加建設還可能給周邊系統帶來次生壓力。','評估一項增加供應的方案時，還需檢查交通與基礎設施承受甚麼。',[['More ','link','更多'],['buildings','slot','建設'],[' can also increase ','link','也可能增加'],['traffic','slot','負擔一'],[', put pressure on ','link','並加壓'],['drainage systems','slot','系統二'],[', and make ','link','令'],['crowded districts','slot','地方'],[' even more stressful.','link','更壓迫']])),
  S('By contrast, community libraries act as quiet public infrastructure: they support learners, offer shelter, and reduce isolation among residents.','By contrast 將樹木與建築後果對照；冒號後列三種不顯眼但重要的基建功能。','這是對公共作用的比喻，不是說樹木真的有管道。',[9,11,13],F('By contrast, [自然元素] act as quiet public infrastructure: they [多項公共作用]','把容易被低估的元素重新視為公共基建。','比較兩種土地用途時，要指出其中一種不易計價的公共功能。',[['By contrast, ','link','相反'],['trees','slot','自然元素'],[' act as quiet public infrastructure: they ','link','作為安靜基建'],['cool the air, absorb pollution, and reduce the impact of heavy rain.','slot','多項公共作用']])),
  S('Once these public records are destroyed, they are extremely difficult to restore.','Once 強調破壞後的不可逆性，為保護既有資源加分。','不是說每棵樹永遠不能再種，而是重建空間非常困難。',[10,11,12],F('Once these [珍貴資源] are destroyed, they are extremely difficult to restore','補上失去既有資源後的恢復成本。','要說明某選擇一旦造成損失，日後難以逆轉時。',[['Once these ','link','一旦'],['green spaces','slot','珍貴資源'],[' are destroyed, they are extremely difficult to restore.','link','難以恢復']])),
  S('In conclusion, I strongly agree that unused school rooms should be used for reading centres rather than extra offices.','rather than 將兩種競爭用途再放在同一結論句。','立場仍支持樹木，不是改為全部興建住宅。',[1,9,15],F('In conclusion, I strongly agree that [空置資源] should be used for [選擇] rather than [另一用途]','在結論再次直接回答兩種用途的選擇。','題目要求二選一時，末段要清楚重申優先用途。',[['In conclusion, I strongly agree that ','link','總結立場'],['vacant urban areas','slot','空置資源'],[' should be used for ','link','應用於'],['planting trees','slot','選擇'],[' rather than ','link','而非'],['constructing more housing.','slot','另一用途']])),
  S('Classrooms are necessary, but schools also need quiet common areas if they are to remain welcoming, humane, and sustainable.','but 以承認住房必要作有限讓步；if 說明綠地對城市未來的條件。','這不是主張不建任何住房。',[9,10,14],F('[用途一] are necessary, but [地方] also need [用途二] if they are to remain [長期品質]','承認兩種需要並存，仍維持保留空間的優先判斷。','結尾要避免把另一種真實需要寫成完全沒有價值時。',[['Homes','slot','用途一'],[' are necessary, but ','link','必要，但'],['cities','slot','地方'],[' also need ','link','也需要'],['green lungs','slot','用途二'],[' if they are to remain ','link','才能維持'],['healthy, humane, and sustainable.','slot','長期品質']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者在城市空地的兩種用途之間選擇哪一個？',['種樹和保留綠地；住房短缺應以更好的規劃及重建處理','所有空地都立即改建住宅','所有住房需求都不是真實問題','完全不表態，只列出樹木作用'],'引言完全同意保留綠地；第二主體段承認住房短缺。'),
  {type:'multi',prompt:'哪兩項分別是兩段主體的理由？',detail:'選兩項，再按「確認」。',options:['樹木改善擁擠城市的日常宜居性與公共健康','每塊空地都建房短視，會損失難重建的自然基建','城市已經完全不需要任何新住房','樹木只改善外觀，沒有其他作用'],correct:[0,1],why:'第一段談當下生活品質；第二段談長期規劃與不可逆損失。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 有限土地的選擇','承認有人主張建房，作者選擇保留樹木和綠地。'],
  ['主體一 · 城市更宜居','陰涼、少塵、減噪；小型綠地服務孩子、長者與上班族。'],
  ['主體二 · 長遠規劃','承認住房短缺，提出替代途徑並指出建滿空地的連鎖損失。'],
  ['結論 · 兩種需要並存','住房必要，但城市亦需要難以重建的綠色空間。'],
],'稀缺資源 → 即時宜居效益 → 住房替代方案與長遠損失 → 平衡結論。')];
const evidence=[
  Q('第一段列出樹木的哪些直接功能？',['提供陰涼、減少塵埃、緩和噪音並給人寧靜空間','只有房屋買賣收益','只提高道路車速','只提供辦公室面積'],'Trees provide shade...。'),
  Q('小型綠地例子提到哪三類使用者？',['孩子、長者與下班後的上班族','只有地產發展商','只有駕車人士','只有醫院職員'],'children...elderly...office workers。'),
  Q('作者如何承認對方的住房問題？',['明說住房短缺嚴重，並提出規劃、重建及有效利用現有用地','否認住房短缺存在','主張任何公寓都應拆除','只談樹木外觀'],'Housing shortages are serious, but...。'),
  Q('每塊空地都改建公寓，可能同時帶來甚麼？',['少量新住房與自然空間流失','只有更潔淨的空氣','交通必然立即減少','城市不再需要排水'],'may gain...but lose...。'),
  Q('樹木作為「安靜公共基建」的三項作用是甚麼？',['降低氣溫、吸收污染、減輕暴雨影響','提高租金、印製地圖、加速交通','只供裝飾','只增加住房數目'],'冒號後列三項。'),
  Q('Once 句在長遠規劃論證中補上甚麼？',['綠地毀壞後極難恢復，損失不能輕易逆轉','樹木永遠不會死亡','城市完全不能建房','任何空地都只可使用一年'],'難以恢復提升保留現有綠地的理由。'),
];
const logic=[
  sequence('第一主體段：樹木為何改善城市生活？',[
    ['直接主張','樹木使人口密集地區更宜居。'],
    ['既有環境','居民已被道路、建築和交通包圍。'],
    ['實際功能','陰涼、少塵、減噪和可休息的地方。'],
    ['形象比喻','缺少綠化的城市如炎熱季節的混凝土焗爐。'],
    ['人物例子','小型綠地服務孩子、長者和上班族。'],
    ['段落結果','價值超過外觀，關乎公共健康與日常福祉。'],
  ],'擁擠現況 → 樹木功能 → 不同群體使用 → 公共健康。'),
  sequence('第二主體段：為何不把每塊空地都建房？',[
    ['另一理由','全數建房是只看眼前數量的短視做法。'],
    ['有限讓步','住房短缺真實，應靠規劃、重建和有效用地。'],
    ['得失比較','或多幾間住房，卻失去讓城市「呼吸」的空間。'],
    ['連鎖負擔','更多交通、排水壓力和擁擠感。'],
    ['自然基建','樹木降溫、吸污和減輕暴雨影響。'],
    ['不可逆性','綠地一旦毀壞很難恢復。'],
  ],'承認住房需要 → 提替代方案 → 比較長遠損失 → 難以逆轉。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('學校想把最後一間自由閱讀室改成考試辦公室，因辦公空間不足。','哪項決策最能轉用文章的稀缺資源邏輯？',['先衡量閱讀室對學生的日常價值，並尋找其他辦公安排','只計新增一間辦公室的數量，不看失去甚麼','因為辦公不足是真問題，就不需考慮替代方案','假定閱讀室只供裝飾，不問學生如何使用'],['要同時衡量新增收益和現有功能的損失。','只看一方。','原文承認問題後提出替代。','忽略實際使用者。'],[0,1,8,9,10],'scarce land；may gain...but lose...。'),
  T('一座城市的公共空間被道路、車場和高樓佔滿。','哪項推理與第一主體段相同？',['僅餘開放空間更有日常價值，不能只用新增建築量評估','既有道路愈多，居民就必然不需要任何休息地方','只要城市有人口，就應把所有空地改成停車場','公共空間的外觀是唯一需要衡量的城市效益'],['已擁擠現況提升保留空間的價值。','與原文相反。','忽略人本效益。','樹木不只美觀。'],[3,4,6,7],'few remaining open spaces；everyday well-being。'),
  T('社區設一個小型公共圖書角，可供孩子閱讀、長者休息和工人下班後停留。','這與綠地例子同用哪種證據？',['具體描寫一處小空間如何服務不同年齡及需要的人','只列圖書角面積，完全不談實際使用情況','只說「大家喜歡」，不交代任何人物或活動','把所有受益者寫成同一群人，忽略用途差異'],['原文以孩子、長者、工人顯示多類用途。','缺少人物。','證據空泛。','失去多群體特點。'],[6,7],'children...elderly...office workers。'),
  T('有人反對保留校園花園，說「課室短缺，所以必須把花園改成課室」。','哪項讓步與替代建議最合適？',['承認課室短缺，再研究空置房間與時間表等其他做法','否認課室短缺存在，便不用研究真正的安排','承認短缺後，仍不必檢查任何可用舊空間','只比較花園的顏色與課室牆壁的顏色'],['Housing shortages are serious, but... 提供可轉用結構。','否認真問題。','未提替代。','離題。'],[8,9],'shortages serious; addressed through planning。'),
  T('市議會為增加少量泊車位，打算永久拆掉一個公園。','哪項得失分析最完整？',['計算新增泊車位，也計入休憩、降溫及重建公園的難度','只報新增泊車位，因為失去公園不能衡量','只談公園好看，忽略它有降溫和休憩作用','聲稱建新泊車位一定會改善全部城市問題'],['短期產出與難恢復的公共功能都要看。','只看收益。','忽略實際功能。','過度保證。'],[5,7,10,12,13],'may gain...but lose...；difficult to restore。'),
  T('某地認為樹木只是城市美化，不算基礎設施。','文章哪項回應最有力？',['樹木可降溫、吸收污染及減輕暴雨影響，具有公共功能','樹木漂亮便已證明不必考慮任何實際用途','只有地下管線才可能為居民提供公共利益','只要建築外牆變綠，便可取代所有樹木作用'],['quiet public infrastructure 後有三項功能。','只談美觀。','公共基建不限管線。','不能等同生態功能。'],[4,7,12],'quiet public infrastructure。'),
  T('學校把操場改建後，發現難以再找出同等面積的活動地方。','哪個句型最能突顯這種長遠代價？',['一旦原有公共空間被毀，日後恢復可能極為困難','只要新課室建成，所有舊功能都能自動回復','操場面積可以隨時憑一張圖紙完全重建','要評估改建，只需知道完成工程的日期'],['Once...destroyed...difficult to restore。','過度保證。','忽略土地限制。','忽略失去的功能。'],[10,13],'Once these green spaces are destroyed...。'),
  T('公共政策報告只列出新住宅數目，沒有提道路與排水容量。','應補充哪一類可能後果？',['額外建築可能增加交通與排水壓力，令區域更擁擠','只看樓宇顏色，便能判斷交通和排水系統負荷','住房數目增加，便保證道路立即不再塞車','只要房屋短缺存在，所有基建限制都不重要'],['原文列交通、排水和壓抑三項。','與承載力無關。','與可能後果相反。','忽略系統壓力。'],[9,11],'increase traffic；pressure on drainage。'),
  T('一位學生寫「城市應保留所有樹，住房根本不重要」。','哪項修正較忠於原文？',['承認住房必要，再說明不該佔用每一塊僅餘空地','維持原句，因為作者認為住房完全沒有任何需要','把空地全部改建住宅，完全不留下綠化空間','只談樹木外觀，刪去規劃和住房短缺的討論'],['Homes are necessary 是明確讓步。','與結論相反。','與立場相反。','漏掉第二段。'],[9,14,15],'Homes are necessary, but...。'),
  T('城市要比較兩項計劃：建房與種樹。','怎樣避免把兩種方案寫成空泛對立？',['先承認住房需求，再列替代建房途徑及綠地的公共作用','只反覆說種樹很好，完全不提住房短缺的現實','只反覆說要有房屋，完全不比較自然空間損失','聲稱任何土地選擇都不用評估用途和長期後果'],['原文同時處理對方需要與自己的理由。','缺少回應。','缺少代價。','與審慎判斷相反。'],[1,8,9,10,12,15],'Housing shortages are serious, but...。'),
  T('某個歷史街市經拆卸後，再重建原來社區網絡十分困難。','本文哪項原則可以跨題使用？',['評估方案時要計入原有公共價值，以及破壞後難以恢復的損失','只要新建築數量較多，原有社區價值便完全無關','凡舊建築一定比新建築好，不必比較兩者功能','既然有損失風險，所有公共工程都應永遠停止'],['不可逆成本是有意義的判斷依據。','忽略原有價值。','過度概括。','文章非反對所有建設。'],[10,12,13],'extremely difficult to restore。'),
  T('要一句話概括全文立場與兩段理由。','哪項最準確？',['保留城市綠地可改善日常健康；住房應另以規劃處理，以免失去難恢復的自然功能','作者主張住房短缺完全不存在，任何房屋都不應建造','作者只談樹木外觀，沒有提出交通與排水的後果','作者認為綠地只服務孩子，與長者及工人完全無關'],['包括立場、宜居與長遠規劃兩理由。','忽略讓步。','忽略第二段。','忽略多群體例子。'],[1,2,3,4,6,7,8,9,10,11,12,13,14,15],'liveable；short-sighted；green lungs。'),
];
const balancedOptions={
  0:['先衡量閱讀室的日常用途，再尋找其他辦公空間安排','只看新增辦公室數目，忽略原本閱讀室的使用價值','把辦公不足當成唯一問題，不再檢查校內其他空間','先假設閱讀室沒有用途，再要求學生證明它很重要'],
  1:['僅餘開放空間更有價值，不能只用建築數量衡量','既有道路足夠多，居民便不再需要任何休息地方','只要人口增加，就應把最後空地全部改成車場','公共空間只需看外觀，不必評估居民如何使用'],
  2:['描寫一處小空間如何服務不同年齡及需要的人','只列圖書角的面積，不觀察人們實際如何使用','只聲稱居民喜歡，卻不交代任何人物或活動','把所有使用者寫成同一群，忽略用途上的差別'],
  3:['承認課室短缺，並研究空置房間與時間表等替代安排','否認課室短缺的存在，因此不用再規劃實際安排','承認短缺之後，仍不檢查校內可再利用的空間','只比較花園和課室的外觀，忽略各自承擔的功能'],
  4:['計入新增泊車位，也計入公園的休憩降溫與重建難度','只報新增泊車位數目，因公園原本用途不易計量','只談公園外觀好看，卻不檢查降溫與休憩功能','假設增加泊車位後，交通和環境問題都會消失'],
  5:['樹木可以降溫、吸收污染並減輕暴雨，具有公共功能','樹木只要好看，就不必再檢查任何實際公共用途','只有地下管線才算基建，地面自然元素沒有作用','把建築外牆改為綠色，就能取代所有樹木功能'],
  6:['一旦公共空間被拆毀，日後恢復原有功能可能極困難','只要新課室已建成，原有活動空間就會自然重現','操場只須保留舊圖紙，便能隨時找回同等土地','改建只須看工程日期，毋須估計原有功能的損失'],
  7:['額外建築可能增加交通與排水壓力，令區域更擁擠','只看樓宇外牆顏色，就能估算道路與排水負荷','住房數量一增加，道路便必然立即不再塞車','只要住房需求存在，附近基建的容量就不重要'],
  9:['先承認住房需求，再列替代方案與綠地的公共功能','只反覆說種樹很好，完全不交代真實住房短缺','只反覆說需要住房，不比較自然空間失去甚麼','聲稱土地選擇不用評估用途及長期公共後果'],
  10:['評估新方案時，也要計入原有價值及難以恢復的損失','只要新建築較多，就不必再討論原有社區的價值','凡舊建築都必然較好，毋須比較新舊兩種功能','一旦存在損失風險，所有公共工程都應立即停止'],
  11:['保留綠地可改善健康；住房另以規劃處理，避免長期損失','作者認為住房短缺根本不存在，所有新房屋都不應建造','作者只談樹木外觀，完全不討論交通與排水的後果','作者認為綠地只服務孩子，長者及工人都無法使用'],
};
for(const [index,options] of Object.entries(balancedOptions))transfer[Number(index)].options=options;
export default {key:'opinion:61',meta:{topic:'城市空地應種樹還是建房',summary:'作者強烈同意把城市空地保留作樹木及綠化用途。首段說明樹木提供陰涼、減塵、減噪及多群體共用的休憩空間，讓擁擠城市更宜居；次段承認住房短缺，但主張用規劃、重建和既有住宅用地處理，避免把每塊空地建滿而失去難以恢復的自然基建。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
