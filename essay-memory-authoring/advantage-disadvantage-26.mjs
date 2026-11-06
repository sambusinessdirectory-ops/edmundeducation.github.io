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
 {example:'One major advantage of sky trains is that they can carry many riders without competing with cars or buses for limited road space.',d:[2,8,9],relation:'without 說明增加載客而不佔用路面',formula:'One major advantage of [方案] is that they can [新增能力] without competing with [現有使用者] for limited road space',meaning:'高架列車載客量大，又不與車輛爭有限路面。',links:['One major advantage of ', ' is that they can ', ' without competing with ', ' for limited road space.'],labels:['方案','新增運力','路面其他使用者']},
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
 transfer('高架列車與汽車分開運行，市中心路面經常塞車。','哪句解釋高架路線的時間好處？',["列車與路面車流分開行駛，通勤較少受塞車和燈號拖延", "列車與汽車共用車道，仍可藉增加車次完全避免塞車", "高架路線可節省時間，因所有道路擁堵會隨即消失", "列車行在高處主要改善景觀，與路面交通阻延無關"],["分流才是較穩定車程的機制。", "共用車道沒有解決路面阻塞。", "高架線不會消除所有道路擁堵。", "忽略與車流分開的作用。"],[3,4],'原文 above street level→unaffected by bottlenecks。'),
 transfer('道路下方有古蹟地基與大量公用管線，上方有寬闊大道。','哪句符合有條件的建造比較？',["地下古蹟與管線密集時，寬闊大道或讓高架工程較易進行", "大道較寬便足以證明所有高架工程都比地下線便宜", "地下設施較多時，城市應完全放棄任何公共交通工程", "只要有古蹟地基，高架支柱就不需要考慮土地和安全"],["建造比較依賴當地地下和地面條件。", "寬度不能單獨決定整體成本。", "困難不等於所有工程不可行。", "仍須評估其他限制。"],[6,7],'原文寬闊大道與古蹟地下管線比較。'),
 transfer('城市擬把大部分交通預算投進一條高架路線。','哪句指出範文的財政機會成本？',["大量資金投入單一高架項目，巴士和郊區道路或被迫延後", "高架工程預算增加後，巴士及郊區道路會自動同步改善", "預算集中可提高列車運力，故完全不用比較其他交通需求", "只要新路線通車，其他項目延後便不會形成任何代價"],["指出單一大型投資的機會成本。", "同一預算不能保證其他項目改善。", "運力收益不取消資源取捨。", "延後仍可能影響其他居民。"],[9,10],'原文 spend most budget on one line→postpone buses/roads。'),
 transfer('高架軌道距離住宅窗戶很近，列車由清晨行到深夜。','哪句呈現居民生活影響？',["住宅旁列車長時間運作，住戶或承受噪音及私隱受損", "列車距離住宅愈近，住戶必然能享有更寧靜的環境", "高架軌道雖近窗戶，居民生活只會受車票價格影響", "噪音或影響住戶，但軌道高度與私人空間完全無關"],["把距離與營運時間連到居民生活代價。", "與噪音風險相反。", "忽略住處旁的運作影響。", "漏掉私隱問題。"],[12,13],'原文住戶窗邊由早到晚有列車經過。'),
 transfer('一篇作文只說「高架車很有效」，沒有交代機制。','哪句補足原文兩個核心原因？',["列車不佔路面車道，亦較少受燈號與塞車拖延", "高架車程較快，主要因車票價格比地面交通更高", "列車行在高處可節省時間，因道路車流會即時減少", "高架列車運作有效，因車站可以完全不用與道路連接"],["補出分流與避開燈號兩個原因。", "票價不是車程機制。", "高架本身不使道路即時疏通。", "車站仍須讓乘客到達。"],[3,4],'原文不爭道路且少受路面干擾。'),
 transfer('另一題評估建造行人天橋。','哪句真正轉移本文的分析框架？',["比較與車流分開的安全收益，也查工程成本與住戶影響", "天橋與車流分開，故工程費及附近居民日照不必評估", "天橋位於道路上方，所以所有行人都不再需要過馬路", "只把高架鐵路的正面結論搬來，不檢查天橋的實際條件"],["轉移分流好處及成本、居民影響的分析維度。", "分流不取消其他代價。", "仍可能有其他過路情況。", "新題仍須查具體條件。"],[3,9,12],'原文公共設施需同時看運作、預算及周邊。'),
 transfer('有人說高架鐵路可能比地下線便宜，因此不需再計預算。','哪句指出推論錯誤？',["相對地下線較便宜不等於低成本，土地車站維修仍要資金", "高架工程若不挖隧道，土地和車站便不會產生開支", "高架線可較便宜，所以巴士及郊區道路不再需要改善", "初期建造或較快，便代表日後維修費可以完全忽略"],["區分相對成本與仍有的大額支出。", "忽略建站與用地。", "低一項成本不取消其他交通需求。", "初期速度不決定維修費。"],[9,10],'原文 less expensive than subways 仍需 substantial investment。'),
 transfer('市政府比較高架線和地鐵，部分街道狹窄且高樓緊貼住宅。','哪句保持建造判斷的條件性？',["須按道路寬度、住宅距離與地下設施判斷哪種路線更易建", "窄街高樓旁建高架線一定更簡單，毋須查居民影響", "地下設施較複雜便表示高架方案在任何地方都較便宜", "只要地面有高樓，地鐵工程便必然完全不能正常進行"],["地點條件共同決定建造比較。", "忽略窄街與住戶限制。", "複雜不等於普遍較便宜。", "高樓不必然排除地鐵。"],[6,7,12],'原文高架較易建只限某些情況。'),
 transfer('城市已有高架線，但巴士仍服務沒有車站的地區。','哪句符合文章的審慎結論？',["高架線可增加運力，仍須兼顧巴士與未設車站地區", "高架線既可增加運力，巴士便應立即撤出所有地區", "有了高架線便代表沒有車站的地區也已獲得同等服務", "巴士仍服務周邊居民，故高架鐵路不可能改善任何運力"],["承認運力好處，仍保留其他地區的服務需求。", "忽略巴士覆蓋。", "車站分布限制可及性。", "有巴士不否定高架收益。"],[10,14,15],'原文 no perfect solution 與其他交通需求。'),
 transfer('高架線能節省通勤時間，卻可能遮擋住宅陽光。','哪句同時保留兩面而不混淆？',["分開評估通勤省時與住戶日照損失，再比較整體影響", "乘客通勤較快時，附近住戶的採光便毋須再列入評估", "住宅可能失去日照，已足以證明列車不可能節省時間", "把通勤時間與住宅採光視為同一項收益，毋須分別比較"],["兩項效果可同時存在，須分別衡量。", "效率收益不能取消住戶代價。", "採光風險不否定車程收益。", "混淆不同受影響群體。"],[4,12,15],'原文時間可靠與周邊影響並存。'),
];
const revised=[
 {wrong:['列車與汽車分開行駛，路面擠塞便會逐漸消失','高架列車可節省時間，主要因路面燈號也會減少','列車行在高處改善景觀，省時作用應較輕微'],why:['高架可避塞車，不會令道路擠塞消失。','省時來自列車不受路面燈號阻延。','景觀不是範文的主要時間機制。']},
 {wrong:['大道較寬時，高架工程成本便較可能低於地鐵','地下管線密集，城市可先擱置公共交通擴建','有古蹟地基，高架支柱的土地需求應較小'],why:['道路寬度不能單獨決定總成本。','地下困難可促使比較高架方案。','高架仍須考慮支柱用地與安全。']},
 {wrong:['高架預算增加，巴士及郊區道路也會隨之改善','預算集中提高列車運力，其他交通需求可稍後處理','新線通車後，其他項目延後的影響便會減輕'],why:['預算集中可能擠走其他項目。','巴士和道路仍服務不同地區。','項目延後仍可能帶來機會成本。']},
 {wrong:['列車靠近住宅，住戶或因交通便利而少受噪音影響','軌道雖近窗戶，居民生活主要仍受票價影響','噪音可影響住戶，軌道高度與私隱損失較無關'],why:['便利不會直接減少列車噪音。','範文關注噪音與私隱。','近窗高架線也可能影響私隱。']},
 {wrong:['高架車較快，主要因車票價格比地面交通高','列車行在高處省時，因路面車流會即時下降','高架列車有效，因車站可減少與道路接駁'],why:['票價與行車阻延不是同一機制。','高架避開塞車，不令道路流量立即下降。','車站接駁不是核心省時原因。']},
 {wrong:['天橋與車流分開，附近居民採光可放到後面','天橋高於車道，便可推論行人過路需求下降','沿用高架鐵路的結論，就可判斷天橋的價值'],why:['工程及居民影響仍須評估。','天橋也供行人過路，不會消除需求。','新題要查具體安全與成本條件。']},
 {wrong:['高架不用挖隧道，土地與車站開支應較低','高架線相對便宜，巴士改善可因此減少預算','初期建造較快，日後維修費便較易控制'],why:['相對便宜不代表沒有龐大支出。','其他交通需求不能因一線省錢而忽略。','施工時間不能直接推斷維修成本。']},
 {wrong:['窄街高樓旁的高架線應較易避免居民影響','地下設施較複雜，高架方案便在各區都較便宜','地面高樓較密集，便可直接推定地鐵較難建'],why:['住宅距離和街道寬度正須核對。','地下條件不能代表所有地區成本。','高樓密集不必然排除地鐵。']},
 {wrong:['高架線增加運力，巴士可逐步撤出沒有車站的地區','有高架線後，未設車站地區應能同樣便利地乘車','巴士仍服務周邊居民，高架線的運力收益便較小'],why:['未設車站地區可能更需要巴士。','高架線不自動覆蓋所有地區。','巴士與高架可互補，收益未必小。']},
 {wrong:['通勤較快時，住戶採光損失可列為次要代價','住宅失去日照，列車省時的證據便較難成立','把省時與採光合成一項生活品質收益比較'],why:['通勤收益不取消日照代價。','兩種影響可同時存在。','省時與採光應先分開衡量。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[7].explanations[3]='單憑地面樓宇密度，不能直接判斷地鐵施工難度。';
transfers[0].options[0]='列車避開路面車流，通勤較少受塞車與燈號拖延';
transfers[1].options[0]='地下管線密集時，寬闊大道或較易建高架線';
transfers[2].options[0]='資金集中投高架線，巴士和郊區道路可能延後';
transfers[3].options[0]='列車久經住宅旁，住戶或受噪音和私隱影響';
transfers[5].options[0]='比較與車流分開的安全收益，也查工程和住戶影響';
transfers[6].options[0]='相對便宜仍有土地、車站與維修成本';
transfers[7].options[0]='須查街道、住宅與地下設施，才判哪種路線較易建';
transfers[9].options[0]='分開評估通勤省時與住宅日照損失，再比較影響';
export default {key:'advantage-disadvantage:26',meta:{topic:'高架列車的運力與社區代價',summary:'範文指出高架路線不與車流爭路，部分地方可避免地下隧道工程；同時分析大量投資可能排擠其他交通項目，以及遮光、噪音和私隱對居民的影響。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
