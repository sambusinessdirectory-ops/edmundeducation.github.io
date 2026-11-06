// Advertising-driven consumerism: jobs/product improvement versus spending/environment.
// Hold for canonical Chinese repair in advantage-disadvantage-16-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:16'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Today, people see messages trying to sell things almost all the time, on phones, in printed material and on city streets.',
 'A culture that keeps telling people to buy can help businesses and make products better. Still, I think its overall effect is bad because it leads people to spend money they do not need to spend and harms the environment faster.',
 'It is true that buying and selling more goods can have real benefits for the economy.',
 'First, when many people want to buy goods, companies can earn money and give people jobs in making, selling, moving and promoting products.',
 'When a product that has many adverts sells well, the money it brings in supports jobs at many connected businesses, not just one company.',
 'Then governments may collect more money in taxes, which they can use to pay for public services.',
 'Also, companies often improve what they sell because they need to bring in customers.',
 'Because businesses have to show people that a new product is worth buying, they often make it better, easier to use and less wasteful to operate.',
 'Phones are a good example: strong competition has led to batteries that last longer, better ways to keep information safe and cameras that work more reliably.',
 'Even with these benefits, the bad effects are more serious.',
 'The first bad effect is that people can lose money.',
 'By showing things people do not need as signs of success or happiness again and again, adverts can make it harder to tell what people want from what they need.',
 'So many people buy without thinking, save less or borrow money to buy things that do little to improve their lives.',
 'For example, a young worker who often buys a new phone even though the old one still works, just to follow new fashions, may put themselves under money pressure they did not need.',
 'The second problem is harm to the environment.',
 'This buying culture needs products to be made, packed, moved and replaced again and again. All these steps use energy and materials from nature.',
 'Also, many cheap clothes and electronic items are thrown away long before they stop being useful, adding to rubbish dumps and pollution.',
 'For this reason, buying new things all the time puts heavy pressure on the planet.',
 'To sum up, buying more goods may create jobs and make products better, but in this essay the problems are more important.',
 'Because it leads to spending that is not needed and more harm to the environment, I think this is a bad trend overall.',
];
const vocabulary=[
 v(['contemporary society','Today','當代社會'],['exposed to','see','接觸'],['commercial messages','messages trying to sell things','商業訊息'],['almost constantly','almost all the time','幾乎時刻'],['in print','in printed material','印刷媒體']),
 v(['advertising-driven culture of consumerism','culture that keeps telling people to buy','廣告驅動的消費主義'],['stimulate economic activity','help businesses','刺激經濟活動'],['product improvement','make products better','改善產品'],['overall impact','overall effect','整體影響'],['wasteful spending','spend money they do not need to spend','浪費性開支'],['accelerates environmental damage','harms the environment faster','加速環境損害']),
 v(['Admittedly','It is true','誠然'],['consumerism','buying and selling more goods','消費主義'],['genuine benefits','real benefits','實際好處'],['economy','economy','經濟']),
 v(['To begin with','First','首先'],['strong demand for goods','many people want to buy goods','商品強勁需求'],['profitable','earn money','盈利'],['employ people','give people jobs','聘用員工'],['manufacturing','making','製造'],['retail','selling','零售'],['logistics','moving','物流'],['marketing','promoting','市場推廣']),
 v(['heavily advertised','has many adverts','大力宣傳'],['resulting income','money it brings in','所得收入'],['entire chain of jobs','jobs at many connected businesses','整條就業鏈'],['rather than a single business','not just one company','不只一家企業']),
 v(['In turn','Then','接着'],['governments','governments','政府'],['tax revenue','money in taxes','稅收'],['fund public services','pay for public services','資助公共服務']),
 v(['In addition','Also','此外'],['attract customers','bring in customers','吸引顧客'],['forces companies to improve','companies often improve','促使企業改善']),
 v(['Since','Because','由於'],['persuade consumers','show people','說服消費者'],['worth buying','worth buying','值得購買'],['enhance quality','make it better','提升品質'],['convenience','easier to use','便利性'],['efficiency','less wasteful to operate','效率']),
 v(['smartphone industry','Phones','智能手機行業'],['illustrates','a good example','說明'],['intense competition','strong competition','激烈競爭'],['better batteries','batteries that last longer','更好的電池'],['stronger security systems','better ways to keep information safe','更強保安系統'],['more reliable cameras','cameras that work more reliably','更可靠相機']),
 v(['Even so','Even with these benefits','即便如此'],['negative effects','bad effects','負面影響'],['more serious','more serious','更嚴重']),
 v(['financial harm','lose money','財務損害'],['individual level','people','個人層面']),
 v(['non-essential items','things people do not need','非必要物品'],['symbols of success or happiness','signs of success or happiness','成功或幸福象徵'],['advertising','adverts','廣告'],['blur the distinction','make it harder to tell','模糊分別'],['wants and needs','what people want from what they need','想要與需要']),
 v(['As a result','So','因此'],['buy impulsively','buy without thinking','衝動購買'],['reduce their savings','save less','減少儲蓄'],['rely on credit','borrow money','依賴借貸'],['add little real value','do little to improve','實際價值低']),
 v(['frequently upgrades','often buys a new phone','經常升級'],['perfectly functional devices','old one still works','仍能正常使用的裝置'],['follow trends','follow new fashions','追潮流'],['unnecessary financial pressure','money pressure they did not need','不必要財務壓力']),
 v(['second drawback','second problem','第二缺點'],['environmental','harm to the environment','環境層面']),
 v(['Consumerism','This buying culture','消費主義'],['continual production','products to be made','持續生產'],['packaging','packed','包裝'],['transport','moved','運輸'],['replacement','replaced','替換'],['consume energy and raw materials','use energy and materials from nature','消耗能源原料']),
 v(['Moreover','Also','此外'],['cheap clothes','cheap clothes','廉價衣服'],['electronic products','electronic items','電子產品'],['discarded','thrown away','被丟棄'],['useful life','stop being useful','使用壽命'],['landfill waste','rubbish dumps','堆填廢物'],['pollution','pollution','污染']),
 v(['For this reason','For this reason','基於這原因'],['constant purchasing','buying new things all the time','持續購物'],['heavy burden','heavy pressure','沉重負擔'],['planet','planet','地球']),
 v(['In conclusion','To sum up','總結'],['create employment','create jobs','創造就業'],['drive innovation','make products better','推動創新'],['disadvantages','problems','缺點'],['more significant','more important','更重大']),
 v(['needless expenditure','spending that is not needed','不必要開支'],['deepens environmental degradation','more harm to the environment','加劇環境破壞'],['on balance','overall','整體而言'],['harmful social trend','bad trend','有害社會趨勢']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In contemporary society, people are exposed to news almost constantly, whether on their phones, in print, or across television screens.',d:[1,9,15],relation:'用 whether...or 列出商業訊息出現的多種媒介',formula:'In contemporary society, people are exposed to [訊息] almost constantly, whether on [媒介一], in [媒介二], or across [媒介三]',meaning:'商業訊息出現在手機、印刷品及街道等地方。',usage:'先交代接觸頻率與媒介，再評估消費文化影響。',links:['In contemporary society, people are exposed to ', ' almost constantly, whether on ', ', in ', ', or across ','.'],labels:['訊息','媒介一','媒介二','媒介三']},
 {example:'This advertising-driven culture of consumerism can stimulate sales and encourage better design; however, I believe its overall impact is negative because it encourages overspending and creates more waste.',d:[0,9,18],relation:'先承認經濟好處，分號 however 轉到浪費與環境弊端立場',formula:'This advertising-driven culture of consumerism can [好處一] and [好處二]; however, I believe its overall impact is negative because [兩項弊端]',meaning:'作者承認工作與產品改善，但判斷浪費支出及環境傷害更重。',usage:'分號兩邊是完整分句；後文須分別解釋好處與弊端。',links:['This advertising-driven culture of consumerism can ', ' and ', '; however, I believe its overall impact is negative because ','.'],labels:['經濟好處','產品好處','負面理由']},
 {example:'Admittedly, consumerism can produce genuine benefits for some businesses.',d:[1,10,18],relation:'用 Admittedly 正面承認經濟收益',formula:'Admittedly, consumerism can produce genuine benefits for [受益面向]',meaning:'消費需求可帶來真實經濟好處。',usage:'承認好處不等於整體支持；後文仍要權衡個人與環境代價。',links:['Admittedly, consumerism can produce genuine benefits for ','.'],labels:['受益面向']},
 {example:'To begin with, strong demand for goods keeps firms profitable and allows them to employ people across shops and delivery services.',d:[2,9,10],relation:'由商品需求帶到企業盈利及不同環節就業',formula:'To begin with, strong demand for goods keeps [企業結果] and allows them to employ people across [工作環節]',meaning:'高需求可支撐企業收入及製造、零售、物流等工作。',usage:'這是範文的好處鏈條，不要把就業影響縮成一家店。',links:['To begin with, strong demand for goods keeps ', ' and allows them to employ people across ','.'],labels:['企業結果','工作環節']},
 {example:'When a heavily advertised product sells well, the resulting income supports a network of workers rather than a single shop.',d:[3,9,10],relation:'用 When 與 rather than 說明暢銷收入支援整條工作鏈',formula:'When a heavily advertised product sells well, the resulting income supports [多個環節] rather than [單一受益者]',meaning:'廣告產品暢銷，收入可能支撐供應鏈多種工作。',usage:'這句與前句就業機制連接，並未保證每項廣告產品都熱賣。',links:['When a heavily advertised product sells well, the resulting income supports ', ' rather than ','.'],labels:['多個環節','單一受益者']},
 {example:'In turn, governments may collect more tax revenue, which can be used to support local services.',d:[3,10,14],relation:'In turn 把經濟活動連到可能增加的稅收及公共服務',formula:'In turn, governments may collect [公共收入], which can be used to [公共用途]',meaning:'相關經濟活動或增加稅收，資金可用於公共服務。',usage:'may/can 均表可能，不能寫成政府一定會如此使用每筆收入。',links:['In turn, governments may collect ', ', which can be used to ','.'],labels:['公共收入','公共用途']},
 {example:'In addition, the need to attract customers often forces companies to improve their products.',d:[3,9,10],relation:'第二個經濟好處從就業轉到產品改良',formula:'In addition, the need to attract customers often forces companies to [產品行動]',meaning:'企業為吸引顧客可能改善產品。',usage:'often 保留範圍；下一句須說明說服顧客與品質便利的關係。',links:['In addition, the need to attract customers often forces companies to ','.'],labels:['產品行動']},
 {example:'Since businesses must persuade consumers that a new item is worth buying, they tend to improve safety, convenience, and reliability.',d:[4,9,12],relation:'Since 表企業說服顧客與改善產品特點的因果',formula:'Since businesses must persuade consumers that a new item is worth buying, they tend to [改善面向]',meaning:'為吸引購買，企業傾向改善品質、便利與效率。',usage:'tend to 表傾向，不是每款新產品都較好。',links:['Since businesses must persuade consumers that a new item is worth buying, they tend to ','.'],labels:['改善面向']},
 {example:'The smartphone industry illustrates this clearly, as intense competition has led to longer battery life and more reliable cameras.',d:[4,9,12],relation:'以智能手機的電池保安與相機作產品改良例子',formula:'The smartphone industry illustrates this clearly, as intense competition has led to [改良例子]',meaning:'範文以智能手機競爭帶來電池、保安和相機改進作例子。',usage:'例子說明競爭與改良的論點，不應單憑此句證明所有廣告都促進創新。',links:['The smartphone industry illustrates this clearly, as intense competition has led to ','.'],labels:['改良例子']},
 {example:'Even so, the social and environmental costs are more serious.',d:[2,6,14],relation:'Even so 承認好處後轉到更重弊端',formula:'Even so, [負面影響] are more serious',meaning:'作者認為財務及環境傷害比經濟好處更嚴重。',usage:'短轉折句後要有兩種具體傷害支持。',links:['Even so, ', ' are more serious.'],labels:['負面影響']},
 {example:'The first is pressure on household budgets.',d:[2,6,14],relation:'第一弊端點明個人財務損害',formula:'The first is [第一種傷害]',meaning:'第一個缺點是個人可能承受不必要的財務壓力。',usage:'The first 回指前句 negative effects；後面須交代廣告如何影響想要與需要。',links:['The first is ','.'],labels:['第一種傷害']},
 {example:'By repeatedly presenting expensive items as symbols of achievement or happiness, advertising can blur the distinction between wants and needs.',d:[4,10,14],relation:'By + doing 說明廣告把非必要品包裝成成功象徵的方式',formula:'By repeatedly presenting [商品] as symbols of [理想形象], advertising can blur the distinction between wants and needs',meaning:'反覆把非必要物品連到成功或幸福，可能模糊想要與需要。',usage:'can 表可能影響；不是聲稱每名看廣告者都失去判斷力。',links:['By repeatedly presenting ', ' as symbols of ', ', advertising can blur the distinction between wants and needs.'],labels:['商品','被包裝的理想']},
 {example:'As a result, many people buy impulsively, save less, or rely on credit to purchase items that add little real value to their lives.',d:[4,10,15],relation:'As a result 把想要／需要混淆連到衝動購買與借貸',formula:'As a result, many people [購買行為], [儲蓄變化], or rely on credit to purchase [低價值物品]',meaning:'部分人可能衝動買、少儲蓄或借貸買實際價值低的商品。',usage:'many 不是 all；這是範文所述消費風險。',links:['As a result, many people ', ', ', ', or rely on credit to purchase ','.'],labels:['購買行為','儲蓄變化','購買的物品']},
 {example:'A young worker who frequently upgrades perfectly functional devices simply to follow trends, for example, may create avoidable financial pressure.',d:[4,10,15],relation:'用仍可用的裝置被追潮流更換具體化財務壓力',formula:'A young worker who frequently upgrades perfectly functional devices simply to follow trends, for example, may create [財務後果]',meaning:'追潮流頻繁更換正常裝置，可能帶來不必要的財務壓力。',usage:'例子批評不必要更換，不是反對所有合理更新設備。',links:['A young worker who frequently upgrades perfectly functional devices simply to follow trends, for example, may create ','.'],labels:['財務後果']},
 {example:'The second drawback is environmental damage.',d:[4,10,18],relation:'短句轉到與個人財務不同的環境弊端',formula:'The second drawback is [第二種傷害]',meaning:'第二個缺點是環境損害。',usage:'下一句須列生產、包裝、運輸與更換的資源消耗。',links:['The second drawback is ','.'],labels:['第二種傷害']},
 {example:'Consumerism depends on continual production, packaging, transport, and replacement, all of which use energy and natural materials.',d:[4,10,14],relation:'all of which 回指四個持續流程，說明共同資源消耗',formula:'Consumerism depends on [多個持續流程], all of which [共同資源代價]',meaning:'持續生產、包裝、運輸和替換都消耗能源與原料。',usage:'all of which 的先行詞是前列的流程，不是單一產品。',links:['Consumerism depends on ', ', all of which ','.'],labels:['多個流程','共同代價']},
 {example:'Moreover, many cheap clothes and electronic products are discarded long before the end of their useful life, increasing waste and pollution.',d:[4,10,14],relation:'補充物品未到使用壽命便被丟棄的污染後果',formula:'Moreover, many [商品] are discarded long before the end of their useful life, increasing [環境後果]',meaning:'衣物及電子品提早棄置，增加堆填廢物和污染。',usage:'many 指部分商品，不能寫成所有商品都未用完便丟。',links:['Moreover, many ', ' are discarded long before the end of their useful life, increasing ','.'],labels:['商品','環境後果']},
 {example:'For this reason, a culture of constant purchasing places a heavy burden on local ecosystems.',d:[4,10,14],relation:'For this reason 收束流程耗材與提早棄置兩項環境機制',formula:'For this reason, a culture of constant purchasing places a heavy burden on [受影響對象]',meaning:'連續生產和提早丟棄令地球承受負擔。',usage:'this reason 指前兩句環境證據，不能只憑一句口號作結。',links:['For this reason, a culture of constant purchasing places a heavy burden on ','.'],labels:['受影響對象']},
 {example:'In conclusion, although consumerism can create employment and drive innovation, its disadvantages are ultimately more damaging.',d:[2,10,14],relation:'結論重提就業與改良好處，仍判斷缺點較重',formula:'In conclusion, although consumerism can [好處一] and [好處二], its disadvantages are ultimately [權衡結果]',meaning:'作者承認就業和創新，但判斷個人與環境傷害更重大。',usage:'although 不應抹掉前文好處；結論要按已論證證據權衡。',links:['In conclusion, although consumerism can ', ' and ', ', its disadvantages are ultimately ','.'],labels:['經濟好處','產品好處','權衡結果']},
 {example:'Because it encourages needless expenditure and deepens pollution, it is, on balance, a harmful social trend.',d:[2,10,14],relation:'用 Because 列出個人開支及環境兩個最終負面理由',formula:'Because it encourages [個人代價] and deepens [環境代價], it is, on balance, [整體判斷]',meaning:'作者以不必要開支與環境惡化，支持整體負面立場。',usage:'on balance 表權衡後判斷，非否認存在經濟好處。',links:['Because it encourages ', ' and deepens ', ', it is, on balance, ','.'],labels:['個人代價','環境代價','整體判斷']},
];
const usageGuides=[
 '當你要用 whether...or 列出同一件事發生的多個渠道或場合時。',
 '當你要先承認一方好處，再用 however 清楚轉到自己的整體判斷和理由時。',
 '當你要先承認反方確有好處，為後文權衡兩面作準備時。',
 '當你要從一項需求推到企業結果，再推到不同工作環節時。',
 '當你要用 When 指出某條件成立後的影響，並用 rather than 排除過窄理解時。',
 '當你要用 In turn 承接前一項結果，再以 which 說明它可能帶來的用途時。',
 '當你要用 In addition 加入與上一項不同、但同屬一方的新理由時。',
 '當你要用 Since 交代行動背後的原因，再說明行動可能造成的變化時。',
 '當你要以一個具體例子說明上一句的抽象機制時。',
 '當你要用 Even so 承認剛才的好處仍成立，卻轉向更重的另一面時。',
 '當你要用 The first 開始分項分析前一句已提及的一組影響時。',
 '當你要用 By + doing 解釋某種做法如何產生後文的影響時。',
 '當你要用 As a result 承接剛說明的原因，列出多種可能後果時。',
 '當你要以一名具體人物的行動，展示前一項風險如何出現時。',
 '當你要用 The second drawback 另起一項與第一項不同的問題時。',
 '當你要列出多個並列流程，再用 all of which 說明它們共有的影響時。',
 '當你要用 Moreover 加一項證據，並以句末動作補充其後果時。',
 '當你要用 For this reason 收束前述證據，提出有根據的整體後果時。',
 '當你要在結論中用 although 重提已承認的好處，再交代哪一方更重時。',
 '當你要用 Because 重述支撐結論的理由，再以 on balance 表示權衡後判斷時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把經濟好處與個人、環境兩組代價分開排列。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('文章評估哪種由廣告推動的文化？',['不斷鼓勵購物的消費主義','只分析手機拍攝技巧','只比較兩家運輸公司','只談公共圖書館'],'題目焦點是 advertising-driven consumerism。'),
 {type:'multi',prompt:'範文承認的兩種經濟好處是甚麼？',detail:'選兩項，再按「確認」。',options:['商品需求可支撐多個環節的工作','吸引顧客的競爭可促進產品改善','保證每名消費者都有更多儲蓄','保證所有商品都不產生廢物'],correct:[0,1],why:'就業鏈與產品改良是兩條承認的好處。'},
];
const route=[sequence('依範文還原消費文化權衡',[
 ['背景與立場','商業訊息幾乎無處不在；作者承認經濟好處，但整體反對。'],
 ['經濟工作鏈','需求帶動企業收入、多環節就業，政府或有更多稅款。'],
 ['產品改善','企業為吸引顧客，傾向提升品質、便利與效率。'],
 ['個人財務傷害','非必要品被包裝成成功象徵，可能引出衝動購買與借貸。'],
 ['環境傷害及結論','持續生產和提早丟棄消耗資源、增加廢物；作者認為缺點更重。'],
 ],'先公平說明兩項好處，再沿兩條負面因果鏈評估權重。')];
const evidence=[
 quiz('一項廣告產品暢銷時，原文說收入可能支持甚麼？',['製造、零售、物流及推廣等整條工作鏈','只支持單一商店而不涉其他工作','保證所有工人都加薪','令政府不再需要任何稅收'],'範文強調 rather than a single business。'),
 quiz('企業為何可能改善產品？',['要說服顧客新產品值得買，故傾向改善品質、便利與效率','每家企業都必然不想保留顧客','廣告可自動修好產品','產品改良與顧客選擇完全無關'],'tend to 只說傾向。'),
 quiz('廣告如何可能模糊「想要」與「需要」？',['反覆把非必要品包裝成成功或幸福的象徵','禁止人們買任何必需品','保證每人立即失去判斷力','只播放政府公益通知'],'關鍵是非必要商品與理想形象反覆連結。'),
 quiz('年輕員工更換仍可用裝置的例子支持甚麼？',['追潮流的過早更新可能造成不必要財務壓力','所有電子產品都永遠不用更換','每次換手機必然使人破產','手機相機必定不會改善'],'範文只批評 simply to follow trends 的不必要更新。'),
 quiz('環境論證有哪兩條機制？',['生產包裝運輸替換耗材，加上物品提早丟棄增廢物','只有手機螢幕亮度','只有商店營業時間','只有企業的英文品牌名稱'],'原文分別說資源消耗與過早丟棄。'),
];
const logic=[
 sequence('經濟好處的兩條線',[
 ['需求','更多商品被購買，企業收入可能增加。'],
 ['工作鏈','製造、零售、物流與市場推廣等多環節可受益。'],
 ['公共收入','政府可能多收稅款，用於公共服務。'],
 ['競爭改良','企業為吸引顧客，傾向改善產品特點。'],
 ],'就業與產品改善是不同好處，稅收又是工作收入鏈的可能後續。'),
 sequence('財務與環境的兩條負面線',[
 ['廣告包裝','非必要物品反覆與成功、幸福相連。'],
 ['個人選擇','部分人可能衝動買、少儲蓄或借貸。'],
 ['資源消耗','持續生產、包裝、運輸和替換都用能源原料。'],
 ['提早丟棄','衣物和電子品未用盡即被丟，增加堆填廢物。'],
 ],'不可把個人財務風險與環境流程合成一個模糊的「不好」。'),
];
const transfers=[
 transfer('一款廣告產品暢銷，相關企業還需要運輸與店舖員工。','哪句準確轉用就業鏈的論證？',["廣告帶動銷售，收入或支持製造、運送與零售多個工作環節", "產品暢銷只讓廣告公司得益，製造與店舖工作不會受影響", "銷售增加可能帶來職位，所以每個工作必然永久增加", "廣告能吸引買家，但商品售出與運輸人手完全沒有關係"],["沿銷售鏈條指出不同工作環節。", "忽略實物產品的供應鏈。", "把可能支持誇成所有永久增加。", "運輸也是銷售鏈一環。"],[3,4],'原文 resulting income supports entire chain of jobs。'),
 transfer('地方政府因商業活動增加而可能收多些稅。','哪句保留原文的可能性與用途？',["商業活動或帶來較多稅款，部分收入可用於公共服務", "只要有更多廣告，政府的稅收便必然每年翻一倍", "稅款可增加公共資源，但只能再投入商品廣告", "政府多收稅後，醫院和學校便不再需要任何資金"],["保留或可增加及可投入服務的限定。", "廣告不保證稅收倍增。", "稅款用途不限於廣告。", "服務仍需持續投資。"],[5],'原文 governments may collect more tax revenue, which can fund services。'),
 transfer('兩家手機公司競爭，推出更耐用電池與較好資料保護。','哪句合理應用產品改善例子？',["企業爭取顧客，或會改善電池耐用度及資料保護功能", "手機公司競爭較激烈，所以每款新機都必然比舊款好", "廣告能展示保安功能，便代表產品不用實際改善", "顧客選擇會影響銷售，但與企業改良功能完全無關"],["把競爭壓力連到具體產品改良。", "競爭不保證所有款式。", "宣傳不等於功能改良。", "忽略需求與改良關係。"],[6,7,8],'原文 smartphone example 提 batteries/security/cameras。'),
 transfer('廣告把非必需的昂貴物件說成「成功人士必備」。','哪句指出範文擔心的心理機制？',["反覆把非必需品說成成功標誌，或令需要與想要更難分清", "廣告提到成功，便表示產品已變成每個人的生活必需品", "商品價格較高，便證明消費者肯定經過審慎需要評估", "想要新產品可能很常見，因此不必再區分需要與慾望"],["指出宣傳如何扭曲消費者對需要的判斷。", "廣告說法不等於真正需要。", "價格不保證審慎。", "仍需區分需要與想要。"],[11,12],'原文 non-essential items as symbols→blur wants/needs。'),
 transfer('一個人為追潮流換掉仍能正常使用的裝置。','哪句恰當描述財務風險？',["頻繁換掉仍可用裝置，或增加支出並擠壓可用儲蓄", "只要新款有不同外觀，舊裝置便不再有任何實際用途", "更新設備可能有益，因此追潮流換機不會增加花費", "裝置仍可使用時更換，代表購買者的收入一定上升"],["把不必要的更換連到支出和儲蓄。", "外觀變化不使舊機無用。", "換機仍需支付費用。", "購買不能證明收入變化。"],[12,13],'原文 perfectly functional device upgraded simply to follow trends。'),
 transfer('某產品從製造到運送都需要能源與原料。','哪句對應範文的環境論證？',["反覆製造、包裝及運送商品，會累積原料與能源消耗", "只要產品到店售賣，包裝和運輸階段便沒有資源用量", "製造需要材料，但購買次數增加也不影響總消耗", "商品價格較低，便代表其生產過程完全不用能源"],["指出每一輪產品供應的資源成本。", "包裝與物流仍消耗資源。", "需求次數影響總量。", "售價不等於能源用量。"],[15],'原文 continual production/packaging/transport/replacement consume resources。'),
 transfer('衣物仍可穿，卻因新潮流而很快被丟掉。','哪句轉用「提早棄置」的後果？',["衣物未到壽命便棄置，或增加堆填區廢物與污染", "舊衣仍可穿時丟棄，便能自然延長它的使用年期", "衣服換得較快，卻不可能增加任何處理廢物負擔", "潮流變化能改變選擇，所以棄置時間與污染無關"],["把提早棄置連到額外廢物。", "棄置會縮短而非延長使用。", "棄置量可能增加。", "時間與廢物量有關。"],[16,17],'原文 cheap clothes/electronics discarded early。'),
 transfer('作者承認消費文化帶來工作與產品改善，但仍持負面立場。','哪句表達完整的最後權衡？',["就業與產品改良有益，但過度支出和環境損害在此更重", "廣告能支持工作，因此過量消費的財務代價可忽略", "環境代價可能較大，所以所有產品改良都不存在", "只要舉一款新手機的好處，便能代表整體環境無損"],["承認正面作用後比較更重的負面影響。", "好處不取消財務風險。", "代價不否定改良。", "單例不能代替全局。"],[1,18,19],'原文 although ... benefits, disadvantages ultimately more significant。'),
 transfer('作文討論新型運動用品，廣告使需求增加，也可能使人過量購買。','哪句按範文分清兩個因果方向？',["需求可支持就業與改良，過量購買或壓縮預算並增廢物", "廣告帶來訂單，所以運動用品更換不會產生額外廢物", "消費者買得愈多，便必然有更多收入可以支付貨款", "產品改良和過量購買可能同時發生，卻毋須分開分析"],["將正面供應鏈和負面購買後果分開。", "訂單不取消廢物。", "購物量不證明收入。", "兩條機制須分別解釋。"],[3,6,12,15],'原文兩組好處對兩組弊端。'),
 transfer('廣告宣稱「買新款才會幸福」。','哪句最適合提醒讀者評估消費？',["先分清真正需要與暫時想要，再查購買會否擠壓儲蓄", "廣告說能帶來幸福，便足以證明新款屬於基本需要", "只要可用貸款付款，便不必再考慮日後還款壓力", "新產品或有用，因此每次看見廣告都應立即購買"],["用需要判斷和預算檢查抵抗過度消費。", "宣傳不能決定需要。", "借款仍須還款。", "有用不代表每次都該買。"],[11,12],'原文 symbols of happiness→impulse buying/reduced savings/credit。'),
];
const revised=[
 {wrong:['廣告帶動銷售，收益主要支持廣告業而非製造零售','產品暢銷可增加生產需求，運送人手卻未必受影響','銷售增加會支持就業，因此各環節職位增幅應相同'],why:['銷售收入也可能帶動生產、運輸和零售。','需求增加可能沿供應鏈影響運送工作。','各環節就業受多種條件影響，增幅未必相同。']},
 {wrong:['商業活動帶來較多稅款，應優先用於更多商品宣傳','稅款增加後，公共醫院與學校的資金需求會下降','廣告增加可提高稅收，因此公共服務毋須另作規劃'],why:['稅款並非只能回投商品宣傳。','收入增加不代表服務需要下降。','公共服務的用途仍須按實際需要安排。']},
 {wrong:['企業競爭使廣告更有說服力，功能改良便不太重要','廣告展示保護功能，便足以證明手機資料更安全','顧客選擇影響銷售，卻未必促使企業改善功能'],why:['競爭可促使企業改良實際產品。','宣傳功能不能代替實際性能檢驗。','消費者偏好可成為企業改良的動力。']},
 {wrong:['廣告把昂貴物件說成成功標誌，可證明它屬生活需要','成功形象容易引人購買，但高價本身已幫人審慎判斷','廣告激起想要的感覺，因此不必再查是否真正需要'],why:['成功形象不會把非必需品變成需要。','價格高不證明購買決定經過審慎評估。','廣告正可能模糊需要與想要的界線。']},
 {wrong:['新裝置或更好用，因此舊裝置可用時更換不算風險','舊裝置仍可使用，換新只影響廢物而不影響儲蓄','追潮流可能增加支出，但收入也會隨購買而提高'],why:['新功能的益處仍須與額外支出比較。','購買新裝置會動用預算和儲蓄。','購買行為本身不會增加收入。']},
 {wrong:['製造耗用原料，但包裝和運送通常不增加資源消耗','產品價格較低，可推知製造和運送所用能源較少','重複購買會增加廢物，卻不會增加製造所需原料'],why:['包裝與運輸同樣涉及資源和能源。','售價不能直接代表能源使用量。','額外製造通常需要額外原料。']},
 {wrong:['衣物提早丟掉會增加購買，但處理負擔可由回收抵銷','潮流改變棄置時間，衣服仍可穿便減少廢物總量','新衣生產或有污染，但丟棄舊衣本身沒有相關影響'],why:['提前棄置可增加待處理衣物。','仍可穿而丟棄不會自行減少廢物。','棄置處理也可能帶來污染。']},
 {wrong:['就業和產品改良有益，過度支出的風險便較輕微','環境代價較重，足以說明產品改良對用戶實際無益','廣告帶動工作機會，可推論整體環境影響也會改善'],why:['原文判斷財務與環境代價在此更重。','代價較重不等於正面效果不存在。','就業增加不能證明環境負擔下降。']},
 {wrong:['需求支持就業，用品特價時過量購買較不傷預算','產品改良可吸引顧客，因此額外棄置應視為必要成本','收入與廢物可能同升，分析時可只挑較重要一方'],why:['折扣不消除過量支出的風險。','產品改良不使過早棄置變成必需。','兩條因果鏈應分別分析，再作權衡。']},
 {wrong:['廣告說新款帶來幸福，可當作購買需要的證據','貸款可分期付款，因此儲蓄較少也無須考慮風險','新產品或有用，見到廣告便宜時應先買再評估'],why:['廣告宣稱不能直接證明需要。','分期仍有還款壓力。','先評估需要和預算才合乎論證。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[6].explanations[1]='題目說衣物提早丟掉，不能假定回收能抵銷負擔。';
export default {key:'advantage-disadvantage:16',meta:{topic:'廣告推動消費文化的經濟與環境權衡',summary:'範文承認商品需求可支援就業並推動產品改良；作者認為廣告可能令非必要品被視為成功象徵，引出不必要支出，而持續製造與提早棄置則加重環境負擔。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
