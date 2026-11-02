// Early foreign-language learning: learning ease and fair access versus poor implementation.
// Hold for canonical Chinese repair in advantage-disadvantage-15-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:15'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many school systems, children are asked to start learning another language in primary school instead of waiting until they are teenagers.',
 'This plan may cause practical problems, but I think it is good because younger children often learn languages more easily and early lessons give every student more chances later.',
 'The biggest good point is that young children pick up sounds and the usual ways to make sentences very easily.',
 'Because they worry less about what others think than teenagers do, they are usually more willing to say new sounds again, make mistakes and try once more.',
 'This leads to one step after another: practising often helps memory; better memory helps students speak more smoothly; and speaking more smoothly makes later study less frightening.',
 'For example, a child aged six who learns songs, greetings and simple classroom words may speak with more confidence in secondary school than a student who begins grammar at thirteen.',
 'Teaching languages early also helps make opportunities fairer.',
 'If schools teach another language to all children, useful things such as learning about cultures and having more study or job choices are not only for families able to pay for private lessons.',
 'The problems are real, but they matter less than the good points.',
 'One problem is that poorly planned lessons can make children feel under pressure.',
 'If young children must learn very long word lists by heart and teachers correct them too strongly, learning can stop being fun and become worrying. They may then take part less and want to learn less.',
 'Another problem is that schools with too little money or too few teachers may take time away from helping children learn to read and write when they add a required language subject.',
 'For example, a school with too few trained teachers may put basic foreign-language practice into a full school day while children who find reading hard still need help in their first language.',
 'But these problems come from how the plan is carried out, rather than proving that starting language learning early is a bad idea.',
 'To sum up, teaching another language early has some bad points, especially when schools lack time or teachers who know how to teach it, but the good points are clearly greater.',
 'It helps children become better at a language over time and makes these benefits available to everyone, not only to families with the most money and support.',
];
const vocabulary=[
 v(['education systems','school systems','教育制度'],['encouraged','asked','獲鼓勵'],['foreign language','another language','外語'],['primary school','primary school','小學'],['teenage years','teenagers','青少年時期']),
 v(['policy','plan','政策'],['practical problems','practical problems','實際問題'],['beneficial','good','有益'],['younger learners','younger children','年幼學習者'],['acquire languages','learn languages','學會語言'],['opportunities later in life','more chances later','日後機會']),
 v(['chief advantage','biggest good point','主要優點'],['absorb','pick up','吸收'],['pronunciation','sounds','發音'],['sentence patterns','usual ways to make sentences','句型'],['unusual ease','very easily','特別容易']),
 v(['less self-conscious','worry less about what others think','較少在意別人眼光'],['adolescents','teenagers','青少年'],['repeat unfamiliar sounds','say new sounds again','重複陌生語音'],['make mistakes','make mistakes','犯錯'],['try again','try once more','再嘗試']),
 v(['chain effect','one step after another','連鎖效果'],['frequent practice','practising often','經常練習'],['improves memory','helps memory','改善記憶'],['builds fluency','helps students speak more smoothly','培養流暢度'],['less intimidating','less frightening','較不令人畏懼']),
 v(['six-year-old','child aged six','六歲孩子'],['greetings','greetings','問候語'],['classroom expressions','classroom words','課堂用語'],['confident speaker','speak with more confidence','更有口語自信'],['secondary school','secondary school','中學']),
 v(['Early language education','Teaching languages early','及早語言教育'],['promotes fairness','helps make opportunities fairer','促進公平']),
 v(['provide it to all children','teach another language to all children','提供給所有孩子'],['cultural awareness','learning about cultures','文化意識'],['study or work options','study or job choices','升學或工作選擇'],['not limited','not only','不局限'],['afford private lessons','pay for private lessons','負擔私人課程']),
 v(['disadvantages','problems','缺點'],['real','real','真實存在'],['less significant','matter less','較不重要']),
 v(['badly designed lessons','poorly planned lessons','設計欠佳課堂'],['create pressure','feel under pressure','造成壓力']),
 v(['forced','must','被迫'],['memorise long vocabulary lists','learn very long word lists by heart','背誦'],['long vocabulary lists','very long word lists','冗長詞彙表'],['corrected too harshly','correct them too strongly','過分嚴厲糾正'],['enjoyment can turn into anxiety','learning can stop being fun and become worrying','樂趣變焦慮'],['reduces participation','take part less','減少參與'],['weakens motivation','want to learn less','削弱動機']),
 v(['Another drawback','Another problem','另一缺點'],['poorly resourced schools','schools with too little money or too few teachers','資源不足學校'],['compulsory subject','required language subject','必修科目'],['take time away','take time away','擠走時間'],['essential literacy work','helping children learn to read and write','基礎讀寫教育']),
 v(['For instance','For example','例如'],['too few trained staff','too few trained teachers','受訓教師不足'],['squeeze basic language drills','put basic foreign-language practice','硬塞基本外語練習'],['crowded timetable','full school day','擠迫時間表'],['weaker readers','children who find reading hard','閱讀能力較弱者'],['first language','first language','母語']),
 v(['However','But','然而'],['problems of implementation','problems come from how the plan is carried out','實施問題'],['rather than proof','rather than proving','而非證據'],['misguided','bad idea','方向錯誤']),
 v(['In conclusion','To sum up','總結'],['early age','early','年幼時'],['disadvantages','bad points','缺點'],['lack time or expertise','lack time or teachers who know how to teach it','缺乏時間或專業能力'],['clearly greater','clearly greater','明顯更大']),
 v(['stronger long-term language ability','better at a language over time','較強長期語言能力'],['available to all','available to everyone','惠及所有人'],['most privileged','families with the most money and support','最優越一群']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many education systems, children are encouraged to begin learning computer skills in primary school rather than in their teenage years.',d:[1,8,14],relation:'以 rather than 比較開始學外語的兩個年齡階段',formula:'In many education systems, children are encouraged to begin learning [技能] in primary school rather than in their teenage years',meaning:'學校鼓勵孩子在小學而非青少年時期開始學外語。',usage:'句子只交代政策安排，利弊由後文評估。',links:['In many education systems, children are encouraged to begin learning ', ' in primary school rather than in their teenage years.'],labels:['較早學習的技能']},
 {example:'While this policy can create practical problems, I believe it is beneficial because younger pupils learn quickly and early lessons widen later opportunities.',d:[0,8,14],relation:'以 While 承認實施難題，再列較早學習及公平機會兩個理由',formula:'While this policy can create practical problems, I believe it is beneficial because [學習好處] and [機會好處]',meaning:'作者認為年幼學習較容易，及早教學也能擴大機會。',usage:'beneficial 是作者經權衡後的立場，不能只重複它而略去理由。',links:['While this policy can create practical problems, I believe it is beneficial because ', ' and ','.'],labels:['學習好處','機會好處']},
 {example:'The chief advantage is that young children absorb everyday sounds and common sentence patterns with unusual ease.',d:[1,6,9],relation:'第一好處聚焦年幼學習者較易吸收發音與句型',formula:'The chief advantage is that young children absorb [語言內容] with unusual ease',meaning:'年幼孩子學發音和句型可能較容易。',usage:'下一句再解釋較少在意別人眼光帶來的練習意願。',links:['The chief advantage is that young children absorb ', ' with unusual ease.'],labels:['較易吸收的內容']},
 {example:'Because they are less self-conscious than adolescents, they are usually more willing to repeat unfamiliar words, make mistakes and try again.',d:[2,8,12],relation:'用 Because 連較少自我顧慮與敢於重複、犯錯、再試',formula:'Because they are less self-conscious than adolescents, they are usually more willing to [練習行為一], [行為二] and [行為三]',meaning:'孩子較少在意別人眼光，通常更願意練習陌生發音及再試。',usage:'usually 限定傾向；不表示所有年幼孩子都無焦慮。',links:['Because they are less self-conscious than adolescents, they are usually more willing to ', ', ', ' and ','.'],labels:['練習行為一','行為二','再試行動']},
 {example:'This creates a chain effect: regular reading improves vocabulary, stronger vocabulary builds confidence, and growing confidence makes harder books less intimidating.',d:[2,8,12],relation:'以三步因果鏈解釋練習、記憶、流暢度的累積',formula:'This creates a chain effect: [第一行動] improves [中間能力], [能力] builds [進一步能力], and [新能力] makes [後續任務] less intimidating',meaning:'經常練習有助記憶；記憶促進流暢度；流暢度降低之後學習的畏懼感。',usage:'每一步的結果必須成為下一步的原因，不可只堆三個好處。',links:['This creates a chain effect: ', ' improves ', ', ', ' builds ', ', and ', ' makes ','.'],labels:['第一行動','中間結果','承接能力','進一步結果','再承接能力','後續學習']},
 {example:'For example, a six-year-old who learns short phrases through games often becomes a more confident speaker in secondary school than a student who starts from a grammar book at thirteen.',d:[3,8,12],relation:'用六歲與十三歲開始方式的對比具體化口語自信',formula:'For example, a six-year-old who [早期學習] often becomes [後期表現] than a student who [較遲開始]',meaning:'六歲學歌曲及課堂用語的學生，到中學或比十三歲才學文法者更敢說。',usage:'例子支援 often 的可能趨勢，不是每名學生的必然比較。',links:['For example, a six-year-old who ', ' often becomes ', ' than a student who ','.'],labels:['早期學習','後期表現','較遲學習']},
 {example:'Early music education also promotes fairness.',d:[2,8,12],relation:'短主題句轉入第二好處：所有學生可獲機會',formula:'Early [技能] education also promotes fairness',meaning:'學校及早教授外語，可使機會分配較公平。',usage:'下一句須指出學校供應如何減少對私人課程的依賴。',links:['Early ', ' also promotes fairness.'],labels:['較早教授的技能']},
 {example:'If schools provide it to all children, the benefits of learning computer skills, such as finding information and completing tasks online, are not limited to those whose parents can afford private lessons.',d:[4,6,12],relation:'用 If 說明普及校內教育如何減少私人課程門檻',formula:'If schools provide it to all children, the benefits of [技能], such as [未來收益], are not limited to those whose parents can afford private lessons',meaning:'學校人人可學，文化意識和升學工作機會便不只屬於付得起私人課者。',usage:'it 指前句的及早語言教育；公平重點是公共提供。',links:['If schools provide it to all children, the benefits of ', ', such as ', ', are not limited to those whose parents can afford private lessons.'],labels:['普及技能','未來收益']},
 {example:'The practical problems are real but less significant.',d:[2,6,12],relation:'承認缺點存在，但作較低權重判斷',formula:'[缺點] are real but less significant',meaning:'作者不否認實施缺點，只認為權重較低。',usage:'接下來仍須具體列出設計不良與資源不足兩項問題。',links:[' are real but less significant.'],labels:['承認的缺點']},
 {example:'One problem is that badly designed tests can create pressure.',d:[3,6,12],relation:'提出第一種實施問題：課堂設計不良可造成壓力',formula:'One problem is that [設計不良的安排] can create pressure',meaning:'課堂設計欠佳可能讓年幼學生受壓。',usage:'問題來源是 badly designed lessons，非及早學外語本身。',links:['One problem is that ', ' can create pressure.'],labels:['設計不良的安排']},
 {example:'If young pupils are forced to repeat every answer and are corrected too harshly, curiosity can turn into fear, which reduces participation and weakens confidence.',d:[3,9,12],relation:'以 If 展開強迫死記與嚴厲糾錯如何削弱參與動機',formula:'If young pupils are forced to [強制做法] and are corrected too harshly, [正面感受] can turn into [負面感受], which reduces [參與] and weakens [動機]',meaning:'背長詞表及過分嚴厲糾正，可能把樂趣變成焦慮，降低參與和動機。',usage:'因果鏈需保留教學條件，不要說所有語言課都造成焦慮。',links:['If young pupils are forced to ', ' and are corrected too harshly, ', ' can turn into ', ', which reduces ', ' and weakens ','.'],labels:['強制做法','原有感受','新感受','受減少的行為','受削弱的動機']},
 {example:'Another drawback is that, in poorly resourced schools, adding a new technology course may take time away from essential literacy work.',d:[3,8,10],relation:'第二種實施問題是資源不足下新必修科可能擠走讀寫支援',formula:'Another drawback is that, in poorly resourced schools, adding [新必修科] may take time away from essential literacy work',meaning:'資源不足學校加入外語必修科，可能擠走基礎讀寫時間。',usage:'此風險受學校資源條件限制，不表示外語教學必然削弱母語。',links:['Another drawback is that, in poorly resourced schools, adding ', ' may take time away from essential literacy work.'],labels:['新必修科']},
 {example:'For instance, a school with too few trained staff may squeeze basic language drills into a crowded timetable while weaker readers still need support in reading their first language.',d:[3,8,10],relation:'用教師不足與時間表緊湊說明母語支援被擠壓',formula:'For instance, a school with too few trained staff may squeeze [新活動] into a crowded timetable while weaker readers still need support in [原有需要]',meaning:'教師少而時間表滿時，外語操練可能與弱讀者的母語支援競爭時間。',usage:'重點是資源分配；不表示弱讀者不應學外語。',links:['For instance, a school with too few trained staff may squeeze ', ' into a crowded timetable while weaker readers still need support in ','.'],labels:['新活動','原有支援']},
 {example:'However, these are problems of implementation rather than proof that teaching younger children another language is misguided.',d:[3,9,12],relation:'區分實施問題與及早學外語的基本方向',formula:'However, these are problems of implementation rather than proof that [教育方向] is misguided',meaning:'課程壓力與資源不足是實施問題，不能直接證明及早學語言的方向錯。',usage:'須先具體說清何處實施失當，才能作這個區分。',links:['However, these are problems of implementation rather than proof that ', ' is misguided.'],labels:['教育方向']},
 {example:'In conclusion, teaching a foreign language at an early age has some disadvantages, especially when schools lack time or training, but the advantages are clearly greater.',d:[2,8,11],relation:'結論承認時間及專業不足的缺點，仍判斷優點較大',formula:'In conclusion, teaching a foreign language at an early age has some disadvantages, especially when schools lack [實施條件], but the advantages are clearly greater',meaning:'即使學校缺時間或專業能力，作者仍判斷早學外語利大於弊。',usage:'立場並未否認資源問題，而是主張改善實施方式。',links:['In conclusion, teaching a foreign language at an early age has some disadvantages, especially when schools lack ', ', but the advantages are clearly greater.'],labels:['欠缺的實施條件']},
 {example:'It helps children develop stronger long-term reading ability and ensures that these benefits are available to all, not just the most privileged.',d:[2,8,11],relation:'最後回顧長期能力與普及機會兩個核心好處',formula:'It helps children develop [長期能力] and ensures that these benefits are available to all, not just the most privileged',meaning:'及早語言教育有利長期語言能力，也讓益處不只屬於最有資源者。',usage:'It 指早學外語政策；第二部分是公平，不是聲稱所有人效果一樣。',links:['It helps children develop ', ' and ensures that these benefits are available to all, not just the most privileged.'],labels:['長期能力']},
];
const usageGuides=[
 '當你要用 rather than 對比兩個開始學習或採取行動的時間點時。',
 '當你要承認實施有困難，仍以兩個清楚理由支持整體做法時。',
 '當你要點出年齡或階段帶來的第一項學習優勢時。',
 '當你要用 Because 解釋較少心理顧慮如何增加重複練習、犯錯再試的意願時。',
 '當你要把練習、能力與後續信心寫成一步接一步的因果鏈時。',
 '當你要以較早與較晚開始的兩個學習者作具體比較時。',
 '當你要從學習成效轉到機會分配是否公平的第二項好處時。',
 '當你要用 If 說明普及提供如何令好處不再只限能付費的家庭時。',
 '當你要承認缺點真實存在，但指出它們在整體權衡中較輕時。',
 '當你要指出壓力源自設計不良的做法，而非整個學習目標時。',
 '當你要用 If 連接強迫做法、負面感受及參與動機下降的整條機制時。',
 '當你要指出資源不足時新增要求可能擠走另一項基本支援時。',
 '當你要用人手和時間表的具體例子，說明兩項教學需求如何競爭資源時。',
 '當你要區分實施失當與政策方向本身是否錯誤時。',
 '當你在結論承認時間或專業限制，仍說明好處權重較大時。',
 '當你要用 It 回指前句做法，並同時回顧長期能力與好處能否普及時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把早學外語的學習與公平好處，以及兩項實施風險排清。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這題比較何時開始學外語？',['小學階段與青少年時期','學期第一天與最後一天','上午與下午','週末與平日'],'原文把 primary school 與 teenage years 對比。'),
 {type:'multi',prompt:'範文主張及早學外語的兩組好處是甚麼？',detail:'選兩項，再按「確認」。',options:['年幼學生較容易練習發音與句型','學校普及教學可減少對私人課程的依賴','每名學生必然能立即流利說外語','學校毋須安排受訓教師'],correct:[0,1],why:'正文分別論證學習過程與機會公平。'},
];
const route=[sequence('依範文還原利弊與解法',[
 ['政策與立場','小學開始學外語；作者承認實際問題，但認為整體有益。'],
 ['學習過程','較少在意犯錯→更願意重複練習→記憶與流暢度逐步增強。'],
 ['普及機會','校內人人可學，語言帶來的文化及升學工作好處不只屬於付得起私課者。'],
 ['兩項實施風險','死記與嚴厲糾錯造成焦慮；資源不足可能擠走母語讀寫支援。'],
 ['最後判斷','問題在教法與資源安排，不能直接證明及早學外語本身不妥。'],
 ],'對政策好壞的判斷須分開「方向」與「實施方式」。')];
const evidence=[
 quiz('範文如何解釋年幼學習者可能較願意練習？',['他們較少在意別人眼光，通常更肯重複陌生語音並再試','每名孩子都完全沒有焦慮','青少年必然不能學任何語言','年幼孩子從不需要老師幫助'],'原文 less self-conscious / usually 保留程度與範圍。'),
 quiz('三步「連鎖效果」的順序是甚麼？',['經常練習→記憶較強→流暢度提高→日後學習較不畏懼','流暢度提高→完全不用練習→記憶消失','私人課程→只看分數→取消語言學習','先有母語讀寫問題→所有外語必須取消'],'每一步承接前一步的結果。'),
 quiz('學校普及教外語為何可能更公平？',['語言學習好處不再只限付得起私人課程的家庭','所有學生一定取得完全相同成績','私人課程從此不可能存在','學校不再需要任何資源'],'公平指機會可及，不是結果完全相同。'),
 quiz('教法設計欠佳會如何影響學生？',['強迫死記和過嚴糾錯可能令樂趣變焦慮，減少參與及動機','所有詞彙練習都必然造成焦慮','越嚴厲糾錯，孩子一定越愛學','焦慮必定立即提高流暢度'],'原文把問題限定於 badly designed lessons。'),
 quiz('資源不足學校可能面對甚麼時間取捨？',['新必修外語課可能擠走仍需的母語讀寫支援','有外語課便永遠毋須教母語','弱讀者完全不能學外語','時間表再滿也不需受訓教師'],'原文是課時及訓練資源的實施問題。'),
];
const logic=[
 sequence('早學外語的學習因果鏈',[
 ['較少自我顧慮','部分年幼孩子較敢重複陌生語音、犯錯再試。'],
 ['練習增加','頻密接觸聲音與句型，可能鞏固記憶。'],
 ['流暢度提高','較強記憶力幫助語言運用更順暢。'],
 ['日後學習','較有基礎時，之後的學習或較不令人畏懼。'],
 ],'練習、記憶與流暢度要連成順序，不是獨立堆詞。'),
 sequence('公平好處與兩種實施風險',[
 ['校內普及','所有學生可學，不必先付私人課堂費。'],
 ['教法風險','死記與過嚴糾錯可能讓學習變焦慮。'],
 ['資源風險','教師不足、課表滿時，弱讀者的母語支援可能被擠走。'],
 ['作者判斷','改善設計與資源配置，毋須把及早學習本身否定。'],
 ],'「有缺點」與「政策方向錯誤」之間仍須分析原因。'),
];
const transfers=[
 transfer('學校讓小學生透過歌曲反覆練習簡單外語問候語。','哪句準確連接活動與後續能力？',['經常練習可能鞏固聲音與句型記憶，為日後較流暢的表達打基礎。','只唱一次歌便保證所有孩子流利。','歌曲完全不能幫助任何語言練習。','年幼學生必然不需要其他課堂。'],['活動→記憶→流暢度的可能鏈條。','過度保證。','過度否定。','課堂仍需完整教學。'],[2,4,5],'原文六歲學歌曲與連鎖效果。'),
 transfer('一所公立學校為全部學生開設免費外語課。','哪句解釋其公平意義？',['校內人人可學，相關文化與升學機會便較少只屬於付得起私課者。','免費課保證所有學生能力完全一樣。','只要有公校課程，家庭資源便不再有任何差異。','免費課必然令所有私人課程消失。'],['可及性改善不等於結果一致。','無結果保證。','資源差異仍可能存在。','無此必然。'],[6,7],'原文 provide it to all→benefits not limited to parents afford private lessons。'),
 transfer('老師要求六歲學生每天背很長的詞表，發音錯誤便嚴厲責備。','哪句指出原文的教法風險？',['學習樂趣可能轉成焦慮，使學生較少參與，也較不想繼續學。','越嚴厲責備，所有孩子必然越有自信。','詞表越長，學生必然越能與人對話。','有壓力便證明所有外語教育都不合適。'],['條件→焦慮→參與與動機下降。','方向相反。','無此保證。','不能把實施問題當政策本身錯。'],[9,10,13],'原文 forced memorisation and harsh correction→anxiety。'),
 transfer('一所小學教師不足，正準備新增必修外語課。','哪句準確指出時間表風險？',['若課程表已滿，新增課可能擠壓閱讀能力較弱學生所需的母語支援。','新增外語課必然令所有學生不再識字。','教師不足完全不影響課程安排。','母語讀寫與外語學習永遠不能同時教。'],['資源條件與可能的機會成本清楚。','過度保證。','忽略教師條件。','不是必然互斥。'],[11,12],'原文 poorly resourced schools and crowded timetable。'),
 transfer('有人見到一間學校外語課設計欠佳，便說「兒童不應早學外語」。','哪句分析推論問題？',['一間學校的設計問題不能直接證明及早學外語本身方向錯誤。','任何教法都沒有改善空間。','所有學校必定有完全相同問題。','只要政策方向可取，實施細節便不用管。'],['區分實施與政策方向。','仍可改善。','不能由單校概括。','實施仍重要。'],[9,11,13],'原文 problems of implementation rather than proof policy misguided。'),
 transfer('音樂課也考慮讓學生在小學開始學習。','哪句正確轉移本文的分析方法？',['可評估早期反覆練習的好處，同時檢查教師能力和是否擠壓其他基礎課時。','外語有用，因此音樂課效果必定完全相同。','只要早開始，所有學生必然成為專業音樂家。','音樂課無須任何教師與課時。'],['轉移學習機制與實施條件，不照抄結論。','跨科目不保證同效。','過度保證。','資源仍重要。'],[2,4,11,13],'原文早期練習、教師／時間資源兩面。'),
 transfer('一位家長說孩子犯錯時很害羞，怕說外語。','哪句更貼合範文的教學啟示？',['給孩子安全的重試機會，避免過嚴糾錯把練習變成焦慮。','強迫孩子在全班前不斷接受責備。','害羞便證明孩子永遠學不好語言。','只要不糾錯，孩子就必然學會所有發音。'],['連到重複、犯錯、再試與教法設計。','加重焦慮。','無此定論。','糾錯方式仍重要。'],[3,10],'原文 willing to make mistakes/try again；too harsh correction 有害。'),
 transfer('學校宣傳早學外語時，只說「很容易學」。','哪句補上範文的第二個核心好處？',['若所有學生都能在校學習，未來語言機會較不取決於家庭是否付得起私課。','只有富裕家庭才能從公校課程受益。','學校不必考慮任何公平問題。','語言學習與未來選擇完全無關。'],['補足公平與可及性論點。','與普及提供相反。','公平是核心。','原文有關。'],[6,7,15],'原文 long-term ability 加 benefits available to all。'),
 transfer('作文結尾需承認早學外語仍有缺點。','哪句符合這篇範文的權衡？',['學校若缺時間或專業能力，課程可能有問題；但作者仍認為學習與公平好處更大。','因為作者支持政策，所以不應提任何缺點。','有一項實施問題便證明政策完全失敗。','只要年幼學習較易，教師資源便無關。'],['承認兩項條件風險，再給立場。','抹去正文。','過度推論。','資源仍重要。'],[1,8,14,15],'原文 conclusion especially when schools lack time or expertise。'),
 transfer('老師想把一段論證寫成「練習多，所以不再怕」。','哪句補出更完整的因果步驟？',['經常練習可能加強記憶，記憶有助流暢度，較流暢時後續學習或較不畏懼。','練習多便保證任何語言都不用思考。','記憶力和流暢度沒有任何連繫。','只要不怕，便永遠不用再練習。'],['補足原文三段鏈條。','過度保證。','與範文相反。','練習仍重要。'],[4],'原文 frequent practice→memory→fluency→later study less intimidating。'),
];
export default {key:'advantage-disadvantage:15',meta:{topic:'小學開始學外語的能力與機會公平',summary:'範文主張較早學外語有助發音句型、練習與長期流暢度，也讓語言機會不限於負擔得起私人課程者；教法過嚴和資源不足是須處理的實施風險。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
