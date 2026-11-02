// Human-authored support for Direct Question 30; canonical essay text remains in its source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-30-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:30'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'As more people need homes, governments must choose whether to make current cities bigger or build new towns in the countryside.',
  'I think new homes should be built in existing cities, because this uses roads and services better and protects the countryside from damage that is not needed.',
  'The strongest reason to build in cities is that the main things people need every day are already there.',
  'Roads, trains, hospitals, schools, water and emergency services have often been built over many years, so new homes can use them sooner and at a lower cost than homes in a new town.',
  'If a government builds a new town in the countryside from nothing, it must first put all the basic services in place before families can live well there.',
  'That money could instead pay for more homes on the same land, better transport and public places in areas where people already work and study.',
  'For example, building good flats on city land that has low buildings and is not used well can house thousands of people without making them travel long distances to work.',
  'Another reason is that building in the countryside often harms people and nature for a long time.',
  'Land in the countryside is not just empty: it may be farms, woods, animal homes or an important part of local life.',
  'Once buildings cover it with concrete, it is very hard to bring it back.',
  'New towns in the countryside may also make people need cars, because jobs and important services usually stay in the city centre.',
  'So people may spend more time travelling, roads may become busier, and a plan meant to solve the shortage of homes may spread the city further instead.',
  'To sum up, new homes should be built in existing cities rather than new towns in the countryside.',
  'Homes in cities use existing roads and services better, keep people near work and services, and keep the countryside from being taken over by badly planned buildings.',
];
const vocabulary=[
  [['populations rising','more people need homes','人口增加'],['expand current urban areas','make current cities bigger','擴展現有城市'],['entirely new settlements','new towns','全新聚居地'],['rural regions','the countryside','鄉郊']],
  [['new housing','new homes','新住房'],['concentrated in existing cities','built in existing cities','集中建於現有城市'],['public infrastructure','roads and services','公共基建'],['more efficiently','better','更有效'],['unnecessary damage','damage that is not needed','不必要破壞']],
  [['strongest argument','strongest reason','最有力理由'],['basic framework for daily life','main things people need every day','日常基本架構'],['already there','already there','已存在']],
  [['railways','trains','鐵路'],['water systems','water','供水系統'],['emergency services','emergency services','緊急服務'],['established over many decades','built over many years','經多年建成'],['additional homes','new homes','新增住房'],['connected to them','use them','接駁現有設施'],['more quickly and cheaply','sooner and at a lower cost','更快更便宜']],
  [['rural settlement','new town in the countryside','鄉郊聚居地'],['from scratch','from nothing','從零開始'],['lay down a whole skeleton of services','put all the basic services in place','先建整套服務'],['live there properly','live well there','適當居住']],
  [['higher-density apartments','more homes on the same land','較高密度公寓'],['upgraded transport links','better transport','改善交通'],['better public facilities','public places','更好公共設施'],['where people already work and study','where people already work and study','人已工作學習的地方']],
  [['replacing low-rise, underused urban land','building good flats on city land that has low buildings and is not used well','重建低層未善用城市地'],['well-designed apartment blocks','good flats','設計良好公寓'],['house thousands of residents','house thousands of people','容納數千居民'],['commute from distant areas','travel long distances to work','遠距離通勤']],
  [['expanding into the countryside','building in the countryside','向鄉郊擴張'],['long-term social and environmental costs','harms people and nature for a long time','長遠社會環境代價']],
  [['Rural land','Land in the countryside','鄉郊土地'],['not simply empty space','not just empty','不只是空地'],['farmland','farms','農田'],['woodland','woods','林地'],['wildlife habitat','animal homes','野生動物棲息地'],['local community’s identity','important part of local life','地方身份']],
  [['covered with concrete','buildings cover it with concrete','被混凝土覆蓋'],['extremely difficult to restore','very hard to bring it back','難恢復原狀']],
  [['New countryside towns','New towns in the countryside','新鄉郊城鎮'],['car-dependent lifestyles','make people need cars','依賴汽車的生活'],['major services','important services','主要服務'],['remain in the city centre','stay in the city centre','仍在市中心']],
  [['As a result','So','結果'],['spend more time on the road','spend more time travelling','路上時間變長'],['traffic may increase','roads may become busier','交通增加'],['supposed solution to the housing shortage','plan meant to solve the shortage of homes','本應解決住房短缺'],['larger, more scattered urban footprint','spread the city further','城市擴張範圍更廣']],
  [['In conclusion','To sum up','總結'],['constructed in existing cities','built in existing cities','建於現有城市'],['rather than in newly built countryside towns','rather than new towns in the countryside','而非鄉郊新城']],
  [['City-based housing','Homes in cities','城市住房'],['makes better use of infrastructure','use existing roads and services better','更善用基建'],['keeps people close to work and services','keep people near work and services','靠近工作服務'],['prevents the countryside from being swallowed','keep the countryside from being taken over','防鄉郊被侵佔'],['poorly planned development','badly planned buildings','規劃不善的發展']],
];
const chunkOverrides=[
  ['With populations rising, governments must decide','whether to expand current urban areas','or create entirely new settlements in rural regions.'],
  ['In my view, new housing should be concentrated','in existing cities,','because this uses public infrastructure more efficiently','and protects the countryside from unnecessary damage.'],
  ['The strongest argument for building in cities','is that the basic framework for daily life','is already there.'],
  ['Roads, railways, hospitals, schools, water systems','and emergency services have usually been established','over many decades,','so additional homes can be connected to them','more quickly and cheaply than homes in a new town.'],
  ['If a government builds a rural settlement from scratch,','it must first lay down a whole skeleton of services','before families can live there properly.'],
  ['That money could instead be spent','on higher-density apartments, upgraded transport links','and better public facilities','in places where people already work and study.'],
  ['For example, replacing low-rise, underused urban land','with well-designed apartment blocks','can house thousands of residents','without forcing them to commute from distant areas.'],
  ['Another reason is that expanding into the countryside','often creates long-term social and environmental costs.'],
  ['Rural land is not simply empty space;','it may be farmland, woodland, wildlife habitat','or part of a local community’s identity.'],
  ['Once it is covered with concrete,','it is extremely difficult to restore.'],
  ['New countryside towns can also produce car-dependent lifestyles,','because jobs and major services','normally remain in the city centre.'],
  ['As a result, residents may spend more time on the road,','traffic may increase,','and the supposed solution to the housing shortage','may create another burden:','a larger, more scattered urban footprint.'],
  ['In conclusion, new homes should be constructed','in existing cities','rather than in newly built countryside towns.'],
  ['City-based housing makes better use of infrastructure,','keeps people close to work and services,','and prevents the countryside from being swallowed','by poorly planned development.'],
];
const simpleChunkOverrides=[
  ['As more people need homes,','governments must choose whether to make current cities bigger','or build new towns in the countryside.'],
  ['I think new homes should be built','in existing cities,','because this uses roads and services better','and protects the countryside from damage that is not needed.'],
  ['The strongest reason to build in cities','is that the main things people need every day','are already there.'],
  ['Roads, trains, hospitals, schools, water','and emergency services have often been built','over many years,','so new homes can use them sooner','and at a lower cost than homes in a new town.'],
  ['If a government builds a new town','in the countryside from nothing,','it must first put all the basic services in place','before families can live well there.'],
  ['That money could instead pay for','more homes on the same land, better transport','and public places in areas','where people already work and study.'],
  ['For example, building good flats on city land','that has low buildings and is not used well','can house thousands of people','without making them travel long distances to work.'],
  ['Another reason is that building in the countryside','often harms people and nature for a long time.'],
  ['Land in the countryside is not just empty:','it may be farms, woods, animal homes','or an important part of local life.'],
  ['Once buildings cover it with concrete,','it is very hard to bring it back.'],
  ['New towns in the countryside may also make people need cars,','because jobs and important services','usually stay in the city centre.'],
  ['So people may spend more time travelling,','roads may become busier,','and a plan meant to solve the shortage of homes','may spread the city further instead.'],
  ['To sum up, new homes should be built','in existing cities','rather than new towns in the countryside.'],
  ['Homes in cities use existing roads and services better,','keep people near work and services,','and keep the countryside from being taken over','by badly planned buildings.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('With enrolment rising, a school must decide whether to enlarge its current building or open a new campus.','用 must decide whether ... or ... 呈現兩個建屋選項',[1,2,7],
    fixed(0,'With [人口增長], [政府] must decide whether to [擴展現有城市] or [建立鄉郊新城].','引言先把住房需求化成需比較的兩種地點方案。','題目問新房應建舊城或新城，先準確列出兩個選擇時。',['With ', ', ', ' must decide whether to ', ' or '],['增加的需求','須決策者','第一個城市方案','第二個鄉郊方案'])),
  card('In my view, new homes should be built near current stations, because this uses transport better and protects farmland.','用 In my view ... because ... and ... 表態並預告基建與環境理由',[0,2,12],
    fixed(1,'In my view, [新住房] should be concentrated in [現有城市], because this [更有效用基建] and [保護鄉郊].','明確主張城市建屋，原因分為善用既有設施與避免鄉郊損害。','兩選一題目需要早表態，並預告後文兩項主要依據時。',['In my view, ', ' should be concentrated in ', ', because this ', ' and '],['待建的住房','選定的建屋地點','既有設施效益','環境保護效益'])),
  card('The strongest argument for expanding current clinics is that basic support is already there.','用 The strongest argument for ... is that 指出既有城市的基建優勢',[1,3,7],
    fixed(2,'The strongest argument for [在城內建房] is that [日常生活的基本設施] is already there.','第一主體段先說現有城市不用從零建立生活所需系統。','開始支持城市方案，先提出可用具體設施支持的理由時。',['The strongest argument for ', ' is that '],['受支持的建設地點','已經存在的基本框架'])),
  card('Roads, schools and clinics have been established for years, so new homes can use them more cheaply than a new town can.','用 so ... more quickly and cheaply than 將既有服務連到建房效率',[2,4,5],
    fixed(3,'[道路、醫院、學校等] have usually been established over many decades, so [新增房屋] can be connected to them more quickly and cheaply than [新城房屋].','列出現有基建，再比較接駁新房和從頭服務新城的時間成本。','已說基建存在，須解釋它怎樣讓新房更快、更省資源時。',[' have usually been established over many decades, so ', ' can be connected to them more quickly and cheaply than '],['已有的公共服務','可接駁的新增房屋','成本與速度的比較對象'])),
  card('If a council builds a new rural town from scratch, it must first provide roads and water before families can move in.','用 If ... from scratch ... before 解釋新城必須先建服務',[3,5,7],
    fixed(4,'If [政府從零建鄉郊新城], it must first [建好整套服務] before [家庭可適當入住].','以條件句指出新城非只有房屋，居民入住前還需服務網絡。','比較現有城市與鄉郊新城成本時，要說出新城額外建設次序時。',['If ', ' from scratch, it must first ', ' before '],['由零開始的新城工程','須預先建好的基建','服務具備後才能做的事'])),
  card('That money could instead be spent on city flats, better buses and schools where residents already work.','用 That money could instead be spent on 表示資源改投現有城區',[3,4,6],
    fixed(5,'That money could instead be spent on [高密度公寓], [改善交通] and [公共設施] in places where [人們已工作和學習].','把建新城服務的資金轉投現有城市建屋及升級設施。','新城基建成本已說明，要指出同一筆錢的另一種用途時。',['That money could instead be spent on ', ', ', ' and ', ' in places where '],['更有效的住房投入','交通改善','公共設施改善','資源投向的現有地區'])),
  card('For example, replacing a low-rise car park with flats can house many people without long commutes.','用 For example ... replacing ... with ... without 具體化市內土地再利用',[3,5,10],
    fixed(6,'For example, replacing [低層未善用城市土地] with [設計良好公寓] can house [數千居民] without forcing them to [遠距離通勤].','例子展示如何在現有城市增加住所，同時保留接近工作地點的優勢。','已提出高密度公寓，要以一塊未充分利用的土地說明實行方式時。',['For example, replacing ', ' with ', ' can house ', ' without forcing them to '],['可重建的城內地段','新建住所','受益的居民','可避免的通勤負擔'])),
  card('Another reason is that building on rural land often creates lasting social and environmental costs.','用 Another reason is that 轉入鄉郊代價',[2,6,8],
    fixed(7,'Another reason is that [向鄉郊擴張] often creates [長遠社會和環境成本].','第二主體段轉向新城可能破壞土地及造成依賴汽車的生活。','基建成本理由已完成，再提出不同角度的長期代價時。',['Another reason is that ', ' often creates '],['可能產生代價的擴張','須衡量的長遠損失'])),
  card('Rural land is not simply empty space; it may be farms, woods, habitats or part of a village’s history.','用 not simply empty space; it may be ... 重估鄉郊土地的價值',[7,9,10],
    fixed(8,'Rural land is not simply [空地]; it may be [農田], [林地], [野生動物棲地] or [社區身份的一部分].','反駁把鄉郊當待建空地的看法，列出原有生態與社區用途。','已說鄉郊擴張有代價，要具體說明土地原本承載甚麼時。',['Rural land is not simply ', '; it may be ', ', ', ', ', ' or '],['被否定的空地看法','農業用途','林地資源','動物棲地','社區意義'])),
  card('Once woodland is covered with concrete, it is extremely difficult to restore.','用 Once ... concrete ... difficult to restore 強調土地轉用難逆轉',[7,8,11],
    fixed(9,'Once [土地被混凝土覆蓋], it is extremely difficult to [恢復原狀].','指出鄉郊環境破壞可能長期甚至難以逆轉。','列完農田與棲地價值，要說明改成建地的不可逆風險時。',['Once ', ', it is extremely difficult to '],['被建築覆蓋的土地','難以完成的修復'])),
  card('New rural towns can create car-dependent lives, because jobs and hospitals still sit in the city.','用 can produce ... because ... 解釋新城為何容易依賴汽車',[7,8,11],
    fixed(10,'[鄉郊新城] can also produce [依賴汽車的生活], because [工作與主要服務] normally remain in [市中心].','新城離現有工作及服務遠，可能使居民更依賴汽車移動。','已談土地損失，還要說明鄉郊新城對交通的長期影響時。',[' can also produce ', ', because ', ' normally remain in '],['帶來交通需求的新城','形成的生活方式','仍在原市區的工作服務','集中所在的中心'])),
  card('As a result, residents travel longer, roads get busier, and the plan to solve housing creates a wider city footprint.','用 As a result ... and ... may create another burden 連長通勤、塞車與城市擴散',[7,10,12],
    fixed(11,'As a result, [居民路上時間增加], [交通增加], and [本應解房荒的方案] may create another burden: [更大、更分散的城市擴張].','把依賴汽車一路推到路上時間、交通壓力和更大城區範圍。','已指出新城可能依賴汽車，須交代其連鎖社會與環境後果時。',['As a result, ', ', ', ', and ', ' may create another burden: '],['居民的通勤後果','道路交通後果','原本為解決房荒的方案','反而新增的城市形態'])),
  card('In conclusion, new homes should be built in current cities rather than new towns in rural areas.','用 should ... in ... rather than ... 重申建屋位置選擇',[1,7,13],
    fixed(12,'In conclusion, [新住房] should be constructed in [現有城市] rather than in [鄉郊新城].','結論第一句直接回答新住宅究竟應建在哪裏。','兩方面理由已論證完，要清楚重申城市方案時。',['In conclusion, ', ' should be constructed in ', ' rather than in '],['要建的住房','被選定的地點','被排除的替代地點'])),
  card('City-based homes use transport better, keep residents near work and protect rural land from poor planning.','用 makes ... keeps ... prevents ... 並列三項最終好處',[1,5,12],
    fixed(13,'City-based housing [善用基建], [靠近工作服務], and [防鄉郊被亂發展侵佔].','用基建、日常距離與鄉郊保護三項好處收束全文。','最後需以簡潔原因支持建屋地點判斷時。',['City-based housing ', ', ', ', and '],['第一項基建效益','第二項生活便利','第三項環境保護'])),
];
const wrongReasons=[
  ['城市建屋立場已有選擇，沒有先列擴舊城或建鄉郊新城的決策題。','既有基建是第一理由，不是引言的兩方案設定。','鄉郊長期成本是第二理由，沒有 whether ... or ... 的選擇框架。'],
  ['兩個方案只是題目背景，沒有 In my view 城市立場及雙理由。','既有服務是第一項理由，沒有同時預告鄉郊保護。','結論重申選擇，但沒有引言 because 的兩條論證路線。'],
  ['引言立場同時提基建和環境，沒有先聚焦已存在的日常服務。','道路等清單是後續證據，沒有 The strongest argument 的首項理由。','鄉郊代價是第二理由，沒有第一段的既有城市框架。'],
  ['城市已有框架只是總述，沒有列設施及連接速度成本比較。','從零建新城是反面比較，沒有既有路鐵醫校的條件。','改投資金是其後方案，沒有 so 舊基建讓新房較快接駁。'],
  ['既有設施和接駁成本說城市優勢，沒有 If 新城從零建服務的次序。','資金改投城市是推論，沒有先說新城必建整套服務。','鄉郊成本是另一段環境角度，沒有入住前的基建要求。'],
  ['既有設施說現況，沒有同一筆錢的替代用途。','從零建新城說成本，沒有 instead 轉投公寓交通設施。','公寓個案是後續例子，沒有資源配置的三種方向。'],
  ['既有設施是一般優勢，沒有重建低層地段的例子。','資金用途是政策選項，沒有數千居民和通勤後果的具體個案。','鄉郊汽車依賴是新城的反面後果，沒有城內土地重建。'],
  ['既有設施是第一理由，沒有 Another reason 轉入社會環境代價。','城內重建個案支持效率，沒有鄉郊擴張的長期成本。','鄉郊原有用途是後續解釋，沒有先提出第二理由。'],
  ['鄉郊成本只是總述，沒有農田林地棲地與社區身份清單。','混凝土難復原是其中一個後果，沒有先說土地原本承載甚麼。','汽車依賴是交通問題，沒有土地多種現有價值。'],
  ['鄉郊成本總述沒有 Once 混凝土覆蓋後難復原的不可逆性。','土地用途清單說價值，沒有建築覆蓋後的修復困難。','交通連鎖是另一條代價，沒有土地本身的損失。'],
  ['鄉郊成本總述沒有 because 工作服務在市中心的車輛依賴機制。','土地價值清單沒有新城居民的交通需要。','路上時間與塞車是汽車依賴的後續結果，沒有先說原因。'],
  ['鄉郊成本只是總論，沒有通勤、流量與城市擴散的連鎖。','汽車依賴指出原因，沒有 As a result 列三種後果。','結論立場是最後判斷，沒有把房荒解法反增負擔說清。'],
  ['引言立場尚未經過全文論證，不是結論重申。','鄉郊成本是理由，沒有直接說住房應建舊城而非新城。','結論第二句重列好處，沒有先用 rather than 選定地點。'],
  ['引言預告兩理由，沒有最後的基建、距離與土地保護三項收束。','資金改投城市是中段細節，沒有結尾三方面效益。','結論前句只表態地點，沒有再次說明原因。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求在兩種建屋位置中作哪項選擇？',[
    '在現有城市加建新房，或在鄉郊另建全新城鎮',
    '只選公寓的外牆顏色，不用考慮房屋位置',
    '只比較不同城市的租金，不談新房如何興建',
    '只問應否修橋，與住房短缺或鄉郊無關',
  ],'作者要選新住宅建在舊城還是鄉郊新城。'),
  {type:'multi',prompt:'選出支持在現有城市建房的兩條主論證',detail:'選兩項，再按「確認」。',options:[
    '現有道路學校和服務可較快較便宜地接駁新房',
    '少佔鄉郊農地與棲地，也減少遠距離通勤風險',
    '所有鄉郊土地都是空地，改作新城完全沒有成本',
    '新城不用建任何水電道路，居民即可立即入住',
  ],correct:[0,1],why:'城市已有公共服務；鄉郊新城會帶來土地和交通代價。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言選地點','人口增長帶來住房需求；主張集中在現有城市。'],
  ['理由一：善用基建','道路、學校、醫院等已存在，新房接駁較快較便宜。'],
  ['理由二：避免鄉郊代價','農田和棲地難恢復，新城還可能造成汽車依賴與城市分散。'],
  ['結論再權衡','選在現有城市，兼顧基建使用、工作距離與鄉郊保護。'],
],'城市效率與鄉郊長期代價是兩條不同的支持線。')];
const evidence=[
  quiz('現有城市為何較易接駁新房？',[
    '道路、鐵路、醫院、學校和水系統等已建立多年',
    '新房不需要任何交通、教育或供水服務',
    '鄉郊新城的所有公共服務必然早已齊全',
    '只要有住宅大樓，居民便不再需要醫院',
  ],'已有基建使新房較快、較低成本地連上日常服務。'),
  quiz('從零建鄉郊新城時，要先做甚麼？',[
    '先建整套基本服務，家庭才可在當地適當生活',
    '先售完全部住宅，之後永遠不用建公共設施',
    '只畫新城名字，不用安排水、路或學校',
    '先要求居民每日遠行，避免提供任何本地服務',
  ],'新城不能只建房屋，還需要支持生活的服務架構。'),
  quiz('原可建新城服務的錢，作者建議轉用在哪裏？',[
    '在人們已工作讀書的地區建密度較高的公寓並升級交通設施',
    '只用於畫新城宣傳海報，不改善任何現有地區',
    '只給居民長途通勤補貼，完全不增加住宅',
    '把資金全用於清空農地，不建公寓或公共設施',
  ],'instead 表示同一筆資源在現有城市有另一種用途。'),
  quiz('低層未充分利用地段的例子說明甚麼？',[
    '城內重建可容納更多居民，也避免迫使他們遠距離通勤',
    '只要重建城內土地，便必須取消所有工作地點',
    '所有城市土地都不能建公寓，只能建鄉郊新城',
    '低層地段必然沒有任何人使用，所以不用規劃',
  ],'這是善用既有城區土地而不把住戶推到遠方的例子。'),
  quiz('鄉郊土地為何不能只當空地看？',[
    '它可能是農田、林地、動物棲地或地方身份的一部分',
    '它一定沒有農業、生態或社區方面的價值',
    '一旦蓋上混凝土，原來的棲地便會立即恢復',
    '只有市中心土地才與社區記憶或生活有關',
  ],'作者列出土地在建房以前已承載的用途與意義。'),
  quiz('鄉郊新城為何可能令居民更依賴汽車？',[
    '工作和主要服務仍在市中心，居民需走更長路程',
    '所有新城的工作與醫療一定全在家門旁',
    '鄉郊沒有土地可建任何道路，居民也不能出門',
    '汽車依賴只由住宅外牆顏色決定',
  ],'新城離工作與服務遠，才引出長通勤和交通增長。'),
  quiz('「解房荒方案反增另一負擔」指甚麼？',[
    '遠距離通勤和車流增加，城區範圍變得更大更分散',
    '房屋增加後，所有居民必定不再需要工作',
    '道路使用完全下降，而且所有農地會自動恢復',
    '只要新城存在，舊城便立即完全停止發展',
  ],'作者把本想解住房短缺的新城，連到交通和城市擴散的副作用。'),
];
const logic=[
  sequence('城市方案：從已有服務到土地再利用',[
    ['已有日常框架','道路、醫院、學校、水與緊急服務已建成。'],
    ['較快較省接駁','新房可連上這些設施，無須從零建立新城服務。'],
    ['替代資金用途','同一筆錢可投更高密度住宅、交通與公共設施。'],
    ['具體土地例子','重建城內低層未充分利用地段，容納更多人。'],
    ['通勤好處','住戶靠近現有工作和學習地點。'],
  ],'基建存在是原因，接駁成本與城內重建是結果與實行方式。'),
  sequence('鄉郊方案：從土地價值到交通代價',[
    ['土地原有用途','農田、林地、棲地和社區身份並非空白。'],
    ['覆蓋難恢復','混凝土建設後，原有土地很難回到舊狀。'],
    ['工作服務仍集中','新城居民可能仍須往市中心工作或使用重要服務。'],
    ['汽車與通勤','遠距離旅程和車流增加。'],
    ['更分散的城市','解房荒的方案反而擴大城市佔地與社會負擔。'],
  ],'環境損失和交通負擔互相疊加，構成第二個理由。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('城市有一塊低層停車場，附近已有車站、醫院和學校；政府也考慮另建鄉郊新城。','哪項最能轉用範文的基建理由？',[
    '先評估城內地段加建住宅，利用已存在的交通和服務',
    '只因鄉郊地價看似便宜，就忽略新城全部基建成本',
    '假設住戶完全不需醫院、學校或交通便可生活',
    '只計算建築外觀，不比較兩個地點的接駁需要',
  ],[
    '範文用已有基建和城內低層地段解釋城市加建優勢。',
    '新城還須建服務，不能只看土地。',
    '題目明列家庭日常服務。',
    '接駁成本正是作者比較核心。',
  ],[2,3,4,6],'範文說城內新房可接上已有道路醫校，未充分利用地段亦可重建。'),
  transfer('一個鄉郊新城的住宅已畫好，卻沒有供水、學校或醫療規劃。','哪項最符合範文對「從零建城」的提醒？',[
    '入住前安排整套基本服務，不能只完成住宅圖則',
    '只要畫出住宅，家庭便不再需要水和醫療',
    '先讓居民遷入，然後永遠不必建公共服務',
    '只比較住宅面積，不考慮孩子上學或就醫',
  ],[
    '範文用服務骨架比喻說新城須先有生活基礎。',
    '題目缺的正是日常服務。',
    '入住並不消除供水醫療需要。',
    '家庭生活含學校和醫療。',
  ],[3,4],'範文說新城從零建設，家庭適當入住前須先鋪好整套服務。'),
  transfer('地方議會想在農田上建住宅，稱那裏只是「沒用的空地」。','哪項最能轉用範文的土地價值觀？',[
    '先評估農業、棲地和社區用途，不能把鄉郊只當空地',
    '只因沒有樓宇，就斷定土地沒有任何現有價值',
    '只看住宅數量，完全不問土地覆蓋後能否恢復',
    '農田只要鋪上混凝土，便會立即變得更像農田',
  ],[
    '範文明列農田、林地、棲地和身份認同的原有價值。',
    '未建樓不等於無用途。',
    '恢復難度也是原文第二層代價。',
    '混凝土覆蓋會使恢復困難。',
  ],[7,8,9],'範文說鄉郊土地可能是農田或棲地，覆蓋後難恢復。'),
  transfer('新鎮住宅便宜，但居民仍須每日開車到市中心工作和看醫生。','哪項最符合範文對長期交通成本的分析？',[
    '工作服務仍在市中心，便宜住宅可能換來更長通勤',
    '只看房價便可斷定居民完全沒有其他日常成本',
    '新鎮一建成，市中心工作與醫療必定全部搬走',
    '居民有車就代表路上時間一定完全不會增加',
  ],[
    '範文把中心區服務位置連到汽車依賴和長途旅程。',
    '通勤時間也是居民代價。',
    '題目說服務仍在市中心。',
    '車流可能增加。',
  ],[10,11],'範文說鄉郊新城可因工作與服務仍在中心而形成汽車依賴。'),
  transfer('政府資金只能先投一項：在舊城升級交通及建公寓，或替遠郊新城新建整套服務。','哪項最能運用範文的機會成本論證？',[
    '比較同筆錢的兩種用途，考慮舊城已有基建可利用',
    '只問哪個方案名字較新，不用比較公共投入',
    '假設遠郊新城完全不用水電道路便可入住',
    '只看公寓外牆，不問交通和公共設施是否改善',
  ],[
    '範文用 That money could instead 指出同一筆資金可改投城內。',
    '名稱無關投入和結果。',
    '新城須先建服務。',
    '設施與交通是作者建議用途。',
  ],[4,5],'範文說建新城服務的錢可改投高密度公寓、交通和公共設施。'),
  transfer('市內一片低層倉庫用地靠近車站與工作區，規劃者打算只向遠郊拓地。','哪項最能轉用範文的實例？',[
    '考慮重建城內未善用地段，讓更多住戶靠近工作地點',
    '只因倉庫是低層建築，就永遠不許評估其用途',
    '只向遠郊拓地，假設居民不需要使用現有車站',
    '把居民全部送去遠郊，卻要求他們每日回城工作',
  ],[
    '範文以低層未善用城地改建公寓，避免遠距離通勤。',
    '原文正把低層用地視作可評估資源。',
    '車站位置是城內優勢。',
    '這增加題目想避免的通勤。',
  ],[5,6],'範文的公寓例子示範城內土地再利用，容納居民而減少遠途通勤。'),
  transfer('社區要建新圖書館，舊城分館附近已有交通和學校，遠郊候選地則需新道路。','哪項最符合範文的地點選擇邏輯？',[
    '比較已有交通和服務的效益，並計入遠郊新路成本',
    '只看遠郊空地較大，就忽略圖書館使用者如何到達',
    '只看建築設計，不問學生或居民是否能使用',
    '認為有學校的地方就完全不能增設圖書館',
  ],[
    '範文的原則是用已有公共服務並計入新城基建成本。',
    '可到達性關乎實際使用。',
    '圖書館地點與使用者關係重要。',
    '現有學校反而可能形成需求。',
  ],[2,3,4],'範文比較既有城市服務與鄉郊新建整套服務所需成本。'),
  transfer('開發商說鄉郊棲地鋪上混凝土後，若計劃不佳可以立刻完全恢復。','哪項最符合範文的修復判斷？',[
    '混凝土覆蓋後恢復原貌極難，應在建造前評估損失',
    '土地一旦改作建地，原有棲地便會自動擴大',
    '只要開發商承諾，所有生態和農地便能當天復原',
    '只問車位夠不夠，不用考慮任何土地原有功能',
  ],[
    '範文說 Once 覆蓋混凝土，恢復極難。',
    '這與原文相反。',
    '承諾不能消除實際修復難度。',
    '原文列土地多種既有價值。',
  ],[8,9],'範文提醒鄉郊土地不只是空地，而且混凝土覆蓋後難恢復。'),
  transfer('居民原本以為新城能紓緩房荒，卻發現長通勤、車流及擴散建設一起增加。','哪項最能轉用範文的連鎖推論？',[
    '住房方案可能造成城市擴散及額外交通負擔',
    '只要住宅增加，長通勤和車流便不可能再出現',
    '城區擴散與鄉郊新城完全沒有任何關聯',
    '只計算住房數量，不理方案是否另生新負擔',
  ],[
    '範文把 supposed solution 與 another burden 作反差。',
    '題目明說負擔增加。',
    '新城離市中心正是推論原因。',
    '作者要求評估連鎖後果。',
  ],[10,11],'範文說新城可使路上時間及交通增加，形成更大、更分散的城市範圍。'),
  transfer('題目要在「現有城市加建」與「鄉郊新城」之間作選擇。','哪項結論最完整？',[
    '選城市，因可善用基建、靠近工作並保護鄉郊',
    '只說人口正在增長，不判斷新房應建哪裏',
    '只談鄉郊景色，不處理住房或既有服務',
    '只提新城有空地，不計算道路與通勤成本',
  ],[
    '範文結論先選城市，再總結基建、距離與鄉郊保護。',
    '題目需要二選一。',
    '這沒有回應建屋地點。',
    '新城基建與交通成本不可略。',
  ],[12,13],'範文最後兩句重申現有城市，並以基建、日常距離及鄉郊保護收束。'),
];
export default {key:'direct-question:30',meta:{topic:'新住房應建現有城市還是鄉郊新城',summary:'城內建房可善用既有基建；鄉郊新城可能損農地、加長通勤並擴大城區。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
