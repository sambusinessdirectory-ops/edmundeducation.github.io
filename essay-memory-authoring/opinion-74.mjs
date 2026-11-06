const simple=[
  'TV is still a strong way to sell things, especially after school when many children are tired, hungry, and looking for something fun to watch.',
  'I strongly think ads made on purpose for children should be banned because children often cannot see how ads try to change their minds, and these ads put extra pressure on families.',
  'The best reason to ban these ads is that children are easy to influence.',
  'Unlike adults, children often cannot tell facts from attempts to make them buy, so a bright ad may seem less like selling and more like a promise that they will be happy.',
  'Ad makers know this and often use cartoon figures, easy-to-remember songs, too much excitement, and bright pictures to make normal products seem very desirable.',
  'For example, a child who sees an ad for sweet breakfast food or a new toy may not ask about health, price, or need; they may simply feel they must buy it.',
  'This is not a fair contest.',
  'It means adults knowingly use selling methods on children who are still learning to make good choices.',
  'Second, these ads can put families under pressure at home.',
  'When ads make children want certain snacks, toys, or fast food again and again, parents may have to argue about things they did not choose.',
  'Parents may either say yes and spend money on unneeded things, or say no and deal with fights, sadness, and feeling bad.',
  'This is harder for families with little money, where even a small expense matters.',
  'Also, many ads for children encourage a quick good feeling instead of good health habits, making too much buying seem normal.',
  'Childhood should not turn into a market where ads keep interrupting ordinary family life.',
  'In short, ads made for children should not be allowed.',
  'Young people should be protected from being pushed to buy, and parents should not have to fight cleverly planned advertising inside their own homes.',
];
const vocabulary=[
  [['powerful commercial medium','strong way to sell things','強商業媒介'],['hours after school','after school','放學後時段'],['looking for entertainment','looking for something fun to watch','找娛樂']],
  [['firmly believe','strongly think','堅定相信'],['deliberately aimed at young viewers','made on purpose for children','刻意針對兒童'],['prohibited','banned','禁止'],['persuasive techniques','how ads try to change their minds','說服技巧'],['unnecessary pressure on families','extra pressure on families','家庭不必要壓力']],
  [['strongest reason','best reason','最有力原因'],['banning these advertisements','ban these ads','禁止廣告'],['especially easy to influence','easy to influence','特別易受影響']],
  [['Unlike adults','Unlike adults','與成年人不同'],['separate information from persuasion','tell facts from attempts to make them buy','區分資訊與說服'],['colourful commercial','bright ad','色彩繽紛廣告'],['sales pitch','selling','推銷'],['promise of happiness','promise that they will be happy','幸福承諾']],
  [['Advertisers','Ad makers','廣告商'],['cartoon characters','cartoon figures','卡通人物'],['catchy songs','easy-to-remember songs','朗朗上口歌曲'],['exaggerated excitement','too much excitement','誇張興奮'],['bright images','bright pictures','鮮明畫面'],['objects of desire','very desirable','渴望的物品']],
  [['advert','ad','廣告'],['sugary cereal','sweet breakfast food','含糖穀物'],['nutrition','health','營養'],['cost','price','成本'],['product is necessary','need','產品是否必要'],['must have it','must buy it','一定要有']],
  [['not fair','not a fair','不公平'],['competition','contest','競爭']],
  [['deliberate use','knowingly use','刻意運用'],['adult marketing skills','selling methods','成人行銷技巧'],['judgement is still developing','still learning to make good choices','判斷力仍發展']],
  [['Another important concern','Second','另一重要擔憂'],['pressure these advertisements create inside the home','ads can put families under pressure at home','廣告製造家庭壓力']],
  [['repeatedly encouraged','again and again','反覆鼓勵'],['particular snacks, toys, or fast-food meals','certain snacks, toys, or fast food','特定零食玩具快餐'],['forced into an unnecessary battle','have to argue about things they did not choose','被迫不必要爭執']],
  [['either give in','either say yes','要麼讓步'],['may not need','unneeded','可能不需要'],['refuse','say no','拒絕'],['arguments, disappointment, and guilt','fights, sadness, and feeling bad','爭吵失望內疚']],
  [['even sharper','harder','更尖銳'],['low-income families','families with little money','低收入家庭'],['small purchase matters','small expense matters','小額開支重要']],
  [['In addition','Also','此外'],['child-focused advertisements','ads for children','兒童廣告'],['short-term pleasure','quick good feeling','短期快樂'],['healthy habits','good health habits','健康習慣'],['normalise overconsumption','making too much buying seem normal','使過度消費正常']],
  [['Childhood','Childhood','童年'],['marketplace','market','市場'],['family routines','ordinary family life','家庭日常'],['constantly interrupted','keep interrupting','不斷打斷'],['commercial demands','ads','商業要求']],
  [['In conclusion','In short','總結'],['advertisements aimed at children','ads made for children','針對兒童廣告'],['should not be allowed','should not be allowed','不應允許']],
  [['Young viewers','Young people','年輕觀眾'],['protection from manipulation','protected from being pushed to buy','免受操控'],['compete with','fight','與之競爭'],['carefully designed marketing campaigns','cleverly planned advertising','精心設計行銷'],['own living rooms','own homes','自家客廳']],
];
const chunkOverrides={6:['This is not','fair competition.'],7:['It is the deliberate use of adult marketing skills','against people whose judgement is still developing.'],14:['In conclusion, advertisements aimed at children','should not be allowed.']};
const simpleChunkOverrides={6:['This is not','a fair contest.'],7:['It means adults knowingly use selling methods','on children who are still learning to make good choices.'],14:['In short, ads made for children','should not be allowed.']};
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Social media remains a powerful commercial medium, especially in the hours after school, when many children are tired, hungry, and looking for entertainment.','尤其指出放學後的受眾狀態，為何此時廣告影響較大。','不是單純說電視商業化，還有特定時段與群體。',[1,2,8],F('[媒介] remains a powerful commercial medium, especially in [特定時段], when [受眾狀態]','建立投放時機與受眾狀態的背景。','某商業訊息集中在受眾較易受影響的時段時。',[['Television','slot','媒介'],[' remains a powerful commercial medium, especially in ','link','尤其在'],['the hours after school','slot','特定時段'],[', when ','link','當'],['many children are tired, hungry, and looking for entertainment.','slot','受眾狀態']])),
  S('I firmly believe that messages deliberately aimed at young viewers should be prohibited, because children are not mature enough to recognise persuasive techniques and because such marketing places unnecessary pressure on families.','because...and because... 清楚預告兒童判斷與家庭壓力。','作者反對的是刻意針對兒童的廣告，非所有商品資訊。',[0,2,8],F('I firmly believe that [針對兒童的內容] should be prohibited, because [兒童判斷限制] and because [家庭代價]','引言明示禁止立場與兩段不同理由。','題目問特定受眾廣告是否應准許時，要界定對象並預告代價。',[['I firmly believe that ','link','堅信'],['advertisements deliberately aimed at young viewers','slot','針對兒童內容'],[' should be prohibited, because ','link','應禁止，因'],['children are not mature enough to recognise persuasive techniques','slot','兒童判斷限制'],[' and because ','link','亦因'],['such marketing places unnecessary pressure on families.','slot','家庭代價']])),
  S('The strongest reason for banning these promotions is that children are especially easy to influence.','首段直指較易被影響的受眾特點。','不是說兒童完全沒有判斷力，而是正在發展。',[1,3,4],F('The strongest reason for banning [訊息] is that [受眾] are especially easy to influence','指出限制某類行銷的首個原因。','內容有明確脆弱受眾，需說明其易受影響程度時。',[['The strongest reason for banning ','link','禁止的最強理由'],['these advertisements','slot','訊息'],[' is that ','link','是'],['children','slot','受眾'],[' are especially easy to influence.','link','較易受影響']])),
  S('Unlike adults, they often cannot separate information from persuasion, so a colourful commercial can feel less like a sales pitch and more like a promise of happiness.','so 連結分辨力不足與廣告給人的錯覺。','不是說色彩本身有害，而是銷售訊息被當幸福承諾。',[2,4,5],F('Unlike adults, [受眾] often cannot separate information from persuasion, so [訊息] can feel less like a sales pitch and more like a promise of happiness','展示認知差異如何令推銷看似情感承諾。','說某受眾較易受影響後，需要解釋辨識機制時。',[['Unlike adults, ','link','與成人不同'],['they','slot','受眾'],[' often cannot separate information from persuasion, so ','link','難分資訊與說服，故'],['a colourful commercial','slot','訊息'],[' can feel less like a sales pitch and more like a promise of happiness.','link','不像推銷卻像幸福承諾']])),
  S('Advertisers know this, and they frequently use cartoon characters, catchy songs, exaggerated excitement, and bright images to turn ordinary products into objects of desire.','列四種技巧，說明普通商品如何變得很想要。','不是說卡通或歌曲本身全都不應存在。',[3,5,7],F('Advertisers know this, and they frequently use [四種技巧] to turn [普通商品] into objects of desire','將抽象說服拆成可辨認的設計手法。','要證明廣告並非中立資訊，需指明它如何製造欲望時。',[['Advertisers know this, and they frequently use ','link','商家常用'],['cartoon characters, catchy songs, exaggerated excitement, and bright images','slot','四種技巧'],[' to turn ','link','來把'],['ordinary products','slot','普通商品'],[' into objects of desire.','link','變成渴望物']])),
  S('For example, a child who sees an advert for a sugary cereal or a new toy may not think about nutrition, cost, or whether the product is necessary; they simply feel that they must have it.','用商品例子把未考慮營養、成本和必要性說具體。','may not 指可能，不是每個孩子一定如此。',[3,4,6],F('For example, a child who sees an advert for [商品] may not think about [三項考慮]; they simply feel that they must have it','展示受眾從評估轉為「一定要」的可能過程。','已列廣告技巧後，要給出一個兒童面對商品的實際反應時。',[['For example, a child who sees an advert for ','link','例如孩子看'],['a sugary cereal or a new toy','slot','商品'],[' may not think about ','link','或不會考慮'],['nutrition, cost, or whether the product is necessary','slot','三項考慮'],['; they simply feel that they must have it.','link','只覺得必須要']])),
  S('This is not fair competition.','短句直接為上一例子作公平判斷。','後一句會說明為何不公平，不能只停在標籤。',[5,7,8],F('This is not fair [競爭形式]','先明確給出公平判斷。','已展示說服技巧針對發展中判斷力，需要點明問題性質時。',[['This is not fair ','link','這不是公平'],['competition.','slot','競爭形式']])),
  S('It is the deliberate use of adult marketing skills against people whose judgement is still developing.','說明不公平的原因是能力與權力不對等。','不是禁所有成人向廣告，而是指出利用兒童弱點。',[2,5,6],F('It is the deliberate use of [強方技巧] against [判斷仍發展者]','用不對等解釋公平問題。','已判斷一項說服做法不公平，要指出誰用何種優勢對誰時。',[['It is the deliberate use of ','link','這是刻意運用'],['adult marketing skills','slot','強方技巧'],[' against ','link','針對'],['people whose judgement is still developing.','slot','判斷仍發展者']])),
  S('Another important concern is the pressure these promotions create inside the home.','次段由兒童判斷轉向家庭內部後果。','不是重述卡通人物與歌曲技巧。',[1,7,9],F('Another important concern is the pressure [訊息] create inside the home','引出第二個影響層面：家庭。','前段已談直接受眾，再談家庭中的連帶影響時。',[['Another important concern is the pressure ','link','另一問題是壓力'],['these advertisements','slot','訊息'],[' create inside the home.','link','在家庭內產生']])),
  S('When children are repeatedly encouraged to want particular apps, games, or sweet snacks, parents are often forced into an unnecessary battle.','When 將反覆催生欲望連到親子衝突。','不是責怪父母，而是指出商業刺激帶來選擇壓力。',[8,10,11],F('When children are repeatedly encouraged to want [產品], parents are often forced into an unnecessary battle','展示廣告如何把銷售問題帶進家庭。','已提出家庭壓力，要說明反覆刺激慾望如何逼父母回應時。',[['When children are repeatedly encouraged to want ','link','當孩子反覆被鼓勵想要'],['particular snacks, toys, or fast-food meals','slot','產品'],[', parents are often forced into an unnecessary battle.','link','父母陷入不必要爭執']])),
  S('They either give in and spend money on things the family may not need, or they refuse and face arguments, disappointment, and guilt.','either...or... 列出父母的兩難結果。','不是說每個家庭都會按同一方式回應。',[8,9,11],F('They either give in and [讓步代價], or they refuse and [拒絕代價]','把家庭壓力拆成兩種不理想選擇。','已說父母被迫爭戰，需要顯示接受與拒絕各有何代價時。',[['They either give in and ','link','要麼讓步'],['spend money on things the family may not need','slot','讓步代價'],[', or they refuse and ','link','要麼拒絕'],['face arguments, disappointment, and guilt.','slot','拒絕代價']])),
  S('This problem is even sharper for families with little income, where every small purchase matters.','where 補充低收入家庭對小額開支更敏感的原因。','不是說高收入家庭完全沒有衝突。',[9,10,12],F('This problem is even sharper for [受較大影響群體], where every small purchase matters','指出相同壓力對不同收入家庭的影響不一。','已展示支出兩難，需說明何種家庭承受較大壓力時。',[['This problem is even sharper for ','link','更尖銳對'],['low-income families','slot','受較大影響群體'],[', where every small purchase matters.','link','每筆小額都重要']])),
  S('In addition, many promotions for children promote short-term pleasure rather than healthy habits, which can quietly normalise overconsumption.','rather than 對照短期快樂與健康習慣；which 指可能後果。','這是家庭壓力之外的消費文化風險。',[9,11,13],F('In addition, many [兒童訊息] promote short-term pleasure rather than healthy habits, which can quietly normalise overconsumption','指出內容如何塑造長期消費習慣。','已談個別購買，再分析反覆推廣的文化影響時。',[['In addition, many ','link','此外許多'],['child-focused advertisements','slot','兒童訊息'],[' promote short-term pleasure rather than healthy habits, which can quietly normalise overconsumption.','link','推短樂而非健康，或令過度消費正常']])),
  S('Childhood should not become a marketplace in which family routines are constantly interrupted by commercial demands.','marketplace 比喻將家庭被商業要求打斷的問題收束。','不是說孩子不能購買任何東西，而是不應讓行銷主宰日常。',[8,10,12],F('[生活階段] should not become a marketplace in which [日常] are constantly interrupted by commercial demands','以比喻指出商業訊息不應侵入生活核心。','已列家庭壓力與過度消費，需要一句較有力的價值判斷時。',[['Childhood','slot','生活階段'],[' should not become a marketplace in which ','link','不應變市場，讓'],['family routines','slot','日常'],[' are constantly interrupted by commercial demands.','link','被商業不斷打斷']])),
  S('In conclusion, promotions aimed at children should not be allowed.','結論直接回答是否允許的政策立場。','不把針對兒童廣告擴大成所有商品資訊。',[1,8,15],F('In conclusion, [針對兒童內容] should not be allowed','清楚重述限制對象。','題目問某類針對兒童的廣告可否存在時，結尾須直答。',[['In conclusion, ','link','總結'],['advertisements aimed at children','slot','針對兒童內容'],[' should not be allowed.','link','不應允許']])),
  S('Young viewers deserve protection from manipulation, and parents should not have to compete with carefully designed marketing campaigns in their own living rooms.','and 並列兒童保護與父母壓力兩個主體理由。','這不是說父母不能與孩子討論商品，而是反對不對等行銷。',[1,7,14],F('Young viewers deserve protection from [不當影響], and parents should not have to compete with [商業攻勢] in their own living rooms','將兩段理由整合成終句。','結尾要同時指出兒童和家長各應免受甚麼影響時。',[['Young viewers deserve protection from ','link','年輕觀眾應免受'],['manipulation','slot','不當影響'],[', and parents should not have to compete with ','link','而父母不應競爭'],['carefully designed marketing campaigns','slot','商業攻勢'],[' in their own living rooms.','link','在自家客廳']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者主張如何處理刻意針對兒童的廣告？',['應禁止；兒童較難識別說服技巧，家庭亦承受額外壓力','應全面允許；孩子可自行判斷所有推銷','沒有立場；只研究電視節目時段','只禁止成年人看到的廣告'],'引言與結論均主張禁止 deliberately aimed at children 的廣告。'),
  {type:'multi',prompt:'選出兩段主體不同的理由',detail:'選兩項，再按「確認」。',options:['兒童較難把資訊與推銷分開，廣告可讓商品看似幸福承諾','廣告刺激想要零食玩具，父母因購買與拒絕而承壓','每個孩子看完廣告都必定立即買同一商品','父母的收入不同，廣告便完全不再影響任何家庭'],correct:[0,1],why:'首段是判斷力及操控；次段是親子壓力與過度消費。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 反對針對兒童','放學後是商業時段；作者提出判斷力與家庭壓力。'],
  ['主體一 · 不對等說服','廣告技巧令普通商品看似必需；兒童難分資訊與推銷。'],
  ['主體二 · 家庭兩難','父母買或拒絕都承受代價，低收入家庭尤其難。'],
  ['結論 · 保護兒童與家長','童年不應由商業要求主導，故針對兒童廣告應禁。'],
],'放學後受眾 → 說服不對等 → 家庭支出衝突 → 明確限制。')];
const evidence=[
  Q('為何放學後時段特別適合廣告商？',['許多孩子疲倦、飢餓並尋找娛樂','所有成年人都不在家','電視此時完全沒有節目','孩子此時絕不會觀看任何內容'],'引言明述 children tired, hungry, looking for entertainment。'),
  Q('兒童較難區分哪兩種內容？',['資訊與說服','歌曲與畫面','玩具與早餐','電視與電台'],'cannot separate information from persuasion。'),
  Q('廣告商使用哪些具體技巧？',['卡通人物、易記歌曲、誇張興奮與亮眼畫面','只有營養標籤與價格單','只有新聞稿與課堂筆記','只有家長會與家庭規則'],'原文列四項。'),
  Q('兒童看穀物或玩具廣告可能忽略哪三項？',['營養、成本及產品是否必要','節目長度、電池與網速','品牌名字、包裝大小與廣告時段','卡通人物、音樂與圖片'],'原文列 nutrition, cost, necessity。'),
  Q('父母面對廣告刺激有哪兩種不理想選擇？',['買不需要的東西，或拒絕後面對爭執與失望','只要拒絕便從此不會再有廣告','只要購買便立即解決所有家庭問題','完全沒有選擇，因孩子能自行付款'],'either give in...or refuse...。'),
  Q('為何低收入家庭的問題更尖銳？',['每筆小額開支都重要','家中沒有任何購買決定','子女必然不看廣告','廣告只在富裕家庭播放'],'where every small purchase matters。'),
];
const logic=[
  sequence('主體一：廣告如何利用判斷仍發展的兒童？',[
    ['首因','兒童特別易受影響。'],
    ['分辨困難','資訊與推銷可能被混淆，廣告似幸福承諾。'],
    ['設計技巧','卡通、歌曲、誇張情緒與鮮明畫面。'],
    ['商品例子','孩子可能不想營養、成本及必要性，只覺得必須買。'],
    ['公平判斷','成人技巧針對判斷仍發展者，競爭不對等。'],
  ],'判斷限制 → 說服設計 → 商品例子 → 不公平。'),
  sequence('主體二：廣告如何把壓力帶進家庭？',[
    ['另一問題','反覆刺激孩子想要零食、玩具和快餐。'],
    ['父母兩難','買可能浪費，拒絕又有爭執與內疚。'],
    ['分配影響','低收入家庭對每筆支出更敏感。'],
    ['消費文化','短期快樂可壓過健康習慣，使過度消費正常。'],
    ['價值收束','童年不應變成被商業要求打斷的市場。'],
  ],'欲望刺激 → 家庭決定 → 收入差異 → 過度消費。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一款遊戲用卡通角色叫小孩每天要求家長買新道具。','文章會先檢查哪種不對等？',['設計者懂說服技巧，孩子判斷力仍在發展','孩子看到卡通，便必定已懂所有價格條款','家長一旦拒絕，遊戲道具就會自動消失','道具由成人製作，便保證不會有任何影響'],['成人設計技巧與兒童判斷不對等。','不能保證理解。','未解決壓力。','正需審視影響。'],[2,3,4,7],'adult marketing skills against developing judgement。'),
  T('短片把普通零食拍得像買了就能交到朋友。','這最貼近哪種說服機制？',['把商品包裝成幸福承諾，而非只提供資訊','只展示營養資料，完全沒有情緒訴求','廣告有食物畫面，便不可能影響兒童','買零食能保證每個孩子都交到朋友'],['sales pitch 被感成 promise of happiness。','情境有情緒訴求。','畫面可影響。','廣告承諾不保證成真。'],[3,4,5],'sales pitch versus promise of happiness。'),
  T('孩子看了玩具廣告，未想價格與需要便說「一定要」。','作者會指出哪個缺少的評估？',['先問成本和必要性，再決定是否值得購買','只看廣告是否有最亮的顏色便付款','只要孩子想要，家長就必須立即答應','玩具能播放歌曲，便證明完全不需比較'],['穀物玩具例子明列 cost/necessity。','是廣告技巧。','增加家庭壓力。','未評估需要。'],[4,5,7],'nutrition, cost, necessity；must have it。'),
  T('家長拒絕買不必要的零食，孩子因反覆看到廣告而生氣。','第二段關注甚麼後果？',['商業刺激把購買爭論帶進了家庭日常','家長拒絕一次，便證明廣告完全無影響','孩子生氣，所以商品一定對健康有益','只要家長收入較高，就不會有任何爭執'],['廣告製造不必要的家庭衝突。','爭執正顯影響。','無此因果。','壓力不只低收入。'],[8,9,10,13],'parents forced into unnecessary battle。'),
  T('同一廣告令兩個家庭都有購買壓力，其中一戶預算很緊。','哪項比較符合原文？',['小額支出對低收入家庭可能造成更大負擔','廣告一樣，兩戶的預算便必然完全相同','低收入家庭從不面對任何廣告與購物選擇','只要商品便宜，家長便不可能有心理壓力'],['where every small purchase matters。','收入不同。','仍會接觸。','壓力不只金額。'],[9,10,11],'problem sharper for low-income families。'),
  T('一則廣告列商品成分與價格，另一則用角色說「你一定要買才快樂」。','哪個差異是文章核心？',['前者較像資訊，後者以情感說服並製造欲望','兩者都只屬中立資料，完全沒有說服成分','只要有角色，商品就必然適合所有兒童','提供價格資料比幸福承諾更容易造成操控'],['分辨資訊與說服是首段機制。','後者明顯說服。','無此保證。','情感承諾才是問題。'],[3,4,5],'separate information from persuasion。'),
  T('學校討論是否准許專為小學生設計的廣告在課間播放。','依作者立場，哪項決定最一致？',['限制刻意針對兒童的推銷，保護其判斷發展','只要課間短，便可讓任何廣告無限制播放','完全停止向成年人提供任何商品資訊','只計廣告色彩，不考慮受眾與內容目的'],['明確限制 deliberately aimed at young viewers。','仍有脆弱受眾。','範圍過大。','忽略說服。'],[0,1,2,3,7,14],'ads deliberately aimed at children prohibited。'),
  T('孩子天天要求買快餐，廣告不斷把它畫成最快樂的選擇。','除了花錢，文章還指出哪項風險？',['短期快樂或壓過健康習慣，過度消費變平常','只要畫面快樂，食物營養便自動更好','快餐廣告一播放，所有父母就會立刻購買','孩子想買快餐，便證明家庭討論完全無用'],['第二段把個別購買推到習慣。','無此因果。','非人人。','討論仍有用。'],[9,10,12,13],'short-term pleasure rather than healthy habits。'),
  T('有人稱「廣告讓產品公平競爭」，卻只針對判斷仍發展的小孩。','作者為何反對「公平」一詞？',['成年行銷技巧與兒童判斷能力並不對等','廣告商與兒童必然具有相同商業知識','只要廣告中有歌曲，競爭就絕對公平','兒童能看到畫面，便證明其判斷已成熟'],['成人與兒童能力不對等。','與核心相反。','歌曲可加強說服。','看見不等於懂。'],[2,3,4,6,7],'not fair competition；adult marketing skills。'),
  T('平台說兒童廣告只是娛樂，不必問它是否誘導購物。','本文會要求檢查甚麼？',['內容是否借卡通與歌曲把普通商品變成必需','只看影片長短，不問孩子如何理解商品','只要配樂動聽，就可推斷內容沒有商業目的','只要名為娛樂，就必然不會改變購買願望'],['設計技巧可能隱藏說服。','忽略目的。','配樂是技巧之一。','標籤不足。'],[3,4,5,7],'turn ordinary products into objects of desire。'),
  T('父母在家休息，卻不停被孩子轉述廣告中的購買要求。','童年「市場」比喻指甚麼？',['家庭日常被商業要求反覆打斷，不應成常態','孩子在家說話，便代表家庭真的開了商店','任何家庭購物都必然不合法且應全面停止','廣告只在商場播放，不可能進入家庭生活'],['marketplace 指商業滲入日常。','不是實體商店。','作者反對操控非購物本身。','可透過電視進家。'],[8,9,10,12,13],'family routines interrupted by commercial demands。'),
  T('要準確概括作者對針對兒童廣告的判斷。','哪項最符合全文？',['應限制刻意針對孩子的推銷，減少操控與家庭壓力','所有兒童都會被每一則廣告立即操控成功','只要家長會拒絕購買，針對兒童廣告便無問題','兒童廣告只關乎價格，與健康和家庭完全無關'],['兩段理由與明確政策範圍同在。','過度絕對。','拒絕亦有代價。','忽略兩段後果。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'protect young viewers and parents。'),
];
const plausibleAlternatives=[
  [['設計者懂說服技巧，家長通常能替孩子判斷','孩子判斷力仍在發展，價格條款可由平台解釋','孩子喜歡卡通角色，便能辨認商品實際需要'],['家長可幫助判斷，但廣告仍直接針對孩子。','條款說明不能消除情感說服的不對等。','喜歡角色不等於能評估商品價值。']],
  [['把商品包裝成社交承諾，主要提供營養資訊','以友情故事吸引觀看，購買意願仍與此無關','把零食連結友誼，重點只在介紹口味'],['友情承諾已超出客觀商品資訊。','情感故事正是誘發購買慾望的方式。','廣告借社交願望說服，並非只談味道。']],
  [['先看玩具顏色，再考慮成本和實際需要','先問同學有沒有買，才決定是否值得','先看廣告次數，再判斷價格是否合理'],['顏色不能取代成本與需要的評估。','同儕購買未能證明自己需要。','曝光頻率不能衡量商品是否值得買。']],
  [['購買爭論進入家庭，原因主要是父母不解釋','廣告令孩子想買，家庭壓力只在購買之後出現','孩子生氣反映壓力，但與反覆廣告接觸無關'],['原文把反覆商業刺激視為成因之一。','拒絕購買時也會引發家庭爭執。','情境明確指出反覆觀看與要求。']],
  [['小額支出對低收入家庭有影響，但兩戶相近','兩戶都受廣告影響，購買壓力主要看商品名稱','低收入家庭預算較緊，支出卻較容易忽略'],['預算差異正使同一支出造成不同負擔。','家庭可支配金額比商品名稱更切題。','預算緊使累積小額支出更需留意。']],
  [['前者較像資訊，後者主要展示商品成分','兩者都有說服成分，但情感承諾較中立','前者提供價格，後者則證明商品更有用'],['後者的幸福承諾不是成分資訊。','情感承諾正是較強的說服方式。','廣告承諾不能直接證明產品效用。']],
  [['限制廣告色彩和音量，保留針對兒童推銷','准許課間廣告，但先讓學生記住商品價格','只限制快餐廣告，其他針對兒童推銷照常'],['問題在受眾與操控意圖，不只是形式。','知道價格仍未解決兒童判斷力的不對等。','作者主張限制刻意針對兒童的推銷。']],
  [['短期快樂可能壓過健康，購物壓力則可忽略','快餐廣告會增加花費，健康習慣仍較穩定','孩子偏好快餐，主要風險只是家庭少煮飯'],['文章同時指出消費壓力與健康風險。','反覆美化快餐可能削弱健康習慣。','風險不止烹調次數，也包括過度消費。']],
  [['兒童判斷尚在發展，但廣告技巧可幫助理解','行銷與兒童能力有差距，價格透明便足以補救','兒童能看懂情節，便能辨別資訊與說服'],['技巧可能利用而非消除判斷差距。','透明價格不足以抵銷情感操控。','理解畫面與辨別說服目的不同。']],
  [['內容是否借角色與歌曲介紹商品的客觀成分','內容是否足夠有趣，讓孩子願意重看畫面','內容是否使用卡通，家長可留待購買後判斷'],['需要看是否把商品包裝成必需，而不只成分。','娛樂性不能代替對誘導購物的檢查。','若已誘發購買壓力，事後判斷較遲。']],
  [['家庭購物較頻繁，因此應改在商場討論','孩子談廣告造成打斷，父母宜先滿足要求','市場比喻只指家裏零食和玩具的數量'],['比喻指商業要求滲入日常，而非購物地點。','滿足要求不會處理操控與家庭壓力。','重點是持續的推銷壓力，不是物品數目。']],
  [['應限制針對孩子推銷，家庭壓力則由父母處理','應限制兒童廣告，但商品資訊也須停止提供','家長若能解釋廣告，便可保留針對孩子推銷'],['作者也把家庭壓力列作限制理由。','文章區分商品資訊與情感操控。','父母協助不能消除刻意針對兒童的說服。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:74',meta:{topic:'是否應禁止刻意針對兒童的廣告',summary:'作者主張禁止刻意針對兒童的廣告。兒童判斷力仍在發展，較難分辨資訊與說服；卡通、歌曲與鮮明畫面可把普通商品包裝成幸福承諾。廣告還可令孩子反覆要求零食、玩具和快餐，使父母面對購買或拒絕的兩難，低收入家庭尤其受壓。文中同時指出短期快樂可能壓過健康習慣。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
