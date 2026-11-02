const simple=[
  'People often say doctors should teach patients how to stay healthy and become healthier.',
  'I strongly agree because health advice works best when it is useful for real life, suited to the person, and comes from someone the patient already trusts.',
  'First, doctors can take general health facts and give advice that fits a particular person.',
  'Many people know they should eat healthy food, exercise often, and avoid things that harm them, but these broad messages may seem unclear and easy to forget.',
  'A doctor, though, can show a patient how these habits affect their own health problem.',
  'For example, someone with high blood pressure may not realise why eating too much salt is dangerous until a doctor explains its effect on the heart and the tubes that carry blood.',
  'At that point, the lesson is more than a fact; it makes the person understand that they need to act.',
  'When advice is connected to a real health danger, patients are more likely to listen carefully and change what they do.',
  'Second, teaching patients can stop later illness and leave less work for medical services.',
  'If doctors wait until people are sick before helping, care becomes a repeated process of fixing problems instead of stopping them early.',
  'By teaching people the first signs of trouble, healthy daily habits, and what can happen if small symptoms are ignored, doctors can help them avoid bigger problems later.',
  'For example, someone who learns to manage weight, sleep, and stress may have a lower chance of getting illnesses that last a long time, such as diabetes or heart disease.',
  'This can help each person stay well and also leave more time and money in hospitals and clinics for patients who need care quickly.',
  'In short, I fully agree that doctors should teach patients how to become healthier.',
  'People trust their advice, it fits each patient, and it may change lives, so teaching about health should be a main part of medical care, not an extra task.',
];
const vocabulary=[
  [['It is often argued','People often say','人們經常主張'],['ought to take responsibility','should','應承擔責任'],['teaching patients','teach patients','教導病人'],['protect and improve their health','stay healthy and become healthier','保護及改善健康']],
  [['completely agree','strongly agree','完全同意'],['medical advice','health advice','醫療建議'],['most effective','works best','最有效'],['practical','useful for real life','實用'],['personal','suited to the person','個人化'],['whom patients already trust','the patient already trusts','病人已信任']],
  [['first reason','First','第一原因'],['in the best position','can','最有能力'],['general health knowledge','general health facts','一般健康知識'],['specific guidance','advice that fits a particular person','具體指導']],
  [['eat well','eat healthy food','健康飲食'],['exercise regularly','exercise often','定期運動'],['avoid harmful habits','avoid things that harm them','避免有害習慣'],['vague','unclear','模糊'],['easy to ignore','easy to forget','容易忽視']],
  [['however','though','然而'],['connect these habits directly','show a patient how these habits affect','直接聯繫習慣'],['patient’s condition','their own health problem','病人病情']],
  [['a patient with high blood pressure','someone with high blood pressure','高血壓病人'],['salty diet','eating too much salt','高鹽飲食'],['the danger','is dangerous','危險'],['blood vessels','tubes that carry blood','血管']],
  [['In that moment','At that point','在那一刻'],['education','the lesson','教育'],['not just information','more than a fact','不只是資訊'],['wake-up call','makes the person understand that they need to act','警醒']],
  [['linked to a real medical risk','connected to a real health danger','與真實醫療風險相連'],['more likely to take it seriously','more likely to listen carefully','更可能認真對待'],['change their behaviour','change what they do','改變行為']],
  [['Another important reason','Second','另一重要原因'],['patient education','teaching patients','病人教育'],['prevent future illness','stop later illness','預防未來疾病'],['reduce pressure on the healthcare system','leave less work for medical services','減輕醫療系統壓力']],
  [['only treat diseases after they appear','wait until people are sick before helping','只在患病後治療'],['cycle of repair','repeated process of fixing problems','修補循環'],['rather than prevention','instead of stopping them early','而非預防']],
  [['early warning signs','first signs of trouble','早期警號'],['healthy routines','healthy daily habits','健康日常習慣'],['consequences','what can happen','後果'],['neglecting minor symptoms','small symptoms are ignored','忽視輕微症狀'],['serious problems later','bigger problems later','日後嚴重問題']],
  [['For instance','For example','例如'],['manage weight, sleep, and stress','manage weight, sleep, and stress','管理體重睡眠壓力'],['less likely','lower chance','較低可能'],['long-term conditions','illnesses that last a long time','長期疾病']],
  [['not only improves individual well-being','help each person stay well','改善個人福祉'],['allows hospitals and clinics','leave more time and money in hospitals and clinics','讓醫院診所有資源'],['focus more resources','more time and money','集中更多資源'],['urgently need treatment','need care quickly','迫切需要治療']],
  [['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['educate patients','teach patients','教育病人'],['improving their health','become healthier','改善健康']],
  [['guidance','advice','指導'],['trusted','People trust','值得信任'],['personalised','fits each patient','個人化'],['potentially life-changing','may change lives','可能改變人生'],['core part of medical care','main part of medical care','醫療核心部分'],['optional extra','extra task','可有可無附加項']],
];
const chunkOverrides=[
  ['It is often argued that doctors ought to take responsibility','for teaching patients how to protect and improve their health.'],
  ['I completely agree with this view,','because medical advice is most effective when it is practical, personal, and given by someone whom patients already trust.'],
  ['The first reason is that doctors are in the best position','to turn general health knowledge into specific guidance.'],
  ['Many people already know that they should eat well, exercise regularly, and avoid harmful habits,','but such advice can feel vague and easy to ignore.'],
  ['A doctor, however, can connect these habits','directly to a patient’s condition.'],
  ['For example, a patient with high blood pressure may not understand the danger of a salty diet','until a doctor explains how it affects the heart and blood vessels.'],
  ['In that moment, education is not just information;','it becomes a wake-up call.'],
  ['When advice is linked to a real medical risk,','patients are more likely to take it seriously and change their behaviour.'],
  ['Another important reason is that patient education can prevent future illness','and reduce pressure on the healthcare system.'],
  ['If doctors only treat diseases after they appear,','medicine becomes a cycle of repair rather than prevention.'],
  ['By explaining early warning signs, healthy routines, and the consequences of neglecting minor symptoms,','doctors can help patients avoid serious problems later.'],
  ['For instance, a person who is taught how to manage weight, sleep, and stress','may be less likely to develop long-term conditions such as diabetes or heart disease.'],
  ['This not only improves individual well-being,','but also allows hospitals and clinics to focus more resources on patients who urgently need treatment.'],
  ['In conclusion, I fully agree','that doctors should educate patients about improving their health.'],
  ['Their guidance is trusted, personalised, and potentially life-changing,','so health education should be seen as a core part of medical care rather than an optional extra.'],
];
const simpleChunkOverrides=[
  ['People often say doctors should teach patients','how to stay healthy and become healthier.'],
  ['I strongly agree','because health advice works best when it is useful for real life, suited to the person, and comes from someone the patient already trusts.'],
  ['First, doctors can take general health facts','and give advice that fits a particular person.'],
  ['Many people know they should eat healthy food, exercise often, and avoid things that harm them,','but these broad messages may seem unclear and easy to forget.'],
  ['A doctor, though, can show a patient','how these habits affect their own health problem.'],
  ['For example, someone with high blood pressure may not realise why eating too much salt is dangerous','until a doctor explains its effect on the heart and the tubes that carry blood.'],
  ['At that point, the lesson is more than a fact;','it makes the person understand that they need to act.'],
  ['When advice is connected to a real health danger,','patients are more likely to listen carefully and change what they do.'],
  ['Second, teaching patients can stop later illness','and leave less work for medical services.'],
  ['If doctors wait until people are sick before helping,','care becomes a repeated process of fixing problems instead of stopping them early.'],
  ['By teaching people the first signs of trouble, healthy daily habits, and what can happen if small symptoms are ignored,','doctors can help them avoid bigger problems later.'],
  ['For example, someone who learns to manage weight, sleep, and stress','may have a lower chance of getting illnesses that last a long time, such as diabetes or heart disease.'],
  ['This can help each person stay well','and also leave more time and money in hospitals and clinics for patients who need care quickly.'],
  ['In short, I fully agree','that doctors should teach patients how to become healthier.'],
  ['People trust their advice, it fits each patient, and it may change lives,','so teaching about health should be a main part of medical care, not an extra task.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('It is often argued that teachers ought to take responsibility for showing pupils how to study independently.','It is often argued that 呈現待回應的主張；ought to 指責任。','這句是題目觀點，作者立場在下一句。',[1,2,13],F('It is often argued that [角色] ought to take responsibility for [教育任務]','先清楚交代誰應負責教導甚麼。','題目詢問某職業是否應承擔教育責任時。',[['It is often argued that ','link','引述主張'],['doctors','slot','角色'],[' ought to take responsibility for ','link','應負責'],['teaching patients how to protect and improve their health.','slot','教育任務']])),
  S('I completely agree with this view, because study advice is most effective when it is practical, personal, and offered by a trusted teacher.','because 後不是泛泛說「好」，而是列實用、個人化、可信任三個條件。','作者說最有效的條件，並非每句醫囑都必然奏效。',[0,3,8],F('I completely agree with this view, because [建議] is most effective when it is [三項條件]','表態後預告建議為何能發揮作用。','要支持一種專業教育責任時，先交代建議有效所需的條件。',[['I completely agree with this view, because ','link','表明同意及原因'],['medical advice','slot','建議'],[' is most effective when it is ','link','在以下條件最有效'],['practical, personal, and given by someone whom patients already trust.','slot','三項條件']])),
  S('The first reason is that teachers are in the best position to turn broad study advice into a plan for a particular pupil.','turn...into... 說明專業人士能把一般知識轉化為個別指導。','作者不是單說醫生知識多，而是強調個人化。',[1,3,4],F('The first reason is that [專業人士] are in the best position to turn [一般知識] into [具體指導]','提出首項原因及其轉化機制。','一般性資訊人人都可讀到，需要說明專業人士的額外價值時。',[['The first reason is that ','link','首項原因'],['doctors','slot','專業人士'],[' are in the best position to turn ','link','能轉化'],['general health knowledge','slot','一般知識'],[' into ','link','成為'],['specific guidance.','slot','具體指導']])),
  S('Many people already know that they should revise regularly, but such advice can feel vague and easy to ignore.','but 將大家都知道的規則與實際難以採用的問題對照。','知道原則並不等於知道如何應用。',[2,4,7],F('Many people already know that they should [一般建議], but such advice can feel [抽象問題]','指出為何普及資訊仍不足以促成行動。','要解釋為何一條人人知道的建議仍可能被忽視時。',[['Many people already know that they should ','link','已知道一般建議'],['eat well, exercise regularly, and avoid harmful habits','slot','一般建議'],[', but such advice can feel ','link','但仍可能'],['vague and easy to ignore.','slot','抽象問題']])),
  S('A tutor, however, can connect these habits directly to a pupil’s weak areas.','however 對照一般訊息，直接連到受眾的具體情況。','這是個人化指導，不是另一句空泛口號。',[2,3,5],F('A [專業人士], however, can connect [一般習慣] directly to [個人情況]','提出專業人士如何克服前句的含糊。','已指出一般建議太空泛，需要示範如何連到個人處境時。',[['A ','link','提出人物'],['doctor','slot','專業人士'],[', however, can connect ','link','轉折並連結'],['these habits','slot','一般習慣'],[' directly to ','link','直接對照'],['a patient’s condition.','slot','個人情況']])),
  S('For example, a pupil may not understand the danger of poor sleep until a teacher explains how tiredness affects concentration.','not...until... 說明個人化解釋讓原本抽象的危險變得明白。','例子重在解釋與認知轉變，並非醫生憑一句話治癒高血壓。',[4,6,7],F('For example, [人物] may not understand [風險] until [專業人士] explains [個人影響]','用具體個案展示知識如何轉為可感受的警醒。','一般建議仍抽象時，要給出「直到有人解釋」的轉變時刻。',[['For example, ','link','引出例子'],['a patient with high blood pressure','slot','人物'],[' may not understand ','link','原本不明白'],['the danger of a salty diet','slot','風險'],[' until ','link','直到'],['a doctor','slot','專業人士'],[' explains ','link','解釋'],['how it affects the heart and blood vessels.','slot','個人影響']])),
  S('In that moment, guidance is not just information; it becomes a reason to act.','not just...; it becomes... 把資訊的功能提升為行動警醒。','不是說資訊本身沒有價值，而是資訊變得與個人相關。',[5,7,8],F('In that moment, [教育] is not just [資訊]; it becomes [行動警醒]','總結個人化解釋帶來的認知變化。','例子呈現一個理解轉折後，需要用短句點明其意義時。',[['In that moment, ','link','承接轉折時刻'],['education','slot','教育'],[' is not just ','link','不只是'],['information','slot','資訊'],['; it becomes ','link','也變成'],['a wake-up call.','slot','行動警醒']])),
  S('When study advice is linked to a pupil’s actual difficulty, pupils are more likely to act on it.','When 設個人連結條件；more likely 表示機率，而非保證。','作者沒有保證每位病人聽完必然改變。',[4,6,8],F('When [建議] is linked to [真實風險], [受眾] are more likely to [行動]','從個案抽出可轉用的說服機制。','要說明一條建議為何在與個人處境連結後更可能被採納時。',[['When ','link','設定條件'],['advice','slot','建議'],[' is linked to ','link','連到'],['a real medical risk','slot','真實風險'],[', ','link','則'],['patients','slot','受眾'],[' are more likely to ','link','更可能'],['take it seriously and change their behaviour.','slot','行動']])),
  S('Another important reason is that teaching safe road habits can prevent injuries and reduce pressure on emergency teams.','第二理由由個人理解轉到未來風險與系統負擔。','不是重複前段「醫生較受信任」的原因。',[2,7,9],F('Another reason is that [教育] can prevent [未來問題] and reduce pressure on [系統]','提出與首段不同的預防與資源理由。','第二段要由個人的即時理解轉向較長期公共效益時。',[['Another important reason is that ','link','提出另一理由'],['patient education','slot','教育'],[' can prevent ','link','能預防'],['future illness','slot','未來問題'],[' and reduce pressure on ','link','並減輕'],['the healthcare system.','slot','系統']])),
  S('If teachers only treat reading problems after they appear, support becomes a cycle of repair rather than prevention.','If 設只作事後反應；rather than 指出補救與預防的差異。','原文不是要求停止治病，而是反對只等患病後才處理。',[8,10,12],F('If [角色] only treat [問題] after they appear, [服務] becomes a cycle of repair rather than prevention','用事後反應的反面情境解釋預防的必要。','有人只重視補救而忽略提前教導時，要指出這種模式的循環。',[['If ','link','設事後反應'],['doctors','slot','角色'],[' only treat ','link','只治療'],['diseases','slot','問題'],[' after they appear, ','link','出現後'],['medicine','slot','服務'],[' becomes a cycle of repair rather than prevention.','link','修補而非預防']])),
  S('By explaining early warning signs and the cost of delay, engineers can help residents avoid larger problems.','By explaining... 列教育內容；主句給出避免較大後果的目的。','這不是說教育能保證沒有任何未來疾病。',[8,9,11],F('By explaining [早期警號與忽視後果], [專業人士] can help [人們] avoid [日後嚴重問題]','說明專業教育具體教甚麼以及要避免甚麼。','提出預防理由後，需要把「教育」拆成可傳授的內容時。',[['By explaining ','link','透過解釋'],['early warning signs, healthy routines, and the consequences of neglecting minor symptoms','slot','教育內容'],[', ','link','使'],['doctors','slot','專業人士'],[' can help ','link','可幫助'],['patients','slot','人們'],[' avoid ','link','避免'],['serious problems later.','slot','日後嚴重問題']])),
  S('For instance, a pupil taught to manage revision, sleep and stress may be less likely to develop long-term learning difficulties.','may be less likely 保留風險下降的分寸；例子具體列三項可管理習慣。','並非學會管理習慣後必然不患病。',[10,12,13],F('For instance, [學會管理多項習慣的人] may be less likely to develop [長期問題]','用一個可想像的人解釋早期教導與長期風險。','說明預防教育後，要以人物與較長期結果具體支持時。',[['For instance, ','link','引出例子'],['a person who is taught how to manage weight, sleep, and stress','slot','學會管理多項習慣的人'],[' may be less likely to develop ','link','可能較不會出現'],['long-term conditions such as diabetes or heart disease.','slot','長期問題']])),
  S('This not only improves student confidence, but also allows schools to focus more resources on pupils who urgently need help.','not only...but also... 並列個人和服務系統兩種好處。','作者未說醫院因教育而完全沒有病人。',[8,10,11],F('This not only improves [個人], but also allows [機構] to focus more resources on [急需支援者]','將預防教育的個人效益連到資源分配。','提出某措施幫到個人後，要補充它如何釋放資源幫助急需者時。',[['This not only improves ','link','不只改善'],['individual well-being','slot','個人'],[', but also allows ','link','也讓'],['hospitals and clinics','slot','機構'],[' to focus more resources on ','link','更集中資源於'],['patients who urgently need treatment.','slot','急需支援者']])),
  S('In conclusion, I fully agree that teachers should educate pupils about improving study habits.','In conclusion 重申同意，且直接回答誰應教導甚麼。','結論沒有改為「部分同意」或轉到別人責任。',[0,1,14],F('In conclusion, I fully agree that [角色] should educate [對象] about [改善目標]','在結論直接回到題目的責任分配。','全文支持某角色承擔教育責任時，結尾須重申清楚。',[['In conclusion, I fully agree that ','link','總結立場'],['doctors','slot','角色'],[' should educate ','link','應教育'],['patients','slot','對象'],[' about ','link','關於'],['improving their health.','slot','改善目標']])),
  S('Their advice is trusted, personal, and useful, so teaching should be seen as a core part of school support rather than an optional extra.','so 將三項已論特性推到制度地位；rather than 排除「額外工作」。','作者沒有要求醫生只做教育而停止治療。',[1,8,13],F('[指導] is [三項價值], so [教育] should be seen as a core part of [服務] rather than an optional extra','以已論優勢推導教育應在專業服務中佔核心位置。','結尾要從個別效果進一步指出一項工作應否成為正式職責時。',[['Their guidance','slot','指導'],[' is ','link','具有'],['trusted, personalised, and potentially life-changing','slot','三項價值'],[', so ','link','因此'],['health education','slot','教育'],[' should be seen as a core part of ','link','應是核心部分'],['medical care','slot','服務'],[' rather than an optional extra.','link','而非附加項']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意醫生應教育病人改善健康？',['完全同意；醫生能提供實用、個人化且可信任的指導','完全反對；醫生應只開藥','沒有立場；只談醫院收費','部分同意；只支持病人看廣告'],'引言用 completely agree，並列三項指導特質。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['醫生可把一般知識連到個別病情，促使病人認真採用','教育可預防未來疾病，並讓資源集中幫助急需治療者','每位病人聽完建議後必定立即改變','醫生教育病人便毋須再提供任何治療'],correct:[0,1],why:'首段論個人化與採用；次段論預防與系統資源。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 完全同意','醫生提供實用、個人化且受信任的建議。'],
  ['主體一 · 從一般到個人','高血壓與高鹽飲食的例子展示個人化解釋如何成為警醒。'],
  ['主體二 · 從治療到預防','教育早期警號與生活習慣，可能減少未來疾病及醫療負擔。'],
  ['結論 · 正式職責','健康教育應是醫療照護的核心，而非可有可無的附加工作。'],
],'一般健康知識 → 個人化解釋 → 行為改變 → 預防與資源效益。')];
const evidence=[
  Q('一般健康建議為何可能被忽略？',['大家雖知原則，但內容可能太空泛，未連到自身病情','因為每人都已患嚴重疾病','因為醫生不懂個人化指導','因為運動必然有害'],'vague and easy to ignore 與醫生的具體解釋形成對照。'),
  Q('高血壓病人的例子中，醫生解釋甚麼？',['高鹽飲食對心臟及血管的影響','醫院的建築設計','病人的工作收入','各種運動器材的價格'],'原文說 how it affects the heart and blood vessels。'),
  Q('「wake-up call」在這段有甚麼功能？',['把已聽過的資訊變成與自己風險有關的警醒','表示病人必須聽到鬧鐘','表示教育只是一份資料','表示病人一定立即痊癒'],'不是資訊量增加，而是個人相關性增加。'),
  Q('只在疾病出現後治療會形成甚麼模式？',['反覆修補問題，缺少預防','所有疾病立即消失','完全不用醫院資源','每位病人都能自行診斷'],'cycle of repair rather than prevention。'),
  Q('醫生可教病人哪些預防內容？',['早期警號、健康習慣與忽視輕微症狀的後果','只教醫院導航','只討論昂貴藥物','只給沒有解釋的清單'],'By explaining 後列三類。'),
  Q('病人教育對醫院與診所有甚麼潛在好處？',['可把更多資源集中於迫切需要治療的病人','使所有診所永遠關閉','讓醫生永不需要治病','保證任何人不患長期病'],'not only individual well-being, but also resource focus。'),
];
const logic=[
  sequence('第一主體段：一般建議如何變成可採用的指導？',[
    ['首項理由','醫生能把一般健康知識轉成個別指導。'],
    ['原有問題','人人知道飲食與運動原則，但空泛建議容易忽視。'],
    ['醫生角色','把習慣直接連到病人的實際病情。'],
    ['具體例子','高血壓病人明白高鹽飲食如何影響心血管。'],
    ['結果','資訊成為警醒，病人更可能認真採用。'],
  ],'一般知識太空泛 → 連到個人風險 → 警醒 → 更可能改變。'),
  sequence('第二主體段：教育如何改變醫療負擔？',[
    ['另一理由','病人教育可預防未來疾病與系統壓力。'],
    ['反面情況','只在患病後治療會成為反覆修補。'],
    ['教育內容','早期警號、健康習慣、忽視小症狀的後果。'],
    ['人物例子','管理體重、睡眠和壓力可能減少長期疾病風險。'],
    ['雙重效益','個人福祉改善，醫療資源也可集中急需病人。'],
  ],'及早教導 → 可能減少長期問題 → 釋放急症資源。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('學生都知道「要多閱讀」，卻不知道怎樣改善自己讀不懂的文章。','哪種教師指導最像文中的醫生角色？',['先找失分文章類型，再教可實行的閱讀方法','再說多閱讀，但不查他在哪類文章失分','先給全班口號，個別理解問題可後處理','先買更多練習書，不教如何分析讀不懂處'],['把一般知識轉為個人可用的指導。','口號沒有指出失分位置。','全班原則不處理此人困難。','練習書不等於有方法。'],[2,3,4],'general knowledge into specific guidance。'),
  T('一位財務顧問告訴客戶「少花錢」，客戶仍沒有改變。','如何轉用第一段的說服機制？',['把少花錢連到客戶實際支出與個人風險','重複少花錢，實際支出可留給客戶自查','先責怪客戶，再用通用表格記錄收支','寄理財海報，不說習慣怎樣造成風險'],['個人相關性可令建議更值得重視。','通用口號未連到實際收支。','責怪不如分析支出風險。','海報未必令客戶理解處境。'],[3,4,5,6,7],'connect these habits to a patient’s condition。'),
  T('醫生向病人解釋一項習慣可能傷害自身健康。','哪項表述最符合文章的分寸？',['個別解釋或促進改變，但不能保證人人照做','病人聽過一次，便可減少後續追蹤討論','強烈警告可吸引注意，不需個人化解釋','個人風險說清後，行為改變可留待日後'],['more likely 表示機率，不是必然。','一次解釋不能保證行為變化。','恐嚇不能替代可信個別說明。','仍應追蹤是否改變。'],[5,6,7],'more likely to take it seriously。'),
  T('某城市只在橋樑損壞後搶修，從不教居民辨認早期危險。','哪項推理最像第二段？',['教人辨早期警號，減少只靠事後搶修','橋壞後搶修較直接，早期警號可略過','教居民橋名即可，不必說明危險徵兆','預防教育有用，便可減少必要搶修準備'],['早期教育與事後修補形成對照。','搶修不取代早期辨認。','名字不是風險徵兆。','教育後仍要保留應急能力。'],[8,9,10],'cycle of repair rather than prevention。'),
  T('學校教學生如何辨認小型學習問題，而非等到期末大幅落後。','哪項長期效益合理？',['早期處理或可減少後期嚴重學習問題','早期教學可減落後，個別支援可先減少','識別警號有用，但講座可代替持續支援','先教一般方法，不必看每名學生的困難'],['預防與資源集中可跨題使用。','及早教學仍需個別支援。','單次講座不等於跟進。','不同學生有不同缺口。'],[8,10,11,12],'avoid serious problems later；focus more resources。'),
  T('某人認為醫生應只負責開藥，健康教育只是「額外工作」。','文章結論會如何回應？',['可信且個別化的指導應納入醫生正式職責','醫生可教病人，開藥職責應交另一部門','健康教育可宣傳，但不需連個人風險','通用口號有用，便可減少具體診症解釋'],['核心職責來自其已論的具體作用。','教育應與治療職責並行。','個人風險解釋是重點。','通用口號未必能轉成行動。'],[1,2,4,7,13,14],'core part of medical care rather than optional extra。'),
  T('社區推廣健康時，宣傳冊已列普遍原則，卻沒有說明個人風險。','下一步可增加甚麼？',['由專業人士按個人情況解釋實際風險','把宣傳冊字加大，便可替代個人化指導','增加頁數，卻不查病人如何應用建議','只向已懂風險者宣傳，降低解釋負擔'],['practical、personal、trusted 三條件可同用。','字體改善閱讀，不替代個別解釋。','更多頁數未保證能應用。','新病人更需要可信指導。'],[1,2,3,4,5],'practical, personal, trusted。'),
  T('一名學生學懂管理睡眠與壓力，但尚未證明他永遠不會生病。','哪句最準確？',['管理睡眠壓力或降風險，卻無保證','睡眠管理有益，便可忽略其他健康風險','沒有長期把握，便不必看短期睡眠變化','既然提到糖尿病，便只需談單一疾病'],['may be less likely 是風險下降而非保證。','風險降低不等於其他風險消失。','無保證不等於無作用。','原文把習慣連到多種問題。'],[10,11],'may be less likely to develop。'),
  T('某醫院把醫生時間全部放在處理可避免的小病，急症病人要等很久。','文章提出甚麼系統層面的理由？',['早期教育或減小病需求，騰出急症資源','一次教育可減小病，急症病人可後處理','把醫生時間多投宣傳，不查急症需求','只看預算節省，不問病人就醫是否及時'],['預防可釋放資源處理迫切需要。','部分需求可減，急症仍需照顧。','宣傳不能擠掉急症。','公共資源須看就醫需要。'],[8,9,10,12],'focus more resources on patients who urgently need treatment。'),
  T('一位教師用學生自己的錯題解釋學習習慣的後果。','這種例子在論證中主要做甚麼？',['用個人錯題說明後果，促使學生改法','講學生錯題可提醒他，卻不必訂實際方法','個人化解釋有用，成績可作唯一判準','一般口號可幫學生，錯題可另行解釋'],['高血壓例子展示由資訊到警醒。','具體錯題要連到可行方法。','成績不必即時反映理解。','個人錯題正是解釋基礎。'],[3,4,5,6,7],'not just information; wake-up call。'),
  T('有人寫結論說「醫生很重要」，卻沒有回答健康教育是否應成為職責。','怎樣寫得更精確？',['重申醫生應教病人，納入正式醫療職責','只說醫生重要，教育病人職責可後補','結尾改談院舍建築，讓讀者推想立場','重申個人建議有用，卻不明說正式責任'],['結尾必須回答題目的責任分配。','題目要問教育是否正式責任。','建築與題目立場無關。','結論應明確回應題目。'],[0,13,14],'fully agree；core part of medical care。'),
  T('要用一句話概括兩段主體的作用。','哪項整合最準確？',['個別解釋風險，可減未來醫療負擔','只講個人風險，醫療負擔可留到結尾','只談醫院資源，不問病人如何理解習慣','改談治療收費，不回收預防教育作用'],['首段個人化，次段預防及資源。','兩段還談醫療需求。','病人理解是第一段主線。','治療收費不是兩段重點。'],[1,2,3,4,5,7,8,9,10,11,12],'specific guidance；prevent future illness。'),
];
// Balance answer lengths so students must evaluate the causal claim rather than spot a long option.
export default {key:'opinion:60',meta:{topic:'醫生是否應負責教育病人改善健康',summary:'作者完全同意醫生應教育病人。首段說明醫生能把一般健康知識連到個別病情，讓抽象資訊成為更可能促成行動的警醒；次段說明教導早期警號與健康習慣可能預防未來疾病，並讓醫院資源更集中照顧急需治療者。結論主張教育應成為醫療核心職責。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
