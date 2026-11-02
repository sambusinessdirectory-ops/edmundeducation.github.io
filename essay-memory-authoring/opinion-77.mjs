import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:77'].map(x=>x.english);
const simple=[
'Advertising is a very strong tool in business today, and fast food companies use it very well.',
'Some say all companies should be free to advertise, but I think fast food companies should not advertise because their food may harm health and their ads often reach people who are easily influenced.',
'The main reason to stop fast food ads is that they make unhealthy eating more common.',
'Fast food often has a lot of salt, sugar, and fat, so seeing attractive ads again and again can make it seem like an everyday meal rather than a rare choice.',
'This is especially harmful because ads do more than give facts; they make people want things.',
'For example, a busy worker who often sees posters and internet ads for fried food may choose a quick meal instead of cooking healthier food.',
'In the long run, this may add to weight problems, heart disease, and other health problems linked to food.',
'So limiting these ads would be a fair way to help protect people’s health.',
'Another point is that fast food ads often affect children and teens, who may not yet know how to judge ads carefully.',
'Bright colours, cartoons, famous people, and easy-to-remember phrases can make unhealthy food look fun and safe.',
'Companies may say they are just using their right to advertise, but this right should not harm the health of young people.',
'Society already limits ads for some harmful things, like cigarettes, because making money should not matter more than health.',
'Fast food may be less dangerous than tobacco, but the same rule still matters: if a product causes serious problems for society, its ads should be limited.',
'In short, I strongly think fast food companies should not be free to advertise without limits.',
'Business freedom matters, but people’s health matters more, especially when children and eating habits over many years are involved.',
];
const vocabulary=[
[['one of the most powerful tools','a very strong tool','最有力工具之一'],['modern business','business today','現代商業'],['fast food brands','fast food companies','快餐品牌'],['especially well','very well','尤其善用']],
[['promote its products','advertise','推廣產品'],['damage public health','harm health','損害公共健康'],['marketing','ads','營銷'],['vulnerable consumers','people who are easily influenced','容易受影響的消費者']],
[['strongest reason','main reason','最有力原因'],['banning fast food advertising','stop fast food ads','禁止快餐廣告'],['encourages unhealthy eating habits on a large scale','make unhealthy eating more common','大規模鼓勵不健康飲食']],
[['high in salt, sugar, and fat','a lot of salt, sugar, and fat','高鹽糖脂'],['repeated exposure','seeing attractive ads again and again','反覆接觸'],['normal part of daily life','everyday meal','日常生活一部分'],['occasional choice','rare choice','偶爾選擇']],
[['particularly harmful','especially harmful','尤其有害'],['provide information','give facts','提供資訊'],['creates desire','make people want things','製造慾望']],
[['constantly sees','often sees','經常看見'],['online promotions','internet ads','網上促銷'],['more likely to buy','may choose','更可能購買'],['preparing something healthier','cooking healthier food','準備健康食物']],
[['Over time','In the long run','長遠而言'],['contribute to obesity','add to weight problems','導致肥胖'],['diet-related problems','health problems linked to food','與飲食相關的問題']],
[['restricting these advertisements','limiting these ads','限制廣告'],['reasonable way','fair way','合理方式'],['protect public health','protect people’s health','保護公共健康']],
[['marketing','ads','營銷'],['influences children and teenagers','affect children and teens','影響兒童青少年'],['maturity','know how','成熟度'],['judge advertising critically','judge ads carefully','批判判斷廣告']],
[['cartoon characters','cartoons','卡通人物'],['celebrity endorsements','famous people','名人代言'],['catchy slogans','easy-to-remember phrases','朗朗上口標語'],['exciting and harmless','fun and safe','吸引且無害']],
[['exercising their commercial freedom','using their right to advertise','行使商業自由'],['at the expense of young people’s well-being','harm the health of young people','以年輕人福祉為代價']],
[['limits the advertising','limits ads','限制廣告'],['such as cigarettes','like cigarettes','例如香煙'],['profit','making money','利潤'],['placed above health','matter more than health','置於健康之上']],
[['as dangerous as tobacco','less dangerous than tobacco','與煙草同樣危險'],['same basic principle applies','same rule still matters','同一基本原則適用'],['serious social costs','serious problems for society','嚴重社會成本'],['should be controlled','should be limited','應受控制']],
[['In conclusion','In short','總結'],['strongly believe','strongly think','強烈認為'],['right to advertise freely','free to advertise without limits','自由賣廣告權利']],
[['Business freedom','Business freedom','商業自由'],['public health','people’s health','公共健康'],['long-term eating habits','eating habits over many years','長期飲食習慣']],
];
const chunkOverrides={4:['This is particularly harmful because advertising does not simply provide information;','it creates desire.'],7:['Therefore, restricting these advertisements','would be a reasonable way to protect public health.'],13:['In conclusion, I strongly believe','that fast food companies should not have the right to advertise freely.']};
const simpleChunkOverrides={4:['This is especially harmful because ads do more than give facts;','they make people want things.'],7:['So limiting these ads','would be a fair way to help protect people’s health.'],13:['In short, I strongly think','fast food companies should not be free to advertise without limits.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'留意讓步、因果或比較如何服務論點。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Advertising','modern business','fast food brands'],['Social media','modern education','young students'],'引言指出一種工具普及及一方善用它。','開篇要建立某工具在特定領域的影響時。',[1,2,3]),
makeStructure(1,['every company','fast food companies','their products can damage public health','their marketing often targets vulnerable consumers'],['every platform','gambling companies','their services can cause financial harm','their promotions often reach vulnerable users'],'先承認自由主張，再表立場及兩項理由。','題目呈現自由與保護衝突，需清楚回答立場時。',[0,2,10]),
makeStructure(2,['banning fast food advertising','it encourages unhealthy eating habits on a large scale'],['restricting gambling promotions','they can normalise risky behaviour across a large audience'],'主體段先指出限制廣告的廣泛行為影響。','討論規管時，要先說明被規管行為怎樣造成問題。',[1,3,7]),
makeStructure(3,['Fast food','salt, sugar, and fat','attractive advertisements','it as a normal part of daily life rather than an occasional choice'],['Online betting','risk, debt, and uncertainty','attractive promotions','it as a routine activity rather than a rare decision'],'由產品特性、重複宣傳推到習慣正常化。','解釋宣傳如何把偶爾行為推成日常習慣時。',[2,4,5]),
makeStructure(4,['advertising','information','desire'],['promotion','facts','a wish to buy'],'指出宣傳不只告知，也會激發欲望。','反駁「廣告只提供資訊」的簡化說法時。',[2,3,5]),
makeStructure(5,['a busy worker','posters and online promotions for fried food','a quick meal','something healthier'],['a tired student','repeated online promotions for energy drinks','a sweet drink','water'],'以生活情境展示反覆接觸如何改變選擇。','已講一般機制，要用 instead of 在具體例子中呈現兩個選擇時。',[3,4,6]),
makeStructure(6,['this','obesity, heart disease, and other diet-related problems'],['that habit','debt, stress, and other financial problems'],'連結短期選擇與長期社會成本。','說明行為累積後可能帶來的後果時。',[3,5,7]),
makeStructure(7,['restricting these advertisements','protect public health'],['limiting such promotions','protect younger users'],'由已論證的風險推到合理政策。','已有風險與例子，要提出相應限制措施時。',[2,6,12]),
makeStructure(8,['fast food marketing','children and teenagers','advertising critically'],['gambling promotions','young adults','risk claims critically'],'新增理由：受眾未必具備批判判斷能力。','轉到某些群體更難識別宣傳影響的理由時。',[1,9,10]),
makeStructure(9,['Bright colours, cartoon characters, celebrity endorsements, and catchy slogans','unhealthy food','exciting and harmless'],['Quick rewards, friendly mascots, famous names, and catchy lines','risky products','fun and safe'],'列出吸引注意的廣告技巧及誤導性印象。','需說明宣傳使用哪些具體手法使風險看似無害時。',[8,10,11]),
makeStructure(10,['companies','their commercial freedom','young people’s well-being'],['platforms','their freedom to promote services','users’ financial safety'],'承認商業自由，但設受眾福祉優先的界線。','平衡企業自由與他人實質風險時。',[1,8,12]),
makeStructure(11,['some harmful products','cigarettes','profit','health'],['some risky services','online betting','sales','public safety'],'引用已有規管先例支持健康優先。','要顯示限制宣傳已有類似原則可依時。',[10,12,14]),
makeStructure(12,['Fast food','tobacco','a product','serious social costs'],['Energy drinks','tobacco','a product','serious health costs'],'承認風險程度不同，仍援用同一規管原則。','類比兩件事時，先指出程度差異再提共同準則。',[10,11,14]),
makeStructure(13,['fast food companies','advertise freely'],['gambling platforms','promote themselves freely'],'結論重申反對不受限的廣告權利。','結論要直接回覆企業是否可不受限制宣傳時。',[1,12,14]),
makeStructure(14,['Business freedom','public health','children and long-term eating habits'],['Commercial choice','consumer safety','young users and lasting financial habits'],'以價值排序總結自由與公共利益的取捨。','結論需指出兩個正當價值何者在特定風險下優先時。',[10,11,13]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文的推進次序，逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者支持哪種廣告政策？',['反對快餐公司自由賣廣告，重視健康與兒少保護','支持所有公司毫無限制地宣傳','只要求廣告加上產品售價','認為快餐廣告與飲食選擇毫無關係'],'作者明確支持限制快餐廣告。'),{type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['反覆宣傳可把高鹽糖脂快餐變成日常習慣','兒童青少年較難批判判斷吸引人的廣告','快餐比煙草在每方面都一樣危險','廣告完全沒有激發慾望的能力'],correct:[0,1],why:'一段談習慣與健康，一段談易受影響的年輕人。'}];
const route=[sequence('排好全文四段', [['引言 · 選擇立場','承認宣傳自由主張，轉而支持限制快餐廣告。'],['主體一 · 習慣與健康','反覆曝光可使快餐日常化，累積飲食健康風險。'],['主體二 · 年輕受眾','廣告手法吸引兒少；商業自由應受健康界線約束。'],['結論 · 價值排序','商業自由重要，公共健康與兒少福祉更重要。']],'宣傳自由 → 健康代價 → 易受影響者 → 合理限制。')];
const evidence=[Q('廣告除了提供資訊，還會怎樣？',['激發想要購買的慾望','只記錄商店地址','自動改善食品營養','保證所有人拒絕快餐'],'creates desire。'),Q('快餐廣告正常化的是甚麼？',['把快餐看成日常而非偶爾選擇','只在節慶時吃快餐','把快餐當成醫療處方','所有觀眾都不再看廣告'],'repeated exposure can make it normal。'),Q('第二段列出哪些吸引年輕人的技巧？',['亮色、卡通、名人與順口標語','只有營養成分與稅率','只有醫生的病歷記錄','只有食店的租約條款'],'原文列四類營銷手法。'),Q('煙草例子在論證中有甚麼作用？',['展示有害產品廣告受限的先例','聲稱快餐與煙草危害完全相等','證明所有公司都應禁止經營','說明廣告不影響任何受眾'],'作者明言快餐未必與煙草同樣危險。')];
const logic=[sequence('主體一：反覆曝光怎樣影響健康？',[['產品特性','快餐常高鹽、糖、脂。'],['宣傳機制','反覆吸引人的廣告使它顯得日常。'],['個人例子','忙碌上班族更可能買快捷餐。'],['累積後果','可增加肥胖、心臟病等風險。'],['政策推論','限制廣告可合理保護公共健康。']],'食物特性 → 欲望與選擇 → 長期代價 → 限制。'),sequence('主體二：為何商業自由要設界線？',[['受眾','兒童青少年未必能批判判斷。'],['手法','亮色、卡通、名人及標語淡化風險。'],['價值衝突','商業自由不應以年輕人福祉為代價。'],['先例','有害產品如香煙的廣告已有規管。'],['原則','嚴重社會成本可支持廣告控制。']],'易受影響者 → 廣告手法 → 自由邊界 → 規管原則。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('網上賭博平台反覆用名人宣傳，學生漸把下注當作日常娛樂。','可遷移哪條論證？',['重複宣傳可能令高風險行為顯得平常','名人出現便保證所有學生不再下注','只要娛樂合法，宣傳便不可能有影響','學生看過廣告就必定立即嚴重欠債'],['對應正常化機制。','無此保證。','合法仍可影響。','非必然後果。'],[3,4,9],'repeated exposure normalises choice'),
T('飲料廣告聲稱只列產品資料，卻用動畫人物製造購買衝動。','哪項反駁最貼近文章？',['廣告不只傳遞資訊，也會刻意激發欲望','動畫出現就證明飲料一定含有毒物','產品資料一列出，廣告便不會影響人','購買衝動只會來自家庭，與宣傳無關'],['information versus desire。','未談毒物。','仍可影響。','宣傳可作用。'],[4,9],'does not simply provide information; creates desire'),
T('一名忙碌員工常見速食優惠，漸少自己煮食。','這個例子支持哪個連結？',['反覆促銷可改變日常餐食選擇與習慣','忙碌員工只會因價格而改變工作','只要會做飯，便完全不受廣告影響','所有快餐顧客都必定患上心臟病'],['情境對應原文。','與工作無關。','無完全免疫。','不保證疾病。'],[3,5,6],'busy worker exposed to promotions'),
T('卡通遊戲廣告吸引年幼觀眾，他們未能辨識宣傳目的。','第二段最重視甚麼？',['未成熟受眾較難批判判斷營銷手法','年幼觀眾一定懂得分辨所有商業意圖','卡通人物會令所有產品立即變安全','企業營收越高，兒童健康越有保障'],['弱勢判斷力是重點。','與情境相反。','安全不由卡通決定。','無此因果。'],[8,9,10],'children may not judge advertising critically'),
T('企業主張自己有權在兒童節目中宣傳高糖零食。','作者會如何平衡權利？',['商業自由重要，但不可犧牲兒少福祉','公司一有宣傳自由，兒少風險便消失','兒童若看節目，就必定能識破營銷','只要零食可售，兒童廣告就無需規管'],['自由有健康界線。','與立場相反。','未必成熟。','可售不等於任意廣告。'],[8,10,14],'freedom not at expense of young well-being'),
T('某國限制煙草廣告，但仍容許企業銷售香煙。','此例怎樣支持論證？',['社會可限制有害產品宣傳而不否定經營','只要商品可銷售，廣告必須完全自由','限制宣傳等於產品立即被全面禁售','煙草廣告受限證明快餐危害完全一樣'],['已有規管先例。','與先例相反。','兩者不同。','程度有別。'],[11,12],'society already limits harmful-product advertising'),
T('有人指出快餐不像煙草那樣危險，故任何廣告限制都不合理。','文章如何回應？',['危害程度可不同，嚴重社會成本仍須考慮','兩者危害必然同等，故毋須再看資料','若比煙草安全，就不會有任何健康代價','只要有廣告，所有商品都應立即停售'],['承認差異仍援原則。','原文承認程度不同。','並非零風險。','規管非停售。'],[12],'may not be as dangerous; same principle applies'),
T('某平台的廣告瞄準難以分辨推銷與資訊的使用者。','哪一理由最適合套用？',['受眾易受影響，宣傳自由應受保護界線','平台盈利越多，使用者就越能識別廣告','只要有宣傳，任何平台都必然違法','使用者難判斷，就表示資訊一定虛假'],['脆弱受眾是關鍵。','無此保證。','未必違法。','易受影響非資訊假。'],[1,8,10],'targets vulnerable consumers'),
T('零食廣告使用亮色與朗朗上口標語，淡化高糖風險。','這反映甚麼營銷手法？',['以吸引元素令有風險商品看似無害','以完整病歷資料清楚告知所有風險','只給食店地址而不塑造任何情緒','透過降低鹽糖含量改善營養品質'],['對應 bright colours/catchy slogans。','未列風險。','仍塑造印象。','廣告非改配方。'],[9],'make unhealthy food seem exciting and harmless'),
T('社區討論是否限制某高風險產品的網上推廣。','依文章，先應看甚麼？',['產品社會代價及宣傳是否擴大相關風險','公司標誌有沒有使用足夠鮮艷的顏色','推廣有否令產品名稱變得容易記住','商店是否只在週末才供應這項產品'],['規管基於社會成本。','顏色不是主要準則。','記憶非準則。','供應時間非核心。'],[7,11,12],'serious social costs justify control'),
T('政府提出限廣告，企業反對並強調一般商業自由。','哪項概括最準確？',['自由有價值，但在健康風險下可設界線','自由一被提及，公共健康便不能討論','政府只要出手，所有企業就不能經營','健康一被提及，任何廣告都必定犯法'],['對應結論價值排序。','兩者須權衡。','規管非停業。','非所有廣告。'],[10,11,12,14],'business freedom important, public health more important'),
T('要用一句話概括全文立場和兩項原因。','哪項最完整？',['限制快餐廣告可保健康，也可保護易受影響者','允許所有企業宣傳，因為飲食與廣告無關','全面禁止快餐生產，因為它與煙草完全相同','只管制電視海報，因為網上廣告沒有影響'],['健康習慣與年輕受眾兩線。','與原文相反。','非禁產。','原文含網上。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14],'public health and vulnerable consumers'),
];
const plausibleAlternatives=[
  [['名人宣傳增加娛樂性，下注風險仍由賠率決定','宣傳可提高平台知名度，日常態度則較難改變','下注成為日常娛樂，主要因學生缺少其他活動'],['賠率不能概括行為被普通化的風險。','反覆宣傳也可能改變對高風險行為的看法。','情境已指向廣告對態度的作用。']],
  [['動畫能引起注意，但購買衝動與廣告無關','產品資料已列出，動畫便只屬中立裝飾','廣告激發欲望，消費者便不再需要資料'],['吸引設計本身可促購買慾望。','中立資訊與說服性呈現可以同時存在。','文章沒有否定產品資訊的作用。']],
  [['反覆促銷可影響選擇，健康問題仍由工作決定','速食優惠節省時間，日常飲食習慣則不變','忙碌加上促銷會增購買，營養風險可忽略'],['飲食習慣也會影響健康。','漸少煮食正顯示習慣正在改變。','文章同時關注選擇及累積健康代價。']],
  [['年幼受眾喜歡卡通，因此商品品質較重要','卡通吸引孩子，推銷目的仍由家長判斷','兒童難辨廣告，企業收入可作主要保障'],['商品品質不解決受眾判斷力的不對等。','家長可協助，仍不能消除直接針對兒童的風險。','營收不能替代對兒童福祉的保護。']],
  [['商業自由重要，兒童節目宜先調整播出時間','兒少福祉重要，企業可繼續向兒童強力推銷','可自由售賣零食，因此廣告規則亦應放寬'],['時間調整未必處理針對兒童的推銷。','承認福祉卻忽略說服性廣告的影響。','銷售權與廣告自由是不同問題。']],
  [['社會可限制有害產品宣傳，但須停止經營','廣告限制有先例，因此快餐與煙草同樣危險','煙草仍可銷售，所以廣告限制效果較小'],['廣告控制與禁售是不同措施。','先例不要求兩者危害程度相同。','容許銷售不否定控制宣傳的理由。']],
  [['兩者危害不同，故應採用基本相同的限制','快餐危害較輕，社會成本便不值得評估','快餐有健康代價，便應停止店內正常銷售'],['程度不同，政策也應審慎判斷。','危害相對較輕仍可能有重大累積成本。','文章討論廣告限制，非全面禁售。']],
  [['受眾易受影響，平台應加強廣告吸引力','使用者難辨推銷，便應停止商品資訊','平台有宣傳自由，受眾能力可交由市場改善'],['脆弱性是設界線的理由，不是加強推銷。','應區分資訊與操控，毋須一併禁止。','商業自由不能凌駕於受眾福祉。']],
  [['以亮色與標語提高記憶，風險仍清楚可見','以卡通吸引兒童，營養風險便較少重要','以設計引起興趣，主要目標只是告知成分'],['風險被淡化，不只是商品較易記住。','健康風險不會因行銷風格而降低。','情境指向說服，不只提供客觀資訊。']],
  [['先看推廣能否增加銷售，再衡量健康代價','先比較公司規模，再決定是否限制廣告','先看產品是否便宜，社會成本留待之後'],['銷售收益不能替代對社會風險的評估。','企業大小不是首要的公共健康標準。','價格不能代替健康與宣傳效應的判斷。']],
  [['自由有價值，健康風險由消費者獨自承擔','健康風險存在，商業自由便可不再考慮','自由與健康都重要，廣告界線應由企業自定'],['文章主張公共政策可設保護界線。','作者承認商業自由仍是要考慮的價值。','企業利益不能單獨決定公共健康界線。']],
  [['限制快餐廣告可保健康，兒少判斷則由家長負責','限制快餐廣告可保護兒少，健康風險較次要','快餐有健康風險，故主要應限制商品銷售'],['文章也把兒少易受影響列作政策理由。','文章同時重視飲食習慣與健康成本。','作者的立場針對廣告，不是禁售。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:77',meta:{topic:'快餐公司應否自由賣廣告',summary:'作者支持限制快餐廣告。反覆宣傳會把高鹽、高糖、高脂的快餐正常化，改變忙碌者選擇並可能累積健康問題；亮色、卡通、名人與標語亦影響較難批判判斷的兒少。商業自由重要，但不能以年輕人福祉為代價。快餐與煙草危害程度不同，惟嚴重社會成本可支持廣告控制。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
