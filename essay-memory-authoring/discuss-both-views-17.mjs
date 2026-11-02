// Full source-specific memorisation support for Discuss Both Views 17.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:17'];
const original=groups.map(row=>row.english);
const simple=[
  'Many people think either parents or teachers have the greatest effect on how well a child does at school.',
  'Parents clearly matter because they make the home where children first learn good study habits, but I think teachers have a bigger effect on school learning because they decide how lessons are taught, planned and directed.',
  'On one side, parents have a strong effect on how children feel about studying.',
  'Children raised in homes where reading, good habits and wanting to know more are encouraged are more likely to see learning as a normal part of life, not as something heavy they must carry.',
  'For example, a parent who sets regular study times, removes things that draw attention away and praises effort can help a child keep trying well before exams begin to feel stressful.',
  'In this way, parents are like the ground where a child first starts to believe they can learn: without their help, even a child who is good at school may stop wanting to try.',
  'On the other side, teachers usually affect a child’s school learning more directly and with more skill in teaching.',
  'Teachers do more than encourage children; they plan lessons, explain hard ideas, check how children are doing and fix wrong ideas before they become hard to change.',
  'For example, a good maths teacher can find out why a student keeps making the same mistake in algebra and then explain it in a new way until the student understands.',
  'Most parents find it hard to give this kind of help with a particular school subject, especially when subjects become more advanced.',
  'Also, teachers can look at how one child is doing next to many classmates, which helps them see more clearly what the child does well and what needs work.',
  'To sum up, parents help children form study habits and feelings about learning from the beginning.',
  'But I think teachers have a bigger effect on school learning because they know their subjects, know how to teach and often see how students are doing.',
];
const vocabulary=[
  [['widely believed','Many people think','普遍認為'],['academic progress','how well a child does at school','學業進步'],['shaped','have the greatest effect','塑造'],['either mainly by parents or mainly by teachers','either parents or teachers','父母或教師主導']],
  [['While parents are undeniably important','Parents clearly matter','父母無疑重要'],['create the home environment','make the home','營造家庭環境'],['learning habits begin','first learn good study habits','學習習慣起點'],['greater influence','bigger effect','較大影響'],['academic development','school learning','學業發展'],['quality, structure and direction','how lessons are taught, planned and directed','質素結構方向']],
  [['On the one hand','On one side','一方面'],['powerful role','strong effect','重要作用'],['attitude towards study','how children feel about studying','學習態度']],
  [['grow up in homes','raised in homes','在家庭中成長'],['discipline','good habits','自律'],['curiosity','wanting to know more','好奇心'],['more likely','more likely','較可能'],['normal part of daily life','normal part of life','日常部分'],['burden','something heavy they must carry','負擔']],
  [['For example','For example','例如'],['regular study times','regular study times','固定學習時間'],['limits distractions','removes things that draw attention away','減少干擾'],['praises effort','praises effort','讚賞努力'],['build persistence','keep trying','培養堅持'],['long before exam pressure appears','well before exams begin to feel stressful','考試壓力前']],
  [['In this sense','In this way','從這意義'],['soil','ground','土壤'],['academic confidence first takes root','first starts to believe they can learn','學業信心扎根'],['without their support','without their help','若無支持'],['capable student','child who is good at school','有能力學生'],['lose motivation','stop wanting to try','失去動機']],
  [['On the other hand','On the other side','另一方面'],['more direct','more directly','更直接'],['professional impact','more skill in teaching','專業影響'],['academic growth','school learning','學業發展']],
  [['not limited to encouragement','do more than encourage children','不只鼓勵'],['design lessons','plan lessons','設計課程'],['complex ideas','hard ideas','複雜概念'],['assess progress','check how children are doing','評估進度'],['correct misunderstandings','fix wrong ideas','糾正誤解'],['permanent weaknesses','hard to change','長期弱點']],
  [['skilled mathematics teacher','good maths teacher','有能力數學教師'],['identify why','find out why','找出原因'],['algebra mistake','mistake in algebra','代數錯誤'],['adjust the explanation','explain it in a new way','調整講解'],['concept becomes clear','student understands','概念清晰']],
  [['targeted academic guidance','help with a particular school subject','針對性學科指導'],['difficult for most parents','Most parents find it hard','大部分家長難做'],['more specialised','more advanced','更專門化']],
  [['Moreover','Also','此外'],['compare a child’s performance','look at how one child is doing next to','比較表現'],['many peers','many classmates','多名同學'],['judge strengths and weaknesses','see more clearly what the child does well and what needs work','判斷強弱'],['more accurately','more clearly','更準確']],
  [['In conclusion','To sum up','總結'],['foundations','from the beginning','基礎'],['learning habits','study habits','學習習慣'],['emotional attitude towards education','feelings about learning','對學習的情緒態度']],
  [['However','But','然而'],['subject expertise','know their subjects','學科專長'],['teaching methods','know how to teach','教學方法'],['regular access to academic performance','often see how students are doing','定期掌握學業表現'],['greater influence','bigger effect','更大影響']],
];
const chunkOverrides=[
  ['It is widely believed that a child’s academic progress','is shaped either mainly by parents','or mainly by teachers.'],
  ['While parents are undeniably important because they create','the home environment in which learning habits begin,','I believe teachers have the greater influence','on academic development, as they directly control','the quality, structure and direction of a child’s formal education.'],
  ['On the one hand, parents play a powerful role','in shaping a child’s attitude towards study.'],
  ['Children who grow up in homes where reading,','discipline and curiosity are encouraged','are more likely to see education as a normal part','of daily life rather than a burden.'],
  ['For example, a parent who sets regular study times,','limits distractions and praises effort can help a child','build persistence long before exam pressure appears.'],
  ['In this sense, parents are like the soil','in which academic confidence first takes root:','without their support, even a capable student','may lose motivation.'],
  ['On the other hand, teachers usually have','a more direct and professional impact','on a child’s academic growth.'],
  ['Their influence is not limited to encouragement;','they design lessons, explain complex ideas,','assess progress and correct misunderstandings','before they become permanent weaknesses.'],
  ['A skilled mathematics teacher, for instance, can identify','why a student keeps making the same algebra mistake','and then adjust the explanation until the concept becomes clear.'],
  ['This kind of targeted academic guidance is difficult','for most parents to provide,','especially as subjects become more specialised.'],
  ['Moreover, teachers can compare a child’s performance','with that of many peers,','which allows them to judge strengths and weaknesses more accurately.'],
  ['In conclusion, parents build the foundations','of a child’s learning habits and emotional attitude towards education.'],
  ['However, because teachers possess subject expertise,','teaching methods and regular access to academic performance,','I believe they exert a greater influence','on a child’s academic development.'],
];
const simpleChunkOverrides=[
  ['Many people think either parents or teachers','have the greatest effect on how well a child does at school.'],
  ['Parents clearly matter because they make the home','where children first learn good study habits,','but I think teachers have a bigger effect on school learning','because they decide how lessons are taught, planned and directed.'],
  ['On one side, parents have a strong effect','on how children feel about studying.'],
  ['Children raised in homes where reading, good habits','and wanting to know more are encouraged','are more likely to see learning as a normal part of life,','not as something heavy they must carry.'],
  ['For example, a parent who sets regular study times,','removes things that draw attention away and praises effort','can help a child keep trying','well before exams begin to feel stressful.'],
  ['In this way, parents are like the ground','where a child first starts to believe they can learn:','without their help, even a child who is good at school','may stop wanting to try.'],
  ['On the other side, teachers usually affect a child’s school learning','more directly and with more skill in teaching.'],
  ['Teachers do more than encourage children;','they plan lessons, explain hard ideas,','check how children are doing and fix wrong ideas','before they become hard to change.'],
  ['For example, a good maths teacher can find out why','a student keeps making the same mistake in algebra','and then explain it in a new way','until the student understands.'],
  ['Most parents find it hard to give this kind of help','with a particular school subject,','especially when subjects become more advanced.'],
  ['Also, teachers can look at how one child is doing next to','many classmates, which helps them see more clearly','what the child does well and what needs work.'],
  ['To sum up, parents help children form study habits','and feelings about learning from the beginning.'],
  ['But I think teachers have a bigger effect on school learning','because they know their subjects, know how to teach','and often see how students are doing.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('It is widely believed that a young athlete’s progress is shaped either mainly by coaches or mainly by family.','以 either ... or ... 界定兩種主導來源',[1,2,6],fixed(0,'It is widely believed that [孩子學業進步] is shaped either mainly by [父母] or mainly by [教師].','開篇界定學業成長究竟主要受誰影響的分歧。','要提出一項成長結果有兩個可能主導來源時。',['It is widely believed that ', ' is shaped either mainly by ', ' or mainly by '],['被討論的結果','第一個可能來源','第二個可能來源'])),
  card('While family support matters because it shapes early habits, I believe coaches have greater influence, as they guide formal training.','以 While ... because ... I believe ... as ... 讓步父母再選教師',[0,2,12],fixed(1,'While [父母重要] because [營造早期學習環境], I believe [教師影響更大], as [直接掌控正規教學].','父母建立習慣，但教師決定正式教學品質，故作者選教師。','兩方都有作用，要承認一方的早期基礎，再以另一方直接掌控核心過程作立場時。',['While ', ' because ', ', I believe ', ', as '],['先承認的一方','其基礎作用','作者較支持的另一方','選它的直接作用'])),
  card('On the one hand, families play a powerful role in shaping children’s attitude towards sport.','以 role in shaping ... 說父母影響學習態度',[1,3,6],fixed(2,'On the one hand, [父母] play a powerful role in shaping [孩子對學習的態度].','第一主體段公平承認家庭對學習態度的影響。','要開始分析一方如何塑造態度，而不誇稱其包辦所有成果時。',['On the one hand, ', ' play a powerful role in shaping '],['對態度有影響的一方','被塑造的態度'])),
  card('Children who grow up in homes where exercise is encouraged are more likely to see movement as daily life rather than a burden.','以 who grow up ... more likely ... rather than ... 說家庭文化影響觀感',[2,4,5],fixed(3,'Children who grow up in homes where [閱讀自律好奇受鼓勵] are more likely to see [教育] as [日常正常部分] rather than [負擔].','家庭日常氣氛可使孩子把學習當成生活一部分。','要說明長期成長環境如何增加某種健康看法、減少負面看法時。',['Children who grow up in homes where ', ' are more likely to see ', ' as ', ' rather than '],['家庭中被鼓勵的行為','孩子看待的事物','較可能形成的觀感','較少出現的觀感'])),
  card('For example, a parent who sets regular practice and praises effort can help a child persist long before major contests.','以 who ... can help ... long before ... 舉父母早期行動例子',[3,5,7],fixed(4,'For example, [定時學習、減干擾、讚努力的父母] can help [孩子培養堅持] long before [考試壓力出現].','具體措施在高壓考試前已可建立持續努力習慣。','要舉出某人幾項日常行動，說明其成果早於正式壓力出現時。',['For example, ', ' can help ', ' long before '],['長期採取措施的人','所培養的習慣','後來才出現的壓力'])),
  card('In this sense, families are like soil where confidence takes root: without support, even able children may stop trying.','以土壤比喻與 without 說家庭是早期信心根基',[4,6,7],fixed(5,'In this sense, [父母] are like [信心扎根的土壤]: without [支持], even [有能力學生] may [失去動機].','家庭是早期成長根基；缺支持時能力也可能不足以持續。','要以基礎比喻說一方如何支持成長，再指出缺乏它的後果時。',['In this sense, ', ' are like ', ': without ', ', even ', ' may '],['提供早期根基的人','比喻的根基','欠缺的支持','仍可能受影響的人','失去的狀態'])),
  card('On the other hand, coaches usually have a more direct and professional impact on athletic progress.','以 more direct and professional impact 轉入教師核心作用',[2,5,8],fixed(6,'On the other hand, [教師] usually have a more [直接且專業] impact on [學業成長].','第二主體段比較正式學習時教師的直接專業影響。','已說一方提供家庭基礎，要轉入另一方對專門成果更直接的影響時。',['On the other hand, ', ' usually have a more ', ' impact on '],['另一方專業人員','影響的特點','被影響的正式成果'])),
  card('A doctor’s work is not limited to reassurance; they diagnose problems, plan care and correct risks before they grow serious.','以 not limited to ...; they ... before ... 列教師超越鼓勵的職責',[6,8,9],fixed(7,'[教師作用] is not limited to [鼓勵]; they [設計、講解、評估和糾正] before [誤解成為長期弱點].','教師還能及早發現與修正學科理解問題。','要說明專業人員不只提供情緒支持，還會及早完成多項技術工作時。',[' is not limited to ', '; they ', ' before '],['所討論的專業作用','表面上較易看到的部分','其他具體專業工作','要避免的長期問題'])),
  card('A skilled coach, for instance, can identify why a player repeats an error and then adjust practice until the move becomes clear.','以 identify why ... adjust ... until ... 展示診斷與改教',[7,9,10],fixed(8,'[熟練數學教師], for instance, can identify why [學生反覆犯代數錯] and then adjust [講解] until [概念清楚].','老師不只告知答錯，還找原因、換講法直到懂。','要以具體教學例子說先找出反覆錯誤原因，再調整方法直至理解時。',[', for instance, can identify why ', ' and then adjust ', ' until '],['有專長的指導者','反覆出現的錯誤','被調整的方法','達到理解的終點'])),
  card('This kind of targeted coaching is difficult for most families to provide, especially as skills become specialised.','以 difficult ... especially as ... 說專門化後家長難替代',[8,10,12],fixed(9,'This kind of [針對性學科指導] is difficult for [大部分家長] to provide, especially as [學科愈專門].','教師的專科分析不是多數家長能持續代替。','要指出某種專業支援一般人難提供，且隨內容專門化更難時。',['This kind of ', ' is difficult for ', ' to provide, especially as '],['需專業知識的支援','較難提供者','難度增加的條件'])),
  card('Moreover, coaches can compare one player’s performance with that of many peers, which allows them to judge strengths more accurately.','以 compare ... which allows ... 說教師可用同儕比較判斷強弱',[7,8,9],fixed(10,'Moreover, [教師] can compare [一名孩子表現] with that of [許多同學], which allows them to judge [強弱] more accurately.','教師見過多名學生，較能判斷個別孩子的長處與不足。','要補充某專業人員因有多個可比案例，而能更準確評估個體時。',['Moreover, ', ' can compare ', ' with that of ', ', which allows them to judge ', ' more accurately.'],['有比較經驗的專業人員','被評估的個體','可作參照的其他人','能更準確判斷的特點'])),
  card('In conclusion, families build the foundations of a child’s habits and feelings towards sport.','以 build the foundations of 公平重申父母奠基作用',[2,5,12],fixed(11,'In conclusion, [父母] build the foundations of [學習習慣及對教育的情緒態度].','結論先重申父母在家庭日常中的早期奠基作用。','結論在選主責前，先公平重述另一方確實建立的長期基礎時。',['In conclusion, ', ' build the foundations of '],['奠基的一方','由它建立的態度及習慣'])),
  card('However, because coaches know the sport and assess performance regularly, I believe they exert a greater influence on athletic progress.','以 because ... I believe ... 從專長與觀察作結論',[1,10,11],fixed(12,'However, because [教師有學科專長、教法及持續表現資料], I believe [教師] exert a greater influence on [學業發展].','最終由學科能力、教法和持續觀察判斷教師影響較大。','已承認基礎作用，要用專業知識、方法及持續觀察說明誰較直接決定成果時。',['However, because ', ', I believe ', ' exert a greater influence on '],['主責者具備的證據與能力','被判斷更有影響的人','其影響的成果'])),
];
const wrongReasons=[
  ['這句已讓步父母並選教師，原句先設定兩個可能主導來源。','這句只展開父母作用，未界定父母與教師的爭議。','這句已轉入教師專業影響，並非引言的問題界定。'],
  ['這句提出父母或教師兩種可能，未用 While 讓步及 as 作立場。','這句只說父母塑造態度，未比較正式教學由誰掌控。','這句是結論以專長重申教師，未在引言承認父母基礎。'],
  ['這句在引言已選教師，未展開父母對態度的作用。','這句分析家庭氣氛如何改變孩子看法，原句先概括。','這句轉入教師專業影響，與本句的父母段不同。'],
  ['這句只概括父母塑造態度，未說家庭中被鼓勵的行為。','這句是家長具體定時與讚努力例子，未描述成長環境。','這句以土壤比喻家庭支持，未直接說孩子看教育的觀感。'],
  ['這句描述家庭鼓勵的氣氛，未用 For example 列家長日常措施。','這句把父母比作土壤並說失動機風險，未寫定時讚賞。','這句是教師能診斷代數錯誤的例子，非家長措施。'],
  ['這句是家長具體措施，未以土壤比喻早期信心根基。','這句已轉入教師的直接專業影響，未總結家庭基礎。','這句說教師作用不只鼓勵，與父母支持的比喻不同。'],
  ['這句只概括父母塑造態度，未轉到教師的專業影響。','這句以土壤比喻父母奠基，與本句比較的另一方不同。','這句舉教師找代數錯因，原句先概括專業影響。'],
  ['這句先提出教師更直接，未列設計課程與糾正誤解等工作。','這句是一名數學教師的診斷例子，未並列多項職責。','這句說家長難提供針對性指導，未說教師具體可做甚麼。'],
  ['這句列教師多項一般工作，未用代數個案展示診斷改教。','這句抽出家長難提供的專業指導，未具體寫代數錯因。','這句談教師同儕比較的另一優勢，未說錯誤修正。'],
  ['這句是教師找代數錯因的個案，未推及大多數家長難做。','這句說教師可比較同學表現，未講專科指導難替代。','這句結論以專長選教師，未提學科愈專門化的條件。'],
  ['這句列教師糾正誤解的工作，未說比較多名學生的資訊。','這句說家長難提供學科指導，未指出教師能以同儕作參照。','這句結論選教師主責，未以 which 說比較帶來的評估優勢。'],
  ['這句只概括父母主體段的態度作用，未在結論重新肯定根基。','這句土壤比喻仍在主體段，未結論重述態度和習慣。','這句已用 However 選教師，原句先公平保留父母作用。'],
  ['這句是引言選教師，未在結論根據學科專長與觀察重申。','這句只說教師較直接，未列專長教法表現資訊的理由。','這句結論先說父母奠基，未轉入教師較大的影響。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分家庭形成的學習態度，再看教師對正式課程與學科理解的直接作用。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目比較誰更影響孩子的學業發展？',[
    '父母的家庭培養，與教師的正式教學',
    '只比較父母和教師誰較擅長做飯',
    '只比較兩間學校的制服和校舍',
    '只比較小學與中學的放學時間',
  ],'題目比較家庭與教師對學業進步的影響。'),
  {type:'multi',prompt:'選出作者的完整立場',detail:'選兩項，再按「確認」。',options:[
    '父母奠定學習習慣與對教育的態度',
    '教師以學科知識和教法更直接影響學業',
    '父母能完全取代所有專科教師的教學',
    '教師只需鼓勵，毋須解釋與修正誤解',
  ],correct:[0,1],why:'作者承認家庭奠基，但認為教師對正式學業成長影響較大。'},
];
const route=[sequence('依文章次序排列影響力比較',[
  ['引言立場','父母塑造家庭環境，教師更直接掌控正式教學。'],
  ['父母的基礎','鼓勵閱讀、定時學習、減干擾與讚賞努力。'],
  ['教師的專業','設計講解評估；找代數錯因並與同學表現比較。'],
  ['結論主次','父母奠基，教師因學科能力與持續觀察影響更大。'],
],'比較的是學業發展的主導影響，不是否定另一方的作用。')];
const evidence=[
  quiz('家庭鼓勵閱讀、自律和好奇，孩子較可能如何看學習？',[
    '把學習看作日常生活的一部分，而非沉重負擔',
    '把閱讀只看成考試前一天才需做的事情',
    '認為學校課程永遠不需任何正式教師',
    '只要家中有書，便保證每科全都滿分',
  ],'家庭氣氛能影響學習態度，未必直接教授所有學科。'),
  quiz('家長定時學習、減干擾與讚努力的例子支持甚麼？',[
    '考試壓力出現前，孩子已可培養持續努力',
    '家長只要定時，便不需再理孩子是否努力',
    '家長可因此代替所有代數和科學專科教師',
    '考試壓力開始後，學習態度才第一次形成',
  ],'家長措施可在早期培養堅持。'),
  quiz('土壤比喻如何形容父母作用？',[
    '父母提供信心扎根的早期支持，缺少時易失動機',
    '父母只負責種花，與孩子學習完全沒有關係',
    '孩子只要有能力，永遠不需要家庭任何支持',
    '教師只要教過一次，家庭氣氛便再無影響',
  ],'父母是學習信心的基礎環境。'),
  quiz('教師的影響為何不只限於鼓勵？',[
    '還能設計課程、解釋、評估及及早糾正誤解',
    '只會讚賞努力，完全不需了解學科內容',
    '只決定家中作息，不會接觸課堂進度',
    '只須比較不同學校的校服款式',
  ],'正式教學包括多項專業工作。'),
  quiz('代數錯誤例子最清楚展示教師甚麼能力？',[
    '找出反覆犯錯原因，再換講法直到學生理解',
    '只告訴學生錯了，永遠不需要知道原因',
    '只要求家長每天買更多代數練習紙',
    '只把學生與同學比較，卻完全不教概念',
  ],'例子呈現診斷錯因與調整教法。'),
  quiz('為何大多數父母難提供同樣指導？',[
    '學科愈專門化，針對性分析愈需相關專長',
    '因為家長一旦工作，就完全不再關心孩子',
    '因為每一名家長都拒絕孩子閱讀任何書',
    '因為教師只憑年齡就能代替所有家庭支持',
  ],'作者說專科學業指導難由多數父母提供。'),
  quiz('教師比較許多同學表現有何作用？',[
    '較準確判斷個別孩子的長處與不足',
    '讓每位孩子都必須取得完全相同分數',
    '使教師毋須再解釋任何艱深概念',
    '保證家長從此不用培養學習習慣',
  ],'多個可比案例可改善教師的評估。'),
];
const logic=[
  sequence('父母如何建立學業基礎',[
    ['家庭氣氛','鼓勵閱讀、自律和好奇，使學習成日常。'],
    ['具體行動','定時學習、減少干擾、讚賞努力。'],
    ['早期結果','在考試壓力前建立堅持與信心。'],
    ['界線','這是重要基礎，並非所有專科教學的替代。'],
  ],'作者承認父母塑造態度和長期習慣。'),
  sequence('教師為何對學業發展影響更大',[
    ['直接職責','設計課程、解釋概念、評估並糾錯。'],
    ['針對個案','找出代數錯因，換講法直到學生懂。'],
    ['專科界線','學科愈專門，家長愈難提供同類指導。'],
    ['比較經驗','參照多名同學，更準確判斷強弱。'],
  ],'學科專長、教法及持續接觸學業表現，使教師更直接影響成果。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一名少年在家受鼓勵練琴，但遇到難曲時，音樂教師能找出他手指動作的錯因。','哪項最符合範文的影響分工？',[
    '家庭培養持續練習態度，教師直接診斷專門技巧',
    '家庭既鼓勵練琴，教師的任何示範都沒有用途',
    '教師既能找錯因，家庭的日常鼓勵便毫無影響',
    '兩方都接觸孩子，所以無法討論各自影響甚麼',
  ],['基礎態度與專業指導可同時重要，作用不同。','過度否定教師。','過度否定家庭。','分工仍可辨。'],[1,4,8,12],'父母培養習慣，教師能找出專科錯因並調整教法。'),
  transfer('家長每天陪孩子閱讀，孩子漸漸把看書當成生活一部分。','這最貼近範文的哪項家庭作用？',[
    '家庭氣氛讓學習變成日常而不只是壓力',
    '陪讀一次便能取代所有學科教師的教學',
    '有書的家庭必然保證孩子每科得到滿分',
    '閱讀只在考試前一天才可能有任何作用',
  ],['長期家庭文化影響孩子看待學習的態度。','陪讀不等於專科教學。','過度保證結果。','與長期日常相反。'],[2,3,4],'在鼓勵閱讀的家庭成長，孩子較可能視教育為日常。'),
  transfer('學生反覆把代數題的負號看錯，家長只看見分數下降，老師則發現他誤解了運算次序。','老師的優勢是甚麼？',[
    '能辨認反覆錯誤的原因，再改變講法幫學生理解',
    '只要分數下降，就完全不必再查學生的誤解來源',
    '老師只可給學生加題，不能調整任何講解方式',
    '家長看見分數下降，便證明所有課堂內容都無效',
  ],['診斷原因與調整解釋是教師的專業作用。','只看表面分數。','忽略教法調整。','過度否定課堂。'],[7,8,9],'數學教師能找到反覆代數錯誤的原因並改變解釋。'),
  transfer('社區足球教練帶過許多同齡球員，能看出某孩子擅長傳球但需要改善跑位。','這最接近教師的哪項優勢？',[
    '以多名同儕作參照，較準確看出個別強項與弱項',
    '只要見過多人，就必須讓每人採用完全相同戰術',
    '教練有比較經驗，便不再需要教任何基本動作',
    '球員家人若曾鼓勵他，教練就不能評估其表現',
  ],['多個可比案例支援更準確的個別判斷。','比較不要求一致。','仍需教學。','家庭支持不取消評估。'],[10],'教師比較多名同學表現，能較準確判斷強弱。'),
  transfer('父母為孩子建立固定溫習時間，考試前孩子較能持續努力。','哪項最能解釋例子的時間關係？',[
    '早期家庭安排先養成堅持，再面對較大的考試壓力',
    '考試壓力完全消失後，孩子才第一次養成學習態度',
    '只要家長訂出時間，所有考試內容便不用再學習',
    '固定溫習只影響課室椅子，與努力習慣毫無關係',
  ],['家長日常措施可早於考試壓力建立習慣。','倒置時間。','過度替代學習。','忽略習慣。'],[3,4,5],'家長設定學習時間等，可在考試壓力前培養堅持。'),
  transfer('一名孩子在家得到很多鼓勵，但進階化學概念仍需要懂學科的人幫他釐清。','哪項最符合範文的專門化界線？',[
    '鼓勵有助信心，專門內容仍可能需要教師針對性指導',
    '家中只要常鼓勵，所有化學概念必然自動變得清楚',
    '化學變難，就證明家庭鼓勵從一開始完全沒有價值',
    '只要有教師講解，孩子便永遠不需任何家庭支持',
  ],['父母奠基與教師專科指導各有作用。','誇大家庭能力。','過度否定家庭。','過度否定支持。'],[5,7,9],'學科愈專門，多數家長愈難提供教師式的針對性指導。'),
  transfer('一位學生過去怕寫作，家人經常讚賞努力；老師則逐段指出論點不清之處。','哪項評估最公平？',[
    '家人幫助建立信心，老師提供直接的寫作診斷',
    '家人只要讚努力，寫作論點就必然全部清楚',
    '老師能指出問題，家人對信心便沒有任何作用',
    '學生一旦害怕寫作，就不可能從兩方得到幫助',
  ],['情緒態度與技術修正都重要，但對學業的作用不同。','讚賞不等於診斷。','否定家庭奠基。','過度悲觀。'],[4,5,7,8],'父母支持早期信心，教師可糾正具體理解問題。'),
  transfer('學校想向家長解釋，為何老師設計課程與評估不是單純「鼓勵孩子」的另一種說法。','哪項最貼近範文？',[
    '老師還要解釋概念、追蹤進度並及早修正誤解',
    '老師只需說加油，所有學科內容便會自動學會',
    '課程設計只影響教師衣服顏色，與學生理解無關',
    '只要家長會鼓勵，學校便毋須安排任何正式課堂',
  ],['教師職責包含多項專業教學工作，超出情緒鼓勵。','忽略技術工作。','錯置作用。','過度替代正式教學。'],[6,7,8],'教師影響不只鼓勵，還包括設計講解評估與糾錯。'),
  transfer('一位家長能幫孩子養成閱讀習慣，卻不了解高中物理；物理老師則能根據平時作業調整教法。','作者會如何判主次？',[
    '承認家長奠基，仍看重老師的學科專長與持續觀察',
    '家長會陪讀，就必須負責教清所有高中物理內容',
    '老師能教物理，所以家中閱讀習慣從來沒有價值',
    '只因兩方都重要，就完全不能比較學業影響程度',
  ],['學業成果更直接依賴專科教學及持續評估。','誇大家長專長。','過度否定家庭。','可按作用判主次。'],[1,9,10,11,12],'父母奠基，但教師有專長教法和學業表現資料。'),
  transfer('教育報告要用一句話總結父母和教師對學生學業的不同作用。','哪句最貼近範文結論？',[
    '父母建立習慣態度，教師以專業教學更直接影響進步',
    '父母包辦所有正式課程，教師只負責家中作息時間',
    '教師只提供情緒鼓勵，父母才有全部學科專業知識',
    '兩方都重要，所以不需說清楚各自的影響範圍',
  ],['保留家庭基礎，指出教師對正式學業的較大影響。','顛倒職責。','顛倒專長。','未回答比較。'],[1,11,12],'結論承認父母建立基礎，仍認為教師影響學業發展較大。'),
];
export default {key:'discuss-both-views:17',meta:{topic:'父母還是教師更影響孩子學業發展',summary:'父母奠定學習習慣與態度；教師以專科知識、教法與持續觀察更直接影響正式學業進步。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
