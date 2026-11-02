// Task 1 Mixed Charts 6: Ashdown Museum visitors (counts) and satisfaction (survey shares).
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清訪客人數與滿意度回答比例，再按前後兩年比較。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table and pie charts show how many people visited Ashdown Museum and how happy surveyed visitors were before and after the building work.',
 'Overall, more people visited the museum after the work, and visitors gave it better ratings.',
 'Visitor numbers rose a lot. Happy responses became more common than unhappy ones.',
 'Before the work, 74,000 people visited the museum. In the next year, 92,000 visited, so the number rose by 18,000.',
 'The change in visitor ratings was even more noticeable.',
 'Before the changes, 15% of surveyed visitors were very happy and another 30% were happy; together, these good answers made up only 45%, less than half.',
 'After the work, the two good-answer groups rose to 35% and 40% in that order, so 75% of surveyed visitors gave a happy answer.',
 'In comparison, the share of unhappy visitors fell a lot.',
 'Before the work, 40% were unhappy, the largest single group, and 10% were very unhappy.',
 'After the work, these two shares fell to 15% and 5% in that order.',
 'The share who did not answer stayed at 5% in both years.',
];
const vocabulary=[
 v(['compare','show','比較／顯示'],['attendance','how many people visited','訪客人數'],['satisfaction levels','how happy surveyed visitors were','受訪者滿意程度'],['refurbishment','building work','翻新工程']),
 v(['became both more popular','more people visited','較多人到訪'],['more highly rated','better ratings','評價更高'],['after the work was completed','after the work','工程完成後']),
 v(['total number of visitors','Visitor numbers','訪客總數'],['rose markedly','rose a lot','顯著上升'],['positive responses','Happy responses','正面回答'],['dissatisfaction','unhappy ones','不滿意回答']),
 v(['In terms of attendance','Before the work','就入場人數而言'],['received','visited','接待／到訪'],['this figure increased','the number rose','數字上升'],['a rise of 18,000','rose by 18,000','增加一萬八千人']),
 v(['improvement','change','改善／變化'],['even more striking','even more noticeable','更為顯著']),
 v(['respondents','surveyed visitors','受訪者'],['very satisfied','very happy','非常滿意'],['a further','another','另外'],['positive feedback','good answers','正面回應'],['less than half','less than half','少於一半']),
 v(['these two categories','the two good-answer groups','上述兩類'],['climbed','rose','上升'],['respectively','in that order','依次分別'],['three quarters','75%','四分之三']),
 v(['By contrast','In comparison','相比之下'],['proportion','share','比例'],['dissatisfied visitors','unhappy visitors','不滿意訪客'],['fell sharply','fell a lot','顯著下降']),
 v(['reported being dissatisfied','were unhappy','表示不滿意'],['largest single group','largest single group','最大單一組別'],['very dissatisfied','very unhappy','非常不滿意']),
 v(['these figures','these two shares','這兩個比例'],['dropped','fell','下降'],['respectively','in that order','依次分別']),
 v(['giving no response','who did not answer','未作答'],['remained unchanged','stayed','保持不變'],['both years','both years','兩年']),
];
const structures=[
 f('The table and pie charts compare attendance at Brookside Museum and visitors’ satisfaction levels in the years before and after its refurbishment.','把訪客人數和滿意度兩項量度連到同一翻新前後期間',[1,3,6],{formula:'The table and pie charts compare attendance at [博物館] and visitors’ satisfaction levels in the years before and after its refurbishment',meaning:'表格給翻新前後的訪客人數；圓圖給兩年的滿意度調查比例。',usage:'attendance 是人數，satisfaction levels 是受訪者回答比例；不能互換單位。',parts:[link('The table and pie charts compare attendance at'),slot(' Ashdown Museum','博物館'),link(' and visitors’ satisfaction levels in the years before and after its refurbishment.')]}),
 f('Overall, the gallery became both more popular and more highly rated after the work was completed.','用 both…and…概括人數與評價雙向改善',[0,3,7],{formula:'Overall, [場所] became both more popular and more highly rated after the work was completed',meaning:'訪客 74,000→92,000；正面回應 45%→75%。',usage:'after 表時間先後；資料沒有單獨證明翻新是兩項變化的唯一原因。',parts:[link('Overall,'),slot(' the museum','場所'),link(' became both more popular and more highly rated after the work was completed.')]}),
 f('The total number of visitors rose markedly, while favourable responses replaced negative feedback as the dominant pattern.','並列人數上升與調查主導回答由負轉正',[0,3,8],{formula:'The total number of visitors rose markedly, while [後期主導回答] replaced [前期主導回答] as the dominant pattern',meaning:'人數增加 18,000；翻新前不滿意 40% 為最大單項，翻新後滿意 40%／非常滿意 35% 為主。',usage:'dominant pattern 比較整體正面／負面回應；前後調查類別需按同名標籤配準。',parts:[link('The total number of visitors rose markedly, while'),slot(' positive responses','後期主導回答'),link(' replaced'),slot(' dissatisfaction','前期主導回答'),link(' as the dominant pattern.')]}),
 f('In terms of attendance, the museum received 70,000 visitors before the refurbishment, but this figure increased to 90,000 in the following year, a rise of 20,000.','先報起、終兩個人數，再核算差額',[0,5,9],{formula:'In terms of attendance, the museum received [翻新前人數] before the refurbishment, but this figure increased to [翻新後人數] in the following year, a rise of [差額]',meaning:'74,000→92,000；差額 18,000 人。',usage:'a rise of 是增額，不是終年總數；不能寫成上升 92,000。',parts:[link('In terms of attendance, the museum received'),slot(' 74,000 visitors','翻新前人數'),link(' before the refurbishment, but this figure increased to'),slot(' 92,000','翻新後人數'),link(' in the following year, a rise of'),slot(' 18,000','差額'),link('.')]}),
 f('The improvement in exhibit ratings was even more striking.','用短過渡句從入場人數切換至問卷滿意度',[0,3,7],{formula:'The improvement in [指標] was even more striking',meaning:'訪客人數已升；下句改看「滿意／非常滿意」合計 45%→75%。',usage:'even more striking 是寫作上的相對強調，不能把人數與百分比直接相減。',parts:[link('The improvement in'),slot(' satisfaction','指標'),link(' was even more striking.')]}),
 f('Before the changes, only 12% of respondents said they were very satisfied and a further 28% were satisfied, meaning that positive feedback accounted for less than half of all responses.','把兩種正面回答相加，判定是否過半',[0,4,9],{formula:'Before the changes, only [非常滿意] of respondents said they were very satisfied and a further [滿意] were satisfied, meaning that positive feedback accounted for less than half of all responses',meaning:'翻新前非常滿意 15% + 滿意 30% = 正面 45%，少於一半。',usage:'不能只看 30% 就代表所有正面回答；須合併兩個不重疊類別。',parts:[link('Before the changes, only'),slot(' 15%','非常滿意'),link(' of respondents said they were very satisfied and a further'),slot(' 30%','滿意'),link(' were satisfied, meaning that positive feedback accounted for less than half of all responses.')]}),
 f('After refurbishment, however, these two categories climbed to 30% and 45%, respectively, so three quarters of visitors expressed satisfaction.','依次對應兩個正面類別，並算合計份額',[0,4,9],{formula:'After refurbishment, however, these two categories climbed to [非常滿意] and [滿意], respectively, so three quarters of visitors expressed satisfaction',meaning:'翻新後非常滿意 35% + 滿意 40% = 75%，四分之三。',usage:'respectively 承接上一句 very satisfied→satisfied 的順序；不可把 35% 配給 dissatisfied。',parts:[link('After refurbishment, however, these two categories climbed to'),slot(' 35%','非常滿意'),link(' and'),slot(' 40%','滿意'),link(', respectively, so three quarters of visitors expressed satisfaction.')]}),
 f('By contrast, the proportion of unhappy visitors fell sharply.','由正面回應轉至負面回應的反向變化',[0,3,6],{formula:'By contrast, the proportion of [下降群組] fell sharply',meaning:'不滿意 40→15%，非常不滿意 10→5%，合計負面 50→20%。',usage:'By contrast 對比上一段正面回應上升；dissatisfied 與 very dissatisfied 均屬負面。',parts:[link('By contrast, the proportion of'),slot(' dissatisfied visitors','下降群組'),link(' fell sharply.')]}),
 f('In the year before refurbishment, 35% reported being dissatisfied, making this the largest single group, while 12% were very dissatisfied.','先報最大單一負面類，再報更強烈負面類',[0,5,7],{formula:'In the year before refurbishment, [不滿意份額] reported being dissatisfied, making this the largest single group, while [非常不滿意份額] were very dissatisfied',meaning:'翻新前 dissatisfied 40% 是最大單類；very dissatisfied 10%。',usage:'largest single group 指五項問卷選項中 40% 最大；不是說 40% 超過半數。',parts:[link('In the year before refurbishment,'),slot(' 40%','不滿意份額'),link(' reported being dissatisfied, making this the largest single group, while'),slot(' 10%','非常不滿意份額'),link(' were very dissatisfied.')]}),
 f('In the year after refurbishment, these figures dropped to 12% and 4%, respectively.','用 these figures 與 respectively 回指上一句兩個負面項',[0,5,8],{formula:'In the year after refurbishment, these figures dropped to [不滿意份額] and [非常不滿意份額], respectively',meaning:'翻新後 dissatisfied 15%，very dissatisfied 5%，依前句順序。',usage:'兩項都下降；15% 不要誤配給 very dissatisfied。',parts:[link('In the year after refurbishment, these figures dropped to'),slot(' 15%','不滿意份額'),link(' and'),slot(' 5%','非常不滿意份額'),link(', respectively.')]}),
 f('The share giving no response remained unchanged at 4% in both years.','末句指出問卷未作答者的份額持平',[0,6,8],{formula:'The share giving no response remained unchanged at [份額] in both years',meaning:'No response 翻新前、後各 5%。',usage:'未回答不是滿意或不滿意；合計正負面時要另列。',parts:[link('The share giving no response remained unchanged at'),slot(' 5%','份額'),link(' in both years.')]}),
];
const intro=[quiz('表格與圓圖各量度甚麼？',['表格是全年訪客人數；圓圖是受訪者滿意度比例','兩者都是售票收入','表格是滿意度比例；圓圖是人數','兩者都是博物館面積'],'人數 74,000／92,000；調查圖各類為百分比。'),{type:'multi',prompt:'哪兩項適合作概覽？',detail:'選兩項，再按「確認」。',options:['翻新後訪客增加，正面滿意回應合計提高','負面回答合計下降，未作答比例保持 5%','翻新後訪客數下降至 5%','兩年所有滿意度類別都完全不變'],correct:[0,1],why:'分別呈現人數及調查比例的主要前後變化。'}];
const route=[sequence('排好四段博物館報告',[
 ['圖表引言','同一博物館翻新前後的年度人數表與滿意度圓圖。'],
 ['整體概覽','訪客增加，正面評價更常見；負面評價大減。'],
 ['人數和正面回應','74,000→92,000（+18,000）；非常滿意／滿意合計 45→75%。'],
 ['負面與未答','不滿意 40→15%，非常不滿意 10→5%；未答兩年 5%。'],
],'滿意度分母是各年問卷回答；訪客人數是年度入場總數。')];
const evidence=[
 quiz('翻新前後每年訪客各多少？',['74,000 與 92,000 人','74% 與 92%','15,000 與 35,000 人','40,000 與 15,000 人'],'表格分別列 74,000、92,000。'),
 quiz('訪客人數增加多少？',['18,000 人','92,000 人','15 個百分點','30%'],'92,000−74,000=18,000 人。'),
 quiz('翻新前正面回答合計多少？',['45%：非常滿意 15%＋滿意 30%','15%：只計非常滿意','50%：兩個負面類別','75%：翻新後合計'],'正面兩項 15+30=45，未過半。'),
 quiz('翻新後正面回答合計多少？',['75%：非常滿意 35%＋滿意 40%','35%：只計非常滿意','20%：兩個負面類別','5%：未作答'],'35+40=75%，四分之三。'),
 quiz('翻新前最大單一滿意度選項？',['不滿意 40%','非常滿意 15%','滿意 30%','未作答 5%'],'Dissatisfied 40% 為五項中最大。'),
 quiz('負面回答合計如何改變？',['50%→20%','45%→75%','5%→5%','74,000→92,000'],'翻新前 40+10=50%，翻新後 15+5=20%。'),
 quiz('未作答者份額？',['兩年皆 5%','翻新前 5%，後 15%','兩年皆零','翻新前 40%，後 5%'],'兩張圓圖 No response 均 5%。'),
];
const logic=[sequence('人數表：只比較年度訪客總數',[
 ['翻新前','全年 74,000 名訪客。'],['翻新後','全年 92,000 名訪客。'],['變化','增加 18,000 人；不要把 92,000 當增額。'],['界線','表格的人數與問卷百分比量度不同。'],
 ],'兩個「年」是相對翻新工程的前後，不必自行補上未給出的公曆年份。'),sequence('滿意度：合併同向選項，再看未答',[
 ['正面前','very satisfied 15%＋satisfied 30%=45%。'],['正面後','very satisfied 35%＋satisfied 40%=75%。'],['負面前後','dissatisfied＋very dissatisfied：50%→20%。'],['未作答','兩年均 5%，獨立於正負面。'],
 ],'每張圓圖五類合計 100%；同名類別的前後值要依次配對。')];
const transfers=[
 transfer('另一博物館有翻新前後年度入場人數及兩次滿意度調查。','哪句引言分清兩項資料？',['表格與圓圖比較翻新前後的到訪人數及受訪者滿意程度。','兩圖只記錄每張門票價格。','表格顯示滿意度人數，圓圖顯示建築面積。','兩圖都比較博物館員工國籍。'],['人數與調查比例均點出。','沒有票價。','主題不符。','沒有國籍。'],[0],'原文 table attendance，pie charts satisfaction，before/after refurbishment。'),
 transfer('翻新後訪客人數及滿意評價都提高。','哪句完整概覽？',['工程完成後，博物館訪客較多，評價也較高。','翻新後訪客與評價都大跌。','資料只證明票價上升。','兩項數字完全一樣。'],['兩個指標均概述；after 是時間。','方向相反。','沒票價。','單位不同。'],[1],'原文 became both more popular and more highly rated。'),
 transfer('前期負面回答較常見，後期正面回答成為主流。','哪句呈現主要模式轉變？',['訪客總數增加，而正面回答取代負面回應成為主要模式。','訪客數下降，負面回答也降至零。','正負面回答兩年完全一樣。','後期所有人都沒有回答。'],['人數和回答模式各自準確。','人數升且仍有負面。','份額大變。','未答僅 5%。'],[2],'原文 visitors rose markedly；positive responses replaced dissatisfaction。'),
 transfer('翻新前年入場 74,000，後一年 92,000。','哪句正確核算差額？',['訪客由 74,000 人升至 92,000 人，增加 18,000 人。','訪客由 74% 升至 92%。','增加 92,000 人，終值 18,000 人。','訪客減少 18,000 人。'],['92,000−74,000=18,000。','表格是人數。','終值與差額顛倒。','方向相反。'],[3],'原文 before 74,000，after 92,000，rise 18,000。'),
 transfer('人數段結束，下一句開始介紹滿意度。','哪句能清楚轉換指標？',['滿意度的改善更為顯著。','博物館的牆長增加兩倍。','所有受訪者都是本地學生。','入場數已由百分比變成英鎊。'],['主題從人數切換至調查評價。','無建築尺度資料。','沒有身分資料。','量度並非貨幣。'],[4],'原文 The improvement in satisfaction was even more striking。'),
 transfer('翻新前非常滿意 15%，滿意 30%。','哪句合計正面回答正確？',['兩項正面回答合共 45%，少於所有回應的一半。','只計 15% 就代表全部正面回答。','15% 與 30% 合共 50%。','兩個數字是訪客人數。'],['15+30=45%，低於 50%。','漏掉滿意。','算術錯。','圓圖給比例。'],[5],'原文 15% very satisfied＋30% satisfied，less than half。'),
 transfer('翻新後非常滿意 35%，滿意 40%。','哪句同時處理 respectively 和合計？',['兩項依次為 35% 和 40%，正面回答合共 75%。','非常滿意 40%，滿意 35%，合計 45%。','兩項合計 95%。','35% 與 40% 是年度訪客人數。'],['類別先後與 75% 合計均正確。','配對顛倒且合計錯。','算術錯。','圓圖是百分比。'],[6],'原文 these two categories 35%／40%，three quarters satisfied。'),
 transfer('正面份額上升後，負面回答的份額下降。','哪句適合引出對比？',['相比之下，不滿意訪客所佔比例大幅下降。','相比之下，不滿意比例增加至 100%。','相比之下，兩張圓圖沒有差別。','相比之下，年度入場人數變成 15%。'],['正面升與負面降形成對比。','負面後期合計 20%。','數值變化。','人數與比例混淆。'],[7],'原文 By contrast, dissatisfied proportion fell sharply。'),
 transfer('翻新前不滿意 40%，非常不滿意 10%。','哪句識別最大單一組別？',['不滿意佔 40%，是最大單一選項；非常不滿意佔 10%。','非常不滿意 40% 是最大選項。','不滿意 40% 已超過半數。','兩數字是訪客總人數。'],['五選項中 40% 最大但未過 50%。','配對顛倒。','40% 未過半。','是調查比例。'],[8],'原文 dissatisfied 40% largest single group，very dissatisfied 10%。'),
 transfer('翻新後不滿意 15%，非常不滿意 5%。','哪句依次配對？',['兩項負面比例依次降至 15% 與 5%，合計 20%。','不滿意 5%，非常不滿意 15%。','兩項合計 75%。','兩項沒有變化。'],['順序、方向和合計準確。','順序顛倒。','15+5=20%。','翻新前是 40/10。'],[9],'原文 these figures dropped to 15% and 5% respectively。'),
 transfer('兩張圓圖都標 No response 5%。','哪句不把未答誤作滿意？',['未作答所佔比例兩年均為 5%，應與正負面回答分開。','未作答 5% 表示非常滿意。','未作答由 5% 升至 50%。','未作答代表 5 名訪客。'],['5% 持平且屬獨立選項。','類別不同。','兩年皆 5%。','比例不是人數。'],[10],'原文 share giving no response remained unchanged at 5%。'),
];
const balancedTransferOptions=[
  ['表格比較前後入場人數，圓圖比較受訪者滿意度。','表格比較前後門票價格，圓圖比較受訪者滿意度。','表格比較前後入場人數，圓圖比較建築面積。','表格比較各國訪客人數，圓圖比較員工國籍。'],
  ['翻新後年度訪客增加，受訪者的滿意程度也提高。','翻新後年度訪客減少，受訪者的滿意程度也降低。','翻新後年度訪客增加，所有門票價格也提高。','翻新後年度訪客不變，受訪者的滿意程度也不變。'],
  ['訪客人數增加，正面回答成為較常見的評價。','訪客人數減少，負面回答成為較常見的評價。','訪客人數增加，正負回答所佔比例完全不變。','訪客人數增加，但所有受訪者都沒有回答。'],
  ['訪客由 74,000 升至 92,000 人，增加 18,000 人。','訪客由 74,000 降至 92,000 人，減少 18,000 人。','訪客由 74,000 升至 92,000 人，增加 92,000 人。','訪客由 74% 升至 92%，增加 18 個百分點。'],
  ['接着比較兩次調查中的滿意度變化。','接着比較博物館翻新後的牆壁長度。','接着比較受訪者的國籍與居住地。','接着比較每張門票的英鎊售價。'],
  ['非常滿意與滿意合共 45%，仍未達受訪者一半。','非常滿意與滿意合共 50%，剛好達受訪者一半。','非常滿意與滿意合共 15%，仍未達受訪者一半。','非常滿意與滿意合共 45 人，仍未達訪客一半。'],
  ['非常滿意為 35%，滿意為 40%；正面合共 75%。','非常滿意為 40%，滿意為 35%；正面合共 45%。','非常滿意為 35%，滿意為 40%；正面合共 95%。','非常滿意為 35 人，滿意為 40 人；正面共 75 人。'],
  ['相比之下，不滿意者所佔比例明顯下降。','相比之下，不滿意者所佔比例升至全數。','相比之下，兩張圓圖的比例完全相同。','相比之下，年度入場訪客人數變成 15%。'],
  ['不滿意佔 40%，是最大單項；非常不滿意佔 10%。','非常不滿意佔 40%，是最大單項；不滿意佔 10%。','不滿意佔 40%，超過半數；非常不滿意佔 10%。','不滿意有 40 人，是最大單項；非常不滿意有 10 人。'],
  ['不滿意為 15%，非常不滿意為 5%；合共 20%。','不滿意為 5%，非常不滿意為 15%；合共 20%。','不滿意為 15%，非常不滿意為 5%；合共 75%。','不滿意為 15 人，非常不滿意為 5 人；共 20 人。'],
  ['未作答兩年均佔 5%，須與正負評價分開。','未作答兩年均佔 5%，應計入非常滿意。','未作答由 5% 升至 50%，屬於負面評價。','未作答兩年均為 5 人，屬於訪客人數。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-mixed-charts:6',meta:{topic:'Ashdown Museum：翻新前後訪客與滿意度',summary:'年度訪客 74,000→92,000（+18,000）；正面回答 45→75%，負面 50→20%，未答兩年 5%。人數表與問卷比例分別量度，after 不擅自解作唯一因果。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
