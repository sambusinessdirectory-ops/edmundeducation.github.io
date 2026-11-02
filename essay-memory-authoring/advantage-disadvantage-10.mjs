// Single-sex education: possible classroom focus versus mixed-world social preparation.
// Hold for Chinese source repairs in advantage-disadvantage-10-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:10'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In some places, girls and boys are taught apart instead of in the same classes.',
 'This may help some students do better at school for a short time. But I think its main problem is bigger: young people may be less ready to live and work with both women and men after school.',
 'One good point of teaching girls and boys apart is that teenagers may be less easily distracted.',
 'In schools where girls and boys study together, some teenagers think too much about how they look, whether others like them or how to attract someone of another gender.',
 'For example, students may waste part of a lesson trying to look good to one another or worrying too much about how others see them.',
 'When that worry is gone, classes are often quieter and students can pay more attention.',
 'Another good point is that students may speak more confidently in subjects affected by fixed ideas about what girls and boys should study.',
 'For example, girls in a girls-only class may find it easier to speak in physics, while boys in a boys-only school may feel less shy about speaking in literature or languages.',
 'Still, the main bad point is that these schools may make students live in a social world that is too separate from everyday life.',
 'If students spend much of their growing-up years apart, they may become adults who feel uneasy around or have simple, inaccurate ideas about another gender.',
 'This matters because real life is not separated like that: people of different genders must talk and work together at university, at work and in public places.',
 'So a student who does well in a protected school setting may find it hard to work in mixed teams at university or at work, where getting along, respect and growing up matter as much as school knowledge.',
 'To sum up, learning apart may help some students pay attention and speak up, but the harm to their social preparation is more important.',
 'Schools should help children get good grades, and also help them get ready for real life.',
];
const vocabulary=[
 v(['education systems','places','教育制度'],['educated separately','taught apart','分開接受教育'],['rather than together','instead of in the same classes','而非一起上課']),
 v(['Although','But','雖然'],['short-term academic benefits','do better at school for a short time','短期學業好處'],['chief disadvantage','main problem','主要弊端'],['less prepared','less ready','較難作好準備'],['mixed world beyond school','live and work with both women and men after school','學校以外的男女共處世界']),
 v(['One advantage','One good point','一個好處'],['single-sex schooling','teaching girls and boys apart','單一性別教育'],['reduce distraction','less easily distracted','減少分心'],['adolescence','teenagers','青少年期']),
 v(['mixed schools','schools where girls and boys study together','男女混合學校'],['overly concerned','think too much','過分在意'],['appearance','how they look','外表'],['popularity','whether others like them','受歡迎程度'],['opposite sex','another gender','異性']),
 v(['For example','For example','例如'],['part of a lesson can be lost','waste part of a lesson','浪費部分課堂'],['trying to impress one another','trying to look good to one another','彼此取悅'],['excessively self-conscious','worrying too much about how others see them','過度在意形象']),
 v(['that pressure','that worry','那種壓力'],['removed','gone','移除'],['classrooms','classes','課堂'],['calmer','quieter','更平靜'],['more focused','pay more attention','更集中']),
 v(['A second benefit','Another good point','第二個好處'],['participate more confidently','speak more confidently','更有自信地參與'],['gender stereotypes','fixed ideas about what girls and boys should study','性別刻板印象']),
 v(['For instance','For example','例如'],['all-girls environment','girls-only class','全女校環境'],['speak up more readily','find it easier to speak','更願意發言'],['boys’ school','boys-only school','男校'],['less embarrassed','less shy','較少尷尬'],['contributing','speaking','發表意見']),
 v(['Even so','Still','即便如此'],['main disadvantage','main bad point','主要缺點'],['artificial social bubble','social world that is too separate from everyday life','不自然社交溫室']),
 v(['formative years','growing-up years','成長關鍵時期'],['apart','apart','分隔'],['enter adulthood','become adults','進入成年'],['unnecessary awkwardness','feel uneasy around','不必要的尷尬'],['shallow assumptions','simple, inaccurate ideas','表面假設']),
 v(['serious problem','matters','嚴重問題'],['not divided in that way','not separated like that','並非如此分隔'],['public institutions','public places','公共機構'],['communicate and cooperate','talk and work together','溝通合作']),
 v(['sheltered setting','protected school setting','受保護環境'],['struggle','find it hard','遇到困難'],['mixed-group presentations','mixed teams','男女混合小組'],['ease of interaction','getting along','自然互動'],['mutual respect','respect','互相尊重'],['academic knowledge','school knowledge','學術知識']),
 v(['Overall','To sum up','整體而言'],['separate schooling','learning apart','分隔教育'],['improve concentration','pay attention','提升專注'],['classroom confidence','speak up','課堂自信'],['outweighed by','more important','不足以抵消'],['larger social cost','harm to their social preparation','較大社會代價']),
 v(['not merely','and also','不只'],['achieve good grades','get good grades','取得好成績'],['prepare them for life','get ready for real life','為生活作準備']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In some education systems, children study maths and language separately rather than together.',d:[1,8,12],relation:'用 rather than 對比兩種教育安排',formula:'In some education systems, [群體] are educated separately rather than together',meaning:'某些教育制度讓女生與男生分開受教。',usage:'separately 不必然指不同學校，也可能是分班；原文沒有細說。',links:['In some education systems, ', ' separately rather than together.'],labels:['分開的安排']},
 {example:'Although this arrangement can produce a few short-term academic benefits, I believe its chief disadvantage is more significant: it leaves pupils less able to cooperate in mixed teams.',d:[0,8,12],relation:'以 Although 承認短期好處，冒號後點出更重的社會弊端',formula:'Although this arrangement can produce a few short-term academic benefits, I believe its chief disadvantage is more significant: [核心弊端]',meaning:'作者認為短期學業好處不及社會適應的缺點。',usage:'主張利大於弊或弊大於利時，需同時交代兩邊及判斷理由。',links:['Although this arrangement can produce a few short-term academic benefits, I believe its chief disadvantage is more significant: ','.'],labels:['更重大弊端']},
 {example:'One advantage of single-sex schooling is that it can reduce social pressure during adolescence.',d:[1,6,8],relation:'主題句引入青春期可能較少分心的好處',formula:'One advantage of single-sex schooling is that it can [可能好處] during adolescence',meaning:'單一性別教育可能減少青春期的分心。',usage:'can 是可能性；下一句需說明注意力如何受同儕壓力影響。',links:['One advantage of single-sex schooling is that it can ', ' during adolescence.'],labels:['可能好處']},
 {example:'In mixed schools, some teenagers become overly concerned with appearance, status, or attracting the opposite sex.',d:[2,6,8],relation:'用 some 限定在混合學校可能分心的學生',formula:'In mixed schools, some teenagers become overly concerned with [在意的事]',meaning:'部分青少年可能過度在意外表、受歡迎程度或異性眼光。',usage:'這只是範文提出的部分學生情況，不能概括所有混合學校學生。',links:['In mixed schools, some teenagers become overly concerned with ','.'],labels:['過度在意的事']},
 {example:'For example, part of a lesson can be lost to students checking how others see them or trying to impress one another.',d:[3,7,9],relation:'用具體課堂行為解釋分心如何耗掉學習時間',formula:'For example, part of a lesson can be lost to [耗時行為]',meaning:'學生若忙於討好同學或過度在意形象，部分課堂時間可能流失。',usage:'例子要連回時間與注意力，而不是只描述學生性格。',links:['For example, part of a lesson can be lost to ','.'],labels:['耗掉課堂的行為']},
 {example:'When that pressure is removed, classrooms often become calmer and more productive.',d:[3,7,9],relation:'由減少某種壓力推到較平靜、專注的課堂',formula:'When that pressure is removed, classrooms often become [課堂變化]',meaning:'當該同儕壓力降低，課堂可能更平靜集中。',usage:'that pressure 必須回指前文的外表與吸引異性的焦慮；often 不是保證。',links:['When that pressure is removed, classrooms often become ','.'],labels:['課堂變化']},
 {example:'A second benefit is that students may participate more confidently in subjects shaped by expectations about gender.',d:[2,8,11],relation:'提出第二好處：較能在受性別成見影響的科目發言',formula:'A second benefit is that students may participate more confidently in [受成見影響的科目]',meaning:'某些學生在受性別刻板印象影響的科目可能更敢參與。',usage:'may/some 表可能情況，不要強化「某性別天生不適合某科」的成見。',links:['A second benefit is that students may participate more confidently in ','.'],labels:['參與的科目']},
 {example:'For instance, girls in an all-girls environment may speak up more readily in computing, while boys in a boys’ school may feel less embarrassed about contributing in poetry.',d:[3,6,11],relation:'用物理與文學例子說明刻板印象下的課堂信心',formula:'For instance, girls in an all-girls environment may speak up more readily in [科目甲], while boys in a boys’ school may feel less embarrassed about contributing in [科目乙]',meaning:'範文以女校物理和男校文學／語言作為可能更敢發言的例子。',usage:'例子討論參與信心，絕非評判男女實際學科能力。',links:['For instance, girls in an all-girls environment may speak up more readily in ', ', while boys in a boys’ school may feel less embarrassed about contributing in ','.'],labels:['第一科目','第二科目']},
 {example:'Even so, the main disadvantage is that such schools can create a narrow social circle.',d:[2,6,11],relation:'Even so 承認前述好處後轉到主要社會弊端',formula:'Even so, the main disadvantage is that such schools can create [社會局限]',meaning:'單一性別學校可能形成與外界不相似的社交環境。',usage:'主張是學校可能減少混合互動機會，不表示每校都完全隔絕。',links:['Even so, the main disadvantage is that such schools can create ','.'],labels:['社會局限']},
 {example:'If students spend most of their formative years apart, they may enter adulthood with uncertainty or mistaken assumptions about the opposite sex.',d:[3,7,11],relation:'以 If 說明長期分隔可能帶來的成年社交後果',formula:'If students spend most of their formative years apart, they may enter adulthood with [可能後果]',meaning:'長期分隔可能使成年後的互動較尷尬，或留有片面假設。',usage:'may 保留不確定性；不能把此例當成對所有單一性別學校學生的事實斷言。',links:['If students spend most of their formative years apart, they may enter adulthood with ','.'],labels:['可能社交後果']},
 {example:'This is a serious problem because real life is not divided in that way: universities, workplaces, and public institutions all require people of different genders to communicate and cooperate.',d:[3,7,9],relation:'以 because 與冒號解釋真實社會的合作要求',formula:'This is a serious problem because real life is not divided in that way: [現實場合] require [共同能力]',meaning:'大學、職場及公共機構都需要不同性別的人自然合作。',usage:'This 回指前句的社交尷尬與片面假設；後面列具體場合。',links:['This is a serious problem because real life is not divided in that way: ', ' all require ','.'],labels:['現實場合','所需合作']},
 {example:'A student who performs well in a sheltered setting may therefore struggle in mixed-group discussions at university or in workplace teams, where confidence, ease of interaction, and mutual respect matter just as much as academic knowledge.',d:[2,7,10],relation:'用 therefore 與 where 將校內表現、校外合作要求連起來',formula:'A student who performs well in a sheltered setting may therefore struggle in [混合場合], where [社交能力] matter just as much as academic knowledge',meaning:'校內成績好也不保證能自在參與大學或職場混合團隊。',usage:'may 與具體場景避免把可能風險當作必然結果。',links:['A student who performs well in a sheltered setting may therefore struggle in ', ', where ', ' matter just as much as academic knowledge.'],labels:['混合場合','重要社交能力']},
 {example:'Overall, separate schooling may improve concentration and classroom confidence for some students, but those gains are outweighed by the need for social preparation.',d:[1,7,11],relation:'先回顧專注與自信好處，再作社會成本較重的權衡',formula:'Overall, separate schooling may improve [短期好處] for some students, but those gains are outweighed by [更重代價]',meaning:'對部分學生有專注與自信好處，但作者認為社交準備不足的代價更大。',usage:'outweighed 是作者的評價，需有前文對好處與社會風險的比較。',links:['Overall, separate schooling may improve ', ' for some students, but those gains are outweighed by ','.'],labels:['短期好處','較重代價']},
 {example:'Schools should not merely help children achieve good grades; they should also prepare them for the wider society.',d:[1,6,10],relation:'用 not merely...also 把學校目標從分數擴到生活準備',formula:'Schools should not merely help children achieve good grades; they should also prepare them for [更廣目標]',meaning:'學校除了幫孩子考好成績，也應預備其真實生活中的合作。',usage:'結尾呼應引言：判斷教育安排須看考試成績以外的能力。',links:['Schools should not merely help children achieve good grades; they should also prepare them for ','.'],labels:['更廣教育目標']},
];
const usageGuides=[
 '當你要用 rather than 清楚對比現有的兩種安排時。',
 '當你要先承認短期好處，再用冒號說明更重要的長期缺點時。',
 '當你要點出一項做法在特定成長階段可能帶來的第一種好處時。',
 '當你要用 some 限定只有部分人可能受某種同儕壓力影響時。',
 '當你要舉出實際行為，說明時間或注意力如何被分散時。',
 '當你要說某種壓力降低後，環境或表現通常如何改變時。',
 '當你要提出第二項與專注不同的參與或信心好處時。',
 '當你要以 while 並列兩個群體在不同場合可能更敢參與的例子時。',
 '當你已說明好處，接着要以 Even so 引出更重的反面影響時。',
 '當你要用 If 解釋長期缺少某種接觸可能帶來的成年後果時。',
 '當你要用 This 回指前句風險，再用 because 和冒號列出現實場合的要求時。',
 '當你要指出在受保護情境表現好，未必能直接轉移到新團隊或場合時。',
 '當你在結論承認部分人的短期收益，但認為較長遠代價更重時。',
 '當你要用 not merely...also 擴闊教育或制度的評價目標時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把短期課堂好處與長期社交準備分開排列。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('範文討論的教育安排是甚麼？',['男女生分開接受教育','把所有學生完全移出學校','只比較兩種考試科目','只討論教師的男女比例'],'single-sex schooling 是核心安排。'),
 {type:'multi',prompt:'範文承認的兩種可能短期好處是甚麼？',detail:'選兩項，再按「確認」。',options:['部分青少年可能較少分心','部分學生可能更敢參與受成見影響的科目','保證每人都取得更高成績','令成年世界不再需要跨性別合作'],correct:[0,1],why:'正文列出專注與課堂信心；都是可能效果而非保證。'},
];
const route=[sequence('依範文還原利弊比較',[
 ['安排與立場','男女分開受教；作者承認短期學業好處，但認為社會適應代價更大。'],
 ['較少分心','部分學生少受外表及同儕眼光壓力影響，課堂可能更集中。'],
 ['課堂信心','部分學生在受性別成見影響的科目可能更敢發言。'],
 ['社交風險','若成長期間少與另一性別相處，成年後在混合場合可能不自在。'],
 ['最後權衡','學校須預備真實社會的合作，不能只看校內分數。'],
 ],'好處是特定條件下的可能效果；代價是作者認為更重要的校外準備。')];
const evidence=[
 quiz('範文如何解釋部分混合學校學生分心？',['部分青少年過度在意外表、受歡迎程度或吸引異性的眼光','所有學生都完全不想學習','混合學校沒有任何規則','任何異性同學都會打斷每一堂課'],'some teenagers 限定範圍。'),
 quiz('第二種好處與哪種課堂壓力有關？',['某些科目受性別刻板印象影響，部分學生或較敢發言','女生天生不適合物理','男生天生不適合文學','分隔教育保證所有人精通每科'],'範文談參與信心，並非天生能力。'),
 quiz('「不自然的社交溫室」主要指甚麼？',['長期較少接觸混合環境，成年後或較難自在合作','學生完全沒有任何朋友','所有單一性別學校禁止參與社會活動','學校建築物沒有窗戶'],'原文的 bubble 是社交情境比喻。'),
 quiz('為何校內成績優秀仍可能不足？',['大學與職場團隊還需自然互動、成熟和互相尊重','所有大學都不看學業知識','成績好必然造成社交困難','職場從不需要團隊合作'],'作者比較學業知識與校外合作能力。'),
 quiz('作者最後如何權衡？',['部分學生的專注與信心好處，不及可能的社會準備不足','單一性別教育完全沒有任何好處','任何學生都必然無法與異性合作','只要成績高，其他能力都不重要'],'結論承認好處，再判斷社會代價較大。'),
];
const logic=[
 sequence('短期課堂好處的兩條機制',[
 ['部分同儕壓力','一些青少年過度在意外表和吸引異性的眼光。'],
 ['減少分心','若這壓力降低，部分課堂可能更平靜、更集中。'],
 ['性別成見','某些科目受男女性別刻板想法影響。'],
 ['參與信心','部分學生可能較願意在相關課堂發言。'],
 ],'兩種好處有不同機制，不能只說「分開上課會更好」。'),
 sequence('社交準備不足的因果鏈',[
 ['長期分隔','成長階段較少日常跨性別互動。'],
 ['可能影響','成年後或感到尷尬，亦可能有片面假設。'],
 ['現實要求','大學、職場及公共機構需要不同性別的人合作。'],
 ['作者判斷','短期課堂收益不足以抵消較大社交代價。'],
 ],'可能風險須以 may 表達；不能推論所有學生都難以合作。'),
];
const transfers=[
 transfer('某校安排學生在暫時較安靜的教室完成考試準備。','哪句合理評估短期專注與長期能力？',['安靜環境可能幫部分學生集中，但仍須考慮離開教室後的合作能力。','考試環境安靜便證明學生在任何場合都能合作。','只要教室安靜，所有學生必得高分。','課堂專注與未來生活完全不能一起評估。'],['承認短期收益，保留更廣的教育目標。','不能推出社交能力。','過度保證。','兩者可比較。'],[1,12,13],'原文短期專注好處與真實社會準備作權衡。'),
 transfer('課堂中有學生不敢選修某科，原因是同學認為該科只適合某一性別。','哪句準確描述問題？',['性別成見可能影響發言與選科信心，學校應留意參與障礙。','該學生的能力必然不及另一性別。','只要有刻板印象，該科便不能再教授。','所有學生對該科的感受必然相同。'],['談成見與參與，不把成見當事實。','把社會成見誤當能力。','過度結論。','個體可不同。'],[6,7],'原文男女在特定科目可能因成見而較少發言。'),
 transfer('社團先設分組練習，之後要與其他組合作演出。','哪句轉用「受保護環境與真實合作」的分析？',['分組練習可讓人建立信心，但仍應練習之後要用的跨組合作。','分組練習會保證演出時人人都毫無緊張。','只要分組，其他組成員便永遠不需交流。','演出只看個人成績，團隊互動毫不重要。'],['先承認信心，再看校外或跨組要求。','無此保證。','與演出條件矛盾。','合作重要。'],[8,10,11],'原文 sheltered setting 表現好，不代表混合團隊必然自在。'),
 transfer('有人指出單一性別學校可減少部分學生因外表而分心。','哪句避免把可能性擴大為普遍事實？',['部分學生或因此更集中，但不能推論所有混合學校學生都會分心。','所有混合學校學生完全不能專心。','每位單一性別學校學生必定成績較高。','若有人受外表影響，男女便永遠不能一起學習。'],['保留 some/can/often 的範圍。','過度概括。','無成績保證。','過度政策結論。'],[2,3,5],'原文 some teenagers、can、often 限定短期效果。'),
 transfer('大學要求不同背景學生共同做小組報告。','哪句解釋除了知識以外還需甚麼？',['同學需要自然溝通、尊重與協調，才能一起運用所學知識。','只要各自考試高分，小組便不需溝通。','小組報告只看服裝顏色。','不同背景學生不可能共同完成任務。'],['合作能力與知識並重。','忽略互動。','無關。','過度否定。'],[10,11],'原文 mixed-group presentations 要 maturity/ease/respect as much as knowledge。'),
 transfer('某培訓計劃讓學員一直在熟悉的小組內練習。','哪句指出可能的轉移風險？',['在熟悉小組表現好，仍須測試能否與不熟悉的同伴合作。','熟悉小組內的表現必然無用。','只要獨自練習，所有團隊難題便會消失。','與新同伴合作只靠記住課本答案。'],['區分受保護情境與未來要求。','好處仍可能有。','缺少合作經驗。','知識非全部。'],[8,11],'原文 sheltered setting 與 university/workplace teams 的落差。'),
 transfer('一篇作文要比較封閉訓練與共同訓練。','哪句能把雙方理由與立場都放進引言？',['封閉訓練或可減少短期干擾，但若缺少跨組合作練習，其長期代價可能更大。','封閉訓練完全沒有任何可能好處。','只要有短期好處，就毋須評估長期效果。','應先宣布立場，完全不提對方理由。'],['先承認短期好處，再交代較重弊端。','抹掉好處。','權衡不足。','缺少兩邊比較。'],[1,12],'原文 Although ... benefits, I believe ... disadvantage more significant。'),
 transfer('某學生在單一性別班級敢於發言，進入混合小組後仍不自在。','哪句最忠實轉用範文的對照？',['較敢在課堂發言是真實好處，但也應練習不同成員間的自然合作。','在一種課堂敢發言，便保證任何場合都自在。','不自在必然證明之前的發言信心毫無價值。','混合小組一律不應存在。'],['保留信心好處和校外轉移風險。','無跨情境保證。','無需否定好處。','過度結論。'],[6,8,11],'原文 classroom confidence 與 mixed-group competence 是兩維度。'),
 transfer('學校評估教育制度只收集考試分數。','哪句指出評估範圍可能不足？',['還應觀察學生在真實團隊中溝通、尊重他人與解難的能力。','考試分數高便證明所有社交能力都好。','考試分數完全沒有任何價值。','只需評估學生的外表。'],['補充社會準備，仍承認分數有價值。','不能由分數直接推出。','範文未否定成績。','無關。'],[10,11,13],'原文 not merely good grades; also prepare children for life。'),
 transfer('作文結尾須判斷分隔教育的整體利弊。','哪句在保留限定詞的同時作完整權衡？',['對部分學生而言，分隔教育或改善專注與自信；作者仍認為與混合社會合作的準備更重要。','分隔教育令每位學生同樣更集中。','所有學生必然因分隔教育而失去合作能力。','只看其中一個物理課例子便足以作整體判斷。'],['保留 some/may，且比較兩邊證據。','過度保證。','過度保證。','單例不足。'],[2,6,8,12,13],'原文 Overall may improve for some, but social cost outweighs gains。'),
];
export default {key:'advantage-disadvantage:10',meta:{topic:'單一性別教育的課堂好處與社會準備',summary:'範文承認分開受教可能令部分學生較少分心，亦可能更敢在受性別成見影響的科目發言；作者認為長期缺少混合互動造成的社會準備風險更重要。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
