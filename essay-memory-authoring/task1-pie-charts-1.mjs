// Task 1 Pie Charts 1: US nutrient shares across four eating occasions.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先對照三個圓餅圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The three pie charts show how much of each nutrient people in the USA have at breakfast, lunch, dinner and snack times. The nutrients are sodium, saturated fat and added sugar.',
 'Overall, dinner has the largest shares of sodium and saturated fat, but snacks have the largest share of added sugar.',
 'Breakfast has the lowest, or tied lowest, share for all three nutrients. Lunch is between the highest and lowest meals for all three.',
 'Breakfast has low shares in all three charts: 14% for sodium and 16% for both saturated fat and added sugar.',
 'Lunch has more sodium and saturated fat, at 29% and 26% in that order, but less added sugar, at 19%.',
 'So breakfast and lunch usually have smaller shares than dinner and snacks. Still, lunch has quite a large share of sodium.',
 'Dinner has the highest sodium share, 43%, and the highest saturated fat share, 37%.',
 'But dinner has a much smaller share of added sugar, 23%.',
 'Snacks show the opposite: they have only 14% of sodium and 21% of saturated fat, but the largest added sugar share, 42%. That is almost twice dinner’s 23%.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['average shares','how much of each nutrient','各營養素的比例'],['consumed at','have at','在某餐攝取']),
 v(['main contributor','largest shares','最大來源'],['intake','have','攝取'],['whereas','but','而'],['account for','have','佔']),
 v(['consistently','for all three nutrients','在三項中皆如此'],['smallest, or joint-smallest','lowest, or tied lowest','最少或並列最少'],['intermediate position','between the highest and lowest','介乎最高與最低之間']),
 v(['comparatively light','low shares','比例較低'],['representing','for','佔'],['both','both','兩者皆是']),
 v(['contributes noticeably more','has more','佔比明顯較高'],['respectively','in that order','依上述順序'],['share','at','比例']),
 v(['Thus','So','因此'],['generally less dominant','usually have smaller shares','通常比例較小'],['although','Still','不過'],['substantial source','quite a large share','相當大的來源']),
 v(['most sodium-heavy meal','highest sodium share','鈉佔比最高的一餐'],['share reaching','share','比例達到'],['leads saturated fat consumption','highest saturated fat share','飽和脂肪佔比最高']),
 v(['contribution to','share of','在某項的比例'],['however','But','然而'],['much lower','much smaller','低得多']),
 v(['reverse pattern','opposite','相反模式'],['account for only','have only','只佔'],['dominate','largest','佔比最大'],['almost double','almost twice','幾乎兩倍']),
];
const structures=[
 f('The three pie charts compare the average shares of protein, fibre and sugar consumed at breakfast, lunch, dinner and snack times in Country A.','引言交代三張圖、三項指標、四個餐次及地點',[1,3,6],{formula:'The [數量與圖類] compare the average shares of [三項] consumed at [四餐次] in [地點]',meaning:'三個圓餅圖比較美國四個餐次所攝取的鈉、飽和脂肪和添加糖比例。',usage:'這是各營養素在四餐次的分布比例；不要把 43% 說成每餐食物有 43% 是鈉。',parts:[link('The'),slot(' three pie charts','數量與圖類'),link(' compare the average shares of'),slot(' sodium, saturated fat and added sugar','三項'),link(' consumed at'),slot(' breakfast, lunch, dinner and snack times','四餐次'),link(' in'),slot(' the USA.','地點')]}),
 f('Overall, dinner is the main contributor to protein and fibre intake, whereas snacks account for the greatest proportion of sugar.','概覽用 whereas 對照不同指標的最高餐次',[0,3,7],{formula:'Overall, [餐次甲] is the main contributor to [兩項] intake, whereas [餐次乙] account for the greatest proportion of [第三項]',meaning:'晚餐在鈉與飽和脂肪中最高；零食在添加糖中最高。',usage:'先找每張圖最大扇區：鈉 43%、飽和脂肪 37% 都是晚餐；添加糖 42% 是零食。',parts:[link('Overall,'),slot(' dinner','餐次甲'),link(' is the main contributor to'),slot(' sodium and saturated fat','兩項'),link(' intake, whereas'),slot(' snacks','餐次乙'),link(' account for the greatest proportion of'),slot(' added sugar.','第三項')]}),
 f('Lunch consistently makes the smallest, or joint-smallest, contribution, while dinner occupies an intermediate position across all three nutrients.','概覽把最低、並列最低與中間位置說準確',[1,4,7],{formula:'[餐次甲] consistently makes the smallest, or joint-smallest, contribution, while [餐次乙] occupies an intermediate position across [範圍]',meaning:'早餐在鈉與零食並列最低 14%，在飽和脂肪及添加糖分別為最低 16%；午餐三項均非最高或最低。',usage:'「並列」不可漏：鈉圖中早餐與零食同為 14%。午餐的 29%、26%、19% 分別居中。',parts:[slot('Breakfast','餐次甲'),link(' consistently makes the smallest, or joint-smallest, contribution, while'),slot(' lunch','餐次乙'),link(' occupies an intermediate position across'),slot(' all three nutrients.','範圍')]}),
 f('Breakfast is comparatively light in all categories, representing 12% of salt and 15% of both fat and sugar.','以一個餐次串起三張圖的低值',[0,4,8],{formula:'[餐次] is comparatively light in all categories, representing [甲值] of [甲項] and [共同值] of both [乙項] and [丙項]',meaning:'早餐的鈉佔 14%，飽和脂肪和添加糖皆佔 16%。',usage:'同一句中 14% 只屬鈉，16% 同時屬另外兩項；不要把三項都寫成 16%。',parts:[slot('Breakfast','餐次'),link(' is comparatively light in all categories, representing'),slot(' 14%','甲值'),link(' of'),slot(' sodium','甲項'),link(' and'),slot(' 16%','共同值'),link(' of both'),slot(' saturated fat','乙項'),link(' and'),slot(' added sugar.','丙項')]}),
 f('Lunch contributes noticeably more salt and fat, at 31% and 27% respectively, but its share of sugar is lower, at 18%.','用 respectively 將兩數按順序配回兩項，再給第三項',[0,3,7],{formula:'[餐次] contributes noticeably more [甲項] and [乙項], at [甲值] and [乙值] respectively, but its share of [丙項] is lower, at [丙值]',meaning:'午餐：鈉 29%、飽和脂肪 26%、添加糖 19%。',usage:'respectively 明確配對：第一個數 29% 對鈉，第二個數 26% 對飽和脂肪。',parts:[slot('Lunch','餐次'),link(' contributes noticeably more'),slot(' sodium','甲項'),link(' and'),slot(' saturated fat','乙項'),link(', at'),slot(' 29%','甲值'),link(' and'),slot(' 26%','乙值'),link(' respectively, but its share of'),slot(' added sugar','丙項'),link(' is lower, at'),slot(' 19%.','丙值')]}),
 f('Thus, these two earlier meals are generally less dominant than the later ones, although lunch is still a substantial source of salt.','概括較早餐次，同時保留午餐鈉比例不低的例外',[1,4,7],{formula:'Thus, these two earlier meals are generally less dominant than the later ones, although [餐次] is still a substantial source of [項目]',meaning:'早餐與午餐整體不如晚餐和零食突出，但午餐鈉仍有 29%。',usage:'generally 避免絕對化；午餐鈉 29% 高於零食與早餐的 14%，雖仍低於晚餐 43%。',parts:[link('Thus, these two earlier meals are generally less dominant than the later ones, although'),slot(' lunch','餐次'),link(' is still a substantial source of'),slot(' sodium.','項目')]}),
 f('Dinner is the most salt-heavy meal, with its share reaching 41%, and it also leads fat consumption at 35%.','用兩個最高數值支持晚餐在兩張圖居首',[0,3,8],{formula:'[餐次] is the most [甲項]-heavy meal, with its share reaching [甲值], and it also leads [乙項] consumption at [乙值]',meaning:'晚餐鈉 43%、飽和脂肪 37%，分別是相應圓餅圖最大扇區。',usage:'最高的對象是各營養素在四餐次中的份額；不是晚餐自身重量的百分比。',parts:[slot('Dinner','餐次'),link(' is the most'),slot(' sodium','甲項'),link('-heavy meal, with its share reaching'),slot(' 43%','甲值'),link(', and it also leads'),slot(' saturated fat','乙項'),link(' consumption at'),slot(' 37%.','乙值')]}),
 f('Its contribution to sugar, however, is much lower, at 21%.','以 however 對照同一餐次的第三項比例',[1,4,6],{formula:'Its contribution to [第三項], however, is much lower, at [比例]',meaning:'晚餐添加糖 23%，低於自身的鈉 43% 與飽和脂肪 37%。',usage:'Its 指前句的晚餐；轉折只比較晚餐在不同營養素圖中的份額。',parts:[link('Its contribution to'),slot(' added sugar','第三項'),link(', however, is much lower, at'),slot(' 23%.','比例')]}),
 f('Snacks show the reverse pattern: they account for only 12% of salt and 19% of fat, but dominate sugar at 41%, almost double the dinner figure.','用同一餐次三項比例呈現反轉，並與晚餐比較',[0,3,7],{formula:'[餐次] show the reverse pattern: they account for only [甲值] of [甲項] and [乙值] of [乙項], but dominate [丙項] at [丙值], almost double the [比較餐次] figure',meaning:'零食在鈉 14%、飽和脂肪 21% 較低，但添加糖 42% 全圖最高，接近晚餐 23% 的兩倍。',usage:'42÷23 約 1.83，可寫 almost double；不可寫 exactly double。鈉 14% 與早餐並列最低。',parts:[slot('Snacks','餐次'),link(' show the reverse pattern: they account for only'),slot(' 14%','甲值'),link(' of'),slot(' sodium','甲項'),link(' and'),slot(' 21%','乙值'),link(' of'),slot(' saturated fat','乙項'),link(', but dominate'),slot(' added sugar','丙項'),link(' at'),slot(' 42%','丙值'),link(', almost double the'),slot(' dinner','比較餐次'),link(' figure.')]}),
];
const intro=[
 quiz('每張圓餅圖的四個扇區代表甚麼？',['同一營養素在早餐、午餐、晚餐和零食的攝取份額','一餐內四種食物的重量','美國四州的人口比例','每人每日四餐的熱量'],'三圖分別是鈉、飽和脂肪、添加糖；每張圖按四個餐次分配 100%。'),
 {type:'multi',prompt:'哪兩項最適合放進整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '晚餐在鈉與飽和脂肪中居首；零食在添加糖中居首',
  '早餐各項最低或並列最低；午餐三項大致居中',
  '午餐在所有營養素中都佔最大份額',
  '三張圖都以早餐的扇區最大',
 ],correct:[0,1],why:'概覽跨三張圖比較最高、最低及中間餐次，不逐項羅列全部數值。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代美國四餐次與鈉、飽和脂肪、添加糖三項份額。'],
 ['整體概覽','晚餐在鈉與飽和脂肪最高，零食在添加糖最高；早餐最低或並列最低。'],
 ['較早餐次','先寫早餐三項低值，再寫午餐的 29%、26%、19% 與例外。'],
 ['較晚餐次','晚餐兩項最高、添加糖較低；零食呈相反模式，添加糖 42%。'],
],'範文按餐次成組，而非逐張圖重複讀數；每個比例都要配準營養素和餐次。')];
const evidence=[
 quiz('鈉的最大扇區是哪餐、多少？',['晚餐 43%','零食 42%','午餐 37%','早餐 29%'],'鈉圖黑色晚餐扇區是 43%；42% 是添加糖圖的零食。'),
 quiz('飽和脂肪的最大扇區是哪餐、多少？',['晚餐 37%','零食 42%','午餐 29%','早餐 23%'],'飽和脂肪圖中晚餐 37% 最大。'),
 quiz('添加糖的最大扇區是哪餐、多少？',['零食 42%','晚餐 43%','午餐 26%','早餐 29%'],'添加糖圖中零食 42% 最大。'),
 quiz('鈉圖中哪兩餐並列最少？',['早餐與零食各 14%','早餐與午餐各 16%','午餐與晚餐各 29%','晚餐與零食各 43%'],'鈉圖的早餐與零食均標 14%。'),
 quiz('早餐在鈉、飽和脂肪、添加糖三項依次是多少？',['14%、16%、16%','16%、14%、16%','14%、21%、42%','29%、26%、19%'],'早餐的灰色扇區依三圖順序為 14、16、16%。'),
 quiz('午餐的 29%、26%、19% 分別屬於哪項？',['鈉、飽和脂肪、添加糖','添加糖、鈉、飽和脂肪','飽和脂肪、添加糖、鈉','三個數都屬於鈉'],'三圖中午餐斜線扇區依次為 29、26、19%。'),
 quiz('零食的添加糖 42% 與晚餐 23% 可如何比較？',['約 1.83 倍，可說幾乎兩倍','精確兩倍','晚餐比零食高 19 個百分點','兩者相同'],'42÷23 約 1.83，接近但並非精確兩倍。'),
];
const logic=[
 sequence('讀三張圖：先對準營養素，再對準餐次',[
  ['鈉','晚餐 43% 最大；午餐 29%；早餐與零食各 14% 並列最低。'],
  ['飽和脂肪','晚餐 37% 最大；午餐 26%；零食 21%；早餐 16% 最低。'],
  ['添加糖','零食 42% 最大；晚餐 23%；午餐 19%；早餐 16% 最低。'],
  ['報告重點','晚餐與零食在不同營養素中互換領先；早餐通常低，午餐居中。'],
 ],'扇區百分比是各營養素按餐次分配的份額。比較時須說明正在比較哪張圖。'),
 sequence('從數據走到範文的兩組細節',[
  ['早餐','14%、16%、16%：三項偏低，鈉與零食並列最低。'],
  ['午餐','29%、26%、19%：三項居中，鈉仍相當可觀。'],
  ['晚餐','鈉 43%、飽和脂肪 37% 居首，但添加糖 23% 較低。'],
  ['零食','鈉 14%、飽和脂肪 21% 較低，但添加糖 42% 居首。'],
 ],'按餐次把三圖連起來，再用「反轉」交代晚餐與零食的差異。'),
];
const transfers=[
 transfer('另一組三個圓餅圖比較某國四餐次的蛋白質、纖維和糖攝取份額。','哪句引言完整而不誤讀百分比？',['三個圓餅圖比較某國四餐次攝取的三項營養素份額。','三圖顯示四餐次各自含有多少克蛋白質。','每個扇區代表某餐有多少名食客。','圖表解釋居民選餐的原因。'],['數量、地點、三項指標與餐次均交代。','圖中是份額百分比，非克數。','扇區不是人數。','圖上沒有原因。'],[0],'原文引言先界定三圖、三營養素及四餐次。'),
 transfer('某組圖中晚餐在甲、乙項均最高，零食在丙項最高。','哪句概覽能準確對照兩種領先餐次？',['晚餐是甲、乙的最大來源，而零食在丙項佔比最高。','晚餐在三項中都最高。','零食在三項中都最低。','甲、乙、丙項的比例完全相同。'],['按不同指標分別指出最高餐次。','丙項由零食領先。','零食在丙項最高。','題目沒有說三項相同。'],[1],'原文晚餐在鈉與飽和脂肪居首，零食在添加糖居首。'),
 transfer('早餐在一項並列最低，在另兩項單獨最低；午餐三項都不是最高或最低。','哪句保留「並列」的細節？',['早餐各項最低或並列最低，而午餐三項居中。','早餐每項都單獨最低。','午餐每項都最高。','早餐與午餐三項均完全相同。'],['並列最低與居中都說準確。','一項是並列最低。','午餐三項均非最高。','題目沒有相同三值。'],[2],'原文早餐在鈉與零食同為 14%，其餘兩圖單獨最低；午餐居中。'),
 transfer('早餐在 X 圖 12%，在 Y、Z 圖均 15%。','哪句正確配對三個值？',['早餐在 X 項佔 12%，在 Y 和 Z 項均佔 15%。','早餐在 X、Y、Z 三項均佔 12%。','早餐只在 Z 項佔 12%。','Y 項佔 12%，X 與 Z 項均佔 15%。'],['第一值對 X，共同值對 Y、Z。','Y、Z 是 15%。','X 才是 12%。','把 X、Y 對調。'],[3],'原文早餐鈉 14%，飽和脂肪及添加糖均 16%。'),
 transfer('午餐的 A、B、C 三項依次為 31%、27%、18%。','哪句讓 respectively 的配對一目了然？',['午餐在 A 和 B 項分別佔 31% 和 27%，在 C 項佔 18%。','午餐在 A 和 B 項分別佔 27% 和 31%。','午餐在 C 項佔 31%，在 A 項佔 18%。','三項都佔 31%。'],['數字依 A、B、C 順序正確配回。','A、B 的數值互換。','A、C 的數值互換。','三項數值不同。'],[4],'原文午餐鈉 29%、飽和脂肪 26%、添加糖 19%，respectively 配對前兩者。'),
 transfer('早兩餐整體佔比偏低，但午餐在鈉圖仍有 29%，高於早餐及零食的 14%。','哪句概括時保留例外？',['早兩餐通常較不突出，不過午餐仍是鈉的重要來源。','早兩餐在每張圖都最少，沒有例外。','午餐在鈉圖只有 14%。','午餐是所有營養素的最大來源。'],['通常一詞容許午餐鈉 29% 這項值得寫的細節。','午餐鈉高於兩餐。','午餐鈉是 29%。','午餐未在任何圖居首。'],[5],'原文用 generally 與 although 避免把較早餐次說成一律最低。'),
 transfer('某圖晚餐在 X、Y 項分別為 41% 和 35%，都是該圖中最高的餐次。','哪句同時支持兩項最高？',['晚餐在 X 項以 41% 居首，在 Y 項亦以 35% 居首。','晚餐在 X、Y 項都是 41%。','晚餐在 X 項 35%、Y 項 41%。','晚餐在 X、Y 項都是最低。'],['兩項與各自最高值配準。','Y 項是 35%。','數值對調。','題目說兩項最高。'],[6],'原文晚餐鈉 43%、飽和脂肪 37%，兩張圖皆居首。'),
 transfer('晚餐在甲、乙項都高，但在丙項只有 21%。','哪句以轉折連接同一餐次的第三項？',['然而，晚餐在丙項的份額低得多，只有 21%。','因此，晚餐在丙項也一定最高。','然而，零食在丙項的份額是 21%。','晚餐三項份額完全相同。'],['代詞與轉折都指回晚餐。','丙項較低。','主語無故換成零食。','三項並不相同。'],[7],'原文 Its 指晚餐，however 對比其添加糖份額 23%。'),
 transfer('某圖零食在 A、B 項只佔 12%、19%，C 項卻佔 41%；晚餐 C 項 22%。','哪句說出反轉且不把「幾乎」寫成「精確」？',['零食在 A、B 項較低，卻以 41% 領先 C 項，幾乎是晚餐 22% 的兩倍。','零食在三項中都最高。','零食 C 項恰好是晚餐的兩倍。','零食 C 項只有 22%，晚餐則有 41%。'],['41÷22 約 1.86，近兩倍但非精確兩倍。','A、B 項較低。','41 不等於 44。','零食與晚餐數值對調。'],[8],'原文零食添加糖 42%，相對晚餐 23% 為約 1.83 倍。'),
 transfer('新增圖表顯示 A 餐在 X 項 14%、B 餐 14%；兩者共同最低。','哪句不會漏掉相同數值？',['A 和 B 在 X 項同佔 14%，並列最低。','A 是唯一最低的餐次。','B 以 29% 獨居最低。','A 與 B 的比例分別為 14% 和 42%。'],['兩餐同值，因此是並列最低。','B 也佔 14%。','B 並非 29%。','B 是 14%。'],[2],'原文鈉圖早餐與零食同為 14%，所以寫 joint-smallest。'),
];
const balancedTransferOptions=[
 ['三個圓餅圖比較某國四餐次攝取的三項營養素比例。','三個圓餅圖比較某國四餐次攝取的蛋白質克數。','三個圓餅圖顯示某國四餐次每餐有多少食客。','三個圓餅圖解釋某國居民選擇各餐次的原因。'],
 ['晚餐在甲乙項佔比最高，零食則在丙項居首。','晚餐在甲乙丙三項的佔比都始終最高。','零食在甲乙丙三項的佔比都始終最低。','甲乙丙三項各餐次的佔比都完全相同。'],
 ['早餐各項最低或並列最低，午餐三項居中。','早餐在三項都是唯一最低，午餐三項居中。','早餐各項最低或並列最低，午餐三項最高。','早餐與午餐在三項的份額都完全相同。'],
 ['早餐在X項佔12%，Y與Z項均佔15%。','早餐在X、Y及Z三項都恰好佔12%。','早餐只有Z項佔12%，X與Y項佔15%。','早餐在Y項佔12%，X與Z項均佔15%。'],
 ['午餐在A、B、C項依次佔31%、27%、18%。','午餐在A、B、C項依次佔27%、31%、18%。','午餐在A、B、C項依次佔18%、27%、31%。','午餐在A、B、C三項都恰好佔31%。'],
 ['早兩餐通常份額較低，但午餐仍是鈉的重要來源。','早兩餐在每張圖都最低，午餐沒有任何例外。','午餐在鈉圖也只佔14%，與早餐份額完全相同。','午餐是三種營養素的最大來源，全部居首。'],
 ['晚餐在X項佔41%居首，在Y項佔35%亦居首。','晚餐在X與Y兩項均佔41%，兩項數值相同。','晚餐在X項佔35%，Y項則佔41%，數值對調。','晚餐在X與Y兩項的份額都排在最後。'],
 ['然而晚餐在丙項只佔21%，與前兩項相比低得多。','因此晚餐在丙項也必定佔最高份額，三項同樣。','然而零食在丙項只佔21%，與前兩項相比低。','晚餐在甲乙丙三項的份額均相等，沒有差別。'],
 ['零食A、B項較低，C項卻佔41%，約是晚餐22%的1.86倍。','零食在A、B、C三項都居首，沒有任何轉折。','零食C項恰好是晚餐22%的兩倍，正好達44%。','零食C項只有22%，晚餐C項反而佔41%。'],
 ['A與B在X項都佔14%，兩餐共同排在最低。','A在X項佔14%，是唯一排在最低的餐次。','B在X項佔29%，因此是唯一最低的餐次。','A與B在X項分別佔14%及42%，高低不同。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-pie-charts:1',meta:{topic:'美國四餐次的鈉、飽和脂肪與添加糖份額',summary:'晚餐在鈉及飽和脂肪領先，零食在添加糖領先；早餐最低或並列最低。逐張對準營養素、餐次與百分比。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
