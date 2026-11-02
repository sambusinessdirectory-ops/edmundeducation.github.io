// Task 1 Line Graph 3: month-on-month metal-price changes, not absolute prices.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows the percentage change in the prices of copper, nickel and zinc from one month to the next in 2014.',
 'Overall, nickel’s monthly changes were the biggest. It rose the most at the start but later fell the most.',
 'Copper’s monthly changes were smaller, while zinc had the highest monthly rise at the end of the year.',
 'The monthly changes for all three metals went down around the middle of the year, then went up again in November and December.',
 'In January, nickel’s price rose by about 6% from the previous month. Copper rose by 2%, and zinc by 1%.',
 'In February, nickel was still up by about 4%, while zinc had its biggest monthly rise, at 3%.',
 'After February, the monthly changes for all three metals became smaller. By May, nickel was up by about 0.5% and zinc by about 1%, while copper was down by about 0.5%.',
 'June had the lowest monthly changes of the year.',
 'In June, nickel fell much more than the other metals: its price fell by about 3% from the previous month. Zinc fell by 1%, and copper by about 0.5%.',
 'From July to September, copper was up by about 1% each month, while nickel was down by 1% each month, and zinc was down by about 0.5%.',
 'In October, nickel’s price fell by 2% from the previous month. But in December all three changes were positive: zinc was up 2%, copper about 1.5%, and nickel 1%.',
];
const vocabulary=[
 v(['illustrates','shows','顯示'],['month-on-month','from one month to the next','與上月相比'],['percentage changes','percentage change','百分比變化']),
 v(['most volatile','monthly changes were the biggest','波動最大'],['strongest rise','rose the most','最大升幅'],['steepest fall','fell the most','最大跌幅']),
 v(['changed more modestly','monthly changes were smaller','變化較小'],['whereas','while','而'],['highest monthly change','highest monthly rise','最高月度升幅']),
 v(['weakened','went down','變弱／下滑'],['around mid-year','around the middle of the year','約在年中'],['recovering','went up again','回升']),
 v(['At the beginning of the year','In January','年初'],['compared with 2% for copper and 1% for zinc','Copper rose by 2%, and zinc by 1%','與銅及鋅的升幅比較']),
 v(['remained high','was still up','仍維持較高正增幅'],['roughly','about','大約'],['peaked','had its biggest monthly rise','達最高月升幅']),
 v(['figures for all three metals fell steadily','monthly changes for all three metals became smaller','三種金屬的變化率下滑'],['had dropped to','was up by','降至較低正值'],['slipped to','was down by','轉為下跌']),
 v(['June','June','六月'],['clear low point','lowest monthly changes of the year','明顯的全年低點']),
 v(['plunged','price fell','大跌'],['approximately','about','約'],['far below','fell much more than the other metals','遠低於其他兩種']),
 v(['recovered to','was up by','回到正增幅'],['whereas','while','而'],['stayed at','was down by','維持在'],['hovered near','was down by about','徘徊於']),
 v(['slipped again','price fell','再次下跌'],['by December','in December','到十二月'],['were positive','were positive','轉為正值'],['around','about','大約']),
];
const structures=[
 f('The line graph illustrates month-on-month percentage changes in the prices of rice, wheat and maize in 2020.','引言交代比較的是相對上月的百分比變化，而非價格水平',[1,4,7],{formula:'The [圖表類型] illustrates month-on-month percentage changes in the prices of [三種商品] in [年份]',meaning:'圖中是 2014 年銅、鎳、鋅價格相對前一個月的百分比變化，並非每噸價格。',usage:'縱軸是「與上月相比的變化率」時，必須寫清 month-on-month；負數表示價格下降，不是負價格。',parts:[link('The'),slot(' line graph','圖表類型'),link(' illustrates month-on-month percentage changes in the prices of'),slot(' copper, nickel and zinc','三種商品'),link(' in'),slot(' 2014.','年份')]}),
 f('Overall, wheat was the most volatile crop, starting with the strongest rise but later recording the steepest fall.','概覽指出哪個系列正負變化幅度都最大',[0,5,8],{formula:'Overall, [系列] was the most volatile [類別], starting with the strongest rise but later recording the steepest fall',meaning:'鎳在年初有約 +6% 的最大月升幅，六月又有約 −3% 的最大月跌幅，波動幅度最大。',usage:'同一系列有最高正值與最低負值時，可用 most volatile，但要能由圖中兩端數值驗證。',parts:[link('Overall,'),slot(' nickel','系列'),link(' was the most volatile'),slot(' metal','類別'),link(', starting with the strongest rise but later recording the steepest fall.')]}),
 f('Rice changed more modestly, whereas maize ended the year with the highest monthly change.','對照較平穩系列和期末月度變化最高系列',[1,6,9],{formula:'[較平穩系列] changed more modestly, whereas [另一系列] ended the year with the highest monthly change',meaning:'銅的月度變化幅度較小；鋅於十二月約 +2%，高於銅約 +1.5% 和鎳 +1%。',usage:'「期末最高」只指末月變化率，不能誤稱該商品的實際價格最高。',parts:[slot('Copper','較平穩系列'),link(' changed more modestly, whereas'),slot(' zinc','另一系列'),link(' ended the year with the highest monthly change.')]}),
 f('All three crops weakened around mid-year before recovering in November and December.','概括三個系列共同的年中轉弱與年末回升',[2,6,10],{formula:'All three [系列] weakened around mid-year before recovering in [年末月份]',meaning:'銅、鎳、鋅的月變化在年中下滑，之後十一、十二月回升。',usage:'多條線在同一時段有共同方向時，可在概覽提煉時間拐點，細節再寫個別幅度。',parts:[link('All three'),slot(' metals','系列'),link(' weakened around mid-year before recovering in'),slot(' November and December.','年末月份')]}),
 f('At the beginning of the year, wheat rose by about 6%, compared with 2% for rice and 1% for maize.','同月比較三種商品的月度升幅',[1,5,8],{formula:'At the beginning of the year, [甲] rose by [值], compared with [乙值] for [乙] and [丙值] for [丙]',meaning:'一月鎳約 +6%，銅 +2%，鋅 +1%，三者皆為相對上月價格上升。',usage:'同月三條線都在零以上時，可並列其月升幅；保持「升幅」而非實際價格的語意。',parts:[link('At the beginning of the year,'),slot(' nickel','甲'),link(' rose by'),slot(' about 6%','甲值'),link(', compared with'),slot(' 2%','乙值'),link(' for'),slot(' copper','乙'),link(' and'),slot(' 1%','丙值'),link(' for'),slot(' zinc.','丙')]}),
 f('In February, wheat remained high at roughly 4%, while maize peaked at 3%.','同月指出一個系列仍高及另一個系列達自身高點',[2,4,8],{formula:'In [月份], [甲] remained high at [值], while [乙] peaked at [值]',meaning:'二月鎳月升幅仍約 +4%；鋅在該月約 +3%，為鋅自己的全年最高月升幅。',usage:'「鋅達高點」指鋅的變化率峰值，不代表它高於同月所有其他金屬。',parts:[link('In'),slot(' February','月份'),link(','),slot(' nickel','甲'),link(' remained high at roughly'),slot(' 4%','甲值'),link(', while'),slot(' zinc','乙'),link(' peaked at'),slot(' 3%.','乙值')]}),
 f('After this, all three rates fell steadily: by May, wheat and maize had dropped to 0.5% and 1% respectively, while rice had slipped to about -0.5%.','報告共同轉弱及五月各系列正負不同的變化率',[2,5,9],{formula:'After this, [三系列變化率] fell steadily: by [月份], [甲乙] had dropped to [各值], while [丙] had slipped to [負值]',meaning:'到五月鎳約 +0.5%、鋅 +1%，銅約 −0.5%；正值雖下降仍代表價格小升。',usage:'變化率「下降到 +0.5%」不等於價格下降；只有跨過零以下才表示價格相對上月下跌。',parts:[link('After this,'),slot(' the figures for all three metals','三系列變化率'),link(' fell steadily: by'),slot(' May','月份'),link(','),slot(' nickel and zinc','甲乙'),link(' had dropped to'),slot(' around 0.5% and 1% respectively','各值'),link(', while'),slot(' copper','丙'),link(' had slipped to'),slot(' about -0.5%.','負值')]}),
 f('June was the clear low point.','用短句標出三條線共同的最低月份',[3,6,10],{formula:'[月份] was the clear low point',meaning:'六月鎳約 −3%、鋅 −1%、銅約 −0.5%，是三條線共同低位。',usage:'數條線在同一月份附近都落到低位時，可用短句作路標，下一句需跟上各系列數據。',parts:[slot('June','月份'),link(' was the clear low point.')]}),
 f('Wheat plunged to approximately -3%, far below maize at -1% and rice at about -0.5%.','在低點月份用三個負值比較跌幅深淺',[4,7,10],{formula:'[甲] plunged to approximately [最低負值], far below [乙] at [負值] and [丙] at [負值]',meaning:'六月鎳約 −3%，鋅 −1%，銅約 −0.5%；鎳下跌幅度最深。',usage:'負值比較要看離零有多遠；−3% 比 −1% 更低，表示當月價格跌得更多。',parts:[slot('Nickel','甲'),link(' plunged to approximately'),slot(' -3%','最低負值'),link(', far below'),slot(' zinc','乙'),link(' at'),slot(' -1%','乙負值'),link(' and'),slot(' copper','丙'),link(' at'),slot(' about -0.5%.','丙負值')]}),
 f('From July to September, rice recovered to around 1%, whereas wheat stayed at -1% and maize hovered near -0.5%.','比較同一三個月窗口：一條轉正、兩條仍負',[5,7,10],{formula:'From [三個月窗口], [甲] recovered to [正值], whereas [乙] stayed at [負值] and [丙] hovered near [負值]',meaning:'七至九月銅約 +1%，鎳約 −1%，鋅約 −0.5%；銅轉正而另兩種仍為負。',usage:'比較同一時段多條線時，明確區分正負號；「回升到 +1%」表示價格再次較上月上漲。',parts:[link('From'),slot(' July to September','三個月窗口'),link(','),slot(' copper','甲'),link(' recovered to around'),slot(' 1%','正值'),link(', whereas'),slot(' nickel','乙'),link(' stayed at'),slot(' -1%','乙負值'),link(' and'),slot(' zinc','丙'),link(' hovered near'),slot(' -0.5%.','丙負值')]}),
 f('In October, wheat slipped again to -2%, but by December all three were positive, with maize at 2%, rice at around 1.5% and nickel at 1%.','先寫十月再跌，然後用十二月三個正值收束',[6,8,9],{formula:'In [月份], [甲] slipped again to [負值], but by [末月] all three were positive, with [三個末值]',meaning:'鎳十月再次跌到 −2%，但十二月鋅 +2%、銅約 +1.5%、鎳 +1%。',usage:'同一句跨十月與十二月時，必須明示時間切換；年底三個正值是月度變化率，並非價格。',parts:[link('In'),slot(' October','月份'),link(','),slot(' nickel','甲'),link(' slipped again to'),slot(' -2%','負值'),link(', but by'),slot(' December','末月'),link(' all three were positive, with'),slot(' zinc at 2%, copper at around 1.5% and nickel at 1%.','三個末值')]}),
];
const intro=[
 quiz('縱軸的 −3% 代表甚麼？',['該金屬價格比上一個月下跌約 3%','該金屬實際價格為負數','全年價格總共下跌 3%','該金屬售價為每噸 3 元'],'縱軸是相對上月的價格變化率；負值表示當月價格比上月低。'),
 {type:'multi',prompt:'哪兩項適合放在整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '鎳月度變化幅度最大，先有最大升幅、後有最大跌幅',
  '三種金屬在年中轉弱，十一、十二月回升；鋅年底月變化最高',
  '三種金屬的實際價格在六月全都變成負數',
  '銅每一個月的價格變化都恰好為零',
 ],correct:[0,1],why:'概覽抓波動最大系列與共同轉折；圖上負值是價格的月度變化，不是價格本身。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代三種金屬、2014 年及相對上一個月的百分比變化。'],
 ['整體概覽','鎳最波動，銅較溫和，三者年中轉弱、年底回升。'],
 ['一月至五月','比較一月正值、二月鋅高點，寫到五月銅轉負。'],
 ['六月至十二月','先寫六月低點，再對照七至九月的正負，最後報十月與十二月。'],
],'按時間和變化率的正負號組織，不能把月度增減率當作金屬價格。')];
const evidence=[
 quiz('一月哪種金屬月升幅最高？',['鎳約 +6%；銅 +2%，鋅 +1%','銅約 +6%；鎳 +2%，鋅 +1%','鋅約 +6%；銅 +2%，鎳 +1%','三者均約 +6%'],'一月鎳的折線在 +6%，高於銅 +2% 與鋅 +1%。'),
 quiz('二月鋅的月度價格變化是多少？',['約 +3%，是鋅自己的全年高點','約 −3%，是鋅的全年低點','約 +4%，高於鎳','恰好 0%，價格沒有變化'],'鋅的 X 記號在二月約 +3%；同期鎳約 +4%。'),
 quiz('五月哪種金屬的月度變化已轉為負數？',['銅約 −0.5%；鎳與鋅仍為正','鎳約 −3%；銅與鋅為正','鋅約 −1%；鎳與銅為正','三者都約 −3%'],'五月銅略低於零；鎳約 +0.5%，鋅約 +1%。'),
 quiz('六月鎳、鋅、銅的月度變化依次約為多少？',['−3%、−1%、−0.5%','+3%、+1%、+0.5%','−1%、−3%、−0.5%','−0.5%、−1%、−3%'],'六月鎳最低，約 −3%；鋅 −1%，銅約 −0.5%。'),
 quiz('七月至九月哪種金屬的月度變化回到約 +1%？',['銅；鎳仍約 −1%，鋅約 −0.5%','鎳；銅仍約 −1%，鋅約 −0.5%','鋅；銅與鎳都約 +1%','三種金屬都約 +1%'],'銅虛線於七月至九月在 +1% 附近，其餘兩條仍低於零。'),
 quiz('十月鎳的月度變化約為多少？',['−2%，再次轉弱','+2%，達全年最高','−3%，與六月完全相同','+1%，與十二月相同'],'十月鎳的實線由約 −1% 再跌至 −2%。'),
 quiz('十二月三種金屬的月度變化如何排序？',['鋅 +2% 最高、銅約 +1.5%、鎳 +1%','鎳 +2% 最高、銅約 +1.5%、鋅 +1%','三者都為負','三者都恰好為 +2%'],'十二月三條線都在零上；鋅最高，銅其次，鎳第三。'),
];
const logic=[
 sequence('一月至六月：正增幅逐步變弱，六月見低位',[
  ['一月','鎳 +6%、銅 +2%、鋅 +1%，都比上月上漲。'],
  ['二月','鎳約 +4% 仍高；鋅約 +3% 為鋅的全年最大月升幅。'],
  ['五月','鎳約 +0.5%、鋅約 +1% 仍為正，銅約 −0.5% 已轉負。'],
  ['六月','鎳 −3%、鋅 −1%、銅約 −0.5%，年中低位。'],
 ],'變化率由 +6% 下降到 +0.5% 時，價格仍在上漲，只是漲幅變小。'),
 sequence('七月至十二月：辨正負並標出年底回升',[
  ['七至九月','銅約 +1%，鎳約 −1%，鋅約 −0.5%。'],
  ['十月','鎳再次跌到約 −2%。'],
  ['十一月','三條線都從低位回升。'],
  ['十二月','鋅 +2%、銅約 +1.5%、鎳 +1%，全轉正。'],
 ],'末月三個正值代表各金屬相對十一月上漲，並不能據此比較它們的實際售價。'),
];
const transfers=[
 transfer('另一張圖的縱軸是「與上月相比的糧價變化百分比」，比較米、麥、玉米。','哪句引言準確界定量度內容？',['折線圖顯示米、麥、玉米價格相對上月的百分比變化。','折線圖顯示三種糧食每噸的實際價格。','折線圖顯示三種糧食的年總產量。','折線圖顯示人們購買糧食的比例。'],['明示月對月變化率，與縱軸一致。','變化率圖沒有實際售價。','圖上並非產量。','圖上並非購買人口比例。'],[0],'原文 month-on-month percentage changes 是最重要的量度限定。'),
 transfer('甲商品一月 +6%，六月 −3%；其他商品的月變化都落在 −1% 至 +3% 之間。','哪項有足夠數值支持「甲波動最大」？',['甲同時有最強月升幅與最深月跌幅，因此變化最劇烈。','甲每個月的價格都比其他商品貴。','甲全年價格一直上漲。','甲六月實際價格為 −3 元。'],['+6% 和 −3% 跨越的幅度最大，支撐波動判斷。','變化率不能比較價格高低。','六月 −3% 表示當月下跌。','−3% 是變化率，非負售價。'],[1],'原文以鎳一月約 +6% 和六月約 −3% 支持 most volatile。'),
 transfer('乙商品月變化較平緩；丙商品十二月為 +2%，高於其他兩種的 +1.5%、+1%。','哪句區分平穩程度與末月排名？',['乙變化較小；丙在十二月的月度升幅最高。','乙實際價格最低；丙實際價格最高。','乙全年不變；丙每個月都最高。','乙和丙十二月都下跌。'],['只比較圖上可見的變化幅度與末月變化率。','沒有實際價格。','平緩不等於零，末月最高不等於每月最高。','十二月數值都為正。'],[2],'原文銅變化較溫和，鋅十二月月變化最高。'),
 transfer('三條糧價變化率曲線在年中一同轉弱，十一、十二月回升。','哪項適合作為共同走勢？',['三種商品年中轉弱，年底又回升。','三種商品年中實際售價全部變成負數。','三條線全年都不變。','只有一種商品曾在年中轉弱。'],['抓共同時間轉折，未混淆變化率和價格。','負變化率不是負價格。','圖中有升跌。','題目指三條線一同轉弱。'],[3],'原文 All three metals weakened around mid-year before recovering in November and December。'),
 transfer('一月甲、乙、丙的月變化率依次是 +6%、+2%、+1%。','哪項同年同單位比較正確？',['甲月升幅最高，約 +6%；乙 +2%，丙 +1%。','甲實際售價是 6 元，乙 2 元，丙 1 元。','甲跌 6%，乙跌 2%，丙跌 1%。','甲、乙、丙三者升幅完全相同。'],['三個正值都是相對上月的升幅。','百分比不是售價金額。','正值代表上漲，非下跌。','6、2、1 不同。'],[4],'原文一月並列鎳約 +6%、銅 +2%、鋅 +1% 的月升幅。'),
 transfer('二月甲為 +4%，乙為 +3%；乙其他月份都不高於 +3%。','怎樣準確說乙達峰值？',['乙在二月達自身最高月升幅 +3%，雖然甲同月仍有 +4%。','乙在二月是所有商品中最高，因為 +3% 高於 +4%。','乙二月價格為每噸 3 元。','甲二月月升幅降至 −4%。'],['乙的自身峰值與同月甲的更高值可以同時成立。','+3% 低於 +4%。','月度變化率不是售價。','甲為正 +4%。'],[5],'原文二月鋅 peaked at 3% 指其自身峰值，同期鎳約 +4%。'),
 transfer('五月甲 +0.5%、乙 +1%、丙 −0.5%，此前各線的月增幅更高。','哪項正確解讀三種值？',['甲乙當月價格仍比上月高，但升幅縮小；丙當月價格比上月低。','三種商品五月價格都下跌。','甲與乙的價格已低於零。','丙的實際售價為負 0.5 元。'],['正值仍是上漲，負值才是下跌；數值變小不等於價格轉跌。','甲、乙仍為正。','變化率不是價格。','−0.5% 不是貨幣價格。'],[6],'原文五月鎳／鋅仍為正 0.5%／1%，銅約 −0.5%；須分清「增幅下降」與「價格下降」。'),
 transfer('六月三條線都在全年最低一帶；下一句將逐一列出三個負值。','哪句可作精簡路標？',['六月是明顯低點。','六月三種商品的實際價格都變成零。','六月所有變化率都達全年最高。','六月所有系列都完全相同。'],['短句先標月份與共同低位，下一句再用負值證明。','低變化率不等於零價格。','已說是低位。','三個負值可以不同。'],[7],'原文 June was the clear low point 後面立刻用三種金屬的負值佐證。'),
 transfer('六月甲 −3%、乙 −1%、丙 −0.5%。','哪項正確比較下跌幅度？',['甲當月跌得最深；乙其次，丙最小。','甲價格是負 3 元，低於乙負 1 元。','丙跌得最深，因 −0.5 比 −3 小。','三種商品當月都上漲。'],['−3% 距零最遠，代表最大月跌幅。','圖上是百分比變化，非實際售價。','−0.5% 的跌幅小於 −3%。','三個值均為負。'],[8],'原文六月鎳約 −3%，比鋅 −1%、銅約 −0.5% 跌得更深。'),
 transfer('七至九月甲約 +1%，乙約 −1%，丙約 −0.5%。','哪項保留三條線的正負號？',['甲每月上漲約 1%；乙、丙仍分別下跌約 1% 與 0.5%。','三種商品每月都上漲。','甲下跌 1%，乙上漲 1%。','乙、丙實際價格都為負數。'],['同一時段一正兩負，解讀為相對上月漲跌。','乙、丙仍是負變化。','把甲乙的正負反轉。','負變化率不代表負價格。'],[9],'原文七至九月銅約 +1%，鎳約 −1%，鋅約 −0.5%。'),
 transfer('十月甲 −2%；十二月甲 +1%、乙 +1.5%、丙 +2%。','哪項正確描述年末轉折？',['甲十月再跌，但十二月三項月變化都轉正，丙最高。','甲十月上升 2%，十二月三項都下跌。','丙十二月價格最高，因月變化 +2%。','甲十月與十二月都是 −2%。'],['時間和正負號都正確；丙的 +2% 是最高月變化。','十月 −2% 是下跌，十二月全正。','變化率不能比較實際售價。','甲十二月為 +1%。'],[10],'原文十月鎳再跌至 −2%，十二月三者回到正值，鋅 +2% 最高。'),
];
export default {key:'task1-line-graph:3',meta:{topic:'2014 年銅、鎳、鋅的月度價格變化率',summary:'先辨認鎳波動最大與年中共同低點，再按月比較三條線的正負值；負百分比代表相對上月價格下降。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
