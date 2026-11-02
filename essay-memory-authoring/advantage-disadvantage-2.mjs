// Online shopping: advantages and disadvantages for individuals and companies.
// One reviewed simple sentence and frame per canonical sentence.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-2-ielts-advantage-disadvantage.js',import.meta.url),'utf8'),sourceContext);
const original=sourceContext.window.ESSAY_MEMORY_LESSONS['advantage-disadvantage:2'].sentences.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many countries, buying things on websites and apps is now normal in daily life.',
 'Shopping online helps customers and businesses in clear ways, especially by saving time and work, but it also causes problems.',
 'Overall, I think online shopping is good because its benefits are greater than its problems for both people and businesses.',
 'The main benefit of shopping online is that it saves time and work.',
 'For customers, shopping websites let people check prices, see what buyers say, and buy things quickly. This saves time and work.',
 'A busy parent can buy food or school things during lunch and have them brought home instead of going to several shops.',
 'This is very useful for people who are busy or live far from shops.',
 'Businesses gain a lot too.',
 'When businesses sell online, they can pay less for shops and staff and sell to more people.',
 'For example, a small bookshop can sell across the country through a website instead of relying only on people who pass its local shop.',
 'So online selling helps customers buy things more easily and helps businesses work at lower cost.',
 'But online shopping also has real problems.',
 'Customers cannot touch or try products before buying them. They often depend on pictures and words, which may give a false idea.',
 'People may be unhappy when a product arrives in the wrong size, is poor quality, or looks different from the advert.',
 'For example, a person who buys clothes or furniture online may have to send it back when it does not meet their needs.',
 'For businesses, online selling has many rivals and can go wrong easily.',
 'Because customers can check many sellers at once, businesses may have to lower prices and earn less profit on each sale.',
 'Also, one failed delivery, stolen customer data, or bad review shared widely can quickly harm a business’s good name.',
 'So online selling is quick and can reach many people, but it also brings serious problems for buyers and businesses.',
 'To sum up, shopping online has problems, especially uncertainty about products for customers and strong price pressure for businesses.',
 'Still, it saves people time and helps businesses spend less and reach more buyers, so the benefits are clearly greater than the problems.',
];
const vocabulary=[
 v(['purchasing goods through digital platforms','buying things on websites and apps','透過網站和應用程式買東西'],['part of everyday life','normal in daily life','日常生活一部分']),
 v(['clear benefits','helps','明顯好處'],['consumers','customers','消費者'],['convenience and efficiency','saving time and work','方便與效率'],['notable drawbacks','problems','明顯弊端']),
 v(['positive trend','good','正面趨勢'],['advantages are more significant','benefits are greater','好處較重要'],['individuals and companies','people and businesses','個人與企業']),
 v(['principal advantage','main benefit','主要好處'],['efficiency','saves time and work','效率']),
 v(['individuals','customers','個人消費者'],['online marketplaces','shopping websites','網上購物平台'],['compare prices','check prices','比較價格'],['read reviews','see what buyers say','閱讀評價'],['within minutes','quickly','幾分鐘內完成']),
 v(['Instead of travelling from one shop to another','instead of going to several shops','不用逐間店走'],['busy parent','busy parent','忙碌的家長'],['groceries or school supplies','food or school things','食品或學校用品'],['delivered directly home','brought home','直接送到家']),
 v(['especially valuable','very useful','特別有用'],['demanding schedules','busy','日程繁忙'],['limited access to physical stores','live far from shops','難到實體店']),
 v(['Companies','Businesses','企業'],['benefit substantially','gain a lot','獲益不少']),
 v(['By selling online','When businesses sell online','透過網售'],['reduce costs','pay less','降低成本'],['rent, shop maintenance, and in-store staff','shops and staff','租金、店舖與店員成本'],['much wider customer base','more people','更廣客群']),
 v(['small independent bookshop','small bookshop','獨立小書店'],['for instance','For example','例如'],['move beyond relying on local foot traffic','instead of relying only on people who pass its local shop','不再只靠路過店舖的顧客'],['buyers across the country','across the country','全國買家']),
 v(['As a result','So','因此'],['online retailing','online selling','網上零售'],['increases accessibility for consumers','helps customers buy things more easily','方便消費者購物'],['improves commercial efficiency','helps businesses work at lower cost','提高企業效率']),
 v(['However','But','然而'],['clear disadvantages','real problems','明顯缺點']),
 v(['inability to inspect products physically','cannot touch or try products','不能實際檢查商品'],['purchases are often based only on pictures and descriptions','often depend on pictures and words','購買只憑圖片與描述'],['misleading','may give a false idea','可能誤導']),
 v(['lead to disappointment','may be unhappy','可能失望'],['wrong size','wrong size','尺寸不合'],['poor quality','poor quality','品質差'],['different appearance','looks different','外觀不同']),
 v(['Someone who buys clothing or furniture online','a person who buys clothes or furniture online','網購衣服或家具的人'],['inconvenient returns process','have to send it back','麻煩的退貨過程'],['does not meet expectations','does not meet their needs','不符預期']),
 v(['digital marketplace','online selling','數碼市場'],['highly competitive','many rivals','競爭激烈'],['fragile','can go wrong easily','容易受衝擊']),
 v(['dozens of sellers instantly','many sellers at once','即時比較多個賣家'],['forced into price competition','have to lower prices','被迫價格競爭'],['reduce profit margins','earn less profit on each sale','降低利潤率']),
 v(['In addition','Also','此外'],['delivery failure','failed delivery','送貨失誤'],['data breach','stolen customer data','資料外洩'],['widely shared negative review','bad review shared widely','被廣傳的負評'],['damage a company’s reputation','harm a business’s good name','損害企業聲譽']),
 v(['Therefore','So','因此'],['e-commerce','online selling','電子商貿'],['speed and reach','quick and can reach many people','速度與觸及面'],['significant risks','serious problems','重大風險']),
 v(['In conclusion','To sum up','總結'],['product uncertainty','uncertainty about products','商品不確定性'],['competitive pressure','strong price pressure','競爭壓力']),
 v(['Nevertheless','Still','儘管如此'],['greater convenience','saves people time','更方便'],['lower costs','spend less','更低成本'],['broader market access','reach more buyers','更廣市場'],['clearly outweigh','clearly greater than','明顯勝過']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){
 const text=original[i],parts=[];let cursor=0,slotIndex=0;
 for(const fixed of links){
  const at=text.indexOf(fixed,cursor);
  if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);
  if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));
  parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length;
 }
 if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));
 return {formula,meaning,usage,parts};
}
const specs=[
 {example:'In many countries, paying bills by phone has become part of everyday life.',d:[3,11,18],relation:'用時間／地點背景引入日常現象',formula:'In many countries, [活動] has become part of everyday life',meaning:'網購在多國已成日常。',usage:'引言先交代現象，不在背景句提出尚未證明的優劣判斷。',links:['In many countries, ',' has become part of everyday life.'],labels:['活動']},
 {example:'This development brings clear benefits to both consumers and businesses, particularly in terms of choice and lower prices, although it also creates several notable drawbacks.',d:[3,11,18],relation:'以 although 預告雙方受益及同時存在的缺點',formula:'This development brings clear benefits to both [兩群體], particularly in terms of [優點], although it also creates [缺點]',meaning:'網購方便且有效率，但也有缺點。',usage:'引言可預示兩面，不宜把 drawbacks 當已充分說明的結論。',links:['This development brings clear benefits to both consumers and businesses, particularly in terms of ',' although it also creates several notable drawbacks.'],labels:['兩個主要好處']},
 {example:'Overall, I believe that online learning is a positive trend because its advantages are more significant than its disadvantages for both students and schools.',d:[1,11,19],relation:'明確表達利弊權衡後的正面立場並給出原因',formula:'Overall, I believe that [趨勢] is positive because its advantages are more significant than its disadvantages for both [兩群體]',meaning:'作者認為個人和企業的好處均大於缺點。',usage:'題目問 advantages and disadvantages 時可給有根據的總判斷；全文必須真的討論兩群體各自的利弊。',links:['Overall, I believe that ',' is a positive trend because its advantages are more significant than its disadvantages for both ',' and ','.'],labels:['趨勢','第一群體','第二群體']},
 {example:'The principal advantage of online banking is the time it saves.',d:[7,11,15],relation:'先用一個簡單主題句點出本段主要優點',formula:'The principal advantage of [做法] is [核心好處]',meaning:'網購的核心優點是效率。',usage:'主題句只點核心好處，後面須解釋對個人與企業各如何發生。',links:['The principal advantage of ',' is ','.'],labels:['做法','核心好處']},
 {example:'For individuals, online payment tools allow people to pay bills, check balances, and transfer money within minutes, which saves both time and effort.',d:[3,8,12],relation:'以 which 回指整個操作流程造成的省時省力效果',formula:'For individuals, [服務] allows people to [三個操作], which saves both time and effort',meaning:'消費者可比較價格、閱讀評論並很快購買。',usage:'which 的結果應由前面整組具體操作支持，不能只放空泛好處。',links:['For individuals, ', ' allow people to ', ', which saves both time and effort.'],labels:['平台','一組便捷操作']},
 {example:'Instead of visiting several pharmacies, a busy parent, for example, can order medicines during a lunch break and have them delivered directly home.',d:[4,9,14],relation:'用 Instead of 對照舊做法與具體新做法',formula:'Instead of [費時舊做法], [人物], for example, can [較便捷行動] and have them delivered directly home',meaning:'家長午休訂雜貨或學校用品，不必逐店購買。',usage:'Instead of 連接被替代的行動；例子要有時間、人物與送達結果。',links:['Instead of ', ', a busy parent, for example, can ', ' and have them delivered directly home.'],labels:['被替代的舊做法','新購買行動']},
 {example:'This convenience is especially valuable for people who work night shifts or live far from town.',d:[3,7,11],relation:'限定便利最能幫助哪一類人',formula:'This convenience is especially valuable for [特定群體]',meaning:'日程忙或不容易到實體店的人尤其受益。',usage:'接在具體便捷例子後，說明誰受益及為甚麼。',links:['This convenience is especially valuable for ','.'],labels:['受益群體']},
 {example:'Local shops also benefit substantially.',d:[3,11,15],relation:'從個人優點短暫轉到企業優點',formula:'[另一群體] also benefit substantially',meaning:'前面說個人方便，接着轉看企業。',usage:'短過渡句要緊接企業的具體節省成本及擴大客源機制，不能當完整論證。',links:[' also benefit substantially.'],labels:['另一群體']},
 {example:'By selling online, businesses can reduce costs related to physical storefronts, while at the same time reaching a much wider customer base.',d:[4,12,16],relation:'以 By 說方法，再並列成本及市場兩種企業收益',formula:'By [做法], businesses can reduce [成本], while at the same time reaching [客源]',meaning:'網售可減租金、店舖維持及店員成本，又可觸及更廣客群。',usage:'成本減少與客源擴大是兩條不同機制；例子要分別支援。',links:['By selling online, businesses can reduce costs related to ', ', while at the same time reaching a much wider customer base.'],labels:['可節省的成本']},
 {example:'A small independent stationery shop, for instance, can move beyond relying on local foot traffic and sell to buyers across the country through a website or online marketplace.',d:[5,8,14],relation:'以小店例子展示由本地路過客擴展到全國客源',formula:'A small independent [店種], for instance, can move beyond relying on local foot traffic and sell to buyers across the country through [渠道]',meaning:'獨立書店可透過網站或平台把產品賣到全國。',usage:'例子應證明上一句的 wider customer base，不需假設每家小店必然成功。',links:['A small independent ', ', for instance, can move beyond relying on local foot traffic and sell to buyers across the country through a website or online marketplace.'],labels:['店種']},
 {example:'As a result, digital booking increases accessibility for travelers and improves commercial efficiency for hotels.',d:[6,12,18],relation:'把前面個人與企業的機制綜合成雙方結果',formula:'As a result, [做法] increases accessibility for [受益者] and improves commercial efficiency for [企業]',meaning:'網售讓消費者易於買東西，企業運作更有效率。',usage:'總結結果要對得上前文個人便利和企業成本／市場機制。',links:['As a result, ', ' increases accessibility for ', ' and improves commercial efficiency for ','.'],labels:['做法','消費者','企業']},
 {example:'However, remote work also has clear disadvantages.',d:[3,7,15],relation:'用 However 清楚轉入不利面',formula:'However, [做法] also has clear disadvantages',meaning:'第二個主體段開始討論網購缺點。',usage:'短轉折句後要逐一展示個人與企業的實際問題。',links:['However, ',' also has clear disadvantages.'],labels:['做法']},
 {example:'For individuals, the inability to visit a property means that decisions are often based only on photos and descriptions, which can be misleading.',d:[4,8,16],relation:'用 means that 解釋無法檢查所致的資訊不足，再用 which 指潛在誤導',formula:'For individuals, the inability to [親自檢查] means that [決定] are based only on [間接資訊], which can be misleading',meaning:'不能親看商品，消費者只能憑圖片和描述購買，可能受誤導。',usage:'which can be misleading 指前述圖片和描述所形成的判斷，不能說所有網上描述必然虛假。',links:['For individuals, the inability to ', ' means that ', ' are often based only on ', ', which can be misleading.'],labels:['不能親做的事','購買決定','間接資料']},
 {example:'This can lead to disappointment when a hotel room is smaller, noisier, or less clean than advertised.',d:[5,12,17],relation:'把資訊不足具體化為收貨後可觀察的失望',formula:'This can lead to disappointment when [收到的結果] differs from [預期]',meaning:'商品可能尺碼不合、品質差或外觀與廣告不同。',usage:'This 回指上句無法親看而依賴描述的風險；例子要可觀察而非臆測。',links:['This can lead to disappointment when ','.'],labels:['不符合預期的具體情況']},
 {example:'Someone who buys a second-hand laptop online, for example, may have to go through an inconvenient returns process after discovering that the battery no longer works.',d:[5,9,17],relation:'用具體人物和退貨後果延伸個人缺點',formula:'Someone who buys [商品] online, for example, may have to go through [麻煩步驟] after discovering that [缺陷]',meaning:'網購衣服或家具不符預期時，退貨程序麻煩。',usage:'例子要有商品、發現的問題和所需處理，避免只重複「可能失望」。',links:['Someone who buys ', ' online, for example, may have to go through ', ' after discovering that ','.'],labels:['商品','退貨程序','發現的問題']},
 {example:'For companies, the international delivery market is highly competitive and fragile.',d:[7,11,12],relation:'把缺點段的焦點由消費者轉至企業',formula:'For companies, [市場] is highly competitive and fragile',meaning:'網上市場競爭激烈，企業容易受到衝擊。',usage:'競爭和脆弱是本段主題，下一句須交代價格壓力與聲譽風險。',links:['For companies, ',' is highly competitive and fragile.'],labels:['市場']},
 {example:'Because shoppers can compare many prices instantly, businesses are forced into price competition that can reduce profit margins.',d:[8,12,18],relation:'用 Because 建立即時比較→價格競爭→利潤率下降的因果鏈',formula:'Because [消費者可做的事], businesses are forced into price competition that can reduce profit margins',meaning:'顧客可立刻比較多家賣家，企業可能被迫壓價而利潤率下降。',usage:'說 can reduce，保留可能性；不是每間企業都已經虧損。',links:['Because ', ', businesses are forced into price competition that can reduce profit margins.'],labels:['引起價格壓力的條件']},
 {example:'In addition, one failed delivery or widely shared complaint can rapidly damage a company’s reputation.',d:[9,13,16],relation:'補充價格競爭以外的聲譽風險',formula:'In addition, [單一事故] can rapidly damage a company’s reputation',meaning:'送貨失誤、資料外洩、廣傳負評都可能迅速損害商譽。',usage:'In addition 增加另一條風險；can 表示可能而非必然。',links:['In addition, ', ' can rapidly damage a company’s reputation.'],labels:['單一事故或風險']},
 {example:'Therefore, while digital booking offers speed and reach, it also exposes both shoppers and firms to significant risks.',d:[10,12,20],relation:'以 while 同時收束速度／觸及面與雙方風險',formula:'Therefore, while [做法] offers [兩好處], it also exposes both shoppers and firms to significant risks',meaning:'網售快且觸及面廣，但買家與企業均有風險。',usage:'這是利弊段的局部總結，不是說優點和缺點相等。',links:['Therefore, while ', ' offers ', ', it also exposes both shoppers and firms to significant risks.'],labels:['做法','兩項好處']},
 {example:'In conclusion, remote work does present disadvantages, particularly isolation for employees and coordination problems for managers.',d:[3,11,18],relation:'總結時公平重述兩群體各一項主要弊端',formula:'In conclusion, [做法] does present disadvantages, particularly [群體甲問題] and [群體乙問題]',meaning:'個人的商品不確定性；企業的競爭壓力。',usage:'結論先準確回顧兩方缺點，再給權衡判斷。',links:['In conclusion, ', ' does present disadvantages, particularly ','.'],labels:['做法','兩群體的弊端']},
 {example:'Nevertheless, because it gives students flexible study hours and saves schools space, the advantages of online learning clearly outweigh the disadvantages.',d:[2,10,19],relation:'用 because 提供兩群體利益，支撐優點勝過缺點的最終判斷',formula:'Nevertheless, because [個人好處與企業好處], the advantages of [做法] clearly outweigh the disadvantages',meaning:'對個人更方便，對企業成本低且客源廣，所以作者判斷優點勝。',usage:'outweigh 是論證後的比較結論，不能由單一例子直接宣稱。',links:['Nevertheless, because ', ', the advantages of ', ' clearly outweigh the disadvantages.'],labels:['兩群體好處','做法']},
];
const usageGuides=[
 '當你要在引言先交代一項普遍現象，讓讀者知道討論背景時。',
 '當你要概括一項改變對不同群體的好處，再用 although 預告其缺點時。',
 '當你要在引言明確比較整體利弊，並指明判斷會涵蓋哪些群體時。',
 '當你要以 The principal advantage 開始一段，先指出最重要的好處時。',
 '當你要先列出一種做法，再以 which 說明整組做法帶來的結果時。',
 '當你要用 Instead of 對比原有做法與較有效的新做法時。',
 '當你要在一般好處之後，指出它對哪一組人特別重要時。',
 '當你要用 also 把分析轉到另一組受影響者時。',
 '當你要用 By + doing 說明某做法如何同時改變兩項結果時。',
 '當你要用一個具體例子，說明某項做法如何擴大可接觸的範圍時。',
 '當你要用 As a result 收束前述兩條機制，概括它們各自帶來的好處時。',
 '當你要用 However 從已談的好處轉到同一做法的缺點時。',
 '當你要用 the inability to 說明缺少某項條件，如何令判斷依賴較有限的資訊時。',
 '當你要用 This 回指前一句的風險，再以 when 交代風險何時變成具體後果時。',
 '當你要以一個人物的具體經歷，說明先前提到的問題會帶來甚麼麻煩時。',
 '當你要把分析從第一組人轉到另一組人，先概括新問題時。',
 '當你要用 Because 解釋一項條件如何造成競爭壓力及可能後果時。',
 '當你要用 In addition 補充另一種不同的風險，並用 can 保留可能性時。',
 '當你要用 Therefore 在段末同時概括好處與風險時。',
 '當你要在結論先回顧兩組人各自面對的缺點時。',
 '當你要用 Nevertheless 承接已承認的缺點，再以 because 支持最終利弊判斷時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先確認題目中的兩群體及利弊，再按範文論證順序排列。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('題目同時要求哪兩組對象的利與弊？',['個人與企業','只討論消費者','只討論物流公司','政府與學校'],'題目明列 both individuals and companies，且兩邊都要談優點與缺點。'),
 {type:'multi',prompt:'範文的最終立場和正文安排是甚麼？',detail:'選兩項，再按「確認」。',options:['正文先談兩群體的好處，再談兩群體的缺點','作者最後認為兩群體的好處整體勝過缺點','作者認為網購只有優點','作者只用書店例子論證所有缺點'],correct:[0,1],why:'範文完整處理雙方利弊，並給有根據的正面權衡。'},
];
const route=[sequence('依範文排四段論證路線',[
 ['引言','網購已普遍；預告個人與企業的利弊；表明優點較重。'],
 ['優點段','個人省時省力及家長例子；企業省成本擴客源及書店例子。'],
 ['缺點段','個人無法親看商品與退貨；企業壓價競爭、事故與聲譽風險。'],
 ['結論','公平回顧雙方主要弊端，再用兩群體的好處支持最終立場。'],
],'每一群體的好處和缺點都要出現；例子須支援前述機制。')];
const evidence=[
 quiz('忙碌家長午休訂雜貨的例子證明哪個主張？',['個人可節省購物時間和精力','所有商品品質都可保證','企業不再有競爭','退貨永遠免費'],'這個例子具體支援便利和效率。'),
 quiz('獨立書店透過網站賣到全國，主要證明甚麼？',['企業可突破本地路過客限制，擴大客源','所有書店一定獲利','實體店完全沒有價值','商品不可能被退貨'],'例子支援 wider customer base，而非保證結果。'),
 quiz('為何無法親看商品會帶來個人風險？',['購買可能只依賴圖片與文字，與實物有出入','網上賣家一定欺詐','每件商品都會寄錯','所有人都拒絕網購'],'原文用 can be misleading，保留可能性。'),
 quiz('顧客可即時比價，企業最直接面對甚麼？',['價格競爭，可能壓低利潤率','必然增加利潤率','完全沒有競爭','實體店租金上升'],'可比較多個賣家增加壓價壓力。'),
 quiz('結論的「outweigh」如何得到支持？',['個人便利，加上企業較低成本及更廣市場','只靠一件退貨案例','只因企業能開網站','只因作者偏好網購'],'權衡須回到兩群體已論證的主要利益及弊端。'),
];
const logic=[
 sequence('個人利與弊的因果鏈',[
  ['機制一','可比價、看評論、快速下單。'],['好處','省時省力，忙碌或難到實體店者尤其受益。'],
  ['機制二','不能親看，只能靠圖片和描述。'],['壞處','尺碼、品質或外觀不符預期，可能須退貨。'],
 ],'個人段要解釋機制，再以具體生活例子檢驗結果。'),
 sequence('企業利與弊的因果鏈',[
  ['機制一','網售減少租金、維持店面與店員成本，觸及外地客。'],['好處','獨立書店不再只靠本地路過客。'],
  ['機制二','顧客即時比價；送貨、資料或負評事故被傳開。'],['壞處','利潤率可能下滑，企業聲譽也可能受損。'],
 ],'降低成本與擴市場是兩種收益；價格與聲譽則是兩種風險。'),
];
const transfers=[
 transfer('另一題：遠距工作對員工與僱主各有何利弊？','哪個開頭同時預告兩群體及兩面？',['遠距工作可讓員工少通勤、讓僱主省空間，但也可能使合作變難。','遠距工作一定讓每位員工更快樂。','只要公司節省租金，員工就不會有缺點。','遠距工作只需要討論設備價格。'],['兩群體的好處與至少一項弊端都出現。','過度保證。','忽略員工問題。','範圍過窄。'],[1,2],'原文引言 benefits to both consumers and businesses，although drawbacks。'),
 transfer('線上銀行讓個人可快速付款，也讓銀行省櫃檯成本。','哪句用具體機制支持雙方好處？',['個人可在手機付款，銀行可減少櫃檯作業；兩邊節省時間或成本。','線上銀行很方便，因為它很方便。','只要有手機，每間銀行必然增加利潤。','銀行省成本，所以客戶一定沒有風險。'],['分開說個人操作與企業成本機制。','循環重複。','無法保證利潤。','好處不排除風險。'],[4,8,10],'原文個人 compare/read/buy，企業 reduce costs；As a result 雙方受益。'),
 transfer('外送平台讓忙碌家長下班前訂晚餐，送到家。','哪個例子真正支援「省時間」？',['家長不用逐間店尋找晚餐，可在短休息時下單並等候送達。','家長每次外送都拿到最佳品質。','外送平台從不出錯。','晚餐價格永遠低於自己煮飯。'],['舊做法與新做法形成可見時間對比。','品質未保證。','過度絕對。','價格未提供。'],[5,6],'原文 Instead of travelling shop to shop，busy parent lunch order。'),
 transfer('小型手作店開始在網上賣貨。','哪句解釋企業如何擴客源？',['原本只見到附近路過客，現在可經網站向外地買家展示商品。','因為開了網站，商品必然賣光。','手作店不需要處理任何退貨。','只要顧客變多，租金就會自動歸零。'],['先舊客源範圍，再新平台與市場範圍。','銷量無保證。','仍有售後問題。','租金不會自動消失。'],[9,10],'原文 small independent bookshop beyond local foot traffic。'),
 transfer('網購衣服只能看照片，收到後尺碼不合。','哪句把缺點串成完整因果鏈？',['買前無法試穿，只能依圖片和文字判斷，因此收到後可能要退貨。','網購衣服必定不合身。','看照片會令所有衣服品質下降。','退貨說明買家不曾閱讀描述。'],['限制→判斷風險→後果，且保留可能性。','過度絕對。','因果不成立。','無此證據。'],[12,13,14],'原文 inability to inspect→pictures/descriptions→disappointment/returns。'),
 transfer('讀者可在幾秒內比較多個保險平台的報價。','哪句指出企業可能付出的代價？',['平台可能被迫降低價格，令每筆交易的利潤率縮小。','每個平台的成本必然是零。','顧客比價會保證企業利潤上升。','平台只需增加廣告，風險便不存在。'],['即時比價→價格競爭→可能降低利潤率。','成本不會必然為零。','方向相反。','風險仍在。'],[16],'原文 compare dozens instantly→price competition→reduce margins。'),
 transfer('一個住宿預訂平台發生資料外洩，消息被廣傳。','哪句準確表達聲譽風險？',['一次資料外洩也可能迅速損害平台名聲。','資料外洩一定令所有公司立即倒閉。','資料外洩證明所有訂單已送錯。','平台若有快速服務，聲譽就不可能受損。'],['單一事件、可能性、聲譽後果清楚。','過度保證。','無關。','優點不消除風險。'],[17],'原文 one data breach or negative review can rapidly damage reputation。'),
 transfer('遠距醫療可省交通時間、擴大服務範圍，卻也有誤診與資料風險。','哪句用 while 公平收束兩面？',['遠距醫療提供速度和觸及面，同時也可能讓病人與機構承受風險。','遠距醫療有速度，所以完全沒有風險。','所有風險都只由病人承擔。','只有機構會得到好處。'],['兩種收益與兩群體風險並列。','忽略風險。','機構也可能受影響。','病人也受益。'],[18],'原文 while e-commerce offers speed and reach，also exposes shoppers and firms。'),
 transfer('寫一篇利弊作文，已分別論證個人與企業兩邊。','哪個結論先回顧弊端，再給權衡？',['兩方都可能遇到問題；但便利與較低成本等好處整體更重要。','這個議題沒有任何缺點，毋須回顧。','一個例子已足以證明所有好處必勝。','結論應加入正文未曾提過的全新數據。'],['回顧缺點後，明確但有限度地判斷。','忽略已論證弊端。','論證不足。','結論不宜引入新證據。'],[19,20],'原文 conclusion disadvantages，nevertheless advantages outweigh。'),
 transfer('線上課程讓學生安排時間，學校減少教室需求；但學生可能缺少面對面交流。','哪句有足夠根據判斷「好處較重」？',['若已分析兩方利弊，可說彈性與較低空間成本整體勝過交流限制。','只要學校省錢，學生所有缺點便消失。','未比較任何弊端也可說好處絕對勝。','某一學生喜歡上課就能代表所有人。'],['在已比較後以兩群體的核心利益支撐立場。','忽略學生弊端。','權衡需論證。','個例不足。'],[2,20],'原文 because convenience for individuals and lower costs/market access for companies，advantages outweigh。'),
];
export default {key:'advantage-disadvantage:2',meta:{topic:'網購對個人和企業的好處、缺點及權衡',summary:'個人可快速比較、購買，卻無法親看商品且可能退貨；企業能省店面成本、擴客源，卻可能陷入壓價競爭及聲譽風險。作者在充分論述兩群體後判斷優點較重。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
