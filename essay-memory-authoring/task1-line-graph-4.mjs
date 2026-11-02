// Task 1 Line Graph 4: annual shop openings and closures, 2011–2018.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀折線圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The line graph shows how many shops closed and how many new shops opened in one country each year from 2011 to 2018.',
 'Overall, the number of shop openings went down and was lowest in 2018. The number of closures went up and down sharply.',
 'More shops closed than opened in every year except 2011 and 2015, when the number of closures was unusually low.',
 'In 2011, about 8,500 shops opened, far more than the about 6,400 that closed.',
 'The number of new shops then fell to about 4,000 in 2012, almost half its 2011 level. It rose again to about 5,000 in 2013 and just over 6,000 in 2014.',
 'After this short rise, openings went down to 4,000 in both 2015 and 2016, rose a little to about 4,200 in 2017, then fell to about 3,000 in 2018.',
 'The number of closures went up and down more.',
 'Closures went down from about 6,400 in 2011 to just under 6,000 in 2012, then reached a high of about 7,200 in 2013.',
 'Closures were still high in 2014, at about 6,500, but fell sharply to only about 500 in 2015.',
 'But closures rose sharply again to just over 5,000 in 2016, then stayed near that number in 2017 and 2018.',
];
const vocabulary=[
 v(['compares','shows','顯示'],['numbers of shop closures and openings','how many shops closed and how many new shops opened','商店結業和開業數目'],['from 2011 to 2018','from 2011 to 2018','二〇一一至一八年']),
 v(['showed a clear downward trend','went down','明顯下降'],['ending at their lowest point','was lowest in 2018','期末最低'],['fluctuated markedly','went up and down sharply','大幅波動']),
 v(['Apart from','except','除了'],['initial year','2011','首年'],['exceptional trough','unusually low','異常低點'],['more shops closed than opened','More shops closed than opened','結業多於開業']),
 v(['openings were far higher','far more','開業遠較多'],['roughly','about','約'],['closures','closed','結業']),
 v(['almost halved','almost half its 2011 level','幾乎減半'],['around','about','約'],['before recovering','rose again','其後回升'],['just over','just over','略多於']),
 v(['brief rebound','short rise','短暫回升'],['fell back','went down','再次下降'],['edged up slightly','rose a little','略微上升'],['approximately','about','約']),
 v(['Closures','number of closures','結業數目'],['less steady pattern','went up and down more','較不穩定的走勢']),
 v(['figure slipped','Closures went down','數值下降'],['just under','just under','略低於'],['rose to a peak','reached a high','升至高峰']),
 v(['remained high','were still high','仍維持較高'],['roughly','about','約'],['plunging','fell sharply','急跌'],['only about 500','only about 500','只有約五百']),
 v(['However','But','然而'],['rebounded sharply','rose sharply again','急速反彈'],['stayed close to this level','stayed near that number','維持在接近該水平'],['final two years','2017 and 2018','最後兩年']),
];
const structures=[
 f('The line graph compares the numbers of restaurant closures and openings in one city from 2010 to 2020.','引言清楚界定同一類別的開與關、地點、期間和人數／店數單位',[1,3,6],{formula:'The [圖表類型] compares the numbers of [結束] and [新開始] in [地點] from [起年] to [末年]',meaning:'折線圖比較一個國家在 2011 至 2018 年每年的商店結業及新店開業數目。',usage:'兩條線是店舖數，不是百分比；closed 和 opened 為相反事件，勿混淆圖例。',parts:[link('The'),slot(' line graph','圖表類型'),link(' compares the numbers of'),slot(' shop closures','結束'),link(' and'),slot(' openings','新開始'),link(' in'),slot(' one country','地點'),link(' from'),slot(' 2011','起年'),link(' to'),slot(' 2018.','末年')]}),
 f('Overall, restaurant openings showed a clear downward trend, ending at their lowest point, while closures fluctuated markedly.','概覽對照一條總體下行與另一條劇烈波動',[0,4,7],{formula:'Overall, [甲] showed a clear downward trend, ending at their lowest point, while [乙] fluctuated markedly',meaning:'商店開業數整體下降並在 2018 年最低；結業數則在期間大幅起伏。',usage:'一條線有局部回升仍可整體下行；另一條線的深谷須用「波動」而非穩步上升概括。',parts:[link('Overall,'),slot(' shop openings','甲'),link(' showed a clear downward trend, ending at their lowest point, while'),slot(' closures','乙'),link(' fluctuated markedly.')]}),
 f('Apart from the initial year and the exceptional trough in closures in 2015, more restaurants closed than opened.','用 Apart from 準確限定「關閉多於新開」的普遍關係',[1,5,8],{formula:'Apart from [首年] and [某年特殊低谷], more [對象] closed than opened',meaning:'除 2011 年與 2015 年結業異常低點外，其餘年份結業店數都高於開業店數。',usage:'比較兩條線誰較高時，必須逐年檢查交叉／例外，不能直接說「每年」。',parts:[link('Apart from'),slot(' the initial year','首年'),link(' and'),slot(' the exceptional trough in closures in 2015','某年特殊低谷'),link(', more'),slot(' shops','對象'),link(' closed than opened.')]}),
 f('In 2010, openings were far higher, at 8,500, compared with roughly 6,400 closures.','用起始年兩個數值證明開業明顯高於結業',[0,5,9],{formula:'In [首年], openings were far higher, at [開業值], compared with roughly [結業值] closures',meaning:'2011 年開業約 8,500 店，結業約 6,400 店，是開業較多的例外年份。',usage:'同年兩條線可直接比較；8,500 和 6,400 為店舖數目而非百分比。',parts:[link('In'),slot(' 2011','首年'),link(', openings were far higher, at'),slot(' about 8,500','開業值'),link(', compared with roughly'),slot(' 6,400','結業值'),link(' closures.')]}),
 f('The number of new restaurants then almost halved to 4,000 in 2012, before recovering to 5,000 in 2013 and just over 6,000 in 2014.','寫大幅下跌後連續兩年的回升，並按時間配值',[3,6,8],{formula:'The number of new [對象] then almost halved to [低點], before recovering to [次年值] and just over [後年值]',meaning:'新開店由 2011 年約 8,500 大降至 2012 年約 4,000，2013、2014 年回升至約 5,000、6,000 多。',usage:'「幾乎減半」需核對起點與低點；後兩個年份的回升值要按序配對。',parts:[link('The number of new'),slot(' shops','對象'),link(' then almost halved to'),slot(' around 4,000 in 2012','低點'),link(', before recovering to'),slot(' about 5,000 in 2013','次年值'),link(' and just over'),slot(' 6,000 in 2014.','後年值')]}),
 f('After this brief rebound, openings fell back to 4,000 in 2015 and 2016, edged up slightly to 4,200 in 2017, and then declined to 3,000 in 2018.','交代回升後的停滯、小反彈及末年最低',[2,4,9],{formula:'After this brief rebound, [甲] fell back to [兩年相同值], edged up slightly to [下一年值], and then declined to [末年值]',meaning:'開業於 2015、2016 年均約 4,000，2017 年小升至約 4,200，2018 年降至約 3,000 最低。',usage:'兩年持平、下一年略升、末年再跌是不同動作，須按年份次序保留。',parts:[link('After this brief rebound,'),slot(' openings','甲'),link(' fell back to'),slot(' 4,000 in 2015 and 2016','兩年相同值'),link(', edged up slightly to'),slot(' around 4,200 in 2017','下一年值'),link(', and then declined to'),slot(' approximately 3,000 in 2018.','末年值')]}),
 f('Closures followed a less steady pattern.','由開業轉到起伏較大的結業系列',[2,5,8],{formula:'[第二系列] followed a less steady pattern',meaning:'細節由開業線轉到結業線，後者在 2015 年有異常低值。',usage:'兩條線形狀不同時，可用短句明確換組，但後續句必須用數值證明「較不穩定」。',parts:[slot('Closures','第二系列'),link(' followed a less steady pattern.')]}),
 f('The figure slipped from 6,400 to just under 6,000 in 2012, then rose to a peak of 7,200 in 2013.','報告第二系列先降後升至高點',[3,5,9],{formula:'The figure slipped from [起始值] to just under [次年值], then rose to a peak of [高點]',meaning:'結業店數由 2011 年約 6,400 降至 2012 年略低於 6,000，再於 2013 年達約 7,200。',usage:'先降後升的轉折不可只寫起點和高點；要把中間低值與年份交代。',parts:[link('The figure slipped from'),slot(' around 6,400','起始值'),link(' to just under'),slot(' 6,000 in 2012','次年值'),link(', then rose to a peak of'),slot(' about 7,200 in 2013.','高點')]}),
 f('It remained high in 2014, at roughly 6,500, before plunging to only about 500 in 2015.','對照相鄰兩年由高位急跌到異常低點',[3,6,9],{formula:'It remained high in [前一年], at roughly [值], before plunging to only about [低值] in [後一年]',meaning:'結業店數 2014 年約 6,500，2015 年卻驟降至約 500，構成全圖最異常低點。',usage:'極端相鄰年變化應明示兩年和兩值；500 不是 5,000。',parts:[link('It remained high in'),slot(' 2014','前一年'),link(', at roughly'),slot(' 6,500','值'),link(', before plunging to only about'),slot(' 500 in 2015.','低值及後一年')]}),
 f('However, closures rebounded sharply to just over 5,000 in 2016 and then stayed close to this level in the final two years.','低點後快速反彈，再維持接近水平至末年',[4,6,8],{formula:'However, [系列] rebounded sharply to [反彈值及年] and then stayed close to this level in [末兩年]',meaning:'2015 年低谷後，2016 年結業反彈至 5,000 多間，2017、2018 年維持約 5,000。',usage:'異常低點後若反彈，應報告反彈幅度及其後是否持平；不要把短暫低谷當作長期趨勢。',parts:[link('However,'),slot(' closures','系列'),link(' rebounded sharply to'),slot(' just over 5,000 in 2016','反彈值及年'),link(' and then stayed close to this level in'),slot(' the final two years.','末兩年')]}),
];
const intro=[
 quiz('兩條線的縱軸單位是甚麼？',['每年的商店數目','每年商店的百分比','每間商店的平均營業額','每年新店與舊店的比例'],'圖中約 8,500、500 等是開業或結業店舖數目。'),
 {type:'multi',prompt:'哪兩項可概括全圖最重要的走勢與例外？',detail:'選兩項，再按「確認」。',options:[
  '開業數整體下降，2018 年最低；結業數大幅波動，2015 年異常低',
  '除 2011 與 2015 年外，每年結業店數都高於開業店數',
  '開業數由 2011 至 2018 年每年都下降',
  '結業數在 2015 年達全期最高',
 ],correct:[0,1],why:'概覽需兼顧兩條線的不同形狀和 2011／2015 年的比較例外。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代一個國家 2011 至 2018 年每年開業與結業的店舖數。'],
 ['整體概覽','開業整體下降；結業劇烈波動，並標出誰較高的兩個例外年份。'],
 ['開業數細節','由 2011 年 8,500 的高起點，寫到 2012 年近乎減半、2014 年回升及 2018 年最低。'],
 ['結業數細節','列 2013 年高點、2015 年約 500 異常低點、2016 年反彈和最後兩年持平。'],
],'兩條線的走勢不同，可各寫一段；年份與約數要逐一核對。')];
const evidence=[
 quiz('2011 年開業與結業店數分別約為多少？',['開業 8,500，結業 6,400','開業 6,400，結業 8,500','兩者都約 4,000','開業 500，結業 5,000'],'2011 年開業虛線在約 8,500，高於結業實線約 6,400。'),
 quiz('開業數由 2011 至 2012 年如何變化？',['由約 8,500 降至約 4,000，接近減半','由約 4,000 升至約 8,500','由約 6,400 升至約 7,200','由約 500 升至約 5,200'],'2012 年約 4,000 是開業線的大幅下跌，不是結業線。'),
 quiz('2013 年結業數約是多少？',['7,200，為結業線高點','500，為結業線低點','3,000，為開業線低點','4,000，與開業相同'],'結業實線 2013 年約 7,200，為該線全期最高。'),
 quiz('2015 年哪條線出現異常低點？',['結業約 500，低於開業約 4,000','開業約 500，低於結業約 4,000','兩條線均約 500','結業約 7,200，為全期最高'],'2015 年結業實線急跌到約 500，是誰高誰低的例外年份。'),
 quiz('2015 和 2016 年的開業數如何？',['兩年都約 4,000','2015 年 4,000，2016 年 8,500','2015 年 500，2016 年 5,200','兩年都約 6,500'],'開業虛線兩年停在約 4,000，與結業線在 2015–2016 年的大反彈不同。'),
 quiz('開業數在 2018 年約是多少，排名如何？',['約 3,000，為開業線全期最低','約 5,200，為結業線期末值','約 8,500，為開業線全期最高','約 500，與 2015 年結業相同'],'2018 年開業虛線下降至約 3,000，是自身最低點。'),
 quiz('2016 年結業線從 2015 年低點如何變化？',['由約 500 反彈至略高於 5,000','由約 5,000 跌至約 500','由約 4,000 持續不變','由約 7,200 升至 8,500'],'結業線在 2015 年有深谷，2016 年迅速回升到 5,000 多。'),
];
const logic=[
 sequence('開業數：總體下降中仍有局部回升',[
  ['2011 年高起點','約 8,500 間，明顯高於同年結業數。'],
  ['2012 年驟降','約 4,000，接近前一年一半。'],
  ['2013–2014 年回升','約 5,000，然後逾 6,000。'],
  ['2015–2018 年','4,000、4,000、約 4,200、約 3,000，期末最低。'],
 ],'總體下降不等於每年都下降；2013–2014 年及 2017 年曾回升。'),
 sequence('結業數：高點、異常低谷與反彈',[
  ['2011–2013 年','約 6,400、略低於 6,000、約 7,200 高點。'],
  ['2014 年','仍約 6,500。'],
  ['2015 年','驟降至約 500，低於同年開業約 4,000。'],
  ['2016–2018 年','反彈至逾 5,000，最後兩年接近這個水平。'],
 ],'2015 年的約 500 是異常單年低值；不要把它寫成 5,000 或長期持續下降。'),
];
const transfers=[
 transfer('另一張圖顯示某城 2010 至 2020 年每年餐廳開業及結業數目。','哪句引言清楚界定兩個系列？',['圖表比較某城 2010 至 2020 年每年的餐廳開業與結業數。','圖表比較某城餐廳的營業額與利潤百分比。','圖表只顯示 2020 年有多少顧客。','圖表解釋餐廳結業的經濟原因。'],['地點、期間與兩種店數都準確。','系列不是營業額或百分比。','圖中有多年開業與結業數。','圖表沒有原因資料。'],[0],'原文引言界定 shop closures and openings，單位是店舖數。'),
 transfer('A 城新開餐廳總體由 8,500 降至 3,000；結業數曾高低劇烈起伏。','哪項概覽同時保留兩條線的形狀？',['開業整體下行，期末最低；結業數則大幅波動。','開業每一年都穩定上升；結業完全不變。','兩條線都逐年下降，沒有反彈。','開業期末最高，結業始終為零。'],['總趨勢和波動分別對應兩條線。','方向和形狀都錯。','題目沒有說兩條線都單調下降。','開業末值較低，結業也有數值。'],[1],'原文概覽開業 clear downward trend 與結業 fluctuated markedly。'),
 transfer('某圖除首年和 2015 年結業異常低谷外，其餘年份結業都多於開業。','哪句保留兩個例外？',['除了首年及 2015 年的結業低谷，其餘年份結業多於開業。','每一年結業都多於開業，沒有例外。','只有首年結業多於開業。','每一年開業都多於結業。'],['把普遍關係與兩個反轉年份一併寫清。','抹去了已知兩個例外。','與其餘年份的關係相反。','把多數年份的高低方向顛倒。'],[2],'原文 Apart from the initial year and ... 2015 精確限定開業／結業比較。'),
 transfer('2010 年開業約 8,500、結業約 6,400。','哪項同年比較正確？',['開業約 8,500，明顯高於結業約 6,400。','結業約 8,500，明顯高於開業約 6,400。','兩種店數都約 8,500。','開業比結業少約 2,100。'],['8,500 高於 6,400，差約 2,100 店。','把兩條線數值對調。','兩值不同。','開業較多，非較少。'],[3],'原文 2011 年開業約 8,500，結業約 6,400，是開業較多的例外。'),
 transfer('新開餐廳由 8,500 降至次年 4,000，再到第三年 5,000、第四年逾 6,000。','哪句按年報告先急跌後回升？',['開業幾乎減半至 4,000，之後回升至 5,000 和逾 6,000。','開業由 8,500 持續下跌至 4,000、3,000、2,000。','開業次年升至 8,500，此後一直為 4,000。','開業由 8,500 降至 500，少於原來十分之一。'],['4,000 接近 8,500 的一半；後兩年數值上升。','第三、四年是回升。','次年是 4,000。','低點是 4,000，不是 500。'],[4],'原文開業 2011→2012 幾近減半，再到 2013、2014 年回升。'),
 transfer('新開餐廳 2015、2016 年各 4,000；2017 年 4,200；2018 年 3,000。','哪句保留持平、小升、再跌三個動作？',['2015–2016 年同為 4,000，2017 年略升至 4,200，2018 年降至 3,000。','2015–2018 年每一年都穩定上升。','2017 年降至 3,000，2018 年升至 4,200。','四年都維持 4,000。'],['兩年持平後小升，末年再跌；年份與數值都對。','2018 年低於 2017 年。','把後兩年值對調。','2017、2018 年數值不同。'],[5],'原文一口氣列開業 2015–2018 的持平、略升與期末最低。'),
 transfer('報告已寫完開業線；結業線在 2015 年有特別低的深谷。','哪句適合轉入結業細節？',['結業數的走勢較不穩定。','結業數與開業數每年都完全相同。','結業數一直維持在 500。','開業數從未變化。'],['指出第二條線較不平穩，後文再用深谷證明。','兩條線不同。','2015 年 500 只是單年低谷。','開業數亦有升跌。'],[6],'原文 Closures followed a less steady pattern 轉入結業線。'),
 transfer('結業數先由 6,400 降到略低於 6,000，再於第三年達 7,200。','哪句保留中途低點與高峰？',['先略降至不足 6,000，再升到約 7,200 的高點。','由 6,400 一路下降至 500，沒有反彈。','第二年已達 7,200 高峰。','三年結業數都一樣。'],['先降後升，兩個轉折值都保留。','第三年出現高峰。','7,200 是第三年。','三值不同。'],[7],'原文結業 2011 約 6,400、2012 略低於 6,000、2013 約 7,200 高峰。'),
 transfer('結業 2014 年約 6,500，2015 年約 500。','哪項準確表達異常跌幅？',['結業由約 6,500 急跌至翌年只有約 500。','結業由約 500 急升至翌年 6,500。','兩年結業數都在 5,000 左右。','2015 年約 5,000，沒有異常變化。'],['兩年差約 6,000 店，2015 年是深谷。','把兩年數值倒轉。','2015 年只有約 500。','把 500 多寫一個零。'],[8],'原文 2014 年結業仍約 6,500，2015 年 plunging to only about 500。'),
 transfer('結業 2015 年約 500、2016 年逾 5,000，2017、2018 年維持約 5,000。','哪句保留反彈及其後持平？',['結業次年急速回升至 5,000 多，最後兩年接近這個水平。','結業自 2015 年起每年繼續下降至零。','2016 年仍只有 500，其後才開始反彈。','2017、2018 年都升到 8,500。'],['從 500 到逾 5,000 是急反彈，其後相對平穩。','2016 年是上升。','2016 年已逾 5,000。','最後兩年約 5,000。'],[9],'原文在 2015 低點後報告 2016 年反彈及 2017、2018 年接近持平。'),
];
export default {key:'task1-line-graph:4',meta:{topic:'2011 至 2018 年商店開業與結業數',summary:'開業數總體下降但並非逐年下降；結業數在 2015 年異常低，次年反彈。按兩條線分段並核對每年誰較高。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
