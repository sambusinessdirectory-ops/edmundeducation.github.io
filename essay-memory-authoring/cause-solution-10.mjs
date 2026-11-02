// Reviewed Cause/Solution 10: restoring walking through safer places and daily routines.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-10-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:10'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Walking is a cheap and easy way to stay healthy, but many people no longer do it every day.',
  'This happens mainly because cities are made for cars and people sit more often.',
  'We can fix it by making public places better and making walking part of work, school and travel.',
  'One main reason is that many cities are built to let vehicles move fast, rather than to help people walk.',
  'When homes, offices, shops and schools are far from each other, walking is hard or unsafe, especially where roads are wide, footpaths are poor and there is little shade.',
  'Because of this, people take cars, buses or hired rides; the problem is not that walking is useless but that the places around them make it hard.',
  'Another reason is that more people spend their days sitting at desks.',
  'Many people look at screens for hours; when tired, they make the easiest choices: take lifts instead of stairs, shop online instead of doing things nearby on foot, and stay at home instead of going outside for a short walk.',
  'After a while, these small choices become a life with too much sitting.',
  'To fix this, governments should make walking safer, easier and more pleasant.',
  'Wide footpaths, shade, good lights, areas for people on foot and safe places to cross can make walking an ordinary choice instead of something difficult.',
  'For example, if an area has safe and pleasant paths that lead to schools, parks and shops, families may walk without losing too much time or feeling unsafe.',
  'Also, employers and schools should make movement part of daily life.',
  'At work, people can hold meetings while walking and travel on foot; schools can organise groups that walk to school or challenges based on steps.',
  'These changes matter because walking becomes part of a normal day, not one more job added to a busy day.',
  'To sum up, fewer people walk because where they live and how they spend each day make sitting easier.',
  'The best answer is to build places where people can walk and daily habits that make walking easy, safe and normal again.',
];
const vocabulary=[
  [['Although','but','雖然'],['simplest and cheapest ways','cheap and easy way','最簡單便宜的方法'],['quietly disappeared','no longer do it','悄然消失'],['daily routines','every day','日常生活']],
  [['decline','This happens','下降'],['stems mainly from','mainly because','主要源於'],['car-centred urban design','cities are made for cars','以汽車為中心的城市設計'],['sedentary lifestyles','people sit more often','久坐生活']],
  [['addressed','fix it','解決'],['improving public spaces','making public places better','改善公共空間'],['normal part','part','正常一部分'],['transport habits','travel','交通習慣']],
  [['major reason','main reason','主要原因'],['built around speed','built to let vehicles move fast','圍繞速度建造'],['movement','help people walk','身體活動']],
  [['far apart','far from each other','相距甚遠'],['inconvenient','hard','不方便'],['pavements','footpaths','行人路'],['little shade','little shade','遮蔭不足']],
  [['As a result','Because of this','結果'],['ride-hailing services','hired rides','叫車服務'],['has no value','is useless','沒有價值'],['environment pushes them away','places around them make it hard','環境令人不想步行']],
  [['rise of','more people','日漸普遍'],['desk-based routines','spend their days sitting at desks','久坐辦公的日常']],
  [['long hours in front of screens','look at screens for hours','長時間看螢幕'],['easiest option','easiest choices','最省力的選擇'],['local errands','doing things nearby','到附近辦事'],['short walk outside','going outside for a short walk','到戶外短暫散步']],
  [['Over time','After a while','久而久之'],['small choices','small choices','小選擇'],['harden into','become','固化成'],['sedentary lifestyle','life with too much sitting','久坐生活']],
  [['To tackle this problem','To fix this','為解決問題'],['attractive','pleasant','吸引人'],['governments','governments','政府']],
  [['Wider pavements','Wide footpaths','更寬的行人路'],['shaded streets','shade','有遮蔭的街道'],['pedestrian zones','areas for people on foot','行人專區'],['crossings','safe places to cross','過路設施'],['from a chore into a daily option','an ordinary choice instead of something difficult','由苦差變日常選項']],
  [['neighbourhood','area','社區'],['pleasant routes','safe and pleasant paths','舒適路線'],['sacrificing time or safety','losing too much time or feeling unsafe','犧牲時間或安全']],
  [['At the same time','Also','與此同時'],['employers','employers','僱主'],['build movement into ordinary routines','make movement part of daily life','把活動融入日常']],
  [['Workplaces','At work','工作場所'],['walking meetings','meetings while walking','步行會議'],['active commuting','travel on foot','活動通勤'],['walking buses','groups that walk to school','步行巴士'],['step-based challenges','challenges based on steps','步數挑戰']],
  [['measures matter','changes matter','措施重要'],['squeezed into a crowded schedule','added to a busy day','硬塞進繁忙日程']],
  [['In conclusion','To sum up','總結'],['surroundings','where they live','周遭環境'],['routines','how they spend each day','日常習慣'],['inactivity','sitting','不活動']],
  [['most effective response','best answer','最有效應對'],['design walkable communities','build places where people can walk','設計適合步行的社區'],['convenient','easy','方便']],
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
  frame(0,['Although ', ', it '],['步行有益又便宜的事實','步行卻從日常消失的轉折'],'Although 先承認步行容易且有益；主句再指出實際上越來越少人步行。','開頭要用一項公認好處引出與之不同的實際現況時。','Although books are easy to find, many pupils rarely read for pleasure.','Although','用反差提出待解釋的現象'),
  frame(1,[' stems mainly from '],['需要解釋的步行下降','城市設計與久坐習慣兩項主因'],'stems mainly from 把現象連到兩項主要成因，不說成唯一原因。','引言需要預告接下來會分別分析的兩項主要原因時。','The decline in cycling stems mainly from unsafe roads and long journeys.','stems mainly from','預告兩項主要成因'),
  frame(2,[' can be addressed by '],['步行減少這個問題','改善公共空間及日常習慣的解方'],'can be addressed by 把前句的問題接到兩類可行措施。','已概括原因，還要在引言預告分別回應原因的兩類措施時。','This gap can be addressed by improving access and changing school routines.','can be addressed by','以兩類措施預告解方'),
  frame(3,[' is that '],['以汽車速度為中心的主要原因提示','城市如何以速度而非步行活動設計'],'is that 後以完整子句解釋其中一項原因。','主體段開頭要直接指出造成問題的設計或制度取向時。','One major reason is that paths are built for cars rather than people.','is that','直接說清第一項成因'),
  frame(4,['When ', ', walking becomes '],['住處與目的地相距遠的條件','步行變得不便或不安全的結果'],'When 設定距離條件；主句說明步行因此不便或不安全，後面補道路細節。','要用具體條件說明某種環境安排如何影響人們的選擇時。','When shops are far from homes, walking becomes difficult for families.','When...walking becomes','把空間條件接到出行結果'),
  frame(5,[' not because ', ', but because '],['人們轉用車輛的現象','需要排除的錯誤解釋','環境讓步行困難的真正原因'],'not because...but because 排除「步行沒有價值」並指出環境阻礙。','某種選擇看似源於個人態度，實際卻受到外部條件推動時。','People drive not because walking is useless, but because the route feels unsafe.','not because...but because','排除表面原因並給出環境原因'),
  frame(6,['Another reason is '],['久坐辦公日常這項第二原因'],'Another reason is 從城市布局轉到個人一天中的久坐模式。','已分析一類外部因素，接着要轉入另一類行為成因時。','Another reason is the lack of breaks during work.','Another reason is','清楚開啟第二項成因'),
  frame(7,[': '],['疲憊後選擇最省力方式的背景','升降機、網購及在家娛樂的具體例子'],'冒號把抽象的「最省力選項」展開成三組取代步行的日常選擇。','提出一種習慣後，要列出可觀察的具體行為作證據時。','After work, many choose the easier option: a lift, a car or a delivery service.','colon','把概括行為展開為具體例子'),
  frame(8,['Over time, '],['小選擇逐漸固化成久坐生活的結果'],'Over time 說明不是一次選擇，而是反覆行為累積成生活方式。','列出多項小選擇後，需說明它們如何隨時間累積成較大影響時。','Over time, missed walks can become a habit of staying indoors.','Over time','把反覆小選擇推到長期習慣'),
  frame(9,['To tackle this problem, '],['政府應改善步行安全、便利和吸引力的行動'],'To tackle this problem 把論證由原因切換到解方，指定政府的方向。','原因分析完畢，需要以明確主題句開啟第一組解法時。','To tackle this problem, councils should make paths safer.','To tackle this problem','由原因轉入政府解方'),
  frame(10,[' can turn walking from ',' into '],['行人路、遮蔭與過路設施','步行原本像麻煩事的狀態','步行可成為的日常選項'],'from...into 顯示實際設施如何改變步行在日常中的地位。','提出建設或制度措施後，需要說明它如何使原本困難的選擇變得可行時。','Safe crossings can turn walking from a risk into a normal school journey.','turn...from...into','說明設施改變選擇的機制'),
  frame(11,['For example, if ', ', families are more likely to '],['舒適路線連接學校、公園及商店的條件','家庭更願步行且不覺犧牲安全的結果'],'For example, if 以社區路線作例子；後面說明安全便利如何改變家庭選擇。','提出一項措施後，需要用具體地方或人物情境示範其作用時。','For example, if paths lead safely to schools, families are more likely to walk.','For example, if','以條件例子展示解方效果'),
  frame(12,['At the same time, '],['僱主及學校把活動融入日常的另一組措施'],'At the same time 補上公共空間之外，機構可以改變的日常安排。','已提出一方措施，還要指出其他行動者如何配合時。','At the same time, schools can add short walks to the day.','At the same time','加入互補的機構措施'),
  frame(13,[', while '],['工作場所可提供的步行安排','學校可推行的步行活動'],'while 在同一句分配工作場所與學校的不同做法。','多個機構都能促進同一目標，但各自可採取的行動不同時。','Workplaces can offer walking breaks, while schools can organise walking groups.','while','對照兩個行動者的分工'),
  frame(14,[' because ', ', not '],['措施之所以重要的判斷','步行成為日常一部分的理由','額外硬塞進日程的反面狀態'],'because 解釋措施的價值；not 補上它避免的額外負擔。','措施已列出，接着要說明為何融入現有日程比額外要求更可持續時。','The change matters because walking becomes a routine, not another job to remember.','because...not','說明方案有效且減少負擔'),
  frame(15,[' because '],['越來越少人步行的總結','環境與習慣令不活動更容易的根本原因'],'because 把結論中的現象重新連回前文兩類成因。','結尾需要同時回應外部環境與個人習慣兩條原因線時。','In conclusion, fewer pupils cycle because their routes feel unsafe.','because','在結論歸納原因'),
  frame(16,[' is to '],['最有效應對的概括','建設適合步行的社區和日常習慣'],'is to 用一句話概括社區設計和日常安排的配套解方。','已歸納原因，最後要以相應的兩類行動收束時。','The best response is to build safer routes and make active travel normal.','is to','以對應措施收束全文'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的成因與解方次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('步行有益，為何作者仍認為越來越少人步行？',['城市以汽車為中心，日常工作與娛樂亦越來越久坐','步行本身完全沒有任何健康作用','所有城市都已取消道路及交通工具','人們每天必然有很多安全步行路線'],'範文的反差是：步行有益，卻受到空間設計與久坐模式阻礙。'),
  quiz('作者的兩大解方方向是甚麼？',['改善公共空間，並把步行融入學校、工作和交通習慣','只叫人不論道路安全與否都必須步行','只增加汽車停車位而不改善行人路','完全取消工作與學校的日常安排'],'引言與結尾都把可步行環境和日常習慣連在一起。'),
];
const route=[sequence('從步行障礙走到可持續的日常步行',[
  ['引言：提出反差與兩項主因','步行有益卻減少；城市設計與久坐生活是主要原因。'],
  ['主體一：拆開空間與習慣因素','距離、道路與遮蔭使步行不便；升降機、網購和在家娛樂令小選擇累積。'],
  ['主體二：提出相配的措施','政府改善步道，僱主與學校把步行放進日常安排。'],
  ['結尾：回答兩問','環境和習慣讓不活動更容易；改善社區與日常模式才能逆轉。'],
],'每項解方都應對應前文一項實際障礙。')];
const evidence=[
  quiz('城市的哪種布局令步行較困難？',['住宅、工作、購物和學校相距遠，路面又可能缺少安全與遮蔭','住宅和學校全部就在同一幢樓內','每條道路都有寬闊、連續而安全的行人路','所有居民都住在公園內'],'範文同時指出目的地距離與道路品質。'),
  quiz('作者如何解釋居民改坐車或巴士？',['環境使步行不便或不安全，並非步行沒有價值','步行在任何情況下都不會帶來益處','每位居民都永遠拒絕走路','巴士本身令所有行人路消失'],'not because...but because 明確排除對步行價值的否定。'),
  quiz('辦公桌模式如何逐漸變成久坐生活？',['長時間看螢幕後選升降機、網購和在家娛樂，小選擇逐漸累積','坐在辦公桌前必然使人每日步行數小時','任何一次網購都立即形成永久習慣','下班疲倦一定會讓道路變得更安全'],'例子由一天中的小選擇推到長期習慣。'),
  quiz('政府可用甚麼措施改善步行條件？',['較寬行人路、遮蔭、照明、行人專區和安全過路設施','只興建更多高速車道，完全不提供過路點','移除所有照明和行人路','只宣傳步行，不修理任何不安全路段'],'範文列出五類實體設施，目的是讓步行安全而可行。'),
  quiz('僱主與學校在解方中如何分工？',['工作場所鼓勵步行會議與活動通勤；學校可安排步行群組與步數挑戰','兩者都只能等待政府，不能改變任何日常安排','學校完全不應讓學生在安全路線步行','僱主只需把辦公桌搬得更高'],'範文把機構能控制的日常安排與公共空間措施配合。'),
  quiz('作者為何反對把步行視為額外任務？',['融入既有日程比在繁忙一天再塞一項活動更容易維持','步行永遠不能融入任何日常生活','每位居民每天必然有大量空閒時間','工作與上學從來不涉及交通選擇'],'措施的價值在於讓步行成為日常，而不是靠額外擠時間。'),
];
const logic=[
  sequence('主體一：由城市布局到少步行',[
    ['目的地相距較遠','住處、工作場所、商店和學校分散。'],
    ['步行路線欠缺安全與舒適','寬路、差行人路和少遮蔭增加障礙。'],
    ['居民轉向車輛','改坐車是環境推動的選擇，不等於步行沒有價值。'],
    ['日常小選擇延續久坐','工作後乘升降機、網購、在家娛樂，反覆累積。'],
  ],'把空間障礙與久坐習慣都交代清楚，勿只責怪個人。'),
  sequence('主體二：由街道到日常安排',[
    ['政府先改善公共空間','步道、遮蔭、照明與過路設施令步行可行。'],
    ['用社區路線展示效果','家庭可安全到達學校、公園和商店。'],
    ['僱主與學校改變日常','步行會議、活動通勤、步行群組和步數挑戰。'],
    ['說明共同機制','步行變成日常的一部分，不必另找時間。'],
  ],'具體設施處理安全問題，日常安排處理習慣問題。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一個社區的巴士站離住宅很近，但住戶仍要跨過沒有行人過路處的寬路。','哪項分析最能轉用範文？',[
    '先改善安全過路點，因為路線是否可用不只取決於距離',
    '站點很近便表示每位居民都一定會步行',
    '只在站牌寫「多走路」，毋須處理寬路',
    '取消巴士站，讓所有居民走更遠的路',
  ],['範文指出道路寬度和過路設施會直接影響步行安全。','距離近仍可能有危險道路。','口號不能代替安全過路設施。','取消站點會增加而非減少出行困難。'],[4,10,11],'原文用寬路、差行人路和過路設施解釋步行障礙與解方。'),
  transfer('一間公司提醒員工「放工後額外運動」，但工作日完全沒有活動休息。','哪項修訂最符合範文？',[
    '安排步行會議或活動休息，讓活動進入本來的工作日',
    '把放工後運動寫進通知便足夠，毋須改日程',
    '禁止員工在安全環境中站起來走動',
    '認為忙碌日程一定不會影響任何人的行動',
  ],['範文要求把步行融入日常，不另添一項繁忙日程的負擔。','通知沒有改變活動時間或方式。','禁止活動與範文提出的工作場所措施相反。','範文正因日程忙碌才強調融入。'],[12,13,14],'原文舉步行會議，並說步行不應成為硬塞進日程的額外任務。'),
  transfer('某校想鼓勵學生步行上學，但校外路口繁忙，家長擔心安全。','哪種方案最貼近範文？',[
    '改善路口與步道，再組織有人照應的步行上學群組',
    '只要求小學生獨自穿過危險路口',
    '取消所有步行上學宣傳，完全不檢查道路',
    '只設步數挑戰，卻不處理上學路線的安全',
  ],['政府的安全設施與學校的步行群組能互相配合。','忽視家長提出的實際風險。','沒有處理可改變的道路條件。','步數挑戰不能代替安全過路點。'],[9,10,11,13],'原文分別提出安全過路設施與學校步行群組。'),
  transfer('居民改用叫車服務，有人說這證明他們不重視步行的健康作用。','哪個回應最忠於範文？',[
    '先檢查路線距離與安全，不能直接把選擇解讀為不認同步行',
    '每位叫車乘客都一定認為步行沒有任何價值',
    '只討論乘客性格，不查城市空間',
    '因為叫車存在，所以道路設計絕不影響交通選擇',
  ],['範文用 not because...but because 排除只怪人不重視步行。','把一種選擇推成所有人的信念，超出證據。','漏掉範文的城市設計原因。','範文明言環境會把人推離步行。'],[4,5],'原文把改坐車輛與步行環境相連。'),
  transfer('一區商店與學校距離住宅很遠，而且沿路沒有遮蔭。','哪項優先調查符合範文的成因分析？',[
    '量度實際路程並檢查遮蔭與行人路品質',
    '只詢問居民是否知道步行有益',
    '假設每條路都一樣安全舒適',
    '只比較商店招牌顏色，不看位置',
  ],['範文同時提到目的地分散和路線舒適度。','知道好處不等於路線可行。','這忽視了題目已提供的路線障礙。','招牌顏色不會縮短路程或增加遮蔭。'],[3,4],'原文由城市布局、寬路、行人路和遮蔭推到步行不便。'),
  transfer('一名上班族每天乘升降機、網購，晚上又一直留在家中。','哪項說明最能轉用範文的時間推理？',[
    '重複的小選擇可逐漸形成久坐習慣，不能只看某一次選擇',
    '乘一次升降機便必然永久失去步行能力',
    '網購一定比所有到店購物更耗體力',
    '只要晚上在家，城市道路便會自動改善',
  ],['Over time 說明反覆選擇累積成生活方式。','把一次選擇誇大為必然永久結果。','這與範文所描述的減少外出機會相反。','在家娛樂不會直接修好道路。'],[7,8],'原文先列小選擇，再說它們久而久之固化為久坐生活。'),
  transfer('市政府建了寬闊步道，但沒有夜間照明，居民晚間仍不願步行。','哪項改進最有根據？',[
    '補上照明並檢查安全感，讓步道在居民需要的時間可用',
    '只計算步道寬度，認定晚上也必然安全',
    '關閉所有過路設施，讓居民自行找路',
    '把步行定義為白天才有價值的活動',
  ],['照明是範文列出的安全與吸引力設施之一。','寬度不能代替晚間照明。','關閉過路設施會破壞路線連接。','範文未把步行價值限於白天。'],[9,10,11],'原文並列行人路、照明與安全過路點。'),
  transfer('某社區有公園，但住宅到公園的路線迂迴而危險。','哪個例子最能解釋改善的作用？',[
    '提供舒適安全的連接路線，讓家庭能在不犧牲安全下步行前往',
    '只擴建公園圍牆，不改善通往公園的道路',
    '認為公園存在便保證每位家庭都會步行',
    '只在公園內增加標語，忽略路線風險',
  ],['範文例子重點是安全舒適的路線連接目的地。','圍牆不會令到達路線更安全。','目的地存在與路線可用是兩件事。','標語不會移除實際道路危險。'],[10,11],'原文用通往學校、公園和商店的舒適路線展示家庭更可能步行。'),
  transfer('寫一篇關於閱讀減少的文章：圖書館很遠，學生放學後也習慣看手機。','哪種論證結構最能轉用範文？',[
    '先分析取得圖書的空間障礙與日常螢幕習慣，再提出各自對應的措施',
    '只怪學生不懂閱讀，不看圖書館距離',
    '只改善圖書館建築，完全不看放學後的習慣',
    '只有手機是原因，因此不必問圖書館能否到達',
  ],['範文同時處理城市空間與久坐習慣，解方也相應分兩路。','漏掉一項已知的空間原因。','漏掉一項已知的日常習慣。','把雙重原因錯寫成唯一原因。'],[1,2,3,6,12],'原文先分辨兩類成因，再改善公共空間和日常安排。'),
  transfer('另一篇文章已談城市布局與久坐習慣，結尾只寫「大家應該努力步行」。','哪項修訂最貼近範文結尾？',[
    '歸納空間與習慣兩項成因，再提出可步行社區和可持續日常安排',
    '只重複個人應努力，刪除前文的空間因素',
    '突然加入與步行無關的考試分數',
    '宣稱步行不再有健康益處，推翻引言',
  ],['範文結尾對應兩類成因，提出兩類解方。','只勸人努力忽視前文的道路與布局。','引入無關材料，不能回答原因與解方兩問。','這與引言承認的健康益處矛盾。'],[15,16],'原文結尾先歸納 surroundings and routines，再概括 walkable communities 與 daily habits。'),
];
export default {key:'cause-solution:10',meta:{topic:'步行減少的城市與日常成因',summary:'以汽車為中心的布局及久坐日常令步行減少；安全公共空間和融入生活的步行安排可改善。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
