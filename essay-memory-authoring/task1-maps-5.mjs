// Task 1 Maps 5: Southwest Airport now and planned next-year redevelopment.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清現在與明年重建後的規劃，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two plans show Southwest Airport now and how it is expected to look after changes next year.',
 'Overall, the airport is planned to become much bigger, especially beyond the terminal. The present straight pier with eight gates will become a Y-shaped area with eighteen gates and a sky train.',
 'The building will also have more things for passengers to use. But departures will still be on one side and arrivals on the other.',
 'Now, the airport has a small building. Departures are on the left and arrivals are on the right.',
 'People leaving the airport go through security and passport control. Then they walk to eight gates around a straight pier.',
 'On the departures side, there are only check-in desks and a café. On the arrivals side, there are passport control and customs.',
 'After the planned changes, the departures hall will have a place to leave bags, check-in desks and a café.',
 'New shops will be after security, on the way to the bigger gate area.',
 'Instead of walking along the old pier, passengers will use a sky train on the main route. It will split into two arms and have eighteen gates.',
 'The arrivals side will also get a café, an ATM and car rental near the exit.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['current layout','now','現時佈局'],['expected to look','expected to look','預計樣貌'],['redevelopment','changes','重建']),
 v(['substantially enlarged','much bigger','大幅擴大'],['especially airside','especially beyond the terminal','尤其空側'],['existing pier','present straight pier','現有登機廊'],['replaced by','become','被取代'],['concourse','area','候機大廳'],['containing','with','設有']),
 v(['terminal','building','航站樓'],['offer more passenger facilities','have more things for passengers to use','更多乘客服務'],['although','But','不過'],['basic division','on one side and arrivals on the other','離境入境分區'],['remain','still','保留']),
 v(['At present','Now','目前'],['small terminal','small building','小型航站樓'],['departures on the left','Departures are on the left','離境在左'],['arrivals on the right','arrivals are on the right','入境在右']),
 v(['Departing passengers','People leaving the airport','離境旅客'],['pass through','go through','經過'],['before using a walkway','Then they walk','之後步行'],['arranged around','around','圍繞'],['rectangular pier','straight pier','矩形登機廊']),
 v(['departures area','departures side','離境區'],['contains only','there are only','只設有'],['check-in facilities','check-in desks','辦理登機手續'],['while','On the arrivals side','而'],['limited to','there are','只包括']),
 v(['After redevelopment','After the planned changes','重建後'],['bag drop','place to leave bags','行李托運'],['check-in area','check-in desks','辦理登機手續區'],['include','have','設有']),
 v(['Shops','New shops','商店'],['added beyond security','after security','安檢後新增'],['leading to','on the way to','通往'],['enlarged concourse','bigger gate area','擴大候機大廳']),
 v(['Instead of a simple walkway','Instead of walking along the old pier','取代舊步道'],['sky train','sky train','空中列車'],['along the main pier','on the main route','沿主登機廊'],['branch into two arms','split into two arms','分成兩支線'],['increase the number of gates','have','增加閘口數']),
 v(['arrivals side','arrivals side','入境側'],['gain','get','新增'],['car-hire facilities','car rental','租車設施'],['near the exit','near the exit','出口附近']),
];
const structures=[
 f('The two plans illustrate the current layout of North Airport and the way it is expected to look after redevelopment next year.','引言分清現時佈局與明年重建後的預期樣貌',[2,4,8],{formula:'The two plans illustrate the current layout of [機場] and the way it is expected to look after redevelopment next year',meaning:'兩圖比較 Southwest Airport 現況與明年重建後的規劃。',usage:'next year 是未來；新閘口、空中列車、商店均不可用已完成語氣。',parts:[link('The two plans illustrate the current layout of'),slot(' Southwest Airport','機場'),link(' and the way it is expected to look after redevelopment next year.')]}),
 f('Overall, the airport will be substantially enlarged, especially airside, where the existing pier with six gates will be replaced by a Y-shaped concourse containing sixteen gates and a sky train.','概覽空側形狀與閘口數的主要擴建',[0,4,8],{formula:'Overall, the airport will be substantially enlarged, especially airside, where the existing pier with [舊閘口] will be replaced by a Y-shaped concourse containing [新閘口] and a sky train',meaning:'目前直形登機廊有 8 閘，規劃 Y 形大廳有 18 閘及空中列車，增加 10 閘。',usage:'gate 1–8 對現在、1–18 對重建後；sky train 也是未來新設。',parts:[link('Overall, the airport will be substantially enlarged, especially airside, where the existing pier with'),slot(' eight gates','舊閘口'),link(' will be replaced by a Y-shaped concourse containing'),slot(' eighteen gates','新閘口'),link(' and a sky train.')]}),
 f('The terminal will also offer more passenger facilities, although its basic division into domestic and international areas will remain.','指出新服務增加，但離境左、入境右的基本分區保留',[1,5,9],{formula:'The terminal will also offer more passenger facilities, although its basic division into [分區] will remain.',meaning:'規劃增加行李托運、商店、入境咖啡／ATM／租車，離境仍在左、入境仍在右。',usage:'地圖顯示新增設施，但原有的主要分區仍保留時。',parts:[link('The terminal will also offer more passenger facilities, although its basic division into'),slot(' departures and arrivals','分區'),link(' will remain.')]}),
 f('At present, the airport has a small terminal, with ticket desks on the left and waiting seats on the right.','先以左右定位現在航站樓的兩區',[0,5,8],{formula:'At present, the airport has a small terminal, with [左區] on the left and [右區] on the right',meaning:'現在航站樓左離境、右入境。',usage:'左右以平面圖頁面判斷；兩時點分區方向保持不變。',parts:[link('At present, the airport has a small terminal, with'),slot(' departures','左區'),link(' on the left and'),slot(' arrivals','右區'),link(' on the right.')]}),
 f('Departing passengers pass through security and passport control before using a walkway to reach six gates arranged around a rectangular pier.','按旅客路徑描述現時安檢、護照檢查、步道與登機閘',[0,3,8],{formula:'Departing passengers pass through security and passport control before using a walkway to reach [閘口數] arranged around a rectangular pier',meaning:'現在離境旅客通過安檢與護照檢查，再沿步道到矩形登機廊的 8 閘。',usage:'步道及 8 閘屬現況；未來主登機廊有空中列車、18 閘。',parts:[link('Departing passengers pass through security and passport control before using a walkway to reach'),slot(' eight gates','閘口數'),link(' arranged around a rectangular pier.')]}),
 f('The departures area contains only a ticket desk and a café, while arrivals are limited to passport control and luggage collection.','對照現況離境與入境各自僅有的設施',[1,4,8],{formula:'The departures area contains only [離境設施], while arrivals are limited to [入境設施]',meaning:'現在離境區有辦理登機及咖啡店；入境區有護照檢查及海關，尚無 ATM／租車。',usage:'咖啡店現時在離境側，未來入境側亦會加一間；不能把現有入境說成已有咖啡。',parts:[link('The departures area contains only'),slot(' check-in facilities and a café','離境設施'),link(', while arrivals are limited to'),slot(' passport control and customs.','入境設施')]}),
 f('After redevelopment, the departures hall will include a bag drop, ticket desk and café.','交代未來離境新增行李托運，並保留登機和咖啡服務',[0,3,9],{formula:'After redevelopment, the departures hall will include [三項設施]',meaning:'未來離境大堂有 bag drop、check-in 和 café；bag drop 是新增。',usage:'此句只述離境大堂；安檢後的商店及空中列車另在空側。',parts:[link('After redevelopment, the departures hall will include'),slot(' a bag drop, check-in area and café.','三項設施')]}),
 f('Restaurants will be added beyond security, leading to the enlarged concourse.','定位未來商店在安檢後而非入口前',[1,4,8],{formula:'[設施] will be added beyond security, leading to the enlarged concourse',meaning:'規劃商店在 security 後面、往 Y 形候機大廳的連接處。',usage:'beyond security 是旅客通過安檢後的區域；不是入境出口附近。',parts:[slot('Shops','設施'),link(' will be added beyond security, leading to the enlarged concourse.')]}),
 f('Instead of a simple walkway, passengers will use a sky train along the main pier, which will branch into two arms and increase the number of gates to sixteen.','說明交通方式取代、Y 形雙支線及閘口增加',[0,5,7],{formula:'Instead of a simple walkway, passengers will use a sky train along the main pier, which will branch into two arms and increase the number of gates to [新數量]',meaning:'舊步道變空中列車，主廊分兩臂成 Y 形，閘口由 8 增至 18。',usage:'which 指主登機廊分支，而不是列車本身一分為二；十八是新總數非增加十八。',parts:[link('Instead of a simple walkway, passengers will use a sky train along the main pier, which will branch into two arms and increase the number of gates to'),slot(' eighteen.','新數量')]}),
 f('The arrivals side will also gain a café, an ATM and bicycle-hire facilities near the exit.','交代入境出口附近三項未來新增服務',[0,4,7],{formula:'The arrivals side will also gain [三服務] near the exit',meaning:'未來入境側出口旁有 café、ATM、car hire。',usage:'圖例 car hire 是租車；不是現在已有，也不是離境側的 bag drop。',parts:[link('The arrivals side will also gain'),slot(' a café, an ATM and car-hire facilities','三服務'),link(' near the exit.')]}),
];
const intro=[
 quiz('兩張圖的時點如何區分？',['現在與明年重建後的預期規劃','兩個現已完工機場','2000 年與 2010 年實際客量','上午與下午的航班'],'題目說 now 與 after redevelopment next year；新設施須用未來語氣。'),
 {type:'multi',prompt:'哪兩項最適合放入概覽？',detail:'選兩項，再按「確認」。',options:[
  '空側將由直形 8 閘步道擴建為 Y 形 18 閘及空中列車',
  '乘客服務將增加，但離境在左、入境在右的基本分區保留',
  '目前已設有 18 閘和空中列車',
  '入境與離境區會完全對調',
 ],correct:[0,1],why:'概覽以空側擴建和服務增加為主，同時點出保留的左右分區。'},
];
const route=[sequence('依範文次序，排好四段的機場平面圖報告工作',[
 ['平面圖介紹','交代 Southwest Airport 現在與明年重建後的預期樣貌。'],
 ['整體概覽','空側 8→18 閘、步道→空中列車及 Y 形；服務增加但左右分區保留。'],
 ['現時配置','左離境／右入境；安檢護照後步行至 8 閘，兩側設施有限。'],
 ['規劃配置','離境行李托運、安檢後商店、Y 形 18 閘與空中列車；入境咖啡／ATM／租車。'],
],'按旅客路徑與左右分區對照，不把未來設施寫成現有。')];
const evidence=[
 quiz('目前與重建後閘口總數分別是多少？',['8 與 18，增加 10 個','18 與 8，減少 10 個','8 與 16，增加 8 個','兩圖都 18'],'目前 1–8；重建後 1–18，差 10 個。'),
 quiz('登機廊形狀將如何改變？',['現時矩形直廊→未來 Y 形兩支線','現時 Y 形→未來矩形','兩圖形狀完全相同','未來只有圓形單廊'],'現時短矩形廊，規劃 Y 形主廊分左右兩臂。'),
 quiz('目前離境和入境在哪邊？',['離境左、入境右，未來仍保持基本分區','離境右、入境左，未來互換','兩者都在左邊','兩者都在空側北端'],'兩張圖底部左右標 Departures／Arrivals。'),
 quiz('現時離境旅客如何到達閘口？',['安檢及護照檢查後走步道至 8 閘','先乘空中列車至 18 閘','先在入境側租車','直接由海關走到酒店'],'現時圖示 walkway 與 1–8 閘。'),
 quiz('未來離境大堂新增哪項服務？',['行李托運 bag drop','入境側 car hire','已存在的海關','現有 8 閘步道'],'未來 Departures 一側多 B 圖標 bag drop。'),
 quiz('未來商店位於旅客路徑哪裏？',['通過安檢後、往擴大候機廊之前','入境出口汽車租賃旁','現時 8 閘矩形廊的盡頭','航站樓外主路對面'],'Shops 標在 security 後、Y 形廊前的連接區。'),
 quiz('未來入境出口附近新增哪些服務？',['咖啡店、ATM、租車','行李托運、登機手續、18 閘','安檢、空中列車、商店','只有海關，沒有新增'],'右側 Arrivals 新增 café、ATM、car hire 三圖標。'),
];
const logic=[
 sequence('沿現時離境旅客路徑讀圖',[
  ['航站樓','左離境有 check-in 和 café；右入境有 passport control、customs。'],
  ['出發流程','離境側經 security、passport control。'],
  ['通往登機廊','步道接短矩形廊。'],
  ['登機閘口','現時總共 8 閘，1–8 分布在直廊兩側。'],
 ],'空側與航站樓內部要分開定位，現時無 sky train。'),
 sequence('沿未來旅客路徑讀新增與保留',[
  ['離境大堂','check-in、café 保留，增 bag drop。'],
  ['安檢之後','增商店，往 Y 形候機廊。'],
  ['空側','步道變 sky train，主廊分兩臂，閘口增至 18。'],
  ['入境側','原 passport control／customs 仍在，出口附近增 café、ATM、car hire。'],
 ],'凡圖上標 after development 的改變均用規劃／未來語氣；左右分區仍在。'),
];
const transfers=[
 transfer('一座機場兩圖展示現在與明年重建後的規劃。','哪句引言分清現在與預期？',['平面圖展示機場現況及明年重建後預計的樣貌。','平面圖展示兩座已完工機場。','圖表比較兩年實際客運量。','圖表解釋航空公司搬遷原因。'],['同一機場、現在與未來規劃清楚。','不是兩座機場。','圖中是佈局。','沒有原因資料。'],[0],'原文引言 current layout 對 expected after redevelopment next year。'),
 transfer('某機場現有 6 閘直廊，規劃 16 閘 Y 形廊及空中列車。','哪句同時說形狀、交通及新總數？',['機場空側將擴大，6 閘直廊改為含 16 閘與空中列車的 Y 形候機廊。','現時已設 16 閘與空中列車。','規劃會減少至 6 閘。','Y 形廊將被拆回直形廊。'],['舊新閘口、形狀與未來語氣都準確。','16 閘屬規劃。','新總數較高。','方向相反。'],[1],'原文現有 8 閘矩形廊將改 Y 形 18 閘並增 sky train。'),
 transfer('規劃增行李托運、商店和 ATM，但離境左／入境右保持。','哪句保留既有分區與新服務？',['服務會增加，不過離境與入境的基本左右分區仍在。','入境與離境將完全對調。','所有現有服務都會消失。','新服務只在空側外的停車場。'],['服務增加不等於分區對調。','左右仍維持。','原有服務多項仍在。','設施在航站樓。'],[2],'原文 terminal 服務增多，departures／arrivals 分區保留。'),
 transfer('現況圖下方左離境、右入境，航站樓較小。','哪句先建立左右方位？',['目前小航站樓左側為離境，右側為入境。','目前左側入境、右側離境。','兩側都只辦理入境。','現時航站樓已是 Y 形 18 閘。'],['左右及現時規模均準確。','左右顛倒。','兩側用途不同。','Y 形屬未來空側。'],[3],'原文 At present 左離境、右入境。'),
 transfer('現時離境者先安檢和護照檢查，再步行至 6 個閘口。','哪句按正確先後描述路徑？',['離境者經安檢與護照檢查，然後沿步道到 6 閘。','離境者先乘未來空中列車，再安檢。','離境者從入境海關直接到登機閘。','所有閘口都在航站樓出口外的停車場。'],['程序先後及現況步道都準確。','空中列車尚未建。','離境不走入境海關。','閘口在登機廊。'],[4],'原文目前 security／passport control 後沿 walkway 到矩形廊 8 閘。'),
 transfer('現況離境只有 check-in 和 café；入境只有 passport control 和 customs。','哪句不把未來 ATM 倒填到現況？',['現時離境區有登機手續和咖啡，入境區則有護照檢查和海關。','現時入境區已設 ATM 與租車。','現時離境區已設 bag drop。','兩側設施完全相同。'],['兩側現有服務按圖配準。','ATM／租車屬未來。','bag drop 屬未來。','服務不同。'],[5],'原文現況離境 check-in／café，入境 passport control／customs。'),
 transfer('重建後離境大堂將有 bag drop、check-in 和 café。','哪句保持未來語氣與三服務？',['重建後離境大堂將有行李托運、登機手續區和咖啡店。','離境大堂目前已有 bag drop。','三項全部設在入境出口。','重建會取消 check-in 和 café。'],['bag drop 新增、其餘服務保留且在離境側。','bag drop 屬規劃。','入境另有三項。','check-in／café 仍在。'],[6],'原文未來 departures hall 增 bag drop 並有 check-in、café。'),
 transfer('新商店在 security 之後、擴大候機廊之前。','哪句按旅客行進順序定位商店？',['商店將設在安檢後、通往擴大候機廊的路上。','商店將設在入境出口外。','商店現時已在 8 閘廊頂端。','商店將取代所有安檢通道。'],['安檢後而廊前的相對位置準確。','入境出口另有 ATM 等。','商店屬未來。','安檢仍在。'],[7],'原文 Shops added beyond security, leading to enlarged concourse。'),
 transfer('規劃由 6 閘直廊改成 16 閘 Y 形，主廊設空中列車。','哪句不把新總數誤作增加量？',['旅客將乘空中列車沿主廊前進；主廊分兩臂，閘口總數增至 16。','閘口將額外增加 16 個，總數變 22。','空中列車在現況已存在。','主廊將維持短直形且只 6 閘。'],['16 是新總數；6→16 的增量為 10。','把總數誤作增量。','列車屬規劃。','廊形與閘口會改變。'],[8],'原文 8→18 閘，sky train 沿主廊，主廊分兩臂。'),
 transfer('未來入境出口旁新增咖啡店、ATM 和汽車租賃。','哪句設施與方位都配對？',['入境側出口附近將增加咖啡店、ATM 及租車。','三項都位於離境安檢後商店區。','三項目前都已在入境側。','未來入境側只保留海關，沒有新服務。'],['新三服務及出口方位準確。','屬入境側出口。','目前未有這三項。','規劃增設。'],[9],'原文 arrivals side near exit 增 café／ATM／car hire。'),
];
const balancedTransferOptions=[
 ['平面圖比較同一機場現況與明年重建後預計的佈局。','平面圖比較兩座機場目前都已完工的候機設施。','平面圖比較機場兩個年份的實際客運人數變化。','平面圖解釋航空公司明年搬離機場的具體原因。'],
 ['機場將由6閘直廊改為16閘Y形廊，並增空中列車。','機場目前已有16閘Y形廊，並設空中列車。','機場計劃把16個閘口減至6個，取消列車。','機場計劃把Y形廊拆成直廊，只保留6閘。'],
 ['新服務會增加，但離境在左、入境在右的分區仍在。','離境與入境分區會完全對調，新增服務也消失。','所有現有服務都會撤走，離境區不再設安檢。','新服務只會設於航站樓外面的停車場之中。'],
 ['目前小航站樓左邊是離境區，右邊是入境區。','目前小航站樓左邊是入境區，右邊是離境區。','目前航站樓左右兩邊都只辦理入境手續。','目前航站樓已設Y形候機廊及18個閘口。'],
 ['離境者先過安檢及護照檢查，再步行到6個閘口。','離境者先乘未來空中列車，再通過安檢。','離境者先到入境海關，才可前往登機廊。','離境者在停車場辦登機，閘口都在樓外。'],
 ['現時離境有登機手續與咖啡，入境有護照及海關。','現時入境一側已有ATM、租車、護照檢查和海關。','現時離境已有行李托運，咖啡店反而在入境。','現時離境和入境兩側的服務設施完全相同。'],
 ['重建後離境區將設行李托運、登機手續及咖啡店。','離境區目前已有行李托運、登機手續及咖啡店。','三項新服務全部將設在入境出口，不在離境區。','重建後會取消登機手續及咖啡店，只留下托運。'],
 ['商店擬設在安檢之後、擴大候機廊之前的路上。','商店擬設在入境出口之外、與候機廊分開。','商店目前已在6閘候機廊的最頂端開業。','商店擬取代全部安檢通道，不再設安全檢查。'],
 ['空中列車將沿主廊行駛，Y形兩臂合計共16閘。','閘口將另外增加16個，新總數變成22閘。','空中列車目前已營運，新圖不會增設列車。','主廊將維持短直形，閘口仍然只有6個。'],
 ['入境出口附近將增咖啡店、ATM與租車服務。','三項服務都將設於離境安檢後的商店區。','三項服務目前都已設在入境出口附近。','未來入境區只會保留海關，不會新增服務。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-maps:5',meta:{topic:'Southwest Airport 現況與明年重建後規劃',summary:'嚴格區分現況與預期；左離境右入境不變，空側由 8 閘短廊增至 Y 形 18 閘與空中列車，並按旅客路徑定位新服務。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
