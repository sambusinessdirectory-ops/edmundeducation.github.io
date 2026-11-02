// Elevated trains: road separation and construction options versus budgets and neighbourhoods.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:26'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Too many vehicles on the road have become a major problem in many big cities. This wastes people’s time, makes work less efficient and puts pressure on current transport.',
 'One suggested answer is to build trains that travel on tracks above roads, not on roads or under the ground.',
 'This essay looks at the good and bad points of using these trains to reduce crowded city roads.',
 'One big good point is that these trains can carry many people without taking road space away from cars, buses or delivery vehicles.',
 'Because the trains run above streets, traffic lights, crashes and busy roads do not affect them much; this makes trips faster and more dependable.',
 'For example, a worker going from an outer area to the city centre could still arrive on time even when the roads below are not moving.',
 'Another good point is that, in some places, building these lines can be easier than building underground trains because workers do not need to dig long tunnels beneath crowded areas.',
 'For example, a city could put supports and tracks above a wide main road faster than digging under old buildings and buried pipes.',
 'Even so, this answer also has clear bad points.',
 'The first is cost: even if trains above the streets cost less than underground ones, cities still need a lot of money for land, building work, stations and repairs over many years.',
 'For example, if a city spends most of its transport money on one line above the streets, it may need to delay improvements to buses or outer roads that people also need.',
 'A second problem is how these trains affect the areas around them.',
 'Large structures above streets can stop sunlight, make noise and give people living nearby less privacy.',
 'For example, people in flats beside the tracks may have trains going past their windows from early morning to late night, making the area less pleasant.',
 'To sum up, these trains can help people avoid road traffic and add room for more public transport passengers.',
 'At the same time, high costs and effects on nearby neighbourhoods mean they cannot solve every city traffic problem.',
];
const vocabulary=[
 v(['Traffic congestion','Too many vehicles on the road','交通擠塞'],['defining problem','major problem','主要問題'],['commuters’ time','people’s time','通勤時間'],['harming productivity','makes work less efficient','損害生產力'],['existing transport systems','current transport','現有交通系統']),
 v(['proposed solution','suggested answer','建議方案'],['sky trains','trains that travel on tracks above roads','空中列車'],['elevated tracks','tracks above roads','高架軌道'],['beneath the ground','under the ground','地下']),
 v(['examine','looks at','探討'],['advantages and disadvantages','good and bad points','優點與缺點'],['reduce urban congestion','reduce crowded city roads','紓緩城市交通擠塞']),
 v(['transport large numbers of passengers','carry many people','運載大量乘客'],['without competing with','without taking road space away from','不用爭奪'],['limited road space','road space','有限路面空間'],['delivery vehicles','delivery vehicles','送貨車']),
 v(['above street level','above streets','街道上方'],['largely unaffected','do not affect them much','大致不受影響'],['traffic lights','traffic lights','交通燈'],['rush-hour bottlenecks','busy roads','繁忙時段樽頸'],['more reliable','more dependable','更可靠']),
 v(['outer residential district','outer area','外圍住宅區'],['city centre','city centre','市中心'],['arrive on time','arrive on time','準時到達'],['at a standstill','not moving','完全停滯']),
 v(['elevated lines','these lines','高架線'],['in some cases','in some places','在某些情況下'],['simpler to construct','easier than building','較易興建'],['underground railways','underground trains','地下鐵路'],['extensive tunnelling','long tunnels','大規模隧道工程'],['densely built-up areas','crowded areas','建築密集區']),
 v(['install pillars and tracks','put supports and tracks','設支柱軌道'],['wide central avenue','wide main road','寬闊中央大道'],['historic buildings','old buildings','歷史建築'],['buried utility lines','buried pipes','地下公用設施']),
 v(['However','Even so','然而'],['solution','answer','方案'],['clear disadvantages','clear bad points','明顯缺點']),
 v(['financial cost','cost','財政成本'],['less expensive than subways','cost less than underground ones','較地下鐵路便宜'],['substantial investment','a lot of money','大量投資'],['land acquisition','land','取得土地'],['long-term maintenance','repairs over many years','長期維修']),
 v(['transport budget','transport money','交通預算'],['elevated line','line above the streets','高架路線'],['postpone improvements','delay improvements','延後改善'],['suburban roads','outer roads','郊區道路']),
 v(['second drawback','second problem','第二缺點'],['impact on the urban environment','affect the areas around them','對城市環境影響']),
 v(['overhead structures','structures above streets','高架結構'],['block sunlight','stop sunlight','遮擋陽光'],['create noise','make noise','製造噪音'],['reduce privacy','less privacy','減少私隱']),
 v(['apartment blocks','flats','公寓'],['elevated track','tracks','高架軌道'],['passing their windows','going past their windows','經過窗前'],['less pleasant to live in','less pleasant','較不宜居']),
 v(['In summary','To sum up','總結'],['bypass road congestion','avoid road traffic','避開路面擠塞'],['expand public transport capacity','add room for more public transport passengers','增加公共交通容量']),
 v(['At the same time','At the same time','同時'],['high cost','high costs','高昂成本'],['surrounding neighbourhoods','nearby neighbourhoods','周邊社區'],['not a perfect solution','cannot solve every city traffic problem','非完美方案']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Water shortage has become a defining problem in many coastal towns, wasting residents’ time, harming local work, and putting pressure on local services.',d:[1,8,14],relation:'背景句先指出問題，再列可見後果',formula:'[問題] has become a defining problem in [地方], [後果一], [後果二] and [後果三]',meaning:'城市交通擠塞浪費時間、損害生產力並壓迫現有系統。',links:[' has become a defining problem in ', ', wasting ', ', harming ', ', and putting pressure on '],labels:['問題','地方','時間損失','生產力損失','系統壓力']},
 {example:'One proposed solution is to build walking paths, which run on raised platforms rather than across busy roads.',d:[0,8,14],relation:'which 解釋新方案的位置，rather than 比較其他位置',formula:'One proposed solution is to build [方案], which run on [位置] rather than [其他位置]',meaning:'建議建高架列車，在道路上方而非路面或地下運行。',links:['One proposed solution is to build ', ', which run on ', ' rather than '],labels:['新方案','其位置','對照位置']},
 {example:'This essay will examine the advantages and disadvantages of using this approach to reduce noise in the city.',d:[0,8,14],relation:'交代本文將比較方案的利弊與所要處理的問題',formula:'This essay will examine the advantages and disadvantages of using this approach to reduce [問題]',meaning:'文章比較高架列車紓緩城市擠塞的利弊。',links:['This essay will examine the advantages and disadvantages of using this approach to reduce '],labels:['所處理問題']},
 {example:'One major advantage of sky trains is that they can carry many riders without competing with cars or buses for limited road space.',d:[2,8,9],relation:'without 說明增加載客而不佔用路面',formula:'One major advantage of [方案] is that it can [新增能力] without competing with [現有使用者] for limited road space',meaning:'高架列車載客量大，又不與車輛爭有限路面。',links:['One major advantage of sky trains is that they can ', ' without competing with ', ' for limited road space.'],labels:['新增運力','路面其他使用者']},
 {example:'Because the system operates above street level, it is largely unaffected by traffic lights and rush-hour queues, which makes journeys faster and more reliable.',d:[3,8,9],relation:'Because 說明道路分離，which 推出可靠車程',formula:'Because the system operates above street level, it is largely unaffected by [路面干擾], which makes journeys faster and more reliable',meaning:'高架軌道少受燈號、事故和繁忙樽頸影響。',links:['Because the system operates above street level, it is largely unaffected by ', ', which makes journeys faster and more reliable.'],labels:['路面干擾']},
 {example:'For example, a nurse travelling from a suburb to the hospital could still arrive on time even if the roads below were at a standstill.',d:[3,8,9],relation:'even if 用道路完全停滯突顯高架路線獨立性',formula:'For example, a [通勤者] could still arrive on time even if [路面停滯條件]',meaning:'即使下方道路停滯，外圍地區員工仍可能準時到中心。',links:['For example, a ', ' could still arrive on time even if '],labels:['通勤者及路線','路面情況']},
 {example:'Another benefit is that elevated lines can, in some cases, be simpler to construct than subways, since they do not require extensive tunnelling beneath crowded streets.',d:[3,8,9],relation:'in some cases 限定高架線較易建，since 解釋無須大規模隧道',formula:'Another benefit is that elevated lines can, in some cases, be simpler to construct than [對照設施], since they do not require [工程]',meaning:'部分地方高架鐵路可較易建造，因不用在密集區大規模挖隧道。',links:['Another benefit is that elevated lines can, in some cases, be simpler to construct than ', ', since they do not require '],labels:['對照設施','不需的工程']},
 {example:'For instance, a city could install pillars and tracks above a wide road more quickly than digging beneath historic buildings and water pipes.',d:[3,8,9],relation:'以高架支柱對比在歷史建築及地下管線下開挖',formula:'For instance, a city could install pillars and tracks above [地面位置] more quickly than digging beneath [地下障礙]',meaning:'寬闊大道上方設支柱，可能較在古蹟和管線下挖掘快。',links:['For instance, a city could install pillars and tracks above ', ' more quickly than digging beneath '],labels:['高架路線位置','地下工程障礙']},
 {example:'However, this solution also has financial disadvantages.',d:[3,6,14],relation:'However 從兩項好處轉入缺點',formula:'However, this solution also has [缺點種類] disadvantages',meaning:'作者轉到高架列車的成本與社區問題。',links:['However, this solution also has ', ' disadvantages.'],labels:['缺點種類']},
 {example:'The first is financial cost: although sky trains may be less expensive than subways, they still require substantial investment in stations and long-term maintenance.',d:[3,8,14],relation:'although 說相對較便宜，still 說仍需大筆資金',formula:'The first is financial cost: although [相對便宜], they still require substantial investment in [支出項目]',meaning:'即使高架列車可能便宜於地鐵，土地工程車站維修仍要大量投資。',links:['The first is financial cost: although ', ', they still require substantial investment in '],labels:['相對成本','必要開支']},
 {example:'For example, if a city spends most of its transport budget on one elevated line, it may have to postpone improvements to buses and local roads.',d:[3,8,14],relation:'if 提出預算排擠其他急需交通項目',formula:'For example, if a city spends most of its transport budget on [單一項目], it may have to postpone improvements to [其他需求]',meaning:'若大部分預算投一條線，巴士和郊區道路改善或延後。',links:['For example, if a city spends most of its transport budget on ', ', it may have to postpone improvements to '],labels:['單一大項目','被延後需求']},
 {example:'A second drawback is their impact on the neighbourhood.',d:[3,8,14],relation:'A second drawback 轉到與財政不同的城市環境代價',formula:'A second drawback is their impact on [受影響範圍]',meaning:'第二缺點是高架設施對周邊城市環境的影響。',links:['A second drawback is their impact on '],labels:['受影響範圍']},
 {example:'Large overhead structures can block sunlight, create noise, and reduce privacy for people living nearby.',d:[3,8,14],relation:'三個並列動詞列出可見城市環境後果',formula:'Large overhead structures can [後果一], [後果二], and [後果三] for nearby residents',meaning:'高架結構或遮光、產噪及影響附近居民私隱。',links:['Large overhead structures can ', ', create ', ', and reduce privacy for '],labels:['遮擋後果','噪音後果','受影響居民']},
 {example:'For instance, people living beside an elevated track may have trains passing their windows from sunrise until late at night, making the area less pleasant to live in.',d:[3,8,14],relation:'居民窗外列車例子說明長時間滋擾',formula:'For instance, [居民] may have trains passing their windows from [時段一] until [時段二], making the area less pleasant to live in',meaning:'軌道旁居民可能整天受窗外列車滋擾。',links:['For instance, ', ' may have trains passing their windows from ', ' until ', ', making the area less pleasant to live in.'],labels:['受影響居民','起始時段','終止時段']},
 {example:'In summary, sky trains offer clear benefits because they can bypass road congestion and expand public transport capacity in growing districts.',d:[3,8,9],relation:'結論重述避開擠塞與增加公共交通容量',formula:'In summary, sky trains offer clear benefits because they can bypass [道路問題] and expand [交通能力]',meaning:'高架列車可避開路面擠塞並增加運力。',links:['In summary, sky trains offer clear benefits because they can bypass ', ' and expand '],labels:['避開的問題','擴大的能力']},
 {example:'At the same time, their high cost and their potential impact on nearby homes mean that they are not a perfect solution to urban traffic problems.',d:[3,8,9],relation:'At the same time 在結論補上成本與社區代價',formula:'At the same time, their [成本] and their potential impact on [受影響者] mean that they are not a perfect solution to [問題]',meaning:'高昂成本和周邊影響使高架列車並非完美方案。',links:['At the same time, their ', ' and their potential impact on ', ' mean that they are not a perfect solution to '],labels:['成本','受影響者','仍未完全解決的問題']},
];
const usageGuides=[
 '當你要在引言指出某問題的多種實際後果，說明它為何值得討論時。',
 '當你要用 which 解釋一項新方案的位置，再用 rather than 與其他方案區分時。',
 '當你要明確預告本文會評估一項方案處理某問題的利弊時。',
 '當你要說明新設施如何增加容量，同時不爭用原有的有限空間時。',
 '當你要用 Because 解釋設計特點，再用 which 推出運作結果時。',
 '當你要用 even if 呈現極端干擾仍不妨礙某結果的例子時。',
 '當你要用 in some cases 限定比較範圍，再以 since 解釋較易建造的原因時。',
 '當你要把兩種工程方法放在同一地點比較速度與障礙時。',
 '當你要用 However 從前述好處轉到同一方案的缺點時。',
 '當你要用 although 承認相對較便宜，仍指出絕對支出很大時。',
 '當你要用 if 說明一個大型項目可能排擠其他公共需求時。',
 '當你要以 A second drawback 另起與財政不同的環境或社區代價時。',
 '當你要列出設施對附近居民的三項具體影響時。',
 '當你要以居民每天的具體經歷，說明抽象滋擾如何發生時。',
 '當你要在結論先重述方案避開問題和增加能力的兩項好處時。',
 '當你要用 At the same time 補上成本與社區代價，避免結論一面倒時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清道路分離、建造條件、預算排擠及居民滋擾。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文評估哪項紓緩城市交通擠塞的方案？',['在道路上方興建高架列車。','只在地下增加購物中心。','全面停止巴士服務。','只改變汽車外觀顏色。'],'sky trains 運行於高架軌道。'),
 {type:'multi',prompt:'範文指出哪兩項主要缺點？',detail:'選兩項，再按「確認」。',options:['土地、工程、車站與維修需要大量資金','高架結構可能遮光、產噪並影響私隱','高架列車必然與汽車佔同一條道路','地下挖掘一定比任何高架工程更快'],correct:[0,1],why:'成本與周邊居民影響是兩條缺點。'},
];
const route=[sequence('還原高架列車的利弊',[
 ['城市問題與方案','擠塞浪費時間；高架列車在路面上方運行。'],
 ['道路分離','列車不佔道路空間，也少受交通燈與路面意外影響。'],
 ['建造條件','某些地方高架工程可能比在密集區挖隧道容易。'],
 ['財政代價','土地、工程與長期維修昂貴，或排擠其他交通項目。'],
 ['居民與結論','高架結構或遮光產噪影響私隱；方案有益但不完美。'],
 ],'文章沒有說高架一定比地鐵便宜或容易；這一比較受地方條件限制。')];
const evidence=[
 quiz('高架列車為何不易受路面擠塞影響？',['列車在街道上方運行，與道路車流分開。','每班列車都會在車道上與汽車並行。','交通燈會令高架列車必然長時間停住。','它的車票顏色與路面交通不同。'],'物理分離是核心機制。'),
 quiz('原文何時說高架線可能較地下鐵路易建？',['某些地方可避免在建築密集區大規模挖隧道。','世界上任何地點都必然較易。','只要高架就完全不需工程。','地下設施愈多，挖掘就必然愈簡單。'],'in some cases 限定建造比較。'),
 quiz('大筆預算投在一條高架線，可能產生甚麼機會成本？',['巴士或郊區道路的急需改善可能延後。','其他交通項目必然自動完成。','市政府因而不再需要維修。','道路面積必然增加一倍。'],'預算集中可能排擠其他需求。'),
 quiz('附近住戶可能面對哪幾項直接影響？',['陽光減少、列車噪音及私隱受損。','只會得到更多日照而絕無噪音。','所有住戶必然失去住所。','只影響地下隧道內的乘客。'],'範文列三項可見代價。'),
 quiz('文章最後是否稱高架列車毫無價值？',['沒有；它承認避開擠塞與增運力，但指出高成本和社區影響。','有；作者否認任何人能乘搭。','有；作者說高架車必然佔用道路。','沒有；但結論稱它完美解決所有交通問題。'],'balanced conclusion：有益但非完美。'),
];
const logic=[
 sequence('兩條可能的交通好處',[
 ['路線分離','列車在道路上方，不與汽車巴士爭路。'],
 ['時間可靠','燈號、事故及繁忙擠塞較少干擾。'],
 ['建造條件','某些寬闊大道可用支柱與軌道。'],
 ['比較地下','或可避開古蹟及管線下的大規模挖掘。'],
 ],'運作可靠與建造較易是兩種不同好處。'),
 sequence('財政與居民的兩條代價',[
 ['大型支出','土地、工程、車站及維修需資金。'],
 ['預算排擠','其他巴士和郊區道路改善或被延後。'],
 ['高架結構','可能遮光、發出噪音與影響私隱。'],
 ['日常例子','軌道旁住戶可從早到晚見列車經過窗前。'],
 ],'不能把居民生活影響縮成施工費用。'),
];
const transfers=[
 transfer('高架列車與汽車分開運行，市中心路面經常塞車。','哪句解釋高架路線的時間好處？',['列車不與路面車流爭道，因此車程較少受塞車影響。','列車在同一車道上跟隨汽車，因此一定更快。','只要有高架線，所有道路都必然不再塞車。','車票較貴便能自動消除交通燈。'],['路面分離→較少受車流干擾。','機制相反。','不能保證全城無塞車。','價格與燈號無直接關係。'],[3,4],'原文 above street level→unaffected by bottlenecks。'),
 transfer('道路下方有古蹟地基與大量公用管線，上方有寬闊大道。','哪句符合有條件的建造比較？',['在這種地點，高架支柱可能比地下挖掘較快建成。','高架工程在全球每個地點都必然較快。','既有地下管線便完全不能建任何交通線。','只要大道寬闊，就完全不用計算工程成本。'],['只在具體條件下說可能較易。','in some cases 不可刪。','過度否定。','成本仍要計。'],[6,7],'原文寬闊大道與古蹟地下管線比較。'),
 transfer('城市擬把大部分交通預算投進一條高架路線。','哪句指出範文的財政機會成本？',['若資金集中於單一項目，巴士及郊區道路改善可能延後。','交通預算集中後，其他項目便無須任何資金。','高架線一旦通車，所有郊區道路必然完好。','財政成本只指車票上的字體。'],['預算有限會排擠其他急需項目。','仍需資金。','無此保證。','不相關。'],[9,10],'原文 spend most budget on one line→postpone buses/roads。'),
 transfer('高架軌道距離住宅窗戶很近，列車由清晨行到深夜。','哪句呈現居民生活影響？',['附近住戶可能長時間承受噪音，並較難保持私隱。','軌道愈近窗戶，住戶必然愈安靜。','列車運作時間與任何生活感受都無關。','所有高架軌道必然完全遮擋每戶陽光。'],['具體時段與噪音私隱風險相連。','方向相反。','原文例子說有關。','過度保證。'],[12,13],'原文住戶窗邊由早到晚有列車經過。'),
 transfer('一篇作文只說「高架車很有效」，沒有交代機制。','哪句補足原文兩個核心原因？',['它不佔路面空間，亦較少被交通燈與車流阻延。','它很有效，因為它確實很有效。','只要列車較高，票價便自動較低。','所有交通工具都必然不再使用道路。'],['說明空間分離與運作可靠。','循環論證。','無票價保證。','仍有路面交通。'],[3,4],'原文不爭道路且少受路面干擾。'),
 transfer('另一題評估建造行人天橋。','哪句真正轉移本文的分析框架？',['可比較與車流分開的安全好處、工程成本和附近住戶的日照與私隱。','因為高架列車有益，任何天橋都必然完美。','天橋建在地面上方，便一定完全沒有噪音。','只討論天橋油漆顏色便能完成評估。'],['轉移空間、成本與住戶三面向。','不可照搬結論。','需查具體影響。','不相關。'],[3,9,12],'原文公共設施需同時看運作、預算及周邊。'),
 transfer('有人說高架鐵路可能比地下線便宜，因此不需再計預算。','哪句指出推論錯誤？',['相對較便宜不等於成本很低，土地、車站及長期維修仍需資金。','只要不挖隧道，所有工程材料就免費。','較便宜便證明巴士改善不再需要。','地下線一定在任何地方完全無法興建。'],['比較成本與絕對投入不同。','仍有工程。','其他需求仍在。','過度斷言。'],[9,10],'原文 less expensive than subways 仍需 substantial investment。'),
 transfer('市政府比較高架線和地鐵，部分街道狹窄且高樓緊貼住宅。','哪句保持建造判斷的條件性？',['高架線是否更易建，仍須查道路寬度、居民影響與地下設施。','高架線在任何窄街都必然比地鐵更易建。','只要高樓多，居民私隱便不重要。','地下工程困難便能證明高架一定便宜。'],['兩方案須按當地條件比較。','in some cases 不可普遍化。','仍要看住戶。','建造難度不等於總成本。'],[6,7,12],'原文高架較易建只限某些情況。'),
 transfer('城市已有高架線，但巴士仍服務沒有車站的地區。','哪句符合文章的審慎結論？',['高架線可增加運力，仍須顧及巴士和周邊地區，不能當成唯一方案。','高架線一開，所有巴士路線必須立即停止。','既有高架線便證明城市再無任何交通問題。','巴士服務與公共交通容量完全無關。'],['有益但非完美方案。','沒有此政策要求。','仍有問題。','巴士也是公共交通。'],[10,14,15],'原文 no perfect solution 與其他交通需求。'),
 transfer('高架線能節省通勤時間，卻可能遮擋住宅陽光。','哪句同時保留兩面而不混淆？',['應分別評估乘客時間收益與住戶日照損失，再比較整體分量。','只要乘客較快，住戶便必然不受影響。','只要有遮光，列車便不可能準時。','兩種影響完全是同一種交通成本。'],['運作收益與生活代價分開權衡。','忽略住戶。','兩者可並存。','機制不同。'],[4,12,15],'原文時間可靠與周邊影響並存。'),
];
export default {key:'advantage-disadvantage:26',meta:{topic:'高架列車的運力與社區代價',summary:'範文指出高架路線不與車流爭路，部分地方可避免地下隧道工程；同時分析大量投資可能排擠其他交通項目，以及遮光、噪音和私隱對居民的影響。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
