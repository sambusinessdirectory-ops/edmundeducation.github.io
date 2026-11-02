// Task 1 Tables 5: worldwide mobile-phone sales market share, 2005–06.
// Corrected source distinguishes named manufacturers from the aggregate Others category.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'比較市場份額時，百分點是兩個百分比數值相減。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先辨最大品牌和升跌，再核對各公司份額。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows what share of worldwide mobile phone sales each manufacturer had in 2005 and 2006.',
 'Overall, Nokia sold the largest share in both years and grew a little; among the named companies, Motorola gained the most.',
 'In contrast, Samsung, LG, BenQ Mobile and the “Others” group all lost share. Sony Ericsson was the only smaller named company to gain share.',
 'In 2005, Nokia had 32.5% of worldwide sales, nearly twice Motorola’s 17.7% and much more than Samsung’s 12.7%.',
 'In 2006, Nokia’s share rose to 35% and it stayed clearly ahead, even though Motorola also rose to 21.1%.',
 'Motorola gained 3.4 percentage points, the biggest gain shown, but Samsung fell a little to 11.8%.',
 'The other named manufacturers had much smaller shares.',
 'Sony Ericsson went up from 6.3% to 7.4% and passed LG, which fell slightly from 6.7% to 6.3%.',
 'Among the named companies, BenQ Mobile fell the most: its share went from 4.9% to 2.4%, less than half.',
 'The “Others” group also lost share, falling from 19.2% to 16.2%.',
];
const vocabulary=[
 v(['compares','shows','比較'],['global market shares','what share of worldwide','全球市場份額'],['mobile phone sales','mobile phone sales','手機銷售'],['held by several manufacturers','each manufacturer had','各製造商所佔']),
 v(['remained the clear market leader','sold the largest share in both years','保持明顯領先'],['slightly strengthened its position','grew a little','略微增強地位'],['most notable gain','gained the most','升幅最大'],['named companies','named companies','列名公司']),
 v(['By contrast','In contrast','相比之下；轉看其他品牌'],['collective “Others” category','“Others” group','其他類別合計'],['lost market share','lost share','失去市場份額'],['only smaller named brand to grow','only smaller named company to gain share','較小列名品牌中唯一增長']),
 v(['accounted for','had','佔有'],['worldwide sales','worldwide sales','全球銷售'],['almost twice','nearly twice','接近兩倍'],['well ahead of','much more than','遠高於']),
 v(['One year later','In 2006','一年後'],['had risen to','rose to','升至'],['maintaining a clear lead','stayed clearly ahead','保持明顯領先'],['despite','even though','儘管']),
 v(['rise, at 3.4 percentage points','gained 3.4 percentage points','增加三點四個百分點'],['largest improvement','biggest gain','最大增幅'],['whereas','but','然而'],['slipped slightly','fell a little','輕微下跌']),
 v(['remaining named manufacturers','other named manufacturers','其餘列名製造商'],['held much smaller shares','had much smaller shares','份額遠較小']),
 v(['rose from','went up from','從某值升至'],['overtaking','passed','超越'],['whose figure declined marginally','which fell slightly','後者輕微下降']),
 v(['steepest fall','fell the most','跌幅最大'],['more than halved','less than half','減少超過一半'],['from 4.9% to 2.4%','from 4.9% to 2.4%','由百分之四點九至二點四']),
 v(['Other manufacturers','“Others” group','其他製造商合計'],['less significant collectively','lost share','合計份額下降'],['dropping from','falling from','由某值下跌']),
];
const structures=[
 f('The table compares the regional market shares of laptop sales held by four brands in 2005 and 2006.','在引言交代產品、份額、對象和兩個年份',[1,4,7],{formula:'The table compares [產品市場份額與製造商] in [首年] and [次年]',meaning:'全球手機銷售份額；2005、2006；不是銷售手機部數。',usage:'market share 是百分比，不能從表格推出實際銷量。',parts:[link('The table compares '),slot('the global market shares of mobile phone sales held by several manufacturers','比較對象'),link(' in '),slot('2005','首年'),link(' and '),slot('2006','次年'),link('.')]}),
 f('Overall, Brand A remained the clear market leader and slightly strengthened its position, while Brand B recorded the most notable gain among the named companies.','概覽分開指出最大品牌和最大增幅',[0,4,7],{formula:'Overall, [領先品牌] remained the clear market leader and slightly strengthened its position, while [另一品牌] recorded the most notable gain among the named companies',meaning:'Nokia 最大並升 2.5 點；Motorola 升 3.4 點，列名品牌中最大。',usage:'最大份額與最大增幅是兩個不同問題。',parts:[link('Overall, '),slot('Nokia','領先品牌'),link(' remained the clear market leader and slightly strengthened its position, while '),slot('Motorola','增幅最大品牌'),link(' recorded the most notable gain among the named companies.')]}),
 f('By contrast, Brand C, Brand D and the collective “Others” category all lost market share; Brand E was the only smaller named brand to grow.','用對比和分號歸納下跌組與例外',[0,4,7],{formula:'By contrast, [下跌品牌及合計類] all lost market share; [例外品牌] was the only smaller named brand to grow',meaning:'Samsung、LG、BenQ、Others 下降；Sony Ericsson 上升。',usage:'Others 是合併類別，不是一間列名公司。',parts:[link('By contrast, '),slot('Samsung, LG, BenQ Mobile and the collective “Others” category','下跌組'),link(' all lost market share; '),slot('Sony Ericsson','上升例外'),link(' was the only smaller named brand to grow.')]}),
 f('In 2005, Brand A accounted for 40% of worldwide sales, almost twice Brand B’s share of 21% and well ahead of Brand C, at 12%.','用起年三個值顯示領先幅度',[0,4,7],{formula:'In [年份], [最大品牌] accounted for [其份額] of worldwide sales, almost twice [第二名]’s share of [第二名份額] and well ahead of [第三名], at [第三名份額].',meaning:'2005 Nokia 32.5%、Motorola 17.7%、Samsung 12.7%。',usage:'要呈現某年首三名份額，並以近似倍數比較首兩名時。',parts:[link('In '),slot('2005','年份'),link(', '),slot('Nokia','最大品牌'),link(' accounted for '),slot('32.5%','其份額'),link(' of worldwide sales, almost twice '),slot('Motorola','第二名'),link('’s share of '),slot('17.7%','第二名份額'),link(' and well ahead of '),slot('Samsung','第三名'),link(', at '),slot('12.7%','第三名份額'),link('.')]}),
 f('One year later, Brand A had risen to 36%, maintaining a clear lead despite Brand B’s increase to 22%.','指出次年仍保持領先，即使第二名也增長',[0,3,7],{formula:'One year later, [領先品牌] had risen to [新份額], maintaining a clear lead despite [第二名]’s increase to [第二名新份額].',meaning:'Nokia 32.5→35；Motorola 17.7→21.1；Nokia 仍領先，但兩者差距 14.8→13.9 點。',usage:'次年領先者增加，但第二名亦增長，需保留領先與差距變化時。',parts:[link('One year later, '),slot('Nokia','領先品牌'),link(' had risen to '),slot('35%','新份額'),link(', maintaining a clear lead despite '),slot('Motorola','第二名'),link('’s increase to '),slot('21.1%','第二名新份額'),link('.')]}),
 f('Brand B’s rise, at 4.2 percentage points, was the largest improvement in the table, whereas Brand C slipped slightly to 10%.','正確區分百分點增幅與另一品牌的小幅下跌',[0,3,7],{formula:'[品牌]’s rise, at [增幅百分點], was the largest improvement in the table, whereas [對比品牌] slipped slightly to [終值].',meaning:'Motorola 17.7→21.1 = +3.4 百分點；Samsung 12.7→11.8 = −0.9 點。',usage:'一個品牌增幅最大、另一品牌微跌時，需對照百分點變化與期末份額。',parts:[slot('Motorola','品牌'),link('’s rise, at '),slot('3.4 percentage points','增幅百分點'),link(', was the largest improvement in the table, whereas '),slot('Samsung','對比品牌'),link(' slipped slightly to '),slot('11.8%','終值'),link('.')]}),
 f('The remaining named manufacturers held shares below ten percent.','以短句轉入較小品牌細節',[0,3,7],{formula:'The remaining named manufacturers held [較小份額概述]',meaning:'Sony Ericsson、LG、BenQ 各自都遠低於 Nokia、Motorola。',usage:'remaining named manufacturers 不包括合計的 Others。',parts:[link('The remaining named manufacturers '),slot('held much smaller shares','份額概述'),link('.')]}),
 f('Sony Ericsson rose from 5% to 8%, overtaking LG, whose figure declined marginally from 7% to 6%.','用 whose 跨兩個品牌連寫超越與反向變化',[0,3,6],{formula:'[品牌甲] rose from [起值] to [終值], overtaking [品牌乙], whose figure declined marginally from [起值] to [終值]',meaning:'Sony Ericsson 6.3→7.4；LG 6.7→6.3，排名交叉。',usage:'2005 Sony Ericsson 落後 LG，2006 超過；不能只看單一年份。',parts:[slot('Sony Ericsson','上升品牌'),link(' rose from '),slot('6.3%','起值'),link(' to '),slot('7.4%','終值'),link(', overtaking '),slot('LG','被超越品牌'),link(', whose figure declined marginally from '),slot('6.7%','起值'),link(' to '),slot('6.3%','終值'),link('.')]}),
 f('Among named manufacturers, the steepest fall was seen in Brand Q, which more than halved from 5.0% to 2.0%.','限定列名製造商後，指出一個品牌份額縮減過半',[0,3,7],{formula:'Among named manufacturers, the steepest fall was seen in [品牌], which more than halved from [起值] to [終值]',meaning:'BenQ 4.9→2.4 = −2.5 點，列名公司中降幅最大；Others −3.0 點。',usage:'限定單獨列名的公司，BenQ −2.5 點最大；若包括合計 Others，則 Others −3.0 點更大。',parts:[link('Among named manufacturers, the steepest fall was seen in '),slot('BenQ Mobile','品牌'),link(', which more than halved from '),slot('4.9%','起值'),link(' to '),slot('2.4%','終值'),link('.')]}),
 f('Other manufacturers also became less significant collectively, dropping from 20% to 17%.','最後單獨報合計類別的變化',[0,3,7],{formula:'Other manufacturers also became less significant collectively, dropping from [起值] to [終值]',meaning:'Others 19.2→16.2 = −3.0 百分點，為合計類別。',usage:'collectively 說明這是其他品牌的合計份額，不是一間公司。',parts:[link('Other manufacturers also became less significant collectively, dropping from '),slot('19.2%','起值'),link(' to '),slot('16.2%','終值'),link('.')]}),
];
const intro=[quiz('表格的百分比代表甚麼？',['各品牌佔全球手機銷售市場的份額','全球售出的手機總部數','各品牌的利潤率','手機使用者平均年齡'],'標題明示 % share of market。'),{type:'multi',prompt:'哪兩項適合做概覽？',detail:'選兩項，再按「確認」。',options:['Nokia 兩年都保持最大份額','Motorola 在列名公司中增加最多','每間公司在 2006 年都上升','Others 是一間列名製造商'],correct:[0,1],why:'最大類別和最顯著增幅是跨表主特徵。'}];
const route=[sequence('依範文重排市場份額報告',[
 ['引言','比較 2005、2006 全球手機銷售份額。'],['概覽','Nokia 仍最大；Motorola 增幅最大；數個品牌下降。'],['大品牌','Nokia 32.5→35、Motorola 17.7→21.1、Samsung 12.7→11.8。'],['較小品牌','Sony Ericsson 超越 LG；BenQ 下跌；Others 合計 19.2→16.2。'],
 ],'先呈現規模和方向，再報代表數值。')];
const evidence=[
 quiz('2006 哪一個品牌份額最大？',['Nokia 35%','Motorola 21.1%','Samsung 11.8%','Sony Ericsson 7.4%'],'Nokia 兩年都排首位。'),
 quiz('Motorola 增加多少百分點？',['3.4 點','3.4% 的相對增長','21.1 點','17.7 點'],'21.1−17.7=3.4 百分點。'),
 quiz('Nokia 與 Motorola 的領先差距如何變化？',['14.8 點縮至 13.9 點','14.8 點擴至 17 點','兩年都 21.1 點','從未領先'],'2005 32.5−17.7=14.8；2006 35−21.1=13.9。'),
 quiz('哪一個較小列名品牌逆勢上升？',['Sony Ericsson 6.3→7.4%','LG 6.7→6.3%','BenQ 4.9→2.4%','Samsung 12.7→11.8%'],'Sony Ericsson 份額增加並超越 LG。'),
 quiz('表中所有類別哪個絕對下降最多？',['Others −3.0 百分點','BenQ Mobile −2.5 百分點','Samsung −0.9 百分點','LG −0.4 百分點'],'Others 19.2−16.2=3.0；列名公司中 BenQ 最多。'),
];
const logic=[sequence('分開看份額、變化與排名',[
 ['份額最大','Nokia 2005 32.5%、2006 35%。'],['增長最大','Motorola +3.4 百分點；Nokia +2.5。'],['交叉排名','Sony Ericsson 6.3→7.4；LG 6.7→6.3。'],['最大下降','Others −3.0 點；若只算列名公司，BenQ −2.5 點。'],
 ],'切換「所有列別」與「列名公司」時，結論會不同。'),sequence('核對 Nokia 的領先差距',[
 ['2005','Nokia 32.5−Motorola 17.7=14.8 百分點。'],['2006','Nokia 35−Motorola 21.1=13.9 百分點。'],['變化','領先差距縮小 0.9 百分點。'],['寫法','可說 Nokia 仍居首且自身份額上升；不可說相對 Motorola 的差距擴大。'],
 ],'兩品牌同時上升時，要計算差距，不能憑領先者自身上升推斷差距。')];
const transfers=[
 transfer('另一表列出兩年各品牌銷售市場份額。','哪句引言把份額和銷量分開？',['表格比較各品牌在兩年全球銷售中所佔的百分比。','表格直接給出每個品牌售出多少部。','百分比代表手機利潤金額。','每一列都是用戶的平均年齡。'],['份額用百分比。','沒有實際部數。','非利潤。','非年齡。'],[0],'原文 global market shares of mobile phone sales。'),
 transfer('2006 Nokia 35%，Motorola 21.1%，但 Motorola 升得較多。','哪句概覽分清份額與增幅？',['Nokia 保持最大份額；Motorola 在列名品牌中增幅最大。','Motorola 份額最大，Nokia 增幅最大。','兩間公司份額完全相等。','兩間公司都下跌。'],['最大份額和最大變化分開寫。','主次顛倒。','數值不等。','兩者皆升。'],[1],'原文 market leader 與 most notable gain。'),
 transfer('Samsung、LG、BenQ、Others 下降；Sony Ericsson 升。','哪句完整歸類？',['多個品牌及 Others 類別份額下跌；Sony Ericsson 是較小列名品牌中的上升例外。','所有品牌的份額都上升。','Others 是 Sony Ericsson 的另一名稱。','Samsung 在 2006 年超過 Nokia。'],['分組及例外正確。','四類下跌。','Others 是合計。','Nokia 最大。'],[2],'原文 By contrast 與 only smaller named brand。'),
 transfer('2005 Nokia 32.5%、Motorola 17.7%、Samsung 12.7%。','哪句比較三者恰當？',['Nokia 約佔三分之一，接近 Motorola 的兩倍，亦高於 Samsung。','Nokia 正好是 Motorola 的兩倍。','Samsung 以 32.5% 居首。','Motorola 比 Nokia 高 17.7 點。'],['32.5÷17.7≈1.84，接近兩倍。','不是剛好兩倍。','Samsung 12.7%。','Motorola 較低。'],[3],'原文 almost twice Motorola，well ahead Samsung。'),
 transfer('Nokia 32.5→35%，Motorola 17.7→21.1%。','哪句避免把自身升幅誤作差距擴大？',['Nokia 仍領先且份額上升，但與 Motorola 的差距由 14.8 點縮至 13.9 點。','Nokia 與 Motorola 的差距由 14.8 點擴至 17 點。','Motorola 已經超越 Nokia。','Nokia 的份額由 35% 降至 32.5%。'],['份額升與領先差距縮可同時成立。','兩年差值算錯。','Motorola 仍較低。','方向相反。'],[4],'原文 Nokia rose to 35 並維持明顯領先；實際差距縮窄。'),
 transfer('Motorola 17.7→21.1%；Samsung 12.7→11.8%。','哪句計算與轉折都對？',['Motorola 上升 3.4 個百分點，而 Samsung 下降 0.9 點。','Motorola 上升 3.4%，而非百分點。','Samsung 上升 0.9 個百分點。','Motorola 與 Samsung 都沒有改變。'],['兩個百分比相減得百分點。','3.4 是百分點差。','Samsung 下跌。','均有變動。'],[5],'原文 3.4 percentage points，whereas Samsung slipped。'),
 transfer('Sony Ericsson、LG、BenQ 是列名品牌，份額均低於 8%。','哪句承接大品牌後轉入小品牌？',['其餘列名製造商的市場份額較小。','其餘列名製造商都比 Nokia 大。','Others 是單一列名品牌。','小品牌沒有任何份額。'],['適合作細節段過渡。','Nokia 最高。','Others 為合計。','皆有份額。'],[6],'原文 remaining named manufacturers。'),
 transfer('Sony Ericsson 6.3→7.4%；LG 6.7→6.3%。','哪句把兩年排名交叉說清？',['Sony Ericsson 份額上升並超越 LG；LG 的份額略跌。','LG 上升並超越 Sony Ericsson。','兩者兩年都完全相等。','Sony Ericsson 由 7.4% 跌到 6.3%。'],['先落後再領先，方向正確。','LG 下降。','不相等。','方向反。'],[7],'原文 overtaking LG，whose figure declined。'),
 transfer('BenQ 4.9→2.4%；Others 19.2→16.2%。','若比較所有表列類別，哪個跌得最多？',['Others 跌 3.0 百分點；BenQ 在單獨列名公司中跌最多，為 2.5 點。','BenQ 在所有類別中跌 3.0 點。','Others 份額增長 3.0 點。','兩類份額都沒有變化。'],['比較範圍限定後，兩個結論都準確。','BenQ 跌 2.5。','Others 下降。','皆下降。'],[8,9],'原文限定 named manufacturers；Others 合計類跌 3.0 點。'),
 transfer('Others 是多個其他製造商的合計類別，19.2→16.2%。','哪句保留 collectively 的意思？',['其他製造商合計份額由 19.2% 降至 16.2%。','某一間名為 Others 的公司份額上升。','其餘品牌逐一都必定跌 3 點。','表格沒有提供其他品牌合計值。'],['合計類下降 3 點。','不是公司且下降。','無法推到每間公司。','有 Others 一列。'],[9],'原文 Other manufacturers collectively。'),
];
const balancedTransferOptions=[
  ['表格比較各品牌兩年全球銷售所佔份額。','表格比較各品牌兩年全球銷售的手機部數。','表格比較各品牌兩年全球銷售所得利潤。','表格比較各品牌兩年全球用戶平均年齡。'],
  ['Nokia 份額仍最大，Motorola 在列名品牌中增幅最大。','Motorola 份額仍最大，Nokia 在列名品牌中增幅最大。','Nokia 份額仍最大，Samsung 在列名品牌中增幅最大。','Nokia 份額仍最大，Motorola 在列名品牌中跌幅最大。'],
  ['Samsung、LG、BenQ 與 Others 下跌，Sony Ericsson 上升。','Samsung、LG、BenQ 與 Others 上升，Sony Ericsson 下跌。','Samsung、LG、BenQ 與 Sony Ericsson 下跌，Others 上升。','Samsung、LG、BenQ 與 Others 下跌，Nokia 也下降。'],
  ['Nokia 約佔三分之一，接近 Motorola 兩倍。','Nokia 約佔三分之一，正好是 Motorola 兩倍。','Samsung 約佔三分之一，接近 Motorola 兩倍。','Motorola 約佔三分之一，接近 Nokia 兩倍。'],
  ['Nokia 仍領先，但對 Motorola 的差距縮小。','Nokia 仍領先，但對 Motorola 的差距擴大。','Motorola 已領先，對 Nokia 的差距縮小。','Nokia 仍領先，但份額比前一年低。'],
  ['Motorola 升 3.4 個百分點，Samsung 跌 0.9 點。','Motorola 相對升 3.4%，Samsung 相對跌 0.9%。','Motorola 跌 3.4 個百分點，Samsung 升 0.9 點。','Motorola 升 0.9 個百分點，Samsung 跌 3.4 點。'],
  ['其餘列名製造商的份額，均低於大品牌。','其餘列名製造商的份額，均高於 Nokia。','其餘列名製造商包括 Others 合計類別。','其餘列名製造商的份額，全都保持不變。'],
  ['Sony Ericsson 上升並超越 LG，後者略跌。','LG 上升並超越 Sony Ericsson，後者略跌。','Sony Ericsson 下降但仍超越 LG，後者略升。','LG 與 Sony Ericsson 兩年都維持相同份額。'],
  ['Others 跌 3.0 點最多；列名公司中 BenQ 跌 2.5 點最多。','BenQ 跌 3.0 點最多；列名公司中 Others 跌 2.5 點最多。','Others 升 3.0 點最多；列名公司中 BenQ 跌 2.5 點最多。','Others 跌 2.5 點最多；列名公司中 BenQ 跌 3.0 點最多。'],
  ['其他製造商合計份額由 19.2% 降至 16.2%。','名為 Others 的公司份額由 19.2% 降至 16.2%。','其他製造商各自份額都由 19.2% 降至 16.2%。','其他製造商合計份額由 16.2% 降至 19.2%。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:5',meta:{topic:'2005–06 全球手機銷售市場份額',summary:'Nokia 兩年最大；Motorola +3.4 百分點為列名公司最大升幅。Nokia 對 Motorola 的領先差距實際縮窄；Others −3.0 點為所有表列類別中最大跌幅，BenQ −2.5 點為列名公司中最大。比較範圍清楚限定。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
