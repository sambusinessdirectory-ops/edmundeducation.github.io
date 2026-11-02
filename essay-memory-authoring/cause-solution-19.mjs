// Reviewed Cause/Solution 19: why capable teachers avoid rural schools and how to retain them.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-19-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:19'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'In many countries with fewer resources, children in areas outside cities fall behind because there are too few good teachers, not because they cannot learn well.',
 'This mainly happens because conditions at work are bad and teachers see few ways to move forward in their jobs; better rewards and support can help.',
 'One main reason good teachers avoid areas outside cities is that these jobs can make life and work difficult.',
 'Many schools outside cities do not have enough equipment, good transport, suitable places to live or teaching materials, so even teachers who care about the job may feel unable to do it well.',
 'For example, a science teacher without a lab or steady internet and with too many pupils may find it hard to teach well, which may soon leave the teacher tired and upset.',
 'Another reason is that a job outside the city may seem bad for a teacher’s future work.',
 'In cities, teachers can often find training, experienced teachers, chances to move up and people in their field more easily.',
 'In comparison, a teacher outside the city may feel no one notices their work, however hard they try.',
 'To fix this, governments should first make teaching outside cities better paid and easier to manage in daily life.',
 'This might mean better pay, a free place to live, money for travel and a better chance of moving up later.',
 'These steps would do more than thank teachers; they would also show that schools outside cities matter to the whole country rather than being a bad place for a career.',
 'Also, teachers in areas outside cities need help often, not just a job agreement and a room to teach in.',
 'Governments and schools could offer guidance online, travelling training groups and links between city and schools outside cities so that teachers far from cities can keep building their skills.',
 'In the long run, training people from local areas to become teachers would help too, because they are more likely to know what local children need and to stay there.',
 'To sum up, good teachers often avoid schools outside cities because daily conditions are hard and there are few ways to move ahead in their careers.',
 'Better rewards, more training and clearer ways to move up would help schools outside cities keep teachers and give children more chances to learn well.',
];
const vocabulary=[
 [['developing countries','countries with fewer resources','發展中國家'],['rural communities','areas outside cities','農村社區'],['held back','fall behind','發展受阻'],['a shortage of high-quality teachers','too few good teachers','優質教師不足']],
 [['largely caused by','mainly happens because','主要由此造成'],['poor working conditions','conditions at work are bad','工作條件欠佳'],['limited career prospects','few ways to move forward in their jobs','職業前景有限'],['targeted incentives','better rewards','有針對性的獎勵']],
 [['major reason','main reason','主要原因'],['skilled teachers','good teachers','優秀教師'],['rural areas','areas outside cities','農村地區'],['serious personal and professional disadvantages','make life and work difficult','個人及職業上的重大不利因素']],
 [['rural schools','schools outside cities','農村學校'],['lack basic facilities','do not have enough equipment','缺乏基本設施'],['reliable transport','good transport','可靠交通'],['proper accommodation','suitable places to live','合適住宿'],['committed teachers','teachers who care about the job','有熱誠的教師']],
 [['For example','For example','例如'],['no laboratory','without a lab','沒有實驗室'],['no stable internet connection','steady internet','穩定網絡'],['overcrowded classes','too many pupils','班級過度擠迫'],['deliver lessons effectively','teach well','有效授課']],
 [['Another reason','Another reason','另一原因'],['rural appointments','a job outside the city','農村職位'],['damage','bad for','損害'],['long-term career','future work','長遠職業發展']],
 [['In cities','In cities','在城市'],['better access to','find','較易獲得'],['senior colleagues','experienced teachers','資深同事'],['promotion opportunities','chances to move up','晉升機會'],['professional networks','people in their field','專業人脈']],
 [['By contrast','In comparison','相比之下'],['a rural teacher','a teacher outside the city','農村教師'],['feel invisible','feel no one notices their work','覺得被忽視'],['no matter how hard','however hard','無論多努力']],
 [['To solve this problem','To fix this','解決問題'],['governments','governments','政府'],['rural teaching','teaching outside cities','農村教學'],['financially','better paid','在經濟上'],['practically attractive','easier to manage in daily life','實際安排更吸引']],
 [['could include','might mean','可以包括'],['higher salaries','better pay','更高薪酬'],['free housing','a free place to live','免費住宿'],['transport allowances','money for travel','交通津貼'],['priority access to future promotions','a better chance of moving up later','日後優先晉升']],
 [['Such measures','These steps','這些措施'],['not merely reward','do more than thank','不只是獎勵'],['signal','show','表明'],['national priority','matter to the whole country','國家優先事項'],['professional dead end','a bad place for a career','職業發展的死路']],
 [['In addition','Also','此外'],['rural teachers','teachers in areas outside cities','農村教師'],['regular support','help often','定期支援'],['a contract','a job agreement','合約'],['a classroom','a room to teach in','課室']],
 [['provide online mentoring','offer guidance online','提供網上指導'],['mobile training teams','travelling training groups','流動培訓團隊'],['partnerships between urban and rural schools','links between city and schools outside cities','城鄉學校合作'],['remote areas','far from cities','偏遠地區'],['improve their skills','keep building their skills','提升技能']],
 [['Over time','In the long run','長遠而言'],['local teacher-training programmes','training people from local areas to become teachers','本地教師培訓'],['understand local needs','know what local children need','理解當地需要'],['remain there','stay there','留在當地']],
 [['In conclusion','To sum up','總結來說'],['rural schools','schools outside cities','農村學校'],['the conditions are difficult','daily conditions are hard','工作生活條件艱難'],['career rewards are limited','few ways to move ahead in their careers','職業回報有限']],
 [['Better incentives','Better rewards','更好的激勵措施'],['stronger training','more training','更強培訓'],['clearer career pathways','clearer ways to move up','清晰的職業路徑'],['more sustainable','keep teachers','更可持續'],['access to quality education','chances to learn well','接受優質教育的機會']],
];
export {original,simple,vocabulary};
function frame(i,links,labels,meaning,usage,example,tag,job){
 const value=original[i],parts=[];let cursor=0,slot=0;
 for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error('Missing fixed wording '+(i+1)+': '+link);
  if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
  parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
 if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
 if(slot!==labels.length)throw Error('Unmatched slot labels '+(i+1));
 return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
 frame(0,['not by ', ', but by '],['某群體受阻的現象','常被誤認的原因','真正需要處理的原因'],'not by...but by 先排除錯誤解釋，再指出真正障礙。','需要更正讀者對問題成因的直覺判斷，並提出更有根據的原因時。','The delay was caused not by laziness, but by a lack of equipment.','not by...but by','排除誤因並指出真因'),
 frame(1,[' is largely caused by ', ', and it can be addressed through '],['待分析的問題','兩項主要成因','對應的解決方向'],'largely caused by 保留其他原因的可能；addressed through 接出可行解法。','引言要同時預告主要成因和解法，並避免聲稱只有一種原因時。','The shortage is largely caused by low pay, and it can be addressed through better training.','caused by...addressed through','總覽成因及解法'),
 frame(2,[' is that '],['值得解釋的主要原因','該原因的具體內容'],'is that 把段首原因寫成完整判斷，供後文展開。','主體段需要明確提出一項可以用細節和例子驗證的原因時。','One major reason staff leave is that shifts are unpredictable.','is that','直接提出可展開的原因'),
 frame(3,[', so '],['學校缺少資源的具體情況','教師工作受阻的結果'],'so 由可觀察的資源不足推到執行工作時的困難。','先列出造成障礙的條件，再說明它對行動者造成甚麼後果時。','The clinic lacks equipment, so even skilled doctors struggle to help.','so','把條件連到後果'),
 frame(4,['For example, ', ', which can '],['具體人物及其工作困難','困難可能帶來的後續影響'],'For example 給出可想像的個案；which can 接上連鎖後果。','抽象原因已提出，需要用具體人物展示困難如何累積時。','For example, a nurse without basic supplies may struggle, which can lead to burnout.','For example...which can','用個案展示連鎖影響'),
 frame(5,['Another reason is that '],['另一個可獨立分析的原因'],'Another reason is that 將論證轉到第二個不同原因。','第一項原因已講清楚，現在要改談另一條機制時。','Another reason is that new staff see few chances to advance.','Another reason is that','切換至第二成因'),
 frame(6,['In cities, '],['城市中較易得到的職業資源'],'In cities 限定比較的一邊，為下一句對比鋪墊。','要比較兩種工作環境，先交代其中一方能得到甚麼資源時。','In cities, nurses can meet experienced colleagues more often.','In cities','建立環境比較的第一邊'),
 frame(7,['By contrast, ', ', no matter how '],['相反環境中的感受','努力也難改變的限制'],'By contrast 對照上一句；no matter how 表示努力程度不一定能消除差距。','已介紹一邊較有利的條件，接着要指出另一邊即使努力仍受限制時。','By contrast, a remote worker may feel isolated, no matter how hard she works.','By contrast...no matter how','對比條件與努力'),
 frame(8,['To solve this problem, ', ' should first '],['負責採取行動的一方','優先執行的解法'],'To solve this problem 指向前文問題；should first 指定第一步及責任方。','成因分析後，需要指出由誰優先採取甚麼行動時。','To solve this problem, councils should first improve public transport.','should first','指定解法的第一責任方'),
 frame(9,['This could include '],['可以採用的具體措施'],'This could include 把抽象解法拆成可執行項目，同時保留選擇空間。','已提出一項方向，需要列出幾個具體做法而不把清單說成唯一方案時。','This could include better pay, free training and safe housing.','could include','列出非排他的具體措施'),
 frame(10,[' would not merely ', '; they would also '],['採取的措施','措施的直接作用','措施所傳達的更廣泛訊息'],'not merely...also 表明措施除了直接效果，還有制度訊號。','要說明一項措施除了眼前效益，還如何改變更廣泛的看法或誘因時。','The grants would not merely save costs; they would also show that the work matters.','not merely...also','補充更深一層的制度作用'),
 frame(11,['In addition, ', ', not just '],['還需要的實質支援','單有卻不足夠的形式安排'],'In addition 加入解法第二部分；not just 排除形式上已聘用就算完成的想法。','已有一項措施，但還需要指出形式安排以外的持續支援時。','In addition, new nurses need guidance, not just a contract.','In addition...not just','補上形式安排以外的支援'),
 frame(12,[', so that '],['機構提供的支援措施','希望讓受助者達成的目的'],'so that 清楚連接具體措施與希望實現的能力提升。','解法清單已列出，要說明這些安排讓受助者能夠做甚麼時。','Schools can offer mentors and workshops, so that new teachers can keep improving.','so that','連接措施與目的'),
 frame(13,['Over time, ', ', because '],['長期可持續的安排','此安排有效的原因'],'Over time 指出長期策略；because 補上支持該策略的原因。','短期措施之後，要提出可持續做法並解釋其作用機制時。','Over time, training local workers would help, because they know the community.','Over time...because','提出長期策略及理由'),
 frame(14,['In conclusion, ', ' because '],['問題或現象的總結','已分析的兩項成因'],'because 在結尾用已論證的原因支撐總結，不引入新主張。','結尾要把問題和前文主要成因收束成一句清楚的判斷時。','In conclusion, staff leave because conditions are hard and prospects are weak.','In conclusion...because','收束問題及主因'),
 frame(15,[' would ', ' and '],['共同採取的幾類改善','工作得以持續的結果','受益者得到的第二結果'],'would 表示措施預期效果；and 同時寫出服務提供者與受益者的兩層收益。','結論要把多項措施連到工作穩定及最終受益者的改善時。','Better pay and training would retain nurses and improve patient care.','would...and','連結措施與雙層成果'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+target.tag+'」'+target.job+'。'),answerReason:'示例用「'+target.tag+'」'+target.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的成因與解決方向，順序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('範文認為農村兒童教育受阻的核心問題是甚麼？',['優質教師不足，而不是兒童缺乏學習能力','農村兒童都不願意學習','所有教師都拒絕教科學','城市學校完全沒有任何師資'],'引言用 not by...but by 明確區分錯誤歸因與真正障礙。'),
 quiz('文章提出哪兩類主要成因？',['工作生活條件欠佳，以及長遠職業發展機會有限','只有學生數目太少，以及課室太大','只有城市交通太便利','農村教師全部缺乏專業資格'],'主體段先談設備、住宿與工作條件，再談培訓晉升及專業人脈。'),
];
const route=[sequence('由師資短缺成因到留任解法',[
 ['引言：真正的障礙','農村兒童的能力不是問題；優質教師不足才是重點。'],
 ['原因一：工作條件欠佳','設備、交通、住宿與教材不足，使好教師也難有效教學。'],
 ['原因二：發展機會有限','城市較易得到培訓與晉升；農村教師可能覺得努力沒被看見。'],
 ['解法一：改善待遇','提高薪酬，提供住宿、交通津貼及晉升機會。'],
 ['解法二：持續支援','網上指導、流動培訓和城鄉合作，加上長期培養本地教師。'],
],'先辨別生活與職業發展兩條成因，再把待遇及專業支援對應起來。')];
const evidence=[
 quiz('為何單說「教師要更有熱誠」不能解決第一項成因？',['即使教師有熱誠，缺乏設施、交通、住宿及教材仍會妨礙教學','範文說農村所有教師都完全沒有熱誠','熱誠可以即時建成實驗室','只要有合約就不需要任何教材'],'文章明說 even committed teachers 也可能因資源不足而難以做好工作。'),
 quiz('科學教師的例子如何支撐工作條件的論點？',['沒有實驗室、穩定網絡和合理班級規模，可能令授課困難並導致倦怠','只要班級擠迫，科學知識就會自動增加','教師不應該用實驗室授課','例子只比較教師的薪金'],'例子把資源不足連到教學困難，再連到挫敗及倦怠。'),
 quiz('城市工作環境對教師的長遠發展有甚麼優勢？',['較易接觸培訓、資深同事、晉升機會及專業網絡','城市學校不需要任何教師培訓','農村教師一定得到最多晉升','城市課室必然沒有學生'],'這四項資源支撐範文的第二個成因。'),
 quiz('為何單提供高薪仍不足以回應全文？',['教師還需要持續指導、培訓和清楚的職業前景','範文主張完全取消薪酬','合約和課室本身已包括所有專業支援','工作條件與職業發展永遠無關'],'文章的解法分為待遇與長遠專業支援兩方面。'),
 quiz('網上指導和城鄉學校合作的直接目的是甚麼？',['讓偏遠地區教師持續提升教學技能','讓所有教師停止授課','只讓城市學校得到補助','用網絡取代全部課室'],'so that 後面的目的正是偏遠教師仍可持續進修。'),
 quiz('為甚麼培養本地教師有助長期留任？',['本地出身的教師較可能理解社區需要，亦較可能留下來','所有外來教師都一定不懂教書','本地教師不需要任何培訓','培養本地教師能立即消除全部交通問題'],'範文用 because 明確連接對本地需要的理解與留任可能性。'),
];
const logic=[
 sequence('資源不足如何變成師資流失壓力',[
 ['學校欠缺必要條件','設施、交通、住宿和教材都可能不足。'],
 ['教師難以有效教學','科學教師可能沒有實驗室，還要面對擠迫班級。'],
 ['挫敗與倦怠增加','熱誠不能單獨消除資源帶來的阻礙。'],
 ['農村職位吸引力下降','好教師更可能避開缺乏支援的職位。'],
 ],'這條因果鏈由可觀察的工作條件出發，避免把問題歸咎於兒童或教師的能力。'),
 sequence('待遇與專業支援怎樣共同留人',[
 ['改善實際工作生活','薪酬、住宿及交通津貼減少接任農村職位的成本。'],
 ['指出職業發展道路','晉升安排讓農村職位不再像職業死路。'],
 ['持續提供專業支援','指導、培訓及城鄉合作讓教師能進步。'],
 ['培養本地師資','熟悉社區的人才較可能長期留下。'],
 ],'短期誘因及長期職業支援需對應文章提出的兩類障礙。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('某偏遠診所招聘不到護士。管理者說當地病人不重視健康，所以不值得改善診所。','哪項論證最能轉用範文的開頭？',['先檢查人手短缺是否由工作條件造成，而不把責任直接推給病人','因為是偏遠地區，病人必然不願意接受治療','招聘問題只可能由病人年齡造成','只要診所換名稱便能吸引所有護士'],['原文先排除把教育問題歸咎於兒童能力，再指出師資不足。','沒有證據支持對病人的概括。','忽略工作條件這項可查的成因。','名稱改變不等於工作環境改善。'],[0,1],'原文用 not by...but by 更正對問題成因的誤判。'),
 transfer('一所偏遠學校薪金正常，但沒有穩定交通、合適住宿及基本教具。','哪項解釋最貼近範文？',['這些日常條件會使有熱誠的教師也難以有效工作','只要薪金正常，教師便不需要任何教具','交通和住宿只影響學生的考試卷顏色','教師只要努力就能立即修好全部設施'],['文章明確把實際資源不足連到教師難以發揮。','忽略題目已列出的資源缺口。','與招聘和教學機制無關。','把制度條件全部歸給個人。'],[2,3],'原文指出即使是有熱誠的教師，也會受工作條件限制。'),
 transfer('一名偏遠地區科學教師沒有實驗室，還要教過度擠迫的班級；數月後開始感到倦怠。','哪項因果鏈有文本依據？',['資源不足使課堂難以有效進行，長期挫敗可累積為倦怠','倦怠證明教師一定沒有科學知識','沒有實驗室一定讓所有課堂更精彩','班級大小和教學效果不可能有關'],['原文的科學教師例子正連接工作限制與挫敗倦怠。','沒有足夠證據推論教師能力。','與例子描述相反。','忽略過度擠迫的已知限制。'],[3,4],'原文的個案說明具體限制如何引出後續壓力。'),
 transfer('某社區願意提供高薪，但偏遠教師多年沒有進修或晉升機會。','若要回應範文的第二項成因，應補甚麼？',['定期培訓、資深同事指導和清楚的晉升途徑','只在招聘廣告上把薪金字體放大','完全取消所有專業交流','要求教師無論工作多年都維持原職'],['第二成因是長遠職業發展受限，需要成長和晉升資源。','只重複已有薪金措施。','會進一步削弱專業發展。','正好延續第二成因。'],[5,6,7],'原文用城市較多培訓與晉升機會，對比農村教師的處境。'),
 transfer('一個偏遠地區消防站提高了職員津貼，卻沒有提供安全裝備或在職訓練。','哪項批評最能轉用文章的雙重解法？',['津貼能減少一些成本，但仍需裝備和持續培訓，才可讓職員安全地工作與成長','只要津貼足夠，所有安全裝備都可取消','在職訓練只適用於城市教師','消防工作與工作條件沒有任何關係'],['原文把實際待遇與專業支援分開處理，兩者都不可省略。','以金錢取代必要的工作支援。','錯把可轉用的原則限定在原題。','忽略情境中的安全限制。'],[8,9,11,12],'原文先改善待遇，再要求定期專業支援。'),
 transfer('教育部提出免費住宿和交通津貼，卻說農村教育仍是教師職涯的終點。','依範文，政策還缺少甚麼訊號？',['清楚的晉升安排，讓教師知道農村任職不是職業死路','宣稱住宿會自動消除所有升遷需求','取消全部城鄉學校合作','只買更多教室桌椅，不談職涯'],['原文說措施亦應表明農村教育受到重視，並非職涯死路。','忽略長期誘因。','與專業支援方向相反。','沒有回應職涯疑慮。'],[9,10],'原文用 not merely...also 說明措施的直接效益與制度訊號。'),
 transfer('偏遠醫院開始使用線上導師和巡迴培訓團隊。文章要再補一句說明這些措施為何有效。','哪句最好？',['這些安排讓遠離城市的醫護人員仍能持續提升技能','因此所有醫院都不再需要病人','所以導師應停止與新人交流','這些團隊只為了使城市職員更少訓練'],['so that 連接支援形式與受助者的能力提升。','目的與措施無關。','與導師安排相反。','忽略偏遠職員的需求。'],[11,12],'原文把線上指導和流動培訓連到偏遠教師的技能提升。'),
 transfer('某地區每年都靠短期外來人員填補師資缺口，卻沒有培訓本地青年。','哪個長期策略符合範文？',['建立本地教師培訓，讓熟悉社區需要的人才更可能留任','永遠只依賴下一批短期外來人員','取消對本地學生的全部培訓','只把學校外牆塗上新顏色'],['原文把本地師資培養作為較長期的留任安排。','沒有建立可持續的人才來源。','與長期策略相反。','外觀不能直接補足師資。'],[13],'原文說本地出身教師較理解需要，也較可能留在當地。'),
 transfer('另一篇文章討論偏遠地區醫護流失，作者只寫「應提高薪水」一句。','如何借用範文的論證結構？',['先分開工作生活條件及發展機會兩項成因，再提出待遇與專業支援兩類措施','只重複提高薪水，不分析原因','把病人歸咎為唯一成因','只討論城市交通有多方便'],['原文清楚區分兩項成因及兩類相應解法。','漏掉職涯與支援問題。','與文中更正錯誤歸因的方法相反。','不構成完整成因解法。'],[0,1,2,5,8,11],'原文以兩條成因和配套解法形成完整文章路線。'),
 transfer('文章結尾已寫明偏遠學校的生活條件與升遷機會不足，還需一句收束解法。','哪項結尾最完整？',['改善待遇、培訓及職涯路徑，才能讓教師願意留下並讓兒童得到更好的教育','只說所有問題必定明天消失','突然討論與教育無關的旅遊廣告','只要求兒童自己招聘教師'],['原文結尾同時回收措施、留任及學生受益三層結果。','過度保證政策效果。','與題目無關。','把成人與制度責任推給兒童。'],[14,15],'原文以措施、師資可持續及兒童教育成果收尾。'),
];
export default {key:'cause-solution:19',meta:{topic:'發展中國家農村學校難以吸引優秀教師',summary:'師資短缺源於實際工作條件與職涯前景；待遇、持續培訓和本地師資培養需配合。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
