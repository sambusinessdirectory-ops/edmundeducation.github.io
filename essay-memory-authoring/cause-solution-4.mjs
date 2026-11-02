// Reviewed Cause/Solution 4: children using the internet without adult supervision.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-4-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:4'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Using the internet is now a usual part of being a child, as many children use websites and apps to talk, play games and make friends.',
  'But without an adult watching and guiding them, children may face dangers they are too young to notice.',
  'The biggest dangers are harmful strangers and bullying on the internet. Parents, schools and online services can help prevent these problems.',
  'One big danger is that children may meet people who do not tell them who they really are.',
  'In online games, chat apps and social groups, an adult might act like a child to win trust, get private details, or ask a child to hide things from their family.',
  'Because young children often trust people and want to belong, this may lead to adults building false trust, threatening them or using them for harm.',
  'Another danger is bullying on the internet.',
  'Unlike a fight at school, hurtful posts can reach a child at home, spread fast and seem hard to get away from.',
  'Repeated cruel words, false stories or embarrassing pictures can badly harm a child’s belief in themselves and emotional health.',
  'Parents can lower these dangers if they take part in their children’s internet use in a careful, practical way.',
  'Instead of only stopping children from going online, parents should make clear rules, choose safety settings for their age and often ask what they see online.',
  'Then children can see adults checking on them as help, not a penalty.',
  'Schools can help too.',
  'Lessons about online safety should show children how to spot worrying behaviour, keep personal details safe, stop hurtful users contacting them and tell someone about scary messages.',
  'Meanwhile, online companies should make their services safer for children by checking ages more carefully, making reports easier and taking harmful posts down sooner.',
  'To sum up, using the internet without adult guidance can put children in danger from strangers who try to control them and from serious online bullying.',
  'Parents, useful online safety lessons and safer websites are the best ways to deal with these dangers.',
];
const vocabulary=[
  [['Internet access','Using the internet','使用互聯網'],['normal part','usual part','正常的一部分'],['online platforms','websites and apps','網上平台'],['chat','talk','聊天'],['build friendships','make friends','建立友誼']],
  [['However','But','然而'],['adult supervision','an adult watching and guiding them','成年人監督'],['exposed to risks','face dangers','接觸風險'],['recognise','notice','辨認']],
  [['main problems','biggest dangers','主要問題'],['contact with dangerous strangers','harmful strangers','接觸危險陌生人'],['cyberbullying','bullying on the internet','網絡欺凌'],['addressed','help prevent','處理／預防'],['platform responsibility','online services','平台責任']],
  [['first major problem','One big danger','第一個主要問題'],['come into contact with','meet','接觸'],['hide their real identity','do not tell them who they really are','隱藏真實身份']],
  [['gaming platforms','online games','遊戲平台'],['messaging apps','chat apps','即時通訊程式'],['pretend to be','act like','假裝'],['gain trust','win trust','取得信任'],['private information','private details','私人資料'],['keep secrets','hide things','保守秘密']],
  [['Since','Because','由於'],['trusting','trust people','容易相信別人'],['eager to be accepted','want to belong','渴望被接納'],['grooming','adults building false trust','誘導／建立虛假信任'],['blackmail','threatening them','勒索'],['exploitation','using them for harm','剝削']],
  [['second problem','Another danger','第二個問題'],['cyberbullying','bullying on the internet','網絡欺凌']],
  [['ordinary playground conflict','a fight at school','一般校園衝突'],['online abuse','hurtful posts','網上辱罵'],['spread quickly','spread fast','迅速擴散'],['impossible to escape','hard to get away from','難以逃避']],
  [['Repeated insults','Repeated cruel words','反覆辱罵'],['rumours','false stories','謠言'],['humiliating images','embarrassing pictures','羞辱性圖片'],['seriously damage','badly harm','嚴重損害'],['confidence','belief in themselves','自信'],['mental well-being','emotional health','心理健康']],
  [['reduced','lower','減少'],['take an active','take part','積極參與'],['sensible role','careful, practical way','理性做法']],
  [['Rather than','Instead of','而不是'],['simply banning','only stopping','只禁止'],['set clear rules','make clear rules','制定清晰規則'],['age-appropriate safety settings','safety settings for their age','適合年齡的安全設定'],['regularly talk','often ask','定期交談']],
  [['supervision','adults checking on them','監督'],['protection','help','保護'],['punishment','penalty','懲罰']],
  [['important role to play','can help','重要角色'],['also','too','也']],
  [['Digital safety lessons','Lessons about online safety','數碼安全課程'],['identify suspicious behaviour','spot worrying behaviour','辨認可疑行為'],['protect personal information','keep personal details safe','保護個人資料'],['block abusive users','stop hurtful users contacting them','封鎖辱罵者'],['report threatening messages','tell someone about scary messages','舉報威脅訊息']],
  [['At the same time','Meanwhile','與此同時'],['technology companies','online companies','科技公司'],['design safer spaces','make their services safer','設計更安全空間'],['stronger age checks','checking ages more carefully','更嚴格年齡檢查'],['easier reporting tools','making reports easier','更易舉報'],['faster removal','taking harmful posts down sooner','更快移除']],
  [['In conclusion','To sum up','總結'],['unsupervised internet use','using the internet without adult guidance','無監督上網'],['expose','put children in danger','使接觸危險'],['manipulation by strangers','strangers who try to control them','陌生人操控'],['damaging forms of cyberbullying','serious online bullying','具傷害性的網絡欺凌']],
  [['best tackled','best ways to deal with','最好處理'],['responsible parenting','Parents','負責任家長引導'],['practical digital education','useful online safety lessons','實用數碼教育'],['safer online platforms','safer websites','更安全網上平台']],
];
export {original,simple,vocabulary};

// Every fixed span below occurs verbatim in the corresponding original sentence.
function frame(i,links,labels,meaning,usage,example,tag,job){
  const text=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing source link ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:text.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;
  }
  if(cursor<text.length)parts.push({text:text.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched labels ${i+1}`);
  return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
  frame(0,[', especially as '],['已普遍出現的現象','說明現象的具體背景'],
    '先交代現象已變普遍，再用 especially as 補上使它特別明顯的背景。',
    '已說明一種普遍變化，現在要指出哪些具體活動或情況使它更常見時。',
    'Home study is common, especially as many families now have fast internet.','especially as','補上使現象更明顯的背景'),
  frame(1,['However, when ', ', '],['缺少保護的情況','可能出現的風險'],
    'However 轉向風險；when 先提出沒有監督的情況，再說可能後果。',
    '介紹一種日常活動後，要指出某種條件一旦出現便可能產生風險時。',
    'However, when children share passwords, strangers may enter their accounts.','However, when','把條件接到可能的風險'),
  frame(2,[', and these can be addressed through '],['兩項主要問題','對應的解決途徑'],
    '前半句點出陌生人接觸與網絡欺凌；these 回指這兩項問題，後半句預告解方。',
    '題目同時問問題與解決方法，需要在引言用一句話把兩邊連起來時。',
    'The main risks are scams and lost data, and these can be addressed through training and clear rules.','these can be addressed through','把已列出的問題接到解方'),
  frame(3,['The first major problem is that '],['完整的第一項風險'],
    '固定開頭宣布第一項問題；that 後須用完整子句說清兒童會遇到甚麼。',
    '在問題段開始分析第一項主要危險，並要直接說出它如何發生時。',
    'The first major problem is that young cyclists often lack safe routes.','The first major problem is that','直接引出第一項問題'),
  frame(4,[' in order to '],['假冒身份的行動','對方想達到的目的'],
    'in order to 指出假冒兒童的目的，後面三個動詞分別是取得信任、資料和秘密。',
    '已描述某人的行動，要解釋他這樣做想取得甚麼時。',
    'A stranger may pose as a student in order to collect personal details.','in order to','說明行動的目的'),
  frame(5,['Since ', ', this can lead to '],['使兒童較脆弱的原因','可能出現的傷害'],
    'Since 先說年幼兒童容易信人和想被接納；this 回指該情況，再列風險。',
    '要先交代使某群人容易受害的條件，再指出這可能導致哪些後果時。',
    'Since the road is poorly lit, this can lead to more accidents.','Since...this can lead to','把脆弱條件推到可能後果'),
  frame(6,['A second problem is '],['第二項問題'],
    'A second problem is 把分析由陌生人接觸轉到另一項獨立風險：網絡欺凌。',
    '同一段已完成第一項問題的解釋，現在要清楚開出第二項問題時。',
    'A second problem is a lack of trained staff.','A second problem is','標明第二項獨立問題'),
  frame(7,['Unlike ', ', '],['用作比較的普通情況','網上情況的不同後果'],
    'Unlike 以操場衝突作對照，突出網上辱罵會到家中、擴散和難以逃避。',
    '要說明新風險為何比讀者熟悉的普通情況更持續或更難處理時。',
    'Unlike a short power cut, a long outage can stop essential services.','Unlike','藉熟悉情況作對照'),
  frame(8,[' can seriously damage '],['反覆出現的傷害行為','被損害的心理狀態'],
    '前半句列出侮辱、謠言和圖片；can seriously damage 指出對自信與心理健康的影響。',
    '列出具體傷害行為後，要總結它們可能嚴重影響的能力或健康時。',
    'Repeated teasing can seriously damage a pupil’s confidence.','can seriously damage','指出行為可能造成的嚴重損害'),
  frame(9,[' can be reduced if '],['可減少的風險','需要成立的保護條件'],
    '被動式先聚焦風險減少；if 才引出家長積極且理性參與的條件。',
    '已講清風險，現在要提出在甚麼條件下可以降低它時。',
    'Road accidents can be reduced if drivers slow down near schools.','can be reduced if','把改善結果繫於具體條件'),
  frame(10,['Rather than simply ', ', '],['過於單一的做法','較完整的替代方案'],
    'Rather than simply 先排除只禁用互聯網，再用規則、設定和談話提出可行替代。',
    '面對風險時，先指出一刀切做法不足，再列出更平衡的行動時。',
    'Rather than simply closing the park, councils should improve lighting and supervision.','Rather than simply','以可行方案取代單一禁令'),
  frame(11,[' makes ',' feel like ',' rather than '],['前述家長做法','孩子感受到的監督','理想感受','要避免的感受'],
    'makes...feel like...rather than 解釋相同的監督如何被孩子理解為保護而非懲罰。',
    '提出做法後，要比較受影響者可能產生的兩種相反感受時。',
    'A friendly welcome makes registration feel like support rather than a test.','makes...feel like...rather than','對照一種做法帶來的兩種感受'),
  frame(12,[' also have an important role to play.'],['另一個能採取行動的機構'],
    'also 把解方由父母擴展到學校，為下一句的數碼安全課程作鋪墊。',
    '已說明一方可以做甚麼，現在要引入另一方也有責任時。',
    'Local libraries also have an important role to play.','also have an important role to play','引入另一個負責方'),
  frame(13,[' should teach children how to '],['負責教授的課程','具體可學的安全動作'],
    'should teach...how to 後不是只寫「提升意識」，而是列辨認、保護、封鎖和舉報四種動作。',
    '教育方案需要具體說清學生將學會哪些可執行的技能時。',
    'Road safety lessons should teach children how to cross safely and recognise traffic signs.','should teach children how to','把課程目標寫成可執行技能'),
  frame(14,['At the same time, ',' should ',', with '],['同時負責的機構','需要設計的主要改善','落實改善的具體工具'],
    'At the same time 引入平台責任；with 後列出年齡核查、舉報工具和移除內容。',
    '已有家長與學校的方案，還需補上平台方及其實際工具時。',
    'At the same time, schools should improve reporting, with clearer rules and trained staff.','At the same time...with','並列另一行動方及其落實工具'),
  frame(15,['In conclusion, ',' can expose ',' to '],['缺乏監督的上網情況','被置於風險中的群體','總結的兩項傷害'],
    'In conclusion 收束全文；expose...to 把沒有監督的上網與陌生人操控、欺凌連起來。',
    '結尾要濃縮已分析的兩項危險，清楚指出誰會受到影響時。',
    'In conclusion, unsafe crossings can expose pupils to serious harm.','can expose...to','總結情況對某群人的風險'),
  frame(16,[' are best tackled through '],['要解決的風險','互補的行動途徑'],
    'are best tackled through 回應解方題；家長、學校和平台三方同時出現。',
    '結尾要直接回應「如何處理」，並簡潔歸納多方互補措施時。',
    'These delays are best tackled through clear schedules and more frequent buses.','are best tackled through','歸納能處理問題的途徑'),
];
const structures=specs.map((target,i)=>{
  const distractors=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];
  return {...target,distractors,
    wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；它沒有用「${target.tag}」${target.job}。`),
    answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};
});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的因果與行動順序，依次選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這篇文章要處理哪兩個問題？',[
    '兒童無人監督上網時面對甚麼危險，以及如何降低這些危險',
    '所有成年人應否永久停用互聯網，以及誰會因此失業',
    '學校應否只教授遊戲技巧，以及哪一種遊戲最受歡迎',
    '不同平台的營收排名如何，以及應由哪間公司繳稅',
  ],'題目同時問風險和解方；範文選出陌生人接觸與網絡欺凌，再提出家長、學校和平台的互補行動。'),
  {type:'multi',prompt:'哪兩項是範文分析的主要風險？',detail:'選兩項，再按「確認」。',options:[
    '有人假冒兒童取得信任並索取私人資料',
    '網上辱罵能擴散並持續影響孩子',
    '所有網上遊戲必然使孩子停止與家人說話',
    '家長只要制定規則便會失去任何保護能力',
  ],correct:[0,1],why:'主體一先分析偽裝身份的陌生人，再分析會帶到家中並快速擴散的網絡欺凌。'},
];
const route=[sequence('先找出風險，再把解方配給負責的一方',[
  ['引言：界定問題','上網已是兒童生活的一部分；缺乏監督時，陌生人接觸與網絡欺凌是主要危險。'],
  ['主體一：說明危險如何發生','成年人可假扮兒童取得信任；網上辱罵與羞辱圖片會迅速擴散並損害自信。'],
  ['主體二：分派可執行的責任','家長設規則及對話，學校教授安全動作，平台改善年齡核查、舉報與移除。'],
  ['結尾：回應兩問','再次濃縮兩項風險，並歸納家長、課程和平台三方措施。'],
],'問題段說明風險的途徑與傷害；解方段逐一指出誰要做甚麼。')];
const evidence=[
  quiz('陌生人如何取得兒童的信任？',[
    '在遊戲、通訊程式或群組中假扮兒童，再索取資料或要求保密',
    '只在學校當面介紹真實身份，並請家長陪同談話',
    '完全不與兒童接觸，卻要求他們記住所有網上規則',
    '只張貼公開的安全通知，從不提出私人要求',
  ],'範文指出冒充同齡人是關鍵機制，隨後才是取得信任、資料與秘密。'),
  quiz('年幼兒童為何較容易受到誘導？',[
    '他們通常較容易信人，也希望被別人接納',
    '他們已能可靠辨認所有網上人士的真實身份',
    '每個孩子都能立即識破所有秘密和勒索手法',
    '網上平台從來不容許成年人與兒童互動',
  ],'作者把容易信任和渴望被接納當作脆弱條件，而不是責怪兒童。'),
  quiz('網絡欺凌與一般操場衝突的關鍵差別是甚麼？',[
    '辱罵可跟到家中、迅速擴散，令孩子感到難以逃避',
    '網上辱罵只能在操場出現，離開學校便會立即消失',
    '所有衝突都只會影響發訊息的人，不會影響收訊者',
    '只要有圖片，受害者的自信與心理狀態必然改善',
  ],'對照句強調網上傷害的持續性、擴散性和心理影響。'),
  quiz('家長應採取哪種平衡的保護方式？',[
    '訂明規則、採用合齡設定，並定期與孩子談論網上所見',
    '只禁用所有網絡設備，並禁止孩子說出遇到的問題',
    '完全不制定規則，也不問孩子是否收到威脅訊息',
    '把所有網上安全責任交給孩子，成年人毋須了解情況',
  ],'Rather than simply banning 對照一刀切禁令與持續、可談論的監督。'),
  quiz('學校課程要教哪些實際安全動作？',[
    '辨認可疑行為、保護資料、封鎖辱罵者及舉報威脅訊息',
    '只背誦平台名稱，不練習處理任何危險情況',
    '把所有私人資料公開，以便每位陌生人檢查',
    '遭遇威脅時保持沉默，也不要封鎖對方',
  ],'範文把課程寫成四項孩子能實際操作的技能。'),
  quiz('科技平台應負責哪三種設計改善？',[
    '更嚴格核查年齡、更易舉報，以及更快移除有害內容',
    '取消所有年齡核查、隱藏舉報入口並永久保留傷害內容',
    '只提高廣告數量，不改善孩子使用平台的安全工具',
    '要求每位家長自己刪除平台伺服器上的所有訊息',
  ],'平台解方聚焦產品設計與處理速度，不把責任全部推回孩子或家長。'),
];
const logic=[
  sequence('主體一：把陌生人接觸與網絡欺凌的機制排好',[
    ['缺少成年人的引導','孩子在遊戲與社交平台獨自與陌生人互動。'],
    ['假身份帶來具體危險','成年人可能假扮孩子，建立信任後索取資料或秘密。'],
    ['易信人和求接納使風險加深','可能出現誘導、勒索或剝削。'],
    ['另一條傷害鏈：網絡欺凌','辱罵、謠言和圖片會擴散且跟到家中，損害自信和心理健康。'],
  ],'先指出風險如何開始，再說誰較易受影響及造成甚麼傷害。'),
  sequence('主體二：三方各有不同但互補的責任',[
    ['家長：規則、設定與對話','合齡安全設定和定期交談令監督更像保護。'],
    ['學校：教可執行的安全技能','孩子學會辨認可疑行為、保護資料、封鎖及舉報。'],
    ['平台：把安全做到產品裏','加強年齡核查、簡化舉報、加快移除有害內容。'],
    ['三方合起來降低危險','不只把責任交給孩子，也不靠永久禁網。'],
  ],'同一個問題需要家庭、教育和平台各自對應能控制的環節。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間學校發現學生在社群程式中收到陌生帳號私訊，對方先自稱同校學生，再要求提供住址。','哪項分析最準確轉用範文的風險機制？',[
    '假冒同齡人先取得信任，再索取私人資料；學校須教學生核實與求助',
    '對方聲稱同校便一定可信，學生應立即交出住址',
    '只有在校門外面對面說話才可能涉及身份偽裝',
    '只要訊息語氣友善，就毋須考慮資料是否私人',
  ],['保留假身份、取得信任和索取資料三個相連步驟。','把自稱身份當成已核實身份，忽略題目風險。','範文正是分析網上假身份接觸。','友善語氣不能證明身份，也不能消除私人資料風險。'],[3,4],'原文分析成年人如何在遊戲與社交平台假扮孩子，逐步取得信任和私人資料。'),
  transfer('一個運動隊的群組出現反覆嘲笑和轉傳尷尬照片，隊員回家後仍不斷收到訊息。','哪項說明保留了範文對網絡欺凌的重點？',[
    '訊息會跟到家中並迅速擴散，持續傷害隊員的自信',
    '離開訓練場後，群組訊息不可能再影響任何人',
    '照片被轉傳愈多，受影響者的心理狀態必然愈好',
    '群組欺凌只是單次玩笑，反覆發生也毋須處理',
  ],['同時說出持續、擴散和心理傷害。','題目已說隊員回家後仍收到訊息。','原文指出羞辱圖片可能傷害自信。','題目明說反覆嘲笑，不可改寫成無害單次事件。'],[7,8],'原文以操場衝突作對照，指出網上辱罵可持續、擴散並損害自信。'),
  transfer('家長擔心孩子在遊戲聊天室遇到陌生人，正在比較「永久禁玩」與「有規則地使用」。','哪項方案最貼近範文？',[
    '訂清聊天室規則、啟用合齡設定，並常與孩子談所見所聞',
    '完全不與孩子討論風險，只突然沒收所有設備',
    '讓孩子自行決定向陌生人提供甚麼資料，不設任何界線',
    '只購買更多遊戲，假設新遊戲會自動排除所有陌生人',
  ],['以規則、設定和對話取代單一禁令。','禁令缺少範文強調的對話與持續引導。','放棄家長可負責的監督和規則。','遊戲數量不會自動解決身份和資料風險。'],[9,10,11],'原文建議家長積極但理性參與，讓監督被理解為保護。'),
  transfer('一所學校要設計短課，教小學生面對威脅性訊息時怎樣處理。','哪項課程目標最可操作？',[
    '練習辨認可疑行為、保護資料、封鎖對方和向可信成人舉報',
    '只要求學生背下「上網要小心」四字，不提供任何步驟',
    '鼓勵學生把威脅訊息轉發給所有陌生人並提供密碼',
    '叫學生遇事永遠保密，不告訴學校或照顧者',
  ],['把抽象安全意識變成孩子可執行的動作。','只有口號，未教孩子如何做。','做法直接增加資料外洩和威脅擴散。','不求助會使威脅更難處理。'],[12,13],'原文數碼安全課程列出辨認、保護、封鎖、舉報四項技能。'),
  transfer('一個青少年平台接到大量欺凌舉報，卻要求七次點擊才能提交，傷害帖子數週未刪。','哪項是平台方應負責的改善？',[
    '簡化舉報入口，縮短移除有害內容的時間，並改善合齡安全設計',
    '刪掉舉報工具，要求孩子自己登入平台伺服器刪帖',
    '只要求家長忍耐，平台不檢查年齡或處理任何帖子',
    '把被舉報帖子自動推送給更多孩子，以增加曝光',
  ],['改善平台能控制的工具和處理流程。','孩子不能代替平台維護其伺服器。','把平台自身責任完全推走。','擴散內容會加重題目指出的傷害。'],[14],'原文要求平台加強年齡核查、簡化舉報並加快移除有害內容。'),
  transfer('社區圖書館開設兒童網上研究活動；孩子需要使用互聯網，但仍可能看到陌生人私訊。','哪項安排最能平衡參與和保護？',[
    '保留研究活動，安排成人引導、清楚規則與可立即求助的渠道',
    '因有風險而取消所有研究活動，也不教孩子任何安全技能',
    '完全沒有成人在場，並鼓勵孩子回覆每一位陌生人',
    '只在活動結束後責怪孩子，事前不設規則或求助渠道',
  ],['承認上網的正常用途，同時建立具體保護。','範文主張理性引導，不把禁用當作唯一方案。','忽略無監督接觸陌生人的已知風險。','事後責怪不能代替事前指導與可求助安排。'],[0,1,9,10],'原文承認上網是生活一部分，並主張家長採取積極而理性的引導。'),
  transfer('長者社區群組有帳號假扮工作人員，聲稱要核實銀行資料；部分成員想被群組接納而照做。','哪項轉用最忠於範文？',[
    '辨認假身份與求接納帶來的弱點，再教成員核實身份及保護資料',
    '只責怪成員太笨，不研究對方如何假扮身份或取得信任',
    '群組帳號只要使用正式頭像，就不可能提出有害要求',
    '把所有資料公開，讓假帳號也能核對每人的銀行號碼',
  ],['把假身份、信任和私人資料三個風險環節轉到新群體。','忽略範文的具體誘導機制。','頭像不是身份核實。','公開銀行資料會增加而非降低傷害。'],[4,5,13],'原文先分析假冒身份與容易信任的條件，再主張教人保護資料。'),
  transfer('某班學生擔心向老師求助會被懲罰，因此被辱罵後選擇隱瞞。','哪項改變最能轉用「保護而非懲罰」的邏輯？',[
    '先說清求助後會得到支持，再用公平規則與對話處理問題',
    '把每次求助都公開批評，使學生更不敢說出遭遇',
    '取消求助渠道，要求學生自行忍受所有辱罵',
    '只設處分名單，從不告訴學生成人會如何保護他們',
  ],['讓成年人介入被理解為保護，才更容易及早知道風險。','公開羞辱會加重害怕求助的問題。','沒有求助渠道便無法及早處理。','只有處分感而沒有保護感，與原文對照相反。'],[10,11],'原文說規則與談話可以令監督感覺像保護，而不是懲罰。'),
  transfer('一間醫院的病人入口網站出現騷擾訊息；醫院能改軟件流程，護理員能教病人使用。','哪項方案最符合範文的多方分工？',[
    '護理員教辨認及舉報，網站團隊改善封鎖和移除流程',
    '網站團隊不提供任何工具，只要求病人自行改寫系統程式',
    '只宣稱騷擾不存在，不教病人處理也不修正入口網站',
    '只教育護理員，卻故意讓舉報入口無法使用',
  ],['教育者與平台各處理自己能控制的環節。','病人無權管理醫院系統。','沒有回應已知風險。','缺少平台工具，教育無法完成整個處理鏈。'],[12,13,14],'原文把安全教育與平台設計列成互補責任。'),
  transfer('一個兒童活動網站的報告要寫結尾；前文已分析假帳號和持續欺凌，也討論家長、課程和平台。','哪項結尾最忠於範文的兩問次序？',[
    '先濃縮假身份與欺凌風險，再歸納家長、學校及平台的措施',
    '先說所有風險都不存在，再要求取消前文提出的安全工具',
    '只重複網站名稱，不概括問題也不回答如何降低風險',
    '只列網站收入，完全不提兒童面對的危險或解決方法',
  ],['按照問題與解方兩問收束，保留前文的多方分工。','否定已分析的風險且推翻方案。','沒有回答題目的任何一問。','網站收入與這篇文章的因果及解方無關。'],[15,16],'原文結尾先概括兩項危險，再歸納家長、教育與平台的處理途徑。'),
];
export default {key:'cause-solution:4',meta:{topic:'兒童無監督上網的風險與解方',summary:'主要風險是陌生人假身份接觸與網絡欺凌；家長、學校及平台各須承擔具體責任。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
