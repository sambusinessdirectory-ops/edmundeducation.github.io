// Task 1 Mixed Charts 4: export values ($bn) and reported percentage changes.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看兩年金額柱，再讀變動率表；以各圖原有精度報數。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The bar chart shows how much a country earned from exports in five product groups in 2015 and 2016. The table shows each group’s percentage change.',
 'Overall, export money rose in four of the five groups. Gems and jewellery were the only group to fall.',
 'Petroleum products earned the most in both years. Textiles began with the least money but grew by the largest percentage.',
 'In 2015, petroleum products earned about $61 billion, a little more than engineered goods, at about $58 billion.',
 'Both groups earned more in 2016: petroleum rose a little, by 3%, to about $63 billion; engineered goods rose more, by 8.5%, to about $62 billion.',
 'Gems and jewellery went the other way, falling from about $43 billion to about $41 billion; the table reports a 5.18% decrease.',
 'Among the groups that earned less, agricultural products barely changed, staying at about $31 billion in both years, with a 0.81% rise in the table.',
 'Textiles, however, rose strongly from about $26 billion to about $31 billion. The table reports 15.24% growth, so textiles came close to agricultural products in 2016.',
];
const vocabulary=[
 v(['compares','shows','顯示／比較'],['export earnings','earned from exports','出口收入'],['product categories','product groups','產品類別'],['percentage change','percentage change','百分比變動']),
 v(['export revenue','export money','出口收入'],['rose','rose','上升'],['sector','group','類別'],['decline','fall','下降']),
 v(['largest earner','earned the most','收入最高'],['despite starting from the lowest base','began with the least money','雖然起點最低'],['fastest growth','grew by the largest percentage','百分比增長最快']),
 v(['generated','earned','帶來收入'],['slightly more than','a little more than','略高於'],['roughly','about','大約']),
 v(['the former','petroleum','前者：石油產品'],['rose modestly','rose a little','小幅上升'],['the latter','engineered goods','後者：工程產品'],['climbed more sharply','rose more','較大幅上升']),
 v(['followed a different path','went the other way','走勢相反'],['falling from','falling from','由某值下降'],['a decrease','decrease','跌幅']),
 v(['lower-earning categories','groups that earned less','收入較低類別'],['changed very little','barely changed','變化甚少'],['remaining','staying','維持'],['marginal rise','0.81% rise','輕微升幅']),
 v(['by contrast','however','相比之下'],['grew markedly','rose strongly','大幅上升'],['representing','reports','表中顯示'],['nearly equal to','came close to','接近']),
];
const structures=[
 f('The bar chart compares the export earnings of a country in six product categories in 2015 and 2016, while the table indicates the percentage change in each category over the same period.','以 while 分清柱圖金額與表格變動百分比',[1,3,5],{formula:'The bar chart compares the export earnings of a country in [類別數] product categories in [兩年], while the table indicates the percentage change in each category over the same period',meaning:'柱圖讀 2015／2016 五類出口值（$bn）；表格讀各類 2016 相對 2015 的百分比變動。',usage:'增幅 15.24% 是變動率，不是 $15.24bn 的出口值。',parts:[link('The bar chart compares the export earnings of a country in'),slot(' five','類別數'),link(' product categories in'),slot(' 2015 and 2016','兩年'),link(', while the table indicates the percentage change in each category over the same period.')]}),
 f('Overall, export revenue rose in three of the five categories, with gems and jewellery being the only sector to decline.','在概覽指出上升類別的數目及唯一逆勢者',[0,4,6],{formula:'Overall, export revenue rose in [上升類別數] of the five categories, with [唯一下降類] being the only sector to decline',meaning:'五類中四類增長；gems and jewellery 唯一下降。',usage:'只判類別方向；不能由「四類升」推斷總出口額增幅。',parts:[link('Overall, export revenue rose in'),slot(' four','上升類別數'),link(' of the five categories, with'),slot(' gems and jewellery','唯一下降類'),link(' being the only sector to decline.')]}),
 f('Processed foods remained the largest earner in both years, whereas handicrafts, despite starting from the lowest base, recorded the fastest growth.','同時區分最高金額與最快百分比增長',[0,4,7],{formula:'[金額最高類] remained the largest earner in both years, whereas [百分比增長最快類], despite starting from the lowest base, recorded the fastest growth',meaning:'petroleum 兩年金額最高；textiles 2015 金額最低，表格增長率 15.24% 最高。',usage:'largest earner 按 $bn 比較，fastest growth 按百分比比較；不是同一排名。',parts:[slot('Petroleum products','金額最高類'),link(' remained the largest earner in both years, whereas'),slot(' textiles','百分比增長最快類'),link(', despite starting from the lowest base, recorded the fastest growth.')]}),
 f('In 2015, petroleum products generated about $60 billion, slightly more than engineered goods, at roughly $57 billion.','在同一年比較金額最高的兩類',[0,5,7],{formula:'In 2015, petroleum products generated about [石油收入], slightly more than engineered goods, at roughly [工程收入]',meaning:'2015 petroleum 約 $61bn，engineered 約 $58bn；前者略高。',usage:'金額為圖柱約讀值；不要用兩個近似值計算精確增長率。',parts:[link('In 2015, petroleum products generated about'),slot(' $61 billion','石油收入'),link(', slightly more than engineered goods, at roughly'),slot(' $58 billion','工程收入'),link('.')]}),
 f('Both categories increased in 2016: the former rose modestly by 4% to around $64 billion, while the latter climbed more sharply, by 9%, to approximately $63 billion.','以 former/latter 回指上一句兩類並比較金額與變動率',[0,3,6],{formula:'Both categories increased in 2016: the former rose modestly by [石油率] to around [石油額], while the latter climbed more sharply, by [工程率], to approximately [工程額]',meaning:'former=petroleum，3% 至約 $63bn；latter=engineered goods，8.5% 至約 $62bn。',usage:'former/latter 必須沿用上一句 petroleum→engineered 的先後次序；金額是約數，率取表格。',parts:[link('Both categories increased in 2016: the former rose modestly by'),slot(' 3%','石油率'),link(' to around'),slot(' $63 billion','石油額'),link(', while the latter climbed more sharply, by'),slot(' 8.5%','工程率'),link(', to approximately'),slot(' $62 billion','工程額'),link('.')]}),
 f('Gems and jewellery followed a different path, falling from about $45 billion to roughly $42 billion, a decrease of 6%.','用 from/to 加表格跌幅標示唯一下降類',[0,3,7],{formula:'Gems and jewellery followed a different path, falling from about [起額] to roughly [終額], a decrease of [表中跌幅]',meaning:'gems and jewellery 約 $43bn→$41bn；表格跌幅 5.18%。',usage:'bar 給約數，table 給報告的百分率；不要把 43 與 41 當精確值反推 5.18%。',parts:[link('Gems and jewellery followed a different path, falling from about'),slot(' $43 billion','起額'),link(' to roughly'),slot(' $41 billion','終額'),link(', a decrease of'),slot(' 5.18%','表中跌幅'),link('.')]}),
 f('Among the lower-earning categories, agricultural products changed very little, remaining at around $30 billion in both years after a marginal rise of 1%.','用小幅變動率解釋約數看似不變',[0,3,5],{formula:'Among the lower-earning categories, agricultural products changed very little, remaining at around [約數金額] in both years after a marginal rise of [表中增幅]',meaning:'農產品兩年柱圖約 $31bn；表格仍顯示 +0.81%。',usage:'四捨五入後兩柱都約 $31bn，不等於原始金額或表格增幅恰為零。',parts:[link('Among the lower-earning categories, agricultural products changed very little, remaining at around'),slot(' $31 billion','約數金額'),link(' in both years after a marginal rise of'),slot(' 0.81%','表中增幅'),link('.')]}),
 f('Textiles, by contrast, grew markedly from about $25 billion to roughly $30 billion, representing a 15% increase and making it nearly equal to agricultural products by 2016.','以近似金額、表格率及終年接近另一類三步描述紡織品',[0,3,6],{formula:'Textiles, by contrast, grew markedly from about [起額] to roughly [終額], representing a [表中增幅] increase and making it nearly equal to agricultural products by 2016',meaning:'柱圖約 $26bn→$31bn；表格報 +15.24%；2016 金額接近農產品。',usage:'圖柱金額是粗略讀值；15.24% 要按表格報，不用 $26bn→$31bn 的圓整約數倒算。',parts:[link('Textiles, by contrast, grew markedly from about'),slot(' $26 billion','起額'),link(' to roughly'),slot(' $31 billion','終額'),link(', representing a'),slot(' 15.24%','表中增幅'),link(' increase and making it nearly equal to agricultural products by 2016.')]}),
];
const intro=[quiz('柱圖與表格各給甚麼？',['柱圖為 2015／2016 各類出口值（$bn）；表格為變動百分率','兩者均是產品件數','柱圖是百分率而表格是每件價格','兩者均是每月出口人數'],'圖柱 y 軸是 $ billions；表格標 Percentage change。'),{type:'multi',prompt:'哪兩項最值得概覽？',detail:'選兩項，再按「確認」。',options:['五類中四類收入增加，寶石珠寶唯一下跌','石油出口金額最高；紡織品從低基數取得最高表列增長率','所有類別都下跌','紡織品在 2015 已是最大出口類別'],correct:[0,1],why:'方向、最大金額和最大變動率是跨圖主特徵。'}];
const route=[sequence('排好出口金額與變動率的四段',[
 ['兩圖引言','柱圖顯示五類 2015、2016 出口 $bn；表格報同期間變動百分率。'],
 ['總覽','四類增，一類跌；石油額最大，紡織品表中增幅最大。'],
 ['金額較高三類','石油約 61→63、工程約 58→62、珠寶約 43→41（十億美元），配表中 3／8.5／−5.18%。'],
 ['金額較低兩類','農產品約 31→31、表中 +0.81%；紡織品約 26→31、表中 +15.24%。'],
],'約數金額與精確表列率分別報，不用圓整的柱讀值反推表格率。')];
const evidence=[
 quiz('五類中哪類表中呈下降？',['寶石與珠寶，−5.18%','石油，+3%','工程產品，+8.5%','紡織品，+15.24%'],'表格只有 Gems and jewellery 向下箭嘴。'),
 quiz('兩年出口值最高的類別？',['石油產品','紡織品','農產品','珠寶'],'石油兩年柱均最高，約 61／63 十億美元。'),
 quiz('表格顯示哪類百分比增長最快？',['紡織品，15.24%','石油，3%','農產品，0.81%','工程產品，8.5%'],'表格最大正百分率是 textiles 15.24%。'),
 quiz('2015 石油與工程產品金額約為？',['$61bn 與 $58bn','61% 與 58%','$26bn 與 $31bn','$43bn 與 $41bn'],'柱圖石油略高於工程。'),
 quiz('石油與工程產品變動率依次是？',['+3% 與 +8.5%','+8.5% 與 +3%','−5.18% 與 +15.24%','兩者均 −3%'],'表格 petroleum 3%，engineered 8.5%。'),
 quiz('珠寶類的柱圖金額約數與表格方向？',['約 $43bn→$41bn；−5.18%','約 $41bn→$43bn；+5.18%','約 $31bn→$31bn；+0.81%','約 $26bn→$31bn；+15.24%'],'珠寶是唯一下降類別。'),
 quiz('農產品兩年柱圖都約 $31bn，表格卻給 +0.81%；怎樣解讀？',['約數掩蓋了微小增加，應保留表格的 +0.81%','兩項資料證明增幅必定是 0%','表格其實是每件產品價格','農產品跌幅為 15.24%'],'柱讀值經圓整；精確表格仍顯示小幅升。'),
 quiz('紡織品如何同時讀柱圖與表格？',['柱圖約 $26bn→$31bn；表格報 +15.24%，不由約數倒算','由 26 和 31 精確計算出 15.24%','柱圖 $26bn→$31bn 表示 +5 個百分點','表格說紡織品下降 15.24%'],'兩種資料精度不同；表中正率可直接報。'),
];
const logic=[sequence('先按金額排序，再看變動率',[
 ['石油／工程','2015 約 $61bn／$58bn；2016 約 $63bn／$62bn；表格 +3%／+8.5%。'],
 ['珠寶','約 $43bn→$41bn，表格 −5.18%；唯一負向。'],
 ['農產品','兩柱都約 $31bn，表格 +0.81% 微升。'],
 ['紡織品','從最低基數約 $26bn 升至約 $31bn；表格 +15.24% 最高。'],
 ],'「金額最大」和「百分比增幅最大」是兩個排名；不能互換。'),sequence('跨圖校對與精度界線',[
 ['柱圖','縱軸 $ billions；金額以 about／around／roughly 報。'],['表格','增跌率是百分比；正負方向由箭嘴與數字決定。'],['微變','農產品約 $31bn→$31bn 與 +0.81% 可同時成立。'],['約數','紡織品約 $26bn→$31bn 不應倒算成精確的 15.24%。'],
 ],'當約數與精確百分率不整除時，保留圖表各自呈現的精度。')];
const transfers=[
 transfer('另一份出口資料有兩年各產品收入柱圖與同期變動率表。','哪句引言不混淆兩種量度？',['柱圖比較各產品兩年的出口收入，表格則顯示同期每類的百分比變動。','柱圖和表格都顯示各類產品重量。','表格給收入金額，柱圖給人數。','兩圖只記錄出口目的地。'],['金額與增幅各有量度。','沒有重量。','單位錯。','沒有目的地。'],[0],'原文 bar chart export earnings；table percentage change。'),
 transfer('五類中四類收入增長，只有珠寶下跌。','哪句概覽方向準確？',['五類有四類上升，寶石與珠寶是唯一減少的類別。','五類全部上升。','只有珠寶上升。','五類全部下降。'],['上升數目與例外均準。','珠寶下降。','另四類上升。','方向錯。'],[1],'原文 four of five rose；gems/jewellery only decline。'),
 transfer('石油出口值最高，紡織品表中增長率最高。','哪句把兩種排名分清？',['石油仍是收入最高的出口品，而紡織品從低基數錄得最快百分比增長。','紡織品在兩年均創最高出口值。','石油是增長率最高類別。','金額和增長率一定由同一類別領先。'],['金額與率的排名分開。','紡織品起點最低。','石油僅 +3%。','兩排名可不同。'],[2],'原文 petroleum largest earner；textiles fastest growth。'),
 transfer('2015 年石油約 $61bn，工程產品約 $58bn。','哪句比較金額不誇大？',['石油收入約 610 億美元，略高於工程產品約 580 億美元。','石油收入高出工程產品 580 億美元。','工程產品約 $61bn，石油約 $58bn。','兩項數字都是百分比。'],['61 與 58 十億美元，差約 3 十億。','把工程額誤作差額。','數值互換。','柱圖單位 $bn。'],[3],'原文 petroleum $61bn slightly more than engineered $58bn。'),
 transfer('句子先提石油再提工程產品，接着使用 the former／the latter。','哪個指代正確？',['the former 指石油，the latter 指工程產品。','the former 指工程產品，the latter 指石油。','兩者都指珠寶。','兩者都指 2016 年。'],['former 是前者，latter 是後者。','前後次序錯。','珠寶未在句中。','所指是類別。'],[4],'原文 Both categories：the former petroleum；the latter engineered goods。'),
 transfer('2016 石油表中 +3%，工程產品 +8.5%。','哪句比較變動率？',['石油小幅上升 3%，工程產品升幅較大，為 8.5%。','石油升幅 8.5%，工程產品 3%。','兩類都下降。','工程產品仍是五類中最低收入。'],['表中兩率及大小正確。','率互換。','均為正。','工程額接近石油。'],[4],'原文 former 3%，latter 8.5%。'),
 transfer('珠寶是唯一表中負增長類別，柱圖約 $43bn→$41bn。','哪句區分約數與跌幅？',['寶石與珠寶收入約由 $43bn 降至 $41bn，表列跌幅 5.18%。','珠寶收入由 $43bn 升到 $41bn。','珠寶跌幅是 41%。','珠寶是增長最快類別。'],['柱圖約數和表中負率各自照報。','方向錯。','41 是約數金額。','紡織品增幅最高。'],[5],'原文 gems/jewellery falling about 43→41，decrease 5.18%。'),
 transfer('農產品兩柱都可約讀為 $31bn，表格寫 +0.81%。','哪個說法能處理精度？',['農產品兩年約 $31bn，表格仍顯示 0.81% 的小幅增加。','兩柱約數相同證明精確增幅為零。','0.81% 等於 $0.81bn 的精確增額。','農產品在 2016 跌至零。'],['四捨五入可隱藏小變化。','不能由約數判精確零。','率不等於金額。','柱圖未跌至零。'],[6],'原文 agriculture around $31bn both years，marginal +0.81%。'),
 transfer('紡織品約 $26bn→$31bn，表格標 +15.24%。','哪個跨圖讀法最可靠？',['把兩個金額稱作約數，將 15.24% 稱作表格報告的增長率。','把 $26bn 和 $31bn 當完全精確數字反推 15.24%。','將 +15.24% 說成下降 15.24%。','把 $31bn 說成 31% 出口份額。'],['分別忠實呈現柱圖精度與表格精度。','約數不能精確倒算。','方向相反。','金額不是份額。'],[7],'原文 textiles rough amounts plus table rate；兩種精度分開。'),
 transfer('2016 紡織品與農產品柱高都約 $31bn。','哪句比較終年金額？',['到 2016 年，紡織品收入已接近農產品。','紡織品收入仍只有農產品一半。','農產品變成零出口。','兩者百分比增幅完全一樣。'],['兩柱終值約接近。','柱高接近。','仍約 $31bn。','率 15.24% vs 0.81%。'],[6,7],'原文 textile nearly equal to agricultural products by 2016。'),
];
export default {key:'task1-mixed-charts:4',meta:{topic:'五類出口收入：金額與變動百分率',summary:'柱圖為 $bn 約數，表格為變動率：四升一跌；石油收入最高，紡織品表列 +15.24% 最快。農產品圓整金額近乎不變但表列 +0.81%；不要用粗略柱讀值精算表率。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
