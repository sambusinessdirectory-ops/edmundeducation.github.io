// Online-only public libraries: digital reach/efficiency versus exclusion/community loss.
// Hold for canonical Chinese repair in advantage-disadvantage-17-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:17'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'For a long time, public libraries have been buildings where people borrow books, study in quiet and find information they can trust.',
 'But some people think libraries will soon be only online, with all books and help available on the internet.',
 'This change would have clear good points, but it would also cause important problems.',
 'One big good point of libraries that are only online is that more people can reach them.',
 'Websites let people get books, magazines and facts at once, wherever they are and at any time of day.',
 'This is especially useful for people far from a library, people who find moving about hard and people who work all day and cannot easily visit a building.',
 'Another good point is that the service can work faster and more easily.',
 'Online books and other materials can be changed more quickly, and people can find a name or subject much more easily by typing words instead of looking along shelves.',
 'Also, online services may lower some running costs, such as paying for big buildings or making many paper copies of the same book.',
 'But losing library buildings would also have serious bad points.',
 'The clearest problem is that some people cannot use digital services as easily as others.',
 'Not everyone has a steady internet connection, a suitable computer or phone, or the skills to use online materials without difficulty.',
 'For those people, a fully online service would make it harder, not easier, to reach information.',
 'Also, public libraries do more than lend books; they give people a place to meet and learn.',
 'Many people need them as quiet places to study, join learning sessions, use computers or ask library staff for help in person.',
 'When a library exists only on a screen, this help from real people may be lost.',
 'Information may still be there, but people may lose the feeling that they are welcome, helped and part of a place everyone shares.',
 'To sum up, making public libraries completely online would make them easier to use from far away and make some services work faster.',
 'At the same time, it could make unequal access worse and weaken the wider role of libraries as places for local people.',
];
const vocabulary=[
 v(['physical spaces','buildings','實體場所'],['borrow books','borrow books','借書'],['study quietly','study in quiet','安靜學習'],['reliable information','information they can trust','可靠資訊']),
 v(['However','But','然而'],['institutions','libraries','機構'],['exist only online','be only online','只在線上存在'],['digitally accessible','available on the internet','數碼可及']),
 v(['development','change','發展'],['clear benefits','clear good points','明顯好處'],['notable drawbacks','important problems','顯著缺點']),
 v(['major advantage','big good point','主要優點'],['online-only libraries','libraries that are only online','純網上圖書館'],['accessibility','more people can reach them','可及性']),
 v(['Digital platforms','Websites','數碼平台'],['obtain','get','取得'],['journals','magazines','期刊'],['reference materials','facts','參考資料'],['instantly','at once','即時'],['regardless of location or opening hours','wherever they are and at any time of day','不限地點或開放時間']),
 v(['especially beneficial','especially useful','尤其有益'],['remote areas','far from a library','偏遠地區'],['mobility issues','find moving about hard','行動不便'],['full-time workers','people who work all day','全職工作者'],['in person','visit a building','親身到訪']),
 v(['Another benefit','Another good point','另一好處'],['efficiency','work faster and more easily','效率']),
 v(['Online collections','Online books and other materials','線上館藏'],['updated more quickly','changed more quickly','更快更新'],['specific title or topic','name or subject','特定書名或主題'],['keywords','typing words','關鍵字'],['walk through shelves','looking along shelves','走過書架尋找']),
 v(['In addition','Also','此外'],['digital services','online services','數碼服務'],['operational costs','running costs','營運成本'],['maintaining large buildings','paying for big buildings','維持大型館舍'],['printing multiple physical copies','making many paper copies','印製多份實體副本']),
 v(['However','But','然而'],['disappearance of library buildings','losing library buildings','圖書館建築消失'],['serious disadvantages','serious bad points','嚴重缺點']),
 v(['most obvious','clearest','最明顯'],['digital inequality','some people cannot use digital services as easily as others','數碼不平等']),
 v(['stable internet connection','steady internet connection','穩定網絡'],['suitable devices','suitable computer or phone','合適裝置'],['technical skills','skills','技術能力'],['comfortably','without difficulty','輕鬆使用']),
 v(['such individuals','those people','這些人'],['fully digital system','fully online service','完全數碼化系統'],['broaden access','easier','擴大使用機會'],['narrow it','make it harder','收窄使用機會']),
 v(['Furthermore','Also','此外'],['more than book-lending services','do more than lend books','不只借書'],['community spaces','place to meet and learn','社區空間']),
 v(['rely on them','need them','依靠圖書館'],['quiet places to study','quiet places to study','安靜學習場所'],['attend workshops','join learning sessions','參加工作坊'],['librarians','library staff','館員'],['face-to-face guidance','help in person','面對面指導']),
 v(['Once','When','一旦'],['only on a screen','only on a screen','只在螢幕上'],['human element','help from real people','人際元素'],['may be lost','may be lost','可能失去']),
 v(['Knowledge','Information','知識'],['remain available','still be there','仍可取得'],['sense of welcome','feeling that they are welcome','受歡迎感'],['support','helped','支援'],['public belonging','part of a place everyone shares','公共歸屬感']),
 v(['In conclusion','To sum up','總結'],['entirely online services','completely online','完全線上服務'],['convenience','easier to use','便利'],['reach','from far away','覆蓋範圍'],['efficiency','work faster','效率']),
 v(['At the same time','At the same time','與此同時'],['deepen social inequality','make unequal access worse','加深社會不平等'],['wider community role','wider role of libraries as places for local people','更廣社區作用'],['physical libraries','libraries','實體圖書館']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Public libraries have long been physical spaces where people read, meet quietly and ask for help.',d:[1,9,17],relation:'先交代實體圖書館的傳統功能',formula:'Public libraries have long been physical spaces where people [實體用途]',meaning:'圖書館是借書、學習和尋找可靠資訊的地方。',usage:'背景句為後文「失去建築」的社區功能分析鋪路。',links:['Public libraries have long been physical spaces where people ','.'],labels:['實體用途']},
 {example:'However, some believe that these institutions will soon exist only online, with all classes and advice becoming digitally accessible.',d:[0,9,17],relation:'引入只保留線上圖書館的預測或主張',formula:'However, some believe that these institutions will soon exist only online, with all [服務] becoming digitally accessible',meaning:'有人相信圖書館將只以網上形式提供書籍和服務。',usage:'some believe 是一方觀點，不是已發生的普遍事實。',links:['However, some believe that these institutions will soon exist only online, with all ', ' becoming digitally accessible.'],labels:['轉移到線上的服務']},
 {example:'This development would bring several clear benefits, although it would also create important losses.',d:[0,9,17],relation:'用 although 預告線上化的利弊兩面',formula:'This development would bring [好處], although it would also create [缺點]',meaning:'純線上服務會有明顯好處，也有顯著缺點。',usage:'would 表假設的全面線上化後果；不能當作已觀測到的結果。',links:['This development would bring ', ', although it would also create ','.'],labels:['好處','缺點']},
 {example:'One major advantage of online-only libraries is access from different locations.',d:[2,7,10],relation:'第一好處以可及性為中心',formula:'One major advantage of online-only libraries is [主要好處]',meaning:'網上平台可讓更多不易到訪館舍的人使用資料。',usage:'下一句須說地點與開放時間，之後再說受益群體。',links:['One major advantage of online-only libraries is ','.'],labels:['主要好處']},
 {example:'Digital platforms allow users to obtain articles and learning materials instantly, regardless of location or opening hours.',d:[3,10,14],relation:'即時取得內容且不受地點與開放時間限制',formula:'Digital platforms allow users to obtain [資料] instantly, regardless of [地點或時間限制]',meaning:'數碼平台可讓人隨時隨地取得書籍、期刊與參考材料。',usage:'技術可用仍取決於使用者有設備、網絡及能力，後文會補此限制。',links:['Digital platforms allow users to obtain ', ' instantly, regardless of ','.'],labels:['可得資料','被移除的限制']},
 {example:'This is especially beneficial for people living far from a library, those with mobility issues, and workers who may find it difficult to visit a library building in person.',d:[4,10,14],relation:'指出偏遠、行動不便與全職工作人士的特定受益條件',formula:'This is especially beneficial for [受益群體], who may find it difficult to visit [實體場所] in person',meaning:'偏遠居民、行動不便者與全職工作者可能較易使用服務。',usage:'especially 是相對受益，不代表每位這些群體都已具備數碼設備。',links:['This is especially beneficial for ', ' who may find it difficult to visit ', ' in person.'],labels:['較受益群體','實體場所']},
 {example:'Another benefit is faster searching and updating.',d:[3,10,14],relation:'短主題句轉入與可及性不同的效率好處',formula:'Another benefit is [第二好處]',meaning:'另一好處是更新與查找資料更有效率。',usage:'下一句需列網上更新和關鍵字搜尋的具體機制。',links:['Another benefit is ','.'],labels:['第二好處']},
 {example:'Online collections can be updated each week, and searching for a research topic becomes far easier when readers can use keywords rather than read every page.',d:[4,10,14],relation:'用網上更新與關鍵字搜尋具體解釋效率',formula:'Online collections can be updated [更新速度], and searching for [目標] becomes far easier when readers can use [方法甲] rather than [方法乙]',meaning:'網上館藏較快更新，關鍵字搜尋比逐架尋書容易。',usage:'效率好處來自更新和搜尋方式，不必推論所有讀者都喜歡純線上閱讀。',links:['Online collections can be updated ', ', and searching for ', ' becomes far easier when readers can use ', ' rather than ','.'],labels:['更新速度','搜尋目標','新方法','舊方法']},
 {example:'In addition, digital services may reduce certain operational costs, such as maintaining physical buildings and printing many copies.',d:[4,10,14],relation:'補充可能節省館舍維護及印刷的部分成本',formula:'In addition, digital services may reduce certain operational costs, such as [可減少開支]',meaning:'純數碼服務可能減少部分建築維護及印刷成本。',usage:'may/certain 限定成本種類，不表示所有營運費用都會下降。',links:['In addition, digital services may reduce certain operational costs, such as ','.'],labels:['可減少開支']},
 {example:'However, the disappearance of library buildings would also have social disadvantages.',d:[3,6,14],relation:'由數碼效率轉到實體館舍消失的缺點',formula:'However, the disappearance of library buildings would also have [負面後果]',meaning:'完全取消實體館舍可能有嚴重後果。',usage:'後面分數碼不平等與社區空間流失兩條線。',links:['However, the disappearance of library buildings would also have ','.'],labels:['負面後果']},
 {example:'The most obvious is unequal digital access.',d:[3,6,14],relation:'第一缺點點明數碼不平等',formula:'The most obvious is [首要缺點]',meaning:'沒有網絡、裝置或技能的人可能被排除。',usage:'The most obvious 指前句 disadvantages，須與後句具體障礙相連。',links:['The most obvious is ','.'],labels:['首要缺點']},
 {example:'Not everyone has a reliable connection, suitable devices, or the technical skills needed to use online resources comfortably.',d:[4,8,14],relation:'列出網絡、裝置及技能三種數碼門檻',formula:'Not everyone has [網絡條件], [裝置條件], or [技能條件] needed to use online resources comfortably',meaning:'並非所有人都具穩定網絡、合適設備及數碼技能。',usage:'缺任一條件都可能影響實際可及性。',links:['Not everyone has ', ', ', ', or ', ' needed to use online resources comfortably.'],labels:['網絡','裝置','能力']},
 {example:'For such individuals, a fully digital system would not widen access but narrow it.',d:[4,8,14],relation:'用 not...but 對特定人群反轉可及性主張',formula:'For such individuals, a fully digital system would not [預期好處] but [反向後果]',meaning:'對欠缺數碼條件的人，全面線上化可能收窄而非擴大使用機會。',usage:'such individuals 指前句所列人群；不可概括所有使用者。',links:['For such individuals, a fully digital system would not ', ' but ','.'],labels:['預期好處','反向後果']},
 {example:'Furthermore, public libraries are more than book-lending services; they are places for the community.',d:[4,10,12],relation:'分號兩句指出圖書館除借書外亦是社區空間',formula:'Furthermore, public libraries are more than [服務一]; they are [更廣角色]',meaning:'實體圖書館有社區場所的功能。',usage:'下一句須列學習、工作坊、電腦與面對面協助。',links:['Furthermore, public libraries are more than ', '; they are ','.'],labels:['基本服務','更廣角色']},
 {example:'Many people rely on them as places to meet, study and use computers, or ask librarians for personal advice.',d:[4,10,12],relation:'列出安靜學習、工作坊、電腦及館員面對面服務',formula:'Many people rely on them as [場所用途], or ask librarians for [人際協助]',meaning:'館舍也供人學習、參加活動、使用電腦及詢問館員。',usage:'them 指實體圖書館，不能改成純數碼服務的功能清單。',links:['Many people rely on them as ', ', or ask librarians for ','.'],labels:['場所用途','人際協助']},
 {example:'Once a library exists only on a screen, that human element may be weakened.',d:[4,10,13],relation:'Once 提出線上化後可能流失的人與人服務',formula:'Once a library exists only on a screen, that human element may be [可能變化]',meaning:'只剩螢幕時，面對面協助可能消失。',usage:'may 指風險，不能說網上館員永遠無法提供任何支援。',links:['Once a library exists only on a screen, that human element may be ','.'],labels:['可能變化']},
 {example:'Knowledge may remain available, yet the sense of welcome, support, and shared belonging could quietly disappear.',d:[4,10,13],relation:'用 yet 對比知識仍可得與受歡迎、支援、公共歸屬流失',formula:'Knowledge may remain available, yet the sense of [人際感受] could quietly disappear',meaning:'資料仍在，但被歡迎和獲支援的公共歸屬感可能消失。',usage:'重點是實體公共空間的人際經驗，與數碼資料供應不同。',links:['Knowledge may remain available, yet the sense of ', ' could quietly disappear.'],labels:['可能失去的人際感受']},
 {example:'In conclusion, turning public libraries into entirely online services would improve convenience, access from afar, and search efficiency.',d:[2,10,13],relation:'結論先回顧便利、覆蓋及效率三項好處',formula:'In conclusion, turning public libraries into entirely online services would improve [三項好處]',meaning:'純線上化可改善便利、遠距使用與搜尋效率。',usage:'下一句仍要回顧數碼排除和社區作用減弱。',links:['In conclusion, turning public libraries into entirely online services would improve ','.'],labels:['好處總結']},
 {example:'At the same time, it could deepen unequal access and weaken the wider community role that physical libraries still play.',d:[2,10,13],relation:'最後保留不平等與實體圖書館社區角色的代價',formula:'At the same time, it could deepen [公平代價] and weaken [社區角色]',meaning:'全面線上化可能加深不平等並削弱實體館舍的社區功能。',usage:'it 指全部改為線上服務，不是一般的網上借書補充功能。',links:['At the same time, it could deepen ', ' and weaken ','.'],labels:['公平代價','社區角色']},
];
const usageGuides=[
 '當你要先介紹某種服務原有的形式與用途，再談它可能如何改變時。',
 '當你要用 However 引出與現狀不同的預測，並以 with 補充其具體安排時。',
 '當你要在引言同時預告改變可能有好處與壞處時。',
 '當你要用 One major advantage 開始解釋第一項好處時。',
 '當你要先寫一項服務所能做到的事，再用 regardless of 說明條件限制被移除時。',
 '當你要以多組受益者，具體說明上一句的好處對誰最有用時。',
 '當你要用 Another benefit 另起一項與前一項不同的好處時。',
 '當你要用 and 連接兩項改進，再以 rather than 對比新舊做法時。',
 '當你要用 In addition 補充第三項可能的好處，並以 such as 舉例時。',
 '當你要用 However 從多項好處轉到改變帶來的缺點時。',
 '當你要用 The most obvious 回指前句的一組缺點，指出最突出的那一項時。',
 '當你要用 Not everyone 指出一項方案無法惠及所有人的具體條件時。',
 '當你要用 For such individuals 回指上一句的人群，再對比原先聲稱的好處與實際後果時。',
 '當你要用 more than 說明某事物除了表面用途，還有另一項重要角色時。',
 '當你要列出人們如何使用一個場所或服務，以支持上一句提出的額外角色時。',
 '當你要用 Once 說明某種改變發生後，一項原有特質可能流失時。',
 '當你要用 yet 對照仍然保留的部分與可能失去的部分時。',
 '當你要在結論中用 In conclusion 概括已分析的主要好處時。',
 '當你要用 At the same time 補上結論的另一面，避免只重述好處時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清遠距使用、搜尋效率、數碼門檻與社區功能。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('範文評估甚麼變化？',['公共圖書館完全轉為線上服務','只增加圖書館的營業時間','只修改館藏分類字母','把所有書籍改成同一主題'],'online-only libraries 是假設變化。'),
 {type:'multi',prompt:'文章承認純線上圖書館的兩種主要好處是甚麼？',detail:'選兩項，再按「確認」。',options:['遠距取得資料，不受館舍開放時間限制','館藏更新和關鍵字搜尋更有效率','保證每位讀者都有穩定網絡','保證所有社區活動繼續在實體空間舉行'],correct:[0,1],why:'可及性與效率是兩組好處。'},
];
const route=[sequence('依範文重排純線上圖書館的利弊',[
 ['背景與變化','圖書館原是實體公共空間；有人預期全部服務線上化。'],
 ['可及性好處','遠方、行動不便及全職工作者可不受地點與開放時間限制取得資料。'],
 ['效率好處','館藏更新、關鍵字搜尋較快；某些館舍及印刷成本或減少。'],
 ['數碼不平等','沒有穩定網絡、裝置或技能者可能更難使用。'],
 ['社區作用與結論','安靜學習、工作坊、館員指導及公共歸屬感可能流失。'],
 ],'技術上的遠距可達與每個人實際能用，是兩個不同問題。')];
const evidence=[
 quiz('網上圖書館的可及性好處主要來自甚麼？',['可不受地點與開放時間限制，即時取得數碼資料','每人必然擁有同樣的數碼技能','所有館舍永久開放二十四小時','只要有網頁便不需要任何出版物'],'accessibility 的機制是遠距和時間彈性。'),
 quiz('哪幾類人可能特別受益？',['偏遠居民、行動不便者及難以親訪的全職工作者','只住在館舍隔壁的人','只有圖書館館員','只能在晚上使用紙本書的人'],'源文本列三個特定群體。'),
 quiz('效率論證有哪些具體措施？',['網上更新館藏、關鍵字搜尋，並可能節省部分館舍及印刷成本','只把書架改成不同顏色','要求讀者逐本打開所有書','停止所有資訊更新'],'效率包含搜尋與部分營運成本。'),
 quiz('為何全面線上化對部分人反而收窄使用機會？',['缺穩定網絡、合適裝置或所需技能時，不能舒適使用資源','所有網上資料都一定不可靠','每位偏遠居民都拒絕使用電腦','只要設線上服務，圖書館便沒有任何內容'],'digital inequality 指實際使用門檻。'),
 quiz('實體圖書館除借書外還有甚麼角色？',['安靜學習、工作坊、電腦使用和館員面對面指導的社區空間','只是一座放書的倉庫','必然只服務全職工作者','全部用途都可由關鍵字搜尋完整取代'],'more than book lending 是社區功能。'),
];
const logic=[
 sequence('線上便利與實際可及的條件',[
 ['技術便利','書刊可即時從遠處取得，並以關鍵字查找。'],
 ['受益者','遠方、行動不便或工作時間難以訪館者可能更方便。'],
 ['使用條件','仍需網絡、裝置和數碼能力。'],
 ['反向結果','欠缺條件者在純線上制度下反而更難使用。'],
 ],'範文的反轉是「對誰」可及，而非線上平台本身沒有便利。'),
 sequence('效率與社區功能的權衡',[
 ['更新搜尋','數碼館藏較快更新，關鍵字減少找書時間。'],
 ['部分成本','館舍維護和多份紙本印製或可節省。'],
 ['實體用途','讀者可學習、參加活動、借用電腦及詢問館員。'],
 ['公共感受','即使知識仍在，受歡迎與歸屬感可能流失。'],
 ],'節省營運成本與保留公共空間價值，須分開評估。'),
];
const transfers=[
 transfer('政府打算把申請服務全部搬到網上。','哪句轉用範文的「技術便利與數碼門檻」分析？',['線上申請可節省到場時間，但沒有穩定網絡或合適裝置的人可能更難使用。','只要服務上網，每位居民都必然受益。','網上申請一定完全不需任何設備。','線上便利便證明實體協助毫無用途。'],['同時評估遠距便利與實際門檻。','過度普遍化。','設備仍需。','實體協助可重要。'],[4,11,12],'原文線上便利對部分人有益，對缺網絡裝置者可縮窄使用。'),
 transfer('一位全職工作者難以在圖書館開放時間到訪。','哪句準確說明純線上的特定好處？',['可在較方便的時間遠距取得書刊和參考材料。','全職工作者必然不懂用任何設備。','只有親身走過書架才可查找資料。','網上閱讀會自動延長實體館舍營業時間。'],['時間與地點彈性正對其困難。','無此假設。','搜尋可在線上進行。','兩者不同。'],[4,5],'原文 full-time workers difficult to visit in person。'),
 transfer('網上館藏可用關鍵字搜尋，但仍有讀者喜歡現場詢問館員。','哪句分清效率與人際服務？',['關鍵字可加快找資料；面對面提問則提供另一種指導與支持。','搜尋速度快便證明館員指導毫無價值。','有館員便完全不需要任何搜尋工具。','兩種服務不可能同時存在。'],['兩種用途各自成立。','未替代人際作用。','搜尋仍有用。','可並存。'],[7,14,15],'原文 keyword search 與 face-to-face guidance 分屬兩面。'),
 transfer('偏遠地區居民使用電子書平台。','哪句把受益條件說完整？',['若有網絡及合適裝置，居民可不必遠行便取得書籍。','所有偏遠居民一定有快速網絡。','只要地區偏遠，電子書便永遠不能讀。','網站上線便能保證每位居民都熟悉操作。'],['遠距好處仍需數碼條件。','無普遍保證。','過度否定。','技能仍需。'],[5,11,12],'原文 remote users benefit；digital inequality limits some。'),
 transfer('某公共閱讀室提供安靜座位、電腦與工作坊。','哪句正確分析其價值？',['它既可提供資料，也是一個供人學習、活動和使用設備的公共空間。','只有紙本借書才算圖書館作用。','提供座位便必然令所有人讀書成績相同。','工作坊與社區生活完全無關。'],['more than book lending，列具體場所用途。','漏社區作用。','無成績保證。','活動可連社區。'],[13,14],'原文 community spaces/quiet study/workshops/computers。'),
 transfer('市政府說純數碼服務能節省維持大型建築的費用。','哪句保留原文成本限定？',['部分館舍或印刷開支可能下降，但不能據此說所有服務成本都會消失。','所有數碼服務永遠完全免費。','節省建築費便證明人人有網絡。','只要省錢，社區作用便不需要評估。'],['may reduce certain operational costs。','仍有營運成本。','成本不解決門檻。','仍需評估。'],[8,9,18],'原文 certain operational costs；後文有社區代價。'),
 transfer('一項線上學習平台內容齊全，但部分學生缺乏設備。','哪句轉用範文的反向可及論證？',['資料雖可在線上取得，缺設備者的實際使用機會卻可能減少。','內容越多，設備越不重要。','缺設備的學生必然不想學習。','只要平台免費，網絡與技能便不再需要。'],['對特定人群，技術可用不等於實際可用。','設備仍必要。','無此推論。','其他門檻仍在。'],[11,12],'原文 fully digital system would not broaden access but narrow it for such people。'),
 transfer('地方圖書館關閉後仍有電子書，讀者卻失去安靜學習場所。','哪句完整寫出兩面？',['書籍仍可取得，但供人安靜學習與受歡迎的公共空間可能流失。','電子書存在便代表實體場所的所有用途仍在。','失去館舍便代表所有知識即時消失。','安靜學習場所與社區毫無關係。'],['知識供應與公共場所感受分開。','忽略場所。','原文說知識 may remain。','有公共功能。'],[15,16],'原文 Knowledge may remain, yet welcome/support/belonging could disappear。'),
 transfer('作者要在結尾回顧純線上圖書館的利弊。','哪句最貼近範文的平衡總結？',['線上化可提升遠距便利與效率，也可能擴大數碼不平等並削弱社區作用。','線上化對所有人都只有好處。','因為存在門檻，網上搜尋便完全沒有價值。','只列館舍節省費用，不提讀者使用。'],['兩種好處與兩種缺點俱全。','與正文不符。','抹掉效率好處。','未完整。'],[17,18],'原文結尾 convenience/reach/efficiency 對 inequality/community role。'),
 transfer('另一項公共服務想完全取消實體窗口。','哪句可轉用本文的決策檢查？',['先看遠距服務便利了誰，也看誰因網絡、裝置或面對面支援不足而受阻。','既然服務數碼化，就毋須評估任何群體。','只看網站速度，不用看實際使用者。','所有實體窗口必然無任何人際價值。'],['把可及性分受益與受阻兩類，兼看人際服務。','忽略受影響者。','不完整。','過度否定。'],[5,11,14,15],'原文數碼便利與 digital inequality/community space 兩線。'),
];
export default {key:'advantage-disadvantage:17',meta:{topic:'純線上公共圖書館的便利與公共空間代價',summary:'範文承認遠距取得資料、關鍵字搜尋和部分成本節省；同時指出沒有網絡、設備或技能者可能被排除，實體圖書館的學習場所、館員協助及公共歸屬功能也可能流失。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
