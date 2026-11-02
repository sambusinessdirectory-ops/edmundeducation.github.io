// Human-authored support for Direct Question 16; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-16-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:16'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Some people think teaching only means an expert giving facts to someone who is learning.',
  'I strongly disagree with this narrow idea.',
  'I think a teacher’s main job is to make students want to learn and help them feel excited about it, because facts are only useful when students want to think about them, ask questions and use them outside class.',
  'First, wanting to learn turns facts into learning that stays with students.',
  'A teacher can give a lesson in which every fact is right, but if students are bored, do nothing or fear making mistakes, they will forget most of it after the exam.',
  'In contrast, a teacher who makes students excited helps them want to know more.',
  'This teacher does not just tell students what happened in the past or how a maths rule works; the teacher helps them understand why it is important.',
  'For example, a history teacher who links old wars to today’s ideas about fairness may get students to discuss, question what they believe and remember the lesson better.',
  'So making students want to learn is not just a nice extra; it keeps learning going.',
  'Teachers also help students build the ways of thinking, belief in themselves and daily habits they will use as adults.',
  'Students can now find facts in books, videos and websites, but they still need a teacher’s help to work steadily, keep trying after difficulty and dare to ask hard questions.',
  'A teacher who makes students want to learn can change how students think about their own ability to learn.',
  'For example, when a science teacher supports a student after an experiment goes wrong, the student may stop feeling ashamed and start seeing mistakes as a way to discover new things.',
  'The student may remember this lesson for longer than one chapter of a book.',
  'To sum up, teachers must explain facts clearly, but their more important job is to help students care about learning.',
  'Facts can be given to students, but they need help to gain confidence, curiosity and a reason to learn.',
];
const vocabulary=[
  [['Some people see teaching as','Some people think teaching only means','有些人把教學視為'],['simple transfer of facts','giving facts','單純傳遞事實'],['learner','someone who is learning','學習者']],
  [['strongly disagree','strongly disagree','強烈不同意'],['limited view','narrow idea','狹隘看法']],
  [['In my opinion','I think','在我看來'],['central role','main job','核心角色'],['motivate and inspire','make students want to learn and help them feel excited about it','激勵和啟發'],['engage with it','think about them','投入知識'],['question it','ask questions','質疑知識'],['beyond the classroom','outside class','課堂以外']],
  [['first reason','First','第一個原因'],['motivation','wanting to learn','學習動機'],['information','facts','資訊'],['real learning','learning that stays with students','真正學習']],
  [['deliver a perfectly accurate lesson','give a lesson in which every fact is right','講授完全準確的課'],['bored','bored','沉悶'],['passive','do nothing','被動'],['afraid of making mistakes','fear making mistakes','害怕犯錯'],['knowledge will evaporate after the examination','forget most of it after the exam','考後知識消散']],
  [['By contrast','In contrast','相比之下'],['inspiring teacher','teacher who makes students excited','能啟發學生的教師'],['creates curiosity','helps them want to know more','激發好奇心']],
  [['Such a teacher','This teacher','這樣的教師'],['does not merely tell','does not just tell','不只是告訴'],['what happened in history','what happened in the past','歷史發生甚麼'],['how a formula works','how a maths rule works','公式如何運作'],['why it matters','why it is important','為何重要']],
  [['For instance','For example','例如'],['connects past conflicts with modern ideas of justice','links old wars to today’s ideas about fairness','把過去衝突與現代正義連繫'],['debate','discuss','辯論'],['challenge assumptions','question what they believe','挑戰既有假設'],['remember the lesson more deeply','remember the lesson better','更深刻記住課堂']],
  [['In this sense','So','從這個意義說'],['inspiration','making students want to learn','啟發'],['not decorative','not just a nice extra','並非裝飾'],['engine that keeps learning alive','keeps learning going','維持學習的引擎']],
  [['Another reason','also','另一原因'],['shape attitudes, confidence and habits','help students build the ways of thinking, belief in themselves and daily habits','塑造態度自信習慣'],['carry into adulthood','use as adults','帶到成年階段']],
  [['Facts','facts','事實知識'],['digital platforms','websites','數碼平台'],['guidance','teacher’s help','引導'],['discipline','work steadily','自律'],['resilience','keep trying after difficulty','韌性'],['intellectual courage','dare to ask hard questions','求知與質疑的勇氣']],
  [['motivates students','makes students want to learn','激勵學生'],['change how they see themselves as learners','change how students think about their own ability to learn','改變學生的學習者自我觀']],
  [['encourages a weak student','supports a student','鼓勵能力較弱的學生'],['failed experiment','experiment goes wrong','失敗的實驗'],['humiliation','feeling ashamed','羞辱感'],['part of discovery','way to discover new things','探索一部分']],
  [['That lesson','this lesson','這一課'],['far more durable','remember this lesson for longer','更持久'],['single chapter in a textbook','one chapter of a book','教科書一章']],
  [['In conclusion','To sum up','總結來說'],['explain knowledge clearly','explain facts clearly','清楚解釋知識'],['deeper role','more important job','更深層角色'],['inspire students to care about learning','help students care about learning','啟發學生重視學習']],
  [['Information','Facts','資訊'],['handed over','given to students','被傳遞'],['confidence, curiosity and purpose','confidence, curiosity and a reason to learn','自信好奇心和目標感'],['have to be awakened','need help to gain','必須被喚醒']],
];
const chunkOverrides=[
  ['Some people see teaching as the simple transfer','of facts from an expert to a learner.'],
  ['I strongly disagree','with this limited view.'],
  ['In my opinion, a teacher’s central role','is to motivate and inspire students,','because knowledge only becomes valuable','when students are willing to engage with it,','question it and use it beyond the classroom.'],
  ['The first reason is','that motivation turns information into real learning.'],
  ['A teacher can deliver a perfectly accurate lesson,','but if students are bored, passive or afraid of making mistakes,','most of that knowledge will evaporate after the examination.'],
  ['By contrast, an inspiring teacher','creates curiosity.'],
  ['Such a teacher does not merely tell students','what happened in history or how a formula works;','they help students see why it matters.'],
  ['For instance, a history teacher','who connects past conflicts with modern ideas of justice','may lead students to debate, challenge assumptions','and remember the lesson more deeply.'],
  ['In this sense, inspiration is not decorative;','it is the engine that keeps learning alive.'],
  ['Another reason is that teachers shape','attitudes, confidence and habits','that students carry into adulthood.'],
  ['Facts can now be found in books, videos and digital platforms,','but a young person still needs guidance','to develop discipline, resilience and intellectual courage.'],
  ['A teacher who motivates students can change','how they see themselves as learners.'],
  ['For example, when a science teacher encourages a weak student','after a failed experiment,','the student may stop seeing failure as humiliation','and start seeing it as part of discovery.'],
  ['That lesson is far more durable','than a single chapter in a textbook.'],
  ['In conclusion, although teachers must explain knowledge clearly,','their deeper role is to inspire students','to care about learning.'],
  ['Information can be handed over,','but confidence, curiosity and purpose','have to be awakened.'],
];
const simpleChunkOverrides=[
  ['Some people think teaching only means','an expert giving facts','to someone who is learning.'],
  ['I strongly disagree','with this narrow idea.'],
  ['I think a teacher’s main job','is to make students want to learn','and help them feel excited about it,','because facts are only useful','when students want to think about them,','ask questions and use them outside class.'],
  ['First, wanting to learn turns facts','into learning that stays with students.'],
  ['A teacher can give a lesson','in which every fact is right,','but if students are bored, do nothing','or fear making mistakes,','they will forget most of it after the exam.'],
  ['In contrast, a teacher who makes students excited','helps them want to know more.'],
  ['This teacher does not just tell students','what happened in the past','or how a maths rule works;','the teacher helps them understand why it is important.'],
  ['For example, a history teacher who links old wars','to today’s ideas about fairness','may get students to discuss, question what they believe','and remember the lesson better.'],
  ['So making students want to learn','is not just a nice extra;','it keeps learning going.'],
  ['Teachers also help students build the ways of thinking,','belief in themselves and daily habits','they will use as adults.'],
  ['Students can now find facts in books, videos and websites,','but they still need a teacher’s help','to work steadily, keep trying after difficulty','and dare to ask hard questions.'],
  ['A teacher who makes students want to learn','can change how students think','about their own ability to learn.'],
  ['For example, when a science teacher supports a student','after an experiment goes wrong,','the student may stop feeling ashamed','and start seeing mistakes as a way to discover new things.'],
  ['The student may remember this lesson','for longer than one chapter of a book.'],
  ['To sum up, teachers must explain facts clearly,','but their more important job','is to help students care about learning.'],
  ['Facts can be given to students,','but they need help to gain confidence,','curiosity and a reason to learn.'],
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
  card('Some people see coaching as the simple transfer of rules from an expert to a player.','用 see ... as 說明待回應的狹窄角色看法',[1,3,9],
    fixed(0,'Some people see [教學] as [專家單向傳授事實].','先介紹只把教師當知識傳遞者的觀點，為作者反駁鋪路。','引言要公平概括一種將要評估的教師角色說法時。',['Some people see ', ' as '],['被討論的教學活動','被歸入的狹窄角色'])),
  card('I strongly disagree with this limited view of a coach.','用 I strongly disagree with 直接否定前句觀點',[0,2,14],
    fixed(1,'I strongly disagree with [只傳授知識的看法].','直接回應前句，明確指出作者不接受狹窄角色定位。','引言已提出他人觀點，下一句要清楚表態時。',['I strongly disagree with '],['被反對的狹窄看法'])),
  card('In my opinion, a coach’s central role is to inspire players, because knowledge only becomes valuable when they practise and use it outside training.','用 because ... when 解釋為何激勵令知識變有價值',[1,4,10],
    fixed(2,'In my opinion, [教師的核心角色] is to [激勵啟發], because knowledge only becomes valuable when [學生投入、質疑並應用].','提出教師應啟發學生的立場，並以學生主動運用知識為理由。','引言要回答教師主要角色，且解釋為何不能只講授事實時。',['In my opinion, ', ' is to ', ', because knowledge only becomes valuable when '],['被重新定位的教師角色','應發揮的激勵作用','學生須採取的主動學習行動'])),
  card('The first reason is that curiosity turns a list of rules into lasting learning.','用 turns ... into ... 說明動機如何改變知識的作用',[2,5,8],
    fixed(3,'The first reason is that [動機] turns [資訊] into [真正學習].','第一主體段先給機制：學生願意學，資訊才會留下來。','開始解釋激勵為何重要，需先講出知識轉為學習的過程時。',['The first reason is that ', ' turns ', ' into '],['推動學習的動機','原本只是資訊的內容','形成的真正學習'])),
  card('A coach can deliver correct advice, but if players are bored or afraid of mistakes, most of that knowledge will be forgotten after the match.','用 ... but if ... 從準確教學推到學生不投入的後果',[3,6,13],
    fixed(4,'[教師] can deliver [準確課堂], but if [學生沉悶、被動或怕錯], most of that knowledge will [考後消散].','承認課可講得準確，卻說學生不投入時知識仍難持久。','要解釋傳遞知識為何不足，須指出學生的學習狀態如何影響記憶時。',[' can deliver ', ', but if ', ', most of that knowledge will '],['能講課的教師','準確的授課內容','阻礙吸收的學生狀態','之後的遺忘結果'])),
  card('By contrast, an encouraging coach creates curiosity.','用 By contrast 對比學生被動與有啟發的課堂',[3,4,6],
    fixed(5,'By contrast, [能啟發的教師] creates [好奇心].','轉向相反的教師做法：不只傳授資訊，還讓學生想知道更多。','已描述學生無聊、怕錯的情況，接着要引出激勵的正面作用時。',['By contrast, ', ' creates '],['形成對比的教師','由他激發的學習意願'])),
  card('Such a teacher does not merely tell students the rules; they help students see why the rules matter.','用 not merely ...; they help ... 對照告知內容與說明意義',[4,5,7],
    fixed(6,'Such a teacher does not merely tell students [知識內容]; they help students see [為何重要].','具體說明啟發式教學：不只說歷史事實或公式，還說它的意義。','要把「啟發好奇心」落到教師實際怎樣講課時。',['Such a teacher does not merely tell students ', '; they help students see '],['可直接傳遞的內容','學生需要理解的意義'])),
  card('For instance, a physical education teacher who connects practice drills with real matches may lead students to ask questions, try ideas and remember the lesson.','用 connects ... may lead ... to 把內容連到學生主動反應',[5,6,8],
    fixed(7,'For instance, [歷史教師] who connects [過去衝突與現代正義] may lead students to [討論、質疑與深記].','用歷史課說明把舊事與現實連結，能引起辯論與長久記憶。','需以具體課堂例子展示教師如何讓學生探究而不只聽講時。',['For instance, ', ' who connects ', ' may lead students to '],['被舉例的教師','連到今日的教材','學生因此作出的主動學習'])),
  card('In this sense, curiosity is not decorative; it is the engine that keeps practice alive.','用 not decorative; it is the engine 把啟發定位為學習動力',[3,6,7],
    fixed(8,'In this sense, [啟發] is not [裝飾]; it is [維持學習的引擎].','用引擎比喻收束第一段：啟發不是課堂點綴，而是持續學習的力量。','完成例子後，要澄清激勵是核心機制而非可有可無的附加物時。',['In this sense, ', ' is not ', '; it is '],['被重新評估的啟發','被排除的點綴定位','維持學習的核心作用'])),
  card('Another reason is that coaches shape the habits and confidence that students carry into adulthood.','用 Another reason is that 加入影響成年習慣的第二個理由',[3,8,11],
    fixed(9,'Another reason is that [教師] shape [態度、自信與習慣] that students carry into adulthood.','第二段轉向比一課知識更持久的自我觀與行為習慣。','已說啟發促進當下學習，還要補上長期人格和習慣影響時。',['Another reason is that ', ' shape ', ' that students carry into adulthood.'],['長期影響學生的人','被帶入成年階段的特質'])),
  card('Facts can now be found in online guides, but a young player still needs guidance to develop discipline and courage.','用 Facts can ... but ... needs guidance 區分資訊可取與人仍需引導',[2,9,15],
    fixed(10,'Facts can now be found in [資訊來源], but [年輕人] still needs guidance to develop [自律、韌性和思考勇氣].','說明書、影片和平台能給事實，教師仍須培養行為和思考能力。','要回應「已有網上資訊，為何仍需教師」時。',['Facts can now be found in ', ', but ', ' still needs guidance to develop '],['可查知識的渠道','仍需人際引導的年輕人','需逐步培養的特質'])),
  card('A teacher who encourages beginners can change how they see themselves as learners.','用 who motivates ... can change how ... 連教師激勵與學生自我觀',[5,9,12],
    fixed(11,'A teacher who [激勵學生] can change how [他們看待自己作為學習者].','教師不只幫學生做一份習題，還能改變他們對自己能否學會的看法。','要說明激勵如何影響學生長期的學習信心時。',['A teacher who ', ' can change how '],['教師持續採取的激勵','學生對自己學習能力的看法'])),
  card('For example, when a sports teacher supports a struggling student after a missed shot, the student may stop seeing failure as shame and start seeing it as practice.','用 stop seeing ... and start seeing ... 呈現失敗意義的改變',[4,11,13],
    fixed(12,'For example, when [教師鼓勵失敗學生] after [實驗失敗], the student may stop seeing [失敗為羞辱] and start seeing [失敗為探索].','用科學實驗失敗的個案說明鼓勵如何改變學生對錯誤的理解。','要以一個可觀察事件證明激勵能增加自信和韌性時。',['For example, when ', ' after ', ', the student may stop seeing ', ' and start seeing '],['採取鼓勵的教師及學生','引發挫折的事件','需要捨棄的羞辱看法','較有建設性的探索看法'])),
  card('That lesson is far more durable than a single instruction in a coaching manual.','用 far more durable than 比較自我觀與課本內容的持久性',[4,11,12],
    fixed(13,'That lesson is far more durable than [教科書單一章節].','指出學生學會面對失敗的意義，比記住一章內容更可能長久。','完成失敗個案後，要點出哪種學習成果更持久時。',['That lesson is far more durable than '],['作比較的短期教材內容'])),
  card('In conclusion, although coaches must teach the rules clearly, their deeper role is to help players care about learning.','用 although ... deeper role ... 承認教知識並突出更深層目的',[2,10,15],
    fixed(14,'In conclusion, although [教師須清楚解釋知識], their deeper role is to [啟發重視學習].','結論承認講授知識必要，仍以激勵和啟發作教師的更深層角色。','結論要平衡兩種角色，回答題目給的對立說法時。',['In conclusion, although ', ', their deeper role is to '],['仍然必要的知識教學','更深層的啟發目的'])),
  card('Information can be handed over, but confidence and curiosity have to be awakened.','用 can be handed over, but ... have to be awakened 對照可傳資訊與須喚醒的內在特質',[2,10,14],
    fixed(15,'Information can be handed over, but [自信、好奇與目標感] have to be awakened.','最後以對照總結：資訊可交付，學習的內在動力需要教師激發。','全篇收束時，要用簡短對比留下教師核心價值時。',['Information can be handed over, but ', ' have to be awakened.'],['不能只靠傳遞資訊得到的內在特質'])),
];
const wrongReasons=[
  ['I strongly disagree 是作者表態，沒有先描述知識傳遞者觀點。','動機轉化資訊是反對狹窄觀點的理由，沒有引言待評估說法。','教師長期塑造態度是另一理由，沒有傳事實的題目背景。'],
  ['see teaching as 只是介紹他人觀點，沒有明確反對。','作者核心角色句提出另一立場，沒有先直接否定前述看法。','結論 although 平衡知識與啟發，沒有引言短句的直接反對。'],
  ['I strongly disagree 只有立場，沒有知識何時變有價值的原因。','準確課但學生無聊的條件句是正文例證，沒有引言總主張。','網上可找事實是另一段的理由，沒有教師核心角色的定位。'],
  ['核心角色句提出全文立場，沒有資訊怎樣變學習的機制。','By contrast 轉入啟發教師，沒有先交代動機的轉化作用。','引擎比喻總結動機重要，沒有 turns ... into 的直接因果。'],
  ['動機轉學習是總機制，沒有無聊或怕錯如何造成遺忘。','教師解釋意義是正面做法，沒有準確授課仍可能失敗的條件。','持久課堂結論比較兩種收穫，沒有考試後知識消散。'],
  ['動機總述沒有與前述無聊被動情況形成即時對比。','準確課但學生無聊是前一情況，沒有 By contrast 的正面教師。','教師解釋意義是下一句行動，沒有先說好奇心被激發。'],
  ['無聊使知識消散說失效條件，沒有教師如何說明知識意義。','啟發教師創好奇心只命名效果，沒有 not merely ... they help 的具體做法。','歷史課例子是後面的示範，沒有先概括教師不只告知事實。'],
  ['啟發教師創好奇心是總說，沒有歷史課連接舊事與現代正義的例子。','not merely ... help 說一般做法，沒有學生辯論和記憶的具體結果。','引擎比喻總結啟發必要，沒有現代正義課如何引導探究。'],
  ['動機轉資訊成學習是抽象機制，沒有裝飾和引擎的定位。','教師解釋意義是教學行動，沒有總結啟發不是點綴。','歷史課示範產生好奇，沒有段末把啟發定位為核心動力。'],
  ['動機轉資訊是第一個理由，沒有成年階段的態度與習慣。','引擎比喻收束第一段，沒有 Another reason 的第二段轉入。','教師改變學生自我觀是第二理由的具體效果，沒有先概括長期特質。'],
  ['核心角色句說知識何時有價值，沒有網上可查事實與教師引導的對比。','長期塑造態度是總述，沒有具體自律韌性與思考勇氣。','資訊可傳但自信須喚醒是結尾比喻，沒有當下的資訊來源清單。'],
  ['啟發教師激發好奇心是課堂效果，沒有學生如何看待自己的能力。','成年習慣總述沒有教師激勵改變自我觀的直接作用。','科學實驗例子展示具體轉變，沒有先總說學生自我觀可變。'],
  ['準確授課後遺忘說學生不投入的後果，沒有失敗由羞辱變探索。','教師改變自我觀是總述，沒有科學實驗與鼓勵的個案。','更持久一課是個案後的總結，沒有 stop ... start 的認知轉變。'],
  ['準確課後遺忘是知識難留的對比，沒有失敗個案更持久。','教師改變自我觀是總述，沒有和教科書一章作比較。','科學實驗例子呈現轉變，沒有再點出效果的持久性。'],
  ['核心角色句在引言表態，沒有結論承認講知識仍必要。','網上資料與引導的對比是正文理由，沒有結論的 although 平衡。','資訊與自信的比喻是最後一句，沒有清楚說教師更深層角色。'],
  ['引言核心角色句解釋知識何時有價值，沒有可傳資訊與須喚醒特質的濃縮。','網上可找事實說資訊來源，沒有最終喚醒自信好奇的比喻。','結論前句平衡解釋與啟發，沒有最後一句的 handed over 對照。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求作者評估教師的哪兩種角色？',[
    '激勵啟發學生與傳授知識，並判斷教師的核心工作',
    '教師應得多少薪酬與學生應讀哪所大學',
    '歷史科是否比科學重要與每班應有多少人',
    '只問網上平台收費，毋須談教師如何教學生',
  ],'文章要選出教師更核心的角色，並說明知識教學與激勵如何配合。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '學生若無聊或怕錯，準確知識也易忘；啟發好奇能使學習持久',
    '教師還能塑造自信、韌性與習慣，使學生不再把失敗只當羞辱',
    '有了影片和網站，教師便不用再指導學生如何學習',
    '教師只須讀完課本，不用關注學生會否應用知識',
  ],correct:[0,1],why:'第一段說動機如何令知識留下；第二段說教師怎樣塑造長期自我觀。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言定立核心角色','反對教師只是傳事實，主張激勵啟發讓學生主動使用知識。'],
  ['動機使學習持久','準確課若讓學生無聊仍易忘；歷史例子展示好奇與探究。'],
  ['教師塑造自我觀','資訊可上網查，教師卻能培養韌性和把失敗視為探索。'],
  ['結論平衡','承認知識須清楚講授，指出自信、好奇與目標需被喚醒。'],
],'先否定單純傳事實 → 展示動機作用 → 展示長期態度轉變 → 平衡收束。')];
const evidence=[
  quiz('為何「完全準確的課」仍可能未形成真正學習？',[
    '學生若沉悶、被動或怕錯，考後可能忘掉大部分知識',
    '只要教師說對每個事實，學生便必然終身記住',
    '只有課本印刷不清晰時，學生才可能忘記內容',
    '作者認為所有準確知識都不值得學生再接觸',
  ],'原文用 but if 指出學生如何參與，會改變準確知識能否留下。'),
  quiz('歷史教師把過去衝突連到現代正義，意在產生甚麼？',[
    '學生辯論、質疑既有看法，並更深地記住課堂',
    '學生只背事件日期，不用討論事件與現在的關係',
    '學生每次必須認同教師，避免提出不同問題',
    '學生只做最短的測驗，不必理解歷史為何重要',
  ],'教師解釋知識為何與今天相關，能引起主動探究。'),
  quiz('「啟發不是裝飾，而是引擎」代表甚麼？',[
    '激勵是維持學習的核心力量，而非課堂可有可無的點綴',
    '課堂應只作裝飾，完全不用說明任何歷史或公式',
    '學生只要看到一部真正引擎，便自然明白所有知識',
    '啟發只為讓課堂熱鬧，與學生記憶和應用無關',
  ],'引擎是比喻：好奇心讓學生持續投入並使用所學。'),
  quiz('書本、影片和平台已提供事實，教師仍為何重要？',[
    '學生仍需人引導，才能培養自律、韌性與敢於思考的勇氣',
    '教師應停止所有引導，只把搜尋結果貼在課室牆上',
    '平台已能自動了解每名學生面對失敗時的感受',
    '只要資訊足夠，學生就毋須練習或學會問問題',
  ],'原文把可取得的資訊與仍需培養的學習特質分開。'),
  quiz('科學實驗失敗的例子要展示哪種改變？',[
    '教師鼓勵使學生由羞辱感轉向把失敗視作探索一部分',
    '教師只要重新講一遍正確答案，學生便不再怕犯錯',
    '學生一次失敗便應放棄科學，以免再遇到難題',
    '學生必須把所有實驗結果視為成功，不需檢查錯誤',
  ],'stop seeing ... start seeing 描寫學生如何重新理解失敗。'),
  quiz('結論為何仍說教師須清楚解釋知識？',[
    '文章承認知識教學必要，但把啟發重視學習列為更深層角色',
    '作者完全反對傳授知識，因此不准教師講解任何內容',
    '知識一旦講清楚，學生便不再需要自信或好奇心',
    '教師角色只在考試當日出現，平日不必指導學生',
  ],'although 承認一方需要，仍把主張重心放在更深層作用。'),
];
const logic=[
  sequence('第一主體段：動機讓資訊變成真正學習',[
    ['提出機制','學生有動機，資訊才可能成為持久的學習。'],
    ['反面條件','即使教師講得準確，無聊、被動與怕錯仍會令知識消散。'],
    ['正面轉折','啟發式教師激起好奇，幫學生明白知識為何重要。'],
    ['歷史課例子','把過去衝突連到現代正義，引出辯論與質疑。'],
    ['引擎總結','啟發不是點綴，而是維持學習的動力。'],
  ],'準確知識要透過學生投入和探究，才能留下並延伸到課外。'),
  sequence('第二主體段：教師塑造面對學習的態度',[
    ['指出長期作用','教師塑造學生會帶入成年的態度、自信和習慣。'],
    ['區分資訊與引導','書與平台能給事實，教師仍能培養自律和思考勇氣。'],
    ['改變學生自我觀','激勵讓學生重新看待自己能否學會。'],
    ['科學實驗個案','失敗後的鼓勵使羞辱感轉成探索意識。'],
    ['比較持久程度','這種對學習的認識，比課本一章更可能長留。'],
  ],'教師的作用延伸到學生遇錯誤時如何想、如何繼續學。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('駕駛導師把交通規則講得完全準確，學員卻不敢問問題，也不知規則何時有用。','哪項最能轉用範文的知識與動機關係？',[
    '用真實路況引導提問，讓學員把規則用於判斷',
    '只增加背誦次數，不讓學員討論或應用交通規則',
    '只要講義沒有錯誤，就假設學員已懂所有路況',
    '因學員怕錯，就停止任何駕駛練習和指導',
  ],[
    '範文說準確內容仍須學生願意參與、提問和實際使用。',
    '只背誦沒有補上理解與應用。',
    '教材準確不能自動證明學員已學會。',
    '怕錯更需要安全的引導和練習。',
  ],[2,3,4,6],'範文的中心主張是知識須有人願意投入、質疑並用到課外，才真正有價值。'),
  transfer('歷史老師只要求背戰爭日期；另一老師讓學生比較舊衝突與今天的公平問題。','哪項最符合範文的歷史課機制？',[
    '把歷史連到當下問題，促使學生辯論並記得更深',
    '只背日期已能保證學生明白事件為何重要',
    '只要提出公平問題，就不用再學任何歷史事實',
    '要求學生只同意教師答案，避免質疑與討論',
  ],[
    '原文歷史例子正以舊衝突連現代正義引起主動探究。',
    '背誦本身沒有提供意義或現實連結。',
    '範文沒有取消事實，而是加上為何重要。',
    '討論與質疑是原文明確提出的學生反應。',
  ],[6,7],'範文的啟發式歷史老師連接過去與現代，引導學生辯論、質疑和深記。'),
  transfer('學生在實驗出錯後說「我太笨，永遠學不會」，老師準備回應。','哪項最能轉用範文的科學個案？',[
    '鼓勵再試，讓學生把錯誤當探索而非羞辱',
    '只說「錯就是錯」，讓學生以後不再嘗試',
    '假裝實驗沒有失敗，避免談任何出錯原因',
    '只重讀教科書定義，不理學生對自己的看法',
  ],[
    '範文強調教師鼓勵可改變學生對失敗與自身能力的理解。',
    '羞辱只會加深學生放棄的傾向。',
    '把錯誤當探索仍要面對發生了甚麼。',
    '此時問題不只是事實，還有學生的學習自我觀。',
  ],[11,12,13],'範文說鼓勵讓學生停止把失敗視為羞辱，開始把它當成探索的一部分。'),
  transfer('網上課程已有大量知識影片，校方考慮完全取消教師輔導。','哪項最能回應範文對教師長期角色的主張？',[
    '影片可供事實，教師仍可培養自律、韌性與提問勇氣',
    '影片數量多，就自動能讓學生不怕錯且持續學習',
    '只要取消教師，學生便必然有更強的學習習慣',
    '網上資訊全部沒有價值，所以不應讓學生觀看',
  ],[
    '原文承認平台提供事實，卻說學生仍需引導形成長期特質。',
    '影片不能自動理解每個學生怕錯的情況。',
    '缺引導未必能形成自律和韌性。',
    '範文沒有否定數碼資訊的用途。',
  ],[9,10,15],'範文分開資訊可從數碼平台找到，與自律、韌性和思考勇氣仍需教師引導。'),
  transfer('體育教練只給球員技術動作清單，球員從不明白練習與比賽有何關係。','哪項最像範文的啟發式做法？',[
    '連結技術與真實比賽，讓球員知道為何練並願意試',
    '只把動作清單印得更長，不問球員會否使用',
    '只批評球員缺乏興趣，完全不解釋練習意義',
    '取消所有技術訓練，只要求球員在比賽中即興',
  ],[
    '範文說好教師不只講內容，還幫學生看見它為何重要。',
    '清單加長沒有建立連結與主動學習。',
    '學生無法明白意義時，教練可改教法。',
    '啟發與知識內容應配合，並非二選一。',
  ],[5,6,7],'範文把知識與現實意義連結，帶出好奇、提問和應用。'),
  transfer('老師讓學生安心提出錯誤答案，再一起查原因；學生開始主動問問題。','哪項最能解釋此改變？',[
    '不再怕錯令學生更願投入，也較能記住所學',
    '容許提問會令所有正確知識立即失去價值',
    '只要學生提問，教師便不用再清楚解釋內容',
    '學生主動問問題與好奇心或學習動機完全無關',
  ],[
    '範文把怕錯與知識消散對照好奇、提問和深記。',
    '提問可幫助檢查與理解知識。',
    '結論仍承認教師須清楚解釋知識。',
    '主動提問正是學習動機的可見表現。',
  ],[3,4,5,7],'範文說怕錯可令學生被動；能啟發的教師則創造好奇和主動探究。'),
  transfer('學校要比較教師的影響，一人課堂事實準確，另一人也能讓怕錯的學生持續嘗試。','哪項評估最符合範文？',[
    '保留知識準確的要求，並看教師是否建立信心',
    '只看教師讀完幾頁課本，完全不看學生是否願意學',
    '只看課堂氣氛熱鬧，毋須查所教內容是否準確',
    '因一名學生曾怕錯，就判教師傳授的知識全無用處',
  ],[
    '範文承認知識須講清楚，仍把長期自信和學習意願放在核心。',
    '進度不能單獨顯示學生學會或敢於繼續。',
    '啟發不取代準確內容。',
    '作者沒有貶低正確知識。',
  ],[2,4,11,14],'範文把準確知識和激勵配合，指出教師更深層工作是讓學生重視學習。'),
  transfer('青年從一本書記住一條公式，也因老師鼓勵而開始相信自己能處理難題。','哪種收穫較貼近範文說的持久一課？',[
    '面對難題仍願意嘗試的自我觀，可延續到後來學習',
    '只要記住一條公式，自信與好奇心便完全不重要',
    '學生應停止使用公式，因所有課本內容都不持久',
    '遇到難題就把錯誤當羞辱，避免再作任何嘗試',
  ],[
    '原文比較失敗後形成的學習態度與教科書單一章節的持久性。',
    '公式有用，但學生自我觀也影響將來。',
    '範文沒有要求放棄內容知識。',
    '這與教師鼓勵後的改變相反。',
  ],[11,12,13],'範文說學生不再把失敗當羞辱的那一課，比單一教科書章節更持久。'),
  transfer('有人主張教師只須把資料交給學生；學生是否願意學，應完全由學生自行處理。','哪項最能反駁此說法？',[
    '資訊可交付，但好奇、自信與目標仍需要教師協助建立',
    '教師只負責學生情緒，完全不需講解任何知識',
    '只要資料足夠，學生必然會主動提問和學到深處',
    '學生若一時缺興趣，教師便應停止教授該課內容',
  ],[
    '範文結尾以可交付的資訊對比須被喚醒的內在特質。',
    '原文仍要求教師清楚講解。',
    '資料本身不保證學生願意投入。',
    '缺興趣時更需要啟發，而非取消教學。',
  ],[0,2,14,15],'範文認為教師不能只傳遞事實；自信、好奇與目標感要在引導中形成。'),
  transfer('校方總結教師角色，既承認知識講解，也想說明學生為何願意持續學習。','哪項最完整對應範文結論？',[
    '教師要清楚講知識，更要啟發學生重視學習',
    '教師只要投影片準確，就已完成全部教育工作',
    '教師只要氣氛熱鬧，就不用解釋任何事實',
    '教師只須在考試後鼓勵，平日不用理會學習態度',
  ],[
    'although 平衡知識必要性與啟發這項更深層角色。',
    '這忽略學生能否投入和應用。',
    '範文承認知識講解仍是必要工作。',
    '動機和態度在學習過程中已起作用。',
  ],[2,10,14,15],'範文結論承認教師須清楚解釋知識，仍以啟發學生重視學習為更深層角色。'),
];
const editorialWrongChoices=[
  ['先增加交通規則例子，提問留待學員已熟練後再安排','讓學員背熟規則再考核，現場判斷交給日後路試訓練','先減少難題建立信心，暫時不連到真實路況的判斷'],
  ['比較舊戰爭與今日公平，日期背景則可暫時略過','先講日期，再用教師結論代替學生之間的辯論','以當下公平問題取代歷史材料，使討論更貼近生活'],
  ['鼓勵學生再試，但不討論失敗原因以保護其信心','先講解課本定義，再用分數證明學生並非太笨','由老師重做實驗，學生等有正確步驟後才參與'],
  ['影片能提供事實，輔導可留給課外志願導師負責','先減少教師輔導，觀察自律習慣會否自行形成','教師可協助提問，講解事實則由影片全面取代'],
  ['連結技術與比賽，球員動機可待技術熟練後再談','把動作清單加上比賽照片，主要仍由球員自行領會','先讓球員參賽增加興趣，技術要點留待賽後補上'],
  ['允許錯誤可減少壓力，但知識記憶仍只靠重複測驗','學生開始提問，代表老師可縮減對錯誤原因的討論','課堂氣氛較安全，卻難以說明學習投入為何增加'],
  ['知識準確是核心，信心與持續嘗試可留到考試後評估','學生願意嘗試很重要，事實講解可交由課本自行完成','先比較兩位教師的授課速度，再推斷誰較有影響力'],
  ['公式可應付難題，信心則只在學生忘記公式時才重要','老師鼓勵很有用，但應以記住公式作唯一持久成果','面對難題願意嘗試值得重視，卻不必再學具體知識'],
  ['教師可激發好奇，學生信心則交由家庭自行建立','資料要準確，學習目標可待學生選科後再討論','教師鼓勵學生提問，但學生缺興趣時仍只加資料'],
  ['教師要清楚講知識，啟發興趣可留給課外活動','教師能啟發學習，事實講解可留待考前集中處理','同時講知識與鼓勵學生，但只以考試分數衡量效果'],
];
const editorialWrongFeedback=[
  ['例子有用，學生現在不敢問，提問不宜等熟練後才開始。','只靠背誦會重複知識與應用脫節的問題。','簡化可減壓，但真實路況才讓規則變得有意義。'],
  ['連到今天有幫助，仍要有歷史事實作比較基礎。','教師結論不能代替學生主動思考與討論。','只談現在，失去歷史課的材料與時間對照。'],
  ['保護信心也要把錯誤變成可學習的線索。','分數不能直接消除學生對失敗的羞辱感。','只讓老師重做，學生失去探索和再試的機會。'],
  ['志願者可補充，教師仍有持續培養習慣的角色。','自律未必自行形成，正是範文強調的教學作用。','影片可提供資訊，但教師也要解釋並引導應用。'],
  ['技術與比賽的關聯應現在說清，才能提升練習動機。','照片未必說明動作在真實情境中的用途。','先參賽可有體驗，但仍需理解技術與目的。'],
  ['減少怕錯可提高參與，不只是減少壓力。','查錯因正是讓提問帶來學習的環節。','安全感使學生敢問與投入，因果不能停在氣氛。'],
  ['知識須準確，怕錯者的信心亦需在學習中建立。','課本可供事實，但教師仍須清楚講解和引導。','授課速度不能顯示學生是否願意繼續嘗試。'],
  ['範文看重遇到未知難題時仍願學習，不只是已有公式。','一條公式有用，但不能代表全部長期學習態度。','鼓勵不要求放棄具體知識。'],
  ['家庭可協助，教師在課堂仍有建立信心的責任。','學習目的不必等選科才說明。','只加資料沒有處理學生不願投入的原因。'],
  ['課外活動可補充，課堂教師也要啟發學習。','動機和知識應並行，不宜延後事實講解。','分數有用，卻不能單獨反映持續學習的態度。'],
];
transferTasks.forEach((item,index)=>{item.options=[item.options[0],...editorialWrongChoices[index]];item.explanations=[item.explanations[0],...editorialWrongFeedback[index]];item.why=item.explanations[0]});
export default {
  key:'direct-question:16',
  meta:{topic:'教師的知識教學與激勵角色',summary:'教師須清楚講知識，更要喚起學生的好奇、自信及持續學習的意願。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
