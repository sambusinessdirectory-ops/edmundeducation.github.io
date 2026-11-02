// Task 1 Tables 4: German overnight stays by domestic/international tourists, 2016–22.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'題目量度過夜住宿次數，單位百萬；不可改成人數。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看 2016–19 上升，再看 2020 跌、2021 分化、2022 回升。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows how many nights domestic and foreign tourists spent in Germany from 2016 to 2022, in millions.',
 'Overall, domestic tourists spent many more nights there than foreign tourists every year.',
 'Both groups went up each year until 2019, then fell a lot in 2020. They rose again by 2022, but neither reached the 2019 high.',
 'From 2016 to 2019, nights spent by domestic tourists rose each year, from 366.4 million to 405.7 million.',
 'Nights spent by foreign tourists also rose, but the numbers were much smaller: 80.8 million in 2016 to 89.9 million in 2019.',
 'So domestic nights were about four and a half times foreign nights during those early years.',
 'After 2019, the pattern changed a lot.',
 'Domestic nights fell to 270.3 million in 2020, over 130 million fewer than in 2019, then rose a little to 279.23 million in 2021.',
 'Foreign-tourist nights fell much more as a share of their 2019 level: 89.9 million in 2019 to 32 million in 2020, then a little lower at 31.01 million in 2021.',
 'In 2022, domestic nights rose to 382.62 million and foreign nights to 68.09 million in that order. Both were still below 2019.',
];
const vocabulary=[
 v(['presents data','shows','展示資料'],['number of nights spent','how many nights','過夜住宿次數'],['domestic and international tourists','domestic and foreign tourists','本地及國際旅客'],['measured in millions','in millions','以百萬計']),
 v(['accounted for far more overnight stays','spent many more nights','過夜住宿遠多'],['throughout the period','every year','整段期間']),
 v(['rose steadily','went up each year','穩步上升'],['falling sharply','fell a lot','急跌'],['recovered strongly','rose again','明顯回升'],['pre-decline peak','2019 high','下跌前高點']),
 v(['domestic-tourist nights','nights spent by domestic tourists','本地旅客過夜次數'],['increased consistently','rose each year','連續增加'],['rising from','from','由某值上升']),
 v(['international figure','Nights spent by foreign tourists','國際旅客數值'],['similar but much smaller upward trend','also rose, but the numbers were much smaller','同向但規模較小'],['over the same years','in 2016 to 89.9 million in 2019','同一期間']),
 v(['As a result','So','因此'],['domestic stays','domestic nights','本地住宿'],['roughly four and a half times','about four and a half times','約四點五倍'],['overseas stays','foreign nights','海外旅客住宿']),
 v(['pattern changed markedly','pattern changed a lot','走勢明顯改變'],['after 2019','After 2019','二〇一九年後']),
 v(['Domestic nights','Domestic nights','本地旅客過夜次數'],['dropped','fell','下跌'],['a fall of more than 130 million','over 130 million fewer','減少逾一億三千萬'],['edging up','rose a little','微升']),
 v(['International nights','Foreign-tourist nights','國際旅客過夜次數'],['more steeply in proportional terms','much more as a share','按比例跌得更急'],['plunging','fell','急跌'],['slipping','a little lower','再微跌']),
 v(['rebounded','rose','回升'],['respectively','in that order','依次分別'],['remained below','still below','仍低於']),
];
const structures=[
 f('The table presents data on the number of nights spent in a European country by domestic and international tourists between 2016 and 2022, measured in millions.','引言交代過夜次數、兩種旅客、年份與百萬單位',[1,3,8],{formula:'The table presents data on the number of nights spent in [地點] by domestic and international tourists between [起年] and [終年], measured in millions',meaning:'題目問 Germany 的過夜住宿次數，國內／國際兩類，2016–2022，單位百萬。',usage:'night stays 不是 unique tourists 人數；同一旅客可住多晚。',parts:[link('The table presents data on the number of nights spent in'),slot(' Germany','地點'),link(' by domestic and international tourists between'),slot(' 2016','起年'),link(' and'),slot(' 2022','終年'),link(', measured in millions.')]}),
 f('Overall, domestic tourism accounted for far more overnight stays than international tourism throughout the five-year period.','概覽本地類在每年均遠高於國際類',[0,4,8],{formula:'Overall, domestic tourism accounted for far more overnight stays than international tourism throughout [期間]',meaning:'2016–2022 每年 domestic 欄都大於 international 欄。',usage:'far more 指過夜住宿數，不等於每人停留晚數更長。',parts:[link('Overall, domestic tourism accounted for far more overnight stays than international tourism throughout'),slot(' the period','期間'),link('.')]}),
 f('Both categories rose steadily until 2015, before falling sharply in 2016; although they recovered strongly by 2018, neither returned fully to its pre-decline peak.','用分號串起共同上升、跌落、未完全回峰三段趨勢',[0,4,8],{formula:'Both categories rose steadily until [高點年], before falling sharply in [急跌年]; although they recovered strongly by [末年], neither returned fully to its pre-decline peak',meaning:'兩欄 2016–19 升；2020 跌；2022 回升但仍低於 2019。',usage:'2021 國際類又微跌，因此不能說兩類自 2020 起每年都回升。',parts:[link('Both categories rose steadily until'),slot(' 2019','高點年'),link(', before falling sharply in'),slot(' 2020','急跌年'),link('; although they recovered strongly by'),slot(' 2022','末年'),link(', neither returned fully to its pre-decline peak.')]}),
 f('From 2016 to 2019, domestic-tourist nights increased consistently, rising from 365 million to 400 million.','先報本地類的四年連續增長和首尾值',[0,4,8],{formula:'From 2016 to 2019, domestic-tourist nights increased consistently, rising from [起值] to [終值]',meaning:'domestic 366.4→375.6→390.3→405.7m。',usage:'首尾數值為 nights，不是相異旅客個數。',parts:[link('From 2016 to 2019, domestic-tourist nights increased consistently, rising from'),slot(' 366.4 million','起值'),link(' to'),slot(' 405.7 million','終值'),link('.')]}),
 f('The international figure followed a similar but much smaller upward trend, climbing from 81 million to 90 million over the same years.','對照國際類同向但規模較小的前期增長',[0,3,8],{formula:'The international figure followed a similar but much smaller upward trend, climbing from [起值] to [終值] over the same years',meaning:'international 80.8→83.9→87.7→89.9m。',usage:'同向指 2016–19 皆上升；不表示金額或百分比增幅一樣。',parts:[link('The international figure followed a similar but much smaller upward trend, climbing from'),slot(' 80.8 million','起值'),link(' to'),slot(' 89.9 million','終值'),link(' over the same years.')]}),
 f('As a result, domestic stays were roughly three times as high as overseas stays during this initial period.','用倍數概括前期兩欄規模差',[0,4,8],{formula:'As a result, domestic stays were roughly [倍數] as high as overseas stays during this initial period',meaning:'2016 366.4/80.8≈4.54；2019 405.7/89.9≈4.51。',usage:'roughly 4.5× 是前期近似比較；2020 比例已改，不能套用所有年份。',parts:[link('As a result, domestic stays were roughly'),slot(' four and a half times','倍數'),link(' as high as overseas stays during this initial period.')]}),
 f('The pattern changed markedly in 2020.','以短過渡句劃開 2019 前後',[0,4,8],{formula:'The pattern changed markedly [轉折時點]',meaning:'2019 後兩欄在 2020 急跌。',usage:'句子只標轉折，後文要用具體數字證明。',parts:[link('The pattern changed markedly'),slot(' after 2019','轉折時點'),link('.')]}),
 f('Domestic nights dropped to 275 million in 2020, a fall of more than 130 million, before edging up to 280 million in 2021.','本地類先急跌再小幅回升，核算絕對差額',[0,4,9],{formula:'Domestic nights dropped to [低點值] in 2020, a fall of more than 130 million, before edging up to [次年值] in 2021',meaning:'405.7→270.3m 跌 135.4m；2021 279.23m。',usage:'2020→2021 本地類微升，與國際類 2021 微跌不同。',parts:[link('Domestic nights dropped to'),slot(' 270.3 million','低點值'),link(' in 2020, a fall of more than 130 million, before edging up to'),slot(' 279.23 million','次年值'),link(' in 2021.')]}),
 f('International nights fell even more steeply in proportional terms, plunging from 90 million in 2019 to 30 million in 2020 and then slipping to 29 million in 2021.','用 proportional terms 與本地類比較相對跌幅',[0,4,7],{formula:'International nights fell even more steeply in proportional terms, plunging from [2019 值] in 2019 to [2020 值] in 2020 and then slipping to [2021 值] in 2021',meaning:'international 89.9→32→31.01m；相對 2019 下降約 64%，比 domestic 約 33% 大。',usage:'proportional terms 是百分比跌幅，不能與絕對減少晚數混為一談。',parts:[link('International nights fell even more steeply in proportional terms, plunging from'),slot(' 89.9 million','2019 值'),link(' in 2019 to'),slot(' 32 million','2020 值'),link(' in 2020 and then slipping to'),slot(' 31.01 million','2021 值'),link(' in 2021.')]}),
 f('By 2022, domestic and international figures had rebounded to 380 million and 70 million respectively, but both remained below their 2019 levels.','依次配對 2022 兩欄，指出仍未回 2019 高點',[0,4,8],{formula:'By 2022, domestic and international figures had rebounded to [本地終值] and [國際終值] respectively, but both remained below their 2019 levels',meaning:'2022 domestic 382.62m <405.7m；international 68.09m <89.9m。',usage:'respectively 先 domestic 後 international，不能顛倒。',parts:[link('By 2022, domestic and international figures had rebounded to'),slot(' 382.62 million','本地終值'),link(' and'),slot(' 68.09 million','國際終值'),link(' respectively, but both remained below their 2019 levels.')]}),
];
const intro=[quiz('題目要求量度甚麼？',['旅客在德國過夜住宿的晚數（百萬）','不重複旅客人頭數','酒店房價（歐元）','旅客消費總額'],'題目明言 number of nights spent，表格數字單位 mln。'),{type:'multi',prompt:'哪兩項最適合概覽？',detail:'選兩項，再按「確認」。',options:['本地旅客過夜晚數整段遠高於國際旅客','兩類至 2019 升、2020 急跌；2022 回升仍未到 2019 峰值','國際類 2021 已超越本地類','兩類 2022 都已回到 2019 以上'],correct:[0,1],why:'規模比較及共通時間趨勢。'}];
const route=[sequence('依範文排德國過夜住宿報告',[
 ['引言','2016–2022 本地與國際旅客在德國的過夜晚數，單位百萬。'],['概覽','本地遠多；兩類 2019 前升、2020 急跌、2022 回升但仍低於峰值。'],['2016–19 細節','本地 366.4→405.7m，國際 80.8→89.9m，前者約 4.5 倍。'],['2019 後細節','2020 本地 270.3／國際 32；2021 279.23／31.01；2022 382.62／68.09m。'],
],'2021 兩類方向不同；本地微升、國際微跌。')];
const evidence=[
 quiz('兩欄在 2016–19 的方向？',['兩類每年都上升','兩類每年都下降','本地每年跌，國際每年升','完全沒有變化'],'表中 2016、17、18、19 順序增加。'),
 quiz('2019 本地和國際數值？',['405.7m 和 89.9m','89.9m 和 405.7m','270.3m 和 32m','382.62m 和 68.09m'],'2019 為下跌前高點。'),
 quiz('2019→2020 本地晚數絕對減少？',['135.4m，超過 130m','35.4m','32m','405.7m'],'405.7−270.3=135.4m。'),
 quiz('哪一類按比例跌得更急？',['國際類約 64%，本地約 33%','本地約 64%，國際約 33%','兩類都恰好 0%','不能比較同類前後比例'],'以各自 2019 值作分母。'),
 quiz('2020→2021 兩類方向？',['本地微升，國際再微跌','兩類都微升','兩類都微跌','國際大增至 89.9m'],'本地 270.3→279.23，國際 32→31.01。'),
 quiz('2022 是否完全回到 2019 水平？',['兩類都未達 2019 峰值','兩類都已超過','只有國際超過','只有本地超過'],'382.62<405.7；68.09<89.9。'),
];
const logic=[sequence('按年份劃三段走勢',[
 ['2016–19','本地 366.4→405.7m；國際 80.8→89.9m，連續升。'],['2020','本地 270.3m，國際 32m，皆急跌。'],['2021','本地 279.23m 略回升；國際 31.01m 再微降。'],['2022','本地 382.62m，國際 68.09m；仍低於 2019。'],
 ],'2022 的 recovery 不等於兩類在 2021 就同步回升。'),sequence('兩種跌幅的分母與單位',[
 ['絕對值','本地 2019→2020 減 135.4 百萬晚。'],['本地相對值','135.4÷405.7≈33%。'],['國際相對值','(89.9−32)÷89.9≈64%。'],['結論','國際按比例跌得較急，即使絕對晚數減少較小。'],
 ],'比較 proportional terms 時每類都以自己的 2019 值為分母。')];
const transfers=[
 transfer('另一表記錄一國國內及海外旅客的住宿晚數。','哪句引言不寫成旅客人數？',['表格展示兩類旅客的過夜住宿晚數，單位為百萬。','表格展示每名旅客的國籍證件號碼。','每個數字都是唯一旅客人頭數。','數字代表每晚房價。'],['nights 是量度對象。','無證件資料。','同一人可住多晚。','無房價。'],[0],'原文 number of nights spent，measured in millions。'),
 transfer('本地類每年都大於國際類。','哪句概覽規模？',['全期本地旅客的過夜晚數遠高於國際旅客。','全期兩欄完全相等。','國際類每年都是較大一欄。','數字代表每人停留時長。'],['欄內總晚數比較準確。','數值差大。','方向錯。','無每人資料。'],[1],'原文 domestic far more overnight stays throughout。'),
 transfer('兩類 2019 前升、2020 跌、2022 回升未達峰。','哪句三段趨勢完整？',['兩類至 2019 穩升，2020 急跌；到 2022 回升但仍低於原峰值。','兩類 2020 後每一年都上升。','兩類 2022 均創歷史最高。','2016–19 兩類都持續下跌。'],['三段與 2021 例外相容。','國際 2021 再微跌。','低於 2019。','前期升。'],[2],'原文 rise to 2019→fall 2020→recover by 2022 below peak。'),
 transfer('本地 2016 366.4m、2019 405.7m，中間兩年也逐升。','哪句保留連續趨勢？',['本地旅客過夜晚數 2016–19 每年增加，由 366.4m 至 405.7m。','本地類由 405.7m 跌到 366.4m。','這兩數字是每人消費。','2018 年已跌至零。'],['首尾與中間方向都對。','方向反。','單位晚數。','2018 為 390.3m。'],[3],'原文 domestic 366.4→405.7m consistently。'),
 transfer('國際 2016 80.8m、2019 89.9m，與本地同向但數量較少。','哪句不把兩欄混讀？',['國際類同樣上升，但規模較小，由 80.8m 至 89.9m。','國際類由 366.4m 升至 405.7m。','國際類全期一直是較大欄。','國際類 2019 為 32m。'],['該欄數值和方向正確。','那是本地。','國際較小。','32m 是 2020。'],[4],'原文 international 80.8→89.9，smaller upward trend。'),
 transfer('2016 366.4/80.8≈4.54；2019 405.7/89.9≈4.51。','哪句近似倍數恰當？',['前期本地過夜晚數約為國際的四點五倍。','前期兩類晚數完全相同。','本地比國際多四點五晚每人。','四點五倍適用所有後期年份。'],['兩比率接近 4.5。','明顯不等。','總晚數而非每人。','2020 比例已變。'],[5],'原文 domestic roughly 4.5× overseas initial period。'),
 transfer('2019 後 2020 兩欄突然下降。','哪句合適承轉？',['2019 年之後，走勢明顯改變。','2019 年之後，兩欄每年都上升。','2019 年之前從未有資料。','2019 年之後表格變成房價。'],['短句引出後段下降。','2020 急跌。','有 2016–18。','單位仍晚數。'],[6],'原文 pattern changed markedly after 2019。'),
 transfer('本地 2019 405.7、2020 270.3、2021 279.23m。','哪句把跌與微升都報出？',['本地類在 2020 跌逾 130m 至 270.3m，2021 略回升至 279.23m。','本地類 2020 上升逾 130m。','本地類 2021 繼續跌至 31.01m。','數字代表國際類。'],['差 135.4m，次年微升。','方向反。','31.01 是國際。','本地欄。'],[7],'原文 domestic drop 270.3，fall >130，2021 279.23。'),
 transfer('國際 2019 89.9→2020 32→2021 31.01m。','哪句保留按比例更急與 2021 小跌？',['國際類按比例跌得更急，2020 至 32m，2021 再略低至 31.01m。','國際類 2021 已回升至 89.9m。','國際類按比例跌得比本地慢。','2020 的 32m 是人口百分比。'],['約 64% 跌幅且 2021 微跌。','2019 才 89.9。','國際較急。','單位晚數。'],[8],'原文 international proportional plunge and slight further dip。'),
 transfer('2022 本地 382.62m、國際 68.09m；2019 為 405.7／89.9m。','哪句依次配對並比較峰值？',['兩類 2022 依次回升至 382.62m 及 68.09m，但都低於 2019。','2022 本地 68.09m、國際 382.62m。','兩類 2022 均超越 2019。','兩類 2022 仍停在 2020 低點。'],['順序及峰值比較正確。','兩欄顛倒。','都較低。','皆回升。'],[9],'原文 2022 domestic/international respectively，both below 2019。'),
];
const balancedTransferOptions=[
  ['表格比較本地及國際旅客的過夜晚數，以百萬計。','表格比較本地及國際旅客的人頭數，以百萬計。','表格比較本地及國際旅客的每晚房價，以百萬計。','表格比較本地及國際旅客的入住率，以百萬計。'],
  ['全期本地旅客過夜晚數，均遠高於國際旅客。','全期國際旅客過夜晚數，均遠高於本地旅客。','全期本地與國際旅客過夜晚數，均大致相等。','全期本地旅客每人入住晚數，遠高於國際。'],
  ['兩類至 2019 上升，2020 跌，2022 回升未達峰。','兩類至 2019 下跌，2020 升，2022 回升達峰。','兩類至 2019 上升，2020 跌，2022 已創新高。','兩類至 2019 上升，2020 跌，2021 都有回升。'],
  ['本地晚數 2016–19 年年增，由 366.4m 至 405.7m。','本地晚數 2016–19 年年跌，由 405.7m 至 366.4m。','國際晚數 2016–19 年年增，由 366.4m 至 405.7m。','本地晚數 2016–19 年年增，由 366.4% 至 405.7%。'],
  ['國際晚數由 80.8m 增至 89.9m，仍低於本地。','國際晚數由 366.4m 增至 405.7m，仍低於本地。','國際晚數由 80.8m 減至 89.9m，仍低於本地。','國際晚數由 80.8m 增至 89.9m，已超本地。'],
  ['前期本地總晚數，約為國際的四點五倍。','前期本地總晚數，約與國際的數字相同。','前期本地每人晚數，約為國際的四點五倍。','後期本地總晚數，仍為國際的四點五倍。'],
  ['2019 年之後，兩類過夜晚數的趨勢轉變。','2019 年之後，兩類過夜晚數繼續穩升。','2019 年之前，兩類過夜晚數均無資料。','2019 年之後，表格改記每晚住宿房價。'],
  ['本地 2020 跌至 270.3m，2021 微升至 279.23m。','本地 2020 升至 270.3m，2021 微跌至 279.23m。','國際 2020 跌至 270.3m，2021 微升至 279.23m。','本地 2020 跌至 270.3m，2021 再跌至 31.01m。'],
  ['國際 2020 跌至 32m，2021 再微跌至 31.01m。','國際 2020 跌至 32m，2021 反彈至 89.9m。','國際 2020 跌至 32m，比例跌幅較小。','國際 2020 跌至 32%，2021 再微跌至 31.01%。'],
  ['2022 本地 382.62m、國際 68.09m，均低於 2019。','2022 本地 68.09m、國際 382.62m，均低於 2019。','2022 本地 382.62m、國際 68.09m，均高於 2019。','2022 本地 270.3m、國際 32m，仍停在低點。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:4',meta:{topic:'德國 2016–2022 本地及國際旅客過夜晚數',summary:'兩類 2016–19 連升，2020 急跌；本地一直遠多。2021 本地微升、國際再微降；2022 兩類回升但仍低於 2019。題目單位是百萬住宿晚數，非不重複旅客人數。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
