// Rural-to-urban migration: jobs/services as causes, city and rural losses as effects.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:46'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many poorer countries, more and more workers are moving from villages to cities.',
 'People mainly move to find better jobs and have a better life, but the move can also put strong pressure on both cities and villages.',
 'The main reason people leave villages is that cities seem to offer more different ways to earn money.',
 'In many villages, jobs are mostly on farms or involve small amounts of hard physical work. These jobs may only be available at certain times of year, pay little and be affected by weather or changes in what buyers want.',
 'In comparison, cities often have factories, service jobs, building work and small businesses that seem able to provide pay more regularly.',
 'For example, a young person from a farming family may move to a big city because even a low-paid shop or factory job may bring in money more often than farm work.',
 'So moving is not only about wanting to get ahead; for many, it is a practical way to try to get out of poverty.',
 'Another reason is that people think cities often have better services for everyone.',
 'Cities usually have more schools, hospitals, ways to travel and places to learn job skills. Workers may therefore think moving will help both them and their children later in life.',
 'This hope can be very strong when villages do not have basic roads, water or other needed services.',
 'But many people moving from villages to cities can also cause problems.',
 'The first problem is too many people in one place.',
 'If people arrive more quickly than homes, roads and services can grow, cities may get crowded poor areas, traffic jams, dirty conditions and higher daily costs.',
 'At the same time, villages may have too few young people able to work.',
 'If mainly young adults leave, villages have more older residents and weaker local businesses.',
 'To sum up, workers in poorer countries often move to cities for better jobs and services.',
 'Still, without careful planning, the move may leave cities too crowded and villages weaker.',
];
const vocabulary=[
 v(['less economically developed nations','poorer countries','經濟發展較低國家'],['movement of workers','workers are moving','工人遷移'],['urban centres','cities','城市中心'],['increasingly common','more and more','日益普遍']),
 v(['largely driven by','mainly move to','主要由…推動'],['employment','jobs','工作機會'],['improved living standards','better life','生活水平改善'],['serious pressure','strong pressure','嚴重壓力'],['rural communities','villages','農村社區']),
 v(['rural areas','villages','農村地區'],['wider range','more different ways','更廣泛種類'],['economic opportunities','ways to earn money','經濟機會']),
 v(['limited to farming','mostly on farms','局限農業'],['small-scale manual labour','small amounts of hard physical work','小規模體力勞動'],['seasonal','only be available at certain times of year','季節性'],['poorly paid','pay little','低薪'],['vulnerable to weather or market changes','affected by weather or changes in what buyers want','受天氣或市場影響']),
 v(['By contrast','In comparison','相比之下'],['service industries','service jobs','服務業'],['construction projects','building work','建築項目'],['informal businesses','small businesses','非正式商業'],['stable incomes','pay more regularly','穩定收入']),
 v(['young worker','young person','年輕工人'],['capital city','big city','首都城市'],['low-paid job','low-paid shop or factory job','低薪工作'],['regular cash','money more often','穩定現金收入'],['agricultural work','farm work','農業工作']),
 v(['In this sense','So','從這個意義上'],['migration','moving','遷移'],['ambition','wanting to get ahead','野心'],['practical attempt','practical way to try','實際嘗試'],['escape poverty','get out of poverty','逃離貧窮']),
 v(['Another reason','Another reason','另一原因'],['urban areas','cities','城市地區'],['public services','services for everyone','公共服務']),
 v(['transport links','ways to travel','交通網絡'],['training centres','places to learn job skills','培訓中心'],['not only their own lives but also their children’s future prospects','both them and their children later in life','自己與子女前景']),
 v(['especially powerful','very strong','尤其強烈'],['rural communities','villages','農村社區'],['basic infrastructure','basic roads, water or other needed services','基本基礎設施']),
 v(['However','But','然而'],['large-scale','many people','大規模'],['rural-to-urban migration','moving from villages to cities','農村遷往城市'],['several problems','problems','若干問題']),
 v(['most immediate one','first problem','最直接問題'],['overcrowding','too many people in one place','過度擠擁']),
 v(['housing','homes','住房'],['traffic congestion','traffic jams','交通擠塞'],['poor sanitation','dirty conditions','衛生欠佳'],['higher living costs','higher daily costs','生活成本較高'],['slums','crowded poor areas','貧民窟']),
 v(['At the same time','At the same time','同時'],['rural areas','villages','農村地區'],['shortage','too few','短缺'],['young and productive workers','young people able to work','年輕有生產力工人']),
 v(['mostly young adults','mainly young adults','主要年輕成年人'],['ageing population','more older residents','人口老化'],['weaker local economies','weaker local businesses','本地經濟變弱']),
 v(['In conclusion','To sum up','總結'],['developing countries','poorer countries','發展中國家'],['better jobs and services','better jobs and services','更佳工作服務']),
 v(['Nevertheless','Still','然而'],['overcrowded cities','cities too crowded','過度擠擁城市'],['declining rural communities','villages weaker','農村社區衰落'],['not managed carefully','without careful planning','未妥善管理']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many less economically developed nations, the movement of students from villages to urban centres has become increasingly common.',d:[1,2,10],relation:'背景句界定由鄉村到城市的流動趨勢',formula:'In many less economically developed nations, the movement of [群體] from villages to urban centres has become increasingly common',meaning:'較窮國家工人從村莊遷往城市日益普遍。',links:['In many less economically developed nations, the movement of ', ' from villages to urban centres has become increasingly common.'],labels:['遷移群體']},
 {example:'This trend is largely driven by the search for education and safer housing, but it can also create serious pressure on both cities and rural communities.',d:[0,2,10],relation:'but 將兩項遷移動機與兩地壓力對照',formula:'This trend is largely driven by [兩項動機], but it can also create serious pressure on both cities and rural communities',meaning:'較佳工作生活吸引人遷移，也令城鄉受壓。',links:['This trend is largely driven by ', ', but it can also create serious pressure on both cities and rural communities.'],labels:['推動遷移的動機']},
 {example:'The main reason families leave rural areas is that cities appear to offer a wider range of schooling opportunities.',d:[1,8,10],relation:'is that 指出城市機會多這項主要動機',formula:'The main reason [人] leave rural areas is that cities appear to offer a wider range of [機會]',meaning:'城市似提供更多經濟機會。',links:['The main reason ', ' leave rural areas is that cities appear to offer a wider range of ', '.'],labels:['離開者','看重的機會']},
 {example:'In many villages, work is often limited to fishing or small-scale manual labour, which may be seasonal, poorly paid, and vulnerable to weather or market changes.',d:[2,8,10],relation:'which 說明農村工作季節、低薪及受外界影響',formula:'In many villages, work is often limited to [兩種工作], which may be seasonal, poorly paid, and vulnerable to weather or market changes',meaning:'農業與體力勞動工作或季節性、低薪且受天氣市場影響。',links:['In many villages, work is often limited to ', ', which may be seasonal, poorly paid, and vulnerable to weather or market changes.'],labels:['農村常見工作']},
 {example:'By contrast, cities usually have repair workshops, retail stores and transport firms that seem to promise more stable incomes.',d:[2,8,10],relation:'By contrast 對比城市工作種類與穩定收入想像',formula:'By contrast, cities usually have [多種機構] that seem to promise more stable incomes',meaning:'工廠、服務業等似能提供更穩定收入。',links:['By contrast, cities usually have ', ' that seem to promise more stable incomes.'],labels:['城市可提供的工作']},
 {example:'For example, a young worker from a fishing family may move to a capital city because even a low-paid job in a shop can provide more regular cash than seasonal work.',d:[2,8,10],relation:'because 舉低薪但較穩定收入的實例',formula:'For example, a young worker from [家庭] may move to a capital city because even a low-paid job in [城市工作] can provide more regular cash than [原工作]',meaning:'年輕農村工人或為更穩定現金收入搬到首都。',links:['For example, a young worker from a ', ' may move to a capital city because even a low-paid job in a ', ' can provide more regular cash than '],labels:['原有家庭','城市職位','原有工作']},
 {example:'In this sense, migration is not simply a matter of adventure; for many people, it is a practical attempt to find safety.',d:[2,8,10],relation:'not simply ...; for many ... 糾正把遷移只看作野心',formula:'In this sense, migration is not simply a matter of [表面動機]; for many people, it is a practical attempt to [實際需要]',meaning:'遷移對很多人是脫貧的實際嘗試。',links:['In this sense, migration is not simply a matter of ', '; for many people, it is a practical attempt to '],labels:['容易誤解的動機','真正需要']},
 {example:'Another reason is that urban areas are often associated with better transport services.',d:[2,3,10],relation:'第二原因轉向城市公共服務',formula:'Another reason is that urban areas are often associated with better [公共服務]',meaning:'城市常被認為公共服務較好。',links:['Another reason is that urban areas are often associated with better '],labels:['城市吸引力']},
 {example:'Cities tend to have more schools, hospitals and training centres, so workers may believe that moving there will improve not only their own lives but also their children’s future prospects.',d:[2,3,10],relation:'so 把服務較多接到自己和子女前景',formula:'Cities tend to have more [服務], so workers may believe that moving there will improve not only their own lives but also their children’s future prospects',meaning:'教育醫療交通培訓吸引家庭，既為自己也為子女。',links:['Cities tend to have more ', ', so workers may believe that moving there will improve not only their own lives but also their children’s future prospects.'],labels:['城市服務']},
 {example:'This hope can be especially powerful when remote communities lack basic infrastructure.',d:[2,3,10],relation:'when 指出原居地欠基建時希望更強',formula:'This hope can be especially powerful when [原居地] lack basic infrastructure',meaning:'農村缺基建會強化遷移希望。',links:['This hope can be especially powerful when ', ' lack basic infrastructure.'],labels:['缺基建的地方']},
 {example:'However, large-scale movement to the coast can cause several problems.',d:[2,3,8],relation:'However 由原因轉入大規模遷移的問題',formula:'However, large-scale [人口流動] can cause several problems',meaning:'大規模城鄉遷移也有問題。',links:['However, large-scale ', ' can cause several problems.'],labels:['造成壓力的流動']},
 {example:'The most immediate one is a shortage of housing.',d:[2,3,8],relation:'短句點出第一個直接問題',formula:'The most immediate one is [第一項問題]',meaning:'最直接問題是城市過度擁擠。',links:['The most immediate one is '],labels:['最直接問題']},
 {example:'When too many pupils arrive faster than schools and buses can expand, towns may develop overcrowded classes, long queues and higher costs.',d:[2,3,8],relation:'When 比較人口與基建擴張速度，推出城市壓力',formula:'When [到達人數] arrive faster than [基建] can expand, [地方] may develop [多項後果]',meaning:'住房道路服務跟不上人口，形成貧民窟、塞車、衛生差與成本高。',links:['When too many ', ' arrive faster than ', ' can expand, ', ' may develop '],labels:['湧入者','擴張較慢的服務','受壓地方','實際後果']},
 {example:'At the same time, small towns may suffer from a shortage of skilled and productive workers.',d:[2,3,8],relation:'At the same time 轉到原居地的人力流失',formula:'At the same time, [原居地] may suffer from a shortage of [流失的勞動力]',meaning:'農村會缺少年輕有生產力工人。',links:['At the same time, ', ' may suffer from a shortage of ', ' workers.'],labels:['人力流失地方','短缺人力']},
 {example:'If mostly young adults leave, coastal villages are left with an ageing population and weaker local economies.',d:[2,3,8],relation:'If 年輕人離開推出老齡化及經濟弱化',formula:'If mostly young adults leave, [原居地] are left with an ageing population and weaker local economies',meaning:'若年輕人離開，村莊老化且地方經濟變弱。',links:['If mostly young adults leave, ', ' are left with an ageing population and weaker local economies.'],labels:['留下的地方']},
 {example:'In conclusion, families in developing countries often move to cities because they want safer housing and better services.',d:[2,3,8],relation:'結論 because 概括工作與公共服務兩動機',formula:'In conclusion, [群體] in developing countries often move to cities because they want [兩項改善]',meaning:'工人為更好工作及服務移往城市。',links:['In conclusion, ', ' in developing countries often move to cities because they want '],labels:['遷移群體','所求改善']},
 {example:'Nevertheless, this movement can lead to overcrowded towns and declining rural communities if it is not managed carefully.',d:[2,3,8],relation:'if 管理條件下收束城市與農村兩面代價',formula:'Nevertheless, this movement can lead to [城市問題] and [農村問題] if it is not managed carefully',meaning:'若缺妥善管理，城市過擠與農村衰落可並發。',links:['Nevertheless, this movement can lead to ', ' and declining rural communities if it is not managed carefully.'],labels:['城市後果']},
];
const usage=[
 '當你要以背景句交代某群人由一類地方向另一類地方流動的趨勢時。',
 '當你要先概述某趨勢的動機，再用 but 預告它對兩地的壓力時。',
 '當你要用 is that 直接說明人們離開原居地的主要吸引因素時。',
 '當你要用 which 補充某類工作為何不穩定或收入有限時。',
 '當你要用 By contrast 比較遷出地與目的地的機會種類時。',
 '當你要用一個人物說明即使新工作低薪，收入仍可能較穩時。',
 '當你要用 not simply ...; for many ... 糾正對人們動機的單一解讀時。',
 '當你已分析工作機會，還要提出公共服務這個不同吸引因素時。',
 '當你要用 so 說明公共服務如何影響本人及下一代的前景時。',
 '當你要說明原居地缺乏基建會加強人們對新地方的期待時。',
 '當你要由遷移原因轉向其可能造成的問題時。',
 '當你要用短句點出第一個需要深入解釋的直接問題時。',
 '當你要比較人口增加與設施擴張速度，解釋地方為何受壓時。',
 '當你已分析目的地問題，還需用 At the same time 補上原居地的損失時。',
 '當你要用 If 說明年輕成年人離開對人口與地方經濟的後果時。',
 '當你要在結論以 because 重述兩項遷移動機時。',
 '當你要在結論用 if 說明管理不足可能同時傷及兩地時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分開兩種遷移動機和兩地的後果。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('題目要求說明甚麼？',['工人由鄉村遷往城市的原因，以及此舉帶來的問題。','只比較兩座城市的旅遊門票。','只介紹一種農作物。','只討論首都城市的建築高度。'],'文章分原因與問題，並看城鄉兩端。'),{type:'multi',prompt:'哪兩項因素吸引人遷往城市？',detail:'選兩項，再按「確認」。',options:['似乎有更多且較穩定的工作。','教育、醫療、交通等公共服務較多。','城市保證每人立即成為老闆。','每個村莊都已完全沒有住戶。'],correct:[0,1],why:'工作與公共服務是兩條動機。'}];
const route=[sequence('還原五段的問答',[['引言','工人進城日益普遍，動機是工作與生活，壓力落在城鄉。'],['經濟原因','農村工作季節性及低薪，城市工作似有穩定現金。'],['服務原因','教育、醫療、交通和培訓可改善家庭前景。'],['問題','城市人口增速超過設施擴張，農村失去青年勞動力。'],['結論','重申兩項動機及兩地風險，附管理條件。']],'原因是出走前的吸引因素；問題是流動後兩地承受的後果。')];
const evidence=[quiz('農村工作為何可能不穩定？',['農業或小規模體力工作可能季節性、低薪，並受天氣市場影響。','農村所有工作都保證全年同薪。','天氣永遠不影響農業。','城市所有工作都必然高薪。'],'原文列三種風險。'),quiz('年輕農村工人的例子為何選低薪城市工作？',['即使低薪，商店或工廠收入或較農業現金更規律。','因城市工作必然完全沒有風險。','因工人不需收入。','因所有農業工作都被法律禁止。'],'重點是規律現金，不是保證高薪。'),quiz('公共服務如何影響遷移？',['城市更多學校、醫院、交通和培訓，家庭期待自身與子女前景改善。','只有工廠數量會影響家庭。','城市服務與子女未來完全無關。','每個遷入者必然立即入讀所有學校。'],'希望與可能性並非保證。'),quiz('人口湧入快過設施擴張會有甚麼問題？',['貧民窟、交通擠塞、衛生差和生活成本上升。','道路必然立刻變寬。','所有居民必然變年輕。','村莊會立即擁有更多青年工人。'],'城市容量跟不上人數。'),quiz('大量青年離村會有甚麼另一端後果？',['農村勞動人口短缺、人口老化，地方經濟變弱。','每個村莊必然得到更多青年工人。','只有城市可能受人口流動影響。','所有農業收入必然即時上升。'],'人口流動同時影響原居地。')];
const logic=[sequence('工作機會吸引鏈',[['農村限制','工作季節性、低薪、受天氣市場影響。'],['城市對照','多種工作似乎提供較規律現金。'],['個人決定','青年工人或遷入首都。'],['核心動機','對很多人是脫貧的實際嘗試。']],'遷移不應被簡化成單純野心。'),sequence('城鄉兩端的代價',[['城市容量','住房道路服務增長慢於人口。'],['城市後果','擁擠、塞車、衛生與成本問題。'],['農村人力','年輕可工作人口流失。'],['農村後果','人口老化、本地經濟較弱。']],'只分析城市擁擠會漏掉農村。')];
const transfers=[
 transfer('一村的農務季節性強，壞天氣時收入大減。','哪句最貼合遷移的經濟原因？',['村內工作收入不穩，城市多種職位因而顯得較可能提供規律現金。','壞天氣保證所有城市工作都高薪。','農村季節性收入與遷移決定完全無關。','遷移只反映年輕人想去城市玩樂。'],['不穩定→城市機會吸引。','不能保證。','有關。','原文更重生計。'],[3,4,5],'rural seasonal work vs urban stable incomes。'),
 transfer('一名農家青年在城市找到低薪商店工作，仍決定搬去。','哪句避免把理由誇大為高薪？',['雖然薪金不高，但比農務更規律的現金可能有助家庭生計。','任何城市商店工作都保證比農務收入高十倍。','低薪工作絕不可能提供較規律現金。','他的決定必然與家庭經濟完全無關。'],['規律性與金額不同。','無數字證據。','原文例子相反。','家計相關。'],[5,6],'even a low-paid job→more regular cash。'),
 transfer('村裏沒有完善醫院和中學，家庭考慮進城。','哪句分析第二項遷移動機？',['更多醫療和教育服務使家庭期待自己及孩子的前景改善。','城市服務數量與家庭想法毫無關係。','進城便保證所有孩子成為醫生。','缺醫院只會令村莊的基建更完善。'],['公共服務→家庭期待。','原文有關。','無保證。','方向相反。'],[7,8,9],'services improve own lives and children’s prospects。'),
 transfer('城市一年新增人口很多，住房道路擴建卻很慢。','哪句說清城市問題的條件？',['人口到達快過設施擴張時，擁擠與交通衛生成本問題可能出現。','只要人口增加，住房便必然自動增加。','慢速擴建完全不會影響擁擠。','所有遷入者都保證住在寬敞住房。'],['比較兩種速度才說明壓力。','無自動保證。','容量有關。','過度。'],[11,12],'arrive faster than housing/services expand。'),
 transfer('某村多數離開者是二十多歲成年人。','哪句評估原居地後果？',['村莊或留下較老人口並失去年輕勞動力，地方經濟可能轉弱。','青年離開必然令村內工人變得更多。','村莊人口結構永遠不變。','只有城市受人口流動影響。'],['原居地人口與經濟雙後果。','方向相反。','結構會變。','農村也受影響。'],[13,14],'young adults leave→ageing and weak economies。'),
 transfer('有人說「搬到城市只因為想出人頭地」。','哪句用範文修正？',['對許多人而言，尋找規律收入和逃離貧窮是更實際的原因。','所有遷移都只為了旅行拍照。','農村收入從不影響遷移。','想上學和看病必然完全無關。'],['not simply ambition; practical escape from poverty。','無據。','原文相反。','公共服務也是原因。'],[5,6,8],'migration not simply ambition。'),
 transfer('另一題談學生從小鎮遷往首都讀書。','哪句能轉用本文分析架構？',['可比較目的地機會與原居地資源，再分析兩地人口變化的後果。','因工人進城，學生必然找到同一份工。','只談城市好處，原居地永遠不受影響。','遷移原因只能是工資，教育資源完全不重要。'],['吸引因素與兩地影響可跨題使用。','新題不同。','要看兩端。','教育可為原因。'],[2,7,12,14],'機會/服務原因與城鄉兩端後果。'),
 transfer('一段作文只寫「城市擠迫」，沒有說為何。','哪句補足機制？',['遷入速度若超過住房道路和服務擴張，城市容量便可能不足。','城市擠迫，因為城市很擠迫。','所有擠迫只來自農村青年離開。','城市不用任何住房道路服務。'],['人口增速與設施增速的比較。','循環。','缺容量機制。','設施重要。'],[12],'When arrivals faster than expansion。'),
 transfer('政策討論只著眼城市塞車，忽略農村。','哪句補上缺失？',['青年外移還可能使村莊人口老化、缺勞動力並削弱地方經濟。','農村只要有人外移就必然更繁榮。','村莊永遠不需要年輕工作人口。','城市塞車能完全代表農村影響。'],['At the same time 補另一端。','無保證。','需要。','兩地不同。'],[13,14],'rural shortage and ageing。'),
 transfer('結論要完整回答原因與問題兩部分。','哪句最恰當？',['人們為工作和服務進城，但若管理不當，城市可能過擠、農村可能衰落。','人們進城，因為人們進城。','只說城市有學校，完全不談問題。','只說農村變弱，不解釋遷移原因。'],['同時收束動機和兩地風險。','循環。','漏問題。','漏原因。'],[15,16],'結論 because jobs/services + if unmanaged。'),
];
const balancedTransferOptions=[
 ['村內收入不穩，城市工作或提供較規律現金。','村內收入不穩，城市住宿較便宜才是主要吸引力。','城市工作種類較多，但農務收入同樣能保持規律。','青年進城多因社交生活，工作收入只是次要考慮。'],
 ['低薪仍可能比農務收入穩定，有助家庭生計。','城市商店薪金較低，搬遷主要為取得職位名銜。','農務收入較不規律，青年搬去城市只因交通便利。','低薪城市工作可累積經驗，卻無助家庭收入穩定。'],
 ['城市醫療教育較多，或使家庭期待更好前景。','城市學校較多，家庭搬遷主要為了提高即時薪金。','醫療條件可促使搬遷，但子女教育不在考慮之內。','家庭希望子女前景改善，主要靠村內醫院擴充。'],
 ['人口增速快過設施擴張，或帶來擁擠與衛生壓力。','人口增加吸引新建住房，擁擠主要來自交通管理。','住房道路擴建較慢，但新增人口主要改善城市衛生。','人口與擁擠同時上升，主因可能是城市工資水平。'],
 ['青年離開或令村莊老化，少勞動力且經濟轉弱。','青年離開可減輕村內競爭，令留下的勞力更充足。','村莊人口變少後，人口年齡結構通常更加年輕。','城市吸收青年後，農村經濟會靠匯款持續轉強。'],
 ['許多人進城是為取得規律收入和逐步逃離貧窮。','不少人進城是為娛樂消費，工作只是附帶的選項。','農村收入雖有季節變化，進城主因仍是個人名望。','求學與醫療雖有吸引力，但改善生計並非考慮。'],
 ['比較目的地機會與原居資源，再分析兩地後果。','直接套用工人工資數字，便能解釋學生求學決定。','只分析首都的新增學生，較能避免小鎮人口議題。','學生搬遷主要看工作薪酬，教育資源只是附帶因素。'],
 ['人口增速超過住房與服務擴張，城市容量因而或不足。','人口增速與擁擠同步出現，便可略過住房供應變化。','擁擠主要取決於農村人口總量，較少取決於城市容量。','城市道路尚可使用，代表住房與公共服務沒有壓力。'],
 ['青年外移可令村莊老化、缺人手及經濟轉弱。','青年外移減少村內競爭，因此留下者的工作更穩。','村莊人口下降後，醫療需求與勞動人口同時減少。','城市出現塞車時，才可判定農村經濟也受損。'],
 ['人們為工作服務進城，兩地也可能承受壓力。','人們為工作進城，所以城市交通需要增加投資。','城市學校較多，可解釋遷移，也足以概括兩地後果。','村莊變弱反映遷移影響，卻難說明人們為何搬走。'],
];
const balancedTransferExplanations=[
 ['農村收入不穩與城市較規律的現金收入構成對照。','題目沒有比較兩地住宿費，不能以此取代工作動機。','農務受季節與天氣影響，不能說收入同樣規律。','社交生活可能吸引人，但此例強調收入風險。'],
 ['低薪與收入規律是兩個不同維度，後者仍可改善家計。','原文沒有說職位名銜是搬遷的目的。','交通便利不能解釋例子所強調的現金規律性。','累積經驗可能有益，但此處的因果重點是規律收入。'],
 ['醫療及教育服務共同支持對家庭未來的期待。','只談即時薪金，漏掉題目所問的服務動機。','子女教育正是範文列明的考慮，不能排除。','村內醫院擴充不是此家庭考慮進城的原因。'],
 ['比較人口與設施的增長速度，才能說明容量壓力。','新增住房未必趕得上人口，且交通不是唯一壓力。','設施擴張慢而人口增多，衛生壓力可能加重。','工資或影響遷移，不能單獨解釋住房與道路容量。'],
 ['青年流失同時改變村莊的年齡結構及勞動供應。','競爭減少不代表留下的勞動人口變得更多。','主要離開者是青年，留下的人口不會因此更年輕。','匯款可能有幫助，但不能抹掉勞力與老化風險。'],
 ['範文把規律收入和脫貧列為實際的工作動機。','娛樂可能是附帶因素，不能取代明示的生計原因。','把生計壓力改寫為名望，忽略收入不穩的情境。','除了服務，改善收入也是明示的遷移動機。'],
 ['可以轉用比較機會與分析兩地後果的架構。','工人工資數字不能直接套到學生的求學動機。','只看首都會漏掉小鎮可能失去的青年人口。','學生題的核心可以是教育機會，而非工作薪酬。'],
 ['人口增加比住房與服務擴張快，才形成容量缺口。','同步出現不足以說明機制，仍須比較住房供應。','城市容量是此段的關鍵，不能只看農村總人口。','道路尚可使用不表示住房及服務同樣足夠。'],
 ['範文補上青年外移對農村勞力、年齡與經濟的影響。','勞動人口流失仍可能削弱村莊的生產能力。','青年離開可能令留下的人口更老，而非同步減少需求。','城市塞車與農村經濟不是同一項可觀察指標。'],
 ['結論同時收束兩種動機與城鄉兩端的風險。','只回答工作原因與城市交通，漏掉服務及農村問題。','學校可解釋部分動機，但不能概括兩地後果。','只交代農村後果，沒有回答遷移原因。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options;transfers[i].explanations=balancedTransferExplanations[i];transfers[i].why=balancedTransferExplanations[i][0]});
// Reviewed connector structure decompositions.
structures[16].frame.parts=[["Nevertheless, this movement can lead to ","link","句型固定部分"],["overcrowded cities","slot","城市問題"],[" and ","link","句型固定部分"],["declining rural communities","slot","農村問題"],[" if it is not managed carefully.","link","句型固定部分"]];
structures[16].frame.formula="Nevertheless, this movement can lead to [城市問題] and [農村問題] if it is not managed carefully.";
export default {key:'direct-question:46',meta:{topic:'工人由農村遷往城市的原因與問題',summary:'範文把較穩收入和公共服務分成兩項動機，再分城市容量不足與農村青年流失兩端分析後果，避免把遷移只歸因於野心。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
