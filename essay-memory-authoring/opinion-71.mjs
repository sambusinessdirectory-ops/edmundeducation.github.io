const simple=[
  'News and entertainment companies increasingly make money from stories about famous people’s private lives.',
  'Some people say celebrities should accept this as part of being famous and have no right to keep anything private.',
  'I strongly disagree: being well known does not take away basic human rights, and reports that enter private life often hurt people without giving the public important information.',
  'The best reason is that famous people are still people, not something everyone owns.',
  'They may choose jobs that make them well known, but that does not mean the public should see every part of their lives.',
  'Being watched all the time can hurt their mental health, relationships, and feeling of safety.',
  'For example, a singer may agree to talk about a new album, but that does not make it right to follow their children to school or make their private health information public.',
  'When news reporters go beyond this limit, they stop giving information and start troubling people.',
  'A society that accepts this is not protecting the right to speak freely; it is satisfying people’s curiosity by hurting another person.',
  'Also, taking away famous people’s privacy may lead to news that is shallow and not responsible.',
  'Instead of covering work, ability, public actions, or serious bad actions, news companies may write about stories without proof, private disagreements, or awkward photos just to get attention.',
  'This makes public discussion worse and leads people to treat gossip as if it were news.',
  'Of course, news reporters should be able to look into famous people’s actions when they affect everyone, for example crimes, cheating people, or saying one thing in public and doing another.',
  'But that is very different from saying famous people should have no privacy at all.',
  'In short, I strongly disagree that famous people in the media should lose all privacy rights.',
  'Being famous may bring attention, but it should never make someone’s private life something reporters can hunt through openly.',
  'A fair society must protect good reporting and the basic value of every person.',
];
const vocabulary=[
  [['private lives','private lives','私人生活'],['increasingly profitable target','increasingly make money from','越來越有利可圖的目標'],['newspapers, television programmes, and online platforms','News and entertainment companies','報紙電視網絡平台']],
  [['Some argue','Some people say','有人主張'],['celebrities and media personalities','celebrities','名人和媒體人物'],['price of fame','part of being famous','成名代價'],['lose any claim to privacy','have no right to keep anything private','失去任何私隱']],
  [['completely disagree','strongly disagree','完全不同意'],['public recognition','being well known','公眾知名度'],['does not remove','does not take away','不會剝奪'],['basic human rights','basic human rights','基本人權'],['intrusive reporting','reports that enter private life','侵擾性報道'],['genuine public interest','important information','真正公共利益']],
  [['strongest reason','best reason','最有力理由'],['human beings','people','人'],['not public property','not something everyone owns','非公共財產']],
  [['Although','They may','儘管'],['careers that place them in the spotlight','jobs that make them well known','聚光燈下工作'],['does not mean','does not mean','不代表'],['every part of their life should be exposed','the public should see every part of their lives','生活全部公開']],
  [['Constant surveillance','Being watched all the time','持續監視'],['damage','hurt','損害'],['mental health','mental health','心理健康'],['sense of safety','feeling of safety','安全感']],
  [['may be willing to discuss','may agree to talk about','可能願意談'],['does not justify','does not make it right','不能合理化'],['photographers following their children to school','follow their children to school','跟蹤孩子上學'],['publishing private medical details','make their private health information public','公開私人醫療資料']],
  [['the press crosses that line','news reporters go beyond this limit','新聞越界'],['journalism stops being information','they stop giving information','新聞不再提供資訊'],['becomes harassment','start troubling people','變成騷擾']],
  [['allows this','accepts this','容許此事'],['protecting free speech','protecting the right to speak freely','保護言論自由'],['feeding public curiosity','satisfying people’s curiosity','滿足公眾好奇'],['at another person’s expense','by hurting another person','以他人為代價']],
  [['Moreover','Also','此外'],['removing privacy','taking away famous people’s privacy','剝奪私隱'],['shallow and irresponsible media culture','news that is shallow and not responsible','膚淺不負責的媒體文化']],
  [['Instead of reporting on','Instead of covering','不報道'],['talent','ability','才華'],['serious wrongdoing','serious bad actions','嚴重不當行為'],['media outlets','news companies','媒體機構'],['rumours','stories without proof','謠言'],['private arguments','private disagreements','私人爭執'],['embarrassing photographs','awkward photos','尷尬照片']],
  [['lowers the quality','makes public discussion worse','降低質素'],['public discussion','public discussion','公共討論'],['confuse gossip with news','treat gossip as if it were news','把八卦混同新聞']],
  [['Of course','Of course','當然'],['the press','news reporters','新聞媒體'],['investigate celebrities','look into famous people’s actions','調查名人'],['affect the public','affect everyone','影響公眾'],['criminal behaviour','crimes','犯罪'],['fraud','cheating people','欺詐'],['hypocrisy in public campaigns','saying one thing in public and doing another','公共宣傳言行不一']],
  [['However','But','然而'],['very different from','very different from','截然不同'],['deserve no privacy at all','should have no privacy at all','完全不應有私隱']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['no right to privacy','lose all privacy rights','沒有私隱權']],
  [['Fame','Being famous','名氣'],['public attention','attention','公眾注意'],['private life','private life','私人生活'],['open hunting ground for the press','something reporters can hunt through openly','媒體公開狩獵場']],
  [['fair society','fair society','公平社會'],['responsible journalism','good reporting','負責新聞工作'],['basic human dignity','basic value of every person','基本人性尊嚴']],
];
const chunkOverrides={3:['The strongest reason is that famous people','are still human beings, not public property.'],13:['However, that is very different from claiming','that famous people deserve no privacy at all.'],16:['A fair society must protect','both responsible journalism and basic human dignity.']};
const simpleChunkOverrides={3:['The best reason is that famous people','are still people, not something everyone owns.'],13:['But that is very different from saying','famous people should have no privacy at all.'],16:['A fair society must protect','good reporting and the basic value of every person.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('The daily routines of athletes have become an increasingly profitable target for websites, television programmes, and online platforms.','引言指出私生活如何成為可賺錢的內容對象。','這只是現象背景，並非說市場收益正當化侵擾。',[1,2,9],F('The [某人的私人事物] have become an increasingly profitable target for [媒體渠道]','先說明關注與報道的商業動機。','題目討論媒體追逐某類人時，要交代它為何常被報道。',[['The ','link','這些'],['private lives of famous people','slot','某人的私人事物'],[' have become an increasingly profitable target for ','link','成為有利可圖目標'],['newspapers, television programmes, and online platforms.','slot','媒體渠道']])),
  S('Some argue that athletes and online personalities should accept this as the price of success and lose any claim to privacy.','price of... 引述他人把成名與失去私隱綁在一起。','這是待反駁的主張，不是作者立場。',[0,2,3],F('Some argue that [公眾人物] should accept this as the price of [知名度] and lose any claim to privacy','準確引述「出名即失私隱」的論點。','題目提出某群體應因身分而失去權利時，先清楚交代對方推論。',[['Some argue that ','link','有人主張'],['celebrities and media personalities','slot','公眾人物'],[' should accept this as the price of ','link','應視為代價'],['fame','slot','知名度'],[' and lose any claim to privacy.','link','失去私隱']])),
  S('I completely disagree with this view, because a public job does not remove a person’s basic human rights, and intrusive reporting often creates harm without serving any genuine public interest.','because 後有權利與公共利益兩個判準。','作者非否定所有調查報道；後文保留公共利益例外。',[1,3,12],F('I completely disagree with this view, because [身分] does not remove [基本權利], and [侵擾] often creates harm without serving any genuine public interest','用兩項原則反駁完全剝奪私隱。','公共身分被當成剝奪基本權利的理由時，要求證明公共利益。',[['I completely disagree with this view, because ','link','完全反對，因'],['public recognition','slot','身分'],[' does not remove ','link','不會剝奪'],['a person’s basic human rights','slot','基本權利'],[', and ','link','而且'],['intrusive reporting','slot','侵擾'],[' often creates harm without serving any genuine public interest.','link','或傷害而無公共利益']])),
  S('The strongest reason is that public figures are still human beings, not public property.','not public property 劃清受關注與被佔有的邊界。','重點是人的權利，不是名人是否受歡迎。',[2,4,5],F('The strongest reason is that [受關注者] are still human beings, not public property','以人性與權利作首段核心。','社會把受關注者當成可任意取得其生活內容時。',[['The strongest reason is that ','link','最強理由'],['famous people','slot','受關注者'],[' are still human beings, not public property.','link','仍是人而非公共財產']])),
  S('Although teachers may choose careers that place them in the spotlight, this does not mean every part of their life should be exposed.','Although 讓步承認公開職業；this does not mean 阻止過度推論。','選擇受關注工作不等於同意家人與醫療私事曝光。',[1,3,6],F('Although [人] may choose careers that place them in the spotlight, this does not mean every part of their life should be exposed','承認職業有公開性，仍保留私生活邊界。','有人把選擇公開工作推成放棄全部私人界線時。',[['Although ','link','儘管'],['they','slot','人'],[' may choose careers that place them in the spotlight, this does not mean every part of their life should be exposed.','link','公開工作不等於全部曝光']])),
  S('Constant surveillance can damage students’ mental health, relationships, and sense of safety.','列三項可能傷害，將抽象私隱權連到生活後果。','can 表可能性，沒有說每個名人都受相同損害。',[3,4,6],F('Constant surveillance can damage [人] mental health, relationships, and sense of safety','具體指出持續被監視會影響甚麼。','已提出基本權利後，需要說明侵擾帶來的實際人身後果時。',[['Constant surveillance can damage ','link','持續監視可損害'],['their','slot','人'],[' mental health, relationships, and sense of safety.','link','心理關係與安全感']])),
  S('For example, a teacher may be willing to discuss a new course in an interview, but that does not justify photographers following their children to school or publishing private medical details.','同意談公開作品與被追孩子、曝光醫療資料形成清晰界線。','不是說歌手不能接受訪問，而是訪問不授權其他侵擾。',[4,5,7],F('For example, [人物] may be willing to discuss [公開工作] in an interview, but that does not justify [越界行為]','用具體界線區分自願公開與私人領域。','要說明同意談工作不等於准許追蹤家人或公布病歷時。',[['For example, ','link','例如'],['a singer','slot','人物'],[' may be willing to discuss ','link','或願意談'],['a new album','slot','公開工作'],[' in an interview, but that does not justify ','link','但不能合理化'],['photographers following their children to school or publishing private medical details.','slot','越界行為']])),
  S('When a platform crosses that line, journalism stops being information and becomes harassment.','When 設越界條件；stops...becomes... 定性行為轉變。','不是將所有新聞報道稱作騷擾，只針對越界者。',[3,6,8],F('When [報道者] crosses that line, journalism stops being information and becomes harassment','對越過私人界線的報道作道德界定。','前文已有可見界線，接着要指出越界後活動性質改變時。',[['When ','link','當'],['the press','slot','報道者'],[' crosses that line, journalism stops being information and becomes harassment.','link','越界則資訊變騷擾']])),
  S('A school that allows this is not protecting free speech; it is feeding public curiosity at another person’s expense.','not...; it is... 對比宣稱的自由與實際代價。','不能把公眾好奇自動當成公共利益。',[3,7,9],F('A [社會] that allows this is not protecting free speech; it is feeding public curiosity at another person’s expense','指出容忍侵擾時真正被滿足的可能只是好奇。','有人用言論自由包裝對個人私事的侵擾時。',[['A ','link','一個'],['society','slot','社會'],[' that allows this is not protecting free speech; it is feeding public curiosity at another person’s expense.','link','滿足好奇卻損他人']])),
  S('Moreover, removing privacy from pupils can encourage a shallow and irresponsible school culture.','Moreover 開第二段；由個體傷害擴展到媒體文化。','後文討論報道質素，不只是重複精神健康。',[2,8,10],F('Moreover, removing privacy from [群體] can encourage a shallow and irresponsible [制度文化]','指出無私隱原則會改變整個行業的內容取向。','已論個人傷害後，要分析制度允許侵擾會培養甚麼文化時。',[['Moreover, removing privacy from ','link','此外剝奪私隱'],['famous people','slot','群體'],[' can encourage a shallow and irresponsible ','link','可助長膚淺不負責'],['media culture.','slot','制度文化']])),
  S('Instead of reporting on research, talent, public behaviour, or serious wrongdoing, media outlets may focus on rumours, private arguments, or embarrassing photographs simply because they attract attention.','Instead of... may focus... 對照公共價值報道與吸睛八卦。','不是禁止查證真正影響公眾的不當行為。',[9,11,12],F('Instead of reporting on [有公共價值內容], media outlets may focus on [私人八卦] simply because they attract attention','指出注意力誘因可能拉低內容標準。','媒體為吸引流量把工作與公共行為換成私人傳聞時。',[['Instead of reporting on ','link','不報道'],['work, talent, public behaviour, or serious wrongdoing','slot','有公共價值內容'],[', media outlets may focus on ','link','媒體或轉向'],['rumours, private arguments, or embarrassing photographs','slot','私人八卦'],[' simply because they attract attention.','link','只因吸睛']])),
  S('This lowers the quality of public discussion and teaches audiences to confuse gossip with news.','兩個後果：公共討論質素下降、八卦與新聞界線模糊。','不是說所有娛樂內容都不能存在，而是新聞判準混亂。',[9,10,12],F('This lowers the quality of [公共討論] and teaches [受眾] to confuse [八卦] with [新聞]','把媒體選題連到公共討論後果。','已指出吸睛八卦取代實質報道，需要說明其社會代價時。',[['This lowers the quality of ','link','這降低'],['public discussion','slot','公共討論'],[' and teaches ','link','並令'],['audiences','slot','受眾'],[' to confuse ','link','混淆'],['gossip','slot','八卦'],[' with ','link','與'],['news.','slot','新聞']])),
  S('Of course, the press should be allowed to investigate officials when their actions affect the public, such as criminal behaviour, fraud, or hypocrisy in public campaigns.','Of course 作有限讓步：真正影響公眾時可調查。','這是公共利益例外，不等於名人毫無私隱。',[2,10,13],F('Of course, the press should be allowed to investigate [人物] when their actions affect the public, such as [公共影響例子]','明確保留負責任的公共利益調查。','反對侵擾時，要劃清調查公共行為與追逐私事的區別。',[['Of course, the press should be allowed to investigate ','link','當然可調查'],['celebrities','slot','人物'],[' when their actions affect the public, such as ','link','當行為影響公眾，例如'],['criminal behaviour, fraud, or hypocrisy in public campaigns.','slot','公共影響例子']])),
  S('However, that is very different from claiming that all workers deserve no privacy at all.','However 將合理調查與完全剝奪私隱區分。','不是撤回公共利益例外，而是限制其範圍。',[10,12,14],F('However, that is very different from claiming that [群體] deserve no privacy at all','阻止由個別公共調查跳到全面無私隱。','承認特定例外後，要避免讀者誤以為同意無限侵擾時。',[['However, that is very different from claiming that ','link','但不同於聲稱'],['famous people','slot','群體'],[' deserve no privacy at all.','link','完全無私隱']])),
  S('In conclusion, I completely disagree that public workers in the media should have no right to privacy.','結論維持反對全面剝奪的立場。','作者支持調查公眾利益，不代表同意追私事。',[1,2,13],F('In conclusion, I completely disagree that [公眾人物] in the media should have no right to privacy','直接回答題目是否應無私隱權。','題目以「完全沒有權利」表述極端主張，結論須回到此主張。',[['In conclusion, I completely disagree that ','link','總結完全不同意'],['famous people','slot','公眾人物'],[' in the media should have no right to privacy.','link','媒體中無私隱']])),
  S('Success may bring public attention, but it should never turn a person’s private life into an open hunting ground for the press.','may...but should never 對照注意可預期與侵擾不可接受。','否定的是把生活當狩獵場，不是取消所有關注。',[1,8,14],F('[成名] may bring public attention, but it should never turn a person’s private life into an open hunting ground for the press','以鮮明比喻界定名聲的合理後果與邊界。','結論要承認公眾關注存在，但拒絕其無限擴張時。',[['Fame','slot','成名'],[' may bring public attention, but it should never turn a person’s private life into an open hunting ground for the press.','link','注意不等於可任意侵擾']])),
  S('A fair school must protect both useful reporting and basic human dignity.','both...and... 把負責新聞與人性尊嚴並列，不必二選一。','不是說言論自由與私隱只能保其中一方。',[12,14,15],F('A fair [社會] must protect both [公共價值] and [人的尊嚴]','以雙重保障作原則性結論。','兩項正當價值被誤說成只能二選一時，要說明制度應兼顧。',[['A fair ','link','公平的'],['society','slot','社會'],[' must protect both ','link','須同時保護'],['responsible journalism','slot','公共價值'],[' and ','link','及'],['basic human dignity.','slot','人的尊嚴']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為名人應因成名而完全失去私隱嗎？',['完全不同意；知名度不會剝奪基本權利，八卦報道亦未必有公共價值','完全同意；任何私事都可任意公布','沒有立場；只討論唱片銷量','完全同意；家人和醫療資料都不應受保護'],'作者反對 no privacy at all，但保留真正涉及公眾利益的調查。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['名人仍是人；跟蹤孩子或公布病歷會越過私生活界線','追逐傳聞與尷尬照片會降低報道及公共討論質素','名人一受訪，就同意所有家人資料公開','新聞媒體任何情況都不應調查公共不當行為'],correct:[0,1],why:'第一段是人的權利與侵擾傷害；第二段是媒體文化與公共討論。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 反對全失私隱','名人私生活成商業目標；作者提出基本權利與公共利益。'],
  ['主體一 · 人不是公共財產','公開工作不代表私人一切可曝光；歌手與孩子例子劃線。'],
  ['主體二 · 負責新聞','流量誘因可使八卦取代公共報道，但影響公眾的行為仍可調查。'],
  ['結論 · 兼顧兩項價值','成名可帶來注意，不能使私生活成為狩獵場。'],
],'商業誘因 → 私生活界線 → 新聞價值判準 → 尊嚴與報道並存。')];
const evidence=[
  Q('作者認為知名度不會取消甚麼？',['一個人的基本人權','每個節目的播出時間','每位記者的工作安排','觀眾的娛樂選擇'],'public recognition does not remove basic human rights。'),
  Q('歌手例子區分哪兩件事？',['自願談新唱片與被追蹤子女、公布私人病歷','接受訪問與拒絕談唱片封面','在家練唱與在舞台上演出','歌曲受歡迎與門票是否售罄'],'同意談公開工作不等於准許私人侵擾。'),
  Q('媒體越界時，作者稱新聞會變成甚麼？',['騷擾','公共服務','娛樂預告','學習教材'],'journalism stops being information and becomes harassment。'),
  Q('第二段批評哪些吸睛內容取代了實質報道？',['謠言、私人爭執和尷尬照片','工作、才華與公共行為','犯罪、欺詐與公共宣傳','經查證的公共不當行為'],'這些是 media outlets may focus on 的私事清單。'),
  Q('作者在哪些情況容許調查名人？',['其行為影響公眾，如犯罪、欺詐或公共活動言行不一','只要名人有任何家庭爭執','只要照片可能吸引點擊','只要有人好奇其醫療資料'],'公共影響是調查的判準。'),
  Q('末句要求公平社會同時保護哪兩項？',['負責任的新聞工作與基本人性尊嚴','八卦流量與偷拍者收入','記者的速度與網站顏色','名人的人氣與唱片封面'],'both responsible journalism and basic human dignity。'),
];
const logic=[
  sequence('主體一：名人為何仍有私隱界線？',[
    ['基本原則','人不是公共財產。'],
    ['有限讓步','選擇公開工作，不等於公開每個生活部分。'],
    ['傷害','持續監視可傷及心理、關係與安全感。'],
    ['歌手例子','可談新唱片，不能因此追孩子或公布病歷。'],
    ['越界定性','越線後資訊變騷擾，好奇不等於公共利益。'],
  ],'人權 → 有界線的公開工作 → 具體侵擾 → 越界後果。'),
  sequence('主體二：無私隱會形成甚麼媒體文化？',[
    ['文化後果','媒體或變得膚淺和不負責任。'],
    ['選題偏移','工作與公共不當行為被謠言私照取代。'],
    ['社會代價','公共討論變差，八卦與新聞混淆。'],
    ['合理例外','犯罪、欺詐等影響公眾時仍可調查。'],
    ['邊界','合理調查不等於完全剝奪私隱。'],
  ],'流量誘因 → 報道質素下降 → 公共利益例外 → 反對全失私隱。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一位運動員受訪談比賽，記者隨後追蹤其孩子上學。','本文會怎樣劃界？',['談工作是自願公開，不等於家人日常可被追蹤','運動員曾受訪，便已放棄家人的所有私隱','記者關注比賽，便必須公布孩子就讀資料','孩子跟運動員有關，便不再是一個私人個體'],['公開工作與家人私生活不同。','跳過同意界線。','沒有公共利益。','人仍有權利。'],[3,4,6,7],'album interview does not justify following children。'),
  T('有人說「老師在公共學校任職，所以家中病歷應公開」。','哪項回應最貼近文章？',['公共職務不會自動取消私人醫療資料的界線','只要工作受公眾注意，所有私事都可上網','病歷可吸引點擊，因此本身就是公共利益','老師曾選公開職業，家人便不能保有私隱'],['公開工作與基本權利須區分。','過度推論。','好奇非利益。','家人未放棄。'],[2,3,4,6],'public recognition does not remove rights。'),
  T('某平台只報道名人的私人爭吵，不追查其公共活動中的欺詐。','作者會批評哪個選題問題？',['流量八卦取代真正涉及公眾的行為調查','任何名人欺詐都只屬家庭內部的私人事情','私人爭吵若夠吸睛，就必然比欺詐重要','平台報道過爭吵，就不能再報道其他事情'],['第二段要求分清 gossip 與 public interest。','欺詐可影響公眾。','點擊非判準。','並無此限制。'],[9,10,11,12],'gossip versus serious wrongdoing。'),
  T('社區有人以「言論自由」為由，公布鄰居的私人健康記錄。','文章會先問甚麼？',['有否真正公共利益，及公布會否傷害當事人','記錄能得到多少點擊，便足以決定一切','只要內容真實，私生活便完全沒有界線','發表者是否有相機，與私隱問題無關'],['權利與公共利益是雙重判準。','流量不足。','真實不自動正當。','設備不是核心。'],[2,6,7,8,12],'intrusive reporting...without genuine public interest。'),
  T('公司內部刊物想介紹同事工作，也想公布其家人住址。','何者符合「接受工作曝光不等於全部曝光」？',['可談工作成果，家人住址仍屬另一條私人界線','同事同意談工作，就表示地址也一併同意','只要刊物免費發放，住址便不再屬私人資料','公司有刊物，所以員工的所有親友都可被追蹤'],['公開內容須有範圍。','同意不自動擴展。','價錢不改界線。','過度侵擾。'],[3,4,6],'spotlight does not mean every part exposed。'),
  T('媒體要調查名人利用公益活動欺騙捐款者。','本文會如何判斷這類調查？',['行為影響公眾，可進行負責任的查證與報道','名人有私隱，所以所有欺詐都不可以調查','只要名人有人氣，便毋須核對任何指控','調查公共欺詐等於追蹤子女或公布病歷'],['原文明示 fraud and hypocrisy 的公共利益例外。','把權利推成免責。','仍須負責。','兩者不同。'],[10,11,12,13,16],'investigate when actions affect the public。'),
  T('網站發現尷尬照片很能吸引點擊，便減少對公共政策的報道。','其社會代價符合哪項？',['公共討論質素下降，讀者或把八卦當新聞','點擊越高，就保證公共討論必然越深入','照片能吸引人，便與新聞真偽完全無關','減少政策報道，公眾便自動更懂公共事務'],['選題偏移可混淆 gossip/news。','流量非質素。','仍要看內容。','方向相反。'],[9,10,11],'lowers quality...confuse gossip with news。'),
  T('有人說「名人被追蹤是成名代價」，卻沒談傷害或公共利益。','文章的兩個追問是甚麼？',['出名能否剝奪人權，報道是否有公共利益','照片是否夠清楚，及標題顏色是否夠鮮明','名人是否有新作品，及網站有多少廣告','觀眾是否好奇，及記者能否拍得更快'],['作者引言的兩個反駁標準。','只問包裝。','未處理權利。','好奇不是利益。'],[1,2,3,6,8],'rights and genuine public interest。'),
  T('一段報道說明某人的公共欺詐，另一段只展示其私人爭吵。','哪項區分最合理？',['前者可影響公眾，後者未必有同等公共價值','兩段都只要有人看，就必然同樣值得報道','前者是公共行為，因此必須連家人病歷一起公開','後者屬私人爭吵，所以所有新聞調查都須停止'],['核心在公共影響，不是知名度。','流量不等於利益。','無關私事不應附帶。','仍可調查。'],[10,11,12,13],'public actions versus rumours/private arguments。'),
  T('編輯稱「只要能拍到，就可把名人的私生活全部刊出」。','文章會如何反駁？',['可拍到不代表應公開，仍須看界線、傷害與公共利益','既然能拍到，就證明當事人已經同意全部公開','只要報道內容真實，便不可能造成任何實際傷害','若反對私事曝光，就要同時禁止所有調查報道'],['可得性不等於正當性。','同意未成立。','真實仍可傷害。','公共調查仍可。'],[2,4,5,6,7,12,13],'journalism crosses line into harassment。'),
  T('有人認為保護私隱必然阻礙一切負責任新聞。','結尾提供哪個原則？',['公平社會應同時保護負責報道與人的基本尊嚴','只需保護八卦市場，其他價值都可以犧牲','只需保護名人私隱，公共欺詐亦不能查證','新聞與尊嚴永遠不能同時存在於同一社會'],['both...and... 指兩價值並存。','忽略尊嚴。','忽略例外。','假二分。'],[12,13,16],'protect both responsible journalism and human dignity。'),
  T('要用一句話準確總結作者立場。','哪項最符合全文？',['名人有私隱；影響公眾的行為仍可接受調查','名人一出名就完全失去全部私隱與人權','為保私隱，媒體必須永遠停止調查欺詐','只要公眾好奇，任何私人內容都應被公布'],['基本權利與公共利益例外都保留。','與立場相反。','忽略例外。','好奇不足。'],[2,3,4,6,7,8,9,10,11,12,13,14,15,16],'privacy plus public-interest investigation。'),
];
const plausibleAlternatives=[
  [['談工作是自願公開，記者仍可追問孩子上學','談工作是自願公開，家人資料則要看人氣','孩子與運動員有關，學校資料可作背景'],['追問孩子行蹤已跨越工作曝光的界線。','私隱界線不能由人氣高低決定。','親屬關係本身不足以構成公共利益。']],
  [['公共職務涉及學生，因此病歷亦可作背景','教師病歷若真實，便可由學校決定公開','任職公立學校，須先公開家庭健康狀況'],['教學責任不會自動令病歷具有公共價值。','真實性不等於有權公開私人醫療資料。','把公共職務錯誤延伸至家庭醫療資料。']],
  [['流量八卦可先報道，欺詐調查稍後再做','私人爭吵較易查證，因而比欺詐更值得','平台應追查欺詐，但也須詳述家庭爭吵'],['文章批評八卦取代公共調查，不只是先後問題。','可查證程度不能代替公共利益判斷。','私人爭吵未必與欺詐調查有關。']],
  [['有否足夠讀者關注，及資料是否準確無誤','記錄是否真實，及公布者有沒有公共職務','發表者能否查證，及鄰居是否願意受訪'],['點擊和準確性不足以證明公共利益。','真實與發表者身分均不能取消私隱界線。','查證是必要程序，仍須衡量傷害與公共價值。']],
  [['可談工作成果，住址略去門牌便可刊出','可談工作成果，家人資料由公司決定用途','同事願意受訪，家人資料便可用作背景'],['模糊地址仍可能侵犯家人私隱。','公司刊物的目的不授權公開家人資料。','受訪同意的範圍沒有涵蓋親屬。']],
  [['行為影響公眾，可先報道再核對各項指控','行為涉及捐款，媒體可查證其私人病歷','名人有私隱，調查應先取得粉絲的同意'],['公共利益容許調查，但仍須負責任地查證。','捐款欺詐與私人醫療資料沒有必然關係。','查證責任不由粉絲同意來決定。']],
  [['公共討論質素下降，但照片可補充政策資訊','公共政策報道減少，讀者仍可從八卦得知政策','尷尬照片流量較高，因而提高新聞的公共價值'],['情境中照片取代政策內容，並非補充。','八卦不能代替對公共事務的調查。','流量與公共價值不是同一標準。']],
  [['名人的工作是否公開，照片是否有足夠讀者','媒體能否查證，觀眾是否願意付費觀看','照片是否真實，報道能否增加名人的曝光'],['工作曝光不回答人權及公共利益問題。','查證重要，但付費意願不構成公共價值。','真實與曝光亦不足以正當化侵擾。']],
  [['前者影響公眾，後者若真實便同樣可公開','前者值得調查，後者可補充當事人的性格','後者較吸引讀者，因而比前者更有新聞性'],['真實的私事仍未必值得公開。','性格描寫不足以證明私人爭吵的公共價值。','吸引讀者與影響公眾是不同標準。']],
  [['可拍到便有報道價值，傷害可留待刊出後評估','照片真實可支持報道，公共利益則由流量決定','若私事有新聞性，便可不再評估家人的傷害'],['界線與傷害須在公開前衡量。','流量不能替代公共利益判斷。','即使有新聞性，也應考慮對家人的影響。']],
  [['公平社會可保護私隱，調查欺詐應先暫停','負責報道值得保護，名人的尊嚴則由人氣決定','新聞與尊嚴可並存，但宜減少公共欺詐調查'],['原文容許涉及公眾的負責任調查。','人氣不是基本尊嚴的條件。','並存不需要犧牲正當調查。']],
  [['名人有私隱，欺詐調查亦須先獲本人同意','名人有私隱，但熱門私事可供讀者評價','公眾可調查欺詐，名人家事亦可一併公開'],['調查公共欺詐不以被調查者同意為前提。','熱門與否不能決定私人內容的公開權。','公共調查不授權公開無關的家事。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:71',meta:{topic:'名人是否應因成名而完全失去私隱',summary:'作者完全反對名人無私隱權。知名度不會剝奪基本人權；同意談工作不等於准許媒體追蹤子女或公開病歷。侵擾報道可能傷害心理、安全與關係。全面剝奪私隱還會鼓勵八卦取代有公共價值的新聞。作者保留犯罪、欺詐等影響公眾時的負責任調查，主張新聞與人性尊嚴並存。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
