const simple=[
  'Schools are often pushed to help students whose grades are low.',
  'Some people say schools should make students join activities after class, because this may help them feel more part of school and get better grades.',
  'I strongly disagree because making students join does not fix why they are doing badly and may make them want to learn less.',
  'The main problem is that this plan treats being there as the same thing as learning.',
  'Students with low grades may not need more time at school; they may need help with basic skills, study habits, confidence, or problems at home.',
  'For example, a student who cannot do basic algebra will not suddenly get better just by staying after school for an activity for everyone.',
  'He needs help with the exact subject, clear explanations, and regular advice on his work.',
  'If schools make these students join extra classes that do not help with what they cannot do, the plan may make life harder instead of helping them improve.',
  'Making students join after-school activities may also make them feel less connected to school, although the plan is meant to do the opposite.',
  'Many students with low grades already feel stressed, unsuccessful, or ashamed at school.',
  'Making them stay longer may feel like a punishment for low grades, so they may become angry and like learning even less.',
  'It would be better to give each student the help they need, a helpful adult, small study groups, and a real choice of activities outside lessons.',
  'When students feel the help is made for their needs, not forced on them, they are more likely to work on improving.',
  'In short, I strongly disagree that making students join after-school activities is the best way to help those with low grades.',
  'Students improve when schools find out exactly why they struggle and give them help that respects them, not just make them stay longer.',
];
const vocabulary=[
  [['under pressure','pushed','面對壓力'],['raise the performance','help','提升表現'],['pupils who fall behind academically','students whose grades are low','學業落後學生']],
  [['most effective solution','should','最有效方案'],['make after-school activities compulsory','make students join activities after class','強制參加課後活動'],['on the grounds that','because','理由是'],['pupils’ involvement in school','feel more part of school','學生的學校參與感'],['improve their grades','get better grades','改善成績']],
  [['completely disagree','strongly disagree','完全不同意'],['compulsory activities','making students join','強制活動'],['do not address the real causes of underachievement','does not fix why they are doing badly','未處理成績差的根因'],['weaken students’ motivation','make them want to learn less','削弱學習動機']],
  [['this proposal','this plan','這項建議'],['mistakes attendance for learning','treats being there as the same thing as learning','把出席當成學習']],
  [['Underachieving pupils','Students with low grades','成績較弱學生'],['not necessarily failing','may not need','未必因而落後'],['school premises','school','校園'],['weak foundations','help with basic skills','基礎薄弱'],['poor study habits','study habits','學習習慣差'],['low confidence','confidence','信心不足'],['difficulties at home','problems at home','家庭困難']],
  [['cannot understand basic algebra','cannot do basic algebra','不懂基本代數'],['will not suddenly improve','will not suddenly get better','不會突然進步'],['required to stay after school','staying after school','被要求放學後留下'],['general activity','activity for everyone','一般活動']],
  [['targeted academic support','help with the exact subject','針對性的學業支援'],['patient explanation','clear explanations','耐心講解'],['regular feedback','regular advice on his work','定期回饋']],
  [['force such pupils to attend','make these students join','強迫學生參加'],['extra sessions','extra classes','額外課程'],['learning gaps','what they cannot do','學習缺口'],['a burden rather than a bridge to progress','make life harder instead of helping them improve','負擔而非進步途徑']],
  [['Compulsory after-school activities','Making students join after-school activities','強制課後活動'],['damage','make them feel less','損害'],['the very engagement they are supposed to create','connected to school, although the plan is meant to do the opposite','反而破壞原本想建立的參與感']],
  [['Many weaker pupils','Many students with low grades','許多較弱學生'],['associate school with','feel','把學校聯想到'],['stress, failure, or embarrassment','stressed, unsuccessful, or ashamed','壓力失敗或尷尬']],
  [['Extending the school day by force','Making them stay longer','強行延長上學時間'],['punished for underperforming','punishment for low grades','因成績欠佳受罰'],['resentment','angry','怨氣'],['poorer attitudes towards learning','like learning even less','更差的學習態度']],
  [['A better approach','It would be better','更好的做法'],['personalised tutoring','help they need','個人化補習'],['mentoring','a helpful adult','導師輔導'],['smaller study groups','small study groups','較小學習小組'],['meaningful choices','a real choice','有意義的選擇'],['extracurricular programmes','activities outside lessons','課外活動']],
  [['support is designed for them','help is made for their needs','支援為他們而設'],['imposed on them','forced on them','強加於他們'],['take ownership of their progress','work on improving','主動為進步負責']],
  [['In conclusion','In short','總結'],['strongly disagree','strongly disagree','強烈不同意'],['compulsory after-school activities','making students join after-school activities','強制課後活動'],['underachieving pupils','those with low grades','學業落後學生']],
  [['Real improvement','Students improve','真正進步'],['diagnosing students’ specific problems','find out exactly why they struggle','找出學生具體問題'],['focused, respectful support','help that respects them','有重點且尊重學生的支援'],['forcing them to spend more time at school','make them stay longer','強迫延長留校時間']],
];
const chunkOverrides=[
  ['Schools are often under pressure','to raise the performance of pupils who fall behind academically.'],
  ['Some people argue that the most effective solution is to make after-school activities compulsory,','on the grounds that this will increase pupils’ involvement in school','and improve their grades.'],
  ['I completely disagree with this view','because compulsory activities do not address the real causes of underachievement','and may even weaken students’ motivation.'],
  ['The main problem with this proposal is','that it mistakes attendance for learning.'],
  ['Underachieving pupils are not necessarily failing because they spend too little time on school premises;','they may be struggling because they have weak foundations, poor study habits, low confidence, or difficulties at home.'],
  ['For example, a student who cannot understand basic algebra','will not suddenly improve simply because he is required to stay after school for a general activity.'],
  ['What he needs is targeted academic support,','patient explanation, and regular feedback.'],
  ['If schools force such pupils to attend extra sessions that do not directly solve their learning gaps,','the policy may become a burden rather than a bridge to progress.'],
  ['Compulsory after-school activities can also damage','the very engagement they are supposed to create.'],
  ['Many weaker pupils already associate school','with stress, failure, or embarrassment.'],
  ['Extending the school day by force may make them feel punished for underperforming,','which can lead to resentment and even poorer attitudes towards learning.'],
  ['A better approach would be to offer personalised tutoring, mentoring, smaller study groups,','and meaningful choices in extracurricular programmes.'],
  ['When pupils feel that support is designed for them rather than imposed on them,','they are more likely to take ownership of their progress.'],
  ['In conclusion, I strongly disagree that compulsory after-school activities','are the best way to help underachieving pupils.'],
  ['Real improvement comes from diagnosing students’ specific problems and giving them focused, respectful support,','not from forcing them to spend more time at school.'],
];
const simpleChunkOverrides=[
  ['Schools are often pushed','to help students whose grades are low.'],
  ['Some people say schools should make students join activities after class,','because this may help them feel more part of school','and get better grades.'],
  ['I strongly disagree','because making students join does not fix why they are doing badly','and may make them want to learn less.'],
  ['The main problem is','that this plan treats being there as the same thing as learning.'],
  ['Students with low grades may not need more time at school;','they may need help with basic skills, study habits, confidence, or problems at home.'],
  ['For example, a student who cannot do basic algebra','will not suddenly get better just by staying after school for an activity for everyone.'],
  ['He needs help with the exact subject,','clear explanations, and regular advice on his work.'],
  ['If schools make these students join extra classes that do not help with what they cannot do,','the plan may make life harder instead of helping them improve.'],
  ['Making students join after-school activities may also make them feel less connected to school,','although the plan is meant to do the opposite.'],
  ['Many students with low grades already feel','stressed, unsuccessful, or ashamed at school.'],
  ['Making them stay longer may feel like a punishment for low grades,','so they may become angry and like learning even less.'],
  ['It would be better to give each student the help they need, a helpful adult, small study groups,','and a real choice of activities outside lessons.'],
  ['When students feel the help is made for their needs, not forced on them,','they are more likely to work on improving.'],
  ['In short, I strongly disagree that making students join after-school activities','is the best way to help those with low grades.'],
  ['Students improve when schools find out exactly why they struggle and give them help that respects them,','not just make them stay longer.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Schools face pressure to improve the results of pupils who have fallen behind.','under pressure to 指承受改善成績的壓力；who 指明對象。','此句交代問題背景，尚未推薦任何方案。',[1,2,3],F('[學校] are often under pressure to [提升學業落後學生的表現]','先界定學校面對的問題。','要交代一項爭議的背景，先指出誰正面對甚麼壓力時。',[['Schools','slot','學校'],[' are often under pressure to ','link','經常面對壓力，要'],['raise the performance of pupils who fall behind academically.','slot','提升學業落後學生的表現']])),
  S('Some people say compulsory after-school activities will improve both participation and grades.','on the grounds that 陳述支持者的理由；兩個 will 串起參與感與成績。','作者此處報告別人的觀點，並未表示自己同意。',[0,2,11],F('Some people argue that [最有效的方案是強制課後活動], on the grounds that [可提高參與感] and [改善成績]','準確交代待回應的政策及其兩個預期結果。','要先陳述一方主張，以及他們認為政策為何有效時。',[['Some people argue that ','link','引入他人主張'],['the most effective solution is to make after-school activities compulsory','slot','最有效的方案是強制課後活動'],[', on the grounds that ','link','理由是'],['this will increase pupils’ involvement in school','slot','可提高參與感'],[' and ','link','而且'],['improve their grades.','slot','改善成績']])),
  S('I disagree because forced participation misses the causes of weak results and can reduce motivation.','because 後列兩條反對理由：根因未解決，以及動機可能下降。','may 表示可能性，不可改寫為每人必定更失去動機。',[1,3,8],F('I completely disagree with [此看法] because [強制活動未處理真正原因] and may even [削弱學生動機]','引言表明立場並預告兩段論證。','需要直接回答是否支持一項政策，並先列兩個不同反對理由時。',[['I completely disagree with ','link','表明反對'],['this view','slot','此看法'],[' because ','link','第一理由'],['compulsory activities do not address the real causes of underachievement','slot','強制活動未處理真正原因'],[' and may even ','link','還可能'],['weaken students’ motivation.','slot','削弱學生動機']])),
  S('The plan confuses being present with actually learning.','mistakes A for B 指誤把出席當成學習；此句點出政策的核心推論錯誤。','出席可能有用，但原文說單靠出席不能等同學習。',[2,4,8],F('The main problem with [建議] is that it mistakes [出席] for [學習]','直接指出政策把手段誤當成果。','要批評一項政策的核心假設，把兩件不同的事區分開時。',[['The main problem with ','link','指出核心問題'],['this proposal','slot','建議'],[' is that it mistakes ','link','在於把'],['attendance','slot','出席'],[' for ','link','誤當'],['learning.','slot','學習']])),
  S('Low grades may come from weak basics, habits, confidence, or home difficulties, rather than too little time at school.','not necessarily...; they may... 用分號拆開假設與多個替代原因。','may 不等於每名弱生都有全部四種困難。',[3,5,6],F('[學業落後學生] are not necessarily failing because [留校太少]; they may be struggling because [基礎、習慣、信心或家庭困難]','將表面時間問題轉向多種可能的學習根因。','當政策把問題歸於單一原因，須提出其他合理原因時。',[['Underachieving pupils','slot','學業落後學生'],[' are not necessarily failing because ','link','未必是因為'],['they spend too little time on school premises','slot','留校太少'],['; they may be struggling because ','link','反而可能因為'],['they have weak foundations, poor study habits, low confidence, or difficulties at home.','slot','基礎、習慣、信心或家庭困難']])),
  S('A child who cannot understand algebra will not improve just because they attend a general after-school activity.','For example 舉具體學科缺口；simply because 排除「多留校便進步」的推論。','例子否定的是一般活動足夠，並非否定所有課後支援。',[3,4,6],F('For example, [不懂基本代數的學生] will not suddenly improve simply because [參加一般課後活動]','用具體學科困難檢驗政策是否對症。','提出可能原因後，要用具體例子檢驗一項通用措施是否對症時。',[['For example, ','link','引出例子'],['a student who cannot understand basic algebra','slot','不懂基本代數的學生'],[' will not suddenly improve simply because ','link','不會只因'],['he is required to stay after school for a general activity.','slot','參加一般課後活動']])),
  S('He needs subject-specific help, patient explanation, and feedback.','What he needs is 轉到真正所需；三項支援都對應學習缺口。','不是把所有學生強迫參加相同一般活動。',[4,5,7],F('What [學生] needs is [針對性學業支援], [耐心講解], and [定期回饋]','把問題診斷轉成具體支援。','指出某人的具體困難後，要列出與困難直接相配的幫助時。',[['What ','link','指出真正所需'],['he','slot','學生'],[' needs is ','link','需要'],['targeted academic support','slot','針對性學業支援'],[', ','link','再加'],['patient explanation','slot','耐心講解'],[', and ','link','以及'],['regular feedback.','slot','定期回饋']])),
  S('Extra sessions that do not close learning gaps may become a burden rather than a route to progress.','If 設未對症的條件；may 和 rather than 說明可能的負面效果。','不是聲稱每種課後活動都必然有害。',[5,6,8],F('If [強制參加未能解決學習缺口的額外課程], [政策] may become [負擔] rather than [進步途徑]','推導未對症政策可能帶來的結果。','要說明一項介入在甚麼條件下會適得其反時。',[['If ','link','設定條件'],['schools force such pupils to attend extra sessions that do not directly solve their learning gaps','slot','強制參加未能解決學習缺口的額外課程'],[', ','link','便可能使'],['the policy','slot','政策'],[' may become ','link','變成'],['a burden','slot','負擔'],[' rather than ','link','而非'],['a bridge to progress.','slot','進步途徑']])),
  S('Forced activities can damage the engagement they were meant to create.','the very...they are supposed to create 強調結果與政策原意相反。','can 表可能，不表示所有活動都損害參與感。',[2,7,9],F('[強制課後活動] can also damage the very [參與感] they are supposed to create','指出一項政策可能破壞其自身目標。','要揭示措施的意外後果與原定目標正好相反時。',[['Compulsory after-school activities','slot','強制課後活動'],[' can also damage the very ','link','亦可能破壞原本欲建立的'],['engagement','slot','參與感'],[' they are supposed to create.','link','原本應建立']])),
  S('Many weaker pupils already connect school with stress, failure, or embarrassment.','associate A with B 說明部分學生本有負面感受，為後句受罰感鋪墊。','Many 不等於所有弱生。',[8,10,11],F('Many [較弱學生] already associate [學校] with [壓力、失敗或尷尬]','解釋強制措施為何可能影響動機。','要分析一項措施之前，先交代受影響者已有的心理感受時。',[['Many ','link','限定群體'],['weaker pupils','slot','較弱學生'],[' already associate ','link','早已把'],['school','slot','學校'],[' with ','link','聯想到'],['stress, failure, or embarrassment.','slot','壓力、失敗或尷尬']])),
  S('Forced longer days may feel punitive and may lead to resentment and worse attitudes to learning.','may...which can lead to... 保留兩層可能性：受罰感再引起怨氣與態度惡化。','不能寫成每個學生必然厭學。',[8,9,12],F('[強行延長上學時間] may make [學生] feel [因成績欠佳受罰], which can lead to [怨氣及更差的學習態度]','連結強制措施、主觀感受與學習態度。','要解釋政策如何透過人的感受產生間接後果時。',[['Extending the school day by force','slot','強行延長上學時間'],[' may make ','link','可能令'],['them','slot','學生'],[' feel ','link','覺得'],['punished for underperforming','slot','因成績欠佳受罰'],[', which can lead to ','link','繼而可能引起'],['resentment and even poorer attitudes towards learning.','slot','怨氣及更差的學習態度']])),
  S('Personal tutoring, mentoring, small groups and choices form a better approach.','A better approach would be to offer 用具體服務替換前述強制政策。','would be 說的是建議，文章未聲稱政策已實施。',[6,10,12],F('A better approach would be to offer [個人化補習、導師輔導、小組學習] and [課外活動的有意義選擇]','提出能對應學習缺口及自主感的替代方案。','批評一項政策後，要提供不同層面的可行替代措施時。',[['A better approach would be to offer ','link','提出替代方案'],['personalised tutoring, mentoring, smaller study groups','slot','個人化補習、導師輔導、小組學習'],[', and ','link','以及'],['meaningful choices in extracurricular programmes.','slot','課外活動的有意義選擇']])),
  S('Pupils are more likely to take charge of progress when support fits them rather than being imposed.','When...rather than... 對比為學生而設與強加於人；more likely 保留機率。','不是說自主選擇足以解決一切學業問題。',[10,11,14],F('When [學生感到支援為自己而設而非強加], they are more likely to [主動為進步負責]','解釋個人化及自主選擇為何可能增強投入。','要描述某種支援條件如何提高自主參與機會時。',[['When ','link','設定感受條件'],['pupils feel that support is designed for them rather than imposed on them','slot','學生感到支援為自己而設而非強加'],[', they are more likely to ','link','便較可能'],['take ownership of their progress.','slot','主動為進步負責']])),
  S('I strongly disagree that forced after-school activities are the best help for underachieving pupils.','In conclusion 重申反對的是「最佳方法」這項主張。','作者仍主張有針對性的支援及可選課外活動。',[2,11,14],F('In conclusion, I strongly disagree that [強制課後活動] are [幫助學業落後學生的最佳方法]','結論回應題目的最佳方案判斷。','兩條反對理由與替代方案完成後，要準確重申立場時。',[['In conclusion, I strongly disagree that ','link','總結反對'],['compulsory after-school activities','slot','強制課後活動'],[' are ','link','是'],['the best way to help underachieving pupils.','slot','幫助學業落後學生的最佳方法']])),
  S('Real progress needs a diagnosis and focused support, not longer compulsory time at school.','comes from...not from... 對比真正改善來源與作者反對的做法。','此句不是反對學生任何時候在校，只反對以強制延長時間替代對症支援。',[3,6,13],F('[真正進步] comes from [診斷具體問題並提供有重點及尊重的支援], not from [強迫延長留校時間]','以對症支援與單純增加時間作結尾對照。','結論要回扣政策根本錯誤，並指出有效替代原則時。',[['Real improvement','slot','真正進步'],[' comes from ','link','源於'],['diagnosing students’ specific problems and giving them focused, respectful support','slot','診斷具體問題並提供有重點及尊重的支援'],[', not from ','link','而非'],['forcing them to spend more time at school.','slot','強迫延長留校時間']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否贊成強制學業落後學生參加課後活動？',['完全反對：強制參加未必處理學習根因，也可能削弱動機','完全贊成：留校時間必然直接改善成績','只贊成把所有學生的活動選擇取消','沒有立場，只說學校承受壓力'],'I completely disagree；do not address...causes；may even weaken motivation。'),
  {type:'multi',prompt:'選出兩條不同的主體論證',detail:'選兩項，再按「確認」。',options:['出席不等於學習；弱生成績可能源於基礎、習慣、信心或家庭困難','強制延長留校可能令人感到受罰，損害原本想建立的參與感','所有課後活動都必然令每名學生厭學','只要留校夠久，任何學習缺口都必然消失'],correct:[0,1],why:'第一段批評政策未對症，第二段批評它可能削弱參與感與動機。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 明確反對','強制活動不能處理學業落後根因，亦可能削弱動機。'],
  ['主體段一 · 出席不等於學習','學生可能有具體學科及生活困難，需針對性講解與回饋。'],
  ['主體段二 · 強制可能適得其反','受罰感或減少投入；個人化支援與有意義選擇較合適。'],
  ['結論 · 對症與尊重','真正進步來自診斷問題和有重點的支援，不是單純延長留校。'],
],'政策主張 → 未對症 → 可能損動機 → 對症支援。')];
const evidence=[
  Q('作者說這項政策把甚麼誤當成甚麼？',['把出席誤當成真正學習','把補習誤當成交通服務','把學習誤當成短假期','把導師輔導誤當成考試'],'mistakes attendance for learning 是主體段一的中心批評。'),
  Q('文章列出哪些可能造成學業落後的原因？',['基礎薄弱、習慣差、信心不足或家中困難','全部學生都只因放學太早','只因課外活動太少，與學科無關','全部學生都因不喜歡代數'],'not necessarily failing because...；they may be struggling because...。'),
  Q('基礎代數例子說明甚麼？',['一般活動及更多留校時間不會自動解決具體學科缺口','所有學生都必須只學代數','代數與成績從來沒有關係','任何課後講解都必然無用'],'作者否定不對症的一般活動，而非所有課後支援。'),
  Q('對這名不懂代數的學生，作者提出甚麼支援？',['針對性學業支援、耐心講解與定期回饋','只強迫他延長在校時間','只增加一般體育活動，並取消講解','讓他永不接觸代數'],'targeted academic support, patient explanation, and regular feedback。'),
  Q('強制延長留校為何可能損害學習態度？',['學生可能感到因低成績受罰，產生怨氣','因所有學生都必然熱愛被強迫','因活動選擇可直接消除所有壓力','因學校從不影響學生情緒'],'受罰感 → 怨氣 → 可能有更差的學習態度。'),
  Q('替代方案除了補習還包括甚麼？',['導師輔導、小型學習小組及有意義的課外活動選擇','取消所有師生接觸','每名學生都參加同一活動且不准選擇','只把每名學生留校時間加倍'],'文章兼顧學科支援與自主選擇。'),
];
const logic=[
  sequence('第一主體段：為何強制出席未必改善成績？',[
    ['核心誤判','政策把出席誤當成學習。'],
    ['診斷根因','弱生可能有基礎、習慣、信心或家庭困難。'],
    ['代數例子','一般課後活動不能自動解決代數缺口。'],
    ['所需支援','應提供針對性幫助、耐心解釋及定期回饋。'],
    ['可能後果','未對症的強制課程或成負擔而非進步途徑。'],
  ],'出席不是學習 → 成績差有不同根因 → 一般活動未對症 → 需要具體支援。'),
  sequence('第二主體段：參與感與替代方案如何相連？',[
    ['政策反效果','強制活動或破壞原本想建立的參與感。'],
    ['已有感受','許多弱生本來把學校聯想到壓力、失敗與尷尬。'],
    ['被罰感','強留校可能令人覺得因成績差受罰，引起怨氣。'],
    ['替代措施','個人化補習、導師、小組及活動選擇。'],
    ['自主參與','支援為學生而設時，他們較可能主動為進步負責。'],
  ],'強制或損投入 → 學生有負面經驗 → 受罰感加重 → 針對性且尊重的支援。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一間學校想強迫低分學生每天留校兩小時，卻未先查出各人的困難。','哪項最符合文章的第一條反對理由？',['增加出席時間不能代替診斷及解決學習缺口','所有低分學生都只需多留校','任何額外支援都必然有害','家庭問題絕不會影響學習'],['作者區分 attendance 與 learning。','時間未必是根因。','作者支持針對性支援。','原文列家庭困難。'],[3,4,7],'mistakes attendance for learning；learning gaps。'),
  T('兩名學生同樣低分：一人不懂代數，另一人因家中困難無法專心。','學校應先做甚麼？',['了解各自的具體原因，再安排相應支援','不問原因，只把兩人放進同一一般活動','假定兩人的困難完全相同','把出席紀錄直接當作學習成果'],['不同根因需不同支援。','一般活動未必對症。','原文列多種可能原因。','出席不等於學習。'],[4,5,6,14],'weak foundations...difficulties at home；targeted academic support。'),
  T('一名學生不懂分數，學校只要求他參加一般課後遊戲。','文章的代數例子如何轉用？',['一般活動未必填補具體學科缺口，他需要有針對性的講解','遊戲時間一增加，分數必然自動學會','該學生必然不適合任何課後支援','學校應取消所有回饋'],['代數例子檢驗活動是否對應所缺知識。','沒有必然效果。','針對性支援仍有用。','原文要求 regular feedback。'],[5,6,7],'basic algebra；targeted academic support。'),
  T('一項課後課程有清楚學科講解、個人回饋，亦允許學生選擇。','作者會如何看待它？',['這較接近對症且尊重學生的支援，不能一概等同他反對的強制一般活動','只要在放學後舉行，作者必定反對','作者只支持在校延長時間，反對任何講解','有選擇會必然降低所有成績'],['文章反對不對症的強制方案，支持講解、回饋與選擇。','不是所有課後活動都被否定。','原文支持講解。','未有此必然性。'],[5,6,7,11,12],'targeted academic support；meaningful choices。'),
  T('弱生本來因成績差在校感到尷尬，現在又被要求每天強制留校。','哪條心理路徑最符合原文？',['被留校可能像受罰，產生怨氣並使學習態度變差','被迫留校必然消除尷尬及壓力','尷尬必然代表學生不想學','所有學生都會以相同方式反應'],['原文由既有負面感受推到可能的受罰感。','文章說可能反效果。','不能由尷尬推斷不願學。','Many/may 不等於所有。'],[9,10],'stress, failure, or embarrassment；feel punished。'),
  T('市政府以「強制參加」提升青年對公共圖書館的興趣，但青年覺得自己被控制。','可轉用文章哪個推理？',['政策可能破壞它本想建立的參與感，應考慮有意義的選擇','強制參加必然提高所有人的投入','參與感只能用出席次數衡量','只要有場所，便不需理會使用者感受'],['the very engagement...supposed to create 是可轉用的意外後果論。','can 並非必然提高。','出席與投入不同。','文章重視主觀感受。'],[3,8,11,12],'damage the very engagement they are supposed to create。'),
  T('補習中心比較兩個方案：統一課程，或先診斷每人的學習缺口再分組。','哪項符合本文的解方？',['先診斷缺口，提供針對性講解、小組與回饋','只按留在中心的時數評估學習','所有學生的需要必定相同','學生只需出席，不需理解內容'],['本文重視 diagnosis、targeted support、small groups、feedback。','出席不等於學習。','根因可不同。','理解是學習的一部分。'],[3,4,6,11,14],'diagnosing students’ specific problems；smaller study groups。'),
  T('有人轉述文章：「作者認為強制活動一定令每個學生更討厭學校。」','哪項更準確？',['作者說它可能削弱動機及參與感，沒有聲稱每名學生必然如此','完全準確，因 can 和 may 都表示必然','作者說它一定改善成績','作者完全沒有討論動機'],['原文以 may/can 限定可能性。','may/can 非必然。','作者反對此保證。','動機是第二理由。'],[2,8,10],'may even weaken；can also damage。'),
  T('一所學校準備改進幫助落後學生的政策，仍保留學生自願參加的藝術社團。','文章容許哪個區分？',['反對強制且不對症的安排，同時可支持有意義的課外活動選擇','作者要求取消一切藝術社團','只要活動自願，就必然解決代數缺口','作者認為任何選擇都會削弱責任感'],['作者明確支持 meaningful choices in extracurricular programmes。','原文沒有取消社團。','自願不能代替學科支援。','選擇與主動負責相連。'],[7,11,12],'meaningful choices in extracurricular programmes。'),
  T('一個學生覺得導師計畫按他的弱項設計，並讓他參與安排。','文章預期甚麼較可能發生？',['他較可能主動為自己的進步負責','他必然即時取得滿分','他因受尊重而必然不再需要教學','他一定會拒絕參加所有活動'],['When...more likely 指可能較願意主動投入。','沒有保證滿分。','仍需要支援。','原文預期較多投入。'],[11,12],'more likely to take ownership of their progress。'),
  T('有人提出「所有低分學生都該被留下，因為留校時間越長，學習一定越好」。','哪項最直接指出論證缺口？',['先證明留下的活動能處理學習原因；出席本身不能證明學會','只需證明課室有足夠座位','只需延長時間，不必考慮內容','任何較長課程都必然更有效'],['作者要求從學習缺口而非出席時間評估方案。','座位不是學習成效。','內容須對症。','原文反對此必然推論。'],[3,4,5,7],'mistakes attendance for learning。'),
  T('要用一句話準確概括全文的政策建議。','哪項最好？',['反對把強制課後活動視為最佳方案，主張診斷根因並提供有重點且尊重學生的支援','所有課後活動都應永久取消','學生只需更多在校時間，不需任何具體支援','低成績只能由學生自己負責，學校不應協助'],['結論明確對比對症支援與強制延長留校。','原文支持有意義的課外選擇。','作者反對時間代替支援。','作者提出學校支援責任。'],[2,6,11,12,13,14],'Real improvement comes from diagnosing...not from forcing them to spend more time at school。'),
];
export default {
  key:'opinion:41',
  meta:{topic:'學業落後學生、強制課後活動與對症支援',summary:'作者完全反對把強制參加課後活動當作改善弱生成績的最佳方法。出席不能代替學習：學生可能有學科、習慣、信心或家庭方面的具體困難，需要針對性講解及回饋。強制延長留校又可能令人感到受罰，削弱投入；作者建議個人化支援與有意義的活動選擇。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
