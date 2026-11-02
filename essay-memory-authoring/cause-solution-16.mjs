// Reviewed Cause/Solution 16: car-dependent planning, transport alternatives and traffic.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-16-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:16'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In many cities and towns, too many vehicles are using the streets.',
  'This is mainly because cities have been designed for cars and other ways to travel are poor.',
  'Better buses and trains, more careful use of roads, and easier short trips without cars can help.',
  'One main reason is that many cities have been built for driving.',
  'When homes, jobs, schools and shops are far apart, people almost have to drive to do everyday things.',
  'For example, a parent may drive to school, work and a shop in one morning, making several car trips for one family.',
  'A second reason is that buses and trains are not good enough.',
  'If buses are slow, trains are crowded, or routes do not reach where people live, driving may seem like the only useful choice.',
  'Then each driver tries to save time, but everyone loses time in traffic.',
  'The first answer is to make buses and trains truly easy to use.',
  'Governments should pay for more frequent buses, dependable trains and simple tickets, so that taking public transport feels like a sensible choice.',
  'For example, someone who can travel across a city quickly with one cheap ticket is much less likely to drive.',
  'Local governments should also control car use with charges for busy roads, fewer parking places and special bus lanes.',
  'Cities should build safe paths for walking and cycling, particularly for short trips.',
  'These changes cut trips that do not need a car without stopping people from driving completely, leaving space for important trips, deliveries and emergency vehicles.',
  'In short, heavy traffic is largely caused by cities built for cars and poor choices for getting around.',
  'It can be reduced if cities improve public transport while helping people make short and less important trips in other ways.',
];
const vocabulary=[
  [['carrying more vehicles than they can reasonably absorb','too many vehicles are using the streets','車流超出合理負荷'],['roads','streets','道路']],
  [['car-centred planning','cities have been designed for cars','以汽車為中心的規劃'],['weak alternatives','other ways to travel are poor','替代交通不足'],['private transport','cars','私人交通']],
  [['addressed','help','處理'],['improving public transport','Better buses and trains','改善公共交通'],['managing road use','more careful use of roads','管理道路使用'],['short local journeys','short trips','短途本地出行']],
  [['important cause','main reason','重要原因'],['urban areas','cities','城市地區'],['built around driving','built for driving','圍繞駕車建設']],
  [['spread across wide distances','far apart','相距甚遠'],['ordinary routines','everyday things','日常安排'],['force people onto the road','have to drive','迫使人駕車']],
  [['A parent','a parent','一名家長'],['turning one household into several car trips','making several car trips for one family','一個家庭多次駕車']],
  [['A second cause','A second reason','第二個原因'],['poor quality of public transport','buses and trains are not good enough','公共交通欠佳']],
  [['overcrowded','crowded','過度擁擠'],['connect well with residential areas','reach where people live','接駁住宅區'],['only practical choice','only useful choice','唯一可行選擇']],
  [['In that situation','Then','在那種情況'],['congestion','traffic','交通擠塞'],['ends up losing time','loses time','最後浪費時間']],
  [['first solution','first answer','第一項解方'],['genuinely convenient','truly easy to use','真正方便']],
  [['invest in','pay for','投資'],['frequent buses','more frequent buses','班次頻密的巴士'],['reliable rail services','dependable trains','可靠鐵路'],['simple ticketing systems','simple tickets','簡單票務'],['common sense','a sensible choice','合理選擇']],
  [['a worker','someone','上班族'],['one affordable ticket','one cheap ticket','一張價格合理的車票'],['far less likely to drive','much less likely to drive','較不會駕車']],
  [['local authorities','Local governments','地方政府'],['congestion charges','charges for busy roads','擠塞徵費'],['limited parking','fewer parking places','限制泊車'],['bus lanes','special bus lanes','巴士專線']],
  [['safe walking and cycling routes','safe paths for walking and cycling','安全步行及單車路線'],['especially','particularly','尤其'],['short trips','short trips','短途出行']],
  [['measures','changes','措施'],['unnecessary traffic','trips that do not need a car','不必要車流'],['without banning cars completely','without stopping people from driving completely','不全面禁車'],['essential journeys','important trips','必要出行'],['emergency vehicles','emergency vehicles','緊急車輛']],
  [['In conclusion','In short','總結'],['car-dependent planning','cities built for cars','依賴汽車的規劃'],['unattractive transport alternatives','poor choices for getting around','缺乏吸引力的替代交通']],
  [['reduced','reduced','減少'],['improve public transport','improve public transport','改善公共交通'],['encouraging people','helping people','鼓勵人們'],['in other ways','in other ways','以其他方式']],
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
 frame(0,['In many cities and towns, '],['道路車流超出合理負荷的背景'],'In many cities and towns 指定問題出現的範圍，再以主句交代車流過多。','開頭要限定某問題發生的地點或群體，避免說成普遍現象時。','In many cities and towns, buses are too slow for commuters.','In many cities and towns','限定問題的地點範圍'),
 frame(1,[' is mainly caused by '],['交通問題','以私家車為中心的規劃及替代交通不足'],'mainly caused by 直接指出兩項主要原因，保留還可能有其他因素的空間。','引言要預告主要原因，同時保留仍可能有次要原因時。','The shortage is mainly caused by rising demand and weak supply.','mainly caused by','指出主要原因'),
 frame(2,[' can be addressed by '],['道路交通問題','公共交通道路管理及無車短途出行三類措施'],'can be addressed by 預告可行解方，沒有承諾完全消除擠塞。','引言要概括幾項可行方法，而不承諾徹底解決時。','The problem can be addressed by better buses and safer footpaths.','can be addressed by','概括可行解方'),
 frame(3,[' is that '],['一項重要原因','城市建設以駕車為中心的內容'],'is that 把城市規劃這個抽象原因說成清晰的完整判斷。','段首要直接指出核心原因，讓下文可逐步展開時。','One important cause is that homes are far from workplaces.','is that','直接開出第一個原因'),
 frame(4,['When ', ', '],['住宅工作學校及商店相距甚遠的條件','日常安排幾乎迫人駕車的後果'],'When 交代城市分散布局出現時，居民日常出行會受甚麼影響。','要把某種安排或條件連到人們後續選擇時。','When jobs and shops are far apart, families often have to drive.','When','展示空間布局到出行選擇的機制'),
 frame(5,[', for example, ', ', turning '],['一名家長','早上駕車前往多個目的地的例子','一個家庭多次駕車的結果'],'for example 落實日常行程；turning 把一個家庭的安排連到多次車程。','要以一人日常行程為例，展示多項小需求如何累積成更大影響時。','A parent, for example, may visit two schools, turning one morning into several car trips.','for example...turning','以家庭行程具體化車流'),
 frame(6,[' is the '],['第二項原因','公共交通質素欠佳'],'A second cause is the 開出與城市布局不同的另一項原因。','分析完第一項原因後，要轉入不同的第二項原因時。','A second cause is the poor quality of local buses.','A second cause is the','切換到第二原因'),
 frame(7,['If ', ', people '],['巴士慢列車擠及住宅接駁差的條件','把駕車視作唯一實用選擇的反應'],'If 把服務欠佳設為條件；主句說明人們為何選擇駕車。','要用 if 描述條件，再說明人們在該條件下的可能選擇時。','If buses rarely arrive, people may feel they must drive.','If...people','展示服務質素到個人選擇的因果'),
 frame(8,[', but '],['每名司機想省時間','整體卻在擠塞中浪費時間'],'but 對照個人希望與集體結果，呈現交通擠塞的矛盾。','個別選擇看似合理，但許多人同時作出後產生相反的集體結果時。','Each family tries to leave earlier, but everyone waits in the same queue.','but','對照個人動機與集體結果'),
 frame(9,[' is to '],['第一項解決方法','令公共交通真正方便的目標'],'is to 直接陳述解法的目標，再由後句展開實行方式。','措施段開頭需要直接寫出首要改善目標時。','The first solution is to make buses easier to use.','is to','提出第一項解方'),
 frame(10,[', so that '],['政府投資頻密巴士可靠鐵路與簡單票務','乘車變成合理選擇的目的'],'so that 說明投資的作用是改變實際使用體驗，不只增加設施。','列出投入或措施後，要用 so that 說明受益者能怎樣行動時。','Cities should run frequent buses, so that commuters can rely on them.','so that','把措施連到使用者選擇'),
 frame(11,['For instance, ', ' is far less likely to '],['一名可用便宜車票快速跨城的上班族','仍然選擇駕車的機會'],'For instance 用具體通勤情境支撐公共交通便利性可能減少駕車。','概括措施後，需要用具體個人情境支持其可能效果時。','For instance, a worker with a direct train is far less likely to drive.','For instance...less likely','用通勤例子說明行為變化'),
 frame(12,[' through '],['地方政府管理私家車使用的責任','擠塞徵費泊車限制及巴士專線的方法'],'through 列出管理道路使用的工具，補足單靠提升公共交通的不足。','要指出某機構可透過哪些具體工具管理一項行為時。','Councils can manage car use through parking limits and bus lanes.','through','列出道路管理工具'),
 frame(13,[', especially for '],['建設安全步行及單車路線的措施','特別適合的短途出行'],'especially for 把步行單車方案限於較合適的短程情況。','提出替代方式時，需限定在哪些情況特別適用時。','The town should build safe paths, especially for short journeys.','especially for','限定主動出行的適用範圍'),
 frame(14,[' without ', ', leaving '],['減少不必要車流的效果','不需全面禁止汽車的界線','必要旅程送貨與緊急車輛得到的道路空間'],'without 澄清不必全面禁車；leaving 指出釋出的道路容量給誰用。','要說明一項措施能減少問題，同時不必採取極端禁令，並交代保留的用途時。','Better buses reduce traffic without banning cars, leaving room for ambulances.','without...leaving','說明措施界線及受益對象'),
 frame(15,['In conclusion, ', ' and '],['依賴汽車的城市規劃','缺乏吸引力的替代交通'],'and 把兩項主要原因在結尾並列，回應題目原因部分。','結尾要把兩條主要原因壓縮成一個完整判斷時。','In conclusion, delays result from long distances and poor bus routes.','In conclusion...and','概括兩項原因'),
 frame(16,[' if ', ' while '],['交通擠塞可減少的主張','城市改善公共交通的條件','鼓勵短途及非必要旅程改用其他方式的同時措施'],'if 設定改善條件；while 表示公共交通和改變短途出行要並行。','結尾要用 if 設條件，並以 while 說明兩類措施須並行時。','Congestion can fall if cities improve buses while making walking safer.','if...while','並列互補措施收束'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的原因及解法次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('文章認為交通繁忙主要有哪兩個原因？',['以汽車為中心的城市規劃，以及欠吸引力的公共交通替代選擇','所有司機都故意令其他人遲到','只有道路標誌字體太小','城市居民完全不需要往返不同地點'],'引言和原因段把空間布局與公共交通質素列為兩條主線。'),
 quiz('文章的解法如何配合？',['改善公共交通、管理道路使用，並讓短途出行可選步行或單車','只擴建停車場，不改善任何替代方式','禁止所有汽車，包括救護車','只要求所有人提前起床而不調整交通'],'解法同時改善選項並管理需求，保留必要車程。'),
];
const route=[sequence('由道路負荷走到配套解方',[
 ['引言：道路超負荷','概括城市布局與交通替代不足，並預告三類措施。'],
 ['原因一：分散布局','住屋與學校工作及商店距離遠，日常生活累積多次駕車。'],
 ['原因二：差的替代交通','巴士列車不可靠或接駁不便，個人轉向駕車而共同陷入擠塞。'],
 ['措施與結尾：改善及管理','讓公交方便，管理私家車，改善步行單車，為必要車程留空間。'],
],'不能只把堵塞歸咎司機；文章把城市設計與可用交通選擇連到行為。')];
const evidence=[
 quiz('分散的城市布局如何增加車流？',['住宅學校工作和商店相距遠，家庭日常路線會累積多次駕車','所有設施距離越遠，步行越容易','只有一名家長會造成整個城市所有車流','設施距離與交通選擇完全無關'],'範文用家長一天多站行程說明城市布局如何形成車程。'),
 quiz('公共交通質素差的哪幾方面被明確提及？',['巴士慢、列車擠，以及服務未能良好接駁住宅區','只有巴士車身顏色不好看','所有列車都必然免費','所有城市均完全沒有巴士或列車'],'原文列出速度、容量及接駁三方面的條件。'),
 quiz('為何個別司機想省時間卻仍可能全部變慢？',['大家都轉向駕車時，道路擠塞令每個人失去時間','每名司機只要想省時，車流便會消失','道路容量不受車輛數量影響','公共交通越方便，所有司機必然更慢'],'文章以 but 對照個人目的與共同結果。'),
 quiz('甚麼公共交通改善可使人更願意轉乘？',['班次頻密的巴士、可靠鐵路和簡單票務，配合可負擔的跨城行程','只有更複雜的轉乘規則','只增加宣傳口號，不改善服務','只減少列車班次'],'範文著重實際速度、可靠度及票價便利。'),
 quiz('地方政府可怎樣管理道路使用？',['擠塞徵費、限制泊車和巴士專線','只把所有車道變成泊車位','取消所有巴士及單車路線','只改道路名字而不調整使用'],'原文列出三種管理私家車使用的工具。'),
 quiz('改善步行單車為何沒有等於全面禁車？',['它主要承接合適的短途旅程，留下道路空間給必要出行、送貨和緊急車輛','文章明言所有汽車都必須立刻禁用','救護車不需要道路','每趟跨城長途都只能步行'],'原文用 especially for short trips 和 without banning cars completely 限定措施。'),
];
const logic=[
 sequence('城市布局到擠塞的因果鏈',[
  ['住宅工作學校商店分散','日常路線跨越較遠距離。'],
  ['一個家庭需要多站行程','家長一早可能駕車往返數個地點。'],
  ['公共交通又慢或接駁差','更多人把駕車當成實際選擇。'],
  ['個人想省時，集體失去時間','車流累積導致擠塞。'],
 ],'不能跳過城市布局和公共交通質素，直接把堵塞歸因個人品格。'),
 sequence('兩類解法如何互補',[
  ['公交有頻密班次及可靠接駁','居民有更可行的替代選擇。'],
  ['擠塞徵費與泊車管理','道路使用受到更審慎的安排。'],
  ['安全步行和單車路線','部分短途旅程不必開車。'],
  ['道路容量留給必要車程','送貨和緊急車輛仍能通行。'],
 ],'改善替代選項與管理現有車流需配套，並不要求全面禁車。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('一個新住宅區離學校、商店和就業中心很遠，居民每天要分別開車往返。','最貼近範文的原因分析是甚麼？',['分散的土地用途把日常需求變成多次駕車行程','居民必然熱愛塞車，所以規劃無關','只要車身較小就不會有任何車程','道路名稱是車流增加的唯一原因'],['原文從設施距離遠推到家庭多站駕車。','忽略城市布局的作用。','車身大小不能消除往返需求。','名稱與出行距離無關。'],[3,4,5],'原文用家長早上多站路線說明規劃如何累積車程。'),
 transfer('某地區已有巴士，但班次疏落，而且沒有路線接到住宅區。','下一項觀察最符合範文？',['居民可能把駕車當成唯一實用選擇','居民一定全都停止出門','巴士越疏落，居民越容易依賴它','住宅接駁與交通決定完全無關'],['原文以慢、擠和接駁差解釋駕車吸引力。','範文沒有說所有人停止出門。','與服務質素的方向相反。','忽略了原文列出的接駁因素。'],[6,7,8],'原文把公交服務差連到更多人選擇駕車。'),
 transfer('市政府只增加巴士班次，但車票系統仍須在每段路重新買票。','哪項補強較忠於範文？',['建立簡單而可負擔的票務安排，讓轉乘更方便','故意使車票更難買','只調整巴士站顏色','因為有班次，便不再需要顧及可靠度'],['範文把簡單票務與頻密巴士、可靠鐵路並列。','複雜票務會削弱便利性。','顏色不能代替使用體驗。','三種改善是互補，不是彼此排除。'],[9,10,11],'原文用一張價格合理的車票展示公共交通誘因。'),
 transfer('市民建議為市中心擠塞路段徵費，並設巴士專線。','這些措施的論證角色是甚麼？',['管理現有道路使用，與改善公共交通互相配合','保證所有居民必須永遠離開城市','只為增加巴士車身重量','表明城市不必提供任何替代交通'],['範文把道路管理列在公交改善之後。','原文沒有主張人口外移。','與車身重量無關。','管理需求需要搭配較好選項。'],[9,12,13],'原文提出擠塞徵費、泊車限制和巴士專線。'),
 transfer('有人反對新單車路線，說這等於禁止任何人駕車去醫院。','根據範文應怎樣回應？',['單車步行主要承接合適短途旅程，必要車程及緊急車輛仍需道路','所有長途及急救車程都必須用單車','新路線會令道路容量自動變成無限','範文明確要求所有車輛完全禁行'],['原文清楚限定短途出行與不全面禁車。','超出路線適用範圍。','道路容量仍需管理。','與 without banning cars completely 相反。'],[13,14],'原文保留必要旅程、送貨及緊急車輛的道路空間。'),
 transfer('一名司機為避開巴士而改開車，許多人作相同選擇後通勤更慢。','最合適的因果說明是甚麼？',['個人想省時的選擇累積起來，可能令大家都在擠塞中失去時間','每名司機開車便保證所有人立即更快','塞車只由一名司機造成','公共交通質素與轉用私家車無關'],['原文指出個人動機與集體結果的矛盾。','忽略道路容量。','不能把集體車流縮成一人行為。','差的替代交通是原因之一。'],[7,8],'原文寫每名司機想省時間，最後卻都在擠塞中失去時間。'),
 transfer('另一篇文章討論校園餐廳擠迫：校舍相距遠，午餐時段又太短。','哪種結構最能轉用範文？',['先分辨空間安排和服務選項兩類原因，再配對具體措施','只責怪學生，不分析任何安排','把兩個原因都說成餐桌顏色','只重複「擠迫」而不說為何'],['範文先分城市布局與公交質素，再提出措施。','跳過制度及設計原因。','顏色與題目給定原因無關。','缺少可檢驗的因果。'],[1,3,6,9],'原文把兩條原因線與相應解法分開。'),
 transfer('地方政府打算只建更多停車場，沒有改善巴士、鐵路或步行路線。','範文最可能指出甚麼不足？',['未提供真正方便的非駕車選項，也未管理私家車使用','停車場一增加，所有旅程便自動變短','旅客從此不需要上班上學','巴士鐵路與擠塞完全無關'],['原文的措施重點是改善替代選擇並管理需求。','停車空間不改變路程。','與真實出行需要不符。','忽略了文章的一整條原因及措施。'],[9,10,12,13],'原文提出頻密巴士、可靠鐵路、票務和步行單車。'),
 transfer('某市已有鐵路，但單程票價高，工人仍每天駕車跨城。','哪種例子最能補足解方？',['用一張價格合理的車票快速跨城，可能降低駕車意願','只讓票價更高而不改服務','改變列車外觀但保留不可負擔的票價','要求所有人停止跨城工作'],['原文用可負擔車票和快的跨城旅程作例子。','高票價不解決情境。','外觀不替代成本或速度。','文章並無禁止工作通勤。'],[10,11],'原文的通勤例子把快而可負擔的乘車連到較少駕車。'),
 transfer('文章結尾只說「交通很差，大家應改善」，沒有交代原因和解法。','怎樣修訂才符合範文？',['概括依賴汽車的規劃和較差替代交通，再收束公交改善與短途轉乘','只再寫一次「交通很差」','只討論車牌樣式','宣稱所有汽車必然要全面禁用'],['原文結尾回收兩項原因及互補解方。','沒有回答題目兩問。','與交通因果無關。','超出文章措施界線。'],[15,16],'原文最後兩句概括原因並提出公交及其他出行方式。'),
];
export default {key:'cause-solution:16',meta:{topic:'道路擠塞的城市規劃與公共交通原因',summary:'城市布局依賴汽車、替代交通不便；改善公交、管理道路和短途步行單車可共同減少擠塞。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
