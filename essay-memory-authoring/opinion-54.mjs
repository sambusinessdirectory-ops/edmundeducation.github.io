const simple=[
  'Government money is never unlimited, so leaders must think carefully about which needs should come first.',
  'Some people say the government should spend less on art so it can spend more on education.',
  'I strongly disagree because art is an important part of learning and also helps culture and jobs outside school.',
  'First, spending less on art would make education weaker instead of better.',
  'Education is more than books, tests, and school subjects; it should also help students think of new ideas, feel sure of themselves, understand feelings, and ask good questions.',
  'Music, acting, design, and drawing help students share ideas, solve problems in new ways, and understand what other people go through.',
  'For example, acting in a school play may help one student speak with more confidence, while painting may help another learn to wait, look carefully, and understand what they see.',
  'If the government spends less on art, schools may see these subjects as things they can do without, and students will get a more limited education.',
  'Another point is that art helps people outside school too.',
  'Museums, places to see art, concerts, public shows, and cultural festivals help people remember what makes their country special and bring neighbours together.',
  'They also help people find work in travel, media, shows, design, and other jobs involving new ideas.',
  'In many cities, places to see art are more than nice things to look at; they are part of local work and everyday public life.',
  'If art groups lose money, talented people may leave, places to see art may close, and society may get better test results but lose some of its new ideas.',
  'Schools need more money, but it should come from spending that does not help people or plans that work badly, not from art, which helps society remember and understand itself.',
  'In short, I strongly disagree that governments should spend less on art to pay for education.',
  'A better plan is to spend money on both, because good education needs new ideas and a healthy society needs culture.',
];
const vocabulary=[
  [['Public money','Government money','公共資金'],['limited','never unlimited','有限'],['decide carefully','think carefully','審慎決定'],['deserve priority','should come first','應優先']],
  [['argue','say','主張'],['funding for the arts','spend less on art','藝術資助'],['be reduced','spend less','削減'],['spent on education','spend more on education','用於教育']],
  [['completely disagree','strongly disagree','完全不同意'],['essential part of education','important part of learning','教育必要部分'],['wider cultural and economic benefits','helps culture and jobs outside school','文化和經濟效益']],
  [['cutting arts funding','spending less on art','削減藝術資助'],['weaken education','make education weaker','削弱教育'],['rather than improve it','instead of better','而非改善']],
  [['not only about textbooks, examinations, and academic subjects','more than books, tests, and school subjects','不只有課本考試'],['develop creativity','think of new ideas','培養創造力'],['confidence','feel sure of themselves','自信'],['emotional intelligence','understand feelings','情緒智力'],['critical thinking','ask good questions','批判思考']],
  [['music','Music','音樂'],['drama','acting','戲劇'],['visual arts','drawing','視覺藝術'],['express ideas','share ideas','表達想法'],['original ways','new ways','原創方法'],['human experience','what other people go through','人的經驗']],
  [['takes part in school theatre','acting in a school play','參與學校戲劇'],['public speaking','speak','公開演說'],['more confident','more confidence','更自信'],['studies painting','painting','學習繪畫'],['patience','wait','耐性'],['observation','look carefully','觀察力'],['interpretation','understand what they see','詮釋能力']],
  [['reduces support for the arts','spends less on art','減少藝術支持'],['luxuries','things they can do without','奢侈品'],['narrower and poorer form of education','more limited education','較狹窄貧乏教育']],
  [['Another important point','Another point','另一重要觀點'],['the arts','art','藝術'],['beyond the classroom','outside school too','課室之外']],
  [['galleries','places to see art','畫廊'],['public performances','public shows','公眾表演'],['preserve national identity','help people remember what makes their country special','保存國家身份'],['bring communities together','bring neighbours together','凝聚社區']],
  [['support jobs','help people find work','支撐工作'],['tourism','travel','旅遊'],['entertainment','shows','娛樂'],['creative industries','other jobs involving new ideas','創意產業']],
  [['cultural attractions','places to see art','文化景點'],['not decorative extras','more than nice things to look at','非裝飾附加品'],['local economy','local work','本地經濟'],['public life','everyday public life','公共生活']],
  [['arts organisations','art groups','藝術機構'],['lose funding','lose money','失去資助'],['leave the sector','leave','離開行業'],['cultural venues','places to see art','文化場地'],['richer in test scores but poorer in imagination','better test results but lose some of its new ideas','分數較高卻想像較弱']],
  [['more investment','more money','更多投資'],['wasteful spending','spending that does not help people','浪費性開支'],['inefficient policies','plans that work badly','低效政策'],['a field that gives society both memory and meaning','art, which helps society remember and understand itself','給社會記憶意義的範疇']],
  [['In conclusion','In short','總結'],['strongly disagree','strongly disagree','強烈不同意'],['lower the arts budget','spend less on art','削減藝術預算'],['fund education','pay for education','資助教育']],
  [['A wiser policy','A better plan','更明智政策'],['invest in both','spend money on both','兩者都投資'],['strong education','good education','強大教育'],['creativity','new ideas','創造力'],['healthy society','healthy society','健康社會']],
];
const chunkOverrides=[
  ['Public money is always limited,','so governments must decide carefully which areas deserve priority.'],
  ['Some people argue that funding for the arts should be reduced','so that more money can be spent on education.'],
  ['I completely disagree with this view','because the arts are an essential part of education','and also bring wider cultural and economic benefits.'],
  ['The first reason is that cutting arts funding','would actually weaken education rather than improve it.'],
  ['Education is not only about textbooks, examinations, and academic subjects;','it should also develop creativity, confidence, emotional intelligence, and critical thinking.'],
  ['Subjects such as music, drama, design, and visual arts allow students','to express ideas, solve problems in original ways, and understand human experience more deeply.'],
  ['For example, a student who takes part in school theatre may become more confident in public speaking,','while a student who studies painting may learn patience, observation, and interpretation.'],
  ['If the government reduces support for the arts,','schools may treat these subjects as luxuries,','and students will receive a narrower and poorer form of education.'],
  ['Another important point is that the arts','create value beyond the classroom.'],
  ['Museums, galleries, concerts, public performances, and cultural festivals','help preserve national identity and bring communities together.'],
  ['They also support jobs in tourism, media, entertainment, design,','and the creative industries.'],
  ['In many cities, cultural attractions are not decorative extras;','they are part of the local economy and public life.'],
  ['If arts organisations lose funding, talented people may leave the sector,','cultural venues may close, and society may become richer in test scores but poorer in imagination.'],
  ['Education needs more investment,','but that money should come from wasteful spending or inefficient policies,','not from a field that gives society both memory and meaning.'],
  ['In conclusion, I strongly disagree','that governments should lower the arts budget to fund education.'],
  ['A wiser policy is to invest in both,','because strong education needs creativity, and a healthy society needs culture.'],
];
const simpleChunkOverrides=[
  ['Government money is never unlimited,','so leaders must think carefully about which needs should come first.'],
  ['Some people say the government should spend less on art','so it can spend more on education.'],
  ['I strongly disagree','because art is an important part of learning','and also helps culture and jobs outside school.'],
  ['First, spending less on art','would make education weaker instead of better.'],
  ['Education is more than books, tests, and school subjects;','it should also help students think of new ideas, feel sure of themselves, understand feelings, and ask good questions.'],
  ['Music, acting, design, and drawing help students','share ideas, solve problems in new ways, and understand what other people go through.'],
  ['For example, acting in a school play may help one student speak with more confidence,','while painting may help another learn to wait, look carefully, and understand what they see.'],
  ['If the government spends less on art,','schools may see these subjects as things they can do without,','and students will get a more limited education.'],
  ['Another point is that art','helps people outside school too.'],
  ['Museums, places to see art, concerts, public shows, and cultural festivals','help people remember what makes their country special and bring neighbours together.'],
  ['They also help people find work in travel, media, shows, design,','and other jobs involving new ideas.'],
  ['In many cities, places to see art are more than nice things to look at;','they are part of local work and everyday public life.'],
  ['If art groups lose money, talented people may leave,','places to see art may close, and society may get better test results but lose some of its new ideas.'],
  ['Schools need more money,','but it should come from spending that does not help people or plans that work badly,','not from art, which helps society remember and understand itself.'],
  ['In short, I strongly disagree','that governments should spend less on art to pay for education.'],
  ['A better plan is to spend money on both,','because good education needs new ideas and a healthy society needs culture.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('School places are limited, so leaders must decide carefully which pupils need extra support.','so 將資源有限接到審慎選擇；which areas 指要比較的對象。','這只是決策背景，尚未證明某項支出應被削減。',[1,3,13],F('[公共資源] is limited, so [決策者] must decide carefully which [對象] deserve priority','先承認資源有限，需要作有理據的優先次序判斷。','引言要交代資源限制，為後面的分配爭論建立背景時。',[['Public money','slot','公共資源'],[' is always limited, so ','link','有限，因此'],['governments','slot','決策者'],[' must decide carefully which ','link','須審慎判斷'],['areas','slot','對象'],[' deserve priority.','link','應優先']])),
  S('Some people argue that sports funding should be reduced so that more money can be spent on science lessons.','so that 指削甲款的目的為增乙款，清楚重述題目方案。','轉述他人主張不等於作者同意。',[0,2,14],F('Some people argue that [甲資助] should be reduced so that [乙支出] can increase','公平交代對方的資金轉移方案。','要轉述一方以削減甲來增加乙的政策主張時。',[['Some people argue that ','link','引入他人主張'],['funding for the arts','slot','甲資助'],[' should be reduced so that ','link','應削減以便'],['more money can be spent on education.','slot','乙支出']])),
  S('I disagree because sports help pupils learn and also improve health across the community.','because 後分別預告校內及校外兩種理由。','不是反對教育投資，而是反對從有價值的甲用途挪款。',[1,3,8],F('I disagree because [甲] is part of [目標乙] and also brings [更廣效益]','表明反對，並預告直接與間接兩條理由。','反對一項轉移方案時，要指出被削減項目也支持原目標並有額外效益時。',[['I completely disagree with this view because ','link','表明反對及理由'],['the arts','slot','甲'],[' are an essential part of ','link','是不可缺少部分'],['education','slot','目標乙'],[' and also bring ','link','亦帶來'],['wider cultural and economic benefits.','slot','更廣效益']])),
  S('The first reason is that cutting library funding would weaken learning rather than improve it.','rather than 對比政策意圖和可能反效果。','此句提出主要論點，後面仍需解釋因果機制。',[1,2,4],F('The first reason is that cutting [甲資助] would weaken [乙目標] rather than improve it','指出削減甲可能反而破壞想改善的乙。','開始首段時，要揭示一項資金轉移可能適得其反時。',[['The first reason is that cutting ','link','首項理由：削減'],['arts funding','slot','甲資助'],[' would actually weaken ','link','反會削弱'],['education','slot','乙目標'],[' rather than improve it.','link','而非改善']])),
  S('Good health is not only about medicine; it also depends on safe homes, food, and exercise.','not only...; it should also... 擴大概念，再列被忽略的能力。','沒有否認課本考試，只說教育範圍更廣。',[3,5,8],F('[核心目標] is not only about [傳統內容]; it should also develop [其他能力]','重新界定題目想改善的目標，顯示甲與乙其實相連。','要反對把複雜目標縮成單一類內容時，列出其他必要面向。',[['Education','slot','核心目標'],[' is not only about ','link','不只關乎'],['textbooks, examinations, and academic subjects','slot','傳統內容'],['; it should also develop ','link','還應培養'],['creativity, confidence, emotional intelligence, and critical thinking.','slot','其他能力']])),
  S('Activities such as team sports and music help children cooperate, solve problems, and express feelings.','such as 列具體科目；allow students to 後列三種可觀察能力。','不是說每名學生上課一次便必然掌握全部能力。',[4,6,7],F('Subjects such as [具體科目] allow [學習者] to [多項可觀察能力]','把廣義教育目標連到具體學習活動。','提出多種重要能力後，要展示哪些課程能培養它們時。',[['Subjects such as ','link','列舉課程'],['music, drama, design, and visual arts','slot','具體科目'],[' allow ','link','讓'],['students','slot','學習者'],[' to ','link','能'],['express ideas, solve problems in original ways, and understand human experience more deeply.','slot','多項可觀察能力']])),
  S('For example, a pupil who joins a debate may speak more confidently, while another who builds models may learn patience.','while 並列兩個不同學生的不同收益，例子支持多能力主張。','may 保留可能性，沒有說所有學生必然相同進步。',[4,5,7],F('For example, [參與甲的學生] may [能力甲], while [參與乙的學生] may [能力乙]','用兩個對照人物具體化課程的不同教育作用。','列出課程多項效益後，要用平行例子展示不同學習途徑時。',[['For example, ','link','引出例子'],['a student who takes part in school theatre','slot','參與甲的學生'],[' may ','link','可能'],['become more confident in public speaking','slot','能力甲'],[', while ','link','同時'],['a student who studies painting','slot','參與乙的學生'],[' may ','link','可能'],['learn patience, observation, and interpretation.','slot','能力乙']])),
  S('If a school cuts practical science, teachers may call it optional, and pupils may receive a narrower education.','If 設削支條件；may...and... 追蹤學校觀念到學生教育的兩步後果。','這是可能後果，並非每間學校都必然如此。',[3,5,6],F('If [決策者削減甲], [機構] may treat it as [奢侈項目], and [使用者] will receive [較差結果]','說明削減如何改變課程地位並最終影響學習者。','要追蹤一項削減如何經機構決策傳到最終使用者時。',[['If ','link','設定削減條件'],['the government reduces support for the arts','slot','決策者削減甲'],[', ','link','則'],['schools','slot','機構'],[' may treat these subjects as ','link','可能視它們為'],['luxuries','slot','奢侈項目'],[', and ','link','結果'],['students','slot','使用者'],[' will receive ','link','會得到'],['a narrower and poorer form of education.','slot','較差結果']])),
  S('Another important point is that public libraries create value beyond school lessons.','Another important point 引第二條理由；beyond... 擴大受益範圍。','與首段校內教育作用不同，第二段談較廣社會效益。',[2,4,9],F('Another important point is that [某活動] creates value beyond [先前範圍]','由直接受益轉入另一個更廣的層面。','完成一個範圍的效益後，要指出同一活動在範圍外仍有作用時。',[['Another important point is that ','link','引出另一面向'],['the arts','slot','某活動'],[' create value beyond ','link','在...以外仍有價值'],['the classroom.','slot','先前範圍']])),
  S('Libraries, clubs, festivals, and public talks help preserve local memory and bring neighbours together.','多個具體場所及活動支撐「保存身份」與「凝聚社區」兩項效果。','例子列類型，不表示每項活動效益完全一樣。',[8,10,11],F('[多種場所和活動] help preserve [共同身份] and bring [人們] together','把抽象文化與社會作用落在可見公共活動上。','提出更廣效益後，要列出具體活動及其兩種公共作用時。',[['Museums, galleries, concerts, public performances, and cultural festivals','slot','多種場所和活動'],[' help preserve ','link','有助保存'],['national identity','slot','共同身份'],[' and bring ','link','並讓'],['communities','slot','人們'],[' together.','link','凝聚']])),
  S('They also support work in transport, local shops, teaching, and tourism.','They 回指前句活動；also 補上經濟途徑，沒有重複文化作用。','工作機會是另一類效益，不是說所有活動都直接僱用每個行業。',[8,9,12],F('They also support jobs in [多個相關行業]','由文化與社區作用補充就業效益。','已列一類公共效益，還要指出相關產業或工作機會時。',[['They','slot','前句活動'],[' also support jobs in ','link','亦支撐工作'],['tourism, media, entertainment, design, and the creative industries.','slot','多個相關行業']])),
  S('In many towns, public parks are not decorative extras; they support local life and business.','not decorative extras; they are... 糾正外觀標籤，指出實際公共與經濟作用。','不是說每個景點收入都相同，重點是不能只按裝飾看待。',[8,10,13],F('In many [地方], [公共設施] are not [裝飾品]; they are part of [經濟和公共生活]','概括前述文化、就業及社區效益。','已列出多種實際作用後，要糾正一項設施只是裝飾的印象時。',[['In many cities, ','link','限定地方'],['cultural attractions','slot','公共設施'],[' are not ','link','並非'],['decorative extras','slot','裝飾品'],['; they are part of ','link','而是'],['the local economy and public life.','slot','經濟和公共生活']])),
  S('If local libraries lose funding, staff may leave, branches may close, and a town may gain offices but lose knowledge.','If 設削資源條件；三項 may 組成逐步損失；but 最後對照表面收益與深層缺失。','不是說所有場館必然關閉；作者指出風險。',[9,11,13],F('If [機構失去資助], [人才] may leave, [場所] may close, and [社會] may gain [表面成果] but lose [深層價值]','把削減對人才、場地和社會品質的後果連成一條鏈。','要說明一項削減的多步風險，並以表面收益對照深層損失時。',[['If ','link','設定條件'],['arts organisations lose funding','slot','機構失去資助'],[', ','link','則'],['talented people','slot','人才'],[' may leave the sector, ','link','可能離開'],['cultural venues','slot','場所'],[' may close, and ','link','可能關閉，且'],['society','slot','社會'],[' may become richer in ','link','表面更富'],['test scores','slot','表面成果'],[' but poorer in ','link','卻更缺乏'],['imagination.','slot','深層價值']])),
  S('Schools need more funding, but it should come from wasteful projects, not from public libraries that support learning.','but...not from... 承認乙需要款項，反對從也有公共價值的甲挪用。','作者不是反對教育增資，而是建議檢討浪費來源。',[1,2,12],F('[目標乙] needs more investment, but that money should come from [浪費來源], not from [有價值的甲]','承認另一需要，同時提出較合理的資金來源。','要同意某目標需要更多資金，但反對從另一有價值領域削減時。',[['Education','slot','目標乙'],[' needs more investment, but that money should come from ','link','需要增資，但應來自'],['wasteful spending or inefficient policies','slot','浪費來源'],[', not from ','link','而非'],['a field that gives society both memory and meaning.','slot','有價值的甲']])),
  S('In conclusion, I strongly disagree that councils should cut sports budgets to pay for schools.','In conclusion 重答題目；lower...to fund... 指明反對的資金轉移方向。','不能把作者立場誤寫成反對教育支出本身。',[1,8,15],F('In conclusion, I strongly disagree that [決策者] should lower [甲預算] to fund [乙]','結尾直接重申對題目具體政策的判斷。','完成兩條理由後，要準確重申反對的是哪項資金轉移時。',[['In conclusion, I strongly disagree that ','link','重申反對'],['governments','slot','決策者'],[' should lower ','link','應削減'],['the arts budget','slot','甲預算'],[' to fund ','link','以資助'],['education.','slot','乙']])),
  S('A wiser policy is to support both libraries and schools, because learning needs books and communities need shared places.','because 後兩個平行分句說明兩類需求都值得投入。','這是一項替代方向，不是要求兩者預算永遠平均。',[2,13,14],F('A wiser policy is to invest in both, because [乙需要甲的作用], and [社會需要甲的另一作用]','用兼顧兩者的政策原則收束全文。','反對二選一方案後，要提出兼顧原則並各給一個理由時。',[['A wiser policy is to invest in both, because ','link','提出兩者兼顧及理由'],['strong education needs creativity','slot','乙需要甲的作用'],[', and ','link','且'],['a healthy society needs culture.','slot','社會需要甲的另一作用']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意削減藝術預算，將款項轉投教育？',['完全不同意；藝術本身屬教育，亦有文化和經濟效益','完全同意；藝術只屬裝飾','沒有立場，只談預算有限','反對教育增加任何支出'],'completely disagree；arts are an essential part of education。'),
  {type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['削藝術資助會削弱學生創造力、表達和其他教育能力','藝術在課室外保存文化、凝聚社區並支撐就業','所有藝術項目必然比醫療更迫切','學校不需要課本或考試'],correct:[0,1],why:'首段談藝術與教育相連；次段談課室外的文化與經濟價值。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對削藝術增教育','承認資金有限，但藝術與教育相連並有更廣效益。'],
  ['主體段一 · 藝術是教育的一部分','教育不只考試；戲劇與繪畫例子顯示多種能力。'],
  ['主體段二 · 課室外的公共價值','文化活動保存身份、凝聚社區、支撐工作；削資源有多步風險。'],
  ['結論 · 兩者都應投資','教育增資應來自浪費或低效政策，不應削去有價值的藝術。'],
],'預算爭議 → 藝術支持教育 → 文化經濟作用 → 以其他來源增資並兼顧。')];
const evidence=[
  Q('作者認為教育除了課本、考試與學術科目，還應培養甚麼？',['創造力、自信、情緒智力與批判思考','只培養記住答案的速度','只看考試排名','完全不用學任何學科'],'not only...; it should also develop...。'),
  Q('戲劇與繪畫的學生例子各展示甚麼？',['戲劇可幫公開演說自信；繪畫可練耐性、觀察和詮釋','兩者只可增加考試分數','所有學生必然變成藝術家','戲劇與繪畫不能培養能力'],'while 並列兩個不同學習途徑。'),
  Q('削減藝術資助可能如何影響學校？',['學校或把相關科目視為奢侈品，學生教育變得更狹窄','必然令每名學生更有創造力','令藝術科目自動免費擴張','只影響博物館，不影響學校'],'If...may...and... 指逐步風險。'),
  Q('藝術在課室外有哪些作用？',['保存文化身份、凝聚社區，並支撐旅遊等工作','只能供私人裝飾','完全不影響地方經濟','必然取代所有其他公共服務'],'兩個文化社區作用及一個就業作用。'),
  Q('藝術機構失去資助時，作者提出哪條風險鏈？',['人才離開、文化場地關閉，社會想像力可能變弱','所有藝術家必然即時致富','文化場地必然越開越多','考試分數永遠等於全部社會品質'],'may...may...may 保留可能性。'),
  Q('作者認為教育所需的更多資金應從哪裏來？',['浪費性開支或低效率政策','必然從藝術預算削減','必然取消所有文化場地','只靠學生繳更高學費'],'education needs more investment；not from a field...。'),
];
const logic=[
  sequence('第一主體段：為何削藝術可能反而削弱教育？',[
    ['主張','削藝術資助會削弱教育，而非改善教育。'],
    ['重新界定教育','教育除課本和考試，還包括創造力及情緒等能力。'],
    ['具體課程','音樂、戲劇、設計與視覺藝術讓學生表達與解難。'],
    ['學生例子','戲劇練公開演說；繪畫練耐性與觀察。'],
    ['削資源後果','學校或視藝術為奢侈，教育因此變狹窄。'],
  ],'藝術課程 → 多方面能力 → 學生例子 → 削資助反效果。'),
  sequence('第二主體段：藝術為何也值得課室外資助？',[
    ['主張','藝術在課室外創造價值。'],
    ['文化與社區','博物館、表演與節日保存身份並凝聚社區。'],
    ['經濟','旅遊、媒體、娛樂及設計等工作受惠。'],
    ['削資源風險','人才或離開，場地或關閉，想像力可能削弱。'],
    ['資金替代','教育增資應檢討浪費或低效政策，而非犧牲藝術。'],
  ],'公共活動 → 文化社區效益 → 就業 → 削減風險 → 更合適資金來源。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('某校要削掉戲劇課，聲稱可把全部資金用於考試科目。','哪項回應最符合文章？',['先檢查戲劇是否培養表達、自信和理解；削掉它或使教育更狹窄','只要戲劇不是考試科目便沒有教育價值','任何考試科目都沒有用','所有學生上戲劇必然成為演員'],['藝術課程本身可支持多種學習能力。','忽略廣義教育。','原文沒有否認學科。','may 非保證。'],[3,4,5,6,7],'arts...essential part of education；theatre...public speaking。'),
  T('城市計劃關閉文化節，把資金全給學校；文化節平日讓居民交流，也帶來遊客。','哪種比較較完整？',['同時檢查學校需要與文化節的社區、文化及就業作用','只看文化節門票顏色','只問哪一方較有名','假設文化節必然沒有經濟作用'],['文章提出課室外多重價值。','無關實際效益。','名氣非標準。','忽略旅遊工作。'],[8,9,10,11,13],'preserve national identity；bring communities together；support jobs。'),
  T('一名學生參加校內繪畫後，學會慢慢觀察並解釋作品。','這例子支持哪條主張？',['藝術科目可培養課本考試以外的能力','繪畫只使人記住標準答案','藝術絕不屬教育','所有學生畫畫後都必然考滿分'],['原文繪畫例子指耐性、觀察和詮釋。','不是例子的作用。','與作者相反。','沒有保證。'],[4,5,6],'painting...patience, observation, and interpretation。'),
  T('政府說「教育很重要，所以藝術必須減資」。','哪項推論指出它的漏洞？',['藝術亦支撐教育與其他公共效益，教育增資可先檢討浪費項目','教育重要必然意味藝術無價值','藝術完全不能讓學生學習','政府不應增加教育資金'],['兩者有交集，且有其他資金來源。','錯誤二選一。','與首段相反。','作者支持教育增資。'],[2,3,4,13,15],'arts...essential part of education；wasteful spending。'),
  T('某地博物館長期向學生和居民開放，卻被稱作「純裝飾」。','哪項證據最能回應？',['列出它如何保存地方記憶、促進公共生活及支持相關工作','只說建築外觀漂亮','假設所有博物館收入相同','只問是否有紀念品店'],['not decorative extras 需由具體作用支持。','反而重裝飾。','非原文主張。','不足以判斷。'],[8,9,10,11],'not decorative extras；local economy and public life。'),
  T('某政策減少藝術科資助，學校因此不再開音樂和設計。','哪種逐步後果與文章一致？',['削資助可能令學校視科目為可有可無，學生選擇與能力培養變窄','科目消失必然令學生更有創意','削資助永遠不影響校內課程','藝術只影響課外娛樂'],['If...schools may treat...students will receive...。','與作者相反。','與情境相反。','原文列課程能力。'],[3,5,7],'schools may treat these subjects as luxuries。'),
  T('城市以「景點只是裝飾」為由停辦免費演出，附近餐飲和旅遊也受影響。','哪條論證最適合？',['文化活動可能是地方經濟和公共生活的一部分','文化活動永遠只具外觀作用','餐飲旅遊與任何文化活動必然無關','只要收入短期下降便否定所有演出'],['原文把文化與經濟途徑相連。','與例證相反。','情境已顯示關聯。','不能絕對化。'],[9,10,11,12],'local economy and public life。'),
  T('教育預算確實不足，但另一部門仍有多年未用的浪費項目。','本文會建議怎樣處理？',['檢討浪費和低效政策，支持教育且避免削弱有價值的其他領域','完全不增加教育資金','必然削光藝術預算','只維持浪費項目，不作評估'],['作者承認教育需增資，提供替代來源。','與原文相反。','原文反對。','與審慎分配相反。'],[0,13,15],'Education needs more investment...wasteful spending。'),
  T('一項削資政策短期讓考試準備更集中，卻使學生失去表達和創意課程。','哪項評價最接近本文？',['不能只看考試分數，也要看教育是否變得更狹窄、缺少想像力','考試分數是唯一教育標準','創意與表達永遠不影響學習','任何考試準備都應取消'],['首段及次段都指出狹窄教育的代價。','忽略廣義教育。','與原文相反。','文章沒有此主張。'],[4,7,12],'narrower...education；poorer in imagination。'),
  T('某人說：「只要兩個目標都重要，便必須永遠平均分配預算。」','文章真正支持甚麼？',['兩者都值得投資，但具體金額仍應按需要與效益審慎決定','兩者必須永遠各佔一半','只可投資藝術','只可投資學校'],['invest in both 是兼顧，不是機械平分；開篇亦要求審慎判斷。','原文沒有固定比例。','與兼顧相反。','與兼顧相反。'],[0,13,15],'decide carefully；invest in both。'),
  T('要概括首段與次段的關係。','哪項最準確？',['藝術既是教育的一部分，也在課室外保存文化、凝聚社區和支撐工作','兩段都只談考試分數','次段完全否定首段','兩段都說藝術只有裝飾作用'],['兩段提供不同且互補的理由。','忽略文化經濟。','不是否定。','與原文相反。'],[2,3,4,5,8,9,10,11],'essential part of education；beyond the classroom。'),
  T('要用一句話概括全文。','哪項最準確？',['作者反對削藝術增教育：藝術亦培養學生並惠及文化經濟，教育增資應優先檢討浪費','作者反對教育獲得任何資金','作者認為藝術只供娛樂','作者要求所有部門永遠平均分錢'],['包含立場、兩條理由與替代來源。','作者說教育需更多投資。','與集體文化價值相反。','沒有平均規則。'],[1,2,3,4,8,9,10,13,14,15],'arts...education；wider cultural and economic benefits；wasteful spending。'),
];
export default {
  key:'opinion:54',
  meta:{topic:'削減藝術預算以增加教育資金的取捨',summary:'作者完全反對削減藝術預算來資助教育。藝術科本身培養表達、創意、自信與批判思考，削減會令教育更狹窄；藝術在課室外亦保存文化、凝聚社區及支撐工作。教育確需更多投資，但應先檢討浪費及低效政策，兼顧藝術與教育。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
