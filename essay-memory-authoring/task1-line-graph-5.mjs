// Task 1 Line Graph 5: two charts with different units, appliance ownership (%) and housework (hours/household/week).
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀兩張折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two line charts show the percentage of households that owned a washing machine, refrigerator or vacuum cleaner, and the average number of housework hours per week for each household, in one country from 1920 to 2019.',
 'Overall, more households owned each of the three appliances over time. By 2019, nearly every household had a refrigerator and a vacuum cleaner.',
 'At the same time, the average weekly time spent on housework fell a lot, from 50 hours to only 10 hours per household.',
 'In 1920, about 40% of households had a washing machine, more than the 30% with a vacuum cleaner. Almost none had a refrigerator.',
 'Refrigerator ownership rose fastest. About 55% of households had one in 1940 and 90% in 1960; by 1980, all households had one.',
 'Vacuum cleaner ownership rose more evenly, from 30% in 1920 to 70% in 1960, and reached 100% by 2000.',
 'Washing machine ownership rose less, from 40% to 70% by 1960. It then fell to about 65% in 1980 before rising again to about 75% in 2019.',
 'The second chart moves in the other direction: housework hours fell while appliance ownership rose.',
 'The average housework time per household fell from 50 hours a week in 1920 to 35 in 1940, then to 20 in 1960.',
 'After 1960, housework time fell more slowly: it was 15 hours a week per household in both 1980 and 2000, and 10 hours in 2019.',
];
const vocabulary=[
 v(['illustrate','show','顯示'],['proportion of households owning','percentage of households that owned','擁有家電的家庭比例'],['average time spent on housework each week','average number of housework hours per week','每週平均家務時間']),
 v(['ownership','households owned','擁有率'],['increased','more households owned','上升'],['almost universal','nearly every household had','幾乎家家都有']),
 v(['Meanwhile','At the same time','與此同時'],['fell markedly','fell a lot','大幅下降'],['only 10','only 10','只有十小時']),
 v(['most common appliance','more than the 30% with a vacuum cleaner','最普及家電'],['around','about','約'],['almost no refrigerator ownership','Almost none had a refrigerator','幾乎沒有家庭有冰箱']),
 v(['recorded the sharpest growth','rose fastest','上升最快'],['rising to','households had one','升至'],['before reaching full ownership','by 1980, all households had one','達到百分之百普及']),
 v(['increased more steadily','rose more evenly','上升較穩定'],['climbing from','from','由……上升'],['reaching 100%','reached 100%','達百分之百']),
 v(['By contrast','Washing machine ownership','相比之下'],['grew more modestly','rose less','上升較少'],['dipped','fell','小幅下降'],['recovered','rising again','回升']),
 v(['second chart','second chart','第二張圖'],['opposite pattern','moves in the other direction','相反走勢']),
 v(['Housework declined','average housework time per household fell','家務時間下降'],['hours per week','hours a week','每週時數'],['then fell further','then to','其後進一步下降']),
 v(['Thereafter','After 1960','其後'],['decrease was slower','fell more slowly','下降較慢'],['reaching 15 hours','was 15 hours','達十五小時'],['before dropping to 10','and 10 hours','其後降至十小時']),
];
const structures=[
 f('The two line charts illustrate changes in the proportion of homes with three internet devices and the average time spent online each week in one country from 2000 to 2020.','同時介紹兩張圖的不同量度系列與相同期間',[1,3,7],{formula:'The two line charts illustrate changes in [第一圖的比例] and [第二圖的平均時間] in [地點] from [起年] to [末年]',meaning:'第一圖為三種家電的家庭擁有百分比；第二圖為每戶每週平均家務時數，期間 1920–2019。',usage:'兩張圖的縱軸單位不同時，引言須分別說明百分比與每週時數，不能把數值互比。',parts:[link('The two line charts illustrate changes in'),slot(' the proportion of households owning three electrical appliances','第一圖的比例'),link(' and'),slot(' the average time spent on housework each week','第二圖的平均時間'),link(' in'),slot(' one country','地點'),link(' from'),slot(' 1920','起年'),link(' to'),slot(' 2019.','末年')]}),
 f('Overall, ownership of all three devices increased, with laptops and tablets becoming almost universal by the end of the period.','概覽三個比例系列都上升，並指出其中兩類期末接近全覆蓋',[0,4,8],{formula:'Overall, ownership of all three [物品] increased, with [兩項] becoming almost universal by the end of the period',meaning:'三種家電擁有率整體上升；冰箱和吸塵機到期末接近或達到所有家庭都有。',usage:'多個系列皆上升時，仍應指出哪些系列真正接近 100%；洗衣機期末只有約 75%。',parts:[link('Overall, ownership of all three'),slot(' appliances','物品'),link(' increased, with'),slot(' refrigerators and vacuum cleaners','兩項'),link(' becoming almost universal by the end of the period.')]}),
 f('Meanwhile, weekly reading time fell markedly, from 50 hours to only 10.','用 Meanwhile 對照第二張圖的相反長期方向與起終值',[1,5,9],{formula:'Meanwhile, weekly [活動時間] fell markedly, from [起始時數] to only [末時數]',meaning:'每戶每週平均家務時間由 1920 年 50 小時降至 2019 年約 10 小時。',usage:'兩張圖一升一降可並列概覽，但並列並不能證明家電增加導致家務減少。',parts:[link('Meanwhile, weekly'),slot(' housework','活動時間'),link(' fell markedly, from'),slot(' 50 hours','起始時數'),link(' to only'),slot(' 10.','末時數')]}),
 f('In 2000, microwave ovens were the most common appliance, at around 40%, compared with 30% for dishwashers and almost no air-conditioner ownership.','比較第一圖起點三個百分比和初期幾乎為零的類別',[0,5,8],{formula:'In [起年], [甲] were the most common, at around [值], compared with [乙值] for [乙] and almost no [丙] ownership',meaning:'1920 年洗衣機約 40%、吸塵機 30%，冰箱幾乎 0%。',usage:'三個起點值來自同一張百分比圖；「幾乎沒有」對應接近 0%，不是 0 小時。',parts:[link('In'),slot(' 1920','起年'),link(','),slot(' washing machines','甲'),link(' were the most common appliance, at around'),slot(' 40%','甲值'),link(', compared with'),slot(' 30%','乙值'),link(' for'),slot(' vacuum cleaners','乙'),link(' and almost no'),slot(' refrigerator','丙'),link(' ownership.')]}),
 f('The tablet then recorded the sharpest growth, rising to 55% in 2010 and 90% in 2015, before reaching full ownership in 2020.','指出最高增長系列的中途兩值與達到百分之百的年份',[1,3,6],{formula:'The [系列] then recorded the sharpest growth, rising to [兩個中途年份值], before reaching full ownership in [達百年份]',meaning:'冰箱由近零升至 1940 年約 55%、1960 年 90%，1980 年達 100%。',usage:'「全面擁有」代表圖上 100%；必須核對達百年份，勿與吸塵機 2000 年混淆。',parts:[link('The'),slot(' refrigerator','系列'),link(' then recorded the sharpest growth, rising to'),slot(' about 55% in 1940 and 90% in 1960','兩個中途年份值'),link(', before reaching full ownership in'),slot(' 1980.','達百年份')]}),
 f('Laptop ownership increased more steadily, climbing from 30% to 70% between 2000 and 2010 and reaching 100% by 2020.','由起點到中期再到百分之百，強調較平穩的上升',[2,4,9],{formula:'[系列] increased more steadily, climbing from [起點] to [中期值] between [期間] and reaching 100% by [末年]',meaning:'吸塵機由 1920 年 30% 升到 1960 年 70%，2000 年達 100%。',usage:'同樣到 100% 的兩種家電，達到的年份不同；應分別寫出。',parts:[slot('Vacuum cleaners','系列'),link(' increased more steadily, climbing from'),slot(' 30%','起點'),link(' to'),slot(' 70%','中期值'),link(' between'),slot(' 1920 and 1960','期間'),link(' and reaching 100% by'),slot(' 2000.','末年')]}),
 f('By contrast, desktop ownership grew more modestly, from 40% to 70% in 2010, dipped to 65% in 2015, and then recovered to 75% in 2020.','對照未達全覆蓋的第三類，保留中途小跌和期末回升',[2,5,8],{formula:'By contrast, [系列] grew more modestly, from [起點] to [中期值], dipped to [低點], and then recovered to [末值]',meaning:'洗衣機由 40% 升至 1960 年 70%，1980 年回落約 65%，2019 年約 75%。',usage:'第三類期末約 75%，不可稱為普及至全戶；其 1980 年的小跌不能省略。',parts:[link('By contrast,'),slot(' washing machines','系列'),link(' grew more modestly, from'),slot(' 40%','起點'),link(' to'),slot(' 70% in 1960','中期值'),link(', dipped to'),slot(' roughly 65% in 1980','低點'),link(', and then recovered to'),slot(' about 75% in 2019.','末值')]}),
 f('The second graph shows an opposite pattern.','轉到另一張圖及相反方向，但後文須用第二圖單位證明',[0,5,9],{formula:'[另一圖] shows an opposite pattern',meaning:'第一圖家電擁有比例上升；第二圖每戶每週家務時數下降。',usage:'跨圖過渡時只可說方向相反；兩張圖沒有提供家電導致家務減少的因果證據。',parts:[slot('The second chart','另一圖'),link(' shows an opposite pattern.')]}),
 f('Reading time declined from 50 hours per week in 2000 to 35 in 2010, then fell further to 20 by 2020.','按年份列第二張圖前半段連續下降的每週時數',[2,6,9],{formula:'[活動時間] declined from [起年時數] to [中年時數], then fell further to [後年時數]',meaning:'家務時間由 1920 年每週 50 小時降至 1940 年 35 小時、1960 年 20 小時。',usage:'第二圖是每戶每週平均小時數；50、35、20 不是家電擁有百分比。',parts:[slot('Housework','活動時間'),link(' declined from'),slot(' 50 hours per week in 1920','起年時數'),link(' to'),slot(' 35 in 1940','中年時數'),link(', then fell further to'),slot(' 20 by 1960.','後年時數')]}),
 f('Thereafter, the decrease was slower, reaching 15 hours in 2030 and 2040, before dropping to 10 in 2050.','先報較慢下降與兩年持平，再指出期末進一步下降',[1,6,8],{formula:'Thereafter, the decrease was slower, reaching [相同時數] in [兩年], before dropping to [末時數] in [末年]',meaning:'1960 年後家務時間下降較慢：1980、2000 年均 15 小時，2019 年 10 小時。',usage:'兩個年份同為 15 小時可合寫為平台期；後來降至約 10 小時，仍用每週每戶時數。',parts:[link('Thereafter, the decrease was slower, reaching'),slot(' 15 hours','相同時數'),link(' in'),slot(' 1980 and 2000','兩年'),link(', before dropping to'),slot(' 10','末時數'),link(' in'),slot(' 2019.','末年')]}),
];
const intro=[
 quiz('兩張圖的縱軸單位如何不同？',['第一張是擁有家電的家庭百分比；第二張是每戶每週平均家務小時','兩張都是家電銷售數量','第一張是家務時數；第二張是家電價格','兩張都是人口百分比'],'第一圖量度 household percentage，第二圖量度 hours per week per household。'),
 {type:'multi',prompt:'哪兩項可作為雙圖的共同概覽？',detail:'選兩項，再按「確認」。',options:[
  '三種家電擁有比例都上升，冰箱與吸塵機期末接近或達 100%',
  '每戶每週家務時間由約 50 小時降至約 10 小時',
  '家電增加已證明直接造成家務時間下降',
  '洗衣機在 2019 年也達 100% 家庭擁有',
 ],correct:[0,1],why:'兩圖顯示相反方向，並不單憑圖表證明因果；洗衣機期末僅約 75%。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['雙圖介紹','分別界定家電擁有百分比與每戶每週家務時數，交代 1920–2019 年。'],
 ['整體概覽','三種家電擁有率上升，兩種達近全面擁有；家務時數由約 50 降至約 10。'],
 ['家電圖細節','比較 1920 年起點，再按冰箱、吸塵機、洗衣機的不同上升軌跡寫。'],
 ['家務圖細節','列 1920→1940→1960 的較快下降，再寫 1980／2000 平台與 2019 年末值。'],
],'兩張圖單位不同，先分開報告，再用方向上的對照收束。')];
const evidence=[
 quiz('1920 年哪種家電最常見？',['洗衣機約 40%；吸塵機 30%，冰箱幾乎零','冰箱約 40%；洗衣機幾乎零','吸塵機約 100%；洗衣機 30%','三種家電均約 40%'],'洗衣機為 1920 年最高，冰箱幾乎沒有家庭擁有。'),
 quiz('冰箱擁有率何時首次達 100%？',['1980 年','1940 年','1960 年','2000 年'],'冰箱在 1940 年約 55%、1960 年約 90%，1980 年達 100%。'),
 quiz('吸塵機擁有率何時達 100%？',['2000 年','1960 年','1980 年','1920 年'],'吸塵機比冰箱更晚達 100%，2000 年才到頂。'),
 quiz('洗衣機 1960、1980、2019 年分別約多少？',['70%、65%、75%','70%、100%、100%','90%、100%、100%','40%、30%、0%'],'洗衣機 1980 年曾由 70% 略降到約 65%，期末回升至約 75%。'),
 quiz('家務時間 1920、1940、1960 年依次多少？',['每戶每週 50、35、20 小時','50%、35%、20% 的家庭','每戶每週 20、35、50 小時','每戶每月 50、35、20 小時'],'第二圖縱軸是每戶每週平均小時數，前三個年份連續下降。'),
 quiz('1980 與 2000 年的每週家務時間有何關係？',['兩年都約 15 小時，之後 2019 年降至約 10','1980 年 15、2000 年 50','兩年都恰好為零','兩年分別為 15% 與 10%'],'1980、2000 年形成約 15 小時平台，不是百分比。'),
];
const logic=[
 sequence('家電圖：三條比例線各有不同形狀',[
  ['1920 年起點','洗衣機約 40%、吸塵機約 30%、冰箱接近零。'],
  ['冰箱最快','1940 年約 55%，1960 年約 90%，1980 年達 100%。'],
  ['吸塵機較穩','1920 年 30%、1960 年 70%，2000 年達 100%。'],
  ['洗衣機未達全面','1960 年 70%、1980 年約 65%、2019 年約 75%。'],
 ],'100% 的兩條線達頂年份不同；洗衣機中途有小跌且期末只有約 75%。'),
 sequence('家務圖：先快降，再平台，最後再降',[
  ['1920 年','每戶每週約 50 小時。'],
  ['1940 與 1960 年','依次約 35 與 20 小時。'],
  ['1980 與 2000 年','均約 15 小時，下降暫緩。'],
  ['2019 年','約 10 小時。'],
 ],'家務時數與家電比例方向相反，但雙圖本身沒有證明家電普及是下降的原因。'),
];
const transfers=[
 transfer('兩張圖比較 2000 至 2020 年某地三種網絡設備的家庭擁有率，以及每戶每週上網時數。','哪句引言沒有混用兩張圖的單位？',['兩圖分別呈現三種設備的家庭擁有百分比與每戶每週平均上網小時。','兩圖都呈現上網時數的百分比。','第一圖是設備價格，第二圖是設備銷量。','兩圖都只呈現 2020 年數值。'],['百分比與時數各對應正確的圖。','把第二圖的時數誤作百分比。','題目沒有價格或銷量。','圖示整段期間。'],[0],'原文引言分開 proportion of households owning 與 average time spent on housework each week。'),
 transfer('三種設備家庭擁有率都上升，只有 A、B 在期末達近 100%，C 約 75%。','哪項概覽準確？',['三類都更普及，但只有 A、B 到期末接近全面擁有。','三類期末都恰好為 100%。','只有 C 更普及，A、B 下降。','C 期末比 A、B 更普及。'],['保留三線同升與兩線接近 100% 的差別。','C 只有約 75%。','A、B 也上升。','75% 低於近 100%。'],[1],'原文三種家電擁有率上升，冰箱和吸塵機近全面，但洗衣機約 75%。'),
 transfer('另一張圖的每戶每週平均活動時間由 50 小時降至 10 小時。','哪句保留單位和方向？',['該活動每戶每週平均時數由 50 降至約 10 小時。','該活動參與家庭百分比由 50% 降至 10%。','每戶每週平均時數由 10 升至 50。','該活動的平均價格由 50 元降至 10 元。'],['第二圖是時數，且起點高於終點。','把小時誤作百分比。','把時間方向反轉。','圖上不是價格。'],[2],'原文 housework fell markedly, from 50 hours to only 10。'),
 transfer('2000 年設備甲擁有率 40%、乙 30%、丙接近零。','哪項正確比較三個起點？',['甲最普及，乙其次，丙幾乎沒有家庭擁有。','丙最普及，甲幾乎為零。','三類設備在 2000 年都約 40%。','甲有 40 小時、乙有 30 小時。'],['三個百分比同屬第一張圖。','丙接近零。','甲、乙、丙值各異。','擁有率不是每週時數。'],[3],'原文 1920 年洗衣機約 40%、吸塵機 30%、冰箱接近零。'),
 transfer('設備丙由近零升至 2010 年 55%、2015 年 90%，2020 年達 100%。','哪句同時交代中途值與達百年份？',['丙增長最快，至 2010 年約 55%、2015 年 90%，2020 年達全部家庭擁有。','丙在 2010 年已達 100%。','丙在 2020 年仍只有 55%。','丙由 100% 一直降至零。'],['兩個中途百分比與 2020 年達百都正確。','2010 年為 55%。','2020 年為 100%。','方向完全相反。'],[4],'原文冰箱由近零快速升至 1940 年 55%、1960 年 90%、1980 年 100%。'),
 transfer('設備乙 2000 年 30%，2010 年 70%，2020 年達 100%。','哪句按順序寫穩步上升？',['乙由 30% 升至 70%，到 2020 年達 100%。','乙 2000 年已達 100%，之後降至 30%。','乙與丙的達百年份一定相同。','乙全期維持 30%。'],['三個值按年上升且期末達頂。','起終值對調。','題目沒有說丙的達百年份。','2010 年已 70%。'],[5],'原文吸塵機較穩地由 30% 升至 70%，2000 年達 100%。'),
 transfer('設備甲由 40% 升至 70%，中途降到 65%，期末回升至 75%。','哪項不會誤稱甲全期達百？',['甲整體升幅較小，中途略跌，期末約 75%。','甲期末達所有家庭擁有，為 100%。','甲由 70% 一路降至零。','甲從未有任何年份超過 40%。'],['40→70→65→75，升幅較小且中途有回落。','期末只有約 75%。','期末高於起點。','曾到 70%。'],[6],'原文洗衣機漲幅較小、1980 年曾跌至 65%，2019 年約 75%。'),
 transfer('第一圖設備擁有率上升，第二圖家務時數下降。','哪句描述方向但不越界推論原因？',['兩張圖呈現相反方向：設備更普及，家務時數更少。','設備增加已證明直接造成家務時數下降。','設備擁有率與家務時數都是同一單位。','兩圖的數值可以直接相減算出節省多少小時。'],['只陳述兩圖可觀察的相反趨勢。','雙圖同時變化不能單獨證明因果。','第一圖是百分比，第二圖是小時。','不同單位不可直接相減。'],[7],'原文 The second chart shows an opposite pattern；沒有根據圖表聲稱家電是家務下降的唯一原因。'),
 transfer('某地每戶每週平均家務時數 2000 年 50、2010 年 35、2020 年 20。','哪句正確報告第二圖的下降？',['家務時間由每週 50 小時降至 35，後來再降至 20。','家務時間由 50% 降至 20%。','家務時間由 20 升至 50 小時。','設備擁有率由 50% 降至 20%。'],['時數單位和 50→35→20 的方向都正確。','第二圖不是百分比。','起終值顛倒。','題目只給家務時數。'],[8],'原文家務時間 1920、1940、1960 年依次為 50、35、20 小時。'),
 transfer('某地家務時數後期為 15、15、10 小時，對應 2030、2040、2050 年。','哪句表達兩年平台和末年下降？',['2030 與 2040 年都約 15 小時，2050 年再降至 10。','2030 至 2050 年每年都恰好下降 5 小時。','2030 年為 10，2040 與 2050 年都 15。','三個年份都維持 15 小時。'],['兩年持平，期末再下降。','前兩年沒有下降。','把 10 小時錯放到首年。','末年是 10。'],[9],'原文 1980 與 2000 年同為 15 小時，2019 年再降至 10。'),
];
export default {key:'task1-line-graph:5',meta:{topic:'家電擁有率與每戶每週家務時數',summary:'兩張圖單位不同：冰箱、吸塵機及洗衣機擁有百分比整體上升，家務平均時數下降；比較方向但不宣稱因果。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
