// Human-authored support for Direct Question 8; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-8-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:8'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'Interviews for managers look at more than job skills because managers must guide people, choose what to do, and show what the company believes in.',
  'I think people are not born knowing how to lead; they learn it by practising, gaining experience, and noticing their own strengths and mistakes.',
  'Companies also look for managers who understand feelings, make good choices, and can be counted on.',
  'People are not simply born with leadership ability.',
  'Some people may naturally seem confident or charming, but this alone does not make them good leaders.',
  'Good leaders listen, solve disagreements, make clear what others should do, and help people work well when things are hard.',
  'People usually learn these skills by facing hard situations again and again.',
  'For example, a new worker who learns to deal with unhappy customers, help struggling coworkers, and plan team tasks may lead better than someone who naturally likes to take charge.',
  'So leadership is less like a gift and more like a muscle: it gets stronger with practice, hard tests, and learning from mistakes.',
  'Besides leadership, companies want managers who understand people and make choices after thinking about all sides.',
  'Understanding feelings is necessary because a manager who does not notice how a team feels may cause needless stress, even if they know the technical work very well.',
  'A good manager must know when to support, when to push for better work, and when to let others act.',
  'Companies also seek honesty and a willingness to take responsibility.',
  'Managers handle money, judge workers’ performance, and share private information, so they must be honest and fair instead of looking after only themselves.',
  'Without these traits, a manager may look good in reports but hurt people in real work.',
  'To sum up, people are not born as leaders; they learn through experience and careful effort to improve.',
  'That is why companies rightly look at both personality and knowledge, especially care for others, good judgment, honesty and responsibility.',
];
const vocabulary=[
  [['Management interviews','Interviews for managers','管理職位面試'],['technical competence','job skills','專業能力'],['influence people','guide people','影響他人'],['make decisions','choose what to do','作出決策'],['represent the values of an organisation','show what the company believes in','代表機構價值觀']],
  [['In my view','I think','在我看來'],['innate skill','born knowing how to lead','天生技能'],['practical ability developed','learn it','後天培養的實用能力'],['training','practising','訓練'],['self-awareness','noticing their own strengths and mistakes','自我覺察']],
  [['tend to look for','look for','通常尋找'],['emotional intelligence','understand feelings','情緒智商'],['sound judgement','make good choices','良好判斷力'],['reliability','can be counted on','可靠性']],
  [['Leadership','leadership ability','領導能力'],['simply born with','simply born with','只是天生便有']],
  [['Although','Some people','儘管'],['charismatic','charming','有魅力'],['these qualities alone','this alone','單靠這些特質'],['effective leaders','good leaders','有效領導者']],
  [['Real leadership','Good leaders','真正領導力'],['listening carefully','listen','仔細聆聽'],['resolving conflict','solve disagreements','解決衝突'],['setting clear expectations','make clear what others should do','設定清楚期望'],['under pressure','when things are hard','在壓力下']],
  [['These abilities','these skills','這些能力'],['built through','learn','透過經驗建立'],['repeated exposure to difficult situations','facing hard situations again and again','反覆面對困難']],
  [['junior employee','new worker','初級員工'],['dissatisfied clients','unhappy customers','不滿的客戶'],['weaker colleagues','struggling coworkers','能力較弱的同事'],['organise team projects','plan team tasks','組織團隊項目'],['naturally dominant personality','naturally likes to take charge','天生強勢的性格']],
  [['In this sense','So','從這角度看'],['less like a gift and more like a muscle','less like a gift and more like a muscle','不像天賦，更像肌肉'],['trained, tested and corrected','practice, hard tests, and learning from mistakes','訓練、考驗和修正']],
  [['Apart from leadership','Besides leadership','除了領導力'],['understand people','understand people','理解他人'],['make balanced decisions','make choices after thinking about all sides','作出平衡決定']],
  [['Emotional intelligence','Understanding feelings','情緒智商'],['essential','necessary','必不可少'],['read the mood of a team','notice how a team feels','察覺團隊氣氛'],['unnecessary tension','needless stress','不必要的緊張'],['technical knowledge is excellent','know the technical work very well','專業知識出色']],
  [['encourage','support','鼓勵'],['challenge','push for better work','提出挑戰'],['step back','let others act','退一步']],
  [['In addition','also','此外'],['firms','Companies','企業'],['integrity','honesty','誠信'],['accountability','a willingness to take responsibility','問責／承擔責任']],
  [['control budgets','handle money','掌管預算'],['evaluate staff','judge workers’ performance','評估員工'],['sensitive information','private information','敏感資訊'],['act fairly','be honest and fair','公平行事'],['protect their own interests','looking after only themselves','只顧私利']],
  [['Without these qualities','Without these traits','沒有這些特質'],['efficient on paper','look good in reports','表面有效率'],['harmful in practice','hurt people in real work','實際工作有害']],
  [['In conclusion','To sum up','總結來說'],['inborn talent','born as leaders','天生才能'],['skill shaped by experience','learn through experience','透過經驗形成的技能'],['deliberate improvement','careful effort to improve','有意識地改進']],
  [['For this reason','That is why','基於此原因'],['assess personality as well as knowledge','look at both personality and knowledge','兼評性格與知識'],['empathy','care for others','同理心'],['judgement','good judgment','判斷力'],['integrity','honesty','誠信'],['responsibility','responsibility','責任感']],
];
const chunkOverrides=[
  ['Management interviews often examine far more','than a candidate’s technical competence,','because managers are expected to influence people,','make decisions and represent the values of an organisation.'],
  ['In my view, leadership is not an innate skill;','rather, it is a practical ability','developed through training, experience and self-awareness.'],
  ['Companies also tend to look for emotional intelligence,','sound judgement and reliability','when selecting managers.'],
  ['Leadership should not be seen','as something people are simply born with.'],
  ['Although some individuals may naturally appear','more confident or charismatic,','these qualities alone do not make them effective leaders.'],
  ['Real leadership involves listening carefully,','resolving conflict, setting clear expectations','and helping others perform well under pressure.'],
  ['These abilities are usually built','through repeated exposure to difficult situations.'],
  ['For example, a junior employee who gradually learns','how to handle dissatisfied clients,','support weaker colleagues and organise team projects','may become a far stronger leader','than someone who merely has a naturally dominant personality.'],
  ['In this sense, leadership is less like a gift','and more like a muscle:','it becomes stronger when it is trained, tested and corrected.'],
  ['Apart from leadership, companies usually want managers','who can understand people and make balanced decisions.'],
  ['Emotional intelligence is essential','because a manager who cannot read the mood of a team','may create unnecessary tension,','even if their technical knowledge is excellent.'],
  ['A good manager must know when to encourage,','when to challenge and when to step back.'],
  ['In addition, firms look for integrity','and accountability.'],
  ['Managers often control budgets, evaluate staff','and communicate sensitive information,','so they must be trusted to act fairly','rather than protect their own interests.'],
  ['Without these qualities, a manager may become','efficient on paper but harmful in practice.'],
  ['In conclusion, leadership is not an inborn talent','but a skill shaped by experience and deliberate improvement.'],
  ['For this reason, companies rightly assess personality','as well as knowledge,','especially qualities such as empathy, judgement, integrity and responsibility.'],
];
const simpleChunkOverrides=[
  ['Interviews for managers look at more than job skills','because managers must guide people, choose what to do,','and show what the company believes in.'],
  ['I think people are not born knowing how to lead;','they learn it by practising, gaining experience,','and noticing their own strengths and mistakes.'],
  ['Companies also look for managers who understand feelings,','make good choices, and can be counted on.'],
  ['People are not simply born','with leadership ability.'],
  ['Some people may naturally seem confident or charming,','but this alone does not make them good leaders.'],
  ['Good leaders listen, solve disagreements,','make clear what others should do,','and help people work well when things are hard.'],
  ['People usually learn these skills','by facing hard situations again and again.'],
  ['For example, a new worker who learns','to deal with unhappy customers,','help struggling coworkers, and plan team tasks','may lead better than someone','who naturally likes to take charge.'],
  ['So leadership is less like a gift','and more like a muscle:','it gets stronger with practice, hard tests,','and learning from mistakes.'],
  ['Besides leadership, companies want managers','who understand people and make choices after thinking about all sides.'],
  ['Understanding feelings is necessary','because a manager who does not notice how a team feels','may cause needless stress,','even if they know the technical work very well.'],
  ['A good manager must know when to support,','when to push for better work,','and when to let others act.'],
  ['Companies also seek honesty','and a willingness to take responsibility.'],
  ['Managers handle money, judge workers’ performance,','and share private information,','so they must be honest and fair','instead of looking after only themselves.'],
  ['Without these traits, a manager may look good in reports','but hurt people in real work.'],
  ['To sum up, people are not born as leaders;','they learn through experience','and careful effort to improve.'],
  ['That is why companies rightly look at both personality and knowledge,','especially care for others, good judgment,','honesty and responsibility.'],
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
  card('Teacher interviews often examine far more than subject knowledge, because teachers must guide pupils and work with parents.','用 far more than ... because 說明面試要超越技術能力的原因',[2,3,12],
    fixed(0,'[某職位面試] often examine far more than [技術知識], because [職位的其他責任].','先指出面試範圍超越專業知識，再解釋職位有哪些人際或判斷責任。','要說明招聘為何必須同時評估知識與性格時。',[' often examine far more than ', ', because '],['某職位面試','不充分的技術知識','職位的其他責任'])),
  card('In my view, confidence is not an inborn gift; rather, it is a skill developed through practice.','用 ; rather, 否定天生說法並提出後天培養的理解',[4,8,15],
    fixed(1,'In my view, [不是天生的能力]; rather, [由經驗發展的能力].','先表達立場，排除先天決定論，再以 rather 提出更貼切的後天解釋。','題目問某能力是否天生，想明確提出另一種來源時。',['In my view, ', '; rather, '],['被否定的先天說法','替代的後天解釋'])),
  card('Schools also tend to look for patience and reliability when hiring teachers.','用 look for ... when 指出選某職位時會考慮的其他特質',[0,9,16],
    fixed(2,'[機構] also tend to look for [多項特質] when [挑選職位].','補充一個機構在聘請特定職位時會尋找的能力與品格。','已討論一項核心能力，接着要預告其他招聘標準時。',[' also tend to look for ', ' when '],['招聘機構','另外重視的特質','選人的情境'])),
  card('Patience should not be seen as something people are simply born with.','用 should not be seen as something ... born with 反對先天決定說',[0,5,12],
    fixed(3,'[能力] should not be seen as something people are simply born with.','直接否定把一項能力視作出生便固定不變的看法。','要在主體段開頭明確說某能力可以學習或培養時。',[' should not be seen as something people are simply born with.'],['可培養的能力'])),
  card('Although some applicants may seem confident and friendly, these qualities alone do not make them effective teachers.','用 Although 承認外在魅力，仍否定它單獨足夠',[1,8,10],
    fixed(4,'Although [某人看似具魅力], these qualities alone do not [保證勝任].','承認某些天生或外顯特質有吸引力，但指出它們不足以單獨證明能力。','要避免把自信、口才或魅力直接等同實際領導表現時。',['Although ', ', these qualities alone do not '],['看似具備的特質','單靠它不能保證的成果'])),
  card('Good nursing involves listening, keeping careful records and explaining choices clearly.','用 involves 把抽象能力拆成可觀察的具體行動',[3,7,11],
    fixed(5,'[真正的能力] involves [多項可觀察行動].','把抽象的職位能力落實為聆聽、解決問題和支持他人等行動。','已否定只靠外表特質，接着要說勝任工作實際須做甚麼時。',[' involves '],['真正需要的能力','可觀察的具體行動'])),
  card('These abilities are usually built through repeated practice with real patients.','用 are usually built through 說明能力由重複經驗培養',[4,7,8],
    fixed(6,'These abilities are usually built through [反覆接觸或練習].','指出前述實務能力通常不是天生，而是在多次處理情況中建立。','列出具體技能後，要解釋它們如何逐步形成時。',['These abilities are usually built through '],['反覆的學習經驗'])),
  card('For example, a trainee who learns to handle complaints may become a better receptionist than someone who only speaks confidently.','用 who ... may become ... than 比較經學習與只靠天生外在特質的人',[0,5,9],
    fixed(7,'For example, [新人] who [逐步學到的行動] may become [較強的工作者] than [只靠表面特質的人].','舉兩種人作對照，說明學會實際工作能力者可能勝過只憑外顯氣勢者。','要用具體人物例子支持「能力可培養」而非「只靠天生」時。',['For example, ', ' who ', ' may become ', ' than '],['逐步學習的新人','學會的具體行動','可能成為的較強工作者','只靠表面特質的人'])),
  card('In this sense, writing is less like a gift and more like a muscle: it becomes stronger when it is practised and revised.','用 less like ... more like ... muscle 比喻能力會經訓練增強',[1,6,15],
    fixed(8,'In this sense, [能力] is less like [天生禮物] and more like [可鍛鍊的事物]: it becomes stronger when [練習與修正].','用比喻把能力由天賦改寫成可透過實踐、考驗和修正加強的事物。','要在段落結尾形象地總結某能力可以培養時。',['In this sense, ', ' is less like ', ' and more like ', ': it becomes stronger when '],['被解釋的能力','天生禮物','可鍛鍊的事物','能力被增強的條件'])),
  card('Apart from experience, schools usually want teachers who listen to pupils and make fair decisions.','用 Apart from 轉向核心能力以外的選人標準',[2,10,12],
    fixed(9,'Apart from [已討論的能力], [機構] usually want [職位人選] who [其他能力].','承接前段已談的一項能力，轉向機構仍會要求的其他特質。','已回答能力是否天生，下一段要回答招聘還看甚麼時。',['Apart from ', ', ', ' usually want ', ' who '],['已討論的能力','招聘機構','職位人選','其他被重視的能力'])),
  card('Empathy is essential because a teacher who cannot notice a pupil’s worry may make lessons harder, even if their subject knowledge is excellent.','用 essential because ... even if 說明人際能力不足可抵銷強技術知識',[0,4,13],
    fixed(10,'[人際能力] is essential because [缺少它的人] may [負面後果], even if [技術知識很強].','先說人際能力必要，解釋缺少它會造成甚麼，再承認技術知識好也不足以抵銷。','要說明知識之外的人際能力為何不可缺少時。',[' is essential because ', ' may ', ', even if '],['必要的人際能力','缺少能力的人','可能造成的負面後果','仍不足以抵銷的技術優勢'])),
  card('A good coach must know when to praise, when to correct and when to let players decide.','用 must know when to 三次並列不同情況下的判斷',[3,5,16],
    fixed(11,'[好的管理者] must know when to [行動一], when to [行動二] and when to [行動三].','同一管理者不是永遠採用一種態度，而是按情況選鼓勵、挑戰或退一步。','要把良好判斷力具體化為何時該採取不同做法時。',[' must know when to ', ', when to ', ' and when to '],['需要判斷的管理者','第一種時機與行動','第二種時機與行動','第三種時機與行動'])),
  card('In addition, schools look for honesty and patience.','用 In addition ... look for 補充另一組招聘條件',[2,9,14],
    fixed(12,'In addition, [機構] look for [另外的特質].','在已討論的能力之外，補上誠信與承擔責任等標準。','要在招聘準則清單中加入另一類品格要求時。',['In addition, ', ' look for '],['招聘機構','另外重視的特質'])),
  card('School leaders handle budgets and private records, so they must be trusted to act fairly rather than serve their friends.','用 so ... trusted to ... rather than 由職權推到公平與避免私利',[5,10,14],
    fixed(13,'[掌握資源與資訊的職責], so [持權者] must be trusted to [公平行事] rather than [偏袒私利].','先說經理掌握的權力，再推論他們必須值得信任，並排除為私利濫用權力。','要解釋誠信與問責為何是管理職位的實際要求時。',[', so ', ' must be trusted to ', ' rather than '],['掌握資源與資訊的職責','負責任的人','公平行事','偏袒私利'])),
  card('Without empathy, a teacher may become efficient on paper but harmful in practice.','用 Without ... on paper but ... in practice 對比表面效率與真實傷害',[1,7,13],
    fixed(14,'Without [關鍵品質], [管理者] may become [紙面上的好表現] but [實際後果].','缺少前述品格時，一個人雖在報表上有效率，實際卻可能傷害團隊。','要收束一段，指出缺少性格條件會使表面效率變得有害時。',['Without ', ', ', ' may become ', ' but '],['缺少的關鍵品質','被評估的管理者','表面上的好表現','實際造成的傷害'])),
  card('In conclusion, patience is not an inborn gift but a quality shaped by experience and effort.','用 is not ... but ... 重申能力的來源並提出正確定位',[0,7,12],
    fixed(15,'In conclusion, [能力] is not [天生才能] but [可培養的技能].','在結尾否定先天定位，重申能力由經驗和刻意改進形成。','要以簡短對照回應「某能力是否天生」的題問時。',['In conclusion, ', ' is not ', ' but '],['被評估的能力','被否定的先天定位','被肯定的後天定位'])),
  card('For this reason, schools rightly assess character as well as grades, especially qualities such as patience and responsibility.','用 For this reason ... as well as ... especially 連回原因並列具體性格標準',[2,9,15],
    fixed(16,'For this reason, [機構] rightly assess [性格] as well as [知識], especially [重要特質例子].','因此招聘應同時看人品與知識，並具體指出哪些性格特質重要。','結論要由前文推回面試方式，回答公司還尋找甚麼時。',['For this reason, ', ' rightly assess ', ' as well as ', ', especially '],['作評估的機構','性格面向','知識面向','值得特別看的特質'])),
];
const wrongReasons=[
  ['look for ... when 只列招聘特質，沒有解釋面試超越技術能力的原因。','should not be seen as born with 反對天生說，沒有說面試職責範圍。','In addition 補上品格條件，沒有 because 推出為何必須評估更多。'],
  ['Although 承認外在魅力但否定足夠，沒有以 rather 提出能力的後天來源。','less like gift 比喻可訓練能力，沒有直接反駁天生說再定位。','In conclusion 總結相同立場，卻沒有 rather 所呈現的引言修正步驟。'],
  ['面試範圍及原因的總述，沒有 when 選人情境下列出特質。','Apart from 預示另一類標準，沒有 tend to look for 的一般招聘習慣。','For this reason 在結尾論證雙面向評估，沒有開場補列幾項特質。'],
  ['far more than 說面試要看超過技術知識，沒有直接否定領導天生。','involves 列實際領導行動，沒有指出能力非出生固定。','In addition 補另一類條件，沒有 should not be seen as 的判斷。'],
  ['rather 修正天生說並提出後天形成，沒有承認魅力卻排除其充分性。','肌肉比喻強調鍛鍊，沒有以 Although 承認外顯特質再評估。','essential because ... even if 說人際能力必要，沒有「外在魅力單靠不足」的對照。'],
  ['should not be seen as born with 只反對先天說，沒有拆出具體領導行動。','新人學會技能的例子，沒有總列真正領導所需的多種行動。','must know when to 說按時機判斷，沒有總述領導包含哪些任務。'],
  ['Although 承認魅力但說不足，沒有解釋實務能力如何建立。','新人與天生強勢者比較，沒有概括重複經驗的培養途徑。','肌肉比喻總結可鍛鍊，沒有直接說能力由哪些反覆經驗形成。'],
  ['面試職責範圍的總述，沒有經學習與只靠強勢的兩人對照。','involves 列具體任務，沒有以兩個人證明誰可能更強。','Apart from 轉向其他招聘標準，沒有用新人作例子。'],
  ['rather 直接修正先天說，沒有以兩個比喻說明訓練機制。','usually built through 說重複經驗，沒有禮物和肌肉的雙比喻。','In conclusion 總結非天生，沒有肌肉隨練習變強的圖像。'],
  ['look for ... when 列聘請條件，沒有從領導轉到另一組管理能力。','essential because 詳解其中一項人際能力，沒有 Apart from 的轉段作用。','In addition 再補誠信，沒有先建立理解人及判斷的總方向。'],
  ['far more than ... because 解釋面試範圍，沒有 even if 承認技術強仍不能抵銷人際缺陷。','Although 說外在魅力不足，沒有「缺人際感知 → 團隊緊張」的因果。','掌權者需公平行事，沒有情緒理解不足與技術知識的讓步。'],
  ['should not be seen as born with 是否天生的判斷，沒有三種時機下的行動。','involves 列領導任務，沒有 when to 反覆標出判斷時機。','For this reason 結論列性格條件，沒有實際何時鼓勵、挑戰或退一步。'],
  ['also tend to look for 說選職位時的常見特質，沒有 In addition 的段內補充。','Apart from 領導轉入理解人，沒有再加誠信與問責。','Without 說缺少品質的後果，沒有提出另一組招聘標準。'],
  ['involves 列管理行動，沒有職權帶來必須公平行事的推論。','essential because 說情緒能力缺失會製造緊張，沒有權力與私利對照。','Without 對比表面效率與實際傷害，沒有 so 由職責推到可信任要求。'],
  ['rather 修正能力來源，沒有缺少特質時紙面與實際結果的對比。','新人例子比較受訓與天生強勢者，沒有 Without 的負面後果。','掌權者應公平而非自利，沒有「報表效率但實際有害」的收束。'],
  ['far more than ... because 說面試為何看多種能力，沒有結尾重申非天生。','學習新人與天生強勢者的例子，沒有 is not ... but 的能力定位。','In addition 補品格條件，沒有回應領導力來源。'],
  ['look for ... when 列選人特質，沒有以 For this reason 推出雙面向評估。','Apart from 轉入其他能力，沒有結尾的 as well as 雙標準。','In conclusion 回應非天生說，沒有總結性格與知識一起評估的原因。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求文章分別回答甚麼？',[
    '領導力是否天生，以及招聘經理時還應看哪些性格特質',
    '所有經理應有多少薪酬，以及哪家公司面試時間最長',
    '員工是否都想升職，以及技術考試是否應全面取消',
    '公司應否只按外表選人，以及性格測試要收多少費用',
  ],'第一問討論領導力的來源；第二問要求具體列出選經理時重視的其他特質。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '領導力可從聆聽、解決衝突與實際經驗中逐步培養',
    '經理還須理解人、判斷時機、守信及對權力負責',
    '只要天生有魅力，就毋須練習或處理困難情況',
    '只有技術知識足夠，管理者是否公平便無關重要',
  ],correct:[0,1],why:'第一段反對領導力完全由天生決定；第二段提出人際與操守標準。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言雙重回答','管理面試不能只看技術；領導力可培養，還須看情緒理解、判斷和可靠性。'],
  ['能力如何培養','外在自信不足夠；聆聽、解決衝突和帶領他人可經困難經驗練成。'],
  ['其他選人準則','理解團隊情緒、按情況鼓勵或退讓，並以誠信和問責處理權力。'],
  ['結論','領導力不是天生禮物；招聘因此合理地同時看性格與知識。'],
],'先回答來源與招聘標準 → 證明可訓練 → 展開人際和操守 → 回到面試方式。')];
const evidence=[
  quiz('作者為何不把領導力視為單純天生？',[
    '外在自信與魅力不足，實際聆聽和解決衝突等能力可經驗培養',
    '因為所有有自信的人都一定無法帶領任何團隊',
    '因為領導者完全不需要決策或幫助他人',
    '因為只有天生性格強勢的人才可能學會管理',
  ],'原文反對只靠天生魅力，並列出可經實際情境學會的行動。'),
  quiz('初級員工的例子要證明甚麼？',[
    '學會處理客戶、支援同事及組織項目，可勝過只靠強勢個性',
    '初級員工只要工作年資短，就必然比所有主管更優秀',
    '天生強勢性格可直接代替對客戶和同事的實際支援',
    '領導力只由一次面試判定，工作經驗不會令它改變',
  ],'這是受訓行動與天生強勢性格的比較，而非年資比較。'),
  quiz('「領導力像肌肉」的比喻強調甚麼？',[
    '經過練習、考驗和修正，領導能力可以逐漸增強',
    '領導者必須有很強的身體肌肉，才可處理管理工作',
    '能力只在出生時決定，之後任何訓練都不會有用',
    '只要經理在辦公室久坐，領導力便會自動變強',
  ],'比喻說能力可鍛鍊，並非真正談身體肌肉。'),
  quiz('經理有很強的技術知識，為何仍需情緒智商？',[
    '若讀不到團隊氣氛，仍可能製造不必要的緊張',
    '技術知識強便能保證同事永遠沒有情緒或衝突',
    '情緒理解只用在顧客身上，對團隊管理沒有作用',
    '經理應永遠只採取同一種態度，不用考慮不同時機',
  ],'原文的 even if 表示技術優勢不能抵銷人際感知的缺失。'),
  quiz('「知道何時鼓勵、挑戰或退一步」表現了甚麼？',[
    '經理要因情況選擇不同做法，而非永遠只用一種方式',
    '經理只要選定一種語氣，所有員工便會有相同反應',
    '每次都只應向員工施壓，不必作任何觀察',
    '懂得退一步代表經理不用再對決策負責',
  ],'三個 when to 把判斷力變成具體的時機選擇。'),
  quiz('為甚麼管理職位要特別看誠信與問責？',[
    '經理掌握預算、評估員工和敏感資料，必須公平而非只顧私利',
    '經理不接觸任何資源或資訊，所以公平與否完全不重要',
    '只要文件做得快，偏袒自己也不會影響實際團隊',
    '問責代表經理可以把每項錯誤全部推給其他員工',
  ],'管理權力帶來對公平與責任的要求；紙面效率不能代替實際影響。'),
];
const logic=[
  sequence('第一主體段：由天生魅力的局限推到可練成的領導力',[
    ['否定先天說','領導力不應被當成出生就完全固定的東西。'],
    ['限制外在特質','自信或魅力可以有用，單靠它們不足以證明能領導。'],
    ['列實際工作','聆聽、解決衝突、說明期望，以及支援受壓同事。'],
    ['說明形成途徑','這些能力在反覆遇到困難與修正做法時培養出來。'],
    ['比較人物','經學習的初級員工，可能比只靠強勢性格者更能帶隊。'],
    ['肌肉比喻','領導力可訓練、考驗與修正，因而逐漸增強。'],
  ],'先排除天生外觀足夠，再列可觀察行動和反覆經驗，最後用比喻收束。'),
  sequence('第二主體段：把經理人選由知識擴展到人際與操守',[
    ['總說另外兩類','公司希望經理理解他人並作平衡決定。'],
    ['情緒理解','讀懂團隊氣氛，否則即使技術很強也可能製造緊張。'],
    ['判斷時機','知道何時鼓勵、挑戰，以及何時退一步。'],
    ['誠信與問責','掌握預算、評估與敏感資訊的人須公平行事。'],
    ['紙面與現實','缺少這些特質，報表上有效率的經理仍可能在現實傷害人。'],
  ],'技術能力以外，經理還要處理人與權力，兩方面都須在面試中評估。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('一所學校選副校長，一名候選人演講很有魅力，卻沒有處理同事衝突的經驗。','哪項最能轉用範文對天生魅力的限制？',[
    '承認演講魅力，再檢查聆聽、解決衝突和支援教師的能力',
    '只看演講是否動聽，假設所有團隊問題都會自動消失',
    '直接判斷有魅力者必然不適合管理，不用再看實際能力',
    '只問候選人是否天生自信，完全不觀察他如何處理同事',
  ],[
    '原文承認自信與魅力，但說它們不足以單獨證明領導能力。',
    '演講不能代替衝突處理和支援同事。',
    '原文沒有說有魅力是壞事，只說單靠它不夠。',
    '天生自信不能代替具體行動的證據。',
  ],[3,4,5],'範文先承認有人看起來更有魅力，再說真正領導仍需聆聽、解決衝突和幫助他人。'),
  transfer('義工隊長起初不擅長協調，但在幾次活動中學會分工、聆聽與修正錯誤。','哪個解釋最符合「肌肉」比喻？',[
    '反覆實作與修正能增強協調能力，不必假設全靠天生',
    '只要最初不擅長協調，之後練習便絕不可能帶來改變',
    '活動次數多便保證能力提高，不用聆聽或檢討任何錯誤',
    '只有身體肌肉變強，才可能帶領義工並處理活動問題',
  ],[
    '能力在訓練、考驗與修正中增強，正是原文比喻的作用。',
    '原文直接反對能力只由出生時決定。',
    '單純重複而不學習，缺少原文的修正步驟。',
    '肌肉是比喻，不是隊長的身體要求。',
  ],[5,6,8],'範文說領導力像肌肉，經訓練、考驗和修正會更強；義工隊長的進步也由具體經驗而來。'),
  transfer('一名體育教練對每個球員都用同一種嚴厲說法，即使有人需要鼓勵、有人需要空間。','哪項最能運用範文對判斷時機的要求？',[
    '按球員需要選擇鼓勵、提出挑戰或退一步，而非一律施壓',
    '繼續對所有人採取相同嚴厲方式，因為感受不影響表現',
    '只在每場比賽後讚賞所有人，不必觀察個別困難',
    '完全不再與球員溝通，假設退一步等於放棄帶隊',
  ],[
    '三種行動須按情況選擇，才是原文所說的管理判斷。',
    '同一做法無視題目提供的不同需要。',
    '只讚賞也未必處理需要挑戰或支援的情況。',
    '退一步是適時讓別人行動，並非完全不管理。',
  ],[9,11],'範文把良好管理寫成知道何時鼓勵、何時挑戰及何時退一步；教練也需要這種判斷。'),
  transfer('非牟利機構的主管完成報表很快，卻察覺不到團隊長期緊張，令義工陸續離開。','哪項最能承接範文對情緒智商的論證？',[
    '報表效率不能抵銷人際傷害，還須看他能否理解團隊',
    '只要報表完成得快，團隊緊張與義工離開便不可能有意義',
    '主管應只增加工作速度，不必聆聽義工表達的困難',
    '把義工離開全歸咎個人，不檢查管理方式是否製造緊張',
  ],[
    '原文指出技術或紙面效率強，也可能因缺人際感知而傷害團隊。',
    '人員流失正是需要檢查的實際後果。',
    '加速工作沒有處理團隊情緒問題。',
    '忽略管理因素會延續不必要的緊張。',
  ],[10,14],'範文說不懂團隊情緒的經理可製造緊張，即使技術很好；紙面效率仍可能在現實中有害。'),
  transfer('醫療中心的行政主管可接觸預算、員工表現紀錄與病人資料。','哪項最能轉用範文對誠信和問責的推理？',[
    '要求公平決策並保護資料，避免主管只顧私利',
    '只看主管處理文件的速度，不必查他如何運用權力',
    '允許主管偏袒親友，因為預算與敏感資料不涉及信任',
    '把保護資料交給運氣，不要求主管為決定負責',
  ],[
    '掌握資源與私密資訊的人需要公平、可靠和可問責。',
    '文件速度不能證明行使權力時的誠信。',
    '偏袒和資料處理直接涉及信任。',
    '問責要求可追究的行動，而非交給運氣。',
  ],[12,13],'範文由預算、員工評估與敏感資料推到經理須公平行事，而非保護自己利益。'),
  transfer('博物館要選展覽組長。資深導賞員逐漸學會處理投訴與支援新人，另一人則只是性格強勢。','哪種比較最符合範文的個案邏輯？',[
    '比較處理人與項目的實際能力，不只看誰較有氣勢',
    '只選性格最強勢者，假設他自然懂得回應所有投訴',
    '只按導賞員入職日期排序，不查誰學會支援同事',
    '因兩人性格不同便拒絕比較他們在工作中的具體表現',
  ],[
    '原文以逐步學會實務能力者對照只靠天生強勢者。',
    '氣勢不能替代已觀察到的服務和支援能力。',
    '年資本身不是原文例子的重點，學會做甚麼才是。',
    '性格差異不妨礙比較可觀察的工作行動。',
  ],[5,6,7],'範文的初級員工例子強調處理客戶、支援同事與組織項目可學會，可能勝過只靠強勢性格。'),
  transfer('科技團隊準備晉升主管，候選人技術最強，卻常忽略同事壓力並公開責怪他人。','哪項最完整呼應範文的選人標準？',[
    '保留技術評估，也檢查情緒理解、判斷與對團隊的責任',
    '只看技術測驗名次，假設公開責怪不會影響任何同事',
    '只選最受歡迎的人，完全不必了解其技術與決策能力',
    '因技術強便免除對管理行為的檢查，讓壓力自行消失',
  ],[
    '經理需要知識，也需理解人並承擔對團隊的責任。',
    '原文指出技術強仍可製造緊張。',
    '受歡迎也不能取代能力與判斷。',
    '忽略管理行為無法解決已知的壓力。',
  ],[0,9,10,16],'範文說管理面試不能只看專業知識，尤其要看情緒智商、判斷和可靠性。'),
  transfer('社區中心聘請活動經理，要求應徵者提出如何處理預算爭議和同事意見分歧。','哪套評估最符合範文的雙重要求？',[
    '同看解決衝突的經驗，以及使用預算時能否公平負責',
    '只看應徵者能否快速計算預算，毋須聽同事意見',
    '只看應徵者演講有多精彩，不查實際處理分歧能力',
    '只看此人是否天生外向，完全不問利益衝突如何處理',
  ],[
    '經驗可培養領導行動，預算權力則要求誠信與問責。',
    '計算能力只是局部，題目還涉及人際和公平。',
    '演講表現不能證明處理分歧的能力。',
    '外向不等於公平或能解決衝突。',
  ],[5,6,12,13],'範文一段說領導行動可學會，另一段說掌握預算者須可信任；兩方面都可在情境問題中評估。'),
  transfer('圖書館主管每月準時完成所有表格，但常以不公平方式安排員工輪班。','哪項最能運用範文對紙面效率的結論？',[
    '表格效率不能抵銷實際傷害，須查輪班是否公平',
    '只要每份表格準時，輪班是否公平便不會影響管理評價',
    '把不公平輪班歸咎員工，完全不檢查主管的決策',
    '只增加表格數量，假設紙面記錄會自然改善員工待遇',
  ],[
    '原文警告缺少關鍵品質可令紙面有效率的人在實際工作有害。',
    '輪班安排會直接影響員工，不可被表格速度遮蔽。',
    '決策由主管作出，不能只責怪員工。',
    '更多表格不會自動改變不公平做法。',
  ],[12,13,14],'範文用「紙面有效率、實際有害」收束誠信與問責；輪班公平正是實際影響。'),
  transfer('一家公司改設經理面試，想避免只選技術最強或表面最有魅力的人。','哪種面試內容最能體現整篇範文？',[
    '查技術知識，也用情境檢查聆聽、判斷、公平與改進能力',
    '只加一段自由演講，仍不問團隊衝突或預算決策',
    '只看履歷上的證書，假設性格與責任無法被觀察',
    '只問應徵者是否天生領袖，不查任何後天學習經驗',
  ],[
    '技術與性格並重，且用可觀察情境檢查領導是否能實踐。',
    '演講仍可能只呈現外在魅力。',
    '證書不能直接證明人際判斷與操守。',
    '天生標籤忽略原文強調的經驗與改進。',
  ],[0,1,5,10,13,15,16],'範文否定領導力只靠天生，結尾主張公司同時評估性格和知識，尤其看同理、判斷、誠信與責任。'),
];
export default {key:'direct-question:8',meta:{topic:'領導力與經理招聘',summary:'領導力可由經驗培養；經理還需情緒理解、判斷力、誠信與問責。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
