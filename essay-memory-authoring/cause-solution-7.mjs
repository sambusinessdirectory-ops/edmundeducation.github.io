// Reviewed Cause/Solution 7: the gender imbalance in university science.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-7-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:7'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'At university, science classes still have many more men than women.',
  'This difference is mainly not about who is good at science.',
  'It is more often caused by what people expect girls to do; these ideas affect girls’ belief in themselves and the subjects they choose long before university.',
  'To make the numbers more equal, schools and universities need to change how people see science and give women students better help.',
  'The main reason is that many people still show science as a subject for men, even when they do not say this directly.',
  'From a young age, boys are often told to make things, try experiments and solve problems with technology, while girls may be pushed towards subjects seen as caring, based on words or better for them.',
  'Because of this, many girls who are good at science start to wonder if physics, engineering or computer science is a place for them.',
  'This worry can grow stronger by itself: if a girl rarely sees women scientists, teachers or classmates, science may seem less like a place she can enter and more like a place meant for other people.',
  'One good way to help is to act sooner, before students have chosen what to study at university.',
  'Schools should let girls try real science projects, meet women who work in science and hear about science jobs, from medical research to technology that protects the environment.',
  'At the same time, teachers should speak against common ideas about what girls can study, so girls are not only allowed to take science but are also expected to do well in it.',
  'Universities can also help by making women students feel less alone in science classes.',
  'People who give advice, money to help with study, visits to schools and women teachers at university can show girls that they will have support when they enter science courses.',
  'Messages about applying to university should also show that science involves working together, new ideas and helping society, not just hard technology and competition.',
  'To sum up, the difference between men and women in university science mostly begins with ideas children hear early and not seeing people like themselves in science.',
  'We can make it smaller by encouraging girls sooner, showing them more women in science and making universities more welcoming.',
];
const vocabulary=[
  [['At university level','At university','在大學階段'],['unevenly populated','many more men than women','人數不均']],
  [['imbalance','difference','不平衡'],['not mainly a question of ability','mainly not about who is good at science','主要不是能力問題']],
  [['social expectations','what people expect girls to do','社會期望'],['shape','affect','影響'],['confidence','belief in themselves','自信'],['subject choices','subjects they choose','科目選擇']],
  [['balance the numbers','make the numbers more equal','平衡人數'],['image of science','how people see science','科學形象'],['support available','better help','可獲得的支援'],['female students','women students','女學生']],
  [['widely presented','many people still show','廣泛呈現'],['directly or indirectly','even when they do not say this directly','直接或間接'],['male domain','subject for men','男性領域']],
  [['From childhood','From a young age','從童年開始'],['encouraged','told','受到鼓勵'],['build','make things','建造'],['experiment','try experiments','做實驗'],['technical problems','problems with technology','技術問題'],['guided towards','pushed towards','被引導'],['verbal','based on words','語言性']],
  [['As a result','Because of this','結果'],['capable','good at science','有能力的'],['begin to doubt','start to wonder','開始懷疑'],['belong in','is a place for them','屬於']],
  [['doubt','worry','懷疑'],['self-fulfilling','grow stronger by itself','自行應驗'],['female scientists','women scientists','女性科學家'],['open door','place she can enter','敞開的門'],['room built for someone else','place meant for other people','為別人而設的房間']],
  [['effective solution','good way to help','有效解方'],['intervene earlier','act sooner','更早干預'],['university choices are fixed','students have chosen what to study at university','大學選擇已確定']],
  [['expose girls to','let girls try','讓女生接觸'],['practical science projects','real science projects','實用科學項目'],['female role models','women who work in science','女性榜樣'],['career talks','hear about science jobs','職業講座'],['environmental technology','technology that protects the environment','環境科技']],
  [['actively challenge','speak against','積極挑戰'],['quiet stereotypes','common ideas about what girls can study','隱性的刻板印象'],['subject selection','what girls can study','科目選擇'],['genuinely expected to succeed','expected to do well','真正期望成功']],
  [['science courses','science classes','科學課程'],['isolating','alone','令人孤立的']],
  [['Mentoring schemes','People who give advice','導師計劃'],['scholarships','money to help with study','獎學金'],['outreach programmes','visits to schools','外展計劃'],['visible female academic staff','women teachers at university','可見的女性學術人員'],['reassure applicants','show girls that they will have support','讓申請者安心'],['hostile territory alone','support when they enter science courses','獨自踏入不友善環境']],
  [['Admission campaigns','Messages about applying to university','招生宣傳'],['collaborative','working together','合作的'],['creative','new ideas','富有創意的'],['socially valuable','helping society','具社會價值的'],['competitive','competition','競爭激烈的']],
  [['In conclusion','To sum up','總結'],['gender gap','difference between men and women','性別差距'],['largely rooted in','mostly begins with','主要源於'],['early stereotypes','ideas children hear early','早期刻板印象'],['lack of visible belonging','not seeing people like themselves in science','缺乏可見的歸屬感']],
  [['narrowed','make it smaller','縮小'],['earlier encouragement','encouraging girls sooner','更早鼓勵'],['stronger role models','showing them more women in science','更多榜樣'],['more supportive university environments','making universities more welcoming','更有支援的大學環境']],
];
export {original,simple,vocabulary};

// Each card marks the original sentence exactly, then explains the reusable grammatical job.
function frame(i,links,labels,meaning,usage,example,tag,job){
  const text=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed source wording ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:text.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
  if(cursor<text.length)parts.push({text:text.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched slot labels ${i+1}`);
  return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
  frame(0,[', with '],['大學課程人數不均的概括','具體是哪一組學生較多'],
    '先描述科學課程人數不均，再用 with 補上男生明顯多於女生的具體方向。',
    '已提出一種分布不均的現象，還要精簡說清哪一組人佔較多數時。',
    'At many colleges, language classes have uneven numbers, with women making up most students.','with','補上分布不均的具體方向'),
  frame(1,[' is not mainly a question of '],['需要解釋的人數差距','應排除的主要解釋'],
    'is not mainly a question of 先排除把性別差距歸因於能力不足的簡化說法。',
    '常見解釋把問題歸咎某群人的能力，需要先說明這不是主要原因時。',
    'The lack of readers is not mainly a question of ability.','not mainly a question of','排除過度簡化的能力解釋'),
  frame(2,[' is more often caused by '],['前句所說的不平衡','較常見的社會原因'],
    'more often caused by 把焦點由能力轉向社會期望；後面再說期望如何影響信心和選科。',
    '排除一種表面原因後，要指出更常見的結構或社會原因時。',
    'The gap is more often caused by unequal access to books.','more often caused by','提出較常見的另一成因'),
  frame(3,['To balance ',', '],['要改善的人數差距','學校與大學需要採取的兩類措施'],
    'To balance 先說目標；後半句並列改變科學形象和增加女學生支援。',
    '題目要求縮小差距，需要在引言同時預告觀念與實際支援兩類解方時。',
    'To balance the team, coaches need to give all pupils equal chances.','To balance','先定目標再提出行動'),
  frame(4,['The main reason is that '],['科學仍被視作男性領域的完整原因子句'],
    '固定開頭標明主因；that 後用完整子句說明科學被呈現為男性領域。',
    '在主體段開始解釋主要成因，需要直接說清社會如何塑造這種印象時。',
    'The main reason is that pupils rarely meet working engineers.','The main reason is that','直接說出主要原因'),
  frame(5,['From childhood, ',', while '],['男孩較常獲得的鼓勵','女孩可能被引導的不同方向'],
    'From childhood 定出時間起點；while 對照男孩與女孩受到的不同鼓勵。',
    '要指出兩群人從早期得到的機會或期待不同，並把兩邊放在同一句比較時。',
    'From childhood, some pupils are encouraged to draw, while others are pushed towards sport.','From childhood...while','對照兩組人早期受到的引導'),
  frame(6,['As a result, '],['刻板印象對有能力女生的影響'],
    'As a result 把前句的不同鼓勵連到女生對自己是否屬於科學領域的懷疑。',
    '已說明一種社會或教育條件，接着要指出它如何影響信心或選擇時。',
    'As a result, many children lose confidence before they even try.','As a result','把早期條件推到選擇或信心的結果'),
  frame(7,[': if ',', '],['懷疑會自行加深的概括','缺少女榜樣的具體條件','女生可能產生的排斥感'],
    '冒號後的 if 說明懷疑如何自行加深：缺少女性榜樣，便更難看見自己屬於科學。',
    '一種心理影響可能變成循環，需要用具體條件和其後的感受展示機制時。',
    'This fear can grow stronger: if a pupil never sees role models, the activity may seem closed to them.','colon...if','展開一種感受自我加深的機制'),
  frame(8,['One effective solution is to ',', before '],['應及早採取的行動','大學選科尚未定型的時間點'],
    'One effective solution is to 提出早介入；before 說明必須趕在大學選擇固定之前。',
    '要提出一項預防性解方，並解釋為何應在某個決定形成前開始時。',
    'One effective solution is to offer lessons early, before students choose their subjects.','One effective solution...before','交代解方與介入時機'),
  frame(9,[' should expose ',' to ',', from ',' to '],['負責安排活動的學校','接觸科學的學生','活動與榜樣','一種科學工作例子','另一種科學工作例子'],
    'should expose...to 列出女生可親身接觸的項目；from...to 顯示科學工作的廣闊範圍。',
    '要讓學生更清楚某領域的實際選擇，先列活動與榜樣，再給兩端不同例子時。',
    'Schools should expose pupils to many careers, from nursing to product design.','expose...to...from...to','列實際接觸和領域跨度'),
  frame(10,['At the same time, ',' should actively challenge ',', so that '],['需要行動的教師','影響選科的刻板印象','女生應得到的真實期望'],
    'At the same time 引入教師責任；so that 說明挑戰刻板印象是為了讓女生真正被期望成功。',
    '已有活動或榜樣方案，還要改變教師的日常期望和語言時。',
    'At the same time, coaches should actively challenge unfair team labels, so that every pupil expects to improve.','At the same time...so that','接上另一負責方並說明目的'),
  frame(11,[' can also help by '],['可提供支援的大學','令科學課程較不孤立的做法'],
    'can also help by 把解方由學校移到大學，後面明確指出改善課程感受的方法。',
    '已提出較早階段的措施，現在要補上下一階段機構可採取的支援時。',
    'Libraries can also help by offering free study rooms.','can also help by','引出另一機構能做的事'),
  frame(12,[' can reassure ',' that '],['導師、獎學金和女性教員等支援','需要安心的申請者','進入課程後不會孤立無援的預期'],
    'can reassure...that 把可見的支援措施與申請者對未來學習環境的信心連起來。',
    '已有具體措施，要說明它們如何讓新加入的人相信自己會得到支援時。',
    'Student mentors can reassure new pupils that they will have someone to ask for help.','can reassure...that','把可見支援接到預期信心'),
  frame(13,[' should also show ',' as ',', rather than only '],['負責招生的宣傳','要重新呈現的領域','合作與社會價值的一面','過窄的舊形象'],
    'as 呈現科學合作、創意和社會價值；rather than only 排除只強調技術競爭的窄形象。',
    '要改變一個領域的刻板形象，展示被忽略的面向並指出舊形象過窄時。',
    'School posters should also show sport as cooperative and healthy, rather than only competitive.','show...as...rather than only','用較全面形象修正刻板印象'),
  frame(14,['In conclusion, ',' is largely rooted in '],['需要縮小的大學科學性別差距','前文分析的早期原因'],
    'In conclusion 收束全文；largely rooted in 保留主要而非唯一原因的分寸。',
    '結尾要概括問題從早期觀念與歸屬感不足而來，並避免說成唯一原因時。',
    'In conclusion, low participation is largely rooted in limited access and weak encouragement.','largely rooted in','謹慎歸納主要根源'),
  frame(15,[' can be narrowed through '],['前句提出的人數差距','更早鼓勵、榜樣與大學支援'],
    'can be narrowed through 回應如何平衡人數，列出從中學到大學的互補措施。',
    '已在前句指出差距，最後要用一句話概括多條縮小差距的路徑時。',
    'The gap can be narrowed through early mentoring and fairer hiring.','can be narrowed through','收束多項縮小差距的措施'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+5)%specs.length,(i+10)%specs.length];return {...target,distractors,
  wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；它沒有用「${target.tag}」${target.job}。`),
  answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的成因與解方次序，依次選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('作者認為大學科學課程的性別差距主要由甚麼形成？',[
    '女生早年受到的社會期望和榜樣不足，影響信心與選科',
    '女生在生理上完全不可能理解任何科學知識',
    '每間大學都沒有任何科學課程可供女生申請',
    '男生只因考試日期較早，便一定佔滿所有名額',
  ],'文章明確排除能力作為主要解釋，轉而分析早期刻板印象與歸屬感。'),
  {type:'multi',prompt:'哪兩類改善共同構成範文的解方？',detail:'選兩項，再按「確認」。',options:[
    '在中學更早提供實作項目、女性榜樣和不帶偏見的鼓勵',
    '在大學提供導師、獎學金、外展與更友善的課程環境',
    '只告訴女生不要申請科學，讓現有比例保持不變',
    '只修改宣傳顏色，不提供任何實作或後續支援',
  ],correct:[0,1],why:'範文把大學選擇前的早期鼓勵與入學後可見的支援連起來。'},
];
const route=[sequence('從早期期待到大學支援的完整路線',[
  ['引言：界定不平衡','科學課程男生明顯較多，但主要原因不是能力。'],
  ['主體一：追溯早期成因','男孩與女孩受到不同鼓勵；缺少女性榜樣又使女生懷疑自己是否屬於科學。'],
  ['主體二：先中學、後大學','實作、榜樣和教師期望要提前介入；導師、獎學金和招生形象提供入學支援。'],
  ['結尾：歸納目標與措施','差距源於早期刻板印象與歸屬感不足；更早鼓勵和大學支援可縮小它。'],
],'先解釋選擇如何形成，再按形成選擇的時間順序安排解方。')];
const evidence=[
  quiz('為甚麼作者不以能力解釋男女學生數目差距？',[
    '他指出社會期望早在大學申請前便影響女生信心和選科',
    '他聲稱每位女生都已接受與男生完全相同的鼓勵',
    '他認為大學名額完全由出生月份決定',
    '他從未提到女生申請大學前受到的任何影響',
  ],'引言先排除能力說，再把注意力轉到長期的社會期待。'),
  quiz('童年鼓勵的差異如何影響之後的科學選擇？',[
    '男孩較常做建造與技術嘗試，女生可能被導向其他科目，信心因而受影響',
    '兩群孩子一定得到完全相同的建造和實驗機會',
    '只要女生讀語言科目，便不可能學習任何科學技能',
    '童年的活動和期望絕不可能影響後來的選科',
  ],'範文由早期鼓勵推到信心和是否選修科學，不作能力判斷。'),
  quiz('「自行應驗」在範文中是甚麼意思？',[
    '缺少女性科學榜樣令女生覺得自己不屬於這個領域，因而更少嘗試',
    '只要出現一位女性榜樣，所有女生便立即取得科學學位',
    '女生已經不相信科學，因此學校應停止提供實驗',
    '能力差距會自動在一天內出現，與環境和信心無關',
  ],'不屬於的感覺和榜樣不足可能互相加強，形成選擇上的循環。'),
  quiz('中學階段的方案應包括甚麼？',[
    '實作項目、女性榜樣、職業講座，以及教師挑戰刻板印象',
    '只在學生選定大學科目後才第一次介紹科學職業',
    '只容許女生入班，但明確告訴她們不會成功',
    '只展示科學競爭的一面，不讓學生做實驗',
  ],'範文強調及早介入和真正期望女生成功，而不只是准許她們選科。'),
  quiz('大學能如何減少女學生感到孤立？',[
    '提供導師、獎學金、外展及可見的女性學術人員',
    '把所有女申請者單獨安排到沒有同伴的房間',
    '停止提供任何導師或財政支援，並隱藏女性教員',
    '只調整課程名稱，不改變學習環境和可見支援',
  ],'大學解方針對進入課程後是否有同伴、榜樣和具體支援。'),
  quiz('招生宣傳應展示科學的哪些被忽略面向？',[
    '合作、創意與社會價值，而不只強調技術和競爭',
    '只展示競爭，並否認科學研究需要任何合作',
    '只談科學儀器價格，不介紹研究會如何幫助社會',
    '完全取消科學職業資訊，讓學生無從了解工作內容',
  ],'範文要求宣傳呈現更完整的科學形象，不把它縮窄成單一競爭圖像。'),
];
const logic=[
  sequence('主體一：刻板印象如何逐步影響選科',[
    ['早期鼓勵不一樣','男孩較常被鼓勵建造和實驗；女孩可能被引向其他科目。'],
    ['信心與歸屬感受影響','有能力的女生仍可能懷疑自己是否屬於科學。'],
    ['缺少可見榜樣','很少看見女科學家、教師和同學，使科學看似為別人而設。'],
    ['懷疑因此可能自行加深','感到不屬於，便更少選修；領域裏的女性又更少可見。'],
  ],'不要把人數差距當成能力證據；要追問選擇形成的過程。'),
  sequence('主體二：讓中學與大學的措施接起來',[
    ['在選科前讓女生親身接觸科學','實作項目、女性榜樣及職業講座擴闊想像。'],
    ['教師改變日常期望','挑戰隱性刻板印象，真心期望女生在科學成功。'],
    ['大學提供入學後的可見支援','導師、獎學金、外展和女性教員減少孤立。'],
    ['招生呈現完整的科學形象','讓合作、創意和社會價值與技術內容一同被看見。'],
  ],'早期接觸改變選擇前的信心，入學支援改善進入後的環境。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一間學校的機械人學會女生較少；教師發現女生較少獲邀參加初階活動。','哪項最準確轉用範文的成因分析？',[
    '先檢查早期邀請與實作機會如何影響信心，不把人數差距當成能力證據',
    '直接宣稱每位女生都不懂機械人，無須看活動安排',
    '只改學會標誌顏色，不查誰有機會接觸初階活動',
    '因為女生較少，就禁止她們接觸任何機械人項目',
  ],['把機會差異、信心與參與相連，避免用結果倒推能力。','以人數代替能力證據，違反範文立場。','標誌不等於實際接觸機會。','禁入會加重而非解決參與差距。'],[1,2,5,6],'原文說差距主要不是能力問題，而與早期期待和接觸機會相關。'),
  transfer('一項青年音樂計畫只展示男性作曲家，女生很少看見與自己相似的導師。','哪項方案最能轉用範文的榜樣機制？',[
    '增加女性作曲家與導師的可見度，並讓女生親身試作曲',
    '繼續隱藏女性作品，並宣稱女生不可能創作音樂',
    '只列作曲家的出生年份，不安排任何可參與的活動',
    '要求女生先證明自己已是專家，才准參加入門課',
  ],['可見榜樣與實作一起改善「我也屬於這裏」的感覺。','強化原本已存在的排斥訊息。','資訊沒有轉為榜樣或親身經驗。','入門課不應以已有專家能力作門檻。'],[7,8,9],'原文主張在大學選科前提供女性榜樣與實作項目，避免缺乏歸屬感自行加深。'),
  transfer('某運動隊允許女孩加入，但教練總說她們「大概跟不上」，很少讓她們上場。','哪項改善抓住範文對教師期望的區別？',[
    '除了准許參與，也要給女孩實際練習與被期望進步的機會',
    '只保留名義上的入隊資格，繼續否定她們能進步',
    '把所有女孩排除在練習外，卻稱這是公平鼓勵',
    '只增加隊服數量，不改教練語言或上場機會',
  ],['准許加入和真正相信能成功是兩個不同層次。','保留了原本影響信心的低期望。','排除練習與平等機會相反。','隊服不能取代練習及日常期望。'],[5,10],'原文強調女生不應只是「被容許」修讀科學，也要真心被期望能成功。'),
  transfer('一所大學已吸引更多鄉村學生申請，但入學後他們缺少導師，常感到孤立。','哪項轉用最完整？',[
    '在招生前提供外展資訊，也在入學後安排導師與可見支援',
    '只加強廣告，入學後一概取消導師和財政支援',
    '只指責學生不適應，不調查大學的支援環境',
    '要求鄉村學生獨自解決所有問題，並不准參加活動',
  ],['把選擇前的接觸與入學後的歸屬感接起來。','只處理申請，漏掉範文的大學環境措施。','忽略可由大學改善的條件。','會加重而非減少孤立。'],[8,11,12],'原文把早期外展和大學導師、獎學金及可見教員接成完整支援路徑。'),
  transfer('某程式設計營的宣傳只強調比賽排名，學生不知道程式也能用於醫療與環境。','哪項改法最像範文的招生形象建議？',[
    '同時展示合作、創意及社會用途，並給醫療與環境的實際例子',
    '只放大排名字樣，並刪去所有工作用途和合作例子',
    '宣稱設計程式完全不需要與其他人討論',
    '只展示昂貴電腦，不說明學生可以解決甚麼問題',
  ],['讓領域形象更完整，避免只呈現技術競爭。','維持範文要修正的過窄形象。','否定合作這個被忽略面向。','設備價格不能展示領域的社會價值。'],[9,13],'原文說科學宣傳應呈現合作、創意與社會價值，並提供不同職業例子。'),
  transfer('一個閱讀計畫發現男生較少借書；有人即時斷定「男生天生不喜歡閱讀」。','哪項研究次序最符合範文？',[
    '先檢查早期鼓勵、可見榜樣及借書環境，再判斷主要原因',
    '把借書數直接當作天生能力的證明，不需調查',
    '只詢問書本價格，完全不看教師與同伴的期待',
    '只改借書卡形狀，不處理是否有人感到不屬於',
  ],['把參與結果與形成選擇的條件分開。','以結果倒推天生原因，範文已警惕這種做法。','少看了本文核心的期待與榜樣機制。','卡形狀不能直接修正歸屬感。'],[0,1,2,7],'原文先排除能力作主要解釋，再追溯期待和歸屬感。'),
  transfer('一個社區護理課程想吸引較少年男性參加，並避免把護理描述成只適合女性。','哪項轉用更忠於範文？',[
    '展示不同性別的實務榜樣與工作內容，讓人親身接觸課程',
    '用相反刻板印象說男性必然不懂照顧別人',
    '只增加招生口號，不讓學生看見工作內容或導師',
    '規定某一性別不得申請，以便表面比例更穩定',
  ],['把榜樣、真實工作和可參與機會移到新領域。','以偏見代替範文的去刻板印象原則。','只換口號缺少實作與榜樣。','排除申請者會加重不平衡。'],[4,9,13],'原文要改變領域的單一性別形象，並以實作和榜樣擴闊選擇。'),
  transfer('某課程在中學最後一年才介紹科學職業，但很多學生早已選好科目。','哪項時間安排最能轉用範文？',[
    '把職業講座和實作項目提前到選科前，讓學生有時間形成興趣',
    '等學生完成大學學位後才第一次介紹可申請的課程',
    '只在選科後展示榜樣，並禁止調整任何既定安排',
    '因為學生已作決定，便取消全部早期接觸活動',
  ],['把介入放在選擇固定前，而非只在決定後宣傳。','完全錯過可影響選擇的時間。','選科後才接觸難以改變早期路徑。','取消早期活動與範文目標相反。'],[2,8,9],'原文指出有效解方要在大學選擇固定前介入。'),
  transfer('大學女學生申請率上升，但仍有學生表示課堂中找不到同伴或可請教的女性教員。','哪項措施最直接回應此階段問題？',[
    '安排導師與可見女性教員，讓入學者知道可向誰求助',
    '只重播招生廣告，完全不處理入學後的孤立感',
    '把所有教員資料隱藏，讓學生自行猜測誰可提供支援',
    '把課堂孤立視為學生個人問題，不建立任何同伴網絡',
  ],['針對已入學的歸屬感與可接觸支援。','廣告不能代替實際學習環境。','隱藏教員會減少可見榜樣。','拒絕提供支援，與範文大學方案相反。'],[11,12],'原文要求大學以導師、獎學金和可見女性教員減少孤立。'),
  transfer('一篇文章前文已解釋早期刻板印象和榜樣不足，後文提出中學鼓勵與大學支援；現在需要結尾。','哪項結尾最貼近範文？',[
    '先歸納早期觀念與歸屬感的成因，再概括及早鼓勵、榜樣和大學支援',
    '宣稱人數差距不存在，然後只重複未討論的考試日期',
    '只列一位科學家的姓名，不回答原因或如何改善',
    '把早期刻板印象說成唯一不需證據的天生能力差異',
  ],['結尾按成因和解方兩問收束，且保留「主要」而非唯一原因。','推翻已建立的問題並引入無關因素。','缺少對題目兩問的回答。','與前文所排除的能力說相矛盾。'],[14,15],'原文結尾以 largely rooted in 概括主要成因，再以 can be narrowed through 回應解方。'),
];
export default {key:'cause-solution:7',meta:{topic:'大學科學課程性別比例失衡',summary:'早期社會期望和缺少可見女性榜樣影響信心；選科前鼓勵與入學後支援可縮小差距。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
