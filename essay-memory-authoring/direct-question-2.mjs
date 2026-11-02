// Human-authored content for Direct Question 2. Keep source English in its canonical bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-2-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:2'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'A company often does well because its staff work steadily each day, not simply because it has big plans.',
  'To help staff do more good work, companies should make tasks easier and build a workplace where people want to try hard.',
  'First, make tasks clear, give workers enough help, and cut wasted time.',
  'Many workers get less done for reasons other than laziness. They lose time when instructions are unclear, systems are slow, or what matters most changes too often.',
  'Companies should set clear goals, break big projects into smaller tasks, and tell workers exactly what they need to do.',
  'Give workers short, regular comments on their work so they can fix mistakes before small problems cost a lot.',
  'Companies should spend time and money on training because it matters, not treat it as an extra they do only sometimes.',
  'When workers learn to use new programs, talk to customers, and manage their tasks, they can work more confidently and make fewer mistakes.',
  'A team that has learned its job well is not an unnecessary extra; it helps the company get more work done.',
  'Another good way to help staff do more is to keep them keen to work and healthy.',
  'Even talented workers will slowly do worse if they are always tired, paid too little, or ignored.',
  'Companies can stop this by paying fairly, praising good work, and giving people a fair amount of work.',
  'Flexible work can help too, especially if it means workers do not need to travel to work so often and can work when they focus best.',
  'Managers should also make workers feel trusted instead of watched all the time.',
  'People often work harder when they feel respected, because they see their work as more than a task they have to do: it is a way to help.',
  'To sum up, companies can help staff do more by making work run better, teaching useful skills, and keeping the workplace healthy and encouraging.',
  'Staff get the most work done when they can work well and feel good about their jobs.',
];

const vocabulary=[
  [['depends less on','not simply because','較少取決於'],['ambitious strategy','big plans','雄心勃勃的策略'],['consistently','steadily','持續穩定地'],['employees','staff','員工'],['daily work','each day','日常工作']],
  [['increase staff productivity','help staff do more good work','提高員工生產力'],['firms','companies','企業'],['making work easier','make tasks easier','讓工作更容易'],['creating conditions','build a workplace','創造條件'],['do their best','try hard','盡力而為']],
  [['The first step','First','第一步'],['clearer','clear','更清晰'],['better supported','enough help','得到更多支援'],['less wasteful','cut wasted time','減少浪費']],
  [['employees','workers','員工'],['unproductive','get less done','缺乏生產力'],['because they are lazy','other than laziness','把懶惰當作原因'],['vague','unclear','含糊'],['priorities change too often','what matters most changes too often','優先事項頻繁變動']],
  [['set clear targets','set clear goals','設定清晰目標'],['divide large projects','break big projects','分拆大型項目'],['manageable tasks','smaller tasks','可管理的任務'],['what is expected of them','what they need to do','被期望完成的工作']],
  [['concise feedback','short, regular comments on their work','簡潔回饋'],['staff','workers','員工'],['correct mistakes','fix mistakes','修正錯誤'],['expensive ones','cost a lot','代價昂貴的問題']],
  [['treated as','spend time and money on','視為／投入'],['core investment','because it matters','核心投資'],['an occasional extra','an extra they do only sometimes','偶爾提供的額外安排']],
  [['employees','workers','員工'],['taught how to use new software','learn to use new programs','學習使用新軟件'],['communicate with clients','talk to customers','與客戶溝通'],['manage their workload','manage their tasks','管理工作量'],['greater confidence','more confidently','更有信心'],['fewer errors','fewer mistakes','更少錯誤']],
  [['well-trained team','team that has learned its job well','訓練有素的團隊'],['rarely a luxury','not an unnecessary extra','很少只是奢侈品'],['the engine of','helps the company get more work done','主要推動力']],
  [['effective way','good way','有效方法'],['improve productivity','help staff do more','提高生產力'],['motivation','keen to work','工作動力'],['well-being','healthy','身心健康']],
  [['constantly exhausted','always tired','長期疲憊'],['underpaid','paid too little','薪酬不足'],['performance will eventually decline','will slowly do worse','表現最終下降']],
  [['prevent this','stop this','防止這種情況'],['offering fair salaries','paying fairly','提供公平薪酬'],['recognising good work','praising good work','認可優秀工作'],['realistic workloads','a fair amount of work','合理工作量']],
  [['Flexible working arrangements','Flexible work','彈性工作安排'],['reduce unnecessary commuting','do not need to travel to work so often','減少不必要的通勤'],['concentrate','focus','集中精神'],['most productive hours','when they focus best','最有效率的時段']],
  [['create a culture','make workers feel','建立文化'],['employees','workers','員工'],['trusted rather than watched','trusted instead of watched','被信任而非被監視']],
  [['usually work harder','often work harder','通常更努力工作'],['not merely as a duty','more than a task they have to do','不只是職責'],['as a contribution','a way to help','也是一種貢獻']],
  [['In conclusion','To sum up','總結來說'],['raise staff productivity','help staff do more','提升員工生產力'],['improving work systems','making work run better','改善工作制度'],['providing useful training','teaching useful skills','提供有用培訓'],['maintaining a healthy, motivating workplace','keeping the workplace healthy and encouraging','維持健康、激勵性的工作環境']],
  [['Productivity grows best','Staff get the most work done','生產力最能提升'],['efficiency','work well','效率'],['morale','feel good about their jobs','士氣']],
];

const chunkOverrides=[
  ['The success of a company','often depends less on ambitious strategy','than on how consistently its employees perform in daily work.'],
  ['To increase staff productivity,','firms should focus on two practical areas:','making work easier to do well','and creating conditions in which people want to do their best.'],
  ['The first step is to make work clearer,','better supported, and less wasteful.'],
  ['Many employees are not unproductive because they are lazy;','rather, they lose time because instructions are vague,','systems are slow,','or priorities change too often.'],
  ['Companies should therefore set clear targets,','divide large projects into manageable tasks,','and ensure that workers know exactly what is expected of them.'],
  ['Regular but concise feedback is also important,','as it allows staff to correct mistakes','before small problems become expensive ones.'],
  ['Training should also be treated as a core investment','rather than an occasional extra.'],
  ['When employees are taught how to use new software,','communicate with clients,','or manage their workload,','they can work with greater confidence and fewer errors.'],
  ['A well-trained team is rarely a luxury;','it is the engine of a productive company.'],
  ['Another effective way to improve productivity','is to protect employees’ motivation and well-being.'],
  ['If staff are constantly exhausted, underpaid, or ignored,','their performance will eventually decline,','even if they are talented.'],
  ['Companies can prevent this','by offering fair salaries, recognising good work,','and giving employees realistic workloads.'],
  ['Flexible working arrangements can also help,','especially when they reduce unnecessary commuting','and allow workers to concentrate','during their most productive hours.'],
  ['Managers should also create a culture','in which employees feel trusted rather than watched.'],
  ['People usually work harder when they feel respected,','because they see their job','not merely as a duty,','but as a contribution.'],
  ['In conclusion, companies can raise staff productivity','by improving work systems,','providing useful training,','and maintaining a healthy, motivating workplace.'],
  ['Productivity grows best','when efficiency and morale move together.'],
];
const simpleChunkOverrides=[
  ['A company often does well','because its staff work steadily each day,','not simply because it has big plans.'],
  ['To help staff do more good work,','companies should make tasks easier','and build a workplace','where people want to try hard.'],
  ['First, make tasks clear,','give workers enough help,','and cut wasted time.'],
  ['Many workers get less done for reasons other than laziness.','They lose time when instructions are unclear,','systems are slow,','or what matters most changes too often.'],
  ['Companies should set clear goals,','break big projects into smaller tasks,','and tell workers exactly what they need to do.'],
  ['Give workers short, regular comments on their work','so they can fix mistakes','before small problems cost a lot.'],
  ['Companies should spend time and money on training','because it matters,','not treat it as an extra','they do only sometimes.'],
  ['When workers learn to use new programs,','talk to customers,','and manage their tasks,','they can work more confidently and make fewer mistakes.'],
  ['A team that has learned its job well','is not an unnecessary extra;','it helps the company get more work done.'],
  ['Another good way to help staff do more','is to keep them keen to work and healthy.'],
  ['Even talented workers will slowly do worse','if they are always tired, paid too little, or ignored.'],
  ['Companies can stop this','by paying fairly,','praising good work,','and giving people a fair amount of work.'],
  ['Flexible work can help too,','especially if it means','workers do not need to travel to work so often','and can work when they focus best.'],
  ['Managers should also make workers feel trusted','instead of watched all the time.'],
  ['People often work harder when they feel respected,','because they see their work','as more than a task they have to do:','it is a way to help.'],
  ['To sum up, companies can help staff do more','by making work run better,','teaching useful skills,','and keeping the workplace healthy and encouraging.'],
  ['Staff get the most work done','when they can work well','and feel good about their jobs.'],
];

// Every fixed span is taken from the source verbatim. Sentence-specific comma cuts are explicit.
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
  card('A shop’s success often depends less on bright signs than on reliable service.','用 depends less on ... than on 比較兩個因素的重要性',[8,10,16],fixed(0,'[成果] often depends less on [因素甲] than on [因素乙]','把兩個影響同一成果的因素相比，指出後者更關鍵。','要比較兩個因素的相對重要性，避免只說其中一方有用時。',['often depends less on','than on'],['成果','較不關鍵因素','較關鍵因素'])),
  card('To reduce waiting time, the clinic should add a second desk.','用 To 起句，先交代目的再提出行動',[9,11,15],fixed(1,'To [目標], [為此採取的做法]','開首指出想達到的目標，後半句提出相應做法。','要讓讀者先知道一項建議的目的，再說明做法時。',['To',','],['目標','為此採取的做法'])),
  card('The first step is to explain the rules clearly.','用 The first step is to 引出第一項具體做法',[1,4,6],fixed(2,'The first step is to [具體做法]','標示第一步，後面直接交代可執行的行動。','需要把一個大目標轉成第一項具體行動時。',['The first step is to'],['具體做法'])),
  card('Students did not fail because they were careless; rather, they lacked clear instructions.','用 rather 排除簡單歸因後提出更準確的解釋',[5,10,14],fixed(3,'[被否定的歸因]; rather, [較準確的解釋]','前半句否定一種原因，rather 後指出另一個更貼切的解釋。','要糾正對一件事的簡單歸因，再提出有證據支持的原因時。',['; rather,'],['被否定的歸因','較準確的解釋'])),
  card('Schools should therefore give pupils clearer feedback.','用 should therefore 根據前述問題提出建議',[2,11,13],fixed(4,'[行動方] should therefore [建議措施]','should 提出建議，therefore 表示建議是前文分析得出的。','已說明問題或原因，接着提出相應的行動建議時。',['should therefore'],['行動方','建議措施'])),
  card('Short meetings help, as they let staff resolve problems early.','用 as 解釋前半句判斷成立的原因',[3,7,12],fixed(5,'[判斷], as [理由]','as 後的內容解釋前半句為甚麼成立。','先提出某做法有用，再立即說明它如何發揮作用時。',[', as '],['判斷','理由'])),
  card('Training should be a regular duty rather than a rare extra.','用 rather than 對照應採用與不應採用的定位',[2,10,14],fixed(6,'[應採用的定位] rather than [被排除的定位]','前後提出兩種定位，句子主張採用前者而非後者。','要明確選擇一種做法或看法，並排除另一種時。',['rather than'],['應採用的定位','被排除的定位'])),
  card('When new staff learn the computer system, they make fewer mistakes.','用 When 設定情況，再指出該情況下的結果',[1,3,14],(()=>{const t=original[7],cut=t.lastIndexOf(', they can');return {formula:'When [受訓情況], [工作上的結果]',meaning:'When 交代受訓情況，主句說明在這種情況下員工能如何工作。',usage:'要先交代某種情況，再說明在該情況下的行動或結果時。',parts:[part('When','link','情況連接詞'),part(t.slice(4,cut),'slot','受訓情況'),part(',','link','主句分界'),part(t.slice(cut+1),'slot','工作上的結果')]};})()),
  card('A reliable water supply is rarely a luxury; it is the engine of public health.','用分號先否定「奢侈品」看法，再指出核心作用',[0,3,15],fixed(8,'[資源] is rarely a luxury; it is the engine of [成果]','先否定一項投入只是可有可無，再用比喻指出它的核心作用。','要回應「某項投入只是額外花費」的看法，並說明其真正作用時。',['is rarely a luxury; it is the engine of'],['重要資源','被推動的成果'])),
  card('Another effective way to save energy is to turn off unused lights.','用 Another effective way to ... is to 引出另一種方法',[1,2,4],fixed(9,'Another effective way to [目標] is to [做法]','明確把第二項行動與同一目標連起來。','已提出一個方法，想再提出另一個達成同一目標的方法時。',['Another effective way to',' is to '],['目標','做法'])),
  card('If the clinic closes early, patients will wait longer, even if they arrive on time.','用 If 設條件，並用 even if 補充仍無法避免結果的讓步',[7,12,16],(()=>{const t=original[10],a=t.indexOf(', their performance'),b=t.indexOf(', even if');return {formula:'If [條件], [結果], even if [未能避免結果的情況]',meaning:'If 先設條件，主句提出其結果；even if 再承認一項條件，表示它仍不能避免前述結果。',usage:'要說明某條件可能帶來的結果，並補充一項看似有利但仍不足以阻止結果的情況時。',parts:[part('If','link','條件連接詞'),part(t.slice(2,a),'slot','條件'),part(',','link','主句分界'),part(t.slice(a+1,b),'slot','結果'),part(', even if','link','讓步連接詞'),part(t.slice(b+9),'slot','未能避免結果的情況')]};})()),
  card('A clinic can prevent long waits by adding another nurse.','用 can prevent ... by 交代處理問題的方法',[4,5,10],fixed(11,'[行動方] can prevent [問題] by [方法]','先指出能防止甚麼問題，再用 by 交代具體做法。','要說明一方可以如何避免一個已指出的問題時。',['can prevent',' by '],['行動方','要防止的問題','具體方法'])),
  card('Flexible lessons can also help, especially when learners have changing shifts.','用 especially when 補充做法特別有效的情況',[5,7,11],fixed(12,'[做法] can also help, especially when [特別有效的情況]','主句說某做法有幫助，especially when 再限定它特別有效的情況。','要先指出一項做法有用，再說清楚它在哪種情況下最有用時。',['can also help, especially when'],['有幫助的做法','特別有效的情況'])),
  card('Teachers should create a class in which students feel safe rather than afraid.','用 in which 描述環境，並用 rather than 對照兩種感受',[6,10,14],fixed(13,'[負責人] should also create [環境] in which [理想感受] rather than [負面感受]','in which 說明某環境讓人有甚麼感受；rather than 排除另一種感受。','要提出建立某種環境的建議，並對比人們在其中應有與不應有的感受時。',['should also create','in which','rather than'],['負責人','要建立的環境','理想感受','負面感受'])),
  card('People see volunteering not merely as unpaid work, but as a way to help neighbours.','用 not merely as ... but as 加深對同一事物的理解',[3,6,13],fixed(14,'[背景] not merely as [較窄理解], but as [另一層意義]','先承認一種較窄的理解，再指出同一事物還有另一層意義。','要避免把某事只看成一種作用，並補充它更深或不同的作用時。',['not merely as',', but as'],['背景','較窄理解','另一層意義'])),
  card('In conclusion, schools can improve reading by giving children more time and support.','用 In conclusion 總結前文提出的方案',[1,9,16],fixed(15,'In conclusion, [主要方案的總結]','以 In conclusion 標示結尾，後面收束前文提出的主要方案。','文章末段要回應題目，概括已論證的做法時。',['In conclusion,'],['主要方案的總結'])),
  card('A team grows best when planning and trust improve together.','用 grows best when 指出成果最容易出現的條件',[0,1,8],fixed(16,'[成果] grows best when [條件同時成立]','後半句指出前述成果最容易出現時需要哪些條件。','要在結尾簡潔指出兩個條件如何共同支持一個成果時。',['grows best when'],['成果','條件同時成立'])),
];
const wrongReasons=[
  ['分號後強調某資源的核心作用，沒有比較兩個成功因素。','If 設條件並補充 even if 讓步，沒有把因素甲與因素乙排序。','when 指出成果最好的條件，沒有說一個因素比另一個更重要。'],
  ['Another effective way 引出已有方法以外的第二種方法，沒有先交代這項建議的目的。','by 指出預防問題所用的方法，句子沒有用 To 起句交代目標。','In conclusion 收束前文方案，沒有呈現「為了某目標而做某事」的開場。'],
  ['To 先交代目的，但沒有把做法標成第一步。','should therefore 根據前文提出建議，沒有說這是第一步。','rather than 排除另一種定位，沒有提出可立即執行的第一項行動。'],
  ['as 解釋一個判斷的理由，並未先否定錯誤歸因再改正。','If 和 even if 分別處理條件與讓步，沒有用 rather 修正原因。','not merely...but as 擴展理解，沒有把一個錯誤原因換成更準確的原因。'],
  ['The first step 提出行動次序，但沒有用 therefore 表明建議來自前述分析。','can prevent...by 解釋防止問題的方法，沒有用 should therefore 提出建議。','should create 是建議，但沒有 therefore 連回前文已說明的原因。'],
  ['rather 更正先前的歸因，沒有用 as 解釋前半句為何有用。','When 設定發生情況，沒有用 as 交代主句判斷的理由。','especially when 指出特別有效的情況，不直接回答前半句為何成立。'],
  ['The first step 引出行動，沒有在兩種定位之間作選擇。','If 設條件並用 even if 讓步，沒有排除另一個可選定位。','not merely...but as 增加另一層意義，並非用 rather than 捨棄後者。'],
  ['To 表示目的，沒有設一種情況並說明當時的結果。','rather 修正原因，沒有 When 所引出的情況與後果。','not merely...but as 擴展理解，沒有交代某情況發生時的結果。'],
  ['less on...than on 重新比較因素的重要性，沒有否定「奢侈品」後指出核心作用。','rather 修正錯誤歸因，沒有以分號先否定一個定位再用比喻重估。','In conclusion 總結方案，沒有呈現一項資源由「額外」到「核心」的轉變。'],
  ['To 先指出一項做法的目的，沒有表明這是第二種方法。','The first step 標明第一步，與本題要求的另一種方法不同。','should therefore 是根據前文的建議，沒有用 Another effective way 連接第二方案。'],
  ['When 指出某情況下的結果，沒有額外的 even if 讓步條件。','especially when 限定特別有效的場合，沒有 If 條件加 even if 讓步的雙層結構。','grows best when 指出理想條件，沒有交代即使另有有利情況也無法避免結果。'],
  ['should therefore 提出建議，但沒有用 by 說明防止問題的實際方法。','as 解釋某做法有用的理由，沒有明確指出要防止的問題與所用方法。','If 設條件與結果，沒有 can prevent...by 的預防動作。'],
  ['as 直接解釋前半句的原因，沒有縮小到特別有用的場合。','When 先設定一種情況，沒有在主句後補充「尤其在」的限定。','can prevent...by 說明所用方法，沒有指出哪種情況使做法特別有效。'],
  ['rather than 有兩種定位的對照，但沒有用 in which 描述一種環境。','If 和 even if 處理條件與讓步，沒有描述人在某環境中的感受。','not merely as...but as 擴展對同一事物的理解，沒有建立環境和感受的關係。'],
  ['rather 修正一個原因，沒有把同一件事由「不只是 X」擴展到「也是 Y」。','rather than 選擇前一種定位並排除後一種，不是保留前者再增加另一層意義。','in which 描述環境並對照感受，不是對同一事物作雙層解讀。'],
  ['To 表示一項行動的目的，沒有標示文章最後的總結。','Another effective way 另加方法，沒有收束前文全部方案。','grows best when 提出條件，沒有用 In conclusion 明確回應題目並歸納。'],
  ['less on...than on 比較兩個因素的相對分量，沒有說明成果在何時最好。','To 說明目的和建議行動，沒有把兩個條件連成成果最好的情況。','奢侈品與引擎的比喻重新評價資源，沒有用 when 說明最佳條件。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這篇範文如何回應題目？',[
    '提出公司可採取的措施，分別處理工作流程與員工動力',
    '討論員工是否應有完全自由，最後選擇一方',
    '只分析員工生產力下降的原因，不提出做法',
    '比較兩種公司的歷史業績，但不回應改善方法',
  ],'題目問公司可以做甚麼；文章用兩段主體提出不同但互補的做法。'),
  {type:'multi',prompt:'選出兩段主體各自的改善主線',detail:'選兩項，再按「確認」。',options:[
    '釐清工作、提供回饋和培訓，減少浪費與錯誤',
    '保障待遇、健康與信任，維持員工的工作動力',
    '只增加監察與加班，藉壓力提高短期產量',
    '把公司成功完全歸因於雄心勃勃的高層策略',
  ],correct:[0,1],why:'第一段處理「做得好」的條件；第二段處理「願意盡力做」的條件。'},
];
const route=[sequence('依照範文次序，排好四段的任務',[
  ['開場與總路線','指出穩定的日常表現很重要；提出工作流程與員工動力兩大方向。'],
  ['第一主體段','清晰目標、細分任務、及時回饋與培訓，讓工作做得更好。'],
  ['第二主體段','公平薪酬、認可、合理工作量、彈性與信任，維持動力和身心健康。'],
  ['總結','把制度效率和士氣合起來，回應如何提高員工生產力。'],
],'開場提出兩條路線 → 改善工作制度 → 保護動力與健康 → 合併效率與士氣。')];
const evidence=[
  quiz('為甚麼原文沒有把低生產力簡單歸咎於員工懶惰？',[
    '含糊指示、緩慢系統及頻繁改變的優先事項都會浪費時間',
    '所有員工都已經完成足夠培訓，所以不可能有錯誤',
    '員工只在薪酬不足時才會浪費時間，工作制度沒有影響',
    '公司策略雄心勃勃時，日常工作方式便不再重要',
  ],'第一段先排除懶惰的簡單解釋，再指出公司可以改善的工作障礙。'),
  quiz('公司把大型項目變得更容易執行的關鍵做法是甚麼？',[
    '設定清楚目標、拆成可管理任務，並說明具體期望',
    '把整個項目交給個別員工，但不說明完成標準',
    '每隔一天改變目標，讓員工持續嘗試新方向',
    '只在項目結束後檢查結果，避免提供任何指示',
  ],'清晰目標、細分工作和明確期望，直接回應上一句的含糊與浪費。'),
  quiz('定期而簡潔的回饋為甚麼能幫助公司？',[
    '讓員工及早修正小錯，避免問題日後造成更高代價',
    '讓經理每天安排長時間會議，取代所有實際工作',
    '讓員工延後處理問題，直到它們變成重大損失',
    '讓公司完全不用培訓，因為回饋可代替所有技能',
  ],'原文的機制是「及早修正」；它防止小問題擴大成昂貴問題。'),
  quiz('培訓新軟件、客戶溝通和工作量管理會帶來甚麼？',[
    '員工更有信心完成工作，犯錯亦會較少',
    '員工完全不需要清楚指示，也不會再面對任何限制',
    '公司只會增加訓練時間，工作表現必然下降',
    '員工可以完全避開客戶，因而不用改善溝通',
  ],'培訓不是偶爾提供的額外安排；它改善工作能力和準確度。'),
  quiz('即使有才華，員工在甚麼情況下仍會逐漸表現下降？',[
    '長期疲憊、薪酬不足，或一直感到被忽視',
    '得到公平薪酬、適量工作及努力獲得認可',
    '可減少不必要的通勤，並在最能專注時工作',
    '得到信任及清楚期望，並掌握所需工作技能',
  ],'第二段先指出動力與健康受損的風險，再提出預防做法。'),
  quiz('原文說彈性工作在甚麼情況下特別有幫助？',[
    '減少無必要通勤，並讓員工在自己最能專注時工作',
    '讓所有員工完全不用與客戶或同事作任何溝通',
    '使工作量無上限，只要員工可以自行選擇上班時間',
    '取消清楚目標和回饋，將所有決定交給員工自行猜測',
  ],'彈性不是無條件有效；原文指出減少通勤和改善專注的兩個具體機制。'),
];
const logic=[
  sequence('第一主體段：由工作障礙推到可執行的改善措施',[
    ['修正誤診','表現不佳未必是懶惰；含糊指示、慢系統和頻繁改動會浪費時間。'],
    ['釐清工作','公司訂明目標、細分項目，並讓員工知道具體期望。'],
    ['及早糾錯','定期而簡潔的回饋使小錯在代價擴大前得到修正。'],
    ['投資技能','培訓軟件、溝通和工作管理能力，並非偶爾提供的額外安排。'],
    ['段落結果','有能力的團隊做事更有信心、少犯錯，推動公司生產力。'],
  ],'先找可控制的工作障礙，再配對目標、回饋和培訓，最後指出能力與效率上的改變。'),
  sequence('第二主體段：由動力風險推到可持續的工作環境',[
    ['指出風險','即使員工有才華，疲憊、低薪或被忽視仍會令表現下降。'],
    ['保障基本條件','公平薪酬、認可優秀表現及合理工作量，減少動力流失。'],
    ['改善工作安排','減少無必要通勤，讓員工在較能專注的時段工作。'],
    ['建立信任','管理者創造被信任而非被監視的文化。'],
    ['說明心理機制','受尊重的人把工作看成貢獻，更願意投入。'],
    ['回到總結','生產力由制度效率和員工士氣共同支撐。'],
  ],'先說明動力可能如何流失，再連接待遇、彈性與信任，最後回到效率和士氣。'),
];

const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('社區診所的義工經常重複登記病人，因為每次輪班收到的指示都不同。','哪項最能轉用範文第一段的改善邏輯？',[
    '統一登記步驟，拆清各人任務，並說明交接時須完成甚麼',
    '要求義工延長輪班，但維持每次不同的登記規則與交接方式',
    '只在月底統計登記人數，避免在工作開始前提供任務與交接指引',
    '以義工缺乏熱誠作唯一解釋，先增加監察而不檢查流程',
  ],[
    '含糊指示造成重複工作；統一步驟與分工正好消除這個障礙。',
    '延長時間沒有解決指示不一致，可能增加原有浪費。',
    '事後統計不能代替事前說清任務與交接標準。',
    '先責怪工作者，忽略了題目指出的流程問題。',
  ],[3,4],'範文先指出員工浪費時間未必因懶惰，再提出清晰目標、細分任務和明確期望；診所同樣需要先修正工作流程。'),
  transfer('一所學校買了新學習平台，但教師沒有學過如何操作，也擔心在課堂上出錯。','哪項最直接承接範文對培訓的論證？',[
    '先安排實際操作訓練，讓教師熟習平台並減少課堂錯誤',
    '再買更多設備，但把平台操作留給教師在課堂自行摸索',
    '只要求教師提高使用頻率，暫停解答他們的具體操作問題',
    '把平台完全交給一名熟練教師，其他人繼續沒有機會學習',
  ],[
    '培訓直接處理不熟悉與怕犯錯的問題，對應原文的信心和準確度。',
    '更多設備並不能讓未受訓的教師懂得使用已有平台。',
    '提高使用次數但不教操作，無法可靠地降低錯誤。',
    '只培訓一人不能改善整個教師團隊的工作能力。',
  ],[6,7],'範文把訓練當成核心投資，並具體說明學會新軟件後員工更有信心、少犯錯；學校的新平台也是同一道理。'),
  transfer('一間餐廳屢次出現小額訂單錯誤，但主管只在每年年終才告訴員工。','哪種做法最符合範文的回饋機制？',[
    '每次錯誤後簡短指出原因，讓員工及早修正重複問題',
    '保持一年一次的總評，讓小錯累積後再一起討論原因',
    '取消所有回饋，只在顧客正式投訴後才考慮修改流程',
    '每天召開很長的會議，令員工沒有時間處理當日訂單',
  ],[
    '及時而簡潔的回饋可在小錯變成大成本前完成修正。',
    '年終總評太遲，不能防止相同小錯不斷重演。',
    '等待正式投訴才行動，放棄了提早修正的機會。',
    '過長會議不符合原文「定期但簡潔」的限制。',
  ],[5],'範文指出 regular but concise feedback 讓員工在小問題變昂貴之前修正；餐廳需要的是同樣及時、簡潔的回饋。'),
  transfer('物流公司訂單經常延誤；新系統載入緩慢，管理層卻認定司機不夠勤奮。','哪項分析最忠於範文的診斷方式？',[
    '先檢查慢系統和交付流程，再決定是否需要調整司機工作',
    '直接要求司機無償加班，並假設所有延誤都來自態度問題',
    '推出勤奮口號，但不測試系統載入是否拖慢每張訂單',
    '只提高送貨目標，不改善接單系統或告知新的優先次序',
  ],[
    '題目已有系統瓶頸的證據；先查流程才符合原文避免誤怪員工的做法。',
    '加班和責怪態度沒有處理已知的系統延誤。',
    '口號沒有解決每張訂單都受影響的操作問題。',
    '提高目標卻不清除障礙，可能進一步增加混亂。',
  ],[3,4],'範文說低生產力未必是懶惰，慢系統與改動太頻密的優先事項也會浪費時間；物流公司應先核對已知瓶頸。'),
  transfer('社區閱讀計劃覺得培訓義工太花時間，結果每位義工教閱讀的方法都不同。','哪項最能應用範文對培訓的定位？',[
    '把簡短教學訓練列入固定安排，讓所有義工掌握一致做法',
    '停止所有培訓，讓義工每次自行決定教學目標與步驟',
    '只增加招募宣傳，卻不處理現有義工教學方法不一致',
    '每星期更改教學方法，但不花時間示範或解釋新做法',
  ],[
    '一致訓練可減少錯誤和混亂，符合把培訓視作核心投入的論證。',
    '完全取消訓練會保留題目中的方法不一致。',
    '招募更多人不能讓現有義工掌握共同做法。',
    '頻繁改動而不示範，反而增加學習負擔。',
  ],[6,7,8],'範文把培訓視為核心投資，而非偶爾額外安排，因為受訓團隊是生產力的推動力；閱讀義工同樣需要共同技能。'),
  transfer('醫院護理團隊的表現下降；多名員工長期加班，薪酬偏低，做好工作也少獲認可。','哪組措施最完整對應範文第二段的方案？',[
    '調整工作量與薪酬，並明確認可員工做得好的部分',
    '只增加監察次數，卻仍維持相同的加班時數與偏低薪酬',
    '只提供一堂新軟件課，對疲勞和缺乏認可不作處理',
    '在工作量不變下要求更快完成任務，並減少休息安排',
  ],[
    '同時處理疲勞、待遇和被忽視，才對應題目指出的三個風險。',
    '監察沒有處理疲勞、低薪或缺乏認可。',
    '技術培訓無法代替第二段的基本工作條件。',
    '加快要求並減少休息，可能使疲勞問題更嚴重。',
  ],[10,11],'範文指出疲憊、低薪和被忽視會令有才華的員工表現下降，接着提出公平薪酬、認可和合理工作量。'),
  transfer('市政圖書館員工花很長時間通勤，有些任務其實可在安靜時段於家中完成。','哪種安排最符合範文提到的彈性工作理由？',[
    '容許合適任務彈性處理，減少不必要通勤並保留清晰目標',
    '規定所有任務只可在固定時段到館完成，即使毋須到場',
    '取消所有工作目標和回饋，只用是否在家工作判斷表現',
    '只把通勤時間算進工作量，卻不改變可避免的往返安排',
  ],[
    '減少非必要通勤並改善專注，正是原文提出彈性安排的條件。',
    '對不用到場的任務仍堅持通勤，沒有利用題目已指出的機會。',
    '彈性工作不等於取消目標與回饋，原文兩段需要互相配合。',
    '記錄通勤時間不會減少原文關心的無必要往返。',
  ],[12],'範文不是無條件讚揚彈性工作，而是指出它在減少不必要通勤、讓人於高效率時段專注時特別有效。'),
  transfer('一間學校要求教師每小時報告工作細節，教師開始覺得自己不受信任。','哪項最能轉用範文對管理文化的看法？',[
    '訂明成果和必要回報節點，同時給教師完成工作的信任',
    '增加逐分鐘監控，並把教師的不安視為缺乏投入的證據',
    '完全取消教學目標與問責，只讓每人自行猜測學校要求',
    '只在公開場合讚賞教師，私下仍維持每小時監控安排',
  ],[
    '清楚期望可與信任並存，回應原文「被信任而非被監視」的重點。',
    '加強監控正好延續題目中的不信任感。',
    '信任不等於沒有目標；原文第一段仍要求清楚工作期望。',
    '口頭讚賞若不改變監控方式，不能建立被信任的文化。',
  ],[4,13,14],'範文一方面要員工知道具體期望，另一方面要求管理者建立被信任而非被監視的文化；兩者可同時做到。'),
  transfer('公益機構的資深職員能力很強，卻因成果長期被忽視而愈來愈不願投入。','哪個回應最貼近範文的心理機制？',[
    '具體肯定職員對服務的貢獻，並給予可持續的工作量',
    '只再安排技能課程，卻不回應成果被忽視和工作壓力',
    '要求職員繼續無償加班，並假設有能力的人不會失去動力',
    '把表現問題全歸因於個人態度，不檢查認可與負擔是否公平',
  ],[
    '認可讓員工看到工作不只是義務，也是貢獻；合理負擔保護投入。',
    '能力本來已強，單靠再培訓沒有處理被忽視的核心問題。',
    '才華不能抵消長期疲勞或缺乏認可，原文已明說。',
    '只責怪態度會忽略題目提供的管理原因。',
  ],[10,11,14],'範文指出有才華的人仍可能因被忽視而表現下降；認可與合理工作量讓他們感到受尊重，並把工作看作貢獻。'),
  transfer('小型網店的訂單流程複雜，客服團隊又長期疲憊，負責人只能先訂一套完整改善方向。','哪套方向最能概括範文兩條互補主線？',[
    '簡化訂單步驟並提供培訓，同時調整工作量與認可方式',
    '只換用更快系統，卻不處理員工的疲勞或對工作的感受',
    '只辦一次表揚活動，不處理流程混亂與技能不足',
    '提高每人每日接單目標，但維持原有流程和工作量',
  ],[
    '流程與技能改善效率；合理工作量和認可保護士氣，兩條主線都有。',
    '更快系統只處理第一段的效率，遺漏第二段的動力風險。',
    '一次表揚只碰到動力，未解決流程與技能問題。',
    '只加目標而不改善任何條件，可能同時損害效率與士氣。',
  ],[1,4,7,11,15,16],'範文開場提出「工作容易做好」與「人願意盡力做」兩條路線，結尾把制度效率和士氣合併；網店亦須兩方面同時處理。'),
];

export default {key:'direct-question:2',meta:{topic:'員工生產力',summary:'先改善工作流程、回饋與培訓，再保護員工的動力與身心健康。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
