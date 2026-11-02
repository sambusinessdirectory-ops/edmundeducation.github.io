// International exchange visits: personal growth, cultural learning, and manageable costs.
// Hold for canonical Chinese source repair (see advantage-disadvantage-8-translations.review.json).
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:8'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Schools now need to help young people do well in their studies and live in a connected world.',
 'So some teachers say visits to other countries are good for teenagers.',
 'I think these visits have many more good points than bad ones. They help young people grow up and understand other cultures in ways ordinary classes seldom can. The problems are usually brief and can be handled.',
 'The biggest good point of visits to other countries is that they help teenagers grow as people more quickly.',
 'When students stay in another country, they must deal with new daily habits, different school rules and everyday problems without always relying on their parents.',
 'This makes them more able to do things on their own, deal with change and take responsibility.',
 'For example, a student living with a local family may at first find a new daily schedule hard or struggle to say what they need. Soon they learn to ask questions with confidence, use time better and solve problems calmly.',
 'Another big good point is that these visits help students understand other cultures and languages better.',
 'Rather than only reading about another society, teenagers live in it and learn by talking, going to school and meeting people every day.',
 'So they often become more willing to listen to different views and better able to talk with people from different backgrounds.',
 'It is true that there are some problems, but they are not big enough to change the overall value of these visits.',
 'One problem is money, because travel, places to stay and insurance may cost a lot.',
 'But many programmes last only a short time, receive money to help pay for them or are arranged by schools working together, so families often pay much less.',
 'Another possible problem is that some teenagers may miss home or feel worried in a new place.',
 'Still, this feeling usually does not last long and may even help them, because getting past it helps young people deal better with difficult feelings.',
 'For example, a student who feels alone at the start of a visit may come home much more sure of themselves after making friends and getting used to the new place.',
 'To sum up, visits to other countries give teenagers much more than a chance to see a new place.',
 'These visits help young people do things on their own, understand other cultures and speak with people in real life. Their problems are small enough to handle, so the good points are much greater than the bad ones.',
];
const vocabulary=[
 v(['increasingly expected','now need','愈來愈被期望'],['academic success','do well in their studies','學業成績'],['interconnected world','connected world','互相連繫的世界']),
 v(['In this context','So','在這種背景下'],['educators','teachers','教育工作者'],['international exchange visits','visits to other countries','國際交流訪問'],['beneficial','good','有益']),
 v(['far outweigh','many more good points than bad ones','遠大於'],['maturity','grow up','成熟度'],['intercultural competence','understand other cultures','跨文化能力'],['rarely can','seldom can','難以做到'],['short-lived and manageable','brief and can be handled','短暫且可處理']),
 v(['greatest advantage','biggest good point','最大優點'],['international exchange visits','visits to other countries','國際交流訪問'],['accelerate','more quickly','加快'],['personal growth','grow as people','個人成長']),
 v(['spend time','stay','逗留'],['unfamiliar routines','new daily habits','陌生日常安排'],['school expectations','school rules','學校要求'],['practical challenges','everyday problems','實際難題'],['depending entirely on their parents','always relying on their parents','完全依賴父母']),
 v(['This process','This','這個過程'],['independent','able to do things on their own','獨立'],['adaptable','deal with change','能適應變化'],['responsible','take responsibility','有責任感']),
 v(['host family','local family','接待家庭'],['initially struggle','at first find','起初難以'],['new timetable','new daily schedule','新時間表'],['communicate minor needs','say what they need','表達日常需要'],['confidently','with confidence','有信心地'],['manage time more effectively','use time better','更有效安排時間']),
 v(['A second major benefit','Another big good point','第二個主要好處'],['deepen','understand','加深'],['cultural and linguistic understanding','other cultures and languages better','文化與語言理解']),
 v(['Instead of','Rather than','而不是'],['in an abstract way','only reading about','抽象地'],['experience it directly','live in it','直接體驗'],['daily interaction','meeting people every day','日常互動']),
 v(['As a result','So','因此'],['open-minded','willing to listen to different views','願意接納不同觀點'],['capable of communicating','able to talk','能溝通'],['different backgrounds','different backgrounds','不同背景']),
 v(['Admittedly','It is true','無可否認'],['disadvantages','problems','缺點'],['not significant enough','not big enough','不足以'],['overall value','overall value','整體價值']),
 v(['One concern','One problem','一項顧慮'],['cost','money','費用'],['accommodation','places to stay','住宿'],['expensive','cost a lot','昂貴']),
 v(['short','last only a short time','時間短'],['subsidised','receive money to help pay for them','獲得資助'],['school partnerships','schools working together','學校合作'],['financial burden','families often pay','經濟負擔']),
 v(['Another possible drawback','Another possible problem','另一可能缺點'],['homesick','miss home','想家'],['anxious','worried','焦慮'],['unfamiliar environment','new place','陌生環境']),
 v(['Nevertheless','Still','儘管如此'],['discomfort','feeling','不適'],['temporary','does not last long','短暫'],['beneficial','help them','有益'],['overcoming it','getting past it','克服它'],['emotional resilience','deal better with difficult feelings','情緒韌性']),
 v(['For instance','For example','例如'],['lonely','alone','孤單'],['noticeably more confident','much more sure of themselves','明顯更有信心'],['forming friendships','making friends','建立友誼'],['adapting successfully','getting used to the new place','成功適應']),
 v(['In conclusion','To sum up','總結'],['offer teenagers','give teenagers','帶給青少年'],['far more than','much more than','遠不止'],['a simple change of scenery','a chance to see a new place','只是換個環境']),
 v(['foster independence','help young people do things on their own','培養獨立性'],['cultural awareness','understand other cultures','文化意識'],['real-world communication skills','speak with people in real life','現實溝通能力'],['limited and manageable','small enough to handle','有限且可處理'],['decisively outweigh','much greater than','明顯大於']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Schools are increasingly expected to prepare young people not only for exams but also for work in a changing world.',d:[1,3,10],relation:'以 not only...but also 並列學業及更廣的生活準備',formula:'Schools are increasingly expected to prepare young people not only for [目標一] but also for [目標二]',meaning:'學校的任務既包括學業，也包括面對互相連繫的世界。',usage:'引言先擴闊教育目標，再說明交流訪問的相關性。',links:['Schools are increasingly expected to prepare young people not only for ',' but also for ','.'],labels:['第一準備方向','第二準備方向']},
 {example:'In this context, some educators argue that overseas visits can help teenagers learn.',d:[0,7,10],relation:'用 In this context 將教育背景連到一方主張',formula:'In this context, some educators argue that [主張]',meaning:'在上述教育背景下，有人支持青少年出國交流。',usage:'context 指前一句的教育任務，不是任何背景都可以直接套用。',links:['In this context, some educators argue that ','.'],labels:['支持者的主張']},
 {example:'I strongly believe that the advantages of these visits far outweigh the disadvantages, because they build confidence outside school, whereas the drawbacks are usually brief and manageable.',d:[1,10,16],relation:'比較利弊，先列較重好處，再用 whereas 限定弊端',formula:'I strongly believe that the advantages of [活動] far outweigh the disadvantages, because [關鍵好處], whereas [弊端權重]',meaning:'作者判斷成長與跨文化能力比短暫、可處理的問題重要。',usage:'far outweigh 需要正文兩邊證據支持，不能只靠強烈語氣。',links:['I strongly believe that the advantages of ',' far outweigh the disadvantages, because ', ', whereas ','.'],labels:['活動','核心好處','弊端特點']},
 {example:'The greatest advantage of international exchange visits is that they encourage teenagers to make their own decisions.',d:[2,7,10],relation:'主題句點明交流訪問促進個人成長的第一大好處',formula:'The greatest advantage of international exchange visits is that they [主要影響]',meaning:'交流訪問能加快青少年的個人成長。',usage:'後面應提供學生獨立處理日常難題的具體機制。',links:['The greatest advantage of international exchange visits is that they ','.'],labels:['主要影響']},
 {example:'When students spend time in a different country, they are forced to handle new routines and everyday problems without depending entirely on their parents.',d:[3,8,13],relation:'用 When 描述新環境如何迫使學生獨立應付困難',formula:'When students spend time in a different country, they are forced to [新任務] without depending entirely on [原有支援]',meaning:'學生身處異國時不能完全靠父母，須應付新安排與實際問題。',usage:'這是獨立性形成的機制；不要把「被迫」誤寫成沒有任何支援。',links:['When students spend time in a different country, they are forced to ', ' without depending entirely on ','.'],labels:['需處理的難題','原有支援']},
 {example:'This process makes them more confident, flexible and responsible.',d:[1,7,12],relation:'This process 回指學生自己處理新環境挑戰',formula:'This process makes them more [成長結果一], [結果二] and [結果三]',meaning:'處理陌生環境的過程可培養獨立、適應力和責任感。',usage:'This process 必須有前文所指的具體經歷，不能孤立使用。',links:['This process makes them more ', ', ', ' and ','.'],labels:['第一能力','第二能力','第三能力']},
 {example:'For example, a pupil visiting a new school may initially struggle to follow unfamiliar rules, but very quickly that student learns to ask for help.',d:[4,8,15],relation:'用初期不適與其後自我解難構成個人成長例子',formula:'For example, [學生情境] may initially struggle to [初期困難], but very quickly that student learns to [成長行為]',meaning:'寄宿學生起初可能不適應日程，後來學會發問、安排時間和解難。',usage:'例子要顯示同一位學生在交流前後的變化，而不只列困難。',links:['For example, ', ' may initially struggle to ', ', but very quickly that student learns to ','.'],labels:['學生情境','初期困難','學會的行動']},
 {example:'A second major benefit is that these visits improve students’ understanding of other cultures.',d:[3,5,10],relation:'轉入與個人成長不同的第二好處：文化及語言理解',formula:'A second major benefit is that these visits [第二好處]',meaning:'交流訪問還能加深文化與語言理解。',usage:'「第二」須接續上一段已說明的成長好處。',links:['A second major benefit is that these visits ','.'],labels:['第二好處']},
 {example:'Instead of studying another society only through books, teenagers experience it directly through classes and daily conversations.',d:[4,10,13],relation:'用 Instead of 對比抽象學習與身歷其境的體驗',formula:'Instead of [間接學習], teenagers experience it directly through [直接經驗]',meaning:'學生透過交談、上學與日常互動親身體驗另一個社會。',usage:'instead of 的核心是學習方式的對比，不只適用於文化題。',links:['Instead of ', ', teenagers experience it directly through ','.'],labels:['原本方式','直接體驗']},
 {example:'As a result, they often become more curious and more capable of working with people from different backgrounds.',d:[5,8,13],relation:'由直接體驗推到態度與跨背景溝通能力',formula:'As a result, they often become [態度變化] and more capable of [行動能力]',meaning:'親身交流後，青少年往往更開放，也更能跨背景溝通。',usage:'often 表示常見可能結果，不能說每名學生必然如此。',links:['As a result, they often become ', ' and more capable of ','.'],labels:['態度變化','溝通能力']},
 {example:'Admittedly, there are some disadvantages, but they are not significant enough to erase the programme’s overall value.',d:[2,7,13],relation:'承認缺點，並先表明其權重不及主要好處',formula:'Admittedly, there are some disadvantages, but they are not significant enough to [推翻整體價值]',meaning:'作者承認缺點存在，但認為不足以推翻整體評價。',usage:'接下來須具體列出費用與想家問題，並解釋為何可處理。',links:['Admittedly, there are some disadvantages, but they are not significant enough to ','.'],labels:['不足以造成的結果']},
 {example:'One concern is cost, since tickets, accommodation and insurance can be expensive.',d:[3,7,13],relation:'用 since 列出費用來源支援成本顧慮',formula:'One concern is cost, since [費用項目] can be expensive',meaning:'旅費、住宿及保險可能使交流費用很高。',usage:'成本分析要指明費用項目，下一句再說減輕方式。',links:['One concern is cost, since ', ' can be expensive.'],labels:['費用項目']},
 {example:'However, many exchange programmes are short and partly funded, so the financial burden is often lower.',d:[4,10,14],relation:'以短期、資助及學校合作解釋費用可減輕',formula:'However, many exchange programmes are [成本緩和條件], so the financial burden is often [結果]',meaning:'短期、資助或學校合作的計劃可降低經濟負擔。',usage:'many/often 限定範圍，不能推論所有交流計劃都便宜。',links:['However, many exchange programmes are ', ', so the financial burden is often ','.'],labels:['降低負擔的條件','負擔結果']},
 {example:'Another possible drawback is that some teenagers may feel lonely in an unfamiliar environment.',d:[4,9,11],relation:'用 may 引入第二個可能弊端：想家與焦慮',formula:'Another possible drawback is that some teenagers may [心理困難]',meaning:'部分青少年在陌生環境可能想家或焦慮。',usage:'some/may 限定人群與可能性，避免斷言所有人都受影響。',links:['Another possible drawback is that some teenagers may ','.'],labels:['心理困難']},
 {example:'Nevertheless, this discomfort is usually brief and can even be beneficial, because it encourages students to seek support.',d:[4,10,13],relation:'承認不適後說明其短暫性與可能的成長作用',formula:'Nevertheless, this discomfort is usually [持續時間] and can even be beneficial, because [成長機制]',meaning:'不適通常短暫；克服它可增強情緒韌性。',usage:'不能把焦慮一概美化；句中 usually/can 僅說範文提出的可能性。',links:['Nevertheless, this discomfort is usually ', ' and can even be beneficial, because ','.'],labels:['持續時間','成長機制']},
 {example:'For instance, a student who feels nervous during the first days of an exchange often returns home more confident after making friends.',d:[6,10,13],relation:'用交流前後的同一學生具體支持適應與信心成長',formula:'For instance, a student who [初期感受] often returns home [後期變化] after [適應過程]',meaning:'最初孤單的學生在結交朋友並適應後，可能更有信心。',usage:'例子支援可能的成長，不能保證每一位學生都一樣。',links:['For instance, a student who ', ' often returns home ', ' after ','.'],labels:['初期感受','後期變化','轉變原因']},
 {example:'In conclusion, international exchange visits offer teenagers far more than a short trip abroad.',d:[2,10,13],relation:'用 far more than 引出旅行以外的長期學習價值',formula:'In conclusion, international exchange visits offer teenagers far more than [表面收穫]',meaning:'交流訪問的價值超過換個環境看看。',usage:'下一句須明確列出獨立、文化意識、溝通能力與可處理的弊端。',links:['In conclusion, international exchange visits offer teenagers far more than ','.'],labels:['表面收穫']},
 {example:'Because they foster curiosity and confidence, and because their disadvantages are brief and manageable, their advantages decisively outweigh their disadvantages.',d:[2,10,14],relation:'用兩個 because 同時支援好處及弊端可控的最後權衡',formula:'Because they foster [重要能力], and because their disadvantages are [弊端權重], their advantages decisively outweigh their disadvantages',meaning:'重要能力的增長，加上有限、可處理的缺點，使作者判斷優點明顯更大。',usage:'兩個 because 分別解釋好處強度與弊端權重；不能省略任一邊。',links:['Because they foster ', ', and because their disadvantages are ', ', their advantages decisively outweigh their disadvantages.'],labels:['重要能力','弊端權重']},
];
const usageGuides=[
 '當你要說某機構的任務不只包括傳統目標，還包括更廣的生活準備時。',
 '當你要用 In this context 把前述背景連到一方觀點時。',
 '當你要用 because 給較重好處的理由，再用 whereas 限定反面代價時。',
 '當你要用主題句先點出一項活動最重要的好處，後面再展開機制時。',
 '當你要說人進入新環境後，須在較少依賴原有支援的情況下處理難題時。',
 '當你已說出具體經歷，接着要用 This process 指回經歷並列出能力變化時。',
 '當你要用同一人的初期困難與其後學會的行動，展示前後轉變時。',
 '當你要從第一項好處轉入不同性質的第二項好處時。',
 '當你要用 Instead of 對比間接認識與親身體驗兩種方式時。',
 '當你要把前句經歷推到態度改變及實際能力提升時。',
 '當你要先承認缺點，再表明它們是否足以推翻整體價值時。',
 '當你要提出費用顧慮，並用 since 指明實際開支項目時。',
 '當你要用 However 補充能降低負擔的條件，再以 so 推到結果時。',
 '當你要指出只有部分人可能出現的另一項心理或實際困難時。',
 '當你要承認不適，再用 because 解釋克服它可能帶來的成長時。',
 '當你要用同一人從開始到結束的變化，具體化一項可能好處時。',
 '當你在結論要指出某活動的價值超過最表面、最易看到的收穫時。',
 '當你要用兩個 because 分別說明好處強度與缺點可控性，完成最後權衡時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證順序，把原因、例子及權衡連起來。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這題要求評估哪一類活動的利弊？',['青少年的國際交流訪問','只評估學校考試制度','只比較不同國家旅行費用','只評估教師到海外工作'],'international exchange visits for teenagers 是題目焦點。'),
 {type:'multi',prompt:'範文認為交流訪問最重要的兩組好處是甚麼？',detail:'選兩項，再按「確認」。',options:['獨立、適應力及責任感','文化、語言理解及跨背景溝通','保證每名學生免付費用','保證每名學生從不想家'],correct:[0,1],why:'正文分別論證個人成長與文化語言理解；費用及想家是待評估的弊端。'},
];
const route=[sequence('依範文還原利弊權衡',[
 ['教育背景與立場','學校須準備學生面對互相連繫的世界；作者認為交流訪問利大於弊。'],
 ['個人成長','學生遠離父母的日常依賴，處理新安排，變得獨立且有責任感。'],
 ['文化與語言','直接參與異國學校生活和日常互動，促進開放態度及溝通。'],
 ['費用及想家','承認成本與不適；部分計劃有資助，不適通常短暫並可能帶來適應力。'],
 ['最後權衡','重要的長期能力增長，對比有限而可處理的弊端。'],
 ],'先分別建立好處與弊端的證據，再解釋為何好處較重。')];
const evidence=[
 quiz('交流訪問如何促進獨立性？',['學生在另一國須自己應付新日程、學校要求及生活難題','學生永遠不再需要任何成人支援','學生在國內上課時間必然變少','學生必定改變國籍'],'原文機制是未能完全依賴父母時，需處理陌生安排。'),
 quiz('接待家庭的例子顯示甚麼轉變？',['起初不適應，後來學會發問、安排時間及冷靜解難','寄宿學生從第一天起就沒有困難','接待家庭會替學生完成所有任務','交流活動唯一好處是學新時間表'],'同一學生的前後變化支援個人成長。'),
 quiz('為何親身交流可補足課堂學習？',['學生透過交談、上學及日常互動直接體驗另一社會','課堂完全不能講授任何文化知識','所有學生只需旅行便能精通外語','文化理解只靠看景點便會自動形成'],'範文對比抽象學習與直接體驗，沒有否定課堂。'),
 quiz('範文如何回應費用顧慮？',['部分計劃較短、有資助或透過學校合作，負擔可減輕','所有計劃都完全免費','保險與住宿從不產生費用','費用高便必須取消全部活動'],'many/often 表示可減輕的情況，不是保證。'),
 quiz('作者如何看待想家或焦慮？',['部分學生可能有此不適，但它通常短暫，克服後可能更有韌性','每位學生都必然感到焦慮','焦慮本身一定有益，毋須任何支援','只要想家，交流便毫無價值'],'some/may/usually/can 均保留適當的可能性。'),
];
const logic=[
 sequence('個人成長的因果鏈',[
 ['新環境','陌生日程、學校要求與生活問題出現。'],
 ['較少依賴父母','學生須自己發問、安排時間及尋找解決方法。'],
 ['能力變化','獨立、適應力和責任感逐步提高。'],
 ['例子落地','接待家庭學生從初期困難到冷靜解難。'],
 ],'只說「交流令人獨立」未夠，應寫出經歷與能力之間的機制。'),
 sequence('文化學習與弊端的權衡',[
 ['直接接觸','交談、學校生活及日常互動取代單靠抽象認識。'],
 ['可能收穫','態度更開放，與不同背景人士溝通更順暢。'],
 ['兩個顧慮','費用可能高；部分學生可能想家或焦慮。'],
 ['條件與判斷','短期或資助減輕成本；不適可能短暫，故作者判斷利大於弊。'],
 ],'權衡須交代弊端如何受條件限制，不能把它們抹掉。'),
];
const transfers=[
 transfer('學校安排學生在另一城市短期寄宿並參加當地課程。','哪句完整轉用「新環境促進獨立」的論證？',["處理新日程與生活問題，可逐步增加信心和責任感", "離家參加課程後，每名學生都能立即不需任何成人協助", "寄宿只改變睡眠地點，所以學生不會面對新的日常安排", "新環境能帶來成長，但只有完全不想家者才會有收穫"],["把親身處理新事務連到逐步獨立。", "獨立不等於零支援。", "忽略新日程與日常問題。", "初期不適可與成長並存。"],[4,5,6],'原文學生在異國處理陌生安排，逐步變得獨立及負責。'),
 transfer('有人說看紀錄片已足以理解另一種文化。','哪句準確轉用「抽象學習與直接體驗」的對比？',["影片可提供知識，與當地人相處則可直接體驗文化", "紀錄片能介紹文化，所以面對面互動完全沒有額外價值", "親身到訪或有幫助，因此影片從來不能提供任何資訊", "短期出國能接觸文化，便足以保證每人都已深入理解"],["區分抽象資訊與直接生活互動。", "影片不完全取代實際體驗。", "直接體驗不否定影片用途。", "接觸不保證深度理解。"],[8,9],'原文 Instead of abstract learning→conversation、school life、daily interaction。'),
 transfer('一項暑期科學營需要學生分組完成陌生實驗。','哪句把「過程」清楚連到能力結果？',["分組完成陌生實驗、發問解難，可提高適應力", "科學營有團隊活動，所以每名學生期末考試都必定滿分", "學生收到營會證書，便無須實際解難也會自動更成熟", "實驗較陌生時，學生只會焦慮而不可能學到新的方法"],["強調參與解難的過程而非只看活動名稱。", "參與不保證考試滿分。", "證書不是能力機制。", "困難也可能帶來學習。"],[5,6],'原文 This process 回指實際應對新日程及難題。'),
 transfer('海外實習費用高，學校可提供部分資助和短期名額。','哪句合理回應成本弊端？',["費用確是障礙，短期名額與部分資助或可減輕負擔", "學校提供部分資助，便表示住宿保險都不再需要支出", "海外實習費用較高，便足以否定其全部教育價值", "實習可帶來成長，所以學校不必討論家庭付費能力"],["承認費用，再提出具體減負安排。", "部分資助不等於全部免費。", "成本不取消收益。", "教育好處不取消公平問題。"],[11,12],'原文 travel、accommodation、insurance 可昂貴；短期／資助降低負擔。'),
 transfer('一名學生在第一次寄宿活動開始時想家，數天後結識朋友。','哪句恰當說明可能的情緒轉變？',["想家可能只是初期困難；逐漸適應後學生或更有信心", "初到寄宿活動想家，便代表學生今後都不能適應", "學生結識朋友後，便不需要再留意任何情緒困擾", "一名學生數天後適應，便能推定所有學生結果相同"],["保留初期不適與之後成長的可能過程。", "初期困難不必永久。", "朋友可幫助但不消除所有困擾。", "個例不能代表每人。"],[13,14,15],'原文 homesick/anxious→usually temporary→friendship/adaptation→confidence。'),
 transfer('學校比較一日參觀和數週交流。','哪句最能區分「看見新地方」與深層收穫？',["數週交流可解日常難題、與當地人互動，收穫或較深", "一日參觀時間較短，所以必然完全沒有任何教育價值", "學生見過新地方，便不必與當地人交流或處理生活問題", "數週交流有更多時間，便保證每人都立即掌握當地文化"],["延長參與有機會帶來更深層直接學習。", "短活動也可能有用。", "只看見不等於深入體驗。", "時間長不保證掌握。"],[4,8,16],'原文 far more than a simple change of scenery。'),
 transfer('學生準備討論遠足活動的利弊。','哪句借用範文的「承認弊端再權衡」方式？',["遠足有成本與不適，有支援時仍可能有長期收穫", "遠足可以學新事物，所以任何費用和想家情況都不存在", "只要有人感到不適，所有遠足活動就應一概停止", "承認遠足有好處，便表示無須檢查學校支援安排"],["承認代價後再判斷支援和學習收益。", "收益不取消成本。", "個別不適不必全面取消。", "支援是權衡條件之一。"],[2,10,17],'原文承認 cost/homesickness，仍判斷能力收穫更重要。'),
 transfer('學校舉辦跨區合作課程，學生每天與不同背景的同伴完成任務。','哪句合理推論文化交流效果？',["持續交談、共同完成任務，或增進對不同觀點的理解", "不同背景學生同坐一室，便保證每人的看法即時一致", "跨區合作可增加接觸，但學生不需要練習溝通方式", "文化差異存在，便代表學生不可能一起完成任何任務"],["真正互動與合作可能促進理解。", "同室不等於觀點相同。", "需要實際交流技巧。", "差異不阻止所有合作。"],[8,9],'原文直接互動→更開放並較能跨背景溝通。'),
 transfer('一項交換計劃原本只安排觀光，後來加入當地學校課程和接待家庭。','哪句說明修改後的教育價值？',["參與當地課堂與接待家庭生活，可練習交流和適應", "增加當地課堂後，學生便不必與接待家庭有任何互動", "景點觀光能看到地方特色，所以與參與日常生活完全相同", "與當地人共同生活或有益，因此原有觀光沒有任何價值"],["修改使學生參與真實日常而非只看景點。", "接待家庭是互動環節。", "觀光與共同生活不同。", "新收益不取消舊活動用途。"],[4,8,9],'原文把 everyday challenges 與 direct cultural experience 分別說清。'),
 transfer('作文結尾須回應「國際交流是否利大於弊」。','哪句完整收束範文兩組好處與兩個顧慮？',["交流可培養獨立與文化理解，支援可減輕費用和想家", "交流有成長好處，便表示任何家庭都不需支付費用", "初期想家值得關注，所以所有文化交流都不可能有益", "資助可減輕成本，便保證每名學生都不會再感到不適"],["同時回顧兩組好處與兩項顧慮。", "收益不取消費用。", "不適可與學習並存。", "資助不保證情緒結果。"],[3,7,12,14,17],'原文 final because 平衡重要能力與有限、可處理的弊端。'),
];
const revised=[
 {wrong:['離家參加課程後，學生有機會接觸另一城市的景點','寄宿可讓學生見到新同伴，責任感則靠校內課程培養','新環境可帶來成長，但須先確保學生沒有想家情緒'],why:['只說接觸景點，沒有寫出處理日常問題的能力過程。','見新同伴有益，卻把寄宿時的責任練習排除。','想家可與成長並存，不必先完全消除情緒。']},
 {wrong:['紀錄片可介紹文化，再讓學生用書面報告比較','親身到訪可幫理解，紀錄片則用於活動前準備','短期出國能接觸文化，學生可回來分享照片'],why:['影片與報告仍主要是間接資訊，未加入生活互動。','兩者可互補，卻未明確比較抽象知識與直接體驗。','照片分享有用，未指出與當地人相處的學習。']},
 {wrong:['科學營有團隊活動，學生或學到更多實驗知識','學生收到證書後，可向大學介紹這次參與經驗','實驗較陌生時，導師可先替學生完成難做的步驟'],why:['知識可能增加，未說明發問解難如何培養適應能力。','證書可記錄參與，不能代替真正的解難過程。','導師講解有用，但學生若不參與解難，能力機制較弱。']},
 {wrong:['部分資助可減輕學費，住宿保險仍由家庭承擔','短期名額可降低支出，家庭仍須自行負擔全部交通','實習有成長價值，因此應先選最長的海外課程'],why:['有部分減負，但沒有涵蓋短期名額這項方案。','短期有用，仍須考慮交通負擔與資助安排。','直接選最長課程，未回應題目中的費用障礙。']},
 {wrong:['初期想家需要關注，結識朋友後可再評估感受','學生結識新朋友後，可安排更長時間的寄宿活動','一名學生數天後適應，其他學生可參考其做法'],why:['重視情緒，卻未說明逐漸適應與信心的可能關係。','延長活動不是對本次情緒轉變的解釋。','個案經驗可參考，不能直接推定他人的情緒結果。']},
 {wrong:['一日參觀可增加知識，數週交流則費用較高','學生見過新地方，交流可先以照片分享為主','數週交流有更多時間，還需安排一些自由觀光'],why:['比較時長與費用，沒有說清深層學習的過程。','照片分享仍偏向觀看，缺少日常互動與解難。','觀光可以有益，仍未區分生活參與的更深收穫。']},
 {wrong:['遠足有學習好處，成本可待活動結束再計算','有人初期不適，學校應先縮短原定遠足日程','遠足有成本與不適，因此可用校內活動取代'],why:['若成本已知，不能把它排除在事前權衡之外。','縮短可能有用，但未衡量支援與長期收益。','校內活動或可替代一部分，仍未比較遠足本身收穫。']},
 {wrong:['不同背景學生同坐一室，可先學習彼此姓名','跨區合作可增加接觸，溝通技巧由教師講授','文化差異存在，學生可先各自完成小組任務'],why:['同室只是接觸，未有持續交談與共同完成任務。','教師講授可補充，卻不能取代學生親身交流。','各自完成任務會削弱跨背景合作的理解機會。']},
 {wrong:['增加當地課堂後，學生可比較兩地課程安排','景點觀光能看到地方特色，接待家庭可安排食宿','與接待家庭同住，可減少旅館方面的住宿支出'],why:['課程比較可能有用，漏掉接待家庭的日常互動。','接待家庭被當作食宿，未展現共同生活的教育價值。','費用收益不是題目要說明的文化交流機制。']},
 {wrong:['交流可促進獨立，費用則交由學生家庭自行仔細評估','交流可增跨文化溝通，想家情緒需在另文再討論','資助減輕成本後，仍可持續觀察學生適應的情況'],why:['只談自立和費用，漏掉跨文化收益及想家顧慮。','把正文已談的情緒代價排除出結尾權衡。','只談兩個顧慮，未回顧交流的兩組主要好處。']}
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[2].explanations[3]='導師代做難題會減少學生親自發問解難的機會。';
export default {key:'advantage-disadvantage:8',meta:{topic:'青少年國際交流訪問的成長與費用權衡',summary:'範文以個人成長、直接文化與語言體驗為主要優點；承認費用及想家的顧慮，再說明短期或資助計劃及逐步適應如何限制這些弊端。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
