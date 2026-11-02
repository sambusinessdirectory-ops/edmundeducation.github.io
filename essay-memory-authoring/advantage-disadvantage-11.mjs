// Handwriting practice: learning/fluency versus digital-skill time and penmanship pressure.
// Hold for canonical Chinese source repair in advantage-disadvantage-11-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:11'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'As classrooms use more computers, more schools no longer ask children to spend much time making their handwriting better.',
 'This change may give lessons more time for computer skills and help students who write messily feel less worried.',
 'Still, I think the bad points are much greater than the good points, because writing by hand still matters for learning and doing everyday things without help.',
 'The main problem is how children learn.',
 'Writing by hand is slower and needs more thought than typing, so children have to pick the main ideas, think carefully about words and write each word on purpose.',
 'This extra thinking helps students pay attention, remember how to spell words and keep information in their memory for longer.',
 'For example, a student who writes a short science summary in a notebook may remember the main ideas better than a student who copies whole sentences onto a screen without thinking much.',
 'Another problem is that regular practice writing by hand helps children control small hand movements and write more easily.',
 'If schools stop giving it enough attention, children may feel less able to do tasks that still need handwriting, such as written tests, writing notes on paper texts or filling in forms.',
 'It is true that giving handwriting less attention has some good points.',
 'First, schools can spend more time teaching typing, finding information online and communicating through computers. These skills are clearly useful at university and in many jobs today.',
 'For example, learning to use computer tools for working together may better prepare children for office work.',
 'Second, students who find handwriting hard may feel less upset if people no longer see neat writing as proof that someone is clever.',
 'But these good points have limits.',
 'Schools can teach computer skills and handwriting together, rather than replacing one with the other. They can give extra help to students with messy handwriting without asking less of everyone.',
 'To sum up, this change may seem useful when technology is common, but its problems are clearly more important.',
 'Schools should bring their lessons up to date without treating handwriting as a skill nobody needs, because it still helps children learn deeply, manage everyday written tasks and develop well overall.',
];
const vocabulary=[
 v(['more digital','use more computers','更數碼化'],['growing number of schools','more schools','愈來愈多學校'],['insist','ask','堅持'],['significant time','much time','大量時間'],['improving their handwriting','making their handwriting better','改善手寫字跡']),
 v(['This shift','This change','這項轉變'],['free up lessons','give lessons more time','騰出課堂時間'],['computer-based skills','computer skills','電腦技能'],['reduce pressure','feel less worried','減輕壓力'],['script is untidy','write messily','字跡潦草']),
 v(['Nevertheless','Still','儘管如此'],['disadvantages far outweigh the advantages','bad points are much greater than the good points','缺點遠大於優點'],['crucial role','matters','重要角色'],['everyday independence','doing everyday things without help','日常獨立處事']),
 v(['main drawback','main problem','主要缺點'],['learning','how children learn','學習']),
 v(['deliberate process','needs more thought','需要更用心'],['select key ideas','pick the main ideas','挑選重點'],['process language carefully','think carefully about words','仔細處理語言'],['consciously','on purpose','有意識地']),
 v(['mental effort','thinking','思考努力'],['improves concentration','helps students pay attention','提升專注力'],['reinforces spelling','remember how to spell words','鞏固拼寫'],['long-term memory','memory for longer','長期記憶']),
 v(['For example','For example','例如'],['pupil','student','學生'],['short summary','short science summary','簡短總結'],['key concepts','main ideas','主要概念'],['copies full sentences','copies whole sentences','複製整句'],['little thought','without thinking much','不加思考']),
 v(['A second problem','Another problem','第二問題'],['regular handwriting practice','regular practice writing by hand','經常手寫練習'],['fine motor control','control small hand movements','精細動作控制'],['written fluency','write more easily','流暢書寫']),
 v(['neglect it','stop giving it enough attention','忽視手寫'],['less confident','feel less able','較缺乏信心'],['handwriting is still required','still need handwriting','仍需手寫'],['handwritten tests','written tests','手寫測驗'],['annotating printed texts','writing notes on paper texts','在印刷文本上註記'],['completing forms','filling in forms','填表']),
 v(['Admittedly','It is true','無可否認'],['reducing the emphasis','giving handwriting less attention','減少重視'],['benefits','good points','好處']),
 v(['devote more time','spend more time','花更多時間'],['online research','finding information online','網上資料搜集'],['digital communication','communicating through computers','數碼溝通'],['undeniably useful','clearly useful','確實有用'],['higher education','university','高等教育'],['modern jobs','jobs today','現代工作']),
 v(['For instance','For example','例如'],['collaborative software','computer tools for working together','協作軟件'],['prepare them more directly','better prepare children','更直接作準備'],['office-based work','office work','辦公室工作']),
 v(['weaker writers','students who find handwriting hard','書寫能力較弱的學生'],['less frustrated','less upset','較少挫敗'],['neat penmanship','neat writing','工整字跡'],['sign of intelligence','proof that someone is clever','聰明的象徵']),
 v(['However','But','然而'],['relatively limited','have limits','相對有限']),
 v(['Digital literacy','computer skills','數碼素養'],['alongside','together','同時教授'],['rather than instead of it','rather than replacing one with the other','而非取代'],['poor handwriting','messy handwriting','字跡欠佳'],['targeted help','extra help','針對性協助'],['without lowering expectations','without asking less','不降低要求']),
 v(['In conclusion','To sum up','總結'],['trend','change','趨勢'],['technological age','when technology is common','科技時代'],['clearly more significant','clearly more important','明顯更重要']),
 v(['modernise their curricula','bring their lessons up to date','更新課程'],['obsolete skill','skill nobody needs','過時技能'],['deeper learning','learn deeply','深入學習'],['functional competence','manage everyday written tasks','處理日常書寫任務能力'],['overall development','develop well overall','整體發展']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'As classrooms become more digital, a growing number of schools no longer insist that children spend long periods copying notes.',d:[1,9,13],relation:'以數碼化背景引出學校減少手寫練習的趨勢',formula:'As classrooms become more digital, a growing number of schools no longer insist that children [舊要求]',meaning:'課室數碼化，部分學校不再堅持大量手寫練習。',usage:'描述的是增長中的做法，並非所有學校已完全取消手寫。',links:['As classrooms become more digital, a growing number of schools no longer insist that children ','.'],labels:['減少的舊要求']},
 {example:'This shift may free up lessons for coding and reduce pressure on pupils whose writing is untidy.',d:[0,9,13],relation:'This shift 回指減少手寫練習，再列數碼技能與壓力兩項好處',formula:'This shift may free up lessons for [新技能] and reduce pressure on [受壓學生]',meaning:'時間可轉投電腦技能，字跡潦草的學生壓力或減少。',usage:'may 保留可能性；後文會承認好處，但評估其權重。',links:['This shift may free up lessons for ', ' and reduce pressure on ','.'],labels:['新技能','學生群體']},
 {example:'Nevertheless, I believe the disadvantages far outweigh the advantages, because handwriting still plays a crucial role in both memory and everyday independence.',d:[1,9,15],relation:'用 Nevertheless 承認先前好處，確立手寫仍重要的反對立場',formula:'Nevertheless, I believe the disadvantages far outweigh the advantages, because [更重要的手寫作用]',meaning:'作者認為減少手寫的弊端更重，涉及學習與獨立處事。',usage:'far outweigh 須靠正文兩組弊端及兩組有限好處支援。',links:['Nevertheless, I believe the disadvantages far outweigh the advantages, because ','.'],labels:['更重要的原因']},
 {example:'The main drawback concerns students’ concentration.',d:[2,7,13],relation:'短主題句先點出教育層面的主要弊端',formula:'The main drawback concerns [首要問題]',meaning:'第一個主要弊端是學習可能受影響。',usage:'短句後須說明手寫慢而需思考的機制。',links:['The main drawback concerns ','.'],labels:['首要問題']},
 {example:'Writing by hand is a slower and more thoughtful process than typing, so children must choose key points and shape their words carefully.',d:[3,9,14],relation:'以慢速、有意識的書寫連到挑選重點與思考語言',formula:'Writing by hand is [處理方式] than typing, so children must [思考行動]',meaning:'手寫較慢，孩子須挑選重點、思考語言並有意識地寫字。',usage:'so 表文中的學習機制；不可把「慢」本身等同所有情境的學習優勢。',links:['Writing by hand is ', ' than typing, so children must ','.'],labels:['手寫特點','由此引出的行動']},
 {example:'This extra mental effort improves focus, reinforces spelling and helps new terms stay in long-term memory.',d:[4,8,13],relation:'This extra mental effort 回指前句的挑選、處理與落筆',formula:'This extra mental effort improves [能力一], reinforces [能力二] and helps [內容] stay in long-term memory',meaning:'額外思考有助專注、拼寫和長期記憶。',usage:'須先建立前句思考行動，不能孤立宣稱手寫必定勝過打字。',links:['This extra mental effort improves ', ', reinforces ', ' and helps ', ' stay in long-term memory.'],labels:['第一能力','第二能力','記憶內容']},
 {example:'For example, a pupil who writes a short summary of a history lesson in a notebook is more likely to remember the key points than one who copies full sentences onto a screen with little thought.',d:[4,8,12],relation:'用有思考的簡短總結對比不加思考的整句複製',formula:'For example, a pupil who writes [有思考的筆記] is more likely to remember [內容] than one who copies [機械複製]',meaning:'手寫簡短科學總結的學生可能較記得概念，對照不加思考複製者。',usage:'比較的核心是總結與思考方式，不可推論所有螢幕筆記必然無效。',links:['For example, a pupil who writes ', ' is more likely to remember ', ' than one who copies ','.'],labels:['有思考筆記','要記的內容','機械複製']},
 {example:'A second problem is that regular handwriting practice develops hand control and writing confidence.',d:[3,9,12],relation:'提出另一弊端來源：少練習會失去書寫動作與流暢度',formula:'A second problem is that regular handwriting practice develops [手寫能力]',meaning:'經常手寫可培養精細動作控制與流暢書寫。',usage:'問題是取消練習可能失去這些能力，下一句才說具體場合。',links:['A second problem is that regular handwriting practice develops ','.'],labels:['手寫能力']},
 {example:'If schools neglect it, children may become less confident in situations where handwriting is still required, such as written exams or filling in forms.',d:[4,7,13],relation:'If 說明忽視手寫後，仍需手寫時可能缺乏信心',formula:'If schools neglect it, children may become less confident in situations where handwriting is still required, such as [仍需手寫的場合]',meaning:'忽視練習可能令孩子在手寫測驗、註記或填表時較不自信。',usage:'it 指手寫練習；may 保留可能性。',links:['If schools neglect it, children may become less confident in situations where handwriting is still required, such as ','.'],labels:['仍需手寫的場合']},
 {example:'Admittedly, there are some benefits to reducing the emphasis on perfect penmanship.',d:[2,7,13],relation:'用 Admittedly 承認減少手寫要求的好處',formula:'Admittedly, there are some benefits to reducing the emphasis on [被減少的要求]',meaning:'作者承認減少對手寫的重視也有好處。',usage:'承認好處後要具體列出數碼技能時間與弱書寫者壓力。',links:['Admittedly, there are some benefits to reducing the emphasis on ','.'],labels:['減少的要求']},
 {example:'First, schools can devote more time to typing and digital research, which are undeniably useful in universities and many modern jobs.',d:[4,8,12],relation:'用 which 指回打字與數碼技能的高教及工作用途',formula:'First, schools can devote more time to [數碼技能], which are undeniably useful in [應用場景]',meaning:'騰出時間學打字、資料搜集和數碼溝通，對升學與工作有用。',usage:'「有用」不等於必須取代手寫；下一段會提出並行教法。',links:['First, schools can devote more time to ', ', which are undeniably useful in ','.'],labels:['數碼技能','應用場景']},
 {example:'For instance, teaching children how to use shared documents may prepare them more directly for teamwork in an office.',d:[4,8,13],relation:'以協作軟件例子具體說明數碼技能的工作用途',formula:'For instance, teaching children how to use [數碼工具] may prepare them more directly for [工作任務]',meaning:'學協作軟件可能更直接幫助學生預備辦公室工作。',usage:'may 表可能；不能推論所有工作只用電腦。',links:['For instance, teaching children how to use ', ' may prepare them more directly for ','.'],labels:['數碼工具','應用任務']},
 {example:'Second, weaker writers may feel less frustrated if neat handwriting is no longer treated as a sign of intelligence.',d:[4,8,11],relation:'第二好處是減少把字跡工整與聰明掛鈎帶來的挫敗',formula:'Second, weaker writers may feel less frustrated if [誤解性評價] is no longer treated as a sign of intelligence',meaning:'字跡較差的學生可能較少因被誤判能力而挫敗。',usage:'弱的是字跡或書寫流暢度，不能把它等同智力低。',links:['Second, weaker writers may feel less frustrated if ', ' is no longer treated as a sign of intelligence.'],labels:['被錯誤當作智力指標的事']},
 {example:'However, these savings are relatively limited.',d:[3,8,12],relation:'以 However 把前述好處重新放入權衡',formula:'However, [前述好處] are relatively limited',meaning:'作者認為騰出時間與減少字跡壓力的好處相對有限。',usage:'短句須接並行教學與個別支援的具體反駁。',links:['However, ', ' are relatively limited.'],labels:['前述好處']},
 {example:'Computer skills can be taught alongside handwriting rather than instead of it, and pupils who struggle can be supported through short guided practice without lowering expectations for everyone.',d:[4,9,13],relation:'提出「並行教授＋針對支援」替代非此即彼的安排',formula:'[技能甲] can be taught alongside [技能乙] rather than instead of it, and [需要協助的人] can be supported through [支援] without lowering expectations for everyone',meaning:'數碼素養可與手寫並行；字跡欠佳者可獲個別幫助。',usage:'rather than instead of it 的對象是手寫，不要誤解成數碼技能無用。',links:[' can be taught alongside ', ' rather than instead of it, and ', ' can be supported through ', ' without lowering expectations for everyone.'],labels:['技能甲','技能乙','需協助的學生','支援方式']},
 {example:'In conclusion, although this trend may appear practical in a technological age, its disadvantages are clearly more serious.',d:[2,9,13],relation:'結尾承認科技時代的表面實用性，再作缺點較重判斷',formula:'In conclusion, although this trend may appear practical in a technological age, its disadvantages are clearly [最終權衡]',meaning:'雖然減少手寫練習看似合時，作者認為弊端更重大。',usage:'結論回收前文論證，避免加入未討論的新科技恐慌。',links:['In conclusion, although this trend may appear practical in a technological age, its disadvantages are clearly ','.'],labels:['最終權衡']},
 {example:'Schools should modernise their curricula without treating reading as an obsolete skill, since it remains essential for independent learning and daily life.',d:[2,10,13],relation:'用 without...since 同時要求課程更新與保留重要基礎技能',formula:'Schools should modernise their curricula without treating [基礎技能] as an obsolete skill, since it remains essential for [持續用途]',meaning:'課程可更新，但不應把手寫當成過時，因它仍有學習和日常用途。',usage:'最後的 without 明確拒絕「更新課程必須取消手寫」的假二選一。',links:['Schools should modernise their curricula without treating ', ' as an obsolete skill, since it remains essential for ','.'],labels:['基礎技能','仍重要的用途']},
];
const usageGuides=[
 '當你要以新環境或科技變化作背景，指出某項舊要求正被減少時。',
 '當你要用 This shift 指回前句的變化，並列出騰出時間和減少壓力兩種可能好處時。',
 '當你要以 Nevertheless 承認剛說的好處，仍表明較重的反對理由時。',
 '當你要用一個短主題句點出首要問題，後句再解釋機制時。',
 '當你要對比兩種處理方式，並用 so 說明較慢方式迫使人作甚麼思考時。',
 '當你已交代具體思考行動，要用 This extra... 回指它並列多個學習結果時。',
 '當你要用有思考的簡短整理，對比不加思考的完整複製時。',
 '當你要轉入另一項因減少練習而可能流失的能力時。',
 '當你要用 If 說明忽略一項技能後，在仍需使用它的場合可能遇到甚麼困難時。',
 '當你要先公平承認減少某項要求也有好處，再逐一評估時。',
 '當你要列出可騰出的課時，並用 which 連到升學或工作的實際用途時。',
 '當你要用一個具體工具或活動例子，說明某種技能的未來用途時。',
 '當你要指出取消不合理的能力評價，可能減少某群體的挫敗時。',
 '當你已承認對方好處，要用 However 表明其範圍或權重有限時。',
 '當你要提出兩項技能並行，而非取代；並對有需要的人提供針對支援時。',
 '當你在結論承認新做法看似合時，仍判斷其缺點較重要時。',
 '當你要主張更新安排，同時保留仍有用途的基礎技能，並以 since 說明原因時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把學習、日常書寫、數碼技能和針對支援的關係排清。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('範文評估的學校轉變是甚麼？',['不再要求孩子花大量時間改善手寫','全面取消所有電腦課','只安排學生練習繪畫','所有作業都改成口頭報告'],'焦點是減少 handwriting practice 的要求。'),
 {type:'multi',prompt:'範文承認的兩組好處是甚麼？',detail:'選兩項，再按「確認」。',options:['騰出時間教授打字、網上研究等技能','減少字跡欠佳者因工整度受評價的挫敗','保證每名學生記憶力提高','保證所有日常表格不再需要手寫'],correct:[0,1],why:'作者先承認數碼技能與弱書寫者壓力兩項好處，再評估其局限。'},
];
const route=[sequence('依範文還原手寫利弊',[
 ['數碼化背景與立場','學校減少手寫練習可騰出時間，但作者認為缺點更重。'],
 ['深入學習','手寫需挑選重點、思考語言；範文認為這有助專注與記憶。'],
 ['日常能力','經常練習可培養手部控制與流暢書寫；筆試、註記、填表仍會用到。'],
 ['承認好處','數碼技能對升學和工作有用，減少對字跡工整的壓力也有益。'],
 ['並行方案','數碼與手寫一同教；對需要的人作針對支援，毋須降低整體要求。'],
 ],'作者反對的是以數碼技能取代手寫，並未否認數碼技能本身的價值。')];
const evidence=[
 quiz('範文為何認為手寫過程有助學習？',['較慢的手寫促使學生挑選重點、處理語言及有意識地成字','只要寫得慢，任何內容都必然記住','打字完全不用思考','書寫字跡越漂亮，智力必然越高'],'關鍵是有意識的選擇和處理，而非速度本身。'),
 quiz('科學筆記例子實際比較甚麼？',['自己寫短總結與不加思考地複製整句','所有紙張與所有電腦的品質','學生的畫畫技巧','不同科目的考試難度'],'例子比較思考方式，不能說所有螢幕筆記都無效。'),
 quiz('手寫練習的第二種用途是甚麼？',['發展精細動作控制和流暢書寫，應付仍需手寫的場合','保證每名學生都成為書法家','使所有電子表格消失','完全取代網上研究'],'筆試、註記印刷文本與填表是範文列出的用途。'),
 quiz('數碼技能為何是範文承認的好處？',['打字、網上研究、協作軟件對升學和不少工作有用','數碼技能完全不用學','所有工作只需協作軟件','學會打字便不再需要任何其他能力'],'undeniably useful 不等於必須取代手寫。'),
 quiz('作者提出甚麼方法處理字跡欠佳學生的壓力？',['給予有針對性的幫助，同時維持對所有人的學習要求','把字跡直接當智力高低指標','停止教授所有寫字技能','只讓字跡好的學生使用電腦'],'原文主張 targeted help without lowering expectations for everyone。'),
];
const logic=[
 sequence('手寫與記憶的文中機制',[
 ['手寫較慢','學生不能只快速複製全部內容。'],
 ['有意識處理','挑選重點、仔細想字詞，再寫出來。'],
 ['可能學習效果','專注、拼寫和長期記憶得到幫助。'],
 ['具體對照','短科學總結對比不加思考的整句螢幕複製。'],
 ],'不要把「手寫」單獨當成魔法原因；範文依賴選擇與思考的過程。'),
 sequence('數碼好處與並行解法',[
 ['數碼技能','打字、網上研究和協作軟件對升學及工作有用。'],
 ['字跡壓力','不應把工整字跡當作聰明的證據。'],
 ['並行教學','數碼素養與手寫均可教，毋須二選一。'],
 ['針對支援','字跡欠佳者得到具體協助，整體要求仍保持。'],
 ],'作者說兩組好處相對有限，是因為有能兼顧它們的替代方案。'),
];
const transfers=[
 transfer('學校改用平板做筆記，學生常直接複製整頁資料。','哪句轉用範文對「思考過程」的分析？',['若學生不挑選重點，只把整頁複製下來，便少了整理與思考內容的機會。','所有平板筆記必然比手寫差。','複製的頁數越多，理解一定越深。','只要有平板，學生便不需學任何語言。'],['分析是否整理內容，而非單看工具。','範文沒有否定所有數碼筆記。','數量非理解保證。','語言仍重要。'],[4,5,6],'原文短總結對比不加思考複製整句。'),
 transfer('學校想增加程式設計課時，同時仍有學生需要練字。','哪句避免把兩項技能設成只能選一？',['學校可調整課程同時教授數碼技能和手寫，並按需要給個別練習。','要教程式設計，手寫就必須完全取消。','要保留手寫，所有電腦課都必須停止。','只要學生會打字，日常填表一定不再需要手寫。'],['並行加針對支援。','假二選一。','忽略數碼價值。','日常需求未消失。'],[10,14,16],'原文 digital literacy alongside handwriting rather than instead of it。'),
 transfer('老師發現一名學生字跡凌亂，但理解題目很快。','哪句符合範文對字跡與能力的區分？',['不能把字跡工整直接當作智力指標，應就書寫困難給具體幫助。','字跡凌亂便證明學生不聰明。','理解快便代表完全毋須練習任何書寫。','全班應因一人字跡凌亂而停止寫字。'],['區分智力判斷與技能支援。','把字跡誤當智力。','仍可能需練習。','不需降低所有人的要求。'],[12,14],'原文 neat penmanship 不應視作 intelligence；targeted help。'),
 transfer('一項課程只用打字測驗，學生之後要填寫紙本申請表。','哪句指出可能的能力落差？',['若平日很少手寫，部分學生在紙本表格等場合可能缺乏信心。','只要學會打字，填紙本表格必然毫無困難。','紙本表格存在便證明數碼技能毫無價值。','每位學生都必定無法填表。'],['平日練習與仍需手寫的情境相連。','無保證。','兩種技能都有用途。','避免普遍化。'],[7,8],'原文 fine motor control、written fluency、forms。'),
 transfer('另一篇作文比較手寫摘要與直接複製網頁段落。','哪句最能解釋可能的記憶差異？',['手寫摘要要求學生挑出重點再表達，較直接複製多一層主動處理。','手寫時完全毋須思考，複製時才需要。','所有網頁內容都一定錯誤。','摘要越短就必然記住任何資訊。'],['核心是主動選擇與處理。','方向相反。','無此證據。','仍需內容理解。'],[4,5,6],'原文 select key ideas/process language 與 copies full sentences 對比。'),
 transfer('有學生說協作軟件課可以幫助準備辦公室工作。','哪句公平承認這項好處？',['練習線上協作工具可能為部分工作任務提供直接準備，但不代表其他基礎技能過時。','所有工作從此只使用一套軟件。','協作軟件完全沒有任何用途。','只要會用軟件，便不需閱讀或寫字。'],['承認具體用途，避免擴大結論。','過度普遍化。','違反正文。','無此因果。'],[10,11,16],'原文 collaborative software may prepare for office-based work。'),
 transfer('學校想減少所有手寫測驗，理由是科技時代實用。','哪句能在結論中保留必要權衡？',['科技課程可以更新，但仍應檢視學生是否保有學習及日常手寫能力。','科技時代出現後，所有舊技能都自動無用。','只要有電子設備，學生便不用理解內容。','考試變數碼就能保證每名學生不焦慮。'],['更新課程與保留有用技能可並行。','不能由新推舊無用。','理解仍必要。','無焦慮保證。'],[8,15,16],'原文 modernise curricula without treating handwriting as obsolete。'),
 transfer('作文需承認減少手寫練習的兩項好處。','哪句同時列出兩項而不誇大？',['可騰出部分課時學數碼技能，也可能減輕字跡欠佳學生的壓力。','必定令所有學生得到更高成績。','保證所有紙本書寫任務從此消失。','減少手寫沒有任何可能好處。'],['兩項都在原文，並保留可能性。','無分數保證。','日常需求仍在。','忽略作者承認的好處。'],[1,9,10,12],'原文 free up lessons / reduce pressure，Admittedly benefits。'),
 transfer('校方因部分學生字跡不工整，打算取消全校手寫要求。','哪句分析此方案的範圍問題？',['可針對有需要的學生提供支援，毋須因部分人的困難降低全體練習要求。','所有字跡欠佳學生都應受責備。','只要有人寫得慢，全校就不應學打字。','字跡工整與理解內容完全等同。'],['個別支援與整體課程可以分開設計。','不合理。','無關。','兩者不同。'],[12,14],'原文 targeted help without lowering expectations for everyone。'),
 transfer('作文最後要判斷手寫是否已過時。','哪句完整表達範文立場？',['數碼技能值得教，但手寫仍支援深入學習和部分日常任務，因此不宜被當成過時技能。','因為數碼技能有用，所以手寫絕對無用。','只要手寫有用，就應取消全部電腦課。','字跡好看是評估智力的唯一方法。'],['兼顧數碼價值與手寫持續用途。','假二選一。','範文承認數碼好處。','範文反對此誤判。'],[2,14,16],'原文 modernise curricula，不把 handwriting 當 obsolete。'),
];
export default {key:'advantage-disadvantage:11',meta:{topic:'手寫練習與數碼技能的課時取捨',summary:'範文認為減少手寫練習雖可騰出數碼技能課時並減輕字跡壓力，但可能損及深入學習、手寫流暢度及日常獨立書寫；作者主張並行教授與針對支援。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
