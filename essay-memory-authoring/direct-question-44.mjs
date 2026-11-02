// Vehicle tax and traffic congestion: price signal, transport quality, road management.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:44'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Too much traffic is now one of the hardest problems for modern cities to solve.',
 'One suggested answer is to make people pay more tax on their own cars.',
 'This could take pressure off roads by changing how people travel to work, but cities also need other ways of travelling that people can trust.',
 'This essay explains how this tax may work and gives two more ways to reduce traffic.',
 'A higher tax might mean less traffic because it makes owning a car and using it less appealing.',
 'If the money paid to register, keep a yearly permit for or own a car goes up, many people will ask whether they really need to drive every time.',
 'For example, someone who drives only a short way to work out of habit might take a train or bus when keeping a car becomes too expensive to seem sensible.',
 'If thousands of people in the same city make this choice, there will be fewer cars on its roads.',
 'Also, tax money could make buses and trains better. Then the rule would do more than charge drivers: it could help make travel cleaner and easier.',
 'Other steps are needed too because tax by itself cannot fix city traffic.',
 'The first step is to make buses and trains quick, not too expensive and dependable.',
 'People will keep driving if buses do not come often, trains are too full or different routes do not join up well.',
 'Cities should therefore run more trains, give buses their own lanes and connect homes more directly with jobs and schools.',
 'A second step is to control use of the roads better: charge people for driving in busy places, raise parking prices there and make walking and cycling safer.',
 'These steps can reduce car journeys people do not need while giving them other ways to travel that they can really use.',
 'To sum up, raising taxes on private cars may reduce traffic by making people less dependent on cars and paying for better transport.',
 'But lasting change will only happen if cities also improve public transport, charge for use of busy roads and give people safe ways to travel without driving.',
];
const vocabulary=[
 v(['Congestion','Too much traffic','交通擠塞'],['stubborn problems','hardest problems','頑固問題'],['modern cities','modern cities','現代城市']),
 v(['proposed response','suggested answer','建議方法'],['raise taxes','pay more tax','提高稅項'],['private vehicles','own cars','私家車']),
 v(['ease pressure on roads','take pressure off roads','減輕道路壓力'],['commuters’ behaviour','how people travel to work','通勤者行為'],['dependable alternatives','other ways of travelling that people can trust','可靠替代方式']),
 v(['effect','how this tax may work','作用'],['taxation','tax','稅收政策'],['outline two further measures','gives two more ways','概述另外兩項措施']),
 v(['reduce congestion','mean less traffic','減少擠塞'],['private car ownership','owning a car','擁有私家車'],['less attractive','less appealing','吸引力下降']),
 v(['registration fees','money paid to register','登記費'],['annual licences','yearly permit','年度牌照'],['ownership charges','own a car','擁車成本'],['every journey','every time','每次出行']),
 v(['short distance','short way','短途'],['mainly out of habit','out of habit','主要出於習慣'],['switch to a train or bus','take a train or bus','轉乘火車或巴士'],['harder to justify','too expensive to seem sensible','難以合理化']),
 v(['thousands of similar decisions','thousands of people in the same city make this choice','成千上萬類似決定'],['across a city','in the same city','全市'],['number of vehicles','fewer cars','車輛數量']),
 v(['In addition','Also','此外'],['money collected from these taxes','tax money','稅收所得'],['improve public transport','make buses and trains better','改善公共交通'],['not simply punish drivers','do more than charge drivers','不只懲罰駕駛者'],['cleaner and more efficient','cleaner and easier','更清潔高效']),
 v(['Other measures','Other steps','其他措施'],['taxation alone','tax by itself','單靠稅收'],['urban congestion','city traffic','城市擠塞']),
 v(['public transport','buses and trains','公共交通'],['fast','quick','快捷'],['affordable','not too expensive','價格合理'],['reliable','dependable','可靠']),
 v(['leave their cars at home','keep driving','把車留在家中'],['infrequent','do not come often','班次疏落'],['overcrowded','too full','過度擠迫'],['poorly connected','do not join up well','銜接不佳']),
 v(['expand rail services','run more trains','擴展鐵路'],['dedicated bus lanes','buses their own lanes','巴士專線'],['residential districts','homes','住宅區'],['workplaces and schools','jobs and schools','工作地點與學校']),
 v(['manage road use','control use of the roads','管理道路使用'],['congestion charges','charge people for driving in busy places','擠塞收費'],['higher parking fees','raise parking prices','較高泊車費'],['safer walking and cycling routes','make walking and cycling safer','較安全步行單車路線']),
 v(['reduce unnecessary car trips','reduce car journeys people do not need','減少不必要駕車'],['realistic alternatives','other ways to travel that they can really use','切實可行替代選擇']),
 v(['In conclusion','To sum up','總結'],['increasing the tax','raising taxes','提高稅項'],['alleviate congestion','reduce traffic','紓緩擠塞'],['car dependency','dependent on cars','依賴汽車'],['funding better transport','paying for better transport','資助更佳交通']),
 v(['However','But','然而'],['lasting improvement','lasting change','持久改善'],['stronger public transport','improve public transport','更完善公共交通'],['road pricing policies','charge for use of busy roads','道路收費'],['safe alternatives to driving','safe ways to travel without driving','安全替代出行']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'High rent has become one of the most stubborn problems in large cities.',d:[1,4,9],relation:'背景句界定長期難解問題',formula:'[問題] has become one of the most stubborn problems in [地方]',meaning:'交通擠塞是現代城市頑固問題。',links:[' has become one of the most stubborn problems in '],labels:['問題','問題所在']},
 {example:'One proposed response is to raise fees on street parking.',d:[0,4,9],relation:'先介紹被提出的一項回應方法',formula:'One proposed response is to [政策動作]',meaning:'有人提議提高私家車稅項。',links:['One proposed response is to '],labels:['建議的政策']},
 {example:'This would ease pressure on roads by changing delivery schedules, but cities also need dependable alternatives to driving.',d:[0,4,9],relation:'by 解釋直接機制，but 補必要的替代方案',formula:'This would ease pressure on roads by [行為轉變], but cities also need dependable alternatives to driving',meaning:'稅項或改變通勤行為，但也須有可靠代替出行。',links:['This would ease pressure on roads by changing ', ', but cities also need dependable alternatives to driving.'],labels:['被改變的行為']},
 {example:'This essay will explain the effect of road closures and outline two further measures.',d:[0,4,9],relation:'引言明確預告先分析一策，再提兩項措施',formula:'This essay will explain the effect of [已提出措施] and outline two further measures',meaning:'文章先解釋稅收作用，再提兩項措施。',links:['This essay will explain the effect of ', ' and outline two further measures.'],labels:['首項政策']},
 {example:'A higher fee could reduce congestion because it makes unnecessary trips less attractive.',d:[1,3,9],relation:'because 說價格升高如何抑制車流',formula:'A higher [收費] could reduce congestion because it makes [行為] less attractive',meaning:'較高稅項令擁車和駕車吸引力降低。',links:['A higher ', ' could reduce congestion because it makes ', ' less attractive.'],labels:['提高的收費','受抑制的行為']},
 {example:'If parking permits become more expensive, many people will begin to question whether every journey needs to be made by car.',d:[3,9,10],relation:'If 價格條件令駕駛者重新判斷每次行程',formula:'If [車輛成本] become more expensive, many people will begin to question whether every journey needs to be made by car',meaning:'登記、牌照或擁車成本升高時，人們會檢視每次駕車是否必要。',links:['If ', ' become more expensive, many people will begin to question whether every journey needs to be made by car.'],labels:['上升的成本']},
 {example:'For example, a worker who drives a short distance to a college out of habit may switch to a train or bus once parking becomes harder to justify.',d:[3,9,10],relation:'例子以習慣性短途駕車展示價格訊號如何改變選擇',formula:'For example, [習慣短途駕車者] may switch to a train or bus once [用車成本] becomes harder to justify',meaning:'短途駕車者或因養車成本改乘公共交通。',links:['For example, ', ' may switch to a train or bus once ', ' becomes harder to justify.'],labels:['出行者及舊習慣','難再合理化的成本']},
 {example:'When thousands of similar decisions are made across a town, the number of vehicles on the road falls.',d:[3,9,10],relation:'When 聚合個人選擇，推出全市車輛數下降',formula:'When thousands of similar decisions are made across [地方], the number of vehicles on the road falls',meaning:'許多類似選擇累積，路上車輛數便下降。',links:['When thousands of similar decisions are made across ', ', the number of vehicles on the road falls.'],labels:['累積選擇的範圍']},
 {example:'In addition, the money collected from these fees could be used to improve buses, so the policy would not simply punish drivers; it would create a cleaner and more efficient transport system.',d:[3,9,10],relation:'so 和分號把稅收用途連到交通改善，反駁只懲罰駕駛者',formula:'In addition, [收費所得] could be used to improve [公共交通], so the policy would not simply punish drivers; it would create [更好系統]',meaning:'稅收可改善公共交通，政策不只增加駕駛者負擔。',links:['In addition, the money collected from these ', ' could be used to improve ', ', so the policy would not simply punish drivers; it would create a cleaner and more efficient transport system.'],labels:['收費類型','改善項目']},
 {example:'Other measures are also necessary because parking fees alone cannot solve urban congestion.',d:[3,4,11],relation:'because 指出單一價格政策不足，轉入其他措施',formula:'Other measures are also necessary because [單一手段] alone cannot solve urban congestion',meaning:'單靠稅項不足以解決城市擠塞。',links:['Other measures are also necessary because ', ' alone cannot solve urban congestion.'],labels:['不足的單一手段']},
 {example:'The first is to make ferry services fast, affordable and reliable.',d:[3,4,13],relation:'第一附加措施以三項品質定義可用替代方案',formula:'The first is to make [服務] fast, affordable and reliable',meaning:'公共交通須快捷、價格合理、可靠。',links:['The first is to make ', ' fast, affordable and reliable.'],labels:['需改善的替代服務']},
 {example:'People will not leave their cars at home if buses are slow, trains are overcrowded or routes are poorly connected.',d:[3,4,13],relation:'if 列三種服務缺陷解釋人們為何不轉乘',formula:'People will not leave their cars at home if [公交三種缺陷]',meaning:'班次疏、車廂擠、路線差，人們便不會放下私家車。',links:['People will not leave their cars at home if ', ', trains are overcrowded or routes are poorly connected.'],labels:['巴士服務缺陷']},
 {example:'Cities should therefore expand rail services, add bus priority lanes and connect residential districts more directly with workplaces and schools.',d:[3,4,13],relation:'therefore 對準服務缺陷列鐵路、巴士和直達連線',formula:'Cities should therefore [擴鐵路], [巴士專線] and [住宅與工作學校連線]',meaning:'擴鐵路、增巴士專線、接通住宅與工作學校。',links:['Cities should therefore expand rail services, add ', ' and connect residential districts more directly with workplaces and schools.'],labels:['巴士優先措施']},
 {example:'A second measure is to manage road use more carefully through district charges, higher parking fees and safer walking routes.',d:[3,4,10],relation:'through 並列道路收費、泊車費與安全慢行替代',formula:'A second measure is to manage road use more carefully through [收費與慢行措施]',meaning:'第二措施是更細緻管理道路使用。',links:['A second measure is to manage road use more carefully through '],labels:['具體管理方式']},
 {example:'These policies reduce unnecessary car trips while giving families realistic alternatives.',d:[3,4,10],relation:'while 並列減少不必要駕車與提供可行替代',formula:'These policies reduce [不必要出行] while giving [居民] realistic alternatives',meaning:'政策同時減少不必要開車並給居民可行選擇。',links:['These policies reduce ', ' while giving ', ' realistic alternatives.'],labels:['被減少的出行','得到替代的人']},
 {example:'In conclusion, increasing the tax on private vehicles can alleviate congestion by discouraging car dependency and funding safer buses.',d:[3,4,10],relation:'結論用 by 收束稅項的行為和資金雙機制',formula:'In conclusion, increasing the tax on private vehicles can alleviate congestion by discouraging car dependency and funding [更佳交通]',meaning:'提高稅項可降低依賴並資助更佳交通。',links:['In conclusion, increasing the tax on private vehicles can alleviate congestion by discouraging car dependency and funding '],labels:['稅收資助的交通']},
 {example:'However, towns will only see lasting improvement if this is combined with stronger public transport, parking policies and safe alternatives to driving.',d:[3,4,10],relation:'only if 清楚限制長期成效必須配合多項措施',formula:'However, [地方] will only see lasting improvement if this is combined with [三項配套]',meaning:'長期改善需公共交通、道路定價及安全替代方式配合。',links:['However, ', ' will only see lasting improvement if this is combined with stronger public transport, ', ' and safe alternatives to driving.'],labels:['執行城市','道路定價方式']},
];
const usage=[
 '當你要在引言界定一個持續多年且難解的城市問題時。',
 '當你要先介紹題目提出的一項政策方案時。',
 '當你要用 by 說明一策如何奏效，再用 but 指出必要配套時。',
 '當題目要求分析一策及另提措施，需要在引言預告兩部分時。',
 '當你要用 because 解釋提高價格如何令某行為較不吸引時。',
 '當你要用 If 說明成本上升會如何使人重新考慮日常選擇時。',
 '當你要用一位習慣性使用者，示範價格改變如何影響選擇時。',
 '當你要由個人選擇推到全市規模的累積結果時。',
 '當你要交代收費用途，並回應它只是懲罰使用者的質疑時。',
 '當你要說明一項措施不足，需要轉入其他互補方案時。',
 '當你要用三項可觀察品質定義第一種可行替代服務時。',
 '當你要用 if 列出服務缺陷，解釋人們為何不改變行為時。',
 '當你要用 therefore 對準已列的缺陷提出具體改善時。',
 '當你要轉入第二項措施，並用 through 列出執行工具時。',
 '當你要用 while 說明政策既減少問題行為，也提供替代選項時。',
 '當結論要收束一項收費政策在行為與資金兩方面的作用時。',
 '當你要用 only if 說明持久成效依賴多項配套同時實施時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分開稅項的兩個機制與兩項追加措施。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('題目要求文章做甚麼？',['解釋提高私家車稅如何影響擠塞，並提出其他措施。','只比較兩種汽車顏色。','只提出永久禁用所有巴士。','只敘述一名司機的工作日。'],'範文先分析稅項，再列公共交通與道路管理。'),{type:'multi',prompt:'選出範文的兩個稅項作用',detail:'選兩項，再按「確認」。',options:['提高擁車成本，使部分人轉乘。','以稅收改善公共交通。','保證所有人立即賣掉車。','讓城市毋須提供駕車替代方式。'],correct:[0,1],why:'價格訊號與稅收用途是兩個機制。'}];
const route=[sequence('還原四段內容',[['引言','指出交通擠塞，介紹私家車稅與可靠替代出行。'],['稅項作用','擁車成本上升改變短途習慣，稅收又可改善公共交通。'],['其他措施','改善公交品質，並用收費、泊車與安全步行單車路線管理道路。'],['結論','稅項有用，長期改善仍須三種配套。']],'稅項、公交品質與道路使用管理分屬不同作用。')];
const evidence=[
 quiz('提高私家車稅為何可能減少道路車輛？',['部分人重新評估每次是否需駕車，改乘火車或巴士。','車輛收到稅單便自動消失。','稅項會令所有道路立即擴建。','駕車者必然完全停止工作。'],'成本變化先影響選擇，許多選擇累積才減車流。'),
 quiz('短途上班者例子說明甚麼？',['原本出於習慣開車的人，或因養車成本改乘公交。','所有短途出行都只能步行。','火車與巴士一定比車更貴。','只有長途司機受稅項影響。'],'例子將價格訊號落到具體日常選擇。'),
 quiz('哪三項公交缺陷會阻止人放下私家車？',['班次疏落、車廂擠迫、路線銜接差。','列車太快、票價合理、班次穩定。','巴士專用線太多、火車太準時、轉乘方便。','步行安全、單車方便、學校連線直接。'],'原文用 if 列三種缺陷。'),
 quiz('第二項額外措施包含甚麼？',['擠塞收費、繁忙地區泊車費，以及安全步行單車路線。','只提高門票和博物館收費。','只取消所有住宅區。','只增加汽車廣告。'],'道路定價與慢行替代同時出現。'),
 quiz('為何結論使用 only if？',['持久改善依賴稅項與公交、道路收費及安全替代配合。','提高稅項已保證單獨解決一切。','只要有火車，其他措施必定無用。','居民不需任何出行方式。'],'only if 限定成功條件。'),
];
const logic=[sequence('稅項的行為與收入雙鏈',[['價格訊號','登記、牌照或擁車費變高。'],['個人選擇','部分短途司機改乘火車或巴士。'],['全市效果','大量選擇累積，車流或下降。'],['收入用途','稅收可改善公共交通。']],'不能把收稅直接等同道路即時清空。'),sequence('可靠替代方案',[['公交品質','班次、擠擁、銜接三項要改善。'],['道路管理','繁忙區收費及泊車定價。'],['安全選項','步行和單車路線可實際使用。'],['長期結果','多項配套一起才有持久改善。']],'限制駕車與提供其他方式要一起考慮。')];
const transfers=[
 transfer('一名員工只因習慣每天短途駕車；養車費增加。','哪句正確連起成本與行為？',['他可能重新考慮是否每程都需駕車，並改乘火車或巴士。','養車費增加便保證他永遠不再出門。','任何稅項都與出行選擇完全無關。','他必須改乘一架沒有路線的巴士。'],['保留 may 的可能性及可行替代。','過度斷言。','原文有關。','替代須可靠。'],[5,6],'If 成本上升→短途習慣改變。'),
 transfer('全市有數千名短途司機同時改乘公交。','哪句推論全市結果？',['大量類似個人決定累積，可使路上的車輛數下降。','一名司機改乘便保證全市完全無車。','個人決定永遠不可能產生城市影響。','改乘公交必然使每條路增加私家車。'],['由個人到總量的尺度轉換。','不是一人。','可累積。','方向相反。'],[7],'thousands of similar decisions→vehicles falls。'),
 transfer('政府收取新車稅後，只把錢放入普通帳戶。','哪句補足範文的第二個稅項機制？',['把部分稅收用於改善公共交通，讓政策同時增加可用替代方式。','收稅只可用來懲罰駕駛者，不能改善交通。','只要收稅，巴士便會自動變得可靠。','稅收用途與駕車替代方式完全無關。'],['稅收→公交投資，是另一條機制。','原文反駁只懲罰。','需實際投資。','用途有關。'],[8],'tax money improve public transport。'),
 transfer('一城巴士一小時才一班，列車擠迫，轉乘路線不相接。','哪句判斷較符合文章？',['即使提高車稅，人們仍可能不願放下私家車，須改善公交品質。','稅收會令所有班次立刻變密。','轉乘差不會影響任何通勤者。','巴士越少，替代駕車就越容易。'],['服務缺陷削弱轉乘誘因。','需投資改進。','有影響。','方向相反。'],[9,10,11],'taxation alone cannot solve; if buses infrequent。'),
 transfer('住宅區到學校路線繞遠，巴士經常堵在車流中。','哪項改善對準原文？',['連接住宅與學校，並增設巴士專用線。','只提高歷史博物館門票。','取消所有學校，無須再通勤。','不改路線，只反覆宣稱公交可靠。'],['直達路線與巴士專線對準缺陷。','不相關。','荒謬。','須有具體改善。'],[11,12],'dedicated lanes + direct connections。'),
 transfer('市中心車位長期緊張，但步行和單車路線危險。','哪句平衡限制與替代？',['可提高繁忙區泊車費，同時建安全步行和單車路線。','只提高泊車費，並故意使其他出行更危險。','車位緊張便必須永久禁止所有居民出門。','安全路線與減少不必要駕車完全無關。'],['道路定價與安全替代需並行。','缺替代。','過度限制。','原文有關。'],[13,14],'parking fees + safer routes。'),
 transfer('另一題談減少大型活動附近的車流。','哪句能轉用本文的分析框架？',['可比較出行價格、公交品質和安全的非駕車路線如何共同改變選擇。','因城市車稅有用，任何活動都必須永久取消。','只調高價格，毋須考慮參加者如何到達。','所有活動參加者必然住在場館旁。'],['價格訊號、可靠替代與道路管理可轉題。','不能直接推取消。','替代重要。','無此保證。'],[2,9,13,16],'價格與配套並用。'),
 transfer('有人說「車稅提高後，擠塞必然完全消失」。','哪句指出推論過強？',['稅項可減少部分駕車，但持久改善仍須可靠公交及其他道路政策。','稅項一升，全市每輛車必須即時消失。','其他政策只會阻止任何人乘公交。','文章認為車稅完全不會影響行為。'],['區分可能減壓與完全解決。','過度。','無據。','原文認為有作用。'],[4,9,16],'taxation alone cannot solve。'),
 transfer('政府要交代「道路收費」和「公交投資」的不同功能。','哪句分得最清楚？',['道路定價減少不必要車程；公交投資提供人們可使用的替代服務。','兩者都只用來改變汽車顏色。','道路收費必然令巴士停駛。','公交投資只會增加所有私家車行程。'],['抑制需求與提供選項分工不同。','不相關。','無此必然。','方向相反。'],[12,13,14],'reduce trips while giving alternatives。'),
 transfer('結論須避免只重複「提高稅項」。','哪句最完整？',['稅項可減少汽車依賴並資助公交，持久改善仍需道路收費與安全替代路線。','提高稅項，因為提高稅項。','只靠一條巴士線便保證全部擠塞消失。','汽車依賴與公共交通品質沒有任何關係。'],['收束稅項雙機制與多項配套。','循環說法。','過度保證。','互相關聯。'],[15,16],'結論 by 雙機制及 only if 配套。'),
];
const balancedTransferOptions=[
 ['養車較貴可令他重想短途駕車，改乘火車或巴士。','養車費稍有增加，他便保證永遠不再出門。','任何汽車稅都不可能影響人們的出行選擇。','他只能改乘一架從未設站也沒有路線的巴士。'],
 ['許多司機的轉乘決定累積，可減少路上車輛。','只要一名司機改乘，全城便保證沒有汽車。','個人出行決定不可能帶來任何城市影響。','大家改乘公交，必然令每條路私家車更多。'],
 ['把部分車稅投入公交，可增加可行的出行替代。','車稅只可懲罰駕駛者，不准投資任何公交。','只要收到車稅，所有巴士便自動準時可靠。','車稅用途與駕車以外的交通選項毫無關係。'],
 ['車稅未必足夠，還需改善班次、擠迫和轉乘。','一旦提高車稅，所有巴士班次便立即變密。','轉乘路線不相接，完全不影響任何通勤者。','巴士班次愈稀疏，取代駕車便必然愈容易。'],
 ['連接住宅與學校，並增設巴士專用行車線。','只調高歷史博物館門票，便能改善校巴服務。','取消所有學校，孩子便不需要任何出行方式。','不改善路線，卻一再宣稱公交已十分可靠。'],
 ['可調高繁忙區泊車費，兼建安全步行單車路。','只調高泊車費，並使其他所有出行更危險。','車位緊張，就必須永久禁止全部居民出門。','安全步行單車路與減少駕車完全沒有關係。'],
 ['比較出行價格、公交品質及安全路線的共同作用。','既然車稅有用，所有大型活動便要永久取消。','只調高駕車價格，不必問參加者如何抵達場館。','全部活動參加者都必然住在場館的旁邊。'],
 ['稅項可減部分駕車，持續減塞仍需可靠公交。','稅項一提高，全城每輛車便必須立即消失。','其他交通政策只能阻止任何人乘坐公交。','文章主張車稅完全不可能影響人的行為。'],
 ['道路定價抑制非必要駕車，公交投資提供替代。','兩者只用來改變道路上所有汽車的顏色。','道路收費一旦推出，巴士便必然全部停駛。','公共交通投資只會增加每人的私家車旅程。'],
 ['車稅可減依賴並資助公交，仍需安全替代路線。','只重複提高車稅四字，便已提出完整交通方案。','只建一條巴士線，便能保證全部擠塞消失。','汽車依賴與公共交通服務品質完全沒有關係。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
const revised=[
  {options:['養車較貴可能令他重想短途駕車，改乘火車或巴士。','養車較貴會令他立即停工，毋須考慮其他交通。','養車較貴仍不影響短途駕車，因他已有私家車。','養車較貴便改乘巴士，即使該區尚無巴士路線。'],explanations:['成本變化可能促使改選已有的交通方式。','稅額變化不足以推斷他停止工作。','已擁車不等於日後使用成本不影響選擇。','替代路線必須實際存在且可用。']},
  {options:['多人轉乘公交的決定累積，可減少路上私家車。','一位司機轉乘公交，已足以明顯降低全市車流。','個人轉乘公交，只會改變票務收入而非車流。','多人轉乘公交後，路上私家車反而會增加。'],explanations:['把多個人的選擇連到城市層面的車流變化。','單一決定不足以推斷全市擠塞改善。','轉乘會影響道路上的車輛數量。','相同條件下轉乘通常使私家車減少。']},
  {options:['將部分車稅投入公交，提供更可靠的替代路線。','將車稅主要投入停車場，讓駕車成本維持較低。','把車稅存入普通帳戶，便可改善巴士的班次。','將車稅用於道路擴建，便無須改善公共交通。'],explanations:['收入用於改善公交，是加稅以外的第二條作用路徑。','增加停車便利未必促使短途司機轉乘。','未指定投資時，收稅本身不會改善班次。','道路工程不能直接補足公交服務缺口。']},
  {options:['車稅未必足夠，仍須改善班次、擠迫和轉乘。','車稅提高後，巴士班次會在原有資源下變密。','轉乘路線不接，卻仍可視為同樣便利的替代。','巴士班次較疏時，乘客轉乘誘因反而較強。'],explanations:['現有服務缺陷會削弱駕車者轉乘的誘因。','票價或稅項變動不會直接增加巴士班次。','轉乘不便會增加旅行時間和不確定性。','較疏班次通常降低交通替代的吸引力。']},
  {options:['連接住宅與學校，並增設巴士專用行車線。','優先提高市中心泊車費，沿用原有繞遠路線。','增設校門附近停車位，巴士仍沿原路繞行。','加強巴士宣傳，沿用原有路線與共用車道。'],explanations:['直達路線和專用車道分別對準繞路與塞車。','泊車定價未修正題述巴士繞路。','更多停車位未改善巴士的可靠性。','宣傳不能取代路線和道路配置的改善。']},
  {options:['調高繁忙區泊車費，同時建安全步行單車路。','調高繁忙區泊車費，但維持危險的慢行路線。','先建慢行路線，仍讓繁忙區泊車保持最低價。','調低繁忙區泊車費，再建安全步行單車路。'],explanations:['價格管理與安全替代同時處理需求及可行性。','只有價格措施，安全障礙仍會阻止轉乘。','這改善替代方式，但未處理題述泊車擠迫。','較低泊車費可能增加繁忙區駕車誘因。']},
  {options:['比較出行價格、公交品質與安全路線的作用。','只比較活動門票價格，略過參加者抵達方式。','沿用車稅論點，假設場館附近已有便利公交。','只計算駕車成本，未分析晚間回程路線。'],explanations:['把價格誘因與可靠、安全的替代方案一起轉用。','門票價格不能回答場館周邊交通問題。','轉題時須核查場館交通條件。','回程可行性是大型活動的重要限制。']},
  {options:['車稅可減部分駕車，持續減塞仍需可靠公交。','車稅可減部分駕車，所以公交服務可再削減。','車稅能抑制短途駕車，足以解決每條路的擠塞。','車稅對車流作用有限，因此毋須調整其用途。'],explanations:['保留稅項可能有效及配套仍必要兩層判斷。','削減公交會削弱轉乘的替代選項。','局部減車不能保證所有路段都解決擠塞。','效果有限正是檢討投資和配套的理由。']},
  {options:['道路定價抑制非必要駕車，公交投資提供替代。','道路定價改善巴士班次，公交投資則提高車稅。','道路定價主要增加泊車位，公交投資降低油價。','公交投資抑制票價，卻不改變可用的出行選項。'],explanations:['一項調整駕車成本，另一項提升替代交通。','把兩項政策的作用方向對調了。','兩種效果都不是題述政策的直接機制。','公交投資亦可改善班次、路線與可靠性。']},
  {options:['車稅可減依賴並資助公交，仍須安全替代路線。','車稅可減依賴，公交品質則與減塞沒有關聯。','改善一條巴士線後，可停止調整道路定價。','車稅收入宜用於停車位，毋須改善出行替代。'],explanations:['收束稅項雙重作用與多項配套。','公交品質影響駕車者是否轉乘。','單一線路不能代表整體交通網絡已足夠。','擴增停車位未必達到減少汽車依賴的目的。']}
];
revised.forEach((r,i)=>{transfers[i].options=r.options;transfers[i].explanations=r.explanations});
// Reviewed connector structure decompositions.
structures[8].frame.parts=[["In addition, ","link","句型固定部分"],["the money collected from these taxes","slot","可運用的收入"],[" could be used to improve ","link","句型固定部分"],["public transport","slot","改善的服務"],[", so the policy would not simply punish drivers; it would create ","link","句型固定部分"],["a cleaner and more efficient transport system","slot","產生的更好系統"],[".","link","句型固定部分"]];
structures[8].frame.formula="In addition, [可運用的收入] could be used to improve [改善的服務], so the policy would not simply punish drivers; it would create [產生的更好系統].";
structures[12].frame.parts=[["Cities should therefore ","link","句型固定部分"],["expand rail services","slot","第一項措施"],[", ","link","句型固定部分"],["add dedicated bus lanes","slot","第二項措施"],[" and ","link","句型固定部分"],["connect residential districts more directly with workplaces and schools","slot","第三項措施"],[".","link","句型固定部分"]];
structures[12].frame.formula="Cities should therefore [第一項措施], [第二項措施] and [第三項措施].";
export default {key:'direct-question:44',meta:{topic:'私家車稅與城市交通擠塞',summary:'文章解釋加稅如何改變短途駕車選擇，稅收又可改善公交；再提出更快更可靠的公交，以及道路定價和安全慢行選項，強調持久效果須多策並用。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
