// Human-authored support for Direct Question 7; original text remains in its canonical bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-7-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:7'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'Doing well at school and doing well in life do not always need the same skills.',
  'School is useful, but it tests only some of the things people can do.',
  'So some people do well in life after doing badly at school because life values many other skills. The most important is being able to get back up after problems.',
  'One reason is that schools often give good marks for following rules, remembering facts, doing exams well, and working within a set system.',
  'These skills help, but there is more to success.',
  'Outside school, people may do well because they solve real problems, understand others, think of new ideas, or take risks after thinking carefully.',
  'For example, a student who finds written tests hard may still understand business well, know what customers need, or be brave enough to try again after failing.',
  'So poor marks at school do not always tell us what a person can do. They may only show that the school system did not fit that person.',
  'When these people find work that matters to them, they may become focused and confident in ways they were not at school.',
  'The most important skill for doing well in life is getting back up after problems.',
  'Being gifted, well taught, or lucky can help, but these advantages may not last if someone gives up too soon.',
  'Life often goes in unexpected directions: people lose jobs, make bad choices, hear no, and face problems no book taught them how to solve.',
  'Being able to recover helps them face these problems without letting the problems become who they are.',
  'More than that, it helps them learn from failure.',
  'For example, a young business owner whose first plan fails may learn to handle money, listen to customers, and make a better plan.',
  'Without the ability to recover, the first failure may stop them; with it, the failure becomes a hard but useful time of learning.',
  'To sum up, some people do well in life after doing badly at school because life values much more than marks.',
  'The ability to recover matters most because it helps people keep learning, change when needed, and go on after problems.',
];
const vocabulary=[
  [['Success at school','Doing well at school','學校中的成功'],['success in life','doing well in life','人生中的成功'],['depend on the same abilities','need the same skills','取決於相同能力']],
  [['education is valuable','School is useful','教育有價值'],['measures only a limited range of skills','tests only some of the things people can do','只衡量有限技能']],
  [['academic failure','doing badly at school','學業失敗'],['life rewards broader strengths','life values many other skills','人生獎賞更廣的能力'],['resilience','being able to get back up after problems','韌性／復原能力']],
  [['reward discipline','give good marks for following rules','獎賞紀律'],['memory','remembering facts','記憶力'],['examination technique','doing exams well','考試技巧'],['follow a fixed system','working within a set system','遵從固定制度']],
  [['These qualities','These skills','這些素質'],['useful','help','有用'],['not the whole story','more to success','並非全部']],
  [['Outside the classroom','Outside school','課室以外'],['practical','solve real problems','務實'],['socially intelligent','understand others','具社交智慧'],['creative','think of new ideas','有創意'],['calculated risks','risks after thinking carefully','經過計算的風險']],
  [['struggles with written exams','finds written tests hard','筆試吃力'],['sharp instinct for business','understand business well','敏銳商業直覺'],['understand customers','know what customers need','理解顧客'],['courage to start again after failure','brave enough to try again after failing','失敗後再開始的勇氣']],
  [['poor school results','poor marks at school','學校成績差'],['final judgement on a person’s ability','tell us what a person can do','對能力的最終判斷'],['one particular system did not suit them','school system did not fit that person','特定制度不適合他']],
  [['Once such people find work','When these people find work','一旦找到工作'],['feels purposeful','matters to them','感到有意義'],['develop the focus and confidence','become focused and confident','培養專注力與自信']],
  [['most important thing','most important skill','最重要的特質'],['success in life','doing well in life','人生成功'],['resilience','getting back up after problems','韌性']],
  [['Talent','Being gifted','天賦'],['education','well taught','教育'],['fragile advantages','advantages may not last','脆弱的優勢'],['gives up too easily','gives up too soon','太容易放棄']],
  [['rarely moves in a straight line','often goes in unexpected directions','很少按直線發展'],['poor decisions','bad choices','錯誤決定'],['face rejection','hear no','面對拒絕'],['no textbook has prepared them for','no book taught them how to solve','教科書未教如何應對']],
  [['Resilience','Being able to recover','韌性'],['absorb these setbacks','face these problems','承受挫折'],['without being defined by them','without letting the problems become who they are','不被挫折定義']],
  [['More importantly','More than that','更重要的是'],['turns failure into feedback','helps them learn from failure','把失敗化為回饋']],
  [['For instance','For example','例如'],['young entrepreneur','young business owner','年輕創業者'],['first idea collapses','first plan fails','第一個想法失敗'],['manage money','handle money','管理金錢'],['build a stronger plan','make a better plan','建立更好計劃']],
  [['Without resilience','Without the ability to recover','沒有韌性'],['first failure becomes an ending','first failure may stop them','首次失敗變成終點'],['rough but useful apprenticeship','hard but useful time of learning','艱難但有用的學習期']],
  [['In conclusion','To sum up','總結來說'],['succeed after failing at school','do well in life after doing badly at school','學校失敗後仍成功'],['life rewards far more than academic performance','life values much more than marks','人生看重的不止學業成績']],
  [['Resilience','The ability to recover','韌性'],['most essential quality','matters most','最重要的素質'],['adapting','change when needed','適應'],['moving forward when things go wrong','go on after problems','出錯時繼續向前']],
];
const chunkOverrides=[
  ['Success at school and success in life','do not always depend on the same abilities.'],
  ['While education is valuable,','it measures only a limited range of skills.'],
  ['Some people therefore succeed after academic failure','because life rewards broader strengths,','and the most important of these is resilience.'],
  ['One reason is that schools often reward discipline, memory,','examination technique and the ability to follow a fixed system.'],
  ['These qualities are useful,','but they are not the whole story.'],
  ['Outside the classroom, people may succeed','because they are practical, socially intelligent, creative','or willing to take calculated risks.'],
  ['A student who struggles with written exams, for example,','may still have a sharp instinct for business,','an ability to understand customers,','or the courage to start again after failure.'],
  ['In this sense, poor school results','are not always a final judgement on a person’s ability;','they may simply show that one particular system did not suit them.'],
  ['Once such people find work that feels purposeful,','they can develop the focus and confidence','that they never showed in school.'],
  ['The most important thing for success in life','is resilience.'],
  ['Talent, education and luck all matter,','but they are fragile advantages','if a person gives up too easily.'],
  ['Life rarely moves in a straight line:','people lose jobs, make poor decisions, face rejection','and meet problems that no textbook has prepared them for.'],
  ['Resilience allows them to absorb these setbacks','without being defined by them.'],
  ['More importantly, it turns failure','into feedback.'],
  ['For instance, a young entrepreneur whose first idea collapses','may learn how to manage money,','listen to customers and build a stronger plan.'],
  ['Without resilience, that first failure becomes an ending;','with resilience, it becomes a rough but useful apprenticeship.'],
  ['In conclusion, some people succeed after failing at school','because life rewards far more than academic performance.'],
  ['Resilience is the most essential quality','because it helps people keep learning, adapting','and moving forward when things go wrong.'],
];
const simpleChunkOverrides=[
  ['Doing well at school and doing well in life','do not always need the same skills.'],
  ['School is useful,','but it tests only some of the things people can do.'],
  ['So some people do well in life after doing badly at school','because life values many other skills.','The most important is being able to get back up after problems.'],
  ['One reason is that schools often give good marks','for following rules, remembering facts, doing exams well,','and working within a set system.'],
  ['These skills help,','but there is more to success.'],
  ['Outside school, people may do well','because they solve real problems, understand others,','think of new ideas, or take risks after thinking carefully.'],
  ['For example, a student who finds written tests hard','may still understand business well,','know what customers need,','or be brave enough to try again after failing.'],
  ['So poor marks at school do not always tell us','what a person can do.','They may only show that the school system','did not fit that person.'],
  ['When these people find work that matters to them,','they may become focused and confident','in ways they were not at school.'],
  ['The most important skill for doing well in life','is getting back up after problems.'],
  ['Being gifted, well taught, or lucky can help,','but these advantages may not last','if someone gives up too soon.'],
  ['Life often goes in unexpected directions:','people lose jobs, make bad choices, hear no,','and face problems no book taught them how to solve.'],
  ['Being able to recover helps them face these problems','without letting the problems become who they are.'],
  ['More than that,','it helps them learn from failure.'],
  ['For example, a young business owner whose first plan fails','may learn to handle money, listen to customers,','and make a better plan.'],
  ['Without the ability to recover, the first failure may stop them;','with it, the failure becomes a hard but useful time of learning.'],
  ['To sum up, some people do well in life','after doing badly at school','because life values much more than marks.'],
  ['The ability to recover matters most','because it helps people keep learning,','change when needed, and go on after problems.'],
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
  card('Success in exams and success at work do not always depend on the same skills.','用兩種 success 並列，指出它們未必依靠相同能力',[1,9,16],
    fixed(0,'Success at [情境甲] and success in [情境乙] do not always depend on [相同條件].','並列兩種成功，再指出其所需能力不一定相同。','要打破把某一環境的成績直接等同另一環境成果的看法時。',['Success at ', ' and success in ', ' do not always depend on '],['第一種成功的情境','第二種成功的情境','未必相同的條件'])),
  card('While test scores are useful, they show only part of what a pupil can do.','用 While 承認價值，再指出衡量範圍有限',[0,4,10],
    fixed(1,'While [某制度有價值], [它只能衡量的範圍].','先承認教育或測量方法有用，後指出其範圍不足以代表整個人。','要公平評價一種標準，同時說明它的局限時。',['While ', ', '],['被承認的價值','受到限制的衡量範圍'])),
  card('Some volunteers therefore improve after early mistakes because the work values wider strengths, and the most important of these is patience.','用 therefore ... because ... and the most important 承接現象、解釋及核心特質',[3,8,16],
    fixed(2,'Some people therefore [後來成功] because [更廣的能力得到發揮], and the most important of these is [核心特質].','先說明有人後來成功的現象，解釋不同環境重視其他能力，再點出最關鍵一項。','題目同時問「為何出現這種現象」和「最重要的是甚麼」時。',['Some people therefore ', ' because ', ', and the most important of these is '],['後來成功的現象','環境重視較廣能力的原因','最核心的特質'])),
  card('One reason is that schools often reward memory and the ability to follow rules.','用 One reason is that 引出一個制度偏重的能力範圍',[0,5,11],
    fixed(3,'One reason is that [某制度] often reward [它特別重視的能力].','以一項理由開始，交代某制度會獎賞哪些特質。','要解釋一種評分制度為何只呈現部分人的強項時。',['One reason is that ', ' often reward '],['被分析的制度','制度重視的能力'])),
  card('Exam scores are useful, but they are not the whole story.','用 useful, but ... not the whole story 承認一部分價值並避免過度概括',[1,7,15],
    fixed(4,'[已提到的能力] are useful, but they are not the whole story.','承認前述特質或數字有用，提醒讀者它們不足以解釋整個結果。','前文剛列出某種優勢，接着要限制它的解釋範圍時。',[' are useful, but they are not the whole story.'],['有用但不充分的能力'])),
  card('Outside the classroom, children may thrive because they solve problems and work well with others.','用 Outside ... may succeed because 對比不同場景所重視的能力',[3,6,8],
    fixed(5,'Outside [原來的場景], [人] may succeed because [其他能力].','換到另一環境後，指出原來沒有被看見的能力可以帶來成功。','要解釋同一人在學校、工作或社區表現不同的原因時。',['Outside ', ', ', ' may succeed because '],['原來的場景','處於新場景的人','新場景重視的能力'])),
  card('A pupil who finds maths tests hard, for example, may still lead a team and solve practical problems.','用 who struggles ... may still 強調一項弱點不會取消其他能力',[2,9,11],
    fixed(6,'A [人] who [某項評估吃力], for example, may still [其他強項].','用具體個案說明某人在一種測試中不擅長，卻仍可能在其他方面有實力。','已說明制度只測部分能力，想用一人身上的反差作例子時。',[' who ', ', for example, may still '],['被舉例的人','某項評估吃力','仍可能有的其他強項'])),
  card('In this sense, low test scores are not always a final judgement on a pupil; they may simply show that the test format did not suit that pupil.','用 not always ...; they may simply show that 重新解讀差成績',[4,10,16],
    fixed(7,'In this sense, [差結果] are not always [最終定論]; they may simply show that [制度不適合].','先否定差結果等於能力定論，再提出較有限、較合理的解釋。','要避免把一次測試或一種制度下的表現當成對整個人的判斷時。',['In this sense, ', ' are not always ', '; they may simply show that '],['某種差結果','被否定的最終定論','較有限的解釋'])),
  card('Once new volunteers find tasks that matter to them, they may develop confidence they lacked before.','用 Once 設定找到合適工作的時點，再指出新能力開始展現',[3,5,14],
    fixed(8,'Once [找到合適情境], [先前未展現的能力得以發展].','找到合適的工作或環境後，原來不明顯的專注或自信開始出現。','要說明人與環境更合適後，能力如何逐漸被看見時。',['Once ', ', '],['找到合適情境的時點','新能力的發展'])),
  card('The most important thing for progress in sport is the willingness to keep practising.','用 The most important thing for ... is 直接選出最關鍵特質',[0,8,17],
    fixed(9,'The most important thing for [目標] is [核心特質].','直接回答在某個目標中哪一項最重要。','題目明確問「最重要的是甚麼」，需要先給清楚答案時。',['The most important thing for ', ' is '],['要達成的目標','被選出的核心特質'])),
  card('Money, equipment and training all matter, but they are fragile advantages if a team gives up after one loss.','用 all matter, but ... if 承認多種好處並指出放棄會令它們失效',[1,4,16],
    fixed(10,'[多項優勢] all matter, but [優勢有限] if [太早放棄].','承認天賦、資源等都有用，但把它們的作用放在能否堅持的條件下看。','要說明外在或先天優勢為何仍需要持續努力支撐時。',[' all matter, but ', ' if '],['有用的幾項優勢','優勢的脆弱之處','令優勢失效的情況'])),
  card('A career rarely moves in a straight line: people change jobs, face rejection and learn unexpected lessons.','用 rarely moves in a straight line: 以比喻引出難以預期的挫折清單',[3,5,14],
    fixed(11,'[人生或事業] rarely moves in a straight line: [多種未預期的挫折].','先用不走直線的比喻，再列出現實中會打斷原來計劃的事情。','要說明長期成長不會按理想次序順利發生時。',[' rarely moves in a straight line: '],['被比喻的發展歷程','未預期的挫折'])),
  card('Support allows pupils to face mistakes without being defined by them.','用 allows ... to ... without 說明能面對挫折而不把挫折當身分',[6,8,10],
    fixed(12,'[能力或支持] allows [人] to [承受挫折] without [被挫折定義].','前面的特質讓人承受困難，同時不把一次失敗當成自己全部。','要解釋韌性、支持或信任如何改變人面對失敗的方式時。',[' allows ', ' to ', ' without '],['提供幫助的能力或支持','受幫助的人','承受挫折的行動','被挫折定義的風險'])),
  card('More importantly, it turns complaints into practical advice.','用 turns ... into 表示把負面經歷轉成可用資訊',[2,7,15],
    fixed(13,'More importantly, it turns [負面經歷] into [可用的學習資訊].','把原本令人受挫的經驗，轉成改善下一次行動的回饋。','已說明能承受失敗，進一步要說明如何從失敗中學習時。',['More importantly, it turns ', ' into '],['被轉化的負面經歷','轉化後的學習資訊'])),
  card('For instance, a new teacher whose first lesson fails may learn how to explain ideas and plan a better class.','用 For instance ... whose ... may learn 舉出挫敗後可學到甚麼',[3,9,12],
    fixed(14,'For instance, [遇到第一次挫敗的人] may [從中學到的做法].','用具體人物和首次失敗，展示失敗可以產生新的實用能力。','已說失敗能成為回饋，想舉出一個人如何改進的例子時。',['For instance, ', ' may '],['遇到首次挫敗的人','從中學到的做法'])),
  card('Without support, a mistake may end a project; with support, it can become a lesson.','用 Without ...; with ... 對比缺少與具備同一條件的結果',[4,8,13],
    fixed(15,'Without [關鍵特質], [失敗變終點]; with [同一特質], [失敗變學習].','同一挫折在缺少與擁有某特質時，產生截然不同的結果。','要最鮮明地呈現某項能力如何決定失敗是終點還是經驗時。',['Without ', ', ', '; with ', ', '],['缺少的關鍵特質','缺少時的結果','具備的同一特質','具備時的結果'])),
  card('In conclusion, some volunteers thrive after early mistakes because community work values more than first-day performance.','用 In conclusion ... because 重申反差現象及環境重視更廣能力的原因',[3,8,15],
    fixed(16,'In conclusion, [失敗後仍成功的現象] because [新環境重視更廣能力].','結尾回應為何有人原本表現欠佳，後來仍能成功。','要在結論回扣「為甚麼先失敗後成功」的題問時。',['In conclusion, ', ' because '],['失敗後仍成功的現象','新環境重視更廣能力的原因'])),
  card('Patience is the most essential quality because it helps teachers stay calm when lessons do not go to plan.','用 most essential ... because ... when 說明核心特質在困難時的作用',[1,10,12],
    fixed(17,'[核心特質] is the most essential quality because [它如何幫助人] when [困難發生].','不只重申最重要的特質，還解釋它在事情出錯時的具體作用。','結尾須回答「最重要的是甚麼」，並用困難情境證明答案時。',[' is the most essential quality because ', ' when '],['核心特質','它如何幫助人','困難發生的情況'])),
];
const wrongReasons=[
  ['While 承認某標準有價值後指出範圍有限，沒有比較兩種成功所需能力。','The most important thing 只選核心特質，沒有並列兩種成果。','In conclusion 解釋有人失敗後成功，沒有直接對照兩種成功環境。'],
  ['兩種 success 的比較沒有先承認教育有用再限定其衡量範圍。','These qualities are useful 限制前述特質，沒有指出教育本身只測部分技能。','多項優勢 all matter 以不放棄為條件，沒有 While 的讓步式局限。'],
  ['One reason is that 開始解釋學校重視甚麼，沒有同時點明核心特質。','Once 說找到工作後能力發展，沒有因環境獎賞不同而成功的總解釋。','In conclusion 回扣失敗後成功，沒有順帶選出最重要的特質。'],
  ['兩種 success 並列比較，沒有提出學校獎賞甚麼的第一項理由。','Outside the classroom 說另一環境重視的能力，沒有指出原來制度的評分偏好。','不走直線比喻人生挫折，沒有分析學校如何評分。'],
  ['While 教育有價值但測量有限，沒有承接剛列出的特質再說它們並非全部。','not always a final judgement 重新解讀差成績，沒有單純限制有用特質的範圍。','Without ... with 比較韌性有無，沒有「有用但不完整」的簡潔讓步。'],
  ['One reason 說學校獎賞甚麼，沒有換到課室外找其他成功原因。','學生筆試困難的個案只是例子，沒有概括校外能力類型。','Once 說找到合適工作後能力浮現，沒有因務實等特質在校外成功的理由。'],
  ['therefore ... because 先總結現象並選核心特質，沒有具體學生弱點與強項反差。','The most important thing 直接選特質，沒有用一人個案舉例。','人生不走直線列各種挫折，沒有一名學生雖筆試差仍有其他強項。'],
  ['These qualities are useful 說優勢不完整，沒有重新解讀差成績。','all matter, but if 說天賦等可因放棄失效，沒有指出制度未必適合某人。','In conclusion 總結人生獎賞更廣能力，沒有差成績不是最終判斷的修正。'],
  ['One reason 解釋制度偏好，沒有找到合適工作後才發展自信的時點。','Outside the classroom 概括校外能力，沒有 Once 的轉變起點。','For instance 舉首次失敗後學習，沒有找到合適環境才展現能力。'],
  ['兩種成功的能力未必相同，沒有直接選出最重要的一項。','Once 描述找到合適工作後能力開始發展，沒有回答哪項最關鍵。','most essential ... because 在結尾解釋核心特質的作用，不是先給簡短答案。'],
  ['While 承認教育有用但範圍有限，沒有指出優勢遇到放棄時會失效。','These qualities are useful 說特質不完整，沒有以 if 設定放棄條件。','In conclusion 解釋人生重視更廣能力，沒有列優勢與放棄的關係。'],
  ['One reason 分析學校評分，沒有用人生不走直線引出難預期的挫折。','Outside the classroom 說校外可用的能力，沒有列人生計劃如何被打斷。','For instance 舉單個創業者學習，沒有冒號後的多種人生挫折。'],
  ['學生雖考試差仍有強項，沒有韌性如何使人承受挫折而不被定義。','Once 找到合適工作才展現自信，沒有 without 的身份界限。','all matter, but if 談優勢脆弱，沒有 allows ... without 的承受方式。'],
  ['因此有人後來成功的總解釋，沒有把一件負面經歷轉成學習資訊。','差成績不是定論的修正，沒有 turns ... into 的轉化動作。','Without ... with 比較兩種結果，沒有單句說失敗如何變回饋。'],
  ['One reason 列學校偏好的能力，沒有用一人首次挫敗作例子。','The most important thing 直接提出韌性，沒有個案中的具體學習。','allows ... without 解釋承受挫折，沒有舉出一個人如何學到新做法。'],
  ['These qualities are useful 說特質不完整，沒有同一條件有無的對照。','Once 只說找到合適工作後能力浮現，沒有 Without 和 with 的鏡像結果。','turns failure into feedback 只說轉化，沒有失敗是終點或學習期的比較。'],
  ['One reason 分析學校偏好的能力，沒有在結論回扣先失敗後成功的問題。','Once 描述找到合適工作後的發展，沒有總結人生重視更多能力。','Without ... with 比較韌性的作用，沒有明確重申為何學校失敗後能成功。'],
  ['While 教育有用但衡量有限，沒有證明最重要特質在困難時如何幫人。','all matter, but if 說優勢會因放棄而失效，沒有完整解釋核心特質的幫助。','allows ... without 說能承受挫折，沒有最重要特質加 because/when 的總結判斷。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求範文回答哪兩件事？',[
    '為何有些人學校失利後仍成功，以及人生成功最重要的是甚麼',
    '學校應否取消所有考試，以及哪一科最容易取得高分',
    '每個創業者有多少收入，以及哪個行業的工作最穩定',
    '學生應否完全不用讀書，以及人生是否只靠一次運氣',
  ],'第一問解釋學校與人生表現的反差；第二問要求選出最重要特質。'),
  {type:'multi',prompt:'選出範文兩段主體的論證主線',detail:'選兩項，再按「確認」。',options:[
    '學校只測部分能力，校外的實務、社交和創意能力也能帶來成功',
    '韌性讓人承受挫折並從失敗學習，因此比容易失效的優勢更關鍵',
    '學校成績差可保證任何人日後都一定成為成功企業家',
    '只要天賦或運氣好，遇到挫折時是否放棄便完全不重要',
  ],correct:[0,1],why:'第一段解釋學校評價的範圍；第二段論證韌性為何是最重要特質。'},
];
const route=[sequence('依原文次序排好四段的任務',[
  ['背景與雙重答案','學校與人生需要的能力不完全相同；後來成功可因更廣能力，而韌性最重要。'],
  ['解釋反差','學校重視特定能力；校外實務、社交、創意及願意嘗試等能力也有用。'],
  ['論證韌性','人生有意外挫折；韌性使人承受失敗、從中學習，重新擬定計劃。'],
  ['結論','人生獎賞的不只是成績；韌性讓人出錯時仍能學習、適應和前進。'],
],'先回答兩問 → 解釋學校評價不足 → 證明韌性的長期作用 → 回扣兩問。')];
const evidence=[
  quiz('為何學校成績不能完整預測一個人的人生表現？',[
    '學校重視部分技能，校外還會用到務實、社交與創意能力',
    '學校完全不會衡量任何能力，所以所有分數都沒有意思',
    '只要在學校不擅長考試，日後便一定比每位同學成功',
    '校外工作只看考試技巧，不會用到與人合作或解決問題',
  ],'作者承認教育有用，但指出它只涵蓋部分能力。'),
  quiz('筆試吃力的學生可能仍有哪些強項？',[
    '商業直覺、理解顧客，以及失敗後再次嘗試的勇氣',
    '只有記憶力和考試技巧，沒有任何其他可用能力',
    '每次作決定都不用考慮風險，因為勇氣可代替判斷',
    '只要考試差，便自然知道所有顧客想要甚麼',
  ],'這是「一種測試吃力，不代表所有能力欠佳」的具體例子。'),
  quiz('原文如何重新解讀差成績？',[
    '它可能只說明某種制度不適合那個人，並非能力的最終判決',
    '它必然證明那個人在任何工作環境都無法做得好',
    '它表示學校制度對所有學生都完全沒有任何用處',
    '它可以直接預測那個人日後每一次工作的收入',
  ],'原文使用「不總是」和「可能只是」，避免把分數變成全人定論。'),
  quiz('天賦、教育和運氣為何仍不足以保證成功？',[
    '如果一遇困難就放棄，這些優勢可能很快失去作用',
    '因為天賦與教育完全沒有價值，任何人都不需要它們',
    '因為有運氣的人永遠不會面對失業或被拒絕',
    '因為只要有一次失敗，所有能力便永久消失',
  ],'作者承認三者重要，再說它們需要韌性支撐。'),
  quiz('韌性在挫折後帶來甚麼超出「忍受」的作用？',[
    '讓人不被一次失敗定義，並把失敗變成改善下一次的回饋',
    '讓人完全沒有任何難過感受，也永遠不會再犯錯',
    '讓人不必聽取顧客意見，照原本計劃不斷重複',
    '讓人把第一次失敗視為人生結束，不再調整方向',
  ],'第二段先說承受挫折，再說從失敗學習，兩層作用都要看到。'),
  quiz('年輕創業者的例子如何支持韌性的論證？',[
    '首個想法失敗後仍學會管錢、聽顧客並提出更強計劃',
    '首個想法失敗便證明此人永遠不可能學會營商',
    '只要首個想法失敗，顧客意見和金錢管理便不再重要',
    '創業者完全不用檢討，第一次失敗會自動帶來成功',
  ],'例子把「失敗成為回饋」落實為三項後來可改進的做法。'),
];
const logic=[
  sequence('第一主體段：由學校評分範圍推到人生中的其他強項',[
    ['學校偏好','紀律、記憶、考試技巧和按制度工作，容易得到學校獎賞。'],
    ['承認而限制','這些特質有用，但不代表全部能力。'],
    ['轉到校外','實務、社交、創意及考慮後願意冒險，也能帶來成果。'],
    ['個人例子','筆試吃力的人，可能理解生意與顧客，亦能在失敗後重來。'],
    ['重解成績','差成績可能反映制度不合適，而非能力的最終判決。'],
    ['找到合適工作','有意義的工作讓原來沒有展現的專注和自信發展出來。'],
  ],'先說學校測到甚麼，再指出它沒測到甚麼，最後解釋合適工作如何讓能力出現。'),
  sequence('第二主體段：證明韌性如何使失敗成為學習',[
    ['先給答案','人生成功最重要的是韌性。'],
    ['與其他優勢比較','天賦、教育和運氣重要，但遇到放棄便可能失效。'],
    ['人生並非直線','失業、錯誤、被拒絕及沒有教科書預演的問題都會發生。'],
    ['第一層作用','韌性使人承受挫折，而不把失敗當成自己全部。'],
    ['第二層作用','把失敗變回饋，調整下一個計劃。'],
    ['對照總結','沒有韌性，首次失敗是終點；有韌性，它成為艱難但有用的學習。'],
  ],'從「遇到挫折」走到「承受挫折」，再走到「用回饋改進」，才完整說明韌性。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('一名學徒的筆試成績一般，但修理家電時能很快找出問題，也願意聆聽客戶。','哪項最能轉用範文對學校成績的解釋？',[
    '筆試只測部分能力，還須觀察實務判斷和理解客戶的表現',
    '筆試不突出便足以證明此人不可能完成任何維修工作',
    '只要維修速度快，就不必考慮安全、學習或客戶需要',
    '因為筆試一般，僱主應假設他在每種環境都會失敗',
  ],[
    '原文指出學校測試範圍有限，實務與社交能力也可帶來成功。',
    '一種測試的成績不能覆蓋已觀察到的實務能力。',
    '實務強項不是取消其他工作準則的理由。',
    '把局部分數推成全環境定論，正是原文反對的做法。',
  ],[1,3,5,6,7],'範文承認學校技能有用，但說校外仍重視務實與理解人的能力；筆試結果不該作最終判決。'),
  transfer('學校戲劇隊有學生不擅長書面考試，卻能即興解決排練問題並帶領同伴。','哪種評價最貼近範文的「不同場景」邏輯？',[
    '分開看筆試與排練能力，承認不同環境所需技能未必相同',
    '只看書面考試，假設學生在舞台上也不可能有任何貢獻',
    '只看舞台表現，便斷言學校任何學科都不值得再學習',
    '要求所有成員只背誦課本，不再觀察排練中的合作能力',
  ],[
    '學校與舞台表現依靠的能力不完全相同，兩種資料可並存。',
    '把筆試弱點擴大成舞台能力不足，忽略已觀察到的強項。',
    '承認其他強項不等於否定教育本身的價值。',
    '只用背誦會再次縮窄評估範圍。',
  ],[0,1,4,5],'範文開頭說學校與人生成功未必依靠相同能力，並說教育有價值但只測有限範圍。'),
  transfer('一間社區工場發現新員工在標準測試中表現差，換到實作職位後卻很專注。','哪個推論最符合範文對制度適配的說法？',[
    '原來的測試方式可能不適合他，合適工作令專注力展現',
    '一次測試分數已完全決定他在任何職位的長期能力',
    '實作表現較好證明所有標準測試都永遠沒有任何價值',
    '新員工只要找到合適職位，就不可能再遇到工作困難',
  ],[
    '原文容許差結果反映制度不合適，合適工作可讓能力浮現。',
    '單次測試不能否定已出現的實作專注。',
    '承認評估局限不等於否定所有標準測試。',
    '合適工作可能有幫助，不能保證沒有困難。',
  ],[7,8],'範文指出差成績不必是能力終判，找到有意義的工作後也可能發展出原來未顯露的專注。'),
  transfer('青年運動員身體條件優秀，首場比賽失利後卻立即停止訓練。','哪項最能套用範文對天賦與韌性的比較？',[
    '天賦有用，但若太快放棄，優勢便難以轉成長期成果',
    '只要身體條件好，停止訓練也能保證日後每場勝利',
    '一次失利已證明運動員完全沒有任何天賦或學習能力',
    '運動員應只等待運氣，不必分析失利或繼續練習',
  ],[
    '原文承認天賦重要，卻指出放棄會令優勢變得脆弱。',
    '天賦不能在沒有持續努力時保證成果。',
    '失敗一次不會抹去已有能力。',
    '等運氣不能替代韌性與從失敗學習。',
  ],[9,10,12,13],'範文說天賦、教育和運氣都有用，但若一遇挫折便放棄，這些優勢仍可能失效。'),
  transfer('初創社企的第一次社區活動參與者很少，團隊正考慮是否完全放棄。','哪項行動最能體現範文的「失敗變回饋」？',[
    '詢問參與者與未到者的原因，調整時間和活動安排再試',
    '只把參與少當成永遠失敗的證據，停止所有後續嘗試',
    '不問任何人意見，下次照抄原來的時間與活動安排',
    '只說成員不夠努力，不檢查時間或內容是否切合需要',
  ],[
    '收集意見並改計劃，把失敗轉成下一次可用的資訊。',
    '把一次失敗當終點，與原文的韌性對照相反。',
    '照抄原安排沒有用失敗提供的回饋。',
    '只責怪成員未找出參與少的可改進原因。',
  ],[12,13,14,15],'範文以創業者的首個構想失敗作例子：韌性使他聽顧客、管資源並提出較強的新計劃。'),
  transfer('一名求職者多次被拒，於是檢查面試回饋、改善作品集並再申請合適職位。','哪項最貼近範文對韌性的兩層作用？',[
    '她承受被拒絕，亦把回饋用來改進下一次嘗試',
    '她只是假裝從未被拒，沒有改變任何申請做法',
    '她因一次拒絕便永遠停止求職，不再調整方向',
    '她只靠運氣等待錄用，完全不參考面試回應',
  ],[
    '原文先說不被挫折定義，再說把失敗轉成可用回饋。',
    '題目明確說她檢查回饋並改作品集，不是毫無改變。',
    '繼續申請與一次拒絕後放棄相反。',
    '她有主動調整，不只是等待運氣。',
  ],[11,12,13,17],'範文說韌性讓人承受挫折，不讓挫折定義自己，更重要的是從失敗中學習。'),
  transfer('公共服務中心的新職員遇到前所未見的系統故障，手冊沒有處理方法。','哪項最能應用範文對「人生不走直線」的理解？',[
    '冷靜求助並記錄處理方法，下次遇到相似問題可改進',
    '因手冊未載故障便立即認定自己永遠不適合這份工作',
    '只等問題自行消失，完全不嘗試求助或學習新方法',
    '假設有教育背景的人不會遇到任何未寫進手冊的問題',
  ],[
    '原文強調意外問題會出現，韌性讓人學習、適應並前進。',
    '一種未知故障不能定義整個人的能力。',
    '被動等待沒有承受或學習挫折。',
    '教育有價值，但不能預先教會每個未知情況。',
  ],[11,12,17],'範文說人生會遇上教科書未教的問題，韌性的重要性正在於能應對、學習和調整。'),
  transfer('一名畫家首次展覽得到差評。她請觀眾說明原因，並調整下一次作品呈現。','哪個解釋最能對應原文的學徒期比喻？',[
    '差評雖艱難，卻成為學習呈現方式的經驗而非終點',
    '差評代表畫家永遠不應展覽，也不值得再聽任何意見',
    '只要第一次展覽受批評，下一次作品必然會自動成功',
    '畫家應抹去所有評語，不作調整便反覆展示同一內容',
  ],[
    '韌性使首次挫敗變成艱難但可用的學習階段。',
    '把第一次差評作終判，與原文的 with resilience 對比相反。',
    '學習可改善，但不保證下一次必然成功。',
    '拒絕回饋便無法把失敗轉成經驗。',
  ],[13,15],'範文說沒有韌性，首次失敗像終點；有韌性，它變成艱難但有用的學習期。'),
  transfer('企業招收青年實習生，只按考試名次排序，卻希望找到能應付變化的人。','哪個選人方向最能兼顧範文兩段主體？',[
    '保留成績參考，也觀察實務合作、受挫後學習與調整能力',
    '只錄用名次最高者，假設考試已涵蓋一切人生能力',
    '完全取消所有學習資料，只看實習生第一次是否幸運',
    '只問候選人有沒有天賦，不查他們面對困難的方式',
  ],[
    '學校成績只測部分能力；實務與韌性也要從行動觀察。',
    '考試不會完整測量合作與受挫後調整。',
    '承認分數有限，不等於所有學習資料都無用。',
    '天賦不能代替具體的韌性與學習方式。',
  ],[1,3,5,10,12,17],'範文先說學校評分不足以涵蓋全部能力，再說韌性使人面對變化時仍能學習。'),
  transfer('學校設計畢業生追蹤調查，想知道誰能在畢業多年後仍不斷成長。','哪項資料最能轉用範文的整體結論？',[
    '同看學業外的能力，以及遇到失敗後能否學習、適應和前進',
    '只看畢業那年的考試名次，並假設多年後仍必然相同',
    '只計畢業生第一次求職是否成功，不追蹤後續發展',
    '只記錄家庭運氣好壞，不問個人如何面對實際挫折',
  ],[
    '長期成長須看較廣能力，也要看韌性在失敗後的作用。',
    '單年名次不能完整預測多年的人生變化。',
    '第一次求職只是起點，不代表之後的學習能力。',
    '運氣有影響，但原文特別強調面對挫折的回應。',
  ],[0,7,10,16,17],'範文說人生獎賞的不只有學業表現；韌性讓人在事情出錯時繼續學習、適應與前進。'),
];
export default {key:'direct-question:7',meta:{topic:'學校成績與人生成功',summary:'學校只衡量部分能力；校外強項可以帶來成功，而韌性讓人從挫折中學習並前進。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
