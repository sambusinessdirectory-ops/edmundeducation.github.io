// Task 1 Process Diagram 2: ethanol production chain plus carbon-dioxide loop.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先追物料由植物到乙醇，再追二氧化碳如何返回植物。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how plant material is made into ethanol fuel and then used for energy. Carbon dioxide also goes back into plant growth.',
 'Overall, plants and trees grow using sunlight and carbon dioxide. They are turned into ethanol, which vehicles use.',
 'When vehicles use the fuel, carbon dioxide goes into the air. New plants can take up this gas, so the cycle can start again.',
 'First, plants and trees grow using sunlight and carbon dioxide.',
 'When they are ready, machines collect them. Then the plant material is prepared before the main processing.',
 'The material is then turned into cellulose and sent to a factory for further work.',
 'At the factory, cellulose is turned into sugars.',
 'Next, microbes are put into the sugars, and they help turn the sugars into ethanol.',
 'The finished fuel is then sent for use in transport, including cars, trucks and planes.',
 'When these vehicles use ethanol, they release carbon dioxide. Plants and trees take up the gas again in the next growth stage.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['cyclical process','Carbon dioxide also goes back','循環過程'],['biofuel','fuel','生物燃料'],['plant material','plant material','植物材料'],['energy source','energy','能源']),
 v(['production begins','plants and trees grow','生產始於植物生長'],['use sunlight and carbon dioxide','using sunlight and carbon dioxide','利用陽光和二氧化碳'],['ethanol being consumed','ethanol, which vehicles use','乙醇被使用']),
 v(['released during use','goes into the air','使用時排放'],['returned to the atmosphere','goes into the air','回到大氣'],['absorbed by new vegetation','New plants can take up','被新植物吸收'],['cycle to continue','cycle can start again','循環延續']),
 v(['In the first stage','First','第一階段'],['grow through exposure to','grow using','藉接觸而生長'],['sunlight and carbon dioxide','sunlight and carbon dioxide','陽光與二氧化碳']),
 v(['Once mature','When they are ready','成熟後'],['harvested by machinery','machines collect','機械收割'],['pre-processing','prepared before the main processing','預先處理'],['raw biomass','plant material','原始生物質']),
 v(['reduced to cellulose','turned into cellulose','製成纖維素'],['transferred','sent','運送'],['processing plant','factory','加工廠']),
 v(['Inside the plant','At the factory','在工廠內'],['broken down into sugars','turned into sugars','分解為糖']),
 v(['subsequently added','Next, microbes are put','其後加入'],['Microbes','microbes','微生物'],['biological stage','they help','生物作用階段'],['converts them into ethanol','turn the sugars into ethanol','轉化為乙醇']),
 v(['distributed','sent','分送'],['transport','transport','運輸'],['lorries','trucks','貨車'],['aircraft','planes','飛機']),
 v(['consume ethanol','use ethanol','使用乙醇'],['is emitted','release','排放'],['taken up again','take up','再次吸收'],['next growing stage','next growth stage','下一輪生長']),
];
const structures=[
 f('The diagram illustrates the cyclical process by which the biofuel biodiesel is produced from plant material and then used as an energy source.','用 by which 連接植物原料、生物燃料與用途，並指出循環特徵',[1,3,8],{formula:'The diagram illustrates the cyclical process by which the biofuel [燃料] is produced from [原料] and then used as an energy source',meaning:'植物原料加工為乙醇，車輛使用後排 CO₂，植物再吸收 CO₂；循環的是碳。',usage:'cyclical 不表示消耗後的乙醇原液回到工廠；回流箭頭代表二氧化碳。',parts:[link('The diagram illustrates the cyclical process by which the biofuel'),slot(' ethanol','燃料'),link(' is produced from'),slot(' plant material','原料'),link(' and then used as an energy source.')]}),
 f('Overall, ethanol production begins with the growth of crops, which use sunlight and carbon dioxide, and ends with ethanol being consumed by buses.','在概覽交代物料製造鏈的起點和使用終點',[0,3,8],{formula:'Overall, ethanol production begins with the growth of [植物], which use sunlight and carbon dioxide, and ends with ethanol being consumed by [使用者]',meaning:'植物與樹木靠陽光及 CO₂ 生長；產出乙醇供車、貨車、飛機使用。',usage:'陽光提供能量；CO₂ 是植物生長所需氣體，不應稱作能源本身。',parts:[link('Overall, ethanol production begins with the growth of'),slot(' plants and trees','植物'),link(', which use sunlight and carbon dioxide, and ends with ethanol being consumed by'),slot(' vehicles','使用者'),link('.')]}),
 f('A key feature is that the carbon dioxide released during use is returned to the atmosphere and can be absorbed by new crops, allowing the cycle to continue.','把排出的 CO₂ 與下一輪植物吸收接成真正循環',[0,3,9],{formula:'A key feature is that the carbon dioxide released during use is returned to the atmosphere and can be absorbed by [新生長者], allowing the cycle to continue',meaning:'車輛使用乙醇排出的 CO₂ 返回空氣，再由新生植物吸收。',usage:'只說圖中 CO₂ 流向；圖沒有提供總排放量，也不能推斷燃料完全零碳。',parts:[link('A key feature is that the carbon dioxide released during use is returned to the atmosphere and can be absorbed by'),slot(' new vegetation','新生長者'),link(', allowing the cycle to continue.')]}),
 f('In the first stage, crops grow through exposure to sunlight and carbon dioxide.','第一步列植物生長所需的兩個圖示輸入',[0,4,8],{formula:'In the first stage, [植物] grow through exposure to sunlight and carbon dioxide',meaning:'圖從 plants and trees grow 開始，箭頭給 sunlight 與 CO₂。',usage:'這是植物生長條件，不是說二氧化碳與陽光均屬燃料。',parts:[link('In the first stage,'),slot(' plants and trees','植物'),link(' grow through exposure to sunlight and carbon dioxide.')]}),
 f('Once mature, they are harvested by machinery and sent for pre-processing, where the harvested biomass is prepared.','用 Once 接續成熟、機收與預處理的連續順序',[0,3,7],{formula:'Once mature, they are harvested by machinery and sent for pre-processing, where [原料] is prepared',meaning:'植物成熟後機械收割，再預處理植物生物質；後才得到 cellulose。',usage:'they 回指 plants and trees；預處理不能移到收割之前。',parts:[link('Once mature, they are harvested by machinery and sent for pre-processing, where'),slot(' the raw biomass','原料'),link(' is prepared.')]}),
 f('The material is then reduced to cellulose, which is transferred to a new processing plant.','說明原料轉成纖維素並運到加工廠',[0,4,7],{formula:'The material is then reduced to [中間物], which is transferred to [下一站]',meaning:'預處理後得到 cellulose，箭頭將其送到 processing；之後才轉糖。',usage:'which 指 cellulose；不要把這一步寫成已製成 ethanol。',parts:[link('The material is then reduced to'),slot(' cellulose','中間物'),link(', which is transferred to'),slot(' a processing plant','下一站'),link('.')]}),
 f('Inside the plant, cellulose is broken down into simple sugars.','用被動式表述加工廠內 cellulose→sugars',[0,4,8],{formula:'Inside the plant, cellulose is broken down into [產物]',meaning:'在 processing plant 中纖維素分解成 sugars；微生物在後一步才加入。',usage:'broken down into 指轉化產物，不表示糖在植物生長時直接被收割。',parts:[link('Inside the plant, cellulose is broken down into'),slot(' sugars','產物'),link('.')]}),
 f('Microbes are subsequently added to the resulting sugars, and this biological stage converts them into ethanol.','在糖後加入微生物，說明生物轉化產物',[0,4,9],{formula:'Microbes are subsequently added to [基質], and this biological stage converts them into [燃料]',meaning:'先有 sugars，再 microbes added，最後形成 ethanol。',usage:'them 回指 sugars；不要把 microbes 寫成乙醇的主要原料量度。',parts:[link('Microbes are subsequently added to'),slot(' these sugars','基質'),link(', and this biological stage converts them into'),slot(' ethanol','燃料'),link('.')]}),
 f('The finished fuel is then distributed for use in transport, including trains, buses and ferries.','從製造流程切到燃料分發與運輸用途',[0,4,9],{formula:'The finished fuel is then distributed for use in transport, including [圖示交通工具]',meaning:'乙醇用於車、貨車、飛機；圖中三種工具旁均標 CO₂。',usage:'including 是舉圖中例子，不能據此聲稱所有交通工具只能用乙醇。',parts:[link('The finished fuel is then distributed for use in transport, including'),slot(' cars, lorries and aircraft','圖示交通工具'),link('.')]}),
 f('As these vehicles consume ethanol, carbon dioxide is emitted; this gas then becomes part of the next growing stage when it is taken up again by new crops.','以分號把車輛排碳與植物再吸收接成閉環',[0,3,8],{formula:'As these vehicles consume ethanol, carbon dioxide is emitted; this gas then becomes part of the next growing stage when it is taken up again by [植物]',meaning:'使用乙醇→CO₂ 排放→新植物吸收→下一輪生長。',usage:'this gas 明確回指 CO₂；回到生長階段的是氣體，不是車輛或乙醇。',parts:[link('As these vehicles consume ethanol, carbon dioxide is emitted; this gas then becomes part of the next growing stage when it is taken up again by'),slot(' plants and trees','植物'),link('.')]}),
];
const intro=[quiz('這幅圖中甚麼真正構成循環？',['車輛排出的二氧化碳返回空氣並被下一輪植物吸收','用完的乙醇原液直接回到工廠','車輛變回樹木','纖維素直接回到種子'],'圖外環的 CO₂ 箭頭返回植物。'),{type:'multi',prompt:'哪兩項最適合概覽？',detail:'選兩項，再按「確認」。',options:['植物利用陽光與 CO₂ 生長，經加工、微生物作用成乙醇並供運輸使用','使用乙醇後排出的 CO₂ 可被新植物吸收，使循環延續','乙醇在車輛用完後完整流回加工廠','圖精確證明整個流程沒有任何碳排放'],correct:[0,1],why:'一項是製造鏈，一項是 CO₂ 回流；不要外推零排放。'}];
const route=[sequence('按範文次序排列乙醇流程報告',[
 ['引言','植物原料製成乙醇，作運輸能源；流程具 CO₂ 循環。'],
 ['概覽','植物借陽光與 CO₂ 生長，乙醇供車輛；排放 CO₂ 回到下一輪植物。'],
 ['原料至纖維素','生長、機收、預處理，得到 cellulose，送加工廠。'],
 ['糖至循環','cellulose→sugars→加入 microbes→ethanol→車輛使用→CO₂ 回到植物。'],
],'圖中的碳箭頭是循環，物料加工順序仍須按箭頭前進。')];
const evidence=[
 quiz('植物生長的圖示輸入？',['陽光與二氧化碳','乙醇與汽油','糖與微生物','纖維素與蒸汽'],'左上 Energy 標有 sunlight+carbon dioxide；CO₂ 是植物所需氣體。'),
 quiz('成熟植物先經甚麼兩步？',['機械收割，再預處理','先由汽車燃燒，再收割','先變成糖，再生長','先製乙醇，再預處理'],'箭頭 harvesting→pre-processing。'),
 quiz('預處理後的中間物？',['纖維素 cellulose','已裝車的乙醇','飛機','二氧化碳罐'],'圖中 Pre-processing→Cellulose。'),
 quiz('加工廠內纖維素下一步變成甚麼？',['糖 sugars','成衣','砂石','汽油'],'Processing→Sugars。'),
 quiz('在糖之後加入甚麼？',['微生物 microbes','石灰石','冷水與氧化胺','水泥'],'Sugars→Microbes added→Ethanol。'),
 quiz('圖示乙醇供哪三種交通工具？',['汽車、貨車及飛機','火車、渡輪及單車','電梯、船及火箭','只有汽車'],'圖中有 car、lorry、aircraft。'),
 quiz('車輛使用乙醇後，圖示氣體往哪裏？',['CO₂ 進入大氣，再由植物吸收','乙醇液體原封不動送回加工廠','微生物變成陽光','糖直接變成植物葉子'],'圖右 CO₂ 箭頭繞回左上植物。'),
];
const logic=[sequence('物料加工鏈：沿箭頭由植物到燃料',[
 ['生長及收集','陽光＋CO₂ 助植物成長；機械收割。'],['預處理','原始生物質被預處理，形成 cellulose。'],['加工及發酵','cellulose→sugars；加入 microbes→ethanol。'],['使用','乙醇分發供汽車、貨車、飛機使用。'],
 ],'不要跳過 cellulose 和 sugars，也不要把 microbes 放在糖形成之前。'),sequence('碳路徑：圈外箭頭的含義',[
 ['排放點','車輛消耗乙醇時有 CO₂ 排出。'],['回到空氣','氣體進入大氣，不是液態乙醇回收。'],['下一輪吸收','新植物利用 CO₂ 生長。'],['證據界線','圖不提供各步驟排放量或完整碳帳。'],
 ],'這是圖示循環機制，不等於證明零淨排放。')];
const transfers=[
 transfer('另一流程圖顯示植物製成生物燃料，車輛使用後有氣體返回植物。','哪句引言交代材料、用途和循環？',['流程圖展示植物如何製成生物燃料並用作能源，以及排出的氣體如何回到下一輪生長。','流程圖只比較燃料價格。','燃料在車輛使用後原液回流到植物。','植物直接變成汽車。'],['原料、用途與氣體循環均清楚。','不是價格圖。','回流是氣體。','流程沒有此變化。'],[0],'原文 plant material→ethanol→use；cyclical CO₂。'),
 transfer('植物利用陽光和 CO₂ 生長，乙醇製成後供交通工具。','哪句概覽保留製造鏈兩端？',['生產從植物生長開始，最後乙醇作為車輛燃料被使用。','生產從汽車開始，最後得到植物。','二氧化碳與陽光都是已製成的乙醇。','圖中沒有運輸用途。'],['起點與使用終點準確。','順序倒置。','輸入不是產物。','圖畫三種交通工具。'],[1],'原文 starts plant growth，ends ethanol consumed by vehicles。'),
 transfer('車輛排 CO₂，植物下一輪吸收。','哪句說明「循環」所在？',['使用燃料排出的二氧化碳回到大氣，再被新植物吸收。','乙醇用完後在車內自動變回纖維素。','汽車回到田裏成為樹。','圖證明整個流程沒有任何排放。'],['回流的是 CO₂，非乙醇。','物料沒有回到纖維素。','沒有這種變化。','圖標示 CO₂ 排放。'],[2],'原文 carbon dioxide released→atmosphere→new vegetation。'),
 transfer('圖首端有植物與樹木、陽光、CO₂。','哪句描述第一步而不稱 CO₂ 為燃料？',['首先植物和樹木藉陽光及二氧化碳生長。','首先二氧化碳直接燃燒成陽光。','首先汽車被機械收割。','首先植物已變成乙醇。'],['陽光為能量、CO₂ 為生長所需氣體。','物理關係錯。','收割對象是植物。','仍是原料。'],[3],'原文 plants and trees grow through sunlight and carbon dioxide。'),
 transfer('植物成熟，圖箭頭走向 Harvesting，再走向 Pre-processing。','哪句順序正確？',['植物成熟後由機器收割，再送去預處理。','先預處理，再讓植物成熟。','先製成乙醇，再種植。','預處理在車輛燃燒後才首次出現。'],['兩相鄰步驟順序正確。','時間倒置。','物料倒置。','圖中預處理較早。'],[4],'原文 mature→harvested by machinery→pre-processing。'),
 transfer('預處理後的材料成為纖維素，再進入加工設備。','哪句保留中間物及去向？',['原料轉成纖維素，然後送往加工廠。','原料直接在汽車內變成糖。','纖維素是在車輛使用後排出的氣體。','加工廠直接收成衣。'],['cellulose 是中間物。','跳過預處理。','不是氣體。','沒有成衣。'],[5],'原文 material reduced to cellulose，transferred to processing plant。'),
 transfer('加工廠中 cellulose 轉成 sugars。','哪句不跳步？',['在加工廠，纖維素先分解為糖。','在加工廠，汽車直接變成糖。','纖維素變成衣物後才種植物。','微生物先變糖，纖維素不參與。'],['這是圖中明確的下一步。','原料不是汽車。','順序與產物錯。','cellulose 是糖的前身。'],[6],'原文 cellulose broken down into sugars。'),
 transfer('糖形成後加 microbes，產物是 ethanol。','哪句呈現生物轉化？',['其後向糖加入微生物，把糖轉成乙醇。','微生物在植物收割前先加入汽車。','糖直接回到空氣並變成陽光。','乙醇先形成，然後才有糖。'],['糖→微生物→乙醇。','次序及對象錯。','沒有此路徑。','順序倒置。'],[7],'原文 Microbes added to sugars→ethanol。'),
 transfer('乙醇完成後，圖畫汽車、貨車和飛機。','哪句說明使用而非生產原料？',['成品燃料被分送至運輸用途，圖中包括汽車、貨車及飛機。','三種車輛被送去預處理製乙醇。','乙醇只供照明，不供運輸。','圖只有一輛單車。'],['三種交通工具是用途例子。','車輛不是生物質。','圖標示運輸。','工具有三種。'],[8],'原文 finished fuel distributed for transport including cars, lorries, aircraft。'),
 transfer('車輛使用乙醇後排出 CO₂，植物吸收它。','哪個 this gas 指代準確？',['「這種氣體」指剛排出的二氧化碳，會被下一輪植物吸收。','「這種氣體」指整輛飛機。','「這種氣體」指液態乙醇成品。','「這種氣體」指已分解的糖。'],['代詞回指 CO₂，與外環箭頭一致。','飛機不是氣體。','乙醇不是指代對象。','糖是較早中間物。'],[9],'原文 this gas = carbon dioxide，taken up again by plants。'),
];
const balancedTransferOptions=[
  ['植物製成燃料供車輛使用，排出的氣體再供植物生長。','植物製成燃料供車輛使用，剩餘原液再供植物生長。','植物製成衣物供車輛使用，排出的氣體再供植物生長。','植物直接變成車輛使用，排出的氣體再供植物生長。'],
  ['先讓植物生長，最後製成乙醇供交通工具使用。','先讓汽車行駛，最後變成乙醇供植物生長。','先製成乙醇，最後變成陽光供植物生長。','先讓植物生長，最後製成衣物供交通工具使用。'],
  ['乙醇燃燒排出二氧化碳，再由新植物吸收。','乙醇燃燒排出液態燃料，再由新植物吸收。','汽車使用乙醇後變成樹木，再由新植物吸收。','乙醇燃燒完全沒有排放，也無氣體供植物吸收。'],
  ['植物與樹木利用陽光和二氧化碳生長。','二氧化碳直接燃燒，變成陽光讓植物生長。','汽車與貨車利用陽光和二氧化碳生長。','植物與樹木利用現成的乙醇燃料生長。'],
  ['植物長成後由機器收割，再送去預處理。','植物預處理後才開始生長，再由機器收割。','植物長成後先製成乙醇，再由機器收割。','植物長成後由機器收割，再直接供汽車用。'],
  ['預處理原料變成纖維素，然後送去加工廠。','預處理原料變成汽車燃料，然後送去加工廠。','預處理原料變成衣物布料，然後送去加工廠。','車輛排出的氣體變成纖維素，然後送去加工廠。'],
  ['在加工廠，纖維素先被分解為糖。','在加工廠，整輛汽車先被分解為糖。','在加工廠，糖先被分解為纖維素。','在加工廠，微生物先被分解為糖。'],
  ['向糖加入微生物，接着把糖轉成乙醇。','向汽車加入微生物，接着把車轉成乙醇。','向糖加入微生物，接着把糖轉成陽光。','向乙醇加入微生物，接着把它轉成糖。'],
  ['乙醇製好後用於汽車、貨車及飛機運輸。','汽車、貨車及飛機被收割後用來製乙醇。','乙醇製好後只供照明，不用於任何運輸。','乙醇製好後只用於單車，不供車輛使用。'],
  ['「這種氣體」是排出的二氧化碳，可供植物吸收。','「這種氣體」是用過的液態乙醇，可供植物吸收。','「這種氣體」是行駛中的整架飛機，可供植物吸收。','「這種氣體」是先前製成的糖分，可供植物吸收。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-process-diagram:2',meta:{topic:'植物生物質製乙醇及二氧化碳循環',summary:'植物借陽光和 CO₂ 生長→機收預處理→纖維素→糖→加微生物→乙醇→車、貨車、飛機使用；排出的 CO₂ 回到大氣由新植物吸收。循環的是碳，非乙醇原液。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
