// Task 1 Mixed Charts 3: police budget funding (£m) and spending shares (%), 2017–18.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按收入總額與來源、支出比例兩條線整理，保留年份與單位。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows where a British area’s police budget came from in 2017 and 2018. The pie charts show what the money was spent on.',
 'Overall, the budget went up a little between the two years.',
 'Most money still came from the national government, but the largest rise came from local taxes.',
 'Most spending still went on salaries, but their share fell as the technology share grew.',
 'In 2017, the total police budget was £304.7 million.',
 'Of that, the national government gave £175.5 million, much more than £91.2 million from local taxes and £38 million from other sources, such as grants.',
 'By 2018, the total had risen to £318.6 million.',
 'Government money rose only a little to £177.8 million, while money from local taxes rose more to £102.3 million.',
 'Other sources barely changed, reaching £38.5 million.',
 'For spending, salaries were 75% of the budget in 2017, then fell to 69% in 2018.',
 'In comparison, technology’s share rose from 8% to 14%, while buildings and transport stayed at 17%.',
];
const vocabulary=[
 v(['compares','shows','顯示／比較'],['by funding source','where','按資金來源'],['how the money was spent','what the money was spent on','資金如何使用']),
 v(['rose modestly','went up a little','小幅上升'],['over the two years','between the two years','兩年間']),
 v(['remained the main source','still came','仍是主要來源'],['increase came chiefly','largest rise came','增幅主要來自'],['local taxes','local taxes','地方稅']),
 v(['expenditure','spending','支出'],['continued to dominate','still went','仍佔主要部分'],['their share fell','their share fell','其比例下降'],['took a larger proportion','share grew','佔比上升']),
 v(['stood at','was','為'],['total police budget','total police budget','警方預算總額']),
 v(['far more than','much more than','遠多於'],['raised through local taxes','from local taxes','來自地方稅'],['other sources','other sources','其他來源'],['such as grants','such as grants','例如補助金']),
 v(['had climbed','had risen','已上升'],['the total','the total','總額']),
 v(['increased only slightly','rose only a little','僅小幅增加'],['local-tax revenue','money from local taxes','地方稅收入'],['rose more sharply','rose more','升幅更大']),
 v(['changed very little','barely changed','變化甚少'],['reaching','reaching','達到']),
 v(['Regarding spending','For spending','談支出時'],['accounted for three quarters','were 75%','佔四分之三'],['before declining','then fell','其後下降']),
 v(['By contrast','In comparison','相比之下'],['almost doubled its share','share rose','佔比近乎倍增'],['remained unchanged','stayed','維持不變']),
];
const structures=[
 f('The table compares a council budget in one region of Britain in 2017 and 2018 by funding source, while the pie charts show how the money was spent.','用 while 分別交代表格的來源金額及圓圖的支出份額',[1,4,9],{formula:'The table compares [預算] in [地點] in [兩年] by funding source, while the pie charts show how the money was spent',meaning:'表格是各收入來源與總額，單位 £m；兩圓圖是 salaries／technology／buildings and transport 的百分比。',usage:'圖表不同分母及單位：不要把 £175.5m 直接當成 75%。',parts:[link('The table compares'),slot(' the police budget','預算'),link(' in'),slot(' one area of Britain','地點'),link(' in'),slot(' 2017 and 2018','兩年'),link(' by funding source, while the pie charts show how the money was spent.')]}),
 f('Overall, the budget rose modestly over the three years.','概覽總額小幅上升，不誇大增幅',[0,4,6],{formula:'Overall, the budget rose modestly over [期間]',meaning:'預算總額由 £304.7m 至 £318.6m，增加 £13.9m。',usage:'modestly 描述總額增幅；只見 2017、2018，不能暗示有逐年連續資料。',parts:[link('Overall, the budget rose modestly over'),slot(' the two years','期間'),link('.')]}),
 f('The municipal government remained the main source of funding, although the increase came chiefly from parking fees.','同時指出最大資金來源與增額最大來源不同',[0,4,8],{formula:'[最大來源] remained the main source of funding, although the increase came chiefly from [增額最大來源]',meaning:'國家政府兩年均最多；地方稅增加 £11.1m，佔總增額 £13.9m 的主要部分。',usage:'main source 按金額大小；increase came chiefly 按兩年差額，兩個判準不要互換。',parts:[slot('The national government','最大來源'),link(' remained the main source of funding, although the increase came chiefly from'),slot(' local taxes','增額最大來源'),link('.')]}),
 f('In terms of expenditure, staff costs continued to dominate the budget, but their share fell as maintenance took a larger proportion.','概覽支出類別：最大項仍在，但比例轉移',[0,4,9],{formula:'In terms of expenditure, [最大支出項] continued to dominate the budget, but their share fell as [上升支出項] took a larger proportion',meaning:'salaries 仍最大，但 75%→69%；technology 8%→14%。',usage:'share 表示佔預算百分比；不要直接由百分比變化推論未給出的金額變化。',parts:[link('In terms of expenditure,'),slot(' salaries','最大支出項'),link(' continued to dominate the budget, but their share fell as'),slot(' technology','上升支出項'),link(' took a larger proportion.')]}),
 f('In 2017, the total education budget stood at £304.7 million.','先報起年預算總額，再展開來源',[0,6,9],{formula:'In [起年], the total [預算類別] budget stood at [金額] million',meaning:'警方預算 2017 年總額 £304.7m，作後續三項來源的共同基準。',usage:'£m 是百萬英鎊；£304.7m 不是 £304.7 或 304.7%。',parts:[link('In 2017, the total'),slot(' police','預算類別'),link(' budget stood at'),slot(' £304.7','金額'),link(' million.')]}),
 f('Of this, £180 million came from the national government, far more than the £100 million raised through local taxes and the £40 million from other sources, such as grants.','以 Of this 把三項來源接回剛報出的總預算',[0,4,7],{formula:'Of this, [政府款] came from the national government, far more than [地方稅款] raised through local taxes and [其他款] from other sources, such as grants',meaning:'2017 來源：政府 £175.5m；地方稅 £91.2m；其他 £38m；合計 £304.7m。',usage:'Of this 回指上一句總預算，三個來源須在同一年、同一 £m 單位比較。',parts:[link('Of this,'),slot(' £175.5 million','政府款'),link(' came from the national government, far more than'),slot(' the £91.2 million','地方稅款'),link(' raised through local taxes and'),slot(' the £38 million','其他款'),link(' from other sources, such as grants.')]}),
 f('By 2018, the total had climbed to £320 million.','在報完起年後用 By 2018 引入終年總額',[0,4,9],{formula:'By [後年], the total had climbed to [總額]',meaning:'2018 總預算 £318.6m，較 2017 £304.7m 高 £13.9m。',usage:'had climbed to 是終值，不是增加了 £318.6m。',parts:[link('By 2018, the total had climbed to'),slot(' £318.6 million','總額'),link('.')]}),
 f('Government funding increased only slightly, to £178 million, while local-tax revenue rose more sharply to £105 million.','並排比較同一年度兩項資金來源的變化幅度',[0,5,9],{formula:'Government funding increased only slightly, to [政府終值], while local-tax revenue rose more sharply to [地方稅終值]',meaning:'政府 175.5→177.8，增 £2.3m；地方稅 91.2→102.3，增 £11.1m。',usage:'more sharply 比較增幅，不表示 2018 地方稅總額大於政府款。',parts:[link('Government funding increased only slightly, to'),slot(' £177.8 million','政府終值'),link(', while local-tax revenue rose more sharply to'),slot(' £102.3 million','地方稅終值'),link('.')]}),
 f('Other sources changed very little, reaching £39 million.','補報剩餘來源的微小變化',[0,5,7],{formula:'Other sources changed very little, reaching [終值]',meaning:'其他來源 38→38.5m，只增加 £0.5m。',usage:'very little 是相對於地方稅 +£11.1m；仍要報正確終值。',parts:[link('Other sources changed very little, reaching'),slot(' £38.5 million','終值'),link('.')]}),
 f('Regarding spending, salaries accounted for three quarters of the budget in 2017, before declining to 70% in 2018.','報最大支出項從四分之三到次年的較低份額',[0,4,10],{formula:'Regarding spending, [類別] accounted for three quarters of the budget in 2017, before declining to [後年份額] in 2018',meaning:'salaries 2017 為 75%，2018 降至 69%；下降 6 個百分點。',usage:'下降 75→69 是 6 個百分點，不是支出總額下降 6%。',parts:[link('Regarding spending,'),slot(' salaries','類別'),link(' accounted for three quarters of the budget in 2017, before declining to'),slot(' 69%','後年份額'),link(' in 2018.')]}),
 f('By contrast, technology almost doubled its share, rising from 7% to 13%, whereas buildings and transport remained unchanged at 17%.','以對照連接科技佔比上升與另一類別持平',[0,4,9],{formula:'By contrast, [增長項] almost doubled its share, rising from [起比] to [終比], whereas [持平項] remained unchanged at [份額]',meaning:'technology 8%→14%（+6 點）；buildings and transport 17%→17%。',usage:'8→14 是 1.75 倍，故 almost doubled 可用；不能說「增加 14 個百分點」。',parts:[link('By contrast,'),slot(' technology','增長項'),link(' almost doubled its share, rising from'),slot(' 8%','起比'),link(' to'),slot(' 14%','終比'),link(', whereas'),slot(' buildings and transport','持平項'),link(' remained unchanged at'),slot(' 17%','份額'),link('.')]}),
];
const intro=[quiz('表格與圓圖分別給出甚麼單位？',['資金來源以百萬英鎊計；支出分配以百分比計','兩者均以人數計','兩者均以英鎊每月計','表格以百分比計而圓圖以英鎊計'],'標題 budget in £m；圓圖標 75% 等份額。'),{type:'multi',prompt:'哪兩項適合總結兩年最明顯變化？',detail:'選兩項，再按「確認」。',options:['總預算略升，政府仍是最大來源，增額主要來自地方稅','薪金仍佔支出最多，但佔比下降；科技佔比上升','其他來源由 £38m 突增至 £100m','建築及交通支出佔比由 17% 跌至 0%'],correct:[0,1],why:'同時概述收入總額與來源、支出分配。'}];
const route=[sequence('排好四段警方預算報告',[
 ['圖表介紹','表格：2017／2018 各資金來源與總額（£m）；圓圖：支出佔比（%）。'],
 ['整體概覽','總額略升；政府最大、地方稅帶動增額；薪金最大但佔比跌、科技升。'],
 ['收入來源細節','2017 總額 304.7；政府 175.5、地方稅 91.2、其他 38；2018 對應 318.6、177.8、102.3、38.5。'],
 ['支出份額細節','薪金 75→69%；科技 8→14%；建築及交通 17→17%。'],
],'各年的三項收入之和應與同年總額相符；各圓圖百分比應合計 100。')];
const evidence=[
 quiz('兩年總預算依次是多少？',['£304.7m 和 £318.6m','£318.6m 和 £304.7m','75% 和 69%','£175.5m 和 £177.8m'],'表格 Total 2017 304.7、2018 318.6。'),
 quiz('哪項一直是最大資金來源？',['國家政府','地方稅','其他來源','科技'],'政府 175.5m／177.8m，均高於其他來源。'),
 quiz('哪項最能解釋 £13.9m 總增額？',['地方稅增加 £11.1m','政府款增加 £11.1m','其他來源增加 £11.1m','科技比例下降 11.1 點'],'地方稅 91.2→102.3，差 £11.1m。'),
 quiz('2017 三項來源如何合計？',['175.5+91.2+38=304.7 百萬英鎊','175.5+91.2+38=75%','175.5+91.2=318.6','三項各佔 100%'],'三項金額同年、同 £m 單位，合計 304.7。'),
 quiz('2018 其他來源是多少？',['£38.5m，較上年多 £0.5m','£102.3m，較上年多 £11.1m','17%，與去年一樣','£318.6m，是總預算'],'Other sources 38→38.5m。'),
 quiz('薪金支出佔比如何變化？',['75% 降至 69%，少 6 個百分點','69% 升至 75%','75m 降至 69m','17% 保持不變'],'圓圖 salaries 75%→69%。'),
 quiz('科技與建築交通的支出份額如何？',['科技 8→14%；建築交通維持 17%','科技維持 17%；建築交通 8→14%','兩項都跌至零','兩項都是 £17m'],'兩圓圖科技 8／14%，黑色建築交通均 17%。'),
];
const logic=[sequence('收入：分清「最大來源」與「增額最大」',[
 ['總額','2017 £304.7m → 2018 £318.6m，增加 £13.9m。'],['最大來源','國家政府 175.5→177.8m，兩年均排名第一。'],['主要增額','地方稅 91.2→102.3m，增加 £11.1m。'],['微變來源','其他 38→38.5m，只增加 £0.5m。'],
 ],'2018 三項之和 177.8+102.3+38.5=318.6m。'),sequence('支出：比較兩張圓圖的同名類別',[
 ['薪金','75%→69%，仍最大但減 6 個百分點。'],['科技','8%→14%，加 6 個百分點，為起點的 1.75 倍。'],['建築及交通','兩年都是 17%，份額不變。'],['單位界線','圖給百分比；表給 £m；不要把二者直接互換。'],
 ],'2017 75+8+17=100%；2018 69+14+17=100%。')];
const transfers=[
 transfer('另一地警方資料有資金來源表（£m）及支出比例圖（%）。','哪句引言完整？',['表格比較兩年警務預算的資金來源，圓圖顯示同筆預算如何分配。','表格和圓圖都只比較人口數。','圓圖顯示資金來源金額，表格顯示犯罪率。','兩圖只關於警員薪酬，沒有其他類別。'],['兩圖角色和金額／百分比清晰。','單位與主題錯。','沒有犯罪率。','包含多項來源與用途。'],[0],'原文 table by funding source，pie charts how money was spent。'),
 transfer('總預算由 £304.7m 升至 £318.6m。','哪個總結保持量級？',['兩年間總預算小幅增加 £13.9m。','總預算減少 £13.9m。','總預算增加 £318.6m。','預算由 304.7% 升至 318.6%。'],['318.6−304.7=13.9 百萬英鎊。','方向相反。','終值不是增額。','單位不是百分比。'],[1,4,6],'原文 budget rose modestly；totals £304.7m→£318.6m。'),
 transfer('政府款始終最大；地方稅在兩年間增加最多。','哪句分清「最大」與「增長來源」？',['政府仍是最大資金來源，但新增預算主要來自地方稅。','地方稅款已超過政府款，故成為最大來源。','政府款與地方稅款兩年都完全相等。','主要增額來自其他補助金 £0.5m。'],['排名看金額，增額看年份差。','地方稅終值 102.3 低於政府 177.8。','數值不同。','其他只增 0.5m。'],[2,5,7],'原文 national government main source，increase chiefly local taxes。'),
 transfer('薪金仍佔最多，但份額從 75% 跌至 69%；科技從 8% 增至 14%。','哪句適合作支出概覽？',['薪金仍主導支出，但其比例下降，科技比例則上升。','科技是最大支出類別，薪金跌至零。','薪金與科技兩項比例均沒有變。','表格給出每名警員的實際工資。'],['最大項與比例轉移都保留。','薪金仍 69%，最大。','兩者都變動。','沒有個人薪資。'],[3,9,10],'原文 salaries dominate but share fell as technology grew。'),
 transfer('來源表標示 2017 總額 £304.7m。','哪個讀法正確？',['2017 年警務預算總額為 304.7 百萬英鎊。','2017 年預算只有 304.7 英鎊。','2017 年薪金佔 304.7%。','2017 年有 304.7 名警員。'],['£m 表示百萬英鎊。','省略百萬倍數。','金額不是百分比。','不是人數。'],[4],'原文 total police budget stood at £304.7 million。'),
 transfer('2017 來源是政府 £175.5m、地方稅 £91.2m、其他 £38m。','哪句完整比較三項？',['政府款 £175.5m 遠多於地方稅 £91.2m 及其他來源 £38m。','地方稅 £175.5m 遠多於政府 £91.2m。','其他來源 £175.5m 為最大項。','三個數字都是圓圖的百分比。'],['大小、標籤、£m 單位均準。','政府與稅款顛倒。','其他只 £38m。','來源表是金額。'],[5],'原文 Of this, government far more than local taxes and other sources。'),
 transfer('2018 總額 £318.6m，2017 £304.7m。','哪句把終值和增額分開？',['至 2018 年總額升至 £318.6m，較上年增加 £13.9m。','至 2018 年總額增加 £318.6m。','2018 總額較 2017 減少 £13.9m。','£318.6m 是科技支出比例。'],['終值 318.6，差額 13.9。','把終值誤作增額。','方向相反。','金額不是比例。'],[6],'原文 By 2018, total had climbed to £318.6 million。'),
 transfer('政府 175.5→177.8m；地方稅 91.2→102.3m。','哪句比較增幅準確？',['政府款只小幅增加，地方稅收入上升較多。','地方稅終值超過政府終值。','政府款增加 £11.1m。','兩項金額都沒有變。'],['政府 +2.3m；地方稅 +11.1m。','102.3 < 177.8。','政府只 +2.3m。','兩項均有升。'],[7],'原文 government increased only slightly，local tax rose more sharply。'),
 transfer('其他來源由 £38m 變成 £38.5m。','哪句不誇大變化？',['其他來源變化甚少，終值 £38.5m。','其他來源增加到 £385m。','其他來源由 £38m 降至零。','其他來源是支出中的 38.5%。'],['只增 £0.5m。','小數位錯。','方向相反。','是收入金額。'],[8],'原文 other sources changed very little，reaching £38.5m。'),
 transfer('薪金佔比由 75% 變 69%。','哪句把百分點與百分比區分？',['薪金仍是最大支出類別，份額下降 6 個百分點。','薪金份額下降 75 個百分點。','薪金份額上升 6 個百分點。','2018 年薪金份額是 £69m。'],['75−69=6 個百分點；單位是佔比。','差值不是 75。','方向相反。','69 是百分比。'],[9],'原文 salaries three quarters in 2017，69% in 2018。'),
 transfer('科技 8→14%，建築交通兩年均 17%。','哪句保持兩項支出的不同走勢？',['科技比例由 8% 升至 14%，建築交通則維持 17%。','科技由 8% 降至 14%。','建築交通由 17% 升至 34%。','科技增加 14 個百分點。'],['科技加 6 點，建築交通不變。','數字是上升。','兩年同為 17%。','8→14 只加 6 點。'],[10],'原文 technology almost doubled share 8→14%，buildings/transport 17%。'),
];
export default {key:'task1-mixed-charts:3',meta:{topic:'英國地區警方預算：資金來源與支出分配',summary:'2017→2018 總預算 £304.7m→£318.6m；政府款仍最大，地方稅推動增額；薪金佔比 75→69%，科技 8→14%，建築交通 17% 不變。分清 £m 與百分點。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
