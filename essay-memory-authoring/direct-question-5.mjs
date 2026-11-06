// Human-authored support for Direct Question 5. Requires the canonical P2 S5 split into two sentences.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-5-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:5'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'In shops, a price is not just a number; it can tell buyers something about a product.',
  'I think price strongly affects buyers, especially if it makes an item seem well made or makes its owner look important. But people also consider what they need, what they trust, and their past experience.',
  'A high price can make people interested because many think expensive things are better made.',
  'When buyers do not know much about a product, they may judge it by its price: they may think an expensive phone, watch or bag is better made, lasts longer or looks more impressive.',
  'This is especially common with very expensive goods, where a high price is itself part of what attracts people.',
  'For example, a cheap diamond necklace may worry buyers instead of exciting them, because its low price makes it seem less rare.',
  'In this way, a price can make people want something by making it seem valuable.',
  'It tells buyers not only how much the item costs, but also what owning it may tell other people about the buyer.',
  'But price alone usually does not decide whether someone buys a product.',
  'Buyers also consider how useful it is, whether the brand has a good name, what other customers say, and how owning it will make them feel.',
  'For example, a parent buying a laptop for a child may care less about style and more about battery life, whether it works well, and help after buying it.',
  'Likewise, strong ads may first catch someone’s attention, but bad reviews can quickly make them less interested.',
  'Ease matters too: people often choose things they can get easily and use easily, and that fit their daily lives.',
  'To sum up, price matters a lot because it can make a product seem well made and make its owner look important to others.',
  'Even so, people finally buy when price and other things like trust, usefulness, a brand’s good name and ease all work together.',
  'A high price may first draw people in, but other things usually decide if they actually buy.',
];
const vocabulary=[
  [['consumer markets','shops','消費市場'],['more than a number on a label','not just a number','不只是標籤數字'],['functions as a signal','tell buyers something','具有信號作用']],
  [['I would argue','I think','我認為'],['strongly influences potential buyers','strongly affects buyers','強烈影響潛在買家'],['suggests status or quality','makes an item seem well made or makes its owner look important','暗示地位或品質'],['practical factors','what they need','實際因素'],['personal experience','past experience','個人經驗']],
  [['attract consumers','make people interested','吸引消費者'],['associate cost with quality','think expensive things are better made','把價格與品質聯繫']],
  [['specialist knowledge','know much about a product','專業知識'],['use price as a shortcut','judge it by its price','把價格當捷徑'],['more durable','lasts longer','更耐用'],['more prestigious','looks more impressive','更有聲望']],
  [['particularly true','especially common','尤其如此'],['luxury markets','very expensive goods','奢侈品市場'],['the price itself becomes part of the appeal','a high price is itself part of what attracts people','價格本身成為吸引力']],
  [['for instance','For example','例如'],['make buyers suspicious rather than excited','worry buyers instead of exciting them','使買家懷疑而非興奮'],['weakens the image of rarity','makes it seem less rare','削弱稀有形象']],
  [['In this sense','In this way','從這個角度'],['create desire','make people want something','創造購買慾望'],['aura of value','seem valuable','價值光環']],
  [['not only what the item costs','not only how much the item costs','不只是物品價格'],['what owning it might say about them','what owning it may tell other people about the buyer','擁有它所傳達的身分訊息']],
  [['However','But','然而'],['price alone','price alone','單靠價格'],['carries a purchase decision from beginning to end','decide whether someone buys a product','完全決定是否購買']],
  [['usefulness','how useful it is','實用性'],['reputation of the brand','the brand has a good name','品牌聲譽'],['reviews from other customers','what other customers say','其他顧客評價'],['emotional experience attached to ownership','how owning it will make them feel','擁有後的情感體驗']],
  [['for example','For example','例如'],['care less about whether it looks fashionable','care less about style','較不在意外觀時尚'],['reliability','whether it works well','可靠性'],['after-sales support','help after buying it','售後支援']],
  [['Similarly','Likewise','同樣地'],['strong advertising','strong ads','強力廣告'],['initially catch the eye','first catch someone’s attention','一開始吸引目光'],['poor reviews','bad reviews','差劣評價'],['pour cold water on that interest','make them less interested','使興趣冷卻']],
  [['Convenience','Ease','便利性'],['easy to obtain','get easily','容易取得'],['simple to use','use easily','容易使用'],['compatible with their daily routines','fit their daily lives','配合日常生活']],
  [['In conclusion','To sum up','總結來說'],['powerful influence','matters a lot','影響力很大'],['suggest quality','seem well made','暗示品質'],['prestige','look important','聲望'],['social meaning','make its owner look important to others','社會意義']],
  [['Nevertheless','Even so','然而'],['ultimately buy products','finally buy','最終購買'],['reputation','a brand’s good name','聲譽'],['convenience','ease','便利性'],['works together with','all work together','共同發揮作用']],
  [['open the door','draw people in','先吸引人'],['other factors','other things','其他因素'],['walk through it','actually buy','真正完成購買']],
];
const chunkOverrides=[
  ['In consumer markets, price is more than a number on a label;','it often functions as a signal.'],
  ['I would argue that price strongly influences potential buyers,','especially when it suggests status or quality,','but the final decision is also shaped by practical factors','such as need, trust and personal experience.'],
  ['A high price can attract consumers','because many people associate cost with quality.'],
  ['When buyers do not have specialist knowledge,','they may use price as a shortcut:','an expensive phone, watch or handbag','is assumed to be better designed, more durable or more prestigious.'],
  ['This is particularly true in luxury markets,','where the price itself becomes part of the appeal.'],
  ['A cheap diamond necklace, for instance,','may make buyers suspicious rather than excited,','because its low price weakens the image of rarity.'],
  ['In this sense, price can create desire','by giving a product an aura of value.'],
  ['It tells buyers not only what the item costs,','but also what owning it might say about them.'],
  ['However, price alone rarely carries','a purchase decision from beginning to end.'],
  ['Buyers are also influenced by the usefulness of the product,','the reputation of the brand, reviews from other customers','and the emotional experience attached to ownership.'],
  ['A parent choosing a child’s laptop, for example,','may care less about whether it looks fashionable','and more about battery life, reliability and after-sales support.'],
  ['Similarly, a product with strong advertising','may initially catch the eye,','but poor reviews can quickly pour cold water on that interest.'],
  ['Convenience also matters: people often choose items','that are easy to obtain, simple to use','and compatible with their daily routines.'],
  ['In conclusion, price has a powerful influence','because it can suggest quality, prestige and social meaning.'],
  ['Nevertheless, people ultimately buy products','when price works together with trust, usefulness,','reputation and convenience.'],
  ['A high price may open the door,','but other factors usually decide','whether buyers walk through it.'],
];
const simpleChunkOverrides=[
  ['In shops, a price is not just a number;','it can tell buyers something about a product.'],
  ['I think price strongly affects buyers,','especially if it makes an item seem well made','or makes its owner look important.','But people also consider what they need,','what they trust, and their past experience.'],
  ['A high price can make people interested','because many think expensive things are better made.'],
  ['When buyers do not know much about a product,','they may judge it by its price:','they may think an expensive phone, watch or bag','is better made, lasts longer or looks more impressive.'],
  ['This is especially common with very expensive goods,','where a high price is itself part of what attracts people.'],
  ['For example, a cheap diamond necklace may worry buyers','instead of exciting them,','because its low price makes it seem less rare.'],
  ['In this way, a price can make people want something','by making it seem valuable.'],
  ['It tells buyers not only how much the item costs,','but also what owning it may tell other people about the buyer.'],
  ['But price alone usually does not decide','whether someone buys a product.'],
  ['Buyers also consider how useful it is,','whether the brand has a good name,','what other customers say,','and how owning it will make them feel.'],
  ['For example, a parent buying a laptop for a child','may care less about style','and more about battery life, whether it works well,','and help after buying it.'],
  ['Likewise, strong ads may first catch someone’s attention,','but bad reviews can quickly make them less interested.'],
  ['Ease matters too: people often choose things','they can get easily and use easily,','and that fit their daily lives.'],
  ['To sum up, price matters a lot','because it can make a product seem well made','and make its owner look important to others.'],
  ['Even so, people finally buy','when price and other things like trust, usefulness,','a brand’s good name and ease all work together.'],
  ['A high price may first draw people in,','but other things usually decide','if they actually buy.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){
  const text=original[i],parts=[];
  let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);
    if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));
    parts.push(part(link,'link','句型固定部分'));
    cursor=at+link.length;
  }
  if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));
  return {formula,meaning,usage,parts};
}
function card(example,functionName,distractors,frame){
  return {example,distractors,frame,patternType:'reviewed',
    answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,
    distractorReason:`這句${functionName}；它表達的是另一種關係。`};
}

const structures=[
  card('In education, a test score is more than a number on paper; it often functions as a signal.','用 is more than ...; it often functions as 說明事物在字面之外傳遞的訊息',[3,8,15],
    fixed(0,'In [領域], [事物] is more than [字面形式]; it often functions as [訊號].','先指出一個事物的表面形式，再說它也會被人用來推測其他意義。','要說明數字、標籤或外觀如何影響他人判斷時。',['In ', ', ', ' is more than ', '; it often functions as '],['討論領域','被解讀的事物','字面形式','它傳遞的訊號'])),
  card('I would argue that school location strongly affects families, especially when travel is difficult, but the final choice is also shaped by safety and teaching quality.','用 strongly influences ... especially when ... but 說明主要因素及其他共同因素',[2,7,14],
    fixed(1,'I would argue that [主要因素影響], especially when [特別明顯的條件], but [最後決定] is also shaped by [其他因素].','先評估一個因素的影響，再指出它在哪種情況較強，最後補上決定仍受其他因素影響。','題目問一個因素有多重要，同時要求討論其他影響因素時。',['I would argue that ', ', especially when ', ', but ', ' is also shaped by '],['主要因素及影響','影響特別強的條件','最後決定','其他影響因素'])),
  card('A high rating can attract readers because many people assume popular books are worth reading.','用 can attract ... because 解釋一種信號何以吸引選擇者',[5,6,8],
    fixed(2,'[可見訊號] can attract [選擇者] because [對品質的推斷].','前半句說某訊號能吸引人，because 後交代他們從訊號推斷甚麼。','要解釋評分、價格或聲譽何以在購買前影響興趣時。',[' can attract ', ' because '],['可見訊號','被吸引的人','由訊號引起的推斷'])),
  card('When parents do not know a school well, they may use its exam results as a shortcut: high scores are assumed to mean better teaching.','用 When 設資訊不足的情況，再用 shortcut: 交代替代判斷及其假設',[0,9,10],
    fixed(3,'When [缺少直接知識], they may use [替代訊號] as a shortcut: [由此作出的假設].','先指出資訊不足，再說人們用甚麼容易看到的訊號代替深入查證。','要分析消費者為何依賴一個未必可靠的表面指標時。',['When ', ', they may use ', ' as a shortcut: '],['資訊不足的情況','被當成捷徑的訊號','由訊號作出的假設'])),
  card('This is particularly true in elite schools, where exclusivity itself becomes part of the appeal.','用 particularly true in ... where 指出某機制在特定市場尤其明顯',[1,11,13],
    fixed(4,'This is particularly true in [特定市場], where [使機制更強的特徵].','先限定一種市場，再解釋為甚麼前述判斷在當中更明顯。','已說明一個一般機制，接着要指出它在哪類市場最突出時。',['This is particularly true in ', ', where '],['特別明顯的市場','該市場的吸引機制'])),
  card('A very cheap bicycle, for instance, may make parents cautious rather than pleased, because the price raises questions about safety.','用 may make ... rather than ... because 說明反常價格引發的情緒與原因',[2,10,11],
    fixed(5,'[具體例子], for instance, may make [疑慮反應] rather than [原可期待的反應], because [引起疑慮的原因].','用一個例子說明看似有利的價格反而引起擔憂，並交代擔憂從何而來。','要舉例說明過低價格有時會削弱信任或吸引力時。',[', for instance, ', 'may make ', ' rather than ', ', because '],['具體例子','疑慮反應','原可期待的反應','引起疑慮的原因'])),
  card('In this sense, a high entrance fee can create desire by making an event seem exclusive.','用 can create desire by 交代訊號如何產生想要的心理結果',[0,2,13],
    fixed(6,'In this sense, [訊號] can create [心理反應] by [引起反應的方式].','先提出某種心理反應，再以 by 說明訊號如何使它出現。','要說明外在標誌如何改變人對一件事物的感受時。',['In this sense, ', ' can create ', ' by '],['產生作用的訊號','被引發的心理反應','引發反應的方式'])),
  card('A school badge tells visitors not only which school a child attends, but also what group they belong to.','用 not only ... but also 由表面資訊延伸到身分意義',[1,6,15],
    fixed(7,'[事物] tells [觀察者] not only [表面資訊], but also [較深的身分訊息].','前半句交代直接可見的資訊，後半句補上人們從中讀出的社會或身分意義。','要指出一個標籤、價格或物件除了事實，也傳遞身分訊息時。',[' tells ', ' not only ', ', but also '],['傳遞訊息的事物','接收訊息的人','表面資訊','較深的身分訊息'])),
  card('However, test scores alone rarely show everything a school has taught.','用 However ... alone rarely 限制單一指標的解釋力',[3,4,13],
    fixed(8,'However, [單一因素] alone rarely [完成整個判斷].','轉折後明確指出一個因素不足以獨力決定或解釋整件事。','前段已說明某因素有影響，下一段要指出它仍不足以獨自決定結果時。',['However, ', ' alone rarely '],['單一因素','它難以單獨完成的判斷'])),
  card('Parents are also influenced by travel time, safety and a school’s reputation.','用 are also influenced by 補上決定所受的其他具體因素',[1,10,14],
    fixed(9,'[作決定的人] are also influenced by [其他具體因素].','在已討論的因素之外，列出同樣會改變人們決定的其他考慮。','要把「還有其他因素」具體列出，避免空泛補充時。',[' are also influenced by '],['作決定的人','其他具體因素'])),
  card('A family choosing a new home, for example, may care less about paint colour and more about transport and safe streets.','用 may care less about ... and more about 對比表面吸引與實際需要',[3,5,12],
    fixed(10,'[具體選擇者], for example, may care less about [次要外觀] and more about [實際需要].','用一個選擇情境，指出當事人可能把實用條件放在外觀之前。','要用具體例子說明不同買家並非只受表面吸引時。',[', for example, ', 'may care less about ', ' and more about '],['具體選擇者','較次要的外觀','更重要的實際需要'])),
  card('Similarly, a bright poster may initially attract visitors, but reports of long waits can quickly put them off.','用 may initially ... but ... can quickly 對照初次吸引與後續資訊的反作用',[2,4,10],
    fixed(11,'Similarly, [初步刺激] may initially [引起興趣], but [後續負面資訊] can quickly [削弱興趣].','先承認宣傳或外觀能吸引注意，再指出負面證據可迅速改變看法。','要解釋最初吸引與最終決定為何可能不同時。',['Similarly, ', ' may initially ', ', but ', ' can quickly '],['初步刺激','引起的興趣','後續負面資訊','興趣受削弱的結果'])),
  card('Convenience also matters: families often choose clinics that are near home, easy to contact and open after work.','用 Convenience also matters: 列出便利性如何落在三個具體條件上',[3,9,14],
    fixed(12,'Convenience also matters: [選擇者] often choose [選項] that are [方便一], [方便二] and [方便三].','先點出便利性，再把它具體化為取得、使用及日常配合等條件。','要把「方便」拆成可檢查的購買或使用條件時。',['Convenience also matters: ', ' often choose ', ' that are ', ', ', ' and '],['選擇者','被選選項','第一項便利','第二項便利','第三項便利'])),
  card('In conclusion, school location has a powerful influence because it affects travel time and daily costs.','用 In conclusion ... because 在結尾概括主要因素何以重要',[1,6,14],
    fixed(13,'In conclusion, [主要因素] has a powerful influence because [原因].','結尾再次判斷一個因素影響很大，並簡潔重申其作用來源。','文章末段須直接回應「某因素影響有多大」並給出理由時。',['In conclusion, ', ' has a powerful influence because '],['主要因素','它影響很大的原因'])),
  card('Nevertheless, families ultimately choose homes when price works together with safety, location and school access.','用 Nevertheless ... ultimately ... when 總結多項因素如何共同促成選擇',[1,9,13],
    fixed(14,'Nevertheless, [作選擇的人] ultimately [決定] when [多項因素共同成立].','承認前述因素重要，轉而指出最終選擇通常由幾種條件一起促成。','結尾要避免單因解釋，並收束幾項共同影響決定的因素時。',['Nevertheless, ', ' ultimately ', ' when '],['作選擇的人','最終決定','共同作用的條件'])),
  card('A striking poster may open the door, but the event programme and timing usually decide whether families walk through it.','用 open the door ... decide whether ... walk through 比喻初次吸引與最後行動',[2,8,11],
    fixed(15,'[最初吸引] may open the door, but [其他因素] usually decide whether [最後行動].','以開門比喻第一步的吸引，再指出是否真正行動仍由別的條件決定。','想在結尾用短而清楚的比喻，區分注意到某物與真正選擇它時。',[' may open the door, but ', ' usually decide whether '],['最初吸引的因素','決定結果的其他因素','真正完成的行動'])),
];
const wrongReasons=[
  ['When ... shortcut 說資訊不足時的替代判斷，沒有先說事物在字面以外傳遞甚麼。','However ... alone rarely 限制單一因素，沒有說它兼有訊號作用。','open the door 是結尾比喻初次吸引，不是解釋標籤數字的雙重意義。'],
  ['can attract ... because 只說吸引機制，沒有評估最終決定的其他因素。','not only ... but also 補一層身分訊息，沒有回答主要因素影響有多大。','Nevertheless ... when 在結尾收束共同因素，沒有 especially when 的特別強化條件。'],
  ['低價例子引發懷疑，沒有概括高評分或高價格何以吸引。','can create desire by 說心理反應形成方式，沒有 because 說人們對品質的推斷。','However ... alone rarely 說單一因素不足，沒有解釋為何它先吸引人。'],
  ['In ... more than 討論字面以外的訊號，沒有資訊不足者如何用捷徑。','are also influenced by 列其他因素，沒有在缺知識時以單一指標作假設。','care less ... more 對比一名選擇者的偏好，沒有把價格當替代資訊。'],
  ['主要因素與其他因素的總評，沒有指出某機制在哪類市場特別明顯。','may initially ... but ... 談後續證據改變興趣，沒有 where 所指的市場特徵。','In conclusion ... because 總結主要因素，沒有用特定市場說明例外強度。'],
  ['can attract ... because 解釋通常的吸引，沒有便宜反令買家懷疑的反向例子。','care less ... more 比較實用與外觀偏好，沒有 suspicious rather than excited 的心理反轉。','may initially ... but ... 說評價推翻廣告吸引，沒有過低價格削弱稀有感。'],
  ['is more than ... functions as 解釋訊號的雙重作用，沒有用 by 交代慾望形成機制。','can attract ... because 說人從價格推斷品質，沒有把訊號連到心理慾望。','In conclusion ... because 概括影響原因，沒有特定心理反應如何被創造。'],
  ['主要因素與其他因素並列，沒有 not only ... but also 的兩層訊息。','can create desire by 說慾望的機制，沒有同一物件傳出的表面與身分資訊。','開門比喻初次吸引及最終行動，沒有物件對觀察者傳遞的雙層訊息。'],
  ['When ... shortcut 分析資訊不足時的假設，沒有限制某因素不能獨力決定。','particularly true in 指出某市場尤其明顯，沒有轉折說因素本身不足。','In conclusion ... because 肯定主要因素影響強，沒有 alone rarely 的限制。'],
  ['主要因素與其他因素的完整立場，沒有把其他具體因素直接列出。','care less ... more 比較個別買家的兩類重視點，沒有概括多項因素。','Nevertheless ... when 收束共同作用，沒有 are also influenced by 的補充清單。'],
  ['When ... shortcut 指資訊不足時借用替代訊號，沒有較少與較多重視的對照。','低價例子比較懷疑與興奮，沒有實際需求壓過外觀的選擇。','Convenience also matters 列便利條件，沒有買家由外觀轉向實用的偏好比較。'],
  ['can attract ... because 只說最初吸引的理由，沒有後來負面證據的反作用。','particularly true in 說特定市場更明顯，沒有興趣先升後降。','care less ... more 是同一人的偏好排序，沒有後續評價使興趣冷卻。'],
  ['When ... shortcut 是缺資訊時用單一訊號，沒有把便利拆成三個條件。','are also influenced by 列一般其他因素，沒有 Convenience 的具體取得與使用條件。','Nevertheless ... when 概括因素共同作用，沒有逐一列出便利性細節。'],
  ['主要因素與其他因素的總評，沒有在結尾用 because 重申影響原因。','can create desire by 描述一種心理機制，沒有收束整體影響判斷。','Nevertheless ... when 補上共同因素，沒有先總結單一主要因素何以強大。'],
  ['開場立場說主要與其他因素，沒有結尾歸納共同促成最後選擇。','are also influenced by 只是列出其他因素，沒有 when 所指的共同成立條件。','In conclusion ... because 重申主要因素，沒有說最終選擇仍依靠多種因素。'],
  ['can attract ... because 解釋吸引原因，沒有把初次吸引和最終行動分開。','However ... alone rarely 直接限制單一因素，沒有開門與走進的比喻。','may initially ... but ... 說負面證據使興趣冷卻，沒有 open the door 的兩步行動比喻。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求範文回答哪兩個部分？',[
    '價格對買家影響有多大，以及價格以外哪些因素也會影響選擇',
    '如何制定所有產品的最高價格，以及誰應支付廣告費用',
    '奢侈品為何不能降價，以及所有買家是否都追求身分',
    '產品是否都應免費，以及商店應否取消顧客評價',
  ],'第一問評估價格影響的程度；第二問要求具體分析價格以外的因素。'),
  {type:'multi',prompt:'選出兩段主體的論證分工',detail:'選兩項，再按「確認」。',options:[
    '高價格可能暗示品質與地位，甚至本身就成為吸引力',
    '最後購買仍要看用途、信任、評價及是否方便取得和使用',
    '高價格必然代表品質更好，因此不需要查證產品',
    '顧客評價只影響廣告公司，對買家沒有任何作用',
  ],correct:[0,1],why:'第一主體段解釋價格的訊號作用；第二主體段說明價格不足以單獨決定購買。'},
];
const route=[sequence('按原文次序排好四段的任務',[
  ['引言立場','價格不只是標籤上的數字；它影響買家，但最終決定也取決於其他條件。'],
  ['價格如何吸引','資訊不足時買家會用價格推斷品質；奢侈品的高價也可能暗示身分。'],
  ['其他因素如何決定','產品用途、品牌、評價、擁有感受和便利性都能改變購買決定。'],
  ['結尾收束','價格可能先引起興趣，是否真正購買仍須多種因素共同支持。'],
],'先承認價格的訊號作用 → 解釋高價吸引 → 補上實用與信任因素 → 區分初次興趣和最終購買。')];
const evidence=[
  quiz('買家缺乏專業知識時，為何可能受高價格吸引？',[
    '把價格當作判斷捷徑，推測商品設計、耐用度或地位較高',
    '因為高價可直接證明商品經過所有可能的品質檢查',
    '因為買家完全不會考慮商品的設計、耐用度或形象',
    '因為低價與高價在任何市場都會傳遞完全相同的訊息',
  ],'原文說人們會「推測」品質與地位，並非高價客觀證明商品較好。'),
  quiz('便宜的鑽石項鏈為何可能反而使買家懷疑？',[
    '低價削弱稀有感，與買家對鑽石的期待不一致',
    '任何低價商品都依法不能稱為項鏈，買家因此懷疑',
    '鑽石買家只看重量，價格和稀有形象完全沒有作用',
    '所有人都已知道那條項鏈品質差，原文毋須解釋',
  ],'例子展示奢侈品價格的訊號作用：過低可能削弱稀有形象。'),
  quiz('原文說價格傳達甚麼超出成本的訊息？',[
    '擁有該商品可能讓別人如何看待買家及其身分',
    '商品的精確生產成本及每個員工的薪酬',
    '商店將來所有貨品的固定折扣和退貨安排',
    '買家必然擁有相同的個人經驗與生活習慣',
  ],'價格可暗示價值與社會意義，不只是告訴買家要付多少錢。'),
  quiz('家長為孩子選手提電腦的例子強調甚麼？',[
    '電池、可靠性及售後支援可能比外觀時尚更重要',
    '外觀一定是所有家長唯一願意考慮的條件',
    '產品價格越高，電池壽命就必然越長',
    '家長買電腦時不可能在乎售後支援',
  ],'不同買家有不同實際需要；家長的例子把功能放在時尚之前。'),
  quiz('強力廣告與差劣評價之間有甚麼關係？',[
    '廣告可先吸引注意，但負面評價能迅速削弱興趣',
    '廣告一旦吸引目光，顧客便不會再閱讀任何評價',
    '差劣評價只會增加買家的信任，不會改變決定',
    '廣告與顧客評價都只能影響產品生產成本',
  ],'原文把初次吸引與後續查證分開，說明兩者可朝相反方向作用。'),
  quiz('原文把「便利」具體分成哪些條件？',[
    '容易取得、使用簡單，而且能配合日常生活習慣',
    '價格昂貴、包裝華麗，而且只能在很遠的地方買到',
    '廣告頻繁、品牌名字很長，而且顧客不用商品',
    '必須有專業知識、操作複雜，而且無法配合日常安排',
  ],'便利不只是抽象稱讚；原文列出取得、使用與日常配合三個可檢查的方面。'),
];
const logic=[
  sequence('第一主體段：高價格如何由數字變成吸引力',[
    ['訊號起點','高價格使一些買家聯想到較好的品質。'],
    ['資訊不足','沒有專業知識的人把價格當捷徑，推測設計、耐用度和地位。'],
    ['市場條件','奢侈品市場中，價格本身也可能成為吸引力。'],
    ['反向例子','太便宜的鑽石項鏈削弱稀有形象，反而令人懷疑。'],
    ['心理結果','價格不只顯示成本，也可能傳出價值與身分訊息。'],
  ],'先說高價暗示品質，再指出資訊不足與奢侈品市場如何加強訊號，最後用低價反例說清心理機制。'),
  sequence('第二主體段：價格之外甚麼讓興趣變成購買',[
    ['先限制單因','單靠價格很少能完整支撐購買決定。'],
    ['列其他因素','實用性、品牌聲譽、顧客評價和擁有時的感受也重要。'],
    ['具體買家需要','家長選兒童電腦可能把電池、可靠性和售後支援放在時尚之前。'],
    ['後續資訊','廣告可先吸引目光，差評卻能使興趣迅速冷卻。'],
    ['便利性','取得容易、操作簡單、配合日常安排會影響最後選擇。'],
    ['回到總結','價格也許先開門，多種因素共同決定買家會否走進去。'],
  ],'先承認價格不足，再用產品功能、評價與便利解釋買家為何可能改變最後決定。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('家長比較兩所學校，只知道其中一所學費很高，尚未看課程或教學資料。','哪項最能應用範文對價格訊號的警惕？',[
    '承認高學費可能暗示品質，再查教學、支援與家長經驗',
    '只因學費較高便肯定教學更好，不必再看任何實際資料',
    '只選學費最低的學校，假設費用與教學不可能有任何關係',
    '把學費當成唯一可靠資訊，忽略孩子的需要與學校安排',
  ],[
    '高價格可作訊號，但仍須用實際品質與經驗驗證。',
    '原文說人們可能作出品質推測，並非高價保證品質。',
    '否認價格有訊號作用，也忽略題目問其影響程度。',
    '單一價格不能代替孩子需要與真實服務條件。',
  ],[1,2,3,8],'範文解釋買家資訊不足時會用價格推測品質，但又說價格不足以單獨決定；學費也須配合教學資料判斷。'),
  transfer('文化中心把一場名人講座定為高票價，有些人因此認為活動更值得參加。','哪項解釋最貼近範文的奢侈品邏輯？',[
    '票價本身可能帶來稀有與地位感，從而增加部分人的興趣',
    '票價較高必然表示每位講者更有知識，活動內容無須評估',
    '只要有人願意付費，講座便不需要清楚說明實際內容',
    '所有觀眾都只在乎門票便宜，票價不可能影響活動形象',
  ],[
    '部分人會從高價讀出稀有或身分訊息，與原文的訊號機制相同。',
    '高價是可能的心理訊號，不能保證講者知識。',
    '興趣可由價格引起，實際內容仍會影響決定。',
    '原文特別指出某些市場裡高價本身就是吸引力。',
  ],[2,4,6,7],'範文說在某些市場價格本身成為吸引力，並讓人聯想到價值或地位；講座票價可能有相似的心理作用。'),
  transfer('一部二手單車價格遠低於同類產品，買家反而擔心煞車和維修狀況。','哪項最能轉用便宜鑽石項鏈的例子？',[
    '低價可能引發品質疑慮，買家應檢查車況再判斷是否划算',
    '價錢低便必然代表車況完美，任何安全檢查都多此一舉',
    '買家只要看到折扣便會高興，不可能對產品質素有懷疑',
    '單車價格與車況一定完全無關，所以毋須查看任何資料',
  ],[
    '過低價格可以削弱信任，反應由商品語境和品質疑慮決定。',
    '便宜不能保證安全，題目已指出具體疑慮。',
    '原文的低價例子正是懷疑而非興奮。',
    '即使價格未必準確反映品質，買家仍須查證車況。',
  ],[3,5],'範文以便宜鑽石說明低價有時不是好消息，而是使人懷疑商品價值；二手車也可能出現相似疑慮。'),
  transfer('公益晚宴以昂貴門票營造聲望，但一些支持者想知道捐款實際如何使用。','哪套說法最能兼顧範文兩條主線？',[
    '高價或帶來身分吸引力，透明用途與機構信任仍影響購票',
    '只要票價夠高，捐款去向與活動安排便完全不用說明',
    '只說捐款用途，不承認價格可能影響活動的身分形象',
    '把購票意願全歸因於票價，不理會支持者提出的疑問',
  ],[
    '價格可先吸引，但信任和用途資訊仍決定是否付費。',
    '高價不能取代公益機構對金錢用途的交代。',
    '否定價格訊號，未完整回應題目中的身分吸引。',
    '支持者明確關心透明度，不能只用價格解釋。',
  ],[1,4,8,9,14],'範文一方面承認高價有訊號作用，另一方面強調信任和實際條件共同塑造最後決定。'),
  transfer('家長選兒童單車時看到外觀漂亮的款式，但也擔心煞車可靠性與維修服務。','哪項最貼近原文家長買電腦的比較？',[
    '把煞車與維修支援放在外觀之前，再評估是否適合孩子',
    '只按車身顏色決定，假設漂亮外觀足以證明煞車可靠',
    '只選價格最高的單車，不用問孩子能否安全使用',
    '只看廣告照片而不查售後服務，因為外觀最能保護孩子',
  ],[
    '具體使用與可靠性需求，可比表面時尚更重要。',
    '外觀不能證明煞車安全。',
    '價格也不能代替孩子的使用需要。',
    '照片不會提供維修或可靠性保障。',
  ],[9,10],'範文用家長買電腦說明外觀並非唯一考慮，電池、可靠性和售後支援等實用條件可能更重要。'),
  transfer('網上課程廣告很吸引，報名者卻發現不少舊學員說導師經常缺席。','哪種分析最能轉用廣告與評價的關係？',[
    '廣告或先引起興趣，但缺席評價可迅速削弱報名意願',
    '廣告只要夠鮮明，舊學員的經驗便不會影響任何人',
    '舊學員評價只決定廣告價格，不會影響課程信任',
    '報名者應忽略導師是否出席，只按廣告圖片作選擇',
  ],[
    '初次吸引與後續查證可朝相反方向作用，符合原文。',
    '負面評價直接涉及課程交付，不能假定沒有影響。',
    '學員經驗會改變對服務品質的信任。',
    '導師出席與學習成效相關，廣告圖片不能代替。',
  ],[9,11],'範文指出強力廣告可先抓住目光，差評卻可迅速令興趣冷卻；課程同樣要看實際使用者經驗。'),
  transfer('偏遠地區居民比較兩間診所：一間裝修豪華但很遠，另一間交通方便且預約簡單。','哪項最直接運用範文對便利性的拆解？',[
    '比較路程、預約難度和診症時段，看看哪間能配合日常安排',
    '只看候診室是否豪華，假設交通時間從不影響病人',
    '只選診費最高的一間，不必考慮居民能否方便到達',
    '只查診所標誌設計，不問預約或到診過程是否容易',
  ],[
    '便利是可到達、易使用和配合生活的具體條件。',
    '裝修不能代替偏遠居民實際出行需要。',
    '診費高低不足以保證容易到達。',
    '標誌不能說明預約及到診是否方便。',
  ],[8,12],'範文把便利拆成容易取得、使用簡單及配合日常生活；診所也應以實際到達和使用條件評估。'),
  transfer('一款新電器價格高，品牌又很有名，但買家讀到大量關於故障的顧客評價。','哪項最符合範文對多因素決定的看法？',[
    '高價與品牌可先吸引，故障評價仍可能改變最後購買決定',
    '只要品牌有名，顧客評價便絕不可能影響最終選擇',
    '只要價格高，產品的實用性和可靠性便毋須再查證',
    '完全不看價格或品牌，只憑一張廣告照片決定購買',
  ],[
    '價格與聲譽是訊號，但實際評價可能推翻初次好感。',
    '原文清楚把顧客評價列為影響因素。',
    '高價並不能客觀保證產品可靠。',
    '只看照片同樣是片面的單因判斷。',
  ],[1,8,9,11,14],'範文認為價格、品牌聲譽與其他顧客評價共同影響最後選擇；故障評價可削弱高價帶來的吸引。'),
  transfer('城市推出高價快速巴士票，乘客認為服務可能更好，但班次與轉乘安排仍未公布。','哪個判斷最符合「價格先開門」的結尾比喻？',[
    '票價可能先引起期待，班次與轉乘便利才有助決定是否購票',
    '高價已足以保證乘客購票，班次與轉乘資料都不必提供',
    '只要班次尚未公布，票價便不可能產生任何初步印象',
    '乘客只能看車身顏色，價格與實際路線都不應影響選擇',
  ],[
    '高價可先形成期待，但實際使用條件影響最後行動。',
    '票價不能代替乘客需要的服務資料。',
    '沒有班次資料不代表高價不會傳遞訊號。',
    '車身顏色不足以評估價格和路線的共同作用。',
  ],[1,8,12,15],'範文以開門比喻價格可能帶來初次興趣，但真正購買仍看便利等其他因素。'),
  transfer('博物館設計會員計劃：高級會員費較高，但團隊也想知道訪客是否信任展覽質素、能否方便到訪。','哪套評估最完整轉用整篇範文？',[
    '查收費帶來的品質印象，也查展覽評價、信任和到訪便利',
    '只提高會員費並假設所有訪客一定會認為展覽更有價值',
    '只看會員卡顏色，不評估展覽內容、評價與交通安排',
    '只降低收費便停止收集訪客意見，認定低價足以促成加入',
  ],[
    '同時檢查價格訊號和實際體驗，完整覆蓋文章兩條主線。',
    '提高價格可能有訊號作用，不能保證所有人加入。',
    '會員卡外觀不足以替代品質與便利資訊。',
    '低價也不能保證訪客相信展覽或方便到訪。',
  ],[2,3,8,9,12,13,14,15],'範文先解釋價格如何暗示品質與地位，再說最後決定取決於信任、用途、評價和便利等因素。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["承認高學費可能暗示品質，再查教學、支援與家長經驗","高學費可作初步線索，主要比較校舍外觀和制服設計。","先選學費最低的學校，教學資料可在入讀後再了解。","學費較高可能有較好設備，孩子需要則可稍後評估。"],["票價本身可能帶來稀有與地位感，從而增加部分人的興趣","高票價可能代表成本較高，講者內容才是唯一吸引力。","名人講座本身吸引人，票價高低不會改變身分印象。","高票價可吸引部分人，卻不需提供講座的實際內容。"],["低價可能引發品質疑慮，買家應檢查車況再判斷是否划算","低價或使人覺得更划算，煞車狀況可在買後才檢查。","價格低主要反映賣家急售，買家不需先問維修紀錄。","若折扣很大，車況疑慮可交由日後的售後服務處理。"],["高價或帶來身分吸引力，透明用途與機構信任仍影響購票","晚宴票價較高，支持者只需知道可獲哪些較佳座位。","捐款用途值得交代，票價卻不會影響活動的高級形象。","高價可提升聲望，因此機構信任可留待活動後建立。"],["把煞車與維修支援放在外觀之前，再評估是否適合孩子","先選孩子喜歡的外觀，再以價格估計煞車可靠性。","款式漂亮可提高騎車興趣，維修服務可等故障再問。","高價單車通常配件較好，便可先略過煞車安全試用。"],["廣告或先引起興趣，但缺席評價可迅速削弱報名意願","廣告足以引起興趣，舊學員缺席評價可視為個別經驗。","舊學員評價可信，但報名者應先只看廣告的課程安排。","導師偶爾缺席會影響體驗，廣告仍可代替核查。"],["比較路程、預約難度和診症時段，看看哪間能配合日常安排","裝修豪華可能代表品質，路程較遠則可由較佳服務補回。","交通方便有益，但預約難度與日常就診安排關係較小。","偏遠居民可選較近診所，時段與預約方式留待到診再問。"],["高價與品牌可先吸引，故障評價仍可能改變最後購買決定","品牌知名可先建立信任，故障評價可等買後再驗證。","高價或有品質訊號，產品可靠性仍可由漂亮外觀推測。","評價多提故障，但名牌維修網絡可抵消實際購買風險。"],["票價可能先引起期待，班次與轉乘便利才有助決定是否購票","票價較高顯示服務可能較快，班次可在購票後才確認。","班次與轉乘尚未公布，乘客暫時只能依價格作最終決定。","高價可帶來品質期待，實際路線則由巴士車身外觀推測。"],["查收費帶來的品質印象，也查展覽評價、信任和到訪便利","提高會員費可增加高級感，展覽評價與交通稍後再看。","展覽質素與交通都重要，會費則只反映場館成本。","先提供優惠會費，訪客信任可在加入後慢慢建立。"]];
const editorialTransferReasons=[["校舍制服不能代替教學與支援資料。","費用低不等於適合孩子，應在入讀前查證。","學費只是線索，還須看孩子的需要。"],["高價本身也可能造成稀有和地位感。","名人吸引力之外，價格也能影響形象。","興趣增加仍需清楚交代活動內容。"],["煞車安全應在購買前檢查。","急售只是推測，仍要查車況。","售後服務不代替買前檢查。"],["座位資訊不能取代捐款用途透明度。","高票價也可能塑造身分印象。","信任應在購票時已有基礎。"],["外觀和價格都不能驗證煞車。","維修支援應在購買前比較。","高價配件也不能取代安全評估。"],["大量缺席評價不宜當成單一個別經驗。","廣告安排不能掩蓋導師缺席。","廣告不能取代對可靠性的查證。"],["豪華裝修不能解決偏遠居民的路程。","預約是否容易會影響日常就診。","診症時段與預約應在選擇前了解。"],["故障評價可能直接改變最後決定。","外觀不能證明實用可靠。","維修網絡不能抹去故障風險。"],["購票前仍需知道班次與轉乘。","價格只有初步訊號，不足以作最後決定。","車身外觀不能顯示實際路線。"],["評價和到訪便利會影響實際加入。","會費也可能影響品質印象。","信任與展覽質素應在加入前評估。"]];
editorialTransferOptions.forEach((row,i)=>{transferTasks[i].options=row;transferTasks[i].explanations=[transferTasks[i].explanations[0],...editorialTransferReasons[i]];});
export default {key:'direct-question:5',meta:{topic:'價格與購買決定',summary:'高價可暗示品質與身分，但真正購買也看實用、信任、評價和便利性。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
