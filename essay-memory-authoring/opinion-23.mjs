// Model Essay 23 · Opinion: online contact, loneliness and friendship.
const simple=[
  'Talking online is now part of daily life, letting people send messages, join groups and stay close across long distances.',
  'However, I do not agree at all that this means people will never feel lonely or will always be able to make new friends.',
  'Digital contact can help people reach more others, but it cannot promise real friendship and support.',
  'The first problem with this claim is that loneliness is not just about having no people near us.',
  'It often comes from not having a close and important relationship.',
  'Someone may have hundreds of people to contact online and still feel alone if the messages are short, put on a show or do not go deep.',
  'For example, social media may push people to share carefully improved versions of their lives instead of talking honestly about fear, sadness or feeling unsure of themselves.',
  'When talking becomes only a long series of likes, comments and short answers, it may feel as if people are with us without giving real help with our feelings.',
  'In this way, an online site can feel like a room full of people where no one really listens.',
  'Another reason is that making friends online still needs confidence with people, trust and effort from both sides.',
  'The internet may open a door, but people still have to go through it themselves.',
  'Shy teenagers, older users or people who have been hurt by online bullying may find talking online stressful instead of freeing.',
  'Also, online spaces are not always safe or honest; false names, unkind comments and tricks to steal from people can make users careful about starting new relationships.',
  'Even when the online space is friendly, friendships need time, honesty and care from both people, which technology cannot make happen by itself.',
  'In short, talking online makes it easier to reach other people, but it has not ended loneliness and cannot promise friends for everyone.',
  'Real relationships grow from close talks, trust and showing up for each other over time, not just from always being able to look at a screen.',
];
const vocabulary=[
  [['Online communication','Talking online','網上溝通'],['woven into everyday life','part of daily life','融入日常'],['exchange messages','send messages','交換訊息'],['join communities','join groups','加入群體'],['maintain relationships across distance','stay close across long distances','跨距離維持關係']],
  [['completely disagree','do not agree at all','完全不同意'],['this development','this','這種發展'],['never be alone','never feel lonely','永遠不孤單'],['make new friends','make new friends','結交新朋友']],
  [['Digital contact','Digital contact','數位接觸'],['widen access to others','help people reach more others','擴大接觸他人機會'],['cannot guarantee genuine companionship','cannot promise real friendship and support','不能保證真正陪伴']],
  [['The first problem with the statement','The first problem with this claim','這說法的第一個問題'],['loneliness','loneliness','孤單'],['not simply the absence of people around us','not just about having no people near us','不只等於身邊沒人']],
  [['often caused by','often comes from','往往由此造成'],['a lack of meaningful connection','not having a close and important relationship','缺乏有意義連結']],
  [['hundreds of online contacts','hundreds of people to contact online','數百個網上聯絡人'],['feel isolated','feel alone','感到孤立'],['brief','short','短暫'],['performative','put on a show','表演式'],['shallow','do not go deep','膚淺']],
  [['Social media','social media','社交媒體'],['polished versions of their lives','carefully improved versions of their lives','美化的生活版本'],['rather than speak honestly','instead of talking honestly','而非誠實談論'],['disappointment or insecurity','sadness or feeling unsure of themselves','失望或不安全感']],
  [['a stream of likes, comments and short replies','a long series of likes, comments and short answers','一連串讚好留言短回覆'],['emotional support','real help with our feelings','情感支持']],
  [['In this sense','In this way','從這意義來說'],['a crowded room','a room full of people','擠滿人的房間'],['no one truly listens','no one really listens','無人真正聆聽']],
  [['social confidence','confidence with people','社交自信'],['shared effort','effort from both sides','共同努力'],['depends on','needs','取決於']],
  [['open the door','open a door','打開一扇門'],['walk through it','go through it themselves','自己走進去']],
  [['elderly users','older users','年長用戶'],['previously experienced online bullying','been hurt by online bullying','曾遭網絡欺凌'],['digital interaction','talking online','數位互動'],['stressful rather than liberating','stressful instead of freeing','有壓力而非得到解放']],
  [['Moreover','Also','此外'],['safe or sincere','safe or honest','安全或真誠'],['fake identities','false names','虛假身份'],['hostile comments','unkind comments','敵意留言'],['scams','tricks to steal from people','騙局'],['cautious','careful','謹慎']],
  [['positive environments','the online space is friendly','正面環境'],['mutual care','care from both people','彼此關心'],['cannot be produced automatically by technology','technology cannot make happen by itself','科技不能自動產生']],
  [['In conclusion','In short','總結來說'],['reach others','reach other people','接觸他人'],['has not removed loneliness','has not ended loneliness','沒有消除孤單'],['cannot promise friendship for everyone','cannot promise friends for everyone','不能保證人人有朋友']],
  [['Human connection','Real relationships','人際連結'],['depth','close talks','深度'],['consistency','showing up for each other over time','持續相處'],['constant access to a screen','always being able to look at a screen','持續接觸螢幕']],
];
const chunkOverrides=[
  ['Online communication has become woven into everyday life,','allowing people to exchange messages, join communities','and maintain relationships across distance.'],
  ['However, I completely disagree','that this development means people will never be alone','or will always be able to make new friends.'],
  ['Digital contact can widen access to others,','but it cannot guarantee genuine companionship.'],
  ['The first problem with the statement is that loneliness','is not simply the absence of people around us.'],
  ['It is often caused by','a lack of meaningful connection.'],
  ['A person may have hundreds of online contacts','and still feel isolated','if those exchanges are brief, performative or shallow.'],
  ['Social media, for instance, can encourage users to post polished versions of their lives','rather than speak honestly about fear, disappointment or insecurity.'],
  ['When communication becomes a stream of likes, comments and short replies,','it may create a sense of companionship','without providing emotional support.'],
  ['In this sense, online platforms can be a crowded room','in which no one truly listens.'],
  ['Another reason is that making friends online','still depends on social confidence, trust and shared effort.'],
  ['The internet may open the door,','but people must still walk through it.'],
  ['Shy teenagers, elderly users or people who have previously experienced online bullying','may find digital interaction stressful rather than liberating.'],
  ['Moreover, online spaces are not always safe or sincere;','fake identities, hostile comments and scams','can make users cautious about forming new relationships.'],
  ['Even in positive environments, friendships require time, honesty and mutual care,','which cannot be produced automatically by technology.'],
  ['In conclusion, online communication has made it easier to reach others,','but it has not removed loneliness','and it cannot promise friendship for everyone.'],
  ['Human connection is built through depth, trust and consistency,','not merely through constant access to a screen.'],
];
const simpleChunkOverrides=[
  ['Talking online is now part of daily life,','letting people send messages, join groups','and stay close across long distances.'],
  ['However, I do not agree at all','that this means people will never feel lonely','or will always be able to make new friends.'],
  ['Digital contact can help people reach more others,','but it cannot promise real friendship and support.'],
  ['The first problem with this claim is that loneliness','is not just about having no people near us.'],
  ['It often comes from','not having a close and important relationship.'],
  ['Someone may have hundreds of people to contact online','and still feel alone','if the messages are short, put on a show or do not go deep.'],
  ['For example, social media may push people to share carefully improved versions of their lives','instead of talking honestly about fear, sadness or feeling unsure of themselves.'],
  ['When talking becomes only a long series of likes, comments and short answers,','it may feel as if people are with us','without giving real help with our feelings.'],
  ['In this way, an online site can feel like a room full of people','where no one really listens.'],
  ['Another reason is that making friends online','still needs confidence with people, trust and effort from both sides.'],
  ['The internet may open a door,','but people still have to go through it themselves.'],
  ['Shy teenagers, older users or people who have been hurt by online bullying','may find talking online stressful instead of freeing.'],
  ['Also, online spaces are not always safe or honest;','false names, unkind comments and tricks to steal from people','can make users careful about starting new relationships.'],
  ['Even when the online space is friendly, friendships need time, honesty and care from both people,','which technology cannot make happen by itself.'],
  ['In short, talking online makes it easier to reach other people,','but it has not ended loneliness','and cannot promise friends for everyone.'],
  ['Real relationships grow from close talks, trust and showing up for each other over time,','not just from always being able to look at a screen.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Online learning is now part of daily life, allowing students to join classes and stay connected across distance.','allowing... 把「融入日常」接到具體便利；不等於保證連結有深度。','引言先承認網上聯繫的實際優點。',[1,2,9],
    F('[網上溝通] has become [日常的一部分], allowing people to [交換訊息、加入群體並跨距離維持關係]','先公平交代網上工具擴大接觸的能力，為後文限制強結論作準備。','題目提出一項新工具能保證某結果時，開頭先承認其帶來的機會。',[['Online communication','slot','網上溝通'],[' has become ','link','已成為'],['woven into everyday life','slot','日常的一部分'],[', allowing people to ','link','因此能'],['exchange messages, join communities and maintain relationships across distance.','slot','交換訊息、加入群體並跨距離維持關係']])),
  S('However, I completely disagree that having many contacts means nobody can feel lonely.','However 與開頭便利轉折；never 或 always 是作者反對的絕對保證。','反對的是「永遠不孤單、總能交朋友」的保證，不是網上溝通本身。',[0,2,14],
    F('However, I completely disagree that [網上發展] means [永不孤單] or [總能結交新朋友]','直接反對題目兩個絕對化結果，保留工具帶來接觸機會的事實。','承認新工具便利後，要指出「必然」或「永遠」哪裏推論過度時。',[['However, I completely disagree that ','link','轉折並反對'],['this development','slot','網上發展'],[' means ','link','被推斷成'],['people will never be alone','slot','永不孤單'],[' or ','link','並列另一保證'],['will always be able to make new friends.','slot','總能結交新朋友']])),
  S('A new app can make it easier to meet classmates, but it cannot guarantee a close friendship.','can...but cannot guarantee... 區分接觸機會與真正陪伴的結果。','這句概括全文的機會與保證之別。',[0,1,3],
    F('[數位接觸] can widen [接觸他人的機會], but it cannot guarantee [真正陪伴]','提出本文判準：工具能開路，不能自動產生人際關係。','反對絕對化主張後，要用簡潔句提出反駁核心時。',[['Digital contact','slot','數位接觸'],[' can widen ','link','擴大'],['access to others','slot','接觸他人的機會'],[', but it cannot guarantee ','link','不能保證'],['genuine companionship.','slot','真正陪伴']])),
  S('The first problem with the claim is that loneliness is not simply having nobody in the room.','not simply 排除把孤單等同身邊人數的狹窄定義。','下一句才指出更重要的缺口是有意義連結。',[2,4,5],
    F('The first problem with [這說法] is that [孤單] is not simply [身邊沒有人]','拆開錯誤的孤單定義，讓後文比較聯絡數量與關係品質。','首段要檢查一項強預測背後的隱含前提時。',[['The first problem with ','link','提出第一問題'],['the statement','slot','這說法'],[' is that ','link','解釋問題'],['loneliness','slot','孤單'],[' is not simply ','link','否定簡化定義'],['the absence of people around us.','slot','身邊沒有人']])),
  S('It is often caused by a lack of meaningful conversation and care.','It 回指孤單；often 限定成因常見而非唯一；lack of... 指向關係品質。','此句把問題從聯絡人數轉到深度和支持。',[3,5,8],
    F('It is often caused by [缺乏有意義的連結]','補上孤單可能真正缺少的關係性質。','排除表面原因後，要指出更深層的成因時。',[['It is often caused by ','link','提出常見成因'],['a lack of meaningful connection.','slot','缺乏有意義的連結']])),
  S('A person may have many online followers and still feel alone if their conversations are brief or shallow.','may...still...if... 對照數量多與孤立感仍可能存在，並提供品質條件。','這是可能例子，不是說所有網上交流都膚淺。',[3,4,6],
    F('A person may have [大量網上聯絡人] and still feel [孤立] if [交流短暫、表面或膚淺]','用反直覺的數量與感受對照，說明孤單與關係品質更相關。','提出真正需要的品質後，要用具體例子反駁「數量等於品質」時。',[['A person may have ','link','雖然擁有'],['hundreds of online contacts','slot','大量網上聯絡人'],[' and still feel ','link','仍可能感到'],['isolated','slot','孤立'],[' if ','link','條件是'],['those exchanges are brief, performative or shallow.','slot','交流短暫、表面或膚淺']])),
  S('Social media can encourage users to share perfect-looking photos rather than talk honestly about disappointment.','rather than 對照修飾形象與坦誠談脆弱感受。','此句解釋為何網上交流可能有數量卻少深度。',[5,7,8],
    F('[社交媒體], for instance, can encourage users to [發布美化生活] rather than [坦誠談不安]','指出平台上的自我展示可能阻礙真正情感交流。','要用具體例子說明某種環境鼓勵一種行為，卻排擠另一種行為時。',[['Social media','slot','平台'],[', for instance, can encourage users to ','link','以平台舉例'],['post polished versions of their lives','slot','發布美化生活'],[' rather than ','link','對照被排擠的交流'],['speak honestly about fear, disappointment or insecurity.','slot','坦誠談不安']])),
  S('When conversations become only likes and brief replies, they may look like friendship without giving real emotional support.','When...may...without... 指出表面陪伴與真正支持可分離。','這句的結論是「可能」，不是所有讚好留言都沒有價值。',[5,6,8],
    F('When [溝通變成讚好、留言與短回覆], it may create [有人陪伴的感覺] without providing [情感支持]','把交流形式的表面活躍，對照仍可能缺少的心理支持。','要說明某行為即使頻繁，也不能保證目標結果時。',[['When ','link','設定交流方式'],['communication becomes a stream of likes, comments and short replies','slot','溝通變成讚好、留言與短回覆'],[', it may create ','link','可能形成'],['a sense of companionship','slot','有人陪伴的感覺'],[' without providing ','link','卻未提供'],['emotional support.','slot','情感支持']])),
  S('In this sense, an online group can be a crowded room in which nobody really listens.','crowded room 比喻聯絡人數很多但缺乏真正聆聽。','這句概括前述表面交流，不否認所有網上群體都能互相支持。',[5,7,9],
    F('In this sense, [網上平台] can be [擠滿人的房間] in which [無人真正聆聽]','用視覺比喻總結第一段：接觸數量與被理解是兩回事。','分析表面替代品後，要以準確圖像收束首段時。',[['In this sense, ','link','由前文概括'],['online platforms','slot','網上平台'],[' can be ','link','可像'],['a crowded room','slot','擠滿人的房間'],[' in which ','link','但其中'],['no one truly listens.','slot','無人真正聆聽']])),
  S('Another reason is that making friends in a large school still depends on confidence, trust and shared effort.','Another reason is that 引出第二問題：認識機會不自動變成友情。','此段由孤單的深度問題，轉向建立新朋友所需的個人與互動條件。',[2,8,10],
    F('Another reason is that [網上交朋友] still depends on [社交自信、信任與共同努力]','第二段指出交友不是平台提供聯絡功能後就能自動完成。','首段談已有關係的品質，次段要分析新關係如何形成時。',[['Another reason is that ','link','另一理由'],['making friends online','slot','網上交朋友'],[' still depends on ','link','仍依賴'],['social confidence, trust and shared effort.','slot','社交自信、信任與共同努力']])),
  S('The app may open the door, but the people using it must still walk through it.','door 比喻機會；but 必須由人行動，不能把工具當作完成關係的保證。','這不是責怪害羞者，而是區分接觸入口與關係建立。',[2,9,11],
    F('[互聯網] may open [門], but [人們] must still [自己走進去]','用門比喻「提供接觸」與「真的建立關係」之別。','指出成果仍需努力後，要用簡潔圖像界定工具的角色時。',[['The internet','slot','互聯網'],[' may open ','link','可能打開'],['the door','slot','門'],[', but ','link','轉向人的行動'],['people','slot','人們'],[' must still ','link','仍須'],['walk through it.','slot','自己走進去']])),
  S('Shy pupils or people hurt by online bullying may find digital interaction stressful rather than freeing.','列不同使用者；may...rather than... 指網上互動對某些人未必容易。','此句展示交友門檻差異，並非說這些群體必然不能交朋友。',[9,10,12],
    F('[害羞青少年、長者或受過欺凌者] may find [數位互動] [有壓力而非解放]','指出工具的入口對不同使用者並非同樣輕鬆。','比喻後，要具體說明有入口仍不等於能順利完成時。',[['Shy teenagers, elderly users or people who have previously experienced online bullying','slot','害羞青少年、長者或受過欺凌者'],[' may find ','link','可能覺得'],['digital interaction','slot','數位互動'],[' ','link','帶來'],['stressful rather than liberating.','slot','有壓力而非解放']])),
  S('Moreover, an online group is not always safe; false accounts and scams can make people cautious about new friends.','分號由「未必安全真誠」接到虛假身份等具體風險。','這句說風險會令人謹慎，不等於所有網上陌生人都不安全。',[9,11,13],
    F('Moreover, [網上空間] are not always [安全或真誠]; [假身份、敵意留言與騙局] can make users [交友謹慎]','補充個人自信之外的環境阻力，解釋交友不會自動發生。','指出個人感到壓力後，要補充環境本身的限制時。',[['Moreover, ','link','補充風險'],['online spaces','slot','網上空間'],[' are not always ','link','不總是'],['safe or sincere','slot','安全或真誠'],['; ','link','列具體原因'],['fake identities, hostile comments and scams','slot','假身份、敵意留言與騙局'],[' can make users ','link','可能令用戶'],['cautious about forming new relationships.','slot','交友謹慎']])),
  S('Even in a friendly group, friendship takes time and care that an app cannot automatically create.','Even... 對最有利環境作讓步；which 限定科技不能自動製造時間、誠實與互相關心。','不是說網上友情不可能，而是說平台功能不能替代人的投入。',[9,10,12],
    F('Even in [正面環境], friendships require [時間、誠實與互相關心], which [科技不能自動產生]','在排除平台風險後仍指出關係本身需要投入，完成第二段的論證。','要避免把複雜困難全歸於少數極端例子時。',[['Even in ','link','即使條件有利'],['positive environments','slot','正面環境'],[', friendships require ','link','友情仍需'],['time, honesty and mutual care','slot','時間、誠實與互相關心'],[', which ','link','而這些'],['cannot be produced automatically by technology.','slot','科技不能自動產生']])),
  S('In conclusion, online groups make others easier to reach, but they cannot promise nobody will feel lonely.','but 並列兩個不成立的絕對結果；承認易接觸並不等於保證友誼。','結論準確回應題目兩項「永遠」與「總能」的強保證。',[1,2,13],
    F('In conclusion, [網上溝通方便接觸], but it has not [消除孤單] and it cannot [保證人人有友誼]','將接觸優點與孤單、交友兩項限制並列重申。','完成兩條理由後，要回到題目中的兩個絕對化主張時。',[['In conclusion, ','link','總結'],['online communication has made it easier to reach others','slot','網上溝通方便接觸'],[', but it has not ','link','未做到'],['removed loneliness','slot','消除孤單'],[' and it cannot ','link','也不能'],['promise friendship for everyone.','slot','保證人人有友誼']])),
  S('Close relationships are built through trust and continued care, not merely constant access to a chat window.','through...not merely... 對照關係深度與螢幕可用性。','螢幕可協助聯絡，但不能單靠它建立信任與持續關懷。',[2,8,14],
    F('[人際連結] is built through [深度、信任與持續相處], not merely through [隨時可看螢幕]','最後用關係的必要條件收束：接觸機會不能自動生出陪伴。','結尾要提出可超越特定工具、適用於其他情境的原則時。',[['Human connection','slot','人際連結'],[' is built through ','link','由此建立'],['depth, trust and consistency','slot','深度、信任與持續相處'],[', not merely through ','link','並非只靠'],['constant access to a screen.','slot','隨時可看螢幕']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意網上溝通令每個人永遠不孤單、總能結交新朋友？',[
    '完全不同意：網上工具增加接觸機會，但不能保證有深度陪伴或自動建立友情',
    '完全同意：只要有聯絡人，任何人都不可能孤單',
    '認為網上工具不能傳訊，也不能跨距離保持聯繫',
    '沒有立場：只描述社交媒體的按鈕',
  ],'引言承認 exchange messages 和跨距離維繫關係，明確反對 never / always 的保證。'),
  {type:'multi',prompt:'選出兩條不同的反駁理由',detail:'選兩項，再按「確認」。',options:[
    '孤單與有意義的連結有關；大量淺層互動未必提供情感支持',
    '結交新朋友仍需自信、信任和共同努力；平台安全與真誠也不能保證',
    '所有網上友誼都必然虛假，無人能在網上互相支持',
    '只要加入一個網上群組，任何人便自動建立深厚友誼',
  ],correct:[0,1],why:'第一主體段談連結品質及孤單，第二段談交友條件及障礙。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 接觸不等於陪伴','網上工具方便跨距離聯繫，作者反對它保證不孤單或一定有朋友。'],
  ['主體段一 · 深度缺口','聯絡人多與讚好留言多，若少坦誠、聆聽和情感支持，仍可能孤單。'],
  ['主體段二 · 交友仍需投入','自信、信任與努力不可由平台代辦；欺凌、假身份和騙局也會造成阻力。'],
  ['結論 · 人際連結條件','深度、信任與持續相處建立關係，螢幕可用性本身不能保證。'],
],'接觸機會增加 → 淺層交流未必紓解孤單 → 交友仍需人與安全環境 → 深度和信任。')];
const evidence=[
  Q('為何「網上有很多人可聯絡」不等於「不會孤單」？',[
    '孤單可能來自缺乏有意義連結；交流若短暫、表演式或膚淺仍會感到孤立',
    '孤單只由身邊完全沒有人造成',
    '只要有百名聯絡人，就保證得到情感支持',
    '朋友數量越多，關係便必然越深',
  ],'原文從 loneliness is not simply absence 轉到 lack of meaningful connection。'),
  Q('社交媒體的「美化人生版本」可能如何影響連結？',[
    '它可鼓勵人展示精選形象，少談恐懼與失望，令互動欠缺真誠深度',
    '它保證所有用戶每天都誠實談脆弱感受',
    '任何經修飾相片都必然令每名用戶永久孤立',
    '一張照片已能替代所有互相聆聽',
  ],'polished versions...rather than speak honestly 是表面化機制；can 保留可能性。'),
  Q('「擠滿人的房間但無人真正聆聽」比喻甚麼？',[
    '聯絡活躍可造成陪伴感，但未必帶來真正情感支持與理解',
    '網上平台必然沒有任何用戶',
    '每個網上群體都永遠不會互相支持',
    '只要房間人多，便自動形成深厚友情',
  ],'crowded room 對照多人在場與缺少聆聽，不是對所有平台的絕對判斷。'),
  Q('「互聯網能開門，人仍須自己走進去」指出甚麼？',[
    '平台能提供認識機會，但建立友情仍需自信、信任與雙方努力',
    '科技一提供入口，友誼便自動完成',
    '只要害羞，人就永遠不能結交朋友',
    '所有網上平台都不應讓人與其他人接觸',
  ],'open the door / walk through it 區分工具機會和人的後續行動。'),
  Q('為何有些人會對網上交友感到壓力或謹慎？',[
    '害羞、曾遭欺凌及假身份、敵意留言、騙局等，可能令互動更難',
    '網上空間保證沒有任何風險',
    '每位長者都必定能輕鬆建立新關係',
    '只要有聯絡功能，社交自信便不再重要',
  ],'範文列使用者差異與平台風險，並用 may / not always 限定。'),
  Q('即使網上環境安全而友善，友情仍需要甚麼？',[
    '時間、誠實與互相關心，不能由科技自動製造',
    '只需持續看螢幕，不必與人交流',
    '只要平台安全，雙方無須作任何努力',
    '只要發出第一次訊息，便保證深厚友誼',
  ],'Even in positive environments... 讓步後指出關係本身的必要條件。'),
];
const logic=[
  sequence('第一主體段：聯絡人多為何仍可能孤單？',[
    ['核心區分','孤單不只是身邊缺人，也可能是缺有意義連結。'],
    ['數量反例','人可有數百網上聯絡人，仍感到孤立。'],
    ['品質條件','交流可能短暫、表演式或膚淺。'],
    ['平台機制','美化生活展示可能取代坦誠談脆弱感受。'],
    ['表面活躍','讚好留言可造成陪伴感，卻未必有情感支持。'],
    ['比喻概括','網上平台可像擠滿人卻無人聆聽的房間。'],
  ],'接觸數量多 → 交流未必有深度 → 表面陪伴不等於情感支持。'),
  sequence('第二主體段：為何網上入口不保證友誼？',[
    ['另一理由','交友仍需要社交自信、信任與共同努力。'],
    ['門的比喻','互聯網可開門，人仍須自己走進去。'],
    ['使用者差異','害羞、年長或曾受欺凌的人可能感到壓力。'],
    ['環境風險','假身份、敵意留言與騙局可令人謹慎。'],
    ['有利情境','即使環境良好，友情仍需要時間、誠實和互相關心。'],
    ['結論原則','科技不能自動製造真正陪伴。'],
  ],'入口存在 → 個人與環境障礙仍在 → 人際關係需要持續雙方投入。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一名學生的遊戲帳號有五百名聯絡人，但他生病時沒有人願意聽他說話。','哪項最能運用「數量與連結品質」的區分？',[
    '聯絡人多不保證有意義陪伴；要看有沒有人真誠聆聽和支持',
    '只要有五百人，學生便不可能感到孤單',
    '任何遊戲聯絡人都必然不會關心別人',
    '生病本身能證明所有網上群體都不安全',
  ],[
    '範文說數百聯絡人與孤立感可並存，關鍵在交流深度。',
    '數量不保證情感支持。',
    '範文沒有否定所有網上友情。',
    '此例只顯示陪伴缺口，不足以判定所有平台。',
  ],[3,4,5,7,8],'範文由 hundreds of contacts still feel isolated 推到 crowded room 比喻。'),
  T('一名創作者每天發精心修飾的生活照，卻不敢向熟人說自己最近失業。','哪項最能解釋表面活躍與孤單可並存？',[
    '展示美化形象不等於坦誠談困難，讚好也未必提供真正支持',
    '照片精美便保證所有追蹤者知道失業的感受',
    '只要有讚好，創作者便不可能孤單',
    '任何生活照都必然使真誠關係不可能形成',
  ],[
    '範文對照 polished versions 與誠實談恐懼失望，並區分陪伴感與支持。',
    '照片沒有交代困境。',
    '讚好不自動構成支持。',
    '範文用 can / may，不說所有照片都破壞關係。',
  ],[6,7,8],'範文說美化展示可能取代坦誠對話，短回覆可營造陪伴感而無情感支持。'),
  T('新社區平台讓住戶能互傳訊息，管理員便說「每位住戶都會立刻交到朋友」。','哪項最能指出保證過強？',[
    '平台提供接觸入口，友誼仍需雙方花時間、建立信任與互相關心',
    '能傳訊息，便保證每個人立即相互信任',
    '只要有平台，社交自信便完全不重要',
    '若不能保證友誼，平台便沒有任何聯絡作用',
  ],[
    '範文的門比喻區分「可接觸」與「已建立關係」。',
    '信任不由功能自動生成。',
    '社交自信仍是條件之一。',
    '平台仍有聯絡益處。',
  ],[2,9,10,13,14],'範文說 internet may open the door, but people must still walk through it。'),
  T('一名曾遭網絡欺凌的學生獲邀加入新的聊天群，卻猶豫是否開口。','哪項最符合作者對使用者差異的理解？',[
    '過去遭遇可能令數位互動有壓力；有入口不等於對每人都容易',
    '有聊天群便保證學生已不再害怕',
    '受過欺凌者永遠不能建立任何友情',
    '學生猶豫便證明網上群組本身必然全是騙局',
  ],[
    '範文特別列曾遭欺凌者 may find digital interaction stressful。',
    '入口不能消除過往影響。',
    '範文沒有作永遠不能交友的判斷。',
    '猶豫不證明群組一定有騙局。',
  ],[9,10,11,12],'範文說以前遭網絡欺凌的人可能覺得網上互動有壓力。'),
  T('一位長者想在網上交朋友，卻不熟悉群組規則，第一次發言也無人回應。','哪項最能運用「開門仍要走進去」？',[
    '提供易理解的參與方式與真誠回應，幫助把接觸機會變成互動',
    '只要群組存在，長者便必然已有深厚友誼',
    '沒人即時回應便證明長者永遠不可能交朋友',
    '不需建立信任，只需增加帳號數量',
  ],[
    '範文把平台入口與使用者信心、雙方努力分開。',
    '群組存在不等於關係已形成。',
    '一次沉默不能預測永遠。',
    '信任與共同努力仍必要。',
  ],[9,10,11,13],'範文列 elderly users，並說 friendship depends on confidence, trust and shared effort。'),
  T('一個交友網站出現假帳號和釣魚訊息，新用戶因此不敢與陌生人深入交談。','哪項最能解釋這種謹慎？',[
    '平台不一定安全真誠；虛假身份和騙局會提高建立信任的門檻',
    '假帳號存在，便證明每一位用戶都是騙徒',
    '只要網站能配對，信任便完全不再重要',
    '新用戶謹慎便證明網上友情永遠不可能真實',
  ],[
    '範文說 fake identities 和 scams can make users cautious。',
    '風險不能推到每個用戶。',
    '配對功能不會自動建立信任。',
    '文章拒絕保證，不是否定所有可能。',
  ],[9,12,13],'範文列假身份、敵意留言與騙局作交友障礙。'),
  T('一個新群組沒有欺凌或假帳號，成員仍只互相按讚，不願聽彼此的困難。','哪項最能使用「即使環境正面」的論點？',[
    '沒有安全風險仍不保證友情；時間、誠實與互相關心仍需建立',
    '一旦群組安全，成員便自動成為親密朋友',
    '只要沒有假帳號，所有按讚便等於充分情感支持',
    '既然友情需要時間，安全環境便完全不重要',
  ],[
    '範文 Even in positive environments 指出人際投入仍不能由平台代辦。',
    '安全是條件之一，不等於友情完成。',
    '按讚可能只是表面陪伴。',
    '安全仍有價值，只是不充分。',
  ],[7,9,12,13],'範文說 friendships require time, honesty and mutual care，即使環境正面也如此。'),
  T('班上兩名同學每天互發短回覆，卻在一人遇到家庭困難時從不深入交談。','哪項最能區分「有互動」與「有支持」？',[
    '短回覆可維持接觸，但要聆聽困難和回應感受才可能形成較深連結',
    '每天回覆便保證兩人互相理解所有情緒',
    '若曾有短回覆，便不可能再發展深入友誼',
    '只有訊息長度能判定一段友情的全部品質',
  ],[
    '範文對照短回覆帶來陪伴感與可能缺乏情感支持。',
    '頻率不保證深度。',
    '淺層互動可改進，範文未說永遠不能。',
    '內容、誠實與關心也重要。',
  ],[4,5,7,8,15],'範文說短回覆可能 create a sense of companionship without providing emotional support。'),
  T('一名學生說：「我能隨時打開社交程式，所以我肯定再也不會孤單。」','哪項最能指出這個推論的跳步？',[
    '隨時可接觸螢幕，只提供機會；仍要有深度、信任和持續關係',
    '社交程式存在，便保證任何時刻都有真誠朋友',
    '如果可能孤單，社交程式便沒有任何溝通功能',
    '只要感到孤單，就證明從未使用任何科技',
  ],[
    '範文結論明確否定 constant access to a screen 自動形成連結。',
    '程式可用性不等於人際支持。',
    '範文承認程式的聯絡作用。',
    '孤單與科技使用可並存。',
  ],[0,2,14,15],'範文結尾用 depth, trust and consistency 對照隨時可看螢幕。'),
  T('一名新人加入線上讀書會，大家定期討論、互相聽取想法，幾個月後建立友情。','哪項最忠實於作者態度？',[
    '網上友情可以形成；關鍵是持續、真誠的雙方投入，並非單靠加入群組',
    '範文說任何網上友情都必然虛假',
    '加入群組當天便保證所有人都成為朋友',
    '有幾個月的投入便證明信任不再重要',
  ],[
    '範文拒絕自動保證，沒有否定經努力建立的網上友情。',
    '這是對作者立場的絕對化誤讀。',
    '友情需要時間與互相關心。',
    '信任仍是核心條件。',
  ],[0,2,9,10,13,15],'範文承認線上擴大接觸，同時說 friendship 需 time, honesty and mutual care。'),
  T('社區平台宣傳說「我們保證每名會員都有新朋友」，但實際只提供搜尋和私訊功能。','哪項最能修改宣傳以符合文章？',[
    '說明平台能幫人認識新對象，但不保證每段互動都成為友情',
    '只要有搜尋功能，便能保證每名會員都得到真誠關懷',
    '如果不能保證友情，就宣稱平台完全不能讓人聯絡',
    '把「接觸機會」與「完成關係」當作同一結果',
  ],[
    '範文的 can widen access / cannot guarantee 是精確的宣傳界線。',
    '功能不會自動生成關懷。',
    '平台仍可增加接觸。',
    '兩者正須分開。',
  ],[0,1,2,9,14],'範文直接反對 always be able to make new friends 的保證。'),
  T('一所學校規劃朋輩支援：既設網上聯絡群，也安排持續傾聽與互相回應。','哪項最能結合全文兩段？',[
    '群組提供入口；真正減少孤單與建立朋友仍靠深度、信任及持續投入',
    '群組一建立，便不再需要任何人認真聆聽',
    '既然傾聽重要，網上聯絡群便必然毫無作用',
    '只要所有人能按讚，便保證每名學生得到支持',
  ],[
    '這同時運用第一段的連結品質與第二段的共同努力。',
    '平台不會代替聆聽。',
    '網上聯絡仍能提供接觸機會。',
    '按讚不保證情感支持。',
  ],[2,4,7,9,13,15],'範文把 access 與 genuine companionship 分開，結尾以深度、信任和持續性收束。'),
];
const reviewedTransferOptions=[
  ['聯絡人多不保證陪伴，還要看聆聽和支持','有五百名聯絡人，學生便絕不會感到孤單','所有遊戲聯絡人必然不會真正關心別人','生病便足以證明網上群體全都不安全'],
  ['展示美化生活不等於坦誠談困難和得到支持','照片精美，追蹤者便必然明白失業感受','有讚好，創作者便不可能再感到孤單了','任何生活照都使真誠關係無法真正形成'],
  ['平台提供入口，友誼仍需時間、信任與關心','能傳訊息，便保證所有人立即彼此信任','只要有平台，社交自信便完全不重要','無法保證友誼，平台便沒有任何聯絡作用'],
  ['有入口不代表人人易互動，過去遭遇或添壓力','有聊天群，便保證學生已不再害怕交友','受過欺凌者，便永遠不能建立任何友情','學生猶豫，便證明網上群組全部是騙局'],
  ['提供易懂參與方式與真誠回應，把機會變互動','群組一存在，長者便必然擁有深厚友誼','沒人即時回應，長者便永遠交不到朋友','不用建立信任，只要增加更多帳號數量'],
  ['假身份與騙局會增加網上建立信任的難度','有假帳號，便證明每一位用戶都是騙徒','網站能配對，便不再需要任何相互信任','新用戶謹慎，便證明網上友情必定虛假'],
  ['環境安全仍不保證友情，還需時間與互相關心','群組一安全，成員便自動成為親密朋友','沒有假帳號，所有讚好便等於情感支持','友情需要時間，便認為安全環境完全不重要'],
  ['短回覆可維持接觸，深入支持還需聆聽感受','每天回覆，便保證兩人理解所有情緒','曾有短回覆，便不可能發展深入友誼','只按訊息長度評定一段友情全部品質'],
  ['隨時可看螢幕只是機會，仍要深度與信任','程式存在，便保證隨時都有真誠朋友','可能感到孤單，程式便完全沒有溝通功能','感到孤單，便證明從未使用任何科技'],
  ['網上友情可形成，但靠持續而真誠的雙方投入','範文認為所有網上友情必然都是虛假','加入群組當天，便保證大家成為好朋友','投入幾個月，便認為相互信任不再重要'],
  ['說平台能助認識人，不保證互動都成友情','有搜尋功能，便保證每人得到真誠關懷','不能保證友情，便宣稱平台不能聯絡人','把接觸機會當作已建立完整友誼'],
  ['群組提供入口，減少孤單仍靠信任與持續相處','群組一建立，便毋須再有人認真聆聽別人','傾聽重要，網上聯絡群便完全沒有作用','所有人都能讚好，便保證學生得到實際支持'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
structures[0].example='Online learning has become part of daily life, allowing people to join classes and stay connected across distance.';
structures[1].example='However, I completely disagree that having many contacts means people cannot feel lonely or will always make new friends.';
structures[2].example='A new app can widen access to classmates, but it cannot guarantee a close friendship.';
structures[6].example='Social media, for instance, can encourage users to share perfect-looking photos rather than talk honestly about disappointment.';
structures[7].example='When online communication becomes only likes and brief replies, it may create a sense of friendship without providing real emotional support.';
structures[12].example='Moreover, online groups are not always safe; false accounts and scams can make users cautious about new friends.';
structures[13].example='Even in a friendly group, friendships require time and care, which an app cannot automatically create.';
structures[14].example='In conclusion, online communication makes others easier to reach, but it has not removed loneliness and it cannot promise friendship for everyone.';
structures[15].example='Close connection is built through trust and continued care, not merely through constant access to a chat window.';
const plausibleAlternatives=[
  [['聯絡人多表示社交活躍，生病時可自行處理','有人會在遊戲中回覆，便足以代替傾聽','若缺少陪伴，應先增加帳號聯絡人數量'],['活躍度不能代替有需要時的支持。','短暫回覆未必等於真正聆聽。','數量增加未必改善關係品質。']],
  [['生活照可獲讚好，失業困難可稍後才談','創作者不談失業，追蹤者可由照片理解','公開生活片段較多，便代表已有情感支持'],['表面活躍仍可能伴隨孤單。','修飾照片未能透露真實困難。','曝光與被理解是不同經驗。']],
  [['平台提供入口，友誼可由訊息數量衡量','居民可互傳訊息，信任便較易自行形成','沒有即時交友，平台的聯絡價值便較低'],['友誼還需時間、信任與關心。','工具本身不能保證關係深化。','沒有保證不代表平台沒有用途。']],
  [['聊天群提供入口，學生應能很快放下恐懼','過去欺凌會添壓力，平台宜先增加功能','學生猶豫加入，便可推斷群組不夠安全'],['遭遇可能持續影響互動意願。','只改工具未必處理信任與自信。','猶豫也可能來自過往經歷。']],
  [['提供參與指引，回應仍可由系統自動產生','群組已有成員，長者可先等待別人接觸','增加帳號數量，信任關係可留待日後處理'],['真誠回應不是單靠自動功能。','缺少回應時仍須設法促進互動。','帳號數量不能代替信任。']],
  [['假帳號增加疑慮，網站配對仍可代替信任','新用戶謹慎，主要因網上互動速度較慢','騙局影響安全，友情深度則只看訊息頻率'],['配對入口不能取代相互信任。','題目指向身分與詐騙風險。','頻繁訊息也未必建立深層關係。']],
  [['環境安全有幫助，讚好便可視作深厚支持','安全群組提供機會，友情可由管理員安排','友情需要時間，安全環境可先放在次要'],['淺層讚好未必回應困難。','管理員也不能替成員建立互相關心。','安全仍是參與與信任的基礎。']],
  [['短回覆維持接觸，深入支持可由朋友代答','互動頻繁便可推測兩人已理解彼此困難','家庭困難較私密，因此同學不需再聆聽'],['支持需要直接聆聽當事人的感受。','頻率未必等於情緒理解。','對方需要時，仍可提供適當關心。']],
  [['程式隨時可用，友誼可由連線時數推斷','感到孤單時可打開程式，因此不必求助','有隨時聯絡的機會，便可少花時間建立信任'],['連線時數不是深層關係的證據。','可接觸他人不等於已得到支持。','關係仍需持續投入與信任。']],
  [['網上友情可形成，群組規模是主要原因','定期討論有益，個人信任可待之後再建立','友情已形成，便可不再互相回應彼此想法'],['案例重點是持續真誠投入。','互信在持續互動中逐漸建立。','友誼也需要延續關心。']],
  [['說平台能助認識人，友情可按搜尋次數估算','說平台能提供私訊，關心由會員自行想像','說平台能增加聯絡，便可保證部分人交友'],['搜尋次數不是友誼品質的尺度。','真誠互動不能由工具單獨提供。','平台無法預先保證具體會員交友結果。']],
  [['群組方便聯絡，傾聽安排可留給有事者','持續傾聽有用，網上聯絡入口則較少必要','兩種措施並存，信任可由群組規則代替'],['支援設計應讓有需要者獲得真實回應。','網上入口也能增加接觸機會。','規則不能代替相互理解與持續關心。']],
];
plausibleAlternatives.forEach(([options,reasons],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...reasons);});
export default {
  key:'opinion:23',
  meta:{topic:'網上接觸、孤單與真正友誼',summary:'作者完全反對網上溝通能保證人人不孤單、總能交朋友。平台可增加接觸機會，但淺層互動未必提供情感支持；交友仍需社交自信、安全、信任及雙方長期投入。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
