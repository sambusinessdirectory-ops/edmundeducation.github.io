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
 {example:'A small independent stationery shop, for instance, can move beyond relying on local foot traffic and sell to buyers across the country through a website or online marketplace.',d:[5,8,14],relation:'以小店例子展示由本地路過客擴展到全國客源',formula:'A small independent [店種], for instance, can move beyond relying on local foot traffic and sell to buyers across the country through [渠道]',meaning:'獨立書店可透過網站或平台把產品賣到全國。',usage:'例子應證明上一句的 wider customer base，不需假設每家小店必然成功。',links:['A small independent ', ', for instance, can move beyond relying on local foot traffic and sell to buyers across the country through ','.'],labels:['店種','銷售渠道']},
 {example:'As a result, digital booking increases accessibility for travelers and improves commercial efficiency for hotels.',d:[6,12,18],relation:'把前面個人與企業的機制綜合成雙方結果',formula:'As a result, [做法] increases accessibility for [受益者] and improves commercial efficiency for [企業]',meaning:'網售讓消費者易於買東西，企業運作更有效率。',usage:'總結結果要對得上前文個人便利和企業成本／市場機制。',links:['As a result, ', ' increases accessibility for ', ' and improves commercial efficiency for ','.'],labels:['做法','消費者','企業']},
 {example:'However, remote work also has clear disadvantages.',d:[3,7,15],relation:'用 However 清楚轉入不利面',formula:'However, [做法] also has clear disadvantages',meaning:'第二個主體段開始討論網購缺點。',usage:'短轉折句後要逐一展示個人與企業的實際問題。',links:['However, ',' also has clear disadvantages.'],labels:['做法']},
 {example:'For individuals, the inability to visit a property means that decisions are often based only on photos and descriptions, which can be misleading.',d:[4,8,16],relation:'用 means that 解釋無法檢查所致的資訊不足，再用 which 指潛在誤導',formula:'For individuals, the inability to [親自檢查] means that [決定] are based only on [間接資訊], which can be misleading',meaning:'不能親看商品，消費者只能憑圖片和描述購買，可能受誤導。',usage:'which can be misleading 指前述圖片和描述所形成的判斷，不能說所有網上描述必然虛假。',links:['For individuals, the inability to ', ' means that ', ' are often based only on ', ', which can be misleading.'],labels:['不能親做的事','購買決定','間接資料']},
 {example:'This can lead to disappointment when a hotel room is smaller, noisier, or less clean than advertised.',d:[5,12,17],relation:'把資訊不足具體化為收貨後可觀察的失望',formula:'This can lead to disappointment when [收到的實物與宣傳不符]',meaning:'商品可能尺碼不合、品質差或外觀與廣告不同。',usage:'This 回指上句無法親看而依賴描述的風險；例子要可觀察而非臆測。',links:['This can lead to disappointment when ','.'],labels:['不符合預期的具體情況']},
 {example:'Someone who buys a second-hand laptop online, for example, may have to go through an inconvenient returns process after discovering that the battery no longer works.',d:[5,9,17],relation:'用具體人物和退貨後果延伸個人缺點',formula:'Someone who buys [商品] online, for example, may have to go through [麻煩步驟] after discovering that [缺陷]',meaning:'網購衣服或家具不符預期時，退貨程序麻煩。',usage:'例子要有商品、發現的問題和所需處理，避免只重複「可能失望」。',links:['Someone who buys ', ' online, for example, may have to go through ', ' after discovering that ','.'],labels:['商品','退貨程序','發現的問題']},
 {example:'For companies, the international delivery market is highly competitive and fragile.',d:[7,11,12],relation:'把缺點段的焦點由消費者轉至企業',formula:'For companies, [市場] is highly competitive and fragile',meaning:'網上市場競爭激烈，企業容易受到衝擊。',usage:'競爭和脆弱是本段主題，下一句須交代價格壓力與聲譽風險。',links:['For companies, ',' is highly competitive and fragile.'],labels:['市場']},
 {example:'Because shoppers can compare many prices instantly, businesses are forced into price competition that can reduce profit margins.',d:[8,12,18],relation:'用 Because 建立即時比較→價格競爭→利潤率下降的因果鏈',formula:'Because [消費者可做的事], businesses are forced into price competition that can reduce profit margins',meaning:'顧客可立刻比較多家賣家，企業可能被迫壓價而利潤率下降。',usage:'說 can reduce，保留可能性；不是每間企業都已經虧損。',links:['Because ', ', businesses are forced into price competition that can reduce profit margins.'],labels:['引起價格壓力的條件']},
 {example:'In addition, one failed delivery or widely shared complaint can rapidly damage a company’s reputation.',d:[9,13,16],relation:'補充價格競爭以外的聲譽風險',formula:'In addition, [單一事故] can rapidly damage a company’s reputation',meaning:'送貨失誤、資料外洩、廣傳負評都可能迅速損害商譽。',usage:'In addition 增加另一條風險；can 表示可能而非必然。',links:['In addition, ', ' can rapidly damage a company’s reputation.'],labels:['單一事故或風險']},
 {example:'Therefore, while digital booking offers speed and reach, it also exposes both shoppers and firms to significant risks.',d:[10,12,20],relation:'以 while 同時收束速度／觸及面與雙方風險',formula:'Therefore, while [做法] offers [兩好處], it also exposes both shoppers and firms to significant risks',meaning:'網售快且觸及面廣，但買家與企業均有風險。',usage:'這是利弊段的局部總結，不是說優點和缺點相等。',links:['Therefore, while ', ' offers ', ', it also exposes both shoppers and firms to significant risks.'],labels:['做法','兩項好處']},
 {example:'In conclusion, remote work does present disadvantages, particularly isolation for employees and coordination problems for managers.',d:[3,11,18],relation:'總結時公平重述兩群體各一項主要弊端',formula:'In conclusion, [做法] does present disadvantages, particularly [群體甲問題] and [群體乙問題]',meaning:'個人的商品不確定性；企業的競爭壓力。',usage:'結論先準確回顧兩方缺點，再給權衡判斷。',links:['In conclusion, ', ' does present disadvantages, particularly ', ' and ','.'],labels:['做法','第一群體的問題','第二群體的問題']},
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
 transfer('另一題：遠距工作對員工與僱主各有何利弊？','哪個開頭同時預告兩群體及兩面？',["遠距工作可省員工通勤與僱主空間，卻也可能妨礙合作", "員工通勤較少，所以僱主一定不用再管理任何團隊", "僱主省辦公室費用，便表示員工不會遇到社交困難", "遠距安排或有成本好處，因此不需要比較不同群體"],["同時預告員工、僱主和合作代價。", "省通勤不取消管理。", "僱主收益不取消員工風險。", "仍需看兩方。"],[1,2],'原文引言 benefits to both consumers and businesses，although drawbacks。'),
 transfer('線上銀行讓個人可快速付款，也讓銀行省櫃檯成本。','哪句用具體機制支持雙方好處？',["個人可手機付款，銀行少做櫃檯作業，雙方省時或省成本", "手機付款較快，便表示銀行不再需要處理任何交易", "銀行可省櫃檯成本，因此個人使用服務時絕不會有風險", "網上銀行可能便利，但客戶和機構的收益完全相同"],["對兩方分別給出具體效率機制。", "數碼付款仍需處理交易。", "成本收益不取消其他風險。", "兩方收益不同。"],[4,8,10],'原文個人 compare/read/buy，企業 reduce costs；As a result 雙方受益。'),
 transfer('外送平台讓忙碌家長下班前訂晚餐，送到家。','哪個例子真正支援「省時間」？',["家長可在短休息時下單，免逐店找晚餐並等候送達", "外送能省尋找時間，所以每份餐點品質都必然最好", "短休息可以下單，便代表送餐服務從來不會遲到", "家長不逐店找食物，因此晚餐必定比自己烹調便宜"],["指出省時發生在哪些具體步驟。", "時間收益不保證品質。", "下單便利不保證準時。", "價格不是本例的省時機制。"],[5,6],'原文 Instead of travelling shop to shop，busy parent lunch order。'),
 transfer('小型手作店開始在網上賣貨。','哪句解釋企業如何擴客源？',["網站可讓外地買家看到商品，客源不再只限路過人士", "手作店開設網站後，所有商品便可保證當天售清", "外地買家或會增加，但店舖從此不需處理任何退貨", "買家能在線下單，便代表店舖租金會自動完全消失"],["把展示範圍擴大連到潛在客源。", "曝光不保證成交。", "網售仍有售後工作。", "租金不會自動歸零。"],[9,10],'原文 small independent bookshop beyond local foot traffic。'),
 transfer('網購衣服只能看照片，收到後尺碼不合。','哪句把缺點串成完整因果鏈？',["買前不能試穿，只靠照片尺碼判斷，收到後或須退貨", "網上照片未能試穿，所以每件衣服收到後都必定不合身", "尺碼資料可供參考，便保證任何買家都不會退貨", "退貨只可能因買家不讀描述，不會受試穿限制影響"],["由無法試穿經判斷不足到可能退貨。", "風險不是必然。", "資料仍可能不足。", "忽略試穿缺失。"],[12,13,14],'原文 inability to inspect→pictures/descriptions→disappointment/returns。'),
 transfer('讀者可在幾秒內比較多個保險平台的報價。','哪句指出企業可能付出的代價？',["買家可迅速比價，平台或須降價，令每筆利潤較薄", "報價容易比較，所以各平台的營運成本便會變成零", "顧客比較價格後，所有平台都可同時提高利潤率", "平台有比價壓力，但只會改變廣告圖片而非售價"],["價格透明可加劇競爭與利潤壓力。", "比價不使成本消失。", "競爭不保證利潤升。", "售價可能受到影響。"],[16],'原文 compare dozens instantly→price competition→reduce margins。'),
 transfer('一個住宿預訂平台發生資料外洩，消息被廣傳。','哪句準確表達聲譽風險？',["一次資料外洩或被迅速傳開，損害預訂平台的信任與名聲", "資料事故發生後，只要交易方便，聲譽便不可能受損", "消息被廣泛分享，便直接證明平台所有訂單都已送錯", "平台有安全問題，便表示所有使用者都會立即停止預訂"],["指出單次事故可能迅速影響聲譽。", "方便服務不取消安全信任。", "資料外洩不等於訂單出錯。", "風險不保證人人離開。"],[17],'原文 one data breach or negative review can rapidly damage reputation。'),
 transfer('遠距醫療可省交通時間、擴大服務範圍，卻也有誤診與資料風險。','哪句用 while 公平收束兩面？',["遠距醫療可加快服務並擴大覆蓋，卻也有病人與機構風險", "遠距診症較快，所以病人和醫院都不會再遇到任何風險", "資料與誤診風險存在，便表示遠距服務不可能擴大覆蓋", "機構可降低場地需求，因此病人必定不需要面對面檢查"],["同時回顧兩方好處與兩方可能代價。", "速度不取消風險。", "風險不取消覆蓋收益。", "部分情況仍需面診。"],[18],'原文 while e-commerce offers speed and reach，also exposes shoppers and firms。'),
 transfer('寫一篇利弊作文，已分別論證個人與企業兩邊。','哪個結論先回顧弊端，再給權衡？',["兩方都可能受代價影響，便利與較低成本仍或更重要", "作者判斷好處較重，所以結論不必再提已分析的弊端", "一個客戶的成功例子，便足以代表所有企業與使用者", "只要企業成本下降，個人是否便利便不需納入權衡"],["先承認弊端，再給有根據的整體判斷。", "結論應回顧已談代價。", "個案不能代表兩方。", "仍需看個人收益。"],[19,20],'原文 conclusion disadvantages，nevertheless advantages outweigh。'),
 transfer('線上課程讓學生安排時間，學校減少教室需求；但學生可能缺少面對面交流。','哪句有足夠根據判斷「好處較重」？',["比較兩方利弊後，才判彈性與省空間較交流限制重", "學校節省教室費後，學生缺面對面互動便不再重要", "學生可安排時間，所以毋須再檢查任何學習代價", "一名學生喜歡網課，便可直接代表所有人的結果"],["判斷需建立在兩方收益與交流代價的比較上。", "學校收益不取消學生風險。", "彈性不排除代價。", "單人感受不足以代表整體。"],[2,20],'原文 because convenience for individuals and lower costs/market access for companies，advantages outweigh。'),
];
const revised=[
 {wrong:['員工可減少通勤，僱主則較易安排不同地點的會議','僱主可節省辦公室費用，卻要另訂團隊管理流程','遠距工作或有成本收益，合作困難可留待日後處理'],why:['提及兩群體，卻只列好處，未預告代價。','提及僱主的兩面，卻漏掉員工的得失。','只有整體成本與合作，未分別預告兩群體。']},
 {wrong:['個人可手機付款，銀行則把櫃檯服務改為網上辦理','銀行減少櫃檯支出，個人也能使用更多網上功能','個人和銀行都節省時間，因此可縮減部分實體櫃檯'],why:['描述數碼化，但沒有明確說明銀行如何省時或省成本。','個人的「更多功能」較籠統，未交代具體便利機制。','兩方收益被合併，沒有分別說清付款與作業。']},
 {wrong:['家長可在短休息時下單，外送餐點或有較多選擇','家長下班前訂好晚餐，價格可能比在店內購買低','家長可在下班後瀏覽餐點，再等平台送到家中'],why:['選擇較多可能有益，但沒有清楚說明省去哪段時間。','價格可能降低與「省時間」的主張不同。','下班後再瀏覽，未說明如何節省購餐時間。']},
 {wrong:['網站讓外地買家看見商品，店舖還可展示製作故事','店舖可在網上列出產品，讓原有街坊更容易回購','買家在線下單後，店舖可減少部分實體櫥窗費用'],why:['仍提及外地曝光，但把機制混入品牌故事，未突出客源擴大。','原有街坊回購未解釋如何觸及新客群。','節省櫥窗費用是成本好處，不是擴大客源的機制。']},
 {wrong:['買前可參考尺碼資料，收到後仍可能因布料而退貨','買前只能看照片，收到後發現顏色與預期不同','買前無法試穿，但可向客服查詢後再決定購買'],why:['也有購物風險，卻未把本例的試穿限制連到尺碼不合。','照片色差可導致退貨，但未回應題目所說尺碼問題。','客服或可減少風險，卻未完成收到後退貨的因果鏈。']},
 {wrong:['買家可迅速比價，平台可用服務品質維持價格','平台可比較同行報價，並調整自身的廣告策略','買家較易比較價格，平台可展示更多保險條款'],why:['提出可能對策，未指出企業在價格競爭下的代價。','廣告調整不是題目要解釋的比價代價。','條款展示可幫比較，但沒有交代平台的利潤壓力。']},
 {wrong:['資料外洩需要修復系統，也可能增加平台營運成本','平台可能暫停服務，待技術團隊找出外洩原因與漏洞','消息迅速傳開，平台需向受影響客戶發正式安全通知'],why:['成本可能上升，但沒有清楚表達信任與名聲受損。','服務中斷可能發生，但不等同題目所問聲譽風險。','通知是必要處理，尚未說明公眾信任如何受影響。']},
 {wrong:['遠距診症可省交通時間，但醫院仍須管理預約流程','遠距服務可接觸更多病人，卻需要穩定的網絡設備','病人可更快問診，但資料保護應由醫療機構另行處理'],why:['預約管理屬日常工作，未概括病人與機構風險。','只談技術條件，未公平回顧誤診和資料風險。','資料風險被拆成另行處理，沒有在收束句中權衡。']},
 {wrong:['兩方都有風險，便利值得肯定；企業成本仍待評估','個人有便利，企業可能擴客，結論只重申這些收益','兩方代價需要處理，因此暫時不作利弊整體判斷'],why:['有提風險與便利，卻未完成兩方好處的權衡。','沒有回顧已討論的弊端。','結論沒有提出題目要求的整體判斷。']},
 {wrong:['學生可彈性上課，學校省空間；交流影響留待觀察','學校可省教室，學生或有彈性，因此主要看預算','學生可安排時間，部分人較少交流；結果因人而異'],why:['列出兩面，卻未比較它們來支持「好處較重」。','只看預算，沒有衡量學生的互動代價。','承認差異，但沒有對整體利弊作有據的判斷。']}
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["This development brings clear benefits to both ","link","句型固定部分"],["consumers and businesses","slot","兩個受益群體"],[", particularly in terms of ","link","句型固定部分"],["convenience and efficiency","slot","具體好處"],[", although it also creates ","link","句型固定部分"],["several notable drawbacks","slot","承認的缺點"],[".","link","句型固定部分"]];
structures[1].frame.formula="This development brings clear benefits to both [兩個受益群體], particularly in terms of [具體好處], although it also creates [承認的缺點].";
structures[2].frame.parts=[["Overall, I believe that ","link","句型固定部分"],["online shopping","slot","待評價的趨勢"],[" is a positive trend because its advantages are more significant than its disadvantages for both ","link","句型固定部分"],["individuals and companies","slot","兩個受影響群體"],[".","link","句型固定部分"]];
structures[2].frame.formula="Overall, I believe that [待評價的趨勢] is a positive trend because its advantages are more significant than its disadvantages for both [兩個受影響群體].";
structures[5].frame.parts=[["Instead of ","link","句型固定部分"],["travelling from one shop to another","slot","被取代的費時做法"],[", ","link","句型固定部分"],["a busy parent","slot","受益者"],[", for example, can ","link","句型固定部分"],["order groceries or school supplies","slot","較便捷的行動"],[" during a lunch break and have them delivered directly home.","link","句型固定部分"]];
structures[5].frame.formula="Instead of [被取代的費時做法], [受益者], for example, can [較便捷的行動] during a lunch break and have them delivered directly home.";
structures[8].frame.parts=[["By ","link","句型固定部分"],["selling online","slot","節省成本的做法"],[", businesses can reduce costs related to ","link","句型固定部分"],["rent, shop maintenance, and in-store staff","slot","可減少的成本"],[", while at the same time reaching ","link","句型固定部分"],["a much wider customer base","slot","新增客源"],[".","link","句型固定部分"]];
structures[8].frame.formula="By [節省成本的做法], businesses can reduce costs related to [可減少的成本], while at the same time reaching [新增客源].";
export default {key:'advantage-disadvantage:2',meta:{topic:'網購對個人和企業的好處、缺點及權衡',summary:'個人可快速比較、購買，卻無法親看商品且可能退貨；企業能省店面成本、擴客源，卻可能陷入壓價競爭及聲譽風險。作者在充分論述兩群體後判斷優點較重。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
