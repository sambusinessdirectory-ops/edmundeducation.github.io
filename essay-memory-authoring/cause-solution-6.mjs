// Individually reviewed Cause/Solution 6: why city crime is higher and what lowers it.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-6-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:6'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In many places, cities have more crime than villages and small towns.',
  'This is not just because people in cities follow the law less. Instead, living in a city can make crime easier to do and harder to stop.',
  'So the best way to deal with this is to cut both the chances to commit a crime and the problems that may push people to do so.',
  'One main reason is that many people in cities do not know each other.',
  'In a small village, people usually know each other, so they notice unusual actions more easily and feel pressure from neighbours to behave.',
  'In a big city, however, people who break the law can hide among the many people around them.',
  'For example, stealing from someone’s pocket is easier at a crowded station than at a village market, because it may be hard for the person, people who saw it or police to know who did it.',
  'One more reason is the big gap between rich and poor people.',
  'In cities, rich and poor people often live close together: expensive homes may be only a few streets from homes with too many people.',
  'When people feel left out of the wealth they see around them, some may steal, sell drugs or join gangs, especially if they cannot see a legal way to do better.',
  'To lower crime in cities, governments should first plan public places so it is harder to break the law there.',
  'Brighter lights, buses people can count on, police officers people can see in the area and public places kept in good condition can make areas feel safer and better looked after.',
  'For example, people are much less likely to sell drugs or use violence in a park that is clean, well used and has good lighting.',
  'At the same time, stopping crime takes more than watching people.',
  'Cities need better help for young people, education people can afford, training for jobs and help for families having a hard time.',
  'If young people can see a real way to find work and feel part of their community, crime may seem less useful and less appealing.',
  'To sum up, crime is often higher in cities because many people do not know one another and the gap between rich and poor is bigger.',
  'Lowering it needs both safer public places and long-term spending to help people.',
];
const vocabulary=[
  [['parts of the world','places','世界各地'],['record more crime','have more crime','錄得更多罪案']],
  [['not simply','not just','不只是'],['urban residents','people in cities','城市居民'],['less law-abiding','follow the law less','較不守法'],['rather','Instead','相反'],['commit','do','犯下'],['prevent','stop','預防']],
  [['most effective response','best way to deal with this','最有效的應對'],['reduce','cut','減少'],['opportunities for crime','chances to commit a crime','犯罪機會'],['pressures','problems','壓力']],
  [['One major reason','One main reason','其中一個主要原因'],['anonymity of urban life','many people in cities do not know each other','城市生活的匿名性']],
  [['rural community','village','鄉村社區'],['tend to','usually','通常'],['suspicious behaviour','unusual actions','可疑行為'],['more visible','notice','更容易被看見'],['social pressure','pressure from neighbours','社會壓力']],
  [['large city','big city','大城市'],['by contrast','however','相比之下'],['offenders','people who break the law','犯罪者'],['disappear into the crowd','hide among the many people','消失在人群']],
  [['pickpocketing','stealing from someone’s pocket','扒竊'],['packed','crowded','擠迫'],['victims','the person','受害者'],['witnesses','people who saw it','目擊者'],['identify the offender','know who did it','辨認犯罪者']],
  [['Another reason','One more reason','另一個原因'],['inequality','big gap between rich and poor people','不平等']],
  [['bring wealth and poverty face to face','rich and poor people often live close together','使貧富並置'],['luxury apartments','expensive homes','豪華住宅'],['overcrowded housing','homes with too many people','擁擠住房']],
  [['feel excluded','feel left out','感到被排除'],['prosperity','wealth','繁榮'],['turn to theft','steal','轉向盜竊'],['drug dealing','sell drugs','販毒'],['gang activity','join gangs','幫派活動'],['legal routes to success','a legal way to do better','合法的成功途徑']],
  [['reduce urban crime','lower crime in cities','減少城市犯罪'],['design cities','plan public places','設計城市'],['offending more difficult','harder to break the law','令犯罪更困難']],
  [['Better lighting','Brighter lights','改善照明'],['reliable public transport','buses people can count on','可靠公共交通'],['visible community policing','police officers people can see in the area','可見社區警務'],['well-maintained public spaces','public places kept in good condition','保養良好的公共空間'],['reduce the sense that certain areas are unsafe or uncontrolled','make areas feel safer and better looked after','減少某些地區不安全或失控的感覺']],
  [['For instance','For example','例如'],['properly lit','has good lighting','照明充足'],['far less likely','much less likely','可能性低得多'],['drug dealing','sell drugs','販毒'],['violence','use violence','暴力']],
  [['prevention','stopping crime','預防犯罪'],['go deeper than surveillance','takes more than watching people','不能只靠監控']],
  [['stronger youth services','better help for young people','更完善青少年服務'],['affordable education','education people can afford','可負擔的教育'],['job training','training for jobs','職業培訓'],['families under pressure','families having a hard time','承受壓力的家庭']],
  [['realistic path into work','real way to find work','實際的就業道路'],['belonging','feel part of their community','歸屬感'],['less attractive','less appealing','較不吸引']],
  [['In conclusion','To sum up','總結'],['urban areas','cities','城市地區'],['anonymity','many people do not know one another','匿名性'],['sharper social inequality','gap between rich and poor is bigger','更尖銳的社會不平等']],
  [['Reducing it','Lowering it','減少犯罪'],['practical safety measures','safer public places','實際安全措施'],['long-term social investment','long-term spending to help people','長遠社會投資']],
];
export {original,simple,vocabulary};

// Fixed links reconstruct the exact source; each use explanation names a transferable job.
function frame(i,links,labels,meaning,usage,example,tag,job){
  const text=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing source link ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:text.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
  if(cursor<text.length)parts.push({text:text.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched labels ${i+1}`);
  return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
  frame(0,['In many parts of the world, '],['多地可觀察到的情況'],
    '先限定觀察範圍，再直接提出城市與鄉村的犯罪數量對比。',
    '要提出一個跨地區可見的趨勢，但不聲稱它在每一處都成立時。',
    'In many parts of the world, buses are busier in cities than in small towns.','In many parts of the world','限定一項跨地區觀察'),
  frame(1,['This is not simply because ','; rather, '],['需要避免的單一解釋','較有說服力的結構原因'],
    'not simply because 排除把城市居民說成較不守法的簡化解釋；rather 引出城市環境的條件。',
    '常見說法把問題歸咎個人品格，現在要轉向更具體的環境或制度原因時。',
    'This is not simply because pupils are lazy; rather, the school has too few teachers.','not simply because...rather','修正單一解釋並提出另一成因'),
  frame(2,['The most effective response is therefore to ',' both ',' and '],['要做的主要行動','第一類需要處理的因素','第二類需要處理的因素'],
    'therefore 承接成因；both...and 指出應同時減少犯罪機會與推人犯罪的壓力。',
    '問題有兩條不同成因，需要用同一個方案方向同時處理兩邊時。',
    'The most effective response is therefore to improve both bus frequency and road safety.','therefore...both...and','把兩類成因合成雙軌應對'),
  frame(3,['One major reason is '],['第一項主要原因'],
    '直接宣布第一項成因：城市中人與人較不相識，為後面的監察差異作準備。',
    '主體段開始解釋現象，先明確標出一個主要原因時。',
    'One major reason is poor access to safe transport.','One major reason is','明確引出首項成因'),
  frame(4,[', so '],['鄉村的人際條件','可疑行為更易被看見的結果'],
    'so 把彼此認識的社區條件連到行為較易被察覺及社群約束。',
    '已描述一種環境特徵，要說明它如何改變人們的行為或被發現的機會時。',
    'Neighbours often know each other, so unusual activity is noticed quickly.','so','把已描述的條件推到直接結果'),
  frame(5,[', by contrast, '],['另一個不同的環境','與前述環境相反的情況'],
    'by contrast 由較熟悉的鄉村轉到城市，突出犯罪者更易藏身人群。',
    '前一句已說明第一個場景，現在要精簡展示另一場景的相反結果時。',
    'At a small shop, staff know customers; at a large station, by contrast, nobody knows every face.','by contrast','轉向另一場景的相反情況'),
  frame(6,['For example, ',', because '],['可觀察的城鄉對比例子','這個差異如何產生'],
    'For example 給車站扒竊的具體情況；because 補上難以辨認犯罪者的原因。',
    '已提出較抽象的環境原因，需要用一個對比例子和具體機制證明它時。',
    'For example, theft is easier in a crowded hall, because staff cannot see every visitor.','For example...because','用具體例子加上成因解釋'),
  frame(7,['Another reason is '],['第二項獨立原因'],
    'Another reason is 把分析從匿名性轉到貧富差距，開出另一條成因鏈。',
    '第一項原因已解釋清楚，現在要標示另一項不同的原因時。',
    'Another reason is the lack of affordable housing.','Another reason is','引入不同的第二項成因'),
  frame(8,[': '],['城市貧富並置的概括觀察','讓讀者看見差距的具體景象'],
    '冒號後用豪宅與擁擠住房只隔幾條街，把抽象的不平等變成可想像的畫面。',
    '一個概括判斷需要緊接一個具體、可見的例子來說明時。',
    'The area has a sharp housing divide: new towers stand beside cramped flats.','colon for example','用具體景象展開概括判斷'),
  frame(9,['When ',', some may ',', especially if '],['人們感到被排除的情況','部分人可能採取的行動','令風險升高的補充條件'],
    'When 先說被排除的感受；some may 保留可能性；especially if 補上合法途徑受阻的條件。',
    '要解釋一種行為在甚麼條件下可能增加，而不把整個群體都說成會犯罪時。',
    'When workers cannot find stable jobs, some may move away, especially if local training is unavailable.','When...some may...especially if','指出有條件且非必然的行為'),
  frame(10,['To reduce ',', governments should first '],['要降低的問題','政府首先可做的實際行動'],
    'To reduce 先定目標；should first 明確提出政府在城市設計方面可優先做甚麼。',
    '分析完原因後，開始提出由政府執行的第一項具體解方時。',
    'To reduce road injuries, governments should first repair dangerous crossings.','To reduce...should first','把目標接到優先的政府行動'),
  frame(11,[' can all reduce '],['多項互補的環境改善','要降低的不安全感'],
    'can all reduce 把照明、交通、警務和公共空間四項措施連到同一個安全效果。',
    '數個不同措施都作用於同一類問題，需要列出它們共同的效果時。',
    'Clear signs, trained staff and brighter lights can all reduce confusion at night.','can all reduce','總結多項措施的共同效果'),
  frame(12,['For instance, ',' is far less likely to '],['具備保護條件的具體場所','在該條件下較不可能發生的問題'],
    'For instance 給乾淨、有人使用且明亮的公園；far less likely 保留降低風險而非絕不犯罪。',
    '提出環境設計後，要用具體場所說明它如何使問題較不可能發生時。',
    'For instance, a busy library is far less likely to remain unnoticed when vandalism occurs.','far less likely to','用例子表達風險降低而非歸零'),
  frame(13,['At the same time, ',' must go deeper than '],['真正的預防工作','不足以單獨解決的表面方法'],
    'At the same time 轉向另一類解方；go deeper than 指出只監控不足以處理深層壓力。',
    '已提出可見的安全措施，但問題仍有社會根源，需要轉向更深層的預防時。',
    'At the same time, school support must go deeper than stricter rules.','must go deeper than','從表面控制轉向深層支援'),
  frame(14,[' need '],['負責改善的城市','多項處理根本壓力的服務'],
    'need 後並列青少年服務、教育、訓練及家庭支援，分別回應機會不足的壓力。',
    '要提出一套處理深層成因的資源，而不是只增加監控時。',
    'Schools need trained teachers, safe rooms and support for struggling pupils.','need plus list','列出處理深層問題的互補資源'),
  frame(15,['If ',', crime becomes '],['年輕人看得見工作與歸屬的條件','犯罪吸引力的變化'],
    'If 把工作機會和歸屬感作為條件；後半句說犯罪較不吸引，也較不必要。',
    '提出社會支援後，要解釋它在甚麼條件下能減弱犯罪動機時。',
    'If teenagers have a safe place to meet, crime becomes less attractive.','If...crime becomes','把機會改善接到動機變化'),
  frame(16,['In conclusion, ',' because '],['城市犯罪較高的總結','前文分析的兩個主要成因'],
    'In conclusion 收束問題；because 把城市較高的犯罪率歸於匿名性與不平等。',
    '結尾要直接回答「為甚麼」，並濃縮正文的兩項已分析原因時。',
    'In conclusion, delays are worse in winter because roads are icy and buses are fewer.','In conclusion...because','在結尾濃縮現象和主要成因'),
  frame(17,[' requires both ',' and '],['要改善的問題','短期可見的安全措施','長期處理根源的投資'],
    'both...and 把較立即的安全措施與長遠社會投資並列，呼應兩類成因。',
    '解方既要立即降低風險，也要長期處理根源，需要同時概括兩類措施時。',
    'Reducing delays requires both clearer signs and long-term investment in buses.','requires both...and','概括短期與長期的雙軌解方'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,
  wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；它沒有用「${target.tag}」${target.job}。`),
  answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的成因與解方次序，依次選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('範文如何回答城市犯罪率較高的原因？',[
    '城市匿名性增加犯案機會；明顯貧富差距又加重部分人的壓力',
    '作者認為每位城市居民都天生較不守法，沒有環境因素',
    '城市犯罪只由公園的數量決定，與收入或人際關係無關',
    '鄉村犯罪一定較高，只是所有官方數據都沒有記錄',
  ],'文章先排除單純指責城市居民的說法，再分析匿名性與不平等。'),
  {type:'multi',prompt:'哪兩類行動合起來才是範文的完整解方？',detail:'選兩項，再按「確認」。',options:[
    '改善照明、公共空間、交通與社區警務，減少犯案機會',
    '加強青少年服務、教育、職訓與家庭支援，減少深層壓力',
    '只增加監控，完全不處理工作機會或社會排除',
    '只說城市居民應守法，不改變任何環境或服務',
  ],correct:[0,1],why:'範文一方面使犯案更困難，另一方面改善使部分人走向犯罪的社會條件。'},
];
const route=[sequence('先找兩類成因，再對應兩類解方',[
  ['引言：城市較高犯罪率','問題不是簡單因為城市人較不守法；需要處理機會和壓力。'],
  ['主體一：匿名性與不平等','人群使犯罪者難被辨認；貧富近在咫尺與合法機會受阻可增加壓力。'],
  ['主體二：環境與社會投資','照明、交通、警務和公園管理降低機會；青年服務、教育、職訓和家庭支援減少壓力。'],
  ['結尾：回扣兩問','歸納匿名性與不平等，並提出實際安全措施和長遠社會投資。'],
],'兩條成因鏈分別對應眼前的場所設計和較長期的社會支援。')];
const evidence=[
  quiz('為甚麼鄉村可疑行為較容易被察覺？',[
    '小社區的人較常彼此認識，異常行為因而較顯眼',
    '鄉村所有居民每天都由同一位警員逐一盤問',
    '鄉村市場一定沒有人，因此不存在任何目擊者',
    '鄉村人從來不需要透過社群了解彼此的行為',
  ],'範文把彼此認識與較易察覺可疑行為連起來。'),
  quiz('火車站扒竊的例子證明甚麼？',[
    '在人多的地方，受害者與目擊者較難認出犯罪者',
    '車站的每宗扒竊都必然被警察在同一分鐘破案',
    '村莊市場的所有人都互不認識，所以辨認更困難',
    '人多時每位目擊者都能立即看清每個人的身份',
  ],'例子把城市匿名性落到擠迫場景和辨認困難的具體機制。'),
  quiz('文章如何呈現城市的不平等？',[
    '豪華住宅與擁擠住房可能只隔幾條街',
    '城市只有同一類住宅，居民收入必然完全相同',
    '不平等只存在於鄉村，與城市住房距離無關',
    '所有城市的豪宅都必然位於不同國家',
  ],'豪宅與擁擠住房的近距離對照使差距具體可見。'),
  quiz('作者有否聲稱貧窮的人都會犯罪？',[
    '沒有；他用 some may 指出部分人在被排除且合法途徑受阻時可能轉向犯罪',
    '有；他說每一位較窮居民都必然參與幫派活動',
    '有；他把所有青年不論處境一概視為罪犯',
    '沒有；因為他完全否認貧富差距可能帶來壓力',
  ],'some may 和 especially if 都保留條件與可能性，不把一整個群體定罪。'),
  quiz('公園例子與哪類解方相連？',[
    '把公園保持乾淨、有人使用和照明充足，降低它成為犯罪場所的機會',
    '封閉所有公園，使居民從此沒有可使用的公共空間',
    '只增加公園名字的字數，不改善照明或管理',
    '讓公園長期失修，因為荒廢會自動阻止犯罪',
  ],'作者用公園具體展示公共空間管理如何減少犯案機會。'),
  quiz('為何只靠監控並不足夠？',[
    '監控難以單獨改善青年工作機會、教育和家庭壓力',
    '監控已能保證所有青年立即取得穩定工作',
    '公園照明會自動取代所有教育與職業培訓',
    '文章認為城市完全不應有任何可見安全措施',
  ],'第二層方案處理使犯罪較吸引或較必要的深層條件。'),
];
const logic=[
  sequence('主體一：兩種不同的城市犯罪成因',[
    ['城市匿名性','陌生人較難辨認可疑行為，犯案者較易混入人群。'],
    ['車站扒竊例子','擠迫場景使受害者、目擊者和警察較難辨認人。'],
    ['城市貧富近在咫尺','豪宅可能與擁擠住房只隔幾條街。'],
    ['受排除與合法機會不足','部分人可能因此轉向盜竊、販毒或幫派活動。'],
  ],'第一條鏈解釋犯案機會；第二條鏈解釋使部分人受壓的社會條件。'),
  sequence('主體二：立即降低機會，同時長期減輕壓力',[
    ['城市設計降低眼前機會','照明、交通、社區警務與保養良好的公共空間使場所更安全。'],
    ['公園例子展示具體效果','乾淨、有人使用且明亮的公園較不可能成為販毒或暴力場所。'],
    ['預防不能只靠監控','青少年服務、教育、職訓和家庭支援處理較深層原因。'],
    ['工作與歸屬感減弱動機','年輕人看見可行道路時，犯罪較不吸引，也較不必要。'],
  ],'保留短期場所措施與長期社會投資的不同功能。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一所小學的職員認識大部分學生；另一所很大的學校，走廊人多，陌生人較容易混入。','哪項分析最準確轉用範文的「匿名性」機制？',[
    '大校較難認出陌生人，須改善入口及職員可見度',
    '只增加巡邏次數，不檢查大校入口和走廊的可見度',
    '只比較兩校學生人數，不問職員能否辨認陌生人',
    '只要求學生出示證件，不改善人多時入口監察',
  ],['保留熟悉程度、辨認難度與環境安排的因果鏈。','巡邏可能有用，但此題還須看大校入口和走廊的匿名性。','人數本身不是完整機制，關鍵是職員能否辨認陌生人。','證件措施有用，但仍須處理人多時的可見度與監察。'],[1,3,4,5],'原文把城市匿名性與犯罪者容易藏在人群連起來，沒有說城市人天生較不守法。'),
  transfer('兩個車站都發生失竊；甲站擁擠又缺少清楚視線，乙站較小且職員熟悉常客。','哪項比較最符合範文的扒竊例子？',[
    '甲站難認犯案者，改善視線及職員配置可減風險',
    '只說甲站失竊較多，不查擁擠與視線如何減弱辨認',
    '只增加告示牌，不處理甲站職員看不清人群的問題',
    '只比較兩站面積，不分析常客熟悉度與人群流動',
  ],['只推斷辨認難度與可改善條件，不宣稱罪案必然發生或消失。','只描述差異，未解釋擁擠與視線怎樣妨礙辨認。','告示牌未補上甲站的視線和職員配置問題。','面積不是唯一重點，還要看人群流動與熟悉度。'],[4,5,6],'原文用擠迫車站與鄉村市場比較，指出難以辨認犯罪者的機制。'),
  transfer('某區新建豪華住宅，幾條街外卻有擠迫住房；青年又難找到合法工作。','哪項論證最忠於範文的不平等分析？',[
    '貧富差距加上工作受阻，可能增加部分人的壓力',
    '只看豪宅和擠迫住房的距離，不問合法工作機會',
    '把青年求職受阻視為孤立問題，不分析貧富差距',
    '只統計高收入住戶，不問低收入居民的可行選擇',
  ],['保留可見差距、受排除感與有條件的可能性。','住房對比有用，但合法工作受阻也是範文因果鏈的一環。','只談求職，漏了周圍顯眼的貧富差距。','高收入數量不能代替對低收入居民選擇的分析。'],[8,9],'原文先以豪宅和擠迫住房並置，再用 some may 說明合法道路受阻時的風險。'),
  transfer('一座公園夜間照明不足、設施失修，居民很少使用；市政府只能先改一批容易執行的措施。','哪項方案最接近範文的第一層解方？',[
    '改善照明維修和使用率，讓公園更為安全',
    '只增設閉路電視，不修照明和已失修的公園設施',
    '只維修設施，不改善昏暗角落或鼓勵居民使用',
    '只延長開放時間，不處理夜間照明與維護',
  ],['直接處理場所容易藏匿和無人使用的條件。','閉路電視有用，但沒有修正照明與失修設施。','維修有用，卻漏了夜間照明和居民使用率。','延長時間不會自動改善昏暗與失修的環境。'],[10,11,12],'原文以乾淨、有人使用、照明充足的公園示範環境設計如何降低風險。'),
  transfer('某市已增加巡邏，卻仍有許多青年缺乏職訓、家庭支援和可進入的工作。','下一步應如何轉用範文「監控以外」的思路？',[
    '保留安全措施，同時補青年職訓與家庭支援',
    '保留巡邏，卻停止青年職訓和家庭支援服務',
    '只補青年工作機會，不理已知的家庭支援缺口',
    '只增加巡邏班次，假設這能改善求職困難',
  ],['把監控與處理深層壓力的服務配合。','範文要求安全措施之外加入職訓與家庭支援。','工作機會有用，但題目還明示家庭支援缺口。','巡邏有助眼前監察，無法單獨改善求職困難。'],[13,14,15],'原文說預防須超越監控，讓青年看見工作和歸屬感的可行道路。'),
  transfer('一個住宅區想降低反覆破壞設施的行為；提案有照明維修，也有放學後活動和技能課程。','哪項概括最能保留範文的雙軌設計？',[
    '照明維修減眼前風險，職訓改善長期選擇',
    '只做照明維修，不處理青年缺乏合法工作選擇',
    '只辦技能課程，卻放任眼前失修區域不管',
    '把兩層措施混為一談，不說各自處理甚麼風險',
  ],['清楚分開場所風險與較長期的機會問題。','照明維修處理眼前環境，未處理青年長期選擇。','職訓有助長期選擇，但眼前失修風險仍在。','雙軌措施須說清各自作用，不能只並列名詞。'],[2,10,13,14,17],'原文結尾把實際安全措施與長遠社會投資並列。'),
  transfer('一間圖書館失物增加；有人只說「讀者品格變差」，但圖書館剛擴大到人多而入口無人看管。','哪項分析方法最像範文引言？',[
    '別只怪品格，先查人流和入口是否增加失物風險',
    '先檢查入口人流，不問失物在哪些時段出現',
    '只做品格教育，不查看入口是否有人管理',
    '只增設告示，不分析人多和難辨認的環境',
  ],['修正單一品格解釋，轉向可檢驗的環境條件。','人流重要，但失物時段能幫助檢查入口監察的實際漏洞。','品格教育不是對剛擴大且入口無人看管的分析。','告示未處理人多與難以辨認的機制。'],[0,1,5],'原文先說城市人未必較不守法，再指出城市生活創造較易犯案的條件。'),
  transfer('一個青年中心提供職訓，但居民問這與安全有何關係。','哪項回答完整呈現範文的長期因果鏈？',[
    '職訓助青年找到工作與歸屬，犯罪吸引力或下降',
    '職訓可能改善技能，但與合法工作連結仍須建立',
    '只辦一次課程，便視為參加者已有穩定職位',
    '只強化巡邏，忽略青年被排除及缺少選擇',
  ],['把服務、可行道路和動機改變連起來，並保留可能性。','技能是第一步，但還須連到合法工作與歸屬感，才解釋安全效果。','一節課不能保證每人取得穩定職位。','巡邏沒有處理被排除和缺少工作選擇的長期原因。'],[9,14,15],'原文把青年服務和職訓連到工作、歸屬感與較弱的犯罪動機。'),
  transfer('一個港口新區的人口增長後，偷竊報案增加；居民想用一個原因解釋所有案件。','哪項較符合範文的審慎寫法？',[
    '分查匿名性與不平等對不同案件的可能影響',
    '先看人流使人難辨認，卻不問不平等是否也有影響',
    '只看新居民人數，不查具體案件和合法工作機會',
    '只看貧富差距，不分析港口人群的匿名性風險',
  ],['保留兩條不同原因，避免以群體標籤取代機制。','人流匿名性可能重要，但不應排除其他案件中的不平等。','居民人數不等於個別案件成因，還需檢查條件。','只談不平等，漏了港口人群流動與難辨認。'],[1,3,7,16],'原文以城市匿名性和較尖銳的不平等概括較高犯罪率。'),
  transfer('一篇城市安全文章前文已分析人群難辨認與合法工作不足，結尾需要同時回應原因和方法。','哪組結尾最貼近範文？',[
    '總結匿名性與不平等，再提安全與社會投資',
    '只提改善照明，不回扣青年工作機會不足',
    '只提職訓服務，不回扣人群難辨認的風險',
    '只概述兩類原因，卻沒有相配的安全和社會投資',
  ],['按題目兩問收束，並對應兩類原因與兩類措施。','只提環境措施，漏了工作機會不足這一原因。','只提社會措施，漏了難辨認的即時風險。','總結原因後，還須提出相配的安全及社會投資。'],[16,17],'原文結尾先重申匿名性與不平等，再提出安全措施與社會投資。'),
];
export default {key:'cause-solution:6',meta:{topic:'城市犯罪率較高的原因與解方',summary:'匿名性增加犯案機會，貧富差距與合法機會不足增加壓力；改善公共空間並投資青年機會。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
