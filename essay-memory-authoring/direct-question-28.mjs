// Human-authored support for Direct Question 28; exact source remains in its canonical lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-28-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:28'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Today, governments often try to affect how people eat, travel, work and use their free time.',
  'Governments should give information and protect people from direct harm, but each person should choose how to live.',
  'I will explain why personal freedom and what works in real life make people’s own decisions a better choice.',
  'The biggest reason is that the way people live is closely linked to freedom, who they are and how they feel about themselves.',
  'People differ a lot in what they believe, their health, money, family duties and traditions, so one government rule will not suit everyone.',
  'If the government controls how people live, ordinary likes can soon be called problems, and adults may be treated as people who only follow orders rather than make responsible choices.',
  'For example, food that is good for a young sports player may not be good for an older person with diabetes, while a work plan that helps one family may hurt another.',
  'When people decide how to live, they can change general advice to fit their own needs instead of following the same rule for everyone.',
  'Another important point is that choosing for yourself usually works better than being controlled by officials.',
  'Healthy habits rarely last when someone forces people to follow them; they are more likely to last when people understand why and choose them.',
  'A government may ban some habits or tell people what to do every day, but this pressure can make people angry, make them obey only on the surface or make them refuse.',
  'Instead, clear food labels, lessons about health, safe parks and sports places people can afford help them choose better without taking control away.',
  'So the government should show people a good way forward, not force them along it.',
  'To sum up, people should choose for themselves how to live.',
  'Governments should tell people what they need to know, warn them and help them, but each person must make the final choice about how to live.',
];
const vocabulary=[
  [['In modern societies','Today','現代社會'],['influence','affect','影響'],['citizens','people','公民'],['spend their leisure time','use their free time','度過休閒時間']],
  [['public authorities','Governments','公共當局'],['legitimate duty','should','正當責任'],['provide information','give information','提供資訊'],['protect citizens from direct harm','protect people from direct harm','保護免受直接傷害'],['lifestyle choices','choose how to live','生活方式選擇'],['individuals themselves','each person','個人自己']],
  [['This essay will argue','I will explain','本文將論證'],['personal autonomy','personal freedom','個人自主'],['practical effectiveness','what works in real life','實際有效性'],['individual decision-making','people’s own decisions','個人決策'],['better approach','better choice','更好做法']],
  [['strongest reason','biggest reason','最有力原因'],['lifestyle','the way people live','生活方式'],['personal freedom','freedom','個人自由'],['identity','who they are','身份認同'],['dignity','how they feel about themselves','尊嚴']],
  [['differ widely','differ a lot','差異很大'],['values','what they believe','價值觀'],['incomes','money','收入'],['cultural habits','traditions','文化習慣'],['single government standard','one government rule','單一政府標準'],['unlikely to suit everyone','will not suit everyone','難適合所有人']],
  [['the state','the government','國家'],['ordinary preferences','ordinary likes','普通偏好'],['treated as social problems','called problems','被視為社會問題'],['passive subjects','people who only follow orders','被動服從者'],['responsible human beings','make responsible choices','負責任的人']],
  [['diet that is sensible','food that is good','合理飲食'],['young athlete','young sports player','年輕運動員'],['elderly diabetic','older person with diabetes','年長糖尿病患者'],['work routine','work plan','工作安排'],['suits one family','helps one family','適合一個家庭'],['damage another','hurt another','傷害另一個家庭']],
  [['lifestyle decisions are made by individuals','people decide how to live','個人決定生活方式'],['adapt general advice','change general advice','調整一般建議'],['their own circumstances','their own needs','自身情況'],['one-size-fits-all system','same rule for everyone','一刀切制度']],
  [['personal choice','choosing for yourself','個人選擇'],['more effective','works better','更有效'],['official control','being controlled by officials','官方控制']],
  [['Healthy behaviour','Healthy habits','健康行為'],['imposed from above','someone forces people to follow them','由上而下強加'],['sustainable','more likely to last','可持續'],['understand the reason for it','understand why','理解原因'],['choose it for themselves','choose them','自行選擇']],
  [['ban certain habits','ban some habits','禁止某些習慣'],['dictate certain routines','tell people what to do every day','規定日常安排'],['resentment','make people angry','怨氣'],['superficial compliance','obey only on the surface','表面服從'],['resistance','make them refuse','反抗']],
  [['By contrast','Instead','相比之下'],['clear food labels','clear food labels','清楚食物標籤'],['public health education','lessons about health','公共健康教育'],['affordable sports facilities','sports places people can afford','可負擔運動設施'],['make wiser choices','choose better','作更明智選擇'],['without taking ownership away from them','without taking control away','不剝奪主導權']],
  [['In this sense','So','從這意義'],['the state','the government','國家'],['light the path','show people a good way forward','照亮道路'],['not drag citizens along it','not force them along it','不強迫公民前行']],
  [['In conclusion','To sum up','總結'],['make their own lifestyle decisions','choose for themselves how to live','自行決定生活方式']],
  [['inform','tell people what they need to know','提供資訊'],['warn','warn them','提醒'],['support','help them','支援'],['final choice about how to live','final choice about how to live','生活方式最終選擇'],['remain with the individual','each person must make','交給個人']],
];
const chunkOverrides=[
  ['In modern societies, governments often try to influence','how citizens eat, travel, work','and spend their leisure time.'],
  ['While public authorities have a legitimate duty','to provide information and protect citizens from direct harm,','lifestyle choices should ultimately be made','by individuals themselves.'],
  ['This essay will argue that personal autonomy','and practical effectiveness make individual decision-making','the better approach.'],
  ['The strongest reason is that lifestyle','is closely tied to personal freedom, identity and dignity.'],
  ['People differ widely in their values, health conditions,','incomes, family duties and cultural habits,','so a single government standard is unlikely to suit everyone.'],
  ['If the state decides how citizens should live,','ordinary preferences can quickly be treated as social problems,','and adults may be reduced to passive subjects','rather than responsible human beings.'],
  ['For example, a diet that is sensible','for a young athlete may be unsuitable','for an elderly diabetic,','while a work routine that suits one family','may damage another.'],
  ['When lifestyle decisions are made by individuals,','people can adapt general advice to their own circumstances','instead of being trapped in a one-size-fits-all system.'],
  ['Another important point is that personal choice','is usually more effective than official control.'],
  ['Healthy behaviour rarely lasts when it is imposed from above;','it becomes sustainable when people understand the reason for it','and choose it for themselves.'],
  ['A government may ban certain habits','or dictate certain routines,','but such pressure can create resentment,','superficial compliance and even resistance.'],
  ['By contrast, policies such as clear food labels,','public health education, safe parks and affordable sports facilities','help people make wiser choices','without taking ownership away from them.'],
  ['In this sense, the state should light the path,','not drag citizens along it.'],
  ['In conclusion, people should make','their own lifestyle decisions.'],
  ['Governments should inform, warn and support,','but the final choice about how to live','must remain with the individual.'],
];
const simpleChunkOverrides=[
  ['Today, governments often try to affect','how people eat, travel, work','and use their free time.'],
  ['Governments should give information','and protect people from direct harm,','but each person should choose how to live.'],
  ['I will explain why personal freedom','and what works in real life','make people’s own decisions a better choice.'],
  ['The biggest reason is that the way people live','is closely linked to freedom, who they are','and how they feel about themselves.'],
  ['People differ a lot in what they believe,','their health, money, family duties and traditions,','so one government rule will not suit everyone.'],
  ['If the government controls how people live,','ordinary likes can soon be called problems,','and adults may be treated as people who only follow orders','rather than make responsible choices.'],
  ['For example, food that is good','for a young sports player may not be good','for an older person with diabetes,','while a work plan that helps one family','may hurt another.'],
  ['When people decide how to live,','they can change general advice to fit their own needs','instead of following the same rule for everyone.'],
  ['Another important point is that choosing for yourself','usually works better than being controlled by officials.'],
  ['Healthy habits rarely last','when someone forces people to follow them;','they are more likely to last','when people understand why and choose them.'],
  ['A government may ban some habits','or tell people what to do every day,','but this pressure can make people angry,','make them obey only on the surface','or make them refuse.'],
  ['Instead, clear food labels, lessons about health,','safe parks and sports places people can afford','help them choose better without taking control away.'],
  ['So the government should show people a good way forward,','not force them along it.'],
  ['To sum up, people should choose for themselves','how to live.'],
  ['Governments should tell people what they need to know,','warn them and help them,','but each person must make the final choice','about how to live.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('In modern societies, councils often try to influence how people eat, travel, work and use parks.','用 governments often try to influence 開場列出政府觸及的日常選擇',[1,2,11],
    fixed(0,'In modern societies, [政府] often try to influence how [公民] eat, travel, work and [度過休閒時間].','說明政府已介入哪些生活領域，讓責任問題有具體範圍。','題目問政府應否決定生活方式，先界定現有影響領域時。',['In modern societies, ', ' often try to influence how ', ' eat, travel, work and '],['試圖影響選擇的政府','受影響的公民','餘下的休閒行為'])),
  card('While schools have a legitimate duty to explain healthy food and prevent direct harm, lunch choices should ultimately be made by families.','用 While ... , ... should ... 讓步承認保護責任再表明個人決定',[0,2,14],
    fixed(1,'While [公共當局] have a legitimate duty to [提供資訊及防止直接傷害], [生活方式選擇] should ultimately be made by [個人].','明確保留政府的資訊和安全角色，最終選擇仍歸個人。','題目要求政府或個人決定，需精確劃出政府可做與不可代選之界線時。',['While ', ' have a legitimate duty to ', ', ', ' should ultimately be made by '],['有公共責任者','可正當提供的服務','最終需決定的選擇','應作決定的人'])),
  card('This essay will argue that freedom and real-world results make voluntary choices the better approach.','用 This essay will argue that 預告自由與成效兩個判斷標準',[1,3,8],
    fixed(2,'This essay will argue that [個人自主] and [實際成效] make [個人決策] the better approach.','引言預告兩段主體分別論證自主權及自願選擇的有效性。','已給個人決定的立場，接着要說用哪些標準判斷時。',['This essay will argue that ', ' and ', ' make ', ' the better approach.'],['第一項判斷原則','第二項判斷原則','較佳的決策方式'])),
  card('The strongest reason is that how adults eat is closely tied to personal freedom and identity.','用 The strongest reason is that 把生活選擇連到自由、身份與尊嚴',[2,4,8],
    fixed(3,'The strongest reason is that [生活方式] is closely tied to [自由、身份與尊嚴].','第一主體段先提出為何私人生活領域值得由個人掌控。','開始支持個人決定的立場，先說生活方式與人格價值的關係時。',['The strongest reason is that ', ' is closely tied to '],['受討論的生活方式','相關的個人價值'])),
  card('People differ widely in health, income and family needs, so one school food rule is unlikely to suit everyone.','用 People differ ... so ... 指出單一標準難照顧差異',[3,5,6],
    fixed(4,'People differ widely in [價值、健康、收入、家庭和文化], so [單一政府標準] is unlikely to suit [所有人].','自由論點的實際根據是人與人情況差異太大，統一規則容易失準。','已說生活方式與個人有關，須解釋為何不能一套規則套用所有人時。',['People differ widely in ', ', so ', ' is unlikely to suit '],['使選擇不同的條件','難以適配的單一標準','需要被照顧的不同個體'])),
  card('If officials decide how every resident eats, normal preferences can quickly be treated as problems, and adults may be reduced to passive followers rather than responsible decision-makers.','用 If ... preferences ... and adults ... 說明政府替人決定的雙重風險',[4,6,7],
    fixed(5,'If [國家決定公民怎樣生活], [普通偏好] can quickly be treated as [社會問題], and [成年人] may be reduced to [被動對象] rather than [負責任的人].','指出過度控制既會把普通差異問題化，也會削弱成人的自主責任。','已說單一標準難適配，要說明國家代替成人選擇可能帶來甚麼時。',['If ', ', ', ' can quickly be treated as ', ', and ', ' may be reduced to ', ' rather than '],['過度控制的條件','本屬個人的偏好','被錯誤貼上的標籤','被控制的成年人','被動化的角色','應被承認的成人責任'])),
  card('For example, a meal that helps one runner may be unsuitable for a patient, while a shift pattern that helps one family may damage another.','用 A may ... while B may ... 比較不同人的需求',[4,5,7],
    fixed(6,'For example, [適合運動員的飲食] may be unsuitable for [年長糖尿病患者], while [適合某家的工時] may damage [另一家].','用飲食和工作兩個例子展示同一安排不會對所有人同樣合適。','抽象差異已說明，要以相反個案檢驗單一規則時。',['For example, ', ' may be unsuitable for ', ', while ', ' may damage '],['對第一人合理的安排','對其不合適的另一人','適合第一家的工作安排','因此可能受損的另一家'])),
  card('When individuals make their own food choices, people can adapt general advice to their health instead of being trapped in one fixed rule.','用 When ... adapt ... instead of 說明個人如何運用一般建議',[4,6,8],
    fixed(7,'When [個人決定生活方式], people can adapt [一般建議] to [自己的情況] instead of being trapped in [一刀切制度].','不是拒絕公共建議，而是讓個人按健康和家庭需要調整它。','例子已證明需求不同，須說明個人如何使用而非照單全收建議時。',['When ', ', people can adapt ', ' to ', ' instead of being trapped in '],['個人作決定的情況','可供參考的建議','應配合的個別條件','需避免的單一規則'])),
  card('Another important point is that voluntary exercise is usually more effective than imposed routines.','用 Another important point is that 轉入成效比較',[3,7,9],
    fixed(8,'Another important point is that [個人選擇] is usually more effective than [官方控制].','第二主體段由自主原則轉到哪種方法能令健康行為真正持續。','自由論點已完成，需要提出另一個不同的判斷標準時。',['Another important point is that ', ' is usually more effective than '],['較有效的做法','被比較的官方控制'])),
  card('Healthy eating rarely lasts when it is forced; it becomes sustainable when people understand why and choose it.','用 rarely lasts when ...; becomes sustainable when 對比強制與理解後自選',[8,10,11],
    fixed(9,'[健康行為] rarely lasts when [由上而下強加]; it becomes sustainable when [人理解原因] and [自行選擇].','說明效果差異的機制：被迫做難持續，理解並自願做較能維持。','已主張個人選擇較有效，須解釋成效何以不同時。',[' rarely lasts when ', '; it becomes sustainable when ', ' and '],['健康行為','強加方式','理解原因','自行選擇'])),
  card('A government may ban snacks or dictate meal times, but such pressure can create resentment and surface-level obedience.','用 may ban ... but pressure can create ... 交代強制管制的反效果',[8,9,11],
    fixed(10,'A government may [禁止習慣] or [規定日常], but such pressure can create [怨氣、表面服從甚至反抗].','把前句抽象的強制效果具體化為情緒、表面配合與抵抗。','已說強加行為難持續，要列出壓力可能產生的反作用時。',['A government may ', ' or ', ', but such pressure can create '],['第一種限制','第二種限制','由壓力引發的反效果'])),
  card('By contrast, policies such as clear labels and affordable parks help people make wiser choices without taking control away from them.','用 By contrast ... help ... without ... 列出不奪選擇權的公共支援',[9,10,12],
    fixed(11,'By contrast, [食品標籤、教育、公園和運動設施] help [人們] make wiser choices without [剝奪主導權].','提出政府的替代做法：改善資訊與環境，讓個人作更好決定。','已指出禁令可有反效果，要給出政府能做的具體支援時。',['By contrast, policies such as ', ' help ', ' make wiser choices without '],['協助選擇的公共政策','受支援的人','不應被奪走的主導權'])),
  card('In this sense, the council should light the path, not drag residents along it.','用 light the path, not drag ... 比喻政府引導而非強制',[9,11,14],
    fixed(12,'In this sense, [國家] should light the path, not drag [公民] along it.','以道路比喻收束：提供方向和條件，但不強行替人走路。','已列標籤、教育與公園，需概括政府理想角色時。',['In this sense, ', ' should light the path, not drag ', ' along it.'],['提供方向的政府','仍須自己作選擇的人'])),
  card('In conclusion, adults should make their own daily choices.','用 In conclusion 重申個人負最終生活決定權',[1,8,14],
    fixed(13,'In conclusion, [人們] should make [自己的生活方式決定].','結論先直接回答題目：最終應由人們決定怎樣生活。','理由已說完，需清楚重申責任歸誰時。',['In conclusion, ', ' should make '],['應作決定的人','須自行決定的生活事項'])),
  card('Governments should inform, warn and support, but the final choice about diet must remain with each adult.','用 should inform ... but final choice ... 分配政府與個人的不同工作',[1,11,13],
    fixed(14,'Governments should [提供資訊、提醒和支援], but [如何生活的最終選擇] must remain with [個人].','最後分工清楚：政府改善資訊與安全，個人保有決定權。','結論須避免把政府作用說成零，同時保留個人自主時。',['Governments should ', ', but ', ' must remain with '],['政府應提供的幫助','不能轉交政府的最終選擇','握有決定權者'])),
];
const wrongReasons=[
  ['政府資訊與安全角色是立場，沒有先列政府影響的生活領域。','自主與成效是論證路線，沒有吃、行、工作與休閒背景。','食品標籤等是方案例子，沒有開場的政府介入現況。'],
  ['政府影響生活是背景，沒有 While 的角色界線和最終決定者。','引言論證路線只預告標準，沒有明確區分公共安全與私人選擇。','結論再次分工，但沒有 While 先讓步承認公共當局職責。'],
  ['立場說個人選擇，沒有預告自主與實際成效兩條論證。','自由與尊嚴只是第一個理由，沒有第二個成效標準。','個人選擇較有效是第二理由，沒有引言的兩段路線。'],
  ['論證路線提自主但沒有解釋生活方式與身份尊嚴的關係。','個別差異是後續支撐，沒有先定出自由理由。','成效比較是第二理由，沒有此段的人格價值焦點。'],
  ['自由與尊嚴只是原則，沒有 so 單一標準難適用的原因。','國家代決定的風險是後果，沒有先列個人差異。','運動員與病患是具體例子，沒有廣泛的條件清單。'],
  ['人的差異是原因，沒有 If 政府代決定後偏好被問題化的風險。','飲食工作例子顯示不適配，沒有成人被動化的權利後果。','個人調整建議是正面做法，沒有過度控制的消極結果。'],
  ['差異總述沒有運動員與病患、兩個家庭的對照例子。','過度控制風險沒有對比同一飲食或工時對不同人效果。','按情況調整建議是推論，沒有原句兩組相反個案。'],
  ['人的差異是事實，沒有說個人如何調整一般建議。','飲食例子證明不通用，沒有 instead of 一刀切的替代做法。','成效比較是新段主張，沒有個人與公共建議的配合。'],
  ['自由與身份是原則理由，沒有轉入哪種行為改變更持久。','按自身情況調整是上一段結論，沒有 official control 的成效比較。','強制與自選的持續性是後續機制，沒有先提出第二理由。'],
  ['成效主張只比較兩法，沒有 when 描述為何能維持。','禁令引起怨氣是強制反效果，沒有理解後自行選擇的對照。','食品標籤是公共支援，沒有強制與自願的習慣持續機制。'],
  ['成效主張未列禁令如何帶來怨氣和表面服從。','持續性機制只說理解與自選，沒有壓力造成的三種反效果。','標籤公園是較佳替代，沒有列政府禁令的負面結果。'],
  ['行為持續性論證是原理，沒有具體標籤、教育、公園與設施。','禁令反效果是需要替代的問題，沒有支援選擇的政策清單。','照亮道路是後面比喻，沒有列可執行公共支援。'],
  ['強制與自選的機制沒有 light the path 的政府角色比喻。','政策清單是具體做法，沒有一句話概括引導與拖行的區別。','最後角色分配是結論，沒有道路比喻收束主體段。'],
  ['引言讓步立場不是結論的直接重申。','成效比較是支持理由，沒有簡明回答誰作生活決定。','政府分工是結論第二句，沒有先重申個人決定權。'],
  ['引言 While 交代責任界線，但沒有結論三種政府行動的總結。','公共政策例子說可提供甚麼，沒有保留最終選擇的結尾分工。','結論首句只說個人決定，沒有補上政府應提供資訊提醒和支援。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要比較誰應作甚麼決定？',[
    '政府還是個人，誰應決定人們自己的生活方式',
    '政府應興建多少公園，以及哪種食物最便宜',
    '只談哪種飲食健康，不考慮決定權應歸誰',
    '只列政府現有政策，不判斷是否應代人選擇',
  ],'焦點是最終生活選擇權，而非政府能否提供資訊。'),
  {type:'multi',prompt:'選出範文支持個人決定的兩項根據',detail:'選兩項，再按「確認」。',options:[
    '人們健康、收入和文化情況不同，單一規則難適用所有人',
    '人理解原因後自願選擇，健康行為通常更能持續',
    '每個人需要完全一樣的飲食和工作安排',
    '政府只需施加壓力，表面服從便等於持久改變',
  ],correct:[0,1],why:'第一段談自主與差異；第二段談自願選擇的成效。'},
];
const route=[sequence('依照範文次序排列四段任務',[
  ['引言劃出責任','政府可提供資訊並防止直接傷害，生活選擇最終歸個人。'],
  ['自主與差異','人們情況各異，統一規則難適合所有人，也可能使成人被動化。'],
  ['成效與支援','強制易引起表面服從；標籤、教育、公園等讓自願選擇更可行。'],
  ['結論分工','政府提供資訊、提醒和支援，個人保留最終生活決定權。'],
],'由責任界線出發，依次檢驗自主、實際成效，再重申分工。')];
const evidence=[
  quiz('作者容許政府在生活方式上做甚麼？',[
    '提供資訊並防止直接傷害，卻不替成人作最終日常選擇',
    '決定每名公民的所有飲食、出行和休閒細節',
    '完全不提供健康資訊，也不處理任何直接傷害',
    '只規定每人的工作時間，不理會家庭和健康差異',
  ],'While 句保留公共當局正當職責，同時劃定最終決定權。'),
  quiz('為何單一政府生活標準難適合每個人？',[
    '人的價值觀、健康、收入、家庭責任及文化習慣各不相同',
    '每人健康與收入完全一樣，只有住址稍有不同',
    '文化與家庭責任從不影響飲食或工作選擇',
    '只要有一套規則，個別需要便會全部消失',
  ],'作者列多個真實差異，推論一刀切規則可能失準。'),
  quiz('運動員與年長糖尿病患者的例子證明甚麼？',[
    '對一人合理的飲食，未必適合另一人的健康情況',
    '所有人應採用運動員飲食，毋須考慮健康差異',
    '飲食只由年齡決定，其他疾病完全沒有作用',
    '政府完全不能提供任何一般性的飲食建議',
  ],'例子支持個人按情況調整建議，而非否定建議本身。'),
  quiz('政府替成人決定生活方式可能有哪種風險？',[
    '普通偏好被當社會問題，成年人被視為被動服從者',
    '成人更能按自身條件調整一切一般性建議',
    '所有習慣都立即變得健康，且完全沒有反抗',
    '每個家庭的工作安排自然變得完全相同',
  ],'作者擔心普通差異被問題化，並削弱成人責任。'),
  quiz('作者認為健康行為何時較容易持續？',[
    '人理解原因並自行選擇，而非只受由上而下的強迫',
    '人完全不懂原因，只因害怕處罰而表面照做',
    '政府規定每個人同一作息，無須給任何解釋',
    '每人只做一天，日後不再需要自行決定',
  ],'可持續取決於理解和自願，而不只是短暫服從。'),
  quiz('強制禁令可能造成哪幾種反效果？',[
    '怨氣、表面服從，甚至主動反抗',
    '所有人都自發理解原因並長期堅持',
    '政府立即失去提供資訊的所有能力',
    '一律令每個人的健康需要完全相同',
  ],'這些反效果說明官方控制未必帶來持久行為改變。'),
  quiz('哪組政策符合「照亮道路，不拖著人走」？',[
    '清晰食品標籤、健康教育、安全公園和可負擔運動設施',
    '規定每人每天吃同樣餐單、走同一條路線',
    '只公布禁令，不給資訊或可使用的運動空間',
    '剝奪個人選擇，卻要求每人自稱自願參與',
  ],'公共政策應改善資訊和選擇條件，保留個人主導權。'),
];
const logic=[
  sequence('自主論證：從人有差異到個人調整建議',[
    ['生活方式關乎人格','飲食、工時等決定連到自由、身份與尊嚴。'],
    ['人與人條件不同','健康、收入、家庭及文化差異令單一標準難適合全部人。'],
    ['過度控制有風險','普通偏好可能被問題化，成人成為被動對象。'],
    ['相反個案','運動員與糖尿病患者、不同家庭的適合安排各異。'],
    ['個人調整','人可依自身情況使用一般建議，而非被一刀切規則困住。'],
  ],'例子不是反對公共建議，而是支持按個別情況使用建議。'),
  sequence('成效論證：由強制反效果到公共支援',[
    ['第二理由','個人選擇通常比官方控制更有效。'],
    ['持續的條件','理解原因並自願實行，健康行為較可能持久。'],
    ['強制的反作用','禁令和規定可引起怨氣、表面服從及抵抗。'],
    ['可行公共支援','標籤、教育、公園與運動設施改善可用選擇。'],
    ['角色比喻','政府照亮路，個人仍自己走。'],
  ],'作者用實際成效解釋為何政府應支援選擇而非代替選擇。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('學校想改善學生午餐，學生有糖尿病、過敏和運動訓練等不同需要。','哪項最符合範文對個別差異的原則？',[
    '提供營養資料和選項，容許學生按健康需要作選擇',
    '規定每名學生吃同一份餐單，完全不用看健康狀況',
    '只看運動員的飲食需要，忽略過敏與糖尿病學生',
    '取消所有食物資訊，要求學生完全靠猜測選餐',
  ],[
    '範文以運動員與糖尿病患者證明同一飲食未必適用所有人。',
    '這忽略題目列明的差異。',
    '範文正以兩類人對照。',
    '資訊是政府可提供的正當支援。',
  ],[4,6,7,11],'範文說人可按自身情況調整一般建議，公共資訊仍有價值。'),
  transfer('公司規定所有員工同一工時，但部分員工須照顧家人或接受治療。','哪項最能轉用範文對單一標準的批評？',[
    '按健康與家庭責任提供可選安排，比單一工時更合適',
    '只要管理方便，就可忽略員工治療和照顧責任',
    '所有員工必定有相同家庭需要，無須提供選項',
    '只讓其中一種家庭安排可行，其餘一概算作問題',
  ],[
    '範文把健康與家庭責任列為單一政府標準難適配的原因。',
    '管理方便不能抹去個人情況。',
    '題目已說員工條件不同。',
    '這把普通差異錯當問題。',
  ],[4,5,6,7],'範文以不同家庭的工時安排說明一套規則可能傷害另一家。'),
  transfer('居民想多運動，市政府只罰不跑步的人，卻沒有安全公園。','哪項最符合範文的政策成效觀？',[
    '建立安全公園並提供健康資訊，讓居民自行運動',
    '持續加罰，不需提供任何安全或可用的運動地方',
    '只看當天罰款收入，不問居民能否長期運動',
    '規定每人必須同一時段跑步，不理工作或健康',
  ],[
    '範文認為健康行為要理解並自選，公園可改善實行條件。',
    '沒有可用地方難達成目標。',
    '作者關心可持續行為，而非短暫服從。',
    '這再次忽略人與人差異。',
  ],[9,10,11,12],'範文以安全公園和可負擔設施作鼓勵選擇的政策例子。'),
  transfer('公共健康部門要提醒市民吸煙有直接風險，卻有人說政府不應提供任何資訊。','哪項最符合範文的責任界線？',[
    '政府可提供警告和資訊，最終日常選擇仍由個人作出',
    '政府有提供資訊的責任，因此應決定每人所有習慣',
    '個人有選擇權，所以政府不能提醒任何直接風險',
    '只要有人反對提醒，所有公共健康教育都要停止',
  ],[
    '範文同時承認提供資訊、防直接傷害和個人最終決定。',
    '提供資訊不等於代替所有選擇。',
    '這刪去原文承認的政府職責。',
    '個別反對不等於資訊無價值。',
  ],[1,11,14],'範文的 While 句明確保留政府資訊與保護角色。'),
  transfer('一所學校強迫每名學生參與同一課外活動，學生只在老師面前表面配合。','哪項最能轉用範文的強制反效果？',[
    '表面配合未必持久；解釋價值並提供選項較可行',
    '只要學生當場點頭，就證明他們已長期認同活動',
    '增加懲罰便能保證每人都真正喜歡同一活動',
    '既然有人表面配合，就不用了解他們不滿原因',
  ],[
    '範文說強加習慣可造成 superficial compliance 和怨氣。',
    '當場點頭不能證明持續性。',
    '強制可能增加而非消除反感。',
    '了解原因有助自願選擇。',
  ],[9,10],'範文對比由上強加與理解後自選的持續性。'),
  transfer('新食品標籤清楚列出糖分，但商店不限制顧客必須買哪種食物。','哪項最能解釋這種做法？',[
    '提供可用資訊，使人按自身需要選購而保留主導權',
    '不規定顧客購物，就等於標籤完全沒有任何作用',
    '所有顧客應吃同一食物，不必留意健康差異',
    '標籤的作用是取代顧客自己的最終選擇權',
  ],[
    '範文明列食品標籤幫人明智選擇而不奪主導權。',
    '資訊能改善自願決策。',
    '這重回一刀切的問題。',
    '標籤是支援，不是代選。',
  ],[7,11,14],'範文說 clear food labels 可幫人作更好選擇而不剝奪自主。'),
  transfer('社區中心認為只有對居民下命令才能改善健康，想取消講座與運動設施。','哪項最符合範文的另一條路？',[
    '保留健康講座與設施，協助居民自己決定並持續實行',
    '只下命令，不提供任何解釋或可負擔的運動地方',
    '只觀察居民是否短暫服從，不問其後能否維持',
    '把所有居民的不同習慣一概稱為嚴重社會問題',
  ],[
    '範文列公共教育與可負擔設施，支持理解後自願行動。',
    '這可能帶來表面服從。',
    '持續性是作者的成效標準。',
    '普通差異不應自動問題化。',
  ],[5,9,10,11],'範文將健康教育、運動設施與自願選擇放在同一政策鏈中。'),
  transfer('一座城市推出交通建議，有人希望政府指引，也有人要求保留自行選路。','哪項最能運用範文的道路比喻？',[
    '政府指出安全路線及原因，居民仍自己決定怎樣走',
    '政府只准居民走單一路線，毋須說明任何原因',
    '既然居民自己選路，政府便不用提供安全資訊',
    '只公布罰則，不改善實際道路安全或公共說明',
  ],[
    '範文的 light the path 指引導，not drag 指不強迫。',
    '這把比喻後半的強迫當政策。',
    '原文保留政府資訊職責。',
    '罰則不能取代安全支援。',
  ],[1,11,12,14],'範文用照亮道路而非拖人走，比喻政府支援與個人決定。'),
  transfer('一名成人因慢性疾病要調整一般飲食建議，官員卻說所有人必須照單全收。','哪項最符合範文的個人調整原則？',[
    '讓他參考建議並按自身健康情況調整，保留決定權',
    '只因建議適合別人，就認定他必然同樣適合',
    '完全禁止他取得營養資訊，讓選擇只靠猜測',
    '把疾病差異當作不服從，拒絕討論個別需要',
  ],[
    '範文允許一般建議，但強調按個別情況調整。',
    '例子正顯示同一飲食不一定合適。',
    '公共資訊仍是正當支援。',
    '健康差異不是普通叛逆。',
  ],[4,6,7],'範文說個人可依自身情況調整一般建議，避免一刀切。'),
  transfer('題目問生活方式由政府決定，還是由人們自行決定。','哪項結論最完整？',[
    '政府提供資訊與支援，個人保留生活方式的最終選擇',
    '只說政府可建公園，不說人們生活選擇最終歸誰',
    '只說個人完全自由，不提直接傷害或資訊支援',
    '只主張政府規定所有人的飲食、工作與休閒細節',
  ],[
    '範文結論重申個人決定，並清楚分配政府支援角色。',
    '題目要求決定權歸屬。',
    '這漏掉作者承認的政府職責。',
    '這與原文立場相反。',
  ],[1,13,14],'範文最後兩句說政府應 inform、warn、support，個人作最終選擇。'),
];
const revised=[
 {options:['提供營養資料和選項，容許學生按健康需要作選擇','以一般學生需要訂餐單，另讓有病者自行帶飯','為運動員增加餐量，其他學生沿用原有安排','先統一餐單減輕管理工作，再處理個別健康差異'],explanations:['資訊和選項讓不同健康狀況的學生作合適決定。','自行帶飯將學校的個別支援責任移給有病學生。','只照顧運動員，仍忽略過敏與糖尿病學生。','管理方便不能成為忽略已知健康差異的理由。']},
 {options:['按健康與家庭責任提供可選安排，比單一工時更合適','保留統一工時，只批准接受治療者偶爾請假休息','讓照顧家人者提早下班，但不調整每週總工時','以多給津貼代替彈性安排，維持原有出勤規則'],explanations:['可選安排能回應治療與家庭責任的不同需要。','偶爾請假未必能配合持續的照護與治療。','提前下班若沒有可持續安排，未必解決工時衝突。','津貼可能有用，但沒有改變題目中的時間衝突。']},
 {options:['建立安全公園並提供健康資訊，讓居民自行運動','增加未運動者的罰款，並讓居民自行尋找場地','只開健康講座，不改善居民可使用的運動空間','先規定每日跑步時數，再按居民反應考慮公園'],explanations:['設施與資訊改善實行條件，讓人自願持續運動。','罰款難使缺少安全場所的人建立長期習慣。','講座提供理解，但缺少可行的活動環境。','同一時數不能配合不同工作與健康情況。']},
 {options:['政府可提供警告和資訊，最終日常選擇仍由個人作出','政府提供風險資訊後，應替每位市民選定日常習慣','把風險資料交給醫生，公共部門不向市民解釋','只用罰則降低吸煙，避免討論市民如何理解風險'],explanations:['公共資訊與個人最終決定可以並存。','提供資訊不等於代替每個人作所有生活決定。','醫生可協助，但政府仍能直接提供公共警告。','罰則不能取代清楚的健康風險資訊。']},
 {options:['表面配合未必持久；解釋價值並提供選項較可行','增加點名次數，以學生出席率證明他們認同活動','保留強制活動，再讓學生填表表達喜好作紀錄','取消課外活動，由家長在校外自行安排所有項目'],explanations:['理解與選擇比只看表面服從更有助持續參與。','出席數據不能證明學生真正認同。','調查喜好有用，但若不影響安排，強制仍在。','取消活動沒有解決如何鼓勵自願參與。']},
 {options:['提供可用資訊，使人按自身需要選購而保留主導權','把標籤改成健康評分，由商店代顧客選每餐食物','只列糖分但不解釋份量，讓顧客自行推測影響','標示較健康食品，並取消顧客比較其他食品的機會'],explanations:['清楚標示可支援顧客按自身情況自主選擇。','評分可提供參考，卻不應代替最終決定。','缺少份量資料會削弱資訊的可用性。','標示選項不應取消顧客比較與決定的空間。']},
 {options:['保留健康講座與設施，協助居民自己決定並持續實行','維持講座但減少運動設施，主要靠命令推動改變','只建運動場，不再向居民解釋健康選擇的原因','先要求居民承諾服從，再評估設施是否真正可用'],explanations:['教育與可負擔設施支援理解後的自願行動。','移走實行條件會使講座和命令較難轉為習慣。','設施有用，但缺少資訊難幫人作知情選擇。','表面承諾不能代替可用設施與持續意願。']},
 {options:['政府指出安全路線及原因，居民仍自己決定怎樣走','政府公布路線後，要求居民照指定方法每天出行','居民自行選路，政府只處理事故後的道路維修','只標示最短路線，不向居民解釋道路安全差異'],explanations:['道路比喻指政府提供方向，而人保留選擇。','指定方法把指引變成替居民作決定。','選擇權與事前安全資訊可以並存。','距離資訊不足以讓人理解路線安全。']},
 {options:['讓他參考建議並按自身健康情況調整，保留決定權','讓他先照一般建議飲食，身體不適後再作調整','只請他向醫生諮詢，公共營養資料不用提供','為他設一份新餐單，之後不容他按病況修改'],explanations:['一般資訊可用作起點，慢性病仍需個別調整。','已知有疾病，不應等出現不適才承認差異。','專業意見有用，不代表公共資訊應停止提供。','個別餐單仍須留有因健康變化而調整的空間。']},
 {options:['政府提供資訊與支援，個人保留生活方式的最終選擇','政府訂健康目標後，個人只可選達標的具體方法','個人決定生活習慣，政府僅在患病後提供治療','政府提供風險警告後，交由企業決定市民習慣'],explanations:['結論把資訊支援與個人決定的角色分清。','目標若強制套用，也可能忽略個別差異。','政府還可事前提供資訊和可用設施。','企業不能代替個人作最終生活選擇。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:28',meta:{topic:'生活方式的個人選擇與政府角色',summary:'政府提供資訊和保護，人們按自身情況作決定；自願選擇較有助持續改變。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
