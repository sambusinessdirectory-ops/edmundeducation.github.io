// Full source-specific memorisation support for Discuss Both Views 10.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-10-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:10'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People often decide what someone is like very quickly when they meet them for the first time.',
  'Some people say these first thoughts matter because they help us decide how to act quickly with people at work or elsewhere, but I think it is better to wait before deciding what a person is like.',
  'On one side, the first things we think about someone can help because they give us quick signs of how the person acts and treats others.',
  'Often, people do not have enough time to get to know each other slowly.',
  'For example, in a meeting to choose a worker, the person hiring may see whether someone comes on time, speaks kindly and pays attention when others speak.',
  'These little things can show that a person may do what they promise, feel sure of themselves and treat others well.',
  'In this way, a first thought is like a door: it does not let us see the whole house, but it may make us want to go in and learn more.',
  'On the other side, deciding what someone is like too quickly can be very unfair because a first meeting may only show how the person feels for a short time.',
  'Someone may not talk much because they feel worried, seem cold because they are dealing with pressure, or move and speak strangely because the place is new to them.',
  'If other people quickly give them a name for what they are like, others may keep using that name even if it is wrong.',
  'For example, a new pupil who says little on the first day may later show that they are kind, stay true to friends and help others when they feel at ease.',
  'What a person is really like becomes clear through what they do again and again, not through meeting them only once for a short time.',
  'I think first thoughts can give useful signs, but we should never use them alone to decide what another person is really like.',
  'People have many sides, and we usually see their real good qualities only after spending time with them.',
  'So it is better to use the first things we notice as a place to begin, not as a final decision.',
];
const vocabulary=[
  [['quick judgments','decide what someone is like very quickly','快速判斷'],['meet someone for the first time','meet them for the first time','初次見面']],
  [['early impressions','first thoughts','早期印象'],['respond quickly','decide how to act quickly','快速回應'],['social and professional situations','with people at work or elsewhere','社交與職場場合'],['much wiser','better','較明智'],['not to judge people too soon','wait before deciding what a person is like','不太早評斷']],
  [['On the one hand','On one side','一方面'],['first impressions','first things we think about someone','第一印象'],['immediate clues','quick signs','即時線索'],['attitude and behaviour','how the person acts and treats others','態度行為']],
  [['In many situations','Often','很多情況'],['luxury of spending a long time','enough time','充裕時間'],['getting to know one another','get to know each other','互相了解']],
  [['job interview','meeting to choose a worker','求職面試'],['employer','person hiring','僱主'],['candidate','someone','應徵者'],['arrives on time','comes on time','準時到'],['speaks politely','speaks kindly','有禮說話'],['listens carefully','pays attention when others speak','用心聆聽']],
  [['small details','little things','細節'],['reliability','do what they promise','可靠'],['confidence','feel sure of themselves','自信'],['respect','treat others well','尊重']],
  [['In this sense','In this way','從這角度'],['first impression','first thought','第一印象'],['doorway','door','門口比喻'],['whole house','whole house','全貌'],['step inside','go in and learn more','繼續了解']],
  [['On the other hand','On the other side','另一方面'],['judging someone too quickly','deciding what someone is like too quickly','太快評斷'],['deeply unfair','very unfair','非常不公平'],['temporary version','how the person feels for a short time','暫時狀態']],
  [['quiet','not talk much','安靜'],['nervous','feel worried','緊張'],['distant','seem cold','疏離'],['under pressure','dealing with pressure','承受壓力'],['awkward','move and speak strangely','不自在'],['unfamiliar environment','place is new to them','陌生環境']],
  [['label them immediately','quickly give them a name for what they are like','立刻貼標籤'],['label may stick','others may keep using that name','標籤難撕'],['inaccurate','wrong','不準確']],
  [['For instance','For example','例如'],['new student','new pupil','新學生'],['says very little','says little','少說話'],['kind','kind','善良'],['loyal','stay true to friends','忠誠'],['helpful','help others','樂於助人'],['feel comfortable','feel at ease','感到自在']],
  [['Real character','What a person is really like','真正性格'],['repeated actions','what they do again and again','反覆行動'],['one brief encounter','meeting them only once for a short time','短暫相遇']],
  [['In my opinion','I think','在我看來'],['first impressions','first thoughts','第一印象'],['useful signals','useful signs','有用訊號'],['final basis','use them alone','最終依據'],['judging another person','decide what another person is really like','評斷他人']],
  [['complex','have many sides','複雜'],['true qualities','real good qualities','真正特質'],['over time','after spending time with them','隨時間']],
  [['Therefore','So','因此'],['first impressions','first things we notice','第一印象'],['starting point','place to begin','起點'],['verdict','final decision','定論']],
];
const chunkOverrides=[
  ['People often make quick judgments','when they meet someone for the first time.'],
  ['While some argue that these early impressions are important','because they help us respond quickly','in social and professional situations,','I believe that it is much wiser','not to judge people too soon.'],
  ['On the one hand, first impressions can be useful','because they give us immediate clues','about a person’s attitude and behaviour.'],
  ['In many situations, people do not have the luxury','of spending a long time getting to know one another.'],
  ['For example, during a job interview,','an employer may notice whether a candidate arrives on time,','speaks politely and listens carefully.'],
  ['These small details can suggest','reliability, confidence and respect.'],
  ['In this sense, a first impression acts like a doorway:','it does not show the whole house,','but it tells us whether we may want to step inside.'],
  ['On the other hand, judging someone too quickly','can be deeply unfair, because a first meeting','often captures only a temporary version of a person.'],
  ['Someone may seem quiet because they are nervous,','distant because they are under pressure,','or awkward because they are in an unfamiliar environment.'],
  ['If others label them immediately,','that label may stick even when it is inaccurate.'],
  ['For instance, a new student who says very little','on the first day may later show that they are','kind, loyal and helpful once they feel comfortable.'],
  ['Real character is shown through repeated actions,','not through one brief encounter.'],
  ['In my opinion, although first impressions','can provide useful signals,','they should never become the final basis','for judging another person.'],
  ['People are complex,','and their true qualities usually appear only over time.'],
  ['Therefore, it is better to treat first impressions','as a starting point, not a verdict.'],
];
const simpleChunkOverrides=[
  ['People often decide what someone is like very quickly','when they meet them for the first time.'],
  ['Some people say these first thoughts matter','because they help us decide how to act quickly','with people at work or elsewhere,','but I think it is better to wait','before deciding what a person is like.'],
  ['On one side, the first things we think about someone can help','because they give us quick signs','of how the person acts and treats others.'],
  ['Often, people do not have enough time','to get to know each other slowly.'],
  ['For example, in a meeting to choose a worker,','the person hiring may see whether someone comes on time,','speaks kindly and pays attention when others speak.'],
  ['These little things can show that a person','may do what they promise, feel sure of themselves','and treat others well.'],
  ['In this way, a first thought is like a door:','it does not let us see the whole house,','but it may make us want to go in and learn more.'],
  ['On the other side, deciding what someone is like too quickly','can be very unfair because a first meeting','may only show how the person feels for a short time.'],
  ['Someone may not talk much because they feel worried,','seem cold because they are dealing with pressure,','or move and speak strangely because the place is new to them.'],
  ['If other people quickly give them a name for what they are like,','others may keep using that name even if it is wrong.'],
  ['For example, a new pupil who says little on the first day','may later show that they are kind,','stay true to friends and help others','when they feel at ease.'],
  ['What a person is really like becomes clear','through what they do again and again,','not through meeting them only once for a short time.'],
  ['I think first thoughts can give useful signs,','but we should never use them alone','to decide what another person is really like.'],
  ['People have many sides,','and we usually see their real good qualities','only after spending time with them.'],
  ['So it is better to use the first things we notice','as a place to begin, not as a final decision.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('People often make quick judgments when they enter a shop for the first time.','以 when 說初次接觸時容易快速判斷',[1,3,7],fixed(0,'[人們] often make quick judgments when they [初次見某人].','開篇界定第一印象是初見時很快出現的判斷。','要交代一種判斷在哪種短時間情境下容易發生時。',[' often make quick judgments when they '],['作出判斷的人','觸發判斷的初次接觸'])),
  card('While some argue that quick opinions help people respond at work, I believe that it is much wiser to wait before judging.','以 While some ... I believe ... 承認用途並表態勿早判',[0,2,12],fixed(1,'While some argue that [初印象重要，因能快速回應], I believe that it is much wiser [不要太早評斷人].','引言先承認第一印象的實用性，再表達反對過早定論。','要承認一方在特定情境有用，仍清楚表明另一方更明智時。',['While some argue that ', ', I believe that it is much wiser '],['先承認的實用主張','自己較支持的做法'])),
  card('On the one hand, first looks can be useful because they give us clues about someone’s behaviour.','以 because 說初見可提供即時線索',[1,4,6],fixed(2,'On the one hand, [第一印象] can be useful because they give us [態度行為的即時線索].','第一主體段公平說明初印象能提示態度與行為。','要開始解釋自己較少支持的一方有甚麼具體用途時。',['On the one hand, ', ' can be useful because they give us '],['可能有用的初步資訊','它提供的實際線索'])),
  card('In many situations, clinic staff do not have the luxury of knowing every new patient well at once.','以 do not have the luxury of 說時間限制',[2,4,8],fixed(3,'In many situations, [人們] do not have the luxury of [長時間了解彼此].','實際場合時間有限，令初步線索有一定用途。','要說明某初步判斷何以在時間不足的情況下有實用價值時。',['In many situations, ', ' do not have the luxury of '],['面對時間限制的人','不能充分做到的了解'])),
  card('For example, during an interview, a manager may notice whether someone arrives on time, speaks kindly and listens.','以 whether 並列面試中三項可見細節',[3,5,6],fixed(4,'For example, during [求職面試], [僱主] may notice whether [應徵者準時、有禮、用心聽].','用面試場景把抽象線索變成可觀察行為。','已說短時間需初步線索，要舉出場景與數項可見細節時。',['For example, during ', ', ', ' may notice whether '],['觀察發生的場景','觀察者','被觀察的行為'])),
  card('These little actions can suggest honesty, calm and care for others.','以 suggest 謹慎由細節推測特質',[4,6,8],fixed(5,'These [細節] can suggest [可靠、自信與尊重].','面試細節可以提示特質，但只能 suggest 而非證明。','要由可見行為推測較深特質，同時保留不確定性時。',['These ', ' can suggest '],['所觀察的細節','可能被提示的特質'])),
  card('In this sense, a short introduction acts like a doorway: it does not show the whole building, but it tells us whether to go farther.','以 doorway 比喻初印象是入口而非全貌',[4,5,7],fixed(6,'In this sense, [第一印象] acts like [門口]: it does not show [全屋], but it tells us whether [願意走進去].','第一印象只能決定是否繼續了解，不能當作完整判斷。','已說初步線索的用途，要用比喻指出其價值與明確限制時。',['In this sense, ', ' acts like ', ': it does not show ', ', but it tells us whether '],['被比喻的初印象','暫時的入口','尚未看見的全貌','下一步是否深入了解'])),
  card('On the other hand, judging a learner too fast can be unfair, because one meeting often captures only a short moment.','以 because 說初見只捕捉暫時狀態',[1,6,8],fixed(7,'On the other hand, [太快評斷人] can be [非常不公平], because [首次見面] often captures only [暫時狀態].','第二主體段指出一次會面未必反映一個人的平時模樣。','已公平論證初步線索，需轉入以單次情況判定整個人的缺點時。',['On the other hand, ', ' can be ', ', because ', ' often captures only '],['有風險的判斷方式','它可能造成的問題','資訊有限的場合','當時短暫的狀態'])),
  card('Someone may seem unfriendly because they are shy, quiet because they are worried, or clumsy because they are new to the place.','以三個 because 並列行為背後不同原因',[7,9,10],fixed(8,'Someone may seem [安靜] because [緊張], [疏離] because [受壓], or [不自在] because [環境陌生].','外表反應不一定是固定性格，可能只是當刻處境。','要說明幾種表面行為可能分別由不同的暫時原因造成時。',['Someone may seem ', ' because they are ', ', ', ' because they are ', ', or ', ' because they are '],['第一種表面反應','第一個暫時原因','第二種表面反應','第二個暫時原因','第三種表面反應','第三個暫時原因'])),
  card('If teachers label a child immediately, the label may stick even when it is wrong.','以 If ... even when ... 說錯誤標籤可持續',[8,10,11],fixed(9,'If [別人立刻貼標籤], [標籤] may stick even when [它不準確].','一次錯誤判斷可長期影響別人怎樣看待當事人。','要指出過早分類的後果，即使其依據後來證實不準確時。',['If ', ', ', ' may stick even when '],['過早發生的評價','可能留下的標籤','標籤仍被沿用的反證'])),
  card('For instance, a quiet pupil may later show that they are warm and loyal once they settle into a new class.','以新學生例子說暫時沉默不代表真實性格',[8,9,11],fixed(10,'For instance, [首日少說話的新學生] may later show that they are [善良忠誠且樂於助人] once they [感到自在].','新環境中的沉默可能只屬暫時狀態，之後會顯出更多性格。','已說初次判斷可能錯，要舉一個隨時間呈現另一面的例子時。',['For instance, ', ' may later show that they are ', ' once they '],['首日看似沉默的人','之後可見的特質','讓真實一面顯出的條件'])),
  card('Real teamwork is shown through repeated cooperation, not through one short meeting.','以 through ... not through ... 對照反覆行動與單次會面',[9,10,12],fixed(11,'[真正性格] is shown through [反覆行動], not through [一次短暫相遇].','把新學生例子抽成判斷他人的一般標準。','要指出可靠證據應來自長期行動，而非一個短暫片段時。',[' is shown through ', ', not through '],['需要判斷的內在特質','較可靠的證據','不足以定論的單次資訊'])),
  card('In my opinion, although first meetings give clues, they should never become the final test of character.','以 although 讓步線索有用，否定作最終依據',[2,11,14],fixed(12,'In my opinion, although [第一印象能提示], they should never become [評斷他人的最終依據].','明確界定初印象的恰當位置：線索而不是定論。','兩方已討論，要承認初步訊號卻拒絕把它當最終判準時。',['In my opinion, although ', ', they should never become '],['初步資訊的有限好處','不應變成的判斷地位'])),
  card('People are complex, and their deeper qualities usually appear only as we get to know them.','以 only over time 說真正特質須時間顯現',[10,12,14],fixed(13,'[人] are complex, and [真正特質] usually appear only [隨時間].','解釋為甚麼單次印象不夠：人有多面，特質慢慢顯露。','要說明某人或事物的複雜性，需要時間才能可靠看清時。',[' are complex, and ', ' usually appear only '],['難以一眼看清的人','較深層的特質','足以觀察的時間'])),
  card('Therefore, it is better to treat a first look as a beginning, not a final answer.','以 as ... not ... 提出初印象的適當使用原則',[6,12,13],fixed(14,'Therefore, it is better to treat [第一印象] as [起點], not [定論].','結尾給出可操作原則：保留初步線索，繼續了解。','已權衡初步用途與誤判風險，要界定某資訊只應是起點時。',['Therefore, it is better to treat ', ' as ', ', not '],['需要正確使用的初步資訊','適當角色','不應成為的終點'])),
];
const wrongReasons=[
  ['這句已並列初印象用途與作者立場，原句只介紹快速判斷現象。','這句解釋初印象為何有用，原句還未論證。','這句轉入過早判斷的公平問題，非初次見面的引題。'],
  ['這句只介紹初見時的快速判斷，未權衡兩派。','這句進入初印象線索的理由，未明示作者反對早判。','這句總結初印象有限用途，原句在引言先定立場。'],
  ['這句在引言已先表態，原句公平展開初印象的線索用途。','這句是面試的具體例子，原句先講一般用途。','這句門口比喻總結限制，不是線索作用的主張。'],
  ['這句說初印象提供線索，未解釋為何常需快速判斷。','這句已舉面試細節，原句先提出時間限制。','這句列暫時狀態造成誤判，與時間不足的實用理由不同。'],
  ['這句只說時間有限，未舉面試可見的行為。','這句由細節推測特質，原句先展示那些細節。','這句門口比喻概括初見用途，未列面試場景。'],
  ['這句列面試到場說話聆聽，原句推測可能的特質。','這句用門口比喻提醒限制，未列可靠自信尊重。','這句列安靜疏離等暫時反應，非面試的正面線索。'],
  ['這句舉面試細節，原句用門口比喻概括「入口非全貌」。','這句由細節推測特質，尚未明示初見資訊的限制。','這句以 On the other hand 轉入不公平，原句仍收束初印象用途。'],
  ['這句在引言表示別太早判斷，原句在主體段說原因。','這句門口比喻說初見是入口，未指出暫時狀態。','這句列三種當刻原因，原句先說初見只能見暫時一面。'],
  ['這句總論首見可能只捕捉暫時狀態，原句列三組表象及原因。','這句說錯誤標籤可能持續，未列緊張壓力陌生環境。','這句新學生例子只給一人，原句並列三種一般情況。'],
  ['這句列行為背後原因，未用 If 推到錯誤標籤的後續影響。','這句新學生故事顯示誤判，原句先講標籤如何留存。','這句抽出反覆行動的標準，未分析標籤黏附。'],
  ['這句列緊張等可能原因，未舉新學生隔天的反例。','這句說貼標籤可能留下，原句具體示範後來顯出的特質。','這句概括真正性格須反覆觀察，原句先舉例。'],
  ['這句談錯誤標籤的持續，未指出較可靠的性格證據。','這句新學生例子是證據，原句抽成一般判準。','這句結論平衡線索和最終依據，原句聚焦反覆行動。'],
  ['這句先說初印象有線索作用，原句經雙方後界定不能作定論。','這句只說真正性格要反覆行動，未先承認初見有用。','這句提出起點而非定論，原句先作作者明確權衡。'],
  ['這句是新學生的具體例子，原句說人普遍有多面性。','這句已用 although 界定初見用途，未說時間為何重要。','這句最終使用原則，原句先給複雜性理由。'],
  ['這句以門口比喻說初見只是入口，未作最後的操作建議。','這句已說初印象不能作最終依據，原句把它定位為起點。','這句解釋人的特質須時間顯現，未說怎樣使用第一印象。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先排初印象的有限用途，再排過早定論的不公平後果。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('文章比較第一印象的哪兩種看法？',[
    '初見線索有實用價值，與過早把它當定論會不公平',
    '只比較求職面試地點，與學生上課的座位安排',
    '只比較說話速度，與各種門口的建築設計',
    '只比較禮貌用語，與公司所有職位的薪金',
  ],'作者承認初步判斷有用，但主張不應太快評定一個人。'),
  {type:'multi',prompt:'選出範文對第一印象的兩項完整判斷',detail:'選兩項，再按「確認」。',options:[
    '短時間內的行為可提供態度與習慣的初步線索',
    '單次見面只見暫時狀態，真正性格須長期觀察',
    '第一印象一旦出現，便永遠必然完全準確',
    '初見可用作最終判決，不必再了解對方',
  ],correct:[0,1],why:'初印象可作入口，不能作定論。'},
];
const route=[sequence('依文章次序排列第一印象論證',[
  ['引言定立場','初印象可助快回應，但作者反對太早判斷。'],
  ['先說初步用途','面試中準時禮貌聆聽可提示特質，像門口入口。'],
  ['再說誤判風險','緊張壓力環境可改變表現，錯誤標籤卻可能留存。'],
  ['結論給使用原則','真正性格看反覆行動；初印象是起點非定論。'],
],'兩方不是有用或無用的絕對二選一，而是線索與最終依據的區別。')];
const evidence=[
  quiz('面試細節為何可提供初步線索？',[
    '準時、禮貌、聆聽可能提示可靠自信和尊重',
    '每個準時的人都必定永遠不會犯任何錯誤',
    '求職面試可以讓僱主看到應徵者的一生',
    '只要應徵者有禮貌，便不需再了解其工作',
  ],'原文用 suggest 表示細節只可提示特質。'),
  quiz('「門口」比喻最重要的限制是甚麼？',[
    '門口能引人繼續了解，卻看不到整間屋的全貌',
    '一看門口便能知道屋內每一個房間的細節',
    '所有門口都沒有任何用途，也不該讓人走近',
    '屋內情況與第一印象毫無關係，不必再了解',
  ],'入口是初步資訊，不是完整人物判斷。'),
  quiz('一個人安靜或疏離，為何不能立刻定性？',[
    '緊張、壓力或陌生環境都可能暫時改變表現',
    '安靜的人必定從來不願與任何人合作',
    '疏離的表情必定表示此人永遠不值得信任',
    '環境是否陌生，永遠不會影響人的表現',
  ],'原文列三種表象及其暫時原因。'),
  quiz('錯誤標籤有甚麼風險？',[
    '標籤即使不準確，也可能持續影響他人看法',
    '只要標籤不準確，所有人便立即停止使用',
    '標籤一旦出現，就保證能準確描述整個人',
    '別人貼標籤只會影響門口，不會影響任何人',
  ],'原文說 label may stick even when inaccurate。'),
  quiz('新學生首日少說話的例子推翻甚麼假設？',[
    '一次沉默未必代表性格，熟悉後可能展現善良與樂於助人',
    '新學生一旦少說話，日後便不可能與同學建立關係',
    '只要一名學生內向，老師便能立即知道其所有特質',
    '首日說話多少，必定永遠決定每個人的忠誠程度',
  ],'故事把暫時表現和較長期特質區分。'),
  quiz('判斷真正性格應看哪種證據？',[
    '多次行動與一段時間內呈現的特質',
    '只看第一次見面的一個短暫表情',
    '只看一次面試是否穿了相同顏色',
    '只看陌生環境中說話的第一個字',
  ],'原文明說 repeated actions，而非 brief encounter。'),
  quiz('作者最後建議怎樣使用第一印象？',[
    '把它當作繼續了解的起點，不作最終定論',
    '把它當作永久判決，不必再觀察對方',
    '完全禁止留意任何準時禮貌等初步行為',
    '只要有一次印象，便忽略其後所有行動',
  ],'結尾用 starting point, not a verdict 清楚定界。'),
];
const logic=[
  sequence('第一印象有限的實用價值',[
    ['時間限制','許多場合不能長時間了解每個人。'],
    ['面試例子','準時、有禮、聆聽是可見細節。'],
    ['初步推測','細節可提示可靠、自信、尊重。'],
    ['門口比喻','提供入口，仍看不到整間屋的全貌。'],
  ],'第一印象可提示值得繼續了解的方向，但不能直接證明整體性格。'),
  sequence('過早定論的不公平',[
    ['暫時狀態','首次見面可能只捕捉當刻反應。'],
    ['不同原因','安靜可能緊張，疏離可能受壓，不自在可能因陌生。'],
    ['標籤風險','錯誤名稱也可能長期黏附。'],
    ['新學生例子','首日沉默，熟悉後才展現善良助人。'],
    ['較可靠準則','真正性格要看反覆行動；初印象只是起點。'],
  ],'作者以當刻原因、標籤後果和後續行動，說明為何不能太早判人。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('面試官看到應徵者準時到達、耐心聆聽，想用這些資訊作初步評估。','哪項最符合範文對細節的用法？',[
    '把準時與聆聽當線索，再查工作表現與後續行動',
    '只憑準時一次，便斷定此人永遠絕不會遲到',
    '只憑聆聽一次，便不必再了解任何工作能力',
    '完全不看面試行為，因為初步線索必定無用',
  ],['原文說細節 can suggest 特質，不能作最終判決。','過於絕對。','線索不夠全。','原文承認用途。'],[3,4,5,6,12],'範文以面試細節示範初步線索，結論把它定位為起點。'),
  transfer('一位轉校生第一天很安靜，老師有人立刻稱她「不願合作」。','哪項最能轉用範文的暫時狀態論證？',[
    '先考慮緊張或陌生環境，再觀察她後來的相處',
    '她首日少說話，所以一定永遠不會願意合作',
    '老師只需貼上標籤，以後不必再留意她的行動',
    '陌生環境對人完全沒有影響，毋須納入考慮',
  ],['原文說初見只見暫時狀態，後續行動更可靠。','過早定論。','標籤易黏附。','與原文相反。'],[7,8,9,10,11],'範文用新學生首日少言，說真實特質需經時間顯出。'),
  transfer('店主在第一天看到新員工手忙腳亂，就想永久禁止他接待顧客。','哪項最貼近範文的公平判斷？',[
    '先分辨陌生環境的暫時笨拙，再看多次工作表現',
    '第一次笨拙就保證員工往後所有工作都一樣差',
    '只要員工緊張，便不可能在熟悉工作後有改善',
    '從此只看第一天，不需要記錄員工後來的表現',
  ],['範文說 awkward 可因 unfamiliar environment，應看 repeated actions。','過於絕對。','可能改善。','證據不足。'],[7,8,11,13],'範文把陌生環境造成的表現與長期真實性格區分。'),
  transfer('一名新同事初次見面顯得冷淡，幾星期後大家發現他當天正處理家庭危機。','哪項最能運用範文的因果解釋？',[
    '當刻壓力可使人看似疏離，不能據此判斷固定性格',
    '一人初見冷淡，就證明他永遠不會尊重任何同事',
    '即使有家庭危機，短暫表情也必定代表全部特質',
    '同事應只保留當天印象，完全不理後來的相處',
  ],['原文說 distant because under pressure，外表可能屬暫時。','否定情境。','無法推得。','忽略長期行動。'],[7,8,13],'範文列看似疏離可能只是受壓，非人物全貌。'),
  transfer('社區義工招募只有五分鐘初談，主辦者需要決定誰進入下一輪。','哪項做法最符合「門口」比喻？',[
    '用初談決定是否繼續了解，再以後續活動評估',
    '五分鐘已足夠看清每人的全部性格與長期習慣',
    '初談既短，就完全不能提供任何有用的資訊',
    '只要談話第一句順耳，便直接作永久錄用決定',
  ],['門口可引人走進去，不能顯示整間屋。','初談不完整。','原文承認線索。','誤把入口當全貌。'],[3,4,5,6,14],'範文用門口比喻初印象只提供繼續探索的入口。'),
  transfer('班主任曾把一名孩子叫作「懶惰」，即使他後來持續交功課，同學仍沿用這稱呼。','哪項最能說明範文的標籤風險？',[
    '過早標籤即使不準確也可能留下，應看後續行動',
    '孩子後來交功課，所以最初標籤必定永遠準確',
    '只要同學沿用稱呼，就不必觀察孩子真正表現',
    '貼標籤只會影響功課封面，不會影響他人看法',
  ],['原文說 label may stick even when inaccurate。','與證據相反。','應更新判斷。','標籤影響社會看法。'],[9,11,12],'範文以錯誤標籤黏附的風險，支持觀察反覆行動。'),
  transfer('研究團隊想比較一次短面談與一年合作紀錄，哪種更能判斷同事可靠程度。','哪項最符合範文的證據標準？',[
    '一年中多次準時與合作行動，比單次面談更可靠',
    '一次面談只需一分鐘，就能顯示一年所有行為',
    '長期合作紀錄既然存在，便完全不需閱讀內容',
    '任何人第一天緊張，便代表他從此永遠不可靠',
  ],['原文明說性格由 repeated actions 顯示，不是 brief encounter。','單次不足。','仍要評估行動。','緊張非性格。'],[4,5,7,11],'範文把反覆行動定為真正性格的較可靠證據。'),
  transfer('求職顧問提醒面試官：有人第一次看似自信，也可能只是準備了幾句熟悉答案。','哪項最能保持範文的平衡？',[
    '把自信當有用訊號，仍用其他機會檢查真實能力',
    '自信一旦被看見，便毋須再觀察任何工作表現',
    '只要面試時說話流利，就必然在所有情境可靠',
    '初見可能不完整，因此一概不准留意任何細節',
  ],['有用訊號不是 final basis。','過早定論。','推論過強。','原文承認初步線索。'],[2,4,5,12,14],'範文權衡初印象可提示與不可作最終依據。'),
  transfer('居民委員會選代表，候選人初見時話少，但三個月來每週準時完成社區任務。','哪項評估最貼近作者立場？',[
    '較重視連續可靠的行動，而非一次沉默的初印象',
    '只因候選人首次話少，便永久忽略所有任務表現',
    '只看第一次表情，其他三個月的行動全都不算',
    '候選人完成任務，便保證日後永遠不會犯錯',
  ],['反覆行動較能展示性格，也要避免絕對化。','忽略證據。','時間跨度不足。','不保永遠。'],[10,11,12,13],'範文說真實特質隨時間由重複行動顯現。'),
  transfer('培訓教材把「第一印象」定義成最後判決，學生想改寫成更準確的原則。','哪項改寫最符合範文的結尾？',[
    '第一印象可作了解他人的起點，不能取代長期觀察',
    '第一印象一旦形成，便可永久代替所有後續證據',
    '第一印象完全無用，所以任何時候都不能留意',
    '只要第一次見面，便能準確看清一個人的全貌',
  ],['結尾明確說 starting point, not a verdict。','把入口當定論。','否定有限用途。','無法看全貌。'],[6,11,12,13,14],'範文最後把初印象定位為起點，真正性格仍需時間顯示。'),
];
export default {key:'discuss-both-views:10',meta:{topic:'第一印象是否可靠，應否太快評斷別人',summary:'第一印象可提供短時間線索，但當刻狀態會誤導；真正性格須由長期反覆行動判斷。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
