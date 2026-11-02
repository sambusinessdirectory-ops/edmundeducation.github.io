// Opinion 46 answers the published wildlife-funding question. Source and narration were reconciled before authoring.
const simple=[
  'When there is little public money, protecting wild animals may seem less important than helping poor people and providing health care.',
  'So some people say governments and ordinary people should spend the money they use to protect animals and places where they live on these human needs instead.',
  'I mostly disagree because healthy natural systems help people live well, and spending less on nature may cost more later.',
  'First, protecting the places where animals live often also protects basic things that local people need.',
  'Forests help keep water safe and stop some floods; good soil and insects that help plants grow also help produce food.',
  'If these natural systems get worse, poor families may pay more for food, drink unsafe water, and face more illness.',
  'For example, fixing a wetland can protect wild animals and also reduce floods near homes and clinics.',
  'So protecting nature is not only a gift to animals; it often helps keep people safe too.',
  'Second, treating help for people and protection for animals as competing goals can lead to bad choices about limited money.',
  'Governments must pay for hospitals, basic medical care, and ways to reduce poverty, but they do not have to give up protecting animal homes to do that.',
  'Good plans can do both: local people can earn money by planting forests again, looking after protected areas, or offering tourism that does not harm nature.',
  'These jobs can help people earn more while the repaired land keeps giving them clean water and other help.',
  'If a plan to protect nature wastes money, it should be made better or replaced, and the money saved should support services that people urgently need.',
  'We should ask how each use of money helps people and nature, rather than say one side should get all the money.',
  'In short, I do not agree that money used to protect wild animals should usually be moved to poverty help and health care.',
  'These human needs deserve a lot of money, but giving up nature protection would often damage the natural systems that make local people safer and healthier.',
  'The same rule should guide government money and people’s donations: pay for necessary services and support nature projects that clearly help both people and wild animals.',
];
const vocabulary=[
  [['Wildlife protection','protecting wild animals','野生動物保護'],['less urgent','less important','較不迫切'],['poverty','helping poor people','貧困'],['public money is limited','there is little public money','公共資金有限']],
  [['therefore','So','因此'],['argue','say','主張'],['governments and individuals','governments and ordinary people','政府與個人'],['redirect','spend the money','轉投'],['habitats','places where they live','棲息地']],
  [['largely disagree','mostly disagree','大致不同意'],['ecosystems','natural systems','生態系統'],['human well-being','people live well','人類福祉'],['cutting conservation funds','spending less on nature','削減保育資金'],['larger costs later','cost more later','日後更大代價']],
  [['habitats','places where animals live','棲息地'],['basic services','basic things','基本服務'],['communities depend','local people need','社區依賴']],
  [['keep water clean','keep water safe','保持水質潔淨'],['reduce flooding','stop some floods','減少洪水'],['healthy soils','good soil','健康土壤'],['pollinating insects','insects that help plants grow','傳粉昆蟲'],['food production','produce food','糧食生產']],
  [['allowed to deteriorate','get worse','任其退化'],['poorer households','poor families','較貧困家庭'],['higher food prices','pay more for food','更高糧價'],['greater exposure to disease','face more illness','更高患病風險']],
  [['restoring a wetland','fixing a wetland','修復濕地'],['wildlife','wild animals','野生動物'],['reducing floods','reduce floods','減少洪水'],['nearby homes and clinics','near homes and clinics','附近住戶及診所']],
  [['Conservation','protecting nature','保育'],['therefore','So','因此'],['not simply a gift to animals','not only a gift to animals','不只是給動物的禮物'],['practical protection for people','helps keep people safe','對人的實際保障']],
  [['social welfare','help for people','社會福利'],['wildlife','protection for animals','野生動物保護'],['rival causes','competing goals','互相競爭的目標'],['poor choices','bad choices','欠妥選擇'],['limited budgets','limited money','有限預算']],
  [['fund hospitals','pay for hospitals','資助醫院'],['basic treatment','basic medical care','基本治療'],['effective measures against poverty','ways to reduce poverty','有效扶貧措施'],['abandon habitats','give up protecting animal homes','放棄棲息地']],
  [['Well-designed projects','Good plans','設計得宜的項目'],['serve both aims','do both','兼顧兩者'],['local people can be paid','local people can earn money','本地居民可獲酬'],['restore forests','planting forests again','修復森林'],['manage protected areas','looking after protected areas','管理保護區'],['responsible tourism','tourism that does not harm nature','負責任旅遊']],
  [['raise incomes','help people earn more','增加收入'],['restored land','repaired land','修復後的土地'],['provide clean water','giving them clean water','提供潔淨水源']],
  [['conservation scheme','plan to protect nature','保育計劃'],['wasteful','wastes money','浪費資源'],['improved or replaced','made better or replaced','改善或取代'],['savings','money saved','節省的資金'],['urgent human services','services that people urgently need','迫切的人類服務']],
  [['The right question','We should ask','真正應問'],['each investment','each use of money','每項投資'],['which side should receive every pound','one side should get all the money','哪一方應獲全部資金']],
  [['In conclusion','In short','總結'],['disagree','do not agree','不同意'],['generally be moved','usually be moved','普遍轉投'],['poverty relief','poverty help','扶貧']],
  [['substantial funding','a lot of money','大量撥款'],['abandoning conservation','giving up nature protection','放棄保育'],['weaken the natural systems','damage the natural systems','削弱自然系統'],['communities safer and healthier','local people safer and healthier','社區更安全健康']],
  [['principle','rule','原則'],['public budgets','government money','公共預算'],['private donations','people’s donations','私人捐款'],['fund essential services','pay for necessary services','資助必要服務'],['conservation projects','nature projects','保育項目'],['benefit both people and wildlife','help both people and wild animals','兼惠人與野生動物']],
];
const chunkOverrides=[
  ['Wildlife protection can seem less urgent than poverty and health care','when public money is limited.'],
  ['Some people therefore argue that governments and individuals should redirect the money','they spend on animals and habitats to these human needs.'],
  ['I largely disagree,','because healthy ecosystems support human well-being','and cutting conservation funds can create larger costs later.'],
  ['The first reason is that protecting habitats','often protects the basic services on which communities depend.'],
  ['Forests help keep water clean and reduce flooding,','while healthy soils and pollinating insects support food production.'],
  ['If such systems are allowed to deteriorate,','poorer households may face higher food prices, unsafe water, and greater exposure to disease.'],
  ['For example, restoring a wetland can help protect wildlife','while also reducing floods that threaten nearby homes and clinics.'],
  ['Conservation is therefore not simply a gift to animals;','in many cases, it is practical protection for people.'],
  ['A second reason is that treating social welfare and wildlife as rival causes','leads to poor choices about limited budgets.'],
  ['Governments must fund hospitals, basic treatment, and effective measures against poverty,','but that duty does not require them to abandon habitats.'],
  ['Well-designed projects can serve both aims:','local people can be paid to restore forests, manage protected areas, or develop responsible tourism.'],
  ['These jobs can raise incomes','while the restored land continues to provide clean water and other benefits.'],
  ['Where a conservation scheme is wasteful,','it should be improved or replaced,','and the savings should support urgent human services.'],
  ['The right question is how each investment helps people and nature,','not which side should receive every pound.'],
  ['In conclusion, I disagree','that money for wildlife should generally be moved to poverty relief and health care.'],
  ['Those needs deserve substantial funding,','but abandoning conservation would often weaken the natural systems that make communities safer and healthier.'],
  ['The same principle should guide public budgets and private donations:','fund essential services','while supporting conservation projects that clearly benefit both people and wildlife.'],
];
const simpleChunkOverrides=[
  ['When there is little public money,','protecting wild animals may seem less important than helping poor people and providing health care.'],
  ['So some people say governments and ordinary people should spend the money','they use to protect animals and places where they live on these human needs instead.'],
  ['I mostly disagree','because healthy natural systems help people live well,','and spending less on nature may cost more later.'],
  ['First, protecting the places where animals live','often also protects basic things that local people need.'],
  ['Forests help keep water safe and stop some floods;','good soil and insects that help plants grow also help produce food.'],
  ['If these natural systems get worse,','poor families may pay more for food, drink unsafe water, and face more illness.'],
  ['For example, fixing a wetland can protect wild animals','and also reduce floods near homes and clinics.'],
  ['So protecting nature is not only a gift to animals;','it often helps keep people safe too.'],
  ['Second, treating help for people and protection for animals as competing goals','can lead to bad choices about limited money.'],
  ['Governments must pay for hospitals, basic medical care, and ways to reduce poverty,','but they do not have to give up protecting animal homes to do that.'],
  ['Good plans can do both:','local people can earn money by planting forests again, looking after protected areas, or offering tourism that does not harm nature.'],
  ['These jobs can help people earn more','while the repaired land keeps giving them clean water and other help.'],
  ['If a plan to protect nature wastes money,','it should be made better or replaced,','and the money saved should support services that people urgently need.'],
  ['We should ask how each use of money helps people and nature,','rather than say one side should get all the money.'],
  ['In short, I do not agree','that money used to protect wild animals should usually be moved to poverty help and health care.'],
  ['These human needs deserve a lot of money,','but giving up nature protection would often damage the natural systems that make local people safer and healthier.'],
  ['The same rule should guide government money and people’s donations:','pay for necessary services','and support nature projects that clearly help both people and wild animals.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Repairing a library can seem less urgent than emergency housing when a council budget is tight.','can seem less urgent than 是比較表面優先次序；when 交代此印象出現的條件。','此句只提出緊縮條件下的初步印象，未判定哪一項開支真的應取消。',[3,5,9],F('[一項支出] can seem less urgent than [另一項需要] when [資源有限]','先公平承認題目中看似合理的預算疑慮。','要比較兩種需求的表面迫切性，並交代這種印象出現的條件時。',[['Wildlife protection','slot','一項支出'],[' can seem less urgent than ','link','可能看似較不迫切'],['poverty and health care','slot','另一項需要'],[' when ','link','在...情況下'],['public money is limited.','slot','資源有限']])),
  S('Some residents therefore argue that the council should move its festival budget to school repairs.','Some people therefore argue that 轉述他人的推論；redirect...to... 明確說出資金從何處轉往何處。','轉述主張不等於作者支持；資金轉移須有來源和目標。',[0,4,14],F('Some people therefore argue that [決策者] should redirect [原用途的資金] to [新用途]','交代題目主張的資金轉向，不替作者提前表態。','要公平轉述一項把資源由甲用途轉往乙用途的主張時。',[['Some people therefore argue that ','link','轉述他人主張'],['governments and individuals','slot','決策者'],[' should redirect ','link','應轉移'],['the money they spend on animals and habitats','slot','原用途的資金'],[' to ','link','至'],['these human needs.','slot','新用途']])),
  S('I largely disagree, because public libraries serve vulnerable residents and closing them may create higher social costs later.','largely disagree 準確限定反對程度；because 後兩條理由可各自展開。','此句沒有否認所有重新分配預算的例外情況。',[1,8,14],F('I largely disagree, because [第一個理由] and [第二個理由]','直接回答同意程度，並預告兩條不同的因果理由。','要提出有保留的反對立場，並預告兩個可分開論證的理由時。',[['I largely disagree,','link','限定反對程度'],[' because ','link','因為'],['healthy ecosystems support human well-being','slot','第一個理由'],[' and ','link','以及'],['cutting conservation funds can create larger costs later.','slot','第二個理由']])),
  S('The first reason is that maintaining public transport protects services on which workers depend.','The first reason is that 清楚展開第一條主線；on which 交代誰依賴那些服務。','這是對首項理由的概括，後面仍需具體機制支持。',[2,8,13],F('The first reason is that [一項措施] protects [對象所依賴的基本服務]','指出表面上只保護某對象的措施，亦維持更廣泛的基本服務。','要開始首段論證，指出一項措施維持他人依賴的基本條件時。',[['The first reason is that ','link','提出首項理由'],['protecting habitats','slot','一項措施'],[' often protects ','link','往往亦保護'],['the basic services on which communities depend.','slot','對象所依賴的基本服務']])),
  S('A reliable bus route helps workers reach jobs, while a safe cycle path gives students another way to travel.','while 並列兩組不同的作用，讓抽象價值變成可觀察服務。','兩半句是相加的具體功能，不表示二者互相排斥。',[3,5,10],F('[第一類資源] helps [作用甲], while [第二類資源] supports [作用乙]','用兩個具體途徑證明一項系統具備多重實際作用。','要列出兩組相互補充的具體作用，而非只作空泛評價時。',[['Forests','slot','第一類資源'],[' help ','link','有助'],['keep water clean and reduce flooding','slot','作用甲'],[', while ','link','同時'],['healthy soils and pollinating insects','slot','第二類資源'],[' support ','link','支持'],['food production.','slot','作用乙']])),
  S('If local clinics are allowed to close, poorer families may face longer journeys, missed treatment, and higher costs.','If 設定惡化條件；may 保留可能性；三項結果明確落在較脆弱家庭。','這不表示每戶必然遭遇全部結果。',[4,6,12],F('If [重要系統惡化], [較脆弱群體] may face [多項具體損失]','從系統退化推到受影響者的日常代價。','要以條件句說明基礎系統受損時，誰可能承受哪些具體損失時。',[['If ','link','設定條件'],['such systems are allowed to deteriorate','slot','重要系統惡化'],[', ','link','便可能'],['poorer households','slot','較脆弱群體'],[' may face ','link','面對'],['higher food prices, unsafe water, and greater exposure to disease.','slot','多項具體損失']])),
  S('For example, repairing a neighbourhood park can give children a safe place to play while also reducing summer heat.','For example 引實例；while also 指同一措施同時產生第二項效益。','例子示範雙重作用，並非宣稱每個項目都必然有同等效果。',[4,5,7],F('For example, [具體措施] can help [目標甲] while also [目標乙]','以單一具體措施展示兩項原以為分開的好處。','提出雙重效益後，要用一個具體案例展示同一措施如何兼顧兩者時。',[['For example, ','link','引出例子'],['restoring a wetland','slot','具體措施'],[' can help ','link','可幫助'],['protect wildlife','slot','目標甲'],[' while also ','link','同時'],['reducing floods that threaten nearby homes and clinics.','slot','目標乙']])),
  S('A school meal programme is therefore not simply a free lunch; in many cases, it is practical support for learning.','not simply...; in many cases... 先糾正狹窄看法，再指出額外的實際作用。','in many cases 限定適用範圍，不表示每個項目都有效。',[1,6,13],F('[一項措施] is therefore not simply [狹窄理解]; in many cases, it is [實際作用]','把具體證據收束成對措施價值的重新界定。','列出實際作用後，要糾正讀者對某措施只惠及單一對象的看法時。',[['Conservation','slot','一項措施'],[' is therefore not simply ','link','因此不只是'],['a gift to animals','slot','狹窄理解'],['; in many cases, it is ','link','在許多情況下也是'],['practical protection for people.','slot','實際作用']])),
  S('A second reason is that treating road safety and public transport as rival aims can lead to poor spending decisions.','A second reason is that 開新論點；treating A and B as rival causes 指錯誤的二選一設定。','這句批評把兩個目標對立，沒有否認預算需要比較。',[3,9,13],F('A second reason is that treating [目標甲] and [目標乙] as rivals leads to [欠妥決策]','第二段轉入資源分配的判斷方式。','要引出另一條理由，指出把可互相配合的目標硬設為對手的問題時。',[['A second reason is that ','link','引入第二理由'],['treating social welfare and wildlife as rival causes','slot','把兩個目標硬設為對手'],[' leads to ','link','導致'],['poor choices about limited budgets.','slot','欠妥決策']])),
  S('A council must maintain emergency housing, but that duty does not require it to close every community library.','must 承認必要責任；but...does not require... 排除由此跳到放棄另一目標的推論。','承認甲需要資助，不等於乙必須被取消。',[2,8,10],F('[決策者] must fund [必要服務], but that duty does not require [放棄另一目標]','承認迫切需要，再阻止它被當作取消另一目標的理由。','要承認一項不可推卸的責任，同時指出它並不必然排除另一項責任時。',[['Governments','slot','決策者'],[' must fund ','link','必須資助'],['hospitals, basic treatment, and effective measures against poverty','slot','必要服務'],[', but that duty does not require them to ','link','但並不因此必須'],['abandon habitats.','slot','放棄另一目標']])),
  S('Well-designed school projects can serve both aims: parents can be paid to grow food, manage gardens, or organise meal deliveries.','冒號後以三個具體行動解釋 serve both aims，而非重複抽象口號。','例子必須同時回應先前兩個目標，不能只換一種名稱。',[6,9,12],F('[設計得宜的項目] can serve both aims: [參與者] can be paid to [三項具體工作]','提出可同時服務兩個目標的操作方法。','要證明兩個目標可並行，並列出可執行的工作或安排時。',[['Well-designed projects','slot','設計得宜的項目'],[' can serve both aims: ','link','可兼顧兩者：'],['local people','slot','參與者'],[' can be paid to ','link','可獲酬從事'],['restore forests, manage protected areas, or develop responsible tourism.','slot','三項具體工作']])),
  S('These community jobs can raise incomes while the repaired school continues to serve children.','while 連接短期收入與持續的基礎服務，回應兩個不同目標。','工作收入及設施效益是兩條不同作用，不可只算一項。',[4,10,13],F('[新工作] can raise [收入] while [改善後的資源] continues to provide [持續效益]','說明同一方案既帶來收入，也保留長期服務。','提出兼顧方案後，要追蹤它如何同時產生即時與持續效益時。',[['These jobs','slot','新工作'],[' can raise ','link','可提高'],['incomes','slot','收入'],[' while ','link','同時'],['the restored land','slot','改善後的資源'],[' continues to provide ','link','持續提供'],['clean water and other benefits.','slot','持續效益']])),
  S('Where a training programme is wasteful, it should be improved or replaced, and the savings should help families in urgent need.','Where 在此指「如有某情況」；should...and... 給出修正與資金再用兩步。','承認個別浪費不是主張取消整類項目。',[5,9,13],F('Where [某計劃浪費資源], it should be [改善或取代], and the savings should support [迫切需要]','保留有效方案，同時修正浪費並重新分配節省的資金。','面對個別方案欠佳，要提出有條件的修正與資金再用時。',[['Where ','link','如有此情況'],['a conservation scheme is wasteful','slot','某計劃浪費資源'],[', it should be ','link','應'],['improved or replaced','slot','改善或取代'],[', and the savings should support ','link','並把節省資金用於'],['urgent human services.','slot','迫切需要']])),
  S('The right question is how each school policy helps students learn, not which department receives the largest budget.','how...not which... 把爭論由爭奪份額轉向評估每筆投入的實際作用。','作者沒有主張每項方案都應平均分錢。',[2,8,12],F('The right question is how [每項投入產生甚麼作用], not which [一方獲得全部資源]','把二選一爭論改成可檢驗的成效問題。','要修正一場只問誰應得資源的爭論，轉而問每項投入的實際效果時。',[['The right question is how ','link','真正應問'],['each investment helps people and nature','slot','每項投入產生甚麼作用'],[', not which ','link','而非哪一方'],['side should receive every pound.','slot','一方獲得全部資源']])),
  S('In conclusion, I disagree that funding for community centres should generally be moved to road building.','In conclusion 重答題目；generally 限定「普遍轉移」而非否認所有個別調整。','作者反對一般化轉移，不是否認對方需求值得投入。',[1,8,13],F('In conclusion, I disagree that [原用途的資金] should generally be moved to [另一用途]','結尾準確重申反對普遍挪用，而非反對所有重新檢討。','有條件地反對一項普遍資金轉移後，要在結論重申轉移方向與立場時。',[['In conclusion, I disagree','link','重申反對'],[' that ','link','反對的主張是'],['money for wildlife','slot','原用途的資金'],[' should generally be moved to ','link','普遍轉投'],['poverty relief and health care.','slot','另一用途']])),
  S('Emergency care deserves strong funding, but closing preventive clinics would often make communities less healthy.','but 先承認甲值得投入，再說明放棄乙可能削弱甲所追求的結果。','承認甲的迫切性，不等於可以忽略乙的作用。',[7,9,14],F('[迫切需要] deserve [大量撥款], but abandoning [另一項措施] would often weaken [共同目標的基礎]','承認另一需要的重要，同時回扣原方案的間接公共作用。','結尾要公平承認另一目標，並說明放棄原措施如何傷害共同目的時。',[['Those needs','slot','迫切需要'],[' deserve ','link','值得'],['substantial funding','slot','大量撥款'],[', but abandoning ','link','但放棄'],['conservation','slot','另一項措施'],[' would often weaken ','link','往往削弱'],['the natural systems that make communities safer and healthier.','slot','共同目標的基礎']])),
  S('The same principle should guide council budgets and private gifts: fund urgent services while supporting projects that help both young and old residents.','冒號後以 fund...while supporting... 說明原則如何同時適用於兩類資金與兩類目標。','結論提供清楚操作準則，沒有聲稱任何項目都必須獲款。',[10,12,15],F('The same principle should guide [兩類資金]: fund [必要服務] while supporting [可兼顧多方的項目]','把全文判斷轉成公共與私人資金都可採用的分配原則。','結尾要把論證化為可執行原則，並表明兩種需要可以並行支持時。',[['The same principle should guide ','link','同一原則適用於'],['public budgets and private donations','slot','兩類資金'],[': fund ','link','具體做法：資助'],['essential services','slot','必要服務'],[' while supporting ','link','同時支持'],['conservation projects that clearly benefit both people and wildlife.','slot','可兼顧多方的項目']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對「把野生動物保育資金普遍轉投扶貧和醫療」的立場是甚麼？',['大致不同意；保育亦支撐人的生活，但浪費項目應改善','完全同意；所有保育都應立即停止','完全反對扶貧和醫療撥款','沒有立場，只介紹兩邊看法'],'largely disagree；政府仍須資助醫院及扶貧，個別浪費保育項目應改善。'),
  {type:'multi',prompt:'選出本文的兩條主要理由',detail:'選兩項，再按「確認」。',options:['棲息地支撐水、糧食及防洪等人類基本服務','社會福利與保育可透過有設計的項目互相支持，不必當成對手','所有野生動物都比任何人類需要重要','只要一項保育計劃浪費，就應取消全部保育'],correct:[0,1],why:'第一段論生態系統與人類基本需要；第二段論兼顧預算及修正浪費。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 大致不同意普遍轉移','承認扶貧醫療迫切；指出生態系統支撐人的生活且削支可能有代價。'],
  ['主體段一 · 棲息地保護人的基本需要','水、糧食與防洪形成因果鏈；濕地例子兼顧野生動物和住戶。'],
  ['主體段二 · 避免虛假二選一','政府仍須資助人類服務；良好保育可創就業，浪費計劃應改善。'],
  ['結論 · 兩類資金按實際效益分配','重申不普遍挪走保育款；公共預算與私人捐款均兼顧必要服務。'],
],'承認迫切需要 → 生態系統的公共作用 → 兼顧方案與浪費例外 → 按成效分配。')];
const evidence=[
  Q('森林、土壤與傳粉昆蟲分別支持甚麼？',['潔淨水源、防洪和糧食生產','只提供旅遊照片','只讓動物有地方住，與人完全無關','必然取代醫院'],'原文列水、洪水、糧食三條可觀察途徑。'),
  Q('若自然系統退化，哪一群體可能承受更直接的生活代價？',['較貧困家庭：高糧價、不安全飲水及患病風險','只有遠方遊客','所有家庭必然同時遇到全部損失','只有野生動物，完全不影響人'],'poorer households may face 保留可能性，並列具體代價。'),
  Q('修復濕地的例子為何與題目相關？',['同一項目既保護野生動物，也減少威脅住戶和診所的洪水','它只說明動物較可愛','它證明所有保育項目都必然成功','它要求停建醫院'],'例子把看似相爭的兩個目標接在同一措施上。'),
  Q('作者如何處理「醫療與扶貧很迫切」這一反對意見？',['明確承認必須撥款，但指出這責任不要求放棄棲息地','否認醫院的重要','主張把全部公共款項交給保育','完全沒有回答'],'Governments must fund...but that duty does not require...。'),
  Q('第二主體段提出甚麼可兼顧兩方的實際安排？',['聘本地居民修復森林、管理保護區或發展負責任旅遊','只叫居民無薪工作','單純把所有資金平均分半','永久停止評估項目效果'],'具體職位帶來收入，修復後土地仍提供水與其他益處。'),
  Q('若個別保育計劃浪費資源，作者會怎樣做？',['改善或取代該計劃，把節省資金用於迫切人類服務','仍須毫無條件續撥同額資金','因此取消全部保育','因此取消醫療'],'Where...wasteful 設例外，沒有推翻有效保育的理由。'),
];
const logic=[
  sequence('第一主體段：為何保育不是與人的需要無關？',[
    ['主張','保護棲息地亦保護社區依賴的基本服務。'],
    ['機制','森林維持水質及防洪；土壤和傳粉昆蟲支持糧食。'],
    ['受損後果','系統退化會令較貧困家庭承受價格、飲水及疾病風險。'],
    ['濕地例子','修復濕地可同時保護野生動物、住戶及診所。'],
    ['段落結論','保育在許多情況下也是對人的實際保障。'],
  ],'棲息地 → 基本服務 → 退化代價 → 一項兼顧兩方的例子。'),
  sequence('第二主體段：有限預算如何避免二選一？',[
    ['指出判斷問題','把福利與保育當成互斥目標，易作欠妥選擇。'],
    ['承認迫切責任','政府必須資助醫院、基本治療及有效扶貧。'],
    ['兼顧方案','保育工作可聘用本地居民，增加收入並改善自然服務。'],
    ['處理例外','浪費項目應改善或取代，節省資金支援迫切人類服務。'],
    ['段落結論','逐項評估投資如何幫助人與自然，而非讓一方獨佔。'],
  ],'必要人類服務 → 可兼顧的保育工作 → 修正浪費 → 按成效判斷。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某市要削減所有社區公園經費，聲稱醫院更迫切。','哪項回應最符合文章的論證方式？',['先承認醫院需要資金，再檢查公園是否也支持健康、防熱及居民生活','否認醫院需要資金','聲稱所有公園必然比醫院重要','只按哪邊支持者較多決定'],['承認必要責任，再檢驗另一用途的實際作用。','原文直接承認醫院重要。','原文沒有絕對排序。','應看可觀察效益。'],[0,3,9,13],'must fund...but that duty does not require...'),
  T('一個修復濕地的項目同時保護動物，也令附近診所較少受洪水影響。','這個例子支持哪條推理？',['同一措施可兼顧兩種看似競爭的目標','野生動物保護永遠與人無關','所有濕地項目都無需評估','診所不需要防洪'],['與原文濕地例子的雙重效益相同。','與例子相反。','個別項目仍須評估。','洪水可威脅診所。'],[3,6,7],'restoring a wetland...while also reducing floods。'),
  T('某保育工程花費高，卻沒有改善棲息地或居民生活。','哪項處理最接近作者的限制條件？',['改善或取代這項浪費工程，把節省資金用於迫切服務','為保育之名永不檢查成果','立即取消所有動物保護','把所有醫療款項轉給該工程'],['Where...wasteful 指個別項目的修正及再分配。','原文反對浪費。','不能以個案否定整類項目。','與作者承認醫療需要相反。'],[12,13,16],'Where a conservation scheme is wasteful...'),
  T('一個森林修復計劃聘用失業居民，同時改善水源。','哪項是跨主題可用的論證？',['一項投入可同時增加收入並維持長期公共服務','凡有工作就毋須評估水質','收入和環境效益必然互相排斥','只看動物數量，不看人的生活'],['這是兼顧就業與自然服務的具體機制。','仍應評估實際效益。','原文主張可兼顧。','忽略收入與水源。'],[10,11,13],'jobs can raise incomes while restored land...'),
  T('學校想取消圖書館，把經費全用於補習。','哪個問題比「誰要拿全部錢」更好？',['圖書館與補習各自如何幫助學生，是否有可兼顧的安排？','哪一方的宣傳口號較響亮？','能否不看成效直接取消圖書館？','是否應永遠平均分錢，不問需要？'],['文章把二選一爭論轉成逐項成效判斷。','口號不是效益。','欠缺查證。','作者沒有主張平均。'],[8,13,16],'how each investment helps...not which side...'),
  T('市政府既要減少交通意外，又要讓低收入者上班。','哪個方案最符合「兼顧兩個目標」？',['聘本地居民改善安全行人路及巴士站，並檢查事故與就業效果','宣布其中一個目標毫無價值','只改政策名稱，不安排工作','不問效果，把所有資金平均撒到每個部門'],['具體工作和可查結果同時回應兩項需要。','虛假二選一。','沒有可執行機制。','平均不等於有效。'],[8,10,11,13],'Well-designed projects can serve both aims。'),
  T('有人說：「我們要治病，所以完全不需要預防疾病。」','文章提供哪個反駁框架？',['承認治病必要，但指出這責任不要求放棄預防','否認治病有價值','預防必然可取代所有治療','兩者必須各拿一半預算'],['must...but that duty does not require... 可跨題應用。','與承認責任相反。','原文沒有取代論。','沒有平均分配規則。'],[9,15],'must fund...but that duty does not require...'),
  T('某區一時缺錢，街燈維修看似不及急救服務迫切。','如何避免只停在表面排序？',['先承認預算限制，再追查缺少照明會否增加意外與日後醫療成本','因此永遠關閉所有街燈','因此不再資助急救','只按兩個項目的名稱判斷'],['表面迫切性要接受長期成本檢驗。','推論過度。','作者承認迫切服務。','名稱不是證據。'],[0,2,5,13],'can seem less urgent...when public money is limited。'),
  T('有人認為某項公共投資「只是在送禮給一群人」。','哪種證據最能修正這一狹窄看法？',['展示其他人如何透過水、健康、就業等途徑實際受惠','只重複說它很重要','宣稱任何項目都沒有浪費','完全不評估其他受益者'],['not simply...practical protection 需要具體受益途徑。','缺少機制。','原文承認浪費例外。','未回應指控。'],[4,6,7,11],'not simply a gift...practical protection。'),
  T('市政府要同時處理洪水和低收入，只有有限預算。','哪項推論最有根據？',['檢查修復河岸能否聘本地人、降低洪水風險，並比較實際成本與效益','因為兩項目標不同，所以必然無法同時處理','只看哪個方案名字更吸引','不管成效，永久資助所有舊項目'],['文章要求兼顧方案及逐項評估。','原文反對硬設為對手。','名稱不是成效。','浪費項目須改善。'],[8,10,11,12,13],'treating...as rival causes leads to poor choices。'),
  T('捐款者想同時支持基本醫療與有效的環境項目。','文章的結尾原則如何運用？',['資助必要服務，亦支持經查證能惠及人與自然的項目','捐款只能支持動物，不得支持人','所有環境項目都毋須證明效果','一律把醫療與環境捐款平均分半'],['公共預算與私人捐款都可按成效兼顧。','原文承認醫療必要。','clearly benefit 要求證據。','沒有平均要求。'],[12,15,16],'public budgets and private donations...'),
  T('要用一句話概括全文。','哪項最準確？',['作者大致反對普遍挪走保育資金：健康生態支撐人的需要，有效項目可兼顧兩方，浪費項目則須修正','作者認為醫院與扶貧不重要','作者要求永久保留每項保育計劃','作者主張任何野生動物支出都必須轉給醫療'],['完整包含立場、兩條理由與例外。','與原文相反。','忽略浪費例外。','與立場相反。'],[2,3,8,9,10,12,14,15,16],'largely disagree；serve both aims；wasteful scheme。'),
];
export default {
  key:'opinion:46',
  meta:{topic:'野生動物保育與扶貧醫療的預算取捨',summary:'作者大致不同意普遍把保育資金轉投扶貧醫療。棲息地支撐水、糧食及防洪等人類基本需要；設計得宜的保育工作亦可增加收入。政府仍須資助醫院與扶貧，浪費的保育項目要改善或取代。公共及私人資金都應按實際效益兼顧必要服務和有效保育。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
