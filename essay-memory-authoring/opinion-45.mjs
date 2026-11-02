const simple=[
  'People often think public parks are nice but not necessary, especially in cities that need room for more people and businesses.',
  'Some people say this land would be more useful if it became homes or shopping and office areas.',
  'I strongly disagree because parks are needed for people’s health, time together, and cities that can stay good places to live.',
  'The best reason to protect parks is that they help people stay healthy in a way that buildings cannot.',
  'In crowded cities, many people live in small flats, work for long hours, and have few open places to go.',
  'Parks give people a place to walk, exercise, get fresh air, and feel better after the stress of city life.',
  'For example, a family in a crowded area may not have enough money for private sports centres, but a nearby park lets children play safely and adults exercise for free.',
  'If homes or offices take the place of parks, cities may be more crowded and stressful and feel less caring.',
  'Parks also bring people in a community together and make cities better places to live.',
  'They are places everyone can use, where people of different ages and ways of life can meet, instead of staying apart in homes or workplaces.',
  'This matters because a good city is more than homes and businesses; it is a place where people feel close to others and safe.',
  'Parks can also help businesses in a less direct way by making cities more appealing to people who live, work, or visit there.',
  'A city with only roads and buildings may make money for a short time, but it may become a place people want to leave rather than put their money into.',
  'In short, I strongly disagree that homes or businesses should take the place of public parks.',
  'More people and more businesses matter, but removing green places for everyone would hurt health, make communities less close, and make cities worse places to live.',
];
const vocabulary=[
  [['Public parks','public parks','公共公園'],['pleasant but non-essential','nice but not necessary','愉快但非必要'],['population growth','more people','人口增長'],['economic competition','businesses','經濟競爭']],
  [['Some argue','Some people say','有些人認為'],['land','land','土地'],['converted into','became','改建成'],['housing','homes','住宅'],['commercial districts','shopping and office areas','商業區']],
  [['completely disagree','strongly disagree','完全不同意'],['essential to public health','needed for people’s health','公共健康不可或缺'],['social life','time together','社交生活'],['long-term sustainability of cities','cities that can stay good places to live','城市長遠可持續']],
  [['strongest reason','best reason','最有力理由'],['protecting public parks','protect parks','保護公園'],['form of health support','help people stay healthy','健康支援'],['buildings cannot replace','buildings cannot','建築無法取代']],
  [['crowded urban areas','crowded cities','擁擠城市'],['residents','people','居民'],['small apartments','small flats','小公寓'],['work long hours','work for long hours','工作很久'],['limited access to open space','few open places to go','開放空間有限']],
  [['somewhere to walk','a place to walk','散步地方'],['breathe fresh air','get fresh air','呼吸新鮮空氣'],['recover from','feel better after','從中恢復'],['pressure of city life','stress of city life','城市生活壓力']],
  [['dense neighbourhood','crowded area','人口密集社區'],['may not be able to afford','may not have enough money for','未必負擔得起'],['private sports facilities','private sports centres','私人運動設施'],['allows children to play safely','lets children play safely','讓孩子安全玩耍'],['adults to stay active without spending money','adults exercise for free','成人免費活動']],
  [['replaced by','take the place of','被取代'],['apartments or offices','homes or offices','公寓或辦公室'],['more crowded','more crowded','更擁擠'],['more stressful','stressful','更有壓力'],['less humane','less caring','較缺人情味']],
  [['strengthen communities','bring people in a community together','加強社區聯繫'],['quality of urban development','cities better places to live','城市發展質素']],
  [['shared spaces','places everyone can use','共享空間'],['different ages and backgrounds','different ages and ways of life','不同年齡背景'],['meet naturally','meet','自然相遇'],['remaining isolated','staying apart','保持隔離'],['private homes or workplaces','homes or workplaces','住宅或職場']],
  [['successful city','good city','成功城市'],['not simply a collection','more than','不只是集合'],['houses and businesses','homes and businesses','住宅與商業'],['living environment','place','生活環境'],['connected and safe','close to others and safe','有聯繫與安全感']],
  [['Moreover','also','此外'],['support the economy indirectly','help businesses in a less direct way','間接支持經濟'],['more attractive','more appealing','更吸引'],['residents, workers, and visitors','people who live, work, or visit there','居民工作者遊客']],
  [['concrete, traffic, and commercial buildings','roads and buildings','混凝土交通與商業樓宇'],['generate short-term profit','make money for a short time','短期利潤'],['risks becoming','may become','可能變成'],['escape from','leave','逃離'],['invest in','put their money into','投資']],
  [['In conclusion','In short','總結'],['strongly disagree','strongly disagree','強烈不同意'],['replaced by','take the place of','被取代'],['housing or business developments','homes or businesses','住宅或商業發展']],
  [['population growth','More people','人口增長'],['economic development','more businesses','經濟發展'],['sacrificing green public spaces','removing green places for everyone','犧牲綠色公共空間'],['damage health','hurt health','損害健康'],['weaken communities','make communities less close','削弱社區'],['overall liveability of cities','cities worse places to live','城市宜居程度']],
];
const chunkOverrides=[
  ['Public parks are often seen as pleasant but non-essential spaces,','especially in cities facing pressure from population growth and economic competition.'],
  ['Some argue that this land would be more useful','if it were converted into housing or commercial districts.'],
  ['I completely disagree with this view,','because parks are essential to public health, social life, and the long-term sustainability of cities.'],
  ['The strongest reason for protecting public parks','is that they provide a form of health support that buildings cannot replace.'],
  ['In crowded urban areas, many residents live in small apartments,','work long hours, and have limited access to open space.'],
  ['Parks give people somewhere to walk, exercise, breathe fresh air,','and recover from the pressure of city life.'],
  ['For example, a family living in a dense neighbourhood may not be able to afford private sports facilities,','but a nearby park allows children to play safely','and adults to stay active without spending money.'],
  ['If these spaces are replaced by apartments or offices,','cities may become more crowded, more stressful, and less humane.'],
  ['Public parks also strengthen communities','and improve the quality of urban development.'],
  ['They are shared spaces where people from different ages and backgrounds can meet naturally,','rather than remaining isolated in private homes or workplaces.'],
  ['This matters because a successful city is not simply a collection of houses and businesses;','it is a living environment where people feel connected and safe.'],
  ['Moreover, parks can support the economy indirectly','by making cities more attractive to residents, workers, and visitors.'],
  ['A city with only concrete, traffic, and commercial buildings may generate short-term profit,','but it risks becoming a place people want to escape from rather than invest in.'],
  ['In conclusion, I strongly disagree','that public parks should be replaced by housing or business developments.'],
  ['While population growth and economic development are important,','sacrificing green public spaces would damage health, weaken communities,','and reduce the overall liveability of cities.'],
];
const simpleChunkOverrides=[
  ['People often think public parks are nice but not necessary,','especially in cities that need room for more people and businesses.'],
  ['Some people say this land would be more useful','if it became homes or shopping and office areas.'],
  ['I strongly disagree','because parks are needed for people’s health, time together, and cities that can stay good places to live.'],
  ['The best reason to protect parks','is that they help people stay healthy in a way that buildings cannot.'],
  ['In crowded cities, many people live in small flats,','work for long hours, and have few open places to go.'],
  ['Parks give people a place to walk, exercise, get fresh air,','and feel better after the stress of city life.'],
  ['For example, a family in a crowded area may not have enough money for private sports centres,','but a nearby park lets children play safely','and adults exercise for free.'],
  ['If homes or offices take the place of parks,','cities may be more crowded and stressful and feel less caring.'],
  ['Parks also bring people in a community together','and make cities better places to live.'],
  ['They are places everyone can use, where people of different ages and ways of life can meet,','instead of staying apart in homes or workplaces.'],
  ['This matters because a good city is more than homes and businesses;','it is a place where people feel close to others and safe.'],
  ['Parks can also help businesses in a less direct way','by making cities more appealing to people who live, work, or visit there.'],
  ['A city with only roads and buildings may make money for a short time,','but it may become a place people want to leave rather than put their money into.'],
  ['In short, I strongly disagree','that homes or businesses should take the place of public parks.'],
  ['More people and more businesses matter,','but removing green places for everyone would hurt health, make communities less close,','and make cities worse places to live.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Parks may seem pleasant but unnecessary in cities under development pressure.','often seen as 歸屬常見印象；especially 指人口和經濟壓力大的城市。','作者下一步要反對這個印象。',[1,2,3],F('[公共公園] are often seen as [愉快但非必要空間], especially in [人口與經濟競爭壓力大的城市]','引入公園用地爭議的常見看法。','要先呈現一種常見但尚待檢驗的政策印象時。',[['Public parks','slot','公共公園'],[' are often seen as ','link','常被視為'],['pleasant but non-essential spaces','slot','愉快但非必要空間'],[', especially in ','link','尤其在'],['cities facing pressure from population growth and economic competition.','slot','人口與經濟競爭壓力大的城市']])),
  S('Some would turn parkland into homes or business districts.','if it were converted into 設改建條件；would be more useful 是支持者的判斷。','這是待回應的主張，非作者建議。',[0,2,8],F('Some argue that [公園土地] would be [更有用途] if it were converted into [住宅或商業區]','說明支持改建者的替代用途。','要陳述一方認為現有資源改作另一用途會更有價值時。',[['Some argue that ','link','引入他方主張'],['this land','slot','公園土地'],[' would be ','link','會'],['more useful','slot','更有用途'],[' if it were converted into ','link','若改建為'],['housing or commercial districts.','slot','住宅或商業區']])),
  S('I oppose conversion because parks support health, social life and lasting urban quality.','because 後三方面預告論證；long-term sustainability 指城市長遠宜居。','作者反對改建，不是否認住房與商業有價值。',[1,3,8],F('I completely disagree with [此看法], because [公園] are essential to [公共健康、社交生活及城市長遠可持續]','引言表態並概括健康與社區理由。','要對一項取代方案表態，並預告現有安排的多重價值時。',[['I completely disagree with ','link','表明反對'],['this view','slot','此看法'],[', because ','link','理由是'],['parks','slot','公園'],[' are essential to ','link','不可或缺於'],['public health, social life, and the long-term sustainability of cities.','slot','公共健康、社交生活及城市長遠可持續']])),
  S('Parks provide health support that buildings cannot replace.','The strongest reason 定位第一主體段；that buildings cannot replace 指不可替代性。','作者不是說建築物對城市無用。',[2,4,5],F('The strongest reason for [保護公園] is that they provide [建築無法取代的健康支援]','用不可替代的健康作用展開第一理由。','要說明現有資源提供替代品難以提供的作用時。',[['The strongest reason for ','link','提出最有力理由'],['protecting public parks','slot','保護公園'],[' is that they provide ','link','是它們提供'],['a form of health support that buildings cannot replace.','slot','建築無法取代的健康支援']])),
  S('Crowded cities leave many residents in small homes with little open space.','In crowded urban areas 設情境；三項居民處境解釋為何公園有用。','many 不等於所有城市居民都住小公寓。',[3,5,6],F('In [擁擠城市], many [居民] [住小公寓、工時長、少有開放空間]','為健康論證交代居民日常環境。','要先說明公共設施的受益者面對哪些生活限制時。',[['In ','link','設定城市情境'],['crowded urban areas','slot','擁擠城市'],[', many ','link','許多'],['residents','slot','居民'],[' live in small apartments, work long hours, and have limited access to open space.','slot','住小公寓、工時長、少有開放空間']])),
  S('Parks let people walk, exercise, breathe fresh air and recover from city stress.','四個動作從活動、空氣到壓力恢復，解釋健康支援。','此句列可用途，不保證公園能治療疾病。',[3,4,6],F('[公園] give [人們] somewhere to [散步、運動、呼吸新鮮空氣及紓緩城市壓力]','把抽象健康利益變成具體活動。','已交代使用者缺少某資源，要列出該資源的具體用途時。',[['Parks','slot','公園'],[' give ','link','給予'],['people','slot','人們'],[' somewhere to ','link','可在其中'],['walk, exercise, breathe fresh air, and recover from the pressure of city life.','slot','散步、運動、呼吸新鮮空氣及紓緩城市壓力']])),
  S('A free nearby park lets children play and adults stay active when private sports facilities are unaffordable.','may not be able to afford 對比付費設施；but 指免費公園的可及性。','作者提出一個可能情境，不是每個家庭都負擔不起運動設施。',[4,5,7],F('For example, [人口密集社區家庭] may not afford [私人運動設施], but [附近公園] lets [孩子安全玩、成人免費活動]','用一個家庭案例說明免費公共空間的健康與公平價值。','要展示公共設施如何幫助不能支付私人選擇的家庭時。',[['For example, ','link','引出例子'],['a family living in a dense neighbourhood','slot','人口密集社區家庭'],[' may not be able to afford ','link','未必能負擔'],['private sports facilities','slot','私人運動設施'],[', but ','link','然而'],['a nearby park','slot','附近公園'],[' allows ','link','讓'],['children to play safely and adults to stay active without spending money.','slot','孩子安全玩、成人免費活動']])),
  S('Replacing parks with buildings may make cities crowded, stressful and less humane.','If 設改建；may 保留可能性；三個比較級列城市品質後果。','不是聲稱每個新住宅或辦公室都必然有害。',[5,6,8],F('If [公園被住宅或辦公室取代], [城市] may become [更擁擠、更有壓力、更缺人情味]','把土地用途改變連到城市生活品質。','要評估一項替換方案可能如何影響使用者的日常生活時。',[['If ','link','設定改建'],['these spaces are replaced by apartments or offices','slot','公園被住宅或辦公室取代'],[', ','link','則'],['cities','slot','城市'],[' may become ','link','可能變得'],['more crowded, more stressful, and less humane.','slot','更擁擠、更有壓力、更缺人情味']])),
  S('Parks connect communities and improve city development.','also 引出第二主體段；strengthen communities 與 quality of urban development 分別指社交和城市整體品質。','後文才解釋共享空間與間接經濟收益。',[2,7,9],F('[公共公園] also [加強社區聯繫] and [提升城市發展質素]','由個人健康轉到社區及城市價值。','一段已論個人受益，下一段要擴展到集體受益時。',[['Public parks','slot','公共公園'],[' also ','link','亦'],['strengthen communities','slot','加強社區聯繫'],[' and ','link','並'],['improve the quality of urban development.','slot','提升城市發展質素']])),
  S('People from different ages and backgrounds can meet in parks instead of staying apart.','where 指共享空間的作用；rather than 對比相遇與隔離。','原文說 can，並非每次進公園都必然結識別人。',[8,10,11],F('They are [共享空間] where [不同年齡背景的人] can [自然相遇] rather than [留在私人住所或職場中互不往來]','解釋公園如何創造跨群體社交機會。','要比較共享場所與私人場所提供的人際互動機會時。',[['They are ','link','指出公園性質'],['shared spaces','slot','共享空間'],[' where ','link','讓'],['people from different ages and backgrounds','slot','不同年齡背景的人'],[' can ','link','能'],['meet naturally','slot','自然相遇'],[', rather than ','link','而非'],['remaining isolated in private homes or workplaces.','slot','留在私人住所或職場中互不往來']])),
  S('A successful city is a safe, connected living place, not merely a set of buildings.','not simply...; it is... 對比建築集合與具安全感、聯繫感的生活環境。','不是說住宅及商業不必要，而是說城市成敗不能只看它們。',[8,9,11],F('[成功城市] is not simply [住宅及商業集合]; it is [人們感到連結及安全的生活環境]','提出衡量城市成功的社會尺度。','當評估只計硬件或經濟，須補上人的感受及社會品質時。',[['This matters because ','link','解釋其重要'],['a successful city','slot','成功城市'],[' is not simply ','link','不只是'],['a collection of houses and businesses','slot','住宅及商業集合'],['; it is ','link','而是'],['a living environment where people feel connected and safe.','slot','人們感到連結及安全的生活環境']])),
  S('Parks may support business indirectly by making cities appealing.','indirectly 區分經濟作用並非直接租金；by 指藉吸引居民、工人及訪客而產生。','can 表可能，沒有保證公園一定帶來某個收入數字。',[8,10,12],F('[公園] can support [經濟] indirectly by making [城市] more attractive to [居民、工作者及遊客]','回應「公園不如商業發展促進經濟」的看法。','要指出一項公共設施如何吸引使用者，間接產生經濟效益時。',[['Moreover, ','link','再加一點'],['parks','slot','公園'],[' can support ','link','可支持'],['the economy','slot','經濟'],[' indirectly by making ','link','藉間接使'],['cities','slot','城市'],[' more attractive to ','link','吸引'],['residents, workers, and visitors.','slot','居民、工作者及遊客']])),
  S('An all-concrete city may make short-term profit yet become unattractive for living and investing.','may...but it risks... 對比短期利潤與長期吸引力風險。','作者未聲稱所有商業建築都無價值。',[10,11,13],F('[只有混凝土、交通和商業樓宇的城市] may generate [短期利潤], but risks becoming [人們想逃離而非投資的地方]','反駁只看眼前土地收益的發展判斷。','要比較一項決定的短期收益與長遠吸引力時。',[['A city with only concrete, traffic, and commercial buildings','slot','只有混凝土、交通和商業樓宇的城市'],[' may generate ','link','或帶來'],['short-term profit','slot','短期利潤'],[', but it risks becoming ','link','但可能變成'],['a place people want to escape from rather than invest in.','slot','人們想逃離而非投資的地方']])),
  S('I oppose replacing parks with housing or business developments.','In conclusion 重申反對的是取代公共公園，不是反對所有住宅與商業。','作者承認人口與經濟發展重要。',[2,12,14],F('In conclusion, I strongly disagree that [公共公園] should be replaced by [住宅或商業發展]','結論直接回答題目的土地取代建議。','論證現有資源的兩種價值後，要重申是否支持取代時。',[['In conclusion, I strongly disagree that ','link','總結反對'],['public parks','slot','公共公園'],[' should be replaced by ','link','被取代為'],['housing or business developments.','slot','住宅或商業發展']])),
  S('Population and business growth matter, but losing parks harms health and community life.','While 承認人口與經濟需求；主句列三方面犧牲綠地的代價。','這不是說城市永遠不應建住宅。',[2,8,13],F('While [人口及經濟發展重要], [犧牲綠色公共空間] would [損健康、弱社區、減宜居]','在承認其他需求後，以公園的整體價值作結。','要承認新需求的重要，仍指出犧牲現有資源的代價時。',[['While ','link','先承認'],['population growth and economic development are important','slot','人口及經濟發展重要'],[', ','link','但'],['sacrificing green public spaces','slot','犧牲綠色公共空間'],[' would ','link','會'],['damage health, weaken communities, and reduce the overall liveability of cities.','slot','損健康、弱社區、減宜居']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否贊成把公共公園改建為住宅或商業區？',['完全反對：公園支撐健康、社交與城市長遠宜居','完全贊成：公園完全沒有實際作用','只支持取消所有居民開放空間','沒有立場：只描述人口增長'],'I completely disagree；essential to public health, social life, long-term sustainability。'),
  {type:'multi',prompt:'選出文章兩組不同的主體論證',detail:'選兩項，再按「確認」。',options:['公園提供免費運動與紓緩壓力的地方，尤其幫助難負擔私人設施的家庭','公園創造跨群體交往，亦可使城市更吸引居民、工作者及遊客','所有商業建築一律沒有任何價值','只要建更多住宅，所有人的健康便必然改善'],correct:[0,1],why:'第一段講健康及免費可及；第二段講社區聯繫與間接經濟吸引力。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對取代公園','作者承認土地發展壓力，仍認為公園對健康與城市有必要。'],
  ['主體段一 · 健康與可及','小住宅及長工時居民可免費散步、運動、呼吸新鮮空氣。'],
  ['主體段二 · 社區與城市吸引力','共享公園促成相遇，長遠亦可吸引居民與工作者。'],
  ['結論 · 發展不應犧牲綠地','人口與經濟重要，但取代公園或傷健康、社區與宜居。'],
],'城市壓力 → 公園不可替代健康作用 → 社會與間接經濟價值 → 保留綠地。')];
const evidence=[
  Q('公園為何對擁擠城市的居民重要？',['許多人住小公寓、工時長且缺少開放空間，公園可供運動及紓壓','每個居民都擁有大型私人花園','公園只能用來購物','公園與身心健康完全無關'],'第一段先交代居民限制，再列公園具體用途。'),
  Q('密集社區家庭例子強調甚麼？',['私人運動設施可能太貴，附近公園讓孩子安全玩、成人免費活動','每個家庭都必然有私人球場','只有付費設施才讓成人活動','兒童在公園必然不安全'],'but 對比私人設施費用與公共公園可及性。'),
  Q('若公園改建為辦公室或公寓，文章提出甚麼可能後果？',['城市可能更擁擠、更有壓力，也較缺人情味','人口密度必然降至零','所有居民都立即獲得私人運動場','城市必然不再有任何建築'],'may become... 保留可能性。'),
  Q('公園如何加強社區？',['讓不同年齡與背景的人在共享空間自然相遇','把所有人隔離於私人住所','只容許同一職業人士進入','確保每次進公園都結識新朋友'],'原文說 can meet naturally，而非保證每次相遇。'),
  Q('公園可如何間接支持經濟？',['讓城市更吸引居民、工作者及遊客','只能把公園土地租給商場','必然直接產生固定數額收入','完全不能影響城市吸引力'],'support the economy indirectly by making cities more attractive。'),
  Q('為何只看商業樓宇的短期利潤不足？',['全是混凝土的城市或令居民想逃離，損害長遠吸引力','短期利潤必然等於長遠宜居','道路與建築完全不需任何規劃','公園不可能與城市發展共存'],'原文對比 short-term profit 與人們願否留下及投資。'),
];
const logic=[
  sequence('第一主體段：公園的健康作用如何建立？',[
    ['中心論點','公園提供建築無法取代的健康支援。'],
    ['居民處境','擁擠城市中，小公寓、長工時與少開放空間並存。'],
    ['具體用途','公園供散步、運動、呼吸新鮮空氣及紓壓。'],
    ['家庭例子','私人運動設施太貴時，附近公園讓孩子和成人免費活動。'],
    ['取代風險','改建或使城市更擁擠、更有壓力。'],
  ],'居住限制 → 公園健康活動 → 免費可及 → 取代會失去這些作用。'),
  sequence('第二主體段：公園如何影響城市品質？',[
    ['共享場所','不同年齡背景的人可自然相遇。'],
    ['成功城市','城市不只是樓宇，還要讓居民感到有聯繫與安全。'],
    ['間接經濟','宜人的城市可吸引居民、工作者及遊客。'],
    ['短期與長期','只有混凝土或有短期利潤，卻可能使人想離開。'],
  ],'共享空間 → 社會聯繫 → 城市吸引力 → 長期價值超過眼前土地收益。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一個密集社區的家庭負擔不起私人運動中心，市府打算把唯一的公園改成辦公室。','文章哪項理由最直接？',['附近公園讓孩子安全玩、成人免費活動，對健康有難取代的作用','每個家庭都能輕易支付私人運動設施','辦公室必然提供免費公共運動場所','公園完全不影響居民生活'],['家庭例子強調免費健康資源。','原文說 may not afford。','並無此保證。','第一段直接反證。'],[3,4,5,6],'a nearby park allows children to play safely and adults to stay active without spending money。'),
  T('市政府說：「公園只是好看，不是必要設施。」','哪項回應最符合文章？',['它提供散步運動、呼吸新鮮空氣及紓壓的空間，對公共健康有實際作用','公園唯一價值是裝飾照片','只要有大樓，居民就不需開放空間','所有公園都能取代醫院'],['作者反對 pleasant but non-essential 印象。','這是待反駁印象。','小住宅居民需要開放空間。','沒有醫院替代主張。'],[0,3,4,5],'a form of health support that buildings cannot replace。'),
  T('一座城市的居民住小公寓、工時長，卻正在失去步行可達的綠地。','作者會特別關注哪項代價？',['免費運動與放鬆的地方減少，城市可能更有壓力','所有居民必然因此獲得更大的私人院子','失去綠地不會改變任何生活條件','只有觀光客會受影響'],['居民處境與公園用途在第一段連起。','沒有此保證。','作者指出後果。','居民亦受益。'],[4,5,7],'somewhere to walk, exercise...recover from pressure。'),
  T('新住宅規劃把公園全改成樓宇，官員只計新增樓面面積。','文章會要求補入哪項城市指標？',['居民健康、壓力、社區聯繫與整體宜居程度','只計建築物高度','只計短期售樓收入，忽略居民','假設所有建築都必然無用'],['公園價值不只土地面積。','未涵蓋公共價值。','文章警告只看短期。','作者未否定建築。'],[3,7,8,10,14],'damage health, weaken communities, and reduce...liveability。'),
  T('不同年齡與背景的人在公園散步、聊天，平日卻很少在其他地方相遇。','這支持哪條主體論證？',['共享公共空間有助跨群體自然交往，強化社區聯繫','公園必然使每個人都成朋友','私人場所與公共場所完全一樣','城市成功只需更多商業大樓'],['shared spaces where...can meet naturally。','can 不等於必然。','原文作對比。','城市還需安全聯繫。'],[8,9,10],'different ages and backgrounds can meet naturally。'),
  T('某商業區雖短期利潤高，但缺少公園，人才不願在附近居住或工作。','文章的經濟論點如何應用？',['公園可提高城市吸引力，間接支持居民、工作者與訪客帶來的經濟活動','只有把所有綠地改建才能支持經濟','公園必然直接向每人發現金','短期利潤足以衡量所有城市價值'],['間接支持與長期吸引力是第二段重點。','與作者論點相反。','沒有現金主張。','短期不夠。'],[11,12],'support the economy indirectly by making cities more attractive。'),
  T('有人說：「作者反對所有住宅與商業發展。」','哪項更正準確？',['作者承認人口及經濟發展重要，反對的是犧牲公共綠地來取代公園','這句完全準確','作者只關心遊客，不關心居民','作者否定所有短期利潤存在'],['While...important 與 strongly disagree parks replaced 對應。','原文承認發展重要。','居民是主要受益者。','原文說 may generate profit。'],[1,2,13,14],'While population growth and economic development are important...。'),
  T('一項政策讓公共設施免費開放，特別幫助無法支付私人服務的家庭。','哪種論證可跨題運用？',['公共設施提供人人可及的選擇，可減少家庭收入造成的使用障礙','只有私人服務才有價值','免費設施必然完全取代所有專業服務','家庭收入對任何活動都毫無影響'],['公園與私人運動設施的對比可轉用。','與例子相反。','文章沒有全取代主張。','可能形成障礙。'],[6],'may not be able to afford private sports facilities, but a nearby park...。'),
  T('某計畫只看土地的即時租金，沒有衡量市民是否願在城市長住。','文章建議考慮甚麼？',['短期利潤之外，還要看健康、城市吸引力與長期宜居','租金必然反映全部社會價值','只要商業樓宇多，居民必然更有安全感','任何公園都不需維護成本'],['short-term profit 與 want to escape/invest 對比。','租金未涵蓋其他價值。','沒有此保證。','文章未說零成本。'],[10,11,12,14],'short-term profit...escape from rather than invest in。'),
  T('一座城市有大量住宅和商場，居民卻沒有相遇的地方，也感到不安全。','文章如何定義更成功的城市？',['除了樓宇，還要有讓人感到連結及安全的生活環境','只要住宅數多便必然成功','只要商場多就不需公共空間','城市成功與居民感受無關'],['not simply a collection...living environment connected and safe。','文章反對單看建築。','共享場所重要。','原文明列感受。'],[9,10],'a living environment where people feel connected and safe。'),
  T('公園改建支持者說：「住房和商業有價值，所以公園必須消失。」','哪項指出推論缺口？',['住房與商業重要，不代表可忽略公園對健康、社區和宜居的獨特作用','只要住房重要，任何開放空間都多餘','公園只能在沒有居民時存在','城市不需要經濟活動'],['結論承認人口與經濟需求仍反對犧牲綠地。','缺乏公園作用評估。','公園服務居民。','作者承認經濟重要。'],[2,3,8,14],'While population growth and economic development are important...。'),
  T('要用一句話概括全文。','哪項最準確？',['作者反對以住宅或商業取代公園：它們提供免費健康空間、社交聯繫及城市長遠吸引力','作者認為城市不應建任何住宅','作者說公園只因景色好看而值得保留','作者主張短期利潤是唯一城市標準'],['兩段分別講健康與社區/城市價值。','並無此絕對主張。','原文否定只看美觀。','原文批評只看短期。'],[2,3,5,6,8,9,11,12,13,14],'public health, social life, and long-term sustainability of cities。'),
];
const reviewedExamples=[
  'School libraries are often seen as costly extras, especially in small towns.',
  'Some argue that the old warehouse would be more useful if it were converted into a clinic.',
  'I completely disagree with that policy, because public libraries are essential to equal learning.',
  'The strongest reason for keeping school gardens is that they provide children with outdoor learning.',
  'In crowded schools, many students have nowhere quiet to read.',
  'Libraries give families somewhere to read and study together.',
  'For example, a parent may not be able to afford private tutoring, but a library allows children to learn after school.',
  'If the school closes its garden, lessons may become less active.',
  'A community library also supports new friendships and helps neighbours learn.',
  'They are shared rooms where neighbours can meet, rather than private spaces for a few.',
  'This matters because education is not simply a test score; it is a path to independence.',
  'Moreover, safe cycle routes can support local shops indirectly by making the street more attractive to visitors.',
  'A new shopping centre may generate quick revenue, but it risks becoming a burden if few residents use it.',
  'In conclusion, I strongly disagree that public playgrounds should be replaced by parking spaces.',
  'While new offices would add jobs, they would remove the only public garden.',
];
reviewedExamples.forEach((example,i)=>{structures[i].example=example;});
const reviewedTransfer=[
  [
    ['公園讓孩子安全遊玩及成人免費活動，支援家庭健康','只比較私人中心收費，暫不衡量免費公園的作用','只計辦公室新增職位，不看家庭的戶外活動需要','設付費室內健身房，假定所有當地家庭都能負擔'],
    ['免費且可及的活動空間，是家庭例子的健康作用。','比較價格仍須檢查公園能否提供免費選擇。','新增職位不能取代家庭的活動需要。','付費設施未解決部分家庭無法負擔的障礙。']
  ],
  [
    ['公園供散步、運動與紓壓，對公共健康有實際作用','只談公園景觀與照片，不看居民能進行的活動','把新大樓的面積當成居民健康的唯一指標','建室內健身房但收高費，仍缺人人可用的空間'],
    ['作者指出開放空間有具體身心健康用途。','美觀不能涵蓋運動和紓壓的實際作用。','樓面面積不能單獨衡量健康。','高收費設施未提供同等可及的公共空間。']
  ],
  [
    ['綠地減少會限制免費活動，也可能加重城市壓力','只看失去綠地後的景色，忽略居民原有的活動','只計建築施工噪音，未看日後能否走路運動','假定私人運動場足夠，毋須檢查家庭支付能力'],
    ['居民的開放活動空間減少，可能增加壓力。','景色以外，居民也失去活動和休息場所。','施工期影響未涵蓋長期健康與活動需要。','私人場所是否可負擔，正是原文關心的條件。']
  ],
  [
    ['補看健康、壓力、社區聯繫和長期宜居程度','只計新增樓面，未衡量居民健康與社區聯繫','只計出售收入，未衡量長期居住吸引力','只統計建築數量，便斷定居民必然更安全'],
    ['規劃指標須包括公園對生活品質的多種作用。','樓面數字沒有量度公共健康和社會生活。','即時收入未反映長期宜居與吸引力。','建築數量不能保證安全感或社區關係。']
  ],
  [
    ['共享公園讓不同群體自然相遇，建立社區聯繫','要求每位公園使用者交友，才算有社區作用','讓同齡居民分開活動，卻不提供相遇空間','只在網上發布公園照片，不安排共享場所'],
    ['共享場所讓不同人有自然相遇的機會。','原文談可能性，不保證每個人一定交友。','分隔群體削弱跨背景的自然接觸。','照片不能代替人們共用的實際空間。']
  ],
  [
    ['公園提高城市吸引力，或間接支持人流與經濟','只計公園門票收入，忽略城市對居民的吸引力','只看樓宇即時租金，未計人才是否願意居住','假定建築越密集，居民與訪客必然越願意來'],
    ['更宜人的城市可吸引居民、工作者和訪客，間接帶動經濟。','原文談間接作用，並非只看公園本身收入。','租金未反映人才和訪客是否願意留下。','密度本身不保證城市吸引力。']
  ],
  [
    ['作者承認發展重要，仍反對犧牲公園的公共作用','因公園重要，便否定所有住宅及商業發展','因發展重要，便直接接受取消全部公共綠地','只談訪客喜好，避開居民健康與社區需要'],
    ['文章承認發展需要，但不接受以公園公共價值作代價。','原文沒有反對所有住宅和商業。','承認發展不等於忽視公園的作用。','居民健康與社區生活是核心論據。']
  ],
  [
    ['免費公共設施可減少家庭收入造成的使用障礙','改用會員制設施，仍要求家庭支付較高費用','因設施免費，便認為不再需要任何專業服務','只看設施地點，不檢查家庭能否負擔費用'],
    ['免收費使較低收入家庭也能使用活動空間。','會員費仍可能排除無力支付的家庭。','免費公共設施不會取代所有專業服務。','地點以外，價格也是使用障礙。']
  ],
  [
    ['除了租金，還要評估健康、吸引力及長遠宜居','只用即時租金評估，未看居民會否願意長住','只算建設成本，卻不估計開放空間的益處','只看樓宇數量，便推斷城市長期自然吸引人'],
    ['短期收入須與健康和長期城市價值一同衡量。','租金不足以說明居民會否留下或投資。','只算成本會漏掉公園帶來的長期效益。','樓宇增加不保證城市長期宜居。']
  ],
  [
    ['成功城市有樓宇，也讓居民感到連結與安全','住宅和商場數量增加，便認定城市已足夠成功','居民能在網上聯絡，便不需要共享公共空間','只改善照明與保安，卻忽略居民相遇的地方'],
    ['城市是生活環境，也要有連結與安全感。','樓宇數量只是其中一面。','網上聯絡未必代替自然相遇的共享場所。','安全重要，但未涵蓋社區聯繫。']
  ],
  [
    ['住宅商業有價值，仍須衡量公園獨有的公共作用','既然住宅有需求，便假定公園沒有健康價值','只談公園景色，未處理健康及社區等作用','因公園有作用，便主張停止所有住宅供應'],
    ['發展有價值，不能據此抹去公園的獨特作用。','住宅需求不能證明公園無用。','公園的作用不只在外觀。','原文承認人口與經濟發展需要。']
  ],
  [
    ['反對以樓宇取代公園，因公園兼顧健康與長遠發展','只談公園能讓人運動，未解釋其社區與經濟作用','只談商業樓宇的短期收入，忽略公園公共價值','只稱公園景色宜人，未說明保留它的實際理由'],
    ['健康、社區和城市長遠吸引力共同支持反對立場。','全文還談社會聯繫和間接經濟。','短期收入不足以取代公共健康和長期價值。','美觀只是被反駁的狹窄理解。']
  ],
];
reviewedTransfer.forEach(([options,explanations],i)=>{
  transfer[i].options=options;
  transfer[i].explanations=explanations;
  transfer[i].why=explanations[0];
});
export default {
  key:'opinion:45',
  meta:{topic:'公共公園、城市健康與長遠宜居',summary:'作者反對把公共公園改建成住宅或商業區。擁擠城市的居民需要免費開放空間散步、運動及紓壓，不能負擔私人設施的家庭尤其受益。公園亦讓不同群體自然相遇，使城市更有聯繫與安全感，並可透過吸引居民、工作者和遊客間接支持經濟。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
