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
    '先查早期接觸與練習機會，別把人數當能力證據',
    '只比較學會人數，不查誰曾獲邀參加初階活動',
    '只問考試成績，不看早期接觸機械人的機會',
    '只增加高年級比賽，不改善初階活動的參與',
  ],['把機會差異、信心與參與相連，避免用結果倒推能力。','人數只顯示現象，初階參與機會才可能解釋差距。','考試成績不足以判定早期接觸機會是否公平。','高年級比賽未修正初階活動的邀請差距。'],[1,2,5,6],'原文說差距主要不是能力問題，而與早期期待和接觸機會相關。'),
  transfer('一項青年音樂計畫只展示男性作曲家，女生很少看見與自己相似的導師。','哪項方案最能轉用範文的榜樣機制？',[
    '增加女性作曲家與導師的可見度，並讓女生親身試作曲',
    '只增加女性海報，不讓學生接觸真實導師或作品',
    '只開一次女性作品展，不安排女生親身嘗試創作',
    '只增加作曲課名額，不展示女性榜樣的多種可能性',
  ],['可見榜樣與實作一起改善「我也屬於這裏」的感覺。','海報可提升可見度，但真實導師與作品接觸更完整。','作品展有用，但未讓女生親身練習作曲。','名額有用，但缺少看得見的女性榜樣。'],[7,8,9],'原文主張在大學選科前提供女性榜樣與實作項目，避免缺乏歸屬感自行加深。'),
  transfer('某運動隊允許女孩加入，但教練總說她們「大概跟不上」，很少讓她們上場。','哪項改善抓住範文對教師期望的區別？',[
    '不只准參與，還要給女孩練習和進步機會',
    '只維持入隊資格，不改教練對女孩能力的低預期',
    '只說女孩有潛力，不安排練習和上場機會',
    '只增加隊服與宣傳，不處理教練的日常語言',
  ],['准許加入和真正相信能成功是兩個不同層次。','允許加入只是名義機會，教練低預期仍會限制進步。','口頭肯定未轉成練習與上場機會。','宣傳未改變教練日常語言及實際參與。'],[5,10],'原文強調女生不應只是「被容許」修讀科學，也要真心被期望能成功。'),
  transfer('一所大學已吸引更多鄉村學生申請，但入學後他們缺少導師，常感到孤立。','哪項轉用最完整？',[
    '招生前先外展，入學後安排導師和實際支援',
    '只擴大鄉村招生，不提供入學後的導師和支援',
    '只安排入學輔導，不處理申請前的外展不足',
    '只提高申請名額，不檢查學生入學後的孤立',
  ],['把選擇前的接觸與入學後的歸屬感接起來。','擴招只處理入學前，孤立與缺少導師仍在。','入學輔導有用，但仍要考慮申請前的接觸機會。','名額增加不等於入學後有支援。'],[8,11,12],'原文把早期外展和大學導師、獎學金及可見教員接成完整支援路徑。'),
  transfer('某程式設計營的宣傳只強調比賽排名，學生不知道程式也能用於醫療與環境。','哪項改法最像範文的招生形象建議？',[
    '展示合作創意與社會用途，配醫療環境例子',
    '只突出比賽名次，不展示程式可處理的社會問題',
    '只展示醫療用途，不安排實際合作或創作活動',
    '只換宣傳圖片，不讓學生看見工作內容的多樣',
  ],['讓領域形象更完整，避免只呈現技術競爭。','只看排名，未展示程式的合作、創意和社會用途。','醫療例子有用，但漏了親身合作創作的可能。','換圖無法單獨讓學生理解工作內容的多樣。'],[9,13],'原文說科學宣傳應呈現合作、創意與社會價值，並提供不同職業例子。'),
  transfer('一個閱讀計畫發現男生較少借書；有人即時斷定「男生天生不喜歡閱讀」。','哪項研究次序最符合範文？',[
    '查早期鼓勵、榜樣與借書環境，再判原因',
    '只以借書數推斷天生能力，不調查早期鼓勵',
    '只檢查書價，不問榜樣和同伴期待的影響',
    '只改善圖書館裝潢，不問男生是否感到屬於',
  ],['把參與結果與形成選擇的條件分開。','借書數不能直接證明天生能力，還須查早期環境。','書價可能影響選擇，但榜樣與同伴期待也重要。','裝潢未處理對閱讀歸屬感的疑問。'],[0,1,2,7],'原文先排除能力作主要解釋，再追溯期待和歸屬感。'),
  transfer('一個社區護理課程想吸引較少年男性參加，並避免把護理描述成只適合女性。','哪項轉用更忠於範文？',[
    '展示不同性別榜樣和工作內容，安排接觸課程',
    '只改招生語句，不讓男生接觸護理導師與實際工作',
    '只展示男性榜樣，不解釋護理工作的具體內容',
    '只增加名額，不檢查學習環境是否仍有刻板印象',
  ],['把榜樣、真實工作和可參與機會移到新領域。','改語句不足以建立實際接觸導師與工作的機會。','榜樣有用，但還須讓學生認識實際工作。','名額增加未處理環境中的刻板印象。'],[4,9,13],'原文要改變領域的單一性別形象，並以實作和榜樣擴闊選擇。'),
  transfer('某課程在中學最後一年才介紹科學職業，但很多學生早已選好科目。','哪項時間安排最能轉用範文？',[
    '選科前安排職業講座與實作，讓興趣有時間形成',
    '只在選科當天介紹職業，學生沒有時間形成興趣',
    '只在大學入學後提供實作，忽略中學選科之前',
    '只提前派發單張，不安排職業接觸或嘗試機會',
  ],['把介入放在選擇固定前，而非只在決定後宣傳。','選科當天才介紹，學生缺少形成興趣的時間。','大學實作太晚，無法影響中學選科。','單張能傳資訊，但缺少講座和實作接觸。'],[2,8,9],'原文指出有效解方要在大學選擇固定前介入。'),
  transfer('大學女學生申請率上升，但仍有學生表示課堂中找不到同伴或可請教的女性教員。','哪項措施最直接回應此階段問題？',[
    '安排導師與可見女性教員，讓入學者知道可向誰求助',
    '只增加申請廣告，不回應已入學學生的孤立感',
    '只安排同伴活動，不提供可請教的女性專業教員',
    '只展示女性教員照片，不建立可接觸的導師支援',
  ],['針對已入學的歸屬感與可接觸支援。','申請廣告處理招生，沒有處理已入學的孤立。','同伴活動有用，但題目還指出缺少女性教員。','照片提供可見度，仍需真正可接觸的支援。'],[11,12],'原文要求大學以導師、獎學金和可見女性教員減少孤立。'),
  transfer('一篇文章前文已解釋早期刻板印象和榜樣不足，後文提出中學鼓勵與大學支援；現在需要結尾。','哪項結尾最貼近範文？',[
    '總結早期觀念與歸屬，再提鼓勵榜樣與大學支援',
    '只歸納早期觀念，不提入學後的支援安排',
    '只列鼓勵措施，不回扣刻板印象和榜樣不足',
    '只概括差距現象，沒有連結原因與相配解方',
  ],['結尾按成因和解方兩問收束，且保留「主要」而非唯一原因。','只談成因，漏了中學與大學不同階段的措施。','只列措施，未回扣它們針對的早期原因。','只描述差距，沒有完成原因與解方的收束。'],[14,15],'原文結尾以 largely rooted in 概括主要成因，再以 can be narrowed through 回應解方。'),
];
export default {key:'cause-solution:7',meta:{topic:'大學科學課程性別比例失衡',summary:'早期社會期望和缺少可見女性榜樣影響信心；選科前鼓勵與入學後支援可縮小差距。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
