// Task 1 Process Diagram 4: nine-stage plastic-bottle recycling, with optional bottle loop.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按 1–9 箭嘴走完回收、處理與製造；分清部分新樽可再次回收。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how used plastic bottles are recycled and made into new things.',
 'Overall, there are nine main steps. The process starts when people throw away used bottles and ends when new products are made.',
 'Most steps go in one direction, but some new bottles can be recycled again.',
 'First, people put used plastic bottles in recycling bins.',
 'Next, a truck empties the bins and takes the bottles to a recycling centre.',
 'At the centre, workers sort the bottles on a moving belt, keeping suitable bottles and rejecting the rest.',
 'The kept bottles are then pressed into tight blocks, so they are easier to move for the next steps.',
 'Next, the blocks are crushed into small pieces. These pieces are washed to remove dirt.',
 'The clean pieces go into a machine, which turns them into small plastic pellets.',
 'After that, the pellets are heated and made into raw plastic, which is kept in large bundles.',
 'Finally, the raw plastic makes new things, including bottles, food boxes, T-shirts, bags and pencils.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['recycled','recycled','回收'],['converted into','made into','轉成'],['new goods','new things','新產品']),
 v(['procedure','process','程序'],['nine main stages','nine main steps','九大步'],['disposal','throw away','棄置'],['end products','new products','最終產品']),
 v(['largely linear','Most steps go in one direction','大致單向'],['production of new bottles','new bottles','製造新樽'],['re-enter the same recycling loop','recycled again','再次進入回收循環']),
 v(['At the initial stage','First','開始時'],['consumers','people','消費者'],['discarded','used','棄置的'],['dedicated recycling bins','recycling bins','專用回收箱']),
 v(['containers','bins','回收箱'],['emptied by a collection truck','a truck empties','由收集車清空'],['transports','takes','運送'],['recycling centre','recycling centre','回收中心']),
 v(['Once there','At the centre','到達後'],['sorted','sort','分類'],['conveyor belt','moving belt','輸送帶'],['suitable items','suitable bottles','合適樽'],['rejected materials','rejecting the rest','不合適材料']),
 v(['accepted bottles','kept bottles','獲接納的樽'],['subsequently compressed','then pressed','接着壓縮'],['dense blocks','tight blocks','密實方塊'],['easier to handle','easier to move','方便處理']),
 v(['compacted blocks','blocks','壓實方塊'],['crushed into small fragments','crushed into small pieces','碎成小片'],['washed to remove impurities','washed to remove dirt','清洗去雜質']),
 v(['cleaned pieces','clean pieces','洗淨小片'],['fed into a machine','go into a machine','送入機器'],['plastic pellets','small plastic pellets','塑膠粒']),
 v(['After this','After that','其後'],['heated and transformed','heated and made','加熱轉化'],['raw material','raw plastic','原料'],['stored in large bundles','kept in large bundles','存放為大捆原料']),
 v(['Finally','Finally','最後'],['manufacture a range of products','makes new things','製造各類產品'],['food containers','food boxes','食物容器'],['shopping bags','bags','購物袋']),
];
const structures=[
 f('The diagram illustrates the process by which glass bottles are recycled and converted into new goods.','引言交代回收原料與新產品',[1,3,8],{formula:'The diagram illustrates the process by which [廢物] are recycled and converted into new goods',meaning:'舊塑膠樽被回收、加工成原料，再製成多種產品。',usage:'new goods 不只指新塑膠樽；末圖還有盒、T 恤、袋及鉛筆。',parts:[link('The diagram illustrates the process by which'),slot(' plastic bottles','廢物'),link(' are recycled and converted into new goods.')]}),
 f('Overall, the procedure contains nine main stages, beginning with the disposal of used cans and ending with the manufacture of various end products.','概覽步數、起點與終點',[0,3,9],{formula:'Overall, the procedure contains nine main stages, beginning with the disposal of [廢物] and ending with the manufacture of various end products',meaning:'圖標 1–9；放舊樽入回收箱起，製成新貨品終。',usage:'九階段按圖標計；不要把五種終產品當成五個額外工序。',parts:[link('Overall, the procedure contains nine main stages, beginning with the disposal of'),slot(' used bottles','廢物'),link(' and ending with the manufacture of various end products.')]}),
 f('It is largely linear, although the production of new cans means that some items can re-enter the same recycling loop.','用 although 說主流程單向與部分產品可再循環',[0,4,10],{formula:'It is largely linear, although the production of new [可再回收品] means that some items can re-enter the same recycling loop',meaning:'1–9 主要單向；末步製成的新樽可再投回回收箱。',usage:'some items 指可再回收的新樽；不能說 T 恤、鉛筆必定沿同一樽回收線循環。',parts:[link('It is largely linear, although the production of new'),slot(' bottles','可再回收品'),link(' means that some items can re-enter the same recycling loop.')]}),
 f('At the initial stage, consumers place discarded glass bottles in dedicated recycling bins.','起步說明由消費者把指定物件放進回收箱',[0,4,8],{formula:'At the initial stage, consumers place discarded [廢物] in dedicated recycling bins',meaning:'第 1 步消費者把舊塑膠樽投入回收箱。',usage:'此時尚未運送或分類；回收箱不是最後產品。',parts:[link('At the initial stage, consumers place discarded'),slot(' plastic bottles','廢物'),link(' in dedicated recycling bins.')]}),
 f('These containers are then emptied by a collection truck, which transports the waste to a sorting depot.','These 回指回收箱，which 回指收集車',[0,3,8],{formula:'These containers are then emptied by a collection truck, which transports the waste to [目的地]',meaning:'第 2 步車輛清空箱，載舊樽到 recycling centre。',usage:'These containers 是前句回收箱；不是把完成產品送到商店。',parts:[link('These containers are then emptied by a collection truck, which transports the waste to'),slot(' a recycling centre','目的地'),link('.')]}),
 f('Once there, the cans are sorted on a conveyor belt, with suitable items separated from rejected materials.','到達中心後在輸送帶分好可處理與拒收品',[0,4,8],{formula:'Once there, [廢物] are sorted on a conveyor belt, with suitable items separated from rejected materials',meaning:'第 3 步在輸送帶挑選合適塑膠樽，圖以勾／叉分別標示。',usage:'只有 accepted bottles 進下一步壓縮；reject items 不得當成已加工原料。',parts:[link('Once there,'),slot(' the bottles','廢物'),link(' are sorted on a conveyor belt, with suitable items separated from rejected materials.')]}),
 f('The accepted bottles are subsequently compressed into compact blocks, making them easier to handle before further processing.','把合格樽壓成塊，並交代目的',[0,4,8],{formula:'The accepted bottles are subsequently compressed into [形態], making them easier to handle before further processing',meaning:'第 4 步把合格樽壓成 dense blocks，便於搬運和後續碎片化。',usage:'壓塊後仍是塑膠樽材料，不是 pellets 或最終產品。',parts:[link('The accepted bottles are subsequently compressed into'),slot(' dense blocks','形態'),link(', making them easier to handle before further processing.')]}),
 f('In the next phase, the compacted blocks are crushed into small flakes, which are washed to remove impurities.','同段交代壓塊碎片化與清洗去雜質',[0,4,9],{formula:'In the next phase, the compacted blocks are crushed into [碎片], which are washed to remove impurities',meaning:'第 5 步 Crushing 後下方標 Washing；先碎後洗。',usage:'which 回指碎片；清洗在造粒之前。',parts:[link('In the next phase, the compacted blocks are crushed into'),slot(' small fragments','碎片'),link(', which are washed to remove impurities.')]}),
 f('The cleaned pieces are fed into a machine and turned into plastic beads.','把洗淨碎片送機器造塑膠粒',[0,4,9],{formula:'The cleaned pieces are fed into a machine and turned into [顆粒]',meaning:'第 6 步由乾淨碎片製成 plastic pellets。',usage:'pellets 是中間物，下一步還須加熱才成 raw material。',parts:[link('The cleaned pieces are fed into a machine and turned into'),slot(' plastic pellets','顆粒'),link('.')]}),
 f('After this, the pellets are heated and transformed into raw material, which is stored in large sacks.','以 which 回指加熱後原料，說明其存放',[0,4,8],{formula:'After this, the pellets are heated and transformed into raw material, which is stored in [存放形態]',meaning:'第 7 步加熱 pellets 成原料；第 8 步圖示成捆存放。',usage:'pellets 與 heated raw material 不同；不能把儲存錯放在加熱前。',parts:[link('After this, the pellets are heated and transformed into raw material, which is stored in'),slot(' large bundles','存放形態'),link('.')]}),
 f('Finally, this material is used to manufacture a range of products, including new bottles, food containers, T-shirts, shopping bags and pens.','最後用新原料製多種不同終產品',[0,4,9],{formula:'Finally, this material is used to manufacture a range of products, including [圖示例子]',meaning:'第 9 步例子為新樽、食物盒、T 恤、購物袋、鉛筆。',usage:'只有新樽有明確回到相同回收線的可能，不可斷言每種產品都必定回到樽回收箱。',parts:[link('Finally, this material is used to manufacture a range of products, including'),slot(' new bottles, food containers, T-shirts, shopping bags and pencils','圖示例子'),link('.')]}),
];
const intro=[quiz('圖標末步到首步的回圈應怎樣解讀？',['部分新樽可再次被投入同類回收箱','所有 T 恤必定變回原來塑膠樽','九步其實要逆序完成','新產品全部不可能再回收'],'第 9 步有新樽及箭頭回到第 1 步；其他產品未必同路。'),{type:'multi',prompt:'哪兩項最適合概覽？',detail:'選兩項，再按「確認」。',options:['九步由丟棄舊塑膠樽開始，以多類新產品結束','主要流程單向；部分新樽可能重返同一回收線','被篩走的樽直接變成原料','洗淨碎片直接成衣，沒有造粒和加熱'],correct:[0,1],why:'起終點、九步及有限回圈是圖中主特徵。'}];
const route=[sequence('按範文分段排序回收流程',[
 ['引言','舊塑膠樽被回收製成新貨品。'],['概覽','九步大致單向；新樽有可能回到同一回收循環。'],['收集與前處理','回收箱→收集車→中心分類→合格樽壓塊。'],['再加工與成品','碎洗→造粒→加熱原料→捆存→製樽、食物盒、T 恤、袋、鉛筆。'],
],'第 3 步被拒收物件不進入後續壓縮和造粒流程。')];
const evidence=[
 quiz('流程首步？',['消費者把舊樽放進回收箱','塑膠粒直接變衣服','先加熱，再回收','工廠先製鉛筆'],'標號 1 畫回收箱。'),
 quiz('收集車把物料送到哪裏？',['回收中心','上游甘蔗田','發電水庫','零售服裝店'],'標號 2→3 Recycling centre。'),
 quiz('中心分選的關鍵？',['保留合適樽，剔除不合適物件','所有物件都不分選直接造粒','只分選顏色而無拒收','先做成新樽再分選'],'第 3 步勾與叉。'),
 quiz('合格樽在第 4 步變成甚麼？',['密實壓縮塊','完成 T 恤','新衣架','液體燃料'],'第 4 步 Compressing into blocks。'),
 quiz('壓塊後第 5 步的先後？',['壓碎成小片，再清洗','清洗成衣後才種植','先製塑膠粒，再把舊樽壓碎','直接送零售店'],'圖第 5 步 Crushing，下面 Washing。'),
 quiz('第 6、7 步如何改變物料？',['乾淨小片造塑膠粒，塑膠粒加熱成原料','原料先變舊樽，再變垃圾','小片直接變成新汽車','兩步只改變包裝顏色'],'第 6 Producing plastic pellets，第 7 Heating pellets。'),
 quiz('末步圖示哪些產品？',['新樽、食物盒、T 恤、袋及鉛筆','只有新樽','只有家具','只有燃料'],'第 9 步五種產品；新樽可進一步回收。'),
];
const logic=[sequence('九步沿箭嘴：每步物料形態',[
 ['1–3 收集分類','舊樽入箱→貨車運送→中心分選。'],['4–6 壓碎造粒','合格樽壓塊→碎洗→塑膠粒。'],['7–8 原料','加熱顆粒成原料，再捆存。'],['9 產品','多種新產品；新樽可再次入箱。'],
 ],'每個中間狀態不同；壓塊不是塑膠粒，塑膠粒不是終產品。'),sequence('兩個分支：拒收與有限循環',[
 ['第 3 步','不合適物件被拒收，未展示後續去向。'],['主線','只有 accepted bottles 進入壓塊及再加工。'],['第 9 步','新產品包含新樽及其他商品。'],['回圈','圖示新樽可回到回收箱；不能泛化至所有商品。'],
 ],'圖沒有保證每件成品都會被再次回收。')];
const transfers=[
 transfer('另一圖顯示舊容器經回收後製成新產品。','哪句引言交代原料與成品？',['流程圖展示舊塑膠樽如何回收並變成新貨品。','流程圖比較不同城市的塑膠樽售價。','流程以成品鉛筆變回石油為主。','圖只顯示消費者買樽。'],['回收原料與成品準確。','不是價格。','沒有此路徑。','有九步。'],[0],'原文 bottles recycled and converted into new goods。'),
 transfer('圖有 1–9，由棄樽至新產品。','哪句概覽正確？',['程序有九個主要階段，從舊樽棄置開始，到製成多種商品為止。','程序只有一個步驟。','九個標號代表九種產品。','程序由成品先回到未用塑膠。'],['步數、起終點均對圖。','圖有九步。','終產品不等於步數。','方向倒置。'],[1],'原文 nine stages，disposal→end products。'),
 transfer('末步有新樽，也有 T 恤、袋和鉛筆。','哪句對回圈的說法不過度？',['主要流程單向；部分新樽可能再次回到同類回收線。','每件 T 恤和鉛筆必定重新變成塑膠樽。','所有末端產品都不能再利用。','原樽從未經過分類。'],['限定 some items，與新樽回圈一致。','圖未畫其他產品走同一線。','新樽可回收。','中心有分類。'],[2],'原文 largely linear；some new bottles re-enter loop。'),
 transfer('第 1 步畫人把舊樽放入回收箱。','哪句先介紹正確動作？',['一開始，消費者把用過的塑膠樽放進專用回收箱。','一開始，消費者把塑膠粒織成布。','一開始，貨車把新樽送到商店。','一開始，工廠把原料裝成捆。'],['首步物件和動作均正確。','造粒較後。','貨車接第二步。','捆存在後段。'],[3],'原文 consumers place discarded bottles in recycling bins。'),
 transfer('回收箱裝有舊樽，下一圖是收集車。','哪句代詞指代和目的地正確？',['收集車清空這些回收箱，並將廢物運往回收中心。','這些回收箱指塑膠粒。','收集車直接送往衣物洗衣房。','車輛在產品做好後才首次接觸舊樽。'],['These containers 回指回收箱。','塑膠粒尚未形成。','目的地是中心。','收集在第二步。'],[4],'原文 containers emptied by truck→recycling centre。'),
 transfer('回收中心輸送帶上有勾選和叉選兩邊。','哪句解釋分類？',['合適的樽被保留，不合適材料在輸送帶上被剔除。','所有樽無論材料都直接壓縮。','勾選代表完成衣服，叉選代表已製新樽。','分類在成品完成後才發生。'],['第 3 步分好 accepted/rejected。','有拒收。','圖示分類。','分類在前段。'],[5],'原文 sorted，suitable separated from rejected。'),
 transfer('分類後只有獲接納的樽進入下一步。','哪句寫出壓塊及作用？',['合格樽隨後壓成密實方塊，方便後續搬運和加工。','被拒收的樽全部直接變成 T 恤。','壓塊已是完成的食物盒。','回收箱被壓成液體燃料。'],['accepted bottles→dense blocks，仍是中間形態。','拒收後去向未畫。','仍須碎洗造粒。','對象不是回收箱。'],[6],'原文 accepted bottles compressed into dense blocks。'),
 transfer('壓好的塊進 Crushing，碎片後有 Washing。','哪句次序準確？',['壓塊先被碎成小片，再清洗去雜質。','先製新樽，再壓碎舊樽。','先洗完成 T 恤，才製塑膠粒。','壓塊直接成原料，無清洗。'],['碎→洗是圖中次序。','順序倒置。','對象錯。','圖標 Washing。'],[7],'原文 blocks crushed into fragments，washed。'),
 transfer('清洗後小片送進造粒機。','哪句說出中間產物？',['乾淨小片進機器後成為塑膠粒。','清洗後直接成為成衣。','塑膠粒在回收箱內自然生成。','造粒步驟把小片變成水。'],['第 6 步產物為 pellets。','尚有加熱及製造。','需要機器。','產物不是水。'],[8],'原文 cleaned pieces→machine→plastic pellets。'),
 transfer('塑膠粒之後受熱，原料堆成捆。','哪句保持加熱及存放的順序？',['其後塑膠粒加熱成原料，並以大捆形式存放。','先存放衣服，再收集舊樽。','加熱使塑膠粒變回回收箱。','塑膠粒已是新食品盒，無須後續加工。'],['第 7 加熱、第 8 原料成捆。','順序錯。','產物錯。','仍有製品步驟。'],[9],'原文 pellets heated→raw material stored bundles。'),
 transfer('第 9 步畫五種成品。','哪句列舉圖示產品？',['最後原料可製新樽、食物盒、T 恤、購物袋和鉛筆。','最後只能製新樽，其他四項不存在。','最後成品仍只有未清洗的碎片。','最後一步是第一次收集回收箱。'],['圖示五類產品均列全。','另有四類。','碎片在第 5 步。','收集在前。'],[10],'原文 products including new bottles, containers, T-shirts, bags, pencils。'),
];
const balancedTransferOptions=[
  ['舊塑膠樽經回收處理，再製成不同的新產品。','舊塑膠樽經價格比較，再製成不同的新產品。','新製的鉛筆經回收處理，再變回原油。','舊塑膠樽只由消費者購買，沒有再加工。'],
  ['九步從棄置舊樽開始，以製成多種商品結束。','九步從製成商品開始，以棄置舊樽結束。','九步只表示九種成品，沒有任何加工階段。','九步從未用塑膠開始，最後回到原料。'],
  ['主線單向，部分新樽日後可再次進入回收線。','主線單向，每件鉛筆日後必會變成新膠樽。','主線單向，所有新樽日後都不能再回收。','主線單向，所有舊樽都不用分類便進加工。'],
  ['消費者先把用過的塑膠樽放進回收箱。','消費者先把製好的塑膠粒放進回收箱。','消費者先把未製的衣物纖維放進回收箱。','消費者先把新產品送進工廠加工設備。'],
  ['收集車清空回收箱，把舊樽運到回收中心。','收集車清空造粒機，把塑膠粒運到回收中心。','收集車清空回收箱，把舊樽運到洗衣房。','收集車在成品完成後才首次運送舊樽。'],
  ['中心保留合適舊樽，把不合適材料剔除。','中心壓縮所有舊樽，沒有剔除任何材料。','中心保留成品衣物，把新塑膠樽剔除。','中心在產品完成後，才開始分類舊樽。'],
  ['合格舊樽先壓成密實方塊，方便後續加工。','被剔除的舊樽先壓成方塊，再製成衣物。','合格舊樽壓成方塊後，已是完成的食盒。','收集的回收箱先壓成方塊，形成液體燃料。'],
  ['壓塊先被碎成小片，之後清洗去除雜質。','壓塊先製成新樽，之後才碎成舊樽。','成品衣物先被清洗，之後才製成塑膠粒。','壓塊直接成為原料，完全不用碎洗處理。'],
  ['乾淨的塑膠小片經機器處理，變成塑膠粒。','乾淨的塑膠小片不用加工，直接變成衣服。','塑膠粒在回收箱中自然生成，無需機器。','乾淨的塑膠小片經機器處理，變成清水。'],
  ['塑膠粒受熱變成原料，之後以大捆存放。','塑膠粒先成為衣服，之後才收集舊樽。','塑膠粒受熱變成回收箱，之後以大捆存放。','塑膠粒受熱已是食盒，之後無須再加工。'],
  ['原料最後製成新樽、食盒、衣物、袋和鉛筆。','原料最後只能製成新樽，其他產品均未畫出。','原料最後仍是未清洗碎片，沒有任何成品。','原料最後回到第一步，重新收集舊回收箱。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-process-diagram:4',meta:{topic:'塑膠樽回收九步及新樽有限循環',summary:'舊樽入箱→貨車→中心分類→合格樽壓塊→碎洗→造粒→加熱原料→捆存→五類新產品。主線單向，部分新樽可再次回收；拒收品未進主線。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
