// Reviewed Opinion 92: excessive screen entertainment and children's well-being.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-92-ielts-opinion.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['opinion:92'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'TV and video games are now common in childhood, and many children spend hours looking at screens each day.',
 'I strongly agree that too much of this can harm children’s mental health, because it may make feelings harder to manage and take time away from playing with others and using imagination.',
 'One main problem is that too much screen entertainment can give a growing child too much excitement.',
 'Many shows and games use quick action, rewards right away, loud sounds and pictures that change all the time.',
 'When children spend a long time with these, they may get used to being excited all the time.',
 'Then reading, homework or talking with people may start to seem too slow and less enjoyable.',
 'For example, a child who plays action games every evening may get angry when told to stop, not because they are a bad person, but because they have grown used to fast challenges and rewards.',
 'After a while, this may make it harder to wait, focus and stay calm.',
 'Another reason is that too much screen time takes the place of things that help children feel well.',
 'Children need to move their bodies, sleep, meet friends and play freely to understand feelings and feel sure of themselves.',
 'If TV and games fill almost all free time, these helpful habits get pushed out.',
 'Instead of learning to discuss, share, lose kindly and solve disagreements with real people, children may spend more time in made-up worlds.',
 'A child who feels alone and plays games every day after school may have fun, but still not feel close to anyone.',
 'This can make loneliness worse and make it harder to be with people later.',
 'To sum up, I strongly agree that too much TV and gaming can harm children’s mental health.',
 'These activities may seem harmless, but when they take up most of a child’s day, they may make it harder to manage feelings, meet others and enjoy many kinds of childhood experiences.',
];
const vocabulary=[
 [['Television','TV','電視'],['video games','video games','電子遊戲'],['normal part of childhood','common in childhood','童年生活常見的一環'],['hours each day in front of a screen','hours looking at screens each day','每天看螢幕數小時']],
 [['completely agree','strongly agree','完全同意'],['this pattern','too much of this','這種使用模式'],['harmful to their mental health','harm children’s mental health','損害心理健康'],['weakens emotional control','make feelings harder to manage','削弱情緒控制'],['social and imaginative play','playing with others and using imagination','社交及想像遊戲']],
 [['first major problem','One main problem','第一個主要問題'],['excessive screen entertainment','too much screen entertainment','過量螢幕娛樂'],['overstimulate the developing mind','give a growing child too much excitement','過度刺激發展中的大腦']],
 [['programmes','shows','節目'],['fast movement','quick action','快速動作'],['instant rewards','rewards right away','即時獎勵'],['constant visual change','pictures that change all the time','持續變換的畫面']],
 [['When children are exposed to this for long periods','When children spend a long time with these','長時間接觸'],['their minds become used to','they may get used to','大腦逐漸習慣'],['a high level of stimulation','being excited all the time','高強度刺激']],
 [['As a result','Then','結果'],['ordinary activities','reading, homework or talking with people','日常活動'],['conversation','talking with people','交談'],['slow and unrewarding','too slow and less enjoyable','緩慢而缺少成就感']],
 [['For example','For example','例如'],['spends every evening playing action games','plays action games every evening','每晚玩動作遊戲'],['become angry','get angry','變得憤怒'],['not because he has a bad character, but because','not because they are a bad person, but because','並非性格不好而是另有原因'],['quick cycle of challenge, reward, and excitement','fast challenges and rewards','快速挑戰與獎勵循環']],
 [['Over time','After a while','久而久之'],['erode patience','make it harder to wait','削弱耐性'],['concentration','focus','專注力'],['emotional stability','stay calm','情緒穩定']],
 [['Another reason','Another reason','另一原因'],['heavy screen use','too much screen time','大量使用螢幕'],['pushes aside','takes the place of','擠走'],['experiences that protect children’s mental health','things that help children feel well','保護心理健康的經歷']],
 [['exercise','move their bodies','運動'],['face-to-face friendships','meet friends','面對面的友誼'],['unstructured play','play freely','自由玩耍'],['process feelings','understand feelings','處理情緒'],['build confidence','feel sure of themselves','建立自信']],
 [['If television and gaming fill most of their free time','If TV and games fill almost all free time','如果電視與遊戲佔據大部分空閒時間'],['protective routines','helpful habits','有保護作用的習慣'],['squeezed out','pushed out','被擠走']],
 [['Instead of learning','Instead of learning','本應學習而未學習'],['negotiate','discuss','協商'],['lose gracefully','lose kindly','坦然面對失敗'],['solve conflict','solve disagreements','解決衝突'],['artificial one','made-up worlds','虛擬世界']],
 [['A lonely child','A child who feels alone','孤獨的孩子'],['goes straight home to video games every day','plays games every day after school','每天放學玩遊戲'],['feel entertained','have fun','覺得好玩'],['not genuinely connected','still not feel close to anyone','沒有真正連繫']],
 [['deepen isolation','make loneliness worse','加深孤立感'],['social situations','be with people','社交場合'],['more difficult later','harder to be with people later','日後更難']],
 [['In conclusion','To sum up','總結來說'],['completely agree','strongly agree','完全同意'],['excessive television viewing and video gaming','too much TV and gaming','過量看電視和玩遊戲'],['damaging to children’s mental health','harm children’s mental health','損害兒童心理健康']],
 [['harmless entertainment','harmless','無害的娛樂'],['dominate a child’s daily life','take up most of a child’s day','主導日常生活'],['weaken emotional control','make it harder to manage feelings','削弱情緒控制'],['real-world interaction','meet others','真實互動'],['much narrower experience','many kinds of childhood experiences','更單一的童年生活']],
];
export {original,simple,vocabulary};
function frame(i,links,labels,meaning,usage,example,tag,job){
 const value=original[i],parts=[];let cursor=0,slot=0;
 for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error('Missing fixed wording '+(i+1)+': '+link);
  if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
  parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
 if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
 if(slot!==labels.length)throw Error('Unmatched slot labels '+(i+1));
 return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
 frame(0,[' have become ', ', and '],['已變得常見的活動','活動在童年中的位置','孩子目前花多少時間'],'have become 指逐漸形成的現況；and 加入可觀察的使用量。','引言要交代一種活動已變普遍，並補上讀者能理解的日常規模時。','Online games have become common, and many children use them daily.','have become...and','以普遍性及規模開場'),
 frame(1,['I completely agree that ', ' because ', ' and '],['作者贊成的心理健康判斷','情緒控制受到影響的理由','其他有益活動被取代的理由'],'because 後面並列兩條主體論證，不把兩者混成一項。','引言要直接表明同意程度，並預告兩個不同的理由時。','I completely agree that long hours can cause problems because rest falls and play disappears.','I completely agree...because...and','表態並預告雙重理由'),
 frame(2,[' is that ', ' can '],['第一個主要問題','過量娛樂的對象','可能過度刺激的結果'],'is that 直接提出第一條問題；can 保留可能而非必然。','要提出一項可能的心理或行為機制，避免斷言所有人都受同樣影響時。','The first problem is that loud media can overwhelm young users.','is that...can','提出有保留的第一機制'),
 frame(3,[' are built around '],['節目遊戲的設計對象','快速動作與獎勵等刺激元素'],'are built around 指出內容設計的具體特點，為後文機制提供基礎。','要描述某產品或活動如何以一組固定特徵吸引使用者時。','Many apps are built around fast rewards and repeated alerts.','are built around','列出促成機制的設計元素'),
 frame(4,['When ', ', their minds become '],['長時間接觸刺激的條件','大腦逐漸習慣高刺激的結果'],'When 設定長時間接觸；become 指習慣逐步形成。','要說明反覆接觸某刺激後，使用者可能如何逐漸改變時。','When children watch it for hours, their minds become used to quick changes.','When...become','連接長時間接觸與逐漸適應'),
 frame(5,['As a result, ', ' may '],['平常活動','可能變得缺少吸引力的結果'],'As a result 承接前句的刺激習慣；may 保留個別差異。','前文已提出機制，下一句要寫出日常生活中可能觀察到的影響時。','As a result, reading may start to feel slower.','As a result...may','推出可能的日常影響'),
 frame(6,['For example, ', ', not because ', ', but because '],['作為例子的孩子及反應','不應過早歸咎的性格解釋','文中提出的習慣性機制'],'not because...but because 更正對孩子反應的單一責備。','要用具體例子指出某行為可能另有成因，避免先責怪個人性格時。','For example, a child may object, not because he is rude, but because he feels overwhelmed.','not because...but because','以個案更正錯誤歸因'),
 frame(7,['Over time, ', ' can '],['刺激習慣的長期累積','耐性專注或情緒上的可能影響'],'Over time 指累積時間；can 避免保證每個孩子都出現相同結果。','要分析反覆行為可能帶來的長期變化時。','Over time, this pattern can make patience harder to practise.','Over time...can','指出有保留的長期影響'),
 frame(8,['Another reason is that '],['其他保護兒童心理健康的經歷被擠走'],'Another reason is that 把論證從刺激作用切換到時間被擠走。','第一條原因已談內容特徵，現在要轉到被活動取代的其他經歷時。','Another reason is that screen time can displace outdoor play.','Another reason is that','切換至時間替代機制'),
 frame(9,[' in order to '],['兒童需要的活動','處理情緒並建立自信的目的'],'in order to 說明運動、睡眠和社交為何值得保護。','列出有益活動後，要解釋它們支持甚麼成長需要時。','Children need time outdoors in order to build confidence.','in order to','連接活動與成長目的'),
 frame(10,['If ', ', these ', ' are '],['螢幕娛樂佔滿空閒時間的條件','受影響的保護習慣','習慣被擠走的結果'],'If 提出特定條件，避免把適度使用也說成同樣問題。','一種活動只有在佔用過多時間時才妨礙其他習慣，需要標明條件時。','If games fill every evening, these routines are pushed aside.','If...these...are','指出過量使用的替代後果'),
 frame(11,['Instead of ', ', children become '],['本可在現實中練習的社交能力','螢幕世界中的被動或虛擬角色'],'Instead of 強調失去的實際練習，而不只批評螢幕活動本身。','要說明一種活動取代另一種更能培養能力的經歷時。','Instead of meeting friends, children become viewers of virtual games.','Instead of...become','對比失去的實際練習'),
 frame(12,[' may feel ', ', but not '],['放學後獨自玩遊戲的孩子','當下被娛樂的感受','仍未得到的人際連結'],'but not 區分短暫娛樂與真正的關係感。','要指出一種活動能提供即時愉快，卻未必滿足另一種需要時。','A lonely child may feel amused, but not connected to friends.','may feel...but not','區分娛樂與連結'),
 frame(13,['This can ', ' and '],['孤立感可能加深的影響','日後社交可能更難的影響'],'This can 承接前句的孤獨個案；and 加上長期社交層面。','個案已說明當下狀態，接着要推到可能的兩項相關後果時。','This can deepen loneliness and make later meetings harder.','This can...and','由個案推出可能後果'),
 frame(14,['In conclusion, ', ' are '],['作者完全同意的總結判斷','過量娛樂對心理健康的影響'],'In conclusion 重申題目立場，並限定為過量使用。','結尾要重申同意程度，同時保留「過量」這個重要範圍時。','In conclusion, I completely agree that excessive games are harmful.','In conclusion...are','收束有範圍的立場'),
 frame(15,[' may look like ', ', but when ', ', they can '],['令人擔心的活動','看似無害的娛樂印象','活動主導日常的條件','情緒社交與童年體驗受損的可能結果'],'may look like 先承認表面吸引力；but when 限定風險出現的過量情況。','結尾要承認娛樂本身可吸引人，再限定何時可能造成多方面代價時。','Games may look like harmless fun, but when they fill the day, they can crowd out sleep.','may look like...but when','以過量條件收束多面影響'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+target.tag+'」'+target.job+'。'),answerReason:'示例用「'+target.tag+'」'+target.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的兩條機制及結論順序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('作者的立場有甚麼重要範圍？',['完全同意過量觀看及遊戲可能有害，重點在佔據太多時間','認為所有看電視的孩子都一定生病','認為遊戲本身不可能有任何娛樂作用','只討論成人工作時看螢幕'],'引言與結論都強調 excessive 和長時間佔據日常生活。'),
 quiz('文章提出哪兩條主要理由？',['快速刺激可能影響耐性；過量使用亦會擠走睡眠、活動及社交','只有節目畫面顏色會造成問題','只要有手機就不需要任何休息','文章沒有談其他有益活動'],'第一段談刺激習慣，第二段談保護性活動被替代。'),
];
const route=[sequence('由快速刺激到童年經歷被擠走',[
 ['引言：限定過量使用','同意長時間看電視及玩遊戲可能損害心理健康。'],
 ['理由一：快節奏刺激','節目與遊戲的速度、聲音和即時獎勵可能改變平常活動的感受。'],
 ['例子與可能後果','孩子被要求停止遊戲時可能生氣；長遠或影響耐性與專注。'],
 ['理由二：其他活動被取代','運動、睡眠、面對面友誼和自由玩耍可能被擠走。'],
 ['結尾：回收條件與兩面影響','活動看似無害，但主導日常時可能使童年體驗變單一。'],
],'先區分內容帶來的刺激與時間分配帶來的替代，再回收過量條件。')];
const evidence=[
 quiz('第一段指出節目與遊戲哪幾種設計特點？',['動作快速、獎勵即時、聲音響亮，而且畫面不斷變化','主要依靠長篇文字及長時間靜默','完全不使用畫面或聲音','只使用學校功課作為獎勵'],'文章用具體刺激元素支撐其第一條機制。'),
 quiz('被要求停玩時孩子發怒的例子，作者反對哪種過早判斷？',['先把反應全部歸咎於孩子性格，而不檢查使用習慣','先詢問孩子玩了多久和正在玩甚麼','留意遊戲節奏是否影響停止時的反應','承認孩子反應可能有多種原因'],'原文用 not because...but because 阻止讀者立即責怪品格。'),
 quiz('第二段認為哪些經歷可能被大量螢幕使用擠走？',['運動、睡眠、朋友相聚及自由玩耍','只有手機充電和下載遊戲的時間','所有學校課堂和教師工作','任何一次短暫觀看都必然取消睡眠'],'這些活動支持孩子處理情緒、建立信心及現實社交。'),
 quiz('文章為何特別提到自由玩耍？',['孩子可在非預設的活動中練習想像、分享及解決衝突','自由玩耍與情緒或社交練習完全無關','玩耍只可能發生在電子遊戲畫面裡','只要有工作紙，其他活動全部無用'],'原文把 unstructured play 列為可保護發展的經歷，並談現實互動技能。'),
 quiz('孤獨孩子放學後天天玩遊戲的例子想區分甚麼？',['即時感到好玩與真正感到有人陪伴，是兩種不同的需要','只要遊戲好玩就必定不再孤獨','只要孩子孤獨就應完全取消所有娛樂','遊戲中有角色就等於有現實朋友'],'may feel entertained, but not genuinely connected 對比娛樂與人際連結。'),
 quiz('作者為何在後果處多用 may 或 can？',['說明過量使用可能帶來風險，沒有斷言每個孩子結果相同','證明這些風險已在所有孩子身上出現','表示文章完全沒有提出任何立場','暗示適度使用也必定造成相同影響'],'文章以可能語氣及過量條件限制論點。'),
];
const logic=[
 sequence('快速刺激如何影響平常活動的感受',[
 ['節目遊戲設計刺激強','快動作、即時獎勵及持續變畫面。'],
 ['長時間接觸後可能習慣','孩子逐漸期待持續的快速刺激。'],
 ['平常活動顯得較慢','閱讀、功課或交談可能變得沒那麼吸引。'],
 ['長期耐性與專注或受影響','範文以 can 表明這是可能而非必然。'],
 ],'第一條論證不是「所有遊戲都有害」，而是長時間與高刺激結合時的風險。'),
 sequence('螢幕時間如何擠走保護性經歷',[
 ['螢幕佔去大部分空閒時間','其他活動的時間被壓縮。'],
 ['運動睡眠與自由玩耍減少','孩子較少練習處理情緒和建立自信。'],
 ['現實中的社交練習變少','協商、分享和處理衝突的機會縮小。'],
 ['孤獨感可能持續','娛樂未必等於真正與他人連繫。'],
 ],'第二條論證以時間分配及被取代的經歷，解釋可能的心理與社交代價。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('一名孩子每天玩節奏很快、獎勵頻繁的遊戲數小時，之後覺得閱讀很慢。','範文會如何連接兩者？',['長時間習慣快速刺激後，閱讀可能顯得較慢且沒那麼吸引','閱讀速度完全只由書本顏色決定，和使用習慣無關','玩遊戲時間越長，所有孩子就必然越喜歡安靜閱讀','只要遊戲有獎勵，閱讀內容一定會立即變得更容易'],['原文從刺激設計及長時間接觸推到日常活動感受。','忽略情境中已知的使用節奏。','把可能性說成必然且方向相反。','沒有解釋吸引力變化。'],[3,4,5],'原文說高刺激後普通活動 may start to feel slow。'),
 transfer('一位家長見孩子停玩時生氣，立即說孩子「天生品格差」，卻不知道他已連續玩了很久。','哪項回應最符合範文？',['先了解孩子的遊戲習慣及當下反應，避免立即用性格解釋','只要孩子生氣，就可直接判定他永遠無法控制情緒','完全不看孩子玩的時間，只根據一次生氣反應下結論','認為任何遊戲都會令每名孩子出現同一種生氣反應'],['原文的例子用 not because...but because 更正過早的品格歸因。','把一次反應推成永久判斷。','正是原文反對的過早判斷。','忽略個別差異。'],[6],'原文提醒讀者別先把停玩後生氣歸因於孩子性格。'),
 transfer('某家庭看電視的時間延長後，孩子的睡眠和戶外活動都減少了。','哪項分析可轉用第二段？',['螢幕時間可能擠走原有的保護性習慣，應檢查時間分配','睡眠與運動的變化只可能由電視機的品牌造成','只要孩子看過電視，就完全不可能再與朋友相處','戶外活動減少已證明每個孩子都會患相同疾病'],['原文的第二條機制是其他有益活動被替代。','品牌與已描述的時間分配無關。','以絕對語氣否認其他可能。','由個別情境過度概括。'],[8,9,10],'原文說若電視遊戲佔去大部分時間，其他日常習慣會被擠走。'),
 transfer('一所學校安排每天的自由玩耍時段，孩子會自己商量規則、分享玩具並處理爭執。','這能支持範文哪項主張？',['自由玩耍提供練習現實社交和處理分歧的機會','自由玩耍完全沒有規則，也不能培養任何合作能力','只要安排玩耍時段，孩子就永遠不會再有衝突','玩具的價格是決定所有社交能力的唯一因素'],['原文重視社交及非結構化玩耍提供的實際練習。','與情境中的協商分享相反。','把學習機會誇大為沒有衝突。','忽略已知社交過程。'],[9,11],'原文列出協商、分享、面對失敗及解決衝突。'),
 transfer('一個孩子放學後獨自在家玩遊戲覺得開心，但仍說自己沒有朋友可以傾談。','哪項區分最準確？',['遊戲可提供短暫娛樂，但不一定滿足與真人連繫的需要','孩子覺得遊戲好玩，就必然不可能同時感到孤單','沒有朋友可傾談，便代表所有遊戲都完全沒有娛樂性','遊戲角色可以完全代替現實中所有朋友和交流'],['原文區分 feel entertained 與 genuinely connected。','忽略情境中兩種感受並存。','原文承認遊戲能娛樂。','把虛擬活動等同真實關係。'],[12,13],'原文的孤獨孩子個案表明娛樂和人際連結不同。'),
 transfer('一篇作文說「一分鐘遊戲也一定損害每個孩子的心理健康」，沒有談使用時間。','如何改寫才符合範文？',['限定為過量且主導日常生活的使用，再討論可能的影響','保留所有絕對字眼，因為範文也主張任何使用都必然有害','只刪除題目的「心理健康」，完全不回答原本的作文問題','把每個孩子的使用情況和生活背景視為完全相同'],['原文反覆限定 excessive、most free time 及 when they dominate。','與原文的範圍及可能語氣不符。','失去題目核心。','忽略個別差異。'],[1,10,14,15],'原文的立場針對過量使用，並以 may/can 表達風險。'),
 transfer('某社區中心安排孩子每天先運動、與朋友相處和睡足，再留少量時間觀看節目。','這與範文的兩條機制有甚麼關係？',['保留運動、睡眠與相處時間，避免螢幕擠走其他經歷','只要仍觀看節目，所有運動與友誼就必然立刻失去作用','運動、睡眠和朋友相處只會影響學校考試分數與名次','節目時間少就證明孩子完全不需要任何現實中的玩耍'],['原文特別關注螢幕佔用大部分空閒時間而擠走其他習慣。','否定了已保留的活動。','忽略心理與社交功能。','與保留玩耍的做法相反。'],[8,9,10],'原文列出運動、睡眠、友誼與自由玩耍的作用。'),
 transfer('某平板遊戲每隔幾秒給出提示音和獎勵。作者要解釋設計特點如何影響使用感受。','哪項句子最能轉用範文？',['頻繁聲畫與即時獎勵可能使使用者期待持續刺激','只要遊戲有提示聲音，所有玩家都必然失去耐性','畫面變換和即時獎勵設計與使用習慣絕對無關','提示音越密集，孩子的閱讀速度一定立刻變得更快'],['原文先列設計元素，再談長時間接觸後的可能習慣。','過度概括全部玩家。','忽略題目中的設計機制。','沒有支持這種方向的證據。'],[3,4],'原文用 fast movement、instant rewards 等描述刺激來源。'),
 transfer('一篇文章只說「電子遊戲不好」，卻沒有說明對孩子的哪兩方面造成影響。','借用範文應怎樣補足？',['分別解釋快節奏刺激及有益活動被擠走的兩種機制','只重複「不好」幾次，讓讀者自行猜測背後真正原因','只列遊戲品牌和外觀，避免討論兒童日常生活','把所有孩子的情緒反應都歸為固定性格問題'],['原文以兩條不同機制把立場展開成因果論證。','仍沒有解釋原因。','品牌不是心理與社交機制。','與原文的例子相反。'],[2,3,4,8,9,10],'原文兩個主體段分別談刺激設計與時間替代。'),
 transfer('某家長只看孩子是否玩遊戲，沒有留意遊戲是否佔去睡眠、活動和相聚時間。','哪個檢查問題更貼近範文？',['問遊戲花了多少時間，並看它是否擠走睡眠、運動及友誼','只問電視機的顏色，不再了解孩子如何安排時間','只要孩子仍然玩耍，就宣稱所有其他活動都必然消失','只比較遊戲角色數目，不檢查孩子的日常活動與習慣'],['原文把 heavy use 和被替代的保護性活動連起來。','與時間分配無關。','把有風險的條件誇大。','忽略生活中已知的取捨。'],[8,9,10],'原文指向過量螢幕使用如何擠走保護性習慣。'),
 transfer('一名學生與同伴玩球時需要輪流、接受輸贏並解決爭執；獨自玩遊戲時較少遇到這些情境。','哪項論證最貼近範文？',['現實遊戲可練習協商和接受輸贏，長期被取代會少了機會','只要獨自玩遊戲，孩子就永遠無法與任何人正常說話','同伴玩球必然永遠不會出現任何爭執、失落或情緒反應','輪流與接受輸贏只適用於遊戲畫面，現實中完全用不到'],['原文重視現實互動中協商分享和處理衝突的機會。','以絕對結論超出文本。','題目明示需要解決爭執。','與情境中學到的技能相反。'],[9,11,13],'原文用 Instead of 對比現實社交技能與虛擬角色。'),
 transfer('結尾要重申作者同意，但又不想把所有螢幕使用一律說成有害。','哪句最符合範文？',['過量使用主導日常時，可能削弱情緒控制並擠走真實互動','任何短暫觀看都會使每名孩子立即失去情緒能力','只要節目內容有趣，就完全不需要保留睡眠與朋友時間','所有孩子都會以完全相同方式回應任何一款遊戲'],['原文結尾限定 dominate a child’s daily life 並用 may/can。','過度泛化時長與個體結果。','否定其他保護性經歷。','忽略差異與可能性。'],[14,15],'原文以過量條件收束情緒、社交及童年經歷三項可能代價。'),
];
export default {key:'opinion:92',meta:{topic:'過量看電視和玩遊戲對兒童心理健康的可能影響',summary:'範文以快節奏刺激及運動、睡眠、友誼和自由玩耍被擠走兩條機制支持立場。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
