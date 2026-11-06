// Full source-specific memorisation support for Discuss Both Views 6.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-6-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:6'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Some people say a company can succeed only if it sells a product that nobody else sells.',
  'A new idea can help a company look different, but I do not think it is the only reason a company does well.',
  'I think a company does well mainly because it knows what buyers need, runs its daily work well and earns people’s trust over many years.',
  'The first big reason is whether a company can give buyers what they really need.',
  'A product does not need to be completely new if it fixes a problem better, more quickly or with less trouble than other products.',
  'Actually, many companies do well by selling everyday things, such as food, clothes or goods for the home, but they sell them in a way buyers can trust and make them easy to get.',
  'For example, a small coffee shop may sell nothing new, but it can make money if it has good coffee, fair prices and a pleasant place to sit.',
  'This shows that doing well often depends less on being different and more on being useful, doing things well each time and meeting what buyers need.',
  'Another big reason is how well a company is run.',
  'Even a very good product may do badly if the people in charge make poor choices, fail to watch money carefully or give careless help to buyers.',
  'Good people in charge make wise choices about prices, teaching workers, telling people about products and keeping spending under control.',
  'They also change what they do when buyers want different things, rather than keeping old ways that no longer work.',
  'For example, a company that quickly changes with online buying and changing buyer habits is more likely to keep going than one that refuses to use new ways.',
  'Also, companies that treat buyers well can earn a good name, and this good name becomes a valuable thing for the company as years pass.',
  'To sum up, a product that no one else has may give a company a head start, but it is not the only way to do well.',
  'The companies that do best know what buyers need, run their work without waste, change wisely and earn buyers’ trust.',
];
const vocabulary=[
  [['Some people argue','Some people say','有人認為'],['business','company','企業'],['successful','succeed','成功'],['unique product','product that nobody else sells','獨特產品']],
  [['originality','new idea','原創性'],['stand out','look different','脫穎而出'],['only factor','only reason','唯一因素'],['commercial success','company does well','商業成功']],
  [['In my view','I think','在我看來'],['succeeds','does well','成功'],['understands its customers','knows what buyers need','了解顧客'],['manages its operations well','runs its daily work well','妥善營運'],['builds long-term trust','earns people’s trust over many years','建立長期信任']],
  [['first major factor','first big reason','第一主要因素'],['meet real customer needs','give buyers what they really need','滿足真實需求']],
  [['completely original','completely new','完全原創'],['solves a problem','fixes a problem','解決問題'],['faster','more quickly','更快'],['more conveniently','with less trouble','更方便'],['competitors','other products','競爭者']],
  [['In fact','Actually','事實上'],['successful businesses','companies do well','成功企業'],['ordinary products','everyday things','普通產品'],['clothing','clothes','衣服'],['household goods','goods for the home','家居用品'],['reliable','can trust','可靠'],['accessible','easy to get','方便取得']],
  [['For example','For example','例如'],['small café','small coffee shop','小咖啡店'],['anything revolutionary','nothing new','革命性產品'],['profitable','make money','獲利'],['fair prices','fair prices','公道價格'],['comfortable atmosphere','pleasant place to sit','舒適環境']],
  [['This shows','This shows','這表明'],['depends less on being unique','depends less on being different','獨特性非首要'],['useful','useful','實用'],['consistent','doing things well each time','穩定一致'],['relevant to the market','meeting what buyers need','符合市場需要']],
  [['Another important factor','Another big reason','另一重要因素'],['quality of management','how well a company is run','管理質素']],
  [['excellent product','very good product','出色產品'],['fail','do badly','失敗'],['poor leadership','people in charge make poor choices','領導不善'],['weak financial control','fail to watch money carefully','財務控制薄弱'],['careless customer service','careless help to buyers','客服疏忽']],
  [['Good managers','Good people in charge','優秀管理者'],['sensible decisions','wise choices','明智決定'],['pricing','prices','定價'],['staff training','teaching workers','員工培訓'],['marketing','telling people about products','市場推廣'],['cost control','keeping spending under control','成本控制']],
  [['adapt','change what they do','作出調整'],['market changes','buyers want different things','市場變化'],['instead of clinging to old methods','rather than keeping old ways that no longer work','不死守舊法']],
  [['For instance','For example','例如'],['responds quickly','quickly changes','快速回應'],['online shopping trends','online buying','網購趨勢'],['changing consumer habits','changing buyer habits','消費習慣變化'],['more likely to survive','more likely to keep going','較能生存'],['refuses to modernise','refuses to use new ways','拒絕現代化']],
  [['In addition','Also','此外'],['treat customers well','treat buyers well','善待顧客'],['strong reputation','good name','良好聲譽'],['powerful asset','valuable thing for the company','寶貴資產'],['over time','as years pass','隨時間']],
  [['In conclusion','To sum up','總結'],['unique product','product that no one else has','獨特產品'],['initial advantage','head start','初步優勢'],['only route to success','only way to do well','唯一成功途徑']],
  [['most successful companies','companies that do best','最成功公司'],['understand their market','know what buyers need','了解市場'],['operate efficiently','run their work without waste','高效營運'],['adapt intelligently','change wisely','明智應變'],['earn the trust','earn buyers’ trust','贏得信任']],
];
const chunkOverrides=[
  ['Some people argue that a business','can only become successful','if it offers a unique product.'],
  ['While originality can certainly help a company stand out,','I do not believe it is the only factor','behind commercial success.'],
  ['In my view, a company succeeds mainly','because it understands its customers,','manages its operations well, and builds long-term trust.'],
  ['The first major factor is whether','a company can meet real customer needs.'],
  ['A product does not have to be completely original','if it solves a problem better, faster,','or more conveniently than its competitors.'],
  ['In fact, many successful businesses sell ordinary products,','such as food, clothing, or household goods,','but they do so in a way','that customers find reliable and accessible.'],
  ['For example, a small café may not offer anything revolutionary,','yet it can become profitable','if it provides good coffee, fair prices,','and a comfortable atmosphere.'],
  ['This shows that success often depends less','on being unique and more on being useful,','consistent, and relevant to the market.'],
  ['Another important factor is','the quality of management.'],
  ['Even an excellent product can fail','if a company has poor leadership,','weak financial control, or careless customer service.'],
  ['Good managers make sensible decisions','about pricing, staff training, marketing,','and cost control.'],
  ['They also adapt when the market changes,','instead of clinging to old methods.'],
  ['For instance, a business that responds quickly','to online shopping trends or changing consumer habits','is more likely to survive','than one that refuses to modernise.'],
  ['In addition, companies that treat customers well','can develop a strong reputation,','and this reputation becomes a powerful asset over time.'],
  ['In conclusion, having a unique product','can give a business an initial advantage,','but it is not the only route to success.'],
  ['The most successful companies are those','that understand their market, operate efficiently,','adapt intelligently, and earn the trust of their customers.'],
];
const simpleChunkOverrides=[
  ['Some people say a company can succeed','only if it sells a product that nobody else sells.'],
  ['A new idea can help a company look different,','but I do not think it is the only reason','a company does well.'],
  ['I think a company does well mainly','because it knows what buyers need,','runs its daily work well','and earns people’s trust over many years.'],
  ['The first big reason is whether','a company can give buyers what they really need.'],
  ['A product does not need to be completely new','if it fixes a problem better, more quickly','or with less trouble than other products.'],
  ['Actually, many companies do well by selling everyday things,','such as food, clothes or goods for the home,','but they sell them in a way buyers can trust','and make them easy to get.'],
  ['For example, a small coffee shop may sell nothing new,','but it can make money if it has','good coffee, fair prices and a pleasant place to sit.'],
  ['This shows that doing well often depends less','on being different and more on being useful,','doing things well each time and meeting what buyers need.'],
  ['Another big reason is','how well a company is run.'],
  ['Even a very good product may do badly','if the people in charge make poor choices,','fail to watch money carefully','or give careless help to buyers.'],
  ['Good people in charge make wise choices','about prices, teaching workers,','telling people about products','and keeping spending under control.'],
  ['They also change what they do','when buyers want different things,','rather than keeping old ways that no longer work.'],
  ['For example, a company that quickly changes','with online buying and changing buyer habits','is more likely to keep going','than one that refuses to use new ways.'],
  ['Also, companies that treat buyers well','can earn a good name,','and this good name becomes a valuable thing for the company','as years pass.'],
  ['To sum up, a product that no one else has','may give a company a head start,','but it is not the only way to do well.'],
  ['The companies that do best know what buyers need,','run their work without waste, change wisely','and earn buyers’ trust.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Some people argue that a school can only become successful if it offers a course no other school has.','以 only ... if 準確提出獨特產品是必要條件的主張',[1,3,14],fixed(0,'Some people argue that [企業] can only become successful if [提供獨特產品].','開篇先陳述待評估的絕對主張：獨特產品是成功必要條件。','題目問獨特產品是否唯一成功路徑，要先把該主張準確寫出時。',['Some people argue that ', ' can only become successful if '],['被評估的企業','被視作必要的條件'])),
  card('While a new idea can help a shop stand out, I do not believe it is the only factor behind commercial success.','以 While ... I do not believe ... 讓步後反對唯一因素',[0,2,14],fixed(1,'While [原創性有助公司突出], I do not believe it is the only factor behind [商業成功].','承認獨特性有好處，但否定它是唯一成功因素。','引言須表明自己如何評價 only，避免把有幫助誤寫成必需時。',['While ', ', I do not believe it is the only factor behind '],['先承認的原創好處','不能只由原創解釋的成果'])),
  card('In my view, a café succeeds mainly because it knows its customers, runs daily work carefully, and earns trust.','以 because 並列顧客營運信任三大成功因素',[1,3,15],fixed(2,'In my view, [公司] succeeds mainly because it [了解顧客], [妥善營運], and [建立長期信任].','預告三條替代論證線：需求、管理、信任。','已否定唯一因素，需在引言列出自己認為更重要的成功條件時。',['In my view, ', ' succeeds mainly because it ', ', ', ', and '],['要解釋成功的公司','第一項顧客因素','第二項營運因素','第三項關係因素'])),
  card('The first major factor is whether a clinic can meet what patients really need.','以 whether 提出顧客需求這一成功判準',[2,4,8],fixed(3,'The first major factor is whether [公司] can meet [真正顧客需求].','第一主體段先界定產品價值取決於能否解決需求。','引言已列多個因素，要先展開顧客需求這一條線時。',['The first major factor is whether ', ' can meet '],['被評估的企業','必須滿足的需求'])),
  card('A service does not have to be new if it solves a patient’s problem better, faster, or more conveniently than alternatives.','以 does not have to ... if ... 反駁完全原創的必要性',[0,3,5],fixed(4,'[產品] does not have to be [完全原創] if it solves [問題] better, faster, or more conveniently than [競爭者].','產品即使普通，只要更有效地解決問題，也可有競爭力。','已提出滿足需求，需解釋為甚麼這不要求產品必須完全獨特時。',[' does not have to be ', ' if it solves ', ' better, faster, or more conveniently than '],['被評估的產品','被否定的必要條件','要解決的顧客問題','比較對象'])),
  card('In fact, many good shops sell ordinary goods such as food and clothes, but they do so in a way that customers find easy and reliable.','以 ordinary products ... but ... 說明普通商品也可成功',[4,6,7],fixed(5,'In fact, [成功企業] sell [食衣家居等普通產品], but they do so in a way that customers find [可靠且方便取得].','成功可來自普通商品的可靠供應與方便購買。','已說產品不必原創，需舉常見商品說明服務方式如何帶來價值時。',['In fact, ', ' sell ', ', but they do so in a way that customers find '],['仍能成功的企業','並不獨特的商品','顧客看重的供應方式'])),
  card('For example, a local bakery may not offer a new kind of bread, yet it can become profitable if it provides good food, fair prices and a pleasant place.','以 yet ... if ... 給出咖啡店的反例',[5,7,9],fixed(6,'For example, [小咖啡店] may not offer [革命性商品], yet it can become profitable if it provides [好咖啡、公道價格與舒適環境].','具體店舖不用革命性產品，也可憑品質、價格與環境賺錢。','普通商品的論點已提出，需用一個日常店舖反駁獨特性必要論時。',['For example, ', ' may not offer ', ', yet it can become profitable if it provides '],['被舉例的店舖','未提供的新奇商品','真正吸引顧客的條件'])),
  card('This shows that success often depends less on novelty and more on useful, steady service.','以 depends less ... more ... 從咖啡店歸納成功標準',[4,6,8],fixed(7,'This shows that success often depends less on [獨特] and more on [實用、穩定與符合市場].','小店例子推翻「只有獨特才成功」的因果判斷。','咖啡店例子已說完，要抽出一般性成功標準時。',['This shows that success often depends less on ', ' and more on '],['被高估的獨特性','更能解釋成功的條件'])),
  card('Another important factor is how well a shop is managed.','以 Another important factor 轉入管理品質',[3,7,9],fixed(8,'Another important factor is [管理質素].','第二主體段轉入產品以外的內部營運因素。','需求和普通產品已說明，現在要提出另一類成功條件時。',['Another important factor is '],['接下來分析的成功因素'])),
  card('Even a great meal can fail if a restaurant has poor leaders, weak money control or careless service.','以 Even ... can fail if ... 說產品好仍會因管理差失敗',[8,10,11],fixed(9,'Even [出色產品] can fail if [公司] has [領導差、財務控制弱或客服疏忽].','好產品不是成功保證；內部管理弱也可使它失敗。','已提出管理質素，需說明產品品質為何不能替代良好營運時。',['Even ', ' can fail if ', ' has '],['本來有優勢的產品','管理失當的企業','使產品失敗的管理缺點'])),
  card('Good managers make sensible decisions about prices, staff training, customer information and costs.','以 make sensible decisions about 列管理的四個實務面向',[9,11,12],fixed(10,'Good managers make sensible decisions about [定價、培訓、推廣與成本控制].','管理不是抽象口號，而是涵蓋價格、員工、宣傳和支出的決策。','管理差的反面已說明，需列出好管理實際包括哪些決定時。',['Good managers make sensible decisions about '],['具體的管理決策範圍'])),
  card('They also adapt when customer habits change, instead of keeping methods that no longer work.','以 when ... instead of ... 對照應變與死守舊法',[10,12,13],fixed(11,'They also adapt when [市場改變], instead of [死守舊方法].','管理者還須隨市場變化調整，而非只做好日常控制。','已列管理日常決策，需補充管理者如何回應外部變化時。',['They also adapt when ', ', instead of '],['觸發調整的市場變化','不應持續的舊做法'])),
  card('For instance, a shop that quickly adds online orders is more likely to survive than one that refuses to change.','以 more likely ... than ... 比較適應與拒變的企業',[10,11,14],fixed(12,'For instance, [快速回應網購及消費習慣的企業] is more likely to survive than [拒絕現代化的企業].','用網購和習慣改變，顯示管理應變對企業生存的作用。','已說管理者應變，需以兩種企業的生存可能作具體比較時。',['For instance, ', ' is more likely to survive than '],['願意調整的企業','拒絕轉變的企業'])),
  card('In addition, a shop that treats buyers well can develop a good name, and this reputation becomes valuable over time.','以 reputation becomes an asset 說善待顧客積累長期價值',[9,12,15],fixed(13,'In addition, [善待顧客的公司] can develop [好聲譽], and this reputation becomes [寶貴資產] over time.','服務品質不只影響當次交易，也逐年累積顧客信任。','產品需求與管理已談完，要補上長期聲譽如何成為成功條件時。',['In addition, ', ' can develop ', ', and this reputation becomes ', ' over time.'],['建立信任的企業','先形成的聲譽','日後累積的資產'])),
  card('In conclusion, having a new product can give a business an early advantage, but it is not the only route to success.','以 but it is not the only route 重申有利與非必要',[0,1,15],fixed(14,'In conclusion, having a [獨特產品] can give a business an [初步優勢], but it is not the only route to [成功].','結論再次區分獨特產品有幫助與只有它才能成功。','已分析其他因素，末段要精準回應題目的 only 判斷時。',['In conclusion, having a ', ' can give a business an ', ', but it is not the only route to '],['可提供優勢的產品','產品帶來的先行好處','獨特並非唯一的成果'])),
  card('The most successful companies are those that know buyers, run smoothly, adapt and earn trust.','以 are those that 並列四項成功能力作最終收束',[2,8,14],fixed(15,'The most successful companies are those that [了解市場、有效營運、明智應變並贏得顧客信任].','把需求、管理、應變和信任四條線收束成公司能力。','結論已說獨特非唯一，還要列出更完整的成功條件時。',['The most successful companies are those that '],['較能成功的企業會做到的事'])),
];
const usageRules=[
  '要準確陳述一種「只有滿足某條件才會成功」的絕對主張時。',
  '承認某因素有幫助，但反對它是唯一原因時。',
  '否定單一原因後，要並列數項更能解釋結果的因素時。',
  '要用 whether 把成敗判準轉化為可檢查的條件時。',
  '要用 does not have to ... if ... 指出某條件並非必要，只要能達到實際目的便可時。',
  '要以常見例子證明原本被認為不夠特別的選項也可成功時。',
  '已有一般原則，需用日常場景及具體可觀察條件作例子時。',
  '具體例子已提供，需用 less ... more ... 重新排序影響結果的因素時。',
  '第一因素已說明，需明確引出另一種不同的成敗因素時。',
  '要指出即使有明顯優勢，只要其他條件不足仍可能失敗時。',
  '籠統提及好壞後，需列出某角色實際要作的幾項決定時。',
  '要用 when ... instead of ... 對照面對變化時調整與固守舊法時。',
  '已說應變原則，需比較願意與拒絕改變者的結果時。',
  '要說明持續良好對待如何逐漸累積成長期資產時。',
  '結論需區分有初步優勢和是唯一成功途徑時。',
  '已否定單一條件，需總結能共同解釋成功的幾項能力時。',
];
structures.forEach((row,i)=>{row.frame.usage=usageRules[i];});
const wrongReasons=[
  ['這句承認原創有助突出並否定唯一因素，原句先介紹待評估主張。','這句開始分析顧客需求，沒有 only if 的絕對條件。','這句結論否定唯一成功途徑，原句是引言中他人的主張。'],
  ['這句只提出獨特產品為必要條件，未用 While 讓步後反駁。','這句列三項替代因素，原句先釐清原創不是唯一因素。','這句在結論重申「有優勢但非唯一」，原句是引言的立場。'],
  ['這句只反駁原創性為唯一因素，尚未列具體替代條件。','這句轉入第一項顧客需求，未預告營運和信任。','這句在結論並列成功公司特質，原句在引言預告論點。'],
  ['這句在引言並列三項成功因素，原句先展開顧客需求。','這句解釋普通產品可解難，未用 whether 提出評估準則。','這句轉到管理因素，不是顧客需求的第一主體段。'],
  ['這句說獨特產品是成功必要條件，原句明確否定此必要性。','這句先提出需求判準，未用 if 說普通產品也可更好解難。','這句列普通商品的例子，原句先說解決問題的條件。'],
  ['這句說產品不必完全原創，但未舉食品衣服等普通商品。','這句舉咖啡店例子，原句較廣地列普通產品類別。','這句已歸納實用穩定的重要性，原句先提供證據。'],
  ['這句一般列普通產品，未給出咖啡店的價格環境例子。','這句從咖啡店抽出一般標準，原句仍是具體例子。','這句開始管理分析，與咖啡店盈利例子不同。'],
  ['這句說普通產品如何可靠供應，未用 less ... more 歸納。','這句是支持歸納的咖啡店例子，不是抽象成功標準。','這句轉向管理質素，原句仍總結需求與實用性。'],
  ['這句先談真實顧客需求，不是第二個管理因素。','這句歸納產品實用一致，尚未切換到企業管理。','這句分析壞管理的後果，原句先提出管理質素。'],
  ['這句只提出管理這項因素，未說好產品也可因管理差失敗。','這句列好管理者的工作，與壞管理的條件相反。','這句講應變市場，未列領導財務客服的失當。'],
  ['這句說管理差會讓好產品失敗，原句列好管理者的四項決策。','這句講應變，未列價格培訓推廣成本四個面向。','這句以網購變化作應變例子，非管理決策清單。'],
  ['這句列管理日常決策，沒有 when ... instead of ... 的變化對照。','這句是應變與拒變企業的具體比較，原句先說管理原則。','這句談聲譽累積，並非市場變化時是否死守舊法。'],
  ['這句列好管理者的決策，沒有比較能否生存的兩種企業。','這句指出要應變，原句以網購趨勢具體示例。','這句是在結論評價獨特產品，非網購應變例子。'],
  ['這句說管理不善可能使產品失敗，未談善待顧客積累聲譽。','這句比較市場應變與拒變，未說長期顧客信任。','這句列成功公司能力，原句先解釋聲譽如何成為資產。'],
  ['這句在引言把獨特產品當必要條件，原句否定它是唯一道路。','這句在引言讓步表態，原句在結論重述權衡。','這句列成功公司的能力，未評價獨特產品的初步優勢。'],
  ['這句在引言預告顧客營運信任，原句在結論整合四項能力。','這句提出管理質素，沒有總結需求應變與信任。','這句先回應獨特產品非唯一，原句補上完整成功條件。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先辨認「有幫助」與「唯一必要」的差別，再按範文論據排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('本文最關鍵的判斷字眼是甚麼？',[
    '獨特產品是否成功的唯一必要條件',
    '所有企業是否都只出售一種產品',
    '咖啡店是否一定要出售同一品牌',
    '公司是否必須完全放棄網上購物',
  ],'作者承認獨特產品可帶來優勢，反對的只是「唯一」這個絕對判斷。'),
  {type:'multi',prompt:'選出作者提出的其他兩組成功條件',detail:'選兩項，再按「確認」。',options:[
    '滿足真實顧客需求，即使產品本身普通',
    '管理穩妥、因應變化並累積顧客信任',
    '只要產品新穎，便可以不理服務與管理',
    '只要有廣告，便毋須了解顧客或市場',
  ],correct:[0,1],why:'主體段先談需求與普通產品，再談管理應變和聲譽。'},
];
const route=[sequence('依文章次序排列成功論證',[
  ['引言界定立場','原創有助突出，但不是唯一因素。'],
  ['顧客需求','普通產品只要更好解難、可靠又易買，也可成功。'],
  ['管理應變','價格培訓成本要管好，市場變化時要調整。'],
  ['聲譽與結論','善待顧客積累信任，最後總結多項成功能力。'],
],'範文用普通商品與咖啡店反駁唯一論，再補充管理和聲譽。')];
const evidence=[
  quiz('作者為何說產品不必完全原創？',[
    '若能更好、更快或更方便地解決問題，顧客仍會買',
    '所有顧客都只會購買市場上最新奇的產品',
    '產品只要普通，就永遠不可能解決任何問題',
    '任何競爭者都不可能改善產品的方便程度',
  ],'判準是解難表現，不是新奇本身。'),
  quiz('食物、衣服和家居用品在文中有甚麼作用？',[
    '它們是普通商品，說明可靠方便也可帶來成功',
    '它們都是世界上沒有其他公司出售的新品',
    '它們證明企業毋須了解顧客的日常需要',
    '它們只用來說明管理者應如何控制成本',
  ],'普通商品提供反例，推翻「必須獨特」的說法。'),
  quiz('小咖啡店為何可能獲利？',[
    '咖啡好、價格公道、環境舒適，不一定要有革命性產品',
    '只要咖啡名稱獨特，品質價格環境便完全不重要',
    '小店必須每一天都發明世界上從未見過的飲品',
    '咖啡店只要沒有顧客，也一定會穩定獲利',
  ],'例子把可靠價值具體化成品質、價格和氛圍。'),
  quiz('為何出色產品仍可能失敗？',[
    '領導、財務控制或客服失當會破壞整體營運',
    '產品好便保證公司不可能犯任何管理錯誤',
    '好產品一定不需要價格、培訓或成本管理',
    '所有顧客都完全不會受到服務質素影響',
  ],'作者用反例證明產品本身不能代替管理。'),
  quiz('好管理者要處理哪些決定？',[
    '定價、員工培訓、市場推廣與成本控制',
    '只選辦公室顏色，不理價格或員工培訓',
    '只看產品名字，不控制公司任何支出',
    '只決定網頁字體，不理顧客怎樣購買',
  ],'範文把管理質素拆成四項可觀察的工作。'),
  quiz('網購趨勢的例子比較哪兩種企業？',[
    '快速回應市場變化者，比拒絕現代化者較能生存',
    '完全不關注顧客者，比主動調整者必定更易生存',
    '所有企業都拒絕網購，便不再需要任何管理者',
    '只要方法舊，企業便不需檢查消費習慣變化',
  ],'管理者的應變能力是生存可能性的差別。'),
  quiz('良好聲譽如何成為長期資產？',[
    '公司善待顧客，信任逐漸累積並帶來持續價值',
    '公司只要建立名字，便不必再理顧客的經驗',
    '聲譽只在產品完全獨特時才可能被建立',
    '只要顧客一次滿意，所有管理問題便會消失',
  ],'聲譽來自持續善待顧客，價值會隨時間累積。'),
];
const logic=[
  sequence('普通產品也可成功的論證',[
    ['否定必要性','獨特產品有幫助，卻不是唯一成功因素。'],
    ['需求判準','顧客要的是更好、更快、更方便地解難。'],
    ['普通商品','食衣家居產品可因可靠方便而成功。'],
    ['咖啡店例子','好咖啡、公道價格和舒適環境可帶來盈利。'],
    ['一般結論','實用、一致及符合市場需要比新奇更重要。'],
  ],'論證從絕對主張拆解到普通商品的反例，再抽出較合理的成功標準。'),
  sequence('產品以外的成功條件',[
    ['管理可使好產品失敗','領導財務或客服差，產品品質也救不了公司。'],
    ['日常決策','管理者要定價、培訓、推廣與控成本。'],
    ['市場應變','網購與習慣變化時調整，不死守舊法。'],
    ['長期信任','善待顧客建立聲譽，形成寶貴資產。'],
    ['整體能力','了解市場、有效營運、應變和贏得信任。'],
  ],'第二主體段從內部管理推到外部市場變化和長期顧客關係。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間洗衣店沒有新發明，但能準時送回衣物，價格清楚，顧客覺得方便。','哪項最能轉用範文的普通商品論證？',[
    '服務滿足真實需要，未有新發明仍可能成功',
    '先設計獨家洗衣技術，不問準時交件和方便程度',
    '只比較洗衣價格，不問顧客是否得到可靠服務',
    '只評估店面新奇程度，不看日常洗衣需要',
  ],['原文說能可靠方便地解決顧客問題，不一定要完全原創。','獨家技術可能有利，但洗衣店已靠可靠服務滿足需要。','價格重要，不能單獨代表準時和方便。','店面新奇不是顧客真正取得服務的關鍵。'],[3,4,5],'範文以普通商品說明可靠、方便和實用也可帶來成功。'),
  transfer('社區小店打算投資巨款發明奇特咖啡，卻常令顧客等候很久，價格也不清楚。','哪項建議最貼近咖啡店例子的作用？',[
    '先改善咖啡品質、價格與環境，毋須只追求新奇',
    '先推出奇特咖啡，不處理顧客等候與價格不清',
    '只改進店面環境，不檢查咖啡品質和價格',
    '只降低咖啡價格，不問顧客等待是否太久',
  ],['原文咖啡店可憑好咖啡、公道價格和舒適環境獲利。','新奇有吸引力，但等候與價格問題仍會影響顧客。','環境有用，咖啡品質和價格仍須檢查。','降低價格有用，長時間等候仍未解決。'],[5,6,7],'範文的咖啡店不提供革命性產品，仍可因品質、價錢和氛圍盈利。'),
  transfer('一間手機公司有很好的新產品，但帳目混亂，員工未受訓練，客服常不回覆。','哪項最能轉用範文的管理反例？',[
    '產品再好，財務、培訓與客服失當仍可使公司失敗',
    '只展示新產品賣點，不檢查財務與客服運作',
    '只改善帳目，不安排員工培訓或回覆顧客',
    '只增加客服人手，不處理混亂帳目和訓練',
  ],['原文說好產品也可因領導財務客服差而失敗。','產品賣點不能代替穩定財務和客服。','帳目改善有用，仍缺員工訓練和回覆。','客服人手有用，但財務與培訓問題仍在。'],[8,9,10],'範文用 Even an excellent product can fail 反駁產品本身足夠成功。'),
  transfer('補習社有獨家教材，但家長屢次投訴課程時間和收費沒有清楚說明。','哪項管理改進最符合範文？',[
    '改善定價說明、員工培訓與日常顧客服務',
    '只宣傳獨家教材，不改收費與課時說明',
    '只說明收費，不培訓員工處理家長疑問',
    '只延長課時，不問安排是否清楚又可靠',
  ],['範文列定價、培訓和客服為產品外的成功條件。','教材獨特不能代替清楚的課時和收費說明。','價格清楚只是其中一面，服務和員工培訓也重要。','延長課時未必令安排透明可靠。'],[2,8,9,10],'範文指出獨特產品不足以彌補不良領導、財務及客服。'),
  transfer('一間書店多年只靠街坊上門，現在附近居民更多使用網上訂購。','哪項最能運用範文的市場應變論證？',[
    '觀察購書習慣，調整訂購方法而非死守舊流程',
    '只保留街坊上門，不嘗試回應網上訂購習慣',
    '只開設網購頁面，不查訂購與取貨流程是否方便',
    '只擴大店面陳列，不了解附近居民購書方式',
  ],['原文比較迅速回應網購趨勢與拒絕現代化的企業。','原有顧客仍重要，但新購書習慣需要相應渠道。','網頁有用，還需查訂購和取貨是否實用。','擴陳列未處理居民改用網購的行為。'],[10,11,12],'範文以網購和消費習慣變化說明管理者須調整。'),
  transfer('一家社區藥房價格普通，但多年耐心解答用藥問題，街坊常主動推薦它。','哪項最貼近範文的聲譽資產？',[
    '持續善待顧客累積信任，使好名聲成為長期價值',
    '只用價格優惠招客，不維持耐心解答的服務',
    '只靠街坊口碑，不檢查藥房能否持續服務',
    '只做一次推薦活動，不建立長期顧客信任',
  ],['原文說善待顧客的聲譽隨時間變成資產。','優惠可吸引初次購買，但持續解答才累積信任。','口碑有價值，仍要維持讓顧客推薦的服務。','一次活動不能代替多年可靠服務。'],[13,15],'範文把善待顧客、強聲譽和長期資產串成因果。'),
  transfer('投資者稱「這家公司有獨特產品，所以必然成功」，卻沒有查看客戶是否需要它。','哪項回應最符合作者對 only 的判斷？',[
    '獨特可有初步優勢，仍須檢查需求、管理和顧客信任',
    '先看產品是否獨特，之後才研究顧客實際需求',
    '只看顧客需求，不評估管理和成本是否穩定',
    '只重視管理效率，不問獨特產品是否有人需要',
  ],['原文承認獨特的優勢，但反對把它當唯一條件。','獨特不能保證需求；需求與管理應一起檢查。','需求重要，但有效管理和成本也影響持續營運。','管理有效仍要確認產品能解決顧客問題。'],[0,1,2,14,15],'範文從引言到結論一直區分有幫助與唯一必要。'),
  transfer('社企出售普通文具，卻想評估是否真正幫學校省錢、省時和方便補貨。','哪項評估最能轉用範文的顧客需求判準？',[
    '比較文具能否更好、更快、更方便地解決採購問題',
    '只計算文具採購價格，不檢查補貨是否方便',
    '只加快送貨，不問學校是否真正需要產品',
    '只強調普通文具供應穩定，不比較採購效率',
  ],['原文說產品可憑更好更快更方便地解難而成功。','價格是部分價值，還要看省時和方便補貨。','速度有用，仍須看文具是否解決學校需要。','穩定有用，未比較效率和採購便利。'],[3,4,5],'範文把真實顧客需求和問題解決方式放在原創性之前。'),
  transfer('公司年度報告只列「發明新品」一項，沒有說明如何持續營運。','哪項補充最完整地反映範文結論？',[
    '列出了解市場、有效營運、因應變化和贏得信任',
    '只寫市場變化，不交代日常營運如何持續',
    '只列顧客信任，不問產品是否解決實際問題',
    '只記錄新品數量，不分析公司如何有效營運',
  ],['範文末句用四項能力概括成功，而非只看新產品。','只談變化，未展示如何有效營運及贏得信任。','信任重要，但產品仍要滿足市場需要。','新品數量不能替代可持續營運的分析。'],[2,8,10,11,13,15],'範文結論把市場、營運、應變和信任並列。'),
  transfer('兩家餐廳供應相似菜式；甲服務穩定並會調整菜單，乙只宣傳自己菜式獨特。','哪項最符合範文的比較原則？',[
    '先看顧客需要、服務一致和應變，不只看菜式新奇',
    '只看菜式是否新奇，不比較服務穩定程度',
    '只看甲的服務品質，不問顧客口味是否改變',
    '只問菜單更新頻率，不檢查實際價格和服務',
  ],['原文認為實用、一致、相關性與管理應變勝於只靠獨特。','新奇不是唯一標準，可靠服務也有價值。','服務穩定有用，仍須因應顧客口味變化。','更新頻率不能單獨說明價格與服務品質。'],[4,5,6,7,11,15],'範文以普通產品及小咖啡店論證可靠、實用、符合市場也能成功。'),
];
export default {key:'discuss-both-views:6',meta:{topic:'企業成功是否必須依靠獨特產品',summary:'獨特產品可帶來優勢，但滿足顧客需求、妥善管理、適應市場和建立長期信任同樣重要。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
