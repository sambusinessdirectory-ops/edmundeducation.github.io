const simple=[
  'People often see creative work as something a person does because they love it, but it also affects how a society remembers its past, feels, and understands itself.',
  'I strongly agree that governments should give money to artists, musicians, and other people who make creative work because their work helps everyone, and selling it does not always keep that value safe.',
  'First, art keeps a country’s culture alive and adds to it.',
  'Pictures, songs, films, and live shows are more than fun; they also help a country remember its shared past.',
  'If talented people have to stop working on art because they cannot earn enough steady money, important stories, old customs, and local people’s voices may disappear.',
  'Money from the government can give these people time, things to work with, and places to show their work, so they can make art that later becomes important to a community.',
  'For example, a person paid to write music using local old songs may make shows that schools, festivals, and museums can use for years.',
  'So giving money to creative people is not simply giving help; it is spending money to protect culture for the future.',
  'Second, creative work can help many people even if it does not make money straight away.',
  'Businesses usually pay for work that sells fast, but work with important ideas, new methods, or ways to help society may not sell fast.',
  'With government help, creative people can give free concerts in public places, teach children, make neglected areas look better, or make work that gets people thinking about problems in society.',
  'These projects may not make anyone rich, but they can make a city feel more lively, kind, and close together.',
  'Without this help, making art may become something only people who already have enough money can do.',
  'In short, I strongly agree that governments should give money to people who make art and music.',
  'Art and music make culture stronger, help more people enjoy beauty and new ideas, and give society more than just comfortable living.',
  'A country that helps its artists is not wasting money; it is keeping its culture alive.',
];
const vocabulary=[
  [['Creative work','creative work','創意工作'],['private passion','something a person does because they love it','個人熱情'],['shapes','affects','塑造'],['remembers','remembers its past','記憶'],['understands itself','understands itself','理解自身']],
  [['completely agree','strongly agree','完全同意'],['provide financial support','give money','提供財政支持'],['creative people','people who make creative work','創意人士'],['public value','helps everyone','公共價值'],['the market alone rarely protects','selling it does not always keep that value safe','市場單獨難保護']],
  [['the arts','art','藝術'],['preserve','keeps a country’s culture alive','保存'],['enrich','adds to','豐富'],['a nation’s culture','a country’s culture','國家文化']],
  [['Paintings','Pictures','繪畫'],['performances','live shows','表演'],['not merely forms of entertainment','more than fun','不只是娛樂'],['collective memory','shared past','集體記憶']],
  [['talented people','talented people','有才華的人'],['forced to abandon their work','have to stop working on art','被迫放棄創作'],['stable income','steady money','穩定收入'],['valuable stories','important stories','珍貴故事'],['traditions','old customs','傳統'],['local voices','local people’s voices','本土聲音'],['quietly disappear','disappear','悄然消失']],
  [['Public grants','Money from the government','公共資助'],['materials','things to work with','材料'],['venues','places to show their work','場地'],['produce work','make art','創作'],['community’s identity','important to a community','社區身份']],
  [['composer','person paid to write music','作曲家'],['receives funding','paid','獲得資助'],['local folk traditions','local old songs','本地民間傳統'],['performances','shows','表演作品'],['for many years','for years','多年']],
  [['In this sense','So','從這角度看'],['supporting creative people','giving money to creative people','支持創意人士'],['not charity','not simply giving help','不是慈善'],['cultural investment','spending money to protect culture for the future','文化投資']],
  [['Another important reason','Second','另一重要原因'],['benefit the wider public','help many people','惠及更多公眾'],['not immediately profitable','does not make money straight away','不能即時盈利']],
  [['Commercial markets','Businesses','商業市場'],['tend to reward','usually pay for','往往獎勵'],['sells quickly','sells fast','快速售出'],['meaningful','important ideas','有意義'],['experimental','new methods','實驗性'],['socially useful','ways to help society','對社會有用']],
  [['With government support','With government help','在政府支持下'],['public spaces','public places','公共空間'],['run workshops for children','teach children','兒童工作坊'],['decorate neglected neighbourhoods','make neglected areas look better','美化被忽視社區'],['social issues','problems in society','社會議題']],
  [['projects','projects','項目'],['may not make anyone rich','may not make anyone rich','未必致富'],['more alive','more lively','更有活力'],['humane','kind','更有人情味'],['connected','close together','更有連結']],
  [['Without such funding','Without this help','沒有此類資助'],['creativity','making art','創意'],['luxury','something only people who already have enough money can do','奢侈品'],['afford to pursue it','already have enough money','有能力追求']],
  [['In conclusion','In short','總結'],['fully agree','strongly agree','完全同意'],['creative people','people who make art and music','創意人士']],
  [['strengthen culture','make culture stronger','強化文化'],['widen public access','help more people enjoy','擴大公眾接觸'],['beauty and imagination','beauty and new ideas','美感與想像力'],['material comfort','comfortable living','物質舒適']],
  [['supports its artists','helps its artists','支持藝術家'],['not wasting money','not wasting money','不是浪費金錢'],['cultural heartbeat alive','culture alive','文化心跳持續']],
];
const chunkOverrides=[
  ['Creative work is often treated as a private passion,','yet it also shapes how a society remembers, feels and understands itself.'],
  ['I completely agree that governments should provide financial support to artists, musicians and other creative people,','because their work creates public value that the market alone rarely protects.'],
  ['The first reason is that the arts','preserve and enrich a nation’s culture.'],
  ['Paintings, songs, films and performances are not merely forms of entertainment;','they are part of a country’s collective memory.'],
  ['If talented people are forced to abandon their work simply because they cannot earn a stable income,','valuable stories, traditions and local voices may quietly disappear.'],
  ['Public grants can give them the time, materials and venues they need','to produce work that later becomes part of a community’s identity.'],
  ['For example, a composer who receives funding to write music based on local folk traditions','may create performances that schools, festivals and museums can use for many years.'],
  ['In this sense, supporting creative people is not charity;','it is cultural investment.'],
  ['Another important reason is that creative work can benefit the wider public,','even when it is not immediately profitable.'],
  ['Commercial markets tend to reward what sells quickly,','not necessarily what is meaningful, experimental or socially useful.'],
  ['With government support, artists and musicians can offer free concerts in public spaces,','run workshops for children, decorate neglected neighbourhoods or create work that helps people think about social issues.'],
  ['These projects may not make anyone rich,','but they can make a city feel more alive, humane and connected.'],
  ['Without such funding,','creativity risks becoming a luxury available only to those who can already afford to pursue it.'],
  ['In conclusion, I fully agree','that governments should give money to creative people.'],
  ['Art and music strengthen culture, widen public access to beauty and imagination,','and give society something deeper than material comfort.'],
  ['A country that supports its artists is not wasting money;','it is keeping its cultural heartbeat alive.'],
];
const simpleChunkOverrides=[
  ['People often see creative work as something a person does because they love it,','but it also affects how a society remembers its past, feels, and understands itself.'],
  ['I strongly agree that governments should give money to artists, musicians, and other people who make creative work','because their work helps everyone, and selling it does not always keep that value safe.'],
  ['First, art keeps a country’s culture alive','and adds to it.'],
  ['Pictures, songs, films, and live shows are more than fun;','they also help a country remember its shared past.'],
  ['If talented people have to stop working on art because they cannot earn enough steady money,','important stories, old customs, and local people’s voices may disappear.'],
  ['Money from the government can give these people time, things to work with, and places to show their work,','so they can make art that later becomes important to a community.'],
  ['For example, a person paid to write music using local old songs','may make shows that schools, festivals, and museums can use for years.'],
  ['So giving money to creative people is not simply giving help;','it is spending money to protect culture for the future.'],
  ['Second, creative work can help many people','even if it does not make money straight away.'],
  ['Businesses usually pay for work that sells fast,','but work with important ideas, new methods, or ways to help society may not sell fast.'],
  ['With government help, creative people can give free concerts in public places, teach children,','make neglected areas look better, or make work that gets people thinking about problems in society.'],
  ['These projects may not make anyone rich,','but they can make a city feel more lively, kind, and close together.'],
  ['Without this help, making art may become something','only people who already have enough money can do.'],
  ['In short, I strongly agree','that governments should give money to people who make art and music.'],
  ['Art and music make culture stronger, help more people enjoy beauty and new ideas,','and give society more than just comfortable living.'],
  ['A country that helps its artists is not wasting money;','it is keeping its culture alive.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Community gardens are often treated as a hobby, yet they also help residents meet and share food.','is often treated as...yet... 對比常見狹窄看法與更廣社會作用。','這句只建立討論背景，尚未提出具體撥款方案。',[1,4,8],F('[一項活動] is often treated as [私人興趣], yet it also [公共作用]','先糾正讀者對某項活動只屬私人興趣的印象。','引言要由一種常見狹窄印象，帶出其較廣公共作用時。',[['Creative work','slot','一項活動'],[' is often treated as ','link','常被當作'],['a private passion','slot','私人興趣'],[', yet it also ','link','但亦'],['shapes how a society remembers, feels and understands itself.','slot','公共作用']])),
  S('I agree that councils should support local libraries because they provide benefits that ticket sales alone cannot preserve.','because 解釋立場；that... 用具體公共價值區分市場收入與更廣效益。','作者支持資助有公共效益的工作，不是說每個項目都自動應獲款。',[0,8,13],F('I agree that [公共機構] should support [受助者], because [公共價值] that [市場] rarely protects','表明政策立場，並預告私人收入不足以保護公共價值。','要支持一項公共投入，並說明市場回報為何不足以衡量其作用時。',[['I completely agree that ','link','表明立場'],['governments','slot','公共機構'],[' should provide financial support to ','link','應資助'],['artists, musicians and other creative people','slot','受助者'],[', because ','link','因為'],['their work creates public value','slot','公共價值'],[' that ','link','而'],['the market alone','slot','市場'],[' rarely protects.','link','很少單獨保護']])),
  S('The first reason is that public libraries preserve and enrich local knowledge.','The first reason is that 開首項理由；preserve and enrich 分別指保留及增加。','這是首段主張，下一步仍需說明具體形式。',[1,3,8],F('The first reason is that [某種活動] preserve and enrich [共同資產]','提出某事如何同時保留和增加共同資產。','開始首項理由時，要說明一項活動對共同資產的兩種作用時。',[['The first reason is that ','link','引入首項理由'],['the arts','slot','某種活動'],[' preserve and enrich ','link','保存並豐富'],['a nation’s culture.','slot','共同資產']])),
  S('Family photographs are not merely decoration; they are part of a household’s shared memory.','not merely...; they are... 由表面功能轉到更深層的共同記憶。','並非否認娛樂或美感，而是說還有另一層作用。',[2,4,7],F('[具體作品] are not merely [表面用途]; they are part of [共同記憶]','把抽象文化價值落在可理解的作品種類上。','已提出一項共同價值後，要用具體事物解釋其作用超出表面用途時。',[['Paintings, songs, films and performances','slot','具體作品'],[' are not merely ','link','不只是'],['forms of entertainment','slot','表面用途'],['; they are part of ','link','也是'],['a country’s collective memory.','slot','共同記憶']])),
  S('If local teachers must leave because they cannot earn a stable living, valuable skills and community knowledge may disappear.','If...because... 設缺收入導致退出；may 保留對共同資產損失的可能性。','不是說所有失去資助者都必然離開，也不是說市場完全無用。',[3,5,12],F('If [有能力的人因收入不足離開], [有價值的共同資產] may disappear','指出收入不穩如何轉成全社會的文化損失。','要解釋某群體退出一項工作時，原本由他們維持的共同資產如何受損時。',[['If ','link','設定條件'],['talented people are forced to abandon their work simply because they cannot earn a stable income','slot','有能力的人因收入不足離開'],[', ','link','則'],['valuable stories, traditions and local voices','slot','有價值的共同資產'],[' may quietly disappear.','link','可能逐漸消失']])),
  S('Public grants can give researchers the time, equipment and space they need to produce work valued for years.','can give...the time, materials and venues 指資助提供具體資源；to produce 指產出。','不是只說「資助有益」；句中清楚交代資源如何轉成作品。',[2,4,6],F('[公共資助] can give [工作者] the [所需資源] to produce [長遠作品]','把公共投入追蹤到實際創作條件及長期成果。','提出資助後，要列出它提供甚麼具體條件，以及那些條件如何產生成果時。',[['Public grants','slot','公共資助'],[' can give ','link','可給予'],['them','slot','工作者'],[' the ','link','所需的'],['time, materials and venues they need','slot','所需資源'],[' to produce ','link','以創作'],['work that later becomes part of a community’s identity.','slot','長遠作品']])),
  S('For example, a local historian who receives funding to record oral accounts may create lessons schools can use for years.','For example 引可追蹤人物；who receives funding 指條件；may create 指長期可用成果。','例子不只講受助者，更要指出其他機構如何使用成果。',[4,5,7],F('For example, [受助者] who receives funding to [具體工作] may create [可長期使用的成果]','用一位受助者說明資金如何變成可分享的公共作品。','主張資助可保留共同資產後，要以人物、工作及後續使用者構成完整例子時。',[['For example, ','link','引出例子'],['a composer','slot','受助者'],[' who receives funding to ','link','獲資助去'],['write music based on local folk traditions','slot','具體工作'],[' may create ','link','可創作'],['performances that schools, festivals and museums can use for many years.','slot','可長期使用的成果']])),
  S('In this sense, supporting local libraries is not charity; it is an investment in shared knowledge.','not charity; it is... 依前文長期公共回報重新界定支出。','結論是文化投資，不是把每項創作都免於成果評估。',[2,6,9],F('In this sense, supporting [某群體] is not [貶低標籤]; it is [公共投資]','在例證後收束，糾正把資助視為單向施捨的看法。','已展示長期公共效益後，要重新界定一項支出而非只重複其名稱時。',[['In this sense, supporting ','link','由前文推論支持'],['creative people','slot','某群體'],[' is not ','link','不是'],['charity','slot','貶低標籤'],['; it is ','link','而是'],['cultural investment.','slot','公共投資']])),
  S('Another reason is that a free library can help many residents even when it earns no immediate income.','even when it is not immediately profitable 承認收入不足，卻不取消更廣受益。','第二理由是公共使用價值，與第一段文化保存不同。',[2,7,9],F('Another reason is that [某活動] can benefit [更多人], even when [未即時盈利]','從保存共同資產轉到當下廣泛使用者的效益。','已完成一種效益後，要引出另一種即使不即時賺錢也存在的效益時。',[['Another important reason is that ','link','引出另一理由'],['creative work','slot','某活動'],[' can benefit ','link','可惠及'],['the wider public','slot','更多人'],[', even when ','link','即使'],['it is not immediately profitable.','slot','未即時盈利']])),
  S('Businesses often reward what sells fast, not necessarily what gives lasting community value.','what sells quickly, not necessarily what... 對比市場獎勵標準與公共價值標準。','不是聲稱商業市場永不支持有意義作品。',[1,8,10],F('[市場] tends to reward what [快速售出], not necessarily what [更長遠有用]','解釋為何市場收入與社會效益可能不一致。','要批評只按短期銷量評價時，指出較難立即賺錢的其他價值時。',[['Commercial markets','slot','市場'],[' tend to reward what ','link','往往獎勵'],['sells quickly','slot','快速售出'],[', not necessarily what is ','link','未必獎勵'],['meaningful, experimental or socially useful.','slot','更長遠有用']])),
  S('With council support, local groups can offer free lessons, run events, repair shared places, or publish useful guides.','With...support 設條件；四個並列動詞列可觀察的公共活動。','多個活動是具體途徑，不表示每項計劃都會做齊四種。',[5,8,9],F('With [公共支持], [受助者] can [多項具體公共活動]','把市場不足的論點接到資助後可做的實際事情。','提出公共支持後，要列出它如何轉化成不同人可參與的具體服務時。',[['With government support, ','link','有公共支持時'],['artists and musicians','slot','受助者'],[' can ','link','可以'],['offer free concerts in public spaces, run workshops for children, decorate neglected neighbourhoods or create work that helps people think about social issues.','slot','多項具體公共活動']])),
  S('Community festivals may not make organisers rich, but they can make neighbours feel more connected.','may not...but can... 承認缺少私人利潤，同時指出共同體感受的收益。','不能把可能的社會效益當成每個活動的必然結果。',[8,9,12],F('[公共項目] may not make [某人] rich, but they can make [地方] feel [社會收益]','由具體活動推到非金錢的公共成果。','要承認一項活動不會直接使人致富，仍說明其可能的社會收益時。',[['These projects','slot','公共項目'],[' may not make ','link','未必使'],['anyone','slot','某人'],[' rich, but they can make ','link','致富，但可令'],['a city','slot','地方'],[' feel ','link','感到'],['more alive, humane and connected.','slot','社會收益']])),
  S('Without grants, specialist training risks becoming a luxury available only to people who can already pay.','Without...risks becoming... 指缺資助的可及性風險；only to... 指不平等結果。','risks 不是必然；此句也不是反對所有付費活動。',[8,10,11],F('Without [公共支持], [活動] risks becoming [只供有錢者享用的奢侈品]','指出若沒有支持，參與機會可能按財力而非才能分配。','要說明缺少某種支援時，一項活動可能只留給原本負擔得起的人時。',[['Without ','link','沒有'],['such funding','slot','公共支持'],[', ','link','則'],['creativity','slot','活動'],[' risks becoming ','link','可能變成'],['a luxury available only to those who can already afford to pursue it.','slot','只供有錢者享用的奢侈品']])),
  S('In conclusion, I agree that councils should fund community arts groups.','In conclusion 直接重申題目的公共資助立場。','這句是立場收束，下面才回收理由。',[1,7,14],F('In conclusion, I fully agree that [公共機構] should give money to [受助者]','結尾不迴避題目，直接回答是否支持資助。','完成兩段理由後，要在結論清楚重申是否支持題目所提政策時。',[['In conclusion, I fully agree that ','link','重申立場'],['governments','slot','公共機構'],[' should give money to ','link','應資助'],['creative people.','slot','受助者']])),
  S('Libraries strengthen knowledge, widen access to new ideas, and offer more than a place to sit.','三個並列作用回收兩主體段；something deeper than... 說明非物質價值。','結尾概括已論效益，不應在此引入一條全新論證。',[3,10,13],F('[某活動] strengthen [共同資產], widen access to [公共益處], and give [更深層價值]','用三個平行動詞概括已解釋的公共效益。','結論需回收幾種不同效益時，可用並列動詞作清晰總結。',[['Art and music','slot','某活動'],[' strengthen ','link','強化'],['culture','slot','共同資產'],[', widen public access to ','link','擴大公眾接觸'],['beauty and imagination','slot','公共益處'],[', and give society ','link','並給社會'],['something deeper than material comfort.','slot','更深層價值']])),
  S('A city that supports public libraries is not wasting money; it is keeping shared knowledge alive.','not wasting...; it is... 以反駁及正面圖像作結。','cultural heartbeat 是比喻，前文已提供具體公共效益作依據。',[7,12,14],F('A [地方] that supports [某群體] is not wasting money; it is keeping [共同價值] alive','最後用鮮明而有依據的圖像重述公共投資價值。','已列足夠具體效益後，要以短句對照「浪費」與長期保存時。',[['A country','slot','地方'],[' that supports ','link','支持'],['its artists','slot','某群體'],[' is not wasting money; it is keeping ','link','不是浪費，而是維持'],['its cultural heartbeat','slot','共同價值'],[' alive.','link','持續']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否支持政府給藝術家、音樂家等創意人士財政支持？',['完全支持；作品保存文化，也為更廣公眾創造市場未必保護的價值','完全反對；創作只屬個人興趣','沒有立場，只列出市場價格','只支持能立即賺錢的作品'],'completely agree；public value that the market alone rarely protects。'),
  {type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['藝術保存並豐富文化與社區記憶','創意項目即使不能即時盈利，仍能讓公眾參與並改善城市生活','所有藝術作品必然賺大錢','只有有錢人應有機會創作'],correct:[0,1],why:'首段談文化保存；次段談公共參與與社會效益。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 創意作品有公共價值','表明完全支持資助，因市場回報未必保護所有公共效益。'],
  ['主體段一 · 保存文化','作品是集體記憶；穩定資助提供時間、材料和場地，作曲家例子。'],
  ['主體段二 · 惠及更廣公眾','市場重快速銷售；公共支持帶來免費活動、兒童工作坊及社區活力。'],
  ['結論 · 文化投資不是浪費','重申支持，以保存文化和擴大接觸作結。'],
],'文化與集體記憶 → 資助形成作品 → 公共參與與非金錢價值 → 重申立場。')];
const evidence=[
  Q('作者如何說明繪畫、歌曲、電影和表演的文化作用？',['不只是娛樂，也是國家集體記憶的一部分','只可用來賺取門票收入','與社區身份完全無關','必然取代學校教育'],'not merely forms of entertainment；collective memory。'),
  Q('為何創作者收入不穩可能令社會受損？',['有才華者或被迫放棄創作，故事、傳統與本土聲音可能消失','所有創作者都必然立刻致富','市場永遠保存每一種作品','只影響個人的娛樂時間'],'If...stable income...may quietly disappear。'),
  Q('公共資助具體提供哪三種創作條件？',['時間、材料和場地','只有一句口號','只提供獎牌和照片','完全不用任何資源'],'time, materials and venues；之後才有長期作品。'),
  Q('作曲家例子如何展示公共回報？',['資助民間傳統創作，作品可供學校、節日及博物館多年使用','資助後作品必然立即售出','只有作曲家本人能接觸作品','只說收入，沒有後續使用者'],'例子連受助者、作品及多種後續使用者。'),
  Q('商業市場通常獎勵甚麼？',['能快速售出的作品，未必獎勵有意義或具社會用途的創作','所有實驗作品都必然最賺錢','沒有任何人買藝術作品','只獎勵對社會有用的作品'],'what sells quickly, not necessarily what...socially useful。'),
  Q('沒有資助可能出現甚麼參與不平等？',['創作或只留給本來負擔得起的人','每個人都會自動有更多創作時間','所有作品必然變成免費','金錢永遠不影響創作機會'],'risks becoming a luxury available only to...。'),
];
const logic=[
  sequence('第一主體段：資助如何保存文化？',[
    ['主張','藝術保存並豐富一國文化。'],
    ['具體價值','繪畫、歌曲、電影、表演承載集體記憶。'],
    ['缺支援風險','收入不穩可使創作者離開，故事與傳統可能消失。'],
    ['資助機制','公共資助提供時間、材料與場地。'],
    ['作曲家例子','民間傳統作品可供學校、節日及博物館多年使用。'],
    ['段落結論','資助是文化投資，不只是慈善。'],
  ],'集體記憶 → 收入風險 → 資助條件 → 可長期分享的文化作品。'),
  sequence('第二主體段：為何盈利不是唯一標準？',[
    ['主張','創意作品即使不即時賺錢，仍能惠及更廣公眾。'],
    ['市場限制','快速銷售不必然代表作品有意義或社會用途。'],
    ['具體活動','免費音樂會、兒童工作坊、改善社區及社會議題作品。'],
    ['非金錢成果','城市可更有活力、人情味與連結。'],
    ['可及性風險','沒有資助，創作或只屬於原本有能力負擔的人。'],
  ],'市場看銷量 → 公共支持帶來服務 → 社區受惠 → 機會更公平。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某地民間故事無法靠賣票維持，年長講述者快要退休。','哪種公共資助理由最貼近第一段？',['資助記錄與傳授故事，保留社區集體記憶供後人使用','只有能立即賣出大量門票的故事值得保存','退休者沒有任何文化知識','民間故事只能屬於個人愛好'],['保存共同資產與長期使用者是核心。','市場收入不是唯一標準。','與情境相反。','忽略集體記憶。'],[2,3,4,5,6],'collective memory；time, materials and venues。'),
  T('一位音樂人獲小額資助，創作本地民歌改編；學校和博物館多年使用。','這例子完整展示哪條因果鏈？',['公共投入提供創作條件，作品再讓不同機構長期受惠','資助只讓音樂人本人受惠一天','所有作品必須立即賺大錢','本地傳統與學校活動完全無關'],['與作曲家例子的受助者、作品、使用者相符。','忽略長期共享。','原文談未必即時盈利。','學校是使用者。'],[4,5,6,7],'composer...performances...schools, festivals and museums。'),
  T('市政府只用第一週銷售額決定是否保留社區藝術項目。','文章會要求增加哪種判斷？',['檢查文化保存、公共參與與社區作用，而不只看短期銷售','第一週銷售額必然代表所有公共價值','完全不需要評估任何項目','只問藝術家是否有名'],['市場重快速售出，公共效益可能較長遠。','與原文對市場限制相反。','仍應看成效。','名氣不是公共效益。'],[8,9,10,11],'sells quickly, not necessarily...socially useful。'),
  T('公共圖書館辦免費繪畫工作坊，孩子、老人和家長都參與。','哪項效益最符合第二段？',['創意活動即使收入不高，也可讓更多居民參與並互相連結','活動不賣票便完全沒有價值','只有藝術家可得到任何好處','公共資助只能用於立即盈利項目'],['免費活動與更廣公眾受惠相符。','作者明言未盈利仍可有價值。','參與者多元。','與文章相反。'],[8,10,11],'benefit the wider public；free concerts；connected。'),
  T('某青年有創作能力，卻無法承擔材料與場地費。','沒有支援可能出現甚麼問題？',['創作機會可能只留給原本有錢的人，而非按才能分配','創作能力必然消失，絕不可能再開始','所有富人都必然有藝術才能','材料與場地從不影響創作'],['risks becoming a luxury... 指可及性風險。','風險不是必然。','原文沒有此說。','資助正提供材料場地。'],[5,12],'time, materials and venues；luxury available only...'),
  T('有人說：「藝術只是個人興趣，政府資助一定是慈善。」','哪個回應最接近本文？',['若作品保存共同記憶並讓公眾長期受惠，資助可屬公共投資','任何個人興趣都必然應獲相同資助','藝術只使本人開心，不影響社區','只要政府資助，作品必然成為名作'],['首段以公共回報重新界定資助。','需要實際公共效益。','與集體記憶相反。','原文沒有保證。'],[0,3,5,6,7],'not charity; it is cultural investment。'),
  T('一個城市支持藝術家在被忽視的社區畫壁畫，並邀請居民參與。','可觀察的公共作用是甚麼？',['改善公共空間，提供參與機會，並可能加強居民連結','只要有壁畫，所有社區問題必然消失','作品只屬藝術家私人收藏','因此不用再評估居民反應'],['具體活動與非金錢社區收益相連。','推論過度。','公共空間可共享。','仍需觀察效果。'],[8,10,11],'decorate neglected neighbourhoods；connected。'),
  T('某博物館保存口述歷史，需要錄音設備、工作時間與展示空間。','哪組資助內容最直接回應需要？',['提供時間、材料和場地，使記錄可供社區長期使用','只給一句空泛讚美','只看即時售票額，不提供條件','完全不讓公眾看到成果'],['原文完整列創作條件與後續社區價值。','不足以完成工作。','忽略公共回報。','與共享目的相反。'],[4,5,6],'time, materials and venues...community’s identity。'),
  T('某人說：「免費活動不能賺錢，所以沒有價值。」','哪項反駁最準確？',['盈利並非唯一標準；活動可帶來學習、美感與社區互動','所有免費活動都必然最有價值','盈利永遠完全沒有意義','政府必須無條件資助每個活動'],['文章區分短期盈利與公共效益。','不應絕對化。','不是否定市場。','仍需看成效。'],[8,9,10,11],'not immediately profitable；wider public。'),
  T('兩個項目：甲票房高但只有少數人可參與；乙收入低但保留本地傳統，供學校長期使用。','本文會如何評估乙？',['應把文化保存和長期公眾使用列入價值判斷，不只看票房','收入低便必然沒有價值','文化保存與學校完全無關','只要票房高便毋須看其他作用'],['首段與次段共同支持非票房公共回報。','與原文相反。','學校可使用作品。','忽略其他效益。'],[3,5,6,8,9],'collective memory；market alone rarely protects。'),
  T('有人把城市藝術資助全稱為「浪費」。','哪種證據最能檢驗這說法？',['查作品是否保存文化、讓居民參與及產生可觀察的公共效益','只看反對者語氣是否強烈','假設每項資助都必然成功','只數藝術家個人收入'],['文章已給文化與公共兩類機制。','語氣不是證據。','不可絕對化。','忽略公眾。'],[3,6,7,10,11,15],'cultural investment；wider public；not wasting money。'),
  T('要用一句話概括全文。','哪項最準確？',['作者支持政府資助創意人士，因作品保存文化、提供公共參與，且市場收入未必反映全部價值','作者只支持最賣座的作品','作者認為任何藝術作品必然即時盈利','作者反對讓兒童接觸創意活動'],['包含立場、兩主體段及市場局限。','與文章相反。','未必即時盈利。','工作坊可惠及兒童。'],[1,2,3,5,8,9,10,12,13,14,15],'public value；collective memory；wider public。'),
];
export default {
  key:'opinion:53',
  meta:{topic:'政府資助藝術家與音樂家的公共價值',summary:'作者完全支持政府資助創意人士。藝術作品保存及豐富文化，公共資助提供時間、材料與場地，使作品可供社區長期使用；免費活動與工作坊亦可惠及公眾、改善社區。短期盈利未必反映文化與社會價值，缺少資助也可能令創作只屬於有經濟能力的人。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
