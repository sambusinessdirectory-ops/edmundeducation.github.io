// Task 1 Line Graph 8: US energy by fuel; historical figures and 2030 projections, quadrillion units.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖與 History／Projections 標籤，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows how much energy the United States used from six kinds of fuel between 1980 and 2030. The unit is quadrillion units, and the later values are predictions.',
 'Overall, petrol and oil was the most used fuel and is expected to remain the most used.',
 'Coal and natural gas were the next most used fuels. Coal is predicted to pass gas after about 2015. Nuclear, solar/wind and hydropower stayed much lower and are predicted to stay lower.',
 'In 1980, the US used about 35 quadrillion units of petrol and oil, about 20 of natural gas, and 16 of coal.',
 'Petrol and oil fell to just over 30 in the mid-1980s, then rose steadily to about 40 by 2005. The graph predicts about 49 by 2030.',
 'Coal rose more slowly, reaching about 22 in the mid-1990s. It stayed near that value for several years, then is predicted to rise to about 32 by 2030.',
 'Natural gas went up and down around 20–25 units, then is predicted to stay near 25 from 2015.',
 'The other three fuels were used in much smaller amounts.',
 'Nuclear energy went up slowly from about 4 to a predicted 8–9 quadrillion units.',
 'Solar/wind also rose a little and is predicted to reach about 6, while hydropower went up and down slightly and is predicted to end at about 4.',
];
const vocabulary=[
 v(['illustrates','shows','顯示'],['amount of energy consumed','how much energy the United States used','能源使用量'],['six fuel sources','six kinds of fuel','六種燃料來源'],['with later figures projected','later values are predictions','後期數值為預測']),
 v(['remained','was','保持'],['expected to remain','expected to remain','預計保持'],['dominant fuel source','most used fuel','最主要燃料']),
 v(['formed a second tier','next most used fuels','第二梯隊'],['projected to overtake','predicted to pass','預計超越'],['accounted for only small amounts','stayed much lower','使用量較少']),
 v(['consumption stood at','US used','使用量達'],['around','about','約'],['compared with about 20 for natural gas and 16 for coal','about 20 of natural gas, and 16 of coal','與另外兩種燃料相比']),
 v(['After dipping','fell','先下跌'],['just over','just over','略多於'],['rose steadily','rose steadily','穩步上升'],['projected','predicts','預測']),
 v(['gentler upward path','rose more slowly','較緩上升'],['increasing to','reaching','升至'],['remaining close to that level','stayed near that value','維持接近水平'],['approximately','about','約']),
 v(['fluctuated','went up and down','波動'],['low twenties','20–25 units','二十多個單位'],['leveling off','stay near','趨於持平']),
 v(['remaining fuels','other three fuels','其餘三種燃料'],['much less significant','used in much smaller amounts','使用量遠較少']),
 v(['climbed gradually','went up slowly','逐步上升'],['around','about','約'],['8–9 units','predicted 8–9 quadrillion units','預測八至九個單位']),
 v(['rose modestly','rose a little','小幅上升'],['whereas','while','而'],['fluctuated slightly','went up and down slightly','小幅波動'],['finished at roughly','predicted to end at about','預計期末約為']),
];
const structures=[
 f('The line graph illustrates the amount of water consumed in City A from six sources between 1980 and 2030, measured in billions of litres, with later figures projected.','引言界定六個來源、用量單位與後期預測',[1,3,7],{formula:'The [圖表類型] illustrates the amount of [資源] consumed in [地點] from [來源數] between [期間], measured in [單位], with later figures projected',meaning:'圖表顯示美國 1980–2030 年六種燃料能源使用量，縱軸為 quadrillion units，後期數值為預測。',usage:'圖上 History 與 Projections 分段，介紹全期時要提醒後段不是已發生的數據。',parts:[link('The'),slot(' line graph','圖表類型'),link(' illustrates the amount of'),slot(' energy','資源'),link(' consumed in'),slot(' the United States','地點'),link(' from'),slot(' six fuel sources','來源數'),link(' between'),slot(' 1980 and 2030','期間'),link(', measured in'),slot(' quadrillion units','單位'),link(', with later figures projected.')]}),
 f('Overall, petrol and diesel remained, and are expected to remain, the dominant fuel source.','概覽同時說歷史領先與預測期仍領先',[0,4,8],{formula:'Overall, [系列] remained, and are expected to remain, the dominant [類別]',meaning:'汽油和石油在歷史年份使用量最高，預測到 2030 年仍居首。',usage:'含歷史及預測的系列，不能把預測期直接寫成已發生；用 are expected to remain。',parts:[link('Overall,'),slot(' petrol and oil','系列'),link(' remained, and are expected to remain, the dominant'),slot(' fuel source.','類別')]}),
 f('Sources B and C formed a second tier, though B is projected to overtake C after about 2015, while D, E and F accounted for only small amounts throughout.','把第二梯隊的預測超越與其餘低值系列同句對照',[1,5,8],{formula:'[乙丙] formed a second tier, though [乙] is projected to overtake [丙] after [年], while [其餘系列] accounted for only small amounts',meaning:'煤與天然氣居第二梯隊，煤預計約 2015 年後超越氣；核能、太陽／風能、水電始終較低。',usage:'多系列圖先按數值級別分組；「預計超越」要看預測線交叉，不能寫成歷史事實。',parts:[slot('Coal and natural gas','乙丙'),link(' formed a second tier, though'),slot(' coal','乙'),link(' is projected to overtake'),slot(' gas','丙'),link(' after about'),slot(' 2015','年'),link(', while'),slot(' nuclear, solar/wind and hydropower','其餘系列'),link(' accounted for only small amounts throughout.')]}),
 f('In 1980, Source A stood at around 35 quadrillion units, compared with about 20 for B and 16 for C.','用同年同單位三個起點值建立級別差距',[0,5,9],{formula:'In [起年], [甲] stood at [值], compared with [乙值] for [乙] and [丙值] for [丙]',meaning:'1980 年汽油與石油約 35、天然氣 20、煤 16 quadrillion units。',usage:'比較起點時三值必須同年且按系列配對；quadrillion units 不是百分比。',parts:[link('In'),slot(' 1980','起年'),link(','),slot(' petrol and oil consumption','甲'),link(' stood at around'),slot(' 35 quadrillion units','甲值'),link(', compared with about'),slot(' 20','乙值'),link(' for'),slot(' natural gas','乙'),link(' and'),slot(' 16','丙值'),link(' for'),slot(' coal.','丙')]}),
 f('After dipping to just over 30 in the mid-1980s, Source A rose steadily, reaching 40 by 2005 and a projected 49 by 2030.','報告先小跌、歷史回升與預測終值',[1,3,9],{formula:'After dipping to [低點], [甲] rose steadily, reaching [歷史值] and a projected [未來值]',meaning:'汽油石油 1980 年約 35，八十年代中期略高於 30，2005 年約 40，2030 年約 49 為預測。',usage:'同句跨歷史與未來，2030 年的 49 必須保留 projected。',parts:[link('After dipping to'),slot(' just over 30 in the mid-1980s','低點'),link(','),slot(' petrol and oil','甲'),link(' rose steadily, reaching'),slot(' roughly 40 by 2005','歷史值'),link(' and a projected'),slot(' 49 by 2030.','未來值')]}),
 f('Source B followed a gentler upward path, increasing to 22 in the mid-1990s, remaining close to that level for several years, and then rising to 32 by the end.','同一系列先緩升、中段持平、再預測上升',[2,4,9],{formula:'[甲] followed a gentler upward path, increasing to [中期值], remaining close to that level, and then rising to [末值]',meaning:'煤約 1995 年 22，中段持平數年，之後預測至 2030 年約 32。',usage:'有平台期的上升線不能描述成每一年等速上升；終值仍屬預測段。',parts:[slot('Coal','甲'),link(' followed a gentler upward path, increasing to'),slot(' about 22 in the mid-1990s','中期值'),link(', remaining close to that level for several years, and then rising to'),slot(' approximately 32 by the end.','末值')]}),
 f('Source C fluctuated around the low twenties before leveling off at about 25 from 2015 onwards.','描述天然氣的波動與預測期平台',[2,5,8],{formula:'[甲] fluctuated around the low twenties before leveling off at about [值] from [年] onwards',meaning:'天然氣在二十多個單位之間上落，約 2015 年起預測維持 25 左右。',usage:'leveling off 表示線條後段近乎水平；此處 2015 年後仍在預測區。',parts:[slot('Natural gas','甲'),link(' fluctuated around the low twenties before leveling off at about'),slot(' 25','值'),link(' from'),slot(' 2015','年'),link(' onwards.')]}),
 f('The remaining sources were much less significant.','把三個小量來源另成一組過渡到下段',[2,4,9],{formula:'The remaining [來源] were much less significant',meaning:'核能、太陽／風能及水電都遠低於前三種大型來源。',usage:'多系列圖先處理大值，再用一句過渡引出三種較小系列；後續仍須列代表數值。',parts:[link('The remaining'),slot(' fuels','來源'),link(' were much less significant.')]}),
 f('Nuclear power climbed gradually from around 4 to about 8–9 units.','用起終約數概括較小系列的緩升',[2,6,7],{formula:'[系列] climbed gradually from around [起值] to about [末值]',meaning:'核能由約 4 個單位逐步升至預測期末約 8–9 個單位。',usage:'小系列也可用兩個端點值概括，但後端圖示為預測值。',parts:[slot('Nuclear power','系列'),link(' climbed gradually from around'),slot(' 4','起值'),link(' to about'),slot(' 8–9 units.','末值')]}),
 f('Solar/wind also rose modestly to around 6, whereas hydropower fluctuated slightly and finished at roughly 4.','在低值組內對照一條小升與另一條小幅波動',[3,6,8],{formula:'[甲] also rose modestly to around [值], whereas [乙] fluctuated slightly and finished at roughly [值]',meaning:'太陽／風能預測期末約 6；水電仍小幅波動，期末約 4。',usage:'小量系列也有不同走勢；不能把「較少」誤作三條線都不變。',parts:[slot('Solar/wind','甲'),link(' also rose modestly to around'),slot(' 6','甲值'),link(', whereas'),slot(' hydropower','乙'),link(' fluctuated slightly and finished at roughly'),slot(' 4.','乙值')]}),
];
const intro=[
 quiz('圖表左下的 History 與 Projections 提醒讀者甚麼？',['後期年份是預測，不能當成已發生的能源使用量','所有年份都是實際歷史數據','所有年份都是未來估計','縱軸數字是能源價格'],'圖中 2010–2030 年段標為 Projections；2030 年數值須用預測語氣。'),
 {type:'multi',prompt:'哪兩項最能概括六種燃料的級別與走勢？',detail:'選兩項，再按「確認」。',options:[
  '汽油和石油歷史及預測期都居首；煤和天然氣是第二梯隊',
  '煤預計約 2015 年後超越天然氣；核能、太陽／風能和水電始終用量較小',
  '水電在 1980 年就超越汽油和石油',
  '2030 年預測值已經是歷史實績',
 ],correct:[0,1],why:'概覽先以用量分大、中、小三組，再標出預測段煤與天然氣的交叉。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代美國、六種燃料、1980–2030 年、quadrillion units，以及後期預測。'],
 ['整體概覽','汽油石油居首；煤、天然氣第二梯隊，預測期煤超越氣；其餘三種較低。'],
 ['前三種大型來源','列 1980 年起點，再寫汽油石油、煤與天然氣的不同後期走勢。'],
 ['三種較小來源','比較核能緩升、太陽／風能小升與水電小幅波動。'],
],'按大、中、小用量分組，凡進入預測年份都保留預測語氣。')];
const evidence=[
 quiz('哪種燃料在全圖用量始終最高？',['汽油和石油','煤','天然氣','核能'],'汽油石油線在歷史與預測段都遠高於其他五條。'),
 quiz('1980 年汽油石油、天然氣、煤依次約多少？',['35、20、16 quadrillion units','16、20、35 quadrillion units','35、16、20 quadrillion units','4、5、6 quadrillion units'],'1980 年前三種大型來源依次約 35、20、16；注意天然氣與煤次序。'),
 quiz('2030 年汽油石油約多少，應如何表述？',['預計約 49 quadrillion units','實際已達約 49 quadrillion units','約 9 quadrillion units 的歷史值','預計降至 16 quadrillion units'],'2030 年位於 Projections 段，汽油石油約 49 是預測。'),
 quiz('煤與天然氣在預測段的關係是甚麼？',['煤預計約 2015 年後超越天然氣，至 2030 年約 32 對 25','天然氣預計升至 49，超越所有來源','煤始終比天然氣少且持續下降','兩者到 2030 年都恰好為 16'],'煤線到預測後段高於較平的天然氣線。'),
 quiz('天然氣在約 2015 年後大致如何？',['預測維持在約 25 quadrillion units','預測急升至約 49','預測跌至零','由 25 降至 4'],'天然氣虛線在約 25 附近趨平。'),
 quiz('核能與太陽／風能在期末預測各約多少？',['核能 8–9，太陽／風能約 6','核能約 49，太陽／風能約 32','核能約 4，太陽／風能約 25','兩者均為零'],'三個小量來源中核能較高、太陽／風能次之，末年仍屬預測。'),
 quiz('水電在 2030 年預測約多少？',['約 4 quadrillion units，期間小幅波動','約 49，為六類最高','約 32，並超越煤','約 25，與天然氣相等'],'水電線在低值區小幅上落，期末約 4。'),
];
const logic=[
 sequence('前三種：按用量與預測交叉整理',[
  ['1980 年起點','汽油石油約 35、天然氣約 20、煤約 16。'],
  ['汽油石油','八十年代中期短暫跌至略逾 30，2005 年約 40，2030 年預計約 49。'],
  ['煤','九十年代中期約 22，之後平台，2030 年預計約 32。'],
  ['天然氣','在二十多個單位波動，預測約 2015 年後維持 25 左右；煤越過它。'],
 ],'勿把 2030 年的預測值寫成已發生；同時保留天然氣與煤在預測段的排名反轉。'),
 sequence('三個小量來源：分清緩升與波動',[
  ['核能','由約 4 緩升至預測末期約 8–9。'],
  ['太陽／風能','小幅上升至預測末期約 6。'],
  ['水電','期間小幅波動，預測末期約 4。'],
  ['收束級別','三者用量都遠低於汽油石油、煤和天然氣。'],
 ],'「用量較小」並不等於三者完全不變；三條線的方向各不相同。'),
];
const transfers=[
 transfer('另一圖呈現某國 1980 至 2030 年六種水源的使用量，後段為預測，縱軸是十億公升。','哪句引言保留單位與預測性質？',['圖表比較六種水源的用量，單位十億公升；後期數值為預測。','圖表比較六種水源的價格百分比，2030 年已實際發生。','圖表只比較 1980 年一個年份。','圖表解釋未來缺水的原因。'],['量度對象、單位和後期預測都準確。','把用量改成價格，也把未來改成歷史。','圖中橫跨多年。','圖中沒有原因。'],[0],'原文引言同時交代 six fuel sources、quadrillion units 與 later figures projected。'),
 transfer('A 燃料在歷史年份用量最高，預測期仍將維持最高。','哪句正確區分過去與預測？',['A 過去一直居首，預計未來也保持第一。','A 到 2030 年已實際證明一直居首。','A 過去與未來都是最少。','A 的實際價格始終最高。'],['前半為歷史，後半用「預計」標出預測。','未來年份尚未發生。','題目說 A 最高。','圖上是用量，不是價格。'],[1],'原文 remained, and is expected to remain 把兩種時態放在同一句。'),
 transfer('B、C 居中量級；B 在預測段超越 C；D、E、F 使用量遠小。','哪項概覽準確？',['B、C 是第二梯隊，B 預計超越 C；其餘三種量較小。','D、E、F 已超越 A、B、C。','C 預計超越 B，B 則降至零。','六種燃料用量始終完全相同。'],['按數值級別分組，並指出預測交叉。','小量來源仍低。','把交叉方向倒轉。','各系列大小不一。'],[2],'原文把煤、天然氣列第二梯隊，另三種列低用量組。'),
 transfer('1980 年 A 35、B 20、C 16，單位相同。','哪句起點比較正確？',['A 約 35，B 約 20，C 約 16，同為能源用量。','A、B、C 分別是 35%、20%、16% 的人口。','C 為 35、B 為 20、A 為 16。','三個值完全相同。'],['三個數值按系列和相同單位配對。','圖上是能源單位，非人口百分比。','把 A、C 對調。','35、20、16 不同。'],[3],'原文 1980 年汽油石油約 35、天然氣約 20、煤約 16。'),
 transfer('A 燃料八十年代中期由 35 略降至 31，2005 年約 40，2030 年預測約 49。','哪句保留早段小跌與未來語氣？',['A 先略降，後回升至 2005 年約 40；2030 年預計約 49。','A 由 1980 至 2030 年每一步都已觀察且持續上升。','A 八十年代中期已達 49。','A 2030 年預計跌至 16。'],['短暫下跌、歷史回升與預測末值都準確。','有早段下跌，且 2030 年是預測。','49 屬 2030 年估計。','末值約 49。'],[4],'原文汽油石油先跌、後升；2030 年 49 前保留 projected。'),
 transfer('B 燃料升至 22 後數年近乎持平，後期預測升至 32。','哪項準確描述三段形狀？',['先較緩上升，中段平台，後期預計再升至約 32。','由 22 直接跌至零，沒有平台。','每一年都以完全相同速度上升。','22 是期末預測值，32 是起點。'],['三段走勢與預測性質都保留。','末期升至 32。','中段有平台。','22 為中期值。'],[5],'原文煤九十年代中期約 22、其後維持一段、2030 年約 32。'),
 transfer('C 燃料歷史值在 20 多上下波動，約 2015 年後的預測線維持在 25。','哪句準確描述平台與預測？',['C 早期波動，預測期約 2015 年起在 25 附近持平。','C 在歷史期已穩定達 49。','C 2015 年後預計每年急跌至零。','C 自 1980 年起每一年都恰好 25。'],['波動與後期平台分段描述。','49 屬另一系列。','2015 後接近水平。','歷史值有變。'],[6],'原文天然氣 fluctuated 後從 2015 年起 leveling off at about 25。'),
 transfer('前三種燃料用量為 25 至 49，另外三種約 4 至 9。','下一段怎樣引出低值組？',['其餘三種燃料的用量小得多。','其餘三種燃料比前三種更高。','所有六種燃料數值完全相同。','其餘三種燃料均沒有使用。'],['低值組量級明顯較小，可合成下一段。','4 至 9 低於 25 至 49。','兩組範圍不同。','小量不等於零。'],[7],'原文 The remaining fuels were much less significant 作低值組過渡。'),
 transfer('D 燃料由約 4 緩升至預測末期約 8–9。','哪句保留緩升與預測終值？',['D 由約 4 逐步升至預計的約 8–9。','D 由約 8–9 一直跌到 4。','D 到期末升至 49，成為最高。','D 全期完全沒有變。'],['正確保留方向、約數和預測性質。','起終值顛倒。','末值僅約 8–9。','期末高於起點。'],[8],'原文核能由約 4 漸升至約 8–9 個單位。'),
 transfer('E 燃料小升至約 6；F 燃料小幅波動，期末約 4。','哪項在低值組內仍區分不同形狀？',['E 小幅上升，F 有小波動且期末約 4。','E、F 都一直完全不變。','E 期末為 49，F 為 32。','F 小幅上升至 6，E 波動至 4。'],['兩條線的方向與終值各自正確。','E 上升，F 波動。','兩者均為低值。','把 E、F 的形狀和數值對調。'],[9],'原文太陽／風能小升至約 6，水電小幅波動、末值約 4。'),
];
const balancedTransferOptions=[
 ['圖表比較六種水源用量（十億公升），後期數字屬預測。','圖表比較六種水源的價格百分比，2030年已實現。','圖表比較六種水源在1980年單一年度的總用量。','圖表解釋六種水源於2030年缺乏供應的具體原因。'],
 ['A在歷史年份居首，預計未來仍保持最高用量。','A到2030年已被實際證明長期保持最高用量。','A在歷史年份與預測時期都一直用量最少。','A在歷史年份的實際價格始終高於其他類。'],
 ['B與C屬中量級，B預計超越C；其餘三類較小。','D、E、F後來的用量都遠遠超越A、B、C三個系列。','C預計超越B，而B在預測期最終跌至零。','六種燃料的用量由始至終都完全一樣。'],
 ['1980年A約35、B約20、C約16，都是能源用量。','1980年A約佔35%、B約20%、C約16%的人口比例。','1980年C約35、B約20、A約16，排序完全相反。','1980年A、B、C三種燃料的用量完全相同。'],
 ['A先小跌，2005年回升至約40，2030年預計約49。','A由1980到2030年逐年上升，所有數字都已觀察。','A八十年代中期已升至49，之後一直持平。','A在2030年預計下降至16，並非上升到49。'],
 ['B先緩升，中段維持約22，後期預計升至約32。','B先緩升，中段由22直接跌到零，後期沒有反彈。','B在整個期間都以完全相同速度逐年上升。','B期末預計只有22，最初卻已有32，走勢向下。'],
 ['C歷史期有所波動，2015年後預計在25附近持平。','C歷史期已穩定升至49，後期數值沒有變。','C在2015年後預計逐年持續大跌至零。','C自1980年起每個年份都恰好保持25不變。'],
 ['其餘三種燃料用量明顯較低，可合在下段比較。','其餘三種燃料用量明顯較高，可合在下段比較。','六種燃料用量完全相同，毋須分組比較。','其餘三種燃料完全沒有人使用，數值全為零。'],
 ['D由約4緩升至預測末期約8至9，仍屬低值。','D由約8至9持續下跌至預測末期約4。','D到預測末期增至約49，成為最高用量。','D從起點到預測末期都維持約4不變。'],
 ['E小升至約6，F稍有波動，期末約4。','E與F全期都完全不變，期末各約4。','E期末高達49，F期末亦升至32。','F小升至約6，E波動後期末約4。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-line-graph:8',meta:{topic:'美國六種燃料能源使用量及 2030 年預測',summary:'先按大、中、小用量分組，保留 History／Projections 分界；汽油石油預計仍居首，煤在預測期超越天然氣。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
