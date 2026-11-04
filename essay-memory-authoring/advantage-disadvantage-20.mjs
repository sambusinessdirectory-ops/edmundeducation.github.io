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
 transfer('一座舊戲院有結構問題，但外牆與大堂保存社區歷史。','哪句同時重視安全與文化價值？',["先研究加固和內部升級，兼顧戲院安全與承載記憶的空間", "戲院有結構問題，所以所有原有外牆與大堂都必須拆除", "大堂有文化價值，因此可以暫時不處理已知結構問題", "若能保留外牆，便不用再檢查內部設施是否仍然安全"],["以加固和升級尋找安全與保存兼顧的做法。", "把安全問題直接等同全拆。", "文化價值不取消安全責任。", "保留立面仍須處理內部安全。"],[3,12,13,14],'原文指出舊樓可加固及改造，而遺產不可再生。'),
 transfer('城市把一排傳統店屋改成相似的玻璃辦公樓。','哪句符合歷史風貌論證？',["相似玻璃樓取代傳統店屋，或使城市故事與地方感變弱", "新辦公樓可提供空間，因此舊店屋所承載的歷史會保留", "店屋材料改變，便表示社區原有故事已經完整轉移", "地方感只取決於玻璃外牆美觀，與街區記憶沒有關係"],["歷史建築的可見痕跡與地方感可能流失。", "新空間不會自動保存舊故事。", "材料變化不是完整傳承。", "忽略建築與社區記憶。"],[3,4,5],'原文傳統市場、劇院或店屋被玻璃樓取代會失去故事。'),
 transfer('一個舊街區多座不同年代建築都被同款高樓取代。','哪句準確延伸範文的漸變後果？',["不同年代樓宇接連被同款高樓取代，街區特色或逐漸消失", "樓宇外形愈一致，居民便能更容易辨認各年代差異", "只要有新高樓，原有街區的地方歸屬感就必然更強", "每棟舊樓都可另建一座模型，所以原有街道毫無價值"],["多次替換累積會削弱可辨識性與歸屬感。", "一致外形會淡化年代差異。", "新建不保證歸屬感。", "模型不等於原有街區。"],[4,5],'原文 urban centres begin to look interchangeable。'),
 transfer('拆除舊樓後，工地留下大量瓦礫，下一期工程又需新鋼材。','哪句分清兩種環境成本？',["拆除產生瓦礫，新建又消耗材料與能源，兩項成本須分開算", "新樓較節能時，拆除舊樓產生的廢料便可直接忽略", "工地已有瓦礫，所以新鋼材的生產不會再消耗資源", "拆建會使用新材料，因此拆除階段必然不會產生廢物"],["分清拆除廢物和新建資源耗用。", "使用期效率不取消施工代價。", "新鋼材仍有製造成本。", "拆除仍會有廢料。"],[6,7,8],'原文拆除瓦礫與新建鋼材水泥能源並列。'),
 transfer('舊社區中心太難使用，政府考慮拆除或翻新。','哪句運用範文的替代方案思路？',["先查翻新可否改善設備與動線，再衡量拆除的記憶損失", "社區中心使用不便，便足以證明加固與翻新完全不可行", "只要翻新能保留記憶，工程費用與使用效果便不用估算", "拆除可以提供新空間，所以社區原有活動記憶不值評估"],["以可行替代方案對照不可逆的文化損失。", "不便不等於不能翻新。", "仍需比較費用和效果。", "新空間不取消記憶價值。"],[12,13,14],'原文 functional gains often achievable through renovation or reuse。'),
 transfer('城市需要在有限土地上增加住宅及公共設施。','哪句公平呈現新建築的好處？',["高樓重建可增加住宅與公共空間，也或提供更安全設施", "新樓若能增加空間，便一定不會產生任何建築廢物", "城市用地有限，便代表保存任何舊樓都不可能合理", "新建設施或較安全，所以居民不必再關注能源效率"],["公平承認新樓在容量與設施方面的可能收益。", "容量收益不取消施工廢物。", "仍可比較不同地點和翻新。", "節能也是應評估的收益。"],[10,11],'原文承認新樓安全、節能和增空間。'),
 transfer('有人說「新樓較安全，所以所有舊樓都要拆」。','哪句指出推論缺漏？',["安全改善重要，仍須比較加固舊樓能否提供相近效果", "新樓或較安全，因此任何舊樓的文化價值都不存在", "舊樓有安全風險，便表示所有加固方案都無法改善", "只要新樓提供較多樓面，便毋須檢查既有樓宇狀況"],["安全目標不自動決定只能全面拆除。", "文化價值可與安全考量並存。", "需評估加固可能性。", "仍需看既有樓宇。"],[10,12,13],'原文 renovation/adaptive reuse 可取得部分功能收益。'),
 transfer('一家工廠要換新設備，但舊廠房的立面有地方歷史價值。','哪句能跨題轉移「可逆與不可逆」比較？',["先研究保留立面並更新設備，避免連可保存的歷史也毀掉", "工廠設備要換新，便必須把所有有歷史價值的立面拆掉", "舊立面值得保存，因此工廠永遠不得更換任何舊設備", "只要新設備效率提高，地方歷史便會在拆除後自動重現"],["檢查更新設備是否能與保留歷史並存。", "設備更新不必然要求拆立面。", "保存不等於設備停更。", "不可逆痕跡不會自動重現。"],[13,14],'原文加固升級內部與 heritage non-renewable 對照。'),
 transfer('文章需比較短期可見收益與長期難補償損失。','哪句最符合範文的權衡方式？',["先查收益能否另法取得，再評估損失發生後能否補救", "短期可見收益較易計算，所以長期文化損失可直接忽略", "只要一項方案有損失，便不用檢查收益和替代方法", "拆除後可興建新樓，因此任何地方記憶都可以原樣恢復"],["同時評估替代性與不可逆性。", "不易量化仍需考慮。", "有損失不代表方案必須排除。", "新樓不能原樣恢復歷史。"],[12,14,16],'原文用可替代功能收益對照不可再生遺產。'),
 transfer('另一題討論拆除舊學校並興建更大的新校舍。','哪句正確使用本文的框架而不照搬結論？',["比較新校舍容量與安全、拆建物料代價及舊樓加固可能", "新校舍若可加課室，舊校舍的歷史與建築廢料便不用算", "舊校舍有記憶價值，因此任何容量不足都不能再改善", "只套用反對拆樓的結論，不檢查學校安全與使用需求"],["將收益、環境代價及翻新替代方案轉到新題。", "容量收益不能取消其他代價。", "保存不等於放棄改善。", "新題仍須具體評估。"],[7,10,11,12,13],'原文功能、環境、文化及替代方案四維度可跨題檢查。'),
];
const revised=[
 {wrong:['戲院結構有問題，應先拆除外牆再保存大堂記憶','大堂有文化價值，結構問題可留到翻新後再處理','保留外牆便可延續歷史，內部設施安全屬另一議題'],why:['拆外牆可能損失可保存的歷史特色。','已知安全風險不可留待日後才處理。','保留風貌仍要檢查和改善安全。']},
 {wrong:['新辦公樓提供空間，店屋的歷史可在新樓延續','店屋換成玻璃樓，社區故事可由圖片完整傳達','街區地方感主要來自新樓外觀，舊建築較次要'],why:['新用途不會自動保留舊街景的故事。','圖片未必能取代原有建築與街區體驗。','地方感也與歷史街景和集體記憶有關。']},
 {wrong:['樓宇外形更一致，居民較容易了解各年代差異','新高樓可能改善設施，所以街區歸屬感也會增強','舊樓可製作模型，原有街道特色便較易保留'],why:['同款建築可能抹去各年代外觀差異。','設施改善不必然提升地方歸屬感。','模型難以取代整體街道經驗。']},
 {wrong:['新樓使用時較節能，拆除產生的瓦礫便較不重要','工地留下瓦礫，新鋼材生產可視作另一工程成本','新建需要材料，所以拆除廢物可合併入材料消耗'],why:['使用階段收益不取消拆除廢料。','新材料消耗仍屬同一方案的環境成本。','兩項成本性質不同，應分開計算。']},
 {wrong:['中心使用不便，可推斷翻新難以滿足居民需要','翻新若能保留記憶，工程費用和動線可稍後再看','拆除可提供新空間，原有活動記憶便不影響決策'],why:['須先評估翻新能否改善使用問題。','替代方案仍須核對費用和效果。','社區記憶也是比較的一部分。']},
 {wrong:['高樓增加空間，因此建築廢物可視為必要代價','城市土地有限，保存舊樓便較難有公共價值','新設施或較安全，所以能源效率可放在次要位置'],why:['新樓的好處不能使環境成本免評估。','土地緊張不直接否定保存價值。','公平呈現好處仍要承認其他面向。']},
 {wrong:['新樓或較安全，舊樓文化價值便應列在後面','舊樓有安全風險，所以加固通常不如拆建有效','新樓樓面較多，舊樓安全狀況便不必詳細檢查'],why:['安全和文化價值都須納入比較。','加固成效須檢驗，不能預先排除。','樓面需求不會取消現樓安全評估。']},
 {wrong:['設備要換新，舊立面的保存成本便不宜再計算','舊立面有價值，工廠應優先保留現有全部設備','新設備效率提高，拆掉的地方歷史可由展示補回'],why:['保存立面是值得評估的替代方案。','更新設備與保存立面可以同時研究。','展板難以完整取代原有歷史建築。']},
 {wrong:['短期收益較易量度，長期文化損失可作後續補救','方案一有損失，便可先不比較替代方法的收益','拆除後能建新樓，地方記憶便可由新用途重建'],why:['有些歷史損失難以事後補償。','權衡要看收益能否由其他方法取得。','新用途不保證原有地方記憶恢復。']},
 {wrong:['新校舍可加課室，舊樓歷史與拆建廢料較不重要','舊校舍有記憶價值，容量問題便應留待日後處理','借用反對拆樓結論，即可推知新校舍方案不佳'],why:['容量收益不取消歷史及環境成本。','保存價值與容量需求須同時處理。','不同學校仍要查安全和使用條件。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[0].options[0]='先查加固與內部升級，兼顧安全和承載記憶的空間';
transfers[1].options[0]='相似玻璃樓取代店屋，或削弱城市故事與地方感';
transfers[2].options[0]='不同年代舊樓接連換成同款高樓，街區特色或流失';
transfers[3].options[0]='拆除有瓦礫，新建耗材料與能源，兩項成本須分開算';
transfers[4].options[0]='先查翻新能否改善使用，再衡量拆除後的記憶損失';
transfers[5].options[0]='高樓可增住宅與公共空間，也可能提供較安全設施';
transfers[6].options[0]='安全改善重要，仍須查加固舊樓能否達到相近效果';
transfers[7].options[0]='先研究保留立面並更新設備，避免毀掉可保存的歷史';
transfers[9].options[0]='比較新校容量與安全、拆建代價及舊樓加固可能';
export default {key:'advantage-disadvantage:20',meta:{topic:'拆除舊建築的功能收益與不可逆代價',summary:'範文承認新建築可較安全、節能並增加空間，卻指出拆除會抹去城市記憶、製造瓦礫並消耗新材料；翻新或活化常可取得功能收益，遺產則不能再生。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
