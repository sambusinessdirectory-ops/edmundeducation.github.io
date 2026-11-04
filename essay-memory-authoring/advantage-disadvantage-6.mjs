// International online communication: 17 complete grouped learning sentences.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:6'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Today, people in different countries can talk to each other quickly and often through digital tools.',
 'Social media, chat apps and video calls let people who may never meet share ideas, make friends and work together.',
 'I think this is very good because it gives people more chances and helps societies understand one another, although it also has some problems.',
 'The biggest benefit is that online contact across countries gives people friends and chances that distance would usually stop.',
 'For example, a Hong Kong student can ask a British university mentor for help, join a group with people from different countries, and later make study or work contacts that once seemed impossible.',
 'This is important because these talks are more than friendly chat: they can improve education, job chances and work contacts.',
 'Another big benefit is that regular talk with people from other cultures can reduce false ideas and unfair judgement.',
 'When people speak directly with people abroad, they learn about different ways of life and ideas. This can help them be more willing to listen and live with people from many backgrounds.',
 'So online contact across countries can help people find useful chances and understand other cultures better.',
 'But there are also some problems.',
 'The biggest problem is that online sites can spread false or harmful information very quickly between countries.',
 'Wrong claims about politics, health or social issues can reach many people before anyone corrects them, and this may cause confusion or distrust.',
 'Also, talking online can sometimes feel less real than talking in person.',
 'Because people can use names that hide who they are or show edited versions of themselves, online relationships may sometimes be shallow or dishonest.',
 'Still, these problems are fairly limited and often come from people using the tools badly, not from contact across countries itself.',
 'To sum up, online contact with people in other countries can bring large benefits, especially more chances and better understanding between cultures.',
 'Although it can also spread false information and allow dishonest contact, these problems matter less than the benefits, so the overall effect is good.',
];
const vocabulary=[
 v(['highly connected world','Today','高度互聯的世界'],['digital communication','digital tools','數碼交流'],['interact instantly and regularly','talk to each other quickly and often','即時並定期互動']),
 v(['social media, messaging apps and video calls','Social media, chat apps and video calls','社交媒體、訊息應用、視像通話'],['otherwise never meet','may never meet','本來無緣見面'],['exchange ideas','share ideas','交流想法'],['build relationships','make friends','建立關係'],['work together','work together','合作']),
 v(['overwhelmingly positive development','very good','整體高度正面'],['expands access to valuable opportunities','gives people more chances','增加有價值機會'],['greater understanding between societies','societies understand one another','促進社會間理解'],['disadvantages do exist','has some problems','仍有缺點']),
 v(['most significant advantage','biggest benefit','最大好處'],['online international communication','online contact across countries','跨國網上交流'],['access to relationships and opportunities','friends and chances','接觸人脈與機會'],['geography would normally prevent','distance would usually stop','地理阻隔原本會阻止']),
 v(['for instance','For example','例如'],['seek advice','ask a British university mentor for help','尋求建議'],['university mentor','university mentor','大學導師'],['academic or professional connections','study or work contacts','學術或職業人脈'],['impossible in the past','once seemed impossible','過往不可能']),
 v(['not merely casual conversation','more than friendly chat','不只是閒談'],['practical outcomes','improve','實際結果'],['improved education','improve education','改善教育'],['better employment prospects','job chances','更佳就業前景'],['broader career networks','work contacts','更廣職業人脈']),
 v(['major benefit','big benefit','重要好處'],['regular contact','regular talk','定期接觸'],['other cultures','other cultures','其他文化'],['reduce ignorance and prejudice','reduce false ideas and unfair judgement','減少無知與偏見']),
 v(['communicate directly with foreigners','speak directly with people abroad','直接與外國人交流'],['exposed to different customs, viewpoints and lifestyles','learn about different ways of life and ideas','接觸不同習俗觀點與生活方式'],['open-minded','willing to listen','更開放'],['globalised society','people from many backgrounds','全球化社會']),
 v(['Therefore','So','因此'],['highly beneficial','can help','非常有益'],['practical opportunities','useful chances','實際機會'],['deeper intercultural understanding','understand other cultures better','更深跨文化理解']),
 v(['There are, however','But there are','然而也有'],['some disadvantages','some problems','若干缺點']),
 v(['most serious','biggest problem','最嚴重'],['online platforms','online sites','網上平台'],['false or harmful information','false or harmful information','虛假或有害資訊'],['across borders with alarming speed','very quickly between countries','跨境急速傳播']),
 v(['Misleading claims','Wrong claims','誤導說法'],['large audiences','many people','大量受眾'],['before they are corrected','before anyone corrects them','被糾正前'],['confusion or mistrust','confusion or distrust','混亂或不信任']),
 v(['In addition','Also','此外'],['digital interaction','talking online','數碼互動'],['less genuine','less real','較不真實'],['face-to-face communication','talking in person','面對面交流']),
 v(['anonymous accounts','names that hide who they are','匿名帳號'],['edited versions of themselves','edited versions of themselves','修飾過的自我形象'],['occasionally','sometimes','有時'],['superficial or even deceptive','shallow or dishonest','淺薄甚至欺騙']),
 v(['Nevertheless','Still','儘管如此'],['relatively limited','fairly limited','相對有限'],['irresponsible use of technology','people using the tools badly','不負責任使用科技'],['international communication itself','contact across countries itself','跨國交流本身']),
 v(['In conclusion','To sum up','總結'],['substantial benefits','large benefits','重大好處'],['creating opportunities','more chances','創造機會'],['intercultural understanding','understanding between cultures','跨文化理解']),
 v(['misinformation','false information','錯誤資訊'],['insincere interaction','dishonest contact','不真誠互動'],['minor in comparison','matter less than the benefits','相對較小'],['overall effect is clearly positive','overall effect is good','整體效果正面']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In today’s highly connected world, online learning has made it possible for students from different countries to study together regularly.',d:[2,9,12],relation:'引言由互聯背景引到跨國即時交流',formula:'In today’s highly connected world, [工具] has made it possible for [異地群體] to [新行動]',meaning:'數碼交流使不同國家的人可快速、經常互動。',usage:'只描述科技讓甚麼交流可能發生，避免說所有人都已得到同樣機會。',links:['In today’s highly connected world, ', ' has made it possible for ', ' to ','.'],labels:['工具','異地群體','新行動']},
 {example:'Through online courses and video calls, individuals who would otherwise never meet are now able to exchange knowledge, ask questions and work together.',d:[0,9,12],relation:'用 Through 指工具，再列過往受地理限制的互動',formula:'Through [工具], individuals who would otherwise never meet are now able to [交流行動]',meaning:'社交媒體、訊息、視像讓本不相遇者交換想法、建關係與合作。',usage:'例子須把工具與跨地域互動連上，不只羅列應用程式。',links:['Through ', ', individuals who would otherwise never meet are now able to ','.'],labels:['工具','互動']},
 {example:'This is an overwhelmingly positive development because it expands study options and helps students cooperate, although a few disadvantages do exist.',d:[1,10,15],relation:'給總體正面立場，同時承認少數弊端',formula:'This is an overwhelmingly positive development because [兩個好處], although a few disadvantages do exist',meaning:'作者認為機會與跨文化理解勝過少數缺點。',usage:'overwhelmingly positive 是本篇權衡，不是所有線上交流場景的普遍事實。',links:['This is an overwhelmingly positive development because ', ', although a few disadvantages do exist.'],labels:['支持立場的好處']},
 {example:'The most significant advantage is that an international study group gives people access to mentors and projects that geography would normally prevent.',d:[2,9,12],relation:'把地理限制與新關係／機會直接對照',formula:'The most significant advantage is that [線上安排] gives people access to [人脈／機會] that geography would normally prevent',meaning:'跨國網上交流可提供原本受距離阻隔的人脈與機會。',usage:'access 不等於每人必然獲工作；後文用具體例子說明可能結果。',links:['The most significant advantage is that ', ' gives people access to ', ' that geography would normally prevent.'],labels:['線上安排','新關係與機會']},
 {example:'A student in Singapore, for instance, can seek advice from a university mentor in Canada, join an online research group, and later develop connections that would have been impossible in the past.',d:[3,8,11],relation:'一個學生例子由求建議、入群組到發展長期人脈',formula:'A student in [地點], for instance, can [尋求導師協助], [參與跨國群組], and later develop [學術／職業連結] that would have been impossible in the past',meaning:'香港學生可向英國導師請教，加入多國小組，再建立學術或職業人脈。',usage:'例子應展示一步步形成機會，不把一次線上談話直接當成成功保證。',links:['A student in ', ', for instance, can ', ', ', ', and later develop ', ' that would have been impossible in the past.'],labels:['所在地','尋求導師協助','參與跨國群組','學術／職業連結']},
 {example:'This matters because such contact is not merely casual conversation; it can lead to practical outcomes such as new research partnerships.',d:[4,8,11],relation:'用分號把非閒談與可見教育／就業結果連起來',formula:'This matters because [交流] is not merely casual conversation; it can lead to practical outcomes such as [結果]',meaning:'跨境聯繫可帶來教育、求職與職業人脈的實際結果。',usage:'can lead to 表可能性；不可承諾每次聊天都有工作成果。',links:['This matters because ', '; it can lead to ','.'],labels:['有目的的交流','可能結果']},
 {example:'Another major benefit is that regular contact with people from other cultures can reduce unfair assumptions.',d:[2,9,12],relation:'由實際機會轉入跨文化認識的第二優點',formula:'Another major benefit is that regular contact with people from other cultures can reduce [不理解或偏見]',meaning:'定期接觸其他文化可減少無知與偏見。',usage:'can 表示潛在好處，下一句要說交流如何提供不同觀點。',links:['Another major benefit is that regular contact with people from other cultures can reduce ','.'],labels:['可減少的問題']},
 {example:'When individuals communicate directly with foreigners, they are exposed to different ways of solving shared problems, which makes them more willing to listen and cooperate.',d:[3,10,13],relation:'以 When→接觸差異→which 解釋開放視野機制',formula:'When individuals communicate directly with foreigners, they are exposed to [不同文化內容], which makes them [態度或能力改變]',meaning:'直接交流帶來不同習俗、觀點與生活方式，可令人更開放。',usage:'接觸差異可能促理解，但不能從交流本身保證偏見消失。',links:['When individuals communicate directly with foreigners, they are exposed to ', ', which makes them ','.'],labels:['接觸到的差異','可能改變']},
 {example:'Therefore, online international communication is highly beneficial because it creates both student mentoring and deeper understanding between cultures.',d:[3,10,13],relation:'把前兩項好處合併成局部結論',formula:'Therefore, online international communication is highly beneficial because it creates both [實際機會] and [跨文化理解]',meaning:'機會與更深的跨文化理解是兩條主要收益。',usage:'局部總結應回扣前文兩條機制，不能只重複「有益」。',links:['Therefore, online international communication is highly beneficial because it creates both ', ' and ','.'],labels:['第一好處','第二好處']},
 {example:'There are, however, real disadvantages.',d:[2,6,12],relation:'短轉折句由優點移到缺點',formula:'There are, however, [程度] disadvantages',meaning:'作者承認有缺點，接下來討論虛假資訊與不真誠互動。',usage:'短句後須給可檢驗的風險，不能只有空泛警告。',links:['There are, however, ', ' disadvantages.'],labels:['程度']},
 {example:'The most serious is that online messages can reach huge groups before anyone checks them.',d:[3,6,12],relation:'把最嚴重風險點明為虛假資訊跨境快速傳播',formula:'The most serious is that [最主要風險]',meaning:'平台可快速跨國傳播虛假或有害資訊。',usage:'這是作者的風險排序，後句須說傳播速度為何造成混亂。',links:['The most serious is that ','.'],labels:['最主要風險']},
 {example:'Misleading claims about disaster relief can reach large audiences before they are corrected, which may create confusion or mistrust.',d:[4,7,13],relation:'用 which 回指錯誤說法先傳播後糾正所生的風險',formula:'Misleading claims about [議題] can reach large audiences before they are corrected, which may create [社會後果]',meaning:'政治、健康、社會錯誤說法在澄清前廣傳，可能使人混亂或不信任。',usage:'may 保留可能性；不要把每個錯誤消息都寫成已造成全社會不信任。',links:['Misleading claims about ', ' can reach large audiences before they are corrected, which may create ','.'],labels:['議題','可能後果']},
 {example:'In addition, online friendships can sometimes be less genuine than face-to-face communication.',d:[4,8,11],relation:'以 In addition 引入第二類非資訊風險：關係真實性',formula:'In addition, [網上互動] can sometimes be less genuine than [面對面互動]',meaning:'數碼互動有時不如面談真誠。',usage:'sometimes 是限制；不能說所有網上關係都虛假。',links:['In addition, ', ' can sometimes be less genuine than ','.'],labels:['網上形式','實體形式']},
 {example:'Because users can choose false names or hide important details, online relationships may occasionally be shallow or even deceptive.',d:[3,7,11],relation:'用 Because 解釋匿名或修飾身分如何增加關係風險',formula:'Because [可隱藏或修飾身分], online relationships may occasionally be [結果]',meaning:'匿名帳號與修飾自我可能令部分關係淺薄或具欺騙性。',usage:'may occasionally 限定發生率；不是匿名本身必然等於欺騙。',links:['Because ', ', online relationships may occasionally be ','.'],labels:['風險條件','可能結果']},
 {example:'Nevertheless, these problems are manageable and are usually caused by careless posting rather than by international communication itself.',d:[2,10,16],relation:'把問題歸因於不負責任使用，然後重回總體比較',formula:'Nevertheless, these problems are [相對程度] and are usually caused by [使用方式] rather than by international communication itself',meaning:'作者把缺點視為相對有限，主要歸因於不負責任使用。',usage:'這是本篇作者的評價，不是證明所有跨境假資訊都影響輕微。',links:['Nevertheless, these problems are ', ' and are usually caused by ', ' rather than by international communication itself.'],labels:['問題程度','主要原因']},
 {example:'In conclusion, the ability to communicate online with people from other countries brings lasting benefits, especially by creating study networks and encouraging mutual understanding.',d:[2,10,14],relation:'結論回顧跨國機會與文化理解兩個已論證優點',formula:'In conclusion, the ability to communicate online with people from other countries brings [總體好處], especially by [機會] and [理解]',meaning:'跨國網上交流促進機會與文化理解。',usage:'不在結論加入全新利益，應重用正文的兩個主論點。',links:['In conclusion, the ability to communicate online with people from other countries brings ', ', especially by ', ' and ','.'],labels:['總體好處','機會','理解']},
 {example:'Although it may also enable misleading rumors and insincere contact, these drawbacks are minor in comparison, so the overall effect is clearly positive.',d:[2,10,14],relation:'先承認兩個弊端，再作作者的相對權衡',formula:'Although it may also enable [兩風險], these drawbacks are minor in comparison, so the overall effect is clearly positive',meaning:'作者認為假資訊與不真誠互動不足以推翻整體正面效果。',usage:'minor in comparison 是相對本篇已說的好處；需先真正比較風險，不能當通用定律。',links:['Although it may also enable ', ', these drawbacks are minor in comparison, so the overall effect is clearly positive.'],labels:['承認的兩風險']},
];
const usageGuides=[
 '當你要在引言指出某項新條件，使兩組人能做以往較難做的事時。',
 '當你要用 Through 交代工具，再說明原本不會接觸的人如何互動時。',
 '當你要先表明整體評價，列出兩項理由，同時承認仍有少數缺點時。',
 '當你要用 The most significant advantage 開始解釋最重要的好處時。',
 '當你要以一名具體人物的多個連續行動，展示機會如何逐步形成時。',
 '當你要用 not merely...; it can... 對照表面活動與較實際的可能成果時。',
 '當你要用 Another major benefit 另起一項與第一項不同的好處時。',
 '當你要用 When 描述接觸某人或某事後，新資訊如何可能改變態度時。',
 '當你要用 Therefore 收束本段已分析的兩條好處線時。',
 '當你要用 however 在承認好處之後，引出接下來的缺點段時。',
 '當你要用 The most serious 從多項風險中指出最值得分析的一項時。',
 '當你要用 before 說明某事可能先於修正發生，再用 which 說明可能後果時。',
 '當你要用 In addition 加入另一種可能風險，並以 sometimes 限定其範圍時。',
 '當你要用 Because 說明某種條件如何令結果偶爾出現時。',
 '當你要用 Nevertheless 承認問題存在，同時分辨它由做法本身還是使用方式造成時。',
 '當你要在結論重述主要好處，並以 especially by 指出最重要的兩條途徑時。',
 '當你要用 Although 承認兩項風險，再清楚比較它們與已分析的好處時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清跨境機會、文化理解、假資訊與關係真實性。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('原題兩個明示子問題是甚麼？',['跨國網上交流的好處，以及是否有缺點','只談社交媒體廣告價格','只談面談時的衣著','只談本地通訊費'],'須回答 advantages 及 any disadvantages。'),
 {type:'multi',prompt:'範文論證的兩項優點是甚麼？',detail:'選兩項，再按「確認」。',options:['跨地人脈及教育／工作機會','與其他文化直接交流，可能減少偏見','每則網上消息都必然真實','每段網上關係都比面談深厚'],correct:[0,1],why:'正文先機會，再跨文化理解，後段另談風險。'},
];
const route=[sequence('依範文重排跨國網上交流利弊',[
 ['引言','數碼工具讓異國人士交流；作者判斷好處整體較大。'],
 ['機會','香港學生跨國求導、入群組，形成學術或職業人脈。'],
 ['理解','直接接觸不同習俗、觀點和生活方式，可能減少偏見。'],
 ['弊端','虛假資訊跨境快傳；匿名或修飾身分可能令關係淺薄。'],
 ['結論','回顧兩項收益與兩項風險，再提出本篇的整體正面權衡。'],
 ],'「相對較小」是作者在本篇的比較判斷，不能用來抹掉嚴重假資訊。')];
const evidence=[
 quiz('香港學生向英國導師請教的例子主要支援甚麼？',['跨地關係可能產生教育與職業機會','所有導師都會錄取這名學生','網上消息永不需要查證','每段網上友誼都很深厚'],'由求建議、加入群組到建立人脈。'),
 quiz('直接接觸其他文化的因果機制是甚麼？',['認識不同習俗觀點，可能更開放並減少偏見','只看圖片便保證完全理解文化','每次談話都會消除所有歧視','彼此不同就不可能合作'],'原文用 can，並指出直接交流帶來不同觀點。'),
 quiz('錯誤說法最關鍵的傳播風險？',['可能在澄清前已跨境觸及大量人','所有人一定相信每個說法','網上平台完全不能更正','跨境交流只傳送真實資訊'],'速度先於糾正，可能造成混亂或不信任。'),
 quiz('匿名與修飾身分帶來甚麼關係風險？',['部分網上關係可能淺薄甚至具欺騙性','匿名必然是犯罪','所有網上關係都不真誠','面談永遠沒有任何誤導'],'原文 may occasionally，不能一概而論。'),
 quiz('結論的正面判斷如何限定？',['在本篇已比較的利益與風險下，作者認為好處較大','假資訊在所有情境都必定無害','所有國際交流都不需查證','匿名關係永遠可信'],'這是作者的相對權衡，非普遍事實。'),
];
const logic=[
 sequence('跨境交流的兩條優點鏈',[
  ['地理障礙','平常不相遇者透過訊息／視像結識。'],['實際結果','導師建議、學術群組、工作人脈。'],
  ['文化障礙','直接接觸不同習俗與看法。'],['認識結果','有機會更開放、減少刻板偏見。'],
 ],'接觸本身是機會，教育與理解仍需要實際互動。'),
 sequence('風險和權衡的順序',[
  ['資訊風險','錯誤說法在查證前跨境快傳。'],['關係風險','匿名及修飾身分可使部分關係淺薄。'],
  ['作者解釋','問題常與不負責任使用有關。'],['最後判斷','本篇認為機會與理解收益更大，但不否認風險。'],
 ],'先充分陳述弊端，才有資格作相對大小判斷。'),
];
const transfers=[
 transfer('跨國研究群讓兩地原本不相識的學生在線合作。','哪句說明科技突破地理阻隔？',["網上小組讓原本難相遇的學生交換想法並合作研究", "研究群建立後，兩地學生仍只能在同一實體課室交流", "小組可連接兩地學生，因此研究結果必定立即成功", "學生能在線討論，但跨國合作仍必須先作實體旅行"],["科技降低地理限制，促進交流合作。", "線上不要求同一課室。", "連接不保證研究成功。", "實體旅行不是唯一方式。"],[0,1],'原文 otherwise never meet→exchange ideas/build relationships/work together。'),
 transfer('某學生向外國導師請教，加入國際讀書群。','哪句把交流連到實際機會而不保證結果？',["外國導師建議與讀書群或幫他逐步建立學習工作人脈", "學生收到導師建議後，便一定直接得到海外全職工作", "加入國際群組等同獲得大學資格，毋須再完成課程", "網上請教可交換資訊，但完全不可能形成任何後續聯繫"],["把交流連到可能的人脈與機會，未保證職位。", "建議不是聘書。", "群組不等於學位。", "聯繫可能由交流建立。"],[4,5],'原文 mentor/group/connections；can lead to practical outcomes。'),
 transfer('兩國青年直接討論各自學校與家庭生活。','哪句說明跨文化理解的機制？',["互聽學校與家庭生活的不同觀點，或能增進彼此理解", "兩國青年只需談一次，所有文化偏見便會永久消失", "雙方生活習慣不同，因此任何對話都不可能有幫助", "直接交談能分享經驗，但理解只取決於社交平台照片"],["以具體生活與觀點交流作理解機制。", "一次談話不保證零偏見。", "差異可成為學習材料。", "忽略直接談話作用。"],[6,7],'原文 regular contact can reduce prejudice；direct communication exposes customs/viewpoints。'),
 transfer('一則跨國網傳錯誤消息，澄清前已被大量分享。','哪句指出真正風險？',["錯誤消息或在澄清前傳到多人，引起混亂與不信任", "訊息被大量轉發，便足以證明其內容已獲事實核對", "平台有更正功能，所以假消息總會在分享前被攔下", "跨國誤傳可能很快，但影響只會留在最初發文者身上"],["快速跨境擴散可先於更正造成影響。", "分享量不是正確性證據。", "更正未必先於擴散。", "多人可能受影響。"],[10,11],'原文 false information crosses borders rapidly；claims spread before correction。'),
 transfer('某平台允許使用者用匿名帳號與修飾照片建立關係。','哪句謹慎描述可能弊端？',["部分關係或因匿名身分不明而較表面，甚至出現欺騙", "帳號匿名時，所有使用者都必然有欺騙他人的意圖", "照片經修飾，便可以證明每段網上關係都是假的", "平台可保護私隱，所以身分不透明不可能帶來風險"],["限定為部分可能風險，避免污名化匿名者。", "匿名不等於詐騙。", "修圖不保證所有關係虛假。", "私隱好處不取消信任風險。"],[12,13],'原文 anonymous/edited selves→occasionally superficial/deceptive。'),
 transfer('另一作者認為跨國網絡好處大，但需處理假資訊。','哪句給出有條件的正面立場？',["跨境交流可增人脈與文化理解，假資訊風險仍須承認", "國際聯繫可能有益，所以錯誤消息絕不會造成損失", "假資訊可能流傳，因此任何網上跨境合作都沒有價值", "能聯絡外國人便等同已有工作，不用再談其他好處"],["保留兩類收益與真實風險的條件式立場。", "收益不取消風險。", "風險不取消收益。", "人脈不等於錄取。"],[2,14,16],'原文 overwhelmingly positive although drawbacks；conclusion comparison。'),
 transfer('實習生透過國際群組認識外地同行。','哪句不把人脈等同已得到職位？',["群組或擴大職業聯繫，日後才可能帶來實際工作機會", "與外地同行交換訊息後，便可直接視為已正式受聘", "實習生認識新同行，只會增加閒談而無其他可能用途", "國際聯繫或有幫助，卻完全不能改變職業資訊來源"],["把認識他人與可能就業機會分開。", "聯繫不是聘用。", "人脈可能有後續用途。", "聯繫可拓闊資訊。"],[3,5],'原文 access to relationships/opportunities；can lead to employment prospects。'),
 transfer('兩地青年對同一社會議題有不同看法。','哪句避免把差異直接當偏見？',["直接交流不同觀點或幫雙方理解差異並檢查既有成見", "兩人對議題看法不同，便能直接判斷雙方互相歧視", "文化差異值得討論，因此任何共同合作都必定失敗", "一次對話可增加理解，所以雙方往後一定意見完全相同"],["差異是對話材料，不等於偏見證據。", "觀點差異不直接等於歧視。", "差異不排除合作。", "理解不要求意見一致。"],[7,8],'原文 exposed to different viewpoints→more open-minded。'),
 transfer('一段作文先談在線導師，再談跨文化交流。','哪句概括兩個不同好處？',["在線跨境交流可帶來學習人脈，也可能增加文化理解", "外國導師的建議就是文化理解，兩項好處無須分開說", "跨境聯繫只會產生社交閒談，不可能帶來學習機會", "文化交流可能有價值，因此實際學習人脈並不重要"],["分清實際機會與理解兩種不同收益。", "導師人脈與文化理解不等同。", "忽略可能的實際機會。", "兩類好處可並存。"],[8,15],'原文 both practical opportunities and intercultural understanding。'),
 transfer('某人說「假資訊在所有情況都很輕微」。','哪句根據範文作較準確限定？',["本文只判此情境利大於弊，不能推成假資訊普遍無害", "本文認為交流有益，所以任何跨境假消息都不會傷人", "網上平台可促進理解，故錯誤消息不可能在其中擴散", "某些假資訊或影響較小，便足以代表所有情境都相同"],["區分本篇權衡和跨情境普遍定律。", "作者仍承認風險。", "平台用途不阻止錯誤擴散。", "不能由局部推到全部。"],[14,16],'原文 relatively limited／minor in comparison 是作者的相對判斷。'),
];
const revised=[
 {wrong:['研究群讓兩地學生互通訊息，但合作仍待線下會面','小組可連接兩地學生，研究品質仍須由導師評估','學生能在線討論，合作成果可待學期末再展示'],why:['把線上交流和線下會面切開，未說清線上即可合作。','品質評估合理，卻未明確呈現地理阻隔如何被克服。','成果展示是後續步驟，沒有指出跨地合作的機制。']},
 {wrong:['外國導師可給學習建議，學生便可先修改申請文件','加入國際讀書群後，學生可知道更多外國大學課程','網上請教能交換資訊，後續人脈留待畢業後再建立'],why:['有具體建議，但未連到逐步建立學習與職涯聯繫。','課程資訊可能有用，未說清人脈與機會如何形成。','將人脈推遲，忽略交流本身即可開始建立聯繫。']},
 {wrong:['兩國青年交流學校制度，家庭習慣另找資料了解','兩國青年分享家庭生活，便可比較哪國安排較優','直接對話後，雙方可在平台上交換更多生活照片'],why:['只談制度資訊，漏掉對具體家庭生活的相互理解。','把交流變成高低評比，未理解不同觀點。','照片可補充，但不是題目中的直接討論機制。']},
 {wrong:['錯誤消息傳到多人，平台可在兩天後附上更正','消息大量分享後，應先評估各帳號的轉發次數','錯誤消息發出後，先向最初發文者要求解釋'],why:['更正有用，但未點明澄清之前已造成混亂。','轉發數字不能說明錯誤資訊對信任的影響。','追查來源有必要，仍未表達已擴散到多人的風險。']},
 {wrong:['匿名帳號可保護私隱，交友時可另行查證身分','修飾照片或影響第一印象，關係可先由聊天開始','平台應先提供身分驗證，再讓用戶選擇是否使用'],why:['私隱有益，但未描述匿名可能令關係淺薄或受騙。','有提修圖影響，卻未說清身分不明造成的信任風險。','是可能的對策，不是對現有平台弊端的描述。']},
 {wrong:['跨境交流可增加學習人脈，假資訊可留待另文討論','文化交流有好處，職業機會則須等正式畢業再看','虛假資訊有風險，跨境連繫宜主要用於日常娛樂'],why:['將已知風險排除在本文立場之外，判斷不完整。','漏掉當下可形成的學習與職涯人脈。','承認風險，卻低估了本文論證的教育與文化收益。']},
 {wrong:['群組可帶來聯繫，實習生因此可開始準備求職','與外地同行交換訊息，之後可請對方介紹職位','實習生認識同行後，通常會收到新的行業資訊'],why:['準備求職是下一步，但未說清職位只屬未來可能。','介紹職位是可能發生的事，尚未區分人脈與正式聘用。','得到資訊也是收益，但未明確說明工作機會的條件。']},
 {wrong:['不同觀點反映文化差異，雙方可先清楚各自表態','兩地青年可交換意見，再判斷哪一方說法較為正確','一次對話或減少誤解，之後可避免談其他敏感問題'],why:['先表態不足以達成相互理解與檢查成見。','把交流當作勝負比較，未學習對方經驗。','避開分歧未必能理解差異或反思既有成見。']},
 {wrong:['導師建議可增加學習選項，文化理解留待另一段','外國導師的建議能增加文化理解，職涯仍須另談','跨境聯繫可擴大人脈，文化交流的收益則較難量化'],why:['只概括學習，未同時列出正文兩項不同收益。','把導師人脈與文化理解混成同一機制。','文化收益不能因難量化便從概括句刪去。']},
 {wrong:['本文的交流利大於弊，因此假資訊風險可略過','假資訊在此情境影響有限，可套用到類似平台','跨境網絡有學習用途，風險主要留給平台處理'],why:['相對權衡仍須承認假資訊可能造成實際損害。','單一情境無法證明類似平台的風險都有限。','風險責任可分配，但不能把它從判斷中刪除。']}
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
export default {key:'advantage-disadvantage:6',meta:{topic:'跨國網上交流的機會、文化理解與風險',summary:'跨國線上聯繫可突破距離，形成教育、職涯人脈，亦可讓人直接接觸不同文化；虛假資訊快速擴散與匿名關係可能淺薄是風險。作者在本文論證中判斷好處較大，此判斷須保留其相對範圍。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
