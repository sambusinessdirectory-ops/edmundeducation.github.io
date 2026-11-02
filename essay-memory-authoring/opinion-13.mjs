// Model Essay 13 · Opinion: ambition, persistence, improvement and opportunity.
const simple=[
  'In most parts of life, real success does not just happen by chance.',
  'So many people think wanting very much to succeed is needed to achieve things.',
  'I fully agree because wanting very much to succeed helps people keep going when things are hard and makes them work to improve until chances become real results.',
  'First, wanting very much to succeed matters because it helps people keep working for a long time.',
  'Real success usually needs self-control, and people who really want to succeed are much more willing to put up with difficulties to reach a goal.',
  'For example, a student who wants a hard-to-win scholarship may study in the evenings, spend less time with friends and practise for months even under pressure.',
  'Also, wanting very much to succeed helps people try again after problems instead of giving up after the first disappointment.',
  'When that student does badly in an early practice exam, their goal can make them look at what went wrong and try again rather than decide success is impossible.',
  'Because success often comes after giving up time and facing failure, this kind of continuing effort is necessary.',
  'Wanting very much to succeed matters just as much because it pushes people to do more than just do their job well enough.',
  'People who truly want to succeed do not just repeat what they know; they look for better ways, higher goals and harder jobs.',
  'For example, a worker who really wants to succeed is more likely to learn new computer programs, ask for advice and improve how they speak to others so they can get ready to move up at work.',
  'Wanting very much to succeed also helps people notice chances that people who do not want to succeed as strongly often miss.',
  'The same worker may offer to do a hard project or suggest a new idea to senior managers, and so gain both experience and attention.',
  'As a result, wanting very much to succeed not only improves a person’s skills but also lets other people see and value those skills.',
  'In short, I fully agree that wanting very much to succeed is needed for success.',
  'It helps people give up things they enjoy, try again after failure, get better and take chances, and these are exactly the things that make real success possible.',
];
const vocabulary=[
  [['most areas of life','most parts of life','生活大部分範疇'],['meaningful success','real success','有意義的成功'],['does not happen by accident','does not just happen by chance','並非偶然發生']],
  [['therefore','So','因此'],['ambition','wanting very much to succeed','抱負'],['indispensable to achievement','needed to achieve things','對成就不可缺少']],
  [['completely agree','fully agree','完全同意'],['ambition','wanting very much to succeed','抱負'],['endurance to continue through difficulty','keep going when things are hard','克服困難的耐力'],['drive to improve','work to improve','求進步的動力'],['opportunities become tangible results','chances become real results','機會變成具體成果']],
  [['The first reason','First','第一個原因'],['ambition','wanting very much to succeed','抱負'],['essential','matters','重要'],['sustains effort over long periods of time','helps people keep working for a long time','維持長時間努力']],
  [['normally demands discipline','usually needs self-control','通常需要紀律'],['ambitious people','people who really want to succeed','有抱負的人'],['far more willing','much more willing','更願意'],['tolerate inconvenience','put up with difficulties','忍受不便']],
  [['highly competitive scholarship','hard-to-win scholarship','競爭激烈的獎學金'],['spend evenings revising','study in the evenings','晚上溫習'],['reduce social activities','spend less time with friends','減少社交活動'],['constant pressure','pressure','持續壓力']],
  [['Just as importantly','Also','同樣重要'],['ambition','wanting very much to succeed','抱負'],['recover from setbacks','try again after problems','從挫折中恢復'],['abandoning their plans','giving up','放棄計劃']],
  [['performs badly','does badly','表現欠佳'],['mock exam','practice exam','模擬考'],['analyse weaknesses','look at what went wrong','分析弱點'],['conclude','decide','下結論']],
  [['achievement','success','成就'],['sacrifice','giving up time','犧牲'],['persistence','continuing effort','堅持'],['not optional; it is fundamental','necessary','不可缺少']],
  [['Ambition','Wanting very much to succeed','抱負'],['equally important','matters just as much','同樣重要'],['beyond mere competence','do more than just do their job well enough','超越僅僅勝任']],
  [['genuinely','truly','真正'],['familiar routines','what they know','熟悉的做法'],['actively seek better methods','look for better ways','主動尋求更好方法'],['more demanding responsibilities','harder jobs','更具挑戰的責任']],
  [['ambitious employee','worker who really wants to succeed','有抱負的員工'],['new software','new computer programs','新軟件'],['request feedback','ask for advice','要求回饋'],['strengthen communication skills','improve how they speak to others','加強溝通能力'],['prepare for promotion','get ready to move up at work','為晉升作準備']],
  [['Ambition','Wanting very much to succeed','抱負'],['alert to opportunities','notice chances','留意機會'],['less driven individuals','people who do not want to succeed as strongly','較缺乏動力的人'],['ignore','miss','忽略']],
  [['volunteer for a difficult project','offer to do a hard project','主動請纓艱難項目'],['propose an innovative idea','suggest a new idea','提出創新構想'],['thereby gaining','and so gain','從而得到'],['visibility','attention','曝光機會']],
  [['Ambition','wanting very much to succeed','抱負'],['ability','skills','能力'],['recognised and rewarded','see and value','被看見並獲得回報']],
  [['In conclusion','In short','總而言之'],['completely agree','fully agree','完全同意'],['ambition','wanting very much to succeed','抱負'],['essential','needed','不可缺少']],
  [['enables','helps','使人能夠'],['endure sacrifice','give up things they enjoy','承受犧牲'],['recover from failure','try again after failure','從失敗中恢復'],['pursue improvement','get better','追求進步'],['seize opportunities','take chances','把握機會'],['meaningful achievement','real success','有意義的成就']],
];
const chunkOverrides=[
  ['In most areas of life,','meaningful success does not happen by accident.'],
  ['Many people therefore believe','that ambition is indispensable to achievement.'],
  ['I completely agree,','because ambition gives people both the endurance to continue through difficulty','and the drive to improve until opportunities become tangible results.'],
  ['The first reason ambition is essential','is that it sustains effort over long periods of time.'],
  ['Real success normally demands discipline,','and ambitious people are far more willing to tolerate inconvenience','in order to reach a goal.'],
  ['A student aiming for a highly competitive scholarship, for example,','may spend evenings revising, reduce social activities','and practise under constant pressure for months.'],
  ['Just as importantly, ambition helps people recover from setbacks','instead of abandoning their plans at the first disappointment.'],
  ['When such a student performs badly in an early mock exam,','ambition encourages them to analyse weaknesses and try again','rather than conclude that success is impossible.'],
  ['Because achievement usually comes after sacrifice and failure,','this kind of persistence is not optional; it is fundamental.'],
  ['Ambition is equally important','because it pushes people beyond mere competence.'],
  ['Those who genuinely want to succeed do not simply repeat familiar routines;','they actively seek better methods, higher standards','and more demanding responsibilities.'],
  ['An ambitious employee, for instance, is more likely to learn new software,','request feedback and strengthen communication skills','in order to prepare for promotion.'],
  ['Ambition also makes people alert to opportunities','that less driven individuals often ignore.'],
  ['The same worker may volunteer for a difficult project','or propose an innovative idea to senior managers,','thereby gaining both experience and visibility.'],
  ['As a result, ambition does not just improve a person’s ability;','it places that ability in situations','where it can be recognised and rewarded.'],
  ['In conclusion, I completely agree','that ambition is essential for success.'],
  ['It enables people to endure sacrifice, recover from failure,','pursue improvement and seize opportunities,','and these are precisely the conditions','in which meaningful achievement becomes possible.'],
];
const simpleChunkOverrides=[
  ['In most parts of life,','real success does not just happen by chance.'],
  ['So many people think','wanting very much to succeed is needed to achieve things.'],
  ['I fully agree','because wanting very much to succeed helps people keep going when things are hard','and makes them work to improve until chances become real results.'],
  ['First, wanting very much to succeed matters','because it helps people keep working for a long time.'],
  ['Real success usually needs self-control,','and people who really want to succeed are much more willing','to put up with difficulties to reach a goal.'],
  ['For example, a student who wants a hard-to-win scholarship','may study in the evenings, spend less time with friends','and practise for months even under pressure.'],
  ['Also, wanting very much to succeed helps people try again after problems','instead of giving up after the first disappointment.'],
  ['When that student does badly in an early practice exam,','their goal can make them look at what went wrong and try again','rather than decide success is impossible.'],
  ['Because success often comes after giving up time and facing failure,','this kind of continuing effort is necessary.'],
  ['Wanting very much to succeed matters just as much','because it pushes people to do more than just do their job well enough.'],
  ['People who truly want to succeed do not just repeat what they know;','they look for better ways, higher goals and harder jobs.'],
  ['For example, a worker who really wants to succeed is more likely to learn new computer programs,','ask for advice and improve how they speak to others','so they can get ready to move up at work.'],
  ['Wanting very much to succeed also helps people notice chances','that people who do not want to succeed as strongly often miss.'],
  ['The same worker may offer to do a hard project','or suggest a new idea to senior managers,','and so gain both experience and attention.'],
  ['As a result, wanting very much to succeed not only improves a person’s skills','but also lets other people see and value those skills.'],
  ['In short, I fully agree','that wanting very much to succeed is needed for success.'],
  ['It helps people give up things they enjoy, try again after failure,','get better and take chances,','and these are exactly the things that make real success possible.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('In most workplaces, useful skills do not develop by accident.','In... 指定討論範圍，do not...by accident 否定偶然性，為後文原因鋪路。','這句只設定範圍並否定偶然形成，沒有列舉行動或提出政策。',[1,4,15],
    F('In [討論範圍], [有價值的成果] does not happen by accident','先劃定討論範圍，再指出成果不是偶然出現，為後文解釋條件作開場。','開頭要提醒讀者某項成果背後有形成過程，而不只是偶然發生時。',[['In ','link','設定討論範圍'],['most areas of life','slot','討論範圍'],[', ','link','接核心觀察'],['meaningful success','slot','有價值的成果'],[' does not happen by accident.','link','否定偶然性']])),
  S('Many parents therefore believe that daily reading helps children build confidence.','therefore 把前一句的觀察接到一些人提出的看法。','這句是依前文轉述他人看法，沒有解釋成果本身的形成。',[0,3,9],
    F('Many people therefore believe that [由前述觀察引出的看法]','therefore 表示他人的看法接續前一句的觀察；believe that 仍標示這是被轉述的主張。','提出一項普遍情況後，要交代由此產生的常見看法時。',[['Many people therefore believe that ','link','由背景轉述常見看法'],['ambition is indispensable to achievement.','slot','由前述觀察引出的看法']])),
  S('I completely agree, because regular practice gives learners both stronger memory and the confidence to speak until new words become useful in conversation.','because 指出同意的理由，both...and 並列兩種助力，until 指向成果。','這句用雙重助力支持立場並指向成果，不只是轉述他人看法。',[1,4,8],
    F('I completely agree, because [特質] gives people both [持續能力] and [改進動力] until [機會變成成果]','先亮出完全同意，再列同一特質提供的兩種作用，並把它們連到可見成果。','引言要以兩條可分開展開的機制預告正文時。',[['I completely agree, because ','link','表明立場並引出理由'],['ambition','slot','特質'],[' gives people both ','link','並列兩項作用'],['the endurance to continue through difficulty','slot','持續能力'],[' and ','link','接第二項作用'],['the drive to improve','slot','改進動力'],[' until ','link','指出達成結果的進程'],['opportunities become tangible results.','slot','機會變成成果']])),
  S('The first reason patient teaching matters is that it keeps children practising over many months.','is that 將首項理由具體化為長期維持練習。','這句點明第一個主體段的核心原因，沒有並列兩項作用。',[1,2,6],
    F('The first reason [特質] is essential is that it sustains [必要行動] over [較長時間]','用 is that 清楚指出第一理由的機制：某特質讓需要的努力延續。','第一主體段要從引言的兩條理由中展開其中一條時。',[['The first reason ','link','引出第一理由'],['ambition','slot','特質'],[' is essential is that it sustains ','link','指出持續作用'],['effort','slot','必要行動'],[' over ','link','指出持續時間'],['long periods of time.','slot','較長時間']])),
  S('Learning to play an instrument normally demands practice, and serious pupils are more willing to give up free evenings in order to improve.','normally demands...and...in order to 連起要求、付出的代價與目標。','這句說明目標需要甚麼品質，以及人為何願意付出代價。',[2,3,8],
    F('[有價值目標] normally demands [必要品質], and [有強烈目標者] are more willing to [承受不便] in order to [達成目標]','先說成功需要紀律，再說有抱負者願意承擔不便，因為他們有目標。','要解釋抽象目標如何轉化為每天具體付出的時間與代價時。',[['Real success','slot','有價值目標'],[' normally demands ','link','提出要求'],['discipline','slot','必要品質'],[', and ','link','接人的行為'],['ambitious people','slot','有強烈目標者'],[' are far more willing to ','link','表達較高意願'],['tolerate inconvenience','slot','承受不便'],[' in order to ','link','指出目的'],['reach a goal.','slot','達成目標']])),
  S('A runner preparing for a difficult race, for example, may train before work, skip some parties and keep practising for months.','for example 引出具體人物；may 列出可能的持續投入。','這句以一個具體人物和三項行動展示長期代價，不是在下抽象判斷。',[3,4,7],
    F('[為目標努力的人], for example, may [持續行動一], [減少享樂二] and [長期練習三]','用一名學生及多項日常行動展示「願意忍受不便」如何具體發生。','提出長期紀律與代價後，要用可信的人物例子使其可見時。',[['A student aiming for a highly competitive scholarship','slot','為目標努力的人'],[', for example, may ','link','引出可能行動'],['spend evenings revising','slot','持續行動一'],[', ','link','並列'],['reduce social activities','slot','減少享樂二'],[' and ','link','並列'],['practise under constant pressure for months.','slot','長期練習三']])),
  S('Just as importantly, a clear goal helps athletes recover from injuries instead of ending their plans after one bad season.','instead of 對照遭挫後的兩種選擇：恢復再試與放棄。','這句先標示同等重要的另一作用，再對照兩個不同後續行動。',[4,5,8],
    F('Just as importantly, [推動因素] helps [人] recover from [挫折] instead of [過早放棄]','Just as importantly 轉入同等重要的作用；instead of 對照受挫後繼續與放棄兩種行動。','要對照一個因素使人從挫折中恢復，而非過早放棄時。',[['Just as importantly, ','link','引出同等重要作用'],['ambition','slot','推動因素'],[' helps ','link','指出作用'],['people','slot','人'],[' recover from ','link','從挫折中恢復'],['setbacks','slot','挫折'],[' instead of ','link','對照不採取的行動'],['abandoning their plans at the first disappointment.','slot','過早放棄']])),
  S('When a young musician performs badly at a first concert, a clear goal encourages practice rather than an immediate decision to quit.','When 設定失敗情況，rather than 對照反思再試與立即退出。','這句在具體挫敗下比較兩種反應，不是泛稱面對挫折的能力。',[5,6,8],
    F('When [具體受挫情況], [推動因素] encourages [檢查問題並再試] rather than [認定不能成功]','把抽象的「從挫折恢復」落到模擬考失利後的兩種可見反應。','已提出某品質有助從挫折恢復，要用同一人物展示下一步行動時。',[['When ','link','設定具體受挫情況'],['such a student performs badly in an early mock exam','slot','具體受挫情況'],[', ','link','接反應'],['ambition','slot','推動因素'],[' encourages them to ','link','促使採取行動'],['analyse weaknesses and try again','slot','檢查問題並再試'],[' rather than ','link','對照被避免的反應'],['conclude that success is impossible.','slot','認定不能成功']])),
  S('Because learning a language involves mistakes and repeated practice, continuing after a weak test result is necessary; it is part of progress.','Because 統合先前例子，分號後再強化必要性。','這句由常見失敗推到堅持的必要性，未列出具體個案。',[2,5,7],
    F('Because [有價值成果通常經過代價與失敗], [持續行動] is not optional; it is fundamental','把例子的意義提升為一般原則：若成果常在代價與失敗後出現，堅持便不可缺。','用例子展示持續努力後，要收束首段的因果關係時。',[['Because ','link','提出普遍原因'],['achievement usually comes after sacrifice and failure','slot','有價值成果通常經過代價與失敗'],[', ','link','推出判斷'],['this kind of persistence','slot','持續行動'],[' is not optional; it is fundamental.','link','強調必要性']])),
  S('Curiosity is equally important because it pushes students beyond memorising answers.','because 引出第二主體段的另一作用：超越最低要求。','這句由先前的堅持轉向能力提升，沒有重述第一段的失敗例子。',[3,8,10],
    F('[推動因素] is equally important because it pushes [人] beyond [僅僅達標的程度]','第二主體段把焦點從能否堅持，轉到是否會主動超越「夠用」的水平。','完成首項理由後，第二段要展開另一種機制時。',[['Ambition','slot','推動因素'],[' is equally important because it pushes ','link','指出第二項作用'],['people','slot','人'],[' beyond ','link','超越'],['mere competence.','slot','僅僅達標的程度']])),
  S('Dedicated volunteers do not simply repeat last year’s plan; they seek better methods and take harder tasks.','do not simply...; they... 對照被動重複與主動改進。','這句用分號對照兩種行動，具體展開「不只夠用」。',[6,9,11],
    F('Those who [真正想達成目標] do not simply [重複熟悉做法]; they actively seek [更好方法、更高標準與更難責任]','分號兩邊形成對照：不滿足於照舊做，而是主動提高方法、標準與承擔。','要把「超越基本要求」具體化為可觀察的改進行動時。',[['Those who ','link','限定討論的人'],['genuinely want to succeed','slot','真正想達成目標'],[' do not simply ','link','否定被動做法'],['repeat familiar routines','slot','重複熟悉做法'],['; they actively seek ','link','轉向主動改進'],['better methods, higher standards and more demanding responsibilities.','slot','更好方法、更高標準與更難責任']])),
  S('A serious cook, for instance, is more likely to test new recipes, ask diners for comments and practise presentation in order to run a better restaurant.','more likely to 審慎列出具體改進行動；in order to 指向目標。','這句以人物、三項準備及目的展示改進，不是一般性的分號對照。',[9,10,12],
    F('[有抱負的工作者], for instance, is more likely to [學新工具], [要求回饋] and [強化技能] in order to [準備晉升]','用員工學工具、求意見和改善溝通的例子，展示目標如何促進技能提升。','提出一類人會改進後，要列出能代表改進的實際行動時。',[['An ambitious employee','slot','有抱負的工作者'],[', for instance, is more likely to ','link','審慎提出具體例子'],['learn new software','slot','學新工具'],[', ','link','並列'],['request feedback','slot','要求回饋'],[' and ','link','並列'],['strengthen communication skills','slot','強化技能'],[' in order to ','link','交代目的'],['prepare for promotion.','slot','準備晉升']])),
  S('Interest in science also makes pupils alert to experiments that less curious classmates often ignore.','makes...alert to 連接推動因素與察覺機會；that 限定被忽略的機會。','這句著眼於識別別人可能錯過的機會，而非技能訓練本身。',[9,10,11],
    F('[推動因素] also makes [人] alert to [某些機會] that [動力較低者] often ignore','從培養技能轉到留意機會；that 指明這些機會也是別人容易忽略的。','已說明如何提升能力，還要解釋人如何發現應用能力的機會時。',[['Ambition','slot','推動因素'],[' also makes ','link','促成新的警覺'],['people','slot','人'],[' alert to ','link','注意到'],['opportunities','slot','某些機會'],[' that ','link','限定這些機會'],['less driven individuals','slot','動力較低者'],[' often ignore.','link','往往忽略']])),
  S('The same student may join a difficult science project or share an idea with teachers, thereby gaining experience and attention.','may 審慎提出可能行動；thereby 指出由行動得到的兩項結果。','這句把察覺機會落到具體參與與所得，不只說會注意。',[11,12,14],
    F('The same [人] may [主動承擔難事] or [提出新構想], thereby gaining both [經驗] and [被看見的機會]','以同一人物延續前例，說明怎樣採取行動，並以 thereby 表明所得結果。','指出人會看見機會後，要展示如何把機會轉成經驗與成果時。',[['The same ','link','延續前一例子'],['worker','slot','人'],[' may ','link','提出可能行動'],['volunteer for a difficult project','slot','主動承擔難事'],[' or ','link','提供另一行動'],['propose an innovative idea to senior managers','slot','提出新構想'],[', thereby gaining both ','link','推出雙重所得'],['experience','slot','經驗'],[' and ','link','並列'],['visibility.','slot','被看見的機會']])),
  S('As a result, regular practice does not just sharpen a pupil’s skills; it puts those skills on show where teachers can notice and value them.','not just...; it... 把能力提高與使能力被看見區分開來。','這句從前述行動推到兩種不同作用：改善能力並使其有機會被認可。',[10,12,13],
    F('As a result, [推動因素] does not just improve [能力]; it places that ability in situations where it can be [看見並回報]','總結第二段的兩層作用：抱負既提升能力，也使能力有被認可及回報的場合。','已舉出兩類行動，要說明它們合起來為何促成成果時。',[['As a result, ','link','從前述行動得出結果'],['ambition','slot','推動因素'],[' does not just improve ','link','第一層作用'],['a person’s ability','slot','能力'],['; it places that ability in situations where it can be ','link','第二層作用：進入可見場景'],['recognised and rewarded.','slot','看見並回報']])),
  S('In conclusion, I completely agree that patient practice is essential for learning a language.','結論直接重申立場與必要條件，沒有加入新理由。','這句是結論中的立場重申，未列出四個形成成果的條件。',[1,9,16],
    F('In conclusion, I completely agree that [核心特質] is essential for [目標]','結論直接回到題目，清楚重申「完全同意」與核心判斷，不引入新材料。','兩段理由已論證完，要用一句話先回答題目的同意程度時。',[['In conclusion, I completely agree that ','link','重申完全同意'],['ambition','slot','核心特質'],[' is essential for ','link','說明必要關係'],['success.','slot','目標']])),
  S('It helps learners practise regularly, learn from mistakes, try better methods and use new chances, and these are the conditions in which progress becomes possible.','四項行動回收兩段理由，and these are... 說明它們構成成果條件。','這句列出幾項作用並作歸納，不只是重申同意程度。',[2,8,15],
    F('It enables [人] to [承受代價], [失敗後恢復], [追求改進] and [把握機會], and these are precisely the conditions in which [成果] becomes possible','結論把堅持與提升兩段的四個作用併列，再說明它們如何使成果有可能。','最後一句要回收兩條理由，不增添新例子，並指出成果形成的條件時。',[['It enables ','link','指回核心特質的作用'],['people','slot','人'],[' to ','link','引出四種行動'],['endure sacrifice','slot','承受代價'],[', ','link','並列'],['recover from failure','slot','失敗後恢復'],[', ','link','並列'],['pursue improvement','slot','追求改進'],[' and ','link','並列'],['seize opportunities','slot','把握機會'],[', and these are precisely the conditions in which ','link','歸納成功條件'],['meaningful achievement','slot','成果'],[' becomes possible.','link','指出可能性']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者如何判斷抱負對有意義的成功是否重要？',[
    '完全同意它重要：抱負支持人在困難中堅持，亦推動人改進和把握機會',
    '完全反對：成功只由偶然機會決定，努力沒有作用',
    '只同意抱負有助練習，但認為它會阻礙人看見機會',
    '沒有表態：文章只描述幾份工作的名稱',
  ],'引言與結論都說 completely agree；兩段分別分析堅持與超越「僅僅勝任」。'),
  {type:'multi',prompt:'選出正文的兩條不同論證線',detail:'選兩項，再按「確認」。',options:[
    '抱負令人願意長期付出，受挫後分析弱點並再次嘗試',
    '抱負推動人學新方法、提升能力，並主動把握可被看見的機會',
    '抱負保證人在第一次嘗試時絕不失敗',
    '抱負只等於職位名稱，與日常行動無關',
  ],correct:[0,1],why:'第一主體段談獎學金準備和模擬考失利；第二主體段談員工學技能、主動承擔並獲得曝光。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 立場與兩項作用','完全同意抱負重要，因它給人堅持的耐力和改進的動力。'],
  ['主體段一 · 長期堅持','獎學金申請者為目標持續練習，模擬考失利後分析弱點再試。'],
  ['主體段二 · 改進與機會','員工學技能、要求回饋，並主動接難項目，使能力能被看見。'],
  ['結論 · 成果形成條件','重申完全同意，歸納付出、從失敗恢復、改進和把握機會。'],
],'持續投入與受挫再試 → 主動改進與抓住機會 → 有意義的成果才可能出現。')];
const evidence=[
  Q('為甚麼第一主體段說抱負能維持長時間的努力？',[
    '有強烈目標的人較願意承受不便，持續做達成目標所需的事',
    '抱負令任何目標立即完成，毋須紀律',
    '有抱負者一定不用犧牲社交或休息時間',
    '文章認為長期練習與有意義的成功完全無關',
  ],'原文說 Real success normally demands discipline，並指出 ambitious people 更願意 tolerate inconvenience。'),
  Q('獎學金學生的例子具體列出哪些付出？',[
    '晚上溫習、減少社交、在壓力下練習數月',
    '只在頒獎前一天看一眼申請表',
    '依靠他人替自己參加所有練習',
    '完全放棄獎學金目標以避免任何不便',
  ],'例子同時列時間、社交和長期壓力的代價，使「紀律」可見。'),
  Q('學生早期模擬考表現欠佳時，抱負促使甚麼反應？',[
    '分析弱點並再試，而非立即認定自己不可能成功',
    '因一次失利便停止所有準備',
    '只重複同一錯誤，不檢視弱點',
    '保證下一次考試必然取得第一名',
  ],'原文的 analyse weaknesses and try again 與 conclude that success is impossible 形成對照。'),
  Q('「超越僅僅勝任」在員工例子中是甚麼行動？',[
    '學新軟件、要求回饋、改善溝通，為晉升作準備',
    '只重複自己已熟悉的做法，不聽意見',
    '每天更換職位名稱，但不學任何新技能',
    '把改善溝通視為與職場發展完全無關',
  ],'第二主體段由 better methods 等一般原則，轉到員工的三項具體改進。'),
  Q('為甚麼光有更好的能力，仍不等於能力會被認可？',[
    '人還要主動接項目或提出構想，讓能力出現在可被看見的場合',
    '能力一提高，所有主管便必然即時知道',
    '員工越少參與工作，能力就越容易獲得認可',
    '文章認為曝光機會會自動降低一切技能',
  ],'結尾的 not just improve...; it places that ability in situations where... 把能力培養與可見性分開。'),
  Q('結論列出的四項作用如何對應正文？',[
    '承受犧牲與從失敗恢復對應第一段；追求改進與把握機會對應第二段',
    '四項都只指公司薪金，與學生或員工行動無關',
    '四項都在要求人停止練習和拒絕新項目',
    '結論首次提出完全陌生的第四個主題',
  ],'最後一句依序回收 endure sacrifice、recover from failure、pursue improvement、seize opportunities。'),
];
const logic=[
  sequence('第一主體段：抱負如何支持長期堅持？',[
    ['首項理由','抱負使人長時間維持努力。'],
    ['必需代價','成功需要紀律；有目標者較願意承受不便。'],
    ['學生例子','為競爭激烈的獎學金，學生晚上溫習、減少社交，練習數月。'],
    ['受挫情況','學生在早期模擬考中表現欠佳。'],
    ['下一步','分析弱點、再次嘗試，不因一次失望便放棄。'],
    ['段落結論','成果常在犧牲與失敗後出現，因此堅持不可缺。'],
  ],'抱負 → 願意長期付出 → 失敗後仍分析再試 → 堅持成為成果的必要條件。'),
  sequence('第二主體段：抱負如何把能力變成成果？',[
    ['新理由','抱負推人超越僅僅勝任的水平。'],
    ['改進行動','主動尋找更好方法、更高標準和更難責任。'],
    ['員工例子','學新軟件、要求回饋、改善溝通，準備晉升。'],
    ['機會意識','留意較少動力者容易忽略的機會。'],
    ['主動參與','請纓難項目或向管理層提出新意見。'],
    ['雙重結果','能力提高，也進入能被看見與獲得回報的場合。'],
  ],'不滿足於現狀 → 提升技能 → 看見並主動接住機會 → 能力獲認可。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一名學生想獲得需要全年準備的交換名額，但最近幾週成績還未改善。','哪項最能運用「長時間維持努力」的論證？',[
    '訂下每週練習與檢討計畫，持續觀察進步，而非只憑一週成績判斷',
    '只在申請前一晚準備，因短期衝刺等同全年紀律',
    '只談交換名額的重要，卻不安排任何日常練習',
    '因數週未見改善，便斷定全年準備不可能有成果',
  ],[
    '這把強烈目標轉成持續行動，保留原文的長期努力機制。',
    '一晚準備不能代替長期練習。',
    '目標本身不等於實際行動。',
    '短期成績不能證明長期努力無效。',
  ],[2,3,4,5],'範文以獎學金學生的長期溫習與社交取捨，說明抱負如何維持努力。'),
  T('一名初學游泳者第一次比賽成績很差，卻仍想完成更長的賽程。','哪項下一步最符合範文的「從挫折恢復」？',[
    '檢視起跳與換氣問題，調整訓練後再參賽',
    '不看比賽紀錄，只維持完全相同的錯誤動作',
    '因一次比賽失利，立即認定自己永遠無法進步',
    '只說想進步，卻取消往後所有練習',
  ],[
    '這對應失利後分析弱點並再試的具體次序。',
    '原文強調分析弱點，不只是機械重複。',
    '一次失利不能證明成功不可能。',
    '目標若不化成再試便不能產生作用。',
  ],[6,7,8],'範文用模擬考表現差的學生，對照「分析弱點再試」與「認定不可能」。'),
  T('某員工多年完成本職工作，但希望申請需要新技能的職位。','哪項最能把抱負轉成「超越僅僅勝任」？',[
    '學相關軟件、向同事求回饋，並練習新職位需要的溝通方式',
    '只把個人目標寫在履歷上，不更新技能',
    '繼續完全相同的工作方法，同時假定能力已自動提高',
    '避開所有回饋，因指出弱點會妨礙改進',
  ],[
    '這把晉升目標連到三項可觀察的技能改進。',
    '宣稱目標不等於做好準備。',
    '重複熟悉做法不會自動滿足新職位要求。',
    '回饋是原文員工主動尋求的改進資料。',
  ],[9,10,11],'範文指出有抱負員工學軟件、求回饋、改善溝通以準備晉升。'),
  T('一名學生擅長寫程式，但校內作品一直沒有人看過；最近出現公開專題機會。','哪項最能運用「能力需要被看見」？',[
    '參與專題並展示作品，同時用評語繼續改善程式',
    '只在私下修改程式，並拒絕任何可展示成果的機會',
    '只報名專題，不準備可展示的實際作品',
    '認為技能一提高，所有人就必定已知道',
  ],[
    '這同時保留能力改進和把能力放進可被看見的情境。',
    '私下改進技能未必帶來認可機會。',
    '曝光須有實際能力或作品支撐。',
    '他人不一定會自動看見私下的改進。',
  ],[11,12,13,14],'範文說抱負既提升能力，也使能力進入可被認可的場合。'),
  T('一名年輕廚師希望成為主廚，已反覆煮熟悉的菜式，但從不詢問食客意見。','哪項最貼近範文的改進邏輯？',[
    '嘗試更好的做法、請人評價成品，再承擔較難的菜單工作',
    '只增加同一道菜的份量，便視為方法已進步',
    '完全避開批評，因回饋與技能提升沒有關係',
    '只等待主廚職位出缺，不做任何準備',
  ],[
    '這對應新方法、回饋與更難責任三項主動行動。',
    '數量增加不等於方法或標準提高。',
    '原文把要求回饋列為改進途徑。',
    '職位空缺不會自動帶來所需能力。',
  ],[9,10,11],'範文區分重複熟悉做法與主動找更好方法、更高標準和更難責任。'),
  T('志願者想改善社區圖書館，提出長期計畫後，首次活動只來了少量居民。','哪項最能結合抱負與現實調整？',[
    '查詢居民未參加的原因，調整活動並繼續推行一段時間',
    '把一次參與人數少當作計畫永遠不可能成功的證明',
    '只重做完全相同的活動，不問哪一步出了問題',
    '因有長期目標，便認為活動成效毋須再觀察',
  ],[
    '這將持續投入與檢討弱點合起來，而不把抱負當保證。',
    '一次失利不足以判定長期目標不可能。',
    '反思弱點是原文受挫再試的核心。',
    '抱負仍須與實際表現資料配合。',
  ],[3,6,7,8],'範文指出抱負使人長期努力，遇初次失敗後分析弱點而非放棄。'),
  T('一名護士想轉入管理工作，院方正在徵求可負責小型改善項目的人。','哪項最能把「改進」與「機會」兩段接起來？',[
    '先學必要管理技能並請教同事，再主動申請帶領改善項目',
    '只學技能，並避開所有可運用技能的工作',
    '只報名領導項目，不了解需要掌握甚麼技能',
    '只向院方說自己有抱負，卻不提出任何行動',
  ],[
    '技能準備與實際承擔相接，能力才有機會被看見。',
    '有技能但不用於機會，可能難獲認可。',
    '只求曝光而不作準備，缺少能力基礎。',
    '抱負須透過具體改進與參與發揮作用。',
  ],[10,11,12,13,14],'範文的員工先學新軟件、求回饋，再接難項目取得經驗與曝光。'),
  T('一名樂手為演出練習數月，首場表現欠佳，但演出機構仍提供第二次試演。','哪項最完整套用第一主體段？',[
    '保留長期練習，分析首演問題，並為第二次試演調整做法',
    '因已練習數月，便認為首場表現不需檢討',
    '因首場欠佳，便取消往後全部練習和試演',
    '只要求更多試演機會，不改善演出內容',
  ],[
    '這兼顧長期付出與受挫後的具體修正。',
    '持續投入仍須配合分析弱點。',
    '第一次失望不是立即放棄的充分理由。',
    '機會只有配合改進才更可能轉成成果。',
  ],[4,5,6,7,8],'範文第一段既談長期練習，也談模擬考失利後分析弱點再試。'),
  T('一名研究生看見跨學科研究徵集，題目困難但與自己的新技能有關。','哪項最能轉用「留意並把握機會」？',[
    '評估所需工作後申請，並在項目中累積經驗及展示技能',
    '因題目困難便不讀要求，直接認定自己沒有可能參與',
    '只私下練習技能，卻從不留意任何可參與的項目',
    '不準備相關技能，只希望參與便保證得到認可',
  ],[
    '這把察覺機會、主動承擔與能力被看見連起來。',
    '題目困難不等於毋須了解條件。',
    '技能與可運用技能的場合都重要。',
    '參與不保證回報，仍需要相關準備。',
  ],[12,13,14],'範文以主動請纓艱難項目，說明如何取得經驗與可見性。'),
  T('一間小型劇團想吸引更廣觀眾，團員技術穩定，但一直演出同一套舊節目。','哪項最能運用「超越僅僅勝任」？',[
    '試驗新演法、徵求觀眾回饋，再承擔更具挑戰的演出',
    '只重複舊節目，因技術穩定便不需要改進',
    '只提高宣傳預算，卻不觀察節目或演法能否改善',
    '把觀眾回饋視為必須完全避免的干擾',
  ],[
    '這把主動找新方法、較高標準和更難責任轉用到表演。',
    '穩定勝任與繼續提高不是同一回事。',
    '宣傳可增加曝光，但這裡要檢驗能力改進。',
    '回饋能協助判斷應如何調整。',
  ],[9,10,11],'範文說真正想成功的人不只重複熟悉做法，而會找更好方法及更高標準。'),
  T('一位學生說「我有抱負，所以一定會成功」，卻沒有安排練習或參與任何專題。','哪項回應最符合文章的實際論證？',[
    '抱負要化成持續練習、遇錯再試、改善技能及把握機會，才可能產生成果',
    '只要說出抱負，四項行動就會自動發生',
    '沒有參與專題也沒有練習，能力仍必然被看見',
    '因抱負重要，便可把所有失敗和回饋完全忽略',
  ],[
    '這把結論四項作用還原成可執行行動，並保留「可能」而非保證。',
    '宣稱有抱負不能代替行動。',
    '能力與曝光都需要具體條件。',
    '文章正強調從失敗學習。',
  ],[2,7,10,13,14,16],'範文結論把犧牲、從失敗恢復、改進及把握機會列為成果形成的條件。'),
  T('一名教師想推動閱讀計畫：前期要額外備課，試行後可能須改動方法，並可向全校分享。','哪項行動順序最貼近兩個主體段？',[
    '先持續備課與試行，根據反饋修正，再主動分享有效做法',
    '只向全校宣布目標，省略備課、試行與回饋',
    '首次試行不順便立即停止，也不檢查原因',
    '只長期備課，不檢驗方法或讓他人看見成果',
  ],[
    '這將承受代價、從失敗調整、改善方法和抓住展示機會依序連接。',
    '宣布目標不能代替實施過程。',
    '遇挫後的分析再試是第一段重點。',
    '第二段還要求改進和把能力置於可見場合。',
  ],[4,6,7,10,12,13,14,16],'範文兩段由堅持與受挫再試，推進到改進方法及主動把握機會。'),
];
const reviewedTransferOptions=[
  ['定每週練習與檢討計畫，持續觀察進步','只在申請前一晚準備，當作全年都有紀律','只談交換名額重要，不安排任何日常練習','數週未見改善，便斷定全年準備都無用'],
  ['檢視起跳與換氣問題，調整訓練後再參賽','不看比賽紀錄，只重複同一套錯誤動作','一次比賽失利，便認定自己永遠無法進步','只說想進步，卻取消往後的全部練習'],
  ['學軟件、求回饋，並練習新職位的溝通要求','只把目標寫在履歷上，不更新任何技能','繼續原有方法，卻假定能力已經自動提高','避開所有回饋，認為指出弱點妨礙改進'],
  ['參與專題展示作品，並用評語改善程式','只在私下修改程式，拒絕展示成果的機會','只報名專題，不準備任何可展示的作品','技能一有提高，便斷言所有人必定知道'],
  ['試更好做法、請人評價，再承擔較難的菜單工作','只增加同一道菜份量，便認為方法已進步','完全避開批評，因回饋與技能提升無關','只等主廚職位出缺，自己不作任何準備'],
  ['查明居民缺席原因，調整活動並繼續試行','把一次參與者少當作計畫必然永遠失敗','只重做相同活動，不問哪一步出現問題','有長期目標，便認為毋須再觀察活動成效'],
  ['先學管理並請教同事，再申請帶領改善項目','只學技能，卻避開所有實際運用機會','只報名領導項目，不了解所需管理技能','只向院方說有抱負，卻不提出具體行動'],
  ['維持練習，分析首演問題，為下次試演調整','已練習數月，便認為首場表現不需檢討','因首演欠佳，便取消以後所有練習與試演','只要求更多試演機會，不改善演出內容'],
  ['評估所需工作後申請，並用項目展示技能','題目困難，便不讀要求而直接放棄參與','只私下練技能，從不留意可參與的項目','不準備技能，只希望參與便保證獲認可'],
  ['試新演法、徵求觀眾回饋，再接更難演出','只重複舊節目，認為技術穩定便不用改進','只提高宣傳預算，不查節目演法能否改善','把觀眾回饋當作必須完全避免的干擾'],
  ['把抱負化成練習、修正、改進與把握機會','只要說出抱負，所有行動便會自動發生','沒有練習也不參與，能力仍必定被看見','因抱負重要，便可完全忽略失敗與回饋'],
  ['先備課試行，據回饋修正，再分享有效做法','只向全校宣布目標，省略備課試行與回饋','首次試行不順便停下，也不檢查原因','只長期備課，不檢驗方法或展示成果'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
structures[0].example='In most workplaces, a useful skill does not happen by accident.';
structures[1].example='Many people therefore believe that daily reading helps children build confidence.';
structures[2].example='I completely agree, because regular practice gives people both stronger memory and the confidence to speak until new words become useful in conversation.';
structures[3].example='The first reason patient teaching is essential is that it sustains children’s effort over many months.';
structures[4].example='Learning to play an instrument normally demands practice, and serious pupils are far more willing to give up free evenings in order to improve.';
structures[6].example='Just as importantly, a clear goal helps people recover from injuries instead of ending their plans after one bad season.';
structures[7].example='When young musicians perform badly at first concerts, a clear goal encourages them to practise rather than quit.';
structures[8].example='Because learning a language involves mistakes and repeated practice, continuing after a weak test result is not optional; it is fundamental.';
structures[10].example='Those who volunteer regularly do not simply repeat last year’s plan; they actively seek better methods and harder tasks.';
structures[13].example='The same student may join a difficult science project or share an idea with teachers, thereby gaining both experience and attention.';
structures[14].example='As a result, regular practice does not just improve a pupil’s writing; it places that ability in situations where it can be noticed and valued.';
structures[16].example='It enables learners to practise regularly, learn from mistakes, pursue improvement and seize opportunities, and these are precisely the conditions in which meaningful progress becomes possible.';
const plausibleAlternatives=[
  [['先安排每週練習，檢討可待申請失敗後再做','數週未見改善，便改以短期衝刺替代全年準備','目標需要全年投入，因此可先不追蹤進度'],['定期檢討有助調整長期投入。','短期衝刺不足以代替持續努力。','觀察進步才能判斷策略是否有效。']],
  [['分析比賽失誤，再延後下一次訓練','再次參賽能增經驗，原有動作可照舊','首賽失利後宜先改練較短的賽程'],['反思還須接上調整後的練習。','不修正起跳和換氣便難改進。','一次失利不必改掉長程目標。']],
  [['學新軟件有幫助，溝通技能可待晉升後再練','先申請職位，面試結果再決定要否學新技能','原有工作能勝任，回饋便可暫時省去'],['新職位要求的能力應提早準備。','把抱負轉行動需在機會前積累能力。','持續改進仍需了解不足。']],
  [['參與專題能曝光，作品可在展示後再準備','程式能力已提升，評語便較少影響後續改進','先向同學宣傳自己，再看有沒有專題內容'],['展示機會要有實際作品支撐。','公開回饋可進一步改善能力。','宣傳不能代替可見的成果。']],
  [['請食客評價菜式，較難菜單可等升職後再試','試新做法後，回饋可由廚師本人自行推測','主廚職位將開放，現有菜式可繼續照舊'],['挑戰更難工作也是改進的一部分。','外部回饋能指出盲點。','抱負需配合技能進步與主動承擔。']],
  [['分析居民缺席原因，調整活動可等下年再做','少人參與後，先加活動宣傳而不問原因','目標較長遠，首次活動可不記錄成效'],['要根據發現及時改進並再試。','宣傳未必是缺席的真正原因。','抱負不代表可以忽略實際回饋。']],
  [['先學管理技能，項目機會可留給更有經驗者','先申請改善項目，管理能力再慢慢準備','請教同事有用，正式申請則可待明年'],['能力也需要在機會中展示。','沒有準備便承擔項目較難成功。','現有機會可連接學習與實作。']],
  [['維持練習，首演問題可留到下一次再看','分析首演問題，但第二次試演可先放棄','再爭取試演機會，訓練內容仍照舊'],['要從失敗中調整下一次準備。','受挫後再試是主體段的論點。','機會需配合改進，不只是重複。']],
  [['題目困難，可先私下練習而不提交申請','把握徵集機會，所需技能可到入選後再學','先提交想法，項目要求可留待面試再讀'],['只私下準備未把能力放進機會中。','應評估能力與工作要求後再申請。','未看要求容易錯過合適準備。']],
  [['試新演法，觀眾反應可等票房下滑再問','回饋有用，較難演出應由大型劇團承擔','技術已穩定，提升觀眾量主要靠加宣傳'],['主動徵求回饋能及早改善。','挑戰新任務是超越勝任的表現。','演法與內容改進也是吸引觀眾的方法。']],
  [['抱負可提供方向，練習安排可等機會後再訂','努力練習有用，失敗後修正可視為次要','把握專題能曝光，技能可留待獲選後再學'],['方向仍須轉化為持續行動。','從錯誤中調整是文章的核心環節。','先準備能力，才較能用好機會。']],
  [['先備課試行，方法可由教師單獨評定','據回饋修正計畫，成果可留在班內','先向全校分享目標，再決定是否試行'],['使用者回饋可揭示需調整之處。','展示有效成果是把握機會的一環。','未試行便分享，缺少實際成效。']],
];
plausibleAlternatives.forEach(([options,reasons],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...reasons);});
export default {
  key:'opinion:13',
  meta:{topic:'抱負、持續努力與把握機會',summary:'作者完全同意抱負對成功重要：它幫助人長期投入、受挫後再試，也促進技能改進、主動承擔，使能力有機會被看見與回報。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
