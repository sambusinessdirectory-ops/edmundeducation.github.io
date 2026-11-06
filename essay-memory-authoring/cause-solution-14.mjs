// Reviewed Cause/Solution 14: growth in flights, environmental effects, matched measures.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-14-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:14'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Tourism has made flying a normal part of life, and more travellers mean people want more flights.',
  'This essay looks at the harm this causes to the environment, especially gas emissions and damage near airports, and then gives ways to reduce it.',
  'The biggest problem is that more flights burn more fuel and therefore send more gases that warm the planet into the air.',
  'Planes burn a lot of fuel, so when airlines add routes or fly more often, more carbon dioxide goes into the air.',
  'After a while, this adds to global warming, which can make very hot days, rising seas and severe weather worse.',
  'A second problem is the damage that happens on the ground.',
  'Busy airports often need bigger buildings, longer runways and more road traffic; these can harm nearby natural areas and make local air and noise pollution worse.',
  'For people and animals near airports, planes constantly taking off and landing can seriously harm the local environment.',
  'Several actions could reduce these problems.',
  'First, governments should help aviation become cleaner by setting stronger rules for emissions and supporting better planes, greener fuel and better control of flights.',
  'If planes burn less fuel and wait less time in the air or on runways, each trip will have less effect on the environment.',
  'Second, countries should make fewer short flights necessary.',
  'For example, fast trains, better long-distance buses and easy local transport can give travellers a good alternative for short journeys.',
  'Airlines could also have to include environmental costs in ticket prices so that very cheap flights do not encourage people to travel without thinking about the harm.',
  'To sum up, more demand for flights harms the environment mainly by adding emissions and putting more pressure on areas near airports.',
  'Cleaner planes and fuel, stronger rules and good alternatives to flying are therefore needed to reduce these problems.',
];
const vocabulary=[
  [['air travel','flying','航空旅行'],['normal part','normal part','正常一部分'],['rising number of travellers','more travellers','旅客增加'],['greater demand for flights','want more flights','航班需求增加']],
  [['environmental problems','harm this causes to the environment','環境問題'],['carbon emissions','gas emissions','碳排放'],['damage around airports','damage near airports','機場周邊破壞'],['practical measures','ways','可行措施']],
  [['most serious problem','biggest problem','最嚴重問題'],['higher fuel consumption','burn more fuel','燃料消耗增加'],['greenhouse gas emissions','gases that warm the planet','溫室氣體排放']],
  [['Aircraft','Planes','飛機'],['aviation fuel','fuel','航空燃料'],['operate extra routes','add routes','增加航線'],['increase flight frequency','fly more often','增加航班頻率'],['released into the atmosphere','goes into the air','排放到大氣中']],
  [['Over time','After a while','長遠而言'],['contributes to global warming','adds to global warming','加劇全球暖化'],['heatwaves','very hot days','熱浪'],['rising sea levels','rising seas','海平面上升'],['extreme weather','severe weather','極端天氣']],
  [['second problem','second problem','第二個問題'],['environmental pressure created on the ground','damage that happens on the ground','地面環境壓力']],
  [['Busier airports','Busy airports','更繁忙機場'],['larger terminals','bigger buildings','更大客運大樓'],['nearby habitats','nearby natural areas','附近棲息地'],['worsen','make local air and noise pollution worse','惡化'],['noise pollution','noise pollution','噪音污染']],
  [['communities and wildlife','people and animals','社區和野生動物'],['constant movement of planes','planes constantly taking off and landing','飛機持續起降'],['heavy environmental burden','seriously harm the local environment','沉重環境負擔']],
  [['several measures','Several actions','多項措施'],['limit these problems','reduce these problems','減少問題']],
  [['cleaner aviation','aviation become cleaner','更清潔航空'],['stricter emissions standards','stronger rules for emissions','更嚴排放標準'],['efficient aircraft','better planes','更高效飛機'],['sustainable aviation fuels','greener fuel','可持續航空燃料'],['air-traffic management','control of flights','空中交通管理']],
  [['use less fuel','burn less fuel','較少燃料'],['circling','wait less time in the air','空中盤旋'],['environmental footprint','effect on the environment','環境影響']],
  [['reduce unnecessary demand','make fewer short flights necessary','減少不必要需求'],['short flights','short flights','短途航班']],
  [['high-speed rail','fast trains','高鐵'],['coach networks','long-distance buses','長途巴士網絡'],['convenient domestic transport','easy local transport','便利本地交通'],['realistic alternative','good alternative','可行替代方案']],
  [['required to include','have to include','被要求納入'],['environmental costs','environmental costs','環境成本'],['extremely cheap flights','very cheap flights','極廉價航班'],['travel casually','travel without thinking','隨意出行']],
  [['In conclusion','To sum up','總結'],['rising demand for flights','more demand for flights','航班需求增加'],['increased emissions','adding emissions','排放增加'],['pressure around airports','pressure on areas near airports','機場周邊壓力']],
  [['Cleaner technology','Cleaner planes and fuel','更清潔技術'],['stricter regulation','stronger rules','更嚴監管'],['attractive alternatives','good alternatives','吸引人的替代方式'],['necessary','needed','必需']],
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
  frame(0,[', and '],['旅遊業使飛行變得常見','旅客增加帶來航班需求'],'and 把旅遊普及與航班需求上升串成同一句背景。','開頭需要交代一種需求為何持續增加時。','Online shopping has grown rapidly, and more deliveries are now needed.','and','把趨勢接到需求'),
  frame(1,['especially ', ', before suggesting '],['本文將討論的環境問題','碳排放與機場周邊破壞兩個重點','隨後提出減害措施'],'especially 收窄到兩類環境傷害；before suggesting 預告解方。','題目同時問問題及措施，需在引言標明兩類問題與文章方向時。','This report examines several harms, especially waste and noise, before suggesting controls.','especially...before suggesting','預告環境問題與措施'),
  frame(2,[' is that '],['最嚴重的飛行問題','航班增加帶來更多燃料與溫室氣體'],'is that 直接指出燃料消耗與排放的關係。','第一個主體段要提出可逐步分析的主要問題時。','The most serious problem is that extra journeys use more fuel.','is that','直接指出主要環境問題'),
  frame(3,[', so when ', ', more carbon dioxide '],['飛機耗用大量燃料','航空公司加航線或加班次的條件','二氧化碳排入大氣的結果'],'so when 交代加開航班的條件，後面指出排放隨之增加。','已指出某種排放或成本，需要解釋活動增加如何令它上升時。','Cars burn fuel, so when traffic rises, more carbon dioxide enters the air.','so when','展開運量與排放機制'),
  frame(4,['Over time, ', ', which can '],['排放加劇全球暖化','熱浪、海平面及極端天氣可能加劇'],'Over time 從即時排放推到長期氣候；which can 保留可能性。','要由短期機制推論較長遠的可能影響，而不把結果說成即時必然時。','Over time, this adds to warming, which can make heatwaves worse.','Over time...which can','由即時排放推到可能的長期後果'),
  frame(5,[' is the '],['第二項問題','機場周邊地面環境壓力'],'is the 由全球排放轉到地面和本地影響。','已分析一項較廣泛影響，接着要開啟不同的本地影響時。','A second problem is the noise around busy roads.','A second problem is','切換到本地環境問題'),
  frame(6,[', all of which '],['繁忙機場需要的大樓跑道及道路交通','棲息地與本地污染的共同後果'],'all of which 回指三類擴建與交通壓力，歸納它們共同可能造成的傷害。','列出多項建設或活動後，要概括它們共同可能造成的後果時。','Bigger roads, more traffic and new buildings, all of which can damage nearby parks.','all of which','歸納多項建設的共同後果'),
  frame(7,['For ', ', the constant movement of ', ' can become '],['受影響的人或動物','持續活動的來源','累積形成的負擔'],'For 定出承受影響的群體；主句說明頻繁飛機活動對其環境的負擔。','要把抽象風險落到實際受影響的人、動物或地方時。','For residents near a motorway, the constant movement of trucks can become a daily burden.','For...','指出誰承受環境傷害'),
  frame(8,[' could '],['有幾項措施','減少前述兩類問題'],'could 表示可採取措施，同時避免把效果說成必然完全消除。','完成問題分析，需開啟措施段並保留合理分寸時。','Several changes could reduce the noise.','could','由問題轉入可行措施'),
  frame(9,['First, ',' by '],['政府應先促進較清潔航空的責任','排放標準、技術投資與管理方法'],'First 開啟第一項解方；by 列出達成更清潔航空的方法。','要給同一行動者多個互補工具，分別處理一項問題的不同環節時。','First, councils should cut traffic by improving buses and safe routes.','First...by','提出政府行動與方法'),
  frame(10,['If ', ', each journey '],['燃料與等候時間下降的條件','每趟旅程較小的環境影響'],'If 設定技術和運作改善，主句說明單次旅程的減害效果。','已提出技術或管理改善，要解釋單次活動如何因此受惠時。','If buses use cleaner fuel, each journey causes less local pollution.','If...each journey','展示技術措施的條件效果'),
  frame(11,['Second, '],['各國減少不必要短途航班需求的第二措施'],'Second 把重點從單次航班排放轉到是否需要短途飛行。','已有改善單次活動的措施，還要從需求本身減少可避免的活動時。','Second, cities should reduce short car trips.','Second','切換到減少需求的措施'),
  frame(12,['For example, ', ' when '],['鐵路、巴士及本地交通替代方案','目的地不遠的適用條件'],'For example 列出替代交通；when 限定只在目的地不遠時較合理。','提出減少某活動後，要給出只在合適條件下可用的替代選項時。','For example, trains can replace some flights when the trip is short.','For example...when','給出有距離條件的替代方案'),
  frame(13,[', so that '],['機票反映環境成本的要求','極廉價航班不再鼓勵隨意出行的目的'],'so that 將票價措施連到減少不經思考的短途需求。','要說明價格政策如何改變人的選擇，而非只說應提高價格時。','Ticket prices can include pollution costs, so that cheap trips no longer hide their impact.','so that','說明價格措施的行為目的'),
  frame(14,['In conclusion, ',' mainly through '],['航班需求增加傷害環境的判斷','排放與機場周邊壓力兩類途徑'],'mainly through 把全篇兩條環境問題在結尾合起來。','結尾回答問題題，需同時收束較廣泛及本地兩類影響時。','In conclusion, extra traffic harms towns mainly through emissions and noise.','mainly through','歸納兩種環境傷害途徑'),
  frame(15,[' are therefore necessary to '],['更清潔技術、規管及飛行替代方式','減少問題的目標'],'therefore 把前句兩類傷害推到三種互補措施的必要性。','最後要由已分析的問題回推幾類互補措施時。','Cleaner engines and better buses are therefore necessary to reduce city pollution.','therefore necessary to','以配套措施收束'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的環境問題及措施次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('範文把更多航班的環境問題分成哪兩類？',['全球溫室氣體排放與機場周邊的本地環境壓力','只關乎航空公司制服顏色','只有旅客等待時間，完全不涉排放','所有機場土地都會自動恢復自然棲息地'],'引言明確預告排放與機場周邊兩類問題。'),
  quiz('文章提出哪兩種主要減害方向？',['降低單次航班的排放，並減少不必要的短途飛行需求','只增加航班，不改善燃料或交通替代','只叫旅客遠行，不提供可行交通','只更換機場標誌，不處理排放'],'技術與管理改善每趟航程，鐵路等替代方式處理可避免的需求。'),
];
const route=[sequence('由排放和機場影響走到配套措施',[
  ['引言：交代需求增加','旅客增加帶來更多航班，需分析環境後果與對策。'],
  ['主體一：兩層環境傷害','更多燃料帶來排放和氣候風險；機場擴張與交通影響本地棲息地。'],
  ['主體二：改善單次航程','排放標準、高效航機、可持續燃料和空管減少每趟影響。'],
  ['主體二及結尾：減少可避免的需求','短途鐵路巴士與反映環境成本的票價補足技術改善。'],
],'先分清全球排放與本地機場問題，再把每趟減害和減少不必要航班配在一起。')];
const evidence=[
  quiz('更多航班如何增加溫室氣體？',['航空公司加航線或班次，燃料使用和二氧化碳排放隨之增加','飛機班次越多就必然完全不耗燃料','只有機場標誌會影響排放','二氧化碳只來自旅客行李顏色'],'範文從燃料燃燒推到二氧化碳排放。'),
  quiz('機場周邊承受哪些本地影響？',['擴建大樓跑道與道路交通可干擾棲息地並加重空氣和噪音污染','只會令附近棲息地面積自動增加','飛機升降與社區和野生動物完全無關','所有機場都沒有任何道路交通'],'第二類問題是地面擴張與頻繁飛行對周邊的可能影響。'),
  quiz('技術與空管措施如何減少每趟影響？',['高效航機、較潔淨燃料和減少盤旋等待可降低燃料消耗','只讓飛機在空中等得更久','要求飛機使用更多燃料而不改管理','只更換機票字體'],'範文把較少燃料與較短等待連到每趟較小影響。'),
  quiz('鐵路與巴士應在哪種旅程中較可能代替飛機？',['目的地不遠、地面交通便利的短途旅程','所有跨洋長途旅程都必須靠巴士','任何距離都完全不需考慮時間與路線','只在沒有鐵路或巴士的地方使用'],'when the destination is not far away 限定替代方案的適用情境。'),
  quiz('票價納入環境成本的目的為何？',['避免極廉價機票鼓勵人不考慮影響便隨意出行','保證所有飛機完全不再排放','只為讓所有機票名稱更長','使短途鐵路不能與航班競爭'],'範文把票價透明度連到減少不必要的需求。'),
  quiz('結尾為何並列三類措施？',['技術、監管及飛行替代方案分別處理單次影響與部分需求','只靠一項措施便能保證所有環境問題消失','因為飛機排放與機場周邊壓力完全相同','因為文章從未談及本地交通'],'結尾回收全文的互補措施，不把任何一項說成萬能。'),
];
const logic=[
  sequence('排放問題的因果鏈',[
    ['旅客增加，航班需求上升','航空公司可能加航線或班次。'],
    ['更多航程燃燒更多燃料','二氧化碳排入大氣。'],
    ['長期加劇全球暖化','熱浪、海平面與極端天氣可能受影響。'],
    ['單次減害措施相應出現','較高效航機、燃料及空管減少每趟影響。'],
  ],'不可把 may/can 的氣候後果講成每趟航班的必然即時結果。'),
  sequence('地面影響與短途需求的對策',[
    ['機場擴張帶來本地壓力','大樓、跑道和交通可能影響棲息地及噪音。'],
    ['先管理可避免的航班需求','在合適距離提供鐵路、巴士和便利本地交通。'],
    ['票價反映環境成本','削弱極廉價航班帶來的隨意出行誘因。'],
    ['結尾概括配套','清潔技術、較嚴規管及替代方式共同減害。'],
  ],'地面替代只適合可行距離，不能宣稱所有飛行都可由巴士取代。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('某航空公司增加每日短途班次，卻只報告每架新飛機更省油。','哪項分析最忠於範文？',[
    '檢查航班增加的總燃料與排放，而非只看單機效率',
    '只要一架飛機較省油，航班再多也不會有排放',
    '只比較機身塗裝顏色，不檢查燃料消耗和班次',
    '認為旅客增加一定令二氧化碳排放自動消失',
  ],['範文同時討論班次數量和每趟燃料效率。','把單次改善誇大成總量保證。','顏色不能代替排放資料。','與燃料燃燒產生二氧化碳的機制相反。'],[0,2,3,10],'原文由加航線和班次推到更多燃料，再提出較高效航機。'),
  transfer('機場準備擴建跑道，附近有濕地和居民住宅。','哪項調查最貼近範文？',[
    '檢查棲地、道路、空氣與噪音承受的環境壓力',
    '只計算旅客購票速度，不評估機場的地面影響',
    '因跑道在地面，就不必看野生動物棲地',
    '只更換客運大樓名字，不評估周邊地區擴建',
  ],['範文的地面問題正涵蓋棲息地及本地污染。','購票速度不能評估周邊環境。','地面擴建更需要檢查附近棲息地。','改名沒有處理實際擴建影響。'],[5,6,7],'原文把機場擴張連到附近社區和野生動物。'),
  transfer('兩個相鄰城市有快捷鐵路，但旅客仍習慣搭極短途航班。','哪項措施較有文本根據？',[
    '提高鐵路便利性，讓短途旅程能轉乘火車',
    '宣稱相鄰城市只能靠飛機連接，沒有其他選擇',
    '取消快捷鐵路，讓更多短途旅客改乘飛機',
    '把所有跨洋航班也直接改為短途火車服務',
  ],['範文只在目的地不遠時提出鐵路等地面替代。','忽略了已存在的快捷鐵路。','與減少不必要短途飛行相反。','超出範文所限定的合適距離。'],[11,12],'原文以高鐵和巴士處理不必要的短途航班需求。'),
  transfer('航空公司表示飛機常因航班安排不順而在空中盤旋、跑道上久候。','哪項改善最能轉用範文？',[
    '改善空中交通管理，減少盤旋等候的耗油',
    '故意延長盤旋，因為等待時間越長越省油',
    '只改登機證顏色，不檢查飛機盤旋等候',
    '把所有等待完全歸因於旅客行李的款式',
  ],['原文把較少盤旋與跑道等候連到每趟較小環境影響。','延長等候與節省燃料的方向相反。','登機證顏色不影響航管效率。','未處理已知的航班安排問題。'],[9,10],'原文提出更完善空管，並說減少盤旋等候可降低每趟影響。'),
  transfer('有人主張只要把票價提高，便不用改善飛機燃料或空管。','哪項回應符合範文？',[
    '票價可減少隨意出行，但仍需技術管理減排',
    '票價一變，所有飛機就即刻不再燃燒燃料',
    '只要票價高，機場周邊的噪音必然消失',
    '因此應停止任何較清潔航空技術的投資',
  ],['範文把需求與單次航班減害列為互補路線。','價格不能直接改變引擎耗油。','已飛行的航班仍會造成噪音。','與原文第一項政府措施相反。'],[9,10,13,15],'原文並列清潔航空、票價和飛行替代方式。'),
  transfer('地方政府只評估飛行二氧化碳，沒有看機場附近居民的噪音投訴。','哪項補充最能保持範文完整？',[
    '加入機場附近居民和野生動物的影響評估',
    '只重複二氧化碳數字，不看附近居民噪音',
    '因為是飛行，便認為地面環境不可能受影響',
    '只討論候機室餐牌，不看居民及動物處境',
  ],['原文分全球排放與本地機場壓力兩類問題。','漏掉文章第二主體段。','機場擴張及頻繁起降可有本地影響。','餐牌與噪音投訴無關。'],[1,5,6,7,14],'原文另以機場周邊棲息地、空污與噪音分析本地壓力。'),
  transfer('某旅行社宣傳「每週飛到近郊過一晚」，未提供地面交通資訊。','哪項轉用最貼近範文？',[
    '提供鐵路巴士資訊，讓票價反映環境成本',
    '只強調機票很便宜，完全不提短途旅程距離',
    '宣稱近郊永遠不可能有鐵路或巴士服務',
    '禁止旅客了解出行對空氣與氣候的影響',
  ],['短途替代和環境成本資訊都能減少不必要需求。','極廉價航班正是原文警惕的誘因。','與情境中可查驗的地面選項相反。','阻止資訊會削弱審慎選擇。'],[11,12,13],'原文以短途地面交通及票價措施處理隨意飛行。'),
  transfer('寫另一篇關於貨車增多的文章：排氣增加，物流中心附近亦有噪音。','哪種結構最能轉用範文？',[
    '分清廣泛排放與機場附近污染，再對應措施',
    '只談排氣，不提附近居民所受的噪音問題',
    '只談噪音，宣稱貨車絕不會造成空氣污染',
    '把兩種不同環境影響都寫成貨車塗裝問題',
  ],['範文把全球排放和機場周邊壓力分成兩條分析線。','漏掉本地負擔。','漏掉排放負擔。','塗裝不能解釋題目兩類傷害。'],[2,5,6,14],'原文一段談航機燃料，一段談機場周邊地面壓力。'),
  transfer('政府為航空業設排放標準，也支持較高效航機與可持續燃料。','下一句應如何說明這些措施的作用？',[
    '每趟航程耗油減少時，環境影響也可下降',
    '較高效航機一定每次都耗用更多的燃料',
    '這些措施只會改變旅客護照封面的顏色',
    '有了標準，就再不用考慮任何航班需求',
  ],['範文用 If 句解釋每趟較少燃料的效果。','與效率改善的目的相反。','護照顏色與燃料無關。','需求仍是原文第二條解方。'],[9,10,11],'原文由較高效飛機和燃料推到每趟較小環境影響。'),
  transfer('文章結尾只寫「飛機會污染」，沒有概括措施。','怎樣修訂最符合範文？',[
    '總結排放與周邊壓力，提出技術規管及替代',
    '再重複污染字眼數次，不提環境機制或解方',
    '突然加入與航空無關的學校校服規定要求',
    '宣稱所有航班增加後都不再有任何噪音',
  ],['結尾要回答環境問題及可行措施兩問。','只重複結論，沒有具體機制或解方。','與題目無關。','與原文機場周邊分析相反。'],[14,15],'原文最後兩句同時概括兩類傷害與三組措施。'),
];
const revisedAlternatives={
  0:[['檢查單機效率，實際總航班量可留到下次報告','增加班次可分散乘客，總排放可按舊量估算','先比較票價，總耗油變化交由航空公司評估'],['單機改善未必抵銷總班次增長。','總排放須按實際班次與耗油計算。','票價不能代替排放核查。']],
  2:[['提高鐵路便利性，跨洋航線亦可逐步改鐵路','縮短鐵路車程，短途航班需求可先不評估','保留快捷鐵路，先宣傳短途航班的舒適'],['跨洋航線不能直接套用相鄰城市的替代。','政策仍應檢查能否轉移短途需求。','宣傳航班未鼓勵可行的低排放替代。']],
  3:[['增加跑道容量，盤旋耗油可待之後處理','只調整地面登機流程，空中等候仍照舊','改善航班時刻，交通管理則可先維持'],['容量變動未必改善現有調度。','地面流程未處理空中盤旋耗油。','空管協調也直接影響等候。']],
  4:[['票價可抑制需求，燃料技術可由市場自行改進','提高票價有作用，因此空管可先維持現況','清潔燃料有幫助，隨意短途出行不必處理'],['文章也主張技術與規管共同減排。','減少需求不能取代改善盤旋耗油。','需求與每趟航程排放都須考慮。']],
  6:[['提供鐵路資訊，短途航班仍應優先促銷','提高機票價格，地面交通則可由旅客自行找','旅客可改搭巴士，環境成本毋須反映在票價'],['替代資訊應鼓勵合適短途轉乘。','可行替代也須清楚告知旅客。','範文把成本與交通替代並列。']],
  7:[['分清排氣與周邊噪音，再分別提出措施','只談貨車排氣，中心附近噪音可另議','只談噪音，排氣可由路面清潔處理','把排放與噪音合併成同一個問題'],['兩類影響需各有對應的分析與措施。','附近居民的噪音也是題目明示的影響。','清潔路面不能處理尾氣排放。','不同範圍的環境影響不宜混為一談。']],
  8:[['高效航機可降低單趟耗油，總航班量不必看','可持續燃料有用，空管延誤可暫不處理','設標準後，需求增長仍可按舊排放量計'],['單趟改善不必然抵銷總航班增長。','空管改善亦可減少不必要的耗油。','實際需求仍影響總排放。']],
  9:[['總結排放問題，周邊居民影響留待另議','提出短途鐵路替代，技術規管可稍後再談','概述飛行污染，機場周邊壓力則不必回收'],['結尾須回應氣候與附近環境兩類影響。','範文使用多種互補減害措施。','機場周邊壓力也是前文的問題。']],
};
Object.entries(revisedAlternatives).forEach(([index,[options,reasons]])=>{let t=transferTasks[index],offset=index==='7'?0:1;t.options.splice(offset,t.options.length-offset,...options);t.explanations.splice(offset,t.explanations.length-offset,...reasons);});
// Unchanged answers for the other rows remain source-aligned.
export default {key:'cause-solution:14',meta:{topic:'航班需求增加對氣候與機場周邊的影響',summary:'更多航班增加排放及機場周邊壓力；較清潔技術、規管與短途替代交通共同減害。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
