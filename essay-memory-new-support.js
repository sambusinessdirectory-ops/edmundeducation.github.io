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
        'Museums and galleries influence how people understand art, history and their culture.',
        'Some people say these places should show only local artists, not art from abroad.',
        'The writer strongly disagrees with that idea',
        'because art from other countries widens public understanding and helps local art grow over time.',
        'Art from other countries makes museums better places to learn.',
        'If visitors see only local art, they cannot compare it with other traditions, so their understanding becomes limited.',
        'When students see local paintings next to Japanese prints or African sculptures, they can see how cultures use colour, symbols and shape to show similar human feelings and ideas.',
        'Seeing art from other countries also helps people understand society better.',
        'Art from other societies often shows war, people moving, religion or unfairness, so it helps viewers understand lives different from their own.',
        'Therefore, leaving out foreign art would make museums less valuable for learning and culture.',
        'Showing international art also helps local artists and the organisations that support them.',
        'Artists improve when they meet new techniques and ideas about art.',
        'Only showing local art can make creative work repetitive; art from elsewhere helps artists improve their methods and make more original work.',
        'For example, a young artist may study European modern art and then show local subjects in new ways.',
        'Different exhibitions bring in more kinds of visitors and keep galleries lively.',
        'When galleries take turns showing local and foreign art, more students, reviewers and returning visitors may also find local artists.',
        'To conclude, museums and galleries should not show only local artists.',
        'The writer strongly disagrees with this idea',
        'because international art helps the public understand more and gives local artists better conditions to grow.',
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
        'In many countries, families own small and medium businesses, and people often see this as a good base for success.',
        'I do not agree.',
        'I think a business mainly run through family relationships is not the best way, because it can weaken good work decisions and turn personal arguments into business risks.',
        'The first problem is that family businesses can confuse love for relatives with ability.',
        'A good company chooses, promotes and corrects workers based on how well they do their jobs.',
        'If relatives get high positions because they are family, weak managers may be protected. Skilled workers outside the family feel unappreciated, rules become uneven and hard decisions are put off.',
        'For example, managers may avoid questioning an owner’s son who keeps losing clients because the family might take it as an insult.',
        'After a while, this unfair preference damages trust at work and weakens the company.',
        'Another problem is that family arguments can affect the business.',
        'A company run by professional managers can use contracts, clear roles and formal steps to settle disagreements.',
        'But in a family company, arguments about who will inherit or lead it, or about money, can become very personal.',
        'For example, a fight between brothers or sisters about control can stop hiring, investment and growth.',
        'Other workers may feel they must choose a side, so personal loyalty comes before business needs.',
        'This is especially harmful when leadership changes and the company needs stability.',
        'A company cannot grow well while family conflict keeps pulling it in different directions.',
        'Overall, I think family businesses are more likely to cause problems than to be the best business model.',
        'Businesses need fairness, skill and clear rules, but strong family control often weakens these qualities.',
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
        'Large companies often spend a lot on ads and online promotion, so people notice their products more than goods made locally.',
        'This can hurt local businesses and reduce choice, but action can make local goods easier to buy.',
        'The first problem is that small companies become hard to notice.',
        'When buyers keep seeing the same brands on TV, online and in shops, they may trust them without thinking, even if a local product is just as good.',
        'When more sales go to big companies, local shops and makers earn less, cut jobs and may close.',
        'Then money leaves the community, and shopping streets become less varied and lively.',
        'A second problem is that people may choose products for their image, not their real quality.',
        'For example, a snack may seem better simply because people see its package, slogan and famous supporter everywhere.',
        'So people may pay more for a known brand and miss fresher or healthier local goods.',
        'To help people buy local goods, governments should first help them become easier to notice.',
        'They can support markets, sections for local goods in shops, and websites where nearby makers sell to residents.',
        'If families can find local food and handmade goods as easily as big brands, buying local becomes easy and normal.',
        'Shops can also use clear labels and give local goods a fair place on shelves.',
        'A local label and short information about the maker can help a normal purchase support the community.',
        'Public messages can remind people that buying local supports jobs, skills and the area’s identity.',
        'In conclusion, large companies’ marketing can hurt local firms and make people buy mainly by brand.',
        'But if local goods are easy to see and buy and matter to people, communities can bring demand back to local makers.',
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
      options:['Mia put on a coat because the air was cold.','The glass broke yesterday because it will fall tomorrow.','The room is empty because the wall is blue.','The road was wet because it was not dry.'],
      explanations:['寒冷解釋了穿外套的決定。','未來的事不能導致昨天的結果。','牆壁顏色不能解釋為何房間空無一人。','後半句只是換句話說明濕，沒有原因。'],
    },
    if: {
      frame:'If [條件], [可能出現的結果]', meaning:'前半句提出條件，後半句說明在該條件下的結果。', usage:'解釋某做法或情況出現時會怎樣。',
      parts:[['If ','link'],['[條件]','slot'],[', ','link'],['[可能出現的結果]','slot']],
      options:['If the train is late, we will take the bus.','If the train is late, it was on time yesterday.','If the train is late, the train is late.','If the train is late, the moon has mountains.'],
      explanations:['火車遲到是改乘巴士的條件。','昨天準時並非這條件造成的結果。','後半句只重述條件。','後半句與條件沒有相關因果關係。'],
    },
    when: {
      frame:'When [情況發生], [相關結果或行動]', meaning:'指定情況發生時，接着出現相關行動或結果。', usage:'把具體情境與其後果連起來。',
      parts:[['When ','link'],['[情況發生]','slot'],[', ','link'],['[相關結果或行動]','slot']],
      options:['When the bell rang, the class went inside.','When the bell rang, the bell made a sound.','When the bell rang today, yesterday was Monday.','When the bell rang, the apples were red.'],
      explanations:['鈴聲響起與入課室的行動直接相關。','只重述鈴聲，沒有另一個結果。','昨天的日期不是今天鈴聲的後果。','蘋果顏色與鈴聲沒有相關關係。'],
    },
    so: {
      frame:'[原因或情況], so [結果]', meaning:'先給原因或情況，再說其結果。', usage:'清楚連接行為、制度或環境與後果。',
      parts:[['[原因或情況]','slot'],[', so ','link'],['[結果]','slot']],
      options:['The road was icy, so the driver slowed down.','The driver slowed down, so the road had been icy yesterday.','The road was icy, so the road was not warm.','The road was icy, so my blue pen ran out of ink.'],
      explanations:['結冰可合理導致司機減速。','減速不能造成昨天的結冰。','後半句只重述道路寒冷。','筆沒墨與結冰道路無關。'],
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
  const structureSources = {
    'opinion:3': [[4,'because'],[6,'if'],[7,'when'],[9,'so'],[13,'contrast'],[14,'instance'],[16,'when']],
    'discuss-both-views:4': [[3,'because'],[6,'rather'],[7,'if'],[14,'when'],[12,'instance'],[15,'if'],[17,'when']],
    'cause-solution:2': [[1,'so'],[2,'but'],[4,'when'],[8,'instance'],[9,'while'],[12,'if'],[17,'however']],
  };
  for (const [key, mappings] of Object.entries(structureSources)) {
    const essay = lessons[key];
    essay.support.structures = mappings.map(([number, type], position) => {
      const source = essay.sentences[number - 1], frame = frames[type];
      if (!source || !frame) throw Error(`Invalid structure source: ${key} ${number}`);
      return {id:`${essay.id}-frame-${String(position+1).padStart(2,'0')}`,
        frame:frame.frame,meaning:frame.meaning,usage:frame.usage,
        source:{paragraph:source.paragraph+1,sentence:source.index+1},
        parts:frame.parts.map(([text,kind])=>({text,kind})),
        context:'哪一句正確運用了上面的句型及其功能？',
        options:frame.options,correct:0,explanations:frame.explanations};
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
})();
