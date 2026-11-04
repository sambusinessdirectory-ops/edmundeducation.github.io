const simple=[
  'Online services have grown quickly and changed how people get news, music, and things to watch.',
  'Because of this, some people say radio will soon disappear.',
  'I strongly disagree: radio still helps people in ways online media cannot fully copy, and it can change to work well with new technology.',
  'First, radio is still useful because people can get information without looking at a screen the whole time.',
  'Online media can do a lot, but much of it needs screens, moving through pages, and regular use of controls.',
  'Radio, however, can be on while people drive, make food, exercise, or work.',
  'For example, a driver in busy traffic can hear a traffic update at once, while reading a website or watching a clip would be unsafe and difficult.',
  'This everyday ease means radio will stay useful for a long time.',
  'It is more than an old machine: it is easy to use and dependable when looking at a screen causes problems.',
  'Second, online media may actually help radio grow instead of ending it.',
  'Radio programmes no longer have to come from a box sitting in a room.',
  'Stations can play programmes live online, put up interviews, share short sound clips, and reach people on their phones.',
  'More important, radio often has a local and friendly voice that big online services find hard to provide.',
  'When the community has an event, bad weather, or an emergency, people may still want to hear a familiar speaker explain what is happening in simple words for their area.',
  'This feeling of getting timely news from someone trusted is hard to replace.',
  'In short, I strongly disagree that radio has no future.',
  'Even though online media has changed habits, radio is still useful: it is easy to use, easy to get, able to change, and connected to local life.',
  'Its shape may keep changing, but the main thing it does will continue.',
];
const vocabulary=[
  [['rapid growth','grown quickly','快速增長'],['digital platforms','Online services','數碼平台'],['follow news','get news','獲取新聞'],['entertainment','things to watch','娛樂']],
  [['therefore','Because of this','因此'],['radio is approaching the end of its life','radio will soon disappear','電台走向終結']],
  [['completely disagree','strongly disagree','完全不同意'],['practical needs','helps people','實際需要'],['cannot fully replace','cannot fully copy','無法完全取代'],['adapt successfully to the digital age','change to work well with new technology','適應數碼時代']],
  [['remains valuable','is still useful','仍有價值'],['receive information','get information','接收資訊'],['without giving their full visual attention','without looking at a screen the whole time','毋須全神貫注看屏幕']],
  [['powerful','can do a lot','功能強大'],['depends on screens','needs screens','依賴屏幕'],['scrolling','moving through pages','滑動操作'],['constant interaction','regular use of controls','持續互動']],
  [['by contrast','however','相比之下'],['driving','drive','駕車'],['cooking','make food','煮食'],['exercising','exercise','運動']],
  [['travelling through heavy traffic','in busy traffic','繁忙交通中'],['for instance','For example','例如'],['traffic bulletin','traffic update','交通消息'],['immediately','at once','即時'],['unsafe and impractical','unsafe and difficult','不安全不實際']],
  [['everyday convenience','everyday ease','日常便利'],['lasting role','stay useful for a long time','持久角色']],
  [['not merely an old device','more than an old machine','不只舊設備'],['simple and reliable companion','easy to use and dependable','簡單可靠夥伴'],['screens become a burden','looking at a screen causes problems','屏幕成負擔']],
  [['Second','Second','第二'],['actually strengthen radio','help radio grow','反可強化電台'],['rather than destroy it','instead of ending it','而非摧毀']],
  [['no longer confined','no longer have to come','不再局限'],['physical receiver','box','實體接收器'],['in the corner of a room','sitting in a room','房間角落']],
  [['stream live programmes','play programmes live online','直播節目'],['upload interviews','put up interviews','上載訪問'],['short audio clips','short sound clips','短音頻'],['reach listeners through mobile phones','reach people on their phones','透過手機接觸聽眾']],
  [['More importantly','More important','更重要'],['local and human voice','local and friendly voice','本地人情味聲音'],['large online platforms','big online services','大型網上平台'],['struggle to offer','find hard to provide','難以提供']],
  [['community events','the community has an event','社區活動'],['public emergencies','an emergency','公共緊急情況'],['familiar presenter','familiar speaker','熟悉主持'],['plain language','simple words','簡明語言'],['their area','their area','所在地區']],
  [['sense of immediacy and trust','feeling of getting timely news from someone trusted','即時與信任感'],['difficult to replace','hard to replace','難以取代']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['no future','no future','沒有未來']],
  [['Although','Even though','儘管'],['changed people’s habits','changed habits','改變習慣'],['convenient','easy to use','方便'],['accessible','easy to get','易接觸'],['adaptable','able to change','可適應'],['locally relevant','connected to local life','與本地相關']],
  [['form may continue to evolve','shape may keep changing','形式繼續演變'],['core purpose','main thing it does','核心功能'],['will survive','will continue','將存續']],
];
const chunkOverrides={1:['Some therefore argue','that radio is approaching the end of its life.'],7:['This everyday convenience','gives radio a lasting role.'],14:['This sense of immediacy and trust','is difficult to replace.'],15:['In conclusion, I completely disagree','that radio has no future.'],17:['Its form may continue to evolve,','but its core purpose will survive.']};
const simpleChunkOverrides={1:['Because of this, some people say','radio will soon disappear.'],7:['This everyday ease means','radio will stay useful for a long time.'],14:['This feeling of getting timely news from someone trusted','is hard to replace.'],15:['In short, I strongly disagree','that radio has no future.'],17:['Its shape may keep changing,','but the main thing it does will continue.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('The rapid growth of school apps has changed how parents follow school news, lessons, and events.','快速發展與使用習慣改變建立題目背景。','改變不等於舊媒介必然消失。',[1,2,9],F('The rapid growth of [新平台] has changed how [人] [多種活動]','承認新媒介已改變生活方式。','題目以新科技取代舊服務為前提時，先準確描述變化。',[['The rapid growth of ','link','快速發展'],['digital platforms','slot','新平台'],[' has changed how ','link','已改變'],['people','slot','人'],[' follow ','link','如何取得'],['news, music, and entertainment.','slot','多種活動']])),
  S('Some therefore argue that the printed book is approaching the end of its life.','therefore 連接新技術背景與他人對舊媒介的預測。','這是他人推論，作者下一句反對。',[0,2,9],F('Some therefore argue that [舊媒介] is approaching the end of its life','交代需要回應的消失預測。','有人由新媒介增長推斷舊媒介沒有未來時。',[['Some therefore argue that ','link','因此有人認為'],['radio','slot','舊媒介'],[' is approaching the end of its life.','link','快到終點']])),
  S('I completely disagree with this view, because the public library still serves practical needs that digital catalogues cannot fully replace and it can adapt successfully to the digital age.','because 後預告兩條理由：實際用途及數碼適應。','作者不否認網媒強大，而是否定收音機無未來。',[1,3,9],F('I completely disagree with this view, because [舊服務] still serves practical needs that [新服務] cannot fully replace and it can adapt successfully to the digital age','直接反對消失論，預告功能與轉型兩個論點。','舊服務仍有獨特用途，且能借新技術改變時。',[['I completely disagree with this view, because ','link','完全不同意，因'],['radio','slot','舊服務'],[' still serves practical needs that ','link','仍滿足需要，'],['online media','slot','新服務'],[' cannot fully replace and it can adapt successfully to the digital age.','link','不能全取代而可適應']])),
  S('First, an audiobook remains valuable because it allows people to receive information without giving their full visual attention.','because 解釋音訊與屏幕媒介的使用差別。','不是聲稱所有時刻都不應看屏幕。',[2,4,5],F('First, [音訊媒介] remains valuable because it allows people to receive information without giving their full visual attention','指出不佔用視線的功能優勢。','要比較媒介時，說明其中一種能在雙眼忙碌時使用。',[['First, ','link','首先'],['radio','slot','音訊媒介'],[' remains valuable because it allows people to receive information without giving their full visual attention.','link','不用全看仍可收資訊']])),
  S('Online learning is powerful, but much of it depends on screens, scrolling, and constant interaction.','but 對照功能強大與使用時需要看及操作。','承認新媒介有價值，沒有把它描述成無用。',[3,5,6],F('[新媒介] is powerful, but much of it depends on screens, scrolling, and constant interaction','給新媒介有限讓步，再指出使用負擔。','要說明新工具雖強，卻不能在每種情境取代音訊時。',[['Online media','slot','新媒介'],[' is powerful, but much of it depends on screens, scrolling, and constant interaction.','link','強大但需屏幕操作']])),
  S('An audio lesson, by contrast, can be used while people are driving, cooking, exercising, or working.','by contrast 將音訊可伴隨多種活動的優勢提出。','不是鼓勵駕車時操作裝置；原文強調收聽。',[3,4,6],F('[音訊服務], by contrast, can be used while people are [多項其他活動]','列出毋須看屏幕的實際場景。','已指出屏幕負擔後，要展示音訊可與哪些活動並行時。',[['Radio','slot','音訊服務'],[', by contrast, can be used while people are ','link','相對可在...時用'],['driving, cooking, exercising, or working.','slot','多項其他活動']])),
  S('A bus driver travelling through heavy traffic, for instance, can listen to a traffic bulletin immediately, whereas checking a website or watching a news clip would be unsafe and impractical.','whereas 以同一駕車情境比較收聽與看屏幕。','不是說所有網站都不安全，而是在駕車時看屏幕不合適。',[4,5,7],F('A [人物] travelling through heavy traffic, for instance, can listen to [音訊] immediately, whereas [看屏幕] would be unsafe and impractical','以安全相關情境證明功能不能完全替代。','已列日常使用場景，需要一個具體比較展示為何音訊更適合時。',[['A ','link','一位'],['driver','slot','人物'],[' travelling through heavy traffic, for instance, can listen to ','link','塞車中可即時收聽'],['a traffic bulletin','slot','音訊'],[' immediately, whereas ','link','相反'],['checking a website or watching a news clip','slot','看屏幕'],[' would be unsafe and impractical.','link','既不安全亦不實際']])),
  S('This everyday convenience gives audiobooks a lasting role.','由例子抽出日常便利帶來持久用途的判斷。','一個例子不是說收音機在所有用途都勝網媒。',[5,6,8],F('This everyday convenience gives [舊媒介] a lasting role','把具體場景提升為持久功能。','已給出生活例子，要點明它為何支持舊媒介仍有未來時。',[['This everyday convenience gives ','link','日常便利賦予'],['radio','slot','舊媒介'],[' a lasting role.','link','長遠角色']])),
  S('A paper map is not merely an old device from the past, but a simple and reliable companion in situations where screens become a burden.','not merely...but... 把過時標籤改成特定場景的可靠用途。','不是否定收音機歷史悠久，而是反對因此判定無用。',[5,7,9],F('[舊媒介] is not merely an old device from the past, but a simple and reliable companion in situations where screens become a burden','以使用情境重新評價舊設備。','要回應「過時便無用」的判斷，並指出某事物在特定情況下仍有用途時。',[['It','slot','舊媒介'],[' is not merely an old device from the past, but a simple and reliable companion in situations where screens become a burden.','link','不只是舊設備而是可靠陪伴']])),
  S('Second, the development of online tools can actually strengthen the library rather than destroy it.','rather than 對照競爭預期與融合可能。','第二段不是重複駕車收聽，而是談數碼轉型。',[2,8,10],F('Second, the development of [新媒介] can actually strengthen [舊服務] rather than destroy it','指出新技術可成為舊服務的渠道。','對方認為新舊必然互斥時，要提出新技術可幫助舊服務。',[['Second, the development of ','link','第二：發展'],['online media','slot','新媒介'],[' can actually strengthen ','link','反而可強化'],['radio','slot','舊服務'],[' rather than destroy it.','link','而非摧毀']])),
  S('Modern television is no longer confined to a physical receiver in the corner of a room.','no longer confined 說明服務可超出舊硬件形式。','不是說實體收音機會全部消失，而是服務有更多渠道。',[8,9,11],F('Modern [服務] is no longer confined to a physical [設備] in the corner of a room','將舊服務與舊硬件形式分開。','新平台可傳送舊服務內容時，要指出服務不受某件設備限制。',[['Modern ','link','現代'],['radio','slot','服務'],[' is no longer confined to a physical ','link','不再局限實體'],['receiver','slot','設備'],[' in the corner of a room.','link','房間角落']])),
  S('Libraries can stream live talks, upload interviews, share short audio clips, and reach listeners through mobile phones.','四個動作具體展示數碼渠道如何擴大傳播。','不是空泛地說「適應科技」，而是列出操作方式。',[9,10,12],F('[機構] can [數種數碼行動] and reach listeners through mobile phones','以具體措施證明舊服務可數碼化。','提出可適應新科技後，需列出實際發布與接觸方式時。',[['Stations','slot','機構'],[' can ','link','可'],['stream live programmes, upload interviews, share short audio clips,','slot','數種數碼行動'],[' and reach listeners through mobile phones.','link','透過手機接觸聽眾']])),
  S('More importantly, a community podcast often provides a local and human voice that large online platforms struggle to offer.','More importantly 將重點從渠道移到本地人聲與信任。','不是說大型平台絕對沒有本地內容，而是電台常有此優勢。',[9,11,13],F('More importantly, [本地服務] often provides a local and human voice that large online platforms struggle to offer','在技術措施以外提出難以替代的人際價值。','已列數碼渠道後，要指出舊服務仍有獨特的本地關係時。',[['More importantly, ','link','更重要'],['radio','slot','本地服務'],[' often provides a local and human voice that large online platforms struggle to offer.','link','常提供本地人聲']])),
  S('During community events, bad weather, or public emergencies, people may still value a familiar presenter who speaks directly to their area and explains what is happening in plain language.','列特定場合，說明熟悉主持人的即時與本地價值。','may 指可能重視，不是說只有電台能提供消息。',[11,12,14],F('During [三種場景], people may still value a familiar presenter who [本地清楚解釋]','把人情味優勢落到社區與緊急場景。','主張服務與本地相關時，要指出在甚麼情境及怎樣發揮作用。',[['During ','link','在'],['community events, bad weather, or public emergencies','slot','三種場景'],[', people may still value a familiar presenter who ','link','人仍重視熟悉主持'],['speaks directly to their area and explains what is happening in plain language.','slot','本地清楚解釋']])),
  S('This sense of immediacy and trust is difficult to replace.','用短句收束主持人的即時與信任感。','不是重複數碼轉型功能，而是其人際效果。',[12,13,15],F('This sense of [兩種感受] is difficult to replace','從具體例子抽出難被取代的核心價值。','已描述熟悉的人即時向社區說明後，需要命名聽眾得到的感受時。',[['This sense of ','link','這種感覺'],['immediacy and trust','slot','兩種感受'],[' is difficult to replace.','link','難以取代']])),
  S('In conclusion, I completely disagree that community radio has no future.','結論直接反對題目「沒有未來」判斷。','作者並非否認網媒發展，仍承認其改變習慣。',[1,2,16],F('In conclusion, I completely disagree that [舊服務] has no future','用同一命題清楚作答。','題目宣稱某媒介將消失時，結論須直接表明是否接受。',[['In conclusion, I completely disagree that ','link','總結完全不同意'],['radio','slot','舊服務'],[' has no future.','link','沒有未來']])),
  S('Although online learning has changed pupils’ habits, radio remains useful because it is convenient, accessible, adaptable, and locally relevant.','Although 承認新媒介改變；because 彙整四項存續理由。','不是說收音機完全沒有改變；適應性正是理由之一。',[2,9,15],F('Although [新媒介] has changed [習慣], [舊服務] remains useful because it is [四種優點]','末段承認變化，同時壓縮全文理由。','結論需要兼顧新趨勢與舊服務的多項實際價值時。',[['Although ','link','雖然'],['online media','slot','新媒介'],[' has changed ','link','已改變'],['people’s habits','slot','習慣'],[', ','link','但'],['radio','slot','舊服務'],[' remains useful because it is ','link','仍有用，因'],['convenient, accessible, adaptable, and locally relevant.','slot','四種優點']])),
  S('A library’s form may continue to evolve, but its core purpose will survive.','形式可變與核心用途可存續的對照收束全文。','沒有保證未來仍只用舊式實體收音機。',[10,11,16],F('[服務形式] may continue to evolve, but its core purpose will survive','把媒介形式與功能存續分開。','要對照事物可變的形式與可能持續的核心用途時。',[['Its form','slot','服務形式'],[' may continue to evolve, but its core purpose will survive.','link','形式變而功能存']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者同意網媒發展使收音機「沒有未來」嗎？',['完全不同意；音訊有不佔視線的用途，電台亦可借數碼渠道發展','完全同意；任何聲音節目都必須停播','沒有立場；只比較收音機售價','完全同意；手機不可能播放電台節目'],'引言反對無未來論，兩段理由是實用情境與數碼適應。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['駕車、煮食等情境可收聽而不用一直看屏幕','電台可直播、上載訪問並透過手機接觸本地聽眾','網媒完全沒有任何資訊或娛樂用途','電台只能用房間角落的實體接收器收聽'],correct:[0,1],why:'首段是不佔視線；次段是數碼轉型和本地人聲。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 反對消失論','數碼平台改變習慣，但收音機有獨特用途也可適應。'],
  ['主體一 · 不佔視線','駕車與其他活動時可收聽；交通消息例子作對照。'],
  ['主體二 · 數碼與本地','直播、訪問、短音頻和手機；熟悉主持人的本地信任。'],
  ['結論 · 形式可變','仍方便、易接觸、可適應，核心用途可延續。'],
],'新平台背景 → 音訊使用優勢 → 數碼轉型與本地價值 → 形式變功能存。')];
const evidence=[
  Q('收音機在第一段最重要的功能差異是甚麼？',['接收資訊時不必全神貫注看屏幕','一定比所有網站更新得快','可以取代每一種視覺內容','只有駕車人士才可使用'],'without giving full visual attention。'),
  Q('駕車例子將哪兩種方式對照？',['即時聽交通消息與不安全地看網頁或影片','收音機播音樂與電視播放電影','駕車上班與步行上班','在家煮食與在外運動'],'whereas 結構對比同一情境中的兩種媒介。'),
  Q('電台可透過數碼平台做甚麼？',['直播節目、上載訪問、分享短音頻及接觸手機聽眾','只使用房間角落的接收器','永久停止一切音訊節目','只向已買收音機的人發紙本消息'],'原文列四項可行的數碼發布方式。'),
  Q('本地主持人在甚麼情境較有價值？',['社區活動、惡劣天氣與公共緊急情況','只有國際電影頒獎禮','只在手機沒有電池時','只有電台完全停止播放時'],'source lists three local situations。'),
  Q('結論將甚麼分開？',['媒介形式可能演變，核心用途仍可延續','形式不變，功能一定全部消失','收音機與所有聲音內容完全無關','網媒發展與人的習慣全無關係'],'Its form may evolve, core purpose will survive。'),
];
const logic=[
  sequence('主體一：為何音訊仍有實用價值？',[
    ['首因','收資訊時無須全神貫注看屏幕。'],
    ['比較','網媒不少內容需要螢幕、滑動與互動。'],
    ['可用場景','駕車、煮食、運動或工作時仍可聽。'],
    ['具體例子','塞車時聽交通消息，比看影片安全實際。'],
    ['段落收束','日常便利令收音機有長遠角色。'],
  ],'視線需求 → 具體活動 → 同一情境對照 → 長遠用途。'),
  sequence('主體二：網媒為何不一定消滅電台？',[
    ['轉向','網上媒體可能反而強化電台。'],
    ['形式突破','不再只靠實體接收器。'],
    ['實際措施','直播、上載訪問、短音頻與手機接觸。'],
    ['本地人聲','熟悉主持人在社區及緊急時清楚解釋。'],
    ['核心價值','即時感與信任難以被取代。'],
  ],'新渠道 → 節目傳播 → 本地關係 → 信任。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('有人認為電子書普及，紙本書便完全沒有未來。','文章的推理會先問甚麼？',['紙本有何獨特用途，能否借數碼渠道接觸讀者','電子書是否有鮮豔封面，便足以推斷一切','一種新工具成長，便保證舊工具立即消失','紙本只要存在過，就不需考慮任何新技術'],['檢驗功能與適應，而非由增長直接推消失。','外觀不是論點。','推論過快。','仍須適應。'],[0,1,2,9,10,11,17],'practical needs and adaptation。'),
  T('司機要知道前方交通，面前有廣播與一段需看屏幕的影片。','哪項符合首段的情境比較？',['開車時收聽消息較安全，毋須分心看屏幕','駕車時看影片一定比收聽資訊更安全','只要新聞放上網，就應在開車時滑動頁面','廣播只能播音樂，完全不能提供交通資訊'],['同一情境下音訊有視線優勢。','與原文相反。','不安全。','traffic bulletin 是例子。'],[3,4,5,6],'traffic bulletin versus checking a website。'),
  T('教師錄製聲音講解，學生做家務時可聽。','怎樣遷移收音機的功能優勢？',['音訊可伴隨另一活動，不必一直看屏幕','聲音講解若不用屏幕，就必然沒有知識','學生做家務時應同時看影片才算學習','音訊可伴隨家務，便代表閱讀不再有用'],['音訊較少佔用視覺注意。','否定內容不合理。','違背場景。','不否定其他媒介。'],[3,4,5,8],'without full visual attention。'),
  T('圖書館把講座直播，也把訪問剪成短音頻給手機用戶。','這種做法符合第二段哪項？',['舊服務可借新渠道傳播，未被新平台消滅','數碼渠道一出現，圖書館就必須關閉','講座變成音頻後，內容便必然完全無人聽','手機可播節目，便證明所有本地服務無用'],['新媒介可以強化舊服務。','不是必然淘汰。','可接觸更多人。','本地價值仍在。'],[9,10,11],'online media can strengthen radio。'),
  T('地區遇上暴雨，居民想聽熟悉主持人簡短說明最新安排。','文章認為甚麼價值難取代？',['本地化、即時清楚的聲音可建立信任','只要主持人熟悉，所有消息都不用核實','惡劣天氣一出現，網媒便不可能再運作','居民只關心主持人的人氣，不會在意資訊'],['本地人聲與即時感是重點。','仍需準確。','沒有完全否定網媒。','資訊仍重要。'],[12,13,14],'familiar presenter；immediacy and trust。'),
  T('某舊服務改在手機上提供原有內容，有人卻說它已經消失。','哪項區分最恰當？',['外在形式改變，不等於原來的核心功能消失','只要離開舊設備，任何內容就必然消失','使用手機會使服務永遠失去所有本地性','只要形式有變，便不再需要看服務用途'],['form may evolve, core purpose survive。','混淆硬件與內容。','並非必然。','用途是重點。'],[10,11,17],'form evolves；core purpose survives。'),
  T('有人稱網媒功能強大，所以廣播在任何情況都沒有用。','本文會如何作有限讓步？',['承認網媒強大，再指出有時看屏幕不便','否定網媒能提供任何新聞或娛樂內容','只要網媒強大，就應立即停止所有音訊','網媒與音訊完全相同，沒有情境差異'],['powerful, but screens create burden。','原文承認。','推論過度。','功能不同。'],[3,4,5,6],'Online media is powerful, but...screens。'),
  T('一個平台提供全球消息，居民仍偏好本地主持人解釋本區情況。','哪項理由最貼合文章？',['熟悉的人能用淺白語言解釋與本區直接相關的事','全球平台一旦存在，本地聲音便不可能有價值','本地主持人只報全世界新聞，不談本地情況','居民信任主持人，便證明所有網上資訊錯誤'],['地區關聯與信任是具體優勢。','與文章相反。','情境不符。','無全面否定。'],[12,13,14],'speaks directly to their area in plain language。'),
  T('商店由實體櫃台增加網上預訂，但仍保留現場取貨。','文章第二段的轉型邏輯如何套用？',['新渠道可擴大服務，舊功能仍能繼續提供','有網上預訂，就必須立即取消全部取貨','實體取貨存在，便無須讓顧客網上預訂','兩種渠道並存時，商品就必然無人購買'],['渠道增加不等於核心服務消失。','不必二選一。','仍可適應。','沒有此因果。'],[9,10,11,17],'new channel strengthens old service。'),
  T('學生認為「現在有影片，音訊教材便全是過時物」。','哪項較符合「不只是舊設備」？',['要看甚麼情況聽比看合適，不能只按年代判斷','只要影片較新，音訊就必定沒有任何用途','音訊若歷史較久，就不可能在手機播放','一種教材舊，便不可能讓人學到任何知識'],['重點是使用場景及可用渠道。','按年代錯判。','可數碼化。','用途仍存在。'],[5,7,8,10,11],'not merely old device；screen burden。'),
  T('有人說電台若靠手機傳播，就已不再是電台。','文章會如何回應？',['節目可換載體，聲音資訊與本地連結仍可延續','只有舊收音機播放，內容才可能被人聽見','用手機播放之後，主持人就不能再說話','任何服務一旦上網，其原有用途都會消失'],['媒介形式與核心功能分開。','來源並不限實體。','不合理。','原文相反。'],[9,10,11,12,13,17],'radio no longer confined to physical receiver。'),
  T('要用一句話概括本文對新舊媒介的判斷。','哪項最準確？',['網媒改變習慣，收音機仍實用且能轉型','網媒出現之後，所有廣播都只能停播','收音機仍有用，因此不能使用任何手機','收音機形式不變，否則核心用途必消失'],['承認變化、實用及適應。','與立場相反。','可借手機傳播。','形式可變。'],[0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],'convenient, adaptable, locally relevant。'),
];
const plausibleAlternatives=[
  [['紙本是否便宜，數碼渠道可待電子書普及後考慮','紙本若有固定讀者，便可不再改變接觸方式','電子書成長後，紙本只須保留原有銷售方式'],['價格只是因素之一，也要看用途與渠道。','既有讀者不代表無須接觸新讀者。','文章指出舊媒介可借數碼渠道延續。']],
  [['開車時看短影片較快，毋須另聽交通消息','廣播雖可聽路況，但影片總能提供較多細節','開車時聽消息方便，駕駛安全則主要看車速'],['查看畫面會分散駕駛注意力。','細節多不能抵消看屏幕的安全風險。','文章直接比較收聽與看屏幕的風險。']],
  [['音訊可伴隨家務，但內容較適合回家再學','聲音講解不看屏幕，便應比影片更有知識','學生做家務時可聽，但仍須同步看文字'],['例子強調在另一活動中也能接收內容。','文章談使用情境，沒有比較知識質素。','要求同步看文字便失去音訊的情境優勢。']],
  [['舊服務可借新渠道傳播，但須停止現場講座','新平台能增加受眾，因此原服務用途應改變','手機能播音頻，圖書館可逐步減少本地活動'],['數碼延伸不要求放棄原有服務。','渠道改變不等於核心功能必須轉換。','文章主張延續與轉型，非取代本地服務。']],
  [['本地消息有用，但主持人是否熟悉並不重要','熟悉主持人能建立信任，核實可交予聽眾','緊急安排需更新，因此只有全球平台能解說'],['熟悉聲音正是本地信任的一部分。','信任不能代替負責任的資訊核實。','本地主持人也能提供即時清楚說明。']],
  [['服務改用手機後，原有內容便較難接觸','核心功能可延續，但應把舊名稱一併取消','外在形式改變後，須重新發明服務的用途'],['手機渠道可能擴大而非阻斷接觸。','名稱不是判斷核心功能是否存在的標準。','原有用途可以透過新載體繼續提供。']],
  [['承認網媒強大，再指出音訊內容比較準確','承認音訊方便，但網媒已覆蓋駕車情境','承認網媒強大，並指出廣播可保留舊設備'],['文章的比較重點是使用時能否看屏幕。','駕車時看屏幕不便，不能由網媒能力抹去。','文章談音訊的情境用途，不只談設備。']],
  [['熟悉主持人較親切，全球消息便較不值得聽','本地主持人能解說本區，消息是否清楚則次要','居民偏好熟悉聲音，因此毋須查證本區安排'],['本文沒有貶低全球消息的價值。','淺白清楚是本地解說的核心優勢。','信任與核實可並存，不能互相取代。']],
  [['新渠道能擴大服務，但現場取貨可逐步關閉','保留現場取貨便足夠，網上預訂用途較小','兩種渠道並存，應先確定哪一種永久勝出'],['擴大渠道不要求舊功能消失。','文章強調新渠道可補充原有服務。','並存與轉型不需要預先排除另一渠道。']],
  [['影片較新，可優先採用，音訊只適合懷舊','音訊能在手機播放，但用途仍取決於設備年代','教材價值主要看製作年份，情境只作補充'],['文章要求依使用情境判斷，而非先按年代。','可在手機播放正說明音訊不受舊設備限制。','使用時能否看屏幕比年代更切題。']],
  [['節目可換載體，但本地聲音應由全球內容取代','手機可以播聲音，原有主持人便需改做影片','節目形式一變，聲音資訊亦須改為文字'],['本地連結可隨新載體延續。','手機是傳播渠道，未必改變主持人的角色。','聲音資訊可以繼續以音訊提供。']],
  [['網媒改變習慣，收音機宜保留舊設備為主','網媒帶來新渠道，廣播應轉為文字閱讀','收音機仍實用，因此可以減少本地解說'],['文章重視核心音訊用途，不限舊設備。','數碼轉型不等於放棄聲音媒介。','本地可信解說是其持續價值之一。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:72',meta:{topic:'網媒發展是否令收音機沒有未來',summary:'作者完全反對收音機沒有未來。首段指出音訊接收資訊時不必一直看屏幕，駕車、煮食等場景仍有用；繁忙交通中聽路況比看影片安全。次段指出電台可透過直播、訪問短音頻和手機發展，熟悉主持人亦能在社區事件與緊急時提供本地、淺白、可信的解說。形式可演變，核心用途可延續。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
