// Individually reviewed, source-specific support for Direct Question 33.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-33-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:33'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'News today often makes the world seem full of fights, terrible events and crime.',
  'This is not because good things hardly happen, but because bad events usually need quick action, catch attention and bring in money.',
  'I think news companies should show a better mix of good and bad stories.',
  'There are two main reasons why bad stories get so much attention.',
  'First, serious things like wars, food shortages and accidents can put people in danger right away, so reporters put them first.',
  'If an illness spreads, a serious crime happens or a storm destroys homes, people need to hear about it soon.',
  'Second, bad stories often make people feel stronger emotions.',
  'Fear, surprise and anger make people click, watch and share, so news companies can reach more people by talking about emergencies instead of slow everyday improvement.',
  'In this way, bad news is like a loud warning bell: people find it hard to ignore even if they are tired of it.',
  'But I think the news should also carry more stories about good things.',
  'Hearing one terrible story after another can make people feel that nothing can improve and that society only gets worse.',
  'That gives people a false idea of what is happening.',
  'For example, news about new ways to treat illness, community projects that work well or lower crime can show that problems can improve.',
  'Good news is more than easy entertainment; it can show answers, encourage people to act well and help them see the world more fully.',
  'If reporters only show what is wrong and never show how things get better, they do not tell the whole story.',
  'To sum up, bad news appears more often because it needs quick attention, makes people feel strong emotions and draws a big audience.',
  'Even so, news companies should report both bad and good changes, because a balanced mix helps people know what is happening without making them feel too hopeless.',
];
const vocabulary=[
  [['news coverage','News today','新聞報道'],['gives the impression','makes the world seem','給人印象'],['dominated by conflict, disaster and crime','full of fights, terrible events and crime','衝突災難罪案佔主導']],
  [['positive events are rare','good things hardly happen','好事罕見'],['negative events','bad events','負面事件'],['urgent','need quick action','緊急'],['dramatic','catch attention','戲劇性'],['commercially powerful','bring in money','具商業吸引力']],
  [['In my view','I think','在我看來'],['news organisations','news companies','新聞機構'],['healthier balance','better mix','較健康的平衡'],['both good and bad news','good and bad stories','好壞消息']],
  [['two main reasons','two main reasons','兩個主因'],['bad news','bad stories','壞消息'],['receives so much attention','get so much attention','受廣泛關注']],
  [['Firstly','First','首先'],['famines','food shortages','饑荒'],['immediate consequences for public safety','put people in danger right away','即時公共安全後果'],['journalists','reporters','記者'],['treat them as priorities','put them first','優先處理']],
  [['disease','illness','疾病'],['spreads','spreads','傳播'],['violent crime','serious crime','暴力罪案'],['natural disaster','storm','自然災害'],['destroys homes','destroys homes','毀掉家園'],['quickly','soon','迅速']],
  [['Secondly','Second','其次'],['negative stories','bad stories','負面故事'],['stronger emotional reactions','stronger emotions','較強情緒反應']],
  [['Fear, shock and anger','Fear, surprise and anger','恐懼震驚憤怒'],['click, watch and share','click, watch and share','點擊觀看分享'],['larger audiences','more people','更多受眾'],['crises','emergencies','危機'],['ordinary progress','slow everyday improvement','日常進展']],
  [['In this sense','In this way','從這角度'],['loud alarm bell','loud warning bell','大聲警鐘'],['hard to ignore','hard to ignore','難以忽視'],['tired of hearing it','tired of it','聽厭了']],
  [['However','But','然而'],['positive stories','stories about good things','正面報道'],['as well','also','也']],
  [['constant stream of tragedy','one terrible story after another','不斷悲劇'],['helpless and cynical','nothing can improve','無助與憤世'],['moving backwards','gets worse','倒退']],
  [['distorted','false','扭曲的'],['picture of reality','idea of what is happening','對現實的看法']],
  [['medical breakthroughs','new ways to treat illness','醫學突破'],['successful community projects','community projects that work well','成功社區計劃'],['declining crime','lower crime','罪案下降'],['problems are not always permanent','problems can improve','問題非永遠不變']],
  [['shallow entertainment','easy entertainment','膚淺娛樂'],['show solutions','show answers','展示解法'],['inspire responsible behaviour','encourage people to act well','鼓勵負責行為'],['more complete understanding','see the world more fully','更全面理解']],
  [['journalism','reporters','新聞工作'],['shows the wound','show what is wrong','只見傷口'],['the healing','how things get better','癒合'],['fails to tell the whole story','do not tell the whole story','故事不完整']],
  [['In conclusion','To sum up','總結'],['dominates','appears more often','佔主導'],['urgent','needs quick attention','緊急'],['emotionally powerful','makes people feel strong emotions','情緒力量強'],['commercially attractive','draws a big audience','商業吸引力']],
  [['Nevertheless','Even so','然而'],['news outlets','news companies','新聞機構'],['negative and positive developments','bad and good changes','好壞發展'],['balanced news diet','balanced mix','平衡資訊'],['keep people informed','helps people know what is happening','保持知情'],['unnecessarily pessimistic','feel too hopeless','過度悲觀']],
];
const chunkOverrides=[
  ['Modern news coverage often gives the impression','that the world is dominated','by conflict, disaster and crime.'],
  ['This is not because positive events are rare,','but because negative events are usually more urgent,','dramatic and commercially powerful.'],
  ['In my view, news organisations should present','a healthier balance of both good and bad news.'],
  ['There are two main reasons','why bad news receives so much attention.'],
  ['Firstly, serious events such as wars, famines and accidents','have immediate consequences for public safety,','so journalists naturally treat them as priorities.'],
  ['If a disease spreads, a violent crime occurs,','or a natural disaster destroys homes,','people need to know quickly.'],
  ['Secondly, negative stories tend to attract','stronger emotional reactions.'],
  ['Fear, shock and anger make people click, watch and share,','which means media companies can gain larger audiences','by focusing on crises rather than ordinary progress.'],
  ['In this sense, bad news often works','like a loud alarm bell:','it is hard to ignore,','even when people are tired of hearing it.'],
  ['However, I believe the news should include','more positive stories as well.'],
  ['A constant stream of tragedy','can make people feel helpless and cynical,','as if society is only moving backwards.'],
  ['This is a distorted picture','of reality.'],
  ['For example, stories about medical breakthroughs,','successful community projects or declining crime in some areas','can remind the public','that problems are not always permanent.'],
  ['Good news does not mean shallow entertainment;','it can show solutions, inspire responsible behaviour','and give people a more complete understanding of the world.'],
  ['If journalism only shows the wound','and never the healing,','it fails to tell the whole story.'],
  ['In conclusion, bad news dominates','because it is urgent, emotionally powerful and commercially attractive.'],
  ['Nevertheless, news outlets should report','both negative and positive developments,','since a balanced news diet would keep people informed','without making them unnecessarily pessimistic.'],
];
const simpleChunkOverrides=[
  ['News today often makes the world seem','full of fights, terrible events and crime.'],
  ['This is not because good things hardly happen,','but because bad events usually need quick action,','catch attention and bring in money.'],
  ['I think news companies should show','a better mix of good and bad stories.'],
  ['There are two main reasons','why bad stories get so much attention.'],
  ['First, serious things like wars, food shortages and accidents','can put people in danger right away,','so reporters put them first.'],
  ['If an illness spreads, a serious crime happens','or a storm destroys homes,','people need to hear about it soon.'],
  ['Second, bad stories often make people feel','stronger emotions.'],
  ['Fear, surprise and anger make people click, watch and share,','so news companies can reach more people','by talking about emergencies instead of slow everyday improvement.'],
  ['In this way, bad news is like a loud warning bell:','people find it hard to ignore','even if they are tired of it.'],
  ['But I think the news should also carry','more stories about good things.'],
  ['Hearing one terrible story after another','can make people feel that nothing can improve','and that society only gets worse.'],
  ['That gives people a false idea','of what is happening.'],
  ['For example, news about new ways to treat illness,','community projects that work well or lower crime','can show that problems can improve.'],
  ['Good news is more than easy entertainment;','it can show answers, encourage people to act well','and help them see the world more fully.'],
  ['If reporters only show what is wrong','and never show how things get better,','they do not tell the whole story.'],
  ['To sum up, bad news appears more often','because it needs quick attention,','makes people feel strong emotions and draws a big audience.'],
  ['Even so, news companies should report','both bad and good changes,','because a balanced mix helps people know what is happening','without making them feel too hopeless.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的語意關係相同。`,distractorReason:`這句${focus}，卻沒有原句的語意關係。`};}
const structures=[
  card('School communication often gives the impression that every change is a problem.','以 gives the impression that 交代負面新聞造成的觀感',[1,2,3],fixed(0,'[現代新聞報道] often gives the impression that [世界充滿衝突災難罪案].','開篇描寫讀者受負面新聞影響後的整體印象。','題目指出壞新聞偏多，先準確描述這種閱讀觀感時。',[' often gives the impression that '],['造成印象的報道','讀者形成的世界觀感'])),
  card('This is not because good events never happen, but because bad events draw faster attention.','以 not because ... but because 排除假原因並指出真原因',[0,4,7],fixed(1,'This is not because [好事罕見], but because [壞事更緊急、更戲劇化及更具商業吸引力].','壞新聞多並非好事稀少，而是壞事更易成為急迫、吸睛的報道。','解釋偏向壞新聞的成因時，要先排除對好事數量的錯誤推論。',['This is not because ', ', but because '],['被排除的原因','真正推動報道的因素'])),
  card('In my view, school bulletins should present a better mix of successes and problems.','以 In my view ... should 主張好壞消息並報',[1,9,16],fixed(2,'In my view, [新聞機構] should present [好壞新聞的健康平衡].','直接回答第二問：媒體應兼顧正面及負面發展。','題目問新聞是否應均衡，需在引言給出明確立場時。',['In my view, ', ' should present '],['應作選擇的媒體','主張的報道組合'])),
  card('There are two main reasons why a safety warning receives so much attention.','以 There are two main reasons why 預告雙重成因',[1,4,6],fixed(3,'There are two main reasons why [壞新聞] receives [大量關注].','預告兩條解釋線：公共安全的急迫性與情緒商業吸引力。','主體段即將分兩點回答為何壞新聞較多，先標示論證數量時。',['There are two main reasons why ', ' receives '],['需要解釋的新聞類別','被吸引的關注'])),
  card('Firstly, warnings about unsafe water have immediate consequences for public health, so reporters naturally treat them as priorities.','以 so 把即時安全後果連到優先報道',[3,5,7],fixed(4,'Firstly, [戰爭饑荒意外等嚴重事件] have [即時公共安全後果], so [記者] naturally treat them as priorities.','危險事件可能立刻影響公眾，因此先報有正當資訊理由。','要說明壞新聞受重視的一個合理原因，需連接危險與優先發布時。',['Firstly, ', ' have ', ', so ', ' naturally treat them as priorities.'],['具有風險的事件','即時的公共後果','作優先安排的人'])),
  card('If a storm damages the bridge, an illness spreads, or a fire closes homes, residents need to know quickly.','以 If ... people need to know quickly 展示速報的情境',[4,6,8],fixed(5,'If [疾病傳播], [暴力罪案發生], or [天災毀屋], [公眾] need to know quickly.','列三種即時風險，具體說明為何不能等好新聞與壞新聞等量後才報。','已提出公共安全原因，要以可即時影響居民的事件具體化時。',['If ', ', ', ', or ', ', ', ' need to know quickly.'],['第一種迫切事件','第二種迫切事件','第三種迫切事件','須盡快知情的人'])),
  card('Secondly, alarming stories tend to attract stronger emotional reactions.','以 Secondly 轉入情緒吸引的第二成因',[3,5,7],fixed(6,'Secondly, [負面報道] tend to attract [更強情緒反應].','第二成因由公共安全轉向讀者情緒。','已談即時風險，下一步要解釋媒體為何商業上偏好壞新聞時。',['Secondly, ', ' tend to attract '],['引起反應的報道','較強的讀者反應'])),
  card('Fear and anger make people click and share, which means channels can gain larger audiences by focusing on crises rather than routine progress.','以 which means 推出情緒如何變成受眾收益',[6,8,9],fixed(7,'[恐懼震驚憤怒] make people [點擊觀看分享], which means [媒體] can gain [更大受眾] by focusing on [危機] rather than [日常進展].','情緒促使互動，互動又讓媒體偏向危機內容。','已說負面故事引起情緒，要解釋從情緒到點擊再到商業動機的機制時。',[' make people ', ', which means ', ' can gain ', ' by focusing on ', ' rather than '],['促發行動的情緒','受眾行為','獲益的媒體','取得的受眾','偏重的內容','較少報的內容'])),
  card('In this sense, a safety alert often works like a loud bell: it is hard to ignore, even when listeners are tired.','以 like a loud alarm bell 比喻壞新聞難忽視',[6,7,10],fixed(8,'In this sense, [壞新聞] often works like [響亮警鐘]: it is [難忽視], even when [讀者聽厭].','用警鐘比喻濃縮急迫性和注意力機制。','兩項成因已解釋完，要以一個貼切比喻總結壞新聞的吸引力時。',['In this sense, ', ' often works like ', ': it is ', ', even when '],['被比喻的消息','警示性比喻','受眾反應','仍無法忽視的情況'])),
  card('However, I believe school notices should include more successes as well.','以 However 轉入正面報道的必要性',[2,8,10],fixed(9,'However, I believe [新聞] should include [更多正面故事] as well.','從壞新聞占多的成因，轉到報道仍須兼顧正面的主張。','說完媒體偏向壞新聞的原因，開始回答應否平衡時。',['However, I believe ', ' should include ', ' as well.'],['需要調整的媒體內容','被忽略的正面故事'])),
  card('A steady stream of failures can make people feel hopeless, as if their school never improves.','以 as if 呈現悲劇連播造成的錯誤感受',[9,11,12],fixed(10,'[連續悲劇報道] can make people feel [無助與憤世], as if [社會只在倒退].','持續負面內容會讓人錯覺社會永遠惡化。','要解釋為何應增加正面報道，先指出只看悲劇的心理後果時。',[' can make people feel ', ', as if '],['持續的負面資訊','可能造成的感受','伴隨的社會錯覺'])),
  card('This is a false picture of the school.','以 This is a distorted picture 承接前句並評估其失真',[10,12,14],fixed(11,'This is [扭曲的現實圖像].','指出社會只會倒退的感覺沒有反映全貌。','已描述讀者被悲劇連播影響，須明確指出這不是全面事實時。',['This is '],['前句觀感的準確性判斷'])),
  card('For example, reports on new treatments and lower injury rates can remind families that problems are not permanent.','以 For example 列出進展證明問題可改善',[10,11,13],fixed(12,'For example, [醫學突破、成功社區計劃或罪案下降] can remind [公眾] that [問題未必永遠存在].','用可核查的進步例子修正只有悲劇的圖像。','說完負面新聞造成扭曲，須給出真實進展作反證時。',['For example, ', ' can remind ', ' that '],['可顯示改善的新聞例子','重新評估的人','例子所證明的可能性'])),
  card('Good news does not mean shallow praise; it can show solutions, inspire pupils to help, and give families hope.','以 not ...; it can ... 對照膚淺娛樂與實質價值',[12,14,15],fixed(13,'Good news does not mean [膚淺娛樂]; it can [展示解法], [鼓勵負責行動] and [增進全面理解].','正面報道不是粉飾，它可呈現解法並補足公眾理解。','有人把好新聞誤當無關痛癢的娛樂，要釐清其公共價值時。',['Good news does not mean ', '; it can ', ', ', ' and '],['需要排除的誤解','第一種實際價值','第二種價值','第三種價值'])),
  card('If a medical report only shows the injury and never the recovery, it fails to tell the full story.','以 wound and healing 對照傷害與修復的完整故事',[11,13,15],fixed(14,'If [新聞] only shows [傷口] and never [癒合], it fails to tell [完整故事].','以傷口與癒合比喻說明只報災難會遺漏解決和進展。','正面報道的價值已說明，要用易記比喻總結為何好壞均須報時。',['If ', ' only shows ', ' and never ', ', it fails to tell '],['需反映全貌的媒體','被反覆呈現的問題','被省略的進展','應完成的報道全貌'])),
  card('In conclusion, urgent news dominates because it is timely, emotional and likely to attract viewers.','以 because 收束壞新聞占多的三項成因',[1,7,16],fixed(15,'In conclusion, [壞新聞] dominates because it is [緊急], [情緒強烈] and [商業吸引].','結論先回應第一問，歸納急迫、情緒與商業三因素。','末段要精簡回答為何媒體偏重壞新聞，不漏三項主要原因時。',['In conclusion, ', ' dominates because it is ', ', ', ' and '],['占多的新聞類別','第一項急迫性','第二項情緒力量','第三項商業誘因'])),
  card('Nevertheless, school bulletins should report success and failure, since a balanced account would keep families informed without making them fearful.','以 since 平衡知情與避免過度悲觀',[2,10,15],fixed(16,'Nevertheless, [新聞機構] should report [好壞發展], since [平衡資訊] would keep [公眾知情] without making them [過度悲觀].','結論再答第二問：好壞均報讓人知情而不陷於無謂悲觀。','成因已總結，還須以報道平衡的具體效果收束立場時。',['Nevertheless, ', ' should report ', ', since ', ' would keep ', ' without making them '],['作報道選擇的機構','應一併呈現的內容','達成平衡的報道組合','需保持知情的人','應避免的情緒後果'])),
];
const wrongReasons=[
  ['成因句解釋偏重壞新聞，沒有先描繪讀者形成的印象。','平衡主張是作者立場，沒有給人印象的表述。','雙原因預告是段落安排，不是讀者世界觀。'],
  ['開題印象只描述表面現象，未排除好事罕見這個假原因。','公共安全是原因之一，沒有把錯誤原因與真原因對照。','情緒點擊是機制，沒有 not because ... but because。'],
  ['成因句沒有作者對報道平衡的規範立場。','第二段轉折重提立場，並非引言先回答題目。','結論再收束立場，不是文章開頭主張。'],
  ['成因對照已有總方向，沒有標明接下來分兩項說明。','安全後果是第一項詳細原因。','情緒反應是第二項詳細原因。'],
  ['兩原因預告沒有把即時安全後果連到優先報道。','疾病等具體情況是安全原因的例子。','點擊收益屬情緒商業原因，不是安全優先次序。'],
  ['安全後果是一般原因，沒有三個需速報的具體情況。','情緒反應是第二原因，不涉及即時危險。','警鐘比喻總結吸引力，沒有疾病罪案天災清單。'],
  ['兩原因預告尚未轉到第二項情緒作用。','速報例子屬公共安全，不是情緒反應。','點擊機制是情緒作用的後續解釋。'],
  ['情緒理由只有總述，未把感受連到點擊與受眾。','警鐘比喻沒有具體商業受眾機制。','正面報道主張是下一段話題。'],
  ['情緒作用只概括心理反應，沒有警鐘比喻。','點擊收益是機制，沒有難以忽視的總結。','悲劇連播是壞新聞後果，不是警示性比喻。'],
  ['平衡主張在引言已提出，但未用 However 轉離成因段。','警鐘句是壞新聞成因收束，尚未轉入好新聞。','悲觀後果是支持平衡的下一步證據。'],
  ['增加正面報道是主張，沒有悲劇連播的心理損害。','現實圖像判斷是後一句評估。','醫學與社區進展是修正悲觀的例子。'],
  ['悲劇連播描述感受，尚未判斷它是否反映現實。','進步例子是證據，不是短句評價。','傷口癒合比喻談完整性，非直接評價扭曲圖像。'],
  ['悲觀錯覺需反證，但本句不是先描述心理後果。','現實失真是判斷，沒有三種實際進展。','好新聞價值是較廣作用，沒有具體醫學社區罪案例子。'],
  ['醫學等例子只能顯示進展，未釐清好新聞不等於娛樂。','傷口癒合比喻總結完整性，沒有三項實際價值。','結論成因回答壞新聞為何多，不是正面報道的作用。'],
  ['現實扭曲的判斷沒有傷口和癒合的對照。','好新聞價值清單是一般論證，未用完整故事比喻。','結論成因是第一問收束，沒有只報傷害的畫面。'],
  ['假原因對照在引言，沒有完整歸納急迫情緒商業。','點擊機制只詳述第二原因，沒有結尾三因素。','平衡立場是另一問的答案，不是壞新聞成因。'],
  ['引言平衡立場尚未經兩段理由支持。','悲劇連播只是偏重負面的代價，沒有最終平衡選擇。','前句只總結成因，尚未回答新聞應否好壞並報。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先找原因、影響與主張的順序，再依範文排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要回答哪兩件事？',[
    '為何壞新聞較多，以及新聞應否同時報道好與壞',
    '哪份報紙最便宜，以及哪些記者最受歡迎',
    '如何拍攝新聞照片，以及應用何種字體',
    '所有壞事能否消失，以及醫院要建在哪裏',
  ],'作者既要解釋壞新聞偏多，也要判斷是否應平衡報道。'),
  {type:'multi',prompt:'選出範文的兩項主要成因',detail:'選兩項，再按「確認」。',options:[
    '戰爭、疾病等危險事件會即時影響公共安全',
    '恐懼和憤怒促使點擊，危機題材可吸引受眾',
    '世界上完全沒有任何值得報道的正面進展',
    '所有記者都無法報道成功的社區或醫學成果',
  ],correct:[0,1],why:'一項是速報公共危險的需要；另一項是情緒與商業受眾。'},
];
const route=[sequence('依範文次序排列四段',[
  ['引言提出兩問答案','負面新聞較吸睛且急迫，但媒體仍應好壞並報。'],
  ['解釋壞新聞偏多','先講即時公共安全，再講情緒點擊和受眾收益。'],
  ['論證增加好新聞','悲劇連播會扭曲現實；進展可顯示問題有解。'],
  ['結論重申平衡','壞新聞有三項優勢，仍應讓公眾知情而不過度悲觀。'],
],'文章先解釋媒體行為，再判斷較完整的報道應有甚麼。')];
const evidence=[
  quiz('危險事件為何常被優先報道？',[
    '疾病、罪案或天災可能即時危及人們安全',
    '因為危險事件必定比所有好事更有趣',
    '只有災難發生時，人們才可以閱讀新聞',
    '報道危險永遠不需要核對任何事實',
  ],'第一成因涉及公眾需要及時知情，而非純粹吸引眼球。'),
  quiz('第二項成因如何產生商業效果？',[
    '恐懼震驚和憤怒促進點擊分享，帶來更多受眾',
    '負面故事一出，所有讀者都停止觀看新聞',
    '危機題材無法引起情緒或任何觀看行為',
    '商業收益只取決於版面顏色，與受眾無關',
  ],'情緒反應連到點擊、觀看和分享，繼而連到受眾規模。'),
  quiz('「警鐘」比喻想說明甚麼？',[
    '負面消息難以忽視，即使人們已聽得疲倦',
    '壞新聞永遠只在清晨以聲音形式播放',
    '讀者一旦聽厭便不再留意任何危險',
    '每宗危機都會在街上安裝真正的警鐘',
  ],'警鐘是對壞新聞引發注意的比喻，不是實物。'),
  quiz('只接收連續悲劇報道可能怎樣影響讀者？',[
    '令他們無助而悲觀，誤以為社會只會倒退',
    '使所有人知道每個問題都已經完全解決',
    '令所有正面進展從世界上立即消失',
    '保證讀者自然得到最完整的現實圖像',
  ],'作者說連播悲劇可造成失真的世界觀。'),
  quiz('哪些正面報道可修正這種失真？',[
    '醫學突破、成功社區計劃與某些地區罪案下降',
    '沒有證據卻宣稱所有疾病和罪案已經消失',
    '只刊娛樂趣聞而不提任何實際社會進展',
    '刻意忽略醫學、社區或治安方面的變化',
  ],'可核查的進展提醒公眾問題可能改善。'),
  quiz('作者如何區分好新聞與膚淺娛樂？',[
    '好新聞也可展示解法、鼓勵行動並補足理解',
    '只要是好新聞，就完全不用查證內容',
    '好新聞只談名人趣事，與社會問題無關',
    '好新聞不可能讓人了解任何解決方案',
  ],'正面報道可以有資訊和公共價值。'),
  quiz('「傷口與癒合」比喻對報道有何要求？',[
    '既報問題，也報修復和進展，才有完整故事',
    '只拍攝醫院傷口，完全不談其他新聞',
    '一旦有好消息，便不能再報任何危險',
    '只讓讀者看災難，避免知道其後改善',
  ],'原文用比喻說明報道不能只呈現損害的一面。'),
];
const logic=[
  sequence('壞新聞受重視的兩條路',[
    ['公共危險','戰爭、疾病和天災可能即時危及安全。'],
    ['需要速報','公眾必須盡快知道，記者因此優先處理。'],
    ['強烈情緒','恐懼、震驚和憤怒引起反應。'],
    ['點擊與受眾','觀看和分享令危機題材具商業吸引力。'],
    ['警鐘效果','負面消息即使聽厭也很難完全忽視。'],
  ],'第一條是公眾需要，第二條是媒體受眾誘因；兩者不能混同。'),
  sequence('為何好消息也是新聞',[
    ['悲劇連播','讀者可能覺得社會只在倒退。'],
    ['認識失真','這種觀感遺漏真實存在的改善。'],
    ['進展例子','醫學、社區和治安變化顯示問題可改善。'],
    ['超越娛樂','正面報道可展示方案及鼓勵負責任行為。'],
    ['完整故事','傷口與癒合都要報，公眾才知情而不過度悲觀。'],
  ],'增加正面報道的理由是完整與準確，不是掩蓋危險。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('地方電台同時收到突發山火警報及一則社區植樹成果。','哪項最能運用範文的即時性理由？',[
    '先發布山火風險，並在後續節目報道植樹成果',
    '只播放植樹成果，完全不告知居民山火風險',
    '把兩則新聞都擱置，直到公眾忘記山火警報',
    '只因山火較吸睛，便不再查證風險是否真實',
  ],['即時安全威脅可先報，但平衡並不要求忽略正面進展。','危險需及時告知。','拖延會失去警示價值。','優先報道仍須查證。'],[4,5,16],'範文說危險事件有即時安全後果，所以先報；整體仍應好壞並報。'),
  transfer('一所大學發出傳染病通知，學生需要立即知道是否停課及如何求醫。','哪項最符合新聞優先報道的原因？',[
    '消息關乎即時安全，應迅速核實並告知學生',
    '消息令人不安，因此任何機構都不應提及',
    '先等待一週，確保資訊不再有任何即時用途',
    '只刊校園娛樂新聞，避免交代停課與求醫',
  ],['原文以疾病擴散說明公眾需迅速知情。','不安不等於可隱瞞。','速報是此處重點。','題目涉及實際行動。'],[4,5],'原文列疾病傳播為需要快速告知公眾的情境。'),
  transfer('一個網站發現憤怒標題更容易被轉發，於是每天只推薦爭吵影片。','哪項最能套用範文的第二項成因？',[
    '強烈情緒帶來點擊分享，網站因此偏向危機內容',
    '網站只報爭吵，必定因為世界上沒有任何好事',
    '讀者越憤怒，媒體的受眾一定會立即變為零',
    '推薦內容只受天氣影響，與分享和商業無關',
  ],['原文把情緒、互動和更大受眾連成商業機制。','好事不罕見。','情緒可增加互動。','推薦也受受眾誘因影響。'],[1,6,7],'範文說負面故事引發情緒，點擊分享令媒體得到更大受眾。'),
  transfer('醫院月報一直只列感染事故，未列新消毒措施後事故如何下降。','哪項最能運用「傷口與癒合」的比喻？',[
    '同時交代事故及改善結果，讓讀者了解全貌',
    '只保留事故數字，完全不提後續處理效果',
    '只寫改善成果，否認曾經出現感染事故',
    '不公布任何資料，讓讀者自行想像醫院情況',
  ],['只報傷害或只報癒合都不夠完整，應呈現兩者。','遺漏修復。','遺漏問題。','完全缺乏資訊。'],[11,12,14],'範文用傷口與癒合比喻要求新聞同時呈現問題和進展。'),
  transfer('社區群組每日只轉發罪案，居民開始以為區內治安一年比一年差。','哪項最能運用範文對失真觀感的分析？',[
    '查看治安數據及改善報道，避免只憑罪案貼文判斷',
    '只要每天有罪案貼文，便證明整體罪案必定上升',
    '叫居民完全不看任何安全資訊，問題便會消失',
    '只轉發更聳動貼文，確保觀感變得更加悲觀',
  ],['悲劇連播會造成社會只在倒退的錯覺，需看完整資料。','頻率不等於趨勢。','仍需安全資訊。','會加深扭曲。'],[10,11,12],'範文說連續悲劇可令人無助悲觀，罪案下降的報道可補足現實。'),
  transfer('一個科學節目想報道新治療方法，但編輯認為好消息只能算娛樂。','哪項最能轉用範文對好新聞的辯護？',[
    '查證研究後介紹治療進展，說明它如何幫助病人',
    '因為結果正面，便完全不用查看研究是否可靠',
    '只播放歡樂音樂，不解釋任何治療或疾病內容',
    '只報治療失敗，避免提及任何可行的新方法',
  ],['醫學突破可示範解法，好新聞仍須有資訊價值。','正面報道也要查證。','娛樂不是此處用途。','會遺漏進展。'],[12,13],'範文用醫學突破說明好新聞可呈現解法，而非只是膚淺娛樂。'),
  transfer('一間學校公布整年度學生表現，報告只寫違規，完全不寫輔導後的改善。','哪項最能套用完整報道的原則？',[
    '同時列違規及改善證據，避免報告只呈現問題',
    '刪去所有改善資料，讓家長只看見學生的錯誤',
    '只寫成功故事，卻完全隱瞞曾發生的違規',
    '把違規和改善都略過，只剩沒有資料的結論',
  ],['平衡是完整呈現問題與改善，不是只挑一面。','只剩傷口。','只剩癒合。','沒有可判斷資料。'],[10,13,14,16],'範文認為正面進展補足悲劇，兩面都報才能讓公眾知情。'),
  transfer('一份新聞簡報連續數月只用「一切愈來愈糟」作標題，卻有些社區項目已見成效。','哪項最能修正簡報的失真？',[
    '加入可核查的社區成果，指出某些問題已有改善',
    '只保留負面標題，禁止讀者看到任何社區資料',
    '直接說所有問題已解決，毋須再報任何困難',
    '把社區成果改成娛樂笑話，不交代實際影響',
  ],['成功社區項目是原文修正悲觀圖像的例子。','仍會偏向負面。','這又變成另一種失真。','成果有公共資訊價值。'],[10,11,12],'範文說成功社區項目可提醒公眾問題不是永久不變。'),
  transfer('編輯問：「既然危機最吸睛，是否應永遠只刊危機？」','哪項最符合範文的雙問結論？',[
    '承認危機有速報價值，要補足可核查的正面進展',
    '只因危機吸睛，就把所有正面進展永遠刪掉',
    '只刊好消息，讓讀者完全不知道任何危險',
    '只看點擊數，不問讀者會否得到完整資訊',
  ],['原文區分壞新聞占多的原因與應否平衡的規範判斷。','失去完整性。','失去速報作用。','新聞不只求點擊。'],[1,15,16],'範文一方面解釋急迫與商業原因，一方面主張平衡以免悲觀。'),
  transfer('城市公告板要說明一個區的火災風險與消防設備改善成果。','哪項報道最能讓居民知情而不過度悲觀？',[
    '交代火災風險與改善證據，讓居民理解兩面情況',
    '只寫最嚇人的火災例子，略過所有防災進展',
    '只誇設備有多好，完全隱瞞居民仍面對的風險',
    '只用快樂照片填版面，不提供任何可用的資訊',
  ],['風險與改善一起呈現，才能既知情又不被單一面向帶偏。','只報傷口。','只報癒合。','缺乏公共資訊。'],[13,14,16],'範文結論要求好壞並報，使公眾知情而不陷於不必要的悲觀。'),
];
const revised=[
  {options:['先核實並發布山火警報，後續再報道植樹成果。','先報植樹成果，山火警報待翌日節目再發布。','兩則消息同時播出，但警報放在節目結尾。','先發布山火消息，來源核查留待播出之後。'],explanations:['安全風險需及時、核實地告知，正面進展仍可後續報。','延至翌日可能錯過居民避險時機。','警報置後會削弱即時資訊的作用。','速報優先不等於放棄查證。']},
  {options:['迅速核實通知，讓學生知道停課及求醫安排。','先發布較輕鬆的校園新聞，再整理停課安排。','等病情數據穩定數日後，才告知求醫方式。','發布感染消息，但把停課及求醫措施留空。'],explanations:['安全與行動資訊具有即時公共價值。','娛樂性內容不能優先於題述緊急指引。','延遲指引可能阻礙學生採取適當措施。','只報風險而無應對資訊仍不完整。']},
  {options:['憤怒標題促進點擊分享，網站便偏重危機內容。','網站偏重危機內容，主要因爭吵影片製作較便宜。','憤怒標題能提升點擊，但與推薦排序並無關聯。','網站偏重危機內容，是讀者較少轉發這類影片。'],explanations:['情緒反應、互動數字與推薦誘因相連。','題述重點是轉發表現，不是製作成本。','推薦選擇正是受到互動誘因影響。','題目已說這類內容較易被轉發。']},
  {options:['同報感染事故與改善結果，讓讀者看見完整趨勢。','集中報感染事故，改善措施放到另一份內部文件。','集中報改善成果，感染事故僅用概括字眼帶過。','把兩類數據合成單一分數，略去變化過程。'],explanations:['問題與修復成果同時呈現，才可理解成效。','隱去改善使讀者難知措施是否有效。','弱化事故會使問題的嚴重程度不清楚。','單一分數會遮蔽事故與改善的先後關係。']},
  {options:['查治安趨勢及改善證據，避免只憑罪案貼文判斷。','依貼文數量推算犯罪率，再暫緩查閱官方數據。','停止分享改善報道，以免居民低估潛在風險。','用更詳盡的個案故事，代替整體治安趨勢。'],explanations:['個案密集出現不必然表示整體治安惡化。','貼文量受轉發習慣影響，不能代替犯罪率。','改善資訊與風險資料應一同核查。','更多個案仍不能說明整體變化。']},
  {options:['核實研究後報治療進展，說明對病人的實際幫助。','先宣傳治療突破，研究方法可留待日後補充。','把治療進展改成娛樂故事，避免涉及病人資料。','只報試驗風險，將已有改善結果列入附錄。'],explanations:['好新聞仍須可核查，且能說明實際作用。','正面結果同樣需要核對證據與適用範圍。','弱化資訊內容會失去公共知識價值。','把改善藏起來仍會造成片面觀感。']},
  {options:['列出違規與輔導後的改善證據，呈現全貌。','詳列違規數據，改善結果只交給教師討論。','詳列改善故事，違規原因留在保密附件。','把兩類數據合成評語，不展示前後差別。'],explanations:['報告要讓家長同時看見問題和改善。','只報違規會遺漏輔導是否奏效。','只報成果會淡化需要處理的問題。','模糊評語不利於判斷變化。']},
  {options:['加入可核查的社區成果，說明哪些問題已改善。','維持悲觀標題，把成果放到較難找到的附錄。','改說各區已恢復正常，省略仍待處理的問題。','把社區成果寫成趣聞，不交代改善的規模。'],explanations:['可核查的成果可修正單一負面敘事。','成果不易看見時，原有印象仍可能失真。','全盤樂觀同樣遮蔽尚存的問題。','趣聞形式不能代替效果證據。']},
  {options:['承認危機有速報價值，也補足可核查的正面進展。','因危機點擊較多，把改善成果改到較後日期再報。','因讀者需要希望，先報好消息而暫停危機速報。','以互動數據決定版面，較少評估資訊是否完整。'],explanations:['速報需求與完整呈現社會進展可以並存。','固定延後成果會延續片面的危機印象。','壓後危機可能妨礙即時安全判斷。','點擊表現不能獨自決定公共資訊價值。']},
  {options:['報火災風險及設備改善證據，讓居民看見兩面。','詳述火災個案，設備改善只留在行政報表。','強調新設備成效，將仍存風險放入附錄。','用居民感想代替風險數據與設備成效。'],explanations:['風險與改善都應被具體呈現。','隱去改善會使現況顯得比實際更悲觀。','弱化風險會使居民難以作好準備。','感想不能代替可用的風險與成效資訊。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:33',meta:{topic:'壞新聞偏多與好壞消息平衡',summary:'危險速報及情緒點擊令壞新聞占多；好消息可呈現改善並讓公眾看見全貌。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
