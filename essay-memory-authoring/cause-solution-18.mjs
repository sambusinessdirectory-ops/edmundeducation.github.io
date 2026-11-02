// Reviewed Cause/Solution 18: work-life balance, structural pressure and boundaries.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-18-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:18'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'In many societies today, work no longer ends at the office and is taking time away from family, rest and learning about oneself.',
 'This is usually because workplaces expect too much and the line between work and home has become unclear.',
 'It can improve if employers build healthier work rules and people make an effort to protect their own time.',
 'One main reason is that many workers are expected to answer messages at any time.',
 'Emails, message apps and online meetings bring work home, so people may not feel free even after their workday ends.',
 'As a result, someone may be at home with family but still thinking about work.',
 'A second reason is pressure over money.',
 'When homes, childcare and daily needs cost a lot, people often take extra hours or more work even if this harms their health.',
 'After a while, this creates a loop: tired workers do less in each hour, need longer to finish tasks, and have even less personal time.',
 'The best answer is for employers to set clearer rules about work hours.',
 'For example, companies can reduce non-urgent after-hours messages, check for too much overtime and let staff choose more of their working times and places.',
 'These changes do more than make staff happier; they also help people return to work able to focus and make good decisions.',
 'At the same time, people need to manage their daily plans more firmly.',
 'They may set times for exercise, meals with family or sleep, and treat these plans as seriously as meetings for work.',
 'Without these limits, personal time is often the first thing people give up.',
 'To sum up, work and life become unbalanced mainly because people can always be contacted, job demands are high and money is tight.',
 'But healthier workplace rules and clearer personal limits can help people keep work from taking over the rest of life.',
];
const vocabulary=[
 [['modern societies','societies today','現代社會'],['expanded beyond the office','no longer ends at the office','延伸到辦公室之外'],['crowd out','taking time away from','擠走'],['personal growth','learning about oneself','個人成長']],
 [['unrealistic workplace expectations','workplaces expect too much','不切實際的職場期望'],['weakened boundaries','the line between work and home has become unclear','界線模糊'],['professional and private life','work and home','工作和私人生活']],
 [['reduced','improve','減輕'],['design healthier systems','build healthier work rules','設計健康制度'],['individuals','people','個人'],['protect their time deliberately','make an effort to protect their own time','有意保護時間']],
 [['major reason','main reason','主要原因'],['employees','workers','員工'],['constantly available','answer messages at any time','隨時可聯絡']],
 [['messaging apps','message apps','通訊程式'],['allow work to follow people home','bring work home','讓工作跟回家'],['working day','workday','工作日'],['no longer feels like a real end','may not feel free even after their workday ends','下班感覺不是真正結束']],
 [['a person','someone','一個人'],['physically with their family','at home with family','身體與家人同在'],['mentally still at their desk','still thinking about work','心仍在工作']],
 [['Another cause','A second reason','另一原因'],['financial pressure','pressure over money','財務壓力']],
 [['housing','homes','住屋'],['childcare','childcare','育兒'],['daily expenses','daily needs','日常開支'],['accept overtime','take extra hours','接受加班'],['heavier workloads','more work','更重工作量']],
 [['Over time','After a while','長遠而言'],['cycle','loop','循環'],['perform less efficiently','do less in each hour','效率下降'],['personal lives','personal time','私人生活']],
 [['most effective solution','best answer','最有效解方'],['employers','employers','僱主'],['set clearer limits on work','set clearer rules about work hours','工作界線']],
 [['For instance','For example','例如'],['discourage','reduce','不鼓勵'],['non-urgent messages','non-urgent after-hours messages','非緊急訊息'],['monitor excessive overtime','check for too much overtime','監察過度加班'],['more control','choose more','更多掌控權']],
 [['measures','changes','措施'],['sharper concentration','able to focus','較佳專注力'],['better judgement','make good decisions','更佳判斷力']],
 [['At the same time','At the same time','同時'],['individuals','people','個人'],['routines','daily plans','日常安排'],['more firmly','more firmly','更堅定']],
 [['fixed times','times','固定時間'],['family meals','meals with family','家庭用餐'],['commitments','plans','承諾'],['meetings with clients','meetings for work','客戶會議']],
 [['Without such boundaries','Without these limits','沒有這些界線'],['personal life','personal time','私人生活'],['the first thing to be sacrificed','the first thing people give up','最先被犧牲']],
 [['In conclusion','To sum up','總結'],['poor work-life balance','work and life become unbalanced','工作生活失衡'],['constant connectivity','people can always be contacted','時刻保持聯絡'],['high workplace demands','job demands are high','工作要求高'],['financial pressure','money is tight','財務壓力']],
 [['overcome','help','克服'],['organisations','workplace','機構'],['more humane working conditions','healthier workplace rules','人性化工作條件'],['draw a clearer line','clearer personal limits','劃清界線'],['the rest of their lives','the rest of life','生活其他部分']],
];
export {original,simple,vocabulary};
function frame(i,links,labels,meaning,usage,example,tag,job){
 const value=original[i],parts=[];let cursor=0,slot=0;
 for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed wording ${i+1}: ${link}`);
  if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
  parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
 if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
 if(slot!==labels.length)throw Error(`Unmatched slot labels ${i+1}`);
 return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
 frame(0,['In many modern societies, '],['工作延伸到辦公室外並擠壓家庭休息及成長'],'In many modern societies 限定社會範圍，主句再指出工作生活失衡的現象。','開頭要指出一項常見趨勢，同時避免說成所有地方都如此時。','In many modern societies, people work beyond normal office hours.','In many modern societies','限定趨勢的適用範圍'),
 frame(1,[' is usually caused by '],['工作生活失衡的問題','不切實際的職場期望與模糊的私人界線'],'usually caused by 指出常見成因，避免聲稱只可能有這兩項原因。','需要概括主要原因，同時保留其他情況可能不同時。','This pressure is usually caused by long hours and weak support.','usually caused by','提出常見而非唯一成因'),
 frame(2,[' if ', ' and '],['問題可減輕的主張','僱主設立較健康制度的條件','個人主動保護時間的配合'],'if 設定解方成立的條件；and 表明機構與個人需並行。','要提出一項改善有賴兩個行動者共同採取措施時。','The risk can be reduced if schools change rules and families set limits.','if...and','提出兩方配合的條件'),
 frame(3,[' is that '],['其中一項主要原因','員工被要求隨時回應工作的情況'],'is that 在段首直接指出可進一步解釋的核心原因。','主體段要以完整判斷直接提出第一項原因時。','One major reason is that staff are expected to reply at night.','is that','直接提出主要原因'),
 frame(4,[', so '],['訊息工具令工作延伸至家中','工作日結束仍感覺未真正下班'],'so 把技術帶來的持續聯絡連到下班界線變弱的結果。','描述一個機制後，要緊接說明它如何造成結果時。','Messages keep arriving after dinner, so the day never feels finished.','so','由機制推到結果'),
 frame(5,['As a result, '],['人在家中但心思仍留在工作的後果'],'As a result 承接前句的聯絡壓力，說明可觀察的生活影響。','前句已分析原因，接着要呈現其具體影響時。','As a result, a parent may be present but unable to focus on family.','As a result','接出具體生活後果'),
 frame(6,[' is '],['另一項原因','經濟壓力'],'Another cause is 清楚切換到不同的第二原因。','第一項原因已說明，需要用簡潔句子轉到另一因素時。','Another cause is the high cost of housing.','Another cause is','切換至第二項原因'),
 frame(7,['When ', ', people often ', ', even when '],['住屋育兒和日常開支高的條件','人們接受加班副業或更重工作量','選擇可能損害健康的讓步'],'When 指出財務條件；even when 承認工作選擇可能有健康代價。','要解釋人們為何在明知有代價時仍作某項選擇時。','When rent is high, people often take extra shifts, even when they feel ill.','When...even when','連接壓力選擇與代價'),
 frame(8,['Over time, ', ' in which '],['疲憊與低效率形成的循環','工作變慢私生活更少的連鎖過程'],'Over time 指長期累積；in which 展開循環內的每個環節。','要說明問題如何隨時間自我加強，而非只發生一次時。','Over time, this becomes a cycle in which stress lowers sleep and poor sleep raises stress.','Over time...in which','展開自我加強的循環'),
 frame(9,[' is for ', ' to '],['最有效的解決方向','應負責執行的僱主','設立更清晰工作界線的行動'],'is for...to 同時指明責任方及其應做的具體事。','提出解方時，需要說清楚由誰採取甚麼行動時。','The best answer is for employers to set clear work hours.','is for...to','指定行動者及其任務'),
 frame(10,['For instance, ', ' can '],['作為例子的公司','減少非緊急訊息監察加班並增加安排彈性的措施'],'For instance 把「設界線」落到三項可執行的制度安排。','抽象措施已提出，還需要用具體機構行動展示如何實行時。','For instance, schools can limit late messages and set quiet hours.','For instance...can','把抽象解方變為可執行行動'),
 frame(11,[' do not simply ', '; they also '],['更健康的制度','員工感受改善','專注與判斷力改善'],'not simply...also 顯示同一措施有情緒及工作表現兩層收益。','要糾正「只有一種好處」的看法，並補充另一項重要作用時。','The changes do not simply save time; they also improve decisions.','not simply...also','說明同一措施的雙重收益'),
 frame(12,['At the same time, '],['個人亦要更堅定管理日程'],'At the same time 從機構措施轉到同時需要的個人行動。','已說明一方責任，還要補充另一方同時應採取的行動時。','At the same time, workers need to protect their own rest.','At the same time','加入另一方同步責任'),
 frame(13,['This may mean ', ', and treating '],['為運動家庭用餐及睡眠設定固定時間','像工作會議一樣重視私人安排'],'This may mean 把原則化成實例；and treating 指出如何看待這些安排。','提出抽象原則後，需要列出實際行動和相應態度時。','This may mean setting a bedtime, and treating it as seriously as work.','This may mean...and treating','把原則展開為行動及態度'),
 frame(14,['Without ', ', '],['缺少私人生活界線的條件','私人時間最先被犧牲的後果'],'Without 以缺乏保護條件的情況，說明可能出現的損失。','要指出一項必要界線缺席時，甚麼最容易受損時。','Without clear rules, rest may be the first thing lost.','Without','指出缺乏界線的後果'),
 frame(15,['In conclusion, ', ' is mainly the result of '],['工作生活失衡','持續聯絡工作要求及財務壓力三類成因'],'mainly the result of 把前文原因收成同一個結論，同時保留主要而非唯一。','結尾要概括多項主因，但不把它們說成所有情況的唯一解釋時。','In conclusion, stress is mainly the result of long hours and weak support.','mainly the result of','歸納主要成因'),
 frame(16,['However, ', ' when ', ' and '],['問題可克服的判斷','機構提供較人性化的工作條件','個人劃清工作與生活界線'],'when 指改善發生的條件；and 把機構與個人兩方措施並列。','結尾要指出兩類措施需共同成立，才能合理推論改善時。','However, the problem can ease when managers set limits and workers protect rest.','when...and','以兩方條件收束解方'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的成因和兩方措施次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('文章把工作與生活失衡主要歸因於甚麼？',['職場要求過高及界線模糊，並受財務壓力推動','所有員工都討厭家人','只有員工在辦公室喝水太少','每家公司都完全沒有薪金'],'文章先談隨時回應工作的期望，再談高生活成本令加班難避免。'),
 quiz('文章提出哪兩方應共同採取措施？',['僱主設定健康制度，個人主動保護私人時間','只靠員工單方面承受所有壓力','只要求家庭成員不吃晚餐','完全停用所有通訊工具，包括緊急訊息'],'解方同時包含機構安排和個人日程界線。'),
];
const route=[sequence('由失衡成因到僱主與個人界線',[
 ['引言：工作擠走私人生活','預告職場要求、界線及財務壓力，並指出雙方要行動。'],
 ['原因一：隨時可聯絡','訊息使工作跟回家，身在家中也可能心繫工作。'],
 ['原因二：經濟壓力','高生活成本促使加班；疲憊又使工作更慢。'],
 ['解法與結尾：雙方配合','僱主設工時和訊息界線，個人把休息家庭安排當成承諾。'],
],'先分清制度期望與經濟壓力，再把機構和個人措施對應起來。')];
const evidence=[
 quiz('通訊科技如何令下班界線變弱？',['郵件訊息及網上會議讓工作跟回家，員工下班仍可能需要回應','科技令所有工作訊息必然只在上班時送達','只要有手機，員工就必然不再工作','問題只由辦公室家具造成'],'原文從持續聯絡推到下班仍不能真正放下工作。'),
 quiz('高生活成本為何使個人時間更少？',['住屋育兒和日常開支高時，人們可能接受加班副業或較重工作量','生活費越高，人們就必然有更多閒暇','所有人都可以完全拒絕收入需要','健康影響與工時完全無關'],'範文用 even when 承認選擇雖有健康代價，仍可能發生。'),
 quiz('疲憊如何形成自我加強的循環？',['疲憊令效率下降，完成任務更慢，私人生活因此再被擠走','疲憊必然令所有人工作速度增加','個人時間越少，工作時間一定自動減半','文章沒有提及效率'],'原文指出疲勞、較慢工作、較少私人時間會互相延續。'),
 quiz('僱主可採取哪些具體制度措施？',['減少非緊急下班後訊息、監察過度加班並增加時間地點彈性','只鼓勵所有員工午夜回覆所有訊息','只購買新辦公室椅子，不看工時','取消所有休息但仍稱為健康制度'],'原文給出三項可實行的僱主措施。'),
 quiz('這些僱主措施除了改善心情，還有甚麼作用？',['有助員工更專注並作出較好的判斷','必然令所有員工永遠不用工作','只改善辦公室外觀','使判斷力和專注力一定變差'],'原文的 not simply...also 加上工作表現層面的收益。'),
 quiz('個人如何具體保護私人時間？',['固定運動、家庭用餐及睡眠時間，並認真遵守','只在沒有工作時才容許自己吃飯','把每個家庭安排視為可以隨意取消','因為僱主有規則，個人便不需任何界線'],'文章提出把私人安排當成與工作會議同樣重要的承諾。'),
];
const logic=[
 sequence('持續聯絡與疲憊如何累積',[
  ['工作訊息延伸到家中','下班後仍感覺工作未真正結束。'],
  ['個人在家仍心繫任務','家庭及休息時間受到擠壓。'],
  ['生活費壓力增加工時','有人接受加班或更重工作量。'],
  ['疲勞降低效率','工作拖長，再失去更多私人時間。'],
 ],'文章有兩項互相關聯的成因：職場界線和經濟壓力。'),
 sequence('僱主與個人如何共同減害',[
  ['僱主限制非緊急訊息','下班後不用隨時回覆。'],
  ['監察過度加班並給彈性','工時與工作地點較能配合生活。'],
  ['個人安排固定休息家庭時間','運動、家庭餐及睡眠得到保護。'],
  ['雙方措施並行','工作較難侵佔整個私人生活。'],
 ],'個人界線不能替代制度改進，制度也需要員工實際保護時間。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('公司要求員工晚上及週末即時回覆一般訊息，員工與家人吃飯時也查看工作。','哪項因果解釋最貼近範文？',['持續可聯絡的期望令工作越過下班界線，私人時間難以真正休息','只要在家吃飯便不可能想到工作','訊息越多，私人時間就一定越長','工作與家庭之間的界線只由辦公室牆壁決定'],['原文從下班後訊息推到人雖在家、心仍在工作。','與情境中的回覆要求相反。','沒有因果根據。','忽略通訊科技帶來的界線模糊。'],[3,4,5],'原文以訊息工具解釋工作如何跟人回家。'),
 transfer('一名員工因房租和托兒費上升而加班，雖然知道睡眠不足令自己更疲倦。','文章會如何解釋這個選擇？',['高生活成本可能迫使人接受較重工作量，即使它損害健康','員工一定因為喜歡疲倦才加班','托兒與房租成本不可能影響工時','只要睡眠少，任務必然更快完成'],['範文用 When...even when 表達壓力與已知代價。','錯把外部壓力當個人偏好。','忽略已知財務條件。','與疲憊降低效率的分析相反。'],[6,7,8],'原文把住屋育兒等開支連到加班和健康代價。'),
 transfer('項目主管見到員工越忙越慢，於是要求他們再加班，以彌補變慢的速度。','範文提示甚麼風險？',['疲勞可能令效率更差，任務拖長，形成失去更多私人時間的循環','增加工時必然立即消除疲勞','工作越慢一定是員工沒有手機','私人時間越少，所有人便必然更專注'],['原文的循環是疲憊、效率下降、時間更少。','忽略身心疲勞。','與已觀察的效率問題無關。','把不確定的效果說成保證。'],[7,8],'原文說疲勞可降低效率，令工作耗時更長。'),
 transfer('一間公司希望設立下班後聯絡規則，卻擔心緊急情況需要即時處理。','哪項做法較符合範文？',['限制非緊急訊息，同時保留真正緊急事項的處理途徑','連緊急訊息都必須與一般宣傳訊息一樣處理','要求所有訊息都在午夜即時答覆','只更換訊息程式顏色而不訂規則'],['原文特別限定 non-urgent messages，並未禁絕緊急聯絡。','忽略問題中的緊急例外。','與清晰界線的目標相反。','沒有改變聯絡期望。'],[9,10],'原文提出減少下班後的非緊急訊息。'),
 transfer('公司聲稱限制加班只會讓員工開心，對工作沒有其他作用。','哪項補充最有文本根據？',['休息較足也可能令員工回到工作時更能集中精神並作出較好判斷','休息令所有判斷必然變差','加班與專注力永遠無關','只要員工開心便完全不必做任何工作'],['原文用 not simply...also 加上專注與判斷的作用。','與原文方向相反。','忽略疲憊和效率的關聯。','誇大了改善心情的效果。'],[8,10,11],'原文指出措施不只改善心情，也可改善專注及判斷。'),
 transfer('某企業已禁止非緊急夜間電郵，但員工仍把每晚運動與睡眠安排無限期押後。','哪項措施還要加入？',['個人也應固定休息和家庭時間，把這些安排當成重要承諾','只由僱主負責，員工完全不用管理個人日程','把睡眠全都改為工作時間','因為夜間電郵減少，就取消所有家庭用餐'],['原文把個人日程管理列為僱主制度以外的配套。','漏掉另一方責任。','與保護私人時間相反。','不能由一項改善推導取消其他保護。'],[12,13,14],'原文用 At the same time 補充個人應設固定時間。'),
 transfer('另一篇文章討論老師下班後仍要答覆家長訊息，並同時面臨薪金壓力。','哪種文章結構最能轉用範文？',['分開分析隨時回應的制度期望及經濟壓力，再提出學校與個人兩方措施','只說教師應更愛工作，不問條件','只談家長訊息，不分析已知的薪金壓力','把薪金問題當作手機電池問題'],['範文把職場期望與財務壓力分成兩條成因，再給雙方解方。','忽略了明示的制度條件。','漏掉第二成因。','未對應題目情境。'],[1,3,6,9,12],'原文先分兩項成因，再分僱主和個人責任。'),
 transfer('管理層推行彈性工作地點，卻從不監察每天超時工作的人數。','哪項補強符合範文？',['同時監察過度加班，避免工作安排彈性變成無界限延長工時','只要地點彈性，工時必然自動變短','完全不看員工負荷','只要求所有員工購買新電腦'],['原文把彈性與監察過度加班並列。','沒有任何保證。','與僱主設定健康界線相反。','設備不解決工時。'],[9,10],'原文提出讓員工掌握時間地點，同時監察過度加班。'),
 transfer('一名朋友每次都取消家庭晚餐去處理可延後的工作，說私人安排不算真正的承諾。','哪項建議最貼近範文？',['預先固定家庭用餐時間，並像對待工作會議般認真守住','把每頓晚餐都取消，以換取更多工作訊息','因為是私人安排，所以永遠不需要界線','只怪家庭成員不理解工作而不改時間安排'],['原文把家庭餐列為應認真對待的固定安排。','與平衡目標相反。','忽略私人生活最先被犧牲的風險。','沒有回應可延後工作的安排問題。'],[12,13,14],'原文要求像對待客戶會議一樣重視家庭用餐等承諾。'),
 transfer('文章結尾只說「大家要有工作生活平衡」，沒有分析成因和措施。','如何修訂較完整？',['概括持續聯絡、高工作要求及財務壓力，再指出僱主和個人需共同設界線','只重複「要平衡」幾次','突然討論辦公室椅子品牌','宣稱員工只靠意志即可克服所有制度壓力'],['原文結尾回收多項成因和兩方解法。','沒有回答原因及解法兩問。','與文章分析無關。','忽略僱主制度責任。'],[15,16],'原文最後兩句歸納成因並指出機構和個人要並行。'),
];
export default {key:'cause-solution:18',meta:{topic:'工作與生活失衡的制度和財務成因',summary:'隨時回應的職場期望與高生活成本侵佔私人時間；僱主規則與個人界線需配合。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
