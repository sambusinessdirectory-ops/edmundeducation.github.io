// Task 1 Process Diagram 1: nine stages from bamboo planting to fabric and clothing.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按圖中的 1–9 箭嘴排序，特別分清纖維、紗線、布料。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how bamboo is made into fabric and then clothes.',
 'Overall, making the fabric follows nine steps in one direction. It starts when bamboo is planted in spring and ends with clothes.',
 'First, bamboo is grown and prepared by machines. Later, its fibres are made into yarn and cloth.',
 'First, bamboo is planted in spring. It grows until autumn, when workers collect it.',
 'After the bamboo is collected, its stems are cut into thin strips.',
 'The strips are then crushed to make a wet pulp.',
 'Next, the pulp goes through a filter, which separates the long fibres from the liquid.',
 'Next, water and amine oxide are added to make the fibres soft.',
 'After that treatment, the fibres are spun into yarn.',
 'Next, the yarn is woven to make bamboo fabric.',
 'Finally, the fabric is used to make everyday clothes, including socks and T-shirts.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['converted into','made into','轉製成'],['ultimately','then','最後'],['clothing items','clothes','衣物']),
 v(['linear','one direction','單向線性'],['nine-stage','nine steps','九個步驟'],['cultivation','planted','栽種'],['finished garments','clothes','成衣']),
 v(['early stages','First','早期階段'],['mechanically preparing','prepared by machines','機械處理'],['extracted fibres','fibres','提取出的纖維'],['woven cloth','cloth','織布']),
 v(['At the outset','First','開始時'],['mature','grows','成熟'],['harvested','collect','收割']),
 v(['Once the crop has been collected','After the bamboo is collected','收割後'],['stems','stems','竹莖'],['narrow strips','thin strips','細條']),
 v(['crushed','crushed','壓碎'],['reduced to a liquid pulp','make a wet pulp','變成液狀竹漿']),
 v(['Following this','Next','然後'],['filtered','goes through a filter','過濾'],['separate','separates','分離'],['remaining liquid','liquid','餘下液體']),
 v(['extracted fibres','fibres','取出的纖維'],['softened','make the fibres soft','軟化'],['through the addition of','are added','藉加入'],['amine oxide','amine oxide','氧化胺']),
 v(['After they have been treated in this way','After that treatment','經此處理後'],['spun','spun','紡成']),
 v(['subsequently','Next','其後'],['woven','woven','織成'],['to produce','to make','以製成']),
 v(['Finally','Finally','最後'],['made into','used to make','製成'],['everyday clothing products','everyday clothes','日常衣物'],['such as','including','例如']),
];
const structures=[
 f('The diagram illustrates the process by which flax is converted into fabric and, ultimately, clothing items.','在引言用 by which 交代原料與兩層終產品',[1,3,9],{formula:'The diagram illustrates the process by which [原料] is converted into [中間成品] and, ultimately, [終產品]',meaning:'竹子經加工成布料，最後做成襪子、T 恤等衣物。',usage:'fabric 是第 8 步產物，clothing 是第 9 步；不可把兩者倒置。',parts:[link('The diagram illustrates the process by which'),slot(' bamboo','原料'),link(' is converted into'),slot(' fabric','中間成品'),link(' and, ultimately,'),slot(' clothing items','終產品'),link('.')]}),
 f('Overall, this is a linear, nine-stage manufacturing process, beginning with the cultivation of flax plants in spring and ending with finished garments.','概覽流程性質、九步、起點和終點',[0,3,9],{formula:'Overall, this is a linear, nine-stage manufacturing process, beginning with [第一步] and ending with [最後產品]',meaning:'圖中 1–9 單向流程：春季種竹，秋收，再加工，最後成衣。',usage:'九步按圖中標號計數；不是九種材料或可循環返回種植。',parts:[link('Overall, this is a linear, nine-stage manufacturing process, beginning with'),slot(' the cultivation of bamboo plants in spring','第一步'),link(' and ending with'),slot(' finished garments','最後產品'),link('.')]}),
 f('The early stages are concerned with growing and mechanically preparing the flax, while the later stages turn the extracted fibres into yarn and woven cloth.','以 early/later 分組農業與後段紡織加工',[0,3,8],{formula:'The early stages are concerned with growing and mechanically preparing [原料], while the later stages turn the extracted fibres into yarn and woven cloth',meaning:'先栽種、收割、切碎、壓漿、過濾；後軟化纖維、紡紗、織布、製衣。',usage:'fibres→yarn→cloth 是三種不同加工狀態；不能把纖維直接說成布料。',parts:[link('The early stages are concerned with growing and mechanically preparing'),slot(' the bamboo','原料'),link(', while the later stages turn the extracted fibres into yarn and woven cloth.')]}),
 f('At the outset, flax plants are planted in spring and left to mature until autumn, when they are harvested.','用 until/when 連接種植、成熟及收割季節',[0,4,8],{formula:'At the outset, [植物] are planted in spring and left to mature until autumn, when they are harvested',meaning:'春季種植竹子；秋季收割；圖中沒有給確切月份或產量。',usage:'until autumn 是等待成熟的時間，when 回指秋季，不是春季收割。',parts:[link('At the outset,'),slot(' bamboo plants','植物'),link(' are planted in spring and left to mature until autumn, when they are harvested.')]}),
 f('Once the crop has been collected, the stems are cut into thin strips.','用 Once 標示收割後緊接的切條步驟',[0,3,6],{formula:'Once the crop has been collected, the stems are cut into [條形]',meaning:'第 2 步收割後，第 3 步將竹莖切成細條。',usage:'stems 是竹莖；此時仍未壓成漿，也未提取纖維。',parts:[link('Once the crop has been collected, the stems are cut into'),slot(' narrow strips','條形'),link('.')]}),
 f('These strips are then crushed so that they are reduced to a soft pulp.','以 These 回指竹條，so that 交代壓碎所得',[0,4,7],{formula:'These strips are then crushed so that they are reduced to [產物]',meaning:'第 4 步把切好的竹條壓成液狀漿；接下來才過濾。',usage:'These strips 只能回指前句切出的條；液狀漿不是最終紗線。',parts:[link('These strips are then crushed so that they are reduced to'),slot(' a liquid pulp','產物'),link('.')]}),
 f('Following this, the pulp is filtered in order to separate the long fibres from the remaining water.','用 in order to 交代過濾目的與分離物',[0,4,8],{formula:'Following this, the pulp is filtered in order to separate [保留物] from [分開物]',meaning:'第 5 步過濾液漿，把長纖維與液體分開；後續軟化的是纖維。',usage:'先 crush 後 filter，不能把過濾寫在壓碎前。',parts:[link('Following this, the pulp is filtered in order to separate'),slot(' the long fibres','保留物'),link(' from'),slot(' the remaining liquid','分開物'),link('.')]}),
 f('In the next stage, the extracted fibres are softened through the addition of water and glycerol.','以 through the addition of 交代纖維軟化時加入的材料',[0,4,9],{formula:'In the next stage, the extracted fibres are softened through the addition of [添加物]',meaning:'第 6 步向纖維加入水與 amine oxide；圖未標示比例。',usage:'添加物是 water and amine oxide；不能把圖中未顯示的漂白或染色加入流程。',parts:[link('In the next stage, the extracted fibres are softened through the addition of'),slot(' water and amine oxide','添加物'),link('.')]}),
 f('After they have been treated in this way, they are spun into thread.','先以前句處理承接，再交代纖維紡成紗',[0,4,9],{formula:'After they have been treated in this way, they are spun into [紡製品]',meaning:'軟化後的纖維第 7 步紡成 yarn，尚未織成 fabric。',usage:'they 回指纖維，不是水或氧化胺；順序是 soften→spin。',parts:[link('After they have been treated in this way, they are spun into'),slot(' yarn','紡製品'),link('.')]}),
 f('The yarn is subsequently woven to produce a broad sheet of cloth.','用 subsequently 標示 yarn→fabric 的織布步驟',[0,4,10],{formula:'The yarn is subsequently woven to produce [織物]',meaning:'第 8 步將紗線織成 bamboo fabric；下一步才做衣服。',usage:'woven 是織造，與上一句 spun 紡紗不同。',parts:[link('The yarn is subsequently woven to produce'),slot(' bamboo fabric','織物'),link('.')]}),
 f('Finally, this fabric is made into everyday clothing products, such as scarves and shirts.','末步用 this fabric 回指布料，再列圖中成衣例子',[0,4,8],{formula:'Finally, this fabric is made into everyday clothing products, such as [衣物例子]',meaning:'第 9 步由布料製成 socks 與 T-shirts。',usage:'such as 表例子，圖示只有襪子與 T 恤；不要說流程只可能製成這兩類衣物。',parts:[link('Finally, this fabric is made into everyday clothing products, such as'),slot(' socks and T-shirts','衣物例子'),link('.')]}),
];
const intro=[quiz('這幅流程圖屬於甚麼結構？',['九步單向製造流程：春季種竹至製成衣物','每年回到種植的閉環循環','不同城市出口量比較','竹子與棉花的市場份額'],'九個標號由 plant 到 clothes 單向連接。'),{type:'multi',prompt:'哪兩項適合放進概覽？',detail:'選兩項，再按「確認」。',options:['九步由春季種竹開始，以成衣結束','前段種植與機械處理，後段把纖維紡成紗、織成布','圖顯示同一衣物重複回收九次','布料先織成衣服，之後才紡紗'],correct:[0,1],why:'概覽交代起終點、流程性質及主要階段。'}];
const route=[sequence('按範文排列四段流程報告',[
 ['引言','竹子逐步成布料，最終製成衣物。'],
 ['概覽','九步線性流程；先栽種和處理竹，後纖維→紗→布→成衣。'],
 ['前段細節','春種秋收；切細條、壓液漿、過濾出長纖維。'],
 ['後段細節','水與氧化胺軟化、紡紗、織布，最後製襪子及 T 恤。'],
],'圖中的 stage 1–9 與英文句數不同；依標號數步驟，依句子記敘。')];
const evidence=[
 quiz('竹子在甚麼季節種、收？',['春季種，秋季收','秋季種，春季收','夏季種與收','圖未給任何季節'],'標示 Plant bamboo (Spring)、Harvest (Autumn)。'),
 quiz('收割後首先如何處理竹莖？',['切成細條','直接縫成 T 恤','先織成布','送入成衣店'],'第 3 步 Cut into strips。'),
 quiz('壓碎竹條的產物是甚麼？',['液狀竹漿','已完成的衣物','紗線球','乾燥竹片'],'第 4 步 Crush strips to make liquid pulp。'),
 quiz('過濾步驟的目的？',['把長纖維與液體分開','把衣服分成顏色','把成衣變回竹苗','將纖維編成襪子'],'第 5 步 Filter：separate long fibres from liquid。'),
 quiz('哪兩種物料用來軟化纖維？',['水與氧化胺','糖與鹽','石灰石與黏土','染料與汽油'],'第 6 步 Soften fibres：add water and amine oxide。'),
 quiz('軟化後的三個形態依次是甚麼？',['纖維→紗線→竹布','竹布→竹條→紗線','紗線→纖維→液漿','成衣→紗線→竹苗'],'第 7 步 spin yarn；第 8 步 weave fabric。'),
 quiz('圖中末端成衣例子？',['襪子與 T 恤','外套與鞋子','帽子與手套','只有竹籃'],'第 9 步圖示 socks、T-shirt。'),
];
const logic=[sequence('九個圖示步驟：物料狀態如何變',[
 ['1–2 栽種','春季種竹、秋季收割。'],['3–5 提取','竹莖切條→壓成液漿→過濾留長纖維。'],['6–8 紡織','加水和氧化胺軟化纖維→紡成紗→織成布。'],['9 成衣','竹布製成襪子、T 恤。'],
 ],'fibres、yarn、fabric 是不同階段，排序不可顛倒。'),sequence('流程語法：承接詞與指代都要對圖',[
 ['Once the crop…','前句秋收之後，下一步才切條。'],['These strips…','These 回指第 3 步竹條，壓碎後變漿。'],['After they…','they 回指第 6 步軟化後的纖維。'],['Finally, this fabric…','this fabric 回指第 8 步織出的布。'],
 ],'每個指代要能在相鄰步驟找到唯一合理對象。')];
const transfers=[
 transfer('另一圖展示植物原料先製成布料，再做成衣服。','哪句引言清楚交代兩個產物層次？',['流程圖展示植物原料如何先轉成布料，最終製成衣物。','流程圖只比較兩個城市的衣物價格。','流程由衣服變回植物種子。','流程沒有任何製造成品。'],['先中間品，再終產品。','不是價格圖。','方向相反。','有兩層產物。'],[0],'原文 bamboo→fabric→clothing。'),
 transfer('圖標號 1–9，由春季種竹至衣服完成。','哪句概覽同時報步數與起終點？',['這是九步單向流程，由春季種竹開始，以成衣結束。','這是九個不同國家的服裝銷售額。','流程只有種植與收割兩步。','成衣先出現，之後才栽種。'],['步數、性質、起終點均準。','不是國家比較。','圖有九步。','方向相反。'],[1],'原文 linear nine-stage，spring planting→finished garments。'),
 transfer('前段處理竹料，後段把纖維變成紗與布。','哪句正確切分階段？',['早期種植並機械處理竹子，後期把纖維紡紗、織布。','早期先織布，後期才種竹。','整個流程只涉及服裝零售。','纖維與布料在圖中始終是同一狀態。'],['分組與物料狀態正確。','順序倒置。','有製造步驟。','纖維需加工。'],[2],'原文 early growing/preparing，later fibres→yarn→cloth。'),
 transfer('竹子春季栽種，到秋季才收割。','哪句時間先後準確？',['春季種下竹子，待其成長至秋季後收割。','秋季種竹，春季收割。','竹子在同一天種植和收割。','圖標示冬季種植，並無秋收。'],['until autumn／when harvested 的指向正確。','季節相反。','圖跨春秋。','標示春種秋收。'],[3],'原文 spring planting，autumn harvest。'),
 transfer('第 2 步收割，第 3 步切竹莖。','哪句承接不跳步？',['竹子收割後，竹莖被切成細條。','竹莖收割前已織成布。','收割後直接成為 T 恤。','收割後立即回到種苗。'],['Once 連接圖中相鄰兩步。','織布在後。','仍需壓漿、過濾等。','不循環。'],[4],'原文 Once crop collected，stems cut into narrow strips。'),
 transfer('切好的竹條進壓碎機，成為液漿。','哪句 These 指代清楚？',['這些竹條再被壓碎，成為液狀竹漿。','這些成衣再被壓碎，成為紗線。','竹條先織成布，再被收割。','壓碎產物是已完成的 T 恤。'],['These 回指上一句的竹條。','成衣尚未製造。','順序錯。','液漿是中間品。'],[5],'原文 These strips crushed→liquid pulp。'),
 transfer('第 4 步有液漿，第 5 步分離長纖維與液體。','哪句說明過濾目的？',['接着過濾竹漿，把長纖維與餘下液體分開。','先織成布再把布過濾成液漿。','過濾的目的是製成鞋子。','長纖維與液體是最後成衣。'],['步驟順序及分離兩物正確。','織布在後。','目的不符。','二者是中間物。'],[6],'原文 pulp filtered to separate long fibres from liquid。'),
 transfer('第 6 步在纖維中加入水和氧化胺。','哪句保留添加物及用途？',['下一步加入水與氧化胺，使提取出的纖維軟化。','下一步加入石油，使衣服變硬。','水和氧化胺在種植前用於包裝。','圖只顯示染色，沒有軟化。'],['兩種添加物和軟化動作對圖。','沒有石油。','發生在過濾後。','標示 Soften fibres。'],[7],'原文 softened through water and amine oxide。'),
 transfer('纖維經軟化後才進入紡紗步驟。','哪句 they 的對象與產物正確？',['經處理的纖維隨後紡成紗線，尚未成為布料。','加入的水被紡成襪子。','液漿織成衣服之後才軟化。','紗線先被種在田裏。'],['they 回指纖維，spin 產物是 yarn。','水不是紡紗物。','順序倒置。','紗線是製造品。'],[8],'原文 treated fibres spun into yarn。'),
 transfer('第 7 步得到紗，第 8 步才製成布。','哪句區分 spin 和 weave？',['紗線其後被織成竹布。','竹布其後被紡成竹苗。','纖維一過濾便直接成襪子。','織布步驟在收割之前。'],['weave 對 yarn→fabric。','方向和工序錯。','跳過三步。','順序錯。'],[9],'原文 yarn subsequently woven→bamboo fabric。'),
 transfer('圖末端畫襪子與 T 恤。','哪句把例子接在正確末步？',['最後用竹布製成日常衣物，例如襪子和 T 恤。','最初將襪子切成竹條。','衣服先製成，然後過濾竹漿。','圖只顯示紗線，沒有成衣。'],['this fabric 回指剛織出的布；衣物是末端。','起點是竹子。','順序錯。','圖有成衣。'],[10],'原文 Finally fabric→clothing such as socks and T-shirts。'),
];
const balancedTransferOptions=[
  ['植物原料先製成布料，再由布料製成衣物。','植物原料先製成衣物，再由衣物製成布料。','布料先變回植物原料，再製成新的衣物。','植物原料只變成布料，圖中沒有成衣。'],
  ['九步由春季種竹開始，最後以製成衣物結束。','九步由製成衣物開始，最後以春季種竹結束。','流程僅有春季種竹與秋季收割，合共兩步。','九步比較不同國家衣物價格，並無製造流程。'],
  ['前期處理竹料，後期把纖維紡紗並織成布。','前期把纖維織布，後期才種植與處理竹料。','前期處理服裝零售，後期比較各地的銷量。','前期處理竹料，後期直接跳到製成襪子。'],
  ['竹子春季種下，長到秋季才予以收割。','竹子秋季種下，長到春季才予以收割。','竹子春季種下，當日便立即予以收割。','竹子冬季種下，圖中沒有秋季收割。'],
  ['竹子收割後，竹莖接着被切成細條。','竹莖先織成布，之後才把竹子收割。','竹子收割後，竹莖立即變成衣服。','竹子收割後，竹莖又變回新種苗。'],
  ['切好的竹條被壓碎，形成液狀竹漿。','做好的成衣被壓碎，形成液狀竹漿。','切好的竹條被壓碎，立即形成襪子。','切好的竹條被壓碎，形成成熟種苗。'],
  ['過濾液漿，把長纖維與剩餘液體分開。','先織成布，再把布料與液體一起過濾。','過濾液漿，把長纖維與成衣分開。','過濾液漿，把竹苗與成熟竹子分開。'],
  ['加入水和氧化胺，讓提取的纖維軟化。','加入水和石油，讓提取的纖維變硬。','加入水和氧化胺，讓竹子重新發芽。','加入水和氧化胺，立即製成襪子。'],
  ['軟化後的纖維接着被紡成紗線，尚非布料。','軟化後的纖維接着被織成襪子，尚非紗線。','過濾出的液體接着被紡成紗線，尚非布料。','軟化後的纖維接着被種進土裏，成為竹苗。'],
  ['紡出的紗線隨後被織成竹布，才可製衣。','織好的竹布隨後被紡成竹苗，才可製衣。','過濾出的纖維立即被織成襪子，省去紡紗。','紡出的紗線在收割竹子之前已織成布。'],
  ['最後用竹布製成襪子及 T 恤等衣物。','最初用襪子製成竹條及 T 恤等衣物。','最後用竹漿製成種苗及成熟竹子。','最後只得到紗線，沒有襪子或 T 恤。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-process-diagram:1',meta:{topic:'竹子製布及成衣的九步製造流程',summary:'春季種竹→秋收→切條→壓液漿→過濾長纖維→加水與氧化胺軟化→紡紗→織布→襪子與 T 恤。守住九步順序與 fibres／yarn／fabric 三種狀態。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
