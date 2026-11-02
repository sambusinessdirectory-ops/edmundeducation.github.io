// Change: growth and adaptability versus exhaustion and instability.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:32'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Our lives change more and more in our jobs, how we use machines, our relationships and what we hope to do.',
 'Some people think change is good because it makes life active and worth living, while others think having to change again and again can be too hard for people.',
 'I think change is good in the end because it helps people become better, even if it can feel difficult at first.',
 'People who like change often say it stops people from getting stuck in the same way of thinking.',
 'When people follow the same daily pattern for a long time, they may get too used to it and stop wanting to learn new skills or find better chances.',
 'In comparison, change makes people learn to deal with new situations, think in new ways and get better at dealing with problems.',
 'For example, a worker starting in a different kind of job may feel unsure at first, but the experience can teach them more, make them believe in themselves and give them chances they would not otherwise have.',
 'In this way, change does more than make life harder for a while; it can help people grow a lot.',
 'On the other side, it makes sense that some people find change all the time hard work.',
 'Changes often happening in work, home life or what others expect can make people feel unsafe and very tired in their feelings.',
 'Someone who must keep learning new ways to do the job, moving home or following new rules may find it hard to feel safe.',
 'But this mainly means people should plan and guide change well, rather than never allow change to happen.',
 'Life without any change may feel safe, but it may also become too small, too much the same and full of limits.',
 'To sum up, change all the time can tire people, but I think change is usually good because it helps them handle new situations, be brave and develop over many years.',
 'Feeling comfortable may keep people away from some stress, but change helps them become stronger.',
];
const vocabulary=[
 v(['Modern life','Our lives','現代生活'],['increasingly shaped by change','change more and more','越來越受變化塑造'],['technology','how we use machines','科技'],['personal goals','what we hope to do','個人目標']),
 v(['positive force','good','積極力量'],['dynamic','active','有活力'],['meaningful','worth living','有意義'],['constant adjustment','change again and again','不斷調整'],['too much pressure','too hard','太大壓力']),
 v(['In my view','I think','在我看來'],['ultimately beneficial','good in the end','最終有益'],['pushes people to grow','helps people become better','推動成長'],['uncomfortable in the short term','feel difficult at first','短期不舒服']),
 v(['support change','like change','支持改變'],['mentally stagnant','stuck in the same way of thinking','思想停滯']),
 v(['same routine','same daily pattern','同一日常規律'],['overly comfortable','too used to it','過於安逸'],['motivation','wanting to','動力'],['develop new skills','learn new skills','發展新技能'],['better opportunities','better chances','更好機會']),
 v(['By contrast','In comparison','相比之下'],['adapt','deal with new situations','適應'],['think differently','think in new ways','以不同方式思考'],['resilient','better at dealing with problems','有韌性']),
 v(['new industry','different kind of job','新行業'],['initially feel uncertain','feel unsure at first','起初不確定'],['broaden their knowledge','teach them more','擴闊知識'],['improve their confidence','make them believe in themselves','提升信心'],['open doors','give them chances','打開機會']),
 v(['In this sense','In this way','從此意義'],['not merely a disruption','does more than make life harder','不只是干擾'],['powerful engine','help people grow a lot','強力引擎'],['personal growth','people grow','個人成長']),
 v(['On the other hand','On the other side','另一方面'],['understandable','makes sense','可以理解'],['constant change','change all the time','持續變化'],['demanding','hard work','吃力']),
 v(['Frequent changes','Changes often happening','頻繁變化'],['living conditions','home life','生活條件'],['social expectations','what others expect','社會期望'],['unstable','unsafe','不穩定'],['emotionally exhausted','very tired in their feelings','情緒疲憊']),
 v(['new systems at work','new ways to do the job','新工作系統'],['moving to new places','moving home','搬遷'],['adjusting to new rules','following new rules','適應新規則'],['sense of security','feel safe','安全感']),
 v(['However','But','然而'],['managed carefully','plan and guide change well','審慎管理'],['avoided','never allow change to happen','避免改變']),
 v(['no change','without any change','沒有變化'],['narrow','too small','狹窄'],['repetitive','too much the same','重複'],['limiting','full of limits','受限制']),
 v(['In conclusion','To sum up','總結'],['constant change','change all the time','持續變化'],['tiring','tire people','疲倦'],['adaptability','handle new situations','適應力'],['courage','be brave','勇氣'],['long-term development','develop over many years','長遠發展']),
 v(['Comfort','Feeling comfortable','安逸'],['protect people from stress','keep people away from some stress','免受壓力'],['stronger','stronger','更強大']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula:parts.map(([text,kind,label])=>kind==='slot'?`[${label}]`:text).join(''),meaning,usage,parts}}
const specs=[
 {example:'Modern education is increasingly shaped by change, whether in lessons, technology, relationships, or personal goals.',d:[1,3,8],relation:'whether 列同一趨勢波及的多個生活領域',formula:'[領域] is increasingly shaped by change, whether in [四類範圍]',meaning:'現代生活工作、科技、人際、目標都在變。',links:[' is increasingly shaped by change, whether in ', ', technology, relationships, or personal goals.'],labels:['被變化塑造的領域','第一變動範圍']},
 {example:'Some people regard this as a positive force because it keeps learning dynamic and meaningful, while others argue that constant adjustment can place too much pressure on individuals.',d:[0,3,8],relation:'because 與 while 公平並列活力和壓力兩派',formula:'Some regard [變化] as positive because [活力], while others argue [壓力]',meaning:'一派重生活活力，另一派憂持續調整的壓力。',links:['Some people regard this as a positive force because it keeps ', ' dynamic and meaningful, while others argue that constant adjustment can place too much pressure on individuals.'],labels:['受益活動']},
 {example:'In my view, change is ultimately beneficial because it pushes pupils to grow, even though it can be uncomfortable in the short term.',d:[0,3,8],relation:'because 給成長理由，even though 承認短期不適',formula:'In my view, change is ultimately beneficial because it pushes [人] to grow, even though it can be uncomfortable in the short term',meaning:'作者判改變有益，承認短期不適。',links:['In my view, change is ultimately beneficial because it pushes ', ' to grow, even though it can be uncomfortable in the short term.'],labels:['被推動成長者']},
 {example:'Those who support new teaching methods often argue that it prevents people from becoming mentally stagnant.',d:[0,8,13],relation:'先提出支持派反對思想停滯的理由',formula:'Those who support [做法] often argue that it prevents people from becoming mentally stagnant',meaning:'改變可防止思想停滯。',links:['Those who support ', ' often argue that it prevents people from becoming mentally stagnant.'],labels:['被支持的變化']},
 {example:'When pupils remain in the same routine for too long, they may become overly comfortable and lose the motivation to develop new skills or explore better opportunities.',d:[3,8,13],relation:'When 說久留例行模式如何削弱學習動機',formula:'When [人] remain in the same routine for too long, they may become overly comfortable and lose the motivation to [成長行動]',meaning:'同一模式太久或過安逸，失去學技能找機會的動力。',links:['When ', ' remain in the same routine for too long, they may become overly comfortable and lose the motivation to develop new skills or explore better opportunities.'],labels:['久留舊模式的人']},
 {example:'By contrast, a new project forces people to adapt, think differently, and become more resilient.',d:[3,8,13],relation:'By contrast 對照變化帶來適應、思考與韌性',formula:'By contrast, [新情況] forces people to adapt, think differently, and become more resilient',meaning:'變化迫人適應、另想方法、變有韌性。',links:['By contrast, ', ' forces people to adapt, think differently, and become more resilient.'],labels:['促成改變的情境']},
 {example:'For example, a worker who moves into a new industry may initially feel uncertain, but the process can broaden their knowledge, improve their confidence, and open doors that would otherwise remain closed.',d:[3,8,13],relation:'but 以轉行例子對照初期不安與後續成長',formula:'For example, [轉變者] may initially feel uncertain, but the process can [三種後續收益]',meaning:'轉行初期不安，後續或擴知識信心及機會。',links:['For example, a ', ' who moves into a new industry may initially feel uncertain, but the process can broaden their knowledge, improve their confidence, and open doors that would otherwise remain closed.'],labels:['轉行者']},
 {example:'In this sense, a new role is not merely a disruption; it is a powerful engine of personal growth.',d:[3,8,13],relation:'not merely ...; ... 重述改變不只干擾也促成成長',formula:'In this sense, [改變] is not merely a disruption; it is a powerful engine of personal growth',meaning:'改變不只干擾，也可推個人成長。',links:['In this sense, ', ' is not merely a disruption; it is a powerful engine of personal growth.'],labels:['可促成成長的改變']},
 {example:'On the other hand, it is understandable why some people see repeated relocations as demanding.',d:[3,4,13],relation:'公平轉述另一派的壓力觀',formula:'On the other hand, it is understandable why some people see constant change as demanding',meaning:'認為不斷變動吃力亦可理解。',links:['On the other hand, it is understandable why some people see ', ' as demanding.'],labels:['被視為吃力的變動']},
 {example:'Frequent changes in class schedules, living conditions, or social expectations can make people feel unstable and emotionally exhausted.',d:[3,4,13],relation:'列工作居住與社會期望變化的情緒代價',formula:'Frequent changes in [三類環境] can make people feel unstable and emotionally exhausted',meaning:'工作住處社會期望頻變可令人不穩和情緒疲憊。',links:['Frequent changes in ', ', living conditions, or social expectations can make people feel unstable and emotionally exhausted.'],labels:['第一變動環境']},
 {example:'A teacher who has to keep learning new systems at work, moving to new places, or adjusting to new rules may struggle to build a sense of security.',d:[3,4,13],relation:'who 列反覆調整，推出難建立安全感',formula:'A [人] who has to keep [三種調整] may struggle to build a sense of security',meaning:'不停學系統、搬遷和適應規則或難有安全感。',links:['A ', ' who has to keep learning new systems at work, moving to new places, or adjusting to new rules may struggle to build a sense of security.'],labels:['受影響的人']},
 {example:'However, this argument mainly shows that change needs to be managed carefully, not that it should be banned.',d:[3,4,13],relation:'not that 回應對方問題而不接受完全避免變化',formula:'However, this argument mainly shows that [改變] needs to be managed carefully, not that it should be avoided',meaning:'壓力說明要管理改變，不是全避改變。',links:['However, this argument mainly shows that change needs to be managed carefully, not that it should be '],labels:['作者反對的過度處理']},
 {example:'A school with no change may feel safe, but it can also become narrow, repetitive, and limiting.',d:[3,4,13],relation:'but 對比穩定感與停滯代價',formula:'A [沒有變化的環境] may feel safe, but it can also become narrow, repetitive, and limiting',meaning:'零改變雖安全，亦或狹窄重複受限。',links:['A ', ' with no change may feel safe, but it can also become narrow, repetitive, and limiting.'],labels:['缺少改變的環境']},
 {example:'In conclusion, while constant change can certainly be tiring, I believe that change is generally good for students because it encourages adaptability, courage, and long-term development.',d:[3,4,9],relation:'while 承認疲累，because 收束適應勇氣發展',formula:'In conclusion, while [代價], I believe that change is generally good for [人] because it encourages [三種長期收益]',meaning:'作者承認疲累，仍判改變鼓勵適應勇氣發展。',links:['In conclusion, while constant change can certainly be tiring, I believe that change is generally good for ', ' because it encourages adaptability, courage, and long-term development.'],labels:['受益的人']},
 {example:'Routine may protect people from stress, but change helps them become stronger.',d:[3,4,9],relation:'but 短句收束舒適與變強的取捨',formula:'[熟悉安排] may protect people from stress, but change helps them become stronger',meaning:'安逸可減壓，改變可使人更強。',links:[' may protect people from stress, but change helps them become stronger.'],labels:['提供短期安全的安排']},
];
const usage=[
 '當你要在引言列出一種趨勢影響的幾個不同範圍時。',
 '當你要用 while 公平對列同一現象的好處與代價時。',
 '當你要給正面立場，同時用 even though 承認短期代價時。',
 '當你要先提出支持某做法者希望避免的停滯問題時。',
 '當你要用 When 解釋長期重複如何逐漸削弱嘗試新方法的動機時。',
 '當你要用 By contrast 說明新情境可能培養的能力時。',
 '當你要用一個人物示範初期不安與長期收益可以並存時。',
 '當你要用 not merely ...; ... 糾正對一項做法的單一負面理解時。',
 '當你要轉向另一派，承認他們對反覆調整的擔憂有理時。',
 '當你要列出多類頻繁變動如何造成不穩及疲累時。',
 '當你要用一個人反覆適應多項新要求，說明安全感不足時。',
 '當你要回應代價論，但區分審慎管理與全面避免時。',
 '當你要用 but 比較穩定帶來的安全感與可能的停滯代價時。',
 '當結論要先承認某做法有代價，再收束長期收益時。',
 '當你要以短對照句概括短期舒適與長期成長的不同作用時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'兩派分別談成長與壓力，作者再回應壓力。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對生活中的變化持甚麼立場？',['整體有益，但短期不適需要審慎管理。','任何變化都應完全避免。','只有工作變化值得討論。','變化保證每人永不疲倦。'],'成長理由較重，但承認壓力。'),{type:'multi',prompt:'選出兩派的主要擔憂或期待',detail:'選兩項，再按「確認」。',options:['改變防思想停滯並促進適應。','頻繁調整可造成不穩與情緒疲勞。','改變必然使每名員工升職。','零改變必然令生活永遠有意義。'],correct:[0,1],why:'正方重成長，反方重壓力。'}];
const route=[sequence('還原四段討論',[['引言','生活多方面變化；作者總體支持，承認短期難受。'],['支持派','例行太久會停滯，轉行例子展示能力與信心增長。'],['擔憂派與回應','頻變可疲累不安，結論是審慎管理而非全避變化。'],['結論','承認疲勞，仍選適應、勇氣與長期發展。']],'作者不是否認壓力，而是重新解讀其政策含義。')];
const evidence=[quiz('相同日常模式太久有甚麼風險？',['過於安逸，減少學新技能及尋新機會的動力。','保證每人持續找到更多機會。','使所有人永遠不再感到壓力。','必然讓每份工作立即升薪。'],'支持派用停滯說明改變價值。'),quiz('轉行工人的例子展示甚麼？',['初期或不安，但知識、信心和機會可隨後增加。','新行業必然保證立即加薪。','只要不安便永遠不能學新技能。','工人轉行完全不需適應。'],'短期與長期效果不同。'),quiz('擔憂派指出哪些變動造成壓力？',['工作、生活條件及社會期望頻繁變化。','只因每個人每天都要讀一本新書。','只有天氣變化，其他完全不變。','只因人們永遠不需要搬家。'],'多類變動可累積。'),quiz('作者如何回應改變令人疲累？',['應審慎管理改變，而非因此完全避免改變。','只要疲累便永久禁止一切變化。','疲累完全不存在，毋須考慮。','所有變化都必然毀掉安全感。'],'not that it should be avoided。'),quiz('沒有變化的生活為何也有限制？',['雖或感安全，卻可能狹窄、重複而限制成長。','保證永遠擁有所有新機會。','必然令每個人擁有更強韌性。','因零變化會立即產生新行業。'],'安全感有代價。')];
const logic=[sequence('改變帶來成長',[['舊規律過久','舒適但學習動機下降。'],['新情境','迫使適應與重新思考。'],['具體結果','轉行者或增知識、信心與新機會。']],'例子中的 may 與 can 保留可能性。'),sequence('壓力論與回應',[['反方理由','多種頻變使人情緒疲累。'],['具體機制','不停學系統搬遷適應規則，難有安全感。'],['作者回應','這要求良好管理，不等於應全避變化。'],['零變化代價','安全但狹窄重複。']],'承認反方具體問題，才可有力回應。')];
const transfers=[
 transfer('員工轉入新行業，起初不安，半年後掌握了新技能。','哪句最貼合成長論？',['短期不安可與後續知識、信心及新機會同時存在。','起初感不安便證明轉行永遠不可能帶來成長。','學新技能只會影響職位名稱，與信心毫無關係。','只要半年後能工作，便保證所有風險完全消失。'],['短期代價與長期成長並存。','過度否定。','信心可變。','不保證。'],[6,7],'initial uncertainty but broader knowledge。'),
 transfer('一名員工多年做同一套工作，已無意學新工具。','哪句對應支持派的理由？',['同一規律維持太久，過度安逸可能削弱學習動機。','維持舊規律越久，所有新技能便會自動增加。','不學新工具證明這個工作必定沒有任何價值。','只要工作熟悉，員工就保證永遠不會面對變化。'],['規律→舒適→停滯。','不自動學。','推論過強。','變化仍可出現。'],[3,4],'same routine→lose motivation。'),
 transfer('某人一年內不斷換工作和住處，感到情緒疲累。','哪句公平呈現反方？',['頻繁調整可使人感到不穩，難慢慢建立安全感。','搬家次數越多，便保證所有人更加平靜穩定。','情緒疲累只可能由薪金造成，與搬遷沒有關係。','只要有新工作，長期適應新規則便完全不會費力。'],['承認多種變動的累積壓力。','無保證。','過窄。','會費力。'],[9,10],'frequent changes→unstable/exhausted。'),
 transfer('有人以變化帶來焦慮為由，要求永久禁止所有調整。','哪句符合作者的回應？',['焦慮說明要管理改變，不足以推論應完全停止改變。','既有焦慮，就應完全禁止任何新工作或新規則。','只要改變有益，便不需照顧任何承受壓力的人。','焦慮必然代表所有變化永遠不可能促進成長。'],['區分管理與避免。','推論過強。','忽略壓力。','不必然。'],[11,12],'managed carefully, not avoided。'),
 transfer('另一題問學校是否應定期更新教法。','哪句能轉用本文框架？',['可比較新教法的學習收益與教師反覆調整的壓力。','既然生活會變，所有教法更新必然完全沒有代價。','只要教師感壓力，學校便永遠不應更換任何方法。','教法更新與學生學習或教師負擔都沒有關係。'],['成長和壓力兩派可跨題。','過度。','過度。','均相關。'],[1,4,9,11],'benefit and adjustment cost。'),
 transfer('作文只說「變化好」，沒有解釋如何。','哪句補足機制？',['新情境迫人適應和另想方法，逐步形成更強韌性。','變化好，因為一切變化都理所當然是好的。','只要換了職位，每人就保證立即擁有所有技能。','變化與思考方法無關，所以不必交代任何原因。'],['適應思考→韌性。','循環。','無保證。','需要機制。'],[4,5],'change forces adapt/think/resilient。'),
 transfer('一份工作長期完全不變，員工覺得安全但缺乏成長。','哪句最貼近末段比較？',['熟悉安排或能減壓，卻也可能限制探索新機會。','只要感到安全，個人成長便必然快速增加。','沒有變化必然令每人擁有無限的新工作選擇。','安全與成長永遠只能同時增加，沒有任何取捨。'],['短期舒適與長期限制並存。','無保證。','相反。','有取捨。'],[12,14],'no change safe but limiting。'),
 transfer('一家公司每月更改所有規則，員工難建立安全感。','哪句提出符合本文的改善方向？',['減少無必要更改並清楚安排轉變，讓員工有時間適應。','只要規則會改，就必須永遠停止所有合理制度更新。','員工感到不安，說明任何培訓或說明都必然無效。','每月改規則能保證員工立即獲得更高的安全感。'],['審慎管理變化而非全避。','過度。','無證據。','相反。'],[10,11],'change needs managed carefully。'),
 transfer('一派說「無變化就一定有更好人生」。','哪句指出缺口？',['沒有變化或使人安穩，也可令生活重複而受限。','沒有變化能保證人人學會不同技能與思考方式。','安穩的感覺證明所有新機會都必然不值得探索。','任何重複安排都不可能令人感到任何安全。'],['承認安全但指出限制。','無保證。','推論過強。','可能安全。'],[4,12],'safe but narrow/repetitive。'),
 transfer('結論要承認疲累，仍表明支持適當變化。','哪句最完整？',['持續變化或令人疲累，但可培養適應、勇氣和長遠發展。','持續變化會令人疲累，因此任何變化都必須停止。','只要變化可帶來成長，就毋須理會任何調整壓力。','變化與安逸只差名稱，並不影響人的能力或感受。'],['while 讓步後給長遠理由。','過度。','忽略反方。','有差異。'],[13,14],'conclusion while tiring + adaptability。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["短期不安可與後續知識、信心及新機會同時存在。","初期不安表示轉行不合適，技能增長只是暫時現象。","半年後學會技能即可升職，起初焦慮可以少談。","轉行可帶來新知，但信心只取決於原本的職位。"],["同一規律維持太久，過度安逸可能削弱學習動機。","工作規律可減少焦慮，因此學習動機也會穩定提高。","拒學新工具主要說明工具太難，與安逸程度無關。","維持熟悉工作可提高效率，探索新方法反而多餘。"],["頻繁調整可使人感到不穩，難慢慢建立安全感。","情緒疲累主要來自薪資波動，搬遷不影響安全感。","頻繁調整雖費時，卻能快速建立穩定的生活規律。","換工作與搬家帶來新機會，因此不必考慮疲累。"],["焦慮說明要管理改變，不足以推論應完全停止改變。","焦慮可以提醒人放慢轉變，因此應延後多數新安排。","若變化帶來成長，壓力便只屬個人態度而較少處理。","改變會產生不安，因此成長收益應視為次要因素。"],["可比較新教法的學習收益與教師反覆調整的壓力。","可比較學生分數與教材成本，卻不談教師調整壓力。","可比較教師資歷與校舍大小，卻不分析教法更新。","可只記錄更新次數，將其當作學生進步的證據。"],["新情境迫人適應和另想方法，逐步形成更強韌性。","換職位可帶來新同事，但未說明能力如何慢慢形成。","進入新情境後只需等待，適應力便會自行提高。","變化可增加日程安排，卻未解釋思考方式的改變。"],["熟悉安排或能減壓，卻也可能限制探索新機會。","熟悉安排能減壓，因此員工更容易探索新行業。","穩定工作使人安心，成長則只取決於薪金水平。","少改流程可提升效率，故不必衡量學習機會。"],["減少無必要更改並清楚安排轉變，讓員工有時間適應。","可維持每月改規則，但增加通知量以取代適應時間。","可取消大部分更新，卻未考慮哪些改動仍有需要。","可提供培訓，但仍要求員工即日掌握全部新規則。"],["沒有變化或使人安穩，也可令生活重複而受限。","安穩可減少壓力，因此不變的生活較易帶來新技能。","重複安排可形成規律，探索機會則只是無謂冒險。","無變化能保留熟悉感，人生發展只看眼前舒適度。"],["持續變化或令人疲累，但可培養適應、勇氣和長遠發展。","變化可能帶來成長，所以疲累只是過渡期的小問題。","疲累使人需要休息，因此應少談變化所帶來的長遠效益。","適度變化可帶來信心，但結論仍略過反覆適應的壓力。"]];
const editorialTransferReasons=[["原文容許初期不安與日後成長並存。","升職不是必然結果，也不能抹去初期不安。","學習新技能也可能建立信心。"],["熟悉規律可能削弱探索動機，非必然促進。","只怪工具難，忽略過度安逸的作用。","效率可有，但不代表探索沒有價值。"],["場景明示連續搬遷與適應負擔。","反覆調整未必形成穩定規律。","機會不能抵消所有情緒成本。"],["應管理改變，而非因焦慮延後全部變化。","有益的轉變仍須照顧承受壓力的人。","只看焦慮，忽略改變也可促進成長。"],["分數成本未對應新教法與教師負擔的取捨。","資歷校舍與此題的變化論證無關。","更新次數不能代替學習效果的證據。"],["有新同事未解釋適應和新方法如何形成韌性。","等待本身不是原文的主動適應過程。","日程變多不等於思考能力提高。"],["熟悉也可能限制新機會。","成長不只由薪金決定。","效率與學習機會需一起衡量。"],["通知不能代替實際的適應時間。","合理更新仍可能有價值。","培訓若沒有時間消化，仍會增壓。"],["安穩不會自行帶來新技能。","機會不應一概視為無謂風險。","熟悉感有益，但不是人生發展的全部。"],["結論須正視反覆調整的疲累。","只談疲累，未呈現支持變化的理由。","略去壓力，未公平回應另一方。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[13].frame.parts=[["In conclusion, while ","link","句型固定部分"],["constant change can certainly be tiring","slot","代價"],[", I believe that change is generally good for ","link","句型固定部分"],["people","slot","人"],[" because it encourages ","link","句型固定部分"],["adaptability, courage, and long-term development.","slot","三種長期收益"]];
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["Some people regard ","link","句型固定部分"],["this","slot","所討論的變化"],[" as a positive force because ","link","句型固定部分"],["it keeps life dynamic and meaningful","slot","正面理由"],[", while others argue that ","link","句型固定部分"],["constant adjustment can place too much pressure on individuals","slot","反面理由"],[".","link","句型固定部分"]];
structures[1].frame.formula="Some people regard [所討論的變化] as a positive force because [正面理由], while others argue that [反面理由].";
// Keep the displayed formula synchronized with the exact fixed and replaceable source spans.
for(const card of structures)card.frame.formula=card.frame.parts.map(part=>{const [text,kind,label]=Array.isArray(part)?part:[part.text,part.kind,part.label];return kind==='slot'?`[${label}]`:text}).join('');
export default {key:'discuss-both-views:32',meta:{topic:'生活持續變化是好還是壞',summary:'支持派認為改變防止停滯並培養適應力；反方指出頻繁調整令情緒疲累。作者承認壓力，主張審慎管理變化，而非全面避免。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
