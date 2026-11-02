const simple=[
  'Some people say governments spend far too much public money protecting wild animals when people have more urgent problems.',
  'I strongly disagree because protecting wild animals is needed to keep people safe, nature working well, and the economy strong over time.',
  'The first reason is that protecting wild animals helps keep the natural systems people need healthy.',
  'Animals and plants are not just there to look nice; they belong to living systems that affect the weather, keep soil healthy, help us grow food, and keep natural places in balance.',
  'If governments let forests, seas, and groups of animals die out, people will later face less food, floods, illness, and higher everyday costs.',
  'For example, if bees become fewer because their homes are destroyed, farmers may grow less food, and basic food may cost ordinary families more.',
  'So money spent protecting wild animals is not simply wasted in remote natural places.',
  'It helps keep the natural systems that human life needs working.',
  'Another point is that protecting nature and helping people should not be seen as two causes that must fight over the same money.',
  'Good governments must pay for hospitals, schools, homes, and safety, but they should not therefore stop protecting wild animals.',
  'In fact, many plans to protect nature also help people living nearby.',
  'Parks, protected areas at sea, and plans to save forests can provide work, bring visitors, keep water clean, and protect the jobs of people in the countryside.',
  'If these plans are run well, they do not use up public money without return; they bring benefits over many years.',
  'Doing nothing about wild animals may cost less now, but fixing harm to nature later may cost much more.',
  'In short, I disagree that governments spend too much on protecting wild animals.',
  'Other problems need real attention, but protecting wild animals helps build a safe and healthy society that can last.',
];
const vocabulary=[
  [['It is sometimes argued','Some people say','有人認為'],['waste excessive public money','spend far too much public money','浪費過多公共資金'],['wildlife conservation','protecting wild animals','野生動物保育'],['more urgent social problems','more urgent problems','更迫切社會問題']],
  [['strongly disagree','strongly disagree','強烈不同意'],['not a luxury','needed','並非奢侈'],['protecting wildlife','protecting wild animals','保護野生動物'],['environmental stability','nature working well','環境穩定'],['long-term economic security','economy strong over time','長遠經濟安全']],
  [['wildlife protection','protecting wild animals','保護野生動物'],['closely connected','helps keep','密切相關'],['health','healthy','健康'],['natural systems','natural systems','自然系統'],['on which people depend','people need','人類所依賴的']],
  [['decorative extras','just there to look nice','裝飾性附屬品'],['form part of complex ecosystems','belong to living systems','屬複雜生態系統一部分'],['regulate climate','affect the weather','調節氣候'],['maintain soil quality','keep soil healthy','維持土壤質素'],['support food production','help us grow food','支持糧食生產'],['natural habitats','natural places','自然棲息地']],
  [['allow','let','任由'],['animal populations','groups of animals','動物種群'],['collapse','die out','崩潰'],['food shortages','less food','糧食短缺'],['disease','illness','疾病'],['higher living costs','higher everyday costs','更高生活成本']],
  [['bee populations decline','bees become fewer','蜜蜂數量下降'],['habitats are destroyed','their homes are destroyed','棲息地受破壞'],['crop production can suffer','farmers may grow less food','農作物產量或受影響'],['basic food more expensive for ordinary families','basic food may cost ordinary families more','一般家庭基本食物更貴']],
  [['In this sense','So','從這意義上說'],['spending money on wildlife','money spent protecting wild animals','野生動物保育開支'],['not money thrown into the wilderness','not simply wasted in remote natural places','並非把錢丟到荒野']],
  [['an investment','helps','一項投資'],['invisible machinery','natural systems','無形運作系統'],['keeps human life running','human life needs working','維持人類生活']],
  [['conservation','protecting nature','保育'],['social welfare','helping people','社會福利'],['should not be treated as enemies','should not be seen as two causes that must fight','不應視為敵對'],['competing for the same piece of bread','over the same money','爭奪同一資源']],
  [['Responsible governments','Good governments','負責任政府'],['fund','pay for','資助'],['housing','homes','住房'],['public safety','safety','公共安全'],['pushed aside','stop protecting','擱置']],
  [['In fact','In fact','事實上'],['conservation projects','plans to protect nature','保育項目'],['benefit local communities directly','help people living nearby','直接惠及本地社區']],
  [['National parks','Parks','國家公園'],['marine reserves','protected areas at sea','海洋保護區'],['forest-protection schemes','plans to save forests','森林保護計劃'],['create jobs','provide work','創造就業'],['attract tourism','bring visitors','吸引旅遊'],['preserve clean water','keep water clean','保護潔淨水源'],['rural livelihoods','jobs of people in the countryside','農村生計']],
  [['managed well','run well','管理得宜'],['drain public resources','use up public money without return','耗盡公共資源'],['create long-term value','bring benefits over many years','創造長遠價值']],
  [['Ignoring wildlife','Doing nothing about wild animals','忽視野生動物'],['in the short term','now','短期'],['environmental damage','harm to nature','環境破壞'],['far more expensive','cost much more','代價更高']],
  [['In conclusion','In short','總結'],['do not agree','disagree','不同意'],['spend too much','spend too much','花費過多'],['protecting wildlife','protecting wild animals','保護野生動物']],
  [['Although','but','雖然'],['social problems deserve serious attention','Other problems need real attention','社會問題需認真關注'],['wildlife conservation','protecting wild animals','野生動物保育'],['foundations','helps build','基礎'],['sustainable society','society that can last','可持續社會']],
];
const chunkOverrides=[
  ['It is sometimes argued that governments waste excessive public money on wildlife conservation','when more urgent social problems exist.'],
  ['I strongly disagree with this view because protecting wildlife is not a luxury;','it is a necessary part of protecting human life, environmental stability, and long-term economic security.'],
  ['The first reason is that wildlife protection is closely connected','to the health of the natural systems on which people depend.'],
  ['Animals and plants are not decorative extras in the background of human life;','they form part of complex ecosystems that regulate climate, maintain soil quality,','support food production, and keep natural habitats balanced.'],
  ['If governments allow forests, oceans, and animal populations to collapse,','the damage will eventually return to human society','in the form of food shortages, floods, disease, and higher living costs.'],
  ['For example, if bee populations decline because their habitats are destroyed,','crop production can suffer,','which may make basic food more expensive for ordinary families.'],
  ['In this sense, spending money on wildlife','is not money thrown into the wilderness.'],
  ['It is an investment in the invisible machinery','that keeps human life running.'],
  ['Another important point is that conservation and social welfare','should not be treated as enemies competing for the same piece of bread.'],
  ['Responsible governments must fund hospitals, schools, housing, and public safety,','but this does not mean that wildlife protection should be pushed aside.'],
  ['In fact, many conservation projects','also benefit local communities directly.'],
  ['National parks, marine reserves, and forest-protection schemes can create jobs, attract tourism,','preserve clean water, and protect rural livelihoods.'],
  ['When these projects are managed well,','they do not drain public resources; they create long-term value.'],
  ['Ignoring wildlife may seem cheaper in the short term,','but it can become far more expensive when environmental damage has to be repaired later.'],
  ['In conclusion, I do not agree','that governments spend too much on protecting wildlife.'],
  ['Although many social problems deserve serious attention,','wildlife conservation is one of the foundations of a safe, healthy, and sustainable society.'],
];
const simpleChunkOverrides=[
  ['Some people say governments spend far too much public money protecting wild animals','when people have more urgent problems.'],
  ['I strongly disagree because protecting wild animals is needed','to keep people safe, nature working well, and the economy strong over time.'],
  ['The first reason is that protecting wild animals','helps keep the natural systems people need healthy.'],
  ['Animals and plants are not just there to look nice;','they belong to living systems that affect the weather, keep soil healthy,','help us grow food, and keep natural places in balance.'],
  ['If governments let forests, seas, and groups of animals die out,','people will later face less food, floods, illness, and higher everyday costs.'],
  ['For example, if bees become fewer because their homes are destroyed,','farmers may grow less food,','and basic food may cost ordinary families more.'],
  ['So money spent protecting wild animals','is not simply wasted in remote natural places.'],
  ['It helps keep the natural systems','that human life needs working.'],
  ['Another point is that protecting nature and helping people','should not be seen as two causes that must fight over the same money.'],
  ['Good governments must pay for hospitals, schools, homes, and safety,','but they should not therefore stop protecting wild animals.'],
  ['In fact, many plans to protect nature','also help people living nearby.'],
  ['Parks, protected areas at sea, and plans to save forests can provide work, bring visitors,','keep water clean, and protect the jobs of people in the countryside.'],
  ['If these plans are run well,','they do not use up public money without return; they bring benefits over many years.'],
  ['Doing nothing about wild animals may cost less now,','but fixing harm to nature later may cost much more.'],
  ['In short, I disagree','that governments spend too much on protecting wild animals.'],
  ['Other problems need real attention,','but protecting wild animals helps build a safe and healthy society that can last.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('It is sometimes argued that public libraries cost too much when housing and health services need funding.','It is sometimes argued 歸屬批評者；when 指其預算取捨背景。','這是待回應的主張，不是作者認同「浪費」。',[1,8,9],F('It is sometimes argued that [政府在野保上浪費過多公帑] when [有更急迫社會問題]','準確引出公共開支爭議。','要先呈現一方對預算優先次序的批評時。',[['It is sometimes argued that ','link','引入主張'],['governments waste excessive public money on wildlife conservation','slot','政府在野保上浪費過多公帑'],[' when ','link','當'],['more urgent social problems exist.','slot','有更急迫社會問題']])),
  S('I strongly disagree with that claim because access to books is not a luxury; it is a necessary part of an informed community.','not a luxury; it is... 對比奢侈品與必要條件；三項受保護的利益並列。','作者反對「浪費」，但未說社會問題不重要。',[0,2,15],F('I strongly disagree with [此觀點] because [野生動物保護] is not [奢侈品]; it is a necessary part of [保障人類、環境與長遠經濟]','引言表態並預告野保與人類利益相連。','要反駁「某項支出是奢侈」時，說明其必要公共作用。',[['I strongly disagree with ','link','表明反對'],['this view','slot','此觀點'],[' because ','link','理由是'],['protecting wildlife','slot','野生動物保護'],[' is not ','link','並非'],['a luxury','slot','奢侈品'],['; it is a necessary part of ','link','而是必要部分，保障'],['protecting human life, environmental stability, and long-term economic security.','slot','保障人類、環境與長遠經濟']])),
  S('The first reason is that river protection is closely connected to the health of the communities living nearby.','closely connected to...on which people depend 把野保與人類依賴的自然系統相連。','此句提出關聯，後文才以生態功能和蜜蜂例子解釋。',[1,3,8],F('[野生動物保護] is closely connected to [人類依賴的自然系統健康]','提出生態論證的中心關係。','要說明一項措施為何重要，先指出它所支持的更基本系統時。',[['The first reason is that ','link','引出第一理由'],['wildlife protection','slot','野生動物保護'],[' is closely connected to ','link','密切關乎'],['the health of the natural systems on which people depend.','slot','人類依賴的自然系統健康']])),
  S('Trees and wetlands are not decorative extras; they form part of systems that filter water and reduce floods.','not...; they... 反駁裝飾性看法，後列四項生態作用。','作者沒有說單一動植物可獨自完成所有功能。',[2,4,5],F('[動植物] are not [裝飾性附屬品]; they form part of [調節氣候、土壤、食物及棲地的生態系統]','用具體作用取代「只是好看」的看法。','要解釋一種事物有實際作用而不只是裝飾時。',[['Animals and plants','slot','動植物'],[' are not ','link','並非'],['decorative extras in the background of human life','slot','裝飾性附屬品'],['; they form part of ','link','而是部分'],['complex ecosystems that regulate climate, maintain soil quality, support food production, and keep natural habitats balanced.','slot','調節氣候、土壤、食物及棲地的生態系統']])),
  S('If a city removes its protective wetlands, the damage will eventually return to residents in the form of more frequent flooding.','If...allow...to collapse 設環境破壞條件；in the form of 具體列人類後果。','原文用 will eventually，表示延後發生；未交代每一地區必然受全部災害。',[3,5,6],F('If [政府任由森林、海洋及動物種群崩潰], [破壞] will eventually return to [人類社會] in the form of [糧食短缺、洪水、疾病和生活成本上升]','把生態損害轉為可見的人類風險。','要追蹤某個系統受損後，影響如何回到依賴它的人時。',[['If ','link','設定條件'],['governments allow forests, oceans, and animal populations to collapse','slot','政府任由森林、海洋及動物種群崩潰'],[', ','link','則'],['the damage','slot','破壞'],[' will eventually return to ','link','終將回到'],['human society','slot','人類社會'],[' in the form of ','link','表現為'],['food shortages, floods, disease, and higher living costs.','slot','糧食短缺、洪水、疾病和生活成本上升']])),
  S('For example, if a riverbank loses its trees, the landscape can suffer, which may make downstream water treatment more expensive for households.','if...because...which may... 串起棲地破壞、蜜蜂下降、農作物與食物價格。','兩處 can/may 保留可能性，不能說每次蜜蜂減少都必然推高所有食品價格。',[3,4,6],F('If [蜜蜂因棲地受破壞而減少], [作物產量] can suffer, which may make [基本食物對一般家庭更貴]','用一條具體因果鏈說明保育與民生的關係。','要用一條具體因果鏈，把起初看似間接的變化連到實際成本時。',[['For example, if ','link','引出例子與條件'],['bee populations decline because their habitats are destroyed','slot','蜜蜂因棲地受破壞而減少'],[', ','link','則'],['crop production','slot','作物產量'],[' can suffer, which may make ','link','可能受影響並令'],['basic food more expensive for ordinary families.','slot','基本食物對一般家庭更貴']])),
  S('In this sense, paying to protect wetlands is not money thrown into the wilderness.','In this sense 回指前面的生態與食物因果鏈；not...thrown into... 否定浪費比喻。','這不是精確財政回報數字，而是論證支出的公共價值。',[4,5,7],F('In this sense, [野生動物保護開支] is not [把錢丟入荒野]','收束生態風險論證，回應「浪費」批評。','已展示某支出對人類有作用，要糾正它只是浪費的印象時。',[['In this sense, ','link','根據上述例子'],['spending money on wildlife','slot','野生動物保護開支'],[' is not ','link','並不是'],['money thrown into the wilderness.','slot','把錢丟入荒野']])),
  S('It is an investment in natural defences that make nearby homes safer.','It is...investment 重評前句支出；invisible machinery 比喻難直接看見的生態作用。','此處 machinery 是比喻，不指真的工廠機器。',[5,6,8],F('It is an investment in [維持人類生活的無形機器]','用投資比喻重新定位保育開支。','要把看似沒有即時回報的基礎支出連到長期生活條件時。',[['It is an investment in ','link','這是對...的投資'],['the invisible machinery that keeps human life running.','slot','維持人類生活的無形機器']])),
  S('Another important point is that flood prevention and housing support should not be treated as rivals for every public dollar.','should not be treated as enemies 反對零和框架；piece of bread 是有限資源比喻。','不是說政府預算無限制，而是拒絕把兩類政策必然對立。',[1,9,10],F('[保育與社會福利] should not be treated as [爭同一資源的敵人]','改寫「保育必犧牲福利」的預算框架。','當兩種公共目標被說成必然互相排斥時。',[['Another important point is that ','link','引出第二理由'],['conservation and social welfare','slot','保育與社會福利'],[' should not be treated as ','link','不應被視為'],['enemies competing for the same piece of bread.','slot','爭同一資源的敵人']])),
  S('Responsible councils must fund homes and clinics, but this does not mean that flood prevention should be pushed aside.','must fund...but this does not mean... 先承認社會支出必要，再否定錯誤結論。','作者並未提出具體各項預算比例。',[8,10,11],F('[負責任政府] must fund [醫院、學校、住房和安全], but this does not mean [野保應被擱置]','承認社會福利必要，同時保留保育政策。','要承認一個優先事項，又阻止它被用來排除另一事項時。',[['Responsible governments','slot','負責任政府'],[' must fund ','link','必須資助'],['hospitals, schools, housing, and public safety','slot','醫院、學校、住房和安全'],[', but this does not mean that ','link','但不代表'],['wildlife protection should be pushed aside.','slot','野保應被擱置']])),
  S('In fact, many local habitat projects also benefit nearby families directly.','In fact 加強前句共存主張；many 不等於所有保育項目。','下一句才列工作、旅遊、水源和農村生計等具體途徑。',[8,9,11],F('In fact, many [保育項目] also benefit [本地社區] directly','指出保育可同時帶來社區收益。','有人認為一項措施只惠及少數對象時，要指出其他人受益的途徑。',[['In fact, many ','link','提出事實性論點'],['conservation projects','slot','保育項目'],[' also benefit ','link','亦惠及'],['local communities','slot','本地社區'],[' directly.','link','直接']])),
  S('Parks and protected areas can create jobs, attract visitors, protect water and rural work.','can 列四種可能社區回報，具體說明前句「惠及本地」。','不應宣稱每個項目必然產生全部四種回報。',[9,10,12],F('[國家公園、海保區和森林計劃] can [創造工作、吸引旅客、保護水源及農村生計]','以項目類型與實際回報支撐社區利益。','提出一項措施有間接效益後，要列出可觀察的作用途徑時。',[['National parks, marine reserves, and forest-protection schemes','slot','國家公園、海保區和森林計劃'],[' can ','link','可'],['create jobs, attract tourism, preserve clean water, and protect rural livelihoods.','slot','創造工作、吸引旅客、保護水源及農村生計']])),
  S('When habitat projects are managed well, they do not drain public resources; they create long-term value.','When...managed well 限定前提；do not...; they... 反轉耗資與創值看法。','文章的肯定受「管理得宜」條件限制。',[10,11,13],F('When [保育項目管理得宜], they do not [耗盡公帑]; they [創造長遠價值]','把有效管理與長期公共回報相連。','要說明政策成效有賴執行品質，並回應浪費疑慮時。',[['When ','link','設定管理條件'],['these projects are managed well','slot','保育項目管理得宜'],[', they do not ','link','便不會'],['drain public resources','slot','耗盡公帑'],['; they ','link','反而'],['create long-term value.','slot','創造長遠價值']])),
  S('Ignoring river health may seem cheaper in the short term, but it can become far more expensive when floods have to be repaired later.','may seem...but it can...when... 對比短期表面節省與未來修復成本。','can 不是精確成本估算；文章沒有提供貨幣數字。',[4,12,14],F('[忽視野生動物] may seem [短期較便宜], but it can become [日後修復時更貴]','反駁只看眼前支出的預算判斷。','要提醒讀者目前省錢可能把更大成本推到未來時。',[['Ignoring wildlife','slot','忽視野生動物'],[' may seem ','link','看似'],['cheaper in the short term','slot','短期較便宜'],[', but it can become ','link','但可能變成'],['far more expensive when environmental damage has to be repaired later.','slot','日後修復時更貴']])),
  S('In conclusion, I do not agree that protecting natural habitats costs more than it is worth.','In conclusion 直接回應「是否花費過多」的題問。','結論沒有否定醫院、學校等支出的必要性。',[1,9,15],F('In conclusion, I do not agree that [政府野生動物保護開支過多]','結論明確重申立場。','完成兩方面論證後，要直接重答題目的資源分配判斷時。',[['In conclusion, I do not agree that ','link','總結反對'],['governments spend too much on protecting wildlife.','slot','政府野生動物保護開支過多']])),
  S('Although housing and health services deserve serious attention, habitat protection is one of the foundations of a safe, healthy, and sustainable society.','Although 承認其他問題亦重要；主句說野保仍是安全健康可持續社會的基礎。','這不是「保育比所有社會問題都重要」的排他排名。',[8,9,14],F('Although [其他社會問題值得關注], [野生動物保育] is one of the foundations of [安全、健康及可持續社會]','以非零和立場完成全文。','要承認其他公共需要，同時說明本議題也屬基礎需要時。',[['Although ','link','先承認'],['many social problems deserve serious attention','slot','其他社會問題值得關注'],[', ','link','但'],['wildlife conservation','slot','野生動物保育'],[' is one of the foundations of ','link','是基礎之一'],['a safe, healthy, and sustainable society.','slot','安全、健康及可持續社會']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否認為政府在野生動物保育上花費過多？',['不同意：保育支撐人類生活、環境及長遠經濟安全','同意：保育對人類完全沒有益處','沒有立場：文章只列野生動物名稱','同意：所有社會福利應全面取消'],'I strongly disagree；necessary part of protecting human life...。'),
  {type:'multi',prompt:'選出文章兩條不同的主體論證',detail:'選兩項，再按「確認」。',options:['自然系統支持氣候、土壤、食物及人類生活，忽視可能造成日後損失','保育與社會福利毋須對立，管理得宜的項目亦可惠及本地社區','只要有保育項目，就不需要醫院和學校','保育只為動物好看，沒有其他作用'],correct:[0,1],why:'第一段談生態系統與人類風險；第二段談公共預算、社區收益及長期價值。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 支出並非奢侈','作者反對「野保浪費公帑」，指出它與人類生活及長遠安全相連。'],
  ['主體段一 · 生態系統','動植物支持自然系統；蜜蜂與農作物例子把保育連到食物成本。'],
  ['主體段二 · 福利與保育共存','社會支出重要；保育項目也可創造工作、水源保障與長遠價值。'],
  ['結論 · 長遠基礎','其他社會問題重要，但保育仍是安全健康社會的基礎。'],
],'生態依賴 → 民生風險 → 社區收益 → 長遠公共價值。')];
const evidence=[
  Q('作者如何反駁「保育只是奢侈」？',['野保是維持人類生活、環境穩定與長遠經濟安全的一部分','所有野生動物都能直接提供現金','保育不需任何公共資金','其他社會問題完全不存在'],'引言以 not a luxury; necessary part... 定位保育。'),
  Q('動植物在文章中有甚麼具體作用？',['構成生態系統，支持氣候、土壤、食物及棲息地平衡','只用來裝飾人類生活背景','只影響旅遊照片，不影響食物','每種植物都單獨控制全部氣候'],'原文列四項生態功能，並否定 decorative extras。'),
  Q('蜜蜂例子形成哪條因果鏈？',['棲地被破壞 → 蜜蜂減少 → 農作物可能受影響 → 家庭食物可能更貴','蜜蜂減少 → 所有食品必然立即免費','棲地被破壞 → 作物必然增加','農作物受影響與一般家庭完全無關'],'if...because...which may... 保留每一步可能性。'),
  Q('作者是否主張停止資助醫院和學校？',['沒有；政府仍須資助醫院、學校、住房與安全，也不應因此擱置野保','有；作者說醫院不應獲資助','有；只保育、不再考慮居民','文章沒有提及任何公共服務'],'must fund...but this does not mean... wildlife should be pushed aside。'),
  Q('哪些社區效益被文章具體列出？',['工作、旅遊、潔淨水源及農村生計','只有城市購物中心收入','每個居民必然得到同額現金','只有野生動物會受益'],'national parks, marine reserves, forest schemes can...。'),
  Q('為何「短期較便宜」未必是較好的預算決定？',['日後修復環境破壞的成本可能更高','因任何保育項目都必然零成本','因所有未來支出都已在文中精確計算','因作者否認政府需作任何取捨'],'原文對比 short term 與 repaired later 的成本。'),
];
const logic=[
  sequence('第一主體段：保育如何連到人類生活？',[
    ['中心關係','野生動物與人類依賴的自然系統相連。'],
    ['生態功能','動植物參與氣候、土壤、食物及棲地的平衡。'],
    ['忽視後果','生態崩潰可能透過糧食、洪水、疾病及生活成本影響人。'],
    ['蜜蜂例子','棲地破壞可使蜜蜂減少，農作物和家庭食物價格或受影響。'],
    ['段落判斷','保育開支是對維持生活的自然系統投資。'],
  ],'自然系統 → 人類依賴 → 生態破壞的人類成本 → 保育是投資。'),
  sequence('第二主體段：保育與社會福利為何不必對立？',[
    ['修正框架','保育與社會福利不必被視為爭奪資源的敵人。'],
    ['承認需要','政府必須資助醫院、學校、住房與安全。'],
    ['同時保育','上述需要不等於必須擱置野保。'],
    ['社區效益','公園、海保區與森林計劃可帶來工作、水源及生計保障。'],
    ['管理條件','管理得宜能創造長遠價值。'],
    ['時間比較','眼前忽視看似便宜，日後修復卻可能更貴。'],
  ],'社會支出必要 → 保育仍可進行 → 社區也受益 → 長期成本須計算。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某地考慮砍掉保育預算，因為這些支出看來只惠及野生動物。','哪項最符合作者的第一條理由？',['保育維持食物與防洪系統，也保障居民生活','保育只改善風景，對居民生計沒有作用','保育可保護動物，但毋須評估人類得益','保育要先取消醫療預算，才可幫助居民'],['原文把生態系統與食物、防洪及人類生活連起來。','作者否認動植物只是裝飾。','保育對人類的系統效益是主論點。','作者承認醫療等支出需要，並無先取消之意。'],[1,2,3,4],'natural systems on which people depend。'),
  T('農村附近的蜜蜂棲地被破壞，當地農作物產量隨後下降。','文章的因果鏈會關注哪項下一步？',['蜜蜂減少可令作物受損，家庭食物成本或升','蜜蜂減少只令花卉變少，作物仍不受影響','蜜蜂減少使產量必然歸零，價格必然翻倍','蜜蜂減少只涉及農民，不影響普通家庭'],['蜜蜂授粉例子用 can/may 說明可能的作物與價格影響。','作物正是原文連到家庭的環節。','作者沒有必然或翻倍的數據。','家庭食物成本是原文例子的重點。'],[4,5],'crop production can suffer, which may make basic food more expensive。'),
  T('有人說：「野生動物保育只是把錢丟到荒郊。」','文章如何回應這個比喻？',['保育是維持自然系統的投入，可支援人類生活','保育是荒郊的花費，與日常生活沒有聯繫','保育可展示動物，但不能保護任何自然系統','保育只在短期有價值，不必看未來生態風險'],['保育投資於維持人類生活的自然系統。','荒郊花費是作者反駁的說法。','自然系統功能是保育理由。','文章強調長期風險與價值。'],[6,7],'not money thrown into the wilderness；an investment。'),
  T('地方議會說醫院需要資金，所以海洋保護區必須一律取消。','哪項最能指出推論問題？',['醫院需要資助，也不代表海洋保護必須停辦','醫院需要資助，所以保育應在當年全數取消','海洋保護重要，所以醫院應減至最低支出','兩者都值得投資，但不必比較實際社會效益'],['作者承認醫院資助必要，也拒絕把保育擱置。','醫院需要不能推出保育全取消。','保育需要不能推出醫院減資。','仍需評估實際效益與預算。'],[8,9],'conservation and social welfare should not be treated as enemies。'),
  T('一個森林計畫保障水源，也僱用本地居民維護步道。','哪條論證被具體支持？',['森林計畫可保水源並給社區帶來工作','森林計畫可保水源，卻不應僱用當地人','森林計畫能提供職位，便不必保護水源','森林計畫有益，便可取代醫院與學校'],['水源保護與本地工作屬原文所列社區益處。','雇用居民本身可以是社區收益。','職位不能取代水源保護。','保育收益不取消醫院和學校需要。'],[10,11,12],'create jobs；preserve clean water。'),
  T('某海洋保護區管理混亂，未能帶來預期收入。','哪項修正最忠於原文？',['管理得宜的項目可創長期價值，並非必然成功','保護區有名稱便能創造價值，不必管理','計畫收入不足，證明所有保育都無價值','有管理條件，代表社區效益一概不能評估'],['原文有 managed well 限定，不保證每個項目有效。','項目名稱不會自動帶來成果。','單一失敗不證明整類項目無價值。','管理條件使效益評估更重要。'],[11,12],'When these projects are managed well...create long-term value。'),
  T('政府省下眼前修護濕地的費用，但多年後需花大筆錢處理水患。','文章哪種預算思路最適用？',['省下眼前費用，可能換來更高的日後水患成本','省下眼前費用，便證明日後沒有水患風險','先不修護濕地，只看當年財政結餘便夠','日後水患成本可估，但不須與目前支出比'],['作者比較短期看似便宜和日後修復的高成本。','今天不花錢不能保證日後沒水患。','只看當年結餘會漏掉修復負擔。','應把兩個時點的成本連起來。'],[4,13],'may seem cheaper in the short term...far more expensive...later。'),
  T('研究小組報告：「蜜蜂減少必然使所有家庭食物價格立刻翻倍。」','哪項更合乎文章的語氣？',['作物可能受損，食物或更貴，原文未說翻倍','作物必然消失，食物立刻向所有人翻倍','作物可能受損，但原文從未談家庭價格','作物產量下降，便可得出精確的翻倍數字'],['can/may 表可能，且文中沒有食物翻倍數字。','把可能說成必然並加入未有的數字。','原文談及家庭基本食物價格。','產量變動不足以推出特定翻倍幅度。'],[5],'crop production can suffer, which may make basic food more expensive。'),
  T('某市只比較保育項目當年的花費，完全不計潔淨水源與農村生計。','應補入哪項評估？',['把潔淨水源與長遠社區價值納入成本評估','只看項目當年花費，不查長遠水源效益','只看動物種類數目，不問農村居民生計','把社區收益列入，但不看計畫管理條件'],['保育項目可有水源、生計與長期價值。','只看支出漏掉長遠回報。','動物數目不足以評估居民益處。','原文把良好管理列為條件。'],[9,10,11,12,13],'benefit local communities directly；create long-term value。'),
  T('有人說：「既然保育重要，醫院和住房便不值得資助。」','哪項反駁符合原文？',['保育與醫療住房可並行，社會需求不能互斥','保育很重要，因此醫院住房應全部停資','醫療住房很重要，因此保育應全部停資','兩方都重要，便可跳過具體預算與效益'],['政府須資助醫療住房等，也不應擱置保育。','作者沒有把保育置於醫療之上而全取消。','作者反對把兩類需要視為敵人。','並行仍需實際管理與評估。'],[8,9,15],'Responsible governments must fund hospitals, schools, housing, and public safety。'),
  T('一項交通安全政策現在要花費，但可減少日後事故與維修成本。','哪種可跨主題套用的論證最恰當？',['對比眼前投資與未來可避免的事故損失','只看眼前開支，不估未來事故修復費','只看未來損失，不查政策能否減少風險','只算維修成本，不考慮事故帶來的傷害'],['短期花費須與可避免的日後損失一起比較。','只看目前支出會漏掉未來損害。','也須檢查政策能否有效減風險。','事故不只有維修費，也可能傷害居民。'],[12,13],'cheaper in the short term...expensive...repaired later。'),
  T('要用一句話概括作者對「社會問題比野保重要」的回應。','哪項最準確？',['認真處理社會問題，也把保育視為生活基礎','只處理社會問題，保育一律視為風景裝飾','只支持野生動物保育，忽略醫院學校的需要','兩者都重要，所以每個保育項目必然有效'],['結論先承認社會問題，再確認保育的基礎地位。','作者反對裝飾性理解。','原文要求政府資助醫院與學校。','重要性不保證每項目有效，仍須管理。'],[8,9,12,14,15],'Although many social problems deserve serious attention, wildlife conservation is one of the foundations...。'),
];
export default {
  key:'opinion:42',
  meta:{topic:'野生動物保育、社會開支與長遠公共價值',summary:'作者反對政府在野生動物保育上花費過多的說法。動植物支撐人類依賴的生態系統，棲地破壞可能透過農作物、食物價格等途徑影響居民。醫療、教育及住房仍須資助，但保育不必與福利對立；管理得宜的項目也可帶來工作、水源保障及長遠社區收益。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
