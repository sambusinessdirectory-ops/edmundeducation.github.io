// Demolition versus renovation: functional gains, nonrenewable heritage and resource costs.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:20'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many cities with little land, old buildings are pulled down so people can build new ones.',
 'New buildings can be safer and work better. Still, I think removing old ones does more harm because it destroys important old places and harms the environment in ways we could avoid. So the good points do not beat the bad ones.',
 'The biggest problem is losing a city’s old look and sense of who it is, and never getting them back.',
 'Old buildings do more than give people space to use; they hold a city’s stories and make areas feel different from one another.',
 'When an old market, theatre or line of shops is replaced by another tall glass building, the city loses part of its story.',
 'After a while, city centres start to look the same, which can make local people feel less close to their area and may make visitors less interested.',
 'Pulling buildings down also harms the environment a great deal.',
 'It leaves huge amounts of broken building material, while building something new uses more metal, cement and power.',
 'In brief, what looks like improvement often comes with a large cost to nature.',
 'Replacing old buildings has clear good points, but they are less strong in the end.',
 'New buildings are usually safer, use less power and meet today’s needs better.',
 'In cities where many people live close together, building upwards can also make more homes, offices and public places on a small amount of land.',
 'Even so, these good points do not beat the bad ones. Many are about how a building works, and people can often get them by fixing or using an old building in a new way.',
 'Cities can make an old building stronger, improve its equipment and change the inside without pulling everything down.',
 'Old places are different: once they are destroyed, people cannot truly make them again.',
 'To sum up, pulling down old buildings may make room for newer places and easier-to-use services, but it also destroys a city’s character and causes environmental harm that could be avoided.',
 'That is why the good points do not beat the bad ones.',
];
const vocabulary=[
 v(['land-scarce','little land','土地稀缺'],['ageing buildings','old buildings','老舊建築'],['torn down','pulled down','拆除'],['make way for','so people can build','騰出地方'],['modern development','new ones','現代發展']),
 v(['replacement','New buildings','取代'],['safer and more efficient premises','safer and work better','更安全高效空間'],['drawbacks are greater','does more harm','缺點更大'],['erases heritage','destroys important old places','摧毀文化遺產'],['avoidable environmental harm','harms the environment in ways we could avoid','可避免的環境損害'],['do not outweigh','do not beat','不足以蓋過']),
 v(['most serious disadvantage','biggest problem','最嚴重缺點'],['irreversible loss','never getting them back','不可逆轉流失'],['historical character','old look','歷史風貌'],['cultural identity','sense of who it is','文化身分']),
 v(['not merely','do more than','不只是'],['functional structures','space to use','實用結構'],['embody a city’s memory','hold a city’s stories','承載城市記憶'],['distinct sense of place','feel different from one another','獨特地方感']),
 v(['traditional market','old market','傳統市場'],['row of shophouses','line of shops','成排店屋'],['replaced by','replaced by','被取代'],['glass tower','tall glass building','玻璃高樓'],['loses part of the story','loses part of its story','失去部分故事']),
 v(['Over time','After a while','久而久之'],['urban centres','city centres','城市中心'],['look interchangeable','look the same','看起來千篇一律'],['weaken residents’ attachment','make local people feel less close','削弱居民歸屬感'],['reduce their appeal to visitors','make visitors less interested','降低對遊客吸引力']),
 v(['Demolition','Pulling buildings down','拆除'],['heavy environmental cost','harms the environment a great deal','重大環境代價']),
 v(['vast quantities of rubble','huge amounts of broken building material','大量瓦礫'],['new construction','building something new','新建工程'],['fresh steel','more metal','新鋼材'],['energy','power','能源']),
 v(['In short','In brief','簡而言之'],['presented as progress','looks like improvement','被稱為進步'],['sizeable ecological bill','large cost to nature','重大生態代價']),
 v(['advantages of replacement','Replacing old buildings has clear good points','重建的優點'],['ultimately less compelling','less strong in the end','最終說服力較弱']),
 v(['usually safer','usually safer','通常更安全'],['more energy-efficient','use less power','更節能'],['contemporary needs','today’s needs','當代需要']),
 v(['densely populated cities','cities where many people live close together','人口稠密城市'],['high-rise redevelopment','building upwards','高樓重建'],['public facilities','public places','公共設施'],['scarce land','small amount of land','稀缺土地']),
 v(['Nevertheless','Even so','然而'],['do not outweigh','do not beat','不足以蓋過'],['functional gains','about how a building works','功能改善'],['renovation','fixing','翻新'],['adaptive reuse','using an old building in a new way','活化再利用']),
 v(['strengthen an old structure','make an old building stronger','加固舊建築'],['upgrade its systems','improve its equipment','升級系統'],['redesign its interior','change the inside','重新設計內部'],['without wiping the slate clean','without pulling everything down','毋須全部推倒']),
 v(['Heritage','Old places','文化遺產'],['by contrast','different','相比之下'],['non-renewable','cannot truly make them again','不可再生'],['destroyed','destroyed','被摧毀']),
 v(['In conclusion','To sum up','總結'],['demolishing old buildings','pulling down old buildings','拆除舊建築'],['modern space','newer places','現代化空間'],['urban identity','a city’s character','城市身分'],['avoidable environmental costs','environmental harm that could be avoided','可避免環境代價']),
 v(['For this reason','That is why','基於此原因'],['advantages','good points','優點'],['do not outweigh the disadvantages','do not beat the bad ones','不足以蓋過缺點']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many crowded districts, small shops are torn down to make way for wider roads.',d:[1,6,9],relation:'以被動語態說明舊物被拆及新用途',formula:'In many [地方], [原有事物] are torn down to make way for [新用途]',meaning:'土地短缺城市拆除老舊建築，以便發展新項目。',links:['In many ', ', ', ' are torn down to make way for '],labels:['地方','被拆除事物','新用途']},
 {example:'While replacement can deliver safer and more efficient premises, I believe its drawbacks are greater because it removes familiar places; therefore, the advantages do not outweigh the disadvantages.',d:[0,9,15],relation:'用 While 先承認功能好處，再用 because/therefore 給相反判斷',formula:'While [功能好處], I believe [負面判斷] because [主要損失]; therefore, [整體權衡]',meaning:'新建築較安全高效，但文化與環境損失更重。',links:['While ', ', I believe ', ' because ', '; therefore, '],labels:['已承認好處','作者判斷','判斷理由','整體權衡']},
 {example:'The most serious disadvantage is the irreversible loss of local character and community identity.',d:[1,6,9],relation:'用 the most serious disadvantage 點出永久文化損失',formula:'The most serious disadvantage is the irreversible loss of [失去的價值]',meaning:'最重缺點是歷史風貌與文化身分無法挽回。',links:['The most serious disadvantage is the irreversible loss of '],labels:['無法挽回的價值']},
 {example:'Old buildings are not merely functional structures; they embody a town’s memory and give its centre a distinct sense of place.',d:[2,6,10],relation:'not merely...; they... 對比實用功能與記憶意義',formula:'[事物] are not merely functional structures; they embody [共同記憶] and give [地方] a distinct sense of place',meaning:'舊建築除了實用，也保存城市記憶及地方特色。',links:[' are not merely functional structures; they embody ', ' and give ', ' a distinct sense of place.'],labels:['事物','共同記憶','地方']},
 {example:'When an old cinema is replaced by another office block, a neighbourhood loses part of the story written into its streets.',d:[3,6,10],relation:'When 呈現替代事件，後半句說失去歷史故事',formula:'When [歷史場所] is replaced by [新建物], [地方] loses part of the story written into its streets',meaning:'市場、劇院或店屋若被玻璃大樓取代，城市失去可見的歷史。',links:['When ', ' is replaced by ', ', ', ' loses part of the story written into its streets.'],labels:['歷史場所','取代物','受影響地方']},
 {example:'Over time, older districts begin to look interchangeable, which can weaken residents’ attachment to their streets and even reduce their appeal to visitors.',d:[3,7,10],relation:'Over time 說漸變，which 推出歸屬感和遊客吸引力後果',formula:'Over time, [地區] begin to look interchangeable, which can weaken [居民連結] and even reduce [外界吸引力]',meaning:'城市相似化可能削弱居民歸屬感，也可能減少遊客興趣。',links:['Over time, ', ' begin to look interchangeable, which can weaken ', ' and even reduce '],labels:['變得相似的地方','居民連結','外界吸引力']},
 {example:'Demolition also carries a heavy financial cost.',d:[2,9,12],relation:'用 also 轉到第二項不同代價',formula:'Demolition also carries a heavy [代價種類] cost',meaning:'拆除亦有重大環境代價。',links:['Demolition also carries a heavy ', ' cost.'],labels:['代價種類']},
 {example:'It produces vast quantities of waste, while new construction consumes fresh metal, concrete and power.',d:[3,9,12],relation:'用 while 並列拆除廢料與新建所耗資源',formula:'It produces vast quantities of [拆除廢料], while new construction consumes [新資源]',meaning:'拆除產生瓦礫，新建又消耗鋼材、水泥與能源。',links:['It produces vast quantities of ', ', while new construction consumes '],labels:['拆除產物','新建所需資源']},
 {example:'In short, what is presented as progress often comes with a sizeable social bill.',d:[3,6,12],relation:'In short 收束「進步」背後未被計入的代價',formula:'In short, what is presented as progress often comes with a sizeable [代價種類] bill',meaning:'表面看來的進步，可能隱藏龐大生態代價。',links:['In short, what is presented as progress often comes with a sizeable ', ' bill.'],labels:['被忽略的代價']},
 {example:'The advantages of rebuilding are clear but ultimately less compelling.',d:[2,6,12],relation:'先承認重建優點，再說整體分量較弱',formula:'The advantages of [方案] are clear but ultimately less compelling',meaning:'作者承認重建有實際好處，但較文化及環境損失不夠重。',links:['The advantages of ', ' are clear but ultimately less compelling.'],labels:['方案']},
 {example:'New buildings are usually safer, more energy-efficient and better suited to changing family needs.',d:[3,9,12],relation:'三項並列具體化新建築的功能優點',formula:'New buildings are usually [好處一], [好處二] and better suited to [現時需要]',meaning:'新建築通常較安全、較節能，也較符合當代需求。',links:['New buildings are usually ', ', ', ' and better suited to '],labels:['安全好處','效率好處','使用需要']},
 {example:'In densely populated cities, high-rise redevelopment can also create more flats, clinics and shared facilities on scarce land.',d:[3,9,12],relation:'在土地稀少的地方說明高樓重建增加空間用途',formula:'In densely populated cities, high-rise redevelopment can also create more [新增空間] on scarce land',meaning:'高樓重建可在有限土地提供更多住屋、辦公及公共設施。',links:['In densely populated cities, high-rise redevelopment can also create more ', ' on scarce land.'],labels:['新增空間']},
 {example:'Nevertheless, these benefits do not outweigh the disadvantages because most of them are functional gains that can often be achieved through repair or reuse.',d:[3,9,15],relation:'Nevertheless 轉回權衡，because 說功能收益可用替代方案取得',formula:'Nevertheless, these benefits do not outweigh the disadvantages because [好處可替代的原因]',meaning:'功能改善可透過翻新或活化舊建築取得，故不足抵銷拆除代價。',links:['Nevertheless, these benefits do not outweigh the disadvantages because '],labels:['為何收益不足以蓋過損失']},
 {example:'Cities can strengthen a historic building, upgrade its heating and redesign its rooms without wiping the slate clean.',d:[3,9,12],relation:'列加固、升級、改造三種方式，without 說明不用全部拆掉',formula:'Cities can strengthen [舊建築], upgrade [系統] and redesign [內部] without wiping the slate clean',meaning:'可加固、升級並重設內部，毋須推倒重來。',links:['Cities can strengthen ', ', upgrade ', ' and redesign ', ' without wiping the slate clean.'],labels:['可保留結構','可升級系統','可調整內部']},
 {example:'Community trust, by contrast, is non-renewable: once it is destroyed, it cannot genuinely be recreated.',d:[3,9,12],relation:'by contrast 對照可改善功能與不可再生的價值',formula:'[不可再生事物], by contrast, is non-renewable: once it is destroyed, it cannot genuinely be recreated',meaning:'文化遺產一旦被摧毀，便不能真正重建。',links:[', by contrast, is non-renewable: once it is destroyed, it cannot genuinely be recreated.'],labels:['不可再生的價值']},
 {example:'In conclusion, demolishing old offices may produce modern space and more convenient facilities, but it also destroys local identity and imposes avoidable environmental costs.',d:[3,9,12],relation:'結論重提新空間收益，再用 but 重提文化與環境損失',formula:'In conclusion, demolishing [舊物] may produce [功能好處], but it also destroys [長期價值] and imposes [環境代價]',meaning:'新空間與便利換來城市身分及環境代價。',links:['In conclusion, demolishing ', ' may produce ', ', but it also destroys ', ' and imposes '],labels:['被拆除事物','功能好處','被破壞價值','環境代價']},
 {example:'For this reason, the savings do not outweigh the losses.',d:[3,9,15],relation:'For this reason 回指前文比較，提出最終利弊判斷',formula:'For this reason, the [已談好處] do not outweigh the [已談代價]',meaning:'作者判斷拆除優點不足抵銷缺點。',links:['For this reason, the ', ' do not outweigh the '],labels:['已談好處','已談代價']},
];
const usageGuides=[
 '當你要在引言指出某些地方為了新用途而拆除原有事物時。',
 '當你要先承認一項方案的好處，再以 because 和 therefore 明確給出整體權衡時。',
 '當你要用最嚴重缺點的主題句，指出一項無法挽回的損失時。',
 '當你要用 not merely 說明某事物除了實用功能，還有記憶或身分價值時。',
 '當你要用 When 描述舊事物被新事物取代後，地方失去甚麼時。',
 '當你要用 Over time 說明逐漸發生的改變，並以 which 推出兩項後果時。',
 '當你要用 also 從第一項代價轉到性質不同的第二項代價時。',
 '當你要用 while 並列舊物被處理與新物被建造時各自產生的資源影響時。',
 '當你要用 In short 收束已分析的細節，指出表面好處背後的代價時。',
 '當你要公平承認方案有好處，卻準備說明這些好處分量不足時。',
 '當你要列出三項可觀察的功能好處，避免只說「較好」時。',
 '當你要指出某種建設能在稀少資源上提供哪些新增用途時。',
 '當你要用 Nevertheless 回到權衡，並指出某項好處可由較少代價的方式取得時。',
 '當你要列出可行的改善步驟，再用 without 說明它們毋須造成的損失時。',
 '當你要用 by contrast 對比可改善的功能與一旦失去便不能恢復的價值時。',
 '當你要在結論同時重提已承認的好處與兩項主要代價時。',
 '當你要用 For this reason 回指整篇比較，清楚給出最終利弊判斷時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清兩項損失、重建好處與較少破壞的替代方案。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文比較哪項城市發展的利弊？',['拆除老舊建築並以新建築取代','只替舊樓外牆重新上色','只增加城市內的藝術展覽','只研究樓宇的廣告名稱'],'焦點是 demolition 與 replacement 的整體得失。'),
 {type:'multi',prompt:'作者認為拆除最重要的兩項代價是甚麼？',detail:'選兩項，再按「確認」。',options:['歷史風貌及文化身分不可逆轉地流失','拆除廢料與新建耗材造成環境代價','所有新建築都必然不安全','所有城市都不能再建住宅'],correct:[0,1],why:'作者分別分析文化遺產與環境兩條損失。'},
];
const route=[sequence('還原拆除舊建築的權衡',[
 ['背景與立場','土地稀少城市拆除舊樓；作者承認新樓功能較好，仍認為損失更重。'],
 ['歷史與身分','市場、劇院及店屋保存城市記憶；相似化可能削弱歸屬感。'],
 ['環境成本','拆除留下瓦礫，新建消耗鋼材、水泥及能源。'],
 ['承認功能收益','新樓可較安全、節能，並在稀少土地提供更多空間。'],
 ['替代方案與結論','翻新或活化常能取得功能收益；文化遺產一旦毀壞則不可再生。'],
 ],'結論不是否認新樓好處，而是比較可替代的收益與不可逆的損失。')];
const evidence=[
 quiz('舊建築除了實用空間，還有甚麼價值？',['保存城市記憶，令社區有獨特地方感。','保證所有居民都有相同收入。','令所有新建築必然違法。','只代表鋼材的市場價格。'],'not merely functional structures 點出文化和地方感。'),
 quiz('拆除及新建如何分別造成環境成本？',['拆除產生瓦礫，新建消耗新的鋼材、水泥及能源。','拆除和新建都完全不用任何材料。','只有遊客會使用水泥。','瓦礫能自動變回完整舊樓。'],'兩個流程的代價不同。'),
 quiz('作者承認新建築有哪些具體好處？',['通常較安全、節能，也較符合現今用途。','所有新樓必然免費且不耗能源。','新樓可重建已消失的歷史。','新樓只會減少住宅數量。'],'通常與可，都是有限度的功能好處。'),
 quiz('為何作者認為功能收益不足以蓋過拆除代價？',['翻新或活化往往也能取得功能改善，失去的文化遺產則難以重建。','功能收益完全不存在。','所有舊樓都不需要維修。','只因作者不喜歡玻璃的顏色。'],'關鍵是收益可替代、遺產不可再生。'),
 quiz('範文的最終判斷是甚麼？',['拆除可能帶來新空間，但文化與環境代價較重。','拆除只有壞處而沒有任何好處。','每座老舊建築都應無條件永久保留。','只要土地稀少就必須拆掉所有舊樓。'],'作者承認好處，但作出不利於拆除的整體權衡。'),
];
const logic=[
 sequence('文化與環境兩條代價',[
 ['文化記憶','舊建築承載地方故事，不只提供空間。'],
 ['相似化','舊場所被玻璃高樓取代，城市可能愈來愈相似。'],
 ['拆除廢料','工程留下大量瓦礫。'],
 ['新建耗材','新建築又需要鋼材、水泥和能源。'],
 ],'不要把文化流失誤寫成環境污染，或反過來。'),
 sequence('承認好處，再作替代方案比較',[
 ['新樓好處','較安全節能，也可在有限土地提供更多用途。'],
 ['替代途徑','加固、升級與重設舊樓內部，往往也能改善功能。'],
 ['不可逆損失','歷史建築摧毀後，文化遺產不能真正重建。'],
 ['最終權衡','可替代的功能收益不足以蓋過不可逆的文化與環境代價。'],
 ],'比較代價的可逆程度，才看得出範文的權衡理由。'),
];
const transfers=[
 transfer('一座舊戲院有結構問題，但外牆與大堂保存社區歷史。','哪句同時重視安全與文化價值？',['可先研究加固及內部升級，保留承載記憶的外牆與大堂。','舊樓有問題便必須立即拆掉所有歷史部分。','既有歷史價值就完全不用檢查安全。','戲院的歷史只等於拆除後留下的瓦礫。'],['功能改善可與保留文化並行。','忽略替代方案。','忽略安全需要。','混淆文化與廢料。'],[3,12,13,14],'原文指出舊樓可加固及改造，而遺產不可再生。'),
 transfer('城市把一排傳統店屋改成相似的玻璃辦公樓。','哪句符合歷史風貌論證？',['城市可能失去部分可見故事，社區地方感亦可能變弱。','玻璃辦公樓必然令所有居民立即搬離。','換建築材料會自動增加歷史記憶。','舊店屋與城市文化身分完全無關。'],['舊場所承載城市記憶。','過度斷言。','機制相反。','原文指出地方感。'],[3,4,5],'原文傳統市場、劇院或店屋被玻璃樓取代會失去故事。'),
 transfer('一個舊街區多座不同年代建築都被同款高樓取代。','哪句準確延伸範文的漸變後果？',['久而久之，街區可能較難辨認，也可能削弱居民的地方歸屬感。','只拆一棟樓便保證城市完全失去所有遊客。','樓宇愈相似，歷史差異必然愈清晰。','居民歸屬感只受建築物高度決定。'],['Over time 與 can 保留漸進及可能性。','過度保證。','方向相反。','還受多因素影響。'],[4,5],'原文 urban centres begin to look interchangeable。'),
 transfer('拆除舊樓後，工地留下大量瓦礫，下一期工程又需新鋼材。','哪句分清兩種環境成本？',['拆除會產生廢料，新建則再消耗材料與能源。','只要新樓較節能，拆建時便絕無環境代價。','瓦礫與新鋼材完全是同一種成本。','任何樓宇拆除都不會產生物料。'],['兩個工程階段各有不同代價。','忽略建造階段。','兩種成本不同。','與事實及原文相反。'],[6,7,8],'原文拆除瓦礫與新建鋼材水泥能源並列。'),
 transfer('舊社區中心太難使用，政府考慮拆除或翻新。','哪句運用範文的替代方案思路？',['先比較翻新能否改善設備與動線，再衡量拆除會失去的社區記憶。','只要翻新可行，便無須考慮工程成本。','只要拆除較快，文化損失便必然為零。','任何社區中心都不可能加固。'],['先查功能收益能否以較少破壞取得。','仍需衡量成本。','文化損失不會自動消失。','範文列加固方法。'],[12,13,14],'原文 functional gains often achievable through renovation or reuse。'),
 transfer('城市需要在有限土地上增加住宅及公共設施。','哪句公平呈現新建築的好處？',['高樓重建可提供更多空間，也可能帶來較安全、節能的設施。','高樓一定是唯一能提供住宅的方法。','興建新樓完全沒有任何實際好處。','新樓會自動恢復已毀壞的古蹟。'],['承認空間與功能收益，保留可能性。','不能排除其他方法。','否認原文承認的收益。','遺產不可再生。'],[10,11],'原文承認新樓安全、節能和增空間。'),
 transfer('有人說「新樓較安全，所以所有舊樓都要拆」。','哪句指出推論缺漏？',['安全改善值得重視，但仍須比較加固舊樓等做法能否取得同一收益。','新樓通常較安全，所以文化價值必然不存在。','只要舊樓存在，任何加固都不可能有效。','拆除決定只應看建築物的顏色。'],['功能好處可由不同方法達成。','兩項價值可並存。','原文列加固方式。','顏色不是核心權衡。'],[10,12,13],'原文 renovation/adaptive reuse 可取得部分功能收益。'),
 transfer('一家工廠要換新設備，但舊廠房的立面有地方歷史價值。','哪句能跨題轉移「可逆與不可逆」比較？',['可先在保留立面的前提下改造設備，避免把可保存的歷史一併毀掉。','任何舊廠房都必須永久維持原有設備。','只要設備更新，舊廠房歷史必然自動重現。','文化價值只取決於新設備的售價。'],['把可更新功能與難恢復的文化分開。','不必拒絕更新。','毀壞後難重現。','售價不是歷史本身。'],[13,14],'原文加固升級內部與 heritage non-renewable 對照。'),
 transfer('文章需比較短期可見收益與長期難補償損失。','哪句最符合範文的權衡方式？',['先確認收益是否能以其他方法取得，再評估損失一旦發生能否補救。','只列好處數目，完全不用看損失性質。','只要有一項好處，所有損失必然不重要。','任何有損失的方案都絕對不能進行。'],['比較替代性與不可逆性。','忽略權重。','沒有比較。','並非絕對禁令。'],[12,14,16],'原文用可替代功能收益對照不可再生遺產。'),
 transfer('另一題討論拆除舊學校並興建更大的新校舍。','哪句正確使用本文的框架而不照搬結論？',['應比較新校舍的安全和容量、拆建物料代價，以及舊校舍是否可加固再用。','原文反對拆老樓，所以新學校一定不能建。','只要能增加課室，任何歷史與環境損失都不必看。','學校題目只需討論學生制服顏色。'],['轉移評估維度，結論仍需按事實判斷。','不可照搬結論。','不能忽略代價。','不相關。'],[7,10,11,12,13],'原文功能、環境、文化及替代方案四維度可跨題檢查。'),
];
export default {key:'advantage-disadvantage:20',meta:{topic:'拆除舊建築的功能收益與不可逆代價',summary:'範文承認新建築可較安全、節能並增加空間，卻指出拆除會抹去城市記憶、製造瓦礫並消耗新材料；翻新或活化常可取得功能收益，遺產則不能再生。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
