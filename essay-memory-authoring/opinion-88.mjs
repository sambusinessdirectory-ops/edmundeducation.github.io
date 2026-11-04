import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:88'].map(x=>x.english);
const simple=[
'More people are becoming overweight, so some people say all university students should have to take a sport class, whatever they study.',
'I strongly disagree with this plan.',
'Forcing all students to take sport would take universities away from their main purpose and be a simple answer to a health problem with many causes.',
'First, university courses should focus on what students need for study and work, not make everyone do the same activity.',
'Students studying medicine, engineering, and literature already have hard classes, projects, work training, and due dates.',
'Adding a sport class with marks would use time students need for the special skills their degrees are meant to teach.',
'Universities are not places only for health training; their main job is to build knowledge, good judgement, and useful work skills.',
'If all degrees must include the same sport class, courses become harder to adjust and students may see exercise as just another task to finish instead of a healthy habit.',
'Second, required sport classes are unlikely to deal with the main reasons people gain weight.',
'Many students gain too much weight because they eat badly, feel stressed, sleep too little, spend too long looking at screens, or have habits from before university.',
'Making them play sport for a few hours each week may change their class times, but may not change how they live.',
'In fact, forcing sport can make things worse: students who dislike it may join unwillingly, do as little as possible, or feel ashamed and punished by exercise.',
'Universities should instead offer gyms that are easy to use, healthy food that is not too costly, advice, ways to walk or cycle, and sport classes students can choose.',
'These steps help students form habits they can keep doing.',
'In short, I disagree that sport should be a required class for every degree.',
'Universities should help students live more healthily, but should not weaken academic study or act as if one forced sport class can solve weight problems for everyone.',
];
const vocabulary=[
[['unhealthy rise in body weight','More people are becoming overweight','不健康增重'],['every university student','all university students','所有大學生'],['required to study sport','have to take a sport class','必修體育'],['regardless of their degree','whatever they study','不論學位']],
[['completely disagree','strongly disagree','完全不同意'],['this proposal','this plan','此建議']],
[['Making sport compulsory across all courses','Forcing all students to take sport','所有課程強制體育'],['distort the purpose of higher education','take universities away from their main purpose','扭曲高教目的'],['blunt response','simple answer','粗糙回應'],['complex health problem','health problem with many causes','複雜健康問題']],
[['university programmes','university courses','大學課程'],['academic and professional priorities','what students need for study and work','學術專業重點'],['one-size-fits-all activity requirement','make everyone do the same activity','一刀切活動要求']],
[['medical student','Students studying medicine','醫科學生'],['engineering student','engineering','工程學生'],['literature student','literature','文學學生'],['demanding lectures, projects, placements and deadlines','hard classes, projects, work training, and due dates','繁重課堂項目實習限期']],
[['assessed sport module','sport class with marks','評核體育單元'],['take time away','use time','佔用時間'],['specialist training','special skills','專業訓練']],
[['health camps','places only for health training','健康訓練營'],['central role','main job','核心角色'],['cultivate knowledge, judgement and employable expertise','build knowledge, good judgement, and useful work skills','培養知識判斷就業專業']],
[['forced to carry','must include','被迫加入'],['curricula become less flexible','courses become harder to adjust','課程較不靈活'],['healthy habit','healthy habit','健康習慣'],['another box to tick','another task to finish','另一項打勾任務']],
[['compulsory sport','required sport classes','強制體育'],['unlikely to tackle','unlikely to deal with','不太可能處理'],['real causes of weight gain','main reasons people gain weight','增重真因']],
[['poor diet','eat badly','飲食不良'],['stress','feel stressed','壓力'],['lack of sleep','sleep too little','睡眠不足'],['long screen time','spend too long looking at screens','螢幕時間長'],['formed long before they enter university','from before university','入學前形成']],
[['Forcing them to play sport','Making them play sport','強迫運動'],['a few hours a week','a few hours each week','每週幾小時'],['timetable','class times','時間表'],['not necessarily change their lifestyle','may not change how they live','未必改變生活方式']],
[['compulsion can backfire','forcing sport can make things worse','強制反效果'],['participate reluctantly','join unwillingly','勉強參與'],['do the bare minimum','do as little as possible','只做最低限度'],['embarrassment and punishment','ashamed and punished','尷尬與懲罰']],
[['accessible gyms','gyms that are easy to use','易用健身設施'],['affordable healthy food','healthy food that is not too costly','可負擔健康食物'],['counselling','advice','輔導'],['active travel schemes','ways to walk or cycle','步行騎車計劃'],['optional fitness classes','sport classes students can choose','自選健身課']],
[['These measures','These steps','這些措施'],['routines they can sustain','habits they can keep doing','可持續習慣']],
[['In conclusion','In short','總結'],['do not agree','disagree','不同意'],['compulsory module','required class','必修單元'],['every degree course','every degree','每個學位課']],
[['support healthier living','help students live more healthily','支持健康生活'],['sacrifice academic purpose','weaken academic study','犧牲學術目的'],['pretend that obesity can be solved','act as if one forced sport class can solve weight problems','假裝能解決肥胖'],['same sporting mold','for everyone','同一運動模式']],
];
const chunkOverrides={1:['I completely disagree','with this proposal.'],6:['Universities are not health camps;','their central role is to cultivate knowledge, judgement and employable expertise.'],13:['These measures encourage students','to build routines they can sustain.']};
const simpleChunkOverrides={1:['I strongly disagree','with this plan.'],6:['Universities are not places only for health training;','their main job is to build knowledge, good judgement, and useful work skills.'],13:['These steps help students','form habits they can keep doing.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'區分一刀切要求、根因與可持續替代方案。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['An unhealthy rise in body weight','every university student','sport','their degree'],['A rise in student stress','every university student','stress management','their degree'],'引言轉述健康問題引出全員必修建議。','題目以社會問題支持普遍強制措施，先說清其範圍時。',[1,2,3]),
makeStructure(1,['this proposal'],['that plan'],'短句明確反對，隨後分兩理由。','對一項明確政策有完整反對立場時。',[0,2,14]),
makeStructure(2,['sport','all courses','the purpose of higher education','a complex health problem'],['mindfulness','all courses','the purpose of higher education','a complex mental-health problem'],'概括「偏離大學使命」及「問題複雜」兩理由。','反對統一課程要求時，區分學術代價與政策效果時。',[1,3,8]),
makeStructure(3,['university programmes','academic and professional priorities','a one-size-fits-all activity requirement'],['technical courses','academic and professional priorities','a one-size-fits-all activity requirement'],'提出學位課程應按學術與職業需要設計。','討論必修內容是否合理時，先明確課程的主要目的。',[4,5,6]),
makeStructure(4,['A medical student, an engineering student and a literature student','demanding lectures, projects, placements and deadlines'],['A law student, a design student and a science student','demanding lectures, projects, placements and deadlines'],'列不同專業學生共同面對繁重安排。','說統一必修會擠壓時間前，先交代既有負擔時。',[3,5,6]),
makeStructure(5,['an assessed sport module','the specialist training','their degrees'],['an assessed non-core module','the specialist training','their degrees'],'說明加設評核課會擠佔專業訓練。','評估新增必修時，指出其課時從哪項核心內容移走。',[3,4,6]),
makeStructure(6,['Universities','health camps','knowledge, judgement and employable expertise'],['Universities','job-placement agencies','knowledge, judgement and employable expertise'],'比喻澄清大學不是單一健康機構。','有人用單一社會目標要求大學改變核心使命時。',[3,5,7]),
makeStructure(7,['every course','the same sports requirement','curricula','students','a healthy habit','another box to tick'],['every course','the same assessed exercise requirement','curricula','students','a healthy habit','another box to tick'],'強制統一既損彈性，也可能破壞自願習慣。','全體必修看似有益，需分析課程與動機的雙重反效果時。',[5,6,8]),
makeStructure(8,['compulsory sport','the real causes of weight gain'],['a compulsory lecture','the real causes of stress'],'第二理由轉到措施與問題根因不匹配。','已談制度代價，再評估政策是否觸及實際成因時。',[9,10,11]),
makeStructure(9,['Many students','poor diet, stress, lack of sleep, long screen time and habits formed long before they enter university'],['Many workers','poor diet, stress, lack of sleep, long screen time and habits formed long before they enter employment'],'列出體重問題的多種成因及形成時間。','反駁單一方案前，具體展示問題是多因素時。',[8,10,12]),
makeStructure(10,['them','sport','a few hours a week','their timetable','their lifestyle'],['workers','competitive games','a few hours a week','their timetable','their lifestyle'],'區分課表改變與生活方式真正改變。','評估強制活動時，不把完成課程等同持久習慣。',[8,9,11]),
makeStructure(11,['compulsion','students','sport','exercise'],['mandatory attendance','learners','the sessions','practice'],'提醒強制可能引起敷衍與負面聯想。','要指出好意政策可能因抵觸而適得其反時。',[8,10,12]),
makeStructure(12,['Universities','accessible gyms, affordable healthy food, counselling, active travel schemes and optional fitness classes'],['Employers','accessible gyms, affordable healthy food, counselling, active travel schemes and optional fitness classes'],'提出多面、可選、較易參與的替代支持。','反對單一強制後，要給出覆蓋多種成因的具體方案時。',[9,10,13]),
makeStructure(13,['These measures','students','routines they can sustain'],['These choices','workers','routines they can sustain'],'把替代方案連到能長期維持的習慣。','列措施後，要說明其成功標準是持續而非一次完成。',[10,12,15]),
makeStructure(14,['sport','every degree course'],['mindfulness','every degree course'],'結論直接反對所有學位一律必修。','同意題結論須保持政策範圍準確時。',[1,13,15]),
makeStructure(15,['Universities','healthier living','academic purpose','obesity','all students','the same sporting mold'],['Universities','better mental health','academic purpose','stress','all students','the same compulsory mold'],'承認健康支援職責，但反對犧牲學術或同一模子。','結論同時支持目標並否定所提一刀切手段時。',[2,12,14]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者支持所有大學學位都必修體育嗎？',['完全反對；會擠壓學術並難治多因素健康問題','完全同意；每個專業都應用相同體育考核','沒有立場；只討論校園餐廳','反對大學提供任何運動設施'],'作者反對強制，仍支持健康設施與自選課。'),{type:'multi',prompt:'選出兩段主體不同理由',detail:'選兩項，再按「確認」。',options:['統一體育評核會佔用不同專業的核心訓練時間','增重涉及飲食、壓力、睡眠等，必修運動未必改變習慣','所有學生增加體重都是因為不會打球','每個學位的課程目的與要求完全一樣'],correct:[0,1],why:'一段談學術使命，一段談健康問題的多重根因。'}];
const route=[sequence('排好全文四段',[['引言 · 反對一刀切','體重問題存在，但全學位必修體育是粗糙方案。'],['主體一 · 學術使命','不同專業已有負擔，評核體育會擠佔核心訓練。'],['主體二 · 複雜成因','飲食、壓力、睡眠等未必由每週數小時運動解決。'],['結論 · 自選支援','大學應支持健康生活，毋須同一強制模式。']],'問題存在 → 必修代價 → 根因不符 → 多面替代。')];
const evidence=[Q('大學三類學生的例子指出甚麼？',['不同專業本有課堂、項目、實習與限期','三種專業每週完全沒有任何工作','只有醫科學生需要學術訓練','體育評核不會佔用課程時間'],'列出既有專業負擔。'),Q('原文列哪些體重增加的成因？',['飲食、壓力、睡眠、螢幕及入學前習慣','只有球場面積一項','只有每學期課表長度','只有學生運動服顏色'],'問題有多重成因。'),Q('強制體育為何可能反效果？',['學生敷衍參加，甚至把運動聯想到羞愧和懲罰','所有學生必定開始自主運動','課程會自動改善全部睡眠問題','學生能立即消除多年飲食習慣'],'compulsion can backfire。'),Q('大學可提供哪些替代支持？',['易用健身室、健康食物、輔導、步行騎車及自選課','只有額外一門統一評核體育','只張貼禁食所有食物的告示','完全停止所有健康相關服務'],'原文列多項可選且可持續的支持。')];
const logic=[sequence('主體一：必修體育怎樣偏離學術使命？',[['原則','課程應按學術與專業目標設計。'],['學生負擔','醫科、工程與文學已有課堂項目實習限期。'],['時間代價','評核體育擠佔專業訓練。'],['使命','大學培養知識、判斷及專業能力。'],['動機風險','統一要求可能只成另一項打勾任務。']],'專業目標 → 課時競爭 → 使命偏離。'),sequence('主體二：健康問題需要何種回應？',[['多因素成因','飲食、壓力、睡眠、螢幕及長期習慣。'],['表面改變','每週幾小時體育只改課表，未必改生活。'],['可能反效果','勉強參與或把運動聯想到懲罰。'],['替代方案','設施、健康飲食、輔導、主動出行、自選課。'],['真正目標','形成能長期維持的日常習慣。']],'根因多樣 → 單一強制有限 → 多面自選支持。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('大學要求所有學位增設相同評核活動，學生課表已十分緊。','第一段會先問甚麼？',['新增課時會否擠走專業核心訓練','活動名稱是否比其他課程更容易記住','所有系別是否使用同一種教室顏色','學生能否只用海報代替原有實習'],['學術機會成本。','非重點。','無關。','不能代實習。'],[3,4,5,6],'assessed module takes time from specialist training'),
T('校方想靠每週兩小時必修體育解決學生體重問題。','第二段會提出哪項疑慮？',['課表變了，飲食睡眠壓力等習慣未必改變','體育一必修，所有學生便永遠不再超重','只要運動兩小時，健康飲食便完全無關','大學只要有球場，壓力便必定消失'],['課表≠生活方式。','不保證。','飲食仍重要。','壓力多因。'],[8,9,10],'change timetable not necessarily lifestyle'),
T('部分學生不喜歡必修體育，勉強參加並把運動視作懲罰。','這是哪種政策風險？',['強制可能反效果，削弱長期自發運動意願','勉強出席便必定養成終身運動習慣','感到尷尬表示課程必然十分有效','學生不喜歡運動就不需要健康支援'],['backfire。','非必然。','可能負面。','仍需支援。'],[7,10,11],'compulsion can backfire'),
T('某學生缺覺、飲食不良又長時間對螢幕，但校方只加一門球類課。','哪個批評最準確？',['單一課程未觸及睡眠飲食等多項根因','任何球類活動都完全沒有任何健康價值','只要改課表，全部舊習慣就自動消失','缺覺與飲食無關，超重只由球類造成'],['根因不匹配。','非零價值。','未必變。','根因多面。'],[8,9,10,12],'real causes include diet, stress, sleep, screen time'),
T('工程系新增非核心必修考核，原本的專業實習時間被擠壓。','這遷移哪項論點？',['統一要求佔用課時，或削弱學位核心訓練','任何實習都可被一門健康課自動取代','專業課時一被擠壓，學生必然更健康','所有工程學生都不需任何生活習慣支援'],['opportunity cost。','無法取代。','無保證。','仍需支援。'],[3,4,5,6],'specialist training meant to be provided by degree'),
T('大學提供便宜健康餐、步行路線與自選健身課。','它為何比單一強制課更貼近文章？',['多種自選支持可回應不同成因及生活需要','只要有便宜餐點，所有學生便不需睡覺','自選課存在就表示大學完全不關心健康','步行路線一建成，壓力問題便立即消失'],['多面且可持續。','睡眠仍重要。','正提供支援。','不保證。'],[9,11,12,13],'accessible options build sustainable routines'),
T('有人說反對必修體育等於反對大學促進健康。','結論如何澄清？',['支持健康目標，反對犧牲學術與統一強制','反對所有健身設施與健康飲食服務','主張學生無須關心體重與生活習慣','同意只要全體考體育就能消除肥胖'],['目標與手段有別。','支持設施。','仍重健康。','非單一解法。'],[12,14,15],'support healthier living without compulsory mold'),
T('一所大學把運動列成人人必做的打卡考核。','首段擔心學生如何理解運動？',['只把它當另一待完成任務，而非健康習慣','所有人都會因此自願終身定期運動','大學課程會因此變得更容易調整','評核越多，飲食和睡眠便自動改善'],['box to tick。','非必然。','較不靈活。','無此保證。'],[7,11],'another box to tick not healthy habit'),
T('學生從中學時代已有壞習慣，到大學後才被要求每週運動。','這突出哪種時間差？',['舊習慣早已形成，幾小時課堂難改生活','一入大學，過去習慣便會立即全部消失','每週運動一定會自動修復每晚睡眠','舊習慣只由大學入學後的課程設計造成'],['habits predate university。','不自動。','不保證。','形成更早。'],[9,10],'habits formed before university'),
T('大學在有限課時中要培養專業判斷與就業技能。','這符合哪項使命描述？',['高等教育以知識、判斷與專業能力為核心','大學應完全停止一切健康相關支持','專業能力只能從統一體育課取得','只要有專業訓練，學生就不需要休息'],['原文 central role。','仍可支援健康。','非體育獨有。','仍需健康。'],[3,5,6],'central role cultivate knowledge and expertise'),
T('校方希望學生畢業後仍保持活動習慣。','按文章，較合適的成果指標是甚麼？',['學生能建立可長期維持的自選日常習慣','學生只在考核周勉強完成最低要求','每個學生都要選同一種體育項目','學生的課表只要變長便表示健康改善'],['sustain routines。','敷衍不足。','可多樣。','課表非生活。'],[11,12,13],'routines they can sustain'),
T('要概括作者對全學位必修體育的立場。','哪項最完整？',['反對統一必修，支持多面健康服務與自選課','完全同意必修，認為它可解決所有超重原因','反對所有運動設施，要求學生只顧考試','沒有立場，只列出幾種不同學位名稱'],['立場與替代俱全。','非單一解法。','支持設施。','立場清楚。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'not compulsory; healthier living without sacrificing academia'),
];
const plausibleAlternatives=[
  [['新增評核可令學生健康，課時則稍後再調','先比較新活動是否受歡迎，再處理實習','各學位課表相近，因此新增課時影響相近'],['健康目標仍須衡量核心課時代價。','受歡迎程度不能取代學位訓練需求。','不同學位的課時與訓練重點並不相同。']],
  [['體育能增加活動，但飲食與睡眠可留待畢業','每週兩小時有幫助，壓力通常會自行減輕','課表改變可改善體重，其餘習慣影響較小'],['健康因素交織，不能暫時排除。','壓力未必因一門課而自行消失。','文章認為課程時間不足以處理多種根因。']],
  [['強制能提高出席，長期習慣可待畢業再培養','體育評核增加參與，尷尬感不影響往後意願','反感可能出現，但只需提高考核分數'],['政策目標是建立可持續習慣。','負面體驗可能削弱自願運動。','更重評核未必能處理反感。']],
  [['球類課可補運動量，睡眠飲食則較難改變','缺覺與飲食需處理，但球類課可取代輔導','多種成因存在，因此健康服務可先只談運動'],['難改變不代表可忽略根因。','單一課程不能代替其他生活支援。','文章主張多面、可選的健康服務。']],
  [['實習受擠壓，專業技能可留到畢業後再學','工程生有專業訓練，健康課可增加實習能力','統一評核佔時間，卻不會影響課程核心內容'],['大學正須在學位期間培養專業技能。','健康課未必能補足工程實習。','時間擠壓可能削弱核心訓練。']],
  [['多種自選支持有用，仍需統一評核確保出席','便宜餐點可改善飲食，睡眠與壓力可暫不管','步行和健身可選，較難幫助不同生活需要'],['強制評核可能令運動變成打卡任務。','多面成因不能只由飲食處理。','多種選項正為適應不同需要。']],
  [['支持健康目標，故仍應先設全校統一考核','反對統一強制，所以健康服務可由家庭承擔','保留學術訓練，便毋須提供自選運動'],['作者反對統一考核並提出替代支援。','大學仍有促進健康的角色。','學術與可選健康服務可以並行。']],
  [['打卡有助建立紀律，評核可取代日常興趣','統一活動方便管理，因此較易持續運動','強制完成任務可改善分數，健康則留待以後'],['短期完成不等於持續健康習慣。','易於管理不代表學生願長期參與。','政策目標是促進健康，而非只增加評分。']],
  [['舊習慣已形成，課堂應比其他支援優先','幾小時運動有益，飲食與睡眠仍可維持原狀','早年習慣難改，因此大學毋須提供選項'],['長期行為需多面支持，不只課堂。','超重不只與運動時數有關。','困難正說明持續支援有必要。']],
  [['專業能力是核心，健康需求可暫時退出校園','高等教育重視判斷，體育評核可取代實習','學位訓練重要，健康支援宜由家庭提供'],['核心使命仍可與自選健康服務並行。','統一評核不能代替專業實踐。','大學仍應提供健康設施與輔導。']],
  [['學生完成必修考核，畢業後可自行再考慮','學生持續參與，前提是選同一項運動','學生願意運動，其他習慣則由校方評分'],['短期考核完成不代表長期習慣。','可持續習慣應容許個人選擇。','健康結果不宜只靠行政評分。']],
  [['反對統一必修，健康支援應留給家庭','支持運動設施，但仍須統一體育評核','反對強制體育，學術與生活習慣各自分開'],['作者仍主張大學提供多面健康服務。','統一評核正是作者反對的政策。','健康與學術可以並顧，不是完全分離。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:88',meta:{topic:'大學應否全學位必修體育',summary:'作者完全反對所有學位一律把體育列為評核必修。大學的核心是知識、判斷及專業訓練；加設統一課程會擠佔不同學位的時間，亦可能令運動只成打勾任務。超重涉及飲食、壓力、睡眠、螢幕時間及早已形成的習慣，每週幾小時強制運動未必改變生活。大學仍應提供易用設施、可負擔健康食物、輔導、主動出行與自選課，幫助學生建立可持續習慣。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
