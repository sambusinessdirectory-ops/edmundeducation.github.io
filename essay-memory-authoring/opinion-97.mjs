// Reviewed Opinion 97: compact cities and transport problems.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-97-ielts-opinion.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['opinion:97'];const original=source.sentences.map(x=>x.english);
const simple=[
'Busy roads are a serious problem today.',
'Some people say more people should live in cities, not suburbs or the countryside, to improve transport.',
'I fully agree, because having people live closer together makes buses and trains work better and cuts long everyday trips.',
'The main reason is that cities can run good public transport, while places with few people often cannot.',
'When many people live near each other, governments have a good reason to pay for trains, buses, trams and cycle paths, because many passengers will use them every day.',
'But when homes are far apart in suburbs or villages, public transport costs more to run and is harder to use.',
'People living there often have little choice except to drive.',
'For example, a person living near a train station can get to work without driving, but someone far from the city may need a car even to buy everyday things.',
'So when more people live in cities, travel can become a service everyone shares instead of a task each person must manage alone.',
'Another reason is that cities put people closer to the places they need to go.',
'In cities planned well, jobs, schools, hospitals, shops and places for fun are often close enough to walk, cycle or take a short ride.',
'This is important because too many car trips, not just the cars themselves, cause traffic problems.',
'If people can walk to shops, cycle to parks or take short buses to clinics, they will need fewer cars.',
'As time passes, this can cut traffic jams, fuel use, the need for parking and pollution.',
'Living in the countryside may give people space and peace, but even a small errand can require a car trip.',
'To sum up, I fully agree that encouraging people to live in cities can help ease transport problems.',
'Living close together makes public transport practical and everyday trips shorter, tackling the main causes of traffic jams.',
];
const vocabulary=[
[['Traffic congestion','Busy roads','交通擠塞'],['a serious problem in modern life','a serious problem today','現代嚴重問題']],
[['Some argue','Some people say','有人主張'],['suburbs or rural areas','suburbs or the countryside','郊區或鄉村'],['transport problems','transport','交通問題']],
[['compact urban living','having people live closer together','緊湊城市生活'],['more efficient','work better','更有效率'],['long daily journeys','long everyday trips','漫長日常旅程']],
[['The strongest reason','The main reason','最有力原因'],['low-density areas','places with few people','低密度地區'],['support public transport','run good public transport','支撐公共交通']],
[['justify investing in','have a good reason to pay for','有理由投資'],['underground railways','trains','地下鐵路'],['cycle lanes','cycle paths','單車徑'],['large numbers of passengers','many passengers','大量乘客']],
[['By contrast','But','相比之下'],['homes are spread across distant suburbs or villages','homes are far apart in suburbs or villages','住宅分散'],['expensive to run','costs more to run','營運成本高'],['inconvenient to use','harder to use','不方便使用']],
[['Residents','People living there','居民'],['no realistic choice but to drive','little choice except to drive','只能駕車']],
[['an office worker who lives near a metro station','a person living near a train station','住在車站附近的上班族'],['without adding another car to the road','without driving','不增加路面汽車'],['basic errands','buy everyday things','日常瑣事']],
[['Urban concentration','when more people live in cities','人口集中城市'],['private burden','a task each person must manage alone','個人負擔'],['a shared public service','a service everyone shares','共享公共服務']],
[['Another reason','Another reason','另一個原因'],['shortens the distance between','put people closer to','縮短距離'],['the places they need to reach','the places they need to go','要去的地方']],
[['well-planned cities','cities planned well','規劃良好的城市'],['entertainment venues','places for fun','娛樂場所'],['within walking, cycling, or short-transit distance','close enough to walk, cycle or take a short ride','步行騎車或短途可達']],
[['This matters','This is important','這點重要'],['unnecessary vehicle journeys','too many car trips','不必要車程'],['vehicles','cars themselves','車輛本身']],
[['a supermarket','shops','超市商店'],['a short bus ride to a clinic','take short buses to clinics','短途巴士去診所'],['fewer cars will be needed','they will need fewer cars','較少需要汽車']],
[['Over time','As time passes','久而久之'],['congestion','traffic jams','交通擠塞'],['parking pressure','the need for parking','泊車壓力']],
[['Rural living','Living in the countryside','鄉村生活'],['space and quiet','space and peace','空間與寧靜'],['every small task into a car trip','even a small errand can require a car trip','小事也要駕車']],
[['In conclusion','To sum up','總結'],['people should be encouraged to live in cities','encouraging people to live in cities','鼓勵居住城市'],['ease transport problems','help ease transport problems','緩解交通問題']],
[['Dense urban living','Living close together','高密度生活'],['public transport viable','public transport practical','公共交通可行'],['daily travel shorter','everyday trips shorter','日常旅程較短'],['roots of congestion','main causes of traffic jams','擠塞根源']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[' is a serious problem in '],['引言要指出的問題','問題所在的生活範圍'],'is a serious problem in 簡短交代議題與背景，下一句須說爭議。','引言第一句需要用明白句子確立待解決的問題時。','Housing is a serious problem in many cities.','is a serious problem in','確立議題'),
frame(1,['Some argue that ', ' rather than ', ' to '],['被鼓勵的居住方式','被比較的另一方式','希望解決的問題'],'rather than 對比兩種居住選擇；to 說明主張者的目的。','呈現一項被提議的做法，並與另一方案比較及交代目的時。','Some argue that workers should live near jobs rather than far away to save time.','argue...rather than...to','交代對方方案與目的'),
frame(2,['I completely agree, because ', ' and '],['第一項公共交通效益','第二項出行距離效益'],'because 後並列兩條可在主體段分別展開的理由。','引言要表明同意，並預告兩種不同的交通改善機制時。','I completely agree, because density supports buses and reduces long trips.','agree...because...and','表態並預告雙理由'),
frame(3,['The strongest reason is that ', ' in a way that ', ' cannot.'],['城市能做到的服務','低密度地區難做到的對照'],'in a way that 比較同一服務在不同人口密度下能否維持。','第一段要解釋一種條件為何能支撐某服務，另一條件則難以支撐時。','The strongest reason is that busy areas can support trains in a way that scattered villages cannot.','in a way that...cannot','比較服務可行性'),
frame(4,['When ', ', governments can ', ', since '],['人口集中這個條件','有理由投入的公共設施','使用者數量這個原因'],'since 補出政府投資值得的使用量，不能只列設施。','要說明人口或使用量達到某條件後，公共投資為何合理時。','When many families live nearby, governments can fund buses, since riders will use them daily.','When...can...since','連接密度與投資'),
frame(5,['By contrast, when ', ', public transport becomes ', ' and '],['住宅分散的反面條件','營運成本變化','使用便利性變化'],'By contrast 切換條件；and 並列成本與便利兩項影響。','已有集中居住的正面機制，需對比住宅分散的服務後果時。','By contrast, when homes are far apart, public transport becomes costly and slow.','By contrast...when...and','對比低密度代價'),
frame(6,[' have no realistic choice but to '],['受服務不足影響的居民','被迫採取的交通方式'],'no realistic choice but to 指可行選項不足，並非居民主動偏愛某方式。','前句已指出服務昂貴又不便，下一句要寫出居民因此面對的實際選擇時。','Many households have no realistic choice but to drive to work.','no realistic choice but to','指出可選方式不足'),
frame(7,['For example, ', ' can ', ', whereas ', ' may '],['靠近公共交通者','其可行的無車出行','住得較偏遠者','可能依賴汽車的行為'],'whereas 在同一例子中對照兩種可及性。','要用兩名處境不同的人展示服務密度對行為的影響時。','For example, a city worker can ride a train, whereas a rural worker may need a car.','For example...whereas...may','以對照例子展示可及性'),
frame(8,[' therefore turns ', ' from ', ' into '],['人口集中所促成的轉變','被改變的交通安排','原先由個人承擔的狀態','共享服務的新狀態'],'from...into 將個人負擔與公共服務作段末概括。','前文已比較集中與分散，段末要概括制度性轉變時。','Density therefore turns travel from a private cost into a public service.','therefore turns...from...into','概括制度轉變'),
frame(9,['Another reason is that ', ' shortens ', ' between ', ' and '],['第二項因素','被縮短的距離','出行的人','需要到達的地方'],'Another reason is that 轉向第二條原因；between...and 指明距離的兩端。','第二段要由交通服務轉到日常目的地的距離時。','Another reason is that good planning shortens the distance between homes and shops.','Another reason...between...and','轉向距離機制'),
frame(10,['In ', ', ', ' are often within '],['規劃良好的地方','日常必需的目的地','步行騎行或短途車程的範圍'],'In 設定規劃條件；within 說明目的地可達的具體距離。','要具體說一個地方的設施如何近到可用非汽車方式到達時。','In a compact town, schools and shops are often within walking distance.','In...within','列出可達目的地'),
frame(11,['This matters because ', ' are not caused simply by ', '; they are caused by '],['需要解釋的交通問題','看似唯一的原因','更值得處理的行程原因'],'not...simply...; they... 更正只看車輛數目的單一歸因。','需要把讀者注意力從物件本身轉到不必要使用行為時。','This matters because delays are not caused simply by cars; they are caused by avoidable trips.','not simply...; they are','更正單一歸因'),
frame(12,['If ', ', fewer ', ' will be needed.'],['可用短途方式到達目的地的條件','因此較少需要的車輛'],'If 指可步行、騎車或短途乘車的情境；fewer 推出需求下降。','要用可觀察的日常條件說明車輛需求如何下降時。','If people can walk to shops, fewer cars will be needed.','If...fewer...will be needed','由可達性推到需求'),
frame(13,['Over time, ', ' reduces '],['出行習慣累積的時間','逐步減少的交通與環境成本'],'Over time 限定累積效果，不把改善說成即時。','前句已指出汽車需求下降，接着要說長遠連帶影響時。','Over time, this reduces fuel use and traffic delays.','Over time...reduces','推出長期多重結果'),
frame(14,[' may offer ', ', but it often turns ', ' into '],['另一種居住方式','其真實優點','本來很小的日常事情','可能增加的出行負擔'],'may offer 讓步承認優點；but 指出交通上的代價。','比較居住方式時，要承認另一方吸引力並解釋其代價時。','Village life may offer peace, but it often turns shopping into a long drive.','may offer...but...into','承認優點後指出代價'),
frame(15,['In conclusion, ', ' should be encouraged to ', ' in order to '],['作者同意的群體','被鼓勵的選擇','欲達到的交通目的'],'in order to 明確回到題目的政策目的。','結尾要重申應鼓勵誰採用何種做法，以及要解決甚麼時。','In conclusion, residents should be encouraged to live centrally in order to cut traffic.','In conclusion...in order to','重申方案與目的'),
frame(16,[' makes ', ' and ', ', which '],['高密度的居住條件','公共交通的可行性','日常行程距離','兩者合起來處理的根源'],'which 回指前面兩項交通改善，接上它們共同處理的問題。','結尾最後一句要把兩條主體理由合成同一根源性結果時。','Dense housing makes buses viable and trips shorter, which reduces car use.','makes...and...which','合併兩條機制'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者對鼓勵人們住在城市持甚麼立場？',['完全同意，理由是公共交通更可行，日常行程也較短','完全反對，認為人口集中只會增加所有車程','只討論城市公園數目而不談交通問題','認為所有鄉村居民都已可直接乘地鐵上班'],'引言用 because 並列公共交通及距離兩個理由。'),quiz('兩個主體段分別處理甚麼機制？',['人口密度支撐公共交通；目的地較近減少不必要車程','第一段只談地鐵票價，第二段只談巴士顏色','兩段都只重複鄉村生活安靜這個優點','先談停車場裝飾，再談商店招牌設計'],'第一段談服務可行性，第二段談行程距離。')];
const route=[sequence('由人口密度到車程減少',[
['引言：同意集中居住','城市生活可改善交通效率並縮短日常旅程。'],['理由一：密度支撐公共交通','足夠乘客使鐵路、巴士、電車和單車徑值得投資。'],['對比郊區與具體例子','住宅分散使服務昂貴不便，居民更多時候需駕車。'],['理由二：目的地更近','工作、學校、醫院和商店可步行騎車或短途到達。'],['減少多餘車程','短途不需開車，擠塞、燃料和泊車壓力或逐漸下降。'],['結尾：兩條機制合一','公共交通更可行且行程更短，從源頭處理擠塞。']],
'先說人口密度支持服務，再說接近目的地如何減少行車需求。')];
const evidence=[quiz('為何人口集中可支持公共交通投資？',['每天有較多乘客使用，讓鐵路及巴士更值得營運','人口集中本身保證每班車都免費','政府只要建路線就完全不需考慮使用量','郊區住宅分散時巴士必然更方便營運'],'since 後解釋乘客量如何支撐投資。'),quiz('郊區或村莊住宅分散帶來甚麼交通後果？',['公共交通較貴且不便，居民可能更依賴汽車','所有居民都必然可步行到地鐵站','住宅愈分散，鐵路營運成本必然愈低','只要住在村莊，便不會有任何日常出行'],'原文由服務成本與便利推到駕車選擇。'),quiz('兩位上班族的對照想展示甚麼？',['近地鐵者可不用車；偏遠者連小事也可能需要駕車','同一地區所有上班族都會選相同交通方式','偏遠居民只要想購物就必須立即搬家','地鐵站旁的居民也必然要長途開車'],'whereas 對比可及性。'),quiz('作者說交通問題不單由「車輛」造成，重點是甚麼？',['不必要的車程；目的地較近便可減少駕車需要','所有汽車都只在停泊時造成擠塞','城市中車輛數量從來沒有任何影響','只要換車的顏色便能消除擠塞'],'原文將目光由車輛本身轉向行程需求。'),quiz('哪些設施可因規劃良好而較近？',['工作、學校、醫院、商店與娛樂場所','只有機場與長途火車站','只有駕駛學校和大型車廠','所有目的地都必然位於同一幢大樓'],'原文列出多種日常目的地。'),quiz('作者如何看待鄉村生活？',['承認有空間與寧靜，但指出小事也可能要開車','否認鄉村可能提供任何生活優點','說住在鄉村的人永遠不需駕車','認為寧靜生活已保證沒有交通問題'],'may offer...but 是讓步後指出交通代價。')];
const logic=[sequence('人口密度如何支撐公共交通',[
['更多住戶住得接近','每天可有足夠乘客使用服務。'],['投資鐵路巴士更合理','乘客量支撐營運。'],['郊區分散形成對照','路線貴又不便，居民常被迫駕車。'],['共享服務減少個人負擔','近站者可不用增加路面車輛。']],
'第一條論證把居住密度連到服務使用量和駕車需要。'),sequence('較短距離如何減少車程',[
['目的地位於較近範圍','工作、學校、商店可步行騎車或短途抵達。'],['小事不必每次開車','不必要車程減少。'],['汽車需求下降','路面車輛及泊車需求可能較少。'],['長遠多面改善','擠塞、燃料使用和污染可能下降。']],
'第二條論證關心不必要行程，而非只看車輛本身。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('一條郊區巴士路線沿途住戶很少，每日乘客不足。','哪項機制最貼近範文？',['乘客太少令班次難維持，居民更依賴私家車','乘客少可減擠迫，巴士班次因此更易加密','沿途住戶少，居民出行需求可先不計','加大巴士車身，便能補上班次不足問題'],['低密度削弱營運可行性。','乘客少可能令班次難維持。','住戶少也可能有必需出行。','車身較大未必改善班次。'],[3,4,5,6],'原文說低密度令服務貴而不便。'),
t('市中心新住宅旁已有鐵路站，新增住戶每天都乘車上班。','哪項投資理由最符合範文？',['更多日常乘客可支持公共交通持續營運','住戶增加有助鐵路，但不用查是否實際乘搭','鐵路使用增加，主因可先看站外建築外觀','居民多能支持班次，卻不必考慮服務可靠度'],['使用量是 since 後的關鍵。','需看住戶是否實際乘搭。','外觀不是載客量原因。','服務可靠度也影響持續使用。'],[3,4],'原文以每日乘客量解釋投資理由。'),
t('一名上班族住在地鐵附近，另一人住在遠郊。','哪項比較最貼近文章例子？',['前者較易不用車，後者連小事也可能要駕車','地鐵附近較方便，遠郊也可依賴同樣班次','兩人住處不同，但只需比較車款與車價','遠郊住戶有車，便不必評估日常距離'],['原文比較兩者可及性。','遠郊往往沒有同等班次。','車款車價未說明可及性。','日常距離正是駕車需要。'],[7],'原文用 whereas 對比兩種住處。'),
t('社區把診所和商店設在步行範圍內，居民減少短途開車。','文章第二段會如何解釋？',['目的地較近，不必要車程可由步行取代','目的地較近，可減車程，但先不改善步行環境','診所鄰近能省時間，商店仍須經常駕車','居民短途走路後，可暫不看公共交通服務'],['第二條機制是較短距離減少車程。','步行環境也要可用。','商店亦在步行範圍。','公共交通仍有其他旅程用途。'],[9,10,11,12],'原文把目的地距離連到車程需求。'),
t('一篇作文只說「車輛造成擠塞」，沒有分析為何人們開車。','如何依範文補充？',['檢查哪些車程可由步行或短途乘車取代','先查駕車距離，目的地需要可留待後面再談','把不同車程合併分析，不分短途與長途','只改善停車場，居民出行理由不用分析'],['原文重點是 unnecessary vehicle journeys。','出行目的有助找可替代車程。','短途較可能改步行。','停車改善可能未減駕駛。'],[10,11,12],'原文更正單純歸咎車輛的說法。'),
t('鄉村住宅空間充足，但家庭買日用品每次都要開車。','哪項平衡判斷與範文一致？',['承認空間優點，也指出小事常變成汽車行程','鄉村空間充足，可先忽略採買時的車程','日用品需開車，便可說鄉村生活沒有好處','把日用品送到家中，便不用再看交通條件'],['may offer...but 同時保留優點和代價。','空間好處與交通代價要一起看。','有交通缺點不等於沒有其他好處。','配送仍依賴交通系統。'],[14],'原文承認空間與寧靜，再指出小事要開車。'),
t('一間學校把課室和圖書館設在同一校區，學生不用搭車穿梭。','可轉用哪項一般邏輯？',['所需地方較近，便可減少不必要的往返車程','所需地方較近，但只看校園外車輛數量','校內少了接送，便不需規劃其他出入口','課室圖書館同區，仍要安排學生繞遠路'],['接近目的地減少多餘出行。','校內配置直接減少往返需求。','仍需整體規劃。','繞路會抵消位置相近的好處。'],[9,10,11,12],'原文把目的地距離和車程需求連起來。'),
t('地區擴建單車徑後，更多居民騎車去附近商店。','文章可能預期哪項長期結果？',['短途駕車減少，擠塞與燃料使用或逐步下降','單車徑讓人騎車，汽車行程仍可不變','短途騎車增加，卻不必檢查燃料使用','騎車取代短途開車，擠塞可留待日後再看'],['Over time 指累積成效。','若取代短途開車，車程可減。','燃料是所問環境結果。','擠塞亦是作者分析的影響。'],[12,13],'原文由少用車推到長期多項改善。'),
t('城市政府想同時改善交通服務與居民出行距離。','哪項組合最貼近範文？',['住戶集中可支持交通，亦使目的地更近','只增加住戶，不查是否使用公共交通','只建巴士站，不看常用目的地是否更近','只縮短目的地距離，不安排可靠交通班次'],['結尾合併兩條機制。','人數要連到使用與服務。','常用目的地距離是另一條路徑。','可靠班次與距離可並行。'],[3,4,9,10,16],'原文結尾合併服務可行性和短行程。'),
t('題目問鼓勵住城是否可改善交通，學生只談地鐵卻沒談出行需求。','還應補哪一條理由？',['城市目的地較近，可減不必要的車程','只介紹地鐵班次，不問居民是否仍需開車','只說鄉村較寧靜，未比較城市目的地','只列車輛類別，不分析短途出行需要'],['原文第二段提供距離機制。','題目還需談出行需求。','鄉村寧靜未回答城市交通。','類別清單不說明需要。'],[9,10,11,12],'原文兩個主體段分工不同。'),
];
export default {key:'opinion:97',meta:{topic:'鼓勵城市居住以改善交通問題',summary:'範文以人口密度支撐公共交通，以及日常目的地較近能減少不必要車程兩條機制，支持集中城市居住。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
