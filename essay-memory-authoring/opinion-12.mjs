// Model Essay 12 · Opinion: credit-card debt, repayment checks and responsible lending.
const simple=[
  'Today, shopping and paying take very little effort, and it is so easy to borrow money that many people hardly notice when normal buys become debts that last a long time.',
  'Some people say that using credit cards too much and carelessly is the main reason for this problem, and banks should give cards only to people who can clearly pay back what they borrow.',
  'This essay fully agrees because credit cards make it easy to spend without feeling the cost straight away, and banks must stop loans people cannot pay back.',
  'The main reason for agreeing is that credit cards make people less careful with money than other ways to pay do.',
  'Because people do not see money leave their accounts when they buy something, extra spending seems harmless, so they keep making small optional buys until they cannot control them.',
  'For example, a worker who often pays by card for meals to take home, taxis and shopping online may only see how much they spent when the monthly bill comes.',
  'The way people pay back the money then makes the problem worse.',
  'Paying only the smallest amount makes a debt seem easy to handle, while extra interest slowly makes the total owed bigger.',
  'For example, someone who pays only a little of a holiday bill may still be paying for it months later.',
  'Banks should therefore give credit cards only after checking carefully whether people can pay back what they borrow.',
  'First, banks have information about income, past borrowing and tools to judge risk, so they can decide whether someone can realistically pay back a loan.',
  'For example, a bank can see whether a person already has several loans, income that changes a lot or a history of spending more than they have in their account.',
  'More importantly, careless lending can keep families trapped in debt when interest takes money they need for daily life.',
  'For example, a family with only one income may find it hard to pay rent, water or power bills when a card debt grows after the bank did not check carefully.',
  'So asking for clear proof that someone can pay back a loan is sensible lending, not being too careful.',
  'In short, I fully agree that careless credit-card use is a main cause of people’s debt and that banks should give cards only when people can clearly pay the debt back.',
  'These loans make spending feel separate from money, and banks are in a good position to stop debts growing out of control; stricter rules are therefore fair and needed.',
];
const vocabulary=[
  [['increasingly frictionless spending','shopping and paying take very little effort','愈來愈輕易的消費'],['borrowing has become so easy','so easy to borrow money','借貸已變得非常容易'],['barely notice','hardly notice','幾乎察覺不到'],['ordinary purchases','normal buys','日常購買'],['long-term financial liabilities','debts that last a long time','長期債務負擔']],
  [['It is often argued','Some people say','人們常主張'],['excessive and irresponsible use','using credit cards too much and carelessly','過度且不負責任地使用'],['provide such cards','give cards','發出這類卡片'],['afford to repay','pay back','負擔還款']],
  [['completely agrees','fully agrees','完全同意'],['without immediate financial pain','without feeling the cost straight away','沒有即時財務痛感'],['clear duty','must','有明確責任'],['prevent unaffordable lending','stop loans people cannot pay back','防止無力償還的借貸']],
  [['strongest reason','main reason','最有力的理由'],['weaken the natural restraint','make people less careful with money','削弱自然節制'],['other forms of payment','other ways to pay','其他付款方式']],
  [['at the moment of purchase','when they buy something','購買當下'],['unnecessary spending','extra spending','不必要的消費'],['small discretionary expenses','small optional buys','小額非必要支出'],['difficult to control','cannot control them','難以控制']],
  [['office worker','worker','上班族'],['routinely','often','經常'],['takeaway meals','meals to take home','外賣餐點'],['monthly statement arrives','monthly bill comes','每月帳單到來']],
  [['repayment structure itself','way people pay back the money','還款機制本身'],['intensified','makes the problem worse','加劇']],
  [['Minimum payments','Paying only the smallest amount','最低還款'],['create the illusion','makes a debt seem','製造假象'],['manageable','easy to handle','可控'],['interest charges','extra interest','利息費用'],['total balance','total owed','總欠款額']],
  [['small portion','only a little','一小部分'],['for instance','For example','例如'],['many months later','months later','幾個月後']],
  [['issue credit cards','give credit cards','發出信用卡'],['carrying out strict affordability checks','checking carefully whether people can pay back what they borrow','進行嚴格還款能力審查']],
  [['In the first place','First','首先'],['financial institutions','banks','金融機構'],['credit history','past borrowing','信用紀錄'],['risk-assessment tools','tools to judge risk','風險評估工具'],['borrowing is realistic','someone can realistically pay back a loan','借貸是否實際可行']],
  [['applicant','person','申請人'],['multiple loans','several loans','多筆貸款'],['unstable earnings','income that changes a lot','收入不穩'],['record of overdraft use','history of spending more than they have in their account','透支紀錄']],
  [['irresponsible lending','careless lending','不負責任的放貸'],['trap households in a cycle','keep families trapped in debt','使家庭陷入惡性循環'],['interest payments begin to consume money','interest takes money','利息吞噬金錢'],['essentials','daily life','基本生活所需']],
  [['living on one income','with only one income','只靠單一收入'],['struggling with','find it hard to pay','難以負擔'],['utility bills','power bills','水電費'],['poorly screened credit-card balance','card debt grows after the bank did not check carefully','審查不周的信用卡欠款']],
  [['Requiring convincing proof','asking for clear proof','要求具說服力證明'],['repayment ability','can pay back a loan','還款能力'],['not excessive caution but responsible lending','sensible lending, not being too careful','不是過度謹慎，而是負責任放貸']],
  [['In conclusion','In short','總而言之'],['completely agree','fully agree','完全同意'],['irresponsible credit-card use','careless credit-card use','不負責任使用信用卡'],['major cause','main cause','主要原因'],['personal debt','people’s debt','個人債務'],['issue credit cards','give cards','發出信用卡'],['repayment is clearly affordable','people can clearly pay the debt back','明確有能力還款']],
  [['detached spending','spending feel separate from money','與支出脫節的消費'],['lenders are uniquely placed','banks are in a good position','放貸者處於有利位置'],['debt spirals','debts growing out of control','債務惡性循環'],['stricter controls','stricter rules','更嚴格的管制'],['justified and necessary','fair and needed','合理且必要']],
];
const chunkOverrides=[
  ['In an age of increasingly frictionless spending, borrowing has become so easy','that many people barely notice','when ordinary purchases turn into long-term financial liabilities.'],
  ['It is often argued that this problem is mainly caused','by the excessive and irresponsible use of credit cards,','and that banks should not provide such cards','unless an applicant can clearly afford to repay what is borrowed.'],
  ['This essay completely agrees,','because credit cards encourage spending without immediate financial pain,','while banks have a clear duty to prevent unaffordable lending.'],
  ['The strongest reason for agreeing with this view','is that credit cards weaken the natural restraint','that other forms of payment impose.'],
  ['Because no money visibly leaves a person’s account at the moment of purchase,','unnecessary spending feels harmless,','so small discretionary expenses are repeated','until they become difficult to control.'],
  ['For example, an office worker who routinely uses a credit card','for takeaway meals, taxis and online shopping','may not realise how much has been spent','until the monthly statement arrives.'],
  ['The problem is then intensified','by the repayment structure itself.'],
  ['Minimum payments create the illusion that the debt is manageable,','whereas interest charges quietly increase the total balance.'],
  ['Someone who pays only a small portion of a holiday bill, for instance,','may still be repaying it many months later.'],
  ['Banks should therefore issue credit cards','only after carrying out strict affordability checks.'],
  ['In the first place, financial institutions possess the income data,','credit history and risk-assessment tools','needed to judge whether borrowing is realistic.'],
  ['A bank can see, for example, if an applicant already has multiple loans,','unstable earnings or a record of overdraft use.'],
  ['More importantly, irresponsible lending can trap households in a cycle','in which interest payments begin to consume money needed for essentials.'],
  ['A family living on one income, for instance,','may start struggling with rent or utility bills','once a poorly screened credit-card balance begins to grow.'],
  ['Requiring convincing proof of repayment ability','is therefore not excessive caution but responsible lending.'],
  ['In conclusion, I completely agree that irresponsible credit-card use','is a major cause of personal debt','and that banks should not issue credit cards','unless repayment is clearly affordable.'],
  ['Because such borrowing encourages detached spending','and because lenders are uniquely placed to prevent debt spirals,','stricter controls are both justified and necessary.'],
];
const simpleChunkOverrides=[
  ['Today, shopping and paying take very little effort,','and it is so easy to borrow money','that many people hardly notice when normal buys become debts that last a long time.'],
  ['Some people say that using credit cards too much and carelessly','is the main reason for this problem,','and banks should give cards only to people','who can clearly pay back what they borrow.'],
  ['This essay fully agrees','because credit cards make it easy to spend without feeling the cost straight away,','and banks must stop loans people cannot pay back.'],
  ['The main reason for agreeing is that','credit cards make people less careful with money','than other ways to pay do.'],
  ['Because people do not see money leave their accounts when they buy something,','extra spending seems harmless,','so they keep making small optional buys','until they cannot control them.'],
  ['For example, a worker who often pays by card','for meals to take home, taxis and shopping online','may only see how much they spent','when the monthly bill comes.'],
  ['The way people pay back the money','then makes the problem worse.'],
  ['Paying only the smallest amount makes a debt seem easy to handle,','while extra interest slowly makes the total owed bigger.'],
  ['For example, someone who pays only a little of a holiday bill','may still be paying for it months later.'],
  ['Banks should therefore give credit cards only','after checking carefully whether people can pay back what they borrow.'],
  ['First, banks have information about income, past borrowing','and tools to judge risk,','so they can decide whether someone can realistically pay back a loan.'],
  ['For example, a bank can see whether a person already has several loans,','income that changes a lot or a history of spending more than they have in their account.'],
  ['More importantly, careless lending can keep families trapped in debt','when interest takes money they need for daily life.'],
  ['For example, a family with only one income','may find it hard to pay rent, water or power bills','when a card debt grows after the bank did not check carefully.'],
  ['So asking for clear proof that someone can pay back a loan','is sensible lending, not being too careful.'],
  ['In short, I fully agree that careless credit-card use','is a main cause of people’s debt','and that banks should give cards only','when people can clearly pay the debt back.'],
  ['These loans make spending feel separate from money,','and banks are in a good position to stop debts growing out of control;','stricter rules are therefore fair and needed.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('In an age of instant messages, news has become so fast that readers often see a headline before checking its source.','so...that 把資訊速度連到讀者來不及查證的結果。','這句使用 so...that 的程度與結果鏈，不是本文要找的其他連接方式。',[1,7,14],
    F('In an age of [背景變化], [事物] has become so [程度] that [可觀察結果]','在時代背景下，用 so...that 說明某種程度如何導致具體結果。','要先交代一種普遍變化，再指出它如何改變日常行為時。',[['In an age of ','link','交代時代背景'],['increasingly frictionless spending','slot','背景變化'],[', ','link','接主要情況'],['borrowing','slot','事物'],[' has become so ','link','程度與結果句型'],['easy','slot','程度'],[' that ','link','引出結果'],['many people barely notice when ordinary purchases turn into long-term financial liabilities.','slot','可觀察結果']])),
  S('It is often argued that children need more time outdoors, and that schools should shorten screen-based tasks unless they are essential.','兩個 that 並列主張的兩部分；unless 為第二部分設定例外。','這句轉述兩項他人主張，並以 unless 限定後者，沒有先提出程度與結果。',[0,3,12],
    F('It is often argued that [問題原因], and that [建議做法] unless [例外條件]','用兩個 that 並列轉述同一觀點的原因判斷與建議；unless 為建議加上條件。','引言要完整轉述題目所說的原因及有條件的政策主張時。',[['It is often argued that ','link','引出他人看法'],['this problem is mainly caused by the excessive and irresponsible use of credit cards','slot','問題原因'],[', and that ','link','並列第二主張'],['banks should not provide such cards','slot','建議做法'],[' unless ','link','設定例外條件'],['an applicant can clearly afford to repay what is borrowed.','slot','例外條件']])),
  S('This essay completely agrees, because practice helps learners remember new words, while teachers have a duty to choose useful material.','because 引出第一理由；while 轉到另一個角色的相關責任。','這句有 because 與 while 兩項立場理由，並非單一原因或條件。',[1,4,7],
    F('This essay completely agrees, because [做法造成的影響], while [另一方的責任]','先表明完全同意；because 交代一項後果，while 加入另一方須承擔的責任。','引言要以個人行為與機構責任兩條不同理由預告正文時。',[['This essay completely agrees, because ','link','表明立場並引出第一理由'],['credit cards encourage spending without immediate financial pain','slot','做法造成的影響'],[', while ','link','補充另一方的責任'],['banks have a clear duty to prevent unaffordable lending.','slot','另一方的責任']])),
  S('The strongest reason for supporting the rule is that it makes school buses safer than the old system did.','is that 將最有力的支持理由落到可說明的效果。','這句突出單一最有力理由，沒有並列兩項主張或結果對比。',[0,2,9],
    F('The strongest reason for [立場] is that [核心機制或原因]','先說明哪個立場最值得支持，再用 is that 點出接下來要展開的核心原因。','首個主體段要明確指出全篇最強理由並準備解釋其運作方式時。',[['The strongest reason for ','link','引出最有力理由'],['agreeing with this view','slot','立場'],[' is that ','link','指出理由內容'],['credit cards weaken the natural restraint that other forms of payment impose.','slot','核心機制或原因']])),
  S('Because each app sends frequent alerts, breaks feel shorter, so users check their phones again until a short task takes an hour.','Because 設定原因，so 指出反覆行為，until 說明累積到的終點。','這句由原因推到重複行為，再以 until 指出累積結果。',[2,5,12],
    F('Because [看不到即時代價], [行為似乎無害], so [小行為反覆出現] until [難以控制的結果]','先解釋為何當下不覺得有成本，再說小額行為如何反覆並累積成失控問題。','要追蹤不易察覺的即時代價如何累積成長期問題時。',[['Because ','link','提出起因'],['no money visibly leaves a person’s account at the moment of purchase','slot','看不到即時代價'],[', ','link','接主觀感受'],['unnecessary spending feels harmless','slot','行為似乎無害'],[', so ','link','推出反覆行為'],['small discretionary expenses are repeated','slot','小行為反覆出現'],[' until ','link','指出累積終點'],['they become difficult to control.','slot','難以控制的結果']])),
  S('For example, a student who often leaves homework until late evening may not see how tired she is until the next morning.','who 限定習慣，may not...until 說明後果延遲被察覺。','這句使用具體人物、習慣及延遲察覺的例子，沒有 because...so...until 的因果鏈。',[3,4,8],
    F('For example, [人物] who [重複做法] may not realise [累積情況] until [較遲的提醒]','以一名有具體消費習慣的人物說明：總額可能在定期帳單到來時才被發現。','已解釋反覆小額行動的影響，接着要用貼近日常的例子具體化時。',[['For example, ','link','引出例子'],['an office worker','slot','人物'],[' who ','link','限定其習慣'],['routinely uses a credit card for takeaway meals, taxis and online shopping','slot','重複做法'],[' may not realise ','link','表達延遲察覺'],['how much has been spent','slot','累積情況'],[' until ','link','指出發現時間'],['the monthly statement arrives.','slot','較遲的提醒']])),
  S('The delay is then intensified by the notification system itself.','被動結構 intensified by 指出進一步加重問題的機制；itself 強調機制本身。','這句用被動語態加重前述問題，未提出對照或條件。',[3,7,14],
    F('The problem is then intensified by [加重問題的機制] itself','不只說問題存在，而是指明後續機制本身又使問題加劇。','一條原因已建立，下一步要轉入讓問題持續或惡化的制度機制時。',[['The problem is then intensified by ','link','指出進一步加劇'],['the repayment structure','slot','加重問題的機制'],[' itself.','link','強調機制本身']])),
  S('A small deposit makes a trip seem cheap, whereas later charges raise the final price.','whereas 對照眼前的低價印象與後來增加的實際總價。','這句以 whereas 對照表面印象與實際變化，不是加劇機制的被動句。',[4,6,11],
    F('[較低的眼前付款] creates the illusion that [負擔可控], whereas [後續費用] increase [實際總額]','用 whereas 對照付款者對負擔的主觀印象與實際餘額的增加。','要指出一項看似減輕負擔的做法，背後可能正累積更大代價時。',[['Minimum payments','slot','較低的眼前付款'],[' create the illusion that ','link','製造錯覺'],['the debt is manageable','slot','負擔可控'],[', whereas ','link','對照實際情況'],['interest charges','slot','後續費用'],[' quietly increase ','link','悄悄增加'],['the total balance.','slot','實際總額']])),
  S('Someone who finishes only the first page of a report, for instance, may still be working on it the following week.','who 指明只完成一部分；may still...later 指出事情拖延。','這句是部分完成導致較長延續的例子，沒有 whereas 的對照。',[5,7,9],
    F('Someone who [只完成部分付款], for instance, may still be [持續處理該筆款項] [數月之後]','以一人只償還部分帳單為例，說明債務並不因一次小額付款而消失。','已解釋表面輕鬆與實際負擔的落差，要用具體數字或情境顯示時。',[['Someone who ','link','指出例子人物及做法'],['pays only a small portion of a holiday bill','slot','只完成部分付款'],[', for instance, may still be ','link','指出持續狀態'],['repaying it','slot','持續處理該筆款項'],[' many months later.','slot','數月之後']])),
  S('Schools should therefore issue library cards only after checking that each student understands the rules.','should...only after 設定先檢查、後發卡的順序。','這句提出先決檢查的政策建議，並非部分付款例子。',[7,8,11],
    F('[負責機構] should therefore [採取准許行動] only after [完成必要檢查]','therefore 接上前述風險，only after 把檢查設為發放前的必要步驟。','說明風險與成因後，要提出有明確先後次序的措施時。',[['Banks','slot','負責機構'],[' should therefore ','link','由前文推出建議'],['issue credit cards','slot','採取准許行動'],[' only after ','link','設定先決條件'],['carrying out strict affordability checks.','slot','完成必要檢查']])),
  S('In the first place, coaches possess the attendance records and training notes needed to judge whether a new schedule is practical.','possess...needed to judge 解釋機構已有作判斷的資料。','這句先證明判斷者有資料和工具，不是在要求某項先行檢查。',[6,9,12],
    F('In the first place, [機構] possess [資料及工具] needed to judge whether [決定是否可行]','先交代機構掌握哪些資料和工具，據此說明它為何能作出合理判斷。','提出某機構應負責把關後，要證明它具備實際評估能力時。',[['In the first place, ','link','開始證明把關能力'],['financial institutions','slot','機構'],[' possess ','link','掌握'],['the income data, credit history and risk-assessment tools','slot','資料及工具'],[' needed to judge whether ','link','指出資料用途'],['borrowing is realistic.','slot','決定是否可行']])),
  S('A school can see, for example, if a pupil has missed several classes, needs language support or has changed courses recently.','can see if 把抽象的評估能力化為三項可查證資料。','這句列可查核的具體跡象，不是機構擁有資料工具的一般陳述。',[5,10,13],
    F('[把關機構] can see, for example, if [申請者] already has [風險跡象一、二或三]','用可查核的例子說明機構如何由資料辨認申請者的實際負擔或風險。','已指出機構有評估資料，接着要列出它應檢查甚麼時。',[['A bank','slot','把關機構'],[' can see, for example, if ','link','舉出可查核情況'],['an applicant','slot','申請者'],[' already has ','link','指出已有情況'],['multiple loans, unstable earnings or a record of overdraft use.','slot','風險跡象一、二或三']])),
  S('More importantly, weak transport planning can trap residents in a cycle in which long journeys take time needed for work or family.','in which 描述惡性循環內部如何持續消耗重要資源。','這句把制度失當連到循環及基本需要的損失，沒有只列查核跡象。',[10,11,14],
    F('More importantly, [不負責任的做法] can trap [受影響者] in a cycle in which [持續成本] consume [基本所需資源]','從判斷能力轉入更重要的後果：持續費用如何侵蝕基本生活資源。','已提出篩選方法，要指出不作篩選會造成甚麼深層傷害時。',[['More importantly, ','link','轉入較嚴重後果'],['irresponsible lending','slot','不負責任的做法'],[' can trap ','link','可能使人陷入'],['households','slot','受影響者'],[' in a cycle in which ','link','說明循環內的運作'],['interest payments','slot','持續成本'],[' begin to consume ','link','逐漸侵蝕'],['money needed for essentials.','slot','基本所需資源']])),
  S('A family living on one salary, for instance, may start struggling with travel costs once its monthly bus fares rise.','once 指出某成本開始上升後，家庭才陷入負擔困難。','這句提供家庭與觸發條件的具體例子，沒有抽象循環。',[8,11,12],
    F('A family living on [有限收入], for instance, may start struggling with [基本開支] once [未受控成本] begins to grow','以收入有限的家庭為例，說明未受控的成本增加後，基本帳單如何變得難付。','提出抽象的家庭壓力後，要以必要開支呈現具體後果時。',[['A family living on ','link','設定家庭財務條件'],['one income','slot','有限收入'],[', for instance, may start struggling with ','link','引出可能的負擔'],['rent or utility bills','slot','基本開支'],[' once ','link','設定開始惡化的條件'],['a poorly screened credit-card balance','slot','未受控成本'],[' begins to grow.','link','指出逐步增加']])),
  S('Requiring clear safety checks is therefore not needless delay but responsible planning.','not...but 糾正對審查的評價，重新界定為負責任的做法。','這句重新評價一項要求，不是用 once 設定後果觸發條件。',[9,12,13],
    F('Requiring [必要證明] is therefore not [負面誤解] but [正確評價]','therefore 收束前文證據；not...but 否定「過度謹慎」並改稱負責任的措施。','解釋審查不足的風險後，要回應「把關太嚴」的反對意見時。',[['Requiring ','link','指出必要要求'],['convincing proof of repayment ability','slot','必要證明'],[' is therefore not ','link','由證據否定誤解'],['excessive caution','slot','負面誤解'],[' but ','link','重新定義'],['responsible lending.','slot','正確評價']])),
  S('In conclusion, I completely agree that careless driving raises accident risk and that licences should not be renewed unless drivers pass a safety check.','結論以兩個 that 重申原因判斷和有條件的政策立場。','這句重申雙重立場，並以 unless 為政策設定必要條件。',[1,2,14],
    F('In conclusion, I completely agree that [問題主因] and that [機構不應採取行動] unless [必要能力已證實]','結論重申對問題成因的判斷，以及以償還能力作發卡前提的政策立場。','分析個人行為及機構責任後，要直接回答題目的不同部分時。',[['In conclusion, I completely agree that ','link','重申第一立場'],['irresponsible credit-card use is a major cause of personal debt','slot','問題主因'],[' and that ','link','重申第二立場'],['banks should not issue credit cards','slot','機構不應採取行動'],[' unless ','link','指出必要條件'],['repayment is clearly affordable.','slot','必要能力已證實']])),
  S('Because the library reaches many children and because teachers can guide their reading, wider access is both practical and worthwhile.','兩個 because 並列不同理由；both...and 把最終評價收束為兩點。','這句用並列雙原因推到雙重評價，不是結論重述的兩個 that。',[2,4,15],
    F('Because [問題形成的原因] and because [把關者能預防], [較嚴措施] are both [合理評價] and [必要評價]','以兩個 because 分別總結消費風險及放貸者的預防能力，再得出雙重結論。','結尾要整合前述理由，說明一項措施為何合理且必要時。',[['Because ','link','提出第一總結理由'],['such borrowing encourages detached spending','slot','問題形成的原因'],[' and because ','link','提出第二總結理由'],['lenders are uniquely placed to prevent debt spirals','slot','把關者能預防'],[', ','link','推出總結判斷'],['stricter controls','slot','較嚴措施'],[' are both ','link','引出雙重評價'],['justified','slot','合理評價'],[' and ','link','並列第二評價'],['necessary.','slot','必要評價']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對「銀行須先確認申請人有能力還款，才發信用卡」持甚麼立場？',[
    '完全同意：信用卡削弱消費節制，銀行也有條件避免借貸超出還款能力',
    '完全反對：應讓所有申請人不用審查便取得信用卡',
    '只同意問題存在，但文章沒有提出銀行應如何處理',
    '認為利息不會增加欠款，所以無需考慮還款能力',
  ],'引言的 completely agrees 與結論的 completely agree 一致；正文分別論述消費者的即時感受與銀行的把關責任。'),
  {type:'multi',prompt:'選出文章兩條主要論證線',detail:'選兩項，再按「確認」。',options:[
    '信用卡令消費成本當下不明顯，最低還款又掩蓋利息累積',
    '銀行有資料評估還款能力，審查可避免利息侵蝕家庭基本開支',
    '信用卡會令每名持卡人立即失去所有收入',
    '銀行沒有收入或信用資料，因此完全無法判斷任何風險',
  ],correct:[0,1],why:'第一主體段分析「花錢不痛 → 小額重複 → 最低還款假象」；第二主體段分析「銀行可查 → 應先查 → 防止基本開支受擠壓」。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 問題與立場','借貸變容易；作者完全同意應限制無力還款者取得信用卡。'],
  ['主體段一 · 消費與還款機制','付款當下不見金錢流出，小額花費易重複；最低還款及利息令債務拖長。'],
  ['主體段二 · 銀行把關責任','銀行掌握收入、信用與風險資料；應先審查，以免利息吞噬基本生活費。'],
  ['結論 · 雙重理由','重申個人不負責任用卡與銀行不應發出無力償還的信用卡。'],
],'個人消費節制變弱 → 還款機制放大債務 → 銀行可評估風險 → 發卡前要查還款能力。')];
const evidence=[
  Q('作者說信用卡為何削弱消費時的自然節制？',[
    '購物當下不見金錢明顯離開帳戶，不必要開支較易被看成無傷大雅',
    '信用卡付款會令每項商品的價格自動降低',
    '每次刷卡都會立即顯示未來全部利息，令人更謹慎',
    '刷卡時帳戶一定沒有任何記錄，所以銀行不能追查',
  ],'原文先說 no money visibly leaves...at the moment of purchase，再說 unnecessary spending feels harmless；重點是感知到的即時成本。'),
  Q('上班族外賣、計程車和網購的例子，說明甚麼時間差？',[
    '多次小額支出可能先累積，待每月帳單到來才看清總額',
    '每次付外賣時都必然即時知道整月總消費',
    '只有大型單筆消費才可能產生信用卡帳單',
    '帳單必定在購買之前寄到，先告知日後支出',
  ],'例子用 routinely 與 until the monthly statement arrives，呈現重複付款與較遲察覺的落差。'),
  Q('最低還款額和利息在文中形成哪一組對照？',[
    '最低還款令人以為債務可控，利息卻增加實際總欠款',
    '最低還款與利息都會自動令全部欠款立即歸零',
    '最低還款表示銀行已免除所有未付部分',
    '利息只改變帳單日期，不改變需要償還的金額',
  ],'whereas 明確對照「可控的假象」與「總餘額增加」。'),
  Q('銀行為何被認為有能力作發卡前審查？',[
    '銀行掌握收入、信用紀錄和評估工具，也可查看既有貸款或透支紀錄',
    '銀行只需猜測申請人喜歡甚麼商品，便能確定還款能力',
    '銀行完全不能取得與借貸有關的任何資料',
    '只看申請人的家庭照顏色，就能判斷債務風險',
  ],'原文具名列出 income data、credit history、risk-assessment tools；下一句再列 multiple loans、unstable earnings、overdraft use。'),
  Q('審查不周可能如何影響只靠單一收入的家庭？',[
    '信用卡欠款增加，利息擠走原本用來付房租或水電費的錢',
    '信用卡欠款增加會令房租與水電費必定自動降低',
    '只要家庭有一份收入，就絕不可能受利息影響',
    '銀行若審查不周，家庭便必定獲得額外免費收入',
  ],'原文先說 interest payments consume money needed for essentials，再用單一收入家庭的房租、水電費作例。'),
  Q('為何作者說還款能力證明「不是過度謹慎」？',[
    '因銀行有能力審查，而無力償還的借貸可能擠壓家庭基本開支',
    '因審查可以保證每名持卡人此後永遠不再借款',
    '因所有信用卡消費都可以不計利息直接取消',
    '因銀行只需考慮申請表格式，完全不看收入',
  ],'not...but 的重新評價有前文支撐：銀行具備資料，且未審慎發卡可造成實際傷害。'),
];
const logic=[
  sequence('第一主體段：容易刷卡怎樣變成長期債務？',[
    ['核心原因','信用卡削弱其他付款方式帶來的即時節制。'],
    ['當下感受','付款時看不到金錢離開，非必要消費似乎無傷大雅。'],
    ['重複累積','外賣、計程車及網購等小額花費反覆出現。'],
    ['延遲察覺','每月帳單到來時，消費者才可能看清總額。'],
    ['還款假象','最低還款讓欠款看似可控。'],
    ['實際變化','利息增加總欠款，假期帳單也可能拖幾個月仍未還清。'],
  ],'即時成本不明顯 → 小額開支重複 → 帳單才顯示總額 → 最低還款掩蓋利息累積。'),
  sequence('第二主體段：銀行為甚麼須先查還款能力？',[
    ['政策主張','只在嚴格負擔能力審查後發信用卡。'],
    ['評估能力','銀行有收入、信用紀錄與風險評估工具。'],
    ['具體警號','既有多筆貸款、收入不穩或透支紀錄可被查見。'],
    ['若不把關','不負責任的放貸可能使利息不斷侵蝕家庭生活費。'],
    ['家庭例子','只靠一份收入的家庭可能開始難付房租或水電費。'],
    ['最終判斷','要求清楚的還款能力證明屬負責任放貸。'],
  ],'資料與工具使銀行有能力審查；若放任無力還款，利息可擠壓基本需要。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一款手機遊戲讓玩家先按一下買道具，月底才集中顯示支出。','哪項最準確轉用「即時成本不明顯」的論證？',[
    '比較玩家每次購買時的感受與月底總支出，檢查小額付款是否反覆累積',
    '只問玩家喜不喜歡遊戲畫面，不查看任何購買紀錄',
    '因每次金額較小，就斷定月底總支出必然很低',
    '把月底總支出當作每次按下購買鍵時已清楚顯示的資料',
  ],[
    '這保留「當下感受低成本 → 反覆小額付款 → 較遲察覺總額」的鏈條。',
    '畫面喜好不能檢驗反覆付款。',
    '小額若反覆發生，總額仍可能增加。',
    '題設說明總支出要到月底才集中顯示。',
  ],[0,4,5],'範文以刷卡時不見金錢流出及上班族到帳單來時才看清總額，解釋延遲察覺。'),
  T('學校食堂改用預付卡，學生買點心時只需拍卡，家長一週後才看消費清單。','哪項分析最貼近範文的心理機制？',[
    '觀察拍卡時是否較少留意餘額，以及小額點心是否在一週內重複購買',
    '由於使用預付卡，便認定學生永遠不會買非必要食物',
    '只查看一件點心的價格，不記錄一週買了多少次',
    '把家長一週後看清單等同學生每次付款前已看清總額',
  ],[
    '這將較弱的即時成本感受連到小額支出的重複次數。',
    '付款方便本身不保證選擇更節制。',
    '反覆次數是文章因果鏈的一部分。',
    '每次購買與一週後檢視是不同時間點。',
  ],[3,4,5],'範文由購買當下不見金錢流出，推到非必要小額開支反覆出現。'),
  T('一間旅行社宣傳「每月只需還少量」，但分期付款附帶利息。','哪項資料最能檢驗「負擔容易」的宣傳？',[
    '列出每月付款、全部利息及最後須付的總額，而不只看首月金額',
    '只比較首月金額，因利息不影響最後支付總額',
    '只看旅程相片，便認定分期一定比一次付款便宜',
    '將最低付款額當作全部欠款已經清零的證據',
  ],[
    '這對照眼前付款帶來的可負擔印象與利息增加的實際總額。',
    '有利息時，首月付款不足以代表總成本。',
    '相片不提供付款或利息資料。',
    '部分付款不等於全部欠款已償清。',
  ],[6,7,8],'範文說最低還款製造可控假象，利息卻增加總欠款，假期帳單可拖數月。'),
  T('網店容許顧客每月只付最低金額，顧客以為兩個月便能清掉購物款。','哪項追蹤方式最能檢驗這個推斷？',[
    '逐月記錄本金、最低還款及利息，核對欠款實際何時還清',
    '只問顧客是否滿意包裝，不追蹤欠款餘額',
    '因繳了最低金額便假設未付部分不再存在',
    '只看第一次付款日，不看其後每月的利息',
  ],[
    '這能分辨「覺得可控」與「餘額真正下降」是否一致。',
    '包裝滿意度與欠款清償速度無關。',
    '最低還款只償還部分，不能消除所有欠款。',
    '忽略其後利息便無法判斷還清時間。',
  ],[7,8],'範文以最低還款、利息及假期帳單數月仍未還清，說明還款拖長。'),
  T('一所學校借出昂貴樂器，借用者須在學期末歸還；校方有以往遺失與歸還紀錄。','哪項最能轉用「機構具資料便應把關」？',[
    '用相關歸還紀錄設計清楚借用條件，並在借出前向每人說明責任',
    '完全不看既有紀錄，只按借用者喜歡的音樂類型決定',
    '有過遺失紀錄就保證每位借用者都會遺失樂器',
    '借出後才首次訂立條件，令申請者事前無法了解',
  ],[
    '這把可查的風險資料用於發放前的相稱條件。',
    '音樂喜好與歸還風險沒有直接證據關係。',
    '紀錄可提示風險，不能保證每人的行為。',
    '原文的 only after 強調先評估再發放。',
  ],[9,10,11],'範文要求銀行先查負擔能力，因銀行掌握相關資料與評估工具。'),
  T('一個共用單車計畫準備擴大會員數，已有維修、逾期歸還和事故資料。','哪項政策最能套用本文的先後次序？',[
    '先用現有紀錄評估借用風險及維修能力，再決定是否擴大服務',
    '先無限制擴大，再決定是否需要查看任何事故紀錄',
    '只看會員卡外觀，便推斷維修與事故風險',
    '已有資料卻全部棄用，因事前評估必然無效',
  ],[
    '這符合「機構有資料 → 先評估 → 再作准許決定」。',
    '先擴大後查資料，顛倒了把關順序。',
    '卡片外觀不能代替維修與事故資料。',
    '資料未必完美，但不能因此斷定事前評估無效。',
  ],[9,10],'範文的 only after 將負擔能力審查設為發卡前提，並交代銀行可用的資料。'),
  T('一戶家庭只靠一份薪金，分期購買家具後，額外費用開始擠壓房租預算。','哪項最能延伸「基本開支受侵蝕」的推理？',[
    '比較分期總費用與家庭支付房租及水電後的餘額，評估付款是否可持續',
    '只看家具原價，忽略分期帶來的額外費用',
    '認為能付第一期便保證以後每期都不影響房租',
    '因家庭有一份薪金，就斷定基本開支不會受擠壓',
  ],[
    '這把持續費用與基本需要放在同一家庭預算中比較。',
    '總費用可能高於原價，不能略去額外費用。',
    '第一期可付不代表整段期間都可負擔。',
    '單一收入正是原文例子中較易受擠壓的情況。',
  ],[12,13],'範文說利息可能吞噬基本開支，並以單一收入家庭難付房租與水電為例。'),
  T('社區中心提供有收費的長期課程；有人指開課前問清楚付款能力「太小心」。','哪項回應最符合 not...but 的功能？',[
    '說明分期費用可能擠壓生活費，故先講清總額是負責任安排，不是多餘拖延',
    '只重複「太小心」三次，不討論學員需要支付甚麼',
    '認為任何詢問都能保證所有學員一定完成課程',
    '因擔心付款困難，便不再公布課程總費用',
  ],[
    '這以具體風險支持重新評價：事前清楚說明是負責任，而非無謂限制。',
    '重複批評不能證明檢查沒有用途。',
    '原文主張審查有必要，沒有保證一切結果。',
    '不公布總額會更難判斷可負擔性。',
  ],[12,14],'範文先指出債務擠壓基本開支，再說還款能力證明並非過度謹慎。'),
  T('一所大學擬向學生推出「先學後付」課程，校方有學費、還款期限和學生支援資料。','哪項最能同時結合本文兩條理由？',[
    '清楚顯示累積總費用，並在推出前評估學生能否按期付款',
    '只強調每次付款很少，不公布總額，也不審視還款安排',
    '只做付款能力評估，卻刻意隱藏任何附加費用',
    '只公開課程海報，便認定每位學生都能長期負擔',
  ],[
    '這同時處理消費成本感知與機構事前把關責任。',
    '這忽略總成本和負擔能力兩條主線。',
    '缺少總費用，學生難以判斷真實負擔。',
    '海報不提供個人負擔能力的證據。',
  ],[0,4,7,9,10,12],'範文前段談付款感受與利息，後段談銀行有資料並應先審查。'),
  T('一間電器店發放商店信用額時只看顧客的購物次數，不看已有欠款或收入。','哪項最能指出評估資料的缺口？',[
    '加入已有貸款、收入穩定程度與透支紀錄，才能較合理地估計還款能力',
    '購物次數本身必然足以證明顧客可償還任何信用額',
    '只看顧客挑選哪種電器，就能推斷其全部家庭支出',
    '刻意不查既有欠款，便能讓風險自然消失',
  ],[
    '這轉用原文列出的三類實際風險跡象，補足單看消費行為的不足。',
    '購物次數不能代表收入或既有債務。',
    '商品偏好不是完整家庭財務資料。',
    '不查既有欠款不會消除欠款。',
  ],[10,11],'範文列出收入、信用紀錄及多筆貸款、收入不穩與透支使用。'),
  T('某付款應用程式容許顧客先買多次、下月才付款；商戶認為只需提醒顧客「自律」。','哪項建議最符合文章的雙重責任分析？',[
    '顯示累積支出並設定申請前負擔審查，兼顧使用者節制與平台把關',
    '只叫顧客自律，平台不顯示總額，也不評估任何付款能力',
    '只審查付款能力，卻故意令消費者看不到累積支出',
    '因應用程式操作方便，就認定每筆借貸都能準時償還',
  ],[
    '這回應即時成本難見與放貸者可預防風險兩條主線。',
    '只責備個人，忽略產品設計與機構責任。',
    '審查不能代替消費過程中的總額提示。',
    '操作方便與還款能力不是同一回事。',
  ],[0,2,4,9,10,16],'範文把消費者的延遲成本感受與放貸者有能力防止債務惡化並列。'),
  T('市政府考慮讓家庭分期支付高額水費欠款，部分家庭同時已難付房租。','哪項決策最貼近本文的最終原則？',[
    '先查家庭基本開支與分期總負擔，再設定可承受的還款安排',
    '只因首期金額很低，便忽略其後利息和房租需要',
    '既然家庭仍能付首期，就斷定全部欠款必定可負擔',
    '不告知分期總額，讓家庭自行猜測未來支出',
  ],[
    '這同時看實際可負擔性及基本生活所需，符合負責任安排。',
    '只看首期容易重現最低還款的可控假象。',
    '首期能付不能證明長期還款能力。',
    '隱藏總額會削弱家庭的判斷。',
  ],[7,9,12,13,14,16],'範文重點是不能只看眼前付款；把關者須避免還款擠壓基本生活費。'),
];
const reviewedTransferOptions=[
  ['比較每次付款感受與月底總支出，查小額款項有否累積','只問玩家喜歡哪個畫面，不查看任何實際購買紀錄','每次購買金額較小，便斷定月底總支出必定很低','把月底總額當作每次購買前已清楚顯示的資料'],
  ['觀察拍卡時有否留意餘額，及小額購買是否反覆出現','學生使用預付卡，便認定他永遠不會買非必要點心','只看一件點心價格，不記錄全星期實際買了幾次','把家長事後看清單等同學生事前已看清總額'],
  ['列出月供、全部利息與總額，不只比較首月付款','只比較第一個月的供款，認為利息不影響總額','只看旅程相片，便認定分期一定比一次付清便宜','把最低付款額當作全部欠款都已清零的證據'],
  ['逐月記錄本金、還款及利息，核對實際還清時間','只問顧客滿不滿意包裝，不追蹤實際欠款餘額','繳了最低金額，便假設未付的部分不再存在','只看第一次付款日期，不看其後每月的利息'],
  ['用歸還紀錄訂借用條件，借出前說明責任','不看既有紀錄，只按喜歡的音樂類型決定借用','曾有遺失紀錄，便保證每人以後都會遺失樂器','借出後才首次訂條件，讓申請者事前無從了解'],
  ['先評估借用風險與維修能力，再決定是否擴大服務','先無限制擴大服務，再決定是否需要查事故紀錄','只看會員卡外觀，便推斷維修及事故的風險','已有紀錄卻全數棄用，因事前評估必然無效'],
  ['比較分期總費用與房租水電後的餘額，評估持續能力','只看家具原價，不理會分期產生的額外費用支出','能付第一期，便保證往後每期都不影響房租支出','家庭有一份薪金，便斷定基本開支不會受擠壓'],
  ['指出先講清總額是負責安排，而非多餘拖延','只重複「太小心」，不討論學員需要支付多少','認為任何詢問都保證所有學員完成整個課程','因擔心付款困難，便不再公布課程的總費用'],
  ['顯示累積總費用，並先評估學生能否按期付款','只強調每次付款少，不公布總額也不查還款能力','只評估付款能力，卻刻意隱藏全部附加費用','只公開課程海報，便認定每位學生都可長期負擔'],
  ['加查已有貸款、收入與透支紀錄，估計還款能力','購物次數多，便認定顧客足以償還任何信用額','只看所選電器種類，便推斷其全部家庭支出','刻意不查已有欠款，便認為風險會自然消失'],
  ['顯示累積支出，並在申請前審查付款能力','只叫顧客自律，平台不顯示總額也不作審查','只查付款能力，卻故意不讓人看累積支出','應用程式方便，便認定每筆貸款都可準時還'],
  ['先查基本開支與總負擔，再設定可承受的還款額','首期金額低，便忽略往後利息及房租開支','能付首期，便斷定全部欠款都必定可負擔','不告知分期總額，讓家庭自行猜測往後支出'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
structures[5].example='For example, a student who often leaves homework until late evening may not realise how tired she is until the next morning.';
structures[6].example='The problem is then intensified by the notification system itself.';
structures[7].example='Small deposits create the illusion that a trip is cheap, whereas later charges quietly increase the final price.';
structures[11].example='A school can see, for example, if a pupil already has several missed classes or a record of needing language support.';
structures[12].example='More importantly, weak transport planning can trap residents in a cycle in which long journeys begin to consume time needed for work or family.';
structures[13].example='A family living on one salary, for instance, may start struggling with travel costs once its monthly bus fare begins to grow.';
structures[16].example='Because libraries reach many children and because teachers can guide their reading, these changes are both practical and worthwhile.';
export default {
  key:'opinion:12',
  meta:{topic:'信用卡債務與負責任放貸',summary:'作者完全同意嚴查發卡能力：信用卡令小額消費的即時代價不明顯，最低還款與利息使債務延長；銀行具資料，應在發卡前防止無力償還的借貸。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
