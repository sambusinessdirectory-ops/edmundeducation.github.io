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
 {example:'In today’s highly connected world, online learning has made it possible for students from different countries to study together regularly.',d:[2,9,12],relation:'引言由互聯背景引到跨國即時交流',formula:'In today’s highly connected world, [工具] has made it possible for [異地群體] to [新行動]',meaning:'數碼交流使不同國家的人可快速、經常互動。',usage:'只描述科技讓甚麼交流可能發生，避免說所有人都已得到同樣機會。',links:['In today’s highly connected world, ', ' has made it possible for ','.'],labels:['工具','受益群體與行動']},
 {example:'Through online courses and video calls, individuals who would otherwise never meet are now able to exchange knowledge, ask questions and work together.',d:[0,9,12],relation:'用 Through 指工具，再列過往受地理限制的互動',formula:'Through [工具], individuals who would otherwise never meet are now able to [交流行動]',meaning:'社交媒體、訊息、視像讓本不相遇者交換想法、建關係與合作。',usage:'例子須把工具與跨地域互動連上，不只羅列應用程式。',links:['Through ', ', individuals who would otherwise never meet are now able to ','.'],labels:['工具','互動']},
 {example:'This is an overwhelmingly positive development because it expands study options and helps students cooperate, although a few disadvantages do exist.',d:[1,10,15],relation:'給總體正面立場，同時承認少數弊端',formula:'This is an overwhelmingly positive development because [兩個好處], although a few disadvantages do exist',meaning:'作者認為機會與跨文化理解勝過少數缺點。',usage:'overwhelmingly positive 是本篇權衡，不是所有線上交流場景的普遍事實。',links:['This is an overwhelmingly positive development because ', ', although a few disadvantages do exist.'],labels:['支持立場的好處']},
 {example:'The most significant advantage is that an international study group gives people access to mentors and projects that geography would normally prevent.',d:[2,9,12],relation:'把地理限制與新關係／機會直接對照',formula:'The most significant advantage is that [線上安排] gives people access to [人脈／機會] that geography would normally prevent',meaning:'跨國網上交流可提供原本受距離阻隔的人脈與機會。',usage:'access 不等於每人必然獲工作；後文用具體例子說明可能結果。',links:['The most significant advantage is that ', ' gives people access to ', ' that geography would normally prevent.'],labels:['線上安排','新關係與機會']},
 {example:'A student in Singapore, for instance, can seek advice from a university mentor in Canada, join an online research group, and later develop connections that would have been impossible in the past.',d:[3,8,11],relation:'一個學生例子由求建議、入群組到發展長期人脈',formula:'A student in [地點], for instance, can [尋求導師協助], [參與跨國群組], and later develop [學術／職業連結] that would have been impossible in the past',meaning:'香港學生可向英國導師請教，加入多國小組，再建立學術或職業人脈。',usage:'例子應展示一步步形成機會，不把一次線上談話直接當成成功保證。',links:['A student in ', ', for instance, can ', ' that would have been impossible in the past.'],labels:['所在地','一連串跨境行動']},
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
 transfer('跨國研究群讓兩地原本不相識的學生在線合作。','哪句說明科技突破地理阻隔？',['線上小組讓原本難相遇的學生交流想法並一起做研究。','兩地學生本來就在同一課室。','一有群組，研究必然成功。','跨國交流只能靠實體旅行。'],['工具、地理限制、新合作關係清楚。','與題境相反。','無成功保證。','可在線。'],[0,1],'原文 otherwise never meet→exchange ideas/build relationships/work together。'),
 transfer('某學生向外國導師請教，加入國際讀書群。','哪句把交流連到實際機會而不保證結果？',['他可能從建議與群組逐步建立學習及工作人脈。','導師一定直接給他工作。','加入群組等於已獲大學學位。','網上請教只可能是無用閒談。'],['可能產生教育與職涯連結。','過度保證。','群組非學位。','可有實際結果。'],[4,5],'原文 mentor/group/connections；can lead to practical outcomes。'),
 transfer('兩國青年直接討論各自學校與家庭生活。','哪句說明跨文化理解的機制？',['彼此聽到不同生活方式和觀點，可能較能理解對方。','一次交談保證消除所有偏見。','只有看到網上照片才算交流。','不同習俗必然使雙方不信任。'],['直接接觸→不同觀點→可能更開放。','過度保證。','有實際討論。','無此必然。'],[6,7],'原文 regular contact can reduce prejudice；direct communication exposes customs/viewpoints。'),
 transfer('一則跨國網傳錯誤消息，澄清前已被大量分享。','哪句指出真正風險？',['錯誤說法可能在更正前觸及多人，造成混亂或不信任。','被大量分享便證明消息正確。','澄清一定比傳播快。','錯誤資訊只會影響發文者本人。'],['傳播速度與可能後果都有。','分享數非真偽。','與題境反。','跨境可擴散。'],[10,11],'原文 false information crosses borders rapidly；claims spread before correction。'),
 transfer('某平台允許使用者用匿名帳號與修飾照片建立關係。','哪句謹慎描述可能弊端？',['一些關係可能因身分不透明而流於表面，甚至出現欺騙。','所有匿名使用者必然是騙徒。','匿名一定令每段關係更真誠。','照片經修飾就證明此人從不在線交流。'],['可能性與部分情況清楚。','過度絕對。','無保證。','不相關。'],[12,13],'原文 anonymous/edited selves→occasionally superficial/deceptive。'),
 transfer('另一作者認為跨國網絡好處大，但需處理假資訊。','哪句給出有條件的正面立場？',['跨境交流可帶來人脈和文化理解，但假資訊風險仍需承認。','跨境交流既有益，假資訊便完全無害。','有假資訊風險，所以任何交流都無價值。','能聯絡外國人就保證找到工作。'],['好處與風險同列。','抹掉風險。','過度否定。','無工作保證。'],[2,14,16],'原文 overwhelmingly positive although drawbacks；conclusion comparison。'),
 transfer('實習生透過國際群組認識外地同行。','哪句不把人脈等同已得到職位？',['群組可能擴大職業聯繫，日後或帶來工作機會。','只要認識外地同行便已正式受聘。','所有群組只供閒談，絕無實際用途。','工作機會與人際交流完全無關。'],['分開連結與可能結果。','連結非錄用。','原文有實際用途。','可能有關。'],[3,5],'原文 access to relationships/opportunities；can lead to employment prospects。'),
 transfer('兩地青年對同一社會議題有不同看法。','哪句避免把差異直接當偏見？',['直接交流不同觀點，可幫助雙方理解差異並檢查原有成見。','兩人看法不同便必然彼此歧視。','文化不同表示完全不能合作。','一次談話保證雙方永遠意見一致。'],['交流可能促理解。','分歧不等於偏見。','可合作。','過度保證。'],[7,8],'原文 exposed to different viewpoints→more open-minded。'),
 transfer('一段作文先談在線導師，再談跨文化交流。','哪句概括兩個不同好處？',['網上跨境交流既可帶來實際學習機會，也可增進文化理解。','導師建議與文化理解完全是同一件事。','所有聯繫都只有社交用途。','跨文化交流只會帶來錯誤消息。'],['機會和理解各一條論證線。','兩者不同。','可有教育用途。','忽略好處。'],[8,15],'原文 both practical opportunities and intercultural understanding。'),
 transfer('某人說「假資訊在所有情況都很輕微」。','哪句根據範文作較準確限定？',['範文僅在本篇的利弊權衡中判斷風險較小，不能當普遍定律。','任何跨國假資訊都不會傷害人。','線上平台永遠無法散播錯誤。','所有負面影響都與使用方式無關。'],['把作者立場限定於已論證情境。','過度絕對。','與正文反。','原文提不負責任使用。'],[14,16],'原文 relatively limited／minor in comparison 是作者的相對判斷。'),
];
export default {key:'advantage-disadvantage:6',meta:{topic:'跨國網上交流的機會、文化理解與風險',summary:'跨國線上聯繫可突破距離，形成教育、職涯人脈，亦可讓人直接接觸不同文化；虛假資訊快速擴散與匿名關係可能淺薄是風險。作者在本文論證中判斷好處較大，此判斷須保留其相對範圍。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
