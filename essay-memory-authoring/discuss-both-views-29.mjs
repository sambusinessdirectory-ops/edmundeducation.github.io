// Individually reviewed complete-sentence support for Discuss Both Views 29.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-29-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:29'];
const original=source.sentences.map(s=>s.english);
const simple=[
 'People know TV can affect children, but they disagree: is it what children watch, or how long they watch?',
 'I think what children watch changes how they act more than time spent watching.',
 'People who worry about TV time say too much TV can harm children’s habits and character.',
 'If children watch TV for hours each day, they may sit around more, move less, and spend less time with family or classmates.',
 'This may slowly hurt their ability to control themselves, talk with others, and pay attention.',
 'For example, a child who watches TV most evenings may have less time for schoolwork, playing outside, or talking in person.',
 'After a while, this habit may make the child less patient and less able to focus.',
 'So the worry is not one show, but TV taking up too much of a child’s day.',
 'But I think what children watch matters more because it directly changes how they think, feel, and act.',
 'Children often copy what they see, especially when they keep seeing some acts praised or treated as normal.',
 'If a show makes hurting people, bad manners, or selfish acts look fun, young viewers may start to think such acts are okay.',
 'But shows that teach or show good examples can help children become curious, kind, and careful about their choices.',
 'In this way, TV shows values and can also teach those values to children without them noticing.',
 'In short, how long children watch TV can affect their daily habits and how well they control themselves.',
 'Even so, I think what they watch has a bigger effect because it teaches them what to like, copy, and see as normal.',
];
const vocabulary=[
 [['powerful influence','affect','強大影響'],['type of programmes','what children watch','節目類型'],['number of hours','how long they watch','觀看時數']],
 [['In my view','I think','在我看來'],['content children are exposed to','what children watch','兒童接觸的內容'],['behaviour','how they act','行為'],['viewing time alone','time spent watching','單純觀看時間']],
 [['focus on screen time','worry about TV time','重視觀看時間'],['excessive television watching','too much TV','過度看電視'],['damage','harm','損害']],
 [['young people','children','年輕人'],['several hours a day','hours each day','每天數小時'],['passive','sit around more','被動'],['less physically active','move less','較少活動'],['less willing to engage with','spend less time with','較不願互動']],
 [['gradually affect','slowly hurt','逐漸影響'],['discipline','ability to control themselves','自律'],['social confidence','talk with others','社交信心'],['attention span','pay attention','專注力']],
 [['For example','For example','例如'],['spends most evenings watching television','watches TV most evenings','大部分晚上看電視'],['homework','schoolwork','功課'],['outdoor play','playing outside','戶外玩耍'],['face-to-face conversation','talking in person','面對面交流']],
 [['Over time','After a while','長遠而言'],['this routine','this habit','這種習慣'],['more impatient','less patient','更急躁'],['less able to concentrate','less able to focus','更難集中']],
 [['From this perspective','So','從這角度'],['one particular programme','one show','某特定節目'],['fills up a child’s daily life','taking up too much of a child’s day','佔據孩子生活']],
 [['However, I believe','But I think','然而我認為'],['content','what children watch','內容'],['directly shapes','directly changes','直接塑造'],['ideas, emotions, and patterns of behaviour','how they think, feel, and act','思想情緒行為']],
 [['learn by imitation','copy what they see','透過模仿學習'],['repeatedly see','keep seeing','反覆看到'],['certain actions','some acts','某些行為'],['being rewarded','praised','受到獎勵'],['normalised','treated as normal','被視為正常']],
 [['programme','show','節目'],['violence','hurting people','暴力'],['rudeness','bad manners','無禮'],['selfishness','selfish acts','自私'],['entertaining','fun','有趣'],['acceptable','okay','可接受']],
 [['By contrast','But','相比之下'],['educational programmes','shows that teach','教育性節目'],['positive role models','good examples','正面榜樣'],['encourage curiosity','help children become curious','鼓勵好奇心'],['kindness','kind','善良'],['responsible choices','careful about their choices','負責任選擇']],
 [['In this sense','In this way','從這意義上'],['reflects certain values','shows values','反映價值觀'],['quietly plant them','teach those values to children without them noticing','悄悄植入價值觀']],
 [['In conclusion','In short','總結'],['amount of time','how long','時間長短'],['routines','daily habits','日常習慣'],['self-control','how well they control themselves','自控能力']],
 [['Nevertheless','Even so','然而'],['programme content','what they watch','節目內容'],['greater influence','bigger effect','更大影響'],['admire','like','欣賞'],['accept as normal','see as normal','視為正常']],
];
const chunkOverrides=[
 ['Television has long been seen as a powerful influence on children,','but people disagree about whether this influence comes mainly','from the type of programmes they watch','or from the number of hours they spend in front of the screen.'],
 ['In my view, the content children are exposed to','has a stronger effect on their behaviour','than viewing time alone.'],
 ['Those who focus on screen time argue','that excessive television watching can damage','children’s habits and character.'],
 ['When young people spend several hours a day watching television,','they may become passive, less physically active,','and less willing to engage with family members or classmates.'],
 ['This can gradually affect their discipline,','social confidence, and attention span.'],
 ['For example, a child who spends most evenings watching television','may have less time for homework, outdoor play,','or face-to-face conversation.'],
 ['Over time, this routine can make them more impatient','and less able to concentrate.'],
 ['From this perspective, the problem is not one particular programme,','but the way television fills up a child’s daily life.'],
 ['However, I believe that what children watch matters more','because content directly shapes their ideas, emotions,','and patterns of behaviour.'],
 ['Children often learn by imitation,','especially when they repeatedly see certain actions','being rewarded or normalised.'],
 ['If a programme presents violence, rudeness, or selfishness as entertaining,','young viewers may slowly absorb the message','that such behaviour is acceptable.'],
 ['By contrast, educational programmes or stories with positive role models','can encourage curiosity, kindness, and responsible choices.'],
 ['In this sense, television is like a mirror and a teacher at the same time:','it reflects certain values,','but it can also quietly plant them in a child’s mind.'],
 ['In conclusion, the amount of time children spend watching television','can certainly affect their routines and self-control.'],
 ['Nevertheless, I firmly believe that programme content has the greater influence,','because it directly teaches children','what to admire, copy, and accept as normal.'],
];
const simpleChunkOverrides=[
 ['People know TV can affect children,','but they disagree: is it what children watch,','or how long they watch?'],
 ['I think what children watch changes how they act','more than time spent watching.'],
 ['People who worry about TV time say','too much TV can harm children’s habits and character.'],
 ['If children watch TV for hours each day,','they may sit around more, move less,','and spend less time with family or classmates.'],
 ['This may slowly hurt their ability to control themselves,','talk with others, and pay attention.'],
 ['For example, a child who watches TV most evenings','may have less time for schoolwork, playing outside,','or talking in person.'],
 ['After a while, this habit may make the child less patient','and less able to focus.'],
 ['So the worry is not one show,','but TV taking up too much of a child’s day.'],
 ['But I think what children watch matters more','because it directly changes how they think, feel, and act.'],
 ['Children often copy what they see,','especially when they keep seeing some acts','praised or treated as normal.'],
 ['If a show makes hurting people, bad manners, or selfish acts look fun,','young viewers may start to think such acts are okay.'],
 ['But shows that teach or show good examples','can help children become curious, kind,','and careful about their choices.'],
 ['In this way, TV shows values','and can also teach those values to children','without them noticing.'],
 ['In short, how long children watch TV','can affect their daily habits','and how well they control themselves.'],
 ['Even so, I think what they watch has a bigger effect','because it teaches them what to like, copy,','and see as normal.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句未能呈現「${focus}」的語意關係。`};}
const structures=[
 card('Social media has long been seen as a powerful influence on teenagers, but people disagree about whether this influence comes mainly from the type of apps they use or from the number of hours they spend online.','以 whether ... or ... 交代兩種競爭解釋',[1,7,14],fixed(0,'[事物] has long been seen as a powerful influence on [人群], but people disagree about whether this influence comes mainly from [因素甲] or from [因素乙].','開篇提出兩個可比較的成因：節目內容及觀看時間。','同一結果可能有兩個成因，需先公平交代爭議焦點時。',[' has long been seen as a powerful influence on ',', but people disagree about whether this influence comes mainly from ',' or from '],['被討論的事物','受影響者','第一項可能成因','第二項可能成因'])),
 card('In my view, the support students receive at home has a stronger effect on their progress than class size alone.','以 stronger effect ... than ... alone 比較影響力',[0,8,13],fixed(1,'In my view, [因素甲] has a stronger effect on [結果] than [因素乙] alone.','明確表態：內容對行為的影響比時間本身大。','兩個因素都有作用，但要指出其中一項對結果影響更強時。',['In my view, ',' has a stronger effect on ',' than ',' alone.'],['作者較重視的因素','被影響的結果','對照因素'])),
 card('Those who focus on sleep argue that excessive late-night gaming can damage teenagers’ health and mood.','以 Those who focus on ... argue that ... 呈現一方',[0,3,8],fixed(2,'Those who focus on [因素] argue that excessive [行為] can damage [人群] and [能力].','先公平說明重視觀看時間者的憂慮。','要討論一方觀點時，先清楚指出其重視的因素及所擔心的損害時。',['Those who focus on ',' argue that excessive ',' can damage ',' and ','.'],['一方關注的因素','過量行為','可能受損的對象或能力','另一受損面向'])),
 card('When adults spend several hours a day sitting at a desk, they may become tired, less physically active, and less willing to engage with friends or neighbours.','以 When ... they may become ... 推演日常行為後果',[2,5,9],fixed(3,'When [人群] spend several hours a day [行為], they may become [狀態], less physically active, and less willing to engage with [他人].','每日長時間看電視可能令孩子被動、少運動、少互動。','要解釋長期重複的日常行為如何改變身心與社交參與時。',['When ',' spend several hours a day ', ', they may become ', ', less physically active, and less willing to engage with ','.'],['經常重複行為的人','長時間做的事','可能出現的狀態','互動減少的對象'])),
 card('This can gradually affect their sleep, confidence, and willingness to learn.','以 gradually affect 三項能力列漸進影響',[3,6,10],fixed(4,'This can gradually affect their [方面一], [方面二], and [方面三].','總結螢幕時間對自律、社交信心及專注力的漸進影響。','前句已述一種習慣，要列出它逐步影響的數個能力或生活面向時。',['This can gradually affect their ', ', ', ', and ','.'],['第一個受影響面向','第二個受影響面向','第三個受影響面向'])),
 card('For example, a worker who spends most evenings checking work emails may have less time for rest, family meals, or exercise.','以 spends most evenings ... less time 具體化時間擠壓',[3,6,11],fixed(5,'For example, a [人] who spends most evenings [行為] may have less time for [活動甲], [活動乙], or [活動丙].','孩子晚上看電視會擠走功課、戶外玩耍與面談時間。','要舉一個日常例子，說明一項活動如何擠走其他有益活動時。',['For example, a ',' who spends most evenings ',' may have less time for ', ', ', ', or ','.'],['受時間擠壓的人','佔去晚上的行為','被擠走的活動一','活動二','活動三'])),
 card('Over time, this routine can make them more anxious and less able to concentrate.','以 Over time ... more ... less able ... 說累積變化',[4,7,13],fixed(6,'Over time, this routine can make them more [負面狀態] and less able to concentrate.','延伸看電視習慣的累積後果：更急躁、更難專注。','要指出某日常習慣反覆發生後，逐漸造成的情緒與專注變化時。',['Over time, this routine can make them more ',' and less able to concentrate.'],['逐漸變強的負面狀態'])),
 card('From this perspective, the problem is not one particular game, but the way gaming fills up a teenager’s daily life.','以 not one ... but the way ... 重新定位問題',[3,8,10],fixed(7,'From this perspective, the problem is not one particular [事物], but the way [活動] fills up [生活].','替時間一方收束：問題是電視佔據生活，不是某個節目。','一方論證後，要指出真正問題在持續使用方式，而非單一內容時。',['From this perspective, the problem is not one particular ', ', but the way ',' fills up ','.'],['被誤認為問題的單一事物','長期佔時間的活動','受到擠壓的生活範圍'])),
 card('However, I believe that what children eat matters more because food directly shapes their energy, mood, and patterns of activity.','以 matters more because ... shapes ... 轉入較強因素',[1,9,12],fixed(8,'However, I believe that what [人] [接觸] matters more because [內容] directly shapes their [反應] and patterns of [行為].','轉向作者立場：內容直接影響想法、情緒和行為。','承認前一因素後，要轉向自己認為更重要的因素並提出機制時。',['However, I believe that what ',' matters more because ',' directly shapes their ',', and patterns of ','.'],['接觸內容的人及行為','發揮影響的內容','首先受影響的反應','長期行為'])),
 card('Young workers often learn by imitation, especially when they repeatedly see risky shortcuts being rewarded or normalised.','以 imitation ... rewarded or normalised 解釋模仿機制',[3,8,11],fixed(9,'[人群] often learn by imitation, especially when they repeatedly see [行為] being rewarded or normalised.','孩子反覆看到行為受獎勵或被正常化，就可能模仿。','要解釋某群體為何會模仿反覆受到稱讚或被視為正常的行為時。',[' often learn by imitation, especially when they repeatedly see ',' being rewarded or normalised.'],['透過模仿學習的人','被反覆呈現的行為'])),
 card('If a viral channel presents bullying, cheating, or cruelty as entertaining, young viewers may slowly absorb the message that such behaviour is acceptable.','以 If ... as entertaining ... absorb message 推演錯誤訊息',[9,11,12],fixed(10,'If a [媒介] presents [行為甲], [行為乙], or [行為丙] as entertaining, young viewers may slowly absorb the message that such behaviour is acceptable.','不良節目把暴力等呈現得有趣，可能令孩子接受錯誤行為。','要說明某媒介如何把有害行為包裝得吸引，繼而改變觀眾判斷時。',['If a ',' presents ', ', ', ', or ',' as entertaining, young viewers may slowly absorb the message that such behaviour is acceptable.'],['傳播內容的媒介','第一種被美化的行為','第二種行為','第三種行為'])),
 card('By contrast, after-school clubs or sports teams with positive role models can encourage patience, kindness, and responsible choices.','以 By contrast ... positive role models 對照正面內容',[9,10,14],fixed(11,'By contrast, [活動甲] or [活動乙] with positive role models can encourage [美德], kindness, and responsible choices.','對比正面榜樣：教育節目可鼓勵好奇、善良與負責任。','討論負面榜樣後，要用正面例子說明相反影響如何形成時。',['By contrast, ',' or ',' with positive role models can encourage ', ', kindness, and responsible choices.'],['第一種正面環境','第二種正面環境','被鼓勵的美德'])),
 card('In this sense, social media is like a mirror and a teacher at the same time: it reflects certain values, but it can also quietly plant them in a teenager’s mind.','以 mirror and teacher 並列反映與塑造',[8,10,11],fixed(12,'In this sense, [媒介] is like a mirror and a teacher at the same time: it reflects certain values, but it can also quietly plant them in a [人] mind.','電視既反映價值觀，也會把價值觀悄悄植入孩子心中。','要概括媒介既呈現既有價值、又會反過來塑造接收者時。',['In this sense, ',' is like a mirror and a teacher at the same time: it reflects certain values, but it can also quietly plant them in a ',' mind.'],['同時反映及傳遞價值的媒介','接收者的所有格'])),
 card('In conclusion, the amount of time adults spend checking work messages can certainly affect their routines and self-control.','以 In conclusion ... can certainly affect 承認較弱因素',[1,6,14],fixed(13,'In conclusion, the amount of time [人] spend [行為] can certainly affect their routines and self-control.','結論先承認觀看時間確會影響生活習慣與自控。','結論要公平承認較弱的一方仍有作用，再作最終取捨時。',['In conclusion, the amount of time ',' spend ',' can certainly affect their routines and self-control.'],['受影響的人','佔用時間的活動'])),
 card('Nevertheless, I firmly believe that workplace culture has the greater influence, because it directly teaches new staff what to admire, copy, and accept as normal.','以 Nevertheless ... greater influence ... teaches ... 重申較強因素',[1,8,13],fixed(14,'Nevertheless, I firmly believe that [內容] has the greater influence, because it directly teaches [人] what to admire, copy, and accept as normal.','最終主張節目內容更重要，因它教孩子欣賞、模仿及正常化甚麼。','結論已承認一個因素後，要明確指出另一因素何以作用更深時。',['Nevertheless, I firmly believe that ',' has the greater influence, because it directly teaches ',' what to admire, copy, and accept as normal.'],['作者認為較強的因素','受到內容教導的人'])),
];
const wrongReasons=[
 ['這句直接比較兩因素強弱，沒有先引出爭議。','這句重新定位某一方的問題，沒有並列兩種成因。','這句在結論定案，沒有先交代爭議焦點。'],
 ['這句只交代兩種可能原因，尚未表明哪項更強。','這句轉入自己一方並解釋機制，原句是直接比較影響力。','這句先承認另一因素，沒有說明自己的較強判斷。'],
 ['這句開篇並列兩種成因，沒有專述一方憂慮。','這句列長時間行為的後果，沒有先歸屬該觀點。','這句轉入作者判斷，並非呈現對方理由。'],
 ['這句引出一方擔心，未推演每日行為帶來的變化。','這句舉個別孩子的時間擠壓，原句列一般身心社交後果。','這句講學習模仿，與每日長時間活動的後果不同。'],
 ['這句展開日常行為，未概括逐步受影響的幾種能力。','這句說累積後變急躁及難專注，原句則並列三種能力。','這句推演不良節目訊息，沒有概括多項日常能力。'],
 ['這句列一般行為影響，沒有具體展示晚間時間被擠走。','這句說累積變化，沒有列被擠走的其他活動。','這句列正面榜樣作用，不是晚間時間分配例子。'],
 ['這句總列多方面能力，沒有說同一習慣日積月累。','這句把問題定位於活動佔據生活，沒有交代漸進後果。','這句在結論承認時間作用，沒有推演累積變化。'],
 ['這句列長時間觀看後果，沒有把問題從單一內容轉到使用方式。','這句轉入作者較重視的內容因素，方向與原句不同。','這句以不良節目為例，原句說問題不在單個節目。'],
 ['這句比較兩因素的大小，但沒有解釋內容直接塑造甚麼。','這句解釋模仿機制，尚未提出作者的較強因素判斷。','這句用鏡與教師的比喻，原句先提出因果主張。'],
 ['這句列長時間觀看的後果，不是模仿和獎勵機制。','這句提出內容較重要，還未解釋孩子怎樣學習。','這句給正面榜樣例子，沒有說反覆看見獎勵如何引發模仿。'],
 ['這句講模仿機制，但沒有呈現有害節目及其具體錯誤訊息。','這句用正面內容對比，效果與原句有害內容相反。','這句概括媒介會塑造價值，沒有逐步推演有害訊息。'],
 ['這句說模仿來源，未對比正面的示範。','這句列負面節目的錯誤訊息，方向相反。','這句重申內容較強，未舉正面榜樣作用。'],
 ['這句提出內容重要，沒有同時說媒介反映和塑造價值。','這句舉負面內容例子，未概括雙向作用。','這句是正面榜樣例子，不是媒介的兩重比喻。'],
 ['這句在引言比較兩因素，沒有在結論先承認較弱因素。','這句說時間累積的不良後果，尚未作總結讓步。','這句重申作者較強主張，原句仍在承認另一方。'],
 ['這句直接比較影響力，沒有先讓步再重申最後立場。','這句轉入正文的內容理由，尚未作結論。','這句承認時間有作用，沒有指出內容更強的原因。'],
];
structures.forEach((s,i)=>{s.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先區分兩派判斷，再追蹤時間與內容各自如何影響兒童，最後作出取捨。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('這題要比較電視對兒童影響的哪兩種解釋？',['節目內容與觀看時間哪一項影響較大','不同電視品牌的畫面和價格差異','家長與教師誰應購買更多電視機','新聞節目與廣告哪一種製作成本高'],'題目比較內容與觀看時間對兒童的影響，並要求表達個人判斷。'),{type:'multi',prompt:'選出作者的完整立場',detail:'選兩項，再按「確認」。',options:['觀看時間會影響習慣、自控與社交活動','節目內容更能塑造想法與行為，因此影響更大','所有電視節目對兒童的作用完全相同','只要節目有教育性，看多少小時都不會有問題'],correct:[0,1],why:'作者承認過量觀看的風險，但認為內容教導行為與價值，作用更深。'}];
const route=[sequence('把兩方論證按範文思路排列',[['引言交代爭議','電視的影響可能來自內容或觀看時間，作者較重視內容。'],['時間一方','看電視過久會擠走活動與交流，漸進影響習慣。'],['內容一方','孩子模仿被獎勵或正常化的行為，好壞內容方向相反。'],['結論取捨','承認時間作用，仍以內容更直接塑造價值作判斷。']],'文章並非否定時間影響，而是比較兩者如何起作用及哪個更深。')];
const evidence=[
 quiz('重視「觀看時間」的一方先指出甚麼？',['看得過久可能損害孩子的習慣與性格','只有節目名稱會決定孩子是否願意運動','每個孩子都能同時看電視及做完所有活動','所有節目都會讓孩子學會相同的價值觀'],'該方的主因是長時間觀看佔據生活，導致行為及習慣變化。'),
 quiz('晚間看電視的例子主要證明甚麼？',['它擠走功課、戶外活動與面對面交流的時間','它只會改變孩子喜歡的電視品牌或頻道','它證明每一個節目都有相同的負面內容','它可取代家庭交流而不會影響任何習慣'],'例子把「過量觀看」具體化為其他活動的時間損失。'),
 quiz('作者認為節目內容為何影響更深？',['孩子會模仿反覆被獎勵或視為正常的行為','孩子必然記住節目裏每句對白和製作資料','只有長度會改變孩子對行為的看法與選擇','節目內容不會引起情緒或價值判斷的改變'],'內容透過模仿、獎勵及正常化，直接影響思想與行為。'),
 quiz('負面與正面節目的對照有甚麼作用？',['展示內容可把行為推向相反方向','證明所有孩子只會觀看負面的節目','證明觀看時數與孩子生活全無關係','只比較不同節目的畫面顏色及長短'],'壞榜樣可能使有害行為顯得可接受，正面榜樣可鼓勵善良與負責任。'),
 quiz('「鏡子與老師」的比喻說明甚麼？',['電視既反映價值觀，也會把價值觀教給孩子','電視只能把真實事件照出來，不能影響兒童','電視節目必須安排一位老師在畫面上講課','鏡子與電視都只能測量孩子觀看的時間'],'比喻總結媒介反映並塑造價值的雙向作用。'),
];
const logic=[
 sequence('還原「時間」一方的因果鏈',[['過量觀看','孩子每天花數小時看電視。'],['活動被擠走','運動、功課、家庭與同學互動減少。'],['習慣慢慢改變','自律、社交信心及專注力可能受影響。'],['歸納理由','問題是電視佔據生活，而非單個節目。']],'先有時間佔用，再有其他活動減少和習慣變化。'),
 sequence('還原「內容」一方的因果鏈',[['反覆看到行為','孩子從節目中的人物和結果學習。'],['模仿與正常化','被獎勵或包裝得有趣的行為更易被接受。'],['正負方向不同','不良內容可帶來錯誤訊息；正面榜樣可鼓勵好行為。'],['作者取捨','內容直接教人欣賞、模仿及視為正常的事。']],'作者的比較重點是內容直接塑造行為準則。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('學校討論手機對學生的影響：一派擔心每日用太久，另一派擔心短影片內容。','哪個開篇最符合範文的問題架構？',['影響可能來自使用時間，也可能來自內容類型','只比較使用時間，不問短影片呈現甚麼內容','只比較影片具體內容，不問每日用了多久','只看手機型號，不分析時間與內容機制'],['公平提出時間與內容兩個可能原因。','時間是一派關注，內容是另一派。','內容重要，每天用多久也可能影響。','型號不是題目提出的兩種機制。'],[0,1],'引言先區分內容與時間，再明確交代自己的取捨。'),
 transfer('一位孩子每晚玩遊戲四小時，但遊戲本身並沒有暴力或粗話。','哪項最能運用「時間」一方的理由？',['遊戲佔去運動、功課及面對面交流的時間','只看遊戲有無暴力，不問四小時佔走甚麼','只限制遊戲內容，不處理每天使用時間','只安排運動，不檢查功課與面對面交流'],['即使內容溫和，過量時間仍可擠走其他活動。','無暴力不等於長時間使用沒有代價。','內容安全也不能忽略四小時佔用。','運動是一面，功課和面對面交流也受擠壓。'],[2,3,5,7],'過量觀看的問題是活動被擠走，不必依賴某個壞節目。'),
 transfer('教師發現一群學生常模仿一個網紅對弱者的嘲笑，因為影片把嘲笑拍得很好笑。','哪項最能解釋這個現象？',['被獎勵或拍得有趣的行為容易被模仿','只問影片是否好笑，不看嘲笑弱者的示範','只提醒學生禮貌，不分析網紅行為的吸引力','只限制觀看時間，不檢查反覆模仿的內容'],['內容把嘲笑正常化，形成可模仿的榜樣。','好笑可能使嘲笑看似值得模仿。','禮貌提醒有用，須看影片如何獎勵該行為。','觀看時間不是內容模仿的全部。'],[9,10],'孩子會模仿反覆看到、被包裝為有趣或受到獎勵的行為。'),
 transfer('兩個孩子每天同樣看電視一小時：一個看科學節目，一個看把欺凌拍成好玩的劇集。','這最能支持作者哪項判斷？',['時數相同，內容仍可引導相反的行為','只比較兩人看電視時間，不查節目內容','只評估科學節目，不分析欺凌劇集的影響','只看觀看地點，不問劇集如何塑造行為'],['控制時數後，內容仍可能造成不同影響。','時數相同，內容仍可能造成不同影響。','科學節目有益，欺凌劇集也要分析。','地點不是相反行為的主要差異。'],[8,10,11],'負面與正面內容可塑造不同的行為和價值。'),
 transfer('有家長說：「我只需限制孩子每天看多久，毋須知道他究竟在看甚麼。」','依範文，哪項回應最完整？',['限制時數有用，也要檢視節目教了甚麼','只限制觀看時數，不問節目向孩子示範甚麼','只審查節目內容，不設定合理的使用界線','只看孩子是否喜歡，不問行為有無改變'],['承認時間作用，補上內容對價值的影響。','時數有用，還須看內容。','內容要查，使用時間也可有影響。','喜好不足以評估模仿或行為改變。'],[1,7,8,14],'作者承認時間影響，但認為內容直接教孩子欣賞和模仿甚麼。'),
 transfer('一個閱讀平台每晚推送恐嚇標題，讀者開始把極端語氣當作正常討論方式。','哪項與範文的機制最相似？',['反覆出現的內容會把某種語氣正常化','只限制推送頻率，不問恐嚇語氣怎樣被學','只看讀者閱讀時長，不查標題內容','只分析平台介面，不看極端語氣的重複'],['反覆接觸某種表達可改變人對正常行為的看法。','頻率有用，但仍須分析極端語氣如何正常化。','時長不是恐嚇標題的全部。','介面不是題目中的語氣示範。'],[9,10,12],'媒介內容可悄悄教人甚麼行為被視為正常。'),
 transfer('社區中心播放紀錄片，片中志願者協助長者，孩子之後主動提出探訪獨居鄰居。','哪項最好轉用範文的正面榜樣？',['看見助人的榜樣，孩子可能學會關心他人','只說孩子看了影片，不問助人榜樣如何作用','只記實際探訪次數，不連回影片示範','只查影片時長，不分析內容教了甚麼'],['正面示範能鼓勵善良與負責任的選擇。','看到影片後還須說明榜樣如何影響。','探訪是結果，需連回影片示範。','時長不能代替對助人內容的分析。'],[9,11,12],'正面內容及榜樣能鼓勵好奇、善良和負責任選擇。'),
 transfer('學生寫：「玩網上遊戲有影響，所以所有遊戲都要禁止。」','哪項修訂最符合範文的比較思路？',['分辨遊戲內容與使用時間各自帶來甚麼影響','只限制遊戲時間，不檢查不同遊戲的內容','只檢查暴力內容，不問長時間使用的代價','只看是否網上遊戲，不比較兩種具體影響'],['先分辨兩因素，再比較各自的作用和強度。','使用時間重要，內容類型也要分辨。','內容重要，長時間使用另有代價。','只看類別名稱不夠具體。'],[0,2,8,14],'範文分別解釋時間擠壓與內容塑造，再判斷哪項較強。'),
 transfer('一名青少年每天看一小時美食短片，開始模仿片中浪費食物的玩笑。','作者最可能怎樣解釋？',['時數不長，內容仍能教他模仿不良行為','只看每天一小時，不問浪費食物的影片內容','只責怪青少年，不分析片中玩笑如何示範','只評估影片長短，不追蹤實際模仿行為'],['具體被美化的行為可在短時間內被模仿。','一小時不長，仍可能模仿有害內容。','責怪不解釋影片如何呈現浪費。','長短不能代替行為結果。'],[8,9,10,14],'內容會直接教孩子甚麼值得模仿及視為正常。'),
 transfer('研究者發現某節目既呈現社區現有的互助文化，也令更多觀眾願意參與互助。','用「鏡子與老師」如何解釋？',['節目先反映互助價值，也能再教觀眾實踐','只說節目反映文化，不看其後觀眾行動','只看觀眾參與，不問節目原有社區背景','只記互助畫面數，不分析反映和教導兩面'],['同一媒介可同時反映並傳遞某項價值。','節目也可再教觀眾實踐互助。','觀眾行動要連回既有互助文化。','畫面數不足以分析雙向作用。'],[11,12],'鏡子與老師的比喻表示媒介既反映價值，也能植入價值。'),
];
// Reviewed connector structure decompositions.
structures[8].frame.parts=[["However, I believe that what ","link","句型固定部分"],["children","slot","受影響的人"],[" ","link","句型固定部分"],["watch","slot","接觸方式"],[" matters more because ","link","句型固定部分"],["content","slot","接觸內容"],[" directly shapes their ","link","句型固定部分"],["ideas, emotions","slot","直接受影響的感受或想法"],[", and patterns of ","link","句型固定部分"],["behaviour","slot","長期行為"],[".","link","句型固定部分"]];
structures[8].frame.formula="However, I believe that what [受影響的人] [接觸方式] matters more because [接觸內容] directly shapes their [直接受影響的感受或想法], and patterns of [長期行為].";
export default {key:'discuss-both-views:29',meta:{topic:'電視內容還是觀看時間更影響兒童',summary:'長時間觀看會擠走活動，但節目內容透過模仿與正常化直接塑造兒童的行為和價值。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
