// Holiday contact: genuine emergency response versus recovery and retention.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:27'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many jobs, especially ones where people use messages and computers a lot, bosses now expect workers to answer even when they are taking their yearly holiday.',
 'This way of working may seem good for business, but I do not think its good points are greater than its bad points.',
 'Answering more quickly may help sometimes, but this does less good than the harm to workers’ rest, feelings about work and ability to work well over time.',
 'It is true that this way of working has one clear good point.',
 'If a serious problem happens without warning, speaking at once to the worker who knows about it can stop a small problem becoming a large one.',
 'A late delivery, broken computer system or urgent customer request can often be dealt with quickly when a worker can explain something or make a decision.',
 'For example, if a hotel manager can reach the worker who understands the booking system during a holiday, many bookings may be saved and fewer guests may complain.',
 'So when something really cannot wait, being able to reach workers can protect a business.',
 'Even so, the bad points are much more important.',
 'First, workers who know the boss may contact them at any time cannot stop thinking about work, even while they are officially on holiday.',
 'Because part of their mind is still waiting for messages or calls, holidays no longer give them the rest and relief from worry they need.',
 'So workers often return feeling worn out, not rested.',
 'Second, this way of working slowly makes workers less willing to stay committed to their boss.',
 'When private time is often broken into by work, people feel their limits are not respected; this can make them angry and less loyal.',
 'A nurse, teacher or office worker called during family trips or public holidays may help at first, but being interrupted again and again can finally make them too tired to work well or leave the job.',
 'Businesses then have to spend more on hiring, have less steady teams and may get less work done.',
 'To sum up, being able to reach workers on holiday may sometimes help bosses with true emergencies, but it is bad overall.',
 'The small benefit for keeping work running is much less important than the harm to workers’ health and the business’s ability to keep working well over time.',
];
const vocabulary=[
 v(['workplaces','jobs','職場'],['digital communication','messages and computers','數碼溝通'],['employers','bosses','僱主'],['remain reachable','answer','保持可聯絡'],['annual leave','yearly holiday','年假']),
 v(['arrangement','way of working','安排'],['commercially sensible','good for business','商業上合理'],['more advantages than disadvantages','good points are greater than its bad points','利大於弊']),
 v(['gain in responsiveness','Answering more quickly','回應更快'],['outweighed','does less good than','被超過'],['recovery','rest','恢復精力'],['morale','feelings about work','士氣'],['long-term effectiveness','ability to work well over time','長遠效率']),
 v(['Admittedly','It is true','誠然'],['one clear benefit','one clear good point','一項明顯好處']),
 v(['serious problem arises unexpectedly','serious problem happens without warning','突發嚴重問題'],['immediate contact','speaking at once','立即聯絡'],['minor disruption','small problem','小型干擾'],['major one','large one','重大問題']),
 v(['delayed shipment','late delivery','貨物延誤'],['software failure','broken computer system','軟件故障'],['urgent client request','urgent customer request','緊急客戶要求'],['resolved quickly','dealt with quickly','迅速解決'],['clarify information','explain something','釐清資訊']),
 v(['hotel manager','hotel manager','酒店經理'],['technician','worker','技術人員'],['booking system','booking system','訂房系統'],['reservations may be saved','bookings may be saved','預訂可保住'],['customer complaints reduced','fewer guests may complain','減少投訴']),
 v(['genuinely urgent situations','something really cannot wait','真正緊急情況'],['constant availability','being able to reach workers','持續可聯絡'],['protect a company’s operations','protect a business','保障公司運作']),
 v(['Nevertheless','Even so','然而'],['far more significant','much more important','重要得多'],['disadvantages','bad points','缺點']),
 v(['at any moment','at any time','隨時'],['disconnect mentally from work','stop thinking about work','心理上脫離工作'],['officially resting','officially on holiday','名義上休假']),
 v(['attention remains partly fixed','part of their mind is still waiting','部分注意力仍放在'],['essential purpose','the rest and relief from worry they need','基本作用'],['restoring energy','rest','恢復精力'],['relieving stress','relief from worry','減壓']),
 v(['As a result','So','結果'],['feeling drained','feeling worn out','筋疲力盡'],['rather than refreshed','not rested','而非精神飽滿']),
 v(['culture','way of working','文化'],['gradually damages','slowly makes','逐漸損害'],['commitment to the employer','committed to their boss','對僱主投入']),
 v(['private time','private time','私人時間'],['repeatedly interrupted','often broken into','反覆打斷'],['personal boundaries','limits','個人界線'],['breeds resentment','make them angry','滋生怨氣'],['reduces loyalty','less loyal','削弱忠誠']),
 v(['family trips','family trips','家庭旅行'],['public holidays','public holidays','公眾假日'],['cooperate at first','help at first','起初配合'],['repeated intrusion','being interrupted again and again','反覆侵入'],['burnout or resignation','too tired to work well or leave the job','倦怠或辭職']),
 v(['higher recruitment costs','spend more on hiring','招聘成本上升'],['weaker team stability','less steady teams','團隊穩定性較弱'],['lower productivity','less work done','生產力下降']),
 v(['In conclusion','To sum up','總結'],['occasionally','sometimes','偶爾'],['emergencies','true emergencies','緊急情況'],['negative development overall','bad overall','整體負面']),
 v(['limited operational advantage','small benefit for keeping work running','有限運作好處'],['decisively outweighed','much less important than','明顯不足抵銷'],['workers’ wellbeing','workers’ health','員工福祉'],['sustainable performance','ability to keep working well over time','可持續表現']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many hospitals, especially those that rely heavily on online systems, employers now expect staff to remain reachable even during weekends.',d:[1,3,8],relation:'背景句限定工作場景及隨時可聯絡的新要求',formula:'In many [場景], especially those that rely heavily on [工具], [管理者] now expect [群體] to remain reachable even during [休息時段]',meaning:'高度數碼化職場的僱主要求員工年假也可聯絡。',links:['In many ', ', especially those that rely heavily on ', ', ', ' now expect ', ' to remain reachable even during '],labels:['場景','通訊方式','管理者','受要求群體','休息時段']},
 {example:'Although this policy may seem financially sensible, I do not believe it has more advantages than disadvantages.',d:[0,8,16],relation:'Although 承認表面商業合理性，再給整體反對立場',formula:'Although [表面好處], I do not believe it has more advantages than disadvantages',meaning:'作者認為假期待命弊大於利。',links:['Although ', ', I do not believe it has more advantages than disadvantages.'],labels:['表面理由']},
 {example:'Any gain in responsiveness is outweighed by the harm it causes to employees’ rest, morale and lasting effectiveness.',d:[1,8,16],relation:'比較回應速度與休息士氣長效損失',formula:'Any gain in [小幅收益] is outweighed by the harm it causes to [多項長遠代價]',meaning:'即時回應的有限好處不及員工恢復與長期效率損害。',links:['Any gain in ', ' is outweighed by the harm it causes to '],labels:['有限收益','較重代價']},
 {example:'Admittedly, there is one clear benefit to this policy.',d:[2,8,16],relation:'Admittedly 先公平承認一項好處',formula:'Admittedly, there is one clear benefit to [做法]',meaning:'緊急事件可快速處理，是一項真實好處。',links:['Admittedly, there is one clear benefit to '],labels:['做法']},
 {example:'If a serious technical issue arises unexpectedly, immediate contact with a trained employee can prevent a minor disruption from developing into a major one.',d:[3,8,9],relation:'If 條件下及時聯絡阻止小問題變大',formula:'If [突發問題], immediate contact with [知情者] can prevent a minor disruption from developing into a major one',meaning:'真正緊急時，找得到相關員工可避免小事故擴大。',links:['If ', ', immediate contact with ', ' can prevent a minor disruption from developing into a major one.'],labels:['突發問題','能處理者']},
 {example:'A delayed order, a server fault or an urgent customer request can often be resolved quickly when a staff member is available to clarify information or make a decision.',d:[3,8,9],relation:'列出三種急事，when 說知情者可釐清或決策',formula:'[數種急事] can often be resolved quickly when [員工] is available to clarify information or make a decision',meaning:'延誤、故障或客戶急件可因員工說明及決策而快處理。',links:[' can often be resolved quickly when ', ' is available to clarify information or make a decision.'],labels:['急事例子','可聯絡員工']},
 {example:'For example, if a hotel manager can reach the technician who understands the payment system during a holiday, several bookings may be saved and complaints reduced.',d:[3,8,9],relation:'以酒店訂房系統事故說明緊急聯絡的可見好處',formula:'For example, if [管理者] can reach [知情員工] during a holiday, [可避免損失]',meaning:'若酒店經理能聯絡熟悉系統的技術員，或可保住預訂及少投訴。',links:['For example, if ', ' can reach ', ' during a holiday, '],labels:['管理者','知情員工','可避免損失']},
 {example:'In genuinely urgent situations, therefore, constant availability can protect a company’s key services.',d:[3,8,9],relation:'therefore 限定真緊急情境，總結運作保障',formula:'In genuinely urgent situations, therefore, [安排] can protect [機構運作]',meaning:'只在真緊急時，待命或能保障公司運作。',links:['In genuinely urgent situations, therefore, ', ' can protect '],labels:['待命安排','需保障的運作']},
 {example:'Nevertheless, the long-term disadvantages are far more significant.',d:[3,6,12],relation:'Nevertheless 轉到更重的長期缺點',formula:'Nevertheless, the [代價] disadvantages are far more significant',meaning:'作者判斷休息及士氣損害較重。',links:['Nevertheless, the ', ' are far more significant.'],labels:['較重缺點']},
 {example:'First, employees who know they may be contacted at any moment are unable to disconnect mentally from work, even when they are formally resting.',d:[3,8,12],relation:'who know...even when 說假期也無法心理脫離工作',formula:'First, employees who know [待命風險] are unable to disconnect mentally from work, even when [休假條件]',meaning:'知道隨時可能被聯絡，員工即使休假也難放下工作。',links:['First, employees who know ', ' are unable to disconnect mentally from work, even when '],labels:['待命預期','名義休息狀態']},
 {example:'Because their attention remains partly fixed on possible calls, holidays no longer serve their essential purpose of restoring energy and relieving stress.',d:[3,8,12],relation:'Because 說持續警覺如何削弱假期恢復功能',formula:'Because [部分注意力仍在工作], holidays no longer serve their essential purpose of [恢復作用]',meaning:'仍等候訊息或來電，假期難恢復精力及紓壓。',links:['Because ', ', holidays no longer serve their essential purpose of '],labels:['持續警覺','假期原本作用']},
 {example:'As a result, workers often return feeling exhausted rather than refreshed.',d:[3,8,12],relation:'As a result 收束休假沒有恢復的結果',formula:'As a result, workers often return feeling [疲勞狀態] rather than refreshed',meaning:'員工回來時或筋疲力盡而非精神飽滿。',links:['As a result, workers often return feeling ', ' rather than refreshed.'],labels:['回來時狀態']},
 {example:'Second, this culture gradually damages trust in the employer.',d:[3,8,10],relation:'Second 轉向員工忠誠度的另一條負面鏈',formula:'Second, this culture gradually damages [員工關係]',meaning:'反覆侵入私人時間會慢慢削弱對僱主的投入。',links:['Second, this culture gradually damages '],labels:['受影響關係']},
 {example:'When private time is repeatedly interrupted, people feel that their boundaries are not respected, which breeds resentment and reduces loyalty.',d:[3,8,10],relation:'When...which 串連打斷、被忽視、怨氣及忠誠',formula:'When [私人時間被打斷], people feel that [界線未獲尊重], which breeds resentment and reduces loyalty',meaning:'反覆打斷令員工覺得界線不受尊重，引致怨氣及忠誠下降。',links:['When ', ', people feel that ', ', which breeds resentment and reduces loyalty.'],labels:['打斷條件','感受']},
 {example:'A nurse or office worker who is contacted during family trips may cooperate at first, but repeated intrusion can eventually lead to burnout or resignation.',d:[3,8,10],relation:'but 對照最初配合與長期倦怠離職',formula:'[員工] who is contacted during [私人時段] may cooperate at first, but repeated intrusion can eventually lead to [後果]',meaning:'假期被反覆聯絡者起初或配合，長期可能倦怠或離職。',links:[' who is contacted during ', ' may cooperate at first, but repeated intrusion can eventually lead to '],labels:['員工','私人時段','長期後果']},
 {example:'Businesses then face higher recruitment costs, weaker team stability and lower productivity after experienced staff leave.',d:[3,8,10],relation:'then 把員工離職連到公司招聘、團隊及產出代價',formula:'Businesses then face [招聘成本], [團隊狀態] and [生產力後果]',meaning:'企業最終也可能招聘成本上升、團隊不穩、生產力下降。',links:['Businesses then face ', ', ', ' and '],labels:['招聘成本','團隊狀態','生產力結果']},
 {example:'In conclusion, while the ability to contact staff on holidays may occasionally help employers deal with urgent faults, it is a negative development overall.',d:[3,8,10],relation:'結論 while 保留偶發急事好處，仍判整體負面',formula:'In conclusion, while [有限緊急好處], it is a negative development overall',meaning:'真正急事或有用，但整體弊大於利。',links:['In conclusion, while ', ', it is a negative development overall.'],labels:['已承認的有限好處']},
 {example:'The limited operational advantage is decisively outweighed by the damage done to workers’ health and to the sustainable performance of their team.',d:[3,8,10],relation:'結論比較有限運作收益與員工及企業長效傷害',formula:'The limited operational advantage is decisively outweighed by the damage done to [員工] and to [機構長效表現]',meaning:'有限急事收益不足抵銷員工福祉與組織持續表現損害。',links:['The limited operational advantage is decisively outweighed by the damage done to ', ' and to '],labels:['員工損害','組織損害']},
];
const usageGuides=[
 '當你要先界定某類職場及其通訊方式，再指出員工被要求在休息時做甚麼時。',
 '當你要用 Although 承認表面合理性，再清楚表達相反整體立場時。',
 '當你要直接比較一項短期收益與多項長期代價時。',
 '當你要用 Admittedly 先公平承認反方確有一項好處時。',
 '當你要用 If 說明突發問題出現時，及時聯絡如何阻止它擴大時。',
 '當你要列出多種急事，再用 when 說明知情員工在場為何有用時。',
 '當你要用具體機構、知情者與可避免損失，落實前句好處時。',
 '當你要用 therefore 收束上一個例子，並將判斷限定於真正緊急時。',
 '當你要用 Nevertheless 從承認的好處轉向更重的長期缺點時。',
 '當你要寫人們因預期隨時被聯絡，即使休息仍無法放下工作時。',
 '當你要用 Because 解釋持續警覺如何使休息失去原有作用時。',
 '當你要用 As a result 收束一條已說明的原因與恢復不足的結果時。',
 '當你要用 Second 開始與休息恢復不同的第二條負面鏈時。',
 '當你要用 When...which 串連私人界線受侵、情緒與忠誠後果時。',
 '當你要用 but 對照最初願意配合與長期反覆打擾的後果時。',
 '當你要說明員工的長期反應如何反過來影響機構成本與產出時。',
 '當你要在結論用 while 保留有限好處，仍給出整體負面評價時。',
 '當你要以最後一句明確比較有限運作收益與員工、機構的長期損害時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'只把真正緊急聯絡列作好處，再追蹤休息、士氣與公司後果。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文評估哪一種工作安排？',['僱主在員工年假仍要求保持可聯絡。','所有員工年假時必須到辦公室工作。','公司只在工作日購買新電腦。','僱主完全停止處理客戶要求。'],'焦點是年假期間可聯絡，而非正式上班。'),
 {type:'multi',prompt:'作者認為最重的兩條缺點是甚麼？',detail:'選兩項，再按「確認」。',options:['休假時不能真正恢復精力','私人界線受侵，忠誠下降並可能離職','所有緊急問題必然無法處理','每名員工都必然立即辭職'],correct:[0,1],why:'休息恢復與員工投入是兩條負面鏈。'},
];
const route=[sequence('還原假期待命的權衡',[
 ['背景與立場','數碼職場要求年假仍可聯絡；作者認為有限好處不足抵銷長期傷害。'],
 ['真正緊急時','知情員工或能阻止小故障變成大損失。'],
 ['休息受損','員工一直等訊息，假期難恢復精力，回來仍疲累。'],
 ['士氣受損','私人界線反覆被侵，怨氣、倦怠與離職可能增加。'],
 ['企業反受害','招聘成本升、團隊不穩及生產力降；結論判整體負面。'],
 ],'原文承認的好處限於真正緊急情況，並非一般即時回覆都值得打擾年假。')];
const evidence=[
 quiz('甚麼情況最能支持假期聯絡的好處？',['突發故障需熟悉系統的員工即時釐清或決策。','只為詢問下週例行會議的時間。','只是想知道員工的旅行照片。','沒有任何問題卻每日例行致電。'],'好處限定 genuinely urgent situations。'),
 quiz('為何休假者即使沒有實際接到電話也可能休息不足？',['知道可能隨時被聯絡，注意力仍留在工作訊息上。','因為假期本身必然比上班更忙。','因為所有員工都完全不喜歡休息。','因為電話鈴聲保證永遠不響。'],'預期待命已可阻礙心理脫離。'),
 quiz('反覆打擾私人時間如何影響企業？',['員工可能倦怠或離職，帶來招聘成本與團隊不穩。','每次打擾都必然立刻提高忠誠。','企業因此完全不用再招聘。','只會影響員工的旅遊目的地。'],'先有人際界線問題，再有組織成本。'),
 quiz('作者是否否認任何緊急聯絡的作用？',['沒有；酒店訂房系統例子說明真正急事可能獲益。','有；範文說所有緊急情況都不可處理。','有；範文說技術員一律無用。','沒有；但作者因此認為每日聯絡都合理。'],'Admittedly 與例子保留有限好處。'),
 quiz('結論比較了哪兩方面？',['有限的運作反應好處，與員工福祉及機構長期表現損害。','只比較兩款訂房軟件。','只比較不同年假的機票價格。','只看一次來電是否超過一分鐘。'],'最後一句明確比較短期與長期。'),
];
const logic=[
 sequence('真正急事的有限好處',[
 ['突發問題','延誤、軟件故障或緊急客戶要求出現。'],
 ['知情員工','能釐清資訊或作出決策。'],
 ['損失避免','酒店等機構或保住預訂、減少投訴。'],
 ['範圍限制','只有真正不能等的事才形成較強理由。'],
 ],'一般例行詢問不能直接套用「緊急」好處。'),
 sequence('休假受侵到企業受害',[
 ['預期待命','員工無法完全放下工作。'],
 ['恢復不足','假期失去休息減壓作用，回來仍疲累。'],
 ['界線與忠誠','反覆打擾令員工覺得不受尊重。'],
 ['企業代價','倦怠離職帶來招聘成本、團隊不穩及產出下降。'],
 ],'傷害不只落在員工身上，也回到機構長遠表現。'),
];
const transfers=[
 transfer('酒店訂房系統在假期突然故障，只有一位技術員知道修復步驟。','哪句保留範文承認的有限好處？',["真正緊急時聯絡知情者，或可減少訂房損失和顧客投訴", "技術員熟悉系統，因此所有例行查詢也應在假期即時處理", "系統故障雖緊急，但企業不應預先設立其他支援安排", "假期聯絡技術員或可修復故障，故此每次聯絡都屬必要"],["保留真正急事可快速求助的有限好處。", "把例行事項錯當緊急情況。", "不等於毋須替代支援。", "由一件急事擴大到所有聯絡。"],[4,5,6,7],'原文酒店系統例子限於 genuinely urgent。'),
 transfer('員工旅行時沒有接到電話，仍每小時查看工作訊息。','哪句解釋休息不足？',["即使沒有來電，隨時待命的預期也可令員工難以真正放鬆", "沒有實際來電便表示員工已完全脫離工作並恢復精力", "員工頻看訊息主要證明假期活動較少，與工作壓力無關", "假期可否恢復精神，只取決於手機收到的實際來電數"],["壓力可來自預期及持續警覺，不需真的接到電話。", "忽略待命預期。", "題境顯示注意力仍留在工作。", "過分縮窄休息判準。"],[9,10,11],'原文注意力仍放在可能訊息或來電。'),
 transfer('主管每週末都發非緊急訊息，員工感到私人界線被忽視。','哪句準確連到士氣後果？',["週末反覆收到非急訊息，可能累積怨氣並削弱員工忠誠", "非急訊息雖侵入私生活，但只影響回覆速度而不影響士氣", "員工既會查看訊息，便顯示他們同意永久放棄私人界線", "主管週末保持聯絡可提高效率，因此不用再評估員工感受"],["把重複打擾連到私人界線和忠誠。", "漏掉情緒與關係後果。", "查看不等於自願放棄界線。", "效率並非唯一評估面向。"],[12,13,14],'原文 repeatedly interrupted→resentment/reduced loyalty。'),
 transfer('一名資深員工因長期假期待命而離職。','哪句指出企業自身也受損？',["員工離職可能增加招聘成本，也令團隊穩定與產出受損", "資深員工離職後，公司只須重新分配工作而毋須招聘", "長期假期待命造成離職，仍只屬員工個人休息問題", "招聘新人或有開支，但原有團隊運作不會受到影響"],["把員工離開連到企業成本與穩定性。", "可能仍需招聘及培訓。", "企業亦可能承擔後果。", "忽略團隊連續性。"],[14,15],'原文 businesses then face higher recruitment costs etc。'),
 transfer('有人認為「能快速回訊」證明全年待命必然利大於弊。','哪句指出範文的比較方式？',["回訊快速只是有限收益，仍要比較休息、士氣及長期效率", "只要員工能快速回覆，公司便不需再檢查任何工作後果", "休假聯絡或有成本，所以任何緊急聯絡都不應獲准", "年度待命安排應只按一次系統故障的處理速度評估"],["保留短期好處，仍比較較廣泛的長期代價。", "以單一收益取代整體衡量。", "否認範文承認的真正急事。", "由個案推成全年規則。"],[2,17],'原文 limited operational advantage outweighed by long-term harm。'),
 transfer('公司想設緊急輪值制度，卻把所有一般電郵也列為急件。','哪句使用範文的範圍限制？',["應把不能等待的故障與可待上班處理的例行電郵分開", "主管寄出的所有電郵都應列為急件，以免員工自行判斷", "只要有緊急輪值，例行查詢也須在假期即時全部回覆", "故障有時需快處理，因此企業不必訂明急件分類標準"],["只為真正急件保留有限聯絡安排。", "主管身份不能決定緊急程度。", "把例行事項誤放入急件。", "分類標準能保護休息。"],[4,7],'原文緊急聯絡好處受 genuinely urgent 限定。'),
 transfer('另一題評估要求教師在學校假期即時回答家長訊息。','哪句真正轉用本文的分析框架？',["比較急事處理與教師休息界線、士氣及學校長期穩定", "教師可回覆急事，便應把所有日常家長訊息列作急件", "教師需要恢復精力，因此學校永遠不能處理任何急事", "只討論家長收到回覆多快，不用評估教師長期工作狀況"],["把短期服務收益與長期人員代價帶到新題。", "把日常查詢誤作急事。", "取消範文承認的有限好處。", "漏掉休息與穩定性。"],[4,9,13,15],'原文急事好處與恢復、忠誠及機構表現。'),
 transfer('員工在休假後回來仍感疲累，卻沒有實際完成很多工作。','哪句最能解釋這種結果？',["持續警覺即使沒有大量實際工作，也可能阻礙壓力恢復", "休假時沒有完成大量文件，便代表員工一定已充分放鬆", "員工頻繁查看訊息，只會影響手機電量而不影響心情", "假期未能消除疲累，只可能因旅行交通安排不佳所致"],["待命心理本身即可削弱休息效果。", "忽略持續警覺。", "題境關於工作注意力。", "排除工作壓力缺乏依據。"],[9,10,11],'原文 mentally disconnect 與 restoring energy。'),
 transfer('作文已談員工疲累，卻未說明對公司有何長期影響。','哪句補上缺失的論證？',["反覆打擾可能降低忠誠並增加離職，使招聘與團隊成本上升", "員工因假期待命感到疲累，但企業長期人手不會受影響", "只要有人即時回訊，企業便完全不用再支付招聘開支", "企業可省下當下處理急事的時間，故毋須評估員工離職"],["補出疲累、忠誠、離職到企業成本的鏈條。", "忽略人員流失的可能。", "回訊不會使招聘成本歸零。", "只看短期速度而漏掉長期成本。"],[12,13,14,15],'原文士氣鏈最終傷害企業。'),
 transfer('結論要承認酒店急事例子又反對全年待命。','哪句符合範文？',["偶爾緊急聯絡可能有用，但反覆侵入假期的長期傷害較重", "緊急聯絡既有作用，公司便可每天聯絡所有休假員工", "全年待命整體有害，便表示真正急事也永遠不能處理", "只要酒店故障偶爾出現，所有員工都應長期保持在線"],["承認有限好處，再比較長期員工與企業代價。", "由偶爾推成日常，超出範圍。", "否定範文的急事讓步。", "把低頻情況轉成全年義務。"],[16,17],'原文 while occasional emergency benefit, negative overall。'),
];
const revised=[
 {wrong:['技術員熟悉系統，例行查詢也宜在假期優先處理','系統故障屬緊急，企業可少設其他支援安排','假期聯絡知情者或有用，每次查詢便可視為必要'],why:['有限好處只適用真正急事，不含例行查詢。','緊急案例不取消預先安排支援的需要。','能聯絡不代表每次聯絡都必要。']},
 {wrong:['沒有實際來電時，查看訊息的負擔應較容易消除','員工頻看訊息，主要反映假期安排欠妥而非工作壓力','假期能否恢復精神，主要看實際來電次數與時長'],why:['待命預期本身也可能妨礙放鬆。','頻看工作訊息可能源於工作壓力。','心理警覺不只由來電數衡量。']},
 {wrong:['非急訊息侵入私生活，影響應主要在回覆效率','員工持續查看訊息，表示私人界線可逐步放寬','週末聯絡或提高效率，員工感受可留待另行處理'],why:['界線受侵可能累積不滿和降低忠誠。','查看訊息不代表自願放棄休息界線。','員工感受也是長期企業影響。']},
 {wrong:['資深員工離職後，團隊可用內部分工補足人手','離職源於假期待命，主要是個人休息而非公司風險','招聘新人要開支，原有團隊產出則可保持穩定'],why:['內部分工未必消除招聘與穩定成本。','離職也會影響企業人手與效率。','人手變動可能影響團隊產出。']},
 {wrong:['員工回訊快速，公司可先不查其他工作後果','休假聯絡有成本，緊急事件也應等復工處理','全年待命只需按一次故障處理速度作出判斷'],why:['快速回覆只是有限收益，仍要看長期代價。','真正急事可能需要有限聯絡。','單一案例不足以評估全年制度。']},
 {wrong:['主管寄出的電郵宜先視作急件，避免漏看問題','既設緊急輪值，一般例行查詢也應即時回覆','故障需快處理，企業可讓員工自行定義急件'],why:['急件需要明確標準，而非按寄件者判斷。','一般電郵可留到上班處理。','缺乏分類標準可能擴大假期干擾。']},
 {wrong:['教師可回覆急事，日常家長訊息便可一併處理','教師需要休息，學校急事可等到假期後再處理','只看家長收到回覆速度，教師壓力可另文討論'],why:['急事與例行訊息應區分。','部分真正急事可能需要處理。','教師長期狀況正是轉移框架的一部分。']},
 {wrong:['沒有完成大量工作，員工便應能充分恢復精力','頻繁查看訊息影響時間，但對心情作用較少','假期仍疲累，主要應歸因旅行而非工作警覺'],why:['待命心理壓力也可能妨礙恢復。','工作訊息可帶來壓力和警覺。','沒有證據能排除工作壓力。']},
 {wrong:['假期待命使人疲累，公司人手可由新員工補回','即時回訊能處理問題，因此招聘風險較不重要','節省當下處理急事時間，可抵銷長期離職成本'],why:['替補仍需招聘及培訓，團隊亦可能受損。','短期效率不取消長期招聘成本。','未比較成本大小，不能推斷已抵銷。']},
 {wrong:['緊急聯絡有作用，日常聯絡亦應取得相同收益','全年待命整體有害，真正急事也宜交由下次輪值','酒店故障偶爾發生，員工便應在大部分假期保持在線'],why:['急事的有限收益不能推廣至例行打擾。','反對常態待命不等於拒絕緊急處理。','偶爾故障不證明人人長期在線合理。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[9].explanations[3]='偶爾故障不支持員工在大部分假期都保持在線。';
transfers[0].options[0]='真正急事聯絡知情者，或減少訂房損失與投訴';
transfers[1].options[0]='即使無來電，隨時待命的預期也令員工難以放鬆';
transfers[2].options[0]='週末反覆收到非急訊息，或累積怨氣並削弱忠誠';
transfers[3].options[0]='員工離職可增招聘成本，也損團隊穩定與產出';
transfers[4].options[0]='快速回訊只是有限收益，還須比較休息與士氣代價';
transfers[5].options[0]='區分不能延誤的故障與可待復工的例行電郵';
transfers[7].options[0]='持續警覺即使工作不多，也可能阻礙壓力恢復';
transfers[8].options[0]='反覆打擾降低忠誠，離職推高招聘與團隊成本';
transfers[9].options[0]='偶爾緊急聯絡有用，反覆干擾假期的傷害更重';
export default {key:'advantage-disadvantage:27',meta:{topic:'假期聯絡員工的急事收益與長期損害',summary:'範文承認真緊急時聯絡知情員工可減少事故損失，卻指出預期待命阻礙休息，反覆侵入私人時間可損士氣、促離職並傷害企業長遠表現。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
