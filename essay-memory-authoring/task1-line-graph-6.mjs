// Task 1 Line Graph 6: Caribbean-island tourists, in millions; total = cruise + island stay.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows how many tourists visited a Caribbean island from 2010 to 2017. It separates people who stayed on cruise ships from people who stayed on the island.',
 'Overall, the total number of visitors rose a lot, from 1 million to 3.5 million—more than three times the starting number.',
 'At first, more visitors stayed on the island than on cruise ships. But the cruise group grew much faster and was the larger group in 2017.',
 'In 2010, 1 million people visited the island, and about three quarters of them stayed on the island.',
 'The total rose steadily to 2 million in 2013, when 1.5 million visitors stayed on the island.',
 'Early on, the cruise-ship number went up and down: it rose from 250,000 in 2010 to 500,000 in 2011, then fell back to 250,000 in 2012.',
 'From 2014, cruise passengers accounted for most of the rise in the total.',
 'The cruise group rose from 1 million in 2014 to 1.5 million in 2016, becoming larger than the island-stay group. It reached 2 million in 2017.',
 'But the number staying on the island was near 1.5 million after 2013, except for a small fall in 2016.',
 'As a result, the total was about 2.75 million in both 2015 and 2016, then jumped to 3.5 million in 2017.',
];
const vocabulary=[
 v(['illustrates','shows','顯示'],['tourist numbers','how many tourists','遊客人數'],['separating','separates','分開'],['accommodated on the island','stayed on the island','留宿島上']),
 v(['total arrivals','total number of visitors','遊客總數'],['rose substantially','rose a lot','大幅上升'],['more than tripling','more than three times the starting number','超過起點三倍']),
 v(['Island-based tourists','visitors stayed on the island','留宿島上遊客'],['larger group at first','At first, more visitors stayed on the island','初期較多'],['cruise passengers','cruise group','郵輪旅客'],['grew much faster','grew much faster','增長快得多'],['leading category','larger group','較大類別']),
 v(['attracted','visited','吸引／到訪'],['about three quarters','about three quarters','約四分之三'],['stayed on the island','stayed on the island','留宿島上']),
 v(['total rose steadily','total rose steadily','總數穩步上升'],['island-based tourists','visitors stayed on the island','留宿島上者']),
 v(['Over the same early period','Early on','同一早期時段'],['moved unevenly','went up and down','上落不定'],['increasing','rose','上升'],['falling back','fell back','回落']),
 v(['From 2014 onwards','From 2014','自二〇一四年起'],['main driver of growth','accounted for most of the rise','增長主要來源']),
 v(['climbed','rose','上升'],['overtaking','becoming larger than','超越'],['before reaching','reached','之後達到']),
 v(['By contrast','But','相比之下'],['remained close to','was near','維持在接近'],['slight fall','small fall','小幅下降']),
 v(['Consequently','As a result','因此'],['plateaued','was about 2.75 million in both 2015 and 2016','維持同一水平'],['around','about','約'],['rose sharply','jumped','急升']),
];
const structures=[
 f('The line graph illustrates tourist numbers in a coastal city between 2010 and 2020, separating visitors who stayed in hotels from those who stayed with friends.','引言交代總遊客數及兩種互斥留宿類別',[1,3,6],{formula:'The [圖表類型] illustrates tourist numbers in [地點] between [期間], separating [甲類遊客] from [乙類遊客]',meaning:'折線圖以百萬人為單位，記錄 2010–2017 年到訪某加勒比海島的總遊客、郵輪留宿者及島上留宿者。',usage:'有總數線與兩類分項線時，先辨認兩類如何分組；不要把總數再當成第三種遊客相加。',parts:[link('The'),slot(' line graph','圖表類型'),link(' illustrates tourist numbers'),slot(' on a Caribbean island','地點'),link(' between'),slot(' 2010 and 2017','期間'),link(', separating'),slot(' visitors who stayed on cruise ships','甲類遊客'),link(' from'),slot(' those accommodated on the island.','乙類遊客')]}),
 f('Overall, visitor arrivals rose substantially, more than tripling across the period.','概覽以起終值核實總遊客人數超過三倍',[0,4,8],{formula:'Overall, [總數] rose substantially, more than tripling across the period',meaning:'遊客總數由 2010 年 100 萬升至 2017 年 350 萬，為起點 3.5 倍。',usage:'more than tripling 指終點高於起點三倍；先算 3.5 ÷ 1 = 3.5，不是增加 3.5 倍。',parts:[link('Overall,'),slot(' total arrivals','總數'),link(' rose substantially, more than tripling across the period.')]}),
 f('Hotel guests were the larger group at first, but cruise passengers grew much faster and had become the leading category by 2020.','對照初期領先類別與期末被另一類超越的轉變',[1,5,7],{formula:'[甲類] were the larger group at first, but [乙類] grew much faster and had become the leading category by [末年]',meaning:'初期留宿島上者較多，但郵輪旅客升幅更大，至 2017 年超過島上留宿者。',usage:'概覽要分清「起初誰較多」和「期末誰較多」；名次反轉須由末年兩條分項線證實。',parts:[slot('Island-based tourists','甲類'),link(' were the larger group at first, but'),slot(' cruise passengers','乙類'),link(' grew much faster and had become the leading category by'),slot(' 2017.','末年')]}),
 f('In 2010, the city attracted 1 million visitors, about three quarters of whom stayed in hotels.','用同年總量與分項比例建立起點結構',[0,5,8],{formula:'In [起年], [地點] attracted [總數] visitors, about three quarters of whom stayed [甲類]',meaning:'2010 年總遊客約 100 萬，其中約 75 萬留宿島上、25 萬住郵輪。',usage:'「四分之三」由島上約 0.75 百萬除以總數 1 百萬得出；總數和分項要同年比較。',parts:[link('In'),slot(' 2010','起年'),link(','),slot(' the island','地點'),link(' attracted'),slot(' 1 million','總數'),link(' visitors, about three quarters of whom stayed'),slot(' on the island.','甲類')]}),
 f('This total rose steadily to 2 million in 2013, when hotel guests reached 1.5 million.','列總遊客升至二百萬之年及當年主要分項',[2,6,8],{formula:'This total rose steadily to [總值及年], when [甲類] reached [分項值]',meaning:'總數 2013 年增至 200 萬，其中島上留宿者 150 萬，郵輪旅客約 50 萬。',usage:'同一年總數應等於兩類分項之和；2013 年 1.5 + 0.5 = 2 百萬。',parts:[link('This total rose steadily to'),slot(' 2 million in 2013','總值及年'),link(', when'),slot(' island-based tourists','甲類'),link(' reached'),slot(' 1.5 million.','分項值')]}),
 f('Over the same early period, cruise-ship visitors moved unevenly, increasing from 250,000 to 500,000 in 2011 before falling back to 250,000 in 2012.','早段先升後回落至起點，避免寫成持續上升',[2,6,9],{formula:'Over the same early period, [乙類] moved unevenly, increasing from [起點] to [次年值] before falling back to [再下一年值]',meaning:'郵輪旅客 2010 年約 25 萬、2011 年 50 萬、2012 年又回到 25 萬。',usage:'某分項長期增長前仍可能早期波動；250,000 與 500,000 是人數，等於 0.25、0.5 百萬。',parts:[link('Over the same early period,'),slot(' the cruise-ship figure','乙類'),link(' moved unevenly, increasing from'),slot(' 250,000','起點'),link(' to'),slot(' 500,000 in 2011','次年值'),link(' before falling back to'),slot(' 250,000 in 2012.','再下一年值')]}),
 f('From 2014 onwards, cruise passengers became the main driver of growth.','標出總數增長的主要分項及轉折年份',[2,5,8],{formula:'From [年份] onwards, [分項] became the main driver of growth',meaning:'2014 年起郵輪旅客快速增加，是總遊客增長的主要數值來源。',usage:'可從分項與總數線的數值變化說「主要增長來源」，但不要臆測旅客選擇郵輪的原因。',parts:[link('From'),slot(' 2014','年份'),link(' onwards,'),slot(' cruise passengers','分項'),link(' became the main driver of growth.')]}),
 f('Their number climbed from 1 million in 2014 to 1.5 million in 2016, overtaking the hotel-stay group, before reaching 2 million in 2017.','依時間列郵輪分項增長、超越另一分項與末年值',[3,5,9],{formula:'Their number climbed from [起值] to [交叉時值], overtaking [另一類], before reaching [末值]',meaning:'郵輪旅客 2014 年 100 萬、2016 年 150 萬，超越島上留宿者，2017 年增至 200 萬。',usage:'「超越」必須核對同年兩個分項：2016 年郵輪約 1.5，島上約 1.25 百萬。',parts:[link('Their number climbed from'),slot(' 1 million in 2014','起值'),link(' to'),slot(' 1.5 million in 2016','交叉時值'),link(', overtaking'),slot(' the island-based group','另一類'),link(', before reaching'),slot(' 2 million in 2017.','末值')]}),
 f('By contrast, tourists staying in hotels remained close to 1.5 million after 2013, except for a slight fall in 2016.','對照另一分項高位近乎持平與單年小跌',[2,6,9],{formula:'By contrast, [甲類] remained close to [水平] after [年份], except for a slight fall in [例外年]',meaning:'留宿島上者在 2013 年後大多約 150 萬，只有 2016 年小降至約 125 萬。',usage:'「接近 1.5」是近似概括；2016 年例外值不能被抹掉。',parts:[link('By contrast,'),slot(' tourists staying on the island','甲類'),link(' remained close to'),slot(' 1.5 million','水平'),link(' after'),slot(' 2013','年份'),link(', except for a slight fall in'),slot(' 2016.','例外年')]}),
 f('Consequently, total arrivals plateaued at around 2.75 million in 2015 and 2016, then rose sharply to 3.5 million.','用兩年總數平台及末年跳升收束全圖',[1,6,8],{formula:'Consequently, total arrivals plateaued at around [兩年同值], then rose sharply to [末值]',meaning:'總遊客數在 2015、2016 年約同為 275 萬，2017 年再升至 350 萬。',usage:'總數平台可由兩分項一升一跌互相抵消解釋；只說圖中數值關係，不推斷外部原因。',parts:[link('Consequently, total arrivals plateaued at around'),slot(' 2.75 million in 2015 and 2016','兩年同值'),link(', then rose sharply to'),slot(' 3.5 million.','末值')]}),
];
const intro=[
 quiz('圖中三條線的關係是甚麼？',['總遊客數等於郵輪留宿者加島上留宿者','三條線是三種互不相關的遊客','總遊客數應再加郵輪和島上兩類一次','三條線分別是遊客、人均花費、酒店數'],'總數線由兩種留宿方式相加而成；縱軸單位是百萬遊客。'),
 {type:'multi',prompt:'哪兩項是全圖主要特徵？',detail:'選兩項，再按「確認」。',options:[
  '總遊客由 100 萬增至 350 萬，超過三倍',
  '島上留宿者起初較多；郵輪旅客增長較快，到 2017 年成為較大類別',
  '郵輪旅客 2010 年已多於島上留宿者',
  '總遊客 2010 至 2017 年每年增幅完全相同',
 ],correct:[0,1],why:'概覽先寫總量的規模變化及兩種留宿方式的領先次序轉換。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代加勒比海島、2010 至 2017 年、總遊客與兩種留宿方式，單位為百萬人。'],
 ['整體概覽','總數增至 3.5 倍，郵輪旅客由較少變為較多。'],
 ['2010 至 2013 年','寫總數由 1 至 2 百萬、島上留宿者較多，以及郵輪早段小波動。'],
 ['2014 至 2017 年','郵輪旅客快速增加並於 2016 年超越島上留宿者；總數短暫平台後升至 3.5 百萬。'],
],'先辨認總數與兩個分項的加總關係，再依領先次序變化分前後兩段。')];
const evidence=[
 quiz('2010 年總遊客數和島上留宿者約為多少？',['總數 100 萬；島上留宿約 75 萬','總數 350 萬；島上留宿 150 萬','總數 100 萬；島上留宿 25 萬','總數 200 萬；島上留宿 150 萬'],'2010 年總數線約 1 百萬，島上虛線約 0.75 百萬。'),
 quiz('2013 年總數與兩個分項如何相加？',['郵輪約 50 萬 + 島上約 150 萬 = 總數 200 萬','郵輪 150 萬 + 島上 50 萬 = 350 萬','郵輪 100 萬 + 島上 150 萬 = 200 萬','總數 200 萬仍須再加兩個分項'],'總數包含兩個分項；2013 年 0.5 + 1.5 = 2 百萬。'),
 quiz('郵輪旅客 2010、2011、2012 年依次約為多少？',['25 萬、50 萬、25 萬','75 萬、75 萬、125 萬','100 萬、125 萬、150 萬','25 萬、50 萬、100 萬'],'郵輪點線在 2011 年短暫升至 0.5 百萬，2012 年又回到 0.25。'),
 quiz('郵輪旅客何時超越島上留宿者？',['2016 年：郵輪約 150 萬，島上約 125 萬','2010 年：郵輪約 75 萬，島上約 25 萬','2013 年：郵輪約 150 萬，島上約 50 萬','2015 年：兩者都約 275 萬'],'2016 年郵輪約 1.5 百萬，高於島上約 1.25 百萬。'),
 quiz('島上留宿者在 2013 年後大致如何？',['多數年份約 150 萬，2016 年略降至約 125 萬','每年由 150 萬升至 350 萬','2016 年升至 200 萬，2017 年跌至零','2013 年後一直只有 25 萬'],'島上虛線大致平穩，2016 年小幅下跌。'),
 quiz('總遊客在哪兩年都約為 275 萬？',['2015 和 2016 年','2010 和 2011 年','2013 和 2014 年','2016 和 2017 年'],'總數實線在 2015、2016 年有短平台，之後 2017 年升至 3.5 百萬。'),
 quiz('2017 年總數和兩分項如何對應？',['郵輪 200 萬 + 島上 150 萬 = 總數 350 萬','郵輪 150 萬 + 島上 200 萬 = 總數 250 萬','郵輪與島上都 350 萬，總數 700 萬','郵輪 200 萬、島上 150 萬，總數仍 275 萬'],'2017 年 2 + 1.5 = 3.5 百萬，郵輪分項已較大。'),
];
const logic=[
 sequence('早段：總數上升，郵輪分項並非每年增加',[
  ['2010 年','總遊客 100 萬；島上留宿約 75 萬，郵輪約 25 萬。'],
  ['2011 年','郵輪旅客約 50 萬，較上年增加。'],
  ['2012 年','郵輪又降回約 25 萬。'],
  ['2013 年','總數 200 萬 = 島上 150 萬 + 郵輪 50 萬。'],
 ],'總遊客可整體上升，同時其中一個分項短暫回落；兩條分項之和仍要對上總數。'),
 sequence('後段：郵輪增長、類別反轉與總數平台',[
  ['2014 年','郵輪旅客達 100 萬，開始成為增長主要來源。'],
  ['2015–2016 年','總數均約 275 萬；2016 年郵輪約 150 萬，已高於島上約 125 萬。'],
  ['島上留宿者','2013 年後大致約 150 萬，只有 2016 年小降。'],
  ['2017 年','郵輪 200 萬 + 島上 150 萬 = 總數 350 萬。'],
 ],'郵輪分項的增長與島上 2016 年的小降可同時出現，因此總數當年可維持約 275 萬。'),
];
const transfers=[
 transfer('另一張圖有「總訪客」「住酒店」「住朋友家」三條線，後兩類合起來等於總數。','哪句引言準確介紹分項與總量？',['圖表顯示總訪客數，並區分住酒店與住朋友家的訪客。','圖表比較三種彼此獨立、可以全部相加的訪客。','圖表只顯示酒店房價與房間數。','圖表解釋訪客選擇住宿的原因。'],['總數與兩個互斥分項的關係清楚。','總數已包含兩個分項，不能再相加。','圖表主題是訪客數。','沒有原因資料。'],[0],'原文引言將遊客總量分成郵輪與島上留宿兩類。'),
 transfer('某島總遊客由 100 萬升至 350 萬。','「超過三倍」應怎樣驗算？',['350 ÷ 100 = 3.5，期末是起點的 3.5 倍。','350 減 100 = 250，所以期末只有起點 2.5 倍。','350 ÷ 100 = 0.35，因此總數下降。','因為增加 250 萬，所以期末剛好是起點三倍。'],['3.5 百萬除以 1 百萬 = 3.5。','差額與倍數是不同計算。','350 ÷ 100 = 3.5。','期末為 3.5 倍，非剛好三倍。'],[1],'原文 more than tripling 由 1 百萬升至 3.5 百萬支持。'),
 transfer('甲類初期多於乙類；乙類其後增長較快，末年反過來領先。','哪項概覽準確？',['甲初期較大，但乙增長更快，到期末成為較大類別。','甲由始至終都較大，乙沒有增長。','乙初期已領先，其後才被甲超越。','兩類在所有年份都相同。'],['保留初期與末年名次反轉。','末年乙較大。','把初期高低方向反轉。','兩類曾有高低差。'],[2],'原文島上留宿者起初較多，郵輪旅客後來增長較快。'),
 transfer('2010 年總遊客 100 萬，其中住酒店約 75 萬。','哪句正確表示分項佔總數的比例？',['約四分之三訪客住酒店。','只有四分之一訪客住酒店。','住酒店人數是總數的三倍。','總數需再加 75 萬才完整。'],['75 ÷ 100 = 0.75，即四分之三。','25 萬才是四分之一。','分項不能大於總數三倍。','75 萬已包含於總數。'],[3],'原文 2010 年約四分之三遊客留宿島上。'),
 transfer('某年總訪客 200 萬，住酒店 150 萬，住朋友家 50 萬。','哪項加總關係正確？',['150 萬 + 50 萬 = 總數 200 萬。','總數應為 200 + 150 + 50 = 400 萬。','住朋友家有 150 萬，酒店只有 50 萬。','總數只有 50 萬。'],['兩個分項相加恰等於總數。','把總數重複計算。','把兩種住宿數值對調。','50 萬只是其中一個分項。'],[4],'原文 2013 年總數 200 萬，其中島上 150 萬，餘下郵輪約 50 萬。'),
 transfer('郵輪旅客 2010 年 25 萬、2011 年 50 萬、2012 年 25 萬。','哪項描述早段形狀？',['先由 25 萬升至 50 萬，再回落至 25 萬。','每年都由 25 萬穩步升至 75 萬。','先降至零，再升至 50 萬。','三年都完全相同。'],['25→50→25 是先升後回落。','末年又回到 25。','圖上沒有零。','中間年為 50。'],[5],'原文郵輪早段 moved unevenly，不可誤寫為連續上升。'),
 transfer('某島 2014 年後總遊客增長主要由郵輪分項增加提供。','哪句只說圖表能支持的增長來源？',['2014 年起，郵輪旅客成為總遊客增長的主要數值來源。','2014 年起，政府政策一定是郵輪增長的原因。','2014 年起，島上住宿完全停止。','2014 年起，總遊客不再增加。'],['比較分項與總數變化，可指出主要數值來源。','圖表沒有政策因果資料。','島上分項仍有遊客。','總數後來達 350 萬。'],[6],'原文 From 2014 onwards, cruise passengers became the main driver of growth 描述分項貢獻。'),
 transfer('2014 年乙類 100 萬、2016 年 150 萬；2016 年甲類 125 萬；2017 年乙類 200 萬。','哪句準確說超越與期末值？',['乙類 2016 年以 150 萬超過甲類 125 萬，2017 年再達 200 萬。','乙類在 2016 年只有 100 萬，低於甲類。','甲類 2016 年 200 萬，仍高於乙類。','乙類到 2017 年跌至 50 萬。'],['同年 150>125，且乙類末年為 200。','2016 年乙類 150。','甲類 2016 年 125。','2017 年乙類 200。'],[7],'原文郵輪旅客 2016 年超越島上留宿者，2017 年達 200 萬。'),
 transfer('甲類 2013 年後大多約 150 萬，但 2016 年約 125 萬。','怎樣保留近乎持平與單年例外？',['甲類大致維持約 150 萬，只有 2016 年略低。','甲類 2013 年後每年都恰好 150 萬。','甲類 2016 年急升至 350 萬。','甲類由 2013 年起每年減少 50 萬。'],['大致水平及 2016 年小降都保留。','2016 年不是 150。','2016 年只有約 125。','其餘年份約 150。'],[8],'原文島上留宿者 remained close to 1.5 million，except for 2016 的小跌。'),
 transfer('總訪客在 2015、2016 年均約 275 萬，2017 年為 350 萬。','哪句準確描述平台與跳升？',['總數在 2015、2016 年約持平，其後升至 350 萬。','總數 2015、2016 年每年都增加 75 萬。','總數到 2017 年下降至 100 萬。','總數在三年中都恰好 275 萬。'],['兩年相同，第三年增約 75 萬。','前兩年同為 275。','2017 年為 350。','第三年較高。'],[9],'原文總遊客 2015、2016 年 plateaued 約 275 萬，之後升至 350 萬。'),
];
export default {key:'task1-line-graph:6',meta:{topic:'2010 至 2017 年加勒比海島遊客總數及留宿方式',summary:'先核對總數等於郵輪與島上留宿分項相加，再寫總遊客增加 3.5 倍、郵輪旅客由較少變為較多及 2015–2016 年總數平台。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
