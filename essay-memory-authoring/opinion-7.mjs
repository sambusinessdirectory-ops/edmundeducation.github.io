// Model Essay 7 · Opinion: firms' responsibility to provide local sport and social spaces.
// The split thesis source records [1,2] form one English sentence.
const simple=[
  'Modern companies gain a lot from the places where they do business, so it is fair to expect them to give something back.',
  "I fully agree that companies should give local people places for sport and meeting others, because these places make people's lives better and because businesses that make money have a duty to put some of it back into the area.",
  'First, these places directly help people in the community.',
  'When a company pays for a sports field, gym or community hall, local people can exercise and meet others at low cost.',
  'This can make people healthier, because safe and easy-to-reach places to exercise make it more likely that they will do it often instead of sitting too much.',
  'The results also affect how people feel.',
  'Team sports, clubs and local events help people feel less alone, especially teenagers and older people; this can help them feel more confident, less stressed and more at home in the community.',
  'For example, if a factory pays for an evening football league and opens a place for people to meet at weekends, young people gain regular activities and families meet more often.',
  'There is another strong reason, both about what is fair and what works, to expect companies to help in this way.',
  'Big companies make money from local workers, use public roads and services, and sometimes cause problems for the nearby environment.',
  'In exchange, they should help make life better for people in the same area.',
  'More importantly, this is not just giving to others, because companies also gain when local people are healthier and have stronger ties.',
  'Places with better facilities are likely to have less conflict, a better view of employers, and workers who stay longer.',
  'For example, a company that builds a sports centre shared with local people near its offices may find it easier to hire workers, keep being seen as a good company, and gain lasting public support for its work.',
  'In short, I fully agree that companies should give local communities places for sport and meeting others.',
  'Paying for these places improves health, brings people closer, and fairly gives something back to the communities that help businesses succeed.',
];
const vocabulary=[
  [['derive substantial benefits','gain a lot','獲得大量利益'],['communities in which they operate','places where they do business','營運所在的社區'],['reasonable','fair','合理'],['something in return','something back','回報']],
  [["completely agree","fully agree","完全同意"],["provide sports and social facilities","give local people places for sport and meeting others","提供體育及社交設施"],["amenities","places","設施"],["public well-being","people's lives better","公眾福祉"],["profitable firms","businesses that make money","盈利企業"],["reinvest locally","put some of it back into the area","再投放本地"]],
  [['The first reason','First','第一個原因'],['such facilities','these places','這類設施'],['generate direct social gains','directly help people in the community','帶來直接社會效益']],
  [['funds','pays for','資助'],['sports ground','sports field','運動場'],['residents','local people','居民'],['affordable access','at low cost','可負擔地使用'],['organised interaction','meet others','有組織的社交互動']],
  [['improve physical health','make people healthier','改善身體健康'],['safe and convenient','safe and easy-to-reach','安全又方便'],['are more likely to form regular habits','make it more likely that they will do it often','較可能養成規律習慣'],['rather than drift into sedentary lifestyles','instead of sitting too much','而非逐漸陷入久坐生活']],
  [['The effects','The results','這些影響'],['psychological','how people feel','心理層面'],['as well','also','也']],
  [['neighbourhood events','local events','社區活動'],['reduce isolation','help people feel less alone','減少孤立'],['strengthen confidence','feel more confident','增強自信'],['lower stress','less stressed','減低壓力'],['a stronger sense of belonging','more at home in the community','更強歸屬感']],
  [['sponsors','pays for','資助'],['social centre','place for people to meet','社交中心'],['gives young people structure','young people gain regular activities','讓年輕人有規律活動'],['helps families mix more regularly','families meet more often','幫助家庭更常互動']],
  [['a strong moral and practical case','another strong reason, both about what is fair and what works','道德和實際理由'],['make this contribution','help in this way','作出貢獻']],
  [['Large firms','Big companies','大型企業'],['profit from local labour','make money from local workers','從本地勞動力獲利'],['public infrastructure','public roads and services','公共基礎設施'],['place pressure on','cause problems for','造成壓力'],['surrounding environment','nearby environment','周邊環境']],
  [['In return','In exchange','作為回報'],['raise the quality of life','make life better','提升生活質素']],
  [['not merely charitable','not just giving to others','不只是慈善'],['businesses benefit','companies also gain','企業亦受益'],['more cohesive','have stronger ties','更有凝聚力']],
  [['Areas','Places','地區'],['less social tension','less conflict','較少社會緊張'],['stronger goodwill towards employers','a better view of employers','對僱主更有好感'],['a more stable workforce','workers who stay longer','更穩定的勞動力']],
  [['For instance','For example','例如'],['shared sports complex','sports centre shared with local people','共享體育設施'],['recruit staff','hire workers','招聘員工'],['maintain a positive public image','keep being seen as a good company','維持正面公眾形象'],['secure long-term public support','gain lasting public support','獲得長期公眾支持'],['operations','work','營運']],
  [['In conclusion','In short','總而言之'],['completely agree','fully agree','完全同意'],['provide sports and social facilities','give local communities places for sport and meeting others','提供體育及社交設施']],
  [['Such investment','Paying for these places','這類投資'],['strengthens social cohesion','brings people closer','加強社會凝聚力'],['represents a fair return','fairly gives something back','公平回饋'],['prosper','succeed','興旺']],
];
// Full-sentence boundaries deliberately keep each cause, result and lexical bridge intact.
const chunkOverrides=[
  ['Modern businesses derive substantial benefits','from the communities in which they operate,','so it is reasonable to expect something in return.'],
  ['I completely agree that companies should provide','sports and social facilities for local residents,','because these amenities improve public well-being','and because profitable firms have a clear responsibility to reinvest locally.'],
  ['The first reason is that','such facilities generate direct social gains.'],
  ['When a company funds a sports ground, gym or community hall,','residents gain affordable access to exercise','and organised interaction.'],
  ['This can improve physical health,','since people who have safe and convenient places to be active','are more likely to form regular habits','rather than drift into sedentary lifestyles.'],
  ['The effects are','psychological as well.'],
  ['Team sports, clubs and neighbourhood events reduce isolation,','especially among teenagers and older people,','which in turn can strengthen confidence, lower stress','and create a stronger sense of belonging.'],
  ['For example, if a factory sponsors an evening football league','and opens a social centre at weekends,','it gives young people structure','and helps families mix more regularly.'],
  ['There is also a strong moral and practical case','for expecting companies to make this contribution.'],
  ['Large firms profit from local labour,','use public infrastructure','and sometimes place pressure on the surrounding environment.'],
  ['In return, they should help','raise the quality of life in the same area.'],
  ['More importantly, this is not merely charitable,','because businesses benefit','when communities are healthier and more cohesive.'],
  ['Areas with better facilities are likely to experience','less social tension, stronger goodwill towards employers','and a more stable workforce.'],
  ['For instance, a company that builds a shared sports complex near its offices','may find it easier to recruit staff,','maintain a positive public image','and secure long-term public support for its operations.'],
  ['In conclusion, I completely agree','that companies should provide sports and social facilities','for local communities.'],
  ['Such investment improves health,','strengthens social cohesion','and represents a fair return to the communities that help businesses prosper.'],
];
const simpleChunkOverrides=[
  ['Modern companies gain a lot','from the places where they do business,','so it is fair to expect them to give something back.'],
  ['I fully agree that companies should give local people','places for sport and meeting others,',"because these places make people's lives better",'and because businesses that make money have a duty to put some of it back into the area.'],
  ['First, these places','directly help people in the community.'],
  ['When a company pays for a sports field, gym or community hall,','local people can exercise','and meet others at low cost.'],
  ['This can make people healthier,','because safe and easy-to-reach places to exercise','make it more likely that they will do it often','instead of sitting too much.'],
  ['The results also affect','how people feel.'],
  ['Team sports, clubs and local events help people feel less alone,','especially teenagers and older people;','this can help them feel more confident, less stressed','and more at home in the community.'],
  ['For example, if a factory pays for an evening football league','and opens a place for people to meet at weekends,','young people gain regular activities','and families meet more often.'],
  ['There is another strong reason,','both about what is fair and what works,','to expect companies to help in this way.'],
  ['Big companies make money from local workers,','use public roads and services,','and sometimes cause problems for the nearby environment.'],
  ['In exchange, they should help','make life better for people in the same area.'],
  ['More importantly, this is not just giving to others,','because companies also gain','when local people are healthier and have stronger ties.'],
  ['Places with better facilities are likely to have','less conflict, a better view of employers,','and workers who stay longer.'],
  ['For example, a company that builds a sports centre shared with local people near its offices','may find it easier to hire workers,','keep being seen as a good company,','and gain lasting public support for its work.'],
  ['In short, I fully agree','that companies should give local communities','places for sport and meeting others.'],
  ['Paying for these places improves health,','brings people closer,','and fairly gives something back to the communities that help businesses succeed.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({
  example,answerReason,distractorReason,distractors,frame,
});
const structures=[
  S('Local hotels derive substantial benefits from clean beaches, so it is reasonable to expect support for beach cleanups in return.','so 把酒店從潔淨海灘受益的事實，接到要求其協助清潔的合理性。','這句以 so 由已知情況推到一項合理判斷。',[3,9,12],
    F('[一方] derive [所得利益] from [來源], so it is reasonable to expect [相稱回報]','先說明一方從何處受益，再以 so 推出要求其回饋的合理性；不能單靠 so 省略利益與回報的關係。','要論證受益者作出相稱回饋為何合理時。',[['Modern businesses ','slot','受益的一方'],['derive','link','指出所得'],[' substantial benefits ','slot','所得利益'],['from','link','指出來源'],[' the communities in which they operate','slot','利益來源'],[', so it is reasonable to expect','link','推出合理回報'],[' something in return.','slot','相稱回報']])),
  S('I completely agree that schools should offer free evening classes, because adults need chances to learn and because towns benefit from better skills.','先表明完全同意，再用兩個 because 分別預告兩條理由。','這句以兩個 because 各自說明一條支持立場的理由。',[0,4,11],
    F('I completely agree that [作者支持的做法], because [第一項理由] and because [第二項理由]','明確提出立場，兩個 because 依次給出兩條不同理由，而非把兩條理由混成一項。','引言要以兩條可分開展開的理由支持已定下的立場時。',[['I completely agree that','link','明確表態'],[' companies should provide sports and social facilities for local residents','slot','作者支持的做法'],[', because','link','第一項理由'],[' these amenities improve public well-being ','slot','第一項理由'],['and because','link','第二項理由'],[' profitable firms have a clear responsibility to reinvest locally.','slot','第二項理由']])),
  S('The first reason is that a free bus route gives more people access to work.','The first reason is that 直接引出首項理由。','這句用 The first reason is that 提出全文第一條主要理由。',[0,8,14],
    F('The first reason is that [第一項主要理由]','這句明確標示第一條主要理由；後文應用細節及例子證明它。','開始第一段論證，需要把首項理由清楚交給讀者時。',[['The first reason is that','link','引出第一理由'],[' such facilities generate direct social gains.','slot','第一項主要理由']])),
  S('When a school opens its hall after class, families gain a safe place to meet.','When 設定學校開放禮堂的情況，主句指出居民得到甚麼。','這句用 When 指出情況，再說明在該情況下受惠者得到甚麼。',[0,7,13],
    F('When [機構提供設施的情況], [受惠者] gain [具體可得的好處]','When 設定做法；主句具體說明誰得到甚麼，而非只聲稱「有好處」。','提出一項設施或服務後，要解釋使用者如何實際受惠時。',[['When','link','設定做法'],[' a company funds a sports ground, gym or community hall','slot','機構提供設施的情況'],[',','link','接上受惠者'],[' residents ','slot','受惠者'],['gain','link','取得'],[' affordable access to exercise and organised interaction.','slot','具體可得的好處']])),
  S('This can improve learning, since students with a quiet study room are more likely to practise daily rather than give up early.','先指出可能好處，再以 since 解釋較可能形成的習慣及其對照。','這句用 can 保留可能性，以 since 解釋機制，再用 rather than 排除另一種傾向。',[3,7,11],
    F('This can improve [可能的好處], since [有利條件下的人] are more likely to [較好的習慣] rather than [較差的傾向]','先審慎提出好處，再用 since 解釋具體機制；more likely to 只表示傾向，rather than 指出對照。','要解釋設施如何可能改變行為，並避免把結果說成必然時。',[['This can improve','link','提出可能好處'],[' physical health','slot','可能的好處'],[', since','link','解釋機制'],[' people who have safe and convenient places to be active ','slot','有利條件下的人'],['are more likely to','link','較可能'],[' form regular habits ','slot','較好的習慣'],['rather than','link','指出對照'],[' drift into sedentary lifestyles.','slot','較差的傾向']])),
  S('The benefits are financial as well.','as well 在原有層面外，補上一個不同的效益層面。','這句以 as well 追加另一種影響，而非重複前一項。',[2,10,14],
    F('[前述事物的影響] are [另一個層面] as well','在已說明的一種影響之外，用 as well 補充另一個不同層面。','已分析一個面向，接着要簡短轉入另一個面向時。',[['The effects ','slot','前述事物的影響'],['are','link','說明性質'],[' psychological ','slot','另一個層面'],['as well.','link','補充另一層面']])),
  S('Shared meals reduce loneliness, especially among new students, which in turn can make them feel more welcome.','先指出降低孤獨的作用，再以 which in turn 說明後續心理影響。','這句用 especially among 界定特別受影響者，再以 which in turn 接出連鎖影響。',[4,5,12],
    F('[共同活動] reduce [首項問題], especially among [特別受影響者], which in turn can [後續影響]','先說共同活動減少甚麼問題，指出特別受影響的人，再用 which in turn 連出可能的後續影響。','已有一項直接效果，還要說明它如何進一步影響人時。',[['Team sports, clubs and neighbourhood events ','slot','共同活動'],['reduce','link','減少'],[' isolation','slot','首項問題'],[', especially among','link','指出特別受影響者'],[' teenagers and older people','slot','特別受影響者'],[', which in turn can','link','接上後續影響'],[' strengthen confidence, lower stress and create a stronger sense of belonging.','slot','後續影響']])),
  S('For example, if a library opens its rooms at night and offers free classes, it gives workers a place to study and helps neighbours meet.','For example 引出一個 if 例子，連接兩項做法與兩項實際好處。','這句使用 For example, if 把抽象主張具體化，主句列出可觀察的結果。',[3,4,13],
    F('For example, if [具體機構採取兩項做法], it [第一項效果] and [第二項效果]','例子內先設兩項具體做法，再說由此可能得到的兩項效果；兩邊都要對得上。','提出一般好處後，要用一個具體機構的做法與結果示範時。',[['For example, if','link','引入例子的條件'],[' a factory sponsors an evening football league and opens a social centre at weekends','slot','具體機構的兩項做法'],[', it','link','接上效果'],[' gives young people structure ','slot','第一項效果'],['and','link','並列另一效果'],[' helps families mix more regularly.','slot','第二項效果']])),
  S('There is also a strong moral and practical case for expecting hotels to help keep nearby beaches clean.','同時提出公平與實際效果兩種理由，支持要求受益者出力。','這句用 moral and practical case 建立要求某方貢獻的兩種理由。',[0,2,10],
    F('There is also a strong moral and practical case for expecting [受益機構] to [應作貢獻]','moral 指應否公平回饋，practical 指做法是否帶來實際互利；兩種理由都要在後文說清楚。','第一條理由已講完，要另從公平與實際互利角度引出第二條時。',[['There is also a strong moral and practical case for expecting','link','引出公平及實際理由'],[' companies ','slot','受益機構'],['to','link','引出應做的事'],[' make this contribution.','slot','應作貢獻']])),
  S('Large hotels profit from local tourism, use public roads and sometimes place pressure on nearby beaches.','列出機構從地方取得的兩種資源，以及可能造成的一種成本。','這句並列取得資源與造成負擔，為後面的回饋責任建立事實基礎。',[0,8,11],
    F('[大型機構] profit from [本地資源一], use [公共資源二] and sometimes place pressure on [周邊環境]','列出機構使用的人力及公共資源，再指出可能造成的地方負擔；sometimes 避免說成每次必然。','要說明某機構的利益與負擔關係，以此討論相稱責任時。',[['Large firms ','slot','大型機構'],['profit from','link','從中獲利'],[' local labour','slot','本地資源一'],[', use','link','使用'],[' public infrastructure ','slot','公共資源二'],['and sometimes place pressure on','link','可能增加負擔'],[' the surrounding environment.','slot','周邊環境']])),
  S('In return, they should help improve the safety of the roads they use.','In return 把先前受益和後面應作的回饋連起來。','這句以 In return 引出與前文受益相稱的行動。',[1,7,14],
    F('In return, [曾受益的一方] should help [對同一地方的回饋]','In return 指向前文的利益；後面說受益者應如何幫助同一地方。','指出誰從一項安排受益後，要提出相稱回饋時。',[['In return,','link','承接前文利益'],[' they ','slot','曾受益的一方'],['should help','link','提出回饋責任'],[' raise the quality of life in the same area.','slot','對同一地方的回饋']])),
  S('More importantly, this is not merely generous, because local businesses also benefit when the streets are safer.','從善意捐贈轉向互利：因為受惠社區改善時，出資者也有所得。','這句以 not merely 排除單一理解，再用 because when 解釋互利原因。',[4,8,10],
    F('More importantly, this is not merely [表面上的善舉], because [出力者] benefit when [受惠地方改善]','先指出做法不只是單向善舉，再交代地方改善如何反過來幫助出力者。','要補足公平論證，說明一項社區投入也有實際互利效果時。',[['More importantly, this is not merely','link','轉向更重要的互利理由'],[' charitable','slot','表面上的善舉'],[', because','link','解釋原因'],[' businesses ','slot','出力者'],['benefit when','link','指出互利條件'],[' communities are healthier and more cohesive.','slot','受惠地方改善']])),
  S('Areas with better buses are likely to experience less traffic, more reliable travel and easier access to work.','are likely to 保留可能性，再列出三項不同好處。','這句用 are likely to 審慎預測多項可能結果。',[4,6,14],
    F('Areas with [改善的條件] are likely to experience [好處一], [好處二] and [好處三]','先指出條件改善，再審慎列出三種可能後果；不表示每個地方都必然如此。','要預測一項改善可能帶來幾種不同的社會或實際後果時。',[['Areas with ','link','設定地方條件'],['better facilities ','slot','改善的條件'],['are likely to experience','link','表示較可能經歷'],[' less social tension','slot','好處一'],[',','link','並列另一好處'],[' stronger goodwill towards employers ','slot','好處二'],['and','link','並列第三好處'],[' a more stable workforce.','slot','好處三']])),
  S('For instance, a college that builds a study room near the station may find it easier to attract students, build local trust and keep support for its courses.','For instance 給出具體機構；may find it easier to 連接三項可能收益。','這句用具體例子說明回饋地方也可能幫助出資機構。',[7,8,12],
    F('For instance, [作出投入的機構] may find it easier to [收益一], [收益二] and [收益三]','一個具體例子列出機構作出投入後較可能得到的三種收益；may 不代表保證。','抽象的互利判斷需要一個具體行動者和可觀察結果來支持時。',[['For instance,','link','引出具體例子'],[' a company that builds a shared sports complex near its offices ','slot','作出投入的機構'],['may find it easier to','link','審慎提出收益'],[' recruit staff','slot','收益一'],[',','link','並列收益'],[' maintain a positive public image ','slot','收益二'],['and','link','並列收益'],[' secure long-term public support for its operations.','slot','收益三']])),
  S('In conclusion, I completely agree that hotels should support facilities for their local communities.','In conclusion 明確收束全文，重申已由兩段支持的立場。','這句用 In conclusion 回到題目，重申已論證的立場。',[1,2,11],
    F('In conclusion, I completely agree that [重申的做法或立場]','總結句重申文章已支持的立場，不引入第三條未討論的新理由。','兩條主線已論證完，需要清楚回應原題並收束全文時。',[['In conclusion, I completely agree that','link','收束並重申立場'],[' companies should provide sports and social facilities for local communities.','slot','重申的做法或立場']])),
  S('Such investment improves learning, strengthens local trust and represents a fair return to the families who support the school.','並列兩種改善，再把投入連回曾支持出資者的群體。','這句以 improves、strengthens 和 represents a fair return 收束效益與回饋。',[0,9,12],
    F('Such investment improves [效益一], strengthens [效益二] and represents a fair return to [曾提供支持者]','結尾並列兩項社會效益，再指出受益者回饋原先支持自己的群體。','結論要同時概括一項安排的實際效益及公平原則時。',[['Such investment ','slot','所作投入'],['improves','link','概括第一效益'],[' health','slot','效益一'],[', strengthens','link','概括第二效益'],[' social cohesion ','slot','效益二'],['and represents a fair return to','link','點出公平回饋'],[' the communities that help businesses prosper.','slot','曾提供支持者']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({
  type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',
  items:rows.map(([title,body])=>({title,body})),why,
});
const intro=[
  Q('作者是否同意企業應為當地居民提供體育及社交設施？',[
    '完全同意：設施改善身心與社交，也讓從社區獲利的企業公平回饋',
    '完全反對：企業只須付工資，毋須考慮其營運所在的社區',
    '部分同意：只贊成運動設施，不接受任何社交活動',
    '沒有立場：作者只描述不同設施的建造成本',
  ],'引言與結論都說 completely agree；兩段分別討論居民所得的好處及企業回饋的公平與實際理由。'),
  {type:'multi',prompt:'選出支持作者立場的兩條主要論證',detail:'選兩項，再按「確認」。',options:[
    '設施提供可負擔的運動與相聚機會，改善身心健康及歸屬感',
    '企業使用本地人力與公共資源，公平回饋也可使企業受益',
    '每一家企業都必須建造同一種體育場館，不論社區需要',
    '所有居民參與活動後，都必然成為該企業的員工',
  ],correct:[0,1],why:'第一主體段講直接社會效益；第二主體段講回饋的公平性及企業可能得到的實際好處。'},
];
const route=[sequence('把四段文章路線排好',[
  ['引言 · 立場','企業從社區受益，完全同意它們應提供體育與社交設施；預告福祉與回饋責任。'],
  ['主體段一 · 居民所得','運動場、健身房與會堂提供可負擔的活動；規律運動及相聚有益身心與歸屬感。'],
  ['主體段二 · 公平與互利','企業使用本地人力和公共設施，應回饋；健康、凝聚的社區又可能有利企業。'],
  ['結論 · 雙重理由','重申完全同意，總結健康、社會凝聚與公平回報。'],
],'社區讓企業受益 → 設施直接幫居民 → 公平回饋也使企業受益 → 重申立場。')];
const evidence=[
  Q('企業資助運動場、健身房或會堂後，居民直接得到甚麼？',[
    '以可負擔的方式接觸運動和有組織的社交活動',
    '毋須工作便自動得到企業的全部利潤',
    '所有人都會立即成為專業運動員',
    '社區內所有其他公共服務都可以關閉',
  ],'原文寫 affordable access to exercise and organised interaction；直接效益是使用設施，不是收入或職業保證。'),
  Q('安全而方便的活動空間，為何可能改善身體健康？',[
    '較容易養成規律活動習慣，而非逐漸走向久坐生活',
    '只要設施存在，所有人便必定每天使用',
    '運動場會自動治療所有疾病，毋須活動',
    '居民必須加入足球聯賽，其他運動都沒有效用',
  ],'原文使用 are more likely to；設施降低規律活動的門檻，但不保證每個人都會參與。'),
  Q('團隊運動、社團和鄰里活動如何帶來心理效益？',[
    '減少孤立感，進一步可能增強自信、降低壓力及歸屬感',
    '使每個參加者立刻完全沒有壓力',
    '只讓青少年受惠，長者完全不會有社交需要',
    '只改善企業的外觀，不會改變任何居民的感受',
  ],'which in turn 把減少孤立與可能出現的自信、壓力和歸屬感變化連起來。'),
  Q('工廠贊助夜間足球聯賽的例子，如何支持第一主體段？',[
    '讓年輕人有規律活動，也令家庭之間更常相聚',
    '證明所有工廠都已經設有足球聯賽',
    '說明贊助必定令每名青年加入工廠工作',
    '只討論足球比賽結果，沒有涉及社區生活',
  ],'例子具體展示兩種直接社會效益：young people structure 與 families mix more regularly。'),
  Q('第二主體段指出大型企業與社區之間有哪三項關係？',[
    '從本地勞動力獲利、使用公共基建，並有時對周邊環境造成壓力',
    '只使用完全由企業自資建造的設施，與社區沒有互動',
    '不聘用本地員工，也從未使用任何公共資源',
    '企業必然改善所有環境問題，所以社區毋須回饋',
  ],'這三項是 In return 之前的事實根據；sometimes 限定環境壓力並非每次必然出現。'),
  Q('作者為甚麼說企業投入社區「不只是慈善」？',[
    '更健康、更凝聚的社區也可能讓企業較易招聘、維持形象和得到支持',
    '企業每次捐款都能立即收回同額現金',
    '慈善在任何情況都沒有道德價值',
    '居民使用設施後便必須無薪為企業工作',
  ],'原文由公平回饋轉到實際互利，並在後面的例子列出企業可能得到的具體好處。'),
];
const logic=[
  sequence('第一主體段：設施如何走到身心與社交效益？',[
    ['首項理由','企業提供的設施能帶來直接社會效益。'],
    ['具體投入','企業資助運動場、健身房或社區會堂。'],
    ['直接使用','居民以可負擔的方式運動和參加有組織的相聚活動。'],
    ['身體機制','安全方便的空間使規律活動較可能形成，減少久坐傾向。'],
    ['心理機制','團隊運動、社團與活動減少孤立，可能提升自信與歸屬感。'],
    ['工廠例子','夜間足球聯賽和週末社交中心，分別幫助青年及家庭。'],
  ],'設施可用 → 活動更易持續 → 孤立較少 → 身心及社交效益。'),
  sequence('第二主體段：公平回饋如何也成為企業的實際利益？',[
    ['第二項主張','要求企業出力有道德及實際根據。'],
    ['所受利益與負擔','企業從本地人力獲利，使用公共基建，亦有時增加環境壓力。'],
    ['公平回報','因此企業應提升同一地區的生活質素。'],
    ['不只是善舉','健康而凝聚的社區，反過來也能使企業受益。'],
    ['可能的好處','社會緊張較少、居民善意較強、勞動力較穩定。'],
    ['具體例子','共享體育設施可能有助招聘、形象和長期公眾支持。'],
  ],'從社區受益 → 應公平回報 → 社區改善 → 企業也可能長期受惠。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transfer=[
  T('一間酒店依靠附近潔淨海灘吸引旅客，地方政府希望它支持海灘保育。','哪項最能轉用範文的回饋原則？',[
    '指出酒店從海灘受益，因此要求其協助保育具有合理基礎',
    '只看酒店房價，便判定它完全沒有受惠於海灘',
    '認為任何使用海灘的人都必須把所有收入交給政府',
    '因海灘屬公共地方，就認定酒店與其維護毫無關係',
  ],[
    '這保留「從地方資源受益 → 相稱回饋合理」的原文推理。',
    '房價無法單獨回答酒店是否受惠於當地資源。',
    '原文支持合理回饋，沒有要求交出全部收入。',
    '公共性不會消除受益者可承擔的責任。',
  ],[0,8,9,10],'原文先說企業從所在社區受益，再以 In return 提出應提升同一地區生活質素。'),
  T('科技公司資助附近學校的課後電腦室。','哪項最能先說明學生可得到的直接效益？',[
    '具體指出學生能在放學後以低成本使用設備，並在安全空間一起學習',
    '只說公司很有善心，不解釋電腦室如何被使用',
    '推斷每名學生都會立刻成為程式設計師',
    '只列出設備價格，便認定學生已形成規律學習習慣',
  ],[
    '這像原文先說可負擔地使用設施，再說運動與相聚如何發生。',
    '善意評價沒有說明居民實際得到甚麼。',
    '設施可用不保證每名學生的職業結果。',
    '設備價格不能證明實際使用或習慣形成。',
  ],[2,3,4],'範文先具體說居民得到 affordable access to exercise and organised interaction，再談後續身心效益。'),
  T('僱主在工廠旁建一條安全步道，讓附近居民免費使用。','哪項最符合範文的「可能養成習慣」推理？',[
    '說明安全方便的步道降低日常散步門檻，因此居民較可能持續活動',
    '認為步道建成後每位居民必定每天散步',
    '只討論步道長度，不說它如何影響使用者習慣',
    '聲稱步道能治好所有疾病，毋須居民親自使用',
  ],[
    '這保留安全方便的空間與較可能形成規律活動之間的機制。',
    '原文的 more likely to 並非每人必然使用。',
    '長度本身不能完整說明習慣變化。',
    '健康改善仍需實際使用，並非設施自動治病。',
  ],[3,4],'範文說有安全方便的活動地方，人們較可能養成規律習慣，而不是漸漸久坐。'),
  T('商場每週開放一個免費棋藝室，吸引獨居長者和青少年。','哪項最能轉用範文的心理效益鏈？',[
    '分析反覆參與如何減少孤立，進一步可能提升自信與歸屬感',
    '只比較棋盤數目，便斷言所有參加者的壓力已消失',
    '認為棋藝不屬運動，所以不可能帶來任何社交好處',
    '推斷長者與青少年必定有完全相同的參與需要',
  ],[
    '這保留「相聚 → 孤立減少 → 可能的心理效益」的先後次序。',
    '器材數量無法證明孤立或壓力已改變。',
    '原文的 clubs 與 neighbourhood events 並不局限體育。',
    '特別受影響群體可以有不同需要，不能視為一致。',
  ],[5,6,7],'原文說社團與社區活動減少孤立；which in turn can 再連到自信、壓力和歸屬感。'),
  T('物流企業要捐助社區會堂，但宣傳文只寫「我們關心大家」。','哪項修改最能學習原文例子的作用？',[
    '寫清楚會堂何時開放、誰可使用，以及居民可如何一起參加活動',
    '把「關心」重複十次，避免寫任何具體安排',
    '只展示會堂外牆顏色，便當作社交效益的證據',
    '預先保證所有居民都會成為朋友，毋須觀察實際使用',
  ],[
    '這像工廠例子把具體做法與青年、家庭的結果連起來。',
    '重複態度不能取代做法與結果。',
    '外觀不能證明居民有規律活動或交流。',
    '例子應展示可能途徑，而非保證每人結果。',
  ],[7],'範文的工廠例子明列夜間足球聯賽、週末社交中心，以及青年和家庭可得到的不同作用。'),
  T('一家大型餐飲集團使用市政道路運貨，也聘用不少附近居民。','哪項最能建立其支持本地設施的公平理由？',[
    '列明它如何使用本地人力與公共道路，再提出相稱的地方回饋',
    '只因它是大型企業便要求其負責所有市政開支',
    '認為企業有付薪，所以從未使用任何地方資源',
    '只比較餐牌價格，不討論它與社區的資源關係',
  ],[
    '這對應原文先列企業所用人力與公共基建，再提出 In return。',
    '公平回饋須與受益關係相稱，不等於承擔所有開支。',
    '付薪不會使公共道路及地方資源的使用消失。',
    '餐牌價格不能取代受益與回饋分析。',
  ],[8,9,10],'原文第二主體段以 local labour 和 public infrastructure 作為企業應回饋同一地區的根據。'),
  T('藥廠支持鄰近地區的健康講座，主管稱這純粹是慈善，對企業毫無關係。','哪項回應最能轉用「不只是慈善」？',[
    '分析社區健康改善是否也有助穩定員工與維持良好地方關係',
    '聲稱每一場講座都必定即時增加藥品銷量',
    '因企業可能受益便否認居民會得到任何好處',
    '只查講座場租，完全不看社區與企業的變化',
  ],[
    '這把居民得到的好處與企業可能得到的長期實際利益連起來。',
    '原文說可能受益，沒有保證每次即時增加銷量。',
    '互利表示兩邊都可能受益，不必排除任何一邊。',
    '場租不能單獨回答健康、員工與地方關係是否改善。',
  ],[11,12,13],'原文以 not merely charitable 轉入企業在健康、凝聚社區中也可能受益的論證。'),
  T('大型僱主計劃在辦公室附近建公共托兒中心。','哪項最貼近範文列出企業實際收益的方法？',[
    '審慎評估中心是否有助招聘、員工穩定及居民對企業的看法',
    '保證每位使用托兒中心的家長都會加入該公司',
    '只計算建築樓層，便判定企業形象已改善',
    '假設托兒服務對家長有利，所以企業不可能受益',
  ],[
    '這把共享設施轉成可檢驗的招聘、穩定與公眾善意。',
    'may find it easier to 不是對每個人的就業保證。',
    '樓層數無法證明招聘或形象的實際結果。',
    '居民與企業可能同時得到好處。',
  ],[12,13],'範文以共享體育設施為例，審慎說明較易招聘、維持形象及得到長期支持。'),
  T('一間公司願意捐款，但只想建大型足球場；當地居民更需要小型多用途活動室。','哪項最能保留範文第一主體段的核心？',[
    '先調查居民能否負擔和實際使用設施，再選擇有助活動與相聚的安排',
    '公司已願意出錢，所以設施是否可用完全不重要',
    '只要場館夠大，所有年齡層必然有相同使用方式',
    '按照公司名稱設計招牌，便能代替居民的使用機會',
  ],[
    '原文重點是居民可負擔地使用，並由使用產生身心與社交效益。',
    '出資本身不等於居民能實際受惠。',
    '不同居民的需要可能不同，不能靠場館規模推斷。',
    '招牌不會產生規律活動或有組織的相聚。',
  ],[3,4,6],'範文說居民得到 affordable access 才能經常活動、互動，後續效益才有具體途徑。'),
  T('地方企業免費開放一間多用途室給青少年，但參與人數持續很少。','哪項檢查最能避免把設施效益說成必然？',[
    '了解開放時間、安全程度與交通便利，再觀察青少年是否養成定期參與習慣',
    '只因房間存在，就宣稱孤立和壓力已經消失',
    '認為參與人數低，便證明所有社區設施都沒有價值',
    '只比較房間內的桌椅數目，不理會進入門檻',
  ],[
    '這檢查原文所說 safe and convenient 及 regular habits 的實際條件。',
    '設施存在不等於參與或心理結果必然出現。',
    '一個設施的使用情況不能代表所有設施。',
    '器材數量不能代替可達性與持續使用。',
  ],[3,4,6],'範文以 can 和 more likely to 保留可能性，並指出安全、方便與規律使用的中間環節。'),
  T('城市運輸公司借助本地道路與勞動力經營，考慮資助附近的青年活動。','哪項最能結合範文兩條主線？',[
    '說明活動如何讓青年與家庭受惠，也說明公司從地方資源受益而應回饋',
    '只稱公司有慈善心，不說居民用途與受益關係',
    '只計算公司車輛數目，便推斷青年已建立歸屬感',
    '只討論青年活動，完全不回應企業為何承擔責任',
  ],[
    '這同時用到居民的直接效益與企業的公平回饋兩條不同理由。',
    '空泛的善意不能代替兩段的具體論證。',
    '車輛數目不會證明社交或心理效益。',
    '只談居民好處，會漏掉作者第二條理由。',
  ],[3,6,7,9,10],'範文一方面講設施帶來的身心與社交效益，另一方面講企業使用本地資源後的回饋責任。'),
  T('企業在社區中心提供免費課程，卻只用「提高品牌曝光」解釋其目的。','哪項結論較能完整運用範文的互利觀？',[
    '檢查居民是否學到技能與建立聯繫，也評估企業能否得到長期善意與穩定支持',
    '品牌被看見便足以證明居民已得到實際幫助',
    '企業可能受益便代表這項投入不可能公平',
    '課程免費便保證每位居民都會參加及支持企業',
  ],[
    '這把居民的實際好處與企業的長期收益一同納入，而不把互利簡化為宣傳。',
    '曝光度不能單獨證明學習或社交結果。',
    '原文正認為公平回饋與企業受益可以同時成立。',
    '免費降低價格門檻，但不保證所有人參與。',
  ],[2,3,11,12,13],'範文指出設施可直接幫居民，而企業也可能由較健康、更凝聚的社區及公眾善意受益。'),
];
export default {
  key:'opinion:7',
  meta:{topic:'企業回饋社區的設施責任',summary:'作者完全同意企業應提供體育及社交設施：居民可得到身心與社交好處，從地方資源受益的企業也應公平回饋並可能因此受益。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
