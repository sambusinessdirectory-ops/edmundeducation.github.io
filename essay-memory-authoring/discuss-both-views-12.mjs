// Full source-specific memorisation support for Discuss Both Views 12.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-12-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:12'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'More schools are worried about how students behave because teachers now often have to deal with students who interrupt lessons as well as teach.',
  'Some people say teachers should do most of the work to keep order, while others say parents should lead.',
  'I think teachers are important for making students follow rules at school, but parents should do most of the work to teach children how to behave.',
  'On one side, teachers clearly need to make the classroom a place where students can learn without being interrupted.',
  'Because students spend many hours in class, schools need rules to stop lessons from being broken up again and again.',
  'For example, if a pupil keeps speaking over others, will not do what the teacher asks or stops other children from working, the teacher must act at once; if not, everyone in the class may have trouble learning.',
  'In this way, keeping good order is part of teaching.',
  'If teachers cannot keep basic order in class, even a very good teacher may find it hard to teach well.',
  'Schools can also respond to the same behaviour in the same way, such as keeping students after class or writing reports about their behaviour, so students know there are limits to what they can do.',
  'On the other side, children usually start learning how to behave well long before they begin school.',
  'Parents are the first people to teach children to treat others well, control themselves and do what they should.',
  'If no one at home has taught a child to listen to adults, control anger or accept what happens after breaking rules, teachers must try to change habits that are already hard to change.',
  'For example, a child who is allowed to shout, ignore rules or blame others at home is likely to act in the same way at school.',
  'Teachers can deal with this behaviour for a short time, but parents help form the kind of person who does it.',
  'This is why help and direction from parents matter more at the deepest level than punishment at school.',
  'To sum up, teachers must keep good order at school because children cannot learn when everything is out of control.',
  'But I think parents have the bigger duty because children mainly learn at home how to respond to rules, treat others well and control themselves.',
  'A school can make students follow rules, but a family helps them form the habits that let those rules work.',
];
const vocabulary=[
  [['Discipline','how students behave','紀律'],['growing concern','More schools are worried','日益關注'],['disruptive behaviour','students who interrupt lessons','擾亂課堂行為'],['academic duties','teach','教學職責']],
  [['mainly responsible','do most of the work','主要負責'],['maintaining discipline','keep order','維持紀律'],['parents must take the lead','parents should lead','父母主導']],
  [['In my view','I think','在我看來'],['enforcing rules at school','making students follow rules at school','學校執行規則'],['bear the primary responsibility','do most of the work','承擔主要責任'],['shaping children’s behaviour','teach children how to behave','塑造孩子行為']],
  [['On the one hand','On one side','一方面'],['orderly learning environment','place where students can learn without being interrupted','有秩序學習環境']],
  [['Since','Because','由於'],['classrooms','class','課室'],['rules','rules','規則'],['lessons','lessons','課堂'],['constantly interrupted','broken up again and again','不斷被打斷']],
  [['For example','For example','例如'],['repeatedly talks over others','keeps speaking over others','反覆打斷'],['refuses to follow instructions','will not do what the teacher asks','拒絕遵從指示'],['distracts classmates','stops other children from working','分散同學注意'],['respond immediately','act at once','立即回應'],['otherwise','if not','否則'],['whole class may suffer','everyone in the class may have trouble learning','全班受影響']],
  [['In this sense','In this way','從這意義'],['discipline','keeping good order','紀律'],['not separate from education','part of teaching','與教育不可分']],
  [['Without','If teachers cannot keep','如果沒有'],['basic classroom control','basic order in class','基本課堂管理'],['most skilled teacher','very good teacher','最有能力教師'],['struggle to teach effectively','find it hard to teach well','難有效教學']],
  [['consistent consequences','respond to the same behaviour in the same way','一致的處置'],['detentions','keeping students after class','留堂'],['behavioural reports','writing reports about their behaviour','行為報告'],['actions have limits','there are limits to what they can do','行為有界線']],
  [['On the other hand','On the other side','另一方面'],['good discipline','how to behave well','良好紀律'],['long before','long before','早在'],['enters the classroom','begin school','進課室']],
  [['Parents','Parents','父母'],['respect','treat others well','尊重'],['self-control','control themselves','自制'],['responsibility','do what they should','責任感']],
  [['never been taught at home','no one at home has taught','在家未受教'],['listen to adults','listen to adults','聽從成年人'],['control anger','control anger','控制怒氣'],['accept consequences','accept what happens after breaking rules','接受後果'],['forced to repair habits','must try to change habits','被迫修正習慣'],['deeply rooted','already hard to change','根深蒂固']],
  [['For instance','For example','例如'],['allowed to shout','allowed to shout','容許大叫'],['ignore rules','ignore rules','無視規則'],['blame others','blame others','責怪他人'],['bring the same behaviour into school','act in the same way at school','帶到學校']],
  [['manage such behaviour temporarily','deal with this behaviour for a short time','暫時管理行為'],['shape the character behind it','help form the kind of person who does it','塑造背後品格']],
  [['parental guidance','help and direction from parents','父母引導'],['more fundamental','matter more at the deepest level','更根本'],['school punishment','punishment at school','學校懲罰']],
  [['In conclusion','To sum up','總結'],['maintain discipline','keep good order','維持紀律'],['within school','at school','在學校'],['learning cannot happen in chaos','children cannot learn when everything is out of control','混亂中難學習']],
  [['However','But','然而'],['greater responsibility','bigger duty','更大責任'],['attitudes towards authority','how to respond to rules','對權威的態度'],['respect','treat others well','尊重'],['self-control','control themselves','自制'],['formed at home','learn at home','家中形成']],
  [['enforce rules','make students follow rules','執行規則'],['family builds the habits','family helps them form the habits','家庭建立習慣'],['make those rules work','let those rules work','使規則有效']],
];
const chunkOverrides=[
  ['Discipline has become a growing concern','in many schools, as teachers increasingly have to deal','with disruptive behaviour alongside their academic duties.'],
  ['While some people argue that teachers','should be mainly responsible for maintaining discipline,','others believe that parents must take the lead.'],
  ['In my view, although teachers play an important role','in enforcing rules at school,','parents should bear the primary responsibility','for shaping children’s behaviour.'],
  ['On the one hand, teachers are clearly responsible','for creating an orderly learning environment.'],
  ['Since students spend many hours in classrooms,','schools must have rules that prevent lessons','from being constantly interrupted.'],
  ['For example, if a student repeatedly talks over others,','refuses to follow instructions, or distracts classmates,','the teacher has to respond immediately;','otherwise, the whole class may suffer.'],
  ['In this sense, discipline','is not separate from education.'],
  ['Without basic classroom control,','even the most skilled teacher','may struggle to teach effectively.'],
  ['Schools can also provide consistent consequences,','such as detentions or behavioural reports,','so that students understand that actions have limits.'],
  ['On the other hand, good discipline','usually begins long before','a child enters the classroom.'],
  ['Parents are the first people','who teach children respect, self-control, and responsibility.'],
  ['If a child has never been taught at home','to listen to adults, control anger, or accept consequences,','teachers are forced to repair habits','that have already become deeply rooted.'],
  ['For instance, a child who is allowed to shout,','ignore rules, or blame others at home','is likely to bring the same behaviour into school.'],
  ['Teachers can manage such behaviour temporarily,','but parents shape the character behind it.'],
  ['This is why parental guidance','is more fundamental than school punishment.'],
  ['In conclusion, teachers must maintain discipline within school','because learning cannot happen in chaos.'],
  ['However, I believe parents have the greater responsibility,','as children’s attitudes towards authority, respect,','and self-control are mainly formed at home.'],
  ['A school can enforce rules,','but a family builds the habits','that make those rules work.'],
];
const simpleChunkOverrides=[
  ['More schools are worried about how students behave','because teachers now often have to deal','with students who interrupt lessons as well as teach.'],
  ['Some people say teachers should do most of the work','to keep order, while others say parents should lead.'],
  ['I think teachers are important for making students follow rules at school,','but parents should do most of the work','to teach children how to behave.'],
  ['On one side, teachers clearly need to make','the classroom a place where students can learn','without being interrupted.'],
  ['Because students spend many hours in class,','schools need rules to stop lessons','from being broken up again and again.'],
  ['For example, if a pupil keeps speaking over others,','will not do what the teacher asks','or stops other children from working,','the teacher must act at once;','if not, everyone in the class may have trouble learning.'],
  ['In this way, keeping good order','is part of teaching.'],
  ['If teachers cannot keep basic order in class,','even a very good teacher','may find it hard to teach well.'],
  ['Schools can also respond to the same behaviour in the same way,','such as keeping students after class','or writing reports about their behaviour,','so students know there are limits to what they can do.'],
  ['On the other side, children usually start learning','how to behave well long before they begin school.'],
  ['Parents are the first people to teach children','to treat others well, control themselves','and do what they should.'],
  ['If no one at home has taught a child','to listen to adults, control anger','or accept what happens after breaking rules,','teachers must try to change habits','that are already hard to change.'],
  ['For example, a child who is allowed to shout,','ignore rules or blame others at home','is likely to act in the same way at school.'],
  ['Teachers can deal with this behaviour for a short time,','but parents help form the kind of person who does it.'],
  ['This is why help and direction from parents','matter more at the deepest level than punishment at school.'],
  ['To sum up, teachers must keep good order at school','because children cannot learn','when everything is out of control.'],
  ['But I think parents have the bigger duty','because children mainly learn at home','how to respond to rules, treat others well','and control themselves.'],
  ['A school can make students follow rules,','but a family helps them form the habits','that let those rules work.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('School safety has become a growing concern, as teachers increasingly have to deal with conflicts alongside teaching.','以 as 說紀律問題隨教師工作負擔增加',[1,3,9],fixed(0,'[紀律] has become [日益受關注的問題], as [教師] increasingly have to deal with [擾亂行為] alongside [教學責任].','開篇指出教師除了教書還要應付行為問題。','要界定一個日益嚴重的問題，並說它如何增加原有工作負擔時。',[' has become ', ', as ', ' increasingly have to deal with ', ' alongside '],['被討論的問題','日益增加的關注','額外承擔的人','新增的難題','本來的職責'])),
  card('While some people argue that coaches should set all rules, others believe that families must take the lead.','以 While some ... others ... 並列教師與家長責任',[0,2,9],fixed(1,'While some people argue that [教師主責維持紀律], others believe that [家長應帶頭].','準確交代題目的兩種責任分配。','題目有兩種主責看法，需要先平衡陳述各方而不偷換時。',['While some people argue that ', ', others believe that '],['第一派的責任主張','第二派的責任主張'])),
  card('In my view, although coaches enforce rules during games, families should bear primary responsibility for young players.','以 although 讓步教師校內角色，仍選父母主責',[1,3,16],fixed(2,'In my view, although [教師校內執行規則], [家長] should bear [主要責任] for [塑造兒童行為].','引言選父母主責，但保留教師在校的作用。','兩方都參與某工作，需承認一方局部職責再說誰應主責時。',['In my view, although ', ', ', ' should bear ', ' for '],['先承認的局部角色','最終主責者','其責任程度','受影響的長期行為'])),
  card('On the one hand, teachers are clearly responsible for creating a calm place to learn.','以 On the one hand 公平展開教師的校內責任',[2,4,9],fixed(3,'On the one hand, [教師] are clearly responsible for creating [有秩序的學習環境].','第一主體段承認課堂秩序由教師在現場維持。','已表態另一方較重要，仍需公平界定某方在自己場域的責任時。',['On the one hand, ', ' are clearly responsible for creating '],['在場的責任主體','必須維持的環境'])),
  card('Since children spend much of the day in class, schools must have rules that prevent constant disruption.','以 Since 說課堂時間長使校內規則必要',[3,5,7],fixed(4,'Since [學生長時間在課室], [學校] must have rules that prevent [課堂不斷中斷].','規則保障一整班的教學時間不被反覆打斷。','要由某群人長時間共用場域，推論需要穩定規則時。',['Since ', ', ', ' must have rules that prevent '],['需要規則的共同情境','有權定規則的機構','規則要防止的干擾'])),
  card('For example, if a pupil keeps shouting over others, the teacher has to respond immediately; otherwise, other pupils may suffer.','以 if ... otherwise ... 說教師不處理會害全班',[4,6,8],fixed(5,'For example, if [學生反覆打斷、拒指示或分散注意], [教師] has to respond immediately; otherwise, [全班] may suffer.','現場干擾不能留待家長之後處理，教師須立即回應。','已提出規則必要，要用具體違規行為說明不即時處理的後果時。',['For example, if ', ', ', ' has to respond immediately; otherwise, ', ' may suffer.'],['觸發行動的違規情況','當下須回應的人','不回應會受影響的群體'])),
  card('In this sense, basic safety is not separate from good sports training.','以 not separate from 概括紀律與教學相連',[4,5,7],fixed(6,'In this sense, [紀律] is not separate from [教育].','學習要進行，先要有基本課堂秩序。','具體例子已說明，需指出一項支持條件其實是核心工作的部分時。',['In this sense, ', ' is not separate from '],['被誤認為附帶事項的條件','它所支撐的核心工作'])),
  card('Without basic order, even a very good coach may struggle to teach.','以 Without ... even ... 說教師能力不能補無秩序',[5,6,8],fixed(7,'Without [基本課堂管理], even [最有能力的教師] may struggle to [有效教學].','再強的教學能力也要有可教的環境。','要說明缺少基本條件時，即使能力很強也難完成任務時。',['Without ', ', even ', ' may struggle to '],['欠缺的基礎條件','本來具能力的人','因而難做到的工作'])),
  card('Schools can also provide steady consequences, such as reports, so that pupils learn that actions have limits.','以 such as ... so that 提出一致的學校處置及目的',[5,7,9],fixed(8,'[學校] can also provide [一致處置], such as [留堂或行為報告], so that [學生明白行為界線].','教師責任不只即時制止，也包括一致傳達界線。','要列出制度可以採取的具體措施，並說明措施要使人理解甚麼時。',[' can also provide ', ', such as ', ', so that '],['能執行措施的機構','需一致維持的處置','可見的處置例子','希望形成的理解'])),
  card('On the other hand, respect for others usually begins long before children join a sports team.','以 long before 說良好紀律始於入學前',[3,8,10],fixed(9,'On the other hand, [良好紀律] usually begins long before [孩子入課室].','第二主體段指出行為習慣源自更早的家庭教養。','已說某機構現場管理，需轉入行為更早在哪裏形成時。',['On the other hand, ', ' usually begins long before '],['要追溯來源的習慣','它被機構看見的時間點'])),
  card('Experienced nurses are the first people who teach new staff safe routines.','以 first people 說父母作早期品格教育者',[9,11,13],fixed(10,'[最早的教導者] are the first people who teach [對象及所教內容].','父母較早開始教做人準則，這是主責的時間理由。','要指出某種長期習慣由誰最先教導，以及內容包括甚麼時。',[' are the first people who teach '],['最早教導的人','受教者與所教內容'])),
  card('If children never learn at home to wait, listen and accept limits, teachers are forced to repair habits already hard to break.','以 If ... teachers are forced ... 說家庭缺教增加教師負擔',[10,12,14],fixed(11,'If [孩子在家未學聆聽控怒接受後果], [教師] are forced to repair [根深蒂固的習慣].','校內教師可能要補救家庭已形成的行為模式。','要說明早期缺少某種教導時，後來機構須修補甚麼時。',['If ', ', ', ' are forced to repair '],['早期未養成的行為','後來被迫補救的人','已成形的難改習慣'])),
  card('For instance, a child allowed to ignore rules at home is likely to bring the same behaviour into class.','以 who ... is likely to ... 說家中習慣延伸入學校',[10,11,13],fixed(12,'For instance, [家中可大叫、無視規則、責怪人的孩子] is likely to bring [相同行為] into [學校].','家庭容許的行為往往會跟孩子進課室。','已說早期習慣難修，要用同一行為跨兩個場景的例子作證時。',['For instance, ', ' is likely to bring ', ' into '],['在起始環境被容許的人及行為','被帶到新環境的模式','下一個場域'])),
  card('Teachers can manage shouting temporarily, but parents shape the habits that lie behind it.','以 can ... but ... 區分短期管理與長期塑造',[11,12,14],fixed(13,'[教師] can manage [行為] temporarily, but [家長] shape [背後品格].','教師處理當下行為，父母形成較深層的習慣。','要區分一方只處理當刻表現，另一方影響長期根源時。',[' can manage ', ' temporarily, but ', ' shape '],['處理當下的人','可暫時管理的表現','影響根源的人','較深層的特質'])),
  card('This is why regular practice is more fundamental than a last-minute warning.','以 This is why 由前句推出父母引導較根本',[10,13,15],fixed(14,'This is why [父母引導] is more fundamental than [學校懲罰].','家庭形成品格的作用比學校事後處罰更根本。','前句已分清短期處理與長期形成，需抽出優先次序時。',['This is why ', ' is more fundamental than '],['較根本的早期影響','較後期的處置'])),
  card('In conclusion, coaches must maintain order during practice because nobody learns in chaos.','以 because 收束教師校內維持秩序的必要性',[4,7,16],fixed(15,'In conclusion, [教師] must maintain [校內紀律] because [混亂妨礙學習].','結論先重申教師在場維持秩序的必要角色。','結論先公平重述較少支持的一方，及其不可省略的理由時。',['In conclusion, ', ' must maintain ', ' because '],['當場有責任的人','需維持的基礎條件','欠缺它的後果'])),
  card('However, I believe families have the greater duty, as children’s habits are mainly formed at home.','以 as 說態度習慣主要在家形成',[2,14,15],fixed(16,'However, I believe [家長] have [較大責任], as [權威觀、尊重與自制習慣] are mainly formed [家中].','最後重申父母主責，理由是長期行為態度在家形成。','已承認某方現場責任，仍需說明另一方何以對根源負更大責任時。',['However, I believe ', ' have ', ', as ', ' are mainly formed at '],['較應主責的人','責任程度','形成較早的態度習慣','主要形成的場域'])),
  card('A school can enforce rules, but a family builds habits that help children follow them.','以 A can ... but B ... 對照規則與使規則有效的習慣',[13,15,16],fixed(17,'[學校] can enforce [規則], but [家庭] builds [使規則有效的習慣].','結尾把兩種責任連起來：校規需要家庭習慣作基礎。','要用一個可執行的規則和另一方培養的前提，說明兩者如何互補時。',[' can enforce ', ', but ', ' builds '],['執行規則的機構','被執行的規則','建立前提的群體','使規則生效的習慣'])),
];
const wrongReasons=[
  ['這句列兩種責任主張，未先交代教師工作負擔與問題增加。','這句已表達作者立場，原句只界定問題及背景。','這句轉入教師的課室責任，原句仍在開篇說明難題。'],
  ['這句交代紀律問題，未平衡列出教師與父母兩派。','這句已選家長主責，未先呈現題目兩方觀點。','這句只展開教師的一方，未並列雙方主責主張。'],
  ['這句仍在平衡介紹兩方，未用 although 讓步後表態。','這句只有教師應負的校內責任，未選家長主責。','這句是結論重申立場，並非引言中帶讓步的立場句。'],
  ['這句是引言選邊，未轉入教師在校負責的主體段。','這句用 Since 解釋規則必要，原句先界定教師的責任。','這句轉向父母的早期責任，語意方向與本句相反。'],
  ['這句概括教師責任，未以課室時間作規則必要的理由。','這句以違規例子說即時回應，並非由共同場域推導規則。','這句以 Without 說缺乏秩序的後果，並非解釋規則的前提。'],
  ['這句說規則的普遍必要，未提出 if 例子及 otherwise 後果。','這句抽象概括紀律與教育關係，沒有違規情境。','這句列學校一致處置，非教師當場回應及全班受害的條件。'],
  ['這句解釋規則的需要，未以 not separate from 概括關係。','這句是違規場景與後果，未抽出紀律屬教育一部分。','這句談缺乏基本秩序時教師難教，未直接界定兩者關係。'],
  ['這句列教師需維持的環境，未以 Without 和 even 強調必要條件。','這句只概括紀律與教育相連，未說連優秀教師也受限。','這句提出一致處置措施，不是缺乏秩序時的能力上限。'],
  ['這句是即時處理違規，未列長期一致處置與 so that 的目的。','這句談無秩序時能力再強也難教，未舉處置例子。','這句改談家長的早期教養，並非學校的具體規則。'],
  ['這句仍在談學校提供的處置，未轉向更早形成的習慣。','這句指出父母最早教甚麼，未以 long before 追溯起點。','這句是條件句說家庭缺教的後果，未先提出早期來源。'],
  ['這句概括紀律始於入學前，未指明誰教及教甚麼。','這句說未教好時教師被迫補救，並非正面界定父母角色。','這句是家中放任行為的例子，未列尊重自制責任感。'],
  ['這句說父母最先教習慣，未用 If 展示缺教後果。','這句舉家中放任的實例，未概括教師被迫修補的機制。','這句直接對照教師與父母作用，未提出早期缺教條件。'],
  ['這句分析家庭缺教後的教師負擔，未舉可見行為的個案。','這句只說父母最初教甚麼，沒有跨場景的同一行為。','這句概括長短期作用，未呈現孩子把家中行為帶進學校。'],
  ['這句是家中行為延伸入校的例子，未以 but 分工。','這句已抽成父母引導比學校懲罰根本，未先分清兩方作用。','這句是結論重述教師角色，未對照短期管理與品格形成。'],
  ['這句分開教師短期管理與父母長期塑造，未以 This is why 推論。','這句已在結論談教師維持秩序，未比較引導與懲罰的根本性。','這句結論解釋家長主責，未緊接前句抽出優先次序。'],
  ['這句是學校一致處置措施，非結論中因果式重申教師角色。','這句是父母引導較根本的推論，未公平保留教師現場職責。','這句是結論第二句的作者立場，原句先承認教師校內責任。'],
  ['這句是引言預告立場，未在結論用 as 重申家庭成因。','這句只說父母引導較根本，未提具體態度主要在哪裏形成。','這句是最後的規則與習慣對照，未明說作者選誰主責。'],
  ['這句對照短期行為管理與品格形成，未講規則如何依靠家庭習慣。','這句是家長主責的結論理由，未以學校可做甚麼、家庭做甚麼收束。','這句結論先說教師校內責任，未連接規則與使規則生效的習慣。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清課室即時秩序與家庭長期習慣，再判斷誰負主要責任。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要比較哪兩種維持紀律的主要責任？',[
    '教師在學校管理，與父母在家塑造行為',
    '教師與家長誰該負責所有考試成績',
    '學校與家庭誰應提供更多電子教材',
    '老師與學生誰應決定放學交通安排',
  ],'題目比較教師與家長在兒童紀律上的責任。'),
  {type:'multi',prompt:'選出作者的完整立場',detail:'選兩項，再按「確認」。',options:[
    '教師必須在校維持可教學的基本秩序',
    '父母應主責塑造孩子長期的行為習慣',
    '只要父母教得好，學校便不需任何規則',
    '學校能用懲罰完全代替家庭日常教養',
  ],correct:[0,1],why:'作者承認兩方都重要，但把較根本的塑造責任給父母。'},
];
const route=[sequence('依文章次序排列責任論證',[
  ['引言分清主責','教師執行校規，父母塑造兒童行為並應主責。'],
  ['學校即時責任','課堂規則、即時處理干擾、一致的處置保障學習。'],
  ['家庭形成習慣','尊重自制責任感先在家養成，教師難修補深根行為。'],
  ['結論連接兩方','學校執行規則，家庭培養能使規則有效的習慣。'],
],'全文先承認教師能管理學校現場，再以行為的形成時間和深度支持父母主責。')];
const evidence=[
  quiz('為何學校需要防止課堂不斷被打斷的規則？',[
    '學生長時間共用課室，反覆干擾會影響全班學習',
    '所有學生都只在家裏學習，課室秩序沒有影響',
    '制定規則便能令教師不用再處理任何現場問題',
    '規則的唯一目的，是讓每個學生獲得更多留堂',
  ],'原文以學生長時間在課室作為規則必要的前提。'),
  quiz('學生反覆打斷和拒絕指示時，教師為何要即時回應？',[
    '若不處理，整班的課堂可能受到影響',
    '教師只需等到學生畢業才考慮處理',
    '因為這可證明父母完全沒有任何作用',
    '因為每次課堂打斷都代表學生沒有能力',
  ],'otherwise 引出不即時回應對全班的後果。'),
  quiz('留堂和行為報告在論證中有甚麼作用？',[
    '提供一致的處置，讓學生明白行為有界線',
    '取代所有家長教導，讓家庭不用再負責',
    '證明學生一旦留堂，往後便絕不再犯',
    '只為增加學校文件數量，與紀律無關',
  ],'例子連接學校處置與學生對界線的理解。'),
  quiz('孩子在家未學會聆聽、控怒和接受後果，教師會面對甚麼？',[
    '要修正已成形而且難改的行為習慣',
    '只需把所有規則取消，問題就會消失',
    '可以單靠一次告誡立即改變任何品格',
    '完全不會受影響，因為家中習慣不會進校',
  ],'原文說教師被迫補救已深植的習慣。'),
  quiz('家中容許大叫和無視規則的孩子，例子證明甚麼？',[
    '在家形成的行為模式可能延伸到學校',
    '家庭行為與學校表現永遠完全相反',
    '教師能靠一次留堂塑造全部長期品格',
    '家長只對學校文件格式負主要責任',
  ],'同一行為跨兩個場景，支持父母較早塑造習慣。'),
  quiz('教師與家長的作用在文中如何不同？',[
    '教師暫時管理行為，家長塑造背後的品格',
    '教師塑造出生前習慣，家長只管留堂',
    '兩者都只能改變課室座位，不能影響行為',
    '家長只教學科內容，教師只安排家庭作息',
  ],'作者以暫時管理與深層塑造分配責任。'),
  quiz('結尾「規則」與「習慣」有甚麼關係？',[
    '學校能執行規則，家庭培養使規則有效的習慣',
    '只要規則寫在紙上，家庭便不用教任何習慣',
    '家中習慣可完全取代學校對現場的管理',
    '每條規則都只適用於家裏，學校無權執行',
  ],'結句把兩方責任連起來，並保留家長較根本的作用。'),
];
const logic=[
  sequence('為何教師必須維持學校秩序',[
    ['共同課室','學生長時間共用課室，課堂需要可預期的規則。'],
    ['即時干擾','反覆插話、拒指示會影響全班。'],
    ['現場回應','教師須即時處理，學校可給一致處置。'],
    ['學習前提','沒有基本秩序，再好的教師也難有效教學。'],
  ],'教師的責任是維持正在發生的教學環境。'),
  sequence('為何父母應負主要責任',[
    ['時間先後','孩子入學前已開始學尊重與自制。'],
    ['家庭習慣','家中容許的行為會延伸到課室。'],
    ['補救限度','教師可暫時管理，但難改已深植的品格。'],
    ['主責結論','父母培養能使校規發揮作用的習慣。'],
  ],'父母的作用較早，也更接近行為的根源。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間社區游泳班常有人在教練解說時反覆吵鬧，令其他學員聽不到指示。','依範文的現場責任，教練最應先做甚麼？',[
    '即時制止干擾，保護其他學員繼續學習的機會',
    '只提醒吵鬧學員安靜，不訂反覆干擾的後續處置',
    '只把教練聲音放大，不處理學員的反覆吵鬧',
    '只讓受影響者移到前排，不恢復全班秩序',
  ],['原文以全班可能受影響，支持在場教師即時處理。','提醒可作第一步，但反覆干擾需有即時且一致的處理。','放大聲音未恢復全班能聽指示的秩序。','只讓受影響者移動，未處理造成干擾的人。'],[4,5,7],'教師須立即回應反覆干擾，否則整班可能受害。'),
  transfer('學校希望學生明白遲到會影響全班，正討論如何處理反覆遲到。','哪項最符合一致處置的論證？',[
    '事先說清界線，對同類遲到採取一致的處置',
    '只說明遲到有影響，不落實一致的處理方式',
    '只處理個別學生，不向全班說清遲到界線',
    '只增加警告次數，不檢查實際遲到原因',
  ],['一致處置能讓學生看出行為有明確界線。','界線要配合一致處理，否則難讓學生明白後果。','個別處理仍須先讓全班知道共同規則。','警告次數不是一致界線，也未必處理成因。'],[8],'學校可用一致的後果使學生明白行為有界線。'),
  transfer('一位數學老師備課充分，但每節課都被大聲交談反覆打斷。','哪項最準確轉用範文的 Without ... even ... 推理？',[
    '缺乏基本秩序時，即使教師能幹也難有效教學',
    '只改善備課內容，不處理反覆打斷課堂的行為',
    '只要求學生多做功課，不恢復講解時的秩序',
    '只說教師能幹，不分析環境如何妨礙教學',
  ],['教學能力需基本秩序支持，兩者不能互相替代。','備課充分也會被反覆大聲交談打斷。','增加功課未恢復講解的基本秩序。','教師能力重要，仍須有可教學的環境。'],[6,7],'沒有基本課堂控制，再好的教師也可能難有效教學。'),
  transfer('孩子在家可隨意插話，到了戲劇班也常打斷其他同學。','哪項最貼近範文的跨場景習慣例子？',[
    '在家被容許的插話習慣，可能延伸到戲劇班裏',
    '只要求戲劇班嚴管，不問家中插話習慣的延續',
    '只請家長提醒一次，不在戲劇班建立發言界線',
    '只把插話歸為個性，不比較家中與課堂習慣',
  ],['範文以家中容許的行為進入學校作相同推理。','戲劇班要設規則，家中持續形成的習慣也要看。','家長提醒有用，班內仍需維持發言界線。','只說個性，漏了家中習慣可能延伸。'],[11,12],'孩子可能把家中容許的行為帶進學校。'),
  transfer('課後活動的導師可當場處理推撞，但孩子每週仍在家以推撞解決爭執。','哪項最能分清短期管理與長期塑造？',[
    '導師要制止當下推撞，家長須長期教非暴力應對',
    '只由導師當場制止，不教家中長期處理爭執',
    '只由家長講道理，不要求導師即時保障他人',
    '只安排一次道歉，不教孩子往後非暴力應對',
  ],['即時處理與根源習慣都需處理，分工不同。','導師處理當下，家長仍須長期教非暴力應對。','家長教育重要，導師仍要即時保障同學。','道歉不足以建立往後處理爭執的方法。'],[11,12,13],'教師可暫時管理行為，父母塑造背後品格。'),
  transfer('新入職同事屢次不守會議發言規則；主管能維持會議秩序，家中成長習慣則不在其控制內。','哪項寫法最合範文的責任邊界？',[
    '主管可維持會議秩序，長期習慣亦有其他來源',
    '只由主管處理當下會議，不分析習慣形成來源',
    '只責怪家庭成長，不訂會議當下的發言規則',
    '只改會議時間，不處理屢次插話的行為',
  ],['仿照現場管理與長期形成的分工，避免全責推給一方。','主管能維持會議，但長期習慣不全由主管形成。','家庭可能影響習慣，會議當下仍須管理。','改時間未處理不守發言規則。'],[3,13,17],'學校能執行規則，家庭培養使規則有效的習慣。'),
  transfer('運動隊長想在結論承認教練管理訓練的責任，同時主張家庭先教尊重。','哪項結論最符合範文的雙方分工？',[
    '教練須維持訓練秩序，家庭更早培養尊重的習慣',
    '只講家庭先教尊重，不保留教練管理訓練責任',
    '只講教練當下維持秩序，不談家庭較早影響',
    '只把尊重當口號，不說兩方各自的具體角色',
  ],['先保留現場角色，再按習慣形成時間判斷主責。','家庭較早影響不免除教練管理責任。','教練維持秩序有用，家庭長期養成也重要。','口號未比較各方的時點與責任。'],[2,15,16],'結論承認教師維持秩序，再指出父母對習慣形成責任較大。'),
  transfer('圖書館讀書會的主持人要解釋，為何即使講解者很出色，也需大家先保持安靜。','哪項最適合用範文的必要條件推理？',[
    '基本安靜是好講解得以讓人學懂的前提',
    '只讚講解者出色，不處理聽眾反覆交談',
    '只要求主持人講快些，不恢復基本安靜',
    '只增加講義，不問學員是否聽到關鍵說明',
  ],['以缺少基礎條件限制能力，準確轉用 even 結構。','講解再好，交談仍使人聽不清。','講快些不能補上基本安靜環境。','講義有用，但不能替代聽清說明。'],[7],'Without 基本課堂控制，即使最有能力的教師也可能難教。'),
  transfer('校方發現學生常無視排隊規則，正比較告示與家庭平日教導。','哪項最能解釋「規則能否發揮作用」？',[
    '告示說清界線，家庭守規習慣助其落實',
    '只張貼排隊告示，不問家庭平日有否練習',
    '只靠家庭提醒，不在學校說清排隊界線',
    '只懲罰插隊者，不教平日遵守規則的習慣',
  ],['學校的規則需家庭培養的行為習慣支撐。','告示說明界線，家庭習慣影響遵守。','家庭提醒重要，學校仍須明確說明規則。','處分可維持秩序，仍要培養日常守規習慣。'],[14,17],'學校可執行規則，家庭建立能使規則有效的習慣。'),
  transfer('學校和家長討論學生長期欠缺自制力，彼此都承認自己有事要做。','依範文，應用甚麼標準判斷主要責任？',[
    '比較誰最早且持續塑造習慣，同時保留校內管理',
    '只歸責校內管理，不分析更早的家庭習慣',
    '只談家庭養成，不保留學校當下管理責任',
    '只按一次事件分配責任，不看長期形成過程',
  ],['以形成時間及深度判主責，仍承認教師現場職責。','校內管理必要，但長期自制習慣有更早來源。','家庭影響重要，學校仍需管理當下行為。','單次事件不能說明長期習慣形成。'],[2,10,13,16],'父母最早教尊重自制，教師維持校內秩序。'),
];
export default {key:'discuss-both-views:12',meta:{topic:'學校紀律主要應由教師還是父母負責',summary:'教師維持課堂秩序並即時處理干擾；父母更早塑造尊重、自制和責任感，因此應承擔主要責任。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
