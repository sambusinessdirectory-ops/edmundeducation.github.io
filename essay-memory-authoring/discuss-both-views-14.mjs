// Full source-specific memorisation support for Discuss Both Views 14.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-14-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:14'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Some people say children should spend their free time on learning activities, but others say this puts too much pressure on them.',
  'I agree with the second view because children mostly need free time to rest, play and learn to get along with others, not to spend more time doing schoolwork.',
  'People who support learning activities in free time have a point that makes sense.',
  'Many parents worry that, without a plan, children will spend too much of their free time on screens, games or watching things without doing much else.',
  'If children spend some free time reading, learning a language, learning music or doing puzzles, they may get better at useful things in a more relaxed place.',
  'Such activities may also help children learn to keep going with a task: for example, a child who reads after school often may learn to pay attention and want to know more, which may help at school later.',
  'From this view, learning in free time is not a penalty; it is a way to help children do well in the future.',
  'But I think making free time another time for lessons puts too much pressure on children and can hurt them.',
  'After school, many children already feel tired in their minds because of lessons, homework, tests and being checked all the time.',
  'If children have more school tasks every evening and weekend, they lose time to rest, and learning starts to feel like being shut in, not like a way to grow.',
  'A child may go from school to extra classes to online tasks and seem to be getting a lot done, but they may really feel worried, angry about the work and less willing to learn.',
  'This hurts children especially because time to play is not time with no value.',
  'By playing games, doing sport, imagining things and talking freely, children learn to work with others, manage feelings, do things for themselves and solve problems in ways task sheets often cannot.',
  'To sum up, parents who choose more learning activities may mean well, but I strongly think children should not be made to study during free time.',
  'Children should not have every free hour planned so closely that it must be used for school learning.',
  'Free time is not thrown away; it lets children rest, grow and develop all sides of themselves.',
];
const vocabulary=[
  [['It is sometimes argued','Some people say','有人主張'],['spare time','free time','空閒時間'],['educational pursuits','learning activities','教育活動'],['unnecessary pressure','too much pressure','不必要壓力']],
  [['latter view','second view','後者觀點'],['recovery','rest','恢復精力'],['social development','learn to get along with others','社交發展'],['extension of the classroom','more time doing schoolwork','課堂延伸']],
  [['Those who support','People who support','支持者'],['reasonable point','point that makes sense','合理觀點']],
  [['unstructured leisure','without a plan','無安排的休閒'],['wasted on','spend too much of their free time on','耗於'],['screens','screens','螢幕'],['passive entertainment','watching things without doing much else','被動娛樂']],
  [['part of their free time','some free time','部分空閒時間'],['practise a language','learning a language','練習語言'],['learn music','learning music','學習音樂'],['solve puzzles','doing puzzles','解謎'],['strengthen useful skills','get better at useful things','強化技能'],['less formal setting','more relaxed place','較輕鬆環境']],
  [['build discipline','learn to keep going with a task','培養自律'],['gets used to reading','reads after school often','習慣閱讀'],['concentration','pay attention','專注力'],['curiosity','want to know more','好奇心'],['later academic success','help at school later','日後學業成功']],
  [['From this perspective','From this view','從這角度'],['educational leisure','learning in free time','教育性休閒'],['punishment','penalty','懲罰'],['planting seeds for the future','help children do well in the future','為未來播種']],
  [['However','But','然而'],['turning free time into another learning session','making free time another time for lessons','把空閒變課堂'],['harmful pressure','pressure on children and can hurt them','有害壓力']],
  [['mentally tired','tired in their minds','精神疲累'],['constant evaluation','being checked all the time','不斷評估'],['lessons','lessons','課堂'],['homework','homework','功課']],
  [['evenings and weekends','every evening and weekend','晚間與週末'],['extra academic tasks','more school tasks','額外學業任務'],['rest disappears','lose time to rest','失去休息'],['feel like a cage','feel like being shut in','像牢籠'],['source of growth','way to grow','成長來源']],
  [['tuition','extra classes','補習'],['online exercises','online tasks','網上練習'],['appear productive','seem to be getting a lot done','看似有成效'],['in reality','really','實際上'],['anxious','worried','焦慮'],['resentful','angry about the work','反感'],['less motivated','less willing to learn','動機下降']],
  [['especially damaging','hurts children especially','尤其有害'],['play','time to play','玩樂'],['not an empty time','not time with no value','並非毫無收穫']],
  [['Through games','By playing games','透過遊戲'],['sport','doing sport','運動'],['imagination','imagining things','想像'],['casual conversation','talking freely','日常交談'],['cooperation','work with others','合作'],['emotional control','manage feelings','情緒控制'],['independence','do things for themselves','獨立'],['problem-solving','solve problems','解難'],['worksheets','task sheets','工作紙']],
  [['In conclusion','To sum up','總結'],['good intentions','may mean well','出於好意'],['firmly believe','strongly think','堅定認為'],['expected to spend their free time studying','made to study during free time','被要求空閒時學習']],
  [['scheduled so tightly','planned so closely','安排太密'],['every spare hour','every free hour','每段空閒時間'],['academic purpose','school learning','學業目標']],
  [['Free time','Free time','空閒時間'],['not wasted time','not thrown away','沒有浪費'],['breathe','rest','喘息'],['become whole people','develop all sides of themselves','全面發展']],
];
const chunkOverrides=[
  ['It is sometimes argued that children should spend','their spare time on educational pursuits,','while others believe that this creates unnecessary pressure.'],
  ['I agree with the latter view, because childhood free time','should mainly serve recovery, play, and social development','rather than become an extension of the classroom.'],
  ['Those who support educational activities','make a reasonable point.'],
  ['Many parents worry that unstructured leisure','will be wasted on screens, games,','or passive entertainment.'],
  ['If children use part of their free time to read,','practise a language, learn music, or solve puzzles,','they may strengthen useful skills','in a less formal setting.'],
  ['Such activities can also build discipline:','a child who gets used to reading after school, for example,','may develop concentration and curiosity','that support later academic success.'],
  ['From this perspective, educational leisure is not a punishment','but a way of planting seeds for the future.'],
  ['However, I believe that turning free time','into another learning session','places children under harmful pressure.'],
  ['After school, many children are already mentally tired','from lessons, homework, tests,','and constant evaluation.'],
  ['If their evenings and weekends are filled','with extra academic tasks, rest disappears,','and learning begins to feel like a cage','rather than a source of growth.'],
  ['A child who moves from school to tuition','to online exercises may appear productive,','but in reality they may become anxious, resentful,','and less motivated.'],
  ['This is especially damaging','because play is not an empty time.'],
  ['Through games, sport, imagination, and casual conversation,','children learn cooperation, emotional control, independence,','and problem-solving in ways','that worksheets cannot easily provide.'],
  ['In conclusion, although this parental approach','may have good intentions, I firmly believe','that children should not be expected','to spend their free time studying.'],
  ['Childhood should not be scheduled so tightly','that every spare hour has an academic purpose.'],
  ['Free time is not wasted time;','it is where children breathe, grow,','and become whole people.'],
];
const simpleChunkOverrides=[
  ['Some people say children should spend their free time on learning activities,','but others say this puts too much pressure on them.'],
  ['I agree with the second view because children mostly need free time','to rest, play and learn to get along with others,','not to spend more time doing schoolwork.'],
  ['People who support learning activities in free time','have a point that makes sense.'],
  ['Many parents worry that, without a plan,','children will spend too much of their free time','on screens, games or watching things without doing much else.'],
  ['If children spend some free time reading,','learning a language, learning music or doing puzzles,','they may get better at useful things','in a more relaxed place.'],
  ['Such activities may also help children learn to keep going with a task:','for example, a child who reads after school often','may learn to pay attention and want to know more,','which may help at school later.'],
  ['From this view, learning in free time is not a penalty;','it is a way to help children do well in the future.'],
  ['But I think making free time another time for lessons','puts too much pressure on children and can hurt them.'],
  ['After school, many children already feel tired in their minds','because of lessons, homework, tests','and being checked all the time.'],
  ['If children have more school tasks every evening and weekend,','they lose time to rest,','and learning starts to feel like being shut in,','not like a way to grow.'],
  ['A child may go from school to extra classes to online tasks','and seem to be getting a lot done,','but they may really feel worried, angry about the work','and less willing to learn.'],
  ['This hurts children especially','because time to play is not time with no value.'],
  ['By playing games, doing sport, imagining things and talking freely,','children learn to work with others, manage feelings,','do things for themselves and solve problems','in ways task sheets often cannot.'],
  ['To sum up, parents who choose more learning activities','may mean well, but I strongly think','children should not be made to study during free time.'],
  ['Children should not have every free hour planned so closely','that it must be used for school learning.'],
  ['Free time is not thrown away;','it lets children rest, grow','and develop all sides of themselves.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('It is sometimes argued that workers should study after work, while others say this creates pressure.','以 while others 並列空閒時間用途的兩派主張',[1,2,7],fixed(0,'It is sometimes argued that [孩子空閒時應參加教育活動], while others believe that [這會造成壓力].','引言平衡列出善用時間與避免壓力的爭議。','要在表態前並列一種做法及反對者對其代價的看法時。',['It is sometimes argued that ', ', while others believe that '],['一方支持的做法','另一方擔心的後果'])),
  card('I agree with the second view because weekends should mainly allow rest and family time rather than become extra workdays.','以 because ... rather than ... 說自由時間本應恢復而非延長課堂',[0,6,13],fixed(1,'I agree with [反對派], because [童年空閒] should mainly serve [恢復、遊玩和社交] rather than become [課堂延伸].','作者選反對派，因為空閒有自身的成長用途。','要說明某段時間應優先保留甚麼用途，而非被既有任務佔滿時。',['I agree with ', ', because ', ' should mainly serve ', ' rather than become '],['認同的立場','需要保留的時間','優先的用途','應避免的延伸任務'])),
  card('Those who support daily walks make a reasonable point.','以 reasonable point 公平承認支持方理據',[0,3,7],fixed(2,'Those who support [教育活動] make a reasonable point.','第一主體段先承認支持者有值得考慮的理由。','將要介紹自己較少支持的一方，先公平承認它有合理之處時。',['Those who support ', ' make a reasonable point.'],['被支持的做法'])),
  card('Many managers worry that open time will be wasted on aimless scrolling.','以 worry that 說家長擔心無安排時間被浪費',[2,4,8],fixed(3,'Many [家長] worry that [無安排的休閒] will be wasted on [螢幕、遊戲或被動娛樂].','支持方擔心孩子的空閒被低投入活動佔去。','要交代某群人支持安排的原因，指出不安排時他們擔心的用途時。',['Many ', ' worry that ', ' will be wasted on '],['表達擔心的人','未安排的時間','他們擔心時間流向的活動'])),
  card('If older people use some free time to practise music, they may strengthen skills outside formal lessons.','以 If ... may ... 說適量非正式學習可強化技能',[3,5,9],fixed(4,'If [孩子用部分空閒閱讀、學語言音樂或解謎], they may [強化有用技能] in [較輕鬆環境].','適量教育活動可在非正式情境帶來能力進步。','要用條件句說某種自願活動可能帶來有限好處，而非保證結果時。',['If ', ', they may ', ' in '],['可能採取的活動','可能的技能收穫','活動發生的環境'])),
  card('Regular practice can also build discipline: a young player may gain patience and focus that help later.','以 冒號具體化活動如何形成日後有用的能力',[4,6,8],fixed(5,'[這些活動] can also build [自律]: [習慣閱讀的孩子] may develop [專注和好奇] that support [日後學業].','放學後閱讀的例子把自律與日後學習連起來。','已提出一項長遠好處，要在冒號後給出形成過程及未來用途時。',[' can also build ', ': ', ' may develop ', ' that support '],['可重複的活動','可能形成的習慣','呈現習慣的具體例子','從例子長出的能力','其日後用途'])),
  card('From this perspective, sport is not a punishment but a way of preparing for future health.','以 not ... but ... 把教育性休閒重界定為未來投資',[4,5,7],fixed(6,'From this perspective, [教育性休閒] is not [懲罰] but [為未來播種的方法].','支持者認為教育活動不是罰孩子，而是準備未來。','要澄清一種做法並非表面的負擔，而是有長遠作用時。',['From this perspective, ', ' is not ', ' but '],['被重新評價的做法','被否定的負面看法','正面長遠作用'])),
  card('However, I believe that turning weekends into more office hours places workers under needless pressure.','以 However 轉入把空閒變另一節課的壓力',[1,6,8],fixed(7,'However, I believe that [把空閒變另一課] places [孩子] under [有害壓力].','作者轉向反方核心：學習佔滿休息時間會加壓。','已公平說完好處，要轉而說明把休息時間當作額外工作帶來甚麼代價時。',['However, I believe that ', ' places ', ' under '],['令人擔心的安排','承受後果的人','安排造成的壓力'])),
  card('After a long shift, many nurses are already tired from patients, paperwork and repeated checks.','以 After ... tired from ... 列出孩子放學後已疲累的來源',[7,9,10],fixed(8,'After [放學], many [孩子] are already mentally tired from [課堂、功課、測驗及評估].','額外學習不是從零負擔開始，孩子此前已消耗精力。','要指出某群人在追加任務前，已因多項日常要求而疲倦時。',['After ', ', many ', ' are already mentally tired from '],['已經完成的主要時段','承受負擔的人','先前耗用心力的來源'])),
  card('If every weekend is filled with work emails, rest disappears, and work begins to feel like a cage rather than growth.','以 If ... rest disappears ... rather than ... 說學習侵佔休息的反效果',[8,10,11],fixed(9,'If [晚間週末都排滿任務], rest disappears, and [學習] begins to feel like [牢籠] rather than [成長來源].','沒有休息使學習被感成束縛而非成長。','要說明當重要的喘息時間也被佔用，原本有益的事如何變成壓力時。',['If ', ', rest disappears, and ', ' begins to feel like ', ' rather than '],['休息被佔滿的條件','原本有益的活動','變成的負面感受','原本應有的價值'])),
  card('A worker who moves from meetings to courses may appear productive, but in reality may be exhausted.','以 may appear ... but in reality ... 對照表面產出與內在狀態',[9,11,12],fixed(10,'[學校補習網練不斷的孩子] may appear [有成效], but in reality they may become [焦慮、反感及少動機].','活動排滿未必代表成長，表面效率可掩蓋壓力。','要指出外界看到的忙碌或成效，與當事人實際狀態可能相反時。',[' may appear ', ', but in reality they may become '],['看似忙碌的人','外在觀感','可能被遮住的真實狀態'])),
  card('This is especially damaging because quiet time is not empty time.','以 because 指出玩樂並非毫無學習價值',[9,10,12],fixed(11,'This is especially damaging because [玩樂] is not [毫無收穫的時間].','剝奪玩樂有害，因為玩樂本身有成長作用。','要解釋某種看似可省的時間其實有價值，因此剝奪尤其有害時。',['This is especially damaging because ', ' is not '],['被剝奪而有價值的活動','需否定的貶低看法'])),
  card('Through shared meals and conversations, young staff learn trust and teamwork in ways manuals cannot teach.','以 Through ... in ways ... 說遊玩可教工作紙難教的能力',[11,13,15],fixed(12,'Through [遊戲、運動、想像及交談], [孩子] learn [合作、控情緒、獨立及解難] in ways that [工作紙] cannot easily provide.','具體說玩樂如何培養紙上練習難以提供的能力。','要指出某種非正式活動能教特定能力，而傳統書面方法難做到時。',['Through ', ', ', ' learn ', ' in ways that ', ' cannot easily provide.'],['非正式學習途徑','學習者','所形成的能力','較難提供同等經驗的工具'])),
  card('In conclusion, although the managers may mean well, I believe employees should not be expected to train every weekend.','以 although 讓步好意，再否定空閒時強制學習',[1,7,14],fixed(13,'In conclusion, although [父母做法] may have [好意], I firmly believe that [孩子不應被要求空閒時學習].','結論承認家長善意，仍清楚反對把空閒變功課。','要承認提出某做法的人出於好意，但仍否定其要求過度時。',['In conclusion, although ', ' may have ', ', I firmly believe that '],['被讓步承認的做法','其善意動機','最終反對的要求'])),
  card('Workers should not be scheduled so tightly that every free hour has a training target.','以 so ... that ... 說排程過密使每段空閒都負學習任務',[9,13,15],fixed(14,'[童年] should not be scheduled so tightly that [每段空閒] has [學業目標].','作者的界線是不要把孩子所有自由時段都納入學業排程。','要指出安排密集到某個過度程度，並說明其具體後果時。',[' should not be scheduled so tightly that ', ' has '],['不應過密安排的生命階段或時段','被排程佔滿的時間','被強加的目標'])),
  card('Rest is not wasted time; it is where adults recover, think and grow.','以 not wasted ... it is where ... 重估空閒時間價值',[11,13,14],fixed(15,'[空閒時間] is not [浪費]; it is where [孩子] [喘息、成長並全面發展].','最後強調自由時間有自身的恢復與成長價值。','要收束論證，反駁某段時間「沒有產出就是浪費」的看法時。',[' is not ', '; it is where '],['被誤認為無用的時間','被否定的評價','在其中成長的人','發生的恢復與發展'])),
];
const wrongReasons=[
  ['這句已表達作者認同反對派，原句先平衡列出兩派。','這句已轉入支持派主體段，未在引言報告對立看法。','這句已批評休閒變課堂，未交代兩派爭議。'],
  ['這句只是列出兩派，未說作者為何認同保留休息。','這句將教育性休閒界定為未來投資，與作者立場不同。','這句在結論再表態，未以 childhood free time 說明核心理由。'],
  ['這句是引言兩派看法，未公平承認支持者有合理之處。','這句具體解釋家長擔心浪費時間，原句先肯定其理由可理解。','這句轉入作者反對派的論證，與此處承認支持方不同。'],
  ['這句先承認支持方有道理，未指出他們擔心甚麼被浪費。','這句列閱讀音樂等積極做法，未說未安排時的擔心。','這句列課堂測驗等疲勞來源，與家長對空閒的擔心不同。'],
  ['這句只表達家長擔心，未以 If 列活動與可能好處。','這句以放學後閱讀例子說自律，原句先說多種活動可強化技能。','這句列孩子需要的休息，語意方向與支持方有限好處不同。'],
  ['這句說多種活動可能強化技能，未以具體閱讀習慣說自律。','這句把教育性休閒概括為未來投資，未說形成專注的過程。','這句列放學後疲倦的來源，並非支持方所指的長遠好處。'],
  ['這句仍在說具體閱讀如何養成能力，未用 not ... but ... 重新界定。','這句已轉入作者對壓力的批評，與支持方角度相反。','這句列玩樂的教育價值，未說教育性休閒不是懲罰。'],
  ['這句在引言先表達反對派立場，未在第二主體段轉折批評。','這句以未來投資總結支持方，未指出空閒變課堂的壓力。','這句交代放學後已疲累，未先提出額外學習的核心代價。'],
  ['這句提出把空閒變課堂有壓力，未列孩子已疲累的來源。','這句以晚間週末被佔滿說休息消失，原句先交代先前負擔。','這句用一名孩子的表面忙碌作例，未列日常課業消耗。'],
  ['這句只列現有課業造成疲勞，未提出 If 排滿晚上週末的後果。','這句以個別孩子揭露內在壓力，未說休息消失及牢籠比喻。','這句概括玩樂時間有價值，未描寫無休止學習的束縛。'],
  ['這句說晚間週末排滿使學習像牢籠，未對照表面效率與真實情緒。','這句說玩樂不是空白，未描寫一名忙碌孩子的反差。','這句列玩樂教會的能力，未用 may appear ... but in reality ...。'],
  ['這句以排滿任務說休息消失，未直接否定玩樂沒有價值。','這句個案對照忙碌與焦慮，未提出玩樂的非空白價值。','這句已列玩樂可培養的能力，原句先說剝奪它尤其有害。'],
  ['這句只概括玩樂不是空白，未列途徑、能力及工作紙界線。','這句是結論表態，未具體說玩樂教甚麼。','這句最後重估自由時間，未列遊戲運動交談的學習機制。'],
  ['這句是引言主張保留休息，未在結論讓步父母好意。','這句是第二主體段批評壓力，未以 although 承認好意。','這句說不要排程過密，未先重申空閒不應強制學習。'],
  ['這句說排滿晚間週末的後果，未在結論提出 so ... that 界線。','這句結論讓步父母善意並表態，未解釋排程過密的程度。','這句重估自由時間價值，未指出每個空閒時段被學業佔用。'],
  ['這句說玩樂不是空白，未用 not wasted time 收束全部自由時間。','這句已表達作者反對空閒強制學習，未描寫自由時間的正面價值。','這句只說排程不可過密，未反駁空閒就是浪費的判斷。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先承認自願教育活動可能有益，再判斷額外學習佔滿空閒時的代價。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目比較孩子空閒時間的哪兩種用法？',[
    '用於教育活動，與避免增加不必要壓力',
    '只討論學校課堂應否更換所有教科書',
    '只比較孩子上學與放學的交通工具',
    '只討論父母與教師誰應製作所有工作紙',
  ],'兩方爭論空閒時的教育活動及其壓力。'),
  {type:'multi',prompt:'選出作者對兩方看法的完整判斷',detail:'選兩項，再按「確認」。',options:[
    '適量閱讀音樂等活動可能幫助技能與自律',
    '空閒應優先保留恢復玩樂和社交成長',
    '所有自願閱讀活動都會直接傷害孩子',
    '孩子每一小時都必須有學業任務才不算浪費',
  ],correct:[0,1],why:'作者承認支持方的有限好處，但反對把自由時間變成強制課堂。'},
];
const route=[sequence('依文章次序排列空閒時間論證',[
  ['引言表態','教育活動可能有益，但空閒應優先恢復及成長。'],
  ['支持方理由','擔心時間被動耗掉；閱讀音樂解謎可培養技能與自律。'],
  ['作者反方理由','孩子放學已累；再加課業可奪休息並削弱動機。'],
  ['玩樂及結論','玩樂培養工作紙難教的能力，不應排滿每段空閒。'],
],'文章先公平看待適量自願學習，再說明強制佔滿空閒的代價。')];
const evidence=[
  quiz('支持教育活動的家長最擔心甚麼？',[
    '無安排的空閒可能全被螢幕和被動娛樂佔用',
    '所有孩子一打開書便立即失去全部好奇心',
    '任何運動都必然令孩子無法理解課堂內容',
    '孩子每天在校已沒有任何教師或課堂活動',
  ],'家長擔心空閒被低投入娛樂耗掉。'),
  quiz('閱讀、音樂、語言和解謎例子支持甚麼有限好處？',[
    '孩子可在較輕鬆環境強化有用技能',
    '孩子必須取消所有自由遊戲才能學會技能',
    '只要參加活動就能保證未來學業第一',
    '教育活動唯一作用是增加工作紙數量',
  ],'原文用 may 表示可能的技能收穫，而非保證。'),
  quiz('放學後閱讀習慣可能培養甚麼？',[
    '專注與好奇，日後也可支持學業',
    '只讓孩子永久避免所有學校測驗',
    '保證孩子以後不再需要任何休息',
    '只使孩子的閱讀書本重量增加',
  ],'例子說規律活動可能帶來可延續的能力。'),
  quiz('作者為何認為把空閒變另一節課有害？',[
    '孩子放學已累，再加課業可令休息消失',
    '因為放學後所有孩子都必然不再能閱讀',
    '因為課外活動絕對不能教會任何有用技能',
    '因為孩子在校時完全沒有承受過任何壓力',
  ],'放學後已有課堂、功課和評估等負擔。'),
  quiz('排滿晚上週末的課業如何改變學習感受？',[
    '學習可像牢籠，而非成長的來源',
    '學習必然變得更輕鬆且毫無壓力',
    '所有孩子都會立即放棄任何電子遊戲',
    '每份工作紙都自動變成自由玩樂時間',
  ],'失去休息時，原本有益的學習變得像束縛。'),
  quiz('學校、補習和網上練習排滿的孩子，可能出現甚麼反差？',[
    '表面看似高效，實際卻焦慮反感且動機下降',
    '表面看似疲累，實際上必然沒有任何功課',
    '表面看似遊玩，實際已完全沒有任何學習',
    '表面看似高效，實際必然永遠心情愉快',
  ],'外界可見的忙碌與內在心理狀態未必一致。'),
  quiz('玩樂可培養哪些工作紙難以直接提供的能力？',[
    '合作、控情緒、獨立和解決問題',
    '只會背誦工作紙上的每一個答案',
    '只能提高考試試卷的印刷速度',
    '只能令所有孩子停止與別人交談',
  ],'原文列玩樂的非正式學習成果。'),
];
const logic=[
  sequence('支持方為何認為教育性休閒有價值',[
    ['家長擔心','無安排時間可能耗於螢幕和被動娛樂。'],
    ['活動內容','閱讀、語言、音樂和解謎可強化技能。'],
    ['習慣形成','放學後閱讀可能培養專注與好奇。'],
    ['支持方解讀','這些活動可視為對未來的準備。'],
  ],'支持方談的是適量活動的可能好處，不等於必須排滿空閒。'),
  sequence('作者為何把休息玩樂放在前面',[
    ['已有負擔','放學時孩子已受課堂、功課和評估消耗。'],
    ['時間被佔','晚間週末再加課業會令休息消失。'],
    ['表裡反差','忙碌外表可掩蓋焦慮、反感及動機下降。'],
    ['玩樂價值','遊戲運動交談能教合作、自制和解難。'],
    ['最後界線','不應把每段空閒都安排成學業時段。'],
  ],'自由時間有恢復和成長功能，並非沒有課業就是浪費。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('社區中心想在週末提供自願的音樂和解謎活動，家長同時擔心孩子沒有時間休息。','哪項最符合範文的平衡看法？',[
    '適量活動可培養技能，但別把每段空閒都排滿',
    '只要活動有教育性，就應把所有週末時間填滿',
    '既然孩子需要休息，便永遠不應再碰任何樂器',
    '只有工作紙算學習，音樂與解謎完全沒有價值',
  ],['承認自願教育活動的可能好處，保留休息。','忽略壓力與休息。','過度否定活動好處。','忽略非正式技能。'],[4,5,7,14],'作者承認適量活動可培養技能，反對讓課業佔滿空閒。'),
  transfer('家長發現孩子放學後只看影片，想提出一項低壓而有學習價值的選擇。','哪項最貼近支持方的有效例子？',[
    '邀請孩子自願閱讀或解謎，並留有自由遊玩的時間',
    '強制孩子每晚連做四小時工作紙，不准離開座位',
    '完全取消任何可選活動，只許孩子看同一套影片',
    '只替孩子填滿測驗日程，毋須問他是否已經疲倦',
  ],['閱讀解謎可在非正式環境培養技能，但毋須佔盡時間。','把自願活動變壓力。','未回應被動娛樂。','忽略放學負擔。'],[3,4,5],'支持者舉閱讀、語言、音樂和解謎的有限好處。'),
  transfer('少年球員每晚結束訓練後還要上網課，教練見他完成課表，卻發現他愈來愈焦慮。','哪項最能解釋表面與實際的反差？',[
    '課表看似完成很多，球員仍可能焦慮且失去動機',
    '只要課表全部完成，球員便必然身心都很健康',
    '球員出現焦慮，代表他從來沒有參與任何訓練',
    '網課數量愈多，球員就一定有愈多時間玩樂',
  ],['忙碌與可見產出未必代表健康成長。','把外在產出當內在狀態。','題境明說有訓練。','與時間擠壓相反。'],[8,9,10],'學校補習網練連續不斷時，孩子可能表面高效而實際焦慮。'),
  transfer('學校想取消所有自由遊戲，改派更多工作紙；教師認為遊戲時間沒有任何學習價值。','哪項最能回應這個判斷？',[
    '遊戲能教合作與控情緒，並非毫無收穫的時間',
    '只有工作紙會讓孩子學習，遊戲必定只會浪費',
    '遊戲可完全取代課堂，孩子永遠不再需要老師',
    '只要孩子會玩遊戲，就必定自動通過所有考試',
  ],['玩樂能形成工作紙難直接提供的能力。','與原文的玩樂價值相反。','過度否定課堂。','過度保證考試。'],[11,12,15],'玩樂並非空白；孩子可透過遊戲學合作、控情緒與解難。'),
  transfer('家長為孩子排滿課後課程，孩子說自己每天都像被關在學習裏。','哪項最準確轉用範文的比喻？',[
    '額外任務佔盡休息時，學習可由成長變成牢籠',
    '只要課程排得夠密，孩子必然能得到更多休息',
    '孩子形容學習像牢籠，證明所有課外活動都無用',
    '既然孩子感到壓力，學校應取消每一科正式課程',
  ],['比喻說失去休息後，學習的感受與價值反轉。','與休息消失相反。','過度概括。','未針對空閒排程。'],[7,8,9],'晚間週末都被任務填滿時，學習可像牢籠而非成長來源。'),
  transfer('一名孩子在自由時間與朋友踢球、商量規則並化解爭執。','按範文，這些活動可能教會甚麼？',[
    '合作、管理情緒與處理問題，這些不是空白時間',
    '只有背誦工作紙答案，其他能力完全不可能學到',
    '只要參加一場球賽，便能保證所有科目考到滿分',
    '踢球只會增加學業壓力，與社交能力完全沒有關係',
  ],['遊戲和運動可提供非正式的社交及解難學習。','否定非正式學習。','把可能好處誇成保證。','忽略題境中的合作。'],[11,12],'遊戲和運動可教合作、情緒控制及解難。'),
  transfer('醫院主管希望護士每個休息日都參加訓練，理由是訓練有助日後工作。','哪項論證最像範文的讓步後反對？',[
    '訓練可能出於好意，但不應佔去每一個休息日',
    '只要主管有好意，任何休息日都必須全用於訓練',
    '只要護士需要休息，便永遠不需學新的醫療技能',
    '主管是否有好意，完全取決於訓練教材的顏色',
  ],['先承認好意與技能用途，再指出要求過度。','好意不消除壓力。','過度否定學習。','無關的評價標準。'],[1,13,14],'結論承認父母好意，仍反對要求孩子把空閒用於學習。'),
  transfer('閱讀社團安排自願親子閱讀，但不設考試；另一方案要求每晚交閱讀測驗。','哪項最符合範文對「教育性休閒」的界線？',[
    '自願閱讀可培養好奇，強制測驗卻可能把休閒變課堂',
    '只要名為閱讀，測驗再密也不會帶來任何壓力',
    '既然自願閱讀有用，所有孩子便須每晚交同樣測驗',
    '只要不設考試，閱讀便完全不可能培養任何能力',
  ],['區分低壓技能活動與額外學業要求。','忽略密集要求。','把可能好處轉成強制。','否定閱讀的作用。'],[4,5,7],'適量閱讀可培養專注與好奇，把空閒變另一節課會加壓。'),
  transfer('家長說孩子的每一小時都要有可量度的學業成果，否則就是浪費。','哪項最能回應這個說法？',[
    '休息玩樂有恢復與社交價值，不需每小時有學業目標',
    '每一小時都必須填滿練習，否則孩子必然無法成長',
    '只有考試分數能證明成長，合作與自制全都無價值',
    '孩子需要遊玩，因此正式學校課堂也應全部取消',
  ],['空閒本身支持恢復與發展，不等於浪費。','重複過密安排。','忽略非學業能力。','過度否定學校。'],[12,14,15],'童年不應被排程到每段空閒都有學業目的。'),
  transfer('社區中心要用一句話總結兒童自由時間的價值，避免把「沒有課業」等同「沒有成長」。','哪句最貼近範文結尾？',[
    '自由時間讓孩子喘息、玩樂、成長，並非浪費時間',
    '自由時間只會浪費，只有課後測驗才代表真正成長',
    '孩子只要有自由時間，就再也不用接觸任何新知識',
    '所有活動必須由成人計分，否則就不算孩子的成長',
  ],['自由時間有恢復與全面發展的正面價值。','與結尾相反。','過度否定學習。','把成長錯限於計分。'],[11,12,15],'自由時間並非浪費，孩子可在其中喘息成長。'),
];
export default {key:'discuss-both-views:14',meta:{topic:'孩子空閒時應參加教育活動還是自由休息',summary:'適量自願學習可培養技能，但空閒需要恢復、玩樂與社交；不應把每段自由時間排成課堂。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
