// Fixed punishments: the essay's consistency-versus-context argument, not legal advice.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:7'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many places, judges choose a punishment after looking at the crime and what happened around it.',
 'But some people say the same set punishment for each crime would make the system work faster.',
 'This system has some practical good points. Still, I think its problems are much bigger because it may be unfair and could make crime worse later.',
 'The main good point is that set punishments could make court work quicker and simpler.',
 'If each offence already had a set penalty, courts would spend less time deciding it. Cases could move faster and cost less to handle.',
 'So cases could finish sooner, and victims might wait less time for an answer.',
 'Another good point is that decisions could be more alike.',
 'When penalties are the same for the same kind of crime, similar offences are more likely to get similar penalties. This may help people trust the justice system.',
 'For example, set fines and driving bans for road offences may seem fair to some people because the rules are clear and easy to understand.',
 'But the problems with this system are more serious.',
 'Most of all, set punishments do not take account of how crimes differ in why they happened, how serious they were and the situation.',
 'Someone who steals food because they have no money should not always get the same punishment as a person who steals again and again to make money.',
 'If the law ignores these differences, it may follow a rule without being fair.',
 'Also, inflexible punishments can make it harder for people to change and may leave society less safe.',
 'If a first-time or low-risk offender gets the same punishment as someone with a long serious criminal history, they may leave prison feeling less connected, with fewer job chances and a greater risk of committing a crime again.',
 'For example, a teenager in a small drug case may be drawn further into crime if treated just like an experienced dealer.',
 'To sum up, set punishments may make courts faster and decisions more alike, but these problems are more serious.',
 'Because a fair decision must consider both the act and the person, a system that can adjust the sentence to the case is fairer and works better.',
];
const vocabulary=[
 v(['legal systems','places','法律制度'],['judges','judges','法官'],['decide punishments','choose a punishment','決定刑罰'],['circumstances surrounding it','what happened around it','案情背景']),
 v(['however','But','然而'],['fixed punishments','same set punishment for each crime','固定刑罰'],['more efficient','work faster','更有效率']),
 v(['practical benefits','practical good points','實際好處'],['considerably greater','much bigger','大得多'],['undermine justice','be unfair','損害公正'],['worsen crime in the long term','make crime worse later','長遠或加重犯罪問題']),
 v(['main advantage','main good point','主要優點'],['fixed sentencing','set punishments','固定判刑'],['faster and more straightforward','quicker and simpler','更快更簡單']),
 v(['predetermined','already had a set penalty','預先決定'],['appropriate sentence','deciding it','合適刑罰'],['reduce delays','move faster','減少延誤'],['lower administrative costs','cost less to handle','降低行政成本']),
 v(['As a result','So','因此'],['resolved more quickly','finish sooner','更快結案'],['victims','victims','受害者'],['wait as long for closure','wait less time for an answer','較早獲得處理結果']),
 v(['Another benefit','Another good point','另一好處'],['greater consistency','decisions could be more alike','更一致']),
 v(['standardised','same for the same kind of crime','標準化'],['similar offences','similar offences','類似罪行'],['similar penalties','similar penalties','相近刑罰'],['strengthen public confidence','help people trust','加強公眾信心']),
 v(['For example','For example','例如'],['fixed fines and licence suspensions','set fines and driving bans','固定罰款與停牌'],['traffic offences','road offences','交通違規'],['transparent','clear','透明'],['easy for the public to understand','easy to understand','公眾易理解']),
 v(['Nevertheless','But','儘管如此'],['far more serious','more serious','遠更嚴重'],['disadvantages','problems','缺點']),
 v(['Most importantly','Most of all','最重要'],['ignore the fact','do not take account','忽略'],['motive','why they happened','動機'],['severity','how serious they were','嚴重程度'],['context','the situation','情境']),
 v(['out of desperation','because they have no money','出於困境'],['automatically receive','always get','自動受到'],['repeat offender','person who steals again and again','屢犯者'],['for profit','to make money','為了牟利']),
 v(['fails to recognise','ignores','沒有辨別'],['such differences','these differences','這些差異'],['mechanical rather than fair','follow a rule without being fair','機械而欠公平']),
 v(['In addition','Also','此外'],['rigid sentencing','inflexible punishments','僵硬判刑'],['damage rehabilitation','make it harder for people to change','妨礙改過'],['less safe','less safe','較不安全']),
 v(['first-time or low-risk offenders','first-time or low-risk offender','初犯或低風險犯人'],['hardened criminals','someone with a long serious criminal history','慣犯'],['alienated','feeling less connected','感到疏離'],['less employable','fewer job chances','較難就業'],['reoffend','committing a crime again','再犯']),
 v(['For instance','For example','例如'],['minor drug offence','small drug case','較輕微毒品罪行'],['pushed further into criminal behaviour','drawn further into crime','被推向更多犯罪'],['experienced trafficker','experienced dealer','有經驗的販運者']),
 v(['In conclusion','To sum up','總結'],['improve efficiency and consistency','make courts faster and decisions more alike','提升效率及一致性'],['outweighed by','more serious','不足以抵消'],['profound weaknesses','problems','深層弱點']),
 v(['in relation to','consider','根據'],['act and the offender','act and the person','行為及行為人'],['flexible sentencing system','system that can adjust the sentence','有彈性的判刑制度'],['more just and effective','fairer and works better','更公正有效']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many legal systems, judges are expected to choose a sentence after considering both the offence and the person’s circumstances.',d:[1,6,9],relation:'引言先交代判刑通常考慮行為和背景兩面',formula:'In many legal systems, judges are expected to [決定] after considering both [行為] and [背景]',meaning:'法官按罪行本身及相關案情決定刑罰。',usage:'這是範文的背景描述，不指明任何特定國家的法律。',links:['In many legal systems, judges are expected to ', ' after considering both ', ' and ','.'],labels:['決定','行為','背景']},
 {example:'Some people, however, argue that a clear schedule of penalties would be more efficient.',d:[0,6,9],relation:'以 however 引入支持固定制度的一方主張',formula:'Some people, however, argue that [固定安排] would be more efficient',meaning:'有人認為固定刑罰會更有效率。',usage:'先公平呈現支持者的理由，後文才評估。',links:['Some people, however, argue that ', ' would be more efficient.'],labels:['固定安排']},
 {example:'While this approach does offer certain practical benefits, I believe its disadvantages are considerably greater because it removes individual judgement and may harm rehabilitation.',d:[1,9,16],relation:'承認實際好處，再明確表達更重視公正及長期效果',formula:'While this approach does offer certain practical benefits, I believe its disadvantages are considerably greater because [兩個核心問題]',meaning:'作者認為效率好處不及可能損害公正和長遠犯罪控制的弊端。',usage:'反對立場仍需完整說明對方的效率與一致性優點。',links:['While this approach does offer certain practical benefits, I believe its disadvantages are considerably greater because ','.'],labels:['兩個核心弊端']},
 {example:'The main advantage of fixed sentencing is that it would make court decisions quicker and easier to predict.',d:[2,6,9],relation:'先用主題句提出固定刑罰的程序效率好處',formula:'The main advantage of fixed sentencing is that it would [程序好處]',meaning:'固定判刑可令法律程序更快、更簡明。',usage:'這是制度可能帶來的程序好處，下一句要解釋節省時間的機制。',links:['The main advantage of fixed sentencing is that it would ','.'],labels:['程序好處']},
 {example:'If the penalty for each offence were predetermined, courts would need fewer hearings to choose a sentence, which would reduce delays and lower administrative costs.',d:[2,7,12],relation:'以 If→法院少討論→which 指出時間成本結果',formula:'If the penalty for each offence were predetermined, courts would [減少程序], which would [時間／成本效果]',meaning:'若刑罰預定，法院少花時間爭論合適刑期，延誤與行政成本可能下降。',usage:'假設句中的 would 保留推測，不是已觀察到的統計。',links:['If the penalty for each offence were predetermined, courts would ', ', which would ','.'],labels:['程序變化','時間與成本效果']},
 {example:'As a result, cases could be closed sooner, and victims would not have to wait so long for a decision.',d:[3,7,12],relation:'由程序效率推至個案完成與受害者較早獲答覆',formula:'As a result, cases could be [處理更快], and victims would not have to [等待後果]',meaning:'案件可快結，受害者不用等太久才有結果。',usage:'closure 是程序或情緒上的結束感，不要保證每位受害者的感受相同。',links:['As a result, cases could be ', ', and victims would not have to ','.'],labels:['處理速度','等待時間']},
 {example:'Another benefit is more predictable decisions.',d:[2,9,13],relation:'轉入與速度不同的第二優點：一致性',formula:'Another benefit is [第二好處]',meaning:'第二好處是類似案件判刑更一致。',usage:'短句須由下一句相似罪行相近刑罰的機制支援。',links:['Another benefit is ','.'],labels:['第二好處']},
 {example:'When punishments are standardised, similar offences are more likely to receive predictable penalties, which may strengthen public confidence in the justice system.',d:[4,10,13],relation:'把標準化連到相似案件結果和可能的公眾信心',formula:'When punishments are standardised, similar offences are more likely to receive [相近結果], which may [公眾反應]',meaning:'標準化提高相似案件結果一致性的可能性，或增強信心。',usage:'similar offences 仍可能有不同背景；一致性不等於充分公正。',links:['When punishments are standardised, similar offences are more likely to receive ', ', which may ','.'],labels:['相近結果','可能效果']},
 {example:'For example, fixed late fees for library books are often accepted because they are clear and easy for readers to understand.',d:[5,10,13],relation:'以透明易懂的固定規則例子支援一致性',formula:'For example, [固定規則] are often accepted because they are [透明易懂的特點]',meaning:'固定交通罰款和停牌制度常因透明、易懂而被接受。',usage:'這是範文舉例，不可推論所有罪行都適用同一固定規則。',links:['For example, ', ' are often accepted because they are ','.'],labels:['固定規則','易懂特點']},
 {example:'Nevertheless, the losses of context and rehabilitation are far more serious.',d:[3,6,13],relation:'以 Nevertheless 從程序好處轉向更重的公正弊端',formula:'Nevertheless, [弊端] are far more serious',meaning:'作者認為這些制度缺點比效率與一致性更嚴重。',usage:'短轉折句後要列出動機、嚴重程度、情境的差異。',links:['Nevertheless, ', ' are far more serious.'],labels:['弊端']},
 {example:'Most importantly, fixed punishments ignore the fact that offences can differ in motive, harm and context.',d:[4,7,13],relation:'說明固定刑罰忽略罪案的多維度差異',formula:'Most importantly, fixed punishments ignore the fact that [罪案差異]',meaning:'罪案在動機、嚴重程度、情境上差別很大。',usage:'這是公平性論證的核心；要具體比較兩種差異案件。',links:['Most importantly, fixed punishments ignore the fact that ','.'],labels:['罪案差異']},
 {example:'A person who takes medicine because of an emergency should not automatically receive the same sentence as someone who repeatedly steals for profit.',d:[4,8,14],relation:'以兩種動機及背景不同的個案測試一刀切',formula:'A person who [低風險／困境情況] should not automatically receive the same sentence as [重複牟利情況]',meaning:'因困境偷食物與屢次為牟利偷竊的人不應自動同刑。',usage:'這是範文的公平性例子，不代替任何司法管轄區的實際判刑規則。',links:['A person who ', ' should not automatically receive the same sentence as ','.'],labels:['第一情況','第二情況']},
 {example:'If the law fails to recognise such differences, sentencing becomes rigid rather than fair.',d:[4,8,15],relation:'總結忽略案情差異會使制度機械化而欠公平',formula:'If the law fails to recognise such differences, [判刑結果] becomes mechanical rather than fair',meaning:'若法律不辨動機與案情，公正性會被機械規則取代。',usage:'這是對制度設計的規範性評價，不是對所有現行法律的事實指控。',links:['If the law fails to recognise such differences, ', ' rather than fair.'],labels:['制度後果']},
 {example:'In addition, rigid sentencing can hinder rehabilitation and ultimately make society less safe.',d:[4,9,16],relation:'補充公正以外的長期改過與安全風險',formula:'In addition, rigid sentencing can [阻礙改過] and ultimately make society less safe',meaning:'僵硬判刑可能傷害改過過程，長遠或不利安全。',usage:'can 表可能性；後面須交代把低風險者與慣犯同等處理的機制。',links:['In addition, rigid sentencing can ', ' and ultimately make society less safe.'],labels:['阻礙改過']},
 {example:'When first-time or low-risk offenders are given the same punishment as hardened criminals, they may leave prison more isolated, less able to find work and more likely to offend again.',d:[5,10,17],relation:'以同等處理不同風險者推演可能的疏離、就業及再犯後果',formula:'When [低風險者] are given the same punishment as [高風險者], they may leave prison [幾個可能後果]',meaning:'初犯／低風險者被如同慣犯處理，可能更疏離、難就業、再犯。',usage:'may 保留因果不確定性；不可說固定刑罰必然令所有人再犯。',links:['When first-time or low-risk offenders are given the same punishment as hardened criminals, they may leave prison ', ', ', ' and ','.'],labels:['後果一','後果二','後果三']},
 {example:'For instance, a teenager involved in a minor theft may be pushed further into criminal behaviour if treated identically to an experienced repeat offender.',d:[5,11,17],relation:'用低風險青年與高經驗罪犯的對照落實長期風險',formula:'For instance, a teenager involved in [較輕個案] may be pushed further into criminal behaviour if treated identically to [較嚴重對照]',meaning:'較輕毒品案的青少年若等同有經驗販運者處理，或更陷入犯罪。',usage:'例子說可能後果，不是對某年齡層或罪名的實證斷言。',links:['For instance, a teenager involved in ', ' may be pushed further into criminal behaviour if treated identically to ','.'],labels:['較輕個案','對照者']},
 {example:'In conclusion, fixed punishments may improve speed and predictability, but these benefits are outweighed by their lack of individual judgement.',d:[2,9,15],relation:'公平回顧效率一致性，再作更重缺點的最後權衡',formula:'In conclusion, fixed punishments may improve [程序好處], but these benefits are outweighed by [核心弊端]',meaning:'固定刑罰可能提高效率與一致性，但作者認為深層弱點更大。',usage:'outweighed 要有正文已論證的兩種好處與兩種更重大缺點支持。',links:['In conclusion, fixed punishments may improve ', ', but these benefits are outweighed by ','.'],labels:['好處','弊端']},
 {example:'Because crime must be judged in relation to both the harm caused and the offender’s circumstances, a flexible sentencing system is clearly the more just and effective approach.',d:[2,10,15],relation:'用 because 把案情與行為人兩軸連到彈性制度立場',formula:'Because crime must be judged in relation to both [行為或傷害] and [行為人背景], a flexible sentencing system is clearly the more just and effective approach',meaning:'作者主張同時看行為與行為人，以彈性判刑維持公正。',usage:'句子表達範文立場；實際法律制度仍取決於司法管轄區。',links:['Because crime must be judged in relation to both ', ' and ', ', a flexible sentencing system is clearly the more just and effective approach.'],labels:['行為','行為人']},
];
const usageGuides=[
 '當你要先交代一種現行做法如何同時考慮兩類因素，再引入改革爭議時。',
 '當你要用 however 引出另一方對某種制度的效率主張時。',
 '當你要先承認實際好處，再用 because 明確說明為何弊端權重更大時。',
 '當你要用一個主題句點出某做法最主要的程序好處時。',
 '當你要以 If 提出制度假設，再用 which 連到時間與成本等後續結果時。',
 '當你要用 As a result 從程序變化推到使用者或受影響者的等待時間時。',
 '當你要從第一項好處轉到性質不同的第二項好處時。',
 '當你要解釋標準化如何令相似情況得到較相近的結果，並用 which 補可能的公眾反應時。',
 '當你要舉出一個規則清晰、容易理解的例子來支持有限的好處時。',
 '當你已說明好處，接着要以 Nevertheless 轉入作者認為更重的弊端時。',
 '當你要指出統一做法忽略了幾個重要的個案差異時。',
 '當你要比較表面同類、但動機或背景不同的兩種情況時。',
 '當你要用 If 說明忽略相關差異會令判斷變得機械而欠公平時。',
 '當你要在第一類弊端以外，再加入一項長期後果時。',
 '當你要比較不同風險群體接受相同處理後可能出現的多個後果時。',
 '當你要用一對輕重不同的例子說明一刀切處理可能帶來的風險時。',
 '當你在結論先回顧好處，再說明為何它們不足以抵消更重的缺點時。',
 '當你要用 Because 說明判斷須看兩個面向，進而支持較有彈性的方案時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把固定規則的效率、一致性和忽略案情、改過風險逐一配對。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('題目要求分析甚麼制度？',['所有罪行採固定刑罰的優點與缺點','只討論交通安全教育','只討論法官薪酬','只討論某一國既有法例'],'題目問 advantages and disadvantages of a fixed punishment。'),
 {type:'multi',prompt:'範文的兩條主要弊端是甚麼？',detail:'選兩項，再按「確認」。',options:['一刀切可能忽略動機、嚴重程度和案情','同等處理不同風險者或妨礙改過','每件案件都必定更慢','透明規則完全沒有任何好處'],correct:[0,1],why:'效率與一致性是範文承認的優點，兩個大弊端是公正與長期效果。'},
];
const route=[sequence('依範文重排固定刑罰利弊',[
 ['引言','通常會考慮罪行與案情；有人主張固定刑罰較有效率，作者反對。'],
 ['程序好處','少花時間決定刑罰，案件可能快結、成本下降。'],
 ['一致性好處','相似罪行較可能得相近結果；透明規則較易理解。'],
 ['公正弊端','不同動機、嚴重程度、案情不應機械地同刑。'],
 ['長期弊端與結論','僵硬處理或妨礙改過；作者主張同時看行為與行為人。'],
 ],'例子用於理解範文論證，不代表任何特定法律的實際規則。')];
const evidence=[
 quiz('固定刑罰最直接的程序好處？',['少爭論刑期，可能縮短案件處理與行政成本','保證每個案件都公正','自動消除所有犯罪','完全不用法庭'],'固定結果可減少部分判刑討論，但並非處理全部問題。'),
 quiz('「一致性」在文中指甚麼？',['相似罪行較可能有相似刑罰','不同罪行全都必須同刑','所有法官意見完全一致','所有受害者感受一樣'],'standardised 針對相似情況的結果。'),
 quiz('偷食物者與牟利屢犯者的對照在測試甚麼？',['固定規則會否忽略動機和個案背景','哪個國家食品較便宜','所有偷竊行為都無害','當事人一定已有相同犯罪史'],'同名罪行也可有重大差異。'),
 quiz('為何同等處理初犯與慣犯可能不利長期安全？',['低風險者或更疏離、難就業，增加再犯風險','所有初犯必然再犯','所有慣犯都不需改過','判刑與後續生活完全無關'],'原文用 may，因果屬可能風險。'),
 quiz('作者最後選擇甚麼原則？',['判刑要看行為及行為人，保留個案判斷','每件罪行都用完全相同刑期','只看行為人而不看行為','只看處理速度不看公正'],'結論回應公正與有效的權衡。'),
];
const logic=[
 sequence('固定規則的程序利與公正弊',[
  ['預定刑罰','法院少花時間討論合適刑期。'],['效率結果','可較快結案、減少部分行政成本。'],
  ['缺少彈性','相同罪名可能有不同動機、傷害及背景。'],['公正結果','一刀切可能變得機械，不能充分看個案。'],
 ],'「處理更快」和「處理更公正」是不同評價標準。'),
 sequence('一致性與長期效果的權衡',[
  ['相似案件','標準化可能令結果更一致、規則較透明。'],['不同風險者','初犯和嚴重慣犯若同等處理，可能妨礙改過。'],
  ['範文例子','較輕微個案的青少年與有經驗販運者不宜機械同等處理。'],['作者判斷','效率與一致性未能抵消公正和長期安全風險。'],
 ],'所有實際刑事判斷仍須依具體地區法律，這裡只學範文論證。'),
];
const transfers=[
 transfer('學校考慮對所有遲交作業一律扣同樣分數。','哪句公平呈現固定規則的好處？',['同一規則較易理解及執行，也可能減少老師逐案討論的時間。','固定規則保證每位學生都得到最公平結果。','學校因此不再需要老師。','規則越簡單，所有學生成績便越高。'],['透明與效率是可推論好處。','無公平保證。','仍需老師。','無成績保證。'],[3,4,7],'原文 faster legal process，standardised penalties increase consistency。'),
 transfer('兩名學生同樣遲交，一人因突發病情，一人反覆無故遲交。','哪句測試一刀切的公正性？',['相同行為仍可能有不同原因與背景，處理時宜辨別。','兩人原因不同，但一定必須完全同樣處理。','病情代表作業不用完成。','反覆遲交與首次遲交沒有任何差異。'],['同名行為也有情境差異。','忽略背景。','無此必然。','有頻率差異。'],[10,11,12],'原文 motive/severity/context；desperation versus repeat profit theft。'),
 transfer('機構以標準表格處理簡單申請，特殊情況再人工審核。','哪句準確分開效率與個別判斷？',['標準流程可處理相似個案，特殊情況仍需另作判斷。','有標準流程便毋須看任何個別情況。','只要人工判斷，所有申請都會拖延數年。','透明與彈性永遠不能並存。'],['保留一致性，也留處理特殊情況空間。','過度一刀切。','無時間證據。','可有分層設計。'],[7,10,17],'原文 similar offences/penalties，but differences need recognition。'),
 transfer('固定交通罰款的規則公開、易於理解。','哪句只用它證明適當範圍的優點？',['清楚規則可提高可預測性，但不能據此證明所有罪行都宜同一刑罰。','交通罰款有效，故所有嚴重罪行也應完全同刑。','公開規則會令所有人不再犯錯。','透明度與公眾理解沒有關係。'],['例子證明有限的透明好處。','過度類推。','不能保證。','有關。'],[8,9],'原文 fixed fines transparent/easy；however serious system-wide disadvantages。'),
 transfer('有人說固定刑罰可使案件更快結束。','哪句同時交代受益者？',['法院或少花時間判刑，受害者也可能較早知道處理結果。','案件一快結，每位受害者必然不再難過。','程序快便證明判刑必定公正。','所有法庭程序都可完全省略。'],['程序與等待時間的關係清楚。','情緒不保證。','快與公正不同。','仍需程序。'],[4,5],'原文 courts spend less time→cases resolved quicker→victims wait less。'),
 transfer('某固定制度讓不同背景的人因同名行為受同一處理。','哪句指出可能失去的評價維度？',['動機、嚴重程度與個案情境可能被忽略。','同名行為便保證所有案情相同。','只需比較姓名長度。','公平性只取決於處理速度。'],['三個源文本維度完整。','案情可不同。','無關。','速度非唯一。'],[10,12],'原文 motive，severity，context；mechanical rather than fair。'),
 transfer('一名低風險初犯被與經驗豐富的重犯同樣處理。','哪句謹慎描述長期可能風險？',['當事人可能更疏離、難重返工作，未來風險或增加。','所有初犯一定會因此再犯。','同樣處理必然令每人更安全。','工作機會與重返社會毫無關係。'],['may 保留不確定性，說明可能機制。','過度保證。','無此必然。','就業可影響改過。'],[14,15],'原文 may leave prison alienated/less employable/more likely to reoffend。'),
 transfer('寫利弊作文時，作者最終反對固定刑罰。','哪句先承認對方好處再給反對理由？',['固定刑罰或可更快、更一致，但忽略個案差異的代價更大。','固定刑罰完全沒有任何好處。','只要程序快便足以決定全部立場。','結論應加入正文未曾討論的新罪名。'],['效率與一致性不被抹掉，仍可作權衡。','忽略正文好處。','無視公正。','不宜新論點。'],[2,16],'原文 while practical benefits，disadvantages greater；conclusion outweighed。'),
 transfer('某套固定規則只有在同類情況才可合理比較。','哪句區分一致與一刀切？',['相似情況求相近結果，仍需留意不同背景造成的重要差異。','只要兩事名字相同，背景必然一樣。','所有差異都應被完全忽略。','一致性要求任何人任何情況完全同等。'],['一致性不抹掉相關案情。','名字非全案。','過度。','定義失真。'],[7,10,17],'原文 similar offences/penalties，but judge act and offender。'),
 transfer('本文立場是判斷須同時看行為及當事人。','哪句作理由完整的結尾？',['若同時衡量行為和行為人，制度更有機會兼顧公正與效用。','只看行為人，完全不看行為。','只看處理速度，忽略案情。','一律同刑便保證最公正。'],['兩個評價軸與作者結論一致。','漏行為。','漏公正。','與論證反。'],[17],'原文 crime judged in relation to act and offender→flexible system。'),
];
export default {key:'advantage-disadvantage:7',meta:{topic:'固定刑罰的效率、一致性與個案公正',summary:'固定刑罰可能縮短程序並使相似案件結果更一致；範文認為它忽略動機、嚴重程度及背景，也可能妨礙改過，故主張結合行為與行為人的彈性判斷。此為 IELTS 範文論證，不是特定司法管轄區的法律指引。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
