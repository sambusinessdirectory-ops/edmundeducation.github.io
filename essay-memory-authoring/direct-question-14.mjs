// Human-authored support for Direct Question 14; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-14-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:14'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'The difference in education between rich and poor countries is getting bigger, and this is a serious problem because it makes it harder for young people to improve their lives and keeps many of them from getting ahead.',
  'Several clear steps can make this difference smaller, especially if governments, world groups, businesses and other private groups work together instead of leaving each country to solve it alone.',
  'One important step is to spend more money over many years on the basic things schools need.',
  'In many poorer countries, students fall behind, but not because they cannot learn; crowded rooms, schools without enough equipment and too few trained teachers hold them back.',
  'Help from other countries should pay not only to build schools, but also to look after them, provide books and supplies, and pay teachers fairly.',
  'For example, a school in the countryside with steady power, internet, books and trained teachers would quickly give its students a fairer chance to do as well as students in richer countries.',
  'Without these basic things, even big plans to improve education will remain only promises written on paper.',
  'Another good step is to train more teachers and let students learn with digital tools.',
  'Teachers in poorer places often cannot learn newer ways to teach, so regular training could help them teach better.',
  'At the same time, technology can make the difference smaller if people plan how to use it carefully.',
  'Online lessons, recorded classes and low-cost learning websites can help students learn well when they cannot get specialist teachers.',
  'But this should not mean just giving out computers or tablets.',
  'Governments and charities must also make internet cheap enough, give help with technology, and offer lessons that fit local needs, so technology helps students instead of blocking them.',
  'To sum up, no single quick rule can close the education gap between rich and poor countries.',
  'Schools need money for many years, teachers need better training, and students need internet and tools they can use well.',
  'If these steps work together, poorer countries can give young people more than rooms to study in: they can give them real chances to succeed.',
];
const vocabulary=[
  [['widening','getting bigger','不斷擴大'],['wealthy and poor nations','rich and poor countries','富裕與貧困國家'],['limits social mobility','makes it harder for young people to improve their lives','限制社會流動'],['traps many young people in cycles of disadvantage','keeps many of them from getting ahead','讓青年陷入劣勢循環']],
  [['Several practical solutions','Several clear steps','數個實際解法'],['reduce this divide','make this difference smaller','縮小差距'],['international organisations','world groups','國際組織'],['private institutions','businesses and other private groups','私人機構'],['treating education as a local issue alone','leaving each country to solve it alone','只視教育為地方問題']],
  [['important solution','important step','重要方案'],['increase long-term investment','spend more money over many years','增加長期投資'],['basic educational infrastructure','basic things schools need','基礎教育設施']],
  [['students are not failing because they lack ability','students fall behind, but not because they cannot learn','學生不是因能力而落後'],['overcrowded classrooms','crowded rooms','過度擁擠課室'],['poorly equipped schools','schools without enough equipment','設備不足學校'],['shortage of trained teachers','too few trained teachers','受訓教師短缺']],
  [['International aid','Help from other countries','國際援助'],['be directed not only towards building schools','pay not only to build schools','不只用於建校'],['maintaining them','look after them','維修保養'],['supplying learning materials','provide books and supplies','提供學習材料'],['paying teachers properly','pay teachers fairly','合理付教師薪酬']],
  [['rural school','school in the countryside','鄉村學校'],['reliable electricity','steady power','穩定電力'],['internet access','internet','網絡連接'],['textbooks','books','課本'],['qualified staff','trained teachers','合資格教職員'],['fairer chance to compete','fairer chance to do as well','更公平的競爭機會']],
  [['Without these foundations','Without these basic things','沒有這些基礎'],['most ambitious education reforms','big plans to improve education','最有抱負的教育改革'],['remain paper promises','remain only promises written on paper','停留在紙上承諾']],
  [['Another effective approach','Another good step','另一有效方法'],['expand teacher training','train more teachers','擴大教師培訓'],['digital learning','learn with digital tools','數碼學習']],
  [['poorer regions','poorer places','較貧困地區'],['limited access to modern teaching methods','cannot learn newer ways to teach','較少接觸現代教學法'],['regular professional development','regular training','定期專業發展'],['deliver lessons more effectively','teach better','更有效授課']],
  [['At the same time','At the same time','同時'],['narrow the educational gap','make the difference smaller','縮小教育差距'],['introduced carefully','plan how to use it carefully','審慎引入']],
  [['Online courses','Online lessons','網上課程'],['recorded lectures','recorded classes','錄影講座'],['low-cost learning platforms','low-cost learning websites','低成本學習平台'],['high-quality instruction','learn well','高質素教學'],['otherwise have no access to specialist teachers','cannot get specialist teachers','原本無法接觸專科教師']],
  [['However','But','然而'],['should not mean simply handing out devices','should not mean just giving out computers or tablets','不應只派設備']],
  [['affordable internet','make internet cheap enough','可負擔網絡'],['technical support','help with technology','技術支援'],['locally relevant content','lessons that fit local needs','符合本地需要內容'],['bridge rather than another barrier','helps students instead of blocking them','橋樑而非障礙']],
  [['In conclusion','To sum up','總結來說'],['cannot be solved by one quick policy','no single quick rule can close','不能靠單一速成政策解決'],['education gap between rich and poor countries','education gap between rich and poor countries','貧富國家教育差距']],
  [['sustained investment in schools','Schools need money for many years','對學校持續投資'],['better teacher training','teachers need better training','更好教師培訓'],['well-managed digital access','students need internet and tools they can use well','妥善數碼學習途徑']],
  [['measures are combined','steps work together','措施結合'],['not just classrooms, but genuine opportunities','more than rooms to study in: they can give them real chances to succeed','不只課室更有真實機會']],
];
const chunkOverrides=[
  ['The widening gap between education in wealthy and poor nations','is a serious problem','because it limits social mobility','and traps many young people in cycles of disadvantage.'],
  ['Several practical solutions can reduce this divide,','especially if governments, international organisations, and private institutions','work together rather than treating education as a local issue alone.'],
  ['One important solution is to increase long-term investment','in basic educational infrastructure.'],
  ['In many poorer countries, students are not failing','because they lack ability;','they are held back by overcrowded classrooms,','poorly equipped schools, and a shortage of trained teachers.'],
  ['International aid should therefore be directed','not only towards building schools,','but also towards maintaining them, supplying learning materials,','and paying teachers properly.'],
  ['For example, a rural school with reliable electricity,','internet access, textbooks, and qualified staff','would immediately give its students a fairer chance','to compete with those in richer countries.'],
  ['Without these foundations,','even the most ambitious education reforms','will remain paper promises.'],
  ['Another effective approach is to expand teacher training','and digital learning.'],
  ['Teachers in poorer regions often have limited access','to modern teaching methods,','so regular professional development could help them','deliver lessons more effectively.'],
  ['At the same time, technology can narrow the educational gap','if it is introduced carefully.'],
  ['Online courses, recorded lectures, and low-cost learning platforms','can bring high-quality instruction to students','who would otherwise have no access to specialist teachers.'],
  ['However, this should not mean','simply handing out devices.'],
  ['Governments and charities must also provide affordable internet,','technical support, and locally relevant content,','so that technology becomes a bridge rather than another barrier.'],
  ['In conclusion, the education gap between rich and poor countries','cannot be solved by one quick policy.'],
  ['It requires sustained investment in schools,','better teacher training,','and well-managed digital access.'],
  ['If these measures are combined,','poorer countries can give their young people','not just classrooms, but genuine opportunities.'],
];
const simpleChunkOverrides=[
  ['The difference in education between rich and poor countries','is getting bigger,','and this is a serious problem','because it makes it harder for young people','to improve their lives and keeps many of them','from getting ahead.'],
  ['Several clear steps can make this difference smaller,','especially if governments, world groups, businesses','and other private groups work together','instead of leaving each country to solve it alone.'],
  ['One important step is to spend more money','over many years on the basic things schools need.'],
  ['In many poorer countries, students fall behind,','but not because they cannot learn;','crowded rooms, schools without enough equipment','and too few trained teachers hold them back.'],
  ['Help from other countries should pay','not only to build schools,','but also to look after them, provide books and supplies,','and pay teachers fairly.'],
  ['For example, a school in the countryside','with steady power, internet, books and trained teachers','would quickly give its students a fairer chance','to do as well as students in richer countries.'],
  ['Without these basic things,','even big plans to improve education','will remain only promises written on paper.'],
  ['Another good step is to train more teachers','and let students learn with digital tools.'],
  ['Teachers in poorer places often cannot learn','newer ways to teach,','so regular training could help them teach better.'],
  ['At the same time, technology can make the difference smaller','if people plan how to use it carefully.'],
  ['Online lessons, recorded classes and low-cost learning websites','can help students learn well','when they cannot get specialist teachers.'],
  ['But this should not mean','just giving out computers or tablets.'],
  ['Governments and charities must also make internet cheap enough,','give help with technology,','and offer lessons that fit local needs,','so technology helps students instead of blocking them.'],
  ['To sum up, no single quick rule','can close the education gap','between rich and poor countries.'],
  ['Schools need money for many years,','teachers need better training,','and students need internet and tools','they can use well.'],
  ['If these steps work together,','poorer countries can give young people','more than rooms to study in:','they can give them real chances to succeed.'],
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
  card('The widening gap in public transport is a serious problem because it limits work choices and traps families far from services.','用 because 並列差距造成的兩項長期傷害',[2,7,13],
    fixed(0,'[不斷擴大的差距] is a serious problem because it [限制機會] and [形成劣勢循環].','指出國家間教育差距為何重要：限制社會流動並使青年難走出劣勢。','引言不能只說差距存在，還須交代它對人的長期影響時。',[' is a serious problem because it ', ' and '],['需要解決的擴大差距','第一項機會損失','第二項持續不利後果'])),
  card('Several practical solutions can reduce the safety gap, especially if councils, charities and employers work together rather than leaving each area alone.','用 especially if ... work together rather than 建立多方合作條件',[0,3,12],
    fixed(1,'Several practical solutions can reduce [差距], especially if [多方機構] work together rather than [只當成地方問題].','預告方案需政府、國際組織及私人機構合作，避免單一地區獨力承擔。','引言要從問題轉入解方，並指出跨機構合作是成功條件時。',['Several practical solutions can reduce ', ', especially if ', ' work together rather than '],['要縮小的差距','應合作的機構','需要避免的狹窄處理方式'])),
  card('One important solution is to increase long-term investment in safe public buses.','用 One important solution is to 提出第一項長期基礎投入',[1,7,14],
    fixed(2,'One important solution is to increase long-term investment in [基礎教育設施].','把第一主體段的焦點定在學校實體條件的長期投資。','開始第一個方案段，需先清楚指出要持續投入甚麼時。',['One important solution is to increase long-term investment in '],['需要長期投資的基礎設施'])),
  card('In many villages, pupils are not late because they are lazy; they are held back by unreliable buses and unsafe roads.','用 not ... because ...; they are held back by 修正對落後學生的歸因',[0,2,8],
    fixed(3,'In [較貧困地區], students are not failing because [缺乏能力]; they are held back by [擠迫課室、設備不足與師資短缺].','把學習落後由個人能力不足，轉回學校資源和教師缺口。','提出投資後，要說明為何低成績不能單純責怪學生時。',['In ', ', students are not failing because ', '; they are held back by '],['資源不足的地區','被否定的能力歸因','真正阻礙學習的條件'])),
  card('Public funding should be directed not only towards buying buses, but also towards maintaining them and training drivers.','用 not only towards ... but also towards 擴大援助的完整用途',[2,5,11],
    fixed(4,'International aid should therefore be directed not only towards [建校], but also towards [保養、材料與教師薪酬].','把援助由一次性建校延伸到維持學校運作的持續資源。','要防止方案只重視新建築而忽略長期運作時。',['International aid should therefore be directed not only towards ', ', but also towards '],['容易受重視的建校項目','讓學校持續運作的其他投入'])),
  card('For example, a village clinic with steady power, medicine and trained staff would give patients a fairer chance to get care.','用 For example ... with ... would give ... chance 讓基礎投入變成可見機會',[3,4,6],
    fixed(5,'For example, [鄉村學校] with [穩定電力、網絡、課本與師資] would immediately give [學生] a fairer chance to [與富裕地區比較].','用一所鄉村學校的具體配備，展示資源如何轉為學生的競爭機會。','列完投資項目後，要用完整場景說明資源對學生的實際作用時。',['For example, ', ' with ', ' would immediately give ', ' a fairer chance to '],['被改善的鄉村學校','到位的基礎資源','得到機會的學生','能更公平參與的目標'])),
  card('Without these foundations, even the best safety plan will remain a paper promise.','用 Without ... even ... will remain 指出缺基礎時改革難落實',[2,5,10],
    fixed(6,'Without [基礎條件], even [有抱負的改革] will remain [紙上承諾].','收束基礎設施段：缺少電力、教材與師資，宏大改革也無法落地。','要警示讀者方案不能只停在口號，必須先具備基本條件時。',['Without ', ', even ', ' will remain '],['缺少的基礎','看似有希望的改革','難以落實的結果'])),
  card('Another effective approach is to expand nurse training and remote medical advice.','用 Another effective approach is to 擴展到人才與數碼工具',[2,9,12],
    fixed(7,'Another effective approach is to expand [教師培訓與數碼學習].','轉入第二種方案，把人力培訓與科技學習並列。','完成校舍基礎段後，要開啟另一組互補的解法時。',['Another effective approach is to expand '],['第二組要擴大的做法'])),
  card('Teachers in remote towns often have limited access to new methods, so regular training could help them teach more effectively.','用 limited access ... so ... could help 說培訓如何改善教學',[3,7,10],
    fixed(8,'Teachers in [貧困地區] often have limited access to [新教法], so [定期培訓] could help them [改善授課].','解釋教師培訓不是形式：它填補新教學方法的取得缺口。','已提出培訓，接着要交代教師目前缺甚麼以及培訓帶來甚麼時。',['Teachers in ', ' often have limited access to ', ', so ', ' could help them '],['缺資源地區','教師接觸不足的教法','能補足缺口的培訓','對課堂帶來的改善'])),
  card('At the same time, online advice can reduce the care gap if it is introduced carefully.','用 At the same time ... can ... if 加入科技及實施條件',[7,8,12],
    fixed(9,'At the same time, [科技] can [縮小教育差距] if [審慎引入].','在教師培訓之外補上數碼學習，但加上實施方式的條件。','要提出科技可能有幫助，同時避免把科技寫成自動解法時。',['At the same time, ', ' can ', ' if '],['被加入的科技','可改善的差距','必須具備的實施條件'])),
  card('Recorded lessons can bring skilled teaching to pupils who would otherwise have no access to specialist tutors.','用 can bring ... to ... who would otherwise have no access 說科技跨越師資距離',[8,9,11],
    fixed(10,'[網上課程等工具] can bring [高質素教學] to students who would otherwise have no access to [專科教師].','指出數碼工具具體服務哪些原本接觸不到專科教師的學生。','已說科技可縮差距，須解釋它如何把教學送到缺師資地區時。',[' can bring ', ' to students who would otherwise have no access to '],['可遠程傳送內容的工具','可送到學生的教學','原本接觸不到的教師資源'])),
  card('However, this should not mean simply handing out tablets without lessons or support.','用 should not mean simply 防止把工具派發當成完整方案',[4,10,12],
    fixed(11,'However, this should not mean simply [派發設備].','指出數碼學習不能縮成只交給學生一件設備。','講完科技的優點後，要防止讀者把實施條件省略時。',['However, this should not mean simply '],['不足以構成數碼學習的單一行動'])),
  card('Clinics must also provide cheap internet and local-language advice, so that technology becomes a bridge rather than another barrier.','用 so that ... bridge rather than barrier 把配套連到公平使用',[1,9,11],
    fixed(12,'[政府與慈善機構] must also provide [網絡、支援與本地內容], so that technology becomes [橋樑] rather than [障礙].','明列設備以外的網絡、技術支援與本地內容，使科技真正可用。','已指出不能只派設備，接着要說明配套以及避免加深差距的目的時。',[' must also provide ', ', so that technology becomes ', ' rather than '],['負責供應配套的機構','真正可用所需的配套','希望達成的連結','須避免的新障礙'])),
  card('In conclusion, the health gap between rich and poor regions cannot be solved by one quick policy.','用 cannot be solved by one quick policy 否定單一速成做法',[0,2,15],
    fixed(13,'In conclusion, [貧富國家教育差距] cannot be solved by [一項速成政策].','結論先說問題不能靠單一措施處理，為組合方案鋪路。','已有多項方案，結尾要點出它們為何必須合用時。',['In conclusion, ', ' cannot be solved by '],['需要處理的差距','不足夠的單一做法'])),
  card('It requires steady funding, better staff training, and reliable access to online services.','用 It requires 三項並列回收全文方案',[2,7,13],
    fixed(14,'It requires [持續校舍投資], [教師培訓], and [妥善數碼使用].','濃縮全文三類互補投入：學校、教師與數碼接入。','結論要用短清單回答「有哪些解法」時。',['It requires ', ', ', ', and '],['第一類長期投入','第二類人力改善','第三類數碼接入'])),
  card('If these measures are combined, small towns can gain not just clinics, but genuine access to care.','用 If combined ... not just ... but 把配套組合連到真正機會',[5,13,14],
    fixed(15,'If [多項措施結合], [較貧困國家] can give [青年] not just [課室], but [真正機會].','最後把物理教室與實際能學、能發展的機會區分，並以方案組合為條件。','結尾要說明校舍和科技不是目的，目的在於青年真正獲得機會時。',['If ', ', ', ' can give ', ' not just ', ', but '],['措施結合的條件','可改善教育的國家','得到機會的青年','單靠建築的局限','希望產生的實質機會'])),
];
const wrongReasons=[
  ['方案合作句預告解法，沒有 because 說差距對青年的兩項傷害。','第一項投資只提出做法，沒有界定差距造成的問題。','結論說單一政策不足，沒有引言解釋差距為何嚴重。'],
  ['because 說差距傷害，沒有跨機構協作的成功條件。','學生落後的原因是資源缺口，沒有機構應如何合作。','數碼配套句只列合作後須提供甚麼，沒有引言的整體協作方向。'],
  ['多方合作是總方向，沒有指定第一項基礎教育設施投資。','另一有效方法指向教師培訓和數碼學習，並非第一項校舍方案。','結論三項清單回收全文，沒有第一主體段的起點。'],
  ['差距傷害是社會後果，沒有修正對學生能力的錯誤歸因。','第一項投資說要增加資源，沒有解釋成績落後是甚麼造成。','教師缺新教法是培訓需要，沒有教室、設備和師資整體缺口。'],
  ['投資總述只命名基礎設施，沒有援助如何分配的細節。','鄉村學校例子列最終資源，沒有 not only ... but also 的資助範圍。','單純派設備是科技段的警告，沒有建校與保養的資金安排。'],
  ['學生資源缺口說需投資，沒有一所鄉村學校的具體場景。','國際援助分配是政策原則，沒有學生競爭機會的可見結果。','沒有基礎改革只成紙上承諾，沒有展示資源到位後怎樣幫學生。'],
  ['投資句提出投入方向，沒有 Without 條件下改革不能落實。','鄉村學校例子是資源到位的好處，沒有缺資源時的後果。','網上課程說科技益處，沒有校舍基礎不足與紙上承諾的比較。'],
  ['第一項方案是校舍基礎投資，沒有轉入培訓與數碼學習。','At the same time 只加上科技的條件，沒有把教師培訓一起列作新方向。','配套要求是科技方案細節，沒有第二主體段的總起。'],
  ['學生落後原因的總述不專門解釋教師如何接觸新方法。','另一有效方法只命名培訓，沒有說現有缺口及教學改善。','網上課程提供遠程教學，沒有教師定期專業發展的因果。'],
  ['第二方案總起同列培訓與科技，沒有 if 的審慎引入條件。','教師定期訓練是人力改善，沒有科技的實施條件。','數碼配套句寫怎樣讓科技成橋樑，沒有先指出審慎引入的必要。'],
  ['教師訓練改善教法，沒有網上資源如何觸及缺專科教師的學生。','科技可縮差距是總述，沒有課程與錄影具體如何傳送。','只派設備的警告沒有遠程專科教學的正面機制。'],
  ['援助不只建校是第一段資助範圍，沒有數碼設備的局限。','網上課程說科技的潛力，沒有轉折指出只派設備不足。','數碼配套詳列網絡等條件，沒有先排除「只派設備」的誤解。'],
  ['多方合作預告機構角色，沒有網絡、技術支援及本地內容。','科技審慎引入只是條件總述，沒有橋樑與障礙的具體配套。','只派設備不足是負面警告，沒有說要提供甚麼才能真正接通。'],
  ['問題嚴重的引言沒有總結多項政策為何必須組合。','第一項投資是局部方案，沒有否定單一速成措施。','結尾最後說真正機會，沒有先指出一項快政策不足。'],
  ['校舍投資只列第一項，沒有結論三類投入並列。','教師與科技總起沒有收回持續校舍投資。','單一政策不足是結論總原則，沒有逐項重列所需投入。'],
  ['鄉村學校例子說一所學校可得較公平機會，沒有組合措施的全篇收束。','一項速成政策不足只排除壞解法，沒有 not just ... but 的目的對照。','三類投入的短清單沒有說課室以外的真正機會。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這道題目主要要求文章做甚麼？',[
    '提出縮小貧富國家教育差距的可行方案，並說明方案如何奏效',
    '比較每個國家所有大學的排名，再選出收費最低的一間',
    '判斷學生天生是否聰明，並取消所有教師專業訓練',
    '只描述差距有多大，不需要提出任何可執行的解法',
  ],'題目問 solutions；答案須提出具體措施，並解釋它們如何改善取得教育的機會。'),
  {type:'multi',prompt:'選出範文兩段主體的主要方案',detail:'選兩項，再按「確認」。',options:[
    '長期投資校舍設施、教材與教師薪酬，讓基本學習條件真正到位',
    '擴大教師培訓與數碼教學，同時提供網絡、技術支援和本地內容',
    '只興建新校舍，不需要保養，也不用再支付教師薪酬',
    '只派電子設備，假設沒有網絡和本地課程仍能正常學習',
  ],correct:[0,1],why:'第一段處理實體學習條件；第二段把培訓、數碼資源與實施配套結合。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言：問題與合作','教育差距限制青年機會，解法需政府、國際和私人機構合作。'],
  ['基礎投入','長期資助校舍運作、教材與教師，以鄉村學校說明公平機會。'],
  ['培訓與數碼接入','讓教師接觸新教法，並讓學生在有網絡和本地內容時用到遠程課程。'],
  ['結論：組合方案','單一速成政策不足；校舍、教師與數碼機會共同創造實質教育機會。'],
],'先說差距的傷害 → 補足校舍基本條件 → 改善教師和數碼學習 → 組合收束。')];
const evidence=[
  quiz('作者為何反對把貧困國家的學生成績落後歸咎能力？',[
    '擁擠課室、設備不足及缺受訓教師會阻礙本有能力的學生',
    '因為所有學生無論學習條件如何，都必然取得相同成績',
    '因為只要學生努力，學校完全不需要課本和教師',
    '因為文章認為任何國家都沒有學習資源差距',
  ],'not because ...; ... 把焦點從學生能力轉到可改善的環境條件。'),
  quiz('為甚麼援助不能只用於興建學校？',[
    '校舍還要保養、供教材，並持續合理支付教師薪酬',
    '新校舍一建成，課本和教師便自然出現且毋須費用',
    '只要付建築費，任何網絡與電力問題都會自動解決',
    '文章認為校舍完全不重要，所以不應投資任何建築',
  ],'原文用 not only ... but also 延伸一次性建校至持續運作。'),
  quiz('鄉村學校的例子要展示甚麼？',[
    '穩定電力、網絡、課本與合資格人員可給學生較公平的機會',
    '只要校舍外觀整齊，學生便能取得所有專科教師支援',
    '鄉村學生沒有學習能力，所以資源到位也完全沒作用',
    '只有富裕國家的學生需要電力和課本才能學習',
  ],'例子把具體學習資源連到與較富裕地區較公平的競爭機會。'),
  quiz('教師培訓如何縮小差距？',[
    '定期專業發展讓較貧困地區教師學新教法，改善授課',
    '只要求教師自己購買設備，不需任何教學方法交流',
    '讓教師停止教學，避免學生發現學校缺乏資源',
    '只重複多年未更新的方法，假設教學效果會自動提高',
  ],'原文指出對新教法的接觸不足，培訓正是針對這個缺口。'),
  quiz('網上課程等工具可幫助哪些學生？',[
    '原本接觸不到專科教師、卻可透過遠程教學取得課程的學生',
    '已能每天面見所有專科教師、且完全沒有任何學習需要的學生',
    '只有住在富裕城市、學校設備最充足的學生',
    '只接受派設備、沒有網絡與任何課程內容的學生',
  ],'who would otherwise have no access 指向原本缺專科師資的學生。'),
  quiz('為何「只派設備」不是完整數碼方案？',[
    '學生還需可負擔網絡、技術支援及符合本地需要的內容',
    '設備一到手，所有地方便自動有便宜網絡和教學內容',
    '學生只需學會開機，完全不需要教師或學習材料',
    '網絡和技術支援只為富裕地區而設，貧困地區不用',
  ],'設備要配合連線、支援和適用內容，科技才是橋樑而非障礙。'),
  quiz('結論的「真正機會」比單有課室多了甚麼？',[
    '資源、教師和數碼接入配合，使青年真的能學習和發展',
    '只建房間而不保養，讓改革停留在紙上承諾',
    '只把課室數量當成全部成果，不看學生能否學到東西',
    '只要求年輕人自行解決網絡與師資所有缺口',
  ],'not just ... but ... 說建築是條件之一，實際機會才是目的。'),
];
const logic=[
  sequence('第一主體段：從基礎投資到較公平的學習機會',[
    ['提出長期投資','先增加基礎教育設施的長期投入。'],
    ['修正能力歸因','擁擠課室、設備和師資不足會阻礙學生，不是學生天生不能學。'],
    ['分配援助','不只建校，也要保養、供教材及合理支付教師。'],
    ['鄉村學校個案','有電力、網絡、課本和合資格人員，學生才有較公平機會。'],
    ['紙上承諾警示','缺這些基礎，其他雄心改革也難以落實。'],
  ],'每一步都回答「投甚麼、為何要投、投後如何幫學生」。'),
  sequence('第二主體段：科技需與教師及配套一起發揮作用',[
    ['提出另一組方案','擴大教師培訓與數碼學習。'],
    ['補教師方法缺口','定期培訓讓貧困地區教師接觸更新教法。'],
    ['說科技的可用處','網上課程與錄影教學接觸原本無專科教師的學生。'],
    ['排除只派設備','設備本身不等於可用的數碼教育。'],
    ['補齊條件','可負擔網絡、技術支援與本地內容使科技成橋樑。'],
  ],'教師、課程、連線和支援互相依賴；缺任何核心配套都會削弱數碼工具。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('山區醫療差距擴大。政府想建新診所，卻沒有安排電力、藥品和醫護薪酬。','哪項最能轉用範文的基礎設施原則？',[
    '建築須配合維修、物資和人員，診所才能持續服務',
    '只要診所落成，藥品與醫護便會自行出現',
    '把全部經費只用於開幕活動，避免長期運作開支',
    '因山區難服務，就完全停止提供任何醫療資源',
  ],[
    '範文強調建校只是開始，還要保養、教材和合理支付教師。',
    '建築本身不能替代運作資源。',
    '一次性活動沒有解決持續服務問題。',
    '文章主張補資源，而非放棄資源少的地區。',
  ],[2,4,5,6],'範文說國際援助不能只建校，也須保養設施、供教材及支付教師。'),
  transfer('偏遠學校學生考試成績低，校方卻一直缺課本、電力和受訓教師。','哪項最貼合範文對學生能力的判斷？',[
    '先補基本學習條件，不把低成績直接當作能力不足',
    '只看分數就斷定所有學生天生不適合學習',
    '只要求學生更加努力，不安排書本和合資格教師',
    '完全不看課室和設備，只比較不同學生的排名',
  ],[
    '原文說學生落後往往是資源阻礙，不能直接歸咎能力。',
    '題目已列可改善的學習條件缺口。',
    '努力無法代替最基本的教材與師資。',
    '只排名仍未解釋低成績為何出現。',
  ],[0,3,5],'範文把學生落後與擁擠課室、設備不足及師資短缺相連。'),
  transfer('國際機構資助新圖書館，但沒有書、館員或日後維修預算。','哪項最能避免「紙上承諾」？',[
    '把館藏、人員和維修列入長期經費，確保能開放',
    '只拍攝漂亮建築照片，不檢查學生能否借書',
    '等多年後設備壞掉，才第一次考慮安排維修',
    '因開館不易，就把書和館員視為可有可無',
  ],[
    '範文把基礎設施的持續投入視為宏大方案能落地的條件。',
    '外觀不能代表實際教育服務。',
    '沒有維修計劃，服務難以持續。',
    '館藏與人員是圖書館真正運作的基礎。',
  ],[4,5,6],'範文提醒沒有基本配備時改革會停在紙上，援助要覆蓋維持運作的資源。'),
  transfer('農村教師多年未接觸新教法，只有舊教材。機構可每月安排教師交流。','哪項最符合範文的教師培訓機制？',[
    '定期交流補新教法缺口，幫教師改善日常授課',
    '只發新證書，不讓教師接觸任何教學示範',
    '只要求教師延長工時，不更新課堂方法和教材',
    '因教師在農村，就假設他們不可能學會新教法',
  ],[
    '原文把接觸新教法不足，與定期專業發展直接配對。',
    '證書本身不保證教學方法改善。',
    '延長工時並未補足教法缺口。',
    '培訓正是要擴大教師可接觸的方法。',
  ],[7,8],'範文說貧困地區教師缺少現代教法的取得機會，定期培訓可改善授課。'),
  transfer('島上學生沒有物理專科教師，已有網絡與可用的錄影課程。','哪項最能說明遠程學習的作用？',[
    '把原本接觸不到的專科教學送到島上學生面前',
    '只要有錄影，學校便完全不再需要任何教師',
    '把錄影只留在城市，避免島上學生使用網絡',
    '只計算影片數目，不問學生是否能理解內容',
  ],[
    '原文針對 otherwise have no access 的學生，說明數碼傳送的優點。',
    '數碼課程補不足師資，沒有說可完全取消教師。',
    '這會維持而非縮小取得教學的差距。',
    '內容能否教會學生，才是使用工具的目的。',
  ],[9,10],'範文說網上課程與錄影講座可為原本接觸不到專科教師的學生提供教學。'),
  transfer('慈善機構給每名學生平板，但村內網絡昂貴、設備故障後無人協助，課程又只用外地語言。','哪項最能補齊範文的數碼配套？',[
    '提供可負擔網絡、技術協助及適合本地的課程內容',
    '繼續增加平板數量，不處理網絡或課程是否可用',
    '只安排設備開箱活動，不打算處理故障和語言',
    '只讓學生自付昂貴網費，再假設數碼差距已消失',
  ],[
    '原文特別指出派設備以外還須網絡、技術支援與本地內容。',
    '設備多不代表真的能上課。',
    '開箱活動沒有處理持續使用的障礙。',
    '昂貴網費可令科技成為新障礙。',
  ],[10,11,12],'範文說不能只派設備，還要讓網絡可負擔、提供技術支援和本地內容。'),
  transfer('城鄉教育差距需要中央政府、地方學校、慈善機構和企業共同出資與規劃。','哪項最能轉用範文的合作條件？',[
    '把差距視為共同責任，讓各方配合資源與執行',
    '只交由一所學校處理，拒絕其他機構提供資源',
    '各方各自制定互相衝突的計劃，避免共同協調',
    '只在報告上列機構名稱，不安排任何實際合作',
  ],[
    '範文在引言說多方合作，因教育差距不能只當單一地區問題。',
    '一校無法獨力解決跨地區資源差距。',
    '互相衝突的方案不等於合作。',
    '名義參與沒有資源或執行內容。',
  ],[1,13,14],'範文要求政府、國際組織和私人機構共同處理教育差距。'),
  transfer('偏遠地區建了新校舍，也有平板，但學生仍缺受訓教師及穩定網絡。','哪項最符合範文對方案組合的要求？',[
    '補教師培訓與穩定網絡，讓校舍和平板真正可用',
    '只再建一幢校舍，假設教師與網絡會自然出現',
    '只再派平板，毋須確認能否連線或得到教學',
    '只保留新建築，取消學生使用教材的安排',
  ],[
    '原文說學校基礎、教師能力與數碼接入須一起配合。',
    '題目缺口不在建築數量。',
    '沒有連線和教學，設備不會自動創造機會。',
    '材料與教學是校舍能發揮作用的條件。',
  ],[5,7,11,12,14],'範文結論把校舍持續投資、教師培訓和妥善數碼接入並列。'),
  transfer('教育慈善項目報告只寫「今年建成十間課室」，沒有學生學到甚麼的資料。','哪項最貼近範文最後一句的評估焦點？',[
    '看學生是否得到師資、課程及可持續的學習機會',
    '只數課室便判定項目成功，不查是否有人授課',
    '只看開幕人數，不問教材和網絡是否真的可用',
    '只列建築成本，不理學生能否因此改善未來',
  ],[
    'not just classrooms, but genuine opportunities 要把評估從房間轉到學生機會。',
    '課室數目不能單獨證明學習效果。',
    '開幕活動不是教育接入與運作證據。',
    '原文關心年輕人實際得到的發展機會。',
  ],[5,6,15],'範文以「不只課室，更是真正機會」作結，提醒建築只是通向學習的條件。'),
  transfer('政策簡報提議只靠一次平板派發縮小貧富地區教育差距。','哪項總結最符合範文？',[
    '單一做法不足，應結合學校投入、教師培訓與數碼配套',
    '只派設備便足夠，網絡、教師和本地內容都可省略',
    '只談差距問題嚴重，完全不提出其他配套或投入',
    '只要求學生多努力，無須理會教育資源取得差異',
  ],[
    '原文結論否定單一快政策，並列三類互補投入。',
    '派設備而無配套是文章明確反對的做法。',
    '題目要求解法，不能只描述問題。',
    '文章指出學生受資源不足阻礙，不能只責怪能力或努力。',
  ],[3,11,12,13,14,15],'範文說教育差距不能靠一項速成政策；校舍、教師和數碼接入須結合。'),
];
export default {
  key:'direct-question:14',
  meta:{topic:'縮小貧富國家的教育差距',summary:'長期投資校舍、教師培訓和有配套的數碼學習，才能把建築變成真正教育機會。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
