// Task 1 Maps 4: Norbiton industrial area now and proposed redevelopment.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清目前與擬議規劃，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two maps show the industrial area in Norbiton now and the changes planned for it.',
 'Overall, the factory area is planned to become a neighbourhood with homes and public services.',
 'More roads are also planned, especially a road across the river to the north and a better link south to the main road. The river and main road running east to west will mostly stay where they are.',
 'Now, the area has a roundabout south of the river at its centre.',
 'A road goes east from this roundabout. Several factories stand on both sides, and one more is at the far eastern end.',
 'More factories are just north and west of the roundabout. A short road joins it to the main road running east to west.',
 'The town is to the west.',
 'Under the plan, every factory will go, and homes will take the place of most of them.',
 'New homes are planned west of the roundabout, beside the eastern road and north of the river after a bridge is built.',
 'Another roundabout is planned on the road that leads south to the main road.',
 'The plan also adds shops to the southwest, a medical centre to the southeast, a playground near the eastern road and a school at the eastern end.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['present industrial area','industrial area in Norbiton now','現有工業區'],['proposed redevelopment','changes planned','擬議重建']),
 v(['set to be transformed','planned to become','計劃轉變'],['factory complex','factory area','工廠區'],['residential district','neighbourhood with homes','住宅區'],['public amenities','public services','公共設施']),
 v(['road network','roads','道路網'],['expanded','More','擴展'],['northwards across the river','across the river to the north','向北跨河'],['southwards to the main road','south to the main road','向南接主路'],['largely remain in place','mostly stay where they are','大致保留原位']),
 v(['Currently','Now','目前'],['site','area','地點'],['centred on','at its centre','以……為中心'],['south of the river','south of the river','河以南']),
 v(['junction','roundabout','路口／迴旋處'],['one road runs east','A road goes east','道路向東'],['several factories','Several factories','多間工廠'],['on both sides','on both sides','兩側'],['far end','far eastern end','最東端']),
 v(['Other factories','More factories','其他工廠'],['stand immediately north and west','just north and west','位於正北和西面'],['short road links','short road joins','短路連接'],['main east–west road','main road running east to west','東西向主路']),
 v(['lies to the west','is to the west','位於西側'],['town','town','城鎮']),
 v(['future plan','plan','未來規劃'],['all factories','every factory','全部工廠'],['removed','go','移除'],['replaced mainly by housing','homes will take the place of most of them','主要由住宅取代']),
 v(['Homes will be added','New homes are planned','增建住宅'],['along the eastern road','beside the eastern road','沿東面道路'],['after a bridge is built','after a bridge is built','建橋後'],['north of the river','north of the river','河以北']),
 v(['second roundabout','Another roundabout','第二個迴旋處'],['constructed','planned','計劃興建'],['southern access road','road that leads south','南面通道']),
 v(['introduced','plan also adds','新增'],['southern','southwest','南部'],['eastern','eastern end','東部'],['northeastern','near the eastern road','東北部']),
];
const structures=[
 f('The two maps compare the present industrial area in Town A with the proposed redevelopment of the site.','引言分清目前工業區與尚未落實的重建規劃',[2,4,8],{formula:'The two maps compare the present industrial area in [地點] with the proposed redevelopment of the site',meaning:'兩圖對照 Norbiton 工業區現在與未來擬議的住宅化方案。',usage:'proposed 表示規劃，不能用已完成語氣寫新住宅、橋或學校。',parts:[link('The two maps compare the present industrial area in'),slot(' Norbiton','地點'),link(' with the proposed redevelopment of the site.')]}),
 f('Overall, the area is set to be transformed from a derelict factory complex into a new residential district with public amenities.','概覽由工廠轉住宅與公共服務的用途轉換',[0,4,7],{formula:'Overall, the area is set to be transformed from a [原用途] into a [新用途]',meaning:'擬拆全部工廠，以住宅為主，加商店、醫療、遊樂場與學校。',usage:'要概括地圖中從原用途到規劃新用途的主要轉變時。',parts:[link('Overall, the area is set to be transformed from a'),slot(' factory complex','原用途'),link(' into a'),slot(' residential district with public amenities.','新用途')]}),
 f('The road network will also be expanded, especially northwards across the canal and southwards to the ring road, while the canal and the main east–west road will largely remain in place.','概覽同時寫新跨河連接和保留的固定地標',[0,5,8],{formula:'The road network will also be expanded, especially northwards across [障礙] and southwards to [南面連接], while [保留地標] will largely remain in place',meaning:'北向新橋越河，南面通道加第二迴旋處；河與東西向主路大致保留。',usage:'橋在未來圖才出現；主要東西向道路與河都仍可作前後定位。',parts:[link('The road network will also be expanded, especially northwards across'),slot(' the river','障礙'),link(' and southwards to'),slot(' the main road','南面連接'),link(', while'),slot(' the river and the main east–west road','保留地標'),link(' will largely remain in place.')]}),
 f('Currently, the site is centred on a roundabout south of the canal.','先用現有迴旋處與河的相對位置定位',[1,5,9],{formula:'Currently, the site is centred on a roundabout south of [水道]',meaning:'現有主迴旋處位於河以南、主路以北的工業區中央。',usage:'這個現有迴旋處在未來圖仍在；另增的第二個在南面主路處。',parts:[link('Currently, the site is centred on a roundabout south of'),slot(' the river.','水道')]}),
 f('From this junction, one road runs east, with several warehouses on both sides and another at its far end.','從迴旋處沿東向道路定位兩側及最東端建築',[0,3,8],{formula:'From this junction, one road runs east, with several [建築] on both sides and another at its far end',meaning:'現有迴旋處往東的路兩邊有多間工廠，最東端另有一間。',usage:'此句描述目前工廠，不可把未來圖的學校或遊樂場寫進去。',parts:[link('From this junction, one road runs east, with several'),slot(' factories','建築'),link(' on both sides and another at its far end.')]}),
 f('Other warehouses stand immediately north and west of the roundabout, and a short road links the junction to the main east–west road.','補全迴旋處北西工廠和向南短路的位置',[0,4,8],{formula:'Other [建築] stand immediately north and west of the roundabout, and a short road links the junction to the main east–west road',meaning:'現有迴旋處正北及西邊有工廠；向南短路接東西向主路。',usage:'不能把正北工廠誤作河對岸；它仍在河以南。',parts:[link('Other'),slot(' factories','建築'),link(' stand immediately north and west of the roundabout, and a short road links the junction to the main east–west road.')]}),
 f('The station lies to the west.','用簡短方位句定出城鎮相對工業區位置',[1,4,9],{formula:'[地標] lies to the west',meaning:'Town 標在工業區及迴旋處西側。',usage:'west 依圖右上羅盤判斷；不是主路的東端。',parts:[slot('The town','地標'),link(' lies to the west.')]}),
 f('In the future plan, all warehouses will be removed and replaced mainly by housing.','明確指出全部舊工廠移除，主要用途改住宅',[0,3,6],{formula:'In the future plan, all [舊建築] will be removed and replaced mainly by [新用途]',meaning:'未來圖全部工廠符號消失，多個住宅方塊取而代之。',usage:'mainly by housing 不是每個工廠原址都只變住宅；還有商店、醫療等公共設施。',parts:[link('In the future plan, all'),slot(' factories','舊建築'),link(' will be removed and replaced mainly by'),slot(' housing.','新用途')]}),
 f('Homes will be added west of the central square, along the eastern street and, after a bridge is built, north of the canal.','把三片新住宅位置與跨河建橋的前提逐一配準',[0,4,7],{formula:'Homes will be added west of [中央地標], along [東面通道] and, after a bridge is built, north of [河道]',meaning:'住宅計劃在迴旋處西側、東面道路旁及河以北；跨河地塊須經新橋連接。',usage:'河以北是未來新住宅；今日圖北面標 Farmland，尚無橋。',parts:[link('Homes will be added west of'),slot(' the roundabout','中央地標'),link(', along'),slot(' the eastern road','東面通道'),link(' and, after a bridge is built, north of'),slot(' the river.','河道')]}),
 f('A second roundabout will be constructed on the northern access road.','指出新增第二迴旋處在既有主迴旋處南面的接入路',[0,5,8],{formula:'A second roundabout will be constructed on [位置]',meaning:'未來新迴旋處在南面接東西向主路的地方；原有中央迴旋處保留。',usage:'second 表示兩個迴旋處；不能說原中央迴旋處移到南面。',parts:[link('A second roundabout will be constructed on'),slot(' the southern access road.','位置')]}),
 f('Shops, a health centre, a playground and a school will also be introduced in the southern, eastern and northeastern parts of the site.','概覽多項新公共設施，按圖核對各自方位',[0,4,8],{formula:'[四新設施] will also be introduced in the southern, eastern and northeastern parts of the site',meaning:'商店在主迴旋處西南、醫療中心東南；遊樂場在東路北側，學校在最東端。',usage:'原文合併三個區域不逐一配位；講解時應回圖把四設施各自定位，不臆造額外設施。',parts:[slot('Shops, a medical centre, a playground and a school','四新設施'),link(' will also be introduced in the southern, eastern and northeastern parts of the site.')]}),
];
const intro=[
 quiz('第二張地圖的時間性質是甚麼？',['未來擬議規劃，尚未表示已落實','目前已完成的住宅區','另一城市現有工業區','過去 1950 年的工廠佈局'],'圖題 Planned future development；回答用 will／planned／proposed。'),
 {type:'multi',prompt:'哪兩項最適合放入整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '所有工廠擬移除，區域改為以住宅和公共設施為主',
  '道路擬向北跨河並改善南面連接；河與主要東西向道路大致保留',
  '今日已有學校、遊樂場及跨河橋',
  '未來圖的河流及主路都被拆除',
 ],correct:[0,1],why:'概覽分清用途轉換、交通擴展與保留的地標；所有新設施都屬計劃。'},
];
const route=[sequence('依範文次序，排好四段的規劃地圖報告工作',[
 ['地圖介紹','交代 Norbiton 現有工業區與擬議重建。'],
 ['整體概覽','工廠區計劃轉住宅及公共設施，道路向北跨河與南面擴展，河和主路保留。'],
 ['目前佈局','河以南中央迴旋處；東路兩側與末端工廠、北西工廠、南接主路、城鎮在西。'],
 ['未來規劃','工廠拆除；西、東、河以北住宅；第二迴旋處；商店醫療遊樂場學校。'],
],'先以現有迴旋處、河與主路定位，再用擬議語氣描述每項新增。')];
const evidence=[
 quiz('目前主要迴旋處在哪裏？',['河以南、東西向主路以北','河以北農田中央','主路最東端','城鎮西邊'],'現有圖中央迴旋處在河與底部主路之間。'),
 quiz('目前工廠集中在哪些位置？',['迴旋處北西及東向道路兩側和最東端','河以北整片農田','主路南側全部住宅','已建學校周圍'],'工廠斜線符號在中央迴旋處附近及東路旁。'),
 quiz('城鎮相對工業區在哪個方向？',['西面','東面','北面河對岸','南面主路以外'],'目前與未來圖的 Town 都標在左側。'),
 quiz('未來圖的河以北增加甚麼？',['跨河道路／橋及住宅','原有工廠群','新的大型工業碼頭','第二個城鎮'],'新路自中央迴旋處向北跨河，北岸有住宅。'),
 quiz('未來第二迴旋處在哪裏？',['南面接東西向主路的通道上','河以北住宅盡頭','東面學校裏','原中央迴旋處完全相同位置'],'底部主路與南面接入路交接處增一個小迴旋處。'),
 quiz('未來商店與醫療中心相對中央迴旋處在哪裏？',['商店西南，醫療中心東南','商店東北，醫療中心西北','兩者都在河以北','兩者都在東端學校裏'],'圖中 Shops 位於中心左下，Medical centre 位於中心右下。'),
 quiz('未來遊樂場與學校在哪裏？',['遊樂場在東路北側，學校在道路最東端','兩者都在河以北','遊樂場在南面主路上，學校在城鎮西','兩者在今日圖已存在'],'未來圖東路上方是 Playground，最東端是 School。'),
];
const logic=[
 sequence('先用三個固定地標讀目前地圖',[
  ['河流','圖上部橫過工業區北側，北面為農田。'],
  ['中央迴旋處','在河以南，東向路與南向接入路的起點。'],
  ['東西向主路','在圖下部；城鎮標在工業區西側。'],
  ['現有工廠','迴旋處北西與東路兩側及末端均有斜線工廠符號。'],
 ],'現有圖不含住宅、學校或跨河橋；先辨認現況再寫規劃。'),
 sequence('把擬議建設逐項安到正確位置',[
  ['住宅與舊廠','所有工廠擬拆；住宅分在西側、東路沿線及橋對岸北側。'],
  ['新交通','中央迴旋處保留，向北增跨河連接；南面主路交匯處增第二迴旋處。'],
  ['西南／東南','商店在中心西南，醫療中心在中心東南。'],
  ['東面','遊樂場在東路北側，學校在最東端；河及主路仍在原處。'],
 ],'所有未來設施用 planned／will；河與主路大致保留，不能誤說被移走。'),
];
const transfers=[
 transfer('兩圖顯示一處現有工業區及尚未實施的未來重建方案。','哪句引言分清現況與規劃？',['兩張地圖比較現有工業區與該地點擬議的未來重建。','兩張地圖顯示兩個已完工住宅區。','兩圖比較工廠的年度產量。','兩圖解釋重建成本上升的原因。'],['現在與擬議未來兩種時間狀態清楚。','重建尚未表示完成。','地圖是佈局。','沒有成本原因。'],[0],'原文引言 present industrial area 對 proposed redevelopment。'),
 transfer('規劃拆掉全部舊廠，以住宅和公共設施為主。','哪句概覽保持未來語氣？',['該區計劃由工廠群轉成設公共設施的住宅區。','該區今日已經是完全建成的住宅區。','規劃保留所有工廠且不增住宅。','未來只會增工廠，不設公共服務。'],['用途轉變及規劃性質準確。','現在仍是工廠區。','所有工廠擬拆。','新公共設施列於圖中。'],[1],'原文 is set to be transformed 表擬議用途轉變。'),
 transfer('新路計劃向北跨河；河與東西向主路大致原位保留。','哪句同時交代道路擴展與固定地標？',['道路計劃向北跨河擴展，但河與主要東西向道路大致保留。','新路取代整條河流。','今日已經有跨河住宅路。','東西向主路將完全搬到北岸。'],['新交通與保留的河／主路均準確。','河仍在。','跨河路屬未來。','主路大致原位。'],[2],'原文道路網向北跨河、南接主路，河與東西向主路大致保留。'),
 transfer('目前中央迴旋處位於河以南。','哪句定位現有樞紐？',['目前地點以河以南的迴旋處為中心。','目前迴旋處位於河以北農田。','目前已有兩個迴旋處。','城鎮位於迴旋處正東。'],['目前圖一個中央迴旋處在河以南。','方向相反。','第二個屬未來。','城鎮在西。'],[3],'原文目前 site centred on a roundabout south of the river。'),
 transfer('現有中央迴旋處向東有一條路，兩邊及末端有工廠。','哪句不把未來住宅錯放入現況？',['由迴旋處向東的路兩旁有工廠，最遠端還有一間。','東向路兩旁現時都是住宅。','工廠全在河以北農田。','東向路今日並不存在。'],['現有東路與工廠分布正確。','住宅屬未來。','工廠在河以南。','東路已存在。'],[4],'原文現有東路兩側與最東端有工廠。'),
 transfer('目前迴旋處正北和西側也有工廠，短路向南接主路。','哪句補全目前佈局？',['其他工廠在迴旋處北、西側；短路將其連到東西向主路。','工廠只在河以北，南路沒有連接。','短路把迴旋處接到北岸學校。','迴旋處西側已是商店。'],['工廠方位及南向接路都配準。','工廠在河以南。','學校屬未來東端。','商店屬未來。'],[5],'原文迴旋處北西工廠及向南短路連主路。'),
 transfer('圖上 Town 在工業區與迴旋處左邊。','哪句方位最準？',['城鎮位於西面。','城鎮位於河以北。','城鎮位於學校的東面。','城鎮位於主路正南。'],['左邊依羅盤為西。','北面是農田。','學校在東端。','Town 標在左側。'],[6],'原文 The town lies to the west。'),
 transfer('未來圖工廠符號全部消失，新增多處住宅，也有商店與醫療中心。','哪句不把「主要」誤寫成「全部」？',['所有工廠計劃拆除，原區域主要改為住宅，也容納公共設施。','所有工廠今日已被住宅取代。','每個原廠位都只能變住宅，不能有其他用途。','工廠全部保留，只增一個住宅。'],['all factories removed 與 mainly housing 的範圍都準確。','拆除屬未來。','圖上另有公共設施。','規劃拆全部舊廠。'],[7],'原文 all factories will be removed and replaced mainly by housing。'),
 transfer('住宅規劃在中央迴旋處西側、東向路旁及河以北；北岸住宅須經新橋。','哪句保持三處位置及建橋條件？',['住宅將設在迴旋處西側、東路沿線，並在建橋後延至河以北。','所有住宅都在南面主路以外。','北岸住宅目前已可經舊橋到達。','東路旁未來仍只有工廠。'],['三處和跨河前提均準確。','住宅不只南面。','現況未有橋。','工廠擬拆。'],[8],'原文 homes west of roundabout、along eastern road、after bridge north of river。'),
 transfer('未來保留原中央迴旋處，南面主路交會處再增一個。','哪句正確解釋 second？',['第二個迴旋處將建在南面接入路上。','原中央迴旋處會直接搬到河以北。','兩個迴旋處在目前圖已存在。','第二個將建在東端學校內。'],['第二個新增於南面主路交匯處。','原中央迴旋處保留。','現況只有一個。','學校在東端。'],[9],'原文第二 roundabout 擬建於 southern access road。'),
 transfer('未來商店在西南、醫療在東南、遊樂場在東路北側、學校在最東端。','哪句把四設施位置配準？',['商店與醫療中心靠南，遊樂場在東路北面，學校在東端。','商店和學校都建在河以北農田中央。','遊樂場在南面主路上，醫療中心在西北。','四項現在都已建成。'],['四項新公共設施與方位皆符合未來圖。','北岸主要是住宅。','位置錯配。','全部屬未來規劃。'],[10],'原文四項新設施在南部、東部與東北部；圖上可逐項定位。'),
];
const balancedTransferOptions=[
 ['兩張地圖比較同一工業區現況與未來的擬議重建。','兩張地圖比較兩個已完工住宅區的現有佈局。','兩張地圖比較工廠今年與明年的生產總量。','兩張地圖解釋該區未來重建成本上升的原因。'],
 ['該區計劃由工廠群改成附帶公共設施的住宅區。','該區今日已由工廠群改成完全建成的住宅區。','該區規劃保留全部工廠，而且不會增設住宅。','該區未來只會擴增工廠，不會設公共設施。'],
 ['新路擬跨河向北延伸，河及東西向主路仍大致保留。','新路計劃取代整條河流，原主路也完全拆除。','跨河住宅路今日已存在，河及東西向主路保留。','東西向主路計劃完全搬到北岸，不再在原位。'],
 ['現有中央迴旋處位於河以南，是該區交通樞紐。','現有中央迴旋處位於河以北的農田中央。','目前已有兩個迴旋處，分別在河的南北岸。','附近城鎮在迴旋處正東，與地圖方向相反。'],
 ['現有東路兩旁及末端均有工廠，並非住宅。','現有東路兩旁及末端均有住宅，並非工廠。','現有工廠全在河以北農田，東路沒有工廠。','現有東路尚未興建，因此沒有任何建築。'],
 ['工廠亦在迴旋處北及西側，短路向南接主路。','工廠只在河以北農田，迴旋處南面沒有路。','短路將中央迴旋處連到北岸未來的學校。','迴旋處西側目前已建成商店，沒有工廠。'],
 ['城鎮位於工業區與迴旋處西面，即地圖左邊。','城鎮位於工業區與迴旋處北面，即河對岸。','城鎮位於未來學校東面，在地圖最右邊。','城鎮位於南面主路正南面，在地圖下方。'],
 ['規劃拆除全部工廠，主要建住宅，也會有公共設施。','目前全部工廠已拆，住宅及公共設施均已建成。','每個廠址都只能改住宅，不能有其他公共用途。','規劃保留全部工廠，只在旁邊增建一個住宅。'],
 ['住宅規劃在迴旋處西側、東路旁及建橋後的北岸。','住宅規劃全在南面主路外，迴旋處旁並沒有。','北岸住宅現已可經舊橋到達，不需興建新橋。','東路旁未來仍只有工廠，沒有任何新住宅。'],
 ['第二個迴旋處擬建於南面主路的交會位置。','原中央迴旋處擬搬到河以北的農田之中。','目前已有兩個迴旋處，南面並非新規劃。','第二個迴旋處擬建於東端的學校內。'],
 ['商店與醫療在南面，遊樂場在東路北側，學校最東。','商店與學校都在北岸農田中間，遠離道路。','遊樂場在南面主路上，醫療中心卻在西北。','四項設施在現有工業區早已建成並營運。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-maps:4',meta:{topic:'Norbiton 現有工業區與擬議未來重建',summary:'嚴格區分現況與計劃；全部工廠擬拆、住宅分三片，跨河橋及南面第二迴旋處，河與主路大致保留。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
