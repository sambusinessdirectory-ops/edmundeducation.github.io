// Task 1 Bar Charts 6: 2010 Australian physical-activity chart, age groups are cross-sectional.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀圖表，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
 'The bar chart shows the percentages of Australian men and women who exercised regularly in six age groups in 2010.',
 'Overall, a higher percentage of women than men exercised regularly in five age groups. Men had a higher percentage only in the 15–24 group.',
 'The men’s percentage was highest in the 15–24 group and lowest in the 35–44 group. It was higher again in the older groups. The women’s percentages stayed between about 48% and 53% in most groups.',
 'In the 15–24 group, 52.8% of men did regular exercise, compared with 47.7% of women.',
 'The ranking was the other way round in the next groups. Men’s exercise rate fell to 42.2% among 25- to 34-year-olds and reached its lowest value, 39.5%, among 35- to 44-year-olds.',
 'For women in those two groups, the rates increased from 48.9% to 52.5%. The difference between women and men in the 35–44 group was the largest, at 13 percentage points.',
 'In the older groups, men’s rate rose from 43.1% for 45–54-year-olds to 45.1% for 55–64-year-olds and 46.7% for people aged 65 and over.',
 'Women’s rate was highest in the 45–54 group, at 53.3%. It was nearly as high in the 55–64 group, at 53.0%.',
 'In the 65-and-over group, however, women’s rate fell to 47.1%, almost the same as men’s 46.7%.',
];
const vocabulary=[
 v(['compares','shows','顯示'],['percentages','percentages','百分比'],['did regular physical activity','exercised regularly','定期運動'],['six age groups','six age groups','六個年齡組']),
 v(['more active than men','a higher percentage of women than men exercised regularly','女性參與率較高'],['all age groups except 15–24','five age groups','除了十五至二十四歲外的所有組別']),
 v(['Male participation','men’s percentage','男性參與率'],['youngest adults','15–24 group','最年輕成人組'],['fell to a low in middle age','lowest in the 35–44 group','在中年組最低'],['rising gradually','higher again','其後較高'],['remained relatively steady','stayed between about 48% and 53%','大致平穩']),
 v(['In the 15–24 group','In the 15–24 group','十五至二十四歲組'],['exercised regularly','did regular exercise','定期運動'],['compared with','compared with','與……相比']),
 v(['pattern then reversed','ranking was the other way round','高低次序其後倒轉'],['male participation','Men’s exercise rate','男性運動比例'],['dropped to','fell to','降至'],['reached its lowest point','reached its lowest value','達到最低點']),
 v(['By contrast','For women','相比之下'],['corresponding female rates','rates','相應女性比例'],['rose from','increased from','由……上升'],['largest gender gap','difference between women and men','最大男女差距'],['percentage points','percentage points','百分點']),
 v(['male figure','men’s rate','男性比例'],['recovered from','rose from','回升起點'],['those aged 45–54','45–54-year-olds','四十五至五十四歲的人'],['people aged 65 and over','people aged 65 and over','六十五歲及以上人士']),
 v(['reached their peak','was highest','達到最高'],['remained almost as high','was nearly as high','幾乎一樣高'],['55–64s','55–64 group','五十五至六十四歲組']),
 v(['oldest cohort','65-and-over group','最年長組'],['female participation','women’s rate','女性參與率'],['fell to','fell to','降至'],['almost matching','almost the same as','幾乎相等']),
];
const structures=[
 f('The bar chart compares the percentages of men and women in six age groups who used public transport in 2020.','引言界定男女、年齡組、行為、百分比和單一年份',[1,3,6],{formula:'The [圖表類型] compares the percentages of [兩組人] in [年齡組數] who [行為] in [年份]',meaning:'圖表比較 2010 年澳洲男女六個年齡組定期運動的百分比。',usage:'單一年份的分組圖須交代人口組別、年齡分類、觀察行為及百分比；不要暗示多年追蹤。',parts:[link('The'),slot(' bar chart','圖表類型'),link(' compares the percentages of'),slot(' Australian men and women','兩組人'),link(' in'),slot(' six age groups','年齡組數'),link(' who'),slot(' did regular physical activity','行為'),link(' in'),slot(' 2010.','年份')]}),
 f('Overall, women used public transport more often than men in all age groups except 15–24.','概覽指出跨組別的普遍排名及唯一例外',[0,3,8],{formula:'Overall, [甲組及其較高行為] than [乙組] in all age groups except [例外組]',meaning:'六個年齡組中，除 15–24 歲外，女性的定期運動率都高於男性。',usage:'某組在多數年齡類別領先時，要把唯一反轉的年齡組清楚寫出。',parts:[link('Overall,'),slot(' women were more active','甲組及其較高行為'),link(' than'),slot(' men','乙組'),link(' in all age groups except'),slot(' 15–24.','例外組')]}),
 f('Male bus use was highest among the youngest adults, then fell to a low in middle age before rising gradually, while female figures stayed near 50%.','概述兩組橫跨年齡類別的不同形狀，不把橫斷面誤作多年變化',[1,4,7],{formula:'[甲組] was highest among [最年輕組], then fell to a low in [中間組] before rising, while [乙組] remained steady',meaning:'男性比例在最年輕組最高、35–44 歲最低、較年長組再較高；女性多數組別約 48% 至 53%。',usage:'按年齡排序比較同一年不同組別，可概括曲線形狀；「再上升」描述組別數值，並非追蹤同一批人。',parts:[slot('Male participation','甲組'),link(' was highest among'),slot(' the youngest adults','最年輕組'),link(', then fell to a low in'),slot(' middle age','中間組'),link(' before rising gradually, while'),slot(' the female figures remained relatively steady at around 48% to 53%.','乙組穩定範圍')]}),
 f('In the 15–24 group, 52.8% of men took part, compared with 47.7% of women.','在同一年齡組並列男女兩個可比百分比',[1,4,8],{formula:'In [年齡組], [甲組百分比], compared with [乙組百分比]',meaning:'15–24 歲男性 52.8% 定期運動，女性 47.7%；這是唯一男性較高的組別。',usage:'逐年齡組寫細節時，同一組內的兩個性別數值應放在同一句比較。',parts:[link('In'),slot(' the 15–24 group','年齡組'),link(','),slot(' 52.8% of men exercised regularly','甲組百分比'),link(', compared with'),slot(' 47.7% of women.','乙組百分比')]}),
 f('The pattern then reversed: male bus use dropped to 42.2% among 25- to 34-year-olds and reached its lowest point, 39.5%, in the 35–44 group.','標出跨年齡組的排名反轉，並報告一個系列的下降和最低值',[2,5,7],{formula:'The pattern then reversed: [甲組] dropped to [下一年齡組數值] and reached its lowest point, [最低值], in [年齡組]',meaning:'25–34 歲男性率降至 42.2%，35–44 歲最低為 39.5%；女性從此開始較高。',usage:'前一組高低次序反轉時，先提示反轉，再用下一組及最低組的數值證明。',parts:[link('The pattern then reversed:'),slot(' male participation','甲組'),link(' dropped to'),slot(' 42.2% among 25- to 34-year-olds','下一年齡組數值'),link(' and reached its lowest point,'),slot(' 39.5%','最低值'),link(', in'),slot(' the 35–44 category.','年齡組')]}),
 f('By contrast, the female rates rose from 42% to 54%, creating the largest gender gap, at 14 percentage points.','對照另一組的變化，並以百分點量度同組兩值差距',[3,4,8],{formula:'By contrast, [乙組] rose from [起點] to [終點], creating the largest [兩組差距], at [百分點]',meaning:'女性在 25–34 至 35–44 歲組由 48.9% 升至 52.5%；35–44 歲的男女差為 13 個百分點。',usage:'兩個百分比相減所得是「百分點」差距；52.5% 減 39.5% 為 13 個百分點。',parts:[link('By contrast,'),slot(' the corresponding female rates','乙組'),link(' rose from'),slot(' 48.9%','起點'),link(' to'),slot(' 52.5%','終點'),link(', creating the largest gender gap, at'),slot(' 13 percentage points.','百分點')]}),
 f('In the older age groups, the male rate recovered from 43.1% for 45–54 to 45.1% for 55–64 and 46.7% for 65 and over.','把較年長三個組別的同一系列按年齡順序列出',[2,5,7],{formula:'In the older age groups, [甲組] recovered from [第一組值] to [第二組值] and [第三組值]',meaning:'男性定期運動比例在 45–54、55–64、65 歲及以上組依次為 43.1%、45.1%、46.7%。',usage:'多個有序年齡組的同一系列數值可合寫，但每個值必須配對正確的年齡組。',parts:[link('In the older age groups,'),slot(' the male figure','甲組'),link(' recovered from'),slot(' 43.1% for those aged 45–54','第一組值'),link(' to'),slot(' 45.1% among 55–64s','第二組值'),link(' and'),slot(' 46.7% among people aged 65 and over.','第三組值')]}),
 f('Women reached their peak in the 45–54 group, at 53.3%, and remained almost as high for 55–64s, at 53.0%.','報告最高年齡組與相鄰組幾乎相同的值',[3,5,8],{formula:'[乙組] reached their peak in [最高組], at [最高值], and remained almost as high for [相鄰組], at [近似值]',meaning:'女性在 45–54 歲達最高 53.3%，55–64 歲仍有 53.0%，差距很小。',usage:'一個最高值與相鄰組僅有細小差距時，要列出兩值，避免把「幾乎相同」寫成「完全相同」。',parts:[slot('Women','乙組'),link(' reached their peak in'),slot(' the 45–54 group','最高組'),link(', at'),slot(' 53.3%','最高值'),link(', and remained almost as high for'),slot(' 55–64s','相鄰組'),link(', at'),slot(' 53.0%.','近似值')]}),
 f('In the oldest group, however, female participation fell to 47.1%, almost matching the male rate.','指出最後年齡組對前述格局的局部例外及兩組接近',[1,6,7],{formula:'In [最年長組], however, [乙組值] fell to [數值], almost matching [甲組值]',meaning:'65 歲及以上女性降至 47.1%，與男性 46.7% 非常接近；女性仍略高。',usage:'最後一組接近相等但仍有次序時，可用 almost matching，不能說兩組完全相等。',parts:[link('In'),slot(' the oldest cohort','最年長組'),link(', however,'),slot(' female participation','乙組值'),link(' fell to'),slot(' 47.1%','數值'),link(', almost matching'),slot(' the male rate.','甲組值')]}),
];
const intro=[
 quiz('圖表比較的是甚麼？',['2010 年六個年齡組澳洲男女定期運動的百分比','2010 至 2020 年同一批人的運動習慣','六個國家男女每週運動時數','澳洲男女的總人口數'],'題目只有 2010 年；橫軸是六個年齡組，兩個系列是男性與女性。'),
 {type:'multi',prompt:'哪兩項是適合概覽的跨年齡組特徵？',detail:'選兩項，再按「確認」。',options:[
  '除 15–24 歲外，女性比例在其餘五組都較高',
  '男性在最年輕組最高、中年組最低；女性多數組別約 48% 至 53%',
  '2010 年同一批男女都隨年齡增加而改變運動習慣',
  '六個年齡組的男女比例都恰好相等',
 ],correct:[0,1],why:'比較同一年不同年齡組的排名與分布；圖表並沒有追蹤同一批人。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代澳洲男女、六個年齡組、定期運動比例及 2010 年。'],
 ['整體概覽','女性在五組較高；男性在最年輕組最高、中年組最低，女性相對平穩。'],
 ['15–44 歲細節','先寫唯一男性領先的 15–24 歲，再說排名反轉、男性最低值和最大男女差距。'],
 ['45 歲及以上細節','列男性三組漸高值、女性最高兩組，再指出最年長組男女幾乎相同。'],
],'按年齡組由小至大分兩段細節；同組男女比和跨組走勢都要準確。')];
const evidence=[
 quiz('哪一個年齡組男性定期運動比例高於女性？',['15–24 歲：男性 52.8%，女性 47.7%','25–34 歲：男性 42.2%，女性 48.9%','35–44 歲：男性 39.5%，女性 52.5%','65 歲及以上：男性 46.7%，女性 47.1%'],'只有 15–24 歲男柱較高；其餘五組女柱較高。'),
 quiz('男性比例最低的是哪一組？',['35–44 歲，39.5%','15–24 歲，52.8%','45–54 歲，43.1%','65 歲及以上，46.7%'],'男性在 35–44 歲組的 39.5% 是六組最低。'),
 quiz('哪組的男女差距最大，差距是多少？',['35–44 歲，相差 13 個百分點','15–24 歲，相差 13%','45–54 歲，相差 5 個百分點','65 歲及以上，相差 13 個百分點'],'35–44 歲女性 52.5% 減男性 39.5% = 13 個百分點；差距的單位不是「13%」。'),
 quiz('女性比例最高的是哪一組？',['45–54 歲，53.3%','55–64 歲，53.0%','35–44 歲，52.5%','15–24 歲，47.7%'],'53.3% 只比 55–64 歲的 53.0% 高 0.3 個百分點。'),
 quiz('男性在 45–54、55–64、65 歲及以上三組依次是多少？',['43.1%、45.1%、46.7%','46.7%、45.1%、43.1%','53.3%、53.0%、47.1%','42.2%、39.5%、43.1%'],'這三組男性比例依年齡組順序逐漸較高；53.3%、53.0% 屬女性。'),
 quiz('最年長組男女比例相差多少？',['女性 47.1%，男性 46.7%，差 0.4 個百分點','女性 46.7%，男性 47.1%，差 0.4 個百分點','兩者都是 47.1%，完全相等','女性 53.3%，男性 39.5%，差 13.8 個百分點'],'兩柱很接近，但女性仍比男性高 0.4 個百分點。'),
];
const logic=[
 sequence('較年輕三組：從唯一例外走到最大差距',[
  ['15–24 歲','男性 52.8% 高於女性 47.7%，是唯一男性領先組。'],
  ['25–34 歲','男性 42.2%，女性 48.9%；男女排名反轉。'],
  ['35–44 歲','男性降至最低 39.5%，女性升至 52.5%。'],
  ['算出差距','52.5 減 39.5 = 13 個百分點，是全圖最大男女差距。'],
 ],'同一年齡組先核對兩個百分比，再用相減結果描述百分點差距。'),
 sequence('較年長三組：分系列比較，再回到同組差距',[
  ['男性三組','45–54、55–64、65 歲以上依次為 43.1%、45.1%、46.7%。'],
  ['女性高點','45–54 歲 53.3% 最高；55–64 歲 53.0% 近乎一樣高。'],
  ['最年長組','女性 47.1%，男性 46.7%。'],
  ['精確收束','最年長組接近相等，女性仍略高 0.4 個百分點。'],
 ],'年齡組是 2010 年的橫斷面分類；以上只比較組別，不能說同一批人隨時間改變。'),
];
const transfers=[
 transfer('另一張圖比較 2020 年六個年齡組男女使用公共交通的百分比。','哪句引言準確界定圖表？',['圖表比較 2020 年六個年齡組男女使用公共交通的百分比。','圖表追蹤同一批男女由青年到老年的生活變化。','圖表比較六個國家的公共交通車輛數目。','圖表比較 2010 至 2020 年的交通票價。'],['性別、六組、行為、百分比和單一年份都齊全。','不同年齡組不等於長期追蹤同一批人。','把人口比例誤作車輛數。','把單一年份誤作時間序列。'],[0],'原文引言只說 2010 年六個年齡組澳洲男女的定期運動比例。'),
 transfer('某圖六組中只有 15–24 歲男性比例較高，其餘五組女性較高。','哪句概覽正確處理唯一例外？',['除 15–24 歲外，女性比例在所有年齡組都高於男性。','女性比例在六組全都高於男性。','只有 15–24 歲女性高於男性。','六組男女比例完全相等。'],['「除……外」把五組共通關係與一組例外一併寫清。','遺漏 15–24 歲的反轉。','把唯一例外的方向倒轉。','圖中存在高低差。'],[1],'原文 Overall 句用 except 15–24 精確限定女性較高的範圍。'),
 transfer('六個年齡組由小至大排列；男性比例為 53%、43%、40%、44%、45%、47%，女性多在 48% 至 53%。','哪項只概括組別形狀而不暗示同一人隨時間改變？',['男性在最年輕組最高、中間組最低，較年長組又較高；女性多數組別較平穩。','同一批男性隨年齡增加先失去運動能力，後來又恢復。','男女每個年齡組的比例都上升。','女性在所有組別都低於 40%。'],['只陳述同一年不同年齡組的數值分布。','橫斷面圖沒有追蹤同一批人，更沒有提供原因。','不同組別不能說每組都上升。','女性多在 48% 至 53%。'],[2],'原文概述六個年齡組的男性高低和女性相對平穩，並非縱向追蹤。'),
 transfer('15–24 歲組：男性 52.8%，女性 47.7%。','哪句保留同組男女比較？',['15–24 歲男性 52.8%，女性則為 47.7%。','15–24 歲女性 52.8%，男性 47.7%。','15–24 歲男女均為 50%。','15–24 歲男性比女性低 5.1 個百分點。'],['同一年齡組中男性高 5.1 個百分點。','把兩個性別數值對調。','兩個值都不是 50%。','男性比女性高，非低。'],[3],'原文在 15–24 歲組直接並列男性 52.8% 與女性 47.7%。'),
 transfer('25–34 歲男性 42.2%、女性 48.9%；35–44 歲男性 39.5%、女性 52.5%。','哪句準確指出排名反轉及男性最低點？',['男女高低次序反轉；男性在 35–44 歲降至 39.5% 的最低點。','男性仍在兩組都高於女性，並於 35–44 歲達最高。','女性在 35–44 歲降至 39.5%。','25–34 歲男性為 52.5%，高於女性。'],['女性在兩組都較高，男性 35–44 歲數值最低。','兩組男性都低於女性。','39.5% 屬男性。','25–34 歲男性為 42.2%。'],[4],'原文在 15–24 歲男性較高後，用 The pattern then reversed 引出男性下降至 39.5%。'),
 transfer('35–44 歲女性 52.5%，男性 39.5%。','男女差距應如何寫？',['女性高 13 個百分點。','女性高 13%。','男性高 13 個百分點。','兩者只差 0.4 個百分點。'],['52.5 減 39.5 = 13；兩個百分比之差的單位是百分點。','13 個百分點與相對百分比 13% 不同。','女性數值較高。','0.4 是最年長組的差距。'],[5],'原文以 52.5% 與 39.5% 算出最大男女差距 13 percentage points。'),
 transfer('較年長三組男性比例依次為 43.1%、45.1%、46.7%。','哪句沒有把年齡組與百分比配錯？',['45–54 歲 43.1%、55–64 歲 45.1%、65 歲及以上 46.7%。','45–54 歲 46.7%、55–64 歲 45.1%、65 歲及以上 43.1%。','三組男性比例都恰好為 45.1%。','三組數字屬女性而非男性。'],['依年齡組次序保留三個男性值。','把第一和第三組的值顛倒。','三個值各異。','題目已指定男性。'],[6],'原文按 45–54、55–64、65 歲以上順序列出男性 43.1%、45.1%、46.7%。'),
 transfer('女性 45–54 歲為 53.3%，55–64 歲為 53.0%，其餘組別較低。','哪句準確表達最高值和相鄰近似值？',['女性 45–54 歲達最高 53.3%；55–64 歲 53.0%，幾乎一樣高。','女性 55–64 歲達最高 53.3%；45–54 歲 53.0%。','兩組都恰好是 53.3%。','兩組都低於 40%。'],['53.3% 比 53.0% 高 0.3 個百分點，近似但不相等。','把最高組和數值對調。','53.0% 不等於 53.3%。','兩值均高於 50%。'],[7],'原文先說 45–54 歲女性峰值 53.3%，再補 55–64 歲 53.0% 幾乎一樣高。'),
 transfer('65 歲及以上女性 47.1%，男性 46.7%。','最後一組應怎樣精確收束？',['女性與男性幾乎相同，但女性仍高 0.4 個百分點。','男女完全相等，都是 47.1%。','男性比女性高 0.4 個百分點。','兩者相差 13 個百分點。'],['差距很小，然而 47.1% 仍高於 46.7%。','男性不是 47.1%。','高低方向顛倒。','13 個百分點屬 35–44 歲。'],[8],'原文 almost matching 指非常接近，並未宣稱最年長組男女完全相等。'),
 transfer('圖表只顯示 2020 年不同年齡組的運動比例。','哪句推論超出這張圖所能支持的範圍？',['同一批人從 25 歲到 65 歲一定先減少運動、再增加。','35–44 歲組男性比例低於 15–24 歲組。','不同年齡組可按比例比較。','同一年中男女比例可於各年齡組並列。'],['單年橫斷面沒有跟隨同一批人數十年，不能推斷個人變化。','這是兩組同年比例的合法比較。','圖表確實提供組別比例。','每個年齡組都有男女兩值。'],[2,6],'範文使用「then」「recovered」描述不同年齡組的柱高；讀者仍須明白這不是同一批人的人生軌跡。'),
];
export default {key:'task1-bar-charts:6',meta:{topic:'2010 年澳洲男女不同年齡組的定期運動比例',summary:'按六個年齡組比較男女比例，抓住 15–24 歲唯一反轉、35–44 歲最大差距與最年長組近乎相等；只作同年組別比較。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
