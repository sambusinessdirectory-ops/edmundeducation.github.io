// Full source-specific memorisation support for Discuss Both Views 11.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-11-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:11'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Stopping crime is an important part of any society where people can live safely and treat one another well.',
  'Some people say each person should keep themselves safe, while others say the government should do most of the work to stop crime.',
  'I think people should make wise choices, but the government must do most of the work because it alone has the legal power and money to lower crime across a whole country.',
  'People who say each person should help protect themselves believe that careful choices can make them less likely to be harmed.',
  'For example, people who own homes can put in cameras, keep valuable things out of sight and take care when sharing facts about themselves online.',
  'These habits help because many people who commit crimes look for easy chances; if someone makes it easy to harm them, those people may be more likely to commit a crime against them.',
  'From this view, paying attention to your own safety is the first way to protect yourself, especially when police officers cannot be there.',
  'But I think stopping crime cannot be mostly the job of each person alone.',
  'The government must make rules and run services that help people stay safe, such as good police work, fair laws, lights on streets, teaching people about safety and help for those who need it.',
  'If an area has poor police work, few ways to watch public places and few good chances for young people, each person can keep safe only to a point.',
  'A family may lock its doors at night, but it cannot stop groups that commit crime, make every public place safe or fix large problems that lead people to break the law.',
  'These problems need public groups to work together, not only each person being careful.',
  'To sum up, people should take sensible steps to keep safe, but those steps cannot take the government’s place.',
  'Because crime is a problem that affects everyone rather than just causing one person trouble, the government should have the main job of stopping it.',
];
const vocabulary=[
  [['Crime prevention','Stopping crime','預防犯罪'],['central part','important part','核心部分'],['safe and civilised society','society where people can live safely and treat one another well','安全文明社會']],
  [['individuals','each person','個人'],['take responsibility','keep themselves safe','承擔責任'],['preventing crime','stop crime','預防犯罪'],['mainly the duty of the state','government should do most of the work','主要由國家負責']],
  [['In my opinion','I think','在我看來'],['act sensibly','make wise choices','理智行事'],['government','government','政府'],['primary responsibility','do most of the work','主要責任'],['authority','legal power','權力'],['resources','money','資源'],['on a large scale','across a whole country','大規模']],
  [['individual responsibility','each person should help protect themselves','個人責任'],['lower their own risk','less likely to be harmed','降低自身風險'],['careful choices','careful choices','謹慎選擇']],
  [['homeowners','people who own homes','屋主'],['install security cameras','put in cameras','裝保安攝像頭'],['valuables','valuable things','貴重物品'],['avoid leaving valuables in visible places','keep valuable things out of sight','避免貴重物品外露'],['be cautious','take care','保持謹慎'],['personal information','facts about themselves','個人資料']],
  [['These habits are useful','These habits help','這些習慣有用'],['opportunistic','look for easy chances','伺機犯案'],['easy target','easy to harm them','容易下手目標'],['criminals','people who commit crimes','罪犯'],['take advantage of them','commit a crime against them','趁機下手']],
  [['From this perspective','From this view','從這角度'],['personal awareness','paying attention to your own safety','個人警覺'],['first line of defence','first way to protect yourself','第一道防線'],['police','police officers','警察'],['physically present','be there','親身在場']],
  [['However','But','然而'],['crime prevention','stopping crime','預防犯罪'],['depend mainly on individuals','mostly the job of each person alone','主要依靠個人']],
  [['responsible for','must','有責任'],['effective policing','good police work','有效警務'],['fair laws','fair laws','公平法律'],['street lighting','lights on streets','街燈'],['public education','teaching people about safety','公共教育'],['social support','help for those who need it','社會支援']],
  [['neighbourhood','area','社區'],['poor law enforcement','poor police work','執法不足'],['weak surveillance','few ways to watch public places','監察薄弱'],['few opportunities for young people','few good chances for young people','年輕人機會不足'],['limited extent','only to a point','有限程度']],
  [['lock its doors every night','lock its doors at night','每晚鎖門'],['organised crime','groups that commit crime','有組織犯罪'],['wider social problems','large problems','廣泛社會問題'],['illegal behaviour','break the law','違法行為']],
  [['These issues','These problems','這些問題'],['coordinated public action','public groups to work together','協調公共行動'],['not just private caution','not only each person being careful','不只個人謹慎']],
  [['In conclusion','To sum up','總結'],['individuals','people','個人'],['reasonable steps','sensible steps','合理措施'],['protect themselves','keep safe','保護自己'],['cannot replace','cannot take','不能取代'],['role of government','government’s place','政府角色']],
  [['Since','Because','由於'],['social problem','problem that affects everyone','社會問題'],['personal inconvenience','causing one person trouble','個人不便'],['state','government','國家'],['chiefly responsible','have the main job','主要負責']],
];
const chunkOverrides=[
  ['Crime prevention is a central part','of any safe and civilised society.'],
  ['While some people argue that individuals','should take responsibility for their own safety,','others believe that preventing crime','is mainly the duty of the state.'],
  ['In my opinion, although citizens should act sensibly,','the government must carry the primary responsibility','because only it has the authority and resources','to reduce crime on a large scale.'],
  ['Those who support individual responsibility argue','that people can lower their own risk','by making careful choices.'],
  ['For example, homeowners can install security cameras,','avoid leaving valuables in visible places,','and be cautious when sharing personal information online.'],
  ['These habits are useful because many crimes are opportunistic;','if a person makes themselves an easy target,','criminals may be more likely to take advantage of them.'],
  ['From this perspective, personal awareness','acts as the first line of defence,','especially in daily situations','where the police cannot be physically present.'],
  ['However, I believe that crime prevention','cannot depend mainly on individuals.'],
  ['The government is responsible for creating and maintaining','the systems that make society safe,','such as effective policing, fair laws, street lighting,','public education, and social support.'],
  ['If a neighbourhood has poor law enforcement,','weak surveillance, and few opportunities for young people,','individuals can only protect themselves','to a limited extent.'],
  ['A family may lock its doors every night,','but it cannot control organised crime, unsafe public spaces,','or wider social problems','that push people towards illegal behaviour.'],
  ['These issues require coordinated public action,','not just private caution.'],
  ['In conclusion, individuals should certainly take reasonable steps','to protect themselves,','but this cannot replace the role of government.'],
  ['Since crime is a social problem','rather than merely a personal inconvenience,','the state should be chiefly responsible','for preventing it.'],
];
const simpleChunkOverrides=[
  ['Stopping crime is an important part','of any society where people can live safely','and treat one another well.'],
  ['Some people say each person should keep themselves safe,','while others say the government should do most','of the work to stop crime.'],
  ['I think people should make wise choices,','but the government must do most of the work','because it alone has the legal power and money','to lower crime across a whole country.'],
  ['People who say each person should help protect themselves','believe that careful choices','can make them less likely to be harmed.'],
  ['For example, people who own homes can put in cameras,','keep valuable things out of sight','and take care when sharing facts about themselves online.'],
  ['These habits help because many people who commit crimes','look for easy chances;','if someone makes it easy to harm them,','those people may be more likely to commit a crime against them.'],
  ['From this view, paying attention to your own safety','is the first way to protect yourself,','especially when police officers cannot be there.'],
  ['But I think stopping crime','cannot be mostly the job of each person alone.'],
  ['The government must make rules and run services','that help people stay safe,','such as good police work, fair laws, lights on streets,','teaching people about safety and help for those who need it.'],
  ['If an area has poor police work,','few ways to watch public places','and few good chances for young people,','each person can keep safe only to a point.'],
  ['A family may lock its doors at night,','but it cannot stop groups that commit crime,','make every public place safe or fix large problems','that lead people to break the law.'],
  ['These problems need public groups to work together,','not only each person being careful.'],
  ['To sum up, people should take sensible steps','to keep safe,','but those steps cannot take the government’s place.'],
  ['Because crime is a problem that affects everyone','rather than just causing one person trouble,','the government should have the main job','of stopping it.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Road safety is a central part of any well-run town.','以 ... is a central part of 界定公共安全的重要性',[1,3,7],fixed(0,'[預防犯罪] is a central part of [安全文明社會].','開篇把防罪放在整體社會安全中。','要交代某項公共工作為何是整體社會運作的核心部分時。',[' is a central part of '],['被討論的公共工作','它支撐的更大整體'])),
  card('While some people argue that walkers should keep themselves safe, others believe that road safety is mainly the city’s duty.','以 While some ... others ... 公平呈現個人與政府責任',[0,2,8],fixed(1,'While some people argue that [個人應保自身安全], others believe that [預防犯罪主要是國家責任].','引言先準確呈現兩派責任分配。','題目涉及責任歸屬，需要先平衡列出兩種不同承擔者時。',['While some people argue that ', ', others believe that '],['第一派的責任主張','第二派的責任主張'])),
  card('In my opinion, although cyclists should take care, the city must carry the main responsibility because only it has the power to change roads across the region.','以 although 讓步個人謹慎，再用 only it 說政府規模能力',[1,4,8],fixed(2,'In my opinion, although [市民應謹慎], [政府] must carry [主要責任] because only it has [權力資源] to [大規模減罪].','作者承認個人應做事，仍選政府主責，理由是權力資源。','兩方都有角色，但需說清誰應主責及其獨有能力時。',['In my opinion, although ', ', ', ' must carry ', ' because only it has ', ' to '],['先承認的個人責任','擁有主責者','其責任大小','獨有的手段','可實現的較大規模結果'])),
  card('Those who support personal safety argue that careful walkers can lower their risk by making safer choices.','以 by making ... 說個人選擇可減風險',[2,5,7],fixed(3,'Those who support [個人責任] argue that [人們] can lower [自身風險] by making [謹慎選擇].','公平提出個人防護一方的主要理由。','要解釋支持個人責任者如何把日常選擇連到風險降低時。',['Those who support ', ' argue that ', ' can lower ', ' by making '],['被支持的責任觀','能作選擇的人','想降低的風險','採取的方法'])),
  card('For example, residents can lock bicycles, keep bags close and avoid posting private details online.','以 For example 列三項個人防護行動',[3,5,6],fixed(4,'For example, [屋主] can [裝攝像頭、藏好貴重物品、慎分享網上資料].','把「謹慎選擇」具體化為防盜與資料保護。','已提出個人可降低風險，要列數項可由個人直接做到的措施時。',['For example, ', ' can '],['能自行採取行動的人','幾項具體預防措施'])),
  card('These habits are useful because some thefts rely on easy chances; if a door is unlocked, thieves may be more likely to act.','以 because 加 if 解釋機會型犯罪為何受習慣影響',[4,6,9],fixed(5,'These habits are useful because [不少犯罪伺機發生]; if [有人變成易下手目標], [罪犯] may be more likely to [趁機犯案].','措施可減少容易下手的機會，但不能消除所有犯罪。','已列日常防護措施，要解釋它們降低風險的條件和機制時。',['These habits are useful because ', '; if ', ', ', ' may be more likely to '],['措施有效的原因','增加受害風險的條件','可能趁機的人','因此更可能發生的行為'])),
  card('From this perspective, looking after your own safety acts as a first defence, especially in places where officers cannot be everywhere.','以 first line of defence 定位個人警覺的作用與限制',[4,5,7],fixed(6,'From this perspective, [個人警覺] acts as [第一道防線], especially [警察不能在場的情況].','個人警覺有即時用途，特別是警察不能每處在場。','已說個人措施的機制，要概括其適用時刻與防線地位時。',['From this perspective, ', ' acts as ', ', especially in '],['可自行發揮的能力','在多層保障中的位置','它特別有用的情況'])),
  card('However, I believe that street safety cannot depend mainly on each walker.','以 However 明確轉入反對個人主責',[2,6,8],fixed(7,'However, I believe that [預防犯罪] cannot depend mainly on [個人].','第二主體段從個人第一道防線轉到制度主責。','已公平說明一方的作用，仍要指出它不足以承擔主要責任時。',['However, I believe that ', ' cannot depend mainly on '],['需要更廣措施的工作','不應獨自承擔主責者'])),
  card('The city is responsible for creating and maintaining safety measures, such as lighting, patrols, fair rules and public help.','以 such as 列政府可建立的公共安全系統',[7,9,10],fixed(8,'[政府] is responsible for creating and maintaining [安全系統], such as [警務法律照明教育與支援].','政府有個人無法建立的公共制度與資源。','已主張某機構應主責，要列出它能建設並維持的具體系統時。',[' is responsible for creating and maintaining ', ', such as '],['有制度能力的主體','需維持的公共系統','數項制度措施'])),
  card('If a district has poor patrols and few youth activities, families can only protect themselves to a point.','以 If ... only ... to a limited extent 說個人防護有上限',[8,10,11],fixed(9,'If [社區執法監察與青年機會不足], [個人] can only protect themselves to [有限程度].','公共環境弱時，個人小心也無法完全補足。','要用條件句指出上層制度不足時，個人手段會遇到上限時。',['If ', ', ', ' can only protect themselves to '],['制度缺陷的條件','被迫自行防護的人','其防護能力的界限'])),
  card('A family may lock its home, but it cannot control crime across the whole district.','以 may ... but cannot 對照家庭可做與不能做的事',[9,11,12],fixed(10,'[家庭] may [每晚鎖門], but it cannot control [有組織犯罪、公共空間與社會成因].','家庭措施有用，卻不能管跨地區犯罪和社會誘因。','要用同一主體能做與不能做的事，清楚展示個人措施的範圍時。',[' may ', ', but it cannot control '],['作私人防護的人','確實可做的事','超出其能力的公共問題'])),
  card('These problems require a shared city response, not just private care.','以 not just 比較協調公共行動與私人謹慎',[8,10,12],fixed(11,'These [問題] require [協調公共行動], not just [私人謹慎].','將前述制度缺陷提升為需要公共統籌的問題。','已列個人難解的多種問題，要點明需要哪種集體回應時。',['These ', ' require ', ', not just '],['前述超出私人能力的問題','必要的共同措施','單獨不足的方法'])),
  card('In conclusion, residents should certainly take steps to protect themselves, but this cannot replace the city’s safety work.','以 should ... but cannot replace 公平收束雙方責任',[3,8,13],fixed(12,'In conclusion, [個人] should [合理自保], but this cannot replace [政府角色].','結論保留個人責任，同時再次指出政府不可被替代。','結論要承認較小一方應盡的責任，仍避免它取代主責時。',['In conclusion, ', ' should certainly take ', ' to protect themselves, but this cannot replace '],['可自行採取措施的人','應採取的合理措施','不能被替代的制度角色'])),
  card('Since unsafe roads affect the whole town rather than merely one traveller, the city should be chiefly responsible for the response.','以 Since ... rather than merely ... 解釋公共問題為何應公家主責',[2,11,12],fixed(13,'Since [犯罪是社會問題] rather than merely [私人不便], [國家] should be chiefly responsible for [預防].','犯罪影響整體社會，不應只當個人困擾。','要用問題的公共性，論證為何一個具公共權力的主體應主責時。',['Since ', ' rather than merely ', ', ', ' should be chiefly responsible for '],['問題的公共性質','不足以完整描述的私人層面','應負主責的公共主體','需要執行的公共工作'])),
];
const wrongReasons=[
  ['這句已並列個人和國家兩派，原句只界定預防犯罪重要性。','這句開始個人防護論據，非社會層面的引題。','這句轉入反對個人主責，未先界定公共安全的重要性。'],
  ['這句只說防罪重要，未交代兩派如何分責。','這句已選政府主責並給權力資源理由，原句先並列。','這句開始政府主體段，非引言公平介紹兩派。'],
  ['這句列兩派責任主張，未給作者最後權衡及理由。','這句只說個人可減風險，未說政府具獨有能力。','這句進入公共措施清單，原句在引言先選主責者。'],
  ['這句引言已選政府主責，原句先公平分析個人可做的事。','這句列裝攝像頭等個人措施，未先概括謹慎選擇的作用。','這句轉入反對個人主責，與先公平說個人責任不同。'],
  ['這句提出謹慎選擇可降低風險，未列具體做法。','這句解釋機會型犯罪的機制，原句先列措施。','這句概括個人第一道防線，未列攝像頭貴重物品資料。'],
  ['這句列個人防護行動，原句解釋其對機會型犯罪為何有效。','這句把警覺概括成第一道防線，未用 because 和 if 分析機制。','這句說制度薄弱使個人防護有限，非日常習慣的局部作用。'],
  ['這句只列攝像頭等習慣，原句總結為第一道防線。','這句分析容易下手目標，未說警察不能在場的適用時刻。','這句轉向個人不應主責，原句仍承認個人警覺的作用。'],
  ['這句在引言已選政府主責，原句在主體段明確轉入。','這句總結個人防線，未用 However 指出不足。','這句列政府可建的制度，原句先提出不能主要依賴個人。'],
  ['這句先說個人不能主責，未列政府可建立的具體系統。','這句指出差環境下個人能力有限，未列警務法律照明等。','這句用家庭鎖門作個體能力例子，原句講政府制度。'],
  ['這句列政府系統，未用 If 條件展示制度弱時的個人上限。','這句家庭例子展示公共問題，原句先提出社區條件。','這句已概括需協調公共行動，未分析個人防護的限度。'],
  ['這句說差社區條件下個人防護有限，未用家庭可做不能做對照。','這句說需公共行動，原句先列家庭不能控制的具體問題。','這句結論再分配責任，原句是主體段的家庭例子。'],
  ['這句列政府可建的系統，未說超私人能力的問題需公共行動。','這句列家庭無法控制的公共風險，原句抽成一般原則。','這句結論承認個人措施，原句仍概括公共統籌需求。'],
  ['這句是個人責任的主體段，原句在結論重申其有限作用。','這句提出政府不能依賴個人，未公平承認合理自保。','這句下一句解釋犯罪公共性，原句先總結雙方責任。'],
  ['這句引言以權力資源說政府主責，原句從犯罪公共性再說一次。','這句說需協調公共行動，未用 Since 比較社會問題與個人不便。','這句結論先承認個人自保，原句再解釋國家為何主責。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分個人可做的防護，再看哪些犯罪問題需要政府統籌。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目比較預防犯罪由誰負主要責任？',[
    '個人應保護自己，與國家應建立公共安全系統',
    '只比較不同攝像頭的價錢與外觀設計',
    '只比較兩種街燈顏色與電費多少',
    '只比較家庭門鎖品牌與警車速度',
  ],'作者承認個人謹慎，但認為政府應主責。'),
  {type:'multi',prompt:'選出作者對兩方責任的完整看法',detail:'選兩項，再按「確認」。',options:[
    '個人可用日常謹慎選擇降低自身風險',
    '政府才有權力資源處理大規模公共問題',
    '個人鎖門即可完全消除任何有組織犯罪',
    '政府既有警察，個人便不用做任何防護',
  ],correct:[0,1],why:'個人是第一道防線，政府負責無法靠私人處理的制度和社會問題。'},
];
const route=[sequence('依文章次序排列防罪責任論證',[
  ['引言定責任份量','個人應謹慎；政府有權力資源應主責。'],
  ['個人防線','攝像頭、收好貴重物品、網上資料謹慎分享。'],
  ['政府系統','警務法律照明教育支援，以及處理社區風險。'],
  ['結論分清範圍','個人合理自保不能取代公共統籌。'],
],'範文承認個人可減風險，但以制度能力與公共性決定主責。')];
const evidence=[
  quiz('攝像頭、藏好貴重物品和慎分享資料為何有用？',[
    '可減少罪犯容易找到的下手機會',
    '可保證所有城市從此再也沒有犯罪',
    '可取代所有警察、法律及街道照明',
    '可讓個人完全控制有組織犯罪',
  ],'範文說許多犯罪會利用容易下手的機會。'),
  quiz('個人警覺何時特別像「第一道防線」？',[
    '警察不可能在每個日常情況親身在場時',
    '政府已解決所有公共安全問題之後',
    '所有人都不再需要保護個人資料時',
    '個人能獨自制定全國刑事法律時',
  ],'警察不能無處不在，個人可在當下先採取防護。'),
  quiz('政府有哪些個人無法自行建立的安全手段？',[
    '警務、法律、街燈、公共教育和社會支援',
    '只有家中的門鎖與屋主的保安攝像頭',
    '只有個人衣物顏色與網上密碼長短',
    '只有家庭自己設定的單一出門時間',
  ],'原文列政府可建立維持的公共系統。'),
  quiz('差社區條件下，為何個人只能有限自保？',[
    '執法、監察及青年機會不足超出個人可控範圍',
    '只要個人鎖門，所有公共空間便完全安全',
    '每一名居民都可自行指揮全國警察資源',
    '所有有組織犯罪都只在私人家中發生',
  ],'公共環境弱會使個人防護遇到上限。'),
  quiz('家庭每晚鎖門的例子說明甚麼界線？',[
    '家庭能做私人防護，卻不能控制公共犯罪與社會誘因',
    '家庭一旦鎖門，就能保證整個社區不再有犯罪',
    '家庭能自行立法並處理所有公共空間風險',
    '鎖門完全沒有用途，個人因此不用做任何事',
  ],'例子把有用的私人措施與不能靠私人處理的問題分開。'),
  quiz('為何需要「協調公共行動」？',[
    '有組織犯罪、公共空間和社會問題需跨機構處理',
    '只因居民希望完全停止所有個人謹慎',
    '因為一個家庭能獨自控制全部社區問題',
    '因為攝像頭可以直接取代法律與社會支援',
  ],'公共問題需要有權力資源的主體統籌。'),
  quiz('結論如何兼顧兩方？',[
    '個人仍要合理自保，政府主責處理整體社會問題',
    '完全免除個人任何謹慎，只談私人門鎖',
    '把全部犯罪責任放在受害者身上',
    '只靠政府宣傳，不建任何實際公共系統',
  ],'作者區分個人第一道防線與政府的主要責任。'),
];
const logic=[
  sequence('個人防護為何有用但有限',[
    ['責任觀','個人可透過謹慎選擇降低自身風險。'],
    ['具體措施','攝像頭、貴重物品與網上資料謹慎處理。'],
    ['機會機制','罪犯尋找容易下手的目標。'],
    ['第一道防線','警察不能事事在場，個人警覺可即時作用。'],
  ],'作者公平承認個人措施能減少機會性風險，但不把它說成全面防罪。'),
  sequence('政府為何應負主要責任',[
    ['制度能力','政府可建立警務法律照明教育與支援。'],
    ['環境不足','執法監察青年機會不足時，個人只能有限自保。'],
    ['家庭界線','鎖門不能控制有組織犯罪與公共空間。'],
    ['公共統籌','跨社會的問題需要協調行動。'],
    ['責任結論','個人合理防護不能取代政府主責。'],
  ],'政府主責理由不是個人無用，而是有些問題只可由公共制度處理。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('住宅區屢有小偷伺機偷取門外包裹，居民商量如何先降低個人風險。','哪項最貼近範文的個人第一道防線？',[
    '收好包裹並留意出入口，減少容易下手的機會',
    '只加裝門外攝影機，不處理包裹長時間暴露',
    '只提醒鄰居提防，不安排收件或出入口管理',
    '只等警方增加巡邏，不採取可行的家庭防範',
  ],['原文說罪犯會利用易下手機會，個人可作合理防護。','鏡頭可留紀錄，但包裹暴露仍是容易下手的機會。','提醒有用，仍須具體保管包裹與留意出入口。','警方巡邏重要，居民也能先收妥門外物品。'],[3,4,5,6],'範文以藏好貴重物品等措施降低機會型犯罪風險。'),
  transfer('家長常在網上公開孩子的住址與行程，學校想提出一項可由家庭直接採取的措施。','哪項最符合範文的網上謹慎例子？',[
    '少公開住址行程，分享前考慮誰會看到',
    '只更改貼文語氣，不刪去住址與孩子行程',
    '只限制陌生留言，不檢查公開資訊本身',
    '只教孩子上網安全，不改家長公開資料習慣',
  ],['原文列個人資料分享時保持謹慎。','語氣改變不會減少住址與行程的資訊暴露。','留言限制有用，但公開內容本身仍可被看到。','孩子教育重要，但家長也要改分享習慣。'],[4,5,6],'範文把網上資料謹慎分享列為個人可直接做到的防護。'),
  transfer('一條街路燈壞了許久，附近居民都鎖好門，但夜間公共空間仍讓人擔心。','哪項最能運用範文的政府制度理由？',[
    '政府修路燈，私人鎖門不能代替公共安全',
    '居民各自鎖門，不向政府反映公共照明問題',
    '只派防罪宣傳單，不修壞掉的街道路燈',
    '只要求夜間少外出，不改善公共空間安全',
  ],['街燈與公共空間屬政府可維持的制度。','鎖門屬個人防範，失修路燈仍需公共修繕。','宣傳不能代替修復失效照明。','少外出只是迴避，未改善公共空間。'],[8,9,10,11],'範文列街道照明為政府責任，家庭鎖門不能控制公共空間。'),
  transfer('某區青少年缺少發展機會，居民說只要每戶安裝攝像頭便能解決所有犯罪誘因。','哪項回應最符合範文？',[
    '攝像頭減部分風險，青年機會仍靠公共政策處理',
    '只增攝像頭，不提供青年培訓與發展機會',
    '只辦青年活動，不檢查眼前財物保護措施',
    '只責成住戶自保，不討論公共政策的角色',
  ],['原文把個人措施與社會誘因分開，後者需公共行動。','攝像頭減少部分機會，不能提供長期青年發展。','青年活動有用，但仍須合理保護眼前財物。','住戶自保不足以處理公共政策可以改善的誘因。'],[4,8,9,10,11],'範文說青年機會不足時個人防護有限，政府有社會支援資源。'),
  transfer('店主遇上跨區有組織盜竊，已裝保安鏡頭，仍無法追查整個集團。','哪項最能轉用家庭鎖門的比喻？',[
    '私人保安有用，跨區盜竊仍須警方協調',
    '只增加店內鏡頭，不安排跨區的警方合作',
    '只報案一次，不追查組織盜竊的多地線索',
    '只在本店加鎖，不和其他受害店舖分享資料',
  ],['原文說家庭可鎖門，不能控制有組織犯罪。','店內鏡頭有用，跨區集團仍須公共機構協調。','一次報案不足以追查跨區組織。','加鎖有用，但缺少跨店資訊及警方合作。'],[10,11,12],'範文區分私人的鎖門與政府處理有組織犯罪的能力。'),
  transfer('社區安全會議有兩方：一方要居民自保，另一方要政府加強警務和社會支援。','哪項立場最忠於範文的權衡？',[
    '居民應謹慎，政府仍負公共防罪主責',
    '只請居民自保，不處理執法及社會支援',
    '只加強警務，不教居民減低日常機會風險',
    '只討論責任誰較大，不提出兩方可行措施',
  ],['作者承認兩方各有角色，主責由政府承擔。','居民措施只是第一防線，公共執法和支援仍需政府。','警務重要，但居民也可減少日常可乘之機。','只爭責任沒有具體自保與公共行動。'],[1,2,6,8,12,13],'範文引言和結論都主張個人自保，政府主責。'),
  transfer('一位居民說「警方無法站在我家門口，所以防罪完全只能靠自己」。','哪項回應最能保留範文兩層邏輯？',[
    '個人警覺是第一防線，政府仍須整體防治',
    '只提高家中警覺，不問街道公共照明或巡邏',
    '只要求政府巡邏，不教居民保護日常財物',
    '只看到警察不在門前，便忽略整體防罪系統',
  ],['警察不能在每處，但政府仍負公共系統責任。','個人警覺有用，但街道安全還需公共系統。','政府巡邏重要，家庭亦可合理保護財物。','警察不在每戶門前不等於政府沒有整體責任。'],[6,7,8,10],'範文先稱個人警覺第一道防線，後稱政府主責。'),
  transfer('城市報告把犯罪稱為「每位居民自己的小麻煩」，沒有評估公共空間與組織犯罪。','哪項修訂最能轉用結論的公共性判準？',[
    '把犯罪視作社會問題，將公共防治列為政府主責',
    '只教每戶鎖門，不分析公共空間的犯罪機會',
    '只說政府要負責，不考慮居民可做的合理自保',
    '只計個別案件，不問有組織犯罪如何防治',
  ],['原文以 social problem rather than personal inconvenience 定主責。','鎖門只處理私人空間，漏了公共與組織犯罪。','政府主責不代表居民毫無自保作用。','個案統計不足以分析組織犯罪的防治。'],[8,10,11,13],'範文末句說犯罪是社會問題，不只個人不便，故國家應主責。'),
  transfer('市政府想降低夜間犯罪：有人提倡只派宣傳單，卻不修路燈、不改善執法。','哪項更符合範文的制度清單？',[
    '教育以外，也修路燈並改善夜間執法',
    '只修路燈，不改善夜間犯罪的執法處理',
    '只增加警務，不處理失修街燈的環境風險',
    '只教育居民，不改公共照明或執法安排',
  ],['原文列警務照明教育等需共同維持。','街燈有用，但執法仍需配合。','執法有用，失修街燈仍提供夜間機會。','教育不足以代替公共照明與執法。'],[8,9,11],'範文列有效警務、街燈、教育與支援，並要求協調公共行動。'),
  transfer('社區課程要教居民防罪，但不想把所有責任推給潛在受害者。','哪項課程目標最符合作者立場？',[
    '教合理自保，也說明政府須處理制度與社會成因',
    '只教住戶看管財物，不說明政府公共責任',
    '只強調政府執法，不教居民合理自保方法',
    '只討論受害者行為，不分析社會與制度成因',
  ],['原文個人與政府角色並存，政府承擔主要責任。','居民自保重要，但不能把制度成因都交給受害者。','公共執法重要，仍應教居民合理措施。','受害者行為不是所有犯罪的制度或社會原因。'],[2,3,6,8,10,12,13],'範文說個人合理防護不能取代政府的公共角色。'),
];
export default {key:'discuss-both-views:11',meta:{topic:'預防犯罪應由個人還是政府負主要責任',summary:'個人謹慎可減少機會性風險，但警務法律照明與社會支援需政府統籌，故政府應主責。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
