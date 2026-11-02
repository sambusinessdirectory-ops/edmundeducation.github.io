// Task 1 Pie Charts 3: British students' additional languages, 2000 and 2010.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先核對兩個年份的類別與比例，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two pie charts show which languages students at one university in England could speak in addition to English in 2000 and 2010.',
 'Overall, more students could speak at least one extra language: the share with no other language fell a lot, while the shares for Spanish only, another language and two other languages went up.',
 'Spanish only was still the largest group in both years.',
 'In 2000, the Spanish-only group was the biggest, at 30% of students.',
 'The next biggest group was students with no other language. They were 20% of all students.',
 'French only and another language were both 15%. German only and two other languages were the smallest groups, both at 10%.',
 'In 2010, Spanish only was still ahead of the other groups, rising to 35%.',
 'The share speaking another language went up from 15% to 20%. The share speaking two other languages rose by five percentage points to 15%.',
 'But the share with no other language fell by half to 10%. French only also fell to 10%.',
 'German stayed at 10%.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['according to','which languages','按可說的語言分類'],['additional language or languages','languages','額外語言'],['besides English','in addition to English','英語以外']),
 v(['became more likely to speak','more students could speak','更可能會說'],['no additional language','no other language','沒有額外語言'],['fell markedly','fell a lot','明顯下降'],['all increased','went up','均上升']),
 v(['Spanish','Spanish only','只會西班牙語'],['remained','still','仍然'],['dominant category','largest group','最大類別']),
 v(['accounted for','was','佔'],['largest segment','biggest','最大組別'],['Spanish only','Spanish-only group','只會西班牙語組']),
 v(['This was followed by','The next biggest group was','其次為'],['those with no other language','students with no other language','沒有額外語言的學生'],['one fifth','20%','五分之一'],['the total','all students','總數']),
 v(['were equal at','were both','同為'],['whereas','German only and','而'],['smallest categories','smallest groups','最小類別'],['both standing at','both at','兩者均為']),
 v(['By 2010','In 2010','至 2010 年'],['strengthened its lead','still ahead of the other groups','擴大領先'],['rising to','rising to','升至']),
 v(['proportion','share','比例'],['also increased','went up','也上升'],['figure','share','數值／份額'],['grew by','rose by','增加']),
 v(['By contrast','But','相比之下'],['percentage','share','比例'],['no additional language','no other language','無額外語言'],['halved','fell by half','減半'],['same level','10%','同一水平']),
 v(['remained unchanged','stayed','保持不變'],['at 10%','at 10%','維持 10%']),
];
const structures=[
 f('The two pie charts compare students at a university in Country A according to the additional language or languages they could speak besides English in 2005 and 2015.','引言交代兩張圖、學生群體、語言類別和兩年份',[2,4,7],{formula:'The [數量與圖類] compare [學生群體] according to the additional language or languages they could speak besides English in [起年] and [末年]',meaning:'兩圖比較英格蘭一所大學英國學生於 2000、2010 年英語以外能說的語言。',usage:'圖中是英語以外的語言；「no other language」表示只會英語，不是完全不會說話。',parts:[link('The'),slot(' two pie charts','數量與圖類'),link(' compare'),slot(' British students at a university in England','學生群體'),link(' according to the additional language or languages they could speak besides English in'),slot(' 2000','起年'),link(' and'),slot(' 2010.','末年')]}),
 f('Overall, workers became more likely to use at least one digital tool: the share reporting no digital tool fell markedly, while email, video calls and online forms all increased.','概覽同時寫整體方向、下降類別與三個上升類別',[0,4,8],{formula:'Overall, [群體] became more likely to [能力或行為]: the share reporting [沒有的類別] fell markedly, while [三個增加類別] all increased',meaning:'不會額外語言由 20% 降至 10%；只會西班牙語 30→35%、另一語言 15→20%、另外兩語言 10→15%。',usage:'這是學生所屬類別的百分比轉變；不要把「另一種語言」和「另外兩種語言」合成同一類。',parts:[link('Overall,'),slot(' students','群體'),link(' became more likely to'),slot(' speak at least one language besides English','能力或行為'),link(': the share reporting'),slot(' no additional language','沒有的類別'),link(' fell markedly, while'),slot(' Spanish, another language and two other languages','三個增加類別'),link(' all increased.')]}),
 f('French remained the dominant category in both years.','指出同一類別在兩年都佔最大份額',[1,5,8],{formula:'[類別] remained the dominant category in both years',meaning:'只會西班牙語在 2000 年佔 30%、2010 年佔 35%，兩年均最大。',usage:'圖例是 Spanish only，指英語外只會西班牙語；不是所有能說西班牙語的學生總和。',parts:[slot('Spanish','類別'),link(' remained the dominant category in both years.')]}),
 f('In 2005, German only accounted for the largest segment, at 32% of students.','用一個年份與一個百分比支撐最大類別',[0,5,7],{formula:'In [年份], [類別] accounted for the largest segment, at [比例] of [群體]',meaning:'2000 年只會西班牙語為 30%，是六類中最大。',usage:'Spanish only 是一個互斥的圖例類別；只可按該扇區的 30% 報告。',parts:[link('In'),slot(' 2000','年份'),link(','),slot(' Spanish only','類別'),link(' accounted for the largest segment, at'),slot(' 30%','比例'),link(' of'),slot(' students.','群體')]}),
 f('This was followed by those with no extra skill, who made up one quarter of the total.','緊接最大類別交代第二位，並把分數轉成百分比',[0,3,8],{formula:'This was followed by those with [第二位類別], who made up [分數] of the total',meaning:'2000 年不會額外語言佔 20%，即五分之一，居第二。',usage:'one fifth=20%；不要把它與「兩種額外語言」的 10% 混淆。',parts:[link('This was followed by those with'),slot(' no other language','第二位類別'),link(', who made up'),slot(' one fifth','分數'),link(' of the total.')]}),
 f('French only and another language were equal at 18% each, whereas German only and two other languages were the smallest categories, both standing at 8%.','同一句列兩組並列：中間兩類相等，末兩類也相等',[1,3,7],{formula:'[中間兩類] were equal at [中間值] each, whereas [末兩類] were the smallest categories, both standing at [末值]',meaning:'2000 年法語 only／另一語言各 15%；德語 only／另外兩語言各 10%。',usage:'另一語言（單數）和另外兩種語言是不同扇區；15% 與 10% 的並列關係要配準。',parts:[slot('French only and another language','中間兩類'),link(' were equal at'),slot(' 15%','中間值'),link(' each, whereas'),slot(' German only and two other languages','末兩類'),link(' were the smallest categories, both standing at'),slot(' 10%.','末值')]}),
 f('By 2020, Spanish had strengthened its lead, rising to 40%.','同類別跨年升高後仍保持第一',[0,4,9],{formula:'By [末年], [類別] had strengthened its lead, rising to [末值]',meaning:'只會西班牙語由 2000 年 30% 升至 2010 年 35%，仍是最大類別。',usage:'strengthened its lead 需要同時核對本類上升和其餘類別的排名。',parts:[link('By'),slot(' 2010','末年'),link(','),slot(' Spanish','類別'),link(' had strengthened its lead, rising to'),slot(' 35%.','末值')]}),
 f('The proportion speaking another language also increased, from 12% to 18%, while the figure for students able to speak two other languages grew by five percentage points to 13%.','比較兩類的跨年變化，並以百分點表達第二類的增量',[0,3,6],{formula:'The proportion speaking [類別甲] also increased, from [甲起] to [甲末], while the figure for students able to speak [類別乙] grew by [百分點增量] to [乙末]',meaning:'另一語言由 15→20%；另外兩語言由 10→15%，增 5 個百分點。',usage:'百分點是兩個百分比相減；10% 到 15% 是 +5 個百分點，不是增加 5%。',parts:[link('The proportion speaking'),slot(' another language','類別甲'),link(' also increased, from'),slot(' 15%','甲起'),link(' to'),slot(' 20%','甲末'),link(', while the figure for students able to speak'),slot(' two other languages','類別乙'),link(' grew by'),slot(' five percentage points','百分點增量'),link(' to'),slot(' 15%.','乙末')]}),
 f('By contrast, the percentage with no extra skill halved to 12%, and French only fell to the same level.','同時寫一類減半與另一類降至相同末值',[1,5,7],{formula:'By contrast, the percentage with [類別甲] halved to [共同末值], and [類別乙] fell to the same level',meaning:'無額外語言由 20% 減半至 10%；法語 only 由 15% 降至 10%。',usage:'halved 只描述無額外語言 20→10%；法語 15→10% 並非減半，只是降到相同末值。',parts:[link('By contrast, the percentage with'),slot(' no additional language','類別甲'),link(' halved to'),slot(' 10%','共同末值'),link(', and'),slot(' French only','類別乙'),link(' fell to the same level.')]}),
 f('French remained unchanged at 15%.','收束唯一完全沒有改變的類別',[2,4,8],{formula:'[類別] remained unchanged at [兩年同值]',meaning:'只會德語在 2000 和 2010 年均為 10%。',usage:'unchanged 必須兩年份數值相同；不是指某一年內沒有變動。',parts:[slot('German','類別'),link(' remained unchanged at'),slot(' 10%.','兩年同值')]}),
];
const intro=[
 quiz('圖例的 Spanish only 代表甚麼？',['英語以外只會西班牙語的一類學生','所有會說西班牙語的學生，不論是否也會法語','完全不會英語的學生','只說西班牙語的全國人口'],'圖表研究的是英語以外的額外語言；Spanish only 是一個獨立扇區。'),
 {type:'multi',prompt:'哪兩項是兩張圖最明顯的整體變化？',detail:'選兩項，再按「確認」。',options:[
  '無額外語言由 20% 降至 10%；三類會額外語言的份額上升',
  'Spanish only 在兩年都是最大類別，30% 升至 35%',
  'German only 由 10% 升至 35%，成為最大類別',
  'French only 在 2010 年升至 30%',
 ],correct:[0,1],why:'概覽先說整體更可能會說額外語言，再指出 Spanish only 持續居首。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','界定英格蘭一所大學的英國學生、英語以外語言及 2000／2010 年。'],
 ['整體概覽','無額外語言下降，多個額外語言類別上升；Spanish only 仍最大。'],
 ['2000 年細節','Spanish only 30%，無額外語言 20%；另兩組分別並列 15% 與 10%。'],
 ['2010 年細節','Spanish only 35%；另一語言 20%、另兩語言 15%；無額外語言和法語降至 10%，德語不變。'],
],'按年份組織六類數據，跨年變化與並列類別要精確配對。')];
const evidence=[
 quiz('Spanish only 在 2000 和 2010 年分別是多少？',['30%、35%','20%、10%','15%、20%','10%、10%'],'Spanish only 的深色大扇區由 30% 增至 35%。'),
 quiz('無額外語言由 2000 到 2010 年如何？',['20% 降至 10%，剛好減半','10% 升至 20%，剛好倍增','15% 降至 10%','兩年都 20%'],'圖例 No other language：2000 年 20%，2010 年 10%。'),
 quiz('2000 年哪些兩類同為 15%？',['French only 與 Another language','German only 與 Spanish only','No other language 與 French only','Spanish only 與 Two other languages'],'2000 年 French only 與 Another language 各 15%。'),
 quiz('2000 年哪些兩類同為 10%？',['German only 與 Two other languages','Spanish only 與 French only','No other language 與 Another language','French only 與 Another language'],'2000 年最小兩類是 German only 及 Two other languages，均 10%。'),
 quiz('2010 年 Another language 與 Two other languages 分別是多少？',['20% 和 15%','15% 和 20%','10% 和 10%','35% 和 30%'],'另一語言 20%；另外兩種語言 15%，類別名稱不可混淆。'),
 quiz('哪個類別兩年都保持 10%？',['German only','French only','No other language','Spanish only'],'German only 在兩張圖都為 10%。'),
 quiz('Two other languages 由 10% 到 15% 增加多少？',['5 個百分點','5% 的相對增幅','15 個百分點','50 個百分點'],'15%−10%=5 個百分點；相對增幅則是 50%。'),
];
const logic=[
 sequence('先按年份核對六個互斥類別',[
  ['2000 年最多','Spanish only 30%；其次無額外語言 20%。'],
  ['2000 年兩組並列','French only／Another language 各 15%；German only／Two other languages 各 10%。'],
  ['2010 年前三類','Spanish only 35%；Another language 20%；Two other languages 15%。'],
  ['2010 年其餘','無額外語言、French only、German only 都是 10%。'],
 ],'「another language」和「two other languages」是兩個不同的圖例類別。'),
 sequence('再按同類別追蹤十年變化',[
  ['上升','Spanish only 30→35；Another language 15→20；Two other languages 10→15。'],
  ['下降','No other language 20→10；French only 15→10。'],
  ['不變','German only 10→10。'],
  ['整體解讀','無額外語言減半；2010 年更大份額的學生可說至少一種額外語言。'],
 ],'由兩張圖比較同一扇區的百分比，再區分「百分點」與「相對百分比」。'),
];
const transfers=[
 transfer('另一圖比較某校學生 2005、2015 年英語以外可說的語言。','哪句引言界定對象、分類和年份？',['兩個圓餅圖按英語以外可說的語言，比較某校學生在 2005 和 2015 年的分布。','兩圖比較全國人口完全不會英語的比例。','圖表顯示該校學生的英語考試分數。','圖表解釋學生選修語言的原因。'],['對象、語言類別、兩年份都交代。','分母是該校學生，不是全國人口。','圖中是額外語言類別。','沒有原因資料。'],[0],'原文引言界定英格蘭一所大學、英語以外語言、2000 和 2010 年。'),
 transfer('某校無額外語言由 24% 降至 12%；三個有額外語言類別都上升。','哪句概覽保留這個方向？',['會說至少一種額外語言的學生份額增加，而無額外語言的份額明顯下降。','學生在十年間全部變得只會英語。','無額外語言由 12% 升至 24%。','三個有額外語言類別都下降。'],['下降類別與整體方向相符。','有額外語言類別上升。','方向相反。','題目說三類上升。'],[1],'原文無額外語言 20→10%，Spanish only、Another language、Two other languages 上升。'),
 transfer('某校 Spanish only 2005 年 32%、2015 年 38%，兩年均為最大類別。','哪句準確描述排名？',['Spanish only 在兩年都維持為最大類別。','Spanish only 只在首年最大，末年最小。','Spanish only 兩年都佔全部學生。','Spanish only 在兩年都與每類並列第一。'],['兩年最大，數值亦由 32 升至 38。','末年仍最大。','38% 不等於全體。','題目沒有並列。'],[2],'原文 Spanish only 在 2000 年 30%、2010 年 35%，兩年均最大。'),
 transfer('2005 年 Spanish only 為 32%，其餘五類均低於 32%。','哪句以數值支撐首位？',['2005 年 Spanish only 以 32% 成為最大類別。','2005 年 Spanish only 以 12% 成為最小類別。','其餘五類均佔 32%。','2015 年 Spanish only 恰好 32%。'],['年份、類別、百分比及排名俱準確。','數值錯且排名相反。','其餘類別低於 32%。','題目只給 2005 年。'],[3],'原文 2000 年 Spanish only 30%，最大扇區。'),
 transfer('最大類別佔 32%；第二位「無額外語言」佔 25%。','哪句將第二位的 25% 說準？',['其次是無額外語言的學生，佔總數四分之一。','無額外語言以 32% 居首。','第二位只佔十分之一。','無額外語言佔全部學生。'],['四分之一就是 25%，且排名第二。','最大類別另有其人。','十分之一是 10%。','25% 不是全部。'],[4],'原文第二位無額外語言佔 one fifth，即 20%。'),
 transfer('A、B 各 17%，C、D 各 9%；C、D 是最小類別。','哪句正確處理兩組並列？',['A、B 同為 17%；C、D 同為最少的 9%。','A、B 分別為 17%、9%。','C、D 同為 17%，是最大類別。','四類完全相同。'],['兩組相同值和最小排名都保留。','B 應是 17%。','C、D 是 9%。','17 與 9 不同。'],[5],'原文 2000 年法語 only／另一語言各 15%，德語 only／另兩語言各 10%。'),
 transfer('領先類別由 32% 升至 38%，到末年仍第一。','哪句同時表達升幅與排名？',['到末年，該類升至 38%，進一步擴大領先。','末年該類跌至 32%，不再領先。','38% 代表所有類別加總。','該類兩年完全沒有變化。'],['升至較高末值且仍居首。','方向與末值不符。','單類不是總和。','32 與 38 不同。'],[6],'原文 Spanish only 由 30% 升至 35%，仍居首。'),
 transfer('A 類由 12% 升至 18%；B 類由 8% 升至 13%。','哪句正確使用百分點？',['A 上升 6 個百分點，B 上升 5 個百分點。','A 上升 12 個百分點，B 上升 8 個百分點。','A 和 B 都增加 5% 的相對比例。','A 與 B 的比例都下降。'],['18−12=6；13−8=5，單位是百分點。','起點不是增量。','相對增幅分別為 50% 與 62.5%。','兩者都上升。'],[7],'原文另一語言 15→20%，另兩語言 10→15%，後者增 5 個百分點。'),
 transfer('無額外語言由 24% 降至 12%；法語 only 由 18% 降至 12%。','哪句只把「減半」用在正確類別？',['無額外語言減半至 12%，法語 only 也下降至同一水平。','無額外語言與法語 only 都減半。','法語 only 由 18% 上升至 24%。','無額外語言在末年仍有 24%。'],['24→12 減半；18→12 只是下降。','18 的一半是 9。','法語方向相反。','末年是 12%。'],[8],'原文無額外語言 20→10% 減半；法語 15→10%，並非減半。'),
 transfer('German only 在 2005 與 2015 年都佔 10%。','哪句不誤寫成上升或下降？',['German only 保持在 10%，沒有變化。','German only 由 10% 翻倍至 20%。','German only 下降了 10 個百分點。','German only 由 20% 降至 10%。'],['兩年同為 10%，故 unchanged。','末年不是 20%。','比例沒有下降。','首年不是 20%。'],[9],'原文 German only 在 2000／2010 年均為 10%。'),
];
export default {key:'task1-pie-charts:3',meta:{topic:'英格蘭某大學學生 2000 與 2010 年的額外語言',summary:'Spanish only 兩年最大；無額外語言減半；三個有額外語言類別上升，French only 下降、German only 不變。精確處理並列與百分點。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
