// Heritage tourism: visitor-pressure controls and ring-fenced preservation funding.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:43'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Tourism has made many old places easier to visit than before, but it has also put a lot of pressure on some very easily damaged buildings and sites.',
 'If old walls, temples or monuments are damaged for good, we cannot simply build new ones with the same value to culture.',
 'To stop this, governments and groups that look after old places should both manage what visitors do and set up a lasting way to care for these places.',
 'The first and most urgent step is to reduce how much use easily damaged sites have to take.',
 'Many old attractions are hurt because thousands of people walk, touch, climb and fill the same small areas every day, rather than because one visitor is careless.',
 'So officials should sell tickets for set times, set a daily maximum number of visitors, create safe paths and keep people out of the most easily damaged areas.',
 'For example, if visitors look at an old temple from a set path rather than walk all through it, the risks of its surface wearing away, accidental harm and too many people in one place become much lower.',
 'People could still enjoy old cultural places; in fact, they could visit them without slowly damaging them.',
 'Another important answer is to use money from tourism directly to look after old places.',
 'Money from entry tickets and tourism charges should pay only for repairs, trained workers, equipment that protects buildings and checks for damage over the years.',
 'Also, tour companies should teach visitors the rules before they enter places that can easily be harmed, while people who break rules, take objects or damage property should face large fines.',
 'Signs on their own are often not enough; people need to know why rules exist, and the rules must be put into practice.',
 'When visitors know a site holds history that belongs to everyone, rather than just a place for another photo, they may be more careful.',
 'To sum up, we can care for old sites by reducing too many visitors and using tourism money for care over many years.',
 'Tourism should help people see the past, not make it impossible for future people to see it.',
];
const vocabulary=[
 v(['historic places','old places','歷史場所'],['more accessible','easier to visit','更易到訪'],['fragile buildings','easily damaged buildings','脆弱建築'],['under severe pressure','a lot of pressure','承受沉重壓力']),
 v(['Once','If','一旦'],['permanently damaged','damaged for good','永久損壞'],['rebuilt','build new ones','重建'],['cultural value','value to culture','文化價值']),
 v(['To prevent this','To stop this','為防止此事'],['heritage authorities','groups that look after old places','保育機構'],['controlling visitor behaviour','manage what visitors do','控制遊客行為'],['stable system for conservation','lasting way to care for these places','穩定保育制度']),
 v(['most immediate measure','most urgent step','最迫切措施'],['limit','reduce','限制'],['physical pressure','how much use','實際壓力'],['vulnerable sites','easily damaged sites','脆弱遺址']),
 v(['historic attractions','old attractions','歷史景點'],['thousands of people','thousands of people','成千上萬人'],['crowding','fill','擠擁'],['one careless visitor','one visitor is careless','一名粗心遊客']),
 v(['For this reason','So','正因如此'],['timed tickets','tickets for set times','限時門票'],['daily visitor limits','daily maximum number of visitors','每日人數上限'],['protected walking routes','safe paths','受保護路徑'],['restricted zones','keep people out','限制區域']),
 v(['controlled path','set path','受管制路徑'],['instead of','rather than','而非'],['erosion','surface wearing away','侵蝕'],['accidental damage','accidental harm','意外損壞'],['overcrowding','too many people in one place','過度擁擠']),
 v(['cultural heritage','old cultural places','文化遺產'],['rather','in fact','反而'],['experience it','visit them','體驗它'],['without slowly destroying it','without slowly damaging them','避免慢慢破壞']),
 v(['Another important solution','Another important answer','另一重要方法'],['directly fund','use money from tourism directly','直接資助'],['preservation','look after old places','保育']),
 v(['Entrance fees','entry tickets','入場費'],['conservation charges','tourism charges','保育費'],['specifically','only','專門'],['employ trained staff','trained workers','聘受訓員工'],['monitor damage over time','checks for damage over the years','長期監察損壞']),
 v(['At the same time','Also','同時'],['tour operators','tour companies','旅行社'],['educate visitors','teach visitors','教育遊客'],['sensitive sites','places that can easily be harmed','敏感遺址'],['strict fines','large fines','嚴厲罰款'],['vandalise property','damage property','破壞財物']),
 v(['Clear signs alone','Signs on their own','單靠標示'],['not enough','not enough','不足夠'],['explanation','know why rules exist','解釋'],['enforcement','put into practice','執行']),
 v(['shared history','history that belongs to everyone','共同歷史'],['rather than','rather than','而不是'],['photo opportunity','place for another photo','拍照機會'],['behave responsibly','be more careful','負責任行事']),
 v(['In conclusion','To sum up','總結'],['historic sites','old sites','歷史遺址'],['reducing excessive visitor pressure','reducing too many visitors','減少過度遊客壓力'],['tourism revenue','tourism money','旅遊收入'],['long-term conservation','care over many years','長期保育']),
 v(['open a window onto the past','help people see the past','打開通往過去的窗'],['not close it forever','not make it impossible for future people to see it','不要永遠關閉']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Online shopping has made many local products more accessible than ever, but it has also placed small shops under severe pressure.',d:[1,3,8],relation:'but 對照可及性與對脆弱對象的壓力',formula:'[新趨勢] has made [對象] more accessible than ever, but it has also placed [脆弱對象] under severe pressure',meaning:'旅遊更易接觸歷史遺址，但亦給脆弱遺址沉重壓力。',links:[' has made ', ' more accessible than ever, but it has also placed ', ' under severe pressure.'],labels:['新趨勢','更易接觸的對象','承受壓力者']},
 {example:'Once ancient paintings are permanently damaged, they cannot simply be rebuilt with the same cultural value.',d:[0,3,8],relation:'Once 警示不可逆損壞和文化價值不能複製',formula:'Once [文物] is permanently damaged, it cannot simply be rebuilt with the same cultural value',meaning:'永久損壞的古牆、寺廟和紀念物無法原值重建。',links:['Once ', ' are permanently damaged, they cannot simply be rebuilt with the same cultural value.'],labels:['受損文物']},
 {example:'To prevent this, councils and park managers should focus on both reducing litter and creating a stable system for conservation.',d:[0,4,9],relation:'To prevent this 接雙措施，both ... and ... 並列即時管理與長期制度',formula:'To prevent this, [負責者] should focus on both [即時控制] and creating a stable system for conservation',meaning:'政府與保育機構要同時管理行為和建立穩定保育制度。',links:['To prevent this, ', ' should focus on both ', ' and creating a stable system for conservation.'],labels:['負責者','需要控制的行為']},
 {example:'The first and most immediate measure is to limit the physical pressure placed on a crowded beach.',d:[2,8,13],relation:'主題句先提出降低實體使用壓力',formula:'The first and most immediate measure is to limit the physical pressure placed on [脆弱地方]',meaning:'第一個直接措施是降低脆弱遺址的實體壓力。',links:['The first and most immediate measure is to limit the physical pressure placed on '],labels:['受壓地點']},
 {example:'Many village paths are damaged not by one careless visitor, but by crowds walking over them every morning.',d:[2,6,9],relation:'not by one ... but by ... 區分個別疏忽與累積人流',formula:'[場所] are damaged not by one careless visitor, but by [大量重複行動]',meaning:'每天大量踩踏、觸摸和擁擠的累積效果才是重點。',links:[' are damaged not by one careless visitor, but by '],labels:['受損場所','累積行為']},
 {example:'For this reason, authorities should introduce timed tickets, daily visitor limits, marked walking routes, and restricted zones near fragile paintings.',d:[3,8,9],relation:'For this reason 把累積壓力接到四項可執行限制',formula:'For this reason, authorities should introduce [時段門票], [人數上限], [保護路徑], and [禁入區]',meaning:'時段門票、限額、步行路線和限制區可減少壓力。',links:['For this reason, authorities should introduce '],labels:['分時措施','總量限制','指定路線','禁入區域']},
 {example:'For example, if guests view a mural from a controlled path instead of touching it, the risk of erosion and accidental damage is greatly reduced.',d:[4,8,10],relation:'if ... instead of ... 說明改變動線如何降低損壞',formula:'For example, if [遊客受控參觀] instead of [自由觸碰], the risk of [損壞] is greatly reduced',meaning:'從受控路徑看寺廟可減侵蝕、意外損壞與擠擁。',links:['For example, if ', ' instead of ', ', the risk of ', ' is greatly reduced.'],labels:['受控方式','被取代行為','降低的風險']},
 {example:'This would not stop families from enjoying a public garden; rather, it would allow them to experience it without slowly damaging it.',d:[4,8,13],relation:'not ...; rather ... 回應限制會妨礙享受的疑慮',formula:'This would not stop [人] from enjoying [事物]; rather, it would allow them to experience it without [破壞]',meaning:'受控參觀仍能欣賞文化遺產，並可避免慢慢破壞。',links:['This would not stop ', ' from enjoying ', '; rather, it would allow them to experience it without '],labels:['受益者','仍可享受的事物','避免的破壞']},
 {example:'Another important solution is to make ticket sales directly fund repairs.',d:[3,5,13],relation:'另一主題句轉入保育資金來源',formula:'Another important solution is to make [收入來源] directly fund [長期工作]',meaning:'第二方法是讓旅遊收入直接資助保育。',links:['Another important solution is to make ', ' directly fund '],labels:['收入來源','資助目標']},
 {example:'Entrance fees, tourism taxes, or conservation charges should be used specifically to repair bridges, employ trained staff, install cameras, and monitor damage over time.',d:[5,8,12],relation:'specifically 限定收入用途並列四項保育工作',formula:'[三種費用] should be used specifically to [修復], [人手], [設備], and [監察]',meaning:'門票及稅費應專用於修復、員工、設備和監察。',links:[' should be used specifically to '],labels:['保育收入','修復工作','受訓人手','保護設備']},
 {example:'At the same time, tour operators should be required to educate visitors before they enter sensitive sites, while strict fines should be imposed on those who remove objects.',d:[5,8,12],relation:'while 並列事前教育與違規懲罰',formula:'At the same time, [業者] should educate visitors before entry, while strict fines should be imposed on [違規者]',meaning:'入場前教育與對破壞者罰款同樣需要。',links:['At the same time, ', ' should be required to educate visitors before they enter sensitive sites, while strict fines should be imposed on those who '],labels:['需教育遊客的業者','違規行為']},
 {example:'Written instructions alone are often not enough; rules need both explanation and enforcement.',d:[5,8,12],relation:'not enough; both ... and ... 強調告示與執行不可互相取代',formula:'Clear signs alone are often not enough; rules need both explanation and enforcement',meaning:'清楚告示不足，規則需解釋也需執行。',links:[' alone are often not enough; rules need both explanation and enforcement.'],labels:['單靠不足的提示']},
 {example:'When pupils understand that a museum holds shared history rather than just another photo opportunity, they are more likely to behave responsibly.',d:[5,8,11],relation:'When 認知改變可增加負責任行為的可能性',formula:'When [人] understand that [地方] holds shared history rather than just another photo opportunity, they are more likely to behave responsibly',meaning:'理解遺址是共同歷史，遊客較可能負責任。',links:['When ', ' understand that ', ' rather than just another photo opportunity, they are more likely to behave responsibly.'],labels:['參觀者','被理解的共同歷史']},
 {example:'In conclusion, old forests can be protected by reducing excessive visitor pressure and by using entrance revenue to support long-term conservation.',d:[5,8,11],relation:'雙 by 平行收束減壓與收入保育兩方法',formula:'In conclusion, [地方] can be protected by [減少人流壓力] and by using [收入] to support long-term conservation',meaning:'結論重申控人流與旅遊收入支持長期保育。',links:['In conclusion, ', ' can be protected by ', ' and by using ', ' to support long-term conservation.'],labels:['受保護場所','降低壓力的方式','保育收入']},
 {example:'Education should open a window onto the past, not close it forever.',d:[5,8,13],relation:'open ... not close ... 以對照收束保存給後代的目的',formula:'[活動] should open a window onto the past, not close it forever',meaning:'旅遊應讓人看見歷史，而非使未來世代失去它。',links:[' should open a window onto the past, not close it forever.'],labels:['應保護歷史的活動']},
];
const usage=[
 '當你要先承認某趨勢讓人更容易接觸一項資源，再指出它對脆弱對象的壓力時。',
 '當你要用 Once 說明某項損壞一旦發生便無法原樣恢復時。',
 '當你已指出風險，要用 both ... and ... 預告即時管理及長期制度兩種做法時。',
 '當你要用主題句先限定第一項措施處理哪類實體壓力時。',
 '當你要用 not by ... but by ... 糾正對損壞原因的錯誤直覺時。',
 '當你要把累積壓力轉成分時、限額、動線及禁區等具體措施時。',
 '當你要用 if ... instead of ... 解釋替代行為如何降低風險時。',
 '當有人擔心限制會阻止參觀，你要用 not ...; rather ... 回應時。',
 '當你要用簡短主題句引出與限制人流不同的資金方案時。',
 '當你要清楚限定某項收入應用在哪幾項具體保護工作時。',
 '當你要並列事前教育和違規處罰，分清兩者各自的作用時。',
 '當你要指出書面告示不足，規則同時需要解釋和執行時。',
 '當你要用 When 說明理解場所的意義如何影響人的行為時。',
 '當結論要用兩個 by 平行收束兩項相互配合的方案時。',
 '當你要用一句簡短對照，說明保存資源給未來使用者的目的時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'依損壞原因、即時限制、長期保育排卡。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('題目要解決甚麼問題？',['大量參觀可能破壞脆弱的歷史遺址。','所有旅客都不願了解歷史。','古蹟完全無法讓人參觀。','旅遊業只能靠遊客拍照維持。'],'文章要保護不可原值重建的遺址。'),
 {type:'multi',prompt:'範文提出哪兩條主要方案？',detail:'選兩項，再按「確認」。',options:['控制人流與參觀行為。','以旅遊收入、教育和執法支持長期保育。','永久禁止所有人觀看任何古蹟。','只在入口加一塊告示便已足夠。'],correct:[0,1],why:'即時減壓與穩定保育制度須配合。'},
];
const route=[sequence('還原問題與兩種解方',[['引言','旅遊令古蹟更易接觸，也使脆弱遺址受壓；損壞不可原值恢復。'],['即時限制','用時段門票、每日限額、指定路線及限制區減少累積磨損。'],['保育制度','將旅遊收費專用於維修，並以教育和罰款配合規則。'],['結論','降低人流壓力與長期收入保育，讓後代仍能接觸歷史。']],'控制人流與籌集保育資金是兩條不同方案。')];
const evidence=[
 quiz('原文認為古蹟主要承受甚麼累積壓力？',['每天成千上萬人反覆行走、觸摸、攀爬與擠擁。','只因一名旅客一次忘記拍照。','因為寺廟從未有人到訪。','只因導遊培訓太多。'],'原文用 not by one ... but by thousands ... 糾正原因。'),
 quiz('指定路線的寺廟例子示範甚麼？',['保留觀賞機會，同時減少侵蝕、意外損壞和擠擁。','限制路線必然令寺廟完全無人參觀。','自由觸摸比指定路線更能保護古蹟。','寺廟不會受日常踩踏影響。'],'受控觀賞改變動線，不取消體驗。'),
 quiz('門票及保育費應如何使用？',['專用於維修、受訓員工、保護設備及長期監察。','全部只用於新紀念品設計。','不需紀錄用途，任意花費即可。','只支付拍照服務，毋須保養建築。'],'specifically 限定資金用途。'),
 quiz('為何清晰告示仍可能不足？',['遊客還需要理解規則，違規時亦須執行。','因為標示必然令每名遊客違規。','因為古蹟永遠不能設任何路線。','因為入場費會自動教懂所有人。'],'原文明言 explanation and enforcement。'),
 quiz('最後一句的「開窗」比喻指甚麼？',['讓現代及未來的人看見歷史，而非破壞歷史。','把每座古蹟換成新的玻璃窗。','只有窗戶才算文化遺產。','旅遊應令未來世代永遠無法參觀。'],'前後對照呈現保育目的。'),
];
const logic=[
 sequence('人流壓力到限制措施',[['累積磨損','大量人每天走、摸、爬及擠在同一空間。'],['限制方式','分時、限額、指定路線和禁區。'],['結果','仍可觀看，侵蝕、意外和擠擁風險下降。']],'指定路線降低風險，不是禁止所有體驗。'),
 sequence('收入到保育的閉環',[['收費','入場費、旅遊稅與保育費。'],['專款用途','修復、受訓員工、設備和長期監察。'],['行為配合','業者事前教育，違規者受罰。'],['長期目標','共同歷史得以保存。']],'收入、教育與執法各有不同作用。'),
];
const transfers=[
 transfer('某古牆每天有數千人觸摸，外表逐年磨損。','哪句找出原文的核心原因？',['反覆觸摸造成累積磨損，因此不能只責怪單一粗心遊客。','只需找到一名遊客，古牆便會自動復原。','人數多寡與長年磨損完全無關。','古牆受損後可立即重建出完全相同的歷史價值。'],['大量重複行動是原文機制。','不會自動復原。','累積人流正是重點。','文化價值不能複製。'],[1,4],'Once damaged / not by one but by thousands。'),
 transfer('一座寺廟的遊客可從護欄外拍照，但不可走進脆弱內室。','哪句準確說明這種安排？',['指定路線保留觀賞機會，同時降低踩踏與意外損壞風險。','護欄外能觀看便代表寺廟已不需保育。','限制內室等於完全禁止所有遊客欣賞寺廟。','遊客越自由攀爬，寺廟受損風險越低。'],['受控參觀與體驗可並存。','仍需保育。','不是完全禁訪。','方向相反。'],[6,7],'受控路徑 instead of 自由行走。'),
 transfer('某遺址的門票收入增加，管理者要制定用途。','哪項安排符合長期保育？',['將收入明確用於維修、受訓員工、保護設備和損壞監察。','把所有費用用於與遺址無關的廣告。','收入增加便可停止任何安全檢查。','只購買新相框，毋須考慮牆體損壞。'],['specifically 指向可檢驗的保育工作。','未用於保育。','仍要監察。','不處理損壞。'],[8,9],'tourism directly fund preservation。'),
 transfer('旅行社在團隊進入脆弱古蹟前，只讓遊客看一塊簡短告示。','哪句補足範文要求？',['業者應解釋規則及原因，違規時亦要執行處罰。','告示存在便保證每個人完全理解並遵守。','既有告示，便不得再培訓導遊。','只要遊客拍照，所有古蹟規則便不再適用。'],['解釋與執法都需要。','原文說告示不足。','可培訓導遊。','規則仍適用。'],[10,11],'signs alone not enough; explanation and enforcement。'),
 transfer('一座古橋每日最多接待固定人數，並分時售票。','哪句說明措施對準哪項風險？',['分時與限額可減少同一時間和每天的累積人流壓力。','分時門票主要用來改變古橋的歷史年代。','固定人數可保證古橋永遠不需維修。','每日上限只會令橋面更加擁擠。'],['兩種限制都回應實體壓力。','不能改歷史。','仍需維修。','方向相反。'],[3,5],'timed tickets + daily visitor limits。'),
 transfer('有人說「限制古蹟行走路線會毀掉旅遊體驗」。','哪句使用範文的回應方式？',['指定路線仍讓人觀賞古蹟，也能避免在體驗時慢慢破壞它。','只能把所有古蹟永久封閉，任何人不得觀看。','只要遊客想靠近，保育便必須完全停止。','遊客體驗與古蹟保存必然不能並存。'],['not stop enjoyment; rather protect the experience。','過度限制。','不需停止保育。','原文說可兼顧。'],[6,7],'not stop ...; rather ...。'),
 transfer('一名旅客把古蹟當成普通拍照背景，忽略禁觸規則。','哪句最能改善認知？',['解釋遺址承載共同歷史，讓旅客知道守規則是在保護它。','說每個遺址只是一個照片背景，毋須保護。','只展示更大的告示，但絕不解釋內容。','旅客理解歷史後必然更想破壞財物。'],['理解共同歷史可增加負責任行為的可能性。','正是錯誤認知。','解釋重要。','與範文相反。'],[11,12],'shared history rather than photo opportunity。'),
 transfer('另一題談如何保護受大量訪客影響的自然保護區。','哪句能轉用本文的方案框架？',['同時控制訪客數量與路線，並將收費用於維護和監察。','因古蹟需要管理，所以所有森林都必須永久禁入。','只增加旅遊廣告，毋須考慮生態承載。','設一塊告示便可替代所有資金和規則。'],['即時減壓與長期資金可跨領域檢查。','不能直接推永久禁入。','漏風險。','告示不足。'],[2,5,9,13],'雙主線：壓力控制與保育制度。'),
 transfer('政府已有保育基金，卻未處理每天的擁擠人流。','哪句指出方案缺口？',['保育收入有用，仍需限額與指定路線減少現場磨損。','有資金便代表遊客可無限制攀爬。','人流管理只能取代所有長期維修。','只要有導遊，古蹟便不受實體壓力。'],['兩條解方須並行。','資金不消除磨損。','不應取代維修。','導遊不能消除所有壓力。'],[3,5,9,13],'both controlling behaviour and conservation system。'),
 transfer('文章結論需要同時交代短期與長期保護。','哪句最完整？',['限制過度人流，並用旅遊收入支持長期維修與監察。','只要求遊客拍更多照片。','只列出一名粗心旅客，便已完成全部方案。','有了門票便毋須再監察任何損壞。'],['雙 by 平行收束兩方案。','不處理保護。','錯把個人當根因。','監察仍重要。'],[13,14],'結論 reducing pressure + using revenue。'),
];
export default {key:'direct-question:43',meta:{topic:'保護受旅遊壓力影響的歷史遺址',summary:'文章從累積人流的實體損害出發，提出分時限額、受控路線與禁區；再提出旅遊收入專用於保育，配合事前教育和罰款。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
