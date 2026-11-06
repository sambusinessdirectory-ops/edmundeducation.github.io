const simple=[
  'Culture is more than food, celebrations, and old-style clothes; it also includes ways of thinking kept in a language.',
  'I fully agree that people cannot really understand a country’s culture if they do not speak its language: language holds shared beliefs and helps people talk properly with local residents.',
  'First, language has meanings that people from outside often cannot see.',
  'Words do more than name things: they show respect, jokes, who has power, feelings, and what people expect from each other.',
  'If a visitor uses only translation, they can easily lose these deeper ideas.',
  'For example, people in many Asian cultures often say things less directly to show respect or save someone from feeling embarrassed.',
  'A visitor may understand the exact words, but if they do not know the language, they may not see why people speak softly, indirectly, or choose to say nothing.',
  'So language is like a map of a culture: without it, people may see the place but not know what its signs mean.',
  'Second, people understand a culture deeply by speaking with others, not just watching them.',
  'Someone can watch local events, try local food, and visit famous places, but these experiences stay quite shallow if they cannot talk to local people in their language.',
  'Speaking the language lets people ask, understand funny comments, join everyday talks, and see how people act each day.',
  'For example, a person living in Mexico who speaks Spanish is much more likely to understand family beliefs, jokes, and friendly behaviour than a person who only watches from far away.',
  'Knowing a language lets people understand things that a tourist visit alone cannot show.',
  'In short, I fully agree that people need a language to understand its culture.',
  'Without the language, people may form ideas about a country, but those ideas will not be complete.',
  'To understand a culture well, people must understand the language that gives it life.',
];
const vocabulary=[
  [['not simply','more than','不只是'],['festivals','celebrations','節慶'],['traditional clothing','old-style clothes','傳統服飾'],['a way of thinking','ways of thinking','思維方式'],['stored in language','kept in a language','儲存在語言中']],
  [['completely agree','fully agree','完全同意'],['truly understand','really understand','真正理解'],['unless they speak its language','if they do not speak its language','除非會說該語'],['carries shared values','holds shared beliefs','承載共同價值'],['meaningful contact with local people','talk properly with local residents','與本地人有意義接觸']],
  [['The first reason','First','第一原因'],['contains meanings','has meanings','包含意義'],['invisible to outsiders','people from outside often cannot see','外來者看不到']],
  [['do not only describe objects','do more than name things','不只描寫物件'],['politeness','respect','禮貌'],['humour','jokes','幽默'],['hierarchy','who has power','階級'],['emotion','feelings','情感'],['social expectations','what people expect from each other','社會期望']],
  [['relies only on translation','uses only translation','只依賴翻譯'],['deeper meanings','deeper ideas','深層意義'],['disappear','lose','消失']],
  [['in many Asian cultures','in many Asian cultures','許多亞洲文化'],['indirect expressions','say things less directly','間接表達'],['show respect','show respect','表示尊重'],['avoid embarrassment','save someone from feeling embarrassed','避免尷尬']],
  [['foreigner','visitor','外國人'],['literal meaning','exact words','字面意思'],['without knowing the language','if they do not know the language','不懂語言'],['may miss why','may not see why','或看不到為何'],['left unsaid','choose to say nothing','選擇不說']],
  [['In this sense','So','從這意義上'],['cultural map','map of a culture','文化地圖'],['see the landscape','see the place','看見風景'],['cannot read the signs','not know what its signs mean','讀不懂標誌']],
  [['Another reason','Second','另一原因'],['real cultural understanding','understand a culture deeply','真正文化理解'],['comes from interaction','by speaking with others','來自互動'],['passive observation','just watching them','被動觀察']],
  [['local ceremonies','local events','本地儀式'],['eat local food','try local food','吃本地食物'],['famous buildings','famous places','著名建築'],['remain fairly shallow','stay quite shallow','仍較表面'],['communicate with residents','talk to local people','與居民交流']],
  [['allows people to ask questions','lets people ask','讓人提問'],['understand jokes','understand funny comments','理解笑話'],['ordinary conversations','everyday talks','日常對話'],['notice how people behave in daily life','see how people act each day','留意日常行為']],
  [['For instance','For example','例如'],['far more likely','much more likely','更有可能'],['family values','family beliefs','家庭價值'],['social warmth','friendly behaviour','社交溫暖'],['observes these things from a distance','watches from far away','遠距觀察']],
  [['Language opens doors','Knowing a language lets people understand things','語言打開門'],['sightseeing alone','a tourist visit alone','單靠觀光'],['cannot open','cannot show','不能打開']],
  [['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['essential for understanding culture','need a language to understand its culture','理解文化所需']],
  [['Without it','Without the language','沒有語言'],['gain impressions','form ideas','形成印象'],['impressions remain incomplete','ideas will not be complete','印象不完整']],
  [['understand a culture deeply','understand a culture well','深入理解文化'],['one must understand','people must understand','必須理解'],['through which that culture breathes','that gives it life','文化賴以呼吸']],
];
const chunkOverrides={12:['Language opens doors','that sightseeing alone cannot open.'],13:['In conclusion, I fully agree','that language is essential for understanding culture.']};
const simpleChunkOverrides={12:['Knowing a language lets people understand things','that a tourist visit alone cannot show.'],13:['In short, I fully agree','that people need a language to understand its culture.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Education is not simply a collection of facts, exams, and certificates; it is also a way of thinking that is stored in daily habits.','not simply...; it is also... 把表面元素與較深層的思想區分。','開首不是否定食物節日，而是說它們不足以代表整個文化。',[1,2,8],F('[事物] is not simply a collection of [可見元素]; it is also a way of thinking that is stored in [載體]','先把文化由可見物件擴到思維層次。','題目把抽象事物縮成外在象徵時，先補出較深層的部分。',[['Culture','slot','事物'],[' is not simply a collection of ','link','不只是一串'],['food, festivals, and traditional clothing','slot','可見元素'],['; it is also a way of thinking that is stored in ','link','還是儲存於'],['language.','slot','載體']])),
  S('I completely agree that a pupil cannot truly understand a poem unless they study its original wording, because the poem carries shared values and allows meaningful contact with its writer.','unless 設必要條件；because 後給內容與互動兩個理由。','這是作者的完全同意立場，不是模糊的部分同意。',[0,2,8],F('I completely agree that [人] cannot truly understand [事物] unless they [必要行動], because [載體] carries [內涵] and allows [接觸]','明示必要條件及兩段理由。','題目問某條件是否不可缺少時，要清楚表明並預告原因。',[['I completely agree that ','link','完全同意'],['a person','slot','人'],[' cannot truly understand ','link','不能真正理解'],['a country’s culture','slot','事物'],[' unless they ','link','除非'],['speak its language','slot','必要行動'],[', because ','link','因為'],['language','slot','載體'],[' carries ','link','承載'],['shared values','slot','內涵'],[' and allows ','link','並促成'],['meaningful contact with local people.','slot','接觸']])),
  S('The first reason is that local etiquette contains meanings which are often invisible to outsiders.','which are often invisible... 定位不懂內部語境者看不到的意義。','不是說外來者看不到行為，而是可能讀不出其含意。',[1,3,4],F('The first reason is that [文化載體] contains meanings which are often invisible to outsiders','提出第一段的隱藏意義問題。','要說明外人雖看得到表面形式，卻未必懂背後含意時。',[['The first reason is that ','link','第一理由'],['language','slot','文化載體'],[' contains meanings which are often invisible to outsiders.','link','承載隱藏意義']])),
  S('Stories do not only describe objects; they express politeness, humour, hierarchy, emotion, and social expectations.','do not only...; they... 用多項非字面功能擴展詞語用途。','不是說詞語不能描寫事物，而是還承載社會信息。',[2,4,6],F('[表達] do not only describe objects; they express [社會與情感內容]','具體列出字面之外的語用層次。','已提隱藏意義後，需要明確指出有哪些人際訊息時。',[['Words','slot','表達'],[' do not only describe objects; they express ','link','不只描述還表達'],['politeness, humour, hierarchy, emotion, and social expectations.','slot','社會與情感內容']])),
  S('If a visitor relies only on guidebooks, these deeper meanings can easily disappear.','If 條件指出單一媒介如何漏掉深層意思。','不是宣稱任何翻譯都錯，而是只依賴它時有風險。',[2,3,5],F('If [人] relies only on [單一媒介], these deeper meanings can easily disappear','由字面之外的內容推到只靠翻譯的風險。','有一種輔助工具，但使用者完全依賴它而忽略語境時。',[['If ','link','如果'],['a visitor','slot','人'],[' relies only on ','link','只靠'],['translation','slot','單一媒介'],[', these deeper meanings can easily disappear.','link','深層意思易流失']])),
  S('For example, in many workplaces, indirect expressions are often used to show respect or avoid embarrassment.','用間接表達的實例把禮貌與語境說具體。','不是說所有亞洲人必然都間接說話；in many 限定範圍。',[3,4,6],F('For example, in many [文化或場合], indirect expressions are often used to show respect or avoid embarrassment','用一種常見交際習慣證明字面以外有社會目的。','已指出隱藏意義，需要給出語氣為何會變委婉的例子時。',[['For example, in many ','link','例如在許多'],['Asian cultures','slot','文化或場合'],[', indirect expressions are often used to show respect or avoid embarrassment.','link','間接表達的社會作用']])),
  S('A new employee may understand the literal meaning of a sentence, but without knowing the workplace, they may miss why something is said gently, indirectly, or even left unsaid.','may understand...but...miss why... 對照字面懂與人際意圖不懂。','真正差別在語用理解，並非完全聽不懂字。',[3,4,5],F('A [人] may understand the literal meaning of a sentence, but without knowing [語境], they may miss why something is said gently, indirectly, or even left unsaid','將字面理解和場景中真正意思分開。','要說明即使逐字聽懂，仍可能不知道委婉或沉默的作用時。',[['A ','link','一名'],['foreigner','slot','人'],[' may understand the literal meaning of a sentence, but without knowing ','link','明白字面但不懂'],['the language','slot','語境'],[', they may miss why something is said gently, indirectly, or even left unsaid.','link','錯過語氣與未說之意']])),
  S('In this sense, a local rule is like a cultural map: without it, people may see the landscape, but they cannot read the signs.','地圖比喻把看得到風景與讀懂指示分開。','不是說旅客對文化毫無印象，只是理解不完整。',[4,6,8],F('In this sense, [解讀工具] is like a cultural map: without it, people may see the landscape, but they cannot read the signs','以比喻概括「看得到卻讀不懂」。','前文已講具體語境差異，要用形象句總結理解落差時。',[['In this sense, ','link','從此角度'],['language','slot','解讀工具'],[' is like a cultural map: without it, people may see the landscape, but they cannot read the signs.','link','有風景但讀不懂指示']])),
  S('Another reason is that real community understanding comes from interaction, not passive observation.','not passive observation 對照主動參與和遠距觀看。','次段不是重複翻譯風險，而是解釋互動的作用。',[3,7,9],F('Another reason is that real [深層理解] comes from interaction, not passive observation','提出第二個理由：參與比觀看更能理解。','前一段談內容，下一段要轉到如何透過互動真正理解時。',[['Another reason is that real ','link','另一理由：真正'],['cultural understanding','slot','深層理解'],[' comes from interaction, not passive observation.','link','來自互動而非旁觀']])),
  S('A person can watch lectures, read summaries, and visit a laboratory, but these experiences remain fairly shallow if they cannot communicate with researchers in their own language.','can...but...if... 承認旁觀經驗，指出缺少交流時的限制。','作者不是說觀光完全沒有學習作用，只說單靠它較表面。',[7,8,10],F('A person can [三項旁觀活動], but these experiences remain fairly shallow if they cannot communicate with [當事人] in their own language','讓步承認看見文化外觀，並指出無對話的深度限制。','有人把參觀等同深入理解時，先承認所見再指出不能交流的缺口。',[['A person can ','link','人可以'],['watch local ceremonies, eat local food, and visit famous buildings','slot','三項旁觀活動'],[', but these experiences remain fairly shallow if they cannot communicate with ','link','但若不能交流仍表面'],['residents','slot','當事人'],[' in their own language.','link','以對方語言']])),
  S('Speaking the local language allows people to ask questions, understand jokes, join ordinary conversations, and notice how people behave in daily life.','四項活動逐一展示說語言如何把旁觀變成互動。','不是只會發音幾個詞，而是能提問、談笑、日常交流。',[8,9,11],F('Speaking [對方語言] allows people to [四項參與行動]','把抽象的「互動」轉成可觀察的行動。','主張會說語言能加深理解時，需列出具體可做的交流行為。',[['Speaking ','link','說'],['the language','slot','對方語言'],[' allows people to ','link','使人能'],['ask questions, understand jokes, join ordinary conversations, and notice how people behave in daily life.','slot','四項參與行動']])),
  S('For instance, someone who speaks French while living in Quebec is far more likely to understand family values, humour, and social warmth than someone who only observes these things from a distance.','以懂語言者與遠距觀察者比較對家庭、幽默和溫暖的理解。','例子支持相對可能性，未聲稱所有旅客都絕不懂文化。',[9,10,12],F('For instance, someone who speaks [當地語] while living in [地方] is far more likely to understand [人際內涵] than someone who only observes these things from a distance','用同住一地的兩種參與程度作對照。','需要把「交流勝於旁觀」落在具體人物與地方時。',[['For instance, someone who speaks ','link','例如會說'],['Spanish','slot','當地語'],[' while living in ','link','住在'],['Mexico','slot','地方'],[' is far more likely to understand ','link','更可能理解'],['family values, humour, and social warmth','slot','人際內涵'],[' than someone who only observes these things from a distance.','link','相對遠觀者']])),
  S('Conversation opens doors that reading a brochure alone cannot open.','開門比喻濃縮互動帶來的深入機會。','不是否定觀光所有收穫，而是說它不能單獨做到同樣深度。',[8,10,11],F('[互動方式] opens doors that [單靠觀看] alone cannot open','以短句收束主動交流超過旁觀的理由。','已舉互動例子後，需要一句易記的段落總結時。',[['Language','slot','互動方式'],[' opens doors that ','link','打開一些門'],['sightseeing','slot','單靠觀看'],[' alone cannot open.','link','觀光不能單獨開啟']])),
  S('In conclusion, I fully agree that participation is essential for understanding community life.','結論直接重申必要條件，回答同意與否。','不是改為只同意少部分；fully agree 維持原立場。',[1,8,14],F('In conclusion, I fully agree that [必要條件] is essential for understanding [對象]','結論明確重申同意立場。','全文支持某條件對深層理解不可少時。',[['In conclusion, I fully agree that ','link','總結完全同意'],['language','slot','必要條件'],[' is essential for understanding ','link','對理解不可少'],['culture.','slot','對象']])),
  S('Without direct conversation, people may gain impressions of a community, but those impressions remain incomplete.','may gain...but...incomplete 承認初步印象但限定深度。','沒有聲稱不懂語言者對文化一無所知。',[7,9,13],F('Without [必要工具], people may gain impressions of [對象], but those impressions remain incomplete','以有限讓步避免把「不深入」寫成「毫無所知」。','結論承認旁觀者有一些認識，同時說明其不足時。',[['Without ','link','缺少'],['it','slot','必要工具'],[', people may gain impressions of ','link','或得到印象'],['a country','slot','對象'],[', but those impressions remain incomplete.','link','但不完整']])),
  S('To understand a community deeply, one must understand the stories through which that community breathes.','To... one must... 明示深入理解所需條件；breathes 為形象收束。','不是新的例證，而是把文化與其語言重新連起來。',[1,13,14],F('To understand [事物] deeply, one must understand [承載它的媒介] through which [事物] breathes','以形象句把必要條件和全文主題緊扣。','已充分提供理由後，最後一句要重申深層理解依靠甚麼媒介時。',[['To understand ','link','要理解'],['a culture','slot','事物'],[' deeply, one must understand ','link','必須理解'],['the language','slot','承載它的媒介'],[' through which ','link','透過'],['that culture','slot','事物'],[' breathes.','link','呼吸']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意「不會說當地語言，就不能真正理解其文化」？',['完全同意；語言承載隱藏意思，也讓人與居民真正交流','完全反對；觀光足以取得完整文化理解','沒有表態；只說學語言需要時間','部分反對；翻譯與直接對話效果完全相同'],'作者明言 completely agree；兩段理由分別是語用含意和主動互動。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['詞句帶有禮貌、幽默、階級與情緒，逐字翻譯或難傳達','會說當地語言使人能提問、談笑和參與日常對話','每種文化都只有食物與服裝，沒有其他內容','即使能與居民說話，也不可能獲得任何理解'],correct:[0,1],why:'首段談語言裏的隱藏意義；次段談與本地人互動。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 語言是文化載體','文化包含思維方式；作者完全同意說語言是深入理解的必要條件。'],
  ['主體一 · 字面之外','禮貌、幽默與委婉表達難靠字面翻譯讀懂。'],
  ['主體二 · 互動勝於旁觀','說語言能提問、談笑及參與；墨西哥例子與觀光對照。'],
  ['結論 · 印象仍不完整','不懂語言仍可有印象，但要深入須理解文化所用的語言。'],
],'文化不只外觀 → 隱藏語用 → 主動互動 → 深層理解的必要條件。')];
const evidence=[
  Q('作者說文化不只是哪些可見事物？',['食物、節慶和傳統服裝','手機、課本和電池','醫院、道路和租金','考試、證書和課表'],'開首用三個可見事物對照 language 裏的思維方式。'),
  Q('語言中的隱藏意思包括甚麼？',['禮貌、幽默、階級、情緒和社會期望','只包括字典的頁數與價格','只包括食物與建築的名稱','只有句子長短和標點數量'],'原文明列五項。'),
  Q('間接表達在例子中可能有甚麼作用？',['表示尊重或避免令人尷尬','保證聽者完全聽不懂','減少所有家庭關係','只為縮短說話時間'],'show respect or avoid embarrassment。'),
  Q('文化地圖比喻如何區分兩種理解？',['看見風景，不等於讀懂其中的指示','有了地圖便不需要任何語言','只要會觀光就必定識讀全部標誌','文化地圖只用來量度街道長度'],'see the landscape, but cannot read the signs。'),
  Q('墨西哥例子比較哪兩種人？',['會說西班牙語的居民與只遠觀的人','兩個都不會說任何語言的人','只吃本地食物與只住旅館的人','去過不同國家的兩名遊客'],'重點是說語言與旁觀帶來不同理解深度。'),
  Q('說當地語言讓人可參與哪些活動？',['提問、理解笑話、日常對話並留意日常行為','只看建築外牆而不與居民說話','只拍食物照片，避免任何提問','只讀菜單價格，永遠不參與互動'],'source lists four interactive actions。'),
];
const logic=[
  sequence('第一主體段：字面理解為何不夠？',[
    ['首因','語言有外來者未必看見的含意。'],
    ['內容','詞語傳達禮貌、幽默、階級與情緒。'],
    ['風險','只靠翻譯，較深意思容易流失。'],
    ['例子','間接說話可表示尊重或避免尷尬。'],
    ['對照','懂字面仍可能不懂委婉或沉默的原因。'],
    ['比喻','看得見文化風景，不等於讀得懂指示。'],
  ],'隱藏意義 → 翻譯界限 → 委婉表達 → 文化地圖。'),
  sequence('第二主體段：互動如何加深理解？',[
    ['另一理由','真正理解來自互動而非只旁觀。'],
    ['旁觀限制','儀式、美食與建築可看，但無法對話仍較表面。'],
    ['交流行動','能提問、聽笑話、參與日常對話。'],
    ['具體比較','墨西哥例子比較會說西語者與遠觀者。'],
    ['段落收束','語言能打開觀光單獨打不開的門。'],
  ],'旁觀有印象 → 對話帶來內部視角 → 具體例子 → 開門比喻。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('參觀者看見傳統婚禮，卻聽不懂長輩說話的語氣與玩笑。','本文會如何評估其理解？',['已有一些印象，卻仍可能錯過儀式的人際含意','只要看見婚禮，就必然明白全部文化背景','聽不懂語言，便完全無法看見任何儀式','拍到足夠照片，就會自動懂得所有笑話'],['承認所見，限定理解深度。','看見不等於懂。','並非毫無印象。','照片不傳語境。'],[0,3,6,9,14],'may gain impressions...but incomplete。'),
  T('學生逐字翻譯一首詩，但讀不出詩中的諷刺。','這個例子最接近哪項論證？',['字面詞義可傳達，語氣與隱藏意思仍可能流失','只要每個字都對，諷刺就必然清楚可見','任何翻譯都必定無法傳達詩中基本事件','學生讀不出諷刺，是因為詩完全沒有語言'],['字面與語用不同。','忽略深層意思。','過度否定翻譯。','與情境矛盾。'],[2,3,4,6],'literal meaning versus why said gently or indirectly。'),
  T('外國員工聽到同事委婉拒絕，誤以為對方已答應。','需要理解哪個語言層面？',['委婉語氣可能用來維持禮貌並避免尷尬','只要詞典翻出每個字，就不可能誤會','職場上所有間接說話都一定代表同意','同事說話的意思只由句子長短決定'],['尊重與面子可藏在表達方式中。','字面不足。','間接不等於同意。','忽略語境。'],[3,5,6],'indirect expressions show respect or avoid embarrassment。'),
  T('學生觀察科學實驗，也親自向研究員提問。','怎樣遷移「互動勝於旁觀」？',['觀看可形成印象，提問能揭示過程與選擇原因','只要看見器材，就已知道研究員所有想法','提問一旦開始，觀察便完全失去任何用處','要理解實驗，就必須永遠拒絕觀看示範'],['主動對話可補足被動觀看。','看見器材不足。','作者承認觀看收穫。','不是拒絕觀察。'],[8,9,10],'interaction, not passive observation。'),
  T('旅客會說當地語言，能和居民聊家庭日常。','本文為何認為這比單純觀光深入？',['可直接提問並理解笑話、價值觀與生活習慣','因會說語言，旅客必定立即懂得所有歷史','只要參觀著名建築，就無須再與人交流','和居民說話只會影響拍照時間，無助理解'],['互動使文化內涵具體可知。','不能保證全懂。','觀光仍有限。','與全文相反。'],[8,9,10,11,12],'ask questions...ordinary conversations。'),
  T('學校有多國文化日，學生只試食物與看服裝展示。','本文會建議補上甚麼？',['讓學生與參與者交談，了解背後想法與意思','只增加食物照片數量，不容許任何對話','把不同文化的服裝全部換成同一套制服','只評估展覽顏色，不問文化如何被理解'],['引言與次段都超出可見外觀。','仍停留表面。','破壞差異。','忽略內容。'],[0,8,9,10],'not simply food and clothing；interaction。'),
  T('有人會唱外語歌曲的發音，卻不懂歌詞中的階級與幽默。','哪項說法最嚴謹？',['能發音不等於懂社會含意，仍須理解語境','會唱旋律就保證能理解全部地方文化','懂幽默只需要看表演者的衣服顏色','歌曲的文字從來不表達任何社會關係'],['語言深層意義超過字面或發音。','過度保證。','外觀不足。','與論點相反。'],[2,3,4,6],'words express humour, hierarchy and expectations。'),
  T('一位訪客知道當地人說了甚麼，卻不知道為何他們選擇沉默。','此情境呼應哪個細節？',['真正理解也包括委婉、間接甚至未說出口的意思','如果一句話沒說出口，就必然沒有任何社會含意','只要聽懂字面意思，就能自動理解所有沉默','所有沉默都代表憤怒，無須看具體溝通場合'],['source explicitly says even left unsaid。','沉默可能有意義。','字面不足。','語境不同。'],[3,5,6],'why something...left unsaid。'),
  T('研究員觀察某社區多年，但一直不會與居民用當地語言交談。','作者會如何限制其結論？',['可有印象，但對居民想法或仍未完全理解','只要看得夠久，就必然不需要問任何居民','不會說語言，便完全無法知道社區在何處','研究員一旦會說語言，就會自動知道所有事情'],['有印象但未必深刻或完整。','互動仍重要。','過於絕對。','沒有全知保證。'],[8,9,10,14],'impressions remain incomplete。'),
  T('旅遊手冊列出所有景點，卻不能解釋當地笑話為何好笑。','語言打開門的比喻指甚麼？',['直接交流能接觸景點清單以外的生活與感受','手冊沒有景點資料，所以旅客無法找到任何地方','所有景點都應關門，才可能學會當地語言','懂笑話之後，參觀景點就完全沒有任何價值'],['sightseeing alone cannot open 那些門。','與情境相反。','非原文建議。','不否定觀光。'],[10,11,12],'Language opens doors sightseeing alone cannot open。'),
  T('有人說：「看過一國食物和節日，我已完全理解其文化。」','文章最直接的回應是甚麼？',['文化還有語言中的思維、人際規範與日常對話','食物與節日毫無文化價值，應完全忽略','只要在餐廳用餐，就已了解所有社會期望','文化只等於語法規則，不包括任何人際關係'],['可見象徵不是全部文化。','原文沒有否定。','過度推論。','也關乎互動。'],[0,2,3,8,9,10],'not simply food and festivals；way of thinking。'),
  T('要準確概括全文，而不誇稱不懂語言者一無所知。','哪項最符合原文？',['可有文化印象，深入理解仍須會說語言並與人交流','不會當地語的人完全看不到任何食物與建築','只要用翻譯看景點，就已取得完整文化理解','要懂文化只須背字詞，不需與當地居民互動'],['結論承認印象，但指其不完整。','過度絕對。','忽略語境。','次段重互動。'],[0,1,3,6,7,8,9,10,11,12,13,14,15],'impressions incomplete；language essential。'),
];
const plausibleAlternatives=[
  [['先整理婚禮流程，暫不問長輩話語的細微意思','只看服飾和儀式，就把人際玩笑列為次要','多拍儀式照片，便少問當事人如何理解笑話'],['流程有用，但不足以解釋語氣與關係。','可見部分不能代表全部文化含意。','照片不會自己補足語境。']],
  [['核對逐字詞義後，就把諷刺語氣視為附帶','詩中基本事件能譯出，便少查作者的態度','先看押韻是否保留，暫不討論隱含的反話'],['字面準確不等於語氣完整。','文章區分可傳達的事件與深層意思。','形式特點不能代替諷刺理解。']],
  [['先查詞典的拒絕詞條，不問說話是否委婉','只按句中肯定字眼，判斷同事已經答應','先比較句子長短，暫不查職場禮貌規範'],['委婉拒絕可能不靠明白的拒絕字眼。','字面肯定不等於真正同意。','情境和語氣比長短更重要。']],
  [['先詳細記下器材外觀，研究選擇另看說明牌','提問後便停止觀察，不再核對實驗的示範','只問實驗結果，不追問研究員為何如此設計'],['外觀資料不足以解釋選擇背後的原因。','觀察仍有價值，互動是補足。','結果之外，過程與理由也要理解。']],
  [['只靠參觀建築，較少問居民對日常的看法','會說當地語，便把歷史資料列為次要','優先與居民拍照，不細聽笑話和生活故事'],['觀光帶來印象，卻未深入人際含意。','語言是入口，不等於毋須其他背景。','表面接觸不足以理解內涵。']],
  [['增加食物種類，暫不安排與參與者交談','把服裝說明牌加長，較少聽居民親自解釋','只比較展示吸引力，不問文化做法的原因'],['食物展示仍偏向可見外觀。','文字有用，但不能取代互動。','吸引力不等於理解深度。']],
  [['先練準發音，再把歌詞背景留待日後學習','只看表演服裝，推測歌詞所指的階級關係','把旋律是否動聽當成社會幽默的主要證據'],['發音流利仍未解釋深層意思。','衣着不足以解讀語句與背景。','旋律不能代替語境分析。']],
  [['先記下已說的字句，不追問沉默的社交用意','把沉默當成對方沒有立場，略過當時情境','只比較說話音量，不看何時選擇保持沉默'],['字面以外仍可能有重要訊息。','沉默有時是間接表態。','音量不能說明未說出口的意思。']],
  [['有多年觀察，便先把居民對話列為次要資料','因未會說當地語，便少整理已看見的生活','學會常用詞後，便暫不問居民的真實看法'],['長期觀看仍不能取代互動。','文章承認可得到初步印象。','詞語知識仍需與人交流驗證。']],
  [['先把景點列齊，再用照片推測居民的笑話','手冊已寫歷史，便暫不與居民談生活經驗','懂了地方玩笑後，便把景點觀察列為次要'],['清單無法提供交流中的感受與細節。','手冊不能代替人際互動。','深入理解不要求放棄觀光。']],
  [['先詳記食物與節日，日常對話可稍後再查','在餐廳用過餐，便以此推估當地人際規範','只研究語法規則，較少問居民實際怎樣相處'],['可見象徵有價值，但不是文化全貌。','一種活動不能代表整個社會期望。','語言也包含活的互動。']],
  [['有觀光印象後，先以翻譯材料代替居民對話','只用背誦詞彙衡量理解，少查實際交流能力','先看景點介紹，暫不問地方語言中的深層含意'],['翻譯能幫助入門，仍未提供深層互動。','會字詞不等於懂文化語用。','觀光資料不足以完成深入理解。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:68',meta:{topic:'不會說當地語言能否深入理解文化',summary:'作者完全同意要深入理解一國文化，必須會說當地語言。文化不只有食物、節慶和服飾；詞句也傳達禮貌、幽默、階級及社會期望，逐字翻譯未必能讀懂委婉與沉默。真正理解亦來自與居民互動，而非只觀光。外來者可得初步印象，但不懂語言時理解仍不完整。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
