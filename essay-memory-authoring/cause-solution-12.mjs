// Reviewed Cause/Solution 12: urban overpopulation and matched regional/urban solutions.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-12-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:12'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'As more people come to cities for jobs and better chances, too many people in one city has become a serious problem.',
  'This essay looks at two main problems: pressure on homes and public services, and a worse daily life; it then gives practical ways to fix them.',
  'The first problem is that homes cost too much and there are not enough suitable places to live.',
  'When many people try to get a small number of homes, rents go up fast and poorer people may have to live in small flats or housing built without formal permission.',
  'This also makes schools, hospitals and basic cleaning services too busy because they must serve more people than they were built for.',
  'So a city may offer chances, but life there can be costly, stressful and bad for health.',
  'Another serious problem is that daily life gets worse in crowded parts of cities.',
  'More people usually mean traffic jams, longer trips to work and more air pollution.',
  'For example, if thousands of workers go to the same work areas each morning, roads and public transport quickly become too full.',
  'This takes time, makes people less productive and slowly turns the city into a place where people struggle through each day rather than enjoy its chances.',
  'We can fix these problems by improving smaller towns and planning cities better.',
  'Governments should bring jobs, universities and dependable public services to smaller towns so that moving to a big city is not the only way to have a better life.',
  'Also, cities need more homes people can afford, better public transport and stronger planning rules so that crowded areas do not grow without the roads and services they need.',
  'To sum up, too many people in cities may cause too few homes, busy public services, traffic jams and pollution.',
  'But we can reduce these problems if governments make smaller places more attractive and plan city growth more carefully.',
];
const vocabulary=[
  [['As cities attract more people','As more people come to cities','隨城市吸引更多人'],['employment','jobs','工作'],['better prospects','better chances','更好前景'],['urban overpopulation','too many people in one city','城市人口過多']],
  [['major problems','main problems','主要問題'],['pressure on housing','pressure on homes','住房壓力'],['decline of everyday living conditions','worse daily life','日常生活質素下降'],['practical ways','practical ways','實際方法']],
  [['unaffordable','cost too much','難以負擔'],['inadequate','not enough suitable places to live','合適住所不足']],
  [['compete for a limited number of homes','try to get a small number of homes','競爭有限住所'],['rents rise sharply','rents go up fast','租金急升'],['cramped apartments','small flats','狹小單位'],['informal settlements','housing built without formal permission','非正式聚居區']],
  [['heavy pressure','too busy','沉重壓力'],['sanitation systems','basic cleaning services','衛生系統'],['designed for','built for','原本設計容量']],
  [['As a result','So','結果'],['promise opportunity','offer chances','象徵機會'],['expensive','costly','昂貴'],['unhealthy','bad for health','不利健康']],
  [['deterioration of daily life','daily life gets worse','日常生活質素下降'],['crowded urban areas','crowded parts of cities','擁擠市區']],
  [['Large populations','More people','龐大人口'],['traffic congestion','traffic jams','交通擠塞'],['commuting times','trips to work','通勤時間'],['higher levels of air pollution','more air pollution','空氣污染增加']],
  [['For example','For example','例如'],['business districts','work areas','商業區'],['overloaded','too full','不勝負荷']],
  [['wastes time','takes time','浪費時間'],['reduces productivity','makes people less productive','降低生產力'],['surviving the routine','struggle through each day','應付日常壓力'],['enjoying its opportunities','enjoy its chances','享受城市機會']],
  [['solved through a combination of','fix these problems by','透過結合方式解決'],['regional development','improving smaller towns','區域發展'],['urban planning','planning cities','城市規劃']],
  [['create jobs','bring jobs','創造就業機會'],['reliable public services','dependable public services','可靠公共服務'],['major city','big city','大城市'],['only path','only way','唯一途徑']],
  [['At the same time','Also','與此同時'],['affordable housing','homes people can afford','可負擔住房'],['stronger public transport networks','better public transport','完善公共交通'],['stricter planning rules','stronger planning rules','更嚴格規劃規則'],['proper infrastructure','roads and services they need','適當基建']],
  [['In conclusion','To sum up','總結'],['housing shortages','too few homes','住房短缺'],['congestion','traffic jams','交通擠塞'],['pressure on public services','busy public services','公共服務壓力']],
  [['However','But','然而'],['reduced','reduce','減輕'],['smaller regions','smaller places','較小地區'],['manage urban growth','plan city growth','管理城市增長']],
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
  frame(0,['As ', ', ', ' has become '],['趨勢形成的背景','因此出現的社會現象','現象帶來的挑戰'],'As 把求職流入與城市人口壓力連在一起。','開頭要指出一項社會趨勢及其形成背景時。','As the school gains more pupils, classroom crowding has become a problem.','As...has become','由背景引出問題'),
  frame(1,['namely ', ', before suggesting '],['本文將討論的兩類問題','住屋服務與生活質素的具體問題','隨後提出解方的安排'],'namely 明列兩類問題；before suggesting 告知文章會轉向可行解方。','題目同時問問題與解法，需要在引言交代分析重點與文章方向時。','This report examines two concerns, namely cost and safety, before suggesting changes.','namely...before suggesting','預告問題類別及解方'),
  frame(2,[' is that '],['第一項城市問題','住房難以負擔且供應不足'],'is that 後用完整子句說出第一項後果。','主體段開始回答問題題，需要直接點出可展開的首要後果時。','The first problem is that families cannot afford suitable homes.','is that','直接點出第一項問題'),
  frame(3,['When ', ', rents rise sharply, and '],['太多人競爭有限住所的條件','租金升後窮人可能面對的居住結果'],'When 定出供需失衡條件；主句接上租金與居住後果。','已指出一項資源問題，還需展示需求增加如何影響較脆弱的人時。','When too many families seek few flats, rents rise sharply, and some move farther away.','When...rents rise','把供需失衡接到居住後果'),
  frame(4,[' because '],['學校醫院與衛生服務承壓的現象','服務人數超過原有容量的原因'],'because 解釋公共服務壓力來自需求超出設計容量。','已指出服務受壓，需要解釋為何現有容量未必足以應付新增需求時。','Clinics are crowded because they serve more people than planned.','because','解釋公共服務超負荷的原因'),
  frame(5,['As a result, ', ', but '],['城市可能帶來機會的承認','不少居民實際生活變得昂貴緊張'],'As a result 收合住屋與服務問題；but 對照機會承諾和居民現實。','需要承認一項選擇的吸引力，同時指出其可能帶來的代價時。','As a result, the town offers jobs, but many families cannot afford housing.','As a result...but','對比承諾與實際生活'),
  frame(6,[' is the '],['第二項城市問題','擁擠地區日常生活質素下降'],'is the 清楚切換到交通與環境方面的第二問題。','第一項問題分析完畢，需要開啟另一類不同的生活影響時。','Another serious problem is the loss of safe public space.','Another...is the','開啟第二類問題'),
  frame(7,[' lead to '],['人口規模大','交通擠塞、通勤與空污等結果'],'lead to 把人口規模與交通和空氣品質的變化相連。','已提出生活品質受影響，還要列出可觀察的具體後果時。','Large crowds can lead to delays and noisier streets.','lead to','列出人口增加的日常後果'),
  frame(8,['For example, if ', ', ', ' quickly become '],['同時增加需求的條件','受影響的設施','設施的超載結果'],'For example, if 用早上通勤情境展示擠塞怎樣形成。','概括一種擠塞或延誤後，需要用具體時間地點說明其機制時。','For example, if everyone leaves at eight, roads and buses quickly become crowded.','For example, if','用通勤情境展示容量問題'),
  frame(9,[', reduces productivity and gradually '],['擠塞先浪費時間','城市逐漸成為難以享受機會的地方'],'and gradually 說問題不只造成即時延誤，也慢慢改變生活品質。','已給出即時損失的例子，還要推到較長期的生活感受時。','This wastes time, reduces productivity and gradually makes travel exhausting.','and gradually','由即時損失推到長期影響'),
  frame(10,[' can be solved through '],['前文兩類城市問題','區域發展與更好規劃的配套'],'through 把解方分成減少流入壓力與管理現有增長兩路。','問題分析完畢，解方段需先概括兩種互補策略時。','The gap can be solved through better local services and careful planning.','can be solved through','提出互補的兩條解方'),
  frame(11,[' should ',' so that '],['負責的政府','小城鎮需增加的工作大學與服務','搬往大城不再是唯一途徑的目的'],'so that 明確說明在小城鎮創造機會，是為了降低只能湧入大城的壓力。','提出改善某地條件的措施後，需要交代它如何改變人的選擇時。','Governments should expand local training so that families have more choices.','should...so that','列措施並說明政策目的'),
  frame(12,['At the same time, ',' to prevent '],['城市自身需要的住屋交通與規劃措施','避免社區在缺基建下繼續擴張的目的'],'At the same time 把區域發展接到城市內部改善；to prevent 指出要避免的後果。','已提出一地的措施，還須補充另一地應如何同步準備時。','At the same time, cities need safer streets to prevent crowding around stations.','At the same time...to prevent','補上城市措施及其預防目標'),
  frame(13,['In conclusion, ',' can cause '],['城市人口過多','住屋、服務、交通與污染的問題清單'],'In conclusion 收束問題段；can cause 保留不同城市後果可能不一的分寸。','結尾要精簡回答問題題，概括最主要的後果時。','In conclusion, rapid growth can cause higher rents and bus delays.','In conclusion...can cause','在結尾歸納多類問題'),
  frame(14,['However, ',' if '],['這些問題可減輕的判斷','政府改善小城鎮與城市規劃的條件'],'However 由問題轉到希望；if 說明減輕問題需要兩方面實際行動。','已歸納問題，結尾要對應收束兩種互補解方時。','However, crowding can fall if planners improve services in nearby towns.','However...if','以條件式解方收束'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+5)%specs.length,(i+10)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的問題與解方次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('文章把人口過多的問題分成哪兩類？',['住屋和公共服務受壓，以及日常生活質素下降','只有城市建築物顏色不一致','只有小城鎮大學數量增加','所有居民都立即得到廉價住所'],'引言明列住房服務與日常生活質素兩類問題。'),
  quiz('兩條主要解方路線是甚麼？',['發展小城鎮，並改善大城市的住屋交通和規劃','只勸所有人離開城市，不改任何條件','只在城市多畫標線，不處理住屋','只增加新聞宣傳，不創造工作與服務'],'區域發展減少單向湧入，城市規劃處理已存在的增長。'),
];
const route=[sequence('由城市壓力到兩條互補解方',[
  ['引言：界定問題','人口持續流入，住屋服務和日常生活質素承壓。'],
  ['主體一：住屋與公共服務','有限住房推高租金；學校、醫院和衛生系統服務超出容量。'],
  ['主體二：交通與污染','同時通勤造成擠塞、時間浪費與空氣污染。'],
  ['解方及結尾：兩地都要改善','小城鎮增加機會，大城市改善可負擔住屋、交通與規劃。'],
],'不要把所有解方都放在城市內；範文也處理人們為何只能湧入大城。')];
const evidence=[
  quiz('住屋壓力如何首先出現？',['大量居民競爭有限住所，租金上升，低收入者可能住進狹小或非正式居所','住宅數目越少，租金一定立即下降','所有新住戶都自動得到寬敞單位','房屋價格與供需完全無關'],'範文由有限房屋競爭推到租金與居住條件。'),
  quiz('公共服務為何承受壓力？',['使用人數超過學校、醫院和衛生系統原先設計容量','城市學校和醫院完全沒有服務使用者','只因所有人拒絕看醫生','公共服務每增加一人便自動無限擴大'],'因果關係在於需求增長快於服務容量。'),
  quiz('商業區早上同時湧入工人的例子說明甚麼？',['道路與公共交通可能很快超負荷，造成延誤與壓力','所有工人都在同一分鐘永久失去工作','交通系統乘客越多就一定越空','通勤時間與道路容量沒有關係'],'具體例子展示高峰需求與交通容量不匹配。'),
  quiz('為何要在較小城鎮創造工作和服務？',['令改善生活不必只靠搬往大城市，減少單向人口壓力','迫使所有家庭同時搬回鄉村','取消大城市所有就業機會','只讓小城鎮變成觀光景點'],'範文透過區域發展增加居民可選擇的地點。'),
  quiz('大城市內部需要哪些配套？',['可負擔住屋、完善公共交通和防止無基建擴張的規劃規則','只建商業廣告牌，不處理交通或住房','先讓社區無限擴張，再取消公共設施','完全不檢查新社區是否有道路和服務'],'解方對應住屋、交通及基建不足三項問題。'),
  quiz('結尾為何用「可能造成」而非「必然造成」？',['不同城市可能程度不同，原文只主張人口過多可帶來這些風險','因為原文認為城市人口從來沒有增長','因為所有污染都與人口完全無關','因為住房和服務在文中沒有出現'],'can cause 保留可能性，不把所有城市寫成相同結果。'),
];
const logic=[
  sequence('住屋與服務壓力的形成',[
    ['人口流入而住所有限','更多人競爭同一批房屋。'],
    ['租金急升','低收入居民更難取得合適住所。'],
    ['部分人轉入擠迫或非正式居所','住房品質與負擔能力一同惡化。'],
    ['公共服務超出容量','學校、醫院及衛生設施服務更多人。'],
  ],'先交代人口與住房供需，再分析不同居民及公共服務的後果。'),
  sequence('區域發展與城市規劃各自處理甚麼',[
    ['小城鎮增加機會','工作、大學和可靠服務令居民有其他選擇。'],
    ['大城市增加可負擔住屋','直接回應住房不足與租金壓力。'],
    ['改善交通網絡','減少高峰通勤造成的延誤和擠塞。'],
    ['規劃擴張與基建同步','避免擁擠社區在缺少道路服務下繼續增長。'],
  ],'兩條解方互補：一條分散新增需求，一條管理已有城市人口。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一座城市有大量新住戶，租金急升，低收入家庭開始住進面積過小的單位。','哪項說明最能轉用範文？',[
    '先查住屋供應有否落後人口，再分析租金',
    '只把租金上升歸因於家庭不願搬家換屋',
    '宣稱人口增加必然使住房供應更便宜',
    '只看樓宇外牆顏色，不看住屋可負擔程度',
  ],['範文由有限房屋與更多競爭者推到租金和擠迫。','家庭意願不能替代供需分析。','與範文指出的租金急升方向相反。','外牆顏色不解釋可負擔住屋不足。'],[2,3],'原文先點出住房難以負擔，再說競爭有限房屋如何推高租金。'),
  transfer('某區人口增長很快，醫院排隊時間延長，但醫院多年未擴充。','哪項判斷最貼近範文？',[
    '檢查服務人數是否超出容量，再考慮分流',
    '只要人口增加，醫院容量就會自動無限擴大',
    '排隊必然與需求無關，毋須檢查服務量',
    '只更換醫院招牌字體，便能增加醫生數目',
  ],['範文把新增需求超過服務設計容量視為核心機制。','容量不會因需求增加而自動改變。','忽略題目明示的人口與容量差距。','字體不能增加實際醫療供應。'],[1,4],'原文說公共服務要照顧超過原本設計容量的人數。'),
  transfer('商業區每天早上都有大量員工同時乘車到達，路面和地鐵接近飽和。','哪項例子運用最恰當？',[
    '用早上通勤說明交通高峰如何造成超負荷',
    '把通勤延誤當作人人自願浪費時間的證據',
    '只討論深夜交通，迴避工作日的早上高峰',
    '宣稱工作地區集中也不會影響交通容量',
  ],['範文的例子正以早上同一商業區的通勤潮說明超負荷。','延誤不等於乘客自願浪費時間。','深夜不是給定的擠塞情境。','集中需求正是例子的條件。'],[7,8,9],'原文用商業區早上同時到達的工人展示擠塞機制。'),
  transfer('政府只打算擴建首都地鐵，卻不處理小城鎮缺工作和大學的問題。','按範文，還缺少哪項解方？',[
    '增加小城鎮工作與服務，讓居民有留鄉選擇',
    '只把小城鎮工作全部搬到首都中心區',
    '停止提供各地所有高等教育和醫療服務',
    '只在首都增加廣告，完全不看各區域機會',
  ],['區域發展可減少只有首都才有機會的單向流入。','這會強化而非減輕人口集中。','與範文增設大學的方向相反。','廣告不能補上工作和服務差距。'],[10,11],'原文把小城鎮工作、大學及可靠服務列為第一條解方。'),
  transfer('新住宅區不斷擴張，但道路、供水和學校都還沒建好。','哪項城市措施最直接？',[
    '新社區與必要基建同步規劃，避免擁擠',
    '先無限制批准住宅，之後永久不提供服務',
    '只提高地區名稱的知名度，不處理基建',
    '因為房屋增加，就斷定學校需求一定下降',
  ],['範文要求較嚴格規劃，防止社區缺少基建仍擴張。','這正是原文要避免的情況。','名稱不能代替水、道路和學校。','人口增加可能增加而非減少學校需求。'],[12,14],'原文要求城市規劃規則與適當基建相配。'),
  transfer('某城市交通擠塞，但規劃者只討論租金，完全不問通勤與空氣品質。','哪項補充最能保持範文完整？',[
    '把通勤延誤與污染一併納入生活質素分析',
    '只再重複租金一項，不看交通與污染問題',
    '宣稱污染和交通在文章中從未被討論',
    '把所有路況和空氣問題推給居民的性格',
  ],['範文把生活質素下降列成與住房服務並行的第二類問題。','漏掉文章的交通與環境主體段。','原文明確列出交通和污染。','性格推論不能取代容量與通勤分析。'],[6,7,8,9],'原文單獨一段分析擠塞、通勤和污染。'),
  transfer('另一篇文章討論學校過度擠迫：熱門學校集中於市中心，周邊學校設施較少。','哪種解方結構最能轉用範文？',[
    '提升周邊學校吸引力，擴充熱門學校容量',
    '只擴充市中心學校，永遠不改善周邊學校',
    '只宣傳周邊學校，卻不提供實際設施和教師',
    '取消所有學校，讓每個家庭自行解決教育需要',
  ],['範文的兩路策略是分散需求及管理已集中的需求。','漏掉分散新增需求的可能。','宣傳沒有改變教育設施差距。','取消學校與解決擠迫目標相反。'],[10,11,12],'原文把區域發展與城市內部規劃結合。'),
  transfer('有人認為人口過多只會造成污染，完全不會影響住房或公共服務。','哪個回應最有文本根據？',[
    '範文指出住屋競爭推高租金，服務也可能不足',
    '原文只談空氣污染，完全沒有提及住房問題',
    '只要有空氣污染，醫院就必定會自動擴建',
    '污染存在便證明城市不可能有交通擠塞',
  ],['住屋和服務是範文第一組問題，不能刪除。','與第一主體段的內容相反。','需求不會自動增加服務容量。','污染與交通擠塞可同時存在。'],[1,2,3,4,7],'原文在污染以外還詳述住房和公共服務壓力。'),
  transfer('一項地方政策在小城鎮創造工作，但進城住戶仍面對住房不足。','哪項下一步最符合範文？',[
    '保留區域工作政策，城市亦須增加住屋配套',
    '因為小城鎮已有工作，就不需處理現有城市居民',
    '只興建沒有交通和公共服務的新住宅區',
    '取消所有小城鎮就業機會，令更多人口集中',
  ],['範文的區域與城市內部措施互補，不能互相替代。','現有城市需求仍需處理。','缺基建擴張是範文明確警惕的問題。','會破壞分散新增需求的目標。'],[10,11,12],'原文說區域發展與更好城市規劃要結合。'),
  transfer('結尾已列出住屋短缺、服務壓力與交通擠塞，卻沒有回應「如何解決」。','怎樣修訂最忠於範文？',[
    '補上小城鎮吸引力及審慎管理城市兩項行動',
    '再列一遍所有城市問題，不提任何對應措施',
    '突然加入與城市人口完全無關的學校考試分數',
    '宣稱所有城市人口壓力都已自行完全消失',
  ],['範文最後一句對應兩條解方路線，回答題目第二問。','只重複問題，仍漏答解方。','與題目和前文分析無關。','既不符合文章現況，也沒有提出解決方法。'],[13,14],'原文結尾先歸納問題，再以區域與城市規劃收束。'),
];
const revisedAlternatives={
  0:[['先問家庭是否願搬家，再看租金變化','先控制租金，住屋供應可留待之後','先查人口增長，再把擠迫歸因裝修偏好'],['家庭選擇不足以解釋整體租金急升。','租金壓力與供應不足可能同源。','低收入家庭住得擠迫不是裝修偏好。']],
  1:[['檢查候診時間，服務容量可先維持','先增設醫院新標示，再比較人口數','只查醫生人數，不問居民需求變化'],['單看時間未解釋需求與供應是否失衡。','標示不能增加醫療服務容量。','容量與人口增長都須比較。']],
  3:[['擴建首都地鐵，讓小城鎮居民更快搬入','增設小城鎮廣告，工作機會可稍後規劃','只改善首都住房，忽略區域服務落差'],['更易遷入未必減輕首都壓力。','吸引力須有真實工作與服務支撐。','區域機會不均仍會推動人口集中。']],
  4:[['新社區先建住宅，服務可待入住後再規劃','先擴建道路，供水及學校可留待日後','住宅數量增加，基建需求只按舊人口計'],['入住後才規劃可能造成服務缺口。','必要基建不只道路。','新增居民也會使用供水與學校。']],
  5:[['分析通勤延誤，空氣品質留給環保報告','租金與交通都重要，污染可稍後再處理','將擠塞列入分析，居民時間損失可略過'],['空氣污染也是城市生活質素的一部分。','範文同時討論擠塞與污染。','通勤延誤正是擠塞的重要後果。']],
  6:[['只擴市中心容量，周邊學校可逐步等待','改善周邊設施，市中心擠迫可暫時不管','先宣傳周邊學校，教師資源留待日後增加'],['單一擴建未處理學校集中。','周邊改善與熱門校容量都要看。','沒有實際設施與教師難轉移需求。']],
  7:[['範文提到污染，住房壓力則仍待進一步確認','住屋競爭可能增加，醫療容量未必受影響','人口過多會擠塞，但租金變化可暫時另議'],['範文明確分析住屋競爭與租金。','服務需求也可能超過現有容量。','題目要求回應住房和公共服務。']],
  8:[['保留小城鎮工作，城市住房交由市場調節','城市增住屋配套，區域工作政策可先停','小城鎮工作有幫助，已遷入者可稍後照顧'],['已有住房不足仍須城市規劃。','兩地措施共同減壓，不能只選其一。','城市現有住戶的需求不能延後忽略。']],
  9:[['總結住屋與交通壓力，解方留給後續文章','補上城市住房規劃，小城鎮政策可略去','只談區域工作機會，城市服務壓力另議'],['題目同時問如何解決，結尾須回應。','範文提出區域與城市兩層解方。','城市擠迫也要配合基建與服務規劃。']],
};
Object.entries(revisedAlternatives).forEach(([index,[options,reasons]])=>{transferTasks[index].options.splice(1,3,...options);transferTasks[index].explanations.splice(1,3,...reasons);});
export default {key:'cause-solution:12',meta:{topic:'城市人口過多的住屋交通問題與解方',summary:'住房和服務容量不足、擠塞污染損害生活；小城鎮發展與審慎城市規劃共同減壓。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
