// Task 1 Tables 9: calories per person per day from three staples in four countries.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'單位是每人每日從該食物攝取的卡路里，非食物重量或總熱量。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看各國主要來源，再逐項比 rice、wheat、maize。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows how many calories each person gets each day from rice, wheat and maize in Cambodia, Poland, Egypt and Mexico.',
 'Overall, each country gets most calories from a different main food: Cambodia from rice, Poland and Egypt from wheat, and Mexico from maize.',
 'Egypt gets a substantial number of calories from all three foods, but Poland gets almost none from rice and none from maize.',
 'Rice gives people in Cambodia 1,445 calories each day, nearly three times Egypt’s 501 calories from rice.',
 'Mexico gets only 57 calories per person per day from rice, and Poland only 19.',
 'In contrast, wheat gives Cambodia just 18 calories per person per day.',
 'Wheat gives the most calories among the three foods in Egypt and Poland: 1,095 and 865, in that order. Mexico gets much less, 275.',
 'Maize has a different pattern across the four countries.',
 'Mexico gets the most calories from maize, 1,083, much more than Egypt’s 578 and over ten times Cambodia’s 103.',
 'Poland gets zero calories from maize in this table.',
];
const vocabulary=[
 v(['compares','shows','比較'],['daily per-person calorie intake','how many calories each person gets each day','每人每日卡路里攝取'],['from rice, wheat and maize','from rice, wheat and maize','來自米、小麥和玉米']),
 v(['clear dependence on a different staple','most calories from a different main food','主要熱量來源各異'],['staple','main food','主食'],['rice in Cambodia','Cambodia from rice','柬埔寨以米為主']),
 v(['broadest consumption across all three foods','a substantial number of calories from all three foods','三種食物均有顯著熱量'],['narrowest pattern','almost none from rice and none from maize','來源最集中'],['no calories from maize','none from maize','玉米為零']),
 v(['overwhelmingly dominant','gives people in Cambodia 1,445 calories','絕對主導'],['nearly three times','nearly three times','近三倍'],['calories per person per day','calories each day','每人每日卡路里']),
 v(['two remaining countries','Mexico','另外兩國'],['consume little rice','gets only 57 calories','從米取得熱量很少'],['records only','only','僅錄得']),
 v(['by contrast','In contrast','相反'],['barely eaten','gives Cambodia just 18 calories','貢獻熱量極少'],['just 18 calories','just 18 calories','只有十八卡路里']),
 v(['main source','most calories','主要來源'],['respectively','in that order','依次分別'],['whereas','Mexico gets much less','然而另一國較少']),
 v(['Maize consumption','Maize','玉米熱量攝取'],['different pattern','different pattern','不同分布模式']),
 v(['highest intake','most calories','最高攝取'],['far ahead of','much more than','遠高於'],['over ten times','over ten times','超過十倍']),
 v(['however','Poland','然而；另一國例外'],['reports no maize consumption at all','gets zero calories from maize','玉米熱量為零']),
];
const structures=[
 f('The table compares the daily per-person calorie intake from potatoes, bread and beans in Countries A, B, C and D.','引言列食物、每人每日卡路里及國別',[1,3,6],{formula:'The table compares the daily per-person calorie intake from [三食物] in [四國]',meaning:'柬埔寨、波蘭、埃及、墨西哥每人每日從米／小麥／玉米取得的卡路里。',usage:'單位不是克，也不是每國總人口的每日熱量。',parts:[link('The table compares the daily per-person calorie intake from '),slot('rice, wheat and maize','三食物'),link(' in '),slot('Cambodia, Poland, Egypt and Mexico','四國'),link('.')]}),
 f('Overall, each country shows a clear dependence on a different staple: potatoes in Country A, bread in Countries B and C, and beans in Country D.','概覽各國主要熱量來源，允許兩國共享同一主食',[0,3,6],{formula:'Overall, each country shows a clear dependence on a different staple: [食物] in [國], [食物] in [兩國], and [食物] in [國]',meaning:'Cambodia 米 1445；Poland/Egypt 小麥 865/1095；Mexico 玉米 1083，各為本國三項之首。',usage:'different staple 指主要來源的國別組合，不表示四國必有四種不同食物。',parts:[link('Overall, each country shows a clear dependence on a different staple: '),slot('rice','第一食物'),link(' in '),slot('Cambodia','第一國'),link(', '),slot('wheat','第二食物'),link(' in '),slot('Poland and Egypt','兩國'),link(', and '),slot('maize','第三食物'),link(' in '),slot('Mexico','第四國'),link('.')]}),
 f('Country C records the broadest consumption across all three foods, while Country B has the narrowest pattern, with no calories from beans.','以 while 對比三類都有值與其中一類為零',[0,3,6],{formula:'[國甲] records the broadest consumption across all three foods, while [國乙] has the narrowest pattern, with no calories from [食物]',meaning:'Egypt 米 501、小麥 1095、玉米 578；Poland 米 19、小麥 865、玉米 0。',usage:'本表僅涵蓋三種食物；不能推斷各國全部飲食多樣性。',parts:[slot('Egypt','三類均有值'),link(' records the broadest consumption across all three foods, while '),slot('Poland','來源最集中'),link(' has the narrowest pattern, with no calories from '),slot('maize','零值食物'),link('.')]}),
 f('Rice is overwhelmingly dominant in Country A, at 1,500 calories per person per day, which is nearly three times Country B’s figure of 520.','同一食物橫向比較最高國與另一國的近似倍數',[0,2,6],{formula:'Rice is overwhelmingly dominant in [最高國], at [最高值] calories per person per day, which is nearly three times [比較國及數值].',meaning:'Cambodia 米 1445，Egypt 米 501；1445÷501≈2.88。',usage:'同一食物在一國遠高於另一國，需以同單位說明近似倍數時。',parts:[link('Rice is overwhelmingly dominant in '),slot('Cambodia','最高國'),link(', at '),slot('1,445','最高值'),link(' calories per person per day, which is nearly three times '),slot("Egypt's figure of 501",'比較國及數值'),link('.')]}),
 f('The two remaining countries consume little rice: Country D stands at 60 calories, while Country B records only 20.','以冒號補充另外兩國同一食物的低值',[0,2,6],{formula:'The two remaining countries consume little rice: [國甲] stands at [值] calories, while [國乙] records only [值]',meaning:'Mexico 米 57；Poland 米 19 卡路里每人每日。',usage:'consume little rice 是卡路里貢獻低；不能由此推斷食物重量。',parts:[link('The two remaining countries consume little rice: '),slot('Mexico','較高者'),link(' stands at '),slot('57','數值'),link(' calories, while '),slot('Poland','最低者'),link(' records only '),slot('19','數值'),link('.')]}),
 f('Wheat, by contrast, is barely eaten in Country A, at just 20 calories.','切換食物類別並指出前段最高國在本類極低',[0,2,4],{formula:'Wheat, by contrast, is barely eaten in [國], at just [值] calories',meaning:'Cambodia 小麥僅 18 卡路里每人每日，與其米 1445 強烈對照。',usage:'精確說法是小麥貢獻的卡路里極低；表沒有克數。',parts:[link('Wheat, by contrast, is barely eaten in '),slot('Cambodia','低值國'),link(', at just '),slot('18','數值'),link(' calories.')]}),
 f('It is the main source in Countries B and C, at 900 and 1,100 calories respectively, whereas Country D’s figure is much lower, at 300.','It 回指小麥，再用 respectively 對應兩國數值',[0,2,4],{formula:'It is the main source in [兩國], at [第一值] and [第二值] calories respectively, whereas [第三國] is much lower, at [第三值].',meaning:'Wheat：Poland 865、Egypt 1095 為各國三項最高；Mexico 275。',usage:'一種食物在兩國居首、在第三國明顯較低，並需按順序對應數值時。',parts:[link('It is the main source in '),slot('Egypt and Poland','兩國'),link(', at '),slot('1,095','第一值'),link(' and '),slot('865','第二值'),link(' calories respectively, whereas '),slot("Mexico's figure",'第三國'),link(' is much lower, at '),slot('275','第三值'),link('.')]}),
 f('Maize consumption follows a different pattern in the second comparison.','用短句轉向第三種食物及不同排序',[0,2,4],{formula:'Maize consumption [新分布].',meaning:'Mexico 玉米最高、Poland 玉米 0，與米／小麥的主導國不同。',usage:'要用短句轉入另一種食物，提示其分布與前述不同時。',parts:[link('Maize consumption '),slot('follows a different pattern','新分布'),link('.')]}),
 f('Country D records the highest intake, at 1,100 calories, far ahead of Country C’s 600 and over ten times Country A’s 100.','用兩種比較尺度報第三類最高值',[0,2,4],{formula:'[最高國] records the highest intake, at [最高值] calories, far ahead of [第二國及值] and over ten times [第三國及值].',meaning:'玉米 Mexico 1083、Egypt 578、Cambodia 103；1083÷103≈10.5。',usage:'要指出最高國與次高國及最低國的差距，並量化倍數時。',parts:[slot('Mexico','最高國'),link(' records the highest intake, at '),slot('1,083','最高值'),link(' calories, far ahead of '),slot("Egypt's 578",'第二國及值'),link(' and over ten times '),slot("Cambodia's 103",'第三國及值'),link('.')]}),
 f('Country B, however, reports no maize consumption at all.','最後突出玉米零值例外',[0,2,4],{formula:'[國], however, reports no maize consumption at all',meaning:'Poland 玉米欄 0 卡路里每人每日。',usage:'只代表表列三食物中玉米為 0；不推斷完全不吃其他穀物。',parts:[slot('Poland','零值國'),link(', however, reports no maize consumption at all.')]}),
];
structures[7].example='Maize consumption shows a new pattern.';
const intro=[quiz('1,445 代表甚麼？',['柬埔寨每人每日從米取得的卡路里','柬埔寨每年米產量（噸）','柬埔寨每人每日總卡路里','每月米消費重量（克）'],'欄名 calories per person per day，該格是 rice。'),{type:'multi',prompt:'哪兩項適合概覽？',detail:'選兩項，再按「確認」。',options:['各國在三種食物中的主要卡路里來源不同','埃及三項都有顯著值，波蘭的玉米欄為零','四國都以米為主要來源','波蘭玉米數值最高'],correct:[0,1],why:'主導食物和分布差異是跨國主特徵。'}];
const route=[sequence('依範文排主食卡路里報告',[
 ['引言','四國、米／小麥／玉米、每人每日卡路里。'],['概覽','Cambodia 米、Poland/Egypt 小麥、Mexico 玉米為主要來源。'],['米與小麥','米 Cambodia 1445 最大；小麥 Egypt 1095、Poland 865 主導。'],['玉米','Mexico 1083 最大；Egypt 578、Cambodia 103、Poland 0。'],
 ],'每項都使用相同的每人每日卡路里單位。')];
const evidence=[
 quiz('柬埔寨哪種食物的卡路里最高？',['米 1,445','小麥 18','玉米 103','三項相同'],'米遠高於其他兩類。'),
 quiz('波蘭的玉米值？',['0 卡路里','19 卡路里','865 卡路里','1,083 卡路里'],'19 是米，865 是小麥；玉米為 0。'),
 quiz('埃及三項數值？',['米 501、小麥 1,095、玉米 578','米 1,445、小麥 18、玉米 103','米 57、小麥 275、玉米 1,083','米 19、小麥 865、玉米 0'],'埃及三項都有可觀值，小麥最高。'),
 quiz('墨西哥哪種食物最高？',['玉米 1,083','米 57','小麥 275','三項相同'],'玉米是墨西哥三項中的主導來源。'),
 quiz('墨西哥玉米與柬埔寨玉米相比？',['1,083 是 103 的十倍以上','兩者相同','103 是 1,083 的十倍','差距只 10 卡路里'],'1083÷103≈10.5。'),
];
const logic=[sequence('先按國找最高，再按食物核對',[
 ['Cambodia','米 1445 > 玉米 103 > 小麥 18。'],['Poland','小麥 865 > 米 19 > 玉米 0。'],['Egypt','小麥 1095 > 玉米 578 > 米 501。'],['Mexico','玉米 1083 > 小麥 275 > 米 57。'],
 ],'概覽的主導食物要從每一行三項比較得出。'),sequence('倍數與零值的界線',[
 ['米倍數','Cambodia 1445÷Egypt 501≈2.88，近三倍。'],['玉米倍數','Mexico 1083÷Cambodia 103≈10.5，逾十倍。'],['零值','Poland 玉米 =0；不可拿它當倍數分母。'],['範圍','表只有這三種食物，不能聲稱各國全部飲食只有這些。'],
 ],'倍數須同食物同單位；零值與未列食物要分開。')];
const transfers=[
 transfer('另一表列出每人每日從幾種主食取得的卡路里。','哪句引言保留量度單位？',['表格比較各國每人每日從三種食物取得的卡路里。','表格比較三種食物每公斤的價格。','表格列出四國每日米產量。','數值代表各國總人口。'],['每人每日及來源都清楚。','非價格。','非產量。','非人口。'],[0],'原文 daily per-person calorie intake。'),
 transfer('Cambodia 米 1445；Poland/Egypt 小麥 865/1095；Mexico 玉米 1083。','哪句概覽每國主要來源？',['柬埔寨以米、波蘭與埃及以小麥、墨西哥以玉米為主要熱量來源。','四國都以米為主要熱量來源。','波蘭以玉米為主要來源。','墨西哥的小麥比玉米高。'],['各行最高值正確。','三國例外。','波蘭玉米 0。','墨西哥玉米較高。'],[1],'原文 different staple by country。'),
 transfer('埃及三食物 501/1095/578；波蘭 19/865/0。','哪句不推斷表外所有食物？',['在這三種食物中，埃及各項都有值；波蘭玉米為零。','埃及人只吃這三種食物。','波蘭人完全不吃任何穀物。','四國三項數值都相同。'],['明確限定表內三類。','無表外資料。','波蘭小麥 865。','值不同。'],[2],'原文 broadest across all three foods，Poland no maize。'),
 transfer('米：柬埔寨 1445，埃及 501 卡路里。','哪句倍數合適？',['柬埔寨從米取得的熱量接近埃及的三倍。','柬埔寨從米取得的熱量恰好是埃及五倍。','埃及的米熱量比柬埔寨高。','數字是每日食物重量。'],['1445÷501≈2.88。','不是五倍。','柬埔寨較高。','單位卡路里。'],[3],'原文 rice nearly three times Egypt。'),
 transfer('米：墨西哥 57，波蘭 19。','哪句兩個低值配對正確？',['墨西哥從米取得 57 卡路里，波蘭只有 19。','墨西哥從米取得 19，波蘭 57。','兩國從米取得 1445。','波蘭從米取得 865。'],['相同食物跨兩國。','顛倒。','1445 是柬埔寨。','865 是波蘭小麥。'],[4],'原文 Mexico rice 57，Poland rice 19。'),
 transfer('柬埔寨：米 1445、小麥 18 卡路里。','哪句準確表達對比？',['柬埔寨從小麥取得的熱量只有 18，遠低於米。','柬埔寨的小麥熱量有 1445。','柬埔寨的小麥是主要來源。','兩項熱量完全相等。'],['只比較表內熱量。','1445 是米。','米主導。','差距大。'],[5],'原文 Wheat by contrast just 18。'),
 transfer('小麥：埃及 1095、波蘭 865、墨西哥 275。','哪句按次序及主導性正確？',['小麥是埃及和波蘭的主要來源，兩國依次為 1095 和 865；墨西哥只有 275。','小麥在墨西哥為 1095。','埃及小麥只有 18。','波蘭小麥為零。'],['兩國值與次序正確。','Mexico 275。','Cambodia 18。','Poland 865。'],[6],'原文 main source Egypt/Poland respectively；Mexico lower。'),
 transfer('現在轉向第三項玉米。','哪句適合帶出新的分布？',['玉米的熱量分布呈現另一種格局。','玉米在所有國家都是零。','玉米和米各國數值完全相同。','表格沒有玉米資料。'],['轉折等待後文具體值。','只有波蘭零。','不同。','有玉米欄。'],[7],'原文 Maize consumption follows a different pattern。'),
 transfer('玉米：墨西哥 1083、埃及 578、柬埔寨 103。','哪句倍數及對象都正確？',['墨西哥玉米熱量最高，遠高於埃及，亦超過柬埔寨十倍。','墨西哥玉米低於柬埔寨。','墨西哥玉米是埃及十倍以上。','埃及玉米為零。'],['1083/103≈10.5；對埃及約 1.87。','方向錯。','對埃及不足兩倍。','埃及 578。'],[8],'原文 Mexico highest，over ten times Cambodia。'),
 transfer('波蘭的玉米欄是 0。','哪句不越界推斷？',['表中波蘭從玉米取得的熱量為零。','波蘭人不吃任何食物。','波蘭的所有穀類熱量都為零。','波蘭玉米熱量最高。'],['僅限定此欄。','小麥 865、米 19。','其他兩類有值。','玉米零。'],[9],'原文 Poland no maize consumption。'),
];
const balancedTransferOptions=[
  ['表格列每國每人每日從三種食物取得的熱量。','表格列每國每人每日購買三種食物的價格。','表格列每國每人每日食用三種食物的重量。','表格列各國三種食物每日生產的總熱量。'],
  ['柬埔寨以米、波蘭和埃及以小麥、墨西哥以玉米為主。','柬埔寨以小麥、波蘭和埃及以米、墨西哥以玉米為主。','柬埔寨以米、波蘭和埃及以玉米、墨西哥以小麥為主。','柬埔寨以玉米、波蘭和埃及以小麥、墨西哥以米為主。'],
  ['在列出的三類中，埃及皆有值，波蘭玉米為零。','在列出的三類中，埃及玉米為零，波蘭皆有值。','埃及所有食物只有這三類，波蘭玉米為零。','在列出的三類中，埃及與波蘭數值全相同。'],
  ['柬埔寨從米取得的熱量，約為埃及的三倍。','柬埔寨從米取得的熱量，約為埃及的五倍。','埃及從米取得的熱量，約為柬埔寨的三倍。','柬埔寨的米產量重量，約為埃及的三倍。'],
  ['墨西哥米類熱量為 57，波蘭為 19。','墨西哥米類熱量為 19，波蘭為 57。','墨西哥米類熱量為 57，波蘭為 865。','墨西哥米類熱量為 1445，波蘭為 19。'],
  ['柬埔寨小麥熱量僅 18，遠低於米的 1445。','柬埔寨小麥熱量達 1445，高於米的 18。','柬埔寨小麥熱量僅 18，與米的 18 相等。','柬埔寨小麥熱量僅 18，高於米的 1445。'],
  ['埃及與波蘭以小麥為主，依次為 1095 與 865。','波蘭與埃及以小麥為主，依次為 1095 與 865。','埃及與墨西哥以小麥為主，依次為 1095 與 865。','埃及與波蘭以玉米為主，依次為 1095 與 865。'],
  ['轉看玉米熱量，各國分布與米、小麥不同。','轉看玉米熱量，四國數值均與米完全相同。','轉看玉米熱量，四國數值均與小麥相同。','轉看玉米熱量，表中只列兩個國家的值。'],
  ['墨西哥玉米熱量最高，超過柬埔寨十倍。','墨西哥玉米熱量最高，超過埃及十倍。','埃及玉米熱量最高，超過墨西哥十倍。','墨西哥玉米熱量最低，僅有柬埔寨一成。'],
  ['表中波蘭從玉米取得的每日熱量為零。','表中波蘭從小麥取得的每日熱量為零。','表中波蘭從全部食物取得的熱量為零。','表中波蘭從玉米取得的每日熱量最高。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:9',meta:{topic:'四國從米、小麥、玉米攝取的每日人均卡路里',summary:'柬埔寨以米 1445、波蘭和埃及以小麥 865/1095、墨西哥以玉米 1083 為三種列名食物中的主要熱量來源。埃及三項均有顯著值；波蘭玉米為 0。所有數字是每人每日的來源卡路里，不是重量或完整飲食。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
