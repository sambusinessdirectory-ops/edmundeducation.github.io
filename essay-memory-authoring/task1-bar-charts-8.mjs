// Task 1 Bar Charts 8: UK phone-call minutes, 1995–2002.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀圖表，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
 'The bar chart shows the total time spent on phone calls in the UK from 1995 to 2002. It compares three types of calls, and the unit is billions of minutes.',
 'Overall, local calls on fixed lines were the largest group every year. Their total rose to a high point in 1998 and 1999, then fell back to about its 1995 level.',
 'But national and international calls on fixed lines went up steadily. Mobile calls began at a very low level but grew much faster than the other types.',
 'In 1995, people spent about 72 billion minutes on local fixed-line calls, nearly twice the roughly 37 billion minutes spent on national and international fixed-line calls.',
 'Local fixed-line calls then rose each year to about 90 billion minutes in 1998 and 1999. After that, their total fell gradually to about 72 billion minutes in 2002.',
 'The other two types of calls both went up.',
 'National and international fixed-line calls rose steadily from about 37 billion minutes in 1995 to a little over 60 billion in 2002.',
 'Mobile calls rose more sharply. They went from about 3 billion minutes in 1995 to only 12 billion in 1999, then jumped to about 25 billion in 2000 and about 45 billion in 2002.',
];
const vocabulary=[
 v(['compares','shows','顯示'],['total duration','total time spent','總通話時間'],['measured in billions of minutes','unit is billions of minutes','單位為十億分鐘'],['across three categories','three types of calls','三類電話']),
 v(['remained the largest category throughout','were the largest group every year','全期都是最多'],['despite rising to a peak','rose to a high point','升至高峰'],['late 1990s','1998 and 1999','九十年代末'],['returning to their initial level','fell back to about its 1995 level','回到接近起點水平']),
 v(['By contrast','But','相比之下'],['increased steadily','went up steadily','穩步上升'],['starting from a very low base','began at a very low level','起點很低'],['recorded by far the sharpest growth','grew much faster than the other types','增長最急速']),
 v(['accounted for','spent','佔／達'],['almost twice','nearly twice','幾乎兩倍'],['roughly','roughly','大約'],['national and international calls','national and international fixed-line calls','全國及國際長途電話']),
 v(['local category','Local fixed-line calls','本地固網電話'],['climbed','rose','上升'],['around','about','大約'],['falling back gradually','fell gradually','逐漸回落']),
 v(['other two categories','other two types of calls','另外兩類電話'],['followed upward trends','both went up','兩者都上升']),
 v(['rose consistently','rose steadily','持續上升'],['approximately','about','約'],['just over 60 billion','a little over 60 billion','略多於六百億分鐘']),
 v(['showed a much more dramatic pattern','rose more sharply','升幅更急'],['increasing only modestly','went from about 3 billion minutes in 1995 to only 12 billion in 1999','初期增長不大'],['surged','jumped','急升'],['roughly','about','大約'],['final year','2002','最後一年']),
];
const structures=[
 f('The bar chart compares the total duration of bus journeys in City A, measured in millions of minutes, across three routes between 2010 and 2020.','界定總時間、單位、三類及完整期間',[1,3,5],{formula:'The [圖表類型] compares the total duration of [活動與地點], measured in [單位], across [類別數] between [期間]',meaning:'圖表比較英國 1995 至 2002 年三類電話的總通話分鐘數，數值以十億分鐘計。',usage:'時間序列圖先交代總量是「時間」、數值單位、類別和起止年份，避免當成通話次數。',parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares the total duration of'),slot(' telephone calls made in the UK','活動與地點'),link(', measured in'),slot(' billions of minutes','單位'),link(', across'),slot(' three categories','類別數'),link(' between'),slot(' 1995 and 2002.','期間')]}),
 f('Overall, Route A remained the largest category throughout, despite rising to a peak in 2018 and then returning to its initial level.','概覽同一系列始終最大，但中段先升後回到起點',[0,4,6],{formula:'Overall, [系列] remained the largest category throughout, despite rising to a peak in [中段] and then returning to [起點]',meaning:'本地固網通話分鐘數每年最高，1998/1999 年約 90 十億分鐘，2002 年回落至約 1995 年的 72。',usage:'一系列始終居首但呈先升後降形狀時，概覽要同時說排名和形狀，不能誤說持續上升。',parts:[link('Overall,'),slot(' local fixed-line calls','系列'),link(' remained the largest category throughout, despite rising to a peak in'),slot(' the late 1990s','中段'),link(' and then returning to'),slot(' their initial level.','起點')]}),
 f('By contrast, Route B increased steadily, while Route C, though starting from a very low base, recorded by far the sharpest growth.','比較另外兩類的穩定上升與低起點快速增長',[1,4,7],{formula:'By contrast, [系列乙] increased steadily, while [系列丙], though starting from a low base, recorded the sharpest growth',meaning:'全國及國際固網通話穩步增長；流動電話起點極低，但升幅遠比其他類別急。',usage:'兩個系列同樣上升卻速度不同時，要說明起點與增長速度，別把期末值和增長速度混為一談。',parts:[link('By contrast,'),slot(' national and international fixed-line calls','系列乙'),link(' increased steadily, while'),slot(' mobile calls','系列丙'),link(', though starting from a very low base, recorded by far the sharpest growth.')]}),
 f('In 2010, Route A accounted for 72 million minutes, almost twice the figure for Route B, at roughly 37 million.','用同年同單位兩值支持「幾乎兩倍」的比例比較',[0,5,6],{formula:'In [起始年], [甲] accounted for [值], almost twice [乙], at roughly [值]',meaning:'1995 年本地固網約 72 十億分鐘，接近全國及國際固網約 37 的兩倍。',usage:'寫「約兩倍」時要使用同年、同單位的兩個數值核對；72 與 37 的比值約 1.95。',parts:[link('In'),slot(' 1995','起始年'),link(','),slot(' local fixed-line calls','甲'),link(' accounted for'),slot(' about 72 billion minutes','甲值'),link(', almost twice the figure for'),slot(' national and international calls','乙'),link(', at roughly'),slot(' 37 billion.','乙值')]}),
 f('Route A then climbed each year to around 90 million minutes in 2018 and 2019, before falling back gradually to 72 million by 2020.','描述先逐年升至兩年高點，再逐步回落至期初水平',[1,3,7],{formula:'[系列] then climbed each year to around [兩年高值], before falling back gradually to [期末值] by [末年]',meaning:'本地固網由 1995 年約 72 上升至 1998/1999 年約 90，再回落至 2002 年約 72 十億分鐘。',usage:'中段高值連續兩年時，兩年都要寫；末期回到起點可用 before 對照。',parts:[slot('The local category','系列'),link(' then climbed each year to around'),slot(' 90 billion minutes in 1998 and 1999','兩年高值'),link(', before falling back gradually to'),slot(' about 72 billion','期末值'),link(' by'),slot(' 2002.','末年')]}),
 f('The other two routes both followed upward trends.','轉到餘下兩個同向上升的類別',[2,4,6],{formula:'The other two [類別] both followed upward trends',meaning:'由本地固網轉往另外兩類：全國及國際固網與流動電話都上升。',usage:'把一個先升後降的系列交代完後，可先指出餘下兩個系列的共同方向，再分別寫數值。',parts:[link('The other two'),slot(' categories','類別'),link(' both followed upward trends.')]}),
 f('Route B rose consistently from approximately 37 million minutes in 2010 to just over 60 million in 2020.','報告同一系列由起點到終點的持續增長',[2,4,7],{formula:'[系列] rose consistently from approximately [起始值及年] to just over [末值及年]',meaning:'全國及國際固網通話由 1995 年約 37 升至 2002 年略多於 60 十億分鐘。',usage:'走勢近乎一直上升時，可用起止兩個數值簡潔交代；保留原圖的十億分鐘單位。',parts:[slot('National and international fixed-line calls','系列'),link(' rose consistently from approximately'),slot(' 37 billion minutes in 1995','起始值及年'),link(' to just over'),slot(' 60 billion in 2002.','末值及年')]}),
 f('Emergency calls showed a much more dramatic pattern: after increasing only modestly from 3 to 12 million minutes between 2010 and 2015, they surged to 25 million in 2016 and reached 45 million by the final year.','分兩段描述低起點緩升和其後急升，保留各轉折年份',[2,4,6],{formula:'[系列] showed a dramatic pattern: after increasing only modestly from [早段起止], they surged to [轉折年值] and reached [末年值]',meaning:'流動電話由 1995 年約 3 增至 1999 年約 12，其後 2000 年約 25、2002 年約 45 十億分鐘。',usage:'增長速度在中途改變時，可分「早段小增」與「後段急升」，每個數值都要配準年份。',parts:[slot('Mobile calls','系列'),link(' showed a much more dramatic pattern: after increasing only modestly from'),slot(' about 3 to 12 billion minutes between 1995 and 1999','早段起止'),link(', they surged to'),slot(' roughly 25 billion in 2000','轉折年值'),link(' and reached'),slot(' around 45 billion by the final year.','末年值')]}),
];
const intro=[
 quiz('縱軸數字的正確單位是甚麼？',['十億分鐘的通話總時長','十億次通話','百分比','每次通話的平均分鐘數'],'圖表量度每年三類通話的總分鐘數，不是通話次數或比例。'),
 {type:'multi',prompt:'哪兩項屬於跨整段期間的主要特徵？',detail:'選兩項，再按「確認」。',options:[
  '本地固網通話一直最多，但先升至高點再回落到接近起點',
  '全國及國際固網穩步上升；流動電話起點低、增長最快',
  '流動電話在 1995 年已是最多',
  '本地固網通話由 1995 至 2002 年每年都上升',
 ],correct:[0,1],why:'概覽須同時說三類的全期排名與不同走勢，尤其本地電話並非一路增加。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代英國、三類電話、1995 至 2002 年，以及十億分鐘。'],
 ['整體概覽','本地固網始終最多但先升後降；另外兩類都升，流動電話增長最快。'],
 ['本地固網細節','比較 1995 年約 72 對長途約 37，再寫 1998/1999 高峰及 2002 回落。'],
 ['其餘兩類細節','長途固網穩升至 60 多；流動電話先小增、後急升至約 45。'],
],'按走勢分段：本地固網先升後降，另外兩類同升但速度不同。')];
const evidence=[
 quiz('哪一類電話通話分鐘數在 1995 至 2002 年每年都最多？',['本地固網電話','全國及國際固網電話','流動電話','三類每年都相同'],'本地固網柱始終最高，即使它在 1999 年後回落。'),
 quiz('1995 年本地固網與全國及國際固網分別約為多少？',['72 與 37 十億分鐘','37 與 72 十億分鐘','72 與 3 十億分鐘','90 與 60 十億分鐘'],'本地約 72、長途約 37，前者接近後者兩倍。'),
 quiz('本地固網通話何時約達 90 十億分鐘？',['1998 年和 1999 年','1995 年和 1996 年','2001 年和 2002 年','只有 2000 年'],'圖中 1998、1999 兩根本地固網柱都接近 90。'),
 quiz('本地固網在 2002 年約是多少？',['72 十億分鐘，接近 1995 年起點','90 十億分鐘，維持高峰','45 十億分鐘，與流動電話相同','37 十億分鐘，比長途電話少'],'2002 年本地固網約 72，回到接近 1995 年水平；仍高於另兩類。'),
 quiz('全國及國際固網電話如何變化？',['由 1995 年約 37 穩升至 2002 年略高於 60 十億分鐘','由約 72 降至約 37 十億分鐘','由 1995 年約 3 升至 2002 年約 45 十億分鐘','先升至 90，再跌回 72'],'長途固網是中間的灰柱，逐年增長；3 至 45 屬流動電話。'),
 quiz('流動電話在 1995、1999、2000、2002 年依次約為多少？',['3、12、25、45 十億分鐘','3、12、45、25 十億分鐘','37、50、56、61 十億分鐘','72、90、85、72 十億分鐘'],'手機黑柱在 1999 年後增幅變大，2000 年約 25，末年約 45。'),
];
const logic=[
 sequence('本地固網：最高系列的先升後降',[
  ['1995 年起點','約 72 十億分鐘，是同年長途固網約 37 的近兩倍。'],
  ['1998 和 1999 年','本地固網約 90 十億分鐘，達高點。'],
  ['高點後','本地固網逐年回落。'],
  ['2002 年','約 72 十億分鐘，接近起點但仍為最多。'],
 ],'「全期最多」與「期內先升後降」同時成立；不要因回落而誤以為它失去第一。'),
 sequence('另外兩類：都上升，但速度不同',[
  ['長途固網','1995 年約 37，2002 年略多於 60 十億分鐘，穩步上升。'],
  ['流動電話早段','1995 年約 3，1999 年約 12，起點很低。'],
  ['流動電話 2000 年','約 25 十億分鐘，增長開始明顯加快。'],
  ['流動電話末年','2002 年約 45 十億分鐘，增幅比另兩類最大。'],
 ],'流動電話增長最快並不表示末年總量最高；2002 年仍低於本地及長途固網。'),
];
const transfers=[
 transfer('另一張圖比較某城 2010 至 2020 年三條巴士路線的總乘車時間，單位為百萬分鐘。','哪句引言完整且單位正確？',['圖表比較該城三條路線於 2010 至 2020 年的總乘車時間，單位為百萬分鐘。','圖表比較每次巴士旅程的平均票價。','圖表比較三個城市的巴士乘客百分比。','圖表解釋巴士班次減少的原因。'],['量度內容、單位、地點、類別與期間都保留。','總乘車時間不是平均票價。','路線不是三個城市，也不是百分比。','圖表沒有原因資料。'],[0],'原文引言用 total duration 和 billions of minutes，不能寫成通話次數。'),
 transfer('路線 A 在每一年都最多，但中段達 90 百萬分鐘後回到起點約 72。','哪項同時抓住排名與形狀？',['A 全期最多，但先升到高點後回落至起點附近。','A 全期最多，而且逐年不斷上升。','A 中段達高點，因此末年一定不是最多。','A 全期都低於其他路線。'],['全期第一與先升後降可同時成立。','末年回到起點，並非持續上升。','回落不必然失去首位。','題目已說它每年最多。'],[1],'原文概覽 local fixed-line calls 全期最多，但 1998/1999 年達高點後回落。'),
 transfer('B 由約 37 穩升至逾 60；C 由約 3 升至約 45，增長速度更快。','哪項準確比較兩個上升系列？',['B 穩步上升；C 起點很低，但增長更急。','B 起點較低，而且比 C 增長更急。','B 和 C 都一路下降。','C 末年必定超過 A，因為它增長更快。'],['把 B 的穩升與 C 的低起點急升分開說。','C 的 3 低於 B 的 37。','兩類終點均高於起點。','增長速度不能直接決定期末排名。'],[2],'原文用 By contrast 區分長途固網穩升與手機低起點急升。'),
 transfer('2010 年 A 路線 72 百萬分鐘，B 路線 37 百萬分鐘。','「A 幾乎是 B 的兩倍」是否準確？',['準確：72 ÷ 37 約為 1.95。','不準確：72 比 37 少。','準確：72 ÷ 37 剛好等於 3。','不準確：兩條路線單位不同，不能比較。'],['同年同單位的比值約 1.95，可說接近兩倍。','72 高於 37。','比值接近 2，並非 3。','兩值均為百萬分鐘。'],[3],'原文以 1995 年 72 對 37 十億分鐘支持 almost twice。'),
 transfer('路線 A 在 2018、2019 年均約 90，2020 年回到約 72。','哪句按時序交代高峰與回落？',['A 在 2018 和 2019 年約達 90，然後逐步回落至 2020 年約 72。','A 只在 2018 年達高峰，2019 年已跌到 72。','A 由 2018 年 72 升至 2020 年 90。','A 在三年都完全相同。'],['保留兩個高值年份及之後的較低終點。','2019 年仍約 90。','起點終點值顛倒。','90 與 72 不同。'],[4],'原文同時寫 1998 和 1999 年約 90，接着到 2002 年回落至約 72。'),
 transfer('已寫完一條先升後降的路線；另外兩條都上升。','哪句適合作為下一段過渡？',['另外兩條路線都呈上升走勢。','另外兩條路線都先升後降。','三條路線末年完全相同。','先前那條路線必定不再是最多。'],['先交代剩餘兩類共同方向，再逐一分析。','題目說另外兩條都上升。','並無相同末年值。','走勢與排名是不同資訊。'],[5],'原文 The other two categories both followed upward trends 在兩種上升系列前作過渡。'),
 transfer('路線 B 的總分鐘數由 2010 年約 37 升至 2020 年略高於 60。','哪句準確報告起終點？',['B 由約 37 百萬分鐘穩升至略高於 60 百萬分鐘。','B 由略高於 60 降至約 37。','B 在 2010 年已是 90 百萬分鐘。','B 在 2020 年只剩約 3 百萬分鐘。'],['起點、終點、單位和上升方向都正確。','把數值和方向倒轉。','2010 年約 37，不是 90。','2020 年逾 60，不是 3。'],[6],'原文以 1995 年約 37 和 2002 年略多於 60 概括長途固網的穩升。'),
 transfer('路線 C 2010 年約 3、2014 年約 12、2015 年約 25、2020 年約 45 百萬分鐘。','哪句能分開早段小增和其後急升？',['C 先由 3 增至 12，之後升至 25，末年約 45。','C 先由 45 降至 25，再降至 3。','C 在 2014 年已是 45，之後維持不變。','C 的四個數值都約為 12。'],['按年份保留 3→12→25→45，後段增長較快。','與所有提供數值的時序相反。','2014 年為 12。','四個數值明顯不同。'],[7],'原文把手機 1995–1999 的 3→12 與其後 2000 的 25、2002 的 45 分段。'),
 transfer('末年 A 72、B 61、C 45 百萬分鐘；C 從 3 開始，增長最多。','哪項避免混淆增長幅度和末年排名？',['C 增長最多，但末年仍排在 A、B 之後。','C 增長最多，所以末年總量一定最高。','A 末年最低，因為它曾回落。','B 末年比 C 少，因為 B 增長較慢。'],['C 增長約 42，末年 45 仍低於 61、72。','快增長不代表終點最高。','A 的 72 是末年最高。','B 的 61 高於 C 的 45。'],[2,7],'原文說手機增長最急，但本地固網在 2002 年仍為最多。'),
 transfer('某圖縱軸為「總分鐘數」，三個柱系列代表不同電話類別。','哪項解讀超出圖表可支持的資訊？',['某類電話每通平均通話時長最高。','某類電話一年總分鐘數最多。','可比較各類在同一年總分鐘數。','可比較同一類別不同年份的總分鐘數。'],['總分鐘數沒有通話次數作分母，不能推算每通平均時長。','總分鐘數可直接比較。','圖表有同年各類柱。','圖表有多年同類柱。'],[0],'原文的 total duration 指總分鐘數；缺少通話次數，不能推算平均每通時長。'),
];
export default {key:'task1-bar-charts:8',meta:{topic:'1995 至 2002 年英國三類電話的總通話分鐘數',summary:'先看本地固網全期最高卻先升後降，再對照長途固網穩升與手機由低起點急升；所有值均為十億分鐘。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
