const simple=[
  'Medical care is one of the most important services for everyone, so it is easy to see why people feel strongly about who pays for it.',
  'Some people say treatment should always cost money because each person must look after their own health.',
  'I strongly disagree because people do not always cause their own illness, and free care helps both each patient and the wider community.',
  'First, many health problems happen for reasons people cannot control.',
  'Food, exercise, and smoking can affect health, but it is too simple to say that every sick person caused their own illness.',
  'Some children are born with conditions passed down in families, some workers get sick in unsafe workplaces, and older people often need care because their bodies weaken with age.',
  'For example, a worker with little money who gets cancer should still receive care even if treatment costs more than they can pay.',
  'If only wealthy people can get care, illness becomes both a health problem and an unfair money penalty for people who already have fewer resources.',
  'Second, free medical care helps the whole community as well as the people who receive it.',
  'When people can see a doctor early, problems are more likely to be found before they become serious.',
  'This can mean less work for hospitals later and can stop infections from passing to many people.',
  'For example, if families with little money stay away from doctors because visits cost too much, small infections may get worse or pass to people at school, work, and nearby.',
  'For this reason, free care is more than a kind act; it is money spent wisely to keep the public safe and society steady.',
  'In short, I strongly disagree that medical care should always cost money.',
  'People should be helped to make healthy choices, but we should still care for them when they become sick.',
  'A fair medical system accepts that our choices affect health, but health is never only our own responsibility.',
];
const vocabulary=[
  [['Healthcare','Medical care','醫療保健'],['essential public services','most important services for everyone','最基本公共服務'],['understandably sensitive','easy to see why people feel strongly','自然敏感'],['who should pay for it','who pays for it','誰應支付']],
  [['argue','say','主張'],['medical treatment','treatment','醫療服務'],['should never be free','should always cost money','永不免費'],['individuals are responsible for their own health','each person must look after their own health','個人健康責任']],
  [['completely disagree','strongly disagree','完全不同意'],['not always caused by personal choices','do not always cause their own illness','不總由個人選擇造成'],['free healthcare','free care','免費醫療'],['society as a whole','wider community','整個社會']],
  [['first reason','First','第一個原因'],['beyond a person’s control','for reasons people cannot control','非個人能控制']],
  [['lifestyle choices','Food, exercise, and smoking','生活方式選擇'],['far too simplistic','too simple','過於簡化'],['every patient','every sick person','每位病人'],['personally to blame','caused their own illness','個人負責']],
  [['genetic disorders','conditions passed down in families','遺傳疾病'],['unsafe environments','unsafe workplaces','不安全環境'],['elderly people','older people','長者'],['become weaker with age','weaken with age','隨年齡變弱']],
  [['low-income worker','worker with little money','低收入工人'],['develops cancer','gets cancer','患癌'],['should not be denied medical care','should still receive care','不應被拒醫療'],['cannot afford expensive treatment','treatment costs more than they can pay','負擔不起昂貴治療']],
  [['depends entirely on personal wealth','only wealthy people can get care','完全取決個人財富'],['not only a medical problem but also a financial punishment','both a health problem and an unfair money penalty','不只醫療亦成經濟懲罰'],['the vulnerable','people who already have fewer resources','弱勢人士']],
  [['Another important point','Second','另一重要觀點'],['benefits society','helps the whole community','惠及社會'],['not just individual patients','as well as the people who receive it','不只個別病人']],
  [['access treatment early','see a doctor early','及早接受治療'],['more likely to be diagnosed','more likely to be found','更可能被診斷'],['before they become severe','before they become serious','惡化之前']],
  [['reduces pressure on hospitals','less work for hospitals','減輕醫院壓力'],['in the long term','later','長遠'],['contagious diseases','infections','傳染病'],['spreading widely','passing to many people','廣泛傳播']],
  [['poor families','families with little money','貧困家庭'],['avoid seeing a doctor','stay away from doctors','避免求醫'],['high fees','visits cost too much','高昂費用'],['minor infections','small infections','輕微感染'],['worsen or spread to others','get worse or pass to people','惡化或傳染他人']],
  [['In this sense','For this reason','從此意義上'],['not simply an act of kindness','more than a kind act','不只善意'],['practical investment','money spent wisely','實際投資'],['public safety','keep the public safe','公共安全'],['social stability','society steady','社會穩定']],
  [['In conclusion','In short','總結'],['strongly disagree','strongly disagree','強烈不同意'],['should never be free','should always cost money','永不免費']],
  [['individuals','People','個人'],['be encouraged to make healthy choices','be helped to make healthy choices','鼓勵健康選擇'],['society should not abandon people','we should still care for them','社會不應拋棄病人'],['fall ill','become sick','生病']],
  [['fair healthcare system','fair medical system','公平醫療制度'],['recognises','accepts','承認'],['partly personal','our choices affect health','部分是個人責任'],['never entirely personal','never only our own responsibility','絕非完全個人責任']],
];
const chunkOverrides=[
  ['Healthcare is one of the most essential public services in any society,','and debates about who should pay for it are understandably sensitive.'],
  ['Some people argue that medical treatment should never be free','because individuals are responsible for their own health.'],
  ['I completely disagree with this view,','as illness is not always caused by personal choices, and free healthcare protects both individuals and society as a whole.'],
  ['The first reason is that','many health problems are beyond a person’s control.'],
  ['Although lifestyle choices such as diet, exercise, and smoking can affect health,','it is far too simplistic to suggest that every patient is personally to blame for their condition.'],
  ['Children may be born with genetic disorders, workers may develop illnesses because of unsafe environments,','and elderly people often require treatment simply because their bodies become weaker with age.'],
  ['For example, a low-income worker who develops cancer should not be denied medical care','merely because they cannot afford expensive treatment.'],
  ['If healthcare depends entirely on personal wealth,','disease becomes not only a medical problem but also a financial punishment for the vulnerable.'],
  ['Another important point is that','free healthcare benefits society, not just individual patients.'],
  ['When people can access treatment early,','illnesses are more likely to be diagnosed before they become severe.'],
  ['This reduces pressure on hospitals in the long term','and prevents contagious diseases from spreading widely.'],
  ['For instance, if poor families avoid seeing a doctor because of high fees,','minor infections may worsen or spread to others in schools, workplaces, and communities.'],
  ['In this sense, free healthcare is not simply an act of kindness;','it is a practical investment in public safety and social stability.'],
  ['In conclusion, I strongly disagree','that healthcare should never be free.'],
  ['While individuals should certainly be encouraged to make healthy choices,','society should not abandon people when they fall ill.'],
  ['A fair healthcare system recognises that health is partly personal,','but never entirely personal.'],
];
const simpleChunkOverrides=[
  ['Medical care is one of the most important services for everyone,','so it is easy to see why people feel strongly about who pays for it.'],
  ['Some people say treatment should always cost money','because each person must look after their own health.'],
  ['I strongly disagree because people do not always cause their own illness,','and free care helps both each patient and the wider community.'],
  ['First, many health problems happen','for reasons people cannot control.'],
  ['Food, exercise, and smoking can affect health,','but it is too simple to say that every sick person caused their own illness.'],
  ['Some children are born with conditions passed down in families, some workers get sick in unsafe workplaces,','and older people often need care because their bodies weaken with age.'],
  ['For example, a worker with little money who gets cancer should still receive care','even if treatment costs more than they can pay.'],
  ['If only wealthy people can get care,','illness becomes both a health problem and an unfair money penalty for people who already have fewer resources.'],
  ['Second, free medical care helps the whole community','as well as the people who receive it.'],
  ['When people can see a doctor early,','problems are more likely to be found before they become serious.'],
  ['This can mean less work for hospitals later','and can stop infections from passing to many people.'],
  ['For example, if families with little money stay away from doctors because visits cost too much,','small infections may get worse or pass to people at school, work, and nearby.'],
  ['For this reason, free care is more than a kind act;','it is money spent wisely to keep the public safe and society steady.'],
  ['In short, I strongly disagree','that medical care should always cost money.'],
  ['People should be helped to make healthy choices,','but we should still care for them when they become sick.'],
  ['A fair medical system accepts that our choices affect health,','but health is never only our own responsibility.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Clean water is an essential public service, and debates about who should pay for it are understandably sensitive.','and 將服務的重要性連到分攤成本的爭議，建立題目背景。','這是問題背景，未表態應否免費。',[1,2,8],F('[服務] is an essential public service, and debates about [付款問題] are sensitive','先指出服務的重要性，再交代政策爭議為何重要。','引言需要交代一項服務的公共價值及其費用爭議時。',[['Healthcare is one of the most essential public services in any society','slot','服務的公共價值'],[', and debates about ','link','引出爭議'],['who should pay for it','slot','付款問題'],[' are understandably sensitive.','link','爭議敏感']])),
  S('Some people argue that school meals should not be free because families are responsible for feeding children.','because 呈現對方主張的理由，而不暗示作者同意。','引述對方看法與作者最終立場不同。',[0,3,13],F('Some people argue that [服務不應免費] because [個人責任理由]','公平、準確地轉述題目給出的主張。','題目已提供一方觀點，需要先交代其政策主張及理由時。',[['Some people argue that ','link','引述一方主張'],['medical treatment should never be free','slot','服務不應免費'],[' because ','link','其理由是'],['individuals are responsible for their own health.','slot','個人責任理由']])),
  S('I completely disagree, as learning is not always decided by effort, and free books benefit both pupils and schools.','as 後給出兩條相互不同的理由：個人控制有限，以及公共受益。','作者不是說個人選擇完全不影響健康。',[1,4,8],F('I completely disagree, as [並非全由個人造成], and [公共措施惠及個人及社會]','用一句立場句預告兩段不同的主體理由。','引言要清楚回答同意與否，並先標出兩條獨立理由時。',[['I completely disagree with this view, as ','link','立場及理由'],['illness is not always caused by personal choices','slot','個人控制有限'],[', and ','link','加上第二理由'],['free healthcare protects both individuals and society as a whole.','slot','個人與社會受益']])),
  S('The first reason is that many pupils face obstacles beyond their control.','The first reason is that 直接標示第一條論證。','這是主張，後面仍需例子證明。',[2,4,8],F('The first reason is that [問題] are beyond [個人] control','在主體段開首提出明確、可論證的理由。','開始第一段主體時，需要先說出責任歸屬的核心判斷。',[['The first reason is that ','link','提出第一理由'],['many health problems','slot','問題'],[' are beyond ','link','超出'],['a person’s','slot','個人'],[' control.','link','控制']])),
  S('Although study habits affect grades, it is too simple to blame every struggling pupil for poor results.','Although 先承認部分個人影響；主句拒絕過度概括。','作者不是否認飲食、運動和吸煙會影響健康。',[3,5,14],F('Although [個人選擇] can affect [結果], it is too simplistic to blame every [受影響者]','承認有限的個人責任，同時駁回人人都應受責怪的極端說法。','反駁一個過度概括的責任判斷時，先承認其中合理的有限部分。',[['Although ','link','先讓步'],['lifestyle choices such as diet, exercise, and smoking','slot','個人選擇'],[' can affect health, it is far too simplistic to suggest that ','link','但不能因此推斷'],['every patient','slot','每位受影響者'],[' is personally to blame for their condition.','link','皆應受責怪']])),
  S('Some pupils have learning disabilities, some lack a quiet home, and older learners may need different support.','三類群體並列，使「不全由個人控制」有實際支撐。','例子不表示每個人都完全沒有任何選擇。',[3,4,6],F('[群體一] may face [非自選因素], [群體二] may face [外部環境], and [群體三] may need [另一支援]','用三種不同成因說明不能把所有問題歸咎個人。','提出「非個人完全控制」後，需要用不同人群及成因檢驗此主張時。',[['Children may be born with genetic disorders','slot','天生因素'],[', ','link','並列'],['workers may develop illnesses because of unsafe environments','slot','環境因素'],[', and ','link','再加'],['elderly people often require treatment simply because their bodies become weaker with age.','slot','年齡因素']])),
  S('For example, a low-income pupil should not lose school transport merely because their family cannot pay.','For example 給具體弱勢人物；merely because 指出單憑付款能力拒絕服務不公。','作者沒有斷言所有醫療服務都沒有任何成本。',[5,7,11],F('For example, [資源較少的人] should not be denied [必要服務] merely because [付不起]','把公平原則落到一個可想像的個案。','抽象地談機會公平後，要展示費用門檻如何傷害某個具體人物時。',[['For example, ','link','提出個案'],['a low-income worker who develops cancer','slot','資源較少的人'],[' should not be denied ','link','不應被拒'],['medical care','slot','必要服務'],[' merely because ','link','僅因'],['they cannot afford expensive treatment.','slot','付不起']])),
  S('If safe transport depends entirely on wealth, injury becomes not only a safety problem but also a financial penalty for poorer residents.','If 設極端付款條件；not only...but also... 指出原有風險外再疊加經濟懲罰。','這是對「完全取決個人財富」的批評。',[6,9,12],F('If [必要服務] depends entirely on [財富], [問題] becomes not only [原有風險] but also [額外懲罰]','顯示按財富分配必要服務會放大弱勢者的負擔。','要指出一道費用門檻如何把原本問題變成雙重傷害時。',[['If healthcare depends entirely on personal wealth','slot','按財富分配服務'],[', ','link','則'],['disease','slot','原有問題'],[' becomes not only ','link','不只成為'],['a medical problem','slot','原有風險'],[' but also ','link','還會成為'],['a financial punishment for the vulnerable.','slot','額外懲罰']])),
  S('Another important point is that free school meals benefit the whole school, not just individual pupils.','not just... 擴大受益範圍，開啟與第一段不同的公共效益理由。','不是重複「病人有權得到治療」這一點。',[3,9,12],F('Another important point is that [公共措施] benefits [社會], not just [直接使用者]','由個體公平轉到更廣泛的公共效益。','第二段需要另提出外溢效益，避免只重複直接受益者時。',[['Another important point is that ','link','引出另一論點'],['free healthcare','slot','公共措施'],[' benefits ','link','惠及'],['society','slot','社會'],[', not just ','link','不只'],['individual patients.','slot','直接使用者']])),
  S('When students can ask for help early, problems are more likely to be solved before they become severe.','When 設及早取得服務的條件；more likely 保留機率；before 指避免惡化。','原文不保證每種疾病都必然及早找到。',[8,10,11],F('When [人們] can access [服務] early, [問題] are more likely to be found before [惡化]','解釋取得服務如何產生及早處理的機制。','提出公共服務有整體好處後，要說明及早接觸如何避免後期惡化時。',[['When ','link','設及早取得'],['people','slot','人們'],[' can access ','link','可得到'],['treatment','slot','服務'],[' early, ','link','較早'],['illnesses','slot','問題'],[' are more likely to be diagnosed before they become severe.','link','更可能在惡化前發現']])),
  S('Early repairs reduce pressure on emergency teams and prevent small faults from spreading across a network.','This 回指及早診斷；and 並列系統壓力與外溢風險。','作者說可能減少壓力，並非醫院從此無病人。',[9,11,12],F('This reduces pressure on [系統] and prevents [風險] from spreading','從及早介入推到服務系統與其他人的利益。','已說明個別問題可及早處理後，要進一步列出兩種公共效益時。',[['This reduces pressure on ','link','減少系統負擔'],['hospitals','slot','系統'],[' in the long term and prevents ','link','長遠並防止'],['contagious diseases','slot','風險'],[' from spreading widely.','link','廣泛擴散']])),
  S('For instance, if poor families avoid paying for repairs, small leaks may worsen or damage neighbouring homes.','if 設費用阻礙；may worsen or spread 把個體延誤連到他人受損。','原文是可能惡化或傳播，不是每例必然如此。',[9,10,12],F('If [資源少的家庭] avoid [及早服務] because of [費用], [小問題] may worsen or spread to [其他人]','用可想像的因果例子說明費用門檻造成外部代價。','要示範某個家庭因費用延誤服務，如何令問題擴及他人時。',[['For instance, if ','link','提出條件例子'],['poor families','slot','資源少的家庭'],[' avoid ','link','因費用避免'],['seeing a doctor','slot','及早服務'],[' because of ','link','由於'],['high fees','slot','費用'],[', ','link','結果'],['minor infections','slot','小問題'],[' may worsen or spread to others in schools, workplaces, and communities.','link','可能惡化或傳到他人']])),
  S('In this sense, free school meals are not simply kindness; they are an investment in learning and a steady school community.','not simply...; it is... 把善意重界定為有實際公共回報的投入。','這句並不否認善意，而是增加公共政策理由。',[8,10,11],F('[公共措施] is not simply [善意]; it is a practical investment in [公共利益]','總結第二段，將服務的道德價值與實際公共效益接起來。','已證明服務有外溢好處後，要說明它亦是務實的公共投入時。',[['In this sense, ','link','總結前文'],['free healthcare','slot','公共措施'],[' is not simply ','link','不只是'],['an act of kindness','slot','善意'],['; it is a practical investment in ','link','也是實際投入'],['public safety and social stability.','slot','公共利益']])),
  S('In conclusion, I strongly disagree that school meals should never be free.','In conclusion 直接回到題目政策，與引言立場一致。','結論不是轉為完全同意對方。',[1,2,14],F('In conclusion, I strongly disagree that [必要服務] should never be free','在結論重申對題目政策的回答。','收束全文時，必須讓讀者清楚知道最終同意與否。',[['In conclusion, I strongly disagree that ','link','總結並重申立場'],['healthcare','slot','必要服務'],[' should never be free.','link','不應永遠收費']])),
  S('While parents should encourage children to read, schools should not abandon pupils who struggle.','While 讓步承認個人責任；主句指出集體不可因此退出。','作者沒有說健康選擇不重要。',[2,4,15],F('While [個人] should [盡自身責任], [社會] should not abandon [遇到困難的人]','在結論保持個人責任與社會責任的平衡。','對方強調個人責任時，要承認合理部分，同時界定社會仍須承擔甚麼。',[['While ','link','先承認'],['individuals','slot','個人'],[' should certainly be encouraged to ','link','應受鼓勵'],['make healthy choices','slot','盡自身責任'],[', ','link','但'],['society','slot','社會'],[' should not abandon ','link','不應拋棄'],['people when they fall ill.','slot','遇到困難的人']])),
  S('A fair education system recognises that learning is partly personal, but never entirely personal.','partly...but never entirely... 精準概括混合責任，避免兩個極端。','句子承認部分個人影響，並非主張全部由社會負責。',[2,4,14],F('A fair [制度] recognises that [結果] is partly personal, but never entirely personal','以有限的個人責任收結，不把複雜結果歸咎單方。','結論需要一條可轉用的公平原則，同時避免兩個責任極端時。',[['A fair healthcare system','slot','制度'],[' recognises that ','link','承認'],['health','slot','結果'],[' is partly personal, but never entirely personal.','link','部分屬個人，絕非完全屬個人']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否認為所有醫療都必須按病人的財富收費？',['強烈反對；疾病不全由個人造成，免費醫療也保護整個社會','完全同意；一切疾病只由個人選擇造成','沒有表態；只談醫療用品價格','認為醫生應停止所有診斷'],'引言明說 completely disagree，並預告公平與公共效益。'),
  {type:'multi',prompt:'哪兩項分別是兩段主體的理由？',detail:'選兩項，再按「確認」。',options:['許多疾病由遺傳、環境或年齡等非自選因素造成','及早得到治療可減少惡化及傳播，惠及社會','每位病人都完全沒有任何健康責任','免費醫療只是一種善意，毫無實際效益'],correct:[0,1],why:'首段論責任與公平；次段論及早治療的公共好處。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 強烈反對永不免費','疾病不全屬個人責任；免費醫療有個人及社會效益。'],
  ['主體段一 · 不可全怪病人','承認選擇有影響，再以遺傳、環境、年齡及低收入病人說明公平。'],
  ['主體段二 · 及早治療惠及公眾','費用門檻可能延誤診斷、增加醫院壓力與感染傳播。'],
  ['結論 · 分擔責任','鼓勵健康選擇，同時維持社會對病人的照顧。'],
],'非全由個人控制 → 不應按財富拒醫 → 及早治療有外溢利益 → 公平分擔。')];
const evidence=[
  Q('作者是否承認飲食、運動與吸煙會影響健康？',['承認，但反對因此責怪每一位病人','否認任何生活選擇都影響健康','認為所有病人一定吸煙','認為遺傳因素可由病人選擇'],'Although...can affect health, it is far too simplistic...。'),
  Q('作者列出的三類非自選因素是甚麼？',['遺傳疾病、不安全工作環境、隨年齡變弱','只有醫院裝潢、藥盒與廣告','全部只是個人飲食選擇','只有醫生工作時間'],'Children...workers...elderly people...。'),
  Q('低收入癌症病人的例子說明哪個原則？',['不應單因付不起昂貴治療而拒絕必要照顧','癌症必由貧窮直接造成','任何疾病都不需治療','只要有錢便不會患癌'],'merely because they cannot afford...。'),
  Q('如果醫療完全取決個人財富，作者說疾病會多出甚麼負擔？',['對弱勢人士的經濟懲罰','只有健康改善','醫院完全沒有病人','每人都有相同選擇'],'not only a medical problem but also a financial punishment。'),
  Q('免費醫療為何對沒有直接求醫的人也有益？',['及早診斷可減少醫院壓力及傳染病擴散','因為疾病不會再存在','因為所有服務都會自動零成本','因為家庭毋須作健康選擇'],'第二段從個人治療推到公共安全。'),
  Q('最後一句對健康責任的界定是甚麼？',['部分屬個人，但絕不完全屬個人','完全只屬個人','完全與個人選擇無關','只由醫院大樓負責'],'partly personal, but never entirely personal。'),
];
const logic=[
  sequence('第一主體段：為何不能單憑個人責任拒醫？',[
    ['主張','許多健康問題非個人能控制。'],
    ['有限讓步','生活選擇會影響健康，但不能責怪每位病人。'],
    ['多類成因','遺傳、工作環境和年齡都可能帶來疾病。'],
    ['具體個案','低收入癌症病人不應因付不起醫費被拒絕。'],
    ['後果','按財富分配醫療讓疾病變成弱勢者的雙重懲罰。'],
  ],'個人控制有限 → 非自選成因 → 付費門檻不公 → 雙重負擔。'),
  sequence('第二主體段：免費醫療如何惠及整體？',[
    ['另一理由','受益者不限直接求醫的病人。'],
    ['及早機制','較容易在病情惡化前診斷。'],
    ['系統與公眾','減輕醫院壓力並減少傳染。'],
    ['反面例子','高費用使貧困家庭延遲求醫，小病可惡化或傳人。'],
    ['段落結論','免費醫療是公共安全與社會穩定的實際投資。'],
  ],'及早取得服務 → 少惡化與傳播 → 公眾受益 → 務實投入。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某城市只讓付得起高昂票價的家庭乘坐安全校車。','哪項公平原則最能轉用本文？',['必要服務若只按財富分配，原本的風險會對資源較少者造成額外懲罰','安全只由家庭的選擇決定','票價愈高便必然愈安全','收入低的家庭不需要交通安全'],['按財富分配服務可能造成雙重負擔。','忽略外部條件。','沒有保證。','與公平原則相反。'],[6,7],'depends entirely on personal wealth；financial punishment。'),
  T('有人說「學生考差只因不夠努力，因此不該提供免費補課」。','文章哪種反駁方式較合適？',['先承認努力有影響，再指出家庭環境與學習障礙也可能非學生所能控制','否認任何努力都會影響成績','直接責怪每一位落後學生','聲稱所有學生困難都完全相同'],['Although...can affect...，但不能把每人都歸咎個人。','過度否定個人因素。','重複錯誤歸責。','忽略多樣成因。'],[3,4,5],'Although lifestyle choices...；too simplistic。'),
  T('社區提供免費的早期建築安全檢查。','哪項外溢效益與第二段相似？',['及早發現小問題可降低日後搶修壓力，也減少問題波及鄰居','檢查能保證任何建築永不損壞','只有受檢的一戶可能得到好處','檢查的唯一作用是讓人感到被關心'],['及早介入能同時惠及系統與其他人。','過度保證。','忽略外溢。','文章稱務實投資。'],[8,9,10,12],'diagnosed before severe；reduces pressure。'),
  T('某企業說員工應自負一切工傷費用，因為人人可自行決定是否受傷。','哪項具體反例最貼近第一段？',['不安全工作環境可使工人患病或受傷，不能全歸責個人','工傷必然只由員工故意造成','所有工作環境都完全相同','只要工人收入高，危險便不存在'],['unsafe environments 是明列的外部因素。','錯誤絕對化。','忽略環境差異。','收入不能消除危險。'],[4,5,7],'workers...unsafe environments。'),
  T('貧困家庭因昂貴的檢測費延遲處理一種會傳染的疾病。','哪項因果最準確？',['費用門檻可能使小問題惡化，並讓其他人承受傳播風險','只有家庭本身可能受影響','疾病必然在一天內完全消失','醫院壓力必然即時歸零'],['may worsen or spread to others。','忽略公共風險。','無根據保證。','與延誤後果相反。'],[9,10,11],'high fees；minor infections may worsen or spread。'),
  T('有人認為免費學校膳食只是一種善意，不能算作政策投資。','可怎樣轉用第二段的結論？',['若改善學生健康與學習環境，也可視為有實際公共回報的投入','只要是善意便必然沒有實際好處','任何免費服務必然完全零成本','只能計算直接收到膳食的人數'],['not simply an act of kindness; practical investment。','善意和回報可並存。','免費對使用者不等於零成本。','忽略外部效益。'],[8,12],'not simply kindness；practical investment。'),
  T('城市防洪政策同時受居民行為與排水設計影響。','哪句最能保留本文結尾的責任分寸？',['居民可負部分責任，但安全也取決於公共設施，不能全歸責個人','只要有人亂丟垃圾，城市便不用修排水渠','公共設施毫不影響安全','居民完全不需要遵守任何規則'],['partly personal, but never entirely personal 可轉用。','把部分責任錯當全部。','忽略外部因素。','又走向另一極端。'],[4,15],'partly personal, but never entirely personal。'),
  T('議員聲稱「既然社會要提供醫療，個人便不用再作健康選擇」。','文章會如何修正？',['仍應鼓勵健康選擇，但生病時社會也不應拋棄人','個人選擇完全無關','病人應單獨承擔一切風險','只談付款，不談健康'],['While...healthy choices, society should not abandon...。','一方責任不取消另一方。','這是另一個責任極端。','文章同時談健康選擇與照顧。'],[4,14,15],'healthy choices；should not abandon people。'),
  T('學校能在學生嚴重落後前提供免費閱讀評估。','哪項說法最符合「more likely」的分寸？',['及早評估可能更早發現問題，但不能保證每位學生必然改善','評估必然消除所有落後','沒有評估也必然全部成功','只有昂貴評估才可能有效'],['原句用 more likely 表示機率，不是保證。','過度保證。','沒有根據。','價格不是唯一準則。'],[9,10],'more likely to be diagnosed before severe。'),
  T('某人只評估免費服務對直接使用者的幫助。','本文提示還要看甚麼？',['服務是否減少整體系統壓力及對其他人的風險','服務名稱是否更好聽','只看服務宣傳用色','只問一個人的感受'],['第二段明說 benefits society, not just individual patients。','無關。','無關。','忽略外部效益。'],[8,9,10,11],'benefits society, not just individual patients。'),
  T('有人提議「所有醫療永遠免費」與「所有醫療永遠收費」只能選一個極端。','文章真正處理的是哪個主張？',['作者反對「永遠不免費」，並以公平及公共效益支持可免費取得醫療','作者提出全部醫療必然零成本的財政證明','作者完全贊成永遠收費','作者說病人不應負任何責任'],['回應原題的 should never be free；勿添加未證明的全免費財政主張。','文章未作此全面估算。','立場相反。','結尾承認部分個人責任。'],[1,2,13,15],'completely disagree；should never be free。'),
  T('要一句話整合全文。','哪句最準確？',['健康選擇重要，但病人不全能控制疾病；可及的免費醫療可及早治療，並保護整個社會','所有疾病都完全由病人造成','免費醫療只有道德價值，沒有實際作用','社會責任可完全取代個人選擇'],['包含有限個人責任、公平及公共效益。','與第一段相反。','與第二段相反。','與結論不符。'],[2,3,4,5,8,9,10,12,14,15],'partly personal；benefits society。'),
];
export default {key:'opinion:58',meta:{topic:'個人健康責任與免費醫療',summary:'作者反對「醫療永不免費」的主張。首段承認個人選擇會影響健康，但遺傳、工作環境與年齡等因素不能全由病人控制，費用門檻會懲罰弱勢者。次段說明及早求醫能減少惡化、醫院壓力與疾病傳播，因此免費醫療也有公共效益。結論以「部分個人責任，絕非全部」收束。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
