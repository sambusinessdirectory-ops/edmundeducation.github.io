// Task 1 Tables 8: proportion of roles held by women, four industries and three management levels.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'每格是該行業該職級職位中由女性出任的比例，不是女性員工的職級分布。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先比行業的最高／最低，再比職級。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows what percentage of manager, executive and CEO jobs were held by women in four industries in one European country in 2006.',
 'Overall, hospitality had the highest share of women at all three levels, while manufacturing had the lowest.',
 'Women usually held a smaller share at higher job levels. Hospitality was an exception: its female CEO share was a little higher than its female executive share.',
 'For manager jobs, hospitality had the highest female share at 33.14%, about twice finance at 16.39% and IT at 16.04%.',
 'Manufacturing was lower: women held only 9% of its manager jobs.',
 'For executive and CEO jobs, hospitality was still highest and manufacturing still lowest, but finance and IT changed order. Shares were generally below the manager level.',
 'In hospitality, women held 19.9% of executive jobs and 20.6% of CEO jobs. In IT, the numbers were much lower: 12.82% and 6.58%.',
 'In finance, women held only 4.58% of executive jobs and 1.98% of CEO jobs.',
 'Manufacturing had the smallest shares: women held only 1.98% of executive jobs and 1.21% of CEO jobs.',
];
const vocabulary=[
 v(['compares','shows','比較'],['percentage','what percentage','百分比'],['management posts occupied by women','jobs were held by women','女性出任管理職位'],['in a European country','in one European country','某歐洲國家']),
 v(['most strongly represented','highest share of women','女性代表比例最高'],['least represented','lowest','比例最低'],['across the three levels','at all three levels','三個職級均如此']),
 v(['generally decreased','usually held a smaller share','通常比例下降'],['seniority rose','higher job levels','職級上升'],['an exception','an exception','例外'],['slightly exceeded','a little higher than','略高於']),
 v(['Among managers','For manager jobs','經理職級'],['by far the highest figure','highest female share','遠為最高'],['roughly twice','about twice','約兩倍'],['almost identical','16.39% and IT at 16.04%','幾乎相同']),
 v(['noticeably lower','lower','明顯較低'],['making up only 9%','held only 9%','僅佔百分之九']),
 v(['similar ranking','hospitality was still highest and manufacturing still lowest','大致相同的最高最低排序'],['executives and CEOs','executive and CEO jobs','高級主管及行政總裁'],['percentages were smaller','Shares were generally below the manager level','比例通常較小']),
 v(['accounted for','held','佔有'],['executives','executive jobs','高級主管職位'],['far ahead of','much lower','遠高於'],['equivalent figures','numbers','相應數字']),
 v(['Female representation','women held','女性代表比例'],['much weaker','only','較弱'],['just 1.98%','1.98%','只有百分之一點九八']),
 v(['lowest levels overall','smallest shares','總體比例最低'],['with only 1.98%','only 1.98%','僅百分之一點九八'],['being women','women held','由女性出任']),
];
const structures=[
 f('The table compares the percentage of management posts occupied by women in banking, construction, education and retail in a European country in 2006.','交代百分比分母、行業、地點和年份',[1,3,6],{formula:'The table compares the percentage of management posts occupied by women in [四行業] in [地區] in [年份]',meaning:'2006 年四行業各管理職級的女性佔位比例。',usage:'百分比以各行業各職級全部職位為分母，不能看成女性員工中有多少是 CEO。',parts:[link('The table compares the percentage of management posts occupied by women in '),slot('finance, manufacturing, IT and hospitality','四行業'),link(' in '),slot('a European country','地區'),link(' in '),slot('2006','年份'),link('.')]}),
 f('Overall, women were most strongly represented in education and least represented in construction across the three levels.','概覽三個職級一致的最高與最低行業',[0,3,6],{formula:'Overall, women were most strongly represented in [最高行業] and least represented in [最低行業] across the three levels',meaning:'三行 hospitality 都最高，manufacturing 都最低。',usage:'across the three levels 指 Managers、Executives、CEOs，並非三個年份。',parts:[link('Overall, women were most strongly represented in '),slot('hospitality','最高行業'),link(' and least represented in '),slot('manufacturing','最低行業'),link(' across the three levels.')]}),
 f('In addition, their share generally decreased as seniority rose, although education was an exception at the top level, where the proportion of female CEOs slightly exceeded that of female executives.','說明職級通常越高比例越低，並清楚指出例外',[0,3,6],{formula:'In addition, their share generally decreased as seniority rose, although [例外行業] was an exception at the top level, where the proportion of female CEOs slightly exceeded that of female executives',meaning:'hospitality 19.9% executives、20.6% CEOs，CEO 略高；其他行業均由 manager 至 CEO 下降。',usage:'generally 保留例外；不應寫所有行業都逐級下降。',parts:[link('In addition, their share generally decreased as seniority rose, although '),slot('hospitality','例外行業'),link(' was an exception at the top level, where the proportion of female CEOs slightly exceeded that of female executives.')]}),
 f('Among managers, education had by far the highest figure, at 35%, roughly twice the shares recorded in banking and retail, which were almost identical at 17% and 16% respectively.','在單一職級報最高與兩個相近值',[0,2,6],{formula:'Among managers, [最高行業] had by far the highest figure, at [最高值], roughly twice the shares recorded in [相近兩行業], which were almost identical at [第一值] and [第二值] respectively.',meaning:'Managers：hospitality 33.14%、finance 16.39%、IT 16.04%。',usage:'某職級一行業遙遙領先，而兩個次級行業比例接近時。',parts:[link('Among managers, '),slot('hospitality','最高行業'),link(' had by far the highest figure, at '),slot('33.14%','最高值'),link(', roughly twice the shares recorded in '),slot('finance and IT','相近兩行業'),link(', which were almost identical at '),slot('16.39%','第一值'),link(' and '),slot('16.04%','第二值'),link(' respectively.')]}),
 f('Construction was noticeably lower, with women making up only 8% of managers.','補充同一職級的最低行業與數值',[0,2,6],{formula:'[行業] was noticeably lower, with women making up only [比例] of managers',meaning:'Manufacturing managers 女性比例 9%，比其他三行業低。',usage:'9% 不是製造業女性中當經理的比例，而是經理職位中女性佔比。',parts:[slot('Manufacturing','最低行業'),link(' was noticeably lower, with women making up only '),slot('9%','比例'),link(' of managers.')]}),
 f('A similar ranking can be seen among department heads and directors, though the percentages were smaller.','概括高職級仍維持最高／最低行業且一般比例較小',[0,2,4],{formula:'A similar ranking can be seen among [高職級], though the percentages were smaller.',meaning:'Executives/CEOs：hospitality 最高、manufacturing 最低；finance/IT 的中間次序與 manager 不同。',usage:'另一職級大致延續前述最高與最低者，但百分比整體較低時。',parts:[link('A similar ranking can be seen among executives and CEOs, though the percentages were smaller.')]}),
 f('In education, women accounted for 21% of executives and 22% of CEOs, far ahead of retail, where the equivalent figures were 13% and 7%.','橫向比較同兩職級在兩個行業的對應值',[0,2,4],{formula:'In [行業甲], women accounted for [值] of executives and [值] of CEOs, far ahead of [行業乙], where the equivalent figures were [值] and [值]',meaning:'Hospitality executives/CEOs 19.9/20.6%；IT 12.82/6.58%。',usage:'equivalent figures 依次對應 executives、CEOs，不能跨職級錯配。',parts:[link('In '),slot('hospitality','行業甲'),link(', women accounted for '),slot('19.9%','主管值'),link(' of executives and '),slot('20.6%','CEO 值'),link(' of CEOs, far ahead of '),slot('IT','行業乙'),link(', where the equivalent figures were '),slot('12.82%','主管值'),link(' and '),slot('6.58%','CEO 值'),link('.')]}),
 f('Female representation was much weaker in banking, at 5% for executives and just 2% for CEOs.','報一個行業兩個高職級的低比例',[0,2,4],{formula:'Female representation was much weaker in [行業], at [主管值] for executives and just [CEO 值] for CEOs',meaning:'Finance executives 4.58%、CEOs 1.98%。',usage:'4.58 和 1.98 是不同職級中女性佔該職級的比例。',parts:[link('Female representation was much weaker in '),slot('finance','行業'),link(', at '),slot('4.58%','主管值'),link(' for executives and just '),slot('1.98%','CEO 值'),link(' for CEOs.')]}),
 f('Construction had the lowest levels overall, with only 2% of executives and 1% of CEOs being women.','以最低行業的兩個高職級數字收束細節',[0,2,4],{formula:'[行業] had the lowest levels overall, with only [主管值] of executives and [CEO 值] of CEOs being women',meaning:'Manufacturing executives 1.98%、CEOs 1.21%，三個職級都最低。',usage:'Finance CEOs 1.98% 與 manufacturing executives 1.98% 數字相同，但欄位不同。',parts:[slot('Manufacturing','最低行業'),link(' had the lowest levels overall, with only '),slot('1.98%','主管值'),link(' of executives and '),slot('1.21%','CEO 值'),link(' of CEOs being women.')]}),
];
// Sentence 6 has no numeric slot; its source-exact frame is intentionally split at the relation.
structures[5].frame.parts=[link('A similar ranking can be seen among '),slot('executives and CEOs','高職級'),link(', though the percentages were smaller.')];
const intro=[quiz('33.14% 這類數字的分母是甚麼？',['該行業該職級的全部職位','該國全部女性人口','所有女性員工的總數','所有行業 CEO 的總數'],'例如 hospitality managers 33.14% 表示該類經理職位中女性佔比。'),{type:'multi',prompt:'哪兩項最適合概覽？',detail:'選兩項，再按「確認」。',options:['Hospitality 三職級均最高，manufacturing 三職級均最低','女性佔比通常隨職級升高而下降，hospitality 高層有小例外','Finance 在所有職級均最高','Hospitality executives 高於其 CEOs'],correct:[0,1],why:'跨行業最高最低和跨職級走勢皆重要。'}];
const route=[sequence('依範文排女性管理職位比例報告',[
 ['引言','2006、四行業、Managers/Executives/CEOs 中女性所佔比例。'],['概覽','Hospitality 均最高、manufacturing 均最低；通常職級越高比例越低。'],['Managers','Hospitality 33.14；finance 16.39；IT 16.04；manufacturing 9%。'],['Executives/CEOs','Hospitality 19.9/20.6、IT 12.82/6.58、finance 4.58/1.98、manufacturing 1.98/1.21%。'],
 ],'後兩職級要按行業成對寫，避免混淆職級或列。')];
const evidence=[
 quiz('哪行業三個職級的女性比例都最高？',['Hospitality','Finance','IT','Manufacturing'],'33.14/19.9/20.6%，三列皆最大。'),
 quiz('哪行業三個職級都最低？',['Manufacturing','Finance','IT','Hospitality'],'9/1.98/1.21%，三列皆最小。'),
 quiz('Hospitality 的高層例外是甚麼？',['CEO 20.6% 略高於 executive 19.9%','CEO 比例低於 executive','Managers 比 CEO 低','CEO 與 executive 同為 20.6%'],'通常職級升高比例下降，但這對相反。'),
 quiz('Managers 中 finance 和 IT 的差距？',['16.39% 與 16.04%，相差 0.35 百分點','相差 16.39 百分點','兩者都 9%','IT 以 33.14% 遠超 finance'],'兩值幾乎相同，finance 略高。'),
 quiz('CEO 一列 hospitality 與 manufacturing？',['20.6% 與 1.21%','19.9% 與 1.98%','33.14% 與 9%','12.82% 與 6.58%'],'20.6 是 hospitality CEO，1.21 是 manufacturing CEO。'),
];
const logic=[sequence('兩個比較軸',[
 ['同一職級跨行業','Managers：Hospitality 33.14 最高，manufacturing 9 最低。'],['同一行業跨職級','Finance 16.39→4.58→1.98%，職級越高女性比例越低。'],['例外','Hospitality 19.9% executives <20.6% CEOs。'],['限定','最高最低排序一致，但 finance/IT 在 managers 與高職級的中間名次互換。'],
 ],'「相似排名」指大端，不代表四行業完整排序完全相同。'),sequence('守住百分比分母',[
 ['Hospitality managers','33.14% 的 hospitality 經理職位由女性出任。'],['不是','不能說 33.14% 的 hospitality 女性員工是經理。'],['Manufacturing CEOs','1.21% 的 manufacturing CEO 職位由女性出任。'],['比較','同一職級跨行業或同一行業跨職級比較都須說清對象。'],
 ],'百分比換分母會改變問題意思。')];
const transfers=[
 transfer('另一表列出每行業各職級中由女性擔任的職位比例。','哪句沒有倒轉分母？',['每格表示該行業該職級職位中，女性所佔百分比。','每格表示女性員工中擔任該職級的百分比。','每格是女性的平均薪金。','每格是行業總人口。'],['職位是分母。','分母倒轉。','非薪金。','非人數。'],[0],'原文 percentage of management posts occupied by women。'),
 transfer('Hospitality 三列最高，製造業 三列最低。','哪句概覽完整？',['女性在 餐飲住宿業 各職級比例最高，在 製造業 各職級最低。','Finance 各職級比例最高。','Manufacturing 在 CEO 一列最高。','四個行業數值相同。'],['同一高低模式跨三列。','金融業 非最高。','製造業 最低。','差距大。'],[1],'原文 most strongly 餐飲住宿業，least 製造業 across three levels。'),
 transfer('Hospitality executives 19.9%、CEOs 20.6%。','哪句保留「一般」和例外？',['女性比例一般隨職級升高下降，但 餐飲住宿業 的 CEO 比例略高於主管。','所有行業 CEO 比例都低於主管。','Hospitality CEO 低於其主管。','CEO 比例永遠比經理高。'],['例外 20.6>19.9。','餐飲住宿業 例外。','方向反。','普遍相反。'],[2],'原文 generally decreased，although 餐飲住宿業 exception。'),
 transfer('Managers：餐飲住宿業 33.14，金融業 16.39，資訊科技業 16.04%。','哪句相對比較恰當？',['Hospitality 約為 金融業 和 資訊科技業 的兩倍，後兩者很接近。','Finance 約為 餐飲住宿業 的兩倍。','資訊科技業 是 33.14%。','Finance 和 資訊科技業 相差逾 10 點。'],['33.14 約兩倍 16，兩者差 0.35 點。','方向反。','資訊科技業 16.04。','差 0.35 點。'],[3],'原文 roughly twice 金融業/資訊科技業，almost identical。'),
 transfer('Manufacturing managers 中女性佔 9%。','哪句分母正確？',['製造業經理職位只有 9% 由女性出任。','製造業所有女性員工只有 9% 是經理。','製造業 CEO 女性比例為 9%。','製造業經理全部是女性。'],['職位中女性佔比正確。','分母倒轉。','CEO 1.21%。','9% 非全數。'],[4],'原文 women making up 9% of managers。'),
 transfer('Hospitality 高職級仍最高、製造業 仍最低；金融業/資訊科技業 次序改變。','哪句對「相似排名」加適當限定？',['主管及 CEO 仍維持同一最高和最低行業，但中間行業次序有變。','四個行業的完整排名在三職級一模一樣。','Finance 在高職級超過 資訊科技業。','Manufacturing 在高職級變成最高。'],['大端相似，不抹掉中間互換。','金融業/資訊科技業 互換。','資訊科技業 較高。','仍最低。'],[5],'原文 similar ranking among executives and CEOs。'),
 transfer('Hospitality executives/CEOs 19.9/20.6%；資訊科技業 12.82/6.58%。','哪句保持兩職級配對？',['Hospitality 主管和 CEO 依次為 19.9% 和 20.6%，都高於 資訊科技業 對應數值。','Hospitality CEO 為 19.9%，主管為 20.6%。','資訊科技業 主管為 6.58%，CEO 為 12.82%。','資訊科技業 兩職級均高於 餐飲住宿業。'],['respectively 對應正確。','餐飲住宿業 顛倒。','資訊科技業 顛倒。','資訊科技業 低於 餐飲住宿業。'],[6],'原文 executives and CEOs，equivalent figures in 資訊科技業。'),
 transfer('Finance executives 4.58%、CEOs 1.98%。','哪句沒有混入製造業同為 1.98% 的主管值？',['Finance 女性主管佔 4.58%，女性 CEO 佔 1.98%。','Finance 主管佔 1.98%，CEO 佔 4.58%。','Finance CEO 佔 9%。','Finance 兩職級都是 1.98%。'],['金融業 兩值位置正確。','顛倒。','9% 是製造業 managers。','主管 4.58%。'],[7],'原文 金融業 4.58 executives，1.98 CEOs。'),
 transfer('Manufacturing executives 1.98%、CEOs 1.21%。','哪句報最低行業的兩職級？',['製造業主管中女性佔 1.98%，CEO 中佔 1.21%。','製造業主管 9%，CEO 33.14%。','製造業 CEO 比 餐飲住宿業 CEO 高。','製造業所有女性都擔任主管。'],['兩行同屬 製造業。','9% 是 managers，33.14 是 餐飲住宿業。','1.21<20.6。','無此資料。'],[8],'原文 製造業 1.98 executives，1.21 CEOs。'),
 transfer('同一職級 金融業 managers 16.39、資訊科技業 managers 16.04%；高職級 資訊科技業 高於 金融業。','哪句準確描述名次變化？',['經理級：金融略高；主管及總裁級：科技較高。','Finance 在三個職級都高於 資訊科技業。','資訊科技業 在經理職級以 33.14% 領先。','Finance 和 資訊科技業 所有數值均相同。'],['16.39>16.04；12.82>4.58、6.58>1.98。','高職級不對。','33.14 是 餐飲住宿業。','各值不同。'],[3,5,6,7],'原文 managers 金融業/資訊科技業 almost identical，higher levels 資訊科技業 far ahead 金融業。'),
];
const balancedTransferOptions=[
  ['各數字為該行業該職級職位中女性所佔比例。','各數字為該行業女性員工中擔任該職級比例。','各數字為該行業該職級女性所得平均薪金。','各數字為該行業女性在總人口中所佔比例。'],
  ['餐飲住宿業各職級最高，製造業各職級最低。','金融業各職級最高，製造業各職級最低。','餐飲住宿業各職級最高，資訊科技業最低。','製造業各職級最高，餐飲住宿業各職級最低。'],
  ['女性佔比多隨職級上升而降，餐飲住宿業例外。','女性佔比各職級都下降，餐飲住宿業也如此。','女性佔比多隨職級上升而升，製造業例外。','餐飲住宿業的總裁比例低於主管，符合常態。'],
  ['餐飲住宿業經理約為金融及科技兩業的兩倍。','金融業經理約為餐飲住宿業及科技業的兩倍。','科技業經理約為餐飲住宿業及金融業的兩倍。','餐飲住宿業經理與金融及科技兩業數字接近。'],
  ['製造業經理職位中，女性佔全部職位的 9%。','製造業女性員工中，經理佔全部員工的 9%。','製造業總裁職位中，女性佔全部職位的 9%。','製造業經理職位中，女性佔全部職位的 90%。'],
  ['高職級仍由餐飲住宿業領先、製造業墊底。','高職級轉由金融業領先、製造業仍墊底。','高職級仍由餐飲住宿業領先、科技業墊底。','高職級完整名次與經理級完全保持相同。'],
  ['餐飲住宿業主管 19.9%、總裁 20.6%，均高於科技業。','餐飲住宿業主管 20.6%、總裁 19.9%，均高於科技業。','科技業主管 19.9%、總裁 20.6%，均高於餐飲業。','餐飲住宿業主管 19.9%、總裁 20.6%，均低於科技業。'],
  ['金融業主管 4.58%，總裁 1.98%。','金融業主管 1.98%，總裁 4.58%。','製造業主管 4.58%，總裁 1.98%。','金融業主管 4.58%，總裁 9%。'],
  ['製造業主管女性佔 1.98%，總裁佔 1.21%。','製造業主管女性佔 1.21%，總裁佔 1.98%。','製造業經理女性佔 1.98%，總裁佔 1.21%。','製造業主管女性佔 9%，總裁佔 20.6%。'],
  ['經理級金融略高於科技，高職級科技反而較高。','經理級科技略高於金融，高職級金融反而較高。','三個職級金融都高於科技，排名沒有轉變。','經理級兩業比例相同，高職級科技才較高。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:8',meta:{topic:'2006 年四行業三職級女性所佔職位比例',summary:'Hospitality 在 Managers、Executives、CEOs 均最高，製造業 均最低。女性佔比通常隨職級升高下降，餐飲住宿業 的 CEO 20.6% 略高於主管 19.9% 為例外。分母是每行業每職級的全部職位。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
