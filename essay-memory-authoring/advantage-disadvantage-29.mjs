// School-age part-time work: money and practical skills versus study and emotional strain.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:29'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Many parents tell children who are still at school to work for a few hours at weekends or during school holidays.',
 'This work can teach useful things that children do not always learn in class.',
 'At the same time, it may put young people under pressure that they are not yet old enough to deal with well.',
 'One important good point is that earning money can teach children to take responsibility and understand money better.',
 'When children have to arrive on time, do what they are told and earn their own pay, they start to see that money comes from work, not just from asking for it.',
 'For example, a teenager working a few hours each week in a café may think more carefully before buying things they do not need.',
 'Another good point is that working part-time can help children learn useful skills that school does not always teach directly.',
 'By helping customers, working with other staff and dealing with small problems when busy, young people can become more sure of themselves, talk to people better and manage time better. These skills can help when they are adults.',
 'Even so, there are also clear bad points.',
 'The biggest is that work can take away time needed for schoolwork, sleep or family.',
 'For example, a child working several evening shifts in a supermarket may get home too tired to finish homework well. Over time, school results may suffer.',
 'Also, dealing with workplace pressure too early can be harmful if the job is very demanding or no adult watches over the child properly.',
 'Some young workers may have to deal with rude customers, long hours or demands they cannot meet before they are ready to handle them; then a useful experience can become a heavy problem.',
 'Overall, part-time work can help children become more grown-up, able and independent, but it can also harm study and feelings.',
 'So its effect depends mostly on how much work children do and whether clear limits protect them.',
];
const vocabulary=[
 v(['school-age children','children who are still at school','學齡兒童'],['part-time jobs','work for a few hours','兼職工作'],['weekends or school holidays','weekends or during school holidays','週末或學校假期']),
 v(['valuable lessons','useful things','寶貴經驗'],['beyond the classroom','do not always learn in class','課堂以外']),
 v(['At the same time','At the same time','同時'],['expose young people to pressures','put young people under pressure','令年輕人承受壓力'],['not yet mature enough','not yet old enough','尚未成熟'],['manage well','deal with well','妥善處理']),
 v(['paid work','earning money','有薪工作'],['foster responsibility','teach children to take responsibility','培養責任感'],['financial awareness','understand money better','金錢觀念']),
 v(['expected to arrive on time','have to arrive on time','須準時'],['follow instructions','do what they are told','遵從指示'],['own wages','own pay','自己的薪水'],['linked to effort','comes from work','與努力相連'],['on demand','from asking for it','隨時索取']),
 v(['teenager','teenager','青少年'],['a few hours each week','a few hours each week','每週數小時'],['café','café','咖啡店'],['unnecessary spending','buying things they do not need','非必要開支']),
 v(['Another benefit','Another good point','另一好處'],['part-time employment','working part-time','兼職就業'],['practical skills','useful skills','實用技能'],['do not always teach directly','does not always teach directly','不一定直接教授']),
 v(['serving customers','helping customers','服務顧客'],['cooperating with co-workers','working with other staff','與同事合作'],['under pressure','when busy','在壓力下'],['confidence','sure of themselves','自信'],['communication skills','talk to people better','溝通技巧'],['time management','manage time better','時間管理'],['adult life','when they are adults','成年生活']),
 v(['However','Even so','然而'],['clear disadvantages','clear bad points','明顯缺點']),
 v(['eat into time','take away time','佔用時間'],['reserved for study','needed for schoolwork','留給學習'],['sleep or family life','sleep or family','睡眠或家庭生活']),
 v(['evening shifts','evening shifts','晚班'],['return home too tired','get home too tired','回家太疲累'],['complete homework properly','finish homework well','妥善完成作業'],['gradually weaken academic performance','school results may suffer','學業逐漸退步']),
 v(['In addition','Also','此外'],['early exposure','too early','過早接觸'],['workplace stress','workplace pressure','職場壓力'],['demanding','very demanding','要求高'],['poorly supervised','no adult watches over the child properly','監督不足']),
 v(['rude customers','rude customers','無禮顧客'],['long hours','long hours','長工時'],['unrealistic expectations','demands they cannot meet','不切實際要求'],['emotionally ready','ready to handle them','情緒準備好'],['heavy burden','heavy problem','沉重負擔']),
 v(['Overall','Overall','整體而言'],['more mature','more grown-up','更成熟'],['capable','able','更有能力'],['independent','independent','獨立'],['academic and emotional strain','harm study and feelings','學業與情緒壓力']),
 v(['impact','effect','影響'],['depends largely on','depends mostly on','主要取決於'],['amount of work','how much work','工作量'],['clear limits','clear limits','清晰限制']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Many schools encourage older students to take part-time jobs during summer holidays.',d:[1,8,13],relation:'背景句交代鼓勵者、年輕人及工作時段',formula:'Many [鼓勵者] encourage [學生] to take part-time jobs during [時段]',meaning:'不少家庭鼓勵學齡孩子在週末或假期兼職。',links:['Many ', ' encourage ', ' to take part-time jobs during '],labels:['鼓勵者','學生','工作時段']},
 {example:'Such work can offer useful lessons beyond the classroom.',d:[0,8,13],relation:'短句先預告課堂外經驗的好處',formula:'Such work can offer [學習收益] beyond the classroom',meaning:'兼職工作可帶來課堂外經驗。',links:['Such work can offer ', ' beyond the classroom.'],labels:['學習收益']},
 {example:'At the same time, it may expose young people to pressures that they are not yet ready to manage well.',d:[1,8,13],relation:'At the same time 預告年輕人未必能承受的壓力',formula:'At the same time, it may expose [群體] to pressures that they are not yet [能力] to manage well',meaning:'工作亦可能帶來孩子尚未成熟到能處理的壓力。',links:['At the same time, it may expose ', ' to pressures that they are not yet ', ' to manage well.'],labels:['受影響者','尚缺的能力']},
 {example:'One important advantage is that paid work can foster responsibility and better planning.',d:[2,8,9],relation:'主題句提出責任與金錢觀念',formula:'One important advantage is that paid work can foster [能力一] and [能力二]',meaning:'有薪工作可培養責任及金錢觀念。',links:['One important advantage is that paid work can foster ', ' and '],labels:['能力一','能力二']},
 {example:'When children are expected to arrive on time, follow instructions and earn their own wages, they begin to understand that money is linked to effort rather than simply handed over.',d:[3,8,9],relation:'When 列工作要求，rather than 區分努力所得與隨意給予',formula:'When [具體工作要求], they begin to understand that money is linked to effort rather than [原有誤解]',meaning:'準時與按指示賺薪令孩子明白金錢與努力相連。',links:['When ', ', they begin to understand that money is linked to effort rather than '],labels:['具體工作要求','需修正的想法']},
 {example:'For example, a teenager who spends two hours each weekend working in a café may become far more careful about unnecessary spending.',d:[3,8,9],relation:'咖啡店例子把親自賺錢與謹慎消費連上',formula:'For example, a teenager who spends [時間] working in [場所] may become far more careful about [消費行為]',meaning:'青少年親自賺錢後或較少無謂花費。',links:['For example, a teenager who spends ', ' working in a café may become far more careful about '],labels:['工作時間','消費行為']},
 {example:'Another benefit is that part-time employment can build practical skills that classes do not always teach directly.',d:[3,8,9],relation:'第二好處轉到課堂未必直接教授的實用技能',formula:'Another benefit is that part-time employment can build [技能] that [地方] do not always teach directly',meaning:'兼職可培養學校未必直接教授的技能。',links:['Another benefit is that part-time employment can build ', ' that ', ' do not always teach directly.'],labels:['實用技能','傳統學習場合']},
 {example:'By serving customers, cooperating with co-workers and solving small problems under pressure, young people can develop confidence, speaking skills and better time management, all of which are likely to be useful in adult life.',d:[3,8,9],relation:'By 列實踐行動，all of which 回指形成的多種技能',formula:'By [三項工作行動], young people can develop [多種技能], all of which are likely to be useful in adult life',meaning:'顧客服務、合作及應對小問題可培養自信、溝通和時間管理。',links:['By ', ', young people can develop ', ', all of which are likely to be useful in adult life.'],labels:['具體工作行動','可遷移技能']},
 {example:'However, there are also practical disadvantages.',d:[3,6,12],relation:'However 從好處轉到缺點',formula:'However, there are also [缺點種類] disadvantages',meaning:'兼職工作亦有學業及情緒代價。',links:['However, there are also ', ' disadvantages.'],labels:['缺點種類']},
 {example:'The most obvious is that work can eat into time that should be reserved for study, sleep and family life.',d:[3,8,12],relation:'eat into time 指工作擠佔學習睡眠家庭',formula:'The most obvious is that [活動] can eat into time that should be reserved for [三項需要]',meaning:'兼職可能佔用原本留給學習、睡眠或家庭的時間。',links:['The most obvious is that ', ' can eat into time that should be reserved for '],labels:['佔時活動','被擠壓的需要']},
 {example:'A child who works several evening shifts in a café, for instance, may return home too tired to complete homework properly, and this can gradually weaken academic performance.',d:[3,8,12],relation:'晚班疲勞例子推出作業及學業後果',formula:'A child who works [班次], for instance, may return home too tired to [學習任務], and this can gradually weaken academic performance',meaning:'超市晚班可能讓孩子太疲累，作業及成績逐漸受影響。',links:['A child who works ', ', for instance, may return home too tired to ', ', and this can gradually weaken academic performance.'],labels:['班次','未能做好學習任務']},
 {example:'In addition, early exposure to workplace stress may be harmful if the environment is very demanding or poorly supervised.',d:[3,8,9],relation:'if 限定高壓或監管不足時的情緒風險',formula:'In addition, early exposure to [壓力] may be harmful if [工作環境條件]',meaning:'若工作要求過高或監督不足，早接觸職場壓力可能有害。',links:['In addition, early exposure to ', ' may be harmful if '],labels:['壓力','不利條件']},
 {example:'Some young workers may have to deal with angry customers, long hours or unrealistic expectations before they are emotionally ready, which can turn a useful experience into a heavy burden.',d:[3,8,9],relation:'before/which 說未準備好時接觸困難可由收益變負擔',formula:'Some young workers may have to deal with [多種困難] before they are emotionally ready, which can turn [可能有益經驗] into a heavy burden',meaning:'無禮顧客、長工時及過高要求或使有價值經驗變沉重。',links:['Some young workers may have to deal with ', ' before they are emotionally ready, which can turn ', ' into a heavy burden.'],labels:['工作困難','原本有益經驗']},
 {example:'Overall, part-time work can help children become more mature and independent, yet it can also create academic and emotional strain.',d:[3,8,9],relation:'yet 在段末平衡能力收益與學業情緒代價',formula:'Overall, part-time work can help children become [成長收益], yet it can also create [兩類代價]',meaning:'兼職可助成熟獨立，也可能有學業和情緒壓力。',links:['Overall, part-time work can help children become ', ', yet it can also create '],labels:['成長收益','可能代價']},
 {example:'Its impact therefore depends largely on the amount of work involved and whether clear limits are agreed beforehand.',d:[3,8,9],relation:'therefore 指效果取決於工時與界線',formula:'Its impact therefore depends largely on [工作量] and whether [清楚限制]',meaning:'兼職影響主要看工時是否適量及有否清楚界線。',links:['Its impact therefore depends largely on ', ' and whether '],labels:['工作量','保護界線']},
];
const usageGuides=[
 '當你要在引言先交代誰鼓勵哪類年輕人於甚麼時段參與活動時。',
 '當你要用短句預告某活動可能帶來課堂外的學習好處時。',
 '當你要用 At the same time 預告年輕人未必有能力處理的另一面時。',
 '當你要以主題句指出一項活動可能培養的兩種能力時。',
 '當你要用 When 列出實際要求，再用 rather than 對照需要修正的觀念時。',
 '當你要用一名人物的具體工作經歷，展示態度如何改變時。',
 '當你要用 Another benefit 轉到與前一項不同的實用技能收益時。',
 '當你要用 By + doing 列出實踐方式，再以 all of which 說技能日後有用時。',
 '當你要用 However 在已分析的好處後開始討論缺點時。',
 '當你要說明一項活動如何擠佔本應留給其他需要的時間時。',
 '當你要用一個排班例子，逐步說明疲勞如何影響學習時。',
 '當你要用 if 將風險限定於要求過高或監督不足的環境時。',
 '當你要先列出困難，再用 before 和 which 說明尚未準備好的人如何受壓時。',
 '當你要在段末用 yet 同時概括成長收益與學業情緒代價時。',
 '當你要在結尾指出效果取決於參與量和保護界線，而非作絕對判斷時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分開金錢責任、實用技能、時間擠壓與情緒壓力。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文討論哪種年輕人的活動？',['學齡孩子週末或假期做兼職。','所有孩子每天全職工作。','只研究成年人改行。','只比較不同學校的校服。'],'school-age children、weekends or school holidays 限定題目。'),
 {type:'multi',prompt:'兼職工作的兩項主要好處是甚麼？',detail:'選兩項，再按「確認」。',options:['理解金錢與努力的關係','練習顧客服務、合作與時間管理','保證孩子完全不需要學校','保證所有工作環境都沒有壓力'],correct:[0,1],why:'責任金錢觀念與實用技能分別是兩項好處。'},
];
const route=[sequence('還原學齡孩子兼職的利弊',[
 ['背景與可能性','有些家庭鼓勵週末或假期兼職；工作有課堂外收益與壓力。'],
 ['責任與金錢','準時、按指示工作及親自賺薪可培養責任與消費判斷。'],
 ['實用技能','服務顧客、合作與處理小問題可練自信、溝通及時間管理。'],
 ['學業與休息','晚班或過多工時佔去功課、睡眠和家庭時間。'],
 ['情緒與條件結論','高壓或監管不足可傷害孩子；影響取決於工時和清楚界線。'],
 ],'文章沒有要求孩子一定打工；結論依工作量與保護界線而定。')];
const evidence=[
 quiz('兼職如何可能改變孩子的金錢觀念？',['親自準時工作賺薪，明白金錢與努力相連。','領到薪水便保證永遠不亂花。','只要工作一次就不再需要任何指示。','錢只會由家長隨時無條件提供。'],'具體工作要求支持抽象責任感。'),
 quiz('哪幾項工作經驗可培養實用技能？',['服務顧客、與同事合作及在忙時解決小問題。','只聽不同店舖播放的音樂。','只記住商品包裝的顏色。','完全不與任何人交流。'],'By 句列三項具體活動。'),
 quiz('晚班例子如何連到學業代價？',['回家太疲累，作業完成不好，成績可能逐漸受影響。','晚班必然立即令每名孩子退學。','在超市工作一定令功課變少。','工作時間與睡眠完全無關。'],'時間擠壓和疲勞是機制。'),
 quiz('何時職場壓力特別值得擔心？',['工作要求高或監管不足，而孩子尚未準備好。','只要職場有任何顧客便必然受傷。','工作環境要求低且有人照顧時。','只要是假期就不可能有壓力。'],'if 限定環境條件。'),
 quiz('作者的最後判斷取決於甚麼？',['工作量及有否清楚保護界線。','兼職店舖的招牌顏色。','每名孩子必須做完全一樣的時數。','只要有薪水便不需考慮學業。'],'Its impact depends largely on amount and clear limits。'),
];
const logic=[
 sequence('工作要求到成長收益',[
 ['工作要求','須準時、聽指示及靠自己賺薪。'],
 ['金錢觀念','明白收入來自努力，可能更謹慎花錢。'],
 ['人際工作','服務顧客並與同事合作。'],
 ['實用技能','練溝通、自信與管理時間，成年後仍可能有用。'],
 ],'金錢責任與職場技能各有不同的實踐來源。'),
 sequence('兩條代價與最後條件',[
 ['時間擠壓','工時佔去學習、睡眠或家庭生活。'],
 ['學業後果','晚班疲勞可能影響作業與成績。'],
 ['情緒壓力','要求過高或監管不足時，孩子可能難應付。'],
 ['保護界線','控制工作量與清楚規則，決定影響更可能偏向哪一面。'],
 ],'不要把所有兼職一概視為有益或有害。'),
];
const transfers=[
 transfer('一名中學生週末在咖啡店工作幾小時，開始珍惜自己賺的錢。','哪句準確應用金錢觀念論證？',['親自花時間賺薪，可能令他更謹慎看待不必要開支。','只要領過薪水，便保證永遠不亂花。','所有工作收入都必然由家長提供。','咖啡店工作與金錢觀念完全無關。'],['努力與收入連上，保留可能性。','不能保證。','與情況相反。','原文例子支持。'],[4,5],'原文咖啡店青少年較謹慎消費。'),
 transfer('一名學生在店內學會服務顧客並與同事合作。','哪句指出可轉移技能？',['這些實踐可能改善溝通、自信和時間管理，將來仍可使用。','服務顧客只影響店內衣服的顏色。','與同事合作必然令學生不再需要上學。','所有技能都必須只能在課室裡學到。'],['具體行動→可遷移能力。','不相關。','過度推論。','原文說課堂未必直接教。'],[6,7],'原文 By serving customers/cooperating→skills。'),
 transfer('孩子一週上多個晚班，回家後太累而無法好好做功課。','哪句保留學業風險的因果？',['工作佔去休息與學習時間，疲勞可能令功課和成績逐漸受影響。','只要工作一晚，孩子便必然永遠不能畢業。','晚班只會增加睡眠，不可能影響作業。','上班時間與功課完成情況完全無關。'],['時間及疲勞連到學業後果。','過度斷言。','方向相反。','原文例子說有關。'],[9,10],'原文超市晚班太疲累→作業差→成績下降。'),
 transfer('青少年在缺乏主管的高壓餐廳遇上無禮顧客。','哪句符合情緒風險？',['若尚未準備好應對，工作壓力可能使原本有益的經驗變成負擔。','任何顧客說話無禮都必然使青少年永久不能工作。','高壓及監管不足一定使工作更安全。','只要有薪水，情緒壓力便不須討論。'],['if 與 may 限定條件和可能後果。','過度斷言。','方向相反。','仍需考慮。'],[11,12],'原文 demanding/poorly supervised→heavy burden。'),
 transfer('家長為孩子的假期兼職訂下每週工時及休息界線。','哪句符合範文結論？',['兼職效果會受工作量與清楚限制影響，因此應同時看成長和負擔。','只要有任何限制，孩子便不能學到技能。','工時越多，所有孩子就必然越健康。','有薪工作一律不需家長留意。'],['量與界線是最後的判斷條件。','限制可保護。','無此必然。','仍需監督。'],[13,14],'原文 impact depends on amount of work and clear limits。'),
 transfer('作文只說「打工培養責任」，沒有具體內容。','哪句能補足機制？',['準時上班、遵從指示和自己賺薪，可讓孩子明白努力與收入相連。','打工培養責任，因為打工能培養責任。','責任感只能從薪水數字大小判斷。','只要孩子踏入店舖，便不再需要任何指示。'],['列行為及觀念改變。','循環說法。','過窄。','與工作要求相反。'],[3,4],'原文準時、按指示、賺薪→金錢與努力。'),
 transfer('另一題討論學生長假參加社區服務。','哪句真正轉移本文的分析框架？',['可比較責任及合作技能，與學習休息時間及工作環境壓力。','因為兼職可能有益，社區服務必然沒有任何缺點。','只需討論服務地點的招牌。','只要活動在假期，時間壓力就必然不存在。'],['轉移技能、時間與情緒三維度。','結論需另證。','不相關。','假期也有休息需要。'],[4,7,9,11],'原文兩項收益與兩項風險可跨題評估。'),
 transfer('有人說學生只要兼職便一定更成熟。','哪句指出原文的限定？',['兼職可促成成長，但也可能壓縮學習或造成情緒負擔，須看工時與界線。','兼職必然令每名學生完全相同。','有薪水便可證明孩子沒有壓力。','任何技能收益都不可能存在。'],['can、may、depends 保留條件。','過度概括。','忽略壓力。','否認好處。'],[13,14],'原文整體利弊依工作量和限制。'),
 transfer('學生一邊工作一邊要準備考試。','哪句最符合時間管理的權衡？',['工作或能練時間安排，卻不能擠掉必要的溫習與睡眠。','只要安排得好，睡眠可以完全取消。','考試期間工作越多，成績必然越高。','打工與學業時間永遠互不影響。'],['承認技能收益並保護學習休息。','睡眠必要。','無此保證。','時間有限。'],[7,9,10],'原文時間管理好處與學習睡眠代價並存。'),
 transfer('一名孩子工作時遇到長工時與不合理要求。','哪句提出最貼近範文的保護重點？',['檢查是否有成年人妥善監督，並把工時與要求控制在孩子能應付的範圍。','只要店舖付薪，就不用管工作要求。','讓孩子自己承受所有壓力便保證更獨立。','把休息時間全部改為工作可消除壓力。'],['依原文的工時、監管及情緒準備作回應。','薪水不抵銷風險。','無此保證。','方向相反。'],[11,12,14],'原文 demanding/poorly supervised 與 clear limits。'),
];
export default {key:'advantage-disadvantage:29',meta:{topic:'學齡孩子兼職的成長與壓力',summary:'範文指出兼職可培養責任、金錢觀念與服務合作等技能，同時可能佔去學習睡眠時間或讓孩子承受未準備好的職場壓力；影響取決於工時及清楚界線。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
