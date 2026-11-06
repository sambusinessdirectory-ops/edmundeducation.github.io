// Task 1 Pie Charts 5: Yemen and Italy age shares, 2000 and projected 2050.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清 2000 年實際數據和 2050 年預測，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The pie charts show the shares of three age groups in Yemen and Italy in 2000, with predictions for 2050.',
 'Overall, Yemen had many more young people than Italy in 2000. It is expected to stay younger in 2050.',
 'But in both countries, the share of children is predicted to fall and older age groups to grow. This is especially clear for people aged 60 or over in Italy.',
 'In Yemen in 2000, children aged 0–14 were just over half of the population, at 50.1%. People aged 15–59 were slightly lower, at 46.3%.',
 'In 2050, the larger group is expected to change: people aged 15–59 will rise to 57.3%, and children will fall to 37.0%.',
 'People aged 60 or over will still be a small group in Yemen, but their share is expected to rise from 3.6% to 5.7%.',
 'Italy had many more older people than Yemen.',
 'In 2000, people aged 15–59 were the biggest group in Italy, at 61.6%. Those over 60 were 24.1%, and children were only 14.3%.',
 'In 2050, Italy’s 60-or-over group is expected to rise sharply to 42.3%, near the 15–59 group’s 46.2%. Children are predicted to fall a little to 11.5%.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['age profiles','shares of three age groups','年齡結構'],['show projections','with predictions','展示預測']),
 v(['markedly younger population','many more young people','人口明顯較年輕'],['expected to remain the case','expected to stay younger','預計仍如此'],['Overall','Overall','整體而言']),
 v(['However','But','然而'],['projected to age','predicted to fall and older age groups to grow','預計人口老化'],['decline','fall','下降'],['more prominent','grow','佔比增加'],['aged 60 and above','aged 60 or over','60 歲或以上']),
 v(['made up','were','佔'],['just over half','just over half','略多於一半'],['slightly exceeding','slightly lower','略高於'],['recorded for','were','錄得']),
 v(['this pattern is forecast to reverse','the larger group is expected to change','主導年齡組別預計互換'],['working-age group','people aged 15–59','15–59 歲組'],['rising to','will rise to','升至'],['falling to','will fall to','降至']),
 v(['elderly population','People aged 60 or over','長者人口'],['remain comparatively small','still be a small group','仍然較少'],['though','but','雖然'],['increase from','rise from','由……上升']),
 v(['far older structure','many more older people','年齡結構較老'],['Italy','Italy','意大利']),
 v(['accounted for the largest proportion','were the biggest group','佔最大份額'],['represented','were','佔'],['made up only','were only','僅佔']),
 v(['60-plus group','60-or-over group','60 歲或以上組'],['projected to surge','expected to rise sharply','預計急升'],['close to','near','接近'],['whereas','Children are predicted','而'],['shrink slightly','fall a little','略降']),
];
const structures=[
 f('The pie charts compare the age profiles of the populations of Country A and Country B in 2010 and show projections for 2060.','引言同時列兩國、實際基年及預測末年',[2,4,8],{formula:'The pie charts compare the age profiles of the populations of [兩國] in [實際年] and show projections for [預測年]',meaning:'圖比較也門與意大利 2000 年三個年齡組的份額，並預測 2050 年。',usage:'2050 年是預測，不可寫成已觀察到的歷史事實；圖中百分比是人口份額。',parts:[link('The pie charts compare the age profiles of the populations of'),slot(' Yemen and Italy','兩國'),link(' in'),slot(' 2000','實際年'),link(' and show projections for'),slot(' 2050.','預測年')]}),
 f('Overall, Country A had a markedly younger population than Country B in 2010, and this is expected to remain the case in 2060.','比較兩國基年與預測年都保持的年齡差異',[0,3,7],{formula:'Overall, [較年輕國] had a markedly younger population than [較年長國] in [實際年], and this is expected to remain the case in [預測年]',meaning:'也門 0–14 歲 2000 年 50.1%，2050 年預測 37.0%；意大利相應為 14.3%、11.5%，也門兩年較年輕。',usage:'較年輕是比較人口年齡結構，不表示也門所有人的年齡都低於意大利人。',parts:[link('Overall,'),slot(' Yemen','較年輕國'),link(' had a markedly younger population than'),slot(' Italy','較年長國'),link(' in'),slot(' 2000','實際年'),link(', and this is expected to remain the case in'),slot(' 2050.','預測年')]}),
 f('However, both countries are projected to age: the share of children will decline, while older groups, especially those aged 60 and above in Country B, will become more prominent.','概覽兩國共同老化方向，同時指出其中一國 60+ 最突出',[0,4,7],{formula:'However, both countries are projected to age: the share of children will decline, while older groups, especially those aged 60 and above in [國家], will become more prominent',meaning:'兩國兒童份額下降、長者份額上升；意大利 60+ 由 24.1% 預測增至 42.3%。',usage:'age 在此指人口年齡結構變老；不表示每個年齡組的人數或份額都上升。',parts:[link('However, both countries are projected to age: the share of children will decline, while older groups, especially those aged 60 and above in'),slot(' Italy','國家'),link(', will become more prominent.')]}),
 f('In Country A, children aged 0–14 made up just over half of the population in 2010, at 51.0%, slightly exceeding the 45.0% recorded for people aged 15–59.','同年比較兒童與工作年齡兩組，並保留略高於關係',[1,5,8],{formula:'In [國家], children aged 0–14 made up just over half of the population in [年], at [兒童值], slightly exceeding the [工作年齡值] recorded for people aged 15–59',meaning:'也門 2000 年兒童 50.1%，略多於工作年齡 46.3%。',usage:'50.1% 比一半高 0.1 個百分點；兩組差 3.8 個百分點，不可說工作年齡居首。',parts:[link('In'),slot(' Yemen','國家'),link(', children aged 0–14 made up just over half of the population in'),slot(' 2000','年'),link(', at'),slot(' 50.1%','兒童值'),link(', slightly exceeding the'),slot(' 46.3%','工作年齡值'),link(' recorded for people aged 15–59.')]}),
 f('By 2060, this pattern is forecast to reverse, with the working-age group rising to 56.0% and children falling to 38.0%.','說明同一國兩大年齡組在預測年互換首位',[0,3,7],{formula:'By [預測年], this pattern is forecast to reverse, with the working-age group rising to [工作值] and children falling to [兒童值]',meaning:'也門 2050 年工作年齡 57.3% 預計超過兒童 37.0%，與 2000 年相反。',usage:'reverse 指兩組的相對排名互換；不是說兩組的所有比例都剛好對調。',parts:[link('By'),slot(' 2050','預測年'),link(', this pattern is forecast to reverse, with the working-age group rising to'),slot(' 57.3%','工作值'),link(' and children falling to'),slot(' 37.0%.','兒童值')]}),
 f('The elderly population will remain comparatively small, though it is expected to increase from 4.0% to 6.0%.','同時報告長者仍少與份額上升',[1,4,8],{formula:'The elderly population will remain comparatively small, though it is expected to increase from [實際值] to [預測值]',meaning:'也門 60+ 由 3.6% 預測升至 5.7%，但仍遠低於其他兩組。',usage:'「仍較少」是與也門另外兩組比較；3.6→5.7 是 +2.1 個百分點。',parts:[link('The elderly population will remain comparatively small, though it is expected to increase from'),slot(' 3.6%','實際值'),link(' to'),slot(' 5.7%.','預測值')]}),
 f('Country B showed a far older structure.','用簡短過渡轉到年齡結構較老的第二國',[1,5,8],{formula:'[國家] showed a far older structure',meaning:'意大利 2000 年 60+ 為 24.1%，遠高於也門 3.6%；0–14 歲只有 14.3%。',usage:'older structure 是兩國人口份額的對照，承接也門段，並非意大利人口總數更大。',parts:[slot('Italy','國家'),link(' showed a far older structure.')]}),
 f('In 2010, people aged 15–59 accounted for the largest proportion, at 60.0%, while those over 60 represented 25.0%; children made up only 15.0%.','同一年把第二國三年齡組按最大、長者、兒童配值',[0,3,6],{formula:'In [實際年], people aged 15–59 accounted for the largest proportion, at [工作值], while those over 60 represented [長者值]; children made up only [兒童值]',meaning:'意大利 2000 年 15–59 歲 61.6% 最大，60+ 24.1%，0–14 歲 14.3%。',usage:'三項屬意大利同一年；61.6+24.1+14.3=100%。',parts:[link('In'),slot(' 2000','實際年'),link(', people aged 15–59 accounted for the largest proportion, at'),slot(' 61.6%','工作值'),link(', while those over 60 represented'),slot(' 24.1%','長者值'),link('; children made up only'),slot(' 14.3%.','兒童值')]}),
 f('By 2060, the 60-plus group is projected to surge to 40.0%, close to the working-age share of 47.0%, whereas the youngest group will shrink slightly to 13.0%.','預測年對照長者急升、工作年齡仍略高及兒童下降',[0,4,7],{formula:'By [預測年], the 60-plus group is projected to surge to [長者值], close to the working-age share of [工作值], whereas the youngest group will shrink slightly to [兒童值]',meaning:'意大利 2050 年預測 60+ 42.3%，接近 15–59 歲 46.2%；兒童降至 11.5%。',usage:'42.3% 仍低於 46.2%，因此寫 close to 而非超過；三項都是預測。',parts:[link('By'),slot(' 2050','預測年'),link(', the 60-plus group is projected to surge to'),slot(' 42.3%','長者值'),link(', close to the working-age share of'),slot(' 46.2%','工作值'),link(', whereas the youngest group will shrink slightly to'),slot(' 11.5%.','兒童值')]}),
];
const intro=[
 quiz('2000 與 2050 年的數字性質有何不同？',['2000 年是基年數據，2050 年是預測','兩年都是已發生的實際數據','2000 年是預測，2050 年是實際','兩年都是人口總人數'],'題目明示 2050 年為 projections，回答時要用預測措辭。'),
 {type:'multi',prompt:'哪兩項最適合放入整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '也門在 2000 年較意大利年輕，2050 年預測仍較年輕',
  '兩國兒童份額預測下降，長者份額預測上升，意大利 60+ 上升尤為明顯',
  '兩國 2050 年的兒童比例都將上升',
  '意大利 2050 年 60+ 一定超過工作年齡組',
 ],correct:[0,1],why:'概覽分清兩國持續差異與共同老化；意大利 60+ 雖接近，仍未超過工作年齡。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代也門、意大利三年齡組，2000 年實際與 2050 年預測。'],
 ['整體概覽','也門仍較年輕；兩國兒童份額下降、長者上升。'],
 ['也門細節','2000 年兒童 50.1% 略高於工作年齡 46.3%；2050 年預測排名互換，長者仍少。'],
 ['意大利細節','2000 年工作年齡 61.6% 最大；2050 年 60+ 急升至 42.3%，接近工作年齡 46.2%。'],
],'先按國家分段，再在每國內按實際年→預測年比較同一組。')];
const evidence=[
 quiz('也門 2000 年哪個年齡組最大？',['0–14 歲 50.1%','15–59 歲 57.3%','60+ 42.3%','0–14 歲 14.3%'],'也門 2000 年兒童 50.1%，略高於 15–59 歲 46.3%。'),
 quiz('也門 2050 年預測哪組變為最大？',['15–59 歲 57.3%','0–14 歲 50.1%','60+ 42.3%','15–59 歲 46.2%'],'也門 15–59 歲預測升至 57.3%，兒童降至 37.0%。'),
 quiz('也門 60+ 在 2000→2050 年如何？',['3.6% 預測升至 5.7%，仍為最小組','24.1% 升至 42.3%','5.7% 降至 3.6%','由 37% 升至 57.3%'],'也門兩圖白色 60+ 扇區為 3.6% 與 5.7%。'),
 quiz('意大利 2000 年三組比例依 0–14／15–59／60+ 是多少？',['14.3%、61.6%、24.1%','50.1%、46.3%、3.6%','11.5%、46.2%、42.3%','37.0%、57.3%、5.7%'],'意大利 2000 年兒童 14.3、工作年齡 61.6、長者 24.1%。'),
 quiz('意大利 2050 年預測 60+ 與 15–59 歲分別是多少？',['42.3% 與 46.2%，相當接近','46.2% 與 42.3%，長者已較大','5.7% 與 57.3%','24.1% 與 61.6%'],'意大利 60+ 預測急升至 42.3%，仍略低於工作年齡 46.2%。'),
 quiz('哪個數據最直接支持「也門兩年都較年輕」？',['也門 0–14 歲 50.1→37.0%，意大利 14.3→11.5%','也門 60+ 42.3%，意大利 5.7%','兩國兒童都恰好 50.1%','意大利 0–14 歲在 2050 年有 57.3%'],'兩年份也門兒童份額都遠高於意大利。'),
 quiz('意大利 60+ 由 24.1% 到 42.3% 增加多少？',['18.2 個百分點','18.2% 的相對增幅','42.3 個百分點','24.1 個百分點'],'42.3−24.1=18.2 個百分點；不是相對增幅。'),
];
const logic=[
 sequence('用同一顏色／紋理核對三組與兩國',[
  ['也門 2000','兒童 50.1，工作年齡 46.3，長者 3.6%。'],
  ['也門 2050 預測','兒童 37.0，工作年齡 57.3，長者 5.7%。'],
  ['意大利 2000','兒童 14.3，工作年齡 61.6，長者 24.1%。'],
  ['意大利 2050 預測','兒童 11.5，工作年齡 46.2，長者 42.3%。'],
 ],'每張圖三扇區合為 100%；2050 年一律作預測。'),
 sequence('按年齡組追蹤變化，才形成概覽',[
  ['兒童','兩國份額都下降：也門 50.1→37.0，意大利 14.3→11.5。'],
  ['工作年齡','也門 46.3→57.3，超過兒童；意大利 61.6→46.2。'],
  ['長者','也門 3.6→5.7，仍很少；意大利 24.1→42.3，接近工作年齡。'],
  ['跨國比較','也門兩年兒童份額遠高於意大利，因此預測年仍較年輕。'],
 ],'分清同組跨年、同年跨國兩種比較，不把預測當作已發生。'),
];
const transfers=[
 transfer('某圖展示甲乙兩國 2010 年年齡分布，另提供 2060 年預測。','哪句引言把實際與預測分清？',['圓餅圖比較甲乙兩國 2010 年年齡結構，並展示 2060 年預測。','圖表比較甲乙兩國已確定的 2060 年人口。','圖表顯示 2010 和 2060 年的精確人口總數。','圖表解釋兩國出生率變化的原因。'],['兩國、年齡份額、實際年和預測年都清楚。','2060 尚是預測。','圖中只有比例。','沒有原因資料。'],[0],'原文 2000 年是基年、2050 年是 projection。'),
 transfer('甲國兒童在兩年均比乙國多，甲國 2010 年兒童 48%、乙國 16%，2060 年預測為 35%、12%。','哪句跨國概覽準確？',['甲國基年較年輕，預測年仍將較年輕。','乙國兩年都比甲國年輕。','兩國 2060 年兒童比例完全相同。','甲國兒童到 2060 年一定增加。'],['甲國兩年兒童份額均高於乙國。','乙國兒童份額較低。','35 與 12 不同。','甲國 48→35 下降。'],[1],'原文也門 0–14 歲兩年份額都遠高於意大利。'),
 transfer('甲乙兩國兒童份額預測下降、60+ 份額預測上升；乙國 60+ 升幅更大。','哪句同時交代共同方向與突出一國？',['兩國人口結構預計變老，乙國長者份額的上升尤其明顯。','兩國兒童份額都預測上升。','兩國所有年齡組的份額都同時上升。','乙國 60+ 的份額預測下降。'],['共同方向與乙國特點都說準。','兒童方向相反。','三組份額加總固定 100%，不可全升。','乙國 60+ 上升。'],[2],'原文兩國預計老化，意大利 60+ 升幅尤大。'),
 transfer('甲國基年兒童 51%，15–59 歲 45%。','哪句同年比較準確？',['兒童略多於一半，也稍高於 15–59 歲的 45%。','15–59 歲的 45% 高於兒童 51%。','兒童恰好佔一半。','兩組合計只有 45%。'],['51% 略多於 50%，亦高於 45%。','45 小於 51。','51 不等於 50。','51+45=96%。'],[3],'原文也門 2000 年兒童 50.1%，略高於工作年齡 46.3%。'),
 transfer('甲國兒童基年 51% 領先、工作年齡 45%；末年預測兒童 38%、工作年齡 56%。','哪句解釋「排名反轉」？',['末年工作年齡預計升至 56%，超過降至 38% 的兒童。','末年兒童仍以 51% 領先。','兩組末年都將達 56%。','工作年齡基年已高於兒童。'],['首位由兒童換成工作年齡。','末年兒童是 38%。','兩組末值不同。','基年兒童 51 高於 45。'],[4],'原文也門 2050 年工作年齡預測 57.3% 超過兒童 37.0%。'),
 transfer('甲國 60+ 由基年 4% 預測升至 6%，但另兩組仍逾 35%。','哪句同時表達上升與仍少？',['長者份額預計由 4% 增至 6%，但仍遠小於另兩組。','長者份額預計下降至 4%。','長者末年將成最大組。','長者兩年都佔 60%。'],['本組增長但相對其他組仍小。','方向相反。','6% 遠低於另兩組。','4% 與 6% 都非 60%。'],[5],'原文也門 60+ 預測由 3.6% 升至 5.7%，仍為小組。'),
 transfer('甲國 60+ 基年 25%，乙國僅 4%；甲國兒童 15%，乙國 51%。','哪句跨國過渡準確？',['甲國的年齡結構遠比乙國老。','乙國 60+ 遠比甲國多。','甲乙兩國年齡結構完全相同。','甲國兒童是乙國三倍。'],['長者較多、兒童較少，支持甲國較老。','乙國 60+ 只有 4%。','兩數差距大。','15 小於 51。'],[6],'原文 Italy showed a far older structure，意大利長者份額遠高於也門。'),
 transfer('乙國基年兒童 15%、15–59 歲 60%、60+ 25%。','哪句配準三組及排名？',['15–59 歲 60% 最大；60+ 為 25%，兒童只有 15%。','兒童 60% 最大；60+ 為 15%。','三組都是 25%。','60+ 只有 15%，兒童 25%。'],['三值按年齡組正確配回。','把兒童與工作年齡對調。','三值不同。','長者與兒童對調。'],[7],'原文意大利 2000 年工作年齡 61.6%、長者 24.1%、兒童 14.3%。'),
 transfer('乙國末年預測 60+ 40%、15–59 歲 47%、0–14 歲 13%。','哪句不把「接近」誤寫成「超過」？',['60+ 預計急升至 40%，接近仍為最高的工作年齡 47%；兒童降至 13%。','60+ 的 40% 已超過工作年齡 47%。','兒童以 47% 成為最大組。','三組末年完全相等。'],['40 接近但低於 47；兒童最小。','40 小於 47。','兒童是 13。','三值不同。'],[8],'原文意大利 2050 年 60+ 42.3% 接近工作年齡 46.2%，仍未超越。'),
 transfer('某國 60+ 的份額由 24.1% 預測至 42.3%。','哪句用百分點表達差值？',['預測增加 18.2 個百分點。','預測增加 18.2% 的相對比例。','預測增加 42.3 個百分點。','預測減少 18.2 個百分點。'],['42.3−24.1=18.2 個百分點。','相對增幅約 75.5%。','42.3 是末值。','方向是上升。'],[8],'原文意大利 60+ 由 24.1% 預測升至 42.3%。'),
];
const balancedTransferOptions=[
 ['圓餅圖比較甲乙兩國2010年的年齡結構及2060年的預測。','圓餅圖比較甲乙兩國在2060年已確定的人口結構。','圓餅圖比較甲乙兩國2010及2060年的實際總人口。','圓餅圖解釋甲乙兩國出生率變化的確切原因。'],
 ['甲國基年兒童份額較高，預測年仍會較年輕。','乙國基年兒童份額較高，預測年仍會較年輕。','甲乙兩國2060年兒童份額將會完全相同。','甲國兒童份額到2060年必然比基年增加。'],
 ['兩國預計老化，乙國長者份額上升尤其明顯。','兩國預計變年輕，兒童份額都將大幅上升。','兩國各年齡組份額預計同時上升，沒有例外。','乙國長者份額預計下降，兒童份額卻上升。'],
 ['甲國兒童佔51%，略多於一半，也高於工作年齡45%。','甲國工作年齡佔45%，因此高於兒童的51%。','甲國兒童佔51%，恰好等於總人口的一半。','甲國兒童與工作年齡合計只佔45%，不到一半。'],
 ['末年工作年齡預計升至56%，並超過兒童的38%。','末年兒童仍佔51%並保持第一，工作年齡較少。','末年兒童與工作年齡都佔56%，兩組並列首位。','基年工作年齡已高於兒童，末年維持同一排名。'],
 ['長者由4%預計增至6%，但仍遠少於另兩組。','長者由6%預計降至4%，與另兩組差距擴大。','長者末年將佔60%，超越另兩組成為最多。','長者在兩個年份都佔60%，份額沒有變化。'],
 ['甲國長者較多、兒童較少，因此年齡結構較乙國老。','乙國長者較多、兒童較少，因此年齡結構較甲國老。','甲乙兩國長者與兒童份額一樣，結構完全相同。','甲國兒童份額為乙國三倍，因此結構更年輕。'],
 ['工作年齡60%最大，長者25%其次，兒童15%最少。','兒童60%最大，長者15%其次，工作年齡25%最少。','兒童、工作年齡與長者各佔25%，三組相同。','長者15%最少，兒童25%其次，工作年齡60%最大。'],
 ['長者預計升至40%，接近但低於工作年齡47%；兒童13%。','長者預計升至40%，已經超過工作年齡47%。','兒童預計升至47%，超過長者與工作年齡。','三組在末年都恰好佔40%，份額完全相等。'],
 ['長者份額預計增加18.2個百分點，方向為上升。','長者份額預計只增加18.2%，屬相對增幅。','長者份額預計增加42.3個百分點，等於末值。','長者份額預計減少18.2個百分點，方向為下降。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-pie-charts:5',meta:{topic:'也門與意大利 2000 年及 2050 年預測年齡結構',summary:'嚴格區分實際與預測；也門始終較年輕但兩國均老化，也門最大組由兒童轉工作年齡，意大利 60+ 接近工作年齡。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
