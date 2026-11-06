// Model Essay 4 · Opinion: exact-source teaching notes, reviewed sentence by sentence.
const simple = [
  'People often expect artists to question old rules, so artists clearly need some freedom to make new work.',
  'Because of this, some people say artists should be free to say whatever they want.',
  'This essay says that idea is wrong because art without limits can hurt society and everyone who shares ideas with the public must take responsibility for them.',
  'The first reason to reject complete freedom is that art can change what people think, not just show it.',
  'When films, songs, or art shows praise hate based on race, violence, or extreme ideas, seeing them often can make these ideas feel more normal and easier to defend.',
  'After that, people may find it easier to excuse unfair treatment and violent behaviour in everyday life.',
  'For example, people have often used art made to spread political messages to make minority groups seem less human, and wider hatred then followed.',
  'Art with no limits can also hurt people directly.',
  'Work that shames groups with less power or protection just to get attention may make them afraid, upset, and left out, especially if it spreads fast online.',
  'So there must be some limits on what artists can do.',
  'Another reason is that speaking to the public always means being responsible for what you say.',
  'Once people publish or perform a work, it is not only a private idea; it becomes something that can affect other people\'s sense of worth, safety, and good name.',
  'If artists were protected in every case, they could avoid responsibility for spreading harmful lies about people or urging others to do harm just by calling it art.',
  'A fair society must never put any group above the law.',
  'Also, being creative does not require complete freedom.',
  'Limits can push artists to use signs that stand for ideas, words that mean the opposite of what they say, and skill; this can make their criticism stronger.',
  'Many great books, films, and works that use humour to criticise can strongly question those in power without breaking basic laws or rules about right and wrong.',
  'In short, I completely disagree that artists should be free to express absolutely any idea.',
  'Artists need room to create, but when their work seriously hurts others or takes away their rights, society has a good reason to set limits.',
];

// Boundaries are editorially chosen around complete meanings, never inside a lexical bridge.
const chunkOverrides = [
  ['Artists are often expected','to challenge convention,','so some degree of creative freedom','is clearly necessary.'],
  ['Some people therefore argue','that they should have total freedom','to express any thoughts they choose.'],
  ['This essay will argue that this view is wrong','because unlimited artistic expression can damage society','and because no one who speaks to the public','should escape responsibility.'],
  ['The first reason total freedom should not be allowed','is that art can shape attitudes,','not merely reflect them.'],
  ['When films, lyrics or exhibitions','glorify racial hatred, violence or extremism,','repeated exposure can make such ideas','seem less shocking and more defensible.'],
  ['Once this happens,','discrimination and aggression become easier to excuse','in daily life.'],
  ['For example, propaganda art has often been used','to dehumanise minorities','before broader hostility followed.'],
  ['Unrestricted expression can also','harm people directly.'],
  ['Work that humiliates vulnerable groups for attention','may create fear, distress and exclusion,','especially when it spreads rapidly online.'],
  ['Artistic freedom, therefore,','cannot be unlimited.'],
  ['A second reason is that','public expression always carries public responsibility.'],
  ['Once a work is published or performed,','it is no longer a private thought;','it becomes an act that can affect',"other people's dignity, safety and reputation."],
  ['If artists received absolute protection,','they could evade accountability','for defamation or incitement','simply by calling such acts art.'],
  ['No fair society should','place any group above the law.'],
  ['Moreover, creativity itself','does not require total freedom.'],
  ['Boundaries often force artists to rely on','symbolism, irony and craft,','which can make criticism more powerful','rather than less.'],
  ['Many great novels, films and satirical works','challenge authority strongly','without crossing basic legal or moral lines.'],
  ['In conclusion, I completely disagree','that artists should have total freedom','to express any idea whatsoever.'],
  ['Creativity needs room to develop,','but once expression seriously harms others','or violates their rights,','society is justified in imposing limits.'],
];
const simpleChunkOverrides = [
  ['People often expect artists','to question old rules,','so artists clearly need','some freedom to make new work.'],
  ['Because of this, some people say','artists should be free','to say whatever they want.'],
  ['This essay says that idea is wrong','because art without limits can hurt society','and everyone who shares ideas with the public','must take responsibility for them.'],
  ['The first reason to reject complete freedom','is that art can change what people think,','not just show it.'],
  ['When films, songs, or art shows','praise hate based on race, violence, or extreme ideas,','seeing them often can make these ideas','feel more normal and easier to defend.'],
  ['After that,','people may find it easier to excuse','unfair treatment and violent behaviour in everyday life.'],
  ['For example, people have often used','art made to spread political messages','to make minority groups seem less human,','and wider hatred then followed.'],
  ['Art with no limits','can also hurt people directly.'],
  ['Work that shames groups with less power or protection','just to get attention','may make them afraid, upset, and left out,','especially if it spreads fast online.'],
  ['So there must be some limits','on what artists can do.'],
  ['Another reason is that','speaking to the public always means','being responsible for what you say.'],
  ['Once people publish or perform a work,','it is not only a private idea;','it becomes something that can affect',"other people's sense of worth, safety, and good name."],
  ['If artists were protected in every case,','they could avoid responsibility','for spreading harmful lies about people or urging others to do harm','just by calling it art.'],
  ['A fair society must never','put any group above the law.'],
  ['Also, being creative','does not require complete freedom.'],
  ['Limits can push artists to use','signs that stand for ideas,','words that mean the opposite of what they say, and skill;','this can make their criticism stronger.'],
  ['Many great books, films, and works that use humour to criticise','can strongly question those in power','without breaking basic laws or rules about right and wrong.'],
  ['In short, I completely disagree','that artists should be free','to express absolutely any idea.'],
  ['Artists need room to create,','but when their work seriously hurts others','or takes away their rights,','society has a good reason to set limits.'],
];

// Every highlighted original phrase occurs in the source, and every plain phrase in the bridge.
const vocabulary = [
  [['expected','expect','被期待'],['challenge convention','question old rules','挑戰傳統'],['some degree of','some','某種程度的'],['creative freedom','freedom to make new work','創作自由']],
  [['therefore','Because of this','因此'],['argue','say','主張'],['total freedom','free','完全自由'],['express any thoughts they choose','say whatever they want','表達任何想法']],
  [['will argue','says','將會論證'],['this view is wrong','that idea is wrong','這觀點是錯的'],['unlimited artistic expression','art without limits','不受限制的藝術表達'],['damage society','hurt society','傷害社會'],['no one who speaks to the public should escape responsibility','everyone who shares ideas with the public must take responsibility','公開發言者應負責']],
  [['total freedom should not be allowed','reject complete freedom','不應允許完全自由'],['shape attitudes','change what people think','塑造態度'],['merely reflect','just show','不只是反映']],
  [['lyrics','songs','歌詞'],['exhibitions','art shows','展覽'],['glorify','praise','美化'],['racial hatred','hate based on race','種族仇恨'],['extremism','extreme ideas','極端思想'],['repeated exposure','seeing them often','反覆接觸'],['less shocking','more normal','較不令人震驚']],
  [['Once this happens','After that','一旦如此'],['discrimination','unfair treatment','歧視'],['aggression','violent behaviour','攻擊行為'],['daily life','everyday life','日常生活']],
  [['propaganda art','art made to spread political messages','宣傳藝術'],['dehumanise minorities','make minority groups seem less human','剝奪少數群體的人性'],['broader hostility','wider hatred','更廣泛的敵意']],
  [['Unrestricted expression','Art with no limits','不受限制的表達'],['harm','hurt','傷害']],
  [['humiliates','shames','羞辱'],['vulnerable groups','groups with less power or protection','弱勢群體'],['for attention','just to get attention','為求關注'],['fear, distress and exclusion','afraid, upset, and left out','恐懼、痛苦與排斥'],['rapidly','fast','快速地']],
  [['Artistic freedom','what artists can do','藝術自由'],['therefore','So','因此'],['cannot be unlimited','must be some limits','不可毫無限制']],
  [['A second reason','Another reason','第二個原因'],['public expression','speaking to the public','公開表達'],['carries public responsibility','means being responsible','伴隨公開責任']],
  [['a work is published or performed','people publish or perform a work','作品被出版或表演'],['private thought','private idea','私人想法'],['an act','something','一種行為'],['dignity','sense of worth','尊嚴'],['reputation','good name','名譽']],
  [['absolute protection','protected in every case','絕對保護'],['evade accountability','avoid responsibility','逃避責任'],['defamation','spreading harmful lies about people','誹謗'],['incitement','urging others to do harm','煽動'],['simply by','just by','只靠']],
  [['No fair society should','A fair society must never','公平社會不應'],['place','put','置於']],
  [['Moreover','Also','此外'],['creativity itself','being creative','創造力本身'],['total freedom','complete freedom','完全自由']],
  [['Boundaries','Limits','界線'],['force artists to rely on','push artists to use','迫使藝術家依靠'],['symbolism','signs that stand for ideas','象徵'],['irony','words that mean the opposite of what they say','反諷'],['craft','skill','技巧'],['more powerful','stronger','更有力量']],
  [['novels','books','小說'],['satirical works','works that use humour to criticise','諷刺作品'],['challenge authority','question those in power','挑戰權威'],['crossing basic legal or moral lines','breaking basic laws or rules about right and wrong','越過基本法律或道德界線']],
  [['In conclusion','In short','總結來說'],['total freedom','free','完全自由'],['whatsoever','absolutely','無論甚麼']],
  [['Creativity needs room to develop','Artists need room to create','創造力需要空間'],['expression','their work','表達'],['harms others','hurts others','傷害他人'],['violates their rights','takes away their rights','侵犯權利'],['justified in imposing limits','has a good reason to set limits','有正當理由設限']],
];

const structure = (example, functionName, distractors, frame) => ({
  example, distractors, frame,
  answerReason:`這句${functionName}，與原句的句型及功能相符。`,
  distractorReason:`這句${functionName}；它沒有運用本題指定的句型功能。`,
});
const structures = [
  structure('The town added night buses, so more workers could get home safely.','用 so 交代加開夜間巴士帶來的結果',[2,12,18]),
  structure('Some people therefore argue that the town should replace its old bridge.','用 Some people therefore argue that 轉述支持換橋的看法',[3,10,14]),
  structure('This essay will argue that the library should stay open longer because students need a quiet place and because many workers study after work.','用兩個 because 分別預告延長開放時間的兩項理由',[0,12,5],{
    formula:'This essay will argue that [作者立場] because [第一項理由] and because [第二項理由]',
    meaning:'先表明作者的判斷，再用兩個 because 分別預告支持這個判斷的理由。',
    usage:'在引言已決定立場，而且會用兩個不同理由展開主體段時。',
    parts:[['This essay will argue that ','link','引出作者立場'],['this view is wrong','slot','作者立場'],[' because ','link','引出第一理由'],['unlimited artistic expression can damage society','slot','第一項理由'],[' and because ','link','引出第二理由'],['no one who speaks to the public should escape responsibility.','slot','第二項理由']],
  }),
  structure('The first reason this plan deserves support is that it would reduce waiting times.','用 The first reason...is that 指出支持計劃的首項理由',[1,10,14]),
  structure('When schools give daily feedback, regular practice can make students more confident.','用 When 設定情況，並用 can make 說明持續練習的影響',[5,12,7],{
    formula:'When [特定情況], [持續影響因素] can make [對象的改變]',
    meaning:'先設定情況，再說明某種反覆或持續的因素可能使對象產生改變。',
    usage:'要解釋特定情境中的反覆接觸或做法如何逐漸改變人或事時。',
    parts:[['When','link','設定情況'],[' films, lyrics or exhibitions glorify racial hatred, violence or extremism','slot','特定情況'],[',','link','接上主要結果'],[' repeated exposure ','slot','持續影響因素'],['can make','link','可能導致改變'],[' such ideas seem less shocking and more defensible.','slot','觀念的改變']],
  }),
  structure('Once the new path opens, more residents will be able to walk safely.','用 Once 引出小路開放後出現的結果',[4,12,0]),
  structure('For example, a free bus pass could help older residents reach the clinic.','用 For example 引入免費車票的具體例子',[14,17,1]),
  structure('A shared timetable can help parents plan their journeys.','用 can 提出共用時間表可能帶來的實際作用',[4,8,13],{
    formula:'[事物或行為] can [可能造成的影響]',
    meaning:'can 表示前面的事物或行為有可能造成後面的影響，不表示每次都必然發生。',
    usage:'要審慎指出某事可能帶來的好處或傷害，而不把結果說成必然時。',
    parts:[['Unrestricted expression ','slot','事物或行為'],['can','link','可能性'],[' also harm people directly.','slot','可能造成的影響']],
  }),
  structure('Public warnings may create fear, especially when they lack clear facts.','用 may create 提出可能的風險，再用 especially when 補充風險加劇的情況',[4,7,12],{
    formula:'[可能造成影響的事物或行為] may create [可能後果], especially when [加劇情況]',
    meaning:'先指出可能產生的影響，再用 especially when 補充風險特別高的情況；may 不表示必然。',
    usage:'要審慎提出一項潛在影響，並指出哪種情況會令影響更明顯時。',
    parts:[['Work that humiliates vulnerable groups for attention','slot','事物或行為'],[' may create ','link','可能造成'],['fear, distress and exclusion','slot','可能後果'],[', especially when ','link','加劇情況'],['it spreads rapidly online.','slot','加劇情況']],
  }),
  structure('The road, therefore, needs a safer crossing.','用插入句中的 therefore 作出道路需要更安全過路處的結論',[0,14,17],{
    formula:'[討論對象], therefore, [由前文得出的結論]',
    meaning:'therefore 插在句中，提示後面的判斷是根據前文得出的結論。',
    usage:'已交代足夠理由，接着要清楚收束為一項判斷時；結論必須由前文支持。',
    parts:[['Artistic freedom','slot','討論對象'],[', therefore,','link','由前文推出結論'],[' cannot be unlimited.','slot','結論']],
  }),
  structure('A second reason is that public spending always carries a duty to explain its results.','用 A second reason is that 引出公共支出的另一項責任理由',[3,1,14]),
  structure('Once the school closes, children lose a nearby classroom; parents also face longer journeys.','用 Once 設定學校關閉的情況，並用分號接出第二項影響',[4,12,18],{
    formula:'Once [事情發生], [第一項影響]; [第二項影響]',
    meaning:'Once 引出先成立的情況；主句與分號後再列出由此出現的兩項不同影響。',
    usage:'一個事件會帶來兩個相關但不同的後果，需要把兩者連在同一句時。',
    parts:[['Once','link','先成立的情況'],[' a work is published or performed','slot','事情發生'],[',','link','接第一項影響'],[' it is no longer a private thought','slot','第一項影響'],[';','link','並列另一項影響'],[" it becomes an act that can affect other people's dignity, safety and reputation.",'slot','第二項影響']],
  }),
  structure('If the city builds a new cycle lane, more people may ride to work.','用 If 提出建單車徑的條件，再說明可能結果',[5,4,2]),
  structure('No responsible company should hide a known safety risk.','用 No...should 明確否定公司隱瞞安全風險的做法',[7,8,12],{
    formula:'No [負有責任的對象] should [不可接受的行動]',
    meaning:'No...should 表示任何符合前面描述的對象，都不應做後面的事。',
    usage:'要提出適用於整類對象的道德或法律底線時。',
    parts:[['No','link','否定整類對象'],[' fair society ','slot','負有責任的對象'],['should','link','規範行動'],[' place any group above the law.','slot','不可接受的行動']],
  }),
  structure('Moreover, the new garden would give families a place to meet.','用 Moreover 補上一項支持公園方案的理由',[6,17,1]),
  structure('The council repaired the roof, which made the hall safer in winter.','用 which 補充修屋頂為整個場館帶來的效果',[0,2,18],{
    formula:'[先說明的做法], which [補充它帶來的影響]',
    meaning:'這裏的 which 指向前面整個做法，補充它可能帶來的影響；不可只按鄰近名詞猜指代。',
    usage:'說明一件事後，還要補充這件事帶來甚麼影響，而且指代對象清楚時。',
    parts:[['Boundaries often force artists to rely on symbolism, irony and craft','slot','先說明的做法'],[', which','link','補充影響'],[' can make criticism more powerful rather than less.','slot','帶來的影響']],
  }),
  structure('Researchers challenge old ideas strongly without crossing basic rules of evidence.','用 without crossing 說明有力質疑仍須遵守證據這條界線',[13,7,8]),
  structure('In conclusion, the city should improve buses before building more car parks.','用 In conclusion 收束對城市交通的整體建議',[14,6,1]),
  structure('The ticket is cheaper, but the journey takes much longer.','用 but 對照較低票價與較長旅程',[0,2,15]),
];

const Q=(prompt,options,correct,why)=>({type:'quiz',prompt,options,correct,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對「藝術家應有完全表達自由」採取甚麼立場？',[
    '完全反對：需要創作空間，但嚴重傷害他人或侵犯權利時應設限',
    '完全同意：任何作品都不應受法律或道德約束',
    '部分同意：只要作品在線下展出便不必承擔責任',
    '沒有立場：全文只列舉不同藝術形式',
  ],0,'引言說 this view is wrong；結論明言 completely disagree，同時承認創作需要空間。'),
  {type:'multi',prompt:'選出支撐這個立場的兩條不同主線',detail:'選兩項，再按「確認」。',options:[
    '不受限制的作品可能塑造有害態度，並直接傷害弱勢人士',
    '公開發表作品伴隨責任；藝術身分不能成為逃避法律的理由',
    '所有令人不舒服的藝術都應立即被禁止',
    '創作自由只與藝術家的收入有關',
  ],correct:[0,1],why:'第一主體段說明社會與個人傷害；第二主體段說明公開表達的責任與合理界線。'},
];
const route=[sequence('依照範文次序，逐一點選四張段落卡',[
  ['引言 · 立場','先承認藝術需要一定自由，再反對完全沒有界線的主張，預告傷害與責任兩條理由。'],
  ['主體段一 · 傷害','作品能塑造態度；美化仇恨會令歧視更易被接受，羞辱弱勢者也會直接傷人。'],
  ['主體段二 · 責任','公開作品可能影響他人尊嚴與安全；法律責任不可豁免，合理界線仍容許有力批評。'],
  ['結論 · 界線','重申反對絕對自由，承認創作空間，同時為嚴重傷害或侵權設限。'],
],'自由的需要 → 不受限的傷害 → 公開表達的責任 → 有創作空間但須有界線。')];
const evidence=[
  Q('第一主體段如何說明藝術不只是反映社會？',[
    '作品反覆美化仇恨後，原本令人震驚的觀念可能變得較容易被接受',
    '作品只記錄觀眾已經相信的事，完全不會改變態度',
    '作品必須在博物館展出，才會影響任何人的行為',
    '作品能改變想法，所以所有批評都必須被禁止',
  ],0,'原文把反覆接觸與觀念逐漸正常化連起來。'),
  Q('宣傳藝術的例子支持哪一項具體因果鏈？',[
    '先把少數群體描寫得不像人，之後更廣泛的敵意可能跟着出現',
    '先讓所有人了解少數群體，之後歧視自然完全消失',
    '先提高藝術品的售價，之後所有觀眾停止討論政治',
    '先禁止任何展覽，之後社會便不再出現不同意見',
  ],0,'dehumanise minorities 對應後來的 broader hostility；例子不是在談藝術市場。'),
  Q('除了改變態度，原文還指出作品可以怎樣直接傷害人？',[
    '為吸引關注而羞辱弱勢群體，尤其網上迅速擴散時會造成恐懼與排斥',
    '讓創作者花較多時間修改作品，並使展覽延期',
    '使觀眾必須閱讀較長說明，因而失去購票興趣',
    '令藝術家改用象徵手法，作品因而必然失去力量',
  ],0,'原文具體指出 fear, distress and exclusion，並補充網上擴散的加劇條件。'),
  Q('第二主體段為甚麼把公開作品與私人想法區分？',[
    '作品一旦出版或表演，便可能影響他人的尊嚴、安全和名譽',
    '只要作者從未解釋作品，公開作品就仍是純粹私人想法',
    '出版作品後，藝術家便自動失去所有基本權利',
    '所有私人想法都必須先經政府審查才能保留',
  ],0,'原文以公開後對他人的實際影響，說明為何出現公共責任。'),
  Q('「只要稱作藝術便能避責」在原文指向甚麼風險？',[
    '誹謗或煽動可能被包裝成藝術，以逃避本應承擔的責任',
    '藝術家可能因畫材昂貴而無法付清展覽場租',
    '觀眾可能誤以為所有藝術作品都是新聞報道',
    '所有批評政府的作品都必然違反基本法律',
  ],0,'作者反對 absolute protection，舉 defamation 和 incitement 說明不能因藝術名義而豁免。'),
  Q('原文如何回應「界線必定削弱創意」？',[
    '界線可促使藝術家運用象徵、反諷和技巧，批評仍能有力',
    '藝術家只有完全沉默，才能展現真正創意',
    '所有挑戰權威的小說與電影都應取消發表',
    '法律界線與創作方式完全無關，原文沒有討論',
  ],0,'原文說 boundaries can make criticism more powerful rather than less，並舉不越線仍能挑戰權威的作品。'),
];
const logic=[
  sequence('第一主體段：作品如何由觀念影響走到實際傷害？',[
    ['核心主張','藝術能塑造態度，不只是反映現有態度。'],
    ['反覆接觸','美化仇恨、暴力或極端思想的內容可能令相關觀念較易被接受。'],
    ['社會後果','歧視和攻擊行為因而變得較容易被開脫。'],
    ['歷史例子','宣傳藝術曾把少數群體描寫得不像人，之後出現更廣泛的敵意。'],
    ['直接傷害','羞辱弱勢群體的作品還可能造成恐懼、痛苦與排斥。'],
    ['段落收束','因此，藝術自由不能毫無限制。'],
  ],'態度可被塑造 → 不良觀念正常化 → 社會及個人傷害 → 不可無限。'),
  sequence('第二主體段：為何合理界線與創作力可以並存？',[
    ['核心主張','公開表達始終伴隨公共責任。'],
    ['由私到公','作品公開後可能影響他人的尊嚴、安全與名譽。'],
    ['法律底線','不能只靠稱某行為是藝術，就逃避誹謗或煽動的責任。'],
    ['公平原則','任何群體都不應被置於法律之上。'],
    ['創作反證','界線可促使藝術家運用象徵、反諷和技巧。'],
    ['具體作品','小說、電影和諷刺作品可有力挑戰權威，同時不越過基本界線。'],
  ],'公開影響 → 須負責任 → 遵守共同底線 → 創作仍可有力。'),
];

const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transfer=[
  T('短片平台反覆推薦把移民描寫成危險人物的影片。','哪項最能運用範文「作品塑造態度」的論證？',[
    '指出反覆觀看會令偏見正常化，並加深敵意',
    '只計算影片播放次數，因為觀看量本身已能證明所有觀眾受影響',
    '說明影片有爭議，所以平台必須停止發佈所有談移民的內容',
    '改用較吸引的影片封面，讓觀眾更快找到同一類內容',
  ],[
    '這保留原文由反覆接觸到態度轉變，再到敵意的因果鏈。',
    '播放量不能單獨證明偏見正常化或後續敵意。',
    '原文主張對嚴重傷害設限，沒有主張禁止整個議題。',
    '改封面不會分析有害觀念如何影響態度。',
  ],[3,4,5],'原文先指出藝術能塑造態度，再說美化仇恨的內容經反覆接觸，會令觀念較容易被接受。'),
  T('校刊刊登嘲笑身體殘障學生的漫畫，並在網上廣泛流傳。','哪項最直接對應範文的「直接傷害」主線？',[
    '評估漫畫是否令相關學生感到恐懼或被排斥，並留意網上擴散的影響',
    '只討論畫風是否新穎，不考慮被描寫學生的實際處境',
    '只要校刊作者稱作品是幽默，便免除對被嘲笑學生的責任',
    '把所有學生漫畫永久撤下，因為任何笑話都必然傷害別人',
  ],[
    '這把羞辱弱勢群體、恐懼排斥與迅速擴散三個來源要素連起來。',
    '畫風無法代替對受影響者和實際傷害的分析。',
    '原文正反對以創作名義逃避公共責任。',
    '原文區分嚴重傷害與合理創作空間，並非全面禁絕幽默。',
  ],[7,8,18],'範文指出為求關注而羞辱弱勢群體的作品，可造成恐懼、痛苦與排斥，網上快速擴散會加劇影響。'),
  T('一款遊戲容許玩家公開鼓勵攻擊特定群體；製作者說那只是藝術。','哪項最能運用範文的責任原則？',[
    '檢視煽動傷害的內容，不能只因製作者稱其為藝術便免除責任',
    '接受製作者的標籤，因為遊戲一律不可能影響現實行為',
    '禁止所有遊戲討論社會衝突，無論內容是否鼓勵傷害',
    '只比較遊戲畫質和銷量，不理會公開內容的實際風險',
  ],[
    '這轉用原文「藝術稱號不能豁免煽動責任」的推理。',
    '藝術或遊戲標籤不會自動消除公開內容的責任。',
    '原文沒有要求禁止一切涉及衝突的創作。',
    '畫質和銷量不能回答是否煽動傷害的問題。',
  ],[10,11,12,13],'原文以誹謗與煽動說明：作品公開後會影響他人，不能靠稱之為藝術逃避共同法律底線。'),
  T('一部歷史節目反覆把某個少數民族描寫成不值得尊重的人。','哪項論證最貼近範文的歷史例子？',[
    '說明貶低一群人的人格可能先改變態度，再為更廣泛敵意鋪路',
    '只分析節目的片長和攝影手法，並以收視率證明內容無害',
    '說明節目談及歷史，所以任何描寫都不需要核實事實',
    '主張禁止所有歷史題材，即使作品尊重不同群體',
  ],[
    '這重建「先剝奪人性，後形成更廣敵意」的例證功能。',
    '形式和收視率不能回答貶低群體會帶來甚麼後果。',
    '歷史題材並不免除對公開表達的責任。',
    '原文批評具體傷害，沒有否定全部歷史創作。',
  ],[4,5,6],'原文的宣傳藝術例子先談 dehumanise minorities，再談 broader hostility，展示態度轉變如何走向社會傷害。'),
  T('知名運動員在公開節目中散播對某人的未經查證指控。','哪項最能轉用「公開表達伴隨責任」？',[
    '說明指控一旦公開可能損害他人名譽，因此發言者須核實與負責',
    '認為運動員有粉絲，所以其公開指控一律只是私人想法',
    '只討論節目的剪接速度，不判斷指控對他人的影響',
    '禁止運動員談論所有公共議題，連有證據的批評也不例外',
  ],[
    '這保留從公開發言、可能損害名譽到責任的三步推理。',
    '面向公眾的指控不能因發言者身分而成為純私人想法。',
    '剪接形式不能取代對名譽風險與責任的評估。',
    '原文容許有力而守底線的批評，並不要求全面噤聲。',
  ],[10,11,12],'範文說公開作品不再只是 private thought，因為它可影響他人的 dignity、safety 和 reputation。'),
  T('員工以諷刺文章批評公司決策，但文章只用可核實事實和象徵手法。','哪項最符合範文對界線與創意的看法？',[
    '指出遵守事實與權利界線仍可作有力批評，象徵手法甚至使表達更強',
    '指出文章沒有誹謗，所以它不可能對任何讀者產生影響',
    '要求員工停止所有批評，因為公司不能接受被質疑',
    '聲稱只要文章有創意，內容是否真實便不再重要',
  ],[
    '這把守住底線與仍能有力挑戰權威兩點一同保留。',
    '沒有誹謗不等於作品完全沒有公共影響。',
    '原文肯定不越過基本界線仍可強烈挑戰權威。',
    '創意不能取代對真實性和他人權利的責任。',
  ],[14,15,16],'範文說界線可促使藝術家使用象徵、反諷與技巧，許多作品也能不越線而有力挑戰權威。'),
  T('劇團想批評住房政策，卻擔心不能公開某住戶的私人資料。','哪項方案最能應用範文的創作反證？',[
    '以象徵角色批評政策，並保護住戶私隱',
    '公開住戶姓名與地址，因為劇場藝術不需要尊重私隱',
    '完全取消住房政策的討論，因為任何界線都令批評失效',
    '只換海報，演出仍洩漏住戶私隱',
  ],[
    '這讓象徵與技巧承擔批評功能，同時守住他人的權利界線。',
    '藝術形式不會使公開私人資料的傷害自動合理。',
    '範文指出限制可促進有力表達，並非必須沉默。',
    '換海報不能處理劇本中公開私人資料的問題。',
  ],[14,15,16],'原文主張 creativity does not require total freedom；象徵、反諷和技巧可以讓批評更有力量。'),
  T('大學容許學生展出尖銳政治作品，但禁止作品直接威脅同學。','哪項結論最貼近範文的立場？',[
    '保留批評與創作空間，同時對直接威脅同學的內容設合理界線',
    '凡是政治作品都要禁展，因為任何爭議等同嚴重傷害',
    '只要稱作品為藝術，直接威脅同學也不應受到處理',
    '只准展出沒有任何觀點的作品，以免觀眾出現不同意見',
  ],[
    '這同時保留創作空間與對嚴重傷害的界線，對應結論。',
    '有爭議不等於威脅或侵權，原文沒有主張全面禁展。',
    '藝術身分不會使直接威脅失去其公共影響。',
    '原文容許作品挑戰權威，不要求作品沒有觀點。',
  ],[0,13,17,18],'結論承認 creativity needs room to develop，但嚴重傷害他人或侵犯權利時可以設限。'),
  T('校園辯論社聲稱：只要在辯論場地，任何誹謗同學的話都應免責。','哪項回應最能轉用範文的法律底線？',[
    '指出辯論可保留尖銳觀點，但不能讓參與者因場地或身分而凌駕共同規則',
    '以辯論名義免責，無視誹謗的傷害',
    '取消整個辯論社，因為任何反對意見都可能造成不快',
    '只規定說話時間，不處理散播虛假指控的問題',
  ],[
    '這把「不能以藝術身分避責」轉成「不能以辯論場地避責」。',
    '場地標籤不會消除虛假公開指控的實際影響。',
    '原文保留批評空間，反對的是使人凌駕共同底線。',
    '發言時間無法處理誹謗或名譽傷害。',
  ],[11,12,13],'範文以誹謗與煽動作例子，接着說 No fair society should place any group above the law。'),
  T('圖書節收到一本令部分讀者不舒服、但沒有威脅或侵犯權利的小說。','哪項做法最符合範文結論的界線？',[
    '容許小說發表和被批評，僅在嚴重傷害或侵權時設限',
    '因有讀者不舒服便禁止小說，無須再看內容是否傷害權利',
    '規定任何小說都不受一般法律約束，無論內容帶來甚麼影響',
    '取消所有讀者討論，因為不同意見本身已等於煽動',
  ],[
    '這區分創作引起不快與嚴重傷害，保留原文承認的創作空間。',
    '原文的設限條件是嚴重傷害或侵權，不是任何不適。',
    '藝術品仍須面對同一社會中的責任和法律界線。',
    '讀者討論與煽動不同，原文沒有要求消除異議。',
  ],[0,14,17,18],'範文從未說所有令人不舒服的藝術都應受禁；它在結論中把嚴重傷害與侵權列為設限原因。'),
  T('健康宣傳片反覆誇大某種疾病的危險，並要求觀眾相信未經證實的說法。','哪項最能結合範文兩條主線？',[
    '分析反覆觀看如何塑造恐懼，同時要求製作者對公開聲稱及其影響負責',
    '只檢查影片是否配樂動聽，不處理觀念改變與公開責任',
    '稱影片有教育目的，就容許散播未經證實的說法',
    '禁止所有健康宣傳，即使內容準確且能幫助公眾',
  ],[
    '這同時轉用態度受影響與公開表達須負責兩條不同理由。',
    '配樂不能回答反覆接觸及錯誤聲稱的後果。',
    '教育標籤不會消除公開說法對公眾的責任。',
    '範文要求評估具體傷害，沒有全面否定健康宣傳。',
  ],[3,4,10,11],'主體段一說作品能 shape attitudes；主體段二說公開作品影響他人，因而 carries public responsibility。'),
  T('短時間內有大量轉發的貼文，以侮辱用語描述某弱勢群體。','哪項最能轉用範文對擴散速度的分析？',[
    '說明快速轉發可能擴大羞辱和排斥，故須評估實際受影響者',
    '只記錄轉發數字，再假設所有人看到後都作出同一反應',
    '稱網上貼文只是私人想法，無論傳播多廣都沒有公共影響',
    '認為只要貼文吸引關注，任何用語帶來的傷害都可忽略',
  ],[
    '這保留原文「羞辱弱勢群體」及「網上迅速傳播會加劇影響」兩部分。',
    '轉發數字不能證明每名觀眾都作出相同反應。',
    '公開大量傳播使內容更可能影響他人，並非純私人想法。',
    '原文正指出為求關注而羞辱他人可能造成傷害。',
  ],[7,8,11],'範文說為吸引關注而羞辱弱勢群體的作品可造成恐懼與排斥，especially when it spreads rapidly online。'),
];

const reviewedTransferOptions=[
  ['反覆觀看或令偏見正常化，並加深敵意','只看播放量便斷定所有觀眾受影響','因影片有爭議便禁所有移民內容','只改封面令同類內容更易被看見'],
  ['檢查學生會否恐懼或被排斥，及網上擴散','只看畫風新穎，不理被描寫學生處境','作者稱作品幽默，便免除傷害責任','永久撤下所有漫畫，認定笑話必傷人'],
  ['檢視煽動傷害，不因藝術標籤免除責任','只接受藝術標籤，認定遊戲不影響現實','禁止所有涉及衝突的遊戲內容','只看畫質和銷量，忽略公開煽動風險'],
  ['貶低群體人格或先改態度，再擴大敵意','只看片長與收視率，斷定內容沒有傷害','因節目談歷史，便毋須核實描寫','禁止所有歷史題材，即使內容尊重人'],
  ['公開指控或傷名譽，發言者須核實負責','有粉絲的運動員，其指控仍只是私想','只看剪接速度，不理指控對人的影響','禁止運動員談公共議題，包括有據批評'],
  ['守事實與權利界線，仍可用象徵有力批評','沒有誹謗，就斷定文章不影響讀者','禁止員工批評，以免公司受人質疑','文章有創意，就毋須再核對內容真偽'],
  ['以象徵角色批評政策，同時保護住戶私隱','公開住戶姓名地址，稱藝術不需顧私隱','取消住房政策討論，認為界線妨礙批評','只換海報，演出依然公開住戶私隱'],
  ['保留創作空間，對直接威脅設合理界線','所有政治作品皆禁展，因爭議即傷害','稱作品是藝術，便可不處理直接威脅','只展出沒觀點的作品，以免有人不同意'],
  ['辯論可有尖銳觀點，參與者仍須守共同規則','以辯論名義免責，不理誹謗帶來傷害','取消整個辯論社，因反對意見令人不快','只限每人發言時間，不處理虛假指控'],
  ['容許發表與批評，嚴重傷害或侵權才設限','讀者不舒服便禁書，不查有否侵害權利','小說不受一般法律規限，不論實際影響','取消所有讀者討論，因分歧即煽動'],
  ['分析反覆觀看如何塑造恐懼，追究公開責任','只看配樂動聽，不理觀念改變與責任','稱有教育目的，便可散播未證實說法','禁止所有健康宣傳，包括有益的準確資訊'],
  ['快速轉發或擴大羞辱排斥，須看受影響者','只記轉發數字，便假定人人反應一樣','稱貼文是私想，不論傳多廣皆無影響','只要引人注意，便可忽略用語傷害'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
const plausibleAlternatives=[
  [['反覆觀看或加深偏見，傷害仍只看觀看量','影片描寫帶來敵意，平台可只調整推薦速度','先查內容真偽，觀眾態度變化可暫不看'],['觀看量不能直接衡量態度形成。','速度調整未必處理貶低內容本身。','論證重點是內容可能塑造態度。']],
  [['查網上擴散範圍，學生感受可等投訴後再問','先分析漫畫風格，再判斷是否有直接傷害','作者稱是幽默，便可由同學自行處理排斥'],['直接傷害也須看被描寫者處境。','畫風不能代替恐懼與排斥的檢查。','創作意圖不會消除實際影響。']],
  [['藝術標籤有保護作用，公開煽動可事後評估','檢視內容傷害，遊戲畫質仍是首要準則','先限制玩家人數，再不問攻擊言論的影響'],['藝術自由仍受公開傷害的界線約束。','畫質不比煽動風險優先。','人數限制不能代替責任判斷。']],
  [['反覆貶低或影響態度，歷史真實則次要','歷史節目可引起討論，敵意風險可另議','先評估收視規模，再判定群體傷害程度'],['歷史描寫的真實與傷害仍要重視。','對群體的貶低正是論證重點。','收視規模不足以衡量內容傷害。']],
  [['公開指控可能傷名譽，核實可由節目組負責','有粉絲者需負責，未查證時可先含糊發言','知名運動員可批評，但名譽損害較難評估'],['發言者仍應對自身指控負責。','含糊措辭也可能散播未核實指控。','傷害可能性需要檢查，而非略去。']],
  [['守住真實底線，象徵表達則較難批評政策','可用象徵批評，公司有異議便宜撤文','事實可核查，員工私隱可留待之後再看'],['象徵手法正可維持有力批評。','被質疑不等於構成侵權或傷害。','創意仍須尊重相關權利界線。']],
  [['保護住戶私隱，住房政策便只能私下批評','批評政策可用象徵角色，住戶資料由劇團決定','若無法用真名，演出內容便較難有力量'],['不公開資料仍可有力批評政策。','住戶私隱不應由劇團任意處理。','象徵創作提供替代而非削弱批評。']],
  [['保留政治作品，但威脅內容可由觀眾自行判斷','禁止直接威脅，政治批評亦宜大幅減少','尖銳作品可以展出，校方無須設清楚界線'],['直接威脅需要合理處理。','批評與威脅不能混作一類。','合理規則與創作自由可以並存。']],
  [['辯論可尖銳，虛假指控可待事後澄清','誹謗會傷人，因此辯論只宜談溫和意見','規定發言時間，內容真假留給聽眾判斷'],['事後澄清未必消除名譽傷害。','尖銳觀點仍可在共同規則下表達。','時間限制不處理虛假指控。']],
  [['小說可出版，不適者可要求事前刪改','容許批評小說，發表前先避免有爭議內容','小說沒有威脅，讀者便不必討論其觀點'],['不舒服本身不足以作刪改理由。','分歧與權利侵害的界線不同。','容許發表也應容許讀者批評。']],
  [['分析恐懼形成，公開責任可交由觀眾自行判斷','宣傳片有健康目的，誇大可先視作提醒','追究未證實說法，重複觀看的影響可略去'],['公開製作者仍需負責任地核查。','教育目的不授權不實誇大。','兩條主線都要納入分析。']],
  [['快速轉發可能擴大觸及，受害反應可日後再查','侮辱用語有問題，擴散速度則較少重要','先統計轉發量，再把內容視為私人想法'],['受影響者的傷害需要即時評估。','快速擴散可能加深羞辱與排斥。','公開傳播不等同私人表達。']],
];
plausibleAlternatives.forEach(([options,reasons],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...reasons);});
export default {
  key:'opinion:4',
  meta:{topic:'藝術自由與責任',summary:'作者反對藝術家有絕對表達自由：作品可能造成傷害，公開表達也伴隨責任；合理界線仍容許有力創作。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
