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
  T('學生都知道「要多閱讀」，卻不知道怎樣改善自己讀不懂的文章。','哪種教師指導最像文中的醫生角色？',['指出這名學生在哪類文章失分，再給能實踐的閱讀方法','重複「多閱讀」三字，完全不查看他遇到的困難','只向全班公布閱讀的重要性，不處理個別問題','要求學生先自費購書，才有資格聽任何具體建議'],['把一般知識轉為個人可用的指導。','仍然空泛。','沒有個人化。','費用條件不是這段的機制。'],[2,3,4],'general knowledge into specific guidance。'),
  T('一位財務顧問告訴客戶「少花錢」，客戶仍沒有改變。','如何轉用第一段的說服機制？',['把一般建議連到客戶的實際支出與風險，使問題清楚','再說一次同樣的口號，因為重複就必然有效','直接責怪客戶不自律，無須了解實際收支狀況','只提供一張廣告海報，避免說明任何個人後果'],['個人相關性可令建議更值得重視。','沒有解決空泛。','跳過分析。','缺少風險說明。'],[3,4,5,6,7],'connect these habits to a patient’s condition。'),
  T('醫生向病人解釋一項習慣可能傷害自身健康。','哪項表述最符合文章的分寸？',['病人較可能認真看待並改變行為，但不能保證每人都改變','病人聽完解釋便必然在同一天完全改變所有習慣','只有使用恐嚇語氣，病人才有可能明白健康風險','個人化解釋與病人的行為選擇完全沒有關係'],['more likely 表示機率，不是必然。','過度保證。','文章重在具體風險。','與機制相反。'],[5,6,7],'more likely to take it seriously。'),
  T('某城市只在橋樑損壞後搶修，從不教居民辨認早期危險。','哪項推理最像第二段？',['教人識別早期警號，可減少只靠事後修補的循環','搶修一旦存在，任何早期警號都應被忽略','居民只需記住橋的名字，不必理解危險徵兆','因為有預防教育，往後再也不需要任何搶修'],['早期教育與事後修補形成對照。','忽略預防。','無實際風險資訊。','過度保證。'],[8,9,10],'cycle of repair rather than prevention。'),
  T('學校教學生如何辨認小型學習問題，而非等到期末大幅落後。','哪項長期效益合理？',['及早處理可能減少後期嚴重問題，把支援留給急需者','教育後每名學生都必然不再遇到任何學習困難','教學生早期警號的唯一目的，是令教室更安靜','只要有一次講座，學校便能停止所有個別支援'],['預防與資源集中可跨題使用。','過度保證。','錯置目的。','個別指導仍重要。'],[8,10,11,12],'avoid serious problems later；focus more resources。'),
  T('某人認為醫生應只負責開藥，健康教育只是「額外工作」。','文章結論會如何回應？',['可信任且個人化的指導可影響行為，應成為正式醫療職責','既然要教導病人，醫生就應完全停止所有治療工作','健康教育只有宣傳用途，無法連到具體病人風險','任何人都可重複口號，因此醫生的解釋毫無價值'],['核心職責來自其已論的具體作用。','原文沒有取消治療。','與個人化相反。','忽略醫生的專業連結。'],[1,2,4,7,13,14],'core part of medical care rather than optional extra。'),
  T('社區推廣健康時，宣傳冊已列普遍原則，卻沒有說明個人風險。','下一步可增加甚麼？',['由可信任的專業人士按個人情況解釋建議的實際影響','把文字改成更大的字，便能取代所有個人化解釋','只增加宣傳冊頁數，不問讀者是否知道如何應用','只向已完全了解風險的人宣傳，避免接觸新病人'],['practical、personal、trusted 三條件可同用。','字大不等於個人化。','內容仍可能空泛。','忽略需要指導者。'],[1,2,3,4,5],'practical, personal, trusted。'),
  T('一名學生學懂管理睡眠與壓力，但尚未證明他永遠不會生病。','哪句最準確？',['這些習慣可能降低某些長期問題風險，仍需保留可能性','只要學懂睡眠管理，日後所有疾病都必然不會發生','沒有百分百保證，就能證明健康教育完全沒有作用','既然作者提及糖尿病，就必然只在討論單一疾病'],['may be less likely 是風險下降而非保證。','過度保證。','否定合理機率效益。','例子有兩種疾病。'],[10,11],'may be less likely to develop。'),
  T('某醫院把醫生時間全部放在處理可避免的小病，急症病人要等很久。','文章提出甚麼系統層面的理由？',['及早教育可能減少部分後期需求，讓資源較能照顧急症病人','只要教病人一次，醫院就必然完全沒有其他求診者','把所有資源轉給宣傳部門，不再治療急需照顧者','醫院資源只關乎財政報表，與病人是否急需無關'],['預防可釋放資源處理迫切需要。','過度保證。','與原文相反。','忽略資源目的。'],[8,9,10,12],'focus more resources on patients who urgently need treatment。'),
  T('一位教師用學生自己的錯題解釋學習習慣的後果。','這種例子在論證中主要做甚麼？',['展示個人化解釋如何把抽象資訊轉成願意行動的警醒','證明所有學生聽過解釋後都必然取得相同成績','只增加課堂故事數量，不影響學生對風險的理解','說明一般口號足夠，毋須連到個別學生的實際問題'],['高血壓例子展示由資訊到警醒。','不能保證同結果。','忽略因果。','與例子相反。'],[3,4,5,6,7],'not just information; wake-up call。'),
  T('有人寫結論說「醫生很重要」，卻沒有回答健康教育是否應成為職責。','怎樣寫得更精確？',['重申同意醫生教育病人，並指出應納入醫療核心工作','只重複醫生受到尊重，無須提到病人教育的責任','改成討論醫院建築設計，避免重提文章原來立場','把個人化建議寫成可有可無的附加項目'],['結尾必須回答題目的責任分配。','沒有回答。','離題。','與原文相反。'],[0,13,14],'fully agree；core part of medical care。'),
  T('要用一句話概括兩段主體的作用。','哪項整合最準確？',['醫生能把通用建議連到個人風險，並透過教育減少未來醫療負擔','醫生只需給出通用口號，病人便必然完全理解所有風險','教育只對醫院有益，無法幫助個別病人改變日常行為','文章只談治療的費用，沒有討論預防或醫療系統'],['首段個人化，次段預防及資源。','忽略個人化。','忽略首段。','與全文不符。'],[1,2,3,4,5,7,8,9,10,11,12],'specific guidance；prevent future illness。'),
];
// Balance answer lengths so students must evaluate the causal claim rather than spot a long option.
const balancedOptions={
  0:['指出這名學生在哪類文章失分，再給能實踐的閱讀方法','重複「多閱讀」的口號，不查看學生在哪類文章遇到困難','向全班公布閱讀很重要，卻不處理學生個別理解問題','要求學生先買練習書，才告訴他們如何改善閱讀困難'],
  1:['把一般建議連到客戶的實際支出與風險，使問題清楚','再次重複「少花錢」口號，卻不檢查每月實際支出','先責怪客戶不自律，再省略對實際收支風險的分析','只寄一份理財海報，避免說明習慣如何影響個人處境'],
  2:['病人較可能認真看待並改變行為，但不能保證每人都改變','病人聽完一次解釋，便必然在當天完全改變所有習慣','只用強烈恐嚇語氣，病人才會明白並改變所有習慣','個人化解釋不影響風險理解，也不可能影響實際行為'],
  5:['可信任且個人化的指導可影響行為，應成為正式醫療職責','既然醫生要教病人，便應把所有治療工作全數交給別人','健康教育只是宣傳工作，與病人理解個人風險完全無關','任何人都能重複通用口號，醫生的具體解釋便毫無價值'],
  8:['及早教育可能減少部分後期需求，讓資源較能照顧急症病人','病人只要上過一次課，醫院往後便不會再有任何求診者','所有醫院資源都該轉到宣傳部門，急症病人可等待更久','醫院資源只關乎財政報表，不必考慮病人求診的急迫程度'],
  10:['重申同意醫生教育病人，並指出應納入醫療核心工作','只重複醫生受到尊重，無須提到病人教育的責任','改成討論醫院建築設計，避免重提文章原來立場','把個人化建議寫成可有可無的附加項，毋須回應題目'],
  11:['把通用建議連到個人風險，再用教育減少未來醫療負擔','醫生只須重複通用口號，病人便會完全理解並改變習慣','教育只對醫院管理有益，無法幫助病人理解自身風險','文章只談治療收費，不談預防教育如何減輕醫療負擔'],
};
for(const [index,options] of Object.entries(balancedOptions))transfer[Number(index)].options=options;
export default {key:'opinion:60',meta:{topic:'醫生是否應負責教育病人改善健康',summary:'作者完全同意醫生應教育病人。首段說明醫生能把一般健康知識連到個別病情，讓抽象資訊成為更可能促成行動的警醒；次段說明教導早期警號與健康習慣可能預防未來疾病，並讓醫院資源更集中照顧急需治療者。結論主張教育應成為醫療核心職責。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
