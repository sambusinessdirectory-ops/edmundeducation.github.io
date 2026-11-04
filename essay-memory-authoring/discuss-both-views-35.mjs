// Dangerous sports: injury and rescue costs versus autonomy under regulation.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:35'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Sport has always included some danger, but should the government remove that danger by stopping risky sports completely?',
 'Some think a ban would stop people being badly hurt. I think grown-ups should still be free to choose these sports if strong rules for safety are followed.',
 'People who want to ban risky sports have a fair worry: even people who have done them for years can be badly hurt or killed.',
 'Climbing rocks, boxing, racing cars and jumping from planes are not just a little uncomfortable; one mistake can hurt someone for life.',
 'For example, if a person new to climbing ignores bad weather, the team that saves them may have to put their own lives in danger.',
 'So risky sports can cost not just the person taking part, but also their family, hospitals and other people in the area.',
 'From this view, a ban can look like a simple way to stop tragedies that could have been prevented.',
 'But I think this idea goes too far because we should not take away personal choice just because an activity has some danger.',
 'Many things people value, such as travelling alone or starting a company, involve some danger or things we cannot be sure about, but we do not ban them for this reason.',
 'A better answer is to make and enforce strict rules.',
 'For example, centres for jumping from planes can require trained teachers, health checks, a minimum age, good equipment and plans for emergencies.',
 'These rules can reduce danger people do not need to face while still letting them see how brave, careful and strong they can be.',
 'If a ban makes people do a sport in secret, it may become even more dangerous because officials can no longer check what happens.',
 'To sum up, risky sports can cause serious harm, but a ban is not the best answer.',
 'People should be able to do these sports because freedom, taking responsibility and well-made safety rules work better than a complete ban.',
];
const vocabulary=[
 v(['Risk','danger','風險'],['state','government','政府'],['remove that risk','remove that danger','消除風險'],['banning','stopping','禁止'],['altogether','completely','全面']),
 v(['supporters of prohibition','Some think a ban','支持禁令者'],['serious harm','badly hurt','嚴重傷害'],['adults','grown-ups','成年人'],['free to choose','free to choose','自由選擇'],['proper safety rules are enforced','strong rules for safety are followed','執行安全規則']),
 v(['favour banning','want to ban','支持禁止'],['reasonable concern','fair worry','合理擔憂'],['severe injury or death','badly hurt or killed','重傷或死亡'],['experienced','done them for years','有經驗']),
 v(['rock climbing','Climbing rocks','攀岩'],['motor racing','racing cars','賽車'],['skydiving','jumping from planes','跳傘'],['mild discomfort','a little uncomfortable','輕微不適'],['permanent damage','hurt someone for life','永久傷害']),
 v(['amateur climber','person new to climbing','業餘攀岩者'],['ignores bad weather','ignores bad weather','忽視惡劣天氣'],['rescue teams','team that saves them','救援隊'],['risk their own lives','put their own lives in danger','冒生命危險']),
 v(['In this sense','So','從此意義'],['costs','cost','代價'],['individual','person taking part','參與者'],['medical services','hospitals','醫療服務'],['wider community','other people in the area','更廣社區']),
 v(['From this perspective','From this view','從此角度'],['ban','ban','禁令'],['prevent avoidable tragedy','stop tragedies that could have been prevented','防止可避免悲劇']),
 v(['However','But','然而'],['goes too far','goes too far','走得太遠'],['personal freedom','personal choice','個人自由'],['sacrificed','take away','被犧牲'],['contains risk','has some danger','有風險']),
 v(['meaningful human experiences','things people value','有意義經歷'],['travelling alone','travelling alone','獨自旅行'],['starting a business','starting a company','創業'],['uncertainty','things we cannot be sure about','不確定'],['does not ban','do not ban','不禁止']),
 v(['better response','better answer','更好回應'],['strict regulation','make and enforce strict rules','嚴格監管']),
 v(['skydiving centres','centres for jumping from planes','跳傘中心'],['professional instructors','trained teachers','專業教練'],['medical checks','health checks','體檢'],['age limits','minimum age','年齡限制'],['high-quality equipment','good equipment','高質素裝備'],['emergency procedures','plans for emergencies','緊急程序']),
 v(['reduce unnecessary danger','reduce danger people do not need to face','減少不必要危險'],['while still allowing','while still letting','同時容許'],['courage','brave','勇氣'],['discipline','careful','紀律'],['physical limits','strong they can be','身體極限']),
 v(['driven underground','do a sport in secret','轉入地下'],['even less safe','even more dangerous','更不安全'],['official supervision','officials can no longer check','官方監管']),
 v(['In conclusion','To sum up','總結'],['serious consequences','serious harm','嚴重後果'],['banning them','a ban','禁止'],['right solution','best answer','正確方案']),
 v(['allowed to take part','be able to do','獲准參與'],['responsibility','taking responsibility','責任'],['well-designed safety standards','well-made safety rules','良好安全標準'],['outright prohibition','complete ban','全面禁止']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula:parts.map(([text,kind,label])=>kind==='slot'?`[${label}]`:text).join(''),meaning,usage,parts}}
const specs=[
 {example:'Risk has always been part of travel, yet the question is whether the state should remove that risk by banning dangerous journeys altogether.',d:[1,3,7],relation:'yet 把普遍風險轉成是否全面禁止的政策問題',formula:'Risk has always been part of [活動], yet the question is whether the state should remove that risk by banning [高風險活動] altogether',meaning:'運動本有風險，問題是政府應否全面禁止。',links:['Risk has always been part of ', ', yet the question is whether the state should remove that risk by banning ', ' altogether.'],labels:['有風險的活動','可能被禁的活動']},
 {example:'While supporters of prohibition believe this would protect people from serious harm, I firmly believe that adults should remain free to choose difficult journeys, provided that proper safety rules are enforced.',d:[0,3,7],relation:'While 承認保護論，provided that 加選擇自由的安全條件',formula:'While [禁令保護論], I believe adults should remain free to choose [活動], provided that [安全規則]',meaning:'作者支持成年人自由選，條件是安全規則執行。',links:['While supporters of prohibition believe this would protect people from serious harm, I firmly believe that adults should remain free to choose ', ', provided that proper safety rules are enforced.'],labels:['成人可選活動']},
 {example:'Those who favour banning dangerous journeys have a reasonable concern: some activities can lead to severe injury or death even when participants are experienced.',d:[0,7,13],relation:'冒號公平展開反方合理傷害憂慮',formula:'Those who favour banning [活動] have a reasonable concern: [嚴重後果] even when [有經驗]',meaning:'有經驗者也可重傷甚至死亡。',links:['Those who favour banning ', ' have a reasonable concern: some activities can lead to severe injury or death even when participants are experienced.'],labels:['被主張禁止的活動']},
 {example:'Sports such as mountain biking, boxing, motor racing, and skydiving do not merely involve mild discomfort; one mistake can cause permanent damage.',d:[0,7,13],relation:'not merely ...; ... 強調錯誤後果可永久',formula:'Sports such as [例子] do not merely involve mild discomfort; one mistake can cause permanent damage',meaning:'攀岩拳擊賽車跳傘一失誤或永久受傷。',links:['Sports such as ', ', boxing, motor racing, and skydiving do not merely involve mild discomfort; one mistake can cause permanent damage.'],labels:['首項高風險運動']},
 {example:'If an amateur sailor ignores bad weather, for instance, rescue teams may have to risk their own lives to save him.',d:[0,7,13],relation:'If 例子展示救援者也承受風險',formula:'If [參與者] ignores [危險訊號], rescue teams may have to risk their own lives',meaning:'業餘攀岩者忽略天氣，可令救援隊冒險。',links:['If an amateur ', ' ignores bad weather, for instance, rescue teams may have to risk their own lives to save him.'],labels:['高風險參與者']},
 {example:'In this sense, dangerous journeys can create costs not only for the individual but also for families, medical services, and the wider community.',d:[0,7,13],relation:'not only ... but also 擴大個人風險到社會成本',formula:'[活動] can create costs not only for the individual but also for [其他承擔者]',meaning:'傷害成本不只個人，亦有家庭醫療和社區。',links:['In this sense, ', ' can create costs not only for the individual but also for families, medical services, and the wider community.'],labels:['帶外部成本的活動']},
 {example:'From this perspective, a ban may seem like a simple way to prevent avoidable accidents.',d:[0,7,13],relation:'From this perspective 公平概括禁令吸引力',formula:'From this perspective, a ban may seem like a simple way to prevent avoidable [後果]',meaning:'禁令似能阻止可避免悲劇。',links:['From this perspective, a ban may seem like a simple way to prevent avoidable '],labels:['欲避免的後果']},
 {example:'However, I believe this argument goes too far because personal freedom should not be sacrificed simply because an activity contains uncertainty.',d:[0,3,13],relation:'because 指出有風險不自動足以剝奪自由',formula:'However, I believe this argument goes too far because personal freedom should not be sacrificed simply because an activity contains [風險]',meaning:'作者反對只因有風險便犧牲自由。',links:['However, I believe this argument goes too far because personal freedom should not be sacrificed simply because an activity contains '],labels:['活動所含風險']},
 {example:'Many meaningful human experiences, from hiking alone to starting a business, involve danger or uncertainty, but society does not ban them for that reason.',d:[0,3,13],relation:'from ... to ... 用其他有風險經驗測試禁令邏輯',formula:'Many meaningful experiences, from [例一] to [例二], involve danger or uncertainty, but society does not ban them for that reason',meaning:'獨遊創業有風險，社會也不因此禁止。',links:['Many meaningful human experiences, from ', ' to starting a business, involve danger or uncertainty, but society does not ban them for that reason.'],labels:['另一有風險經驗']},
 {example:'A better response is careful regulation.',d:[0,3,13],relation:'短主題句提出監管取代禁令',formula:'A better response is [替代做法]',meaning:'作者選嚴格監管。',links:['A better response is '],labels:['比禁令好的做法']},
 {example:'For example, diving centres can require professional instructors, medical checks, age limits, high-quality equipment, and emergency procedures.',d:[0,3,13],relation:'例子列五項可執行安全要求',formula:'For example, [機構] can require [教練檢查年齡設備與程序]',meaning:'跳傘中心可設教練體檢年齡裝備緊急程序。',links:['For example, ', ' centres can require professional instructors, medical checks, age limits, high-quality equipment, and emergency procedures.'],labels:['有監管責任的機構']},
 {example:'These measures reduce unnecessary danger while still allowing people to test their judgement, discipline, and physical limits.',d:[0,3,13],relation:'while 並列減風險與保留體驗',formula:'These measures reduce unnecessary danger while still allowing people to test [個人能力]',meaning:'規則減危險，仍容許考驗勇氣紀律身體。',links:['These measures reduce unnecessary danger while still allowing people to test their ', ', discipline, and physical limits.'],labels:['可測試的第一能力']},
 {example:'If a pastime is driven underground by a ban, it may become even less safe because participants will no longer operate under official supervision.',d:[0,3,13],relation:'If 禁令轉地下可失官方監管而更危險',formula:'If [活動] is driven underground by a ban, it may become even less safe because [監管消失]',meaning:'禁令可令活動轉地下，失監管更不安全。',links:['If a ', ' is driven underground by a ban, it may become even less safe because participants will no longer operate under official supervision.'],labels:['被推入地下的活動']},
 {example:'In conclusion, although dangerous journeys can produce serious consequences, banning them is not the right solution.',d:[0,3,8],relation:'although 承認後果，仍否定禁令',formula:'In conclusion, although [活動] can produce serious consequences, banning them is not the right solution',meaning:'危險運動後果嚴重，禁令仍非正解。',links:['In conclusion, although dangerous ', ' can produce serious consequences, banning them is not the right solution.'],labels:['被討論的高風險活動']},
 {example:'People should be allowed to take part in these activities because freedom, responsibility, and well-designed safety standards are a stronger answer than a complete ban.',d:[0,3,8],relation:'because 結論比較自由責任安全與全面禁止',formula:'People should be allowed to take part because [自由責任安全] are a stronger answer than [禁令]',meaning:'自由責任及良好安全標準勝全面禁止。',links:['People should be allowed to take part in these activities because freedom, responsibility, and well-designed safety standards are a stronger answer than ', '.'],labels:['較弱的禁止方式']},
];
const usage=[
 '當你要由某活動本有風險，提出政府應否全面禁止的政策問題時。',
 '當你要用 While 承認保護理由，再用 provided that 為自由加條件時。',
 '當你要先公平說明反方的嚴重後果擔憂時。',
 '當你要用 not merely ...; ... 說明風險可能超過輕微不適時。',
 '當你要用 If 例子顯示個人冒險也可能讓第三者承擔風險時。',
 '當你要用 not only ... but also ... 擴展個人成本到家庭社會時。',
 '當你已列風險，需公平概括禁令為何看似簡單有效時。',
 '當你要指出「有風險」不足以自動推導全面剝奪選擇時。',
 '當你要用其他同樣有風險的活動測試一條禁令原則時。',
 '當你要以短主題句提出比禁令更合比例的替代方案時。',
 '當你要列出一組具體且可執行的安全要求時。',
 '當你要用 while 同時保留參與機會並降低不必要危險時。',
 '當你要用 If 說明禁止可能把活動推入更難監督的地方時。',
 '當結論要承認後果嚴重，仍判全面禁止不適當時。',
 '當你要用 because 比較有條件自由與全面禁止何者更有效時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先尊重風險論，再分清監管與禁令。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對危險運動禁令的看法是甚麼？',['反對全面禁止，支持嚴格安全監管。','支持任何運動都無規則。','支持一旦有風險便永久禁用。','認為救援人員從不承受風險。'],'自由以安全規則為條件。'),{type:'multi',prompt:'哪兩種後果需同時考慮？',detail:'選兩項，再按「確認」。',options:['參與者及救援者可能受傷。','禁令可把活動推向地下，失去監管。','所有風險必然完全可避免。','有禁令後不可能再有人參與。'],correct:[0,1],why:'風險與禁令的副作用都在範文。'}];
const route=[sequence('還原四段討論',[['引言','風險存在，政策選擇是禁令或有條件自由。'],['禁令派','重傷死亡和救援外部成本，禁令看似可避悲劇。'],['監管派','其他有風險經驗亦不禁；具體安全規則可降風險，禁令或轉地下。'],['結論','承認嚴重後果，仍選自由責任與安全標準。']],'接受反方風險不代表必須接受其禁令。')];
const evidence=[quiz('反方指出甚麼嚴重後果？',['有經驗者亦可重傷死亡，救援隊也可能冒險。','所有參與者只會有輕微不適。','救援隊永遠不用出動。','風險只會影響運動器材外觀。'],'個人與第三者風險均被提出。'),quiz('作者為何提獨自旅行和創業？',['兩者也有風險，但社會並不因此全面禁止。','證明所有旅行都比跳傘危險。','證明創業必然沒有任何不確定。','只想比較交通工具的價格。'],'用類比測試禁止原則。'),quiz('跳傘中心可採哪幾項措施？',['教練、體檢、年齡限制、裝備與緊急程序。','只張貼一張沒有內容的海報。','只規定所有人必須跳傘。','取消一切官方安全檢查。'],'監管可具體執行。'),quiz('禁令為何可能反令活動更危險？',['轉入地下後參與者可能失去官方監督。','禁令必然保證所有人立即守法。','地下活動必然比合法活動更容易監管。','禁令會自動提升每件裝備品質。'],'禁止的副作用需考慮。'),quiz('結論如何平衡自由與安全？',['成年人可參與，並由責任及安全標準降低危險。','只保留自由，完全不執行安全規則。','只保留禁令，完全不考慮成人選擇。','把所有運動風險說成不存在。'],'provided that 是核心限制。')];
const logic=[sequence('風險與外部成本',[['活動風險','一個錯誤或造成永久傷害。'],['救援例子','壞天氣出事，救援隊也需冒險。'],['社會成本','家庭、醫療與社區同受影響。'],['反方推論','禁令似乎可避免悲劇。']],'先準確呈現禁令派的理由。'),sequence('監管替代禁令',[['原則','有風險不自動等於全面禁止。'],['措施','教練體檢年齡裝備與應急程序。'],['雙重結果','減不必要風險，保留成人選擇。'],['禁令副作用','活動轉地下後或更難監督。']],'安全規範與自由可並存。')];
const transfers=[
 transfer('業餘攀岩者無視暴雨，救援隊被迫進山。','哪句呈現反方最強憂慮？',['參與者失誤也可能讓救援人員承擔生命風險。','攀岩者出事只影響本人，救援隊永遠不需行動。','只要救援隊有經驗，惡劣天氣便不可能有危險。','業餘人士失誤只會帶來輕微不適，沒有其他成本。'],['外部風險是反方理由。','可能影響救援。','天氣仍有風險。','後果可嚴重。'],[4,5],'amateur climber→rescue risk。'),
 transfer('一項高風險運動有嚴重受傷案例。','哪句避免直接跳到全面禁令？',['應比較風險與安全規管，不能只因有風險便禁。','既然有人受傷，所有有風險的生活經驗都須禁止。','只要有受傷案例，就證明安全裝備永遠沒有作用。','傷害嚴重時，任何成年人都不應擁有選擇權。'],['風險不自動推出禁令。','推論過廣。','裝備可降低風險。','選擇可有條件。'],[7,8,9],'risk alone insufficient for ban。'),
 transfer('跳傘中心想降低風險而保留成人參與。','哪句提供具體監管做法？',['可設專業教練、體檢、年齡限制與緊急程序。','只需售更多門票，無須檢查健康與裝備。','應完全取消教練，因成年人自然懂得全部操作。','安全規則只需寫在網站，現場不必執行程序。'],['具體可執行規則。','未防風險。','教練重要。','要執行。'],[10,11],'instructors/medical/age/emergency。'),
 transfer('某地禁止一項運動後，參與者改在秘密場所進行。','哪句分析禁令副作用？',['轉入地下可能令官方更難監督，活動反而更危險。','秘密場所自然會有更高設備標準和更完整的紀錄。','只要政府宣布禁令，地下活動便必然立即停止。','轉入地下只影響場地名稱，與安全和監督沒有關係。'],['地下化可削弱監督。','無保證。','未必停止。','有關。'],[12],'underground→less official supervision。'),
 transfer('另一題討論是否禁止高風險戶外旅行。','哪句能轉用本文框架？',['可考慮個人自由、救援成本及安全許可制度。','只要旅行有風險，政府便必須禁止所有外出活動。','只要旅行有樂趣，救援隊的風險便不必再分析。','安全許可與成人選擇完全無關，不值得作比較。'],['自由、外部成本及監管可跨題。','過廣。','仍有外部成本。','可比較。'],[5,7,10,12],'external costs plus regulation。'),
 transfer('有人說「只要准許，就表示政府可不管安全」。','哪句指出誤解？',['允許參與可以安全規則獲執行為前提，而非放任。','允許運動便必須取消所有教練與體檢要求。','只要成年人自願，任何救援或醫療成本都會消失。','有安全規則就等於全面禁止，兩者沒有任何差別。'],['provided that 設條件。','相反。','成本仍在。','不同。'],[1,10,11],'free choice provided safety rules enforced。'),
 transfer('作文只說「危險運動有代價」，未說代價給誰。','哪句補足？',['個人、家人、醫療系統和社區都可能分擔後果。','運動代價只會落在球鞋與保護衣物的價格上。','只要參與者自願，家人便保證不會受到影響。','救援出動與醫療服務都不可能產生社會成本。'],['not only individual but also community。','範圍過窄。','可影響家人。','可有成本。'],[5],'costs not only individual。'),
 transfer('有人用獨自旅行和創業作類比。','其論證功能是甚麼？',['指出有風險的有價值活動並非都應被全面禁止。','證明獨自旅行和創業一定比所有運動都更危險。','證明所有活動的風險完全相同，無須再比較。','說明只要有冒險精神，安全規管便完全沒有作用。'],['類比檢驗禁令原則。','未比較程度。','程度不同。','仍需規管。'],[8],'other risky experiences not banned。'),
 transfer('一份政策只寫「禁止」而沒有其他選擇。','哪句可提供較合比例方案？',['用教練、體檢、裝備及緊急程序降低不必要危險。','用全面禁令取代所有安全檢查，便保證沒人再冒險。','不設任何規則，讓所有人自行承擔救援和醫療成本。','只規定場地關門時間，卻不理會參與者身體狀況。'],['監管具體對準風險。','禁令可能轉地下。','外部成本。','不足。'],[9,10,11],'strict regulation as better response。'),
 transfer('結論須承認危險又拒絕全面禁止。','哪句最完整？',['嚴重傷害確有可能，但有條件自由與安全規範較合適。','只要傷害可能發生，就必須永遠取消所有高風險活動。','只要成年人願意，所有安全規範都應立即完全取消。','一切風險都是想像，所以政策完全不需要任何規則。'],['although 承認後果，選替代方案。','過度。','放任。','否認風險。'],[13,14],'serious consequence but not ban。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["參與者失誤也可能讓救援人員承擔生命風險。","參與者自己選擇冒險，因此救援風險主要由他承擔。","救援人員有經驗，暴雨中的行動應視作日常工作。","攀岩者失誤造成救援開支，但不影響隊員的人身安全。"],["應比較風險與安全規管，不能只因有風險便禁。","傷害案例說明要加強勸告，運動規則則可維持原樣。","若傷害可能嚴重，先全面禁運動，再討論安全安排。","成年人有選擇自由，故風險評估只需由個人完成。"],["可設專業教練、現場體檢、年齡限制與緊急程序。","可增設教練和現場說明，體檢與緊急程序稍後再談。","可限制年齡和增加保險，裝備與教練則由個人決定。","可檢查裝備與健康，教練資格及應急安排仍可省略。"],["轉入地下可能令官方更難監督，活動反而更危險。","禁令減少公開場地，因此官方更容易掌握剩餘活動。","秘密場所可避開申報程序，風險主要來自參與者技術。","轉到地下後仍可照常檢查裝備，監督問題不必討論。"],["可考慮個人選擇自由、救援成本及安全許可制度。","可比較個人自由與旅遊收入，卻不談救援人員風險。","可衡量戶外樂趣與場地租金，卻略過安全許可制度。","可討論救援開支與宣傳效果，但不評估成年人的選擇。"],["允許參與可以安全規則獲執行為前提，而非放任。","政府可准許參與，安全規則則交由中心自行選擇執行。","成年人可自願參與，但教練和體檢只作參考建議。","安全制度有助減風險，故准許參與即可停止監督。"],["個人、家人、醫療系統和社區都可能分擔後果。","參與者和保險公司會付費，家人及社區則不受波及。","傷者需醫療服務，但救援者的危險可留待之後分析。","家人可能擔心，醫療和社區成本則由個人處理。"],["指出有風險的有價值活動並非都應被全面禁止。","類比說明創業也有風險，因此運動應用相同安全規則。","旅行和創業都有收益，故運動風險可交由市場處理。","類比支持保留選擇，但未說明運動為何仍需規管。"],["用教練、體檢、裝備及緊急程序降低不必要危險。","以入場聲明提醒風險，教練與體檢則由參與者決定。","只增加裝備規格，對健康狀況和應急程序不作安排。","由場地安排緊急聯絡，日常教練監督可暫時省略。"],["嚴重傷害確有可能，但有條件自由與安全規範較合適。","傷害值得關注，故先暫停活動，安全制度待日後再議。","成年人可自由參與，嚴重傷害則交由保險處理。","有規則便可降低風險，所以結論可少談及危險。"]];
const editorialTransferReasons=[["選擇由個人作出，救援風險卻可能落到他人身上。","經驗不能消除惡劣天氣的人身風險。","救援隊員的生命風險不能只算成費用。"],["若不改規則，難以有效回應已見傷害。","傷害可能發生仍不足以直接全面禁止。","個人自由之外仍有公共安全後果。"],["完整方案還須體檢與緊急程序。","保險不能取代教練和裝備的風險預防。","教練和應急安排也屬安全制度核心。"],["轉入地下通常令活動更難監督。","申報減少本身就是監督風險。","地下場所未必接受日常裝備檢查。"],["救援風險是這道題要衡量的公共成本。","場地租金不能代替救援和安全制度。","政策仍須權衡成人選擇權。"],["規則須實際執行，不能只交中心自由決定。","體檢和教練若只屬建議，保障不足。","准許活動後仍需要監督規則。"],["家人和社區也可能承受後果。","救援人員風險正是需說清的成本。","醫療與社區並不只由個人承擔。"],["不同活動需要按自身風險設計規則。","市場收益不能取代安全監管。","類比須同時支持自由與適當規管。"],["聲明不能代替教練與體檢。","只管裝備，仍漏掉健康和緊急程序。","應急聯絡不能取代持續的教練指導。"],["結論要選有條件准許，不只是延後決定。","保險不能取代預防傷害的規範。","規則減低危險，不能說危險不存在。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[12].frame.parts=[["If ","link","句型固定部分"],["a sport","slot","活動"],[" is driven underground by a ban, it may become even less safe because ","link","句型固定部分"],["participants will no longer operate under official supervision.","slot","監管消失"]];
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["While ","link","句型固定部分"],["supporters of prohibition believe this would protect people from serious harm","slot","支持禁止的理由"],[", I firmly believe that adults should remain free to choose ","link","句型固定部分"],["such sports","slot","受爭議的活動"],[", provided that ","link","句型固定部分"],["proper safety rules are enforced","slot","應執行的安全條件"],[".","link","句型固定部分"]];
structures[1].frame.formula="While [支持禁止的理由], I firmly believe that adults should remain free to choose [受爭議的活動], provided that [應執行的安全條件].";
structures[4].frame.parts=[["If ","link","句型固定部分"],["an amateur climber","slot","參與者"],[" ignores ","link","句型固定部分"],["bad weather","slot","危險訊號"],[", for instance, rescue teams may have to risk their own lives to save him.","link","句型固定部分"]];
structures[4].frame.formula="If [參與者] ignores [危險訊號], for instance, rescue teams may have to risk their own lives to save him.";
structures[14].frame.parts=[["People should be allowed to take part in ","link","句型固定部分"],["these activities","slot","受爭議的活動"],[" because ","link","句型固定部分"],["freedom, responsibility, and well-designed safety standards","slot","保留活動的理由"],[" are a stronger answer than ","link","句型固定部分"],["outright prohibition","slot","全面禁止"],[".","link","句型固定部分"]];
structures[14].frame.formula="People should be allowed to take part in [受爭議的活動] because [保留活動的理由] are a stronger answer than [全面禁止].";
// Keep the displayed formula synchronized with the exact fixed and replaceable source spans.
for(const card of structures)card.frame.formula=card.frame.parts.map(part=>{const [text,kind,label]=Array.isArray(part)?part:[part.text,part.kind,part.label];return kind==='slot'?`[${label}]`:text}).join('');
export default {key:'discuss-both-views:35',meta:{topic:'政府應否禁止危險運動',summary:'禁令派指出重傷與救援社會成本；作者承認風險，但主張有安全規則的成人自由，並指出全面禁止可把活動推入地下。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
