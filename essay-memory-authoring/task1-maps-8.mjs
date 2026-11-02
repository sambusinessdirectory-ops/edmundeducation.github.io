// Task 1 Maps 8: university sports centre now and proposed redevelopment.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先用中央 25 米泳池定位，再分清西側與東側的未來改建。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two plans show a university sports centre now and the changes planned for it.',
 'Overall, the centre is planned to grow on both its west and east sides, with indoor rooms taking the place of the two outdoor-court areas.',
 'The middle part, including the 25-metre pool, front desk, first changing room and seats, will stay mostly the same. But the gym will grow and new places for exercise, food and shopping will be added.',
 'Now, the sports centre is a small rectangular building.',
 'A 25-metre pool is in the middle, with a gym just to its north.',
 'A changing room is west of the pool, and seats are east of it.',
 'The front desk is by the entrance in the south. Outdoor courts are on both sides of the building.',
 'Under the plan, the west courts will become a large pool for leisure swimming, with another changing room and a sports shop to its south.',
 'On the east side, the courts will become a sports hall, two dance rooms, a café and another changing room.',
 'The gym will also be made larger across the north part of the centre.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['current layout','now','現有佈局'],['proposed redevelopment','changes planned','擬議重建']),
 v(['expected to expand','planned to grow','預計擴大'],['westwards and eastwards','west and east sides','向西及東'],['replacing','taking the place of','取代'],['outdoor court areas','outdoor-court areas','戶外球場'],['indoor facilities','indoor rooms','室內設施']),
 v(['existing central core','middle part','原有中央核心'],['reception','front desk','接待處'],['original changing room','first changing room','原更衣室'],['seating area','seats','座位區'],['remain largely unchanged','stay mostly the same','大致不變'],['enlarged','grow','擴大'],['leisure and commercial amenities','places for exercise, food and shopping','休閒商業設施']),
 v(['At present','Now','目前'],['consists of','is','由……組成'],['compact rectangular building','small rectangular building','小型矩形建築']),
 v(['occupies the middle','is in the middle','位於中央'],['directly to its north','just to its north','正北'],['25-metre pool','25-metre pool','25 米泳池']),
 v(['western side','west','西側'],['changing room','changing room','更衣室'],['whereas','and','而'],['seating','seats','座位'],['to the east','east','東面']),
 v(['reception area','front desk','接待處'],['southern entrance','entrance in the south','南入口'],['flanked by','on both sides','兩側包圍'],['outdoor courts','Outdoor courts','戶外球場']),
 v(['After redevelopment','Under the plan','重建後'],['western courts','west courts','西側球場'],['replaced by','become','改為'],['large leisure pool','large pool for leisure swimming','大型休閒泳池'],['additional changing room','another changing room','新增更衣室'],['to its south','to its south','在南面']),
 v(['eastern side','east side','東側'],['give way to','become','改為'],['sports hall','sports hall','體育館'],['dance studios','dance rooms','舞蹈室'],['another changing room','another changing room','另一更衣室']),
 v(['extended','made larger','擴建'],['northern part','north part','北部'],['complex','centre','建築群']),
];
const structures=[
 f('The two plans illustrate the current layout of a college sports centre and its proposed redevelopment.','引言分清現況與尚未完成的重建方案',[2,4,8],{formula:'The two plans illustrate the current layout of [設施] and its proposed redevelopment',meaning:'兩圖顯示一所大學體育中心現在與未來規劃。',usage:'proposed 是規劃；新增休閒泳池、體育館等不可寫成現有。',parts:[link('The two plans illustrate the current layout of'),slot(' a university sports centre','設施'),link(' and its proposed redevelopment.')]}),
 f('Overall, the centre is expected to expand westwards and eastwards, replacing both outdoor playgrounds with indoor sports facilities.','概覽左右兩側戶外球場將改為室內用途',[0,4,8],{formula:'Overall, the centre is expected to expand westwards and eastwards, replacing both [舊用途] with [新用途]',meaning:'西東兩塊 Outdoor courts 都被規劃室內設施取代。',usage:'兩側都擴展；不可只說西面球場被改建而東面維持原狀。',parts:[link('Overall, the centre is expected to expand westwards and eastwards, replacing both'),slot(' outdoor court areas','舊用途'),link(' with'),slot(' indoor facilities.','新用途')]}),
 f('The existing central core, including the main pool, reception, first changing room and seating area, will remain largely unchanged, while the fitness studio will be enlarged and new leisure and commercial amenities will be added.','概覽列保留中央核心，再對照健身房擴建及新服務',[0,5,8],{formula:'The existing central core, including [四保留項], will remain largely unchanged, while [擴建項] will be enlarged and new leisure and commercial amenities will be added',meaning:'中央 25 米池、接待處、左更衣室、右座位保留；健身房擴至更寬，新添體育館、舞蹈、咖啡與商店。',usage:'中央核心保留不表示整座中心不變；新增西側和東側設施是主要變化。',parts:[link('The existing central core, including'),slot(' the 25-metre pool, reception, original changing room and seating area','四保留項'),link(', will remain largely unchanged, while'),slot(' the gym','擴建項'),link(' will be enlarged and new leisure and commercial amenities will be added.')]}),
 f('At present, the sports centre consists of a small rectangular building.','先概括現有建築體量與形狀',[1,4,8],{formula:'At present, the sports centre consists of a [規模形狀] building',meaning:'現在主建築是中間的緊湊矩形；左右各有一片戶外球場。',usage:'這句只概括中央建築，兩側球場另於後句交代。',parts:[link('At present, the sports centre consists of a'),slot(' compact rectangular','規模形狀'),link(' building.')]}),
 f('A 20-metre pool occupies the middle, with a fitness room directly to its north.','以不變的中央泳池及其正北健身房定位',[0,3,8],{formula:'A [泳池] occupies the middle, with [健身設施] directly to its north',meaning:'中央 25m Pool、上方 Gym；未來 Gym 擴大但仍沿北側。',usage:'25 米池是原有標準泳池，西側未來另增 Leisure pool；兩池不要混淆。',parts:[link('A'),slot(' 25-metre pool','泳池'),link(' occupies the middle, with'),slot(' a gym','健身設施'),link(' directly to its north.')]}),
 f('On the western side of the main hall there is a ticket desk, whereas storage is located to the east.','對照中央泳池左右固定配置',[0,4,8],{formula:'On the western side of [中心設施] there is [西側設施], whereas [東側設施] is located to the east',meaning:'原有更衣室在 25 米泳池左邊，座位在右邊，兩者規劃中大致保留。',usage:'未來西南及東南另增兩個更衣室；本句只指原有池旁一間。',parts:[link('On the western side of'),slot(' the pool','中心設施'),link(' there is'),slot(' a changing room','西側設施'),link(', whereas'),slot(' seating','東側設施'),link(' is located to the east.')]}),
 f('The reception area stands at the southern entrance, and the building is flanked by tennis courts on both sides.','定位南入口接待處及現有左右兩塊戶外球場',[0,4,8],{formula:'The reception area stands at the southern entrance, and the building is flanked by [兩側設施] on both sides',meaning:'Reception 在南面入口；現有 Outdoor courts 分別在主建築西、東兩側。',usage:'主入口保留在南面；兩塊戶外球場才是未來重建時被取代的部分。',parts:[link('The reception area stands at the southern entrance, and the building is flanked by'),slot(' outdoor courts','兩側設施'),link(' on both sides.')]}),
 f('After redevelopment, the western courts will be replaced by a new indoor climbing wall, with a changing room and a café to its south.','定位西側球場的取代、休閒泳池與南面兩設施',[0,4,9],{formula:'After redevelopment, the western courts will be replaced by [新主設施], with [南面兩設施] to its south',meaning:'西側戶外球場改休閒泳池，池南有新更衣室和體育用品店。',usage:'新的 leisure pool 在西側，與保留的中間 25 米泳池不同。',parts:[link('After redevelopment, the western courts will be replaced by'),slot(' a large leisure pool','新主設施'),link(', with'),slot(' an additional changing room and a sports shop','南面兩設施'),link(' to its south.')]}),
 f('On the eastern side, the courts will give way to a squash court, two dance studios, a café and another changing room.','按東側圖例列四種新用途及舞蹈室數量',[0,4,7],{formula:'On the eastern side, the courts will give way to [東側新設施組]',meaning:'東側舊球場改 sports hall、兩間 dance studios、café、新更衣室。',usage:'東側有兩間舞蹈室而非一間；新的另一間更衣室在東南。',parts:[link('On the eastern side, the courts will give way to'),slot(' a sports hall, two dance studios, a café and another changing room.','東側新設施組')]}),
 f('The gym will also be extended across the northern part of the new complex.','收束健身房向北側橫向擴建',[0,4,8],{formula:'The gym will also be extended across the northern part of [整體建築]',meaning:'原健身房保留並沿整個新中心北部延伸。',usage:'gym 沒有搬至南面，也不是把中間 25 米池取代。',parts:[link('The gym will also be extended across the northern part of'),slot(' the complex.','整體建築')]}),
];
const intro=[
 quiz('兩張圖的時間狀態是甚麼？',['現在與擬議重建後，第二張尚屬規劃','兩個已完工體育中心','2000 年與 2010 年使用人數','同一中心早晚兩個時段'],'圖題 present／future plans，新增設施應使用預期或將會。'),
 {type:'multi',prompt:'哪兩項最適合放入概覽？',detail:'選兩項，再按「確認」。',options:[
  '中心將向東西兩側擴建，兩塊戶外球場改室內設施',
  '中央 25 米池、接待、更衣室及座位大致保留；健身房擴建並新增服務',
  '中央 25 米池將被拆除，所有設施完全搬位',
  '兩塊戶外球場都將原樣保留',
 ],correct:[0,1],why:'概覽同時說左右改建與中央核心保留，避免把未來圖說成已完成。'},
];
const route=[sequence('依範文次序，排好四段的體育中心報告工作',[
 ['平面圖介紹','界定現有佈局與擬議重建。'],
 ['整體概覽','兩側戶外球場換室內設施；中央核心保留、北側 Gym 擴大。'],
 ['目前佈局','中間 25m 池、北 Gym、西更衣、東座位、南 Reception，兩側戶外球場。'],
 ['未來佈局','西側 leisure pool／更衣／商店；東側 sports hall／兩舞蹈室／咖啡／更衣。'],
],'以中央泳池作固定錨點，再分西東兩側比較目前與規劃。')];
const evidence=[
 quiz('現有中心中央與其北面分別是甚麼？',['25 米泳池與健身房','休閒泳池與咖啡館','體育館與兩舞蹈室','兩片戶外球場'],'現有圖中央 25m Pool、上方 Gym。'),
 quiz('現有更衣室與座位相對 25 米池在哪邊？',['更衣室西側、座位東側','更衣室東側、座位西側','兩者都在北側','兩者都在戶外球場'],'現有圖池左 Changing room、池右 Seating。'),
 quiz('現有戶外球場如何分布？',['主建築西側與東側各一片','兩片都在泳池中央','只在北側一片','現有圖完全沒有球場'],'Outdoor courts 分別在原建築左右。'),
 quiz('規劃西側戶外球場變成甚麼？',['大型休閒泳池，南面另設更衣室和體育用品店','中央 25 米池被拆成兩半','兩間舞蹈室和咖啡館','原有戶外球場保持不變'],'西側 Leisure pool，下方 Changing room 與 Sports shop。'),
 quiz('規劃東側戶外球場變成哪些用途？',['體育館、兩間舞蹈室、咖啡館及新更衣室','休閒泳池、兩間商店','只有擴大的健身房','兩片新戶外球場'],'未來東側 Sports hall、Dance studio×2、Café、Changing room。'),
 quiz('規劃中哪四項中央核心大致保留？',['25 米池、接待處、原更衣室、座位','兩片戶外球場、兩舞蹈室','休閒泳池、商店、咖啡、體育館','只有東側新更衣室'],'中間原有區域在兩圖位置相近。'),
 quiz('健身房在規劃圖如何？',['沿新中心北部擴建','完全拆除改停車場','移到西南休閒泳池內','位置改到正南入口'],'Gym 在未來圖頂部橫向伸展。'),
];
const logic=[
 sequence('先以不變的中央核心定位',[
  ['中央','25m Pool 保留在中間。'],
  ['南面','Reception 仍在主入口。'],
  ['左右','原 Changing room 在池西，Seating 在池東。'],
  ['北面','Gym 仍在北側，但未來橫向擴大。'],
 ],'保留區與擴建區分開說；未來新增的兩間更衣室不是原有一間搬走。'),
 sequence('再對照被取代的兩側戶外球場',[
  ['西側','Outdoor courts→Leisure pool；南面增 Changing room、Sports shop。'],
  ['東側','Outdoor courts→Sports hall、兩個 Dance studios、Café、另一 Changing room。'],
  ['整體','由單一矩形核心向西向東擴張，戶外變室內。'],
  ['時間','這些都是 Future plans；目前圖沒有休閒池、舞蹈室或咖啡。'],
 ],'按方位逐項配對，避免把西側 leisure pool 與中央 25m Pool 混淆。'),
];
const transfers=[
 transfer('兩張圖顯示某大學體育中心現況及未來擬議重建。','哪句引言分清時點？',['平面圖展示體育中心目前佈局與擬議重建方案。','兩圖比較兩所已完工中心的入場人數。','圖表顯示每年健身會員收入。','圖表解釋改建成本。'],['同一中心現況對未來計劃。','不是兩中心。','圖中是空間佈局。','沒有成本資料。'],[0],'原文 current layout 對 proposed redevelopment。'),
 transfer('原建築西東各有戶外球場，規劃兩邊都改建成室內用途。','哪句概覽保留雙側擴建？',['中心預計向西及東擴展，兩片戶外球場均改室內設施。','只有西側會改建，東側維持戶外球場。','兩片球場今日已在室內。','中央泳池會取代全部室內設施。'],['兩側擴展與戶外→室內方向正確。','東側也改。','目前是戶外。','中央池保留。'],[1],'原文 expected to expand westwards/eastwards，兩側戶外球場被室內設施取代。'),
 transfer('中央泳池、接待、更衣及座位保持；北側健身房擴大，兩側新增用途。','哪句同時區分保留與增改？',['中央核心大致保留，健身房擴建，兩側加入新的休閒與商業設施。','中央所有設施都拆除，只有戶外球場保留。','健身房被搬到南面主入口。','只有座位改變，其他完全不變。'],['保留、擴建、新增三種狀態皆準。','中央核心保留。','Gym 在北面擴大。','另有多項新增。'],[2],'原文中央四項保留，Gym enlarged，leisure/commercial amenities added。'),
 transfer('目前主建築是一個小矩形，戶外球場另在兩側。','哪句只概括主建築形狀？',['現時體育中心由一座緊湊的矩形建築組成。','現時主建築已是兩側完整室內廊。','目前所有設施都是圓形。','未來圖沒有建築。'],['主體形狀準確，後句可再寫兩側球場。','室內擴建屬未來。','主體為矩形。','未來更大。'],[3],'原文 At present compact rectangular building。'),
 transfer('原圖 25 米池在中間，健身房緊靠其北面。','哪句以固定設施定位？',['25 米泳池在中央，健身房位於正北方。','健身房在中央，25 米池在南面。','兩者都在西側戶外球場。','25 米池在未來被完全拆除。'],['中央與正北關係正確。','位置對調。','兩者在室內核心。','25m 池保留。'],[4],'原文 25-metre pool middle，gym directly north。'),
 transfer('原圖更衣室在池西，座位在池東。','哪句不對調左右？',['泳池西側是更衣室，東側是座位區。','泳池東側是更衣室，西側是座位。','更衣室與座位都在北面健身房。','兩者均在戶外球場。'],['兩設施在池左右的位置正確。','左右對調。','分布在左右。','在原主建築內。'],[5],'原文 changing room west of pool，seating east。'),
 transfer('主入口和接待處在南側，戶外球場在原主建築左右兩邊。','哪句同時定位兩組設施？',['接待處位於南入口，建築兩側各有戶外球場。','接待處位於北面健身房，球場在中央池裏。','現有球場只在西側。','南面入口在未來已被完全封閉。'],['南入口及雙側球場都正確。','方位錯。','東側也有一片。','未來仍有主入口。'],[6],'原文 reception southern entrance，building flanked by outdoor courts。'),
 transfer('規劃西側戶外球場變休閒池，池南有新更衣室和體育用品店。','哪句不混淆中央 25 米池？',['西側舊球場改為大型休閒池，南面另增更衣室及體育用品店。','中央 25 米池改為西側戶外球場。','西側改兩間舞蹈室和咖啡館。','西側球場未來完全不變。'],['新休閒池與原中央池分開定位。','中央池保留。','舞蹈室在東。','西側被取代。'],[7],'原文 western courts→large leisure pool，南面新 changing room＋sports shop。'),
 transfer('規劃東側改為體育館、兩間舞蹈室、咖啡和另一更衣室。','哪句保留舞蹈室數量？',['東側球場將讓位予體育館、兩間舞蹈室、咖啡館和更衣室。','東側只建一間舞蹈室，沒有其他用途。','東側改大型休閒泳池和商店。','所有新設施都在原中央 25 米池上。'],['四類設施與兩間舞蹈室均準確。','兩間而非一間。','休閒池／商店在西。','中央池保留。'],[8],'原文 eastern courts→sports hall、two dance studios、café、changing room。'),
 transfer('未來 Gym 仍位於北側，橫向延伸得更長。','哪句表達擴建而非搬遷？',['健身房將沿中心北部擴大。','健身房會搬到南入口之外。','健身房將完全拆除。','健身房改成兩片戶外球場。'],['原 Gym 位置仍在北側但面積變大。','位置不在南。','Gym 保留並擴大。','戶外球場被取代。'],[9],'原文 gym extended across northern part。'),
];
const balancedTransferOptions=[
 ['平面圖比較同一體育中心現況與未來擬議重建。','平面圖比較兩所已完工中心的入場人數。','平面圖比較體育中心每年的會員總收入。','平面圖解釋體育中心未來改建成本的原因。'],
 ['中心將向東西兩側擴建，兩片戶外球場均改室內。','中心只向西側擴建，東側戶外球場完全保留。','中心兩片球場目前均已在室內，毋須擴建。','中心將拆掉中央泳池，用球場取代全部設施。'],
 ['中央核心保留，北側健身房擴大，兩側增設新用途。','中央所有設施拆除，兩側戶外球場反而保留。','健身房搬到南面入口，中央泳池也將被移走。','只有座位位置改變，其他設施都沒有變化。'],
 ['現時主體是一座緊湊矩形建築，兩側球場在外。','現時主體已是兩側完整室內廊，球場在內。','現時所有設施均為圓形，沒有矩形建築。','未來圖沒有主建築，只有空置的戶外球場。'],
 ['25米池在中央，健身房緊靠泳池北面。','健身房在中央，25米池緊靠建築南面。','25米池與健身房都在西側戶外球場。','25米池將在未來被完全拆除，不再保留。'],
 ['泳池西面是更衣室，東面則是觀眾座位。','泳池東面是更衣室，西面才是觀眾座位。','更衣室與座位都在北面健身房的旁邊。','更衣室與座位都位於兩側戶外球場之內。'],
 ['接待處在南入口，建築左右兩側各有戶外球場。','接待處在北面健身房，球場卻在中央泳池。','現有戶外球場只位於主建築的西側一邊。','南面入口未來會被完全封閉，不能再進入。'],
 ['西側舊球場改休閒池，池南另設更衣室與商店。','中央25米池改成西側戶外球場，舊池不保留。','西側舊球場改建兩間舞蹈室及一間咖啡館。','西側戶外球場在未來完全不變，沒有新設施。'],
 ['東側改體育館、兩間舞蹈室、咖啡館與更衣室。','東側只改建一間舞蹈室，沒有任何其他設施。','東側改成大型休閒泳池及一間體育用品店。','所有新設施都建在原有中央25米池上方。'],
 ['健身房將在北側原址向外擴大，沒有搬遷。','健身房將搬到南面入口外，北側改作球場。','健身房將被完全拆除，未來不再存在。','健身房將改建成兩片戶外球場，面積縮小。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-maps:8',meta:{topic:'大學體育中心現況與擬議重建',summary:'中央 25 米池、接待、原更衣與座位保留；兩側戶外球場改室內，西側休閒池，東側體育館／兩舞蹈室／咖啡，北側健身房擴大。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
