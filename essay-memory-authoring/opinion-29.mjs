// Model Essay 29 · Opinion: street policing, prevention and rehabilitation.
const simple=[
  'Crime is a serious problem for society because it makes people less safe and less able to trust daily life.',
  'As crime becomes more common, some people say adding more police on the streets is the only way that works.',
  'I do not agree at all, because preventing crime and helping offenders change can reduce it for a longer time.',
  'The first reason is that many crimes come from social problems, not just from having too few police nearby.',
  'When young people live in poor areas, leave school without useful skills or see little chance of steady work, crime may look like the quickest way out of a hard life.',
  'More police walking around may stop some crimes in public, but they do not take away the problems that push people towards breaking the law.',
  'On the other hand, better schools, places for young people, training for jobs and help with mental health can deal with the causes of crime.',
  'For example, a teenager watched after school and with a real chance of getting a job is much less likely to join a gang or steal to stay alive.',
  'So prevention is not a weak choice; it is a useful way to stop crime before it starts growing.',
  'A second reason is that many crimes are done by people who have been through the justice system before.',
  'If prisons only punish people and then let them out without skills, help or work chances, society may just be keeping them away for a short time while doing nothing about the real problem.',
  'Programmes that help offenders change, talks for support and carefully watched work opportunities can stop the cycle of committing crimes again.',
  'A person who leaves prison with a useful job skill and help afterwards has more reason to live responsibly than someone who returns to being poor and alone.',
  'This makes help to change a needed part of enforcing the law, not an extra that we can do without.',
  'In short, I do not agree at all that adding police on the streets is the only way to reduce crime.',
  'Police people can see may stop some crimes, but keeping people safe for a long time needs prevention, education, jobs and help for offenders to change.',
];
const vocabulary=[
  [['serious social problem','serious problem for society','嚴重社會問題'],['weakens public safety','makes people less safe','削弱公共安全'],["people's trust in everyday life",'able to trust daily life','日常信任']],
  [['In response to rising crime rates','As crime becomes more common','面對犯罪率上升'],['putting more police officers on the streets','adding more police on the streets','增加街頭警力'],['the only effective solution','the only way that works','唯一有效方法']],
  [['completely disagree','do not agree at all','完全不同意'],['more permanently','for a longer time','更持久'],['prevention','preventing crime','預防'],['rehabilitation','helping offenders change','改造']],
  [['offences','crimes','罪案'],['rooted in social conditions','come from social problems','根源於社會條件'],['not merely','not just','不只是'],['a lack of police presence','having too few police nearby','警力不足']],
  [['poor neighbourhoods','poor areas','貧困社區'],['few useful skills','without useful skills','缺乏實用技能'],['little hope of stable work','little chance of steady work','缺乏穩定工作希望'],['quickest escape from hardship','quickest way out of a hard life','最快逃離困境']],
  [['More patrols','More police walking around','更多巡邏'],['stop some offences','stop some crimes','阻止部分罪案'],['pressure that pushes people towards illegal behaviour','problems that push people towards breaking the law','推人違法的壓力']],
  [['By contrast','On the other hand','相比之下'],['youth centres','places for young people','青少年中心'],['job training','training for jobs','職業培訓'],['mental-health support','help with mental health','心理健康支援'],['tackle crime at its source','deal with the causes of crime','從源頭處理犯罪']],
  [['after-school supervision','watched after school','課後監管'],['realistic path into employment','real chance of getting a job','實際就業途徑'],['far less likely','much less likely','可能性低得多'],['steal to survive','steal to stay alive','為生存偷竊']],
  [['therefore','So','因此'],['soft option','weak choice','軟弱選擇'],['practical way','useful way','實際方法'],['before it takes root','before it starts growing','生根前']],
  [['committed by','done by','由...所犯'],['already passed through the justice system','been through the justice system before','曾經歷司法制度']],
  [['offenders','people','罪犯'],['employment prospects','work chances','就業前景'],['locking people away temporarily','keeping them away for a short time','暫時關起來'],['underlying problem untouched','doing nothing about the real problem','根本問題未處理']],
  [['Rehabilitation programmes','Programmes that help offenders change','改造計劃'],['counselling','talks for support','輔導'],['supervised work opportunities','carefully watched work opportunities','受監督工作機會'],['cycle of reoffending','cycle of committing crimes again','再犯循環']],
  [['former prisoner','person who leaves prison','前囚犯'],['learns a trade','a useful job skill','學會一門技能'],['receives guidance after release','help afterwards','獲釋後得指導'],['poverty and isolation','being poor and alone','貧困和孤立']],
  [['necessary partner to law enforcement','needed part of enforcing the law','執法必要夥伴'],['not a luxury','not an extra that we can do without','非奢侈選項']],
  [['In conclusion','In short','總結來說'],['completely disagree','do not agree at all','完全不同意'],['street policing','adding police on the streets','街頭警力']],
  [['Visible officers','Police people can see','可見警察'],['discourage some offences','stop some crimes','阻嚇部分犯罪'],['lasting public safety','keeping people safe for a long time','長久公共安全'],['rehabilitation','help for offenders to change','改造']],
];
const chunkOverrides=[
  ['Crime is a serious social problem','because it weakens public safety and people\'s trust in everyday life.'],
  ['In response to rising crime rates,','some people argue that putting more police officers on the streets','is the only effective solution.'],
  ['I completely disagree with this view,','because crime can be reduced more permanently','through prevention and rehabilitation.'],
  ['The first reason is that many offences are rooted in social conditions,','not merely in a lack of police presence.'],
  ['When young people grow up in poor neighbourhoods, leave school with few useful skills,','or see little hope of stable work,','crime can appear to be the quickest escape from hardship.'],
  ['More patrols may stop some offences in public places,','but they do not remove the pressure that pushes people towards illegal behaviour.'],
  ['By contrast, better education, youth centres, job training and mental-health support','can tackle crime at its source.'],
  ['For example, a teenager who has after-school supervision and a realistic path into employment','is far less likely to join a gang or steal to survive.'],
  ['Prevention is therefore not a soft option;','it is a practical way to stop crime before it takes root.'],
  ['A second reason is that many crimes','are committed by people who have already passed through the justice system.'],
  ['If prisons only punish offenders and release them without skills, support or employment prospects,','society may simply be locking people away temporarily','while leaving the underlying problem untouched.'],
  ['Rehabilitation programmes, counselling and supervised work opportunities','can break this cycle of reoffending.'],
  ['A former prisoner who learns a trade and receives guidance after release','has a stronger reason to live responsibly','than one who returns to poverty and isolation.'],
  ['This makes rehabilitation a necessary partner to law enforcement,','not a luxury.'],
  ['In conclusion, I completely disagree','that street policing is the only way to reduce crime.'],
  ['Visible officers may discourage some offences,','but lasting public safety depends on prevention, education, employment and rehabilitation.'],
];
const simpleChunkOverrides=[
  ['Crime is a serious problem for society','because it makes people less safe and less able to trust daily life.'],
  ['As crime becomes more common,','some people say adding more police on the streets','is the only way that works.'],
  ['I do not agree at all,','because preventing crime and helping offenders change','can reduce it for a longer time.'],
  ['The first reason is that many crimes come from social problems,','not just from having too few police nearby.'],
  ['When young people live in poor areas, leave school without useful skills','or see little chance of steady work,','crime may look like the quickest way out of a hard life.'],
  ['More police walking around may stop some crimes in public,','but they do not take away the problems that push people towards breaking the law.'],
  ['On the other hand, better schools, places for young people, training for jobs and help with mental health','can deal with the causes of crime.'],
  ['For example, a teenager watched after school and with a real chance of getting a job','is much less likely to join a gang or steal to stay alive.'],
  ['So prevention is not a weak choice;','it is a useful way to stop crime before it starts growing.'],
  ['A second reason is that many crimes','are done by people who have been through the justice system before.'],
  ['If prisons only punish people and then let them out without skills, help or work chances,','society may just be keeping them away for a short time','while doing nothing about the real problem.'],
  ['Programmes that help offenders change, talks for support and carefully watched work opportunities','can stop the cycle of committing crimes again.'],
  ['A person who leaves prison with a useful job skill and help afterwards','has more reason to live responsibly','than someone who returns to being poor and alone.'],
  ['This makes help to change a needed part of enforcing the law,','not an extra that we can do without.'],
  ['In short, I do not agree at all','that adding police on the streets is the only way to reduce crime.'],
  ['Police people can see may stop some crimes,','but keeping people safe for a long time needs prevention, education, jobs and help for offenders to change.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Crime is a serious problem because it weakens safety and everyday trust.','because 解釋犯罪何以是社會問題，列安全與信任兩個後果。','這是引言背景，尚未指定街頭警力是否唯一解方。',[1,2,3],
    F('[犯罪] is [嚴重社會問題] because [削弱安全與日常信任]','先交代議題影響，讓解方爭議有明確目標。','引言要先說明某公共問題為何值得處理時。',[['Crime','slot','犯罪'],[' is ','link','屬於'],['a serious social problem','slot','嚴重社會問題'],[' because ','link','原因是'],["it weakens public safety and people's trust in everyday life.",'slot','削弱安全與日常信任']])),
  S('In response to rising theft, some people argue that more street patrols are the only effective solution.','some people argue 歸屬他人；only 是作者要挑戰的排他性。','文章並未否認巡邏可阻止部分罪案，而是否定唯一有效。',[0,2,5],
    F('In response to [犯罪率上升], some people argue that [更多街頭警察] is [唯一有效解方]','準確轉述對方以警力為唯一解方的主張。','題目提出單一方案，要指出其「唯一方法」的強度時。',[['In response to ','link','問題背景'],['rising crime rates','slot','犯罪率上升'],[', some people argue that ','link','歸屬對方'],['putting more police officers on the streets','slot','更多街頭警察'],[' is ','link','被視為'],['the only effective solution.','slot','唯一有效解方']])),
  S('I disagree because crime can be reduced more permanently through education and support after release.','because 引出替代路線；prevention 與 rehabilitation 是兩條段落。','作者反對「唯一」，不主張撤去所有警力。',[1,3,9],
    F('I completely disagree with [唯一警力觀], because [犯罪] can be reduced more permanently through [預防與改造]','引言直接給立場和兩條替代機制。','轉述單一方案後，要預告其他方法為何可能更持久時。',[['I completely disagree with ','link','表明反對'],['this view','slot','唯一警力觀'],[', because ','link','提出理由'],['crime','slot','犯罪'],[' can be reduced more permanently through ','link','可更長久地降低'],['prevention and rehabilitation.','slot','預防與改造']])),
  S('The first reason is that some offences come from social conditions, not merely too few patrols.','rooted in...not merely... 指向社會根源，不否認警力也可能有作用。','第一段要分析犯罪形成的壓力，而非只討論巡邏數量。',[1,4,5],
    F('The first reason is that [許多罪案] are rooted in [社會條件], not merely in [警力不足]','把解方討論由街道可見警力轉到犯罪成因。','首段要說明只加強眼前處理為何未觸及根本原因時。',[['The first reason is that ','link','提出第一理由'],['many offences','slot','許多罪案'],[' are rooted in ','link','根源於'],['social conditions','slot','社會條件'],[', not merely in ','link','不只是'],['a lack of police presence.','slot','警力不足']])),
  S('When young people lack useful skills and stable work, crime can appear to be a quick escape from hardship.','When 列不利條件；can appear 是當事人可能的看法，不是說犯罪真能解決困境。','這句提供社會壓力如何影響選擇的可能路徑。',[3,5,6],
    F('When [貧困、少技能或少工作希望], [犯罪] can appear to be [最快逃離困境]','用多項社會條件解釋犯罪可能看起來有吸引力。','提出社會成因後，要具體化而不把有害行為合理化時。',[['When ','link','列出條件'],['young people grow up in poor neighbourhoods, leave school with few useful skills, or see little hope of stable work','slot','貧困、少技能或少工作希望'],[', ','link','接可能結果'],['crime','slot','犯罪'],[' can appear to be ','link','可能看似'],['the quickest escape from hardship.','slot','最快逃離困境']])),
  S('More patrols may stop some public offences, but they do not remove the lack of work that pushes some people towards crime.','may...but... 承認巡邏的有限作用，再指出未處理的根本壓力。','反對的是以巡邏作唯一解法，並非說巡邏毫無效果。',[1,4,6],
    F('[更多巡邏] may stop [部分公共場所罪案], but they do not remove [推人違法的壓力]','以讓步和限制直接比較警力的作用與缺口。','要公平評價對方方案，不把它寫成完全無用時。',[['More patrols','slot','更多巡邏'],[' may stop ','link','可能阻止'],['some offences in public places','slot','部分公共場所罪案'],[', but they do not remove ','link','卻未消除'],['the pressure that pushes people towards illegal behaviour.','slot','推人違法的壓力']])),
  S('By contrast, education, youth centres and job training can address some causes of crime.','By contrast 轉向源頭措施；多項服務與前句的巡邏限制形成對照。','此句說 can tackle，不保證單一服務能完全消除所有犯罪。',[4,5,7],
    F('By contrast, [教育、青年中心、職訓與心理支援] can tackle [犯罪源頭]','提出替代措施，對準前句未解決的社會壓力。','指出原方案未處理根源後，要列出可行的預防方法時。',[['By contrast, ','link','轉向替代'],['better education, youth centres, job training and mental-health support','slot','教育、青年中心、職訓與心理支援'],[' can tackle ','link','可處理'],['crime at its source.','slot','犯罪源頭']])),
  S('For example, a teenager with after-school support and a path to work may be less likely to join a gang.','who has... is far less likely 用具體支援與可能結果連接預防機制。','不是說有課後支援便保證不會犯罪。',[5,6,8],
    F('For example, [有課後監管與就業路徑的青少年] is [較少可能入幫派或為生存偷竊]','以一名青少年的支援與工作希望，展示源頭措施如何影響選擇。','列出預防措施後，要用完整的因果例子說明時。',[['For example, ','link','引出例子'],['a teenager who has after-school supervision and a realistic path into employment','slot','有課後監管與就業路徑的青少年'],[' is ','link','因此'],['far less likely to join a gang or steal to survive.','slot','較少可能入幫派或為生存偷竊']])),
  S('Prevention is not a weak option; it stops problems before they grow.','not...; it is... 重新界定預防為務實而非軟弱，配合生根比喻。','此句總結第一段源頭措施的作用。',[5,7,9],
    F('[預防] is therefore not [軟弱選項]; it is [犯罪生根前的務實方法]','回應「只有加警力才強硬」的暗示，總結預防的實際價值。','首段末要把看似只屬福利的措施，重新界定為預防作用時。',[['Prevention','slot','預防'],[' is therefore not ','link','因此不是'],['a soft option','slot','軟弱選項'],['; it is ','link','而是'],['a practical way to stop crime before it takes root.','slot','犯罪生根前的務實方法']])),
  S('A second reason is that some offences are committed by people who have already been through prison.','A second reason 轉向再犯循環；already passed through 說只靠抓捕處罰不夠。','第二段的問題不是初次犯罪的社會根源，而是司法系統後仍犯罪。',[8,10,11],
    F('A second reason is that [許多罪案] are committed by [曾經過司法系統的人]','從事前預防轉向案後改造和再犯問題。','完成第一種成因後，次段要提出另一種持續循環時。',[['A second reason is that ','link','提出第二理由'],['many crimes','slot','許多罪案'],[' are committed by ','link','由此人所犯'],['people who have already passed through the justice system.','slot','曾經過司法系統的人']])),
  S('If prisons release people without skills or support, society may only keep them away briefly while leaving the real problem.','If...may...while... 說只關人而不準備回歸，可能未處理根源。','作者不是否定處罰，而是否定「只有處罰」的充分性。',[9,11,12],
    F('If [監獄只懲罰後讓人無技能支援獲釋], [社會] may simply [暫時關起來] while [根本問題仍在]','以釋放後缺資源的情境，解釋再犯循環可能如何維持。','要說明單靠懲罰何以未必產生長久安全時。',[['If ','link','設定制度情境'],['prisons only punish offenders and release them without skills, support or employment prospects','slot','監獄只懲罰後讓人無技能支援獲釋'],[', ','link','接社會後果'],['society','slot','社會'],[' may simply be ','link','可能只是在'],['locking people away temporarily','slot','暫時關起來'],[' while ','link','同時'],['leaving the underlying problem untouched.','slot','根本問題仍在']])),
  S('Education and supervised work after release can help break a cycle of offending again.','多種改造措施作主語，can break 指可能中斷再犯循環。','不是說每一計劃必然奏效，而是提供警力之外的介入。',[9,10,12],
    F('[改造、輔導與受監督工作] can break [再犯循環]','提出第二段的具體替代措施，直接針對再次犯罪。','指出原方案只處理一面後，要列出改善回歸的安排時。',[['Rehabilitation programmes, counselling and supervised work opportunities','slot','改造、輔導與受監督工作'],[' can break ','link','可打破'],['this cycle of reoffending.','slot','再犯循環']])),
  S('A former prisoner with a trade and guidance after release has more reason to live responsibly than one who returns to isolation.','比較兩種釋放後條件；has a stronger reason 不等於保證不再犯。','例子說明技能和指導能提供較可行的負責任生活路徑。',[10,11,13],
    F('[學技能並獲釋後得指導者] has [較強動機負責任生活] than [回到貧困孤立者]','比較兩種回歸條件，展示改造如何針對再犯風險。','提出替代措施後，要用同一處境的正反對照說明時。',[['A former prisoner who learns a trade and receives guidance after release','slot','學技能並獲釋後得指導者'],[' has ','link','有'],['a stronger reason to live responsibly','slot','較強動機負責任生活'],[' than ','link','相比'],['one who returns to poverty and isolation.','slot','回到貧困孤立者']])),
  S('This makes rehabilitation a necessary partner to policing, not an optional luxury.','necessary partner...not a luxury 明確把改造與執法並列，並非互斥。','作者沒有主張停止執法，而是說執法需配合改造。',[9,11,12],
    F('This makes [改造] [執法必要夥伴], not [奢侈選項]','由再犯循環與回歸例子推出雙軌政策。','次段末要說明一項改善措施為何不是可有可無時。',[['This makes ','link','由例子推出'],['rehabilitation','slot','改造'],[' ','link','成為'],['a necessary partner to law enforcement','slot','執法必要夥伴'],[', not ','link','不是'],['a luxury.','slot','奢侈選項']])),
  S('In conclusion, I disagree that street patrols are the only way to reduce crime.','In conclusion 直接重申反對「唯一」的主張。','作者反對排他性，並不否認警員可阻嚇部分罪案。',[1,2,15],
    F('In conclusion, I completely disagree that [街頭警力] is [減罪唯一方法]','精確回到題目中的排他性，而不誇張成反警力。','完成兩條替代途徑後，要重答題目的唯一方案主張時。',[['In conclusion, I completely disagree that ','link','總結反對'],['street policing','slot','街頭警力'],[' is ','link','被當作'],['the only way to reduce crime.','slot','減罪唯一方法']])),
  S('Visible officers may stop some offences, but lasting safety also needs prevention, education, jobs and rehabilitation.','may...but... 保留可見警力的有限作用，再列長久安全的多元條件。','這是多方法結論，非宣稱其中某單一方法必定解決一切。',[5,6,13],
    F('[可見警員] may discourage [部分罪案], but [長久公共安全] depends on [預防、教育、就業與改造]','以讓步和政策清單收束全文，完整保留兩段替代路線。','最後一句要承認原方案有限作用，並指出更持久的方法時。',[['Visible officers','slot','可見警員'],[' may discourage ','link','或可阻嚇'],['some offences','slot','部分罪案'],[', but ','link','然而'],['lasting public safety','slot','長久公共安全'],[' depends on ','link','依賴'],['prevention, education, employment and rehabilitation.','slot','預防、教育、就業與改造']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意「增加街頭警力是唯一有效減罪方法」？',[
    '完全不同意：巡邏可阻止部分罪案，但預防和改造也能處理根源與再犯',
    '完全同意：教育、就業和改造都不會影響犯罪',
    '認為警察巡邏在任何地方都沒有作用',
    '沒有立場：只談警員制服',
  ],'作者反對的是 only effective solution；結論保留 visible officers may discourage some offences。'),
  {type:'multi',prompt:'選出本文兩條不同的替代路線',detail:'選兩項，再按「確認」。',options:[
    '教育、青年中心、職訓和心理支援可處理令部分人走向犯罪的社會壓力',
    '輔導、技能與受監督工作可幫助曾服刑者回歸，減少再犯循環',
    '只要多巡邏，貧困與缺乏工作希望便自動消失',
    '改造計劃必然代表取消所有執法和處罰',
  ],correct:[0,1],why:'第一主體段談事前社會預防，第二主體段談司法後的改造與再犯。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對唯一警力方案','犯罪損害安全與信任，但作者反對單靠街頭警力。'],
  ['主體段一 · 事前預防','貧困、技能及工作希望不足是可能壓力；教育、青年服務與就業路徑針對根源。'],
  ['主體段二 · 打破再犯','只懲罰再放人可能留着根本問題；改造、輔導與監督工作協助回歸。'],
  ['結論 · 多方法公共安全','可見警員可阻嚇部分罪案，長久安全還需預防、教育、就業和改造。'],
],'街頭警力有限作用 → 社會根源須預防 → 再犯循環須改造 → 多方法並行。')];
const evidence=[
  Q('作者對更多巡邏的態度是甚麼？',[
    '可阻止部分公共場所罪案，但不能單靠巡邏消除推人違法的壓力',
    '完全沒有任何阻嚇作用',
    '能自動消除貧困、缺技能與失業',
    '是作者承認的唯一有效方案',
  ],'More patrols may stop some offences...but... 是範文的精確限定。'),
  Q('貧困社區、少技能和少工作希望，與犯罪之間如何被文章連接？',[
    '這些處境可能令犯罪看似最快逃離困境的方式',
    '有一項處境便保證每個青年必然犯罪',
    '它們都只與街頭巡邏人數有關',
    '犯罪必定能真正解決貧困與工作問題',
  ],'can appear to be 限定為可能感到有吸引力，並非必然或有效出路。'),
  Q('為何作者說預防並非「軟弱選項」？',[
    '教育、青年服務與就業路徑可在犯罪習慣形成前處理部分根源',
    '預防必須完全停止警察巡邏',
    '只要有青年中心，任何人都不再需要技能',
    '預防只在案發多年後才有作用',
  ],'stop crime before it takes root 把預防放在問題生根之前。'),
  Q('如果監獄只懲罰後把人無技能、無支援地放出，作者擔心甚麼？',[
    '可能只是暫時隔離人，根本問題仍在，形成再犯循環',
    '所有獲釋者必然立即得到穩定工作',
    '只要曾受處罰，技能和支援便不再重要',
    '社會根源會因短暫拘留自動消失',
  ],'locking people away temporarily while leaving underlying problem untouched 是原句核心。'),
  Q('學手藝且獲釋後得到指導的前囚犯例子，說明甚麼？',[
    '與回到貧困孤立相比，他較有理由以負責任方式生活',
    '學手藝後必定永遠不會再犯',
    '貧困與孤立會自動提供最多就業機會',
    '獲釋後的指導與回歸生活完全無關',
  ],'has a stronger reason 是比較動機，非零再犯保證。'),
  Q('範文如何定位改造與執法的關係？',[
    '改造是執法不可或缺的夥伴，兩者可共同服務長久安全',
    '改造必須取代所有警察與法律',
    '只要有執法，改造便沒有任何用途',
    '改造只是奢侈裝飾，與再犯無關',
  ],'necessary partner to law enforcement, not a luxury 是原句直接結論。'),
];
const logic=[
  sequence('第一主體段：為何單加巡邏不能處理犯罪根源？',[
    ['第一理由','許多罪案與社會條件有關，不只是警力不足。'],
    ['具體壓力','貧困、缺技能和少穩定工作希望可令犯罪看似出路。'],
    ['巡邏限度','更多巡邏可阻止部分公共場所罪案，卻未除根源壓力。'],
    ['源頭措施','教育、青年中心、職訓與心理支援處理較深成因。'],
    ['青少年例子','課後監督和就業路徑可降低入幫派或偷竊的可能。'],
    ['段落結論','預防是犯罪生根前的務實做法。'],
  ],'社會壓力 → 巡邏部分有效但未除根源 → 預防措施提早介入。'),
  sequence('第二主體段：為何改造要與執法並行？',[
    ['另一問題','部分罪案由已走過司法系統的人再犯。'],
    ['只懲罰的缺口','釋放時若無技能、支援和工作前景，根本問題仍在。'],
    ['改造安排','輔導、訓練與受監督工作可打破循環。'],
    ['前囚犯對照','有手藝及指導者比回到貧困孤立者更有負責任生活的理由。'],
    ['段落結論','改造是執法夥伴，而不是奢侈選項。'],
    ['全文回扣','長久安全需預防、教育、就業和改造，警力只能解決一部分。'],
  ],'只關人不處理回歸 → 再犯風險仍在 → 改造與執法並行。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('社區增加夜間巡邏後，部分街頭偷竊減少，但青年失學和失業仍嚴重。','哪項最能運用第一主體段？',[
    '承認巡邏可阻止部分罪案，同時用教育和工作路徑處理未消失的壓力',
    '街頭偷竊一減少，失學與失業便必然自動消失',
    '因巡邏有限，便否認它曾阻止任何罪案',
    '只要多巡邏，就不必再研究犯罪成因',
  ],[
    '範文對巡邏的有限肯定與源頭預防可同時成立。',
    '社會壓力不會自動消除。',
    '範文承認部分阻嚇。',
    '「唯一」方案正是作者反對的。',
  ],[3,4,5,6,15],'範文說 patrols may stop some offences, but do not remove pressure。'),
  T('一名學生說：「貧困地區有人犯罪，所以那裏每個青年都一定會犯罪。」','哪項最能保留原文的可能性？',[
    '困境可能增加某些人對犯罪的錯誤吸引感，但不能推定每個青年都犯罪',
    '只要住在貧困地區，犯罪便是唯一可能道路',
    '原文說貧困、技能與工作機會完全無關犯罪',
    '只要有穩定工作希望，所有罪案便立即消失',
  ],[
    '範文用 can appear 和 far less likely 分析風險，沒有個體必然論。',
    '這是過度概括。',
    '社會條件是第一段核心。',
    '降低風險不等於零犯罪。',
  ],[3,4,7],'範文說犯罪 can appear to be 逃離困境的捷徑，而不是人人必定選擇。'),
  T('青少年中心提供課後活動與求職培訓，有人說這是「太軟弱，不能減少犯罪」。','哪項最能使用「預防並非軟弱」的論證？',[
    '活動與就業路徑可在問題形成前處理部分壓力，是務實預防方式',
    '預防有用，所以法律與巡邏都應立即消失',
    '只要開一個中心，每個青年都保證不會犯錯',
    '課後活動只能在案發後多年才有意義',
  ],[
    '範文以 before it takes root 解釋源頭措施的實際作用。',
    '作者不排除執法。',
    '措施不是絕對保證。',
    '預防重點在案發前。',
  ],[6,7,8],'範文以課後監管及實際就業途徑支持預防措施。'),
  T('監獄只把犯人關了一段時間，獲釋時沒有技能、住處支援或工作機會。','哪項最能指出第二主體段的缺口？',[
    '短期隔離未必處理再犯根源，還需技能、支援和回歸安排',
    '只要關押過，獲釋後一定不會再犯',
    '學技能與就業前景完全不影響生活選擇',
    '只有街頭巡邏才能處理每名獲釋者的困境',
  ],[
    '範文說只懲罰後無支援地釋放，可令根本問題仍在。',
    '文章反對此必然推論。',
    '技能與就業是改造路徑。',
    '巡邏不代替回歸支援。',
  ],[9,10,11,12],'範文用 locking away temporarily / underlying problem untouched 說明缺口。'),
  T('一名獲釋者完成電工訓練，並有人指導找工作；另一人直接回到貧困與孤立。','哪項最符合範文比較？',[
    '前者可能較有理由負責任生活，因為有技能與釋放後指導',
    '完成訓練便保證永遠不會再犯',
    '貧困與孤立一定比技能更有利於穩定工作',
    '兩種回歸條件完全相同，不需比較',
  ],[
    '範文說 stronger reason，而非必然成功。',
    '更有理由不等於保證。',
    '範文把貧困孤立列為不利對照。',
    '條件明顯不同。',
  ],[11,12,13],'範文以學手藝及獲指導者對照回到貧困孤立者。'),
  T('政策小組認為「有改造計劃就不需要執法」，另一組認為「有執法就不需要改造」。','哪項最忠實於文章？',[
    '兩者應並行：執法處理違法行為，改造協助打破再次犯罪循環',
    '改造必須取消所有法律和巡邏',
    '只要執法，獲釋後技能便不再重要',
    '因兩者有不同作用，便永遠不能合作',
  ],[
    '範文說 rehabilitation 是 law enforcement 的 necessary partner。',
    '範文並未反執法。',
    '後續支援仍重要。',
    'partner 正是合作關係。',
  ],[10,11,13,15],'範文把改造明確定位為執法夥伴。'),
  T('一座城市的海報說「街上只要有更多警察，犯罪問題便已完全解決」。','哪項最能修正這個排他說法？',[
    '警員可阻嚇部分罪案，長久安全還要看教育、就業、預防與改造',
    '警員完全沒有任何公共安全作用',
    '只要增加巡邏，所有社會壓力都會立即消失',
    '只要有教育，便不用處理再次犯罪',
  ],[
    '範文結論同時保留可見警力與其他長久措施。',
    '作者沒有否認巡邏。',
    '巡邏未必處理根源。',
    '改造是第二段核心。',
  ],[1,5,6,13,15],'範文反對 only effective solution，並說 visible officers may discourage some offences。'),
  T('學校輔導員希望降低學生加入幫派的風險，只計劃在校門外增加巡邏。','哪項補充更貼近範文的源頭措施？',[
    '加入課後監督、實用技能與可行就業路徑，處理學生面對的壓力',
    '只增加巡邏，不必了解學生放學後的處境',
    '學生一旦失去工作希望，便必定加入幫派',
    '所有學生都應在案發後才得到任何支援',
  ],[
    '範文的青少年例子把課後安排與就業希望連到較低風險。',
    '這忽略源頭。',
    '範文用 far less likely，不作必然斷言。',
    '預防重點是案發前。',
  ],[4,5,6,7,8],'範文說 after-school supervision 和 employment path 可降低加入幫派的可能。'),
  T('一名評論者把「預防」誤寫成「放任違法者」，把「改造」誤寫成「不再執法」。','哪項區分最準確？',[
    '預防處理犯罪形成前的壓力，改造處理再犯循環；兩者可與執法並行',
    '預防與改造都只在犯罪後才開始',
    '只要有改造，所有人便可不為違法行為負責',
    '預防只能增加街頭警察，不能用教育或工作支援',
  ],[
    '這把兩段不同時段和作用分開，也保留執法角色。',
    '預防可在案發前。',
    '範文沒有免責主張。',
    '教育等是第一段主要措施。',
  ],[6,8,9,11,13],'範文一段說 crime before it takes root，另一段說 cycle of reoffending。'),
  T('社區說「再犯只是個人問題」，因此忽略獲釋者的就業與支援。','哪項最能提出範文的制度分析？',[
    '個人仍要負責，但無技能和支援地獲釋可能留下促成再犯的問題',
    '只要有社會問題，個人便完全不用承擔責任',
    '所有獲釋者都必定再次犯罪',
    '工作與支援一概不影響任何人的生活選擇',
  ],[
    '範文分析制度條件如何影響再犯，並沒有免除個人責任。',
    '文章沒有取消法律責任。',
    'may / many 不是每人必然。',
    '就業和指導是改造機制。',
  ],[9,10,11,12],'範文把 no skills, support or employment prospects 與 underlying problem untouched 連起來。'),
  T('市政會議要比較兩項預算：更多街頭巡邏，或青年技能與心理支援。','哪項比較方式最符合文章而不誇大？',[
    '按各自作用評估：巡邏可減少部分公共場所罪案，支援可處理部分深層壓力',
    '其中一項有用，就必然證明另一項毫無作用',
    '只看哪項制服更顯眼，不看犯罪成因',
    '只要青年支援有用，就保證所有罪案立即消失',
  ],[
    '範文將有限巡邏作用與源頭預防並列，不作二選一。',
    '兩者可以互補。',
    '需看因果機制。',
    '預防仍是降低風險而非保證。',
  ],[5,6,7,15],'範文使用 may stop some offences 與 can tackle crime at its source。'),
  T('一所成人教育中心為前囚犯提供技能課與受監督工作，社區仍保留必要執法。','哪項最能概括這套安排？',[
    '執法與改造互補：一邊維持規則，一邊幫人建立較穩定的回歸條件',
    '一有技能課，便不需要任何法律',
    '一有執法，技能課便必然沒有作用',
    '改造只是裝飾，不影響再犯循環',
  ],[
    '範文的 necessary partner to law enforcement 指出互補。',
    '作者沒有取消法律。',
    '作者列技能與指導的比較。',
    '再犯循環是其直接目標。',
  ],[10,11,12,13,15],'範文第二段把改造定位為執法必要夥伴。'),
];
const reviewedTransfer=[
  [['承認巡邏減少偷竊，也用教育就業處理剩餘壓力','街頭偷竊下降後，先擴大巡邏而暫緩青年支援','把巡邏成效歸因教育改善，不再追查失學問題','只以報案數評價治安，先不研究犯罪的成因'],['同時承認局部阻嚇與源頭壓力。','只擴大巡邏沒有處理題目所述失學與失業。','不能把巡邏帶來的變化直接歸因教育。','報案數不足以說明犯罪源頭是否改善。']],
  [['困境或增加犯罪誘因，仍不能推斷人人會犯罪','把貧困當主要成因，較少查個人選擇和支援','只看一個地區的案件，推論全區青年的選擇','有工作希望，便把其他預防和執法措施放低'],['這保留了可能性，沒有把環境影響變成必然結果。','社會條件重要，但不能只靠一項條件解釋行為。','地區資料不能代表每一位青年的選擇。','工作機會有幫助，仍不足以替代其他必要措施。']],
  [['活動與就業路徑可在案前處理部分成因','社區有課後中心，便降低對實際效果的查證','先擴充巡邏時段，暫時不問青年放學後處境','只把活動當案後獎勵，不看它有否預防作用'],['在問題形成前介入，是範文所說的務實預防。','成立中心仍須檢查是否真的改善處境。','這留下青年失學和失業的壓力。','把預防全放到案後，忽略源頭作用。']],
  [['短期隔離外，還需技能、支援與回歸安排','只追蹤在囚期間紀律，較少看獲釋後生活','把技能訓練列為附加項，不查它與再犯關係','先延長關押時間，暫不評估獲釋後的工作'],['短期控制與長期再犯成因須一起處理。','在囚表現不能單獨說明獲釋後風險。','範文把技能視為打破再犯循環的一部分。','關押長短本身沒有解決釋放後的困境。']],
  [['有技能與釋放後指導者，較可能穩定回歸','只以完成職訓的人數，推斷所有人回歸狀況','只比較兩組關押年期，不看釋放後的支援','把求職結果全歸因個人意志，不查技能差別'],['這個比較包含可解釋差異的實際條件。','課程完成不等於穩定生活，需要追蹤結果。','兩組的技能和支援差異才是題目的關鍵。','忽略訓練與支援，便不能作公平比較。']],
  [['執法處理違法，改造協助減少再犯，兩者並行','先擴大改造計畫，暫不檢查違法行為的後果','把巡邏當唯一重點，較少看獲釋者的技能','分開兩組工作，便不再比較它們能否互補'],['範文讓執法和改造各做不同而互補的工作。','改造不能取代對當前違法行為的處理。','只靠執法不能處理再犯成因。','制度分工仍應檢查共同效果。']],
  [['警員可阻嚇部分罪案，長久安全還靠源頭措施','只按巡邏次數決定預算，不查青年失學情況','只增加就業課程，不檢查街頭即時風險','以街頭罪案下降判斷全部犯罪成因已消除'],['這保留巡邏的有限效用並加入長期預防。','巡邏數字不能代替源頭分析。','源頭措施有用，但題目的即時安全也要考慮。','罪案下降不證明深層壓力已消失。']],
  [['加入課後監督、技能與就業路徑，處理學生壓力','先增夜間巡邏，暫不調查學生放學後處境','把失去工作希望當成犯罪的唯一決定因素','等問題出現才提供支援，不查可否提早介入'],['這些措施在案前處理可能成因。','只加巡邏沒有回應學生的日常風險。','工作希望重要，仍不能單獨預測個人行為。','範文主張在犯罪形成前介入。']],
  [['預防處理案前壓力，改造處理再犯，可與執法並行','把課後活動放到獲釋後，忽略案前預防功能','只討論再犯服務，不看初次涉案前的處境','以巡邏成效代表所有改造與預防工作的結果'],['三種機制各有時間點與作用，可互相補足。','課後活動可在首次犯罪前發揮作用。','這忽略第一主體段的源頭預防。','巡邏成效不能代表不同措施的效果。']],
  [['個人仍須負責，無支援地獲釋或保留再犯成因','只談社會壓力，較少看個人作過的違法選擇','只看在囚紀律，暫不查獲釋後的工作機會','把求職困難當成再犯結果，未檢查實際經過'],['責任與制度條件同時納入，符合兩段論證。','社會壓力不取消個人責任。','在囚紀律不代表回歸後有可行出路。','風險與實際結果須分開檢查。']],
  [['按各自作用評估：巡邏阻嚇，支援處理深層壓力','先選報案下降較快的措施，不查青年生活條件','只看青年支援的參與人數，不看街頭安全','用制服是否顯眼比較兩種措施的預防成效'],['這分別檢驗即時阻嚇和源頭預防。','報案變化不足以單獨說明長遠問題。','參與人數不足以說明治安或再犯情況。','外觀不是措施效果的證據。']],
  [['執法與改造互補：維持規則，也幫人穩定回歸','有技能課後，便把違法行為的處理延後','巡邏能處理當下，便不再追蹤釋放後狀況','把改造當額外安排，不評估其再犯影響'],['一邊處理違法，一邊改善回歸條件。','技能培訓不應取代對當前違法的回應。','只看當下會漏掉再犯循環。','改造作用須從結果檢驗。']],
];
reviewedTransfer.forEach(([options,explanations],i)=>{transfer[i].options=options;transfer[i].explanations=explanations;transfer[i].why=explanations[0];});
structures[1].example='In response to rising theft, some people argue that putting more officers on the streets is the only effective solution.';
structures[2].example='I completely disagree with this view, because crime can be reduced more permanently through education and support after release.';
structures[3].example='The first reason is that some offences are rooted in social conditions, not merely in too few patrols.';
structures[6].example='By contrast, education, youth centres and job training can tackle some causes of crime.';
structures[7].example='For example, a teenager with after-school support and a path to work is less likely to join a gang.';
structures[8].example='Prevention is therefore not a weak option; it is a way to stop problems before they grow.';
structures[10].example='If prisons release people without skills or support, society may simply be keeping them away briefly while leaving the real problem.';
structures[11].example='Education and supervised work after release can break a cycle of offending again.';
structures[14].example='In conclusion, I completely disagree that street policing is the only way to reduce crime.';
structures[15].example='Visible officers may discourage some offences, but lasting safety depends on prevention, education, jobs and rehabilitation.';
export default {
  key:'opinion:29',
  meta:{topic:'街頭警力、犯罪預防與再犯改造',summary:'作者完全反對增加街頭警力是唯一減罪方法。巡邏可阻止部分罪案，但教育、就業和心理支援可處理部分社會根源；改造與獲釋後指導則有助打破再犯循環。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
