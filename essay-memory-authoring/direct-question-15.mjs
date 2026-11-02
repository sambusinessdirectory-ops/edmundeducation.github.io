// Human-authored support for Direct Question 15; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-15-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:15'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'At some high schools, students must help people in their area, such as older people or people with disabilities.',
  'I think this helps students care about others and act more like adults, and it should be part of what schools teach.',
  'The biggest benefit is that helping the community makes students kinder and more aware of other people’s lives.',
  'Many teenagers spend most of their time with people their own age, so they may know little about how hard life can be for others.',
  'When they help an older person with daily jobs or spend time with a person with a disability, they see that needing help is a real part of life, not just an idea.',
  'Doing this can teach them to wait calmly, respect others and do what they promised better than hearing a lesson about these things.',
  'For example, a student who helps an older neighbour use a phone or carry shopping bags may see that even a small kind act can make the neighbour’s day easier.',
  'In this way, helping in the community can turn lessons about doing the right thing into something students have done themselves.',
  'I also think schools should require this work because schools should teach students how to treat others as well as help them do well at school.',
  'If students can choose whether to do it, only those who already want to help may join, while others may miss a chance to grow.',
  'Making it part of school life means every student meets people outside their usual group.',
  'It can also make school more balanced because young people learn not only how to pass tests but also how to help society.',
  'If the work fits students’ age and adults watch over them properly, it can help them grow into responsible adults.',
  'To sum up, helping in the community gives students more care for others, a more grown-up way of thinking and a stronger sense of duty to society.',
  'For this reason, I strongly think every high school student should have to do it as part of school.',
];
const vocabulary=[
  [['In several secondary schools','At some high schools','在一些中學'],['expected to take part in','must help','被要求參與'],['community service','people in their area','社區服務'],['elderly people','older people','長者'],['those with disabilities','people with disabilities','殘疾人士']],
  [['I believe','I think','我認為'],['developing empathy','care about others','培養同理心'],['practical maturity','act more like adults','處事成熟'],['included in the school curriculum','part of what schools teach','納入學校課程']],
  [['clearest benefit','biggest benefit','最明顯好處'],['community work','helping the community','社區服務'],['compassionate','kinder','有同情心'],['socially aware','aware of other people’s lives','具社會意識']],
  [['similar age','their own age','相近年齡'],['understanding of hardship','know little about how hard life can be for others','理解困難處境'],['remain quite limited','may know little','仍然有限']],
  [['assist an elderly person with daily tasks','help an older person with daily jobs','協助長者日常事務'],['someone who has a disability','a person with a disability','殘疾人士'],['vulnerability','needing help','脆弱'],['abstract idea','just an idea','抽象概念'],['real part of human life','real part of life','真實人生一部分']],
  [['This experience','Doing this','這種經歷'],['patience','wait calmly','耐性'],['responsibility','do what they promised','責任感'],['lecture in a classroom','hearing a lesson about these things','課堂講授']],
  [['elderly resident','older neighbour','年長居民'],['carry groceries','carry shopping bags','提購物袋'],['small acts of kindness','even a small kind act','小善行'],['make another person’s day easier','make the neighbour’s day easier','令別人的一天輕鬆些']],
  [['community service','helping in the community','社區服務'],['moral values','lessons about doing the right thing','道德價值'],['empty words','something students have done themselves','空洞說話轉成經歷'],['lived experience','done themselves','親身經驗']],
  [['formal part of the curriculum','schools should require this work','正式課程'],['educate character','teach students how to treat others','培養品格'],['academic ability','do well at school','學術能力']],
  [['left entirely to personal choice','students can choose whether to do it','完全由個人選擇'],['already motivated','already want to help','本身已有動力'],['participate','join','參與'],['miss an important opportunity to grow','miss a chance to grow','錯過成長機會']],
  [['Making it part of school life','Making it part of school life','納入學校生活'],['ensures','means','確保'],['every student is exposed to','every student meets','每個學生接觸'],['people beyond their usual social circle','people outside their usual group','慣常圈外的人']],
  [['education more balanced','school more balanced','教育更平衡'],['not only how to pass exams','not only how to pass tests','不只學會考試'],['how to contribute to society','how to help society','如何貢獻社會']],
  [['As long as','If','只要'],['age-appropriate','fits students’ age','適合年齡'],['properly supervised','adults watch over them properly','適當監督'],['meaningful stepping stone','help them grow','有意義踏腳石'],['responsible adulthood','responsible adults','負責任成年人']],
  [['In conclusion','To sum up','總結來說'],['community work','helping in the community','社區服務'],['empathy','care for others','同理心'],['maturity','grown-up way of thinking','成熟度'],['social responsibility','sense of duty to society','社會責任感']],
  [['For this reason','For this reason','基於此'],['I strongly believe','I strongly think','我強烈認為'],['required part of the high school curriculum','every high school student should have to do it as part of school','高中必修課程']],
];
const chunkOverrides=[
  ['In several secondary schools, students are expected','to take part in community service,','including supporting elderly people or those with disabilities.'],
  ['I believe this benefits young people','by developing empathy and practical maturity,','and it should definitely be included in the school curriculum.'],
  ['The clearest benefit is that community work','helps students become more compassionate and socially aware.'],
  ['Many teenagers spend most of their time','with people of a similar age,','so their understanding of hardship can remain quite limited.'],
  ['When they assist an elderly person with daily tasks','or spend time with someone who has a disability,','they begin to see that vulnerability','is not an abstract idea but a real part of human life.'],
  ['This experience can teach patience, respect, and responsibility','far more effectively than a lecture in a classroom.'],
  ['For example, a student who helps an elderly resident','use a phone or carry groceries','may realise how small acts of kindness','can make another person’s day easier.'],
  ['In this way, community service can turn moral values','from empty words into lived experience.'],
  ['I also think this should be a formal part','of the curriculum because schools should educate character','as well as academic ability.'],
  ['If community work is left entirely to personal choice,','only students who are already motivated may participate,','while others may miss an important opportunity to grow.'],
  ['Making it part of school life ensures','that every student is exposed to people','beyond their usual social circle.'],
  ['It can also make education more balanced,','since young people learn not only how to pass exams','but also how to contribute to society.'],
  ['As long as the work is age-appropriate','and properly supervised,','it can become a meaningful stepping stone','towards responsible adulthood.'],
  ['In conclusion, community work benefits students','by building empathy, maturity, and social responsibility.'],
  ['For this reason, I strongly believe','it should be a required part of the high school curriculum.'],
];
const simpleChunkOverrides=[
  ['At some high schools, students must help people','in their area,','such as older people or people with disabilities.'],
  ['I think this helps students care about others','and act more like adults,','and it should be part of what schools teach.'],
  ['The biggest benefit is that helping the community','makes students kinder','and more aware of other people’s lives.'],
  ['Many teenagers spend most of their time','with people their own age,','so they may know little','about how hard life can be for others.'],
  ['When they help an older person with daily jobs','or spend time with a person with a disability,','they see that needing help is a real part of life,','not just an idea.'],
  ['Doing this can teach them to wait calmly,','respect others and do what they promised','better than hearing a lesson about these things.'],
  ['For example, a student who helps an older neighbour','use a phone or carry shopping bags','may see that even a small kind act','can make the neighbour’s day easier.'],
  ['In this way, helping in the community','can turn lessons about doing the right thing','into something students have done themselves.'],
  ['I also think schools should require this work','because schools should teach students','how to treat others as well as','help them do well at school.'],
  ['If students can choose whether to do it,','only those who already want to help may join,','while others may miss a chance to grow.'],
  ['Making it part of school life means','every student meets people outside their usual group.'],
  ['It can also make school more balanced','because young people learn not only how to pass tests','but also how to help society.'],
  ['If the work fits students’ age','and adults watch over them properly,','it can help them grow into responsible adults.'],
  ['To sum up, helping in the community','gives students more care for others,','a more grown-up way of thinking','and a stronger sense of duty to society.'],
  ['For this reason, I strongly think','every high school student should have to do it','as part of school.'],
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
  card('In several schools, pupils are expected to join local projects, including helping neighbours with shopping.','用 are expected to ... including 介紹課程安排及例子',[1,3,9],
    fixed(0,'In [部分中學], students are expected to [參與社區服務], including [支援長者或殘疾人士].','開場準確交代學校要求的活動與服務對象。','引言要重述題目安排，同時給一個具體服務例子時。',['In ', ', students are expected to ', ', including '],['實行安排的學校','學生要參與的社區工作','工作服務的人群'])),
  card('I believe this benefits pupils by developing patience and confidence, and it should be included in the school timetable.','用 benefits ... by ... and ... should be 把兩個題問一起表態',[0,2,14],
    fixed(1,'I believe this benefits [年輕人] by developing [同理心與成熟度], and it should definitely be included in [學校課程].','同一句回答活動有何益處，以及是否應列入正式課程。','雙問題目需在引言清楚交代益處與立場時。',['I believe this benefits ', ' by developing ', ', and it should definitely be included in '],['受益的學生','所培養的能力','應正式納入的課程'])),
  card('The clearest benefit is that local work helps teenagers become kinder and more aware of others.','用 The clearest benefit is that 先提出最重要的學生益處',[1,5,11],
    fixed(2,'The clearest benefit is that [社區工作] helps students become [更有同理心和社會意識].','第一主體段先聚焦學生如何理解他人，而非只說活動值得做。','開始回答「學生得到甚麼」時，要先提出具體能力時。',['The clearest benefit is that ', ' helps students become '],['帶來益處的工作','學生因此形成的態度'])),
  card('Many young athletes spend most of their time with teammates, so their understanding of other groups can remain limited.','用 ... so ... remain limited 說明既有社交圈如何限制理解',[2,4,8],
    fixed(3,'Many teenagers spend most of their time with [同齡人], so their understanding of [他人的困難] can remain quite limited.','說明為何服務不同年齡或處境的人會擴闊學生眼界。','提出同理心的好處後，要交代青少年原有理解缺口時。',['Many teenagers spend most of their time with ', ', so their understanding of ', ' can remain quite limited.'],['學生慣常接觸的人','因而較少理解的處境'])),
  card('When pupils help a new student or spend time with a lonely neighbour, they begin to see that isolation is not an idea but a real difficulty.','用 When ... or ... not ... but 把抽象概念轉成親身見到的處境',[3,5,7],
    fixed(4,'When [學生協助長者] or [陪伴殘疾人士], they begin to see that [脆弱] is not [抽象概念] but [人生中的真實處境].','親身接觸讓學生理解他人需要協助，不再只把脆弱當課本概念。','要解釋服務如何把對他人的認識由抽象轉成具體時。',['When ', ' or ', ', they begin to see that ', ' is not ', ' but '],['第一種接觸方式','第二種接觸方式','被重新理解的概念','原先抽象的看法','親身見到的真實情況'])),
  card('This experience can teach patience and care far more effectively than a lecture in a classroom.','用 far more effectively than 比較實作與課堂講授的學習效果',[2,4,7],
    fixed(5,'This experience can teach [耐性、尊重與責任] far more effectively than [課堂講授].','比較親身服務與只聽道德說教，指出品格如何從實作形成。','已說學生親身接觸不同處境，要評估這比單聽課有何不同時。',['This experience can teach ', ' far more effectively than '],['從服務學到的態度','作為比較的課堂講授'])),
  card('For example, a pupil who helps a neighbour carry bags may realise how small acts of kindness can make a difficult day easier.','用 For example ... may realise how ... can ... 展示小善行的可見效果',[4,7,8],
    fixed(6,'For example, [協助長者的學生] may realise how [小善行] can [讓他人的生活容易些].','以使用電話與提購物袋的例子，讓學生看見自己行動對他人的實際幫助。','要為同理心或責任感提供一個具體而可信的小場景時。',['For example, ', ' may realise how ', ' can '],['參與服務的學生及行動','被察覺的小善行','他人得到的實際幫助'])),
  card('In this way, helping a neighbour can turn lessons about respect from empty words into lived experience.','用 turn ... from ... into ... 概括價值觀如何變成親身經驗',[4,5,6],
    fixed(7,'In this way, [社區服務] can turn [道德價值] from [空話] into [親身經驗].','收束前例：尊重、耐性等不是只背誦的詞，而是學生實際做過的事。','完成具體服務個案後，要概括實作教育的核心轉變時。',['In this way, ', ' can turn ', ' from ', ' into '],['帶來轉變的社區服務','要學習的價值','原本只有的說法','實踐後的親身經驗'])),
  card('I also think this should be a formal part of school life because schools should teach character as well as exam skills.','用 because ... as well as 說明活動何以應列正式課程',[1,7,10],
    fixed(8,'I also think this should be [正式課程] because schools should educate [品格] as well as [學術能力].','回答第二題：學校除知識與考試，也應培養品格。','已解釋活動好處，接着要論證為何它應成為必修安排時。',['I also think this should be ', ' because schools should educate ', ' as well as '],['活動在課程中的定位','學校須培養的品格','仍須兼顧的學術能力'])),
  card('If volunteering is left entirely to personal choice, only keen pupils may join, while others may miss a chance to learn.','用 If ... only ... while others ... 分析只靠自選的參與差距',[2,8,10],
    fixed(9,'If [社區工作只靠自選], only [本已有動力者] may participate, while others may [錯過成長機會].','指出選修可能只讓本已願意服務者受益，其他人反而缺少接觸機會。','要解釋「必修」而不只是鼓勵自願參加的理由時。',['If ', ', only ', ' may participate, while others may '],['完全自選的條件','原本會參加的學生','未參加者失去的機會'])),
  card('Making visits part of school life ensures that every pupil meets people beyond their usual social circle.','用 Making ... part ... ensures that 每人都取得接觸機會',[3,8,9],
    fixed(10,'Making [服務] part of school life ensures that every student is exposed to [平常圈外的人].','必修安排使所有學生都有機會接觸慣常社交圈以外的人。','已說自選造成誰參加的差異，接着要說正式課程如何改善公平接觸時。',['Making ', ' part of school life ensures that every student is exposed to '],['納入學校生活的服務','學生平常較少遇到的人'])),
  card('It can also make education more balanced, since young people learn not only how to pass tests but also how to help others.','用 not only ... but also 對照考試與對社會的貢獻',[2,8,12],
    fixed(11,'It can also make [教育] more balanced, since young people learn not only [考試能力] but also [貢獻社會].','正式納入服務可擴大教育目標，讓學生學會考試以外的社會參與。','要說明學校課程不能只教考試技巧，還應包括甚麼時。',['It can also make ', ' more balanced, since young people learn not only ', ' but also '],['變得更平衡的教育','學校原本強調的考試','新增的社會貢獻'])),
  card('As long as visits are suitable for pupils’ age and supervised well, they can help teenagers become responsible adults.','用 As long as 加上年齡適合及監督的實施條件',[8,9,14],
    fixed(12,'As long as [服務適合年齡] and [受到妥善監督], it can become [邁向負責任成年人的一步].','承認必修服務必須設計得合適、安全，才會成為成長機會。','要支持活動入課程，同時交代實行時不能省略的條件時。',['As long as ', ' and ', ', it can become '],['服務符合年齡的條件','適當監督','長遠成長結果'])),
  card('In conclusion, local service benefits pupils by building care, patience and responsibility.','用 benefits ... by building 收束第一題的主要益處',[2,5,14],
    fixed(13,'In conclusion, [社區工作] benefits students by building [同理心、成熟度和社會責任].','結論把前文的學生益處歸納成三項可帶走的能力。','結論要先直接回答學生從活動獲得甚麼時。',['In conclusion, ', ' benefits students by building '],['使學生受益的服務','因此培養的三類能力'])),
  card('For this reason, I strongly believe service should be a required part of the school timetable.','用 For this reason 由益處推回必修立場',[1,9,13],
    fixed(14,'For this reason, I strongly believe [社區服務] should be [高中必修課程].','以已論證的益處作理由，再明確回答是否應納入高中課程。','結論最後一句要把對學生的好處連到課程立場時。',['For this reason, I strongly believe ', ' should be '],['應納入的活動','主張的正式課程地位'])),
];
const wrongReasons=[
  ['引言益處與立場句直接評價，沒有先介紹目前哪些學校安排服務。','同齡社交圈的局限是正文原因，沒有交代社區服務的題目背景。','自選條件句討論參與差距，沒有引言的活動和對象介紹。'],
  ['引言背景只描述學校安排，沒有同時回答益處和是否必修。','第一項益處只說同理心，沒有課程立場。','結論再次主張必修，沒有引言中「益處＋立場」的雙重回答。'],
  ['引言已表態，但沒有主體段聚焦最清楚的一項益處。','親身經驗勝於講授是作用比較，沒有先命名同理心與社會意識。','教育平衡是課程理由，沒有先回答學生得到的第一項能力。'],
  ['最明顯益處說學生更懂他人，沒有原先為何理解不足。','親身服務的條件句寫接觸後轉變，沒有同齡社交圈的起點。','正式入課程說教育目標，沒有青少年既有生活範圍的分析。'],
  ['同齡社交圈只說理解有限，沒有接觸長者後怎樣看脆弱。','服務經驗勝於講授是效果比較，沒有抽象與真實的轉變。','道德價值化為親身經驗是段落總結，沒有接觸情境的描述。'],
  ['最明顯益處命名同理心，沒有與課堂講授比較。','接觸長者說脆弱成真實處境，沒有耐性、尊重、責任的學習效率。','價值從空話變實作是總結比喻，沒有 far more effectively than 比較。'],
  ['接觸長者的總情境沒有小善行的具體電話與購物袋例子。','In this way 概括價值轉化，沒有一個學生如何觀察幫助效果。','課程理由說學校應育品格，沒有學生服務個案。'],
  ['接觸脆弱處境是認識轉變，沒有道德價值由話語變經驗的概括。','與課堂比較只指出效率，沒有 from ... into 的轉化。','小善行個案是具體例子，沒有段末把價值觀總結為實踐。'],
  ['引言立場只預告應入課程，沒有 schools should educate character 的理由。','道德價值轉化說活動益處，沒有回答必修的學校教育任務。','必修確保接觸圈外人是下一步機制，沒有先訂學校培養品格的原則。'],
  ['最明顯益處說同理心，沒有自願選擇造成的參與差異。','正式課程理由說育品格，沒有 if 條件下誰會錯過。','必修可確保每人參與是方案效果，沒有先指出自選的局限。'],
  ['同齡人社交圈有限是學習需要，沒有正式安排如何讓每人接觸。','學校應育品格是課程原則，沒有每位學生機會的公平性。','自選條件句說誰可能不參加，沒有必修帶來的普遍接觸。'],
  ['最清楚益處說同理心，沒有考試與社會貢獻的課程平衡。','學校育品格是總原則，沒有學生實際學會兩種能力的對照。','年齡和監督條件說如何實行，沒有教育目標不只考試。'],
  ['育品格與學術能力是納入課程的理由，沒有年齡和監督條件。','自選造成參與差距，沒有如何安全安排必修活動。','結論重申必修，沒有 As long as 的實施前提。'],
  ['最清楚益處只聚焦同理心與社會意識，沒有結論三項總結。','經驗勝講授是學習方式比較，沒有收束三類能力。','最後立場句回答是否必修，沒有先總結學生益處。'],
  ['引言益處及立場是首次表態，沒有 For this reason 回扣前文。','自選條件句說必修理由之一，沒有結論再明確下判斷。','結論前句只總結益處，尚未回答課程是否必修。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分別回答甚麼？',[
    '社區服務給學生甚麼好處，以及應否正式列入高中課程',
    '長者應學會哪種電話，以及學校應買多少購物袋',
    '所有學生應做多少功課，以及長者應選哪所中學',
    '是否應取消所有考試，以及老師每天應工作多久',
  ],'先分析學生的收穫，再表明社區服務是否應成為正式課程。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '親身服務讓學生理解圈外人的處境，培養同理心與責任感',
    '正式納入課程讓每名學生有機會參與，但工作須合年齡並受監督',
    '只靠課堂講授已足夠，學生不需要接觸不同處境的人',
    '只要活動自選，所有學生就會有同樣的成長機會',
  ],correct:[0,1],why:'第一段解釋學生如何受益；第二段說明必修理由及實施條件。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言回答兩問','介紹社區服務，說它能培養同理心與成熟度，並表明應納入課程。'],
  ['學生的收穫','接觸長者或殘疾人士，透過小善行把道德價值變成親身經驗。'],
  ['課程的理由','自選會漏掉部分學生；必修擴大接觸，也須適齡且有人監督。'],
  ['結論收束','總結同理心、成熟度和社會責任，再重申高中必修立場。'],
],'先表態 → 解釋服務如何教育學生 → 論證為何人人都應有機會 → 收束兩問。')];
const evidence=[
  quiz('為甚麼青少年可能不太了解他人的困難？',[
    '他們常與同齡人相處，較少接觸不同年齡和處境的人',
    '他們每天必定照顧長者，因此已完全了解所有困難',
    '同齡朋友一定沒有任何不同經歷，學校也不能教導',
    '作者認為所有青少年都故意拒絕關心身邊的人',
  ],'原文以同齡社交圈有限，解釋服務為何能帶來新理解。'),
  quiz('親身協助長者或殘疾人士帶來甚麼理解？',[
    '需要幫助是生活中的真實處境，不只是書上的抽象說法',
    '只要服務一次，學生便能完全理解所有人的人生',
    '殘疾和年老只屬課本概念，日常生活中不會出現',
    '學生應避免與有需要的人接觸，才更能學會尊重',
  ],'not an abstract idea but a real part 把認識由概念轉到真實生活。'),
  quiz('幫長者用電話或提購物袋的例子，重點是甚麼？',[
    '微小善行也能改善別人的日常，讓學生親眼看見效果',
    '只有捐出大量金錢，才能對長者的生活產生幫助',
    '學生必須代替專業照顧者處理所有複雜醫療需要',
    '電話和購物袋本身比尊重與體貼更值得學習',
  ],'具體小事證明善意不是空話，讓學生看到對方實際受益。'),
  quiz('為甚麼作者支持把社區服務列為正式課程？',[
    '學校也應培養品格，而自願參與可能只吸引本已有動力的人',
    '作者認為考試能力完全不重要，學校應停止學術教育',
    '作者認為任何學生都已願意服務，故不必設課程',
    '只要活動列入課程，就不需要合適工作或成人監督',
  ],'理由兼顧學校教育目標與學生能否公平取得服務機會。'),
  quiz('把活動納入學校生活，可改善哪種機會差異？',[
    '讓不會主動報名的學生也接觸平常圈外的人',
    '只讓原本最有動力的學生取得更多服務機會',
    '讓所有學生只與同齡朋友相處，不接觸社區',
    '只獎勵考試分數最高者，避免其他學生參與',
  ],'正式安排使每位學生都有接觸不同人群的機會。'),
  quiz('必修服務需要甚麼條件？',[
    '工作適合學生年齡，並有人妥善監督活動',
    '無論年齡與能力，都安排學生單獨承擔高風險工作',
    '不提供任何指導，讓學生自行處理敏感情況',
    '只要活動能入課程，家長與老師毋須知道做甚麼',
  ],'As long as 是支持必修的實施前提，不能省略。'),
];
const logic=[
  sequence('第一主體段：社區服務如何令學生受益',[
    ['提出核心收穫','服務使學生更有同情心，並了解社會處境。'],
    ['指出原本局限','青少年多與同齡人相處，對困難認識較少。'],
    ['親身接觸','協助長者或殘疾人士，使抽象的脆弱變成真實生活。'],
    ['具體小善行','幫用電話或提購物袋，親見小行動如何幫人。'],
    ['回到教育作用','耐性、尊重與責任由空話變成做過的經驗。'],
  ],'論證由社交圈局限出發，經接觸與行動，才到品格收穫。'),
  sequence('第二主體段：為何應納入正式課程',[
    ['訂教育目標','學校應教品格，同時保持學術教育。'],
    ['說自選的局限','本已有動力者較可能參與，其他人錯過機會。'],
    ['說必修的作用','每位學生可接觸平常圈外的人，教育也更平衡。'],
    ['加入實施條件','工作須適合年齡並受妥善監督。'],
    ['回到成長目的','活動才可成為走向負責任成年人的一步。'],
  ],'必修不是只為完成時數；公平接觸與安全設計共同支持長期成長。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('學校只安排學生聽一堂「尊重長者」講座，沒有任何與長者相處的機會。','哪項最能補上範文的實作原則？',[
    '安排適齡且受監督的服務，讓學生親身理解長者需要',
    '再增加相同講座時數，完全避免學生接觸社區',
    '只要求學生背熟尊重定義，不觀察任何日常處境',
    '把所有照顧工作單獨交給學生，不給任何成年人指導',
  ],[
    '範文比較親身服務與課堂講授，同時要求適齡和監督。',
    '只聽講座仍未形成文章強調的親身經驗。',
    '背定義不能讓價值由空話變成實作。',
    '實作須安全且符合年齡，不等於交出專業責任。',
  ],[4,5,7,12],'範文說親身服務比講授更能教耐性與責任，前提是工作適齡且有人監督。'),
  transfer('學生協助長者學用電話，對方能更方便聯絡家人。','哪項最貼近範文對小善行的解釋？',[
    '學生看見小小協助帶來實際好處，同理心因而更具體',
    '只有解決所有長者問題，這次協助才算有意義',
    '只要完成任務時數，就不必了解長者是否受益',
    '手機技巧本身是唯一收穫，與理解他人完全無關',
  ],[
    '原文用幫長者用電話說明微小善行能改善其一天。',
    '小行動本身也可帶來實際便利。',
    '題目提供了長者更易聯絡家人的可見效果。',
    '文章重點是由技術小事學會體貼。',
  ],[6,7],'範文的電話例子表明小善行能令別人的日常更容易，價值不再只是空話。'),
  transfer('義工活動只接受主動報名。最需要走出原有社交圈的學生，卻從未參加。','哪項最能轉用範文的必修理由？',[
    '在課程中安排每人參與，讓未主動報名者也接觸新群體',
    '只獎勵原本願意參加的人，假設其他人不需成長',
    '完全取消社區活動，避免學生遇見不同背景的人',
    '只要求學生閱讀活動海報，不提供真正參與機會',
  ],[
    '原文指出只靠自選會漏掉部分學生，正式課程能擴大接觸。',
    '這會保留題目已出現的機會差距。',
    '取消活動不能改善社交圈的局限。',
    '看海報仍不是與人相處的經驗。',
  ],[9,10],'範文說自選可能只吸引本已有動力者，納入學校生活能讓每人遇見圈外人。'),
  transfer('校方想把社區服務列入課程，但擬讓十二歲學生獨自照顧需要醫療協助的長者。','哪項最符合範文的實施條件？',[
    '調整為適齡任務並由成人監督，避免學生做醫療工作',
    '照原計劃獨自執行，因必修便無須考慮工作風險',
    '取消所有服務活動，因一項任務不合適就無其他選擇',
    '只要求學生完成時數，不告訴他們長者有哪些需要',
  ],[
    '範文支持必修，但以適齡及妥善監督為前提。',
    '必修不會免除對學生與服務者安全的責任。',
    '可改任務和監督，未必須取消全部服務。',
    '時數不能代替合適、安全的工作設計。',
  ],[8,12],'範文的 As long as 限定工作須適合年齡並受到妥善監督。'),
  transfer('學校課程重視考試，卻很少讓學生學習如何幫助社區。','哪項最能轉用範文對平衡教育的看法？',[
    '保留學科學習，也設服務活動讓學生練習貢獻社會',
    '取消所有考試，因為學術能力對社會沒有作用',
    '只加考試訓練，避免學生接觸任何不同處境',
    '只以義工時數評分，不關心學生是否學到尊重',
  ],[
    '原文說品格與學術能力並重，而非取消考試。',
    '範文用 as well as 保留學術教育。',
    '這仍只教通過考試，沒有社會貢獻。',
    '服務的教育作用不是單純累積時數。',
  ],[8,11],'範文說學生應學會不只通過考試，也知道如何為社會貢獻。'),
  transfer('一名學生原本只與同班同齡朋友相處，服務時認識了行動不便的鄰居。','哪項最符合範文的認知轉變？',[
    '親身接觸使他理解別人的需要不只是課本概念',
    '認識一位鄰居就足以了解所有人的完整人生',
    '服務應只留在同齡圈，避免接觸不同處境',
    '只要鄰居行動不便，學生便不用向他學任何事',
  ],[
    '範文由同齡社交圈的局限，推到服務讓脆弱成為可見現實。',
    '一次接觸能增進理解，但不能代表所有人。',
    '跨出慣常圈子正是活動的益處。',
    '尊重包括理解對方經驗，而非把對方只看成需要幫助者。',
  ],[3,4,10],'範文說與長者或殘疾人士相處，可讓學生明白不同處境是真實生活的一部分。'),
  transfer('學生在社區餐廳幫忙，發現慢一點聆聽比急着完成工作更能幫客人。','哪項最能說明經驗帶來的品格學習？',[
    '親身行動教耐性和尊重，比只聽道理更易理解',
    '只要完成工作最快，是否理解客人便完全無關',
    '耐性只能從課本定義學，與服務經驗沒有關係',
    '幫人一定要做複雜任務，小小體貼沒有任何效果',
  ],[
    '範文說服務經驗能更有效教耐性和尊重，並以小善行示例。',
    '題目已顯示聆聽改善服務。',
    '原文強調親身服務比單聽課更有效。',
    '小行動也可讓他人日常更輕鬆。',
  ],[5,6,7],'範文把耐性與尊重放在真實服務中學，而非只靠課堂講授。'),
  transfer('校方要評估服務課是否有效，只記錄學生工作時數，沒有聽學生和受助者的看法。','哪項評估更貼近範文的目的？',[
    '看學生是否更懂他人，也查受助者是否得到幫助',
    '只看時數，無須了解服務內容或別人有否受益',
    '只看考試分數，完全不問同理心和責任是否增長',
    '只看活動海報設計，不問學生有否親身參與',
  ],[
    '原文關心同理心、責任和小善行的實際作用。',
    '時數是參與量，不能單獨顯示學習和服務效果。',
    '範文承認學術能力，但社區服務另有品格目標。',
    '海報不等於親身服務經驗。',
  ],[1,2,6,13],'範文把服務的價值放在學生品格成長和對他人的具體幫助。'),
  transfer('一所學校計劃讓所有學生服務社區，家長擔心活動會取代學科與安全安排。','哪項回應最符合範文完整立場？',[
    '服務與學科並行，任務適齡並受監督，人人可成長',
    '只做服務，全面停止學科課程和所有考試',
    '只靠學生自選，不必關心誰沒有參與機會',
    '讓學生獨自處理高風險工作，以證明已經成熟',
  ],[
    '原文同時主張教育平衡、普遍接觸和適齡監督。',
    '範文說 as well as academic ability，沒有取消學科。',
    '自選可能讓部分學生錯失成長機會。',
    '安全與監督是原文明確提出的條件。',
  ],[8,9,10,11,12],'範文支持正式課程，但須兼顧學術能力，並確保服務適齡且妥善監督。'),
  transfer('文章結尾要同時回答「服務的好處」和「應否必修」。','哪項最完整收束兩問？',[
    '服務培養同理心、成熟與責任，因此應納入高中必修',
    '只說活動有趣，不說學生學到甚麼或應否納入課程',
    '只說學校要有課程，不說服務如何幫助學生',
    '只說考試重要，完全不回應社區服務的作用',
  ],[
    '範文結論先總結學生益處，再以 For this reason 推出必修立場。',
    '題目要求具體好處和課程判斷。',
    '必修主張須由前文的益處支撐。',
    '這沒有回答任何一項社區服務問題。',
  ],[13,14],'範文最後兩句把同理心、成熟度和社會責任連到高中必修的結論。'),
];
export default {
  key:'direct-question:15',
  meta:{topic:'高中社區服務的益處與必修安排',summary:'親身服務培養同理心與責任；適齡、受監督的必修安排讓所有學生有機會參與。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
