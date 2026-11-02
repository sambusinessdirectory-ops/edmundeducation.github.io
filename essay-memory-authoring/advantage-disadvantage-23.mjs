// One world language: easier exchange versus heritage loss and unequal advantage.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:23'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In recent years, more travel and other contact between countries have helped English become the language used most widely around the world.',
 'Because of this, some people think everyone may one day use the same language.',
 'This would make some things much easier, but it would also have deep costs for cultures and people.',
 'The clearest good point of using one language around the world is that people can talk more easily.',
 'If people from different countries could talk without needing a person to translate or computer help, travel, business, talks between countries and research would all work faster.',
 'People might understand one another better, and new ideas might move between countries much faster.',
 'One shared language could also give more people chances to study and find work.',
 'Students could study in other countries more easily, while workers could look for jobs in more places.',
 'In this way, the same language could help connect people across places.',
 'Even so, there would also be serious bad points.',
 'A language does more than help people share information; it also keeps stories, a sense of who people are and old ways of life.',
 'If small languages were pushed out by one worldwide language, communities could lose stories, knowledge from the past and values handed down for many years.',
 'Also, a world with only one language might not be as fair as it first seems.',
 'People who grow up speaking that language would start with an advantage in business, media and university, while others might feel they must stop using their first language to do well.',
 'So a gain in ease could come at the cost of losing cultures and creating unfair differences.',
 'To sum up, one worldwide language could make talking easier and give more chances in education and work.',
 'But it could also speed up the loss of smaller languages and make things less fair between those born speaking the main language and those who were not.',
];
const vocabulary=[
 v(['expansion of tourism','more travel','旅遊擴展'],['international contact','contact between countries','國際交流'],['widely used language','language used most widely','廣泛使用語言']),
 v(['As a result','Because of this','因此'],['humanity','everyone','人類'],['a single common tongue','the same language','單一共同語言']),
 v(['notable practical benefits','make some things much easier','明顯實際好處'],['profound cultural and social costs','deep costs for cultures and people','深遠文化社會代價']),
 v(['most obvious advantage','clearest good point','最明顯優點'],['one global language','one language around the world','全球共同語言'],['ease of communication','talk more easily','溝通容易']),
 v(['interpreters','a person to translate','口譯員'],['translation software','computer help','翻譯軟件'],['trade','business','貿易'],['diplomacy','talks between countries','外交'],['academic collaboration','research','學術合作'],['efficient','work faster','有效率']),
 v(['Misunderstandings','People might understand one another better','誤解'],['ideas could cross borders','ideas might move between countries','想法跨越國界'],['far more quickly','much faster','快得多']),
 v(['common language','shared language','共同語言'],['widen access','give more people chances','擴大取得機會'],['education and employment','study and find work','教育與就業']),
 v(['study abroad','study in other countries','海外升學'],['workers','workers','勞工'],['broader international labour market','jobs in more places','更廣國際就業市場']),
 v(['In this sense','In this way','從這角度'],['shared language','same language','共同語言'],['act as a bridge','help connect','搭橋'],['closer contact','connect people across places','更緊密聯繫']),
 v(['However','Even so','然而'],['serious disadvantages','serious bad points','嚴重缺點']),
 v(['not merely','does more than','不只是'],['exchanging information','share information','交換資訊'],['carrier of memory','keeps stories','承載記憶'],['identity','sense of who people are','身分'],['tradition','old ways of life','傳統']),
 v(['smaller languages','small languages','較小語言'],['pushed aside','pushed out','被擠走'],['folk stories','stories','民間故事'],['historical knowledge','knowledge from the past','歷史知識'],['passed down for generations','handed down for many years','代代相傳']),
 v(['In addition','Also','此外'],['one-language world','world with only one language','單語世界'],['might not be as fair','might not be as fair','未必公平'],['appears','first seems','表面看來']),
 v(['born into the dominant language','grow up speaking that language','主導語言母語者'],['immediate advantage','start with an advantage','即時優勢'],['higher education','university','高等教育'],['whereas','while','而'],['feel compelled to abandon','feel they must stop using','感到被迫放棄'],['mother tongue','first language','母語']),
 v(['gained in convenience','gain in ease','所得便利'],['paid for','come at the cost','付出代價'],['cultural erosion','losing cultures','文化流失'],['social imbalance','unfair differences','社會失衡']),
 v(['In conclusion','To sum up','總結'],['worldwide','worldwide','全球'],['simplify communication','make talking easier','簡化溝通'],['wider educational and economic opportunities','more chances in education and work','更廣教育經濟機會']),
 v(['Nevertheless','But','然而'],['accelerate the loss','speed up the loss','加速流失'],['linguistic heritage','smaller languages','語言遺產'],['reinforce inequality','make things less fair','加劇不平等'],['native and non-native speakers','those born speaking the main language and those who were not','母語及非母語者']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In recent decades, the expansion of online courses and other forms of international contact has helped students study across borders.',d:[1,3,9],relation:'背景句把跨國交流擴展連到語言使用範圍',formula:'In recent decades, the expansion of [活動] and other forms of international contact has helped [對象] [結果]',meaning:'旅遊及國際接觸擴展，推動英語廣泛使用。',links:['In recent decades, the expansion of ', ' and other forms of international contact has helped '],labels:['擴展的活動','受影響者及結果']},
 {example:'As a result, some people believe that every child may one day learn the same second language.',d:[0,9,15],relation:'As a result 從前述現象引出未來推測',formula:'As a result, some people believe that [未來可能情況]',meaning:'部分人因此預測人類可能共用一種語言。',links:['As a result, some people believe that '],labels:['未來推測']},
 {example:'Such a development would offer notable practical benefits, but it would also carry serious cultural costs.',d:[1,9,15],relation:'but 同時預告實際好處與文化社會代價',formula:'Such a development would offer [好處], but it would also carry [代價]',meaning:'共同語言有溝通好處，也可能有文化及社會代價。',links:['Such a development would offer ', ', but it would also carry '],labels:['可得好處','可能代價']},
 {example:'The most obvious advantage of one global language is faster international discussion.',d:[2,9,15],relation:'主題句先提出單語世界的溝通好處',formula:'The most obvious advantage of [做法] is [核心好處]',meaning:'全球一語最明顯好處是溝通容易。',links:['The most obvious advantage of ', ' is '],labels:['做法','核心好處']},
 {example:'If people from different countries could speak to one another without interpreters or translation software, research and business would all become more efficient.',d:[3,9,10],relation:'If 假設無翻譯障礙，推到跨國活動效率',formula:'If [無障礙條件], [多種活動] would become more efficient',meaning:'免翻譯交流可提高旅遊、貿易、外交及學術合作效率。',links:['If ', ' would all become more efficient.'],labels:['無翻譯障礙的條件']},
 {example:'Misunderstandings among researchers could be reduced, and ideas could cross borders far more quickly.',d:[3,9,10],relation:'並列誤解減少與觀念傳播加快',formula:'[誤解] could be reduced, and [想法] could cross borders far more quickly',meaning:'誤解或減少，想法可更快跨國流動。',links:[' could be reduced, and ', ' could cross borders far more quickly.'],labels:['可減少的問題','可流動的內容']},
 {example:'A common language could also widen access to training and work.',d:[3,9,10],relation:'also 從溝通效率加上教育就業可及性',formula:'A common language could also widen access to [新機會]',meaning:'共同語言可擴大教育與就業機會。',links:['A common language could also widen access to '],labels:['可擴大的機會']},
 {example:'Students would be able to apply abroad more easily, while workers could compete in a wider regional labour market.',d:[3,9,10],relation:'while 並列學生及勞工兩種機會',formula:'Students would be able to [學習機會], while workers could [工作機會]',meaning:'學生較易海外升學，勞工可進入更廣國際市場。',links:['Students would be able to ', ', while workers could '],labels:['學生機會','勞工機會']},
 {example:'In this sense, a shared language could act as a bridge, bringing researchers into closer contact with one another.',d:[3,9,10],relation:'bridge 比喻語言讓人際連結更近',formula:'In this sense, a shared language could act as a bridge, bringing [群體] into closer contact with one another',meaning:'共通語言可像橋樑，拉近人與人的聯繫。',links:['In this sense, a shared language could act as a bridge, bringing ', ' into closer contact with one another.'],labels:['被連結的群體']},
 {example:'However, serious cultural costs would also arise.',d:[3,6,10],relation:'However 從好處轉向嚴重缺點',formula:'However, serious [代價] would also arise',meaning:'作者轉向文化與社會上的嚴重弊端。',links:['However, serious ', ' would also arise.'],labels:['代價種類']},
 {example:'Language is not merely a tool for exchanging information; it is also a carrier of shared stories and identity.',d:[3,9,14],relation:'not merely...; also... 說語言不只傳訊，還承載文化',formula:'[事物] is not merely a tool for [表面用途]; it is also a carrier of [深層價值]',meaning:'語言不只是傳遞資訊，也保存記憶、身分與傳統。',links:[' is not merely a tool for ', '; it is also a carrier of '],labels:['事物','表面用途','深層價值']},
 {example:'If smaller languages were pushed aside by a global one, communities could lose songs, local knowledge and values passed down for generations.',d:[3,9,14],relation:'If 假設小語言被排擠，推到世代文化記憶流失',formula:'If smaller languages were pushed aside by a global one, communities could lose [代代相傳的內容]',meaning:'小語言被擠走時，民間故事、歷史知識和文化價值或流失。',links:['If smaller languages were pushed aside by a global one, communities could lose '],labels:['可能流失的文化內容']},
 {example:'In addition, a one-language world might not be as equal as it appears.',d:[3,9,14],relation:'In addition 加入文化流失之外的公平問題',formula:'In addition, a one-language world might not be as [表面性質] as it appears',meaning:'單語世界表面方便，卻可能不公平。',links:['In addition, a one-language world might not be as ', ' as it appears.'],labels:['表面性質']},
 {example:'Those born into the dominant language would enjoy an immediate advantage in media and university, whereas others might feel compelled to abandon their mother tongue in order to succeed.',d:[3,9,14],relation:'whereas 對比主導語言母語者與非母語者的機會',formula:'Those born into the dominant language would enjoy [先天優勢], whereas others might feel compelled to [被迫選擇] in order to succeed',meaning:'主導語言母語者先佔優勢，其他人或被迫放棄母語。',links:['Those born into the dominant language would enjoy ', ', whereas others might feel compelled to ', ' in order to succeed.'],labels:['先天優勢','被迫選擇']},
 {example:'What is gained in convenience, therefore, could be paid for in cultural loss and unequal opportunity.',d:[3,9,13],relation:'therefore 總結便利收益可能以文化與公平為代價',formula:'What is gained in [收益], therefore, could be paid for in [兩種代價]',meaning:'便利或以文化侵蝕與社會失衡作交換。',links:['What is gained in ', ', therefore, could be paid for in '],labels:['獲得的收益','可能代價']},
 {example:'In conclusion, having one language worldwide could simplify discussion and create wider study and work opportunities.',d:[3,9,14],relation:'結論先重述單語溝通與機會好處',formula:'In conclusion, having one language worldwide could simplify [溝通] and create [機會]',meaning:'共同語言可簡化溝通並擴大教育經濟機會。',links:['In conclusion, having one language worldwide could simplify ', ' and create '],labels:['較簡單的溝通','新增機會']},
 {example:'Nevertheless, it could also accelerate the loss of local languages and reinforce inequality between different speaker groups.',d:[3,9,14],relation:'Nevertheless 以文化流失與不平等完成兩面結論',formula:'Nevertheless, it could also accelerate the loss of [文化價值] and reinforce inequality between [群體]',meaning:'一語世界亦可能加速語言遺產流失並加劇母語者差距。',links:['Nevertheless, it could also accelerate the loss of ', ' and reinforce inequality between '],labels:['可能流失的價值','不平等群體']},
];
const usageGuides=[
 '當你要在引言交代近年某活動擴展，如何推動另一項社會變化時。',
 '當你要用 As a result 從已描述現象引出他人的未來推測時。',
 '當你要在引言以 but 同時預告一項改變的實際好處和深層代價時。',
 '當你要用主題句指出第一項最容易直接解釋的好處時。',
 '當你要用 If 假設一種障礙被移除，再說明多項活動可能如何改善時。',
 '當你要用 and 並列一項問題減少與另一項資源流動加快時。',
 '當你要用 also 在第一項好處之外，加入另一種不同機會時。',
 '當你要用 while 並列兩組人從同一改變得到的不同機會時。',
 '當你要用 bridge 作比喻，指出某種共同工具如何拉近人與人的距離時。',
 '當你要用 However 從已說明的好處轉到尚未分析的嚴重代價時。',
 '當你要用 not merely...; also... 說明一件事除了表面用途還有深層意義時。',
 '當你要用 If 指出某種資源被排擠時，相關群體可能失去甚麼時。',
 '當你要用 In addition 加入與前一項代價不同的公平問題時。',
 '當你要用 whereas 對照原本佔優者與需要付出額外代價者時。',
 '當你要用 therefore 概括一項便利可能需要付出的兩種代價時。',
 '當你要在結論先重述已分析的兩項實際好處時。',
 '當你要用 Nevertheless 補上結論的另一面，點出文化與公平的風險時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把溝通機會、文化保存與語言權力分開排列。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這篇文章討論哪一種未來語言變化？',['全世界可能共用一種語言','每個國家一定取消旅遊業','英語必定完全停止使用','所有人只能透過翻譯軟件交談'],'焦點是 one language worldwide 的利弊。'),
 {type:'multi',prompt:'範文指出共同語言的兩項主要好處是甚麼？',detail:'選兩項，再按「確認」。',options:['跨國溝通與合作可能更有效率','教育及工作機會可能較易取得','所有小語言都會自然變得更強','母語者與非母語者必然同等有利'],correct:[0,1],why:'效率與機會是好處；後兩項反而涉及缺點。'},
];
const route=[sequence('還原單一全球語言的利弊',[
 ['背景與可能性','國際接觸擴展，部分人預測人類將來可能共用一種語言。'],
 ['溝通效率','少了翻譯障礙，旅遊、貿易、外交及學術合作或更有效率。'],
 ['機會擴大','學生較易海外升學，勞工可進入更廣工作市場。'],
 ['文化損失','較小語言或被排擠，連同故事、歷史知識及傳統流失。'],
 ['公平風險與結論','主導語言母語者先佔優勢；作者結尾保留效率與文化兩面。'],
 ],'範文沒有把「溝通容易」當成足以消除文化與公平代價的證據。')];
const evidence=[
 quiz('共同語言如何可能提高跨國活動效率？',['人們不必經口譯員或軟件轉述便可直接交流。','每個人必然立即學懂所有學科。','旅遊與貿易將完全不再需要資訊。','所有外交歧見都一定消失。'],'原文說的是減少語言障礙，非消除所有問題。'),
 quiz('學生與工人得到的機會有何不同？',['學生較易海外學習，工人可進入更廣國際勞動市場。','學生只能工作，工人只能讀書。','兩組人都必然移民。','共同語言只影響旅遊而不影響學習。'],'while 並列教育與就業兩種用途。'),
 quiz('為何語言流失不只是少了一種說法？',['語言亦承載記憶、身分與代代相傳的文化內容。','所有語言只有字母表而沒有故事。','任何一種語言流失都能立即完整重建。','語言只用於購物付款。'],'not merely tool for exchanging information。'),
 quiz('主導語言的母語者可能獲得甚麼優勢？',['在商業、媒體及高等教育中較早取得語言優勢。','他們必然比所有人更聰明。','他們不用學任何專業知識。','非母語者一定永遠不能成功。'],'原文比較語言起點，不比較智力或保證命運。'),
 quiz('範文最後如何處理利弊？',['承認溝通與機會好處，也提醒語言遺產及不平等風險。','只寫好處，完全不承認文化代價。','只寫缺點，否認所有跨國交流。','說全球一語已經必然出現。'],'結論保持兩面，不把預測寫成已發生。'),
];
const logic=[
 sequence('便利與機會的兩條好處',[
 ['共同工具','跨國人士可能直接用同一語言交流。'],
 ['效率','少了翻譯步驟，旅遊、商業及學術合作或較快。'],
 ['教育','學生較易到海外學習。'],
 ['就業','工人可競爭較廣市場的職位。'],
 ],'溝通效率與機會擴大相關，卻不是同一個結果。'),
 sequence('文化與公平的兩條代價',[
 ['小語言被擠走','較少使用的語言可能失去傳承空間。'],
 ['文化內容','故事、歷史知識與價值觀或跟着流失。'],
 ['起點不同','主導語言母語者先佔優勢。'],
 ['被迫選擇','其他人或因求學工作而放棄自己的母語。'],
 ],'不能只說「大家都會同一語言」便假定競爭條件公平。'),
];
const transfers=[
 transfer('跨國醫療團隊以同一語言交換研究結果。','哪句準確應用溝通效率的論證？',['少了翻譯步驟，團隊可能更快交換資訊並協調研究。','共同語言保證研究一定找出治療方法。','同一語言會令所有醫療分歧立即消失。','研究團隊只需要語言，不需要專業能力。'],['減少語言障礙可改善交換速度。','不能保證結果。','分歧未必消失。','專業能力仍必要。'],[4,5],'原文無翻譯障礙可令學術合作更有效率。'),
 transfer('一名學生懂得另一國大學的授課語言。','哪句保留範文對教育機會的限定？',['語言相通可讓海外學習較容易，但仍須符合其他入學條件。','只要懂語言，大學便必須立即錄取。','懂授課語言會使海外學習完全不可能。','語言能力與學習選擇永遠無關。'],['could widen access，不是入學保證。','缺少其他條件。','方向相反。','可影響選擇。'],[6,7],'原文 students would be able to study abroad more easily。'),
 transfer('一種小語言保存了社區幾代人的故事。','哪句準確指出流失風險？',['若語言被排擠，相關故事與歷史知識也可能難以傳承。','只要改用大語言，所有民間故事都會自動完整保存。','語言只負責數字計算，與社區記憶無關。','任何小語言都必然在明年消失。'],['語言承載故事與歷史，保留可能性。','無自動保存。','與原文相反。','無此日期保證。'],[10,11],'原文語言承載 memory/identity/tradition。'),
 transfer('全球企業主要用一種語言招聘。','哪句指出機會分配可能不公平？',['從小使用該語言的人可能先佔優勢，其他人須付出額外學習成本。','同一招聘語言保證所有人起點完全相同。','非母語者必然完全沒有任何工作能力。','企業招聘只取決於語言，與技能無關。'],['語言起點不同，機會可能不等。','忽略母語優勢。','過度斷言。','仍看工作技能。'],[12,13],'原文 dominant-language speakers immediate advantage。'),
 transfer('政府考慮把全部公共服務只保留一種語言。','哪句同時評估效率與文化可及性？',['服務或較易統一，但仍須檢查少數語言社群會否失去資訊與身分空間。','統一語言必然令每個社群完全同等受益。','只要有效率，少數語言使用者便不需服務。','只談招牌顏色便能完成語言政策評估。'],['同時看便利與被排除風險。','公平未獲保證。','公共服務仍應可及。','議題不相關。'],[4,10,11,13],'原文便利與文化社會代價並存。'),
 transfer('國際會議取消所有口譯服務後，部分代表溝通更快，部分人發言減少。','哪句最貼近範文的雙面框架？',['共同語言可能提高速度，卻也可能使非母語者較難平等參與。','溝通變快便證明所有代表都發言更多。','有人發言減少便證明溝通效率一定沒有改善。','會議語言只影響座位安排。'],['效率收益與參與公平可同時存在。','忽略另一面。','兩面可並存。','不相關。'],[4,13,14],'原文 practical benefits 與 social imbalance 同時討論。'),
 transfer('有人把「母語」只當一種日常工具。','哪句根據範文修正這種說法？',['母語也可能保存一個群體的記憶、故事及身分認同。','母語與任何文化內容完全沒有關係。','只要有另一種語言，所有回憶都必然消失。','母語的唯一用途是讓人買東西。'],['not merely tool，指出深層文化角色。','與原文相反。','過度保證。','用途太窄。'],[10,11],'原文語言不只交換資訊，還承載文化。'),
 transfer('文章要討論全球共同標準的利弊，例如統一度量衡。','哪句真正跨題轉用本文的思路？',['可比較跨境協作效率與各地原有知識、習慣及適應成本。','因為單一語言有好處，統一度量衡必然沒有代價。','只要標準統一，所有地方傳統都一定消失。','度量衡與任何跨境交流完全無關。'],['轉移效率與本地代價的分析維度。','不可照搬結論。','過度斷言。','可能有關。'],[4,10,12],'原文以效率和本地文化公平兩面評估共同工具。'),
 transfer('一種語言對國際求職者較有用，但社區仍教孩子本地語言。','哪句把兩個目標合理並存？',['可利用共同語言擴大工作機會，同時保留地方語言的文化傳承。','若學全球語言，孩子便必須停止使用母語。','保留本地語言必然令所有國際工作機會消失。','任何人都不可能學會兩種語言。'],['機會與傳承可同時考慮。','原文說風險非必然要求。','無此必然。','人可學多語。'],[6,10,11],'原文 opportunity benefit 與 heritage risk 可同時管理。'),
 transfer('一篇作文只說「一種語言較方便」，便下結論說一定公平。','哪句指出缺少的推論步驟？',['便利不等於公平，還須比較母語者和非母語者的起點及代價。','便利必然令每個人有同樣資源。','只要有人會翻譯，社會便沒有任何不平等。','公平與語言選擇完全無關。'],['先分辨效率與機會分配。','過度推論。','無此保證。','原文談語言優勢。'],[12,13,14],'原文 one-language world might not be as fair as it appears。'),
];
export default {key:'advantage-disadvantage:23',meta:{topic:'共同語言的效率與文化公平代價',summary:'範文承認全球共通語言可減少翻譯障礙，擴大教育與工作機會；亦指出較小語言可能連同故事和知識流失，主導語言母語者可能先佔優勢。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
