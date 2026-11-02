const simple=[
  'Many things change a society, but people often argue about who has real power.',
  'Some people say only governments can make important changes because they control rules, money, and public services.',
  'I do not agree with this idea at all.',
  'I think ordinary people can change society a lot because what they do each day changes what others think is normal, and speaking together can make powerful groups act.',
  'First, change in society often starts with what ordinary people do, not with what officials tell them to do.',
  'When people change how they live, talk, or spend their money, they slowly change what others see as normal.',
  'For example, if many people buy less plastic, waste less, and choose businesses that care about nature, companies feel pressure to change how they work.',
  'Over time, these small steps can move through homes, workplaces, and local groups until many people expect them.',
  'A law may write a rule down, but people’s habits decide whether it makes a difference in daily life.',
  'Second, one person can help change society by speaking against unfair rules and encouraging others to speak too.',
  'Someone who speaks against unfair treatment, people taking money dishonestly, or bad working conditions may seem to have little power at first, but their words can start a much bigger effort.',
  'For example, a student who reports bullying, a worker who tells others about unsafe work, or a parent who asks for better help at school may encourage other people to act.',
  'When enough people add their voices, governments and other groups often have to respond.',
  'In short, governments have official power, but they are not the only ones who can change society.',
  'Real improvement often starts with people; their actions, words, and courage can change what the public thinks and, in time, change institutions.',
];
const vocabulary=[
  [['Societies are shaped','Many things change a society','社會由多方塑造'],['many forces','Many things','許多力量'],['public debate','people often argue','公共討論'],['where real power lies','who has real power','真正權力在哪']],
  [['meaningful social change','important changes','有意義社會變革'],['can only come from the government','only governments can make','只能來自政府'],['controls laws, budgets and public institutions','control rules, money, and public services','掌握法律預算機構']],
  [['strongly disagree','do not agree','強烈不同意'],['this view','this idea','這種觀點']],
  [['major influence','change society a lot','重大影響'],['everyday choices','what they do each day','日常選擇'],['social norms','what others think is normal','社會規範'],['collective voices','speaking together','集體聲音'],['push institutions to change','make powerful groups act','推動機構改變']],
  [['social change','change in society','社會變革'],['ordinary behaviour','what ordinary people do','普通行為'],['official instructions','what officials tell them to do','官方指示']],
  [['individuals alter','people change','個人改變'],['the way they live, speak or spend money','how they live, talk, or spend their money','生活說話消費方式'],['gradually change','slowly change','逐漸改變'],['society accepts as normal','others see as normal','社會接受為正常']],
  [['reduce waste','waste less','減少浪費'],['avoid unnecessary plastic','buy less plastic','避免不必要塑膠'],['environmentally responsible businesses','businesses that care about nature','環保企業'],['pressured to improve their practices','feel pressure to change how they work','受壓改善做法']],
  [['Over time','Over time','隨時間'],['small actions','small steps','小行動'],['spread through families, workplaces and communities','move through homes, workplaces, and local groups','在家庭工作社區擴散'],['public expectation','many people expect them','公眾期望']],
  [['draw a line on paper','write a rule down','紙上劃界'],['people’s habits','people’s habits','人們習慣'],['whether that line matters in real life','whether it makes a difference in daily life','現實中是否重要']],
  [['Another reason','Second','另一原因'],['challenging unfair systems','speaking against unfair rules','挑戰不公制度'],['giving others the courage to do the same','encouraging others to speak too','鼓勵他人同樣行動']],
  [['discrimination','unfair treatment','歧視'],['corruption','people taking money dishonestly','貪污'],['poor working conditions','bad working conditions','惡劣工作環境'],['powerless at first','little power at first','起初無力'],['first spark in a much larger movement','start a much bigger effort','更大運動的火花']],
  [['For instance','For example','例如'],['reports bullying','reports bullying','舉報欺凌'],['exposes unsafe practices','tells others about unsafe work','揭露不安全做法'],['campaigns for better school support','asks for better help at school','爭取學校支援'],['inspire others to act','encourage other people to act','激勵他人行動']],
  [['Once enough people join that pressure','When enough people add their voices','足夠多人加入'],['governments and organisations','governments and other groups','政府和機構'],['have no choice but to respond','have to respond','不得不回應']],
  [['In conclusion','In short','總結'],['formal authority','official power','正式權力'],['not the only force capable of changing society','not the only ones who can change society','並非唯一改變力量']],
  [['Real progress','Real improvement','真正進步'],['individuals','people','個人'],['choices, voices and courage','actions, words, and courage','選擇聲音勇氣'],['move public opinion','change what the public thinks','推動公眾意見'],['eventually reshape institutions','in time, change institutions','最終重塑制度']],
];
const chunkOverrides=[
  ['Societies are shaped by many forces,','but public debate often focuses on where real power lies.'],
  ['Some argue that meaningful social change can only come from the government','because it controls laws, budgets and public institutions.'],
  ['I strongly','disagree with this view.'],
  ['In my opinion, individuals can have a major influence on society','because their everyday choices shape social norms','and their collective voices can push institutions to change.'],
  ['The first reason is that social change often begins with ordinary behaviour,','not official instructions.'],
  ['When individuals alter the way they live, speak or spend money,','they gradually change what society accepts as normal.'],
  ['For example, if many people choose to reduce waste, avoid unnecessary plastic and support environmentally responsible businesses,','companies are pressured to improve their practices.'],
  ['Over time, these small actions can spread through families, workplaces and communities','until they become part of public expectation.'],
  ['A law may draw a line on paper,','but people’s habits decide whether that line matters in real life.'],
  ['Another reason is that individuals can influence society','by challenging unfair systems and giving others the courage to do the same.'],
  ['A single person who speaks out against discrimination, corruption or poor working conditions may seem powerless at first,','but their voice can become the first spark in a much larger movement.'],
  ['For instance, a student who reports bullying, a worker who exposes unsafe practices,','or a parent who campaigns for better school support may inspire others to act.'],
  ['Once enough people join that pressure,','governments and organisations often have no choice but to respond.'],
  ['In conclusion, although governments have formal authority,','they are not the only force capable of changing society.'],
  ['Real progress often starts with individuals,','whose choices, voices and courage can move public opinion and eventually reshape institutions.'],
];
const simpleChunkOverrides=[
  ['Many things change a society,','but people often argue about who has real power.'],
  ['Some people say only governments can make important changes','because they control rules, money, and public services.'],
  ['I do not agree','with this idea at all.'],
  ['I think ordinary people can change society a lot','because what they do each day changes what others think is normal,','and speaking together can make powerful groups act.'],
  ['First, change in society often starts with what ordinary people do,','not with what officials tell them to do.'],
  ['When people change how they live, talk, or spend their money,','they slowly change what others see as normal.'],
  ['For example, if many people buy less plastic, waste less, and choose businesses that care about nature,','companies feel pressure to change how they work.'],
  ['Over time, these small steps can move through homes, workplaces, and local groups','until many people expect them.'],
  ['A law may write a rule down,','but people’s habits decide whether it makes a difference in daily life.'],
  ['Second, one person can help change society','by speaking against unfair rules and encouraging others to speak too.'],
  ['Someone who speaks against unfair treatment, people taking money dishonestly, or bad working conditions may seem to have little power at first,','but their words can start a much bigger effort.'],
  ['For example, a student who reports bullying, a worker who tells others about unsafe work,','or a parent who asks for better help at school may encourage other people to act.'],
  ['When enough people add their voices,','governments and other groups often have to respond.'],
  ['In short, governments have official power,','but they are not the only ones who can change society.'],
  ['Real improvement often starts with people;','their actions, words, and courage can change what the public thinks and, in time, change institutions.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('A city is shaped by many groups, but debate often asks which group has the most power.','but 對照多方影響與人們關注的單一問題。','開篇只建立爭論，尚未表態支持哪一方。',[1,3,13],F('[整體] is shaped by many forces, but debate focuses on [權力所在]','指出複雜背景，再聚焦題目真正爭點。','引言需要由多因素背景收束到一個核心爭議時。',[['Societies','slot','整體'],[' are shaped by many forces, but public debate often focuses on ','link','由多方塑造，但爭論集中在'],['where real power lies.','slot','權力所在']])),
  S('Some argue that school improvement can only come from leaders because they control staff and budgets.','Some argue that 轉述；can only 限定對方主張的絕對程度；because 給其理由。','這是對方意見，不是作者結論。',[0,2,8],F('Some argue that [成果] can only come from [某方] because [其掌握的工具]','準確呈現只認一方有能力的強主張及理由。','要公平轉述「只有某方能帶來改變」的觀點時。',[['Some argue that ','link','轉述主張'],['meaningful social change','slot','成果'],[' can only come from ','link','只會來自'],['the government','slot','某方'],[' because ','link','因為'],['it controls laws, budgets and public institutions.','slot','其掌握的工具']])),
  S('I strongly disagree with this claim.','strongly disagree 直接表態；this view 回指前句的排他性主張。','短句立場應由後句理由支撐，不應單獨當成論證。',[1,3,13],F('I strongly disagree with [前述主張]','明確拒絕前句的絕對化看法。','轉述一項強主張後，需要先給讀者清楚的立場時。',[['I strongly disagree with ','link','明確表態'],['this view.','slot','前述主張']])),
  S('Individuals can improve schools because daily habits change expectations and shared voices can push leaders to act.','because 後兩個平行因果：日常選擇與集體發聲，預告兩段正文。','不是說每個人單獨做一件事便必然改變制度。',[2,4,9],F('[個人] can influence [整體] because [日常行為改變規範] and [集體聲音推動機構]','把立場具體化成可分開展開的兩條理由。','表態後，要以個人行為與集體行動兩種不同機制預告正文時。',[['In my opinion, ','link','提出作者判斷'],['individuals','slot','個人'],[' can have a major influence on ','link','能深刻影響'],['society','slot','整體'],[' because ','link','因為'],['their everyday choices shape social norms','slot','日常行為改變規範'],[' and ','link','以及'],['their collective voices can push institutions to change.','slot','集體聲音推動機構']])),
  S('The first reason is that safer streets often begin with everyday care, not official posters.','not... 對比自下而上的行為與自上而下的指令。','這句不是說官方政策完全沒有作用。',[1,3,5],F('The first reason is that [變化] often begins with [日常行為], not [正式指示]','展開首項理由：改變可由普通人的重複行動開始。','要反駁只有正式指令能帶來改變時，指出另一種起點。',[['The first reason is that ','link','引入首項理由'],['social change','slot','變化'],[' often begins with ','link','常始於'],['ordinary behaviour','slot','日常行為'],[', not ','link','而非'],['official instructions.','slot','正式指示']])),
  S('When residents change how they travel or shop, they gradually change what local businesses consider normal.','When 設行動條件；gradually change 描述累積規範而非一次即成。','這是社會規範逐漸改變，不是保證任何個人選擇立即成功。',[4,6,7],F('When [個人改變日常選擇], they gradually change [群體視為正常的事]','解釋個人行動如何累積為社會期待。','要說明重複的小選擇如何逐步改變群體規範時。',[['When ','link','設定行動條件'],['individuals alter the way they live, speak or spend money','slot','個人改變日常選擇'],[', they gradually change ','link','便逐漸改變'],['what society accepts as normal.','slot','群體視為正常的事']])),
  S('For example, if many pupils stop wasting paper and ask for reusable materials, schools may change their buying habits.','if many... 設多人共同選擇；結果落在機構做法，補足行為至制度的機制。','例子強調規模及壓力，不是說一人立刻迫使所有企業改變。',[5,7,11],F('For example, if many people [一致改變幾種行為], [機構] is pressured to [改進做法]','以可見購買行為展示個人如何影響機構。','已說小選擇可改變規範，要以多人共同選擇的例子說明機構回應時。',[['For example, if many people choose to ','link','引出多人行動'],['reduce waste, avoid unnecessary plastic and support environmentally responsible businesses','slot','一致改變幾種行為'],[', ','link','則'],['companies','slot','機構'],[' are pressured to ','link','受壓'],['improve their practices.','slot','改進做法']])),
  S('Over time, simple practices can spread through homes and workplaces until everyone begins to expect them.','Over time 和 until 表擴散所需時間及達到的群體期待。','can 不表示所有行為必然擴散。',[5,6,8],F('Over time, [小行動] can spread through [多種群體] until [公共期待]','將個別行動連到跨場合的規範形成。','要描述一項做法如何經不同圈子擴散並逐漸成為共同期待時。',[['Over time, ','link','標示時間推移'],['these small actions','slot','小行動'],[' can spread through ','link','可擴散至'],['families, workplaces and communities','slot','多種群體'],[' until ','link','直到'],['they become part of public expectation.','slot','公共期待']])),
  S('A school rule may exist on paper, but students’ habits decide whether it matters each day.','may...but... 對比正式規則和日常實踐；whether... 指成效取決於後者。','不是否定法律有用，而是說落實還需人的行為。',[1,5,7],F('[正式規則] may exist on paper, but [人們的習慣] decide whether [實際效果]','以形象對照概括正式制度與真實行為的關係。','已論日常行為時，要指出紙上規則能否奏效仍取決於實踐時。',[['A law','slot','正式規則'],[' may draw a line on paper, but ','link','可在紙上劃界，但'],['people’s habits','slot','人們的習慣'],[' decide whether ','link','決定'],['that line matters in real life.','slot','實際效果']])),
  S('Another reason is that one person can improve a workplace by naming unfair rules and encouraging colleagues to speak.','Another reason 開第二機制；by...and... 明列行動與擴散。','與首段改變日常習慣不同，此處談公開挑戰不公。',[3,8,10],F('Another reason is that [個人] can influence [整體] by [挑戰不公] and [鼓勵他人]','由改變習慣轉向公開發聲的另一途徑。','完成一種日常影響機制後，要提出挑戰制度並帶動他人的機制時。',[['Another reason is that ','link','引入另一理由'],['individuals','slot','個人'],[' can influence ','link','能影響'],['society','slot','整體'],[' by ','link','透過'],['challenging unfair systems','slot','挑戰不公'],[' and ','link','並'],['giving others the courage to do the same.','slot','鼓勵他人']])),
  S('One worker who reports unsafe equipment may seem powerless at first, but their words can start a larger campaign.','may seem...but... 對比起初個人弱勢與行動擴大潛力；spark 比喻起點。','can 只是可能，不等於每次舉報都形成運動。',[6,9,11],F('A single person who [公開反對問題] may seem [起初弱小], but their voice can become [更大行動起點]','說明一個人起初影響不大，仍可能啟動集體改變。','要反駁「一人太弱所以無法啟動改變」的推論時。',[['A single person who ','link','提出一人行動'],['speaks out against discrimination, corruption or poor working conditions','slot','公開反對問題'],[' may seem ','link','可能看似'],['powerless at first','slot','起初弱小'],[', but their voice can become ','link','但聲音可成為'],['the first spark in a much larger movement.','slot','更大行動起點']])),
  S('For instance, a pupil who reports unfair rules, a nurse who raises safety concerns, or a resident who asks for better transport may inspire others.','三個不同身份的平行例子，顯示發聲不限某一職位。','例子沒有聲稱每個人獨自即刻令制度改變。',[9,10,12],F('For instance, [人物甲], [人物乙], or [人物丙] may inspire others to act','以不同角色展示個人如何作出第一步並帶動他人。','主張個人可發聲後，要列出不同場景的可觀察行動時。',[['For instance, ','link','引出多例'],['a student who reports bullying','slot','人物甲'],[', ','link','再列'],['a worker who exposes unsafe practices','slot','人物乙'],[', or ','link','以及'],['a parent who campaigns for better school support','slot','人物丙'],[' may inspire others to act.','link','可能帶動他人']])),
  S('Once enough residents join the request, local leaders often have to respond.','Once... 設集體規模達到的條件；have no choice but to 指制度回應。','不是說一人開口後機構必然立即改變。',[7,10,11],F('Once enough people [加入行動], [機構] often have no choice but to respond','由個人示範推進到集體壓力及機構回應。','要說明小行動累積到足夠規模後，機構為何可能回應時。',[['Once enough people ','link','達到多人條件'],['join that pressure','slot','加入行動'],[', ','link','則'],['governments and organisations','slot','機構'],[' often have no choice but to respond.','link','往往須回應']])),
  S('In conclusion, although managers have formal authority, they are not the only people who can improve a workplace.','although 先承認正式權力；not the only... 拒絕排他性主張。','作者沒有否認政府的正式權力。',[1,2,12],F('In conclusion, although [一方] has formal authority, it is not the only force capable of [改變結果]','結尾保留對方合理部分，仍拒絕「只有它」的絕對判斷。','結論要承認某方有正式權力，同時指出它不是唯一影響來源時。',[['In conclusion, although ','link','總結並讓步'],['governments','slot','一方'],[' have formal authority, they are not the only force capable of ','link','有正式權力但非唯一可'],['changing society.','slot','改變結果']])),
  S('Progress often starts with residents, whose choices and shared voices can influence councils over time.','whose 補充個人行動的具體來源；eventually 保留漸進性。','這句收束首段習慣與次段發聲兩條途徑。',[3,8,13],F('[改變] often starts with [個人], whose [行動與勇氣] can move [輿論] and eventually reshape [制度]','最後把兩段機制合併為由個人到制度的長鏈條。','完成日常行為與集體發聲兩條理由後，要在結尾串起個人、輿論和制度時。',[['Real progress','slot','改變'],[' often starts with ','link','常始於'],['individuals','slot','個人'],[', whose ','link','其'],['choices, voices and courage','slot','行動與勇氣'],[' can move ','link','可推動'],['public opinion','slot','輿論'],[' and eventually reshape ','link','最後重塑'],['institutions.','slot','制度']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否認為只有政府能帶來重要社會變革？',['不認為；個人日常選擇可改變規範，集體發聲可推動機構','認為；個人完全沒有影響','沒有立場，只描述法律','認為只有企業能改變社會'],'strongly disagree；everyday choices；collective voices。'),
  {type:'multi',prompt:'選出兩條不同的個人影響途徑',detail:'選兩項，再按「確認」。',options:['日常選擇擴散，改變社會認為正常的做法','一人發聲鼓勵他人，形成集體壓力使機構回應','個人可一夜之間取消所有法律','政府沒有任何正式權力'],correct:[0,1],why:'第一段談習慣規範；第二段談發聲與集體行動。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 個人也能推動改變','公平呈現政府掌握法律預算的主張，反對「只有政府」。'],
  ['主體段一 · 小行動改變規範','消費及生活選擇令企業改善；習慣使規則在現實中有效。'],
  ['主體段二 · 發聲累積成壓力','不同人挑戰不公，鼓勵他人，機構最終可能回應。'],
  ['結論 · 正式權力不是唯一力量','個人行動、聲音及勇氣可推動輿論和制度。'],
],'政府正式權力 → 個人日常行為 → 集體發聲 → 機構回應。')];
const evidence=[
  Q('作者承認政府掌握哪些正式工具？',['法律、預算和公共機構','只掌握家庭習慣','只掌握個人購物決定','完全沒有正式權力'],'轉述對方主張時仍要準確承認政府能力。'),
  Q('日常選擇如何影響社會規範？',['生活、說話與消費方式逐漸改變人們視為正常的事','一次選擇必然立即改變全部法律','只有官方指示能改變任何習慣','所有人都要作完全相同的決定'],'When...gradually change 指累積過程。'),
  Q('減廢例子如何連到企業？',['多人支持較負責任的企業，使公司感到改善做法的壓力','只有政府法令，消費者完全無關','一個人少用一個袋子便必然改變全球企業','減廢只會令公司更多浪費'],'if many people...companies are pressured...。'),
  Q('「法律在紙上劃界」比喻指出甚麼？',['正式規則是否在現實發揮作用，仍與人們習慣有關','法律永遠沒有任何用處','紙張比人更有力量','只要寫下法律，所有人必然照做'],'may...but... 區分制度和實踐。'),
  Q('學生、工人與家長的例子有何共同點？',['一人先指出問題，可能鼓勵其他人一同採取行動','三人都掌握政府預算','他們都已保證成功','他們只在私人生活中抱怨，沒有行動'],'reports, exposes, campaigns 都是可見的第一步。'),
  Q('政府和機構何時較可能回應？',['足夠多人加入壓力之後','只要一個人心裏不滿','永遠無須回應','只有所有人持完全相同意見時'],'Once enough people join that pressure。'),
];
const logic=[
  sequence('第一主體段：個人小行動如何改變規範？',[
    ['主張','社會改變可始於普通行為。'],
    ['機制','生活、說話與消費選擇改變甚麼被視為正常。'],
    ['減廢例子','多人改變購買選擇，企業受壓改善。'],
    ['擴散','行動跨家庭、工作和社區，成為公眾期待。'],
    ['段落結論','正式規則要靠人們習慣才在現實有作用。'],
  ],'日常選擇 → 多人跟進 → 企業回應 → 新規範。'),
  sequence('第二主體段：一人發聲如何變成制度回應？',[
    ['主張','個人可挑戰不公並鼓勵他人。'],
    ['第一火花','起初無力的一個聲音，可能啟動較大運動。'],
    ['多場景例子','學生舉報欺凌、工人揭露危險、家長爭取支援。'],
    ['集體規模','足夠多人加入，政府及機構往往須回應。'],
    ['結論連結','個人選擇與勇氣可推動輿論，最後改變制度。'],
  ],'個人指出問題 → 他人加入 → 集體壓力 → 機構回應。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('很多居民改用可重用水樽，附近商店於是減少即棄塑膠。','哪條論證最能解釋？',['多人日常選擇累積，可改變企業認為正常的做法','一名居民能立即取消所有塑膠法律','商店只可能聽政府，不會看顧客選擇','個人習慣必然與市場完全無關'],['與減廢例子的消費者至企業機制一致。','個人作用不等於一人立刻改法。','原文說企業受壓。','選擇可改變規範。'],[5,6,7],'everyday choices shape social norms。'),
  T('學校有反欺凌守則，但學生都不敢報告，教師亦沒有跟進。','哪個比喻最合適？',['規則可寫在紙上，實際效果仍取決於人們是否按它行動','只要守則印得漂亮，欺凌必然消失','正式規則完全沒有價值','只有校長一人能決定所有人的行為'],['法律紙上劃界與習慣落實的關係可跨題使用。','忽略實踐。','原文沒有否定規則。','個人行動亦重要。'],[5,8,11],'law...line on paper；habits...real life。'),
  T('一名工人舉報危險設備，初時無人理會；其後更多同事加入，公司修正做法。','哪條鏈條與文章一致？',['個人先發聲，鼓勵他人，再形成足夠壓力使機構回應','一人舉報必然立即改變全球制度','任何集體行動都不可能影響公司','只有政府可指出危險'],['發聲至集體壓力的完整鏈條。','文章保留漸進性。','例子顯示相反。','工人可行動。'],[9,10,11,12],'first spark；Once enough people join...respond。'),
  T('某人說：「政府有法律和預算，所以普通人完全不能改變社會。」','哪項回應最忠於作者？',['承認政府有正式工具，但個人習慣與集體聲音也能推動改變','否認政府有任何權力','只要一個人想法不同，所有制度當天必變','個人只有在政府任職才可有影響'],['作者反對 only，而非否認政府權力。','原文承認 formal authority。','沒有立即保證。','例子皆非政府職員。'],[1,2,3,13],'formal authority...not the only force。'),
  T('一名家長向學校提出支援不足，其他家長跟進後，學校開會改變安排。','哪個部分最支持這個過程？',['家長可先爭取支援，鼓勵他人，再令機構回應','家長只能等候官方指示','學生和工人都不可參與','只要發聲便必然馬上成功'],['家長例子及 Once enough people... 配合。','文章強調個人發聲。','多身份都可行動。','需累積壓力。'],[9,11,12],'parent...campaigns；governments and organisations...respond。'),
  T('某市推行垃圾分類規則，但居民日常仍把所有垃圾混在一起。','文章會指出甚麼？',['紙上規則未必足夠，居民習慣會影響政策能否真正發揮作用','規則推出後行為必然立即改變','居民選擇完全無關','所有法律都應取消'],['制度和日常實踐需配合。','忽略實踐。','與文章相反。','原文未否定法律。'],[5,7,8],'habits decide whether that line matters in real life。'),
  T('社區成員開始在活動中使用更多無障礙安排，逐漸成為大家期待的標準。','最接近哪種推理？',['小行動跨群體擴散，最後形成新的公共期待','只有一項法令才能改變任何期待','期待改變必然一日完成','個人行動不可能傳給其他人'],['Over time...spread...public expectation。','作者另指出日常行動作用。','Over time 指漸進。','與擴散相反。'],[4,5,7],'spread through families, workplaces and communities。'),
  T('某公司領導人說：「員工只要按指示做，便不用指出不公平規則。」','哪項跨題論證可回應？',['個人指出不公可成為改變起點，並鼓勵其他人同樣行動','所有指示都必須被違反','一人指出問題便保證任何改革成功','不公平規則永遠不能被改善'],['第二段論挑戰不公平及帶動他人。','不是鼓勵違反所有規則。','can 非保證。','原文說可推動。'],[9,10,11,12],'challenging unfair systems；first spark。'),
  T('某學生只在私下抱怨欺凌，另一學生正式報告並尋求同學支持。','哪個行動更能啟動本文的第二種機制？',['正式指出問題並鼓勵其他人加入的行動','只在心裏不滿就足夠','兩種行動必然帶來完全一樣的結果','學生完全不能影響學校'],['reports bullying 是可見行動，可能帶動他人。','缺少發聲。','行動差異重要。','原文正有學生例子。'],[9,11,12],'student who reports bullying...inspire others。'),
  T('兩種社會變化：人們逐漸改變消費習慣；居民聯合要求機構修正不公平做法。','本文如何區分它們？',['前者透過日常選擇改變規範；後者透過集體發聲推動制度','兩者都只能由政府命令開始','前者必然即時改法，後者與制度無關','兩者完全沒有不同機制'],['兩段正文提供兩條互補路徑。','文章反對 only。','把兩者都誤寫。','作用途徑不同。'],[3,4,5,6,7,9,10,12],'everyday choices；collective voices。'),
  T('某人認為「一個人的行動太小」，所以永遠不值得開始。','哪項回答最準確？',['一個行動未必立即成功，但可擴散或成為更大集體努力的起點','每次個人行動必然瞬間成功','小行動永遠不會被其他人看見','只有掌握公共預算者可開始'],['文章保留 can 與漸進過程。','過度保證。','原文說可擴散。','非政府人員可行動。'],[5,7,10,12],'small actions can spread；first spark。'),
  T('要用一句話概括全文。','哪項最準確？',['作者反對只有政府能改變社會：個人選擇可塑造規範，集體發聲可推動機構回應','作者否認政府掌握法律和預算','作者認為一個人每次都能立即改變法律','作者只談環保消費，不談不公制度'],['包含政府讓步與兩條個人影響途徑。','作者公平承認。','沒有保證。','第二段談發聲。'],[1,2,3,4,5,7,9,10,12,13,14],'individuals...choices, voices and courage。'),
];
export default {
  key:'opinion:55',
  meta:{topic:'政府與個人在社會變革中的影響',summary:'作者強烈反對只有政府才能帶來重要社會變化。政府有法律和預算等正式工具，但個人的日常選擇可逐步改變社會規範，集體發聲亦可推動機構回應。文章以減廢與舉報不公作兩條不同機制，不把任何一人行動寫成必然立即成功。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
