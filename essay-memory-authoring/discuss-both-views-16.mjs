// Full source-specific memorisation support for Discuss Both Views 16.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-16-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:16'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People often talk about school money because schools must choose whether to spend the money they have on new equipment or on people who teach.',
  'Some people say schools need to spend more on computers and online tools, while others think teachers should get more money and support.',
  'I think computers can help, but schools should spend on teachers first because good teaching still depends most on them.',
  'People who want schools to spend more on technology say online tools can help more people learn and save time.',
  'Computers help students find information fast, practise on their own and learn to use digital tools needed in most jobs.',
  'For example, a student who can use learning programmes online can go over hard topics at home and learn at a speed that works for them.',
  'In this way, technology can give more students a chance to learn and help them live in a world where knowing how to use digital tools is necessary.',
  'But spending more money on teachers matters much more because even very good technology cannot take the place of expert help, care for students and good decisions in class.',
  'A good teacher does more than give information; they explain hard ideas, see when students do not understand, change lessons and help students who might otherwise stop trying.',
  'For example, a computer can show that an answer is wrong, but a teacher can work out why and show the student how to get better.',
  'Without teachers who have good training and fair pay, costly computers may do little more than draw students away from learning.',
  'So I think schools should spend more money on teachers.',
  'Higher pay can bring skilled people who have finished college into teaching, while regular training can help current teachers use both older and newer ways to teach better.',
  'If teachers get the help they need, they can also make computers more useful during lessons.',
  'To sum up, technology has an important place in schools, but teachers should get more of the school money.',
  'Computers can help students learn, but teachers help them understand, feel sure of themselves and keep improving over the years.',
];
const vocabulary=[
  [['Education budgets','school money','教育預算'],['debated','talk about','被討論'],['limited funds','money they have','有限資金'],['modern equipment','new equipment','現代設備'],['human instruction','people who teach','教師教學']],
  [['greater investment in technology','spend more on computers and online tools','加大科技投資'],['digital platforms','online tools','數碼平台'],['financial support','money and support','資金支持']],
  [['In my view','I think','在我看來'],['technology is useful','computers can help','科技有用'],['prioritise spending on teachers','spend on teachers first','優先投資教師'],['central force behind effective learning','good teaching still depends most on them','有效學習的核心']],
  [['greater investment in technology','spend more on technology','加大科技投資'],['digital tools','online tools','數碼工具'],['more efficient','save time','更有效率'],['accessible','help more people learn','更易取得']],
  [['Computers allow students','Computers help students','電腦使學生能夠'],['research information quickly','find information fast','快速搜尋資料'],['practise independently','practise on their own','獨立練習'],['digital skills','use digital tools','數碼技能'],['most workplaces','most jobs','多數職場']],
  [['For example','For example','例如'],['access to online learning software','use learning programmes online','使用網上學習軟件'],['review difficult topics','go over hard topics','複習難題'],['at a pace that suits them','at a speed that works for them','按自己的進度']],
  [['In this sense','In this way','從這意義'],['widen learning opportunities','give more students a chance to learn','擴大學習機會'],['prepare students','help them live','幫助學生準備'],['digital literacy','knowing how to use digital tools','數碼素養'],['no longer optional','necessary','已成必備']],
  [['However','But','然而'],['far more important','matters much more','重要得多'],['best technology','very good technology','最好的科技'],['replace','take the place of','取代'],['professional guidance','expert help','專業指導'],['emotional support','care for students','情緒支持'],['classroom judgment','good decisions in class','課堂判斷']],
  [['skilled teacher','good teacher','有能力教師'],['not merely deliver information','does more than give information','不只傳遞資訊'],['notice when students are confused','see when students do not understand','察覺困惑'],['adjust lessons','change lessons','調整課堂'],['motivate learners','help students','鼓勵學生'],['give up','stop trying','放棄']],
  [['For instance','For example','例如'],['computer programme','computer','電腦程式'],['mark an answer as wrong','show that an answer is wrong','標出答案錯誤'],['identify why the mistake was made','work out why','找出錯因'],['how to improve','how to get better','如何改善']],
  [['Without','Without','如果沒有'],['well-trained','good training','受良好訓練'],['well-paid','fair pay','獲合理薪酬'],['expensive devices','costly computers','昂貴設備'],['little more than shiny distractions','do little more than draw students away from learning','華而不實的干擾']],
  [['therefore','So','因此'],['invest more heavily','spend more money','加大投資'],['teachers','teachers','教師']],
  [['Better salaries','Higher pay','較好薪酬'],['attract talented graduates','bring skilled people who have finished college','吸引人才'],['the profession','teaching','教師行業'],['regular training','regular training','定期培訓'],['existing teachers','current teachers','現有教師'],['traditional and digital methods','older and newer ways','傳統與數碼方法']],
  [['If teachers are supported properly','If teachers get the help they need','如果教師獲適當支持'],['technology more meaningful','computers more useful','使科技更有意義'],['classroom','lessons','課堂']],
  [['In conclusion','To sum up','總結'],['valuable role','important place','重要作用'],['larger share','more of','較大部分'],['school funding','school money','學校資金']],
  [['assist learning','help students learn','輔助學習'],['shape understanding','help them understand','建立理解'],['confidence','feel sure of themselves','信心'],['long-term academic growth','keep improving over the years','長遠學業發展']],
];
const chunkOverrides=[
  ['Education budgets are often debated because schools','must decide whether limited funds should be directed','towards modern equipment or human instruction.'],
  ['Some argue that greater investment in technology,','such as computers and digital platforms, is essential,','while others believe that teachers deserve more financial support.'],
  ['In my view, although technology is useful,','schools should prioritise spending on teachers','because they remain the central force behind effective learning.'],
  ['Those who support greater investment in technology','argue that digital tools can make education','more efficient and accessible.'],
  ['Computers allow students to research information quickly,','practise independently, and develop digital skills','that are now required in most workplaces.'],
  ['For example, a student who has access','to online learning software can review difficult topics','at home and learn at a pace that suits them.'],
  ['In this sense, technology can widen learning opportunities','and prepare students for a world in which','digital literacy is no longer optional.'],
  ['However, spending more money on teachers is far more important','because even the best technology cannot replace','professional guidance, emotional support, and classroom judgment.'],
  ['A skilled teacher does not merely deliver information;','they explain difficult ideas, notice when students are confused,','adjust lessons, and motivate learners','who may otherwise give up.'],
  ['For instance, a computer programme can mark an answer as wrong,','but a teacher can identify why the mistake was made','and show the student how to improve.'],
  ['Without well-trained and well-paid teachers,','expensive devices may become little more than shiny distractions.'],
  ['I therefore believe that schools','should invest more heavily in teachers.'],
  ['Better salaries can attract talented graduates into the profession,','while regular training can help existing teachers','use both traditional and digital methods more effectively.'],
  ['If teachers are supported properly,','they can also make technology more meaningful','in the classroom.'],
  ['In conclusion, technology has a valuable role','in modern education, but teachers should receive','the larger share of school funding.'],
  ['Computers can assist learning,','but teachers shape understanding, confidence,','and long-term academic growth.'],
];
const simpleChunkOverrides=[
  ['People often talk about school money because schools','must choose whether to spend the money they have','on new equipment or on people who teach.'],
  ['Some people say schools need to spend more','on computers and online tools, while others think','teachers should get more money and support.'],
  ['I think computers can help,','but schools should spend on teachers first','because good teaching still depends most on them.'],
  ['People who want schools to spend more on technology','say online tools can help more people learn and save time.'],
  ['Computers help students find information fast,','practise on their own and learn to use digital tools','needed in most jobs.'],
  ['For example, a student who can use learning programmes online','can go over hard topics at home','and learn at a speed that works for them.'],
  ['In this way, technology can give more students','a chance to learn and help them live in a world','where knowing how to use digital tools is necessary.'],
  ['But spending more money on teachers matters much more','because even very good technology cannot take the place','of expert help, care for students and good decisions in class.'],
  ['A good teacher does more than give information;','they explain hard ideas, see when students do not understand,','change lessons and help students who might otherwise stop trying.'],
  ['For example, a computer can show that an answer is wrong,','but a teacher can work out why','and show the student how to get better.'],
  ['Without teachers who have good training and fair pay,','costly computers may do little more','than draw students away from learning.'],
  ['So I think schools should','spend more money on teachers.'],
  ['Higher pay can bring skilled people who have finished college','into teaching, while regular training can help current teachers','use both older and newer ways to teach better.'],
  ['If teachers get the help they need,','they can also make computers more useful during lessons.'],
  ['To sum up, technology has an important place in schools,','but teachers should get more of the school money.'],
  ['Computers can help students learn,','but teachers help them understand, feel sure of themselves','and keep improving over the years.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Health budgets are often debated because clinics must decide whether limited funds should be directed towards new machines or trained staff.','以 because ... whether ... or ... 定義有限資金取捨',[1,2,7],fixed(0,'[教育預算] are often debated because [學校] must decide whether [有限資金] should be directed towards [設備] or [教師教學].','開篇指出預算有限，須在設備和教師間取捨。','要說明資源爭議是因為某機構須在兩個用途間選擇時。',[' are often debated because ', ' must decide whether ', ' should be directed towards ', ' or '],['有爭議的資源','需要決策的機構','受限制的資源','第一用途','第二用途'])),
  card('Some argue that more medical technology, such as scanning machines, is essential, while others believe that nurses deserve more funding.','以 Some argue ... while others ... 並列兩種資金主張',[0,3,11],fixed(1,'Some argue that [更多科技投資], such as [電腦數碼平台], is essential, while others believe that [教師] deserve [更多資金支持].','引言公平交代投資科技與投資教師的分歧。','題目要求比較兩種資源用途，需先分別說兩方重視甚麼時。',['Some argue that ', ', such as ', ', is essential, while others believe that ', ' deserve '],['第一派支持的投資','第一派舉出的項目','另一派重視的人','其所需資源'])),
  card('In my view, although software is useful, clinics should prioritise spending on nurses because they guide patients.','以 although ... because ... 承認科技有用但選教師優先',[1,7,14],fixed(2,'In my view, although [科技有用], [學校] should prioritise spending on [教師] because [教師帶動有效學習].','作者承認科技用途，仍以教師的核心作用決定優先次序。','兩方都有價值，但要讓步承認一方，再按核心作用選出優先投資對象時。',['In my view, although ', ', ', ' should prioritise spending on ', ' because '],['先承認的好處','負責分配資源者','較應優先投資者','優先的根本理由'])),
  card('Those who support medical technology argue that digital tools can make care more efficient and accessible.','以 argue that 公平解釋支持科技的效率與可及性',[1,4,6],fixed(3,'Those who support [更多科技投資] argue that [數碼工具] can make [教育] more [有效率且容易取得].','第一主體段先說科技支持者的兩項主要理由。','要展開較少支持的一方，準確說出其工具可能提升甚麼服務品質時。',['Those who support ', ' argue that ', ' can make ', ' more '],['支持的投資方向','被支持的工具','受影響的服務','支持者主張的改進'])),
  card('Apps allow trainees to find information quickly, practise independently, and develop job skills.','以 allow ... and ... 並列電腦三種具體功能',[3,5,6],fixed(4,'[電腦] allow [學生] to [快速查資料、獨立練習], and develop [職場需要的數碼技能].','科技效益包括查資料、練習及職場技能。','要把某工具的一般好處拆成數項可觀察功能時。',[' allow ', ' to ', ', and develop '],['提供功能的工具','使用者','前兩項可做的事','另一項發展出的技能'])),
  card('For example, a learner with an online guide can review difficult skills at home and learn at a comfortable speed.','以 For example 說線上軟件可讓學生按自己步速複習',[4,6,8],fixed(5,'For example, [有網上軟件的學生] can review [困難課題] at [家中] and learn at [適合自己的進度].','用學生在家自訂進度的例子具體支持科技優點。','已提出工具的抽象好處，要舉出它如何讓個別使用者按自身節奏學習時。',['For example, ', ' can review ', ' at ', ' and learn at '],['有工具可用的學生','可重溫的內容','使用場域','適合自己的速度'])),
  card('In this sense, online maps can widen travel choices and prepare users for a world where digital skills are necessary.','以 widen ... and prepare ... 概括科技的即時與長遠用途',[4,5,7],fixed(6,'In this sense, [科技] can widen [學習機會] and prepare [學生] for [數碼素養必備的世界].','科技同時擴大當下學習機會和未來所需能力。','已舉具體工具，需抽出它對現時機會與將來準備的雙重作用時。',['In this sense, ', ' can widen ', ' and prepare ', ' for '],['帶來作用的工具','現在被擴大的機會','將來受益的人','要適應的環境'])),
  card('However, spending more on nurses is far more important because even the best machines cannot replace human care and judgment.','以 because even ... cannot replace ... 說人類專業不可替代',[2,6,9],fixed(7,'However, [多投資教師] is far more important because even [最好科技] cannot replace [專業指導、情感支持及課堂判斷].','第二主體段指出科技的界線：難取代教師的專業互動。','要轉入另一方更重要的理由，指出即使工具再好也不能替代某些人的作用時。',['However, ', ' is far more important because even ', ' cannot replace '],['較優先的投資','再好的工具','不可被替代的專業作用'])),
  card('A good coach does not merely give instructions; they notice confusion, adjust practice and encourage players.','以 not merely ...; they ... 說教師超越傳遞資訊的多項功能',[7,9,10],fixed(8,'[好教師] does not merely [傳遞資訊]; they [解釋、察覺、調整並鼓勵].','教師能按學生反應改變教學並支持他們繼續學。','要說明專業人員的價值不止基本任務，還有多項因人而異的判斷時。',[' does not merely ', '; they '],['具專業能力的人','表面上的基本任務','更深入的人際工作'])),
  card('For instance, a scanner can flag a problem, but a doctor can explain its cause and the next step.','以 can ... but ... 對照機器判錯與教師診斷',[7,8,10],fixed(9,'For instance, [電腦程式] can [指出答案錯], but [教師] can [找出錯因並教改善].','電腦可給結果，教師可診斷原因並指導改進。','要以具體例子分清工具能標示結果與專業人員能分析成因時。',['For instance, ', ' can ', ', but ', ' can '],['能提供初步結果的工具','工具能做到的事','能作深入判斷的人','人能補上的工作'])),
  card('Without well-trained carers, costly devices may become little more than shiny distractions.','以 Without ... may become little more than ... 說設備需要教師支撐',[8,9,13],fixed(10,'Without [受訓且獲合理薪酬的教師], [昂貴設備] may become little more than [華而不實的干擾].','缺乏能有效使用設備的人，再貴的器材也可能失效。','要指出若欠缺關鍵人力或條件，昂貴工具可能只剩外表價值時。',['Without ', ', ', ' may become little more than '],['欠缺的人力條件','因此可能被浪費的工具','工具退化成的東西'])),
  card('I therefore believe that clinics should invest more heavily in trained nurses.','以 therefore believe 承接兩方比較作優先投資判斷',[2,10,14],fixed(11,'I therefore believe that [學校] should invest more heavily in [教師].','由科技限制推出教師應獲更多投資。','兩方效益與限制已分析，要用 therefore 明確收束投資優先次序時。',['I therefore believe that ', ' should invest more heavily in '],['作決策的機構','較應加大投資的人'])),
  card('Better pay can attract skilled people into care work, while training can help current staff use new tools.','以 while 並列薪酬招新與培訓現職的兩條路',[11,13,14],fixed(12,'[較好薪酬] can attract [有才華畢業生] into [教師行業], while [定期培訓] can help [現職教師] use [傳統和數碼方法].','提出把錢投資教師的兩種具體途徑和不同受益者。','已選優先投資人員，要交代招募新人與提升現職者兩種措施時。',[' can attract ', ' into ', ', while ', ' can help ', ' use '],['吸引新人所需的條件','被吸引的新人才','加入的專業','支援現職者的措施','已有的人員','可更有效使用的方法'])),
  card('If nurses receive proper training, they can also make new machines more meaningful in daily care.','以 If ... can ... 說投資人員可提升科技效益',[7,12,14],fixed(13,'If [教師獲適當支持], they can also make [科技] more meaningful in [課堂].','投資教師與科技並不衝突；教師支持也可提升科技效用。','要說明加強人員能力，還能令原有工具更有效時。',['If ', ', they can also make ', ' more meaningful in '],['人員獲支持的條件','因而更有用的工具','工具發揮作用的場域'])),
  card('In conclusion, software has a valuable role in hospitals, but nurses should receive the larger share of funding.','以 but 重申科技有價值、教師應獲較多資金',[2,11,15],fixed(14,'In conclusion, [科技] has a valuable role in [教育], but [教師] should receive [較大部分資金].','結論保留科技用途，同時明確分配更多資金給教師。','要在結論承認較少支持的一方仍有作用，同時重新指明資源比例時。',['In conclusion, ', ' has a valuable role in ', ', but ', ' should receive '],['仍有用的工具','發揮作用的領域','優先受資助的人','應獲得的份額'])),
  card('Apps can assist practice, but coaches shape confidence, understanding and lasting progress.','以 can ... but ... 收束工具輔助與教師塑造長期成長',[9,13,14],fixed(15,'[電腦] can assist [學習], but [教師] shape [理解、信心與長遠成長].','最後用功能層次對照：電腦輔助，教師塑造深層發展。','要用對照句指出工具可輔助工作，但人更能影響深層與長遠結果時。',[' can assist ', ', but ', ' shape '],['提供輔助的工具','被輔助的活動','產生深層影響的人','被塑造的長遠結果'])),
];
const wrongReasons=[
  ['這句列出兩派投資主張，未先交代有限資金造成的取捨。','這句已選教師優先，原句先界定預算爭議。','這句說教師不可取代，未作開篇的資源問題設定。'],
  ['這句只設定設備與人力的資金取捨，未列各派具體主張。','這句是支持科技者的主體段，未並列教師派。','這句已選教師較應投資，未平衡報告兩方觀點。'],
  ['這句並列兩派，未用 although 讓步科技並選教師。','這句已在主體段強調教師不可替代，原句是引言立場。','這句是結論資金比例，未以教師核心作用提出原因。'],
  ['這句在引言說科技派與教師派，未解釋效率與可及性。','這句列電腦能做的三件事，原句先概括支持者理由。','這句由具體例子抽長遠作用，未先說效率可及性。'],
  ['這句只概括數碼工具的兩項效益，未列查資料練習技能。','這句以學生在家用軟件作單一例子，未並列電腦功能。','這句總結科技的現在與未來作用，未列具體功能。'],
  ['這句列電腦一般功能，未以 For example 寫個別學生的步速。','這句抽出科技可擴大機會，未描述軟件在家複習。','這句轉談教師不可替代，與科技好處的例子不同。'],
  ['這句只列電腦直接功能，未以 In this sense 抽出長遠作用。','這句是軟件使用個案，未總結科技擴大機會與未來技能。','這句已轉到教師的重要性，與科技派的概括不同。'],
  ['這句在引言表態教師優先，未分析科技不能替代的作用。','這句還在總結科技益處，未以 However 指出其界線。','這句是電腦判錯與教師診斷例子，未先概括不可替代的三方面。'],
  ['這句概括教師的重要性，未以 not merely 列具體教學行為。','這句是電腦與教師的單一例子，未列解釋調整鼓勵。','這句說缺教師時設備會失效，未說教師日常做甚麼。'],
  ['這句概括科技不可替代人類指導，未給具體判錯例子。','這句列教師解釋調整鼓勵等多種作用，未對照機器與人。','這句是欠缺教師的結果，未以例子分清判錯與找錯因。'],
  ['這句列教師日常工作，未以 Without 指出昂貴設備的依賴。','這句是具體判錯例子，未概括設備變干擾物的風險。','這句說教師受支持可使科技更有用，與欠缺人力的反面條件不同。'],
  ['這句在引言預告優先投教師，未以 therefore 承接主體比較。','這句警告沒好教師時設備無用，未作明確資金決定。','這句結論比較資金份額，原句先在第三段單獨表態。'],
  ['這句只說應多投資教師，未分招募和培訓兩種做法。','這句說教師支持能提升科技，未列薪酬與培訓途徑。','這句結論重申資金比例，未提出具體投資方式。'],
  ['這句概括科技不能替代教師，未說支持教師反可改善科技效用。','這句列薪酬與培訓，未用 If 說支持後的連帶效果。','這句結論分配資金，未指出科技怎樣靠教師變有用。'],
  ['這句在引言選教師優先，未以 In conclusion 重述資金份額。','這句說應多投資教師，未公平保留科技的價值。','這句最後對照電腦輔助與教師塑造，未直接說預算比例。'],
  ['這句以電腦判錯、教師找因作個案，未概括長遠影響。','這句說支持教師可令科技更有效，未對照兩方作用層次。','這句結論先給資金份額，未用深層成長作最後收束。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先理解科技能做甚麼，再比較教師的不可替代作用和具體投資方法。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求學校比較哪兩種資金用途？',[
    '更多電腦與數碼工具，和更好的教師支援',
    '只比較不同品牌課桌的顏色及木材價格',
    '只比較學生使用哪種交通方式放學回家',
    '只比較校服和運動服所用布料的品質',
  ],'核心是有限預算投向科技還是教師。'),
  {type:'multi',prompt:'選出作者的完整立場',detail:'選兩項，再按「確認」。',options:[
    '科技可擴大機會並提供練習工具',
    '教師應獲較多資金，因其指導判斷不可取代',
    '電腦完全沒有任何學習用途，應全部移除',
    '只要買到設備，教師薪酬與培訓便不重要',
  ],correct:[0,1],why:'作者承認科技有價值，仍主張先投資教師。'},
];
const route=[sequence('依文章次序排列投資論證',[
  ['引言定取捨','資金有限；科技有用，但教師更應優先。'],
  ['科技派的理由','查資料、獨立練習、按自己步速複習和數碼技能。'],
  ['教師的核心作用','察覺困惑、調整教學、找出錯因並支持學生。'],
  ['投資及結論','改善薪酬培訓，教師亦能用好科技；資金應較多投向教師。'],
],'文章以科技的有限好處和教師不可替代的價值決定預算次序。')];
const evidence=[
  quiz('支持科技者認為電腦能提供甚麼？',[
    '快速查資料、獨立練習和職場需要的數碼技能',
    '保證所有學生不需教師也能深度理解每一課',
    '只讓學生更快完成所有沒有意義的工作紙',
    '單靠設備即可解決所有課室情緒與動機問題',
  ],'原文列三種具體科技用途。'),
  quiz('網上學習軟件的例子說明甚麼？',[
    '學生可在家重溫難題，並按合適自己的進度學',
    '每名學生都必須以完全相同速度做同樣課題',
    '只要有軟件，學生便永遠不會遇到困難概念',
    '軟件只適合教師，而不能供學生在家中使用',
  ],'個案把科技的可及性和自訂進度具體化。'),
  quiz('作者為何認為教師比科技更應獲得資金？',[
    '科技難取代專業指導、情感支持和課堂判斷',
    '所有數碼工具完全不能用於任何學習活動',
    '只有教師會使用電腦，學生絕不需要數碼技能',
    '教師的唯一作用是批改選擇題的對錯標記',
  ],'教師有機器難以複製的專業和人際作用。'),
  quiz('電腦判錯與教師找錯因的例子如何分工？',[
    '電腦可標出結果，教師可診斷原因並教改善',
    '電腦能找出所有個人原因，教師只需報出分數',
    '教師只可標示對錯，不能向學生解釋任何錯因',
    '兩者作用完全相同，因此誰都不需再受培訓',
  ],'例子對照初步結果與深入教學判斷。'),
  quiz('缺少良好訓練和合理薪酬的教師，貴設備有何風險？',[
    '可能只剩吸睛外表，反而分散學生學習注意',
    '必然自動變成有能力教師，完全不用任何支援',
    '必然令學生不用上課，也能立即學會所有內容',
    '只會變成更便宜的器材，與課堂學習沒有關聯',
  ],'原文說設備可能淪為 shiny distractions。'),
  quiz('薪酬與培訓各自有何作用？',[
    '薪酬吸引新人才，培訓幫現職教師用好方法',
    '薪酬只影響螢幕亮度，培訓只影響校服顏色',
    '薪酬可取代所有教師，培訓可取消所有學生',
    '兩者只為增加支出，與教學能力完全無關',
  ],'兩項資金用途分別影響招募與現職能力。'),
  quiz('投資教師與使用科技在文中是甚麼關係？',[
    '支持教師後，他們也能讓科技在課堂更有效',
    '只要投資教師，就必須移除每一部學校電腦',
    '只要買新科技，就可取消教師所有培訓工作',
    '兩者永遠沒有交集，教師不能用任何數碼方法',
  ],'教師能提升科技的實際教學價值。'),
];
const logic=[
  sequence('科技派的投資理由',[
    ['效率可及','數碼工具可讓更多學生接觸學習資源。'],
    ['學生功能','快速查資料、獨立練習及建立數碼技能。'],
    ['個別進度','網上軟件讓學生在家按自己的速度複習。'],
    ['長遠準備','數碼素養已成未來生活與職場所需。'],
  ],'作者先公平承認科技的直接功能和長遠用途。'),
  sequence('教師為何應獲較多資金',[
    ['不可取代','專業指導、情緒支持和課堂判斷仍需教師。'],
    ['具體對照','電腦標示錯答；教師找到錯因並教改進。'],
    ['人力前提','沒有受訓且獲合理薪酬者，昂貴設備也可失效。'],
    ['資金做法','改善薪酬招新人才，定期培訓現職教師。'],
    ['互補結果','得到支持的教師亦可使科技更有用。'],
  ],'人力投資提供科技無法代替的教學判斷，也提升設備效益。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('醫院預算有限，要選擇增購掃描器，還是為現有護理人員安排專業培訓。','哪項最像範文的資源取捨思路？',[
    '承認掃描器有用，仍較重視護理判斷與照護',
    '先買掃描器，再看護理人員能否自行補足培訓',
    '只比較掃描速度，不看護理判斷與照護品質',
    '只改善護理培訓，不評估器材可帶來的幫助',
  ],['有限預算要比較工具作用與專業人員不可替代的作用。','掃描器有用，但護理人員的專業判斷不能等到之後才補。','掃描速度不是照護品質的全部。','培訓重要，仍可承認器材的輔助價值。'],[0,2,7],'作者承認科技有用，但以教師的核心作用決定優先投資。'),
  transfer('學生在家用線上軟件反覆練習自己不懂的分數題，速度可按需要調整。','這個例子最能支持科技的哪項好處？',[
    '在家按自己的步調反覆重溫困難分數題',
    '只完成每日題數，不調整自己不懂的步調',
    '只看練習速度，不重溫分數題的錯誤',
    '只用同一速度做題，不按個人需要重做',
  ],['科技提供可按個人速度使用的學習機會。','每日題數不是按自己進度重溫困難內容。','速度只是表面，應回看分數題錯因。','固定速度未利用軟件可調整的優點。'],[4,5,6],'網上軟件能讓學生在家按適合自己的步速複習。'),
  transfer('一個閱讀程式會把錯字標紅，卻沒有告訴學生為何會錯。','按範文，教師最重要的補充是甚麼？',[
    '找出學生誤解的原因，再示範如何改進',
    '只標出錯字，不追查學生誤解了甚麼規則',
    '只請學生再讀一次，不示範如何修正錯誤',
    '只統計錯字次數，不分析反覆出錯的原因',
  ],['教師能診斷錯因並提供改進指導。','標紅只指出位置，沒有教改正原因。','再讀有用，仍須示範怎樣改。','次數不能代替對誤解的診斷。'],[8,9],'程式標示答案錯誤，教師可找出錯因並教改善。'),
  transfer('新電腦已送到偏遠學校，但教師未受培訓，學生只用它們玩無關課堂的遊戲。','哪項最準確轉用設備失效的推理？',[
    '缺少受訓教師，昂貴設備可能反成分散注意的工具',
    '只增加電腦數量，不安排教師學會課堂使用',
    '只限制無關遊戲，不教教師如何用設備授課',
    '只讓學生自學軟件，不問課堂目標是否達成',
  ],['工具需要能有效使用它的人力條件。','設備多未必有用，教師仍須懂如何引導課堂。','限制遊戲有用，仍需培訓教師。','自學軟件未對準課堂目標。'],[7,10,13],'沒有受訓且獲支持的教師，設備可能只剩吸睛的干擾。'),
  transfer('校長已決定先投資教師，希望知道資金可用在哪兩個不同方面。','哪項最符合範文的具體做法？',[
    '改善薪酬以招聘，培訓現職教師使用新工具',
    '只提高薪酬，不為現職教師提供新工具培訓',
    '只培訓現職教師，不處理招聘人才的待遇',
    '只買教師用平板，不改善薪酬與教法',
  ],['薪酬影響招募，培訓提升已有教師能力。','薪酬有助招聘，但現職教師也要培訓。','培訓有用，待遇仍影響人才招聘。','買平板不是兩項教師投資的完整方案。'],[11,12,13],'較好薪酬吸引畢業生，培訓幫現職教師使用新舊方法。'),
  transfer('學校有人說「投資教師」代表必須完全停止使用數碼教材。','哪項最能修正這種理解？',[
    '教師得到支援，也能把數碼教材用得更好',
    '只聘更多教師，不讓他們使用有益數碼教材',
    '只使用數碼教材，不給教師足夠教學支援',
    '只更新設備，不檢查教師如何引導學生',
  ],['人員與工具可互補，優先投人不等於排斥科技。','教師增加有用，但不必排除可用的數碼教材。','數碼教材須由得到支援的教師有效使用。','只買設備未說明如何教學。'],[2,6,13],'受支持的教師可以讓科技更有教學意義。'),
  transfer('診所考慮用人工智能回答所有病人問題；醫生指出病人的疑惑與情緒並不一樣。','哪項最貼近範文對專業人員的描述？',[
    '專業人員能察覺疑惑，調整說明和支持',
    '只用人工智能回覆，不辨病人不同情緒',
    '只提供標準資料，不調整難懂的解說',
    '只看病歷數字，不聽病人提出的疑惑',
  ],['教師式專業價值在於按人調整與支持。','標準回覆未必察覺每位病人的困惑和情緒。','資料正確仍可能需要因人調整說明。','病歷數字不能取代聆聽疑惑。'],[7,8,9],'教師不只傳資訊，還會察覺困惑、調整教學與鼓勵學生。'),
  transfer('城市圖書館想買平板電腦，也想聘用能幫讀者找書和理解資料的人員。','哪項比較最接近範文最後的功能層次？',[
    '平板助查找，人員引導讀者理解資料',
    '只買平板電腦，不聘能引導讀者的人員',
    '只聘人員找書，不利用平板輔助查找',
    '只看查找速度，不問讀者是否理解資料',
  ],['工具輔助，專業人員影響更深層的理解。','平板輔助查找，但讀者仍可能需要人員引導。','人員重要，平板也可輔助快速查找。','查找速度未顯示理解是否改善。'],[14,15],'電腦輔助學習，教師塑造理解、信心與長遠發展。'),
  transfer('學校只有一筆新資金，有人主張全部花在最新設備，因為數碼能力已是職場所需。','哪項回應既公平又符合作者立場？',[
    '數碼技能重要，教師引導更值得優先投資',
    '只讓學生操作新設備，不提供教師引導',
    '只增加教師培訓，不讓學生接觸數碼工具',
    '只按設備價格分配預算，不問學習成效',
  ],['承認科技的長遠價值，仍按教師核心作用排序。','操作能力有用，但教師引導學生用好設備才完整。','教師培訓有用，也要讓學生學會使用工具。','價格不能代替對學習成效的判斷。'],[2,6,7,13],'科技能為數碼世界作準備，但教師仍是有效學習核心。'),
  transfer('一位校長想在結論同時肯定科技價值，並清楚說明預算應如何分配。','哪項結論最貼近範文？',[
    '科技有學習用處，教師應獲較大資金份額',
    '只肯定科技作用，不說明教師培訓的優先次序',
    '只增加教師開支，不承認科技可輔助學習',
    '只按設備新舊分配錢，不評估教學作用',
  ],['公平承認工具作用，並表達清楚的資金優先次序。','肯定科技仍須交代資金為何較優先給教師。','教師優先不代表科技沒有學習價值。','新舊不是教學作用的直接證據。'],[2,11,14,15],'結論承認科技有重要作用，但教師應獲較大部分資金。'),
];
export default {key:'discuss-both-views:16',meta:{topic:'學校應優先投資科技還是教師',summary:'科技可擴大學習機會，但教師的指導、判斷和支持不可取代；資金應優先改善教師薪酬與培訓。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
