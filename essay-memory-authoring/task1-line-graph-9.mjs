// Task 1 Line Graph 9: UK goods transported, 1974–2002, million tonnes by four modes.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows how much freight the UK moved by road, water, rail and pipeline from 1974 to 2002. The unit is millions of tonnes.',
 'Overall, road carried the most freight in every year and increased more than the other three modes.',
 'Water transport also increased a lot, while rail went up and down and ended only a little above its starting amount.',
 'Pipeline was the least-used method in every year, even though its amount rose steadily.',
 'In 1974, road carried about 70 million tonnes, while water carried about 38 and rail about 40 million tonnes.',
 'After a small rise in 1978 and a fall in 1982, road freight rose to just over 80 million tonnes in 1990.',
 'It then fell a little in 1994, before rising quickly to nearly 100 million tonnes in 2002.',
 'Water freight also rose, but more slowly than road freight.',
 'Water carried just under 40 million tonnes at first and about 55 million in 1982. It stayed near 55 million until 1994, fell in 1998, and rose again to about 65 million in 2002.',
 'Rail fell to about 30 million tonnes in 1986, fell again in 1994, then rose to just over 40 million tonnes by 2002.',
 'Pipeline freight rose steadily from under 5 to just over 20 million tonnes.',
];
const vocabulary=[
 v(['illustrates','shows','顯示'],['volume of goods transported','how much freight the UK moved','貨運量'],['by road, water, rail and pipeline','by road, water, rail and pipeline','四種運輸方式']),
 v(['consistently the dominant mode','carried the most freight in every year','一直是最主要方式'],['recorded the largest increase','increased more than the other three modes','增量最大']),
 v(['rose considerably','increased a lot','大幅上升'],['whereas','while','而'],['fluctuated','went up and down','波動'],['only slightly above','only a little above','只略高於']),
 v(['remained the least-used method','was the least-used method in every year','一直使用量最少'],['despite','even though','儘管'],['steady growth','rose steadily','穩步上升']),
 v(['road haulage','road carried','道路貨運'],['stood at','about','約為'],['compared with','while','相比之下'],['roughly','about','約']),
 v(['slight rise','small rise','小幅上升'],['dip','fall','下降'],['road figure','road freight','道路貨運量'],['climbed','rose','上升']),
 v(['fell marginally','fell a little','略微下降'],['rising sharply','rising quickly','急升'],['almost','nearly','接近']),
 v(['gentler upward trend','rose, but more slowly than road freight','較緩上升'],['Water','Water','水路']),
 v(['volume increased','carried','貨運量增加'],['just under','just under','略低於'],['stayed near this level','stayed near 55 million','維持接近水平'],['dipped','fell','下降'],['recovered','rose again','回升']),
 v(['By contrast','Rail','相比之下'],['dropped','fell','下降'],['despite another dip','fell again','雖然再次下降'],['recovered','rose','回升']),
 v(['rose steadily','rose steadily','穩步上升'],['slightly above','just over','略高於']),
];
const structures=[
 f('The line graph illustrates the volume of goods transported in City A by road, water, rail and pipeline between 1980 and 2020.','引言界定四種方式、貨物量、地點及期間',[1,4,7],{formula:'The [圖表類型] illustrates the volume of goods transported in [地點] by [四方式] between [起年] and [末年]',meaning:'圖表比較英國 1974–2002 年道路、水路、鐵路和管道運輸貨物的數量，縱軸為百萬噸。',usage:'運輸方式是四條線；縱軸是貨物百萬噸，不是交通工具數或貨物價格。',parts:[link('The'),slot(' line graph','圖表類型'),link(' illustrates the volume of goods transported in'),slot(' the UK','地點'),link(' by'),slot(' road, water, rail and pipeline','四方式'),link(' between'),slot(' 1974','起年'),link(' and'),slot(' 2002.','末年')]}),
 f('Overall, road was consistently the dominant mode and recorded the largest increase.','概覽同時指出一條線全期最高和絕對增量最大',[0,5,9],{formula:'Overall, [方式] was consistently the dominant mode and recorded the largest increase',meaning:'道路貨運每個年份最多，由約 70 增至近 100 百萬噸，增量在四方式中最大。',usage:'「增量最大」是末值減起值；道路約 +30 百萬噸，高於水路約 +27、管道約 +20。',parts:[link('Overall,'),slot(' road','方式'),link(' was consistently the dominant mode and recorded the largest increase.')]}),
 f('Water transport also rose considerably, whereas rail fluctuated and finished only slightly above its initial level.','對照一條明顯上升線與另一條有波動、淨增量很小的線',[1,5,8],{formula:'[甲] also rose considerably, whereas [乙] fluctuated and finished only slightly above its initial level',meaning:'水路由約 38 增至約 65；鐵路上下波動，期末僅略高於起點約 40。',usage:'短期上下波動與期末淨變化是兩件事；描述鐵路時兩者都要交代。',parts:[slot('Water transport','甲'),link(' also rose considerably, whereas'),slot(' rail','乙'),link(' fluctuated and finished only slightly above its initial level.')]}),
 f('Pipeline remained the least-used method, despite steady growth.','一條線全期最低但逐步上升',[1,6,10],{formula:'[方式] remained the least-used method, despite steady growth',meaning:'管道貨運全期最少，仍由低起點穩步升至略高於 20 百萬噸。',usage:'「一直最低」是與其他三線的每年比較；「穩步增長」是同一線跨年比較，兩者可同時成立。',parts:[slot('Pipeline','方式'),link(' remained the least-used method, despite steady growth.')]}),
 f('In 1980, road freight stood at about 70 million tonnes, compared with roughly 38 million by water and 40 million by rail.','用同年三方式、同單位的起點值建立排名',[2,6,9],{formula:'In [起年], [甲] stood at about [甲值], compared with [乙值] by [乙] and [丙值] by [丙]',meaning:'1974 年道路約 70、水路約 38、鐵路約 40 百萬噸。',usage:'同年數值須配準運輸方式；水路 38 與鐵路 40 很接近，不可倒置後說差距巨大。',parts:[link('In'),slot(' 1974','起年'),link(','),slot(' road haulage','甲'),link(' stood at about'),slot(' 70 million tonnes','甲值'),link(', compared with roughly'),slot(' 38 million','乙值'),link(' by'),slot(' water','乙'),link(' and'),slot(' 40 million','丙值'),link(' by'),slot(' rail.','丙')]}),
 f('After a slight rise in 1978 and a dip in 1982, the road figure climbed to just over 80 million tonnes in 1990.','報告道路線早段小升小跌，然後達到較高的 1990 年值',[1,4,8],{formula:'After a slight rise in [年] and a dip in [年], [系列] climbed to just over [數值] in [年]',meaning:'道路貨運 1978 年略升、1982 年回落，1990 年升至略高於 80 百萬噸。',usage:'描述非單調線時，不能把 1978→1982 的下跌省掉而說一路上升。',parts:[link('After a slight rise in'),slot(' 1978','年一'),link(' and a dip in'),slot(' 1982','年二'),link(','),slot(' the road figure','系列'),link(' climbed to just over'),slot(' 80 million tonnes','數值'),link(' in'),slot(' 1990.','年三')]}),
 f('It then fell marginally in 1994 before rising sharply to almost 100 million tonnes by 2002.','期末急升前保留一次小幅下跌',[2,5,9],{formula:'It then fell marginally in [年] before rising sharply to almost [末值] by [末年]',meaning:'道路貨運 1994 年略降，2002 年再升至接近 100 百萬噸。',usage:'末年大升不代表每一個期間都上升；1994 年小跌仍是線條形狀一部分。',parts:[link('It then fell marginally in'),slot(' 1994','年'),link(' before rising sharply to almost'),slot(' 100 million tonnes','末值'),link(' by'),slot(' 2002.','末年')]}),
 f('Water followed a gentler upward trend.','在道路段後轉入較緩上升的水路段',[1,6,9],{formula:'[系列] followed a gentler upward trend',meaning:'水路貨運由約 38 升至約 65 百萬噸，走勢較道路平緩。',usage:'簡短過渡要有比較對象；此處 gentler 對照上一段道路期末的急升。',parts:[slot('Water','系列'),link(' followed a gentler upward trend.')]}),
 f('Its volume increased from just under 40 million tonnes to 55 million in 1982, stayed near this level until 1994, dipped in 1998, and then recovered to 65 million tonnes.','逐段寫水路的上升、平台、暫跌、回升',[2,5,10],{formula:'Its volume increased from [起點] to [較高值], stayed near this level until [年], dipped in [年], and then recovered to [末值]',meaning:'水路 1974 年略低於 40，1982 年約 55，至 1994 年接近，1998 年小跌，2002 年約 65 百萬噸。',usage:'多段形狀要按年排序；約數可概括，但 1998 年的回落不能被「穩步上升」抹去。',parts:[link('Its volume increased from'),slot(' just under 40 million tonnes','起點'),link(' to'),slot(' around 55 million in 1982','較高值'),link(', stayed near this level until'),slot(' 1994','平台末年'),link(', dipped in'),slot(' 1998','暫跌年'),link(', and then recovered to'),slot(' approximately 65 million tonnes.','末值')]}),
 f('By contrast, rail dropped to 30 million tonnes in 1986 and, despite another dip in 1994, recovered to just over 40 by the end.','對照鐵路的兩次低點與期末回升',[3,5,8],{formula:'By contrast, [系列] dropped to [低點] and, despite another dip in [年], recovered to just over [末值] by the end',meaning:'鐵路 1986 年約 30、1994 年再跌，期末回升至略多於 40 百萬噸。',usage:'鐵路終點略高於起點，但期間曾兩度下跌，不能稱為持續增長。',parts:[link('By contrast,'),slot(' rail','系列'),link(' dropped to'),slot(' around 30 million tonnes in 1986','低點'),link(' and, despite another dip in'),slot(' 1994','再跌年'),link(', recovered to just over'),slot(' 40','末值'),link(' by the end.')]}),
 f('Pipeline transport rose steadily from about 5 to slightly above 20 million tonnes.','用起終約數收束全期最低但穩升的管道線',[2,6,9],{formula:'[系列] rose steadily from about [低起點] to slightly above [末值]',meaning:'管道貨運起點低於 5 百萬噸，2002 年略高於 20；原文把起點寬鬆概括為約 5。',usage:'不要把管道期末的 20 多誤寫成最高；原圖 1974 年起點約 3，原文「約 5」是較寬的約數。',parts:[slot('Pipeline transport','系列'),link(' rose steadily from about'),slot(' 5','低起點'),link(' to slightly above'),slot(' 20 million tonnes.','末值')]}),
];
const intro=[
 quiz('縱軸上的 70、40、20 等數字代表甚麼？',['每年各運輸方式的貨物百萬噸數','每年各方式的百分比','每種交通工具的數量','每噸貨物的運費'],'縱軸是 Million tonnes；四條線是道路、水路、鐵路、管道的貨運量。'),
 {type:'multi',prompt:'哪兩項是四方式最清楚的整體格局？',detail:'選兩項，再按「確認」。',options:[
  '道路全期最多、絕對增加也最大；管道全期最少但穩升',
  '水路整體上升；鐵路有波動，期末只略高於起點',
  '鐵路在每一年都超過道路',
  '管道在 2002 年已成最多貨運方式',
 ],correct:[0,1],why:'概覽按全期排名和四條線的不同長期形狀分組。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代英國四種方式、1974–2002 年及百萬噸貨運量。'],
 ['整體概覽','道路始終最多且增加最多，管道始終最少；水路上升，鐵路波動。'],
 ['道路細節','比較 1974 年道路、水路、鐵路，之後追蹤道路 1978／1982 小波動和期末急升。'],
 ['水路、鐵路、管道','水路上升中有平台與小跌；鐵路兩次低點；管道低位穩升。'],
],'先以道路建立主線，再按其餘三條的形狀分述，保留百萬噸單位。')];
const evidence=[
 quiz('哪種方式全期運輸貨物最多？',['道路，約由 70 升至近 100 百萬噸','水路，約由 38 升至 65','鐵路，約由 40 升至 41','管道，由低於 5 升至略高於 20'],'道路線每一年都位居四條線最上方。'),
 quiz('1974 年道路、水路、鐵路依次約多少？',['70、38、40 百萬噸','38、40、70 百萬噸','70、40、38 百萬噸','5、20、100 百萬噸'],'道路約 70；水路約 38，鐵路約 40，後兩者很接近。'),
 quiz('道路貨運 1990 年約多少？',['略高於 80 百萬噸','約 40 百萬噸','略高於 20 百萬噸','約 5 百萬噸'],'道路線在 1978 小升、1982 回落後，1990 年升到略高於 80。'),
 quiz('道路貨運 1994 至 2002 年如何？',['1994 年略降，其後升至 2002 年近 100 百萬噸','1994 年後持續降至約 30','1994 與 2002 年都約 40','2002 年只略高於 20'],'道路 1994 年約 77，1998 年約 95，2002 年近 100。'),
 quiz('水路貨運在 1982、1994、1998、2002 年的形狀如何？',['1982 年約 55，1994 年仍接近，1998 年小跌，2002 年回升至約 65','1982 年已約 100，之後急跌至零','四年都完全相同','1998 年達約 100，2002 年降至 5'],'水路在中段接近平台，1998 年略降後期末增至約 65。'),
 quiz('鐵路貨運的兩個明顯低點在哪些年份？',['1986 年約 30，1994 年再跌至約 27','1974 年約 70，2002 年近 100','1982 年約 55，2002 年約 65','1978 年約 5，1998 年略高於 20'],'鐵路約於 1986、1994 年形成低點，期末回升至略高於 40。'),
 quiz('管道貨運與其他三種方式相比如何？',['全期最少，但由低於 5 穩升至略高於 20 百萬噸','全期最多，期末近 100','由約 40 降至零','一直維持約 70'],'管道線一直最低；圖上 1974 年約 3，2002 年約 22。'),
];
const logic=[
 sequence('道路：全期最高，但仍有兩次短暫回落',[
  ['1974 年','道路約 70 百萬噸，明顯高於水路與鐵路約 38–40。'],
  ['1978→1982','先小升、後小跌，並非每年連續上升。'],
  ['1990→1994','1990 年略高於 80，1994 年稍回落。'],
  ['2002 年','急升至接近 100，仍是全期最高。'],
 ],'「增量最大」約指道路起終差近 30 百萬噸；不代表每個中間時段都上升。'),
 sequence('其餘三種：各自用不同形狀描述',[
  ['水路','由略低於 40 升至約 55，1994 年前後近平台，1998 年小跌，2002 年約 65。'],
  ['鐵路','1986 年約 30、1994 年再跌，2002 年回到略高於 40。'],
  ['管道','由圖上低於 5 的起點穩步升至略高於 20。'],
  ['全期排名','管道雖增長，仍低於其他三種方式。'],
 ],'按四條線的實際形狀與終值下判斷；低起點的穩升不等於期末最高。'),
];
const transfers=[
 transfer('另一圖顯示某國 1980–2020 年以道路、水路、鐵路和管道運送貨物的百萬噸數。','哪句引言交代量度對象與四方式？',['圖表比較某國四種運輸方式在 1980 至 2020 年的貨運百萬噸數。','圖表比較四種方式的乘客百分比。','圖表比較道路和鐵路的票價。','圖表解釋貨運公司選擇路線的原因。'],['地點、四方式、貨運量、單位與期間都準確。','圖中是貨物噸數，非乘客比例。','圖上不含票價。','沒有原因資料。'],[0],'原文引言界定 UK、road/water/rail/pipeline 與 1974–2002 年貨運量。'),
 transfer('A 方式每年運貨最多，且由 70 增至 100；其他方式增量較小。','哪句同時表達排名與增量？',['A 全期最多，也錄得最大絕對增量。','A 因增長最大，所以起點一定最少。','A 期末 100，表示它每年都正好增加相同噸數。','A 每年都低於其他方式。'],['全期最高與約 +30 的最大增量可同時成立。','A 起點已有 70。','兩個端點不足以證明逐年等速。','題目說 A 每年最多。'],[1],'原文道路是全期 dominant mode，也錄得最大增量。'),
 transfer('B 由 38 升至 65；C 中途上落、期末由 40 小升至 41。','哪句正確區分兩種長期走勢？',['B 明顯上升，C 有波動但終點只略高於起點。','B 期末低於起點，C 始終穩步上升。','B 和 C 期末都達 100。','C 從未有波動。'],['B 約 +27，C 淨增量僅約 +1。','B 終點較高；C 有波動。','65 和 41 均非 100。','題目已說 C 中途上落。'],[2],'原文水路升幅較明顯，鐵路波動後只略高於起點。'),
 transfer('D 方式全期貨運量最少，但由低起點持續上升。','哪句不會混淆排名與趨勢？',['D 一直是最少的方式，雖然其貨運量穩步增加。','D 穩步增加，所以期末必定最多。','D 全期最少，因此其數值完全沒有增加。','D 只在首年最少，其餘年份居首。'],['低排名和上升趨勢可以同時成立。','上升未必超過更高的系列。','穩步增加不是零變化。','題目說全期最少。'],[3],'原文管道 remained the least-used method, despite steady growth。'),
 transfer('1980 年道路 70、水路 38、鐵路 40 百萬噸。','哪句同年配值正確？',['道路約 70，水路約 38，鐵路約 40 百萬噸。','道路約 38，水路約 70，鐵路約 40。','三種方式都正好 70。','水路比道路高約 30 百萬噸。'],['三個方式與數值逐一配對。','把道路與水路對調。','三值不同。','水路低於道路約 32。'],[4],'原文 1974 年道路約 70、水路約 38、鐵路約 40 百萬噸。'),
 transfer('道路線 1978 年小升、1982 年小跌、1990 年升至逾 80。','哪句保留中途小跌？',['道路先小升後小跌，然後到 1990 年逾 80 百萬噸。','道路 1978 至 1990 年每年都連續上升。','道路 1982 年已達 100。','道路 1990 年降至約 5。'],['三段走勢及 1990 年值都準確。','1982 年有回落。','1990 年略高於 80。','道路值遠高於 5。'],[5],'原文道路 1978 年小升、1982 年小跌，然後 1990 年超過 80。'),
 transfer('道路 1994 年略降，2002 年近 100。','哪項表達後段轉向？',['1994 年小跌後，道路貨運急升至 2002 年近 100 百萬噸。','1994 年起持續下跌至 2002 年約 30。','1994 和 2002 年都近 100，完全沒有變。','道路 2002 年只有略高於 20。'],['末期急升前仍保留 1994 年小跌。','期末近 100。','兩年值不同。','略高於 20 屬管道。'],[6],'原文道路 1994 年 fell marginally，之後到 2002 年近 100。'),
 transfer('前段已寫增幅最大的道路；水路也上升，但較緩。','下一段哪句轉換最自然？',['水路亦呈上升走勢，但升幅較道路平緩。','水路與道路每年完全相同。','水路全期持續下降。','道路由始至終最少。'],['指出新系列和與前段相比的不同幅度。','兩線數值不同。','水路終點高於起點。','道路全期最高。'],[7],'原文 Water followed a gentler upward trend 承接道路段。'),
 transfer('水路由略低於 40 升至 1982 年約 55，中段接近持平，1998 年跌，期末約 65。','哪句保留所有主要轉折？',['水路先升至約 55，之後近平台、1998 年小跌，最後回升至約 65。','水路由 40 每年穩定升至 65，沒有任何回落。','水路 1998 年達 100，期末降至零。','水路自 1982 年起始終維持 55。'],['上升、平台、暫跌、回升依序俱在。','1998 年有小跌。','1998 年低於前段平台。','期末升至約 65。'],[8],'原文水路 1982 年約 55、1994 年前後近平台、1998 年小跌、末年約 65。'),
 transfer('鐵路 1986 年約 30、1994 年又下跌，2002 年略高於 40。','哪句兼顧波動與期末回升？',['鐵路有兩次低點，期末回升至略高於 40 百萬噸。','鐵路由 1986 年起每年直線升至 100。','鐵路 2002 年仍只有 30。','鐵路 1994 年沒有任何變化。'],['1986 與 1994 的低值和期末回升都保留。','1994 年再次下降。','末年略高於 40。','題目明示 1994 年有跌。'],[9],'原文鐵路 1986 年跌至約 30、1994 年再跌、期末回升至略逾 40。'),
 transfer('管道起點在圖上低於 5，期末略高於 20，且每個年份仍低於其他方式。','哪項最忠實於圖表？',['管道由低於 5 穩步增至略高於 20，但全期仍最少。','管道起點精確為 5，期末已超過道路。','管道期末接近 100，為全期最多。','管道由 20 降至低於 5。'],['保留圖上低於 5 的起點、較高終點及全期排名。','圖上起點約 3，不能寫精確 5；期末仍最低。','期末約 22。','走勢方向相反。'],[10],'原文「about 5」是寬鬆約數；圖上首點低於 5，約 3，期末略高於 20。'),
];
const balancedTransferOptions=[
 ['圖表比較某國1980至2020年四種貨運方式的運量（百萬噸）。','圖表比較某國1980至2020年四種方式的乘客比例及人數。','圖表比較某國1980至2020年的道路及鐵路票價變化。','圖表解釋某國1980至2020年貨運路線選擇的主要原因。'],
 ['A全期貨運量最多，也有最大的絕對增量。','A增量最大，所以起點必然是四種方式最少。','A期末達100，所以每年增加的噸數都相同。','A每年的貨運量都低於其他三種方式。'],
 ['B增長明顯；C雖有波動，期末僅略高於起點。','B期末低於起點；C從頭到尾穩步上升。','B和C期末貨運量都已達到100百萬噸。','C在整個期間從未有波動，數值一直不變。'],
 ['D全期運貨量最少，雖然其數值持續上升。','D運貨量持續上升，所以期末必定排第一。','D全期運貨量最少，所以數值一直沒有增加。','D只有首年運貨量最少，其後每年都排第一。'],
 ['道路約70、水路約38、鐵路約40百萬噸。','道路約38、水路約70、鐵路約40百萬噸。','三種方式貨運量都約70百萬噸。','水路比道路高約30百萬噸，鐵路居中。'],
 ['道路先小升再小跌，1990年已逾80百萬噸。','道路由1978至1990年每年都持續上升。','道路在1982年已達100百萬噸，沒有回落。','道路在1990年跌至約5百萬噸，屬最低。'],
 ['1994年小跌後，道路到2002年急升至近100百萬噸。','1994年小跌後，道路到2002年再跌至約30百萬噸。','1994及2002年道路都近100百萬噸，沒有變化。','道路在2002年只有略高於20百萬噸。'],
 ['水路也在上升，但整體增幅比道路更為平緩。','水路與道路每年的貨運數值都完全相同。','水路從起點至期末持續下降，沒有反彈。','道路始終運貨量最少，水路一直居首。'],
 ['水路先升至55，近乎持平後於1998年跌，末年回升至65。','水路從40每年穩升至65，中間完全沒有任何回落。','水路在1998年急升到100，末年反而大跌至零。','水路自1982年起一直維持55，後來也沒有變。'],
 ['鐵路兩度下跌，期末回升至略高於40百萬噸。','鐵路自1986年起每年直線升至100百萬噸。','鐵路到2002年仍然只有約30百萬噸，未見回升。','鐵路在1994年並未下跌，數值完全不變。'],
 ['管道由不足5升至略高於20，卻始終運貨最少。','管道起點精確為5，期末已超過道路，排第一。','管道到期末接近100，成為四種方式最多。','管道由20持續降至不足5，期末變成最低。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-line-graph:9',meta:{topic:'1974 至 2002 年英國四種方式的貨運量',summary:'道路全期最多且增量最大；水路上升但有平台與小跌，鐵路波動、管道低位穩升。縱軸為百萬噸。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
