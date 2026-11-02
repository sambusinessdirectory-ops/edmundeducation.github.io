// Digital communication versus face-to-face contact, 15 complete grouped sentences.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:5'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'At work and at home, more people now talk through digital tools instead of meeting in person.',
 'Digital talk may make relationships weaker and cause people to get the wrong meaning. Still, I think its good points are greater because it is quicker and helps people stay in touch across long distances.',
 'The main good point of digital communication is that it is quick and easy.',
 'At work, email, chat and video calls mean people do not need to travel and can make decisions almost at once.',
 'This helps companies reply faster, spend less money and work easily with teams in different places.',
 'For example, a manager can solve a problem with coworkers overseas in one video meeting instead of waiting days to meet them.',
 'Families and friends benefit too: people who live far away can call or send messages every day and keep their relationships strong.',
 'But digital talk also has problems. The biggest is that it shows feelings less clearly.',
 'When people meet in person, voice, faces and body movements help them understand each other, care about others and build trust.',
 'Without these signs, a message is easier to understand wrongly. A short email can seem unfriendly even when the writer did not mean to upset anyone.',
 'This matters a lot at work, where leaders, people making agreements and teams need trust and careful understanding.',
 'Using screens too much for a long time may also make social contact less deep.',
 'People can send many messages but still feel alone, because frequent online contact is not the same as someone giving them real time and attention.',
 'To sum up, digital communication saves time and helps people reach one another, but it can make talk less deep and less clear.',
 'Overall, I think the good points are greater because digital tools let people at work and at home communicate well across time and distance.',
];
const vocabulary=[
 v(['working life and private life','At work and at home','工作與私人生活'],['growing proportion','more people now','比例日增'],['conducted through digital technology','talk through digital tools','透過數碼科技交流'],['face-to-face interaction','meeting in person','面對面互動']),
 v(['weaken the quality of human relationships','make relationships weaker','削弱人際關係品質'],['risk of misunderstanding','get the wrong meaning','誤解風險'],['advantages are greater overall','good points are greater','整體優點較重'],['far more efficient','quicker','效率更高'],['despite geographical separation','across long distances','即使相隔兩地']),
 v(['main benefit','main good point','主要好處'],['technology-based communication','digital communication','科技交流'],['speed and convenience','quick and easy','快速方便']),
 v(['professional settings','At work','職場情境'],['video conferencing','video calls','視像會議'],['remove the need for travel','do not need to travel','不用出行'],['almost immediately','almost at once','幾乎即時']),
 v(['shortens response times','reply faster','縮短回應時間'],['reduces operating costs','spend less money','降低營運成本'],['coordinate teams across different cities or even continents','work easily with teams in different places','協調異地團隊']),
 v(['For instance','For example','例如'],['resolve a production issue','solve a problem','解決生產問題'],['overseas colleagues','coworkers overseas','海外同事'],['in a single online meeting','in one video meeting','一次線上會議'],['rather than waiting days','instead of waiting days','不用等數天']),
 v(['same principle applies socially','Families and friends benefit too','同一原則也適用社交'],['live far apart','live far away','相隔很遠'],['speak daily','call or send messages every day','每天交談'],['maintaining close relationships','keep their relationships strong','維持親密關係']),
 v(['Nevertheless','But','儘管如此'],['important drawbacks','problems','重要缺點'],['most serious','biggest','最嚴重'],['lack of emotional richness','shows feelings less clearly','情感表達不足']),
 v(['Face-to-face conversation','When people meet in person','面對面交談'],['facial expression and body language','faces and body movements','面部表情與身體語言'],['interpret meaning accurately','understand each other','準確理解意思'],['show empathy','care about others','表達同理心'],['build trust','build trust','建立信任']),
 v(['these cues disappear','Without these signs','缺少非語言線索'],['more easily misread','easier to understand wrongly','更易讀錯'],['brief email or text','short email','簡短電郵或訊息'],['cold or hostile','unfriendly','冷漠或敵意'],['no offence was intended','did not mean to upset anyone','無意冒犯']),
 v(['especially problematic','matters a lot','特別成問題'],['workplaces','at work','職場'],['trust and nuance','trust and careful understanding','信任與細微分寸'],['leadership, negotiation and teamwork','leaders, people making agreements and teams','領導、談判與團隊合作']),
 v(['Over time','for a long time','久而久之'],['heavy reliance on screens','Using screens too much','過度依賴螢幕'],['shallow social habits','social contact less deep','淺薄社交習慣']),
 v(['constantly in contact online','send many messages','時常網上聯絡'],['feel isolated','feel alone','感到孤立'],['frequent messaging','frequent online contact','頻繁傳訊'],['genuine attention and human presence','real time and attention','真正關注與人在場']),
 v(['In conclusion','To sum up','總結'],['efficiency and accessibility','saves time and helps people reach one another','效率與可接觸性'],['reduce the depth and clarity','make talk less deep and less clear','削弱深度與清晰度']),
 v(['benefits outweigh the disadvantages','good points are greater','好處勝過缺點'],['digital tools','digital tools','數碼工具'],['professional and personal communication','people at work and at home','職場與私人交流'],['across time and distance','across time and distance','跨時間與距離']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In both working life and private life, a growing proportion of conversations is now conducted through digital technology instead of face-to-face interaction.',d:[2,7,11],relation:'引言清楚交代職場／私人生活及數碼交流與面談的替代關係',formula:'In both working life and private life, [交流類型] is now conducted through digital technology instead of face-to-face interaction',meaning:'職場及私人交流愈來愈多透過科技，而非面對面。',usage:'背景句先界定兩種交流形式與場景，不先宣稱哪種較好。',links:['In both working life and private life, ', ' is now conducted through digital technology instead of face-to-face interaction.'],labels:['交流趨勢']},
 {example:'Although online classes can reduce face-to-face contact, I believe their advantages are greater overall because they let distant students learn and save travel time.',d:[0,7,13],relation:'先承認弊端，再以 because 給出有條件的整體判斷',formula:'Although [弊端], I believe [整體立場] because [兩個理由]',meaning:'數碼交流可能削弱關係或引起誤解，但更有效率並可跨地域保持聯繫。',usage:'立場必須回應前面承認的風險，不能把風險消去。',links:['Although ', ', I believe ', ' because ','.'],labels:['弊端','整體判斷','理由']},
 {example:'The main benefit of technology-based communication is flexible timing and easy record keeping.',d:[0,7,11],relation:'用主題句點出科技交流的一項核心好處',formula:'The main benefit of technology-based communication is [核心好處]',meaning:'主要好處是快和方便。',usage:'下句要以工具、場景和可見結果支持「快和方便」。',links:['The main benefit of technology-based communication is ','.'],labels:['核心好處']},
 {example:'In professional settings, shared workspaces and video calls remove the need for travel and allow decisions to be made almost immediately.',d:[2,8,11],relation:'職場情境中從工具寫到免出行與即時決策',formula:'In professional settings, [數碼工具] remove the need for travel and allow decisions to be made almost immediately',meaning:'電郵、訊息平台、視像會議縮短等待和出差。',usage:'工具要與不用出行及更快決策的機制相符。',links:['In professional settings, ', ' remove the need for travel and allow decisions to be made almost immediately.'],labels:['具體工具']},
 {example:'This shortens response times, reduces operating costs and enables companies to serve customers in different time zones with remarkable ease.',d:[3,9,12],relation:'以 This 回指數碼工具，再列時間、成本、跨地協調結果',formula:'This shortens response times, reduces operating costs and enables companies to [跨地合作結果] with remarkable ease',meaning:'更快回應、節省營運成本，容易協調跨城市或洲的團隊。',usage:'This 必須回指上句的工具及免出行；三種結果要有因果連接。',links:['This shortens response times, reduces operating costs and enables companies to ', ' with remarkable ease.'],labels:['跨地工作']},
 {example:'For instance, a manager can confirm a delivery schedule with overseas colleagues in a single online meeting rather than waiting days for an in-person discussion.',d:[4,8,12],relation:'用一次跨國線上會議實例證明省時間',formula:'For instance, a manager can [遠距解決的工作] in a single online meeting rather than waiting days for an in-person discussion',meaning:'經理一次線上會議便解決海外生產問題，不必等數天面談。',usage:'例子應有工作問題、遠距同事及時間比較。',links:['For instance, a manager can ', ' in a single online meeting rather than waiting days for an in-person discussion.'],labels:['遠距解決的工作']},
 {example:'The same principle applies socially: siblings and friends who live far apart can speak daily through calls and messages, thereby maintaining close relationships that might otherwise weaken over time.',d:[2,10,13],relation:'從職場轉向親友，展示相隔兩地仍可保持聯繫',formula:'The same principle applies socially: [親友] who live far apart can speak daily through calls and messages, thereby maintaining close relationships',meaning:'遠方家人朋友可每日通話傳訊，維持本可能疏遠的關係。',usage:'same principle 是跨距離交流的便利；社交好處仍需具體人物與頻率。',links:['The same principle applies socially: ', ' who live far apart can speak daily through calls and messages, thereby maintaining close relationships that might otherwise weaken over time.'],labels:['親友']},
 {example:'Nevertheless, digital communication has important drawbacks, the most serious of which is the risk of misunderstanding.',d:[2,10,11],relation:'明確轉折並指出最重要的不足',formula:'Nevertheless, digital communication has important drawbacks, the most serious of which is [核心缺點]',meaning:'最嚴重的問題是情感層次不足。',usage:'最嚴重是作者的論證排序，後文須解釋非語言線索和信任。',links:['Nevertheless, digital communication has important drawbacks, the most serious of which is ','.'],labels:['核心缺點']},
 {example:'Face-to-face conversation conveys warmth, hesitation and concern, which help people respond with care and build trust.',d:[3,10,13],relation:'用 which 說明面談線索怎樣支援理解與信任',formula:'Face-to-face conversation conveys [可見可聽線索], which help people [理解及建立關係]',meaning:'語氣、表情、肢體語言協助準確理解、表達同理及建立信任。',usage:'which 回指前面一組線索；不能說單純面談就保證沒有誤會。',links:['Face-to-face conversation conveys ', ', which help people ','.'],labels:['非語言線索','它們帶來的幫助']},
 {example:'When these cues disappear, intentions are more easily misread; a short email, for example, may sound cold or hostile even when no offence was intended.',d:[4,8,11],relation:'用分號把缺少線索的一般後果接到簡短訊息例子',formula:'When these cues disappear, [一般誤讀後果]; [簡訊例子] may sound cold or hostile even when no offence was intended',meaning:'無表情語氣時，文字更易讀錯；本無惡意的短電郵亦可能顯冷漠。',usage:'may 指讀者可能誤讀，不是寫者確實敵意；分號前後要是同一關係。',links:['When these cues disappear, ', '; ', ' may sound cold or hostile even when no offence was intended.'],labels:['一般後果','例子']},
 {example:'This is especially problematic in workplaces, where clear intent and trust are essential for negotiation and teamwork.',d:[2,7,12],relation:'由一般誤讀風險指出職場高信任情境更敏感',formula:'This is especially problematic in workplaces, where [條件] are essential for [工作活動]',meaning:'領導、談判、團隊合作特別需要信任與細緻理解。',usage:'This 回指線索缺失的誤讀，而非整個科技交流都毫無用處。',links:['This is especially problematic in workplaces, where ', ' are essential for ','.'],labels:['必要條件','職場活動']},
 {example:'Over time, heavy reliance on screens may also reduce opportunities for careful listening.',d:[2,8,13],relation:'補充長期過度用螢幕可能形成淺薄社交習慣',formula:'Over time, heavy reliance on screens may also [較長期社交影響]',meaning:'長期高度依賴螢幕或令社交習慣變淺。',usage:'heavy reliance 是條件，may 保留可能性；不是所有線上交流都淺薄。',links:['Over time, heavy reliance on screens may also ','.'],labels:['長期影響']},
 {example:'People can remain constantly in contact online yet still feel isolated, because a quick reply is not the same as genuine attention and human presence.',d:[4,9,11],relation:'用 yet／because 區分聯絡頻率和真正被關注',formula:'People can remain constantly in contact online yet still feel isolated, because [頻繁接觸] is not the same as [真正在場]',meaning:'即使常傳訊仍可能孤單；頻率不等於真實關注與人在場。',usage:'不要把「聯絡多」直接當「關係深」的證據。',links:['People can remain constantly in contact online yet still feel isolated, because ', ' is not the same as ','.'],labels:['表面聯絡','深度關注']},
 {example:'In conclusion, communicating through technology offers clear advantages in terms of flexibility and low cost, even though it may weaken trust in sensitive discussions.',d:[1,7,12],relation:'結論中同時回顧效率收益與深度／清晰度代價',formula:'In conclusion, communicating through technology offers clear advantages in terms of [兩好處], even though it may [核心弊端]',meaning:'科技交流更有效率且易接觸，但互動或較不深刻、較易誤讀。',usage:'先公平回顧正文的利與弊，再落到最終權衡。',links:['In conclusion, communicating through technology offers clear advantages in terms of ', ', even though it may ','.'],labels:['兩好處','核心弊端']},
 {example:'Overall, I believe the benefits outweigh the disadvantages because digital tools allow families and colleagues to stay connected when travel is not possible.',d:[1,9,13],relation:'以 because 把跨時間與距離的核心收益連到最終比較結論',formula:'Overall, I believe the benefits outweigh the disadvantages because [最有力的已論證理由]',meaning:'科技工具讓職場與私人交流跨時間、距離有效進行，因此作者認為優點勝。',usage:'outweigh 是整篇權衡，不因個別簡訊誤解就否定全部數碼交流。',links:['Overall, I believe the benefits outweigh the disadvantages because ','.'],labels:['核心理由']},
];
const usageGuides=[
 '當你要用 instead of 對比某活動的新形式與舊形式時。',
 '當你要用 Although 承認弊端，再清楚給出整體立場和兩項理由時。',
 '當你要在主題句先概括一項做法最主要的好處時。',
 '當你要在一個具體場景列出工具，再說明它如何節省步驟或時間時。',
 '當你要用 This 回指前句的做法，並列出數項相連的結果時。',
 '當你要以一個具體情境，用 rather than 對比新舊做法所需時間時。',
 '當你要用 The same principle 把上一種好處轉用到另一個生活場景時。',
 '當你要用 Nevertheless 從好處轉到缺點，並指出哪項缺點最值得分析時。',
 '當你要先列出一組可觀察線索，再用 which 解釋它們共同的作用時。',
 '當你要用 When 說明某些線索缺失的後果，並用分號接一個相關例子時。',
 '當你要用 This 回指上一句的問題，再說明它在甚麼場合尤其重要時。',
 '當你要用 Over time 說明長期依賴某做法可能逐漸產生的影響時。',
 '當你要用 yet 對照表面上持續發生的事與實際感受，再以 because 解釋原因時。',
 '當你要在結論中同時概括主要好處與已承認的代價時。',
 '當你要用 because 回到正文最有力的理由，支持最後的利弊比較時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分開職場與親友用途，再辨速度、情緒線索與社交深度。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('題目比較哪兩種交流方式？',['透過科技交流與面對面互動','打字與手寫考試','網購與實體購物','開車與乘車'],'題目明說 technology rather than being face to face。'),
 {type:'multi',prompt:'範文同時論證哪兩個層面？',detail:'選兩項，再按「確認」。',options:['職場可更快協調跨地團隊','遠方親友可維持聯繫，但訊息可能缺少情緒線索','任何文字訊息都必然帶敵意','所有科技交流都比面談更深刻'],correct:[0,1],why:'職場效率和私人連結是好處，誤讀和淺薄是風險。'},
];
const route=[sequence('依範文重排數碼交流利弊論證',[
 ['引言','科技取代部分面談；承認誤解及關係風險，表明整體優點較大。'],
 ['職場好處','電郵、訊息、視像免出行，加快決策並降低成本；海外經理例子。'],
 ['社交好處','遠方家人朋友可每日交談，維持聯繫。'],
 ['弊端','少語氣表情肢體線索，訊息易誤讀；長期只靠螢幕可令接觸淺薄。'],
 ['結論','回顧效率／可接觸性和深度／清晰度，再判斷跨時空收益較重。'],
 ],'不要把「訊息可保持聯繫」寫成「訊息可完全取代人在場」。')];
const evidence=[
 quiz('一次跨國視像會議的經理例子支持哪個好處？',['免出行等待，更快處理職場問題','會議保證沒有任何誤解','所有公司不再有營運成本','親友關係一定變深'],'例子落實速度、便利和跨地協作。'),
 quiz('遠方親友每日通話的例子支持甚麼？',['地理相隔時仍可維持聯繫','頻繁訊息必然等於親身陪伴','只有職場才需要科技','面談完全沒有好處'],'同一跨距離原則延伸到社交。'),
 quiz('面對面交流可提供哪三類線索？',['語氣、面部表情、肢體語言','價格、物流、售後服務','學費、考試、課程','公里、年份、百分比'],'這些非語言線索有助理解、同理和信任。'),
 quiz('為何短電郵可能顯得冷漠？',['缺少語氣表情，收件者可能誤讀，即使寄件者無惡意','寄件者必然懷有敵意','任何電郵都不能傳達事實','只要字數少就一定造成爭吵'],'原文用 may 且明說 no offence intended。'),
 quiz('為何常在線仍可能孤單？',['頻繁傳訊不等於被真正關注或有人陪伴','所有網上朋友都不真實','每日聯絡必定造成孤立','螢幕可自動消除孤獨'],'原文區分聯絡頻率與關係品質。'),
];
const logic=[
 sequence('科技交流的兩條效率鏈',[
  ['職場工具','電郵、即時訊息、視像會議。'],['工作結果','免出行、快決策、低成本、跨地協作。'],
  ['親友工具','通話與訊息。'],['社交結果','遠方親友可經常聯絡，關係不必因距離而自然疏遠。'],
 ],'同一跨距離工具在職場和社交各有不同可見好處。'),
 sequence('理解與親密感的兩條風險鏈',[
  ['線索流失','文字少語氣、面部表情及肢體語言。'],['理解風險','本無惡意的短訊也可能被誤讀。'],
  ['過度依賴','長期以螢幕取代較深的互動。'],['關係風險','常傳訊仍可缺少真正關注與人在場。'],
 ],'可傳達訊息與可承載深度關係不是同一件事。'),
];
const transfers=[
 transfer('另一題：公司用視像會議取代部分出差。','哪句先公平預告利弊？',['視像可加快跨地決策，但缺少現場線索也可能造成誤解。','視像會議能保證所有人永不誤會。','出差一定毫無用途。','科技交流只有情緒問題，沒有工作好處。'],['效率與理解風險同時呈現。','過度保證。','以偏概全。','忽略速度。'],[1,3,8],'原文 although relationship/misunderstanding risks，advantages efficiency/connectivity。'),
 transfer('兩地主管需在當天解決排程問題。','哪句把工具連到速度好處？',['主管可即時視像討論排程，毋須先花數天安排出差。','只要開視像，問題便不用討論。','主管必須先跨國飛行才能見面。','視像會議可保證生產永不出錯。'],['工具→免出行→更快處理。','仍需討論。','違背情境。','過度保證。'],[3,5],'原文 video conferencing removes travel，one meeting resolves issue。'),
 transfer('一間企業需要協調三個城市的團隊。','哪句完整說出營運收益？',['線上工具讓回應更快、出差成本更低，也方便跨城市合作。','跨城市合作必定需要租更多辦公室。','團隊只要有訊息平台就完全不需管理。','降低出差成本必然等於沒有任何成本。'],['時間、成本、協調三項各有位置。','無此必然。','仍需協調。','成本不會歸零。'],[4],'原文 shortens response times，reduces costs，coordinates teams。'),
 transfer('祖父母與外地子女相隔千里，平日不能見面。','哪句把跨距離原則轉到社交？',['定期通話與傳訊可幫助他們保持聯繫，減少因距離疏遠的機會。','住得遠便不可能保持任何關係。','每日通話保證關係一定完美。','只有職場交流才可用視像。'],['工具及維繫關係的可能效果清楚。','可遠距聯繫。','過度保證。','社交也可用。'],[6],'原文 same principle applies socially，far-apart relatives speak daily。'),
 transfer('一名主管以文字通知同事，對方誤以為她在責怪自己。','哪句說明可能的缺失線索？',['文字缺少語氣與表情，收件者或會誤讀原本無惡意的話。','收件者誤讀證明主管必然惡意。','文字永遠無法傳達工作資訊。','面談的肢體語言毫無作用。'],['線索缺失→可能誤解，保留寄件者原意。','不等於惡意。','過度絕對。','可幫助理解。'],[8,9],'原文 cues disappear→message misread even when no offence intended。'),
 transfer('團隊正商議敏感的合作條款。','哪句說明面談線索在職場更重要？',['談判與合作需要信任和細微理解，因此只靠短訊可能較易誤會。','談判只需比較字數。','有視像便不需任何信任。','所有敏感議題都必須停止交流。'],['把 trust/nuance 連到 negotiation/teamwork。','無關。','仍需信任。','不合理。'],[10],'原文 workplaces trust and nuance essential for negotiation/teamwork。'),
 transfer('某人每天發很多訊息，卻仍覺得沒有人真正聆聽。','哪句區分聯絡次數與關係深度？',['訊息頻繁不等於獲得真正關注或有人陪伴。','發訊息越多就必定越不孤單。','感到孤單證明所有網上交流毫無價值。','每日傳訊等於每天面談。'],['原文核心區分完整。','過度保證。','以偏概全。','形式不同。'],[11,12],'原文 frequent messaging is not genuine attention/human presence。'),
 transfer('科技服務用起來方便，但使用者可能失去部分情感交流。','哪句結論公平回顧兩面？',['科技帶來效率和可接觸性，但也可能削弱互動的深度與清晰度。','科技有速度，所以絕無任何缺點。','有誤解風險，所以必須停止所有科技交流。','效率與關係品質完全是同一指標。'],['兩面各有具體內容。','忽略風險。','過度反應。','量度不同。'],[13],'原文 conclusion efficiency/accessibility despite depth/clarity cost。'),
 transfer('某組織希望跨時區與外地成員保持日常協作。','哪句可作有根據的整體判斷？',['若已權衡誤解風險，仍可說跨時區和距離的有效聯絡使優點較重。','跨時區交流完全不可能出錯。','只要有聊天軟件，所有合作必然成功。','面談在任何情境都沒有價值。'],['承認風險後回到已論證的跨距離收益。','過度絕對。','無此保證。','面談線索有價值。'],[14],'原文 benefits outweigh because communication works across time and distance。'),
 transfer('一條企業訊息在文字中顯得尖銳，但發訊者本無惡意。','哪句避免把讀者感受誤作發訊者意圖？',['訊息可能被讀成冷淡或帶敵意，卻不表示發訊者原本想冒犯。','收件者感到不快證明發訊者必然有惡意。','沒有表情便無法傳送任何內容。','發訊者沒有惡意，所以不可能造成誤會。'],['感受、推斷與意圖分開。','不能據此判斷意圖。','仍可傳內容。','可無意誤會。'],[9],'原文 may sound cold/hostile even when no offence intended。'),
];
export default {key:'advantage-disadvantage:5',meta:{topic:'數碼交流相對面對面互動的利弊',summary:'科技交流可免出行、加快跨地工作並維持遠方親友聯繫；文字缺少語氣與表情時易誤讀，過度依賴螢幕亦可能使關係淺薄。作者承認風險後，判斷跨時間和距離的效率及可接觸性更重要。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
