const simple=[
  'Family and school both affect a person’s future, but I strongly agree that values learned at home matter more for success over many years than school subjects or skills.',
  'This is because family values build habits inside a person that guide how they use what they learn later.',
  'First, being able to work hard, take responsibility, tell the truth, and keep trying gives people a base for success.',
  'Schools can teach maths, science, and writing, but these skills help only if a person keeps using them in the right way.',
  'A student raised in a family that thinks hard work matters is more likely to study often, learn from feedback, and carry on after bad marks.',
  'But a person with knowledge and little control over their actions may miss chances, stop trying too soon, or try easy but unfair ways.',
  'So family values are like a tree’s roots: hard to see at first, but very important during hard times.',
  'Second, success as an adult depends a lot on how a person treats other people.',
  'People often first learn to respect others, care about their feelings, wait patiently, and keep their word through daily life with family members.',
  'Later, these ways of acting affect friends, working with a team, leading others, and trust at work.',
  'For example, two people may finish university with similar qualifications, but the one who listens, treats workmates fairly, and does what they promise is more likely to be trusted and given responsibility at work.',
  'Job skills may help a person get started, but their character often decides whether they keep doing well.',
  'In short, I strongly agree that values learned at home affect later success more than skills or knowledge from school.',
  'Education is clearly useful, but without good values, people may not know how to use it well.',
  'Habits and ideas learned at home guide people at school, at work, and with others, so they are a deeper reason for long-lasting success.',
];
const vocabulary=[
  [['shape','affect','塑造'],['completely agree','strongly agree','完全同意'],['values learned from parents and family','values learned at home','家庭習得的價值觀'],['greater influence','matter more','影響更大'],['long-term success','success over many years','長遠成功'],['academic skills or classroom knowledge','school subjects or skills','學校技能或知識']],
  [['form the inner habits','build habits inside a person','形成內在習慣'],['determine','guide','決定'],['whatever they later learn','what they learn later','日後所學']],
  [['discipline','being able to work hard','紀律'],['responsibility','take responsibility','責任感'],['honesty','tell the truth','誠實'],['perseverance','keep trying','毅力'],['foundation','base','基礎'],['achievement','success','成就']],
  [['mathematics','maths','數學'],['abilities','skills','能力'],['useful only when','help only if','只有在...才有用'],['character','right way','品格'],['apply them consistently','keeps using them','持續運用']],
  [['grows up in a family','raised in a family','在家庭長大'],['effort is valued','hard work matters','重視努力'],['more likely','more likely','更可能'],['revise regularly','study often','定期溫習'],['accept corrections','learn from feedback','接受改正'],['poor results','bad marks','差成績']],
  [['By contrast','But','相比之下'],['lacks self-control','little control over their actions','缺乏自制力'],['waste opportunities','miss chances','浪費機會'],['give up too quickly','stop trying too soon','過快放棄'],['look for shortcuts','try easy but unfair ways','尋找捷徑']],
  [['In this sense','So','從這角度看'],['roots of a tree','tree’s roots','樹根'],['invisible at first','hard to see at first','起初看不見'],['essential','very important','至關重要'],['when the weather turns rough','during hard times','困難來臨時']],
  [['Another reason','Second','另一原因'],['adult life','as an adult','成年生活'],['depends heavily','depends a lot','很大程度取決於'],['deal with others','treats other people','與人相處']],
  [['respect','respect others','尊重'],['empathy','care about their feelings','同理心'],['patience','wait patiently','耐性'],['reliability','keep their word','可靠性'],['daily interactions','daily life','日常互動'],['relatives','family members','親戚']],
  [['later affect','Later, these ways of acting affect','日後影響'],['friendships','friends','友誼'],['teamwork','working with a team','團隊合作'],['leadership','leading others','領導能力'],['professional trust','trust at work','職場信任']],
  [['graduates','people','畢業生'],['leave university','finish university','大學畢業'],['qualifications','qualifications','資歷'],['colleagues','workmates','同事'],['keeps promises','does what they promise','信守承諾'],['earn respect and responsibility','be trusted and given responsibility','贏得尊重及責任']],
  [['Technical knowledge','Job skills','專業知識'],['open the door','get started','打開機會之門'],['character','character','品格'],['stay in the room','keep doing well','保持成功']],
  [['In conclusion','In short','總結'],['fully agree','strongly agree','完全同意'],['family values','values learned at home','家庭價值觀'],['stronger influence','affect later success more','更強影響'],['school-based skills or knowledge','skills or knowledge from school','學校技能或知識']],
  [['undeniably useful','clearly useful','無疑有用'],['right values','good values','正確價值觀'],['a tool without direction','not know how to use it well','沒有方向的工具']],
  [['habits and principles','Habits and ideas','習慣和原則'],['formed at home','learned at home','在家形成'],['guide people through study, work, and relationships','guide people at school, at work, and with others','引導學習工作與人際'],['deeper source','deeper reason','更深層來源'],['lasting achievement','long-lasting success','持久成就']],
];
const chunkOverrides=[
  ['Family and school both shape a person’s future,','but I completely agree that the values learned from parents and family have a greater influence on long-term success than academic skills or classroom knowledge.'],
  ['This is because family values form the inner habits','that determine how people use whatever they later learn.'],
  ['First, values such as discipline, responsibility, honesty, and perseverance','are the foundation on which achievement is built.'],
  ['Schools can teach mathematics, science, or writing,','but these abilities are useful only when a person has the character to apply them consistently.'],
  ['A student who grows up in a family where effort is valued','is more likely to revise regularly, accept corrections, and keep going after poor results.'],
  ['By contrast, someone who has knowledge but lacks self-control','may waste opportunities, give up too quickly, or look for shortcuts.'],
  ['In this sense, family values are like the roots of a tree:','invisible at first, but essential when the weather turns rough.'],
  ['Another reason is that success in adult life','depends heavily on the way people deal with others.'],
  ['Qualities such as respect, empathy, patience, and reliability','are often first learned at home through daily interactions with parents, siblings, and relatives.'],
  ['These qualities later affect friendships, teamwork,','leadership, and professional trust.'],
  ['For example, two graduates may leave university with similar qualifications,','but the one who listens carefully, treats colleagues fairly, and keeps promises is far more likely to earn respect and responsibility at work.'],
  ['Technical knowledge may open the door,','but character often decides whether a person can stay in the room.'],
  ['In conclusion, I fully agree that family values have a stronger influence on future success','than school-based skills or knowledge.'],
  ['Education is undeniably useful,','but without the right values, it becomes a tool without direction.'],
  ['The habits and principles formed at home guide people through study, work, and relationships,','making them the deeper source of lasting achievement.'],
];
const simpleChunkOverrides=[
  ['Family and school both affect a person’s future,','but I strongly agree that values learned at home matter more for success over many years than school subjects or skills.'],
  ['This is because family values build habits inside a person','that guide how they use what they learn later.'],
  ['First, being able to work hard, take responsibility, tell the truth, and keep trying','gives people a base for success.'],
  ['Schools can teach maths, science, and writing,','but these skills help only if a person keeps using them in the right way.'],
  ['A student raised in a family that thinks hard work matters','is more likely to study often, learn from feedback, and carry on after bad marks.'],
  ['But a person with knowledge and little control over their actions','may miss chances, stop trying too soon, or try easy but unfair ways.'],
  ['So family values are like a tree’s roots:','hard to see at first, but very important during hard times.'],
  ['Second, success as an adult','depends a lot on how a person treats other people.'],
  ['People often first learn to respect others, care about their feelings, wait patiently, and keep their word','through daily life with family members.'],
  ['Later, these ways of acting affect friends, working with a team,','leading others, and trust at work.'],
  ['For example, two people may finish university with similar qualifications,','but the one who listens, treats workmates fairly, and does what they promise is more likely to be trusted and given responsibility at work.'],
  ['Job skills may help a person get started,','but their character often decides whether they keep doing well.'],
  ['In short, I strongly agree that values learned at home affect later success more','than skills or knowledge from school.'],
  ['Education is clearly useful,','but without good values, people may not know how to use it well.'],
  ['Habits and ideas learned at home guide people at school, at work, and with others,','so they are a deeper reason for long-lasting success.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Training and experience both matter, but I believe careful practice has a greater effect on long-term progress than one early success.','but 承認兩項因素；greater...than 清楚比較長期影響並表態。','不能把承認乙有作用誤讀成認為甲乙同等重要。',[1,3,12],F('[甲與乙] both shape [結果], but I agree that [甲] has a greater influence than [乙]','承認兩種因素都存在，再判斷哪一種影響較深。','題目要求比較兩項因素的影響力時，要先公平承認兩者再明確排序。',[['Family and school both shape a person’s future,','slot','兩種因素都影響結果'],[' but I completely agree that ','link','但明確贊同'],['the values learned from parents and family','slot','影響更深的因素'],[' have a greater influence on long-term success than ','link','對長期結果影響大於'],['academic skills or classroom knowledge.','slot','比較因素']])),
  S('This is because regular practice forms habits that guide how people solve unfamiliar problems.','This is because 承接立場；that determine how 交代較深影響發生的機制。','不能只重複「比較重要」，須解釋如何發生作用。',[0,2,7],F('This is because [因素甲] forms [深層習慣] that determine how [日後行為]','把比較判斷推進到可解釋的內在機制。','表態後，要解釋某因素為何能持續影響人們日後的行為時。',[['This is because ','link','說明原因'],['family values','slot','因素甲'],[' form ','link','形成'],['the inner habits','slot','深層習慣'],[' that determine how ','link','決定如何'],['people use whatever they later learn.','slot','日後行為']])),
  S('First, patience and regular practice are the foundation on which musical skill is built.','First 引首條理由；foundation on which 比喻較深層的基礎。','基礎重要並不代表後來的知識毫無價值。',[0,3,8],F('First, [幾項基本品質] are the foundation on which [成果] is built','指出一組品質是後續成果得以建立的條件。','開始第一理由時，要指出某項成果依賴哪些更基本的條件。',[['First, ','link','引出第一理由'],['values such as discipline, responsibility, honesty, and perseverance','slot','幾項基本品質'],[' are the foundation on which ','link','是...的基礎'],['achievement','slot','成果'],[' is built.','link','得以建立']])),
  S('A course can teach safety rules, but those rules help only when a worker follows them every day.','but 承認所教內容；only when 限定它何時轉成實際效用。','不是否認課堂知識，而是指出運用知識需要條件。',[2,4,5],F('[學習機構] can teach [知識或技能], but these are useful only when [人能持續運用]','區分學會內容與長期實際使用。','要承認某項知識有用，同時指出它產生效益所需的行為條件時。',[['Schools','slot','學習機構'],[' can teach ','link','可教授'],['mathematics, science, or writing','slot','知識或技能'],[', but these abilities are useful only when ','link','但只有在...時才有用'],['a person has the character to apply them consistently.','slot','人能持續運用']])),
  S('A trainee raised where effort is valued is more likely to practise regularly and continue after criticism.','who...where... 指出成長環境；more likely 保留可能性；三項習慣可觀察。','更可能持續努力，不等於每名學生都必然成功。',[3,5,10],F('A [受某種環境影響的人] is more likely to [幾項具體習慣]','展示抽象價值觀如何落成日常行動。','要用一個典型人物展示成長環境如何增加某種行為的可能性時。',[['A student who grows up in a family where effort is valued','slot','受某種環境影響的人'],[' is more likely to ','link','更可能'],['revise regularly, accept corrections, and keep going after poor results.','slot','幾項具體習慣']])),
  S('By contrast, a skilled worker who lacks self-control may miss deadlines, quit early, or ignore feedback.','By contrast 對照；but lacks... 指出即使有能力，仍可能缺少運用能力的條件。','may 保留可能性，沒有把知識不足者定性為失敗。',[3,4,6],F('By contrast, someone who has [能力] but lacks [關鍵品質] may [多項損失]','用反面對照檢驗前句的因果機制。','展示正面例子後，要用具備表面優勢卻欠缺關鍵條件的人作對比時。',[['By contrast, someone who has ','link','轉入對照'],['knowledge','slot','能力'],[' but lacks ','link','但缺乏'],['self-control','slot','關鍵品質'],[' may ','link','可能'],['waste opportunities, give up too quickly, or look for shortcuts.','slot','多項損失']])),
  S('In this sense, a reliable routine is like a building’s foundation: unseen at first, but essential during a crisis.','like...: 後用隱藏基礎比喻價值；but essential... 交代何時顯出作用。','比喻是總結前文機制，不能代替前面的實際例證。',[2,5,11],F('In this sense, [深層因素] are like [看不見的基礎]: invisible at first, but essential when [遇到考驗]','用具體圖像收束一項平常不易看見的作用。','解釋具體機制後，要用簡潔比喻說明隱藏條件在困難時的重要性時。',[['In this sense, ','link','由前文推論'],['family values','slot','深層因素'],[' are like ','link','就像'],['the roots of a tree','slot','看不見的基礎'],[': invisible at first, but essential when ','link','起初難見，考驗時關鍵'],['the weather turns rough.','slot','遇到考驗']])),
  S('Another reason is that progress in a team depends heavily on how members treat one another.','Another reason 清楚開第二條理由；depends heavily on 交代重要但非唯一條件。','第二理由是與人相處，不是重複首段的個人紀律。',[2,8,12],F('Another reason is that [某種成果] depends heavily on [與人相處方式]','從個人習慣轉向人際運作的另一理由。','完成個人層面的理由後，要另從人際關係如何影響成果展開時。',[['Another reason is that ','link','引出第二理由'],['success in adult life','slot','某種成果'],[' depends heavily on ','link','在很大程度取決於'],['the way people deal with others.','slot','與人相處方式']])),
  S('Qualities such as patience and reliability are often first learned at home through daily tasks with relatives.','such as 列品質；through daily interactions 指學習發生的途徑。','often 不是宣稱所有人只可能在家學會這些品質。',[4,7,9],F('Qualities such as [幾項品質] are often first learned [場所] through [反覆互動]','指出抽象品質可在甚麼環境經由甚麼經驗形成。','提出某些品質重要後，要列出品質及最初形成的日常途徑時。',[['Qualities such as ','link','列出品質'],['respect, empathy, patience, and reliability','slot','幾項品質'],[' are often first learned at home through ','link','往往先在家經由'],['daily interactions with parents, siblings, and relatives.','slot','反覆互動']])),
  S('These habits later affect friendships, teamwork, leadership, and trust at work.','These qualities 回指前句的品質；later affect 延伸到多個未來情境。','不是引入新價值觀，而是追蹤前句品質的後續影響。',[3,8,11],F('These [先前提到的品質] later affect [數個日後領域]','把形成階段與其後廣泛用途連起來。','已列某些品質如何形成，接着要列出它們在日後哪些範疇發揮作用時。',[['These qualities','slot','先前提到的品質'],[' later affect ','link','日後影響'],['friendships, teamwork, leadership, and professional trust.','slot','數個日後領域']])),
  S('Two applicants may have the same training, but the one who listens and keeps promises is more likely to earn trust at work.','may...but the one who...more likely... 用控制相近資歷的對比例子，突顯人際品質。','例子說更可能得到信任，不是保證所有管理者都會公平判斷。',[4,7,9],F('Two [資歷相近的人] may [條件相同], but the one who [具體品格行為] is more likely to [工作結果]','用相近條件的兩人對照，凸顯另一因素的影響。','要隔開兩人共有的表面優勢，透過行為差異顯示真正起作用的因素時。',[['For example, ','link','引出例子'],['two graduates','slot','資歷相近的人'],[' may ','link','可能'],['leave university with similar qualifications','slot','條件相同'],[', but the one who ','link','但其中...者'],['listens carefully, treats colleagues fairly, and keeps promises','slot','具體品格行為'],[' is far more likely to ','link','更可能'],['earn respect and responsibility at work.','slot','工作結果']])),
  S('A certificate may open the door, but reliability often decides whether a worker remains trusted.','may open the door...but...stay in the room 以進門與留下比喻入職和持續表現。','知識有初步作用，但不能單獨保證長期成果。',[6,10,13],F('[表面資格] may open the door, but [深層品質] often decides whether [長期結果]','用進門與留下的對比概括入場條件與持久條件。','要對比某因素幫人取得初步機會，另一因素決定能否長期維持時。',[['Technical knowledge','slot','表面資格'],[' may open the door, but ','link','可帶來機會，但'],['character','slot','深層品質'],[' often decides whether ','link','往往決定'],['a person can stay in the room.','slot','長期結果']])),
  S('In conclusion, I agree that everyday habits have a stronger influence on health than occasional advice.','In conclusion 直接重答比較題；stronger...than 保留比較對象。','結論說影響較強，不是說另一因素完全無用。',[0,11,14],F('In conclusion, I fully agree that [甲] has a stronger influence on [結果] than [乙]','結論直接重申對兩因素相對影響的判斷。','比較兩因素後，要在結論明確重答哪一方影響較大時。',[['In conclusion, I fully agree that ','link','重申立場'],['family values','slot','甲'],[' have a stronger influence on ','link','影響更大'],['future success','slot','結果'],[' than ','link','比較'],['school-based skills or knowledge.','slot','乙']])),
  S('Formal training is useful, but without steady practice, it can become a tool without direction.','but without... 先肯定乙有用，再指出欠缺關鍵條件時的局限。','這並非否定教育；是限定教育如何轉為成果。',[3,11,12],F('[某種工具] is useful, but without [關鍵條件], it becomes [缺乏方向的工具]','避免把比較寫成對其中一方的全面否定。','結尾承認次要因素有價值，同時指出它失去作用的條件時。',[['Education','slot','某種工具'],[' is undeniably useful, but without ','link','確有用，但缺乏'],['the right values','slot','關鍵條件'],[', it becomes ','link','便成為'],['a tool without direction.','slot','缺乏方向的工具']])),
  S('The routines developed early guide people through study and work, making them a lasting source of progress.','making them... 是前句整體結果；列 study, work, relationships 回收前文多個場景。','收束的是既有論證，沒有在最後加入新理由。',[2,9,13],F('[早期形成的習慣] guide people through [多個生活領域], making them [持久成果來源]','最後用多個領域概括首段與第二段的共同判斷。','結尾要合併前文的數個應用情境，指出共同的深層原因時。',[['The habits and principles formed at home','slot','早期形成的習慣'],[' guide people through ','link','引導人們面對'],['study, work, and relationships','slot','多個生活領域'],[', making them ','link','使它們成為'],['the deeper source of lasting achievement.','slot','持久成果來源']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為家庭價值觀與學校知識，哪一項對長遠成功影響較大？',['家庭價值觀；它引導人如何持續使用所學及與人相處','只有學校知識；家庭完全沒有作用','兩者完全相同，作者沒有判斷','只有一次考試成績最重要'],'completely agree；家庭價值觀形成內在習慣，知識仍有用。'),
  {type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['紀律、責任感等價值觀讓人持續運用技能並面對挫折','尊重、同理心等品質支撐合作、信任及成年後的人際成果','任何家庭長大的人必然成功','學校不應再教授任何知識'],correct:[0,1],why:'第一段談持續使用知識的內在習慣；第二段談與人相處和專業信任。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 家庭價值觀影響更深','承認家庭與學校都影響未來，再交代家庭習慣如何引導所學。'],
  ['主體段一 · 價值觀是成就基礎','紀律、責任與毅力使人持續學習；正反學生例子及樹根比喻。'],
  ['主體段二 · 人際品質帶來長期信任','家庭互動形成尊重、同理與可靠性；相近學歷畢業生的對照。'],
  ['結論 · 知識需方向','重申家庭價值觀影響較深，同時承認教育有用。'],
],'比較判斷 → 內在習慣 → 人際品質 → 知識有用但需價值觀引導。')];
const evidence=[
  Q('作者列出哪四項可支撐成就的價值觀？',['紀律、責任感、誠實和毅力','名氣、運氣、財富和外表','記憶力、書法、速度和分數','只列出誠實一項'],'discipline, responsibility, honesty, perseverance。'),
  Q('為何學校教的能力未必自動帶來成功？',['人仍須有能持續運用能力的品格','學校完全不能教任何知識','數學與寫作都沒有用途','只要入學便必然成功'],'useful only when...apply them consistently。'),
  Q('重視努力的家庭中的學生，可能有甚麼行為？',['定期溫習、接受改正，成績差時仍繼續努力','有知識便不需練習','遇到批評立即放棄','只選最易的捷徑'],'more likely 表可能，例子展示價值觀如何化為習慣。'),
  Q('樹根比喻強調甚麼？',['價值觀平時不易看見，困難時卻支撐表現','價值觀只能在戶外學習','知識完全沒有用','樹木必然能解決所有工作問題'],'invisible at first, but essential when the weather turns rough。'),
  Q('兩位資歷相近畢業生的例子如何支持第二段？',['聆聽、公平與守信可使一人較可能贏得職場信任與責任','兩人必然得到完全相同職位','只比較考試成績，不看行為','所有僱主都從不看資歷'],'similar qualifications 控制學歷差異，對比具體人際行為。'),
  Q('作者是否否認教育有用？',['沒有；教育有用，但品格與價值觀引導人怎樣運用知識','有；作者要求取消所有學校','沒有；但作者認為知識單獨已足夠','有；作者只看出生家庭的財富'],'undeniably useful；without the right values, a tool without direction。'),
];
const logic=[
  sequence('第一主體段：內在習慣如何影響成就？',[
    ['主張','紀律、責任、誠實和毅力是成就的基礎。'],
    ['條件','學校能力只有被持續運用才發揮作用。'],
    ['正面例子','重視努力的家庭使學生較可能溫習、接受修正和堅持。'],
    ['反面對照','有知識卻缺自制的人或會浪費機會和找捷徑。'],
    ['比喻收束','價值觀如樹根，平時難見，艱難時重要。'],
  ],'價值觀 → 持續使用知識 → 正反對照 → 深層基礎。'),
  sequence('第二主體段：家庭品質如何轉成職場信任？',[
    ['主張','成年成功亦依賴與人相處。'],
    ['形成','尊重、同理、耐性、可靠性常由家庭日常互動習得。'],
    ['延伸','品質影響友誼、合作、領導與職場信任。'],
    ['對照例子','學歷相近時，會聆聽、公平及守信者更可能獲信任。'],
    ['比喻收束','知識可帶來機會，品格影響能否長久維持。'],
  ],'家中互動 → 人際品質 → 多領域運用 → 相近資歷下的不同結果。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('兩位工程師技術相近，一位定期檢查錯誤並持續修正，另一位很快放棄。','哪條原文推理最適合？',['知識有用，但紀律與毅力決定人是否持續運用技能','技術只要在學校學過就會自動發揮作用','所有工程師都必然有相同結果','毅力可完全取代任何技術學習'],['對照正反習慣，保留知識作用。','原文指出需持續運用。','忽略行為差異。','原文承認技能有用。'],[2,3,4,5],'useful only when...apply them consistently。'),
  T('一名學生考試不理想，聽取教師意見後繼續溫習。','這最能展示哪種家庭價值觀作用？',['重視努力的習慣讓學生接受改正並在挫折後堅持','價值觀保證每次考試滿分','學校教的內容必然無用','接受改正代表學生沒有責任感'],['正面學生例子的三項行為完全相符。','more likely 非保證。','作者承認教育有用。','接受修正是責任表現。'],[2,3,4],'revise regularly, accept corrections, and keep going。'),
  T('兩位求職者學歷一樣，一位準時守信又懂得聆聽，另一位經常失約。','哪項推論最符合第二段？',['人際品質可能使前者更容易獲得職場信任','兩人學歷相同，所以雇主必然同樣信任','只有學歷能影響工作責任','守信與合作完全沒有關係'],['相近資歷下，以行為差異解釋信任。','忽略可靠性。','原文比較資歷與品格。','與例子相反。'],[8,9,10,11],'similar qualifications...keeps promises。'),
  T('某人受過良好訓練，卻不願長期練習與接受批評。','文章會怎樣評估訓練的作用？',['訓練有用，但若欠缺持續運用的品格，效果可能有限','受過訓練便必然長期成功','訓練完全沒有任何用途','批評永遠應被拒絕'],['only when 指知識轉為成果的條件。','忽略持續運用。','文章承認教育有用。','學生例子接受改正。'],[1,3,4,13],'useful only when...apply them consistently。'),
  T('一個工作團隊想提升合作，成員只增加證書數目，卻仍不聆聽或守信。','哪條論證可跨題運用？',['資格或帶來機會，但與人相處的品質影響合作與長期信任','證書必然使人尊重彼此','守信只在家庭內有用','任何技能都不應學'],['第二段將家庭品質延伸到團隊與職場。','證書不足以保證。','原文說影響工作。','作者承認技能有用。'],[7,8,9,10,11],'teamwork；professional trust；character。'),
  T('有人說：「品格重要，所以學校毋須教科學與寫作。」','哪項更正最準確？',['作者承認學校教的技能有用，只說它們需要品格來持續運用','原句完全符合文章','作者否認任何人能在學校學技能','價值觀能自動提供所有專業知識'],['文章比較相對影響，並未取消教育。','與原文明顯相反。','原文明說可教數學等。','價值觀不是知識替身。'],[0,3,13],'Schools can teach...but these abilities are useful only when...'),
  T('一位新員工很會面試，卻經常違約；另一位起初不顯眼，工作卻一直可靠。','哪個比喻能總結差異？',['表面條件可能開門，可靠品格影響能否留在機會之中','只有第一天的表現能決定整個職涯','守信不影響同事信任','面試能力與品格完全相同'],['open the door／stay in the room 指初步機會與持續表現。','忽略長期。','原文重視 reliability。','兩者是不同條件。'],[9,10,11],'may open the door, but character...stay in the room。'),
  T('一家人每晚讓孩子輪流安排簡單家務，做錯時一起討論如何改善。','哪個作用最可能由此培養？',['責任感、接受修正及持續嘗試的日常習慣','只要做家務就必然成為所有科目第一','家庭互動與日後行為完全無關','錯誤只能靠懲罰處理'],['日常互動可形成內在習慣。','原文沒有保證。','與中心機制相反。','接受改正可成長。'],[1,2,4,8],'inner habits；daily interactions。'),
  T('某社區評估青年培訓，只記錄取得多少證書，不看能否完成工作或合作。','哪項評估更貼近文章？',['同時看知識是否被持續運用，以及可靠、合作等可觀察行為','只看證書數目便足夠','只問家庭收入，不看行動','凡有證書的人都同樣可靠'],['兩段分別論持續運用與人際品質。','忽略兩段機制。','原文重習慣非財富。','忽略行為差異。'],[3,4,8,9,10],'apply consistently；teamwork；professional trust。'),
  T('有人問：「為何一個人平時看似不起眼的習慣，遇到難題時卻重要？」','哪個解釋最符合本文？',['好習慣如樹根，平時不顯眼，挫折時可支撐持續努力','因為外表越醒目越能解決問題','因為困難來時知識必然消失','因為習慣只在兒時有用'],['樹根比喻指隱藏而持久的基礎。','不符比喻。','不是原文。','原文延伸到成年。'],[4,5,6],'roots of a tree...essential when the weather turns rough。'),
  T('學生要總結家庭與學校對長遠成就的影響。','要比較學校教育與家庭影響時，哪種結論最忠於原文？',['兩者都有影響，但家庭形成的習慣更深地指引知識和人際行為','兩者完全相同，沒有相對判斷','學校永遠完全無用','家庭只提供考試技巧'],['both shape...greater influence 準確保留承認及排序。','作者明確排序。','作者承認教育有用。','家庭價值觀不限考試。'],[0,1,12,13,14],'both shape；greater influence；undeniably useful。'),
  T('學生要向同學簡要介紹全文主張。','要用一句話概括全文，哪項最準確？',['家庭價值觀培養持續運用知識與善待他人的習慣，因此作者認為它比學校技能更深地影響長遠成功','作者主張所有成功只靠學校考試','作者說家庭價值觀能取代所有專業知識','作者認為人際品質只影響兒童，不影響工作'],['包含兩段不同機制與比較判斷。','與立場相反。','原文承認學校能力。','第二段論成年工作。'],[0,1,2,3,7,8,9,10,12,13,14],'inner habits；deal with others；lasting achievement。'),
];
export default {
  key:'opinion:51',
  meta:{topic:'家庭價值觀與學校知識對長遠成功的影響',summary:'作者完全同意家庭價值觀比學校技能或知識更深地影響長遠成功。紀律、責任感、誠實與毅力使人能持續運用所學、面對挫折；尊重、同理心和可靠性則影響合作及職場信任。教育仍然有用，但需要價值觀指引使用方向。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
