// Reviewed Opinion 90: safe regulation and continued access to combat sports.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-90-ielts-opinion.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['opinion:90'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'Some people think sports where people fight, like boxing and martial arts, should not be on TV or in world sports events because the athletes hit each other.',
 'I do not agree with this at all.',
 'These sports need careful rules, but a full ban would go too far and miss what these sports are and why they matter to people.',
 'My first reason is that sports with rules are different from fights with no control.',
 'In a fight on the street, there are no agreed rules, health checks or clear limits.',
 'In comparison, sports such as boxing, judo, karate and taekwondo have agreed rules, trained judges, safety steps and fair matches.',
 'These rules make the use of force part of a controlled sports contest.',
 'When people watch a match with proper checks, they see more than people hurting each other; they also see athletes face fear, follow rules and accept winning or losing calmly.',
 'For example, when a young viewer sees a judge end a match to protect one athlete, the viewer may learn that power must have limits.',
 'Taking these sports off TV would not remove people’s wish to fight; it might only lead viewers to other shows with fewer rules.',
 'Banning these sports from world events would also treat athletes unfairly and hurt sport as a whole.',
 'Many of these sports need years of hard work, skill practice and control over thoughts and feelings.',
 'For athletes who have had fewer chances in life, these events can bring money, pride in their country and respect for themselves.',
 'Also, martial arts are often part of cultural traditions that value respect, patience and the ability to control oneself.',
 'If these sports could not enter world events, we would treat hard-working athletes as if they were lawbreakers instead of people with real skills.',
 'The better answer is to make safety rules, age advice and TV coverage better, rather than remove the sports completely.',
 'To sum up, I strongly disagree that sports where people fight should be removed from TV or world events.',
 'With good rules, these sports can teach self-control, give people chances and build respect for cultures better than a complete ban could.',
];
const vocabulary=[
 [['combat sports','sports where people fight','搏擊運動'],['boxing and martial arts','boxing and martial arts','拳擊與武術'],['removed from television','not be on TV','從電視移除'],['international sporting events','world sports events','國際體育賽事'],['physical aggression','athletes hit each other','肢體攻擊']],
 [['completely disagree','do not agree with this at all','完全不同意'],['this view','this','這個觀點']],
 [['regulated carefully','careful rules','謹慎規管'],['banning them','a full ban','全面禁止'],['excessive response','go too far','過度反應'],['social value','why they matter to people','社會價值']],
 [['first reason','first reason','第一個原因'],['organised combat sports','sports with rules','有組織的搏擊運動'],['uncontrolled violence','fights with no control','失控暴力']],
 [['street fight','fight on the street','街頭打鬥'],['medical checks','health checks','醫療檢查'],['clear limits','clear limits','清晰限制']],
 [['By contrast','In comparison','相比之下'],['professional boxing','boxing','職業拳擊'],['trained referees','trained judges','受訓裁判'],['protective procedures','safety steps','保護程序'],['fair contests','fair matches','公平競賽']],
 [['This structure','These rules','這套制度'],['physical force','the use of force','身體力量'],['disciplined competition','controlled sports contest','有紀律的競技']],
 [['audiences','people','觀眾'],['properly supervised match','match with proper checks','受到妥善監督的比賽'],['not simply seeing','see more than','看到的不只是'],['respect boundaries','follow rules','尊重界線'],['with restraint','calmly','以克制的態度']],
 [['For example','For example','例如'],['young viewer','young viewer','年輕觀眾'],['a referee stop a fight','a judge end a match','裁判中止比賽'],['at risk','to protect','有危險'],['strength','power','力量']],
 [['Removing these sports from television','Taking these sports off TV','從電視移除搏擊運動'],['aggression from society','people’s wish to fight','社會中的攻擊性'],['push interest towards','lead viewers to','把興趣推向'],['less regulated entertainment','other shows with fewer rules','較少受到規管的娛樂']],
 [['international competition','world events','國際比賽'],['unfair to athletes','treat athletes unfairly','對運動員不公平'],['damaging to sport as a whole','hurt sport as a whole','損害整個體育界']],
 [['combat sports','these sports','搏擊運動'],['years of sacrifice','years of hard work','多年付出'],['technical training','skill practice','技術訓練'],['mental discipline','control over thoughts and feelings','心理自律']],
 [['competitors','athletes','參賽者'],['less privileged backgrounds','have had fewer chances in life','較缺乏資源的背景'],['income','money','收入'],['national pride','pride in their country','國家榮譽感'],['personal dignity','respect for themselves','個人尊嚴']],
 [['Moreover','Also','此外'],['martial arts','martial arts','武術'],['tied to cultural traditions','part of cultural traditions','與文化傳統相連'],['self-control','ability to control oneself','自我控制'],['central values','value','核心價值']],
 [['excluded from global tournaments','could not enter world events','被排除在國際賽事外'],['committed athletes','hard-working athletes','投入訓練的運動員'],['criminals','lawbreakers','罪犯'],['skilled professionals','people with real skills','技術純熟的專業人士']],
 [['better solution','better answer','更好的解法'],['safety standards','safety rules','安全標準'],['age guidance','age advice','年齡指引'],['responsible broadcasting','TV coverage better','負責任的播放安排'],['erase the sports altogether','remove the sports completely','徹底取消運動']],
 [['In conclusion','To sum up','總結來說'],['strongly disagree','strongly disagree','強烈不同意'],['combat sports','sports where people fight','搏擊運動'],['international competitions','world events','國際比賽']],
 [['proper regulation','good rules','適當規管'],['promote discipline','teach self-control','培養自律'],['opportunity','give people chances','創造機會'],['cultural respect','respect for cultures','尊重文化'],['blanket ban','complete ban','一刀切禁令']],
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
 frame(0,['Some people believe that ', ' because '],['需要回應的禁令主張','支持禁令的理由'],'Some people believe that 中立提出對方主張；because 補上其理據。','引言要公平交代待回應的主張及對方給出的理由時。','Some people believe that films should be banned because they show crime.','Some people believe that...because','交代主張及理由'),
 frame(1,['I completely disagree with '],['明確反對的觀點'],'completely disagree 明確標示反對程度，不讓立場留到結尾才出現。','題目問同意程度，而作者確實全盤反對所引述主張時。','I completely disagree with this proposed ban.','I completely disagree','表明完全反對'),
 frame(2,['Although ', ', banning them would '],['需要承認的規管需要','全面禁止帶來的過度後果'],'Although 承認安全規管的合理性，主句仍反對全面禁令。','一項活動有真實風險，但風險不足以支持一刀切禁止時。','Although games need age limits, banning them would be excessive.','Although...banning would','承認風險並反對過度措施'),
 frame(3,[' is that '],['第一個反對禁令的理由','有規則的運動與失控暴力不同的判斷'],'is that 在段首提出能由規則與安全程序支持的核心區分。','要先清楚界定兩種容易被混淆的活動時。','The first reason is that regulated racing differs from reckless driving.','is that','提出可論證的關鍵區分'),
 frame(4,['In a street fight, '],['無規則打鬥的特點'],'In a street fight 先給出對照組，為有規則的競賽鋪墊。','要透過一個缺乏規則的例子，襯托另一活動的安全安排時。','In a street fight, no official can stop dangerous conduct.','In a street fight','建立無規則對照'),
 frame(5,['By contrast, ', ' are built around '],['有規則競賽的例子','規則裁判與安全程序'],'By contrast 把受規管活動與上一句無規則打鬥對照。','已介紹一種失控情況，現在要列出受監督情況中的具體保障時。','By contrast, organised races are built around safety rules and trained officials.','By contrast...built around','對照具體制度保障'),
 frame(6,[' turns ', ' into '],['制度設計','原本可能令人擔憂的力量','可受規則約束的競技'],'turns...into 說明規則如何改變相同行為的性質。','要解釋一套制度如何把有風險的行為轉化為可控制的活動時。','A clear rulebook turns physical effort into fair competition.','turns...into','說明制度如何轉化行為'),
 frame(7,['When ', ', they are not simply ', '; they are '],['觀眾觀看受監督比賽的條件','表面可能看到的傷害','更深層看到的自律與尊重'],'not simply...; they are 對比表面印象與更完整的觀察。','某活動容易被表面畫面誤解，需要指出同時可觀察到的積極技能時。','When people watch a safe race, they are not simply seeing speed; they are seeing control.','not simply...they are','由表面畫面指出更深能力'),
 frame(8,['For example, ', ' can learn that '],['作為例子的年輕觀眾及所見情況','從情況學到的規則觀念'],'For example 用裁判中止比賽的事件，支撐規則限制力量的主張。','提出教育意義後，要用可觀察的小事件展示學習如何發生時。','For example, a child who sees a referee stop play can learn that rules protect people.','For example...can learn','用具體事件說明學習結果'),
 frame(9,[' would not ', '; it may simply '],['禁止電視播放的措施','無法達到的社會效果','可能出現的轉移效果'],'would not...; it may simply 區分禁令想達成的結果與可能的替代後果。','要質疑某禁令能否消除問題，並指出需求可能轉往較不受管制的地方時。','Removing ads would not end demand; it may simply move it online.','would not...may simply','分析禁令的替代後果'),
 frame(10,[' would also be ', ' and '],['禁止國際競賽的措施','對選手不公平的結果','對整體體育的損害'],'also 加入第二個反對理由；and 並列個人及制度後果。','第一個理由已談活動性質，現在要談禁令如何影響參與者及整個領域時。','A ban would also be unfair to players and damaging to sport.','would also be...and','加入禁令的雙重損害'),
 frame(11,[' require '],['需要長期投入的運動','長年訓練與自律'],'require 用選手的投入，證明這些活動具備專業技能而非任意暴力。','要用時間、訓練及紀律說明一項活動的專業性時。','Competitive dance can require years of training and discipline.','require','指出專業活動所需投入'),
 frame(12,['For ', ', these events can '],['特別受惠的參賽群體','賽事可能提供的收入與尊嚴'],'For 限定受惠者；can 說明可能的機會而非對每人的保證。','要說明一項活動如何幫助特定群體，同時保留效果因人而異時。','For young athletes with few resources, these events can offer income and pride.','For...can','限定受惠群體及可能收益'),
 frame(13,['Moreover, ', ' in which '],['文化傳統與活動的連結','傳統重視的品格價值'],'Moreover 增加文化面向；in which 說明傳統實際重視的價值。','已談經濟或職涯機會，還要補充活動承載的文化或品格意義時。','Moreover, many crafts belong to traditions in which patience is highly valued.','Moreover...in which','補充文化價值'),
 frame(14,['If ', ', society would be treating ', ' as if ', ' rather than '],['活動被排除的假設條件','受影響的投入者','社會誤當他們是甚麼','實際應視為的專業人士'],'If 設定禁令；as if...rather than 指出禁令傳達的不公平評價。','要指出一項禁令除實際損失外，還會錯誤污名化有技能的參與者時。','If skilled workers were excluded, society would be treating them as if they were offenders rather than professionals.','If...as if...rather than','指出禁令帶來的污名'),
 frame(15,[' is to ', ', not to '],['更合比例的解決方向','應改善的安全與播放安排','應避免的全面取消'],'is to...not to 把可行規管與過度禁止直接對比。','已承認有風險，要提出具體改進，同時表明不應採用全面禁止時。','A better solution is to improve safety checks, not to stop the activity.','is to...not to','提出較合比例的解法'),
 frame(16,['In conclusion, ', ' should be banned from '],['作者明確反對禁令的對象','禁令涉及的兩個場域'],'In conclusion 回收立場；should be banned from 明確指向題目所問的禁止範圍。','結尾要準確重申對題目所述禁令的同意程度及適用範圍時。','In conclusion, I disagree that chess should be banned from schools.','In conclusion...banned from','準確重申禁令立場'),
 frame(17,['With ', ', ', ' can ', ' far more effectively than '],['適當規管條件','有條件運作的活動','規管後可帶來的多種收益','全面禁令的效果'],'With 指收益成立的條件；far more effectively than 比較規管與禁令。','結尾要提出附帶條件的替代方案，並比較它與全面禁止的效果時。','With clear rules, events can teach discipline far more effectively than a total ban.','With...far more effectively than','以規管對比全面禁止'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+7)%specs.length,(i+12)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+target.tag+'」'+target.job+'。'),answerReason:'示例用「'+target.tag+'」'+target.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的立場、理由及替代方案順序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('範文對禁止搏擊運動上電視及參加國際賽事持甚麼立場？',['完全反對全面禁令，但支持審慎規管','完全支持取消所有搏擊運動','只主張取消醫療檢查','認為運動是否安全毫不重要'],'作者在引言明確表示完全反對禁令，同時承認規管需要。'),
 quiz('範文用哪兩條主線支持立場？',['有規則的比賽不同於失控暴力；禁令亦損害運動員及文化價值','所有搏擊運動都沒有任何身體風險','只要電視播放，比賽就不需要裁判','只有國際賽事才需要安全規則'],'兩段主體分別分析運動性質及禁令對選手和體育的影響。'),
];
const route=[sequence('由區分暴力到提出較合比例的規管',[
 ['引言：完全反對全面禁止','承認需仔細規管，但禁令過度。'],
 ['理由一：有規則的競賽','裁判、安全程序和公平規則使搏擊競賽不同於街頭打鬥。'],
 ['教育作用與替代風險','觀眾能看到克制；移除播放可能把興趣推向較少規管的內容。'],
 ['理由二：選手與文化價值','訓練、機會和文化傳統會受國際賽事禁令損害。'],
 ['結尾：改善而非取消','提升安全、年齡指引與播放責任，保留有條件的參與。'],
],'文章把可管理的風險與全面禁止分開，最後提出具體替代措施。')];
const evidence=[
 quiz('街頭打鬥與正式搏擊比賽的關鍵差別是甚麼？',['正式比賽有規則、裁判、安全程序及公平競賽安排','正式比賽完全沒有身體接觸','街頭打鬥必然有醫療檢查','兩者在制度安排上完全相同'],'範文先列街頭打鬥缺少的保障，再對照正式運動的保障。'),
 quiz('裁判在選手有危險時中止比賽，如何支持文章論點？',['這示範力量必須受規則約束，觀眾可看到安全界線','這證明裁判不應有任何權力','這代表所有選手都不需要訓練','這說明正式比賽與街頭打鬥無異'],'範文的例子把可觀察的裁判行動連到尊重界線。'),
 quiz('作者為何質疑單純從電視移除搏擊運動？',['這未必消除攻擊性，興趣可能轉向較少受規管的娛樂','電視內容與觀眾行為一定毫無關係','所有替代內容一定更安全','只要下架，社會便永遠不會有打鬥'],'原文區分禁令意圖與可能的替代後果，並用 may 保留不確定性。'),
 quiz('國際賽事禁令對運動員可能有甚麼不公平之處？',['忽略長年訓練及自律，也剝奪較缺資源選手的收入與尊嚴機會','所有選手都未曾接受技術訓練','國際賽事對任何人都沒有意義','禁令只會改變運動員的服裝顏色'],'範文從選手的投入和較弱勢參賽者可能得到的機會兩方面分析。'),
 quiz('武術的文化論點具體指甚麼？',['部分武術傳統重視尊重、耐性及自我控制','武術只是一種沒有任何傳統的動作','所有文化傳統都拒絕運動競賽','文化價值可以完全取代安全檢查'],'原文說 many martial arts are often tied to cultural traditions，不把文化價值當作免除規管的理由。'),
 quiz('比起全面禁令，作者提出哪三類改善？',['安全標準、年齡指引及負責任的電視播放安排','取消裁判、醫療檢查和年齡分級','只換運動場的外觀而不改安全','只允許無規則的比賽在電視播放'],'結尾前一句列出可操作的三項替代措施。'),
];
const logic=[
 sequence('受規管搏擊運動如何與失控暴力區分',[
 ['失控打鬥缺乏界線','街頭打鬥沒有約定規則、醫療檢查或裁判。'],
 ['正式賽事設立安全制度','規則、裁判和保護程序使競爭受到約束。'],
 ['選手展示克制與尊重','觀眾也可看到接受勝負及守住界線。'],
 ['全面下架可能有替代後果','觀眾興趣未必消失，可能轉往較少受管制的娛樂。'],
 ],'作者的區分建基於具體制度和可見行為，而非宣稱比賽完全沒有風險。'),
 sequence('為何規管比國際賽事禁令更合理',[
 ['選手長期訓練','搏擊運動需要技術、自律和付出。'],
 ['賽事提供實際機會','部分選手可得到收入、榮譽和個人尊嚴。'],
 ['文化傳統承載價值','某些武術重視耐性、尊重和自我控制。'],
 ['改善安全並保留參與','以標準、指引及播放責任回應風險。'],
 ],'文章先說明禁令的代價，再提出能直接處理安全風險的措施。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('某校因為一次無規則打鬥，提議取消所有有裁判及護具的校內武術活動。','哪項回應最能轉用範文？',['比較無規則打鬥與正式活動的裁判、規則和安全程序','以一次無規則打鬥推定所有正式比賽都同樣失控','認為只要選手穿好護具，便不再需要裁判與明確規則','把街頭打鬥的無規則做法視為校內活動的安全標準'],['原文的第一步是區分不同活動的制度保障。','把兩種不同情況混為一談。','忽略監督和規則仍有作用。','與安全分析相反。'],[3,4,5,6],'原文用街頭打鬥與正式運動對照，而非只憑肢體接觸下判斷。'),
 transfer('某電視台播放有裁判的格鬥賽，鏡頭清楚展示裁判在選手受傷時即時停止比賽。','哪項教育作用最符合文章？',['觀眾可能看到選手受傷時裁判會停賽，力量必須受規則約束','觀眾會以為裁判停賽只是表演，規則不影響選手的安全','裁判停賽反而證明街頭打鬥也有同樣清晰的安全界線','一次停賽足以保證所有觀眾都會建立穩定自律的行為'],['範文用裁判停止比賽說明可觀察的安全界線。','與裁判行動所示相反。','沒有因果根據。','把可能學到誇大為每人必然學到。'],[7,8],'原文的年輕觀眾例子把停賽與規則約束力量連起來。'),
 transfer('城市禁止在合法場地舉行滑板賽，卻沒有提供其他安全場地；年輕人轉到無人管理的街道練習。','文章哪條推理可轉用？',['禁止合法場地可能把滑板活動推向更少監督的街道','取消合法場地必然使所有年輕人從此完全停止滑板','街道和合法場地的監督程度相同，因此安全風險不會改變','只要取消正式賽事，街頭練習的受傷風險便會全部消失'],['原文指出移除可見活動不一定消除需求，可能出現替代效果。','忽略情境中已出現的轉移。','未比較監督程度。','把可能結果說成保證。'],[9,15],'原文分析全面移除播放可能把興趣推向較少規管的娛樂。'),
 transfer('有人把有裁判的柔道比賽說成「和路邊打架完全一樣」。','哪項證據最能檢驗這個說法？',['比較兩者有沒有規則、裁判、醫療安排和停賽界線','只比較選手的衣服顏色和外觀，再推斷活動是否受規管','只看兩者是否都曾在電視播放，而不檢查比賽安排','只問觀眾是否喜歡運動員，再判斷有沒有安全制度'],['文章的區分建立在可檢查的制度差異上。','衣服顏色不能說明監督。','播放平台不是安全規則。','喜好不等於制度證據。'],[4,5,8],'原文列出街頭打鬥所缺少的保障，並描述正式比賽的規則。'),
 transfer('一位出身資源較少家庭的跆拳道選手，靠國際賽事獎金支付訓練費，並為代表國家感到自豪。','哪項禁令代價應納入評估？',['禁令可能奪去收入、國家榮譽感與個人尊嚴的機會','只要賽事提供獎金，就可以免除裁判和全部安全規則','選手的家庭資源多寡不會影響國際賽事提供的機會','這個個案能證明所有選手的收入和發展道路必定相同'],['範文特別提及較缺資源選手得到的實際機會。','把機會分析錯當免除安全責任。','忽略情境和原文。','從個案錯推普遍結論。'],[10,11,12],'原文把國際賽事的機會和較弱勢參賽者連在一起。'),
 transfer('學校考慮移除武術課，理由是課程沒有文化或品格價值；但課程明確教授尊重、耐性和自我控制。','應如何評估？',['承認課程可能有文化和品格價值，同時檢查教學與安全標準','只要課程有文化背景，任何危險訓練都不必受安全要求約束','只用賽事獎牌的數量判斷文化價值，忽略尊重和自律','假設所有武術課都必然帶來同樣的品格成效與安全水平'],['文章把文化價值納入考量，也保留安全規管。','把文化價值誤當風險豁免。','忽略尊重與自律。','將部分情況說成全部。'],[13,15],'原文指出武術常連結傳統價值，並主張加強安全安排。'),
 transfer('另一篇文章討論是否全面禁止學校的接觸性運動。作者已承認碰撞風險，但沒有提出替代方案。','哪項論證方式最可轉用？',['提出護具、裁判和年齡指引，再比較規管與全面禁令','反覆說「有風險」，卻不檢查現有規則或替代措施','宣稱所有運動只要有裁判就絕對不會有人受傷','只討論選手的經濟收入，完全避開已知安全風險'],['範文承認風險，再提出具體而較合比例的規管。','沒有回答如何處理風險。','過度斷言。','未補足已知論證缺口。'],[2,5,15,17],'原文以安全規管作為全面禁止的替代方案。'),
 transfer('有人主張把國際柔道賽選手排除出國家代表隊，因為「所有肢體對抗都是犯罪」。','文章指出甚麼推論問題？',['這把守規則的選手錯當罪犯，混淆正式競賽與違法暴力','這能證明柔道比賽的裁判與訓練制度都完全不存在','所有需要肢體接觸的活動都沒有文化背景或專業技能','選手只要參加比賽就不必再遵守任何公平和安全規則'],['原文以 as if...rather than 指出禁令會錯誤污名化選手。','沒有提供裁判證據。','無法由題目推出。','仍需守規則。'],[3,5,14],'原文反對把投入訓練的運動員視為罪犯。'),
 transfer('電視台保留搏擊節目，卻在兒童容易收看的時段播放受傷特寫，也沒有年齡提示。','依範文，較合比例的修改是甚麼？',['加強年齡指引與負責任的播放安排，並檢查比賽安全標準','只因一次播放方式不當便永久取消所有相關體育競賽','不論觀眾年齡和播放時段，一律取消任何年齡提示','只更換節目名稱與畫面顏色，維持原有播放安排'],['原文將 age guidance 和 responsible broadcasting 納入替代解法。','措施範圍超過已指出的問題。','忽略兒童觀眾的情境。','沒有改變播放風險。'],[15],'原文提出改善年齡指引與播放責任，而非整體抹去運動。'),
 transfer('某國際賽事的醫療檢查與裁判訓練不足。主管認為只有兩個選擇：維持現狀或全面禁止。','哪項第三條路最貼近文章？',['改善醫療與裁判標準，暫緩不合格賽事並重新評估','忽略檢查不足的事實，直接宣布現有安全制度已經完美','取消年齡指引與醫療檢查，以減少管理賽事所需的工作','把所有需要身體活動的項目一律禁止，不區分其風險'],['範文支持具體改善安全標準，並不要求容忍不合格賽事。','與情境的安全缺口矛盾。','會削弱而非改善安全。','禁令範圍遠超問題本身。'],[5,8,15],'原文承認必須仔細規管，並列安全改善而非一刀切禁止。'),
 transfer('一篇評論承認搏擊運動有風險，卻說「既然有風險，肯定只能禁止」，沒有分析其他措施。','哪項修訂能令推理更完整？',['比較風險、現有規則與可改善的安全安排，才判斷禁令是否必要','反覆使用「有風險」一詞，就認為已充分證明全面禁令必要','只討論觀眾喜不喜歡明星選手，而不比較可用的安全規則','完全忽略已知受傷風險，並宣稱正式賽事永遠絕對安全'],['原文先區分制度，再評估規管是否比禁止合適。','重複主張不等於證成唯一解法。','喜好與安全判斷無直接關係。','與文章承認風險相反。'],[2,3,4,5,15],'原文以具體規管措施評估全面禁令是否過度。'),
 transfer('作者要在結尾回收「反對禁令」的立場，但也不想否認安全風險。','哪句最符合範文的結尾策略？',['在適當規管下保留活動，讓自律、機會及文化價值得以實現','只宣稱比賽永遠不會受傷，因此完全不需要任何安全安排','只重複反對禁令的立場，卻沒有說明應如何管理風險','突然轉而支持所有無規則打鬥，放棄原先談的正式賽事'],['原文用 With proper regulation 設定條件，再比較保留活動與全面禁令。','與承認風險的前提衝突。','沒有回收可行替代方案。','把正式運動與失控暴力混淆。'],[16,17],'原文的最後兩句同時重申立場及規管條件。'),
];
export default {key:'opinion:90',meta:{topic:'是否禁止搏擊運動在電視及國際賽事出現',summary:'正式搏擊競賽有規則和教育文化價值；應改進安全與播放標準，避免全面禁止。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
