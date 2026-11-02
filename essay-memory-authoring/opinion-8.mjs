// Model Essay 8 · Opinion: good products still need advertising.
const simple=[
  "In a crowded market, even products that really solve buyers' problems will not always sell on their own.",
  'So some people say ads are not needed when a product is already good and useful.',
  'I fully disagree, because ads are still needed to tell people about products and help good products earn trust when there are many choices.',
  'First, ads are still needed because people cannot choose a product they have never heard of.',
  'In most fields, buyers see many similar products and do not have time to study each one themselves.',
  'So ads give useful facts: what a product does, who needs it, how it is different from other products, and where to buy it.',
  "Without these facts, even a very good product may stay unknown, so people's needs may not be met in real life.",
  'For example, a small company may make a washing machine that uses less energy, lowers power bills and lasts longer than other models, but many families will still buy brands they know if they never learn about this better choice.',
  "Ads are also needed because good quality alone does not remove people's worries.",
  'When people do not know a brand, they may still worry whether the product works well, is safe, or comes with help after purchase, even if it does its job well.',
  'Ads can ease these worries by showing the product in use, explaining promises and official approvals, and repeating a clear message; together these make the company seem more trustworthy.',
  'For example, a new company making safer baby bottles may be ignored until its ads explain what the bottles are made of, which safety tests they passed and how buyers can get their money back.',
  'In short, I fully disagree that a good product does not need ads.',
  'No matter how useful a product is, people still need facts and reasons to trust it; without ads, many excellent products would remain unknown and not trusted.',
];
const vocabulary=[
  [['competitive markets','a crowded market','競爭激烈的市場'],['genuinely solve consumers’ problems',"really solve buyers' problems",'確實解決消費者問題'],['do not automatically sell themselves','will not always sell on their own','不會自動暢銷']],
  [['therefore','So','因此'],['argue','say','主張'],['advertising','ads','廣告'],['unnecessary','not needed','沒有必要'],['high-quality','good','品質優良']],
  [['This essay completely disagrees','I fully disagree','本文完全不同意'],['advertising','ads','廣告'],['essential','still needed','仍然必要'],['informing consumers','tell people about products','向消費者提供資訊'],['gain credibility','earn trust','建立可信度'],['crowded markets','many choices','選擇繁多的市場']],
  [['The first reason','First','第一個原因'],['advertising','ads','廣告'],['remains necessary','still needed','仍有必要'],['consumers','people','消費者'],['never encountered','never heard of','從未接觸']],
  [['industries','fields','行業'],['buyers face countless similar options','buyers see many similar products','買家面對眾多相似選擇'],['research each one independently','study each one themselves','自行研究每一項']],
  [['Advertising','ads','廣告'],['performs an informative function','give useful facts','發揮資訊作用'],['who it is for','who needs it','適合哪些人'],['how it differs from rival goods','how it is different from other products','與競爭商品有何不同'],['where it can be bought','where to buy it','可在哪裏購買']],
  [['this information','these facts','這些資訊'],['excellent product','very good product','優秀產品'],['remain invisible','stay unknown','不被看見'],['consumer needs are not met in practice',"people's needs may not be met in real life",'消費者需要無法實際滿足']],
  [['produce','make','生產'],['energy-efficient','uses less energy','節能'],['cuts electricity bills','lowers power bills','降低電費'],['competing models','other models','競爭型號'],['households','families','家庭'],['familiar brands','brands they know','熟悉品牌'],['better alternative','better choice','更好選擇']],
  [['Advertising','Ads','廣告'],['quality alone','good quality alone','單憑品質'],['perceived risk',"people's worries",'主觀感到的風險']],
  [['a brand is unfamiliar','people do not know a brand','品牌不熟悉'],['reliability','works well','可靠性'],['after-sales service','help after purchase','售後服務'],['highly effective','does its job well','十分有效']],
  [['reduces this hesitation','ease these worries','減少猶豫'],['demonstrations','showing the product in use','產品示範'],['guarantees','promises','保證'],['certifications','official approvals','認證'],['consistent brand messages','repeating a clear message','一致品牌訊息'],['appear more credible','seem more trustworthy','顯得更可信']],
  [['For instance','For example','例如'],['start-up','new company','新創公司'],['may be overlooked','may be ignored','可能被忽視'],['materials used','what the bottles are made of','所用材料'],['testing standards met','which safety tests they passed','符合的測試標準'],['refund policy offered','how buyers can get their money back','退款政策']],
  [['In conclusion','In short','總而言之'],['completely disagree','fully disagree','完全不同意'],['advertising becomes unnecessary','does not need ads','廣告變得沒必要']],
  [['However useful a product may be','No matter how useful a product is','無論產品多實用'],['consumers','people','消費者'],['information','facts','資訊'],['reassurance','reasons to trust it','安心感'],['remain unnoticed and untrusted','remain unknown and not trusted','繼續無人注意和不受信任']],
];
const chunkOverrides=[
  ['In competitive markets,','even products that genuinely solve consumers’ problems','do not automatically sell themselves.'],
  ['Some people therefore argue','that advertising is unnecessary','if a product is already high-quality and useful.'],
  ['This essay completely disagrees,','because advertising is still essential both for informing consumers','and for helping good products gain credibility in crowded markets.'],
  ['The first reason advertising remains necessary','is that consumers cannot choose a product','they have never encountered.'],
  ['In most industries, buyers face countless similar options','and do not have time to research each one independently.'],
  ['Advertising therefore performs an informative function:','it tells people what a product does, who it is for,','how it differs from rival goods','and where it can be bought.'],
  ['Without this information,','even an excellent product may remain invisible,','meaning consumer needs are not met in practice.'],
  ['For example, a small company may produce an energy-efficient washing machine','that cuts electricity bills and lasts longer than competing models,','yet many households will still buy familiar brands','if they never hear about this better alternative.'],
  ['Advertising is also necessary','because quality alone does not remove perceived risk.'],
  ['When a brand is unfamiliar,','consumers may still worry about reliability, safety or after-sales service,','even if the product itself is highly effective.'],
  ['Advertising reduces this hesitation by showing','demonstrations, guarantees, certifications and consistent brand messages,','all of which make a company appear more credible.'],
  ['For instance, a start-up producing safer baby bottles','may be overlooked until its advertising explains','the materials used, the testing standards met','and the refund policy offered.'],
  ['In conclusion, I completely disagree','that advertising becomes unnecessary when a product is good.'],
  ['However useful a product may be,','consumers still need information and reassurance,','and without advertising many excellent goods','would remain unnoticed and untrusted.'],
];
const simpleChunkOverrides=[
  ['In a crowded market,','even products that really solve buyers\' problems','will not always sell on their own.'],
  ['So some people say','ads are not needed','when a product is already good and useful.'],
  ['I fully disagree,','because ads are still needed to tell people about products','and help good products earn trust when there are many choices.'],
  ['First, ads are still needed','because people cannot choose a product','they have never heard of.'],
  ['In most fields, buyers see many similar products','and do not have time to study each one themselves.'],
  ['So ads give useful facts:','what a product does, who needs it,','how it is different from other products,','and where to buy it.'],
  ['Without these facts,','even a very good product may stay unknown,','so people\'s needs may not be met in real life.'],
  ['For example, a small company may make a washing machine','that uses less energy, lowers power bills and lasts longer than other models,','but many families will still buy brands they know','if they never learn about this better choice.'],
  ['Ads are also needed','because good quality alone does not remove people\'s worries.'],
  ['When people do not know a brand,','they may still worry whether the product works well, is safe,','or comes with help after purchase,','even if it does its job well.'],
  ['Ads can ease these worries by showing the product in use,','explaining promises and official approvals,','and repeating a clear message;','together these make the company seem more trustworthy.'],
  ['For example, a new company making safer baby bottles','may be ignored until its ads explain','what the bottles are made of, which safety tests they passed','and how buyers can get their money back.'],
  ['In short, I fully disagree','that a good product does not need ads.'],
  ['No matter how useful a product is,','people still need facts and reasons to trust it;','without ads, many excellent products','would remain unknown and not trusted.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({
  example,answerReason,distractorReason,distractors,frame,
});
const structures=[
  S('In crowded cities, even useful public gardens do not automatically attract visitors.','In 設定環境，even 指出有實際價值仍不足以保證人們知道或使用。','這句用 even 表示一項正面條件仍未必帶來預期結果。',[4,8,12],
    F('In [競爭或選擇繁多的環境], even [真正有用的事物] do not automatically [預期結果]','先設定環境；even 強調即使事物有用，預期結果仍不會自動發生。','要反駁「本身有用就必然成功」一類假設時。',[['In','link','設定環境'],[' competitive markets','slot','競爭或選擇繁多的環境'],[', even','link','引出仍不足夠的條件'],[' products that genuinely solve consumers’ problems ','slot','真正有用的事物'],['do not automatically','link','否定必然性'],[' sell themselves.','slot','預期結果']])),
  S('Some people therefore argue that public signs are unnecessary if a street is already easy to find.','轉述他人看法，if 指出他們認為足以令提示變得多餘的條件。','這句以 Some people therefore argue that 轉述觀點，再用 if 說明其條件。',[0,3,9],
    F('Some people therefore argue that [某做法沒有必要] if [他們認為已足夠的條件]','中立轉述一項看法；if 是該看法成立的條件，尚未表示作者同意。','引言要交代題目中的主張，以及支持者認為何種條件令某做法多餘時。',[['Some people therefore argue that','link','轉述他人主張'],[' advertising is unnecessary ','slot','某做法沒有必要'],['if','link','指出主張所依賴的條件'],[' a product is already high-quality and useful.','slot','他們認為已足夠的條件']])),
  S('This essay completely disagrees, because public notices are essential both for guiding visitors and for keeping them safe in a large building.','先清楚反對，再用 both for...and for 預告兩項不同用途。','這句用 because 與 both for...and for 預告兩條支持立場的理由。',[1,4,8],
    F('This essay completely disagrees, because [做法] is essential both for [用途一] and for [用途二]','先明確表態；後面以兩種不同用途說明做法為何仍必要。','題目說某做法已無必要，而作者有兩項獨立功能可用來反駁時。',[['This essay completely disagrees, because','link','表態並引出理由'],[' advertising ','slot','做法'],['is still essential both for','link','指出第一用途'],[' informing consumers ','slot','用途一'],['and for','link','指出第二用途'],[' helping good products gain credibility in crowded markets.','slot','用途二']])),
  S('The first reason clear maps remain necessary is that travellers cannot reach a place they have never heard of.','首項理由不是地點品質，而是使用者必須先知道它存在。','這句用 The first reason...is that 引出「先被看見」這個必要條件。',[0,2,8],
    F('The first reason [做法仍必要] is that [使用者] cannot choose [從未接觸的事物]','先表明做法仍必要，再指出人要先接觸或知道一項選擇，才可能選它。','一項選擇即使有價值，使用者仍不知道它，須解釋告知功能時。',[['The first reason ','link','引出首項理由'],['advertising remains necessary ','slot','做法仍必要'],['is that','link','說明必要條件'],[' consumers ','slot','使用者'],['cannot choose','link','無法選擇'],[' a product they have never encountered.','slot','從未接觸的事物']])),
  S('In most cities, visitors face many similar routes and do not have time to study every one of them.','先指出選擇繁多，再指出使用者沒有足夠時間逐一研究。','這句並列多選項與時間限制，為資訊提示的必要性鋪路。',[0,3,10],
    F('In most [場景], [使用者] face [大量相似選擇] and do not have time to [逐一研究]','選項數量與時間有限共同解釋為何使用者需要簡明資訊。','要說明使用者為何不能單靠自己逐項查證時。',[['In most','link','設定普遍場景'],[' industries','slot','場景'],[',','link','接使用者情況'],[' buyers ','slot','使用者'],['face','link','面對'],[' countless similar options ','slot','大量相似選擇'],['and do not have time to','link','說明時間限制'],[' research each one independently.','slot','逐一研究']])),
  S('A school guide therefore performs an informative function: it tells families what courses exist, who may join, how they differ and where to apply.','冒號把「提供資訊」展開為使用者真正需要知道的四件事。','這句先概括資訊功能，再以冒號列出可核查的具體問題。',[3,4,10],
    F('[資訊工具] therefore performs an informative function: it tells people [用途], [對象], [差異] and [取得方式]','先下判斷，再列用途、適用對象、與其他選擇的差異及取得途徑。','已說使用者資訊不足，要具體交代一則訊息應回答甚麼問題時。',[['Advertising ','slot','資訊工具'],['therefore performs an informative function: it tells people','link','交代資訊功能'],[' what a product does','slot','用途'],[',','link','並列適用對象'],[' who it is for','slot','對象'],[',','link','並列差異'],[' how it differs from rival goods ','slot','差異'],['and','link','並列取得方式'],[' where it can be bought.','slot','取得方式']])),
  S('Without clear directions, even a useful clinic may remain unknown, meaning patients still cannot use its services.','Without 提出缺少資訊；meaning 補充「不被看見」的實際使用後果。','這句把缺資訊、服務不被發現與需要未被滿足連成三步。',[0,4,9],
    F('Without [關鍵資訊], even [有價值的選擇] may [不被發現], meaning [需求仍未滿足]','先指出缺甚麼資訊，再審慎說明有價值的選擇可能仍無人知道，最後解釋實際後果。','要說明本身有用但未被看見時，使用者為何仍不能受惠時。',[['Without','link','提出資訊缺口'],[' this information','slot','關鍵資訊'],[', even','link','強調價值仍不足'],[' an excellent product ','slot','有價值的選擇'],['may','link','保留可能性'],[' remain invisible','slot','不被發現'],[', meaning','link','說明實際含意'],[' consumer needs are not met in practice.','slot','需求仍未滿足']])),
  S('For example, a small firm may produce a safer cycle helmet, yet many cyclists will still buy familiar brands if they never hear about it.','例子對照實際優點與使用者仍選熟悉商品，if 說明資訊缺口。','這句用 yet 與 if 展示「更好」仍可能輸給「被知道」。',[3,6,11],
    F('For example, [新供應者] may produce [有具體優點的選擇], yet [使用者] will still buy [熟悉選擇] if [未得知新選擇]','用具體例子說明新選擇的優點並不保證被採用；if 指出沒有得知資訊的情況。','要以一個對照例子解釋為何品質或實際優點仍不足以吸引使用者時。',[['For example,','link','引出具體例子'],[' a small company ','slot','新供應者'],['may produce','link','可能提供'],[' an energy-efficient washing machine that cuts electricity bills and lasts longer than competing models','slot','有具體優點的選擇'],[', yet','link','指出反差'],[' many households ','slot','使用者'],['will still buy','link','仍會選擇'],[' familiar brands ','slot','熟悉選擇'],['if','link','指出資訊缺口'],[' they never hear about this better alternative.','slot','未得知新選擇']])),
  S('Clear labels are also necessary because quality alone does not remove parents’ worries.','第二條理由轉向信任：品質本身仍不足以消除主觀顧慮。','這句用 because 解釋某項資訊為何在已有品質時仍必要。',[2,3,9],
    F('[告知做法] is also necessary because [客觀優點] alone does not remove [使用者主觀顧慮]','also 引入另一理由；because 指出客觀品質與使用者感到安心之間仍有距離。','已說明如何讓人知道一項選擇，接着要解釋為何還須建立信任時。',[['Advertising ','slot','告知做法'],['is also necessary because','link','引出另一理由'],[' quality ','slot','客觀優點'],['alone does not remove','link','指出仍不足'],[' perceived risk.','slot','使用者主觀顧慮']])),
  S('When a school is unfamiliar, parents may worry about safety and teaching quality, even if its results are strong.','When 設定不熟悉的情況，even if 承認客觀表現好仍可能有顧慮。','這句區分使用者的擔心與產品本身的客觀效果。',[0,6,8],
    F('When [提供者不熟悉], [使用者] may worry about [多種風險], even if [客觀品質良好]','先說不熟悉帶來的顧慮，然後以 even if 承認實際品質好也不能自動消除顧慮。','要指出資訊及信任缺口仍存在，避免把主觀擔心等同品質差時。',[['When','link','設定不熟悉情況'],[' a brand is unfamiliar','slot','提供者不熟悉'],[',','link','接上顧慮'],[' consumers ','slot','使用者'],['may still worry about','link','保留可能性並指出擔心'],[' reliability, safety or after-sales service','slot','多種風險'],[', even if','link','承認客觀品質'],[' the product itself is highly effective.','slot','客觀品質良好']])),
  S('A college reduces this hesitation by showing student work, clear fees and independent checks, all of which make it appear more credible.','by showing 列出可見證據；all of which 指回整組證據，說明它們如何建立可信度。','這句把具體資訊與顧慮減少連起來，不只空泛叫人信任。',[5,6,11],
    F('[告知做法] reduces [猶豫] by showing [具體證據], all of which make [公司] appear more credible','先列可檢查的證據，再用 all of which 指回整組證據，說明可信度如何提高。','要解釋展示哪些具體資訊可減少使用者顧慮時。',[['Advertising ','slot','告知做法'],['reduces','link','減少'],[' this hesitation ','slot','猶豫'],['by showing','link','引出證據'],[' demonstrations, guarantees, certifications and consistent brand messages','slot','具體證據'],[', all of which make','link','指回整組證據及其作用'],[' a company ','slot','公司'],['appear more credible.','link','可信度效果']])),
  S('For instance, a new tutoring service may be overlooked until its website explains the tutors’ training, lesson plans and refund rules.','until 標出轉變點：具體資訊被說明前，服務可能一直被忽視。','這句以新服務的具體資料展示可信度如何被建立。',[5,7,10],
    F('For instance, [新提供者] may be overlooked until [其資訊] explains [證據一], [證據二] and [保障措施]','例子先指出新提供者可能未被注意，until 後列出能讓人判斷品質與風險的具體資料。','要以具體例子展示新品牌如何回答使用者顧慮時。',[['For instance,','link','引出具體例子'],[' a start-up producing safer baby bottles ','slot','新提供者'],['may be overlooked until','link','標示被注意的轉變點'],[' its advertising ','slot','其資訊'],['explains','link','開始列證據'],[' the materials used','slot','證據一'],[',','link','並列第二證據'],[' the testing standards met ','slot','證據二'],['and','link','並列保障措施'],[' the refund policy offered.','slot','保障措施']])),
  S('In conclusion, I completely disagree that clear public information becomes unnecessary when a service is good.','結論重申反對「品質好便不需告知」的立場。','這句以 In conclusion 收束並直接回答原先的主張。',[1,2,8],
    F('In conclusion, I completely disagree that [告知做法] becomes unnecessary when [事物有價值]','結論重申反對「有品質便不需要告知」；不引入新的論點。','已完成資訊與信任兩條論證，結尾要清楚回應原題時。',[['In conclusion, I completely disagree that','link','收束並重申反對'],[' advertising ','slot','告知做法'],['becomes unnecessary when','link','指出被反對的條件推論'],[' a product is good.','slot','事物有價值']])),
  S('However useful a new clinic may be, patients still need clear details and reassurance, and without public notices it may remain unknown and untrusted.','However useful 讓步承認實際價值，後面重申資訊、安心感與缺乏告知的後果。','這句以讓步加上 without 收束兩條理由。',[0,6,9],
    F('However useful [事物] may be, [使用者] still need [資訊與安心], and without [告知方式] [有價值事物] would remain [兩項缺失]','先承認事物實用，再說使用者仍需資訊與安心；without 收束缺乏告知後的不被看見及不受信任。','結尾要承認對方的品質前提，同時重申兩個缺口仍須處理時。',[['However useful','link','讓步承認實用'],[' a product ','slot','事物'],['may be,','link','轉回仍需條件'],[' consumers ','slot','使用者'],['still need','link','指出仍然需要'],[' information and reassurance','slot','資訊與安心'],[', and without','link','指出缺告知後果'],[' advertising ','slot','告知方式'],['many excellent goods ','slot','有價值事物'],['would remain','link','說明後果'],[' unnoticed and untrusted.','slot','兩項缺失']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({
  type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',
  items:rows.map(([title,body])=>({title,body})),why,
});
const intro=[
  Q('作者是否同意「產品夠好便不需廣告」？',[
    '完全不同意：消費者仍須知道產品存在，也需要可信資料來消除顧慮',
    '完全同意：品質好便保證所有買家自動知道並相信產品',
    '部分同意：只准大型企業使用廣告，小公司毋須介紹產品',
    '沒有表態：全文只討論洗衣機售價',
  ],'引言和結論都明說 completely disagree；兩條主線是提供資訊與建立可信度。'),
  {type:'multi',prompt:'選出作者的兩條主要反駁理由',detail:'選兩項，再按「確認」。',options:[
    '買家不知道產品存在或用途時，即使產品好，也無法選擇它',
    '買家即使知道產品，也可能擔心安全、可靠性和售後服務',
    '廣告一出現，所有產品便必然比競爭者好',
    '只要品牌熟悉，產品就不必符合安全標準',
  ],correct:[0,1],why:'第一主體段處理資訊不足；第二主體段處理對陌生品牌的風險感與信任。'},
];
const route=[sequence('先排好整篇四段的論證路線',[
  ['引言 · 立場','好產品也不會自動暢銷；完全反對「品質好便不需廣告」，預告資訊與可信度兩項用途。'],
  ['主體段一 · 被看見','買家面對眾多選擇；廣告解答產品用途、適用者、差異與購買途徑。'],
  ['主體段二 · 被信任','陌生品牌仍令買家擔心；示範、保證、認證與政策資訊可降低猶豫。'],
  ['結論 · 兩個缺口','即使產品有用，消費者仍需資訊與安心感；否則好產品可能既無人注意也不受信任。'],
],'本身有用仍不足 → 先讓買家知道 → 再提供可信證據 → 重申兩種需要。')];
const evidence=[
  Q('第一主體段指出買家為何無法只靠自己找到最合適產品？',[
    '相似選擇太多，而買家沒有時間逐一自行研究',
    '所有買家都永遠只會購買最昂貴的商品',
    '只要產品品質好，買家便會自動知道它的位置',
    '各行業只有一款產品，因此比較根本不可能',
  ],'原文同時指出 countless similar options 和沒有時間 independently research each one。'),
  Q('廣告的資訊功能，在原文包括哪四項問題？',[
    '產品用途、適用對象、與其他商品的差異，以及購買途徑',
    '只需寫價格，其他所有資訊都與購物無關',
    '只列公司辦公室面積和員工人數',
    '只稱產品很好，不必說明它如何使用',
  ],'冒號後明列 what it does、who it is for、how it differs、where it can be bought。'),
  Q('節能洗衣機的例子，用甚麼對照說明資訊不足的後果？',[
    '小公司有較省電、耐用的選擇，但未聽過它的家庭仍可能買熟悉品牌',
    '洗衣機較節能，所以所有家庭必然立即換機',
    '家庭都知道新產品，只是不願意比較價格',
    '熟悉品牌必定比新產品更節能和耐用',
  ],'yet 和 if 對照產品實際優點與買家從未得知該替代選擇的情況。'),
  Q('第二主體段所說 perceived risk 具體包括甚麼顧慮？',[
    '可靠性、安全性與售後服務，即使產品本身有效',
    '只擔心廣告字體太大，不會在意商品本身',
    '因產品新便能確定它一定不安全',
    '只要產品有效，所有買家都會立即相信陌生品牌',
  ],'作者特別把陌生品牌引起的主觀顧慮與產品本身 highly effective 分開。'),
  Q('原文認為廣告可用哪些資料減少猶豫？',[
    '產品示範、保證、認證與一致的品牌訊息',
    '只不斷重複「相信我們」，毋須任何具體內容',
    '只展示公司標誌，並隱藏保證和測試資料',
    '保證不實施退款，讓買家自行承擔全部風險',
  ],'這些具體訊息和證據可使公司顯得更可信，並非單靠讚美詞。'),
  Q('安全奶瓶例子中，新公司廣告須解釋哪三類資料？',[
    '所用材料、符合的測試標準及退款政策',
    '只需列奶瓶顏色和盒子尺寸',
    '只需說售價最低，不必談安全和保障',
    '只需報告公司創辦日期，便可證明產品安全',
  ],'until 之後列出的三項內容，正好回應陌生品牌的安全與售後顧慮。'),
];
const logic=[
  sequence('第一主體段：好產品為何仍可能無人購買？',[
    ['首項理由','買家不可能選擇從未接觸過的產品。'],
    ['搜尋限制','相似選擇太多，買家沒有時間逐一研究。'],
    ['廣告內容','用廣告說明用途、適用者、與競品差異和購買地方。'],
    ['缺資訊的後果','好產品可能不被看見，消費者需要也未能實際得到滿足。'],
    ['洗衣機例子','較省電耐用的新機若未被聽過，家庭仍可能買熟悉品牌。'],
  ],'選擇太多 → 資訊不足 → 有用產品不被發現 → 消費者仍選熟悉商品。'),
  sequence('第二主體段：被看見後為何還需要可信證據？',[
    ['另一理由','品質本身不足以消除消費者感到的風險。'],
    ['具體顧慮','陌生品牌令買家擔心可靠性、安全性及售後服務。'],
    ['證據途徑','示範、保證、認證與一致訊息可降低猶豫。'],
    ['奶瓶例子','新品牌須說明材料、測試標準和退款政策。'],
    ['全文收束','即使產品實用，買家仍需資訊和安心感。'],
  ],'品牌陌生 → 風險感仍在 → 提供可核查資料 → 品質較有機會被信任。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transfer=[
  T('市政府開設免費夜間語文班，但新移民家庭很少報名，因為不少人從未聽過。','哪項最能運用「先讓人知道，才可能選擇」？',[
    '先讓家庭知道課程時間、適用對象及報名方法，再評估參與情況',
    '課程免費便保證每戶家庭自動知道並報名',
    '只提升課室設備，不告知居民課程存在',
    '因報名少便斷定家庭完全不需要語文班',
  ],[
    '這保留「未被得知 → 無法選擇」的核心，並補足實際資訊。',
    '免費不會自動把課程資訊傳到每戶家庭。',
    '設備好仍可能無人知道課程。',
    '參與少可能是資訊缺口，不能直接推斷沒有需要。',
  ],[3,4,5,6],'範文說買家不可能選擇從未接觸的產品；告知用途、適用者和取得途徑才有實際作用。'),
  T('小公司製作一款省電冷氣機，價格合理，但顧客只認識舊品牌。','哪項最貼近洗衣機例子的論證？',[
    '指出省電優點不能自行傳開；顧客未知道新選擇時仍可能購買熟悉品牌',
    '因新機省電便保證所有家庭立即放棄舊品牌',
    '只比較公司規模，便認定新機必然不可靠',
    '要求停止公開省電資料，等顧客自行發現產品',
  ],[
    '這同時保留真實優點與資訊未傳到買家的反差。',
    '優點本身不保證每位買家得知或購買。',
    '公司規模不能直接證明產品可靠性。',
    '隱藏資料只會加大原文指出的資訊缺口。',
  ],[6,7],'原文節能洗衣機例子說：好選擇若未被聽過，家庭仍會買熟悉品牌。'),
  T('一間新診所提供較短輪候時間，但居民面對很多診所選擇。','哪組資訊最能轉用範文的四項資訊功能？',[
    '說明診所服務、適用病人、與其他診所的差異，以及預約方法',
    '只說「我們最好」，但不列服務或預約方法',
    '只刊登大樓照片，完全不說診所看甚麼症',
    '只列董事姓名，便當作病人已知道如何使用',
  ],[
    '這逐一回答用途、對象、差異與取得途徑。',
    '空泛稱讚無法支援具體選擇。',
    '外觀不能代替服務資訊。',
    '董事姓名無法讓病人知道如何預約。',
  ],[4,5],'範文以四個具體問題解釋廣告的資訊功能，而非只說「有宣傳」。'),
  T('公益機構推出災難求助應用程式，功能完善，但居民下載數很低。','哪項推論最符合範文的分寸？',[
    '先查居民是否知道應用程式的用途與下載方法，再判斷需求或品質',
    '下載數低便證明程式完全沒有實際用途',
    '功能好便代表所有居民已經知道它',
    '只換圖示顏色，不查居民是否知道求助流程',
  ],[
    '這先檢查資訊缺口，避免把低使用量直接等同沒用。',
    '使用少也可能是從未被接觸。',
    '實際品質不能自動產生知名度。',
    '圖示顏色不能取代用途與取得資訊。',
  ],[0,3,6],'範文說好產品不會自動暢銷；缺少資訊時，即使優秀也可能不被發現。'),
  T('家長知道有一個新托兒中心，但不熟悉營辦者。','哪項最能應用「知道存在仍可能不信任」？',[
    '提供安全安排、員工資歷與退款規則，回應家長對陌生機構的顧慮',
    '只讓家長知道地址，便推論他們已完全相信服務',
    '因家長有顧慮便斷言中心客觀上一定不安全',
    '只重複「放心」，不提供任何可核查資料',
  ],[
    '這轉用陌生品牌風險與具體證據降低猶豫的第二條論證。',
    '知道地點不等於消除安全與售後顧慮。',
    '主觀擔心與客觀安全須分開。',
    '沒有證據的口號難以回應具體顧慮。',
  ],[8,9,10,11],'範文說品質好也未必消除風險感；材料、測試和退款等資料能回應陌生品牌的疑問。'),
  T('新品牌聲稱嬰兒座椅安全，但只在廣告中寫「值得信賴」。','哪項最能轉用奶瓶例子？',[
    '展示材料、通過的測試與退換保障，讓家長檢查安全聲稱',
    '把「值得信賴」放大，毋須解釋任何安全資料',
    '因座椅有廣告便認定它已取得所有認證',
    '只比較廣告觀看次數，便證明產品沒有風險',
  ],[
    '這以可核查的材料、測試及保障資訊建立可信度。',
    '口號無法回答家長的具體問題。',
    '有廣告不等於已獲認證。',
    '觀看次數不能代替安全證據。',
  ],[9,10,11],'範文的奶瓶例子具體要求說明材料、測試標準與退款政策。'),
  T('一家網店售賣耐用雨衣，顧客卻擔心尺寸不合與售後安排。','哪項能正確轉用第二條主線？',[
    '展示實際穿着、產品保證和退貨方法，降低購買前的不確定',
    '只證明雨衣防水，便認為尺寸與退貨疑問不存在',
    '隱藏退貨規則，讓顧客下單後自行發現',
    '把產品描述刪除，單靠「耐用」兩字建立信任',
  ],[
    '這把示範與售後保障對應到顧客的具體風險感。',
    '一項客觀優點不能回答所有不同顧慮。',
    '隱藏政策會使不確定性增加。',
    '空泛形容詞無法代替可檢查資料。',
  ],[8,9,10],'範文說 quality alone 不會消除 perceived risk；示範和保證可降低猶豫。'),
  T('一間新線上銀行提供低費用服務，但用戶擔心資料安全。','哪項最能同時處理兩條論證？',[
    '先說清服務用途與開戶方法，再展示安全認證及遇到問題時的處理方式',
    '只公布費用，便假設用戶已明白服務並完全信任銀行',
    '只展示安全標誌，不解釋銀行提供甚麼服務',
    '因銀行新便保證所有人都不會使用，毋須提供資訊',
  ],[
    '這同時補足「知道如何選」與「有理由相信安全」兩個缺口。',
    '低費用不能單獨回答用途、取得方式及安全顧慮。',
    '只有認證仍可能缺少基本服務資訊。',
    '新品牌可能有顧慮，但不能作必然預測。',
  ],[3,5,8,9,10],'範文兩段分別談資訊功能與陌生品牌的可信度，結論重申兩者都需要。'),
  T('市集有一個農戶提供新鮮蔬菜，攤位卻沒有產地、價格或開放時間資料。','哪項最能說明「有用仍需被看見」？',[
    '補上產地、價格及購買時間，讓買家能識別和比較這個選擇',
    '蔬菜新鮮便代表每位買家已知道攤位何時開放',
    '只把蔬菜排得整齊，不提供任何購買方法',
    '以銷量低直接證明蔬菜品質差',
  ],[
    '這把實際品質轉成買家可用於選擇的資訊。',
    '品質不會自動傳達攤位時間。',
    '陳列可能吸引目光，但仍缺具體判斷資訊。',
    '低銷量也可能來自未被發現。',
  ],[0,3,4,5,6],'範文說有用產品不會自動被買家知道；資訊應回答用途、差異及在哪裏購買。'),
  T('校方推出新的獎學金，學生已看過名稱，卻不確定申請資格和審核標準。','哪項最能區分「被知道」與「被信任」？',[
    '公開資格、評審與申訴安排，讓學生知道自己能否申請並理解程序',
    '獎學金名稱已公開，所以學生必然知道全部細節',
    '只增加海報數量，不改善模糊的資格說明',
    '因學生有疑問，便斷言獎學金本身毫無價值',
  ],[
    '這同時提供可選擇的資訊與能降低程序顧慮的證據。',
    '知道名稱不等於理解規則。',
    '更多相同海報不會補足缺漏資訊。',
    '疑問可由資訊不足造成，不必然否定獎學金價值。',
  ],[5,8,9,10,13],'範文結論說使用者既需要 information，也需要 reassurance。'),
  T('一款新型防火警報器通過測試，但宣傳沒有寫出測試內容。','哪項最符合範文對證據的要求？',[
    '清楚呈現測試標準、產品示範及保證內容，讓買家核查安全性',
    '只說產品通過測試，卻不讓買家知道是甚麼測試',
    '以廣告是否悅目取代對安全與可靠性的分析',
    '因警報器客觀上有效，便認為買家不會有任何顧慮',
  ],[
    '這把客觀測試變成消費者可用來判斷的資訊。',
    '不說明標準時，認證訊息仍難被理解。',
    '視覺吸引力不能代替安全證據。',
    '客觀效果好仍不能自動消除風險感。',
  ],[8,9,10,11],'範文提及認證、示範和測試標準，目的在於減少對陌生產品的猶豫。'),
  T('另一位學生說：「服務夠好，宣傳一定沒有任何必要。」','哪項回答最完整保留範文立場？',[
    '承認服務品質重要，再檢查使用者是否知道它並有足夠資料相信它',
    '服務品質重要，所以每個人都會自動聽說並相信它',
    '只要宣傳夠多，服務品質便不必再改善',
    '因有人提出疑問，便禁止所有新服務提供資訊',
  ],[
    '這承認品質前提，同時重申「被看見」與「被信任」的兩個必要環節。',
    '品質本身不能完成資訊傳遞或建立信任。',
    '範文沒有說宣傳可以取代產品品質。',
    '資訊不足更需要清楚說明，而非禁止告知。',
  ],[0,2,3,8,13],'範文在結論以 However useful... 讓步承認產品實用，仍指出消費者需要資訊與安心感。'),
];
export default {
  key:'opinion:8',
  meta:{topic:'好產品仍需要廣告的資訊與信任功能',summary:'作者完全反對「產品夠好便不需廣告」：消費者須先知道產品，亦須從示範、保證及測試等資料建立信任。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
