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
 {example:'In many hospitals, especially those that rely heavily on online systems, employers now expect staff to remain reachable even during weekends.',d:[1,3,8],relation:'背景句限定工作場景及隨時可聯絡的新要求',formula:'In many [場景], especially those that rely heavily on [工具], [管理者] now expect [群體] to remain reachable even during [休息時段]',meaning:'高度數碼化職場的僱主要求員工年假也可聯絡。',links:['In many ', ', especially those that rely heavily on ', ', employers now expect staff to remain reachable even during '],labels:['場景','通訊方式','休息時段']},
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
 transfer('酒店訂房系統在假期突然故障，只有一位技術員知道修復步驟。','哪句保留範文承認的有限好處？',['真正緊急時聯絡知情者，或可避免預訂損失與顧客投訴。','任何日常小事都應立即打斷技術員假期。','只要聯絡一次，系統便保證永遠不故障。','即使訂房系統壞掉，也完全不需要懂系統的人。'],['急事、知情者、可避免損失三者完整。','範圍過寬。','無永久保證。','知情者可有用。'],[4,5,6,7],'原文酒店系統例子限於 genuinely urgent。'),
 transfer('員工旅行時沒有接到電話，仍每小時查看工作訊息。','哪句解釋休息不足？',['預期自己隨時會被聯絡，注意力仍留在工作上，假期便難恢復精力。','沒有實際來電就保證員工完全放鬆。','每小時看訊息必然令員工更有活力。','假期的唯一作用是測試手機電池。'],['預期待命已影響心理脫離。','忽略警覺。','方向相反。','不相關。'],[9,10,11],'原文注意力仍放在可能訊息或來電。'),
 transfer('主管每週末都發非緊急訊息，員工感到私人界線被忽視。','哪句準確連到士氣後果？',['反覆打擾可能滋生怨氣，並削弱員工對公司的忠誠。','只要主管發訊息，忠誠度必然立即提高。','私人界線與工作關係完全沒有關聯。','所有員工必然當場辭職。'],['界線受侵→怨氣→忠誠下降。','機制相反。','原文指出有關。','過度保證。'],[12,13,14],'原文 repeatedly interrupted→resentment/reduced loyalty。'),
 transfer('一名資深員工因長期假期待命而離職。','哪句指出企業自身也受損？',['公司可能增加招聘開支，團隊穩定性與產出也可能下降。','離職後企業必然完全不用再培訓。','員工離職只會影響其旅行照片。','招聘成本與人員流動完全無關。'],['人員離開可帶來公司層面成本。','方向相反。','不相關。','原文列招聘成本。'],[14,15],'原文 businesses then face higher recruitment costs etc。'),
 transfer('有人認為「能快速回訊」證明全年待命必然利大於弊。','哪句指出範文的比較方式？',['快速回覆只是一項有限好處，仍要比較員工恢復、士氣與長期效率的代價。','能回訊便證明假期一定有足夠休息。','只要公司受益，員工健康便無須考慮。','任何緊急回覆都完全沒有價值。'],['比較短期反應與長期代價。','未必。','忽略損害。','原文承認急事好處。'],[2,17],'原文 limited operational advantage outweighed by long-term harm。'),
 transfer('公司想設緊急輪值制度，卻把所有一般電郵也列為急件。','哪句使用範文的範圍限制？',['應區分真正不能等的故障與可留待上班處理的例行訊息。','所有電郵都必然與訂房故障一樣緊急。','緊急制度只能用於詢問下週午餐。','只要是主管發的訊息就不能分類。'],['真正緊急才有較強聯絡理由。','範圍過寬。','不合理。','可按內容分辨。'],[4,7],'原文緊急聯絡好處受 genuinely urgent 限定。'),
 transfer('另一題評估要求教師在學校假期即時回答家長訊息。','哪句真正轉用本文的分析框架？',['可比較急事處理速度與教師恢復精力、私人界線和學校長期人手穩定。','因為本文反對酒店聯絡，教師必然不能處理任何急事。','只要有家長訊息，教師便必須全年零休息。','教師假期安排只需看電郵字體。'],['轉移急事與長期代價的評估維度。','不可照搬極端結論。','不合權衡。','不相關。'],[4,9,13,15],'原文急事好處與恢復、忠誠及機構表現。'),
 transfer('員工在休假後回來仍感疲累，卻沒有實際完成很多工作。','哪句最能解釋這種結果？',['持續警覺本身便可能阻礙減壓，假期因而未能恢復精力。','只有完成大量文件才可能感到疲累。','休假一結束，所有人都必然精神飽滿。','這能證明所有假期都沒有作用。'],['心理待命可造成恢復不足。','忽略預期壓力。','無此保證。','過度概括。'],[9,10,11],'原文 mentally disconnect 與 restoring energy。'),
 transfer('作文已談員工疲累，卻未說明對公司有何長期影響。','哪句補上缺失的論證？',['反覆打擾可能削弱忠誠、增加離職，令招聘成本和團隊不穩上升。','員工疲累只影響其旅遊交通選擇。','只要即時回訊，公司便不可能有招聘成本。','所有人只要疲累一次就必然辭職。'],['由人員感受推到組織後果。','不相關。','無此保證。','過度斷言。'],[12,13,14,15],'原文士氣鏈最終傷害企業。'),
 transfer('結論要承認酒店急事例子又反對全年待命。','哪句符合範文？',['緊急聯絡偶爾有用，但反覆侵入假期對員工及企業的長期傷害較重。','既然偶爾有用，便每天聯絡所有休假員工。','既然整體負面，便說急事從來不能處理。','只需重述酒店名稱，不必比較後果。'],['先承認有限好處，再作完整權衡。','過度擴大範圍。','否認已承認好處。','缺少比較。'],[16,17],'原文 while occasional emergency benefit, negative overall。'),
];
export default {key:'advantage-disadvantage:27',meta:{topic:'假期聯絡員工的急事收益與長期損害',summary:'範文承認真緊急時聯絡知情員工可減少事故損失，卻指出預期待命阻礙休息，反覆侵入私人時間可損士氣、促離職並傷害企業長遠表現。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
