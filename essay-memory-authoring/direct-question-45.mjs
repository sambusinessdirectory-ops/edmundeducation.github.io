// Why job satisfaction feels luxurious in poorer economies, and why it still matters.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:45'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many poorer parts of the world, people judge a job more by whether it keeps them safe and paid than by how much they enjoy it.',
 'This is why feeling happy with one’s job is often seen as something only a few people can have, rather than something everyone expects.',
 'Still, I think it matters very much, because if society does not care how workers feel, it will eventually lose in how much people get done, their health and the respect they deserve.',
 'The main reason enjoying a job seems like a luxury is the need to earn enough money.',
 'Where pay is low, help for people without work is weak and many cannot find jobs, people have little choice to find work that suits what they like or believe in.',
 'They ask first whether the job pays for food, a home and their children’s schooling, rather than whether it makes them feel interested and excited.',
 'For example, someone in a factory or delivering food may work long hours in unsafe places or do the same task again and again because losing the job could hurt the whole family.',
 'When people are worried about having enough to live, feeling happy with their work becomes less important.',
 'Another reason is that workers in many poorer countries have little power to ask for better terms.',
 'Workers may lack strong groups that speak for them, clear written agreements and real chances to move up, so they find it hard to ask for better treatment.',
 'In these conditions, enjoying a job can seem possible only for people with schooling, money put aside or skills for a profession.',
 'People without these things may feel they have to take any available job, even if it leaves them very tired or feeling that others do not value them.',
 'Even so, we should not treat feeling happy with a job as unimportant.',
 'People spend a large part of life at work, so a job that makes them worried all the time can harm their mind and body.',
 'On the other hand, workers who feel respected and believe their work has a purpose are more likely to keep trying, get better at their work and help their workplace.',
 'To sum up, in many poorer countries people see enjoyment of work as a luxury because not knowing if they will have enough money leaves them few choices.',
 'Still, it is a real need rather than an extra decoration, because fair work helps make society healthier and better at producing things.',
];
const vocabulary=[
 v(['developing world','poorer parts of the world','發展中地區'],['judged less by personal fulfilment','judge a job more by whether it keeps them safe and paid than by how much they enjoy it','較少按滿足感評價'],['basic security','keeps them safe and paid','基本保障']),
 v(['job satisfaction','feeling happy with one’s job','工作滿足感'],['privilege','something only a few people can have','特權'],['ordinary expectation','something everyone expects','一般期待']),
 v(['extremely important','matters very much','極其重要'],['well-being','how workers feel','福祉'],['productivity','how much people get done','生產力'],['human dignity','respect they deserve','人的尊嚴']),
 v(['appears luxurious','seems like a luxury','顯得奢侈'],['economic pressure','need to earn enough money','經濟壓力']),
 v(['wages are low','pay is low','工資低'],['social protection is weak','help for people without work is weak','社會保障弱'],['unemployment is high','many cannot find jobs','失業率高'],['matches their interests or values','suits what they like or believe in','符合興趣價值']),
 v(['first concern','ask first','首要考慮'],['inspiring','feel interested and excited','有啟發性'],['pay for food, rent','pays for food, a home','支付食物租金'],['children’s education','children’s schooling','子女教育']),
 v(['factory worker','someone in a factory','工廠工人'],['delivery rider','delivering food','外賣配送員'],['unsafe conditions','unsafe places','不安全環境'],['repetitive tasks','same task again and again','重複任務'],['threaten the whole family','hurt the whole family','威脅全家']),
 v(['survival is at stake','worried about having enough to live','生存受威脅'],['fulfilment','feeling happy with their work','滿足感'],['takes a back seat','becomes less important','退居次位']),
 v(['labour markets','workers','勞動市場'],['poorer countries','poorer countries','較貧困國家'],['limited bargaining power','little power to ask for better terms','議價能力有限']),
 v(['strong unions','strong groups that speak for them','強大工會'],['clear contracts','clear written agreements','清晰合約'],['realistic chances of promotion','real chances to move up','實際晉升機會'],['demand better treatment','ask for better treatment','要求更好待遇']),
 v(['In such circumstances','In these conditions','在這種情況下'],['luxury reserved for','possible only for','只留給少數人的奢侈'],['education','schooling','教育'],['savings','money put aside','積蓄'],['professional skills','skills for a profession','專業技能']),
 v(['without these advantages','without these things','缺少這些優勢'],['whatever work is available','any available job','任何能找到的工作'],['exhausted','very tired','筋疲力盡'],['undervalued','others do not value them','不被重視']),
 v(['Despite this','Even so','儘管如此'],['job satisfaction','feeling happy with a job','工作滿足感'],['dismissed as unimportant','treat feeling happy with a job as unimportant','視為不重要']),
 v(['much of their lives','a large part of life','人生大量時間'],['constant stress','worried all the time','持續壓力'],['mental and physical health','mind and body','身心健康']),
 v(['By contrast','On the other hand','相比之下'],['respected','respected','受尊重'],['purposeful','believe their work has a purpose','有目標感'],['stay motivated','keep trying','保持動力'],['improve their skills','get better at their work','提升技能']),
 v(['In conclusion','To sum up','總結'],['considered a luxury','see enjoyment of work as a luxury','被視為奢侈'],['economic insecurity','not knowing if they will have enough money','經濟不安全'],['limits people’s choices','leaves them few choices','限制選擇']),
 v(['Nevertheless','Still','然而'],['essential','real need','必要'],['not decorative','rather than an extra decoration','非裝飾'],['decent work','fair work','體面工作'],['healthier and more productive society','society healthier and better at producing things','更健康高產的社會']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many parts of the developing world, housing is judged less by comfort than by the basic security it provides.',d:[1,3,12],relation:'less by ... than by ... 對比評價標準',formula:'In many parts of the developing world, [事物] is judged less by [理想標準] than by [基本保障]',meaning:'發展中地區更重視工作帶來的基本保障。',links:['In many parts of the developing world, ', ' is judged less by ', ' than by the basic security it provides.'],labels:['被評價的事物','次要標準']},
 {example:'This is why a safe home is often seen as a privilege rather than an ordinary expectation.',d:[0,3,12],relation:'This is why 將保障優先接到滿足感被視為特權',formula:'This is why [理想條件] is often seen as a privilege rather than an ordinary expectation',meaning:'工作滿足感常被視為特權而非基本期待。',links:['This is why ', ' is often seen as a privilege rather than an ordinary expectation.'],labels:['被視為特權的條件']},
 {example:'I believe, however, that it is extremely important, because a factory which ignores workers’ well-being eventually pays a price in output, health and dignity.',d:[0,3,12],relation:'however 轉作者立場，because 預告忽視福祉的多項代價',formula:'I believe, however, that [被忽視的好處] is extremely important, because [忽視福祉的機構] eventually pays a price in [三項後果]',meaning:'作者認為滿足感重要，忽視它會傷及生產力、健康與尊嚴。',links:['I believe, however, that it is extremely important, because a ', ' which ignores ', ' eventually pays a price in '],labels:['忽視福祉的社會','被忽視群體']},
 {example:'The main reason a safe home appears luxurious is economic pressure.',d:[1,9,12],relation:'主題句給第一原因：經濟壓力',formula:'The main reason [理想條件] appears luxurious is economic pressure',meaning:'工作滿足感似奢侈品，首先因經濟壓力。',links:['The main reason ', ' appears luxurious is economic pressure.'],labels:['難以追求的條件']},
 {example:'In areas where pay is low, public support is weak and unemployment is high, people often have little room to choose work that matches their interests or values.',d:[3,9,12],relation:'where 列三種約束，推出缺少選擇空間',formula:'In [地方] where [低薪弱保障高失業], people often have little room to choose work that matches their interests or values',meaning:'低薪、保障弱、失業高使人難按興趣選工作。',links:['In ', ' where ', ', ', ' and unemployment is high, people often have little room to choose work that matches their interests or values.'],labels:['受影響地方','薪金條件','保障條件']},
 {example:'Their first concern is not whether a temporary job is exciting, but whether it can pay for food, rent and their children’s education.',d:[3,9,12],relation:'not whether ... but whether ... 對比啟發與生計優先',formula:'Their first concern is not whether [工作有趣], but whether it can pay for [生活開支]',meaning:'先顧食物租金教育，啟發性退居次位。',links:['Their first concern is not whether ', ', but whether it can pay for food, rent and their children’s education.'],labels:['次要的理想條件']},
 {example:'For example, a shop assistant may accept long hours, unsafe conditions or repetitive tasks because losing the job would threaten the whole family.',d:[3,9,12],relation:'because 將不佳工作條件與失業的家庭風險連起',formula:'For example, [工人] may accept [三項不佳條件] because losing the job would threaten the whole family',meaning:'工人可能忍受長工時等，因失業會危及全家。',links:['For example, ', ' may accept long hours, unsafe conditions or repetitive tasks because losing the job would threaten the whole family.'],labels:['被迫接受工作的工人']},
 {example:'When survival is at stake, personal choice naturally takes a back seat.',d:[3,9,12],relation:'When 生存風險下概括滿足感讓位',formula:'When survival is at stake, [較高層需要] naturally takes a back seat',meaning:'生存受威脅時，工作滿足感退居次位。',links:['When survival is at stake, ', ' naturally takes a back seat.'],labels:['被迫讓位的需求']},
 {example:'Another reason is that many small companies offer limited bargaining power.',d:[3,4,12],relation:'另一原因轉入議價能力不足',formula:'Another reason is that [市場或機構] offer limited bargaining power',meaning:'較窮地方工人議價力有限。',links:['Another reason is that ', ' offer limited bargaining power.'],labels:['議價力不足的環境']},
 {example:'Workers may not have strong unions, clear contracts or realistic chances of promotion, so they cannot easily demand safer conditions.',d:[3,4,12],relation:'so 將工會合約晉升缺乏接到不易爭取待遇',formula:'Workers may not have [三種保障], so they cannot easily demand [改善]',meaning:'缺工會、合約及晉升機會，難要求更好待遇。',links:['Workers may not have strong unions, clear contracts or realistic chances of promotion, so they cannot easily demand '],labels:['所要求的改善']},
 {example:'In such circumstances, a stable career can feel like a luxury reserved for people with education, savings or professional skills.',d:[3,4,12],relation:'In such circumstances 概括資源不平等',formula:'In such circumstances, [條件] can feel like a luxury reserved for people with [三種優勢]',meaning:'工作滿足感像只屬教育、積蓄、專業人士的奢侈。',links:['In such circumstances, ', ' can feel like a luxury reserved for people with education, savings or professional skills.'],labels:['看似奢侈的條件']},
 {example:'Those without these advantages may feel that they must take whatever temporary work is available, even if it leaves them exhausted or undervalued.',d:[3,4,12],relation:'even if 展示缺資源者被迫接受有損福祉選項',formula:'Those without these advantages may feel that they must take whatever [選項] is available, even if it leaves them [不良後果]',meaning:'缺優勢者或得接受任何工作，即使疲憊或不受重視。',links:['Those without these advantages may feel that they must take whatever ', ' is available, even if it leaves them exhausted or undervalued.'],labels:['被迫接受的選項']},
 {example:'Despite this, personal wellbeing should not be dismissed as unimportant.',d:[3,4,15],relation:'Despite this 從原因轉回滿足感的重要性',formula:'Despite this, [被視為奢侈的需求] should not be dismissed as unimportant',meaning:'即使環境艱難，工作滿足感仍重要。',links:['Despite this, ', ' should not be dismissed as unimportant.'],labels:['應被認真看待的需求']},
 {example:'People spend much of their lives at school, so a schedule that causes constant stress can damage both mental and physical health.',d:[3,4,15],relation:'so 將投入大量時間接到長期身心風險',formula:'People spend much of their lives at [地方], so [壓力源] can damage both mental and physical health',meaning:'長期高壓工作會損害身心健康。',links:['People spend much of their lives at ', ', so a ', ' that causes constant stress can damage both mental and physical health.'],labels:['長時間所在','帶來壓力的安排']},
 {example:'By contrast, pupils who feel respected and purposeful are more likely to stay motivated, improve their skills and contribute positively to their school.',d:[3,4,13],relation:'By contrast 對照受尊重後的動力、技能與貢獻',formula:'By contrast, [受尊重有目標者] are more likely to [三項正面結果]',meaning:'受尊重有目標的員工較可能保持動力、提升技能和貢獻。',links:['By contrast, ', ' who feel respected and purposeful are more likely to stay motivated, improve their skills and contribute positively to their ', '.'],labels:['受益群體','受益場所']},
 {example:'In conclusion, safe housing is considered a luxury in many developing countries because economic insecurity limits people’s choices.',d:[3,4,13],relation:'結論 because 收束奢侈感的經濟原因',formula:'In conclusion, [需求] is considered a luxury in many developing countries because economic insecurity limits people’s choices',meaning:'經濟不安全限制選擇，工作滿足感被視為奢侈。',links:['In conclusion, ', ' is considered a luxury in many developing countries because economic insecurity limits people’s choices.'],labels:['被視為奢侈的需求']},
 {example:'Nevertheless, it is essential, not decorative, because safe housing is one of the foundations of a healthier and more productive society.',d:[3,4,13],relation:'not decorative 加 because 強調基本重要性',formula:'Nevertheless, it is essential, not decorative, because [基本條件] is one of the foundations of a healthier and more productive society',meaning:'體面工作非點綴，而是健康高產社會的基礎。',links:['Nevertheless, it is essential, not decorative, because ', ' is one of the foundations of a healthier and more productive society.'],labels:['必要的基本條件']},
];
const usage=[
 '當你要用 less by ... than by ... 對比人們評價某事的兩種標準時。',
 '當你要用 This is why 承接背景，解釋某需求為何被當成特權時。',
 '當你要用 however 表達不同立場，再用 because 預告忽視該需求的代價時。',
 '當你要用主題句直接說明某理想條件為何似奢侈品時。',
 '當你要列低薪、弱保障及高失業等結構條件如何縮窄選擇時。',
 '當你要用 not whether ... but whether ... 分清理想與生計的先後時。',
 '當你要用一位工人的例子解釋為何有人接受差劣工作條件時。',
 '當你要用短句概括生存風險如何使較高層需求退居次位時。',
 '當你已談經濟壓力，還要提出另一個與談判權力有關的原因時。',
 '當你要用 so 把保障與晉升機會不足連到不易要求改善時。',
 '當你要概括某些條件為何似乎只屬於擁有資源的人時。',
 '當你要用 even if 表達人因選擇少而接受有害條件時。',
 '當你分析完條件限制，要用 Despite this 轉回需求本身的重要性時。',
 '當你要用 so 說明某活動佔人生大量時間，因此長期壓力有健康後果時。',
 '當你要用 By contrast 對照受尊重者的動力、成長與貢獻時。',
 '當結論要重述某需求被視為奢侈的結構性原因時。',
 '當你要用 not decorative 和 because 強調某需求具有基本社會價值時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先解釋「為何像奢侈」，再分析「是否重要」。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('本文要回答甚麼？',['為何工作滿足感在發展中地區常被視為奢侈，以及它是否重要。','只有薪酬最高的職位在哪裏。','所有工人應否停止工作。','只比較工廠與外賣平台的制服。'],'文章先解釋兩項原因，再評估其重要性。'),{type:'multi',prompt:'哪兩項原因使滿足感看似奢侈？',detail:'選兩項，再按「確認」。',options:['經濟壓力使人先求生計。','議價能力與工作選擇不足。','所有工作都完全沒有工資。','受尊重的員工必然不提升技能。'],correct:[0,1],why:'經濟不安全與議價能力不足是兩條原因。'}];
const route=[sequence('還原五段的論證',[['引言','基本保障比個人滿足更優先，但作者認為滿足感極重要。'],['經濟壓力','低薪、弱保障及失業使人先顧食物、租金及教育。'],['議價能力','工會、合約和晉升不足，工人難要求更好待遇。'],['重要性','高壓損害健康，受尊重可促進動力、技能及貢獻。'],['結論','承認經濟不安全，仍判體面工作是社會基礎。']],'原因與價值判斷要分開回答。')];
const evidence=[quiz('低薪、保障弱和高失業共同造成甚麼？',['人們難按興趣或價值觀選擇工作。','每名工人必然可自由挑選任何職位。','工作環境必然安全。','所有家庭已沒有食物和租金支出。'],'經濟約束縮窄選擇空間。'),quiz('工廠工人或外賣員例子解釋甚麼？',['怕失業危及家庭，因而可能接受長工時或危險條件。','長工時必然令每名工人更快樂。','只要做外賣就絕不需要收入。','工人可毫無代價地即時辭職。'],'家庭生計風險限制拒絕差劣條件的能力。'),quiz('工人為何不易要求更好待遇？',['可能缺強工會、清晰合約與可行晉升機會。','因為工人都不希望被尊重。','因為每間公司都有強工會。','因為晉升越多議價力一定越低。'],'這三種制度及機會影響議價能力。'),quiz('作者認為工作滿足感為何重要？',['長期壓力可損害身心；受尊重可促進動力和貢獻。','只因它會使每份工作完全沒有壓力。','只因它能保證所有人立即加薪。','它只是一種無實際作用的裝飾。'],'健康與工作表現是範文理由。'),quiz('最後一句如何評價體面工作？',['它是較健康、更有生產力社會的基礎之一。','它與社會健康完全無關。','它只有裝飾用途。','它只可留給有積蓄的人。'],'作者明確反駁「只是裝飾」。')];
const logic=[sequence('經濟壓力到有限選擇',[['外在條件','低薪、弱保障和高失業。'],['優先次序','先顧食物、租金與子女教育。'],['被接受的工作','可能包括長工時、危險或重複任務。'],['結果','生存優先，滿足感退居次位。']],'不要把工人接受差條件誤作他們喜歡差條件。'),sequence('議價與福祉',[['談判資源不足','缺工會、清晰合約與晉升機會。'],['改善困難','工人難要求更好待遇。'],['健康代價','持續壓力可損害身心。'],['正面對照','尊重與目標感可支持動力、技能和貢獻。']],'議價條件和滿足感的重要性是兩個不同問題。')];
const transfers=[
 transfer('一名工人每月先要付食物、租金與子女學費。','哪句準確說明他選工作的優先次序？',['他可能先選能支付生活費的工作，較難優先追求個人興趣。','他必然只選最令人興奮而沒有收入的工作。','子女學費與工作選擇完全無關。','每份有工資的工作都保證很有啟發性。'],['生計約束先於理想匹配。','忽略經濟壓力。','支出有關。','無此保證。'],[4,5],'not whether inspiring, but whether pay for needs。'),
 transfer('一名配送員接受很長的工作時間，因為失業會影響全家。','哪句避免錯解他的決定？',['他可能受家庭生計壓力所限，不能簡單推斷他喜歡長工時。','接受長工時必然代表他熱愛不安全環境。','全家生計絕不影響他的選擇。','他只要辭職便保證取得更好工作。'],['行為反映風險，不必然反映喜好。','錯把被迫當喜好。','原文相反。','無保證。'],[6,7],'survival at stake→fulfilment takes back seat。'),
 transfer('一家公司沒有正式合約，工人也看不到晉升機會。','哪句說清議價問題？',['缺合約與晉升途徑會削弱工人要求更好待遇的能力。','沒有合約必然令工人議價力更高。','晉升機會與待遇從來無關。','只要工人有工作，便一定可以自由選所有條件。'],['制度不足→難談改善。','方向相反。','是議價資源。','過度。'],[8,9],'limited bargaining power。'),
 transfer('有人說工作滿足感只是高薪人士才需要的裝飾。','哪句回應範文立場？',['工作佔人生大量時間，持續壓力可損害身心，因此滿足感有實際價值。','工作再高壓也不可能影響健康。','只有專業人士會在工作場所待很久。','滿足感必然令任何人立即成為公司老闆。'],['健康後果支持其基本重要性。','原文相反。','工人普遍花大量時間。','無此保證。'],[12,13,16],'not decorative; health and dignity。'),
 transfer('一名員工感到受尊重，也知道工作目標。','哪項結果符合範文？',['他較可能保持動力、提升技能並對工作場所作出貢獻。','他必然不再需要任何薪金。','受尊重一定令所有工作完全不需學習。','有目標感會自動取消所有健康問題。'],['保留 more likely 的可能性。','仍需收入。','仍可學習。','非萬能。'],[14],'respected and purposeful→motivated/skilled/contribute。'),
 transfer('另一題問為何低收入家庭較少選擇課外活動。','哪句能轉用本文邏輯？',['基本開支先佔資源，家庭未必有足夠選擇空間追求額外滿足。','因工作滿足感重要，所有家庭都必須參加同一活動。','經濟壓力從不影響活動選擇。','課外活動與家庭資源完全無關。'],['資源約束→選擇受限可跨題分析。','新題仍須論證。','原文邏輯相反。','有關。'],[3,4,5],'economic pressure limits choice。'),
 transfer('有人問「工人不要求改善，是否證明他們滿意現況？」','哪句指出推論問題？',['不一定；缺工會、合約或其他工作機會，可能令他們難以議價。','不提要求便必然表示任何條件都理想。','所有工人都已有清晰合約和晉升。','只要提出要求，風險便必然消失。'],['不能將沉默等同滿意。','忽略議價資源。','不符原文。','無保證。'],[8,9,11],'limited bargaining power and take whatever work。'),
 transfer('一段論證只列工資低，卻未解釋滿足感為何像奢侈。','哪句補上因果？',['收入不足時，人先要找能支付食物租金的工作，難按興趣挑選。','工資低，因為工資低。','收入與工作選擇完全無關。','有工作便保證興趣和價值觀完全相符。'],['低薪→生計優先→選擇縮窄。','循環。','原文有關。','無保證。'],[4,5,7],'wages low→first concern essentials。'),
 transfer('一名管理者希望改善長期高壓的工作環境。','哪句同時反映員工與機構收益？',['減少持續壓力可保護身心，受尊重的員工也較可能保持動力和貢獻。','只改善辦公室顏色便保證所有健康問題消失。','工作壓力越高，所有人越健康。','受尊重必然令員工停止學習技能。'],['健康及工作表現雙重效果。','無保證。','方向相反。','原文說可能提升技能。'],[13,14],'stress harms; respect supports motivation。'),
 transfer('結論要同時回答「為何像奢侈」和「是否重要」。','哪句最完整？',['經濟不安全限制選擇，使滿足感看似奢侈；但體面工作仍是健康高產社會的基礎。','工作滿足感似奢侈，因為它似奢侈。','只列失業問題，完全不回答重要性。','只說滿足感重要，不解釋為何很多人難追求。'],['兩問均有原因及立場。','循環。','漏第二問。','漏第一問。'],[15,16],'結論 because 經濟原因 + essential not decorative。'),
];
const balancedTransferOptions=[
 ['他或先選能付生活費的工作，較難優先追求興趣。','他必然只選完全沒有收入、卻最令人興奮的工作。','食物租金與子女學費都不會影響工作選擇。','每份有薪工作都保證同樣符合他的個人興趣。'],
 ['家庭生計壓力可限制選擇，長工時不代表喜歡。','接受長工時便證明他喜歡任何不安全環境。','全家生計絕不可能影響他是否接受長工時。','他只要立即辭職，便保證找到更理想工作。'],
 ['缺合約與晉升途徑可削弱工人議價能力。','沒有正式合約必然讓工人的議價力更高。','晉升機會與工人能否要求較好待遇無關。','只要工人有工作，就能自由選擇全部條件。'],
 ['工作佔人生不少時間，長期壓力可傷身心健康。','工作無論壓力多大，都絕不可能影響健康。','只有專業人士才需要長時間留在工作場所。','有工作滿足感，人人就可立即成為公司老闆。'],
 ['受尊重與有目標可助動力、技能及工作貢獻。','只要受到尊重，員工便完全不需要任何薪金。','受到尊重後，全部工作都保證不再需要學習。','一旦知道工作目標，所有健康問題便自動消失。'],
 ['基本開支先佔資源，家庭或難再追求額外活動。','所有家庭都必須參加同一種課外活動才算滿足。','經濟壓力從來不影響任何家庭的活動選擇。','課外活動花費與家庭可用資源完全沒有關係。'],
 ['未必；缺合約或其他工作機會可削弱議價能力。','不提出要求，就證明全部工作條件都很理想。','所有工人都已有清晰合約和良好晉升機會。','只要提出改善要求，一切職場風險便會消失。'],
 ['收入不足須先顧食物租金，難按興趣選工作。','工資偏低，唯一原因就是工資本身偏低。','收入多寡與任何工作選擇都完全沒有關係。','只要找到工作，興趣價值觀就保證完全相符。'],
 ['減少持續壓力可護身心，尊重亦可維持動力。','只改辦公室顏色便保證所有健康問題消失。','工作壓力愈大，所有員工身體必然愈健康。','一受到尊重，員工便必定立即停止學習技能。'],
 ['經濟不安限制選擇，但體面工作仍有健康價值。','滿足感之所以似奢侈，只因它看來像奢侈。','只要提到失業，就毋須再解釋工作為何重要。','只說滿足感重要，便已解釋追求它為何困難。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
const revised=[
  {options:['他或先選能付生活費的工作，較難優先追求興趣。','他可先按興趣選工作，生活支出留待日後處理。','生活支出已明確，便可推斷工作選擇不受收入影響。','他先選高薪工作，便表示個人興趣已得到滿足。'],explanations:['生計壓力可能讓收入先於理想工作。','題述支出已超出可忽略的範圍。','支出越具體，收入約束越值得分析。','收入足夠不等於工作內容符合興趣。']},
  {options:['家庭生計壓力限制選擇，長工時不代表喜歡。','他接受長工時，反映已適應該環境的各項風險。','家庭擔憂失業，因此他有更大空間談縮短工時。','長工時換來收入，可推斷他的工作滿足感較高。'],explanations:['接受條件可能出於需要，而非偏好。','妥協不等於已接受安全與健康風險。','失業壓力往往削弱議價空間。','收入有用，但不能單獨證明滿足感。']},
  {options:['缺合約與晉升途徑，會削弱工人議價能力。','缺合約可令條件靈活，通常有助工人要求改善。','晉升途徑欠清楚，與薪資談判的能力仍無關。','有工作便有穩定籌碼，可自行設定全部條件。'],explanations:['制度保障與替代機會影響談判能力。','靈活也可能意味缺少保障與可執行承諾。','晉升機會是改善待遇的重要籌碼。','就業本身不保證工人能單方決定條件。']},
  {options:['工作佔人生不少時間，長期壓力可傷身心健康。','長期壓力主要影響下班活動，與工作健康分開。','滿足感較適用於高薪職位，基層只需穩定收入。','改善滿足感可以取代工資，因健康作用更直接。'],explanations:['健康後果顯示滿足感並非裝飾。','長期壓力可能同時影響身心及工作。','低收入工人同樣花大量時間工作。','健康與合理收入不能互相取代。']},
  {options:['受尊重與有目標，或能增動力、技能和工作貢獻。','受尊重可提升動力，因此薪資安排可延後檢討。','目標清楚可增效率，但與學習新技能關係不大。','受尊重後壓力較小，故工作技能不必再提升。'],explanations:['保留「可能」的力度與員工、機構雙重好處。','尊重不能代替合理薪酬。','有方向的工作可鼓勵技能發展。','較好環境不代表學習需求消失。']},
  {options:['基本開支先佔資源，家庭或難選額外活動。','基本開支先佔資源，課外活動便可優先購買。','活動費用較高，家庭選擇主要取決於興趣。','家庭資源不足，卻可把課外活動視為固定必需。'],explanations:['資源約束可能壓縮額外選擇。','若開支已有壓力，額外活動未必能先行。','興趣重要，但題述低收入是關鍵條件。','活動價值不等於所有家庭都能負擔。']},
  {options:['未必；缺合約或替代工作可削弱議價能力。','大致可以；沉默通常反映待遇已合乎期望。','未必；但一經提出要求便可改善所有條件。','大致可以；因工人應有充分選擇才會沉默。'],explanations:['不能把沒有提出要求直接當作滿意。','不滿也可能因失業風險而不敢開口。','提出要求仍受制度與職位選擇限制。','題目沒有證據說工人具備充分選擇。']},
  {options:['收入不足須先付食物租金，難按興趣選工作。','工資較低令選擇變少，原因主要是選擇少。','收入不足會增加求職壓力，但更易挑到理想工作。','工作滿足感像奢侈，因有工作便可滿足生活。'],explanations:['把低收入、生計優先與選擇受限串成因果。','只是重述結果，沒有說明支出如何約束選擇。','壓力通常縮窄而非擴大可接受職位。','有工作不等於可選到符合價值的職位。']},
  {options:['減少持續壓力可護身心，尊重亦可能維持動力。','改善辦公室環境後，健康與薪資問題可暫不檢討。','維持較高壓力可提高產量，健康影響較次要。','尊重員工能減少抱怨，但與技能成長關係較弱。'],explanations:['健康和工作表現都可能受較好環境支持。','裝修改善不等於工作壓力已解決。','短期產量不能遮蔽長期健康成本。','被尊重也可鼓勵持續投入和學習。']},
  {options:['經濟不安限制選擇，但體面工作仍有健康價值。','經濟不安限制選擇，因此滿足感較適合留到未來。','體面工作有健康價值，生計約束則不必再分析。','經濟不安限制選擇，但工作價值只按薪金衡量。'],explanations:['分別回答為何難追求及為何仍重要。','這弱化第二問對工作滿足感價值的要求。','只回答重要性，沒有解釋「像奢侈」的原因。','薪金之外，健康和動力也是本文的價值。']}
];
revised.forEach((r,i)=>{transfers[i].options=r.options;transfers[i].explanations=r.explanations});
// Reviewed connector structure decompositions.
structures[4].frame.parts=[["In ","link","句型固定部分"],["countries","slot","所在地方"],[" where ","link","句型固定部分"],["wages are low","slot","薪酬偏低"],[", ","link","句型固定部分"],["social protection is weak","slot","保障不足"],[" and ","link","句型固定部分"],["unemployment is high","slot","失業率高"],[", people often have little room to choose work that matches their interests or values.","link","句型固定部分"]];
structures[4].frame.formula="In [所在地方] where [薪酬偏低], [保障不足] and [失業率高], people often have little room to choose work that matches their interests or values.";
structures[6].frame.parts=[["For example, ","link","句型固定部分"],["a factory worker or delivery rider","slot","受壓工作者"],[" may accept ","link","句型固定部分"],["long hours, unsafe conditions or repetitive tasks","slot","不佳條件"],[" because losing the job would threaten ","link","句型固定部分"],["the whole family","slot","受失業波及的人"],[".","link","句型固定部分"]];
structures[6].frame.formula="For example, [受壓工作者] may accept [不佳條件] because losing the job would threaten [受失業波及的人].";
structures[9].frame.parts=[["Workers may not have ","link","句型固定部分"],["strong unions, clear contracts or realistic chances of promotion","slot","欠缺的保障"],[", so they cannot easily demand ","link","句型固定部分"],["better treatment","slot","想爭取的改善"],[".","link","句型固定部分"]];
structures[9].frame.formula="Workers may not have [欠缺的保障], so they cannot easily demand [想爭取的改善].";
structures[11].frame.parts=[["Those without these advantages may feel that they must take whatever ","link","句型固定部分"],["work","slot","可能接受的工作"],[" is available, even if it leaves them ","link","句型固定部分"],["exhausted or undervalued","slot","不良後果"],[".","link","句型固定部分"]];
structures[11].frame.formula="Those without these advantages may feel that they must take whatever [可能接受的工作] is available, even if it leaves them [不良後果].";
// Source-aligned remaining frames.
structures[0].frame.parts=[["In many parts of the developing world, ","link","句型固定部分"],["work","slot","事物"],[" is judged less by ","link","句型固定部分"],["personal fulfilment","slot","理想標準"],[" than by ","link","句型固定部分"],["the basic security it provides.","slot","基本保障"]];
structures[5].frame.parts=[["Their first concern is not whether ","link","句型固定部分"],["a job is inspiring","slot","工作有趣"],[", but whether it can pay for ","link","句型固定部分"],["food, rent and their children’s education.","slot","生活開支"]];
structures[10].frame.parts=[["In such circumstances, ","link","句型固定部分"],["job satisfaction","slot","條件"],[" can feel like a luxury reserved for people with ","link","句型固定部分"],["education, savings or professional skills.","slot","三種優勢"]];
export default {key:'direct-question:45',meta:{topic:'發展中地區的工作滿足感',summary:'文章以經濟不安全與議價能力不足解釋滿足感為何似奢侈，再以身心健康、動力、技能和社會生產力論證其必要性。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
