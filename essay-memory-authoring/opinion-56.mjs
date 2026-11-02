const simple=[
  'Good rules for keeping people healthy should start before they reach a hospital.',
  'I strongly agree that stopping illness before it starts is more important than treating it later, so governments should spend the most on prevention.',
  'First, preventing illness can save money and stop people from suffering.',
  'When governments spend money on teaching people about health, vaccines, early checks, safe parks, and better food at school, many serious health problems can be stopped before they become costly to treat.',
  'A system that waits until people are sick is always dealing with emergencies: hospitals fill up, doctors have too much work, and the public pays for care that might have been avoided.',
  'For example, children who learn to eat well and have places to be active are less likely to have health problems linked to being very overweight later.',
  'This means fewer people may need difficult operations, medicine for life, or many visits to hospital.',
  'So preventing illness does more than save money; it can spare people pain that medicine cannot fully take away.',
  'Second, spending money to stop illness early can make society fairer.',
  'Treatment often comes after someone is already hurt by illness, but prevention can help whole groups of people before they become sick.',
  'This matters especially for families with little money, who may not easily get healthy food, safe homes, help with mental health, or regular health checks.',
  'If public money improves air, provides free checks, helps schools give meals, and encourages people to move more, many people can benefit, not only those who can pay for private care.',
  'So prevention is more than a way to treat health problems; it is money spent to help people stay healthy, work, and care for themselves.',
  'In short, governments should put stopping illness first because it can prevent pain, reduce the work hospitals must do, and help people more fairly.',
  'Treating sick people is important, but spending public money to stop illness before it starts is better.',
];
const vocabulary=[
  [['health policy','rules for keeping people healthy','健康政策'],['should not begin at the hospital door','should start before they reach a hospital','不應從醫院門口開始']],
  [['completely agree','strongly agree','完全同意'],['preventing illness','stopping illness before it starts','預防疾病'],['treating it after it has already developed','treating it later','事後治療'],['public funding','governments should spend','公共資金'],['strongest priority','spend the most','最優先']],
  [['prevention','preventing illness','預防'],['saves both money and human suffering','save money and stop people from suffering','節省金錢及痛苦']],
  [['health education','teaching people about health','健康教育'],['vaccination programmes','vaccines','疫苗接種'],['early screening','early checks','早期篩查'],['better nutrition in schools','better food at school','學校營養改善'],['serious conditions','serious health problems','嚴重疾病'],['expensive medical crises','costly to treat','昂貴醫療危機']],
  [['health system','system','醫療系統'],['only responds after people are already sick','waits until people are sick','只在生病後回應'],['fighting fires','dealing with emergencies','到處救火'],['overstretched','have too much work','負擔過重'],['taxpayers','the public','納稅人'],['long-term treatment that might have been avoided','care that might have been avoided','原可避免的長期治療']],
  [['healthy eating habits','eat well','健康飲食習慣'],['places to exercise','places to be active','運動場所'],['less likely','less likely','較少可能'],['obesity-related illnesses','health problems linked to being very overweight','肥胖相關疾病'],['later in life','later','日後']],
  [['fewer patients','fewer people','較少病人'],['complex surgery','difficult operations','複雜手術'],['lifelong medication','medicine for life','終身服藥'],['repeated hospital visits','many visits to hospital','反覆求診']],
  [['Prevention','preventing illness','預防'],['does not merely reduce costs','does more than save money','不只降低成本'],['protects people from pain','spare people pain','免受痛苦'],['no medicine can fully erase','medicine cannot fully take away','藥物無法完全抹去']],
  [['Another reason','Second','另一原因'],['preventive spending','spending money to stop illness early','預防性開支'],['fairer society','society fairer','更公平社會']],
  [['Treatment','Treatment','治療'],['after damage has been done','after someone is already hurt by illness','傷害已造成'],['whereas','but','然而'],['whole communities','whole groups of people','整個社區'],['before illness takes root','before they become sick','疾病扎根前']],
  [['especially important','matters especially','尤其重要'],['poorer families','families with little money','較貧困家庭'],['lack access to','may not easily get','缺少渠道'],['nutritious food','healthy food','營養食物'],['mental-health support','help with mental health','心理健康支援'],['regular medical checks','regular health checks','定期檢查']],
  [['improve air quality','improves air','改善空氣質素'],['free health screenings','free checks','免費健康篩查'],['support school meals','helps schools give meals','支援學校膳食'],['promote active lifestyles','encourages people to move more','推廣積極生活'],['shared widely','many people can benefit','廣泛共享'],['afford private care','pay for private care','負擔私人醫療']],
  [['In this sense','So','從這意義上'],['not just a medical strategy','more than a way to treat health problems','不只醫療策略'],['social investment','money spent to help people','社會投資'],['productive','work','有生產力'],['independent','care for themselves','獨立']],
  [['In conclusion','In short','總結'],['prioritise the prevention of disease','put stopping illness first','優先疾病預防'],['avoidable suffering','pain','可避免痛苦'],['lowers pressure on healthcare systems','reduce the work hospitals must do','減低醫療壓力'],['more equally','more fairly','更公平']],
  [['Treating illness matters','Treating sick people is important','治療重要'],['preventing it','stop illness before it starts','預防疾病'],['wiser use of public money','spending public money to stop illness before it starts is better','更明智用公帑']],
];
const chunkOverrides=[
  ['Good health policy','should not begin at the hospital door.'],
  ['I completely agree that preventing illness is more important than treating it after it has already developed,','and public funding should therefore give prevention the strongest priority.'],
  ['The first reason is that prevention','saves both money and human suffering.'],
  ['When governments invest in health education, vaccination programmes, early screening, safe parks, and better nutrition in schools,','many serious conditions can be stopped before they become expensive medical crises.'],
  ['A health system that only responds after people are already sick is always fighting fires:','hospitals become crowded, doctors are overstretched, and taxpayers must pay for long-term treatment that might have been avoided.'],
  ['For example, if children are taught healthy eating habits and are given places to exercise,','they are less likely to develop obesity-related illnesses later in life.'],
  ['This means fewer patients needing complex surgery,','lifelong medication, or repeated hospital visits.'],
  ['Prevention, therefore, does not merely reduce costs;','it protects people from pain that no medicine can fully erase.'],
  ['Another reason is that preventive spending','creates a fairer society.'],
  ['Treatment often reaches people only after damage has been done,','whereas prevention can protect whole communities before illness takes root.'],
  ['This is especially important for poorer families,','who may lack access to nutritious food, safe housing, mental-health support, or regular medical checks.'],
  ['If public money is used to improve air quality, provide free health screenings, support school meals, and promote active lifestyles,','the benefits are shared widely rather than reserved for those who can afford private care.'],
  ['In this sense, prevention is not just a medical strategy;','it is a social investment that helps citizens remain healthy, productive, and independent.'],
  ['In conclusion, governments should clearly prioritise the prevention of disease','because it reduces avoidable suffering, lowers pressure on healthcare systems, and protects society more equally.'],
  ['Treating illness matters,','but preventing it is the wiser use of public money.'],
];
const simpleChunkOverrides=[
  ['Good rules for keeping people healthy','should start before they reach a hospital.'],
  ['I strongly agree that stopping illness before it starts is more important than treating it later,','so governments should spend the most on prevention.'],
  ['First, preventing illness','can save money and stop people from suffering.'],
  ['When governments spend money on teaching people about health, vaccines, early checks, safe parks, and better food at school,','many serious health problems can be stopped before they become costly to treat.'],
  ['A system that waits until people are sick is always dealing with emergencies:','hospitals fill up, doctors have too much work, and the public pays for care that might have been avoided.'],
  ['For example, children who learn to eat well and have places to be active','are less likely to have health problems linked to being very overweight later.'],
  ['This means fewer people may need difficult operations,','medicine for life, or many visits to hospital.'],
  ['So preventing illness does more than save money;','it can spare people pain that medicine cannot fully take away.'],
  ['Second, spending money to stop illness early','can make society fairer.'],
  ['Treatment often comes after someone is already hurt by illness,','but prevention can help whole groups of people before they become sick.'],
  ['This matters especially for families with little money,','who may not easily get healthy food, safe homes, help with mental health, or regular health checks.'],
  ['If public money improves air, provides free checks, helps schools give meals, and encourages people to move more,','many people can benefit, not only those who can pay for private care.'],
  ['So prevention is more than a way to treat health problems;','it is money spent to help people stay healthy, work, and care for themselves.'],
  ['In short, governments should put stopping illness first','because it can prevent pain, reduce the work hospitals must do, and help people more fairly.'],
  ['Treating sick people is important,','but spending public money to stop illness before it starts is better.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Good school policy should not begin at the examination hall.','should not begin at... 用形象地點指出介入不應太遲。','此句提出預防性框架，尚未說所有事後支援無用。',[1,4,14],F('Good [政策] should not begin at [問題爆發的最後階段]','先以簡短圖像指出公共措施需要及早開始。','引言要提醒讀者一項政策不應等問題惡化後才開始時。',[['Good health policy','slot','政策'],[' should not begin at ','link','不應只從'],['the hospital door.','slot','問題爆發的最後階段']])),
  S('I completely agree that preventing school dropout is more important than repairing the damage afterwards, and public funding should therefore give prevention the strongest priority.','more important than 比較介入先後；and...therefore 把立場連到資金優先次序。','作者仍承認治療重要，只把預防列得更優先。',[0,2,13],F('I agree that [事前預防] is more important than [事後補救], and funding should therefore prioritise [預防]','明確比較兩種介入時點，並回答題目的撥款問題。','題目問預防與補救如何排序時，要把比較判斷轉成資源優先次序。',[['I completely agree that ','link','表明同意'],['preventing illness','slot','事前預防'],[' is more important than ','link','比...更重要'],['treating it after it has already developed','slot','事後補救'],[', and public funding should therefore give ','link','所以公共資金應給'],['prevention','slot','預防'],[' the strongest priority.','link','最優先']])),
  S('The first reason is that early intervention saves both money and human suffering.','both...and... 並列金錢與人的損失，建立首項理由。','這是兩種不同效益，不能只保留成本一項。',[1,3,8],F('The first reason is that [事前措施] saves both [金錢] and [人的代價]','開始首條論證，同時交代經濟與人的好處。','要指出一項及早措施可同時節省成本與減少人的損失時。',[['The first reason is that ','link','引出首項理由'],['prevention','slot','事前措施'],[' saves both ','link','同時節省'],['money','slot','金錢'],[' and ','link','以及減少'],['human suffering.','slot','人的代價']])),
  S('When schools invest in tutoring, quiet study spaces and regular checks, many problems can be stopped before they become expensive crises.','When 設前期投入；before 明確指出避免後期危機的時間順序。','can 不表示每種疾病都必然可預防。',[2,4,5],F('When [決策者投資多項早期措施], [嚴重問題] can be stopped before [昂貴危機]','列出預防工具並指出它們阻斷較嚴重後果的機制。','提出事前介入有效後，要列出具體措施並指出避免的後期代價時。',[['When ','link','設前期投入'],['governments invest in health education, vaccination programmes, early screening, safe parks, and better nutrition in schools','slot','決策者投資多項早期措施'],[', ','link','則'],['many serious conditions','slot','嚴重問題'],[' can be stopped before ','link','可在...前阻止'],['they become expensive medical crises.','slot','昂貴危機']])),
  S('A school that only responds after pupils have fallen far behind is always fighting fires: teachers are overloaded and families need support that might have been avoided.','fighting fires 是只在危機後補救的比喻；冒號後列三項代價。','作者批評只靠補救，不是要求取消醫院。',[3,5,7],F('A [系統] that only responds after [問題發生] is fighting fires: [多項後期代價]','用比喻及具體後果展示只作事後反應的負擔。','要批評一個系統只等問題發生才處理時，列出人員及資金後果。',[['A health system','slot','系統'],[' that only responds after ','link','只在...後才回應'],['people are already sick','slot','問題發生'],[' is always fighting fires: ','link','就像不斷救火：'],['hospitals become crowded, doctors are overstretched, and taxpayers must pay for long-term treatment that might have been avoided.','slot','多項後期代價']])),
  S('For example, if pupils learn effective study habits early, they are less likely to need intensive catch-up lessons later.','if 設前期條件；less likely 保留機率；later in life 標明延後效益。','例子不保證所有孩子都不患病。',[3,4,6],F('For example, if [早期介入措施], they are less likely to [日後問題]','用一個可想像的早期介入例子支持預防機制。','要用 if 交代早期介入，並用 less likely to 說明較長期的可能結果時。',[['For example, if ','link','引出條件例子'],['children are taught healthy eating habits and are given places to exercise','slot','早期培養習慣與提供環境'],[', they are less likely to ','link','日後較不可能'],['develop obesity-related illnesses later in life.','slot','日後問題']])),
  S('This means fewer pupils needing repeated tutoring and long-term support meetings.','This means 回指前例；fewer... 列由預防而減少的後期需求。','不是說手術或藥物永遠不再需要。',[4,5,7],F('This means fewer [人] needing [多種後期支援]','從個別預防例子推導系統層面的需求減少。','已交代一項預防措施後，要指出它可能減少哪些昂貴補救需求時。',[['This means fewer ','link','結果較少'],['patients','slot','人'],[' needing ','link','需要'],['complex surgery, lifelong medication, or repeated hospital visits.','slot','多種後期支援']])),
  S('Prevention, therefore, does not merely reduce costs; it protects families from avoidable stress.','not merely...; it... 把價值由成本擴大到不可逆的人身損失。','原文沒有說治療完全無效，只說某些痛苦不能完全抹去。',[2,6,8],F('[預防], therefore, does not merely reduce [成本]; it protects [人] from [難以完全挽回的痛苦]','總結首段，提醒讀者節省金錢之外還有人承受的損失。','列出成本節省後，要補上無法完全用金錢或事後措施彌補的損失時。',[['Prevention','slot','預防'],[', therefore, does not merely reduce ','link','因此不只減少'],['costs','slot','成本'],['; it protects ','link','也保護'],['people','slot','人'],[' from ','link','免受'],['pain that no medicine can fully erase.','slot','難以完全挽回的痛苦']])),
  S('Another reason is that early learning support creates a fairer society.','Another reason 引第二理由；fairer 把討論由節省成本轉到分配公平。','不重複首段節約金錢的論點。',[2,7,9],F('Another reason is that [事前投入] creates [更公平的整體]','由效率轉到公平作另一條獨立論證。','完成成本與痛苦的理由後，要另從誰有機會受惠談公平時。',[['Another reason is that ','link','引出另一理由'],['preventive spending','slot','事前投入'],[' creates ','link','創造'],['a fairer society.','slot','更公平的整體']])),
  S('Treatment often reaches people only after damage has been done, whereas prevention can protect whole communities before illness takes root.','whereas 清楚對照事後與事前的時間和覆蓋範圍。','這不是說事後治療沒有作用，只是比較兩者時點。',[3,8,10],F('[補救] reaches people after [傷害已發生], whereas [預防] can protect [更多人] before [問題擴大]','比較補救與預防在時間及受益範圍上的差異。','要說明兩種介入的先後時點及覆蓋範圍為何不同時。',[['Treatment','slot','補救'],[' often reaches people only after ','link','常在...後才到來'],['damage has been done','slot','傷害已發生'],[', whereas ','link','而'],['prevention','slot','預防'],[' can protect ','link','可保護'],['whole communities','slot','更多人'],[' before ','link','在...前'],['illness takes root.','slot','問題擴大']])),
  S('This is especially important for poorer pupils, who may lack access to quiet rooms, books and tutoring.','especially 指特別受影響群體；who may lack... 解釋何以更需要公共措施。','並非說每戶低收入家庭都缺少全部條件。',[8,9,11],F('This is especially important for [較弱勢群體], who may lack access to [多種基本資源]','指出普遍措施對資源較少者尤其重要。','提出整體效益後，要解釋哪個群體受益特別大及原因時。',[['This is especially important for ','link','特別重要於'],['poorer families','slot','較弱勢群體'],[', who may lack access to ','link','因可能缺少'],['nutritious food, safe housing, mental-health support, or regular medical checks.','slot','多種基本資源']])),
  S('If public money is used to improve classrooms and provide free meals, the benefits are shared widely rather than reserved for those who can afford private care.','If 列公共措施；rather than reserved for... 比較廣泛受惠與私人購買門檻。','句子不說每項服務都應完全免費；此處論公平可及性。',[9,10,12],F('If public money funds [多項普及措施], benefits are shared widely rather than reserved for [負擔得起的少數人]','把公共投入與機會分配公平連起來。','要說明公共措施如何把好處由可付費的少數人擴展至更多人時。',[['If public money is used to ','link','若公共資金用於'],['improve air quality, provide free health screenings, support school meals, and promote active lifestyles','slot','多項普及措施'],[', the benefits are shared widely rather than reserved for ','link','好處廣泛共享，而非只給'],['those who can afford private care.','slot','負擔得起的少數人']])),
  S('In this sense, tutoring is not just an education service; it is a social investment that helps pupils remain confident and independent.','not just...; it is... 重新界定價值；that helps... 列長期人的結果。','此句不把服務的直接功能否定，只是增加社會層面。',[8,11,13],F('In this sense, [措施] is not just [狹窄類別]; it is [社會投資] that helps [長期人的結果]','總結第二段，把單一部門措施連到更廣公共效益。','已展示廣泛受益後，要把一項專業措施重新界定為社會投資時。',[['In this sense, ','link','由前文推論'],['prevention','slot','措施'],[' is not just ','link','不只是'],['a medical strategy','slot','狹窄類別'],['; it is ','link','也是'],['a social investment','slot','社會投資'],[' that helps ','link','幫助'],['citizens remain healthy, productive, and independent.','slot','長期人的結果']])),
  S('In conclusion, councils should clearly prioritise early maintenance because it prevents avoidable harm and shares safety more fairly.','because 後三條效益回收兩段理由，而非引入新問題。','結論要保持「優先」，不能誤寫成完全取消治療。',[1,7,12],F('In conclusion, [決策者] should prioritise [事前措施] because it [三項已論效益]','以一句話重申政策優先次序並整合全文。','完成效率與公平兩條論證後，要在結論合併成可執行的優先原則時。',[['In conclusion, ','link','總結'],['governments','slot','決策者'],[' should clearly prioritise ','link','應明確優先'],['the prevention of disease','slot','事前措施'],[' because it ','link','因為'],['reduces avoidable suffering, lowers pressure on healthcare systems, and protects society more equally.','slot','三項已論效益']])),
  S('Treating illness matters, but preventing it is the wiser use of public money.','but 承認補救價值，仍重申預防比較值得優先投入。','不能把更優先誤解為事後治療不重要。',[1,9,13],F('[事後補救] matters, but [事前預防] is the wiser use of [公共資源]','最後明確保持比較立場和必要讓步。','結尾要承認另一方法仍重要，卻重申哪種方法更值得優先時。',[['Treating illness','slot','事後補救'],[' matters, but ','link','重要，但'],['preventing it','slot','事前預防'],[' is the wiser use of ','link','是更明智使用'],['public money.','slot','公共資源']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為政府健康資金應如何排序預防與治療？',['預防應最優先；治療仍重要，但及早介入可減少痛苦和不平等','完全取消所有治療與醫院','只把預算給事後手術','沒有立場，只列措施'],'completely agree；strongest priority；Treating illness matters。'),
  {type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['預防可減少後期醫療成本與人的痛苦','普及預防措施可使資源較少家庭較早受惠','任何疾病都必然可百分百預防','治療完全沒有作用'],correct:[0,1],why:'首段談成本與痛苦；次段談公平可及性。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 預防應優先','健康政策不應只在醫院開始；資金應優先預防。'],
  ['主體段一 · 減少痛苦和成本','列教育、疫苗與早檢等措施；只靠治療的系統像不斷救火。'],
  ['主體段二 · 更公平的保障','預防可在疾病形成前惠及較多居民，尤其資源不足家庭。'],
  ['結論 · 治療重要，預防更明智','以可避免痛苦、醫療壓力與公平回收理由。'],
],'及早措施 → 避免昂貴危機與痛苦 → 廣泛公平受益 → 優先而非取消治療。')];
const evidence=[
  Q('首段列出哪些預防性投入？',['健康教育、疫苗、早期篩查、安全公園與學校營養','只有醫院擴建','只有事後手術','只提供昂貴私人醫療'],'原文列五類及早措施。'),
  Q('「永遠在救火」的比喻批評甚麼？',['只等人病了才處理，令醫院擠迫、醫生過勞及成本增加','消防員不應進醫院','所有醫生都不願治病','預防能使醫院立即消失'],'fighting fires 後列三項系統代價。'),
  Q('健康飲食與運動場所的兒童例子說明甚麼？',['及早培養習慣，可能降低日後相關疾病的風險','所有孩子必然永不生病','治療因此完全無用','只有成人能建立健康習慣'],'less likely 保留機率，例子連早期環境與日後結果。'),
  Q('作者說預防除了節省成本，還有甚麼重要價值？',['減少一些事後藥物也未必能完全消除的痛苦','只提高醫院收費','保證永遠不需醫生','只令統計表格好看'],'not merely reduce costs；protects people from pain。'),
  Q('較貧困家庭為何尤其需要普及預防措施？',['可能較難取得營養食物、安全住所、心理支援與定期檢查','人人必然缺少全部四項','只因他們不想看病','私人醫療對所有人都免費'],'who may lack access to...。'),
  Q('作者在結尾如何處理治療的重要性？',['明確承認治療重要，但預防更值得公共資金優先投入','否認治療有任何價值','要求永久關閉醫院','只談私人醫療，不談公共資金'],'Treating illness matters, but...。'),
];
const logic=[
  sequence('第一主體段：預防為何減少後期代價？',[
    ['主張','預防能同時節省金錢與減少人的痛苦。'],
    ['投入','健康教育、疫苗、早期檢查、公園及學校營養。'],
    ['反面系統','只等生病才處理，如不斷救火，增加擠迫和成本。'],
    ['兒童例子','健康飲食和運動環境可能降低日後相關疾病風險。'],
    ['段落結論','預防還保護人免受某些難以完全消除的痛苦。'],
  ],'早期投入 → 避免危機 → 系統壓力較小 → 人的痛苦較少。'),
  sequence('第二主體段：預防為何較公平？',[
    ['主張','預防性開支可讓更多人較早得到保障。'],
    ['時間比較','治療通常在傷害後到來；預防可在疾病形成前幫助社區。'],
    ['受益群體','資源較少家庭可能難取得食物、住房及健康服務。'],
    ['普及措施','改善空氣、免費檢查、學校膳食及活動生活。'],
    ['段落結論','預防是有助健康、工作和獨立的社會投資。'],
  ],'較早保障 → 較廣受益 → 回應取得資源不均 → 社會投資。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('學校只在學生大幅落後後才安排補課，平時沒有早期檢查。','哪條跨題推理最適合？',['早期查缺口並支援，或可減少日後重度補課','只在大幅落後後補課，不查問題何時開始','早期檢查有用，卻不安排相應學習支援','提供補課有用，因此不需任何早期觀察'],['早期發現與支援可避免較昂貴的後期補救。','只在大幅落後後補課仍屬被動反應。','檢查須連到合適支援。','補課可有用，但不取代早期預防。'],[0,1,3,4,14],'should not begin at hospital door；prevention priority。'),
  T('某社區提供免費健康檢查，讓付不起私人醫療的家庭也可參與。','哪條公平論證最貼近文章？',['免費檢查擴大接觸，讓低收入家庭也可參與','免費檢查有用，卻只安排在昂貴私人診所','檢查若讓人參與，便不用跟進發現的風險','只看診所收入，不查哪些家庭受費用所阻'],['免費公共檢查使原被價格擋住的家庭也能受益。','若仍在昂貴診所，費用門檻未解。','檢查發現風險後仍需跟進。','收入不能代表居民有否公平接觸。'],[9,10,11,12],'free health screenings；benefits shared widely。'),
  T('城市定期維修舊橋，避免橋壞後才作緊急重建。','這與首段哪一邏輯相同？',['定期維修可減低橋壞後的成本與安全風險','定期維修可減成本，卻不需檢查橋的安全','等橋損壞再重建，卻不比較前期維修費','只計維修日數，不看事故對居民的傷害'],['事前維修可能節省重建成本並減少人的危險。','安全是此情境的重要回報。','要把事前維修與事後重建比較。','事故傷害是預防理由之一。'],[2,3,4,7],'stopped before expensive...crises；fighting fires。'),
  T('政府擔心早期支援花錢，卻沒有計算醫院擠迫、長期照顧與人的痛苦。','哪項評估更完整？',['同時計前期費用、長期醫療支出和病人痛苦','只計本年度支出，不估長期照顧成本','只計醫院使用量，不問居民可避免的痛苦','只計病人感受，不評估公共財政的負擔'],['首段同時比較金錢與人的代價。','短期支出漏掉長期照顧。','醫院使用量不能取代痛苦評估。','人的痛苦與財政負擔都要看。'],[2,3,4,6,7],'saves both money and human suffering。'),
  T('學生有健康飲食課及安全運動場，成年後患某類疾病的可能性或降低。','為何應保留「可能」？',['健康習慣可降低風險，但不保證人人無病','健康習慣有益，卻未必每個人都有機會','健康習慣若改善，後續檢查便可全取消','健康習慣可減風險，所以疾病必然消失'],['less likely 是風險下降，不是每個人都免病。','機會公平是另一問題，但未準確解讀機率。','改善生活方式不等於不需要檢查。','風險降低不能推出必然零疾病。'],[3,5,6],'less likely to develop...later in life。'),
  T('有議員說：「既然預防較重要，就把所有醫院關掉。」','哪項更正最準確？',['預防應優先，但治療仍是必要的公共服務','預防應優先，所以急症服務可以全面停辦','治療仍重要，因此不需要早期健康措施','兩者皆重要，卻不必比較何者應先投資'],['Treating illness matters 明確承認治療，同時主張預防優先。','優先預防不等於停止急症服務。','治療有用不等於放棄早期措施。','題目要求比較公共資金優先序。'],[1,13,14],'Treating illness matters, but preventing it...'),
  T('某校午餐改善營養，讓不同收入家庭的學生都可參與。','哪項是第二段可轉用的原則？',['學校午餐可讓不同收入孩子分享早期益處','學校午餐有益，卻只供付得起費用者','餐食改善營養，便不需看學生成長需要','餐食讓人參與，但不評估是否真的更健康'],['學校餐食是公共預防，能把好處分享給更多人。','收費限制與公平目的相反。','營養改善不取消其他成長需要。','仍應看健康成效。'],[10,11,12],'support school meals；benefits shared widely。'),
  T('一個城市只在居民生病後付治療費，完全不改善空氣或公共空間。','「救火」比喻會指出甚麼？',['只靠事後治療，可能累積本可避免的健康代價','只靠事後治療，便不用觀察醫院是否擠迫','改善空氣可減風險，但只要生病才需處理','公共空間有用，卻不應算入預防政策考量'],['fighting fires 指不斷處理已發生而可能避免的危機。','擠迫是原文列出的後果。','空氣改善是降低發病風險的方法。','公共空間也是原文預防例子。'],[3,4,11],'only responds after...fighting fires。'),
  T('公共政策報告只說早期措施能省錢，卻不提居民感受。','本文提醒還要加上甚麼？',['預防也減少居民痛苦，不能只看省下多少錢','只要省下醫療費，就不用看病人生活限制','居民感受值得看，卻可忽略可避免的痛苦','藥物能幫助病人，便可完全抹去所有損失'],['not merely reduce costs 強調免除難完全挽回的痛苦。','節省費用不是唯一價值。','可避免痛苦是應評估的核心。','原文說有些痛苦藥物不能完全抹去。'],[2,7],'not merely reduce costs; protects people from pain。'),
  T('政府要比較免費早期檢查與只提供昂貴私人檢查。','哪個問題最符合公平論證？',['比較服務價格門檻，讓檢查好處較廣泛分享','只比較診所裝修，不查家庭是否負擔得起','只比較設備數量，不問低收入者如何進入','只看私人客戶反應，不評估公共檢查覆蓋'],['第二段的公平論證問誰能取得服務。','裝修不回答可及性問題。','設備數量不代表低收入者能進入。','私家客戶反應未涵蓋公共檢查對象。'],[8,9,10,11],'poorer families；benefits shared widely。'),
  T('某人把預防性政策只當作「醫療技巧」。','文章如何擴大這個理解？',['預防亦是社會投資，讓居民維持健康與獨立','預防有醫療價值，卻不涉及居民工作能力','預防可減個人費用，卻不應看社區的健康','預防有公共收益，便不需任何醫療專業'],['預防不只是醫療技巧，也是較公平的社會投資。','居民工作與獨立能力屬後續收益。','社區整體健康是公共回報。','公共收益也需醫療專業執行。'],[8,11,12],'not just a medical strategy; social investment。'),
  T('要用一句話概括全文。','哪項最準確？',['預防優先可減成本痛苦並促公平，治療仍重要','只要預防有用，就可停辦所有治療服務','預防可減開支，卻不需看人的健康感受','預防能促公平，便不必再評估實際成本'],['摘要涵蓋兩段理由及治療仍有價值的讓步。','預防優先不取消治療。','人的痛苦不能省略。','公平收益仍須與成本一起評估。'],[1,2,3,7,8,9,10,11,13,14],'prevention strongest priority；Treating illness matters。'),
];
export default {
  key:'opinion:56',
  meta:{topic:'疾病預防與治療的公共資金優先次序',summary:'作者完全同意把預防列為公共健康資金的最高優先。健康教育、疫苗、早期篩查及改善生活環境可減少後期醫療危機和人的痛苦；普及措施亦可較公平地幫助資源較少家庭。結論仍明確承認治療重要，主張的是比較優先次序。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
