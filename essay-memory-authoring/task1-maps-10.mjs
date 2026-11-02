// Task 1 Maps 10: island before and after tourist-facility construction.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先用西岸海灘、中央與東端定位，再對照開發前後的設施。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two maps show an island before and after new places for tourists were built.',
 'Overall, the island changed from mostly natural land into a small resort. Places to stay and eat and new routes were added mainly in the west and middle.',
 'But the beach and most palm trees are still there, and the east end is mostly the same.',
 'Before the work, the island had only natural things.',
 'A beach was on the west shore. Palm trees were in the middle and in larger groups towards the east.',
 'There were no buildings, roads, paths or place for boats to stop, so the map showed no built routes onto or around the island.',
 'After the work, two groups of small places to stay were built: one near the west beach and another around an open area near the middle.',
 'Paths for walking connect the huts. One path also goes to the beach, now marked as a place for swimming.',
 'A reception building is near the middle, with a restaurant just to its north.',
 'A pier for boats is now on the south shore. Vehicle tracks connect it to both the reception and restaurant.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['tourist facilities','places for tourists','旅遊設施'],['construction','built','興建']),
 v(['transformed','changed','轉變'],['largely undeveloped natural area','mostly natural land','大致未開發自然區'],['compact resort','small resort','小型度假區'],['accommodation','Places to stay','住宿'],['catering facilities','eat','餐飲'],['transport links','routes','交通連接'],['western and central sections','west and middle','西部與中部']),
 v(['However','But','然而'],['retained','still there','保留'],['most palm-tree areas','most palm trees','多數棕櫚樹'],['eastern end','east end','東端'],['largely untouched','mostly the same','大致未改']),
 v(['Before development','Before the work','開發前'],['contained only natural features','had only natural things','只有自然景物']),
 v(['lay on the western shore','was on the west shore','位於西岸'],['groups of palm trees','Palm trees','棕櫚樹群'],['scattered across','were in','分布'],['more densely','larger groups','更密集'],['towards the east','towards the east','東部一帶']),
 v(['no buildings, roads, paths or landing facilities','no buildings, roads, paths or place for boats to stop','無建築道路與登岸設施'],['access to and movement around','onto or around','進出及島內移動'],['not formally provided','no built routes','未有正式通道']),
 v(['Following construction','After the work','建設後'],['two clusters of accommodation huts','two groups of small places to stay','兩組住宿小屋'],['close to the beach','near the west beach','靠近海灘'],['around an open central area','around an open area near the middle','圍繞中部空地']),
 v(['linked by footpaths','Paths for walking connect','步行小徑連接'],['one of which also runs to the beach','One path also goes to the beach','一條通海灘'],['marked for swimming','marked as a place for swimming','標作游泳區']),
 v(['reception building','reception building','接待處'],['stands near the centre','is near the middle','位於中部'],['just to its north','just to its north','正北面']),
 v(['To the south','south shore','南岸'],['pier','pier','碼頭'],['vehicle tracks','Vehicle tracks','車道'],['connect it with both main service buildings','connect it to both the reception and restaurant','連接兩主要服務樓']),
];
const structures=[
 f('The two maps compare a coastal site before and after the construction of tourist facilities.','引言交代同一地點旅遊設施建設前後',[2,4,8],{formula:'The two maps compare [地點] before and after the construction of tourist facilities',meaning:'兩圖比較同一島嶼興建旅遊設施前後的佈局。',usage:'before／after 是建設前後，不是兩座不同島嶼。',parts:[link('The two maps compare'),slot(' an island','地點'),link(' before and after the construction of tourist facilities.')]}),
 f('Overall, the peninsula has been transformed from a largely undeveloped natural area into a compact resort, with guest cabins, a café and walking routes added mainly in the western and central sections.','概覽土地用途改變及新設施集中位置',[0,4,8],{formula:'Overall, [地點] has been transformed from a largely undeveloped natural area into a compact resort, with [三類新增] added mainly in the western and central sections',meaning:'西部與中部加住宿小屋、餐廳接待、步道車道及南岸碼頭；東端大致自然。',usage:'compact resort 是圖上有限範圍的開發；不能說整座島包括東端全被建築覆蓋。',parts:[link('Overall,'),slot(' the island','地點'),link(' has been transformed from a largely undeveloped natural area into a compact resort, with'),slot(' accommodation, catering facilities and transport links','三類新增'),link(' added mainly in the western and central sections.')]}),
 f('However, the cove and most woodland areas have been retained, while the eastern end remains largely untouched.','對照西中開發與海灘、棕櫚樹及東端保留',[1,4,8],{formula:'However, [保留景物] have been retained, while [少改區] remains largely untouched',meaning:'西岸海灘與大部分棕櫚樹仍在，東端沒有大規模建築。',usage:'beach 今日多了游泳標示及步道，因此「保留」不表示周邊用途完全不變。',parts:[link('However,'),slot(' the beach and most palm-tree areas','保留景物'),link(' have been retained, while'),slot(' the eastern end','少改區'),link(' remains largely untouched.')]}),
 f('Before development, the headland contained only natural features.','簡潔概括前圖只有自然元素',[0,5,8],{formula:'Before development, [地點] contained only natural features',meaning:'前圖只標海灘與棕櫚樹，沒有建築、碼頭或路徑。',usage:'圖上無正式設施，不可推斷島上絕無人到訪；只能描述圖示。',parts:[link('Before development,'),slot(' the island','地點'),link(' contained only natural features.')]}),
 f('A cove lay on the western shore, and groups of pine trees were scattered across the middle and, more densely, towards the east.','按西岸、中部、東部定位原有自然景物',[0,3,8],{formula:'A [西岸景物] lay on the western shore, and groups of [植物] were scattered across the middle and, more densely, towards the east',meaning:'海灘在西端，棕櫚樹中部有少數，東部樹群更密。',usage:'east 是圖右方；開發後東端多數樹仍在。',parts:[link('A'),slot(' beach','西岸景物'),link(' lay on the western shore, and groups of'),slot(' palm trees','植物'),link(' were scattered across the middle and, more densely, towards the east.')]}),
 f('There were no hotels, roads, paths or landing facilities, so access to and movement around the island were not formally provided.','由圖中缺少建築與通道，歸納未有正式交通安排',[0,4,8],{formula:'There were no [四類設施], so access to and movement around the island were not formally provided',meaning:'開發前無建築、道路、小徑與登岸碼頭；後圖才有 pier、vehicle track、footpath。',usage:'not formally provided 描述地圖沒有設計通道，不代表人絕對無法走上島。',parts:[link('There were no'),slot(' buildings, roads, paths or landing facilities','四類設施'),link(', so access to and movement around the island were not formally provided.')]}),
 f('Following construction, two clusters of guest cabins have been built: one close to the beach in the west and another around an open central area.','分清兩組住宿小屋的西部與中部位置',[0,4,8],{formula:'Following construction, [數量與設施] have been built: one close to the beach in the west and another around an open central area',meaning:'西側一組小屋靠海灘，中部偏東另一組圍繞空地。',usage:'兩組 huts 是同一類住宿，不可把中部小屋誤作餐廳或接待處。',parts:[link('Following construction,'),slot(' two clusters of accommodation huts','數量與設施'),link(' have been built: one close to the beach in the west and another around an open central area.')]}),
 f('These are linked by footpaths, one of which also runs to the cove, now marked for swimming.','以 these 回指住宿小屋，說明步道與游泳海灘連接',[0,4,9],{formula:'These are linked by footpaths, one of which also runs to [目的地], now marked for swimming',meaning:'虛線 Footpath 連接兩組小屋，其中一路到西岸海灘，海灘標 Swimming。',usage:'These 指上一句兩組住宿小屋，不是棕櫚樹；footpaths 與南岸車道是不同線型。',parts:[link('These are linked by footpaths, one of which also runs to'),slot(' the beach','目的地'),link(', now marked for swimming.')]}),
 f('A visitor centre stands near the centre, with a small café just to its north.','以中部接待處定位其北面餐廳',[0,4,7],{formula:'A [中央服務樓] stands near the centre, with [另一服務樓] just to its north',meaning:'接待處在中部稍偏西，餐廳在其正北；兩者沿車道連碼頭。',usage:'餐廳不在接待處南面；南面的是碼頭。',parts:[link('A'),slot(' reception building','中央服務樓'),link(' stands near the centre, with'),slot(' a restaurant','另一服務樓'),link(' just to its north.')]}),
 f('To the south, a jetty has been added for boats, and vehicle tracks now connect it with both main service buildings.','定位南岸碼頭及連向接待處／餐廳的車道',[0,4,8],{formula:'To the south, [登岸設施] has been added for boats, and vehicle tracks now connect it with both main service buildings',meaning:'南岸碼頭供船到達，車道由碼頭經接待處通往餐廳。',usage:'vehicle tracks 是圖例中不同於 dotted footpath 的路；兩座主服務樓指 Reception 和 Restaurant。',parts:[link('To the south,'),slot(' a pier','登岸設施'),link(' has been added for boats, and vehicle tracks now connect it with both main service buildings.')]}),
];
const intro=[
 quiz('兩張島嶼圖的比較軸是甚麼？',['旅遊設施建設前與建設後','兩座不同島的面積','同一島每年旅客數','東岸與西岸的海水深度'],'圖題 Before／After，顯示同一島的設施變化。'),
 {type:'multi',prompt:'哪兩項最適合放入概覽？',detail:'選兩項，再按「確認」。',options:[
  '島由大致自然景觀改為西部與中部有住宿、餐飲和交通連接的小型度假區',
  '西岸海灘和多數棕櫚樹保留，東端大致未改',
  '整座島每個地點都被住宿小屋覆蓋',
  '開發後海灘、棕櫚樹及東端全部消失',
 ],correct:[0,1],why:'概覽同時說開發集中區域與保留的自然區域。'},
];
const route=[sequence('依範文次序，排好四段的島嶼地圖報告工作',[
 ['地圖介紹','同一島在旅遊設施建造前與後。'],
 ['整體概覽','西中部改度假區，東端和海灘／多數樹保留。'],
 ['建造前','西岸海灘，中部及東部棕櫚樹；無建築、碼頭或正式路徑。'],
 ['建造後','西與中兩組住宿小屋、步道往海灘、中央接待及北餐廳、南岸碼頭和車道。'],
],'按西、中、東與南岸定位，並分清 footpath 虛線和 vehicle track。')];
const evidence=[
 quiz('開發前海灘與棕櫚樹如何分布？',['海灘在西岸，棕櫚樹在中部及更密的東部','海灘在東岸，樹只在西部','兩者都在南岸碼頭上','開發前完全沒有自然景觀'],'前圖 Beach 在左端，Palm trees 中部少、東部多。'),
 quiz('開發前哪些正式設施尚未出現？',['建築、道路、步道及登岸碼頭','海灘和棕櫚樹','島嶼和海水','東部樹群'],'前圖只見自然景物；後圖才有 huts、pier 和路徑。'),
 quiz('兩組住宿小屋分別在哪裏？',['一組近西岸海灘，一組圍繞中部空地','兩組都在東端未開發區','兩組都建在海上','一組是碼頭，另一組是餐廳'],'後圖 west 一組靠海灘，中央偏東另一組圍開放地。'),
 quiz('哪種路線連小屋並通往游泳海灘？',['虛線 Footpath 步行小徑','車道 Vehicle track','新建高速公路','南岸碼頭的海上航道'],'圖例 dotted line 是 Footpath，一條連西岸 Swimming。'),
 quiz('接待處與餐廳的相對位置？',['餐廳在接待處北面','餐廳在接待處南面碼頭上','兩者都在東端','接待處在西岸海灘外海'],'後圖 Restaurant 位於 Reception 上方。'),
 quiz('南岸新增甚麼，怎樣連服務樓？',['供船靠泊的碼頭，車道通接待處與餐廳','東岸新海灘，步道只通樹林','一座機場，沒有任何路','南岸沒有新設施'],'Pier 在南面海岸，vehicle track 連中央兩主服務樓。'),
 quiz('東端在開發後如何？',['大致保留自然狀態和多數棕櫚樹','被全部住宿小屋覆蓋','改成大型碼頭','變成第二片游泳海灘'],'後圖主要建築集中西中，右端仍見樹木與空地。'),
];
const logic=[
 sequence('建設前：以三個自然區定位',[
  ['西端','有 Beach，未標 Swimming 或步道。'],
  ['中部','有少量棕櫚樹，無建築。'],
  ['東端','棕櫚樹較密，沒有碼頭或住宿。'],
  ['全島','未畫正式登岸點、車道或步行小徑。'],
 ],'地圖沒有畫正式交通設施，不等於能證明從來沒有人到島上。'),
 sequence('建設後：分清住宿、服務與兩類通道',[
  ['住宿','西部近海灘一組，中部圍空地一組。'],
  ['步道','虛線連小屋、接待處及西岸 Swimming 海灘。'],
  ['服務','Reception 在中部，Restaurant 正北。'],
  ['登岸與車道','南岸 Pier 供船靠泊；車道連兩服務樓，東端大致自然。'],
 ],'同一條線型對應同一用途；不要把 footpath 寫成車道。'),
];
const transfers=[
 transfer('兩張圖顯示一個海邊地點在旅遊設施建造前後。','哪句引言正確？',['地圖比較同一地點在興建旅遊設施前後的佈局。','地圖比較兩座島的旅客數。','地圖顯示每年酒店收入。','地圖解釋海灘形成原因。'],['同地點、前後狀態及設施建造清楚。','不是兩座島的統計。','沒有收入。','沒有原因資料。'],[0],'原文同一島 before and after construction of tourist facilities。'),
 transfer('新住宿、餐廳及交通路線集中在島西部和中部，東端仍自然。','哪句概覽避免說全島都開發？',['島由自然區變小型度假地，設施主要集中西部與中部。','整座島包括東端每一處都改成旅館。','開發只在東端，西中部毫無變化。','島的海岸線被完全移走。'],['設施集中範圍與小型轉型準確。','東端大致自然。','設施在西中部。','海岸仍在。'],[1],'原文 compact resort，新增集中 western and central sections。'),
 transfer('後圖西岸海灘與多數樹仍在，東端近乎沒有建築。','哪句把保留與開發並說？',['海灘和多數棕櫚樹保留，東端大致未改。','所有自然景物都已拆除。','東端全部被酒店填滿。','西岸海灘被碼頭取代。'],['保留區域和東端狀態符合圖。','海灘與樹仍在。','東端仍自然。','碼頭在南岸中部。'],[2],'原文 beach／most palm-tree areas retained，east largely untouched。'),
 transfer('建設前圖只標海灘與樹，沒有建築。','哪句不憑空加設施？',['開發前島上只顯示自然景物。','開發前已有接待處與餐廳。','開發前已有兩組小屋。','開發前南岸已有碼頭。'],['只根據前圖顯示內容。','接待處餐廳屬後圖。','住宿屬後圖。','碼頭屬後圖。'],[3],'原文 Before development island contained only natural features。'),
 transfer('西岸有海灘，中部有些樹，東部樹更多。','哪句按空間順序說準？',['海灘在西岸，棕櫚樹散布中部，東部較密。','海灘在東岸，棕櫚樹只在西端。','全島完全沒有樹。','中部全部是酒店。'],['西岸、中部、東部的自然景物配準。','方向相反。','圖中有樹。','前圖無酒店。'],[4],'原文 beach western shore，palms middle and more densely east。'),
 transfer('前圖沒有畫建築、路、步道或碼頭。','哪句推論不超出地圖？',['圖中未顯示正式登岸或島內通行設施。','這證明從來沒有人登島。','這證明島上絕不可能步行。','圖中已顯示汽車和餐廳。'],['只描述地圖有否設施，不斷言人類活動不可能。','圖不支持絕對歷史結論。','自然地面仍可能步行。','沒有車和餐廳。'],[5],'原文 no buildings/roads/paths/landing facilities，未有 formally provided access。'),
 transfer('建成後一組住宿靠西岸海灘，另一組圍中部空地。','哪句區分兩組小屋？',['兩組住宿小屋分別靠西岸海灘及環繞中部空地。','兩組小屋都在東端樹林之外。','只有一組小屋，位於南岸海上。','一組其實是餐廳，另一組是碼頭。'],['兩組位置和用途都正確。','東端少建築。','圖上兩組。','兩組均是住宿。'],[6],'原文 two clusters west near beach／around open central area。'),
 transfer('小屋由虛線步道相連，一條還通西岸游泳海灘。','哪句不把步道寫成車道？',['住宿由步行小徑連接，其中一條通向游泳海灘。','所有小屋只由汽車高速公路連接。','步道只通南岸碼頭，不到海灘。','游泳海灘在東端。'],['圖例 footpath 與海灘支路正確。','圖中是步道。','另有通海灘步道。','海灘在西端。'],[7],'原文 huts linked by footpaths，一條到 beach now swimming。'),
 transfer('接待處位於島中部，餐廳緊靠其北面。','哪句保持南北相對位置？',['接待處在中部附近，餐廳正位於其北面。','餐廳在接待處南面的碼頭上。','兩服務樓都在東端樹林。','接待處在海灘外海。'],['接待處／餐廳關係準確。','餐廳在北。','兩者在中部。','接待處在陸上。'],[8],'原文 reception near centre，restaurant just north。'),
 transfer('南岸碼頭供船靠泊，車道連碼頭至接待處和餐廳。','哪句分清車道的兩個目的地？',['南岸新碼頭由車道連到兩座服務樓：接待處與餐廳。','碼頭只連東端棕櫚樹，服務樓沒有路。','步道和車道都是同一虛線。','碼頭建於西岸游泳海灘正中央。'],['碼頭、車道與兩樓配準。','車道連兩服務樓。','圖例線型不同。','碼頭在南岸中部。'],[9],'原文 pier south，vehicle tracks connect both main service buildings。'),
];
export default {key:'task1-maps:10',meta:{topic:'島嶼旅遊設施建設前後',summary:'西中部增兩組住宿、接待餐廳、步道與南岸碼頭車道；海灘和多數棕櫚樹保留，東端大致不動，分清步行與車行路線。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
