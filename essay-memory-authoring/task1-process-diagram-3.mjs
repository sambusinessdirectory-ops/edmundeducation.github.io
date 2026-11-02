// Task 1 Process Diagram 3: sugar cane, seven stages, two alternative harvesting methods.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'沿圖上 1–7 排序；第 2 步的機收與手收是兩種選擇。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how sugar is made from sugar cane.',
 'Overall, there are seven steps in one direction: first the cane is grown, and finally the sugar crystals are dried and cooled.',
 'First, cane is grown and collected. In the factory, juice is taken out, cleaned, made thicker and separated into crystals.',
 'First, sugar cane grows for 12 to 18 months until it is ready.',
 'Next, a machine can cut and collect it, or workers can cut it by hand.',
 'After collection, a machine crushes the cane and squeezes out its juice for the next steps.',
 'Next, the juice goes through a limestone filter to make it clean.',
 'Once clean, the juice is heated in a machine that removes some water, so it becomes syrup.',
 'The syrup then spins in a centrifuge, which separates sugar crystals from the syrup left behind.',
 'Finally, the crystals are dried and cooled to make the finished sugar.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['process by which','how','如何製成'],['produced from','made from','由原料製成']),
 v(['linear','one direction','單向流程'],['seven-stage','seven steps','七個步驟'],['begins with growing','first the cane is grown','始於種植'],['finished crystals','sugar crystals','成品晶體']),
 v(['agricultural phase','cane is grown and collected','農業階段'],['cultivation and harvesting','grown and collected','栽種及收割'],['industrial phase','In the factory','工業階段'],['extracted','taken out','提取'],['purified','cleaned','淨化'],['thickened','made thicker','濃縮']),
 v(['First','First','首先'],['grown for 12 to 18 months','grows for 12 to 18 months','生長十二至十八個月'],['reaches maturity','is ready','成熟']),
 v(['one of two ways','a machine can cut and collect it, or workers can cut it by hand','兩種方式之一'],['mechanically','a machine','機械方式'],['manually','by hand','人手方式'],['stalks','it','甘蔗莖']),
 v(['After harvesting','After collection','收割後'],['crushed','crushes','壓碎'],['squeezes out the juice','squeezes out its juice','榨出汁液'],['later stages','next steps','後續階段']),
 v(['extracted juice','juice','榨出的汁'],['purified','make it clean','淨化'],['passing through a limestone filter','goes through a limestone filter','通過石灰石濾器']),
 v(['Once it has been cleaned','Once clean','淨化後'],['heated in an evaporator','heated in a machine','在蒸發器加熱'],['excess water is removed','removes some water','除去多餘水分'],['becomes syrup','becomes syrup','變成糖漿']),
 v(['spun in a centrifuge','spins in a centrifuge','離心機旋轉'],['separates sugar crystals','separates sugar crystals','分離糖晶體'],['remaining syrup','syrup left behind','餘下糖漿']),
 v(['In the final stage','Finally','最後階段'],['dried and cooled','dried and cooled','乾燥及冷卻'],['finished sugar','finished sugar','成品糖']),
];
const structures=[
 f('The diagram illustrates the process by which flour is produced from wheat.','引言以 by which 交代成品和原料',[1,3,7],{formula:'The diagram illustrates the process by which [成品] is produced from [原料]',meaning:'圖顯示 sugar 由 sugar cane 製成。',usage:'不要把 sugar cane 寫成最後產品；箭頭終點是 sugar。',parts:[link('The diagram illustrates the process by which'),slot(' sugar','成品'),link(' is produced from'),slot(' sugar cane','原料'),link('.')]}),
 f('Overall, the production of flour is a linear, seven-stage process that begins with growing wheat and ends with drying and cooling the finished powder.','概覽流程是七步單向並說起終點',[0,3,9],{formula:'Overall, the production of [成品] is a linear, seven-stage process that begins with growing [作物] and ends with [最後工序]',meaning:'圖標 1–7：種植甘蔗起、糖晶體乾燥冷卻終。',usage:'第 2 步機收／手收是替代路線，仍只算一個 harvesting 階段。',parts:[link('Overall, the production of'),slot(' sugar','成品'),link(' is a linear, seven-stage process that begins with growing'),slot(' cane','作物'),link(' and ends with'),slot(' drying and cooling the finished crystals','最後工序'),link('.')]}),
 f('Broadly, it moves from an agricultural phase, involving planting and picking, to an industrial phase in which fruit is washed, sliced, dried and packed.','將圖分成栽收農業段與榨汁後工業段',[0,4,8],{formula:'Broadly, it moves from an agricultural phase, involving [田間兩步], to an industrial phase in which [四項處理]',meaning:'1–2 種植／收割；3–6 壓榨、過濾、蒸發濃縮、離心分晶；7 乾燥冷卻。',usage:'此句的 industrial steps 順序按圖；thickened 在 purified 後，separated 在 thickened 後。',parts:[link('Broadly, it moves from an agricultural phase, involving'),slot(' cultivation and harvesting','田間兩步'),link(', to an industrial phase in which'),slot(' juice is extracted, purified, thickened and separated','四項處理'),link('.')]}),
 f('First, sugar cane is grown for 10 to 16 months until it reaches maturity.','交代種植歷時和成熟條件',[0,4,8],{formula:'First, sugar cane is grown for [時長] until it reaches maturity',meaning:'圖標 Growing 12–18 months；到成熟才收。',usage:'12–18 個月是生長期，不是製糖全流程的總時長。',parts:[link('First, sugar cane is grown for'),slot(' 12 to 18 months','時長'),link(' until it reaches maturity.')]}),
 f('It is then harvested in one of two ways: mechanically, with a harvester cutting and gathering the stalks, or manually, with farmers cutting the stems with hand tools.','說明機收或手收是同一步的兩種替代方式',[0,3,8],{formula:'It is then harvested in one of two ways: mechanically, with [機械方法], or manually, with [人手方法]',meaning:'第 2 步左圖機械切收，右圖工人手割；兩路都進第 3 步壓碎。',usage:'one of two ways 指二選一，不是先機收再手收。',parts:[link('It is then harvested in one of two ways: mechanically, with'),slot(' a vehicle cutting and loading the crop','機械方法'),link(', or manually, with'),slot(' workers cutting the stalks by hand','人手方法'),link('.')]}),
 f('After harvesting, the cane is crushed in a machine, and this step squeezes out the liquid required for the later stages.','承接收割，以壓碎機榨出後續所需汁液',[0,4,8],{formula:'After harvesting, the cane is crushed in a machine, and this step squeezes out [產物] required for the later stages',meaning:'第 3 步 Crushing 從甘蔗榨 juice；後續過濾與蒸發處理的是汁。',usage:'juice 是液體中間物；此時還不是糖晶體。',parts:[link('After harvesting, the cane is crushed in a machine, and this step squeezes out'),slot(' the juice','產物'),link(' required for the later stages.')]}),
 f('The extracted juice is next purified by passing through a fine filter.','用 by passing through 交代榨汁後的淨化工具',[0,4,8],{formula:'The extracted juice is next purified by passing through [濾器]',meaning:'第 4 步 Purifying juice 使用 limestone filter。',usage:'濾器是石灰石濾器；不能把 limestone 當成圖中最後糖的成分比例。',parts:[link('The extracted juice is next purified by passing through'),slot(' a limestone filter','濾器'),link('.')]}),
 f('Once it has been cleaned, it is heated in an evaporator, where excess water is removed and the liquid becomes a thick syrup.','將蒸發除水與汁液變糖漿放在同一步',[0,4,8],{formula:'Once it has been cleaned, it is heated in an evaporator, where excess water is removed and the liquid becomes [濃縮產物]',meaning:'第 5 步 evaporator 加熱去水：juice→syrup。',usage:'it 回指 purified juice；蒸發器不是把糖漿直接變成完成的糖晶體。',parts:[link('Once it has been cleaned, it is heated in an evaporator, where excess water is removed and the liquid becomes'),slot(' syrup','濃縮產物'),link('.')]}),
 f('This syrup is then spun in a centrifuge, which separates salt crystals from the remaining liquid.','以 which 回指離心機，說明晶體與餘液分離',[0,4,9],{formula:'This syrup is then spun in a centrifuge, which separates [晶體] from [餘液]',meaning:'第 6 步離心機把 sugar crystals 與剩餘 syrup 分開。',usage:'不是先乾燥後離心；乾燥、冷卻是第 7 步。',parts:[link('This syrup is then spun in a centrifuge, which separates'),slot(' sugar crystals','晶體'),link(' from'),slot(' the remaining syrup','餘液'),link('.')]}),
 f('In the final stage, the crystals are dried and cooled, leaving the finished salt.','以最後的乾燥和冷卻完成成品',[0,4,8],{formula:'In the final stage, the crystals are dried and cooled, leaving the finished [成品]',meaning:'第 7 步 Drying and cooling 後得到 sugar。',usage:'先分晶後乾燥冷卻；圖未給包裝或運輸步驟。',parts:[link('In the final stage, the crystals are dried and cooled, leaving the finished'),slot(' sugar','成品'),link('.')]}),
];
const intro=[quiz('圖中機收與手收應怎樣計步？',['同屬第 2 步 Harvesting 的兩種方法','機收是第 2 步，手收必須是第 3 步','兩者都在乾燥後','圖沒有收割步驟'],'第 2 標號分兩路，箭頭再匯回第 3 步壓碎。'),{type:'multi',prompt:'哪兩項適合寫概覽？',detail:'選兩項，再按「確認」。',options:['七步單向流程由種植甘蔗至糖晶體乾燥冷卻','前段是種植收割，後段依次提汁、淨化、濃縮、分晶','流程從成品糖回到種子反覆循環','榨汁後立即包裝，無過濾與蒸發'],correct:[0,1],why:'步數、起終點及兩大階段清晰。'}];
const route=[sequence('依範文排列製糖流程四段',[
 ['引言','甘蔗原料製成糖。'],['概覽','七步線性；田間栽收後轉工廠提汁、淨化、濃縮與分晶。'],['前半細節','長 12–18 個月；機收或手收；壓碎榨汁。'],['後半細節','石灰石濾器→蒸發器成糖漿→離心機分晶→乾燥冷卻。'],
],'第 2 步兩種收割方式是分支再合流，不增加流程總步數。')];
const evidence=[
 quiz('甘蔗種植多久？',['12–18 個月','12–18 天','7 年','圖未標時長'],'第 1 步標 Growing (12–18 months)。'),
 quiz('收割方式有哪兩種？',['機械切收或工人手割','只可由飛機收割','先機械切後每根再手割','先榨汁後收割'],'第 2 步兩幅圖表示替代方式。'),
 quiz('壓碎後得到甚麼？',['甘蔗汁','已乾燥糖晶','糖漿','石灰石粉'],'第 3 步 Crushing 箭頭標 Juice。'),
 quiz('甘蔗汁用甚麼淨化？',['石灰石濾器','離心機','曬乾機','包裝袋'],'第 4 步 Limestone filter。'),
 quiz('蒸發器的作用？',['加熱去水，汁變糖漿','把糖漿變回甘蔗','將已乾燥糖再榨汁','把石灰石變成糖'],'第 5 步 Juice becomes syrup。'),
 quiz('離心機分開甚麼？',['糖晶體與餘下糖漿','甘蔗與工人','水與石灰石田地','成衣與紗線'],'第 6 步 separates sugar crystals from syrup。'),
 quiz('最後一步？',['晶體乾燥和冷卻','先乾燥，再開始種植','直接裝船出口','機械收割'],'第 7 步 Drying and cooling。'),
];
const logic=[sequence('七個標號與物料狀態',[
 ['1–2 田間','種植 12–18 個月→機收或手收。'],['3–4 汁液','壓碎榨汁→石灰石濾器淨化。'],['5–6 濃縮分晶','蒸發去水成糖漿→離心機分糖晶。'],['7 成品','糖晶乾燥並冷卻。'],
 ],'harvesting 的兩條路只選其一，接下來都進 crushing。'),sequence('四次狀態轉換避免混淆',[
 ['甘蔗→汁','壓碎榨出液體，尚未有糖晶。'],['汁→淨汁','通過 limestone filter。'],['淨汁→糖漿','加熱除水，使液體變濃。'],['糖漿→糖晶','離心分離，再乾燥冷卻。'],
 ],'汁、糖漿、晶體、成品糖不是同一加工狀態。')];
const transfers=[
 transfer('另一圖顯示原料農作物製成食糖。','哪句引言交代原料和產物？',['流程圖展示糖如何由甘蔗製成。','流程圖比較糖和甘蔗的市價。','流程從糖變回甘蔗。','圖只顯示糖的食用方法。'],['成品與原料方向準確。','不是價格。','方向反了。','有七步製造。'],[0],'原文 sugar produced from sugar cane。'),
 transfer('圖標 1–7，最後是 Drying and cooling。','哪句概覽準確？',['七步單向流程從甘蔗生長開始，以糖晶乾燥冷卻結束。','七步反覆把成品糖種回田裏。','圖只包括機收與手收兩步。','最後一步是第一次收割。'],['七步、起終點對圖。','未畫回圈。','另有加工步驟。','最後是乾燥冷卻。'],[1],'原文 linear seven-stage，growing→drying/cooling。'),
 transfer('流程前段在田間，後段在設備中處理甘蔗汁。','哪句分組正確？',['先栽種與收割，後榨汁、淨化、濃縮及分晶。','先分晶，再種植甘蔗。','全部階段都只是田間生長。','汁液一榨出便直接是乾糖。'],['農業段與工業段、順序均合。','順序倒置。','有設備加工。','仍需多步。'],[2],'原文 agricultural phase→industrial phase。'),
 transfer('圖標甘蔗 Growing 12–18 months。','哪句沒有誤作整個流程時間？',['甘蔗先生長 12 至 18 個月，成熟後才收割。','整個製糖流程每一步各需 12 至 18 個月。','甘蔗只長 12 至 18 分鐘。','圖沒有顯示種植時間。'],['時間屬第一步生長。','不適用各步。','單位錯。','圖有標示。'],[3],'原文 cane grown 12–18 months until maturity。'),
 transfer('第 2 步圖同時畫機器和工人手割。','哪句理解分支正確？',['甘蔗可由機器或工人手工收割，兩者是替代方式。','甘蔗必須先機器收割，再由工人重收一次。','機器用來過濾糖漿，工人用來乾燥糖。','第 2 步沒有收割。'],['one of two ways＝二選一。','不是兩個先後步驟。','圖是收割。','標 Harvesting。'],[4],'原文 harvested in one of two ways。'),
 transfer('收割後甘蔗進壓碎機。','哪句保留中間產物？',['甘蔗被機器壓碎，榨出供後續處理的汁液。','甘蔗被壓碎後直接變成乾糖。','壓碎機只用於把糖晶冷卻。','汁液在種植前就已製成。'],['第 3 步產物是 juice。','仍需過濾、蒸發等。','機器功能錯。','時間倒置。'],[5],'原文 cane crushed→juice for later stages。'),
 transfer('第 4 步在 Purifying juice 旁標 Limestone filter。','哪句工具和目的正確？',['榨出的甘蔗汁通過石灰石濾器淨化。','石灰石濾器把成衣紡成糖。','汁液由離心機先乾燥，再送過濾。','圖只顯示清水沖洗甘蔗。'],['圖標濾器及淨汁。','原料和產物錯。','離心較後。','不只沖洗。'],[6],'原文 extracted juice purified through limestone filter。'),
 transfer('過濾後汁液進蒸發器，水減少、液體變濃。','哪句表達蒸發器作用？',['淨汁經加熱除去多餘水分，因而變成糖漿。','糖漿在種植前被凍成甘蔗。','蒸發器把糖晶變回汁液。','蒸發後直接跳過離心而完成包裝。'],['汁→糖漿，方式是除水。','方向錯。','狀態反了。','仍需離心、乾燥。'],[7],'原文 evaporator removes water；liquid becomes syrup。'),
 transfer('糖漿後進 centrifuge。','哪句說明分離？',['糖漿在離心機旋轉，糖晶與剩餘糖漿被分開。','離心機把甘蔗種到田裏。','離心後才第一次榨出汁液。','離心機只用來把糖漿加水稀釋。'],['第 6 步是分晶。','功能錯。','順序錯。','不是稀釋。'],[8],'原文 syrup spun in centrifuge，sugar crystals separated。'),
 transfer('第 7 步標 Drying and cooling。','哪句正確收束流程？',['最後糖晶經乾燥和冷卻，成為成品糖。','最後才開始種植甘蔗。','最後用離心機製成液漿。','圖最後是包裝運輸而非乾燥。'],['最後工序與成品對圖。','種植在首步。','離心在前一步。','沒有顯示包裝。'],[9],'原文 crystals dried and cooled，finished sugar。'),
];
export default {key:'task1-process-diagram:3',meta:{topic:'甘蔗製糖七步：栽收、榨汁、淨化、濃縮、分晶',summary:'甘蔗生長 12–18 個月→機收或手收（二選一）→壓汁→石灰石濾器→蒸發器成糖漿→離心機分糖晶→乾燥冷卻。區分汁、糖漿、晶體的狀態。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
