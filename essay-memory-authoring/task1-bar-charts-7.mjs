// Task 1 Bar Charts 7: graduate and postgraduate destinations, excluding full-time work.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先讀兩張圖，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});

const simple=[
 'The two bar charts show what UK graduates and postgraduates who left college in 2008 did if they did not take a full-time job.',
 'Overall, more people in both groups chose further study than any other option. The fewest did voluntary work.',
 'The number of graduates was much higher in every option, but both groups ranked the four options in the same order.',
 'Among graduates, 29,665 people went on to study, clearly more than in any other option.',
 'Part-time work was next, with 17,735 graduates, just above unemployment at 16,235.',
 'Only 3,500 graduates chose voluntary work. This was less than a quarter of the 16,235 who were unemployed and far fewer than those who studied further.',
 'Postgraduates put the four options in the same order, but their numbers were lower.',
 'Further study was also first among postgraduates, with 2,725 people, but part-time work was close behind at 2,535.',
 'There were 1,625 unemployed postgraduates, while voluntary work was still last, with only 345.',
 'In all four options, there were many more graduates than postgraduates. The difference was greatest for further study, at more than 26,000 people.',
];
const vocabulary=[
 v(['compare','show','顯示'],['did not enter full-time employment','did not take a full-time job','沒有做全職工作']),
 v(['most common route','more people in both groups chose further study than any other option','最常見去向'],['both groups','both groups','兩組'],['attracted the fewest students','The fewest did voluntary work','人數最少']),
 v(['figures were much higher','number of graduates was much higher','人數高很多'],['every category','every option','每個類別'],['overall pattern was broadly similar','ranked the four options in the same order','整體排序大致相同']),
 v(['almost 30,000','29,665','接近三萬'],['continued their education','went on to study','繼續升學'],['clear leading destination','clearly more than in any other option','明顯最多的去向']),
 v(['came next','was next','緊隨其後'],['only slightly ahead of','just above','只略高於'],['stood at','at','數值為']),
 v(['By contrast','Only','相比之下'],['just 3,500','Only 3,500','只有三千五百'],['less than a quarter','less than a quarter','少於四分之一'],['far below','far fewer than','遠低於']),
 v(['same order was evident','put the four options in the same order','排序相同'],['postgraduates','Postgraduates','研究生'],['numbers were smaller','numbers were lower','人數較少']),
 v(['ranked first','was also first','同樣居首'],['only narrowly higher than','was close behind','只略高於'],['at 2,535','at 2,535','數值為二千五百三十五']),
 v(['Unemployment involved','There were 1,625 unemployed postgraduates','失業人數為'],['remained the least common option','was still last','仍是最少'],['at 345','with only 345','只有三百四十五']),
 v(['Across all four destinations','In all four options','四種去向皆然'],['outnumbered postgraduates substantially','many more graduates than postgraduates','畢業生人數大幅多於研究生'],['difference exceeded 26,000','more than 26,000 people','差距超過二萬六千']),
];
const structures=[
 f('The two bar charts compare the destinations of high-school and university leavers who did not take full-time work in 2020.','引言清楚界定兩張圖、兩個群體、年份和排除的全職工作',[1,4,6],{formula:'The two bar charts compare the destinations of [兩組人] who [離校年份及排除條件]',meaning:'兩張圖比較 2008 年英國畢業生與研究生離校後、未進入全職工作的去向。',usage:'並列的兩張圖若排除了某類人，介紹比較對象時必須一併寫明排除條件。',parts:[link('The two bar charts compare the destinations of'),slot(' UK graduates and postgraduates','兩組人'),link(' who'),slot(' left college in 2008 but did not enter full-time employment.','離校年份及排除條件')]}),
 f('Overall, part-time work was the most common route for both groups, whereas volunteering attracted the fewest students.','在概覽同時指出兩組共同最多和最少的去向',[0,3,8],{formula:'Overall, [最多的去向] was the most common route for both groups, whereas [最少的去向] attracted the fewest',meaning:'畢業生與研究生都以繼續升學最多、義務工作最少。',usage:'兩組類別排序相同時，概覽先說兩組共通的最高和最低，細節再寫個別人數。',parts:[link('Overall,'),slot(' further study','最多的去向'),link(' was the most common route for both groups, whereas'),slot(' voluntary work','最少的去向'),link(' attracted the fewest students.')]}),
 f('Although the school-leaver figures were much higher in every category, the overall pattern was broadly similar.','指出一組各類別人數都較高，但兩組的類別排序近似',[1,6,9],{formula:'Although [甲組數字] were much higher in every category, [兩組排序] was broadly similar',meaning:'畢業生在四種去向中的人數都比研究生多，但兩張圖排序相同。',usage:'比較兩張人數圖時，分清「絕對人數規模」與「各類別的排序」，不要據人數推斷比例。',parts:[link('Although'),slot(' the graduate figures','甲組數字'),link(' were much higher in every category,'),slot(' the overall pattern','兩組排序'),link(' was broadly similar.')]}),
 f('Among school leavers, almost 30,000 continued their education, making study the clear leading destination.','先限定群體，再用近似人數和排名指出其最多去向',[2,4,7],{formula:'Among [群體], almost [人數] continued their education, making [去向] the clear leading destination.',meaning:'畢業生中 29,665 人繼續升學，可概括為接近三萬，而且遠多於其他三類。',usage:'某群體一項去向人數明顯最高時，先報近似人數，再指出排名。',parts:[link('Among'),slot(' graduates','群體'),link(', almost'),slot(' 30,000','人數'),link(' continued their education, making'),slot(' further study','去向'),link(' the clear leading destination.')]}),
 f('Part-time work came next, at 17,735, only slightly ahead of unemployment, which stood at 16,235.','比較排序相鄰且數值接近的兩種去向',[3,6,8],{formula:'[第二名] came next, at [其人數], only slightly ahead of [第三名], which stood at [其人數]',meaning:'畢業生兼職 17,735 人略多於失業 16,235 人；兩者差 1,500 人。',usage:'第二、三名相近時，應列出兩個同群體數值，讓「略高」有數據支持。',parts:[slot('Part-time work','第二名'),link(' came next, at'),slot(' 17,735','第二名人數'),link(', only slightly ahead of'),slot(' unemployment','第三名'),link(', which stood at'),slot(' 16,235.','第三名人數')]}),
 f('By contrast, just 3,500 chose voluntary work, less than a quarter of the unemployed total and far below the study figure.','用兩種比較顯示同一群體最少去向的低值',[1,4,9],{formula:'By contrast, just [最低值] chose [去向], less than a quarter of [比較類別] and far below [最高類別]',meaning:'畢業生義務工作只有 3,500 人，少於失業 16,235 人的四分之一，也遠少於升學。',usage:'低值可與一個中間值及最高值比較，但「不足四分之一」須先用原數值核對。',parts:[link('By contrast, just'),slot(' 3,500 graduates','最低值'),link(' chose'),slot(' voluntary work','去向'),link(', less than a quarter of'),slot(' the number without a job','比較類別'),link(' and far below'),slot(' the total in further study.','最高類別')]}),
 f('The same order was evident among university leavers, though the numbers were smaller.','轉入第二群體，保留共同排序和較小數值規模',[2,5,8],{formula:'The same order was evident among [第二群體], though the numbers were smaller',meaning:'轉到研究生圖：四種去向的排序與畢業生相同，但各項人數較少。',usage:'兩張圖的順序一致時，可用一句過渡連結；別把較小人數誤讀為較低參與率。',parts:[link('The same order was evident among'),slot(' postgraduates','第二群體'),link(', though the numbers were smaller.')]}),
 f('Further study again ranked first, with 2,725 students, but it was only narrowly higher than part-time work, at 2,535.','說第二群體的最高項，並指出它與第二項只相差少量',[1,4,9],{formula:'[最高項] again ranked first, with [人數], but it was only narrowly higher than [第二項], at [人數]',meaning:'研究生升學 2,725 人最多，但只比兼職 2,535 人多 190 人。',usage:'同一類別在兩群體皆居首時，可用 again；仍須報告它在第二群體的實際領先幅度。',parts:[slot('Further study','最高項'),link(' again ranked first, with'),slot(' 2,725 students','最高人數'),link(', but it was only narrowly higher than'),slot(' part-time work','第二項'),link(', at'),slot(' 2,535.','第二項人數')]}),
 f('Unemployment involved 1,625 university leavers, while volunteering remained the least common option, at 345.','把第二群體其餘兩類合寫，標出最少值',[2,5,7],{formula:'[第三項] involved [人數], while [第四項] remained the least common option, at [人數]',meaning:'研究生失業 1,625 人，義務工作僅 345 人，仍排最後。',usage:'第一、二名寫完後，可在同一句收束第三與第四名，讓第二張圖四類都有交代。',parts:[slot('Unemployment','第三項'),link(' involved'),slot(' 1,625 postgraduates','人數'),link(', while'),slot(' voluntary work','第四項'),link(' remained the least common option, at'),slot(' 345.','最少人數')]}),
 f('Across all four choices, school leavers outnumbered university leavers, especially in further study, where the difference exceeded 26,000.','跨四個類別回看兩組絕對人數，指出最大差距所在',[3,6,8],{formula:'Across all four [類別], [甲組] outnumbered [乙組], especially in [差距最大類別], where the difference exceeded [人數]',meaning:'四類去向中畢業生人數均多於研究生；升學差距 29,665−2,725＝26,940 人，超過 26,000。',usage:'比較兩張圖的人數差可說絕對差距；若兩組母體不同，不能直接說某組「更傾向」該去向。',parts:[link('Across all four'),slot(' destinations','類別'),link(','),slot(' graduates','甲組'),link(' outnumbered'),slot(' postgraduates substantially','乙組'),link(', especially in'),slot(' further study','差距最大類別'),link(', where the difference exceeded'),slot(' 26,000.','人數')]}),
];
const intro=[
 quiz('兩張圖統計哪些人？',['2008 年離校、未進入全職工作的英國畢業生與研究生','2008 年進入全職工作的所有英國學生','2008 年英國全部就業人口','2018 年英國未完成學業的學生'],'全職工作的人已被排除；四種柱是其餘去向的人數。'),
 {type:'multi',prompt:'哪兩項可作為兩張圖共同的概覽？',detail:'選兩項，再按「確認」。',options:[
  '兩組都是繼續升學最多、義務工作最少',
  '畢業生在四類的人數都比研究生多，兩張圖的排序相同',
  '義務工作在兩組都超過繼續升學',
  '兩組各類別的人數完全相同',
 ],correct:[0,1],why:'概覽抓共同排序和兩組的絕對人數規模，不根據人數推測各組選擇比例。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','說明英國畢業生／研究生、2008 年及排除全職工作。'],
 ['整體概覽','指出兩組升學最多、義務工作最少，以及畢業生四類人數都較高。'],
 ['畢業生細節','按升學、兼職、失業、義務工作的排序，列主要人數。'],
 ['研究生與跨圖比較','同序列研究生四項，再指出兩組在升學的人數差最大。'],
],'兩張圖用相同類別，先各自抓排序，再做跨圖的絕對人數比較。')];
const evidence=[
 quiz('畢業生哪一項去向最多？',['繼續升學 29,665 人','兼職工作 17,735 人','失業 16,235 人','義務工作 3,500 人'],'升學柱明顯最高，29,665 可概括為接近三萬。'),
 quiz('畢業生兼職與失業人數相差多少？',['17,735 減 16,235，差 1,500 人','16,235 減 17,735，失業多 1,500 人','兩者均為 17,735 人','兩者相差 15,000 人'],'兼職略高於失業，兩柱差 1,500 人。'),
 quiz('畢業生的義務工作人數與失業人數相比如何？',['3,500 人，少於 16,235 人的四分之一','3,500 人，高於失業人數','16,235 人，與失業一樣多','29,665 人，是四種去向最多'],'失業人數四分之一為 4,058.75；3,500 確實更少。'),
 quiz('研究生的升學與兼職人數各是多少？',['升學 2,725，兼職 2,535','升學 29,665，兼職 17,735','升學 2,535，兼職 2,725','升學 1,625，兼職 345'],'研究生升學只比兼職多 190 人；注意不要混入畢業生圖的萬人數值。'),
 quiz('研究生的最少去向是哪一項？',['義務工作 345 人','失業 1,625 人','兼職 2,535 人','升學 2,725 人'],'研究生義務工作的柱最短，只有 345 人。'),
 quiz('哪一項兩組人數差最大？',['繼續升學：29,665 減 2,725 = 26,940 人','兼職：17,735 減 2,535 = 26,940 人','失業：16,235 減 1,625 = 26,940 人','義務工作：3,500 減 345 = 26,940 人'],'升學的畢業生與研究生差 26,940 人，超過其他三類的差。'),
];
const logic=[
 sequence('畢業生：依每項人數排序',[
  ['升學最多','29,665 人，接近三萬。'],
  ['兼職第二','17,735 人。'],
  ['失業第三','16,235 人，只比兼職少 1,500。'],
  ['義務工作最少','3,500 人，少於失業人數四分之一。'],
 ],'每一項都是畢業生的實際人數，不能當作佔全部畢業生的百分比。'),
 sequence('研究生：同序列值，再做跨圖絕對差比較',[
  ['升學與兼職','2,725 對 2,535，升學只多 190 人。'],
  ['失業與義務工作','1,625 對 345，義務工作最少。'],
  ['兩圖共同排序','兩組均為升學、兼職、失業、義務工作。'],
  ['最大人數差','升學：畢業生 29,665 減研究生 2,725 = 26,940。'],
 ],'兩群體總人數未提供；可比較人數差，不能根據此圖推論兩組某去向的參與率。'),
];
const transfers=[
 transfer('兩張圖列出 2020 年中學與大學離校者未做全職工作時的四種去向。','哪句介紹保留重要排除條件？',['兩張圖比較 2020 年未進入全職工作的中學及大學離校者去向。','兩張圖比較所有中學及大學離校者的全職工資。','兩張圖追蹤同一批學生十年後的去向。','兩張圖比較全國所有成年人的工作時數。'],['兩個群體、離校年份和「未全職」範圍都準確。','把排除的全職工作當作統計目標。','只有單一年份，沒有十年追蹤。','圖表統計離校者去向，不是全國成年人。'],[0],'原文引言的 did not enter full-time employment 是統計範圍，不可省略。'),
 transfer('甲乙兩組的四種去向中，升學都最多、義務工作都最少。','哪項適合共同概覽？',['兩組皆以升學最多、義務工作最少。','甲組升學最少、乙組義務工作最多。','兩組四種去向人數完全相等。','所有離校者最後都進入全職工作。'],['同時說出兩組共同的首尾排名。','把兩項排名倒轉。','只知道排序，不能說人數完全相同。','全職工作者已不在圖表範圍。'],[1],'原文概覽以 further study 和 voluntary work 抓兩圖共同的最高和最低。'),
 transfer('甲組在每項的人數都高於乙組，但兩組的四項排序完全一致。','哪句能區分人數規模與排序？',['甲組各類人數較多，但兩組去向排序相同。','甲組每種去向的參與率都高於乙組。','兩組各類人數相同，因此排序相同。','甲組的去向排序與乙組完全相反。'],['只說圖能支持的絕對人數和相同排序。','沒有兩組總人數，不能從人數推出參與率。','兩組人數高低已有差別。','題目說排序一致。'],[2],'原文 Although 句同時說畢業生數字較高與整體模式相似。'),
 transfer('甲組有 29,665 人繼續升學，是四類最高。','哪句使用合理約數並指出排名？',['甲組接近三萬人繼續升學，明顯多於其他去向。','甲組只有接近三千人繼續升學。','甲組接近三萬人義務工作，居首。','甲組升學人數接近 30%，高於其他類別。'],['29,665 接近三萬，單位是人數。','少了一個零。','把升學誤成義務工作。','圖中不是百分比。'],[3],'原文用 almost 30,000 概括 29,665，並指出升學是畢業生最多去向。'),
 transfer('甲組兼職 17,735 人、失業 16,235 人。','哪句準確比較相鄰排名？',['兼職第二，17,735 人，略高於失業 16,235 人。','失業第二，17,735 人，略高於兼職 16,235 人。','兼職與失業同為 17,735 人。','兼職比失業多 15,000 人。'],['兼職多 1,500 人，確實略高。','把兩個類別的數值對調。','兩者並不相等。','17,735 減 16,235 = 1,500。'],[4],'原文用 only slightly ahead of 把畢業生兼職與失業兩個接近數值連起來。'),
 transfer('甲組義務工作 3,500 人、失業 16,235 人、升學 29,665 人。','哪項數值比較正確？',['義務工作少於失業的四分之一，也遠少於升學。','義務工作多於失業的四分之一，接近升學。','義務工作人數比升學人數多。','義務工作是甲組最多的去向。'],['16,235 的四分之一約 4,059，3,500 更少。','3,500 低於約 4,059，也遠低於 29,665。','3,500 遠低於 29,665。','義務工作為四類最少。'],[5],'原文同時用「少於失業四分之一」及「遠少於升學」界定義務工作低值。'),
 transfer('乙組四項排序和甲組一樣，但每項實際人數都較少。','轉到乙組時哪句最準確？',['乙組同樣依升學、兼職、失業、義務工作排序，但各項人數較低。','乙組各項人數較高，排序也相反。','乙組各項參與率必然較低。','乙組沒有兼職或失業者。'],['保留相同排序及較小的絕對人數。','把兩個已知關係都反轉。','缺少總人數，不能得出參與率。','四項去向均有乙組人數。'],[6],'原文 The same order was evident among postgraduates 為第二張圖的細節開場。'),
 transfer('乙組升學 2,725 人，兼職 2,535 人。','哪句準確表達前兩名的差距？',['升學仍最多，但只比兼職多 190 人。','兼職最多，比升學多 190 人。','升學比兼職多 1,900 人。','兩類都恰好是 2,725 人。'],['2,725 減 2,535 = 190，升學略高。','兼職值較低。','差值多了一個零。','兩類值不同。'],[7],'原文用 only narrowly higher 表示研究生升學對兼職的領先很小。'),
 transfer('乙組失業 1,625 人、義務工作 345 人。','哪句能收束乙組其餘兩類？',['失業 1,625 人，義務工作僅 345 人，仍是最少。','義務工作 1,625 人，失業僅 345 人。','失業與義務工作人數相同。','兩項都高於乙組升學 2,725 人。'],['兩個類別及最少排名都準確。','把數值對調。','1,625 與 345 不等。','兩值都低於 2,725。'],[8],'原文在研究生圖用一句並列失業 1,625 與義務工作 345。'),
 transfer('升學：甲組 29,665 人，乙組 2,725 人；兩組總人數均未知。','哪項跨圖比較有數據支持？',['升學人數相差 26,940 人，甲組較多。','甲組升學的參與率必定高於乙組。','兩組升學人數相差 2,694 人。','乙組升學人數較多。'],['29,665 減 2,725 = 26,940，這是絕對人數差。','沒有群體總人數，無法比較參與率。','差值少了一位數。','甲組升學人數較多。'],[9],'原文只比較 graduates 與 postgraduates 的人數差；升學差超過 26,000。'),
];
const balancedTransferOptions=[
 ['兩張圖比較2020年未做全職工作的中學及大學離校者去向。','兩張圖比較2020年所有中學及大學離校者的全職工資。','兩張圖追蹤2020年同一批中學及大學學生十年後的去向。','兩張圖比較2020年全國成年人的各種工作時數及去向。'],
 ['兩組皆以升學人數最多，義務工作人數最少。','兩組皆以升學人數最少，義務工作人數最多。','兩組四種去向的人數完全相同，沒有高低之分。','兩組離校者最後全都轉入全職工作，沒有例外。'],
 ['甲組各類人數較多，但兩組去向的排序完全相同。','甲組各類參與率較高，因為各類人數都比乙組多。','兩組各類人數完全一樣，因此四類排序相同。','甲組各類人數較多，但兩組去向的排序完全相反。'],
 ['甲組近三萬人繼續升學，遠多於其餘三種去向。','甲組近三千人繼續升學，遠多於其餘三種去向。','甲組近三萬人做義務工作，遠多於其餘去向。','甲組學生升學人數接近30%，明顯多於其餘去向。'],
 ['甲組兼職17,735人，略多於失業的16,235人。','甲組失業17,735人，略多於兼職的16,235人。','甲組兼職17,735人，與失業人數完全相同。','甲組兼職17,735人，竟然比失業多出15,000人。'],
 ['義務工作3,500人，少於失業的四分之一，亦遠少於升學。','義務工作3,500人，多於失業的四分之一，接近升學。','甲組義務工作3,500人，比失業和升學人數都要多。','義務工作3,500人，在甲組四種去向中人數最多。'],
 ['乙組四項排序相同，但每項實際人數都低於甲組。','乙組四項排序相反，而且每項人數都高於甲組。','乙組四項參與率必然較低，因為人數都比較少。','乙組沒有任何兼職或失業者，只有升學和義務工作。'],
 ['乙組升學2,725人居首，僅比兼職多190人。','乙組兼職2,535人居首，僅比升學多190人。','乙組升學2,725人居首，卻比兼職多1,900人。','乙組升學與兼職人數相同，兩者均為2,725人。'],
 ['乙組失業1,625人，義務工作345人，後者最少。','乙組義務工作1,625人，失業345人，後者最少。','乙組失業及義務工作人數一樣，都是1,625人。','乙組失業及義務工作兩項都多於升學2,725人。'],
 ['甲組升學比乙組多26,940人，這是兩組人數差。','甲組升學參與率比乙組高，因為甲組人數較多。','甲組升學比乙組多2,694人，這是兩組人數差。','乙組升學比甲組多26,940人，這是兩組人數差。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-bar-charts:7',meta:{topic:'2008 年英國畢業生與研究生的非全職去向',summary:'以兩張圖共同排序組織報告：升學最多、義務工作最少；分別核對人數，再比較兩組絕對差距，保留排除全職工作的範圍。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
