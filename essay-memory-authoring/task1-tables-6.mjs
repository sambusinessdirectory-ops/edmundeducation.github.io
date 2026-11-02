// Task 1 Tables 6: first-year students rating five course aspects "very good".
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'每個百分比是該學科一年級受訪學生給「very good」的比例。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按教學相關項目與其他項目分組，比較三門課程。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows the percentages of first-year Economics, Law and Commerce students who said five parts of their course were “very good”.',
 'Overall, Commerce got the highest rating, or shared the highest rating, in all five parts.',
 'Economics scored well for teaching and tutor help but poorly for information before the course and learning materials. Law scores were more even, and teaching was its lowest score.',
 'For teaching quality, 95% of Economics and Commerce students gave “very good”, compared with 67% of Law students.',
 'Tutor help was similar: Commerce got 93%, Economics 92%, and Law a lower but still good 79%.',
 'So Economics and Commerce led in teaching quality and tutor help.',
 'Commerce also did best in the other three parts.',
 'For information before the course, Commerce got 95%, Law 72%, and Economics only 55%.',
 'Printed materials had the same order: Commerce 81%, Law 70%, and Economics 59%.',
 'For other materials, Commerce again had the highest score at 85%, Law had 80%, and Economics had the lowest at 62%.',
];
const vocabulary=[
 v(['compares','shows','比較'],['percentages','percentages','百分比'],['first-year students','first-year','一年級學生'],['rated five aspects','said five parts','評價五個方面']),
 v(['strongest evaluations','highest rating','最高評價'],['leading or sharing first place','highest rating, or shared the highest rating','獨佔或並列第一'],['every aspect','all five parts','所有五個方面']),
 v(['rated highly','scored well','評價較高'],['tutor support','tutor help','導師支援'],['much less favourably','poorly','評價較低'],['more balanced pattern','more even','較平均的分布'],['weakest area','lowest score','最弱項']),
 v(['In terms of','For','就某項而言'],['teaching-related measures','teaching quality','教學相關方面'],['recorded 95%','95%','錄得百分之九十五'],['far above','compared with','遠高於／對比']),
 v(['Tutor support','Tutor help','導師支援'],['marginally ahead','Commerce got 93%, Economics 92%','略微領先'],['close behind','Economics 92%','緊隨其後'],['fairly positive','still good','仍較正面']),
 v(['These figures','So','這些數字顯示'],['clear leaders','led','明顯領先'],['two areas','teaching quality and tutor help','兩個方面']),
 v(['remaining aspects','other three parts','其餘三個方面'],['again stood out','also did best','再次突出']),
 v(['achieved 95%','got 95%','達百分之九十五'],['compared with','Law 72%','相比'],['just 55%','only 55%','只有百分之五十五']),
 v(['same hierarchy','same order','相同排序'],['printed resources','Printed materials','印刷資源'],['respectively','Commerce 81%, Law 70%, and Economics 59%','按先後次序']),
 v(['Other resources','other materials','其他資源'],['rated most highly','highest score','評價最高'],['followed by','Law had','其次'],['clearly behind','lowest','明顯落後']),
];
const structures=[
 f('The table compares the percentages of first-year students in Physics, History and Business who rated five aspects of their course as “very good”.','交代受訪者、課程、五項評價及評級門檻',[1,3,7],{formula:'The table compares the percentages of first-year students in [三門課程] who rated five aspects of their course as “very good”',meaning:'三門課一年級學生對五個項目評「very good」的比例。',usage:'比例是給特定評級的人數占該課程受訪者，不是課程平均分。',parts:[link('The table compares the percentages of first-year students in '),slot('Economics, Law and Commerce','課程'),link(' who rated five aspects of their course as “very good”.')]}),
 f('Overall, Business received the strongest evaluations, leading or sharing first place in every aspect.','概覽一個課程在全部項目都獨佔或並列最高',[0,3,7],{formula:'Overall, [課程] received the strongest evaluations, leading or sharing first place in every aspect',meaning:'Commerce 在五項中四項獨佔最高；teaching quality 與 Economics 並列 95%。',usage:'並列第一不能寫成 Commerce 每項都獨自第一。',parts:[link('Overall, '),slot('Commerce','總體最佳課程'),link(' received the strongest evaluations, leading or sharing first place in every aspect.')]}),
 f('Physics was rated highly for teaching and tutor support but much less favourably for pre-course information and resources, whereas History showed a more balanced pattern, with teaching quality its weakest area.','用 whereas 對比兩門課不同強弱分布',[0,3,7],{formula:'[課程甲] was rated highly for [強項] but much less favourably for [弱項], whereas [課程乙] showed a more balanced pattern, with [最弱項] its weakest area',meaning:'Economics 95/92 教學與導師高，55/59/62 其他低；Law 67–80 比較平均，teaching 67 最低。',usage:'balanced 指這一列不同項目的分布較接近，非「所有項目都好」。',parts:[slot('Economics','課程甲'),link(' was rated highly for '),slot('teaching and tutor support','強項'),link(' but much less favourably for '),slot('pre-course information and resources','弱項'),link(', whereas '),slot('Law','課程乙'),link(' showed a more balanced pattern, with '),slot('teaching quality','最弱項'),link(' its weakest area.')]}),
 f('In terms of teaching-related measures, Physics and Business both recorded 90% for teaching quality, far above History at 60%.','按一個評價項目橫向比較三門課',[0,2,7],{formula:'In terms of teaching-related measures, [兩課程] both recorded [共同值] for teaching quality, far above [第三課程] at [數值]',meaning:'Economics 與 Commerce 教學品質皆 95%；Law 為 67%。',usage:'同一欄不同課程可比較；95% 指各課程中給非常好的比例。',parts:[link('In terms of teaching-related measures, '),slot('Economics and Commerce','並列課程'),link(' both recorded '),slot('95%','共同值'),link(' for teaching quality, far above '),slot('Law','比較課程'),link(' at '),slot('67%','數值'),link('.')]}),
 f('Tutor support followed a similar pattern: Business was marginally ahead at 90%, with Physics close behind at 89%, while History was lower, though still fairly positive, at 75%.','依序報相近兩個高值及較低第三值',[0,2,7],{formula:'Tutor support followed a similar pattern: [首位] was marginally ahead at [值], with [第二] close behind at [值], while [第三] was lower, though still fairly positive, at [值]',meaning:'Tutor support：Commerce 93、Economics 92、Law 79%。',usage:'marginally ahead 是 93 與 92 差 1 百分點，不是顯著差距。',parts:[link('Tutor support followed a similar pattern: '),slot('Commerce','首位'),link(' was marginally ahead at '),slot('93%','首位值'),link(', with '),slot('Economics','第二'),link(' close behind at '),slot('92%','第二值'),link(', while '),slot('Law','第三'),link(' was lower, though still fairly positive, at '),slot('79%','第三值'),link('.')]}),
 f('These figures made Physics and Business the clear leaders in these two areas.','把前兩項數值歸結成一句有限範圍的比較',[0,2,7],{formula:'These figures made [兩課程] the clear leaders in these two areas',meaning:'教學品質：Economics/Commerce 95；導師支援：Commerce 93、Economics 92，均高於 Law。',usage:'these two areas 只指 teaching quality 和 tutor support，不是所有五項。',parts:[link('These figures made '),slot('Economics and Commerce','領先課程'),link(' the clear leaders in these two areas.')]}),
 f('For the remaining aspects, Business again stood out.','用短句轉向其餘三個評價項目',[0,2,7],{formula:'For the remaining aspects, [課程] again stood out',meaning:'下段轉往課前資料、印刷資源、其他資源；Commerce 皆最高。',usage:'過渡句須由後續具體數字支持。',parts:[link('For the remaining aspects, '),slot('Commerce','突出課程'),link(' again stood out.')]}),
 f('It achieved 90% for pre-course information, compared with 70% for History and just 50% for Physics.','同一項列第一、中間及最低三個值',[0,2,6],{formula:'It achieved [高值] for pre-course information, compared with [中值] for [課程] and just [低值] for [課程]',meaning:'課前資料 Commerce 95、Law 72、Economics 55%。',usage:'It 承接上句 Commerce；不能讓指代變成 Economics 或 Law。',parts:[link('It achieved '),slot('95%','高值'),link(' for pre-course information, compared with '),slot('72%','中值'),link(' for '),slot('Law','中間課程'),link(' and just '),slot('55%','低值'),link(' for '),slot('Economics','最低課程'),link('.')]}),
 f('The same hierarchy appeared for printed resources, at 80%, 70% and 60%, respectively.','沿用上句三課程排序並用 respectively 配對',[0,2,6],{formula:'The same hierarchy appeared for printed resources, at [第一值], [第二值] and [第三值], respectively',meaning:'沿用 Commerce、Law、Economics 的次序：81、70、59%。',usage:'respectively 必須對應前句的 Commerce、Law、Economics，否則讀者無法辨值。',parts:[link('The same hierarchy appeared for printed resources, at '),slot('81%','第一值'),link(', '),slot('70%','第二值'),link(' and '),slot('59%','第三值'),link(', respectively.')]}),
 f('Other resources were also rated most highly in Business, at 88%, followed by History at 77%, leaving Physics clearly behind at 60%.','用 followed by 和 leaving 串起三個遞減值',[0,2,6],{formula:'Other resources were also rated most highly in [首位], at [值], followed by [第二] at [值], leaving [第三] clearly behind at [值]',meaning:'其他資源 Commerce 85、Law 80、Economics 62%。',usage:'三個值是同一項目跨三門課比較，不能與 printed resources 混合。',parts:[link('Other resources were also rated most highly in '),slot('Commerce','首位'),link(', at '),slot('85%','首位值'),link(', followed by '),slot('Law','第二'),link(' at '),slot('80%','第二值'),link(', leaving '),slot('Economics','第三'),link(' clearly behind at '),slot('62%','第三值'),link('.')]}),
];
const intro=[quiz('95% 這類數值表示甚麼？',['該課程受訪一年級學生評某項「very good」的比例','所有學生的考試分數','課程內容的完成百分比','教師的工資增長率'],'題目說 how many students considered each aspect very good，以百分比列出。'),{type:'multi',prompt:'哪兩個概覽最準確？',detail:'選兩項，再按「確認」。',options:['Commerce 每項獨佔或並列最高','Economics 在教學及導師支援方面強，但資源較弱','Law 五項全部第一','五項數值都是各課程考試分數'],correct:[0,1],why:'Commerce 整體最佳；Economics 強弱差異明顯。'}];
const route=[sequence('依範文排課程滿意度報告',[
 ['引言','三門課的一年級學生給五個方面「very good」的比例。'],['概覽','Commerce 全面領先；Economics 教學相關高、其他較低；Law 較平均。'],['教學兩項','Teaching 95/67/95；Tutor support 92/79/93，依 Economics/Law/Commerce。'],['其他三項','課前資料、印刷資源、其他資源皆 Commerce > Law > Economics。'],
 ],'同一項目跨課程比較，且全篇維持一致的課程順序。')];
const evidence=[
 quiz('哪門課在五項都獨佔或並列最高？',['Commerce','Economics','Law','三者始終並列'],'Commerce teaching 與 Economics 並列 95%，其餘四項最高。'),
 quiz('Teaching quality 的三課程數值？',['Economics 95%、Law 67%、Commerce 95%','Economics 55%、Law 72%、Commerce 95%','Economics 92%、Law 79%、Commerce 93%','Economics 59%、Law 70%、Commerce 81%'],'要辨同一欄，不能跨欄混數字。'),
 quiz('Tutor support 第一與第二相差多少？',['1 個百分點','10 個百分點','14 個百分點','0 個百分點'],'Commerce 93%、Economics 92%。'),
 quiz('Law 哪一項是本課最低？',['Teaching quality 67%','Pre-course information 72%','Print resources 70%','Other resources 80%'],'Law 五值中 67% 最低。'),
 quiz('Printed resources 的排序？',['Commerce 81% > Law 70% > Economics 59%','Law > Commerce > Economics','Economics > Commerce > Law','三者並列'],'這也是 pre-course information 的排序。'),
];
const logic=[sequence('按項目橫向比較，不把列與欄讀錯',[
 ['Teaching quality','Economics/Commerce 95%，Law 67%。'],['Tutor support','Commerce 93%，Economics 92%，Law 79%。'],['Pre-course information','Commerce 95%，Law 72%，Economics 55%。'],['Resources','Print 81/70/59、other 85/80/62，均 Commerce/Law/Economics。'],
 ],'在一個項目內比較三門課，才能說出領先或落後。'),sequence('處理並列與指代',[
 ['並列','Commerce 和 Economics 在 teaching quality 均 95%。'],['獨佔','Commerce 在另四項獨佔最高。'],['It','原文 It achieved 95% 指 Commerce。'],['respectively','81、70、59 依前句 Commerce、Law、Economics 排列。'],
 ],'代詞與 respectively 的指向須讓讀者可追溯。')];
const transfers=[
 transfer('另一份問卷請一年級學生把課程各方面評為「very good」。','哪句準確交代百分比？',['「非常好」的評價比例，以該課程新生為分母。','百分比是教師的平均分數。','百分比是所有學生人數的總和。','每個學生都只評教學品質。'],['評級門檻與分母正確。','非教師分數。','非人數總和。','有五項。'],[0],'原文 percentages of first-year students rated “very good”。'),
 transfer('Commerce 五項中四項獨佔最高，教學品質與 Economics 並列。','哪句概覽不抹掉並列？',['Commerce 在每一項都獨佔或並列第一。','Commerce 在每項都獨自第一。','Economics 在五項全部第一。','Commerce 在教學品質最低。'],['兼容 teaching 的 95% 並列。','教學品質並列。','Economics 三項較低。','Commerce teaching 95%。'],[1],'原文 leading or sharing first place。'),
 transfer('Economics 教學 95、導師 92，但課前資訊 55、印刷資源 59。','哪句總結同一門課的強弱？',['Economics 的教學和導師支援評價高，課前資訊和資源較弱。','Economics 所有項目都只有 55%。','Economics 在印刷資源得 95%。','Economics 在五項都高於 Commerce。'],['強弱分布符合該列。','其他值不同。','print 是 59%。','Commerce 較高或並列。'],[2],'原文 Economics highly for teaching/tutor but less for information/resources。'),
 transfer('Teaching quality：Economics 95、Commerce 95、Law 67%。','哪句比較同一欄？',['Economics 與 Commerce 同為 95%，明顯高於 Law 的 67%。','Law 以 95% 獨佔第一。','三門課均為 67%。','Economics 與 Commerce 差 28 點。'],['並列及第三值正確。','Law 67%。','兩門 95%。','兩者相同。'],[3],'原文 both recorded 95%，far above Law 67%。'),
 transfer('Tutor support：Commerce 93、Economics 92、Law 79%。','哪句表達輕微領先？',['Commerce 僅以 1 個百分點領先 Economics，Law 為 79%。','Commerce 比 Economics 高 14 點。','Economics 比 Commerce 高 1 點。','Law 以 93% 領先。'],['93−92=1。','14 是 Commerce−Law。','方向反。','Law 79%。'],[4],'原文 marginally ahead，close behind。'),
 transfer('教學品質和導師支援兩項均由 Economics/Commerce 佔前。','哪句限定結論範圍？',['這兩個教學相關方面由 Economics 和 Commerce 領先。','所有五項都由 Economics 領先。','導師支援只有 Law 受評。','兩項都無法比較。'],['只概括前文兩項。','Economics 其他項不領先。','三門均有值。','可比較。'],[5],'原文 these two areas。'),
 transfer('其餘項目：課前資訊、印刷資源、其他資源。','哪句適合轉入這三項？',['其餘評價方面，Commerce 再次表現突出。','其餘三項都是教學品質。','Commerce 在其餘三項都最低。','表格沒有資源數據。'],['短句引出後續數字。','項目不同。','Commerce 都最高。','有兩類資源。'],[6],'原文 For the remaining aspects，Commerce stood out。'),
 transfer('課前資訊：Commerce 95、Law 72、Economics 55%。','哪句順序與指代清楚？',['Commerce 得 95%，Law 72%，Economics 只有 55%。','Law 得 95%，Commerce 只有 55%。','Economics 與 Commerce 都得 72%。','三門課都得 95%。'],['高、中、低對應正確。','數值錯置。','兩值都錯。','不相同。'],[7],'原文 It achieved 95%，compared with Law 72 and Economics 55。'),
 transfer('上一句順序是 Commerce、Law、Economics；印刷資源是 81、70、59%。','哪句正確運用「分別」？',['印刷資源按上述次序分別為 81%、70% 和 59%。','印刷資源按上述次序分別為 59%、70% 和 81%。','81%、70%、59% 是同一門課的三年數值。','Commerce 的印刷資源只有 59%。'],['respectively 沿用同一順序。','前後顛倒。','表只有一個時間點。','Commerce 81%。'],[8],'原文 same hierarchy，respectively。'),
 transfer('Other resources：Commerce 85、Law 80、Economics 62%。','哪句保留三者相對位置？',['Commerce 以 85% 最高，其次 Law 80%，Economics 以 62% 落後。','Economics 以 85% 最高。','Law 以 62% 墊底。','三者都是 80%。'],['排序與數字都正確。','Economics 62%。','Law 80%。','三值不同。'],[9],'原文 most highly Commerce，followed by Law，leaving Economics behind。'),
];
const balancedTransferOptions=[
  ['該課程新生評「非常好」的學生比例。','該課程教師評「非常好」的教師比例。','全部學生評「及格」的學生比例。','該課程新生評教學品質的學生比例。'],
  ['Commerce 五項均居首，教學品質與 Economics 並列。','Commerce 五項均獨居首，教學品質高於 Economics。','Economics 五項均居首，教學品質與 Commerce 並列。','Commerce 五項均居首，但教學品質低於 Law。'],
  ['Economics 教學與導師評價高，課前資訊及資源較弱。','Economics 印刷資源評價最高，教學與導師評價較弱。','Economics 教學與導師評價高，課前資訊也最高。','Economics 五項評價相近，沒有明顯的強弱差別。'],
  ['Economics、Commerce 教學均為 95%，Law 為 67%。','Law、Commerce 教學均為 95%，Economics 為 67%。','Economics、Commerce 教學均為 67%，Law 為 95%。','Economics 教學為 95%，Commerce 比它低 28 點。'],
  ['Commerce 導師支援比 Economics 高 1 點，Law 得 79%。','Commerce 導師支援比 Economics 高 14 點，Law 得 79%。','Economics 導師支援比 Commerce 高 1 點，Law 得 79%。','Law 導師支援比 Commerce 高 1 點，Economics 得 79%。'],
  ['教學品質與導師支援兩項，由 Economics 與 Commerce 領先。','五項相關評價全都由 Economics 與 Commerce 並列領先。','教學品質與導師支援兩項，只由 Law 學生評價。','教學品質與導師支援兩項，由 Law 與 Economics 領先。'],
  ['其餘三項評價，Commerce 仍然表現突出。','其餘三項評價，Economics 全部表現最好。','其餘三項評價，Commerce 全部跌至最低。','其餘三項評價，只記錄教學品質數據。'],
  ['課前資訊：Commerce 95%、Law 72%、Economics 55%。','課前資訊：Law 95%、Commerce 72%、Economics 55%。','課前資訊：Commerce 95%、Economics 72%、Law 55%。','課前資訊：Commerce 55%、Law 72%、Economics 95%。'],
  ['印刷資源依次為 Commerce 81%、Law 70%、Economics 59%。','印刷資源依次為 Commerce 59%、Law 70%、Economics 81%。','印刷資源依次為 Commerce 81%、Economics 70%、Law 59%。','印刷資源依次為 Commerce 81%、Law 70%、Economics 95%。'],
  ['其他資源：Commerce 85%、Law 80%、Economics 62%。','其他資源：Economics 85%、Law 80%、Commerce 62%。','其他資源：Commerce 85%、Economics 80%、Law 62%。','其他資源：Commerce 62%、Law 80%、Economics 85%。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-tables:6',meta:{topic:'大學新生對三門課程五個方面的「非常好」評價',summary:'Commerce 在五項都獨佔或並列最高；Economics 教學品質和導師支援高，課前資訊與資源較弱；Law 五項相對均衡，教學品質最低。百分比是各課程受訪新生給該項「非常好」的比例。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
