// Gap-year volunteering abroad: joined source sentences, respectful cause-and-effect practice.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:3'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'More students now spend a year before university helping people in countries with fewer resources.',
 'This can be hard on their feelings and studies. Even so, I think it is very good for young people because it helps them grow up and understand society more deeply than staying home would.',
 'The main benefit is that young people grow up faster.',
 'When young volunteers live abroad, they have to manage their money, solve daily problems and speak in unfamiliar places without parents or teachers helping them each day.',
 'This helps them act on their own, deal with change and recover from difficulties. These skills help at university and at work.',
 'For example, a student helping to give out food may have to deal with late transport, too few supplies and language problems every day.',
 'Another benefit is that this work helps young people think more deeply about others and the world.',
 'Seeing poor schools, poor toilets and unsafe water or too little medical care themselves makes world problems feel real and personal.',
 'So many young people understand others’ needs better and know more clearly what they want to do next.',
 'For example, someone who helps at a country clinic may come home wanting to study medicine, public health or international development.',
 'But there are also serious problems.',
 'One problem is the strong feelings caused by working with communities facing poverty, illness or painful events.',
 'Many teenagers have not faced such suffering before. Seeing it often may leave them sad, guilty or unable to cope instead of eager to help.',
 'For example, a volunteer in a children’s home may become close to the children and find saying goodbye very painful.',
 'Another problem is that a year away can make it harder to restart studying.',
 'After many months away from school, some students find lectures, due dates and exams hard again, especially when university courses need full attention from day one.',
 'For example, someone returning from a year of building or community work may find essay writing and exam study harder than expected.',
 'To sum up, volunteering abroad can be emotionally hard and can interrupt study habits for young people.',
 'Still, it is very valuable because few other experiences build independence, a wider view and clear long-term goals as well.',
];
const vocabulary=[
 v(['increasingly common','More students now','愈來愈常見'],['school-leavers','students','中學畢業生'],['gap year','a year before university','大學前空檔年'],['charitable work','helping people','公益工作'],['less developed countries','countries with fewer resources','資源較少的國家']),
 v(['emotional and academic difficulties','hard on their feelings and studies','情緒及學業困難'],['ultimately a highly positive experience','very good for young people','整體高度正面'],['develops maturity','helps them grow up','促進成熟'],['far deeper understanding of society','understand society more deeply','更深入理解社會']),
 v(['primary advantage','main benefit','主要好處'],['accelerated personal growth','grow up faster','較快成熟成長']),
 v(['young volunteers','young volunteers','年輕義工'],['must budget','have to manage their money','須管理預算'],['solve practical problems','solve daily problems','解決實際問題'],['unfamiliar settings','unfamiliar places','陌生環境'],['without the daily support','without parents or teachers helping them each day','沒有日常支援']),
 v(['self-reliant','act on their own','自立'],['adaptable','deal with change','能適應'],['resilient','recover from difficulties','有韌性'],['precisely the qualities needed','These skills help','正是所需能力']),
 v(['organise food distribution','give out food','安排食物分發'],['cope with','deal with','應對'],['transport failures','late transport','交通失靈'],['limited resources','too few supplies','資源不足'],['language barriers','language problems','語言障礙']),
 v(['second benefit','Another benefit','另一好處'],['broadens moral and intellectual perspective','think more deeply about others and the world','擴闊道德及思想視野']),
 v(['inadequate schooling','poor schools','學校資源不足'],['poor sanitation','poor toilets and unsafe water','衞生條件差'],['limited medical care','too little medical care','醫療不足'],['at first hand','themselves','親眼所見'],['concrete human realities','real and personal','具體人間處境']),
 v(['As a result','So','因此'],['socially aware','understand others’ needs better','社會意識更高'],['more purposeful about their future','know more clearly what they want to do next','未來方向更清晰']),
 v(['rural clinic','country clinic','鄉村診所'],['for instance','For example','例如'],['return home determined to study','come home wanting to study','回國後有意修讀'],['public health or international development','public health or international development','公共衞生或國際發展']),
 v(['However','But','然而'],['undeniable disadvantages','serious problems','不可否認的缺點']),
 v(['emotional strain','strong feelings','情緒壓力'],['communities affected by poverty','communities facing poverty','受貧窮影響的社區'],['illness or trauma','illness or painful events','疾病或創傷']),
 v(['psychologically inexperienced','have not faced such suffering before','心理經驗不足'],['constant exposure to suffering','Seeing it often','經常目睹苦難'],['distressed, guilty or overwhelmed','sad, guilty or unable to cope','痛苦、內疚或不知所措'],['rather than inspired','instead of eager to help','而非受到鼓舞']),
 v(['orphanage','children’s home','兒童院舍'],['form strong attachments','become close to the children','建立深厚感情'],['eventual separation','saying goodbye','最終分離'],['deeply upsetting','very painful','非常難過']),
 v(['Another drawback','Another problem','另一缺點'],['weaken academic momentum','make it harder to restart studying','削弱學習動力']),
 v(['outside formal education','away from school','離開正規教育'],['struggle to readjust','find lectures, due dates and exams hard again','難重新適應'],['deadlines and examinations','due dates and exams','限期與考試'],['intense concentration from the outset','full attention from day one','一開始就高度專注']),
 v(['school-leaver','someone','中學畢業生'],['construction or community projects','building or community work','建築或社區項目'],['essay writing and exam preparation','essay writing and exam study','寫論文及備考'],['unexpectedly difficult','harder than expected','比預期困難']),
 v(['In conclusion','To sum up','總結'],['not an easy option','can be emotionally hard','並不容易'],['emotionally demanding','emotionally hard','情緒上要求高'],['interrupt study habits','interrupt study habits','打斷學習習慣']),
 v(['Even so','Still','儘管如此'],['profoundly worthwhile','very valuable','非常值得'],['few alternatives','few other experiences','鮮有其他經歷'],['cultivate independence','build independence','培養自立'],['long-term purpose','clear long-term goals','長遠目標感']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){
 const text=original[i],parts=[];let cursor=0,slotIndex=0;
 for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}
 if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));
 return {formula,meaning,usage,parts};
}
const specs=[
 {example:'It has become increasingly common for graduates to spend a gap year learning a language before entering university.',d:[2,10,14],relation:'引言交代空檔年趨勢、人物和大學前時間位置',formula:'It has become increasingly common for [群體] to spend a gap year [活動] before entering university',meaning:'愈來愈多中學畢業生大學前到資源較少的國家做公益。',usage:'背景句只交代現象；不要在此把公益工作自動說成有效。',links:['It has become increasingly common for ', ' to spend a gap year ', ' before entering university.'],labels:['群體','活動']},
 {example:'Although this choice can create emotional and academic difficulties, it is ultimately a positive experience because it builds practical skills.',d:[3,11,17],relation:'先承認情緒與學業代價，再用 because 給正面判斷理由',formula:'Although [難處], it is ultimately [判斷] because [核心理由]',meaning:'作者承認情緒和學業困難，但判斷整體有助成熟及理解社會。',usage:'一個主張中同時保留弊端與立場，正文須分別論證。',links:['Although ', ', it is ultimately ', ' because ','.'],labels:['可承認的難處','總體判斷','理由']},
 {example:'The primary advantage is practical independence.',d:[10,14,17],relation:'用簡短主題句點出第一個核心好處',formula:'The primary advantage is [核心好處]',meaning:'第一好處是更快的個人成長。',usage:'短句後緊接機制與例子，才成完整論證。',links:['The primary advantage is ','.'],labels:['核心好處']},
 {example:'When young volunteers live abroad, they must plan their days, solve transport problems and speak with unfamiliar people without the daily support of parents or teachers.',d:[1,5,12],relation:'列出身處陌生地時必須自行完成的三種行動',formula:'When [年輕人身處新環境], they must [幾項具體行動] without the daily support of [熟悉支援者]',meaning:'在海外要預算、解決問題、與陌生人溝通，缺少家長／老師日常支援。',usage:'成長機制需包含做了甚麼，以及為何需要自己做。',links:['When young volunteers live abroad, they must ', ' without the daily support of parents or teachers.'],labels:['自行應對的行動']},
 {example:'This pushes them to become more patient, resourceful and independent, which are precisely the qualities needed for university life and later employment.',d:[1,6,15],relation:'用 This 接續上句行動，再說可遷移到大學和工作的能力',formula:'This pushes them to become [能力一組], which are precisely the qualities needed for [後續場景]',meaning:'自立、適應、韌性可幫助大學生活與未來工作。',usage:'This 必須回指上一句可見的經歷；能力與後續場景要相符。',links:['This pushes them to become ', ', which are precisely the qualities needed for university life and later employment.'],labels:['形成的能力']},
 {example:'A student helping to organise a community library, for example, may need to cope with missing books, limited space and language barriers on a daily basis.',d:[3,8,16],relation:'以公益活動例子落實每日資源、交通或語言困難',formula:'A student helping to [公益工作], for example, may need to cope with [具體難題] on a daily basis',meaning:'協助分發食物時要處理交通失誤、資源有限及語言障礙。',usage:'例子應展示人如何練習前述解決問題能力，避免把困境當裝飾。',links:['A student helping to ', ', for example, may need to cope with ', ' on a daily basis.'],labels:['公益工作','具體難題']},
 {example:'A second benefit is the way such work builds a clearer view of other people’s lives.',d:[2,10,14],relation:'轉入第二好處：對社會與他人的理解',formula:'A second benefit is the way such work [擴闊的認識]',meaning:'公益工作可擴闊道德與思想視野。',usage:'此句需由下一句親身觀察的例子來支援。',links:['A second benefit is the way such work ','.'],labels:['認識上的好處']},
 {example:'Seeing the effects of flood damage at first hand turns abstract global issues into concrete human realities.',d:[3,8,15],relation:'用親身所見把抽象議題轉成具體人的處境',formula:'Seeing [具體處境] at first hand turns abstract global issues into concrete human realities',meaning:'親眼見教育、衞生、醫療不足，令全球議題不再抽象。',usage:'選具體可見處境而非籠統說「開眼界」。',links:['Seeing ', ' at first hand turns abstract global issues into concrete human realities.'],labels:['親身所見']},
 {example:'As a result, many young people become more attentive to others and more certain about their future.',d:[4,10,15],relation:'概括社會意識及未來目標兩種後果',formula:'As a result, many young people become [對他人的認識] and [對自己的目標]',meaning:'年輕人或更有社會意識，也更明確未來方向。',usage:'As a result 需接在親身觀察與反思之後，避免無因果基礎。',links:['As a result, many young people become ', ' and ','.'],labels:['社會方面變化','未來方面變化']},
 {example:'Someone who assists in a community library, for instance, may return home determined to study education.',d:[5,11,16],relation:'用一個人的服務地點與回國後選科連接目標感',formula:'Someone who assists in [服務地點], for instance, may return home determined to study [相關領域]',meaning:'鄉村診所義工或因此有意學醫學、公共衞生或國際發展。',usage:'may 表示例子可能發生；不能把一次經歷當成人人必然改選科。',links:['Someone who assists in ', ', for instance, may return home determined to study ','.'],labels:['服務地點','後續學科']},
 {example:'However, there are serious disadvantages.',d:[2,14,17],relation:'短句由好處段轉入弊端段',formula:'However, there are [程度] disadvantages',meaning:'承認有不可忽視的缺點。',usage:'短轉折不等於充分論證；後面要具體說情緒和學習兩類代價。',links:['However, there are ', ' disadvantages.'],labels:['程度']},
 {example:'One is the emotional strain of working in areas recovering from a disaster.',d:[2,6,14],relation:'點出第一類缺點是面對困苦社區的情緒壓力',formula:'One is the emotional strain of working in [困難環境]',meaning:'貧窮、疾病或創傷社區工作可帶來情緒壓力。',usage:'談志願者的感受時仍尊重當地社區，不以其困境作獵奇例子。',links:['One is the emotional strain of working in ','.'],labels:['困難環境']},
 {example:'Many teenagers are still new to such situations, so repeated exposure to trauma can leave them anxious rather than inspired.',d:[4,7,16],relation:'用 so 說明心理經驗不足加經常接觸苦難的可能結果',formula:'Many teenagers are still [經驗不足], so [接觸困境] can leave them [情緒結果] rather than inspired',meaning:'青少年心理經驗不足，經常見苦難可能令他們痛苦、內疚或不知所措。',usage:'用 can 保留可能性，不能說所有志願者必定受到創傷。',links:['Many teenagers are still ', ', so ', ' rather than inspired.'],labels:['經驗不足狀態','經常面對的困境','情緒結果']},
 {example:'A volunteer in a community centre, for example, may form strong attachments and then find the eventual separation deeply upsetting.',d:[5,9,16],relation:'用建立關係再分開的具體情緒例子',formula:'A volunteer in [服務場所], for example, may form strong attachments and then find the eventual separation deeply upsetting',meaning:'院舍義工與孩子建立關係，最後離開可能很難過。',usage:'要寫「先有關係，後有分離」，不是把幫助別人寫成天然有害。',links:['A volunteer in ', ', for example, may form strong attachments and then find the eventual separation deeply upsetting.'],labels:['服務場所']},
 {example:'Another drawback is that a long break can weaken academic momentum.',d:[2,10,17],relation:'由情緒代價轉入學習節奏的另一缺點',formula:'Another drawback is that [較長中斷] can weaken academic momentum',meaning:'空檔年可能削弱學習節奏。',usage:'這是 may/can 的可能風險，後文須說回到課堂時的具體困難。',links:['Another drawback is that ', ' can weaken academic momentum.'],labels:['學習中斷']},
 {example:'After spending many months outside formal education, some students struggle to follow lectures and meet deadlines, especially when courses begin at a demanding pace.',d:[4,9,17],relation:'以 After 交代離校時長，再說回校初期難適應的條件',formula:'After spending many months outside formal education, some students struggle to [重返學習的困難], especially when [初期要求]',meaning:'離開正規教育多月後，課堂、期限與考試可能難適應，尤其課程一開始就要求高度集中。',usage:'some 表明不是每個空檔年學生都會退步；困難與課程要求須明確。',links:['After spending many months outside formal education, some students struggle to ', ', especially when ','.'],labels:['具體回校困難','加劇困難的條件']},
 {example:'For example, a school-leaver who has spent a year on local conservation projects may find lecture note-taking unexpectedly difficult on returning to study.',d:[5,12,18],relation:'以工作種類及回校技能落實學習節奏的風險',formula:'For example, a school-leaver who has spent a year on [非課堂工作] may find [回校任務] unexpectedly difficult on returning to study',meaning:'建築或社區項目一年後，寫論文和備考可能比預期困難。',usage:'例子要顯示離校活動與重返學業之間的技能轉換。',links:['For example, a school-leaver who has spent a year on ', ' may find ', ' unexpectedly difficult on returning to study.'],labels:['一年活動','回校任務']},
 {example:'In conclusion, a long overseas work placement is not an easy option for young people, as it can be tiring and can interrupt study habits.',d:[2,10,14],relation:'結論先回顧情緒與學業兩種真實代價',formula:'In conclusion, [經歷] is not an easy option for young people, as it can be [情緒負擔] and can [學業影響]',meaning:'海外公益工作有情緒要求，亦可打斷學習習慣。',usage:'先承認兩個正文缺點，再作最終利弊權衡。',links:['In conclusion, ', ' is not an easy option for young people, as it can be ', ' and can ','.'],labels:['經歷','情緒負擔','學業影響']},
 {example:'Even so, it remains a profoundly worthwhile experience, since few alternatives cultivate confidence and long-term purpose so effectively.',d:[1,9,17],relation:'用 Even so 轉回總體正面權衡，並指出獨特長期收益',formula:'Even so, it remains a profoundly worthwhile experience, since few alternatives cultivate [獨特收益] so effectively',meaning:'雖然不易，仍可培養自立、視野與長遠目標感。',usage:'結論用 since 回到已論證的能力和認識，而非突然加入新好處。',links:['Even so, it remains a profoundly worthwhile experience, since few alternatives cultivate ', ' so effectively.'],labels:['獨特長期收益']},
];
const usageGuides=[
 '當你要在引言指出某項做法愈來愈常見，並交代參與者和時段時。',
 '當你要用 Although 先承認難處，再給整體判斷與理由時。',
 '當你要用 The primary advantage 概括即將詳細解釋的主要好處時。',
 '當你要用 When 描述某情境下必須完成的多項行動，作為能力變化的原因時。',
 '當你要用 This 回指上一句的經歷，再以 which 說明其能力在何處有用時。',
 '當你要以一名具體人物每天面對的難題，展示前述能力如何得到鍛鍊時。',
 '當你要用 A second benefit 在同一立場下另起一項不同的好處時。',
 '當你要說明親身看見某情況，如何使抽象概念變得具體時。',
 '當你要用 As a result 承接先前經歷，說明態度與目標可能如何改變時。',
 '當你要以一個具體例子，展示某種經歷如何影響日後選擇時。',
 '當你要用 However 從好處轉到實際缺點時。',
 '當你要用 One is 開始分析前句已預告的一項缺點時。',
 '當你要先交代某群體的限制，再用 so 推出可能的情緒或行為後果時。',
 '當你要用一個先建立關係、後經歷分離的例子，說明情緒壓力時。',
 '當你要用 Another drawback 另起一項與前項不同的缺點時。',
 '當你要用 After 交代經過一段時間後，某群體可能遇到的重新適應困難時。',
 '當你要以一名具體人物的回歸經歷，展示上一句的適應問題時。',
 '當你要在結論中先重述兩項已分析的難處時。',
 '當你要用 Even so 表示缺點仍成立，卻以 since 說明好處較重的原因時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把成長、視野、情緒壓力與學業節奏各自配上證據。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('原題主要問誰的利弊？',['做海外義工的年輕人','只有接待社區','只有大學教師','所有跨國企業'],'題目問 advantages and disadvantages for young people。'),
 {type:'multi',prompt:'範文同時承認哪兩項代價？',detail:'選兩項，再按「確認」。',options:['接觸困苦處境可能帶來情緒壓力','空檔年可能使重返學習更難','每位義工一定在海外獲高薪','所有義工都不再上大學'],correct:[0,1],why:'正文的兩個缺點分別是情緒負擔與學習節奏。'},
];
const route=[sequence('依範文排公益空檔年論證',[
 ['引言','大學前海外公益工作愈來愈常見；表明雖有難處但整體有益。'],
 ['成長優點','自理預算、解決問題、跨語言溝通；食物分發例子。'],
 ['視野優點','親看教育、衞生及醫療困境；鄉村診所例子連到未來學科。'],
 ['兩個缺點','經常見苦難的情緒壓力；離校多月後難回到課堂和考試。'],
 ['結論','承認兩類難處，再重申自立、視野及長遠目標的價值。'],
 ],'每個例子要說明它支援哪一條因果鏈，而非把義工經歷當成自動成長。')];
const evidence=[
 quiz('食物分發例子具體支持哪種個人成長？',['處理運輸、資源與語言問題的自立能力','所有義工必然選讀醫學','完全不再需要其他人幫助','保證工作毫無情緒壓力'],'例子展示日常實際問題的處理。'),
 quiz('親身見教育及醫療不足，主要支持哪個優點？',['抽象社會議題變得具體，擴闊理解','所有國家醫療制度完全相同','大學考試變得容易','義工不必與當地人合作'],'at first hand 是親眼所見與觀念變化的橋樑。'),
 quiz('鄉村診所義工可能回國選讀醫學，證明甚麼？',['經驗可幫助部分人明確長遠方向','每位義工都一定成為醫生','診所只需要外國義工','醫學是唯一有意義學科'],'原文用 may 表達可能的方向感。'),
 quiz('文章哪一項屬於情緒上的缺點？',['經常見苦難後可能痛苦、內疚或不知所措','義工必然沒有語言障礙','空檔年保證完全開心','每個社區都會拒絕協助'],'原文 can leave them distressed/guilty/overwhelmed。'),
 quiz('學業節奏的缺點如何具體出現？',['離校多月後難重新適應講課、限期和考試','每位義工都失去讀寫能力','所有大學課程都沒有考試','海外經歷會使學費自動上升'],'some students struggle to readjust，保留範圍。'),
];
const logic=[
 sequence('成長與視野的兩條不同鏈',[
  ['實際責任','預算、應對運輸與資源問題、跨語言溝通。'],['形成能力','自立、適應、韌性，可用於大學及工作。'],
  ['親身觀察','看到教育、衞生和醫療服務不足。'],['認識改變','抽象全球議題變得具體，部分人更清楚未來方向。'],
 ],'自理責任產生能力；親身觀察產生理解，兩個優點不要混成同一句空話。'),
 sequence('兩個缺點與限定詞',[
  ['情緒條件','青年心理經驗可能不足，長期見苦難。'],['可能結果','痛苦、內疚或不知所措；離別亦可能難受。'],
  ['學業條件','多月未受正式教育，返校即遇密集講課和考試。'],['可能結果','一些人較難重拾寫作、備考及限期節奏。'],
 ],'用 can、may、some 保留可能性，避免把風險寫成每位義工的必然結果。'),
];
const transfers=[
 transfer('另一題：大學前參與一年的社區服務有何利弊？','哪句立場同時承認代價與長期好處？',['這一年可能令學習節奏中斷，但也可幫助部分人自立及看清社會需要。','這一年對所有人完全沒有難處。','只要是服務，所有學科成績必然上升。','參與者一定會放棄升學。'],['讓利弊同時進入可論證的主張。','忽略真實壓力。','過度保證。','無此必然性。'],[1,17,18],'原文 Although emotional/academic difficulties，ultimately positive。'),
 transfer('實習生離家到外地，需要管理每週開支與交通。','哪句說清自立如何形成？',['他必須自行預算並解決交通問題，因此可逐步學會獨立處理日常事務。','只要住外地，他自然完全成熟。','交通有困難證明實習必然失敗。','預算能力與自立完全無關。'],['具體責任連到可見能力。','缺少機制且絕對。','困難可被解決。','預算是自理的一部分。'],[3,4],'原文 must budget/solve/communicate without daily support→self-reliant。'),
 transfer('一名學生協助社區食物站，遇到供應不足和語言障礙。','哪個例子真正支援解決問題能力？',['他安排分發次序並尋求翻譯協助，逐日處理資源與溝通困難。','他到場後所有問題立即消失。','他遇到語言問題，所以不可能學習。','食物站必然只靠學生一人營運。'],['行動對應供應與語言難處。','無機制。','困難不等於無法學。','無此資料。'],[5],'原文 food distribution，limited resources and language barriers。'),
 transfer('學生親身看見偏遠地區學校設備不足。','哪句說明視野如何改變？',['親眼看見具體困難，使原本抽象的教育議題與真實生活連起來。','看見設備不足後便知道所有國家的教育情況。','一次訪問必定使他成為教育專家。','教育設備與社會問題完全無關。'],['親身觀察→具體理解。','不能概括所有國家。','過度保證。','教育是社會議題。'],[7,8],'原文 at first hand turns abstract global issues into concrete human realities。'),
 transfer('青年協助鄉村診所後，更想修讀公共衞生。','哪句保留個人未來方向的可能性？',['這段經驗可能幫助他明確選科，但不能推斷每位義工都改讀醫學。','所有診所義工回國必定成為醫生。','公共衞生與診所經驗毫無關係。','有意讀書等於已完成專業資格。'],['may 和個人例子範圍正確。','過度概括。','兩者相關。','意願非資格。'],[9],'原文 may return home determined to study medicine/public health。'),
 transfer('一些年輕義工在疾病與貧窮社區工作，見到痛苦處境。','哪句謹慎描述情緒風險？',['經常接觸困境可能令部分人悲傷或不知所措，應當視為可能風險。','所有義工必然終生受創。','痛苦處境只會令每個人更快樂。','年輕人一定沒有任何情緒反應。'],['保留 can 和 some 的範圍。','過度絕對。','方向不合。','忽略情緒。'],[11,12],'原文 emotional strain，can leave them distressed。'),
 transfer('義工與兒童院舍的孩子建立感情，服務期完結要離開。','哪句把情緒代價的時間順序寫清？',['先建立深厚關係，最後分開時可能很難過。','先離開才建立深厚關係。','建立關係保證永不難過。','因為會難過，就不能說服務有任何好處。'],['附著→分離→可能難過。','順序反。','不保證。','利弊可並存。'],[13],'原文 form strong attachments，eventual separation upsetting。'),
 transfer('學生一年主要做戶外工程，之後直接進入大學密集課程。','哪句具體說學業節奏問題？',['重返講課、論文和考試可能需要重新適應，尤其課程一開始要求很高。','戶外工作必然使他不識字。','所有大學課程第一天都不需集中精神。','離開課堂一年便保證考試較容易。'],['時間中斷與返校要求相連。','過度誇張。','與題境反。','無此保證。'],[14,15,16],'原文 months outside education→struggle to readjust，especially intense courses。'),
 transfer('結論須回應本文已談的兩類缺點。','哪句沒有漏掉情緒與學業？',['海外服務可能有情緒負擔，也可能打斷學習習慣。','唯一缺點是機票價格。','此經歷對所有人都很容易。','結論只加入正文未提過的新統計。'],['兩個正文缺點均回顧。','正文主要不是票價。','忽略風險。','新證據不合。'],[17],'原文 conclusion emotionally demanding and interrupt study habits。'),
 transfer('作者認為公益空檔年整體值得，但不否認難處。','哪句最能作最後權衡？',['雖有情緒和學業挑戰，這段經驗仍可能培養自立、視野及長遠目標。','只要培養自立，便沒有任何缺點。','個人目標感能保證每位義工成為醫生。','一次經歷足以令所有社會問題消失。'],['承認代價並回到三項已論證好處。','不否認風險。','過度概括。','無法成立。'],[18],'原文 Even so，worthwhile since independence/perspective/purpose。'),
];
export default {key:'advantage-disadvantage:3',meta:{topic:'大學前海外公益空檔年的個人成長與代價',summary:'海外公益空檔年可能讓年輕人透過自理、解決問題與親身觀察培養自立、視野及未來方向；也可能帶來情緒壓力和重返學業的適應困難。作者承認兩類風險後仍判斷整體值得。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
