// Task 1 Mixed Charts 5 uses the same source chart as Mixed Charts 4, but different narration.
import base from './task1-mixed-charts-4.mjs';
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先比較出口金額，再對照表格增幅；按這篇範文的段落排序。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The bar chart shows the export money from five product groups in 2015 and 2016. The table shows each group’s percentage change between those years.',
 'Overall, export money went up in four of the five groups. Only gems and jewellery fell.',
 'Petroleum products earned the most in both years. Textiles began with the lowest amount but grew by the highest percentage.',
 'In 2015, petroleum products earned about $61 billion, a little more than engineered goods, which earned about $58 billion.',
 'By 2016, both groups had risen, to about $63 billion and $62 billion in that order.',
 'Petroleum still earned more, but engineered goods got closer after an 8.5% rise; petroleum rose by only 3%.',
 'The other groups earned less than these two.',
 'Gems and jewellery fell from about $43 billion to about $41 billion. The table reports a 5.18% fall.',
 'Agricultural products barely changed, rising by only 0.81% from a little over $30 billion.',
 'Textiles, however, rose strongly from about $26 billion to $31 billion; the table reports 15.24% growth, the highest rate.',
];
const vocabulary=[
 v(['compares','shows','顯示／比較'],['export earnings','export money','出口收入'],['product categories','product groups','產品類別'],['percentage change','percentage change','百分比變動']),
 v(['export revenues','export money','出口收入'],['increased','went up','上升'],['only sector to decline','Only gems and jewellery fell','唯一下降類']),
 v(['highest-earning export','earned the most','最高收入出口品'],['strongest percentage growth','grew by the highest percentage','百分比升幅最大'],['lowest base','lowest amount','最低基數']),
 v(['generated','earned','帶來'],['slightly more than','a little more than','略高於'],['stood at roughly','earned about','約為']),
 v(['By 2016','By 2016','到二〇一六年'],['had risen','had risen','已上升'],['approximately','about','大約'],['respectively','in that order','依次分別']),
 v(['still led the chart','still earned more','仍居首'],['narrowed the gap','got closer','收窄差距'],['more modest','only','較小']),
 v(['remaining categories','other groups','其餘類別'],['earned less','earned less','收入較低']),
 v(['fell from','fell from','由某值下跌'],['representing a decline','reports a 5.18% fall','表列跌幅']),
 v(['changed very little','barely changed','變化甚少'],['edging up','rising','微升'],['just over','a little over','略高於']),
 v(['By contrast','however','相比之下'],['climbed markedly','rose strongly','大幅上升'],['fastest-growing category','highest rate','最高增長率']),
];
const structures=[
 f('The bar chart compares the export earnings of six product categories in one country in 2015 and 2016, while the table indicates the percentage change in each category over the same period.','以 while 交代金額柱圖與百分比變動表',[1,3,7],{formula:'The bar chart compares the export earnings of [類別數] product categories in one country in [兩年], while the table indicates the percentage change in each category over the same period',meaning:'五類出口在 2015／2016 的金額由柱圖讀，增跌百分率由表讀。',usage:'$ billions 為金額；percentage change 是兩年變動率，兩者不能互換。',parts:[link('The bar chart compares the export earnings of'),slot(' five','類別數'),link(' product categories in one country in'),slot(' 2015 and 2016','兩年'),link(', while the table indicates the percentage change in each category over the same period.')]}),
 f('Overall, export revenues increased in three of the five categories, with gems and jewellery being the only sector to decline.','概括多數上升與唯一下降類',[0,4,8],{formula:'Overall, export revenues increased in [上升數] of the five categories, with [下降類] being the only sector to decline',meaning:'四類升，gems and jewellery 唯一跌。',usage:'概覽只報增跌方向；此句並無給總出口收入的確切變化。',parts:[link('Overall, export revenues increased in'),slot(' four','上升數'),link(' of the five categories, with'),slot(' gems and jewellery','下降類'),link(' being the only sector to decline.')]}),
 f('Processed foods remained the highest-earning export in both years, while handicrafts recorded the strongest percentage growth despite starting from the lowest base.','對照最高出口金額與最高百分比增長',[0,3,9],{formula:'[金額最大類] remained the highest-earning export in both years, while [增幅最大類] recorded the strongest percentage growth despite starting from the lowest base',meaning:'petroleum 兩年金額最高；textiles 2015 金額最低，表列 +15.24% 最快。',usage:'strongest percentage growth 不等於新增美元最多；評比依據不同。',parts:[slot('Petroleum products','金額最大類'),link(' remained the highest-earning export in both years, while'),slot(' textiles','增幅最大類'),link(' recorded the strongest percentage growth despite starting from the lowest base.')]}),
 f('In 2015, petroleum products generated about $60 billion, slightly more than engineered goods, which stood at roughly $57 billion.','在同一年報兩個最大金額並指出小差距',[0,5,8],{formula:'In 2015, petroleum products generated about [石油金額], slightly more than engineered goods, which stood at roughly [工程金額]',meaning:'2015 石油約 $61bn、工程約 $58bn。',usage:'兩個金額從柱高作約讀值，不拿來精算表格增幅。',parts:[link('In 2015, petroleum products generated about'),slot(' $61 billion','石油金額'),link(', slightly more than engineered goods, which stood at roughly'),slot(' $58 billion','工程金額'),link('.')]}),
 f('By 2016, both categories had risen, to approximately $65 billion and $64 billion respectively.','以 respectively 沿用上一句石油、工程的順序',[0,3,9],{formula:'By 2016, both categories had risen, to approximately [前者額] and [後者額] respectively',meaning:'2016 petroleum 約 $63bn，engineered 約 $62bn，依次對應。',usage:'respectively 要回看上一句的類別順序；不可將 63 配給工程。',parts:[link('By 2016, both categories had risen, to approximately'),slot(' $63 billion','前者額'),link(' and'),slot(' $62 billion','後者額'),link(' respectively.')]}),
 f('Although petroleum products still led the chart, engineered goods narrowed the gap after an 8% increase, compared with a more modest 4% rise in petroleum exports.','先承認石油仍領先，再用不同升幅說明差距收窄',[0,3,8],{formula:'Although petroleum products still led the chart, engineered goods narrowed the gap after an [工程升幅] increase, compared with a more modest [石油升幅] rise in petroleum exports',meaning:'2015 約 61 對 58（差約 3bn），2016 約 63 對 62（差約 1bn）；表列工程 +8.5%、石油 +3%。',usage:'narrowed the gap 指金額差縮小；工程仍未超過石油。',parts:[link('Although petroleum products still led the chart, engineered goods narrowed the gap after an'),slot(' 8.5%','工程升幅'),link(' increase, compared with a more modest'),slot(' 3%','石油升幅'),link(' rise in petroleum exports.')]}),
 f('The other sectors earned less.','用簡短過渡句由前兩大類移至其餘三類',[0,4,7],{formula:'The remaining categories earned less',meaning:'其餘 gems／agriculture／textiles 的柱高均低於 petroleum 和 engineered。',usage:'less 是相對前述兩大類的出口金額，不表示每個其餘類別都逐年下跌。',parts:[link('The'),slot(' remaining categories','比較對象'),link(' earned less.')]}),
 f('Gems and jewellery fell from around $45 billion to about $42 billion, representing a decline of 6%.','用 from/to 與表列百分率描述唯一下降類',[0,3,9],{formula:'Gems and jewellery fell from around [起額] to about [終額], representing a decline of [跌幅]',meaning:'珠寶約 $43bn→$41bn；表列 −5.18%。',usage:'金額是柱圖約數，率是表格數值；不可由圓整的金額倒算精確百分率。',parts:[link('Gems and jewellery fell from around'),slot(' $43 billion','起額'),link(' to about'),slot(' $41 billion','終額'),link(', representing a decline of'),slot(' 5.18%','跌幅'),link('.')]}),
 f('Agricultural products changed very little, edging up by only 1% from just over $30 billion.','用 changed very little 與表列小增幅說明低變化類',[0,3,7],{formula:'Agricultural products changed very little, edging up by only [小升幅] from just over [起額]',meaning:'農產品約 $30bn 出頭；表列 +0.81%；柱圖兩年仍約 $31bn。',usage:'兩柱約數近似不代表精確增幅為零。',parts:[link('Agricultural products changed very little, edging up by only'),slot(' 0.81%','小升幅'),link(' from just over'),slot(' $30 billion','起額'),link('.')]}),
 f('By contrast, textiles climbed markedly from approximately $25 billion to $30 billion, making it the fastest-growing category at 16%.','以對照句突出最低基數類別的最高表列增幅',[0,3,8],{formula:'By contrast, textiles climbed markedly from approximately [起額] to [終額], making it the fastest-growing category at [表列升幅]',meaning:'紡織品約 $26bn→$31bn，表列增長 15.24%，五類最高。',usage:'金額粗略、百分率精確；不把 26→31 當成精確運算式。',parts:[link('By contrast, textiles climbed markedly from approximately'),slot(' $26 billion','起額'),link(' to'),slot(' $31 billion','終額'),link(', making it the fastest-growing category at'),slot(' 15.24%','表列升幅'),link('.')]}),
];
const route=[sequence('依這篇範文排序四段',[
 ['兩圖引言','五類 2015／2016 出口金額柱圖，及同期變動率表。'],
 ['總覽','四類上升、珠寶下降；石油金額最高、紡織品增長率最高。'],
 ['兩大金額類','石油與工程：先報 2015 約 61／58，再報 2016 約 63／62，指出差距收窄及 3／8.5% 增幅。'],
 ['其餘三類','珠寶約 43→41、農產品微升、紡織品約 26→31；各自對照表列變動率。'],
],'這篇範文把珠寶留到末段；不能直接沿用另一版本的段落分組。')];
const transfers=[
 transfer('同一份資料：柱圖給五類出口值，表格給兩年變動率。','哪句引言分清量度？',['柱圖比較五類產品在兩年的出口收入，表格列各類同期的百分比變化。','柱圖比較產品件數，表格比較員工薪酬。','兩圖都只給出口目的地。','表格給年份總人口而柱圖給天氣。'],['兩圖量度與時間完整。','主題和單位錯。','沒有目的地。','沒有這些資料。'],[0],'原文 bar chart earnings，table percentage change。'),
 transfer('五類中只有珠寶下跌。','哪句總覽方向準確？',['四類出口收入增加，寶石與珠寶是唯一下降類別。','珠寶是唯一上升類別。','五類都下降。','五類都完全不變。'],['四升一跌準確。','方向相反。','其餘四類升。','表格顯示變化。'],[1],'原文 four of five increased，gems/jewellery only decline。'),
 transfer('石油出口金額最高；紡織品起點最低但表列增長率最快。','哪句不混淆金額與變動率？',['石油兩年收入最高，紡織品從最低起點錄得最強百分比增長。','紡織品兩年收入都是最高。','石油表列增幅 15.24% 最高。','收入額高的類別必然增長率高。'],['兩種排名各按其指標。','紡織品起點最低。','石油只有 +3%。','不能這樣推論。'],[2],'原文 petroleum highest-earning，textiles strongest percentage growth。'),
 transfer('2015 石油約 $61bn，工程產品約 $58bn。','哪句保留小幅金額差？',['石油收入略高於工程產品，約 $61bn 對 $58bn。','石油比工程產品多約 $58bn。','工程產品約 $61bn，石油約 $58bn。','兩個數字是百分比變動。'],['差約 $3bn、柱圖單位正確。','把後者值當差額。','數值反轉。','柱圖是金額。'],[3],'原文 petroleum 61，engineered 58。'),
 transfer('2016 兩類依次約 $63bn 和 $62bn。','哪句把 respectively 配準？',['石油約 $63bn，工程產品約 $62bn；兩類均高於前一年。','石油約 $62bn，工程產品約 $63bn。','兩類都跌至零。','數字代表學生人數。'],['沿用上一句石油→工程順序。','次序顛倒。','兩類皆升。','單位是 $bn。'],[4],'原文 both categories risen，63／62 respectively。'),
 transfer('工程產品增幅 8.5%，石油增幅 3%；石油仍略高。','哪句說明兩者差距收窄？',['石油仍居首，但工程產品升幅較大，故兩者收入差距縮小。','工程產品已大幅超過石油。','石油增幅 8.5%，工程只有 3%。','兩類收入差距逐年擴大。'],['領先者、相對增幅與差距均準確。','2016 石油仍約 63 對 62。','率互換。','差由約 3 縮至 1。'],[5],'原文 although petroleum led，engineered narrowed gap after 8.5% vs 3%。'),
 transfer('前段剛比較收入最高的石油與工程產品；接下來要說另外三類。','哪句過渡句準確？',['其餘類別的出口收入較低。','其餘類別每一項都在兩年間下跌。','其餘類別的增長率都低於石油。','其餘類別沒有任何出口收入。'],['less 指金額低於前兩大類。','農產品、紡織品上升。','紡織品率更高。','仍有收入。'],[6],'原文 The remaining categories earned less。'),
 transfer('珠寶柱圖約 $43bn→$41bn，表中 −5.18%。','哪句兼顧約數及跌幅？',['珠寶收入約由 $43bn 降到 $41bn，表列跌幅 5.18%。','珠寶收入由 $41bn 增到 $43bn。','珠寶跌幅為 41%。','珠寶是五類中最高收入。'],['柱圖用約數，表率照報。','方向錯。','41 是金額約數。','石油最高。'],[7],'原文 gems fell around 43→41，decline 5.18%。'),
 transfer('農產品由 $30bn 出頭小幅增加，表列 +0.81%。','哪句沒有誇大變化？',['農產品收入變化不大，只由三百億美元出頭微升 0.81%。','農產品增長率達 81%。','農產品收入下降至零。','兩年柱圖近似證明表格的 0.81% 一定錯。'],['小增幅與近似柱讀值可並存。','小數位錯。','方向錯。','圓整柱高不否定率。'],[8],'原文 agricultural products edging up only 0.81%。'),
 transfer('紡織品柱圖約 $26bn→$31bn；表中增長率 +15.24%。','哪句忠實呈現兩種精度？',['紡織品收入由約 $26bn 升至約 $31bn，表列增長率為 15.24%。','用兩個圓整金額精確計算出 15.24%。','紡織品表列跌幅是 15.24%。','2016 紡織品只值 15.24 美元。'],['金額稱約數，增長率按表格給值。','約數不能作精確倒算。','方向相反。','金額與率混淆。'],[9],'原文 textile amounts approximate；table rate 15.24%。'),
];
export default {...base,key:'task1-mixed-charts:5',meta:{topic:'五類出口：最高收入、差距收窄與增長率',summary:'同圖另一篇範文，聚焦石油與工程產品約 $61／58bn→$63／62bn 的差距收窄，再比較珠寶下降、農產品微升與紡織品表列 +15.24% 最快。金額約數與表列率分別處理。'},simple,vocabulary,structures,route,transfer:transfers};
