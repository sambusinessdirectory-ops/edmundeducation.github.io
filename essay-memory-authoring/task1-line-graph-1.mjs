// Task 1 Line Graph 1: Melbourne social-centre activity participants, 2000–2020.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows how many people took part in five activities at a social centre in Melbourne, Australia, from 2000 to 2020.',
 'Overall, the film club had the most people in every year shown, even though its numbers changed a little.',
 'Table tennis grew much more than the other activities and was second in 2020. Amateur dramatics rose a little at first, then fell and had the fewest people in 2020.',
 'In 2000, about 65 people went to the film club, while martial arts had 36 and amateur dramatics had 26.',
 'The film club’s number then fell a little to 60 in 2010, before going back up to about 66 in 2020.',
 'Martial arts had no clear overall change. Its number fell to 32 in 2005, rose to 38 in 2010, and was about 36 in 2020, close to its 2000 level.',
 'The other activities changed more.',
 'Table tennis rose only a little, from 16 people in 2000 to 20 in 2010. It then rose quickly to 35 in 2015 and about 54 in 2020.',
 'Musical performances had no participants in 2000 or 2005, but the number then rose slowly to 18 in 2020.',
 'But amateur dramatics fell from its highest value, 28 in 2005, to only 6 in 2020.',
];
const vocabulary=[
 v(['illustrates','shows','顯示'],['number of participants','how many people took part','參與人數'],['five activities','five activities','五項活動']),
 v(['remained the leading activity throughout','had the most people in every year shown','全期人數最多'],['despite minor fluctuations','even though its numbers changed a little','雖然略有波動']),
 v(['recorded by far the most dramatic growth','grew much more than the other activities','增長最急'],['became second','was second','升至第二'],['declined after a brief rise','rose a little at first, then fell','短暫上升後下降'],['least popular option','fewest people','最少人選']),
 v(['around','about','大約'],['attended','went to','參加'],['compared with','while','與……相比']),
 v(['dipped slightly','fell a little','小幅下降'],['recovering','going back up','回升'],['end of the period','2020','期末']),
 v(['no clear long-term change','no clear overall change','長期沒有明顯變化'],['after falling to','fell to','下跌至'],['ended close to its starting point','was about 36 in 2020, close to its 2000 level','期末接近起點'],['roughly','about','大約']),
 v(['remaining activities','other activities','其餘活動'],['more noticeably','more','變動較大']),
 v(['increased only modestly','rose only a little','起初僅小幅上升'],['climbed sharply','rose quickly','其後急升'],['approximately','about','約']),
 v(['first two years shown','2000 or 2005','圖上首兩個年份'],['rose gradually','rose slowly','逐步增加']),
 v(['By contrast','But','相比之下'],['fell from a peak','fell from its highest value','從高峰下降'],['just 6','only 6','只有六人']),
];
const structures=[
 f('The line graph illustrates the number of participants in five programmes at a community centre in Sydney, Australia, from 2010 to 2020.','引言界定折線圖、五項活動、地點、參與人數及時間',[1,3,6],{formula:'The [圖表類型] illustrates the number of [計數對象] in [項目數] at [地點] from [起年] to [末年]',meaning:'圖表呈現墨爾本一間社區中心五項活動在 2000 至 2020 年的參與人數。',usage:'縱軸是人數時，先寫 number of participants；不能誤改成參與率或百分比。',parts:[link('The'),slot(' line graph','圖表類型'),link(' illustrates the number of'),slot(' participants','計數對象'),link(' in'),slot(' five activities','項目數'),link(' at'),slot(' a social centre in Melbourne, Australia','地點'),link(', from'),slot(' 2000','起年'),link(' to'),slot(' 2020.','末年')]}),
 f('Overall, the swimming club remained the leading activity throughout, despite minor fluctuations.','概覽指出全期首位，即使其線條略有波動',[0,4,7],{formula:'Overall, [系列] remained the leading activity throughout, despite minor fluctuations',meaning:'電影學會每個年份都是五項活動中最多人參加，雖然中段曾小幅下跌。',usage:'系列全期排名第一與數值略升略跌可以同時成立；概覽應分清排名與波動。',parts:[link('Overall,'),slot(' the film club','系列'),link(' remained the leading activity throughout, despite minor fluctuations.')]}),
 f('Cycling recorded by far the most dramatic growth and became second by 2020, whereas dancing declined after a brief rise and finished as the least popular option.','把增長最快升至第二與短升後降至末位的兩項對照',[1,5,8],{formula:'[甲] recorded the most dramatic growth and became second by [末年], whereas [乙] declined after a brief rise and finished least popular',meaning:'乒乓球由 16 增至約 54 人，2020 年排第二；業餘戲劇在 2005 年小升後降至 6 人，排最後。',usage:'兩條線的方向與期末名次都相反時，概覽可在同一句對照；排名應以末年數值核實。',parts:[slot('Table tennis','甲'),link(' recorded by far the most dramatic growth and became second by'),slot(' 2020','末年'),link(', whereas'),slot(' amateur dramatics','乙'),link(' declined after a brief rise and finished as the least popular option.')]}),
 f('In 2010, around 65 people attended the swimming club, compared with 36 for cycling and 26 for dancing.','用同年三個可比人數建立起始排名',[0,4,7],{formula:'In [起年], around [甲人數] attended [甲], compared with [乙人數] for [乙] and [丙人數] for [丙]',meaning:'2000 年電影學會約 65 人、武術 36 人、業餘戲劇 26 人；比較的是同一年人數。',usage:'要交代起點差異，可選三條有代表性的線，但所有數值必須屬同一年與同單位。',parts:[link('In'),slot(' 2000','起年'),link(', around'),slot(' 65 people','甲人數'),link(' attended'),slot(' the film club','甲'),link(', compared with'),slot(' 36','乙人數'),link(' for'),slot(' martial arts','乙'),link(' and'),slot(' 26','丙人數'),link(' for'),slot(' amateur dramatics.','丙')]}),
 f('The swimming club then dipped slightly to 60 in 2015 before recovering to about 66 at the end of the period.','描述先小幅下跌、再回升至期末的非單調走勢',[1,3,9],{formula:'[系列] then dipped slightly to [低點及年] before recovering to [期末值] at the end of the period',meaning:'電影學會約由 65 降至 2010 年 60 人，最後回升至約 66 人。',usage:'線條曾先降後升時，不能只寫起點與終點；中間低點是表現走勢的關鍵。',parts:[slot('The film club','系列'),link(' then dipped slightly to'),slot(' 60 in 2010','低點及年'),link(' before recovering to'),slot(' about 66','期末值'),link(' at the end of the period.')]}),
 f('Cycling showed no clear long-term change: after falling to 32 in 2015, it rose to 38 in 2020 and ended close to its starting point, at roughly 36.','列中途下跌與回升，但以接近起點界定長期淨變化',[2,4,7],{formula:'[系列] showed no clear long-term change: after falling to [低點], it rose to [高點] and ended close to its starting point, at [末值]',meaning:'武術 2000 年 36、2005 年 32、2010 年 38、2020 年約 36，波動但淨變化很小。',usage:'中途高低起伏不等於長期增長；須比較同一系列的起點和終點再判斷。',parts:[slot('Martial arts','系列'),link(' showed no clear long-term change: after falling to'),slot(' 32 in 2005','低點'),link(', it rose to'),slot(' 38 in 2010','高點'),link(' and ended close to its starting point, at roughly'),slot(' 36.','末值')]}),
 f('The remaining activities changed more noticeably.','在較平穩系列之後，引出變動較大的餘下系列',[2,5,9],{formula:'The remaining [項目] changed more noticeably',meaning:'由電影學會與武術轉到變動較大的乒乓球、音樂表演和業餘戲劇。',usage:'前段寫完較穩定的系列後，可用簡短過渡說明接下來的分組依據。',parts:[link('The remaining'),slot(' activities','項目'),link(' changed more noticeably.')]}),
 f('Cycling increased only modestly from 16 to 20 participants between 2010 and 2015, but then climbed sharply to 35 in 2018 and approximately 54 in 2020.','依轉折點分早段小增與後段急升，保留各年份數值',[3,5,8],{formula:'[系列] increased only modestly from [早段值及年], but then climbed sharply to [轉折值及年] and approximately [末值及年]',meaning:'乒乓球 2000 至 2010 年由 16 至 20 人，後來 2015 年 35、2020 年約 54。',usage:'一條線在中途加快增長時，要分開早段與後段，並正確配對 2010、2015、2020 年。',parts:[slot('Table tennis','系列'),link(' increased only modestly from'),slot(' 16 to 20 participants between 2000 and 2010','早段值及年'),link(', but then climbed sharply to'),slot(' 35 in 2015','轉折值及年'),link(' and approximately'),slot(' 54 in 2020.','末值及年')]}),
 f('Swimming lessons, which had no participants in the first two years shown, rose gradually to 18.','補充起初為零的系列，並報告其後緩升終點',[1,6,9],{formula:'[系列], which had no participants in the first two years shown, rose gradually to [末值]',meaning:'音樂表演在 2000、2005 年都沒有參與者，其後逐步增至 2020 年 18 人。',usage:'圖上某系列開始為零時，明確指出哪兩個年份為零，再報後來的非零終值。',parts:[slot('Musical performances','系列'),link(', which had no participants in the first two years shown, rose gradually to'),slot(' 18.','末值')]}),
 f('By contrast, dancing fell from a peak of 28 in 2015 to just 6 by 2020.','對照上升系列，交代另一系列的峰值及期末低值',[2,5,8],{formula:'By contrast, [系列] fell from a peak of [峰值及年] to just [末值] by [末年]',meaning:'業餘戲劇 2005 年小升至 28 人後一路下降，2020 年只剩 6 人。',usage:'峰值不是起點時，須指明峰值年份；期末低值與另一系列上升形成對照。',parts:[link('By contrast,'),slot(' amateur dramatics','系列'),link(' fell from a peak of'),slot(' 28 in 2005','峰值及年'),link(' to just'),slot(' 6','末值'),link(' by'),slot(' 2020.','末年')]}),
];
const intro=[
 quiz('這張折線圖的縱軸量度甚麼？',['五項活動的參與人數','五項活動的參與百分比','每項活動的收費','每人每週參加的小時數'],'縱軸寫 Number of participants；圖中 65 等數字是人數。'),
 {type:'multi',prompt:'哪兩項是概覽中最值得先指出的格局？',detail:'選兩項，再按「確認」。',options:[
  '電影學會全期人數最多，雖然中間有小幅波動',
  '乒乓球增長最急、期末升至第二；業餘戲劇短升後跌至最少',
  '武術由 2000 年至 2020 年每年都持續上升',
  '五項活動 2020 年均有相同人數',
 ],correct:[0,1],why:'概覽抓全期首位、最大增幅與最大下降；武術不是持續上升。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代墨爾本一間社區中心、五項活動、人數與 2000 至 2020 年。'],
 ['整體概覽','電影學會始終最多；乒乓球增長最快，業餘戲劇跌至最少。'],
 ['較穩定的兩項','列電影學會先小跌後回升，以及武術起終點接近。'],
 ['變動較大的三項','按乒乓球加速增長、音樂表演由零增加、業餘戲劇下降分組。'],
],'以線條形狀分組，不按圖例逐項無重點地羅列。')];
const evidence=[
 quiz('全期參與人數最多的是哪項？',['電影學會，約 60 至 66 人','武術，約 32 至 38 人','乒乓球，約 16 至 54 人','業餘戲劇，約 6 至 28 人'],'電影學會每個年份都在最上方，雖然 2010 年略降。'),
 quiz('2000 年電影學會、武術、業餘戲劇各約多少人？',['65、36、26','36、65、26','65、26、36','16、20、28'],'三項起點依次是約 65、36、26 人；乒乓球當年約 16。'),
 quiz('電影學會 2010 年和 2020 年分別約多少人？',['60 和 66','66 和 60','32 和 38','20 和 54'],'電影學會在 2010 年約 60 人，然後回升至期末約 66 人。'),
 quiz('武術為何可說長期變化不明顯？',['2000 年約 36、2020 年仍約 36，雖然中間曾跌至 32、升至 38','2000 年約 16，2020 年約 54','所有年份恰好都為 36','2000 年約 28，2020 年只餘 6'],'起點與終點接近，但中途有波動；不能說每年完全不變。'),
 quiz('哪項活動在 2010 年後增長特別快？',['乒乓球：2010 年約 20、2015 年 35、2020 年約 54','電影學會：2010 年 60、2020 年 66','武術：2010 年 38、2020 年 36','業餘戲劇：2010 年 20、2020 年 6'],'乒乓球後十年增加約 34 人，是增長最明顯的系列。'),
 quiz('哪項活動在 2000 與 2005 年均為零，之後增至 18 人？',['音樂表演','業餘戲劇','武術','電影學會'],'音樂表演的線在前兩個年份貼着零線，2020 年約 18 人。'),
 quiz('業餘戲劇何時達高點，其後如何？',['2005 年約 28 人；到 2020 年降至約 6 人','2000 年 28 人；到 2020 年升至 54 人','2010 年約 60 人；到 2020 年 66 人','2005 年已為零；到 2020 年 18 人'],'業餘戲劇先由 26 小升至 28，之後持續下降，期末最低。'),
];
const logic=[
 sequence('兩個較穩定系列：先判排名，再辨淨變化',[
  ['電影學會起點','2000 年約 65 人，五項中最多。'],
  ['電影學會中段','2010 年約 60 人，小幅回落。'],
  ['電影學會期末','2020 年約 66 人，仍排名第一。'],
  ['武術起終點','2000 與 2020 年均約 36 人；中間曾在 32 至 38 之間變動。'],
 ],'電影學會全期首位不代表逐年增加；武術中途波動不代表長期淨增長。'),
 sequence('三個變動較大系列：分別抓起點、轉折及末值',[
  ['乒乓球早段','2000 至 2010 年由 16 增至 20 人，增幅小。'],
  ['乒乓球後段','2015 年 35、2020 年約 54，急升至第二。'],
  ['音樂表演','2000 與 2005 年均為零，期末增至 18 人。'],
  ['業餘戲劇','2005 年 28 人為高點，其後跌至 2020 年約 6 人。'],
 ],'把增長速度改變與類別排名分開核對，避免把乒乓球稱作期末第一。'),
];
const transfers=[
 transfer('另一張折線圖顯示悉尼一間社區中心五項設施於 2010 至 2020 年的使用人數。','哪句引言保留正確單位與期間？',['折線圖顯示悉尼一間社區中心五項設施於 2010 至 2020 年的使用人數。','折線圖顯示五項設施的使用百分比，時間為 2000 至 2020 年。','折線圖解釋設施受歡迎的原因。','折線圖只比較 2020 年五項設施的價格。'],['地點、五項、使用人數及完整期間都準確。','把人數改成百分比，也改錯起年。','圖中數值不能直接解釋原因。','圖中是多年人數，並非單年價格。'],[0],'原文引言把五項活動、墨爾本社區中心、參與人數及 2000 至 2020 年交代齊全。'),
 transfer('游泳班在 2010 至 2020 年每個年份都是最多人參加，數值略有升跌。','哪項適合作為概覽？',['游泳班全期居首，雖然人數有小幅波動。','游泳班每一年都比前一年更多人。','游泳班一直最少人參加。','游泳班人數從未改變。'],['全期排名與小幅升跌可同時成立。','略有升跌不等於逐年增加。','題目說每年最多。','數值有變。'],[1],'原文電影學會始終領先，但曾由約 65 降至 60 再回升。'),
 transfer('A 活動由 16 增至 54 人、期末第二；B 活動早期略升後跌至 6 人、期末最少。','哪項同時概括方向和期末排名？',['A 增長最急且期末第二，B 短暫上升後下降至最少。','A 期末最多，B 持續上升。','A 與 B 期末人數一樣多。','B 增長最急，A 跌至最少。'],['兩項方向與末年排名都正確。','A 是第二，B 先升後跌。','54 與 6 不相同。','把兩項的走勢和名次對調。'],[2],'原文概覽對照乒乓球急升至第二與業餘戲劇跌至最後。'),
 transfer('2010 年 A、B、C 活動各有約 65、36、26 人。','哪句在同一年比較三項人數？',['2010 年 A 約 65 人，B 為 36 人，C 為 26 人。','2010 年 A、B、C 分別佔 65%、36%、26%。','2010 年 A 26 人、B 36 人、C 65 人。','A 在三個不同年份分別有 65、36、26 人。'],['三個值都作為同年各項人數。','單位是人數，不是百分比。','把 A、C 數值互換。','題目指定同一年三項活動。'],[3],'原文在 2000 年同一句比較電影學會、武術、業餘戲劇三項人數。'),
 transfer('A 活動起點 65 人，2015 年降至 60，期末又升至 66。','哪項保留中間低點？',['A 先小幅降至 60，再回升至期末約 66。','A 從 65 一路上升至 66，沒有下降。','A 從 65 一路下跌至 60。','A 中途降至 6，再回升至 60。'],['60 是中途低點，66 是回升後終點。','略去已知的 60 人低點。','期末為 66。','把 60 錯寫成 6。'],[4],'原文電影學會先於 2010 年跌至 60，再回升至期末約 66。'),
 transfer('B 活動起點 36、後來跌至 32、再升至 38，期末又約 36 人。','哪項最能概括長期淨變化？',['B 中途波動，但期末接近起點，沒有明顯長期淨變化。','B 持續快速增長，期末遠高於起點。','B 每個年份都恰好是 36 人。','B 最後跌至零。'],['起點與終點都約 36，中間有升跌。','期末未遠高於起點。','中間有 32 與 38。','期末約 36。'],[5],'原文用 martial arts 起終點接近，區分中途波動與長期淨變化。'),
 transfer('報告已寫完兩條較平穩的線，尚有三條變動明顯的線。','哪句適合轉入下一段？',['其餘三項活動的變化較為明顯。','其餘三項活動完全沒有變化。','所有五項活動都具有相同走勢。','前兩項活動全期都是零。'],['指出下一組的分組依據。','題目說其餘三條變動明顯。','各條線可能方向不同。','較平穩不等於一直為零。'],[6],'原文 The remaining activities changed more noticeably 用變化幅度把細節分成兩段。'),
 transfer('C 活動 2010 年 16 人、2015 年 20、2018 年 35、2020 年 54。','怎樣呈現增長速度的轉折？',['C 早段由 16 小升至 20，後段急升至 35 和 54。','C 早段由 16 急升至 54，後段沒有增長。','C 全期持續下降。','C 2018 年已到 54，2020 年降至 35。'],['先小增 4 人，後段增加更快；年份配對正確。','54 是期末值，非早段。','四個值逐步變高。','把後兩個年份的值倒轉。'],[7],'原文把乒乓球 2000–2010 的 16→20 與其後 35→54 分開描述。'),
 transfer('D 活動在圖上前兩年均為零，期末增至 18 人。','哪項同時保留零起點與終點？',['D 在首兩個年份無參與者，其後逐步增至 18 人。','D 首兩年各有 18 人，期末降至零。','D 由一開始就最多人參加。','D 全期人數恰好都是零。'],['前兩個零值與後來的增長都寫出。','把零和 18 的時序顛倒。','零不可能是最多。','期末為 18。'],[8],'原文指出音樂表演在 2000、2005 年為零，再增至 18。'),
 transfer('E 活動在 2015 年達 28 人，期末只有 6 人。','哪句準確定位高峰年份與下降？',['E 由 2015 年 28 人的高點跌至期末 6 人。','E 在起點已達 28 人，期末升至 60。','E 在期末達 28 人的高點。','E 在 2015 年只有 6 人，之後升至 28。'],['28 屬中途高點，6 屬末年低值。','高點年份和終點數字都錯。','期末只有 6。','把兩值的時序倒轉。'],[9],'原文業餘戲劇的高點為 2005 年 28 人，之後到 2020 年只剩 6。'),
];
const balancedTransferOptions=[
 ['折線圖顯示悉尼一間社區中心五項設施在2010至2020年的使用人數。','折線圖顯示悉尼一間社區中心五項設施在2000至2020年的使用率。','折線圖解釋悉尼一間社區中心五項設施在該期間受歡迎的原因。','折線圖比較悉尼一間社區中心五項設施在2020年的使用價格。'],
 ['游泳班全期參加人數最多，其間有小幅升跌。','游泳班全期參加人數最多，而且每年都上升。','游泳班全期參加人數最少，其間有小幅升跌。','游泳班全期參加人數不變，每年完全相同。'],
 ['A增長最急且期末第二；B短暫上升後降至最少。','A增長最急且期末第一；B一路上升至第二。','A與B期末人數完全相等，兩者並列第二名。','B增長最急且期末第二；A一路降至最少。'],
 ['2010年A約65人，B約36人，C約26人。','2010年A約佔65%，B約佔36%，C約佔26%。','2010年A約26人，B約36人，C約65人。','A在三個年份有65、36、26人。'],
 ['A先由65小降至60，期末又回升至約66。','A由65持續升至66，中途從未出現回落。','A由65持續跌至60，期末沒有回升。','A中途由65大跌至6，期末再升至60。'],
 ['B中途升跌，但期末接近起點，淨變化很小。','B中途升跌，但期末遠高於起點，淨增很多。','B每一年都維持36人，從來沒有任何升跌。','B中途升跌，但期末人數減少至零。'],
 ['其餘三項活動的變化較明顯，下段逐一比較。','其餘三項活動完全沒有變化，下段逐一比較。','全部五項活動走勢完全相同，下段逐一比較。','前兩項活動全期都沒有參與者，下段再比較。'],
 ['C早段由16小升至20，後段較快升至35與54。','C早段由16急升至54，後段一直沒有增長。','C早段由54降至35，後段又降至20與16。','C在2018年已升至54，末年反而跌至35。'],
 ['D首兩個年份無人參與，其後逐步增至18人。','D首兩個年份各有18人，其後逐步降至零。','D首兩個年份已是最熱門，期末又增至18人。','D首兩個年份無人參與，其後一直維持零人。'],
 ['E於2015年達28人的高峰，期末跌至6人。','E在起點已達28人的高峰，期末升至60人。','E於期末達28人的高峰，2015年只有6人。','E於2015年只有6人，期末又升至28人。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-line-graph:1',meta:{topic:'墨爾本社區中心五項活動參與人數',summary:'先抓電影學會全期領先、乒乓球急升至第二及業餘戲劇跌至最少，再按較平穩與變動較大的線條分組報告。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
