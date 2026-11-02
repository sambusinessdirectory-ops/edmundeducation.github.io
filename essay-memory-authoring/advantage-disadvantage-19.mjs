// Globalisation: local business/culture pressures versus broader cross-border opportunity.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:19'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'The way countries become more connected is now a big part of life, changing how people buy and sell things, work, travel and enjoy other cultures.',
 'This can put pressure on local shops and ways of life. Still, I think the good points are greater because people get more chances and countries can work together more closely.',
 'One big problem is that closer links between countries can hurt local businesses.',
 'When companies from other countries come in, small local shops may find it hard to stay open because they cannot match the low prices, strong adverts or ways of getting goods of large brands.',
 'For example, a clothes shop run by a family may lose buyers when a big shop from another country opens nearby and sells similar clothes for less.',
 'This can mean fewer local jobs and make a town rely more on companies from outside.',
 'Another problem is that local ways of life may become less visible.',
 'If young people everywhere watch the same films, eat the same fast food and follow the same clothes fashions, local ways of doing things may slowly become less noticed.',
 'In this way, the world may sometimes seem less full of different cultures and more like the same thing repeated.',
 'But the good points matter more in this essay.',
 'Closer links between countries let goods, knowledge and services go from one country to another, which can help people live better.',
 'For example, a hospital in a less wealthy country may get medical machines from abroad, while students in poorer areas can take online classes made by universities in other countries.',
 'These connections are not only about buying and selling; they can create chances people would otherwise not have.',
 'Countries being more connected also gives workers and businesses more chances.',
 'For example, a small company that makes computer programs can sell its work to customers in other countries instead of only selling nearby.',
 'At the same time, meeting people from other cultures can help people listen to different views, especially when they work, study or talk with people from other backgrounds.',
 'To sum up, closer links between countries do have bad points, especially for local shops and ways of life.',
 'Even so, I think they are good overall because they bring chances, knowledge and working together to far more people than countries acting alone could.',
];
const vocabulary=[
 v(['Globalisation','countries become more connected','全球化'],['defining feature','big part','重要特徵'],['modern life','life','現代生活'],['trade','buy and sell things','貿易'],['consume culture','enjoy other cultures','接觸文化']),
 v(['place pressure on','put pressure on','造成壓力'],['local businesses','local shops','本地企業'],['traditions','ways of life','傳統'],['advantages are greater overall','good points are greater','整體利大於弊'],['wider opportunities','more chances','更廣機會'],['closer cooperation','work together more closely','更緊密合作']),
 v(['major disadvantage','big problem','主要缺點'],['globalisation','closer links between countries','全球化'],['weaken local economies','hurt local businesses','削弱本地經濟']),
 v(['international companies','companies from other countries','國際企業'],['small businesses','small local shops','小企業'],['struggle to survive','find it hard to stay open','難以生存'],['advertising power','strong adverts','廣告能力'],['supply networks','ways of getting goods','供應網絡'],['global brands','large brands','全球品牌']),
 v(['For example','For example','例如'],['family-owned clothes shop','clothes shop run by a family','家庭服裝店'],['lose customers','lose buyers','流失顧客'],['large foreign retailer','big shop from another country','大型外國零售商'],['lower prices','for less','較低價格']),
 v(['reduce local employment','fewer local jobs','減少本地就業'],['communities','town','社區'],['dependent on outside corporations','rely more on companies from outside','依賴外來企業']),
 v(['Another drawback','Another problem','另一缺點'],['cultural dilution','local ways of life may become less visible','文化淡化']),
 v(['young people everywhere','young people everywhere','各地年輕人'],['fashion trends','clothes fashions','時尚潮流'],['local customs','local ways of doing things','本地習俗'],['fade into the background','become less noticed','退居次要']),
 v(['In this sense','In this way','從這意義上'],['garden of different flowers','full of different cultures','多元文化花園比喻'],['one repeated pattern','the same thing repeated','重複圖案']),
 v(['However','But','然而'],['benefits','good points','好處'],['more significant','matter more','更重要']),
 v(['Globalisation','Closer links between countries','全球化'],['move across borders','go from one country to another','跨國流動'],['living standards','live better','生活水平'],['goods, knowledge and services','goods, knowledge and services','商品知識服務']),
 v(['For instance','For example','例如'],['developing country','less wealthy country','發展中國家'],['gain access to','get','取得'],['imported medical equipment','medical machines from abroad','進口醫療設備'],['poorer regions','poorer areas','較貧困地區'],['online courses','online classes','網上課程'],['overseas universities','universities in other countries','海外大學']),
 v(['exchanges','connections','交流'],['not merely commercial','not only about buying and selling','不只是商業'],['open doors','create chances','打開機會'],['otherwise remain closed','otherwise not have','原本沒有']),
 v(['Globalisation','Countries being more connected','全球化'],['creates opportunities','gives workers and businesses more chances','創造機會'],['workers and businesses','workers and businesses','工人與企業']),
 v(['software company','company that makes computer programs','軟件公司'],['clients abroad','customers in other countries','海外客戶'],['instead of depending only','instead of only selling','不只依賴'],['local market','nearby','本地市場']),
 v(['At the same time','At the same time','同時'],['contact between cultures','meeting people from other cultures','文化接觸'],['open-minded','listen to different views','更開明'],['different backgrounds','other backgrounds','不同背景']),
 v(['In conclusion','To sum up','總結'],['does have disadvantages','do have bad points','確有缺點'],['local businesses','local shops','本地企業'],['cultural traditions','ways of life','文化傳統']),
 v(['Nevertheless','Even so','儘管如此'],['firmly believe','think','堅信'],['positive overall','good overall','整體正面'],['spreads opportunity','bring chances','傳播機會'],['cooperation','working together','合作'],['closed world','countries acting alone','封閉世界']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Globalisation has become a defining feature of modern life, influencing how people shop, study and communicate.',d:[1,9,16],relation:'引言先說全球化影響貿易、工作、旅行與文化',formula:'Globalisation has become a defining feature of modern life, influencing how people [生活面向]',meaning:'全球化成為影響多種生活活動的重要特徵。',usage:'背景句先定範圍，後文才比較具體利弊。',links:['Globalisation has become a defining feature of modern life, influencing how people ','.'],labels:['受影響生活面向']},
 {example:'Although it can place pressure on local businesses and traditions, I believe its advantages are greater overall because it expands education and cross-border cooperation.',d:[0,9,16],relation:'以 Although 承認本地壓力，再用 because 說較重好處',formula:'Although it can place pressure on local businesses and traditions, I believe its advantages are greater overall because [更大好處]',meaning:'作者承認本地企業與文化風險，但認為機會與合作更重。',usage:'立場需由後文對市場、知識和文化交流的具體證據支持。',links:['Although it can place pressure on local businesses and traditions, I believe its advantages are greater overall because ','.'],labels:['更大好處']},
 {example:'One major disadvantage is that globalisation can weaken family-run shops.',d:[1,6,9],relation:'第一缺點是對本地經濟及小企業的壓力',formula:'One major disadvantage is that globalisation can weaken [本地對象]',meaning:'國際企業競爭可能削弱本地小企業。',usage:'下一句須說價格、廣告與供應鏈的競爭機制。',links:['One major disadvantage is that globalisation can weaken ','.'],labels:['本地對象']},
 {example:'When international companies enter a country, small businesses may struggle to survive because they cannot match the prices and supply networks of global brands.',d:[2,7,10],relation:'以 When 和 because 解釋小企業面對跨國品牌競爭的機制',formula:'When international companies enter a country, small businesses may struggle to survive because they cannot match [大型品牌優勢]',meaning:'小企業或難匹敵國際品牌的價格、宣傳與供應網絡。',usage:'may 表可能，不要說所有外國企業進入都令本地商戶關門。',links:['When international companies enter a country, small businesses may struggle to survive because they cannot match ','.'],labels:['大型品牌優勢']},
 {example:'For example, a family-owned clothes shop may lose customers when a foreign chain opens nearby with lower prices.',d:[3,7,10],relation:'以家庭服裝店與外國零售商的價格競爭落實小企風險',formula:'For example, a family-owned clothes shop may lose customers when [競爭者及條件]',meaning:'大型外國店較低售價可能令家庭小店失客。',usage:'例子說可能風險，不是所有本地店必定失敗。',links:['For example, a family-owned clothes shop may lose customers when ','.'],labels:['競爭者及條件']},
 {example:'This can reduce local employment and make communities dependent on a few large outside firms.',d:[3,7,10],relation:'This 回指小企業失客，推到本地工作與依賴風險',formula:'This can reduce [本地結果] and make communities dependent on [外部企業]',meaning:'小企受壓可能減少本地工作並增加對外來公司的依賴。',usage:'This 要有前句競爭例子作先行原因。',links:['This can reduce ', ' and make communities dependent on ','.'],labels:['本地工作','外部依賴']},
 {example:'Another drawback is loss of local variety.',d:[2,9,13],relation:'第二缺點從經濟轉到文化淡化',formula:'Another drawback is [文化風險]',meaning:'相同媒體、食物與時尚可能讓本地習俗較不顯眼。',usage:'短句後面要用文化消費例子說明。',links:['Another drawback is ','.'],labels:['文化風險']},
 {example:'If young people everywhere watch the same films, eat the same fast food and follow the same fashion trends, local stories may slowly fade into the background.',d:[3,6,10],relation:'以 If 列共同消費內容，再推到本地習俗逐漸淡化',formula:'If young people everywhere watch the same films, eat the same fast food and follow the same fashion trends, [本地文化] may slowly fade into the background',meaning:'全球相似的電影、食物與衣著潮流可能使本地習俗退到次要。',usage:'may slowly 表漸進可能變化，不可說文化已完全消失。',links:['If young people everywhere watch the same films, eat the same fast food and follow the same fashion trends, ', ' may slowly fade into the background.'],labels:['本地文化']},
 {example:'In this sense, standardised media can sometimes make the world feel less like a colourful library and more like one repeated pattern.',d:[3,6,10],relation:'用花園與重複圖案比喻文化多樣性減少',formula:'In this sense, [全球現象] can sometimes make the world feel less like [多樣圖像] and more like [單一圖像]',meaning:'「不同花朵」比喻文化多樣，「重複圖案」比喻相似化。',usage:'這是比喻，不是字面說世界真的變成花園或圖案。',links:['In this sense, ', ' can sometimes make the world feel less like ', ' and more like ','.'],labels:['全球現象','多樣圖像','單一圖像']},
 {example:'However, the wider benefits are more significant.',d:[2,6,13],relation:'轉折明確宣告作者認為好處較重',formula:'However, [跨國好處] are more significant',meaning:'作者認為跨國機會與合作較本地風險重要。',usage:'短句須由後面的醫療、教育、市場和文化交流例子支援。',links:['However, ', ' are more significant.'],labels:['跨國好處']},
 {example:'Globalisation allows goods, knowledge and services to move across borders, which can improve access to education and healthcare.',d:[3,7,13],relation:'以 which 連跨國流動與生活水平可能改善',formula:'Globalisation allows [可流動資源] to move across borders, which can improve [生活結果]',meaning:'商品、知識與服務跨境流動可帶來更好生活機會。',usage:'can 是可能結果，接下來須有醫療設備與網上課程的例子。',links:['Globalisation allows ', ' to move across borders, which can improve ','.'],labels:['可流動資源','生活結果']},
 {example:'For instance, a hospital in a developing country may gain access to specialist equipment, while students in poorer regions can use online lessons from overseas.',d:[3,7,13],relation:'以 while 並列醫療設備與海外課程兩種跨境知識服務',formula:'For instance, a hospital in a developing country may gain access to [醫療資源], while students in poorer regions can use [教育資源]',meaning:'醫院可獲進口設備，學生可使用海外大學網課。',usage:'may/can 保留可及性可能性；不說每間醫院或每名學生都有。',links:['For instance, a hospital in a developing country may gain access to ', ', while students in poorer regions can use ','.'],labels:['醫療資源','教育資源']},
 {example:'These exchanges are not merely commercial; they can open doors to education and care that would otherwise remain closed.',d:[3,7,10],relation:'分號指出跨境交流不只商業，也可打開原本欠缺的機會',formula:'These exchanges are not merely commercial; they can open doors [新機會]',meaning:'知識與服務交流可讓人取得原本較難得到的機會。',usage:'These exchanges 回指前句醫療及教育例子。',links:['These exchanges are not merely commercial; they can open doors ','.'],labels:['新機會']},
 {example:'Globalisation also creates opportunities for small firms and graduates.',d:[3,7,10],relation:'再提出員工及企業的跨境市場機會',formula:'Globalisation also creates opportunities for [受益群體]',meaning:'全球化亦可為工作者及企業打開市場。',usage:'下一句用小型軟件公司跨國銷售具體化。',links:['Globalisation also creates opportunities for ','.'],labels:['受益群體']},
 {example:'A small software company, for example, can sell its services to clients overseas instead of depending only on buyers nearby.',d:[3,7,10],relation:'以小型軟件公司出口服務說明不只依賴本地市場',formula:'A small software company, for example, can sell its services to [海外客戶] instead of depending only on [本地市場]',meaning:'小公司可向海外客戶銷售，減少只靠本地客源。',usage:'can 表可行機會，不保證每家公司都能成功出口。',links:['A small software company, for example, can sell its services to ', ' instead of depending only on ','.'],labels:['海外客戶','原有市場']},
 {example:'At the same time, contact between cultures can make people more curious, especially when they study or work with those from different backgrounds.',d:[3,7,10],relation:'補充跨文化接觸可能促進開放態度',formula:'At the same time, contact between cultures can make people [態度變化], especially when they [互動方式] with those from different backgrounds',meaning:'不同文化人士一起工作、學習或交流，可能使人更開明。',usage:'can/especially 說條件和可能性，非保證接觸必然消除偏見。',links:['At the same time, contact between cultures can make people ', ', especially when they ', ' with those from different backgrounds.'],labels:['態度變化','互動方式']},
 {example:'In conclusion, globalisation does have disadvantages, particularly for local shops and cultural practices.',d:[2,9,13],relation:'結論承認本地企業與傳統的兩種弊端',formula:'In conclusion, globalisation does have disadvantages, particularly for [受影響群體及文化]',meaning:'作者不否認本地小企和文化傳統受壓。',usage:'does have 加強承認，不應把整體正面立場寫成沒有缺點。',links:['In conclusion, globalisation does have disadvantages, particularly for ','.'],labels:['受影響對象']},
 {example:'Nevertheless, I firmly believe it is positive overall because it spreads opportunity and knowledge far more widely than a closed world ever could.',d:[2,9,13],relation:'Nevertheless 在承認缺點後重申整體正面與機會知識合作理由',formula:'Nevertheless, I firmly believe it is positive overall because it spreads [核心收益] far more widely than [封閉比較] ever could',meaning:'作者認為開放世界更能廣泛傳播機會、知識與合作。',usage:'比較的是跨國交流對封閉世界的相對機會，不是說開放沒有代價。',links:['Nevertheless, I firmly believe it is positive overall because it spreads ', ' far more widely than ', ' ever could.'],labels:['核心收益','封閉比較']},
];
const usageGuides=[
 '當你要先界定一種現象，並列出它影響的幾個生活範圍，再開始評價利弊時。',
 '當你要承認反方代價，接着表明比較後的立場及主要理由時。',
 '當你要用主題句點出第一項缺點，讓後句解釋受影響對象與機制時。',
 '當你要交代某條件出現後，某群體為何可能難以應付競爭或變化時。',
 '當你要把一般風險放進一個具體、可想像的例子時。',
 '當你要用 This 回指上一個例子，再推出第二層後果時。',
 '當你要從第一項缺點轉入性質不同的第二項缺點時。',
 '當你要用 If 指出一組做法可能逐漸造成甚麼結果，而結果並非必然時。',
 '當抽象變化難以想像，你要用兩幅對照圖像作比喻時；須讓讀者知道它是比喻。',
 '當你已交代缺點，要轉向好處並說明作者認為好處較重要時。',
 '當你要說某種資源越過原有界線，並用 which 補上它可能帶來的生活結果時。',
 '當你要用兩個不同領域的例子，並以 while 並列其受益方式時。',
 '當你要指出一種交流不只限於表面用途，還能帶來更深層的機會時。',
 '當你要用短主題句提出新的受益群體，並準備用例子展開時。',
 '當你要用 instead of 對比新的服務對象與原本只依賴的市場時。',
 '當你要指出接觸或互動在甚麼條件下可能改變態度時。',
 '當你在結論先明確承認仍存在的缺點，並點出受影響對象時。',
 '當你已承認缺點，最後用 Nevertheless 說清整體立場與較重理由時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把本地企業、文化風險與跨境機會分開排序。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文評估哪一種跨國現象？',['全球化對經濟與文化的利弊','只討論衣服款式','只比較兩所大學的課程','只討論醫院設備價格'],'Globalisation 是中心。'),
 {type:'multi',prompt:'範文承認的兩項主要本地風險是甚麼？',detail:'選兩項，再按「確認」。',options:['小企業可能難與跨國品牌競爭','本地習俗可能被相似的全球潮流淡化','所有本地人必然停止工作','任何外來商品都不能使用'],correct:[0,1],why:'本地經濟與文化淡化分別是兩段缺點。'},
];
const route=[sequence('依範文還原全球化權衡',[
 ['背景與立場','全球化影響貿易工作旅行文化；作者承認本地風險但整體支持。'],
 ['本地企業','跨國品牌價格、宣傳與供應網絡令小企承壓，工作可能減少。'],
 ['本地文化','相似電影、快餐和時尚可能使地方習俗較不顯眼。'],
 ['跨境資源','醫療設備與海外課程等商品、知識和服務可流動。'],
 ['市場與人際','小企業可接海外客戶，跨文化接觸或使人更開明；結論判好處較重。'],
 ],'範文先分析損失，再提出跨國機會，最後才給權重判斷。')];
const evidence=[
 quiz('小企業面對全球品牌時可能缺乏哪幾種能力？',['價格競爭力、廣告力量及供應網絡','只有店舖招牌的字體','只有員工制服顏色','只有店內音樂種類'],'原文列三種具體競爭差距。'),
 quiz('「不同花朵的花園」比喻甚麼？',['各地文化的多樣性','世界上花店的數量','全球氣候變化','所有國家必須種同一種花'],'此句是文化多樣性比喻。'),
 quiz('跨境交流如何可能改善生活？',['商品、知識與服務流動，帶來醫療設備及海外網課等機會','每位病人必然即時得到所有設備','每所海外大學都免費招生','全球化只會影響旅遊而不影響教育'],'兩個例子落實醫療及教育用途。'),
 quiz('小型軟件公司例子支持甚麼？',['可向海外客戶售服務，毋須只依賴本地市場','本地市場必然完全消失','所有軟件公司都必然出口成功','跨國銷售完全不需任何客戶'],'can 是可能機會。'),
 quiz('作者的最終立場如何表達？',['承認本地企業與文化風險，但認為機會、知識與合作的傳播更重','全球化完全沒有任何缺點','只要有本地風險便絕不能交流','所有跨國企業都必然有益'],'Nevertheless 回顧缺點後作正面權衡。'),
];
const logic=[
 sequence('本地經濟與文化的兩條風險',[
 ['跨國競爭','大型品牌可能以價格、宣傳及供應鏈壓迫小店。'],
 ['經濟後果','本地顧客與工作或流失，社區可能更依賴外企。'],
 ['相似消費','電影、食物和時尚在多地趨向相同。'],
 ['文化後果','本地習俗可能較不顯眼，多樣性減少。'],
 ],'企業競爭與文化淡化是兩種不同機制。'),
 sequence('跨國機會與最後權衡',[
 ['資源流動','商品、知識與服務跨境流通。'],
 ['生活用途','醫療設備和網上課程可讓人取得原本欠缺的機會。'],
 ['市場工作','小企業可接海外客戶，不只靠本地市場。'],
 ['社會交流','與不同背景的人工作學習可能促進開放態度。'],
 ],'作者在承認本地風險後，認為這些跨境好處更重要。'),
];
const transfers=[
 transfer('一家本地衣店旁開了大型跨國連鎖店，後者售價較低。','哪句準確轉用本地商店風險？',['本地小店可能流失顧客，若長期受壓，本地工作亦可能減少。','跨國店一開，所有本地商店必然即日倒閉。','售價較低便保證本地就業增加。','兩店價格差異與顧客選擇毫無關係。'],['價格競爭→失客→可能影響工作。','過度保證。','未必。','可能影響。'],[3,4,5],'原文 family clothes shop lost customers→local employment risk。'),
 transfer('年輕人觀看全球相同的影片，也想保留本地節日。','哪句合適描述文化風險？',['相似媒體潮流可能令地方習俗較不顯眼，因此仍需留意文化傳承。','看同一影片便保證所有地方節日立即消失。','本地習俗與文化內容完全無關。','所有全球影片都一定沒有價值。'],['may slowly fade，保留可能性。','過度斷言。','習俗是文化一部分。','未全盤否定外來內容。'],[7,8],'原文 same films/fast food/fashion→local customs fade。'),
 transfer('發展中地區的醫院取得海外製造的設備。','哪句說明跨境流動帶來的可能好處？',['跨國商品流動可能使醫院取得原本較難獲得的醫療資源。','所有醫院都因此自動達到同樣水平。','外來設備一律不能用於治療。','設備流動與生活品質完全沒有關係。'],['來源與用途清楚，保留可能性。','無同等保證。','與例子相反。','可影響。'],[10,11,12],'原文 hospital gain imported medical equipment。'),
 transfer('偏遠地區學生可使用海外大學製作的網上課。','哪句對應範文的知識流動論證？',['跨境課程可能打開當地原本較少的學習機會。','有網課便證明當地學校完全無用。','每名學生必然立即考入海外大學。','網上課程絕對不能傳遞知識。'],['知識跨境→新學習機會。','無需否定本地學校。','無錄取保證。','與原文相反。'],[10,11,12],'原文 poorer-region students can use overseas online courses。'),
 transfer('一間小型軟件公司開始向海外客戶售服務。','哪句準確說明其市場變化？',['客源不再只限本地，公司可能得到更多業務機會。','海外市場一開，本地客戶便必須全部消失。','每個海外客戶都必然購買。','跨境銷售令產品不再需要任何服務。'],['跨境市場增加可能機會。','不必失去本地市場。','無成交保證。','仍售服務。'],[13,14],'原文 sell services abroad instead of depending only on local market。'),
 transfer('跨國團隊有成員來自不同文化。','哪句合理延伸範文的人際好處？',['共同工作與交流可能令成員更願意理解不同觀點。','只要同一辦公室，所有偏見便永遠消失。','文化差異必然阻止任何合作。','跨文化交流只影響購物，不影響工作。'],['can/especially when 保留可能與互動條件。','無此保證。','過度否定。','原文談工作學習。'],[15],'原文 contact between cultures can encourage open-mindedness。'),
 transfer('作文需承認全球化的本地代價。','哪句同時點出企業與文化兩方面？',['跨國品牌可能壓迫本地小店，相似的全球潮流亦可能淡化地方習俗。','全球化只涉及衣服，與工作無關。','只要外來商品便宜，文化便必然更強。','本地企業與文化完全不受全球化影響。'],['兩條缺點分開且有條件。','範圍太窄。','無此因果。','與正文相反。'],[2,6,7],'原文 local economies 與 cultural dilution。'),
 transfer('有人說「跨國交流只為賣貨」。','哪句依範文修正？',['交流也可帶來醫療設備、海外課程和不同背景人士的合作。','所有跨境活動都完全沒有商業目的。','醫療和教育永遠不能跨境。','只要有商業活動，知識交流便不可能存在。'],['not merely commercial，列非商業機會。','不是排除商業。','與例子相反。','兩者可並存。'],[11,12,15],'原文 exchanges not merely commercial; open doors。'),
 transfer('一篇作文主張全球化整體利大於弊。','哪句在結尾保持權衡？',['雖然小企業及地方文化可能承壓，跨境機會、知識與合作仍被作者看得更重。','既然整體支持，便不用提任何本地代價。','既有本地代價，就不能承認任何跨境好處。','只用一個軟件公司例子便能證明每國完全受益。'],['承認缺點再給權重理由。','缺少比較。','抹掉好處。','單例不能普遍化。'],[1,16,17],'原文 Nevertheless I firmly believe positive overall because spreads opportunity/knowledge/cooperation。'),
 transfer('另一題評估跨國食品連鎖店進入本地市場。','哪句正確轉移本文的分析框架？',['既看本地小店的價格競爭，也看跨境資源與就業機會，並評估地方飲食文化。','這與全球化作文完全相同，結論必然正面。','只要食物便宜，本地文化便不重要。','只討論店舖裝修顏色即可。'],['跨題使用經濟、機會與文化三維度。','情境不保證同結論。','文化仍要考慮。','無關。'],[3,6,10,13],'原文 local business/culture risks and wider opportunity benefits。'),
];
export default {key:'advantage-disadvantage:19',meta:{topic:'全球化的本地壓力與跨境機會',summary:'範文承認跨國品牌可能壓迫本地小店，相似的全球潮流也可能淡化習俗；作者認為跨境醫療設備、網上課程、海外客戶和文化合作帶來的機會更大。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
