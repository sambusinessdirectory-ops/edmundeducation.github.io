// Full source-specific memorisation support for Direct Question 40.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-40-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:40'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Modern tools are now used in almost every kind of job.',
  'I think these tools have changed work mainly by making it quicker, easier to do in different ways and less dependent on being in one place.',
  'But depending too much on computers can make people less able to judge things for themselves and cause big problems when the computers stop working.',
  'One big change is that workers can now talk, create materials and organise work much faster.',
  'Email, shared online files, video calls and programs that do tasks for people let workers finish jobs quickly that once needed paper, travel or long meetings.',
  'For example, people in a team selling products can work on the same file, talk to customers in other countries and check how an advert is doing without sitting in one office.',
  'This does more than save time; it changes what people expect at work.',
  'Workers are now expected to answer quickly, learn new programs and work with people in other teams and other time zones.',
  'So technology has changed many slow jobs tied to one place into quicker jobs where people can work together from far apart.',
  'Even so, depending too much on technology has clear problems.',
  'The biggest problem is that people may forget useful skills when machines make too many choices for them.',
  'If workers always use programs to do sums, plan tasks or send messages, they may feel less able to solve problems on their own.',
  'Another danger is that work can stop if a company’s internet, stored information or computer-run system stops working.',
  'For example, a hospital, bank or delivery company that cannot open its computer records may find it hard to help people safely and quickly.',
  'Technology is helpful, but if it is the only way to do a job, one failure can stop everything.',
  'To sum up, modern tools have made work faster, easier to change and easier to do with people around the world.',
  'Still, I think depending on them too much is risky because people may lose skills and organisations may be badly affected when systems fail.',
  'The best places to work therefore use technology as a useful tool, while people still make important decisions.',
];
const vocabulary=[
  [['Modern technology','Modern tools','現代科技'],['embedded in professional life','used in almost every kind of job','融入工作']],
  [['transformed work','changed work','改變工作'],['faster','quicker','更快'],['more flexible','easier to do in different ways','更靈活'],['less tied to physical location','less dependent on being in one place','較少受地點限制']],
  [['excessive reliance','depending too much','過度依賴'],['digital systems','computers','數碼系統'],['weaken human judgement','less able to judge things for themselves','削弱人判斷'],['serious disruption','big problems','嚴重干擾'],['systems fail','computers stop working','系統故障']],
  [['employees','workers','員工'],['communicate','talk','溝通'],['produce','create materials','產出'],['manage work','organise work','管理工作'],['far greater efficiency','much faster','高效率']],
  [['cloud platforms','shared online files','雲端平台'],['video meetings','video calls','視像會議'],['automated software','programs that do tasks for people','自動軟件'],['paper files','paper','紙本文件'],['travel','travel','出差'],['almost instantly','quickly','幾乎即時']],
  [['marketing team','team selling products','市場推廣團隊'],['edit the same document','work on the same file','共同編輯文件'],['overseas clients','customers in other countries','海外客戶'],['monitor campaign results','check how an advert is doing','監察宣傳效果'],['same office','one office','同一辦公室']],
  [['does not merely save time','does more than save time','不只省時'],['workplace expectations','what people expect at work','職場期望']],
  [['Workers','Workers','員工'],['respond quickly','answer quickly','迅速回應'],['new tools','new programs','新工具'],['collaborate across departments','work with people in other teams','跨部門合作'],['time zones','time zones','時區']],
  [['In this sense','So','從這意義'],['slow, location-based routines','slow jobs tied to one place','緩慢固定地點流程'],['faster and more connected forms of work','quicker jobs where people can work together from far apart','快捷互聯工作']],
  [['Nevertheless','Even so','然而'],['relying too heavily','depending too much','過度依賴'],['clear disadvantages','clear problems','明顯缺點']],
  [['most serious problem','biggest problem','最嚴重問題'],['practical skills','useful skills','實用技能'],['machines make too many decisions','machines make too many choices','機器代決']],
  [['depend on software','use programs','依賴軟件'],['calculate','do sums','計算'],['organise','plan tasks','組織'],['communicate','send messages','溝通'],['less confident','feel less able','較缺信心'],['independently','on their own','獨立地']],
  [['further risk','Another danger','另一風險'],['vulnerability','work can stop','脆弱性'],['database','stored information','資料庫'],['automated system','computer-run system','自動系統'],['grind to a halt','stop','陷入停頓']],
  [['For instance','For example','例如'],['logistics company','delivery company','物流公司'],['access its digital records','open its computer records','存取數碼記錄'],['struggle to serve customers','find it hard to help people','難服務顧客'],['efficiently','quickly','有效率']],
  [['Technology is useful','Technology is helpful','科技有用'],['only road available','only way to do a job','唯一道路'],['one broken bridge','one failure','一座斷橋'],['stop the whole journey','stop everything','阻斷全程']],
  [['In conclusion','To sum up','總結'],['modern technology','modern tools','現代科技'],['quicker','faster','更快捷'],['more flexible','easier to change','更靈活'],['globally connected','with people around the world','全球互聯']],
  [['Even so','Still','即使如此'],['excessive dependence','depending on them too much','過度依賴'],['dangerous','risky','危險'],['human competence','skills','人的能力'],['exposed to technical failure','badly affected when systems fail','易受故障影響']],
  [['best workplaces','best places to work','最佳工作場所'],['powerful tool','useful tool','強大工具'],['not as a substitute for human judgement','people still make important decisions','不取代人的判斷']],
];
const chunkOverrides=[
  ['Modern technology has become embedded','in professional life.'],
  ['I believe it has transformed work mainly','by making it faster, more flexible','and less tied to physical location.'],
  ['However, excessive reliance on digital systems','can weaken human judgement','and create serious disruption when those systems fail.'],
  ['One major change is that employees','can now communicate, produce and manage work','with far greater efficiency.'],
  ['Emails, cloud platforms, video meetings and automated software','allow tasks that once required paper files, travel','or long meetings','to be completed almost instantly.'],
  ['For example, a marketing team can now edit','the same document, speak to overseas clients','and monitor campaign results','without being in the same office.'],
  ['This does not merely save time;','it changes workplace expectations.'],
  ['Workers are now expected to respond quickly,','learn new tools and collaborate across departments','and time zones.'],
  ['In this sense, technology has turned many jobs','from slow, location-based routines','into faster and more connected forms of work.'],
  ['Nevertheless, relying too heavily on technology','has clear disadvantages.'],
  ['The most serious problem is that people','may lose important practical skills','when machines make too many decisions for them.'],
  ['If employees always depend on software to calculate,','organise or communicate,','they may become less confident','when they need to solve problems independently.'],
  ['A further risk is vulnerability:','when a company’s internet, database or automated system breaks down,','work can grind to a halt.'],
  ['For instance, a hospital, bank or logistics company','that cannot access its digital records','may struggle to serve customers safely and efficiently.'],
  ['Technology is useful, but when it becomes','the only road available,','one broken bridge can stop the whole journey.'],
  ['In conclusion, modern technology has changed work','by making it quicker, more flexible','and more globally connected.'],
  ['Even so, I believe excessive dependence on it','is dangerous because it can reduce human competence','and leave organisations exposed to technical failure.'],
  ['The best workplaces therefore use technology','as a powerful tool,','not as a substitute for human judgement.'],
];
const simpleChunkOverrides=[
  ['Modern tools are now used','in almost every kind of job.'],
  ['I think these tools have changed work mainly','by making it quicker, easier to do in different ways','and less dependent on being in one place.'],
  ['But depending too much on computers','can make people less able to judge things for themselves','and cause big problems when the computers stop working.'],
  ['One big change is that workers','can now talk, create materials and organise work much faster.'],
  ['Email, shared online files, video calls','and programs that do tasks for people','let workers finish jobs quickly','that once needed paper, travel or long meetings.'],
  ['For example, people in a team selling products','can work on the same file,','talk to customers in other countries','and check how an advert is doing','without sitting in one office.'],
  ['This does more than save time;','it changes what people expect at work.'],
  ['Workers are now expected to answer quickly,','learn new programs and work with people in other teams','and other time zones.'],
  ['So technology has changed many slow jobs tied to one place','into quicker jobs where people can work together','from far apart.'],
  ['Even so, depending too much on technology','has clear problems.'],
  ['The biggest problem is that people','may forget useful skills','when machines make too many choices for them.'],
  ['If workers always use programs to do sums,','plan tasks or send messages,','they may feel less able to solve problems','on their own.'],
  ['Another danger is that work can stop','if a company’s internet, stored information','or computer-run system stops working.'],
  ['For example, a hospital, bank or delivery company','that cannot open its computer records','may find it hard to help people safely and quickly.'],
  ['Technology is helpful, but if it is','the only way to do a job,','one failure can stop everything.'],
  ['To sum up, modern tools have made work faster,','easier to change and easier to do','with people around the world.'],
  ['Still, I think depending on them too much is risky','because people may lose skills','and organisations may be badly affected when systems fail.'],
  ['The best places to work therefore use technology','as a useful tool,','while people still make important decisions.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Online tools have become embedded in daily school life.','以 has become embedded in 交代科技已深入工作',[1,3,9],fixed(0,'[現代科技] has become embedded in [工作生活].','開題指出科技已是工作常態，為後文變化和依賴風險設背景。','題目說科技普及，要先把它放入現今工作環境時。',[' has become embedded in '],['已成常態的工具','被它深入的領域'])),
  card('I believe software has changed teaching by making lessons faster, more flexible and easier to share.','以 by making ... 三方面回答工作如何變',[0,3,15],fixed(1,'I believe [科技] has transformed [工作] mainly by making it [更快], [更靈活] and [較少受地點限制].','直接回答第一問，預告速度、彈性與位置三種變化。','雙問題目的引言要先概括科技如何改變工作方式時。',['I believe ', ' has transformed ', ' mainly by making it ', ', ', ' and '],['造成改變的科技','被改變的工作','第一項速度變化','第二項安排變化','第三項地點變化'])),
  card('However, heavy dependence on online tools can weaken teachers’ judgement and disrupt classes when servers fail.','以 However 轉入過度依賴的兩項風險',[1,9,16],fixed(2,'However, [過度依賴數碼系統] can [削弱人判斷] and [系統故障時造成中斷].','引言同時表態第二問：依賴過度會弱化能力並放大故障衝擊。','已說科技帶來好處，仍需在引言預告過度依賴的缺點時。',['However, ', ' can ', ' and '],['造成風險的過度依賴','對人能力的影響','故障時的營運影響'])),
  card('One big change is that nurses can share updates and manage care much faster.','以 One major change is that 聚焦效率提升',[1,4,8],fixed(3,'One major change is that [員工] can now [溝通、產出及管理工作] with [更高效率].','第一主體段先說工具如何讓各類工作更快完成。','開始回答科技改變工作，先提出效率這條可由工具例子支撐的主線時。',['One major change is that ', ' can now ', ' with '],['改變工作的人','可更快完成的行動','效率上的差距'])),
  card('Shared files and video calls let jobs that once needed travel be completed quickly.','以 allow tasks that once required ... to ... 對照舊新流程',[3,5,6],fixed(4,'[郵件雲端視像與自動軟件] allow tasks that once required [紙本出差或長會議] to be completed [幾乎即時].','具體工具把舊式需紙張、出行及長會議的工作縮短。','效率總論已提出，需說清哪些工具替代了哪些舊流程時。',[' allow tasks that once required ', ' to be completed '],['新工作工具','過去必要的流程','如今完成的速度'])),
  card('For example, an editing team can share one file, call overseas partners and check results from different offices.','以 For example ... without ... 說明跨國協作不需同室',[4,6,7],fixed(5,'For example, [市場推廣團隊] can now [共編文件、聯絡海外客戶與監察活動] without [同在辦公室].','用團隊日常任務展示同時協作和跨地點工作的可能。','工具清單已列完，需以一個有具體人物和工作任務的場景作證時。',['For example, ', ' can now ', ' without '],['示範的新式團隊','可異地完成的多項任務','不再必要的共同地點'])),
  card('This does not merely save minutes; it changes what families expect from teachers.','以 not merely ...; it ... 從省時推到職場期望',[4,5,7],fixed(6,'This does not merely [節省時間]; it changes [職場期望].','科技不只縮短任務，還改變員工被要求怎樣工作。','效率例子已說完，要說明工具普及造成的制度或行為變化時。',['This does not merely ', '; it changes '],['較直接的速度好處','更深層的工作要求'])),
  card('Staff are now expected to reply quickly, learn new programs and work across time zones.','以 expected to 並列新職場的三種要求',[5,6,8],fixed(7,'[員工] are now expected to [迅速回應], [學新工具] and [跨部門時區合作].','把新期望具體化為回應、持續學習及跨地域協作。','已指出職場期望改變，要列出員工實際被要求做甚麼時。',[' are now expected to ', ', ', ' and '],['承受新期望的員工','第一項速度要求','第二項學習要求','第三項協作要求'])),
  card('In this sense, online tools have turned slow, local routines into quicker, connected work.','以 turned ... from ... into ... 總結工作形態變化',[3,7,9],fixed(8,'In this sense, [科技] has turned [許多工作] from [慢而固定地點的流程] into [快而互聯的形式].','總結第一段：工作由緩慢定點轉成較快、跨地點協作。','工具與期望兩層已說完，要以整體工作形態變化收束時。',['In this sense, ', ' has turned ', ' from ', ' into '],['促成轉變的科技','被轉變的工作','舊工作模式','新工作模式'])),
  card('Nevertheless, relying too heavily on online tools has clear disadvantages.','以 Nevertheless 轉入過度依賴的缺點',[2,8,10],fixed(9,'Nevertheless, [過度依賴科技] has [明顯缺點].','第二主體段由科技改善工作轉向依賴程度的風險。','第一問已答完，需要明確轉入第二問的負面影響時。',['Nevertheless, ', ' has '],['被質疑的依賴方式','接下來要分析的風險'])),
  card('The main problem is that people may lose navigation skills when apps decide every route.','以 when 說機器代決導致人失去實用能力',[9,11,12],fixed(10,'The most serious problem is that [人們] may lose [實用技能] when [機器代作過多決定].','過度代辦可能讓員工不再練習基本判斷與操作。','提出依賴缺點後，先說人本身會失去甚麼能力時。',['The most serious problem is that ', ' may lose ', ' when '],['可能受影響的人','逐漸失去的能力','造成能力退化的條件'])),
  card('If staff always use apps to calculate and plan, they may struggle to solve problems alone.','以 If ... may ... when 解釋依賴與獨立解難信心',[10,12,13],fixed(11,'If [員工] always depend on [軟件] to [計算組織溝通], they may become [較缺信心] when [須獨立解難].','常把基本操作交給軟件，可能削弱獨自處理問題的信心。','實用技能退化已提出，要給出員工日常過度依賴的具體條件時。',['If ', ' always depend on ', ' to ', ', they may become ', ' when '],['依賴的員工','被依賴的工具','被工具接管的任務','可能出現的感受','需自行處理的時刻'])),
  card('Another risk is system failure: when the server goes down, the clinic may stop working.','以冒號及 when 把系統脆弱性具體化為停工',[10,11,13],fixed(12,'A further risk is [脆弱性]: when [網絡資料庫或自動系統故障], [工作] can grind to a halt.','除人失技能外，單一數碼故障也可中斷整個營運流程。','個人能力風險已談完，要提出另一種組織層面風險時。',['A further risk is ', ': when ', ', ', ' can grind to a halt.'],['另一項風險性質','使組織受阻的故障','被迫停下的工作'])),
  card('For instance, a clinic without computer records may struggle to help patients safely.','以 For instance 以醫院銀行物流顯示資料故障後果',[12,14,15],fixed(13,'For instance, [醫院銀行或物流公司] that cannot access [數碼記錄] may struggle to [安全高效服務顧客].','數碼資料無法讀取時，關鍵服務或難安全迅速繼續。','已說停工風險，需挑人命或金融物流相關的具體服務場景作證時。',['For instance, ', ' that cannot access ', ' may struggle to '],['受故障影響的機構','缺少的資料','難維持的服務'])),
  card('Technology helps, but when it is the only route, one failure can stop the whole trip.','以 only road ... broken bridge 比喻單點故障',[12,13,17],fixed(14,'[科技] is useful, but when it becomes [唯一可走的路], [一座斷橋] can stop [整段旅程].','科技可用，但沒有替代流程會讓單一故障阻斷所有工作。','數碼紀錄故障例子已說明，要用易記比喻總結系統依賴時。',[' is useful, but when it becomes ', ', ', ' can stop '],['本來有幫助的科技','被過度依賴的唯一途徑','單點故障','受阻的整體流程'])),
  card('In conclusion, digital tools have changed school work by making it quicker, more flexible and easier to share globally.','以 by making 三項收束第一問的工作改變',[1,8,16],fixed(15,'In conclusion, [現代科技] has changed [工作] by making it [更快], [更靈活] and [全球連繫更多].','結論先回答科技如何改變工作：速度、彈性和跨境連結。','末段要先概括第一問的結果，與引言呼應時。',['In conclusion, ', ' has changed ', ' by making it ', ', ', ' and '],['帶來改變的科技','被改變的工作','第一項速度結果','第二項彈性結果','第三項跨境結果'])),
  card('Even so, I think relying on these tools too much is risky because staff lose skills and systems may fail.','以 because 並列人失能力及組織技術故障',[2,10,15],fixed(16,'Even so, I believe [過度依賴科技] is dangerous because it can [減少人能力] and [令組織易受故障影響].','再答第二問：依賴過度同時傷人能力與組織可靠性。','結論已總結科技好處，還須明確說明過度依賴為何危險時。',['Even so, I believe ', ' is dangerous because it can ', ' and '],['被評價的依賴程度','對人能力的風險','對組織運作的風險'])),
  card('The best schools therefore use computers as tools, not as substitutes for teachers’ judgement.','以 as a tool, not as a substitute 提出人機分工原則',[2,14,16],fixed(17,'[最佳工作場所] therefore use [科技] as [強大工具], not as [人的判斷替代品].','結尾不是拒絕工具，而是要求保留人的判斷。','已權衡效率和風險，要以一條可用的工作原則收束時。',[' therefore use ', ' as ', ', not as '],['需作選擇的工作場所','被使用的科技','適當定位','不應變成的角色'])),
];
const usageRules=[
  '要交代某工具或做法已融入某個生活領域，作為後文的背景時。',
  '要說明一種變化透過幾項具體方式產生，並預告討論方向時。',
  '承認前述好處後，需轉入同一做法可能造成的兩種風險時。',
  '要從一般背景轉到一項最重要的具體變化時。',
  '要對照新工具與舊流程，說明任務完成方式如何改變時。',
  '要用具體人物、任務和限制，證明一項改變已在真實情境發生時。',
  '直接好處已說清，還需指出更深層的行為或制度變化時。',
  '要列明某群人如今被要求做的幾項具體事情時。',
  '已列舉多項變化，需用 from ... into ... 概括舊模式如何轉成新模式時。',
  '要從前述優點轉入同一做法的限制或缺點時。',
  '要指出某種風險最嚴重的後果及觸發條件時。',
  '要用 If ... 說明反覆依賴某做法後，在特定情境可能出現的後果時。',
  '已說一項風險，還需用冒號引出另一種風險的發生條件和結果時。',
  '要用具體機構或場景，說明一種一般風險會造成甚麼服務困難時。',
  '要用容易記住的比喻，說明只靠單一路徑時一次故障可影響全局。',
  '結論要按同一主題，並列數種已經論證的變化時。',
  '承認一種做法有好處後，仍需指出過度使用會帶來甚麼風險時。',
  '要用 as ... not as ... 界定某工具或角色應有的定位時。',
];
structures.forEach((row,i)=>{row.frame.usage=usageRules[i];});
const wrongReasons=[
  ['這句表達科技如何改變工作，未用 has become embedded in 引入普及背景。','這句聚焦員工效率，而非科技融入一個生活領域。','這句轉入過度依賴的缺點，沒有介紹科技的普及。'],
  ['這句只說普及，沒有 by making it 並列三項變化。','這句指出一項效率改變，未概括速度、彈性和地點。','這句在結論重述變化，原句則是引言中的立場預告。'],
  ['這句是科技的好處，沒有 However 的風險轉折。','這句只引出缺點，未並列判斷與系統故障兩項後果。','這句在結論總結風險，原句在引言預告兩項論點。'],
  ['這句在引言概括三項改變，未聚焦員工能做甚麼。','這句列工具與舊流程的對照，沒有 One major change is that。','這句在段末總結工作形態，未直接提出效率這一點。'],
  ['這句只是效率總論，沒有新工具對舊流程的對照。','這句是團隊的具體場景，未用 allow tasks that once required。','這句說期望改變，沒有列出工具和省去的舊步驟。'],
  ['這句列工具，未以特定團隊示範異地合作。','這句分析期望如何改變，未列場景與任務。','這句列員工須具備的新習慣，未說特定團隊的異地協作。'],
  ['這句列工具如何省時，沒有不只省時的 deeper shift。','這句呈現具體任務，沒有從省時轉到工作期望。','這句列期望內容，未用 not merely ...; it ... 作層次轉換。'],
  ['這句是團隊協作的例子，未列員工普遍面對的新要求。','這句先指出期望改變，沒有列出三項具體要求。','這句收束工作形態的改變，未用 expected to 描述員工要求。'],
  ['這句先提出效率主線，沒有 from ... into ... 的整體轉變。','這句列新期望，未對照舊工作和新工作。','這句轉入缺點，沒有總結工作形態的前後對比。'],
  ['這句引言預告兩項風險，原句只作第二主體段的轉向。','這句總結第一主體段的轉變，未引出過度依賴的缺點。','這句已提出技能流失，原句尚未展開具體風險。'],
  ['這句只開啟缺點段，未說機器代決與實用技能流失。','這句以 If 給出依賴軟件的條件，原句先提出風險主張。','這句談系統故障使工作停頓，而非人失去技能。'],
  ['這句提出技能流失的總論，未列出日常軟件依賴的條件。','這句談數碼故障的組織風險，非員工獨自解難的信心。','這句用服務場景說系統故障後果，未說員工日常依賴。'],
  ['這句只談人的技能，沒有冒號與 when 引出系統停頓。','這句講員工依賴軟件，並非公司系統故障。','這句是故障後的機構例子，原句先提出系統脆弱性的主張。'],
  ['這句說故障風險總論，沒有醫院銀行物流的具體例子。','這句用道路比喻總結依賴，不是服務場景。','這句在結論總述工作變化，未提出數碼記錄失效的例子。'],
  ['這句提出停工風險，沒有把唯一道路與斷橋作比。','這句給出醫院等機構的實例，不是單點故障的比喻。','這句是人機分工建議，未用道路意象說沒有替代流程。'],
  ['這句在引言預告三項改變，原句在結論重述成果。','這句在主體段總結新舊工作方式，沒有結論的三項收束。','這句總結依賴風險，未回答科技如何改變工作。'],
  ['這句引言預告兩項風險，原句在結論重申立場。','這句轉入風險段，尚未並列人能力與組織故障。','這句結論總結科技帶來的好處，未說過度依賴危險。'],
  ['這句引言說科技依賴的危害，未提出如何使用科技的原則。','這句用道路比喻指出單點故障，沒有指出人的判斷應保留。','這句總結危險原因，原句以工具與替代品的對照提出準則。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證順序排列，不要把科技好處和依賴風險混在一起。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這篇文章須回答哪兩個問題？',[
    '科技如何改變工作，以及過度依賴有何缺點',
    '公司如何加薪，以及員工應否搬去海外',
    '紙本文件是否美觀，以及辦公室如何裝修',
    '所有職業是否相同，以及會議是否應取消',
  ],'引言先答工作速度、彈性和地點變化，再預告人與系統兩類風險。'),
  {type:'multi',prompt:'選出作者的兩條主要論證線',detail:'選兩項，再按「確認」。',options:[
    '工具讓任務更快，也讓人能跨地點合作',
    '過度依賴會削弱人的能力並放大故障衝擊',
    '科技已讓所有工作完全不需要人的判斷',
    '只要有雲端工具，任何系統都不會故障',
  ],correct:[0,1],why:'作者承認科技提升工作效率，也提醒依賴過度的兩類風險。'},
];
const route=[sequence('依文章次序排列四段的工作',[
  ['引言直接回答雙問題','科技使工作快而靈活；過度依賴傷判斷並帶來中斷。'],
  ['第一主體段說工作改變','工具取代舊流程，團隊異地協作，新期望隨之出現。'],
  ['第二主體段說依賴風險','軟件代決會使人失技能；系統故障會讓服務停頓。'],
  ['結論提出使用原則','用科技提升工作，同時保留人的判斷與替代做法。'],
],'先寫科技能做甚麼，再寫依賴過度的代價，結尾給出人機分工。')];
const evidence=[
  quiz('紙本、出差和長會議為何在第一主體段出現？',[
    '用舊流程對照雲端等工具把任務做得更快',
    '證明現在的工作必須增加所有紙本文件',
    '說明任何面對面會議都一定沒有價值',
    '要求所有團隊完全停止與海外客戶聯絡',
  ],'作者用 once required 和 almost instantly 對照工作速度的改變。'),
  quiz('市場推廣團隊的例子同時展示哪些改變？',[
    '共編文件、聯絡海外客戶和異地查看成果',
    '每人只能編輯自己的紙本文件和留在原地',
    '宣傳活動不必再檢查結果或與客戶溝通',
    '所有團隊工作都只剩下在辦公室長時間開會',
  ],'同一團隊可跨任務、跨國和跨地點工作。'),
  quiz('「不只省時」之後，作者把論點推進到哪裏？',[
    '科技也改變員工被要求回應、學習和合作的方式',
    '科技普及後員工不再需要學習任何新工具',
    '只要省時，工作要求和組織期望都不會改變',
    '員工的工作已經完全不需要跨部門合作',
  ],'新工具改變職場期望，這是比任務省時更深一層的影響。'),
  quiz('作者如何解釋過度依賴使人失去實用技能？',[
    '機器代作太多決定，員工便少了獨立解難的練習',
    '員工每次用軟件，所有技能便會立即消失',
    '只要學會新工具，任何人都必然失去信心',
    '機器故障只會影響資料，絕不影響人的能力',
  ],'作者把常把計算、組織和溝通交給軟件，連到獨立解難信心。'),
  quiz('醫院、銀行和物流公司的例子用來說明甚麼？',[
    '數碼記錄無法存取時，關鍵服務可能難以安全繼續',
    '這些機構從來不需要任何資料才能服務顧客',
    '只要網絡中斷，所有員工便必然不再上班',
    '數碼記錄愈少，所有關鍵服務就必然愈快',
  ],'這是系統故障對組織運作的具體後果。'),
  quiz('「唯一道路」和「斷橋」的比喻指甚麼？',[
    '沒有替代流程時，一次故障可能阻斷整體工作',
    '所有工作都應立即變成道路與橋樑建築',
    '只要有電腦，任何機構就不會出現故障',
    '科技沒有用途，因為所有道路都已經斷裂',
  ],'比喻把單一系統依賴的脆弱性說得容易記住。'),
  quiz('結尾建議工作場所如何定位科技？',[
    '把科技用作強大工具，仍由人保留重要判斷',
    '把所有決定永久交給機器，不保留任何備案',
    '完全停用每一種工具，回到所有舊式流程',
    '只求回應速度，毋須考慮安全或人的能力',
  ],'結論以 tool 和 substitute 對照科技與人的恰當角色。'),
];
const logic=[
  sequence('科技如何改變工作',[
    ['效率主張','員工可更快溝通、產出和管理工作。'],
    ['工具與舊流程','雲端視像自動軟件縮短紙本出差長會議。'],
    ['團隊場景','共編文件、聯絡海外客戶和監察結果可異地完成。'],
    ['期望改變','員工須快回應、學新工具及跨時區協作。'],
    ['工作形態轉變','緩慢定點流程變得快捷而互聯。'],
  ],'作者由工具的直接效率，推到員工要求和整體工作形態。'),
  sequence('過度依賴為何危險',[
    ['人的風險','機器代作過多決定，員工可能失去實用技能。'],
    ['日常機制','計算組織溝通都靠軟件，獨立解難信心下降。'],
    ['組織的風險','網絡資料庫或自動系統故障可令工作停頓。'],
    ['關鍵服務例子','醫院銀行物流若無法讀取資料，服務受影響。'],
    ['使用原則','科技是工具，人的判斷和替代流程仍要保留。'],
  ],'先分開人的能力和組織的脆弱性，最後回到如何使用科技。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間診所正比較線上預約與原本的紙本登記，想評估新工具如何改變日常工作。','哪項最能轉用範文的新舊流程對照？',[
    '比較病人網上預約與職員處理紙本登記所需的時間',
    '只看診所牆壁的顏色，完全不理登記所需的時間',
    '要求所有病人親身排隊，並完全停用網上預約',
    '斷定紙本流程與網上流程從來沒有任何差別',
  ],['範文把新工具與紙本、出差等舊步驟對照，說明效率變化。','牆色與流程無關。','否定工具沒有比較。','否定差別無法分析。'],[3,4],'原文以新工具取代紙本及長會議，說明任務可更快完成。'),
  transfer('一所學校讓教師共編課程文件，並與外地學校開視像會議。','哪項說明最貼近範文的團隊例子？',[
    '教師可在不同地點共編文件，並同時與外地同事商量',
    '教師只能在同一房間共編文件，不能聯絡外地學校',
    '教師既然能開視像會議，便不必準備任何課程內容',
    '教師只需增加紙本傳遞，毋須分享任何線上文件',
  ],['原文的推廣團隊也用同一文件、聯絡海外客戶而不必同室。','與異地例子相反。','視像不取代內容。','反向回到舊流程。'],[4,5],'原文以市場推廣團隊展示異地共編、跨國聯絡和監察成果。'),
  transfer('一家出版社說新平台只是讓稿件傳得快，編輯卻發現自己開始被要求隨時回應。','哪項最能使用「不只省時」的推論？',[
    '平台也改變編輯的回應期望，不能只看傳稿速度',
    '只要傳稿變快，編輯工作要求就完全沒有改變',
    '編輯應立即停止學習新工具，所有要求都可忽略',
    '平台的唯一作用是搬運紙箱，與員工回應無關',
  ],['原文由節省時間推到職場期望改變。','忽略新期望。','未分析變化。','脫離場景。'],[6,7],'原文說科技不只省時，還使人須快回應、學工具及跨部門合作。'),
  transfer('一間餐廳把所有排班交給軟件。系統建議有衝突時，經理已不懂自行調整。','哪項最能套用範文的人員技能風險？',[
    '若長期讓軟件代決，經理可能失去獨立排班能力',
    '排班軟件一旦存在，經理必然不再需要任何判斷',
    '只要軟件能排班，員工便完全不必了解自己的班次',
    '系統與排班衝突無關，問題只在餐廳的裝修設計',
  ],['原文說機器代決太多會削弱人的實用技能和獨立解難。','過於絕對。','員工仍須理解安排。','裝修非原因。'],[10,11],'原文以軟件接管計算組織溝通，說明員工獨立解難信心可能下降。'),
  transfer('一家銀行的資料庫突然中斷，櫃員無法查核客戶資料，也難以安全完成交易。','哪項最貼近範文的系統風險？',[
    '數碼記錄無法存取時，銀行服務可能停下或變得不安全',
    '資料庫故障後，銀行服務必定比平常更快而且更安全',
    '只要櫃員懂得打字，便完全不必查核任何客戶資料',
    '資料庫中斷與交易無關，所以毋須任何替代流程',
  ],['原文以銀行等機構說明記錄不可用時的服務困難。','與風險方向相反。','查核仍必要。','忽略停工機制。'],[12,13],'原文列銀行無法存取數碼記錄，可能難安全及有效地服務客戶。'),
  transfer('醫院只用一個線上系統處理所有紀錄，管理層不再保留任何應急流程。','哪項最能套用「斷橋」比喻？',[
    '若唯一系統故障，病房與櫃台的多項工作都可能停頓',
    '只要系統唯一，故障時病房工作必然完全不受影響',
    '醫院既有線上紀錄，便不必考慮病人安全或連續服務',
    '唯一系統等於永遠可靠，保留備案只會帶來裝修問題',
  ],['唯一道路上的一座斷橋可阻斷整體旅程，即單點故障。','與比喻相反。','忽略關鍵服務。','可靠性不能如此推定。'],[12,13,14],'原文以唯一道路與斷橋，比喻系統故障使整體工作受阻。'),
  transfer('市議會準備用軟件自動分配社福資源，並考慮取消所有人員覆核。','哪項最符合範文的結尾原則？',[
    '讓軟件協助整理資料，但重要分配仍要有人員判斷',
    '讓軟件作所有分配，不設任何人員覆核或申訴方法',
    '因為需要人員判斷，所以全面拒絕每一種數碼工具',
    '只要分配速度提升，就不必考慮受助者實際需要',
  ],['科技是強大工具，但不應取代人的判斷。','把工具變成替代品。','原文未要求停用工具。','速度非唯一準則。'],[2,17],'原文最後明確說科技應是工具，而非人的判斷替代品。'),
  transfer('物流公司讓不同城市的員工即時更新貨件狀態，也要求團隊更快回應客戶。','哪項最完整地運用範文的工作轉變？',[
    '工作由定點慢流程變成跨地點協作，員工也須快回應',
    '工作仍必須只在同一房間進行，回應速度也不會改變',
    '即時更新貨件等於完全沒有跨部門協作或新工作要求',
    '只要資料可即時更新，任何職員便不必理解貨運安排',
  ],['原文連結工具效率、異地協作及新的員工期望。','與場景矛盾。','忽略期望。','科技不取代理解。'],[5,6,7,8],'原文把新工具推到快回應、跨地點與跨時區協作。'),
  transfer('設計公司發現雲端工具改善合作，卻也擔心網絡中斷和員工不再練習基本設計判斷。','哪項論證能同時回應兩類依賴風險？',[
    '保留員工判斷訓練和離線流程，以應對失技能與停工',
    '只增加網絡速度，便可保證員工判斷能力永遠不變',
    '只教設計判斷，便可保證公司的資料庫永遠不會故障',
    '只用更多自動工具，毋須分析人員技能或網絡可靠性',
  ],['原文分開人員能力與組織故障，措施也須覆蓋兩者。','未處理能力。','未處理故障。','加深依賴。'],[2,10,11,12,16],'原文把人失技能與機構易受故障影響列為兩項不同缺點。'),
  transfer('公司草擬科技政策，只有「所有部門盡快數碼化」一句，沒有提使用原則。','哪項補充最能承接範文的完整立場？',[
    '利用工具提高效率，也保留人的判斷和系統故障備案',
    '只求完成數碼化，不必保留員工技能或處理故障',
    '因為有故障風險，所以禁止部門使用任何新工具',
    '只把工作搬到線上，不問速度、協作或安全的變化',
  ],['範文同時承認科技效率和過度依賴的風險。','忽略兩項風險。','忽略科技好處。','未評估結果。'],[1,2,15,16,17],'範文結論一面重述工作變快與互聯，一面要求科技不取代人的判斷。'),
];
export default {key:'direct-question:40',meta:{topic:'現代科技如何改變工作及過度依賴的缺點',summary:'科技加快任務並擴大異地協作，但過度依賴可削弱人的技能，且使機構易受系統故障影響。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
