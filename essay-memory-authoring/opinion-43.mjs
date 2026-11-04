const simple=[
  'Harm to the environment is a very serious problem today, and using fuel may seem like an easy place to start.',
  'But I strongly disagree that raising fuel prices is the best way to deal with environmental problems around the world.',
  'This plan does not take enough care over who it hurts, is unfair, and works much less well than spending money on lasting changes and setting rules.',
  'The first problem is that higher fuel prices would hurt many ordinary people who have no practical way to travel differently.',
  'In many towns and places in the countryside, workers, parents, and people who run small businesses need cars or vans because buses and trains are few, do not run on time, or do not exist.',
  'If petrol or diesel costs much more, these people may still need to drive and simply have less money for food, rent, doctors, or school.',
  'For example, a delivery driver who needs to travel every day to earn money cannot suddenly stop using fuel when prices go up.',
  'Then the plan costs people money instead of truly helping the environment.',
  'A better plan is to make ways of travelling and using energy that are cleaner, easy to use, and appealing.',
  'Governments should spend more on buses and trains, energy from the sun and wind, places to charge cars, and better city plans, so people can use less fuel without giving up basic needs.',
  'When buses come often, trains are not too costly, and clean energy is easy to get, people can make cleaner choices as part of everyday life instead of feeling forced to give things up.',
  'Governments should also set strong rules for businesses that cause a lot of pollution, because drivers are not the only cause of global environmental harm.',
  'Factories, airlines, shipping businesses, and energy companies must update how they work and make less pollution where it begins.',
  'In short, raising fuel prices is not the best way to solve environmental problems around the world.',
  'Real progress comes from giving people cleaner options and making big polluters take responsibility, not just making ordinary people pay more to live.',
];
const vocabulary=[
  [['Environmental damage','Harm to the environment','環境破壞'],['one of the most serious challenges','a very serious problem','極嚴重挑戰'],['fuel consumption','using fuel','燃料消耗'],['obvious target','easy place to start','明顯針對目標']],
  [['However','But','然而'],['completely disagree','strongly disagree','完全不同意'],['making fuel more expensive','raising fuel prices','提高燃料價格'],['global environmental problems','environmental problems around the world','全球環境問題']],
  [['approach','plan','做法'],['too blunt','does not take enough care over who it hurts','過於粗暴'],['far less effective','works much less well','遠不如有效'],['long-term investment','spending money on lasting changes','長期投資'],['regulation','setting rules','監管']],
  [['higher fuel prices','higher fuel prices','更高燃料價'],['punish','hurt','懲罰'],['ordinary people','ordinary people','普通人'],['realistic way','practical way','現實可行方法'],['change their behaviour','travel differently','改變行為']],
  [['rural areas','places in the countryside','鄉郊地區'],['workers, parents, and small business owners','workers, parents, and people who run small businesses','工人父母與小企業主'],['depend on','need','依賴'],['public transport','buses and trains','公共交通'],['limited, unreliable, or simply unavailable','few, do not run on time, or do not exist','有限、不可靠或沒有']],
  [['becomes much more expensive','costs much more','變得昂貴得多'],['may not drive less','may still need to drive','未必減少駕駛'],['less money','less money','更少金錢'],['healthcare','doctors','醫療'],['education','school','教育']],
  [['delivery driver','delivery driver','送貨司機'],['income depends on daily travel','needs to travel every day to earn money','收入依賴每日出行'],['cannot suddenly stop using fuel','cannot suddenly stop using fuel','不能突然停用燃料'],['prices rise','prices go up','價格上升']],
  [['In this case','Then','在此情況'],['financial burden','costs people money','經濟負擔'],['genuine environmental solution','truly helping the environment','真正環境方案']],
  [['A better answer','A better plan','更好的方案'],['cleaner choices','ways of travelling and using energy that are cleaner','更清潔選擇'],['practical','easy to use','實際可行'],['attractive','appealing','有吸引力']],
  [['invest heavily','spend more','大量投資'],['public transport','buses and trains','公共交通'],['renewable energy','energy from the sun and wind','可再生能源'],['charging networks','places to charge cars','充電網絡'],['greener urban design','better city plans','更環保城市設計'],['reduce fuel use','use less fuel','減少燃料使用'],['without sacrificing their basic needs','without giving up basic needs','不犧牲基本需要']],
  [['frequent','come often','班次頻密'],['affordable','not too costly','可負擔'],['widely available','easy to get','廣泛可得'],['lower-emission behaviour','make cleaner choices','低排放行為'],['natural part of daily life','part of everyday life','日常生活自然部分'],['forced sacrifice','feeling forced to give things up','被迫犧牲']],
  [['strict rules','strong rules','嚴格規則'],['industries','businesses','行業'],['large amounts of pollution','a lot of pollution','大量污染'],['global environmental damage','global environmental harm','全球環境破壞'],['not caused only by private drivers','drivers are not the only cause','非僅私人駕駛者造成']],
  [['Factories','Factories','工廠'],['shipping companies','shipping businesses','航運公司'],['energy producers','energy companies','能源生產商'],['modernise their systems','update how they work','系統現代化'],['reduce emissions at source','make less pollution where it begins','從源頭減排']],
  [['In conclusion','In short','總結'],['increasing the cost of fuel','raising fuel prices','提高燃料成本'],['not the best solution','not the best way','並非最佳方案'],['global environmental problems','environmental problems around the world','全球環境問題']],
  [['Real progress','Real progress','真正進展'],['cleaner alternatives','cleaner options','更清潔替代方案'],['holding major polluters responsible','making big polluters take responsibility','令主要污染者負責'],['making everyday life more expensive for ordinary people','making ordinary people pay more to live','令普通人生活更貴']],
];
const chunkOverrides=[
  ['Environmental damage is one of the most serious challenges facing the modern world,','and fuel consumption is often seen as an obvious target.'],
  ['However, I completely disagree','that making fuel more expensive is the best way to deal with global environmental problems.'],
  ['This approach is too blunt, too unfair,','and far less effective than long-term investment and regulation.'],
  ['The first problem is that higher fuel prices would punish many ordinary people','without giving them a realistic way to change their behaviour.'],
  ['In many towns and rural areas, workers, parents, and small business owners depend on cars or vans','because public transport is limited, unreliable, or simply unavailable.'],
  ['If petrol or diesel becomes much more expensive,','these people may not drive less;','they may just have less money for food, rent, healthcare, or education.'],
  ['For example, a delivery driver whose income depends on daily travel','cannot suddenly stop using fuel because prices rise.'],
  ['In this case, the policy becomes a financial burden','rather than a genuine environmental solution.'],
  ['A better answer is to make cleaner choices','that are practical and attractive.'],
  ['Governments should invest heavily in public transport, renewable energy, charging networks, and greener urban design','so that people can reduce fuel use without sacrificing their basic needs.'],
  ['When buses are frequent, trains are affordable, and clean energy is widely available,','lower-emission behaviour becomes a natural part of daily life','rather than a forced sacrifice.'],
  ['At the same time, strict rules should be placed on industries that produce large amounts of pollution,','because global environmental damage is not caused only by private drivers.'],
  ['Factories, airlines, shipping companies, and energy producers','must also be required to modernise their systems and reduce emissions at source.'],
  ['In conclusion, increasing the cost of fuel','is not the best solution to global environmental problems.'],
  ['Real progress depends on building cleaner alternatives and holding major polluters responsible,','not simply making everyday life more expensive for ordinary people.'],
];
const simpleChunkOverrides=[
  ['Harm to the environment is a very serious problem today,','and using fuel may seem like an easy place to start.'],
  ['But I strongly disagree','that raising fuel prices is the best way to deal with environmental problems around the world.'],
  ['This plan does not take enough care over who it hurts, is unfair,','and works much less well than spending money on lasting changes and setting rules.'],
  ['The first problem is that higher fuel prices would hurt many ordinary people','who have no practical way to travel differently.'],
  ['In many towns and places in the countryside, workers, parents, and people who run small businesses need cars or vans','because buses and trains are few, do not run on time, or do not exist.'],
  ['If petrol or diesel costs much more,','these people may still need to drive','and simply have less money for food, rent, doctors, or school.'],
  ['For example, a delivery driver who needs to travel every day to earn money','cannot suddenly stop using fuel when prices go up.'],
  ['Then the plan costs people money','instead of truly helping the environment.'],
  ['A better plan is to make ways of travelling and using energy that are cleaner,','easy to use, and appealing.'],
  ['Governments should spend more on buses and trains, energy from the sun and wind, places to charge cars, and better city plans,','so people can use less fuel without giving up basic needs.'],
  ['When buses come often, trains are not too costly, and clean energy is easy to get,','people can make cleaner choices as part of everyday life','instead of feeling forced to give things up.'],
  ['Governments should also set strong rules for businesses that cause a lot of pollution,','because drivers are not the only cause of global environmental harm.'],
  ['Factories, airlines, shipping businesses, and energy companies','must update how they work and make less pollution where it begins.'],
  ['In short, raising fuel prices','is not the best way to solve environmental problems around the world.'],
  ['Real progress comes from giving people cleaner options and making big polluters take responsibility,','not just making ordinary people pay more to live.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Rising rent is one of the most serious pressures on city families, and rent control is often seen as an obvious target.','and 連結環境問題嚴重性與燃料成討論焦點。','此句交代背景，並未認同漲價是最佳方法。',[1,2,3],F('[環境破壞] is one of the most serious [現代挑戰], and [燃料消耗] is often seen as [明顯對象]','先承認問題，再引出政策針對對象。','要介紹公共問題及人們常提出的介入點時。',[['Environmental damage','slot','環境破壞'],[' is one of the most serious ','link','是最嚴重的其中一項'],['challenges facing the modern world','slot','現代挑戰'],[', and ','link','而'],['fuel consumption','slot','燃料消耗'],[' is often seen as ','link','常被視為'],['an obvious target.','slot','明顯對象']])),
  S('However, I completely disagree that raising train fares is the best way to reduce crowded roads.','However 轉折；completely disagree 直接回答題目的 best way。','作者反對漲價為最佳方案，不等於否認燃料消耗問題。',[0,2,14],F('However, I completely disagree that [提高燃料價格] is [處理全球環境問題的最佳方法]','引言直接評估題目所提政策。','已承認問題嚴重，接着須表明是否贊成特定最佳方案時。',[['However, I completely disagree that ','link','轉折並表態'],['making fuel more expensive','slot','提高燃料價格'],[' is ','link','是'],['the best way to deal with global environmental problems.','slot','處理全球環境問題的最佳方法']])),
  S('This policy is too blunt, and far less effective than reliable buses and safer cycling routes.','too blunt/too unfair 指漲價缺乏針對性並分配不公；than 預告替代措施。','這是作者論證提綱，後文才逐項解釋。',[1,3,8],F('[提高燃料價格做法] is [過於粗暴及不公平], and far less effective than [長期投資與監管]','概述問題與替代方向。','要在引言用一句話預告為何反對一項政策及傾向何種替代時。',[['This approach','slot','提高燃料價格做法'],[' is ','link','屬'],['too blunt, too unfair','slot','過於粗暴及不公平'],[', and far less effective than ','link','效果遠不如'],['long-term investment and regulation.','slot','長期投資與監管']])),
  S('The first problem is that higher ticket prices would punish commuters without giving them a realistic way to change their behaviour.','without giving them a realistic way 指沒有可行替代；would punish 說成本落在普通人身上。','作者不是說任何人都無法減少燃料使用。',[2,4,5],F('[更高燃料價] would punish [許多普通人] without giving them [可行的行為改變方法]','先界定漲價的公平與可行性問題。','要指出價格措施如何讓缺少替代選擇的人承擔不成比例的成本時。',[['The first problem is that ','link','引出第一問題'],['higher fuel prices','slot','更高燃料價'],[' would punish ','link','會令...承擔代價'],['many ordinary people','slot','許多普通人'],[' without giving them ','link','卻不給予'],['a realistic way to change their behaviour.','slot','可行的行為改變方法']])),
  S('In remote villages, workers and parents depend on cars because the nearest bus is unreliable or unavailable.','because 把駕車需要連到公共交通有限、不可靠或缺席。','此處談特定地區群體，不把所有城市居民概括為同樣受限。',[3,5,6],F('In [城鎮和鄉郊], [工人、父母和小企業主] depend on [汽車或貨車] because [公共交通有限、不可靠或沒有]','給出價格政策缺乏替代選擇的具體情境。','要說明一群人為何不能因成本變化而迅速改變行為時。',[['In ','link','界定地區'],['many towns and rural areas','slot','城鎮和鄉郊'],[', ','link','這些地方的'],['workers, parents, and small business owners','slot','工人、父母和小企業主'],[' depend on ','link','依賴'],['cars or vans','slot','汽車或貨車'],[' because ','link','因為'],['public transport is limited, unreliable, or simply unavailable.','slot','公共交通有限、不可靠或沒有']])),
  S('If bus fares rise sharply, these commuters may not travel less; they may just have less money for groceries and rent.','If 設價格上升；may not drive less; may just have less money 對比政策意圖與可能結果。','原文不是說所有受影響者必然完全不減少駕駛。',[3,4,7],F('If [汽油或柴油大幅漲價], [這些人] may not [少駕駛]; they may just have [更少食物、租金、醫療和教育預算]','顯示價格政策可能轉嫁至基本生活費。','當一項需求難以減少，要解釋漲價如何擠壓其他必需開支時。',[['If ','link','設定漲價'],['petrol or diesel becomes much more expensive','slot','汽油或柴油大幅漲價'],[', ','link','那麼'],['these people','slot','這些人'],[' may not ','link','未必'],['drive less','slot','少駕駛'],['; they may just have ','link','反而可能有'],['less money for food, rent, healthcare, or education.','slot','更少食物、租金、醫療和教育預算']])),
  S('For example, a nurse whose shifts end after the last bus cannot suddenly stop using a car because prices rise.','whose income depends... 限定工作需要；cannot suddenly 指短期無法避開成本。','例子是有特定工作需求者，不聲稱所有人一樣。',[4,5,7],F('For example, [收入靠每日出行的送貨司機] cannot [突然停用燃料] because [價格上升]','用工作例子證明某些燃料需求難迅速改變。','要把「缺少替代方式」變成容易理解的個人情境時。',[['For example, ','link','引出例子'],['a delivery driver whose income depends on daily travel','slot','收入靠每日出行的送貨司機'],[' cannot ','link','不能'],['suddenly stop using fuel','slot','突然停用燃料'],[' because ','link','只因'],['prices rise.','slot','價格上升']])),
  S('In this case, the fare rise becomes a financial burden rather than a genuine environmental solution.','In this case 回指司機與必要出行；rather than 對比負擔與環境效果。','作者批評在缺少替代選擇的情況下單純加價。',[5,6,8],F('In this case, [政策] becomes [經濟負擔] rather than [真正環境方案]','從具體例子推出政策效果判斷。','當措施增加成本卻未改變問題成因，要指出它的反效果時。',[['In this case, ','link','承接前述情境'],['the policy','slot','政策'],[' becomes ','link','成為'],['a financial burden','slot','經濟負擔'],[' rather than ','link','而非'],['a genuine environmental solution.','slot','真正環境方案']])),
  S('A better answer is to make cleaner transport choices that are practical and attractive.','A better answer 指替代方案；practical and attractive 雙條件，既能用又願用。','作者尚未列方法，下一句才談交通、能源及城市設計。',[7,9,10],F('A better answer is to make [更清潔選擇] [實際可行又有吸引力]','提出替代方案的設計標準。','批評一項方案後，要先界定更可行的替代方案應具備甚麼條件時。',[['A better answer is to make ','link','提出替代方向'],['cleaner choices','slot','更清潔選擇'],[' that are ','link','變得'],['practical and attractive.','slot','實際可行又有吸引力']])),
  S('Governments should invest heavily in frequent buses and safe cycle paths so that commuters can reduce fuel use without sacrificing their basic needs.','so that 指投資目的；without sacrificing 指減排不應以基本需要為代價。','作者提到四種投資，沒有說任何一項單獨足夠。',[8,10,11],F('[政府] should invest heavily in [公共交通、可再生能源、充電網絡和綠色城市設計] so that [人們] can [少用燃料而不犧牲基本需要]','把設施投資連到可行的減排選擇。','要說明政策如何提供替代途徑，而不只是要求個人承擔成本時。',[['Governments','slot','政府'],[' should invest heavily in ','link','應大量投資'],['public transport, renewable energy, charging networks, and greener urban design','slot','公共交通、可再生能源、充電網絡和綠色城市設計'],[' so that ','link','目的在於'],['people','slot','人們'],[' can ','link','可以'],['reduce fuel use without sacrificing their basic needs.','slot','少用燃料而不犧牲基本需要']])),
  S('When local buses are frequent, clean travel becomes a natural part of daily life rather than a forced sacrifice.','When 列三個條件；rather than 對比自然選擇與被迫犧牲。','此句強調可行性，並未保證所有人立刻停止使用燃料。',[8,9,11],F('When [巴士頻密、火車可負擔、清潔能源普及], [低排放行為] becomes [日常自然選擇] rather than [被迫犧牲]','把基礎設施改善連到日常行為改變。','要解釋一種更好的選擇在甚麼條件下容易被採納時。',[['When ','link','設定條件'],['buses are frequent, trains are affordable, and clean energy is widely available','slot','巴士頻密、火車可負擔、清潔能源普及'],[', ','link','便令'],['lower-emission behaviour','slot','低排放行為'],[' becomes ','link','成為'],['a natural part of daily life','slot','日常自然選擇'],[' rather than ','link','而非'],['a forced sacrifice.','slot','被迫犧牲']])),
  S('At the same time, strict rules should be placed on large industrial emitters, because the problem is not caused only by private drivers.','At the same time 加入另一政策；because 解釋不能只向私人司機施壓。','文章並未主張產業是唯一污染來源。',[9,10,12],F('At the same time, [大量污染行業] should face [嚴格規則] because [環境破壞並非僅由私人司機造成]','把責任由個人擴展至大型污染源。','要指出責任分配過窄，仍有其他來源或行動者需要處理時。',[['At the same time, ','link','加入並行措施'],['strict rules','slot','嚴格規則'],[' should be placed on ','link','應施於'],['industries that produce large amounts of pollution','slot','大量污染行業'],[', because ','link','因為'],['global environmental damage is not caused only by private drivers.','slot','環境破壞並非僅由私人司機造成']])),
  S('Large factories must also be required to modernise their systems and reduce emissions at source.','must also be required 指產業也須擔責；at source 指在排放產生處處理。','作者提出行業類別，沒有給出個別企業違法事實。',[10,11,14],F('[工廠、航空、航運及能源業] must also be required to [系統現代化並從源頭減排]','具體列出需受監管的大型污染行業及行動。','說明問題有多個來源後，要列出其他責任者與具體要求時。',[['Factories, airlines, shipping companies, and energy producers','slot','工廠、航空、航運及能源業'],[' must also be required to ','link','亦須'],['modernise their systems and reduce emissions at source.','slot','系統現代化並從源頭減排']])),
  S('In conclusion, increasing the cost of daily travel is not the best solution to crowded urban roads.','In conclusion 精確重申作者反對的「最佳」判斷。','不是說燃料消耗無環境影響。',[1,9,14],F('In conclusion, [提高燃料成本] is not [解決全球環境問題的最佳方案]','結論回到題目的政策比較。','列出原方案的缺點及替代方法後，要回到題目重申比較判斷時。',[['In conclusion, ','link','總結'],['increasing the cost of fuel','slot','提高燃料成本'],[' is not ','link','並非'],['the best solution to global environmental problems.','slot','解決全球環境問題的最佳方案']])),
  S('Real progress depends on practical alternatives and effective rules, not simply making everyday life more expensive for ordinary people.','depends on...not simply... 對比結構性替代方案與單純讓普通人付更多。','作者並未提出確切財政來源或預測減排數字。',[2,9,11],F('[真正進展] depends on [建立清潔替代方案及令大污染者負責], not simply [令普通人生活更貴]','以替代方案和責任分配作全文收束。','要在結尾區分根本改變與只把成本轉嫁給民眾時。',[['Real progress','slot','真正進展'],[' depends on ','link','取決於'],['building cleaner alternatives and holding major polluters responsible','slot','建立清潔替代方案及令大污染者負責'],[', not simply ','link','並非只是'],['making everyday life more expensive for ordinary people.','slot','令普通人生活更貴']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意提高燃料價格是最佳環境方案？',['完全不同意：加價對缺少替代交通的人不公平，投資與監管更有效','完全同意：只需加價便能解決所有污染','沒有立場：只列污染行業','同意：無須任何公共交通投資'],'I completely disagree；too blunt, too unfair；investment and regulation。'),
  {type:'multi',prompt:'選出文章兩條不同的主體論證',detail:'選兩項，再按「確認」。',options:['無公共交通替代的人仍須駕車，加價可能擠壓食物與租金等必要開支','投資清潔選擇並規管大型污染行業，讓減排可行且分配責任','所有駕駛者都能立即停用燃料','只要巴士頻密，工廠排放便不需處理'],correct:[0,1],why:'第一段談加價對必要出行者的負擔；第二段談可行替代設施及工業監管。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對漲價最佳論','作者認為單純加價粗暴且不公平，較看好投資與監管。'],
  ['主體段一 · 必要出行負擔','交通有限者仍要駕車，加價可能減少食物、租金、醫療等預算。'],
  ['主體段二 · 清潔替代與污染責任','公共交通、能源與城市設計提供選擇，大型污染行業也須減排。'],
  ['結論 · 不能只轉嫁成本','真正進展靠替代方案及主要污染者責任。'],
],'必要出行難改 → 漲價或傷民生 → 設施投資與產業規則 → 責任更公平。')];
const evidence=[
  Q('燃料漲價為何對部分人不公平？',['部分城鎮與鄉郊公共交通有限，他們仍需汽車或貨車','因所有人都有便宜而可靠的火車','因所有駕車都是娛樂出行','因食物與租金不屬基本需要'],'沒有可行替代時，價格上升可轉成家庭經濟負擔。'),
  Q('文章舉送貨司機作例子有何作用？',['他的收入靠每日出行，不能因漲價便突然停用燃料','他可以完全停止工作而不影響收入','他證明每個居民都做送貨','他說明漲價一定令所有人不再駕車'],'例子把需求難迅速調整具體化。'),
  Q('燃料更貴後，部分家庭可能如何調整？',['未必少駕車，反而少了支付食物、租金、醫療或教育的錢','必然完全放棄駕駛且生活不受影響','所有基本生活開支都立即下降','只能減少污染行業的排放'],'may not drive less; may just have less money...。'),
  Q('作者建議投資甚麼以提供清潔替代？',['公共交通、可再生能源、充電網絡與更綠色城市設計','只提高燃料稅，不改善設施','取消所有巴士及火車','只建更多化石燃料設施'],'四種投資對應 practical and attractive choices。'),
  Q('為甚麼作者要求對產業實施嚴格規則？',['全球環境破壞並非只由私人駕駛者造成，大型污染源也須減排','工廠與航運公司完全不會排放','只有私人司機有環境責任','產業規則已在文中被證明完全無用'],'not caused only by private drivers；industries must reduce emissions at source。'),
  Q('文章如何對比清潔選擇與被迫犧牲？',['當交通頻密、負擔得起且清潔能源易得，減排可融入日常','清潔選擇必須永遠昂貴又難用','只需罰款，便不需任何替代方式','所有人都能不靠公共設施即時換交通工具'],'When 條件句解釋替代選擇的可行性。'),
];
const logic=[
  sequence('第一主體段：加價如何變成負擔？',[
    ['中心問題','較高燃料價懲罰欠缺可行改變途徑的人。'],
    ['交通條件','城鎮和鄉郊公共交通有限、不可靠或沒有。'],
    ['家庭後果','人們未必少駕車，卻可能少錢支付基本需要。'],
    ['送貨例子','收入靠每日出行的司機無法突然停用燃料。'],
    ['段落結論','政策成為經濟負擔，而非真正環境方案。'],
  ],'缺少替代 → 必須駕車 → 漲價擠壓基本開支 → 環境效果未必實現。'),
  sequence('第二主體段：有效替代與責任如何安排？',[
    ['方案標準','清潔選擇應實際可行及有吸引力。'],
    ['公共投資','交通、可再生能源、充電及城市設計使少用燃料可行。'],
    ['生活方式','設施易用時，低排放可自然融入日常。'],
    ['同時監管','大型污染行業亦須受嚴格規則約束。'],
    ['源頭減排','工廠、航空、航運與能源企業應更新系統。'],
  ],'提供選擇 → 日常行為易轉變 → 大污染源亦負責。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一個鄉郊鎮沒有巴士，居民需開車上班；政府只提高燃油價。','本文會指出甚麼缺口？',['先建可用交通，否則加價只令居民開支增加','先提高燃油價，公共交通可留待日後改善','先買電動車，才評估鄉郊居民有否能力','先限制駕車，再忽略工作與家庭出行需要'],['鄉郊欠實際替代，價格壓力未必改變駕駛，只添負擔。','交通改善若延後，加價時仍沒有選擇。','電動車購買能力不能被預設。','工作與家庭出行是政策公平性關鍵。'],[3,4,5],'without giving them a realistic way to change their behaviour。'),
  T('送貨員每天要用貨車才能獲收入，燃油價一夜間上升。','哪項最忠於文章？',['送貨不能即停，加價或擠壓食物與租金預算','送貨不能即停，所以燃油加價必能減排','送貨收入靠開車，便不必考慮日常開支','送貨需要燃料，但所有司機都能即改搭車'],['送貨員不能立刻停用燃料，價格可能擠壓基本開支。','不能即停正削弱加價可立即減排的假設。','收入依賴出行也要支付生活費。','不是所有送貨可轉搭公共交通。'],[5,6,7],'cannot suddenly stop using fuel because prices rise。'),
  T('政府加價後，仍沒有便宜可靠的火車服務。','文章提議補上甚麼？',['改善便宜可靠的交通，讓清潔選擇可實行','繼續加價，卻不改善火車服務的可靠度','只宣傳環保選擇，不處理交通費與班次','只要求少駕車，不看居民是否有其他方法'],['清潔選擇須實際可用而有吸引力。','加價不能代替可靠交通。','宣傳不能補足費用與班次障礙。','應先提供實際可選的替代。'],[8,9,10],'invest heavily in public transport...so that people can reduce fuel use。'),
  T('一個城市增加頻密巴士和可負擔的火車，居民開始自行少開車。','這如何支持文章？',['頻密且可負擔的交通，使少開車更易實行','只靠票價提高，使少開車成為被迫犧牲','班次雖頻密，仍要令火車票價更難負擔','交通已改善，但無需考察居民使用變化'],['頻密、可負擔的交通可使減排融入日常。','原文反對把改變變成強迫犧牲。','更高票價削弱可負擔性。','居民使用變化仍須觀察。'],[8,9,10],'lower-emission behaviour becomes a natural part of daily life。'),
  T('某國只對私家車徵費，卻不要求高污染工廠減排。','作者的第二主體段會提出哪項補充？',['也規管高污染工廠，要求從源頭減排','只向私家車收費，不問工廠排放情況','只要工廠報告排放，就毋須改善設備','要求工廠減排，卻認定交通沒有污染'],['私人司機不是唯一污染來源，大型工廠也須從源頭減排。','漏掉主要產業排放。','報告本身不等於設備改善。','規管工廠不等於否認交通污染。'],[11,12],'strict rules...industries；reduce emissions at source。'),
  T('航空公司更新設備，降低在營運源頭產生的排放。','這對應文章哪個要求？',['航空公司更新設備，符合源頭減排責任','航空公司只改廣告，便可代替設備更新','航空公司有改善，便不須再檢查排放','航空公司應負責，所以個人無須作改變'],['原文列航空公司為需現代化並源頭減排的行業。','廣告不能代替設備更新。','更新後仍須檢查實際排放。','大型污染者負責不會取消個人可行選擇。'],[11,12],'airlines...modernise their systems and reduce emissions at source。'),
  T('另一議題中，一項稅令低收入者付更多，但沒有提供可行替代服務。','哪個可跨題原則最有用？',['先看有否可行替代，再評估稅能否改變行為','先看稅收增加，再假定人們必能改變行為','先看稅率高低，再忽略低收入者的負擔','先看政策名稱，再忽略替代服務是否可用'],['跨題可轉用：要有可行替代，價格政策才可能改變行為。','稅收增加不能證明行為已變。','低收入者負擔屬原文公平關切。','政策名稱不能代替服務可用性。'],[3,4,5],'without giving them a realistic way to change their behaviour。'),
  T('研究者說：「燃油漲價必定令每位居民少駕車。」','哪項修正最貼近文章？',['沒替代交通的人未必少駕車，生活費或受擠壓','燃油價提高時，每個人都能立即停止駕車','即使沒有巴士，所有居民仍可輕易轉乘','只要價格提高，食物與房租開支都不變'],['may not drive less 與 may just have less money 都不是必然論。','原文舉無替代者作反例。','沒有巴士會限制轉乘。','基本生活費可能被價格壓縮。'],[4,5,6],'may not drive less; they may just have less money。'),
  T('有人把作者立場寫成「完全反對減少燃料使用」。','應如何更正？',['支持減少燃料使用，但靠清潔替代與產業規管','反對減少燃料使用，主張維持原有交通','支持減少燃料使用，只靠不斷提高價格','支持產業規管，卻不改善日常交通選擇'],['作者仍想減燃料，只反對把漲價當最佳方法。','引言承認燃料耗用是問題。','只靠加價忽略替代與公平。','清潔選擇與產業規管兩者都在結論中。'],[0,1,8,9,14],'people can reduce fuel use without sacrificing their basic needs。'),
  T('政府提出四項交通與能源工程，卻說不清楚與居民生活有何關係。','應補上哪條目的鏈？',['建設交通能源選擇，讓居民不失所需而減排','建設交通能源工程，但不查居民能否使用','只列工程名稱，便可證明燃料使用會下降','要求居民減排，但不處理基本出行需要'],['投資的 so that 目的，是使居民可減燃料又不失基本需要。','工程若不可用，就未必改變行為。','名稱不證明實際效果。','居民基本需要是作者明確保留的條件。'],[8,9,10],'so that people can reduce fuel use without sacrificing their basic needs。'),
  T('比較兩個方案：甲只增加日常開支，乙建立清潔交通並要求大污染者減排。','文章更支持哪項推理？',['乙兼顧可行選擇與大污染源，更合作者主張','甲只加日常開支，卻可立即解決所有污染','乙建新交通，便毋須再規管大型污染者','乙有產業規則，卻不須提供居民交通選擇'],['結論同時要求清潔替代和主要污染者負責。','作者指出甲可能只增加負擔。','乙若不規管產業就少了另一半。','乙若缺交通選擇也不完整。'],[2,9,11,12,14],'Real progress depends on building cleaner alternatives and holding major polluters responsible。'),
  T('要用一句話概括全文而不誇大。','哪項最準確？',['反對單靠燃油加價，主張替代交通與污染規管','反對減少燃油使用，也拒絕改善公共交通','支持持續加價，即使居民沒有其他交通','只要求普通人改變，不問大型污染行業'],['完整摘要包含反單純加價、可行替代與產業監管。','作者支持減少燃油使用。','無替代者可能受財務傷害。','大型污染者也須承擔責任。'],[1,3,5,8,9,11,12,14],'not the best solution；cleaner alternatives；major polluters responsible。'),
];
export default {
  key:'opinion:43',
  meta:{topic:'燃料價格、環境政策與可行清潔替代',summary:'作者完全反對把提高燃料價格視為最佳全球環境方案。公共交通不足者仍需駕車，漲價可能擠壓食物、租金、醫療與教育預算，而未令燃料使用減少。較好的方法是投資交通、可再生能源、充電網絡與城市設計，使清潔選擇可行，同時規管大型污染行業並從源頭減排。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
