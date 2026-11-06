// Car-free day: short visible effect versus continuous transport policy.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:41'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Dirty air is now a very serious problem in many cities, and many people see cars and other road travel as a main cause.',
 'A world day without cars can help people notice the problem and make the air better for a short time, but I think stronger rules that last are much better.',
 'First, people who support a day without cars say it can quickly cut air pollution in ways people can see.',
 'If people do not drive their own cars for even one day, there is less smoke from cars and city centres may be cleaner, quieter and nicer.',
 'More important, the event can remind people that how they travel each day affects the environment.',
 'For example, if people going to work walk, ride bikes or take buses for a day, some may learn that they do not always need to drive.',
 'So a day without cars is more than a show: it may help people start cleaner ways of travelling.',
 'But I think one day is too little to solve a problem that happens every day.',
 'Dirty air comes from many journeys made again and again, not just one day of cars, so the answer must keep working all the time.',
 'Governments should make buses and trains better, build more bike paths and make cars that give off much pollution cost more to use.',
 'These steps change what people do over many years because they make clean travel easier and dirty travel less appealing.',
 'For example, if buses and trains are cheap, arrive when expected and serve many places, workers may leave their cars at home many days each week, not just once a year.',
 'That is how real progress for the environment happens.',
 'To sum up, a world day without cars may help wake people up because it shows what a cleaner city feels like.',
 'Still, I strongly think lasting cuts in dirty air need rules that change how people travel each day.',
];
const vocabulary=[
 v(['Air pollution','Dirty air','空氣污染'],['pressing','very serious','迫切'],['urban areas','cities','城市地區'],['road transport','cars and other road travel','道路交通'],['major cause','main cause','主要原因']),
 v(['international car-free day','world day without cars','國際無車日'],['raise public awareness','help people notice the problem','提升意識'],['temporarily','for a short time','暫時'],['stricter, permanent transport policies','stronger rules that last','更嚴格長期政策'],['far more effective','much better','更有效']),
 v(['On the one hand','First','一方面'],['supporters','people who support','支持者'],['immediate','quickly','立即'],['visible reduction','cut air pollution in ways people can see','可見減少']),
 v(['private vehicles','own cars','私人車輛'],['kept off the road','do not drive','不上路'],['single day','one day','單日'],['exhaust fumes','smoke from cars','汽車廢氣'],['more pleasant','nicer','更舒適']),
 v(['More importantly','More important','更重要'],['public reminder','remind people','公眾提醒'],['everyday travel choices','how they travel each day','日常出行選擇'],['environmental consequences','affects the environment','環境後果']),
 v(['commuters','people going to work','通勤者'],['encouraged','if','被鼓勵'],['cycle','ride bikes','騎單車'],['realise','learn','意識到'],['not always necessary','do not always need','並非總必要']),
 v(['In this sense','So','從此意義'],['not merely a symbolic gesture','more than a show','非純象徵'],['plant the seed','help people start','開始形成'],['cleaner habits','cleaner ways of travelling','更清潔習慣']),
 v(['However','But','然而'],['too limited','too little','太有限'],['deal with','solve','應對'],['occurs every day','happens every day','每天發生']),
 v(['millions of repeated journeys','many journeys made again and again','反覆累積旅程'],['solution','answer','方案'],['continuous','keep working all the time','持續']),
 v(['improve public transport','make buses and trains better','改善公交'],['expand cycling lanes','build more bike paths','擴單車徑'],['high-emission vehicles','cars that give off much pollution','高排放車輛'],['more expensive to use','cost more to use','提高使用成本']),
 v(['These measures','These steps','這些措施'],['long-term behaviour','what people do over many years','長期行為'],['cleaner options','clean travel','較清潔選擇'],['dirtier choices','dirty travel','污染選擇'],['less attractive','less appealing','較不吸引']),
 v(['affordable','cheap','負擔得起'],['reliable','arrive when expected','可靠'],['widely available','serve many places','覆蓋廣'],['throughout the week','many days each week','整個星期']),
 v(['real environmental progress','real progress for the environment','真正環境進步'],['is made','happens','發生']),
 v(['In conclusion','To sum up','總結'],['wake-up call','wake people up','警醒'],['since','because','因為'],['cleaner city','cleaner city','更清潔城市']),
 v(['Nevertheless','Still','儘管如此'],['lasting reductions','lasting cuts','持續減少'],['permanent policies','rules','長期政策'],['reshape daily transport habits','change how people travel each day','改變日常交通習慣']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));return {formula:s.formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'Air pollution',replacement:'Traffic congestion',slot:'迫切的城市問題',formula:'[問題] has become pressing in cities, and [成因] is often seen as a major cause',meaning:'城市空污迫切，道路交通是主要原因。',usage:'當引言要交代城市問題及常見成因時。',relation:'and 把問題與原因並列',d:[1,7,13]},
 {target:'an international car-free day',replacement:'a weekly open-streets event',slot:'短期倡議',formula:'While [短期倡議] can raise awareness, I believe [持續政策] is more effective',meaning:'無車日可提醒公眾，但永久政策更有效。',usage:'當你要承認短期活動的好處，再比較長期政策時。',relation:'While 讓步後以有效性取捨',d:[2,7,14]},
 {target:'a global car-free day',replacement:'a weekly cycle-to-work day',slot:'一方支持的活動',formula:'On the one hand, supporters argue [活動] can produce an immediate visible effect',meaning:'支持者指無車日可即時減少可見污染。',usage:'當你要公平呈現短期措施的即時效益時。',relation:'On the one hand 概述支持者論點',d:[7,8,14]},
 {target:'private vehicles',replacement:'large delivery trucks',slot:'暫時不上路的交通工具',formula:'If [車輛] are kept off the road for even a day, [排放] fall',meaning:'私人車輛停駛一天可減廢氣。',usage:'當你要用 If 說明暫時措施能立即改變甚麼時。',relation:'If 加 even a single day 強調即時效果',d:[7,8,14]},
 {target:'such an event',replacement:'a city-wide walking day',slot:'提醒公眾的活動',formula:'More importantly, [活動] can remind people that daily choices have consequences',meaning:'活動提醒日常出行也有環境影響。',usage:'當你從直接成效轉向更重要的教育提醒作用時。',relation:'More importantly 提升心理提醒價值',d:[3,7,14]},
 {target:'commuters',replacement:'local students',slot:'試用替代交通的人',formula:'For example, when [人群] are encouraged to [替代方式], some may realise [舊習慣非必要]',meaning:'試步行單車公交可發現不必總駕車。',usage:'當你要用試做一天的例子展示習慣可以轉變時。',relation:'when 指活動引發認知變化',d:[3,7,14]},
 {target:'a car-free day',replacement:'a weekly walking challenge',slot:'超越象徵的活動',formula:'In this sense, [活動] is not merely symbolic; it can plant the seed of [新習慣]',meaning:'無車日可啟發更清潔的習慣。',usage:'當短期活動有可能引出長期習慣時。',relation:'not merely ...; ... 區分象徵與習慣萌芽',d:[3,7,14]},
 {target:'this approach',replacement:'the annual campaign',slot:'作者認為不足的短期方法',formula:'However, [短期方法] is too limited to deal with [每天出現的問題]',meaning:'一年一天無法應付天天出現的空污。',usage:'當你要指出措施的頻率與問題的頻率不相稱時。',relation:'However 轉長期政策必要性',d:[3,8,14]},
 {target:'one day of traffic',replacement:'a single weekend of driving',slot:'不足以解釋累積問題的短時間',formula:'[問題] is not caused by [單次] but by [反覆行為], so [方案] must be continuous',meaning:'反覆出行累積污染，故方案必須持續。',usage:'當你要以成因的持續性推導方案也需持續時。',relation:'not ... but ... so ... 連成因和方案',d:[3,7,14]},
 {target:'public transport',replacement:'regional bus services',slot:'改善的公共交通服務',formula:'Governments should improve [公共選項], expand [替代設施], and price [污染選項]',meaning:'改善公交單車徑，增加高排放車使用成本。',usage:'當你要列出促進替代選擇的幾項可執行政策時。',relation:'三個並列動詞組成政策組合',d:[3,7,14]},
 {target:'These measures',replacement:'These changes',slot:'前句所提的長期政策',formula:'[政策] change long-term behaviour because they make [好選擇] easier and [壞選擇] less attractive',meaning:'政策用便利與價格改變長期出行。',usage:'當你要解釋政策如何改變日常選擇，而非只宣稱有效時。',relation:'because 解釋長期行為機制',d:[3,7,14]},
 {target:'affordable, reliable and widely available',replacement:'frequent, clean and widely available',slot:'讓人願意轉用公交的服務條件',formula:'If [公交條件], many workers will [週中持續改變] rather than [年度一次]',meaning:'公交便宜可靠且覆蓋廣，通勤者可整週少開車。',usage:'當你要用服務條件說明行為如何頻繁而非偶爾改變時。',relation:'If 加 not once a year but throughout the week 比較頻率',d:[3,7,14]},
 {target:'real environmental progress',replacement:'lasting improvement',slot:'可持續的環境結果',formula:'This is where [持續結果] is made',meaning:'持續行為改變才有真正環境進步。',usage:'當你已說出機制，要用短句標示真正有效的環節時。',relation:'This 承接持續通勤改變',d:[3,7,14]},
 {target:'an international car-free day',replacement:'an annual cycling campaign',slot:'結論先承認的提醒活動',formula:'In conclusion, [短期活動] may be useful as a wake-up call, since [展示可能性]',meaning:'無車日可讓人感受清潔城市。',usage:'當結論先承認短期活動的教育提醒作用時。',relation:'since 解釋警醒功能',d:[3,7,14]},
 {target:'lasting reductions in air pollution',replacement:'lasting cuts in road congestion',slot:'需要長期政策的目標',formula:'Nevertheless, [持續改善] depend on permanent policies that reshape [日常習慣]',meaning:'持續減污依靠改變每日交通的政策。',usage:'當結論要由短期提醒轉回真正長久的政策條件時。',relation:'depend on 指持續成果的必要條件',d:[3,7,13]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'區分一天可見成效與每日持續改變。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者比較無車日與長期交通政策後支持哪方？',['無車日可作提醒，長期公交與排放政策更有效。','無車日一年一次，已足以永久消除全部污染。','只要禁一天私人車，公交通勤就不再需要改善。','任何一天的步行體驗都不可能改變人的想法。'],'短期提醒有價值，但持續減污需日常行為改變。'),{type:'multi',prompt:'作者列哪些長期措施？',detail:'選兩項，再按「確認」。',options:['改善公共交通並擴展單車徑。','提高高排放車輛的使用成本。','每年只舉辦一次全市活動。','永久停止所有巴士和火車。'],correct:[0,1],why:'政策同時改善清潔選項並降低高排放吸引力。'}];
const route=[sequence('還原四段論證',[['引言','空污與道路交通；承認無車日但選長期政策。'],['無車日','即時減排且提醒日常出行選擇。'],['長期政策','污染來自反覆旅程，改善公交單車徑與高排放定價。'],['結論','活動可警醒，持續減污依靠每日習慣重塑。']],'論證由問題發生頻率推導方案所需頻率。')];
const evidence=[quiz('無車日的即時成效是甚麼？',['私人車少一天可減廢氣，市中心較清靜。','一年一天可保證全年完全沒有空氣污染。','開車一天可令市中心永久變得更安靜。','活動不會改變任何人對出行的認識。'],'即時成效不可誇大為全年效果。'),quiz('無車日有何提醒作用？',['嘗試步行單車公交可發現開車非總必要。','只要試一次公交，所有人便永遠不再開車。','活動必須永久關閉所有城市道路。','只有私人車才能讓通勤者認識空污。'],'體驗可播下新習慣的種子。'),quiz('為何長期方案較有效？',['污染來自反覆旅程，政策需持續改變選擇。','污染只來自每年無車日的那一天。','改進公交不可能影響任何通勤決定。','只有象徵活動才可以改變高排放價格。'],'成因是持續累積。'),quiz('廉價可靠公交如何發揮作用？',['讓上班族整週留車在家，而非一年只一次。','讓所有私人車立刻永久從城市消失。','使巴士和火車只在活動當天提供服務。','令通勤者不再需要任何穩定交通工具。'],'服務條件促進日常重複使用。')];
const logic=[sequence('無車日的兩種收益',[['一天減排','私人車暫不上路，廢氣減少。'],['可見城市','街道較清潔安靜舒適。'],['體驗','通勤者試步行單車和公交。'],['可能延續','有人發現駕車非總必要。']],'活動是提醒，不是全年減污證明。'),sequence('長期政策的因果',[['累積成因','每日大量旅程造成空污。'],['政策工具','改善公交、單車徑與高排放定價。'],['選擇機制','清潔選擇較容易，污染選擇較不吸引。'],['持續結果','更多人整週而非一年一天少駕車。']],'政策頻率要匹配問題頻率。')];
const transfers=[
 transfer('某市每年辦一天停車活動，其他日子照舊。','哪句指出措施限制？',['污染由每天旅程累積，一年一天不足以持續減排。','只要有一天少車，全年污染便必然全部消失。','每天的車流與空氣質素完全沒有任何因果關係。','一年一次的活動能直接取代所有公交投資。'],['頻率不匹配。','過度。','不實。','不可取代。'],[7,8],'daily problem needs continuous policy。'),
 transfer('通勤者試了一天巴士，發現不必每次開車。','哪句解釋活動價值？',['短期體驗可提醒人檢視習慣，成為改變起點。','只試巴士一次便保證所有人永久不再開車。','巴士只要可用一天，便不用再改善任何服務。','活動一旦結束，通勤者便不可能記得其體驗。'],['提醒可能播下新習慣。','無保證。','仍需服務。','可記得。'],[5,6],'plant seed of cleaner habits。'),
 transfer('公交常延誤且站點太少，政府想減少駕車。','哪句提出對準問題的政策？',['提高巴士可靠程度及覆蓋，才更易轉用公交。','只要求司機一年一天不開車，不改善公交服務。','讓公交車費更高且班次更少，仍要求全面轉乘。','不問巴士是否到站，只在街上張貼環保標語。'],['提升清潔選項可行性。','短期不足。','反效果。','不足。'],[9,11],'affordable reliable available。'),
 transfer('城市想讓高污染車少用。','哪句符合本文政策組合？',['提高高排放車使用成本，同時改善較清潔選項。','讓高排放車免費使用，卻要求污染立即下降。','只增加車道而完全不改公交與單車通行條件。','每年只測試一天，便聲稱所有車主已轉乘。'],['價格與替代便利並用。','相反。','替代不足。','過度。'],[9,10],'make dirty choices less attractive。'),
 transfer('作文說無車日「毫無用處」。','哪句更公平？',['它可減一天污染並提醒大眾，仍須有長期政策。','只要有提醒作用，全年空污就必然完全消失。','短期活動既非永久政策，就一定不能教人任何事。','它若能減一天排放，就不用再改善公共交通。'],['承認短期收益及限制。','過度。','可教人。','仍需政策。'],[3,4,6,7],'limited but useful awareness。'),
 transfer('有人說「路上車少一天，所以空污根治」。','哪句指出跳躍推論？',['一天減排可見，卻未處理每天反覆出行的來源。','一天減排即等於每年每個工作日的交通都改變。','道路交通從來不是任何城市空氣污染的成因。','無車日結束後，私人車自然會永久禁止上路。'],['需分辨一次與持續。','不等於。','原文相反。','不自動。'],[3,8],'one day vs repeated journeys。'),
 transfer('另一題問一次性節能日與全年節能政策。','哪句可轉用本文邏輯？',['一天活動可提醒，長期用能改變仍需持續措施。','只要辦一天節能日，全年能源使用必然下降。','如果有全年政策，就不可以再辦任何教育活動。','一次性與長期方案不需按問題頻率作任何比較。'],['短期提醒與持續政策分工。','無保證。','可並存。','需比較。'],[6,8,14],'temporary awareness, lasting policy。'),
 transfer('政府同時修單車徑並提高高排放車費。','哪句說明行為改變機制？',['清潔出行更方便，污染選項較不吸引。','單車徑增多就保證每人都立刻出售汽車。','高排放車費提高便等同改善所有巴士班次。','路徑和價格完全不會影響任何出行選擇。'],['便利和價格共同作用。','不保證。','非同一措施。','有影響。'],[9,10],'clean easier, dirty less attractive。'),
 transfer('一項城市活動結束後想評估長期成功。','哪項指標最貼近本文？',['看通勤者每週轉乘的頻率，而非只看活動日。','只數活動當天的海報張數，不再看任何出行。','只問單日天空是否明亮，毋須看全年使用習慣。','只統計主持人的發言長度，當作日常減排量。'],['行為是否持續是關鍵。','不代表。','要看習慣。','無關。'],[11,12,14],'throughout week not once year。'),
 transfer('結論要兼顧活動價值及真正減污。','哪句最完整？',['無車日可作警醒，持續減污仍靠改變每日交通的政策。','無車日只要有警醒作用，永久交通政策便全部無需。','長期政策若有效，任何短期活動便不可能再有作用。','只有車輛停駛一天，城市才可能開始考慮空污問題。'],['兩方作用分清。','仍需政策。','可並存。','不只一天。'],[13,14],'wake-up call vs lasting reduction。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["污染由每天旅程累積，一年一天不足以持續減排。","一年一天可減排，污染主因則留待下一次活動處理。","活動日車流下降，便能代表平日通勤習慣已改變。","一天少車有示範作用，所以公交投資可暫時延後。"],["短期體驗可提醒人檢視習慣，成為改變起點。","一天巴士體驗有用，但習慣改變只取決於車費。","試乘可減當日車流，日後是否轉乘不需再觀察。","通勤者發現新選擇，仍應維持原有每次駕車習慣。"],["提高巴士可靠程度及覆蓋，才更易轉用公交。","可先宣傳公交好處，延誤與站點問題則以後再處理。","可降低車費，但班次與站點覆蓋仍維持現狀。","可辦更多試乘日，卻未改善通勤者每天的可靠服務。"],["提高高排放車使用成本，同時改善較清潔選項。","提高高排放車費，公交服務可暫時不作改善。","改善單車徑，仍讓污染車維持較低使用成本。","增加車道可縮短車程，但高排放問題留待日後。"],["它可減一天污染並提醒大眾，仍須有長期政策。","它能減一天排放，因此全年減污可交活動持續推動。","短期活動可提醒市民，但政策重點只需宣傳海報。","一天少車有用，公交改善則可等下次活動再考慮。"],["一天減排可見，卻未處理每天反覆出行的來源。","一天污染下降可作證據，平日車流則不用另行測量。","活動促使市民試乘，但根治與否只看單日天氣。","無車日可讓人反省，污染來源則交由個別車主處理。"],["一天活動可提醒，長期用能改變仍需持續措施。","一天活動可提醒，全年節能則主要靠增加宣傳次數。","長期政策可改善用能，教育活動則需暫時取消。","一次活動和全年措施都有用，因此不用比較作用時間。"],["清潔出行更方便，污染選項因加費而較不吸引。","單車徑讓人更願騎車，高排放車費則可維持原價。","車費上升能減少污染，清潔替代選項則留待日後。","兩項措施可改變選擇，但只會影響活動當天交通。"],["看通勤者每週轉乘的頻率，而非只看活動日。","可看活動日的乘客數，推定日常轉乘已形成。","可統計市民是否記得口號，當作通勤習慣變化。","可比較一天空氣讀數，卻略過每週出行頻率。"],["無車日可作警醒，持續減污仍靠改變每日交通的政策。","無車日可作警醒，因此減污主要靠年度宣傳活動。","每日交通政策有用，短期活動則應逐步停止辦理。","兩者都有作用，但結論不交代哪項能持續減排。"]];
const editorialTransferReasons=[["污染由每天出行累積，不能等年度活動。","單日車流不能代表平日習慣。","示範作用不能替代持續公交投資。"],["車費並非改變習慣的唯一因素。","日後轉乘要看持續選擇。","試乘正可讓人重新檢視駕車習慣。"],["不解決延誤站點，宣傳難令每天轉乘可行。","費用下降也不能補回不足的覆蓋。","試乘日不能代替可靠的平日服務。"],["價格措施須與清潔選項配合。","清潔選項有了，仍未降低污染車吸引力。","加車道不能直接處理高排放。"],["單日減排仍需長期政策承接。","提醒作用不等於只要海報。","公交改善不應只在年度活動前考慮。"],["要看每天反覆出行的來源。","天氣讀數不能證明交通問題根治。","個人反省仍需持續城市政策支持。"],["宣傳次數不能代替長期用能改變。","長期政策與教育活動可並行。","時間尺度正是這類題的比較重點。"],["只改善路徑，未處理高排放車的價格誘因。","只加費用，替代交通仍不方便。","政策作用不局限於活動當天。"],["單日客流無法證明每週持續轉乘。","記口號與實際出行不同。","長期成功須看反覆通勤行為。"],["年度活動不足以持續減排。","短期警醒仍有輔助價值。","結論要分清警醒與持續政策的作用。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[7].frame.parts=[["However, ","link","句型固定部分"],["I believe this approach","slot","短期方法"],[" is too limited to deal with ","link","句型固定部分"],["a problem that occurs every day.","slot","每天出現的問題"]];
structures[13].frame.parts=[["In conclusion, ","link","句型固定部分"],["an international car-free day","slot","短期活動"],[" may be useful as a wake-up call, since ","link","句型固定部分"],["it shows people what a cleaner city could feel like.","slot","展示可能性"]];
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["While ","link","句型固定部分"],["an international car-free day","slot","短期倡議"],[" can raise ","link","句型固定部分"],["public awareness and temporarily improve air quality","slot","有限好處"],[", I believe that ","link","句型固定部分"],["stricter, permanent transport policies","slot","持續政策"],[" are far more effective.","link","句型固定部分"]];
structures[1].frame.formula="While [短期倡議] can raise [有限好處], I believe that [持續政策] are far more effective.";
structures[3].frame.parts=[["If ","link","句型固定部分"],["private vehicles","slot","被限制的車輛"],[" are kept off the road for even a single day, ","link","句型固定部分"],["fewer exhaust fumes are released","slot","減排結果"],[", and ","link","句型固定部分"],["city centres may become cleaner, quieter and more pleasant","slot","公共空間的可能改善"],[".","link","句型固定部分"]];
structures[3].frame.formula="If [被限制的車輛] are kept off the road for even a single day, [減排結果], and [公共空間的可能改善].";
structures[8].frame.parts=[["Air pollution","slot","待解決問題"],[" is not caused by ","link","句型固定部分"],["one day of traffic","slot","單次情況"],[" but by ","link","句型固定部分"],["millions of repeated journeys","slot","反覆發生的原因"],[", so ","link","句型固定部分"],["the solution","slot","相應方案"],[" must also be continuous.","link","句型固定部分"]];
structures[8].frame.formula="[待解決問題] is not caused by [單次情況] but by [反覆發生的原因], so [相應方案] must also be continuous.";
structures[10].frame.parts=[["These measures","slot","措施"],[" directly change ","link","句型固定部分"],["people’s long-term behaviour","slot","長期行為"],[" because they make ","link","句型固定部分"],["cleaner options","slot","較佳選擇"],[" easier and ","link","句型固定部分"],["dirtier choices","slot","較差選擇"],[" less attractive.","link","句型固定部分"]];
structures[10].frame.formula="[措施] directly change [長期行為] because they make [較佳選擇] easier and [較差選擇] less attractive.";
structures[11].frame.parts=[["For instance, if ","link","句型固定部分"],["buses and trains are affordable, reliable and widely available","slot","替代交通具備的條件"],[", ","link","句型固定部分"],["many workers","slot","受影響的人"],[" will naturally ","link","句型固定部分"],["leave their cars at home","slot","持續改變的行動"],[", not once a year but ","link","句型固定部分"],["throughout the week","slot","持續的時間"],[".","link","句型固定部分"]];
structures[11].frame.formula="For instance, if [替代交通具備的條件], [受影響的人] will naturally [持續改變的行動], not once a year but [持續的時間].";
structures[0].frame.parts=[["Air pollution","slot","迫切的環境問題"],[" has become one of the most pressing environmental problems in many urban areas, and ","link","句型固定部分"],["road transport","slot","被視為主要成因的活動"],[" is often seen as a major cause.","link","句型固定部分"]];
structures[0].frame.formula="[迫切的環境問題] has become one of the most pressing environmental problems in many urban areas, and [被視為主要成因的活動] is often seen as a major cause.";
structures[6].frame.parts=[["In this sense, ","link","句型固定部分"],["a car-free day","slot","短期活動"],[" is not merely a symbolic gesture; it can plant the seed of ","link","句型固定部分"],["cleaner habits","slot","可能開始形成的習慣"],[".","link","句型固定部分"]];
structures[6].frame.formula="In this sense, [短期活動] is not merely a symbolic gesture; it can plant the seed of [可能開始形成的習慣].";
structures[9].frame.parts=[["Governments should improve ","link","句型固定部分"],["public transport","slot","需要改善的公共選項"],[", expand ","link","句型固定部分"],["cycling lanes","slot","需要擴充的替代設施"],[", and make ","link","句型固定部分"],["high-emission vehicles","slot","應增加使用成本的車輛"],[" more expensive to use.","link","句型固定部分"]];
structures[9].frame.formula="Governments should improve [需要改善的公共選項], expand [需要擴充的替代設施], and make [應增加使用成本的車輛] more expensive to use.";
// Source-aligned remaining frames.
structures[5].frame.parts=[["For example, when ","link","句型固定部分"],["commuters","slot","人群"],[" are encouraged to ","link","句型固定部分"],["walk, cycle or use buses for a day","slot","替代方式"],[", some may realise ","link","句型固定部分"],["that driving is not always necessary.","slot","舊習慣非必要"]];
structures[14].frame.parts=[["Nevertheless, ","link","句型固定部分"],["I strongly believe that lasting reductions in air pollution","slot","持續改善"],[" depend on permanent policies that reshape ","link","句型固定部分"],["daily transport habits.","slot","日常習慣"]];
export default {key:'discuss-both-views:41',meta:{topic:'國際無車日與長期減少城市空污',summary:'承認無車日可即時減廢氣並提醒出行習慣，但污染來自每日反覆旅程，因此以公交、單車徑及高排放定價持續改變選擇。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
