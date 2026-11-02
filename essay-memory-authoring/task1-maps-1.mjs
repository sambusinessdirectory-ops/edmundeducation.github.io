// Task 1 Maps 1: Beechwood Farm, 1950 and today.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先對照兩張平面圖的位置與變化，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two plans show how Beechwood Farm was arranged in 1950 and how the same place is arranged today.',
 'Overall, the farm changed from a place used mainly for growing food and keeping animals into a place with more different uses.',
 'The river, main road, farmhouse, chicken area and three growing areas are still there. But the sheep field and simple paths have been replaced by roads, places for visitors and solar panels.',
 'In 1950, people grew crops in the west: fruit trees were in the northwest, with soft fruits and vegetables in nearby areas to the south.',
 'A large field for sheep took up most of the northeast.',
 'There were only paths for moving around: one went from the main road towards the barn, and another went to the farmhouse.',
 'The farmhouse was in the southeast, just above the chickens and inside the river’s bend.',
 'Today, the areas for crops are still in nearly the same places, but a farm shop and car park have been built near the entrance.',
 'The old sheep field is now a camping field and a solar-panel area, with another car park close to them.',
 'In the east, holiday cottages have been built above the farmhouse, and the barn has been moved to the southwest.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['layout','how Beechwood Farm was arranged','佈局'],['arrangement','how the same place is arranged','安排'],['same site','same place','同一地點']),
 v(['transformed','changed','轉變'],['mainly agricultural site','place used mainly for growing food and keeping animals','主要農業地點'],['more diversified complex','place with more different uses','更多用途的場地']),
 v(['chicken enclosure','chicken area','雞舍／雞隻區'],['crop areas','growing areas','種植區'],['retained','still there','保留'],['whereas','But','而'],['basic tracks','simple paths','小徑'],['given way to','replaced by','被取代'],['visitor facilities','places for visitors','遊客設施']),
 v(['western half','west','西半部'],['used for crops','grew crops','種植作物'],['lay in the northwest','were in the northwest','位於西北'],['adjacent plots','nearby areas','相鄰地塊'],['to the south','to the south','在南面']),
 v(['sheep field','field for sheep','羊群牧場'],['occupied most','took up most','佔據大部分'],['north-eastern area','northeast','東北部']),
 v(['Access was provided only by tracks','There were only paths for moving around','只能走小徑出入'],['one running','one went','其中一條通往'],['another leading','another went','另一條通往']),
 v(['stood','was','位於'],['southeast','southeast','東南'],['just above','just above','正上方'],['inside the bend of the river','inside the river’s bend','河灣內側']),
 v(['crop plots','areas for crops','種植區'],['remain in similar positions','still in nearly the same places','位置大致不變'],['have been added','have been built','新增'],['near the entrance','near the entrance','入口附近']),
 v(['former sheep pasture','old sheep field','昔日羊群牧場'],['now divided between','now a camping field and a solar-panel area','現分成兩區'],['nearby','close to them','附近']),
 v(['holiday cottages','holiday cottages','度假小屋'],['built above','built above','建於上方'],['while','and','而'],['moved south-west','moved to the southwest','移往西南']),
];
const structures=[
 f('The two plans illustrate the layout of Hill Farm in 1960 and the arrangement of the same site today.','引言交代同一地點在過去與現在的兩張平面圖',[2,4,8],{formula:'The [兩圖] illustrate the layout of [地點] in [過去年] and the arrangement of the same site today',meaning:'平面圖比較 Beechwood Farm 的 1950 年與現在。',usage:'same site 表示比較同一農場的兩個時點；不是兩個不同農場。',parts:[link('The'),slot(' two plans','兩圖'),link(' illustrate the layout of'),slot(' Beechwood Farm','地點'),link(' in'),slot(' 1950','過去年'),link(' and the arrangement of the same site today.')]}),
 f('Overall, the estate has been transformed from a mainly agricultural site into a more diversified complex.','概覽概括整體用途由單一農業走向多元',[0,3,7],{formula:'Overall, [地點] has been transformed from a mainly agricultural site into a more diversified complex',meaning:'農場仍有作物與動物設施，但新增露營、度假小屋、商店、停車及太陽能板。',usage:'轉變是用途多元化；不應誤寫成所有農業活動都消失。',parts:[link('Overall,'),slot(' the farm','地點'),link(' has been transformed from a mainly agricultural site into a more diversified complex.')]}),
 f('The stream, main road, house, poultry area and three crop areas have been retained, whereas the grazing field and basic tracks have given way to roads, visitor facilities and solar panels.','概覽分清保留的地貌／設施與被取代的部分',[1,4,8],{formula:'[保留項目] have been retained, whereas [消失項目] have given way to [新項目]',meaning:'河、主路、農舍、雞舍、果樹／漿果／蔬菜仍在；羊場和小徑改成道路、遊客設施、太陽能板。',usage:'「保留」不代表完全相同面積或入口；羊場的位置現有露營與太陽能區。',parts:[slot('The river, main road, farmhouse, chicken enclosure and three crop areas','保留項目'),link(' have been retained, whereas'),slot(' the sheep field and basic tracks','消失項目'),link(' have given way to'),slot(' roads, visitor facilities and solar panels.','新項目')]}),
 f('In 1960, the western half was used for crops: fruit trees lay in the northwest, with berries and vegetables in adjacent plots to the south.','以西半部為區域，按北到南描述三塊作物地',[1,5,8],{formula:'In [過去年], the western half was used for crops: fruit trees lay in the northwest, with [兩種作物] in adjacent plots to the south',meaning:'1950 年西部由北到南是果樹、漿果、蔬菜，彼此相鄰。',usage:'方向以圖上方為北；不要把蔬菜放到果樹的北面。',parts:[link('In'),slot(' 1950','過去年'),link(', the western half was used for crops: fruit trees lay in the northwest, with'),slot(' soft fruits and vegetables','兩種作物'),link(' in adjacent plots to the south.')]}),
 f('A large grazing field occupied most of the north-eastern area.','以大小與方位定位昔日牧場',[0,3,7],{formula:'A large [用途地塊] occupied most of the north-eastern area',meaning:'1950 年羊場佔東北部大片地方，今已改作露營及太陽能區。',usage:'north-eastern 是圖的右上部；羊場不是西部三塊作物地。',parts:[link('A large'),slot(' sheep field','用途地塊'),link(' occupied most of the north-eastern area.')]}),
 f('Access was provided only by tracks, one running from the side road towards the greenhouse and another leading to the cottage.','描述舊道路網及兩條小徑各自通向的地方',[0,4,8],{formula:'Access was provided only by tracks, one running from [起點] towards [目的地甲] and another leading to [目的地乙]',meaning:'1950 年由主路出發的簡易小徑通往穀倉與農舍，現在相應位置有道路。',usage:'當年的支路標示為 Track；不能把今天標示為 Road 的路說成 1950 年已建成。',parts:[link('Access was provided only by tracks, one running from'),slot(' the main road','起點'),link(' towards'),slot(' the barn','目的地甲'),link(' and another leading to'),slot(' the farmhouse.','目的地乙')]}),
 f('The farmhouse stood in the southeast, just above the poultry area and inside the bend of the river.','利用東南方位、上下關係與河灣三重定位',[1,4,8],{formula:'The [建築] stood in the southeast, just above [鄰近地] and inside the bend of the river',meaning:'農舍在東南，雞舍正下方，兩者在河流彎曲的內側。',usage:'above 是圖上相對位置，不是建築樓層；河流彎在農場南側。',parts:[link('The'),slot(' farmhouse','建築'),link(' stood in the southeast, just above'),slot(' the chickens','鄰近地'),link(' and inside the bend of the river.')]}),
 f('Today, the crop plots remain in similar positions, but a farm shop and a car park have been added near the entrance.','同一句對照作物區保留與入口新設施',[1,5,9],{formula:'Today, [保留區] remain in similar positions, but [新增設施] have been added near the entrance',meaning:'今日西部三塊作物地位置大致不變；農場商店與一個停車場在西北入口附近。',usage:'圖上有兩個停車場；本句只指入口附近的一個，另一個在原羊場旁。',parts:[link('Today,'),slot(' the crop plots','保留區'),link(' remain in similar positions, but'),slot(' a farm shop and car park','新增設施'),link(' have been added near the entrance.')]}),
 f('The former grazing area is now divided between a camping field and a solar-panel area, with another car park nearby.','指出原羊場在同位置分作兩新用途，另有第二停車場',[0,3,7],{formula:'The former [舊用途] is now divided between [新用途甲] and [新用途乙], with another car park nearby',meaning:'1950 年東北羊場的位置如今分成中央偏北的露營地和東北太陽能板區，東側另有停車場。',usage:'another car park 指第二個，與入口旁的停車場分開；不要把露營地說成舊有設施。',parts:[link('The former'),slot(' sheep pasture','舊用途'),link(' is now divided between'),slot(' a camping field','新用途甲'),link(' and'),slot(' a solar-panel area','新用途乙'),link(', with another car park nearby.')]}),
 f('In the east, guest rooms have been built above the office, while the warehouse has been moved south-west.','收束東部新建小屋及穀倉的相對遷移方向',[1,5,8],{formula:'In the east, [新建設施] have been built above [原建築], while [搬遷建築] has been moved south-west',meaning:'今日度假小屋在農舍北面；穀倉由昔日東側位置移到更西南的農舍旁。',usage:'south-west 描述穀倉相對舊址的移動；不要誤寫為農舍移動。',parts:[link('In the east,'),slot(' holiday cottages','新建設施'),link(' have been built above'),slot(' the farmhouse','原建築'),link(', while'),slot(' the barn','搬遷建築'),link(' has been moved south-west.')]}),
];
const intro=[
 quiz('這兩張圖應按甚麼時點比較？',['同一農場 1950 年與今天','兩個不同農場在同一年','農場 1950 與 1960 年的產量','兩個國家的河流長度'],'圖題是 Beechwood Farm；兩張圖分別標 1950 和 Today。'),
 {type:'multi',prompt:'哪兩項是最值得放入概覽的整體變化？',detail:'選兩項，再按「確認」。',options:[
  '農場由主要農業用途變成兼有遊客設施和太陽能板的多用途場地',
  '河、主路、農舍、雞舍和三塊作物地保留；羊場和小徑被新用途／道路取代',
  '農場所有原有作物地已完全消失',
  '河流被填平，主路已搬到東部',
 ],correct:[0,1],why:'概覽須把主要改變與仍保留的要素一起說出。'},
];
const route=[sequence('依範文次序，排好四段的地圖報告工作',[
 ['平面圖介紹','交代 Beechwood Farm、1950 年與今天。'],
 ['整體概覽','主要農業場地轉為多用途；河、農舍、作物區等保留，羊場與小徑改變。'],
 ['1950 年佈局','西部三塊作物地、東北羊場、通往穀倉與農舍的小徑、東南農舍。'],
 ['今日佈局','入口商店及停車、露營與太陽能、東側第二停車與度假小屋、穀倉移位。'],
],'先交代地圖兩時點，再按空間區域說明保留、取代與新建。')];
const evidence=[
 quiz('1950 年西部三塊作物地由北向南如何排列？',['果樹、漿果、蔬菜','蔬菜、漿果、果樹','羊場、穀倉、雞舍','太陽能、露營、停車'],'西北果樹，其南相鄰是軟果與蔬菜。'),
 quiz('1950 年羊場主要在哪裏？',['東北大片地區','西南河外','東南雞舍內','西北主路上'],'羊場在舊圖的右上大片區域。'),
 quiz('1950 年主路通向農場內部的是甚麼？',['簡易小徑 Tracks','今天的多條 Roads','鐵路','碼頭'],'舊圖內部通道標 Track；今日圖才標 Road。'),
 quiz('哪幾項在兩張圖都可見？',['河、主路、農舍、雞舍及三塊作物地','羊場、露營地和太陽能板','兩個停車場和農場商店','度假小屋和 1950 年穀倉同址'],'河、主路、農舍、雞舍、果樹、軟果、蔬菜均可跨圖找到。'),
 quiz('入口附近今日新增甚麼？',['農場商店和一個停車場','羊場和第二個雞舍','度假小屋和太陽能板','新的河流和主路'],'商店與一個停車場在主路入場附近；另一個停車場在東側。'),
 quiz('原羊場今日主要變成甚麼？',['露營地和太陽能板區','三塊作物地','新河道和雞舍','西南的穀倉'],'原東北羊場位置現為露營區與太陽能板區，旁有停車場。'),
 quiz('今日度假小屋與穀倉的變化如何？',['小屋建於農舍上方，穀倉向西南移','小屋在河外，穀倉完全消失','小屋取代三塊作物地，農舍向西移','穀倉與小屋均在 1950 年原址'],'小屋在農舍北側，穀倉今位於農舍左側及較南的位置。'),
];
const logic=[
 sequence('先辨識 1950 年舊有佈局',[
  ['西部','果樹在西北；軟果與蔬菜依次向南相鄰。'],
  ['東北','大片羊場。'],
  ['東南','農舍在雞舍上方，位於南側河灣內。'],
  ['通道','主路進入後為通向穀倉和農舍的小徑。'],
 ],'先用固定地標與方向定位，才能判斷今日變化發生在哪裏。'),
 sequence('再逐項對照今日：保留、取代、新建、搬遷',[
  ['保留','河、主路、農舍、雞舍與三塊作物地位置大致仍在。'],
  ['取代','羊場改為露營與太陽能區；簡易小徑改成道路。'],
  ['新建','入口農場商店、兩個停車場、農舍上方的度假小屋。'],
  ['搬遷','穀倉由原本東側位置移向西南，靠近農舍西邊。'],
 ],'地圖報告須說清同一位置的前後變化，不能把今日新建設施寫成 1950 年已有。'),
];
const transfers=[
 transfer('兩張圖顯示一座農場 1960 年與現今的平面佈局。','哪句引言清楚比較同一地點？',['兩張平面圖展示同一農場在 1960 年與現今的佈局。','兩圖比較兩座不同農場在 1960 年的產量。','兩圖顯示農場收入的百分比。','兩圖解釋為何農場搬遷。'],['同一地點、兩個時點、佈局皆準確。','不是兩座農場。','圖中是位置。','沒有原因。'],[0],'原文引言比較 Beechwood Farm 在 1950 年與今天的同一地點。'),
 transfer('舊農場主要種植與養羊；現今仍有作物，但也有露營、商店與太陽能。','哪句整體概覽不把農業誤寫成消失？',['農場由主要農業用途變得更多元，仍保留部分種植區。','農業活動已完全被停車場取代。','農場始終只養羊，沒有其他用途。','所有地貌與設施都完全相同。'],['多元化與部分保留可同時成立。','作物仍在。','今日有其他用途。','地圖變化明顯。'],[1],'原文概覽農場由主要農業轉為較多元的場地。'),
 transfer('河與農舍仍在；羊場與小徑消失，改為道路、遊客設施和太陽能區。','哪句同時列保留與取代？',['河與農舍保留，而羊場及小徑讓位於道路和新設施。','河流已被填平，農舍搬到另一地。','羊場及小徑今日仍完全原樣。','太陽能板在舊圖已存在。'],['兩種變化清楚分開。','河與農舍仍在。','羊場和小徑已改變。','太陽能屬今日。'],[2],'原文保留河、主路、農舍、雞舍及作物地，羊場和小徑被新用途取代。'),
 transfer('舊圖西北是果樹，其南相鄰是漿果，最南是蔬菜。','哪句按位置由北向南說明？',['西部由北向南是果樹、漿果及蔬菜相鄰地塊。','西部由北向南是蔬菜、漿果及果樹。','三塊作物地都位於東北。','果樹在河流南側。'],['三地的位置與相鄰關係正確。','南北順序顛倒。','作物地在西部。','果樹在西北。'],[3],'原文果樹位於西北，軟果與蔬菜在其南面的相鄰地塊。'),
 transfer('舊圖一大片羊場佔東北部；西部仍是作物地。','哪句不把方向對調？',['大片羊場佔東北部的大部分。','羊場佔西南部河外地帶。','羊場位於三塊作物地之間。','東北部只是一個小停車場。'],['舊圖東北大片區域標 Sheep。','方向不符。','作物在西部。','停車場是今日設施。'],[4],'原文 1950 年羊場佔東北部大片地方。'),
 transfer('舊圖由主路進入後只有小徑，一條往穀倉，一條往農舍；今日標為道路。','哪句分清兩個時點的通道？',['1950 年內部只有小徑，分別通向穀倉與農舍。','1950 年已建成今日所有道路。','小徑只通向河流，並無通向建築。','主路在今日已完全消失。'],['舊圖 Track 與今日 Road 分明。','今日路不能回填至舊圖。','小徑通向兩建築。','主路兩圖都在。'],[5],'原文 1950 年只能靠 Tracks 通向穀倉與農舍。'),
 transfer('舊圖農舍在東南，雞舍正下方，河流於南面彎曲。','哪句使用相對位置準確？',['農舍在東南，位於雞舍上方及河灣內側。','農舍在西北，位於雞舍下方。','農舍在河流外側的南岸。','雞舍在農舍北面。'],['東南、上下、河灣內側三重關係皆準。','方向與上下相反。','農舍在河灣內。','雞舍在下方。'],[6],'原文農舍在東南、雞舍上方及河灣內側。'),
 transfer('現今西部三塊作物地位置大致不變，入口旁新增商店和第一個停車場。','哪句分清保留與新建？',['作物地大致仍在原位，入口旁新增農場商店及停車場。','三塊作物地全部搬到東北。','商店和停車場 1950 年已存在。','作物地被河流完全取代。'],['保留區和入口新增設施都準確。','三塊地仍在西部。','新設施屬今日。','作物地仍可見。'],[7],'原文 Today 的作物地位置相近，入口新添商店與一個停車場。'),
 transfer('昔日東北羊場今日分為露營區與太陽能區，東側另有第二個停車場。','哪句保留原址及第二停車場？',['原羊場現分成露營和太陽能區，附近另有停車場。','露營區與太陽能區都在 1950 年已存在。','昔日羊場現在只改為三塊作物地。','兩個停車場都在農場入口同一位置。'],['原羊場的位置與今日兩用途、附近停車場均準確。','新設施屬今日。','作物地在西部。','第二停車場在東側。'],[8],'原文 former sheep pasture 變露營與太陽能，另有一個停車場。'),
 transfer('今日度假小屋在農舍北側；穀倉由舊圖東側移向西南。','哪句把新建與搬遷主體說準？',['小屋建於農舍上方，穀倉則向西南移動。','農舍向西南移，穀倉原地不動。','小屋建在農舍南面河外。','穀倉和小屋都在 1950 年已建成。'],['小屋是新建、穀倉是搬遷，方向正確。','搬遷的是穀倉。','小屋在農舍上方。','小屋是今日新增。'],[9],'原文東部新建度假小屋於農舍上方，穀倉移往西南。'),
];
export default {key:'task1-maps:1',meta:{topic:'Beechwood Farm 1950 年與現今的佈局',summary:'按西部作物區、東北羊場、東南農舍定位；分清保留、取代、新建與穀倉搬遷，避免把今日道路倒寫到 1950 年。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
