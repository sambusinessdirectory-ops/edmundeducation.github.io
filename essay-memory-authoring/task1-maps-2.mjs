// Task 1 Maps 2: Porth Harbour, 2000 and today.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先對照港口兩圖的方向和功能，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two plans show how Porth Harbour has changed from 2000 to today.',
 'Overall, the harbour now has more buildings and services for visitors.',
 'The biggest changes are a new hotel, cafés and shops, a beach for hotel guests, a bigger dock, and new places for the private boats and fishing boats.',
 'In the west, the two car parks and main road are still there. The first showers and toilets are also still beside the northern car park.',
 'But the place for private yachts has moved south from the northwest water area to the former fishing-boat area.',
 'The fishing boats now use the old yacht area.',
 'Another showers-and-toilets block has been built near the southern car park. Cafés and shops have also been built west of the lifeboat station.',
 'Farther east, the dock has been made bigger, with more space for boats to stop. The passenger ferries are still nearby.',
 'A hotel has replaced the old unused castle on the small piece of land. People can reach it by a longer road.',
 'The southern beach is now only for hotel guests. The northern public beach and lifeboat station are mostly the same.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['has changed since 2000','has changed from 2000 to today','自 2000 年改變']),
 v(['more developed','more buildings','更多設施'],['visitor-oriented','services for visitors','以遊客為主']),
 v(['main changes','biggest changes','主要變化'],['addition of','new','新增'],['commercial facilities','cafés and shops','商業設施'],['private beach','beach for hotel guests','私人海灘'],['expansion','bigger','擴建'],['relocation','new places','遷移']),
 v(['western side','west','西面'],['still in place','still there','仍在原位'],['original showers and toilets','first showers and toilets','原有淋浴與洗手間'],['retained','still','保留'],['beside','beside','旁邊']),
 v(['However','But','然而'],['marina for private yachts','place for private yachts','私人遊艇碼頭'],['formerly','former','原本'],['north-west basin','northwest water area','西北水域'],['moved southwards','moved south','往南遷移'],['once used by fishing boats','former fishing-boat area','舊漁船區']),
 v(['These boats','The fishing boats','這些漁船'],['occupy','use','使用／停泊'],['former marina site','old yacht area','舊遊艇區']),
 v(['second block of showers and toilets','Another showers-and-toilets block','第二座淋浴與洗手間'],['lower car park','southern car park','較南停車場'],['cafés and shops','Cafés and shops','咖啡店與商店'],['added','built','新增'],['west of','west of','在西面']),
 v(['Further east','Farther east','更往東'],['enlarged','made bigger','擴建'],['extra mooring space','more space for boats to stop','新增泊位'],['although','The passenger ferries are still nearby','不過'],['remain nearby','still nearby','仍在附近']),
 v(['disused castle','old unused castle','廢棄城堡'],['small peninsula','small piece of land','小半島'],['replaced by','replaced','被取代'],['accessed by an extended road','reach it by a longer road','延伸道路可達']),
 v(['southern beach','southern beach','南面海灘'],['reserved for hotel guests','only for hotel guests','只供酒店住客'],['whereas','The northern public beach','而'],['largely unchanged','mostly the same','大致不變']),
];
const structures=[
 f('The two plans illustrate how Eastport Harbour has changed since 2010.','引言界定同一港口從過去年至今天的變化',[2,4,8],{formula:'The two plans illustrate how [地點] has changed since [過去年]',meaning:'兩張圖比較 Porth Harbour 2000 年與今天的佈局。',usage:'since 2000 連到今日；不是說港口於 2000 年才建成。',parts:[link('The two plans illustrate how'),slot(' Porth Harbour','地點'),link(' has changed since'),slot(' 2000.','過去年')]}),
 f('Overall, the port has become more developed and visitor-oriented.','概覽港口功能增加並更服務遊客',[0,3,7],{formula:'Overall, [地點] has become more developed and visitor-oriented',meaning:'今日多了酒店、私用海灘、商店咖啡店、新衛浴及碼頭泊位。',usage:'visitor-oriented 指新設施的用途，不代表漁船或客運渡輪完全停止使用。',parts:[link('Overall,'),slot(' the harbour','地點'),link(' has become more developed and visitor-oriented.')]}),
 f('The main changes are the addition of hotel and retail facilities, the creation of a private beach, the expansion of the dock area, and the relocation of the marina and fishing boats.','列四類主要改變：新設、私用、擴建與互換位置',[1,4,8],{formula:'The main changes are the addition of [新設施], the creation of [新用途], the expansion of [擴建區], and the relocation of [搬遷對象]',meaning:'新酒店／商業設施、南岸私用海灘、擴大碼頭、遊艇與漁船互換停泊區。',usage:'relocation 是遊艇和漁船交換原有位置；不要寫成兩者都移到同一碼頭。',parts:[link('The main changes are the addition of'),slot(' hotel and commercial facilities','新設施'),link(', the creation of'),slot(' a private beach','新用途'),link(', the expansion of'),slot(' the dock area','擴建區'),link(', and the relocation of'),slot(' the marina and fishing boats.','搬遷對象')]}),
 f('On the western side, the two bus stops and the main road are still in place, and the original showers and toilets have been retained beside the northern bus stop.','先定位西面保留的通道、兩停車場和北面衛浴',[0,5,9],{formula:'On the western side, [保留設施] are still in place, and [另一保留設施] have been retained beside [定位地標]',meaning:'西側主路和兩停車場保留；原淋浴洗手間仍在北面停車場旁。',usage:'今日另新增南面停車場附近的第二座衛浴；本句只說原有北面一座。',parts:[link('On the western side,'),slot(' the two car parks and the main road','保留設施'),link(' are still in place, and'),slot(' the original showers and toilets','另一保留設施'),link(' have been retained beside'),slot(' the northern car park.','定位地標')]}),
 f('However, the pier for private boats, formerly in the northern basin, has been moved southwards to the area once used by ferries.','交代遊艇碼頭由舊西北區移至舊漁船區',[0,3,8],{formula:'However, [搬遷對象], formerly in [舊位置], has been moved southwards to [新位置／舊用途]',meaning:'私人遊艇從西北原泊位搬到較南、原本供漁船停泊的區域。',usage:'移動的是私人遊艇泊位；不是主路或客運渡輪。',parts:[link('However,'),slot(' the marina for private yachts','搬遷對象'),link(', formerly in'),slot(' the north-west basin','舊位置'),link(', has been moved southwards to'),slot(' the area once used by fishing boats.','新位置／舊用途')]}),
 f('These boats now occupy the former yacht-marina site.','以 these boats 回指前句漁船，交代互換另一半',[1,4,8],{formula:'These boats now occupy the former [原佔用者] site',meaning:'漁船現在泊在原私人遊艇碼頭的西北位置；兩者互換區域。',usage:'These boats 回指前句末的 fishing boats，不是 private yachts。',parts:[link('These boats now occupy the former'),slot(' marina','原佔用者'),link(' site.')]}),
 f('A second block of showers and toilets has been built near the southern car park, while kiosks and shops have been added west of the ticket office.','定位兩處新服務設施：南停車場附近與救生艇站西邊',[0,4,8],{formula:'A second block of showers and toilets has been built near [停車場], while [商業設施] have been added west of [地標]',meaning:'新增衛浴在較南停車場旁；咖啡店和商店在救生艇站西側。',usage:'新衛浴不同於仍在北面停車場旁的原衛浴；cafés & shops 在救生艇站西面。',parts:[link('A second block of showers and toilets has been built near'),slot(' the lower car park','停車場'),link(', while'),slot(' cafés and shops','商業設施'),link(' have been added west of'),slot(' the lifeboat station.','地標')]}),
 f('Further east, the pier has been enlarged with extra mooring space, although the tour boats remain nearby.','往東轉到碼頭擴建，同時保留客運渡輪的位置',[1,4,9],{formula:'Further east, [設施] has been enlarged with extra mooring space, although [保留交通] remain nearby',meaning:'東側碼頭今日多了泊位；客運渡輪仍在附近水域。',usage:'碼頭增加停泊空間不表示客運渡輪搬走；兩圖都在東側附近。',parts:[link('Further east,'),slot(' the dock','設施'),link(' has been enlarged with extra mooring space, although'),slot(' the passenger ferries','保留交通'),link(' remain nearby.')]}),
 f('The disused fort on the small peninsula has been replaced by a hotel, accessed by an extended road.','同位置說舊建築被新酒店取代，並交代新道路可達',[1,4,7],{formula:'The disused [舊建築] on the small peninsula has been replaced by [新建築], accessed by an extended road',meaning:'小半島上的廢棄城堡變為酒店，原有道路延伸至酒店。',usage:'酒店在舊城堡原址；路被延長，但主路仍保留。',parts:[link('The disused'),slot(' castle','舊建築'),link(' on the small peninsula has been replaced by'),slot(' a hotel','新建築'),link(', accessed by an extended road.')]}),
 f('The southern beach is now reserved for resort guests, whereas the northern public beach and ticket office remain largely unchanged.','對照南岸改為酒店私用與北岸公共海灘、救生艇站保留',[0,4,8],{formula:'The southern beach is now reserved for [使用者], whereas [北面保留設施] remain largely unchanged',meaning:'南面海灘從公共變為酒店住客專用；北面公共海灘和救生艇站大致未變。',usage:'兩個海灘不能混同；北面仍標 Public beach，南面改標 Private beach。',parts:[link('The southern beach is now reserved for'),slot(' hotel guests','使用者'),link(', whereas'),slot(' the northern public beach and lifeboat station','北面保留設施'),link(' remain largely unchanged.')]}),
];
const intro=[
 quiz('兩張圖顯示哪兩個時點？',['Porth Harbour 2000 年與今天','兩個不同港口同一年','港口每年漁獲量','酒店建造前後的旅客數'],'同一 Porth Harbour 的兩張平面圖標 2000 和 today。'),
 {type:'multi',prompt:'哪兩項最適合作為整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '港口增加酒店、商業及遊客服務，南岸海灘改為住客專用',
  '碼頭擴建，私人遊艇與漁船互換停泊位置，但主路、停車場及北面公共海灘仍在',
  '港口所有原有設施都已被拆除',
  '客運渡輪已搬到北面的公共海灘上',
 ],correct:[0,1],why:'概覽要兼顧開發、新功能、泊位變更與保留要素。'},
];
const route=[sequence('依範文次序，排好四段的港口地圖報告工作',[
 ['平面圖介紹','交代 Porth Harbour 2000 年與今天。'],
 ['整體概覽','更以遊客為主；酒店與商業設施、私人海灘、碼頭擴建、遊艇與漁船換位。'],
 ['西面細節','主路、兩停車場及北面衛浴保留；遊艇／漁船換位，南面衛浴與商店新增。'],
 ['東面與海灘','碼頭增泊位、渡輪附近不變；城堡換酒店、路延長、南岸改私用。'],
],'以西、東分區，逐項區分保留、擴建、新設及搬遷。')];
const evidence=[
 quiz('私人遊艇碼頭與漁船區如何改變？',['兩者互換原有的西北與較南位置','兩者都搬到酒店半島','兩者從未改位','兩者都停在北面公共海灘'],'今日漁船在原遊艇西北泊位，遊艇在原漁船較南泊位。'),
 quiz('哪幾項在西側仍保留？',['主路、兩停車場、北面原有淋浴洗手間','舊城堡、兩片公共海灘','只有南面新增衛浴','原遊艇碼頭與原漁船區的使用者不變'],'主路及兩停車場圖上位置大致相同，原衛浴仍在北停車場旁。'),
 quiz('第二座衛浴設於何處？',['較南停車場附近','北面公共海灘上','酒店半島頂端','渡輪旁的碼頭上'],'今日圖顯示新 Showers & toilets 在南面的停車場上方。'),
 quiz('咖啡店與商店在何處？',['救生艇站西面','酒店東面海上','北面公共海灘上','原城堡裏'],'今日 Cafés & shops 位於 Lifeboat 的左側。'),
 quiz('東側碼頭與客運渡輪如何？',['碼頭擴建多泊位，渡輪仍在附近','碼頭縮小，渡輪消失','渡輪搬至北停車場','碼頭被酒店取代'],'今日碼頭多出泊位，客運渡輪依然在東側水域。'),
 quiz('小半島的建築和道路如何改變？',['廢棄城堡被酒店取代，道路延長通往酒店','酒店被城堡取代，道路拆除','城堡搬至西北遊艇區','半島變為第二座停車場'],'酒店在原 Castle (disused) 位置，今日有延伸路段。'),
 quiz('南北兩片海灘今日有何不同？',['南岸變酒店住客專用，北岸仍為公共海灘','兩片都改為酒店私用','兩片都被碼頭取代','北岸成私人海灘，南岸仍公共'],'南岸標 Private beach (for the hotel)，北岸仍標 Public beach。'),
];
const logic=[
 sequence('先用方位識別兩組保留與改變',[
  ['西側陸地','主路、兩停車場、北面原衛浴保留；南面新衛浴與商店加入。'],
  ['西側水域','遊艇由西北移南，漁船由南移到遊艇舊址。'],
  ['東側水域','碼頭擴大，多一處泊位；渡輪仍在附近。'],
  ['東側半島','廢棄城堡換酒店，道路延長，南岸海灘改為酒店私用。'],
 ],'先對照同一位置的標籤，再判斷是保留、換位、取代還是新增。'),
 sequence('把視覺證據變成可核對的報告',[
  ['兩停車場','原有兩個均保留；不是今日才新增兩個。'],
  ['兩座衛浴','北面原有一座保留，南面停車場附近另增一座。'],
  ['兩類船','遊艇和漁船互換區域，客運渡輪未顯示搬遷。'],
  ['兩片海灘','南面從 Public 改 Private，北面 Public 保留。'],
 ],'相似名稱的設施要用方位區分，尤其兩停車場、兩衛浴、兩海灘。'),
];
const transfers=[
 transfer('兩張圖比較同一港口 2010 年與今天。','哪句引言界定時點與地點？',['兩張平面圖展示該港口自 2010 年以來的佈局變化。','兩圖比較兩個港口在同一天的船隻數。','兩圖顯示港口 2010 年的收入。','兩圖解釋港口擴建的原因。'],['同一港口兩時點的變化清楚。','不是兩個港口。','圖中是空間佈局。','沒有原因資料。'],[0],'原文引言比較 Porth Harbour 自 2000 年以來的改變。'),
 transfer('港口現多了酒店、商店、住客海灘與衛浴；漁船仍在港口。','哪句概覽不把原有功能誤寫為消失？',['港口變得設施更多，也更方便遊客使用。','港口已完全停止所有船舶活動。','港口只剩漁業，沒有遊客設施。','所有設施均毫無變化。'],['訪客服務增加，但原有船舶功能仍在。','漁船仍在。','遊客服務已加入。','地圖顯示多項變化。'],[1],'原文概覽港口 more developed and visitor-oriented。'),
 transfer('新酒店、商店、私用海灘、擴建碼頭，遊艇與漁船換位。','哪句概括四種不同變化？',['港口新增酒店與商店、設私用海灘、擴大碼頭，並調換兩種船的泊位。','港口只加了一間商店，其他都不變。','遊艇與漁船都搬到同一片海灘。','酒店已被舊城堡取代。'],['新增、用途轉換、擴建、換位各有對應。','其餘三類變化被漏掉。','兩種船互換區域。','舊城堡被酒店取代。'],[2],'原文列酒店商業、私用海灘、擴建碼頭與泊位搬遷。'),
 transfer('西側主路、兩停車場、北面停車場旁原有衛浴都仍在。','哪句保留地點與設施？',['西側主路和兩停車場仍在，原衛浴仍在北面停車場旁。','兩停車場今日才新建。','北面原衛浴已搬至酒店半島。','主路已完全消失。'],['原有三組設施及北側定位準確。','兩停車場原本就有。','原衛浴保留。','主路仍在。'],[3],'原文西側兩停車場、主路和北面原衛浴保留。'),
 transfer('舊圖遊艇在西北、漁船在南；今日遊艇到了舊漁船區。','哪句說對遊艇搬遷？',['私人遊艇碼頭從西北移向南面原漁船區。','私人遊艇從南面移到西北原漁船區。','遊艇搬到北面公共海灘。','遊艇原地不動。'],['舊址、新址及向南方向都正確。','舊新位置倒置。','新址是舊漁船區。','今日位置已變。'],[4],'原文 marina 自 north-west basin 向南搬到舊漁船區。'),
 transfer('遊艇從西北搬到南面舊漁船區；漁船今日泊在舊遊艇區。','These boats 在這段應回指哪種船？',['漁船；它們現用原遊艇碼頭位置。','私人遊艇；它們仍在西北舊址。','客運渡輪；它們搬到停車場。','所有船隻；它們都泊在同一區。'],['前句末的 fishing boats 是 these boats 的明確先行詞。','遊艇已移南。','渡輪另在東側。','兩者分區互換。'],[5],'原文 These boats now occupy the former marina site 指漁船。'),
 transfer('今日南面停車場旁新建衛浴；救生艇站西側新建咖啡店與商店。','哪句把兩處新設施配對準確？',['新衛浴靠近較南停車場，咖啡店與商店在救生艇站西面。','新衛浴在救生艇站東面，商店在北面海灘。','兩處設施都在酒店半島。','原有北面衛浴已被拆除。'],['兩個地點和兩種設施準確。','方位與位置錯。','兩處都在西側。','原衛浴仍在。'],[6],'原文第二座衛浴近 lower car park，咖啡店／商店在 lifeboat station 西面。'),
 transfer('東側碼頭增加泊位，客運渡輪仍在其附近水域。','哪句同時說擴建與保留？',['碼頭向外擴大並增加泊位，渡輪仍在附近。','碼頭擴大後渡輪搬到西側停車場。','碼頭已被完全拆除。','渡輪變成私人遊艇。'],['碼頭變化與渡輪位置不變都保留。','渡輪仍在東側。','碼頭擴建。','船種不同。'],[7],'原文東側 dock enlarged，passenger ferries remain nearby。'),
 transfer('小半島原有廢棄城堡；今日同位置是酒店，主路有延伸段可到達。','哪句說對取代與通達？',['城堡被酒店取代，並可循延長的道路抵達。','酒店被城堡取代，道路縮短。','酒店在西北舊遊艇區。','城堡與酒店今日並排保留。'],['同址取代和道路延長都準確。','順序與道路方向錯。','酒店在小半島。','舊城堡已不見。'],[8],'原文半島廢棄城堡被酒店取代，有延伸道路通往。'),
 transfer('南面海灘由公共轉為酒店住客專用，北面海灘仍公共，救生艇站亦保留。','哪句不混淆兩片海灘？',['南岸改為酒店住客專用，而北岸公共海灘與救生艇站大致不變。','北岸改成酒店專用，南岸仍公共。','兩片海灘都已被酒店佔去。','救生艇站搬到南岸海灘。'],['南北海灘的不同用途和保留地標都說準。','南北倒置。','北岸仍公共。','救生艇站仍在原址。'],[9],'原文南岸 reserved for hotel guests，北岸公共海灘與救生艇站大致不變。'),
];
const balancedTransferOptions=[
 ['兩張平面圖展示同一港口由2010年至今的佈局變化。','兩張平面圖比較兩個港口於2010年的船隻數目。','兩張平面圖展示該港口2010年的收入比例變化。','兩張平面圖解釋該港口2010年擴建的具體原因。'],
 ['港口新增遊客服務設施，但原有漁船活動仍保留。','港口新設旅遊服務後，全部船舶活動已停止。','港口現在只剩漁業，完全沒有新增遊客設施。','港口全部設施都毫無變化，遊客也沒有增加。'],
 ['新增酒店與商店，海灘改私用，碼頭擴大，船位互換。','港口只新增一間商店，其餘設施及船位完全未變。','港口遊艇與漁船都搬到同一海灘，沒有擴建。','港口酒店已被舊城堡取代，其他建築亦拆除。'],
 ['西側主路與兩停車場保留，原衛浴仍在北停車場旁。','西側主路與兩停車場全部都是今日才新建。','北面停車場旁的原衛浴已搬到東側酒店半島。','原有西側主路已完全消失，兩停車場也不見。'],
 ['私人遊艇由西北移到南面的舊漁船泊位。','私人遊艇由南面移到西北的舊漁船泊位。','私人遊艇已搬到北面的公共海灘附近。','私人遊艇從未搬遷，仍停在西北原址。'],
 ['漁船；它們現泊在原先的遊艇碼頭位置。','私人遊艇；它們現仍泊在西北原有位置。','客運渡輪；它們現改泊在西側停車場。','所有船隻；它們今日都泊在同一片水域。'],
 ['新衛浴設在南面停車場旁，商店位於救生艇站西面。','新衛浴設在救生艇站東面，商店位於北面海灘。','兩處新增設施都建在東側的酒店半島之上。','原有北面衛浴已遭拆除，不再供任何人使用。'],
 ['東側碼頭擴大並增設泊位，渡輪仍在附近水域。','東側碼頭擴大後，渡輪移到西側停車場旁。','東側碼頭已被完全拆除，渡輪也不再停泊。','東側渡輪已改作私人遊艇，附近沒有客船。'],
 ['廢棄城堡原址改建酒店，延長的道路可直達。','酒店原址改建城堡，原有通道反而縮短。','酒店新建於西北舊遊艇區，並非小半島。','廢棄城堡與酒店今天仍然並排保留。'],
 ['南岸海灘改為住客專用，北岸仍公共，救生艇站保留。','北岸海灘改為住客專用，南岸仍公共，站也保留。','南北兩片海灘都改建成酒店，沒有公共區域。','救生艇站搬到南岸海灘，北岸已經沒有設施。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-maps:2',meta:{topic:'Porth Harbour 2000 年與今天的港口佈局',summary:'辨識遊艇／漁船換位、碼頭擴建、城堡改酒店、南岸變私用，以及兩停車場／兩衛浴／兩海灘的保留與新增。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
