// Task 1 Process Diagram 7: geothermal electricity, five numbered stages and two distinct wells.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'水先下、橫過熱岩、再上；蒸汽推渦輪後發電。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how a geothermal power plant uses heat under the ground to make electricity.',
 'Overall, the process has five steps in one direction.',
 'It starts when cold water is pumped deep underground. Hot rocks heat the water, which comes back up and makes steam. Finally, a machine makes electricity.',
 'First, cold water from the ground surface is pushed down an injection well about 4.5 kilometres.',
 'The water moves sideways through hot rocks under the ground and gets hot.',
 'Then the hot water comes back up a different well, called the production well, instead of going down the injection well.',
 'After the hot water comes up, it enters the part labelled condenser, where steam comes out in this diagram.',
 'The steam then flows into a turbine and makes its blades turn.',
 'Finally, the turning turbine drives a generator. It makes electricity that travels along power lines.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['operation','uses','運作'],['underground heat','heat under the ground','地下熱力'],['converted into electricity','make electricity','轉化為電力']),
 v(['five-stage','five steps','五個步驟'],['linear process','one direction','單向流程']),
 v(['cold water being pumped','cold water is pumped','冷水被泵送'],['deep below the surface','deep underground','地底深處'],['key transformation','Hot rocks heat','主要轉化'],['used to produce steam','makes steam','產生蒸汽'],['electricity being generated','makes electricity','發電']),
 v(['At the first stage','First','首先'],['cold water stored at ground level','cold water from the ground surface','地面冷水'],['forced down','pushed down','向下泵送'],['injection well','injection well','注入井'],['depth of about 4.5 kilometres','about 4.5 kilometres','約四點五公里深']),
 v(['geothermal zone','under the ground','地熱區'],['passes horizontally','moves sideways','橫向流動'],['hot rocks','hot rocks','熱岩'],['absorbs heat','gets hot','吸熱']),
 v(['travels back towards the surface','comes back up','回到地表'],['separate production well','different well, called the production well','另一口生產井'],['in contrast to','instead of','有別於'],['initial downward movement','going down','初時下行']),
 v(['heated water has been pumped up','hot water comes up','熱水被泵上'],['enters a condenser','enters the part labelled condenser','進入圖標冷凝器'],['steam is released','steam comes out','蒸汽出來']),
 v(['directed into a turbine','flows into a turbine','引向渦輪機'],['causing the turbine blades to rotate','makes its blades turn','使葉片旋轉']),
 v(['In the final stage','Finally','最後階段'],['rotating turbine','turning turbine','轉動渦輪'],['powers a generator','drives a generator','帶動發電機'],['transmitted through power lines','travels along power lines','經電線輸送']),
];
const structures=[
 f('The diagram illustrates the operation of a solar-thermal plant and the stages through which stored heat is converted into electricity.','引言交代裝置和熱能轉電的主線',[1,3,7],{formula:'The diagram illustrates the operation of [電站] and the stages through which [熱源] is converted into electricity',meaning:'geothermal plant 利用地下熱岩加熱水，最後驅動發電機。',usage:'地熱不是地表陽光；本圖不顯示燃燒燃料。',parts:[link('The diagram illustrates the operation of'),slot(' a geothermal power plant','電站'),link(' and the stages through which'),slot(' underground heat','熱源'),link(' is converted into electricity.')]}),
 f('Overall, this is a six-stage, linear process.','以最短概覽句交代標號步數與方向',[0,3,8],{formula:'Overall, this is a [步數]-stage, linear process',meaning:'圖標 1–5 依次由冷水到發電，無回流箭頭。',usage:'五步按圖上標號；不能把 injection 與 production 井當成同一口。',parts:[link('Overall, this is a'),slot(' five','步數'),link('-stage, linear process.')]}),
 f('It begins with cold water being pumped deep below the surface and ends with electricity being generated, with the key transformation occurring when water is heated by solar panels and then used to produce steam.','概覽起終點並指出熱水／蒸汽的關鍵轉化',[0,4,8],{formula:'It begins with cold water being pumped deep below the surface and ends with electricity being generated, with the key transformation occurring when water is heated by [熱源] and then used to produce steam',meaning:'冷水下行經 hot rocks 吸熱，回到地面形成 steam，最後發電。',usage:'熱源是地下 hot rocks；圖沒有 solar panels。',parts:[link('It begins with cold water being pumped deep below the surface and ends with electricity being generated, with the key transformation occurring when water is heated by'),slot(' hot rocks','熱源'),link(' and then used to produce steam.')]}),
 f('At the first stage, cold water stored at ground level is forced down through an injection well to a depth of about 5 kilometres.','第一步定位冷水、下行井與約略深度',[0,4,7],{formula:'At the first stage, cold water stored at ground level is forced down through an injection well to a depth of about [深度]',meaning:'左側 injection well 把冷水泵到約 4.5 km 地下。',usage:'4.5 km 是井深約數，不是兩井間水平距離。',parts:[link('At the first stage, cold water stored at ground level is forced down through an injection well to a depth of about'),slot(' 4.5 kilometres','深度'),link('.')]}),
 f('Once it reaches the geothermal zone, the water passes horizontally through an area of heated rocks, where it absorbs heat.','在兩井之間說明水平路徑和吸熱作用',[0,3,7],{formula:'Once it reaches the geothermal zone, the water passes horizontally through an area of [岩石], where it absorbs heat',meaning:'地底 Geothermal zone 標 hot rocks；水由注入井向生產井橫流並受熱。',usage:'where 指 hot rocks 區；水平流後才經 production well 上行。',parts:[link('Once it reaches the geothermal zone, the water passes horizontally through an area of'),slot(' hot rocks','岩石'),link(', where it absorbs heat.')]}),
 f('It then travels back towards the surface through a separate return well, in contrast to the initial downward movement through the injection well.','明確區分上行生產井和下行注入井',[0,4,8],{formula:'It then travels back towards the surface through a separate [上行井], in contrast to the initial downward movement through the injection well',meaning:'左井 injection down；右井 production up，不是同一口井。',usage:'in contrast to 對比水流方向；圖沒有表示地熱區內水逆流回左井。',parts:[link('It then travels back towards the surface through a separate'),slot(' production well','上行井'),link(', in contrast to the initial downward movement through the injection well.')]}),
 f('After the heated water has been pumped up, it enters a steam chamber, from which steam is released.','忠實描述圖示的熱水入標記部件與蒸汽輸出',[0,4,8],{formula:'After the heated water has been pumped up, it enters a [圖中部件], from which steam is released',meaning:'圖上 hot water pumped up→標作 Condenser 的部件→Steam 箭頭。',usage:'這句按本圖標示描述，不自行推論此部件在一般工程中必有同一作用。',parts:[link('After the heated water has been pumped up, it enters a'),slot(' condenser','圖中部件'),link(', from which steam is released.')]}),
 f('This steam is directed into a small turbine, causing the turbine blades to rotate.','蒸汽驅動渦輪葉片轉動',[0,4,6],{formula:'This steam is directed into a [受力裝置], causing the turbine blades to rotate',meaning:'Steam 箭頭入 Turbine；葉片旋轉。',usage:'This steam 回指上一句輸出的蒸汽；渦輪與後面的 generator 不是同一部件。',parts:[link('This steam is directed into a'),slot(' turbine','受力裝置'),link(', causing the turbine blades to rotate.')]}),
 f('In the final stage, the rotating turbine powers a generator, which produces electricity that is then transmitted through power cables.','末步交代渦輪帶發電機及電力輸送',[0,4,7],{formula:'In the final stage, the rotating turbine powers a generator, which produces electricity that is then transmitted through [輸電途徑]',meaning:'圖標 stage 5 渦輪機接 generator，電經 power lines 送出。',usage:'渦輪靠蒸汽轉，generator 產生電；不要把注入井寫成輸電途徑。',parts:[link('In the final stage, the rotating turbine powers a generator, which produces electricity that is then transmitted through'),slot(' power lines','輸電途徑'),link('.')]}),
];
const intro=[quiz('這幅圖有幾個標號？',['五步單向流程','八步閉環循環','只有兩步','十二個互不相干地點'],'圖標 1 cold water 至 5 turbine/generator。'),{type:'multi',prompt:'哪兩項適合寫入概覽？',detail:'選兩項，再按「確認」。',options:['冷水由注入井下行，經熱岩吸熱，再由生產井上行','熱水經圖標部件產生蒸汽，蒸汽推渦輪帶發電機','同一口井先上行再下行','圖中電力由燃煤鍋爐產生'],correct:[0,1],why:'主路徑與關鍵轉化均按箭頭。'}];
const route=[sequence('依範文排四段地熱發電報告',[
 ['引言','地熱發電站以地下熱力轉電。'],['概覽','五步單向；冷水下行經熱岩吸熱，熱水回地面成蒸汽後發電。'],['地下細節','約 4.5 km 注入井向下→hot rocks 區水平→獨立 production well 向上。'],['地面細節','熱水入 Condenser 標記部件→steam→turbine→generator→power lines。'],
],'圖標 condenser 的運作只按本圖描述；不要自行補未標示的工程原理。')];
const evidence=[
 quiz('冷水沿哪口井下行？',['注入井 injection well','生產井 production well','兩口井同時向下','電線塔'],'左側 injection well 標 Cold water pumped down。'),
 quiz('圖示深度約多少？',['4.5 公里','45 公尺','4.5 公尺','450 公里'],'左側垂直括號 4.5 km。'),
 quiz('地下水怎樣受熱？',['在地熱區水平穿過熱岩','由電線直接通電','在上方發電機燃燒','由冷卻塔加冰'],'圖中 Geothermal zone (hot rocks)。'),
 quiz('加熱後的水沿哪口井上行？',['生產井 production well','注入井 injection well','同一電線','圖未顯示上行'],'右側 Hot water pumped up。'),
 quiz('圖中哪個標記部件在熱水與 steam 箭頭之間？',['Condenser','Injection well','Generator','Power line'],'圖 stage 4 標 Condenser，蒸汽由其出口通往渦輪。'),
 quiz('甚麼令渦輪轉動？',['蒸汽','冷水入井之前的陽光','電線塔直接撞擊','砂石'],'Steam 箭頭指向 Turbine。'),
 quiz('最後由甚麼發電並輸送？',['渦輪帶動發電機，電沿電線輸送','注入井直接製成成衣','熱岩直接變成電線','冷水自己變成電網'],'圖 stage 5 Generator 旁註 produces electricity。'),
];
const logic=[sequence('五步：水路與能量轉換',[
 ['1–2 冷水下行','地面冷水經 injection well 下至約 4.5 km。'],['3 地熱吸收','水橫過 hot rocks，升溫後沿 production well 上行。'],['4 蒸汽','上來的熱水進標作 Condenser 的部件，圖示 steam 出口。'],['5 發電','蒸汽推 turbine，turbine 帶 generator，電沿 power lines 輸送。'],
 ],'兩口井方向相反；圖中未畫水回到第一口井的回流箭頭。'),sequence('把六個名詞接成單向因果鏈',[
 ['冷水','起點，從地面向下。'],['熱岩','地下加熱水。'],['熱水與蒸汽','熱水回地表，部件出口為蒸汽。'],['渦輪與發電機','蒸汽推轉渦輪，發電機產電。'],
 ],'不可把 generator 和 turbine 當同一裝置，也不添加圖外能量來源。')];
const transfers=[
 transfer('另一圖展示地下熱力經水與蒸汽推動發電機。','哪句引言清楚交代熱源及產物？',['流程圖展示地熱發電站如何將地下熱力轉為電力。','流程圖只比較不同公司的電價。','熱岩直接變成電線。','圖展示塑膠回收而非發電。'],['地熱→電力主線吻合。','非價格。','仍有水蒸汽機械步驟。','主題錯。'],[0],'原文 underground heat converted into electricity。'),
 transfer('圖標 1–5，箭頭沒有回起點。','哪句總結結構？',['這是五步單向流程。','這是九步反覆回到冷水箱的閉環。','每個標號代表一個不同國家。','圖沒有任何順序箭頭。'],['標號和方向正確。','沒有九步或回圈。','不是地理圖。','有箭頭。'],[1],'原文 five-stage linear process。'),
 transfer('冷水下地底，受熱變蒸汽，最後發電。','哪句概覽保留關鍵轉化？',['冷水被泵入地下，經熱岩加熱後用於產蒸汽，最後產電。','電力先變成冷水，然後才出現熱岩。','圖只說水位，沒有熱力。','熱岩被運到地面成為電線。'],['冷水→熱→蒸汽→電。','方向錯。','有 hot rocks。','熱岩留地底。'],[2],'原文 cold water deep→hot rocks→steam→electricity。'),
 transfer('左井標 Injection well，旁標 4.5 km。','哪句深度與方向準確？',['地面冷水沿注入井泵到約 4.5 公里深。','熱水沿注入井向上升 4.5 公尺。','4.5 公里是兩個發電站的距離。','注入井是電力輸出線。'],['冷水、下行、深度都對圖。','井與單位都錯。','標示垂直深度。','不是電線。'],[3],'原文 injection well down to about 4.5 km。'),
 transfer('兩口井底部之間標 Geothermal zone (hot rocks)。','哪句說明水平段？',['水橫向流過熱岩區，並吸收熱量。','水在電線塔上方才接觸熱岩。','熱岩被泵上地面作燃料。','水在熱岩區只會變得更冷。'],['水平箭頭與吸熱關係吻合。','位置錯。','熱岩在地下。','吸熱會升溫。'],[4],'原文 water passes horizontally through hot rocks，absorbs heat。'),
 transfer('冷水沿左井下降；熱水沿右井上升。','哪句區分兩井？',['熱水經另一口生產井回地表，與最初沿注入井下行相反。','熱水沿同一注入井和冷水逆向相撞。','生產井只輸送電力。','圖只有一口井。'],['井名、方向和差別準確。','兩井分開。','生產井送熱水。','圖畫兩井。'],[5],'原文 separate production well up vs injection well down。'),
 transfer('熱水上升後進圖標 Condenser，出口有 Steam 箭頭。','哪句只按圖描述？',['上升的熱水進入圖中標作 Condenser 的部件，蒸汽從出口流出。','圖明確畫水在地下直接變成電線。','圖顯示蒸汽先推渦輪再進 Condenser。','所有地熱廠的 Condenser 必定都以此方式工作。'],['只報本圖箭頭與標籤。','圖有多步。','蒸汽先由部件流向渦輪。','不可從單圖概括所有工程。'],[6],'原文 heated water enters condenser，steam released。'),
 transfer('Steam 箭頭指向 Turbine。','哪句交代機械效果？',['蒸汽被引入渦輪，使葉片旋轉。','蒸汽被注入冷水井形成冰。','發電機先轉動，才從水中產生熱岩。','渦輪只是水的儲存槽。'],['蒸汽流向與葉片動作對圖。','沒有結冰。','順序錯。','渦輪是機械裝置。'],[7],'原文 steam directed turbine，blades rotate。'),
 transfer('Turbine 接 Generator，旁有電線塔。','哪句收束能源鏈？',['旋轉的渦輪帶動發電機產電，電再經電線輸送。','注入井把電直接輸送到地下。','發電機只負責把冷水變冰。','圖最後一步是種植樹木。'],['裝置角色與輸電路徑準確。','井送水。','發電機產電。','沒有樹。'],[8],'原文 turbine powers generator→electricity via power lines。'),
 transfer('圖只畫冷水下行、熱水上行、蒸汽與輸電。','哪個額外結論不獲圖支持？',['整個系統沒有任何耗能或環境影響。','冷水沿注入井下行。','水在地下經熱岩受熱。','渦輪帶發電機產電。'],['圖未提供總能耗或環境數據。','圖直接畫。','圖直接畫。','圖直接畫。'],[0,2,8],'原文只報圖示流程，沒有總能耗或環境資料。'),
];
export default {key:'task1-process-diagram:7',meta:{topic:'地熱發電五步：注入井、熱岩、生產井、蒸汽與發電',summary:'冷水經 injection well 下至約 4.5 km→地熱岩區橫流吸熱→獨立 production well 上行→圖標 Condenser 的部件輸出 steam→渦輪帶發電機，電經電線輸送。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
