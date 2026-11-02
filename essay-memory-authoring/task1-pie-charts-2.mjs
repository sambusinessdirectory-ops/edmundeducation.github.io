// Task 1 Pie Charts 2: water-use percentages in six world regions.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先核對每個地區的三項比例，再依範文的報告次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The six pie charts show how water goes to farming, factories and homes in six parts of the world.',
 'Overall, farming uses the most water in four of the six areas, especially Central Asia, Africa and South East Asia.',
 'But factories use the most water in Europe and North America. Home use is quite small in every area and is never the biggest category.',
 'In Europe and North America, where factories use the most water, Europe has the highest factory share: 53%, just above North America’s 48%.',
 'Farming takes smaller shares in these two areas: 32% in Europe and 39% in North America. Home use is low: 15% and 13% in that order.',
 'The other four areas mainly use water for farming.',
 'Central Asia uses the greatest share for farming, at 88%. Africa follows at 84%, then South East Asia at 81%.',
 'South America also uses most of its water for farming, at 71%. But 19% goes to homes, more than in the other farming-led areas.',
 'Factories take very small shares in these four areas, from 5% in Central Asia to 12% in South East Asia.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['allocated to','goes to','分配予'],['agriculture','farming','農業'],['industry','factories','工業'],['domestic purposes','homes','家庭用途']),
 v(['agriculture','farming','農業'],['dominates water consumption','uses the most water','佔用水最大份額'],['regions','areas','地區'],['particularly','especially','尤其']),
 v(['By contrast','But','相比之下'],['industrial use','factories','工業用水'],['takes the largest share','use the most water','佔比最大'],['household use','Home use','家庭用水'],['comparatively small','quite small','比例相對小'],['leading category','biggest category','最大類別']),
 v(['industrial proportion','factory share','工業用水比例'],['records','has','錄得'],['slightly above','just above','略高於'],['the main user','use the most water','主要用水者']),
 v(['Agricultural use','Farming','農業用水'],['accounting for','takes smaller shares','佔'],['domestic consumption','Home use','家庭用水'],['modest','low','比例不高'],['respectively','in that order','按上述順序']),
 v(['remaining four regions','other four areas','其餘四區'],['agriculture-centred','mainly use water for farming','以農業為主']),
 v(['most pronounced reliance on farming','greatest share for farming','最依賴農業用水'],['followed closely by','follows','其次'],['water used for this purpose','uses the greatest share for farming','用於農業的水']),
 v(['devotes a large majority to agriculture','uses most of its water for farming','大部分用水供農業'],['although','But','不過'],['domestic share','goes to homes','家庭用水份額'],['noticeably higher','more','明顯較高'],['agriculture-dominated','farming-led','農業主導']),
 v(['Industrial use','Factories','工業用水'],['minimal','very small shares','佔比極小'],['ranging from','from','範圍由'],['only','very small shares','僅']),
];
const structures=[
 f('The six pie charts compare how water is allocated to farming, manufacturing and homes in six provinces of Country A.','引言交代六張圖的地點與三種用水目的',[2,4,8],{formula:'The [數量與圖類] compare how [資源] is allocated to [三用途] in [地點]',meaning:'六個圓餅圖比較世界六區的農業、工業與家庭用水分配。',usage:'每個地區的三個扇區合為 100%；圖中不是世界總水量按六區分配。',parts:[link('The'),slot(' six pie charts','數量與圖類'),link(' compare how'),slot(' water','資源'),link(' is allocated to'),slot(' agriculture, industry and domestic purposes','三用途'),link(' in'),slot(' six regions of the world.','地點')]}),
 f('Overall, farming dominates water consumption in four of the six regions, particularly Regions A, B and C.','概覽量化哪種用途在六區中領先，並點出三個突出地區',[0,3,7],{formula:'Overall, [用途] dominates [資源] consumption in [領先區數] of the [總區數] regions, particularly [突出地區]',meaning:'農業在六區中的四區居首，尤其中亞 88%、非洲 84% 和東南亞 81%。',usage:'四區還包括南美洲 71%；particularly 列的是較高的三區，不代表南美洲不屬農業主導。',parts:[link('Overall,'),slot(' agriculture','用途'),link(' dominates'),slot(' water','資源'),link(' consumption in'),slot(' four','領先區數'),link(' of the'),slot(' six','總區數'),link(' regions, particularly'),slot(' Central Asia, Africa and South East Asia.','突出地區')]}),
 f('By contrast, manufacturing takes the largest share in Region E and Region F, while home use remains comparatively small everywhere and never represents the leading category.','以兩區的另一主導用途，對照始終不居首的第三用途',[0,4,7],{formula:'By contrast, [用途甲] takes the largest share in [兩地], while [用途乙] remains comparatively small everywhere and never represents the leading category',meaning:'歐洲和北美工業居首；家庭用水在六區都沒有居首。',usage:'household/domestic 是家庭用途；南美 19% 是家庭用水最高的區，但仍低於該區農業 71%。',parts:[link('By contrast,'),slot(' industrial use','用途甲'),link(' takes the largest share in'),slot(' Europe and North America','兩地'),link(', while'),slot(' household use','用途乙'),link(' remains comparatively small everywhere and never represents the leading category.')]}),
 f('In the two regions where manufacturing is the main user, Region E records the highest industrial proportion, at 54%, slightly above Region F’s 49%.','先界定工業主導兩區，再配對其工業比例',[1,5,8],{formula:'In the two regions where [用途] is the main user, [地甲] records the highest [用途] proportion, at [甲值], slightly above [地乙]’s [乙值]',meaning:'歐洲工業 53%，北美 48%；歐洲比北美高 5 個百分點。',usage:'slightly above 比較同一用途的兩個地區；53 與 48 的差是 5 個百分點，不是 5% 的相對增幅。',parts:[link('In the two regions where'),slot(' industry','用途'),link(' is the main user,'),slot(' Europe','地甲'),link(' records the highest industrial proportion, at'),slot(' 53%','甲值'),link(', slightly above'),slot(' North America','地乙'),link('’s'),slot(' 48%.','乙值')]}),
 f('Farming use is lower in both places, accounting for 34% in Region E and 37% in Region F, whereas home consumption is modest, at 12% and 14% respectively.','在同兩區配對農業與家庭四個比例，避免 respectively 錯位',[0,2,7],{formula:'[用途甲] is lower in both places, accounting for [甲值] in [地甲] and [乙值] in [地乙], whereas [用途乙] is modest, at [丙值] and [丁值] respectively',meaning:'歐洲農業 32%、家庭 15%；北美農業 39%、家庭 13%。',usage:'前半句 32% 對歐洲、39% 對北美；句尾 respectively 的 15%、13% 也依歐洲、北美順序。',parts:[slot('Agricultural use','用途甲'),link(' is lower in both places, accounting for'),slot(' 32%','甲值'),link(' in'),slot(' Europe','地甲'),link(' and'),slot(' 39%','乙值'),link(' in'),slot(' North America','地乙'),link(', whereas'),slot(' domestic consumption','用途乙'),link(' is modest, at'),slot(' 15%','丙值'),link(' and'),slot(' 13%','丁值'),link(' respectively.')]}),
 f('The remaining four regions are clearly farming-centred.','轉入其餘四區的共同主導用途',[1,3,8],{formula:'The remaining [數量] regions are clearly [用途]-centred',meaning:'北美、歐洲以工業為主；其餘南美、非洲、中亞、東南亞四區以農業為主。',usage:'remaining four 直接承接前段的兩個工業主導地區；六減二等於四。',parts:[link('The remaining'),slot(' four','數量'),link(' regions are clearly'),slot(' agriculture','用途'),link('-centred.')]}),
 f('District A has the most pronounced reliance on farming, with 86% of water used for this purpose, followed closely by District B at 83% and District C at 80%.','按同一用途由高到低列三區，並保留各自的值',[0,2,5],{formula:'[地甲] has the most pronounced reliance on [用途], with [甲值] of [資源] used for this purpose, followed closely by [地乙] at [乙值] and [地丙] at [丙值]',meaning:'中亞農業 88%、非洲 84%、東南亞 81%，依次遞減。',usage:'這些都是各地區內農業的百分比；不要說中亞用了全球 88% 的水。',parts:[slot('Central Asia','地甲'),link(' has the most pronounced reliance on'),slot(' farming','用途'),link(', with'),slot(' 88%','甲值'),link(' of'),slot(' water','資源'),link(' used for this purpose, followed closely by'),slot(' Africa','地乙'),link(' at'),slot(' 84%','乙值'),link(' and'),slot(' South East Asia','地丙'),link(' at'),slot(' 81%.','丙值')]}),
 f('South America also devotes a large majority to agriculture, at 70%, although its domestic share, 20%, is noticeably higher than in the other agriculture-dominated regions.','對農業主導第四區補充一項值得比較的家庭例外',[1,3,6],{formula:'[地區] also devotes a large majority to [用途甲], at [甲值], although its [用途乙] share, [乙值], is noticeably higher than in the other [用途甲]-dominated regions',meaning:'南美農業 71%，家庭 19%；後者高於非洲 9%、中亞 7%、東南亞 7%。',usage:'19% 是四個農業主導地區中家庭用水最高，不是六區中所有用途最高。',parts:[slot('South America','地區'),link(' also devotes a large majority to'),slot(' agriculture','用途甲'),link(', at'),slot(' 71%','甲值'),link(', although its'),slot(' domestic','用途乙'),link(' share,'),slot(' 19%','乙值'),link(', is noticeably higher than in the other agriculture-dominated regions.')]}),
 f('Manufacturing use is minimal in these areas, ranging from only 4% in District A to 13% in District C.','用最小與最大值概括這四區的工業用水範圍',[0,4,7],{formula:'[用途] use is minimal in these areas, ranging from only [低值] in [低值地] to [高值] in [高值地]',meaning:'四個農業主導地區的工業用水為中亞 5%、非洲 7%、南美 10%、東南亞 12%。',usage:'5% 是中亞工業、12% 是東南亞工業；區間只涵蓋「這四區」，不包括歐洲 53% 或北美 48%。',parts:[slot('Industrial','用途'),link(' use is minimal in these areas, ranging from only'),slot(' 5%','低值'),link(' in'),slot(' Central Asia','低值地'),link(' to'),slot(' 12%','高值'),link(' in'),slot(' South East Asia.','高值地')]}),
];
const intro=[
 quiz('六張圓餅圖的每個百分比以甚麼為分母？',['該地區的總用水，按農業、工業和家庭分為 100%','全世界總用水的六分之一','每個地區的人口','每區的工廠總數'],'一張圖代表一個地區；該區三種用途的份額合計 100%。'),
 {type:'multi',prompt:'哪兩項最適合放入整體概覽？',detail:'選兩項，再按「確認」。',options:[
  '四區以農業為首，尤其中亞、非洲和東南亞',
  '歐洲與北美以工業為首；家庭用途在六區都沒有居首',
  '所有六區都以工業為最大用途',
  '家庭用途在南美洲超過農業',
 ],correct:[0,1],why:'先按主導用途把六區分成四個農業區及兩個工業區，再指出家庭用途沒有居首。'},
];
const route=[sequence('依範文次序，排好四段的報告工作',[
 ['圖表介紹','交代六區、三種用途與區內用水百分比。'],
 ['整體概覽','四區農業主導，兩區工業主導，家庭用途沒有居首。'],
 ['兩個工業區','比較歐洲與北美的工業、農業及家庭比例，保持地區次序。'],
 ['四個農業區','列中亞、非洲、東南亞的高農業份額，補南美家庭例外及工業低值範圍。'],
],'按主導用途分組可避免把六張圖逐一機械羅列。')];
const evidence=[
 quiz('哪些地區以工業用水居首？',['歐洲 53% 與北美 48%','中亞 88% 與非洲 84%','南美 71% 與東南亞 81%','六區全部'],'歐洲、北美的工業白色扇區最大，其餘四區由農業斜線扇區主導。'),
 quiz('哪個地區的農業用水份額最高？',['中亞 88%','非洲 84%','東南亞 81%','南美 71%'],'中亞農業斜線扇區為 88%，高於其餘五區。'),
 quiz('歐洲的工業、農業、家庭份額依次是多少？',['53%、32%、15%','32%、53%、15%','48%、39%、13%','71%、10%、19%'],'歐洲三扇區依工業、農業、家庭為 53、32、15%。'),
 quiz('北美的工業、農業、家庭份額依次是多少？',['48%、39%、13%','39%、48%、13%','53%、32%、15%','71%、10%、19%'],'北美白色工業 48%、斜線農業 39%、深色家庭 13%。'),
 quiz('南美的家庭用水份額是多少？',['19%，高於其他三個農業主導區','7%，與中亞相同','53%，為全區最大用途','71%，超過農業'],'南美家庭 19%；非洲 9%、中亞 7%、東南亞 7%。'),
 quiz('四個農業主導區的工業份額最低和最高在哪裏？',['中亞 5% 最低，東南亞 12% 最高','歐洲 53% 最低，北美 48% 最高','南美 71% 最低，非洲 84% 最高','四區工業均為 0%'],'中亞工業 5%、非洲 7%、南美 10%、東南亞 12%。'),
 quiz('「歐洲工業 53% 稍高於北美 48%」差多少？',['5 個百分點','5% 的相對增幅','53 個百分點','48 個百分點'],'53 減 48 是 5 個百分點。'),
];
const logic=[
 sequence('先把六張圖按主導用途分成兩組',[
  ['工業主導','歐洲工業 53%、北美工業 48%；各自高於本區的農業與家庭。'],
  ['農業主導','中亞 88%、非洲 84%、東南亞 81%、南美 71%。'],
  ['家庭用途','六區都不是最大；南美 19% 是四個農業主導區中最高。'],
  ['區內分母','每張圖各自合計 100%；不同地區的百分比可比份額，不能直接推出用水體積。'],
 ],'比例的分母是每個地區自身的總用水，不是全球總水量。'),
 sequence('細節如何支持兩組概覽',[
  ['歐洲','工業 53%，農業 32%，家庭 15%。'],
  ['北美','工業 48%，農業 39%，家庭 13%；與歐洲的每個數值保持同一順序。'],
  ['農業高值','中亞 88%、非洲 84%、東南亞 81%；南美亦達 71%。'],
  ['值得單列','南美家庭 19% 高於另外三農業區；工業在四區只佔 5–12%。'],
 ],'先按地區組別配數，再找同組內的突出值與例外，避免把不同用途的數字錯配。'),
];
const transfers=[
 transfer('六張圖顯示六個地區把水用於農業、工業及家庭的比例。','哪句引言沒有誤把地區比例當全球總量？',['六張圓餅圖比較六區各自的農業、工業與家庭用水份額。','六張圖顯示六區各佔全球水量的比例。','每張圖都顯示某區的人口份額。','圖表解釋六區缺水的原因。'],['每區三用途在該區內合為 100%。','分母不是全球總水量。','扇區是用水用途。','沒有原因資料。'],[0],'原文引言界定六區及三種用水用途；每張餅圖的分母是該區用水。'),
 transfer('六區中四區以農業為最大用途，當中三區的農業份額特別高。','哪句概覽保留「四區」與「特別突出三區」的差別？',['農業在六區中的四區居首，尤以其中三區的份額最高。','農業只在三區居首，第四區由家庭領先。','農業在所有六區都居首。','三區的農業份額必定完全相同。'],['四區的整體結論與突出三區並不矛盾。','第四區仍由農業居首。','兩區由工業領先。','特別高不等於相同。'],[1],'原文四區農業主導，但 particularly 只點出中亞、非洲、東南亞三區。'),
 transfer('區 E、F 以工業居首，其餘四區的家庭用途從未居首。','哪句同時交代兩種用途的不同角色？',['相對地，工業在 E、F 區佔最大份額，家庭用途在各區都非首位。','家庭用途在 E、F 區佔最大份額。','工業在六區都居首。','家庭用途在其餘四區一定佔 0%。'],['兩個工業區與家庭不居首兩項事實都保留。','E、F 由工業領先。','其餘四區由農業領先。','未居首不代表零。'],[2],'原文歐洲與北美工業居首，家庭用途六區均不居首。'),
 transfer('E、F 都由工業主導；工業比例分別為 54% 和 49%。','哪句把最高比例配準地區並說對差距？',['E 的工業比例 54%，略高於 F 的 49%，相差 5 個百分點。','F 的工業比例 54%，高於 E 的 49%。','E、F 的工業比例相同。','E 的工業比例只佔 5%。'],['54 對 E、49 對 F，差 5 個百分點。','兩區數值互換。','兩值不同。','5 是百分點差，不是 E 份額。'],[3],'原文歐洲工業 53%、北美 48%，相差 5 個百分點。'),
 transfer('E 區農業 34%、家庭 12%；F 區農業 37%、家庭 14%。','哪句分別配對兩區的兩種用途？',['農業在 E、F 分別佔 34%、37%；家庭則分別佔 12%、14%。','農業在 E、F 分別佔 37%、34%。','家庭在 E、F 分別佔 34%、37%。','兩區家庭用水均為 37%。'],['同一地區順序 E、F 在兩次配值中維持不變。','把農業值對調。','把農業值誤當家庭值。','家庭是 12%、14%。'],[4],'原文歐洲、北美農業 32%、39%；家庭 15%、13%，respectively 順序相同。'),
 transfer('六區中已有兩區由工業主導；另外四區的最大用途都是農業。','哪句自然承接前段？',['其餘四區明顯以農業用水為主。','其餘六區都由工業主導。','其餘兩區的三用途完全一樣。','前述兩區也全由農業主導。'],['六減二得四，並清楚轉入農業組。','整體只有六區。','另有四區，而非兩區。','前述兩區以工業居首。'],[5],'原文 The remaining four regions 轉入南美、非洲、中亞、東南亞。'),
 transfer('農業份額在 A、B、C 區依次為 86%、83%、80%。','哪句保持由高至低與地區配對？',['A 為 86%，其次是 B 的 83% 和 C 的 80%。','A 為 80%，其次是 B 的 83% 和 C 的 86%。','C 以 86% 居首，A 只有 80%。','三區農業份額完全相同。'],['86、83、80 依次遞減，與 A、B、C 配準。','數值由低至高且配錯。','A、C 數值互換。','三值不相同。'],[6],'原文中亞 88%、非洲 84%、東南亞 81%，依此順序。'),
 transfer('南區農業 70%；家庭 20%，比另外三個農業主導區的家庭份額都高。','哪句把主導用途和例外一起說準？',['南區大部分水用於農業，不過其家庭份額在農業主導區中特別高。','南區的家庭 20% 高於自身農業 70%。','南區的工業份額是 70%。','另外三區的家庭份額都高於南區。'],['農業仍居首；家庭只是與同組地區相比突出。','20% 低於 70%。','70% 屬農業。','南區家庭 20% 較高。'],[7],'原文南美農業 71%，家庭 19% 高於其他農業主導地區。'),
 transfer('四個農業主導區的工業份額為 4%、6%、9%、13%；最低在 A，最高在 D。','哪句正確給出這四區的範圍？',['這四區工業佔比由 A 的 4% 至 D 的 13%。','這四區工業佔比由 A 的 13% 至 D 的 4%。','六區工業佔比都只有 4–13%。','A 的農業份額是 4%，D 的家庭份額是 13%。'],['範圍與用途、組別、端點均正確。','高低顛倒。','另兩個工業主導區可高於此範圍。','數值屬工業。'],[8],'原文四個農業主導區的工業份額由中亞 5% 至東南亞 12%。'),
 transfer('E 區工業 53%，F 區工業 48%。','哪句使用恰當的差距單位？',['E 比 F 高 5 個百分點。','E 比 F 高 5% 的相對增幅。','E 比 F 高 53 個百分點。','E 與 F 的工業份額相同。'],['53%−48%=5 個百分點。','相對增幅約 10.4%，不是 5%。','差值不是 53。','兩值不同。'],[3],'原文歐洲 53% 稍高於北美 48%；差距是 5 個百分點。'),
];
export default {key:'task1-pie-charts:2',meta:{topic:'六個地區農業、工業、家庭用水份額',summary:'六區按主導用途分成四個農業區和兩個工業區；逐區核對三扇區分母、配對數字，並辨認南美家庭用水例外。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
