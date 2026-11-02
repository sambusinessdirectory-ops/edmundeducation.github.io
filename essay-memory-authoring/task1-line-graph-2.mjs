// Corrected source: Indonesia rises from last to second; no unsupported fastest-growth claim.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows the percentage of people living in cities in the Philippines, Malaysia, Thailand and Indonesia from 1970 to 2020. It also shows predictions for 2030 and 2040.',
 'Overall, the share of people living in cities rose in all four countries.',
 'Malaysia reached the highest city share and is expected to stay highest. Indonesia rose quickly from the lowest place to second place.',
 'The Philippines went up and down, while Thailand increased more slowly and had the lowest city share from 2010 onwards.',
 'In 1970, the Philippines was slightly higher, at just over 30%, while Malaysia was about 30%.',
 'The Philippines was near 50% in 1990, fell to just over 40% in 2010, and rose again to about 46% in 2020. The prediction for 2040 is about 56%.',
 'Malaysia rose steadily from about 30% in 1970 to 60% in 2000. It is predicted to be above 80% in 2040.',
 'Indonesia started at only about 13% in 1970 but kept rising. It matched the Philippines at about 43% in 2010 and was just over 50% in 2020.',
 'Indonesia is predicted to reach about 64% in 2040, while Thailand is predicted to rise from just over 30% in 2020 to 50% in 2040.',
];
const vocabulary=[
 v(['compares','shows','比較／顯示'],['percentage of people living in cities','percentage of people living in cities','城市人口比例'],['with forecasts to 2040','also shows predictions for 2030 and 2040','並有二〇四〇年預測']),
 v(['became more urbanised','share of people living in cities rose','城市人口比例上升'],['all four countries','all four countries','四國皆然']),
 v(['clear leader','highest city share','明顯領先'],['expected to remain','expected to stay','預計維持'],['climbed sharply from the lowest position to second place','rose quickly from the lowest place to second place','由末位急升至第二']),
 v(['fluctuated','went up and down','上落波動'],['grew more slowly','increased more slowly','增長較慢'],['least urbanised country','lowest city share','城市人口比例最低'],['from 2010 onwards','from 2010 onwards','自二〇一〇年起']),
 v(['led slightly','was slightly higher','略為領先'],['just over 30%','just over 30%','略多於百分之三十'],['compared with','while','相比之下']),
 v(['reached nearly 50%','was near 50%','接近百分之五十'],['declined to','fell to','下降至'],['recovering to','rose again to','回升至'],['projected to rise','prediction','預計上升']),
 v(['climbed steadily','rose steadily','穩步上升'],['around','about','約'],['forecast to exceed 80%','predicted to be above 80%','預計超過百分之八十']),
 v(['began at only','started at only','起點只有'],['rose continuously','kept rising','持續上升'],['equalling','matched','與……相等'],['reaching just over 50%','was just over 50%','升至略高於百分之五十']),
 v(['should climb further','is predicted to reach','預計進一步上升'],['mid-60s','about 64%','百分之六十多'],['whereas','while','而'],['expected to grow','predicted to rise','預計增長']),
];
const structures=[
 f('The line graph compares the percentage of people living in cities in A, B, C and D from 1980 to 2020, with forecasts to 2040.','界定四地城市人口比例、觀察期及預測期',[1,4,7],{formula:'The [圖表類型] compares the percentage of people living in cities in [四地] from [觀察期], with forecasts to [末年]',meaning:'圖表比較菲律賓、馬來西亞、泰國、印尼在 1970 至 2020 年的城市人口比例，並預測到 2040 年。',usage:'含未來年份的折線圖要把已觀察年份與預測年份區分開。',parts:[link('The'),slot(' line graph','圖表類型'),link(' compares the percentage of people living in cities in'),slot(' the Philippines, Malaysia, Thailand and Indonesia','四地'),link(' from'),slot(' 1970 to 2020','觀察期'),link(', with forecasts to'),slot(' 2040.','末年')]}),
 f('Overall, all four regions became more urbanised.','先概括四條線共同的長期方向',[0,3,8],{formula:'Overall, all four [地點] became more urbanised',meaning:'四國的城市人口比例在圖示期間整體上升。',usage:'四個地點都由較低比例走向較高比例時，可先用一句概括共同方向；其後再指出排名差異。',parts:[link('Overall, all four'),slot(' countries','地點'),link(' became more urbanised.')]}),
 f('Region A became and is expected to remain the clear leader, while Region B climbed sharply from the lowest position to second place.','把最高地點持續領先與另一地由末位升至第二兩個排名事實並列',[1,4,7],{formula:'[甲] became and is expected to remain the clear leader, while [乙] climbed sharply from the lowest position to second place',meaning:'馬來西亞在後期居首且預計維持；印尼由 1970 年最低，至 2020 年與預測期升到第二。',usage:'多條線的概覽可並列「誰居首」和「誰排名變化最大」；不可把排名變化誤稱百分點增幅最大。',parts:[slot('Malaysia','甲'),link(' became and is expected to remain the clear leader, while'),slot(' Indonesia','乙'),link(' climbed sharply from the lowest position to second place.')] }),
 f('By contrast, Region C fluctuated, and Region D grew more slowly, becoming the least urbanised country from 2010 onwards.','對照有波動的線與後期最低且較慢增長的線',[2,5,8],{formula:'By contrast, [甲] fluctuated, and [乙] grew more slowly, becoming the least urbanised from [年份] onwards',meaning:'菲律賓先升後降再回升；泰國在 2010 年起成為四國城市人口比例最低的一國。',usage:'四條線並非同形時，可對照一條有波動與另一條增幅較慢、後期排名最低的線。',parts:[link('By contrast,'),slot(' the Philippines','甲'),link(' fluctuated, and'),slot(' Thailand','乙'),link(' grew more slowly, becoming the least urbanised country from'),slot(' 2010','年份'),link(' onwards.')]}),
 f('In 1980, Region C led slightly, at just over 30%, compared with about 30% in Region A.','報告起點兩個接近百分比與細微領先',[1,6,7],{formula:'In [起年], [甲] led slightly, at just over [值], compared with about [值] in [乙]',meaning:'1970 年菲律賓略高於 30%，馬來西亞約 30%，菲律賓微幅領先。',usage:'兩條線起點接近時，用同年兩個數值表達「略高」，避免誇大差距。',parts:[link('In'),slot(' 1970','起年'),link(','),slot(' the Philippines','甲'),link(' led slightly, at just over'),slot(' 30%','甲值'),link(', compared with about'),slot(' 30%','乙值'),link(' in'),slot(' Malaysia.','乙')]}),
 f('The Region C figure reached nearly 50% in 1990, then declined to just above 40% in 2010, before recovering to 46% in 2020; it is projected to rise to 56% by 2040.','分開觀察期的先升後降再回升與未來預測',[2,4,8],{formula:'[甲] reached [高點] in [年], then declined to [低點], before recovering to [觀察期末值]; it is projected to rise to [預測值]',meaning:'菲律賓 1990 年接近 50%，2010 年略逾 40%，2020 年約 46%；2040 年約 56% 是預測。',usage:'同一條線有多次轉向時，按年份排序；分號後須用 projected 標明未來值。',parts:[slot('The Philippine figure','甲'),link(' reached'),slot(' nearly 50% in 1990','高點'),link(', then declined to'),slot(' just above 40% in 2010','低點'),link(', before recovering to'),slot(' roughly 46% in 2020','觀察期末值'),link('; it is projected to rise to'),slot(' about 56% by 2040.','預測值')]}),
 f('Region A, however, climbed steadily from around 30% to 60% between 1980 and 2000, and is forecast to exceed 80% by the end.','列觀察期上升與預測期超過門檻，明確保留 forecast',[2,5,7],{formula:'[甲], however, climbed steadily from [起點] to [中期值] between [觀察年], and is forecast to exceed [預測門檻] by the end',meaning:'馬來西亞由 1970 年約 30% 升至 2000 年 60%，圖示預測 2040 年超過 80%。',usage:'已觀察值可以用過去式；未來估計必須用 forecast 或 projected，不能寫成已發生。',parts:[slot('Malaysia','甲'),link(', however, climbed steadily from'),slot(' around 30%','起點'),link(' to'),slot(' 60%','中期值'),link(' between'),slot(' 1970 and 2000','觀察年'),link(', and is forecast to exceed'),slot(' 80%','預測門檻'),link(' by the end.')]}),
 f('Region B began at only 13%, but rose continuously, equalling Region C at around 43% in 2010 and reaching just over 50% in 2020.','由最低起點寫到與另一地相交，再列觀察期末值',[2,6,8],{formula:'[甲] began at only [低起點], but rose continuously, equalling [乙] at [交叉值] in [年] and reaching [期末值]',meaning:'印尼 1970 年約 13%，2010 年與菲律賓同約 43%，2020 年略高於 50%。',usage:'由末位升到第二的關鍵證據是起點、交叉年份與 2020 年排名，毋須聲稱絕對增幅最大。',parts:[slot('Indonesia','甲'),link(' began at only'),slot(' about 13%','低起點'),link(', but rose continuously, equalling'),slot(' the Philippines','乙'),link(' at'),slot(' around 43% in 2010','交叉值及年'),link(' and reaching'),slot(' just over 50% in 2020.','期末值')]}),
 f('It should climb further to the mid-60s, whereas Region D is expected to grow from just above 30% in 2020 to 50% in 2040.','用預測語氣比較兩地 2020 至 2040 的後續走勢',[2,5,7],{formula:'It should climb further to [甲預測值], whereas [乙] is expected to grow from [觀察值] in [年] to [預測值] in [年]',meaning:'印尼預計 2040 年約 64%；泰國由 2020 年略逾 30%，預計到 2040 年為 50%。',usage:'當一句包含觀察期值與未來估計，should／expected to 必須讓讀者知道哪些數字尚未發生。',parts:[link('It should climb further to'),slot(' the mid-60s','甲預測值'),link(', whereas'),slot(' Thailand','乙'),link(' is expected to grow from'),slot(' just above 30% in 2020','觀察值'),link(' to'),slot(' 50% in 2040.','預測值')]}),
];
const intro=[
 quiz('這張圖哪段是已觀察年份，哪段是預測？',['1970 至 2020 年為已觀察，2030 和 2040 年為預測','1970 至 2040 年全部都是已觀察','只有 1970 年已觀察，其他年份全是預測','圖中沒有任何未來預測'],'題目明說 2030、2040 為 predictions；範文描述它們時用 forecast／projected。'),
 {type:'multi',prompt:'哪兩項是圖中可直接支持的概覽？',detail:'選兩項，再按「確認」。',options:[
  '四國城市人口比例整體上升；馬來西亞在後期居首並預計維持',
  '印尼由 1970 年最低升至 2020 年第二；泰國自 2010 年起最低',
  '印尼的百分點增幅必定比馬來西亞大',
  '菲律賓在每個年份都排名第一',
 ],correct:[0,1],why:'排名與各年份數值可直接核實；不同增幅定義下「最快」不宜作無限定判斷。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代四國城市人口比例、1970 至 2020 年及 2030／2040 年預測。'],
 ['整體概覽','四國整體上升；馬來西亞後期居首，印尼由末位升至第二，泰國後期最低。'],
 ['菲律賓與馬來西亞','比較起點和 1990 年後的不同走勢，另標明兩國 2040 年預測。'],
 ['印尼與泰國','印尼由低起點跨過菲律賓；泰國較慢，兩者 2040 年數值皆屬預測。'],
],'按四國的線條特徵成對分組，始終區分已觀察數值與未來預測。')];
const evidence=[
 quiz('1970 年四國中哪國城市人口比例最高？',['菲律賓略高於 30%，微高於馬來西亞約 30%','馬來西亞約 60%，遠高於菲律賓','印尼約 64%，位居首位','泰國約 50%，位居首位'],'菲律賓約 32%，馬來西亞約 30%，兩者起點相近。'),
 quiz('馬來西亞的城市人口比例如何變化？',['1970 年約 30%，2000 年 60%，2040 年預測超過 80%','1970 年約 80%，2000 年降至 60%','1970 年約 13%，2010 年與菲律賓相等','2000 年約 30%，2040 年預測只有 50%'],'馬來西亞上升至後期第一；2040 年逾 80% 是預測值。'),
 quiz('菲律賓 1990、2010、2020 年依次約是多少？',['近 50%、略高於 40%、約 46%','約 30%、60%、75%','約 13%、43%、53%','約 30%、32%、33%'],'菲律賓有 1990 年高點、2010 年回落與 2020 年再回升，並非單調上升。'),
 quiz('印尼與菲律賓在哪一年約同為 43%？',['2010 年','1970 年','1990 年','2040 年'],'2010 年兩條線在 43% 附近相交；到 2020 年印尼已高於菲律賓。'),
 quiz('2020 年印尼的排名與大約比例是甚麼？',['約 53%，四國第二','約 13%，四國最低','約 75%，四國第一','約 33%，四國最低'],'2020 年馬來西亞約 76% 第一，印尼略高於 50% 第二。'),
 quiz('自 2010 年起，哪國的城市人口比例最低？',['泰國','印尼','菲律賓','馬來西亞'],'2010 年泰國約 32%，低於其他三國；其後預測期仍最低。'),
 quiz('2040 年印尼與泰國的數值該如何表述？',['預計印尼約 64%、泰國約 50%','印尼實際已達 64%、泰國已達 50%','兩國都預計達 80% 以上','印尼預計 13%，泰國預計 30%'],'2040 年屬未來預測，應用「預計」，不可寫成已實現。'),
];
const logic=[
 sequence('菲律賓與馬來西亞：起點相近，後期走勢不同',[
  ['1970 年','菲律賓略高於 30%，馬來西亞約 30%。'],
  ['菲律賓中段','1990 年近 50%，2010 年略逾 40%，2020 年約 46%。'],
  ['馬來西亞中段','2000 年已到 60%，2020 年約 76%，後期居首。'],
  ['2040 年預測','菲律賓約 56%；馬來西亞逾 80%。'],
 ],'菲律賓有回落，馬來西亞升得較穩；2040 年的兩個數值都須標為預測。'),
 sequence('印尼與泰國：由低起點、交叉點寫到預測',[
  ['1970 年','印尼約 13%，四國最低；泰國約 18%。'],
  ['2010 年','印尼與菲律賓約同為 43%，泰國約 32% 為最低。'],
  ['2020 年','印尼略高於 50%，升至第二；泰國略高於 30%。'],
  ['2040 年預測','印尼約 64%，泰國約 50%。'],
 ],'排名上升是可核實事實；不要把「由末位到第二」直接等同最大百分點增幅。'),
];
const transfers=[
 transfer('另一張圖顯示四個地區 1980 至 2020 年城市人口比例，並預測 2030、2040 年。','哪句引言準確分開觀察期與預測期？',['圖表比較四地 1980 至 2020 年的城市人口比例，並預測至 2040 年。','圖表顯示四地 1980 至 2040 年全部已發生的比例。','圖表比較四地每年實際城市人口數目。','圖表只顯示 2040 年的住房價格。'],['觀察期、預測期、地點及百分比都交代。','2030 和 2040 尚屬預測。','單位是人口百分比，不是實際人數。','圖表內容與時間範圍都不符。'],[0],'原文引言用 with forecasts to 2040 明示有未來估計。'),
 transfer('四個地區的城市人口比例由 1980 至 2020 年整體上升。','哪句能概括共同方向？',['整體而言，四個地區都更都市化。','整體而言，四個地區的實際人口都減少。','整體而言，四地城市人口比例完全沒有變。','整體而言，只有一地的比例上升。'],['更都市化表示城市人口所佔比例上升。','比例上升不等於實際總人口減少。','與整體上升矛盾。','題目說四地都上升。'],[1],'原文 all four countries became more urbanised 指城市人口比例上升。'),
 transfer('A 地後期居首並預計維持；B 地從初期末位升到 2020 年第二。','哪項只報告可核實的排名關係？',['A 預計維持最高；B 由最後升至第二。','B 的絕對百分點增幅一定比 A 大。','A 從初期末位升到第二。','B 在所有年份都居首。'],['最高者及排名變化均可由圖直接核對。','排名變化不足以證明百分點增幅最大。','把 A、B 排名角色對調。','B 初期為末位。'],[2],'原文可核實的重點是馬來西亞後期領先、印尼由末位升到第二。'),
 transfer('C 地比例先升後降再升；D 地增長較慢，自 2010 年起最低。','哪項準確比較兩條線？',['C 有波動；D 較慢上升，2010 年起為最低。','C 與 D 每年都同值。','C 一直下降；D 一直最高。','D 2010 年以後完全不再變化。'],['把波動、慢增與排名三項資訊各自說清。','兩線形狀不同。','C 先升後回升，D 最低。','D 之後仍上升。'],[3],'原文對照菲律賓 fluctuated 與泰國後期 lowest。'),
 transfer('1980 年 C 地 32%、A 地 30%。','哪句可準確表達細小領先？',['C 略高於 30%，稍高於 A 約 30%。','C 比 A 高 30 個百分點。','A 當年 60%，遠高於 C。','兩地當年都超過 80%。'],['32% 對 30% 是約兩個百分點的微幅領先。','差距為約 2 個百分點。','A 為 30%。','兩地遠低於 80%。'],[4],'原文 1970 年菲律賓略高於 30%，馬來西亞約 30%。'),
 transfer('C 地 1990 年近 50%、2010 年 41%、2020 年 46%，2040 年估計 56%。','哪句同時保留波動與預測語氣？',['C 先由近 50% 降到 41%，2020 年回升至 46%，2040 年預計約 56%。','C 由 1990 至 2040 年每一步都是已觀察的上升。','C 2010 年達 56%，之後持續下降。','C 2040 年已實際達 56%，不屬預測。'],['年份順序與先降後升都對，且把 2040 年標為估計。','1990→2010 是下降，2040 是預測。','56% 是 2040 年估計。','2040 尚未觀察。'],[5],'原文菲律賓先升、後跌、再回升，分號後用 projected 標示 2040 年預測。'),
 transfer('A 地 1970 年約 30%，2000 年 60%，2040 年估計超過 80%。','哪句正確使用已觀察與預測時態？',['A 由 1970 年約 30% 升至 2000 年 60%，預計 2040 年逾 80%。','A 已在 2040 年實際超過 80%。','A 到 2000 年降至 30%。','A 1970 年已超過 80%。'],['前兩值已觀察，末值用「預計」。','未來值不能寫成既成事實。','2000 年為 60%。','1970 年約 30%。'],[6],'原文馬來西亞前段用 climbed，2040 年用 is forecast to exceed。'),
 transfer('B 地 1970 年 13%，2010 年與 C 地同為 43%，2020 年 53%。','哪項完整寫出低起點和交叉點？',['B 起點只有 13%，其後上升，2010 年與 C 同為 43%，2020 年逾 50%。','B 1970 年已是四地最高，2010 年達 13%。','B 2020 年仍只有 13%。','B 與 C 在 1970 年同為 43%。'],['13→43→53 的時間與交叉關係都正確。','B 起點是低值 13%。','2020 年為 53%。','同為 43% 發生於 2010 年。'],[7],'原文印尼約 13% 起步，2010 年與菲律賓約 43% 相等。'),
 transfer('B 地 2020 年 53%，2040 年估計 64%；D 地 2020 年 33%，2040 年估計 50%。','哪句把未來值標為預測？',['B 預計升至約 64%；D 預計由約 33% 升至 50%。','B 及 D 2040 年已實際達 64% 和 50%。','B 預計降至 13%，D 預計降至 18%。','D 的 2020 年值為 64%，B 為 33%。'],['2020 是觀察值，2040 用「預計」描述。','2040 尚未發生。','兩地預測方向均上升。','把 B、D 2020 年值混淆。'],[8],'原文 It should climb further 與 is expected to grow 都表示預測。'),
 transfer('某圖 A 地由 30% 升至 83%，B 地由 13% 升至 64%；B 的排名由最後升至第二。','若比較絕對百分點增幅，哪項正確？',['A 增加 53 個百分點，B 增加 51 個百分點；B 排名上升並不表示其百分點增幅最大。','B 增加 64 個百分點，大於 A 的 30。','A 和 B 的百分點增幅完全一樣。','只要 B 由末位升至第二，就一定增加最多百分點。'],['83−30=53；64−13=51，應分開增幅與排名。','須用終值減起值。','53 與 51 不相等。','排名改變不能代替數值計算。'],[2,7],'原圖中印尼由最後升至第二可直接確認；「最快增長」需先定義衡量方式，故不作無限定測驗。'),
];
export default {key:'task1-line-graph:2',meta:{topic:'四個亞洲國家城市人口比例與未來預測',summary:'分清已觀察年份與預測年份；比較馬來西亞後期居首、印尼由末位升到第二、菲律賓波動與泰國後期最低。',reviewStatus:'HOLD_SOURCE_AUDIO_RECONCILIATION',editorialNote:'原文稱印尼最快增長；圖中馬來西亞 1970–2040 年約 +53 個百分點，印尼約 +51。排名由末位至第二屬實；最快須限定為相對增幅或改寫原文與錄音。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
