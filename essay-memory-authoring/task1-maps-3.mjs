// Task 1 Maps 3: Central Library, 20 years ago and today.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先核對入口、左區和右區的前後用途，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two plans show how the Central Library has changed in 20 years.',
 'Overall, the library was mainly for books and reading, but today it has more uses, including computers, events, talks and a café.',
 'The entrance is still in the same place, but the tables and chairs in the middle are gone, and several services have moved or changed.',
 'Twenty years ago, tables and chairs were in the middle, with rooms around them.',
 'On the left, the northwest room had CDs, videos and computer games. Adult story books were in the middle, and a room for newspapers and magazines was near the entrance.',
 'Today, the left side is very different: the old media and adult story-book areas now have children’s story books, a place for storytelling and sofas. The old reading room is now a computer room.',
 'There is also a new area for all reference books.',
 'On the right, a lecture room has taken the place of the old children’s books area.',
 'The old adult factual-book area now has adult story books, an information desk and machines people can use themselves. The old enquiry desk is now a café.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['reorganised','changed','重組'],['over the last two decades','in 20 years','過去二十年']),
 v(['mainly book- and reading-based space','mainly for books and reading','主要供藏書與閱讀'],['more varied facility','more uses','更多用途'],['technology','computers','科技'],['lectures','talks','講座'],['refreshments','a café','餐飲']),
 v(['Although','but','雖然／但'],['entrance remains in the same position','entrance is still in the same place','入口位置不變'],['central seating','tables and chairs in the middle','中央座位'],['disappeared','gone','消失'],['relocated or modernised','moved or changed','搬遷或更新']),
 v(['middle of the library','middle','圖書館中央'],['occupied by','were in','設有'],['tables and chairs','tables and chairs','桌椅'],['arranged around it','around them','圍繞中央']),
 v(['media room','northwest room','媒體室'],['north-west corner','northwest','西北角'],['adult fiction books','Adult story books','成人小說'],['reading room','room for newspapers and magazines','閱覽室'],['near the entrance','near the entrance','入口附近']),
 v(['fully reorganised','very different','全面重整'],['former media and fiction sections','old media and adult story-book areas','舊媒體與小說區'],['children’s fiction books','children’s story books','兒童小說'],['storytelling space','place for storytelling','講故事空間'],['old reading room','old reading room','舊閱覽室'],['become a computer room','now a computer room','改為電腦室']),
 v(['section','area','區域'],['all reference books','all reference books','所有參考書'],['introduced','new','新增']),
 v(['old children’s books area','old children’s books area','舊兒童書區'],['replaced by','taken the place of','被取代'],['lecture room','lecture room','講座室']),
 v(['former adult non-fiction section','old adult factual-book area','舊成人非小說區'],['now houses','now has','現設有'],['adult fiction','adult story books','成人小說'],['self-service machines','machines people can use themselves','自助機'],['whereas','The old enquiry desk','而'],['converted into a café','now a café','改為咖啡館']),
];
const structures=[
 f('The two plans illustrate how the City Library has been reorganised over the last two decades.','引言交代同一圖書館過去二十年的室內重組',[2,4,8],{formula:'The two plans illustrate how [場地] has been reorganised over the last two decades',meaning:'兩張圖比較中央圖書館二十年前與今天的平面佈局。',usage:'over the last two decades 是相對今日的二十年間，不是兩個不同圖書館。',parts:[link('The two plans illustrate how'),slot(' the Central Library','場地'),link(' has been reorganised over the last two decades.')]}),
 f('Overall, the town library has changed from a mainly book- and reading-based space into a more varied facility, with new areas for technology, events, lectures and refreshments.','概覽由藏書閱讀為主，轉成科技、活動、講座與餐飲並存',[0,3,7],{formula:'Overall, [場地] has changed from a mainly book- and reading-based space into a more varied facility, with new areas for technology, events, lectures and refreshments',meaning:'今日圖有電腦室、自助機、講故事活動、講座室、咖啡館；仍有書籍區。',usage:'more varied 指用途多元，不是說所有書都移走；參考書及成人／兒童小說仍有區域。',parts:[link('Overall,'),slot(' the library','場地'),link(' has changed from a mainly book- and reading-based space into a more varied facility, with new areas for technology, events, lectures and refreshments.')]}),
 f('Although the side entrance remains in the same position, the central lounge has disappeared and several services have been relocated or modernised.','把固定入口與消失的中央座位、新服務對照',[1,4,8],{formula:'Although [保留地標] remains in the same position, [消失區] has disappeared and several services have been relocated or modernised',meaning:'入口仍在底部中央；舊圖中央兩組桌椅今日不見，多項房間改用途。',usage:'入口未移動不表示內部沒有改變；觀察圖中央及左右房間的用途。',parts:[link('Although'),slot(' the entrance','保留地標'),link(' remains in the same position,'),slot(' the central seating','消失區'),link(' has disappeared and several services have been relocated or modernised.')]}),
 f('Twenty years ago, the middle of the community hall was occupied by tables and chairs, with rooms arranged around it.','先以中央桌椅作舊圖定位基準',[0,5,7],{formula:'Twenty years ago, the middle of [場地] was occupied by [中央設施], with rooms arranged around it',meaning:'舊圖中央有兩組桌椅，左、右及上、下房間圍繞中央。',usage:'中間的桌椅在今日圖已移除；不要把入口錯當成中央座位。',parts:[link('Twenty years ago, the middle of'),slot(' the library','場地'),link(' was occupied by'),slot(' tables and chairs','中央設施'),link(', with rooms arranged around it.')]}),
 f('On the left, there was a media room for films and games in the north-west corner, adult fiction books in the centre, and a reading room for newspapers and magazines near the entrance.','按左側由西北到入口的三個舊用途排序',[1,3,8],{formula:'On the left, there was a media room for [媒體] in the north-west corner, adult fiction books in the centre, and a reading room for newspapers and magazines near the entrance',meaning:'舊圖左上是 CDs／視頻／遊戲，中間是成人小說，左下入口附近是報章雜誌閱覽室。',usage:'三處都是舊圖左邊；右上舊兒童書區另在右側。',parts:[link('On the left, there was a media room for'),slot(' CDs, videos and computer games','媒體'),link(' in the north-west corner, adult fiction books in the centre, and a reading room for newspapers and magazines near the entrance.')]}),
 f('Today, this side has been fully reorganised: the former music and study sections contain children’s books, activity space and sofas, while the old reading room has become a computer room.','將左側舊媒體／小說區對應新兒童區，舊閱覽室對應電腦室',[0,4,8],{formula:'Today, this side has been fully reorganised: the former [舊兩區] contain [新用途組], while the old reading room has become a computer room',meaning:'今日左上／左中合為兒童小說、講故事及沙發；左下舊閱覽室變電腦室。',usage:'children’s fiction books 不是從舊圖同位置保留；舊兒童書區在右上，今日變講座室。',parts:[link('Today, this side has been fully reorganised: the former'),slot(' media and fiction sections','舊兩區'),link(' contain'),slot(' children’s fiction books, storytelling space and sofas','新用途組'),link(', while the old reading room has become a computer room.')]}),
 f('A section for large-print books has also been introduced.','補充今日新設於左側中部的參考書區',[1,4,8],{formula:'A section for [書類] has also been introduced',meaning:'今日圖左側中段新增 All reference books 區。',usage:'reference books 是參考書，不是舊圖左中成人小說；參考書區在今日左側。',parts:[link('A section for'),slot(' all reference books','書類'),link(' has also been introduced.')]}),
 f('On the right, the old staff office has been replaced by a lecture room.','交代右上原兒童書區變講座室',[1,4,6],{formula:'On the right, [舊用途] has been replaced by [新用途]',meaning:'舊圖右上 Children’s books 的位置今日是 Lecture room。',usage:'兒童小說今日移至左側，不可說圖書館完全沒有兒童書。',parts:[link('On the right,'),slot(' the old children’s books area','舊用途'),link(' has been replaced by'),slot(' a lecture room.','新用途')]}),
 f('The former study section now houses adult fiction, a help desk and self-service machines, whereas the old enquiry desk has been converted into a café.','右側兩處舊用途分別改為現今書籍／服務區與咖啡館',[0,4,7],{formula:'The former [舊中區] now houses [新中區用途], whereas the old enquiry desk has been converted into a café',meaning:'右中舊成人非小說區變成人小說、資訊服務台、自助機；右下舊詢問處變咖啡館。',usage:'information desk 在今日右中，café 在今日右下；兩者不是同一個設施。',parts:[link('The former'),slot(' adult non-fiction section','舊中區'),link(' now houses'),slot(' adult fiction, an information desk and self-service machines','新中區用途'),link(', whereas the old enquiry desk has been converted into a café.')]}),
];
const intro=[
 quiz('這兩張圖比較哪個範圍？',['同一中央圖書館二十年前與今天的室內佈局','兩座圖書館同一年的人數','二十年間借書量折線','圖書館外道路和停車場'],'兩圖標 Central Library 20 years ago／today，描繪室內空間。'),
 {type:'multi',prompt:'哪兩項最適合放進概覽？',detail:'選兩項，再按「確認」。',options:[
  '圖書館由以書與閱讀為主，變成兼有電腦、活動、講座和咖啡館',
  '入口仍在底部中央，但中央桌椅消失，多個服務區改位或改用途',
  '所有書籍都已從館內移走',
  '入口已從底部搬到北面',
 ],correct:[0,1],why:'概覽同時交代功能多元化與主要空間變化，避免把書籍區誤說成消失。'},
];
const route=[sequence('依範文次序，排好四段的室內地圖報告工作',[
 ['平面圖介紹','交代中央圖書館二十年前與今天。'],
 ['整體概覽','用途多元化；入口不變、中央桌椅移除，服務改位。'],
 ['左側變化','舊媒體／成人小說→兒童書與講故事；舊閱覽室→電腦室；新增參考書。'],
 ['右側變化','舊兒童書→講座室；舊成人非小說→成人小說、資訊及自助；舊詢問處→咖啡館。'],
],'先用入口與中央定位，再按左右兩區把舊用途對到新用途。')];
const evidence=[
 quiz('哪項在兩圖的位置相同？',['底部中央的入口','中央桌椅','右上兒童書區','右下詢問處'],'入口仍在底部中央；其餘用途變動。'),
 quiz('二十年前圖書館中央有甚麼？',['桌椅','咖啡館','自助服務機','講故事活動區'],'舊圖中間畫有兩組 Tables & chairs。'),
 quiz('舊圖左上與左下分別是甚麼？',['CDs／影片／遊戲媒體室；報章雜誌閱覽室','電腦室；咖啡館','講座室；酒店','兒童書區；資訊服務台'],'舊圖左上是媒體室，左下近入口是 reading room。'),
 quiz('舊圖左下閱覽室今日變成甚麼？',['電腦室','講座室','咖啡館','自助服務機'],'今日左下標 Computer room。'),
 quiz('今日左上和左中有哪些新用途？',['兒童小說、講故事活動和沙發','成人非小說與舊閱覽室','講座室與咖啡館','舊 CDs／影片區完全原樣'],'舊左側媒體與成人小說位置現為兒童書／講故事／沙發。'),
 quiz('舊右上兒童書區今日變成甚麼？',['講座室','電腦室','所有參考書區','入口'],'今日右上標 Lecture room。'),
 quiz('舊右中成人非小說區今日有甚麼？',['成人小說、資訊服務台和自助服務機','只有咖啡館','CDs 和影片','舊兒童書原樣'],'今日右中成人小說區旁有 information desk 與 self-service machines。'),
 quiz('舊右下詢問處今日變成甚麼？',['咖啡館','電腦室','講座室','入口'],'今日右下標 Café。'),
];
const logic=[
 sequence('先把舊圖按入口、中央、左右區定位',[
  ['入口與中央','入口在底部中央；舊中央有桌椅。'],
  ['左側','左上媒體，左中成人小說，左下報章雜誌閱覽室。'],
  ['右側','右上兒童書，右中成人非小說，右下詢問處。'],
  ['今日入口','仍在底部中央，可作前後圖的固定定位點。'],
 ],'不要只按設施名稱找位置；同一書類可能移到另一側。'),
 sequence('逐區把舊用途對應今日新用途',[
  ['左上／左中','媒體與成人小說區→兒童小說、講故事與沙發。'],
  ['左下／左中','閱覽室→電腦室；另有新參考書區。'],
  ['右上／右中','兒童書→講座室；成人非小說→成人小說、資訊台、自助機。'],
  ['右下／中央','詢問處→咖啡館；中央桌椅已移除。'],
 ],'同位置的舊新對照支撐「重組」；入口保留與內部變動可同時成立。'),
];
const transfers=[
 transfer('兩張圖顯示同一市立圖書館二十年前及今天的室內佈局。','哪句引言界定同地點與期間？',['兩張平面圖展示市立圖書館在過去二十年的室內重組。','兩圖比較兩間圖書館同一天的借書量。','圖表顯示二十年前的學生分數。','圖表解釋圖書館為何失去讀者。'],['同一建築、二十年、佈局變化均清楚。','不是兩間館。','圖中是空間用途。','沒有原因數據。'],[0],'原文引言比較 Central Library 二十年前與今日。'),
 transfer('舊館以書籍及安靜閱讀為主；今日增設電腦、講座、活動與咖啡，但仍有書。','哪句概括功能轉變而不說書籍消失？',['圖書館由以書與閱讀為主，轉成兼具科技、活動及餐飲的多功能空間。','館內所有書籍已完全撤走。','圖書館只增加借書櫃，其他無變。','電腦、講座和咖啡館二十年前已在原位。'],['用途變多，原有書籍功能仍有。','今日仍有參考書和小說。','新增用途多。','新用途屬今日。'],[1],'原文概覽書與閱讀為主的空間變成較多元的設施。'),
 transfer('入口位置不變；中央桌椅消失，多個服務區改位。','哪句同時說保留與重組？',['入口仍在原位，但中央座位已移除，服務區亦有搬遷與更新。','入口和所有桌椅都保持原樣。','入口搬到左上，中央設施不變。','館內只有入口有變。'],['固定入口與內部變化都保留。','中央桌椅消失。','入口未搬。','其他服務也改變。'],[2],'原文 entrance unchanged、central seating disappeared、services relocated or modernised。'),
 transfer('舊圖中央兩組桌椅，房間圍在四周。','哪句先建立舊圖的空間基準？',['二十年前中央設有桌椅，周邊排列不同房間。','二十年前中央是今日咖啡館。','所有房間都在建築外面。','中央桌椅今日仍完全原樣。'],['中央與周邊房間關係準確。','咖啡館屬今日右下。','房間都在室內。','今日桌椅已移除。'],[3],'原文舊圖中央桌椅、周邊為房間。'),
 transfer('舊圖左上媒體、左中成人小說、左下入口附近閱覽室。','哪句按左側由北到南排序？',['左側西北是媒體室，中間成人小說，入口旁是閱覽室。','左上是閱覽室，左下才是媒體室。','三區都在右側。','成人小說在舊圖右上。'],['三個舊用途與方位對應。','上下顛倒。','皆在左側。','舊成人小說在左中。'],[4],'原文舊圖左側由西北至入口是媒體、成人小說、閱覽室。'),
 transfer('今日左上／左中改兒童小說與講故事，舊左下閱覽室改電腦室。','哪句按舊位置交代兩種新用途？',['舊媒體與成人小說區現供兒童書及活動，舊閱覽室變電腦室。','舊閱覽室變講座室，媒體區變咖啡館。','舊左側所有用途均完全不變。','電腦室在舊圖已存在。'],['兩組舊新對應準確。','講座在右上、咖啡在右下。','用途有重組。','電腦室屬今日。'],[5],'原文左側舊媒體／小說區→兒童小說、故事、沙發；舊閱覽室→電腦室。'),
 transfer('今日圖左側中段新增 All reference books 區。','哪句精確交代新增書區？',['左側另設一個集中放所有參考書的區域。','右下舊詢問處改成參考書區。','參考書在舊圖左上已有相同區域。','參考書區就是今日咖啡館。'],['新增且方位正確。','右下變咖啡館。','舊圖未標此區。','兩用途不同。'],[6],'原文新增 all reference books 區，今日圖在左側。'),
 transfer('舊圖右上是兒童書；今日右上是講座室，兒童小說改在左側。','哪句不誤說兒童書完全消失？',['右側舊兒童書區變講座室，兒童書今日另在左側。','右上舊兒童書區今日仍完全原樣。','圖書館已沒有任何兒童書。','講座室今日建在左下入口旁。'],['同位置取代與書類搬遷都準確。','右上變講座室。','左側仍有兒童小說。','講座室在右上。'],[7],'原文右側舊兒童書區被講座室取代；左側今日有兒童小說。'),
 transfer('舊右中成人非小說區今日成人小說、資訊台及自助機；舊右下詢問處今日咖啡館。','哪句同時配準兩處？',['右中轉為成人小說與資訊／自助服務，右下詢問處改成咖啡館。','右中變咖啡館，右下成成人小說。','兩處都變成電腦室。','資訊台與咖啡館都在舊圖已存在。'],['兩個舊區各自的新用途和位置準確。','右中右下對調。','電腦室在左下。','今日才新增／改建。'],[8],'原文右中成人非小說→成人小說＋資訊台＋自助機；右下詢問處→咖啡館。'),
 transfer('某館入口仍在底部中央，但左側與右側各有房間改用途。','哪句避免由「入口不變」推論「全館不變」？',['入口保留原位，館內多個房間仍可同時重組。','入口不變證明所有房間必定原樣。','只要左側改變，右側就不能改變。','兩圖必定描述不同建築。'],['固定地標與其他區域變化並不矛盾。','不能由一處不變推出全館不變。','左右兩側可同時改。','入口位置幫助辨認同館。'],[2],'原文入口未變，但中央座位消失、服務搬遷或更新。'),
];
const balancedTransferOptions=[
 ['兩張圖展示同一市立圖書館二十年間的室內變化。','兩張平面圖比較兩間圖書館同一天的借書總量。','兩張平面圖展示二十年前的學生考試分數。','兩張平面圖解釋市立圖書館失去讀者的原因。'],
 ['圖書館從書籍閱讀為主，轉成兼具科技、活動及餐飲。','圖書館的全部書籍已撤走，只留下科技活動設施。','圖書館只新增借書櫃，其他用途與空間都不變。','電腦、講座及咖啡館在二十年前便已在原位。'],
 ['入口保留原位，中央桌椅撤走，多個服務區亦重組。','入口與中央所有桌椅都在原位，服務區也不變。','入口搬到左上，但中央桌椅及服務區保持不變。','館內只有入口位置改變，其餘區域完全一樣。'],
 ['舊圖中央有桌椅，周圍排列不同用途的房間。','舊圖中央是今日的咖啡館，周圍沒有房間。','舊圖所有房間都在建築外，中央只有走廊。','舊圖中央桌椅今日仍原樣保留，沒有搬遷。'],
 ['舊圖左上媒體、左中成人小說、左下入口旁閱覽室。','舊圖左上閱覽室、左中成人小說、左下媒體室。','舊圖右上媒體、右中成人小說、右下閱覽室。','舊圖成人小說在右上，左側只有媒體及閱覽室。'],
 ['舊媒體與小說區改兒童用途，舊閱覽室改電腦室。','舊閱覽室改講座室，舊媒體區則改成咖啡館。','舊圖左側所有書區與閱覽室今日仍完全原樣。','電腦室在舊圖已建成，今日只是搬到右側。'],
 ['今日左側新增集中放參考書的區域，並非舊圖設施。','今日右下詢問處已改為新參考書區，非咖啡館。','參考書區在舊圖左上便已存在，今日沒有新增。','今日新增的參考書區其實就是右下咖啡館。'],
 ['右上舊兒童書區改講座室，兒童書今日搬到左側。','右上舊兒童書區今日仍原樣，講座室設在左側。','圖書館今日已完全沒有任何兒童書可以借閱。','講座室今日建在左下入口旁，並非右上位置。'],
 ['右中改成人小說及資訊自助區，右下改咖啡館。','右中改咖啡館及資訊自助區，右下改成人小說。','右中及右下都改成電腦室，其他服務區撤走。','資訊台及咖啡館在舊圖已建成，今日未有改動。'],
 ['入口仍在原位，但左右兩側的房間可同時改用途。','入口仍在原位，因此所有房間也必定完全不變。','左側房間改用途時，右側房間便無法同時改變。','兩圖入口雖同在底部中央，卻必定是不同建築。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-maps:3',meta:{topic:'中央圖書館二十年前與現今的室內重組',summary:'固定入口定位；中央桌椅消失。按左側與右側逐處對照舊新用途，尤其舊兒童書右上變講座室、兒童小說今日轉左側。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
