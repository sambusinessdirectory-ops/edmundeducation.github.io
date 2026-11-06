// Human-authored support for Direct Question 11; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-11-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:11'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In many families, parents see school success not only as a goal for a child but also as a way to feel safe about the future.',
  'This is why some parents push children too hard to do well at school.',
  'I think parents should help and guide children with school: they should help them build good habits and believe in themselves without making learning frightening.',
  'Some parents ask too much because they think education is the safest way for children to get better chances in life.',
  'In societies where people compete strongly, good school results are often connected with better universities, better jobs and a steadier life.',
  'So some parents think every mark and class position may change their child’s future.',
  'This worry can become pressure, especially when parents compare their child with other children in class or in the family.',
  'Some adults also try to make their children achieve what they themselves wanted but did not get.',
  'If parents missed a chance to study when they were younger, they may push their children too hard because they hope their children will have the life they wanted.',
  'But a parent’s job is not to keep testing and judging their child at home.',
  'Parents should help children study in a calm way: set regular study times, give them a good place to work, and expect what they can reasonably do.',
  'They should also see when a child is really finding school hard and answer with patience, not blame.',
  'For example, if a child does badly in maths, a helpful parent would ask whether they missed basic lessons, feel worried, or use a poor way to study, instead of simply asking for higher marks.',
  'Above all, parents should help their child keep wanting to learn over many years.',
  'Kind words, truthful advice and feeling safe at home can help children keep going and want to learn for themselves, but constant pressure may make school feel shameful and tiring.',
  'To sum up, parents often push too hard because they are afraid, live in a competitive world, or want their child to fulfil their own dreams.',
  'A parent’s real job is to help their child learn with clear rules and kindness, so that school helps them grow instead of feeling like something they must just get through.',
];
const vocabulary=[
  [['academic achievement','school success','學業成就'],['not merely','not only','不僅'],['personal goal','goal','個人目標'],['measure of future security','way to feel safe about the future','衡量未來保障的方式']],
  [['place excessive pressure on their children','push children too hard','施加過度壓力'],['perform well at school','do well at school','在學校表現好']],
  [['In my view','I think','在我看來'],['supportive guides','help and guide','支持性的引導者'],['create discipline','build good habits','建立紀律'],['confidence','believe in themselves','信心'],['source of fear','frightening','恐懼來源']],
  [['over-demanding','ask too much','要求過高'],['safest route','safest way','最安全途徑'],['social mobility','better chances in life','改善社會處境']],
  [['competitive societies','societies where people compete strongly','競爭激烈的社會'],['strong academic record','good school results','優秀學業成績'],['higher-status jobs','better jobs','較高地位工作'],['more stable life','steadier life','更穩定生活']],
  [['As a result','So','因此'],['every grade and ranking','every mark and class position','每個分數與排名'],['affect','change','影響']],
  [['This fear','This worry','這種恐懼'],['compare their children','compare their child','比較子女'],['classmates or relatives','other children in class or in the family','同學或親戚']],
  [['Another reason','also','另一個原因'],['project their own ambitions or regrets onto their children','try to make their children achieve what they themselves wanted but did not get','把自己的抱負或遺憾投射到孩子身上']],
  [['missed educational opportunities','missed a chance to study','錯過教育機會'],['push their sons or daughters too hard','push their children too hard','過分催迫子女'],['rewrite their own story through the next generation','hope their children will have the life they wanted','透過下一代改寫人生故事']],
  [['However','But','然而'],['proper role of a parent','parent’s job','父母的恰當角色'],['act as a second examiner at home','keep testing and judging their child at home','在家當第二個考官']],
  [['provide a calm structure','help children study in a calm way','提供平和有序的學習安排'],['regular study habits','regular study times','規律學習習慣'],['suitable learning environment','good place to work','合適學習環境'],['reasonable expectations','expect what they can reasonably do','合理期望']],
  [['notice when a child is genuinely struggling','see when a child is really finding school hard','留意孩子真的感到吃力'],['respond with patience rather than blame','answer with patience, not blame','以耐心而非責備回應']],
  [['performs poorly in mathematics','does badly in maths','數學成績不佳'],['weak foundations','missed basic lessons','基礎薄弱'],['anxiety','feel worried','焦慮'],['poor study methods','poor way to study','學習方法不當'],['demanding higher marks','asking for higher marks','只要求更高分數']],
  [['Most importantly','Above all','最重要的是'],['protect their child’s long-term attitude towards learning','help their child keep wanting to learn over many years','保護孩子長遠學習態度']],
  [['Encouragement','Kind words','鼓勵'],['honest feedback','truthful advice','誠實回饋'],['emotional security','feeling safe at home','情感安全感'],['resilient','keep going','有韌性'],['self-motivated','want to learn for themselves','自我動力'],['constant pressure','constant pressure','持續壓力'],['associate education with shame and exhaustion','make school feel shameful and tiring','把教育與羞愧疲憊聯繫起來']],
  [['In conclusion','To sum up','總結來說'],['excessive parental pressure','parents often push too hard','過度的父母壓力'],['fear, competition, and personal ambition','afraid, live in a competitive world, or want their child to fulfil their own dreams','恐懼競爭與個人抱負']],
  [['true responsibility','real job','真正責任'],['support learning firmly but kindly','help their child learn with clear rules and kindness','堅定而溫和支持學習'],['path to growth','helps them grow','成長途徑'],['burden to survive','something they must just get through','需要硬撐的負擔']],
];
const chunkOverrides=[
  ['In many families, academic achievement is treated','not merely as a personal goal for children,','but as a measure of future security.'],
  ['This is why some parents place excessive pressure','on their children to perform well at school.'],
  ['In my view, parents should be supportive guides in education:','they should create discipline and confidence','without turning learning into a source of fear.'],
  ['One reason parents become over-demanding is','that they see education','as the safest route to social mobility.'],
  ['In competitive societies, a strong academic record','is often linked to better universities,','higher-status jobs, and a more stable life.'],
  ['As a result, some parents believe','that every grade and ranking may affect their child’s future.'],
  ['This fear can easily become pressure,','especially when parents compare their children','with classmates or relatives.'],
  ['Another reason is that some adults','project their own ambitions or regrets onto their children.'],
  ['If they once missed educational opportunities themselves,','they may push their sons or daughters too hard,','hoping to rewrite their own story through the next generation.'],
  ['However, the proper role of a parent','is not to act as a second examiner at home.'],
  ['Parents should provide a calm structure:','regular study habits, a suitable learning environment,','and reasonable expectations.'],
  ['They should also notice when a child is genuinely struggling','and respond with patience rather than blame.'],
  ['For example, if a child performs poorly in mathematics,','a helpful parent would try to understand','whether the problem is weak foundations, anxiety, or poor study methods,','instead of simply demanding higher marks.'],
  ['Most importantly, parents should protect','their child’s long-term attitude towards learning.'],
  ['Encouragement, honest feedback, and emotional security','can help children become resilient and self-motivated,','whereas constant pressure may make them','associate education with shame and exhaustion.'],
  ['In conclusion, excessive parental pressure often comes','from fear, competition, and personal ambition.'],
  ['A parent’s true responsibility is','to support learning firmly but kindly,','so that education becomes a path to growth','rather than a burden to survive.'],
];
const simpleChunkOverrides=[
  ['In many families, parents see school success','not only as a goal for a child','but also as a way to feel safe about the future.'],
  ['This is why some parents push children too hard','to do well at school.'],
  ['I think parents should help and guide children with school:','they should help them build good habits','and believe in themselves without making learning frightening.'],
  ['Some parents ask too much because they think','education is the safest way','for children to get better chances in life.'],
  ['In societies where people compete strongly,','good school results are often connected','with better universities, better jobs and a steadier life.'],
  ['So some parents think every mark and class position','may change their child’s future.'],
  ['This worry can become pressure,','especially when parents compare their child','with other children in class or in the family.'],
  ['Some adults also try to make their children achieve','what they themselves wanted but did not get.'],
  ['If parents missed a chance to study when they were younger,','they may push their children too hard','because they hope their children will have the life they wanted.'],
  ['But a parent’s job is not','to keep testing and judging their child at home.'],
  ['Parents should help children study in a calm way:','set regular study times,','give them a good place to work,','and expect what they can reasonably do.'],
  ['They should also see when a child','is really finding school hard','and answer with patience, not blame.'],
  ['For example, if a child does badly in maths,','a helpful parent would ask','whether they missed basic lessons, feel worried,','or use a poor way to study,','instead of simply asking for higher marks.'],
  ['Above all, parents should help their child','keep wanting to learn over many years.'],
  ['Kind words, truthful advice and feeling safe at home','can help children keep going','and want to learn for themselves,','but constant pressure may make school feel shameful and tiring.'],
  ['To sum up, parents often push too hard','because they are afraid, live in a competitive world,','or want their child to fulfil their own dreams.'],
  ['A parent’s real job is to help their child learn','with clear rules and kindness,','so that school helps them grow','instead of feeling like something they must just get through.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){
  const text=original[i],parts=[];
  let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);
    if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));
    parts.push(part(link,'link','句型固定部分'));
    cursor=at+link.length;
  }
  if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));
  return {formula,meaning,usage,parts};
}
function card(example,functionName,distractors,frame){
  return {example,distractors,frame,patternType:'reviewed',
    answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,
    distractorReason:`這句${functionName}；它表達的是另一種關係。`};
}
const structures=[
  card('In many homes, reading is treated not merely as homework, but as a way to share ideas.','用 not merely ... but as ... 重定一項活動的雙重意義',[3,7,9],
    fixed(0,'In [群體], [某項成就] is treated not merely as [個人目標], but as [更大意義].','說明家長把成績同時看成孩子目標與未來保障，因此容易投入過多焦慮。','要交代某項成就為何在家庭中承載超過其本身的意義時。',['In ', ', ', ' is treated not merely as ', ', but as '],['家庭或社會情境','被賦予意義的成就','被超越的個人目標','附加的家庭意義'])),
  card('This is why some coaches place extra pressure on young players to train every evening.','用 This is why 由前句原因推出可見的行為',[0,4,15],
    fixed(1,'This is why [某群人] place [某種壓力] on [對象] to [期望表現].','把家長視學業為未來保障的心態，接到對孩子施壓的現象。','已解釋家長相信甚麼，接着要指出這種想法如何影響孩子時。',['This is why ', ' place ', ' on ', ' to '],['持有前述想法的人','施加的壓力','承受壓力的對象','被期望達到的表現'])),
  card('In my view, teachers should be patient guides: they should build routines without making lessons frightening.','用 In my view ... should ...: they should ... without 清楚提出角色及界線',[1,9,13],
    fixed(2,'In my view, [家長] should be [正面角色]: they should [建立紀律與信心] without [使學習變恐懼].','直接回答父母應扮演甚麼角色，並把引導與製造恐懼區分。','引言要回應第二題，說明家長應做甚麼及不應把學習變成甚麼時。',['In my view, ', ' should be ', ': they should ', ' without '],['應扮演角色的人','正面教育角色','需要建立的兩項條件','必須避免的傷害'])),
  card('One reason volunteers become overworked is that managers see their time as free.','用 One reason ... is that 解釋行為背後的觀念',[1,5,7],
    fixed(3,'One reason [某人要求過高] is that [他們相信某途徑最安全].','把父母要求過高，連到他們對教育能改善社會處境的信念。','開始回答為何施壓時，要先提出一個有根據的心理原因時。',['One reason ', ' is that '],['需要解釋的過高要求','背後的教育信念'])),
  card('In busy cities, reliable transport is often linked to better jobs, more free time, and a steadier life.','用 In ... is often linked to 並列某資源的實際回報',[0,3,8],
    fixed(4,'In [競爭環境], [好成績] is often linked to [大學], [工作], and [穩定生活].','解釋父母為何相信教育有用：成績與大學、工作和生活穩定相關。','已提出「教育是安全途徑」，接着要交代這種看法的現實根據時。',['In ', ', ', ' is often linked to ', ', ', ', and '],['競爭環境','被重視的成績','大學機會','工作機會','生活穩定'])),
  card('As a result, some workers believe that every late bus may affect their job security.','用 As a result ... believe that 把前述條件接到當事人的信念',[3,4,6],
    fixed(5,'As a result, [某人] believe that [每項小成績] may affect [未來].','由成績和未來機會的關聯，推到家長過分重視每次分數與排名。','要說明大環境如何變成家長對日常測驗的焦慮時。',['As a result, ', ' believe that ', ' may affect '],['受環境影響的人','被放大的每項成績','被認為受影響的未來'])),
  card('This worry can easily become conflict, especially when managers compare new staff with senior colleagues.','用 especially when 說一種情緒在特定情境下升級',[4,5,8],
    fixed(6,'This [焦慮] can easily become [壓力], especially when [比較情境].','說明對未來的恐懼如何轉化為孩子的壓力，並指出比較會加劇它。','要由內心擔憂推到具體施壓行為，並交代甚麼情況最易發生時。',['This ', ' can easily become ', ', especially when '],['前文的焦慮','轉化出的壓力','加劇壓力的比較情境'])),
  card('Another reason is that some leaders project their own disappointments onto a new team.','用 Another reason is that 加入不同於前一原因的心理動機',[3,6,9],
    fixed(7,'Another reason is that [部分成人] project [自身抱負或遺憾] onto [孩子].','另提出父母的個人抱負或遺憾，避免只用社會競爭解釋壓力。','一個原因已解釋社會競爭，還須補上個人經歷造成的推動力時。',['Another reason is that ', ' project ', ' onto '],['另一些成人','被投射的個人願望或遺憾','承受投射的孩子'])),
  card('If they once missed the chance to travel, they may push their children to go abroad, hoping to relive that dream.','用 If ... may ... hoping to 把過去錯失與今日要求連成因果',[5,7,12],
    fixed(8,'If [父母過去錯過機會], [他們] may [過分催促子女], hoping to [透過子女補償遺憾].','用家長自己的教育錯失，說明為何他們可能把未實現的願望加到孩子身上。','要為「把遺憾投射到子女」提供具體條件和心理過程時。',['If ', ', ', ' may ', ', hoping to '],['父母以往的錯失','有這段經歷的父母','對子女的過度推動','希望補償的心願'])),
  card('However, the proper role of a coach is not to judge every mistake as a final failure.','用 However ... is not to 否定一個會造成傷害的角色定位',[2,8,10],
    fixed(9,'However, the proper role of [家長] is not to [扮演第二位考官].','由分析施壓原因轉入應有角色，先排除在家反覆考核孩子的做法。','前段解釋壓力來源，下一段要釐清父母不應如何參與學習時。',['However, the proper role of ', ' is not to '],['應重新定位角色的人','不該扮演的考官角色'])),
  card('Parents should provide a steady routine: regular reading time, a quiet room, and fair expectations.','用冒號把應提供的環境拆成三項具體安排',[2,9,11],
    fixed(10,'Parents should provide [平和而有序的安排]: [習慣], [環境], and [合理期望].','把支持性引導具體化為學習習慣、合適環境和合理期待。','已說家長不應當考官，接着要列出家中真正可做的安排時。',['Parents should provide ', ': ', ', ', ', and '],['父母提供的整體安排','日常學習習慣','可專注的環境','恰當的期待'])),
  card('They should also notice when a student is falling behind and respond with help rather than blame.','用 notice when ... and respond ... rather than 說觀察困難及回應方式',[6,10,12],
    fixed(11,'They should also notice when [孩子真的遇到困難] and respond with [耐心] rather than [責備].','父母須察覺真正困難，並用耐心取代責怪。','孩子未達預期時，要說明家長先觀察甚麼以及怎樣回應時。',['They should also notice when ', ' and respond with ', ' rather than '],['需留意的困難情境','合適的耐心回應','要避免的責備'])),
  card('For example, if a pupil struggles with reading, a helpful teacher would try to understand whether the cause is missing basics or anxiety, instead of simply demanding more pages.','用 For example, if ... whether ... instead of 展示先診斷再支援的做法',[8,11,14],
    fixed(12,'For example, if [孩子表現欠佳], [父母] would try to understand whether [可能原因], instead of [只要求更高分].','以數學成績為例，列基礎、焦慮和方法三種可能原因，取代只催分數。','要用 instead of 對比追查原因與只要求更高結果兩種回應時。',['For example, if ', ', ', ' would try to understand whether ', ', instead of '],['孩子遇到的具體困難','採取支援態度的父母','值得診斷的可能原因','沒有診斷的單純要求'])),
  card('Most importantly, schools should protect pupils’ long-term interest in reading.','用 Most importantly ... protect ... long-term 說明高於短期成績的目標',[5,10,15],
    fixed(13,'Most importantly, [家長] should protect [孩子對學習的長遠態度].','把焦點由眼前分數提升至孩子能否持續願意學習。','列出家庭安排和個別支援後，要指出最長遠的教育目標時。',['Most importantly, ', ' should protect '],['有責任保護學習態度的人','需要長期維持的學習意願'])),
  card('Praise, clear advice and a safe classroom can help pupils try again, whereas constant criticism may make lessons feel shameful.','用 whereas 對比支持與持續壓力對學習態度的結果',[6,12,16],
    fixed(14,'[鼓勵、回饋與安全感] can help [孩子有韌性及自我動力], whereas [持續壓力] may make [學習聯繫羞愧與疲憊].','對比兩種家庭氛圍：支持促進韌性，長期壓力則損害學習感受。','要用 whereas 並列兩種做法的不同結果，讓對比支持判斷時。',[' can help ', ', whereas ', ' may make '],['正面支持條件','支持帶來的能力','相反的持續壓力','壓力造成的負面聯想'])),
  card('In conclusion, constant school stress often comes from comparison, fear and high expectations.','用 In conclusion ... comes from 濃縮多個原因回答第一問',[3,7,16],
    fixed(15,'In conclusion, [過度壓力] often comes from [恐懼、競爭與個人抱負].','在結論總結父母施壓的三類來源，明確回應第一問。','結論第一句要把前文兩種施壓原因收成簡潔的答案時。',['In conclusion, ', ' often comes from '],['需要解釋的過度壓力','前文分析的原因群'])),
  card('A coach’s true responsibility is to guide firmly but kindly, so that training becomes a path to growth rather than a burden to survive.','用 so that ... rather than 把應有角色接到長期正面結果',[2,13,15],
    fixed(16,'[家長]’s true responsibility is to [堅定而溫和支持], so that [學習成為成長途徑] rather than [難以承受的負擔].','最後把父母角色和孩子的學習經驗連在一起：有要求也有善意。','結論第二句要回答父母應如何參與，並指出這樣做的目的時。',['’s true responsibility is to ', ', so that ', ' rather than '],['應負責任的家長','堅定而溫和的支持','期望出現的成長','應避免的負擔'])),
];
const wrongReasons=[
  ['One reason 解釋家長施壓原因，沒有 not merely ... but 的雙重意義。','Another reason 另列個人抱負，沒有說學業被當成未來保障。','is not to 排除考官角色，沒有重新界定成就的意義。'],
  ['not merely ... but 說學業意義，沒有 This is why 將想法連到施壓。','成績與機會相關是父母信念的現實背景，沒有推出施壓行為。','結論列恐懼等來源，沒有承接前句推出現象。'],
  ['This is why 解釋壓力從何而來，沒有表明父母應有角色。','is not to 只排除考官角色，沒有建立紀律與信心的正面方向。','Most importantly 提出長遠學習態度，沒有引言的角色與界線。'],
  ['This is why 由已知信念推施壓，沒有提出社會流動這個信念。','As a result 說分數排名的焦慮，沒有概括父母要求過高的第一原因。','Another reason 轉到個人遺憾，與社會流動的原因不同。'],
  ['not merely ... but 說學業的雙重意義，沒有列出教育與大學工作的關聯。','One reason 只提出父母觀念，沒有具體的社會回報背景。','錯失教育的個案說個人遺憾，沒有競爭社會的制度條件。'],
  ['One reason 提出一般成因，沒有推到每個分數及排名的焦慮。','成績與未來相關的背景還未出現 As a result 的家長信念。','This fear 說比較如何加壓，沒有每次成績都可能影響未來的想法。'],
  ['成績與機會的關聯是焦慮背景，沒有恐懼轉為壓力的步驟。','As a result 講每個分數影響未來，沒有尤其在比較時加劇。','錯失教育的個案解釋個人遺憾，沒有同學親戚比較。'],
  ['One reason 是第一個社會流動原因，沒有另加個人抱負。','This fear 說競爭焦慮變成壓力，沒有成年人投射遺憾。','is not to 轉入應有角色，沒有提出施壓的第二個原因。'],
  ['As a result 說成績對未來的普遍想法，沒有過去錯失的條件。','Another reason 是總述，沒有具體「錯過機會 → 催迫子女」過程。','數學例子示範如何診斷學習困難，沒有補償父母遺憾。'],
  ['引言提出正面引導角色，沒有轉段後排除第二個考官。','錯失教育例子說壓力原因，沒有父母應避免的角色。','學習安排是接下來的做法，沒有先說不能當家庭考官。'],
  ['引言只總說建立紀律與信心，沒有家中三項具體安排。','is not to 排除考官角色，沒有列習慣、環境與期望。','notice when 說孩子遇困難時的回應，沒有預先提供學習條件。'],
  ['比較會加重壓力，沒有孩子遇困難時以耐心回應。','家庭結構列日常安排，沒有觀察具體困難和避免責備。','數學例子詳細演示診斷，沒有先提出普遍的回應準則。'],
  ['錯失教育的條件句解釋父母施壓，沒有診斷數學困難。','notice when 只說應有態度，沒有基礎、焦慮和方法等具體可能。','whereas 對比長期感受，沒有家長應如何追查低分原因。'],
  ['As a result 是家長看重每分的焦慮，沒有轉向長遠學習意願。','家中三項安排是具體做法，沒有點出高於短期成績的目標。','結論總結施壓來源，沒有孩子對學習的長期態度。'],
  ['比較使恐懼成壓力，只寫負面一面，沒有 whereas 對照兩種結果。','數學例子示範診斷，沒有鼓勵和壓力對韌性的長期對照。','so that 結尾講成長與負擔，沒有列鼓勵、回饋和安全感的機制。'],
  ['One reason 只提出社會流動原因，沒有結論合併恐懼與個人抱負。','Another reason 另提投射遺憾，沒有總結前文兩組原因。','結尾的責任句回答父母應做甚麼，沒有重述施壓原因。'],
  ['引言的角色句預告做法，沒有結尾把做法接到成長結果。','Most importantly 強調長遠態度，沒有 so that 的目的與負擔對比。','結論第一句只總結施壓原因，沒有回答父母真正責任。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分別回答甚麼？',[
    '父母為何過度施壓，以及父母在子女教育中應扮演甚麼角色',
    '所有家長應支付多少學費，以及學校應如何計算排名',
    '孩子何時開始考試，以及哪個家庭應搬近比較好的大學',
    '教師應否停止評分，以及每個學生每天須做多少功課',
  ],'題目先問過度壓力的原因，再問父母應如何參與教育。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '家長把教育連到未來機會，也可能把自身錯失投射到孩子身上',
    '父母應建立穩定學習條件、耐心診斷困難並保護長遠學習意願',
    '孩子每次低分都只因不努力，父母只須要求下次拿高分',
    '只要社會競爭激烈，父母製造恐懼就必然有教育效果',
  ],correct:[0,1],why:'第一段解釋社會競爭與個人遺憾；第二段提出支持而非家庭考核的角色。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言定位','學業被視為未來保障，因而可能引發壓力；父母應是有要求又有支持的引導者。'],
  ['施壓成因','教育與大學工作機會相連，家長因恐懼而比較；有些人還投射自身遺憾。'],
  ['父母角色','提供規律與合理期望，遇困難先診斷，用耐心和鼓勵保護學習態度。'],
  ['結論雙重回答','重申壓力源於恐懼、競爭與抱負；教育應是成長之路而非難捱負擔。'],
],'先交代問題與立場 → 解釋為何施壓 → 說明應做的具體事 → 回答兩問。')];
const evidence=[
  quiz('家長為何把每次分數看得很重？',[
    '他們相信成績與大學、工作和生活穩定相關，因而擔心排名影響未來',
    '他們認為成績完全不影響任何機會，所以每次考試都不重要',
    '他們只因孩子喜歡某科，便必定要比較所有親戚的成績',
    '他們相信每個孩子都須走同一條職業道路，文章未討論大學',
  ],'作者先給社會競爭的背景，再以 As a result 推出分數焦慮。'),
  quiz('父母把孩子與同學或親戚比較，在論證中起甚麼作用？',[
    '使對未來的恐懼更容易轉成施加在孩子身上的壓力',
    '證明所有同學或親戚必然有較高的學習能力',
    '直接說明孩子已經有完善的學習環境和合理期望',
    '表示排名與父母對未來的想法完全沒有關聯',
  ],'尤其在比較時，家長的焦慮更容易變成孩子感受到的壓力。'),
  quiz('過去錯失教育機會的父母，可能為何過度催迫子女？',[
    '希望子女達成自己未實現的願望，彷彿能補回舊遺憾',
    '認為子女完全不需要學校或任何未來工作機會',
    '只為讓親戚看到學校排名，與自己經歷無關',
    '因為自己未上大學，所以必然反對子女接受教育',
  ],'這是個人抱負或遺憾投射到下一代的具體例子。'),
  quiz('「家中的第二個考官」代表哪種父母角色？',[
    '只反覆評分和要求更高分，卻沒有提供孩子需要的支援',
    '建立規律習慣，並讓孩子在合適環境中學習',
    '孩子遇到困難時，先了解原因再提供耐心回應',
    '給孩子誠實回饋與安全感，保護長期學習興趣',
  ],'作者否定考官角色，之後才列出應有的家庭學習安排。'),
  quiz('數學表現欠佳的例子，父母應先做甚麼？',[
    '查明是否基礎薄弱、焦慮或方法不當，再決定如何幫助',
    '只要求下次拿更高分，毋須了解真正遇到甚麼困難',
    '把一次低分當成孩子永久缺乏能力的證據',
    '只比較孩子與親戚的分數，不問學習環境和方法',
  ],'例子把 patience 轉成具體診斷，而不只是說一句「要有耐心」。'),
  quiz('鼓勵與持續壓力在文中帶來甚麼不同結果？',[
    '支持可培養韌性與自我動力，壓力則可能令學習聯繫羞愧和疲憊',
    '支持只會降低學習意願，壓力必然帶來長期自我動力',
    '兩者結果完全相同，所以家長的回應方式不重要',
    '孩子只需短期分數，對學習的長期感受不屬於教育',
  ],'whereas 對比兩種家庭氛圍對長遠學習態度的影響。'),
];
const logic=[
  sequence('第一主體段：家長壓力由何而來',[
    ['社會流動信念','家長把教育看成孩子改善未來處境的安全途徑。'],
    ['現實關聯','成績可能影響大學、工作和生活穩定。'],
    ['分數焦慮','家長於是認為每次分數與排名都關乎未來。'],
    ['比較加劇','孩子與同學或親戚被比較，恐懼更容易變成壓力。'],
    ['另一來源','部分父母把自身未實現的教育願望加到孩子身上。'],
  ],'一條鏈由社會競爭推到分數壓力；另一條鏈由父母個人錯失推到過度催迫。'),
  sequence('第二主體段：支持性父母的具體工作',[
    ['否定考官角色','父母不應在家只增加一套評分和責備。'],
    ['提供基本條件','安排規律習慣、合適環境和合理期望。'],
    ['辨認真正困難','孩子吃力時先觀察，再以耐心回應。'],
    ['數學個案','查基礎、焦慮或學習方法，而非只催更高分。'],
    ['保護長遠意願','鼓勵、誠實回饋與安全感有助韌性和自我動力。'],
  ],'家長角色從安排條件走到個別支援，最後回到孩子能否持續願意學習。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('一名家長認為每次小測排名都會決定孩子將來能否找到工作，因此天天責問成績。','哪項最能轉用範文的壓力成因分析？',[
    '指出未來保障的焦慮如何把每次排名放大成壓力',
    '只說家長不喜歡測驗，完全不問其對未來的擔心',
    '把所有責問歸咎孩子，排除家長對工作機會的想法',
    '假設一次排名真能完全決定每位孩子的職業道路',
  ],[
    '範文把學業視作未來保障，再推到家長對每個分數與排名的焦慮。',
    '題目已說家長擔心工作機會，不能省掉這個原因。',
    '這忽略家長施壓的心理來源。',
    '範文描述家長的信念，並未證明每次排名能決定一生。',
  ],[0,3,4,5],'範文說學業被當成未來保障；在競爭社會中，成績與機會相連，令家長放大每次分數。'),
  transfer('一名父親年輕時沒機會學音樂，現在要求女兒每天長時間練琴，即使她已感到害怕。','哪項最能解釋這類要求過高？',[
    '父親可能把自己的錯失和願望加到女兒身上',
    '女兒恐懼證明練琴時間必定完全不夠',
    '父親錯過機會，便表示女兒必然也會錯過',
    '練琴與父親經歷無關，只由女兒成績決定',
  ],[
    '範文的第二個原因是成人把個人抱負或遺憾投射到孩子身上。',
    '害怕是需留意的結果，不能單憑它要求更多練習。',
    '父親經歷不能直接決定女兒將來。',
    '題目特別提供父親錯失機會的背景。',
  ],[7,8],'範文用父母錯失教育機會的例子，說明他們可能透過下一代補償自身遺憾。'),
  transfer('孩子英文測驗失分，家長想把每次練習都當小考，卻沒有固定讀書時間或安靜位置。','哪項最符合範文的父母角色？',[
    '先建立規律時間、合適環境與合理期望，再看學習困難',
    '只增加家中測驗次數，假設環境和期望完全不影響學習',
    '因一次失分便停止全部英文學習，避開任何後續支援',
    '每天只要求更高分，不查孩子是否有基本知識缺口',
  ],[
    '範文反對家庭第二考官，並列出規律、環境和合理期望。',
    '只加測驗重現作者否定的考官角色。',
    '作者主張支援而非放棄學習。',
    '只催分數沒有解決基本條件和具體困難。',
  ],[9,10,11],'範文說父母不是家中第二考官，應提供規律習慣、合適環境和合理期望。'),
  transfer('學生數學成績突然下降，家長不知道是基礎不足、焦慮還是讀書方法不合適。','下一步最符合範文的數學個案？',[
    '先與孩子查清可能原因，再按需要提供耐心幫助',
    '先要求所有科目加倍練習，不必辨認困難來源',
    '先拿親戚分數作比較，讓孩子感受更強壓力',
    '只把低分記錄在家中排名，毋須提供任何回饋',
  ],[
    '範文要求了解基礎、焦慮或方法，再回應，而不是只催高分。',
    '未診斷便加量，可能錯過真正困難。',
    '比較可能把家長焦慮變成孩子壓力。',
    '只排名仍是考官角色，沒有支援。',
  ],[11,12],'範文的數學例子先列三種可能原因，再排除只要求更高分的做法。'),
  transfer('運動員連續失誤，教練只用羞辱要求好成績，隊員開始害怕訓練。','哪項最能轉用範文對長期態度的關注？',[
    '給誠實回饋與安全感，保護隊員持續練習的意願',
    '繼續羞辱，因為短期恐懼必然形成長久的自我動力',
    '完全停止給回饋，讓隊員不知錯誤如何改進',
    '只記錄失誤名次，不問隊員是否願意繼續訓練',
  ],[
    '範文重視鼓勵、真實回饋和情感安全對長期韌性的作用。',
    '範文說持續壓力可能造成羞愧和疲憊。',
    '誠實回饋是支持的一部分，不是應取消的東西。',
    '只看名次會漏掉長遠態度。',
  ],[13,14,16],'範文把鼓勵、誠實回饋及安全感連到韌性與自我動力，並對照持續壓力的傷害。'),
  transfer('課後中心有一名學生學習慢，導師只告訴他「下次必須更高分」，沒有了解困難。','哪項最能補足導師的支援？',[
    '詢問是否缺基本知識、感到焦慮或使用不合適方法',
    '繼續重複相同分數要求，不提供任何診斷或幫助',
    '把慢速學習直接判為懶惰，避免觀察具體情況',
    '只比較他與其他學生，不問他遇到甚麼困難',
  ],[
    '範文把耐心具體化為查找基礎、焦慮與學習方法。',
    '只催分數正是範文例子反對的做法。',
    '這沒有證據，也沒有辨認可處理的困難。',
    '比較可能加壓，不能代替診斷。',
  ],[11,12],'範文的 helpful parent 會查明問題原因，不只是要求更高分。'),
  transfer('一所學校在給家長的信中，只鼓勵用更高排名來督促孩子，卻沒有談合理期望。','哪項修改最符合範文的完整立場？',[
    '加入規律學習安排、合理期望與遇困難時的耐心支援',
    '只公布更細的排名，讓每位家長更頻繁比較孩子',
    '取消所有家長參與，因為紀律與信心只能由學校建立',
    '只要求孩子自學，不用提供合適的家庭學習環境',
  ],[
    '範文的家長角色包含規律、信心、合理期待及耐心。',
    '頻繁比較可使家長恐懼轉成壓力。',
    '原文要家長作支持性引導者，不是完全退出。',
    '適合的學習環境是原文明確列出的家庭責任。',
  ],[2,6,10,11],'範文承認需要紀律，卻強調不以恐懼取代合理期望和實際支援。'),
  transfer('父母希望孩子進好大學，也希望他每天開心學習，兩個願望出現衝突。','哪項做法最貼近範文的取捨？',[
    '保留合理的學習目標，同時避免把每次分數變成恐懼',
    '為了進好大學，把所有低分當成孩子不夠努力',
    '為了讓孩子開心，完全不需要習慣或誠實回饋',
    '只用親戚排名定目標，不問孩子能否持續學習',
  ],[
    '範文不是反對要求，而是要堅定而溫和地支持長遠成長。',
    '一次低分可能來自基礎、焦慮或方法，需要了解。',
    '原文仍主張紀律、合理期望與誠實回饋。',
    '比較容易把家長焦慮加到孩子身上。',
  ],[2,5,13,16],'範文希望父母建立紀律與信心，並保護孩子長遠的學習態度。'),
  transfer('一名家長擔心孩子將來工作不穩，於是每晚拿親戚成績作比較，孩子開始迴避學習。','哪項分析最完整？',[
    '辨認未來焦慮、比較壓力及孩子學習意願受損的連鎖',
    '只說孩子迴避學習是天生問題，不查家長的比較方式',
    '只說工作不穩便必須每天比較，毋須看孩子的感受',
    '只要求孩子下次高分，不處理焦慮和長遠學習態度',
  ],[
    '範文由未來保障焦慮推到比較造成壓力，再談長期學習感受。',
    '題目提供明確的家長行為和孩子反應。',
    '作者解釋焦慮來源，不等於認可比較施壓。',
    '只催分數會延續問題而非處理機制。',
  ],[0,5,6,13,14],'範文把家長對未來的擔憂、與他人比較及孩子對學習的長遠態度連成論證。'),
  transfer('社區中心準備寫一段給家長的總結，要同時回答「為何施壓」與「應做甚麼」。','哪項最完整回應範文兩問？',[
    '壓力常出自恐懼與個人遺憾；家長應有要求也有耐心',
    '只要求家長停止查看分數，不討論焦慮的成因',
    '只解釋社會競爭，不說家長如何支援遇困難的孩子',
    '只列長遠好處，不說持續壓力如何傷害學習意願',
  ],[
    '範文結論同時總結施壓來源，並界定堅定而溫和的支持角色。',
    '這沒有完整交代第一問，也忽略合理期望。',
    '第二問需要具體家長角色，不能只列成因。',
    '範文也要對照支持與壓力的不同結果。',
  ],[15,16],'範文結尾先歸納恐懼、競爭及個人抱負，再提出父母應堅定而溫和地支持成長。'),
];
const editorialWrongChoices=[
  ['排名影響升學，家長責問主要來自學校的小測安排','先分析孩子對職業的想法，家長焦慮可稍後再問','家長擔心未來，但壓力主要來自孩子目前不夠用功'],
  ['父親重視音樂教育，女兒恐懼主要因練習技巧不足','父親錯過學習機會，女兒應替他完成同樣目標','女兒受壓可能因競賽制度，父親願望只是次要因素'],
  ['先建立固定練習時段，環境與期望待成績進步再調整','讓孩子自選安靜位置，讀書時間由每人自行安排','先問測驗難度，再把家長較高期望當作學習動力'],
  ['先讓孩子加倍練習，原因可由下次測驗結果推斷','先調整學習方法，焦慮與基礎缺口可稍後再問','先降低數學目標，不與孩子討論成績下降的原因'],
  ['維持高要求，把羞辱改成公開比較讓隊員警醒','先停練以避免恐懼，賽季結束後再提供誠實回饋','讓隊員自行消化失誤，教練只記錄下一場的成績'],
  ['先安排額外練習，焦慮等因素待分數未升時再查','先比較他與同伴表現，再判斷是否缺基本知識','先提高最低分要求，方法問題交由學生自行調整'],
  ['加入規律安排，合理期望與耐心支援留待個別諮詢','加入合理期望，但不提供家庭學習環境的具體建議','加入耐心鼓勵，同時仍把排名當成唯一進步指標'],
  ['維持升大學目標，低分時加強比較以維持學習動力','先減少小測，學習習慣與回饋留待升學前再建立','以孩子每天快樂為先，原有學習目標暫時取消'],
  ['未來焦慮可解釋比較，孩子迴避主要是自律不足','親戚成績可作參考，孩子感受留待大考後再問','先處理孩子迴避，家長比較方式不是分析重點'],
  ['先說家長擔心未來，再要求孩子努力提高分數','說明個人遺憾的作用，具體支援交由學校處理','提出耐心回饋建議，但不解釋家長施壓的成因'],
];
const editorialWrongFeedback=[
  ['小測安排是背景，題目重點是未來焦慮如何放大排名。','孩子觀點值得聽，也要理解家長施壓的焦慮來源。','把壓力歸給孩子，漏掉家長對職業前景的擔心。'],
  ['練習方法可調，但父親的遺憾與期待更直接解釋要求。','女兒不必替父親完成其未實現的願望。','可能有競賽壓力，但此例明示父親的個人經歷。'],
  ['固定時間有用，但忽略目前缺乏安靜環境與合理期望。','環境改善不等於可以沒有規律安排。','考題難度值得查，較高期望也可能加重壓力。'],
  ['多練習未必對準基礎、焦慮或方法問題。','先只改方法，仍未辨明成績下降的真正原因。','降低目標可減壓，但不問原因便難以提供支援。'],
  ['公開比較仍可能傷害安全感與持續練習意願。','暫停訓練未必必要，回饋應及時而耐心。','教練不只記分，也要幫隊員理解與改善失誤。'],
  ['加練或有用，但應先了解困難來源。','比較分數不能直接診斷知識缺口或焦慮。','提高要求若沒有方法支援，仍重複原來問題。'],
  ['個別諮詢可補充，信中仍應說明合理期望與支援。','只給期望而無環境和方法，仍不完整。','耐心鼓勵與單靠排名衡量成長不相容。'],
  ['頻繁比較可能把低分變成恐懼。','減少小測未必解決缺少規律與誠實回饋的問題。','保護快樂不要求完全取消合理學習目標。'],
  ['孩子迴避可能是比較壓力造成，不能只歸於自律。','孩子已開始迴避，感受不宜等到大考後再處理。','家長比較方式正是因果鏈中的關鍵一環。'],
  ['只要求更高分，沒有回答家長應怎樣支援。','學校可合作，家長仍須調整自身做法。','第二問有建議，第一問的施壓原因仍未回答。'],
];
transferTasks.forEach((item,index)=>{item.options=[item.options[0],...editorialWrongChoices[index]];item.explanations=[item.explanations[0],...editorialWrongFeedback[index]];item.why=item.explanations[0]});
export default {
  key:'direct-question:11',
  meta:{topic:'父母施壓與教育角色',summary:'升學競爭和個人遺憾可能促成過度壓力；父母應有要求、有耐心地支持長遠學習。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
