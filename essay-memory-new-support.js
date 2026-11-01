/* Source-linked learning content for three additional IELTS model essays. */
(() => {
  'use strict';
  const lessons = window.ESSAY_MEMORY_LESSONS || {};
  const lexicon = [
    ['shape','influence','塑造／影響'],['cultural identity','sense of a culture','文化身分認同'],['therefore','so','因此'],['institutions','organisations','機構'],['display','show','展示'],['instead of','rather than','而非'],['strongly disagrees','does not agree at all','強烈不同意'],['international collections','art from many countries','國際藏品'],['broaden','widen','擴闊'],['long-term development','growth over time','長遠發展'],['foreign work','art from other countries','外國作品'],['educational','good for learning','具教育意義的'],['domestic traditions','local ways of making art','本地藝術傳統'],['meaningful basis','useful way','有意義的基礎'],['comparison','looking at differences','比較'],['sculpture','three-dimensional art','雕塑'],['symbolism','use of symbols','象徵手法'],['form','shape and structure','形式'],['express','show','表達'],['human concerns','things people care about','人類共同關注的事'],['exposure to','seeing','接觸'],['deepen','increase','加深'],['social understanding','understanding of people','對社會的理解'],['reflect','show','反映'],['migration','people moving countries','移民'],['inequality','unfair differences','不平等'],['encountering','seeing','接觸到'],['appreciate','understand better','理解／欣賞'],['beyond','outside','超出'],['excluding','leaving out','排除'],['intellectual','about learning and thought','知識／思想上的'],['cultural value','value for culture','文化價值'],['benefits','helps','有益於'],['unfamiliar techniques','new ways of making art','不熟悉的技法'],['artistic philosophies','ideas about art','藝術理念'],['creative environment','place for creating art','創作環境'],['repetitive','too similar again and again','重複單調'],['by contrast','on the other hand','相反'],['outside influences','ideas from elsewhere','外來影響'],['refine','improve','改進'],['original work','new and different art','原創作品'],['modernism','modern art movement','現代主義'],['for instance','for example','例如'],['representing','showing','呈現'],['emotion','feeling','情感'],['varied exhibitions','different kinds of shows','多樣化展覽'],['broader audiences','more kinds of visitors','更廣泛的觀眾'],['vibrant','active and lively','充滿活力'],['alternate','take turns showing','交替展出'],['critics','people who review art','評論家'],['repeat visitors','people who visit again','回訪觀眾'],['discover','find','發現'],['local talent','skilled local artists','本地人才'],['restrict','limit','限制'],['enriches','makes richer','豐富'],['healthier environment','better conditions','更健康的環境'],['artistic growth','development as artists','藝術成長'],
    ['medium-sized firms','not very large companies','中型企業'],['firms','companies','企業'],['built around','based on','以…為核心'],['family ownership','ownership by relatives','家族所有權'],['arrangement','way of organising things','安排'],['foundation','base','基礎'],['commercial success','success in business','商業成功'],['running a business','managing a company','經營企業'],['family ties','relationships between relatives','家族關係'],['professional judgement','work decisions based on skill','專業判斷'],['private conflict','personal disagreement','私人衝突'],['commercial risk','danger to a business','商業風險'],['family-run','managed by a family','家族經營的'],['blur the line','make the difference unclear','模糊界線'],['affection','love for someone','親情'],['competence','ability to do the job','能力'],['selected','chosen','選用'],['promoted','given a higher position','晉升'],['corrected','told how to improve','糾正'],['according to performance','based on how well they work','按工作表現'],['relatives','family members','親屬'],['senior roles','high positions','高級職位'],['blood rather than ability','family relationship, not skill','血緣而非能力'],['protected by loyalty','kept safe by family support','因忠誠而受保護'],['capable','skilled','有能力的'],['non-family workers','workers outside the family','非家族員工'],['undervalued','not appreciated enough','不受重視'],['inconsistent','not the same each time','不一致'],['delayed','put off','延誤'],['repeatedly','again and again','反覆地'],['hesitate','be unsure about acting','猶豫'],['challenge','question','質疑'],['criticism','negative feedback','批評'],['insult','offence','侮辱'],['favouritism','unfair preference for some people','偏袒'],['competitive','able to compete','有競爭力'],['disputes','arguments','爭執'],['spill into','affect','波及'],['professionally managed','run by trained managers','專業管理的'],['contracts','written agreements','合約'],['formal procedures','official steps','正式程序'],['inheritance','property passed to relatives','繼承'],['deeply personal','very private and emotional','高度個人化'],['siblings','brothers and sisters','兄弟姊妹'],['take control','become the leader','掌管'],['paralyse','stop from moving forward','使停滯'],['investment','money put into growth','投資'],['expansion','growth','擴張'],['take sides','support one side','選邊站'],['atmosphere','feeling in a place','氣氛'],['business priorities','most important business needs','業務優先事項'],['personal loyalties','support for relatives or friends','私人忠誠'],['succession','change to a new leader','繼任'],['stability','steadiness','穩定'],['rivalry','competition between people','對立'],['steadily','in a stable way','穩步地'],['family tension','stress between relatives','家族緊張關係'],['ideal business structure','best way to organise a business','理想企業架構'],['expertise','special knowledge and skill','專業知識'],['governance','rules for running an organisation','管治'],['compromised','weakened','受損'],['dominate','control','主導'],
    ['spend heavily','spend a lot','花大量金錢'],['advertising','paid promotion','廣告'],['sponsorship','paying to support an event or person','贊助'],['online promotion','marketing on the internet','網上推廣'],['visible','easy to notice','顯眼'],['local producers','people who make goods nearby','本地生產者'],['trend','general change','趨勢'],['damage','harm','損害'],['local economies','business activity in an area','本地經濟'],['weaken choice','reduce the options','削弱選擇'],['measures','actions','措施'],['goods','products','商品'],['pushed into the shadows','made hard to notice','被掩蓋'],['shoppers','buyers','購物者'],['repeatedly','again and again','反覆地'],['brands','product names','品牌'],['tend to','usually','傾向於'],['automatically','without thinking','不假思索地'],['alternative','other choice','替代選擇'],['corporations','large companies','大企業'],['independent shops','shops not owned by chains','獨立商店'],['manufacturers','people or firms that make goods','製造商'],['revenue','money earned from sales','收入'],['cut jobs','reduce staff','裁減職位'],['altogether','completely','完全地'],['drains money','takes money away','使資金流失'],['high streets','main shopping streets','主要購物街'],['varied','different and diverse','多樣化'],['consumer decisions','buyers’ choices','消費者決定'],['image rather than real value','appearance, not actual quality','形象而非真正價值'],['heavily advertised','promoted everywhere','大量宣傳的'],['superior','better','較優秀'],['packaging','product wrapping','包裝'],['slogan','short advertising phrase','口號'],['celebrity endorsement','famous person’s support','名人代言'],['familiarity','knowing a brand already','熟悉感'],['overlooked','not noticed','被忽視'],['encourage','help make more likely','鼓勵'],['local purchasing','buying nearby goods','購買本地產品'],['councils','local governments','地方議會'],['farmers’ markets','markets where farmers sell food','農夫市集'],['digital platforms','websites or apps','網上平台'],['nearby producers','local makers','附近生產者'],['residents','people living there','居民'],['convenient habit','easy regular action','方便的習慣'],['moral chore','duty that feels difficult','道德負擔'],['retailers','shops and sellers','零售商'],['clear labelling','easy-to-read product labels','清晰標籤'],['fair shelf space','reasonable room on store shelves','公平的貨架位置'],['paired with','together with','配合'],['ordinary purchase','normal act of buying','普通購物'],['community support','help for local people','支持社區'],['public campaigns','messages aimed at everyone','公共宣傳活動'],['sustains','keeps going','維持'],['neighbourhood identity','sense of the local area','社區身分'],['marketing power','ability to promote products','行銷力量'],['undermine','weaken','削弱'],['brand-led consumption','buying guided by brands','品牌導向消費'],['meaningful','important to people','有意義的'],['tilt demand back','shift buying back','令需求轉回'],
  ];
  lexicon.push(
    ['public','ordinary people','公眾'],['understands','makes sense of','理解'],['history','events from the past','歷史'],['this essay','this writing','本文'],['that view','that opinion','該觀點'],['this view','this opinion','這個觀點'],['strongly disagree','do not agree at all','強烈不同意'],['strengthen','make stronger','加強'],['showing','putting on display','展示'],['far more','much more','遠更'],['international art','art from other countries','國際藝術'],['foreign art','art from abroad','外國藝術'],['reduce','make less','減少'],['also','as well','亦'],['support','help','支持'],['artists improve','artists get better','藝術家進步'],['challenged','made to think differently','受到挑戰'],['first','to begin with','首先'],['second','next','其次'],['in conclusion','to finish','總括而言'],['should not','ought not to','不應'],['museums and galleries','places that show art','博物館和美術館'],['creates','makes','創造'],['over time','as time passes','隨時間過去'],['reduces trust','makes people trust less','減低信任'],['within the workplace','at work','在工作場所內'],['another major issue','another important problem','另一重大問題'],['easily','without difficulty','容易地'],['disagreements','different opinions','分歧'],['clear job descriptions','written descriptions of each job','清晰職責說明'],['however','but','然而'],['leadership','who leads','領導權'],['especially dangerous','particularly risky','尤其危險'],['needs','requires','需要'],['steering wheel','the way it is directed','方向盤／企業方向'],['constantly','all the time','持續地'],['overall','in general','總括而言'],['more likely','more probable','更有可能'],['provide','offer','提供'],['smaller firms','small companies','小型企業'],['first problem','initial difficulty','第一個問題'],['leaves','makes','使得'],['less alive','less lively','較沒活力'],['a second problem','another issue','第二個問題'],['shaped by','influenced by','受…影響'],['real value','actual worth','真正價值'],['as a result','therefore','因此'],['pay more','spend extra','支付更多'],['healthier','better for health','更健康'],['fresher','more recently made','更新鮮'],['handmade goods','things made by hand','手製商品'],['as easily as','with the same ease as','像…一樣容易'],['local vegetables','vegetables grown nearby','本地蔬菜'],['also help','help too','亦可幫助'],['simple','easy to understand','簡單'],['made locally','produced nearby','本地製造'],['brief information','short facts','簡短資料'],['producer','person or firm that makes a product','生產者'],['remind','make someone remember','提醒'],['consumers','buyers','消費者'],['local spending','money spent nearby','本地消費'],['skills','abilities','技能']
  );
  // Replace lexical glosses that were no easier than the IELTS wording.
  const plainerWords = {
    'shape':'change how people see',
    'cultural identity':'what makes a group feel connected',
    'institutions':'places',
    'instead of':'and not',
    'broaden':'help people learn more',
    'long-term development':'growth over many years',
    'meaningful basis':'good way',
    'modernism':'newer styles of art',
    'fresher':'newer',
    'intellectual':'about learning and thinking',
    'by contrast':'but',
    'critics':'people who write about art',
    'restrict':'show only',
    'should not':'it is better not to',
    'medium-sized firms':'companies that are not small or very large',
    'arrangement':'way of doing things',
    'selected':'chosen for a job',
    'needs':'must have',
    'criticism':'being told what was wrong',
    'insult':'hurtful comment',
    'stability':'things staying steady',
    'rivalry':'people trying to beat each other',
    'more likely':'has a better chance of',
    'governance':'rules for running a business',
    'advertising':'ads',
    'online promotion':'ads on the internet',
    'trend':'change',
    'local economies':'jobs and shops in an area',
    'first problem':'first thing that goes wrong',
    'shaped by':'changed by',
    'real value':'how good it really is',
    'packaging':'box or wrapper',
    'celebrity endorsement':'a famous person saying they like it',
    'councils':'local leaders',
    'convenient habit':'something easy to do often',
    'moral chore':'something that feels like a hard duty',
    'as easily as':'without more effort than',
    'clear labelling':'labels people can read easily',
    'fair shelf space':'a fair place on shop shelves',
    'neighbourhood identity':'what makes an area feel like home',
    'marketing power':'money to show products everywhere',
    'brand-led consumption':'buying because of brand names',
    'tilt demand back':'help people buy local goods again',
  };
  for (const entry of lexicon) if (plainerWords[entry[0]]) entry[1]=plainerWords[entry[0]];
  const sourceChunk = text => {
    const words = text.trim().split(/\s+/);
    const chunks = [];
    let current = [];
    for (let i = 0; i < words.length; i++) {
      current.push(words[i]);
      const next = words[i + 1]?.toLowerCase().replace(/^[^a-z]+/, '') || '';
      const punctuationBreak = /[,;:]$/.test(words[i]) && current.length >= 3;
      const relationBreak = /^(because|but|so|when|if|however|rather|for)$/.test(next) && current.length >= 4;
      if (current.length >= 9 || punctuationBreak || relationBreak || i === words.length - 1) {
        chunks.push(current.join(' '));
        current = [];
      }
    }
    return chunks;
  };
  const authored = {
    'opinion:3': {
      topic: 'Museums: local and international art',
      summary: '國際作品既能擴闊觀眾對藝術與社會的理解，也有助本地藝術家成長。',
      simple: [
        'Museums and art spaces help people learn about art, the past, and where they come from.',
        'Some people say these places should show only art made by local people.',
        'This essay says that idea is wrong',
        'because art from other countries helps people learn more and helps local art grow.',
        'Art from other countries helps people learn more in museums.',
        'If people see only local art, they cannot compare it with art from other places, so they learn less.',
        'When students see local art beside art from Japan or Africa, they see how different people use colours and shapes to show the same ideas.',
        'Art from other countries also helps people understand other people.',
        'Art made in other places can show war, people moving, faith, and unfair lives. It helps us understand lives unlike our own.',
        'So, if museums leave out art from other countries, people can learn less from them.',
        'Showing art from other countries also helps local artists and art spaces.',
        'Artists get better when they see new ways to make art and new ideas.',
        'If museums show only local art, artists may keep doing the same things. Art from other places can give them new ideas.',
        'For example, a young artist can learn from art in Europe and then make local art in a new way.',
        'Showing many kinds of art brings in more people and keeps art spaces busy.',
        'When art spaces show local and foreign art in turn, more people may visit and find local artists.',
        'In short, museums should show more than local art.',
        'I do not agree with showing only local art',
        'because art from other countries helps people learn and helps local artists grow.',
      ],
      stance: '強烈不同意只展出本地藝術家的作品',
      claims: ['國際藝術拓闊觀眾的藝術與社會理解', '國際展覽促進本地藝術家和美術館發展'],
      route: [
        ['開場與立場','交代「只展本地作品」的主張，表明強烈不同意及兩條理由。'],
        ['第一主體段','跨文化比較與社會經驗，說明國際作品的教育價值。'],
        ['第二主體段','外來技法刺激本地創作，多元展覽吸引觀眾。'],
        ['總結','重申不應限制本地作品，並總結理解與藝術成長。'],
      ],
      evidence: [
        ['只看本地藝術，觀眾會缺少甚麼？',['有意義的跨文化比較基礎','更多同一風格的作品','所有本地藝術家的姓名'],0,'原文指出只看本地傳統會令理解變窄，因為缺少比較基礎。'],
        ['日本版畫或非洲雕塑與本地畫作並列，有甚麼作用？',['讓學生比較各文化如何表達共同關注','證明所有文化使用相同技法','讓本地作品完全消失'],0,'並列展示讓學生看到色彩、象徵和形式的不同用法。'],
        ['外國作品反映戰爭、移民等議題，觀眾可得到甚麼？',['理解自身環境以外的經歷','只記住藝術品價格','停止研究本地文化'],0,'原文把其他社會的作品連到更深的社會理解。'],
        ['外來技法如何幫助本地藝術家？',['鼓勵他們改進方法並創作更原創的作品','令他們不再研究本地題材','要求所有藝術家模仿同一風格'],0,'第二主體段說外來影響挑戰既有方法，促進創新。'],
        ['本地與國際展覽交替，為何也有利本地藝術？',['吸引回訪觀眾，增加他們發現本地人才的機會','阻止評論家觀看本地展覽','保證每位觀眾都購買作品'],0,'原文指出多元展覽吸引較廣泛觀眾，亦帶來發現本地藝術的機會。'],
      ],
      logic: [
        [['主張','國際作品令美術館更有教育價值'],['限制','只看本地傳統，缺少比較基礎'],['例子','本地畫作與日本版畫或非洲雕塑並列'],['延伸','其他社會的作品反映不同人生經驗'],['結論','排除外國作品會削弱知識與文化價值']],
        [['主張','國際藝術亦幫助本地藝術家'],['機制','陌生技法與理念促使藝術家改進'],['例子','年輕藝術家以新方法處理本地題材'],['機構作用','多元展覽吸引不同及回訪觀眾'],['結果','更多人有機會發現本地人才']],
      ],
    },
    'discuss-both-views:4': {
      topic: 'Family-run businesses',
      summary: '作者認為家族關係主導企業會削弱公平與專業判斷，並讓私人衝突波及業務。',
      simple: [
        'In many places, families own small and middle-sized businesses. Many people think this helps a business do well.',
        'I do not agree.',
        'I think a business should not mainly be run through family ties. Family ties can lead to poor work choices and bring family fights into work.',
        'First, a family business may treat love for family as if it were skill at work.',
        'A good company gives jobs and better roles to people who do their work well. It also tells them when they need to improve.',
        'If family members get top jobs just because they are family, poor leaders may keep their jobs. Good workers outside the family feel ignored, rules are unfair, and hard choices wait too long.',
        'For example, if the owner’s son keeps losing buyers, other leaders may be afraid to tell him because his family could feel hurt.',
        'After some time, this unfair treatment makes workers trust the company less and makes it harder for the business to do well.',
        'Another problem is that family fights can cause problems at work.',
        'A company with trained leaders can use written rules and clear jobs to settle fights.',
        'But in a family company, fights about money or who will lead can feel very personal.',
        'For example, a fight between brothers and sisters over who will lead can stop the company from hiring people or growing.',
        'Other workers may feel they must pick a side. Then they care more about family ties than the needs of the business.',
        'This can be very bad when the company needs a new leader and needs to stay strong.',
        'A company cannot grow well if family fights keep pulling it in different ways.',
        'In short, I think family businesses often cause more problems than they solve.',
        'Businesses need fair rules and people who know how to do the work. Too much family control can get in the way.',
      ],
      stance: '不同意家族經營是最佳企業模式',
      claims: ['親情與能力混淆，損害公平和競爭力', '家族爭執進入企業，妨礙穩定決策'],
      route: [
        ['開場與立場','介紹家族企業常見；作者直接表示不同意。'],
        ['第一主體段','親情凌駕能力，偏袒削弱員工信任和競爭力。'],
        ['第二主體段','私人爭執波及業務，繼任時尤其危險。'],
        ['總結','公平、專業和清晰管治比家族關係更重要。'],
      ],
      evidence: [
        ['家族企業第一個問題是甚麼？',['親情與工作能力的界線變模糊','所有親屬都不願意工作','企業必然缺少資金'],0,'原文指出親屬可能憑血緣而非能力獲得高級職位。'],
        ['老闆兒子失去客戶的例子說明甚麼？',['經理可能怕觸怒家族而不敢糾正他','客戶必須由親屬服務','外部經理永遠不會犯錯'],0,'這個例子具體說明偏袒如何拖延必要的管理決定。'],
        ['非家族員工可能怎樣受影響？',['感到不受重視，對企業失去信任','自動獲得高級職位','一定離開國家'],0,'原文將能力被忽視與信任下降連起來。'],
        ['兄弟姊妹爭奪控制權，可直接拖慢哪些事？',['招聘、投資和擴張','藝術展覽和圖書借閱','家庭聚餐和旅行'],0,'第二主體段列出三項受阻的企業計劃。'],
        ['為何繼任時私人衝突尤其危險？',['企業需要穩定，爭執卻帶來對立','因為所有合約都會失效','因為員工不需工作'],0,'原文以穩定與對立的對比說明風險。'],
      ],
      logic: [
        [['主張','家族企業容易混淆親情與能力'],['管理標準','職位與糾正應按表現決定'],['失衡','親屬憑血緣升職，管理失誤受保護'],['例子','老闆兒子失去客戶仍難被質疑'],['結果','員工信任與企業競爭力下降']],
        [['主張','家族爭執可能波及業務'],['對比','專業企業可用合約和程序處理分歧'],['具體衝突','繼承、領導和金錢之爭變得私人化'],['例子','兄弟姊妹爭權阻礙招聘和投資'],['結論','繼任需要穩定，持續家族緊張會阻礙增長']],
      ],
    },
    'cause-solution:2': {
      topic: 'Large-brand marketing and local goods',
      summary: '大型品牌的宣傳擠壓本地企業並影響選擇；提高本地商品的可見度和購買便利性可改善情況。',
      simple: [
        'Big companies can spend a lot on ads, so people see their products more often than products made nearby.',
        'This can hurt local businesses and give people fewer choices, but we can make local goods easier to buy.',
        'First, it is hard for people to notice small local businesses.',
        'When buyers see the same big brands on TV, online, and in shops, they may trust them without thinking, even if local goods are just as good.',
        'When more people buy from big companies, small shops make less money, let workers go, or even close.',
        'This takes money out of the area and makes local shopping streets less lively.',
        'Second, people may choose a product because of how it looks, not how good it is.',
        'For example, people may think a snack is better just because they see its box, words, and famous faces everywhere.',
        'So people may pay more for a name they know, while they miss local food that is better for them or made more recently.',
        'To help people buy local goods, leaders should first help people see them.',
        'They can pay for local markets, places for local goods in shops, and websites where nearby makers can sell to people.',
        'If a family can find local food and things made by hand as easily as big-brand goods, buying local feels easy.',
        'Shops can also help by making local labels clear and giving local goods a fair place on their shelves.',
        'A label saying “made nearby,” with a little about the maker, can help people support their area when they shop.',
        'Public messages can tell buyers that money spent nearby helps keep jobs and make their area strong.',
        'In short, big companies’ ads can hurt small local shops and make people buy by brand name.',
        'But if local goods are easy to see, buy, and care about, more people may choose them.',
      ],
      stance: '說明大型企業宣傳的問題，提出促進本地購物的方法',
      claims: ['本地企業被擠壓，消費者被品牌形象引導', '政府與零售商提高本地產品可見度和便利性'],
      route: [
        ['開場與路線','大型企業宣傳優勢；指出問題與可行措施。'],
        ['問題段','本地商戶流失收入與職位；購買決定受品牌形象左右。'],
        ['解決段','市集、店內專區、網上平台、標籤與公共宣傳。'],
        ['總結','令本地商品顯眼、方便而有意義，重新引導需求。'],
      ],
      evidence: [
        ['大型品牌反覆出現在媒體和貨架，會產生甚麼影響？',['購物者可能不假思索地信任熟悉品牌','本地產品自然得到相同曝光','購物者一定選擇較健康產品'],0,'原文說熟悉度可令買家幾乎自動信任大品牌。'],
        ['銷售轉向大型企業，本地商戶可能怎樣？',['收入下降、裁員，嚴重時倒閉','必定增加分店','不再需要顧客'],0,'原文列出收入、工作和存續的連鎖後果。'],
        ['零食的包裝、口號和代言例子要指出甚麼？',['形象可令產品看似比實際更好','所有代言人都住在本地','本地食物必然更便宜'],0,'這例子支援「形象而非真正價值」的問題。'],
        ['政府和議會可如何提高本地商品的可見度？',['資助市集、店內專區和直接銷售平台','只要求消費者有道德感','禁止所有網上購物'],0,'原文提出三項有助找到本地產品的措施。'],
        ['零售商可提供甚麼協助？',['清楚標籤與公平貨架位置','只出售國際品牌','把生產者資訊藏起來'],0,'清晰標籤和合理貨架位置能減少尋找成本。'],
      ],
      logic: [
        [['原因','大企業花大量資金宣傳'],['注意力','品牌在媒體與貨架反覆出現'],['行為','消費者可能自動信任熟悉品牌'],['經濟後果','小商戶收入下降、裁員或倒閉'],['選擇後果','品牌形象蓋過真正價值']],
        [['目標','讓本地產品更顯眼及易買'],['公共措施','市集、店內專區和網上平台'],['零售措施','清晰本地標籤與公平貨架位置'],['購買體驗','本地購物變得方便而非負擔'],['結果','本地支出維持職位與社區活力']],
      ],
    },
  };
  const mediumExtras = {'opinion:3':['strongly disagrees','excluding foreign art','repeat visitors'],'cause-solution:2':['local spending sustains jobs']};
  const makeQuiz = ([prompt, options, correct, why]) => ({type:'quiz', prompt, options, correct, why});
  for (const [key, config] of Object.entries(authored)) {
    const essay = lessons[key];
    if (!essay || config.simple.length !== essay.sentences.length) throw Error(`Missing simple sentence: ${key}`);
    const sentences = essay.sentences.map((sentence, index) => {
      const text = sentence.english;
      const synonyms = lexicon.filter(([original]) => new RegExp(`(^|[^\\p{L}])${original.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?=$|[^\\p{L}])`, 'iu').test(text))
        .map(([original, simple, meaning]) => ({original, simple, meaning})).filter((item, position, all) => all.findIndex(other => other.original.toLowerCase() === item.original.toLowerCase()) === position).slice(0, 6);
      return {simple:config.simple[index], synonyms, chunks:sourceChunk(text), simpleChunks:sourceChunk(config.simple[index])};
    });
    // Keep the published wording intact while making the split stance usable.
    if (key === 'opinion:3') {
      sentences[2].chunks = ['This essay strongly', 'disagrees with that view'];
      sentences[2].simpleChunks = ['This essay says', 'that idea is wrong'];
    }
    const intro = [
      {type:'quiz', prompt:'作者對題目採取甚麼立場或寫作路線？', options:[config.stance,'完全沒有提出看法或方向','只重述題目，沒有論證'], correct:0, why:config.summary},
      {type:'multi', prompt:'選出全文的兩條主線', detail:'選兩項，再按「確認」。', options:[...config.claims,'只介紹題目的年份','只描述一個與題目無關的個人故事'], correct:[0,1], why:config.summary},
    ];
    const route = [{type:'sequence', prompt:'依照範文次序，逐一點選四張段落卡', detail:'先想每段的任務，再選下一張。', items:config.route.map(([title,body])=>({title,body})), why:config.route.map(x=>x[0]).join(' → ')}];
    const logic = config.logic.map((chain,index)=>({type:'sequence',prompt:`${index===0?'第一':'第二'}主體段：按原文論證次序排序`,detail:'逐一點選下一步。',items:chain.map(([title,body])=>({title,body})),why:'已接回這一段的論證次序。'}));
    essay.meta = {topic:config.topic,summary:config.summary};
    essay.support = {sentences, intro, route, evidence:config.evidence.map(makeQuiz), logic, structures:[], transfer:[], mediumExtras:mediumExtras[key] || []};
  }
  window.ESSAY_MEMORY_AUTHORED = authored;
})();
(() => {
  'use strict';
  const lessons = window.ESSAY_MEMORY_LESSONS;
  const frames = {
    because: {
      frame:'[要解釋的結果] because [原因]', meaning:'後半句解釋前半句的原因。', usage:'說明結果或判斷背後的原因。',
      parts:[['[要解釋的結果]','slot'],[' because ','link'],['[原因]','slot']],
      options:['Mia put on a coat because the air was cold.','The air was cold, so Mia put on a coat.','If the air is cold, Mia will put on a coat.','When the air became cold, Mia put on a coat.'],
      explanations:['because 引出穿外套的原因。','so 引出結果，與標示的 because 句型不同。','if 提出條件，與標示的 because 句型不同。','when 指出時間或情況，與標示的 because 句型不同。'],
    },
    if: {
      frame:'If [條件], [可能出現的結果]', meaning:'前半句提出條件，後半句說明在該條件下的結果。', usage:'解釋某做法或情況出現時會怎樣。',
      parts:[['If ','link'],['[條件]','slot'],[', ','link'],['[可能出現的結果]','slot']],
      options:['If the train is late, we will take the bus.','When the train arrives, we will take the bus.','The train was late, so we took the bus.','We took the bus because the train was late.'],
      explanations:['if 提出改乘巴士的條件。','when 指出發生的時間或情況，與標示的 if 句型不同。','so 引出結果，與標示的 if 句型不同。','because 解釋原因，與標示的 if 句型不同。'],
    },
    when: {
      frame:'When [情況發生], [相關結果或行動]', meaning:'指定情況發生時，接着出現相關行動或結果。', usage:'把具體情境與其後果連起來。',
      parts:[['When ','link'],['[情況發生]','slot'],[', ','link'],['[相關結果或行動]','slot']],
      options:['When the bell rang, the class went inside.','If the bell rings, the class will go inside.','The class went inside because the bell rang.','The bell rang, so the class went inside.'],
      explanations:['when 指定鈴聲響起的時間或情況，後面接相關行動。','if 提出條件，沒有使用 when 引出發生的情況。','because 解釋原因，沒有使用 when 引出發生的情況。','so 引出結果，沒有使用 when 引出發生的情況。'],
    },
    so: {
      frame:'[原因或情況], so [結果]', meaning:'先給原因或情況，再說其結果。', usage:'清楚連接行為、制度或環境與後果。',
      parts:[['[原因或情況]','slot'],[', so ','link'],['[結果]','slot']],
      options:['The road was icy, so the driver slowed down.','The driver slowed down because the road was icy.','When the road became icy, the driver slowed down.','If the road is icy, the driver will slow down.'],
      explanations:['so 明確把結冰與司機減速連成前因後果。','because 引出原因，與標示的 so 句型不同。','when 指出時間或情況，與標示的 so 句型不同。','if 提出條件，與標示的 so 句型不同。'],
    },
    but: {
      frame:'[先提出的情況], but [形成轉折的情況]', meaning:'後半句與前半句形成有意義的轉折。', usage:'先承認一點，再指出不同或相反的另一點。',
      parts:[['[先提出的情況]','slot'],[', but ','link'],['[形成轉折的情況]','slot']],
      options:['The bag was heavy, but she carried it upstairs.','The bag was heavy, but it weighed a lot.','The bag was empty, but nothing was inside it.','The bus arrived, but the bus came.'],
      explanations:['雖然重，她仍搬上樓，形成轉折。','後半句只重述重量。','後半句只重述空袋。','後半句只重述巴士到達。'],
    },
    rather: {
      frame:'[所選做法] rather than [被排除的做法]', meaning:'比較兩個做法，突出真正選擇的一個。', usage:'說明優先採取哪個選擇。',
      parts:[['[所選做法]','slot'],[' rather than ','link'],['[被排除的做法]','slot']],
      options:['We walked rather than drove because the station was near.','We walked rather than went on foot to the station.','We took a taxi rather than travelled by taxi.','We ate dinner rather than had our evening meal.'],
      explanations:['步行和駕車是兩個不同選擇，句子指出前者。','兩邊是同一做法，沒有選擇。','兩邊都是乘的士。','兩邊都是吃晚餐。'],
    },
    example: {
      frame:'[一般主張]; for example, [符合主張的具體例子]', meaning:'用具體例子支持前面的概括。', usage:'把抽象主張變成可檢驗的情境。',
      parts:[['[一般主張]','slot'],['; for example, ','link'],['[具體例子]','slot']],
      options:['Some fruits contain vitamin C; for example, oranges do.','Some birds can fly; for example, dogs can.','Some tools cut paper; for example, a pillow can.','Some shops open early; for example, this one opens only at midnight.'],
      explanations:['橙是符合一般主張的具體例子。','狗不是鳥，也不會飛。','枕頭不是剪紙工具。','只在午夜開門不能證明「早開」。'],
    },
    contrast: {
      frame:'[一種情況]; by contrast, [不同的另一種情況]', meaning:'清楚對比兩種不同情況。', usage:'讓讀者看出兩者的關鍵差異。',
      parts:[['[一種情況]','slot'],['; by contrast, ','link'],['[不同的另一種情況]','slot']],
      options:['The first room is noisy; by contrast, the second is quiet.','The first room is noisy; by contrast, the second is also noisy.','The first room is empty; by contrast, nobody is inside it.','The first room is upstairs; by contrast, it is on the upper floor.'],
      explanations:['嘈與靜構成清晰對比。','兩間房都嘈，沒有指定的對比。','後半句重述同一間房空無一人。','後半句重述樓上位置。'],
    },
    while: {
      frame:'[第一種情況], while [形成對照的第二種情況]', meaning:'兩種情況並置以顯示差異。', usage:'比較兩組人、事物或結果。',
      parts:[['[第一種情況]','slot'],[', while ','link'],['[形成對照的第二種情況]','slot']],
      options:['I prefer tea, while my brother prefers coffee.','I prefer tea, while tea is my favourite drink.','The box is full, while it has no space left.','The door is open, while it is not closed.'],
      explanations:['兩個人對飲品有不同偏好。','後半句只是重述我的偏好。','後半句重述箱子已滿。','後半句重述門是開的。'],
    },
    however: {
      frame:'[先提出的情況]. However, [轉折情況]', meaning:'後一句修正或對照先前的情況。', usage:'在論證中指出例外、限制或不同方向。',
      parts:[['[先提出的情況]','slot'],['. However, ','link'],['[轉折情況]','slot']],
      options:['The path was long. However, we finished before sunset.','The path was long. However, it was not short.','The test was easy. However, it was simple.','The shop was closed. However, it was not open.'],
      explanations:['路長與日落前完成形成轉折。','後一句只是重述路長。','後一句只是重述容易。','後一句只是重述關門。'],
    },
  };
  frames.instance = { ...frames.example, frame:'[一般主張]; for instance, [符合主張的具體例子]', parts:[['[一般主張]','slot'],['; for instance, ','link'],['[具體例子]','slot']], options:frames.example.options.map(option => option.replace('for example', 'for instance')) };
  // Every source sentence receives a card. The displayed coloured spans are
  // contiguous substrings of the real sentence, including intentional fragments.
  const relationTypes = {
    because:['原因','後面的內容交代原因。','解釋前面的判斷或結果。'],
    if:['條件','先提出條件，再說會發生甚麼。','說明條件與結果。'],
    when:['時間／情況','說明某情況發生時的行動或結果。','連接情境與後果。'],
    so:['結果','前面的情況帶來後面的結果。','指出因果結果。'],
    but:['轉折','後面的內容與前面形成轉折。','提出不同方向。'],
    while:['對比','把兩種不同情況放在一起比較。','比較兩種情況。'],
    however:['轉折','後面的內容修正或對照前面的情況。','說明不同方向。'],
    'rather than':['取捨','突出一個選擇，同時排除另一個。','說明選擇或優先次序。'],
    'instead of':['代替','表示採用前一種做法，而不採用後一種做法。','要表達「做 A，而不做 B」時；instead of 後接名詞或 -ing 動詞。'],
    'for example':['舉例','用一個具體情況支持前面的意思。','用例子說明。'],
    'for instance':['舉例','用一個具體情況支持前面的意思。','用例子說明。'],
    'by contrast':['對比','把兩種情況放在一起，指出差別。','比較兩種情況。'],
    'as a result':['結果','承接前面的原因，指出結果。','說明因果結果。'],
    'in conclusion':['總結','收束前面的論證。','總結立場。'],
    'overall':['總結','收束前面的論證。','總結立場。'],
    'and':['並列','連接兩項同樣重要的內容。','並列兩個意思。'],
    'how-clause':['影響理解','說明某事如何影響別人的理解方式。','用 help shape how 引出被影響的理解方式。'],
    stance:['表態','直接表達贊同或反對的立場。','用明確動詞指出自己的看法。'],
    causative:['造成改變','說明一種做法令某事物出現某種特點。','用 Doing A makes B + 形容詞表達改變。'],
    sequencing:['次序','標示同一系列中的下一項理由或效果。','用 Second 引出與第一項並列的新點。'],
    consequence:['推論','根據之前的理由帶出一項判斷。','用 For that reason 回指前述理由。'],
    benefit:['補充好處','說明同一做法亦能使另一方受益。','用 also benefits 補充受惠對象。'],
    relative:['關係子句','補充說明前面的名詞。','用 who 子句描述前面提到的人。'],
    problem:['提出問題','用 that 子句說明問題內容。','用 The first problem is that 引出完整子句。'],
    progression:['時間推進','指出影響隨時間累積。','用 Over time 引出長期結果。'],
    method:['方法','指出某事透過甚麼方式完成。','用 through 或 by + -ing 說明方法。'],
    'participle-result':['伴隨結果','用 -ing 片語補充前面情況造成的結果。','用逗號加 creating 表達結果。'],
    'as-change':['變化伴隨結果','指出一種變化發展時另一種情況隨之出現。','用 As A changes, B happens。'],
    'parallel-verbs':['並列效果','同一主語連接兩個動作或影響。','用動詞 1 and 動詞 2。'],
    purpose:['目的','先交代目的，再提出主要行動。','用 To + 動詞原形交代目的。'],
    list:['列舉','以逗號和 and 並列同類項目。','列出三項或更多同類項目。'],
    transformation:['轉化','說明一事物變成另一種狀態。','用 turn X into Y。'],
    reminder:['提醒內容','指出提醒的對象及要記住的內容。','用 remind someone that + 子句。'],
    statement:['直接陳述','這句直接提出一項觀點或事實。','清楚陳述一項意思。'],
  };
  const exampleOptions = {
    reasonFragment:['I disagree with the plan because it costs too much.','I disagree with the plan, but it costs too much.','I disagree with the plan, so it costs too much.','I disagree with the plan when it costs too much.'],
    statement:['I disagree.','If it rains, we will stay home.','I stayed home because it rained.','It was cold, but we went out.'],
    and:['The class read books, and the teacher took notes.','If the bell rings, we will leave.','The class left because it was late.','The room was cold, but we stayed.'],
    'in conclusion':['In conclusion, we should save water.','If it rains, we will stay home.','I stayed home because it rained.','For example, my brother cycles to work.'],
    overall:['Overall, this plan helps students.','When the bell rings, we will leave.','I stayed home because it rained.','For example, my brother cycles to work.'],
    'as a result':['As a result, fewer cars used the road.','If it rains, we will stay home.','I like tea, but she likes coffee.','For example, my brother cycles to work.'],
    'instead of':['We walked instead of taking the bus.','We walked because it was sunny.','When it was sunny, we walked.','We walked, so we arrived late.'],
    'rather than':['The choice was based on skill rather than family ties.','The choice was based on skill because it was fair.','The choice was based on skill, so the team improved.','The choice was based on skill when the manager arrived.'],
    'by contrast':frames.contrast.options,
    relative:['We need helpers who can explain the rules.','We need helpers because the queue is long.','We need helpers if the queue grows.','We need helpers, so the queue moves faster.'],
    method:['The dispute was settled through discussion.','The dispute was settled because it was small.','The dispute was settled, but it took time.','The dispute was settled when the teacher arrived.'],
    list:['The club offers music, sport, and art classes.','The club offers music because students asked.','The club offers music, so more people joined.','The club offers music while the room is open.'],
    transformation:['The course turned a hobby into a career.','The course helped because it was short.','The course was useful, but it was expensive.','The course began when school ended.'],
  };
  // Sentence-specific teaching notes, checked against the published essay text.
  // The attached mapping supplied useful examples, but source mismatches were not copied.
  const teachingNotes = {
    'opinion:3': [
      ['help shape how 引出受影響的理解方式：博物館會影響公眾如何看待藝術、歷史和文化。','要說明 A 如何影響 B 的理解方式，可用「A helps shape how B understands C」。'],
      ['「只展示本地藝術家」是主張採用的做法；「展示其他國家的作品」是被排除的做法。instead of 表示做前者，而不做後者。','比較兩種做法並指出採用前者、捨棄後者時使用。instead of 後接名詞或 -ing 動詞；這句接 showing。'],
      ['strongly disagrees with 明確表達作者強烈反對前述看法。','要直接表達強烈反對某項主張，可用「X strongly disagrees with Y」；with 後接反對的對象。'],
      ['because 承接前一句的反對立場，後面列出兩項理由。','用 because 接在判斷後面交代原因；若有兩項原因，可用 and also 把它們並列。'],
      ['以 Showing foreign work 這個 -ing 片語作主語，說明它令博物館更具教育意義。','要說明一種做法造成甚麼改變，可用「Doing A makes B + 形容詞」。'],
      ['if 提出只看本地傳統的條件；主句說理解會變窄，because 再解釋原因。','要說明某條件可能帶來的結果，可用「If A, B」；再用 because 補充造成結果的原因。'],
      ['When 設定畫作並列的情境；後半句說明學生在這個情境下能看見甚麼。','用「When A, B」把一個情境與其中發生的結果連起來；for example 可插入具體例子。'],
      ['Second 標示與上一項並列的第二項好處：加深社會理解。','列出同一主題下的第二個獨立理由或效果時，可用 Second 開頭，再給出新的一點。'],
      ['so 連接前因後果：作品反映不同社會經歷，因此接觸作品有助理解他人。','要把前一情況造成的結果說清楚，可用「A, so B」；B 應是由 A 合理產生的後果。'],
      ['For that reason 回指前面的理由，帶出排除外國作品會降低博物館價值的推論。','已有理由後，要指出由此得出的判斷或後果，可用 For that reason 開頭。'],
      ['Displaying international art 是 -ing 主語；also 表示這項做法還使本地藝術家及相關機構受益。','要補充同一做法的另一項好處，可用「Doing A also benefits B」。'],
      ['when 指出藝術家在受到陌生技法和理念挑戰的情況下會進步。','要說明某結果在甚麼情況下出現，可用「B when A」；when 子句可放在主句後。'],
      ['先以 if 說明只展本地作品的可能限制，再用 by contrast 對比外來影響的效果。','要並列兩種做法或情況的不同結果，可用分號接 by contrast，突出後者與前者的差異。'],
      ['for instance 插入一位年輕藝術家的例子，說明借鑑外國技法的可能效果。','一般主張之後要給具體個案時，可用 for instance；也可放在主語後作插入語。'],
      ['Second 引入另一項好處；attract 和 keep 並列表示同一做法的兩個效果。','列出第二項理由並同時說明兩個效果，可用「Second, A + 動詞 1 and 動詞 2」。'],
      ['When 指出展覽交替的情況；主句說會吸引訪客，who 再補充訪客可能發現人才。','用 When 引出情況，主句交代結果；若要補充句中提到的人之後會做甚麼，可加「, who + 動詞」。'],
      ['In conclusion 標示收束；should not 表達不應只展示本地藝術家的判斷。','結束論證並重申最終判斷時，可用 In conclusion 開頭；should 或 should not 表達建議。'],
      ['strongly disagree with 再次明確表達對該主張的反對。','要簡潔而明確地重申反對立場，可用「I strongly disagree with + 看法」。'],
      ['because 接續反對立場，後面的 both ... and 並列兩個理由。','解釋某判斷時，可用 because 引出原因；用 both A and B 強調兩個並列理由。'],
    ],
    'discuss-both-views:4': [
      ['and 連接兩項相關陳述：家族經營普遍存在，這種安排也常被視為成功基礎。','要並列兩項完整而相關的陳述，可用「子句 A, and 子句 B」；第二句可用 this 回指前項。'],
      ['I disagree 以簡短獨立句明確表達不同意。','要毫不含糊地直接表態時，可用「I disagree」；若要指出對象，可加 with + 看法。'],
      ['because 解釋為何家族關係主導企業不是最佳模式，後面並列兩個風險。','要為判斷提供原因，可用「判斷, because 原因」；同一原因內可並列兩種影響。'],
      ['The first problem is that 引出第一項具體問題：親情與能力容易混淆。','要清楚提出第一項問題，可用「The first problem is that + 完整子句」。'],
      ['who 子句描述 employees，並列 selected、promoted 和 corrected 三項按表現作出的決定。','要補充說明某一群人具備甚麼特徵，可用「名詞 + who + 動詞」；多項平行動作可用逗號及 and 連接。'],
      ['When 提出親屬憑血緣任職的情況，後面接管理受損及其他連鎖後果。','要先設定一種情況，再推導其後果，可用「When A, B」；後續句子可再展開 B 的影響。'],
      ['For example 引出具體個案，if 設定個案條件，because 解釋經理為何不敢提出批評。','要用可想像的個案支援一般主張，可用 For example 開頭；例子內可再用 if 和 because 說明條件與原因。'],
      ['Over time 指出偏袒累積之後會削弱信任和競爭力。','要說明影響逐漸累積而非立即發生，可用 Over time 引出長期結果。'],
      ['Another major issue is that 引出不同於前一問題的另一項問題。','提出另一個主要問題時，可用「Another major issue is that + 完整子句」。'],
      ['through 指出處理爭議的方法：合約、職責說明和正式程序。','要交代某事透過甚麼方法完成，可用「動作 + through + 方法」；此處也配合被動語態。'],
      ['however 插入句中，將家族企業的情況與前述專業管理方式作對比。','要轉向與前一情況不同的情況，可用 however；插在句中時，前後一般用逗號隔開。'],
      ['for instance 插入兄弟姊妹爭奪控制權的具體例子。','要為一般說法補充具體個案，可用 for instance 作插入語，前後用逗號隔開。'],
      ['creating 表示前述員工被迫選邊所造成的結果：形成不健康的工作氣氛。','要簡潔補充前一整句造成的結果，可在逗號後用「creating + 結果」。'],
      ['when 補充說明 during succession 這段期間的情況：企業需要穩定。','先指出某個時期，再補充該時期的特點時，可用「during + 時期, when + 子句」。'],
      ['if 放在主句後，指出企業無法穩步成長所依據的條件。','要把結果先說出，再補充成立條件，可用「結果 if 條件」。'],
      ['Overall 標示整體判斷；more likely ... than 比較兩種可能結果。','概括前面的論證時，可用 Overall；比較哪種結果較可能，可用「more likely to A than B」。'],
      ['and 連接兩項完整陳述：企業需要若干原則，而這些原則可能被家族關係削弱。','要先提出一項需要，再接上與它相關的後果，可用「子句 A, and 子句 B」。'],
    ],
    'cause-solution:2': [
      ['so 連接宣傳投入與產品能見度提升，表示後者由前者造成。','要表達某情況導致甚麼結果，可用「原因或情況, so 結果」。'],
      ['but 把已指出的損害與仍可採取的改善措施連起來。','先指出一種情況，再轉向不同或相反的可能性時，可用「A, but B」。'],
      ['The first problem is that 引出小企業被大品牌掩蓋的第一項問題。','要清楚提出第一項問題，可用「The first problem is that + 完整子句」。'],
      ['When 設定反覆看到品牌的情況；主句說會產生信任，even when 再補充反預期情況。','要由某情況推到常見反應，可用「When A, B」；要指出即使有例外條件仍如此，可加 even when。'],
      ['As 表示隨着銷售轉向大企業，小商店的收入、職位和存續逐步受影響。','要表示某種變化發展的同時，另一結果隨之出現，可用「As A changes, B happens」。'],
      ['drains 和 leaves 共用主語 This，並列說明資金流失與街道變得單調兩項後果。','要說明同一原因帶來兩種並行影響，可用「主語 + 動詞 1 and 動詞 2」。'],
      ['rather than 對比形象與真正價值，指出前者才是影響選擇的因素。','要指出實際依據是 A 而非 B，可用「A rather than B」；兩邊應是可比較的項目。'],
      ['for instance 插入廣告零食的具體例子；because 再解釋它為何看似更好。','要用一個具體個案說明一般說法，可用 for instance 作插入語；必要時用 because 解釋例子。'],
      ['As a result 回指前文原因；while 並列對照買家多付錢與本地產品被忽視的結果。','由前述原因推到後果時，可用 As a result 開頭；若有對照的兩個後果，可再用 while。'],
      ['To encourage local purchasing 先交代目的，主句再提出應採取的行動。','要先說明行動的目的，再提出做法，可用「To + 動詞原形 ..., 主句」。'],
      ['逗號和 and 把市集、店內專區和網上平台三項平行措施列成清單。','列出三項或更多同類項目時，可用逗號分隔，最後一項前加 and。'],
      ['If 提出本地貨變得容易找到的條件；主句說購買本地便成為方便的習慣。','要說明某條件成立後可能出現的結果，可用「If A, B」；rather than 可再排除另一種理解。'],
      ['by using 說明零售商可以用甚麼方法提供幫助。','要補充完成某行動的方法，可用「動作 + by + -ing 動詞」。'],
      ['turn ... into 表示簡單標籤可把普通購物轉變為支持社區的行為。','要說明某措施把 X 轉化為 Y，可用「turn X into Y」。'],
      ['remind consumers that 表示公共宣傳提醒某群人注意一項事實。','要指出提醒誰留意甚麼內容，可用「remind + 人 + that + 完整子句」。'],
      ['In conclusion 標示總結；後面並列大型企業宣傳力量的兩項後果。','要在結尾概括已說過的主要結果，可用 In conclusion 開頭，並列相關重點。'],
      ['However 將前述問題轉向另一種可能；if 設定方案奏效的條件。','要從問題轉到不同可能性，可用 However；再用 if 說明該可能性成立的條件。'],
    ],
  };
  for (const [key, notes] of Object.entries(teachingNotes)) {
    if (notes.length !== lessons[key].sentences.length) throw Error('Missing sentence-specific teaching note: ' + key);
  }
  // Same-function examples for direct statements and embedded examples.
  const contextualApplications = {
    'opinion:3': {
      0:'Schools help shape how children understand the world.',
      2:'I strongly disagree with that plan.',
      3:'I oppose the plan because it costs more and also takes longer.',
      4:'Reading books from other countries makes lessons more interesting.',
      5:'If the road is blocked, traffic slows because drivers must take another route.',
      6:'When a library holds a reading day, for example, children can discover new stories.',
      7:'Second, meeting new people can deepen our understanding of others.',
      9:'For that reason, closing the library would reduce learning opportunities.',
      10:'Showing films from abroad also benefits local filmmakers.',
      12:'If children read only one author, their view stays narrow; by contrast, varied stories widen it.',
      13:'A young chef who studies abroad, for instance, may improve local dishes.',
      14:'Second, varied events attract more visitors and keep the centre lively.',
      15:'When schools hold festivals, they attract families, who then learn about the community.',
      17:'I strongly disagree with this rule.',
      18:'I oppose the plan because it both costs more and takes longer.',
    },
    'discuss-both-views:4': {
      0:'Many people work from home, and this arrangement saves travel time.',
      1:'I disagree.',
      3:'The first problem is that the new rule may be unfair.',
      5:'When drivers ignore signs, roads become dangerous. This creates more delays.',
      6:'For example, if a driver ignores the sign, other cars may have to stop.',
      7:'Over time, unfair rules reduce trust among workers.',
      8:'Another major issue is that old computers often break.',
      11:'A fight between neighbours over parking, for instance, can delay road repairs.',
      12:'Other workers may choose sides, creating a stressful workplace.',
      13:'This is risky during winter, when roads are often icy.',
      15:'Overall, the plan is more likely to save time than cause delays.',
      16:'Schools need clear rules, and these rules work best when everyone understands them.',
    },
    'cause-solution:2': {
      2:'The first problem is that small shops lose customers.',
      3:'When a shop becomes crowded, people wait, even when another shop is empty.',
      4:'As more people shop online, local stores lose sales and close.',
      5:'This takes time from teachers and leaves less time for students.',
      6:'The choice was based on speed rather than safety.',
      7:'A popular shoe, for instance, may seem better because its ads are everywhere.',
      8:'As a result, some pupils progressed, while others fell behind.',
      9:'To reduce waste, councils should make recycling bins easier to find.',
      12:'Schools can also help by giving students clear information.',
      13:'A short course can turn a hobby into a career.',
      14:'Public messages can also remind people that local shops create jobs.',
      16:'However, if the rain stops, we can still play outside.',
    },
  };
  // Each override points to the construction being taught, including places
  // where the first connector in the sentence is not the useful focus.
  const focusOverrides = {
    'opinion:3': {
      0:['help shape how','how-clause'],2:['strongly disagrees with','stance'],4:['makes','causative'],
      5:['if','if',', their understanding'],6:['When','when',', for example, students'],
      7:['Second,','sequencing'],9:['For that reason,','consequence'],10:['also benefits','benefit'],
      12:['by contrast','by contrast'],14:['Second,','sequencing'],15:['When','when',', they draw'],
      17:['strongly disagree with','stance'],
    },
    'discuss-both-views:4': {
      1:['disagree','stance'],3:['The first problem is that','problem'],4:['who','relative'],
      5:['When','when',', poor management'],7:['Over time,','progression'],
      8:['Another major issue is that','problem'],9:['through','method'],
      12:['creating','participle-result'],16:[', and ','and',null,true],
    },
    'cause-solution:2': {
      2:['The first problem is that','problem'],3:['When','when',', they tend'],
      4:['As','as-change',', independent shops'],5:[' and leaves ','parallel-verbs'],
      9:['To encourage local purchasing,','purpose'],10:[', and ','list'],
      11:['If','if',', buying locally'],
      12:['by using','method'],13:['into','transformation'],14:['remind consumers that','reminder'],
    },
  };
  const connectorPattern = /\b(?:because|if|when|so|but|while|however|rather than|instead of|for example|for instance|by contrast|as a result|in conclusion|overall)\b|,\s+and\s+/ig;
  for (const [key, essay] of Object.entries(lessons)) {
    essay.support.structures = essay.sentences.map((source, position) => {
      const text=source.english;
      const focus=focusOverrides[key]?.[position];
      const match=focus ? {0:focus[0],index:focus[3]?text.lastIndexOf(focus[0]):text.indexOf(focus[0])} : connectorPattern.exec(text);
      connectorPattern.lastIndex=0;
      if (!match || match.index<0) throw Error(`Missing audited structure focus: ${key} sentence ${position+1}`);
      const rawType=focus?.[1] || match[0].trim().replace(/^,\s*/,'').toLowerCase();
      const type=relationTypes[rawType] ? rawType : 'statement';
      if (type==='statement') throw Error(`Unaudited structure: ${key} sentence ${position+1}`);
      const [functionName,genericMeaning,genericUsage]=relationTypes[type];
      const [meaning,usage]=teachingNotes[key]?.[position] || [genericMeaning,genericUsage];
      const before=text.slice(0,match.index);
      const connector=match[0];
      const after=text.slice(match.index+connector.length);
      const startsWithBecause=type==='because' && !before.trim();
      const labels={
        because:['要解釋的判斷','引出原因','原因'],if:['先說的結果／次序','提出條件','成立條件'],
        when:['先說的結果／時期','指定情況或時間','情況／時間'],so:['原因／情況','導出結果','結果'],
        but:['先說的情況','轉向不同情況','形成轉折的情況'],however:['第二種情況的背景','對照前文','不同的情況'],
        'instead of':['提出主張及採用的做法','表示以 A 代替 B','被排除的另一做法'],
        'rather than':['實際依據','排除另一依據','被排除的依據'],
        'by contrast':['第一種情況','引出對照','形成對照的另一情況'],
        'for example':['一般主張','引出具體例子','具體情境'],
        'for instance':['例子的主語','插入例子標記','例子的結果'],
        'as a result':['前述原因','引出後果','後果'],
        'in conclusion':['前述論證','標示總結','總結判斷'],overall:['前述論證','標示整體判斷','整體判斷'],
        and:['第一項陳述','連接兩項陳述','相關的第二項陳述'],
        list:['前面列出的項目','連接清單最後一項','最後一項'],
        'how-clause':['影響者','影響理解的句型','理解方式'],stance:['表態者','立場動詞','反對的看法'],
        causative:['造成改變的做法','使某事變得如何','受到影響的事物'],
        sequencing:['前一個理由','標示第二項','新的一項'],consequence:['前述理由','根據理由作推論','推論結果'],
        benefit:['做法／主語','補充受惠對象','受惠者'],relative:['被描述的人','引出關係子句','補充特徵'],
        problem:['前一項問題','引出問題內容','具體問題'],progression:['先前情況','表示時間累積','長期結果'],
        method:['要完成的行動','引出方法','所用方法'],
        'participle-result':['前面造成影響的情況','引出伴隨結果','造成的結果'],
        'as-change':['先前情況','表示隨着變化','變化與結果'],
        'parallel-verbs':['第一個影響','並列另一個影響','第二個影響'],
        purpose:['先前情況','先說明目的','主要行動'],
        transformation:['做法及被轉化的事物','表示轉化為','轉化後的狀態'],
        reminder:['提醒者','引出提醒內容','要記住的內容'],
      }[type] || ['前半句','句型核心','後半句'];
      const parts=[];
      if (before) parts.push({text:before,kind:'slot',label:labels[0]});
      parts.push({text:connector,kind:'link',label:labels[1]});
      if (focus?.[2]) {
        const boundary=after.indexOf(focus[2]);
        if (boundary<0) throw Error(`Missing condition boundary: ${key} sentence ${position+1}`);
        parts.push({text:after.slice(0,boundary),kind:'slot',label:'條件／情況'});
        parts.push({text:after.slice(boundary,boundary+2),kind:'link',label:'接上結果'});
        parts.push({text:after.slice(boundary+2),kind:'slot',label:'結果／行動'});
      } else if (after) parts.push({text:after,kind:'slot',label:startsWithBecause?'承接上一句的原因':labels[2]});
      const frame=parts.map(part=>part.kind==='link'?part.text:`[${part.label}]`).join('');
      const ownExample=contextualApplications[key]?.[position];
      const optionBank=exampleOptions[type] || frames[type]?.options || exampleOptions.statement;
      const examples=ownExample ? [ownExample,...optionBank.slice(1)] : startsWithBecause ? exampleOptions.reasonFragment : optionBank;
      return {id:`${essay.id}-frame-${String(position+1).padStart(2,'0')}`,
        patternType:type,frame, meaning, usage,
        source:{paragraph:source.paragraph+1,sentence:source.index+1},
        parts,prompt:'哪一句正確用了上面標示的句型？',
        options:examples,correct:0,explanations:[
          `這句同樣運用了「${functionName}」的功能。`,
          `這句未能正確呈現「${functionName}」的關係。`,
          `這句未能正確呈現「${functionName}」的關係。`,
          `這句未能正確呈現「${functionName}」的關係。`,
        ]};
    });
  }
  const makeTransfer = (context,question,options,correct,explanations,sourceSentenceIndices,modelLink) => ({
    prompt:question,context,question,options,correct,explanations,
    why:explanations[correct],sourceSentenceIndices,modelLink,
  });
  lessons['opinion:3'].support.transfer = [
    makeTransfer('學校只教本地故事，學生未接觸過其他地方的故事。','哪項最直接展示跨文化比較能擴闊理解？',['加入外國故事，讓學生比較不同文化如何處理相似的家庭關係','只把同一篇本地故事讀三遍','把所有外國故事的封面換成相同顏色','停止閱讀任何故事'],0,['比較相似主題如何在不同文化呈現，對應原文的比較基礎。','重讀同一材料沒有跨文化比較。','改封面不會帶來不同內容。','完全停止閱讀不能支持學習。'],[5,6],'原文以本地畫作與日本版畫或非洲雕塑並列，說明比較使學生看到不同文化如何表達共同關注。'),
    makeTransfer('社區中心想讓居民理解新移民的生活經歷。','哪項活動最能對應範文的社會理解論證？',['展示新移民描述搬遷與適應的作品，並安排討論','只展示中心的開放時間','只公布藝術品尺寸','把所有作品按價格由高至低排列'],0,['作品呈現他人的經歷，能讓居民理解自身環境以外的生活。','開放時間沒有呈現生活經歷。','尺寸沒有呈現生活經歷。','價格排序與理解社會經驗無關。'],[7,8],'原文指出其他社會的作品可反映戰爭、移民等經歷，幫助觀眾理解自己環境以外的人。'),
    makeTransfer('攝影學會的新成員每次都模仿同一種構圖。','哪項安排最能促進他們的原創能力？',['讓他們研究不同國家的攝影方法，再拍攝本地街景','要求每人永久使用同一構圖','只評選誰的相機最貴','取消所有作品討論'],0,['外來方法可挑戰既有做法，並用於本地題材。','重複同一構圖正是原文指出的限制。','器材價格不等於創作方法。','取消討論不能展示新技法如何影響創作。'],[11,12,13],'原文由陌生技法帶來挑戰，推至改進方法及更原創的本地創作。'),
    makeTransfer('小型劇院希望更多人認識本地演員。','哪項做法最貼近範文對多元展覽的推理？',['交替安排本地和國際劇目，讓新觀眾有機會認識本地演員','永遠只演同一齣本地劇','只更換大堂燈光，不改劇目','減少所有演出的宣傳'],0,['多元節目先吸引不同觀眾，然後增加他們發現本地人才的機會。','同一劇目未展示更廣泛觀眾來源。','燈光變化不等於節目多元。','減少宣傳不能支持吸引觀眾。'],[14,15],'原文把本地與國際展覽交替，連到更廣泛的觀眾與本地人才的曝光。'),
    makeTransfer('讀書會討論是否只保留本地作者的作品。','哪個結論最能保留範文的兩條理由？',['保留本地作品，也加入外國作品，既擴闊讀者理解也啟發本地作者','全部撤走本地作品','只談書架的顏色','因外國作品多，所以所有本地作品都沒有價值'],0,['同時保留理解與本地創作成長兩條理由。','原文沒有主張排除本地藝術。','書架顏色與兩條理由無關。','原文沒有否定本地作品的價值。'],[2,3,17,18],'範文的立場是反對「只」展本地作品，理由是拓闊理解及促進本地藝術發展。'),
  ];
  lessons['discuss-both-views:4'].support.transfer = [
    makeTransfer('餐廳老闆正選新店經理，侄子與一位有經驗的員工都申請。','哪個準則最符合範文第一主體段？',['按實際管理能力和工作表現選人','只因為侄子是親屬便選他','讓應徵者自行決定職位','按誰住得更近決定'],0,['職位按能力及表現決定，保留親情與能力的界線。','血緣取代能力，正是原文批評的做法。','沒有公平評核能力。','住得近不是管理能力的證據。'],[3,4,5],'原文要求員工按表現選拔與晉升，指出親屬憑血緣任職會保護差劣管理。'),
    makeTransfer('一家店的親屬主管屢次錯誤訂貨，同事不敢提醒。','哪個後果最直接對應範文？',['錯誤未獲糾正，其他員工感到不公平並失去信任','店內每件貨品都變得便宜','所有員工即時升職','顧客一定知道家族爭執詳情'],0,['不敢糾正親屬主管，對應標準不一與信任受損。','把訂貨錯誤當私人小事，沒有糾正問題及保障員工信任。','只看貨品價格，沒有處理主管錯誤及偏袒。','等待顧客發現問題，仍未按同一標準管理。'],[5,6,7],'原文以老闆兒子失去客戶為例，顯示偏袒如何延誤糾正並削弱信任。'),
    makeTransfer('社區組織的兩名創辦人對繼任者意見不同。','哪項安排最接近範文提出的專業管理對比？',['事先寫清職責和繼任程序，按程序處理分歧','讓最先大聲爭吵的人自動接任','取消所有書面記錄','把每次分歧都當成私人背叛'],0,['清晰職責與程序可減少私人爭執影響組織。','爭吵音量不是治理準則。','沒有記錄會削弱正式處理方法。','把分歧私人化正是範文指出的風險。'],[9,10,13],'原文把合約、清晰職責和正式程序與家族爭執的私人化作對比。'),
    makeTransfer('一間家族工場的兄妹爭奪控制權，招聘和投資暫停。','哪項最準確指出核心風險？',['私人領導爭執妨礙企業必要決策與增長','員工對新產品的喜好不同','所有投資本身都不安全','兄妹必然不懂生產'],0,['領導爭執直接拖慢招聘與投資，對應原文的連鎖後果。','產品喜好沒有在情境中出現。','一律停止投資沒有釐清私人爭執如何妨礙決策。','情境沒有證明任何人的技能不足。'],[11,12,14],'原文以兄弟姊妹的控制權分歧，說明招聘、投資和擴張可能停滯。'),
    makeTransfer('新公司要設計能持續成長的管理規則。','哪個方案保留範文的總結？',['以公平任用、專業技能和清晰管治為準則','所有重要決定只由親戚私下協商','一切職位按家族年資分配','不訂任何解決分歧的流程'],0,['三項準則正是原文總結的企業需要。','私人協商可讓家族關係主導商業決策。','家族年資不能替代能力。','沒有流程不利穩定管治。'],[15,16],'範文總結企業需要公平、專業和清晰管治，而家族關係主導時這些品質可能受損。'),
  ];
  lessons['cause-solution:2'].support.transfer = [
    makeTransfer('大型連鎖店的廣告每天出現在居民手機上，本地店沒有相同預算。','哪個問題最直接由情境推出？',['居民更容易熟悉並信任連鎖品牌，本地店較難被看見','本地店的產品一定較差','所有居民停止購物','連鎖店必然不僱用本地人'],0,['反覆曝光可帶來熟悉與信任，壓低本地店可見度。','廣告預算不能證明產品品質。','情境沒有顯示停止購物。','情境沒有聘用資料。'],[0,2,3],'原文由大企業推廣優勢，推到熟悉品牌獲信任、小企業被遮蓋。'),
    makeTransfer('小鎮居民改到大型網店購物，三間獨立商店的收入下降。','哪個後果最貼近範文的經濟鏈？',['商店可能裁員或結業，社區購物街也變得單調','所有商店會自動增加收入','網店必然停止推廣','居民完全不能買任何商品'],0,['收入下降可進一步導致裁員、結業與社區多樣性下降。','與收入下降相反。','沒有證據支持網店停止推廣。','仍可購物，並非完全不能買商品。'],[4,5],'原文把銷售轉移連到本地收入、職位、結業及主要購物街的活力。'),
    makeTransfer('一款飲品因名人代言而大賣，但沒有資料顯示它更健康。','這個例子最能說明甚麼？',['消費者可能被品牌形象引導，而非按實際價值選擇','名人代言必然改善營養','所有本地飲品都更便宜','廣告能證明產品成分'],0,['宣傳帶來的好印象與產品真正品質不同。','代言不能改變或證明營養。','本地飲品價格未被提及。','廣告並非成分證據。'],[6,7,8],'原文以廣告零食說明包裝、口號和代言可掩蓋真正價值。'),
    makeTransfer('區議會想讓居民更容易找到附近農戶的蔬菜。','哪個措施最直接處理可見度及購買便利？',['資助農夫市集和線上直售平台','只要求居民感到內疚','把農戶聯絡資料藏起來','減少所有市場的營業時間'],0,['市集和直售平台讓附近產品更易被找到和購買。','愧疚感不解決尋找和購買問題。','藏資料使可見度更低。','縮短營業時間降低便利性。'],[9,10,11],'原文提出市集與數碼平台，讓本地商品像大型品牌一樣容易取得。'),
    makeTransfer('超市已有本地麵包，但顧客無法辨認哪一款出自附近麵包店。','哪個改動最符合範文？',['提供清楚「本地製造」標籤及生產者簡介','把所有麵包放到無標示的箱子','只更換超市的背景音樂','不讓顧客知道麵包來源'],0,['標籤與簡介讓本地來源顯眼且有意義。','無標示更難辨認。','背景音樂不提供來源資訊。','隱藏來源直接違背目標。'],[12,13],'原文說清晰標籤和生產者資料可把普通購物連到社區支持。'),
  ];
})();
(() => {
  'use strict';
  // Keep incorrect answers relevant to the scenario and close in visual length.
  const alternatives = {
    'opinion:3': [
      ['只把同一篇本地故事讀三遍，再記錄各人物的名字','把外國故事的封面換成同一顏色，再按書名長短排序','取消故事閱讀，改為每天只查看各國書籍的目錄'],
      ['只展示中心的開放時間和每項活動的參加費用','只公布各件作品的尺寸、年份及存放的位置','把所有作品按價格排序，並請居民選出最貴一件'],
      ['要求所有成員全年使用同一種構圖，避免改變風格','按相機價格而非作品內容評選本月最佳攝影師','取消各類作品討論，只讓成員自行拍攝及交相片'],
      ['每個季度都重演同一齣本地劇，不更換節目','只更換劇院大堂燈光和海報，不調整演出內容','減少各類演出的宣傳，也取消新觀眾參與活動'],
      ['撤走所有本地作者作品，只用外國書籍填滿書架','只討論書架顏色和高度，不研究讀者及作者的需要','認為外國作品較多，就判定本地作品全無價值'],
    ],
    'discuss-both-views:4': [
      ['因為侄子與老闆有親屬關係，就把職位直接給他','讓兩名應徵者自行商量，卻不評估管理能力','按誰住得離餐廳較近決定，不檢查工作表現'],
      ['把訂貨錯誤視為私人小事，不記錄對員工的影響','只看當日貨品價格，不處理主管反覆犯錯','等顧客自行發現問題，再決定是否提醒主管'],
      ['讓最先大聲爭吵的人接任，並取消職責說明','取消所有書面記錄，要求大家口頭記住承諾','把每次管理分歧當作私人背叛，拒絕正式討論'],
      ['只調查員工對新產品的喜好，不處理爭權','把所有投資一律停下，卻不釐清決策權','認定兄妹都不懂生產，而不檢查實際能力'],
      ['所有重要決定只由親戚私下協商，拒絕透明程序','一切職位只按家族年資分配，不評估專業能力','完全不訂解決分歧的流程，等待親戚自行和解'],
    ],
    'cause-solution:2': [
      ['由廣告預算較低便推斷本地產品必然較差','因連鎖廣告頻繁就認為所有居民停止購物','只憑宣傳量判斷連鎖店一定不僱用本地人'],
      ['認定所有獨立商店會在收入下降後自動增收','猜測網店一定停止推廣，卻不看任何銷售數據','認定居民完全不能買商品，忽略網店仍在營業'],
      ['認為名人代言能直接改善飲品的營養成分','只因廣告很多便推斷本地飲品一定比較便宜','把宣傳口號當成檢驗產品成分的可靠證據'],
      ['只要求居民感到內疚，卻不說產品在哪裡賣','把農戶聯絡資料藏起來，讓顧客自行尋找','縮短所有市場營業時間，減少可到訪時段'],
      ['把所有麵包放入無標示箱子，讓顧客自己猜','只更換超市背景音樂，卻不提供產地資料','不讓顧客知道麵包來源，只公布每款重量'],
    ],
  };
  for (const [key, rows] of Object.entries(alternatives)) {
    const items = window.ESSAY_MEMORY_LESSONS[key].support.transfer;
    if (rows.length !== items.length) throw Error(`Transfer refinements missing: ${key}`);
    rows.forEach((wrong, index) => { items[index].options = [items[index].options[0], ...wrong]; });
  }
})();
(() => {
  'use strict';
  const lessons = window.ESSAY_MEMORY_LESSONS;
  lessons['discuss-both-views:4'].support.transfer.push({
    prompt:'哪項最能說明其業務風險？',
    context:'家族企業兩位親屬爭執，普通員工被要求公開支持其中一人。',
    question:'哪項最能說明其業務風險？',
    options:[
      '員工被迫選邊，個人忠誠逐漸取代業務優先事項',
      '公司設立意見箱，仍按正式程序處理各項決定',
      '員工學習產品知識，使銷售介紹變得更準確',
      '親屬把爭議留在家庭，讓員工按職責辦事',
    ],correct:0,
    explanations:[
      '要求員工選邊會使私人忠誠凌駕業務需要。',
      '正式程序有助減少爭執影響，並非題目的風險。',
      '產品知識與被迫選邊的風險無關。',
      '把爭議留在家庭反而避免員工捲入。',
    ],
    why:'要求員工選邊會使私人忠誠凌駕業務需要。',
    sourceSentenceIndices:[12,13],
    modelLink:'範文說家族爭執可迫使普通員工選邊，令個人忠誠壓過企業的工作重點。',
  });
  lessons['cause-solution:2'].support.transfer.push({
    prompt:'哪項行動最能補足範文的公共宣傳論證？',
    context:'本地商戶已有清楚標籤，但居民不知道在本地消費如何影響社區。',
    question:'哪項行動最能補足範文的公共宣傳論證？',
    options:[
      '展示本地購物如何維持職位、技能與社區身分',
      '只公布商品包裝重量，不解釋對社區的影響',
      '要求居民只看品牌標誌，不理生產者資訊',
      '集中宣傳大型企業的廣告預算和市場份額',
    ],correct:0,
    explanations:[
      '公共宣傳把購買行為連到本地職位、技能和身分。',
      '包裝重量不能說明本地消費如何幫助社區。',
      '只看品牌標誌會遮蓋生產者與社區的連結。',
      '大型企業的廣告預算不能解釋本地購買的效益。',
    ],
    why:'公共宣傳把購買行為連到本地職位、技能和身分。',
    sourceSentenceIndices:[14],
    modelLink:'範文提出公共宣傳，提醒消費者本地支出可維持職位、技能和社區身分。',
  });
  // Additional cross-topic practice keeps the original rounds and saved progress intact.
  // Each new choice transfers a specific link in the model essay's argument.
  const additions = {
    'opinion:3': [
      [
        '市議會想改善單車道，但只研究本市過去的設計。',
        '哪項做法最能運用範文的「比較基礎」推理？',
        ['比較不同城市的單車道設計，找出同一交通問題的不同解法','只收集本市單車道照片，依拍攝日期排列後公布','照搬一座海外城市的設計，不比較道路與人口差異','統計不同城市單車道顏色，卻不分析交通成效'],
        ['跨地比較同一問題的解法，才有基礎看出設計差異及其用途。','整理本市照片沒有提供另一種做法作比較。','照搬外地做法未分析兩地條件，不能算有意義的比較。','只比顏色忽略單車道如何處理交通問題。'],
        [5,6],'範文把本地畫作與外國作品並列，讓學生比較不同文化如何表達相似的人類關注。',
      ],
      [
        '社區影展想讓居民理解海外照顧者的生活。',
        '哪個安排最能轉用範文的社會理解論證？',
        ['播放海外照顧者談工作的影片，再討論與本地生活的異同','只公布本地照顧者的工時，不接觸其他地方的經歷','播放海外片段但關掉字幕，讓觀眾只猜人物的情緒','只記錄觀影人數，完全不討論片中人物的生活'],
        ['接觸並討論他人的實際經歷，能擴闊對自身環境以外生活的理解。','只有本地工時，無法接觸外地照顧者的經歷。','猜測情緒沒有可靠地理解片中人物的生活。','觀影人數不是對他人經歷的理解。'],
        [7,8],'範文指出其他社會的作品呈現不同經歷，接觸它們有助理解自己的環境以外的人。',
      ],
      [
        '本地烘焙班反覆使用同一配方，學員想做出新產品。',
        '哪項安排最貼近範文的創新機制？',
        ['研究外地烘焙技法，再用本地食材試出新的麵包做法','保留原來配方，只更換麵包包裝和產品名稱','停止交流技法，要求學員各自重做相同產品','只購買外地麵包販售，不讓學員嘗試製作'],
        ['新技法提供刺激，再與本地材料結合，才能產生新的做法。','只換名稱和包裝，未改進學員的製作方法。','重做相同產品會延續原有的重複問題。','直接轉售產品不能讓學員改進自己的技法。'],
        [11,12,13],'範文由接觸陌生技法推到改進創作方法，再以新方法處理本地題材。',
      ],
      [
        '城市創業展希望讓更多訪客認識本地初創團隊。',
        '哪項安排最能轉用範文的觀眾推理？',
        ['交替安排本地與海外團隊分享，讓新訪客也認識本地初創','只讓海外團隊登台，不給本地初創展示的機會','每場都重播同一隊本地團隊的過往介紹影片','只改展場燈光顏色，不調整分享團隊與內容'],
        ['多樣節目先吸引更廣泛訪客，再增加本地團隊被發現的機會。','沒有本地團隊展示，訪客難以發現他們。','重播同一內容未能吸引不同來源的訪客。','燈光變化不等於分享內容更多元。'],
        [14,15],'範文把本地與國際展覽交替，連到更廣泛觀眾及本地人才曝光。',
      ],
      [
        '農業展有人主張只邀本地農友，認為外地農友無助本地發展。',
        '哪個回應最能保留範文的兩條理由？',
        ['讓本地與外地農友交流，既擴闊知識也啟發本地耕作','撤走本地農友攤位，只讓外地農友介紹產品','只邀本地農友，完全不討論其他地區的經驗','只比較攤位裝飾，避開耕作方法與農民需要'],
        ['保留本地參與，同時讓外來經驗增進理解及本地實踐。','排除本地農友，與範文支持本地發展的立場不符。','拒絕外地經驗，失去比較與改進方法的機會。','比較裝飾沒有觸及知識或耕作能力。'],
        [2,3,11,17,18],'範文反對只展示本地作品，因為國際內容既擴闊理解，也能促進本地藝術成長。',
      ],
    ],
    'discuss-both-views:4': [
      [
        '青年急救隊把隊長職位留給創辦人的好友，另一人受過更多訓練。',
        '哪個決策最能轉用範文的公平原則？',
        ['按急救訓練和實際表現選隊長，再公開評核標準','因與創辦人熟識便直接委任好友，不再考核','讓兩人輪流抽籤當隊長，不檢查急救能力','按社交媒體人氣選隊長，不參考訓練紀錄'],
        ['按能力與表現任用，能避免私人關係取代職務需要。','私人熟悉程度不能證明急救領導能力。','抽籤未能判斷誰能安全履行隊長職責。','人氣不是急救能力或工作表現的證據。'],
        [3,4,5,7],'範文指出親情與能力不應混淆；任用、晉升和糾正應按工作表現。',
      ],
      [
        '維修店老闆的親屬主管多次忽略安全檢查，員工不敢提出。',
        '哪個後果最符合範文的連鎖推理？',
        ['錯誤持續不改，標準變得不一致，員工對管理失去信任','主管因是親屬便自動學會檢查，員工更放心','只要店舖更換招牌，安全檢查問題便會消失','員工不提出問題，便證明安全程序沒有漏洞'],
        ['不敢糾正親屬使標準失守，也會損害其他員工的信任。','親屬身分不能取代實際安全訓練與糾正。','更換招牌沒有改變檢查程序或管理標準。','沉默可能出於顧慮，不能證明程序安全。'],
        [5,6,7],'範文以親屬犯錯卻免於批評的例子，推到標準不一及員工信任下降。',
      ],
      [
        '合作社董事對資源分配有分歧，會議逐漸變成私人指責。',
        '哪項做法最能轉用範文的制度對比？',
        ['訂清決策權與申訴程序，按書面準則處理分歧','只請資深董事私下勸和，不記錄任何決定','讓最受歡迎的董事單獨決定所有資源分配','把不同意見視為不忠，禁止再討論分配問題'],
        ['清楚職責及程序能把業務決定與私人情緒分開。','單靠私下勸和，缺少可重複使用的處理標準。','人氣不能替代清晰授權與正式決策程序。','把分歧私人化，正會加深原文指出的風險。'],
        [9,10],'範文把合約、清晰職責及正式程序，與私人化的管理爭執作對比。',
      ],
      [
        '兩名初創創辦人爭奪控制權，招聘與設備投資因此停頓。',
        '哪個判斷最能保留範文的業務風險鏈？',
        ['私人領導爭執拖慢必要決定，令公司難以穩定成長','招聘停頓證明所有應徵者都不具備專業能力','設備投資延後證明產品一定沒有任何市場需求','創辦人爭執只影響感情，完全不會影響營運'],
        ['領導爭議直接阻礙招聘和投資，進而妨礙成長。','情境未提供應徵者能力的任何證據。','投資延後由爭權造成，不能推斷市場需求。','招聘與投資已停頓，營運顯然受到影響。'],
        [11,12,14],'範文以爭奪控制權導致招聘、投資及擴張停頓，說明私人衝突可變成商業風險。',
      ],
      [
        '社區劇團換主席，成員被要求公開支持其中一位候選人。',
        '哪項風險最符合範文對繼任期的分析？',
        ['成員忙於選邊，演出決策被私人忠誠取代而失去穩定','候選人增加，便保證劇團能更快決定下季劇目','成員公開站隊，便證明正式的交接程序已充足','只要演員照常排練，領導爭執就不可能有影響'],
        ['繼任期需要穩定；強迫選邊會讓私人忠誠壓過組織工作。','候選人數量不能保證業務決策更快。','公開站隊反映壓力，並非程序完善的證據。','排練照常進行，不能排除演出決策受影響。'],
        [12,13],'範文指出員工被迫選邊會使私人忠誠凌駕業務重點，繼任期尤其需要穩定。',
      ],
      [
        '家族餐廳目前盈利不錯，老闆因此說家族主導一定是最佳架構。',
        '哪個評估最能轉用範文的結論？',
        ['盈利以外也檢查公平任用、專業能力與清晰管治','只看本月營業額，便判定任何家族安排都最佳','只要親屬相處融洽，就毋須檢查工作決策','只看餐廳菜單種類，不比較管理準則與風險'],
        ['盈利不能單獨證明管治模式理想，還須看公平、專業與程序。','一個月的營業額不能證明長期管理沒有風險。','相處融洽不等於按能力任用或有清晰管治。','菜單種類與任用及治理標準不是同一問題。'],
        [15,16],'範文結論以公平、專業和清晰管治衡量企業架構，而非只看家族關係。',
      ],
    ],
    'cause-solution:2': [
      [
        '學校膳食招標中，大品牌廣告很多，本地農場的食材較少人認識。',
        '哪個問題最符合範文的曝光推理？',
        ['熟悉廣告的評審可能先注意大品牌，忽略本地農場','廣告較多便證明大品牌食材一定比較新鮮','本地農場不常宣傳便證明它沒有足夠產量','評審看過廣告便不可能再檢查食材的品質'],
        ['廣告提高熟悉度和可見度，可能掩蓋本地選項。','宣傳數量不能證明食材品質或新鮮程度。','較少宣傳不能推斷農場實際產量。','廣告影響注意力，不等於無法再核查品質。'],
        [0,2,3],'範文指出大型企業的宣傳使品牌反覆出現，買家容易信任熟悉名字而忽略本地生產者。',
      ],
      [
        '大型網店奪走街區修鞋店的生意，幾間小店收入持續下降。',
        '哪個後續結果最符合範文的經濟鏈？',
        ['小店可能裁員或結業，街區服務也變得較少樣','網店銷售增加，便保證修鞋店能招聘更多人','收入下降只會改變店舖招牌，不影響工作職位','街區商店減少，便證明所有居民都不再購物'],
        ['銷售轉移可令小店裁員、結業，並削弱街區多樣性。','網店增長不會自動改善小店的收入。','收入受損可影響職位與商店存續。','商店減少不等於居民完全停止購物。'],
        [4,5],'範文由小商店收入下降，推到裁員、結業及街道活力流失。',
      ],
      [
        '護膚品因明星代言熱賣，但沒有證據顯示成分優於本地產品。',
        '哪項判斷最能轉用範文的「形象與價值」區分？',
        ['受歡迎可能源於廣告形象，仍要比較實際成分與效果','明星願意代言，便證明產品成分一定更健康','本地產品較少廣告，便證明它的成分必定較差','產品賣得多，便毋須再檢查實際成分與效果'],
        ['宣傳帶來的好印象不能代替對產品實際價值的判斷。','代言不是成分或功效的可靠證據。','廣告量不能證明本地產品品質較差。','銷量也不能單獨證明實際價值。'],
        [6,7,8],'範文以包裝、口號和代言說明品牌形象可掩蓋實際價值，使本地選擇被忽略。',
      ],
      [
        '居民願意買附近農戶的菜，但市場遠、購買時間又不方便。',
        '哪個措施最能轉用範文的便利性推理？',
        ['設鄰近取貨點及網上下單，讓購買本地菜更方便','只宣傳本地菜的道德價值，不改善取貨方式','把所有農戶攤位移得更遠，要求居民自行尋找','只更換市場海報，維持相同取貨地點與時間'],
        ['更容易找到和買到本地菜，才能把購買變成日常習慣。','道德勸說沒有減少距離與時間障礙。','移遠攤位會讓本地產品更難購買。','海報改變未處理實際購買便利。'],
        [9,10,11],'範文以市集及數碼平台增加取得本地產品的便利，讓購買本地成為習慣。',
      ],
      [
        '超市有本地蜂蜜，但貨架偏僻，罐上也沒有產地說明。',
        '哪項調整最符合範文對零售商的建議？',
        ['給本地蜂蜜公平貨架位置，並清楚標示生產者','只放大蜂蜜瓶上的價格字樣，不寫任何產地','把本地蜂蜜移到倉庫，讓顧客自行詢問店員','只更換貨架顏色，不調整位置或產地資訊'],
        ['合理位置加清楚標籤，能讓本地產品被看見並被理解。','價格字樣不能讓顧客辨認蜂蜜來源。','移到倉庫會降低產品的可見度。','貨架顏色未處理位置與來源資訊。'],
        [12,13],'範文提出清楚標籤和公平貨架位置，使普通購物與本地生產者產生連結。',
      ],
      [
        '一個社區想推廣本地商品，但居民既不易找到貨品，也不明白購買的效益。',
        '哪組行動最完整地運用範文的解決鏈？',
        ['增設購買渠道、清楚標示來源，並說明本地消費如何支持工作','只發放支持本地的口號，不處理購買渠道與產地標示','只增加廣告曝光，卻不讓居民知道在哪裡購買貨品','只說本地商品很重要，仍把產品藏在不顯眼的貨架'],
        ['同時改善可取得性、辨識度及社區效益的理解，才把方案連成一條鏈。','只有口號，缺少實際取得和辨識產品的方式。','知道商品存在仍不足以方便購買或理解效益。','重要性宣稱不能彌補貨架可見度不足。'],
        [9,12,14],'範文把更易找到本地產品、清楚標示來源及解釋社區效益連成可行方案。',
      ],
    ],
  };
  for (const [key, rows] of Object.entries(additions)) {
    const items=lessons[key].support.transfer;
    for (const [context,question,options,explanations,sourceSentenceIndices,modelLink] of rows) {
      items.push({prompt:question,context,question,options,correct:0,explanations,
        why:explanations[0],sourceSentenceIndices,modelLink});
    }
  }
})();
