// Two approaches to change. Source fragments are joined into 17 complete learning sentences.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:4'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Change is part of life today, but people react to it in different ways.',
 'Some people like new experiences, while others want to keep their usual way of life and avoid problems.',
 'Both ways have good and bad sides. Still, accepting change is better overall because it helps people learn and adapt; avoiding change mainly makes them feel safe for a short time.',
 'People who like change often get more benefits over time, even though it can also be hard.',
 'When people face new situations, they have to learn, solve problems and speak to different people. This slowly helps them deal with difficulties better.',
 'For example, a new graduate working abroad has to get used to a new culture, coworkers and rules. This can make them more confident and better able to get work.',
 'But too much change can make life less stable.',
 'If people change jobs, homes or partners too often, they may find it hard to build lasting support or feel safe.',
 'For example, a worker who keeps taking short jobs may enjoy different work, but may also worry about money and feel unsettled.',
 'In contrast, people who avoid change may enjoy a steady life, but this choice can hold them back.',
 'Staying in a familiar place can lower stress because people know what to expect, know their duties, and can build close relationships over time.',
 'For example, someone who lives in the same town for many years may have close friends, people to help them, and a steady job.',
 'But being too careful can stop people from moving forward.',
 'When people refuse to use new technology, learn new skills or take chances just because they feel uneasy, they may do worse in life and work.',
 'An employee who will not learn new computer systems may feel comfortable for a while, but could become less useful at work later.',
 'To sum up, both choices have benefits: welcoming change helps people grow, while avoiding it gives them a steady life.',
 'Still, being open to change is better because flexible people can also make their lives stable, while people who never adapt may miss important chances.',
];
const vocabulary=[
 v(['inevitable part','part','不可避免的一部分'],['respond to it','react to it','作出反應'],['very different ways','different ways','不同方式']),
 v(['actively welcome','like','主動歡迎'],['protect their routines','keep their usual way of life','維持日常規律'],['avoid disruption','avoid problems','避免打亂生活']),
 v(['certain benefits and drawbacks','good and bad sides','有利有弊'],['embracing change','accepting change','接納改變'],['more advantageous mindset','better overall','整體更有利'],['fosters adaptability and growth','helps people learn and adapt','促進適應與成長'],['short-term security','feel safe for a short time','短期安全感']),
 v(['long-term benefits','benefits over time','長期好處'],['not without cost','can also be hard','仍有代價']),
 v(['unfamiliar situations','new situations','陌生情況'],['forced to learn new skills','have to learn','被迫學新技能'],['solve unexpected problems','solve problems','解決突發問題'],['more resilient and capable','deal with difficulties better','更能應對困難']),
 v(['graduate who moves abroad for work','new graduate working abroad','到海外工作的畢業生'],['adjust to','get used to','適應'],['new colleagues','coworkers','新同事'],['more confident and employable','more confident and better able to get work','更有信心及就業能力']),
 v(['However','But','然而'],['create instability','make life less stable','造成不穩定']),
 v(['too frequently','too often','過於頻繁'],['struggle to build lasting support networks','find it hard to build lasting support','難建立持久支援網絡'],['sense of security','feel safe','安全感']),
 v(['continually moves','keeps taking','不斷轉換'],['short-term role','short jobs','短期職位'],['enjoy variety','enjoy different work','享受多樣性'],['financially and emotionally unsettled','worry about money and feel unsettled','財務及情緒不安']),
 v(['By contrast','In contrast','相反'],['avoid change','avoid change','避免改變'],['benefit from stability','enjoy a steady life','從穩定中受益'],['serious limitation','hold them back','嚴重限制']),
 v(['familiar environment','familiar place','熟悉環境'],['reduces stress','lower stress','減輕壓力'],['routines are predictable','know what to expect','日常可預測'],['responsibilities are clear','know their duties','職責清楚'],['relationships can deepen','build close relationships','關係加深']),
 v(['stays in one community','lives in the same town','留在同一社區'],['close friendships','close friends','親密友誼'],['reliable support system','people to help them','可靠支援'],['steady career path','steady job','穩定職涯']),
 v(['excessive caution','being too careful','過度謹慎'],['stagnation','stop people from moving forward','停滯']),
 v(['reject new technology','refuse to use new technology','拒絕新科技'],['training','learn new skills','培訓'],['opportunities','take chances','機會'],['fall behind','do worse','落後'],['personally and professionally','in life and work','個人及職業上']),
 v(['refuses to learn new digital systems','will not learn new computer systems','拒學新系統'],['preserve the comfort of old habits','feel comfortable','維持舊習慣的舒適'],['less useful in a changing workplace','less useful at work later','在變動職場中作用下降']),
 v(['In conclusion','To sum up','總結'],['understandable advantages','benefits','可理解的好處'],['encourages development','helps people grow','促進成長'],['offers stability','gives them a steady life','帶來穩定']),
 v(['Nevertheless','Still','儘管如此'],['welcoming change','being open to change','歡迎改變'],['better approach','better','較佳做法'],['flexible person','flexible people','有彈性的人'],['lose valuable opportunities','miss important chances','錯失重要機會']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){
 const text=original[i],parts=[];let cursor=0,slotIndex=0;
 for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}
 if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));
 return {formula,meaning,usage,parts};
}
const specs=[
 {example:'Technology is an inevitable part of modern life, yet people respond to it in very different ways.',d:[1,6,12],relation:'用 yet 對比普遍事實與不同個人反應',formula:'[現象] is an inevitable part of modern life, yet people respond to it in [不同方式]',meaning:'改變無法避免，人們的反應卻不一樣。',usage:'引言先交代共同背景與分歧，不需先評判某一方。',links:[' is an inevitable part of modern life, yet people respond to it in very different ways.'],labels:['現象']},
 {example:'While some actively welcome unfamiliar tasks, others prefer to protect their routines and avoid disruption whenever possible.',d:[0,6,12],relation:'用 While 對稱呈現兩種相反態度',formula:'While some [主動擁抱新事], others prefer to [維持舊安排]',meaning:'有人歡迎新體驗，有人維持日常、盡量避免打亂。',usage:'題目要求 both approaches，先公平呈現兩種做法。',links:['While some actively welcome ', ', others prefer to protect their routines and avoid disruption whenever possible.'],labels:['新體驗類型']},
 {example:'Although both approaches bring certain benefits and drawbacks, a willingness to learn new technology is ultimately the more advantageous mindset because it improves adaptability and opportunity, whereas refusing it mainly provides short-term security.',d:[1,9,15],relation:'在承認兩面後以 because／whereas 比較兩種做法的核心價值',formula:'Although both approaches bring certain benefits and drawbacks, [甲] is ultimately more advantageous because [長期理由], whereas [乙] mainly provides [短期好處]',meaning:'接納改變促進適應及成長；避免改變主要有短期安全感。',usage:'立場可以明確，但後文須對兩種態度各談好處和代價。',links:['Although both approaches bring certain benefits and drawbacks, ', ' is ultimately the more advantageous mindset because ', ', whereas ', ' mainly provides short-term security.'],labels:['較佳心態','長期理由','另一心態']},
 {example:'People who enjoy change usually gain stronger career options over time, even though this way of life is not without cost.',d:[6,9,12],relation:'先提出喜歡改變的長期收益，同時承認代價',formula:'People who enjoy change usually gain [長期收益], even though this way of life is not without cost',meaning:'愛改變的人通常獲長期好處，但改變也有成本。',usage:'主題句預示本段將談同一做法的利與弊。',links:['People who enjoy change usually gain ', ', even though this way of life is not without cost.'],labels:['長期收益']},
 {example:'When individuals enter unfamiliar workplaces, they are forced to learn new systems, solve daily problems and speak with new colleagues, which gradually makes them more confident and capable.',d:[1,7,13],relation:'以 When→行動→which 結果解釋成長機制',formula:'When individuals enter [新情境], they are forced to [一組適應行動], which gradually makes them [新能力]',meaning:'陌生環境迫使人學技能、解決問題、接觸不同人，逐步變得堅韌能幹。',usage:'不要把成長當空泛口號；列清楚人做了甚麼，才推到能力提升。',links:['When individuals enter ', ', they are forced to ', ', which gradually makes them ','.'],labels:['新情境','適應行動','新能力']},
 {example:'For example, a graduate who starts a demanding apprenticeship must adjust to new tools, new colleagues and new expectations, and this process often leaves them more confident and employable.',d:[4,10,14],relation:'以畢業生具體例子演示適應過程和結果',formula:'For example, a graduate who [面對新環境] must adjust to [具體新要求], and this process often leaves them [能力結果]',meaning:'海外工作畢業生適應新文化、同事及期待，因此更有信心與就業能力。',usage:'例子需延續上句的學習／適應機制，不能只換地點而沒有新要求。',links:['For example, a graduate who ', ' must adjust to ', ', and this process often leaves them more confident and employable.'],labels:['面對新環境','新要求']},
 {example:'However, moving homes every few months can also create instability.',d:[3,9,12],relation:'以 However 從改變的好處轉入不穩定代價',formula:'However, [過度或持續改變] can also create instability',meaning:'不斷改變可能帶來不穩。',usage:'短轉折後須說明甚麼頻率或範圍的改變帶來問題。',links:['However, ', ' can also create instability.'],labels:['造成不穩的改變']},
 {example:'If someone changes workplaces or homes too frequently, they may struggle to keep close friendships or feel secure.',d:[4,10,13],relation:'用 If 交代過度頻繁的條件及可能損失',formula:'If someone changes [生活重要部分] too frequently, they may struggle to [持久支援與安全感]',meaning:'工作、城市、關係轉換太密，難建立持久支援和安全感。',usage:'too frequently 是問題條件；不是所有變動都必然破壞關係。',links:['If someone changes ', ' too frequently, they may struggle to ','.'],labels:['重要生活部分','可能損失']},
 {example:'A worker who repeatedly moves between temporary posts, for instance, may enjoy variety, but may also feel financially and emotionally unsettled.',d:[5,11,14],relation:'同一例子內以 but 平衡多樣性收益與財務情緒代價',formula:'A worker who [頻繁轉換職位], for instance, may enjoy variety, but may also feel [不穩結果]',meaning:'短期職位不斷變換有新鮮感，也可能使收入與心情不穩。',usage:'對一個做法同時寫可取處和代價，避免一面倒。',links:['A worker who ', ', for instance, may enjoy variety, but may also feel ','.'],labels:['轉職情況','不穩結果']},
 {example:'By contrast, people who stay in familiar jobs benefit from stability, but this preference can easily become a serious limitation.',d:[3,6,13],relation:'轉向避免改變的一方，並同句預示其優點與限制',formula:'By contrast, people who [維持原狀] benefit from stability, but this preference can easily become a serious limitation',meaning:'避免改變可得穩定，但也可能變成限制。',usage:'By contrast 切換比較對象；正文仍要公平給出正面例子和負面後果。',links:['By contrast, people who ', ' benefit from stability, but this preference can easily become a serious limitation.'],labels:['維持原狀']},
 {example:'Remaining in a familiar environment reduces stress because coworkers know each other, tasks are predictable and support is close at hand.',d:[4,7,13],relation:'以 because 列出熟悉環境減壓的具體機制',formula:'Remaining in a familiar environment reduces stress because [可預測安排], [清楚責任] and [持久關係]',meaning:'規律可預測、職責清楚、關係可深化，所以壓力較小。',usage:'解釋穩定為何有用；不要單說「穩定很好」。',links:['Remaining in a familiar environment reduces stress because ', ', ', ' and ','.'],labels:['第一原因','第二原因','第三原因']},
 {example:'Someone who stays in one town for many years, for example, may enjoy close friendships, a reliable support system and a steady career path.',d:[5,8,14],relation:'以長住同一社區例子支援友誼、支援與職涯穩定',formula:'Someone who stays in [地點] for many years, for example, may enjoy [友誼], [支援] and [職涯穩定]',meaning:'留在一個社區多年者或可有密友、可靠支援和穩定工作路徑。',usage:'may 保留可能性，不能保證人人留在原地都得到全部好處。',links:['Someone who stays in ', ' for many years, for example, may enjoy close friendships, a reliable support system and a steady career path.'],labels:['長住地點']},
 {example:'The disadvantage, however, is that excessive caution often leads to missed training opportunities.',d:[6,9,15],relation:'用短主題句轉入過度求穩的風險',formula:'The disadvantage, however, is that excessive caution often leads to [後果]',meaning:'太謹慎可能停滯。',usage:'問題是 excessive caution，不是一般合理的安全感。',links:['The disadvantage, however, is that excessive caution often leads to ','.'],labels:['後果']},
 {example:'When people reject useful courses and new tools simply because these feel uncomfortable, they may fall behind both personally and professionally.',d:[4,7,15],relation:'用 simply because 限定拒絕新事的動機，再指出落後後果',formula:'When people reject [可用新機會] simply because [不適感], they may fall behind both personally and professionally',meaning:'只因不舒服而拒絕科技、訓練或機會，可能在生活與工作落後。',usage:'不是所有拒絕改變都錯；句型批評的是未評估利益、只因不適而拒絕。',links:['When people reject ', ' simply because ', ', they may fall behind both personally and professionally.'],labels:['可用新機會','拒絕原因']},
 {example:'An employee who refuses to learn new workplace tools may preserve the comfort of old habits for a while, but may eventually become less useful in a changing workplace.',d:[5,8,16],relation:'以 for a while／eventually 對比短暫舒適與長期代價',formula:'An employee who [拒學新技能] may preserve the comfort of old habits for a while, but may eventually become [長期不利結果]',meaning:'不學新數碼系統，短期保留舒適，長期可能在職場變得較無用。',usage:'用 may 保留不確定性；例子要回扣 stagnation，不須宣稱必然失業。',links:['An employee who ', ' may preserve the comfort of old habits for a while, but may eventually become less useful in a changing workplace.'],labels:['拒學新技能']},
 {example:'In conclusion, both attitudes have understandable advantages: trying new roles encourages development, while keeping a routine offers stability.',d:[2,9,16],relation:'結論先平衡列明兩種態度各自的主要好處',formula:'In conclusion, both attitudes have understandable advantages: [歡迎改變] encourages development, while [維持穩定] offers stability',meaning:'喜歡改變促發展；避免改變有穩定。',usage:'先公平回顧兩方好處，再給最終偏向。',links:['In conclusion, both attitudes have understandable advantages: ', ' encourages development, while ', ' offers stability.'],labels:['歡迎改變','避免改變']},
 {example:'Nevertheless, learning new skills is clearly the better approach, because a flexible worker can still build steady routines, whereas an inflexible one may lose valuable opportunities that never return.',d:[2,10,15],relation:'用 because／whereas 支持最終選擇並回應穩定的優點',formula:'Nevertheless, [較佳做法] is clearly the better approach, because [有彈性者仍可保留穩定], whereas [僵化者可能錯失機會]',meaning:'有彈性的人仍能建立穩定；僵化的人可能錯失不可再得的機會。',usage:'最後判斷應回應另一方的最強優點，而非無視其穩定價值。',links:['Nevertheless, ', ' is clearly the better approach, because ', ', whereas ','.'],labels:['較佳做法','第一理由','對照風險']},
];
const usageGuides=[
 '當你要在引言指出一項共同現象，但人們對它的反應不同時。',
 '當你要用 While 並列兩組人對同一情況採取的相反做法時。',
 '當你要先承認兩種做法各有利弊，再用 because 和 whereas 解釋整體偏向時。',
 '當你要在主題句預告某組人有好處，同時提醒讀者它也有代價時。',
 '當你要用 When 說明某種情況要求人採取行動，再以 which 指出能力變化時。',
 '當你要以具體人物和新要求，說明某種經歷如何培養能力時。',
 '當你要用 However 從一項好處轉向同一做法的可能代價時。',
 '當你要用 If 和 too frequently 指出只有過度發生時才可能出現問題時。',
 '當你要在同一例子中用 may...but may also...公平呈現收益與代價時。',
 '當你要用 By contrast 切換到另一組人，並預告其好處與限制時。',
 '當你要用 because 解釋某項抽象好處由哪些具體條件產生時。',
 '當你要以長期、具體的生活安排，展示上一句好處時。',
 '當你要用 The disadvantage, however 指出過度依賴某項好處可能造成的問題時。',
 '當你要用 When...simply because...分辨合理選擇與僅因不適而拒絕機會時。',
 '當你要以一名具體人物的短期舒適和長期代價，說明前一句風險時。',
 '當你要在結論中用 while 並列兩種做法各自真正的好處時。',
 '當你要用 Nevertheless 給出最終偏向，再以 because 和 whereas 比較兩方後果時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把「喜歡改變」與「避免改變」的好處和代價各自配對。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('題目要比較哪兩種態度？',['喜歡改變與盡量避免改變','只比較兩種工作','只談新科技的價錢','只談搬家原因'],'原題明確問 both approaches 的 advantages and disadvantages。'),
 {type:'multi',prompt:'範文的立場與平衡在哪裏？',detail:'選兩項，再按「確認」。',options:['歡迎改變有長期成長，也可能帶來不穩','避免改變有穩定，但過分謹慎可能停滯','作者認為避免改變完全沒有好處','作者認為所有改變都必然有益'],correct:[0,1],why:'兩種做法各有利弊；作者最後偏向有彈性的改變。'},
];
const route=[sequence('依範文重排兩種態度的利弊論證',[
 ['引言','人人會遇到改變；呈現兩種態度，表明偏向接納改變。'],
 ['喜歡改變','陌生情境促技能與韌性；海外工作的畢業生例子；頻繁變動也可損穩定。'],
 ['避免改變','熟悉生活減壓並建立關係；長住社區例子；過度謹慎可能落後。'],
 ['結論','先公平重述成長與穩定，再解釋有彈性的人仍可建立穩定。'],
 ],'不要把「適度接納改變」寫成「越常換工作越好」。')];
const evidence=[
 quiz('畢業生移居海外工作的例子主要支持甚麼？',['適應陌生文化與工作可培養信心及就業能力','每次搬家必然加薪','熟悉環境一定阻礙工作','海外工作完全沒有困難'],'例子有新文化、同事、要求與能力結果。'),
 quiz('為何頻繁轉換工作或城市可能有代價？',['持久支援網絡與安全感較難建立','所有朋友都會即時離開','新工作必然收入更高','轉換本身總是錯誤'],'原文用 may，且限定 too frequently。'),
 quiz('留在熟悉社區的主要好處是甚麼？',['深厚友誼、可靠支援與較穩定的職涯','每個人一定成為富翁','永遠不用學任何新事','保證不會有壓力'],'是 may enjoy 的合理可能利益，不是保證。'),
 quiz('甚麼情況下避免改變會變成問題？',['只因不舒服就拒絕有用的科技、訓練或機會','審慎評估新機會','維持有益的朋友關係','保留有效的工作程序'],'原文批評 excessive caution，而非所有穩定。'),
 quiz('結論為何偏向接納改變？',['有彈性者仍可建立穩定，僵化者可能失去機會','因為頻繁轉職必定有利','因為穩定從來沒有價值','因為新事物一定比舊事物好'],'回應穩定一方最強利益，再說適應的長期價值。'),
];
const logic=[
 sequence('喜歡改變：機制、收益、代價',[
  ['陌生情境','要學技能、解決意外問題、接觸不同人。'],
  ['長期收益','韌性、能力、信心和就業能力可能提升。'],
  ['過量條件','若工作、城市或關係變得太頻繁，支援網絡難建立。'],
  ['代價','生活、財務或情緒可能不穩。'],
 ],'「改變能促成長」不等於「改變愈多愈好」。'),
 sequence('避免改變：機制、收益、代價',[
  ['熟悉環境','規律可預測、責任明確、關係可加深。'],
  ['眼前收益','壓力較少，支援與職涯或較穩。'],
  ['過量條件','只因不舒服而拒絕訓練、新科技與機會。'],
  ['長期代價','能力可能跟不上職場變化。'],
 ],'「穩定有價值」不等於「拒絕所有新事」。'),
];
const transfers=[
 transfer('另一題：有人喜歡不斷搬家，有人長住同一社區。','哪個開頭公平呈現兩種態度？',['有人歡迎新的居住體驗，另一些人重視熟悉社區的規律。','長住者必然缺乏勇氣。','搬家者一定更快樂。','兩種人都完全不在乎住處。'],['兩種態度都被準確交代，未先作人格判斷。','無根據的貶抑。','過度保證。','題意相反。'],[0,1],'原文 change inevitable；some welcome，others protect routines。'),
 transfer('工作者轉入新部門，需學新系統並接觸不同同事。','哪句解釋「成長」如何發生？',['新工作迫使他學系統、解決新問題，因此逐漸更能應付變化。','新部門會自動增加他的能力，即使沒有學習。','新同事必然讓他的收入翻倍。','遇到陌生情況便證明他不適合工作。'],['行動與能力提升有可追蹤的關係。','缺少機制。','無收入資料。','推論過度。'],[4,5],'原文 unfamiliar situations→learn/solve/interact→resilient and capable。'),
 transfer('某人三年換六份工作，收入不穩且難建立長久同事關係。','哪句公平表達變動的代價？',['多樣工作或有新鮮感，但過於頻繁的轉職也可能傷及財務與支援。','每次換工作都一定令人破產。','任何轉職都沒有好處。','收入不穩證明他完全沒有技能。'],['收益與 too frequently 的限制同時呈現。','過度絕對。','忽略多樣性。','無此證據。'],[6,7,8],'原文 may enjoy variety but financially/emotionally unsettled。'),
 transfer('一位畢業生到外國工作，要適應新文化與同事。','哪句例子有過程和結果？',['他學會配合新文化與同事，之後可能更有信心面對工作。','他到外國，因此必然獲得高薪。','他只更換地址，無須適應任何要求。','所有外國工作都沒有困難。'],['新要求→適應→能力結果。','薪金未提供。','與題境相反。','不真實且無證據。'],[5],'原文 graduate abroad adjusts to culture/colleagues/expectations。'),
 transfer('同一社區生活多年，日常安排可預測，鄰里關係變深。','哪句具體說明穩定的利益？',['熟悉的規律及持久關係可減輕壓力，並提供可靠支援。','熟悉環境一定能免除所有壓力。','長住證明此人拒絕一切新技能。','關係變深與穩定完全無關。'],['說出 predictable routines 和 deep relationships 的作用。','過度保證。','不必然。','與題境相反。'],[10,11],'原文 familiar environment reduces stress；relationships deepen。'),
 transfer('員工不願學新電腦系統，因為舊方法較舒服。','哪句區分短期與長期？',['短期可保留熟悉感，但若工作方式改變，長期可能較難勝任。','不學新系統必定立即失業。','舊方法舒服便保證他永遠最有用。','新電腦系統必定毫無價值。'],['for a while 對比 eventually，且保留可能性。','過度保證。','長期風險被忽略。','沒有評估系統。'],[13,14],'原文 comfort of old habits for a while，less useful later。'),
 transfer('寫利弊比較時，避免改變一方確有安全感。','哪句能承認對方最強利益？',['維持熟悉規律可帶來穩定，但過度謹慎也可能錯失成長機會。','避免改變沒有任何好處。','安全感與熟悉規律無關。','有安全感便毋須考慮未來機會。'],['先承認穩定，再檢查長期限制。','無視題目另一方。','忽略機制。','忽略代價。'],[9,12,15],'原文 stability benefit，excessive caution limitation。'),
 transfer('新科技培訓看起來難，但可能幫助員工工作。','哪句限定問題所在？',['若只因不舒服便拒絕有用培訓，員工可能逐漸落後。','員工審慎查證後拒絕無用課程也一定錯。','每項新科技都必定有益。','任何舊工作方法都必須即時淘汰。'],['simply because discomfort 是原文的關鍵條件。','審慎評估不同。','過度絕對。','沒有必要一律淘汰。'],[13],'原文 reject opportunities simply because uncomfortable→fall behind。'),
 transfer('結論需同時回顧「喜歡改變」和「避免改變」的優點。','哪句平衡且精簡？',['接納改變有助成長，維持熟悉生活則有助穩定。','接納改變和避免改變都只有缺點。','只談接納改變，不提另一方。','在結論首次加入未分析的新統計。'],['兩個核心好處各有位置。','與正文相反。','未涵蓋雙方。','不宜新證據。'],[15],'原文 conclusion development while stability。'),
 transfer('作者偏向接納改變，但承認穩定有價值。','哪句最能支持最終比較？',['有彈性的人仍可建立穩定；完全拒絕新事的人可能失去不可再得的機會。','接納改變要求每年必須搬家。','避免改變的人永遠不會有朋友。','只要不改變，所有機會都會自動回來。'],['回應穩定利益，再指出僵化代價。','把態度誤作頻繁搬家。','毫無根據。','機會未必可再得。'],[16],'原文 flexible person can create stability，inflexible one may lose opportunities。'),
];
export default {key:'advantage-disadvantage:4',meta:{topic:'歡迎改變與避免改變的利弊',summary:'歡迎改變可促進技能、韌性及長期成長，但過於頻繁也可能令財務及關係不穩。避免改變可減壓並建立持久支援，但過度謹慎可能落後。作者選擇有彈性的改變，因為它仍可與穩定並存。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
