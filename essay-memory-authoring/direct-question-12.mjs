// Human-authored support for Direct Question 12; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-12-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:12'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Keeping order is one of the hardest parts of a teacher’s job, especially when one child often stops other children from learning.',
  'But I do not think sending a child who disturbs the lesson out of the room is the best way to deal with it.',
  'It may make the room quiet at once, but it usually does not deal with why the child acts that way.',
  'A better way is to use clear rules in class and get help from the school and parents.',
  'First, teachers should set clear rules and tell children what will happen if they break them before serious trouble starts.',
  'Many children act badly not because they want to hurt others, but because they do not know the rules or have not faced the same response each time they break them.',
  'If a teacher says what behaviour is okay, warns a child when a rule is broken, and then responds fairly, students are more likely to take responsibility for what they do.',
  'For example, a child who keeps talking over others could sit elsewhere, do a short task to think about their actions after class, or have a short talk with the teacher.',
  'This lets the child keep learning with the class while showing that bad behaviour has a result.',
  'When the problem happens again and again, parents, school helpers or senior teachers should also get involved.',
  'A child may disturb class because of bigger problems, such as stress at home, thinking they cannot do well at school, trouble paying attention, or wanting friends to like them.',
  'Just sending the child out may let them escape the lesson instead of making them face what they did.',
  'In contrast, a plan made together can find the cause and deal with it better.',
  'A school could agree on behaviour goals, offer someone to talk to, or speak with parents regularly, so the child hears the same message from everyone.',
  'To sum up, sending a child out of class is not the best answer because it hides the trouble without dealing with its cause.',
  'Clear rules, the same fair response each time, and teachers, families and school helpers working together are better answers.',
];
const vocabulary=[
  [['Discipline','Keeping order','紀律管理'],['most difficult responsibilities','hardest parts','最困難的責任'],['teachers face','teacher’s job','教師面對'],['repeatedly prevents others from learning','often stops other children from learning','反覆阻礙其他人學習']],
  [['However','But','然而'],['asking a disruptive child to leave the classroom','sending a child who disturbs the lesson out of the room','要求擾亂課堂的孩子離開'],['best way to handle the problem','best way to deal with it','最佳處理方法']],
  [['create immediate silence','make the room quiet at once','立即帶來安靜'],['rarely addresses','usually does not deal with','很少處理'],['reasons behind the behaviour','why the child acts that way','行為背後原因']],
  [['better approach','better way','更好做法'],['firm classroom management','clear rules in class','堅定課堂管理'],['support from the school and parents','help from the school and parents','學校與家長支援']],
  [['first solution','First','第一個解法'],['establish clear rules','set clear rules','建立清晰規則'],['predictable consequences','tell children what will happen if they break them','可預期後果'],['serious disruption occurs','serious trouble starts','嚴重擾亂發生']],
  [['behave badly','act badly','表現不佳'],['deliberately malicious','want to hurt others','蓄意作惡'],['understand boundaries','know the rules','理解界線'],['consistent outcomes','same response each time they break them','一致處理']],
  [['explains what behaviour is acceptable','says what behaviour is okay','解釋可接受行為'],['gives a warning','warns a child','給予警告'],['applies a fair consequence','responds fairly','公平處理'],['take responsibility for their actions','take responsibility for what they do','為自身行為負責']],
  [['keeps interrupting others','keeps talking over others','不斷打斷別人'],['moved to another seat','sit elsewhere','換座位'],['reflection task after class','short task to think about their actions after class','課後反思任務'],['short meeting with the teacher','short talk with the teacher','與老師簡短會面']],
  [['keeps the child within the learning environment','lets the child keep learning with the class','讓孩子留在學習環境'],['making it clear','showing','清楚表明'],['poor behaviour has a cost','bad behaviour has a result','不良行為有後果']],
  [['Another important solution','also','另一重要解法'],['involve parents, counsellors, or senior teachers','parents, school helpers or senior teachers should also get involved','讓家長輔導員或資深教師介入'],['problem becomes repeated','problem happens again and again','問題反覆出現']],
  [['Disruption','A child may disturb class','擾亂行為'],['symptom of deeper issues','because of bigger problems','更深層問題的症狀'],['low academic confidence','thinking they cannot do well at school','學業信心不足'],['attention difficulties','trouble paying attention','注意力困難'],['desire for peer approval','wanting friends to like them','渴望同輩認可']],
  [['Simply sending the child out','Just sending the child out','單純把孩子送出去'],['corridor into an escape route','escape the lesson','把走廊變成逃避途徑'],['real consequence','making them face what they did','真正後果']],
  [['By contrast','In contrast','相比之下'],['coordinated plan','plan made together','協調計劃'],['identify the cause','find the cause','找出原因'],['respond more effectively','deal with it better','更有效回應']],
  [['set behavioural targets','agree on behaviour goals','設定行為目標'],['offer counselling','offer someone to talk to','提供輔導'],['arrange regular communication with parents','speak with parents regularly','定期與家長溝通'],['same message from every direction','same message from everyone','各方面一致訊息']],
  [['In conclusion','To sum up','總結來說'],['removing a disruptive child from class','sending a child out of class','把擾亂課堂的孩子移離課室'],['not the best response','not the best answer','非最佳回應'],['appearance of disorder','hides the trouble','混亂表象'],['source of it','its cause','問題根源']],
  [['consistent consequences','same fair response each time','一致後果'],['cooperation between teachers, families, and school specialists','teachers, families and school helpers working together','教師家庭與學校專業人員合作'],['more effective solutions','better answers','更有效解法']],
];
const chunkOverrides=[
  ['Discipline is one of the most difficult responsibilities teachers face,','especially when one child repeatedly prevents others from learning.'],
  ['However, I do not think asking a disruptive child','to leave the classroom is the best way','to handle the problem.'],
  ['It may create immediate silence,','but it rarely addresses the reasons behind the behaviour.'],
  ['A better approach is to combine firm classroom management','with support from the school and parents.'],
  ['The first solution is to establish clear rules','and predictable consequences','before serious disruption occurs.'],
  ['Many children behave badly','not because they are deliberately malicious,','but because they do not understand boundaries','or have never been made to face consistent outcomes.'],
  ['If a teacher explains what behaviour is acceptable,','gives a warning when rules are broken,','and then applies a fair consequence,','students are more likely to take responsibility for their actions.'],
  ['For example, a pupil who keeps interrupting others','could be moved to another seat,','asked to complete a reflection task after class,','or given a short meeting with the teacher.'],
  ['This keeps the child within the learning environment','while making it clear that poor behaviour has a cost.'],
  ['Another important solution is to involve parents, counsellors,','or senior teachers when the problem becomes repeated.'],
  ['Disruption is often a symptom of deeper issues,','such as stress at home, low academic confidence,','attention difficulties, or a desire for peer approval.'],
  ['Simply sending the child out may turn the corridor','into an escape route rather than a real consequence.'],
  ['By contrast, a coordinated plan can identify the cause','and respond more effectively.'],
  ['A school might set behavioural targets, offer counselling,','or arrange regular communication with parents','so that the child receives the same message from every direction.'],
  ['In conclusion, removing a disruptive child from class','is not the best response','because it solves the appearance of disorder','rather than the source of it.'],
  ['Clear rules, consistent consequences,','and cooperation between teachers, families, and school specialists','are more effective solutions.'],
];
const simpleChunkOverrides=[
  ['Keeping order is one of the hardest parts','of a teacher’s job,','especially when one child often stops','other children from learning.'],
  ['But I do not think sending a child','who disturbs the lesson out of the room','is the best way to deal with it.'],
  ['It may make the room quiet at once,','but it usually does not deal with','why the child acts that way.'],
  ['A better way is to use clear rules in class','and get help from the school and parents.'],
  ['First, teachers should set clear rules','and tell children what will happen if they break them','before serious trouble starts.'],
  ['Many children act badly','not because they want to hurt others,','but because they do not know the rules','or have not faced the same response','each time they break them.'],
  ['If a teacher says what behaviour is okay,','warns a child when a rule is broken,','and then responds fairly,','students are more likely to take responsibility for what they do.'],
  ['For example, a child who keeps talking over others','could sit elsewhere,','do a short task to think about their actions after class,','or have a short talk with the teacher.'],
  ['This lets the child keep learning with the class','while showing that bad behaviour has a result.'],
  ['When the problem happens again and again,','parents, school helpers or senior teachers','should also get involved.'],
  ['A child may disturb class because of bigger problems,','such as stress at home,','thinking they cannot do well at school,','trouble paying attention,','or wanting friends to like them.'],
  ['Just sending the child out','may let them escape the lesson','instead of making them face what they did.'],
  ['In contrast, a plan made together','can find the cause and deal with it better.'],
  ['A school could agree on behaviour goals,','offer someone to talk to,','or speak with parents regularly,','so the child hears the same message from everyone.'],
  ['To sum up, sending a child out of class','is not the best answer','because it hides the trouble','without dealing with its cause.'],
  ['Clear rules, the same fair response each time,','and teachers, families and school helpers working together','are better answers.'],
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
  card('Traffic control is one of the most difficult responsibilities officers face, especially when one driver repeatedly blocks the road.','用 especially when 以反覆妨礙他人的情況界定問題',[1,5,10],
    fixed(0,'[管理問題] is one of the most difficult responsibilities [工作者] face, especially when [反覆妨礙他人的情況].','開場指出紀律管理之難，並限定在一名孩子反覆影響全班學習的情況。','引言要界定管理問題及它對其他人的實際影響時。',[' is one of the most difficult responsibilities ', ' face, especially when '],['需要管理的問題','負責處理的人','令問題特別難的具體情境'])),
  card('However, I do not think sending every late pupil home is the best way to handle the problem.','用 I do not think ... is the best way to 明確評估建議做法',[0,3,14],
    fixed(1,'However, I do not think [讓學生離開課室] is the best way to [處理擾亂].','直接回答第一題：要求學生離開課室不是最佳做法。','題目問某一做法是否最佳，須在引言清楚表態時。',['However, I do not think ', ' is the best way to '],['被評估的移離課室做法','需處理的問題'])),
  card('It may end the noise for a moment, but it rarely explains why the argument began.','用 It may ... but it rarely ... 對比即時效果與未處理的原因',[1,4,11],
    fixed(2,'It may [帶來即時安靜], but it rarely [處理行為根因].','承認移走孩子可即時安靜，指出這未回答行為為何發生。','已否定一種做法，接着要公平說明其短期效果和主要局限時。',['It may ', ', but it rarely '],['短期可見效果','未處理的深層原因'])),
  card('A better approach is to combine clear library rules with help from teachers and parents.','用 combine ... with ... 提出課堂紀律與校內外支援並用',[2,8,12],
    fixed(3,'A better approach is to combine [堅定課堂管理] with [學校和家長支援].','總述替代方向：既有清晰管理，也要校方和家庭協作。','引言表態後，要預告與「只把孩子送走」不同的整體方案時。',['A better approach is to combine ', ' with '],['課堂內的管理','課堂外的支援'])),
  card('The first solution is to establish clear team rules and fair responses before major conflict occurs.','用 The first solution is to ... before 說明規則要先於嚴重問題',[3,6,9],
    fixed(4,'The first solution is to establish [清晰規則] and [可預期處理] before [嚴重擾亂].','把第一種解法寫成事前規則與一致後果，而非等到擾亂後才反應。','開始方案段時，要明確交代規則及其設立時機時。',['The first solution is to establish ', ' and ', ' before '],['先建立的規則','可預期的處理','希望預防的情況'])),
  card('Many workers miss deadlines not because they are lazy, but because instructions are unclear or workloads keep changing.','用 not because ... but because 修正對不良行為的簡單責備',[2,4,10],
    fixed(5,'[可見問題] not because [被歸咎的原因], but because [實際原因一] or [實際原因二].','避免先把孩子定性為壞，轉而檢查規則與後果是否清楚一致。','要解釋看似失當的行為時，區分簡單責備與可改善的真實原因。',[' not because ', ', but because ', ' or '],['可見的問題行為','被歸咎的原因','第一項實際原因','第二項實際原因'])),
  card('If a coach explains the rules, gives a warning, and then follows through fairly, players are more likely to take responsibility.','用 If ... and then ... are more likely to 描述一致的教導流程與效果',[4,5,8],
    fixed(6,'If [先說明標準], [接着警告], and then [公平處理], [參與者] are more likely to [負責任行動].','按「說明 → 警告 → 公平後果」的次序示範一致管理如何促進責任感。','要把一項管理原則寫成可依次執行的行動，再說明參與者較可能有的反應時。',['If ', ', ', ', and then ', ', ', ' are more likely to '],['先說明標準的行動','接着給警告的行動','公平處理的行動','受到引導的人','較可能出現的責任行為'])),
  card('For example, a player who keeps interrupting others could be moved to another group, asked to reflect after training, or given a short talk with the coach.','用 For example ... could be ... asked to ... or given ... 列不離開學習場域的處理選項',[6,8,10],
    fixed(7,'For example, [持續打斷他人的學生] could be [換座位], asked to [課後反思], or given [與老師會面].','列出三種具體後果，讓干擾者留在教育關係中仍須承擔行為責任。','已有清晰規則，接着要以單一學生個案示範比例相稱的處理時。',['For example, ', ' could be ', ', asked to ', ', or given '],['被舉例的打斷者','第一種處理','第二種處理','第三種處理'])),
  card('This keeps the player within the team while making it clear that unfair behaviour has a cost.','用 while making it clear that 同時保留參與與表明行為後果',[3,6,7],
    fixed(8,'This keeps [孩子留在學習環境] while making it clear that [不良行為有代價].','解釋換座位或反思等做法的雙重作用：不放棄學習，也不縱容違規。','列出處理選項後，要說明它們如何兼顧參與和紀律時。',['This keeps ', ' while making it clear that '],['仍可繼續學習的狀態','須清楚傳達的行為後果'])),
  card('Another important solution is to involve team leaders and parents when the problem becomes repeated.','用 Another important solution is to involve ... when 轉入反覆問題的協作',[4,10,13],
    fixed(9,'Another important solution is to involve [家長、輔導員與資深教師] when [問題反覆出現].','把單一老師的課堂處理，擴展為反覆問題所需的校家合作。','已討論課堂規則，但干擾持續，需要引入其他支援者時。',['Another important solution is to involve ', ' when '],['要一起處理的人','啟動協作的時機'])),
  card('Frequent lateness is often a symptom of deeper issues, such as unsafe travel, family duties or poor sleep.','用 is often a symptom of deeper issues, such as 列行為背後可能不同的原因',[5,9,12],
    fixed(10,'[擾亂行為] is often a symptom of deeper issues, such as [家庭、信心、注意力或同輩因素].','指出表面行為可能反映多種問題，不能只用一種懲罰解釋全部學生。','要為反覆干擾提出支援理由，先列需要了解的可能原因時。',[' is often a symptom of deeper issues, such as '],['可見的問題行為','需要辨認的多種背景問題'])),
  card('Simply sending a late pupil out may turn the corridor into a break rather than a real consequence.','用 may turn ... into ... rather than 說明表面懲罰可能變成逃避',[2,8,14],
    fixed(11,'Simply sending [孩子] out may turn [走廊] into [逃避途徑] rather than [真正後果].','提醒把孩子送出課室可能令他避開課堂，而非處理其行為。','要指出某懲罰看似嚴厲，但實際可能獎勵逃避時。',['Simply sending ', ' out may turn ', ' into ', ' rather than '],['被送出的孩子','被改變用途的走廊','可能形成的逃避','原本想達到的後果'])),
  card('By contrast, a shared support plan can find the cause and respond more effectively.','用 By contrast ... can ... and ... 對比協作診斷與單純送走',[3,10,11],
    fixed(12,'By contrast, [協調計劃] can [找出原因] and [更有效回應].','與「把孩子送出去」對照，說明共同計劃能先查原因再採取支援。','已指出單一懲罰的副作用，接着要轉回較有效的協作方案時。',['By contrast, ', ' can ', ' and '],['相對的協調計劃','先辨認的原因','其後改善的回應'])),
  card('A school might set behaviour goals, offer mentoring, or arrange regular talks with families so that each player hears the same message.','用 might ... or ... so that 列協作措施及一致訊息的目的',[7,9,12],
    fixed(13,'A school might [設行為目標], [提供輔導], or [定期與家長溝通] so that [孩子收到一致訊息].','把協作具體化為目標、輔導和家長溝通，並說明這些做法如何一致。','要把「協調計劃」變成學校能實際安排的多項步驟時。',['A school might ', ', ', ', or ', ' so that '],['學校可設定的目標','可提供的個人支援','與家長的定期聯絡','希望形成的一致訊息'])),
  card('In conclusion, removing a noisy player is not the best response because it solves the appearance of disorder rather than the source of it.','用 because ... rather than 總結移走孩子只處理表象',[1,2,15],
    fixed(14,'In conclusion, [把孩子送走] is not [最佳回應] because it solves [混亂表象] rather than [問題來源].','結尾重新回答第一題，對比即時安靜與未處理的行為根源。','結論要明確評估移離課室，並用前文原因收束時。',['In conclusion, ', ' is not ', ' because it solves ', ' rather than '],['被評估的移離做法','被否定的最佳定位','暫時處理的表象','仍未處理的根源'])),
  card('Clear team rules, fair consequences, and cooperation between coaches, families, and school staff are more effective solutions.','用三項並列方案作第二題的結論',[3,9,14],
    fixed(15,'[規則與一致後果], and cooperation between [教師家庭與專業人員] are more effective solutions.','把課堂規則、一致後果及校家協作並列，完整回答其他方案是甚麼。','結論第二句要用簡潔清單收束整篇的替代做法時。',[', and cooperation between ', ' are more effective solutions.'],['清晰規則和一致處理','需要共同參與的三方'])),
];
const wrongReasons=[
  ['I do not think 是對移離做法的立場，沒有說紀律工作何時特別難。','not because 修正壞行為成因，沒有引言界定教師責任。','symptom of deeper issues 列反覆行為的背景，沒有課堂受阻的開場情境。'],
  ['especially when 說管理困難，沒有評估送孩子離開是否最佳。','A better approach 預告替代方向，沒有直接否定題中建議。','In conclusion 重申相同立場，但屬結尾的表象與根源總結。'],
  ['I do not think 直接表態，沒有承認安靜效果再指出成因未解。','The first solution 說如何事前設規則，沒有評估送走後的短期效果。','may turn the corridor 說逃避副作用，沒有 may...but rarely 的即時與根源比較。'],
  ['It may...but 說被提做法的局限，沒有提出管理加支援的整體方案。','This keeps ... while 說第一種具體處理的雙重效果，沒有預告兩邊合作。','By contrast ... plan 轉回協調計劃，沒有引言的 combine ... with 雙方向。'],
  ['A better approach 是整體方向，沒有事前設規則與後果的時機。','If 說規則違反後教師的次序，沒有先建立規則。','Another important solution 是反覆問題的協作，並非第一項事前方案。'],
  ['It may ... but 說送走的短期局限，沒有修正對孩子惡意的歸因。','The first solution 說建立規則，沒有說很多孩子為何擾亂。','symptom of deeper issues 列背景問題，沒有 not because ... but because 的責備修正。'],
  ['The first solution 提前建立規則，沒有完整「說明、警告、後果」流程。','not because 說孩子不一定惡意，沒有教師行動次序。','This keeps the child 說處理後效果，沒有 If 條件下如何執行。'],
  ['If 說一般教師流程，沒有單一學生換座位等具體選項。','This keeps 說選項的共同目的，沒有逐一列三種後果。','symptom of deeper issues 說背景原因，沒有處理打斷課堂的個案。'],
  ['A better approach 概括管理加支援，沒有說孩子仍留在學習環境。','If 說紀律流程，沒有處理的雙重結果。','For example 列行動清單，沒有解釋為何不移走孩子。'],
  ['The first solution 是班內事前規則，沒有反覆問題時誰須介入。','symptom of deeper issues 說可能原因，沒有指定家長與專業人員參與。','A school might 詳列協作後的措施，沒有先交代介入時機。'],
  ['not because ... but because 說界線與一致後果，沒有反覆干擾的其他深層問題。','Another important solution 指出要找誰合作，沒有列需調查的家庭與心理原因。','By contrast 說計劃能找原因，沒有提供可能原因的例子。'],
  ['It may create silence 說短暫效果，沒有走廊變成逃避途徑的副作用。','This keeps child within learning 說留在課室的好處，沒有送出課室的反效果。','In conclusion 說表面與根源，但沒有走廊作逃避路線的機制。'],
  ['A better approach 提出總方向，沒有與走廊逃避形成的直接對照。','symptom of deeper issues 提出診斷理由，沒有協調計劃的實際回應。','may turn corridor 解釋送走的副作用，沒有提出相對方案。'],
  ['換座位等選項是課堂內處理，沒有學校與家長溝通的協作計劃。','Another important solution 說找誰介入，沒有目標、輔導和溝通的行動清單。','By contrast 說計劃能辨因，沒有 how 的具體步驟和一致訊息。'],
  ['引言 I do not think 是直接立場，沒有結論的表象與根源比較。','It may ... but 說短期安靜，沒有結論重申不是最佳方案。','最後方案清單回答第二題，沒有評估移離課室。'],
  ['A better approach 概括兩種方向，沒有結尾的三項方案清單。','Another important solution 只講反覆問題須協作，沒有規則與一致後果。','結論第一句否定送走，沒有提出其他更有效做法。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分別回答甚麼？',[
    '請擾亂課堂的孩子離開是否最佳，以及還有哪些處理方法',
    '教師是否應取消所有規則，以及家長應付多少學費',
    '每班最多應有幾名學生，以及走廊應如何裝修',
    '孩子應選哪一科，以及課後活動應收多少費用',
  ],'先評估移離課室是否最佳，然後提出其他處理擾亂的方案。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '事前設清晰規則和一致後果，並用換座位或反思等比例合宜的處理',
    '干擾若反覆出現，學校與家長應查原因並按共同計劃支援孩子',
    '只要課室暫時安靜，便毋須理會孩子為何反覆干擾',
    '把所有孩子立即送出課室，是最能維持長期紀律的方法',
  ],correct:[0,1],why:'第一段着重班內清楚而一致的紀律；第二段着重反覆問題背後的原因與協作。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言判斷','送孩子出課室或能立即安靜，卻少有處理原因；應結合班內管理與支援。'],
  ['班內紀律','事先設規則及公平後果，按說明、警告、處理的次序行動。'],
  ['協作支援','反覆干擾可能有深層原因，應找家長與專業人員制定一致計劃。'],
  ['結論回答','移走孩子只處理混亂表象；清晰規則、一致處理及協作更有效。'],
],'先說移離的局限 → 展示班內可行做法 → 處理持續干擾的原因 → 回答兩問。')];
const evidence=[
  quiz('作者為何反對把孩子送出課室作為最佳方法？',[
    '這或能立即安靜，卻通常沒有處理造成干擾的原因',
    '這必定完全沒有任何短期效果，連安靜片刻也不會',
    '作者認為教師應任由孩子反覆妨礙其他人學習',
    '作者主張每次違規只加深懲罰，不需查明原因',
  ],'may ... but rarely 同時承認短期效果與根本局限。'),
  quiz('清晰規則與可預期後果應在甚麼時候建立？',[
    '在嚴重擾亂出現前建立，讓學生知道界線與違規後果',
    '等學生反覆被送出課室後，才第一次說明規則',
    '只在家長反對時臨時改變規則，避免後果一致',
    '不用向孩子說明，只讓教師保留每次隨意處理',
  ],'原文特別寫 before serious disruption occurs，強調事前準備。'),
  quiz('教師如何以一致流程促進學生負責？',[
    '先說明可接受行為，違規時警告，再公平作出處理',
    '先把學生送走，不說明規則，也不讓他明白後果',
    '每次採用不同做法，讓學生猜測今天會有甚麼結果',
    '只告訴其他學生規則，不向當事孩子說明界線',
  ],'條件句的三項教師行動有次序，後面才推到學生更可能承擔責任。'),
  quiz('打斷別人的學生可以得到哪類處理？',[
    '換座位、課後反思或與教師短談，仍留在學習關係中',
    '立即永遠停課，且從此不再接觸教師和同學',
    '只讓他在走廊休息，不用反思也不需回課室',
    '取消所有後果，讓他不斷打斷其他學生的學習',
  ],'三項例子讓孩子繼續參與，同時清楚傳達不良行為有後果。'),
  quiz('為何反覆干擾需要找家長或輔導員？',[
    '行為可能反映家庭壓力、信心、注意力或同輩認可等問題',
    '因為教師已知每個孩子都必定有完全相同的原因',
    '因為家長一到場就可免去所有規則和公平後果',
    '因為走廊一定是孩子最適合長期學習的地方',
  ],'可能原因有多種，因此要辨認個別孩子的情況並協調支援。'),
  quiz('走廊如何可能成為「逃避路線」？',[
    '孩子被送出後避開課堂，未必真正面對干擾行為',
    '孩子在走廊必定接受完整輔導並立即改正行為',
    '走廊總會令教師與家長協作，無須另外安排',
    '只要有走廊，任何課堂規則都不可能再實行',
  ],'送走未必有原本想要的教育後果，反而可能讓孩子暫時脫離要求。'),
  quiz('協作計劃如何讓孩子收到一致訊息？',[
    '學校設行為目標、提供輔導並定期與家長溝通',
    '教師與家長各自不說明標準，讓孩子自行猜測',
    '只由一名教師臨時決定，完全不記錄反覆問題',
    '每次更換要求，避免學生知道哪些行為可接受',
  ],'目標、輔導和定期聯絡令學校與家庭的要求互相配合。'),
];
const logic=[
  sequence('第一主體段：清楚而一致的課堂紀律',[
    ['先建規則','嚴重擾亂前訂清楚規則和可預期處理。'],
    ['修正單純責備','部分孩子缺界線或一致後果，未必蓄意作惡。'],
    ['教師執行次序','說明可接受行為，違規時警告，然後公平處理。'],
    ['具體後果','換座位、課後反思，或與教師短談。'],
    ['雙重效果','孩子繼續在學習環境中，同時明白違規有代價。'],
  ],'前四步不是任意懲罰清單，而是由規則到公平後果的一致流程。'),
  sequence('第二主體段：反覆干擾需要查因與協作',[
    ['啟動更多支援','問題反覆時找家長、輔導員或資深教師參與。'],
    ['檢查可能根源','家庭壓力、學業信心、注意力或同輩認可。'],
    ['避免逃避路線','只把孩子送出，可能讓他避開課堂而沒有改變行為。'],
    ['制定協調計劃','共同找出原因，再按行為目標與輔導作回應。'],
    ['保持訊息一致','學校與家長定期聯絡，讓孩子收到相同要求。'],
  ],'反覆問題的處理順序是辨認、協作、設定目標及持續溝通。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('圖書館有讀者反覆大聲說話。管理員想每次立即請他離開，不先說明規則。','哪項最能轉用範文的第一種方案？',[
    '事前說清安靜規則，提醒違規者，再作公平而一致的處理',
    '先請人離開，規則和違規後果毋須向任何人解釋',
    '每次隨機決定處理方式，避免讀者預測會發生甚麼',
    '只要求其他讀者忍耐，放棄訂立清楚的安靜標準',
  ],[
    '範文先訂規則，再由說明、警告走到公平後果。',
    '不說明規則便難讓讀者理解界線。',
    '不一致處理無法建立可預期後果。',
    '這沒有保護其他讀者正常使用圖書館。',
  ],[4,5,6],'範文要求在嚴重干擾前建立清晰規則和可預期後果，並按說明、警告、公平處理執行。'),
  transfer('球隊一名球員經常打斷教練，教練可把他調到另一訓練組並安排練習後短談。','哪項最符合範文對具體後果的目的？',[
    '讓球員繼續訓練，同時使他明白打斷別人有後果',
    '讓球員長期離開隊伍，且永遠不再有改正機會',
    '把調組當成獎勵，不需要與球員談及打斷行為',
    '只和其他球員談話，當事人完全不需知道規則',
  ],[
    '範文的換座位與短談保留學習參與，同時表明行為代價。',
    '原文不主張因一次行為就永久排除。',
    '若不說明行為後果，調組失去教育作用。',
    '當事人須理解可接受行為和違規後果。',
  ],[7,8],'範文讓打斷他人的學生換座位、反思或短談，使其仍在學習環境中承擔責任。'),
  transfer('網上課堂有學生反覆發無關訊息。關掉帳號能令畫面立即安靜，但他每次換帳號再出現。','哪項評估最貼合範文？',[
    '封鎖可帶來短暫安靜，仍須查明重複擾亂的原因',
    '只要畫面安靜一分鐘，便已完全解決反覆擾亂',
    '既然有封鎖功能，課堂毋須訂下任何發言規則',
    '學生換帳號證明所有干擾都一定出於蓄意惡意',
  ],[
    '範文承認移走孩子可立即安靜，卻不等於處理成因。',
    '題目已顯示干擾會重現。',
    '清晰規則是原文第一種方案。',
    '作者要求查原因，不預設所有孩子蓄意作惡。',
  ],[1,2,5,11],'範文的 may ... but rarely 區分即時安靜與反覆行為根源；走廊也可能成為逃避途徑。'),
  transfer('一名學生上課經常離座，教師發現他或受家庭壓力影響，也可能是注意力問題。','哪項最符合範文對反覆問題的處理？',[
    '和家長及校內支援者查清原因，再訂共同的行為目標',
    '立即定論孩子懶惰，不需要再問家庭或注意力情況',
    '只把孩子送到走廊，假設行為原因會自行消失',
    '取消所有課堂規則，因為需要支援就毋須有界線',
  ],[
    '範文列多種可能原因，建議協調計劃辨因並一致回應。',
    '題目提供不止一種可能，不能未查先定性。',
    '移走孩子沒有解決可能的家庭或注意力因素。',
    '原文把支援與清楚規則結合，沒有二選一。',
  ],[9,10,12,13],'範文由反覆干擾引出家長、輔導員與資深教師協作，再訂行為目標和定期溝通。'),
  transfer('補習班有學生故意打斷別人，也有學生因不明白規則而插話。','哪項最能運用範文對原因的區分？',[
    '先查每人是否明白界線，再給清楚規則和一致後果',
    '把所有插話都當成蓄意作惡，毋須解釋發言次序',
    '只處理故意打斷者，讓不懂規則者繼續插話',
    '因有人不懂規則，就判斷所有學生都沒有責任',
  ],[
    '原文用 not because ... but because 提醒教師別把所有干擾當惡意。',
    '這會忽略題目中一組學生不懂規則的事實。',
    '不懂規則也需要清楚教導和公平後果。',
    '理解原因不等於取消對行為的責任。',
  ],[5,6],'範文說一些孩子未必蓄意作惡，可能不懂界線或未見過一致處理。'),
  transfer('學校請一名反覆擾亂的孩子在走廊待着，孩子開始把這當作不用上課的休息時間。','哪項最符合範文對這種處理的批評？',[
    '走廊成了逃避課堂的路，未讓孩子真正面對行為',
    '走廊一定提供最好的學習環境，無須其他支援',
    '孩子休息便證明課堂干擾的根源已完全消失',
    '只須延長走廊時間，毋須再看孩子為何擾亂',
  ],[
    '原文的 escape route 是懲罰反成逃避，而非真正後果。',
    '題目已說孩子把離課當休息，與學習目的相反。',
    '表面安靜並不能證明根源已解。',
    '延長相同做法仍未處理造成擾亂的原因。',
  ],[2,8,11],'範文指出單純送孩子出課室，可能使走廊成為逃避途徑而非有效後果。'),
  transfer('老師、家長和輔導員各自給同一名學生不同要求，學生不知違規後會怎樣。','哪項最能補上範文的協調要求？',[
    '共同訂行為目標並定期溝通，使孩子得到一致訊息',
    '維持三套不同要求，讓孩子無法預測任何處理',
    '只由其中一人私下決定，完全不用告訴其他人',
    '只要求孩子記下分歧，不再討論行為原因或支援',
  ],[
    '範文把行為目標、輔導與家長聯絡連到一致訊息。',
    '不同要求正是題目指出的困難。',
    '缺少協調無法達成共同訊息。',
    '記下分歧不能取代共同計劃。',
  ],[9,12,13],'範文的 coordinated plan 要找原因並作有效回應，讓孩子從學校與家庭收到一致訊息。'),
  transfer('教師擬訂一條規則：學生打斷別人先收到提醒，再按同樣準則安排課後反思。','哪項最能說明此方案為何合理？',[
    '規則預先清楚，處理按次序且公平，學生較能承擔責任',
    '每次臨時改變準則，學生便更能理解一致後果',
    '只要安排課後反思，便完全不用先說明可接受行為',
    '把每次打斷者永久停課，比短談更能保留學習',
  ],[
    '原文由事前規則到警告和公平後果，再推到學生責任感。',
    '臨時改變與 predictable consequences 相反。',
    '先說明標準是原文流程的第一步。',
    '永久停課不符合保留學習環境的目的。',
  ],[4,6,7,8],'範文先建立清楚規則，再按說明、警告、公平處理的次序，讓孩子仍能學習。'),
  transfer('社區中心有人反覆在活動中打斷他人；工作人員只想每次請他走。','哪項最完整轉用範文兩層方案？',[
    '先訂清晰規則與公平後果，反覆時找家人及支援者查因',
    '只請人離開，不設規則也不看他是否有持續困難',
    '只安排家人會面，完全不保護其他參加者的活動',
    '只做一次警告，之後讓各人自行猜測會有甚麼後果',
  ],[
    '原文結合班內一致紀律與反覆問題的校家協作。',
    '這只追求短期安靜，沒有處理兩層問題。',
    '支援不能替代現場清晰的參與界線。',
    '單次警告而無一致後果不足以建立可預期處理。',
  ],[3,4,9,12,15],'範文不是單靠送走或單靠輔導，而是先有規則與一致後果，反覆時再協調支援。'),
  transfer('校長要總結「把孩子移出課室是否最佳」和「還有哪些方法」兩問。','哪一句最完整回應範文？',[
    '移走只解表面，清晰規則、一致處理和校家協作更有效',
    '只說課室要安靜，不評估送走是否處理行為原因',
    '只列孩子可能有壓力，不提出教師和家長怎樣行動',
    '只說送走可即時安靜，不交代任何其他處理辦法',
  ],[
    '原文結論先否定移走的最佳性，再列出三類替代解法。',
    '第一問要評估做法是否最佳及原因。',
    '第二問要求具體替代方案。',
    '即時安靜不是完整的政策評估。',
  ],[1,2,14,15],'範文結尾指出移走孩子只處理混亂表象，清晰規則、一致後果和多方合作才更有效。'),
];
const editorialWrongChoices=[
  ['先請大聲說話者離開，之後才向全體讀者補充規則','只提醒反覆違規者，暫不訂立一致而公開的處理準則','依每次情況臨時決定處理方式，讓管理員保有彈性'],
  ['調組可讓球員反省，但應先停止練習直到行為改善','短談可說明問題，調組則用來減少教練與球員接觸','球員可繼續練習，打斷行為留待賽季結束後再談'],
  ['封鎖可恢復秩序，因此可暫停追查反覆擾亂的原因','先查換帳號的技術漏洞，發言規則可留待以後建立','重新登入顯示封鎖不足，主要應延長每次停權時間'],
  ['先向家長了解壓力，再把課堂規則交由家庭自行訂定','先觀察注意力問題，暫不與家長商量共同的行為目標','先讓學生在走廊休息，原因可等他不再離座時再查'],
  ['先為故意打斷者訂後果，其他插話留待日後再處理','先向全班解釋規則，再依學生動機臨時改變後果','先處理插話次數，是否明白界線可留待家長會討論'],
  ['走廊可先減少干擾，行為原因待下次違規時再查','孩子把走廊當休息，表示教師應增加其停留時間','走廊安排保護其他學生，改善目標可留待下學期'],
  ['先由老師統一要求，家長與輔導員下次開會才跟進','各人分別處理自己的時段，避免學生收到太多要求','讓學生自行選一套要求，待行為改善後再整合規則'],
  ['先提醒再反思有次序，但教師可按情緒調整準則','公平處理有助減少爭議，因此規則不用事前說明','課後反思方便管理，打斷別人的原因可不必追查'],
  ['先訂規則與後果，家人支援可留待活動結束後再談','先找家人查明原因，公平後果可等下次活動再決定','請人離開可即時恢復秩序，規則安排留待下次處理'],
  ['移走可保護課堂，其他方法待孩子再次擾亂時再談','清晰規則有幫助，是否最佳不必比較行為原因','校家協作值得推行，送走孩子的效果可在結論略過'],
];
const editorialWrongFeedback=[
  ['規則應事前清楚，學生才知道行為界線與後果。','提醒若缺乏一致準則，仍可能顯得任意。','公平且可預期的處理比臨時彈性更符合首項方案。'],
  ['原文希望保留參與和改正機會，而非先停練。','調組是具體後果，不是切斷教練與球員的對話。','短談應及時讓球員理解打斷的後果。'],
  ['反覆換帳號表示即時安靜不足以解決原因。','技術堵漏可有用，但仍須有清楚行為規則。','加長停權仍只改變外部後果，未必處理重複行為。'],
  ['家庭提供線索，課堂界線仍須由學校共同制定。','觀察有用，但家校合作才可訂共同目標。','先送走可能暫時安靜，卻延後理解原因。'],
  ['不懂規則者也需明確指引，不能長期放任。','後果若臨時變動，就失去一致性。','是否明白界線正是當下要分辨的原因。'],
  ['下次才查原因，仍把離開課室當作主要處理。','延長休息可能使逃避課堂更有吸引力。','保護同學重要，但仍須訂孩子可執行的改善目標。'],
  ['三方都須得到一致訊息，不能只靠老師先處理。','分時段各自處理會令規則更不一致。','讓孩子獨自選規則不能取代成人協調。'],
  ['準則按情緒變動，學生難以預測公平後果。','事前說明正是規則清楚的關鍵。','反思要連到行為，原因也可能需要追查。'],
  ['反覆問題需要支援，不能只安排在活動後再談。','支援原因重要，但也要保護其他參加者。','只驅離未形成清晰、一致的長期方案。'],
  ['再次擾亂前也應評估移走只解表面的限制。','第一問需比較做法是否最佳及其原因。','兩問都要回答，不能略去移走的效果。'],
];
transferTasks.forEach((item,index)=>{item.options=[item.options[0],...editorialWrongChoices[index]];item.explanations=[item.explanations[0],...editorialWrongFeedback[index]];item.why=item.explanations[0]});
export default {
  key:'direct-question:12',
  meta:{topic:'課堂干擾與紀律支援',summary:'把孩子送出課室只能短暫安靜；清晰規則、公平後果及學校家庭協作更有效。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
