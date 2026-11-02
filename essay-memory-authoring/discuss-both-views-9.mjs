// Full source-specific memorisation support for Discuss Both Views 9.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-9-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:9'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People have long argued about how smart people are because some seem to think quickly from birth while others get better slowly.',
  'People may be born with an ability that helps them at first, but I think teaching, practice and learning over many years do much more to shape how well people think.',
  'People who think intelligence comes from birth often say people naturally differ in how well they remember, work things out and solve problems quickly.',
  'This makes sense because children in the same class may be taught the same thing but still do very different work.',
  'For example, one child may understand a pattern in numbers right away, while another needs to hear it explained many times before it makes sense.',
  'These differences suggest that some thinking skills, like being good at music or having talent for sports, may partly come from parents.',
  'If someone is born able to understand information more quickly, learning may feel easier and faster right from the start.',
  'In this way, being born quick at thinking can give someone an early lead.',
  'But I strongly think how smart a person is can change because learning can change the way people think, study ideas and solve problems.',
  'When students read many kinds of books, work on hard skills and get useful advice about their work, they slowly become better at thinking things through.',
  'For example, a child who finds science hard may become very good at it after years of help, experiments and careful correction.',
  'This does not mean everyone will become just as good as everyone else, but it shows that people can become much better thinkers than they were at first.',
  'Even more important, many kinds of smart thinking, such as making good choices, having new ideas and understanding feelings, come much more from life experience than from birth.',
  'Someone who is clever from birth but never studies may stop improving, while a person who studies regularly can keep getting better.',
  'To sum up, what someone is born able to do may affect how quickly they learn at first, and we should accept that some people begin with an advantage.',
  'Even so, the best way to understand intelligence is as something that can grow through learning, because teaching, hard work and life experience shape how far people can develop their minds.',
];
const vocabulary=[
  [['Human intelligence','how smart people are','人類智力'],['long been debated','People have long argued','長期爭議'],['naturally quick-minded','think quickly from birth','天生反應快'],['develop their abilities gradually','get better slowly','逐漸發展能力']],
  [['innate ability','born with an ability','天生能力'],['early advantage','helps them at first','早期優勢'],['intelligence','how well people think','智力'],['education','teaching','教育'],['practice','practice','練習'],['sustained learning','learning over many years','持續學習']],
  [['inborn','comes from birth','天生'],['differ naturally','naturally differ','天生有差異'],['memory','remember','記憶'],['reasoning','work things out','推理'],['problem-solving speed','solve problems quickly','解難速度']],
  [['This view is understandable','This makes sense','此看法可理解'],['same classroom','same class','同班'],['same instruction','taught the same thing','同樣教學'],['perform very differently','do very different work','表現大不同']],
  [['For instance','For example','例如'],['grasp mathematical patterns','understand a pattern in numbers','掌握數學規律'],['almost instantly','right away','幾乎即時'],['repeated explanation','hear it explained many times','反覆解說'],['idea becomes clear','it makes sense','概念清晰']],
  [['Such differences','These differences','這些差異'],['mental capacities','thinking skills','心智能力'],['musical talent','being good at music','音樂天賦'],['athletic potential','talent for sports','運動潛能'],['partly inherited','partly come from parents','部分遺傳']],
  [['sharper ability to process information','able to understand information more quickly','處理資訊較快'],['learning may feel easier and faster','learning may feel easier and faster','學習較易較快'],['from the beginning','right from the start','從一開始']],
  [['In this sense','In this way','從這意義'],['natural intelligence','being born quick at thinking','天生智力'],['head start','early lead','起步優勢']],
  [['However','But','然而'],['firmly believe','strongly think','堅定認為'],['intelligence is not fixed','how smart a person is can change','智力非固定'],['analyse','study ideas','分析'],['solve problems','solve problems','解難']],
  [['read widely','read many kinds of books','廣泛閱讀'],['practise difficult skills','work on hard skills','練習難技能'],['proper feedback','useful advice about their work','恰當回饋'],['gradually','slowly','逐漸'],['stronger habits of reasoning','better at thinking things through','更強推理習慣']],
  [['struggles with science','finds science hard','科學較吃力'],['highly capable','very good at it','變得能幹'],['guided practice','help','有指導練習'],['experiments','experiments','實驗'],['patient correction','careful correction','耐心糾正']],
  [['reach exactly the same level','become just as good as everyone else','達相同水平'],['intellectual ability','better thinkers','智力能力'],['stretched far beyond its starting point','become much better thinkers than they were at first','超越起點']],
  [['More importantly','Even more important','更重要'],['forms of intelligence','kinds of smart thinking','智力形式'],['judgement','making good choices','判斷力'],['creativity','having new ideas','創造力'],['emotional understanding','understanding feelings','理解情緒'],['depend heavily on experience','come much more from life experience','依賴經驗'],['rather than birth','than from birth','而非天生']],
  [['naturally clever','clever from birth','天生聰明'],['hit a ceiling','stop improving','碰到上限'],['whereas','while','然而'],['disciplined learner','person who studies regularly','自律學習者'],['continue to grow','keep getting better','持續成長']],
  [['In conclusion','To sum up','總結'],['innate ability','what someone is born able to do','天生能力'],['influence','affect','影響'],['at first','at first','最初'],['unrealistic to deny','we should accept','不應否認'],['natural advantages','begin with an advantage','天生優勢']],
  [['Nevertheless','Even so','然而'],['intelligence','intelligence','智力'],['developed through learning','grow through learning','由學習發展'],['education','teaching','教育'],['effort','hard work','努力'],['experience','life experience','經驗'],['determine how far','shape how far','決定發展幅度']],
];
const chunkOverrides=[
  ['Human intelligence has long been debated,','partly because some people appear naturally quick-minded','while others develop their abilities gradually.'],
  ['Although innate ability can give individuals an early advantage,','I believe intelligence is far more strongly shaped','by education, practice and sustained learning.'],
  ['Those who see intelligence as inborn','often argue that people differ naturally','in memory, reasoning and problem-solving speed.'],
  ['This view is understandable because children','in the same classroom may receive the same instruction','yet perform very differently.'],
  ['For instance, one student may grasp mathematical patterns','almost instantly, while another needs repeated explanation','before the idea becomes clear.'],
  ['Such differences suggest that certain mental capacities,','like musical talent or athletic potential,','may be partly inherited.'],
  ['If a person is born with a sharper ability','to process information, learning may feel easier','and faster from the beginning.'],
  ['In this sense, natural intelligence','can act as a head start.'],
  ['However, I firmly believe that intelligence','is not fixed, because learning can change','how people think, analyse and solve problems.'],
  ['When students read widely, practise difficult skills','and receive proper feedback,','they gradually build stronger habits of reasoning.'],
  ['A child who struggles with science, for example,','may become highly capable after years','of guided practice, experiments and patient correction.'],
  ['This does not mean that everyone will reach','exactly the same level, but it shows','that intellectual ability can be stretched','far beyond its starting point.'],
  ['More importantly, many forms of intelligence,','such as judgement, creativity and emotional understanding,','depend heavily on experience rather than birth.'],
  ['A naturally clever person who never studies','may hit a ceiling, whereas a disciplined learner','can continue to grow.'],
  ['In conclusion, innate ability may influence','how quickly people learn at first,','and it would be unrealistic to deny','that some individuals have natural advantages.'],
  ['Nevertheless, intelligence is best understood','as something that can be developed through learning,','because education, effort and experience determine','how far a person’s mind can truly go.'],
];
const simpleChunkOverrides=[
  ['People have long argued about how smart people are','because some seem to think quickly from birth','while others get better slowly.'],
  ['People may be born with an ability that helps them at first,','but I think teaching, practice and learning over many years','do much more to shape how well people think.'],
  ['People who think intelligence comes from birth','often say people naturally differ','in how well they remember, work things out','and solve problems quickly.'],
  ['This makes sense because children in the same class','may be taught the same thing','but still do very different work.'],
  ['For example, one child may understand a pattern in numbers','right away, while another needs to hear it explained','many times before it makes sense.'],
  ['These differences suggest that some thinking skills,','like being good at music or having talent for sports,','may partly come from parents.'],
  ['If someone is born able to understand information more quickly,','learning may feel easier and faster','right from the start.'],
  ['In this way, being born quick at thinking','can give someone an early lead.'],
  ['But I strongly think how smart a person is can change','because learning can change the way people think,','study ideas and solve problems.'],
  ['When students read many kinds of books,','work on hard skills and get useful advice about their work,','they slowly become better at thinking things through.'],
  ['For example, a child who finds science hard','may become very good at it after years','of help, experiments and careful correction.'],
  ['This does not mean everyone will become just as good','as everyone else, but it shows that people can become','much better thinkers than they were at first.'],
  ['Even more important, many kinds of smart thinking,','such as making good choices, having new ideas','and understanding feelings, come much more from life experience','than from birth.'],
  ['Someone who is clever from birth but never studies','may stop improving, while a person who studies regularly','can keep getting better.'],
  ['To sum up, what someone is born able to do','may affect how quickly they learn at first,','and we should accept that some people begin','with an advantage.'],
  ['Even so, the best way to understand intelligence','is as something that can grow through learning,','because teaching, hard work and life experience shape','how far people can develop their minds.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Musical skill has long been debated, partly because some children learn tunes quickly while others improve slowly.','以 partly because 說明爭議從何而來',[1,3,8],fixed(0,'[智力] has long been debated, partly because [有些人天生反應快] while [另一些人逐漸進步].','引言以觀察到的差異引出先天與後天之爭。','要引出一個長期爭議，並指出兩種可觀察現象使它產生時。',[' has long been debated, partly because ', ' while '],['受爭議的能力或問題','第一種觀察','形成對照的第二種觀察'])),
  card('Although natural talent helps at first, I believe performance is far more strongly shaped by practice and teaching.','以 Although 先承認先天優勢，再選教育練習',[0,3,8],fixed(1,'Although [天生能力帶來早期優勢], I believe [智力] is far more strongly shaped by [教育練習與持續學習].','立場不是否認天賦，而是認為後天培養影響更大。','兩方都有道理，需承認一方有限作用並表明另一方更重要時。',['Although ', ', I believe ', ' is far more strongly shaped by '],['先承認的有限好處','被解釋的能力','自己較重視的形成因素'])),
  card('Those who see reading skill as inborn often argue that people differ naturally in memory and learning speed.','以 Those who see ... as ... 概括先天派的理由',[1,4,8],fixed(2,'Those who see [智力] as [天生] often argue that people differ naturally in [記憶推理和解難速度].','公平呈現先天派：同齡人能力與速度有原初差別。','需要先說明支持某種成因的人，會指出哪些可觀察差異時。',['Those who see ', ' as ', ' often argue that people differ naturally in '],['被討論的能力','他們認為的來源','具體差異'])),
  card('This view is understandable because children may receive the same lesson yet perform very differently.','以 same ... yet ... 解釋一方為何看似合理',[2,4,9],fixed(3,'This view is understandable because [同班孩子] may receive [相同教學] yet perform [很不同].','同一教學下表現不同，讓天生差異說有一定吸引力。','要公平解釋某看法的理由，並用相同條件下的不同結果作支持時。',['This view is understandable because ', ' may receive ', ' yet perform '],['作比較的群體','相同的外在條件','形成爭議的不同結果'])),
  card('For instance, one pupil may grasp fractions almost instantly, while another needs several explanations before the idea becomes clear.','以 one ... while another ... 具體對照理解速度',[3,5,6],fixed(4,'For instance, [一名學生] may grasp [數學規律] almost instantly, while [另一名] needs [反覆解釋] before [概念清楚].','兩個學生學同一內容速度不同，具體化先天派觀察。','已說同一條件下表現不同，需用一對人物作具體比較時。',['For instance, ', ' may grasp ', ' almost instantly, while ', ' needs ', ' before '],['較快理解的人','被學習的內容','較慢理解的人','所需的額外幫助','最後的理解結果'])),
  card('Such differences suggest that some learning strengths, like musical talent, may be partly inherited.','以 suggest ... may ... 謹慎推論部分能力遺傳',[3,4,7],fixed(5,'Such differences suggest that [某些心智能力], like [音樂或運動天賦], may be partly inherited.','能力差異可能有先天部分，但作者沒有說全由遺傳決定。','觀察到差異後，要以 suggest 和 may 作審慎而非絕對的推論時。',['Such differences suggest that ', ', like ', ', may be partly inherited.'],['可能受先天影響的能力','幫助理解的同類例子'])),
  card('If someone is born able to process sounds quickly, learning may feel easier from the beginning.','以 If ... may ... 說先天能力如何帶來起步優勢',[5,7,8],fixed(6,'If [某人天生能較快處理資訊], learning may feel [較易較快] from the beginning.','較敏捷的資訊處理可使最初學習感覺更順利。','要用條件句解釋某項先天條件可能如何影響最初經驗時。',['If ', ', learning may feel ', ' from the beginning.'],['可能已有的起步條件','最初體驗的差異'])),
  card('In this sense, an early talent can act as a head start.','以 head start 比喻概括先天能力的有限作用',[5,6,8],fixed(7,'In this sense, [天生智力] can act as [起步優勢].','前段結論是先天能力提供領先起步，而不是決定終點。','已列先天優勢的具體例子，要用短比喻概括其作用範圍時。',['In this sense, ', ' can act as '],['已有的能力','它提供的有限優勢'])),
  card('However, I firmly believe that skill is not fixed, because teaching can change how pupils solve problems.','以 not fixed, because 說學習可改變思考方式',[1,7,9],fixed(8,'However, I firmly believe that [智力] is not fixed, because [學習] can change [思考分析解難方式].','第二主體段轉入作者立場：能力可透過學習發展。','已公平論證先天一方，需轉入能力可改變的相反論證時。',['However, I firmly believe that ', ' is not fixed, because ', ' can change '],['被認為可發展的能力','帶來改變的過程','發生改變的具體方式'])),
  card('When pupils read widely, practise difficult tasks and receive useful comments, they gradually build stronger ways of thinking.','以 When ... they ... 列培養能力的三種學習行動',[8,10,11],fixed(9,'When [學生] read widely, practise [困難技能] and receive [恰當回饋], they gradually build [較強推理習慣].','教育改變智力的機制是閱讀、練習與回饋累積。','已主張能力可培養，需列出具體行動及逐漸產生的能力結果時。',['When ', ' read widely, practise ', ' and receive ', ', they gradually build '],['參與學習的人','反覆練習的技能','得到的回饋','逐漸形成的能力'])),
  card('A child who struggles with reading, for example, may become more fluent after years of guided practice and patient feedback.','以 who ... may ... after ... 給出長期努力反例',[9,11,12],fixed(10,'A child who [起初科學較弱], for example, may become [很能幹] after years of [指導練習、實驗與耐心糾正].','科學原本吃力的孩子經多年練習也可大幅改善。','已有一般學習機制，需用一個起點較弱但長期進步的人作證時。',['A child who ', ', for example, may become ', ' after years of '],['起初遇到困難的人','後來可達到的能力','使進步發生的長期過程'])),
  card('This does not mean that every pupil will score alike, but it shows that everyone’s ability can be stretched far beyond its starting point.','以 does not mean ... but ... 避免把可發展誤當人人相同',[10,13,14],fixed(11,'This does not mean that [人人達同水平], but it shows that [智力] can be stretched far beyond [起點].','承認最終水平不必一樣，同時保留可大幅進步的結論。','要防止讀者把有限主張誤解成極端結論，再說出真正意思時。',['This does not mean that ', ', but it shows that ', ' can be stretched far beyond '],['明確否定的過強說法','仍能發展的能力','可以超越的起點'])),
  card('More importantly, good judgement and emotional skill depend heavily on experience rather than birth.','以 rather than birth 擴展到判斷創意情緒理解',[8,11,13],fixed(12,'More importantly, [判斷、創意與情緒理解] depend heavily on [經驗] rather than [出生時條件].','不只學科推理，其他重要能力更取決於後天經驗。','已談某一能力，還需擴大到其他較依賴經驗的能力時。',['More importantly, ', ' depend heavily on ', ' rather than '],['更廣泛的能力類別','作者更重視的來源','被比較的先天來源'])),
  card('A gifted learner who never practises may hit a plateau, whereas a steady learner can continue to improve.','以 whereas 對照天賦停滯與自律成長',[7,12,14],fixed(13,'[天生聰明但不學習的人] may hit [上限], whereas [自律學習者] can continue to [成長].','天賦不能保證持續進步，日常學習可拓展能力。','要用兩個人或群體對照先天優勢與持續努力的長期結果時。',[' may hit ', ', whereas ', ' can continue to '],['可能停滯的人','遇到的限制','持續努力的人','後來的變化'])),
  card('In conclusion, natural talent may influence early progress, and it would be unrealistic to deny that some pupils begin ahead.','以 it would be unrealistic to deny 再承認起步優勢',[1,13,15],fixed(14,'In conclusion, [天生能力] may influence [早期學習速度], and it would be unrealistic to deny that [有人有自然優勢].','結論先公平保留先天能力影響起點的事實。','結論要先承認另一方有限但真實的作用，避免立場顯得絕對時。',['In conclusion, ', ' may influence ', ', and it would be unrealistic to deny that '],['可影響起點的條件','被影響的早期表現','不應否認的事實'])),
  card('Nevertheless, ability is best understood as something that grows through learning, because teaching, effort and experience determine how far people improve.','以 because 收束教育努力經驗決定發展幅度',[8,12,14],fixed(15,'Nevertheless, [智力] is best understood as [可透過學習發展的能力], because [教育努力經驗] determine [思維能發展多遠].','最終選後天學習：起點有差異，但發展距離取決於培養。','已承認一方起點優勢，仍需重申另一方更能解釋長期結果時。',['Nevertheless, ', ' is best understood as ', ', because ', ' determine '],['最終被界定的能力','作者較支持的理解','決定發展的因素','被決定的發展幅度'])),
];
const wrongReasons=[
  ['這句已讓步先天能力並表態後天更重要，原句只引出爭議。','這句解釋先天派的能力差異，未說爭議從何而來。','這句轉入後天可發展立場，原句尚未表態。'],
  ['這句只說先後天觀察的差異，未用 Although 表明選擇。','這句公平呈現先天派，沒有作者偏重後天的判斷。','這句在主體段轉入學習可改變，原句在引言先定立場。'],
  ['這句表態後天培養更重要，原句先公平說先天派理由。','這句給出同班表現不同的證據，未概括先天派所指能力。','這句開始反對固定智力觀，非先天派主張。'],
  ['這句先列先天派所指差異，未用同班同教的對照支持。','這句是兩個學生學數學的具體例子，原句先講班級觀察。','這句列閱讀練習回饋的後天機制，不是先天看法理由。'],
  ['這句概括同班不同表現，未舉兩名學生理解速度例子。','這句小心推論部分能力可遺傳，原句先提供學習速度觀察。','這句用 If 說先天能力的起步作用，非兩人對比例子。'],
  ['這句說同班學生表現不同，尚未推論可能遺傳。','這句是數學理解速度例子，原句提升為審慎推論。','這句總結先天給起步優勢，未列音樂運動類比。'],
  ['這句推測某些能力部分遺傳，未用 If 說學習感受。','這句是短比喻總結起步優勢，原句解釋條件與效果。','這句轉入學習可改變能力，不是先天起步作用。'],
  ['這句說某項先天條件如何影響學習，未用 head start 概括。','這句推論音樂運動天賦或部分遺傳，未總結有限作用。','這句轉到作者後天立場，不是前段的短收束。'],
  ['這句在引言表明教育練習較重要，原句在主體段轉入具體論證。','這句短說先天是起步優勢，未否定智力固定。','這句列具體學習行動，原句先提出能力可改變的主張。'],
  ['這句先說能力可改變，未列閱讀練習回饋三種做法。','這句是科學進步的個人例子，原句先列一般培養過程。','這句修正「人人相同」誤解，非具體學習行動。'],
  ['這句列一般閱讀練習與回饋，未舉科學吃力者。','這句保留可進步與非人人相同，原句是個人長期進步例子。','這句擴展到判斷創意情緒能力，非科學學習例子。'],
  ['這句是科學學生大幅進步例子，未澄清不代表人人達同水平。','這句談廣泛能力依賴經驗，未用 does not mean ... but ... 澄清。','這句結論承認起步差異，非對可發展主張的範圍限制。'],
  ['這句說學科能力可超越起點，原句擴大至判斷創意情緒。','這句是天賦停滯與自律成長對照，未列多種能力來源。','這句說先天影響早期速度，原句轉到經驗的較大作用。'],
  ['這句只總結先天的起步優勢，未對照不學與自律學。','這句說多種能力依賴經驗，原句用兩種人具體對照。','這句結論承認先天優勢，未說長期停滯與成長的差異。'],
  ['這句在引言已承認早期天賦，原句在結論再次公平重述。','這句用兩種人對比長期進步，原句先承認早期差異。','這句結論最終選後天，原句先重述先天的有限作用。'],
  ['這句主體段說智力可改變，未在結論總結發展因素。','這句說多種能力依賴經驗，原句連教育努力經驗作整體收束。','這句結論先承認天生起步優勢，原句是最後的權衡選擇。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先公平說先天派觀察，再排作者較支持的學習與經驗論證。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('文章比較智力的哪兩種主要來源？',[
    '天生能力的起步差異，與教育練習經驗帶來的發展',
    '只有數學課本版本，與音樂教室的座位安排',
    '只有學校建築大小，與教室窗戶的採光程度',
    '只有某一份考卷分數，與學生午餐的價錢',
  ],'作者承認有天生起點，但認為學習更能塑造後來的能力。'),
  {type:'multi',prompt:'選出兩方各自能成立的理由',detail:'選兩項，再按「確認」。',options:[
    '同班同教卻有速度差異，部分能力或許與先天有關',
    '閱讀練習回饋與經驗能長期改善人的思考能力',
    '天賦一旦存在，任何人便再也不需要練習',
    '教育一旦有效，人人便必然達到完全相同的水平',
  ],correct:[0,1],why:'範文否定「全由一方決定」的極端說法，但給後天培養較大權重。'},
];
const route=[sequence('依文章次序排列智力論證',[
  ['引言承認起點並表態','天生能力可有早期優勢，教育練習影響更大。'],
  ['先天一方','同班表現、數學理解速度、部分遺傳與起步優勢。'],
  ['後天一方','閱讀練習回饋、科學進步、經驗與自律成長。'],
  ['結論界定範圍','起點可不同；長期能力仍能靠努力發展。'],
],'文章先承認自然差異，再用長期進步和非學科能力說明後天更重要。')];
const evidence=[
  quiz('同班同教卻表現不同，作者如何解讀？',[
    '這使先天差異看法可理解，但尚不足以說智力完全固定',
    '它證明老師必然對每一名學生使用完全不同教材',
    '它證明學習永遠不能改變任何人的推理能力',
    '它表示所有學生最終一定得到完全相同成績',
  ],'作者公平承認同條件下有差異，再於後段討論可發展性。'),
  quiz('兩名學生學數學速度不同的例子支持哪項有限結論？',[
    '有些人或有起步優勢，但未證明努力永遠無用',
    '學得快的學生必定從此再也不用練習',
    '學得慢的學生不可能透過重複解說理解',
    '兩人速度不同，便證明所有能力完全由出生決定',
  ],'例子只足以支持先天可能影響初期速度。'),
  quiz('閱讀、難技能練習和適當回饋如何影響智力？',[
    '反覆學習逐漸建立更好的推理習慣',
    '閱讀一開始，所有學生便立即達同水平',
    '只有天賦有效，因此回饋不可能有作用',
    '練習愈持續，推理習慣便必然愈差',
  ],'作者說學習會改變思考、分析和解難方式。'),
  quiz('科學起初吃力的孩子能進步，作者保留哪項限制？',[
    '人可大幅進步，卻不代表每人都達完全相同水平',
    '只要經過一年，每個孩子都必定成為科學家',
    '孩子起初吃力，就代表日後永遠無法理解',
    '有指導練習只會使原有能力立即完全消失',
  ],'原文用 does not mean ... but ... 同時保留可進步與個別差異。'),
  quiz('判斷力、創意和情感理解有甚麼共同點？',[
    '多需生活經驗，不太可能只由出生時的能力決定',
    '三者都只由一份數學測驗的分數決定',
    '三者一旦出現，就永遠不會隨經驗改變',
    '三者都不可能透過與他人相處而培養',
  ],'作者把智力範圍擴大到經驗依賴較重的能力。'),
  quiz('天生聰明者與自律學習者的對照說明甚麼？',[
    '只有起步天賦可停滯，持續學習卻能繼續成長',
    '天生聰明的人無論如何都不會遇到能力上限',
    '自律學習的人必定無法理解任何困難知識',
    '只要第一次學得快，日後便永遠不用再學',
  ],'長期發展取決於是否繼續學習。'),
  quiz('結論怎樣同時處理先天與後天？',[
    '承認起步速度可能不同，仍認為教育努力經驗決定發展幅度',
    '否認所有孩子有任何起步差異，只保留努力一項',
    '認為先天優勢決定終點，教育練習因此完全無用',
    '只討論音樂運動，不再回答智力如何形成',
  ],'結論把起點與後續發展分開。'),
];
const logic=[
  sequence('先天能力一方的有限作用',[
    ['同班差異','同樣教學下，學生記憶推理速度不同。'],
    ['數學例子','一人很快理解，另一人要反覆解說。'],
    ['謹慎推論','部分能力可能與遺傳有關。'],
    ['起步後果','天生資訊處理較快，初期學習更容易。'],
    ['短結論','先天智力可給領先起步，未必決定終點。'],
  ],'作者以 suggest、may 和 partly 限定先天論的範圍。'),
  sequence('學習與經驗一方的長期作用',[
    ['能力可改變','學習改變思考、分析和解難方式。'],
    ['具體學習機制','廣泛閱讀、練技能、收回饋。'],
    ['長期例子','科學吃力者可經指導練習而大幅進步。'],
    ['適當限制','不保證人人相同，但可超越自己的起點。'],
    ['更廣能力','判斷創意情緒理解依賴經驗；自律者可持續成長。'],
  ],'後天論證不是說起點完全一樣，而是說後續可塑性更重要。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('同班兩名學生學分數時，一人很快理解，另一人需要數次解說。','哪項最符合範文對先天差異的審慎看法？',[
    '起步速度可不同，但不能斷定較慢者永遠學不會',
    '兩人速度不同，便證明老師必定沒有教過相同內容',
    '學得慢者既需解說，日後便不可能改善任何能力',
    '學得快者從此不必練習，成績也必然永遠最高',
  ],['原文說差異 suggest 部分先天作用，仍保留練習可改善。','同教仍可不同。','後天可發展。','天賦不保終點。'],[2,3,4,5,6,7],'範文把同班不同速度當作先天可能有影響的證據，而非終身定論。'),
  transfer('一所學校因學生第一次數學測驗較差，就決定不再讓他修讀更深課程。','哪項最能轉用範文的可發展主張？',[
    '先安排練習與回饋，再評估能力能否超越最初起點',
    '第一次分數已決定終身能力，所以不用再教任何內容',
    '所有學生只要再考一次，便必然取得完全相同成績',
    '只看學生天生速度，完全不記錄練習後的實際進步',
  ],['原文說能力可經學習延伸，但不保證人人同水平。','固定論過強。','人人同水平非作者主張。','忽略可塑性。'],[8,9,10,11],'範文以科學起初吃力的學生，說指導練習可帶來大幅進步。'),
  transfer('音樂老師發現一名學生很快聽出音高，另一名要較久；兩人都願意持續練習。','哪項最能平衡範文的先天與後天觀點？',[
    '承認前者起步較快，仍觀察兩人長期練習後的成長',
    '前者起步快，因此兩人之後的努力都沒有任何作用',
    '後者較慢，因此必須立即停止所有音樂學習',
    '只要兩人都練習，便必然在同一天達同一水平',
  ],['原文承認 head start，也認為學習決定後續發展。','忽略努力。','不能預設終點。','原文不保同水平。'],[5,6,7,11,14,15],'範文結論區分早期速度與教育努力經驗決定的發展幅度。'),
  transfer('職員學習新系統很慢，但經閱讀手冊、練習操作和主管回饋後能獨立解決問題。','哪項最貼近範文的學習機制？',[
    '閱讀、練習和回饋可逐步建立更好的分析與解難習慣',
    '職員起初較慢，便證明任何訓練都完全沒有作用',
    '只要看過手冊一次，所有人便必定立即達相同能力',
    '主管回饋既然存在，職員便不需要再實際操作',
  ],['原文把閱讀練習回饋連到推理習慣改善。','與例子矛盾。','不保同水平。','練習仍必要。'],[8,9,10],'範文列廣泛閱讀、難技能練習與適當回饋作可發展智力的機制。'),
  transfer('一名孩子起初不擅長科學，教師安排多年實驗、指導和細心糾正。','哪項預期最符合範文而不誇大？',[
    '孩子可大幅進步，但不保證與每位同學水平相同',
    '孩子經過一次實驗，便必定比所有科學家都更出色',
    '只要起初吃力，任何指導與實驗便永遠沒有用',
    '教師只需取消糾正，孩子便自然達到完全同一水平',
  ],['原文例子後立刻限制可進步不等於人人同水平。','過於絕對。','否定可塑性。','無因果。'],[10,11],'範文用 does not mean ... but ... 限定科學練習例子的結論。'),
  transfer('公司只用新人做題速度判斷其全部能力，沒有看判斷、創意或理解同事感受。','哪項最能轉用範文對智力範圍的擴充？',[
    '也評估判斷、創意和情緒理解，這些能力可從經驗中培養',
    '只看做題速度，因為其餘能力全都與工作完全無關',
    '只要新人速度快，便必定有成熟的情緒理解能力',
    '新人是否有經驗並不重要，所有判斷力只能由出生決定',
  ],['原文說多種智力高度依賴經驗，而非只看先天速度。','忽略廣泛能力。','速度不保成熟。','與原文相反。'],[2,12,13],'範文把智力從解題速度擴展到判斷、創意和情緒理解。'),
  transfer('兩位學徒起點不同：甲很快學會基本工序後不再練，乙起初較慢卻每日檢查錯誤。','哪項最貼近範文的長期對照？',[
    '甲可能遇到上限，乙的持續學習則可帶來成長',
    '甲起步快便保證不再學習也永遠最出色',
    '乙起初較慢，所以每日改錯都不可能有用',
    '兩人起點不同，便完全不能比較後來的進步',
  ],['原文對比天生聰明但不學與自律者持續成長。','天賦不保長期。','改錯可助成長。','仍可看變化。'],[7,12,13],'範文的 hit a ceiling 與 continue to grow 對照初始天賦和自律學習。'),
  transfer('教育講座有人說「只要承認天賦差異，就必須放棄後天教育」。','哪項反駁最符合範文？',[
    '天賦影響起步，教育努力經驗仍可改變長期能力',
    '天賦差異從來不存在，因此所有學生完全一樣',
    '只要有教育，任何人的起步差異便立即消失',
    '若有人學得快，其他人的努力便必然沒有價值',
  ],['原文同時承認自然優勢和智力可發展。','否定先天觀察。','起點未必消失。','過於絕對。'],[1,7,11,14,15],'範文結論承認天生優勢，但認為發展由學習努力經驗決定。'),
  transfer('公共計劃要支援學習較慢的成人，評審說「他們已過了起步期，不值得投資」。','哪項最能套用範文的超越起點原則？',[
    '提供練習與回饋，觀察能否在原有基礎上進步',
    '只看第一次反應速度，毋須再給任何學習機會',
    '只要成人學習，每個人便必定達同一最高水平',
    '能力既可發展，便完全不用安排具體學習方法',
  ],['原文說智力可超越起點，方法包括練習與回饋。','固定論太早。','不保同水平。','仍需方法。'],[8,9,10,11,15],'範文既保留個別差異，又主張長期學習能擴展能力。'),
  transfer('研究摘要只說「有些學生很快學會」，卻把這當成智力一生固定的證明。','哪項修正最接近範文的完整論證？',[
    '把起步速度與長期學習後的能力變化分開考察',
    '只記錄第一天表現，不再觀察任何後續學習',
    '只要有快學生，其他人日後便不可能有進步',
    '把同班不同結果直接寫成所有智力皆由遺傳決定',
  ],['先天可能給 head start，長期能力仍可被學習改變。','資料不足。','否定可塑性。','推論過強。'],[3,4,7,8,11,14,15],'範文先以初期差異支持有限先天作用，再以長期學習反駁固定智力。'),
];
export default {key:'discuss-both-views:9',meta:{topic:'智力主要由天生能力還是學習經驗塑造',summary:'天生能力可能影響初期學習速度；教育、練習、回饋和經驗更能決定智力如何持續發展。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
