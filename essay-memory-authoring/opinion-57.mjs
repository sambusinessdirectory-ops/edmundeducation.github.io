const simple=[
  'In many wealthy countries, health problems now often come from daily habits rather than infections: people work for long hours, eat badly, feel stressed for a long time, and move too little.',
  'I strongly disagree that this means we should go back to old medical treatments.',
  'A better answer is to prevent these problems by living in healthier ways and to use treatments that modern tests show to be safe and effective.',
  'Most illnesses linked to how people live come from habits and surroundings, not from a lack of old treatments.',
  'Someone who sits at a desk for ten hours, eats takeaway food, and sleeps badly is not sick because people have forgotten plant medicines; the problem is that this way of life places too much strain on the body.',
  'Here, medicine may lower blood pressure or blood sugar, but no kind of medicine can take the place of exercise, sleep, and healthier food.',
  'For this reason, governments, schools, and employers should help prevent illness by making it easier to walk or cycle, eat well, work reasonable hours, and get help with mental health.',
  'Telling people to return to old treatments might also make them feel safe when they are not.',
  'Old treatments often come from what a community remembers, not from careful tests, so we may not know how well they work, what harm they cause, or how much is safe to take.',
  'If people use them for serious problems involving stress, being very overweight, or the heart, they might wait too long to find out what is wrong, making the illness harder to treat.',
  'Modern care has problems too, but it offers health checks, someone to talk to, food advice, and medicines that experts can test, watch, and make better.',
  'Replacing care based on tests with old treatments would be like giving up a useful map in exchange for a story that only makes us feel better.',
  'In short, I strongly disagree that society should tell people to go back to old medical treatments.',
  'We should prevent illnesses caused by daily habits and use care supported by tests, rather than depend on treatments whose effects are often not clear.',
];
const vocabulary=[
  [['developed societies','wealthy countries','發達社會'],['ill health','health problems','健康問題'],['increasingly linked','now often come','愈來愈相關'],['infections','infections','感染'],['the way people live','daily habits','生活方式'],['chronic stress','feel stressed for a long time','長期壓力'],['physical inactivity','move too little','缺乏運動']],
  [['completely disagree','strongly disagree','完全不同意'],['lead us back towards traditional medicine','means we should go back to old medical treatments','回歸傳統醫學']],
  [['more sensible response','better answer','更合理回應'],['prevent these conditions','prevent these problems','預防這些疾病'],['healthier routines','living in healthier ways','更健康日常習慣'],['treatment firmly based on modern evidence','treatments that modern tests show to be safe and effective','以現代證據為基礎的治療']],
  [['lifestyle illnesses','illnesses linked to how people live','生活方式疾病'],['rooted in','come from','根源在於'],['environments','surroundings','環境'],['absence of ancient remedies','lack of old treatments','缺乏古老療法']],
  [['spends ten hours at a desk','sits at a desk for ten hours','在書桌前坐十小時'],['takeaway meals','takeaway food','外賣'],['herbal treatments','plant medicines','草藥療法'],['his body is being pushed beyond healthy limits','this way of life places too much strain on the body','身體超出健康負荷']],
  [['In such a case','Here','在這種情況下'],['pills','medicine','藥物'],['sugar levels','blood sugar','血糖水平'],['traditional or modern','no kind of medicine','傳統或現代'],['substitute for','take the place of','取代']],
  [['Therefore','For this reason','因此'],['focus on prevention','help prevent illness','著重預防'],['active transport','walk or cycle','主動出行'],['balanced diets','eat well','均衡飲食'],['reasonable working hours','work reasonable hours','合理工作時間'],['mental-health support','help with mental health','心理健康支援']],
  [['Encouraging a return to traditional medicine','Telling people to return to old treatments','鼓勵回歸傳統醫學'],['false sense of security','feel safe when they are not','錯誤安全感']],
  [['Traditional practices','Old treatments','傳統療法'],['cultural memory','what a community remembers','文化記憶'],['rigorous testing','careful tests','嚴謹測試'],['their effects','how well they work','效果'],['side effects','what harm they cause','副作用'],['safe doses','how much is safe to take','安全劑量']],
  [['patients','people','病人'],['rely on them','use them','依賴它們'],['serious conditions','serious problems','嚴重疾病'],['obesity','being very overweight','肥胖'],['delay proper diagnosis','wait too long to find out what is wrong','延誤正確診斷'],['harder to treat','harder to treat','更難治療']],
  [['Modern healthcare','Modern care','現代醫療'],['not perfect','has problems too','並不完美'],['check-ups','health checks','身體檢查'],['counselling','someone to talk to','輔導'],['nutritional advice','food advice','營養建議'],['monitored and improved','watch, and make better','監察與改良']],
  [['evidence-based system','care based on tests','以證據為基礎的系統'],['traditional remedies','old treatments','傳統療法'],['exchanging a map for a comforting story','giving up a useful map in exchange for a story that only makes us feel better','以地圖換取安慰故事']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['encourage a return to traditional medicine','tell people to go back to old medical treatments','鼓勵回歸傳統醫學']],
  [['Lifestyle-related illnesses','illnesses caused by daily habits','生活方式相關疾病'],['tackled through prevention','prevent illnesses','透過預防處理'],['evidence-based healthcare','care supported by tests','以證據為基礎的醫療'],['treatments whose reliability is often uncertain','treatments whose effects are often not clear','可靠性不確定的療法']],
];
const chunkOverrides=[
  ['In many developed societies, ill health is increasingly linked not to infections, but to the way people live:','long working hours, poor diets, chronic stress and physical inactivity.'],
  ['I completely disagree','that this should lead us back towards traditional medicine.'],
  ['The more sensible response is to prevent these conditions through healthier routines','and to keep treatment firmly based on modern evidence.'],
  ['Most modern lifestyle illnesses are rooted in habits and environments','rather than in the absence of ancient remedies.'],
  ['A person who spends ten hours at a desk, eats takeaway meals and sleeps badly is not ill because society has forgotten herbal treatments;','he is ill because his body is being pushed beyond healthy limits.'],
  ['In such a case, pills may reduce blood pressure or sugar levels,','but no medicine, traditional or modern, can substitute for exercise, rest and better food.'],
  ['Therefore, governments, schools and employers should focus on prevention','by promoting active transport, balanced diets, reasonable working hours and better mental-health support.'],
  ['Encouraging a return to traditional medicine','could also give people a false sense of security.'],
  ['Traditional practices are often based on cultural memory rather than rigorous testing,','so their effects, side effects and safe doses may be unclear.'],
  ['If patients rely on them for serious conditions linked to stress, obesity or heart disease,','they may delay proper diagnosis until the problem becomes harder to treat.'],
  ['Modern healthcare is not perfect,','but it offers check-ups, counselling, nutritional advice and medicines that can be tested, monitored and improved.'],
  ['Replacing this evidence-based system with traditional remedies','would be like exchanging a map for a comforting story.'],
  ['In conclusion, I completely disagree','that society should encourage a return to traditional medicine.'],
  ['Lifestyle-related illnesses should be tackled through prevention and evidence-based healthcare,','not through treatments whose reliability is often uncertain.'],
];
const simpleChunkOverrides=[
  ['In many wealthy countries, health problems now often come from daily habits rather than infections:','people work for long hours, eat badly, feel stressed for a long time, and move too little.'],
  ['I strongly disagree','that this means we should go back to old medical treatments.'],
  ['A better answer is to prevent these problems by living in healthier ways','and to use treatments that modern tests show to be safe and effective.'],
  ['Most illnesses linked to how people live come from habits and surroundings,','not from a lack of old treatments.'],
  ['Someone who sits at a desk for ten hours, eats takeaway food, and sleeps badly is not sick because people have forgotten plant medicines;','the problem is that this way of life places too much strain on the body.'],
  ['Here, medicine may lower blood pressure or blood sugar,','but no kind of medicine can take the place of exercise, sleep, and healthier food.'],
  ['For this reason, governments, schools, and employers should help prevent illness','by making it easier to walk or cycle, eat well, work reasonable hours, and get help with mental health.'],
  ['Telling people to return to old treatments','might also make them feel safe when they are not.'],
  ['Old treatments often come from what a community remembers, not from careful tests,','so we may not know how well they work, what harm they cause, or how much is safe to take.'],
  ['If people use them for serious problems involving stress, being very overweight, or the heart,','they might wait too long to find out what is wrong, making the illness harder to treat.'],
  ['Modern care has problems too,','but it offers health checks, someone to talk to, food advice, and medicines that experts can test, watch, and make better.'],
  ['Replacing care based on tests with old treatments','would be like giving up a useful map in exchange for a story that only makes us feel better.'],
  ['In short, I strongly disagree','that society should tell people to go back to old medical treatments.'],
  ['We should prevent illnesses caused by daily habits and use care supported by tests,','rather than depend on treatments whose effects are often not clear.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('In many developed societies, ill health is increasingly linked not to infections, but to daily routines: long hours, poor sleep and inactivity.','not...but... 對照常見解釋與真正要談的原因；冒號後列具體項目。','作者聚焦生活環境，沒有說感染已完全消失。',[3,4,8],F('In many developed societies, ill health is increasingly linked not to [較少相關的原因], but to [主要原因]: [具體清單]','用對照與清單界定問題成因，為立場鋪路。','要用 not...but... 對照較弱與較有力的原因，再用冒號列出具體項目時。',[['In many developed societies, ill health is increasingly linked not to ','link','對照兩類成因'],['infections','slot','較少相關的原因'],[', but to ','link','轉向'],['the way people live','slot','主要原因'],[': ','link','列明'],['long working hours, poor diets, chronic stress and physical inactivity.','slot','具體清單']])),
  S('I completely disagree that rising traffic should lead us back towards wider motorways.','completely disagree 直接回答提議；that 後精準指向被反對的解方。','反對的是回歸此解方，不是否認問題存在。',[0,2,12],F('I completely disagree that [問題] should lead us back towards [舊解方]','直接拒絕題目提出的解方，避免只談問題。','題目提出一種回歸舊做法的建議，而作者要明確表示反對時。',[['I completely disagree that ','link','明示反對'],['this','slot','問題'],[' should lead us back towards ','link','不應引回'],['traditional medicine.','slot','舊解方']])),
  S('The more sensible response is to improve reliable public transport and to keep planning firmly based on measured results.','more sensible response 指出替代方案；and 把預防與有證據的處理並列。','句子並未否認治療，主張治療有證據。',[1,3,13],F('The more sensible response is to [及早預防] and to keep [後續措施] based on [可靠依據]','在拒絕某項提議後，立即交代替代做法。','表明反對後，需要提出積極且可檢查的替代方案時。',[['The more sensible response is to ','link','提出更合理做法'],['prevent these conditions through healthier routines','slot','及早預防'],[' and to keep ','link','並讓'],['treatment','slot','後續措施'],[' firmly based on ','link','牢靠建立於'],['modern evidence.','slot','可靠依據']])),
  S('Most modern lifestyle illnesses are rooted in daily routines and surroundings rather than in a shortage of miracle cures.','rooted in 指深層成因；rather than 排除不相干的替代解釋。','不是聲稱每種現代疾病都由同一習慣造成。',[0,4,7],F('Most modern lifestyle illnesses are rooted in [實際成因] rather than in [錯置的解方]','把討論從表面的解方拉回問題根源。','要指出問題真正根源，並排除一項與根源不相符的解釋時。',[['Most modern lifestyle illnesses are rooted in ','link','指出根源'],['habits and environments','slot','實際成因'],[' rather than in ','link','而非'],['the absence of ancient remedies.','slot','錯置的解方']])),
  S('A worker who sleeps only four hours a night is not ill because hospitals lack old remedies; he is ill because he cannot recover from constant strain.','not...because...; ...because... 駁回錯因，再提供真正的因果。','這是具體例子，不是對所有病人的診斷。',[3,5,9],F('[具體人物] is not ill because [錯誤歸因]; he is ill because [真正原因]','用具體人物拆解看似合理但錯置的解釋。','要用具體人物排除一項錯誤因果解釋，再指出較有根據的原因時。',[['A person who spends ten hours at a desk, eats takeaway meals and sleeps badly','slot','具體人物'],[' is not ill because ','link','非因'],['society has forgotten herbal treatments','slot','錯誤歸因'],['; he is ill because ','link','真正原因是'],['his body is being pushed beyond healthy limits.','slot','真正原因']])),
  S('In such a case, a prescribed drug may reduce blood pressure or sugar levels, but no medicine, traditional or modern, can substitute for regular sleep, movement and balanced meals.','may 承認短期作用；but no...can substitute for... 清楚界定不能取代的根本措施。','作者不是說藥物毫無用處；它能減低某些指標。',[4,7,10],F('In such a case, [補救] may reduce blood pressure or sugar levels, but no medicine, traditional or modern, can substitute for [根本措施]','承認補救有用，同時指出它的作用界限。','要承認一種補救可能改善短期指標，同時說明它不能取代根本措施時。',[['In such a case, ','link','承接個案'],['pills','slot','補救'],[' may reduce blood pressure or sugar levels, but no medicine, traditional or modern, can substitute for ','link','雖可改善指標，卻不能代替'],['exercise, rest and better food.','slot','根本措施']])),
  S('Therefore, schools and families should focus on prevention by promoting steady practice, adequate sleep and early support.','Therefore 將分析轉為建議；by 後列可實施措施。','不是只籠統說「應預防」，而是列誰做甚麼。',[3,5,9],F('Therefore, [決策者] should focus on prevention by [多項具體措施]','把成因分析落到負責者與可做的預防行動。','指出根源和補救界限後，需要提出可執行的政策建議時。',[['Therefore, ','link','由前文推論'],['governments, schools and employers','slot','決策者'],[' should focus on prevention by promoting ','link','應透過'],['active transport, balanced diets, reasonable working hours and better mental-health support.','slot','多項具體措施']])),
  S('Encouraging a return to untested shortcuts could also give families a false sense of security.','could 保留可能性；false sense of security 指錯以為風險已受控。','這是可能風險，並非聲稱每個採用者都必然受害。',[8,9,11],F('Encouraging [未經檢驗的捷徑] could give [人們] a false sense of security','為第二理由提出認知上的風險。','某方法可能讓人誤以為問題已解決、從而放鬆必要措施時。',[['Encouraging ','link','鼓勵'],['a return to traditional medicine','slot','未經檢驗的捷徑'],[' could also give ','link','也可能給'],['people','slot','人們'],[' a false sense of security.','link','錯誤安全感']])),
  S('Traditional practices are often based on cultural memory rather than rigorous testing, so their effects and safe limits may be unclear.','rather than 比較依據；so 指出證據不足導致的不確定性。','傳統來源不自動表示無效，只表示仍需檢驗。',[7,9,10],F('[舊做法] may be based on [傳承] rather than [嚴謹測試], so [效果與安全界限] may be unclear','把做法的依據與實際不確定性連起來。','評估一項做法時，要區分沿用已久和經過可靠檢驗這兩件事。',[['Traditional practices','slot','舊做法'],[' are often based on ','link','常根據'],['cultural memory','slot','傳承'],[' rather than ','link','而非'],['rigorous testing','slot','嚴謹測試'],[', so ','link','因此'],['their effects, side effects and safe doses','slot','效果與安全界限'],[' may be unclear.','link','可能不清楚']])),
  S('If tenants rely on a temporary patch for a dangerous crack, they may delay an inspection until repairs become harder.','If 設依賴情境；may delay...until... 交代延誤後果。','不是說所有傳統療法都延誤診斷；風險針對嚴重情況。',[7,8,11],F('If [人們] rely on [未證實方法] for [嚴重問題], they may delay [必要檢查] until [後果惡化]','寫出錯誤安全感如何轉化為實際風險。','要把依賴某替代方法的風險具體化為延誤與惡化時。',[['If ','link','設條件'],['patients','slot','人們'],[' rely on ','link','依賴'],['them','slot','未證實方法'],[' for ','link','處理'],['serious conditions linked to stress, obesity or heart disease','slot','嚴重問題'],[', they may delay ','link','可能延誤'],['proper diagnosis','slot','必要檢查'],[' until ','link','直到'],['the problem becomes harder to treat.','slot','後果惡化']])),
  S('Modern healthcare is not perfect, but it offers advice and medicines that can be tested, monitored and improved.','not perfect, but... 是有限讓步；that can be... 強調系統可檢查及改善。','作者未說現代醫療對每個病都能完全治癒。',[8,9,12],F('[現行系統] is not perfect, but it offers [服務] that can be tested, monitored and improved.','承認現行方案的缺點，再指出可驗證的優勢。','要先承認一個方案並不完美，再說明它仍有可檢驗的優點時。',[['Modern healthcare','slot','現行系統'],[' is not perfect, but it offers ','link','雖不完美，仍提供'],['check-ups, counselling, nutritional advice and medicines','slot','服務'],[' that can be tested, monitored and improved.','link','可檢查及改良']])),
  S('Replacing tested safety rules with a lucky charm would be like exchanging a map for a comforting story.','would be like 用鮮明類比，指出情緒上的安慰不能代替可靠指引。','類比不是實驗證據，而是概括前文已說明的差別。',[7,10,13],F('Replacing [可檢查的系統] with [安慰性替代物] would be like [可靠工具換安慰故事]','在證據分析後，用比喻讓差別更容易記住。','論證已建立後，要用短比喻總結可靠指引與心理安慰的差別時。',[['Replacing ','link','以...取代'],['this evidence-based system','slot','可檢查的系統'],[' with ','link','換成'],['traditional remedies','slot','安慰性替代物'],[' would be like ','link','好比'],['exchanging a map for a comforting story.','slot','可靠工具換安慰故事']])),
  S('In conclusion, I completely disagree that schools should encourage a return to untested methods.','In conclusion 重述明確立場；that 後重點仍是原題的提議。','結論沒有轉成「部分同意」。',[1,11,13],F('In conclusion, I completely disagree that [決策者] should encourage [舊解方]','結論重申對提議的回答，和引言保持一致。','收束議論時，需要直接回到題目的建議並重述立場。',[['In conclusion, I completely disagree that ','link','總結並重申反對'],['society','slot','決策者'],[' should encourage ','link','鼓勵'],['a return to traditional medicine.','slot','舊解方']])),
  S('Weak reading skills should be tackled through early teaching and tested support, not through methods whose results remain uncertain.','through...not through... 把應採用和應避免的做法並排，重申準則。','不是說所有傳統做法都必然有害；要看可靠性。',[2,10,12],F('[問題] should be tackled through [預防與可靠方法], not through [效果不明的方法]','以清楚的選擇原則結束全文。','結論要把兩段理由壓縮成一個可轉用的決策準則時。',[['Lifestyle-related illnesses','slot','問題'],[' should be tackled through ','link','應透過'],['prevention and evidence-based healthcare','slot','預防與可靠方法'],[', not through ','link','而非'],['treatments whose reliability is often uncertain.','slot','效果不明的方法']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對「回歸傳統醫學」的建議持甚麼立場？',['完全反對；應改變生活習慣並採用有現代證據支持的治療','完全贊成；應停止所有現代醫療','沒有立場；只描述疾病清單','認為感染是唯一健康問題'],'引言明說 completely disagree，隨後提出預防與現代證據兩條方向。'),
  {type:'multi',prompt:'選出兩段主體各自的核心理由',detail:'選兩項，再按「確認」。',options:['生活方式是根源；任何藥物都不能取代運動、休息及飲食改善','未經嚴謹測試的療法可能造成錯誤安全感與延誤診斷','所有傳統療法必定有害','現代醫療能百分百治好任何疾病'],correct:[0,1],why:'第一段談生活根源與預防；第二段談證據不足及延誤風險。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 拒絕回歸舊療法','現代生活方式帶來健康問題；主張預防與有證據支持的治療。'],
  ['主體段一 · 找對根源','以久坐、外賣、睡眠不足說明藥物不能代替生活改善。'],
  ['主體段二 · 避免錯誤安全感','傳統做法若未經測試，可能效果不明並延誤嚴重病情的診斷。'],
  ['結論 · 預防與證據','重述反對立場及更可靠的處理原則。'],
],'生活根源 → 預防措施 → 未驗證療法的風險 → 證據準則。')];
const evidence=[
  Q('引言列出哪四項生活方式因素？',['長工時、不良飲食、長期壓力及缺乏運動','只列感染、手術、疫苗及醫院','只有運動不足','只有草藥副作用'],'冒號後逐項列出。'),
  Q('久坐、吃外賣和睡眠差的例子要駁回甚麼解釋？',['「生病是因為社會忘記草藥療法」這種錯因','「生活習慣可能影響健康」','「運動與休息很重要」','「應提供心理支援」'],'not ill because...; he is ill because...。'),
  Q('作者是否承認藥物可以產生部分作用？',['承認；藥物可能降低血壓或血糖，但不能代替根本的生活改變','否認；藥物一律沒有任何作用','認為草藥必然比所有現代藥更有效','認為睡眠可以取代所有診斷'],'may reduce...but no medicine...can substitute for...。'),
  Q('傳統療法的三項不確定性是甚麼？',['效果、副作用及安全劑量','價格、名稱及包裝顏色','只關乎運輸與宣傳','醫院位置、床位及燈光'],'effects, side effects and safe doses。'),
  Q('對嚴重病情依賴傳統療法，文章指出哪個實際風險？',['可能延誤正確診斷，使問題更難治療','必然立刻痊癒','一定不再有任何症狀','只會令藥物名稱改變'],'may delay proper diagnosis until...。'),
  Q('地圖與安慰故事的比喻強調甚麼？',['可檢查的指引比單純令人安心的替代物可靠','故事在所有情況都比地圖準確','所有病人都需要出遊','傳統醫學是一張真實地圖'],'比喻承接現代醫療可測試、監察和改良的優勢。'),
];
const logic=[
  sequence('第一主體段：為何先改生活方式？',[
    ['根源','多數相關疾病源於習慣與環境，非缺少古老療法。'],
    ['人物例子','久坐、外賣及睡眠不足對身體構成負擔。'],
    ['藥物界限','藥物可改善個別指標，不能代替運動、休息和飲食。'],
    ['政策回應','政府、學校和僱主推廣交通、飲食、工時及心理支援。'],
  ],'根源 → 例子 → 補救界限 → 具體預防。'),
  sequence('第二主體段：為何不能依賴未驗證療法？',[
    ['心理風險','回歸舊療法可能造成錯誤安全感。'],
    ['證據問題','效果、副作用與安全劑量可能不清楚。'],
    ['實際後果','嚴重病人可能延誤正確診斷。'],
    ['替代準則','現代醫療雖不完美，仍可測試、監察和改良。'],
    ['比喻收束','用地圖與安慰故事概括可靠指引與心理安慰的差別。'],
  ],'錯誤安全感 → 證據不足 → 診斷延誤 → 可檢查的方案。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某校學生長期缺課，校長卻只想買一套昂貴的考前練習。','哪項推理最能轉用本文的「找根源」原則？',['先查缺課根源並持續支援，考前練習只補一部分','先加密考前練習，再看學生有否持續缺課','先分析考試分數，卻不調查學生缺課原因','先提供補課，便不需改善日常的學習環境'],['缺課是根源問題，考前練習只能補部分後果。','練習若先行，仍可能漏掉缺課原因。','分數反映結果，不一定說明缺課原因。','補課不取代持續學習環境。'],[3,4,5],'rooted in habits and environments；cannot substitute for。'),
  T('一座城市的道路事故增加，官員說「只要買更多救護車就足夠」。','按首段邏輯，下一步應問甚麼？',['先改善路面與車速，救護支援仍用於事故後','先增加救護車，卻不查道路設計或車速','先檢查道路設計，但不保留事故後支援','先宣傳小心駕駛，無須看行人空間安全'],['道路風險需要事前處理，事故後救護仍重要。','救護車不能防止危險路面造成事故。','預防不等於取消事故後支援。','宣傳不能取代安全街道設計。'],[3,5,6],'rooted in...；focus on prevention。'),
  T('某公司宣傳一款從未經過安全測試的產品，說「祖父母也使用，所以一定安全」。','哪項評估最符合文章？',['傳承經驗可參考，仍須查效果與安全用量','長期沿用能作線索，不必再檢查副作用','安全測試可了解效果，但毋須查適用劑量','家人用過可提高信任，便足以直接推廣'],['長期沿用不是效果與安全劑量的可靠證據。','口耳傳承不足以排除副作用。','適用劑量是安全評估一部分。','熟悉感不能替代檢驗。'],[8,10],'cultural memory rather than rigorous testing。'),
  T('住戶用漂亮壁紙蓋住牆上的大裂縫，因而延遲請工程師檢查。','這與第二段哪條因果鏈相近？',['漂亮壁紙或令人安心，卻不能取代結構檢查','漂亮壁紙能遮裂縫，所以可延後專業檢查','結構檢查有用，卻只需觀察壁紙表面','先修飾外觀，再假定牆體問題已經消失'],['遮住裂縫可能帶來錯誤安全感並延後檢查。','遮住外觀不代表結構安全。','壁紙表面不能顯示牆體狀態。','外觀改善不等於問題消失。'],[7,9,11],'false sense of security；delay proper diagnosis。'),
  T('一項新教學方法尚未經過評估，但不少人說它讓家長「感覺有希望」。','要避免甚麼混淆？',['把「感到有希望」當成「已證明有效」的成果','把家長感受與測試成效分開記錄比較','先試小型教學評估，再決定是否擴大','先查學生成績與可能副作用，再看感受'],['把感受當作已證成效，正是證據與安慰混淆。','這是避免混淆的做法。','試驗可收集教學效果資料。','成績與副作用評估可補足感受。'],[8,11],'a map for a comforting story。'),
  T('某機構的現行系統仍有缺點，但每次出錯都能記錄、監察並改善。','哪項有限讓步最貼近本文？',['現行系統雖有缺點，可監測改良仍是優勢','現行系統有缺點，所以只用家長滿意度','現行系統可記錯誤，便無須持續改進','現行系統能改良，卻不須驗證每次變更'],['可測試、監察、改良是原文給現行系統的優勢。','滿意度不取代錯誤紀錄。','記錄錯誤應用來持續改善。','改良後仍應驗證效果。'],[10,11],'not perfect, but it offers...。'),
  T('學校要改善學生精神健康，已知長工時和缺少休息是問題。','哪項政策最符合本文？',['改善作息根源，也提供可評估的輔導支援','只提供輔導服務，不處理過長工時與休息','只調整作息時間，不追蹤學生是否改善','先發安心宣傳，延後評估壓力與支援效果'],['生活根源的預防與可檢查的輔導可並行。','只輔導漏掉過長工時。','調作息仍應追蹤成效。','安心宣傳不是有效支援的證據。'],[2,6,10],'healthier routines；counselling。'),
  T('某人服藥後血壓下降，便聲稱運動與睡眠已毫無必要。','文章如何回應？',['藥物可改善數值，仍須改善運動休息與飲食','藥物降低數值後，便可停止觀察生活習慣','改善運動飲食有用，因此藥物一概不需要','只看血壓數值，不查日常工作與睡眠狀況'],['原文承認藥物可改指標，卻不能代替生活改善。','數值變好不表示習慣問題已解。','生活改善不等於所有藥物都無用。','工作與睡眠可能仍是根源。'],[4,5],'pills may reduce...but no medicine...。'),
  T('有人說「傳統方法沒有經測試，所以它一定無效」。','哪項說法較精確？',['未經測試代表效果與安全仍不明，非已證無效','未經測試代表一定有效，無須任何證據','缺少測試時，先看口碑便可確定安全劑量','安全仍不明，但可直接放棄所有專業檢查'],['may be unclear 是不確定，不是有效或無效已確定。','未測試不能保證有效。','口碑不能確定安全劑量。','安全不明更需要檢查。'],[8,9],'effects, side effects and safe doses may be unclear。'),
  T('市政府批評一套老舊防洪辦法，卻未提出可行替代方案。','本文引言提供哪種寫法？',['反對舊辦法後，提出可測量的預防替代方案','反對舊辦法後，只需重述它帶來的問題','提出新方案，卻不查它有否防洪作用','保留舊辦法，只調整它的對外宣傳說法'],['提出反對後，應給可操作且有資料支持的方向。','重述問題未給替代。','新方案仍須證明減災作用。','只改宣傳未解決舊辦法不足。'],[1,2],'completely disagree；more sensible response。'),
  T('企業想用獎金掩蓋長期過勞，員工仍缺少合理工時。','這最像哪項論證？',['獎金可暫緩壓力，仍須改善工時與工作條件','獎金可暫緩壓力，所以工時毋須再調整','工時值得改善，因此所有補償都不必提供','只問獎金金額，不調查員工是否持續過勞'],['補償可有短期作用，但過勞根源仍要改善。','獎金不會自動縮短工時。','原文不否定局部補救作用。','金額不能說明過勞是否減少。'],[0,4,5,6],'long working hours；cannot substitute for。'),
  T('要一句話總結整篇立場與兩段理由。','哪項最完整？',['反對未驗證療法，主張改善根源及證據治療','支持傳統療法，但只要病人感到放心','主張改善生活習慣，卻不需評估治療','主張證據治療，但不問生活疾病的根源'],['全文比較生活根源、未驗證方法與可測試治療。','安心不是可靠成效證據。','生活改善仍可與有證據的治療並行。','只用治療漏掉生活方式根源。'],[1,2,3,5,7,8,9,10,13],'prevention and evidence-based healthcare。'),
];
export default {key:'opinion:57',meta:{topic:'生活方式疾病與傳統醫學',summary:'作者完全反對把生活方式疾病視為回歸傳統醫學的理由。首段說明久坐、不良飲食、壓力和缺少休息是根源，藥物不能代替預防；次段指出缺乏嚴謹測試可能帶來錯誤安全感與延誤診斷。結論主張改善生活方式並使用可檢查、可改良的現代醫療。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
