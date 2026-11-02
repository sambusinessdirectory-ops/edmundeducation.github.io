// Task 1 Line Graph 7: annual CO2 emissions per person, four countries, 1967–2007.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows the average amount of carbon dioxide produced by each person in the UK, Sweden, Italy and Portugal from 1967 to 2007. The unit is metric tonnes per person.',
 'Overall, the UK had the highest amount per person in every year shown, but its number slowly fell.',
 'Sweden also ended below its starting point after reaching a high in the late 1970s. Italy and Portugal, however, rose steadily, and Italy was second in 2007.',
 'In 1967, the UK produced just under 11 tonnes of CO2 per person, while Sweden produced about 8.7 tonnes per person.',
 'Sweden rose to just over 10 tonnes per person in 1977, almost as high as the UK. It then fell to about 7 in 1987 and around 5.5 by 2007.',
 'The UK fell more slowly, from nearly 11 to about 8.7 tonnes per person over the same years.',
 'Italy, on the other hand, rose from about 4.2 tonnes per person in 1967 to about 6.3 in 1977 and 7.7 in 1997. It then stayed near 7.7.',
 'Portugal started lowest, at just over 1 tonne per person, but rose steadily to about 5.5 in 2007, nearly the same as Sweden.',
];
const vocabulary=[
 v(['compares','shows','顯示'],['average carbon dioxide emissions per person','average amount of carbon dioxide produced by each person','人均二氧化碳排放'],['measured in metric tonnes','unit is metric tonnes per person','以公噸計']),
 v(['remained the highest emitter throughout','had the highest amount per person in every year shown','全期人均排放最高'],['although','but','雖然'],['declined gradually','slowly fell','逐步下降']),
 v(['ended lower than it began','ended below its starting point','終點低於起點'],['reaching a peak','reaching a high','達到高點'],['whereas','however','而'],['recorded steady growth','rose steadily','穩步上升'],['ranking second','was second','排名第二']),
 v(['In 1967','In 1967','一九六七年'],['just under','just under','略低於'],['compared with','while','與……相比'],['tonnes per person','tonnes per person','每人公噸數']),
 v(['almost matching','almost as high as','幾乎追上'],['falling markedly','fell','大幅下降'],['approximately','around','約'],['final year','2007','期末年份']),
 v(['gentler downward path','fell more slowly','下降較緩'],['slipping from','from','由……下降'],['over the same period','over the same years','同一期間']),
 v(['By contrast','on the other hand','相比之下'],['climbed','rose','上升'],['roughly','about','約'],['increased further','rose','進一步上升'],['levelled off','stayed near 7.7','其後持平']),
 v(['initially the lowest','started lowest','起初最低'],['rose steadily','rose steadily','穩步上升'],['almost converging with','nearly the same as','幾乎與……接近']),
];
const structures=[
 f('The line graph compares average water use per person in A, B, C and D from 1980 to 2020, measured in cubic metres.','引言明示人均量度、四國、期間與公噸單位',[1,3,6],{formula:'The [圖表類型] compares average [人均量度] in [四地] from [起年] to [末年], measured in [單位]',meaning:'比較英國、瑞典、意大利、葡萄牙 1967–2007 年的每人平均二氧化碳排放，單位為公噸。',usage:'per person 是關鍵限定：人均排放不能當成整個國家的排放總量。',parts:[link('The'),slot(' line graph','圖表類型'),link(' compares average'),slot(' carbon dioxide emissions per person','人均量度'),link(' in'),slot(' the United Kingdom, Sweden, Italy and Portugal','四地'),link(' from'),slot(' 1967','起年'),link(' to'),slot(' 2007','末年'),link(', measured in'),slot(' metric tonnes.','單位')]}),
 f('Overall, Region A remained the highest user throughout, although its figure declined gradually.','概覽指出全期最高者仍可逐步下降',[0,4,7],{formula:'Overall, [甲] remained the highest [量度對象] throughout, although its figure declined gradually',meaning:'英國每人排放全期最高，但由約 11 公噸緩慢降至約 8.7。',usage:'最高排名與下降趨勢可同時成立；不要因下降就誤稱某年失去首位。',parts:[link('Overall,'),slot(' the United Kingdom','甲'),link(' remained the highest'),slot(' emitter','量度對象'),link(' throughout, although its figure declined gradually.')]}),
 f('Region B also ended lower than it began after reaching a peak in the late 1990s, whereas Regions C and D recorded steady growth, with C ranking second by 2020.','對照一地先升後跌與另外兩地穩步上升，並指出末年第二',[1,5,7],{formula:'[甲] ended lower than it began after reaching a peak, whereas [乙丙] recorded steady growth, with [乙] ranking second by [末年]',meaning:'瑞典 1977 年達高點後到 2007 年低於起點；意大利、葡萄牙上升，意大利期末第二。',usage:'概覽四條線時，可按「終點低於起點」和「穩步上升」分組；峰值與末年排名均須核對。',parts:[slot('Sweden','甲'),link(' also ended lower than it began after reaching a peak in'),slot(' the late 1970s','峰值時段'),link(', whereas'),slot(' Italy and Portugal','乙丙'),link(' recorded steady growth, with'),slot(' Italy','乙'),link(' ranking second by'),slot(' 2007.','末年')]}),
 f('In 1980, Region A produced just under 11 tonnes per person, compared with about 8.7 tonnes in Region B.','用同年兩國的人均公噸數建立起點差距',[1,5,6],{formula:'In [起年], [甲] produced just under [人均值], compared with about [人均值] in [乙]',meaning:'1967 年英國人均略低於 11 公噸，瑞典約 8.7 公噸。',usage:'比較同年的兩個人均值時，兩者單位要相同；不能推算國家排放總量。',parts:[link('In'),slot(' 1967','起年'),link(','),slot(' the UK','甲'),link(' produced just under'),slot(' 11 tonnes per person','甲人均值'),link(', compared with about'),slot(' 8.7 tonnes','乙人均值'),link(' in'),slot(' Sweden.','乙')]}),
 f('Region B then rose to just over 10 tonnes in 1990, almost matching A, before falling markedly to 7 tonnes in 2000 and then to 5.5 by the final year.','按峰值、明顯回落及末年數值重建一條非單調線',[2,6,7],{formula:'[甲] then rose to just over [峰值], almost matching [乙], before falling markedly to [中期值] and then to [末值]',meaning:'瑞典 1977 年略高於 10，接近英國；1987 年約 7，2007 年約 5.5。',usage:'瑞典的高點在 1977 年，不是起點；「幾乎追上」不等於超越英國。',parts:[slot('Sweden','甲'),link(' then rose to just over'),slot(' 10 tonnes in 1977','峰值'),link(', almost matching'),slot(' the UK','乙'),link(', before falling markedly to'),slot(' around 7 tonnes in 1987','中期值'),link(' and then to'),slot(' approximately 5.5 tonnes by the final year.','末值')]}),
 f('Region A followed a gentler downward path, slipping from nearly 11 tonnes to 8.7 tonnes over the same period.','對照較平緩下降，並以同段起終值支持',[2,4,7],{formula:'[甲] followed a gentler downward path, slipping from [起點] to [終點] over the same period',meaning:'英國由 1967 年接近 11 降至 2007 年約 8.7 公噸，下降較瑞典平緩。',usage:'「較平緩」須與上一條較大跌幅比較；瑞典約 8.7→5.5，英國約 10.8→8.7。',parts:[slot('The UK','甲'),link(' followed a gentler downward path, slipping from'),slot(' nearly 11 tonnes','起點'),link(' to'),slot(' about 8.7 tonnes','終點'),link(' over the same period.')]}),
 f('By contrast, Region C climbed from 4.2 tonnes in 1980 to 6.3 in 1990, and then increased further to 7.7 in 2010, where it levelled off.','轉到上升系列並標出後期平台',[2,5,7],{formula:'By contrast, [甲] climbed from [起點] to [中點], and then increased further to [高點], where it levelled off',meaning:'意大利由 1967 年約 4.2、1977 年 6.3 增至 1997 年約 7.7 公噸，其後保持接近。',usage:'同一條線先增後持平時，不應稱 1997 年以後仍持續大增。',parts:[link('By contrast,'),slot(' Italy','甲'),link(' climbed from'),slot(' roughly 4.2 tonnes in 1967','起點'),link(' to'),slot(' about 6.3 tonnes in 1977','中點'),link(', and then increased further to'),slot(' around 7.7 tonnes in 1997','高點'),link(', where it levelled off.')]}),
 f('Region D, initially the lowest at just over 1 tonne, rose steadily to 5.5 tonnes in 2020, almost converging with B.','由期初最低寫到期末幾乎追上另一地',[2,5,6],{formula:'[甲], initially the lowest at [起點], rose steadily to [末值], almost converging with [乙]',meaning:'葡萄牙起點略逾 1 公噸，2007 年升至約 5.5，與瑞典期末非常接近。',usage:'「幾乎趨同」只代表期末數值接近，不代表兩國歷年路徑或總排放相同。',parts:[slot('Portugal','甲'),link(', initially the lowest at'),slot(' just over 1 tonne','起點'),link(', rose steadily to'),slot(' about 5.5 tonnes in 2007','末值'),link(', almost converging with'),slot(' Sweden.','乙')]}),
];
const intro=[
 quiz('圖中數值量度的是甚麼？',['每人平均二氧化碳排放公噸數','每國每年的二氧化碳排放總公噸數','每人的能源費用','每國擁有汽車的百分比'],'縱軸是 CO2 emissions in metric tonnes per person，屬人均量度。'),
 {type:'multi',prompt:'哪兩項可作為四國走勢的概覽？',detail:'選兩項，再按「確認」。',options:[
  '英國全期人均排放最高但緩降；瑞典達高點後期末低於起點',
  '意大利與葡萄牙整體上升；意大利 2007 年排第二，葡萄牙幾乎接近瑞典',
  '英國 2007 年已成四國最低',
  '四國的人均排放每一年都同時上升',
 ],correct:[0,1],why:'概覽按兩條下降線與兩條上升線分組，再指出全期第一與期末第二。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代四國、1967 至 2007 年、人均 CO2 排放及公噸單位。'],
 ['整體概覽','英國全期第一而緩降，瑞典先升後降；意大利與葡萄牙上升。'],
 ['英國與瑞典','由 1967 年起點寫瑞典 1977 年峰值與後期急降，對照英國較緩下降。'],
 ['意大利與葡萄牙','意大利上升至約 7.7 後持平；葡萄牙由最低升到幾乎與瑞典相同。'],
],'按下降與上升兩組線條分段，比逐國無重點列數更清楚。')];
const evidence=[
 quiz('哪國在整個期間人均排放最高？',['英國，雖然由接近 11 降至約 8.7 公噸','瑞典，因 1977 年略高於 10 公噸','意大利，因 2007 年約 7.7 公噸','葡萄牙，因期末約 5.5 公噸'],'英國線每個年份都在最高位置，瑞典 1977 年接近但未超越。'),
 quiz('1967 年英國與瑞典分別約多少公噸／人？',['英國略低於 11，瑞典約 8.7','英國約 8.7，瑞典略低於 11','英國約 4.2，瑞典約 1.2','兩國都約 5.5'],'英國起點接近 11，瑞典約 8.7，單位都為每人公噸。'),
 quiz('瑞典何時達高點，此後如何？',['1977 年略高於 10，其後跌至 2007 年約 5.5','1967 年約 5.5，其後一直升','2007 年略高於 10，為期末高點','1997 年約 7.7，其後持平'],'瑞典 1977 年幾乎追上英國，但後來明顯下降。'),
 quiz('意大利 1997 年後的走勢如何？',['升至約 7.7 公噸／人後大致持平','由約 7.7 跌到零','由約 7.7 持續升至 11','由約 4.2 降至 1.2'],'意大利線後期接近水平，期末仍約 7.7。'),
 quiz('葡萄牙與瑞典 2007 年的關係是甚麼？',['兩國都約 5.5 公噸／人，幾乎相同','葡萄牙約 11，瑞典約 1','葡萄牙已達 7.7，超過意大利','葡萄牙仍只有約 1.2'],'葡萄牙由初期最低上升，期末與已下降的瑞典幾乎接近。'),
 quiz('英國與意大利 2007 年如何排序？',['英國約 8.7 第一，意大利約 7.7 第二','意大利約 8.7 第一，英國約 7.7 第二','兩國都約 5.5 並列第三','英國已低於葡萄牙'],'英國仍最高，意大利次高；下降不代表英國已失去首位。'),
];
const logic=[
 sequence('下降組：瑞典轉向，英國緩降',[
  ['1967 年','英國接近 11、瑞典約 8.7 公噸／人。'],
  ['1977 年','瑞典略高於 10，幾乎追上英國。'],
  ['1987 年','瑞典已降至約 7；英國仍約 10。'],
  ['2007 年','英國約 8.7 仍最高；瑞典約 5.5。'],
 ],'瑞典先升後降，英國下降較平緩；兩條線均不可說一直上升。'),
 sequence('上升組：意大利後期持平，葡萄牙追近瑞典',[
  ['意大利起點','1967 年約 4.2 公噸／人。'],
  ['意大利高點','1977 年約 6.3、1997 年約 7.7，其後持平。'],
  ['葡萄牙起點','略逾 1 公噸／人，四國最低。'],
  ['2007 年','葡萄牙約 5.5，幾乎與瑞典期末值相同。'],
 ],'期末值接近不代表整段期間相同；人均值亦不能推算國家排放總量。'),
];
const transfers=[
 transfer('另一張圖比較四個地區 1980 至 2020 年每人的平均用水量，單位為立方米。','哪句引言保留人均限定？',['圖表比較四地 1980 至 2020 年每人平均用水立方米數。','圖表比較四地全國用水總量。','圖表比較每人用水費用的百分比。','圖表解釋四地水價差異的原因。'],['人均、四地、期間及立方米單位都準確。','人均量不等於地區總量。','圖上不是費用或百分比。','圖中沒有原因資料。'],[0],'原文 average ... emissions per person 是核心量度，不能改成全國總排放。'),
 transfer('A 地人均用水量每年最高，但由 11 降至 8.7 立方米。','哪項概覽同時保留排名與趨勢？',['A 全期最高，雖然其人均值逐步下降。','A 逐步下降，因此必然在末年最低。','A 全期每年都上升。','A 與其他地區每年完全相同。'],['最高排名與下降走勢可以同時成立。','下降不必然失去第一。','數值由 11 降至 8.7。','題目已說 A 每年最高。'],[1],'原文英國 remained the highest emitter throughout, although declined gradually。'),
 transfer('B 地期初 8.7、1977 年高於 10、期末 5.5；C、D 地整體上升，C 期末第二。','哪句概覽準確分組？',['B 先升後降、期末低於起點；C、D 上升，C 期末第二。','B 自始至終一直上升；C、D 一直下降。','B 期末最高；C 從未上升。','四地變化和期末排名完全相同。'],['保留 B 的峰值後下降及 C、D 的上升。','與已給數值方向相反。','B 期末只有 5.5。','不同地區有不同走勢。'],[2],'原文對照瑞典期末低於起點與意大利、葡萄牙穩升。'),
 transfer('1980 年 A 地約 10.8 立方米／人，B 地約 8.7。','哪句同年人均比較正確？',['A 略低於 11，B 約 8.7 立方米／人。','A 全地區總用水量為 10.8 立方米。','B 約 10.8，A 約 8.7。','兩地每人用水都恰好為 11。'],['保持人均單位與兩地的高低。','把人均量誤作地區總量。','把數值對調。','8.7 不等於 11。'],[3],'原文 1967 年英國人均略低於 11，瑞典約 8.7 公噸。'),
 transfer('B 地 1977 年略高於 10，接近 A；1987 年降至 7，期末 5.5。','哪句保留峰值後急降？',['B 於 1977 年接近 A，此後降至約 7，再到期末約 5.5。','B 自 1977 年起一路升至 11。','B 1987 年已降到零。','B 在 1977 年已明確超越 A。'],['峰值和後續兩個下降值依序準確。','期末為 5.5。','1987 年約 7。','接近不代表超越。'],[4],'原文瑞典 1977 年略高於 10，幾乎追上英國，後來跌到約 5.5。'),
 transfer('A 地由近 11 緩降至 8.7；B 地由 8.7 降至 5.5。','哪項「較緩」比較有數據支持？',['A 約減 2.3，B 約減 3.2；A 的下降較緩。','A 減 8.7，B 減 5.5；A 下降更急。','A 與 B 的跌幅完全相同。','A 其實上升，B 下降。'],['近 11 到 8.7 約減 2.3，小於 B 的約 3.2。','把末值誤作跌幅。','兩個差值不同。','A 起點較高。'],[5],'原文英國由近 11 降至約 8.7，下降幅度比瑞典緩。'),
 transfer('C 地 1980 年 4.2、1990 年 6.3、2010 年 7.7，之後維持接近 7.7。','哪句保留先上升後平台？',['C 先由 4.2 升至約 7.7，之後大致持平。','C 到 2010 年降至 4.2，之後繼續下降。','C 從 1990 年起每年都急升至 11。','C 在 1980 至 2020 年完全沒有變。'],['4.2→6.3→7.7 後近乎水平。','數值次序顛倒。','後段維持約 7.7。','前段明顯上升。'],[6],'原文意大利升至 1997 年約 7.7 公噸後 levelled off。'),
 transfer('D 地起點略高於 1，期末約 5.5；B 地期末也約 5.5。','怎樣寫「趨同」而不誇大？',['D 由最低起點上升，期末人均值與 B 幾乎相同。','D 與 B 每個年份都完全相同。','D 期末一定超過 B 很多。','D 起點就有約 5.5。'],['只說期末兩條線靠近，不推及整段歷史。','兩者起點不同。','期末幾乎相同。','D 起點略高於 1。'],[7],'原文葡萄牙初期最低，2007 年約 5.5，幾乎接近瑞典。'),
 transfer('兩國人均排放均約 5.5 公噸，但人口總數未知。','哪項推論超出圖表？',['兩國的全國 CO2 排放總量必然相同。','兩國的人均排放期末接近。','可比較兩國每人的平均排放。','單位是每人公噸。'],['全國總量還需乘人口；人均相同不代表總量相同。','期末人均值均約 5.5。','圖中提供人均值。','題目給定人均公噸。'],[0,7],'原圖只有 per person；不能用近似人均值推出國家總排放相同。'),
 transfer('某地一條線從 4.2 升至 7.7 後持平，另一條線由 1 升至 5.5。','哪項更適合以兩種形狀分組？',['第一條先升後持平；第二條持續上升且期末接近較低的另一國。','兩條線都先升後大幅下降。','第一條期末又回到 4.2。','第二條始終保持在 1。'],['各自趨勢和期末關係都按數值描述。','兩條線均沒有上述大幅下降。','第一條期末約 7.7。','第二條期末約 5.5。'],[6,7],'範文後段分別報告意大利上升後持平與葡萄牙穩升並接近瑞典。'),
];
export default {key:'task1-line-graph:7',meta:{topic:'英國、瑞典、意大利、葡萄牙的人均 CO2 排放',summary:'按下降與上升兩組線條比較：英國全期最高、瑞典高點後下降，意大利升至第二並持平，葡萄牙期末接近瑞典；單位是公噸／人。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
