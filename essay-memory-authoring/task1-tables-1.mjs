// Task 1 Tables 1: NYC total versus Manhattan and four other boroughs, counts and shares.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'先看人口數，再看佔全市比例。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'依全市總數、曼哈頓、其他四區分三條線。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The tables show changes in New York City’s total population and compare Manhattan with the four other districts from 1800 to 2000.',
 'Overall, the city’s population grew a lot over 200 years, but a much smaller share lived in Manhattan by the end.',
 'In 1800, more than three in four city residents lived in Manhattan. By 2000, more than four in five lived in the other four districts.',
 'In 1800, New York City had only 79,216 people.',
 'By 1900, this number had grown to 3,437,202; in 2000, it reached 8,009,185.',
 'The city grew more in the first 100 years: its population became over 40 times as large. In the next 100 years, it grew to a little more than twice its 1900 size.',
 'Manhattan changed differently from the other four districts.',
 'Manhattan grew from 60,515 people in 1800 to 1,850,093 in 1900, but fell to 1,538,096 by 2000.',
 'Manhattan’s share of the city fell from 76% to 54%, and then to only 19%.',
 'In comparison, the other districts kept growing: 18,701 in 1800, 1,587,109 in 1900 and 6,471,089 in 2000. Their share rose from 24% to 81%.',
];
const vocabulary=[
 v(['present','show','展示'],['as a whole','total','全市整體'],['other four districts','four other districts','另外四區'],['between 1800 and 2000','from 1800 to 2000','一八〇〇至二〇〇〇年']),
 v(['rose dramatically','grew a lot','大幅增加'],['across the two centuries','over 200 years','兩個世紀內'],['balance shifted sharply away from Manhattan','much smaller share lived in Manhattan','居住比例從曼哈頓轉走']),
 v(['made up more than three quarters','more than three in four','佔逾四分之三'],['other districts','other four districts','其他四區'],['accounted for over four fifths','more than four in five','佔逾五分之四']),
 v(['inhabitants','people','居民'],['had only','had only','只有']),
 v(['this figure','this number','此數字'],['increased','grown','增加'],['before reaching','it reached','其後達到']),
 v(['first century','first 100 years','首個百年'],['more explosive expansion','grew more','更急速增長'],['multiplying more than fortyfold','became over 40 times as large','增至四十多倍'],['following hundred years','next 100 years','其後百年']),
 v(['followed a different path','changed differently','走勢不同'],['rest of the city','other four districts','其餘四區']),
 v(['climbed from','grew from','由某值上升'],['then declined','but fell','之後下降'],['by 2000','by 2000','至二〇〇〇年']),
 v(['share consequently fell','share of the city fell','因此份額下降'],['finally to just','then to only','最後僅剩']),
 v(['By contrast','In comparison','相反'],['grew continuously','kept growing','持續增長'],['raising their combined share','Their share rose','合計份額上升']),
];
const structures=[
 f('The tables present changes in the population of a capital city as a whole and compare its centre with the other four districts between 1800 and 2000.','引言同時交代全市與核心區對其他四區的比較',[1,3,7],{formula:'The tables present changes in the population of [城市] as a whole and compare [核心區] with the other four districts between [起年] and [終年]',meaning:'一表是 NYC 全市人口，另兩表是 Manhattan 與 Brooklyn／Bronx／Queens／Staten Island 的合計。',usage:'other four districts 在圖中合為一組；不可擅自分出各區獨立人口。',parts:[link('The tables present changes in the population of'),slot(' New York City','城市'),link(' as a whole and compare'),slot(' Manhattan','核心區'),link(' with the other four districts between'),slot(' 1800','起年'),link(' and'),slot(' 2000','終年'),link('.')]}),
 f('Overall, the city’s population rose dramatically across the two centuries, but the balance shifted sharply away from the central district.','把全市人口上升與核心區份額下降並列概覽',[0,4,8],{formula:'Overall, the city’s population rose dramatically across the two centuries, but the balance shifted sharply away from [核心區]',meaning:'全市 79,216→8,009,185；Manhattan 份額 76→19%，其他四區 24→81%。',usage:'份額轉移不表示 Manhattan 絕對人口在兩百年全程下降；它 1800→1900 曾上升。',parts:[link('Overall, the city’s population rose dramatically across the two centuries, but the balance shifted sharply away from'),slot(' Manhattan','核心區'),link('.')]}),
 f('While the central borough made up more than three quarters of New York’s residents in 1800, the outer districts accounted for over four fifths by 2000.','用 While 對照兩個年份的主導居住區',[0,4,9],{formula:'While [起年主導區] made up more than three quarters of New York’s residents in 1800, [終年主導區] accounted for over four fifths by 2000',meaning:'1800 Manhattan 76%；2000 其他四區合計 81%。',usage:'over three quarters 是 76%，over four fifths 是 81%；兩者分屬不同年份。',parts:[link('While'),slot(' Manhattan','起年主導區'),link(' made up more than three quarters of New York’s residents in 1800, '),slot('the other districts','終年主導區'),link(' accounted for over four fifths by 2000.')]}),
 f('In 1800, New York City had only 80,000 inhabitants.','先報最早全市人口作增長基準',[0,4,8],{formula:'In 1800, New York City had only [人口數] inhabitants',meaning:'1800 全市總數 79,216；等於 Manhattan 60,515 + 其他 18,701。',usage:'79,216 是人數，不是 Manhattan 自身人口或百分比。',parts:[link('In 1800, New York City had only'),slot(' 79,216','人口數'),link(' inhabitants.')]}),
 f('By 1900 this figure had increased to 3,500,000, before reaching 8,100,000 in 2000.','用 this figure 接回全市人口並依次報兩期終值',[0,3,8],{formula:'By 1900 this figure had increased to [中年總數], before reaching [末年總數] in 2000',meaning:'NYC 1900 3,437,202；2000 8,009,185。',usage:'this figure 回指全市 1800 的 79,216，不是曼哈頓。',parts:[link('By 1900 this figure had increased to'),slot(' 3,437,202','中年總數'),link(', before reaching'),slot(' 8,009,185','末年總數'),link(' in 2000.')]}),
 f('The first century therefore saw the more explosive expansion, with the population multiplying more than thirtyfold; over the following hundred years it still grew substantially, though by nearly three times.','用分號比較兩個百年倍數，不混淆增量與倍數',[0,4,8],{formula:'The first century therefore saw the more explosive expansion, with the population multiplying more than fortyfold; over the following hundred years it still grew substantially, though by a little over twice',meaning:'1900/1800 約 43.4 倍；2000/1900 約 2.33 倍。',usage:'「倍」是終值÷起值；首百年絕對增量與次百年的大小要另算，不能由倍數直接斷言。',parts:[link('The first century therefore saw the more explosive expansion, with the population multiplying'),slot(' more than fortyfold','首百年倍數'),link('; over the following hundred years it still grew substantially, though by'),slot(' a little over twice','次百年倍數'),link('.')]}),
 f('The central borough followed a different path from the rest of the city.','用短過渡句轉向曼哈頓與其餘區比較',[0,4,8],{formula:'[核心區] followed a different path from the rest of the city',meaning:'Manhattan 人口先升後降；其他四區三個時點持續增。',usage:'different path 指變化方向，不表示曼哈頓在 2000 年已無居民。',parts:[slot('Manhattan','核心區'),link(' followed a different path from the rest of the city.')]}),
 f('Its population climbed from 61,000 in 1800 to 1,850,000 in 1900, but then declined to 1,540,000 by 2000.','沿同一區的三時點報先升後跌',[0,4,9],{formula:'Its population climbed from [起點] in 1800 to [中點] in 1900, but then declined to [終點] by 2000',meaning:'Manhattan 60,515→1,850,093→1,538,096。',usage:'1900 是此區人口高點；2000 下降，但仍遠高於 1800。',parts:[link('Its population climbed from'),slot(' 60,515','起點'),link(' in 1800 to'),slot(' 1,850,093','中點'),link(' in 1900, but then declined to'),slot(' 1,538,096','終點'),link(' by 2000.')]}),
 f('Its share consequently fell from 75% to 50%, and finally to just 20%.','區分同一區的人口份額與人數變化',[0,4,7],{formula:'Its share consequently fell from [早年比例] to [中年比例], and finally to just [末年比例]',meaning:'Manhattan 佔全市 76→54→19%，即使 1800→1900 人口數增加，份額仍下降。',usage:'百分比的分母是每年的全市總人口，不是曼哈頓自身人口。',parts:[link('Its share consequently fell from'),slot(' 76%','早年比例'),link(' to'),slot(' 54%','中年比例'),link(', and finally to just'),slot(' 19%','末年比例'),link('.')]}),
 f('By contrast, the other districts grew continuously, from 20,000 to 1,600,000 and then to 6,500,000, raising their combined share from 25% to 80%.','對照其餘四區的人數連續增長與合計份額上升',[0,4,8],{formula:'By contrast, the other districts grew continuously, from [三時點人數], raising their combined share from [起份額] to [終份額]',meaning:'其他四區合計 18,701→1,587,109→6,471,089；份額 24→81%。',usage:'「其他四區」是合計值，不能將 6,471,089 誤作單一 Brooklyn 或 Queens。',parts:[link('By contrast, the other districts grew continuously, from'),slot(' 18,701 to 1,587,109 and then to 6,471,089','三時點人數'),link(', raising their combined share from'),slot(' 24%','起份額'),link(' to'),slot(' 81%','終份額'),link('.')]}),
];
const intro=[quiz('三張表各顯示甚麼？',['全市人口；曼哈頓人口及份額；其他四區合計人口及份額','三張表各列一個獨立區','三張表都是地圖','三張表只給出生率'],'後兩表把全市拆成 Manhattan 與 other districts。'),{type:'multi',prompt:'哪兩項最適合概覽？',detail:'選兩項，再按「確認」。',options:['全市人口在兩世紀大幅上升','居住份額由 1800 曼哈頓主導轉為 2000 其他四區主導','曼哈頓人口從 1800 至 2000 年每一段都下降','2000 年全市人口只有 79,216 人'],correct:[0,1],why:'總量與地區份額是兩條主線。'}];
const route=[sequence('依範文排紐約三表報告',[
 ['引言','全市總人口，曼哈頓與其他四區合計的各年人口及份額。'],['概覽','全市大增；居住比重由曼哈頓移向其他四區。'],['全市細節','79,216→3,437,202→8,009,185；首百年約 43 倍，後百年約 2.3 倍。'],['分區細節','曼哈頓人數先升後跌、份額 76→54→19%；其他四區人數及份額持續上升。'],
],'每年 Manhattan+其他四區=全市；兩者百分比合計 100%。')];
const evidence=[
 quiz('全市三個年份人口？',['79,216→3,437,202→8,009,185','60,515→1,850,093→1,538,096','18,701→1,587,109→6,471,089','76%→54%→19%'],'第一張總人口表。'),
 quiz('首個百年約增至幾倍？',['約 43 倍，超過 40 倍','約 2.3 倍','剛好 1 倍','少於原來一半'],'3,437,202÷79,216≈43.4。'),
 quiz('曼哈頓人數如何？',['1800→1900 上升，1900→2000 下降','三時點不斷下降','三時點不斷上升','1900 與 2000 均為零'],'60,515→1,850,093→1,538,096。'),
 quiz('曼哈頓份額如何？',['76%→54%→19%，一直下降','19%→54%→76%','76%→81%→100%','份額一直為 54%'],'第二表百分比欄。'),
 quiz('其他四區合計人數如何？',['18,701→1,587,109→6,471,089，持續上升','三時點都下降','只有 2000 一年有資料','2000 僅 18,701'],'第三表三時點。'),
 quiz('2000 年其他四區合計佔比？',['81%','19%','24%','54%'],'第三表 2000 比例。'),
 quiz('哪句避免把份額下降當人口全程下降？',['曼哈頓 1800→1900 人數增加，佔全市份額仍由 76% 降至 54%。','曼哈頓 1800→1900 人數與份額都減。','2000 其他四區合計只有 19%。','每年全市總人口就是曼哈頓人口。'],['總量分母變大可使份額下降。','人數大增。','其他四區 81%。','另有四區。'][0]),
];
const logic=[sequence('三張表之間的加總校對',[
 ['1800','60,515 Manhattan＋18,701 其他＝79,216 全市；76%＋24%=100%。'],['1900','1,850,093＋1,587,109＝3,437,202；54%＋46%=100%。'],['2000','1,538,096＋6,471,089＝8,009,185；19%＋81%=100%。'],['範圍','other districts 是四區合計，不提供各自數值。'],
 ],'同一年相加才有意義，不能跨年相加求全市人口。'),sequence('兩種成長指標：人數與份額',[
 ['全市人數','79,216→3,437,202→8,009,185，一直升。'],['曼哈頓人數','先升至 1900 高點，再到 2000 減少。'],['曼哈頓份額','76→54→19%，連續下降。'],['其餘四區','人數 18,701→6,471,089，份額 24→81%。'],
 ],'份額變化依全市分母；「人口上升、份額下降」可以同時成立。')];
const transfers=[
 transfer('另一城市有總人口表，及核心區與其他區合計的表。','哪句引言說清表間關係？',['表格呈現全市人口變化，並比較核心區與其餘各區合計的人口。','表格只顯示五區各自的出生率。','表格都是地圖，不涉及人口。','全市數字只代表核心區。'],['總量與分組比較正確。','沒有出生率。','是表格。','另有其他區。'],[0],'原文 NYC as a whole vs Manhattan and four other districts。'),
 transfer('全市人口大增，曼哈頓佔比大幅下降。','哪句把總量與份額並說？',['兩世紀全市人口大增，但居住人口比重明顯移離曼哈頓。','全市人口下降，曼哈頓份額上升。','曼哈頓完全沒有居民。','所有分區份額都同時下降。'],['兩種指標方向準確。','均反。','仍有居民。','份額合計 100%。'],[1],'原文 population rose，balance shifted away from Manhattan。'),
 transfer('1800 曼哈頓 76%；2000 其他四區 81%。','哪句跨年份主導轉變正確？',['1800 曼哈頓佔逾四分之三；2000 其他四區合計逾五分之四。','1800 其他四區佔 81%。','2000 曼哈頓佔 76%。','兩個數字都是人口人數。'],['各年各區配對正確。','年份錯。','份額錯。','是百分比。'],[2],'原文 Manhattan >3/4 in 1800，others >4/5 in 2000。'),
 transfer('1800 第一表 New York City=79,216。','哪句不把總數誤作分區數？',['1800 年全市共有 79,216 名居民。','1800 年曼哈頓單獨有 79,216 人。','1800 年其他四區每區各 79,216 人。','79,216 是人口百分比。'],['第一表總人口。','曼哈頓 60,515。','四區合計 18,701。','單位人。'],[3],'原文 New York City 79,216 inhabitants。'),
 transfer('全市 1900 年 3,437,202；2000 年 8,009,185。','哪句保持年份先後？',['全市到 1900 年增至 3,437,202 人，2000 年達 8,009,185 人。','1900 年已有 8,009,185 人，2000 年降至 3,437,202。','兩年總人口都只佔 19%。','3,437,202 是曼哈頓 2000 數字。'],['兩時點與全市量度正確。','順序錯。','人數不是份額。','第一表全市。'],[4],'原文 this figure 3,437,202→8,009,185。'),
 transfer('全市 1800→1900 約 43 倍，1900→2000 約 2.33 倍。','哪句比較倍數準確？',['首個百年的相對擴張更急，人口增至四十多倍；次個百年增至約 2.3 倍。','次個百年增至四十多倍。','首百年人口只增加 43 人。','兩個百年都完全沒有增長。'],['倍數按終值÷起值；兩期差異明顯。','倍數互換。','是倍數非人數。','均增長。'],[5],'原文 first century >40-fold，following a little over twice。'),
 transfer('曼哈頓人數先升後降，其他四區持續升。','哪句過渡切到分區？',['曼哈頓的變化路徑與其餘城市地區不同。','所有分區人數方向完全一樣。','曼哈頓從 1800 起一直下降。','其他四區 2000 年全部沒有居民。'],['不同路徑有後續數據支持。','一方先升後跌。','1800→1900 大升。','合計 6,471,089。'],[6],'原文 Manhattan followed a different path。'),
 transfer('曼哈頓 60,515→1,850,093→1,538,096。','哪句描述數量走勢？',['曼哈頓人口到 1900 年升至 1,850,093，2000 年回落至 1,538,096。','曼哈頓人口三時點都下降。','曼哈頓到 2000 年降至零。','1900 的數字是全市總人口。'],['先升後跌，且 2000 非零。','首段大升。','仍逾 150 萬。','全市 1900 逾 343 萬。'],[7],'原文 Manhattan climbed then declined。'),
 transfer('曼哈頓人數 1800→1900 升，但份額 76→54% 降。','哪句不把人數與比例混淆？',['曼哈頓佔全市份額一路下降，從 76% 到 54%，最後 19%。','曼哈頓人數一路由 76 人跌至 19 人。','份額 1800→1900 上升。','19% 是曼哈頓 2000 的人數。'],['全市分母變大，份額可下降。','百分比不是人數。','54<76。','19% 是份額。'],[8],'原文 share 76→54→19%。'),
 transfer('其他四區合計 18,701→1,587,109→6,471,089；份額 24→81%。','哪句兩指標均準確？',['其他四區合計人數一直上升，佔全市份額亦從 24% 升至 81%。','其他四區每一區各有 6,471,089 人。','其他四區合計人口一路下降。','份額由 81% 跌至 24%。'],['人數與合計份額均上升。','此為四區合計。','數字增加。','方向相反。'],[9],'原文 other districts continuous growth and combined share 24→81%。'),
];
export default {key:'task1-tables:1',meta:{topic:'紐約市三表：全市人口與曼哈頓／其他四區份額',summary:'全市 79,216→3,437,202→8,009,185；曼哈頓人數先升後跌、份額 76→54→19%；其他四區合計人數及份額連續上升至 81%。同年分組數字加總為全市。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
