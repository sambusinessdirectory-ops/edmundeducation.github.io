// Task 1 Process Diagram 9: cement-making chain versus four-ingredient concrete blend.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先製水泥，再以水泥及另外三項材料混製混凝土。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagrams show the steps and machines for making cement, then show how cement helps make concrete for building.',
 'Overall, cement takes several steps: crushing, mixing, heating and grinding. Making concrete is simpler: four measured materials are mixed together.',
 'Gravel makes up the most concrete; water makes up the least.',
 'First, limestone and clay go into a crusher, which breaks them into powder.',
 'The powder goes into a mixer and then into a rotating heater.',
 'As the mix travels through the turning heater, heat comes from one end. Then a grinder breaks down the heated material.',
 'Finally, the cement made this way is put into bags.',
 'Making concrete has fewer steps.',
 'Cement, sand, gravel and water all go into a turning concrete mixer, which blends them.',
 'Gravel, or small stones, is 50% of the mix, while sand is another 25%.',
 'Cement is 15% and water is 10% in that order; together the four materials make concrete for building.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['stages and equipment','steps and machines','階段與設備'],['to make cement','for making cement','製水泥'],['produce concrete for construction','make concrete for building','製建築混凝土']),
 v(['manufacture','takes','製造'],['multi-stage linear process','several steps','多階段單向流程'],['blending','mixed together','混合'],['four measured ingredients','four measured materials','四項指定份量原料']),
 v(['accounts for by far the largest share','makes up the most','佔最大份額'],['smallest component','makes up the least','比例最小成分']),
 v(['At the beginning','First','開始時'],['fed into a crusher','go into a crusher','送進破碎機'],['reduced to powder','breaks them into powder','磨成粉末']),
 v(['transferred to a mixer','goes into a mixer','送往攪拌機'],['passes into','then into','接着進入'],['rotating heater','rotating heater','旋轉加熱器']),
 v(['As the mixture moves','As the mix travels','混合物移動時'],['heat is applied from one end','heat comes from one end','一端加熱'],['processed in a grinder','a grinder breaks down','研磨機處理']),
 v(['resulting cement','cement made this way','產出的水泥'],['finally packed','Finally,','最後裝袋'],['bags','bags','袋子']),
 v(['Concrete production','Making concrete','混凝土生產'],['involves fewer stages','has fewer steps','工序較少']),
 v(['poured into a concrete mixer','go into a turning concrete mixer','倒入混凝土攪拌機'],['rotates','turning','旋轉'],['combine them','blends them','混合']),
 v(['labelled as small stones','or small stones','標作小石'],['makes up half','is 50%','佔一半'],['a further quarter','another 25%','另佔四分之一']),
 v(['constitute','is','構成'],['respectively','in that order','依次分別'],['finished concrete','make concrete','完成混凝土'],['building work','building','建築工程']),
];
const structures=[
 f('The diagrams illustrate the stages and equipment used to make steel, and how this steel is then used to produce beams for construction.','引言交代第一製程的成品如何作第二製程材料',[1,4,8],{formula:'The diagrams illustrate the stages and equipment used to make [中間成品], and how this [中間成品] is then used to produce [最終產品] for construction',meaning:'左圖製 cement；右圖 cement 佔 15% 並與其他三項混合成 concrete。',usage:'cement 與 concrete 是不同材料，不能把兩詞當同義。',parts:[link('The diagrams illustrate the stages and equipment used to make'),slot(' cement','中間成品'),link(', and how this'),slot(' cement','重提中間成品'),link(' is then used to produce'),slot(' concrete','最終產品'),link(' for construction.')]}),
 f('Overall, pigment manufacture is a multi-stage linear process involving crushing, mixing, heating and grinding, whereas paint production is much simpler, requiring only the blending of four measured ingredients.','以 whereas 對比水泥多工序與混凝土單次混合',[0,4,8],{formula:'Overall, [第一製程] is a multi-stage linear process involving crushing, mixing, heating and grinding, whereas [第二製程] is much simpler, requiring only the blending of four measured ingredients',meaning:'左圖 limestone+clay 經 crusher、mixer、heater、grinder；右圖四材料入一台 mixer。',usage:'四個 ingredient 是 cement、sand、gravel、water；不是四台機器。',parts:[link('Overall,'),slot(' cement manufacture','第一製程'),link(' is a multi-stage linear process involving crushing, mixing, heating and grinding, whereas'),slot(' concrete production','第二製程'),link(' is much simpler, requiring only the blending of four measured ingredients.')]}),
 f('Crushed stone accounts for by far the largest share of concrete, while admixture is the smallest component.','以最大與最小份額概括右圖配比',[0,4,9],{formula:'[最大成分] accounts for by far the largest share of concrete, while [最小成分] is the smallest component',meaning:'gravel 50% 最大，water 10% 最小。',usage:'份額按混凝土配比，不是水泥製程材料用量。',parts:[slot('Gravel','最大成分'),link(' accounts for by far the largest share of concrete, while'),slot(' water','最小成分'),link(' is the smallest component.')]}),
 f('At the beginning of the cement-making process, limestone and shale are fed into a crusher, where they are reduced to powder.','起步交代兩原料、破碎機及粉末產物',[0,4,8],{formula:'At the beginning of the cement-making process, [兩原料] are fed into a crusher, where they are reduced to powder',meaning:'左圖 limestone 與 clay 進 crusher，出粉末。',usage:'此處尚未加入 concrete 的 sand／gravel／water。',parts:[link('At the beginning of the cement-making process,'),slot(' limestone and clay','兩原料'),link(' are fed into a crusher, where they are reduced to powder.')]}),
 f('This powder is transferred to a mixer and then passes into a heated rotating chamber.','以 This powder 接上一步並保留 mixer→heater 先後',[0,3,8],{formula:'This powder is transferred to a mixer and then passes into [下一設備]',meaning:'粉末先進 Mixer，再進 Rotating heater。',usage:'此 mixer 是水泥製程設備，右圖 concrete mixer 是另一台；不能混同。',parts:[link('This powder is transferred to a mixer and then passes into'),slot(' a rotating heater','下一設備'),link('.')]}),
 f('As the mixture moves through this cylinder, heat is applied from one end, after which the heated material is processed in a fine grinder.','在旋轉加熱筒受熱後再研磨',[0,4,8],{formula:'As the mixture moves through this cylinder, heat is applied from one end, after which the heated material is processed in [下一設備]',meaning:'heat 從 heater 一端施加；出筒後經 grinder。',usage:'after which 表先加熱後研磨，不是先研磨後加熱。',parts:[link('As the mixture moves through this cylinder, heat is applied from one end, after which the heated material is processed in'),slot(' a grinder','下一設備'),link('.')]}),
 f('The resulting cement is finally packed into sacks.','簡明交代左圖的裝袋終點',[0,4,8],{formula:'The resulting cement is finally packed into [包裝]',meaning:'grinder 後水泥裝 Bags；下圖可取作混凝土原料。',usage:'裝袋產物仍是 cement，不是 concrete。',parts:[link('The resulting cement is finally packed into'),slot(' bags','包裝'),link('.')]}),
 f('Concrete production involves two fewer stages.','以短句切換到更簡單的右圖',[0,4,9],{formula:'Concrete production involves [比較步數]',meaning:'右圖只將四項原料倒入一台旋轉混凝土攪拌機；相對左圖工序較少。',usage:'原文只說 fewer stages，未給精確差幾步；不可自行算出「少兩步」。',parts:[link('Concrete production involves'),slot(' fewer stages','比較步數'),link('.')]}),
 f('Cement, sand, crushed stone and water are all poured into a concrete mixer, which rotates to combine them.','把四原料與唯一混合設備接在一句',[0,4,9],{formula:'[四原料] are all poured into a concrete mixer, which rotates to combine them',meaning:'cement、sand、gravel、water 四項一起倒進 concrete mixer。',usage:'四項同時入 mixer，沒有顯示另加 limestone 或 clay 到混凝土。',parts:[slot('Cement, sand, gravel and water','四原料'),link(' are all poured into a concrete mixer, which rotates to combine them.')]}),
 f('Gravel, labelled as small stones, makes up half of the mixture, while sand accounts for a further third.','說明 gravel 俗稱和前兩大份額',[0,4,8],{formula:'Gravel, labelled as small stones, makes up half of the mixture, while sand accounts for a further [沙份額]',meaning:'gravel 50%，sand 25%；合計 75%。',usage:'a further quarter = 25% 而非再增加 25 個百分點到 gravel 單項。',parts:[link('Gravel, labelled as small stones, makes up half of the mixture, while sand accounts for a further'),slot(' quarter','沙份額'),link('.')]}),
 f('Cement and water constitute 20% and 5%, respectively, before the finished concrete is ready for building work.','以 respectively 把兩個較小份額逐一對應',[0,4,8],{formula:'Cement and water constitute [水泥份額] and [水份額], respectively, before the finished concrete is ready for building work',meaning:'cement 15%、water 10%；四項 50+25+15+10=100%。',usage:'cement 為 15%，water 為 10%；不可顛倒或當成水泥製程配比。',parts:[link('Cement and water constitute'),slot(' 15%','水泥份額'),link(' and'),slot(' 10%','水份額'),link(', respectively, before the finished concrete is ready for building work.')]}),
];
const intro=[quiz('兩圖最關鍵的材料關係？',['左圖製水泥；右圖把水泥作四原料之一製混凝土','水泥與混凝土是同一名稱','右圖先製混凝土，左圖再提水泥','兩圖都只製水泥'],'右圖 Cement 15% 是四項之一。'),{type:'multi',prompt:'哪兩項適合作概覽？',detail:'選兩項，再按「確認」。',options:['水泥經破碎、攪拌、加熱、研磨等多步；混凝土只需四料混合','混凝土中 gravel 50% 最大，water 10% 最小','混凝土完全由水泥構成','水泥製造只要一台混凝土攪拌機'],correct:[0,1],why:'流程對比及最大／最小配比清楚。'}];
const route=[sequence('依範文排列水泥與混凝土報告',[
 ['引言','兩圖說水泥製造，以及水泥作原料製混凝土。'],['概覽','水泥多工序，混凝土只混合四料；gravel 最大、water 最少。'],['水泥細節','石灰石和黏土經 crusher 粉碎，粉末進入 mixer，再經 rotating heater 和 grinder，最後裝袋。'],['混凝土細節','混凝土由 15% 水泥、25% 沙、50% 礫石及 10% 水組成，四種材料在 concrete mixer 中旋轉混合。'],
],'左邊水泥 mixer 和右邊混凝土 mixer 是兩個不同流程的設備。')];
const evidence=[
 quiz('水泥生產最初兩項原料？',['石灰石與黏土','砂與砂石','水泥與水','木材與玻璃'],'左圖 Limestone + Clay。'),
 quiz('crusher 產物？',['粉末','完成混凝土','食物容器','糖晶'],'左圖標 Powder。'),
 quiz('粉末之後依次經甚麼設備？',['攪拌機→旋轉加熱器→研磨機','混凝土機→裝袋→破碎機','研磨機→田地→蒸發器','只有一台混凝土機'],'左圖粉末→Mixer→Rotating heater→Grinder。'),
 quiz('加熱發生在哪裏？',['旋轉加熱器一端','混凝土機內的砂石上','裝袋之後','圖未畫熱源'],'左圖 Heat 箭頭入 Rotating heater 一端。'),
 quiz('左圖最後產物？',['袋裝水泥','已完成混凝土','只有石灰石','水庫電力'],'Grinder 後 Bags Cement。'),
 quiz('混凝土的四項原料？',['水泥、砂、砂石和水','水泥、石灰石、黏土和熱','木材、砂、糖和水','只有水泥一項'],'右圖四個流入 concrete mixer。'),
 quiz('四項比例依次為 gravel／sand／cement／water？',['50%／25%／15%／10%','10%／15%／25%／50%','各 25%','50%／50%／15%／10%'],'右圖標記，合計 100%。'),
];
const logic=[sequence('左圖：水泥是先製成的中間品',[
 ['原料與粉末','石灰石、黏土進 crusher，磨成 powder。'],['混合與加熱','粉末進 mixer，再進 rotating heater，由一端加熱。'],['研磨與包裝','受熱物進 grinder，產出 cement 裝袋。'],['下一圖的用途','水泥只佔混凝土配比 15%。'],
 ],'兩個流程有不同 mixer；不能把 cement 當作全部 concrete。'),sequence('右圖：混凝土配比與單次混合',[
 ['gravel','小石 50%，最大。'],['sand','砂 25%，與 gravel 合計 75%。'],['cement','前圖產物水泥 15%。'],['water','水 10%，最小；四項合計 100%。'],
 ],'比例的分母是完成混凝土，不是水泥原料配比。')];
const transfers=[
 transfer('另一雙圖先製材料 A，再用 A 與其他材料製成 B。','哪句引言保留兩圖關係？',['兩圖展示水泥的設備與製程，以及水泥如何進一步用於製混凝土。','兩圖只比較混凝土價格。','水泥與混凝土是同一材料。','先完成混凝土後才做水泥。'],['先產物後用途、方向準。','沒有價格。','材料不同。','順序反。'],[0],'原文 make cement；cement then produce concrete。'),
 transfer('左圖多工序，右圖四料進一台機。','哪句概覽比較準確？',['水泥須破碎、攪拌、加熱、研磨；混凝土只混合四項計量原料。','兩種材料都只需直接裝袋。','混凝土須先把四料分別加熱十次。','水泥製造完全沒有機械設備。'],['兩流程複雜度與工序吻合。','水泥多工序。','右圖未畫此步。','有多機器。'],[1],'原文 multi-stage cement vs simpler blending four ingredients。'),
 transfer('右圖 gravel 50%，water 10%。','哪句用最大／最小總結配比？',['砂石佔混凝土一半為最大份額，水 10% 最少。','水 50% 最大，砂石 10% 最少。','兩者各佔一半。','比例是水泥製程中的石灰石與黏土。'],['兩項比例及分母準確。','數字互換。','合計僅 60%。','右圖是混凝土。'],[2],'原文 gravel largest，water smallest。'),
 transfer('左圖起點為 Limestone + Clay→Crusher。','哪句交代破碎產物？',['石灰石和黏土進破碎機，變成粉末。','砂石和水進破碎機直接成混凝土。','水泥袋先放進破碎機才有石灰石。','破碎機直接產生電。'],['兩原料及粉末正確。','右圖材料混淆。','順序倒置。','產物非電。'],[3],'原文 limestone and clay crushed to powder。'),
 transfer('粉末之後有 Mixer，再到 Rotating heater。','哪句按設備先後？',['粉末先轉入攪拌機，然後進旋轉加熱器。','粉末先裝袋，再進破碎機。','混凝土機直接產出石灰石。','加熱器在粉末形成之前就完成水泥。'],['兩設備順序正確。','裝袋在後。','不是此功能。','順序錯。'],[4],'原文 powder mixer→rotating heater。'),
 transfer('加熱器一端有 Heat 箭頭，之後是 Grinder。','哪句不倒置先後？',['混合物沿旋轉筒移動並受一端加熱，接着才被研磨。','先研磨已裝袋水泥，再加石灰石。','加熱只發生在混凝土機完成後。','圖沒有研磨機。'],['熱→研磨與箭頭吻合。','倒置。','左圖有熱。','Grinder 已標。'],[5],'原文 heat one end，after which grinder。'),
 transfer('研磨機後方有 Bags。','哪句正確命名左圖終品？',['研磨後得到水泥，最後裝袋。','研磨後直接得到完成混凝土。','袋中只有未壓碎黏土。','袋裝是右圖砂石唯一工序。'],['左圖成品 cement。','混凝土須另混四料。','已加工。','右圖無袋。'],[6],'原文 resulting cement packed into bags。'),
 transfer('右圖只有一台混凝土攪拌機。','哪句過渡不捏造步數？',['混凝土的生產工序較少。','混凝土恰好比水泥少兩步。','兩圖都只有同一台設備。','混凝土必須反覆燒十次。'],['原文僅說 fewer，不給精確差額。','圖未定義可比的詳細步數。','設備不同。','無此加熱。'],[7],'原文 Concrete production involves fewer stages。'),
 transfer('水泥、砂、砂石、水都指向右圖 mixer。','哪句說明共同動作？',['四項原料都倒入旋轉的混凝土攪拌機，混合成品。','水泥單獨倒入就已是混凝土。','石灰石和黏土直接加進混凝土機。','四項分別變成四種完成建築物。'],['四料共同混合。','另有三料。','那些是左圖水泥原料。','產物一種混凝土。'],[8],'原文 four ingredients poured into concrete mixer。'),
 transfer('右圖 Gravel 50%、Sand 25%。','哪句理解 half／quarter？',['小石佔一半，砂另佔四分之一，兩者合共 75%。','小石 25%，砂 50%。','兩者加起來只有 25%。','兩數字是設備的轉速。'],['份額分別 50/25。','配對反。','相加 75。','是配比。'],[9],'原文 gravel half，sand further quarter。'),
 transfer('右圖 Cement 15%、Water 10%。','哪句 respect­ively 配準且總和正確？',['水泥與水依次佔 15% 和 10%；加上砂石 50% 及砂 25% 恰好 100%。','水泥佔 10%，水佔 15%。','四項合計 110%。','水泥單項佔全部混凝土 100%。'],['順序及合計皆準。','配對反。','合計是 100。','水泥只 15%。'],[10],'原文 cement 15%，water 10% respectively。'),
];
const balancedTransferOptions=[
  ['左圖製造水泥，右圖用水泥等材料製成混凝土。','左圖製造混凝土，右圖用混凝土製成水泥。','兩圖只比較水泥與混凝土在各地的價格。','兩圖說的是同一材料，沒有不同製造階段。'],
  ['水泥經多道工序，混凝土由四種原料混合。','水泥只需直接裝袋，混凝土也不用加工。','水泥經多道工序，混凝土須各料加熱十次。','水泥完全不用機器，混凝土由四種原料混合。'],
  ['小石佔一半為最大份額，水佔一成最少。','水佔一半為最大份額，小石佔一成最少。','小石與水各佔一半，兩者合共全部。','兩份額屬於水泥製程，不是混凝土配比。'],
  ['石灰石與黏土進破碎機，形成細粉末。','砂石與清水進破碎機，直接成混凝土。','水泥袋先進破碎機，再形成石灰石。','石灰石與黏土進破碎機，直接產電。'],
  ['粉末先經攪拌機混合，再進旋轉加熱器。','粉末先裝袋運出，再進破碎機重新加工。','混凝土機先製石灰石，再進旋轉加熱器。','粉末未形成之前，加熱器已完成所有水泥。'],
  ['混合物沿旋轉筒受熱，之後才進入研磨機。','裝袋的水泥先被研磨，之後才加入石灰石。','混凝土機完成製品後，才首次為原料加熱。','混合物沿旋轉筒受熱，之後直接變成混凝土。'],
  ['研磨完成後得到水泥，最後才裝進袋中。','研磨完成後得到混凝土，最後才裝進袋中。','袋中只有尚未破碎的黏土，沒有水泥。','袋裝是右圖製砂石的唯一製造工序。'],
  ['右圖混凝土的製作工序，較左圖水泥少。','右圖混凝土的製作，恰好比水泥少兩步。','兩圖只用同一台攪拌設備製造產品。','右圖混凝土須反覆加熱，總共十次。'],
  ['四種原料一同進攪拌機，混合成混凝土。','只需將水泥一項倒入，就已製成混凝土。','石灰石與黏土直接進右圖混凝土攪拌機。','四種原料各自變成四種完整的建築物。'],
  ['小石佔 50%，砂佔 25%，兩者合共 75%。','小石佔 25%，砂佔 50%，兩者合共 75%。','小石佔 50%，砂佔 25%，兩者合共 25%。','小石轉速 50%，砂轉速 25%，不是份額。'],
  ['水泥佔 15%、水佔 10%，四料合共 100%。','水泥佔 10%、水佔 15%，四料合共 100%。','水泥佔 15%、水佔 10%，四料合共 110%。','水泥佔 100%、水佔 10%，四料合共 100%。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-process-diagram:9',meta:{topic:'水泥製造及混凝土四原料配比',summary:'左圖石灰石＋黏土→破碎粉末→混合→旋轉加熱→研磨→袋裝水泥；右圖水泥 15%、砂 25%、小石 50%、水 10% 一起入混凝土機。區分 cement 與 concrete。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
