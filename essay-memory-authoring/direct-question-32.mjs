// Source-specific reviewed memorisation support for Direct Question 32.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-32-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:32'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People now get information from newspapers, websites and social media, so many think news reports must be fair and based on facts.',
  'I do not think every news story is true, even if it comes from a well-known news company.',
  'I think a newspaper should give people information they can trust and help them understand important public problems.',
  'We cannot say all news is true because people write it, and people never judge things in a completely fair way.',
  'A story may describe things that really happened, but its title, chosen people to speak and pictures may still affect what readers think.',
  'For example, two papers may report the same protest: one may call it a demand for fair treatment, while the other may call it a danger to society.',
  'Neither story has to be completely made up, but both can make readers feel a particular way.',
  'Also, the need to make money may push newspapers to make stories seem bigger, make difficult problems seem simple or print claims that have not been checked so they get more attention.',
  'So a newspaper should do something more important than just amuse readers or fill empty space.',
  'Its first job is to tell people about things that affect their lives, such as decisions by the government, money problems, warnings about illness and problems in society.',
  'More than that, a newspaper should check what people in power are doing.',
  'When it looks into dishonest acts, asks difficult questions of powerful groups and shows clear proof, ordinary people can judge whether leaders act well.',
  'This matters greatly because most people cannot go to court cases themselves, check how public money is spent or ask officials questions.',
  'A good newspaper sees and hears things for them.',
  'To sum up, I do not think all news is true because people can choose facts, present them in a particular way or change them.',
  'But that is exactly why newspapers are important.',
  'They should check facts, explain important problems and keep people from knowing too little, being misled or trusting too easily.',
];
const vocabulary=[
  [['receive information','get information','接收資訊'],['objectivity in news reporting','news reports must be fair and based on facts','新聞客觀'],['regarded as essential','must be','視為必要']],
  [['all news is true','every news story is true','所有新聞都真實'],['established media organisations','well-known news company','成熟媒體機構']],
  [['In my view','I think','在我看來'],['give citizens reliable information','give people information they can trust','提供可靠資訊'],['matters of public importance','important public problems','公共重要議題']],
  [['Not all news can be considered true','We cannot say all news is true','新聞未必全真'],['journalism','news','新聞工作'],['human beings','people','人'],['human judgment is never completely neutral','people never judge things in a completely fair way','判斷難完全中立']],
  [['report','story','報導'],['real events','things that really happened','真實事件'],['headline','title','標題'],['sources','chosen people to speak','消息來源'],['images','pictures','圖片'],['shape readers’ interpretation','affect what readers think','影響解讀']],
  [['two newspapers','two papers','兩份報紙'],['cover the same protest','report the same protest','報導同一抗議'],['public demand for justice','demand for fair treatment','公義訴求'],['threat to social order','danger to society','社會秩序威脅']],
  [['Neither report may be entirely fabricated','Neither story has to be completely made up','未必完全捏造'],['guide the reader','make readers','引導讀者'],['particular emotional response','feel a particular way','特定情緒反應']],
  [['commercial pressure','need to make money','商業壓力'],['exaggerate stories','make stories seem bigger','誇大故事'],['simplify complex issues','make difficult problems seem simple','簡化複雜議題'],['publish unverified claims','print claims that have not been checked','刊未核實說法'],['attract attention','get more attention','吸引注意']],
  [['function of a newspaper','newspaper should do','報紙職能'],['merely entertaining readers','just amuse readers','只娛樂讀者'],['filling pages','fill empty space','填滿版面']],
  [['first responsibility','first job','首要責任'],['inform the public','tell people','告知公眾'],['government decisions','decisions by the government','政府決定'],['economic problems','money problems','經濟問題'],['health warnings','warnings about illness','健康警告'],['social conflicts','problems in society','社會衝突']],
  [['More importantly','More than that','更重要'],['public watchdog','check what people in power are doing','公共監察者']],
  [['investigating corruption','looks into dishonest acts','調查貪污'],['questioning powerful institutions','asks difficult questions of powerful groups','質疑權力機構'],['presenting evidence clearly','shows clear proof','清楚呈證'],['ordinary people','ordinary people','一般公眾'],['acting responsibly','act well','負責任行事']],
  [['especially important','matters greatly','尤其重要'],['most citizens','most people','大部分公民'],['personally attend court cases','go to court cases themselves','親自出席庭訊'],['inspect public spending','check how public money is spent','檢查公共開支'],['interview officials','ask officials questions','訪問官員']],
  [['responsible newspaper','good newspaper','負責任報紙'],['eyes and ears','sees and hears things','耳目']],
  [['In conclusion','To sum up','總結'],['facts can be selected','people can choose facts','選取事實'],['framed','present them in a particular way','特定角度呈現'],['distorted','change them','扭曲']],
  [['However','But','然而'],['exactly why','exactly why','正因如此'],['newspapers matter','newspapers are important','報紙重要']],
  [['proper role','should','應有角色'],['verify information','check facts','核實資訊'],['explain important issues','explain important problems','解釋重要議題'],['ignorance','knowing too little','無知'],['manipulation','being misled','被操控'],['blind trust','trusting too easily','盲信']],
];
const chunkOverrides=[
  ['In a world where people receive information','from newspapers, websites and social media,','objectivity in news reporting is often regarded as essential.'],
  ['I do not think all news is true,','even when it is produced by established media organisations.'],
  ['In my view, the main function of a newspaper','is to give citizens reliable information','and help them understand matters of public importance.'],
  ['Not all news can be considered true','because journalism is produced by human beings,','and human judgment is never completely neutral.'],
  ['A report may be based on real events,','but the choice of headline, sources and images','can still shape readers’ interpretation.'],
  ['For example, two newspapers may cover the same protest:','one may describe it as a public demand for justice,','while another may portray it as a threat to social order.'],
  ['Neither report may be entirely fabricated,','but both can guide the reader','towards a particular emotional response.'],
  ['In addition, commercial pressure can tempt newspapers','to exaggerate stories, simplify complex issues','or publish unverified claims','in order to attract attention.'],
  ['The function of a newspaper, therefore,','should be more serious than merely entertaining readers','or filling pages.'],
  ['Its first responsibility is to inform the public','about events that affect their lives,','such as government decisions, economic problems,','health warnings and social conflicts.'],
  ['More importantly, a newspaper should act','as a public watchdog.'],
  ['By investigating corruption, questioning powerful institutions','and presenting evidence clearly,','it allows ordinary people to judge','whether leaders and organisations are acting responsibly.'],
  ['This is especially important because most citizens','cannot personally attend court cases,','inspect public spending or interview officials.'],
  ['A responsible newspaper becomes','their eyes and ears.'],
  ['In conclusion, I do not believe all news is true,','since facts can be selected, framed or distorted.'],
  ['However, this is exactly why','newspapers matter.'],
  ['Their proper role is to verify information,','explain important issues','and protect the public from ignorance, manipulation and blind trust.'],
];
const simpleChunkOverrides=[
  ['People now get information','from newspapers, websites and social media,','so many think news reports must be fair','and based on facts.'],
  ['I do not think every news story is true,','even if it comes from a well-known news company.'],
  ['I think a newspaper should give people','information they can trust','and help them understand important public problems.'],
  ['We cannot say all news is true','because people write it,','and people never judge things in a completely fair way.'],
  ['A story may describe things that really happened,','but its title, chosen people to speak and pictures','may still affect what readers think.'],
  ['For example, two papers may report the same protest:','one may call it a demand for fair treatment,','while the other may call it a danger to society.'],
  ['Neither story has to be completely made up,','but both can make readers','feel a particular way.'],
  ['Also, the need to make money may push newspapers','to make stories seem bigger,','make difficult problems seem simple','or print claims that have not been checked','so they get more attention.'],
  ['So a newspaper should do something more important','than just amuse readers or fill empty space.'],
  ['Its first job is to tell people','about things that affect their lives,','such as decisions by the government, money problems,','warnings about illness and problems in society.'],
  ['More than that, a newspaper should check','what people in power are doing.'],
  ['When it looks into dishonest acts,','asks difficult questions of powerful groups','and shows clear proof,','ordinary people can judge whether leaders act well.'],
  ['This matters greatly because most people','cannot go to court cases themselves,','check how public money is spent','or ask officials questions.'],
  ['A good newspaper sees','and hears things for them.'],
  ['To sum up, I do not think all news is true','because people can choose facts,','present them in a particular way or change them.'],
  ['But that is exactly why','newspapers are important.'],
  ['They should check facts, explain important problems','and keep people from knowing too little,','being misled or trusting too easily.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的表達關係相同。`,distractorReason:`這句${focus}，但沒有原句的表達關係。`};}
const structures=[
  card('In a world where people learn from many screens, careful checking of health claims is essential.','以 In a world where 建立資訊環境再提出必需的標準',[1,3,8],fixed(0,'In a world where [人們從多種媒介接收資訊], [新聞客觀性] is often regarded as essential.','先交代資訊來源多樣，再說新聞客觀性為何受重視。','開題談新聞可信度時，先提出讀者身處的多來源資訊環境。',['In a world where ', ', ', ' is often regarded as essential.'],['讀者取得資訊的環境','在該環境受重視的要求'])),
  card('I do not think every health tip is correct, even when it comes from a popular website.','以 even when 表示知名來源仍不能保證全真',[0,2,4],fixed(1,'I do not think [所有新聞都真實], even when [由成熟媒體製作].','直接回答第一問：即使來自正式媒體，也不能一概當真。','題目問所有報導是否屬實，須作明確而不絕對信任來源的回答時。',['I do not think ', ', even when '],['被否定的全真說法','仍不足保證全真的來源'])),
  card('In my view, the main role of a library is to offer trusted resources and help people learn about local issues.','以 main function ... is to ... and ... 說明兩項公共職責',[1,8,10],fixed(2,'In my view, the main function of [報紙] is to [提供可靠資訊] and [解釋公共重要議題].','回答第二問：報紙要提供可靠資料並幫公眾理解重大事務。','題目另問報紙有甚麼功能，要同時說清資訊與理解兩項任務時。',['In my view, the main function of ', ' is to ', ' and '],['被界定職責的媒介','第一項職責','第二項職責'])),
  card('Not every review is fair because people write reviews, and their judgments are never wholly neutral.','以 because ... and ... 解釋報導無法保證完全中立',[1,4,5],fixed(3,'Not all [新聞] can be considered true because [由人製作], and [人的判斷不完全中立].','新聞出自人的選擇與判斷，所以不能保證每篇都完全客觀。','開始論證第一問，先指出媒體內容難以完全中立的根本原因時。',['Not all ', ' can be considered true because ', ', and '],['被評估真實性的內容','人為產製的事實','判斷的限制'])),
  card('A product review may discuss real tests, but its title and pictures can still change what buyers think.','以 may ... but ... 區分事件真實與呈現方式',[3,5,6],fixed(4,'[報導] may be based on [真實事件], but the choice of [標題、來源與圖片] can still [影響讀者解讀].','即使事件真實，選材和呈現方式仍可引導理解。','已說人為判斷難中立，要指出真實素材如何被不同方式呈現時。',[' may be based on ', ', but the choice of ', ' can still '],['被編寫的內容','真實基礎','編輯選擇','對讀者的影響'])),
  card('For example, two sites may cover the same strike: one calls it fair protest, while another calls it a danger.','以 one ... while another ... 對照同一事件兩種報法',[4,6,7],fixed(5,'For example, [兩份報紙] may cover [同一場抗議]: one may describe it as [公義訴求], while another may portray it as [秩序威脅].','同一抗議可被報成追求公義或威脅秩序，展示框架差異。','抽象說完標題和來源會影響解讀，要用同一事件的兩種說法作例子時。',['For example, ', ' may cover ', ': one may describe it as ', ', while another may portray it as '],['兩個報導者','同一事件','第一種詮釋','相反詮釋'])),
  card('Neither account may be wholly invented, but both can make visitors feel afraid.','以 Neither ... but both ... 指出兩篇未捏造仍可引導感受',[4,5,7],fixed(6,'Neither [報導] may be entirely fabricated, but both can [引導讀者] towards [特定情緒].','重點不是兩篇皆假，而是兩篇都可能左右情緒。','同一事件兩種報法之後，要避免把立場差異誤說成完全造假時。',['Neither ', ' may be entirely fabricated, but both can ', ' towards '],['兩篇報導','可共同產生的影響','被引向的反應'])),
  card('In addition, sales pressure can push websites to exaggerate risks or post unchecked claims to gain clicks.','以 In addition 追加商業誘因，並列誇大與未核實做法',[4,6,8],fixed(7,'In addition, [商業壓力] can tempt [報紙] to [誇大、簡化或刊未核實說法] in order to [吸引注意].','除了人為詮釋，追求關注的商業壓力也可能扭曲新聞。','已談編輯選擇，還要指出另一項讓新聞失真的外部誘因時。',['In addition, ', ' can tempt ', ' to ', ' in order to '],['額外的利益壓力','受誘因影響的媒體','可能採取的做法','希望取得的回報'])),
  card('The job of a clinic, therefore, should be more serious than merely selling products.','以 therefore ... more serious than 對照公共責任與淺層目的',[2,7,9],fixed(8,'The function of [報紙], therefore, should be more serious than merely [娛樂讀者] or [填滿版面].','承接新聞可能失真，轉說報紙的任務應高於娛樂和填版面。','第一問的失真問題已建立，要轉入第二問的公共職責時。',['The function of ', ', therefore, should be more serious than merely ', ' or '],['須負責任的媒介','不足以構成主要職責的用途一','不足以構成主要職責的用途二'])),
  card('Its first responsibility is to tell residents about changes affecting them, such as school closures and water alerts.','以 Its first responsibility ... such as 列舉會影響生活的公共資訊',[8,10,11],fixed(9,'Its first responsibility is to [告知公眾] about [影響生活的事件], such as [政府決策、經濟、健康與社會衝突].','首項職責是報告切身公共事件，並列具體範疇。','要解釋報紙的資訊職能，不能只說「提供資訊」，要說資訊為何與生活相關時。',['Its first responsibility is to ', ' about ', ', such as '],['主要資訊行動','資訊與公眾的關係','具體公共議題'])),
  card('More importantly, a charity should act as a watchdog over public spending.','以 More importantly 提升到監察權力的職責',[9,12,13],fixed(10,'More importantly, [報紙] should act as [公共監察者].','在告知事件之外，提出監察有權力者的更深一層職責。','已說一般報導功能，須進一步說明媒體如何協助公眾監督權力時。',['More importantly, ', ' should act as '],['承擔監察職責的媒介','比傳遞資訊更進一步的角色'])),
  card('By checking accounts, questioning managers and publishing clear evidence, the union helps workers judge whether leaders act fairly.','以 By ... 三個行動說明公眾如何判斷權力',[10,12,13],fixed(11,'By [調查貪污], [質疑權力機構] and [清楚呈證], it allows [普通公眾] to judge whether [領袖組織負責任].','把公共監察者具體化為調查、提問與舉證，讓公眾判斷。','提出「監察者」後，須交代實際做法以及資訊如何交到公眾手中時。',['By ', ', ', ' and ', ', it allows ', ' to judge whether '],['第一項調查','第二項質詢','第三項證據工作','因此能判斷的人','接受監督的對象'])),
  card('This matters because most residents cannot attend every council meeting or inspect every contract themselves.','以 because 多數人不能親查來說明監察的重要性',[10,11,13],fixed(12,'This is especially important because [大多數公民] cannot personally [出席庭訊], [檢查公共開支] or [訪問官員].','普通公民無法親自取得每項公共資訊，所以需要可信的代查者。','已列調查與舉證工作，要說明一般人為何需要報紙代為查證時。',['This is especially important because ', ' cannot personally ', ', ', ' or '],['無法親查的大多數人','難親做的第一項調查','第二項調查','第三項調查'])),
  card('A careful library becomes the community’s eyes and ears.','以 eyes and ears 比喻代公眾觀察和收集資訊',[11,12,14],fixed(13,'[負責任的報紙] becomes [公眾的耳目].','總結報紙代不能親查的讀者觀察公共事件。','列完公眾無法親自調查之處，要用簡短比喻收束代理監察作用時。',[' becomes '],['替公眾留意事情的媒介','被比喻成的感官'])),
  card('In conclusion, I do not think every online review is fair, since facts can be selected or twisted.','以 since 回答新聞未必全真的理由',[1,5,16],fixed(14,'In conclusion, I do not believe [所有新聞都真實], since [事實可被選取、框定或扭曲].','結論先重申對第一問的否定回答，再簡述原因。','收尾回答新聞是否全真，並用 since 提醒讀者何以不能盲信時。',['In conclusion, I do not believe ', ', since '],['被否定的全真說法','資訊呈現可能失真的原因'])),
  card('However, this is exactly why fact-checkers matter.','以 However, this is exactly why 把失真風險翻成報紙價值',[14,16,13],fixed(15,'However, this is exactly why [報紙] matter.','新聞有失真風險，正因此需要負責任的報紙。','前句剛說不能相信所有報導，須轉向可信媒體的公共必要性時。',['However, this is exactly why ', ' matter.'],['仍然值得重視的媒介'])),
  card('Their role is to check claims, explain local issues and keep residents from rumours and blind trust.','以 is to ... and ... 並列報紙的三項最終職責',[2,10,15],fixed(16,'Their proper role is to [核實資訊], [解釋重要議題] and [保護公眾免受無知與操控].','最後以核實、解釋和保護讀者三項工作界定報紙。','結尾要完整回答報紙功能，讓讀者明白可信新聞能具體做甚麼時。',['Their proper role is to ', ', ', ' and '],['第一項核實工作','第二項解釋工作','第三項保護公眾的工作'])),
];
const wrongReasons=[
  ['第一問的立場未先描繪多媒介資訊環境。','人為判斷是後文成因，並非開題環境。','報紙職責轉入功能討論，沒有建立客觀性背景。'],
  ['資訊背景只說客觀性受重視，未否定所有新聞全真。','報紙職責回答另一問，沒有 even when 的讓步。','真實事件的不同呈現是後文證據。'],
  ['第一問立場只判斷新聞真實性，沒有界定報紙兩項職責。','娛樂填版面的對照還未說可靠資訊。','監察者是後文深化，沒有同時概括兩個主要功能。'],
  ['來源可能可靠也未必全真，是立場而非人為判斷原因。','真實事件的編輯選擇是具體機制，不是根本限制。','兩份報紙的抗議例子沒有先說人為判斷。'],
  ['人為判斷只是一般原因，沒有真事件與呈現方式的對照。','抗議雙報法是下一步例子。','兩篇未捏造仍引導情緒是這個機制的後果。'],
  ['真事件與編輯選擇是一般論述，沒有同一抗議兩種詮釋。','情緒後果是下一句判斷，未展示兩種相反報法。','商業壓力是另一成因，不是同事件報導對照。'],
  ['真事件可被重排是前提，沒有 Neither ... but both 的限定。','雙報法只是例子，尚未說兩者均可引導感受。','商業誘因不是兩篇報導在未造假下的情緒效果。'],
  ['編輯選擇偏向詮釋方式，沒有商業利益和吸引關注。','雙報法未說金錢壓力或未核實說法。','報紙公共職責是轉折後結論，不是失真誘因。'],
  ['報紙應提供可靠資訊是正面職責，沒有先否定只娛樂填版。','商業壓力說失真問題，尚未轉入更嚴肅職責。','首要告知責任是下一步，未作功能對照。'],
  ['娛樂填版對照只說職責應更重要，未列生活相關事件。','監察者比一般告知更進一步。','調查舉證屬監察做法，不是首項資訊工作。'],
  ['首項告知責任尚未升至監察權力。','公眾無法親查是監察者重要性的理由，不是角色提出。','耳目比喻是後續總結，未先命名監察責任。'],
  ['監察者是角色名稱，未說調查、質詢、舉證三個做法。','公眾不能親查是需求原因，不是實際監察程序。','耳目比喻沒有列調查與證據。'],
  ['監察者標題沒有解釋大多數公民不能親查。','調查舉證是報紙做法，非讀者能力限制。','耳目比喻是對代理功能的總結。'],
  ['調查舉證仍在列具體工作，未用耳目比喻收束。','公民不能親查是比喻的前提，不是比喻本身。','結論新聞失真轉入整體立場，並非代理感官。'],
  ['開篇立場尚未經過證據，沒有 since 總結呈現扭曲。','抗議雙報法是中段例子，沒有收尾回答第一問。','報紙職責是結論最後一步，沒有判斷新聞全真與否。'],
  ['新聞未必全真是前句立場，沒有反轉為報紙重要性。','最終職責清單是反轉後的展開。','耳目比喻在主體段，沒有 However 的結論轉折。'],
  ['引言職責只概括資訊與理解，沒有核實及防操控的總結。','監察者是單一角色名稱，沒有三項具體收束。','轉折句說報紙重要，未說究竟要做哪三件事。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想清每一步如何承接前一步，再依範文順序排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目實際要求回答哪兩問？',[
    '所有新聞是否屬實，以及報紙應肩負甚麼功能',
    '哪份報紙最便宜，以及哪個網站最受歡迎',
    '如何開報社，以及報紙應售賣哪些廣告',
    '新聞字體應多大，以及報紙何時送到家門',
  ],'作者需要先判斷新聞可信度，再界定報紙公共職責。'),
  {type:'multi',prompt:'選出作者對兩問的主要答案',detail:'選兩項，再按「確認」。',options:[
    '報導可用真事件卻透過選材和框架引導理解，所以並非全真',
    '報紙要提供可靠資訊，也應調查權力並幫公眾判斷',
    '成熟媒體刊出的每一句話都必然完全中立而準確',
    '報紙最重要的任務只是娛樂讀者並填滿每一頁',
  ],correct:[0,1],why:'第一問說並非所有新聞都真實；第二問說報紙要告知和監察。'},
];
const route=[sequence('依範文次序排列四段的工作',[
  ['引言回答兩問','指出新聞未必全真，報紙應給可靠資訊並解釋公共事件。'],
  ['先解釋失真風險','人為選擇、同一抗議的兩種報法與商業壓力可影響新聞。'],
  ['再界定報紙職責','告知切身事件，調查權力，替公眾搜集難以親查的證據。'],
  ['結論重申必要性','正因新聞可能扭曲，報紙更須核實、解釋及保護讀者。'],
],'範文先說為何不能盲信，再說負責任報紙如何回應這個問題。')];
const evidence=[
  quiz('事件真實，報導是否就一定完全客觀？',[
    '未必；標題、消息來源和圖片選擇仍會影響解讀',
    '一定；只要事件存在，所有編輯選擇都沒作用',
    '一定；所有讀者看到同一圖片都會有相同感受',
    '未必；因為真實事件從來不會被任何報紙報導',
  ],'原文區分真實事件與報導如何呈現事件。'),
  quiz('兩份報紙報導同一抗議的例子證明甚麼？',[
    '相同事件可被寫成公義訴求或社會秩序威脅',
    '兩份報紙一定報導了兩場完全不同的抗議',
    '只要報導角度不同，就證明兩份新聞全屬捏造',
    '同一事件只有標題字體會不同，解讀必然一致',
  ],'同一事件可被框成不同意義，並引導情緒。'),
  quiz('商業壓力可能引起甚麼新聞問題？',[
    '為吸引關注而誇大、過度簡化或刊未核實說法',
    '令每份報紙必定完全沒有廣告或讀者',
    '使所有新聞自動更加完整、準確與平衡',
    '只影響印刷紙張厚度，完全不影響內容',
  ],'原文補充追逐關注的商業誘因。'),
  quiz('首要「告知」職責關乎哪些資訊？',[
    '政府決策、經濟難題、健康警告和社會衝突',
    '只關乎名人娛樂，與居民生活事件無關',
    '只關乎報紙內部排版，不需報導外部事件',
    '只列未證實傳言，避免任何公共資料',
  ],'作者列出會影響公眾生活的四類公共事件。'),
  quiz('公共監察者應怎樣幫普通人判斷權力？',[
    '調查貪污、質詢機構、清楚呈現證據',
    '停止調查，讓權力機構自行決定報甚麼',
    '只刊沒有來源的指控，不讓讀者看到證據',
    '要求每個人親自調查每宗案件後才可閱讀',
  ],'監察不是口號，而是調查、提問與舉證的工作。'),
  quiz('為何報紙可比喻成公眾的「眼睛和耳朵」？',[
    '多數人無法親查庭案、公共開支或訪問官員',
    '每位讀者都可親自到場核查每宗公共事件',
    '報紙能代替讀者的視力及聽力作醫療治療',
    '報紙只負責畫圖，不需調查任何公共事務',
  ],'負責任報紙替無法親查的公眾觀察與查證。'),
  quiz('結論中「正因此報紙重要」的邏輯是甚麼？',[
    '新聞可被選取或扭曲，所以更需核實和解釋',
    '新聞完全不可能有誤，所以毋須再做核實',
    '只要有報紙，任何未證實說法都自然變真',
    '因為讀者只想娛樂，所有公共監察都多餘',
  ],'風險增加報紙履行核實與監察責任的必要性。'),
];
const logic=[
  sequence('從真事件到可能失真的新聞',[
    ['報導由人製作','人的判斷與選材不可能完全中立。'],
    ['呈現方式有作用','標題、來源和圖片可改變讀者解讀。'],
    ['同一抗議被兩樣寫','一方說公義訴求，另一方說秩序威脅。'],
    ['未造假仍引導情緒','兩篇未必捏造，卻可能把讀者推向不同感受。'],
    ['商業壓力再加劇','追逐關注可誘使誇大、簡化及未查先刊。'],
  ],'範文沒有把「不同角度」直接等同造假，而是逐層解釋可信度。'),
  sequence('報紙的公共責任',[
    ['不能只娛樂填頁','失真風險讓報紙必須肩負更嚴肅的職責。'],
    ['先告知切身事件','政府、經濟、健康和社會資訊影響居民生活。'],
    ['進一步監察權力','調查、質詢與證據讓公眾評估領袖。'],
    ['代讀者親查','多數人難出席庭案或查看每筆公共開支。'],
    ['核實解釋與保護','降低無知、操控與盲信的風險。'],
  ],'報紙從告知走到監察，最後回應新聞可能失真的問題。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('兩個網站都報導同一宗巴士意外，一個突出乘客受傷，另一個只展示交通延誤。','哪項最能運用範文的「真事件與框架」區分？',[
    '同一真事件可因選材不同，令讀者關注不同問題',
    '只要兩站角度不同，便證明意外一定沒有發生',
    '標題和圖片怎樣選都不可能影響讀者的理解',
    '讀者必定只看報導日期，不會留意任何選材',
  ],['兩篇可基於真事，但編輯選擇改變解讀重點。','角度不同不等於事件捏造。','原文正說選材能塑造解讀。','讀者會受呈現方式影響。'],[3,4,5,6],'範文區分真實事件與標題、來源、圖片對讀者理解的影響。'),
  transfer('校報與家長通訊報導同一場學生請願，一份說爭取安全，另一份說擾亂秩序。','哪項最能套用範文的雙報法例子？',[
    '檢查兩份報導如何用不同說法框定同一場行動',
    '先斷言兩份報導都是虛構，毋須查看事實',
    '只比較印刷字體，不問報導如何描述事件',
    '只因標題不同，便認為學生一定沒有請願',
  ],['原文用同一抗議的兩種描述示範框架差異。','不同框架未必等於捏造。','關鍵是描述而非字體。','標題差異不能否定事件。'],[5,6],'範文的兩份報紙把同一抗議分別描寫成公義訴求和秩序威脅。'),
  transfer('一個健康網站只求更多點擊，未查證就把小研究寫成「人人必須停藥」。','哪項最能運用範文對商業壓力的分析？',[
    '點擊誘因可能促使誇大研究並刊未核實說法',
    '只要網站想賺錢，刊出的健康說法便必然正確',
    '標題越驚人，就越不需要查看研究證據',
    '讀者愈多，報導便自然不受任何商業影響',
  ],['追逐注意會誘使誇大和刊登未核實主張。','利益不保證真確。','驚人標題更需核查。','讀者量也可形成壓力。'],[7],'範文說商業壓力可為吸引注意而導致誇大及未核實報導。'),
  transfer('地方報紙要決定首頁：一宗影響全區的食水警告，還是一篇沒有公共影響的名人趣聞。','哪項最符合範文的首要資訊職責？',[
    '優先核實並告知食水警告，說明居民如何受影響',
    '只放名人趣聞，避免報導任何切身公共事件',
    '只填滿版面，不必確認食水資料是否正確',
    '只列食水謠言，不說哪些人需要採取行動',
  ],['健康警告屬影響居民生活的事件，應查證和告知。','娛樂不是首要公共職責。','填版不能代替核實。','居民需要可靠資料。'],[2,8,9],'範文說報紙首責是告知影響生活的事件，特別列出健康警告。'),
  transfer('市議會公布新橋費用，但普通居民無法逐筆查看合約和付款紀錄。','哪項最能運用報紙的監察者角色？',[
    '調查合約及開支，清楚列證，讓居民判斷是否合理',
    '只轉載議會口號，不詢問費用由何處而來',
    '只報橋樑外觀，不查公共款項有沒有問題',
    '要求每位居民自行取得所有內部合約才閱讀',
  ],['範文說報紙須調查公共開支並向不能親查者呈證。','缺少獨立質詢。','外觀不回應花費。','多數居民難親查。'],[10,11,12,13],'範文的 watchdog 要調查、質詢與呈證，因公眾難親自檢查公共開支。'),
  transfer('一篇文章聲稱學校改善了成績，卻只訪問校長，沒公開測試資料。','哪項最符合範文對可靠報導的要求？',[
    '再核對數據及其他來源，並向讀者交代證據',
    '只因校長有職銜，就把說法當作全部事實',
    '把結論寫得更絕對，完全不用查看資料',
    '只挑有利圖片，避免提到任何測試方法',
  ],['來源選擇會影響解讀，責任報紙應核實並呈證。','職銜不能取代證據。','絕對語氣需更強支持。','選圖可加深偏向。'],[4,11,16],'範文提醒來源與圖片影響解讀，並要求監察者清楚呈現證據。'),
  transfer('社區網站刊出未證實的洪水消息，居民開始恐慌。地方報紙收到同一消息。','哪項最能轉用範文的結尾職責？',[
    '先核實消息，再解釋風險，避免恐慌或盲信',
    '立即照抄傳言，毋須確認水位或官方通知',
    '只求更多轉發，不必告訴居民是否需避險',
    '完全不解釋資訊，讓居民自行猜測是否真實',
  ],['核實、解釋與防止操控正是結論的三項工作。','傳言需要查證。','公共警告應服務居民。','缺少解釋會增加混亂。'],[9,16],'範文結論要求報紙核實資訊、解釋重要議題並保護讀者。'),
  transfer('兩份報導都沒有捏造照片，但其中一份反覆放受驚人群畫面，引發恐懼。','哪項判斷最貼近原文的情緒效果？',[
    '報導未必造假，仍可透過畫面引導讀者的感受',
    '照片若是真實的，讀者感受便絕不受選圖影響',
    '只要有人恐懼，便可證明每張照片都是捏造',
    '讀者只看文字，畫面選擇不會造成任何反應',
  ],['原文說兩篇未必造假，仍能引向特定情緒。','真照片也可能被選擇性使用。','情緒不證明造假。','圖片可影響理解。'],[4,5,6],'範文說未完全捏造的報導也可引導讀者的情緒反應。'),
  transfer('一名居民問：「既然網上新聞可能偏頗，還需要地方報紙嗎？」','哪項最能轉用範文的反轉邏輯？',[
    '正因資訊可能失真，更需報紙核實並監察權力',
    '既然有偏頗，所有查證和調查都可立即停止',
    '只要報紙存在，所有網站便自動完全正確',
    '應只看娛樂內容，不必了解任何公共決策',
  ],['範文用 However, this is exactly why 將失真風險轉為責任媒體價值。','這會放大風險。','報紙不能使其他來源自動正確。','公共決策關乎生活。'],[14,15,16],'結論說事實可被選取和扭曲，因此報紙更須核實、解釋和保護公眾。'),
  transfer('一份學生報想介紹學校新政策，同時調查學生是否能公平使用設施。','哪項最完整體現文章對報紙的兩層職責？',[
    '交代政策內容，再查證執行是否公平並呈現證據',
    '只轉載政策標題，不理學生實際能否使用設施',
    '只寫學生傳聞，不訪問當事人或核對文件',
    '只刊娛樂消息，避免討論任何校內公共決定',
  ],['範文把告知切身事件與監察機構並列。','只告知沒有監察。','傳聞需核實。','娛樂不是主要職責。'],[2,9,10,11],'範文先說報紙告知影響生活的事件，再說它要監察有權力的機構。'),
];
export default {key:'direct-question:32',meta:{topic:'新聞真實性與報紙的公共職責',summary:'新聞可因選材、框架和商業壓力失真；負責任報紙要告知、查證及監察。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
