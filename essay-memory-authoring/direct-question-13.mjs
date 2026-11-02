// Human-authored support for Direct Question 13; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-13-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:13'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People often think school is the clearest way to become useful to society, especially because doctors, engineers and researchers need a lot of knowledge.',
  'But I do not think people with a lot of formal education are the most useful people in society.',
  'Society does best when what people learn in school works together with what they can do in real life, and many important skills come from doing work, not only reading about it.',
  'The main reason is that we should judge people’s value by what they do for others, not by their certificates.',
  'Someone who studied a lot may know ideas and rules, but this knowledge only helps other people when that person uses it well.',
  'For example, a trained manager may know how a company should work, but a shop owner, builder or local volunteer with years of practice may know people better, know when to act and see dangers sooner because they have solved real problems many times.',
  'So education is a useful tool, but having it does not automatically make someone worth more than another person.',
  'A society that only respects degrees may fail to notice the quiet skills that keep daily life working.',
  'People can also learn useful skills by doing things in real life.',
  'One is solving real problems: people who fix machines, care for children or run busy kitchens often learn to spot small signs of trouble before a big problem happens.',
  'This helps society because it stops waste, accidents and things going wrong.',
  'Another skill is understanding people and situations.',
  'After many years of speaking with customers, patients, neighbours or workmates, people learn to wait calmly, talk through disagreements and understand others, which helps stop arguments and build trust.',
  'For example, an experienced nurse, a person who fixes machines or a carer for older people may calm an upset group not because they learned one rule by heart, but because they can see how people feel and choose a good response.',
  'To sum up, I do not think people with formal education are always the most useful to society.',
  'School matters, but people also help society through skills learned by doing, such as making good choices, talking with others, understanding feelings and solving practical problems.',
];
const vocabulary=[
  [['Formal education','school','正規教育'],['clearest route to social value','clearest way to become useful to society','創造社會價值的明顯途徑'],['rely on advanced knowledge','need a lot of knowledge','依賴高深知識']],
  [['However','But','然而'],['educated people','people with a lot of formal education','受過教育的人'],['most valuable members of society','most useful people in society','社會最有價值的人']],
  [['Society is best served','Society does best','最能造福社會'],['academic expertise','what people learn in school','學術專業知識'],['practical competence','what they can do in real life','實際能力'],['essential skills','important skills','重要技能'],['learned by doing','come from doing work','透過實踐學會']],
  [['measured by contribution','judge people’s value by what they do for others','以貢獻衡量'],['credentials','certificates','學歷資歷']],
  [['An educated person','Someone who studied a lot','受過教育的人'],['theories, systems and principles','ideas and rules','理論系統與原則'],['socially useful','helps other people','對社會有用'],['applied with judgment','uses it well','審慎應用']],
  [['qualified manager','trained manager','合資格經理'],['organisation','company','機構'],['experienced shop owner, builder or community volunteer','shop owner, builder or local volunteer with years of practice','有經驗店主建築工或義工'],['people, timing and risk','know people better, know when to act and see dangers sooner','人時機與風險'],['solved real problems repeatedly','solved real problems many times','反覆解決真實問題']],
  [['In this sense','So','從這個意義說'],['powerful tool','useful tool','強大的工具'],['crown that automatically makes one person more valuable than another','having it does not automatically make someone worth more than another person','不會自動令一人較有價值']],
  [['respects only degrees','only respects degrees','只尊重學位'],['become blind to','fail to notice','忽略'],['quiet competence','quiet skills','默默的能力'],['keeps daily life running','keep daily life working','維持日常生活運作']],
  [['socially valuable skills','useful skills','對社會有價值的技能'],['through experience','by doing things in real life','透過經驗']],
  [['practical problem-solving','solving real problems','實際解決問題'],['repair machines','fix machines','修理機器'],['manage busy kitchens','run busy kitchens','管理繁忙廚房'],['notice small warning signs','spot small signs of trouble','察覺小警號'],['serious failures','a big problem','嚴重失誤']],
  [['This benefits society','This helps society','對社會有益'],['prevents','stops','防止'],['disorder','things going wrong','混亂']],
  [['Another','Another skill','另一種'],['human judgment','understanding people and situations','判斷人與情境的能力']],
  [['Through years of dealing with','After many years of speaking with','多年與人打交道'],['colleagues','workmates','同事'],['patience','wait calmly','耐性'],['negotiation','talk through disagreements','協商'],['empathy','understand others','同理心'],['reduce conflict','stop arguments','減少衝突']],
  [['experienced nurse, mechanic or elderly caregiver','experienced nurse, a person who fixes machines or a carer for older people','有經驗護士機械師或長者照顧者'],['tense situation','upset group','緊張情況'],['memorised a rule','learned one rule by heart','背熟規則'],['read the room','see how people feel','洞察現場氣氛'],['respond wisely','choose a good response','明智回應']],
  [['In conclusion','To sum up','總結來說'],['educated people','people with formal education','受過教育的人'],['most valuable for society','most useful to society','對社會最有價值']],
  [['Education is important','School matters','教育很重要'],['social value','help society','社會價值'],['experience-based skills','skills learned by doing','經驗技能'],['practical judgment','making good choices','實際判斷'],['emotional intelligence','understanding feelings','情緒智慧'],['hands-on problem-solving','solving practical problems','親手解決問題']],
];
const chunkOverrides=[
  ['Formal education is often treated','as the clearest route to social value,','especially because doctors, engineers and researchers','rely on advanced knowledge.'],
  ['However, I do not think educated people','are the most valuable members of society.'],
  ['Society is best served','when academic expertise is combined with practical competence,','and many essential skills are learned by doing','rather than by studying alone.'],
  ['The main reason is that value','should be measured by contribution,','not by credentials.'],
  ['An educated person may understand theories, systems and principles,','but this knowledge only becomes socially useful','when it is applied with judgment.'],
  ['A qualified manager, for instance, may know','how an organisation should operate,','yet an experienced shop owner, builder or community volunteer','may understand people, timing and risk far better','because they have solved real problems repeatedly.'],
  ['In this sense, education is a powerful tool,','but it is not a crown','that automatically makes one person more valuable than another.'],
  ['A society that respects only degrees','can become blind to the quiet competence','that keeps daily life running.'],
  ['People can also learn several socially valuable skills','through experience.'],
  ['One is practical problem-solving:','workers who repair machines, care for children or manage busy kitchens','often learn to notice small warning signs','before they become serious failures.'],
  ['This benefits society','because it prevents waste, accidents and disorder.'],
  ['Another is','human judgment.'],
  ['Through years of dealing with customers, patients, neighbours or colleagues,','people learn patience, negotiation and empathy,','which help reduce conflict and build trust.'],
  ['For example, an experienced nurse, mechanic or elderly caregiver','may calm a tense situation','not because they have memorised a rule,','but because they can read the room and respond wisely.'],
  ['In conclusion, I do not believe','that educated people are the most valuable for society.'],
  ['Education is important,','but social value also comes from experience-based skills','such as practical judgment, communication, emotional intelligence','and hands-on problem-solving.'],
];
const simpleChunkOverrides=[
  ['People often think school is the clearest way','to become useful to society,','especially because doctors, engineers and researchers','need a lot of knowledge.'],
  ['But I do not think people with a lot of formal education','are the most useful people in society.'],
  ['Society does best when what people learn in school','works together with what they can do in real life,','and many important skills come from doing work,','not only reading about it.'],
  ['The main reason is that we should judge people’s value','by what they do for others,','not by their certificates.'],
  ['Someone who studied a lot may know ideas and rules,','but this knowledge only helps other people','when that person uses it well.'],
  ['For example, a trained manager may know','how a company should work,','but a shop owner, builder or local volunteer','with years of practice may know people better,','know when to act and see dangers sooner','because they have solved real problems many times.'],
  ['So education is a useful tool,','but having it does not automatically make someone','worth more than another person.'],
  ['A society that only respects degrees','may fail to notice the quiet skills','that keep daily life working.'],
  ['People can also learn useful skills','by doing things in real life.'],
  ['One is solving real problems:','people who fix machines, care for children or run busy kitchens','often learn to spot small signs of trouble','before a big problem happens.'],
  ['This helps society','because it stops waste, accidents and things going wrong.'],
  ['Another skill is','understanding people and situations.'],
  ['After many years of speaking with customers,','patients, neighbours or workmates,','people learn to wait calmly, talk through disagreements','and understand others,','which helps stop arguments and build trust.'],
  ['For example, an experienced nurse,','a person who fixes machines or a carer for older people','may calm an upset group','not because they learned one rule by heart,','but because they can see how people feel','and choose a good response.'],
  ['To sum up, I do not think','people with formal education','are always the most useful to society.'],
  ['School matters,','but people also help society through skills learned by doing,','such as making good choices, talking with others,','understanding feelings and solving practical problems.'],
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
  card('University study is often treated as the surest route to a good job, especially because some careers need advanced training.','用 is often treated as ... especially because 說明常見觀點及其理由',[1,3,8],
    fixed(0,'[正式教育] is often treated as [最清晰的社會價值途徑], especially because [專業人士依賴高深知識].','先公平說出人們為何看重正規教育，再準備檢查它是否等於最高價值。','引言要介紹題中觀點，並給一個可理解的理由時。',[' is often treated as ', ', especially because '],['被看重的教育途徑','被賦予的社會地位','支撐這種看法的職業知識需求'])),
  card('However, I do not think university graduates are the most valuable members of every community.','用 I do not think ... are the most 直接否定排他的最高價值判斷',[0,4,14],
    fixed(1,'However, I do not think [受過教育者] are the most valuable [社會成員].','明確回答第一題：有學歷者重要，但不能被一概列為最有價值。','題目問某群人是否「最有價值」，需在引言直接表態時。',['However, I do not think ', ' are the most valuable '],['被評估的人群','被否定的最高價值定位'])),
  card('Society is best served when technical knowledge is combined with practical experience, and many skills are learned by doing rather than reading alone.','用 when ... combined with ... and ... rather than 連結兩種能力及其學習途徑',[3,5,15],
    fixed(2,'Society is best served when [學術知識] is combined with [實際能力], and [重要技能] are learned by doing rather than [只靠讀書].','提出全文主張：學術知識與實作能力應結合，許多技能要從做事中學。','引言需同時回答「誰有價值」及「經驗能教甚麼」時。',['Society is best served when ', ' is combined with ', ', and ', ' are learned by doing rather than '],['學術專業知識','可配合的實際能力','從經驗得到的技能','不足以單獨形成該技能的方式'])),
  card('The main reason is that a volunteer’s impact should be measured by what they contribute, not by their certificates.','用 measured by ... not by 建立衡量價值的準則',[1,4,7],
    fixed(3,'The main reason is that [人的價值] should be measured by [實際貢獻], not by [學歷資歷].','以貢獻而非證書作衡量標準，支撐反對「有學歷者最有價值」的立場。','要指出評價一個人對社會價值時應用甚麼標準時。',['The main reason is that ', ' should be measured by ', ', not by '],['需要被衡量的價值','應重視的實際貢獻','不應單靠的資歷'])),
  card('A trained driver may understand road rules, but this knowledge only becomes socially useful when it is applied with good judgment.','用 may understand ... but ... only ... when 說知識須經判斷實際應用',[2,3,10],
    fixed(4,'[受教育者] may understand [理論知識], but this knowledge only becomes socially useful when [審慎應用].','承認理論知識的作用，補上它轉化為社會貢獻所需的實際判斷。','要避免貶低知識，同時說明知識何時才真正幫到人時。',[' may understand ', ', but this knowledge only becomes socially useful when '],['有知識的人','能掌握的理論','使知識變有用的實際應用'])),
  card('A trained planner may know the schedule, yet an experienced driver may understand traffic delays far better because she has faced them many times.','用 may know ... yet ... may understand ... because 比較學歷與反覆解題的經驗',[2,6,13],
    fixed(5,'[受訓者] may know [制度理論], yet [有經驗的工作者] may understand [人、時機與風險] far better because [反覆處理真實問題].','用經理與店主、建築工人和義工對照，顯示現場判斷來自實際反覆解題。','要用人物比較說明經驗在某些情境為何勝過純理論時。',[' may know ', ', yet ', ' may understand ', ' far better because '],['有正式資格的人','他懂的制度理論','從經驗學習的工作者','現場判斷內容','反覆經驗的原因'])),
  card('In this sense, a degree is a powerful tool, but it is not a prize that automatically makes its holder more helpful than everyone else.','用 powerful tool ... but not a crown 修正把證書當優越標誌的想法',[1,4,7],
    fixed(6,'In this sense, [教育] is a powerful tool, but it is not [自動令某人較有價值的皇冠].','承認教育強大，但拒絕把學歷當成自動高於他人的身分標誌。','比較理論和實務後，要用形象語言概括這種平衡立場時。',['In this sense, ', ' is a powerful tool, but it is not '],['有用的教育','被否定的自動優越象徵'])),
  card('A society that respects only titles can become blind to the quiet skills that keep daily work running.','用 A ... that respects only ... can become blind to 指出單一標準的盲點',[0,3,6],
    fixed(7,'A society that respects only [學位] can become blind to [維持日常的默默能力].','指出只尊重學位，會忽略實際維持日常服務的技能。','已訂「看貢獻」標準，接着要指出只看證書會漏掉甚麼時。',['A society that respects only ', ' can become blind to '],['被獨尊的資歷','被忽視的日常能力'])),
  card('People can also learn several useful safety skills through experience.','用 learn ... through experience 轉向第二題的技能清單',[2,9,11],
    fixed(8,'People can also learn [數種對社會有價值的技能] through experience.','由第一題的價值判斷，轉入第二題要列舉的經驗技能。','另一主體段開始，需先宣告接下來列出哪些由實作學來的能力時。',['People can also learn ', ' through experience.'],['接下來要解釋的經驗技能'])),
  card('One is spotting problems early: workers who run busy kitchens often learn to notice warning signs before meals become unsafe.','用 One is ...: workers who ... before 寫具體技能及預防機制',[8,10,12],
    fixed(9,'One is [實際解難]: workers who [在現場工作] often learn to notice [小警號] before [重大失誤].','以修機器、照顧兒童和廚房工作說明實作讓人及早發現風險。','已提出經驗技能類別，要用實際工作和可觀察作用把它講清楚時。',['One is ', ': workers who ', ' often learn to notice ', ' before '],['第一種技能','反覆處理現場情況的工作者','需要提早發現的警號','應避免的嚴重後果'])),
  card('This benefits society because it prevents waste, injuries and delays.','用 This benefits ... because 直接說明技能的社會效益',[4,9,15],
    fixed(10,'This benefits society because it prevents [浪費、意外與混亂].','接上及早發現警號，說明實際解難對社會的直接好處。','已舉出某技能如何運作，接着要回答它為何有社會價值時。',['This benefits society because it prevents '],['被減少的具體損失'])),
  card('Another is careful judgment when dealing with people.','用 Another is 簡短開啟另一種經驗技能',[8,10,12],
    fixed(11,'Another is [判斷人與情境的能力].','由實際解難轉到多年與人互動而建立的人際判斷。','第二題要在第一種技能後，明確標出另一類技能時。',['Another is '],['第二種由經驗學來的技能'])),
  card('Through years of dealing with visitors, families and colleagues, people learn patience and empathy, which help reduce conflict and build trust.','用 Through years of ... which help 說反覆人際接觸如何帶來社會效益',[5,11,13],
    fixed(12,'Through years of dealing with [不同的人], people learn [耐性、協商和同理心], which help [減少衝突並建立信任].','具體展開人際判斷：多年與顧客、病人等互動能培養協商與同理心。','已提出人際判斷這一類，接着要解釋它如何學會及為何有用時。',['Through years of dealing with ', ', people learn ', ', which help '],['反覆接觸的不同人','因此學得的人際技能','社會關係上的成效'])),
  card('For example, an experienced coach may calm a tense team not because she has memorised a rule, but because she can read the room and respond wisely.','用 not because ... but because 對照背規則與現場判斷',[4,5,12],
    fixed(13,'For example, [有經驗的工作者] may calm [緊張情況] not because [背熟規則], but because [看懂情境並明智回應].','透過護士等個案指出現場判斷不只是記住規則，而是理解情境。','需要用一個人際個案證明經驗如何轉成即時、恰當的行動時。',['For example, ', ' may calm ', ' not because ', ', but because '],['有現場經驗的人','需要安撫的情況','被否定的單靠背誦','真正發揮作用的判斷'])),
  card('In conclusion, I do not believe that university graduates are the most useful people in every community.','用 I do not believe that 重申對最高價值說法的否定',[1,8,15],
    fixed(14,'In conclusion, I do not believe that [受教育者最有價值的說法].','結論直接重答第一題，不把正式教育當成唯一最高價值來源。','結論要明確回到題目「是否最有價值」時。',['In conclusion, I do not believe that '],['被否定的最高價值說法'])),
  card('Education is important, but social value also comes from skills learned in practice such as judgment, communication and solving real problems.','用 Education is important, but ... such as 收束兩種價值來源及經驗技能',[2,10,14],
    fixed(15,'Education is important, but social value also comes from [經驗技能] such as [判斷、溝通、情緒理解與實作解難].','承認教育重要，同時列出經驗形成的技能，完整回答第二題。','結論第二句要平衡教育與經驗，並重述經驗能給社會甚麼時。',['Education is important, but social value also comes from ', ' such as '],['經驗形成的技能','技能的具體例子'])),
];
const wrongReasons=[
  ['I do not think 是作者立場，沒有先說人們為何重視教育。','measured by contribution 提出衡量標準，沒有介紹教育重要的常見理由。','技能段的轉句沒有醫生等職業依賴專業知識的背景。'],
  ['is often treated as 說常見觀點，沒有作者對「最有價值」的否定。','An educated person may 承認理論知識，沒有直接回應最高價值說。','In conclusion 重申立場，但沒有引言首次表態的作用。'],
  ['measured by contribution 訂評估標準，沒有學術與實作結合的總主張。','經理與店主例子比較兩類能力，沒有引言的整體學習途徑。','結尾平衡教育與經驗，沒有 when ... combined with 的合作條件。'],
  ['直接否定最高價值說，沒有說應用甚麼準則衡量。','知識須審慎應用，沒有把貢獻與證書直接對比。','只尊重學位的盲點，是準則的後果，並非先訂標準。'],
  ['學術與實作結合是總主張，沒有知識何時才有用的條件。','貢獻而非資歷是價值標準，沒有承認理論再說應用。','及早察覺警號是經驗技能，沒有學術知識須審慎使用的對比。'],
  ['總主張說結合兩種能力，沒有經理與現場工作者的比較。','教育工具與皇冠的比喻總結立場，沒有反覆處理真實問題的個案。','護士例子講人際判斷，沒有制度理論與現場風險的比較。'],
  ['I do not think 是直接立場，沒有教育作工具而非皇冠的比喻。','知識應用是實際條件，沒有自動身分優越的象徵。','只尊重學位會忽略能力是社會後果，沒有工具與皇冠對照。'],
  ['常見觀點說教育與社會價值相連，沒有單一標準的盲點。','衡量貢獻而非證書是原則，沒有默默維持日常的能力。','工具與皇冠是身分比喻，沒有社會忽略能力的後果。'],
  ['結合知識與實作是全文主張，沒有轉入技能清單的段落功能。','One is 已開始第一種技能及其例子，沒有先宣告多種技能。','Another is 已開始第二種技能，沒有新的段落總起。'],
  ['轉句只說經驗能教技能，沒有工人怎樣及早察覺警號。','This benefits 說社會好處，沒有技能的工作現場機制。','人際接觸學耐性，是另一類技能而非修機器的預防解難。'],
  ['知識應用是價值條件，沒有說及早解難防止的損失。','小警號例子描述技能如何形成，沒有緊接着點出社會益處。','結論並列技能，沒有具體浪費、意外和混亂的防止作用。'],
  ['段落總起說多種經驗技能，沒有標出第二類人際判斷。','This benefits 收束第一種技能的效益，沒有轉到下一類。','Through years 已展開人際判斷，沒有短句開啟新項的作用。'],
  ['經理與店主比較專業和經驗，沒有多年人際接觸培養耐性。','Another is 只命名第二類技能，沒有來源與社會好處。','護士個案示範現場判斷，沒有概括多年接觸學會甚麼。'],
  ['知識有用的條件是總論，沒有背規則與察覺氣氛的個案對照。','經理比較說解決實際問題，沒有安撫緊張場面的例子。','Through years 概述人際技能，沒有 not because ... but because 的具體機制。'],
  ['引言直接表態，沒有結論標記和回到第一題的重申。','轉入技能清單只回答第二題，沒有否定最高價值說。','結尾第二句平衡教育與技能，沒有先直接重答第一題。'],
  ['學術與實作結合是引言方向，沒有結論具體技能清單。','防止浪費等只解釋一項實際技能的社會效益。','結論第一句直接否定最高價值，沒有列經驗形成的能力。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分別回答甚麼？',[
    '受過教育的人是否最有價值，以及經驗能教哪些造福社會的技能',
    '每個人應讀哪所大學，以及醫生和工程師應如何加薪',
    '學歷證書應保存多久，以及所有工作要不要改成義工',
    '孩子在何時考試，以及社會是否應取消所有專業訓練',
  ],'第一問比較社會價值，第二問要列出可從實際經驗學會的技能及其益處。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '貢獻比證書更能衡量價值；理論須配合現場判斷才能幫助社會',
    '經驗能培養及早解難與人際判斷，減少損失和衝突',
    '所有受過大學教育的人都沒有實際能力，不應服務社會',
    '只要有工作年資，就必然不再需要任何理論知識',
  ],correct:[0,1],why:'第一段建立「看貢獻」準則；第二段用兩類經驗技能回答它們如何造福社會。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言表態','承認專業知識重要，否定有學歷者必然最有價值，提出知識與實作結合。'],
  ['衡量社會價值','以貢獻而非證書作準則；理論要審慎應用，現場經驗也能服務日常。'],
  ['兩類經驗技能','實際解難及早察覺風險；人際判斷由長期接觸人而來。'],
  ['結論雙重回答','再否定學歷等於最高價值，列出判斷、溝通、情緒理解與實作解難。'],
],'先表明不排他 → 訂貢獻準則並比較 → 詳列經驗技能 → 回到兩個題問。')];
const evidence=[
  quiz('作者為何不以學歷直接判定誰最有價值？',[
    '社會價值應按實際貢獻衡量，知識也須審慎應用才有用',
    '所有專業知識都沒有用，醫生也完全不用接受訓練',
    '證書可以自動證明一個人比其他人更有社會貢獻',
    '作者只按一個人的工作年資，而完全不看做了甚麼',
  ],'文章承認教育有力，但衡量價值要看實際貢獻和應用。'),
  quiz('經理與店主等人的對比要證明甚麼？',[
    '反覆解決真問題，可令有經驗者更懂人、時機及風險',
    '合資格經理必然完全不懂任何組織運作的原則',
    '店主只要工作時間長，便一定懂每個專業領域',
    '社區義工只要有善意，就不需要實際解決問題',
  ],'作者比較制度知識與現場判斷，沒有否定經理所學。'),
  quiz('「教育不是皇冠」要說明甚麼？',[
    '教育是有力工具，卻不會自動使持有人高於其他人',
    '教育像獎盃，得到證書的人必然貢獻最多',
    '教育沒有任何實際用途，應由所有人停止學習',
    '工作只要沒有學位就一定比專業職位更重要',
  ],'皇冠是自動身分優越的比喻；作者反對的是自動判斷。'),
  quiz('實際解難如何造福社會？',[
    '現場工作者及早察覺小警號，防止浪費、意外和混亂',
    '現場工作者等嚴重故障後才第一次注意任何跡象',
    '維修、照顧與廚房工作只能耗資源，沒有預防作用',
    '只有理論考試的分數能阻止機器故障和意外',
  ],'修機器、照顧兒童與管理廚房的共同點是提早發現問題。'),
  quiz('人際判斷可由甚麼經驗形成？',[
    '多年與顧客、病人、鄰居或同事相處，學到耐性與協商',
    '只背熟一條規則，就必然能理解每個人的心情',
    '完全不接觸他人，也能自動知道何時安撫緊張局面',
    '只知道機器零件名稱，就能化解所有人際衝突',
  ],'反覆與人互動能培養耐性、協商和同理心，進而減少衝突。'),
  quiz('護士等人的例子突出哪種能力？',[
    '看懂現場氣氛並作明智回應，而非只靠背熟一條規則',
    '完全不需要專業知識，也毋須了解當事人的情況',
    '每次都套用同一句說法，不必注意緊張的程度',
    '只要正式資格夠高，就會自動化解任何現場衝突',
  ],'例子的 not because ... but because 對比機械背誦與現場判斷。'),
];
const logic=[
  sequence('第一主體段：由證書轉向實際貢獻',[
    ['提出衡量準則','社會價值應按實際貢獻，而非單看證書。'],
    ['承認理論知識','受教育者可以理解理論、制度和原則。'],
    ['補上應用條件','知識須經審慎判斷並用於現實，才能服務社會。'],
    ['比較實務工作者','店主、建築工人或義工因反覆解題，更懂人、時機和風險。'],
    ['工具與皇冠','教育有力，但不會自動讓一人比另一人更有價值。'],
    ['指出單一標準的盲點','只尊重學位會忽略維持日常生活的默默能力。'],
  ],'論證沒有貶低教育，而是說證書不能取代對實際貢獻的判斷。'),
  sequence('第二主體段：兩類經驗技能及其社會益處',[
    ['宣告技能可從經驗而來','經驗可以教人多種對社會有用的能力。'],
    ['第一類：實際解難','修理、照顧及廚房工作教人及早發現小警號。'],
    ['第一類的益處','預防浪費、意外及混亂。'],
    ['第二類：人際判斷','長期與人互動養成耐性、協商及同理心。'],
    ['第二類的益處','減少衝突，建立信任，並能按現場氣氛作合宜回應。'],
  ],'每類技能都須說出「從甚麼經驗學來」與「怎樣造福社會」。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('醫療中心比較一名持高級證書的管理員與一名多年協調病房的護士。','哪項最能轉用範文的價值準則？',[
    '看兩人實際改善服務的貢獻，不只按證書判高低',
    '只看誰的證書級別較高，不問病房怎樣運作',
    '只看工作年資，完全不問兩人是否幫助病人',
    '因護士有經驗便認定正式醫療訓練完全無用',
  ],[
    '範文以實際貢獻衡量價值，並承認知識與實務可以結合。',
    '證書不能單獨證明誰更有用。',
    '年資也不是目的；真正要看做了甚麼。',
    '範文沒有否定正式專業訓練的作用。',
  ],[1,2,3,4],'範文把貢獻放在證書之前，也說知識須與實際判斷結合。'),
  transfer('新入職工程師熟悉設備手冊；資深維修員在機器發出異聲時立即察覺故障。','哪項最能說明兩種能力如何配合？',[
    '把工程原理和現場警號判斷結合，及早處理故障',
    '只保留手冊知識，不必聽維修員提供的異聲線索',
    '只聽異聲，完全不需要了解任何設備安全原理',
    '把正式知識與經驗分開，避免兩人互相核對風險',
  ],[
    '原文主張學術知識與實作能力結合，並以小警號預防大問題。',
    '忽略現場經驗會錯過可預防的故障。',
    '範文沒有說經驗可取代所有專業原理。',
    '兩類知識可互相檢查與補足。',
  ],[2,4,9,10],'範文說知識與實際能力結合最有利社會；經驗使人及早察覺警號。'),
  transfer('社區獎項只接受大學畢業者，長期幫鄰里解決水電問題的義工無法入選。','哪項最能運用「教育不是皇冠」的批評？',[
    '承認學位有用，也讓實際貢獻成為獎項評估依據',
    '維持只看學位，因證書自然證明全部社區貢獻',
    '反過來只看義工時數，不查維修是否安全有效',
    '取消所有評估，假設任何人都對社區作出同樣貢獻',
  ],[
    '皇冠比喻反對學位自動優越，主張看實際做了甚麼。',
    '證書不能自動證明維持日常生活的能力。',
    '年資也不能代替安全與實效證據。',
    '範文要求更準確的評價，而非完全不評價。',
  ],[3,6,7],'範文說教育是強大工具而非皇冠；只尊重學位會忽略默默維持日常的技能。'),
  transfer('托兒所職員長期照顧孩子，能在孩子情緒崩潰前看出小變化。','哪項最符合範文的實際解難技能？',[
    '重複照顧使人及早察覺警號，預防嚴重問題',
    '只有在問題已失控後，職員才應留意孩子情緒',
    '孩子的情緒線索完全無法從日常接觸中學會',
    '只要考過理論題，就自然知道每名孩子的反應',
  ],[
    '範文把照顧兒童列為從經驗學會提早發現風險的例子。',
    '等問題嚴重後才看，失去預防機會。',
    '反覆接觸正是學會看小警號的途徑。',
    '理論可有用，但不能自動代替個別孩子的觀察。',
  ],[8,9,10],'範文說照顧兒童等現場工作教人注意小警號，防止嚴重失誤。'),
  transfer('商店店員多年處理顧客爭議，學會耐心聆聽並協商，投訴因此減少。','哪項最能說明這種經驗的社會價值？',[
    '反覆與人互動培養人際判斷，減少衝突並建立信任',
    '只要店員工作年資長，便不需實際聆聽顧客',
    '投訴減少只能由證書解釋，與協商行為無關',
    '耐心完全無法從真實服務中學會，只能靠背誦',
  ],[
    '範文把多年與顧客相處、耐性與協商，連到減少衝突。',
    '年資本身不是機制，實際互動與回應才是。',
    '題目已給出具體行為與結果。',
    '原文說這類技能可以透過經驗培養。',
  ],[11,12],'範文的第二類技能由多年與人打交道而來，可減少衝突並建立信任。'),
  transfer('義工在兩名鄰居爭執時先觀察語氣和表情，再選擇何時插話。','哪項最能轉用範文的護士個案？',[
    '看懂現場氣氛並合宜回應，不只機械套用一條規則',
    '只把同一句背熟的話重複說，不看鄰居當時反應',
    '完全不聽雙方的具體說法，假設每場爭執都一樣',
    '因義工沒有學位，就認定他不可能化解衝突',
  ],[
    '原文對比背熟規則與讀懂現場，重點是情境判斷。',
    '機械重複未使用題目給出的語氣與表情資訊。',
    '不同情境須按現場資訊調整回應。',
    '學位不能自動決定誰有可用的人際能力。',
  ],[12,13],'範文的護士等人能安撫緊張情況，因為看懂現場並明智回應，不只背熟規則。'),
  transfer('餐廳廚師受過食品安全訓練；資深同事能憑氣味和工作流程察覺食材有異。','哪項最完整轉用範文的平衡立場？',[
    '保留安全知識，也用日常經驗及早辨認風險',
    '只看訓練證書，不問食材是否已出現警號',
    '只信氣味，不必採用任何正式安全原則',
    '只按廚師年齡判斷，毋須比較具體貢獻',
  ],[
    '原文把正式知識與現場能力結合，並重視提早察覺。',
    '證書不能代替看見實際風險。',
    '經驗與安全原理可以互補。',
    '年齡不是文章提出的社會價值標準。',
  ],[2,4,9],'範文同時承認知識與實作，並以忙碌廚房作及早察覺警號的例子。'),
  transfer('機構選主管時，候選人甲證書較多，乙長期帶團隊處理客戶衝突。','哪項判斷最符合範文對實際貢獻的要求？',[
    '核對證書與實際解題紀錄，觀察誰更能幫助團隊',
    '只數證書張數，假設處理客戶衝突的經驗無價值',
    '只看乙的年資，無須檢查他是否真的解決衝突',
    '認定甲有證書就一定無法與任何客戶有效溝通',
  ],[
    '文章以經理與現場工作者對比，要求看能力如何轉為貢獻。',
    '證書本身不足以顯示人際判斷。',
    '經驗要有實際解題證據，不能只算年數。',
    '範文承認教育有價值，沒有貶低受訓者。',
  ],[3,4,5,12],'範文的經理與有經驗工作者比較，重點是誰能處理人、時機和風險。'),
  transfer('有人說技工的工作只靠體力，對社會沒有知識價值。技工能提早發現機器故障並避免意外。','哪項反駁最貼合範文？',[
    '及早察覺風險是可由實作學會的解難能力，能防止意外',
    '只要技工沒有學位，就無法對機器安全作任何判斷',
    '機器故障只能靠運氣發現，實際經驗沒有學習作用',
    '防止意外不屬社會貢獻，只有職位名稱才算價值',
  ],[
    '範文直接以維修機器者為例，把小警號和防止事故連起來。',
    '學位不是及早辨認風險的唯一來源。',
    '原文指出這能力由反覆工作而來。',
    '避免事故是明確的公共益處。',
  ],[7,9,10],'範文說社會不能忽視維持日常生活的能力，實際解難可預防浪費及意外。'),
  transfer('文章要同時回答「有學歷者是否最有價值」和「經驗教甚麼技能」。','哪項結論最完整？',[
    '否定學歷自動最高，並列實際判斷、溝通與現場解難',
    '只說教育重要，完全不判斷誰對社會最有價值',
    '只說工作經驗有用，不列技能也不交代社會益處',
    '直接說知識全無用處，並把所有證書視作有害',
  ],[
    '範文結尾先重申不排他，再列經驗技能作第二問答案。',
    '第一問要求對最高價值說表態。',
    '第二問要求具體技能及其作用。',
    '範文承認教育重要，反對的只是自動優越。',
  ],[1,2,14,15],'範文結論否定學歷者必然最有價值，並總結判斷、溝通、情緒理解與實作解難。'),
];
const editorialWrongChoices=[
  ['證書先證明專業能力，病房貢獻可留待晉升後評估','護士協調病房有價值，但應先按工作年資決定','先比較證書與年資，再把病人服務放到年終考核'],
  ['先依手冊檢查設備，異聲線索可視為個人猜測','先聽異聲安排修理，安全原理留待故障後再核對','兩人分工不互查，讓判斷速度先於風險核對'],
  ['學位仍是入選門檻，實際貢獻只作同分時參考','義工貢獻可取代學位，但不必查修理是否安全','先按服務時數頒獎，再由獲獎者說明實際成果'],
  ['日常觀察有用，孩子情緒仍應等專家評估後處理','熟悉孩子可及早察覺變化，但預防須由家長負責','照顧經驗可幫助回應，理論測驗較能發現多種警號'],
  ['店員年資證明耐心，投訴減少可留待下年再核對','協商能減少衝突，但社會價值主要看店舖收入','人際判斷有助服務，工作年資仍應作唯一衡量'],
  ['先觀察語氣再套用固定規則，插話時機可保持相同','看懂現場氣氛有用，但義工應避免了解爭執內容','義工化解衝突須先有證書，現場回應只算附加能力'],
  ['先依安全訓練判斷，資深同事的氣味經驗只作補充','先根據氣味停用食材，安全規則可等事後再檢查','比較兩人的工作年期，便可決定誰的判斷較可靠'],
  ['先以證書數量篩選，實際解題紀錄留待面試後查','乙有處理衝突經驗，可先不檢查具體處理結果','先按團隊資歷排序，再把實際貢獻視作額外條件'],
  ['技工能發現風險，但此能力主要來自正式課程學習','避免意外很重要，技工的實作經驗仍只算體力工作','故障判斷可改善安全，但社會價值先看學歷名稱'],
  ['否定學歷自動最高，技能可留待個別例子再介紹','列出現場解難與溝通，但不回答學歷比較問題','承認工作經驗有價值，卻只用證書數決定最高價值'],
];
const editorialWrongFeedback=[
  ['證書有用，實際貢獻正是當下要比較的核心。','年資是參考，仍須看誰真能改善服務。','病人服務不能被推到年終才作附帶資料。'],
  ['異聲是現場警號，不宜在查核前視為猜測。','異聲重要，安全原理也應同時核對。','兩種知識須互補，不能只追求不互查的速度。'],
  ['只用學位作門檻，重複了範文批評的做法。','重視義工不等於不用查其服務是否安全有效。','時數仍是單一數字，不能替代成果。'],
  ['職員已見微小變化，早期回應不必全等專家。','家庭可合作，照顧者的觀察也能預防問題。','理論有用，但此處強調長期接觸產生的警覺。'],
  ['年資本身不足以證明耐心如何改變爭議。','收入是另一指標，不能取代信任與衝突減少。','只看年資，漏掉具體聆聽與協商行為。'],
  ['只按固定時機插話，仍忽略雙方當下的反應。','現場內容是判斷何時回應的必要部分。','證書可有幫助，但不應抹掉實務判斷。'],
  ['資深同事的警號不只是次要裝飾，應實際查核。','聞到異味要行動，也須遵守正式安全原則。','年期不等於兩人對風險的實際貢獻。'],
  ['解題紀錄已知，不宜等到篩選後才看。','經驗須核對成效，不能只看是否曾經處理。','資歷可參考，實際貢獻仍應是主要依據。'],
  ['實作經驗同樣可能教會及早辨認風險。','防止意外是知識性解難，不只是體力。','職稱學歷不能代替實際安全成果。'],
  ['第二問要求列出經驗所教的具體技能。','技能有了，但第一問的價值判斷仍缺。','只按證書數，與否定學歷自動最高的立場矛盾。'],
];
transferTasks.forEach((item,index)=>{item.options=[item.options[0],...editorialWrongChoices[index]];item.explanations=[item.explanations[0],...editorialWrongFeedback[index]];item.why=item.explanations[0]});
export default {
  key:'direct-question:13',
  meta:{topic:'學歷、實務經驗與社會價值',summary:'社會價值應看貢獻而非證書；經驗能培養及早解難與人際判斷。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
