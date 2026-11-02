// Task 1 Bar Charts 4: authored from the ownership/renting chart and model report.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀圖表，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
  'The bar chart shows the percentages of households that owned or rented their homes in England and Wales from 1918 to 2011.',
  'Overall, the share of households that owned their homes rose for most of the period, but the share that rented fell.',
  'Both shares were 50% in 1971. After that, ownership became more common, but it fell a little in 2011.',
  'In 1918, nearly 80% of households rented their homes, but only about 22% owned them.',
  'By 1939 and 1953, the share renting had fallen to about 68%, and the share owning had risen to about 31–32%.',
  'The difference became smaller in 1961: about 42% of households owned their homes, while just under 60% rented.',
  'The two shares met in 1971, at exactly 50% each.',
  'After that, ownership rose to about 60% in 1981 and nearly 70% in 2001, its highest point.',
  'But renting fell to just over 30% by 2001.',
  'In 2011, the figures moved back a little: ownership fell to about 64%, while renting rose to about 36%.',
];
const vocabulary=[
  v(['compares','shows','顯示'],['percentages','percentages','百分比'],['owner-occupied','owned','自有住房'],['rented accommodation','rented their homes','租住住房'],['between 1918 and 2011','from 1918 to 2011','1918 至 2011 年間']),
  v(['home ownership','households that owned their homes','自有住房家庭'],['followed a clear upward trajectory','rose','上升'],['whereas','but','而'],['moved in the opposite direction','fell','下降']),
  v(['categories were equal','shares were 50%','兩類比例相同'],['after which','After that','其後'],['became dominant','became more common','變得較常見'],['slipped slightly','fell a little','略微下降'],['final year','2011','最後一年']),
  v(['accounted for by far the larger share','nearly 80% of households rented their homes','佔明顯較大比例'],['just under four fifths','nearly 80%','略低於五分之四'],['ownership stood at only about 22%','only about 22% owned them','自有住房僅約百分之二十二']),
  v(['the rental figure','the share renting','租住比例'],['had fallen to around 68%','had fallen to about 68%','降至約百分之六十八'],['owner-occupation','the share owning','自有住房比例'],['rising to roughly 31–32%','had risen to about 31–32%','升至約百分之三十一至三十二']),
  v(['The gap narrowed further','The difference became smaller','差距進一步收窄'],['owned their homes','owned their homes','擁有自己的住房'],['compared with','while','與……相比'],['just under 60%','just under 60%','略低於百分之六十']),
  v(['The turning point came','The two shares met','出現交叉點'],['both categories','two shares','兩個類別'],['stood at exactly 50%','at exactly 50% each','各佔百分之五十']),
  v(['Thereafter','After that','此後'],['climbed','rose','上升'],['approximately 60%','about 60%','約百分之六十'],['almost 70%','nearly 70%','接近百分之七十'],['reaching its peak','its highest point','達到最高點']),
  v(['By contrast','But','相比之下'],['declined','fell','下降'],['just over 30%','just over 30%','略高於百分之三十']),
  v(['the pattern changed modestly','the figures moved back a little','趨勢輕微逆轉'],['decreased','fell','下降'],['recovered','rose','回升'],['around 36%','about 36%','約百分之三十六']),
];
const structures=[
  f('The line graph compares the percentages of commuters travelling by car and by train in City A between 1990 and 2020.','在引言交代地點、兩個類別、量度單位及時間範圍',[1,4,6],{
    formula:'The [圖表類型] compares [兩個類別的百分比] in [地點] between [起止年份]',meaning:'引言交代英格蘭及威爾斯、擁有或租住兩個住房類別、家庭百分比與 1918 至 2011 年。',usage:'介紹兩個系列隨時間變化的圖表時，須交代比較類別、單位、地點和期間。',
    parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares'),slot(' the percentages of households living in owner-occupied and rented accommodation','兩個類別的百分比'),link(' in'),slot(' England and Wales','地點'),link(' between'),slot(' 1918 and 2011.','起止年份')],
  }),
  f('Overall, car use rose during most years, whereas train use fell.','用 whereas 對照兩個系列在大部分期間的相反方向',[0,3,9],{
    formula:'Overall, [系列甲在大部分期間的走向], whereas [系列乙相反走向]',meaning:'概覽說自有住房在大部分期間上升，租住住房則朝相反方向下降。',usage:'兩個系列長期呈相反走勢時，可在概覽直接對照方向，細節段再交代年份與數值。',
    parts:[link('Overall,'),slot(' home ownership followed a clear upward trajectory for most of the period','系列甲在大部分期間的走向'),link(', whereas'),slot(' renting moved in the opposite direction.','系列乙相反走向')],
  }),
  f('The two transport modes were equal in 2005, after which rail travel became more common, although it dipped in 2020.','指出持平年份、之後的領先者，以及末期的小幅例外',[1,6,8],{
    formula:'[兩個系列在某年持平], after which [其後領先系列], although [末期例外]',meaning:'兩類住房在 1971 年同為 50%；其後自有住房佔優，但最後一年略為下降。',usage:'一個系列超越另一個系列後，仍要交代末期與長期趨勢不同的小幅回落。',
    parts:[slot('The two categories were equal in 1971','兩個系列在某年持平'),link(', after which'),slot(' ownership became dominant','其後領先系列'),link(', although'),slot(' it slipped slightly in the final year.','末期例外')],
  }),
  f('In 1990, bus use made up nearly 80% of journeys, while rail use was only about 20%.','同年對比兩個系列的起始差距',[1,5,7],{
    formula:'In [年份], [較大系列及約數], while [較小系列及約數]',meaning:'1918 年租住約佔四分之五，而自有住房只有約 22%；兩類差距很大。',usage:'首年兩個系列相差甚遠時，在同一句保留各自類別和相同單位，讓差距立即清楚。',
    parts:[link('In'),slot(' 1918','年份'),link(','),slot(' renting accounted for by far the larger share, at just under four fifths of households','較大系列及約數'),link(', while'),slot(' ownership stood at only about 22%.','較小系列及約數')],
  }),
  f('By 2000 and 2005, bus use had fallen to around 60%, with rail use rising to roughly 40%.','用 By 指定兩個時間點，再並列相反的數值變化',[0,3,6],{
    formula:'By [兩個年份], [系列甲] had fallen to [數值], with [系列乙] rising to [數值]',meaning:'1939 和 1953 年租住約降至 68%，自有住房約升至 31–32%。',usage:'兩個鄰近年份的數值相近、兩系列一降一升時，可合併年份以免逐年重複。',
    parts:[link('By'),slot(' 1939 and 1953','兩個年份'),link(','),slot(' the rental figure had fallen to around 68%','系列甲下降及數值'),link(', with'),slot(' owner-occupation rising to roughly 31–32%.','系列乙上升及數值')],
  }),
  f('The gap narrowed further in 2010, when 45% of commuters used buses, compared with 55% using trains.','先說差距收窄，再用同年兩個數值證明',[2,4,8],{
    formula:'The gap narrowed further in [年份], when [甲數值], compared with [乙數值]',meaning:'1961 年自有住房約 42%，租住略低於 60%，兩類差距比早年更小。',usage:'說「差距收窄」時，應緊接同年兩個可比數值，讓讀者核對差距。',
    parts:[link('The gap narrowed further in'),slot(' 1961','年份'),link(', when'),slot(' about 42% of households owned their homes','甲數值'),link(', compared with'),slot(' just under 60% that rented.','乙數值')],
  }),
  f('The turning point came in 2012, when both transport modes stood at exactly 50%.','標出兩個系列相交的時間與相同數值',[0,2,7],{
    formula:'The turning point came in [年份], when both [類別] stood at exactly [相同數值]',meaning:'1971 年是自有與租住比例的交叉點；兩類均為 50%。',usage:'兩個系列恰好相等、其後領先次序改變時，可把該年份作為細節段的轉折點。',
    parts:[link('The turning point came in'),slot(' 1971','年份'),link(', when both'),slot(' categories','兩個類別'),link(' stood at exactly'),slot(' 50%.','相同數值')],
  }),
  f('Thereafter, rail use climbed to 60% in 2015 and nearly 70% in 2020, reaching its peak.','在轉折點後按時間順序列兩個值並指出峰值',[3,5,9],{
    formula:'Thereafter, [系列] climbed to [較早年份數值] and [較後年份數值], reaching its peak',meaning:'自有住房其後於 1981 年約 60%，至 2001 年接近 70% 並達到最高。',usage:'系列在轉折後持續上升時，選兩個代表年份和最高點，避免逐年羅列。',
    parts:[link('Thereafter,'),slot(' ownership','系列'),link(' climbed to'),slot(' approximately 60% in 1981','較早年份數值'),link(' and'),slot(' almost 70% in 2001','較後年份數值'),link(', reaching its peak.')],
  }),
  f('By contrast, bus use declined to just over 30% by 2020.','用 By contrast 轉到另一系列並報告其末段數值',[1,4,6],{
    formula:'By contrast, [相反系列] declined to [約數] by [年份]',meaning:'與自有住房接近 70% 相對，租住住房到 2001 年降至略高於 30%。',usage:'寫完一個系列的高點後，可用 By contrast 對照另一系列同年的低值；年份須相同。',
    parts:[link('By contrast,'),slot(' renting','相反系列'),link(' declined to'),slot(' just over 30%','約數'),link(' by'),slot(' 2001.','年份')],
  }),
  f('In 2025, however, the pattern changed modestly: rail use fell to 64%, while bus use recovered to 36%.','交代最後一年兩個系列小幅反向變化',[2,5,7],{
    formula:'In [最後一年], however, the pattern changed modestly: [領先系列回落], while [另一系列回升]',meaning:'2011 年自有住房略降至約 64%，租住回升至約 36%；保留兩系列仍有差距的事實。',usage:'末年走勢與長期方向相反時，可用 however 提示回調，同時列出兩個末年數值。',
    parts:[link('In'),slot(' 2011','最後一年'),link(', however, the pattern changed modestly:'),slot(' ownership decreased to about 64%','領先系列回落'),link(', while'),slot(' renting recovered to around 36%.','另一系列回升')],
  }),
];
const intro=[
  quiz('圖表的縱軸和兩組柱分別表示甚麼？',[
    '家庭百分比；自有住房與租住住房',
    '家庭實際數目；獨立屋與公寓',
    '房屋價格；英格蘭與威爾斯',
    '每年新建住房數目；擁有者與建造商',
  ],'縱軸是家庭百分比；每一年各有自有住房和租住住房兩根柱。'),
  {type:'multi',prompt:'哪兩項應放進整體概覽？',detail:'選兩項，再按「確認」。',options:[
    '自有住房長期上升、租住長期下降，兩者在 1971 年同為 50%',
    '自有住房在 2001 年最高，但在 2011 年略為下降',
    '1918 年租住住房比例恰好是 100%',
    '自有住房在所有年份都比租住住房多',
  ],correct:[0,1],why:'概覽需抓相反長期走勢、1971 年交叉點，以及末年小幅逆轉；不要把約數寫成極值。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
  ['圖表介紹','交代英格蘭和威爾斯、兩種住房、家庭百分比與 1918 至 2011 年。'],
  ['整體概覽','概括自有住房升、租住降，1971 年相等，末年出現小幅回調。'],
  ['1918 至 1961 年','從租住壓倒性較多寫到兩個系列差距逐步收窄。'],
  ['1971 至 2011 年','標明 50% 交叉點、2001 年自有住房高峰，以及 2011 年兩者反向回調。'],
],'先確定圖表範圍，再抓長期走勢和交叉點，最後按交叉點前後分兩組細節。')];
const evidence=[
  quiz('1918 年哪一類住房佔明顯較大比例？',['租住，略低於 80%；自有約 22%','自有，略低於 80%；租住約 22%','兩類各佔 50%','租住約 60%；自有約 40%'],'1918 年黑色租住柱約 77%，灰色自有柱約 22–23%；原文把租住概括為略低於五分之四。'),
  quiz('1939 年與 1953 年的租住比例大約是多少？',['兩年均約 68%','兩年均約 32%','1939 年約 50%，1953 年約 40%','兩年均接近 80%'],'圖中兩年的租住黑柱高度相近，約 68%；32% 是自有住房比例。'),
  quiz('1961 年兩個系列的差距如何？',['自有約 42%，租住略低於 60%，差距較早年小','自有約 60%，租住約 42%，租住已落後','兩類均為 50%，完全相等','自有約 22%，租住接近 80%，與 1918 年相同'],'1961 年仍由租住領先，但差距已從 1918 年約 55 個百分點縮至約 18 個百分點。'),
  quiz('哪一年兩個系列恰好相等？',['1971 年，兩者均為 50%','1961 年，兩者均為 50%','1981 年，兩者均為 60%','2001 年，兩者均接近 70%'],'兩根柱在 1971 年同到 50%；這是領先次序改變的交叉點。'),
  quiz('自有住房在圖表中何時達到最高？',['2001 年，接近 70%','1981 年，約 60%','1918 年，約 22%','2011 年，約 64%'],'自有住房灰柱於 2001 年最高，接近 70%；2011 年降至約 64%。'),
  quiz('到 2001 年，租住住房大約佔多少？',['略高於 30%','接近 70%','剛好 50%','約 77%'],'2001 年租住黑柱約 31%，與接近 70% 的自有住房形成對照。'),
  quiz('2011 年出現甚麼變化？',['自有約降至 64%，租住約回升至 36%','自有與租住都上升至 70%','兩類再次同為 50%','自有降至 22%，租住升至 77%'],'末年兩個系列都從 2001 年的方向小幅回調；自有仍然佔多數。'),
];
const logic=[
  sequence('交叉點以前：按時間觀察差距如何收窄',[
    ['1918 年起點','租住略低於 80%，自有約 22%；兩者差距最大。'],
    ['1939 和 1953 年','租住約 68%，自有約 31–32%；兩類向中間靠近。'],
    ['1961 年','自有約 42%，租住略低於 60%；差距再次收窄。'],
    ['1971 年','兩類均為 50%，領先次序準備翻轉。'],
  ],'每一步均用同年兩類住房的百分比比較，不把百分比誤作家庭數目。'),
  sequence('交叉點以後：由主導、高峰寫到末年回調',[
    ['1981 年','自有住房約 60%，租住約 40%。'],
    ['2001 年','自有住房接近 70% 達高峰；租住略高於 30%。'],
    ['2011 年','自有住房回落至約 64%，租住回升至約 36%。'],
    ['收束觀察','末年變化未逆轉自有住房高於租住住房的排名。'],
  ],'先報告交叉點後的主導和高峰，再精確說明 2011 年只是小幅回調。'),
];
const transfers=[
  transfer('另一張折線圖比較 A 城 1990 至 2020 年乘車和乘火車通勤者的百分比。','哪句完整交代引言資訊？',[
    '折線圖比較 A 城 1990 至 2020 年乘車和乘火車通勤者的百分比。',
    '折線圖解釋 A 城居民為何討厭火車。',
    '折線圖比較 A 城每日售出多少輛汽車。',
    '折線圖比較多個國家的鐵路票價。',
  ],['兩個系列、百分比、地點和期間都交代清楚。','圖表沒有提供個人原因。','把通勤百分比誤作汽車銷量。','把地點、量度內容與單位都改掉。'],[0],'原文引言明確界定兩類住房、家庭百分比、地點及年份；換圖表時也要保留這些資訊。'),
  transfer('某城乘車通勤比例由 80% 降到 40%，乘火車通勤比例由 20% 升到 60%。','哪句適合概覽兩個長期趨勢？',[
    '整體而言，乘車比例下降，而乘火車比例朝相反方向上升。',
    '整體而言，兩個比例都持續下降。',
    '整體而言，乘車與乘火車始終完全相同。',
    '整體而言，乘車比例上升，而乘火車比例下降。',
  ],['概括兩條曲線的相反方向，細節再報數值。','火車是上升，並非下降。','起點和終點都不相等。','把兩個系列的方向都顛倒。'],[1],'原文用 whereas 對照自有住房長期上升與租住長期下降。'),
  transfer('兩種通勤方式在 2010 年同為 50%；此後火車佔多，但最後一年小幅下跌。','哪項同時保留交叉點、領先者和末期例外？',[
    '兩類於 2010 年持平；其後火車佔多，雖然最後一年略跌。',
    '火車自始至終佔多，2010 年亦有 80%。',
    '兩類於 2010 年持平；其後乘車佔多，火車持續上升。',
    '最後一年火車小幅下跌，足以證明它已跌至零。',
  ],['依次寫 50% 持平、其後排名與末年回落。','抹去 2010 年兩類各 50% 的交叉點。','把其後領先者和末年方向寫反。','小幅下跌不能推論跌至零。'],[2],'原文把 1971 年同為 50%、其後自有住房佔優、2011 年略跌連成一句。'),
  transfer('1990 年乘巴士約 78%，乘火車約 22%。','哪句準確呈現起點差距？',[
    '1990 年巴士佔接近五分之四，而火車只有約 22%。',
    '1990 年火車佔接近五分之四，而巴士只有約 22%。',
    '1990 年兩種方式各佔一半。',
    '1990 年巴士比火車少約 56 個百分點。',
  ],['78% 約為五分之四，並高於 22%。','把巴士與火車的數值對調。','78% 與 22% 不可能各一半。','巴士比火車多約 56 個百分點。'],[3],'原文把 1918 年租住略低於四分之五和自有約 22% 放在同一句。'),
  transfer('巴士比例到 2000 年與 2005 年均約 60%；火車同期約 40%。','哪句可避免重複寫兩個近似年份？',[
    '到 2000 年和 2005 年，巴士已降至約 60%，而火車升至約 40%。',
    '到 2000 年和 2005 年，巴士升至約 60%，火車降至約 40%。',
    '2000 年巴士為 60%，2005 年火車為 60%。',
    '兩年兩種交通方式均佔 100%。',
  ],['相近年份合寫，保留一降一升和兩個類別的值。','把長期方向反寫。','把巴士的 60% 誤給火車。','同年兩個系列約 60% 與 40%，並非各 100%。'],[4],'原文把 1939、1953 年租住約 68% 與自有約 31–32% 合成一句。'),
  transfer('交通方式 A 與 B 原本相差 50 個百分點；2010 年 A 為 45%，B 為 55%。','哪項能以數值支持差距收窄？',[
    '2010 年差距縮至 10 個百分點：A 45%，B 55%。',
    '2010 年差距擴至 55 個百分點：A 45%，B 55%。',
    '2010 年 A 與 B 完全相等，各為 50%。',
    '2010 年 A 為 55%，B 為 45%，因此差距變大。',
  ],['55 減 45 等於 10，比原先 50 個百分點小。','把 10 個百分點錯算成 55。','45% 與 55% 並不相等。','把兩類數值對調，且 10 仍比 50 小。'],[5],'原文說 1961 年差距收窄，緊接自有約 42% 與租住略低於 60% 作證。'),
  transfer('兩條曲線在 2012 年同到 50%，其後原本較低的一條超前。','哪項是報告轉折點的準確寫法？',[
    '轉折點在 2012 年：兩個系列恰好均為 50%。',
    '轉折點在 2012 年：一條為 80%，另一條為 20%。',
    '2012 年後兩條曲線永遠維持 50%。',
    '兩條曲線在 2022 年相交於 50%。',
  ],['兩個系列同年同值，符合交叉點。','80% 與 20% 不相交。','交叉後超前，不會永遠相同。','把交叉年份 2012 改成 2022。'],[6],'原文明確標出 1971 年兩類同為 50%，再處理其後的排名。'),
  transfer('火車比例在 2015 年約 60%，2020 年近 70%，且 2020 年為全期最高。','哪句按時間報告上升與高峰？',[
    '此後火車升至 2015 年約 60%、2020 年近 70%，並在 2020 年達高峰。',
    '此後火車在 2015 年達到近 70% 的全期高峰。',
    '火車由 2015 年的近 70% 降至 2020 年約 60%。',
    '兩年火車比例都低於 30%，無法比較高峰。',
  ],['按 2015 到 2020 的順序列值，再標明高峰。','把 2020 高峰錯移到 2015。','把數值次序和方向都反轉。','與 60% 和近 70% 的已知值矛盾。'],[7],'原文在 1971 年交叉後，依序選 1981 年約 60%、2001 年近 70%，並指出後者最高。'),
  transfer('2020 年火車佔近 70%，同年巴士略高於 30%。','寫完火車後，哪句可對照另一個系列？',[
    '相比之下，巴士到 2020 年降至略高於 30%。',
    '相比之下，巴士到 2020 年升至近 70%。',
    '巴士在 2010 年略高於 30%，與 2020 年無關。',
    '巴士到 2020 年降至零，因此沒有通勤者。',
  ],['同年對照另一系列，保留巴士較低的約數。','把巴士誤寫成火車的高值。','對照須用同一年。','略高於 30% 不是零。'],[8],'原文寫完 2001 年自有住房近 70% 的高點，再用 By contrast 對照租住略高於 30%。'),
  transfer('某圖最後一年：火車由近 70% 降到 64%，巴士由約 31% 升到 36%。','怎樣表述末年小幅回調？',[
    '最後一年走勢略變：火車降至 64%，巴士回升至 36%。',
    '最後一年兩類均上升至 70%。',
    '最後一年巴士成為最多，火車降至 36%。',
    '最後一年兩類完全相等，均為 50%。',
  ],['兩個方向與末年數值都準確，火車仍領先。','火車下降，巴士沒有升至 70%。','64% 的火車仍高於 36% 的巴士。','64% 與 36% 不相等。'],[9],'原文 2011 年自有住房由高峰回落至約 64%，租住回升至約 36%，但領先次序未逆轉。'),
];
export default {key:'task1-bar-charts:4',meta:{topic:'英格蘭和威爾斯家庭自有與租住住房比例',summary:'先抓自有與租住的相反長期走勢，再按 1971 年交叉點分段比較早年差距、2001 年高峰與 2011 年回調。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
