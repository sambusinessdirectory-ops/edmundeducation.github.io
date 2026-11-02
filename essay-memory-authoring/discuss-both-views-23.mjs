// Reviewed complete-sentence support for Discuss Both Views 23.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-23-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:23'];const original=source.sentences.map(s=>s.english);
const simple=[
 'Parents have a big part in how their children behave and how they feel and grow.',
 'Some people think parents should mainly stop bad behaviour and teach right and wrong, while others say their biggest job is to give love, safety and a steady home.',
 'I think rules matter, but caring for children in a safe home is the more basic job.',
 'On one side, teaching rules is an important part of raising children, because children do not naturally know all acceptable behaviour.',
 'Without help, they may find it hard to follow rules, stop sudden urges or think about other people’s feelings.',
 'For example, a child who is never told to stop lying, shouting or being selfish may keep doing these things at school and later with other adults.',
 'So parents give children their first guide to right and wrong; they teach good choices before the wider world gives harder punishments.',
 'Good rules do more than punish children; they teach children to control themselves, take responsibility and respect other people.',
 'But I think love and safety are the base for all other lessons.',
 'A child who feels loved, safe and heard is much more willing to listen to parents, but a child who mostly fears them may follow rules only for a while.',
 'For example, when parents calmly explain a mistake instead of always getting angry, children can learn without thinking they are bad people.',
 'A safe home also helps children feel well, believe in themselves and want to learn, all important for growing over time.',
 'Rules without care are like walls without a roof: they can set limits but cannot make a safe home.',
 'In the end, parents should teach children right and wrong, because rules help them become responsible people.',
 'But parents’ first job is to love and protect their children, because children grow into kind, steady adults only when they first feel safe, valued and cared for.',
];
const vocabulary=[
 [['decisive role','big part','決定性角色'],['behaviour','behave','行為'],['emotional development','feel and grow','情感發展']],
 [['correct misbehaviour','stop bad behaviour','糾正不當行為'],['moral values','right and wrong','道德價值'],['most important duty','biggest job','最重要職責'],['offer care, security and a stable home','give love, safety and a steady home','給予關愛安全及穩定家庭']],
 [['discipline is necessary','rules matter','紀律必要'],['nurturing children','caring for children','培育孩子'],['more fundamental responsibility','more basic job','更根本責任']],
 [['discipline','teaching rules','紀律'],['essential part of parenting','important part of raising children','育兒必要部分'],['not born with a complete understanding','do not naturally know','並非天生完全明白'],['acceptable behaviour','acceptable behaviour','可接受行為']],
 [['Without guidance','Without help','缺少引導'],['struggle to respect rules','find it hard to follow rules','難以守規'],['control their impulses','stop sudden urges','控制衝動'],['consider the feelings of others','think about other people’s feelings','顧及他人感受']],
 [['never corrected','never told to stop','從未糾正'],['behaving selfishly','being selfish','自私行為'],['carry these habits into school','keep doing these things at school','把習慣帶進學校'],['adult relationships','with other adults','成人關係']],
 [['first moral compass','first guide to right and wrong','最早道德指南'],['distinguish right from wrong','teach good choices','分辨是非'],['society','wider world','社會'],['harsher consequences','harder punishments','更嚴重後果']],
 [['Good discipline','Good rules','良好紀律'],['does not simply punish','do more than punish','不只懲罰'],['self-control','control themselves','自制'],['responsibility','take responsibility','責任感'],['respect for others','respect other people','尊重他人']],
 [['emotional care and safety','love and safety','情感照顧與安全'],['foundation','base','基礎'],['all other lessons','all other lessons','其他教育']],
 [['feels loved, protected and listened to','feels loved, safe and heard','感到被愛保護與聆聽'],['far more likely to accept guidance','much more willing to listen','更可能接受引導'],['raised mainly through fear','mostly fears them','主要在恐懼中長大'],['only temporarily','only for a while','僅暫時']],
 [['respond to mistakes with calm explanations','calmly explain a mistake','冷靜解釋錯誤'],['constant anger','always getting angry','持續憤怒'],['learn from failure','children can learn','從失敗中學習'],['feeling worthless','thinking they are bad people','覺得自己沒有價值']],
 [['secure home','safe home','安全家庭'],['mental health','feel well','心理健康'],['confidence','believe in themselves','自信'],['curiosity','want to learn','好奇心'],['long-term development','growing over time','長遠發展']],
 [['Discipline without nurture','Rules without care','無關愛的紀律'],['building walls without a roof','walls without a roof','無屋頂的牆'],['create boundaries','set limits','建立界線'],['true shelter','safe home','真正庇護']],
 [['In conclusion','In the end','總結'],['teach their children right from wrong','teach children right and wrong','教孩子分辨是非'],['discipline','rules','紀律'],['responsible members of society','responsible people','負責任的社會成員']],
 [['primary duty','first job','首要責任'],['nurture them','love and protect their children','培育孩子'],['safe environment','safe','安全環境'],['balanced and moral adults','kind, steady adults','平衡有道德的成年人'],['secure, valued and emotionally supported','safe, valued and cared for','安全受重視及情感支持']],
];
const chunkOverrides=[
 ['Parents play a decisive role in shaping both the behaviour','and the emotional development of their children.'],
 ['While some people believe that parents should mainly correct misbehaviour','and teach moral values, others argue that their most important duty','is to offer care, security and a stable home.'],
 ['In my view, although discipline is necessary,','nurturing children in a safe environment','is the more fundamental responsibility.'],
 ['On the one hand, discipline is clearly an essential part','of parenting because children are not born','with a complete understanding of acceptable behaviour.'],
 ['Without guidance, they may struggle to respect rules,','control their impulses or consider the feelings of others.'],
 ['For example, a child who is never corrected','for lying, shouting or behaving selfishly','may carry these habits into school','and later into adult relationships.'],
 ['In this sense, parents act as a child’s first moral compass:','they help children distinguish right from wrong','before society has to impose harsher consequences.'],
 ['Good discipline, therefore, does not simply punish children;','it teaches them self-control, responsibility and respect for others.'],
 ['On the other hand, I believe that emotional care and safety','form the foundation on which all other lessons depend.'],
 ['A child who feels loved, protected and listened to','is far more likely to accept guidance from parents,','whereas a child raised mainly through fear','may obey rules only temporarily.'],
 ['For instance, if parents respond to mistakes with calm explanations','rather than constant anger, children can learn from failure','without feeling worthless.'],
 ['A secure home also supports mental health,','confidence and curiosity, all of which are vital','for long-term development.'],
 ['Discipline without nurture is like building walls without a roof:','it may create boundaries, but it does not provide true shelter.'],
 ['In conclusion, parents should certainly teach their children','right from wrong, as discipline helps them become','responsible members of society.'],
 ['However, their primary duty is to nurture them','and provide a safe environment, because children can only grow','into balanced and moral adults when they first feel','secure, valued and emotionally supported.'],
];
const simpleChunkOverrides=[
 ['Parents have a big part in how their children behave','and how they feel and grow.'],
 ['Some people think parents should mainly stop bad behaviour','and teach right and wrong, while others say','their biggest job is to give love, safety and a steady home.'],
 ['I think rules matter,','but caring for children in a safe home is the more basic job.'],
 ['On one side, teaching rules is an important part','of raising children, because children do not naturally know','all acceptable behaviour.'],
 ['Without help, they may find it hard to follow rules,','stop sudden urges or think about other people’s feelings.'],
 ['For example, a child who is never told','to stop lying, shouting or being selfish','may keep doing these things at school','and later with other adults.'],
 ['So parents give children their first guide to right and wrong;','they teach good choices before the wider world gives harder punishments.'],
 ['Good rules do more than punish children;','they teach children to control themselves, take responsibility','and respect other people.'],
 ['But I think love and safety are the base','for all other lessons.'],
 ['A child who feels loved, safe and heard','is much more willing to listen to parents,','but a child who mostly fears them','may follow rules only for a while.'],
 ['For example, when parents calmly explain a mistake','instead of always getting angry, children can learn','without thinking they are bad people.'],
 ['A safe home also helps children feel well,','believe in themselves and want to learn,','all important for growing over time.'],
 ['Rules without care are like walls without a roof:','they can set limits but cannot make a safe home.'],
 ['In the end, parents should teach children right and wrong,','because rules help them become responsible people.'],
 ['But parents’ first job is to love and protect their children,','because children grow into kind, steady adults','only when they first feel safe, valued and cared for.'],
];
const part=(text,kind,label)=>({text,kind,label});function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
 card('Teachers play a decisive role in shaping both the learning and the confidence of their pupils.','以 shaping both ... and ... 說明兩種影響',[1,3,8],fixed(0,'[照顧者] play a decisive role in shaping both [行為] and [情感發展] of [孩子].','開篇指出父母對行為與情感成長兩方面都有重大影響。','要引入某群人同時影響兩種成長面向時。',[' play a decisive role in shaping both ',' and ',' of '],['有重大影響的人','第一種發展','第二種發展','受影響者'])),
 card('While some people believe that coaches should mainly correct mistakes, others argue that their most important duty is to build confidence.','以 While some ... others ... 並列兩種主要職責',[0,8,13],fixed(1,'While some people believe that [管教是首務], others argue that [照顧者的首務] is to [提供關愛安全].','引言公平列管教與關愛安全兩派對父母主責的看法。','題目要比較同一角色的兩種主要責任時，先準確並列。',['While some people believe that ',', others argue that ',' is to '],['第一方重視的做法','第二方眼中的主要責任','該責任的具體內容'])),
 card('In my view, although strict rules are necessary, creating a trusting team environment is the more fundamental responsibility.','以 although ... more fundamental 選較根本責任',[1,7,8],fixed(2,'In my view, although [紀律必要], [安全關愛] is the more fundamental responsibility.','作者承認管教必要，仍選安全關愛為更根本的職責。','兩項責任都重要，要讓步其中一項後選出更基礎者時。',['In my view, although ',', ',' is the more fundamental responsibility.'],['另一項必要責任','作者判斷較根本的責任'])),
 card('On the one hand, practice is clearly an essential part of learning because pupils are not born with all the required skills.','以 essential part ... because ... 建立管教必要性',[2,4,7],fixed(3,'On the one hand, [教導規則] is clearly an essential part of [養育] because [孩子缺少先天知識].','孩子不是天生明白可接受行為，父母因此需要教導。','要先公平解釋某項訓練為何是成長不可缺的一部分時。',['On the one hand, ',' is clearly an essential part of ',' because '],['必要的教導內容','它屬於的成長過程','尚未自然具備的能力'])),
 card('Without patient guidance, they may struggle to manage time, share tasks or ask for help.','以 Without ... struggle to ... 推出缺引導的困難',[3,5,6],fixed(4,'Without [引導], they may struggle to [自我管理], [另一能力] or [顧及他人].','缺引導時，孩子可能難守規、控制衝動或顧及他人。','要指出缺乏某項支援後，可能同時出現的幾種能力困難時。',["Without ", ", they may struggle to ", ", ", " or "],['缺少的支援','第一種困難','另一種困難','第三種困難'])),
 card('For example, a child who is never corrected for mocking or excluding teammates may carry these habits into school and later into adult relationships.','以 never corrected ... carry habits ... 展示習慣延續',[3,4,7],fixed(5,'For example, a child who is never corrected for [不良行為] may carry these habits into [早期場合] and later into [成年關係].','不被糾正的說謊與自私習慣可能延續到學校及成年。','要以一個孩子的例子說早期不良習慣如何延續到後來環境時。',['For example, a child who is never corrected for ',' may carry these habits into ',' and later into '],['未被糾正的行為','習慣首先影響的場域','之後仍受影響的關係'])),
 card('In this sense, coaches act as a young athlete’s first guides: they help players learn fair play before a governing body has to impose harsher consequences.','以 first guide ... before ... 概括早教比後罰更好',[5,7,12],fixed(6,'In this sense, [照顧者] act as [最早的指引者]: they help [孩子學會是非] before [社會] has to impose [更嚴重後果].','父母先教孩子分辨是非，免得後來由社會施加更嚴懲。','已舉早期習慣，要概括早教如何避免之後更重的處罰時。',['In this sense, ',' act as ',': they help ',' before ',' has to impose '],['早期引導者','所扮演的指南角色','被教會的行為','後來的執行者','可能加重的後果'])),
 card('Good feedback, therefore, does not simply punish players; it teaches them patience, teamwork and respect for others.','以 not simply punish; it teaches ... 區分教導與懲罰',[3,6,10],fixed(7,'Good [管教], therefore, does not simply [懲罰]; it teaches [具體品格].','好管教目的是教自制、責任及尊重，並非只施懲罰。','要修正「管教只等於懲罰」的理解，指出其教育作用時。',['Good ',', therefore, does not simply ','; it teaches '],['有教育作用的做法','表面上的懲罰','真正要養成的品質'])),
 card('On the other hand, I believe that trust and encouragement form the foundation on which all other lessons depend.','以 form the foundation ... 轉向更基礎條件',[2,7,9],fixed(8,'On the other hand, I believe that [關愛安全] form the foundation on which [其他教導] depend.','情感照顧與安全感讓其他教育有可依靠的基礎。','已說某項教導重要，要轉而指出另一種條件先支撐全部教導時。',['On the other hand, I believe that ',' form the foundation on which ',' depend.'],['較根本的支持條件','依賴此條件的其他學習'])),
 card('A trainee who feels respected and listened to is far more likely to accept guidance from a coach, whereas a trainee raised mainly through fear may follow rules only temporarily.','以受尊重與恐懼對比長期接受教導',[7,8,10],fixed(9,'A [被關愛者] is far more likely to [接受指引], whereas a [受恐懼管教者] raised mainly through [恐懼] may [守規] only temporarily.','安全關愛使孩子更願受教；恐懼只可能帶來短暫服從。','要比較信任與恐懼兩種環境對持久學習的不同效果時。',['A ',' is far more likely to ', ', whereas a ',' raised mainly through ',' may ',' only temporarily.'],['感受被尊重的人','較願意接受的指引','另一個受教者','主導其經驗的情緒','短暫的表面行為'])),
 card('For instance, if teachers respond to mistakes with quiet explanations rather than public anger, children can learn from failure without feeling ashamed.','以 calm explanation rather than anger 展示安全的糾錯',[8,9,11],fixed(10,'For instance, if parents respond to mistakes with [冷靜解釋] rather than [持續發怒], children can learn from [失敗] without feeling [自我否定].','父母冷靜解釋犯錯，讓孩子學習而不覺得自己沒有價值。','要舉例說一種糾錯方式如何兼顧規則與情感安全時。',['For instance, if ',' respond to mistakes with ',' rather than ',', children can learn from ',' without feeling '],['回應錯誤的照顧者','有助學習的回應','會傷自尊的回應','可成為學習材料的經驗','應避免的負面感受'])),
 card('A supportive school also supports health, confidence and curiosity, all of which are vital for long-term learning.','以 all of which ... 歸納多項長期成長因素',[8,10,12],fixed(11,'A [安全環境] also supports [健康], [自信] and [好奇], all of which are vital for [長遠發展].','安全家庭支援心理健康、自信與好奇心，三者都關係長遠成長。','列出數項由安全環境支持的品質，再說它們共同的重要性時。',[' also supports ', ', ', ' and ', ', all of which are vital for '],['提供支援的環境','第一項能力或狀態','第二項能力或狀態','第三項能力或狀態','它們共同支援的長遠結果'])),
 card('Discipline without care is like walls without a roof: it may create order, but it does not provide a safe place to grow.','以 without ... is like ... 比喻有界線卻缺庇護',[7,8,11],fixed(12,'Discipline without [關愛] is like [有牆無頂的屋]: it may create [界線], but it does not provide [真正庇護].','只有規矩沒有關愛，能立界線卻不能提供真正安全。','要承認一項方法有部分用途，同時說明缺少關鍵配套使它不足時。',['Discipline without ',' is like ',': it may create ',', but it does not provide '],['不能缺少的情感元素','表達不完整的比喻','仍能做到的有限功能','仍無法給予的核心需要'])),
 card('In conclusion, teachers should certainly show pupils right from wrong, as guidance helps them become responsible members of society.','以 should certainly ... as ... 於結論保留管教價值',[2,7,14],fixed(13,'In conclusion, [照顧者] should certainly [教是非], as [管教] helps them become [負責任社會成員].','結論沒有否定管教：父母仍須教是非，培養負責任的人。','最後選另一責任為首要時，仍要公平保留第一項必要作用。',['In conclusion, ',' should certainly ', ', as ', ' helps them become '],['仍須負責任的照顧者','不可放棄的教導','能幫助其成長的做法','孩子後來成為的人'])),
 card('However, their primary duty is to guide new workers and provide a safe workplace, because employees can only grow into confident and careful professionals when they first feel secure, valued and emotionally supported.','以 can only grow ... when they first feel ... 說先有安全才有成長',[2,9,13],fixed(14,'However, their primary duty is to [培育] and provide [安全環境], because [孩子] can only grow into [成熟者] when they first feel [被支持].','父母首要給安全與情感支持，孩子才有條件成為穩健有道德的人。','已承認規則重要，要在結尾說明較基礎的安全感是成熟成長前提時。',['However, their primary duty is to ',' and provide ', ', because ', ' can only grow into ', ' when they first feel '],['主責中的培育行動','提供的安全條件','需要成長的人','期望成為的人','必須先有的感受'])),
];
const wrongReasons=[
 ['這句並列管教與關愛兩派，原句先交代父母的雙重影響。','這句說管教是育兒必要部分，已進入一方理由。','這句轉向關愛安全是基礎，原句是引言背景。'],
 ['這句只說父母影響行為與情感，未提出兩派主責。','這句已表達作者選安全關愛，原句先報告兩方。','這句結論承認管教，並非引言的兩派並列。'],
 ['這句列兩派觀點，未以 although 讓步並選更根本責任。','這句解釋管教為何必要，未表態更根本是哪一項。','這句轉到關愛段，原句在引言先給作者立場。'],
 ['這句在引言選關愛，原句開始公平論證管教方。','這句列缺引導的困難，原句先解釋孩子為何需學行為。','這句歸納管教的真正作用，原句先說其必要。'],
 ['這句講孩子尚未懂可接受行為，未列缺引導後三種困難。','這句舉不糾正後壞習慣延續例子，原句先概括困難。','這句比喻父母為指南針，未列具體自我管理困難。'],
 ['這句只列守規與控制衝動的困難，未給不糾正孩子的個案。','這句概括早教避免社會重罰，未舉行為延續例子。','這句定義好管教，未呈現壞習慣帶入學校的情境。'],
 ['這句是具體孩子延續壞習慣的例子，未抽成早教與後罰。','這句歸納好紀律教品格，未使用先後結果對照。','這句比喻缺關愛的管教，處理的是另一方立場。'],
 ['這句說管教必要，未區分只懲罰與教自制責任。','這句用父母指南針概括早教，未定義好紀律目的。','這句舉冷靜糾錯，原句在管教段作概括。'],
 ['這句是引言比較兩責任，未說關愛支撐其餘教育。','這句結束管教段，未轉到安全感的基礎作用。','這句用兩類孩子比較，原句先提出情感安全的總論。'],
 ['這句只說安全是基礎，未對比被愛與恐懼兩種後果。','這句是冷靜解釋錯誤的個案，原句先作兩類孩子比較。','這句列安全家庭的三項長期好處，未說恐懼只致暫服。'],
 ['這句概括被愛者較受教，未舉父母如何回應犯錯。','這句列家庭長期好處，沒有糾錯時的具體回應。','這句以無屋頂比喻缺關愛，未呈現冷靜解釋情境。'],
 ['這句比較兩類孩子對指引的反應，未列三種長遠能力。','這句舉一次冷靜糾錯，原句概括安全家庭多項好處。','這句用屋頂比喻必要性，未列健康自信好奇心。'],
 ['這句說好管教教自制與尊重，未指出缺關愛的局限。','這句概述安全家庭好處，未用有牆無頂的比喻。','這句結論保留教是非，未說規則不能代替庇護。'],
 ['這句在引言讓步紀律必要，未於結論重申其社會用途。','這句比喻缺關愛的規矩，原句轉回父母仍須教是非。','這句下一句選關愛主責，原句先承認管教價值。'],
 ['這句在引言選關愛為基礎，未以安全感是成熟前提作結。','這句只說安全家庭有健康自信好奇的好處，未作最終責任判斷。','這句保留教是非的責任，原句再表明關愛安全的首位。'],
];structures.forEach((s,i)=>s.wrongReasons=wrongReasons[i]);
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清管教的教育作用，再看安全感如何支撐管教與成長。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('題目比較父母哪兩項主要責任？',['教孩子是非與管教，或提供關愛安全','讓孩子每天只參加同一種體育比賽','只選家庭外牆應塗甚麼顏色','只比較成人與孩子喜歡的電視節目'],'兩方討論父母應主要管教，還是培育並提供安全環境。'),{type:'multi',prompt:'選出作者對管教與關愛的完整看法',detail:'選兩項，再按「確認」。',options:['管教必要，能教孩子自制、負責任和尊重人','關愛與安全更根本，讓孩子願意受教並健康成長','只要父母有關愛，孩子便永遠不需任何規矩','只要父母嚴懲，孩子便不必感到被愛和安全'],correct:[0,1],why:'作者保留管教，但按發展先後判關愛和安全更基礎。'}];
const route=[sequence('依文章次序排列兩種育兒責任',[['引言與立場','列教規矩與提供安全兩派，作者選安全關愛更根本。'],['管教理由','孩子要學守規、控制衝動與顧及別人。'],['管教例子','不糾正說謊自私，習慣會延續到學校與成年。'],['關愛理由','被愛者更願受教；恐懼只可能產生暫時服從。'],['結論排序','父母仍教是非，首要先給安全與情感支持。']],'比較焦點不是是否需要管教，而是何者支撐長遠成長。')];
const evidence=[
 quiz('孩子為何需要父母教導行為規矩？',['孩子不是天生完全明白甚麼行為可接受','孩子出生時已知道每一項社會與家庭規矩','所有規矩都只在孩子長大工作後才出現','只要有愛，孩子便不會做任何錯誤選擇'],'文章從孩子需學社會行為說明管教必要。'),
 quiz('若孩子說謊、自私而從不被糾正，可能怎樣？',['壞習慣可帶到學校與後來的成年關係','壞習慣一定會在入學當天自動完全消失','孩子會因無人指出問題而自然懂得所有規矩','說謊與自私只影響衣服外觀而不影響他人'],'例子顯示早期行為可以延續。'),
 quiz('作者所說的好管教重點是甚麼？',['教自制、責任與尊重，不只施加懲罰','讓孩子害怕所有成人，卻不解釋任何規則','只要求孩子服從，不需學會顧及別人','把每項錯誤都當成永久無法改變的品格'],'好紀律有正面的教育目的。'),
 quiz('被愛且被聆聽的孩子與恐懼中長大的孩子有何差別？',['前者較願受指引，後者可能只暫時服從','兩者都絕對不可能學到任何規矩','後者只因害怕，便一定理解規矩背後原因','前者感到安全，就必然拒絕任何父母教導'],'情感安全影響管教能否被內化。'),
 quiz('父母如何回應錯誤，能讓孩子學習又不覺自己沒價值？',['以冷靜解釋代替持續發怒','當眾責罵直到孩子完全不敢說話','永遠不提錯誤，也不幫孩子理解後果','只說孩子一犯錯便不值得被任何人關愛'],'冷靜解釋同時保留引導與尊嚴。'),
 quiz('安全家庭還支援哪三方面？',['心理健康、自信心與好奇心','只支援家具的顏色與房間大小','只支援孩子記住所有電視節目','只支援父母省下每月的電話費'],'這三項與長遠發展有關。'),
 quiz('「沒有屋頂的牆」比喻說明甚麼？',['規矩能劃界線，缺關愛仍不能給真正庇護','只要有規矩，孩子便完全不需感到安全','關愛就是懲罰，兩者永遠沒有任何差別','屋頂能代替教是非，父母不再需要引導'],'比喻承認紀律有用，指出它缺少的安全感。'),
];
const logic=[sequence('管教論證怎樣逐步成立',[['孩子起點','孩子不是天生就明白行為規範。'],['缺引導後果','難守規、控制衝動與顧及他人。'],['具體例子','說謊自私若未糾正，可延續到成年。'],['管教目的','早教是非，養成自制責任尊重。']],'好管教是教會行為，不只是讓孩子害怕處罰。'),sequence('作者為何把關愛安全放首位',[['基本條件','關愛和安全是其他教導的基礎。'],['兩種反應','被愛的孩子較願受教，恐懼只令暫服。'],['具體方法','犯錯時冷靜解釋，使孩子能學而不自卑。'],['長遠成果','安全家庭支援健康自信好奇。'],['結論','仍要教是非，但先讓孩子感到安全及被重視。']],'情感安全使規矩更可能成為孩子長期的內在能力。')];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('教練每次都當眾罵犯錯的隊員；隊員在場時照做，教練一走便照舊。','哪項最符合範文對恐懼管教的分析？',['害怕可帶來暫時服從，卻未必讓隊員真正學會','只看隊員當場照做，不查教練離開後的行為','只減少公開責罵次數，不教隊員理解錯誤','只問隊員怕不怕，不觀察真正學會甚麼'],['表面服從不等於內化規則。','當場服從可能源於害怕，離開後照舊顯示未學會。','少責罵有用，仍要教正確做法。','恐懼程度要連到是否真正理解。'],[7,9,10],'恐懼只可能令孩子暫時服從，安全指引才有助內化。'),
 transfer('孩子在學校常插話，父母只說「不要再犯」，卻從未解釋輪流發言為何重要。','哪項最能補足好的管教？',['說明輪流能尊重別人，再練習等待發言','只說不准插話，不解釋輪流發言的原因','只解釋尊重，不練習等待輪到自己','只處理學校插話，不讓家庭平日教導'],['要教自制與尊重，不只是禁止行為。','規則須解釋尊重別人的理由。','理解理由之後仍需練習等待。','家庭也可養成日常發言習慣。'],[3,4,7],'孩子需學守規與顧及他人，好管教教自制尊重。'),
 transfer('孩子因考試失手難過，父母先聽他說，再一起找錯題，沒有把成績等同孩子價值。','哪項最貼近範文的安全糾錯？',['冷靜解釋可讓孩子從失敗學習而不自卑','只找出錯題，不先聽孩子考試後的感受','只安慰情緒，不一起分析錯題和改進','只看這次分數，不談孩子能否繼續學'],['兼顧犯錯學習與情感支持。','分析錯題有用，先聽孩子能保護自尊。','安慰有用，仍需學習錯題。','一次成績不等於孩子整體價值。'],[9,10,11],'冷靜解釋錯誤，使孩子能學習而不覺自己沒價值。'),
 transfer('有家長說只要家庭溫暖，孩子便不必學會說真話或尊重別人。','依範文，最完整的回應是甚麼？',['關愛更根本，但父母仍須教是非與尊重','只提供溫暖，不教孩子說真話與尊重','只訂是非規則，不提供安全的家庭關愛','只比較家長說話，不看日常相處是否可信'],['關愛優先不等於取消管教。','關愛是根本，仍要教是非。','教是非必要，安全關愛也不可少。','口頭規則以外，日常關係要可靠。'],[2,3,7,13,14],'關愛安全較根本，教孩子是非仍必要。'),
 transfer('一名孩子在家說謊未被理會，後來在學校也說謊，與同學的信任逐漸受損。','哪項因果鏈最合範文？',['早期習慣未被糾正，可能延續並傷害關係','只處理學校說謊，不回看家中早期習慣','只要求同學重新信任，不教孩子改說真話','只記錄說謊次數，不分析關係如何受損'],['範文以早期習慣延續作例。','學校處理有用，家庭早期習慣也可能延續。','修復信任要靠改變說謊行為。','次數只顯現象，還要看關係傷害。'],[5,6],'未糾正的說謊自私習慣可帶進學校及成年關係。'),
 transfer('寄養家庭為孩子訂了明確規矩，卻沒有固定住處，也很少聆聽孩子的擔心。','哪項最貼近「有牆無頂」的比喻？',['規矩能設界線，缺安全關愛仍不能給庇護','只訂更嚴規矩，不處理住所與被聆聽的需要','只改善住處，不讓孩子理解日常界線','只增加家務任務，不問孩子是否感到安全'],['界線有用，但不是完整的照顧。','更多規矩不能替代穩定住所與被聆聽。','住所重要，孩子也需要清楚界線。','任務不是安全關愛的證據。'],[8,11,12],'紀律沒有關愛，能立界線卻不能提供真正庇護。'),
 transfer('老師希望學生敢提問，卻每次有錯都公開羞辱；學生開始不敢嘗試新問題。','哪項改變最貼近範文的成長前提？',['先建立安全感，再以冷靜指引幫學生學習','只鼓勵學生提問，不改公開羞辱的做法','只停止羞辱，不給犯錯後的清楚指引','只看答題分數，不問學生是否敢嘗試'],['安全和不羞辱支援信心與好奇。','鼓勵提問與公開羞辱互相抵消。','停止羞辱後仍需冷靜指引。','分數不足以看到敢不敢嘗試。'],[8,10,11],'安全感支援自信與好奇，冷靜糾錯能促進學習。'),
 transfer('新入職員工犯錯時，主管先聽他解釋，再說明規則和後果，員工其後能獨立改善。','這案例如何轉用範文的兩項原則？',['安全地聆聽，加上清楚教規矩，較易養成責任','只清楚講規則，不先聽員工犯錯原因','只溫和聆聽，不說明後果與改進方法','只記錄犯錯次數，不培養獨立改進能力'],['同時保留安全關係和規範學習。','規則清楚有用，聆聽可幫助找犯錯原因。','溫和聆聽有用，仍須說明規則和後果。','記錄次數不是培養責任的方法。'],[7,9,10,14],'關愛安全是基礎，清楚管教教責任。'),
 transfer('父母教孩子上網不透露住址，也讓孩子知道遇到可疑訊息時可安心求助。','哪項最合範文的責任排序？',['規則保護孩子，安全信任讓孩子願意求助','只禁止透露住址，不建立孩子安心求助的信任','只提供情緒支持，不教基本私隱保護規則','只教封鎖陌生帳號，不說明可向家長求助'],['具體規則與信任關係互相支援。','禁止透露住址有用，孩子也要敢於求助。','信任重要，仍需具體私隱規則。','封鎖是一步，仍要建立向父母求助的渠道。'],[3,8,9,14],'規則教行為；安全感使孩子願意接受指引。'),
 transfer('一篇文章結論要承認教孩子是非的作用，同時指出父母最根本的職責。','哪句最符合範文？',['父母仍須教是非，但首要是提供關愛安全','只講教是非，不指出關愛安全的首要地位','只講關愛安全，不承認父母也須教是非','只列兩種家庭職責，不說哪項最根本'],['保留管教並按成長前提排先後。','教是非有作用，但文章重心是關愛安全。','關愛安全首要，父母也須教是非。','結論要明確比較兩項職責。'],[2,13,14],'管教必要，關愛安全更根本。'),
];
// Reviewed connector structure decompositions.
structures[10].frame.parts=[["For instance, if ","link","句型固定部分"],["parents","slot","作出回應的人"],[" respond to mistakes with ","link","句型固定部分"],["calm explanations","slot","建設性回應"],[" rather than ","link","句型固定部分"],["constant anger","slot","較差的回應"],[", children can learn from ","link","句型固定部分"],["failure","slot","可從中學習的經驗"],[" without feeling ","link","句型固定部分"],["worthless","slot","可能產生的負面感受"],[".","link","句型固定部分"]];
structures[10].frame.formula="For instance, if [作出回應的人] respond to mistakes with [建設性回應] rather than [較差的回應], children can learn from [可從中學習的經驗] without feeling [可能產生的負面感受].";
export default {key:'discuss-both-views:23',meta:{topic:'父母應以管教還是關愛安全為首要責任',summary:'父母須教孩子是非與自制，但情感支持和安全環境是接受指引及長遠成長的更根本基礎。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
