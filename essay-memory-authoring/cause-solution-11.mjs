// Reviewed Cause/Solution 11: rural-to-urban migration and its two-sided effects.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-11-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:11'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In many places, more people are moving from the countryside to cities.',
  'This happens mainly because people think cities give them better chances in life than small towns or villages.',
  'But this can put a lot of pressure on city services and make country communities weaker.',
  'One main reason people move is the chance to earn more money.',
  'In many country areas, people work on farms, in local shops or in small family firms; these jobs may not pay the same amount each month.',
  'But cities usually have more kinds of jobs in factories, offices, shops, hotels and technology.',
  'For example, a young person who moves to a city may start in a basic job but still have a chance to move up, learn new skills and earn more.',
  'This hope of moving up makes city life very attractive.',
  'Another important reason is that people can get basic services more easily.',
  'Cities often have better schools, universities, hospitals, transport and internet services.',
  'For a family, this can decide where to live because education and healthcare are basic needs that help them feel secure for years.',
  'If parents in the countryside think a city school will help their child get better qualifications and meet more kinds of people, moving may seem necessary as well as sensible.',
  'But this move can also cause several problems.',
  'The first problem is too many people in cities.',
  'When people arrive faster than a city can plan for them, homes cost more, roads get busy and public services cannot meet everyone’s needs.',
  'Because of this, some newcomers may live in poor homes and have to compete for too few jobs.',
  'At the same time, country areas may grow weaker.',
  'As young and skilled people leave, villages may have fewer workers, customers and future leaders.',
  'Schools may shut, local businesses may have trouble, and older people may become more alone.',
  'To sum up, people mainly move to cities for better jobs and easier access to services.',
  'But this may put too much pressure on cities and weaken the social and economic life of country areas.',
];
const vocabulary=[
  [['rural-to-urban migration','moving from the countryside to cities','農村遷往城市'],['increasingly common','more people','越來越普遍']],
  [['movement','This happens','人口流動'],['mainly driven by','mainly because','主要受推動'],['life chances','chances in life','人生機會'],['villages or small towns','small towns or villages','村莊或小城鎮']],
  [['However','But','然而'],['serious pressure','a lot of pressure','嚴重壓力'],['urban systems','city services','城市系統'],['increasingly fragile','weaker','越來越脆弱']],
  [['major reason','main reason','主要原因'],['economic opportunity','chance to earn more money','經濟機會']],
  [['rural areas','country areas','農村地區'],['closely connected to farming','work on farms','與農業相關'],['local trade','local shops','本地商業'],['unstable income','not pay the same amount each month','收入不穩定']],
  [['By contrast','But','相比之下'],['wider range of jobs','more kinds of jobs','更多工作選擇'],['retail','shops','零售'],['hospitality','hotels','酒店服務業']],
  [['For example','For example','例如'],['entry-level position','basic job','入門職位'],['path towards promotion','chance to move up','晉升路徑'],['training','learn new skills','培訓'],['higher earnings','earn more','更高收入']],
  [['sense of upward mobility','hope of moving up','向上流動的感覺'],['extremely attractive','very attractive','極具吸引力']],
  [['Another important reason','Another important reason','另一重要原因'],['access to essential services','get basic services more easily','取得基本服務']],
  [['tend to have','often have','往往擁有'],['transport networks','transport','交通網絡'],['digital infrastructure','internet services','數碼基建']],
  [['decisive','decide where to live','決定性的'],['not luxuries','basic needs','不是奢侈品'],['foundations of long-term security','help them feel secure for years','長遠保障的基礎']],
  [['rural parent','parents in the countryside','農村家長'],['stronger qualifications','better qualifications','更好的學歷資格'],['wider social exposure','meet more kinds of people','接觸更廣闊社會'],['relocation','moving','搬遷']],
  [['however','But','然而'],['several problems','several problems','多個問題']],
  [['most immediate one','first problem','最直接的問題'],['urban overcrowding','too many people in cities','城市過度擠迫']],
  [['population growth','people arrive','人口增長'],['faster than planning','faster than a city can plan','快於規劃'],['housing becomes expensive','homes cost more','住屋變貴'],['roads become congested','roads get busy','道路擠塞'],['stretched thin','cannot meet everyone’s needs','不堪負荷']],
  [['As a result','Because of this','結果'],['migrants','newcomers','遷入者'],['poor-quality accommodation','poor homes','差劣住所'],['limited jobs','too few jobs','有限的工作']],
  [['At the same time','At the same time','與此同時'],['rural areas may decline','country areas may grow weaker','農村可能衰落']],
  [['younger and more capable residents','young and skilled people','年輕而有能力的居民'],['villages can lose','villages may have fewer','村莊流失'],['future community leaders','future leaders','未來社區領袖']],
  [['close','shut','關閉'],['struggle','have trouble','陷入困境'],['elderly residents','older people','年長居民'],['increasingly isolated','more alone','越來越孤立']],
  [['In conclusion','To sum up','總結'],['employment prospects','jobs','就業前景'],['access to services','access to services','獲得服務']],
  [['Nevertheless','But','然而'],['overload urban areas','put too much pressure on cities','城市超負荷'],['weaken','weaken','削弱'],['countryside','country areas','農村']],
];
export {original,simple,vocabulary};

function frame(i,links,labels,meaning,usage,example,tag,job){
  const value=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed wording ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
  if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched slot labels ${i+1}`);
  return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
  frame(0,[' has become '],['從農村遷往城市的現象','越來越普遍的現況'],'has become 表示現象隨時間愈見普遍。','開頭要呈現一種正在擴大的社會或地區趨勢時。','Remote study has become more common in many schools.','has become','提出趨勢的變化'),
  frame(1,[' is mainly driven by '],['遷往城市的趨勢','認為城市機會較好的信念'],'mainly driven by 把流動連到人們對機會的預期，保留主要而非唯一的分寸。','需要交代一種移動、選擇或轉變背後的主要目的時。','The change is mainly driven by the hope of better training.','mainly driven by','說明趨勢背後的主要動機'),
  frame(2,['However, ', ' and leave '],['城市系統承受的壓力','農村社區變脆弱的另一結果'],'However 由吸引力轉到代價；and leave 補上原居地的影響。','引言已解釋動機，還要預告兩個不同群體或地方可能承受的問題時。','However, the move can fill city roads and leave small towns short of workers.','However...and leave','預告兩地的相反影響'),
  frame(3,[' is '],['這種趨勢的一項主因','經濟機會'],'is 直接點出第一個原因，讓後文具體比較兩地工作。','主體段開始回答原因題，需要先明確標示分析方向時。','One major reason for this choice is the chance to earn a stable wage.','One major reason...is','開啟第一個原因'),
  frame(4,[', all of which '],['農村工作類型','收入可能不穩定的共同特點'],'all of which 回指農業、本地貿易及家庭生意，概括它們可能共同面對的收入風險。','列出數種情況後，需要用一句概括它們共有的限制時。','Families rely on farms, stalls and seasonal work, all of which may pay unevenly.','all of which','歸納多個例子的共同特點'),
  frame(5,['By contrast, '],['城市工作選擇較多的對比'],'By contrast 明確把城市的工作種類與前句農村收入不穩作對照。','已描述一個選項的限制，接着要與另一選項的條件比較時。','By contrast, the nearby town offers a wide range of jobs.','By contrast','對比兩地機會'),
  frame(6,[' for example, ','may '],['剛搬到城市的年輕人','由入門工作看到晉升可能性的個案'],'for example 把城市工作機會具體化；may 保留個案結果並非必然。','提出一項抽象吸引力後，需要舉出可能的具體發展路徑時。','A new worker, for example, may begin in a basic role and later train for more.','for example...may','用可能的個案展示就業路徑'),
  frame(7,[' makes '],['向上流動的期待','城市生活極具吸引力的結果'],'makes 把前句的晉升與收入路徑推到城市吸引力。','已描述具體機會，接着要說明它如何影響人的決定時。','The hope of better pay makes the course attractive.','makes','把機會接到吸引力'),
  frame(8,[' is access to '],['另一個重要原因','基本服務'],'is access to 由工作機會切換到教育、醫療等基本服務。','一類動機已分析完畢，現在要提出另一類不同需要時。','Another important reason is access to reliable healthcare.','is access to','切換到基本服務原因'),
  frame(9,[' tend to have '],['城市','較好的學校、醫院及基建等服務'],'tend to have 概括常見差異，不說每座城市必然勝過每個村莊。','需要比較兩個地方或方案通常能提供的服務與機會時。','Large towns tend to have more specialist clinics.','tend to have','審慎概括常見的服務差異'),
  frame(10,[' because ','; they are '],['教育醫療對家庭決定的重要性','教育醫療不是奢侈品','長遠保障的基礎'],'because 給出家庭重視服務的原因；分號後進一步說明它們的長遠作用。','列出設施或資源後，要說明它們為何會影響人的決定時。','For parents, transport and childcare matter because they are not luxuries; they are foundations of stable work.','because...; they are','解釋基本服務的重要性'),
  frame(11,['If ', ', relocation may seem '],['家長相信城市學校帶來較好機會的條件','搬遷可能看似必要的判斷'],'If 設定家庭對子女教育的預期；may seem 保留感受與事實之別。','要用一個家庭或個人的處境，展示某種選擇為何看似必要時。','If parents trust the new school, relocation may seem worthwhile.','If...may seem','展示家庭在條件下的判斷'),
  frame(12,[' however, '],['人口流動','可能造成多種問題的轉折'],'however 把前兩段的遷移動機轉向接下來的負面影響。','原因已解釋完畢，現在要切換到題目要求的後果時。','This plan, however, can create new pressures.','however','由原因轉到問題'),
  frame(13,[' is '],['最直接的問題','城市過度擁擠'],'is 直接標出最先出現的城市問題。','後果段開頭需要指出可逐步展開的首要問題時。','The most immediate problem is a shortage of homes.','The most immediate...is','點明最直接後果'),
  frame(14,['When ', ', housing becomes '],['人口增長超過規劃的條件','房屋、道路及公共服務的壓力'],'When 定出增長快於規劃的條件，主句展開三種城市負擔。','要說明需求增加而規劃未跟上時，多種資源會如何同時受壓時。','When demand grows faster than supply, housing becomes expensive.','When...housing becomes','把規劃落後接到城市後果'),
  frame(15,['As a result, ',' while '],['部分遷入者可能面對的居住結果','同時競爭有限工作'],'As a result 承接擁擠；while 說住屋和就業兩項困境同時出現。','已概括某地過度擁擠，需要具體指出受影響者的生活後果時。','As a result, some families live in cramped rooms while searching for work.','As a result...while','展示城市壓力落在個人身上'),
  frame(16,['At the same time, '],['農村社區也可能衰落的另一面'],'At the same time 由遷入城市的負擔轉向人口流失的農村。','已分析目的地的問題，還須交代來源地的同步影響時。','At the same time, small towns may lose local trade.','At the same time','轉到原居地同步後果'),
  frame(17,['As ', ', villages can lose '],['年輕居民離開的條件','村莊可能失去的勞動與領導力量'],'As 表示居民離開時，村莊如何失去工人、顧客和接班人。','要說明某類人口或資源持續流失如何逐步削弱一個社群時。','As young workers leave, villages can lose skills and customers.','As...can lose','把人口流失接到社區能力下降'),
  frame(18,[' may ', ', ', ' may ', ', and ', ' may '],['第一個受影響者','其後果','第二個受影響者','其後果','第三個受影響者','其後果'],'並列三項後果，涵蓋學校、商業與長者社交處境。','已指出一類人離開，還要列出其他群體因此如何受影響時。','Schools may close, local shops may struggle, and older people may feel alone.','may...may...may','並列農村衰落的具體後果'),
  frame(19,['In conclusion, ',' mainly for '],['人們搬到城市的現象','較好的工作及服務兩項主要動機'],'In conclusion 收束全文；mainly for 回答遷移原因，保留主要而非唯一。','結尾要精簡回答原因題，歸納前文兩條不同動機時。','In conclusion, families move mainly for work and education.','In conclusion...mainly for','在結尾歸納主要動機'),
  frame(20,['Nevertheless, ',' and weaken '],['城市可能超負荷的問題','農村社會及經濟生活被削弱的另一問題'],'Nevertheless 轉向代價；and weaken 同時保留兩地後果。','已歸納動機，結尾仍需回答兩個地方各承受甚麼後果時。','Nevertheless, this shift can fill city roads and weaken village shops.','Nevertheless...and weaken','在結尾歸納兩地問題'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+8)%specs.length,(i+15)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的原因與問題次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('範文提出哪兩項主要遷城原因？',['城市較好的就業前景與基本服務','城市必然完全沒有生活費','農村所有人都被法律禁止工作','每個農村學校都沒有學生'],'引言和結尾都把工作機會與服務可及性並列。'),
  quiz('作者說這種遷移會在兩地造成甚麼影響？',['城市系統承受壓力，農村社區也可能變弱','城市和農村都一定立即變得富裕','只影響個別商店，完全不涉及住屋','只影響交通，完全不影響人口結構'],'文章把遷入地與遷出地的代價一起討論。'),
];
const route=[sequence('按兩項原因與兩地問題串起全文',[
  ['引言：提出現象與方向','遷往城市漸普遍，因人們相信城市機會較多；兩地可能承受代價。'],
  ['主體一：解釋兩項吸引力','城市工作種類和晉升路徑較多，教育醫療等服務也較易取得。'],
  ['主體二：分析兩地後果','城市住屋、道路與服務受壓；農村流失青年與社區活力。'],
  ['結尾：回答原因與問題','歸納就業及服務動機，再概括城市超負荷和農村衰落。'],
],'題目問原因與問題，結尾都要回答；問題又須兼顧城市與農村。')];
const evidence=[
  quiz('農村工作為何可能促使人們遷城？',['農業、本地貿易和家庭生意的收入可能不穩定','每份農村工作一定完全沒有薪酬','農村居民必須放棄所有技能','城市完全沒有工廠和辦公室'],'範文說農村工作可提供收入，但可能不穩定。'),
  quiz('城市工作機會如何吸引年輕人？',['即使從入門職位開始，也可能看到培訓、晉升和更高收入的路徑','所有人搬到城市當天都會成為總經理','城市只提供一種完全沒有晉升可能的工作','只要搬遷就一定毋須接受培訓'],'個案強調可能的向上流動，沒有保證每個人成功。'),
  quiz('服務因素為何對家庭重要？',['教育與醫療是長遠保障的基礎，不只是一種奢侈享受','大學和醫院只供旅客短暫參觀','家長只重視商店招牌，不看學校','教育與醫療在任何地方都一樣容易取得'],'範文把學校、醫院及子女機會連到家庭決定。'),
  quiz('城市人口增長快於規劃會造成甚麼？',['住房更昂貴、道路擠塞、公共服務承壓','住房一定更便宜且道路永遠暢通','公共服務因需求變多便自動無限擴大','所有遷入者都立即得到高薪工作'],'範文指出規劃跟不上需求時的三項城市壓力。'),
  quiz('農村青年離開如何影響原居地？',['減少工人和顧客，並使學校、商業與長者生活受影響','只會令村莊工人和顧客增加','不會對任何長者或商店造成可能影響','能保證每間農村學校立即擴建'],'原文由人才流失推到學校、商業和長者的具體後果。'),
  quiz('作者是否認為遷城只帶來問題？',['沒有；文章先承認就業與服務的吸引力，再分析兩地代價','是；他完全否認城市工作與學校的價值','是；他只描述農村商店而從未談城市','沒有；他聲稱遷城對每人都必然完美'],'論證同時呈現遷城動機和可能問題。'),
];
const logic=[
  sequence('主體一：從工作與服務理解遷城',[
    ['農村收入可能較不穩','農業和本地小生意可能難提供穩定收入。'],
    ['城市提供多種職涯路徑','工廠、辦公室及服務業可帶來培訓與晉升。'],
    ['家庭也考慮基本服務','學校、醫院與交通影響長遠保障。'],
    ['因此搬遷可能看似必要','家長預期子女可獲更好學歷與接觸機會。'],
  ],'把工作和服務分成兩條動機，不把任何一條說成唯一原因。'),
  sequence('主體二：同一人口流動的兩地代價',[
    ['城市規劃可能追不上人口','住屋、道路和公共服務首先承受壓力。'],
    ['部分遷入者受影響','住屋質素下降，工作競爭增加。'],
    ['農村失去青年與勞動力','工人、顧客和未來領袖減少。'],
    ['社區設施與長者受牽連','學校、商業和社交支援可能逐漸變弱。'],
  ],'城市擁擠與農村衰落是兩地相連而不同的後果。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一個島嶼小鎮的青年搬往首府，因為當地只有季節性工作。','哪項分析最能轉用範文？',[
    '比較小鎮收入與首府培訓晉升機會',
    '直接認定所有小鎮青年都討厭家鄉',
    '只比較兩地的招牌顏色，不看工作機會',
    '宣稱首府所有工作必然一開始就付高薪',
  ],['範文以收入穩定性與向上流動機會解釋遷移吸引力。','動機不能由搬遷行為直接推成厭惡家鄉。','招牌不會解釋就業與收入差異。','範文的年輕人從入門工作開始，晉升並非保證。'],[3,4,5,6,7],'原文先談農村收入可能不穩，再談城市職涯路徑。'),
  transfer('一戶家庭願意搬離農村，因為子女需要專科醫療與較多教育選擇。','哪項說法符合範文？',[
    '教育醫療影響家庭保障，搬遷因此可能必要',
    '教育和醫療只是任何家庭都不會考慮的奢侈品',
    '只要有一家醫院，所有專科服務便必然相同',
    '家長考慮教育便代表完全不在乎工作收入',
  ],['範文把教育醫療視為長遠保障的基礎。','原文明確反對把它們視作奢侈品。','一間醫院不等於所需專科服務均可取得。','工作和服務是並行動機，不能互相排除。'],[8,9,10,11],'原文說教育醫療不是奢侈品，而會影響家庭搬遷判斷。'),
  transfer('城市新增大量住戶，但學校和診所容量多年沒有調整。','哪個問題最值得先檢查？',[
    '人口增長是否快於公共服務與住房規劃',
    '居民是否全部因同一工作和收入而搬入',
    '只看城市地標顏色，忽略公共服務需求',
    '假設人數增加一定令每所診所變得更空閒',
  ],['範文將人口增長快於規劃連到服務承壓。','工作動機不能單獨解釋服務容量。','地標顏色與診所容量無關。','需求增加不會自動擴大容量。'],[12,13,14],'原文說住房、道路及服務會在規劃落後時承壓。'),
  transfer('某村年輕居民外移後，雜貨店顧客減少，學校亦面臨縮班。','哪項推理最忠於範文？',[
    '人口流失令顧客學童減少，商店學校受損',
    '顧客減少一定只證明店主經營能力不足',
    '學校縮班必然與居民人口結構完全無關',
    '只討論城市塞車，不看村莊商店學校變化',
  ],['範文正把年輕人離開連到顧客、學校和社區活力。','不能由顧客數目推斷店主能力。','人口流失是可能影響學校的合理機制。','原文要求同時看遷出地的問題。'],[16,17,18],'原文由青年離開推到顧客減少、學校可能關閉。'),
  transfer('有人說遷往城市的人都一定能升職加薪。','如何按範文修正？',[
    '城市有較多機會，但升職加薪並無保證',
    '每名遷入者當天都能取得管理職位和高薪',
    '城市完全沒有任何入門工作或新職位',
    '只要搬遷，便不用再培訓或主動找工作',
  ],['may 和 a path towards 表示機會，而非人人必然成功。','這把可能性誇大為即時結果。','原文個案從入門職位開始。','範文把培訓列為路徑的一部分。'],[5,6,7],'原文只說年輕人可能看見培訓與晉升路徑。'),
  transfer('某城市就業機會多，但廉價住屋供應長期不足。','哪項後果最符合範文？',[
    '遷入者可能住得差，還需競爭有限職位',
    '工作機會多就保證每人住屋寬敞舒適',
    '住屋不足只影響農村，不影響大城市居民',
    '完全不必看人口增長與住房規劃是否配合',
  ],['範文承認吸引力，也指出擁擠下的居住與就業壓力。','就業吸引力不能保證住房供應。','住房不足是城市段的核心問題。','範文把人口快於規劃視為觸發條件。'],[5,14,15],'原文說城市工作有吸引力，但規劃不足會令住屋和職位承壓。'),
  transfer('有評論只談城市交通擠塞，完全沒有提及農村人口流失。','哪項補充最能保持範文的完整性？',[
    '分析農村失去工人顧客後的社區影響',
    '只再重複城市交通擠塞，避免提及原居地',
    '宣稱農村沒有任何學校、商業和長者',
    '把所有長者都當作一定孤立無援的居民',
  ],['範文把遷入地與遷出地兩面的問題都列出。','重複交通無法回答農村後果。','原文說學校和商業可能受損，並非原本不存在。','原文用 may，沒有把可能問題說成人人必然。'],[2,16,17,18,20],'原文同時分析城市超負荷與農村社區變弱。'),
  transfer('另一篇文章討論護士從小鎮到大城市工作：薪酬較高，但小鎮診所缺人。','哪種論證安排最能轉用範文？',[
    '先交代職涯吸引力，再分析兩地承接代價',
    '只說薪酬較高，略去小鎮診所和商店影響',
    '只談小鎮缺人，否認城市工作機會的吸引',
    '完全不區分遷出地與遷入地的各種後果',
  ],['範文先解釋人為何離開，再比較兩地後果。','缺了題目要求的問題分析。','缺了合理的遷移原因。','兩地影響不同，需要分清。'],[1,2,3,12,16],'原文把動機、城市壓力與農村流失依次展開。'),
  transfer('一個社區想減少青年外流，決定只辦宣傳活動，沒有查工作或服務條件。','哪項檢查最貼近範文？',[
    '調查工作教育醫療交通能否留住家庭',
    '只增加宣傳標語數量，不問居民所需',
    '認定每位青年都只因城市燈光而搬家',
    '把家庭對醫療的考慮當成沒有價值',
  ],['範文指出工作與基本服務才是主要動機。','標語不能直接改善已知的機會差距。','這忽略了原文列出的經濟與服務因素。','醫療是範文所說的長遠保障基礎。'],[3,4,8,9,10],'原文把工作機會及基本服務作為主要吸引因素。'),
  transfer('文章結尾已總結城市工作較多，卻沒有回答遷移可能造成甚麼問題。','哪項修訂最符合範文？',[
    '補上城市超負荷與農村服務流失兩面問題',
    '只多寫兩句城市職位名稱，不談移動後果',
    '突然討論與遷移無關的學校考試日期',
    '宣稱遷城在任何地方都不可能有問題',
  ],['題目有原因與問題兩問，結尾也要回應兩地代價。','只重複動機，仍漏答問題。','考試日期與此題無關。','與範文分析的住屋及農村影響矛盾。'],[19,20],'原文結尾先歸納就業與服務，再歸納城市和農村問題。'),
];
const revisedAlternatives={
  0:[['比較小鎮收入與首府休閒活動多寡','只看首府職位數量，略去小鎮工作季節性','先問青年喜不喜歡首府，較少比較收入'],['休閒活動不是情境中的主要遷移動機。','原居地工作不穩也是推拉因素。','個人偏好不足以解釋就業選擇。']],
  1:[['醫療和教育有吸引力，搬遷仍只看薪酬','有醫院便足夠，專科服務可留待之後','子女教育重要，其他家庭需要可暫不考慮'],['作者把基本服務也列作遷移原因。','一般醫院未必提供所需專科服務。','家庭保障可能涉及多項需求。']],
  2:[['先查遷入者職業，再考慮學校診所需求','居民增多後，服務容量可維持原狀','人口增長加快，優先統計地標遊客量'],['職業資訊不足以衡量公共服務承載量。','人口增長可能造成容量壓力。','遊客量未對應新增住戶的服務需求。']],
  3:[['顧客減少或因店舖競爭，學校縮班另議','人口外移影響商店，學校則只看教學品質','先統計村內店數，再判斷青年外移影響'],['情境同時出現學童與顧客減少。','學校縮班也可能與學齡人口下降有關。','店數不足以說明人口流失的因果。']],
  4:[['城市有較多職位，入職後便較易升職','遷入者可找工作，培訓需求則可忽略','城市薪酬或較高，住屋成本便不用比較'],['機會增加不保證個人晉升。','資歷與技能仍影響是否取得職位。','收入比較仍須考慮城市生活成本。']],
  5:[['遷入者可能較難租屋，就業卻不受影響','住房供應不足，城市應先增加宣傳','工作機會多，便能自行解決住屋壓力'],['人口增長也可能增加職位競爭。','宣傳未增加廉價住屋供應。','工作較多不保證每人負擔得起住屋。']],
  6:[['補充農村商店變化，長者與學校可略過','分析城市塞車，農村人口流失稍後再談','說明農村工人減少，但服務影響不需追問'],['農村影響不只商店，也包括服務與人口結構。','本文要求同時分析遷出地。','工人外移也可能削弱社區服務。']],
  7:[['先談城市高薪，再把小鎮缺人留到結尾','分析小鎮診所缺人，略過城市薪酬吸引','分別列兩地資料，不解釋遷移的代價'],['小鎮承擔的後果也須具體分析。','原因與後果都應呈現。','只列資料未形成完整因果論證。']],
  9:[['補充城市塞車問題，農村影響仍可略去','補充農村學校縮班，城市承載可暫不談','只重述職位吸引力，兩地代價留給讀者'],['範文同時關注遷出與遷入兩地。','城市服務壓力亦是題目要求的後果。','結尾需要回收問題而非只談原因。']],
};
Object.entries(revisedAlternatives).forEach(([index,[options,reasons]])=>{transferTasks[index].options.splice(1,3,...options);transferTasks[index].explanations.splice(1,3,...reasons);});
export default {key:'cause-solution:11',meta:{topic:'農村人口遷往城市的動機與兩地影響',summary:'城市工作與基本服務吸引家庭，但人口流動可能令城市承壓，同時削弱農村社區。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
