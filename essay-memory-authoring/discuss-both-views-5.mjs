// Full source-specific memorisation support for Discuss Both Views 5.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-5-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:5'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Choosing new workers is one of a company’s most important choices because workers affect both what it makes and what it is like to work there.',
  'Some people say companies should choose people who have new ideas and can work without a manager checking them often, while others say people who work well with others and follow instructions are more useful.',
  'Even though people who think for themselves can help a company grow, I think firms should usually choose people who work well with a team and do what they have been told to do.',
  'There are good reasons why companies like workers with new ideas who can work on their own.',
  'When companies are competing, they cannot keep going by doing the same things every year.',
  'Workers who ask whether old ways still work, offer new answers and take care of jobs themselves can help a company act faster than competing companies.',
  'For example, a person who makes computer programs may see that a company system wastes time and make a better program without waiting for a manager to notice.',
  'In this way, people who work on their own can help a company improve, especially in kinds of work where new ideas and quick answers to problems are needed.',
  'But the better argument is that most companies need people to work together and carry out plans carefully even more.',
  'A company is seldom just separate people working alone; its teams, time limits and shared jobs are all connected.',
  'If workers cannot talk to each other, listen to advice or follow agreed ways of working, even very good ideas may cause trouble instead of helping.',
  'For example, in hospitals, building work or banking, not following instructions can cause big errors, problems with the law or danger to people.',
  'By comparison, people who work well in teams help make a steady workplace where jobs are done the same careful way and colleagues can rely on one another.',
  'So I think new ideas and working alone are useful qualities, but companies should not put them first when choosing staff.',
  'A company can teach people to think of new ideas over time, but it is much harder to work properly when staff refuse to cooperate or follow basic rules.',
  'In short, companies should first choose people they can rely on in a team, because shared care in following rules is the base that lets useful new ideas grow later.',
];
const vocabulary=[
  [['Recruitment','Choosing new workers','招聘'],['decisions','choices','決定'],['employees','workers','員工'],['output','what it makes','產出'],['culture','what it is like to work there','公司文化']],
  [['Some argue','Some people say','有人認為'],['firms should hire','companies should choose','公司應聘請'],['imaginative','have new ideas','富想像力'],['without close supervision','without a manager checking them often','毋須密切監督'],['whereas others believe','while others say','另一些人認為'],['cooperative candidates','people who work well with others','合作型求職者'],['follow directions','follow instructions','遵從指示'],['more valuable','more useful','更有價值']],
  [['Although','Even though','雖然'],['independent thinkers','people who think for themselves','獨立思考者'],['business grow','company grow','企業成長'],['prioritise','usually choose','優先考慮'],['work well in teams','work well with a team','團隊合作'],['respect instructions','do what they have been told to do','尊重指示']],
  [['clear reasons','good reasons','明顯原因'],['innovative','with new ideas','創新'],['self-reliant','work on their own','自立'],['employers','companies','僱主']],
  [['competitive markets','companies are competing','競爭市場'],['survive','keep going','生存'],['repeating the same methods','doing the same things','重複方法'],['year after year','every year','年復一年']],
  [['question old practices','ask whether old ways still work','質疑舊做法'],['suggest fresh solutions','offer new answers','提出新方案'],['take ownership of tasks','take care of jobs themselves','主動承擔任務'],['organisation','company','機構'],['rivals','competing companies','競爭對手']],
  [['software developer','person who makes computer programs','軟件開發者'],['inefficient internal system','company system wastes time','低效內部系統'],['design a better tool','make a better program','設計更好工具'],['without waiting for a manager to point out the problem','without waiting for a manager to notice','毋須等經理指出']],
  [['In this sense','In this way','從這意義'],['independent employees','people who work on their own','獨立員工'],['engines of progress','help a company improve','進步引擎'],['industries','kinds of work','行業'],['creativity','new ideas','創意'],['rapid problem-solving','quick answers to problems','快速解難'],['essential','needed','必需']],
  [['However','But','然而'],['stronger argument','better argument','更有力論點'],['depend more heavily on','need','更依賴'],['teamwork','people to work together','團隊合作'],['disciplined execution','carry out plans carefully','有紀律執行']],
  [['rarely','seldom','很少'],['collection of isolated individuals','separate people working alone','孤立個體集合'],['network','connected','網絡'],['departments','teams','部門'],['deadlines','time limits','期限'],['shared responsibilities','shared jobs','共同責任']],
  [['unable to communicate','cannot talk to each other','無法溝通'],['accept feedback','listen to advice','接受意見'],['established procedures','agreed ways of working','既定程序'],['brilliant ideas','very good ideas','出色想法'],['disruptive','cause trouble','造成破壞'],['useful','helping','有用']],
  [['For instance','For example','例如'],['healthcare','hospitals','醫療'],['construction','building work','建築'],['finance','banking','金融'],['ignoring instructions','not following instructions','忽視指示'],['serious mistakes','big errors','嚴重錯誤'],['legal problems','problems with the law','法律問題'],['safety risks','danger to people','安全風險']],
  [['Team-oriented workers','people who work well in teams','團隊型員工'],['by contrast','By comparison','相比之下'],['stable workplace','steady workplace','穩定工作場所'],['consistently','the same careful way','一致完成'],['colleagues can trust one another','colleagues can rely on one another','同事互信']],
  [['In my view','I think','在我看來'],['innovation','new ideas','創新'],['independence','working alone','獨立性'],['valuable qualities','useful qualities','有價值特質'],['main priority','put them first','首要考慮'],['recruitment','choosing staff','招聘']],
  [['train creative thinking','teach people to think of new ideas','訓練創意思考'],['over time','over time','隨時間'],['function','work properly','正常運作'],['resist cooperation','refuse to cooperate','抗拒合作'],['basic rules','basic rules','基本規則']],
  [['Overall','In short','整體而言'],['businesses','companies','企業'],['first recruit','first choose','首先招聘'],['contribute reliably to a team','rely on in a team','可靠團隊貢獻'],['shared discipline','shared care in following rules','共同紀律'],['foundation','base','基礎'],['real innovation','useful new ideas','真正創新'],['later','later','日後']],
];
const chunkOverrides=[
  ['Recruitment is one of the most important decisions','a company makes because employees shape','not only its output but also its culture.'],
  ['Some argue that firms should hire people','who are imaginative and capable of working without close supervision,','whereas others believe that cooperative candidates','who can follow directions are more valuable.'],
  ['Although independent thinkers can help a business grow,','I believe companies should mainly prioritise people','who can work well in teams and respect instructions.'],
  ['There are clear reasons why innovative','and self-reliant employees are attractive to employers.'],
  ['In competitive markets, companies cannot survive','by repeating the same methods year after year.'],
  ['Workers who question old practices, suggest fresh solutions','and take ownership of tasks','can help an organisation move faster than its rivals.'],
  ['For example, a software developer who notices','an inefficient internal system may design a better tool','without waiting for a manager to point out the problem.'],
  ['In this sense, independent employees','can act as engines of progress,','especially in industries where creativity','and rapid problem-solving are essential.'],
  ['However, the stronger argument is that','most companies depend more heavily','on teamwork and disciplined execution.'],
  ['A business is rarely a collection of isolated individuals;','it is a network of departments, deadlines','and shared responsibilities.'],
  ['If employees are unable to communicate,','accept feedback or follow established procedures,','even brilliant ideas can become disruptive','rather than useful.'],
  ['For instance, in healthcare, construction or finance,','ignoring instructions can lead to serious mistakes,','legal problems or safety risks.'],
  ['Team-oriented workers, by contrast, help create','a stable workplace where tasks are completed consistently','and colleagues can trust one another.'],
  ['In my view, therefore, while innovation','and independence are valuable qualities,','they should not be the main priority in recruitment.'],
  ['A company can train creative thinking over time,','but it is much harder to function','when employees resist cooperation or basic rules.'],
  ['Overall, businesses should first recruit people','who can contribute reliably to a team,','because shared discipline is the foundation','on which real innovation can later be built.'],
];
const simpleChunkOverrides=[
  ['Choosing new workers is one of a company’s most important choices','because workers affect both what it makes','and what it is like to work there.'],
  ['Some people say companies should choose people','who have new ideas and can work without a manager checking them often,','while others say people who work well with others','and follow instructions are more useful.'],
  ['Even though people who think for themselves','can help a company grow,','I think firms should usually choose people','who work well with a team and do what they have been told to do.'],
  ['There are good reasons why companies like','workers with new ideas who can work on their own.'],
  ['When companies are competing,','they cannot keep going','by doing the same things every year.'],
  ['Workers who ask whether old ways still work,','offer new answers and take care of jobs themselves','can help a company act faster than competing companies.'],
  ['For example, a person who makes computer programs','may see that a company system wastes time','and make a better program without waiting for a manager to notice.'],
  ['In this way, people who work on their own','can help a company improve,','especially in kinds of work where new ideas and quick answers to problems are needed.'],
  ['But the better argument is that most companies','need people to work together','and carry out plans carefully even more.'],
  ['A company is seldom just separate people working alone;','its teams, time limits and shared jobs','are all connected.'],
  ['If workers cannot talk to each other,','listen to advice or follow agreed ways of working,','even very good ideas may cause trouble instead of helping.'],
  ['For example, in hospitals, building work or banking,','not following instructions can cause big errors,','problems with the law or danger to people.'],
  ['By comparison, people who work well in teams','help make a steady workplace','where jobs are done the same careful way','and colleagues can rely on one another.'],
  ['So I think new ideas and working alone','are useful qualities,','but companies should not put them first when choosing staff.'],
  ['A company can teach people to think of new ideas over time,','but it is much harder to work properly','when staff refuse to cooperate or follow basic rules.'],
  ['In short, companies should first choose people','they can rely on in a team,','because shared care in following rules is the base','that lets useful new ideas grow later.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Choosing nurses matters because their work shapes not only patient care but also hospital culture.','以 because 加 not only ... but also 說招聘影響兩面',[1,4,9],fixed(0,'[招聘] is one of [公司最重要的決定] because [員工] shape not only [產出] but also [文化].','開篇界定招聘重要性：員工影響成果及組織文化。','題目問聘請哪種人，要先說招聘何以對公司有長期影響時。',[' is one of ', ' because ', ' shape not only ', ' but also '],['所討論的決定','決定的重要性','造成影響的人','第一項影響','第二項影響'])),
  card('Some say schools need imaginative teachers who work alone, whereas others value teachers who cooperate and follow plans.','以 Some ... whereas others ... 公平並列兩派標準',[0,2,8],fixed(1,'Some argue that [公司應聘有創意且能獨立工作的人], whereas others believe that [合作且遵從指示的求職者更有價值].','準確交代兩派：自主創新與團隊服從。','引言需要先呈現題目的兩種招聘立場，避免偷換任何一方時。',['Some argue that ', ', whereas others believe that '],['第一派的招聘標準','第二派的招聘標準'])),
  card('Although creative cooks can improve a restaurant, I believe managers should mainly choose people who cooperate with the kitchen team.','以 Although 讓步後明確表態團隊優先',[1,3,13],fixed(2,'Although [獨立思考者可助企業成長], I believe [公司] should mainly prioritise [團隊合作並遵從指示的人].','承認創新價值，但清楚選擇合作型員工為主。','討論雙方觀點的引言須同時表明自己較支持哪一方時。',['Although ', ', I believe ', ' should mainly prioritise '],['先承認的另一方優點','作選擇的公司','自己主張優先聘請的人'])),
  card('There are clear reasons why inventive teachers who can work alone appeal to schools.','以 There are clear reasons why 開始獨立創新一方',[2,4,8],fixed(3,'There are clear reasons why [創新且自立的員工] are attractive to [僱主].','第一主體段先公平解釋自己未選的一方。','引言已表態團隊優先，但仍須真正解釋創新型員工的吸引力時。',['There are clear reasons why ', ' are attractive to '],['需要先解釋的員工特質','認為這些特質有用的人'])),
  card('In a busy restaurant market, owners cannot keep customers by serving the same menu every year.','以 cannot survive by 重複舊法的不足建立創新需求',[3,5,6],fixed(4,'In [競爭市場], [公司] cannot survive by [年年重複同一方法].','競爭使公司需要新做法，而非只沿用舊流程。','已提出創新員工可取，需解釋市場為何要求改變時。',['In ', ', ', ' cannot survive by '],['競爭環境','受競爭影響的公司','不足以維持競爭的舊做法'])),
  card('Staff who question old routines, propose new services and take charge of tasks can help a clinic improve faster than its rivals.','以 who 並列三行動再推快過競爭對手',[4,6,7],fixed(5,'Workers who [質疑舊做法、提出新方案並承擔任務] can help [公司] move faster than [對手].','獨立創新員工的主動行為能轉成公司競爭速度。','市場需要新方法已說明，要列出這類員工具體怎樣推動公司時。',['Workers who ', ' can help ', ' move faster than '],['員工的三種主動行動','受益的機構','被超越的競爭者'])),
  card('For example, a chef who sees a slow kitchen process may design a better system without waiting for the owner to tell her.','以 For example ... without waiting 給出自主改善例子',[5,7,10],fixed(6,'For example, [軟件開發者] who notices [低效內部系統] may design [更好工具] without waiting for [經理指出問題].','開發者主動發現瓶頸並設計工具，不必等上司下令。','已說主動員工可讓公司更快，需要一個真實工作流程例子時。',['For example, ', ' who notices ', ' may design ', ' without waiting for '],['能自行改善的員工','被發現的工作問題','提出的改善','不再等待的指示'])),
  card('In this sense, self-directed teachers can drive school improvement, especially where quick problem-solving matters.','以 engines of progress 概括自主員工的行業價值',[5,6,8],fixed(7,'In this sense, [獨立員工] can act as [進步引擎], especially in industries where [創意與快速解難] are essential.','把前例提升為一般理由，並限定創意與解難重要的行業。','獨立改善例子已說完，要概括此類員工在甚麼行業最有作用時。',['In this sense, ', ' can act as ', ', especially in industries where ', ' are essential.'],['能自主工作的員工','在機構中的推動角色','特別需要的兩項能力'])),
  card('However, the stronger argument is that hospitals need teamwork and careful execution more than lone ideas.','以 However, the stronger argument is that 轉向作者較支持的一派',[2,7,9],fixed(8,'However, the stronger argument is that [大多數公司] depend more heavily on [團隊合作與有紀律的執行].','承認創新後轉入較有力的團隊主張。','已公平論證獨立創新一派，現在要清楚說為何另一派更重要時。',['However, the stronger argument is that ', ' depend more heavily on '],['需要協作的公司','公司更依賴的能力'])),
  card('A hospital is rarely a group of doctors working alone; it is a system of teams, schedules and shared duties.','以分號對照孤立個人與協作網絡',[8,10,12],fixed(9,'A business is rarely [孤立個體集合]; it is [部門、期限與共同責任的網絡].','解釋團隊為何是企業的日常結構，而非個人能力的加總。','已主張公司依賴團隊，需說清其工作結構為甚麼要求協調時。',['A business is rarely ', '; it is '],['不符合現實的個人式想像','實際的協作網絡'])),
  card('If builders cannot share updates or follow safety rules, even good designs can create danger instead of helping.','以 If ... even ... rather than ... 說不合作使好想法失效',[9,11,14],fixed(10,'If [員工不能溝通、接受意見或遵從程序], even [出色想法] can become [破壞性] rather than [有用].','再好的創意也需要溝通和程序，否則可能妨礙運作。','企業協作網絡已說明，要解釋不合作如何把好想法變成風險時。',['If ', ', even ', ' can become ', ' rather than '],['缺少的合作行為','原本有價值的想法','可能變成的負面效果','本來期待的正面效果'])),
  card('For instance, in a hospital or building site, ignoring checks can cause errors, legal trouble or safety risks.','以 For instance 列高風險行業和三類後果',[10,12,13],fixed(11,'For instance, in [醫療建築金融], [忽略指示] can lead to [錯誤、法律問題或安全風險].','高風險場景證明程序不是單純限制創意。','已說不守程序會令好想法出問題，需用可觀察行業後果作證時。',['For instance, in ', ', ', ' can lead to '],['必須守程序的行業','引發風險的行為','可能產生的後果'])),
  card('Team-minded staff, by contrast, make a reliable clinic where duties are done consistently and nurses trust one another.','以 by contrast 轉到合作員工帶來的穩定與信任',[9,11,14],fixed(12,'[團隊型員工], by contrast, help create [穩定工作場所] where [任務一致完成] and [同事互信].','在高風險反例後，指出團隊員工的正面組織效果。','已展示忽視指示的代價，現在要說明合作型員工帶來甚麼好處時。',[', by contrast, help create ', ' where ', ' and '],['能合作的員工','被建立的工作環境','任務完成方式','同事之間的關係'])),
  card('In my view, therefore, while independence matters, it should not be the main hiring priority.','以 while ... should not be the main priority 再次權衡兩方',[2,8,15],fixed(13,'In my view, therefore, while [創新與獨立性] are valuable qualities, they should not be [招聘首要考慮].','明確權衡：兩種特質有價值，但並非優先條件。','雙方已各有論據，需說出價值與優先次序是兩個不同判斷時。',['In my view, therefore, while ', ' are valuable qualities, they should not be '],['先承認有價值的特質','作者否定的優先位置'])),
  card('A school can teach creative planning later, but it struggles when teachers refuse to cooperate or follow basic rules.','以 can train ... but harder ... 比較可培養與難補救的特質',[5,13,15],fixed(14,'[公司] can train [創意思考] over time, but it is much harder to function when [員工抗拒合作與基本規則].','創意可逐步培養，缺乏合作卻直接妨礙運作。','已選團隊優先，需解釋為甚麼創意可後補而合作難缺時。',[' can train ', ' over time, but it is much harder to function when '],['作招聘選擇的公司','可後期培養的能力','一旦缺乏便難運作的條件'])),
  card('Overall, clinics should first hire dependable team members because shared procedures support later improvements.','以 because 把共同紀律定位為日後創新的基礎',[8,13,14],fixed(15,'Overall, [企業] should first recruit [可靠的團隊成員], because [共同紀律] is the foundation on which [真正創新] can later be built.','結論不排斥創新，而是把團隊紀律放在創新的基礎位置。','兩方已權衡，末句要提出招聘先後和兩種特質如何相容時。',['Overall, ', ' should first recruit ', ', because ', ' is the foundation on which ', ' can later be built.'],['作決定的企業','先招聘的人','先建立的共同基礎','其後可建立的成果'])),
];
const usageRules=[
  '要先說某決定何以重要，並用 not only ... but also 列出兩種影響時。',
  '題目提供兩個立場，需用 whereas 平衡陳述各自的主張時。',
  '承認一方有價值，同時明確表示較支持另一方時。',
  '要開始公平解釋一方為何有吸引力，暫不進入反駁時。',
  '要說明競爭壓力使重複舊法不足以維持成果時。',
  '要以 who 列明某類人的具體行動，再說這些行動帶來甚麼結果時。',
  '提出一般好處後，需用具體工作角色和問題演示自發改善時。',
  '具體例子已說明，需把它上升為一般作用並說明適用條件時。',
  '一方的理由已公平論證，需以 However 轉入自己較支持的理由時。',
  '要用分號先否定過度簡化的看法，再說明實際結構時。',
  '要說明某項優點在欠缺必要配合條件時，反而會帶來負面後果。',
  '已提出一般風險，需用具體領域列出可觀察後果時。',
  '負面反例已說明，需用 by contrast 指出另一類人或做法的正面結果時。',
  '雙方優點已討論，需區分值得重視與應排首位兩種判斷時。',
  '要比較一項可後期培養的能力與一項缺少時便難運作的條件時。',
  '要在結論提出先後次序，並解釋先做的事如何為後來成果奠基時。',
];
structures.forEach((row,i)=>{row.frame.usage=usageRules[i];});
const wrongReasons=[
  ['這句並列兩種招聘標準，未用 because 說明招聘影響。','這句只談競爭市場的創新需求，未說員工影響產出和文化。','這句說公司結構，沒有招聘重要性的雙面影響。'],
  ['這句先談招聘重要性，未公平介紹兩派標準。','這句已用 Although 表達作者選擇，原句尚未表態。','這句轉入作者較支持的團隊論，沒有並列題目兩派。'],
  ['這句只並列兩派立場，未給出作者的優先選擇。','這句開創新段，未用 Although 讓步後表態。','這句後段重申招聘次序，原句在引言首次提出立場。'],
  ['這句已表明團隊優先，未開展創新一派的吸引力。','這句描述競爭市場，尚未點出具備哪些特質的員工。','這句是作者的團隊轉折，並非公平開創新方。'],
  ['這句只說創新員工吸引僱主，未交代市場競爭壓力。','這句列員工行動，未說舊方法為何不足。','這句是單一軟件例子，未建立市場背景。'],
  ['這句說競爭市場要改變，但未列員工的三種主動行動。','這句是開發者例子，原句先提出一般機制。','這句概括進步作用，未說質疑、提議和承擔怎樣加快速度。'],
  ['這句一般性說員工如何推進公司，未舉出特定開發者。','這句已概括獨立員工的行業價值，非單一例子。','這句是假設不合作使好點子失效，非自主設計新工具。'],
  ['這句列主動員工的行動，尚未概括行業作用。','這句給出開發者例子，原句用 In this sense 抽出一般結論。','這句轉到團隊一派，未說獨立員工在創意行業的價值。'],
  ['這句在引言先選團隊優先，原句在主體段轉入較強論證。','這句仍總結獨立創新一派，未轉到團隊執行。','這句解釋企業網絡結構，原句先提出團隊主張。'],
  ['這句提出團隊比創新重要，未說企業如何由部門和責任連成網絡。','這句分析員工不合作的條件與後果，非企業結構。','這句說合作員工的結果，未對照孤立個人與協作網絡。'],
  ['這句說企業是協作網絡，沒有 If 與 even 的風險推演。','這句給出高風險行業例子，原句先說不合作會使好想法失效。','這句比較後提出合作員工的好處，不是不合作條件。'],
  ['這句說不合作會使好想法失效，尚未給出行業例子。','這句轉到合作員工的正面作用，沒有列違規風險。','這句明示招聘優先序，非醫療建築金融的安全實例。'],
  ['這句解釋企業依賴團隊，未說團隊員工創造的具體環境。','這句展示不守指示的風險，原句以 by contrast 說正面效果。','這句比較可訓練的創意與合作缺失，未列一致完成和互信。'],
  ['這句在引言已選團隊，原句是在雙方論證後作權衡。','這句只轉入團隊優勢，未承認創新仍有價值。','這句是結論的先招聘與後創新，原句先判斷優先次序。'],
  ['這句列主動員工的好處，未比較後期可培養與當下難運作。','這句表達招募優先序，原句提供為何如此選的比較理由。','這句結論提出共同紀律是基礎，並非訓練與運作的比較。'],
  ['這句只轉入團隊主張，沒有把團隊紀律連到後期創新。','這句說創新雖有價值但不排第一，未建基礎關係。','這句比較可訓練與難補救的特質，原句給出最終招聘準則。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先列創新一方，再列作者較支持的合作一方，最後給出先後次序。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這題要比較哪兩種求職者？',[
    '有創意而能獨立工作者，與能合作並遵從指示者',
    '只比較有無學位，與是否住在公司附近',
    '只比較薪酬高低，與工作時間長短差異',
    '只比較兩種軟件，與辦公室裝修風格',
  ],'題目對照創新自主型與團隊服從型的招聘標準。'),
  {type:'multi',prompt:'選出作者對兩派的完整立場',detail:'選兩項，再按「確認」。',options:[
    '承認獨立創新者可推動企業改善',
    '仍認為團隊合作與守規則應先被重視',
    '認為每一種創意都必須被公司禁止',
    '認為只要遵從指示便不必再有創新',
  ],correct:[0,1],why:'作者承認創新的價值，但選擇把合作和執行放在招聘首位。'},
];
const route=[sequence('依文章次序排列招聘論證',[
  ['引言定比較與立場','介紹自主創新和團隊服從，表明團隊優先。'],
  ['先論證創新一派','競爭市場需要主動發現問題、提出新方法的人。'],
  ['再論證合作一派','企業是協作網絡；守程序保安全，合作帶來穩定與互信。'],
  ['結論解釋先後','創意可培養，合作是日後創新的共同基礎。'],
],'結構重點是公平說明兩方後，再解釋優先次序，不把創新說成無用。')];
const evidence=[
  quiz('競爭市場為何使創新型員工有用？',[
    '公司不能年年只重複舊方法，須有人提出新做法',
    '只要方法舊，所有公司便必定立刻停止營運',
    '創新員工只能增加會議，不能改善任何流程',
    '競爭市場只需要員工照抄同一份舊文件',
  ],'原文先說重複舊法不足，再列主動員工的行動。'),
  quiz('軟件開發者例子說明「自立」具體是甚麼？',[
    '自行察覺低效系統並設計工具，不必等經理指示',
    '經理發現所有問題後，開發者只負責等待',
    '只靠員工想像，不必檢查內部系統是否有效',
    '故意延長工作流程，避免設計任何更好工具',
  ],'例子把主動發現、設計和無須等待串起來。'),
  quiz('作者為何說大多數公司更依賴合作？',[
    '企業由部門、期限和共同責任構成，需要協調',
    '企業只是彼此完全無關的個人工作集合',
    '所有部門都沒有期限，也不須共同承擔',
    '只要有一個好主意，公司便不再需要程序',
  ],'企業是工作相互連動的網絡，而非孤立個人。'),
  quiz('即使想法出色，何時仍可能反而妨礙公司？',[
    '員工拒絕溝通、接受意見或遵從既定程序時',
    '員工彼此溝通並按流程合作完成任務時',
    '員工先檢查安全風險再提出改善建議時',
    '員工學會守規則並聽取其他同事意見時',
  ],'原文用 If ... even ... 說明想法品質不能代替協作。'),
  quiz('為何醫療、建築和金融例子特別有說服力？',[
    '忽視指示可能造成錯誤、法律問題或安全風險',
    '這些行業從來不需要任何規則或安全安排',
    '醫療和建築只需創意，不會有任何程序要求',
    '只要想法新，任何法律問題就會自動消失',
  ],'高風險行業的後果使守程序的需要變得具體。'),
  quiz('團隊型員工為工作場所帶來甚麼？',[
    '穩定完成任務與同事互信，讓工作更可靠',
    '只追求個人表現，不需理會其他部門期限',
    '只要有團隊名稱，就必定不用完成任何任務',
    '每個人只按自己的想法做，完全不互相依賴',
  ],'穩定、一致和互信是作者給合作型員工的正面理由。'),
  quiz('為何結論沒有否定創新？',[
    '創意可日後培養，可靠的合作先提供發展基礎',
    '創意對所有行業都完全沒有任何實際用途',
    '共同紀律使創新永遠不可能在公司出現',
    '公司只能招聘創新者，完全無須重視合作',
  ],'作者主張先後次序，而非認為兩種特質互相排斥。'),
];
const logic=[
  sequence('創新自主型員工的論證',[
    ['市場背景','重複舊做法難在競爭市場長久維持。'],
    ['主動行動','質疑舊法、提出新方案並承擔任務。'],
    ['工作例子','開發者自行發現低效系統並設計工具。'],
    ['適用範圍','創意與快速解難重要的行業特別受益。'],
  ],'作者先真正說明創新一方的價值，才轉入自己較支持的合作一方。'),
  sequence('團隊合作優先的論證',[
    ['企業結構','公司是部門、期限與共同責任相連的網絡。'],
    ['不合作的代價','好想法也可能因不溝通和不守程序而變成風險。'],
    ['高風險例子','醫療建築金融忽視指示可造成錯誤與安全問題。'],
    ['合作的正面效果','工作一致完成，同事互相信任。'],
    ['招聘先後','先有可靠團隊紀律，日後再培養真正創新。'],
  ],'作者的優先次序建基於企業如何運作，以及哪種缺失更難補救。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('餐飲公司面對新對手，菜單多年未變，正在招聘能改善服務流程的人。','哪項最能轉用範文的創新員工理由？',[
    '聘請會找出舊流程問題並主動提出新方法的人',
    '只要求員工重複舊方法，不准指出任何問題',
    '只看應徵者外貌，不問他能否改善工作流程',
    '每年都照抄舊菜單，拒絕觀察市場如何改變',
  ],['競爭使重複舊法不足；主動員工能推進改善。','與論點相反。','未評估能力。','忽視競爭。'],[4,5,6],'範文說競爭市場不能年年重複舊法，員工可質疑並提出新方案。'),
  transfer('診所資訊員發現預約系統總令病人重複填表，主管還未注意到。','哪種行動最貼近軟件開發者例子？',[
    '自行研究重複填表的原因，並提出較好的系統',
    '只等主管發現問題，期間完全不檢查任何資料',
    '只把病人投訴刪除，避免診所知道系統有問題',
    '只增加更多表格，不理病人是否要重複填寫',
  ],['原文開發者主動發現低效系統並設計更好工具。','缺主動性。','掩蓋問題。','加深低效。'],[5,6,7],'範文以開發者毋須等待經理指出問題，說明自立員工價值。'),
  transfer('建築公司一名設計師有新想法，卻拒絕向安全團隊交代更動，也不遵守檢查程序。','哪項評估最符合作者較強的論證？',[
    '好想法仍須溝通及守程序，否則可能帶來安全風險',
    '只要設計新，安全團隊便完全不必知道任何更動',
    '設計師不願溝通，代表方案必定比舊方法更安全',
    '只要工程趕工，所有程序便可永久取消不用',
  ],['原文說不溝通或忽視程序會使好點子變成風險。','忽略協作。','不能推得安全。','程序有作用。'],[9,10,11],'範文把出色想法仍可能有破壞性，連到建築業安全風險。'),
  transfer('醫院招聘新護士：甲擅長獨立提案卻常不交接病人資料；乙可靠交接並遵從安全流程。','若依範文的優先次序，哪項選擇最合理？',[
    '先重視乙的合作與安全執行，再培養改善流程的能力',
    '只選甲的獨立提案，完全忽略病人資料交接的問題',
    '只看兩人創意提案數量，不問誰能遵守安全流程',
    '只要甲有新想法，就可取消所有交班和安全覆核',
  ],['醫療有安全風險；合作與程序是創新的基礎。','忽略病人安全。','未評估執行。','新想法不能代替交接。'],[10,11,13,14,15],'範文承認創意價值，但高風險工作須先有可靠合作和守程序。'),
  transfer('新創公司想讓員工分別在不同城市工作，卻發現產品、財務與客服的期限彼此相連。','哪項最能運用「協作網絡」的論點？',[
    '評估應徵者能否跨部門溝通並承擔共同期限',
    '只看個人點子，完全不問各部門如何配合',
    '把每個部門當孤島，拒絕分享工作進度',
    '取消所有共同期限，便不必再有團隊合作',
  ],['原文說企業是部門、期限與共同責任相連的網絡。','忽略協作。','加深隔離。','未處理結構。'],[8,9,10],'範文反對把企業想成孤立個體的集合，強調網絡式協作。'),
  transfer('製作公司一組員工有創意，但每人交件方式不同，其他部門無法判斷何時可以接手。','哪項最能轉用團隊型員工的正面效果？',[
    '建立一致交件方法，讓同事知道進度並互相信任',
    '讓每人私下改期，不向其他部門說明任何安排',
    '只看構思是否新鮮，不問任務能否按時交接',
    '完全取消交件要求，便能自動建立同事信任',
  ],['一致完成任務和互信是範文的合作型員工效果。','破壞協調。','忽略執行。','信任需可靠行動。'],[9,12],'範文說團隊型員工令工作穩定一致完成，同事可彼此信任。'),
  transfer('銀行面試官問：創意思維與守基本規則，哪一項較可在聘後慢慢培養？','哪項最貼近範文的判斷？',[
    '創意思維可以訓練；拒絕合作與基本規則較難補救',
    '守規則永遠完全無用；所有銀行只需要創新提案',
    '只要有人合作，公司便不需要任何後續技能培訓',
    '創意既可訓練，就應立即禁止員工提出新想法',
  ],['作者比較可培養的創意與不合作造成的運作困難。','忽略高風險程序。','原文仍重視創新。','可訓練不等於禁創意。'],[13,14,15],'範文說公司可逐漸訓練創意，但員工抗拒合作規則時難以運作。'),
  transfer('遊戲工作室需要新點子，也需要開發、測試和客服順利配合。','哪項政策最完整地體現範文的兩方關係？',[
    '先建立可靠團隊流程，再給員工空間提出並試驗新點子',
    '只聘個人創意最高者，完全不理測試與客服部門合作',
    '只要求守流程，永久禁止員工改善任何遊戲玩法',
    '讓所有部門各做各的，不設任何共同交付的時間',
  ],['範文把共同紀律視為日後真正創新的基礎。','漏協作。','否定創新。','破壞網絡。'],[7,8,9,14,15],'範文不是二選一地否定創新，而是把團隊紀律放在先。'),
  transfer('求職者擅長自主研究，招聘小組想公平討論其優點後，再說明為何仍選合作型人才。','哪項寫法最符合範文的討論順序？',[
    '先說自主研究可改善流程，再論證企業更依賴團隊執行',
    '先否定自主研究的一切實際價值，然後直接宣佈結果',
    '只重複求職者姓名，不提出兩方招聘標準的理由',
    '只列團隊合作口號，完全不理競爭市場的新方法',
  ],['範文先公平展開創新好處，再以 However 提出較強團隊論。','未公平討論。','沒有論據。','漏一方。'],[3,4,5,6,7,8],'範文第一主體段先講創新一方，第二主體段才講作者較支持的一方。'),
  transfer('公司招聘準則目前只寫「要有新意」，主管希望加入可實際執行的長期原則。','哪項補充最符合範文的結論？',[
    '先聘能可靠合作的人，再以共同紀律支持真正創新',
    '只聘不與同事說話的人，讓好想法自然地產生',
    '把所有基本規則取消，便能保證每項創新有用',
    '只把創意當首要條件，不需問員工能否好好協作',
  ],['作者把可靠團隊貢獻和共同紀律定位為創新的基礎。','缺合作。','缺執行保障。','與作者優先序相反。'],[13,14,15],'範文末句明言先招聘可靠團隊成員，真正創新可在共同紀律上建立。'),
];
export default {key:'discuss-both-views:5',meta:{topic:'招聘時應優先重視創新自主還是合作守規',summary:'獨立創新員工能改善流程，但多數企業更需要可靠合作與守程序；共同紀律為日後創新奠基。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
