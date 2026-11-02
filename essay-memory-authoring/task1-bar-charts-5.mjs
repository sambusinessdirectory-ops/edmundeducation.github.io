// Task 1 Bar Charts 5: checked against the 2014 electricity-production chart.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀圖表，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
 'The bar chart shows how much electricity the ten countries that made and used the most electricity produced and used in 2014. The numbers are in billions of kilowatt-hours.',
 'Overall, China and the United States made and used much more electricity. The other eight countries made and used much less.',
 'In every country except Germany, electricity production was higher than use.',
 'China came first. It produced 5,398 billion kWh and used slightly less, at 5,322 billion kWh.',
 'The United States came second: it produced 4,099 billion kWh and used 3,866 billion kWh. Its numbers were well below China’s but still much higher than those of the other countries.',
 'Russia came third, making 1,057 billion kWh and using 1,038 billion kWh. Japan came next, at 936.2 billion kWh produced and 856.7 billion kWh used.',
 'The other countries had much lower numbers.',
 'India produced 871 billion kWh but used only 698.8 billion kWh.',
 'Canada, France and Brazil showed a similar pattern: each produced more electricity than it used. Their production figures ranged from 530.7 to 618.9 billion kWh.',
 'Germany was the only country that used more than it produced: 582.5 billion kWh used versus 526.6 billion kWh produced.',
 'South Korea made and used less electricity than any other country: it made 485.1 billion kWh and used 449.5 billion kWh.',
];
const vocabulary=[
 v(['compares','shows','比較／顯示'],['electricity production and consumption','how much electricity','發電與用電量'],['leading countries','countries that made and used the most electricity','發電與用電量最高的國家'],['in billions of kilowatt-hours','in billions of kilowatt-hours','以十億度為單位']),
 v(['by far the largest','much more electricity','遠遠較多'],['producers and users','made and used','生產及使用'],['recorded much lower figures','made and used much less','數值低很多']),
 v(['output','production','產量'],['exceeded','was higher than','高於'],['consumption','use','使用量'],['except Germany','except Germany','德國除外']),
 v(['led the ranking','came first','排名第一'],['producing','produced','生產'],['consuming','used','消耗'],['marginally lower','slightly less','稍低']),
 v(['was second','came second','排名第二'],['well behind','well below','明顯低於'],['far ahead of','much higher than','遠高於'],['all other nations','the other countries','其餘國家']),
 v(['ranked third','came third','排名第三'],['generating','making','生產'],['followed','came next','緊隨其後']),
 v(['remaining countries','other countries','其餘國家'],['figures','numbers','數值'],['much smaller','much lower','低很多']),
 v(['produced','produced','生產'],['consumed','used','使用'],['only','only','只有']),
 v(['broadly similar patterns','similar pattern','大致相同的模式'],['each generating more electricity than it used','each produced more electricity than it used','各國發電量均高於用電量'],['production between','production figures ranged from','發電量介乎']),
 v(['only exception','only country','唯一例外'],['consuming','used','消耗'],['compared with','versus','與……相比'],['output','produced','產量']),
 v(['lowest totals','less electricity than any other country','發電和用電量最低'],['at 485.1 and 449.5 billion kWh','made 485.1 billion kWh and used 449.5 billion kWh','依序列出生產與使用量']),
];
const structures=[
 f('The bar chart compares water supply and use in the ten largest cities in 2020, in millions of litres.','界定兩個量度系列、比較對象、年份及單位',[1,3,6],{formula:'The [圖表類型] compares [兩個系列] in [比較對象] in [年份], in [單位]',meaning:'引言交代 2014 年十個主要國家的發電量和用電量，單位為十億千瓦時。',usage:'介紹有兩個數值系列的排名圖時，須指出對象、系列、年份與圖上的數值單位。',parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares'),slot(' electricity production and consumption','兩個系列'),link(' in'),slot(' the ten leading countries','比較對象'),link(' in'),slot(' 2014','年份'),link(', in'),slot(' billions of kilowatt-hours.','單位')]}),
 f('Overall, A and B were by far the largest suppliers and users, whereas the other eight cities had much lower figures.','概覽先分出明顯領先的兩個對象與其餘群組',[0,4,8],{formula:'Overall, [兩個領先對象] were by far [領先的兩項身分], whereas [其餘對象的低值]',meaning:'中國和美國的發電及用電量遠超另外八國，構成全圖最突出的分組。',usage:'兩個對象在兩個系列都顯著領先時，概覽可先對照「前兩名」和其餘群組。',parts:[link('Overall,'),slot(' China and the United States','兩個領先對象'),link(' were by far'),slot(' the largest producers and users','領先的兩項身分'),link(', whereas'),slot(' the other eight countries recorded much lower figures.','其餘對象的低值')]}),
 f('It is also clear that supply exceeded demand in every city except City G.','用 every 與 except 指出普遍關係及唯一例外',[1,6,9],{formula:'It is also clear that [系列甲] exceeded [系列乙] in every [對象] except [唯一例外]',meaning:'除德國外，每個國家的發電量都高於用電量。',usage:'兩個系列之間有一項跨多數對象都成立的關係時，應同時標出例外，避免寫成「全部」。',parts:[link('It is also clear that'),slot(' output','系列甲'),link(' exceeded'),slot(' consumption','系列乙'),link(' in every'),slot(' country','對象'),link(' except'),slot(' Germany.','唯一例外')]}),
 f('City A led the ranking, supplying 5,398 million litres and using a slightly lower 5,322 million litres.','寫首名的兩個數值及兩者細小差距',[1,4,7],{formula:'[對象] led the ranking, [系列甲數值] and [稍低的系列乙數值]',meaning:'中國發電 5,398、用電 5,322 十億千瓦時，兩數相近但發電略高。',usage:'首名在兩個系列皆居前時，先報其排名，再以相同單位核對兩個數值差距。',parts:[slot('China','對象'),link(' led the ranking,'),slot(' producing 5,398 billion kWh','系列甲數值'),link(' and'),slot(' consuming a marginally lower 5,322 billion kWh.','稍低的系列乙數值')]}),
 f('City B was second, at 4,099 million litres for supply and 3,866 million litres for use; despite being well behind A, it remained far ahead of the other cities.','在同一句寫第二名兩個值，以及它與第一名和其他對象的兩層差距',[0,3,8],{formula:'[第二名] was second, at [兩系列數值]; despite being well behind [第一名], it remained far ahead of [其餘對象]',meaning:'美國發電 4,099、用電 3,866 十億千瓦時；低於中國，但高於其餘八國很多。',usage:'第二名與第一名仍有差距、卻又明顯高於其餘對象時，要交代兩個比較層次。',parts:[slot('The United States','第二名'),link(' was second, at'),slot(' 4,099 billion kWh for production and 3,866 billion kWh for consumption','兩系列數值'),link('; despite being well behind'),slot(' China','第一名'),link(', it remained far ahead of'),slot(' all other nations.','其餘對象')]}),
 f('City C ranked third, supplying 1,057 and using 1,038 million litres, while City D followed with 936.2 and 856.7 million litres, respectively.','把第三、四名成對列出，依照相同系列順序讀取各自兩個數值',[3,4,9],{formula:'[第三名] ranked third, [甲、乙值], while [第四名] followed with [甲、乙值], respectively',meaning:'俄羅斯第三，發電／用電 1,057／1,038；日本第四，936.2／856.7，單位均為十億千瓦時。',usage:'兩個相鄰排名的對象可合寫，但每一對數值都必須按圖例的系列順序對應。',parts:[slot('Russia','第三名'),link(' ranked third,'),slot(' generating 1,057 billion kWh and using 1,038 billion kWh','第三名甲、乙值'),link(', while'),slot(' Japan','第四名'),link(' followed with'),slot(' 936.2 and 856.7 billion kWh, respectively.','第四名甲、乙值')]}),
 f('In the remaining cities, the figures were much smaller.','轉到其餘對象，提示以下將報告較低數值',[1,5,10],{formula:'In the remaining [對象], the figures were much smaller',meaning:'引出印度至南韓這一組數值較低的國家；上一段已寫中國、美國、俄羅斯、日本。',usage:'當前段已處理明顯較高的一組後，可用簡短過渡提示下一組的共同數值範圍。',parts:[link('In the remaining'),slot(' countries','對象'),link(', the figures were much smaller.')]}),
 f('City E produced 871 million litres but consumed only 698.8 million litres.','用 but 對比同一對象兩個不同系列的數值',[2,5,8],{formula:'[對象] produced [系列甲數值] but consumed only [較低的系列乙數值]',meaning:'印度發電 871、用電只有 698.8 十億千瓦時，兩者差距在這組較明顯。',usage:'同一對象的兩個系列有值得指出的差距時，可用 but 連接較高與較低的數值。',parts:[slot('India','對象'),link(' produced'),slot(' 871 billion kWh','系列甲數值'),link(' but consumed only'),slot(' 698.8 billion kWh.','較低的系列乙數值')]}),
 f('Cities F, G and H showed broadly similar patterns, each supplying more water than it used, with supply between 530.7 and 618.9 million litres.','將三個相近對象合成一組，並提供其較高系列的數值範圍',[1,4,7],{formula:'[三個對象] showed broadly similar patterns, each [甲高於乙], with [甲數值範圍]',meaning:'加拿大、法國、巴西都發電多於用電；三國發電量介乎 530.7 至 618.9 十億千瓦時。',usage:'幾個對象方向一致、數值又相近時，可先說共同關係，再用正確系列的最小至最大值收束。',parts:[slot('Canada, France and Brazil','三個對象'),link(' showed broadly similar patterns, each'),slot(' generating more electricity than it used','甲高於乙'),link(', with'),slot(' production between 530.7 and 618.9 billion kWh.','甲數值範圍')]}),
 f('City G was the only exception, using 582.5 million litres compared with supply of 526.6 million litres.','標出唯一反轉對象並用兩個數值證明例外',[2,6,10],{formula:'[對象] was the only exception, [乙數值較高] compared with [甲數值較低]',meaning:'德國用電 582.5，高於發電 526.6 十億千瓦時，是唯一用電超過發電的國家。',usage:'概覽已說「只有一個例外」時，細節段要點名對象並以同單位的兩個數值驗證。',parts:[slot('Germany','對象'),link(' was the only exception,'),slot(' consuming 582.5 billion kWh','乙數值較高'),link(' compared with'),slot(' output of 526.6 billion kWh.','甲數值較低')]}),
 f('City J had the lowest totals, at 485.1 and 449.5 million litres.','用最低排名及依系列順序的兩個值結尾',[3,7,9],{formula:'[對象] had the lowest totals, at [系列甲值] and [系列乙值]',meaning:'南韓的發電與用電量均為十國最低，依次為 485.1、449.5 十億千瓦時。',usage:'兩個系列的最低者是同一對象時，可簡潔收束；兩個值仍要依圖例順序配對。',parts:[slot('South Korea','對象'),link(' had the lowest totals, at'),slot(' 485.1 and 449.5 billion kWh.','系列甲和系列乙值')]}),
];
const intro=[
 quiz('圖中每個國家有兩根柱，兩根柱代表甚麼？',['發電量與用電量，單位為十億千瓦時','發電廠數目與居民人數，單位為人','石油進口與出口，單位為美元','2014 與 2015 年的人口百分比'],'圖例分別標明 production、consumption，兩者單位均為 billion kWh。'),
 {type:'multi',prompt:'哪兩項是整體概覽，而非單一國家的零散數字？',detail:'選兩項，再按「確認」。',options:[
  '中國和美國的兩項數值遠高於其餘八國',
  '除德國外，所有國家的發電量都高於用電量',
  '德國發電量恰好為 526.6 十億千瓦時',
  '所有國家的發電量與用電量完全相同',
 ],correct:[0,1],why:'概覽先抓圖中跨國家的兩個主要格局：前兩名明顯領先，以及德國唯一反轉。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代十國、發電與用電、2014 年以及十億千瓦時。'],
 ['整體概覽','指出中國和美國遠高於其餘八國；發電量通常高於用電量，只有德國例外。'],
 ['前四名細節','先寫中國和美國的巨大規模，再列俄羅斯與日本。'],
 ['其餘六國細節','寫印度差距、加拿大／法國／巴西相似關係、德國例外與南韓最低。'],
],'先確定圖例和單位，再看最高群組與普遍關係，最後按前四名和其餘六國分段。')];
const evidence=[
 quiz('2014 年發電量和用電量都遠高於其他八國的是哪兩國？',['中國和美國','俄羅斯和日本','印度和加拿大','德國和南韓'],'中國與美國兩個系列的柱都遠長於其餘國家。'),
 quiz('哪一國的用電量高於發電量？',['德國：用電 582.5，發電 526.6 十億千瓦時','中國：用電 5,322，發電 5,398','印度：用電 698.8，發電 871','南韓：用電 449.5，發電 485.1'],'德國是唯一 consumption 582.5 高於 production 526.6 的國家。'),
 quiz('中國的發電與用電量分別是多少？',['5,398 與 5,322 十億千瓦時','4,099 與 3,866 十億千瓦時','1,057 與 1,038 十億千瓦時','936.2 與 856.7 十億千瓦時'],'圖例先發電後用電；5,398、5,322 是中國的一對數值。'),
 quiz('美國與中國之間的排名關係是甚麼？',['美國第二，明顯低於中國，但遠高於其他八國','美國第一，中國第二','美國與中國的兩個系列完全相同','美國低於全部其他國家'],'美國兩項數值約 4,099、3,866，位居中國之後，仍大幅領先第三名俄羅斯。'),
 quiz('俄羅斯與日本的排名及數值如何對應？',['俄羅斯第三：1,057／1,038；日本第四：936.2／856.7','日本第三：1,057／1,038；俄羅斯第四：936.2／856.7','俄羅斯第三：1,038／1,057；日本第四：856.7／936.2','兩國發電量都超過 5,000'],'斜線前是發電、後是用電；俄羅斯在兩個系列都比日本高。'),
 quiz('印度的發電與用電量有何差別？',['發電 871，高於用電 698.8 十億千瓦時','用電 871，高於發電 698.8','兩項均為 871','發電 530.7，用電 455.8'],'印度發電與用電的差值約 172.2 十億千瓦時。'),
 quiz('加拿大、法國與巴西的共同特點是甚麼？',['三國發電都多於用電，發電量介乎 530.7 至 618.9','三國用電都多於發電','三國發電量均超過 4,000','三國兩項數值都完全相同'],'這三國的發電量分別為 618.9、561.2、530.7；都高於各自用電量。'),
 quiz('十國中哪一國兩個系列都最低？',['南韓：發電 485.1，用電 449.5','德國：發電 526.6，用電 582.5','巴西：發電 530.7，用電 455.8','印度：發電 871，用電 698.8'],'南韓的發電與用電量都低於表中其他九國。'),
];
const logic=[
 sequence('前四名：先規模懸殊，再有序列值',[
  ['中國居首','發電 5,398；用電 5,322 十億千瓦時。'],
  ['美國第二','發電 4,099；用電 3,866，仍遠高於其餘國家。'],
  ['俄羅斯第三','發電 1,057；用電 1,038。'],
  ['日本第四','發電 936.2；用電 856.7。'],
 ],'保持每個國家「發電／用電」的固定順序；中國、美國與第三名之間的量級差要在文字中顯示。'),
 sequence('其餘國家：以共同關係和例外組織細節',[
  ['印度','發電 871，高於用電 698.8。'],
  ['加拿大、法國、巴西','都發電多於用電，發電量介乎 530.7 至 618.9。'],
  ['德國','唯一用電多於發電：582.5 對 526.6。'],
  ['南韓','發電 485.1、用電 449.5，兩系列皆最低。'],
 ],'後六名不能只逐國列數；三個相似國家合寫，然後突出德國例外和南韓最低。'),
];
const transfers=[
 transfer('另一張圖列出十個城市 2020 年供水和用水量，單位為百萬公升。','哪句引言準確保留圖表的範圍和單位？',['圖表比較十個城市 2020 年的供水與用水量，單位為百萬公升。','圖表解釋為何十個城市缺水。','圖表比較十個國家的飲用水百分比。','圖表顯示 2010 至 2020 年的用水趨勢。'],['對象、兩系列、單一年份及單位都正確。','圖表數值不能直接說明原因。','城市、量度內容與單位都改錯。','題目只有 2020 年，並無十年趨勢。'],[0],'原文引言交代十國、2014 年、發電與用電，以及十億千瓦時。'),
 transfer('十城供水和用水圖中，A、B 兩城的兩項數值都遠大於其餘八城。','哪項適合作為主要特徵？',['A、B 兩城兩項數值都明顯領先，其餘八城低得多。','A 城供水 5,398 百萬公升，用水 5,322。','所有城市的兩項數值都完全相同。','其餘八城都高於 A、B 兩城。'],['概括最突出的群組差距，不必先列個別數值。','只報 A 城一對值，未概括分組。','與前兩城明顯領先矛盾。','把高低關係顛倒。'],[1],'原文概覽以中國、美國對其餘八國，先說最鮮明的量級差。'),
 transfer('十城之中，九城供水高於用水；只有 G 城用水高於供水。','哪句不會抹去唯一例外？',['除 G 城外，所有城市的供水都高於用水。','所有十城的供水都高於用水。','只有 G 城的供水高於用水。','九城供水與用水完全相同。'],['用「除 G 城外」精確限定普遍關係。','把 G 城錯算在內。','把九城和一城的位置對調。','已知九城存在供水高於用水。'],[2],'原文概覽用 except Germany 避免把「其他九國」誇大為「所有十國」。'),
 transfer('A 城供水 5,398、用水 5,322 百萬公升，兩項都排名第一。','哪句保留排名和兩值的先後？',['A 城居首，供水 5,398 百萬公升，用水略低，為 5,322 百萬公升。','A 城居首，用水 5,398，供水 5,322。','A 城居末，兩項均低於 500。','A 城居首，供水與用水都恰好是 5,398。'],['先供水後用水，並準確說出用水略低。','把兩個系列的數值對調。','與排名和數值都矛盾。','用水不是 5,398。'],[3],'原文以中國的 5,398／5,322 說明首名的兩個系列相近但不相等。'),
 transfer('B 城供水 4,099、用水 3,866；A 城兩項都超過 5,300，其他城市都低於 1,100。','怎樣準確描述 B 城的兩層比較？',['B 城第二，落後 A 城，但仍遠高於其餘八城。','B 城第二，而且與其他八城完全相同。','B 城第一，遠高於 A 城。','B 城比 A 城和其他八城都低。'],['既承認與首名差距，也指出它對後八名的大幅領先。','4,099 與低於 1,100 不可能相同。','A 城的兩項數值高於 B 城。','B 城高於其他八城。'],[4],'原文寫美國第二時，同時比較它低於中國及高於其他國家的兩層差距。'),
 transfer('C 城供水／用水 1,057／1,038；D 城 936.2／856.7。','哪句正確配對第三、四名與兩個系列？',['C 城第三，供水／用水 1,057／1,038；D 城第四，936.2／856.7。','D 城第三，C 城第四；兩城數值不變。','C 城第三，用水／供水 1,057／1,038。','C、D 兩城供水都高於 5,000。'],['排名及每對值的供水／用水次序都準確。','C 的兩項數值均高於 D。','把 C 的兩個系列對調。','兩城數值都遠低於 5,000。'],[5],'原文合寫俄羅斯第三、日本第四；respectively 必須讓數值與系列一一對應。'),
 transfer('某圖前四城數值超過 900，其餘六城都低於 900。','前四城寫完後，哪句能自然引入後六城？',['至於其餘六城，數值低得多。','所有十城的數值都超過 900。','前四城的數值比後六城低。','其餘六城的數值完全一樣。'],['指出分組界線，為較低數值的細節段開場。','後六城低於 900。','前四城較高。','只知道都低於 900，不能說完全相同。'],[6],'原文以 In the remaining countries 由前四名轉到較低的其餘六國。'),
 transfer('E 城供水 871、用水 698.8 百萬公升。','哪句用 but 表出同城兩系列差距？',['E 城供水 871，但用水只有 698.8 百萬公升。','E 城用水 871，但供水只有 698.8。','E 城供水與用水都是 871。','E 城供水與用水都低於 500。'],['保留同城供水較高、用水較低的關係。','把供水和用水數值互換。','兩項值不相等。','兩項都高於 500。'],[7],'原文用 India produced ... but consumed only ... 對照同國兩個數值。'),
 transfer('F、H、I 三城供水量依次為 618.9、561.2、530.7；每城用水量都較低。','怎樣把三城的共同模式合寫？',['F、H、I 都供水多於用水，供水量介乎 530.7 至 618.9。','F、H、I 都用水多於供水，供水量介乎 530.7 至 618.9。','F、H、I 的供水量都恰好是 618.9。','F、H、I 的供水量介乎 455.8 至 499.9。'],['共同方向和供水系列的最小／最大值都準確。','把供需方向反轉。','三個供水值並不相同。','把供水範圍換成其他數值。'],[8],'原文把加拿大、法國、巴西合組，並取三國發電量 530.7 至 618.9 的範圍。'),
 transfer('G 城用水 582.5、供水 526.6；其他九城均供水高於用水。','哪項能用數字證明 G 城是唯一例外？',['G 城唯一用水多於供水：582.5 對 526.6。','G 城與其他九城一樣，供水多於用水。','G 城兩項數值完全相等。','G 城供水 582.5，用水 526.6。'],['582.5 高於 526.6，且方向與其他九城相反。','G 城方向不同。','兩項差 55.9。','把供需數值對調。'],[9],'原文以德國用電 582.5 對發電 526.6，具體證明概覽中的唯一例外。'),
 transfer('J 城供水 485.1、用水 449.5，兩項均為十城最低。','哪句準確收束排名？',['J 城兩項總值最低，供水及用水依次為 485.1、449.5。','J 城兩項總值最高，供水及用水依次為 485.1、449.5。','J 城供水 449.5、用水 485.1，且兩項最低。','J 城兩項數值都恰好為 485.1。'],['最低排名和兩個系列的數值順序都正確。','題目已說兩項最低。','把兩系列值對調。','用水是 449.5。'],[10],'原文最後以南韓發電 485.1、用電 449.5 收束十國最低值。'),
];
export default {key:'task1-bar-charts:5',meta:{topic:'2014 年十國發電與用電量',summary:'先辨認中國和美國與其餘八國的量級差，再核對每國發電通常高於用電、只有德國相反，最後按排名組織數值。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
