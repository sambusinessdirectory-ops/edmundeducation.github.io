// Human-authored support for Direct Question 9; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-9-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:9'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'People often blame crimes by young people on violent movies, games and things they see online, because these are easy to notice and blame.',
  'But I do not think violent media is the main reason.',
  'I think young people are much more likely to break the law when they do not get steady guidance, enough adult attention, and good ways to use their time and energy.',
  'So the best action is to help early through families, schools and local communities.',
  'The main reason young people commit crimes is not what they watch but the places and people that teach them how to act.',
  'If parents are away, too busy to cope, or unable to set rules, children may not learn that their actions have results.',
  'A violent scene on a screen may upset them for a short time, but being ignored day after day may teach them that hitting, stealing or disobeying brings little cost.',
  'The problem gets worse in places where teenagers have few good adults to learn from and little to do after school.',
  'For example, a boy who spends every evening with older friends who do small crimes is not just copying TV; he is learning real behaviour from the people around him.',
  'To solve this, governments and communities should help young people before using punishment.',
  'Schools should notice pupils who often act violently, skip school or stay alone, and get them help from counsellors, trusted adults and family services before these habits become hard to change.',
  'At the same time, local government should pay for cheap sports, arts and job-skills programmes, especially in poorer areas.',
  'These activities give teenagers a routine, a group to belong to and a good reason to feel proud.',
  'A young person with a coach, a team and something to feel proud of is less likely to try to win respect by breaking the law.',
  'To sum up, violent media may be an easy thing to blame, but it is not the main reason for youth crime.',
  'The deeper problems are weak guidance, too little support and communities with too few resources; the best answers are early help, stronger family support and activities that give young people purpose.',
];
const vocabulary=[
  [['Juvenile crime','crimes by young people','青少年犯罪'],['blamed on','blame','歸咎於'],['violent films','violent movies','暴力電影'],['online content','things they see online','網上內容'],['visible and easy to criticise','easy to notice and blame','顯眼而易批評']],
  [['However','But','然而'],['I do not agree','I do not think','我不同意'],['media violence','violent media','媒體暴力'],['main cause','main reason','主要原因']],
  [['In my view','I think','在我看來'],['far more likely to offend','much more likely to break the law','犯罪可能性大得多'],['stable guidance','steady guidance','穩定引導'],['meaningful supervision','enough adult attention','有意義的監督'],['constructive outlets for their energy','good ways to use their time and energy','正面釋放精力的途徑']],
  [['best response','best action','最佳應對'],['early intervention','help early','早期介入'],['families, schools and local communities','families, schools and local communities','家庭學校與社區']],
  [['central cause of youth crime','main reason young people commit crimes','青少年犯罪核心原因'],['what teenagers watch','what they watch','所看內容'],['the environment in which they learn how to behave','the places and people that teach them how to act','學習行為的環境']],
  [['parents are absent','parents are away','父母缺席'],['overwhelmed','too busy to cope','不堪重負'],['set boundaries','set rules','設立界線'],['clear sense of consequence','learn that their actions have results','清楚知道行為後果']],
  [['shock them briefly','upset them for a short time','短暫震撼'],['daily neglect','being ignored day after day','日常忽視'],['aggression, theft or defiance','hitting, stealing or disobeying','攻擊偷竊或反抗'],['no serious cost','little cost','沒有嚴重代價']],
  [['becomes even worse','gets worse','變得更嚴重'],['areas','places','地區'],['positive role models','good adults to learn from','正面榜樣'],['little to do after school','little to do after school','放學後缺少活動']],
  [['For instance','For example','例如'],['older peers involved in petty crime','older friends who do small crimes','參與輕微犯罪的年長同伴'],['not merely copying television','not just copying TV','不只模仿電視'],['pulled into a real social script','learning real behaviour from the people around him','被現實同儕行為牽引']],
  [['To deal with this situation','To solve this','處理這種情況'],['focus on support before punishment','help young people before using punishment','先支援後懲罰']],
  [['identify pupils','notice pupils','識別學生'],['repeated aggression','often act violently','反覆攻擊'],['truancy','skip school','逃學'],['isolation','stay alone','孤立'],['connect them with counsellors, mentors and family-support services','get them help from counsellors, trusted adults and family services','連結輔導導師與家庭支援'],['behaviour hardens into a pattern','habits become hard to change','行為固化成模式']],
  [['At the same time','At the same time','同時'],['local authorities','local government','地方政府'],['fund affordable','pay for cheap','資助可負擔的'],['vocational programmes','job-skills programmes','職業培訓項目'],['deprived neighbourhoods','poorer areas','資源匱乏的社區']],
  [['These activities','These activities','這些活動'],['structure','a routine','規律'],['belonging','a group to belong to','歸屬感'],['legitimate sense of achievement','good reason to feel proud','正當的成就感']],
  [['coach','coach','教練'],['reason to be proud','something to feel proud of','值得自豪的理由'],['seek status through crime','try to win respect by breaking the law','透過犯罪尋求地位']],
  [['In conclusion','To sum up','總結來說'],['convenient explanation','easy thing to blame','方便的解釋'],['main cause of juvenile crime','main reason for youth crime','青少年犯罪主要原因']],
  [['deeper roots','deeper problems','更深層根源'],['weak supervision','weak guidance','薄弱監督'],['poor support','too little support','支援不足'],['under-resourced communities','communities with too few resources','資源不足的社區'],['early intervention','early help','早期介入'],['purposeful activities','activities that give young people purpose','有目的的活動']],
];
const chunkOverrides=[
  ['Juvenile crime is often blamed on violent films,','video games and online content,','because these influences are visible and easy to criticise.'],
  ['However, I do not agree','that media violence is the main cause.'],
  ['In my view, young people are far more likely to offend','when they lack stable guidance,','meaningful supervision and constructive outlets for their energy.'],
  ['The best response is therefore early intervention','through families, schools and local communities.'],
  ['The central cause of youth crime is not what teenagers watch,','but the environment in which they learn how to behave.'],
  ['If parents are absent, overwhelmed or unable to set boundaries,','children may never develop a clear sense of consequence.'],
  ['A violent scene on a screen may shock them briefly,','but daily neglect can quietly teach them','that aggression, theft or defiance bring no serious cost.'],
  ['This problem becomes even worse in areas','where teenagers have few positive role models','and little to do after school.'],
  ['For instance, a boy who spends every evening','with older peers involved in petty crime','is not merely copying television;','he is being pulled into a real social script.'],
  ['To deal with this situation,','governments and communities should focus on support','before punishment.'],
  ['Schools should identify pupils','who show repeated aggression, truancy or isolation','and connect them with counsellors, mentors and family-support services','before their behaviour hardens into a pattern.'],
  ['At the same time, local authorities should fund','affordable sports, arts and vocational programmes,','especially in deprived neighbourhoods.'],
  ['These activities give teenagers structure, belonging','and a legitimate sense of achievement.'],
  ['A young person who has a coach, a team','and a reason to be proud','is less likely to seek status through crime.'],
  ['In conclusion, media violence may seem like a convenient explanation,','but it is not the main cause of juvenile crime.'],
  ['The deeper roots are weak supervision, poor support','and under-resourced communities,','and the best solutions are early intervention, stronger family support','and purposeful activities for young people.'],
];
const simpleChunkOverrides=[
  ['People often blame crimes by young people','on violent movies, games and things they see online,','because these are easy to notice and blame.'],
  ['But I do not think violent media','is the main reason.'],
  ['I think young people are much more likely to break the law','when they do not get steady guidance,','enough adult attention,','and good ways to use their time and energy.'],
  ['So the best action is to help early','through families, schools and local communities.'],
  ['The main reason young people commit crimes','is not what they watch','but the places and people that teach them how to act.'],
  ['If parents are away, too busy to cope,','or unable to set rules,','children may not learn that their actions have results.'],
  ['A violent scene on a screen may upset them','for a short time,','but being ignored day after day may teach them','that hitting, stealing or disobeying brings little cost.'],
  ['The problem gets worse in places','where teenagers have few good adults to learn from','and little to do after school.'],
  ['For example, a boy who spends every evening','with older friends who do small crimes','is not just copying TV;','he is learning real behaviour from the people around him.'],
  ['To solve this, governments and communities should help young people','before using punishment.'],
  ['Schools should notice pupils','who often act violently, skip school or stay alone,','and get them help from counsellors, trusted adults and family services','before these habits become hard to change.'],
  ['At the same time, local government should pay for','cheap sports, arts and job-skills programmes,','especially in poorer areas.'],
  ['These activities give teenagers a routine,','a group to belong to','and a good reason to feel proud.'],
  ['A young person with a coach, a team','and something to feel proud of','is less likely to try to win respect','by breaking the law.'],
  ['To sum up, violent media may be an easy thing to blame,','but it is not the main reason for youth crime.'],
  ['The deeper problems are weak guidance, too little support','and communities with too few resources;','the best answers are early help, stronger family support','and activities that give young people purpose.'],
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
  card('Poor school attendance is often blamed on phones, because they are visible and easy to criticise.','用 is often blamed on ... because 說一個顯眼因素何以容易被當成原因',[1,4,14],
    fixed(0,'[問題] is often blamed on [顯眼因素], because [它容易被指責的原因].','先介紹一種常見歸因，再解釋這個因素為何特別容易成為批評目標。','要引出接下來會檢查或修正的簡單歸因時。',[' is often blamed on ', ', because '],['被解釋的問題','容易被歸咎的因素','它容易受批評的原因'])),
  card('However, I do not agree that homework is the main cause of stress.','用 I do not agree that 直接反對把單一因素列為主要原因',[0,3,13],
    fixed(1,'However, I do not agree that [某因素是主要原因].','明確回應一項主要原因的主張，指出作者不認同。','題目問是否同意某因素是主要原因，須在引言直接表態時。',['However, I do not agree that '],['被反對的主因說法'])),
  card('In my view, pupils are far more likely to miss lessons when buses are unreliable.','用 far more likely to ... when 交代真正風險較高的條件',[1,5,7],
    fixed(2,'In my view, [群體] are far more likely to [出現問題] when [較深的風險條件].','以 when 指出一組情況，使前述問題更可能出現。','否定顯眼的簡單原因後，要提出更具體的風險條件時。',['In my view, ', ' are far more likely to ', ' when '],['受影響的群體','更可能出現的問題','使風險提高的條件'])),
  card('The best response is therefore early support through schools and families.','用 The best response is therefore 從原因判斷推到初步解法',[0,9,15],
    fixed(3,'The best response is therefore [從上述原因得出的做法].','therefore 表示提出的應對承接前文對真正問題的分析。','引言說完主要原因後，要預告大方向解決方法時。',['The best response is therefore '],['從原因判斷得出的應對方向'])),
  card('The central cause of low attendance is not laziness, but the lack of reliable transport.','用 is not ... but ... 修正被過度重視的原因',[0,1,6],
    fixed(4,'The central cause of [問題] is not [表面解釋], but [較深環境因素].','排除一個容易責怪的表面原因，轉向更能解釋行為的環境。','主體段要清楚區分被指責的表象與更核心的原因時。',['The central cause of ', ' is not ', ', but '],['被解釋的問題','表面解釋','較深的原因'])),
  card('If teachers are too busy or unable to offer help, pupils may never ask questions early.','用 If 設定成人無法支援，指出孩子可能缺少甚麼認知或習慣',[2,7,10],
    (()=>{const t=original[5],a=t.indexOf(', children may never ');return {formula:'If [成人缺席或無法設界線], [孩子] may never [建立需要的認知].',meaning:'先交代照顧或指導上的缺口，再說明孩子可能因此缺少的後果意識。',usage:'要解釋成人長期支援不足如何影響孩子學習行為界線時。',parts:[part('If ','link','條件連接詞'),part(t.slice(3,a),'slot','成人支援不足的情況'),part(', ','link','主句分界'),part('children','slot','受影響的孩子'),part(' may never ','link','可能的缺失'),part(t.slice(a+', children may never '.length),'slot','未建立的認知')]};})()),
  card('A single argument may upset a team briefly, but daily unfair treatment can destroy trust.','用 may ... briefly, but daily ... can 對照短暫刺激與日常環境的長期作用',[0,4,14],
    fixed(6,'[短暫刺激] may [短期反應], but [日常環境] can [更深的學習或後果].','承認單一畫面可能有短期影響，但指出重複的日常經驗更可能塑造行為。','要比較一次性刺激和持續環境的相對影響時。',[' may ', ', but ', ' can '],['一次性刺激','短期反應','持續的日常環境','較深的後果'])),
  card('This problem becomes even worse in areas where buses rarely run.','用 becomes even worse in areas where 指出問題在何種地區更嚴重',[2,8,11],
    fixed(7,'This problem becomes even worse in areas where [地區缺少的條件].','限定某些地區因缺少資源或機會，使原有問題變得更嚴重。','要指出問題並非在所有地方同樣嚴重，並給出地區條件時。',['This problem becomes even worse in areas where '],['令問題加劇的地區條件'])),
  card('For instance, a new worker who copies rude colleagues is not merely following a video; she is learning a workplace pattern.','用 not merely ...; ... 說明行為不是簡單模仿媒體，而是在現實群體中學會',[4,6,14],
    fixed(8,'For instance, [某人] is not merely [表面模仿]; [他實際正受群體牽引].','用例子修正「只是在模仿內容」的解釋，指出現實人際圈的作用。','要顯示某種行為由真實同儕環境塑造，而非只由觀看內容造成時。',['For instance, ', ' is not merely ', '; '],['被舉例的人及所處情況','被否定的表面模仿','實際的群體影響'])),
  card('To deal with this situation, managers should focus on training before blame.','用 To deal with ... should focus on ... before 排定支援與處罰的優先次序',[3,10,15],
    fixed(9,'To deal with this situation, [行動方] should focus on [先採取的支援] before [較後的處罰].','先指出處理目標，再把支持性做法放在懲罰之前。','要提出解決問題時的行動次序，避免只靠事後處罰時。',['To deal with this situation, ', ' should focus on ', ' before '],['負責處理的一方','優先支援','之後才考慮的處罰'])),
  card('Clinics should identify patients who miss visits and connect them with support before small problems grow.','用 identify ... and connect ... before 寫出及早辨認、轉介與時限',[5,9,11],
    fixed(10,'[機構] should identify [早期跡象] and connect them with [支援] before [問題固化].','提出一套及早辨認與轉介的連續做法，並指出不能等到問題成習慣。','要把「早期介入」寫成可執行的步驟時。',[' should identify ', ' and connect them with ', ' before '],['負責辨認的機構','需要及早察覺的人或跡象','可提供的支援','不能等到的較難處理階段'])),
  card('At the same time, councils should fund free sports programmes, especially in villages with few facilities.','用 At the same time ... should fund ... especially in 加入社區資源及優先地區',[7,9,12],
    fixed(11,'At the same time, [地方機構] should fund [正面活動], especially in [資源較少地區].','與個別支援同步，提供能讓人參與的活動，並把資源優先放到缺乏機會的地方。','已寫學校個別支援，接着要補上社區層面的預防措施時。',['At the same time, ', ' should fund ', ', especially in '],['地方機構','值得資助的活動','特別需要資源的地區'])),
  card('After-school clubs give children routine, friendship and a sense of progress.','用 give 並列活動帶來的規律、歸屬與正當成就',[3,7,13],
    fixed(12,'[正面活動] give [參與者及其得到的規律、歸屬和成就].','說明活動不只是消磨時間，還能提供可持續的生活結構及社會認同。','提出活動方案後，要說明它如何改變年輕人的日常生活時。',[' give '],['提供好處的活動','參與者及得到的多項好處'])),
  card('A pupil who has a mentor and a club is less likely to feel alone after school.','用 who has ... is less likely to 解釋支援與歸屬如何降低負面選擇',[2,8,12],
    fixed(13,'[年輕人] who has [支持網絡] is less likely to [透過不良方式求認同].','指出教練、團隊或自豪來源如何減少對不良地位感的依賴。','要解釋正面活動如何降低青少年尋求錯誤認同的可能性時。',[' who has ', ' is less likely to '],['受支援的年輕人','提供歸屬的支持網絡','較不可能採取的行為'])),
  card('In conclusion, poor effort may seem like a convenient explanation, but it is not the main cause of missed lessons.','用 may seem like ... but it is not 重申容易責怪的說法並非主因',[1,4,6],
    fixed(14,'In conclusion, [顯眼因素] may seem like [方便解釋], but it is not [真正主因].','結尾承認一種歸因為何容易被接受，仍明確否定它是主要原因。','要在結論回應「是否同意某因素為主因」時。',['In conclusion, ', ' may seem like ', ', but it is not '],['顯眼因素','看似方便的解釋','被否定的主因定位'])),
  card('The deeper roots are unreliable transport and weak support, and the best solutions are safer routes and early help.','用 The deeper roots are ... and the best solutions are 成對總結原因與對應方案',[3,10,11],
    fixed(15,'The deeper roots are [較深原因], and the best solutions are [對應方案].','把原文的較深原因與相應的預防做法成對收束，完整回答兩個題問。','結尾須同時重申對主因的判斷與具體解決方法時。',['The deeper roots are ', ', and the best solutions are '],['較深的原因','與原因相配的方案'])),
];
const wrongReasons=[
  ['I do not agree 直接反對主因說，沒有解釋顯眼因素為何容易被責怪。','is not ... but ... 修正原因，沒有介紹常見歸因的吸引力。','結尾重申某因素非主因，沒有說它為何容易受批評。'],
  ['is often blamed on 描述常見指責，沒有作者的直接不同意。','The best response 提出解法，沒有對主要原因表態。','who has ... less likely 說支援降低風險，沒有反對媒體主因說。'],
  ['I do not agree 只否定一種說法，沒有提出較高風險出現的條件。','If 說成人支援缺口的後果，沒有概括年輕人何時更可能犯事。','becomes even worse in areas 限定地區加劇，沒有對整體風險條件作立場判斷。'],
  ['常見歸因的開場，沒有 therefore 由原因推到解法。','To deal with 具體排列支援與處罰，沒有引言的總回應方向。','結尾列根源和方案，沒有先預告早期介入的策略。'],
  ['is often blamed on 引出被責怪因素，沒有明確提出另一個核心環境原因。','I do not agree 否定主因，但沒有 is not ... but 的替代解釋。','短暫畫面與日常忽視的比較，沒有直接給出核心原因的總判斷。'],
  ['far more likely ... when 概括風險提高的條件，沒有成人缺席下孩子學不到甚麼。','地區缺榜樣使問題更嚴重，沒有父母界線與孩子後果認知的關係。','identify ... before 說學校及早支援，沒有 If 條件造成認知缺口。'],
  ['blamed on ... because 解釋常見歸因，沒有短暫媒體與日常經驗的對比。','is not ... but 直接換核心原因，沒有 may briefly ... but daily 的時間尺度。','結尾承認方便解釋又否定主因，沒有具體比較兩種影響。'],
  ['far more likely ... when 說一般風險條件，沒有指出哪些地區特別嚴重。','not merely ... 說同儕環境的個案，沒有地區資源缺乏的總述。','At the same time 提出應資助活動，沒有先解釋地區差異。'],
  ['is not ... but 修正兩個原因，沒有一名男孩受真實同儕群體影響的例子。','單一畫面與日常忽視的比較，沒有 not merely copying 的現實社交說明。','結論否定媒體主因，沒有具體青少年晚間同儕活動的機制。'],
  ['The best response 預告介入方向，沒有支持與懲罰的明確先後。','identify ... before 說及早辨認轉介，沒有總政策上支援優先。','The deeper roots 總結原因與解法，沒有 focus on ... before 的行動次序。'],
  ['If 成人缺席後孩子未建立界線，沒有學校辨認及連結支援的步驟。','To deal with 概括支援優先，沒有辨認、轉介與時限。','At the same time 說地方資助活動，沒有個別學生的及早支援。'],
  ['地區缺榜樣加劇問題，沒有政府應資助甚麼活動。','focus on support before punishment 說行動次序，沒有地方層面的資源投入。','give teenagers ... 說活動帶來的好處，沒有資助與優先地區的建議。'],
  ['The best response 概括介入方向，沒有活動對生活的三項直接作用。','地區問題加劇說機會不足，沒有活動提供的規律與歸屬。','who has coach 說支援後犯罪風險較低，沒有先列活動本身的好處。'],
  ['far more likely ... when 提出缺支援時風險較高，沒有具體支持網絡降低另一選擇。','同儕個案說負面牽引，沒有正面團隊的保護作用。','活動帶來規律與歸屬，沒有說某人較不會透過犯罪找地位。'],
  ['I do not agree 是引言直接表態，沒有結尾承認方便解釋再否定。','is not ... but 直接對照原因，沒有 may seem like 的表面吸引。','may briefly ... but daily 比較影響方式，沒有重申非主因的結論。'],
  ['The best response 只預告應對方向，沒有對應總結根源與方案。','identify ... before 詳寫學校行動，沒有兩組因素的結尾歸納。','At the same time 加入社區資助，沒有把主因與所有方案成對收束。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求作者回答甚麼？',[
    '媒體暴力是否青少年犯罪的主因，以及可以怎樣處理問題',
    '所有青少年觀看媒體的時數，以及每種遊戲的法定價格',
    '成年人是否喜歡暴力電影，以及社區應否開設博物館',
    '犯罪紀錄應保存多久，以及警察應否參與學校考試',
  ],'先判斷媒體暴力是否主要原因，再提出針對真正風險的處理方法。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '家庭引導、日常忽視、同儕群體和社區資源比媒體畫面更能解釋風險',
    '學校及早辨認並連結支援，社區同時提供有規律和歸屬的活動',
    '只要完全禁止電影和遊戲，家庭與同儕因素便不再重要',
    '應等青少年形成固定犯罪模式後，才考慮提供任何幫助',
  ],correct:[0,1],why:'第一主體段分析較深的環境成因；第二主體段提出先支援、及早轉介與社區活動。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言回答兩問','承認暴力內容容易受責怪，否定它是主因，提出及早介入方向。'],
  ['原因：日常環境','家長缺席或無法設界線、日常忽視與現實同儕，較能塑造行為。'],
  ['解法：及早支援','學校辨認學生並連結支援；地方政府資助可負擔的活動。'],
  ['結論配對收束','重申媒體暴力非主因，把薄弱引導與資源不足對應到家庭、學校和社區方案。'],
],'先表明主因判斷 → 展開環境與同儕機制 → 提出對應支援 → 成對總結原因與方案。')];
const evidence=[
  quiz('為何媒體暴力容易受到責怪？',[
    '暴力電影、遊戲及網上內容顯眼，因而容易被看見和批評',
    '所有青少年觀看同一段內容後，都必然犯相同的罪',
    '媒體畫面可直接證明每個家庭都缺少規則和照顧',
    '電影公司本身能決定每個社區的活動與導師人數',
  ],'作者解釋常見歸因的吸引力，並沒有因此接受它為主要原因。'),
  quiz('作者認為甚麼更可能提高青少年犯罪風險？',[
    '長期缺少穩定引導、成人關注和正面運用精力的途徑',
    '短時間看到一段令人震驚的畫面，卻得到穩定照顧',
    '有可參加的活動、可信任的成人與清楚的家庭界線',
    '曾經在學校討論電影故事，並了解行為的後果',
  ],'原文把風險放在日常引導、監督與正面機會的缺口。'),
  quiz('家長無法設立界線，可能產生甚麼後果？',[
    '孩子未能清楚理解攻擊、偷竊或反抗有實際後果',
    '孩子必然會因為所有電視節目而立即犯罪',
    '孩子會自動得到教練、團隊和社區活動的支援',
    '孩子只須看一次電影便能學會負責任的行為',
  ],'條件句說明成人界線缺失與後果意識的關係。'),
  quiz('螢幕上的暴力與日常忽視在文中如何對比？',[
    '畫面可能短暫震撼，持續忽視卻可能慢慢塑造對違規代價的看法',
    '畫面會長期教孩子設界線，忽視只能造成一瞬間的驚訝',
    '兩者完全相同，都不涉及孩子對攻擊和偷竊的認知',
    '作者只計算觀看時數，沒有討論日常生活環境',
  ],'may briefly 與 daily 的對照區分短暫刺激和反覆經驗。'),
  quiz('年長同伴的例子要修正哪一種說法？',[
    '男孩不只模仿電視，還受現實同儕群體的行為模式牽引',
    '男孩只因家中電影太多，完全沒有與任何同伴接觸',
    '男孩與年長同伴相處，就表示所有同伴都會犯罪',
    '男孩只需換一種電視節目，便不再需要成人支援',
  ],'not merely ...; ... 把注意力由媒體模仿轉到實際社交環境。'),
  quiz('學校應在甚麼階段做甚麼？',[
    '及早察覺攻擊、逃學或孤立，並連結輔導員、導師及家庭服務',
    '等行為變成固定模式後，才記錄學生是否需要幫助',
    '只觀察考試名次，避免詢問學生的日常處境',
    '單靠停課處分，不與任何可信任的成人合作',
  ],'原文先辨認可見跡象，再連結人與服務，而且有「形成模式之前」的時限。'),
  quiz('可負擔的活動如何幫助青少年？',[
    '提供規律、歸屬和正當成就感，減少靠犯罪尋求地位',
    '只填滿時間，與生活規律和認同感完全沒有關係',
    '讓每個參加者自動擁有高收入，毋須成人引導',
    '取代所有家庭和學校責任，因此不用及早介入',
  ],'活動的作用是建立日常結構和正面身份，並配合其他支援。'),
];
const logic=[
  sequence('第一主體段：由顯眼歸因轉向較深的風險',[
    ['否定單一媒體原因','核心原因不只是青少年看甚麼，而是從甚麼環境學習行為。'],
    ['成人引導缺口','家長缺席或難以設界線，孩子可能不懂行為後果。'],
    ['比較影響時間','螢幕畫面或短暫震撼；長期忽視卻可反覆教出錯誤觀念。'],
    ['地區條件加劇','缺乏正面榜樣及放學後活動，令風險更高。'],
    ['同儕個案','男孩與參與輕微犯罪的年長同伴相處，受現實群體牽引。'],
  ],'由總原因到家庭、時間尺度、社區機會和同儕個案，逐層證明「環境」如何起作用。'),
  sequence('第二主體段：由及早支援到正面身份',[
    ['政策先後','政府和社區應把支援放在懲罰之前。'],
    ['學校辨認轉介','及早找出反覆攻擊、逃學或孤立的學生並連結服務。'],
    ['社區投入','地方政府資助可負擔的體育、藝術與職業活動，特別顧及資源少的地區。'],
    ['活動作用','活動帶來規律、歸屬和正當的成就感。'],
    ['減少犯罪地位需求','有教練、團隊及自豪來源的年輕人較少靠犯罪求地位。'],
  ],'先處理個別學生的早期跡象，再擴大社區機會，最後說明活動如何改變行為誘因。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('一所學校把逃學全部歸咎手機影片，但缺課者多數沒有穩定交通或放學後照顧。','哪項最能轉用範文對「顯眼因素」的警覺？',[
    '先檢查交通與照顧缺口，再判斷影片是否真是主要原因',
    '只計算影片觀看次數，毋須查看缺課者的日常安排',
    '直接否定手機可能有影響，完全不用再調查任何因素',
    '因影片容易被看見，便把它列為所有逃學的唯一主因',
  ],[
    '範文說顯眼又易批評的因素會受責怪，但主因須由日常環境證據判斷。',
    '只看顯眼線索會漏掉題目已指出的交通和照顧問題。',
    '範文反對把媒體視為主因，沒有主張完全排除其可能影響。',
    '「容易被看見」只能解釋責怪何以出現，不能證明因果。',
  ],[0,2,4],'範文先說媒體內容顯眼易受批評，再改查家庭、監督與活動機會。'),
  transfer('有公司把員工失誤歸咎一段網上短片，卻長期沒有清楚規則或主管指導。','哪項最符合短暫刺激與日常環境的對比？',[
    '短片或有短暫影響，仍要檢查長期缺乏規則與指導',
    '短片一出現，就可排除主管和工作制度造成的影響',
    '只要規則不清楚，短片便必定對任何人毫無影響',
    '把所有失誤當成個人問題，不用比較不同影響的時間',
  ],[
    '原文比較短暫畫面與反覆忽視，指出後者可能更深地塑造行為。',
    '一段短片不足以排除日常制度和指導的作用。',
    '原文說媒體可能有短暫影響，沒有說影響必定為零。',
    '題目正需要比較短暫與長期兩種機制。',
  ],[5,6],'範文以暴力場景的短暫震撼，對比日常忽視持續教給孩子的錯誤觀念。'),
  transfer('社區有人認為一名少年破壞公物只是模仿電影；他其實每晚與參與輕微犯罪的年長同伴相處。','哪項最能運用範文的同儕例子？',[
    '調查現實同儕如何帶動行為，不只停在電影模仿說',
    '先假設所有年長同伴都犯罪，毋須分辨實際行動',
    '只查少年看過甚麼電影，不問他與誰一起度過晚上',
    '因一名同伴涉事，便認定少年從未接觸任何電影',
  ],[
    'not merely ...; ... 的關鍵是把表面模仿說與現實社交機制分開。',
    '一個群體的具體行為不能推到所有年長同伴。',
    '這會忽略題目提供的日常同儕證據。',
    '原文不須否認觀看媒體，便能指出更有力的同儕因素。',
  ],[7,8],'範文的男孩個案說他不只在模仿電視，也受年長同儕的實際行為模式牽引。'),
  transfer('校方發現一名學生反覆打架和缺課，準備只用停課來處理。','哪項最符合範文的早期介入步驟？',[
    '先辨認跡象並連結輔導和家庭支援，再評估紀律措施',
    '先等打架與缺課成為固定模式，再考慮任何支援',
    '只增加停課次數，不了解學生是否缺乏成人照顧',
    '把所有責任交給家長，學校毋須觀察或轉介學生',
  ],[
    '範文把學校辨認、轉介和形成模式之前的時限連成可執行方案。',
    '等到模式固定，正好錯過原文強調的及早時機。',
    '懲罰本身不能處理文章指出的支援缺口。',
    '原文指定學校參與辨認並連結家庭與專業服務。',
  ],[9,10],'範文主張先支援後懲罰；學校要及早識別攻擊、逃學和孤立，並接通輔導員、導師及家庭服務。'),
  transfer('一個資源較少的地區放學後缺少安全場所，少年常無處可去。','哪項最能轉用範文的社區層面方案？',[
    '資助可負擔的體育、藝術及技能活動，優先補足該區機會',
    '只在資源最多的地區開高價活動，避免處理機會缺口',
    '單靠禁止網上影片，便假設放學後場所自然出現',
    '等少年有犯罪紀錄後，才考慮是否需要活動場所',
  ],[
    '範文把可負擔的活動與資源匱乏地區直接配對。',
    '高價活動及錯配地區不能回應題目中的機會缺口。',
    '禁止內容不能提供安全、可參與的現實活動。',
    '預防方案應在犯罪行為固定之前提供選擇。',
  ],[7,11,12],'範文建議地方政府資助可負擔的體育、藝術和職業活動，特別照顧資源不足的社區。'),
  transfer('少年希望在同伴面前得到認同；學校可安排教練、團隊和定期活動。','哪項最能說明這些活動的作用機制？',[
    '規律和團隊帶來歸屬與正當成就，減少靠違規求地位',
    '活動只負責消磨時間，與認同感及行為選擇無關',
    '只要少年加入團隊，便完全不再需要家庭和學校支援',
    '教練只須增加處罰，就能代替所有正面成就來源',
  ],[
    '文章把活動的規律、歸屬與成就連到較少透過犯罪求地位。',
    '這忽略文章特別指出的心理和社交作用。',
    '範文同時提出家庭、學校和社區的支援，沒有單一萬能方案。',
    '懲罰不能代替正當的認同和成就來源。',
  ],[12,13],'範文說活動提供規律、歸屬及正當成就；有教練和團隊的青年較少靠犯罪尋求地位。'),
  transfer('有家長工作繁忙，難以持續看顧孩子或設立清楚的界線。','哪項最能對應範文的家庭原因與解法？',[
    '提供家庭支援與可信任成人協助，幫孩子理解行為後果',
    '只責怪孩子的電影選擇，完全不檢查日常照顧情況',
    '等孩子已持續犯事後，才第一次介紹家庭支援服務',
    '因家長工作繁忙，就假設設立界線永遠沒有可能',
  ],[
    '原文將缺乏成人引導與後果意識相連，方案要補上及早支援。',
    '只責怪內容，沒有回應題目提供的監督缺口。',
    '延後服務不符合文章的早期介入原則。',
    '範文提出支援家庭，並非把困難視作不可改變。',
  ],[2,5,10,15],'範文以家長缺席、無法設界線說明風險，並在結論提出加強家庭支援。'),
  transfer('校園欺凌被全數歸咎熱門影片，但涉事群體長期缺少成人指導與安全的課後活動。','哪項最能寫出完整的原因分析？',[
    '承認影片顯眼，再比較成人指導、群體行為和課後機會',
    '直接把熱門影片當作唯一原因，無須調查涉事群體',
    '只討論課後活動數量，完全不考慮人際與成人引導',
    '只比較影片觀看率，不用說明欺凌行為如何學會',
  ],[
    '範文由容易責怪的媒體轉到行為學習的環境與正面機會。',
    '唯一原因說沒有處理題目提供的多重日常條件。',
    '社區機會重要，但人際和成人指導也是論證的一部分。',
    '觀看率不能單獨交代行為如何在群體中形成。',
  ],[0,4,7,8],'範文的核心對照是看過甚麼與從哪個環境學會行為；家庭、同儕和活動機會都有作用。'),
  transfer('城市撥款開免費球隊和藝術班，有議員說這些活動只能令青年忙一點，沒有其他價值。','哪項最能補上範文的論證？',[
    '活動還可建立規律、歸屬與成就，使青年有正當認同',
    '活動的唯一功能是填滿日程，不能影響日常生活方式',
    '只要活動免費，青年便自動不會再有任何風險',
    '藝術班與球隊必然完全取代學校和家庭的支援',
  ],[
    '文章具體列出活動對日常結構和社會認同的影響。',
    '這正是議員低估了的非時間作用。',
    '原文說較不可能靠犯罪求地位，並未保證零風險。',
    '活動是綜合支援的一環，不能完全取代其他機構。',
  ],[11,12,13],'範文並列 structure、belonging 和 legitimate achievement，再說正面身份減少靠犯罪求地位的誘因。'),
  transfer('政府要回應青少年犯罪，一份建議只要求封鎖暴力遊戲，沒有提及家庭、學校或社區。','哪項最能補成範文式結論？',[
    '重申媒體非主因，將引導與資源缺口配對早期和社區支援',
    '把封鎖遊戲列為唯一答案，並省略更深層原因的討論',
    '只重述問題嚴重，完全不說原因與方案如何互相對應',
    '只要求加重處罰，並推遲學校辨認及家庭支援的工作',
  ],[
    '原文結尾同時重申主因判斷，並把較深根源對應可行的支援方案。',
    '單一內容限制沒有處理原文提出的日常環境風險。',
    '雙問題目需要原因判斷和對應解法，不只重述現象。',
    '原文優先早期支援，而非只靠事後懲罰。',
  ],[1,3,9,10,11,15],'範文的結論成對總結：較深根源在監督、支援與資源，解法為早期介入、家庭支援和有目的的活動。'),
];
const editorialWrongChoices=[
  ['先查影片觀看習慣，交通與照顧問題留給家庭自行處理','先改善交通，影片影響可由學生的觀看次數直接推定','缺課者缺乏照顧，但影片仍應先列為共同的首要原因'],
  ['先分析短片內容，把主管指導不足列作個別員工失誤','規則長期不清楚，因此短片影響可暫不另行評估','員工失誤可能有多因，只按最近事件的先後作判斷'],
  ['先調查同伴是否涉事，再用電影內容解釋少年的行為','年長同伴或有影響，仍以電影模仿作主要犯罪原因','少年與同伴長期相處，但只須調查他是否看過電影'],
  ['先採取停課維持秩序，再等家庭提出需要才轉介支援','先聯繫家庭，學生打架與缺課的跡象可留待日後記錄','先由輔導員查原因，學校規則與紀律措施暫時取消'],
  ['增加課後活動，但先讓資源充足地區的少年參與試辦','先限制影片觀看時間，安全活動場所可留待下年興建','待少年有違規紀錄後，才判斷是否需要體藝機會'],
  ['團隊活動有助交朋友，行為選擇仍主要靠增加處罰','教練可給予認同，但活動規律只負責安排放學時間','活動帶來成就感，因此家庭與學校不必再提供界線'],
  ['先介紹家庭支援，成人界線可待家長工作減少後建立','讓學校增加紀律處理，家長照顧問題另交社區機構','向孩子說明後果，可信任成人的持續協助可稍後安排'],
  ['承認影片易被看見，再把群體行為留待課後活動改善','先比較影片觀看率，再用成人指導不足作補充資料','課後活動不足是關鍵，影片與同儕影響可暫不檢查'],
  ['免費活動可填滿日程，規律與歸屬感可留待學校建立','球隊提供競技成就，藝術班主要作為放學後的看顧','活動讓少年結識同伴，但未必需要引導正當的認同'],
  ['封鎖遊戲可作第一步，家庭與學校支援留到之後再談','先增加社區活動，再把家庭界線不足歸因於媒體內容','先確認媒體不是主因，具體解法可等犯罪率下降再設'],
];
const editorialWrongFeedback=[
  ['交通及照顧正是題目已知的缺口，不能只交給家庭。','觀看次數不足以證明造成缺課的因果。','先把顯眼影片定為首因，重複了範文反對的捷徑。'],
  ['長期缺乏指導是工作環境問題，不只是個別失誤。','制度缺口重要，但仍須比較短片是否有短暫作用。','先後次序不等於主要原因；要比較長期環境與刺激。'],
  ['查同伴是對的，仍要分析其現實影響而非回到電影。','長期接觸涉事同伴是較直接的情境線索。','只問電影會漏掉每天相處的同儕影響。'],
  ['停課可暫時減少干擾，但早期支援不應等家長提出。','家庭合作有用，也要記錄學校已見的早期跡象。','查原因並不要求取消公平的紀律界線。'],
  ['資源應優先補足機會缺口最大的地區。','限制影片不能自行創造安全的課後場所。','等到違規後才提供機會，錯失預防階段。'],
  ['交朋友是部分好處，還要解釋規律和正當成就。','時間安排有用，但不能取代歸屬感的機制。','活動不能單獨取代家庭與學校的持續支援。'],
  ['家庭支援要幫忙建立界線，不能只等待工作變少。','學校處理與家庭照顧需要協調，不宜切開。','持續成人協助是關鍵，不宜放到最後。'],
  ['只交給活動改善，沒有比較成人與同儕如何影響行為。','觀看率是相關資料，不能單獨解釋欺凌如何形成。','範文警惕單因論，應比較多種現實與媒體因素。'],
  ['免費活動可給青年更深的歸屬與成就，不只是消磨時間。','競技與藝術都有可能提供正當成就，不宜分得太窄。','結識同伴若缺少正向引導，未必能改變地位來源。'],
  ['只把家庭與學校放到日後，仍未對準較深原因。','社區活動有用，但不能把家庭問題改寫成媒體主因。','確認原因後仍須提出相應的早期與社區方案。'],
];
transferTasks.forEach((item,index)=>{item.options=[item.options[0],...editorialWrongChoices[index]];item.explanations=[item.explanations[0],...editorialWrongFeedback[index]];item.why=item.explanations[0]});
export default {
  key:'direct-question:9',
  meta:{topic:'青少年犯罪的成因與預防',summary:'媒體暴力不是主因；家庭引導、及早支援與社區活動更能處理深層風險。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
