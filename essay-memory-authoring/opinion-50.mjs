const simple=[
  'Children now often make more choices for themselves than children did in the past, such as choosing activities, sharing opinions, and making decisions about their lives.',
  'I think this is a good change because having more freedom helps children feel sure of themselves and get ready for adult life.',
  'The main good point is that freedom helps children learn to do things for themselves when they are young.',
  'In the past, many children had to do what adults said without asking why; this could make them follow rules but not always think carefully.',
  'But when children can make choices that fit their age, they learn to think, compare choices, and deal with what happens after their decisions.',
  'For example, a child trusted to plan his own study time may sometimes make mistakes, but he may learn more about taking responsibility from them than from parents always deciding for him.',
  'So freedom is a place to practise for adult life, when people must make decisions without always being told what to do.',
  'Another good point is that more freedom helps children say what they think and grow in how they handle feelings.',
  'Children who can speak honestly are more likely to understand how they feel, say what they need, and have better relationships.',
  'If adults always stop young people from speaking or protect them too much, they may grow up afraid to disagree or unable to stand up for themselves.',
  'For example, when parents listen to what a child thinks about school, friends, or future plans, the child feels respected, not controlled.',
  'This does not mean children can do anything they want; with sensible freedom, they can grow more sure of themselves, make better decisions, and know who they are.',
  'In short, giving children more freedom is a good change.',
  'Children still need help and direction, but doing things for themselves and speaking their minds help them become responsible, confident adults who understand their feelings.',
];
const vocabulary=[
  [['far more independence','more choices for themselves','更多獨立性'],['young people in the past','children did in the past','過去的年輕人'],['choosing their hobbies','choosing activities','選擇興趣'],['expressing their opinions','sharing opinions','表達意見'],['making personal decisions','making decisions about their lives','作個人決定']],
  [['positive development','good change','正面發展'],['greater freedom','having more freedom','更多自由'],['more confident','feel sure of themselves','更有自信'],['better prepared for adult life','get ready for adult life','更準備好成年生活']],
  [['main benefit','main good point','主要好處'],['develop independence','learn to do things for themselves','培養獨立性'],['from an earlier age','when they are young','從較早年齡']],
  [['previous generations','In the past','過去幾代'],['expected to obey adults without question','had to do what adults said without asking why','被期望無條件服從'],['disciplined','follow rules','守紀律'],['not necessarily thoughtful','not always think carefully','未必善於思考']],
  [['By contrast','But','相比之下'],['age-appropriate choices','choices that fit their age','符合年齡選擇'],['compare options','compare choices','比較選項'],['accept the consequences of their decisions','deal with what happens after their decisions','承擔決定後果']],
  [['trusted','trusted','被信任'],['manage his own study schedule','plan his own study time','管理學習時間表'],['make mistakes','make mistakes','犯錯'],['teach him responsibility','learn more about taking responsibility','教會責任感'],['constant parental control','parents always deciding for him','父母持續控制']],
  [['In this sense','So','從這意義上說'],['training ground for real life','place to practise for adult life','現實生活訓練場'],['make decisions','make decisions','作決定'],['without always being told what to do','without always being told what to do','非總由人指示']],
  [['Another reason','Another good point','另一原因'],['positive','good','正面'],['self-expression','say what they think','自我表達'],['emotional growth','grow in how they handle feelings','情感成長']],
  [['allowed to speak openly','can speak honestly','被允許坦誠表達'],['more likely','more likely','更有可能'],['understand their own feelings','understand how they feel','理解感受'],['communicate their needs','say what they need','表達需要'],['healthier relationships','better relationships','較健康關係']],
  [['silenced','stop young people from speaking','被壓制'],['overprotected','protect them too much','被過度保護'],['afraid of disagreement','afraid to disagree','害怕分歧'],['defend themselves','stand up for themselves','為自己辯護']],
  [['For instance','For example','例如'],['child’s views','what a child thinks','孩子看法'],['friendships','friends','友誼'],['future goals','future plans','未來目標'],['respected rather than controlled','respected, not controlled','受尊重而非控制']],
  [['whatever they want','anything they want','為所欲為'],['reasonable freedom','sensible freedom','合理自由'],['develop confidence','grow more sure of themselves','培養自信'],['judgment','make better decisions','判斷力'],['sense of identity','know who they are','身份認同感']],
  [['In conclusion','In short','總結'],['giving children more freedom','giving children more freedom','給孩子更多自由'],['positive change','good change','正面改變']],
  [['guidance','help and direction','引導'],['independence','doing things for themselves','獨立性'],['self-expression','speaking their minds','自我表達'],['responsible, confident, and emotionally mature adults','responsible, confident adults who understand their feelings','負責自信情感成熟成人']],
];
const chunkOverrides=[
  ['Children today are often given far more independence than young people in the past,','whether in choosing their hobbies, expressing their opinions, or making personal decisions.'],
  ['I believe this is a positive development','because greater freedom helps children become more confident and better prepared for adult life.'],
  ['The main benefit is that freedom allows children','to develop independence from an earlier age.'],
  ['In previous generations, many children were expected to obey adults without question,','which could make them disciplined but not necessarily thoughtful.'],
  ['By contrast, when children are allowed to make age-appropriate choices,','they learn to think, compare options, and accept the consequences of their decisions.'],
  ['For example, a child who is trusted to manage his own study schedule may sometimes make mistakes,','but those mistakes can teach him responsibility more effectively than constant parental control.'],
  ['In this sense, freedom acts as a training ground for real life,','where people must make decisions without always being told what to do.'],
  ['Another reason this trend is positive','is that it encourages stronger self-expression and emotional growth.'],
  ['Children who are allowed to speak openly are more likely to understand their own feelings,','communicate their needs, and build healthier relationships with others.'],
  ['If young people are always silenced or overprotected,','they may grow up afraid of disagreement or unable to defend themselves.'],
  ['For instance, when parents listen to a child’s views about school, friendships, or future goals,','the child feels respected rather than controlled.'],
  ['This does not mean children should be allowed to do whatever they want,','but reasonable freedom can help them develop confidence, judgment, and a stronger sense of identity.'],
  ['In conclusion, giving children more freedom','is a positive change.'],
  ['Although guidance is still necessary,','independence and self-expression are essential for helping young people become responsible, confident, and emotionally mature adults.'],
];
const simpleChunkOverrides=[
  ['Children now often make more choices for themselves than children did in the past,','such as choosing activities, sharing opinions, and making decisions about their lives.'],
  ['I think this is a good change','because having more freedom helps children feel sure of themselves and get ready for adult life.'],
  ['The main good point is that freedom helps children','learn to do things for themselves when they are young.'],
  ['In the past, many children had to do what adults said without asking why;','this could make them follow rules but not always think carefully.'],
  ['But when children can make choices that fit their age,','they learn to think, compare choices, and deal with what happens after their decisions.'],
  ['For example, a child trusted to plan his own study time may sometimes make mistakes,','but he may learn more about taking responsibility from them than from parents always deciding for him.'],
  ['So freedom is a place to practise for adult life,','when people must make decisions without always being told what to do.'],
  ['Another good point is that more freedom helps children','say what they think and grow in how they handle feelings.'],
  ['Children who can speak honestly are more likely to understand how they feel,','say what they need, and have better relationships.'],
  ['If adults always stop young people from speaking or protect them too much,','they may grow up afraid to disagree or unable to stand up for themselves.'],
  ['For example, when parents listen to what a child thinks about school, friends, or future plans,','the child feels respected, not controlled.'],
  ['This does not mean children can do anything they want;','with sensible freedom, they can grow more sure of themselves, make better decisions, and know who they are.'],
  ['In short, giving children more freedom','is a good change.'],
  ['Children still need help and direction,','but doing things for themselves and speaking their minds help them become responsible, confident adults who understand their feelings.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Children now have more independence in hobbies, opinions and decisions.','whether in...or... 列自由的三個具體領域。','開篇描述變化，尚未判斷好壞。',[1,2,7],F('[今日孩子] are given [比過去更多獨立性], whether in [興趣選擇、意見表達或個人決定]','先界定所說自由包括甚麼。','要比較兩個時期的行為或自由程度，並列出具體表現時。',[['Children today','slot','今日孩子'],[' are often given ','link','常得到'],['far more independence than young people in the past','slot','比過去更多獨立性'],[', whether in ','link','無論在'],['choosing their hobbies, expressing their opinions, or making personal decisions.','slot','興趣選擇、意見表達或個人決定']])),
  S('More freedom is positive because it helps confidence and adult readiness.','because 後兩個結果：自信與成年準備。','作者支持更多自由，但後文仍限定需合理引導。',[0,2,13],F('I believe [更多自由] is [正面發展] because it helps [孩子更自信且更準備好成年生活]','直接評價趨勢並預告第一條效益。','題目問正負面變化時，要表態並先說理由。',[['I believe ','link','表明看法'],['this','slot','更多自由'],[' is ','link','是'],['a positive development','slot','正面發展'],[' because ','link','因為'],['greater freedom helps children become more confident and better prepared for adult life.','slot','孩子更自信且更準備好成年生活']])),
  S('Freedom can help children build independence earlier.','main benefit 定位第一理由；from an earlier age 強調提早練習。','並非放任孩子做所有重大決策。',[1,3,4],F('The main benefit is that [自由] allows [孩子] to develop [較早獨立性]','建立自主訓練論證。','要說明某種早期經驗如何逐步培養日後所需能力時。',[['The main benefit is that ','link','指出主要好處'],['freedom','slot','自由'],[' allows ','link','讓'],['children','slot','孩子'],[' to develop ','link','培養'],['independence from an earlier age.','slot','較早獨立性']])),
  S('Past obedience could make children disciplined without making them thoughtful.','which could...but not necessarily... 區分守紀律與思考能力。','原文說 many，不是每個過去孩子都被禁止提問。',[2,4,5],F('In [過去幾代], many [孩子] were expected to [無條件服從], which could make them [守紀律] but not necessarily [善思考]','用舊式教養作對照，不把紀律等同判斷。','要區分某教養方式可能培養的能力與未必培養的能力時。',[['In ','link','設定時代'],['previous generations','slot','過去幾代'],[', many ','link','許多'],['children','slot','孩子'],[' were expected to ','link','被期望'],['obey adults without question','slot','無條件服從'],[', which could make them ','link','或使之'],['disciplined','slot','守紀律'],[' but not necessarily ','link','但未必'],['thoughtful.','slot','善思考']])),
  S('Age-suitable choices teach children to compare options and accept results.','when 設符合年齡的自由條件；三個動作呈現判斷與責任。','age-appropriate 限定並非任何決定都交給孩子。',[3,5,6],F('When [孩子可作符合年齡的選擇], they learn to [思考、比較、承擔決定後果]','解釋適度自主如何鍛鍊能力。','要把抽象的自主具體化為有適當界線的選擇及後果時。',[['By contrast, when ','link','轉到新做法'],['children are allowed to make age-appropriate choices','slot','孩子可作符合年齡的選擇'],[', they learn to ','link','便學會'],['think, compare options, and accept the consequences of their decisions.','slot','思考、比較、承擔決定後果']])),
  S('A child planning study time may learn responsibility from mistakes more than from constant control.','may sometimes make mistakes 承認風險；but...more effectively than... 指錯誤可帶來責任感。','不是鼓勵孩子毫無協助地犯嚴重錯誤。',[4,6,7],F('For example, [自主安排學習時間的孩子] may [犯錯], but [錯誤] can teach [責任感] more effectively than [父母持續控制]','用可控的小決定說明從後果中學習。','要承認嘗試可能出錯，同時解釋可控錯誤的學習價值時。',[['For example, ','link','引出例子'],['a child who is trusted to manage his own study schedule','slot','自主安排學習時間的孩子'],[' may sometimes ','link','有時可能'],['make mistakes','slot','犯錯'],[', but ','link','但'],['those mistakes','slot','錯誤'],[' can teach him ','link','可教會'],['responsibility','slot','責任感'],[' more effectively than ','link','比...更有效'],['constant parental control.','slot','父母持續控制']])),
  S('Freedom trains decision-making for real life.','training ground 是比喻；where 後解釋成年人常需自己決定。','不是說成年人永不接受建議。',[4,5,7],F('[自由] acts as [現實生活訓練場], where [人們] must [自己作決定而非總靠指示]','把兒童選擇連到成年生活的準備。','要說明早期自主練習如何轉化為未來能力時。',[['In this sense, ','link','據上述例子'],['freedom','slot','自由'],[' acts as ','link','像'],['a training ground for real life','slot','現實生活訓練場'],[', where ','link','在其中'],['people','slot','人們'],[' must ','link','須'],['make decisions without always being told what to do.','slot','自己作決定而非總靠指示']])),
  S('Freedom can also support self-expression and emotional development.','Another reason 明確展開第二理由，和第一段獨立性不同。','下一句才解釋感受、需求與人際關係。',[1,6,8],F('[更多自由的趨勢] is positive because it encourages [自我表達及情感成長]','從獨立判斷轉到表達與情緒。','已論一項能力，另要說明它對人際或情感的作用時。',[['Another reason ','link','引出另一理由'],['this trend','slot','更多自由的趨勢'],[' is positive is that it encourages ','link','是正面的，因其鼓勵'],['stronger self-expression and emotional growth.','slot','自我表達及情感成長']])),
  S('Children who speak openly may better understand feelings, needs and relationships.','who 指有表達機會的孩子；more likely 保留機率；三項能力遞進。','不保證每個能說話的孩子必然沒有情緒困難。',[7,9,10],F('[可坦誠表達的孩子] are more likely to [理解感受、表達需要、建立健康關係]','具體解釋自我表達的情感與社交作用。','要說明表達機會如何可能影響內在理解及與人互動時。',[['Children who are allowed to speak openly','slot','可坦誠表達的孩子'],[' are more likely to ','link','更可能'],['understand their own feelings, communicate their needs, and build healthier relationships with others.','slot','理解感受、表達需要、建立健康關係']])),
  S('Silencing or overprotecting young people may make them afraid to disagree or defend themselves.','If...always...may... 設極端壓制條件及兩種可能後果。','不是說所有規矩與保護都有害。',[7,8,10],F('If [年輕人總被壓制或過護], they may grow up [怕分歧或不會為自己辯護]','用反面情境突出表達機會的重要。','要說明持續壓制或過度保護可能帶來的長遠風險時。',[['If ','link','設定條件'],['young people are always silenced or overprotected','slot','年輕人總被壓制或過護'],[', they may grow up ','link','長大後可能'],['afraid of disagreement or unable to defend themselves.','slot','怕分歧或不會為自己辯護']])),
  S('Listening to a child’s views makes the child feel respected rather than controlled.','when 設父母聆聽；rather than 對比尊重與控制感。','例子未說父母必須同意孩子所有看法。',[8,9,11],F('When [父母聆聽孩子對學校友誼及未來的看法], [孩子] feels [受尊重] rather than [被控制]','具體展示自由表達如何影響親子感受。','要以一個日常互動例子對比被聽見與被控制的感受時。',[['For instance, when ','link','引出例子'],['parents listen to a child’s views about school, friendships, or future goals','slot','父母聆聽孩子對學校友誼及未來的看法'],[', ','link','則'],['the child','slot','孩子'],[' feels ','link','覺得'],['respected','slot','受尊重'],[' rather than ','link','而非'],['controlled.','slot','被控制']])),
  S('Reasonable freedom builds confidence and judgment without permitting every wish.','This does not mean...but... 明確畫出自由的界線，再列合理自由的能力效益。','不能把作者的正面立場解讀為完全放任。',[4,10,12],F('This does not mean [孩子可為所欲為], but [合理自由] can help develop [自信、判斷及身份認同]','預防「更多自由等於毫無界線」的誤讀。','支持自主時，須同時界定合理限制與正面效益。',[['This does not mean ','link','排除極端解讀'],['children should be allowed to do whatever they want','slot','孩子可為所欲為'],[', but ','link','而'],['reasonable freedom','slot','合理自由'],[' can help them develop ','link','可培養'],['confidence, judgment, and a stronger sense of identity.','slot','自信、判斷及身份認同']])),
  S('More freedom is a positive change.','In conclusion 簡潔重申正面評價，下一句補上引導界線。','不能只讀此句而忽略 reasonable freedom 與 guidance。',[1,11,13],F('[給孩子更多自由] is [正面改變]','直接重答正負面題目。','已論證自主與表達，結論要清晰重申整體評價時。',[['In conclusion, ','link','總結'],['giving children more freedom','slot','給孩子更多自由'],[' is ','link','是'],['a positive change.','slot','正面改變']])),
  S('Children still need guidance, while independence and expression help them grow into mature adults.','Although 承認引導必要；主句指出獨立表達培養責任、自信、情感成熟。','作者主張自由與引導並存。',[2,7,11],F('Although [引導仍必要], [獨立與自我表達] are essential for [成為負責、自信及情感成熟成人]','以有界線的自由收束全文。','主張增加自主時，同時承認適當引導仍必要。',[['Although ','link','先承認'],['guidance is still necessary','slot','引導仍必要'],[', ','link','但'],['independence and self-expression','slot','獨立與自我表達'],[' are essential for helping young people become ','link','對年輕人成為...重要'],['responsible, confident, and emotionally mature adults.','slot','負責、自信及情感成熟成人']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為孩子比前代有更多自由是正面還是負面？',['正面：適齡選擇及表達有助獨立、自信和情感成長，仍需引導','負面：孩子只能毫無疑問地服從','正面：孩子應完全不受任何規矩約束','沒有立場：文章只談時間表'],'positive development；reasonable freedom；guidance still necessary。'),
  {type:'multi',prompt:'選出兩組不同的支持理由',detail:'選兩項，再按「確認」。',options:['適齡選擇和從小錯誤學習，可培養獨立判斷及責任感','坦誠表達有助理解感受、溝通需要與建立健康關係','自由等於孩子想做甚麼便做甚麼','孩子不用再聽任何父母意見'],correct:[0,1],why:'第一段談決策與責任；第二段談情感及社交表達。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 更自由是正面','較多自主可建立自信並準備成年生活。'],
  ['主體段一 · 適齡決策','比較過往服從與今天選擇，時間表例子說錯誤可教責任。'],
  ['主體段二 · 表達與情感','能說出感受及需要，較易有健康關係；自由仍需合理界線。'],
  ['結論 · 自由配合引導','獨立及自我表達讓孩子成為成熟成人，引導仍必要。'],
],'自由增加 → 適齡決策訓練 → 情感表達 → 合理自由與引導共存。')];
const evidence=[
  Q('為何過去無條件服從未必足夠？',['可能令孩子守紀律，卻未必訓練獨立思考','過去所有孩子都完全不守規矩','紀律與思考必然相同','所有成年人都不會提供建議'],'disciplined but not necessarily thoughtful 區分兩種能力。'),
  Q('適齡選擇讓孩子學甚麼？',['思考、比較選項及承擔決定後果','只學會避開所有責任','必然做出永不出錯的選擇','完全不用成年人協助'],'age-appropriate 保留年齡界線。'),
  Q('學習時間表例子說明錯誤的甚麼作用？',['可在可信任的自主安排中學習責任感','錯誤永遠沒有學習價值','父母持續控制必然比自主更能教責任','孩子應處理所有嚴重決策'],'may make mistakes；can teach responsibility。'),
  Q('坦誠說話與哪三方面相連？',['理解自己感受、表達需要及建立較健康關係','只學會爭吵','完全不需聆聽他人','必然永遠沒有情緒問題'],'more likely 表可能，不保證每人結果。'),
  Q('持續壓制或過度保護可能造成甚麼？',['長大後害怕分歧或不會為自己辯護','人人必然立即成熟','必然更善於說出需要','完全不影響成長'],'If...always...may grow up...。'),
  Q('作者有沒有主張孩子可做任何事？',['沒有；合理自由應與必要引導並存','有；作者要求完全放任','作者只討論過去，沒給界線','作者認為所有規矩都必然有害'],'This does not mean...whatever they want；guidance still necessary。'),
];
const logic=[
  sequence('第一主體段：適齡自由如何培養獨立？',[
    ['主張','自由讓孩子較早培養獨立性。'],
    ['舊式對照','無條件服從或有紀律但未必善思考。'],
    ['適齡選擇','比較選項並承擔決定後果。'],
    ['時間表例子','可信任的孩子或犯錯，並從中學責任。'],
    ['成年連結','自由如現實生活訓練場。'],
  ],'過去服從限制思考 → 適齡選擇與錯誤 → 責任與成年準備。'),
  sequence('第二主體段：自由表達有何益處與界線？',[
    ['主張','自由鼓勵自我表達和情感成長。'],
    ['正面作用','理解感受、溝通需要、建立健康關係。'],
    ['反面情況','壓制或過護可能令孩子怕分歧與自我辯護。'],
    ['家庭例子','父母聆聽學校、朋友及未來看法，孩子感到受尊重。'],
    ['界線','合理自由並非為所欲為，可培養自信和判斷。'],
  ],'表達機會 → 情感社交能力 → 聆聽示範 → 合理界線。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('孩子可選擇今晚先做哪一科功課，並自己安排時間。','文章會如何看這種自由？',['這是適齡決策練習，可學比較選項及承擔結果','孩子應自行決定所有成年財務問題','父母必須永遠替他安排每分鐘','任何選擇都必然有害'],['age-appropriate choices 是關鍵界線。','不是適齡。','阻止練習。','與作者相反。'],[2,4,5],'age-appropriate choices；accept the consequences。'),
  T('學生自己訂學習時間表，第一次安排不好，下一次作了調整。','哪條原文推理最適合？',['可從可控錯誤中學責任，比一直被父母控制更能訓練自主','錯誤證明孩子永遠不能自己決定','必須取消任何父母引導','只有完全不犯錯才能學責任'],['時間表例子以 may sometimes make mistakes 支持責任學習。','作者說錯誤有作用。','引導仍需。','錯誤可學習。'],[4,5,6],'mistakes can teach him responsibility。'),
  T('有人說：「服從成人就等於具備判斷力。」','文章如何區分？',['服從或培養紀律，但未必讓孩子學會思考與比較選擇','服從必然完全沒有任何價值','所有過去孩子都沒有紀律','判斷力只來自年齡增長'],['disciplined but not necessarily thoughtful。','原文承認紀律。','與原文不符。','選擇可訓練。'],[3,4],'disciplined but not necessarily thoughtful。'),
  T('孩子說出對友誼的擔憂，父母聽完後一起討論。','哪項最符合第二段？',['被允許坦誠表達有助理解感受及說出需要，並可能改善關係','孩子說話就代表可做任何事','父母只應禁止孩子講感受','只談學校功課才算表達'],['表達與情感關係是第二理由。','合理自由仍有限制。','與作者相反。','原文包括 friendships。'],[7,8,10],'allowed to speak openly...communicate their needs。'),
  T('家長聆聽孩子對未來目標的想法，但不一定同意。','作者會如何判斷聆聽的價值？',['孩子較可能感到受尊重而非被控制；聆聽不等於無條件同意','只要不同意便等於沒聆聽','孩子應完全不需任何引導','只有父母的想法可被說出'],['原文談 listen 與 respected，未要求同意全部看法。','聆聽可伴分歧。','引導仍必要。','孩子可表達。'],[8,10,11],'child feels respected rather than controlled。'),
  T('學校允許年幼學生選擇閱讀活動，卻仍由教師設安全及時間界線。','這最符合哪個原則？',['合理、適齡的自主可與成人引導共存','自由必須完全沒有任何界線','所有決定都應只由教師作出','適齡選擇必然破壞紀律'],['age-appropriate／reasonable freedom／guidance 三處相符。','作者排除為所欲為。','孩子需練習。','原文未說必然破壞。'],[4,11,13],'reasonable freedom；guidance is still necessary。'),
  T('有人說：「作者支持孩子想做任何事都可以。」','哪項更正最準確？',['作者明說不代表可為所欲為，提倡合理自由與必要引導','轉述完全正確','作者反對孩子表達任何看法','作者主張父母永不聽孩子'],['This does not mean...whatever they want。','與原文明確相反。','作者支持表達。','聆聽例子相反。'],[10,11,13],'This does not mean children should be allowed to do whatever they want。'),
  T('某孩子被過度保護，從未有機會表達反對意見。','文章指出哪種可能的成年後果？',['可能害怕分歧或不懂為自己辯護','必然具備更強自我表達能力','每名孩子結果都必然一樣','不表達一定等於情感成熟'],['If...always silenced or overprotected...may。','與原文相反。','may 保留差異。','情感能力需練習。'],[7,8,9],'afraid of disagreement or unable to defend themselves。'),
  T('一個孩子自己選課外活動，並在發現不合適後改選。','可跨題使用哪種成長論？',['適齡選擇及處理後果可成為現實生活決策的練習','任何改選都代表孩子不負責','只要由成人代選便一定更好','所有孩子應自行決定所有重大法律事務'],['training ground 比喻早期可控練習。','從錯誤可學。','並非必然。','違反適齡界線。'],[4,5,6],'freedom acts as a training ground for real life。'),
  T('有人評估自由時只問孩子是否「更快樂」，完全不看能力發展。','哪組結果更符合本文？',['獨立判斷、自信、表達需要、健康關係與成年準備','只有即時娛樂感','只看服從成人次數','只看孩子能否買東西'],['文章列具體成長能力而非只談快樂。','不足以涵蓋。','作者比較服從與思考。','無關核心。'],[1,2,4,7,8,11,13],'confident；independence；self-expression；emotionally mature。'),
  T('某政策說「給孩子更多自由」卻不指明年齡或風險界線。','文章會要求甚麼修正？',['自由須符合年齡並屬合理，同時保留必要引導','完全取消所有孩子自主','所有年齡都能承擔相同決策','家長不應了解任何孩子選擇'],['age-appropriate、reasonable、guidance 都提供界線。','作者支持自由。','年齡界線必要。','引導重要。'],[4,11,13],'age-appropriate choices；reasonable freedom；guidance。'),
  T('要用一句話概括全文。','哪項最準確？',['作者視更多自由為正面：適齡選擇與自我表達可培養責任、自信和情感成熟，仍需引導','作者主張孩子完全不需成年人','作者認為無條件服從必然最能培養思考','作者否認從小錯誤學習的價值'],['兩主體段和結論共同構成此判斷。','引導仍必要。','作者質疑此等同。','錯誤可教責任。'],[1,2,4,5,7,8,11,12,13],'positive change；guidance still necessary。'),
];
const reviewedExamples=[
  'Students are often given choices, whether in homework or after-school clubs.',
  'I believe limited choice is valuable because it teaches planning.',
  'The main benefit is that practice allows beginners to develop confidence.',
  'In older classrooms, many pupils were expected to follow instructions, which could make them orderly, but not necessarily thoughtful.',
  'By contrast, when learners choose a project, they learn to compare options.',
  'For example, a young player may sometimes miss a goal, but that mistake can teach him patience more effectively than constant praise.',
  'In this sense, practice acts as a safe test, where learners must make decisions.',
  'Another reason personal choice is positive is that it encourages self-expression.',
  'Children who ask questions are more likely to understand their needs.',
  'If teenagers never make choices, they may grow up unsure how to decide.',
  'For instance, when a child explains a worry, the child feels heard rather than ignored.',
  'This does not mean children can ignore rules, but fair choices can help them develop judgment.',
  'In conclusion, guided choice is valuable.',
  'Although rules matter, personal choices are essential for helping young people become independent adults.',
];
reviewedExamples.forEach((example,i)=>{structures[i].example=example;});
const reviewedTransfer=[
  [
    ['自己安排功課可練比較選項與承擔結果','只由成人指定科目，孩子毋須比較選項','孩子選完科目，便毋須再完成任何功課','只看選擇是否愉快，不檢查安排後的責任'],
    ['適齡選擇讓孩子練習決定並承擔後果。','成人全代決定，孩子沒有練習。','選擇仍須完成學習責任。','自由的益處包括處理結果，不只看心情。']
  ],
  [
    ['從可控錯誤學責任，比全程受控更能練自主','第一次安排不好，便永久禁止學生自行安排','只表揚按表行事，未討論錯誤如何改進','由家長重訂每次時間表，孩子不需反思結果'],
    ['試錯和調整可培養責任，不必由成人控制到底。','一次可修正錯誤不足以否定學習機會。','沒有反思便失去從錯誤學習的部分。','家長全代安排，孩子未練到自主判斷。']
  ],
  [
    ['服從或帶來紀律，卻未必教孩子獨立判斷','只看孩子是否服從，便認定他會比較選項','把紀律視作無用，完全不需規則和成人引導','孩子能遵守命令，便不必練習自己作決定'],
    ['紀律可能存在，卻不能直接證明有判斷力。','服從和獨立比較選項不是同一能力。','原文沒有否定規則和引導。','只遵命會少了自主決策練習。']
  ],
  [
    ['坦誠表達有助理解感受、說出需要及改善關係','孩子說出擔憂後，父母便不必再聆聽和討論','只要求孩子接受安排，未讓他說明自己的擔憂','父母一聽見擔憂，便要毫無條件同意所有想法'],
    ['表達與聆聽可幫孩子理解情緒和關係。','說出感受後仍需要雙向交流。','壓下擔憂失去表達和理解機會。','聆聽不等於無條件同意。']
  ],
  [
    ['聆聽可令孩子感到受尊重，不等於全盤同意','只有父母同意目標，孩子才可能感到被尊重','父母可先聆聽，卻毋須考慮孩子的實際需要','只讓孩子說完，便可忽略後續的討論與引導'],
    ['被認真聽見與意見獲全數採納是兩回事。','尊重不以完全同意為前提。','聆聽還要理解和回應需要。','有表達機會後仍需要討論。']
  ],
  [
    ['適齡選擇可與教師安全及時間界線並存','孩子有選擇，教師便不應再設定任何安全規則','教師設好時間，孩子就不需要作任何閱讀選擇','只看選擇數目，不查年齡是否適合和安全'],
    ['合理自主與必要的成人引導可以同時存在。','自主不代表取消安全界線。','有界線仍可在其內作選擇。','選擇須符合年齡和風險。']
  ],
  [
    ['作者主張合理自由與引導，未准許為所欲為','把合理自由理解為孩子任何要求都要立即答應','因需要引導，便不給孩子任何自主選擇機會','只談自由帶來快樂，未處理責任與年齡界線'],
    ['原文明言自由須合理，成人引導仍有必要。','無條件答應不是合理或適齡的自由。','引導不要求取消所有自主。','文章還談責任與判斷能力。']
  ],
  [
    ['可能害怕分歧，較難為自己的需要辯護','只看孩子是否安靜，便認定他日後懂得表達','過度保護可減少爭執，故不必練習說出想法','孩子未有表達機會，卻假定其自信不受影響'],
    ['原文提出過度保護可能影響日後表達與自信。','安靜不代表能處理分歧。','避免爭執可能令孩子少了練習。','缺少表達經驗不能直接推成沒有影響。']
  ],
  [
    ['適齡選擇及處理後果，能練日後決策','孩子改選活動，便證明第一次選擇毫無價值','只讓成人代選，孩子不用比較不同活動','只問活動是否好玩，不看孩子如何調整決定'],
    ['選擇、發現不合適和改選是安全的決策練習。','修正正是從經驗中學習。','成人代選沒有給孩子練習機會。','還要看反思與處理後果的過程。']
  ],
  [
    ['看獨立、自信、表達與成年準備，不只看快樂','只問孩子是否開心，不看判斷與責任有否增長','只看有多少活動可選，不查孩子能否表達需要','只問家長是否省心，不看孩子長遠的能力發展'],
    ['作者的正面判斷包含多種能力和情感發展。','快樂只是可能感受，不能代替能力評估。','選項數量不等於孩子能作出成熟決定。','成人省心不是本文的學習目標。']
  ],
  [
    ['說明年齡與風險界線，並保留必要成人引導','只寫給孩子更多自由，不訂任何年齡或安全範圍','只要求成人批准每件小事，孩子沒有練習空間','只談自主能否令人開心，不說明何時需要引導'],
    ['合理自由須對年齡、風險和引導有清楚邊界。','口號缺少可操作的適齡條件。','成人全代決定，無法培養自主。','快樂不能替代安全和發展判準。']
  ],
  [
    ['適齡自由可培養責任、自信與成熟，但仍需引導','只強調孩子可自由選擇，忽略年齡及必要的界線','只強調成人應引導，卻不讓孩子練習表達與選擇','把服從當成成熟的唯一證據，未看判斷與自信'],
    ['完整回收自主、表達、成長和成人引導。','自由並非無邊界。','引導仍要給孩子練習空間。','服從未必等於成熟判斷。']
  ],
];
reviewedTransfer.forEach(([options,explanations],i)=>{
  transfer[i].options=options;
  transfer[i].explanations=explanations;
  transfer[i].why=explanations[0];
});
export default {
  key:'opinion:50',
  meta:{topic:'兒童更多自由、獨立決策與情感成長',summary:'作者認為孩子比前代有更多自由是正面變化。符合年齡的選擇使孩子比較選項、承擔後果，從可控錯誤中學責任；坦誠表達亦有助理解感受、溝通需要及建立關係。文章明確指出自由不等於為所欲為，合理自由仍須與成人引導並行。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
