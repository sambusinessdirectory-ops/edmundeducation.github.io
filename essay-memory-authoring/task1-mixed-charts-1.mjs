// Task 1 Mixed Charts 1: Little Chalfont Library, three measures with different denominators.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清三張圖的量度對象和年份，再排列概覽及細節。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The charts show members by age and borrowing by type in 2016, and the number of loans each year from 2007 to 2016.',
 'Overall, most members were adults aged 18 to 64, and most loans were for fiction.',
 'The number of loans went up over the period, although it fell for a short time around 2013.',
 'In 2016, 51% of members were adults aged 18 to 64. Children made up 22%, so the adult share was more than twice as large.',
 'Members aged 13 to 17 made up 15%, and those aged 65 or over made up 12%.',
 'Children’s fiction and adult fiction were each 38% of loans. Together, they were 76% of all loans.',
 'Adult non-fiction was 13% of loans, while children’s non-fiction was only 6%.',
 'Loans for young adults and adult audio books were each 2%; children’s DVDs were only 1%.',
 'There were a little fewer than 16,000 loans in 2007, and about 19,000 in both 2008 and 2009.',
 'Loans were usually above 20,000 from 2010 to 2012. They fell below that level in 2013, then rose to about 21,500 in 2016.',
];
const vocabulary=[
 v(['graphics','charts','圖表'],['summarise','show','概述'],['age profile','members by age','會員年齡分布'],['loan categories','borrowing by type','借閱類別'],['annual loan totals','number of loans each year','每年借閱總數']),
 v(['made up the majority','most','佔大多數'],['dominant','most','最主要'],['type of borrowing','loans','借閱類別']),
 v(['Total lending','number of loans','借閱總數'],['rose across the period','went up over the period','期內上升'],['despite a brief dip','although it fell for a short time','雖曾短暫回落']),
 v(['accounted for','were','佔'],['more than twice the share','more than twice as large','佔比超過兩倍'],['at 22%','made up 22%','為百分之二十二']),
 v(['Young adults','Members aged 13 to 17','十三至十七歲年輕會員'],['people aged 65 or over','those aged 65 or over','六十五歲或以上會員'],['respectively','and','依次分別']),
 v(['Loans were concentrated','loans','借閱集中'],['represented','were','佔'],['together making up just over three quarters','Together, they were 76%','合計百分之七十六，略超四分之三']),
 v(['was next','was 13%','其次佔百分之十三'],['whereas','while','而'],['accounted for only','was only','只佔']),
 v(['stood at','were','為'],['negligible','only 1%','只佔百分之一']),
 v(['Annual loans','loans','每年借閱次數'],['just under 16,000','a little fewer than 16,000','略低於一萬六千'],['about 19,000','about 19,000','約一萬九千']),
 v(['The figure','Loans','借閱數字'],['stayed mostly above','were usually above','大多維持在以上'],['fell slightly below','fell below','稍低於'],['recovered steadily','then rose','之後回升'],['a peak of roughly','about','約達最高點']),
];
const structures=[
 f('The graphics summarise a town library’s membership by age, book types borrowed in one year, and yearly lending across a decade.','用並列清單交代三圖各自的量度對象和時間',[1,3,8],{formula:'The graphics summarise [會員量度], [借閱類別與年份], and [年度總數與期間]',meaning:'年齡圖是 2016 會員比例；類別表是 2016 借閱比例；柱圖是 2007–2016 每年借閱宗數。',usage:'多圖引言逐一說明 measure、unit 和 year；不能把會員百分比當成借閱百分比。',parts:[link('The graphics summarise'),slot(' Little Chalfont Library’s age profile','會員量度'),link(','),slot(' loan categories in 2016','借閱類別與年份'),link(', and'),slot(' annual loan totals from 2007 to 2016','年度總數與期間'),link('.')]}),
 f('Overall, adults aged 25–64 made up the majority of members, while fiction was by far the dominant type of borrowing.','在一個概覽句中對照兩張 2016 比例圖的主要類別',[0,3,5],{formula:'Overall, [最大會員群] made up the majority of members, while [主要借閱類別] was by far the dominant type of borrowing',meaning:'成人 18–64 佔會員 51%；成人及兒童小說各佔借閱 38%，兩者合計佔 76%。',usage:'兩個分句分別指會員及借閱，不可說 51% 是小說借閱比例。',parts:[link('Overall,'),slot(' adults aged 18–64','最大會員群'),link(' made up the majority of members, while'),slot(' fiction','主要借閱類別'),link(' was by far the dominant type of borrowing.')]}),
 f('Total lending rose across the decade, despite a short decline in the middle years.','用 despite 概括長期增長與期間的小回落',[0,4,9],{formula:'Total lending rose across [期間], despite [短暫反向波動]',meaning:'年度借閱由 2007 約 15,700 上升至 2016 約 21,500；2013 略跌。',usage:'despite 後接名詞短語，不是完整 because／although 子句；不能說每一年都上升。',parts:[link('Total lending rose across'),slot(' the period','期間'),link(', despite'),slot(' a brief dip around 2013','短暫反向波動'),link('.')]}),
 f('In 2016, adults aged 25–64 accounted for 60% of members, more than twice the share of children, at 20%.','先報較大比例，再用倍數和較小比例作比較',[0,5,8],{formula:'In 2016, [成人群] accounted for [成人百分比] of members, more than twice the share of children, at [兒童百分比]',meaning:'51% ÷ 22% 約 2.32；只比較同一會員年齡圖的兩群。',usage:'more than twice 指份額的比較；不是成人比兒童多 51 個百分點。',parts:[link('In 2016,'),slot(' adults aged 18–64','成人群'),link(' accounted for'),slot(' 51%','成人百分比'),link(' of members, more than twice the share of children, at'),slot(' 22%','兒童百分比'),link('.')]}),
 f('Young adults and people aged 70 or over were smaller groups, at 16% and 11% respectively.','以 respectively 把兩個年齡群與百分比逐一對上',[0,3,7],{formula:'[年輕組] and [年長組] were smaller groups, at [前者數值] and [後者數值] respectively',meaning:'年輕會員 13–17 歲佔 15%；65 歲或以上佔 12%。',usage:'respectively 按前後順序配對；15% 不是 65+ 的比例。',parts:[slot('Young adults','年輕組'),link(' and'),slot(' people aged 65 or over','年長組'),link(' were smaller groups, at'),slot(' 15%','前者數值'),link(' and'),slot(' 12%','後者數值'),link(' respectively.')]}),
 f('Loans were concentrated in two categories: adventure stories and biographies each represented 39%, together making up just over three quarters of all borrowing.','用冒號點名兩大類，再相加說明總份額',[0,3,6],{formula:'Loans were concentrated in two categories: [兩類小說] each represented [相同份額], together making up [合計份額] of all borrowing.',meaning:'兒童小說 38% + 成人小說 38% = 76%，略多於四分之三。',usage:'兩個類別份額相同時，先列各自比例，再說明合計佔整體多少。',parts:[link('Loans were concentrated in two categories:'),slot(' children’s fiction and adult fiction','兩類小說'),link(' each represented'),slot(' 38%','相同份額'),link(', together making up'),slot(' just over three quarters','合計份額'),link(' of all borrowing.')]}),
 f('Adult non-fiction was next, at 12%, whereas children’s non-fiction accounted for only 5%.','用 whereas 比較同屬非小說的成人與兒童借閱份額',[0,3,5],{formula:'[成人非小說] was next, at [其份額], whereas [兒童非小說] accounted for only [其份額]',meaning:'成人非小說 13%，兒童非小說 6%；兩者分母都是全部借閱。',usage:'was next 指大類排序在兩個 38% 之後；不能誤寫為會員年齡比例。',parts:[slot('Adult non-fiction','成人非小說'),link(' was next, at'),slot(' 13%','其份額'),link(', whereas'),slot(' children’s non-fiction','兒童非小說'),link(' accounted for only'),slot(' 6%','其份額'),link('.')]}),
 f('Young adults and adult audio books stood at 3% each, and children’s DVDs were negligible, at 1%.','把兩個相同小份額合寫，再報最低類別',[0,4,8],{formula:'[兩個小類] stood at [相同份額] each, and [最低類] were negligible, at [最低份額]',meaning:'Young adults 類及成人有聲書各佔借閱 2%；兒童 DVD 佔 1%。',usage:'Young adults 此處是借閱類別名稱，與會員年齡圖的 15% 不同。',parts:[slot('Young adults and adult audio books','兩個小類'),link(' stood at'),slot(' 2%','相同份額'),link(' each, and'),slot(' children’s DVDs','最低類'),link(' were negligible, at'),slot(' 1%','最低份額'),link('.')]}),
 f('Annual loans increased from about 15,700 in 2007 to roughly 19,000 in both 2008 and 2009.','用 from…to…報年度借閱宗數的早期變化',[0,3,9],{formula:'Annual loans increased from [起點宗數] in [起年] to [後段宗數] in [後兩年]',meaning:'2007 低於 16,000；2008、2009 各約 19,000；數字是宗數而非百分比。',usage:'just under 表示低於 16,000；圖柱只能支援約數，不可宣稱精確 15,700。',parts:[link('Annual loans increased from'),slot(' just under 16,000','起點宗數'),link(' in'),slot(' 2007','起年'),link(' to'),slot(' about 19,000','後段宗數'),link(' in'),slot(' 2008 and 2009','後兩年'),link('.')]}),
 f('The figure then stayed mostly above 18,000 until 2015, fell slightly below this level in 2016, and recovered steadily to a peak of roughly 20,000 in 2019.','按「維持、回落、復升」串起柱圖後半段',[0,2,6],{formula:'The figure then stayed mostly above [門檻] until [年份], fell slightly below this level in [低點年], and recovered steadily to a peak of roughly [終點宗數] in [終年]',meaning:'2010–12 多在 20,000 之上；2013 稍低於 20,000；2016 約 21,500 達最高。',usage:'this level 回指 20,000 宗；不可轉成 20,000% 或說 2013 跌至 15,000。',parts:[link('The figure then stayed mostly above'),slot(' 20,000','門檻'),link(' until'),slot(' 2012','年份'),link(', fell slightly below this level in'),slot(' 2013','低點年'),link(', and recovered steadily to a peak of roughly'),slot(' 21,500','終點宗數'),link(' in'),slot(' 2016','終年'),link('.')]}),
];
const intro=[
 quiz('三份資料的量度對象分別是甚麼？',['2016 會員年齡、2016 借閱類別、2007–2016 年度借閱宗數','三張圖全都比較會員年齡','三張圖全都比較借閱者的國籍','三張圖全都記錄每日開放時數'],'圓圖看會員，表格看借閱類別，柱圖看每年借閱宗數。'),
 {type:'multi',prompt:'哪兩項適合放進概覽？',detail:'選兩項，再按「確認」。',options:['成人 18–64 佔會員多數，小說佔借閱大宗','年度借閱整體增加，2013 前後短暫回落','每年借閱都毫無例外地上升','兒童 DVD 是最大的借閱類別'],correct:[0,1],why:'概覽涵蓋兩張 2016 比例資料和跨年趨勢，不把分母混用。'},
];
const route=[sequence('依範文次序，排好四段的多圖報告工作',[
 ['三圖介紹','會員年齡、借閱類別與年度借閱總宗數；交代各自年份。'],
 ['整體概覽','成人會員最多、小說借閱最多，年度宗數大致上升但 2013 回落。'],
 ['2016 比例','先會員 51／22／15／12%，再借閱類別 38／38／13／6／2／2／1%。'],
 ['2007–2016 總數','約 16,000 升至 19,000；2010–12 多在 20,000 上；2013 跌、2016 約 21,500 最高。'],
],'同一百分比只可在同一圖的分母內比較；年度柱圖的單位是借閱宗數。')];
const evidence=[
 quiz('2016 哪組會員最多？',['18–64 歲成人，51%','兒童，51%','65 歲或以上，51%','13–17 歲，51%'],'會員年齡圓圖成人 18–64 的扇區是 51%。'),
 quiz('51% 與 22% 是甚麼關係？',['成人會員佔比超過兒童會員兩倍','兒童會員比成人多 29%','兩者都是借閱類別比例','成人與兒童各佔一半'],'51 ÷ 22 約 2.32，兩者都屬會員圓圖。'),
 quiz('13–17 歲與 65+ 會員依次是多少？',['15% 和 12%','12% 和 15%','38% 和 38%','2% 和 1%'],'圓圖 young adults 15、adults 65+ 12。'),
 quiz('兩種小說類別的借閱合計多少？',['76%','38%','51%','22%'],'兒童小說 38% + 成人小說 38% = 76%。'),
 quiz('成人與兒童非小說借閱依次是多少？',['13% 與 6%','6% 與 13%','15% 與 12%','38% 與 38%'],'表格成人非小說 13%，兒童非小說 6%。'),
 quiz('表格 Young adults 與圓圖 Young adults 如何分辨？',['借閱類別佔 2%；13–17 歲會員佔 15%','兩者都佔 15% 借閱','兩者都佔 2% 會員','兩者都代表年度借閱宗數'],'同名標籤出現在不同圖，分母不同。'),
 quiz('2007 年年度借閱量約是多少？',['略低於 16,000 宗','51% 的會員','38% 的借閱','約 21,500 宗'],'第一條柱剛高於 15,000、低於 16,000。'),
 quiz('哪一年短暫跌至 20,000 宗以下？',['2013 年','2008 年之後每一年','2016 年','2011 年'],'2013 柱略低於 20,000；此前 2010–12 多在門檻上方。'),
 quiz('2016 年的年度借閱量大約是多少？',['21,500 宗，為圖中最高','1%，為圖中最低','13%，與非小說相同','15,000 宗，與 2007 相同'],'2016 柱約 21,500 宗，為十年間最高。'),
];
const logic=[
 sequence('2016：先辨分母，再做比較',[
 ['會員分母','18–64 歲 51%；兒童 22%；13–17 歲 15%；65+ 12%。'],
 ['借閱分母','兒童小說與成人小說各 38%，合計 76%。'],
 ['其他類別','成人非小說 13%；兒童非小說 6%；兩個 2% 類別及 DVD 1%。'],
 ['比較界線','只在同一圖分母內相加；會員比例不能加進借閱比例。'],
 ],'Young adults 同時出現在兩圖；會員 15%，借閱表格中的類別 2%。'),
 sequence('2007–2016：用三段說年度總數',[
 ['起點','2007 年略低於 16,000 宗。'],
 ['早期上升','2008、2009 各約 19,000；2010–12 大多超過 20,000。'],
 ['短暫逆轉','2013 稍低於 20,000，並非整段持續下跌。'],
 ['恢復與終點','隨後復升，2016 約 21,500 宗最高。'],
 ],'柱高支持約數及整體趨勢，不要把略低於門檻寫成精確整數。'),
];
const transfers=[
 transfer('另一所圖書館有 2020 會員年齡圖、2020 借閱種類表及 2010–2020 年度宗數圖。','哪個引言完整且分清三項量度？',['圖表概述 2020 會員年齡、當年借閱類別，以及 2010–2020 年每年借閱宗數。','圖表只展示會員年齡，並沒有借閱資料。','圖表把年度借閱宗數當成會員百分比。','圖表比較三所圖書館的地理位置。'],['三項資料及時間各有交代。','遺漏兩圖。','混淆單位。','沒有地理資料。'],[0],'原文引言分別交代 age profile、loan categories in 2016、annual loan totals。'),
 transfer('某圖書館會員最大群為成人，借閱類別以小說為主。','哪句概覽不混用分母？',['成人佔會員多數，而小說是借閱最多的類別。','小說佔會員多數，成人是最大的書籍類別。','成人的會員比例等於小說的借閱比例。','年度借閱總數只包括成人小說。'],['分句各指一圖的量度。','會員和借閱分類互換。','沒有相等證據。','年度總數含多類。'],[1],'原文 Overall 成人 members 最多、fiction borrowing 最多。'),
 transfer('年度借閱量從 2007 至 2016 整體增加，但 2013 短暫下跌。','哪句同時保留大方向和例外？',['整段年度借閱量上升，儘管 2013 左右短暫回落。','每一年都持續增加，從未下跌。','整段借閱量持續下降。','圖中只有 2013 一年的資料。'],['總趨勢與局部波動都保留。','忽略 2013。','方向相反。','圖有十年。'],[2],'原文 rose across the period, despite a brief dip around 2013。'),
 transfer('A 組佔 51% 會員，B 組佔 22%。','哪句倍率比較準確？',['A 組會員份額超過 B 組兩倍，兩者分別佔 51% 與 22%。','A 組比 B 組多 51 個百分點。','A 和 B 各佔一半會員。','B 組比 A 組多一倍。'],['51÷22 大於 2，差距是 29 個百分點。','差距不是 51 點。','總和 73%。','大小相反。'],[3],'原文 adults 51%，more than twice children 22%。'),
 transfer('兩組會員依次佔 15% 和 12%。','哪句使用「依次」不配錯數值？',['年輕會員與年長會員分別佔 15% 和 12%。','年輕會員與年長會員分別佔 12% 和 15%。','兩組都佔 15%。','兩組相加成 51%。'],['前者配 15%，後者配 12%。','次序顛倒。','數值不同。','合計 27%。'],[4],'原文 Young adults／65+ at 15% and 12% respectively。'),
 transfer('某館成人小說與兒童小說各佔借閱 38%。','哪句正確給出合計？',['兩種小說各佔 38%，合共佔全部借閱 76%。','兩種小說合共仍只佔 38%。','兩種小說各佔 76%。','兩種小說佔所有會員 76%。'],['同分母兩類相加是 76%。','少加一類。','每類不是 76%。','分母是借閱而非會員。'],[5],'原文 two fiction categories each 38%，together just over three quarters。'),
 transfer('成人非小說佔借閱 13%，兒童非小說佔 6%。','哪句用同一分母作對照？',['成人非小說佔 13%，而兒童非小說只佔 6%。','成人非小說佔會員 13%，兒童非小說佔借閱 6%。','兒童非小說比成人非小說多 7 點。','兩者都是 38% 的小說借閱。'],['兩者均是全部借閱的類別份額。','混用分母。','方向相反。','類別及數值皆錯。'],[6],'原文 adult non-fiction 13%，whereas children’s non-fiction 6%。'),
 transfer('借閱表格列 Young adults 2%，會員圖列 13–17 歲 15%。','哪個解讀沒有把同名項目混為一談？',['借閱表 Young adults 類別佔 2%；會員中的年輕人佔 15%。','年輕會員只有 2%，借閱類別佔 15%。','兩張圖的 2% 和 15% 必須相加。','兩個數字都代表 2016 年度總借閱宗數。'],['同名但圖表分母不同。','數字顛倒。','不可跨分母相加。','兩者都是百分比。'],[7],'原文 Young adults 借閱 2%，另見會員 age profile 15%。'),
 transfer('某館年度借閱由 2007 年略低於 16,000 宗增至 2008、2009 年各約 19,000 宗。','哪句準確表達約數？',['借閱由 2007 年不足 16,000 宗升至隨後兩年各約 19,000 宗。','借閱由 16,000% 升至 19,000%。','2007 年借閱恰好等於 16,000 宗。','2008 年有 19,000 宗，2009 年則降至零。'],['約數、單位與兩年均一致。','宗數不是百分比。','略低於不是等於。','兩年均約 19,000。'],[8],'原文 just under 16,000 in 2007；about 19,000 in 2008 and 2009。'),
 transfer('2010–12 借閱多高於 20,000；2013 略低於 20,000；2016 約 21,500 最高。','哪句能串好門檻、低點與復升？',['數字先多維持在兩萬以上，2013 年略低於此，之後回升至 2016 年約二萬一千五百。','2013 年數字跌至兩千，2016 年仍低於一萬。','2010–12 年全都剛好等於兩萬。','2016 年約 21,500%，是會員比例。'],['此回指兩萬宗，順序和約數準確。','低點與終點錯。','大多高於，不是全都等於。','年度圖是宗數。'],[9],'原文 mostly above 20,000 → 2013 dip → 2016 peak roughly 21,500。'),
];
const balancedTransferOptions=[
 ['三圖呈現2020年會員年齡、借閱類別及2010至2020年借閱宗數。','三圖只呈現2020年會員年齡，沒有其他借閱資料。','三圖把每年借閱宗數都當成會員百分比。','三圖比較三所圖書館的位置、會員及收入。'],
 ['成人佔會員最多，小說則是借閱最多的書籍類別。','小說佔會員最多，成人則是借閱最多的書籍類別。','成人會員份額必然等於小說借閱份額，兩者相同。','年度借閱總數只包含成人小說，其他類別都不計。'],
 ['年度借閱整體增加，但2013年前後曾短暫回落。','年度借閱每一年都增加，2013年也沒有回落。','年度借閱整體持續下降，2013年才短暫上升。','年度圖只顯示2013年，沒有其他年份資料。'],
 ['A佔51%，B佔22%；A的會員份額超過B兩倍。','A佔51%，B佔22%；兩者差距為51個百分點。','A與B各佔會員50%，兩組份額完全相等。','B的會員份額比A多一倍，B才是最大組。'],
 ['年輕會員佔15%，年長會員佔12%，次序清楚。','年輕會員佔12%，年長會員佔15%，次序對調。','年輕與年長會員都佔15%，比例完全相同。','年輕與年長會員合計佔51%，不是27%。'],
 ['兩種小說各佔借閱38%，合計佔全部借閱76%。','兩種小說各佔借閱38%，合計仍只佔38%。','兩種小說各佔借閱76%，合計超過全部借閱。','兩種小說各佔會員38%，合計佔會員76%。'],
 ['成人非小說佔借閱13%，兒童非小說佔借閱6%。','成人非小說佔會員13%，兒童非小說佔借閱6%。','兒童非小說比成人非小說多7個百分點。','兩者都屬小說借閱類別，份額各佔38%。'],
 ['Young adults借閱類別佔2%，年輕會員則佔15%。','年輕會員佔2%，Young adults借閱類別佔15%。','兩圖的2%及15%可以直接相加，得17%。','兩個數字都代表2016年度借閱宗數。'],
 ['2007年借閱不足16,000宗，隨後兩年各約19,000宗。','2007年借閱約16,000%，隨後兩年都約19,000%。','2007年借閱剛好16,000宗，並非略低於此。','2008年借閱約19,000宗，2009年則跌至零。'],
 ['2010至2012年多逾兩萬宗，2013年略低，2016年回升至約21,500宗。','2013年只有兩千宗，2016年仍不足一萬宗。','2010至2012年全都恰好兩萬宗，沒有更高。','2016年借閱約21,500%，屬會員的百分比資料。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-mixed-charts:1',meta:{topic:'Little Chalfont Library：會員、借閱類別與年度借閱量',summary:'三份資料各有分母：2016 會員年齡、2016 借閱類別、2007–2016 年度借閱宗數。成人會員 51%；兩類小說合計 76%；宗數整體上升而 2013 短暫回落。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
