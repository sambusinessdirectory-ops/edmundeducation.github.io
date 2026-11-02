// Human-authored support for Direct Question 26; canonical essay text stays in the source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-26-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:26'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Because small families have fewer people than families with many relatives, they can move to another place more easily.',
  'I think moving helps children, and its good points are greater than its bad points because it teaches them to deal with change and may give them better chances.',
  'The biggest benefit is that moving teaches children to get used to new places.',
  'When a child starts at a new school or lives in a new city, they must learn new daily habits, find friends and understand how others expect them to act.',
  'This may be hard at first, but it teaches them to watch, talk and deal with change instead of being afraid of it.',
  'For example, a child who moves from a small town to a big city may feel lost at first; after going to classes and joining sports teams, they often feel more sure of themselves with new people.',
  'So moving is not just getting a new address; it also teaches children how to recover from difficulties.',
  'Moving can also make a child’s future better.',
  'Parents often move for better work, safer areas, better schools or services they can count on.',
  'If a family moves to a place with steady schooling and activities that are easy to join, the child gets more help with learning and making friends.',
  'These things can affect a child’s future confidence, goals and job choices.',
  'It is true that moving can make children feel upset.',
  'Children may feel they no longer belong when they leave close friends, teachers they know and a place that feels like home.',
  'Sometimes this change can affect how they feel or how well they do at school for a short time.',
  'But these problems usually do not last if parents keep helping, keep familiar daily habits and help children stay in touch with old friends while making new ones.',
  'Changing places can be hard, but the benefits that last can be greater.',
  'To sum up, moving can help children a lot.',
  'Although moving may cause stress at first, its good points are greater than its bad points because children learn to deal with change and may find better chances later.',
];
const vocabulary=[
  [['nuclear families','small families','核心家庭'],['extended households','families with many relatives','大家庭'],['relocate','move to another place','搬遷'],['less practical difficulty','more easily','較少實際困難']],
  [['children do benefit from moving','moving helps children','孩子從搬遷受益'],['advantages clearly outweigh the disadvantages','good points are greater than its bad points','利多於弊'],['relocation builds adaptability','it teaches them to deal with change','培養適應力'],['better opportunities','better chances','更好機會']],
  [['main benefit','biggest benefit','主要好處'],['adjust to unfamiliar environments','get used to new places','適應陌生環境']],
  [['enters a new school or city','starts at a new school or lives in a new city','到新學校或城市'],['new routines','new daily habits','新日常規律'],['make friends','find friends','交朋友'],['read unfamiliar social expectations','understand how others expect them to act','理解新社交期待']],
  [['uncomfortable at first','hard at first','起初不適'],['observe','watch','觀察'],['communicate','talk','溝通'],['cope with change','deal with change','應對變化'],['rather than fear it','instead of being afraid of it','而非害怕變化']],
  [['quiet town','small town','安靜小鎮'],['large city','big city','大城市'],['initially feel lost','feel lost at first','起初迷失'],['joining classes and sports teams','going to classes and joining sports teams','參與課堂和運動隊'],['more confident around strangers','more sure of themselves with new people','面對陌生人更自信']],
  [['In this sense','So','從這意義'],['relocation','moving','搬遷'],['not just a change of address','not just getting a new address','不只是換地址'],['practical lesson in resilience','teaches children how to recover from difficulties','實際韌性課']],
  [['long-term prospects','future','長遠前景'],['improve','make','改善']],
  [['better jobs','better work','更好工作'],['safer neighbourhoods','safer areas','更安全社區'],['stronger schools','better schools','更優質學校'],['more reliable services','services they can count on','更可靠服務']],
  [['education is stable','steady schooling','教育穩定'],['extracurricular activities are accessible','activities that are easy to join','容易參與課外活動'],['richer academic and social support','more help with learning and making friends','較多學業及社交支持']],
  [['These conditions','These things','這些條件'],['shape','affect','塑造'],['ambition','goals','抱負'],['career options','job choices','職業選擇']],
  [['Admittedly','It is true that','誠然'],['emotional difficulties','feel upset','情感困難']],
  [['feel uprooted','feel they no longer belong','感到離開熟悉環境'],['close friends','close friends','親密朋友'],['familiar teachers','teachers they know','熟悉老師'],['place that feels like home','place that feels like home','有家感的地方']],
  [['In some cases','Sometimes','某些情況'],['disruption','change','變動'],['affect their mood','affect how they feel','影響情緒'],['school performance','do at school','學校表現'],['for a while','for a short time','短暫一段時間']],
  [['disadvantages are usually temporary','problems usually do not last','缺點通常暫時'],['steady support','keep helping','穩定支持'],['maintain routines','keep familiar daily habits','維持日常規律'],['stay connected with old friends','stay in touch with old friends','與舊友保持聯繫'],['building new relationships','making new ones','建立新關係']],
  [['discomfort of transition','Changing places can be hard','過渡期不適'],['lasting gains','benefits that last','長遠收穫'],['not greater than','can be greater','不大於']],
  [['In conclusion','To sum up','總結'],['benefit significantly','help children a lot','顯著受益']],
  [['short-term stress','stress at first','短期壓力'],['advantages outweigh its disadvantages','good points are greater than its bad points','利大於弊'],['strengthens adaptability','learn to deal with change','增強適應力'],['access to a better future','better chances later','更好發展機會']],
];
const chunkOverrides=[
  ['Because nuclear families have fewer members','than extended households,','they can relocate with less practical difficulty.'],
  ['In my view, children do benefit from moving,','and the advantages clearly outweigh the disadvantages','because relocation builds adaptability','and may open the door to better opportunities.'],
  ['The main benefit is that moving teaches children','how to adjust to unfamiliar environments.'],
  ['When a child enters a new school or city,','they must learn new routines, make friends,','and read unfamiliar social expectations.'],
  ['This may be uncomfortable at first,','but it trains them to observe, communicate,','and cope with change rather than fear it.'],
  ['For example, a child who moves','from a quiet town to a large city','may initially feel lost;','after joining classes and sports teams, however,','they often become more confident around strangers.'],
  ['In this sense, relocation is not just','a change of address;','it is a practical lesson in resilience.'],
  ['Moving can also improve','a child’s long-term prospects.'],
  ['Parents often relocate for better jobs, safer neighbourhoods,','stronger schools, or more reliable services.'],
  ['If a family moves to an area','where education is stable','and extracurricular activities are accessible,','the child receives richer academic and social support.'],
  ['These conditions can shape future confidence,','ambition, and career options.'],
  ['Admittedly, moving can create','emotional difficulties.'],
  ['Children may feel uprooted when they leave','close friends, familiar teachers,','and a place that feels like home.'],
  ['In some cases, this disruption may affect','their mood or school performance for a while.'],
  ['However, these disadvantages are usually temporary','if parents provide steady support, maintain routines,','and help children stay connected with old friends','while building new relationships.'],
  ['The discomfort of transition is real,','but it is not greater than the lasting gains.'],
  ['In conclusion, children can benefit','significantly from moving.'],
  ['Although relocation may cause short-term stress,','its advantages outweigh its disadvantages','because it strengthens adaptability','and may give children access to a better future.'],
];
const simpleChunkOverrides=[
  ['Because small families have fewer people','than families with many relatives,','they can move to another place more easily.'],
  ['I think moving helps children,','and its good points are greater than its bad points','because it teaches them to deal with change','and may give them better chances.'],
  ['The biggest benefit is that moving teaches children','to get used to new places.'],
  ['When a child starts at a new school','or lives in a new city,','they must learn new daily habits, find friends','and understand how others expect them to act.'],
  ['This may be hard at first,','but it teaches them to watch, talk','and deal with change instead of being afraid of it.'],
  ['For example, a child who moves','from a small town to a big city','may feel lost at first;','after going to classes and joining sports teams,','they often feel more sure of themselves with new people.'],
  ['So moving is not just getting a new address;','it also teaches children how to recover from difficulties.'],
  ['Moving can also make','a child’s future better.'],
  ['Parents often move for better work, safer areas,','better schools or services they can count on.'],
  ['If a family moves to a place','with steady schooling and activities that are easy to join,','the child gets more help','with learning and making friends.'],
  ['These things can affect a child’s future confidence,','goals and job choices.'],
  ['It is true that moving','can make children feel upset.'],
  ['Children may feel they no longer belong','when they leave close friends, teachers they know','and a place that feels like home.'],
  ['Sometimes this change can affect','how they feel or how well they do at school','for a short time.'],
  ['But these problems usually do not last','if parents keep helping, keep familiar daily habits','and help children stay in touch with old friends','while making new ones.'],
  ['Changing places can be hard,','but the benefits that last can be greater.'],
  ['To sum up, moving','can help children a lot.'],
  ['Although moving may cause stress at first,','its good points are greater than its bad points','because children learn to deal with change','and may find better chances later.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('Because small households have fewer belongings than larger households, they can change homes with less practical difficulty.','用 Because ... fewer ... than ... they can 說明核心家庭較易搬遷的條件',[1,2,7],
    fixed(0,'Because [核心家庭] have fewer [成員] than [大家庭], they can [較容易搬遷].','開場說明家庭規模如何減少搬遷時的安排難度。','要用 Because 把群體特徵與由此產生的實際便利連起來時。',['Because ', ' have fewer ', ' than ', ', they can '],['成員較少的家庭','比較的數量','作比較的大家庭','規模較小帶來的搬遷效果'])),
  card('In my view, pupils do benefit from changing schools, and the gains clearly outweigh the losses because changing schools builds confidence and may offer new opportunities.','用 In my view ... and ... outweigh ... because 同時回答受益與利弊衡量',[0,6,17],
    fixed(1,'In my view, [孩子從搬遷受益], and [優點] clearly outweigh [缺點] because [搬遷培養適應力] and may [帶來更好機會].','引言同時表態：孩子會受益，利大於弊；兩項好處提供判斷理由。','要一併表明判斷及比較結果，再用 because 提供理由時。',['In my view, ', ', and the ', ' clearly outweigh the ', ' because ', ' and may '],['孩子獲益的立場','較重的優點','較輕的缺點','第一項衡量理由','第二項可能好處'])),
  card('The main benefit is that changing classes teaches students how to feel comfortable in new groups.','用 The main benefit is that 提出適應陌生環境這項好處',[1,3,7],
    fixed(2,'The main benefit is that [搬遷] teaches [孩子] how to [適應新環境].','第一主體段把搬遷的個人成長好處定為適應能力。','開始回答「孩子能否受益」，先提出一個可由例子證明的好處時。',['The main benefit is that ', ' teaches ', ' how to '],['產生好處的經歷','學習者','學會的適應能力'])),
  card('When a student enters a new team, they must learn its rules, make friends, and understand new expectations.','用 When ... they must ... 列出新環境迫使孩子學習的行為',[2,4,8],
    fixed(3,'When [孩子進入新學校或城市], they must [學新規律], [交朋友], and [理解新社交期待].','把抽象適應力拆成規律、人際和社交判斷三個具體學習。','提出適應好處後，要說明搬遷期間孩子實際要做甚麼時。',['When ', ', they must ', ', ', ', and '],['進入的新環境','需要學習的規律','需要建立的人際關係','需要讀懂的社交期待'])),
  card('This may be awkward at first, but it trains them to speak up, adapt, and cope with change rather than avoid it.','用 may ... at first, but ... rather than 將初期不適連到適應訓練',[3,5,11],
    fixed(4,'This may be [起初不舒服] at first, but it trains them to [觀察、溝通] and [應對變化] rather than [害怕變化].','承認起初不舒服，再指出正是這段經驗訓練孩子面對變化。','已列新環境挑戰，須解釋挑戰如何變成可學的能力時。',['This may be ', ' at first, but it trains them to ', ', and ', ' rather than '],['初期感受','主動學習的行為','應對變化的能力','與之相反的害怕反應'])),
  card('For example, a shy pupil may initially feel lost in a new class; after joining a sports club, however, she may speak with strangers more confidently.','用 For example ...; after ..., however, ... 展示初期迷失到自信的過程',[3,4,12],
    fixed(5,'For example, [由小鎮到大城的孩子] may initially [感到迷失]; after [參加課堂與運動隊], however, [較能自信面對陌生人].','用搬遷後參與活動的具體歷程證明適應力不是立即出現。','已說初期不適可培養適應力，需要一個有前後變化的例子時。',['For example, ', ' may initially ', '; after ', ', however, '],['經歷搬遷的孩子','初期反應','幫助融入的活動','其後的自信變化'])),
  card('In this sense, joining a new school is not just a change of classroom; it is a lesson in resilience.','用 not just ...; it is ... 將搬遷重估為韌性訓練',[4,5,7],
    fixed(6,'In this sense, [搬遷] is not just [換地址]; it is [韌性的實際課程].','收束第一項好處：搬遷不只是地理轉移，也帶來面對挫折的能力。','例子已顯示孩子由迷失到自信，要提升到可遷移的成長能力時。',['In this sense, ', ' is not just ', '; it is '],['要重新理解的搬遷','表面的地址變更','較深的能力收穫'])),
  card('Changing schools can also improve a child’s future prospects.','用 can also improve 引出第二種長遠好處',[2,8,10],
    fixed(7,'[搬遷] can also improve [孩子的長遠前景].','從短期適應力轉入教育與未來機會。','第一項成長好處已說完，接着要提出另一類好處時。',[' can also improve '],['可帶來新機會的轉變','可能改善的長遠結果'])),
  card('Parents often relocate for better jobs, safer streets, stronger schools, or dependable health services.','用 relocate for 並列父母選擇新地方的可能理由',[0,7,9],
    fixed(8,'Parents often relocate for [更好工作], [更安全社區], [更好學校], or [更可靠服務].','交代搬遷可能讓孩子受益的環境條件從何而來。','已提出長遠前景，須列父母尋找的具體條件時。',['Parents often relocate for ', ', ', ', ', ', or '],['工作條件','居住安全','學校質素','公共服務'])),
  card('If a family moves to an area where schools are stable and clubs are accessible, the child receives stronger support.','用 If ... where ... and ..., the child ... 連到孩子的學業及社交支持',[7,8,10],
    fixed(9,'If [家庭搬到新區] where [教育穩定] and [課外活動易參與], the child receives [更豐富的學業及社交支持].','指出地點改變如何透過學校與活動，轉成孩子可使用的資源。','列完父母搬遷理由，接着要解釋何種新環境真正有利孩子時。',['If ', ' where ', ' and ', ', the child receives '],['搬遷的新地點','教育條件','課外機會','孩子得到的支持'])),
  card('These conditions can shape future confidence, goals, and career options.','用 These conditions can shape 將當前資源推到未來選擇',[7,9,11],
    fixed(10,'These conditions can shape [未來自信], [抱負], and [職業選擇].','把較好的教育與社交支持，推到日後自信和職涯可能性。','具體資源已說明，要指出其可能造成的長期結果時。',['These conditions can shape ', ', ', ', and '],['未來的自我信心','對未來的目標','其後可能的工作選擇'])),
  card('Admittedly, changing schools can create emotional difficulties.','用 Admittedly 承認搬遷有情感缺點',[7,12,15],
    fixed(11,'Admittedly, [搬遷] can create [情感困難].','在衡量利弊時先承認反方並非虛構，為後文評估嚴重性鋪路。','前兩段已談好處，現在須公平處理孩子可能失去甚麼時。',['Admittedly, ', ' can create '],['須評估的轉變','真實存在的情感代價'])),
  card('Children may feel uprooted when they leave close classmates, familiar teachers, and the town they call home.','用 feel uprooted when ... 具體說明失去熟悉人和地方的感受',[5,11,13],
    fixed(12,'Children may feel [失去歸屬] when they leave [親密朋友], [熟悉老師], and [像家的地方].','把「情感困難」落在朋友、老師與熟悉地方的失去。','已承認情感缺點，需要說明孩子為何難過時。',['Children may feel ', ' when they leave ', ', ', ', and '],['可能的失落感','離開的友誼','離開的老師','離開的熟悉地方'])),
  card('In some cases, this disruption may affect their mood or school performance for a while.','用 In some cases ... for a while 限定影響可能發生且可能暫時',[11,12,14],
    fixed(13,'In some cases, [搬遷打亂生活] may affect [情緒] or [學校表現] for a while.','承認搬遷可能在一段時間內影響心情與學習，同時避免說成每人必然如此。','說明孩子失去熟悉環境後，要審慎指出可能的短期影響時。',['In some cases, ', ' may affect ', ' or ', ' for a while.'],['造成變動的經歷','可能受影響的心情','可能受影響的學校表現'])),
  card('However, these problems are usually temporary if adults keep routines, offer support, and help children keep old friends while meeting new ones.','用 However ... if ... while 說明父母支持如何緩和短期缺點',[11,13,15],
    fixed(14,'However, [缺點] are usually temporary if [父母穩定支持、維持規律], and [幫孩子與舊友保持聯繫] while [建立新關係].','評估缺點不是否認情緒，而是指出穩定支持與友誼銜接可減輕它。','已承認短期情緒與學習影響，要說明在甚麼條件下能緩和時。',['However, ', ' are usually temporary if ', ', and ', ' while '],['可能減輕的缺點','父母提供的支持與規律','與舊友的聯繫','同時建立的新關係'])),
  card('The discomfort of changing classes is real, but it is not greater than the lasting gains.','用 ... is real, but ... not greater than 完成利弊權衡',[11,14,17],
    fixed(15,'[過渡期的不適] is real, but it is not greater than [長遠收穫].','正面承認情感代價，然後明確比較其份量與長期好處。','已評估缺點及緩和條件，需要得出利弊判斷時。',['The ', ' is real, but it is not greater than the '],['短期不適','長遠獲益'])),
  card('In conclusion, pupils can benefit significantly from changing schools.','用 In conclusion 重申孩子確實受益',[1,7,17],
    fixed(16,'In conclusion, [孩子] can benefit significantly from [搬遷].','結論先直接回答孩子是否能從移動中得到好處。','兩個題問的第一問要在結論清楚重申時。',['In conclusion, ', ' can benefit significantly from '],['獲得好處的人','產生好處的轉變'])),
  card('Although changing schools may cause short-term stress, its gains outweigh its losses because it builds confidence and may open better opportunities.','用 Although ... outweigh ... because 同時讓步與重申利大於弊',[1,14,16],
    fixed(17,'Although [搬遷造成短期壓力], [優點] outweigh [缺點] because [增強適應力] and may [提供更好未來].','最後一併承認短期壓力，判斷利大於弊，並回扣適應力與機會。','結論須回答利弊哪邊較大，而且判斷要有前文根據時。',['Although ', ', its ', ' outweigh its ', ' because ', ' and may '],['先承認的短期代價','較大的好處','較小的缺點','第一項長遠根據','第二項可能機會'])),
];
const wrongReasons=[
  ['立場句評估孩子利弊，沒有比較家庭成員數與搬遷難度。','主要好處句談適應能力，沒有家庭大小的背景原因。','長遠前景只說孩子受益，沒有核心家庭較易移動。'],
  ['家庭規模說搬遷便利，沒有孩子受益及利弊衡量。','韌性總結只重估第一項成長好處，沒有同答兩問。','結論也判斷利大於弊，但沒有引言 In my view 的完整立場預告。'],
  ['引言同答兩問，但沒有先鎖定適應新環境這項主體段好處。','新校需要的行為是後續解釋，沒有先命名 main benefit。','長遠前景是另一項好處，不是第一項適應力。'],
  ['主要好處只提適應，沒有列新規律、交朋友和社交期待。','初期不適說成長過程，沒有 When 新校的具體任務。','父母搬遷理由是另一段背景，沒有孩子進新環境後的行為。'],
  ['新校任務是經驗清單，沒有 but 將不適轉為能力訓練。','小鎮到大城例子展示個案，沒有概括 rather than fear 的對照。','情感困難是缺點，沒有這句對挑戰的正面轉化。'],
  ['新校行為只是一般說明，沒有個別孩子的前後變化。','初期不適總說訓練，沒有入班和運動隊的具體例子。','失去舊友說難過，沒有參加活動後更自信的過程。'],
  ['挑戰訓練說能力如何形成，沒有 not just 換地址的重新界定。','小鎮例子是具體個案，沒有概括韌性課程。','長遠前景是第二類好處，不是這句的韌性收束。'],
  ['主要好處是適應新環境，沒有 also 轉向未來前景。','父母搬遷理由細列條件，沒有先提出第二種好處。','未來條件造成的結果是後續解釋，沒有轉段功能。'],
  ['家庭規模是搬遷便利背景，沒有列父母追求的工作與學校。','長遠前景只是總述，沒有四種搬遷目的。','新區教育條件是其後一個假設，沒有完整列父母可能的理由。'],
  ['長遠前景總說好處，沒有 If 條件如何變成孩子可用的支援。','父母選擇新區理由是清單，沒有說孩子因此得到甚麼。','未來自信與職涯是後續結果，沒有具體學校和活動條件。'],
  ['長遠前景只開段，沒有 shape 的未來自信與職業細節。','較好教育與活動說當下支援，沒有推到未來。','情感困難是缺點轉段，不是教育條件的長遠結果。'],
  ['長遠前景只談好處，沒有 Admittedly 承認情感缺點。','離開朋友老師是具體解釋，沒有先命名情感困難。','過渡期不適衡量利弊，是承認缺點後的評估。'],
  ['小鎮到大城例子講適應後自信，沒有離開舊友的失落。','情感困難只是段首概括，沒有朋友老師和家園的具體失去。','情緒與學習影響是下一層後果，沒有先解釋失落來源。'],
  ['承認情感困難是總述，沒有 In some cases 和 for a while 的限定。','離開舊友說為何失落，沒有心情與學習的短期後果。','父母支持說怎樣緩和，沒有先承認可能的情緒影響。'],
  ['情感困難只提出缺點，沒有父母支持的緩和條件。','短期影響指出可能後果，沒有 if 父母怎樣減輕它。','利弊總判斷沒有支持、規律及友誼銜接的具體條件。'],
  ['情感困難只是承認代價，沒有與長遠收穫比較。','父母支持解釋缺點為何可減輕，沒有最後的份量判斷。','結論重申利大於弊，沒有這句對過渡期不適的直接衡量。'],
  ['引言已表態孩子受益，但沒有結論簡短重申第一問。','長遠前景是其中一類好處，沒有 In conclusion 的整體收束。','最後一句回應第二問利弊，沒有先獨立回答孩子會否受益。'],
  ['引言的 In my view 預告立場，沒有結論 Although 讓步收束。','父母支持可減少缺點，沒有總結適應力與更好機會的權衡。','結論首句只答孩子有好處，沒有判斷優點是否超過缺點。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要回答哪兩項判斷？',[
    '孩子能否從搬遷得益，以及好處是否多於壞處',
    '哪個城市人口最多，以及哪間學校最難入讀',
    '只列父母工作選擇，不評估孩子搬遷的影響',
    '只說搬家容易，不需要討論孩子的適應過程',
  ],'第一問談孩子是否受益；第二問要比較好處與壞處的份量。'),
  {type:'multi',prompt:'選出範文利弊判斷的兩項主要根據',detail:'選兩項，再按「確認」。',options:[
    '搬遷可訓練適應力，也可能帶來較好教育與未來機會',
    '離開舊友會有短期不適，父母支持可幫助孩子度過',
    '所有孩子搬遷後都立即快樂，絕不會感到失落',
    '只要核心家庭搬家方便，孩子必定完全不用適應',
  ],correct:[0,1],why:'作者承認情感代價，同時比較適應力和長遠機會。'},
];
const route=[sequence('依範文次序排列五段的任務',[
  ['引言立場','核心家庭較易搬遷；孩子確實受益，利大於弊。'],
  ['好處一：適應力','孩子在新環境學規律與交朋友，從初期不適走向自信。'],
  ['好處二：機會','搬遷可能帶來安全、學校和服務條件，支持未來發展。'],
  ['承認及衡量缺點','離開舊友有情感代價，但父母支持可使影響較短暫。'],
  ['結論回答兩問','重申孩子受益，短期壓力未超過適應力與機會的長遠好處。'],
],'先說立場，分兩類好處，再公平評估缺點並完成利弊判斷。')];
const evidence=[
  quiz('孩子搬到新校或城市時，要學習甚麼？',[
    '新規律、結交朋友，以及理解陌生的社交期待',
    '只要換地址，便不需要與新同學相處',
    '所有學校都完全一樣，無須調整任何習慣',
    '只要認識舊朋友，就一定能免於任何變化',
  ],'作者把適應力拆成實際需要學習的三件事。'),
  quiz('小鎮搬到大城的孩子如何逐步變得自信？',[
    '起初迷失，參與課堂和運動隊後較能面對陌生人',
    '起初完全自信，搬遷後反而停止所有活動',
    '只依靠父母換地址，不接觸新環境中的人',
    '參加運動隊後便不需要學校或同學支持',
  ],'具體例子有初期反應、參與活動和其後變化。'),
  quiz('為何父母可能選擇搬到另一區？',[
    '尋找較好工作、更安全社區、更強學校或可靠服務',
    '只因孩子已沒有任何朋友，其他條件都不重要',
    '因所有社區教育與服務完全相同，毋須比較',
    '只為讓孩子失去熟悉老師，不考慮工作或安全',
  ],'新地方的條件是長遠機會的來源。'),
  quiz('哪種新環境有利孩子的學業與社交？',[
    '教育穩定而課外活動易參與的地區',
    '沒有穩定學校也沒有活動的地區',
    '只提供新地址，不提供任何孩子可用的資源',
    '只要求孩子獨自適應，不讓他們接觸同學',
  ],'若學校及活動可及，孩子才較可能取得豐富支援。'),
  quiz('作者承認搬遷可能帶來甚麼缺點？',[
    '離開舊友、老師和熟悉地方而失落，短期情緒或學習受影響',
    '所有孩子永久失去學習能力，沒有任何恢復可能',
    '只有父母會難過，孩子與舊友的關係不受影響',
    '搬遷只換地址，不可能改變情緒或歸屬感',
  ],'文章正面承認失落與暫時影響，才有可信的利弊衡量。'),
  quiz('父母如何減少搬遷帶來的短期困難？',[
    '穩定支持、維持規律，幫孩子聯繫舊友並建立新關係',
    '立即切斷所有舊友關係，讓孩子獨自處理失落',
    '停止任何日常安排，避免孩子適應新地方',
    '只保證房屋變大，不再理會孩子的情緒',
  ],'緩和條件具體落在支持、規律與友誼銜接。'),
  quiz('作者最後如何衡量短期不適與長遠收穫？',[
    '承認過渡期不適真實存在，但認為沒有超過持久好處',
    '否認所有不適，稱每名孩子搬遷時都立刻高興',
    '只說父母搬家較易，完全不比較孩子的利弊',
    '認為短期不適一定永久持續，任何支持都無用',
  ],'權衡並未抹去缺點，而是比較其持續時間與好處。'),
];
const logic=[
  sequence('適應力：從陌生環境到韌性',[
    ['新環境要求','孩子學規律、結交朋友、理解新社交期待。'],
    ['初期不適','這些挑戰一開始可令人不舒服。'],
    ['主動應對','觀察、溝通並學習面對變化，而非一味害怕。'],
    ['具體例子','由小鎮搬大城的孩子參與課堂與運動隊。'],
    ['能力收穫','孩子面對陌生人更自信，搬遷成為韌性訓練。'],
  ],'這段用有前後變化的例子證明適應力如何形成。'),
  sequence('長遠機會與短期缺點的衡量',[
    ['新地方的資源','工作、安全、學校和服務條件可較佳。'],
    ['孩子可得支援','穩定教育與可參與活動支持學業和社交。'],
    ['承認失落','離開舊友、老師和家園可帶來暫時情緒困難。'],
    ['緩和條件','父母保持規律、支持孩子連繫舊友並結新友。'],
    ['最後比較','過渡不適真實，但未超過適應力與機會的長遠好處。'],
  ],'先看資源的持久影響，再承認及評估情感代價。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一名學生轉入新球隊，起初不敢發言，數周後能與隊友合作。','哪項最能轉用範文的適應力論證？',[
    '初期不適可促使他觀察、溝通，逐步學會面對變化',
    '只要起初不敢發言，就可斷定轉隊沒有任何好處',
    '他能合作必定與參與新隊伍完全沒有關係',
    '轉隊後應避免任何新朋友，才可能變得自信',
  ],[
    '範文把初期不舒服與觀察、溝通和其後自信連起來。',
    '題目明說數周後有合作進展。',
    '這忽略新環境中的練習。',
    '範文例子正有加入運動隊。',
  ],[3,4,5,6],'範文說孩子在新地方學規律、交朋友，逐漸變得更有韌性。'),
  transfer('一個家庭考慮搬到學校穩定、放學活動容易參加的地區。','哪項最符合範文的長遠機會論證？',[
    '新地區可給孩子學業與社交支持，影響日後選擇',
    '只要學校名稱不同，孩子的學業必定立刻退步',
    '活動可參與與否，絕不會影響孩子的交友機會',
    '只看搬家距離，不必理會新地區的教育資源',
  ],[
    '範文把穩定教育和活動可及性連到學業社交及未來前景。',
    '題目沒有說孩子必然退步。',
    '社交活動正是交友資源。',
    '原文重視新區實際條件。',
  ],[7,8,9,10],'範文說穩定學校與可參與的課外活動可帶來更豐富支持。'),
  transfer('公司員工調到新城市，初期感到陌生，後來透過社群活動建立人脈。','哪項最貼近範文例子的時間順序？',[
    '先承認陌生感，再交代參與活動如何帶來自信',
    '先宣稱員工永久失落，再忽略社群活動的作用',
    '只列新城市人口，不解釋員工後來的變化',
    '只說員工有新地址，完全不談人際適應',
  ],[
    '範文例子由初期迷失，經參與課堂和運動隊，走向自信。',
    '題目已有後續融入，不能說永久失落。',
    '人口不是本題的適應機制。',
    '新地址不等於成長過程。',
  ],[4,5,6],'範文以小鎮搬大城的孩子，展示從迷失到參與活動後的自信。'),
  transfer('新移民孩子搬家後想念舊朋友，父母準備每周通話並協助參加新社團。','哪項最能轉用範文的緩和措施？',[
    '維持舊友聯繫並建立新關係，可減少短期失落',
    '立即斷絕所有舊友聯繫，讓孩子獨自適應',
    '只增加房間面積，不過問孩子的人際關係',
    '避免任何固定作息，讓孩子每天重新摸索',
  ],[
    '範文建議父母支持、維持規律並兼顧舊友與新友。',
    '這刪掉原文強調的舊友連結。',
    '空間大小不能代替情感支持。',
    '維持規律正是原文的緩和條件。',
  ],[11,12,13,14],'範文承認離開舊友會難過，並建議在交新友時保持舊聯繫。'),
  transfer('一名成年人換工作後壓力很大，但新職位提供訓練與更好晉升機會。','哪項最符合範文的利弊衡量方式？',[
    '承認轉職壓力，再比較其持續時間與長遠機會',
    '否認壓力真實存在，才有資格說新工作有好處',
    '只看第一周情緒，就斷定任何長遠機會都無用',
    '只列升職機會，不需要判斷壓力是否可緩和',
  ],[
    '範文承認過渡不適，再與長遠收穫比較其份量。',
    '原文明言不適真實。',
    '第一周不足以代表整體結果。',
    '完整衡量需要看短期代價。',
  ],[13,14,15,17],'範文說過渡不適是真實的，仍要衡量它與持久好處。'),
  transfer('家長說搬到新區只換了地址，沒有改變孩子的能力。','哪項最能回應這個看法？',[
    '孩子可能在新環境學會交友、溝通與應對改變',
    '孩子換地址後一定不必接觸任何新的人或規律',
    '搬家只改變門牌，學校和社交期待必然相同',
    '只要孩子起初難過，就永遠無法學會適應',
  ],[
    '範文以 not just 換地址，強調搬遷也可成為韌性課。',
    '題目忽略新環境的真實要求。',
    '範文列新規律和社交期待。',
    '初期難過與後來成長可以並存。',
  ],[2,3,4,6],'範文說搬遷不只換地址，也能鍛鍊適應與韌性。'),
  transfer('地區政策鼓勵家庭搬去另一區，宣稱每名孩子都一定受益。','哪項最符合範文的審慎語氣？',[
    '說明可能好處，也承認有些孩子會短暫失落',
    '保證每名孩子都不會想念朋友，也沒有適應期',
    '只列搬遷的成本，不看新校是否帶來新資源',
    '假設家庭人數少，孩子就不會有任何情緒變化',
  ],[
    '範文用 may 和 In some cases，避免說每個孩子結果相同。',
    '這抹去原文承認的情感困難。',
    '新資源是衡量好處的根據。',
    '家庭易搬不代表孩子沒有情緒。',
  ],[0,9,11,13],'範文承認可能的短期情緒影響，同時指出新環境可提供機會。'),
  transfer('一所學校改校址，學生失去熟悉老師，但新校增加社團和升學支援。','哪項最能公平比較學生利弊？',[
    '承認離開老師的代價，再評估新資源的長遠作用',
    '只要新校有社團，就說學生一定沒有失落感',
    '只要有人難過，就否定所有新增升學支援',
    '只計算校址距離，不討論老師或學業條件',
  ],[
    '範文把離開熟悉人事的代價與新教育資源一起衡量。',
    '新資源不會自動消除失落。',
    '難過也不必然抵銷長期支援。',
    '題目的人際和學校條件都重要。',
  ],[9,10,12,14,15],'範文承認離開熟悉老師會失落，再比較較佳資源和長遠收益。'),
  transfer('家庭搬家後，父母想協助孩子適應，但只有一次歡迎派對。','哪項更貼近範文的父母支持方式？',[
    '持續維持日常規律，並協助孩子聯繫新舊朋友',
    '一次派對後便停止所有關注，讓孩子獨自處理',
    '禁止孩子與舊友聯絡，避免他們想起舊生活',
    '只添置新傢具，不理會孩子的心情或作息',
  ],[
    '範文要求 steady support、規律和新舊友誼銜接。',
    '單次活動不等於穩定支持。',
    '原文鼓勵保持舊友聯繫。',
    '物件不能替代情感及生活支持。',
  ],[12,13,14],'範文用 if 說明缺點較短暫的條件：穩定支持、規律和友誼連結。'),
  transfer('題目同時問孩子是否受益，以及搬遷是否利大於弊。','哪項結論最完整？',[
    '重申孩子受益，再承認短期壓力並衡量長期好處',
    '只說核心家庭搬家方便，不判斷孩子的受益情況',
    '只列搬遷可能辛苦，沒有比較適應力與機會',
    '只談新學校設備，不回答孩子是否會受益',
  ],[
    '範文最後兩句先答受益，再答短期代價與長期好處的比較。',
    '家庭規模不是兩個題問的完整答案。',
    '第二問要求作出利弊判斷。',
    '第一問仍需清楚表態。',
  ],[16,17],'範文結論先說孩子能受益，再以適應力和機會判斷利大於弊。'),
];
const revised=[
  {options:['初期不適促使觀察溝通，後來逐步學會合作。','起初少說話，表示新隊伍難帶來社交成長。','合作進步主要來自時間推移，與新隊伍無關。','轉隊後減少接觸隊友，通常更易建立自信。'],explanations:['題目呈現從陌生到合作的適應過程。','初期不適不能否定後續進展。','新環境中的反覆練習是可見機制。','避開隊友不會練習合作與溝通。']},
  {options:['新區的學校與活動，可支持學業、社交和日後選擇。','學校較穩定，但活動可及性與社交關係較少相關。','搬遷本身會帶來機會，毋須比較新區的實際條件。','先比較搬家距離，教育資源可留待入學後評估。'],explanations:['學校穩定及活動可及性可能擴大長遠機會。','社團活動也可能提供交友和協作經驗。','實際教育與活動條件才是機會的來源。','只看距離不足以判斷搬遷的教育收益。']},
  {options:['先承認陌生感，再說明活動如何帶來自信。','先描述後來的自信，初期陌生感可省略。','只列新城市人口，員工適應情況留給讀者推測。','員工有了新地址，便可直接視為完成融入。'],explanations:['前後順序和參與機制共同解釋變化。','省略初期困難會失去成長的起點。','人口數據不能說明個人適應過程。','地址變更不等於建立人脈與信心。']},
  {options:['維持舊友聯繫並建立新關係，可減少短期失落。','先安排新社團，舊友聯繫留到適應後恢復。','增加房間空間，孩子的社交適應交由學校處理。','保持舊友通話，新區活動則暫時避免參與。'],explanations:['舊連結與新連結可共同支援過渡。','推遲舊友聯繫可能加重失落。','居住空間不能代替情感與人際支持。','只保留舊友會減少建立新關係的機會。']},
  {options:['承認轉職壓力，再比較其時長與長遠機會。','先列晉升機會，轉職壓力視作無關細節。','只看首周壓力，較後的訓練收益暫不評估。','只列壓力與升職項目，不判斷兩者的相對份量。'],explanations:['公平衡量須同時看真實代價與持續收益。','壓力存在，不能因有機會而省略。','一周感受不能代表長期結果。','列項而不比較仍無法得出利弊判斷。']},
  {options:['新環境可讓孩子練習交友、溝通及應對改變。','搬遷改了門牌，學校和社交要求應與舊區相同。','孩子起初難過，後來的適應能力便較難評估。','換了地址就會成熟，毋須安排父母持續支持。'],explanations:['新規律和新關係可能成為適應力練習。','搬遷往往帶來實際社交與學校變化。','初期失落與日後成長可以並存。','成長不是地址變化自動造成，仍需支持。']},
  {options:['說明可能好處，也承認部分孩子會短暫失落。','說明可能好處，孩子想念舊友則留待個別處理。','集中列搬遷成本，新校資源可留到實施後討論。','用家庭人數預測情緒，較少評估孩子原有關係。'],explanations:['用審慎語氣承認不同孩子有不同反應。','忽略失落會把正面結論說得過滿。','只看成本也會漏掉新資源的好處。','家庭人數不能代替對情感連結的了解。']},
  {options:['承認離開老師的代價，再評估新資源長遠作用。','有新社團便可先不問學生是否想念原來老師。','學生想念老師，升學支援的作用便較少評估。','先比較新校距離，老師及升學條件另作附錄。'],explanations:['人際失落和長期教育機會都需納入。','新資源不會自動消除情感代價。','難過也不代表升學支援毫無價值。','距離不能涵蓋題述主要利弊。']},
  {options:['持續維持規律，也幫孩子聯繫新舊朋友。','歡迎派對已辦，日常規律留待孩子自行建立。','先集中結識新友，舊友聯絡等情緒穩定再說。','添置新傢具可改善環境，情緒適應交由學校。'],explanations:['持續支持比一次活動更能幫助過渡。','單次派對不能取代穩定作息。','舊連結能減輕離開熟悉關係的失落。','物品改善不能直接代替情感支持。']},
  {options:['重申孩子受益，再承認短期壓力並衡量長遠好處。','只談家庭搬遷是否方便，孩子受益可由此推知。','重申短期辛苦，適應力與新機會留到正文處理。','只列新校設備，利弊判斷則由讀者自行作出。'],explanations:['兩個問題分別要求受益判斷與利弊比較。','家長方便不能直接代表孩子受益。','結論仍需概括完整的權衡。','不明確比較便沒有回答第二問。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:26',meta:{topic:'搬遷對孩子的好處與利弊衡量',summary:'新環境可培養適應力並帶來較好機會；短期失落真實，父母支持可減輕。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
