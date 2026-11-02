// Task 1 Tables 11: minimum daily water cost in US cents and share of average daily wage.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'現金成本用美分；負擔比例是成本佔各國平均日薪的百分比。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先現金成本，再日薪負擔；兩欄單位不能相加。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows the cost of enough water for one person each day in five countries. It gives the cost in US cents and as a percentage of the average daily wage.',
 'Overall, Tanzania has the highest cost in cents and the largest share of a daily wage, while the US has the lowest on both measures.',
 'Tanzania, Uganda and Pakistan use much more of an average daily wage for this water than the UK and US, although the prices differ by only a few cents.',
 'In cents, Tanzania is highest at 6.4 per person each day.',
 'Uganda is second at 4.1 cents, while Pakistan is much lower at 1.76 cents.',
 'The UK costs only 1.3 cents, and the US is lowest at 0.85 cents each day.',
 'The wage-share percentages show a much bigger gap.',
 'Water costs 5.7% of an average day’s wage in Tanzania, 3.2% in Uganda and 1.1% in Pakistan.',
 'In contrast, the UK and US shares are very small: 0.013% and 0.006% in that order. Tanzania’s percentage is about 950 times the US figure, almost 1,000 times.',
];
const vocabulary=[
 v(['compares','shows','比較'],['minimum daily water requirement','enough water for one person each day','最低每日用水需要'],['expressed both in US cents','cost in US cents','以美分表示'],['share of the average daily wage','percentage of the average daily wage','佔平均日薪比例']),
 v(['records the highest cost','has the highest cost in cents','現金成本最高'],['greatest wage burden','largest share of a daily wage','日薪負擔最大'],['lowest figures on both measures','lowest on both measures','兩項均最低']),
 v(['far larger proportions of daily earnings','much more of an average daily wage','日收入佔比遠大'],['basic requirement','this water','基本用水'],['cash differences','prices differ','現金價格差'],['only a few cents','only a few cents','僅數美分']),
 v(['In monetary terms','In cents','以貨幣計'],['leads the table','is highest','在表中最高'],['per person per day','per person each day','每人每日']),
 v(['is next','is second','其次'],['considerably lower','much lower','低得多'],['at 1.76 cents','at 1.76 cents','一點七六美分']),
 v(['cheaper still','costs only','更便宜'],['stands at','costs','為某值'],['records the lowest daily cost','is lowest','每日成本最低']),
 v(['percentage figures','wage-share percentages','百分比數值'],['much sharper contrast','much bigger gap','差距更鮮明']),
 v(['takes up 5.7%','costs 5.7%','佔百分之五點七'],['average daily wage','average day’s wage','平均日薪'],['compared with','3.2% in Uganda and 1.1% in Pakistan','與其他兩國比較']),
 v(['By contrast','In contrast','相反'],['equivalent shares','shares','相應日薪份額'],['tiny','very small','極小'],['respectively','in that order','分別'],['almost 1,000 times','almost 1,000 times','接近一千倍']),
];
const structures=[
 f('The table compares the cost of meeting the minimum daily food requirement per person in five countries, expressed both in US cents and as a share of the average daily wage.','引言交代同一需要的現金成本與工資比例兩種量度',[1,3,6],{formula:'The table compares the cost of meeting the minimum daily [需要] per person in [國數], expressed both in US cents and as a share of the average daily wage',meaning:'五國每人每日最低用水需要的成本：美分和平均日薪百分比。',usage:'第二欄不是另一種水量，而是同一現金成本相對日薪的負擔。',parts:[link('The table compares the cost of meeting the minimum daily '),slot('water requirement','基本需要'),link(' per person in '),slot('five countries','國數'),link(', expressed both in US cents and as a share of the average daily wage.')]}),
 f('Overall, Country A records the highest cost and the greatest wage burden, while Country B has the lowest figures on both measures.','概覽同時定位兩項量度的最高和最低',[0,3,6],{formula:'Overall, [國甲] records the highest cost and the greatest wage burden, while [國乙] has the lowest figures on both measures',meaning:'Tanzania 6.4 cents/5.7% 最高；US 0.85 cents/0.006% 最低。',usage:'兩項排名相同，但現金差與日薪佔比差不可混成同一單位。',parts:[link('Overall, '),slot('Tanzania','最高國'),link(' records the highest cost and the greatest wage burden, while '),slot('the US','最低國'),link(' has the lowest figures on both measures.')]}),
 f('More broadly, Countries A, B and C spend far larger proportions of daily earnings on this basic requirement than Countries D and E, even though the cash differences are only a few cents.','用 even though 對比小額現金差與大幅相對負擔差',[0,3,6],{formula:'More broadly, [前三國] spend far larger proportions of daily earnings on this basic requirement than [後兩國], even though the cash differences are only a few cents',meaning:'Tanzania/Uganda/Pakistan 5.7/3.2/1.1%，遠高於 UK/US 0.013/0.006%，現金差數美分。',usage:'平均日薪各國不同，故相差數美分仍可代表負擔巨大差別；表沒有提供個人收入分布。',parts:[link('More broadly, '),slot('Tanzania, Uganda and Pakistan','較高負擔組'),link(' spend far larger proportions of daily earnings on this basic requirement than '),slot('the UK and the US','較低負擔組'),link(', even though the cash differences are only a few cents.')]}),
 f('In monetary terms, Country A leads the table, at 7.0 cents per person per day.','先報現金成本最高國與每日每人單位',[0,2,6],{formula:'In monetary terms, [最高國] leads the table, at [值] cents per person per day',meaning:'Tanzania 6.4 美分每人每日。',usage:'In monetary terms 限定現金欄，不是日薪百分比欄。',parts:[link('In monetary terms, '),slot('Tanzania','最高國'),link(' leads the table, at '),slot('6.4','美分值'),link(' cents per person per day.')]}),
 f('Country B is next, at 4.5 cents, while Country C’s figure is considerably lower, at 2 cents.','按現金成本排序第二、第三國',[0,2,6],{formula:'[第二國] is next, at [值] cents, while [第三國]’s figure is considerably lower, at [值] cents',meaning:'Uganda 4.1 cents；Pakistan 1.76 cents。',usage:'4.1−1.76=2.34 美分；不可在這句混用 3.2% 或 1.1%。',parts:[slot('Uganda','第二國'),link(' is next, at '),slot('4.1','第二值'),link(' cents, while '),slot('Pakistan’s figure','第三國'),link(' is considerably lower, at '),slot('1.76','第三值'),link(' cents.')]}),
 f('The two remaining countries are cheaper still: Country D stands at 1.2 cents, and Country E records the lowest daily cost, at 0.7 cents.','以冒號補報現金成本最低兩國',[0,2,4],{formula:'The two remaining countries are cheaper still: [國甲] stands at [值] cents, and [國乙] records the lowest daily cost, at [值] cents',meaning:'UK 1.3 cents；US 0.85 cents，最低。',usage:'1.3/0.85 是現金價格，非 1.3%/0.85%。',parts:[link('The two remaining countries are cheaper still: '),slot('the UK','倒數第二'),link(' stands at '),slot('1.3','值'),link(' cents, and '),slot('the US','最低國'),link(' records the lowest daily cost, at '),slot('0.85','值'),link(' cents.')]}),
 f('The percentage figures show a much sharper contrast in the second table.','短句切換現金欄到日薪比例欄',[0,2,4],{formula:'The percentage figures [比例比較].',meaning:'日薪佔比從 Tanzania 5.7% 至 US 0.006%，相對差距極大。',usage:'由絕對價格切換到佔收入比例，準備指出相對負擔的差異時。',parts:[link('The percentage figures '),slot('show a much sharper contrast','比例比較'),link('.')]}),
 f('In Country A, the minimum requirement takes up 6% of the average daily wage, compared with 3% in Country B and 1% in Country C.','由最高往下列三國日薪負擔',[0,2,4],{formula:'In [國甲], the minimum requirement takes up [值] of the average daily wage, compared with [值] in [國乙] and [值] in [國丙]',meaning:'Tanzania 5.7%、Uganda 3.2%、Pakistan 1.1%。',usage:'5.7% 是平均日薪份額，不等於 5.7 美分。',parts:[link('In '),slot('Tanzania','最高國'),link(', the minimum requirement takes up '),slot('5.7%','比例'),link(' of the average daily wage, compared with '),slot('3.2%','第二比例'),link(' in '),slot('Uganda','第二國'),link(' and '),slot('1.1%','第三比例'),link(' in '),slot('Pakistan','第三國'),link('.')]}),
 f('By contrast, the equivalent shares in Countries D and E are tiny, at only 0.010% and 0.005% respectively; indeed, Country A’s percentage is almost 1,000 times Country E’s figure.','用 respectively 配對兩低值，分號後計算跨國倍數',[0,2,4],{formula:'By contrast, the equivalent shares in [兩國] are tiny, at only [英國值] and [美國值] respectively; indeed, [最高國的比例] is almost 1,000 times [最低國的比例].',meaning:'UK 0.013%、US 0.006%；Tanzania 5.7÷0.006=950 倍，近 1000 倍。',usage:'要對照幾個極低與極高的比例，並補充跨組倍數時。',parts:[link('By contrast, the equivalent shares in '),slot('the UK and the US','兩國'),link(' are tiny, at only '),slot('0.013%','英國值'),link(' and '),slot('0.006%','美國值'),link(' respectively; indeed, '),slot('Tanzania’s percentage','最高國的比例'),link(' is almost 1,000 times '),slot('the US figure','最低國的比例'),link('.')]}),
];
structures[6].example='The percentage figures show a much wider gap.';
const intro=[quiz('兩個數字欄分別是甚麼？',['每日現金成本（美分）與佔平均日薪比例','每日用水量（公升）與水質分數','兩種不同水源的體積','每國人口與平均壽命'],'題目和欄名給成本及其日薪百分比。'),{type:'multi',prompt:'哪兩項概覽同時準確？',detail:'選兩項，再按「確認」。',options:['Tanzania 兩欄最高、US 兩欄最低','數美分的現金差可對應極大的工資負擔比例差','UK 的工資負擔百分比最高','US 的現金成本最高'],correct:[0,1],why:'最高最低與兩欄尺度差異是主特徵。'}];
const route=[sequence('依範文重排最低日用水成本報告',[
 ['引言','五國最低每日用水成本；美分及平均日薪百分比。'],['概覽','Tanzania 兩欄最高，US 兩欄最低；工資負擔差遠大於數美分差。'],['現金欄','6.4、4.1、1.76、1.3、0.85 美分。'],['日薪比例欄','5.7%、3.2%、1.1%、0.013%、0.006%；最高約為最低 950 倍。'],
 ],'每一步都標明單位，避免把美分與百分比相加。')];
const evidence=[
 quiz('哪國在兩種成本量度都最高？',['Tanzania：6.4 美分、5.7%','Uganda：4.1 美分、3.2%','UK：1.3 美分、0.013%','US：0.85 美分、0.006%'],'Tanzania 兩欄皆最高。'),
 quiz('哪國在兩欄都最低？',['US：0.85 美分、0.006%','UK：1.3 美分、0.013%','Pakistan：1.76 美分、1.1%','Uganda：4.1 美分、3.2%'],'US 兩欄均最低。'),
 quiz('Uganda 與 Pakistan 現金成本？',['4.1 美分與 1.76 美分','3.2 美分與 1.1 美分','4.1% 與 1.76%','0.013 美分與 0.006 美分'],'不要把同兩國日薪比例當美分。'),
 quiz('UK 與 US 的日薪佔比？',['0.013% 與 0.006%','1.3% 與 0.85%','1.3 美分與 0.85 美分','5.7% 與 3.2%'],'兩者比例都很小，但仍不相同。'),
 quiz('Tanzania 的日薪佔比約為 US 多少倍？',['5.7÷0.006=950 倍，近 1,000 倍','6.4÷0.85≈950 倍','剛好 100 倍','兩國完全相同'],'所比較的是百分比欄，不是美分欄。'),
];
const logic=[sequence('同一需求的兩個尺度',[
 ['Tanzania','6.4 美分，占平均日薪 5.7%。'],['US','0.85 美分，占平均日薪 0.006%。'],['現金比','6.4÷0.85≈7.5 倍。'],['負擔比','5.7÷0.006=950 倍。'],
 ],'兩種倍數差很大；只用現金數值不足以描述工資負擔。'),sequence('降序讀兩欄',[
 ['現金','Tanzania 6.4 > Uganda 4.1 > Pakistan 1.76 > UK 1.3 > US 0.85，美分。'],['比例','Tanzania 5.7 > Uganda 3.2 > Pakistan 1.1 > UK 0.013 > US 0.006，%。'],['說法','日薪比例差距比現金數美分差更鮮明。'],['限制','表僅給平均日薪，不能推定每位家庭或個人的負擔。'],
 ],'排序相同不代表各欄差距的量級相同。')];
const transfers=[
 transfer('另一表用現金成本及平均日薪佔比報同一基本需要。','哪句引言包含兩種量度？',['表格同時比較每日成本的美分數和佔平均日薪的百分比。','表格只比較每日用水公升數。','美分與百分比是兩種不同水量。','各數值都是居民的年薪。'],['同一成本兩種尺度。','無水量。','非水量。','平均日薪只作分母。'],[0],'原文 expressed both in US cents and wage share。'),
 transfer('Tanzania 6.4 美分/5.7%；US 0.85 美分/0.006%。','哪句兩欄最高最低均正確？',['Tanzania 現金成本和工資負擔均最高；US 均最低。','US 兩欄最高。','Tanzania 美分高但日薪佔比最低。','兩國兩欄完全相同。'],['最高最低同步。','US 最低。','Tanzania 5.7 最高。','數字不同。'],[1],'原文 Tanzania highest，US lowest on both。'),
 transfer('Tanzania/Uganda/Pakistan 日薪佔比為 5.7/3.2/1.1%；UK/US 為 0.013/0.006%。','哪句說明現金差小但負擔差大？',['前三國的平均日薪負擔比例遠高於後兩國，即使現金差僅數美分。','現金差僅數美分，所以各國工資負擔必定相同。','前後五國日薪佔比都是 5.7%。','表沒有平均日薪佔比。'],['兩欄尺度分清。','各國日薪基數不同。','數值不同。','有比例欄。'],[2],'原文 far larger proportions despite cash differences only a few cents。'),
 transfer('Tanzania 每人每日最低用水現金成本 6.4 美分。','哪句明確限定現金欄？',['以現金計，Tanzania 以每日每人 6.4 美分最高。','Tanzania 日薪佔比為 6.4%。','Tanzania 每人每日需用水 6.4 公升。','Tanzania 現金成本最低。'],['美分及每日每人正確。','比例是 5.7%。','表不提供公升。','最高。'],[3],'原文 In monetary terms Tanzania 6.4 cents。'),
 transfer('Uganda 4.1 美分、Pakistan 1.76 美分。','哪句現金第二、第三名恰當？',['Uganda 次高 4.1 美分；Pakistan 為 1.76 美分，低得多。','Pakistan 以 4.1 美分第二。','Uganda 的現金成本只有 1.76 美分。','兩國日薪佔比恰好相等。'],['同欄排序正確。','顛倒。','顛倒。','比例 3.2/1.1。'],[4],'原文 Uganda next，Pakistan considerably lower。'),
 transfer('UK 1.3 美分；US 0.85 美分。','哪句最低兩國配對正確？',['UK 為 1.3 美分；US 更低，為 0.85 美分。','UK 比 US 便宜。','US 是 1.3%，UK 是 0.85%。','兩國均為 6.4 美分。'],['美分值及大小正確。','US 更低。','單位錯。','Tanzania 6.4。'],[5],'原文 UK 1.3，US lowest 0.85 cents。'),
 transfer('美分欄最高 6.4、最低 0.85；日薪佔比最高 5.7%、最低 0.006%。','哪句適合作兩欄轉折？',['改看日薪百分比時，國家間差距更鮮明。','兩欄差距完全相同。','百分比欄沒有任何數字。','現金欄的單位是百分點。'],['兩欄尺度不同。','比率差異很大。','有數字。','單位美分。'],[6],'原文 percentage figures show a sharper contrast。'),
 transfer('Tanzania 5.7%、Uganda 3.2%、Pakistan 1.1%，均為日薪佔比。','哪句三國比例順序正確？',['最低用水成本依次佔平均日薪 5.7%、3.2% 和 1.1%。','三國依次佔 1.1%、3.2% 和 5.7%。','這三個數字全是美分。','三國現金成本分別為 5.7、3.2、1.1 美分。'],['分母與順序正確。','首尾顛倒。','是百分比。','美分值不同。'],[7],'原文 Tanzania 5.7，Uganda 3.2，Pakistan 1.1 wage share。'),
 transfer('UK 0.013%、US 0.006%；Tanzania 5.7%。','哪句倍數比較用對欄？',['Tanzania 的日薪佔比約為 US 的 950 倍，接近一千倍。','Tanzania 的現金美分成本是 US 的 950 倍。','UK 的比例比 Tanzania 高。','US 與 UK 的比例完全相同。'],['5.7÷0.006=950。','現金只約 7.5 倍。','UK 較低。','0.013 與 0.006 不同。'],[8],'原文 UK/US tiny wage shares；Tanzania almost 1000× US。'),
 transfer('UK 的現金成本 1.3 美分，日薪佔比 0.013%。','哪句避免混淆兩欄？',['1.3 是美分數；0.013% 才是平均日薪佔比。','1.3% 是日薪佔比，0.013 美分是現金。','兩值都以公升計。','兩值均表示所有居民的平均水量。'],['兩數單位清楚。','顛倒單位。','無公升。','無水量。'],[5,8],'原文 UK 1.3 cents，0.013% wage share。'),
];
const balancedTransferOptions=[
  ['表格列每日用水美分成本，及佔平均日薪的比例。','表格列每日用水公升數量，及佔平均日薪的比例。','表格列每日用水美分成本，及佔全年收入的比例。','表格列每日用水美分成本，及每人用水公升。'],
  ['坦桑尼亞兩欄均最高，美國兩欄均最低。','美國兩欄均最高，坦桑尼亞兩欄均最低。','坦桑尼亞現金最高，但日薪佔比最低。','坦桑尼亞與美國的兩欄數值均相同。'],
  ['前三國日薪負擔比例較高，即使現金只差數美分。','前三國日薪負擔比例相近，因現金只差數美分。','前三國現金成本都較低，但日薪負擔較高。','五國日薪負擔比例一致，只是美分數有差別。'],
  ['坦桑尼亞每人每日現金成本最高，為 6.4 美分。','坦桑尼亞每人每日工資佔比最高，為 6.4%。','坦桑尼亞每人每日用水量最高，為 6.4 公升。','坦桑尼亞每人每日現金成本最低，為 6.4 美分。'],
  ['烏干達 4.1 美分次高，巴基斯坦為 1.76 美分。','巴基斯坦 4.1 美分次高，烏干達為 1.76 美分。','烏干達 4.1 美分次高，巴基斯坦為 3.2 美分。','烏干達 4.1% 次高，巴基斯坦則為 1.76%。'],
  ['英國成本 1.3 美分，美國 0.85 美分更低。','美國成本 1.3 美分，英國 0.85 美分更低。','英國每日成本 1.3%，美國 0.85% 更低。','英國成本 1.3 美分，美國 6.4 美分更高。'],
  ['改看平均日薪比例時，國家間差距更加顯著。','改看平均日薪比例時，國家間差距完全一樣。','改看每日用水公升數時，國家間差距更顯著。','改看現金美分成本時，該欄單位是百分點。'],
  ['坦桑尼亞、烏干達、巴基斯坦依次佔日薪 5.7%、3.2%、1.1%。','坦桑尼亞、烏干達、巴基斯坦依次佔日薪 1.1%、3.2%、5.7%。','坦桑尼亞、烏干達、巴基斯坦依次付 5.7、3.2、1.1 美分。','巴基斯坦、烏干達、坦桑尼亞依次佔日薪 5.7%、3.2%、1.1%。'],
  ['坦桑尼亞日薪佔比約為美國 950 倍，接近千倍。','坦桑尼亞現金成本約為美國 950 倍，接近千倍。','英國日薪佔比約為坦桑尼亞的 950 倍。','美國與英國日薪佔比均相同，接近千倍。'],
  ['英國的 1.3 是美分，0.013% 是日薪佔比。','英國的 1.3% 是日薪佔比，0.013 是美分。','英國的 1.3 和 0.013 都是每日用水公升。','英國的 1.3 和 0.013 都是年薪數字。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:11',meta:{topic:'五國每人每日最低用水成本與日薪負擔',summary:'Tanzania 6.4 美分／平均日薪 5.7% 兩欄最高，US 0.85 美分／0.006% 兩欄最低。現金成本最高最低約 7.5 倍，但工資負擔約 950 倍。兩個量度須分開表述，不能把美分和百分比混用。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
