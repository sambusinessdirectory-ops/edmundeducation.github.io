// Full source-specific memorisation support for Discuss Both Views 18.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-18-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:18'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People can learn at any age, and learning is still useful when they are older.',
  'Some people say that after age 65 people are too old to learn new things, but I strongly disagree.',
  'I think older people gain a great deal from learning because it keeps them thinking and helps them live on their own with more reason to enjoy life.',
  'One reason is that learning a new thing can help older people think more clearly and feel better.',
  'Many people who have stopped working suddenly lose the daily plan that work gave them, so their days can feel the same and empty.',
  'When they learn a language, how to play music, how to use computers or how to make things by hand, they are not just passing time; they are giving themselves something new to work out.',
  'This new task helps them pay attention, keep trying without rushing and work through problems, which may make them feel able to do things instead of feeling left behind.',
  'For example, an older person who joins an art class may feel unsure at first, but as they get better they may quietly feel proud of what they have done.',
  'In this way, learning is like turning on a light in a room that had slowly been getting dark.',
  'Another good thing is that new skills help older people keep in touch with life around them today.',
  'Life changes quickly, especially when new technology appears, and people who will not learn may need more and more help from others.',
  'If older people learn to use phones, manage money online or make video calls, they can speak with family, do everyday jobs and take part more fully in life with others nearby.',
  'This matters a lot; it helps them keep their self-respect.',
  'For example, a grandmother who learns video calls can talk with grandchildren in another country instead of feeling far away from them.',
  'Learning like this helps younger and older people stay close.',
  'To sum up, older people can always begin to learn.',
  'After 65, learning is not an extra treat; it is one of the best ways to keep feeling sure, doing things on your own and having goals that matter to you.',
];
const vocabulary=[
  [['does not stop at any fixed age','can learn at any age','任何年齡都可學'],['remains valuable','still useful','仍有價值'],['later life','when they are older','晚年']],
  [['While some people argue','Some people say','有人認為'],['people over 65','after age 65 people','65歲以上人士'],['acquire new knowledge or skills','learn new things','學新知技能'],['completely disagree','strongly disagree','完全不同意']],
  [['In my view','I think','在我看來'],['benefit greatly','gain a great deal','獲益良多'],['minds active','keeps them thinking','思維活躍'],['independent','live on their own','獨立'],['meaningful lives','more reason to enjoy life','有意義生活']],
  [['The first reason','One reason','第一原因'],['elderly people','older people','長者'],['mental and emotional lift','think more clearly and feel better','精神振奮']],
  [['retirees','people who have stopped working','退休人士'],['daily structure','daily plan','日常規律'],['work once provided','work gave them','工作曾提供'],['repetitive and empty','the same and empty','重複空洞']],
  [['musical instrument','how to play music','樂器'],['digital skill','how to use computers','數碼技能'],['craft','how to make things by hand','手藝'],['not merely filling time','not just passing time','不只是消磨時間'],['fresh challenge','something new to work out','新挑戰']],
  [['This kind of challenge','This new task','這種挑戰'],['concentration','pay attention','專注'],['patience','keep trying without rushing','耐心'],['problem-solving','work through problems','解難'],['feel capable','feel able to do things','感到有能力'],['forgotten','left behind','被遺忘']],
  [['For example','For example','例如'],['painting class','art class','繪畫班'],['shaky confidence','feel unsure','信心不足'],['over time','as they get better','隨時間'],['quiet source of pride','quietly feel proud','默默自豪']],
  [['In this sense','In this way','從這意義'],['light being switched on','turning on a light','開燈'],['growing dim','getting dark','漸暗']],
  [['Another important benefit','Another good thing','另一項好處'],['new skills','new skills','新技能'],['stay connected with modern society','keep in touch with life around them today','與現代社會保持聯繫']],
  [['The world changes quickly','Life changes quickly','世界變化快'],['technology','new technology','科技'],['refuse to learn','will not learn','拒絕學習'],['increasingly dependent on others','need more and more help from others','愈依賴別人']],
  [['senior citizens','older people','長者'],['smartphones','phones','智能手機'],['online banking','manage money online','網上銀行'],['video calls','video calls','視像通話'],['communicate with family','speak with family','與家人聯絡'],['manage daily tasks','do everyday jobs','處理日常事務'],['community life','life with others nearby','社區生活']],
  [['not a small advantage','matters a lot','非小好處'],['protects their dignity','helps them keep their self-respect','維護尊嚴']],
  [['For instance','For example','例如'],['video chat','video calls','視像聊天'],['grandchildren abroad','grandchildren in another country','海外孫兒女'],['feeling cut off','feeling far away','感到隔絕']],
  [['Such learning','Learning like this','這樣學習'],['bridge between generations','younger and older people stay close','跨代橋樑']],
  [['In conclusion','To sum up','總結'],['never too late','can always begin','永不太遲'],['older people','older people','長者']],
  [['not a luxury','not an extra treat','不是奢侈'],['preserve confidence','keep feeling sure','保有信心'],['independence','doing things on your own','保持獨立'],['sense of purpose','having goals that matter to you','人生目標感']],
];
const chunkOverrides=[
  ['Learning does not stop at any fixed age;','it remains valuable even in later life.'],
  ['While some people argue that people over 65','are too old to acquire new knowledge or skills,','I completely disagree.'],
  ['In my view, older people benefit greatly from learning','because it keeps their minds active','and allows them to live more independent, meaningful lives.'],
  ['The first reason is that learning something new','gives elderly people a strong mental and emotional lift.'],
  ['Many retirees suddenly lose the daily structure','that work once provided, so their days','can become repetitive and empty.'],
  ['When they learn a language, musical instrument,','digital skill or craft, they are not merely filling time;','they are giving their minds a fresh challenge.'],
  ['This kind of challenge encourages concentration, patience','and problem-solving, which can help them feel capable','rather than forgotten.'],
  ['For example, an older person who joins a painting class','may begin with shaky confidence,','but over time the process of improving','can become a quiet source of pride.'],
  ['In this sense, learning acts like a light','being switched on in a room','that had been growing dim.'],
  ['Another important benefit is that new skills','help older people stay connected with modern society.'],
  ['The world changes quickly, especially through technology,','and those who refuse to learn may become','increasingly dependent on others.'],
  ['If senior citizens learn how to use smartphones,','online banking or video calls, they can communicate with family,','manage daily tasks and participate more fully in community life.'],
  ['This is not a small advantage;','it protects their dignity.'],
  ['For instance, a grandmother who learns to use video chat','can speak to her grandchildren abroad','instead of feeling cut off from them.'],
  ['Such learning builds a bridge','between generations.'],
  ['In conclusion, it is never too late','for older people to learn.'],
  ['After 65, learning is not a luxury;','it is one of the best ways to preserve','confidence, independence and a sense of purpose.'],
];
const simpleChunkOverrides=[
  ['People can learn at any age,','and learning is still useful when they are older.'],
  ['Some people say that after age 65 people','are too old to learn new things,','but I strongly disagree.'],
  ['I think older people gain a great deal from learning','because it keeps them thinking','and helps them live on their own','with more reason to enjoy life.'],
  ['One reason is that learning a new thing','can help older people think more clearly and feel better.'],
  ['Many people who have stopped working suddenly lose','the daily plan that work gave them,','so their days can feel the same and empty.'],
  ['When they learn a language, how to play music,','how to use computers or how to make things by hand,','they are not just passing time;','they are giving themselves something new to work out.'],
  ['This new task helps them pay attention,','keep trying without rushing and work through problems,','which may make them feel able to do things','instead of feeling left behind.'],
  ['For example, an older person who joins an art class','may feel unsure at first, but as they get better','they may quietly feel proud of what they have done.'],
  ['In this way, learning is like turning on a light','in a room that had slowly been getting dark.'],
  ['Another good thing is that new skills','help older people keep in touch with life around them today.'],
  ['Life changes quickly, especially when new technology appears,','and people who will not learn may need','more and more help from others.'],
  ['If older people learn to use phones,','manage money online or make video calls,','they can speak with family, do everyday jobs','and take part more fully in life with others nearby.'],
  ['This matters a lot;','it helps them keep their self-respect.'],
  ['For example, a grandmother who learns video calls','can talk with grandchildren in another country','instead of feeling far away from them.'],
  ['Learning like this helps younger','and older people stay close.'],
  ['To sum up, older people can always','begin to learn.'],
  ['After 65, learning is not an extra treat;','it is one of the best ways to keep feeling sure,','doing things on your own and having goals','that matter to you.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Creativity does not stop at any fixed age; it remains valuable even in later life.','以 does not stop ... remains valuable ... 否定年齡界線',[1,2,15],fixed(0,'[學習] does not stop at any fixed age; it remains valuable even in [晚年].','開篇直接否定學習有固定截止年齡。','要先推翻某能力會因年齡到達界線就失效的假設時。',[' does not stop at any fixed age; it remains valuable even in '],['持續有價值的能力','較晚的人生階段'])),
  card('While some people argue that older workers cannot learn computers, I completely disagree.','以 While some argue ... I disagree ... 直接回應太遲論點',[0,2,15],fixed(1,'While some people argue that [65歲以上無法學新技能], I completely disagree.','作者明確反對年長就不能學新東西的判斷。','題目提出一項過度絕對的年齡限制，要直接標明不同意時。',['While some people argue that ', ', I completely disagree.'],['被反對的絕對主張'])),
  card('In my view, adults benefit greatly from walking because it keeps their bodies active and allows them to live more independently.','以 because ... and ... 說學習給精神及生活兩種好處',[1,3,9],fixed(2,'In my view, [長者] benefit greatly from [學習] because it [使思維活躍] and allows them to live [更獨立有意義].','引言提出心理活躍與自主生活兩條理由。','要表態某活動有益，並概括一項內在及一項生活成效時。',['In my view, ', ' benefit greatly from ', ' because it ', ' and allows them to live '],['受益的群體','帶來益處的活動','第一項內在作用','第二項生活成果'])),
  card('The first reason is that trying a new craft gives older adults a strong lift in mood and thinking.','以 first reason 建立新學習對精神情緒的好處',[2,4,9],fixed(3,'The first reason is that [學習新事物] gives [長者] [精神及情緒提振].','第一主體段先提出心理與情緒層面的好處。','要展開第一條論證，先說某活動帶給特定群體的內在改善時。',['The first reason is that ', ' gives ', ' a strong '],['帶來改變的活動','因此受益的群體','精神及情緒結果'])),
  card('Many workers suddenly lose a steady routine after retirement, so their days can become empty.','以 lose ... so ... 解釋退休後日常失去規律',[3,5,8],fixed(4,'Many [退休人士] suddenly lose [工作帶來的日常規律], so [日子] can become [重複空洞].','退休失去工作安排，可使每日變得單調。','要指出某生活變化使固定安排消失，從而產生空虛或重複感時。',['Many ', ' suddenly lose ', ', so ', ' can become '],['遇到轉變的人','失去的原有安排','受影響的生活','可能出現的狀態'])),
  card('When adults learn music or painting, they are not merely passing time; they are giving their minds a fresh challenge.','以 not merely ...; they are ... 重新界定學新事物',[4,6,7],fixed(5,'When [長者學語言、樂器、數碼或手藝], they are not merely [消磨時間]; they are giving their minds [新挑戰].','學習不是打發時間，而是讓思維重新工作。','要指出某活動看似填空檔，實際上還提供心智挑戰時。',['When ', ', they are not merely ', '; they are giving their minds '],['學習的具體活動','表面的用途','較深的作用'])),
  card('Such practice encourages patience and focus, which can help learners feel able rather than left behind.','以 which ... rather than ... 連接技能與自我感受',[5,7,8],fixed(6,'[新挑戰] encourages [專注、耐心與解難], which can help [長者] feel [有能力] rather than [被遺忘].','新的練習不只訓練思考，也改善對自身能力的看法。','要由活動培養的能力，進一步說它可能改善當事人的自我感受時。',[' encourages ', ', which can help ', ' feel ', ' rather than '],['正在做的挑戰','被培養的能力','因此受益的人','正面自我感受','原本的負面感受'])),
  card('For example, a beginner may begin with little confidence, but over time improvement can become a source of pride.','以 but over time 說從起初不確定到後來自豪',[6,8,13],fixed(7,'For example, [參加繪畫班的長者] may begin with [信心不足], but over time [進步過程] can become [自豪來源].','繪畫班例子把進步與信心恢復具體化。','要舉個案說初學者起步不穩，經持續進步後獲得自豪感時。',['For example, ', ' may begin with ', ', but over time ', ' can become '],['剛學新事物的人','起初的不足','隨時間累積的過程','最後的正面感受'])),
  card('In this sense, a new skill acts like a light switched on in a room that had grown dark.','以 light 比喻學習重新點亮單調生活',[4,5,9],fixed(8,'In this sense, [學習] acts like [點亮漸暗房間的一盞燈].','比喻新學習令原本單調的晚年重新有活力。','具體例子已展示精神振奮，要用形象比喻概括其轉變時。',['In this sense, ', ' acts like '],['帶來轉變的活動','照亮低落狀態的比喻'])),
  card('Another important benefit is that new digital skills help retired people stay connected with society.','以 Another benefit 轉入保持社會聯繫的第二條理由',[3,8,10],fixed(9,'Another important benefit is that [新技能] help [長者] stay connected with [現代社會].','第二主體段由精神好處轉到社會參與。','已討論一項內在好處，要轉入另一項與外界連結的好處時。',['Another important benefit is that ', ' help ', ' stay connected with '],['新增的能力','因此受益的人','能持續參與的世界'])),
  card('Healthcare changes quickly, especially through technology, and those who refuse to learn may become increasingly dependent on others.','以 and those who ... may ... 說拒學會加深依賴',[9,11,12],fixed(10,'[世界] changes quickly, especially through [科技], and those who [拒絕學習] may become increasingly [依賴他人].','科技迅速變化，停學可能削弱自主生活能力。','要說明環境變快時，拒絕更新技能可能增加依賴時。',[' changes quickly, especially through ', ', and those who ', ' may become increasingly '],['迅速變動的環境','變動較明顯的領域','造成落後的選擇','可能加深的依賴'])),
  card('If older residents learn video calls and online maps, they can reach family, do daily tasks and join community life.','以 If ... can ... 列學數碼技能的三項自主用途',[10,12,13],fixed(11,'If [長者學智能手機網銀視像], they can [聯絡家人、處理事務及參與社區].','數碼技能同時支持親情、日常自主及社區參與。','要列出學會某技能後，可以完成的幾種具體日常任務時。',['If ', ', they can '],['學到新工具的條件','因此增加的日常能力'])),
  card('This is not a small benefit; it protects people’s independence.','以 not a small ...; it protects ... 強調自主攸關尊嚴',[10,11,13],fixed(12,'This is not [微不足道的好處]; it protects [長者尊嚴].','能自己辦事與保持聯繫涉及尊嚴，不只是方便。','前句列生活便利，要指出那些能力其實還保護更重要的個人價值時。',['This is not ', '; it protects '],['不應低估的好處','被保護的深層價值'])),
  card('For instance, a grandfather with video chat can speak to family abroad instead of feeling cut off.','以 instead of 舉視像通話避免與親人隔絕',[11,12,14],fixed(13,'For instance, [學視像的祖母] can speak to [海外孫兒女] instead of [感到隔絕].','具體展示科技讓家人跨距離保持聯繫。','要舉例說新技能帶來可見連結，避免某種孤立感時。',['For instance, ', ' can speak to ', ' instead of '],['學會工具的人','因此可以聯繫的人','被避免的孤立感'])),
  card('Such learning builds a bridge between neighbours of different ages.','以 bridge between 比喻學習連接不同世代',[11,13,15],fixed(14,'[這種學習] builds a bridge between [不同世代].','從祖母與孫兒女例子抽出跨代連結作用。','已見個別互動，要用橋樑比喻概括兩群人如何被重新連起來時。',[' builds a bridge between '],['促成連結的活動','被連結的兩方'])),
  card('In conclusion, it is never too late for adults to try a new skill.','以 never too late 重申沒有學習截止年齡',[0,12,16],fixed(15,'In conclusion, it is never too late for [長者學新事物].','結論直接回應65歲後太晚的題目主張。','要在結尾反駁某年齡已太遲開始的絕對說法時。',['In conclusion, it is never too late for '],['仍可開始的群體與活動'])),
  card('After retirement, exercise is not a luxury; it is one of the best ways to preserve strength and independence.','以 not a luxury; it is ... 說晚年學習是重要需要',[2,12,15],fixed(16,'After [65歲], [學習] is not a luxury; it is one of the best ways to preserve [信心、獨立與人生目標].','學習是維持晚年自主與生活意義的實際方法。','要否定某活動只是額外享受，指出它可維持數項重要能力時。',['After ', ', ', ' is not a luxury; it is one of the best ways to preserve '],['人生階段','被低估的活動','透過它得以保留的能力'])),
];
const wrongReasons=[
  ['這句已反對65歲後不能學，原句先提出學習無固定截止年齡。','這句已列精神與獨立兩條好處，未作開篇原則。','這句是結論重申永不太遲，未先建立討論框架。'],
  ['這句先提出學習不受固定年齡限制，未引出反方主張及不同意。','這句解釋學習好處，未直接回應65歲太遲。','這句是結論，未在引言明確駁斥題目看法。'],
  ['這句只說反對太老不能學，未列精神與自主生活好處。','這句是第一條心理情緒理由，未概括全文兩條主因。','這句轉入與社會連結，未在引言總結兩方面益處。'],
  ['這句引言概括精神與獨立，未開始展開心理情緒第一原因。','這句說退休後失去規律的背景，未先提出學習的提振作用。','這句已轉入第二項社會好處，非第一主體段理由。'],
  ['這句提出學習帶來精神提振，未說退休後為何需要新規律。','這句說學新技能不只是填時間，未先交代空虛來源。','這句以光比喻學習的改變，未分析工作規律的消失。'],
  ['這句說退休後日子可能空洞，未以 not merely 重新界定學習。','這句分析挑戰培養能力，原句先列新學習及其新挑戰。','這句用畫畫例子說自豪，未概括學習不只是打發時間。'],
  ['這句列新技能提供挑戰，未分析挑戰如何影響能力與自我感受。','這句是繪畫班個案，未概括專注耐心解難的過程。','這句用燈光比喻結果，未說實際能力如何形成。'],
  ['這句概括挑戰培養能力，未以 For example 展示某人由不安變自豪。','這句是照亮房間的比喻，未提供畫畫者的時間變化。','這句是視像通話例子，屬第二個社會連結論點。'],
  ['這句說退休失去規律的背景，未用光比喻學習的改變。','這句說學技能等於新挑戰，未概括單調生活被點亮。','這句開始社會連結理由，與前段精神比喻不同。'],
  ['這句是第一項心理好處，未轉到社會參與。','這句用燈光比喻精神振奮，未提出另一個好處。','這句說科技變化與不學的依賴風險，未先概括社會連結。'],
  ['這句只概括新技能能聯繫社會，未說拒學為何增加依賴。','這句列智能手機等具體用途，未交代環境快速變化。','這句強調尊嚴，未分析不更新技能的風險。'],
  ['這句說拒學會更依賴，未列學手機網銀後能做的事。','這句抽出尊嚴意義，未列家人日常社區的實際用途。','這句舉祖母視像聊天單一例子，未列三種數碼工具。'],
  ['這句列工具的具體日常用途，未以 not a small 強調深層價值。','這句是祖母與海外親人例子，未概括尊嚴。','這句用橋樑比喻跨代連結，未說自主本身維護尊嚴。'],
  ['這句列多項數碼能力，未以祖母作單一具體個案。','這句說這些能力攸關尊嚴，未舉跨國視像通話。','這句把個案抽成跨代橋樑，原句先呈現祖母的行動。'],
  ['這句列多項技能與社區用途，未用橋樑比喻世代關係。','這句是祖母個案，未把它概括為跨代連結。','這句已進入結論，未收束第二主體段例子。'],
  ['這句在引言否定65歲不能學，未以 In conclusion 收束。','這句說自主能力與尊嚴，未直接重申永不太遲。','這句結論補充學習非奢侈，原句先回答年齡問題。'],
  ['這句引言概括學習好處，未在結尾以 not a luxury 重新定性。','這句說尊嚴重要，未同時列信心獨立與目標感。','這句先說永不太遲，未補充晚年學習的實際必要性。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看學習如何改善精神與自我感受，再看新技能如何支持自主和社會聯繫。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目提出哪項作者反對的看法？',[
    '65歲以後太遲，不能再學新知識或技能',
    '所有長者每天都必須參加同一個美術班',
    '只有青年人才可以使用銀行和智能手機',
    '畫畫比學樂器更容易拿到學校考試分數',
  ],'作者反對以65歲作學習截止線。'),
  {type:'multi',prompt:'選出作者支持長者學習的兩條主線',detail:'選兩項，再按「確認」。',options:[
    '新挑戰提振心情，維持能力感和信心',
    '數碼技能幫助日常自主與社會聯繫',
    '學習只有填滿空檔的作用，沒有其他結果',
    '年過65便無法再參與家庭或社區生活',
  ],correct:[0,1],why:'文章以心理情緒與生活自主兩方面反駁太遲學習的說法。'},
];
const route=[sequence('依文章次序排列晚年學習論證',[
  ['引言反對年齡界線','學習晚年仍有價值，可保持思維與獨立。'],
  ['精神情緒好處','退休失去規律；新挑戰培養能力與自豪感。'],
  ['自主社會好處','科技變快；學手機網銀視像可聯繫家人、辦事。'],
  ['結論重新定性','學習非奢侈，能保持信心、獨立和目標感。'],
],'文章以兩條實際效益證明65歲並非學習終點。')];
const evidence=[
  quiz('退休後失去工作規律，可能出現甚麼情況？',[
    '日子變得重複空洞，因而更需要新的心智挑戰',
    '每名長者都立即不再需要任何社交與活動',
    '只要退休，所有新語言和手藝都自動掌握',
    '工作一停止，科技世界便永遠不再改變',
  ],'原文把失去規律與學新事物的提振作用連起來。'),
  quiz('學語言、樂器、數碼技能和手藝為何不只是填時間？',[
    '新任務會帶來心智挑戰，培養專注耐性與解難',
    '只要課程時間排滿，長者便一定不會再犯錯',
    '學技能只會讓長者放棄與任何家人保持聯繫',
    '所有這些活動都只為獲得學校考試的分數',
  ],'挑戰可提升能力感及精神狀態。'),
  quiz('繪畫班例子如何展示時間帶來的改變？',[
    '起初信心不足，進步過程後可漸漸感到自豪',
    '畫第一筆後，便立刻成為專業畫家',
    '繪畫只會使長者更確信自己無法進步',
    '加入班級後，便不再需要任何練習時間',
  ],'例子展示從不安到自豪的逐步轉變。'),
  quiz('為何新的數碼技能有助長者保持獨立？',[
    '可聯絡家人、處理事務和參與社區，而少靠別人',
    '只要會開手機，就完全不用再和家人說話',
    '所有銀行事務都只能請子女親自代辦',
    '科技一旦變化，長者便必須停止學習',
  ],'手機網銀與視像通話提供具體的自主用途。'),
  quiz('祖母學會視像通話的例子說明甚麼？',[
    '可與海外孫兒女保持聯繫，減少被隔開的感受',
    '祖母從此必須停止與住在身邊的人交談',
    '視像通話只有工作用途，不可用來聯絡家人',
    '距離一旦存在，任何數碼技能都不能幫助',
  ],'具體例子展示數碼技能建立跨代連結。'),
  quiz('作者為何說數碼學習不只是小好處？',[
    '它有助保留自主與尊嚴，不只是增加方便',
    '它只會讓手機外殼看起來比較好看',
    '它可保證所有長者永遠不再需要幫助',
    '它能讓長者立即掌握所有世界新科技',
  ],'維持自己辦事與社會參與的能力涉及尊嚴。'),
  quiz('結論如何界定65歲後學習？',[
    '並非奢侈，能維持信心、獨立和生活方向',
    '只是奢侈活動，與日常生活完全無關',
    '年過65便已錯過所有學新東西的時機',
    '只要學習，便永遠不會有任何困難',
  ],'作者以晚年學習的實際價值作結。'),
];
const logic=[
  sequence('學習如何提振退休後的精神',[
    ['背景','退休使原有工作規律消失，日子可能空洞。'],
    ['新挑戰','語言、樂器、數碼和手藝讓心智重新工作。'],
    ['能力感','專注耐性與解難使人覺得自己仍有能力。'],
    ['具體例子','繪畫班從信心不足走到逐漸自豪。'],
  ],'作者把新學習視為心智挑戰，不只是消磨時間。'),
  sequence('學習如何維持自主與跨代聯繫',[
    ['外部變化','科技更新快，不學可能愈來愈依賴他人。'],
    ['數碼用途','手機網銀視像可聯絡家人、辦事及參與社區。'],
    ['深層價值','自己能做事，有助保留尊嚴。'],
    ['具體例子','祖母與海外孫兒女視像聊天，減少隔絕。'],
    ['概括','新學習成為連接不同世代的橋樑。'],
  ],'數碼能力把長者重新接上迅速變化的家庭和社會生活。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一位退休長者不再有固定工作日程，覺得每天都差不多，想找一項能帶來新目標的活動。','哪項最符合範文的第一條理由？',[
    '學習新手藝給心智新挑戰，並逐步恢復能力感',
    '只要不安排任何活動，空洞感必然自行消失',
    '退休後不可能再學一項新技能，所以不必嘗試',
    '只需重複過往工作時間表，毋須做任何新事情',
  ],['新挑戰可替代失去的規律並提振情緒。','未提供新挑戰。','與作者立場相反。','只複製舊安排。'],[3,4,5,6],'退休失去日常規律後，學新事物提供心智挑戰與能力感。'),
  transfer('一位長者剛參加陶藝班，作品起初歪斜，但每星期都看見自己進步。','哪項最能轉用繪畫班例子？',[
    '由起初信心不足到逐漸進步，可形成安靜的自豪感',
    '作品一開始不完美，就證明長者永遠不可能學會',
    '只要參加一次陶藝班，便必定成為專業藝術家',
    '進步只與作品價格有關，與長者的感受完全無關',
  ],['重點是隨時間進步帶來能力與自豪。','過早下定論。','過度保證。','忽略情緒轉變。'],[5,6,7],'繪畫班長者從信心不足到因進步而自豪。'),
  transfer('社區計劃教長者用手機預約診症和與家人視像聯絡。','哪項最貼近範文的自主生活作用？',[
    '學會新工具可自己辦日常事，也較容易與家人聯繫',
    '只要有手機，長者便完全不用學任何使用方法',
    '視像聯絡只會讓長者與家人之間變得更隔絕',
    '網上預約只能由別人代做，長者學了也不能用',
  ],['數碼技能帶來具體日常能力與家庭連結。','工具仍需學會。','與連結作用相反。','否定可學的自主用途。'],[9,10,11,13],'學手機網銀視像可聯絡家人、處理日常事務。'),
  transfer('有人說長者學網上銀行只是為了方便，與尊嚴完全無關。','哪項最準確回應？',[
    '能自己處理金錢事務，可減少依賴並保留自尊',
    '只要有銀行帳戶，就不再需要任何自理能力',
    '網上銀行的唯一用途是改變手機螢幕的顏色',
    '長者學新技能只會令家人永遠不再聯絡他',
  ],['自己辦事涉及自主與尊嚴，超出方便。','帳戶不等於能力。','無關的外觀。','與社會連結相反。'],[10,11,12],'數碼技能幫長者自主辦事，這並非小好處，能維護尊嚴。'),
  transfer('一名祖母學會視像通話後，每週都能與遠在另一國的孫兒女聊天。','哪項最符合橋樑比喻？',[
    '新技能跨越距離，使不同世代能持續交流',
    '只要相隔兩地，任何新技能都不能建立聯繫',
    '視像通話一旦學會，家人便再也不需說話',
    '祖母使用手機，只會讓不同世代更難理解',
  ],['具體連結可概括為跨代橋樑。','與題境相反。','誤解聯絡用途。','否定跨代互動。'],[13,14],'祖母用視像通話聯絡海外孫兒女，學習連接世代。'),
  transfer('一位六十八歲的居民想學攝影，朋友說他已經太老，不可能掌握新技能。','按範文，哪項回應最好？',[
    '年齡不是固定截止線，學習仍可帶來信心與目標',
    '只要超過六十五歲，所有新技能都無法再學會',
    '學習只適合考試學生，長者應完全停止嘗試',
    '攝影只有職業用途，不能給退休者任何成長',
  ],['作者直接反對年齡界線並列晚年好處。','重複被反對主張。','否定晚年價值。','忽略精神好處。'],[0,1,2,15,16],'作者反對65歲後太遲的說法；學習能保信心與目標。'),
  transfer('科技更新很快，長者若一直拒絕學交通應用程式，出門愈來愈需要別人幫忙。','哪項最貼近範文的因果關係？',[
    '環境快速變化而停止學習，可能增加對他人的依賴',
    '只要科技更新，任何長者都絕對不可能再自行出門',
    '拒絕學新工具會保證長者變得比過去更加獨立',
    '交通應用程式的顏色才是出門是否需要幫忙主因',
  ],['不更新技能可降低自主應對變化的能力。','把風險絕對化。','與依賴風險相反。','外觀不是原因。'],[9,10,11],'科技迅速變化，拒學的人可能愈來愈依賴別人。'),
  transfer('一位長者開始學鋼琴，練習時需專心聽、耐心重來並找出錯音。','按範文，這類新挑戰可培養甚麼？',[
    '專注、耐性和解難，也使人更感到自己有能力',
    '只會讓長者永久失去每一種獨立生活能力',
    '鋼琴一旦學會，所有家庭問題都必然消失',
    '只有音樂考試分數會受影響，心情完全不變',
  ],['新挑戰的能力與情緒作用正是第一主體段重點。','與能力感相反。','過度保證。','忽略精神作用。'],[5,6,7],'新挑戰培養專注耐心解難，並改善能力感。'),
  transfer('有人把退休後的課程稱為「奢侈娛樂」，認為它不可能影響日常生活。','哪項最能概括範文結論？',[
    '晚年學習可維持信心、獨立和目標感，並非奢侈',
    '只要課程有趣，就不能對長者的生活帶來任何益處',
    '退休後只有考試分數算價值，其他成果都不重要',
    '長者只需買下課程教材，無須再有任何學習行動',
  ],['學習關乎實際生活能力與心理狀態。','把有趣與有用錯誤對立。','忽略生活價值。','買教材不等於學習。'],[2,12,16],'65歲後學習不是奢侈，而是保留信心獨立與目標的方法。'),
  transfer('教育中心要寫一句話總結退休者學新技能如何同時影響個人與社會。','哪句最符合範文兩條主線？',[
    '新挑戰提振心情，數碼能力也助自主生活與家庭聯繫',
    '只要有一項新技能，長者便永遠不再需要任何協助',
    '晚年學習只會填滿時間，完全不會改變生活方式',
    '社會一直改變，長者因此必須停止接觸所有科技',
  ],['同時抓住精神情緒與生活社會兩方面。','誇大成果。','否定兩條好處。','與論點相反。'],[3,5,9,11,16],'作者以精神提振和自主社會連結支持晚年學習。'),
];
export default {key:'discuss-both-views:18',meta:{topic:'65歲後學新事物是否太遲',summary:'學習能提振長者精神並維持信心；數碼能力亦使他們較獨立、能與家人社區保持聯繫。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
