// Task 1 Pie Charts 6: UK school spending, 1981, 1991, 2001.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先核對三年的五項開支，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The three pie charts show how one UK school spent its yearly budget on five things in 1981, 1991 and 2001.',
 'Overall, teachers’ pay was always the biggest cost. Its share reached its highest point in 1991 and then fell a little.',
 'Insurance was always the smallest cost. Pay for other workers fell each time, while books and furniture moved in different directions.',
 'In 1981, pay for staff was the biggest cost: teachers’ pay was 40% and other workers’ pay was 28%.',
 'In 1991, teachers’ pay rose to 50% of all spending, while pay for other workers fell to 22%. Together, staff pay was 72%.',
 'In 2001, teachers’ pay fell a little to 45% and other workers’ pay fell more to 15%. Together, the two types of pay made 60%.',
 'The other three costs changed in different ways.',
 'Spending on books went up from 15% in 1981 to 20% in 1991, then fell to 9% in 2001.',
 'But furniture and equipment went the other way: its share fell from 15% to 5%, then rose to 23%. It was the second-biggest cost in 2001.',
 'Insurance was the smallest cost in all three years, but its share went up from 2% to 3% and then to 8%.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['allocated','spent','分配／使用'],['annual budget','yearly budget','年度預算'],['across five categories','on five things','分五項']),
 v(['teachers’ salaries','teachers’ pay','教師薪酬'],['consistently','always','一直'],['largest share','biggest cost','最大份額'],['peaked','reached its highest point','達高峰'],['declining slightly','fell a little','略降']),
 v(['Insurance','Insurance','保險'],['remained the smallest item throughout','was always the smallest cost','一直是最小項'],['other workers','other workers','其他員工'],['fell steadily','fell each time','逐次下降'],['material-related categories','books and furniture','物資相關兩項'],['opposite directions','different directions','相反方向']),
 v(['staff pay','pay for staff','員工薪酬'],['dominant expense','biggest cost','主要開支'],['teachers’ salaries','teachers’ pay','教師薪酬'],['other workers’ pay','other workers’ pay','其他員工薪酬']),
 v(['A decade later','In 1991','十年後'],['half of total expenditure','50% of all spending','總開支一半'],['other employees','other workers','其他員工'],['staff costs together accounted for','Together, staff pay was','薪酬合計佔']),
 v(['By 2001','In 2001','到 2001 年'],['the former','teachers’ pay','前者／教師薪酬'],['eased','fell a little','略降'],['the latter','other workers’ pay','後者／其他員工薪酬'],['dropped more sharply','fell more','降幅較大'],['combined salary share','two types of pay','合計薪酬份額']),
 v(['remaining items','other three costs','其餘三項'],['changed unevenly','changed in different ways','變化不一']),
 v(['Resources such as books','Spending on books','書籍等資源'],['increased','went up','上升'],['before falling','then fell','其後下降']),
 v(['In contrast','But','相反'],['furniture and equipment','furniture and equipment','家具及設備'],['opposite path','other way','相反走勢'],['climbed','rose','上升'],['second-largest item','second-biggest cost','第二大開支']),
 v(['Insurance','Insurance','保險'],['always the smallest category','smallest cost in all three years','三年均最小'],['rose steadily','went up','持續上升'],['finally','then','最後']),
];
const structures=[
 f('The three pie charts compare how a college allocated its annual budget across five categories in 1990, 2000 and 2010.','引言交代三張圖、機構、五類預算與三年份',[2,4,8],{formula:'The [三圖] compare how [機構] allocated its annual budget across [類別數] in [年一], [年二] and [年三]',meaning:'三張圖比較某英國學校 1981、1991、2001 年五類年度開支份額。',usage:'每張圖是一年內總開支的分配；百分比不是英鎊金額，也不是學生人數。',parts:[link('The'),slot(' three pie charts','三圖'),link(' compare how'),slot(' a UK school','機構'),link(' allocated its annual budget across'),slot(' five categories','類別數'),link(' in'),slot(' 1981','年一'),link(','),slot(' 1991','年二'),link(' and'),slot(' 2001.','年三')]}),
 f('Overall, teachers’ salaries consistently took the largest share of spending, although this figure peaked in 2000 before declining slightly.','概覽指出同項三年皆首位，但中間年達峰後回落',[0,4,7],{formula:'Overall, [項目] consistently took the largest share of spending, although this figure peaked in [中間年] before declining slightly',meaning:'教師薪酬 40→50→45%，三年都最大，但 1991 年最高。',usage:'consistently largest 是逐年排名；peaked then declined 是同項跨年趨勢，兩者可同時成立。',parts:[link('Overall,'),slot(' teachers’ salaries','項目'),link(' consistently took the largest share of spending, although this figure peaked in'),slot(' 1991','中間年'),link(' before declining slightly.')]}),
 f('Maintenance remained the smallest item throughout, while spending on office staff fell steadily and the two material-related categories moved in opposite directions.','概覽同時分清最小項、持續下降項與兩項反向走勢',[1,5,8],{formula:'[最小項] remained the smallest item throughout, while spending on [下降項] fell steadily and the two material-related categories moved in opposite directions',meaning:'保險 2→3→8% 始終最小；其他員工薪酬 28→22→15%；書籍 15→20→9% 與家具 15→5→23% 相反。',usage:'保險自身上升但每年排名仍最小；material-related 指書籍資源與家具設備。',parts:[slot('Insurance','最小項'),link(' remained the smallest item throughout, while spending on'),slot(' other workers','下降項'),link(' fell steadily and the two material-related categories moved in opposite directions.')]}),
 f('In 1990, staff pay was the dominant expense, with teachers’ salaries at 42% and other workers’ pay at 25%.','用同一年兩項員工薪酬配值支持主要開支',[0,5,7],{formula:'In [年份], staff pay was the dominant expense, with teachers’ salaries at [教師值] and other workers’ pay at [其他值]',meaning:'1981 年教師薪酬 40%、其他員工 28%，兩項合計 68%。',usage:'staff pay 是兩種薪酬的概括；40% 和 28% 不能對調，也不能寫成排外的單一類別。',parts:[link('In'),slot(' 1981','年份'),link(', staff pay was the dominant expense, with teachers’ salaries at'),slot(' 40%','教師值'),link(' and other workers’ pay at'),slot(' 28%.','其他值')]}),
 f('A decade later, teachers’ salaries rose to half of total expenditure, while spending on other employees fell to 20%, so staff costs together accounted for 70%.','中間年一項上升、一項下降，再合計兩種薪酬',[1,3,8],{formula:'A decade later, teachers’ salaries rose to half of total expenditure, while spending on other employees fell to [其他值], so staff costs together accounted for [合計值]',meaning:'1991 年教師薪酬 50%、其他員工 22%，合計 72%。',usage:'半數=50%；50+22=72%，不是把 1981 年的 28% 或 2001 年的 15% 加入。',parts:[link('A decade later, teachers’ salaries rose to half of total expenditure, while spending on other employees fell to'),slot(' 22%','其他值'),link(', so staff costs together accounted for'),slot(' 72%.','合計值')]}),
 f('By 2010, the former had eased to 44% and the latter had dropped more sharply to 16%, reducing the combined salary share to 60%.','用 former/latter 回指教師與其他員工，報告末年合計下降',[0,4,8],{formula:'By [末年], the former had eased to [教師值] and the latter had dropped more sharply to [其他值], reducing the combined salary share to [合計值]',meaning:'2001 年教師 45%、其他員工 15%，合計 60%，低於 1991 年 72%。',usage:'former 指前句先提的教師薪酬，latter 指其他員工薪酬；45+15=60%。',parts:[link('By'),slot(' 2001','末年'),link(', the former had eased to'),slot(' 45%','教師值'),link(' and the latter had dropped more sharply to'),slot(' 15%','其他值'),link(', reducing the combined salary share to'),slot(' 60%.','合計值')]}),
 f('The remaining three items changed unevenly.','由薪酬段轉到其餘費用的不同走勢',[1,4,8],{formula:'The remaining [其餘項目] changed unevenly',meaning:'薪酬兩項已述，另有書籍資源、家具設備、保險三項；走勢各異。',usage:'remaining items 是五項扣去教師及其他員工兩項；不是說三項份額不加總 100%。',parts:[link('The remaining'),slot(' items','其餘項目'),link(' changed unevenly.')]}),
 f('Resources such as books increased from 12% in 1990 to 21% in 2000, before falling to 10% in 2010.','按三年份報告先升後降的書籍資源',[1,5,9],{formula:'Resources such as books increased from [初值] in [年一] to [峰值] in [年二], before falling to [末值] in [年三]',meaning:'書籍資源 1981 年 15%、1991 年 20%、2001 年 9%，先升後降。',usage:'不能只比較起點與終點而漏掉 1991 年峰值 20%。',parts:[link('Resources such as books increased from'),slot(' 15%','初值'),link(' in'),slot(' 1981','年一'),link(' to'),slot(' 20%','峰值'),link(' in'),slot(' 1991','年二'),link(', before falling to'),slot(' 9%','末值'),link(' in'),slot(' 2001.','年三')]}),
 f('In contrast, furniture and equipment followed the opposite path: it fell from 14% to 6%, then climbed to 24%, becoming the second-largest item in 2010.','以書籍為對照，說明家具先跌後升及末年第二',[1,4,7],{formula:'In contrast, [項目] followed the opposite path: it fell from [初值] to [谷值], then climbed to [末值], becoming the second-largest item in [末年]',meaning:'家具設備 15→5→23%，與書籍的先升後降相反；2001 年僅次於教師 45%。',usage:'末年家具 23% 高於其他員工 15%、書籍 9%、保險 8%；因此是第二，不是第一。',parts:[link('In contrast,'),slot(' furniture and equipment','項目'),link(' followed the opposite path: it fell from'),slot(' 15%','初值'),link(' to'),slot(' 5%','谷值'),link(', then climbed to'),slot(' 23%','末值'),link(', becoming the second-largest item in'),slot(' 2001.','末年')]}),
 f('Insurance, although always the smallest category, rose steadily from 2% to 4% and finally to 7%.','說明每年排名最低與自身持續上升並不矛盾',[1,5,8],{formula:'[項目], although always the smallest category, rose steadily from [初值] to [中值] and finally to [末值]',meaning:'保險 1981／1991／2001 年分別 2%、3%、8%，每年仍是最小費用。',usage:'「一直最小」是每年與其他類別相比；「持續上升」是保險自身跨年比較。',parts:[slot('Insurance','項目'),link(', although always the smallest category, rose steadily from'),slot(' 2%','初值'),link(' to'),slot(' 3%','中值'),link(' and finally to'),slot(' 8%.','末值')]}),
];
const intro=[
 quiz('三個圓餅圖各顯示甚麼？',['一所學校該年總開支在五類中的百分比分配','英國全部學校的人數分配','五類的實際英鎊數額','三個不同國家的開支'],'每張圖是一年的校內總開支；五類百分比加總 100%。'),
 {type:'multi',prompt:'哪兩項最適合放入整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '教師薪酬三年均最大，1991 年達 50% 後略降',
  '保險三年均最小但上升；其他員工薪酬下降；書籍與家具走勢相反',
  '保險由 2% 降至 8%',
  '家具設備三年都居第二',
 ],correct:[0,1],why:'概覽同時交代持續排名及主要走勢；家具只在 2001 年居第二。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代某英國學校三個年份、五項年度開支。'],
 ['整體概覽','教師薪酬一直最大；保險一直最小，其他員工薪酬下降，書籍與家具方向相反。'],
 ['兩類薪酬','1981 年教師／其他員工 40／28%；1991 年 50／22%；2001 年 45／15%。'],
 ['其餘三項','書籍 15→20→9、家具 15→5→23、保險 2→3→8%。'],
],'先把兩種薪酬合在一段，再對照其餘三項；每個百分比要配準年份。')];
const evidence=[
 quiz('教師薪酬三年的份額依次是多少？',['40%、50%、45%','40%、45%、50%','28%、22%、15%','15%、20%、9%'],'教師薪酬每年最大，1991 年達 50%。'),
 quiz('其他員工薪酬三年的份額依次是多少？',['28%、22%、15%','15%、22%、28%','40%、50%、45%','2%、3%、8%'],'其他員工薪酬連續下降。'),
 quiz('1981、1991、2001 年兩類薪酬合計依次是多少？',['68%、72%、60%','72%、68%、60%','40%、50%、45%','28%、22%、15%'],'40+28=68；50+22=72；45+15=60%。'),
 quiz('書籍資源三年如何變化？',['15→20→9%，先升後降','15→5→23%，先降後升','2→3→8%，持續升','28→22→15%，持續降'],'書籍資源在 1991 年 20% 達峰，末年降至 9%。'),
 quiz('家具設備三年如何變化？',['15→5→23%，先降後升','15→20→9%，先升後降','2→3→8%，持續升','40→50→45%，先升後略降'],'家具 1991 年 5% 最低，2001 年升至 23%。'),
 quiz('2001 年第二大開支是哪項？',['家具設備 23%','其他員工薪酬 15%','書籍資源 9%','保險 8%'],'2001 年教師 45% 最大，家具 23% 第二。'),
 quiz('保險為何能「持續上升」又「一直最小」？',['自身由 2→3→8%，但每年都低於當年另外四項','因三年都正好佔 2%','因 2001 年 8% 已超過教師 45%','因保險由 8% 降至 2%'],'跨年趨勢與逐年排名是兩種比較。'),
];
const logic=[
 sequence('先按年份核對每張圖五項合計',[
  ['1981','教師 40、其他員工 28、書籍 15、家具 15、保險 2%。'],
  ['1991','教師 50、其他員工 22、書籍 20、家具 5、保險 3%。'],
  ['2001','教師 45、其他員工 15、書籍 9、家具 23、保險 8%。'],
  ['每圖分母','五項在該年份加總 100%；圖不提供實際英鎊金額。'],
 ],'不能把不同年份的比例加成某一年的預算。'),
 sequence('再按類別連出三年走勢',[
  ['教師薪酬','40→50→45%，一直最大，中間年達峰。'],
  ['其他員工薪酬','28→22→15%；兩種薪酬合計 68→72→60%。'],
  ['書籍／家具','書籍 15→20→9 先升後降；家具 15→5→23 先降後升。'],
  ['保險','2→3→8%，自身上升，三年仍最小。'],
 ],'先辨別「排名」與「趨勢」，再用同年相加或跨年比較支撐描述。'),
];
const transfers=[
 transfer('三張圖顯示某校在 1990、2000、2010 年把年度預算分給五項用途的比例。','哪句引言交代圖類、機構、類別數與年份？',['三個圓餅圖比較該校三年如何把年度預算分配到五項開支。','三圖顯示全國學校的學生人數。','圖表比較五個國家各自的預算。','圖表解釋學校增加開支的原因。'],['三年、五類、校內預算分配均準確。','分母不是學生人數。','只有一所學校。','沒有原因數據。'],[0],'原文引言界定 UK school、五類、1981／1991／2001 年。'),
 transfer('A 項三年均最大，比例 41→51→46%。','哪句兼顧三年排名與中間年峰值？',['A 一直佔最大份額，2000 年達最高點後略降。','A 到 2010 年才首次成為最大。','A 三年都維持 41%，完全不變。','A 由 51% 持續上升至 46%。'],['一直最大與先升後降可同時成立。','三年均最大。','數值改變。','51→46 是下降。'],[1],'原文教師薪酬 40→50→45%，一直最大但 1991 年峰值。'),
 transfer('B 項 2→3→8% 但每年都最小；C 項持續下降；D、E 走勢相反。','哪句可作概覽而不混淆排名與走勢？',['B 一直最小卻上升，C 逐年下降，而 D、E 方向相反。','B 上升後在末年必定變最大。','C 逐年上升，D、E 完全同步。','B 三年都沒有變化。'],['三項關係按各自維度說準。','上升不保證排名反超。','C 下降且 D/E 相反。','B 2→3→8 有變。'],[2],'原文保險最小但升、其他員工薪酬降、書籍和家具反向。'),
 transfer('首年教師薪酬 42%，其他員工薪酬 25%。','哪句把兩項歸入員工薪酬？',['首年員工薪酬是主要開支，教師佔 42%，其他員工佔 25%。','首年教師只佔 25%，其他員工 42%。','兩類薪酬合計只有 25%。','兩值都屬家具設備。'],['兩種薪酬與數值都配準。','兩值對調。','合計 67%。','用途分類錯。'],[3],'原文 1981 年教師薪酬 40%、其他員工 28%。'),
 transfer('中間年教師薪酬佔 50%，其他員工 20%。','哪句算對合計並保留反向走勢？',['教師薪酬升至一半，其他員工降至 20%，兩項合計 70%。','教師 50% 加其他員工 20%，合計 80%。','教師薪酬只佔 20%，其他員工 50%。','兩項合計 20%。'],['50+20=70%，half=50%。','合計算錯。','兩類數值對調。','20 只屬其他員工。'],[4],'原文 1991 年教師 50%、其他員工 22%，合計 72%。'),
 transfer('末年教師薪酬 44%，其他員工 16%；前句先提教師，後提其他員工。','哪句 former/latter 回指清楚且合計正確？',['前者降至 44%，後者較明顯降至 16%，薪酬合計為 60%。','前者是其他員工 44%，後者是教師 16%。','兩者合計為 44%。','前者與後者都升至 60%。'],['former=教師、latter=其他員工；44+16=60。','回指對調。','漏加 16。','兩者下降。'],[5],'原文 former 教師 45%、latter 其他員工 15%，合計 60%。'),
 transfer('前段已寫教師及其他員工薪酬；還剩書籍、家具、保險。','哪句過渡到其餘項目？',['其餘三項開支的變化並不相同。','其餘五項全都是薪酬。','學校只列出兩類開支。','三項比例在三年中完全一致。'],['五減二等於三，走勢各異。','只有兩項薪酬。','圖有五項。','三項走勢不同。'],[6],'原文 The remaining items 轉向書籍、家具、保險。'),
 transfer('書籍資源由 1990 年 12% 升至 2000 年 21%，2010 年跌至 10%。','哪句保留中間年峰值？',['書籍先由 12% 升至 21%，之後回落至 10%。','書籍由 12% 一路下降至 10%，從未上升。','書籍三年都維持 12%。','書籍在 2010 年達 21%。'],['先升後降與三個值都保留。','2000 年升至 21。','數值有變。','2010 年為 10。'],[7],'原文書籍 15→20→9%，中間年達峰後下降。'),
 transfer('家具 14→6→24%，書籍 12→21→10%；末年教師 44%，家具 24% 次之。','哪句指出兩者方向相反及家具末年排名？',['家具先跌後升，與書籍先升後跌相反，末年成為第二大項。','家具與書籍三年都同向上升。','家具末年 24% 高於教師 44%。','家具由 24% 持續跌至 6%。'],['兩條走勢方向相反，24% 低於 44% 但高於其他項。','走勢相反。','24 小於 44。','數值方向錯。'],[8],'原文家具 15→5→23%，書籍 15→20→9%；家具在 2001 年第二。'),
 transfer('保險在三年分別佔 2%、4%、7%，每年仍是最小用途。','哪句不把自身上升誤寫成排名上升？',['保險由 2% 升至 4%，最後 7%，但始終是最小項。','保險末年 7%，因此必定成最大項。','保險由 7% 降至 2%。','保險三年都正好 2%。'],['自身逐年上升與排名最小可並存。','7% 未必最大，題目說仍最小。','方向相反。','中末年改變。'],[9],'原文保險 2→3→8%，每年仍最小。'),
];
const balancedTransferOptions=[
 ['三張圓餅圖比較該校三年預算如何分配至五項開支。','三個圓餅圖比較全國學校三年的學生人數及比例。','三個圓餅圖比較五個國家三年來各自的總預算。','三個圓餅圖解釋該校三年開支增加的主要原因。'],
 ['A三年都佔最多，中間年達峰後到末年略降。','A到末年才首次居首，中間年份額仍然最低。','A三年都維持41%，份額完全沒有任何改變。','A由51%持續上升至46%，沒有出現任何下降。'],
 ['B始終最小卻逐年上升，C下降，D與E走勢相反。','B上升後必然到末年最多，C及D都持續下降。','C逐年上升，而D與E每年的走勢完全相同。','B在三個年份都維持2%，份額沒有改變。'],
 ['教師佔42%、其他員工25%，兩項薪酬合佔67%。','教師佔25%、其他員工42%，兩項數值對調。','教師與其他員工薪酬加起來只有25%。','教師及其他員工兩項都屬家具設備。'],
 ['教師由42%升到50%，其他員工由25%降至20%，合計70%。','教師50%加其他員工20%，兩項合計80%。','教師只佔20%，其他員工則佔50%，高低對調。','兩項員工薪酬合計只佔20%，並非70%。'],
 ['前者教師降至44%，後者其他員工降至16%，合計60%。','前者其他員工升至44%，後者教師降至16%，合計60%。','前者教師降至44%，後者員工16%，合計只有44%。','前者與後者都升至60%，兩項的份額完全相同。'],
 ['其餘三項開支的變化不同，接下來逐一比較。','其餘五項開支都屬薪酬，接下來逐一比較。','學校僅列兩類開支，接下來沒有其他類別。','其餘三項在三年都相同，沒有任何變化。'],
 ['書籍先由12%升至21%，其後又回落至10%。','書籍由12%一路下降至10%，中間沒有回升。','書籍三個年份都維持12%，完全沒有變化。','書籍在末年達21%，成為三年中的峰值。'],
 ['家具先跌後升，書籍相反；家具期末第二。','家具與書籍都同步上升，家具期末第二。','家具末年24%高於教師44%，因此成為第一。','家具從24%持續下跌至6%，期末排在最後。'],
 ['保險由2%升至4%再到7%，但三年始終最小。','保險末年升至7%，因此到末年已是最大項。','保險由7%逐年降至2%，末年成為最小。','保險三個年份都佔2%，份額完全沒有改變。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
transfers[4].context='首年教師薪酬 42%、其他員工 25%；中間年教師薪酬 50%、其他員工 20%。';
transfers[5].context='中間年教師薪酬 50%、其他員工 20%；末年分別為 44%、16%。前句先提教師，再提其他員工。';
export default {key:'task1-pie-charts:6',meta:{topic:'英國某校 1981、1991、2001 年五項年度開支',summary:'教師薪酬始終最大但中間年達峰；保險始終最小卻上升，其他員工薪酬下降，書籍與家具走勢相反。嚴格按年份配值。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
