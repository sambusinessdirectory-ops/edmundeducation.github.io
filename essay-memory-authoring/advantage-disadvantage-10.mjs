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
 transfer('某校安排學生在暫時較安靜的教室完成考試準備。','哪句合理評估短期專注與長期能力？',["安靜教室助部分學生專注，仍須評估日後跨群合作", "安靜備試可改善短期成績，便保證各種團隊工作也順利", "學生需要合作，所以課堂的安靜和專注完全沒有價值", "教室暫時較安靜，便足以代表學生長期社交能力已提升"],["同時看短期專注與長期合作準備。", "專注不保證團隊能力。", "合作需要不取消安靜收益。", "環境不直接證明社交提升。"],[1,12,13],'原文短期專注好處與真實社會準備作權衡。'),
 transfer('課堂中有學生不敢選修某科，原因是同學認為該科只適合某一性別。','哪句準確描述問題？',["性別成見或阻礙發言選科，學校應檢查參與障礙", "同學認為某科只適合一種性別，便證明另一性別能力較弱", "學生選科受壓，便表示該科不應再向任何學生提供", "刻板印象會影響信心，但教師完全不能改善課堂參與"],["把成見連到選擇與參與，而非能力本身。", "看法不是能力證據。", "應處理障礙而非取消學科。", "學校可檢視環境。"],[6,7],'原文男女在特定科目可能因成見而較少發言。'),
 transfer('社團先設分組練習，之後要與其他組合作演出。','哪句轉用「受保護環境與真實合作」的分析？',["分組先建立信心，仍須練習演出時的跨組合作", "分組練習能減少壓力，所以正式演出不必與其他組配合", "跨組合作值得學習，因此先在小組建立信心毫無用途", "演出要共同完成，便代表每名學員不需個別練習"],["以先建立信心再練跨組協作處理兩種需要。", "分組不取消最後合作。", "合作價值不否定小組練習。", "共同演出仍需個人準備。"],[8,10,11],'原文 sheltered setting 表現好，不代表混合團隊必然自在。'),
 transfer('有人指出單一性別學校可減少部分學生因外表而分心。','哪句避免把可能性擴大為普遍事實？',["部分學生或較易專注，不能推論混合班人人分心", "部分學生受外表干擾，便代表所有混合班學生都如此", "單一性別環境或幫人專注，因此每人考試分數一定提升", "混合班有時較難專心，便表示男女永遠不能共同學習"],["保留部分及或的限定，不作普遍化。", "由部分推成全部。", "可能收益不保證成績。", "短期分心不等於不能合作。"],[2,3,5],'原文 some teenagers、can、often 限定短期效果。'),
 transfer('大學要求不同背景學生共同做小組報告。','哪句解釋除了知識以外還需甚麼？',["共同報告需溝通、尊重與協調，才能運用知識", "同學考試分數較高，就不必再討論誰負責小組任務", "不同背景學生有不同看法，因此共同報告一定無法完成", "學科知識可幫助報告，但小組過程完全不需人際能力"],["把知識運用連到跨背景合作技能。", "分工仍要溝通。", "差異不等於無法合作。", "知識和協作需並用。"],[10,11],'原文 mixed-group presentations 要 maturity/ease/respect as much as knowledge。'),
 transfer('某培訓計劃讓學員一直在熟悉的小組內練習。','哪句指出可能的轉移風險？',["熟悉小組中表現好，仍須測試能否與新同伴合作", "熟悉小組能建立信心，便保證任何陌生團隊都順利", "需要新同伴合作，所以熟悉小組訓練完全沒有作用", "與新同伴合作只要懂課本內容，不必調整溝通方式"],["指出原環境中的表現不保證轉移。", "過度推論。", "初期訓練仍有價值。", "合作需要人際調整。"],[8,11],'原文 sheltered setting 與 university/workplace teams 的落差。'),
 transfer('一篇作文要比較封閉訓練與共同訓練。','哪句能把雙方理由與立場都放進引言？',["封閉練習或減干擾，缺跨組合作則有長期代價", "封閉訓練可能較安靜，因此毋須檢查長期協作能力", "共同訓練可練合作，所以封閉練習不可能有任何好處", "引言只需宣告立場，無須交代兩類訓練各自理由"],["引言承認短期好處並指出更重的長期風險。", "漏掉長期準備。", "否定了有限好處。", "沒有公平呈現雙方。"],[1,12],'原文 Although ... benefits, I believe ... disadvantage more significant。'),
 transfer('某學生在單一性別班級敢於發言，進入混合小組後仍不自在。','哪句最忠實轉用範文的對照？',["課堂敢發言是好處，仍須練習與不同成員自然合作", "在熟悉班級敢發言，便保證混合小組也完全自在", "進入混合小組不自在，便代表之前的發言進步不重要", "課堂信心和跨組合作可並存，因此不需要再練習後者"],["同時保留真實好處和轉移落差。", "一種情境不保證另一種。", "後續困難不取消先前收益。", "仍需練合作。"],[6,8,11],'原文 classroom confidence 與 mixed-group competence 是兩維度。'),
 transfer('學校評估教育制度只收集考試分數。','哪句指出評估範圍可能不足？',["除了分數，也應觀察真實團隊中的溝通、尊重與解難", "考試成績較高，便足以證明學生能與所有人順利合作", "團隊能力值得評估，所以學校可完全停止所有考試", "只看學生課堂出席率，便已涵蓋實際溝通與解難能力"],["補上學業成績之外的合作準備。", "分數不直接代表社交能力。", "加入評估不等於取消考試。", "出席不等於能力。"],[10,11,13],'原文 not merely good grades; also prepare children for life。'),
 transfer('作文結尾須判斷分隔教育的整體利弊。','哪句在保留限定詞的同時作完整權衡？',["分隔或助部分人專注，仍須重視混合社會合作", "分隔班有短期好處，所以每名學生都應永遠只在分隔班", "跨群合作值得重視，因此分隔班不可能幫任何人專注", "只看一名學生在物理課的表現，便足以決定整體制度"],["保留部分與可能，再比較較重的長期準備。", "有限收益不適用每個人。", "長期風險不取消短期益處。", "單例不足整體評估。"],[2,6,8,12,13],'原文 Overall may improve for some, but social cost outweighs gains。'),
];
const revised=[
 {wrong:['安靜備試或有助成績，團隊合作留待畢業後再練','學生需要合作，因此安靜教室只宜用於個別考試','教室暫時較安靜，社交能力可由課外活動補足'],why:['承認短期收益，卻把長期合作準備推遲。','限定考試用途，未評估安靜帶來的部分學習好處。','補足可能可行，仍需評估跨群合作能力是否形成。']},
 {wrong:['同學認為某科只適合一種性別，學生可先轉科','學生選科受壓，應增加該科的入學資格要求','刻板印象影響信心，課堂可先減少發言次數'],why:['轉科避開壓力，未處理成見造成的參與障礙。','提高門檻可能加深不敢選科，並非問題根源。','減少發言未能讓學生克服性別成見的影響。']},
 {wrong:['分組可先建立信心，演出前由導師負責協調','跨組合作重要，所以每組應先共用相同練習時間','正式演出要合作，學員可在個別練習後再集合'],why:['只交導師協調，學員仍缺少跨組合作練習。','練習時間一致不代表掌握如何與其他組配合。','集合不等於已練習共同演出的溝通與分工。']},
 {wrong:['部分學生較易專注，因此可讓他們申請分組學習','單一性別環境或幫專注，成績變化仍要長期觀察','混合班有時較難專心，學校可先調整座位安排'],why:['提出安排建議，未明確指出不能推論人人分心。','保留不確定性，卻沒有說出「部分」不可擴成普遍。','調整座位可行，未直接處理過度普遍化的推論。']},
 {wrong:['共同報告需分工合作，知識內容可先由各人準備','同學成績較高，小組報告可減少討論時間','不同背景學生有不同看法，可先分別交各自報告'],why:['分工有用，但未完整說明自然溝通、尊重和協調。','成績不直接保證跨背景小組的合作方式。','分別交件會避開題目中的共同完成要求。']},
 {wrong:['熟悉小組中表現好，轉入新組時可先安排導師','熟悉小組能建立信心，轉移能力可由考試評估','與新同伴合作先讀教材，再處理溝通方式'],why:['導師可支援，卻未直接測試與新同伴的合作能力。','考試未必能測出與陌生人協作的能力。','教材知識有用，不能取代人際調整。']},
 {wrong:['封閉練習較安靜，合作問題可留待正文後段分析','共同訓練練合作，封閉練習可保留作考前安排','引言先表明支持共同訓練，再只談長期收益'],why:['開頭若不預告長期代價，兩面及立場不完整。','列出兩種做法，卻未清楚說明長期風險與立場。','只談支持方，未公平呈現封閉練習的有限好處。']},
 {wrong:['熟悉班級敢發言，混合小組則需另一套評估','進入混合小組不自在，可請老師先更改小組成員','課堂信心有益，因此可減少混合小組的練習時間'],why:['指出兩個情境不同，未明確連到需練自然合作。','換成員是可能對策，未說明能力轉移的落差。','信心收益不能取代另一情境的合作練習。']},
 {wrong:['除分數外，可再統計學生參加小組報告的次數','團隊能力值得評估，學校可增加課外活動項目','課堂出席率有用，但仍應觀察學生是否願意發言'],why:['參加次數不是實際溝通、尊重和解難的表現。','增加活動可創造機會，不等於已評估團隊能力。','願意發言是部分訊號，未涵蓋真實團隊合作。']},
 {wrong:['分隔或助部分人專注，長期合作可待畢業再練','跨群合作重要，因此應優先安排混合課外活動','一名學生在物理課敢發言，可先作為改革試點'],why:['承認短期收益，卻把長期社會準備推到畢業後。','課外活動可能有用，但未權衡分隔教育的整體利弊。','個案可啟發試點，不能單獨決定制度結論。']}
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
export default {key:'advantage-disadvantage:10',meta:{topic:'單一性別教育的課堂好處與社會準備',summary:'範文承認分開受教可能令部分學生較少分心，亦可能更敢在受性別成見影響的科目發言；作者認為長期缺少混合互動造成的社會準備風險更重要。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
