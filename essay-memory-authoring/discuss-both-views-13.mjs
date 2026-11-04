// Full source-specific memorisation support for Discuss Both Views 13.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-13-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:13'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Children have been given work to do at home for a long time, but people do not agree about whether this should happen every day.',
  'Some people say children must have homework each day to do well at school, but others say children need regular time away from schoolwork.',
  'I think children should not have homework every day because they learn better when each task has a clear reason, not when they do tasks all the time.',
  'People who want daily homework usually think it helps children form good habits and remember what they learned in class.',
  'When children look again at a topic soon after class, they are more likely to remember its main points and notice what they do not yet understand.',
  'For example, after learning about fractions, a child who works through a few maths questions may spot errors before the next class instead of becoming more and more confused.',
  'Work set every day can also help children follow a regular plan, which may teach those who find planning hard to do what they should.',
  'From this view, homework is more than extra tasks; it gives children a regular way to keep working on what they learn.',
  'But I think homework every day may make learning worse, especially for younger children.',
  'Children need time to rest, play, move their bodies, read for enjoyment and spend time with their families.',
  'If children have more school tasks at the end of every school day, learning may feel as if it never stops, and this can make them want to learn less, not more.',
  'A child who is tired and fills in a task sheet without thinking may not really understand what they are learning.',
  'Also, too much homework can take up time needed for other things that help children do well at school, such as sleep, exercise and learning to get along with others.',
  'These things are not just nice extras; they help children come back to class able to pay attention and manage how they feel.',
  'To sum up, daily homework may help children look again at lessons and build study habits, but it should not be seen as something they must do to succeed.',
  'Schools should give homework when it truly helps children remember and understand what they learned, not just because a new day has come.',
  'A plan that balances homework with other needs is better for learning than giving it every day without thinking.',
];
const vocabulary=[
  [['Homework','work to do at home','功課'],['long-standing part','for a long time','由來已久'],['disagreement','do not agree','意見分歧'],['every day','every day','每天']],
  [['daily homework','homework each day','每日功課'],['essential','must have','必要'],['academic success','do well at school','學業成功'],['regular breaks from schoolwork','regular time away from schoolwork','定期休息']],
  [['In my view','I think','在我看來'],['given homework every day','have homework every day','每天有功課'],['learning is stronger','learn better','學得更好'],['practice is purposeful','each task has a clear reason','練習有明確目的'],['constant','all the time','持續不斷']],
  [['support daily homework','want daily homework','支持每日功課'],['builds discipline','form good habits','培養紀律'],['reinforces classroom learning','remember what they learned in class','鞏固課堂學習']],
  [['pupils','children','學生'],['review a topic','look again at a topic','複習課題'],['shortly after','soon after','不久後'],['key ideas','main points','重點概念'],['identify gaps in their understanding','notice what they do not yet understand','發現理解不足']],
  [['For example','For example','例如'],['practises a few mathematics problems','works through a few maths questions','做幾道數學題'],['fractions','fractions','分數'],['notice mistakes','spot errors','發現錯誤'],['allowing confusion to grow quietly','becoming more and more confused','困惑逐漸加深']],
  [['Daily assignments','Work set every day','每天的功課'],['steady routine','regular plan','穩定習慣'],['less organised students','those who find planning hard','不善安排的學生'],['develop responsibility','do what they should','培養責任感']],
  [['From this perspective','From this view','從這角度'],['not merely extra work','more than extra tasks','不只是額外工作'],['structure','regular way','穩定安排'],['engaged with their studies','keep working on what they learn','持續投入學習']],
  [['However','But','然而'],['giving homework every day','homework every day','每天有功課'],['counterproductive','make learning worse','適得其反'],['younger students','younger children','較年幼的學生']],
  [['rest','rest','休息'],['exercise','move their bodies','運動'],['read for pleasure','read for enjoyment','按興趣閱讀'],['interact with their families','spend time with their families','與家人互動']],
  [['academic tasks','school tasks','學業任務'],['endless conveyor belt','feel as if it never stops','無止境輸送帶'],['weaken motivation','make them want to learn less','削弱動機'],['rather than strengthen it','not more','而非增強']],
  [['tired child','child who is tired','疲倦孩子'],['worksheet','task sheet','工作紙'],['mechanically','without thinking','機械式'],['not necessarily learning deeply','may not really understand what they are learning','不一定學得深入']],
  [['Moreover','Also','此外'],['excessive homework','too much homework','過量功課'],['crowd out activities','take up time needed for other things','擠走活動'],['support success at school','help children do well at school','有助學業成功'],['social development','learning to get along with others','社交發展']],
  [['not luxuries','not just nice extras','並非奢侈'],['return to class','come back to class','回到課堂'],['better concentration','able to pay attention','更能專注'],['emotional balance','manage how they feel','情緒平衡']],
  [['In conclusion','To sum up','總結'],['revise lessons','look again at lessons','複習課堂'],['study habits','study habits','學習習慣'],['requirement for success','something they must do to succeed','成功的必要條件']],
  [['assign homework','give homework','佈置功課'],['genuinely consolidates learning','truly helps children remember and understand what they learned','真正鞏固學習'],['simply because another day has passed','just because a new day has come','只因又過一天']],
  [['balanced approach','plan that balances homework with other needs','平衡做法'],['educationally sound','better for learning','符合教育原則'],['rigid daily routine','giving it every day without thinking','僵化每日安排']],
];
const chunkOverrides=[
  ['Homework is a long-standing part of schooling,','but there is disagreement about whether children','should receive it every day.'],
  ['Some argue that daily homework is essential','for academic success, whereas others believe','that children need regular breaks from schoolwork.'],
  ['In my view, children should not be given homework every day,','because learning is stronger when practice is purposeful','rather than constant.'],
  ['Those who support daily homework usually believe','that it builds discipline and reinforces classroom learning.'],
  ['When pupils review a topic shortly after a lesson,','they are more likely to remember key ideas','and identify gaps in their understanding.'],
  ['For example, a child who practises a few mathematics problems','after studying fractions may notice mistakes','before the next lesson, rather than allowing confusion','to grow quietly.'],
  ['Daily assignments can also create a steady routine,','which may help less organised students develop responsibility.'],
  ['From this perspective, homework is not merely extra work;','it is a structure that keeps children','engaged with their studies.'],
  ['However, I believe that giving homework every day','can be counterproductive, especially for younger students.'],
  ['Children need time to rest, play, exercise,','read for pleasure and interact with their families.'],
  ['If every school day ends with more academic tasks,','education can begin to feel like an endless conveyor belt,','and this may weaken motivation rather than strengthen it.'],
  ['A tired child who completes a worksheet mechanically','is not necessarily learning deeply.'],
  ['Moreover, excessive homework can crowd out activities','that also support success at school,','such as sleep, sport and social development.'],
  ['These are not luxuries;','they help children return to class','with better concentration and emotional balance.'],
  ['In conclusion, daily homework may help students revise lessons','and build study habits, but it should not be treated','as a requirement for success.'],
  ['Schools should assign homework when it genuinely consolidates learning,','not simply because another day has passed.'],
  ['A balanced approach is more educationally sound','than a rigid daily routine.'],
];
const simpleChunkOverrides=[
  ['Children have been given work to do at home for a long time,','but people do not agree about whether','this should happen every day.'],
  ['Some people say children must have homework each day','to do well at school, but others say children','need regular time away from schoolwork.'],
  ['I think children should not have homework every day','because they learn better when each task has a clear reason,','not when they do tasks all the time.'],
  ['People who want daily homework usually think','it helps children form good habits','and remember what they learned in class.'],
  ['When children look again at a topic soon after class,','they are more likely to remember its main points','and notice what they do not yet understand.'],
  ['For example, after learning about fractions,','a child who works through a few maths questions','may spot errors before the next class','instead of becoming more and more confused.'],
  ['Work set every day can also help children follow a regular plan,','which may teach those who find planning hard','to do what they should.'],
  ['From this view, homework is more than extra tasks;','it gives children a regular way','to keep working on what they learn.'],
  ['But I think homework every day may make learning worse,','especially for younger children.'],
  ['Children need time to rest, play, move their bodies,','read for enjoyment and spend time with their families.'],
  ['If children have more school tasks','at the end of every school day,','learning may feel as if it never stops,','and this can make them want to learn less, not more.'],
  ['A child who is tired and fills in a task sheet','without thinking may not really understand','what they are learning.'],
  ['Also, too much homework can take up time','needed for other things that help children do well at school,','such as sleep, exercise and learning to get along with others.'],
  ['These things are not just nice extras;','they help children come back to class','able to pay attention and manage how they feel.'],
  ['To sum up, daily homework may help children look again at lessons','and build study habits, but it should not be seen','as something they must do to succeed.'],
  ['Schools should give homework when it truly helps children','remember and understand what they learned,','not just because a new day has come.'],
  ['A plan that balances homework with other needs','is better for learning than giving it every day without thinking.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Public transport is a long-standing part of city life, but there is disagreement about whether it should be free.','以 but there is disagreement about whether 引出長久做法的爭議',[1,2,8],fixed(0,'[既有做法] is a long-standing part of [某領域], but there is disagreement about whether [應否每日實行].','開篇交代功課由來已久，同時指出頻率仍有爭議。','要先承認一種做法有歷史，再提出其現行形式是否合適時。',[' is a long-standing part of ', ', but there is disagreement about whether '],['既有做法','涉及的領域','正在爭議的做法'])),
  card('Some argue that a daily check is essential for safety, whereas others believe that regular breaks from inspection are needed.','以 Some argue ... whereas others ... 平衡列出雙方主張',[0,3,8],fixed(1,'Some argue that [每日功課] is essential for [學業成功], whereas others believe that [孩子需定期離開課業].','題目兩方被準確交代：每日練習有益，休息也必要。','有兩種相反主張，要在表態前清楚交代各方的理由時。',['Some argue that ', ' is essential for ', ', whereas others believe that '],['第一派主張的做法','第一派要達到的目標','另一派看重的需要'])),
  card('In my view, teams should not meet every day, because planning works better when each meeting has a purpose rather than becoming routine.','以 because ... when ... rather than ... 說有目的勝過不斷重複',[1,7,15],fixed(2,'In my view, [不應每日給功課], because [學習更扎實] when [練習有目的] rather than [機械地不停做].','立場不是反對練習，而是主張有目的的練習。','要否定某事的固定頻率，並以目的或質量比次數重要作理由時。',['In my view, ', ', because ', ' when ', ' rather than '],['所選立場','期望的成效','較有效的條件','需避免的重複做法'])),
  card('Those who support weekly practice usually believe that it builds confidence and improves teamwork.','以 Those who support ... believe that 公平說支持理由',[1,4,6],fixed(3,'Those who support [每日功課] usually believe that [功課培養紀律並鞏固學習].','第一主體段先公平概述支持每日功課的理由。','要進入一方論證，先準確報告支持者相信的效益時。',['Those who support ', ' usually believe that '],['受支持的做法','支持者所認為的作用'])),
  card('When runners practise a skill soon after a lesson, they are more likely to remember the steps and notice what still goes wrong.','以 When ... more likely ... and ... 說課後複習兩項作用',[3,5,6],fixed(4,'When [學生課後不久複習], they are more likely to [記得重點] and [發現理解漏洞].','說明即時複習既鞏固記憶，又暴露未懂之處。','要解釋某做法在特定時機進行，會增加兩種有關成效的可能時。',['When ', ', they are more likely to ', ' and '],['有利時機及做法','第一項較可能成效','第二項較可能成效'])),
  card('For example, a new worker may notice a machine error before the shift, rather than letting confusion grow.','以 For example ... rather than ... 舉及早發現錯誤的例子',[4,6,10],fixed(5,'For example, [做少量分數題的孩子] may notice [錯誤] before [下一課], rather than [讓困惑暗中累積].','具體展示少量練習如何在問題變大前找出錯處。','已說某做法能發現不足，要舉出及早修正與放任問題擴大的對照時。',['For example, ', ' may notice ', ' before ', ', rather than '],['有針對性練習者','及早察覺的問題','問題擴大前的時點','若不發現的後果'])),
  card('A regular rehearsal can also create a steady routine, which may help new actors develop confidence.','以 which may help 說規律安排可能培養責任',[3,5,7],fixed(6,'[每日作業] can also create [穩定習慣], which may help [不善安排的學生] develop [責任感].','加入支持方第二個理由：每天做可形成規律。','已說一項直接學習效益，要補充規律安排可能帶來的行為效益時。',[' can also create ', ', which may help ', ' develop '],['定期進行的任務','它形成的習慣','可能受益的人','可能培養的能力'])),
  card('From this perspective, exercise is not merely extra effort; it is a routine that keeps people active.','以 not merely ... it is ... 重新界定日常功課作用',[3,6,8],fixed(7,'From this perspective, [功課] is not merely [額外工作]; it is [持續安排] that keeps [孩子投入學習].','支持者把功課看成保持學習連續性的安排。','要把常被當成負擔的做法，重新界定為有某種持續作用的安排時。',['From this perspective, ', ' is not merely ', '; it is ', ' that keeps '],['被重新評估的做法','表面上的負擔','更深層的安排','受益者及持續狀態'])),
  card('However, I believe that testing children every day can be harmful, especially for younger learners.','以 However ... especially 轉入作者反對每日做的理由',[2,7,9],fixed(8,'However, I believe that [每日給功課] can be [適得其反], especially for [較年幼學生].','第二主體段轉入作者立場並指出較易受影響群體。','已公平論證一方，現在要轉向其代價並指出誰特別容易受影響時。',['However, I believe that ', ' can be ', ', especially for '],['受質疑的頻繁做法','可能的反效果','較易受影響的群體'])),
  card('Workers need time to rest, move, read and speak with their families after a long shift.','以 need time to 列出休息及家庭活動需要',[8,10,12],fixed(9,'[孩子] need time to [休息、遊玩、運動、閱讀及與家人互動].','孩子的成長需要多種課業以外的活動。','要指出某群人除主要任務外，還需要哪些有價值的活動時。',[' need time to '],['需要喘息的群體','應保留時間的活動'])),
  card('If every evening brings another test, training can begin to feel like an endless demand, and this may weaken interest rather than build it.','以 If ... and this may ... rather than ... 說持續任務削弱動機',[8,9,11],fixed(10,'If [每天放學後仍有學業任務], [教育] can begin to feel like [無止境輸送帶], and this may [削弱動機] rather than [增強動機].','天天加工作業可令學習顯得無休止，反而減少動機。','要說明某種重複安排如何使過程變得沉重，並產生與原意相反的結果時。',['If ', ', ', ' can begin to feel like ', ', and this may ', ' rather than '],['過量安排的條件','被影響的過程','令人疲乏的比喻','可能出現的反效果','原本希望的成效'])),
  card('A tired athlete who follows a drill mechanically is not necessarily improving their skill.','以 not necessarily 區分完成與深入學會',[10,12,13],fixed(11,'[疲倦的孩子] who [機械完成工作紙] is not necessarily [深入學習].','做完功課這個外在結果不足以證明真正理解。','要警惕某人表面完成任務，卻不一定達到內在學習成效時。',[' who ', ' is not necessarily '],['完成任務的人及狀態','可見但膚淺的行為','不能由此保證的成效'])),
  card('Moreover, extra training can crowd out activities that also support health, such as sleep and family meals.','以 crowd out ... such as 說過量功課擠走有益活動',[9,10,13],fixed(12,'Moreover, [過量功課] can crowd out [同樣支持學業的活動], such as [睡眠、運動及社交].','過量功課的機會成本是其他有助學習的活動被擠走。','要指出增加一項活動會減少其他同樣重要的活動時間，並舉例時。',['Moreover, ', ' can crowd out ', ', such as '],['過量佔時的安排','被擠走的有益活動','具體被擠走的例子'])),
  card('These are not luxuries; they help workers return to work with more energy and steadier emotions.','以 not luxuries ... help 重估休息的學習價值',[9,12,14],fixed(13,'[休息等活動] are not luxuries; they help [孩子] return to [課堂] with [專注及情緒平衡].','休息運動社交並非奢侈；它們幫助孩子回校學習。','已列出易被忽略的活動，要說明它們其實支持核心表現時。',[' are not luxuries; they help ', ' return to ', ' with '],['被誤當成可有可無的活動','因此受益的人','重新投入的場合','得以改善的狀態'])),
  card('In conclusion, a daily check may help staff find mistakes and build routines, but it should not be treated as a requirement for good service.','以 may help ... but ... 限定每日功課不是成功必要條件',[3,8,15],fixed(14,'In conclusion, [每日功課] may help [複習課堂] and [建立習慣], but it should not be treated as [成功必要條件].','結論承認每日功課的用途，但否定「非每日不可」。','要在結論承認一種做法有好處，同時反對把它升格為必要條件時。',['In conclusion, ', ' may help ', ' and ', ', but it should not be treated as '],['有一定好處的做法','第一項可能好處','第二項可能好處','不應誇大的地位'])),
  card('Clinics should assign extra checks when they genuinely improve care, not simply because the calendar changed.','以 when ... not simply because ... 訂立佈置功課的判準',[2,14,16],fixed(15,'[學校] should assign [功課] when [它真正鞏固學習], not simply because [又過一天].','安排功課應由學習需要而非日曆上的日期決定。','要訂出有目的才採取措施的準則，排除機械式例行安排時。',[' should assign ', ' when ', ', not simply because '],['作決定的機構','被安排的任務','真正值得安排的條件','不足以成理由的慣例'])),
  card('A flexible training plan is more useful than a rigid daily schedule.','以 more ... than 比較平衡與僵化安排',[10,14,15],fixed(16,'[平衡做法] is more [符合教育原則] than [僵化每日安排].','以平衡、按需佈置作為最後原則。','要收束比較，指出可因應目的調整的安排勝於固定不變時。',[' is more ', ' than '],['較佳的安排','用來評價的準則','比較之下較差的安排'])),
];
const wrongReasons=[
  ['這句已列兩派理由，原句先提出由來已久的做法及是否每日進行的爭議。','這句已表達作者選邊，原句仍只界定討論問題。','這句已進入反方主體段，未在開篇交代爭議。'],
  ['這句先交代功課歷史及頻率之爭，未平衡列出各方理由。','這句只是支持派的主體段，未對照另一方的休息主張。','這句是作者轉向反方的立場，未先交代雙方觀點。'],
  ['這句報告兩派，未用 because 與 when 解釋作者為何反對每日給。','這句支持派把功課當持續安排，並非作者的有目的練習立場。','這句結論才提出按需要佈置，未在引言說出核心理由。'],
  ['這句並列支持與反對派，未聚焦支持者相信的兩項作用。','這句解釋複習如何有益，原句先概括支持者的看法。','這句談每日作業可建立規律，未同時提鞏固課堂學習。'],
  ['這句只概括支持者看法，未以 When 說課後即時複習的作用。','這句舉分數題例子，未概括記住概念及察覺理解不足。','這句講建立規律與責任，未分析內容記憶和漏洞。'],
  ['這句概括複習的兩種作用，未以 For example 落到分數題。','這句由練習轉向作息習慣，未說及早察錯的過程。','這句說天天任務可損動機，方向與此處的有限好處不同。'],
  ['這句只說支持方一般看法，未補充每日安排形成規律。','這句談分數題的即時察錯，並非責任感如何養成。','這句以 not merely 重新界定功課，未先說規律可能助誰。'],
  ['這句只概括支持者認為功課有益，未用 not merely 重新界定。','這句說規律與責任，未把功課從額外工作改看作學習安排。','這句改談每日功課的反效果，與此處支持者視角相反。'],
  ['這句在引言已選立場，未以 However 轉到第二主體段。','這句仍替每日功課說明價值，未指出可能適得其反。','這句列孩子需要的其他活動，未先提出對誰特別不利。'],
  ['這句先提出每日功課可能有害，未列具體要保留的活動。','這句分析活動被擠走的後果，原句先列孩子的基本需要。','這句重估休息價值，未列休息、玩耍、運動和家庭互動。'],
  ['這句先列課外活動，未用 If 條件分析持續任務的動機反效果。','這句描述疲倦孩子機械完成，未分析整個每日安排。','這句談活動被擠走，未以輸送帶比喻無休止的學習。'],
  ['這句談每日任務使過程無止境，未分清做完工作紙與真正學會。','這句列過量功課擠走活動，未聚焦疲倦孩子的表面完成。','這句指出活動可恢復專注，未說機械完成不保證學習。'],
  ['這句列孩子需要哪些時間，未分析過量功課會擠走它們。','這句說每日任務削弱動機，未舉睡眠運動社交為機會成本。','這句以 not luxuries 評價活動，未先提出它們被擠走。'],
  ['這句只是列出孩子需要的活動，未說它們不是奢侈。','這句已分析被擠走的活動，未說保留它們如何幫助回課室。','這句進入結論總結每日功課，未補足活動的學習價值。'],
  ['這句在主體段概括支持派，未在結論限定每日功課地位。','這句只指出每日功課可能反效果，未公平承認其複習作用。','這句提出按目的佈置準則，未先總結好處與必要性之別。'],
  ['這句是引言主張有目的練習，未訂出具體的佈置判準。','這句總結有益但非必要，未以 when 與 not simply because 指定條件。','這句只是最後比較平衡與僵化，未說何時應佈置功課。'],
  ['這句說每日任務削弱動機，未提出平衡做法的比較結語。','這句總結每日功課非必要，未直接比較兩種安排。','這句訂出按學習效果佈置的準則，未以 more ... than 收束。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先理解每日功課可能的好處，再看為何有目的的練習比固定頻率更重要。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要討論哪兩種每日功課看法？',[
    '每天有功課是成功關鍵，與孩子需要定期離開課業休息',
    '只比較不同科目的工作紙是否印成彩色或黑白',
    '只比較教師與家長誰應替孩子完成全部功課',
    '只比較學校星期一與星期五各有多少課室',
  ],'題目比較每日功課的必要性與孩子的休息需要。'),
  {type:'multi',prompt:'選出作者的完整立場',detail:'選兩項，再按「確認」。',options:[
    '少量有目的的功課可幫助複習和發現不足',
    '不應把每天有功課當作學業成功的必要條件',
    '任何功課都只會損害孩子學習而沒有好處',
    '每天給同量功課比是否真正有用更重要',
  ],correct:[0,1],why:'作者保留有目的的練習，反對不問需要而每天給。'},
];
const route=[sequence('依文章次序排列功課頻率論證',[
  ['引言定標準','有目的的練習比不停安排更能幫助學習。'],
  ['每日功課好處','及時複習、察覺錯處、建立穩定習慣。'],
  ['每日功課代價','休息及成長活動被擠走，疲倦亦可削弱動機。'],
  ['結論定做法','真正鞏固學習時才佈置，採取平衡安排。'],
],'文章先承認對方的練習與規律理由，再以動機及機會成本支持按需安排。')];
const evidence=[
  quiz('課後不久複習為何有用？',[
    '較容易記住重點，並發現自己尚未理解的地方',
    '可讓學生一次看完後，永久不用再碰任何課題',
    '只會令所有孩子立即學會任何複雜數學概念',
    '主要作用是令教師不再需要知道學生的錯處',
  ],'原文同時說記憶與察覺理解漏洞。'),
  quiz('分數題例子最直接證明甚麼？',[
    '少量課後練習可在下一課前讓孩子察覺錯處',
    '所有分數題都應每天反覆做一百次才有效',
    '孩子只要做題便不可能再對分數感到困惑',
    '數學功課的主要目標是取代其他所有活動',
  ],'例子支持有針對性的及早察錯，不支持無限加量。'),
  quiz('支持每日功課者如何理解規律？',[
    '固定安排可能幫助不善規劃的學生培養責任感',
    '固定安排令所有學生不再需要學任何內容',
    '固定安排只會影響功課紙張顏色與數量',
    '固定安排可保證每個孩子每天都精力充沛',
  ],'這是支持方的第二項理由，與複習內容的作用不同。'),
  quiz('輸送帶比喻用來說明哪種風險？',[
    '每天學業任務不斷，孩子可能覺得學習永無休止',
    '孩子乘車上學後，便再也不需要完成任何功課',
    '學校應該購買更多機器，自動派發每一份工作紙',
    '只要功課印成長紙條，孩子便必然更願意學習',
  ],'比喻描述無休止任務如何削弱動機。'),
  quiz('疲倦孩子機械地做完工作紙，不能證明甚麼？',[
    '不能單憑完成任務，就認定孩子真正深入理解',
    '不能單憑孩子睡眠，就知道工作紙放在哪裏',
    '不能單憑教師提問，就知道課室窗戶是否打開',
    '不能單憑數學分數，就知道運動器材有多少',
  ],'完成是表面行為，深度學習是另一項成效。'),
  quiz('過量功課可擠走哪些同樣有助學業的活動？',[
    '睡眠、運動和有助社交發展的活動',
    '只有額外功課紙和每日重複測驗',
    '只有在課室內重新佈置桌椅的工作',
    '只有完全不涉及孩子生活的行政表格',
  ],'原文把睡眠、運動和社交發展也視為成功條件。'),
  quiz('結論如何決定何時佈置功課？',[
    '真正有助鞏固學習時才安排，並非每天例行派發',
    '每過一天都自動派發，完全不問學習是否受益',
    '所有課程永遠不派功課，即使練習能察覺不足',
    '只按教師影印機速度決定全部課題的功課量',
  ],'作者的標準是學習目的，而非日曆或僵化慣例。'),
];
const logic=[
  sequence('每日功課的支持理由',[
    ['即時複習','課後不久看重點，較易記住並發現理解不足。'],
    ['具體例子','少量分數題使孩子在下一課前察覺錯處。'],
    ['規律習慣','每日安排也可能幫助不善規劃者培養責任感。'],
    ['支持派結論','功課不只是額外工作，也可使學習持續。'],
  ],'支持方提出內容複習與習慣建立兩條不同理由。'),
  sequence('作者為何反對每日固定安排',[
    ['成長需要','孩子仍需休息、遊玩、運動、閱讀與家庭時間。'],
    ['動機風險','無休止的任務可削弱學習意願。'],
    ['表面完成','疲倦時機械做完不等於深入理解。'],
    ['機會成本','過量功課擠走睡眠、運動和社交。'],
    ['按需準則','真正能鞏固學習時才安排功課。'],
  ],'作者的判準是質量與目的，不是每日是否有一份功課。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('游泳教練考慮每晚都讓初學者做同一套陸上練習，也希望他們保有休息時間。','哪項最符合範文的整體判準？',[
    '有明確技巧要鞏固時才安排，並保留恢復所需時間',
    '每天都安排同量練習，再按結果決定是否休息',
    '只在技巧出錯時加課，不看疲勞是否影響恢復',
    '只保留休息時間，不安排任何有目標的鞏固',
  ],['有目的練習與休息需要可同時保留。','每天同量沒有依技巧需要調整，也未先保障恢復。','補錯有用，但疲勞與恢復仍影響學習。','休息重要，必要時仍可安排針對性鞏固。'],[2,14,15,16],'作者主張真正鞏固學習時才安排，反對固定每日例行派發。'),
  transfer('教師教完小數後，想知道學生有否真正理解，而不是只看做題數量。','哪項最能轉用分數題例子的作用？',[
    '給少量針對性題目，讓學生下節課前察覺錯處',
    '只增加練習題數，不檢查學生錯在哪一步',
    '只安排口頭複述，不給學生辨認錯處的機會',
    '只看交卷速度，不問小數概念是否真正理解',
  ],['少量練習的價值在於及早找出理解不足。','題數不是理解證據，仍須讓學生看見錯處。','複述有用，但沒有直接檢查小數錯處。','交卷速度不足以判斷概念理解。'],[4,5],'分數練習讓孩子在下一課前發現錯誤，避免困惑加深。'),
  transfer('一位學生做完所有英文工作紙，卻疲倦得說不出自己學到甚麼。','哪項判斷最貼近範文？',[
    '完成工作紙不一定代表深入理解學習內容',
    '先計算工作紙完成率，不問學生能否解釋內容',
    '只看英文拼字錯誤，不問疲倦對理解的影響',
    '只給更多工作紙，不檢查已做內容有否吸收',
  ],['原文把機械完成與真正學習清楚分開。','完成率無法證明學生真正理解內容。','拼字只是部分資訊，疲倦可能影響更深理解。','更多工作紙可能加重疲勞，不能證明吸收。'],[10,11],'疲倦孩子機械完成工作紙，不一定是在深入學習。'),
  transfer('學生每晚的額外補習佔去睡眠和運動時間，翌日上課時難以集中。','哪項最符合範文的機會成本論證？',[
    '補習擠走睡眠與運動，翌日上課更難專注',
    '補習有助分數，便只比較補習時間而不看睡眠',
    '只減少補習，但不恢復運動或上課專注',
    '只看翌日注意力，不問前晚時間如何分配',
  ],['時間被一項活動佔用，就可能壓縮其他重要條件。','補習時間不能代替睡眠與運動對專注的作用。','減補習有用，也須讓睡眠與運動恢復。','翌日表現要連回前晚安排的原因。'],[9,12,13],'過量功課擠走睡眠、運動和社交等有助學業的活動。'),
  transfer('閱讀社團本想鼓勵孩子喜愛閱讀，卻每天要求大量閱讀報告，孩子開始討厭打開書。','哪項最能解釋這個反效果？',[
    '大量閱讀報告可削弱孩子原本的閱讀動機',
    '只把閱讀報告縮短，不問孩子仍否喜歡閱讀',
    '只換較短的書，不檢查每日報告的壓力',
    '只獎勵報告數量，不看閱讀動機的變化',
  ],['原文說無休止任務可削弱本想增強的動機。','報告短些有用，但仍須檢查閱讀動機。','換書未處理每天報告的壓力。','報告數量可能增加，喜愛閱讀的動機卻可能減少。'],[8,10],'每日學業任務可令學習像無止境輸送帶，削弱動機。'),
  transfer('一間學校要向家長解釋，為何學生需要玩耍和家庭時間，雖然這些不是課本內容。','哪項說法最貼近範文？',[
    '玩耍與家庭時間能幫學生恢復專注和穩定',
    '只把玩耍當娛樂，不看回課室時的專注',
    '只強調家庭時間，不解釋休息如何支援學習',
    '只計課本分數，不考慮情緒穩定的作用',
  ],['休息活動能支援回校後的專注和情緒。','玩耍有恢復作用，並非只是不學習的娛樂。','家庭時間有價值，還要說清對上課穩定的幫助。','分數不能代表休息與情緒對學習的貢獻。'],[9,12,13],'休息、運動及家庭互動支援專注力和情緒平衡。'),
  transfer('新入職員工的主管希望每日安排練習，但發現員工已熟悉基本操作，只剩一項安全程序常出錯。','依範文應怎樣安排？',[
    '針對安全錯處練習，毋須每天重做全部操作',
    '只重做全部基本操作，不針對安全錯處',
    '只提醒安全程序，不給員工實際練習機會',
    '只安排固定每日練習，不檢查已熟悉項目',
  ],['練習應對應實際不足，而非機械追求每日頻率。','重做已熟悉操作，沒有對準安全錯處。','提醒不足以代替練習常出錯的步驟。','固定每日練習仍要根據實際需要調整。'],[2,4,15],'有目的的練習能針對學習不足，功課應在真正鞏固學習時安排。'),
  transfer('小學生每晚有功課，家長看見他準時開工，卻也發現他幾乎沒有睡眠和玩耍時間。','哪項最公平評估兩方論證？',[
    '功課有助規律，也要衡量休息與玩耍損失',
    '只看每天準時開工，不檢查睡眠和玩耍',
    '只取消功課，不保留培養責任的規律',
    '只縮短玩耍，不問夜間睡眠是否足夠',
  ],['同時承認支持方的規律理由與作者的機會成本。','準時開工能培養責任，但過多功課可能擠走休息。','全取消功課漏了適量規律的價值。','只縮短玩耍，睡眠不足仍未處理。'],[6,9,12],'每日安排可能培養規律，但過量功課也會擠走睡眠等活動。'),
  transfer('學校打算把「每天至少一份功課」寫成所有學生的成功條件。','哪項最能提出範文式的修訂？',[
    '看能否鞏固學習，不把每天派作業當必要',
    '保留每日一份功課，先減少每份題目數量',
    '只看學生有無交功課，不查是否鞏固學習',
    '只改派紙張格式，不問作業是否真有用途',
  ],['作者承認功課可能有用，但反對把每日頻率升成必要條件。','減題數可能有幫助，但仍把每天派發當必要。','交卷不是鞏固學習的證據。','格式改變未回答作業是否有目的。'],[2,14,15,16],'每日功課有有限好處，但不應視為學業成功的必要條件。'),
  transfer('學校希望在結論用一句話比較彈性作業與每天固定派發的安排。','哪項最符合範文的最後立場？',[
    '按需要派作業，比僵化每日慣例更合適',
    '每天固定派發較易管理，不問學生是否需要',
    '按需要安排作業，卻不保留休息與恢復時間',
    '只比較作業數量，不評估學習成效和負擔',
  ],['以目的和學生需要衡量彈性與僵化做法。','管理方便不等於學生真正需要每日作業。','按需要安排仍須維持合理休息。','數量比較未問有否學到及付出甚麼代價。'],[14,15,16],'平衡的安排比僵化的每日慣例更符合教育原則。'),
];
export default {key:'discuss-both-views:13',meta:{topic:'孩子是否應每天做功課',summary:'每日功課可助複習和建立規律，但固定頻率可損休息、動機與深入學習；學校應按目的安排。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
