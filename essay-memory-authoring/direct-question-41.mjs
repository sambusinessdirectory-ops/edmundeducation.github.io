// Full source-specific memorisation support for Direct Question 41.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-41-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:41'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In the last fifty years, technology has changed childhood from an experience based mostly on nearby people and places into one shaped by screens, computer choices and quick messages.',
  'This gives children easy ways to get things and find information, but it also causes problems for society and families.',
  'For society, the biggest problem is that children may become less good at dealing with people and handling feelings.',
  'In the past, many children learned to wait, work together and give way through games outside and activities with neighbours.',
  'But a child who spends most spare time on a phone may miss the hard parts of talking to people in person, such as understanding faces and settling arguments.',
  'After a while, this may lead to young people who feel less sure when talking and less able to handle disagreements.',
  'Technology also makes children face the kinds of pressure adults face before they are ready.',
  'Social media and online shows often make changed pictures of bodies, expensive ways of living and contests for attention look like everyday life.',
  'A child who keeps comparing himself with popular people online may start deciding how good he is by his looks, the attention he gets and the likes he receives.',
  'This can increase worry and make children feel bad about themselves, so they may know many people online but still feel unsafe and lonely.',
  'At home, the clearest problem is that family members talk less in a way that matters.',
  'Even if parents and children sit in the same room, each person’s screen can draw them into a different world.',
  'People talk less at meals, conversations end sooner and parents may not see that their children feel different.',
  'Also, it is harder for parents to guide children because they now have to set rules about screen time, friends online and material children should not see.',
  'These rules can easily cause fights and a loss of trust, especially when children think parents are entering their private online world.',
  'So home may feel less like a place where parents help children and more like a place where both sides fight over who makes the rules.',
  'To sum up, modern technology can hurt society by making children less able to deal with people and feelings.',
  'It can also hurt families by cutting down real conversation and making it harder for parents to guide children.',
];
const vocabulary=[
  [['Over the last half-century','In the last fifty years','過去半世紀'],['mostly local experience','experience based mostly on nearby people and places','主要在本地生活'],['algorithms','computer choices','演算法'],['instant communication','quick messages','即時通訊']],
  [['convenience','easy ways to get things','便利'],['access to information','find information','取得資訊'],['creates problems','causes problems','造成問題'],['family life','families','家庭生活']],
  [['At the social level','For society','社會層面'],['interpersonal','dealing with people','人際'],['emotional skills','handling feelings','情緒能力'],['weaker','less good','較弱']],
  [['patience','to wait','耐性'],['cooperation','work together','合作'],['compromise','give way','妥協'],['outdoor games','games outside','戶外遊戲'],['neighbourhood activities','activities with neighbours','社區活動']],
  [['By contrast','But','相比之下'],['most free time','most spare time','大部分空閒時間'],['real interaction','talking to people in person','真實互動'],['reading facial expressions','understanding faces','讀懂表情'],['resolving disagreements','settling arguments','解決分歧']],
  [['Over time','After a while','長遠而言'],['produce young people','lead to young people','形成一批年輕人'],['less confident in conversation','less sure when talking','交談缺自信'],['less comfortable with conflict','less able to handle disagreements','不善處理衝突']],
  [['exposes children','makes children face','使孩子接觸'],['adult pressures','the kinds of pressure adults face','成人壓力'],['too early','before they are ready','過早']],
  [['Social media','Social media','社交媒體'],['online entertainment','online shows','網上娛樂'],['edited bodies','changed pictures of bodies','修飾身材影像'],['luxurious lifestyles','expensive ways of living','奢華生活'],['popularity contests','contests for attention','人氣競爭'],['normal life','everyday life','正常生活']],
  [['constantly compares himself','keeps comparing himself','不斷比較自己'],['influencers','popular people online','網紅'],['measure his own worth','deciding how good he is','衡量自我價值'],['appearance','his looks','外貌'],['attention and likes','the attention he gets and the likes he receives','關注與讚好']],
  [['feed anxiety','increase worry','助長焦慮'],['low self-esteem','feel bad about themselves','低自尊'],['connected to thousands online','know many people online','網上連繫眾多人'],['insecure and alone','unsafe and lonely','不安與孤單']],
  [['Within the family','At home','在家庭內'],['clearest problem','clearest problem','最明顯問題'],['loss of meaningful communication','family members talk less in a way that matters','有意義溝通減少']],
  [['Even when','Even if','即使'],['sitting in the same room','sit in the same room','坐在同室'],['separate screens','each person’s screen','各自螢幕'],['pull them into separate worlds','draw them into a different world','帶進各自世界']],
  [['Meals become quieter','People talk less at meals','餐桌更安靜'],['conversations become shorter','conversations end sooner','對話變短'],['fail to notice','not see','未察覺'],['changes in their children’s mood','their children feel different','孩子情緒變化']],
  [['In addition','Also','此外'],['parental authority','parents to guide children','父母管教'],['control screen time','set rules about screen time','管理螢幕時間'],['online friendships','friends online','網上交友'],['unsuitable content','material children should not see','不宜內容']],
  [['lead to arguments','cause fights','導致爭吵'],['mistrust','a loss of trust','失去信任'],['invading','entering','侵犯'],['private digital space','private online world','私人數碼空間']],
  [['As a result','So','結果'],['place of guidance','place where parents help children','引導的地方'],['battlefield of control','place where both sides fight over who makes the rules','控制權爭奪']],
  [['In conclusion','To sum up','總結'],['weaken society','hurt society','削弱社會'],['damaging children’s social skills','making children less able to deal with people','損害社交能力'],['emotional health','feelings','情緒健康']],
  [['harm family life','hurt families','損害家庭生活'],['reducing real conversation','cutting down real conversation','減少真正對話'],['parental guidance harder','harder for parents to guide children','父母較難引導']],
];
const chunkOverrides=[
  ['Over the last half-century,','technology has changed childhood','from a mostly local experience','into one shaped by screens, algorithms and instant communication.'],
  ['While this gives children convenience','and access to information,','it also creates problems','for both society and family life.'],
  ['At the social level,','the main problem is that children','may develop weaker interpersonal and emotional skills.'],
  ['In the past, many children learned patience,','cooperation and compromise','through outdoor games and neighbourhood activities.'],
  ['By contrast, a child who spends most free time','on a phone may avoid the difficulties','of real interaction, such as reading facial expressions','or resolving disagreements.'],
  ['Over time, this can produce young people','who are less confident in conversation','and less comfortable with conflict.'],
  ['Technology also exposes children','to adult pressures too early.'],
  ['Social media and online entertainment','often present edited bodies, luxurious lifestyles','and popularity contests','as if they were normal life.'],
  ['A child who constantly compares himself with influencers','may begin to measure his own worth','through appearance, attention and likes.'],
  ['This can feed anxiety and low self-esteem,','creating a generation that is connected to thousands online','but still feels insecure and alone.'],
  ['Within the family,','the clearest problem is the loss','of meaningful communication.'],
  ['Even when parents and children are sitting','in the same room, separate screens','can pull them into separate worlds.'],
  ['Meals become quieter, conversations become shorter','and parents may fail to notice','changes in their children’s mood.'],
  ['In addition, technology makes parental authority more difficult','because parents must now control screen time,','online friendships and unsuitable content.'],
  ['These rules can easily lead to arguments and mistrust,','especially when children feel that parents','are invading their private digital space.'],
  ['As a result, the home may become','less like a place of guidance','and more like a battlefield of control.'],
  ['In conclusion, modern technology can weaken society','by damaging children’s social skills','and emotional health.'],
  ['It can also harm family life','by reducing real conversation','and making parental guidance harder.'],
];
const simpleChunkOverrides=[
  ['In the last fifty years,','technology has changed childhood','from an experience based mostly on nearby people and places','into one shaped by screens, computer choices and quick messages.'],
  ['This gives children easy ways to get things','and find information,','but it also causes problems for society and families.'],
  ['For society, the biggest problem is that children','may become less good at dealing with people and handling feelings.'],
  ['In the past, many children learned to wait,','work together and give way','through games outside and activities with neighbours.'],
  ['But a child who spends most spare time on a phone','may miss the hard parts of talking to people in person,','such as understanding faces and settling arguments.'],
  ['After a while, this may lead to young people','who feel less sure when talking','and less able to handle disagreements.'],
  ['Technology also makes children face','the kinds of pressure adults face before they are ready.'],
  ['Social media and online shows often make','changed pictures of bodies, expensive ways of living','and contests for attention look like everyday life.'],
  ['A child who keeps comparing himself with popular people online','may start deciding how good he is','by his looks, the attention he gets and the likes he receives.'],
  ['This can increase worry and make children feel bad about themselves,','so they may know many people online','but still feel unsafe and lonely.'],
  ['At home, the clearest problem is that','family members talk less in a way that matters.'],
  ['Even if parents and children sit in the same room,','each person’s screen can draw them','into a different world.'],
  ['People talk less at meals, conversations end sooner','and parents may not see','that their children feel different.'],
  ['Also, it is harder for parents to guide children','because they now have to set rules about screen time,','friends online and material children should not see.'],
  ['These rules can easily cause fights and a loss of trust,','especially when children think parents are entering','their private online world.'],
  ['So home may feel less like a place','where parents help children','and more like a place where both sides fight over who makes the rules.'],
  ['To sum up, modern technology can hurt society','by making children less able to deal','with people and feelings.'],
  ['It can also hurt families','by cutting down real conversation','and making it harder for parents to guide children.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Over ten years, online learning has changed study from a room-based experience into one shaped by video and shared files.','以 from ... into ... 比較童年前後形態',[1,3,15],fixed(0,'Over [時間], [科技] has changed [童年] from [以本地為主的經驗] into [螢幕演算法與即時通訊塑造的經驗].','引言用前後對比界定半世紀來的童年轉變。','題目問科技如何影響童年，要先用具體舊新形態開篇時。',['Over ', ', ', ' has changed ', ' from ', ' into '],['變化歷時','促成變化的力量','改變的生活階段','原來的生活形態','現在的生活形態'])),
  card('While the app helps students find answers, it also creates problems for both classroom discussion and independent thinking.','以 While ... also ... 承認便利並預告代價',[0,6,16],fixed(1,'While [便利與資訊] , [科技] also creates problems for both [社會] and [家庭生活].','承認資訊便利，同時引出社會及家庭兩個回答面向。','引言不能只批評科技，需先承認好處再清楚列出雙問題時。',['While ', ', it also creates problems for both ', ' and '],['科技帶來的好處','第一個受影響層面','第二個受影響層面'])),
  card('At the social level, the main problem is that teenagers may develop weaker teamwork and emotional skills.','以 At the social level 指明第一分析層面',[1,6,10],fixed(2,'At the social level, the main problem is that [兒童] may develop [較弱的人際與情緒能力].','第一主體段先界定社會層面的主要問題。','要分開社會與家庭影響，先提出社會層面的能力風險時。',['At the social level, the main problem is that ', ' may develop '],['受影響的群體','可能弱化的能力'])),
  card('In the past, pupils learned teamwork through playground games and local clubs.','以 In the past ... through 說明舊式能力練習',[2,4,7],fixed(3,'In the past, [兒童] learned [耐心合作妥協] through [戶外與社區活動].','真實遊戲提供練習等候、合作和讓步的場合。','已提出社交技能弱化，要回看過去兒童在哪些活動中練習能力時。',['In the past, ', ' learned ', ' through '],['當年參與的人','曾練習的能力','提供練習的活動'])),
  card('By contrast, a teenager who stays on an app may avoid the difficulties of face-to-face practice, such as reading expressions or settling disputes.','以 By contrast 和 such as 對照手機與真人互動',[3,5,8],fixed(4,'By contrast, [大部分空閒時間用手機的孩子] may avoid [真人互動的難處], such as [讀表情] or [解決分歧].','對照舊式戶外活動，指出手機使兒童少練習真實互動。','過去的能力練習已列出，需說明現在手機使用如何減少同類練習時。',['By contrast, ', ' may avoid the difficulties of ', ', such as ', ' or '],['手機使用情境','被迴避的真人互動','第一項互動技能','第二項互動技能'])),
  card('Over time, this can produce pupils who are unsure in groups and uncomfortable with disagreement.','以 Over time ... produce 推出長期能力後果',[4,7,9],fixed(5,'Over time, this can produce [年輕人] who are [交談時較缺自信] and [較不適應衝突].','少了真人互動練習，長遠可能更難談話和處理衝突。','已描述手機如何減少練習，要推論累積後對年輕人的影響時。',['Over time, this can produce ', ' who are ', ' and '],['受長期影響的人','交談上的後果','面對衝突的後果'])),
  card('Online learning also exposes young pupils to adult pressures too early.','以 also 引入第二種社會問題：過早成人化壓力',[2,5,7],fixed(6,'[科技] also exposes [兒童] to [成人壓力] too early.','社會問題第二條線由社交技能轉向比較、焦慮和自我價值。','已談真人互動能力，還要提出兒童接觸不適齡壓力的另一問題時。',[' also exposes ', ' to ', ' too early.'],['帶來接觸的科技','受影響的兒童','不適齡的壓力'])),
  card('Social apps often present edited photos and luxury trips as if they were ordinary daily life.','以 as if 揭示網上內容被呈現為日常的錯覺',[6,8,9],fixed(7,'[社交媒體與網上娛樂] often present [修飾身材奢華生活與人氣競爭] as if they were [普通生活].','網上精選影像被當成常態，為兒童自我比較鋪路。','要說清成人壓力從何而來，需指出平台展示的內容與假常態時。',[' often present ', ' as if they were '],['展示內容的平台','被精選或修飾的畫面','被錯認成的日常'])),
  card('A child who repeatedly compares himself with online stars may begin to measure his own worth through looks and likes.','以 who ... may ... through 說明比較如何扭曲自我價值',[7,9,10],fixed(8,'A child who [不斷與網紅比較] may begin to measure his own worth through [外貌關注與讚好].','平台的假常態令兒童用外在數字評估自己。','平台內容已描述，需說明孩子如何把它內化成自我評價時。',['A child who ', ' may begin to measure his own worth through '],['觸發比較的行為','用來衡量自己的外在指標'])),
  card('This can feed worry and shame, creating a group that has many online contacts but still feels lonely.','以 creating ... but ... 推出焦慮與聯繫反差',[6,8,11],fixed(9,'This can feed [焦慮與低自尊], creating [線上連繫很多人] but still [感到不安孤單].','比較帶來情緒傷害，線上連結數量也不等於安全與陪伴。','孩子已開始用讚好衡量自己，要說明心理後果與網上連結的反差時。',['This can feed ', ', creating ', ' but still '],['被助長的心理問題','表面上的社交連結','實際的內心感受'])),
  card('Within the family, the clearest problem is the loss of relaxed conversation.','以 Within the family 清楚切換家庭層面',[2,9,12],fixed(10,'Within the family, the clearest problem is the loss of [有意義溝通].','第二主體段由社會影響轉入家庭互動。','社會層面的兩個問題已寫完，要明確開始家庭層面分析時。',['Within the family, the clearest problem is the loss of '],['家庭正在失去的互動'])),
  card('Even when relatives share one table, separate phones can pull them into separate conversations.','以 Even when ... separate ... 對照身體同室與注意力分離',[10,12,13],fixed(11,'Even when [父母與孩子同室], [各自螢幕] can pull them into [各自世界].','一家人身處同一房間，注意力仍被不同螢幕分開。','已提出家庭溝通減少，要給出「人在一起卻沒有交談」的具體機制時。',['Even when ', ', ', ' can pull them into '],['身體上同在的情況','拉走注意力的螢幕','精神上分離的結果'])),
  card('Meals become silent, talks become brief and parents may fail to notice signs of sadness.','以三個並列後果呈現家庭對話縮短',[10,11,14],fixed(12,'[用餐] become [更安靜], [對話] become [更短] and [父母] may fail to notice [孩子情緒變化].','同室卻各看螢幕會使餐桌安靜，亦使父母難察覺情緒。','同室分心的機制已說明，要列出家庭日常可觀察的後果時。',[' become ', ', ', ' become ', ' and ', ' may fail to notice '],['第一個家庭場合','第一項變化','第二種互動','第二項變化','未察覺的家長','被忽略的訊號'])),
  card('In addition, online life makes parenting more difficult because adults must now control hours, contacts and unsafe material.','以 because 說明父母管教變難的原因',[10,12,14],fixed(13,'In addition, [科技] makes [父母管教] more difficult because [家長] must now control [螢幕時間網友與不宜內容].','家庭問題第二條線是家長須管理新的數碼邊界。','家庭談話已分析，需轉入父母為何更難引導孩子時。',['In addition, ', ' makes ', ' more difficult because ', ' must now control '],['造成新難題的科技','受影響的管教','需處理問題的父母','必須管理的數碼範圍'])),
  card('These rules can easily lead to disputes and mistrust, especially when teenagers feel their online space is being watched.','以 especially when 說規則如何引發衝突',[13,15,16],fixed(14,'These rules can easily lead to [爭吵與不信任], especially when [孩子覺得家長侵犯私人數碼空間].','家長的保護規則可能被孩子解讀成入侵私隱。','已列家長要設的規則，需說明規則如何變成親子衝突時。',['These rules can easily lead to ', ', especially when '],['規則造成的關係後果','孩子特別容易反感的情境'])),
  card('As a result, home may become less like a place of support and more like a contest over rules.','以 less like ... more like ... 總結家庭氣氛轉變',[11,13,14],fixed(15,'As a result, [家] may become less like [提供引導的地方] and more like [控制權戰場].','規則衝突累積後，家庭由支持場域變成爭奪控制的地方。','數碼管教的爭吵已說明，要概括整體家庭氣氛的變化時。',['As a result, ', ' may become less like ', ' and more like '],['受影響的家庭','原應提供的作用','衝突後的形態'])),
  card('In conclusion, online technology can weaken society by damaging children’s conversation skills and wellbeing.','以 by ... and ... 收束社會兩項後果',[2,9,17],fixed(16,'In conclusion, [現代科技] can weaken [社會] by damaging [兒童社交能力] and [情緒健康].','結論先統合社會層面：社交能力與情緒健康。','末段須先重述社會層面兩條論證線時。',['In conclusion, ', ' can weaken ', ' by damaging ', ' and '],['造成影響的科技','受影響的社會','第一項能力','第二項健康'])),
  card('It can also harm family life by reducing shared meals and making parenting harder.','以 It can also ... by ... and ... 收束家庭兩項後果',[10,13,16],fixed(17,'It can also harm [家庭生活] by reducing [真正對話] and making [父母引導] harder.','結論再統合家庭層面：對話減少與管教更難。','社會後果已總結，須補上家庭後果才能完整回答題目時。',['It can also harm ', ' by reducing ', ' and making ', ' harder.'],['受影響的家庭','失去的溝通','變難的父母工作'])),
];
const usageRules=[
  '要用 from ... into ... 對照一段時間前後的生活模式變化時。',
  '承認一項好處後，還需指出它在兩個層面造成問題時。',
  '題目涉及多個層面，需要先限定目前討論哪一層面時。',
  '要說明某項能力原先從甚麼活動中學得，為與現況對照時。',
  '先寫舊式活動後，要以 By contrast 對照新行為如何減少練習時。',
  '已描述一種持續行為，需推論它長期對某群人能力的影響時。',
  '一項風險已分析，還需用 also 另提不同種類的風險時。',
  '要指出經挑選的畫面或例子被誤當成日常常態時。',
  '要追蹤反覆比較如何改變一個人的自我評價標準時。',
  '要用 but still 對照外在連結與內心感受不一致時。',
  '討論完一個層面，要用範圍短語清楚切換到另一層面時。',
  '要用 Even when 表達外在條件看似充分，卻未必帶來預期結果時。',
  '要把某行為的幾個可觀察後果並列，並指出可能漏看的訊號時。',
  '要用 because 解釋某種角色責任為何因新增管理事項而變難時。',
  '已列明規則，要用 especially when 解釋何時特別容易引起衝突時。',
  '要用 less like ... more like ... 比較原本功能與變化後的氣氛時。',
  '結論要按同一層面，收束兩種相互關聯的損害時。',
  '已總結第一層面，還需用 also 補回另一層面的兩項後果時。',
];
structures.forEach((row,i)=>{row.frame.usage=usageRules[i];});
const wrongReasons=[
  ['這句承認便利並預告代價，未對比童年的前後形態。','這句列過去的學習場合，沒有 from ... into ... 的轉變。','這句總結家庭氣氛，原句是引言中半世紀童年的轉變。'],
  ['這句只介紹童年形態轉變，未兼顧便利與兩層問題。','這句另提過早成人壓力，沒有 While 的讓步框架。','這句在結論收束社會問題，原句在引言預告社會與家庭。'],
  ['這句在引言並列社會和家庭，未聚焦社會技能。','這句轉入成人壓力，是社會段的第二條論點。','這句開啟家庭段，不是社會層面的技能風險。'],
  ['這句提出社會能力風險，未回顧以往的練習方式。','這句對照手機使用，原句先說舊式戶外學習。','這句列網上影像，未用 In the past ... through 說能力練習。'],
  ['這句說舊式戶外練習，原句以 By contrast 轉向手機。','這句推論長期後果，未列真人互動的具體難處。','這句說網紅比較，非真人交流中讀表情和解分歧。'],
  ['這句分析孩子手機使用方式，尚未推論累積後果。','這句提出另一種過早成人壓力，未談交談和衝突能力。','這句以 creating 談焦慮與孤單，非社交練習長期後果。'],
  ['這句先提出社會層面的技能問題，未開第二條成人壓力線。','這句已列平台呈現的內容，原句先說壓力種類。','這句呈現童年轉變，非成人壓力的過早接觸。'],
  ['這句只指出壓力，未展示被當成日常的網上畫面。','這句說孩子用讚好量度自己，原句先描述平台內容。','這句說情緒後果，沒有 as if they were 的錯覺。'],
  ['這句描述網上內容，尚未說孩子如何評估自身價值。','這句說焦慮孤單的後果，原句聚焦比較與量度。','這句開啟家庭溝通問題，不是網紅比較。'],
  ['這句只說過早成人壓力，未寫焦慮與線上孤單反差。','這句是量度自我價值的機制，原句推到情緒後果。','這句說家庭的注意力分散，非網上連結數與孤單的反差。'],
  ['這句在社會段提出人際能力問題，並非家庭段的轉折。','這句在社會段收束心理後果，未轉入家庭互動。','這句給出同室各看螢幕的具體機制，原句先立家庭主張。'],
  ['這句提出家庭問題，未呈現同室卻各進不同世界的反差。','這句列餐桌等後果，沒有 Even when 的讓步對照。','這句講家長管教的新挑戰，而非注意力分離。'],
  ['這句提出家庭溝通減少，未列餐桌、對話、察覺情緒三項後果。','這句展示同室分心，原句再說可觀察的家庭後果。','這句說規則引起爭吵，非日常對話縮短。'],
  ['這句提出溝通問題，沒有 because 的父母管教原因。','這句列家庭談話後果，未說家長要管理的數碼邊界。','這句說規則的關係後果，原句先說規則為何增加。'],
  ['這句說家長須設的規則，原句接著分析規則引發的衝突。','這句已總結家庭氣氛，未用 especially when 分析衝突情境。','這句在結論總結社會後果，非家庭規則爭吵。'],
  ['這句說同室分心的機制，未總結家庭由引導走向控制。','這句分析管教為何變難，沒有 less like ... more like ...。','這句說規則衝突，原句推到整體家庭氣氛。'],
  ['這句是社會段的人際技能主張，原句在結論同時重述情緒健康。','這句談焦慮孤單，未用結論框架收束兩項社會後果。','這句總結家庭，原句先總結社會。'],
  ['這句提出家庭對話問題，尚未在結論同時收束管教困難。','這句解釋父母管教變難的原因，未整合家庭兩項後果。','這句總結社會層面的能力與情緒，原句補上家庭層面。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清社會與家庭兩層，再依段內原因與後果排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分析科技對兒童所帶來的哪兩個層面問題？',[
    '社會層面的成長，以及家庭內部的互動',
    '只有網上購物價格，毋須討論兒童成長',
    '只有父母的工作收入，毋須討論家庭互動',
    '只有遊戲公司的利潤，毋須討論社會影響',
  ],'範文分社會和家庭兩段，各自提出兩條問題線。'),
  {type:'multi',prompt:'選出範文的兩組主要影響',detail:'選兩項，再按「確認」。',options:[
    '社交能力減弱與網上比較造成的情緒壓力',
    '家庭對話減少與數碼管教引起的衝突',
    '所有孩子一使用手機便立即失去說話能力',
    '科技已讓所有父母不再需要引導孩子',
  ],correct:[0,1],why:'社會線談能力與心理，家庭線談溝通與管教。'},
];
const route=[sequence('依文章次序排列四段的工作',[
  ['引言界定轉變','童年由本地活動走向螢幕，同時帶來便利和問題。'],
  ['社會影響','真人互動練習減少，網上比較也傷害情緒健康。'],
  ['家庭影響','螢幕令對話變少，數碼規則引起爭吵和不信任。'],
  ['結論雙線收束','社會的能力與情緒問題，家庭的對話與管教問題。'],
],'兩個主體段分別回答社會和家庭，結論按同一順序收束。')];
const evidence=[
  quiz('戶外遊戲和社區活動在論證中提供甚麼？',[
    '孩子練習耐心、合作與妥協的舊式場合',
    '孩子完全避開所有真人互動的主要方法',
    '社交媒體展示修飾身材的唯一技術來源',
    '家長管理網上內容和螢幕時間的具體規則',
  ],'這些舊式活動要求孩子與其他人面對面相處。'),
  quiz('孩子常看手機，可能少練習哪兩種互動？',[
    '讀懂別人的表情，並在意見不同時解決分歧',
    '在網上按讚，並把精選照片當成正常生活',
    '學習所有演算法，並長時間觀看螢幕畫面',
    '計算家庭支出，並替父母選擇工作地點',
  ],'範文用讀表情與解分歧說明真實互動的難處。'),
  quiz('平台把哪些內容呈現得像正常生活？',[
    '修飾過的身材影像、奢華生活和人氣競爭',
    '戶外遊戲、鄰里合作和孩子親自解決分歧',
    '家長與孩子長時間專心談話的家庭晚餐',
    '學校正常上課所需的紙筆和課堂練習',
  ],'這些經挑選或修飾的畫面會影響孩子的比較基準。'),
  quiz('孩子不斷與網紅比較，作者指出甚麼評價變化？',[
    '開始用外貌、關注度和讚好衡量自己的價值',
    '開始只用耐心、合作和妥協衡量網紅外貌',
    '開始不再接觸任何網上內容或外在評價',
    '開始只根據家人的用餐時間計算自己的價值',
  ],'平台假常態進一步變成兒童評價自己的標準。'),
  quiz('同室各看螢幕的例子如何推到家庭後果？',[
    '餐桌更安靜、對話更短，父母也可能漏看情緒變化',
    '家庭成員同室，便保證每次都能深入交談',
    '只要各看螢幕，孩子就不會有任何情緒變化',
    '父母只需收起餐具，便可解決所有溝通問題',
  ],'作者從注意力分離推到可觀察的家庭互動變化。'),
  quiz('家長為何更難引導孩子使用科技？',[
    '須管理螢幕時間、網上交友與不適合的內容',
    '孩子從來不接觸螢幕或任何網上朋友關係',
    '只要有家庭晚餐，所有網上規則便不再需要',
    '家長只需選擇手機外觀，毋須了解網上內容',
  ],'新增的數碼邊界使家長要制定規則並面對反感。'),
  quiz('家庭何以像「控制權戰場」？',[
    '規則令孩子覺得私隱受侵犯，可能引起爭吵和不信任',
    '父母不再需要管理螢幕時間，孩子也不會有不同意見',
    '親子雙方只要身處同室，就必定沒有任何數碼爭議',
    '所有家庭只因社區遊戲減少，便立即停止任何交談',
  ],'這個比喻收束數碼規則與親子關係的摩擦。'),
];
const logic=[
  sequence('社會層面的兩條影響',[
    ['能力主張','孩子的人際與情緒能力可能較弱。'],
    ['舊式練習','戶外和社區活動練習耐心、合作及讓步。'],
    ['手機取代互動','少讀表情，少解決真人分歧。'],
    ['成人壓力','網上精選身材、奢華生活和人氣被當作正常。'],
    ['比較與情緒','外貌讚好成為自我標準，帶來焦慮和孤單。'],
  ],'範文先論證真人互動練習減少，再分析網上比較帶來的心理傷害。'),
  sequence('家庭層面的兩條影響',[
    ['溝通主張','家庭失去有意義的對話。'],
    ['同室分心','各自螢幕把父母孩子帶入不同世界。'],
    ['日常後果','飯桌安靜、對話縮短、情緒變化難察覺。'],
    ['管教邊界','家長要管理時間、網友及不宜內容。'],
    ['關係後果','規則引發爭吵與不信任，家像控制權戰場。'],
  ],'先是對話減少，再是規則衝突；兩者都屬家庭問題，但機制不同。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一所學校打算把所有小息改成個人平板時間，教師擔心孩子少了合作練習。','哪項最能轉用範文的舊式活動論證？',[
    '保留集體遊戲，讓孩子練習等候、合作與讓步',
    '取消所有同伴活動，讓孩子只用平板獨自玩',
    '只計算平板售價，不觀察孩子如何與人相處',
    '只讓孩子觀看遊戲影片，不安排真人一起玩',
  ],['原文說戶外遊戲和社區活動提供耐心、合作、妥協的練習。','會減少練習。','價格不答社交能力。','觀看不等於互動。'],[2,3,4],'範文把戶外遊戲與社區活動連到孩子的耐心、合作和妥協能力。'),
  transfer('家長說孩子在網上有很多朋友，但一遇到同學意見不同就不知道如何談下去。','哪項最貼近範文的真人互動問題？',[
    '多安排面對面相處，練習讀表情和處理分歧',
    '只增加網上聯絡數量，不必練習真人對話',
    '只看孩子有多少網友，便斷定衝突能力良好',
    '讓孩子永遠避開不同意見，毋須面對分歧',
  ],['原文指出手機可能令兒童避開讀表情與化解分歧的難處。','網友數不是練習。','不能如此推定。','避免不會培養能力。'],[3,4,5],'範文由少練真人互動推到交談缺自信和不適應衝突。'),
  transfer('一名學生看到網紅每天展示豪宅、修圖照片和大量讚好，開始覺得自己不夠好。','哪項最能使用範文的比較機制？',[
    '指出畫面經挑選，避免把外貌與讚好當成自我價值',
    '只看讚好數字，便可準確知道每個人的全部價值',
    '把修飾照片當作正常生活，要求自己日日達到',
    '只要網紅受歡迎，學生便必然沒有任何情緒壓力',
  ],['原文說平台的精選畫面會讓孩子用外在數字量度自己。','自我價值不等於數字。','加深比較。','情緒壓力是原文風險。'],[7,8,9],'範文把修飾影像的假常態、網紅比較與焦慮低自尊連起來。'),
  transfer('青年中心準備一堂社交媒體課，只教孩子如何增加追蹤者。','哪項補充最能回應範文的情緒風險？',[
    '討論外貌比較、讚好壓力，以及網上熱鬧與孤單的反差',
    '只教購買追蹤者，不問孩子是否因此感到焦慮不安',
    '只要求孩子每日檢查讚好，毋須談自己的價值與感受',
    '只列網紅收入，不問精選畫面是否代表真實日常生活',
  ],['原文的風險是外在比較導致焦慮、低自尊和孤單。','忽略壓力。','加深依賴。','未談假常態。'],[7,8,9],'範文指出網上可連繫很多人，孩子卻可能仍感到不安孤單。'),
  transfer('一家四口每晚同桌吃飯，但每人看自己的手機，最近談話愈來愈少。','哪項最貼近範文的家庭溝通分析？',[
    '同桌不等於有交流，分開的螢幕會讓對話變短',
    '一家人既然同桌，便必定能察覺所有情緒變化',
    '只要飯菜準時上桌，手機便不可能影響家庭談話',
    '每個人多看一塊螢幕，對話便必然更加深入',
  ],['原文以同室各看螢幕解釋有意義溝通如何流失。','同室不保證溝通。','飯菜時間非關鍵。','與例子相反。'],[10,11,12],'範文說即使父母孩子同室，各自螢幕仍可把他們拉入不同世界。'),
  transfer('家長發現孩子近來情緒低落，但用餐時各人都在看手機，未曾好好交談。','哪項最能運用範文的連鎖後果？',[
    '減少用餐分心，增加談話以留意孩子的情緒變化',
    '只要孩子有手機，家長便不用再關心情緒變化',
    '把用餐對話完全取消，情緒問題便會自己消失',
    '只統計手機耗電量，不理親子談話是否減少',
  ],['原文連結餐桌安靜、對話縮短與家長漏看情緒。','忽略訊號。','會加深問題。','耗電非關鍵。'],[11,12],'範文說餐桌變安靜、對話變短，父母可能察覺不到孩子的情緒。'),
  transfer('學校建議家長訂立螢幕時間和不宜內容規則，但孩子說家長在侵犯私隱。','哪項最能解釋親子衝突的形成？',[
    '家長要管理新數碼邊界，孩子卻可能把規則看作入侵',
    '家長一設規則，孩子便必然不再接觸任何網上內容',
    '孩子提出私隱問題，就代表所有不宜內容都不存在',
    '只要有螢幕規則，家庭便必定不再發生任何爭執',
  ],['原文指出管理網友與內容的規則可能被孩子視為侵犯。','不合因果。','私隱不等於內容安全。','與原文相反。'],[13,14],'範文由家長管理螢幕和內容，推到孩子覺得私人數碼空間受侵犯。'),
  transfer('社工評估一個家庭：父母和孩子都覺得每天只是在爭奪誰有權決定手機規則。','哪項最貼近範文的家庭比喻？',[
    '家可能由提供引導的地方，變成爭奪控制權的場域',
    '家既有手機規則，便必然完全沒有任何引導功能',
    '只要父母提出意見，孩子就不需要任何私人空間',
    '所有家庭的衝突都只由手機外觀和價格造成',
  ],['原文用 less like ... more like ... 概括衝突累積後的家庭氣氛。','原文說可能，非必然。','忽略私隱。','原因是規則與信任。'],[13,14,15],'範文以引導之地與控制權戰場對比數碼規則帶來的家庭變化。'),
  transfer('政策報告只寫「兒童使用科技傷害家庭」，卻沒有解釋對社會的影響。','哪項補充最能保持範文的雙層結構？',[
    '加入真人互動能力減弱和網上比較傷害情緒的論證',
    '只列手機品牌與價格，不談孩子的真人社交能力',
    '只重複家庭管教困難，不再分析兒童的社會層面',
    '只談父母晚餐時間，不問孩子怎樣評價自己的價值',
  ],['範文社會段分別談社交技能和情緒健康。','無關。','仍缺社會。','仍缺網上比較。'],[2,3,4,7,8,9,16],'範文結論先總結社會的能力和情緒傷害，再總結家庭問題。'),
  transfer('教育局要寫兒童數碼生活指引，希望同時照顧社會能力和家庭關係。','哪項目標最完整地轉用範文？',[
    '增加真人互動，並讓家庭保留對話和清楚的數碼規則',
    '只增加網上好友，毋須處理家庭談話或親子衝突',
    '只限制家長說話，讓孩子單靠網紅建立自己的價值感',
    '只統計螢幕數量，毋須關注社交能力與家庭的信任',
  ],['原文兩段分談社交情緒與家庭溝通管教，政策也須覆蓋兩者。','漏家庭與真實互動。','增加比較風險。','數量非效果。'],[2,4,8,10,13,14,17],'範文結論並列社會能力情緒健康與家庭對話父母引導。'),
];
const revised=[
  {options:['保留集體遊戲，讓孩子練習等候、合作與讓步。','增加平板遊戲，合作練習留待正式上課時進行。','以平板售價評估小息安排，社交表現另行測量。','讓孩子觀看合作遊戲影片，減少真人練習。'],explanations:['面對面的活動提供即時協調與妥協機會。','只把合作留在課堂，會減少小息可用的練習。','價格不能直接反映孩子的社交學習。','觀看示範不等於實際與同伴協商。']},
  {options:['增加面對面相處，練習讀表情與處理分歧。','增加網上好友，讓孩子在訊息中熟悉不同意見。','先教孩子避開爭論，面對面交流留待年長後。','用網友數量評估社交能力，衝突情境較少觀察。'],explanations:['真人交流能練習非文字訊號和當面協商。','訊息交流未必涵蓋表情與即時回應。','避開分歧不會培養處理分歧的能力。','好友數量不能證明孩子懂得化解衝突。']},
  {options:['指出畫面經挑選，勿把外貌和讚好當自我價值。','增加觀看不同網紅，讓更多讚好數字可供比較。','教學生用同款濾鏡，縮小自己與網紅形象的差距。','用追蹤者數評估自信，再要求他改善外表。'],explanations:['識別精選畫面有助減少以外在數字自我比較。','增加比較對象未必減輕壓力。','模仿修飾畫面仍把它當成正常標準。','追蹤數不能可靠衡量人的價值或自信。']},
  {options:['談外貌比較、讚好壓力及熱鬧與孤單的反差。','教追蹤者增長技巧，情緒壓力留待個別求助。','每天記錄讚好數，藉數據比較同儕表現。','講網紅收入模式，少談畫面與真實生活的差別。'],explanations:['課程應直接處理題述比較與情緒風險。','只教增長技巧可能加重對數字的依賴。','數據比較未處理自我價值與焦慮。','收入知識不能取代辨識精選畫面。']},
  {options:['同桌不等於有交流，各看螢幕會使談話變少。','同桌用餐已提供陪伴，談話減少可稍後再觀察。','手機能帶來共同話題，故各自觀看也等於交流。','先調整用餐時間，螢幕分心則暫時維持原狀。'],explanations:['共同在場與有意義的交談是不同的。','題目已說對話變少，不能忽略。','各自觀看沒有形成彼此回應的共同話題。','時間安排不能直接解決注意力被螢幕分散。']},
  {options:['減少用餐分心並增加談話，留意孩子情緒變化。','保留手機用餐習慣，另以問卷追蹤孩子情緒。','把談心改成每月一次訊息，日常餐桌保持原狀。','家長先檢查手機使用量，情緒變化由學校處理。'],explanations:['恢復日常交流可讓家長更早察覺變化。','問卷可輔助，難替代持續的親子談話。','偶爾訊息不等於日常互動。','使用量與孩子的具體感受不完全相同。']},
  {options:['家長管理數碼邊界，孩子可能把規則視為入侵。','孩子談私隱，表示規則針對內容而非使用時間。','家長設定規則後，衝突主要來自網絡收費。','孩子擔心私隱，可推斷不宜內容已無風險。'],explanations:['雙方對安全與私人空間的看法不同，會形成衝突。','螢幕時間和內容規則都可能涉及數碼邊界。','題述分歧是規則與私隱，不是費用。','私隱訴求不能證明內容安全。']},
  {options:['家可能由引導場所變成爭奪控制權的場域。','家可維持引導作用，因手機規則已足夠清楚。','若孩子想要私隱，家長便可不再討論使用規則。','親子爭論主要由手機價格造成，與信任較無關。'],explanations:['規則與權限爭執可能逐漸改變家庭氣氛。','規則清楚不等於雙方已建立信任。','私隱與安全仍需要共同討論。','題目焦點是決策權和關係，不是設備價格。']},
  {options:['加入真人互動變少與網上比較傷害情緒的分析。','加入手機品牌資料，社會影響留待家庭部分處理。','擴寫父母管教困難，社會層面可由此自然推知。','加入用餐時段統計，孩子自我價值則較少討論。'],explanations:['社會段還需交代社交技能與情緒健康。','品牌資料不是兒童社會能力的證據。','家庭衝突不能自動代替社會層面的論證。','用餐時間未回答網上比較壓力。']},
  {options:['增真人互動，並保留家庭對話和清楚數碼規則。','增網上好友，家庭談話改為螢幕使用紀錄。','加強家長限制，孩子社交能力交由網上活動。','統計螢幕數量，家庭信任留待日後再評估。'],explanations:['指引同時覆蓋社交能力及家庭溝通與管教。','好友數及紀錄不能取代真人互動和對話。','只設限制會漏掉社交技能與信任。','設備數量不等於使用對關係的影響。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["While ","link","句型固定部分"],["this gives children convenience and access to information","slot","被承認的便利"],[", ","link","句型固定部分"],["it","slot","產生問題的事物"],[" also creates problems for both ","link","句型固定部分"],["society","slot","第一個受影響領域"],[" and ","link","句型固定部分"],["family life","slot","第二個受影響領域"],[".","link","句型固定部分"]];
structures[1].frame.formula="While [被承認的便利], [產生問題的事物] also creates problems for both [第一個受影響領域] and [第二個受影響領域].";
export default {key:'direct-question:41',meta:{topic:'科技對兒童的社會與家庭問題',summary:'螢幕生活可能減少真人互動並增加網上比較壓力；家庭則面對對話減少與數碼管教衝突。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
