// Task 1 Process Diagram 5: instant noodles, eight numbered stages with substeps.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'沿圖中 1–8 排序；麵片、麵條、麵餅和杯裝成品不可互換。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how instant noodles are made in a factory.',
 'Overall, the eight steps go in one direction. First, flour is kept in tall containers; at the end, noodle cups are closed and given labels.',
 'First, the flour becomes dough and is shaped. Then the noodles are cooked, given flavour and packed.',
 'First, a truck brings flour, which is kept in tall storage containers.',
 'Next, flour goes into a mixer, where workers add water and oil to make dough.',
 'After mixing, the dough goes through rollers that make it into thin, flat sheets.',
 'Next, the flat sheets are cut into thin strips, which are made into round noodle discs.',
 'Later, the round noodle discs are cooked in oil and dried.',
 'After cooking and drying, the discs are put into separate cups.',
 'Next, vegetables and spices are added to the cups to make the noodles ready to use.',
 'Finally, the cups are closed and given labels before they leave the factory line.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['industrial process','in a factory','工業流程'],['manufactured','made','製造']),
 v(['linear','one direction','單向'],['eight-stage','eight steps','八步'],['silos','tall containers','筒倉'],['sealed and labelled','closed and given labels','密封和貼標籤']),
 v(['divided into two phases','First','分為兩段'],['preparing and shaping','becomes dough and is shaped','準備及塑形'],['flavouring','given flavour','調味'],['packaging','packed','包裝']),
 v(['At the beginning','First','開始時'],['delivered by truck','a truck brings','貨車送達'],['storage silos','tall storage containers','儲存筒倉']),
 v(['transferred to a mixer','goes into a mixer','送進攪拌機'],['water and oil are added','add water and oil','加入水和油'],['to form dough','to make dough','形成麵團']),
 v(['After this mixture has been prepared','After mixing','攪拌後'],['passes through a series of rollers','goes through rollers','經過多個滾軸'],['flatten','make it into thin, flat','壓平'],['dough sheets','sheets','麵片']),
 v(['subsequently cut','Next, the flat sheets are cut','其後切開'],['narrow strips','thin strips','細條'],['shaped into round noodle discs','made into round noodle discs','塑成圓形麵餅']),
 v(['second half','Later','後半段'],['cooked in oil','cooked in oil','油煮'],['then dried','and dried','其後乾燥']),
 v(['Once this heating stage has been completed','After cooking and drying','加熱乾燥後'],['dried discs','discs','乾麵餅'],['individual cups','separate cups','獨立杯子']),
 v(['Vegetables and spices','vegetables and spices','蔬菜與香料'],['added at this point','Next','此時加入'],['convenience product','ready to use','方便食用的產品']),
 v(['Finally','Finally','最後'],['sealed and labelled','closed and given labels','密封及標籤'],['production line','factory line','生產線']),
];
const structures=[
 f('The diagram illustrates the industrial process by which snack cups are manufactured.','引言以 by which 指出工業流程及成品',[1,3,8],{formula:'The diagram illustrates the industrial process by which [產品] is manufactured',meaning:'圖示方便麵的工廠製造程序。',usage:'process 是製造，不是食用指示或市場比較。',parts:[link('The diagram illustrates the industrial process by which'),slot(' instant noodles','產品'),link(' are manufactured.')]}),
 f('Overall, this is a linear, eight-stage procedure that starts with grain being stored in silos and ends with finished snack cups being sealed and labelled.','概覽單向八步、原料儲存與封口貼標',[0,3,8],{formula:'Overall, this is a linear, eight-stage procedure that starts with [起點] and ends with [終點]',meaning:'圖 1 為 flour 進筒倉；圖 8 為杯麵貼標與密封。',usage:'圖中一些標號包括多個動作；八步按標號，不是按每個動詞計。',parts:[link('Overall, this is a linear, eight-stage procedure that starts with'),slot(' flour being stored in silos','起點'),link(' and ends with'),slot(' finished noodle cups being sealed and labelled','終點'),link('.')]}),
 f('Broadly, the process can be divided into two phases: preparing and shaping the dough, followed by heating, seasoning and packaging the product.','按麵團成形及後段烹煮調味包裝分兩階段',[0,4,8],{formula:'Broadly, the process can be divided into two phases: [前段], followed by [後段]',meaning:'先混粉、壓麵片、切條成圓餅；後油煮乾燥、入杯加料、封口貼標。',usage:'cooking 在 shaping 之後，vegetables/spices 在 cup stage；不要提前。',parts:[link('Broadly, the process can be divided into two phases:'),slot(' preparing and shaping the dough','前段'),link(', followed by'),slot(' cooking, flavouring and packaging the product','後段'),link('.')]}),
 f('At the beginning, rice is delivered by truck and kept in storage silos.','先報原料運送及筒倉儲存',[0,4,8],{formula:'At the beginning, [原料] is delivered by truck and kept in storage silos',meaning:'圖 1 貨車送來 flour，存入 storage silos。',usage:'water/oil 於第 2 步 mixer 加入，非筒倉儲存材料。',parts:[link('At the beginning,'),slot(' flour','原料'),link(' is delivered by truck and kept in storage silos.')]}),
 f('It is then transferred to a mixer, where milk and sugar are added to form dough.','以 where 說攪拌機內加入的材料及產物',[0,3,8],{formula:'It is then transferred to a mixer, where [添加物] are added to form dough',meaning:'flour 在 mixer 加 water 和 oil 成麵團。',usage:'It 指 flour；不是把已完成麵杯送回攪拌機。',parts:[link('It is then transferred to a mixer, where'),slot(' water and oil','添加物'),link(' are added to form dough.')]}),
 f('After this mixture has been prepared, it passes through a series of rollers, which flatten it into thin pastry sheets.','按攪拌後滾軸壓平麵團成片',[0,4,8],{formula:'After this mixture has been prepared, it passes through a series of rollers, which flatten it into thin [片狀物]',meaning:'麵團經 rollers 後成 dough sheets；仍未切成條。',usage:'it 回指 dough mixture；which 指 rollers。',parts:[link('After this mixture has been prepared, it passes through a series of rollers, which flatten it into thin'),slot(' dough sheets','片狀物'),link('.')]}),
 f('These sheets are subsequently cut into narrow ribbons, and the strips are shaped into round pastry discs.','承接麵片，先切條再塑成圓餅',[0,4,8],{formula:'These sheets are subsequently cut into [條狀物], and the strips are shaped into [圓形物]',meaning:'圖 3 dough sheets→圖 4 dough strips→圖 5 round noodle discs。',usage:'These sheets 回指上句麵片；圖 5 麵餅仍未油煮乾燥。',parts:[link('These sheets are subsequently cut into'),slot(' narrow strips','條狀物'),link(', and the strips are shaped into'),slot(' round noodle discs','圓形物'),link('.')]}),
 f('In the second half of the process, the potato discs are cooked in oil and then dried.','由塑形過渡至烹煮及乾燥',[0,4,9],{formula:'In the second half of the process, the [餅狀物] are cooked in oil and then dried',meaning:'圖 6 Cooking (oil) + drying，發生在麵餅成形後。',usage:'圖中沒有給油溫或烹煮時間，不自行添加。',parts:[link('In the second half of the process, the'),slot(' noodle discs','餅狀物'),link(' are cooked in oil and then dried.')]}),
 f('Once this heating stage has been completed, the dried discs are placed into small paper cups.','以前一句油煮乾燥作條件，說麵餅入杯',[0,4,10],{formula:'Once this heating stage has been completed, the dried discs are placed into [容器]',meaning:'乾麵餅放入 individual cups；圖後加入蔬菜與香料。',usage:'乾燥完成後才入杯；杯不是在壓麵片前準備的原料狀態。',parts:[link('Once this heating stage has been completed, the dried discs are placed into'),slot(' individual cups','容器'),link('.')]}),
 f('Vegetables and spices are added at this point, turning the plain noodles into a complete convenience meal.','說明配料加入時點與用途',[0,4,8],{formula:'Vegetables and spices are added at this point, turning the plain noodles into [完整產品]',meaning:'圖 7 在杯中加入 vegetables + spices。',usage:'at this point 指入杯後、封口貼標前；不是與麵粉在 mixer 同時加入。',parts:[link('Vegetables and spices are added at this point, turning the plain noodles into'),slot(' a complete convenience product','完整產品'),link('.')]}),
 f('Finally, the cups are sealed and labelled before leaving the factory line.','末步交代封杯貼標後出產線',[0,4,8],{formula:'Finally, the cups are sealed and labelled before leaving [生產地點]',meaning:'圖 8 Labelling + sealing；成品杯麵離開生產線。',usage:'最後不是再烹煮；圖中也未顯示零售銷售。',parts:[link('Finally, the cups are sealed and labelled before leaving'),slot(' the production line','生產地點'),link('.')]}),
];
const intro=[quiz('圖標 1–8 的起終點？',['麵粉進儲存筒倉→杯麵封口貼標','先封口貼標→再送麵粉','先賣杯麵→再種小麥','圖只比較兩間工廠'],'第 1 Storage silos；第 8 Labelling + sealing。'),{type:'multi',prompt:'哪兩項適合概覽？',detail:'選兩項，再按「確認」。',options:['這是八步單向工業製造流程','先製麵團及塑形，後油煮乾燥、加料、杯裝封口','麵餅在加入蔬菜前已完成貼標','每杯麵都要回到筒倉重做'],correct:[0,1],why:'性質、起終點及兩階段與圖一致。'}];
const route=[sequence('依範文排列四段方便麵流程',[
 ['引言','工廠生產即食麵。'],['概覽','八步單向；前段成麵團及塑形，後段烹煮乾燥、調味包裝。'],['前段細節','麵粉貨車到筒倉；攪拌加水油；滾軸壓麵片，切條成圓麵餅。'],['後段細節','油煮乾燥；乾餅入杯、加蔬菜香料；封口貼標。'],
],'圖中步驟 3–5 的 sheets→strips→discs 須逐一保留。')];
const evidence=[
 quiz('麵粉最先存放在哪裏？',['儲存筒倉 silos','已封口杯麵','油鍋','成品紙箱'],'圖 1 Storage silos。'),
 quiz('攪拌機加入甚麼？',['水和油','蔬菜和香料','糖和牛奶','石灰石和黏土'],'圖 2 Mixer，Water + oil。'),
 quiz('滾軸使麵團變成甚麼？',['薄麵片','已完成杯麵','糖晶體','塑膠粒'],'圖 3 Dough sheets。'),
 quiz('塑形的正確次序？',['麵片→麵條→圓形麵餅','圓形麵餅→麵片→麵條','麵條→麵粉→麵片','杯麵→麵片→小麥'],'圖 3、4、5。'),
 quiz('第 6 步如何處理麵餅？',['用油烹煮，然後乾燥','只加標籤','先加蔬菜後回筒倉','只用水蒸而未乾燥'],'圖 6 Cooking (oil) + drying。'),
 quiz('蔬菜和香料何時加入？',['乾麵餅入杯後、封口貼標前','麵粉進筒倉之前','壓麵片時加入滾軸','成品離廠後才加入'],'圖 7 Vegetables + spices 旁畫杯子。'),
 quiz('最後圖示何事？',['杯子封口並貼標籤','重新混粉','回收用過的杯子','麵餅再次壓成麵片'],'圖 8 Labelling + sealing。'),
];
const logic=[sequence('八標號：麵的物料狀態',[
 ['1–2 原料與麵團','麵粉存筒倉；加水油攪拌成麵團。'],['3–5 塑形','滾軸成薄片→切條→圓形麵餅。'],['6 加熱','油煮再乾燥。'],['7–8 杯裝','乾餅入杯、加蔬菜香料、封口貼標。'],
 ],'圖中的水和油加入 mixer；蔬菜香料加入 cups，兩時點不同。'),sequence('指代與先後檢查',[
 ['It is then…','It 指前句 flour，進攪拌機。'],['These sheets…','These 指上句壓出的麵片。'],['Once this heating…','加熱和乾燥完成後，才入杯。'],['At this point…','杯裝時加入蔬菜香料，末步再封口。'],
 ],'每個承接詞都應對得上圖中的上一個物料狀態。')];
const transfers=[
 transfer('另一圖說明工廠製造杯裝麵。','哪句引言聚焦製造？',['流程圖展示方便麵如何在工廠製造。','流程圖比較各品牌市價。','流程圖只展示食用時間。','流程圖畫田間小麥生長。'],['工業製造主題準確。','沒有價格。','不只食用。','圖從麵粉筒倉開始。'],[0],'原文 industrial process by which instant noodles are manufactured。'),
 transfer('圖標 1–8，第 1 為麵粉筒倉、第 8 為封口貼標。','哪句概覽完整？',['八步單向流程由麵粉儲存開始，以杯麵封口貼標結束。','流程由已封口杯麵回到麵粉。','八標號代表八種口味。','圖未畫任何成品。'],['步數、方向、起終點均準。','方向錯。','不是口味數。','末端有成品。'],[1],'原文 linear eight-stage，silos→sealed/labelled cups。'),
 transfer('先處理麵團，後烹煮並包裝。','哪句按兩階段分組？',['前段準備並塑形麵團，後段烹煮、調味和包裝。','前段先貼標籤，後段才混粉。','兩階段都只涉及運貨車。','圖沒有烹煮或調味。'],['兩個階段次序正確。','順序倒置。','有多種工序。','圖標 Cooking／Vegetables。'],[2],'原文 preparing/shaping→cooking/flavouring/packaging。'),
 transfer('圖首端貨車送麵粉，旁邊畫筒倉。','哪句不提前配料？',['一開始麵粉由貨車送到，存入儲存筒倉。','筒倉首先封杯並貼標籤。','蔬菜在送麵粉前已加到麵團。','貨車把已完成麵杯送入油鍋。'],['圖 1 只有原料與儲存。','末步才封杯。','蔬菜在第 7。','順序錯。'],[3],'原文 flour delivered by truck and kept in silos。'),
 transfer('麵粉從筒倉進 mixer，旁標 Water + oil。','哪句說明攪拌產物？',['麵粉進攪拌機，加入水和油形成麵團。','加入蔬菜和香料形成麵團。','麵粉與水油在成品封口後才混合。','攪拌機把杯子變成標籤。'],['材料與產物準確。','蔬菜香料在第 7。','混合在第 2。','設備功能錯。'],[4],'原文 flour→mixer＋water/oil→dough。'),
 transfer('混合後麵團經多個 rollers。','哪句保留機器作用？',['麵團經滾軸壓成薄麵片。','滾軸把麵片直接封成杯子。','滾軸只用來貼標籤。','麵片在麵粉送達前形成。'],['rollers flatten dough into sheets。','中間仍須切條等。','貼標在末步。','順序錯。'],[5],'原文 rollers flatten mixture into dough sheets。'),
 transfer('圖 3、4、5 依次標 sheets、strips、discs。','哪句不跳過中間形態？',['麵片先切細條，細條再塑成圓形麵餅。','麵片直接成為已封杯麵。','麵餅先壓成麵片，才切條。','麵條是最初送來的原料。'],['三個狀態依圖排序。','跳過兩步。','倒置。','起點是麵粉。'],[6],'原文 sheets cut strips→round noodle discs。'),
 transfer('圓麵餅成形後，第 6 步是 Cooking (oil) + drying。','哪句烹煮乾燥順序正確？',['麵餅在油中烹煮，然後乾燥。','先封口貼標，再把杯子放入油鍋。','麵餅只沾水，不經加熱。','乾燥在原料麵粉送達之前。'],['兩動作與圖標一致。','封口在後。','圖標油煮。','順序錯。'],[7],'原文 noodle discs cooked in oil and then dried。'),
 transfer('乾燥後麵餅進入一個個杯子。','哪句讓 Once 承接上一階段？',['加熱乾燥完成後，麵餅被放入獨立杯子。','麵餅未成形就先封杯。','麵團仍在滾軸上就加標籤。','入杯發生在筒倉存麵粉之前。'],['完成 heating stage 才 cup。','太早。','貼標較後。','順序錯。'],[8],'原文 dried discs placed into individual cups。'),
 transfer('圖 7 Vegetables + spices 指向杯子。','哪句抓準加入時點？',['杯裝時加入蔬菜及香料，使麵成為完整方便食品。','蔬菜在麵粉筒倉就被混入。','香料在成品離廠後才首次加入。','蔬菜只是回收箱材料。'],['at this point 指杯裝時。','過早。','過晚。','用途錯。'],[9],'原文 vegetables/spices added at this point。'),
 transfer('第 8 步圖標 Labelling + sealing。','哪句正確完成流程？',['最後杯麵被封口和貼標，然後離開生產線。','最後再把成品杯麵倒回筒倉。','最後才第一次加入水油混麵粉。','最後麵餅重新變成未加工麵片。'],['末端包裝和出線準確。','沒有回流。','混合在第 2。','方向錯。'],[10],'原文 Finally cups sealed and labelled。'),
];
export default {key:'task1-process-diagram:5',meta:{topic:'杯裝方便麵八步生產：麵團塑形、油煮、加料與封口',summary:'麵粉筒倉→加水油混麵團→滾軸壓片→切條→圓麵餅→油煮乾燥→入杯加蔬菜香料→封口貼標。按八個標號計步，分清麵片、麵條、麵餅。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
