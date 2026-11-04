// Full source-specific memorisation support for Discuss Both Views 8.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-8-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:8'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People often talk about when in life people are happiest.',
  'Some people think teenagers have happier lives than adults, while others think being an adult brings a kind of happiness that goes deeper and lasts longer.',
  'I think adults are usually happier because they can make more of their own choices and know more clearly what they want to do in life.',
  'On one side, teenagers may look happier because they usually do not have many big duties to carry.',
  'Many do not have to pay bills, provide money for a family or make big choices about money, so they have more time for friends, things they enjoy doing and fun.',
  'For example, a student in secondary school may go to sports practice after class, talk with friends or watch films without worrying about rent or whether they will keep a job.',
  'Having this much choice can make the teenage years feel easy and fun.',
  'In this way, the teenage years can look like a time with few worries, especially next to an adult life full of work and family duties.',
  'On the other side, I think adults are happier overall because their happiness often comes from making their own choices, doing things they are proud of and understanding their feelings better.',
  'Adults can choose where to live, what job to try for, how to use their money and who to be close to.',
  'These choices let adults decide more about their lives, and that can make them feel deeply pleased.',
  'Also, adults are usually better at knowing what they are like and working through problems.',
  'For example, an adult who has worked hard to build a career or pay for a family’s needs may feel that their life has a clear purpose, something teenagers seldom feel in the same way.',
  'Even though adult life can bring stress, the good things people get from it can often make that stress easier to bear.',
  'To sum up, teenagers may have more time to themselves and fewer duties, which can make them look happier at first.',
  'But I think adults are usually happier because they have more choice, a clearer purpose and a feeling of satisfaction that lasts.',
  'Happiness is not only living without stress; it is also feeling that your life is going somewhere and matters.',
];
const vocabulary=[
  [['Happiness','happiest','幸福感'],['different stages of life','when in life','人生階段'],['often debated','People often talk about','常被討論']],
  [['teenagers','teenagers','青少年'],['adulthood','being an adult','成年生活'],['deeper','goes deeper','更深層'],['more stable','lasts longer','更穩定'],['form of happiness','kind of happiness','幸福形式']],
  [['In my view','I think','在我看來'],['generally','usually','通常'],['greater independence','make more of their own choices','更大自主'],['clearer sense of direction','know more clearly what they want to do in life','清晰方向']],
  [['On the one hand','On one side','一方面'],['appear happier','look happier','看似更快樂'],['less burdened','do not have many','較少負擔'],['serious responsibilities','big duties to carry','重大責任']],
  [['pay bills','pay bills','付帳單'],['support a family','provide money for a family','養家'],['major financial decisions','big choices about money','重大財務決定'],['friendships','friends','友誼'],['hobbies','things they enjoy doing','嗜好'],['entertainment','fun','娛樂']],
  [['secondary school student','student in secondary school','中學生'],['play sports','go to sports practice','做運動'],['chat with friends','talk with friends','與朋友聊天'],['job security','whether they will keep a job','工作穩定']],
  [['This freedom','Having this much choice','這種自由'],['teenage life','teenage years','青少年生活'],['light and enjoyable','easy and fun','輕鬆愉快']],
  [['In this sense','In this way','從這意義'],['adolescence','teenage years','青春期'],['carefree period','time with few worries','無憂時期'],['pressure-filled','full','充滿壓力'],['family duties','family duties','家庭責任']],
  [['On the other hand','On the other side','另一方面'],['happier overall','happier overall','整體更快樂'],['independence','making their own choices','獨立'],['achievement','doing things they are proud of','成就'],['emotional maturity','understanding their feelings better','情感成熟']],
  [['career to pursue','job to try for','追求職業'],['spend their money','use their money','使用金錢'],['build relationships with','be close to','建立關係']],
  [['These choices','These choices','這些選擇'],['control over their lives','decide more about their lives','掌控生活'],['powerful source of satisfaction','make them feel deeply pleased','強大滿足來源']],
  [['Moreover','Also','此外'],['understanding themselves','knowing what they are like','了解自己'],['dealing with problems','working through problems','處理問題']],
  [['For instance','For example','例如'],['develop a career','build a career','發展事業'],['support a family','pay for a family’s needs','養家'],['strong sense of purpose','life has a clear purpose','強烈目標感'],['rarely experience','seldom feel in the same way','很少經歷']],
  [['Although','Even though','雖然'],['stressful','bring stress','有壓力'],['meaningful rewards','good things people get from it','有意義回報'],['balanced by','make that stress easier to bear','平衡壓力']],
  [['In conclusion','To sum up','總結'],['more free time','more time to themselves','更多自由時間'],['fewer responsibilities','fewer duties','較少責任'],['on the surface','at first','表面上']],
  [['However','But','然而'],['generally','usually','通常'],['independence','more choice','獨立性'],['purpose','clearer purpose','目標感'],['lasting fulfillment','feeling of satisfaction that lasts','持久滿足感']],
  [['Happiness','Happiness','幸福'],['absence of pressure','living without stress','沒有壓力'],['direction and meaning','going somewhere and matters','方向和意義']],
];
const chunkOverrides=[
  ['Happiness at different stages of life','is often debated.'],
  ['Some people believe that teenagers enjoy a happier life','than adults, while others argue that adulthood offers','a deeper and more stable form of happiness.'],
  ['In my view, adults are generally happier','because they have greater independence','and a clearer sense of direction.'],
  ['On the one hand, teenagers may appear happier','because their lives are usually less burdened','by serious responsibilities.'],
  ['Many of them do not have to pay bills,','support a family, or make major financial decisions,','so they can spend more time on friendships,','hobbies, entertainment, and personal interests.'],
  ['For example, a secondary school student','may finish classes and then play sports,','chat with friends, or watch films','without worrying about rent or job security.'],
  ['This freedom can make teenage life','feel light and enjoyable.'],
  ['In this sense, adolescence can seem like a carefree period,','especially when compared with the pressure-filled world','of work and family duties.'],
  ['On the other hand, I believe adults are happier overall','because their happiness is often built on independence,','achievement, and emotional maturity.'],
  ['Adults can choose where to live,','what career to pursue, how to spend their money,','and who to build relationships with.'],
  ['These choices give them control over their lives,','which is a powerful source of satisfaction.'],
  ['Moreover, adults are usually better','at understanding themselves and dealing with problems.'],
  ['For instance, an adult who has worked hard','to develop a career or support a family','may feel a strong sense of purpose','that teenagers rarely experience.'],
  ['Although adult life can be stressful,','that stress is often balanced','by meaningful rewards.'],
  ['In conclusion, teenagers may have more free time','and fewer responsibilities,','which can make them seem happier on the surface.'],
  ['However, I believe adults are generally happier','because their lives contain more independence,','purpose, and lasting fulfillment.'],
  ['Happiness is not just the absence of pressure;','it is also the feeling that one’s life','has direction and meaning.'],
];
const simpleChunkOverrides=[
  ['People often talk about','when in life people are happiest.'],
  ['Some people think teenagers have happier lives than adults,','while others think being an adult brings','a kind of happiness that goes deeper and lasts longer.'],
  ['I think adults are usually happier','because they can make more of their own choices','and know more clearly what they want to do in life.'],
  ['On one side, teenagers may look happier','because they usually do not have many','big duties to carry.'],
  ['Many do not have to pay bills,','provide money for a family or make big choices about money,','so they have more time for friends,','things they enjoy doing and fun.'],
  ['For example, a student in secondary school','may go to sports practice after class,','talk with friends or watch films','without worrying about rent or whether they will keep a job.'],
  ['Having this much choice can make','the teenage years feel easy and fun.'],
  ['In this way, the teenage years can look','like a time with few worries,','especially next to an adult life full of work and family duties.'],
  ['On the other side, I think adults are happier overall','because their happiness often comes from making their own choices,','doing things they are proud of and understanding their feelings better.'],
  ['Adults can choose where to live,','what job to try for, how to use their money','and who to be close to.'],
  ['These choices let adults decide more about their lives,','and that can make them feel deeply pleased.'],
  ['Also, adults are usually better','at knowing what they are like','and working through problems.'],
  ['For example, an adult who has worked hard','to build a career or pay for a family’s needs','may feel that their life has a clear purpose,','something teenagers seldom feel in the same way.'],
  ['Even though adult life can bring stress,','the good things people get from it','can often make that stress easier to bear.'],
  ['To sum up, teenagers may have more time to themselves','and fewer duties,','which can make them look happier at first.'],
  ['But I think adults are usually happier','because they have more choice, a clearer purpose','and a feeling of satisfaction that lasts.'],
  ['Happiness is not only living without stress;','it is also feeling that your life','is going somewhere and matters.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('The value of different school years is often debated.','以 ... is often debated 引出有爭議的比較',[1,3,14],fixed(0,'[人生階段的幸福感] is often debated.','開篇只界定哪個人生階段較快樂是有爭議的問題。','題目要求比較兩個階段或選項，而社會上有不同看法時。',[' is often debated.'],['被討論的比較問題'])),
  card('Some people believe that younger pupils have more fun, while others argue that older pupils gain deeper satisfaction.','以 Some ... while others ... 平衡陳述兩派',[0,2,8],fixed(1,'Some people believe that [青少年更快樂], while others argue that [成年幸福更深更穩定].','引言公平並列青少年和成年人兩種幸福觀。','需要在未表態前，準確列出兩派各自認為較好的理由時。',['Some people believe that ', ', while others argue that '],['第一派對照比較的看法','第二派的不同看法'])),
  card('In my view, older students are generally happier because they have more choice and clearer goals.','以 because 並列自主與方向兩項立場理由',[1,8,15],fixed(2,'In my view, [成年人] are generally happier because they have [較大自主] and [較清晰方向].','直接表態成年人較快樂，預告兩個原因。','兩派已介紹，需明確選擇一方並預告兩條主要理由時。',['In my view, ', ' are generally happier because they have ', ' and '],['較支持的群體','第一個理由','第二個理由'])),
  card('On the one hand, younger pupils may appear happier because they have fewer duties.','以 On the one hand ... because 公平解釋青少年看似快樂',[2,4,8],fixed(3,'On the one hand, [青少年] may appear happier because [較少重大責任].','第一主體段先給較不支持的一方合理的表面理由。','要公平展開自己較少支持的一方，先說清其有利條件時。',['On the one hand, ', ' may appear happier because '],['看似受益的群體','能解釋此印象的條件'])),
  card('Many of them do not have to earn money, so they can spend more time on training and seeing friends.','以 so 把較少責任連到更多個人時間',[3,5,6],fixed(4,'Many of them do not have to [付帳單養家或作重大財務決定], so they can spend more time on [朋友興趣與娛樂].','青少年沒有成人財務負擔，因此有較多可自由安排的時間。','已提出較少責任，要說明哪些責任缺席及帶來甚麼時間後果時。',['Many of them do not have to ', ', so they can spend more time on '],['不必承擔的事項','因此可投入時間的活動'])),
  card('For example, a school pupil may play sport after class without worrying about rent or keeping a job.','以 For example ... without worrying 舉學生具體日常',[4,6,7],fixed(5,'For example, [中學生] may [放學後運動聊天看電影] without worrying about [租金與工作穩定].','學生放學後可享受活動，毋須擔心成人開支和工作。','已說可自由安排時間，要用具體一天的活動和免憂事項作例時。',['For example, ', ' may ', ' without worrying about '],['被舉例的人','可自由做的事情','暫時毋須承擔的壓力'])),
  card('This freedom can make a student’s day feel light and pleasant.','以 This freedom can make ... feel 總結自由的感受',[4,5,7],fixed(6,'This freedom can make [青少年生活] feel [輕鬆愉快].','自由時間和較少負擔讓青春期有輕快感。','具體日常例子已說明，要用短句概括這項自由帶來的感受時。',['This freedom can make ', ' feel '],['被影響的生活','產生的感受'])),
  card('In this sense, early school years can seem like a carefree period, especially when compared with the demands of later exams.','以 especially when compared with 限定看似無憂的比較基準',[5,6,8],fixed(7,'In this sense, [青春期] can seem like [無憂時期], especially when compared with [成人工作家庭壓力].','青少年看似快樂，是與成人壓力相比的印象。','已說某階段較輕鬆，需指出這個印象是相對哪種壓力而言時。',['In this sense, ', ' can seem like ', ', especially when compared with '],['被評價的階段','比較後產生的印象','作對照的負擔'])),
  card('On the other hand, I believe graduates are happier overall because their happiness is often built on choice and achievement.','以 On the other hand 轉入作者較支持的一方及三種基礎',[2,7,9],fixed(8,'On the other hand, I believe [成年人] are happier overall because their happiness is often built on [獨立、成就與情感成熟].','第二主體段提出成年人幸福建立在自主、成就、成熟之上。','已公平論證一方，要轉入自己較支持的一方並列其核心理由時。',['On the other hand, I believe ', ' are happier overall because their happiness is often built on '],['較支持的群體','較深層幸福的基礎'])),
  card('Adults can choose where to work, what to study and who to spend their time with.','以多個 what/how/who 選項具體化自主',[8,10,11],fixed(9,'Adults can choose [住處、事業、金錢用途與關係對象].','把抽象的獨立性拆成居住、職業、花費及人際選擇。','已提自主，需列出某人真正能決定的幾個生活面向時。',['Adults can choose '],['可由自己決定的多項選擇'])),
  card('These choices give graduates control over their paths, which is a source of deep satisfaction.','以 which 把選擇連到掌控感與滿足感',[9,11,13],fixed(10,'These choices give [成年人] control over [自己生活], which is [強烈滿足來源].','能選擇不是目的本身，掌控生活才帶來滿足。','已列具體選擇，要指出它們如何產生心理上的掌控或滿足時。',['These choices give ', ' control over ', ', which is '],['得到選擇權的人','被掌控的生活','產生的心理效果'])),
  card('Moreover, older students are usually better at understanding their strengths and solving problems.','以 Moreover 補上自我理解與處理問題能力',[8,10,12],fixed(11,'Moreover, [成年人] are usually better at [理解自己並處理問題].','成人的情感成熟讓幸福不只來自可自由選擇。','已分析自主權，還需提出同一方另一種成熟能力時。',['Moreover, ', ' are usually better at '],['擁有較多經驗的人','較擅長的能力'])),
  card('For instance, a teacher who has built a career may feel a sense of purpose that younger pupils rarely experience.','以 who ... may feel ... that ... 給出成就與目標感例子',[10,11,13],fixed(12,'For instance, [努力發展事業或養家的成年人] may feel [強烈人生目標感] that [青少年] rarely experience.','事業或家庭投入可帶來青少年未必已經歷的目標感。','已說成熟與方向，要用長期投入所帶來的目標感作具體證據時。',['For instance, ', ' may feel ', ' that ', ' rarely experience.'],['努力投入的人','從投入而來的感受','作比較的另一群人'])),
  card('Although university life can be stressful, that stress is often balanced by achievement.','以 Although ... balanced by 承認壓力並指出有意義回報',[3,12,14],fixed(13,'Although [成年生活有壓力], that stress is often balanced by [有意義回報].','不否認成人壓力；說明成就和目標感可平衡它。','自己較支持的一方也有缺點，需承認它並說明抵消力量時。',['Although ', ', that stress is often balanced by '],['先承認的負擔','能平衡負擔的回報'])),
  card('In conclusion, younger pupils may have more spare time and fewer duties, which can make them seem happier at first.','以 which 重述青少年表面幸福的原因',[3,7,15],fixed(14,'In conclusion, [青少年] may have [更多閒暇與較少責任], which can make them seem happier [表面上].','結論先公平重申青少年快樂的表面條件。','結論先重述較少支持的一方及其有利條件時。',['In conclusion, ', ' may have ', ', which can make them seem happier '],['先承認的群體','其較輕負擔','這種印象的限定'])),
  card('However, I believe older pupils are generally happier because their lives contain more choice, purpose and lasting pride.','以 However ... because 重申成人的自主目標與持久滿足',[8,14,16],fixed(15,'However, I believe [成年人] are generally happier because their lives contain more [自主、目標與持久滿足].','結論最後明確選擇成人較深層的幸福。','已公平承認另一方的好處，需用 However 重申最終選擇及理由時。',['However, I believe ', ' are generally happier because their lives contain more '],['最終較支持的群體','使比較結果成立的理由'])),
  card('Learning is not just getting good marks; it is also knowing why the subject matters.','以 not just ...; it is also ... 重新界定幸福的深層含義',[13,15,14],fixed(16,'[幸福] is not just [沒有壓力]; it is also [感到生活有方向與意義].','末句把幸福從無壓力提升到有方向和意義。','要修正過於狹窄的概念定義，補充更深層標準時。',[' is not just ', '; it is also '],['被重新界定的概念','不足以完整定義的表面條件','更深層的標準'])),
];
const wrongReasons=[
  ['這句已並列青少年和成人兩派，原句只界定爭議題目。','這句開始論證青少年較少責任，並非開篇引題。','這句在結論重述一派，原句尚未展開比較。'],
  ['這句只說爭議存在，尚未呈現兩派各自的看法。','這句已表達作者支持成年人，原句先公平列兩派。','這句在主體段轉向成人，未完整介紹青少年一派。'],
  ['這句在引言公平列兩派，原句進一步表明作者選擇。','這句已在成人主體段展開三種幸福基礎。','這句在結論重申立場，原句在引言先預告理由。'],
  ['這句已表明支持成人，未展開青少年較輕負擔。','這句列青少年的具體財務責任，原句先提出一般理由。','這句轉入成人幸福，不是 On the one hand 的第一派。'],
  ['這句只提出較少責任，未列帳單養家與時間用途。','這句是中學生放學例子，原句先提供一般財務機制。','這句概括自由帶來的感覺，未列責任與活動。'],
  ['這句列青少年不用承擔的責任，未舉某個學生的日常。','這句概括青春期的輕鬆感，非放學活動的例子。','這句抽象比較成人壓力，沒有租金或工作穩定的場景。'],
  ['這句列財務責任和興趣，未概括自由本身的感受。','這句是具體學生例子，原句用 This freedom 總結它。','這句比較成人壓力，原句只先說青春生活輕鬆。'],
  ['這句給出放學活動例子，未以成人責任作明確比較。','這句說自由感，未用 compared with 限定無憂印象。','這句轉入成人幸福，原句仍是青少年段的比較性收束。'],
  ['這句在引言選成年人，未展開獨立成就成熟三種基礎。','這句收束青少年一派，原句以 On the other hand 轉入成人。','這句列成人生活選擇，原句先提出這些選擇的核心作用。'],
  ['這句提出成人幸福三種基礎，尚未列居住職業金錢關係。','這句解釋選擇帶來掌控感，原句先列具體選項。','這句提出成人自我理解，未列四種自主決定。'],
  ['這句列成人能作的選擇，原句推到掌控感與滿足感。','這句另談自我理解和處理問題，非選擇的心理效果。','這句承認成人壓力與回報，未談選擇的掌控感。'],
  ['這句提出成人幸福基礎，未用 Moreover 補上自我理解。','這句說選擇的掌控感，原句轉向成熟能力。','這句以成人事業家庭作例，原句先提出一般能力。'],
  ['這句說選擇產生滿足感，未舉成人投入事業家庭的例子。','這句只提成人能理解自己，原句用具體投入證明目標感。','這句是壓力與回報的權衡，非事業家庭目標感的例子。'],
  ['這句說青少年責任少，未承認成人壓力並提出回報。','這句給出事業家庭的目標感，原句在其後平衡壓力。','這句結論概括青少年，未談成人壓力及回報。'],
  ['這句主體段說青少年看似快樂，原句在結論重述。','這句用成人壓力作比較，沒有結論的自由時間與責任概括。','這句結論明確選成年人，原句先承認青少年一方。'],
  ['這句在主體段展開成人的三項幸福基礎，原句在結論重申。','這句結論先承認青少年的表面快樂，原句作最終選擇。','這句重新界定幸福概念，未直接比較兩個人生階段。'],
  ['這句承認成人壓力並說回報平衡，未重定義幸福概念。','這句最後選成人，原句補上何謂幸福的深層標準。','這句重述青少年的自由時間，原句說無壓力並不等於幸福全部。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先排青少年一方的輕鬆感，再排成年人一方的自主與目標感。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求比較人生哪兩個階段的幸福感？',[
    '青少年時期與成年時期，並說明自己較支持哪一方',
    '只比較兩種學校制服的顏色與價錢差別',
    '只比較不同工作職位的薪金與假期長短',
    '只比較家庭居所面積與交通時間差異',
  ],'範文先公平列兩派，再表明成人通常更快樂。'),
  {type:'multi',prompt:'選出兩方各自的主要幸福理由',detail:'選兩項，再按「確認」。',options:[
    '青少年較少財務責任，有時間與朋友相處及發展興趣',
    '成年人有更多自主選擇、成就與清楚的人生方向',
    '青少年完全沒有壓力，也永遠不用作任何決定',
    '成年人的壓力總是沒有任何有意義的回報',
  ],correct:[0,1],why:'作者承認青春的輕鬆，但認為成人的幸福更有方向和持久性。'},
];
const route=[sequence('依文章次序排列幸福比較',[
  ['引言列兩派並選成人','自由與方向感是作者表態的兩項理由。'],
  ['青少年一方','少帳單和養家責任，放學後可玩樂與交友。'],
  ['成年人一方','能作生活選擇，從事業家庭得到成就與目標。'],
  ['結論重定幸福','青春看似輕鬆；幸福更需要方向與意義。'],
],'範文先公平說明青少年快樂來源，再論證作者更看重成人的深層滿足。')];
const evidence=[
  quiz('青少年為何可能看起來更快樂？',[
    '不用承擔許多帳單養家責任，可多用時間交友與發展興趣',
    '青少年可隨時自行選擇住所職業，完全不用考慮其他人',
    '青少年必定沒有任何情緒壓力，也不用作任何人生決定',
    '青少年每一天都必須支付租金並為家庭提供所有收入',
  ],'範文把較少責任連到更多自由時間。'),
  quiz('中學生放學後運動、聊天和看電影的例子有甚麼作用？',[
    '具體展示不用擔心租金或工作穩定時的輕鬆日常',
    '證明成年人的生活一定不能有運動或朋友',
    '說明中學生已必須負擔全家的租金與開支',
    '只用來比較電影票價，與幸福感毫無關係',
  ],'放學情景使「責任較少」變得可見。'),
  quiz('成年人有哪些具體自主選擇？',[
    '住在哪裏、做甚麼工作、怎樣花錢和與誰建立關係',
    '只能選學校午餐，不能決定住所或工作',
    '只可決定電影類型，不能決定金錢用途',
    '沒有任何關係選擇，也不需面對生活決定',
  ],'四項選擇把 independence 具體化。'),
  quiz('為何自主選擇會帶來滿足感？',[
    '選擇讓成年人感到能掌控自己生活的方向',
    '每個人一有選擇，生活便保證沒有任何壓力',
    '只要能選住所，就不再需要處理任何問題',
    '掌控生活只會使人失去所有工作和關係',
  ],'作者把選擇連到掌控感，再連到滿足感。'),
  quiz('事業和養家的例子證明成年人可能得到甚麼？',[
    '長期投入帶來清楚目標感，而青少年未必已經歷',
    '事業一定消除所有壓力，因此人人都即時快樂',
    '家庭責任只能造成負擔，絕不可能帶來意義',
    '只有租金數字能讓成年人知道人生有沒有方向',
  ],'有意義的責任可形成目標感。'),
  quiz('作者是否否認成年生活有壓力？',[
    '沒有；他認為壓力可由成就和其他有意義回報平衡',
    '有；他說成年人從來不需要面對任何工作壓力',
    '有；他說養家、職業和金錢決定全都沒有難度',
    '沒有；因此作者最後改選青少年一定更快樂',
  ],'Although 句讓步成人壓力，但仍維持整體立場。'),
  quiz('末句怎樣重新界定幸福？',[
    '幸福不只沒有壓力，也要感到人生有方向和意義',
    '幸福只等於放學後有空閒，毋須考慮任何方向',
    '幸福只取決於電影和運動次數，與意義無關',
    '幸福必須完全沒有家庭關係或個人目標',
  ],'末句把表面的輕鬆和更深的方向感區分。'),
];
const logic=[
  sequence('青少年看似更快樂的理由',[
    ['較少重大責任','通常不用付帳單、養家或作大型財務決定。'],
    ['更多自由時間','可用於朋友、興趣與娛樂。'],
    ['中學生例子','放學後運動聊天看電影，毋須憂租金工作。'],
    ['比較性結論','與成人責任相比，青春期顯得無憂。'],
  ],'這一方的關鍵是較少負擔形成輕鬆感，但作者之後會問幸福是否只等於輕鬆。'),
  sequence('成年人較深層幸福的理由',[
    ['自主基礎','能選居住、職業、金錢用途和關係。'],
    ['掌控感','選擇使人感到自己能主導生活。'],
    ['成熟與目標','更懂自己，事業家庭投入帶來人生方向。'],
    ['承認壓力','成人生活有壓力，但有意義回報可平衡。'],
    ['重定幸福','幸福還包括方向、目標和持久滿足。'],
  ],'作者認為自主與意義使幸福比單純無憂更深、更穩定。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('社區訪問發現青少年常說「放學後有空與朋友打球」，成年人常談工作目標。','哪項最能公平呈現範文兩種幸福觀？',[
    '青春較輕鬆，成人有自主與目標帶來滿足',
    '只比較空閒時間，不問成人的自主或生活目標',
    '只看工作責任，不承認青春的社交與休閒好處',
    '只看打球次數，不比較兩個階段的滿足來源',
  ],['範文承認兩種不同來源的幸福，而作者較支持後者。','空閒只是青春好處的一部分，成人的自主與目標也要比較。','成人責任重要，但青春社交和休閒也是真實好處。','運動次數不能代表兩種幸福來源。'],[1,3,8,16],'範文先說青春較少負擔，再說成人自主、成就與目標感。'),
  transfer('一名學生問：成年人明明要付租金和養家，怎會仍可能比較快樂？','哪項最符合作者的成人幸福理由？',[
    '責任可伴隨選擇、成就和目標感，帶來更深滿足',
    '先承認成人責任，再只用可支配收入判斷快樂',
    '只看租金壓力，不考慮自主選擇帶來的滿足',
    '只把工作成就當作快樂，不問生活方向與人際',
  ],['作者承認壓力，認為意義與回報可平衡。','收入可能影響選擇，但範文強調自主、成就和目標。','租金壓力真實，不能據此排除成年自主的滿足。','工作成就有用，仍須考慮生活方向與關係。'],[8,9,12,13],'範文說成人幸福建立在獨立、成就和情感成熟上。'),
  transfer('青年中心只用「每天空閒小時數」評估居民幸福，沒有問生活選擇和目標。','哪項修正最能轉用範文的末句？',[
    '也問自主選擇和生活方向，才看見更深的滿足',
    '只加問工作時數，不詢問居民能否自主選擇',
    '只問娛樂種類，不了解居民的目標或意義感',
    '只比較年齡組別，不檢查生活選擇與方向',
  ],['原文說幸福不只缺壓力，還包括方向和意義。','工時只量時間，未問自主和意義感。','娛樂是幸福的一面，但未問目標。','年齡組別不是生活方向與掌控感的直接證據。'],[10,15,16],'範文以 not just ... it is also ... 重新界定幸福。'),
  transfer('教育課程讓學生自己決定研究題目與合作對象，教師想說明選擇為何可能有益。','哪項最能套用成人自主的機制？',[
    '能作選擇使人感到掌控安排，從而得到滿足',
    '讓學生選題，但不問這是否提升掌控與滿足',
    '只增加題目數量，不給學生實際選擇權',
    '只評估研究成果，不問選擇對學生感受的影響',
  ],['原文由具體選擇推到掌控感，再推到滿足感。','有選題機會後，仍須解釋掌控感如何形成。','題目數多不等於學生真的有選擇。','成果評估沒有回答選擇為何可能令學生滿足。'],[9,10],'範文說成人能選住所職業等，因此感到更能掌控自己生活。'),
  transfer('一名義工多年照顧社區長者，覺得辛苦但也覺得自己的生活有方向。','哪項最能轉用範文的壓力與回報權衡？',[
    '照顧雖辛苦，仍可由有意義的投入得到滿足',
    '只統計義工服務時數，不問他為何覺得有方向',
    '只看辛苦程度，忽略投入社區的意義感',
    '只強調有目標，不承認照顧長者也會累',
  ],['原文承認壓力，但有意義回報可平衡。','時數看投入量，未解釋義工的目標感。','辛苦是真實一面，仍可能有意義的滿足。','目標感重要，但應承認照顧也有壓力。'],[12,13,16],'範文以事業家庭投入和 meaningful rewards 說明目標感。'),
  transfer('學校辯論中，一方說青少年較快樂，理由只是「他們沒有成年人的帳單」。','哪項補充最能把理由寫完整？',[
    '少了財務責任，可多花時間陪朋友和培養興趣',
    '少付帳單減少壓力，卻不問空閒如何使用',
    '只比較帳單金額，不分析朋友與興趣時間',
    '只說青少年較輕鬆，不指出具體日常好處',
  ],['原文用 so 把少責任連到更多自由時間與活動。','少責任有利，但還須說清朋友、興趣與娛樂時間。','帳單金額不是青春快樂的完整理由。','只說較輕鬆，沒有提供具體自由時間用途。'],[3,4,5],'範文列不必付帳單養家，再說能多花時間交友及發展興趣。'),
  transfer('研究員看到成年人能決定住處、職業和金錢用途，卻只把這些視作一張清單。','哪項推論最貼近範文？',[
    '住處職業與花費選擇可增加生活掌控感',
    '只列成年人有多少選項，不解釋掌控感來源',
    '只看職業選擇，不問住處和金錢用途',
    '只比較選項數量，不問哪項帶來生活方向',
  ],['原文下一句明確把選擇連到掌控感和滿足。','選項清單需要連到掌控生活的感覺。','職業只是一種選擇，住處及金錢用途也在題目中。','只數選項，仍未解釋為何帶來滿足。'],[9,10,11],'範文的 These choices 指前句四種選擇，帶來對生活的掌控感。'),
  transfer('一位家長說孩子放學後每天都可與朋友聊天，所以青春必然是人生最幸福階段。','哪項回應最符合範文的保留態度？',[
    '青春輕鬆，成年後的方向感也能帶來幸福',
    '承認孩子社交好處，卻否定成年人目標感',
    '只看成人壓力，不分析自主與成就的滿足',
    '只看孩子聊天頻率，不問其他幸福來源',
  ],['原文區分看似無憂與更深的目標意義。','孩子社交有好處，不能因此排除成年目標感。','壓力存在，但自主與成就也能帶來滿足。','聊天頻率不是所有幸福來源。'],[6,7,13,14,16],'範文說青春看似 carefree，但成年投入可有持久目標感。'),
  transfer('地方調查問兩組居民幸福感：少年有更多娛樂時間，成人有更多自主權和成就經驗。','若依作者立場，哪項結論最恰當？',[
    '少年較輕鬆，成人自主與成就可帶來持久滿足',
    '只比較娛樂時數，不評估成人自主和成就',
    '只說成人責任較多，不問其長期目標感',
    '只看少年輕鬆程度，不承認成人也能滿足',
  ],['作者承認青春優點，整體仍選成人。','娛樂時數漏了成人自主及成就。','責任較多仍可能伴隨方向感。','少年較輕鬆是真實一面，不能否定成人滿足。'],[2,8,13,14,15],'範文引言和結論都選成人，但沒有否定青春較少責任的好處。'),
  transfer('輔導中心想幫不同年齡的人思考幸福，不希望把問題簡化成「壓力愈少愈好」。','哪項問題最能承接範文最終原則？',[
    '你能否選擇生活方向，並從投入中找到意義？',
    '你每天有多少空閒時間，不必談生活方向？',
    '你是否工作繁忙，便不需問有沒有目標？',
    '你做了幾多活動，便可決定生活的意義？',
  ],['末句將幸福連到方向和意義，成人段也談自主與投入。','空閒時間只是部分指標，還須問選擇和意義。','工作忙也可能有目標感，不能不問。','活動數目不能直接等於生活意義。'],[9,10,12,13,16],'範文最後說幸福不只是沒有壓力，還有生活方向和意義。'),
];
export default {key:'discuss-both-views:8',meta:{topic:'青少年和成年人哪一階段通常較快樂',summary:'青少年因較少責任而輕鬆；成年人則可從自主選擇、成就與人生目標得到較深的滿足。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
