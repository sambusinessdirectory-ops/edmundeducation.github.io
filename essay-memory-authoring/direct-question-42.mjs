// Tourism: distinct individual and social benefits, with a concrete causal chain.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:42'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Tourism is now a big part of the world economy. Millions of people travel for fun, work and to learn about other cultures.',
 'I think its biggest good points are helping people understand the world and helping society by giving people jobs, paying for public services and caring for local culture.',
 'For each person, tourism lets them leave their usual daily life for a while and see how other people live.',
 'When travellers hear other languages and see different ways of living and thinking, they often become more willing to consider new ideas and less likely to judge people quickly.',
 'For example, a student visiting Kyoto might learn more by watching how local people behave and visiting temples and food places than by reading a textbook chapter.',
 'Seeing a culture for yourself matters because it changes culture from an idea in a book into something you can see, hear and remember.',
 'So tourism can make people more interested in learning, better able to handle new situations and more careful about cultural differences.',
 'Tourism also helps society, especially in places that depend on visitors.',
 'Hotels, eating places, buses, museums and small shops need people to work there, so tourism can give families money and mean fewer people have no job.',
 'Money visitors spend can also help everyone in a place: governments may get more tax money, make travel easier and look after old places that might otherwise be left uncared for.',
 'For example, if visitors like an old part of town, local governments have more reason to repair buildings, teach guides and keep it clean.',
 'In this way, tourism does more than bring money into a country; it can also give people a good reason to keep their local way of life.',
 'To sum up, tourism helps people see more of the world and helps society through jobs, better local services and care for culture.',
 'If managed well, it can both help the economy grow and bring people from different cultures closer.',
];
const vocabulary=[
 v(['one of the most visible parts','a big part','最顯眼的部分之一'],['global economy','world economy','全球經濟'],['leisure','fun','休閒'],['cultural experience','learn about other cultures','文化體驗']),
 v(['In my view','I think','在我看來'],['broadens individuals’ understanding','helping people understand','拓寬個人理解'],['strengthens society','helping society','強化社會'],['funding public services','paying for public services','資助公共服務'],['protecting local culture','caring for local culture','保護本地文化']),
 v(['On an individual level','For each person','個人層面'],['step outside','leave','走出'],['narrow routine of daily life','usual daily life','狹窄的日常規律']),
 v(['encounter','hear','接觸'],['customs','ways of living','習俗'],['open-minded','willing to consider new ideas','開明'],['less quick to judge','less likely to judge people quickly','較不急於批判']),
 v(['observing local manners','watching how local people behave','觀察當地禮儀'],['temples','temples','寺廟'],['food traditions','food places','飲食傳統'],['a chapter in a textbook','a textbook chapter','教科書一章']),
 v(['first-hand experience','Seeing a culture for yourself','親身經驗'],['powerful','matters','有力量'],['abstract idea','idea in a book','抽象概念'],['see, hear and remember','see, hear and remember','看見聽見記住']),
 v(['therefore','So','因此'],['curious','interested in learning','好奇'],['adaptable','better able to handle new situations','適應力強'],['culturally sensitive','careful about cultural differences','文化敏感']),
 v(['social benefits','helps society','社會好處'],['especially','especially','尤其'],['rely on visitors','depend on visitors','依賴旅客']),
 v(['restaurants','eating places','餐廳'],['transport companies','buses','交通公司'],['provide income','give families money','提供收入'],['reduce unemployment','mean fewer people have no job','減少失業']),
 v(['support wider public life','help everyone in a place','支持公共生活'],['tax revenue','tax money','稅收'],['improve transport links','make travel easier','改善交通連接'],['maintain historic sites','look after old places','維護歷史遺址'],['neglected','left uncared for','被忽視']),
 v(['For instance','For example','例如'],['old district','old part of town','舊區'],['local authorities','local governments','地方政府'],['restore buildings','repair buildings','修復建築'],['train guides','teach guides','培訓導遊']),
 v(['does not merely bring money','does more than bring money','不只帶來金錢'],['communities','people','社區'],['practical reason','good reason','實際理由'],['preserve their identity','keep their local way of life','保留身份']),
 v(['In conclusion','To sum up','總結'],['widening their horizons','see more of the world','拓寬視野'],['creating employment','jobs','創造就業'],['improving local facilities','better local services','改善本地設施'],['cultural preservation','care for culture','文化保育']),
 v(['Managed responsibly','If managed well','妥善管理'],['economic engine','help the economy grow','經濟引擎'],['bridge between cultures','bring people from different cultures closer','文化橋樑']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Online learning has become one of the most visible parts of modern education, with many adults joining classes after work.',d:[1,7,12],relation:'背景加 with 引出現象規模',formula:'[現象] has become one of the most visible parts of [領域], with [參與規模]',meaning:'旅遊業是全球經濟顯眼部分，數百萬人為不同目的旅行。',links:[' has become one of the most visible parts of ', ', with '],labels:['現象','所屬領域','參與規模']},
 {example:'In my view, its greatest benefits are that it widens access to books and strengthens the community by creating shared study spaces.',d:[0,2,12],relation:'are that 加兩項分層好處，by 補社會機制',formula:'In my view, [事物] greatest benefits are that [個人所得] and [社會所得] by [機制]',meaning:'作者先列個人理解，再列就業、公服與文化三項社會收益。',links:['In my view, ', ' greatest benefits are that ', ' and ', ' by '],labels:['評估對象','個人層面','社會層面','社會機制']},
 {example:'On an individual level, volunteering allows pupils to step outside their usual routine and see how older neighbours live.',d:[1,7,12],relation:'先限定個人層面，再說跳出日常與理解他人',formula:'On an individual level, [活動] allows [人] to step outside [日常] and see [他人生活]',meaning:'旅遊使個人走出日常，觀察他人生活。',links:['On an individual level, ', ' allows ', ' to step outside ', ' and see '],labels:['活動','受益者','原有日常','新觀察']},
 {example:'When pupils encounter unfamiliar ideas, they often become more willing to listen and less quick to dismiss other views.',d:[2,8,11],relation:'When 呈現接觸差異後的兩項態度改變',formula:'When [人] encounter [差異], they often become more [正面態度] and less quick to [負面反應]',meaning:'接觸不同語言習俗與思想，旅客較開明且較少急於批判。',links:['When ', ' encounter ', ', they often become more ', ' and less quick to '],labels:['接觸者','遇到的差異','變得更開放','減少的反應']},
 {example:'A trainee who visits a workshop, for example, may learn more from watching skilled workers than from reading a manual.',d:[2,6,9],relation:'who 和 than from 對比親眼觀察與書本學習',formula:'A [學習者] who visits [地方], for example, may learn more from [現場觀察] than from [書面材料]',meaning:'京都學生觀察禮儀、寺廟、飲食，所得或勝於讀一章書。',links:['A ', ' who visits ', ', for example, may learn more from ', ' than from '],labels:['學習者','到訪地點','親身觀察','書面學習']},
 {example:'This kind of first-hand experience is powerful because it turns science from an abstract idea into something pupils can see and test.',d:[2,7,11],relation:'because 解釋親身體驗把抽象概念變具體',formula:'This kind of first-hand experience is powerful because it turns [抽象內容] from an abstract idea into something [可感知行動]',meaning:'親身體驗使文化成為可見、可聽、可記的事物。',links:['This kind of first-hand experience is powerful because it turns ', ' from an abstract idea into something '],labels:['所學概念','可感知經驗']},
 {example:'Outdoor study can therefore make pupils more curious, confident and careful with evidence.',d:[2,7,11],relation:'therefore 把前述經驗收束為三項個人特質',formula:'[活動] can therefore make [人] more [特質一], [特質二] and [特質三]',meaning:'旅遊可使人好奇、適應力強且有文化敏感度。',links:[' can therefore make ', ' more ', ', ', ' and '],labels:['活動','受益者','特質一','特質二','特質三']},
 {example:'A public library also brings clear social benefits, especially in towns whose residents lack quiet study space.',d:[2,8,12],relation:'also 轉入社會層面，especially 限定更受益的地方',formula:'[事物] also brings clear social benefits, especially in [更依賴它的地方]',meaning:'旅遊社會好處在依賴訪客的城鎮尤其明顯。',links:[' also brings clear social benefits, especially in '],labels:['事物','特別受益的地方']},
 {example:'Farms, warehouses and local markets all need workers, so food production can provide income for families and reduce unemployment.',d:[2,7,11],relation:'so 從多種場所需人手推出家庭收入與較少失業',formula:'[多種機構] all need workers, so [產業] can provide income for families and reduce unemployment',meaning:'旅遊機構需要員工，因而提供收入並減少失業。',links:[' all need workers, so ', ' can provide income for families and reduce unemployment.'],labels:['僱用工人的機構','帶動就業的產業']},
 {example:'The fees paid by visitors can also support wider public life: councils may collect more revenue, improve bus routes and maintain public parks that might otherwise be neglected.',d:[2,7,11],relation:'冒號後列稅收、交通與歷史保育的公共用途',formula:'The money spent by [人] can also support wider public life: [政府] may collect more [收入], improve [交通] and maintain [設施] that might otherwise be neglected',meaning:'遊客花費可增加稅收、改善交通及維護遺址。',links:[' can also support wider public life: ', ' may collect more ', ', improve ', ' and maintain ', ' that might otherwise be neglected.'],labels:['支出來源','收費主體','公共收入','改善項目','維護項目']},
 {example:'For instance, when an old park becomes popular with visitors, local authorities have a stronger reason to restore paths, train volunteers and keep the area clean.',d:[2,7,12],relation:'when 例子展示訪客需求如何增加地方維護誘因',formula:'For instance, when [地方] becomes popular with [使用者], local authorities have a stronger reason to [三項維護行動]',meaning:'舊區受歡迎，地方政府較有理由修復建築、培訓導遊與清潔。',links:['For instance, when ', ' becomes popular with ', ', local authorities have a stronger reason to ', ', ', ' and keep the area clean.'],labels:['受歡迎地方','使用者','修復工作','培訓工作']},
 {example:'In this way, a school garden does not merely bring fresh food to pupils; it can also give families a practical reason to work together.',d:[2,7,12],relation:'not merely ...; also 對照直接收入與保存身份誘因',formula:'In this way, [活動] does not merely bring [直接收益]; it can also give [群體] a practical reason to [長期行動]',meaning:'旅遊不僅帶錢，也給社區保存文化身份的動機。',links:['In this way, ', ' does not merely bring ', '; it can also give ', ' a practical reason to '],labels:['活動','直接收益','受益群體','被促進的行動']},
 {example:'In conclusion, a public library benefits individuals by widening access to knowledge and benefits society by supporting study spaces and community events.',d:[1,7,11],relation:'結論平行收束個人與社會兩層好處',formula:'In conclusion, [事物] benefits individuals by [個人所得] and benefits society by [社會所得]',meaning:'結論統合個人視野與社會就業、設施及文化保育。',links:['In conclusion, ', ' benefits individuals by ', ' and benefits society by '],labels:['事物','個人益處','社會益處']},
 {example:'Managed responsibly, a public festival can be both an economic engine and a bridge between generations.',d:[1,7,12],relation:'過去分詞開頭加 both ... and ... 指出條件與雙重功能',formula:'Managed responsibly, [活動] can be both [經濟作用] and [文化作用]',meaning:'妥善管理下，旅遊既帶動經濟，也連結文化。',links:['Managed responsibly, ', ' can be both ', ' and '],labels:['被管理的活動','經濟作用','文化作用']},
];
const usage=[
 '當你要用背景句說明某現象在較大領域中已很顯眼，並補上參與規模時。',
 '當題目問某事的好處，而你要在引言預告個人與社會兩個回答層面時。',
 '當你要先限定個人層面，再說一項活動如何令人體驗不同生活時。',
 '當你要用 When 說明接觸差異後可能出現的兩種態度變化時。',
 '當你要比較親眼觀察和閱讀資料各自帶來的學習效果時。',
 '當你要用 because 解釋親身體驗如何把抽象知識變成可感知經驗時。',
 '當你已說明一段經驗，想用 therefore 收束它對個人特質的影響時。',
 '當你要從個人好處轉到社會好處，並指出哪些地方特別受益時。',
 '當你要用 so 把多種機構的人手需求連到家庭收入和失業變化時。',
 '當你要在總論後用冒號列出公共收入可支持的幾項具體用途時。',
 '當你要用一個地區的例子，說明需求增加如何改變公共維護的誘因時。',
 '當你要用 not merely ...; also ... 區分直接金錢收益與更長遠的社區作用時。',
 '當結論要以平行句式分別收束個人和社會兩層好處時。',
 '當你要先提出管理條件，再用 both ... and ... 概括雙重作用時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清個人與社會，再追蹤每條因果線。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('題目要求範文說明旅遊的哪兩個層面好處？',['個人與社會。','只比較飛機與火車票價。','只討論一家酒店的房價。','只列出京都所有寺廟。'],'文章以個人視野和社會發展分段。'),
 {type:'multi',prompt:'範文的主要論證線是哪些？',detail:'選兩項，再按「確認」。',options:['接觸不同文化使個人更開明。','旅遊支出可帶來工作、公共設施和文化維護。','每名旅客都保證取得新工作。','歷史遺址只靠學生課本維護。'],correct:[0,1],why:'第一條是個人理解，第二條是社會就業、公服與保育。'},
];
const route=[sequence('還原四段的論證次序',[
 ['引言','指出旅遊普遍，預告個人理解與社會三項好處。'],
 ['個人層面','接觸差異及親身觀察，使文化由抽象變具體。'],
 ['社會層面','旅遊業聘員工，遊客花費也可支持交通與古蹟維護。'],
 ['結論','平行收束個人及社會好處，附上妥善管理的條件。'],
 ],'兩個主體段各自回答題目的一個層面。')];
const evidence=[
 quiz('京都學生的例子支持哪個主張？',['親身觀察禮儀、寺廟與飲食，有助理解文化。','讀課本永遠沒有任何學習作用。','所有旅客都必須到京都。','文化只由酒店房價決定。'],'例子對比現場觀察與書本的一章。'),
 quiz('旅遊如何給家庭帶來收入？',['酒店、餐廳、交通、博物館與商店需要員工。','所有旅客都直接成為政府職員。','旅遊會自動取消所有工作。','只有古蹟本身可擔任導遊。'],'不同旅遊相關機構需要人手。'),
 quiz('遊客支出可支持哪些公共用途？',['增加稅收，改善交通，維護歷史遺址。','只讓旅客繳付一項固定的學校費用。','保證每座古蹟都立即變成新建築。','使地方政府毋須考慮維修。'],'原文用冒號列出三種公共用途。'),
 quiz('舊區受旅客歡迎，為何可能促進保育？',['地方政府更有理由修復建築、培訓導遊與保持清潔。','因為所有舊區都會自動消失。','因為受歡迎便不再需要任何管理。','因為遊客只會讀課本而不會到訪。'],'需求增加形成維護的實際誘因。'),
 quiz('最後一句為何加 Managed responsibly？',['雙重好處仍取決於妥善管理。','旅遊在任何情況下都保證無成本。','管理只是指旅行時行李大小。','文章已否定旅遊可帶來經濟收益。'],'結論保留管理條件，避免無條件保證。'),
];
const logic=[
 sequence('個人理解的因果鏈',[['接觸差異','旅客遇見不同語言、習俗與想法。'],['親身觀察','京都例子把文化變成可見可聽的經驗。'],['態度改變','較開明、少急於批判，也更有文化敏感度。']],'不應只說「旅遊好」，須說清接觸如何帶來改變。'),
 sequence('社會收益的兩條線',[['直接就業','旅遊相關機構用人，家庭得收入。'],['遊客支出','可能帶來稅收及交通改善。'],['保育誘因','受歡迎的舊區更有維護與保留身份的理由。']],'就業與公共維護是兩條不同機制。'),
];
const transfers=[
 transfer('一班學生親自到另一城市觀察當地市場與節日。','哪句準確轉用個人層面的論證？',['親身接觸可把課本上的文化概念變成可見、可記的經驗。','學生一到訪便保證精通當地所有語言。','城市市場與文化理解完全無關。','只要有節日，便毋須再理解當地居民。'],['親身觀察→抽象變具體。','無法保證精通。','原文有關。','節日並非全部。'],[4,5],'京都學生例子及 first-hand experience。'),
 transfer('一個海邊小鎮增加了家庭旅館和餐廳。','哪句說清就業機制？',['這些店舖需要員工，因此可為家庭提供收入並可能減少失業。','旅館數量上升便保證每個居民成為老闆。','新餐廳一定令所有其他行業消失。','海邊有旅館與人手需求完全無關。'],['機構用人→收入與就業。','無普遍保證。','過度斷言。','店舖需員工。'],[8],'原文五類機構 all need workers, so ...。'),
 transfer('古城區因遊客增加，地方政府增撥資源修理舊樓。','哪句最符合保育因果？',['到訪需求增加，地方政府更有實際理由維護歷史建築。','遊客一增加，歷史建築便自動修復。','維修舊樓證明古城區沒有任何文化價值。','只有旅客能決定地方政府所有預算。'],['人氣→維護誘因，沒有自動保證。','仍需資源與行動。','方向相反。','決策不只旅客。'],[10,11],'原文 old district popular→restore buildings。'),
 transfer('一名旅客見到不同飲食和家庭習俗，開始較少急於批判。','哪句完整呈現態度轉變？',['接觸差異可能令她更願意理解新觀點，亦較少快速批判陌生生活。','只要見過一道菜，她便完全理解所有文化。','陌生習俗只能令人更加急於批判。','飲食和日常習俗與文化態度毫無關係。'],['接觸差異→較開明、少急於批判。','過度概括。','與範文相反。','正是觀察內容。'],[3,6],'原文 different languages/customs→open-minded。'),
 transfer('旅遊收入增加後，政府考慮改善巴士路線及古蹟維護。','哪句避免混淆遊客支出與公共用途？',['遊客花費可增加稅收，政府因而可能改善交通並維護古蹟。','每一元遊客支出都必須全部直接交到古蹟。','旅遊收入與公共交通在任何情況都毫無關係。','所有古蹟只要受歡迎便不需要維修。'],['支出、可能稅收、可能用途順序正確。','無這種規定。','原文列交通。','仍需維護。'],[9,10],'原文 tourists spend→tax→transport/sites。'),
 transfer('另一題問博物館給個人和社區的好處。','哪句能轉移本篇雙層框架？',['可分別分析參觀者如何理解文化，以及場館如何提供工作和保護地方記憶。','因為旅遊有好處，所有博物館做法都必然正確。','只討論售票價格，忽略個人與社區。','博物館與旅遊沒有任何可比較作用。'],['個人理解與社會工作、保育可跨題檢查。','新題仍須論證。','漏答兩層。','有可比機制。'],[1,7,12],'原文 individual understanding / social benefits。'),
 transfer('一篇作文只說「旅遊令社會更好」，沒有例子。','哪句補上可檢驗的社會機制？',['旅遊相關商戶需僱人，而訪客消費也可能支持稅收、交通和古蹟保養。','旅遊好，因為它對社會有好處。','所有旅客都會成為導遊和政府職員。','社會好處只能靠作者重複立場來證明。'],['僱人與遊客支出各有具體作用。','循環說法。','無此保證。','缺證據。'],[8,9,10],'原文就業與公共支出兩條線。'),
 transfer('有人認為旅遊只帶來短期收入。','哪句用範文補充較長遠的作用？',['受歡迎的舊區可使社區更有理由維護建築並保留地方身份。','只要有遊客，地方身份必然完全不變。','保育與社區從不需要任何實際誘因。','旅遊收入一定只能用於旅客紀念品。'],['金錢以外還有保育誘因。','過度保證。','原文說需要。','用途可更廣。'],[10,11],'not merely money; also preserve identity。'),
 transfer('結論稱「所有旅遊形式在任何地方都必定有益」。','哪句修正過度斷言？',['在妥善管理下，旅遊可以同時帶動經濟與促進文化交流。','管理方式與旅遊結果永遠沒有關係。','只要旅遊有經濟收入，就不可能有文化交流。','每個旅客都必然有相同體驗。'],['保留管理條件與 can 的可能性。','原文有條件。','雙作用可並存。','不必相同。'],[13],'Managed responsibly ... can be both ...。'),
 transfer('老師要學生總結旅遊對「個人」和「社會」的好處。','哪句最完整？',['個人可拓寬視野；社會可由就業、設施改善和文化保育受益。','只列京都的食物，便已完整回答兩層。','只說酒店有工作，個人的理解完全不用談。','旅遊必然讓每個人都取得相同收入。'],['平行收束兩層與各自機制。','缺社會面。','缺個人面。','無普遍收入保證。'],[1,12],'結論 benefits individuals ... benefits society。'),
];
export default {key:'direct-question:42',meta:{topic:'旅遊對個人和社會的好處',summary:'文章先分析接觸差異和親身觀察如何拓寬個人視野，再分析旅遊僱用人手、遊客支出與地方保育誘因；結論以妥善管理為條件。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
