const simple=[
  'Learning languages has changed a lot lately, mainly because people can now talk, study, and practise with others in other countries.',
  'Some people say you cannot speak a language well unless you have lived or worked in a country where people use it.',
  'I strongly disagree: speaking well depends much more on regular practice with a clear aim than on where you live.',
  'The best reason is that people today can learn to speak well without going to live in another country.',
  'Living somewhere does not make you fluent by itself; using the language often, getting help with mistakes, and speaking confidently even when it is hard do.',
  'Someone who speaks the language daily, gets advice from teachers, and uses material made for skilled speakers can slowly learn to reply naturally instead of changing each word in their head.',
  'For example, a Hong Kong student who joins an English debate group, talks with skilled speakers online, reads English news, and watches interviews without subtitles hears natural speech, words, and pronunciation again and again.',
  'With time, this planned daily practice can make the language a tool for real life, not just a school subject.',
  'So a good place to learn at home can still help someone speak the language well.',
  'Second, living in another country does not make someone fluent by itself.',
  'Someone may live abroad for years but still have little contact with the language if they mainly meet people from their own country, use translation apps, or stay away from hard conversations.',
  'Then the language is all around them, but they do not really use it when they think each day.',
  'In comparison, someone who stays at home but speaks, writes, listens, and thinks about the language daily may improve much faster.',
  'People become fluent when they enter the language and use it; just hearing it around them is like background sound.',
  'In short, I strongly disagree that people must live or work in a country to speak its language well.',
  'What matters most is not where they live, but how often and how well they use the language.',
];
const vocabulary=[
  [['has changed greatly','has changed a lot','大幅改變'],['recent years','lately','近年'],['especially because','mainly because','尤其因為'],['communicate','talk','溝通'],['across borders','with others in other countries','跨國']],
  [['Some argue','Some people say','有人主張'],['true fluency','speak a language well','真正流利'],['impossible unless','cannot speak a language well unless','不可能除非'],['lived or worked in the country','lived or worked in a country','在當地居住或工作']],
  [['completely disagree','strongly disagree','完全不同意'],['fluency','speaking well','流利'],['purposeful practice','regular practice with a clear aim','有目的練習'],['physical location','where you live','身處地點']],
  [['strongest reason','best reason','最有力理由'],['modern learners','people today','現代學習者'],['real communicative ability','learn to speak well','真正溝通能力'],['without moving abroad','without going to live in another country','不移居海外']],
  [['not produced by scenery','Living somewhere does not make you fluent by itself','非環境直接造成'],['repeated use','using the language often','反覆使用'],['correction','getting help with mistakes','糾正'],['confidence under pressure','speaking confidently even when it is hard','壓力下信心']],
  [['A learner','Someone','學習者'],['receives feedback','gets advice','獲反饋'],['native-level materials','material made for skilled speakers','母語水平材料'],['gradually train the mind','slowly learn','逐步訓練大腦'],['respond naturally','reply naturally','自然回應'],['rather than translate word by word','instead of changing each word in their head','而非逐字翻譯']],
  [['debate club','debate group','辯論社'],['online lessons with native speakers','talks with skilled speakers online','與母語者網上學'],['constantly exposed','again and again','不斷接觸'],['natural rhythm','natural speech','自然語言節奏'],['vocabulary','words','詞彙']],
  [['Over time','With time','久而久之'],['deliberate routine','planned daily practice','有意識常規'],['turn the language from a school subject into a living tool','make the language a tool for real life, not just a school subject','由學科變生活工具']],
  [['Therefore','So','因此'],['well-designed learning environment at home','good place to learn at home','本地優質學習環境'],['genuine fluency','speak the language well','真正流利']],
  [['Another reason','Second','另一原因'],['living in a country','living in another country','居住某國'],['does not automatically create fluency','does not make someone fluent by itself','不自動造成流利']],
  [['spend years abroad','live abroad for years','海外多年'],['linguistically isolated','little contact with the language','語言孤立'],['socialise with people from their own background','meet people from their own country','與同背景者社交'],['rely on translation apps','use translation apps','依賴翻譯程式'],['avoid difficult conversations','stay away from hard conversations','避開難對話']],
  [['In that case','Then','在此情況'],['around them','all around them','在周圍'],['never truly enters their daily thinking','do not really use it when they think each day','未進入日常思維']],
  [['By contrast','In comparison','相比之下'],['never left home','stays at home','未離開本地'],['actively speaks, writes, listens, and reflects','speaks, writes, listens, and thinks about the language','主動說寫聽思'],['progress much faster','improve much faster','進步更快']],
  [['Fluency grows','People become fluent','流利增長'],['step into the language','enter the language','走進語言'],['use it actively','use it','主動使用'],['passive exposure alone','just hearing it around them','只被動接觸'],['background noise','background sound','背景噪音']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['necessary for language fluency','must live or work in a country to speak its language well','流利必要條件']],
  [['decisive factor','What matters most','決定性因素'],['not where learners are','not where they live','非所在地方'],['how consistently and meaningfully they use the language','how often and how well they use the language','多持續且有意義使用']],
];
const chunkOverrides={2:['I completely disagree,','because fluency depends far more on purposeful practice than on physical location.'],8:['Therefore, a well-designed learning environment at home','can still lead to genuine fluency.'],14:['In conclusion, I completely disagree','that living or working in a country is necessary for language fluency.']};
const simpleChunkOverrides={2:['I strongly disagree:','speaking well depends much more on regular practice with a clear aim than on where you live.'],8:['So a good place to learn at home','can still help someone speak the language well.'],14:['In short, I strongly disagree','that people must live or work in a country to speak its language well.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Music education has changed greatly in recent years, especially because pupils can now practise, perform, and receive advice across borders.','especially because 交代背景變化的具體原因。','科技增加跨地練習機會，還未證明身處海外是否必要。',[1,2,3],F('[學習活動] has changed greatly in recent years, especially because [學習者] can now [跨地行動]','先交代現今遠距學習條件。','題目假設某地點不可少，而技術已令跨地學習可行時。',[['Language learning','slot','學習活動'],[' has changed greatly in recent years, especially because ','link','近年改變，因為'],['learners','slot','學習者'],[' can now ','link','現在能'],['communicate, study, and practise across borders.','slot','跨地行動']])),
  S('Some argue that real scientific work is impossible unless a person has worked in the biggest city where that subject is studied.','unless 表達他人主張的必要條件，不等於作者同意。','下一句作者完全反對把居住地當必要條件。',[0,2,9],F('Some argue that [目標能力] is impossible unless [人] has [指定地點經歷]','準確交代待反駁的必要條件主張。','題目聲稱若沒有某經歷便永遠達不到目標時。',[['Some argue that ','link','有人主張'],['true fluency','slot','目標能力'],[' is impossible unless ','link','不可能，除非'],['a person','slot','人'],[' has ','link','曾'],['lived or worked in the country where that language is spoken.','slot','指定地點經歷']])),
  S('I completely disagree, because good writing depends far more on careful revision than on the building where a pupil sits.','far more on...than on... 對比真正關鍵與誤認關鍵。','不是否認海外生活可有幫助，而是否認其必要性。',[1,3,4],F('I completely disagree, because [成果] depends far more on [可控練習] than on [外在地點]','直接反對地點決定論，指出更重要的訓練。','要區分一個可能有幫助的條件與真正必要的核心因素時。',[['I completely disagree, because ','link','完全不同意，因'],['fluency','slot','成果'],[' depends far more on ','link','更取決於'],['purposeful practice','slot','可控練習'],[' than on ','link','而非'],['physical location.','slot','外在地點']])),
  S('The strongest reason is that local artists can build real professional ability without moving abroad.','without 明確反駁「必須移居」的主張。','這是可能性論證；後文會解釋如何做。',[1,2,5],F('The strongest reason is that [學習者] can build real [能力] without moving abroad','首段提出不依賴地點仍可達成的主張。','要反駁「必須去某地」時，先說明本地也能培養目標能力。',[['The strongest reason is that ','link','最強理由'],['modern learners','slot','學習者'],[' can build real ','link','可建立真正'],['communicative ability','slot','能力'],[' without moving abroad.','link','毋須移居']])),
  S('Strong writing is not produced by scenery; it is produced by repeated use, correction, and confidence under pressure.','not...; it is... 以兩個來源對照，說明真正機制。','不是說居住地全無影響，而是它本身不會產生流利。',[2,3,5],F('[成果] is not produced by scenery; it is produced by [多項訓練]','把地點外觀與可練出的能力分開。','有人把置身某環境當成能力自動產生的原因時。',[['Fluency','slot','成果'],[' is not produced by scenery; it is produced by ','link','並非景色產生而是'],['repeated use, correction, and confidence under pressure.','slot','多項訓練']])),
  S('A learner who solves problems every day, receives feedback from teachers, and engages with difficult materials can gradually train the mind to respond naturally rather than translate word by word.','多項持續活動連到逐漸自然回應，取代逐字翻譯。','沒有聲稱一次練習即會流利；gradually 表示過程。',[3,4,6],F('A learner who [日常練習] can gradually train the mind to respond naturally rather than translate word by word','把有目的的練習拆成可做的活動及結果。','已指出練習比地點重要，需要展示實際練習組合時。',[['A learner who ','link','一位學習者'],['speaks the language every day, receives feedback from teachers, and engages with native-level materials','slot','日常練習'],[' can gradually train the mind to respond naturally rather than translate word by word.','link','逐漸自然回應']])),
  S('For example, a student in Singapore who joins an English debate club, takes online lessons with native speakers, reads English news, and watches interviews without subtitles is constantly exposed to natural rhythm, vocabulary, and pronunciation.','香港學生的四種活動證明本地也能持續接觸自然語言。','重點不是地名，而是多種主動接觸組成的日常常規。',[4,5,7],F('For example, a student in [本地] who [四項練習] is constantly exposed to natural rhythm, vocabulary, and pronunciation','以可操作的本地學習日程驗證上一句。','主張不出國仍可練習時，要給出具體且可模仿的日常活動。',[['For example, a student in ','link','例如本地學生'],['Hong Kong','slot','本地'],[' who ','link','若'],['joins an English debate club, takes online lessons with native speakers, reads English news, and watches interviews without subtitles','slot','四項練習'],[' is constantly exposed to natural rhythm, vocabulary, and pronunciation.','link','持續接觸自然語言']])),
  S('Over time, this kind of deliberate routine can turn reading from a school subject into a living tool.','Over time 強調持續；from...into... 指學科變生活工具。','不是一次網課就做到；有意識的常規是關鍵。',[5,6,8],F('Over time, this kind of deliberate routine can turn [技能] from a school subject into a living tool','把重複練習連到使用性質的長期轉變。','一連串具體練習後，要說明長期累積會帶來甚麼轉化時。',[['Over time, this kind of deliberate routine can turn ','link','久而久之可轉化'],['the language','slot','技能'],[' from a school subject into a living tool.','link','由學科變生活工具']])),
  S('Therefore, a well-designed learning environment at home can still lead to genuine musical skill.','Therefore 收束本地練習也能達目標。','並未說海外絕不有用，只否認其必要性。',[3,6,7],F('Therefore, a well-designed learning environment at home can still lead to genuine [能力]','由具體日程推到不出國的可能性。','前面已證明本地有有效練習途徑，需回扣「海外是否必要」時。',[['Therefore, a well-designed learning environment at home can still lead to genuine ','link','因此本地仍可帶來真正'],['fluency.','slot','能力']])),
  S('Another reason is that living in a city does not automatically create professional skill.','does not automatically 指身處環境並不保證能力。','第二段反向檢驗海外生活是否充分條件。',[4,8,10],F('Another reason is that living in [地方] does not automatically create [能力]','由「本地可行」轉到「海外不保證」。','已證明某經歷不是必要條件，再檢查它是否足以保證成果時。',[['Another reason is that living in ','link','另一理由：身在'],['a country','slot','地方'],[' does not automatically create ','link','不會自動產生'],['fluency.','slot','能力']])),
  S('A person may spend years at a gym but remain physically inactive if they mainly watch others, avoid hard exercises, or leave before training starts.','may...but...if... 說明人在環境中仍可避開關鍵活動。','不是說所有海外居住者都孤立，而是條件性風險。',[4,9,11],F('A person may spend years [相關環境] but remain [缺少能力] if they [三種避開活動的方式]','用環境與實際行為的落差說明不保證。','要反駁「只要人在那裏就自然學會」時，列出可能不參與的情況。',[['A person may spend years ','link','人在某地多年'],['abroad','slot','相關環境'],[' but remain ','link','但仍'],['linguistically isolated','slot','缺少能力'],[' if they ','link','如果'],['mainly socialise with people from their own background, rely on translation apps, or avoid difficult conversations.','slot','避開活動方式']])),
  S('In that case, the skill is around them, but it never truly enters their daily thinking.','around them...but...enters thinking 對照環境存在與內化不足。','不是說沒見過語言，而是沒有主動用於思考。',[9,10,12],F('In that case, [學習內容] is around them, but it never truly enters their daily thinking','指出只靠環境曝露並不等於內化。','已列出人在某環境卻不參與的情況，要概括其學習結果時。',[['In that case, ','link','那樣的話'],['the language','slot','學習內容'],[' is around them, but it never truly enters their daily thinking.','link','在身邊卻未內化']])),
  S('By contrast, someone who has never left home but actively practises, asks, tests, and reflects every day may progress much faster.','By contrast 反向對照不出國卻主動練習者。','may 保留可能性，並無保證每位本地學習者都快。',[10,11,13],F('By contrast, someone who has never left home but actively [多項行動] every day may progress much faster','以行為而非地點作真正比較標準。','有了被動海外例子後，要提出主動本地的反例時。',[['By contrast, someone who has never left home but actively ','link','相反，本地卻主動'],['speaks, writes, listens, and reflects','slot','多項行動'],[' every day may progress much faster.','link','每天或更快進步']])),
  S('Reading ability grows when pupils step into the text and use it actively; passive exposure alone is only background noise.','when 指進步條件；分號後否定被動接觸足夠。','不是說聽到語言完全無用，而是 alone 不夠。',[10,11,12],F('[能力] grows when [學習者] step into [內容] and use it actively; passive exposure alone is only background noise','把兩段理由濃縮成主動使用原則。','已比較兩種地點與行為後，要明確指出甚麼才令能力增長時。',[['Fluency','slot','能力'],[' grows when ','link','增長當'],['learners','slot','學習者'],[' step into ','link','走進'],['the language','slot','內容'],[' and use it actively; passive exposure alone is only background noise.','link','主動用而非只聽到']])),
  S('In conclusion, I completely disagree that living or working in a capital city is necessary for success in design.','結論重申反對把某地生活當必要條件。','作者沒有改成只對部分情況反對。',[1,2,15],F('In conclusion, I completely disagree that living or working in [地方] is necessary for [目標]','直接回答題目必要性。','全文已證明不去某地也可達標且去也不保證時。',[['In conclusion, I completely disagree that living or working in ','link','總結不同意在'],['a country','slot','地方'],[' is necessary for ','link','是必要於'],['language fluency.','slot','目標']])),
  S('The decisive factor is not where pupils are, but how consistently and meaningfully they practise.','not where...but how... 把結論回到地點與練習品質之別。','不是否認環境可能幫助，而是指出決定性因素。',[2,13,14],F('The decisive factor is not where [人] are, but how consistently and meaningfully they [主動行動]','用一句對照概括全文。','要收束「外在條件」和「可控行為」何者較關鍵時。',[['The decisive factor is not where ','link','決定性因素不是在哪'],['learners','slot','人'],[' are, but how consistently and meaningfully they ','link','而是多持續及有意義'],['use the language.','slot','主動行動']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為要流利說外語，必須在該國居住或工作嗎？',['不必；有目的的持續練習比所在地點更關鍵','必須；只要到當地就會自動流利','沒有立場；只列海外生活費','必須；本地完全不能接觸自然語言'],'作者完全反對把地點當必要條件；兩段分別證明本地可行與海外不保證。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['本地可透過每日說話、教師回饋及自然材料練出交流能力','海外居住者若只與同背景者往來，也可能不參與語言','只要到了海外，不練習也會立即變得流利','無論身在何處，任何語言學習都不可能有成效'],correct:[0,1],why:'第一段推翻必要性；第二段推翻到當地便自動成功的假設。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 反對地點必要論','跨境學習已普及；作者認為有目的練習較地點重要。'],
  ['主體一 · 本地也能練成','每日使用、回饋、自然材料與香港學生具體練習。'],
  ['主體二 · 海外不保證','身在海外仍可語言孤立；主動本地學習者或進步更快。'],
  ['結論 · 行為是關鍵','真正決定流利的是多持續、有意義地使用語言。'],
],'跨境條件 → 本地可行 → 海外不保證 → 練習品質勝於地點。')];
const evidence=[
  Q('作者認為流利最依賴甚麼？',['有目的的練習，而非身處哪裏','當地建築的外觀','只在國外購買課本','護照上的國籍'],'purposeful practice rather than physical location。'),
  Q('重複使用以外，首段還列出哪兩種訓練？',['獲得糾正及在壓力下建立信心','只背地名及時差','只看風景及買紀念品','完全避免難的對話'],'repeated use, correction, and confidence under pressure。'),
  Q('香港學生例子包括哪四種活動？',['辯論社、網課、英文新聞與無字幕訪談','只看中文電影和廣告','搬到外國後完全不交流','每天只背一個地名'],'原文列四項可在香港進行的自然語言接觸。'),
  Q('哪三種做法可能令海外人士仍然語言孤立？',['只與同背景者社交、依賴翻譯、避開難對話','每天練習、請教老師、聆聽新聞','主動說話、寫作、聆聽和反思','參與辯論、看無字幕訪談和閱讀'],'作者指出身在環境中仍可避開關鍵練習。'),
  Q('被動接觸被比作甚麼？',['背景噪音','準確字典','學習日程','有效回饋'],'passive exposure alone is only background noise。'),
];
const logic=[
  sequence('主體一：本地如何練出流利？',[
    ['核心判準','流利來自反覆使用、糾正及壓力下信心。'],
    ['可做活動','每日說、獲回饋、接觸自然材料。'],
    ['香港例子','辯論、網課、新聞、無字幕訪談。'],
    ['累積效果','語言由學校科目變成生活工具。'],
    ['段落結論','本地精心設計的環境仍可達到流利。'],
  ],'能力機制 → 可操作日程 → 長期累積 → 本地可行。'),
  sequence('主體二：為何去海外仍不足？',[
    ['另一理由','在當地生活不會自動流利。'],
    ['孤立情況','只與同背景者往來、依賴程式、避開難談話。'],
    ['內化不足','語言在身邊，卻未進入日常思考。'],
    ['反向比較','本地每天主動說寫聽思的人或進步更快。'],
    ['總原則','主動使用帶來進步；被動接觸只是背景。'],
  ],'海外不保證 → 被動者的行為 → 本地主動者對照 → 真正因素。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('學生想學畫畫，卻認為不住在藝術區便永遠學不會。','本文的核心反駁方式是甚麼？',['先比較持續練習與回饋，不能只看住在哪裏','只要搬進藝術區，不畫畫也會自然變熟練','藝術區一旦存在，其他地方便不能接觸作品','畫畫與練習無關，只取決於房屋門牌號碼'],['可控訓練可能比地點重要。','地點不保證。','其他地方仍可學。','忽略能力機制。'],[2,3,4,5],'purposeful practice rather than physical location。'),
  T('有人在外國住了多年，但只與舊朋友說母語。','哪項判斷符合第二段？',['身在海外仍可能缺乏目標語的主動使用','只要住得夠久，就必然自動掌握當地語言','只與舊朋友交談能保證母語以外語言流利','海外生活與任何語言機會都必然完全無關'],['環境存在，參與仍可能不足。','否定自動保證。','無此因果。','海外仍可能有幫助。'],[9,10,11],'living abroad does not automatically create fluency。'),
  T('本地學生每天跟老師練英語，得到糾正，亦閱讀自然材料。','作者會如何評估這條路徑？',['不用移居海外，仍可逐步練出自然回應能力','因學生住在本地，每天練習便完全沒有效用','只要讀自然材料，一天就能保證完全流利','老師提供糾正，表示學生永遠不會有信心'],['反覆用與回饋是能力機制。','地點不是必要條件。','gradually 非即日保證。','糾正可幫助。'],[3,4,5,6,7,8],'speaks every day, receives feedback, engages with materials。'),
  T('學校讓學生參加網上辯論、閱讀新聞和看無字幕訪談。','這些活動在論證中起甚麼作用？',['具體說明本地亦可持續接觸自然語言','證明學生一定已經在海外工作多年','證明只要有新聞，教師回饋就完全不需要','只列器材品牌，沒有顯示任何學習行動'],['是香港學生例子的可模仿日程。','仍可本地進行。','多種活動互補。','有具體行動。'],[5,6,7],'Hong Kong example: debate, news, interviews。'),
  T('職員在會議中避開所有困難發言，雖每天聽見英語。','哪種區分最貼近文章？',['聽見語言不等於主動運用與內化語言','每天聽見英語就已保證能主持任何會議','只要在辦公室，學習是否參與便不再重要','避免發言能比練習更快建立即時反應'],['passive exposure alone 不夠。','無保證。','行為才重要。','與核心相反。'],[10,11,13],'passive exposure alone is only background noise。'),
  T('孩子學游泳，家旁有泳池，卻一直只站着看別人游。','怎樣遷移「景色不造能力」？',['靠近場地不等於練習，仍需下水並接受回饋','只要泳池夠漂亮，孩子便會自動學會游泳','觀看別人游水比親自練習必然更快掌握','泳池在家旁，便證明所有教練都沒有作用'],['環境不是能力本身。','把場地當保證。','被動觀看不足。','教練回饋仍有用。'],[4,9,10,13],'not produced by scenery；repeated use and correction。'),
  T('學生在家練語言時每天說、寫、聽，並回顧錯誤。','本文會重視哪個特點？',['多項主動練習能累積，地點不決定成效','本地練習一律無效，必須先買機票','只要反思一天，就保證從此永遠不出錯','主動練習越多，便必然不用再聆聽別人'],['與本地主動學習者對照吻合。','與立場相反。','沒有完美保證。','聆聽是練習之一。'],[3,5,12,13],'actively speaks, writes, listens, and reflects。'),
  T('公司安排海外實習，但員工每天只用翻譯軟件處理對話。','哪個風險最貼近本文？',['身在當地仍可能繞過真實交流與語言練習','海外實習一開始，員工就必然不用任何翻譯','使用程式之後，身邊便完全不存在任何語言','只要身在海外，程式使用便保證即時流利'],['依賴程式可形成語言孤立。','過度保證。','語言仍在環境中。','地點不保證。'],[9,10,11],'rely on translation apps；linguistically isolated。'),
  T('一名學生從不出國，卻能直接與外國朋友談複雜話題。','這個反例推翻哪種主張？',['在當地生活或工作是流利的必要條件','主動說話能幫助語言練習與進步','練習質素會影響流利程度的發展','跨境交流提供本地學習者使用機會'],['一個本地流利者足以反駁「必須去當地」。','這反而支持文章。','這反而支持文章。','這也是文章背景。'],[0,1,2,3,12,14],'fluency possible without moving abroad。'),
  T('一位老師把語言由只需考試的科目，變成學生每天要用的工具。','哪項長期效果最貼近原文？',['持續而有意識的常規可促成真正使用','只要考試取消，學生就會自動能說外語','語言一進課表，就不可能成為生活工具','每日使用完全無關，關鍵只有教室位置'],['deliberate routine from school subject into living tool。','沒有自動保證。','與轉化相反。','核心是使用。'],[5,6,7],'school subject into a living tool。'),
  T('有人說「到外國一定流利」，另一人說「在本地永遠不可能流利」。','本文如何同時回應？',['本地可經練習達標，海外若被動亦未必達標','兩句都對，地點足以決定所有學習成果','兩句都錯，因所有地方都永遠不能流利','只需比較兩地天氣，毋須看實際使用'],['兩段主體分別反駁必要性與自動性。','忽略行為。','與例子相反。','天氣不是機制。'],[3,4,5,6,8,9,10,11,12,13],'at home can lead to fluency；abroad does not automatically。'),
  T('要概括全文的決定性因素。','哪項最準確？',['不在於住哪裏，而在於持續且有意義地使用','只在於國家的名字與學生持有哪種護照','只要住在海外，主動練習便會變得多餘','無論多認真練習，只有風景會產生流利'],['not where, but how consistently and meaningfully。','與原文相反。','地點不保證。','練習是核心。'],[2,4,5,8,9,12,13,14,15],'decisive factor is not where, but how they use it。'),
];
const plausibleAlternatives=[
  [['先比較居住地的資源，再決定要不要練習','先判斷學生能否出國，再安排老師給予回饋','先分析藝術區的活動，再考慮個人練習'],['把地點放在能力形成之前，忽略練習與回饋。','海外機會可有幫助，但不是練習的先決條件。','地區資源只是條件之一，不能代替練習。']],
  [['住得夠久便通常能掌握語言，練習只作補充','只與舊朋友交談，也能直接練習當地語言','海外生活提供機會，因此參與程度影響不大'],['把居住時間當成主要機制，略過主動使用。','母語圈交談未必提供目標語練習。','文章區分環境中的機會與實際參與。']],
  [['本地練習可打好基礎，流利仍須移居海外','閱讀自然材料最重要，說話和糾正只是補充','教師糾正有用，日常接觸則可留待出國後'],['承認本地練習，卻仍把海外當必要條件。','文章重視多種反覆使用及回饋，不只閱讀。','把本地可行的接觸與練習延後了。']],
  [['具體說明本地接觸語言，但仍要移居才有效','主要說明新聞材料比教師回饋更能促進學習','具體說明本地活動，卻沒有涉及主動運用'],['例子正用來反駁移居的必要性。','文章沒有把新聞凌駕於回饋之上。','辯論及訪談練習包含主動參與。']],
  [['每天聽見英語已有進步，發言只是次要步驟','辦公室提供語言環境，糾正便不再重要','避免困難發言可維持信心，再逐步建立流利'],['被動接觸與主動運用不能混為一談。','環境不能取代有意識的使用與回饋。','回避正使實際使用機會減少。']],
  [['靠近場地會增加機會，觀看便足以掌握動作','靠近泳池有幫助，因此回饋可待學會後再給','先熟悉場地比下水練習更能形成游泳能力'],['機會有用，但觀看不能取代實踐。','回饋是訓練的一部分，不是完成後才需要。','把場地熟悉程度誤當成能力機制。']],
  [['本地練習能累積，但流利仍取決於海外經驗','主動練習有用，聆聽自然材料則沒有必要','每天回顧錯誤便足夠，說寫練習可減少'],['仍把海外經驗當作決定性條件。','原文同時重視多種接觸與主動使用。','反思須配合實際說寫和聆聽。']],
  [['海外實習有用，翻譯軟件可代替真實交流','使用程式可減少練習，但居住時間仍可補回','海外工作者接觸語言，因此參與程度影響較小'],['輔助工具不能完全代替目標語互動。','時間本身不能彌補長期迴避使用。','環境接觸未必轉化為主動運用。']],
  [['海外生活通常有利流利，因此仍是最穩妥條件','語言流利主要來自練習，但出國可增加機會','本地交流有幫助，海外生活仍可能帶來優勢'],['有利與必要不同；反例直接否定必要性。','這是文章的補充判斷，不是被推翻的主張。','這也未主張海外是必要條件。']],
  [['考試減少後，學生便較容易自然使用語言','語言列入課表後，學生自然會持續主動練習','教師提供工具後，學生可減少每日使用'],['減少考試本身不足以形成使用常規。','課表存在與真正使用仍是兩回事。','原文的長期轉化依賴日常運用。']],
  [['海外較容易達標，本地則主要建立練習基礎','本地可以達標，海外則通常無須練習維持','兩地都提供機會，居住時間仍是主要因素'],['把海外列成較有決定性的途徑。','海外的被動居住者仍可無法流利。','文章把有意義的使用放在居住時間之前。']],
  [['關鍵先看所在地，再看學生有沒有持續使用','主要看是否身在海外，回饋只能加快過程','主要看接觸語言的時數，主動使用較次要'],['把地點置於文章強調的使用方式之前。','仍把海外生活誤當核心條件。','單純接觸時間不能等同有意義的使用。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:69',meta:{topic:'語言流利是否必須到使用該語言的國家生活或工作',summary:'作者完全反對海外生活是語言流利的必要條件。現今在本地也能每日說、得到糾正、接觸自然材料；香港學生可透過辯論、網課、新聞及無字幕訪談建立有意識的日程。反過來，海外居住者若依賴翻譯、只與同背景者往來，仍可語言孤立。決定性因素是持續而有意義地使用語言，而非所在地。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
