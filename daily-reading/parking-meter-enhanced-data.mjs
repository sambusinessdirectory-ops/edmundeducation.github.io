export const passage = [
  'The Transport Department said a software update triggered a citywide malfunction of Hong Kong’s parking meter system on Tuesday.',
  'The department said preliminary investigations found that a software update in the morning caused a back-end software fault, which prevented the system from making a normal connection with the parking meters.',
  'It added that about 11,000 parking meters were affected across the city.',
  'The department has instructed the operator to conduct a thorough investigation into the cause of the outage and submit a detailed report.',
  'There is no evidence that the system was attacked at the moment, the department said, adding it has reported the matter to the Digital Policy Office.',
  'The operator will arrange for full refunds for all meter transactions between 8am and 12.15pm to users, and will strive to complete the approval of the refunds within this week, it added.',
  'The Transport Department received a report at around 8.20am from the operator that the parking meter system had malfunctioned, with payment functions suspended or meter displays not operating normally.',
  'The system resumed normal operations at 12.15pm.'
];

export const translations = [
  '運輸署表示，星期二的一次軟件更新，導致香港全市停車收費錶系統出現故障。',
  '運輸署表示，初步調查發現，當天早上的軟件更新引致後端軟件故障，令系統無法與停車收費錶正常連線。',
  '運輸署補充，全港約有 11,000 個停車收費錶受影響。',
  '運輸署已指示營辦商徹底調查系統故障的原因，並提交詳細報告。',
  '運輸署表示，目前沒有證據顯示系統曾遭攻擊，並補充已就事件向數字政策辦公室通報。',
  '運輸署又表示，營辦商將安排向用戶全額退還上午 8 時至中午 12 時 15 分期間所有停車收費錶交易的款項，並會力爭於本星期內完成退款審批。',
  '運輸署於上午約 8 時 20 分接獲營辦商報告，指停車收費錶系統發生故障，付款功能暫停，或收費錶顯示屏未能正常運作。',
  '系統於中午 12 時 15 分恢復正常運作。'
];

export const glossary = [
  [1,'department','B1','政府部門；署','Transport Department 運輸署'],
  [1,'software','B1','軟件','software update 軟件更新'],
  [1,'update (n.)','B1','更新','不等於 upgrade 的所有義項'],
  [1,'triggered','B2','引發；觸發','trigger a malfunction 引發故障'],
  [1,'citywide','B2','全市範圍的','範圍詞，勿解作全國'],
  [1,'malfunction','C1','運作故障；失靈','名詞／動詞，指功能不正常'],
  [1,'parking meter','B1–B2','停車收費錶','本文主題詞'],
  [2,'preliminary','C1','初步的；暫定的','並非最終結果'],
  [2,'investigation','B2','調查','conduct an investigation'],
  [2,'back-end','C1（技術詞）','後端的','指系統後台，不是實體背面'],
  [2,'fault','B2','故障；缺陷','software fault 軟件故障'],
  [2,'prevented ... from','B2','阻止……做某事','後接 -ing'],
  [2,'connection','B1','連接；連線','make a connection with'],
  [3,'affected','B1–B2','受影響的','were affected 是被動語態'],
  [3,'about (approximation)','B1','大約','不是「關於」的義項'],
  [4,'instructed','B2','指示；命令','instruct somebody to do'],
  [4,'operator','B2','營辦商；營運者','與 department 權責不同'],
  [4,'conduct (an investigation)','B2','展開；進行（調查）','正式搭配'],
  [4,'thorough','C1','徹底的；全面細緻的','thorough investigation'],
  [4,'outage','C1','服務／系統中斷','不必表示停電'],
  [4,'submit','B2','提交','submit a detailed report'],
  [4,'detailed','B2','詳盡的','與 thorough 意思不同'],
  [5,'evidence','B2','證據','no evidence 不等於反證'],
  [5,'attacked','B1–B2','遭攻擊','原文未特指已確認的網絡攻擊'],
  [5,'at the moment','B1','目前；現階段','時間限定語'],
  [5,'reported the matter','B2','通報此事','report X to Y'],
  [6,'arrange for','B2','安排','arrange for refunds'],
  [6,'refund (n.)','B2','退款','full refund 全額退款'],
  [6,'transaction','B2','交易','meter transactions'],
  [6,'strive to','C1','力爭；努力做到','努力不等於保證'],
  [6,'approval','B2','審批；批准','不等於款項已發放'],
  [7,'received','B1','收到；接獲','received a report 接獲報告'],
  [7,'malfunctioned (v.)','C1','發生故障；失靈','動詞用法'],
  [7,'suspended','B2','暫停的；被暫停','不能直接譯「永久取消」'],
  [7,'display (n.)','B2','顯示屏','本文指收費錶的屏幕'],
  [7,'operating','B1–B2','運作中的','not operating normally'],
  [8,'resumed','B2','恢復；重新開始','resume operations 恢復運作']
];

const step = (id,title,paragraph,source,translation,form,role,pattern,example,note,highlight=source) => ({id,title,paragraph,source,translation,form,role,pattern,example,note,highlight});
export const curation = [
  step('S1','新聞消息歸屬：S + said (that) + clause',1,'The Transport Department said a software update triggered ...','運輸署表示，一次軟件更新引發了……','said 後接省略 that 的受詞子句；整句表示「運輸署如此表示」。','清楚標示資訊來自誰，不把消息來源的說法無條件改成作者自行證實的事實。','[Source] said (that) [claim/event].','The school said that the online registration system was unavailable.／學校表示網上報名系統無法使用。','said 是轉述，不代表外部已獨立核實；不要省略或擅自更換消息來源。','The Transport Department said'),
  step('S2','引發事件：X triggered Y',1,'a software update triggered a citywide malfunction','一次軟件更新引發全市系統故障','主語 X 是原因，triggered 是動詞，受詞 Y 是被引發的事件。','在導語用一句話交代因果方向。','[Event A] triggered [Event B].','A power failure triggered a temporary service interruption.／停電引發短暫服務中斷。','不要把 X 和 Y 倒轉；trigger 比一般 happen before 更強調因果。'),
  step('S3','初步調查與可信度：preliminary investigations + found that ...',2,'preliminary investigations found that ...','初步調查發現……','preliminary 修飾 investigations；found that 引出初步調查發現。','交代目前所知，並保留尚未最終確定的狀態。','Preliminary investigations found that + S + V ...','Preliminary checks found that a faulty cable had affected the display.／初步檢查發現有問題的電線影響顯示屏。','found that 不能抵消 preliminary 的限定；不可隨意改成 finally proved that。'),
  step('S4','關係子句＋阻礙結構：X, which prevented Y from V-ing',2,'a back-end software fault, which prevented the system from making a normal connection ...','後端軟件故障，令系統無法正常連線……','非限定關係子句 which ... 補充前面故障的後果；prevent + 受詞 + from + -ing 表示阻止某事發生。','一句串連「故障」與「無法連線」，避免拆成互不相連的事實。','[Problem], which prevented [person/system] from [V-ing].','A network fault occurred, which prevented students from submitting their work.／網絡故障令學生無法交功課。','from 後接 V-ing（不是 from submit）；which 的指涉必須清楚，不能錯指其他名詞。','a back-end software fault, which prevented the system from making a normal connection with the parking meters'),
  step('S5','代詞承接與約數：It added that about + number ...',3,'It added that about 11,000 parking meters were affected ...','運輸署補充，約有 11,000 個停車收費錶受影響……','It 指前文運輸署；added that 引出補充資訊；about 表示估算。','同一消息來源下補充影響規模，減少重複機構名稱。','[Organisation] said ... . It added that approximately/about [number] ... .','The library said the event was popular. It added that about 200 people attended.／圖書館表示活動受歡迎，並補充約有二百人參加。','It 要能明確回指同一機構；about 不是「剛好」。','It added that about 11,000 parking meters were affected'),
  step('S6','正式指示＋並列任務：has instructed + person + to V1 and (to) V2',4,'has instructed the operator to conduct ... and submit ...','已指示營辦商進行……並提交……','現在完成式 has instructed；instruct + 人 + to + 動詞原形；conduct 與 submit 受同一個 to 支配。','分清發出指示者與執行任務者，並把兩項指示組合在一句。','[Authority] has instructed [person] to [V1] and [V2].','The principal has instructed staff to inspect the computers and submit a report.／校長已指示職員檢查電腦並提交報告。','instructed 是已發出指示，不代表工作已完成；並列兩個動詞應有共同執行者。','has instructed the operator to conduct a thorough investigation into the cause of the outage and submit a detailed report'),
  step('S7','證據界線：There is no evidence that ... at the moment',5,'There is no evidence that the system was attacked at the moment ...','目前沒有證據顯示系統曾遭攻擊……','存在句 There is ...；no evidence that ... 表示尚無支持某說法的證據；at the moment 限定時間。','避免過度肯定，保留調查繼續發展的可能。','There is currently no evidence that + [claim].','There is currently no evidence that any files were deleted.／目前沒有證據顯示任何檔案被刪除。','No evidence of X ≠ proof that X is impossible。「未找到證據」不能改寫為「已證明絕無此事」。','There is no evidence that the system was attacked at the moment'),
  step('S8','通報對象：report + matter + to + office/person',5,'it has reported the matter to the Digital Policy Office.','已就事件向數字政策辦公室通報。','report X to Y＝向 Y 通報事項 X；has reported 表示通報已發生。','精準區分通報者和接收通報者。','[Organisation] has reported [issue] to [authority].','The school has reported the problem to the technical support team.／學校已向技術支援隊伍報告問題。','接收通報不等於已親自調查、發現原因或批准退款。','it has reported the matter to the Digital Policy Office'),
  step('S9','安排 vs 力爭：will arrange for ... / will strive to ...',6,'will arrange for full refunds ... and will strive to complete the approval ...','將安排全額退款……並會力爭完成審批……','will arrange for + 名詞表示將安排；strive to + 動詞原形表示力求完成；within this week 是目標時限。','把退款安排和退款審批目標分開，不宣稱錢已發放。','[Team] will arrange for [process] and will strive to [goal] by [time].','The club will arrange for replacements and will strive to process requests by Friday.／學會會安排更換，並力爭星期五前處理申請。','strive 不等於 guarantee；approval 不等於 payment received。','will arrange for full refunds for all meter transactions between 8am and 12.15pm to users, and will strive to complete the approval of the refunds within this week'),
  step('S10','報告時間與更早事件：received a report that ... had + past participle',7,'received a report ... that the parking meter system had malfunctioned','接獲報告，指停車收費錶系統已發生故障','received 指接報時間；had malfunctioned 是過去完成式，將故障置於接報之前或當時已發生的背景。','區分事件發生與收到報告兩個時間點。','[Office] received a report that [system] had [past participle].','The office received a report that the website had stopped working.／辦公室接獲報告，指網站早已停止運作。','過去完成式不提供確實故障起始時間；不能因 8.20am 是接報時間，便說故障正好在 8.20am 開始。','received a report at around 8.20am from the operator that the parking meter system had malfunctioned'),
  step('S11','with 補充狀態＋or：with + N + participial/adjectival phrase',7,'with payment functions suspended or meter displays not operating normally','付款功能暫停，或收費錶顯示屏未能正常運作','with 引出附加狀態；payment functions suspended 與 meter displays not operating normally 是並列的情況描述；or 列出不同表現。','在接報句後補充「發生甚麼問題」，不另開冗長句子。','..., with [feature A] unavailable or [feature B] not working normally.','The service was disrupted, with online booking unavailable or confirmation emails not arriving.／服務受阻，網上預約無法使用，或確認電郵未能送達。','or 不證明每位用戶／每部設備都同時有兩種問題；with 在此是附帶情況，不等於所有 with 都有同樣結構。'),
  step('S12','恢復運作：resume + normal operations/service',8,'The system resumed normal operations at 12.15pm.','系統於中午 12 時 15 分恢復正常運作。','resume 是及物動詞，後接 operations（名詞）；at 12.15pm 指明恢復時間。','以簡短句子為事件報道交代當時的處理結果。','[Service] resumed normal operations at [time].','The website resumed normal service at 3pm.／網站於下午三時恢復正常服務。','resume operations，不是 resume to operate（此義下較不自然）；復常不代表根本原因已完成最終調查。')
];

export const precisionRows = [
  ['said','independently proved','有來源的轉述 ≠ 作者自行核實','運輸署 said'],
  ['triggered','happened before','引發因果 ≠ 只是先後出現','update triggered malfunction'],
  ['preliminary','final','初步發現 ≠ 最終結論','preliminary investigations'],
  ['no evidence','impossible','暫無證據 ≠ 不可能發生','at the moment'],
  ['will arrange','has paid','將安排 ≠ 已付款','will arrange for full refunds'],
  ['strive','guarantee','力爭 ≠ 保證','will strive to complete'],
  ['approval','receipt','審批 ≠ 已入帳','approval of the refunds'],
  ['or','and-for-everyone','列出可能情況 ≠ 每個對象兩者兼有','suspended or ... not operating'],
  ['received a report','onset','接報時間 ≠ 故障起始時間','around 8.20am']
];

const opts = (...items) => items;
const select = items => items.map(value => ({value,label:value}));
export const questions = [
  {id:1,section:'第 1 段｜事件導語',marks:1,prompt:'According to paragraph 1, which organisation is the source of the statement about what triggered the malfunction?\n根據第 1 段，哪個機構是「甚麼引致系統故障」這項說法的消息來源？',fields:[{type:'text',accept:['the transport department','transport department','hong kong’s transport department','hong kongs transport department','the department']}],sample:'The Transport Department.',why:'第 1 段用 “The Transport Department said” 清楚指出消息來源。'},
  {id:2,section:'第 1 段｜事件導語',marks:1,prompt:'Find ONE word in paragraph 1 that means “affecting the whole city”.\n從第 1 段找出一個英文詞語，意思是「影響全市」。',fields:[{type:'text',accept:['citywide']}],sample:'citywide',why:'citywide 直接表示全市範圍。'},
  {id:3,section:'第 1 段｜事件導語',marks:1,prompt:'What is the main purpose of paragraph 1? Choose ONE answer.\n第 1 段的主要作用是甚麼？只選一項。',fields:[{type:'choice',options:opts('To announce the disruption and its reported cause.／交代系統故障及所報稱的原因。','To give detailed instructions for claiming refunds.／詳細說明如何申請退款。','To explain how to repair a parking meter.／講解如何維修停車收費錶。','To describe drivers’ personal experiences.／描述司機的親身經歷。'),answer:'0'}],sample:'A. To announce the disruption and its reported cause.',why:'導語先交代事件，再以有來源的說法指出所報稱原因。'},
  {id:4,section:'第 2 段｜技術原因與調查階段',marks:2,prompt:'Complete the cause-and-effect notes using information from paragraph 2. Write NO MORE THAN FIVE WORDS in each blank.\n根據第 2 段填寫因果筆記；每格不多於五個英文詞語。',fields:[{key:'fault',label:'(i) Software update → caused ...',type:'text',accept:['a back-end software fault','back-end software fault','a backend software fault','backend software fault']},{key:'connection',label:'(ii) prevented the system from making a normal ... with the meters',type:'text',accept:['connection']}],sample:'(i) a back-end software fault　(ii) connection',why:'兩格依次重現軟件更新所致的故障，以及該故障阻礙的正常連線。'},
  {id:5,section:'第 2 段｜技術原因與調查階段',marks:1,prompt:'What does “which” in paragraph 2 refer to?\n第 2 段的 which 指甚麼？',fields:[{type:'text',accept:['a back-end software fault','back-end software fault','a backend software fault','backend software fault']}],sample:'a back-end software fault',why:'which 緊接該名詞片語並補充其後果。'},
  {id:6,section:'第 2 段｜技術原因與調查階段',marks:1,prompt:'What does “preliminary” tell readers about the investigation at that stage? Explain in your own words.\npreliminary 反映當時調查處於甚麼階段？',fields:[{type:'textarea',keywords:[['early','initial','provisional','not final','not complete','初步','未完成','非最終']]}],sample:'The investigation was at an initial stage; its findings were not final.',why:'preliminary 限定調查仍屬初步，不能當作最終結論。'},
  {id:7,section:'第 2 段｜技術原因與調查階段',marks:2,prompt:'Does paragraph 2 provide enough evidence to conclude that individual parking meters were physically damaged? Answer YES, NO or NOT NECESSARILY, and give ONE reason.\n第 2 段是否足以證明個別收費錶硬件實際損壞？並提出一個理由。',fields:[{key:'answer',label:'Answer',type:'select',options:select(['YES','NO','NOT NECESSARILY']),answerAny:['NO','NOT NECESSARILY']},{key:'reason',label:'Reason',type:'textarea',keywords:[['back-end','backend','connection','software fault','軟件','後端','連線'],['not','no evidence','does not say','未有','沒有','不代表']]}],sample:'NO / NOT NECESSARILY. The paragraph describes a back-end software/connection fault, not physical damage to individual meters.',why:'軟件及連線故障不能自行推論為收費錶硬件受損。'},
  {id:8,section:'第 3 段｜影響規模',marks:1,prompt:'What does “about” suggest about the figure 11,000?\nabout 反映 11,000 這數字有甚麼特點？',fields:[{type:'textarea',keywords:[['approximate','estimate','not exact','rough','大約','約數','估算','不精確']]}],sample:'It is an approximate figure, not an exact count.',why:'about 是約數限定詞。'},
  {id:9,section:'第 3 段｜影響規模',marks:3,prompt:'With reference to paragraphs 1–3, decide whether each statement is T, F or NG.\n參考第 1 至 3 段，判斷 T／F／NG。',fields:[{key:'morning',label:'(i) The software update took place in the morning.',type:'select',options:select(['T','F','NG']),answer:'T'},{key:'monday',label:'(ii) The malfunction happened on Monday rather than Tuesday.',type:'select',options:select(['T','F','NG']),answer:'F'},{key:'tested',label:'(iii) The update had been tested on a small group of meters before Tuesday.',type:'select',options:select(['T','F','NG']),answer:'NG'}],sample:'(i) T　(ii) F　(iii) NG',why:'第 2 段明說早上更新；第 1 段明說星期二；預先小規模測試完全沒有提及。'},
  {id:10,section:'第 4 段｜後續調查與責任',marks:2,prompt:'What TWO actions has the Transport Department instructed the operator to take? State TWO distinct actions.\n運輸署指示營辦商採取哪兩項不同的行動？',fields:[{key:'investigate',label:'(i)',type:'textarea',keywords:[['conduct','carry out','investigate','investigation','調查']]},{key:'report',label:'(ii)',type:'textarea',keywords:[['submit','provide','detailed report','報告','提交']]}],sample:'(i) Conduct a thorough investigation into the cause. (ii) Submit a detailed report.',why:'conduct 與 submit 是同一指示下的兩項獨立任務。'},
  {id:11,section:'第 4 段｜後續調查與責任',marks:1,prompt:'Find ONE word in paragraph 4 meaning “gave an official direction or order”.\n找出一個英文詞語，意思是「正式指示／命令」。',fields:[{type:'text',accept:['instructed']}],sample:'instructed',why:'instructed 正是「已正式指示」。'},
  {id:12,section:'第 5 段｜證據與官方通報',marks:1,prompt:'Which statement best reflects the department’s position on a possible attack?\n哪項最準確反映運輸署對可能遭攻擊的立場？',fields:[{type:'choice',options:opts('It has proved that an attack was impossible.','It currently has no evidence of an attack.','It has confirmed that an attack caused the outage.','It has decided to stop investigating the incident.'),answer:'1'}],sample:'B. It currently has no evidence of an attack.',why:'“at the moment” 只限定目前證據狀態，並非永遠排除攻擊。'},
  {id:13,section:'第 5 段｜證據與官方通報',marks:1,prompt:'Which government office was notified about the incident?\n事件已向哪個政府辦公室通報？',fields:[{type:'text',accept:['digital policy office','the digital policy office']}],sample:'The Digital Policy Office.',why:'第 5 段直接點名通報對象。'},
  {id:14,section:'第 6 段｜退款安排與不確定性',marks:3,prompt:'Complete the three-part fact file using paragraph 6.\n根據第 6 段完成三項資料摘要。',fields:[{key:'who',label:'(i) Who will arrange the refunds?',type:'text',accept:['the operator','operator']},{key:'which',label:'(ii) Which transactions are covered? Give the type and time window.',type:'textarea',keywords:[['meter transaction','parking meter transaction','收費錶交易'],['8am','8 am','上午 8'],['12.15pm','12:15pm','12.15 pm','12:15 pm','12 時 15']]},{key:'extent',label:'(iii) Full or partial?',type:'text',accept:['full','full refunds','full refund','全額','全額退款']}],sample:'(i) The operator. (ii) All meter transactions between 8am and 12.15pm. (iii) Full refunds.',why:'本題分別核對負責者、交易類別與時段，以及退款程度。'},
  {id:15,section:'第 6 段｜退款安排與不確定性',marks:1,prompt:'What does “strive” suggest about completing refund approvals within the week?\nstrive 反映這項計劃有何性質？',fields:[{type:'choice',options:opts('Approval has already been completed.','The operator aims to complete approval, but success is not guaranteed.','Approval has been cancelled.','Approval will take exactly seven full days.'),answer:'1'}],sample:'B. The operator aims to complete approval, but success is not guaranteed.',why:'strive 表示努力達成，不是完成保證。'},
  {id:16,section:'第 6 段｜退款安排與不確定性',marks:2,prompt:'Has the article confirmed that every eligible user had already received a refund? Answer YES or NO and support it with ONE detail.\n文章是否已證實所有合資格用戶均已收到退款？',fields:[{key:'answer',label:'Answer',type:'select',options:select(['YES','NO']),answer:'NO'},{key:'reason',label:'Reason',type:'textarea',keywords:[['will arrange','strive','approval','future','not received','not paid','將安排','力爭','審批','未收到']]}],sample:'NO. It says refunds will be arranged and approvals will be pursued; it does not say payment was received.',why:'將安排及完成審批目標均不等於款項已入帳。'},
  {id:17,section:'第 6 段｜退款安排與不確定性',marks:1,prompt:'What missing information is needed to calculate one particular driver’s exact refund amount? Give ONE example.\n要計算某位司機確實退款金額，還需要哪項文中沒有的資料？',fields:[{type:'textarea',keywords:[['amount paid','payment amount','transaction value','number of transactions','parking duration','實付金額','交易金額','交易次數','泊車時間']]}],sample:'The amount paid / value or number of that driver’s affected transactions.',why:'文章只有涵蓋時段，沒有個別司機的交易價值。'},
  {id:18,section:'第 6 段｜退款安排與不確定性',marks:2,prompt:'Based only on the stated refund time window, write YES or NO.\n單按退款時段判斷 YES／NO。',fields:[{key:'early',label:'(i) 8.10am',type:'select',options:select(['YES','NO']),answer:'YES'},{key:'late',label:'(ii) 12.30pm',type:'select',options:select(['YES','NO']),answer:'NO'}],sample:'(i) YES　(ii) NO',why:'8.10am 在 8am–12.15pm 內；12.30pm 已超出。'},
  {id:19,section:'第 7 段｜故障表現與語意',marks:2,prompt:'Which TWO symptoms were reported? Tick TWO boxes only.\n營辦商報告了哪兩種故障表現？只選兩項。',fields:[{type:'multi',options:opts('Meters were physically removed.','Payment functions were suspended.','Parking fees were increased.','Meter displays were not operating normally.','Traffic lights stopped working.'),answer:['1','3'],max:2,marks:2}],sample:'B and D.',why:'第 7 段明示付款功能暫停，以及顯示屏運作不正常。'},
  {id:20,section:'第 7 段｜故障表現與語意',marks:2,prompt:'Does “or” prove that every affected meter had both symptoms at the same time? Answer YES or NO and explain.\n“or” 是否證明每個收費錶同時出現兩種問題？',fields:[{key:'answer',label:'Answer',type:'select',options:select(['YES','NO']),answer:'NO'},{key:'reason',label:'Reason',type:'textarea',keywords:[['alternative','one or the other','not necessarily both','different symptoms','not every','選項','其中一種','不一定同時','不同情況']]}],sample:'NO. “Or” presents alternative reported symptoms; it does not establish both for every meter.',why:'or 列出可能表現，不能擴張成每個對象兩者兼有。'},
  {id:21,section:'第 8 段｜時間與復常',marks:3,shuffleFields:true,prompt:'Match each event to the correct time. Write A, B, C or D. One time is not used.\n把每件事與正確時間配對；一個時間不會用到。\nA 12.15pm　B Around 8.20am　C 8am　D 8.30am',fields:[{key:'refund',label:'The refund period began.',type:'select',options:select(['A','B','C','D']),answer:'C'},{key:'report',label:'The department received the operator’s report.',type:'select',options:select(['A','B','C','D']),answer:'B'},{key:'resume',label:'Normal operation resumed.',type:'select',options:select(['A','B','C','D']),answer:'A'}],sample:'Refund period — C; report received — B; normal operation resumed — A. D is not used.',why:'8am 是退款期起點；約 8.20am 是接報；12.15pm 是復常。顯示次序每次隨機。'},
  {id:22,section:'第 8 段｜時間與復常',marks:1,prompt:'What does “resumed normal operations” mean? Explain briefly in your own words.\nresumed normal operations 是甚麼意思？',fields:[{type:'textarea',keywords:[['again','returned','restored','back to normal','working normally','恢復','重新','正常運作']]}],sample:'The system started working normally again / returned to normal service.',why:'resumed 表示中斷後恢復，而非首次啟用。'},
  {id:23,section:'全文｜組織與語氣',marks:3,shuffleFields:true,prompt:'Match each group of paragraphs with its best heading. Write A–E. One heading is not used. Paragraphs 1–2 → C is the example.\n把段落組合與小標題配對；一個標題不會用到。第 1–2 段 → C 已作示例。\nA Reporting the malfunction and restoring service\nB Scale of disruption and demand for further investigation\nC Initial announcement and reported technical cause\nD Caution about a possible attack and refund arrangements\nE Long-term plans to increase parking fees',fields:[{key:'3-4',label:'Paragraphs 3–4',type:'select',options:select(['A','B','C','D','E']),answer:'B'},{key:'5-6',label:'Paragraphs 5–6',type:'select',options:select(['A','B','C','D','E']),answer:'D'},{key:'7-8',label:'Paragraphs 7–8',type:'select',options:select(['A','B','C','D','E']),answer:'A'}],sample:'Paragraphs 3–4 — B; Paragraphs 5–6 — D; Paragraphs 7–8 — A. E is not used.',why:'配對須概括兩段的共同功能；三個 scored rows 每次均會重新排序。'},
  {id:24,section:'全文｜組織與語氣',marks:2,prompt:'What is the overall tone? Choose ONE answer and give ONE piece of evidence from the language or presentation.\n全文整體語氣是甚麼？選一項並提供一項證據。',fields:[{key:'tone',type:'choice',options:opts('Celebratory／歡欣慶祝','Accusatory／指責控訴','Factual and cautious／以事實為本、措辭審慎','Humorous／幽默詼諧'),answer:'2'},{key:'evidence',label:'Evidence',type:'textarea',keywords:[['preliminary','at the moment','about 11,000','around 8.20','strive','transport department said','received a report','specific time','初步','目前','大約','力爭','消息來源']]}],sample:'C. Factual and cautious; e.g. “preliminary investigations”, “at the moment”, “about 11,000” or “strive”.',why:'報道以官方來源和具體時間交代事實，並用限定詞避免過度肯定。'}
];
