// Full source-specific memorisation support for Discuss Both Views 7.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-7-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:7'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'How people spend or keep the money they earn strongly affects their country’s economy.',
  'Some people say buying things helps companies stay open and gives people jobs, while others say keeping money for later is better because it helps people manage money safely and put money into projects that grow later.',
  'I think buying things helps for now, but in the end a habit of keeping money for later is better for the economy.',
  'People who say we should buy things have a good reason.',
  'When people pay for goods and services, money moves between people instead of doing nothing.',
  'Places to eat, shops, companies that move people or goods and online sellers all need people who will pay for what they want or need.',
  'If buyers suddenly stopped buying, many companies would earn less, make fewer things or stop giving some workers jobs.',
  'For example, a family that often eats at restaurants, buys clothes and travels meets its own needs and also helps waiters, shop workers and drivers make enough money to live.',
  'In this way, buying things keeps money moving through the economy, like blood through a body, because it helps trade continue and keeps people willing to buy and sell.',
  'But I think keeping money for later gives the economy a bigger benefit that lasts longer.',
  'People who keep some money are better able to cope with suddenly losing a job, falling ill or paying higher prices, so they are less likely to need a lot of help from the government in hard times.',
  'Even more important, money that people keep can be used to pay for things that bring more money or value later.',
  'Banks can lend the money people put in them to companies, families can pay for education, and people can start small businesses without taking on debts they cannot safely repay.',
  'A society that uses up all its money may seem rich at first, but it can easily be harmed, like a house built on sand.',
  'By comparison, when many people keep some money, they have something to help them through trouble and money to pay for growth later.',
  'This helps the economy recover after problems, instead of just making it busy right now.',
  'To sum up, buying things matters because it gives companies buyers, workers jobs and businesses money.',
  'Even so, I strongly think keeping money for later helps a country’s economy more because it makes people safer, lowers the chance of money problems and gives future growth a stronger base.',
];
const vocabulary=[
  [['citizens','people','公民'],['income','money they earn','收入'],['major influence','strongly affects','重大影響'],['economy','economy','經濟']],
  [['consumer spending','buying things','消費支出'],['keeps businesses alive','helps companies stay open','維持企業'],['creates employment','gives people jobs','創造就業'],['saving','keeping money for later','儲蓄'],['financial stability','manage money safely','財務穩定'],['long-term investment','put money into projects that grow later','長期投資']],
  [['In my view','I think','在我看來'],['spending','buying things','消費'],['short term','for now','短期'],['culture of saving','habit of keeping money for later','儲蓄文化'],['ultimately','in the end','最終']],
  [['Those who support spending','People who say we should buy things','支持消費者'],['reasonable argument','good reason','合理論點']],
  [['goods and services','goods and services','商品與服務'],['money circulates','money moves between people','金錢流通'],['sitting idle','doing nothing','閒置']],
  [['Restaurants','Places to eat','餐廳'],['transport companies','companies that move people or goods','運輸公司'],['online businesses','online sellers','網上企業'],['depend on customers','need people','依賴顧客'],['ready to pay','will pay','願付款']],
  [['consumers','buyers','消費者'],['stopped spending','stopped buying','停止消費'],['lose revenue','earn less','失去收入'],['reduce production','make fewer things','減少生產'],['lay off staff','stop giving some workers jobs','裁員']],
  [['regularly eats out','often eats at restaurants','常外食'],['shop assistants','shop workers','店員'],['earn a living','make enough money to live','維持生計'],['satisfying its own needs','meets its own needs','滿足自身需求']],
  [['In this sense','In this way','從此意義'],['spending','buying things','消費'],['bloodstream of an economy','money moving through the economy, like blood through a body','經濟血脈'],['trade moving','trade continue','貿易流動'],['confidence alive','people willing to buy and sell','信心延續']],
  [['However','But','然而'],['saving','keeping money for later','儲蓄'],['deeper','bigger','更深層'],['sustainable','lasts longer','可持續'],['economic benefit','benefit','經濟好處']],
  [['save','keep some money','儲蓄'],['less vulnerable','better able to cope','較不脆弱'],['sudden unemployment','suddenly losing a job','突然失業'],['illness','falling ill','疾病'],['price rises','paying higher prices','物價上升'],['government support','help from the government','政府支援'],['difficult periods','hard times','困難時期']],
  [['More importantly','Even more important','更重要'],['savings','money that people keep','儲蓄'],['investment','used to pay for things that bring more money or value later','投資']],
  [['deposited money','money people put in them','存款'],['businesses','companies','企業'],['fund education','pay for education','資助教育'],['individuals','people','個人'],['small enterprises','small businesses','小企業'],['dangerous debt','debts they cannot safely repay','危險債務']],
  [['spends every dollar','uses up all its money','花光每一元'],['prosperous on the surface','seem rich at first','表面繁榮'],['fragile','easily be harmed','脆弱'],['house built on sand','house built on sand','建在沙上的房子']],
  [['By contrast','By comparison','相比之下'],['widespread saving','many people keep some money','廣泛儲蓄'],['financial cushion','something to help them through trouble','財務緩衝'],['capital','money','資本'],['future growth','growth later','未來增長']],
  [['resilient','recover after problems','有韌性'],['not merely more active','instead of just making it busy right now','不只是活躍']],
  [['In conclusion','To sum up','總結'],['consumer spending','buying things','消費支出'],['demand','buyers','需求'],['jobs','jobs','工作'],['business income','businesses money','企業收入']],
  [['Nevertheless','Even so','然而'],['firmly believe','strongly think','堅定認為'],['saving','keeping money for later','儲蓄'],['more valuable','helps a country’s economy more','更有價值'],['promotes stability','makes people safer','促進穩定'],['reduces financial risk','lowers the chance of money problems','減少財務風險'],['lays a stronger foundation','gives future growth a stronger base','奠定更穩固基礎']],
];
const chunkOverrides=[
  ['How citizens use their income','has a major influence on a country’s economy.'],
  ['While some argue that consumer spending keeps businesses alive','and creates employment, others believe that saving is more beneficial','because it strengthens financial stability','and supports long-term investment.'],
  ['In my view, although spending is useful','in the short term, a culture of saving','is ultimately better for the economy.'],
  ['Those who support spending','have a reasonable argument.'],
  ['When people buy goods and services,','money circulates rather than sitting idle.'],
  ['Restaurants, shops, transport companies and online businesses','all depend on customers','who are ready to pay for what they want or need.'],
  ['If consumers suddenly stopped spending,','many firms would lose revenue, reduce production,','or lay off staff.'],
  ['For example, a family that regularly eats out,','buys clothes and travels is not only satisfying its own needs;','it is also helping waiters, shop assistants','and drivers earn a living.'],
  ['In this sense, spending acts as the bloodstream','of an economy because it keeps trade moving','and confidence alive.'],
  ['However, I believe saving offers','a deeper and more sustainable economic benefit.'],
  ['People who save are less vulnerable','to sudden unemployment, illness or price rises,','so they are less likely to depend heavily','on government support during difficult periods.'],
  ['More importantly, savings','can become investment.'],
  ['Banks can lend deposited money to businesses,','families can fund education,','and individuals can start small enterprises','without falling into dangerous debt.'],
  ['A society that spends every dollar','may look prosperous on the surface,','but it can become fragile, like a house built on sand.'],
  ['By contrast, widespread saving creates','a financial cushion and provides the capital','needed for future growth.'],
  ['This makes the economy more resilient,','not merely more active.'],
  ['In conclusion, consumer spending is important','because it supports demand, jobs','and business income.'],
  ['Nevertheless, I firmly believe that saving','is more valuable for a nation’s economy,','as it promotes stability, reduces financial risk','and lays a stronger foundation for long-term development.'],
];
const simpleChunkOverrides=[
  ['How people spend or keep the money they earn','strongly affects their country’s economy.'],
  ['Some people say buying things helps companies stay open','and gives people jobs, while others say keeping money for later is better','because it helps people manage money safely','and put money into projects that grow later.'],
  ['I think buying things helps for now,','but in the end a habit of keeping money for later','is better for the economy.'],
  ['People who say we should buy things','have a good reason.'],
  ['When people pay for goods and services,','money moves between people instead of doing nothing.'],
  ['Places to eat, shops, companies that move people or goods','and online sellers all need people','who will pay for what they want or need.'],
  ['If buyers suddenly stopped buying,','many companies would earn less, make fewer things','or stop giving some workers jobs.'],
  ['For example, a family that often eats at restaurants,','buys clothes and travels meets its own needs','and also helps waiters, shop workers','and drivers make enough money to live.'],
  ['In this way, buying things keeps money moving through the economy,','like blood through a body, because it helps trade continue','and keeps people willing to buy and sell.'],
  ['But I think keeping money for later gives the economy','a bigger benefit that lasts longer.'],
  ['People who keep some money are better able to cope','with suddenly losing a job, falling ill or paying higher prices,','so they are less likely to need a lot of help','from the government in hard times.'],
  ['Even more important, money that people keep','can be used to pay for things that bring more money or value later.'],
  ['Banks can lend the money people put in them to companies,','families can pay for education,','and people can start small businesses','without taking on debts they cannot safely repay.'],
  ['A society that uses up all its money','may seem rich at first,','but it can easily be harmed, like a house built on sand.'],
  ['By comparison, when many people keep some money,','they have something to help them through trouble','and money to pay for growth later.'],
  ['This helps the economy recover after problems,','instead of just making it busy right now.'],
  ['To sum up, buying things matters','because it gives companies buyers, workers jobs','and businesses money.'],
  ['Even so, I strongly think keeping money for later','helps a country’s economy more','because it makes people safer, lowers the chance of money problems','and gives future growth a stronger base.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('How families use their free time has a major influence on neighbourhood life.','以 How ... has a major influence on 開題點出選擇的影響',[1,4,9],fixed(0,'How [人們使用收入] has a major influence on [國家經濟].','先說個人用錢選擇與整體經濟相連。','要開篇交代某群人的選擇如何影響更大的系統時。',['How ', ' has a major influence on '],['被觀察的個人選擇','受影響的整體'])),
  card('While some say local shopping gives people jobs, others believe saving money supports future projects.','以 While some ... others ... 公平呈現消費與儲蓄兩派',[0,2,10],fixed(1,'While some argue that [消費使企業維持並創造就業], others believe that [儲蓄更好] because it [保穩定並支援長期投資].','引言交代兩派理由，而非只列消費儲蓄名詞。','題目有兩個立場，需同時說明各自為何支持它時。',['While some argue that ', ', others believe that ', ' because it '],['第一派主張及理由','第二派主張','第二派的理由'])),
  card('In my view, although buying locally helps today, careful saving is better for a town in the long run.','以 although 讓步短期消費好處並表態長期儲蓄',[1,4,17],fixed(2,'In my view, although [消費短期有用], [儲蓄文化] is ultimately better for [經濟].','承認消費即時作用，明確選擇長期儲蓄。','兩派已介紹，要表示一方短期有利卻較支持另一方長期效果時。',['In my view, although ', ', ', ' is ultimately better for '],['先承認的短期利益','自己更支持的做法','最後衡量的整體'])),
  card('Those who support public transport have a reasonable argument.','以 Those who support ... have a reasonable argument 公平開第一派',[2,5,9],fixed(3,'Those who support [消費] have a reasonable argument.','在不同意其最終優先序下，仍公平進入消費論證。','要開始解釋自己未選的一派，而不是立即把它說成錯誤時。',['Those who support ', ' have a reasonable argument.'],['接下來公平分析的一派'])),
  card('When residents buy meals and services, money moves through local shops instead of lying unused.','以 When ... rather than ... 解釋支出如何帶動流通',[3,6,8],fixed(4,'When [人們購買商品服務], [金錢] circulates rather than [閒置].','消費把收入變成商戶收入，讓資金在經濟中流動。','要說明某行為發生後，資源如何流動而非停滯時。',['When ', ', ', ' circulates rather than '],['引發流動的行為','因此流動的資源','避免的停滯狀態'])),
  card('Cafés, stores and bus companies depend on customers who are willing to pay for what they need.','以 depend on customers 說多種商戶為何需要消費者',[4,6,7],fixed(5,'[餐廳商店運輸網店] all depend on customers who are ready to pay for [想要或需要的東西].','列多個行業，顯示消費需求與企業生存的聯繫。','已說資金流通，需列出依賴顧客付款的具體受益者時。',[' all depend on customers who are ready to pay for '],['依賴購買的多種企業','顧客願付款的商品服務'])),
  card('If residents stopped shopping, local stores would earn less, order fewer goods or cut staff.','以 If ... would ... 推演突然停消費的經濟連鎖反應',[5,7,8],fixed(6,'If [消費者突然停止消費], [公司] would [失收入、減產或裁員].','反事實推演令消費支持就業的機制更明確。','要用假設說明某種行為突然停止時，可能產生的連鎖後果。',['If ', ', ', ' would '],['假設中消失的行為','受影響的機構','可能出現的多項後果'])),
  card('For example, a family buying meals and tickets helps itself and also helps cooks and drivers earn a living.','以 not only ...; it is also ... 表達消費私人與公共雙重作用',[5,6,8],fixed(7,'For example, [家庭外食購物旅遊] is not only [滿足自身需要]; it is also [助服務業員工維持生計].','同一筆消費既滿足家庭，也成為他人的工資。','要用生活例子指出一個行為同時有私人和外部效果時。',['For example, ', ' is not only ', '; it is also '],['做出行為的人及行為','直接的私人好處','對其他人的作用'])),
  card('In this sense, local spending acts as a town’s bloodstream because it keeps shops and jobs alive.','以 bloodstream 比喻概括消費對流通的作用',[4,7,9],fixed(8,'In this sense, [消費] acts as [經濟血脈] because it keeps [貿易] moving and [信心] alive.','消費段由付款、企業、就業升到流通和信心的總結。','已列幾項具體效果，需用比喻把它們整合成一項系統作用時。',['In this sense, ', ' acts as ', ' because it keeps ', ' moving and ', ' alive.'],['推動整體的行為','協助理解的比喻','持續流動的活動','得以維持的信心'])),
  card('However, I believe saving offers a longer-lasting benefit to a local community.','以 However 轉入作者較支持的長期利益',[3,8,10],fixed(9,'However, I believe [儲蓄] offers [更深更持久的經濟好處].','第二主體段由即時流通轉向穩定和長期資本。','已公平分析一派，需轉入自己較支持的一派並說明比較角度時。',['However, I believe ', ' offers '],['較支持的做法','相對更大的利益'])),
  card('People who keep an emergency fund cope better with job loss or illness, so they need less public help.','以 so 把個人緩衝連到較少政府依賴',[9,11,12],fixed(10,'People who [儲蓄] are less vulnerable to [失業疾病或物價上升], so they are less likely to [嚴重依賴政府支援].','個人財務緩衝也減低困境中的公共支援壓力。','要把個人的應對能力連到外部支援需求的後果時。',['People who ', ' are less vulnerable to ', ', so they are less likely to '],['有預備的人','較能承受的衝擊','因此較少發生的依賴'])),
  card('More importantly, money kept aside can become funding for future projects.','以 More importantly 升級到儲蓄轉化投資',[10,12,13],fixed(11,'More importantly, [儲蓄] can become [投資].','個人安全之後，作者提出資金可推動未來成長的更深理由。','已說直接保護作用，還需提出更大或更長期的第二層作用時。',['More importantly, ', ' can become '],['原本的資源','可轉化出的更大用途'])),
  card('Banks can lend deposits to cafés, parents can pay for courses and workers can start shops without risky loans.','以三個 can 並列儲蓄轉成投資的路徑',[10,11,14],fixed(12,'Banks can [借存款給企業], families can [資助教育], and individuals can [無危險債務地創業].','銀行、家庭及個人三條路徑把儲蓄變成未來資本。','已提出抽象的資源轉化，要列出不同主體的具體使用途徑時。',['Banks can ', ', families can ', ', and individuals can '],['銀行能做的資金用途','家庭能做的用途','個人能做的用途'])),
  card('A family that spends every dollar may look comfortable, but is fragile like a house built on sand.','以 may look ... but ... 比喻表面繁榮與實際脆弱',[12,14,15],fixed(13,'[花光每一元的社會] may look [表面繁榮], but it can become [脆弱], like [沙上房屋].','沒有儲備的表面繁榮不等於能抵禦衝擊。','要對照外觀上的好處與欠缺基礎時的內在脆弱性時。',[' may look ', ', but it can become ', ', like '],['缺乏儲備的主體','表面印象','真正風險','幫助理解的比喻'])),
  card('By contrast, many families saving money create a cushion and funds for future study.','以 By contrast 對照儲蓄帶來安全與成長資本',[11,13,15],fixed(14,'By contrast, [廣泛儲蓄] creates [財務緩衝] and provides [未來增長資本].','與花光資源的脆弱相反，儲蓄兼顧抗風險與投資。','一種脆弱情況已說明，需對照另一做法帶來的保護與發展時。',['By contrast, ', ' creates ', ' and provides '],['相反的資源做法','立即保護作用','長遠發展用途'])),
  card('This makes the community more able to recover, not merely busier today.','以 not merely 區分有韌性與表面活躍',[9,14,16],fixed(15,'This makes [經濟] more [有韌性], not merely more [活躍].','總結作者的比較標準：能承受衝擊比只看交易熱鬧更重要。','要區分較深層的長期能力與較表面的即時活動時。',['This makes ', ' more ', ', not merely more '],['被評估的整體','較深層的能力','不足以代表穩固的表象'])),
  card('In conclusion, local shopping matters because it supports jobs, shops and family income.','以 because 並列消費的三項正面作用',[5,8,17],fixed(16,'In conclusion, [消費] is important because it supports [需求、就業與企業收入].','結論仍承認消費使商戶和工作受益，並未否定另一方。','結論先公平重述較少支持的一方，交代其真正價值時。',['In conclusion, ', ' is important because it supports '],['被承認有價值的做法','該做法支持的成果'])),
  card('Nevertheless, I firmly believe saving is better because it protects families and funds future growth.','以 Nevertheless ... as ... 重申儲蓄較有價值的理由',[2,10,16],fixed(17,'Nevertheless, I firmly believe that [儲蓄] is more valuable for [國家經濟], as it [促穩定、降風險並奠定長遠基礎].','結論最後按穩定、風險、長期發展重申選擇。','已承認一方好處，需用 Nevertheless 清楚重申另一方較佳及其理由時。',['Nevertheless, I firmly believe that ', ' is more valuable for ', ', as it '],['最終較支持的做法','比較的整體對象','較有價值的原因'])),
];
const wrongReasons=[
  ['這句並列兩派消費儲蓄理由，未用 How ... 說個人選擇的整體影響。','這句說付款令金錢流通，已進入具體機制。','這句轉入作者較支持儲蓄，原句只開篇定範圍。'],
  ['這句交代用錢方式有影響，尚未公平介紹兩派理由。','這句已作作者短期長期的選擇，原句先並列兩派。','這句轉入儲蓄段，沒有 While some ... others ... 的公平引入。'],
  ['這句先介紹兩方各自理由，未給作者的最終選擇。','這句只解釋付款後金錢流通，未權衡兩派。','這句結論重申選擇，原句在引言首次表態。'],
  ['這句已表態較支持儲蓄，原句先公平開消費一派。','這句描述依賴顧客付款的企業，未先肯定一方論點合理。','這句轉到作者較支持的儲蓄，不是消費一方的開段。'],
  ['這句只肯定消費一派有理由，未說錢如何流動。','這句假設消費突然停止，未說正常購買時的流通。','這句用血脈比喻總結流通，原句先解釋基本機制。'],
  ['這句解釋資金流動，未列具體依賴顧客的行業。','這句假設停消費的後果，原句說正常支出支撐哪些企業。','這句家庭例子說私人和他人好處，不是企業清單。'],
  ['這句列正常營業企業，未用 If 假設消費停止。','這句家庭例子是消費在發生時的作用，非停止時的後果。','這句比喻流通重要性，未列失收入、減產和裁員。'],
  ['這句列依賴顧客的行業，未用 not only ... also ... 的雙重作用。','這句假設停消費，原句說實際家庭消費幫到誰。','這句概括經濟血脈，未舉家庭與職業的具體例子。'],
  ['這句說金錢流通的基本機制，未以 bloodstream 比喻概括。','這句家庭例子說外食旅遊助就業，原句抽成整體作用。','這句轉入儲蓄長期利益，並非消費段的總結。'],
  ['這句公平開消費一派，原句轉入作者較支持的儲蓄。','這句已用血脈比喻總結消費，未轉到儲蓄。','這句詳述有儲蓄的人較能承受風險，原句先提出主張。'],
  ['這句總論儲蓄的可持續好處，未用 so 說個人緩衝連到政府支援。','這句只提出儲蓄可成投資，與失業疾病風險不同。','這句列投資路徑，未分析個人抗失業疾病能力。'],
  ['這句已講個人財務保護，原句升級到資金轉化。','這句列銀行家庭個人如何使用資金，原句只先提出投資主張。','這句用沙屋比喻缺儲備風險，未說儲蓄如何變投資。'],
  ['這句說較少依賴政府，未列銀行家庭個人的資金用途。','這句是抽象「儲蓄變投資」，原句給出三條實際路徑。','這句對照廣泛儲蓄的緩衝和資本，未列具體主體。'],
  ['這句列儲蓄怎樣成投資，沒有表面繁榮與內在脆弱的反差。','這句正面說儲蓄的緩衝，原句先說花光資源的風險。','這句總結韌性與活躍，未用沙屋具體比喻。'],
  ['這句說花光資源像沙屋，原句以 By contrast 說儲蓄的相反效果。','這句列投資途徑，未概括社會性的緩衝與增長資本。','這句再抽象總結韌性，原句先列兩項儲蓄作用。'],
  ['這句主張儲蓄更深且持久，未用 not merely 區分韌性與活躍。','這句列緩衝與增長資本，原句用它們推到總體韌性。','這句結論承認消費作用，不是比較經濟的深淺指標。'],
  ['這句是消費段中依賴顧客的企業清單，原句結論並列三項成果。','這句用血脈比喻總結消費段，未作結論式重述。','這句最終選擇儲蓄，原句先承認消費的價值。'],
  ['這句在引言表態短期與長期，原句結論詳列穩定風險成長。','這句轉入儲蓄段的主張，未以 Nevertheless 收束兩派權衡。','這句結論重述消費作用，尚未表明最終較支持儲蓄。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先公平排消費一方，再排作者較支持的儲蓄一方。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這題比較哪兩種收入使用方式？',[
    '當下購買商品服務，與把部分收入留待日後使用',
    '只比較現金顏色，與銀行分行的裝修設計',
    '只比較兩種交通工具，與道路的施工速度',
    '只比較餐廳菜式，與商店開門的時間長短',
  ],'範文先說消費支持當下商業，再說儲蓄支持穩定與未來投資。'),
  {type:'multi',prompt:'選出兩派各自最重要的理由',detail:'選兩項，再按「確認」。',options:[
    '消費使金錢流通，支持企業收入和工作機會',
    '儲蓄形成緩衝，並把資金用於未來成長',
    '消費者一付款，所有經濟風險便立即消失',
    '儲蓄代表金錢永遠不能再被借出或投資',
  ],correct:[0,1],why:'作者承認即時流通，但更重視長期穩定與投資。'},
];
const route=[sequence('依文章次序排列消費與儲蓄論證',[
  ['引言列兩派並表態','消費短期有用，儲蓄長期較佳。'],
  ['消費方的機制','付款讓金錢流通，商戶和員工有收入。'],
  ['儲蓄方的機制','個人抗失業疾病，存款又可成企業教育投資。'],
  ['結論重申權衡','承認消費支持需求就業，更選儲蓄的穩定與發展。'],
],'範文先真正說明消費方好處，再用個人緩衝和投資論證儲蓄。')];
const evidence=[
  quiz('為何消費能維持企業和工作？',[
    '顧客付款成為企業收入，企業才較能維持生產與僱員',
    '只要有人購物，所有企業便必定永遠不會關門',
    '消費者買東西會使金錢永久離開整個經濟',
    '員工薪金與企業收入從來沒有任何關係',
  ],'停消費的反事實推演列出失收入、減產和裁員。'),
  quiz('家庭外食、購物、旅遊的例子展示甚麼？',[
    '家庭滿足自己，也使侍應店員司機有機會賺取收入',
    '家庭只會得到私人好處，其他職業完全不受影響',
    '所有旅遊開支都只會留在家庭自己的銀行帳戶',
    '外食和購物必定會令每一個人立即失去工作',
  ],'作者用 not only ... also ... 串連私人需要和他人收入。'),
  quiz('有儲蓄的人在困難時期為何較少依賴政府？',[
    '儲備可幫他們應對失業疾病與物價上升的衝擊',
    '儲蓄可保證任何人都不會失業或患上疾病',
    '物價上升時，只有完全不存錢的人能夠支付',
    '有儲蓄的人不需要工作，也不會再購買任何東西',
  ],'個人緩衝降低困難時對外部支援的依賴。'),
  quiz('範文給了哪三種儲蓄轉成投資的路徑？',[
    '銀行貸款給企業、家庭付教育費、個人創業',
    '銀行永不放貸、家庭停學、個人只借危險債',
    '企業只儲存紙幣、學校只關門、個人不再做事',
    '所有存款只能閒置，不能用於任何新計劃',
  ],'作者把抽象投資具體化為銀行、家庭與個人的用途。'),
  quiz('「沙上房屋」比喻哪一種情況？',[
    '表面繁榮卻沒有儲備，因此面對衝擊容易脆弱',
    '社會只要多建房子，就必然不需要任何儲蓄',
    '有財務緩衝的社會，必定只能住在沙地房屋',
    '一個社會所有收入都儲起來，所以完全沒有消費',
  ],'花光收入的表面熱鬧可能缺少穩固基礎。'),
  quiz('儲蓄帶來哪兩項比即時交易更長遠的作用？',[
    '財務緩衝與未來增長所需的資本',
    '只增加當天的交易次數與廣告數量',
    '只使餐廳座位滿員，不涉及任何投資',
    '只提高商品售價，而不改變風險承受力',
  ],'原文用 cushion 和 capital 並列保護與發展。'),
  quiz('作者在結論中是否否定消費？',[
    '沒有；先承認需求就業收入，再說儲蓄長遠更有價值',
    '有；聲稱消費永遠不能支持任何企業收入',
    '有；完全刪去消費方所有合理的論據',
    '沒有；因此不再選擇儲蓄而改支持花光收入',
  ],'最終選擇儲蓄，但保留消費方的真實經濟作用。'),
];
const logic=[
  sequence('消費支持短期經濟活動',[
    ['公平承認','消費者有合理理由。'],
    ['流通機制','付款讓金錢在商戶和人之間流動。'],
    ['企業依賴','餐廳商店運輸網店需要付費顧客。'],
    ['停止消費後果','企業可能失收入、減產和裁員。'],
    ['家庭例子與比喻','家庭支出助服務員謀生，消費像經濟血脈。'],
  ],'作者用正常消費及停消費反例，清楚說明支出與就業的關係。'),
  sequence('儲蓄支持長期穩定與投資',[
    ['個人緩衝','儲備抵抗失業疾病物價上升，減少依賴政府。'],
    ['資金可轉化','存款不只是放着，也可變成投資。'],
    ['三種用途','銀行貸企業、家庭付教育、個人創業。'],
    ['表面繁榮風險','花光每一元的社會像沙上房屋。'],
    ['韌性與增長','廣泛儲蓄有財務緩衝，也有未來資本。'],
  ],'作者從個人抗風險推到全社會的投資能力和長期韌性。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('小鎮居民最近減少到街市和餐廳購物，商戶說收入下跌並準備縮短員工工時。','哪項最能運用範文的消費機制？',[
    '居民減少付款，商戶收入下降，工作機會也受壓',
    '居民減少付款，商戶收入便必然立即翻倍',
    '居民少購物只會改變菜單，完全不影響收入',
    '只要有商店招牌，員工工時便不可能減少',
  ],['原文的停消費推演連結收入、產量和員工工作。','方向相反。','忽略營收。','招牌不保工作。'],[4,5,6],'範文用 If consumers suddenly stopped spending 推到企業失收入和裁員。'),
  transfer('一個家庭每月到本地餐館用餐，也在街坊店購物；有人說這些支出只有私人好處。','哪項最能轉用範文的家庭例子？',[
    '家庭得到商品服務，侍應與店員也因此有收入',
    '家庭一付款，所有侍應與店員便必定失業',
    '這些支出只能留在家庭，絕不會進入商戶',
    '餐館和店舖都不需要顧客付費才能營運',
  ],['原文用 not only ... also ... 說消費滿足家庭且助人謀生。','方向相反。','錢會流通。','商戶依賴付款。'],[5,7,8],'範文說家庭外食購物旅遊也幫侍應店員司機維持生計。'),
  transfer('一名自僱司機擔心突然生病，正考慮每月留下一部分收入。','哪項最能轉用範文的個人緩衝理由？',[
    '儲備可幫他渡過暫停工作期，減少依賴外部支援',
    '儲蓄可保證司機永遠不會生病或失去工作',
    '只要把錢花光，生病後便必然更容易付費',
    '留存收入只會令所有醫療費用立即消失',
  ],['原文說儲蓄減少失業疾病時的脆弱與政府依賴。','不保證不生病。','花光增風險。','費用不會消失。'],[9,10],'範文把有儲備連到較少依賴政府支援，而非避免疾病本身。'),
  transfer('地方銀行收到居民存款，附近小企業卻難籌到購買設備的資金。','哪項最能用範文說明儲蓄的投資路徑？',[
    '銀行可把存款貸給企業，讓儲蓄支持生產投資',
    '銀行必須把所有存款永遠鎖住，不能用於企業',
    '居民只要把錢存進銀行，企業便自動毋須設備',
    '企業缺資金時，只能要求家庭停止所有教育',
  ],['原文直接列銀行貸出存款給企業。','與原文相反。','設備需求仍在。','教育是另一用途。'],[11,12],'範文說儲蓄可變投資，銀行可把存款借給企業。'),
  transfer('父母想為孩子將來上大學存錢，朋友說儲蓄只會讓金錢閒置。','哪項回應最貼近範文？',[
    '儲起的錢可日後支付教育，屬於長期能力投資',
    '只要錢暫未花，日後就不可能用來支付教育',
    '家庭一開始存錢，孩子便不需要接受任何教育',
    '只有當天買東西的錢才可能對未來有任何用途',
  ],['範文用家庭資助教育作儲蓄轉投資的例子。','與用途相反。','教育仍需支付。','忽略長期投資。'],[11,12],'範文列家庭以儲蓄資助教育，反駁資金只能閒置。'),
  transfer('一座城市節慶消費很旺，但許多家庭沒有任何應急存款。','哪項最能轉用「沙上房屋」比喻？',[
    '眼前熱鬧不等於穩固，缺少儲備使家庭易受衝擊',
    '節慶人多就表示所有家庭已經有充足儲備',
    '只要商店繁忙，失業和物價上升便不會再發生',
    '城市應只討論建築材料，不必評估家庭財務',
  ],['表面繁榮與財務脆弱可同時存在。','熱鬧不證明儲備。','衝擊仍可能來。','比喻談財務。'],[10,13,14],'範文以花光收入的社會像沙上房屋，說表面繁榮未必穩固。'),
  transfer('政策報告只用消費交易次數衡量經濟好壞，忽略居民能否應付意外。','哪項最能使用韌性與活躍的區分？',[
    '除交易量，也看居民的財務緩衝與抗風險能力',
    '只要交易量上升，居民便必定不再有財務風險',
    '只看商店開門次數，不理家庭有沒有應急資金',
    '把所有存款視為無用，因為它不等於當天消費',
  ],['原文說經濟需更有韌性，不只更活躍。','活躍非安全。','漏緩衝。','存款有投資用途。'],[13,14,15],'範文以 financial cushion 和 capital 說明 resilient 不等於 active。'),
  transfer('青年想開小企業，正在比較先累積部分存款與一開始就借一筆難以償還的款項。','哪項最符合範文的創業例子？',[
    '先有儲備可支援創業，並減少落入危險債務',
    '借款愈難償還，企業便必然愈快穩定成長',
    '創業資金只能來自當天消費，與儲蓄無關',
    '只要計劃新穎，創業者就永遠不必還債',
  ],['原文說個人可用儲蓄創業而避免危險債務。','債務風險更高。','儲蓄是資金來源。','還債仍必要。'],[11,12,14],'範文把儲蓄轉投資，具體包括免於危險借貸的小型創業。'),
  transfer('議會辯論中，一方強調商戶收入，另一方強調財務緩衝與長期資本。','哪項立場最忠於範文的權衡？',[
    '承認消費支持就業，但認為儲蓄更助長期穩定',
    '否定所有消費作用，說商戶永遠不需要顧客',
    '只講儲蓄，完全不理企業收入與工作機會',
    '只看即時交易，不問經濟能否承受未來衝擊',
  ],['作者公平承認消費，再選儲蓄的較長遠好處。','原文承認消費。','漏另一方。','忽略韌性。'],[2,8,9,14,16,17],'範文結論先說消費支持需求工作收入，再選儲蓄作長期基礎。'),
  transfer('財務教育課把「儲蓄」講成錢永遠不再流動，把「消費」講成唯一能創造工作的方式。','哪項修正最能依範文說清兩者作用？',[
    '消費支援當下交易；儲蓄也可貸款、教育和創業',
    '消費與儲蓄都完全無法影響企業收入或成長',
    '儲蓄只可藏在家中，永遠不會流向任何企業',
    '消費只影響個人，完全不可能幫員工取得薪金',
  ],['範文的關鍵是兩種資金路徑各有作用。','兩者均有作用。','存款可放貸。','消費助就業。'],[4,7,11,12,16,17],'範文一段講消費的當下流通，一段講儲蓄轉投資。'),
];
export default {key:'discuss-both-views:7',meta:{topic:'消費與儲蓄何者更有利於國家經濟',summary:'消費維持商戶收入與就業；儲蓄則提供個人緩衝、投資資本和長期經濟韌性。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
