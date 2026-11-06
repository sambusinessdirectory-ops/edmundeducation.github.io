// Full source-specific memorisation support for Discuss Both Views 15.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:15'];
const original=groups.map(row=>row.english);
const simple=[
  'As people around the world talk to each other more, being able to speak another language has become very useful for learning.',
  'Some people think students should first learn another language in secondary school, but I strongly think they should start in primary school.',
  'People who want children to start later often say secondary school students are more grown up.',
  'At that age, students can think more clearly about grammar, ways to build sentences and words for ideas, so teachers may find it easier to explain how the language works step by step.',
  'Older students may also know more clearly why they want to learn, such as doing well in exams or getting a job later.',
  'For example, a teenager who knows that English, French or Mandarin could help them get better jobs may work harder and keep to a study plan.',
  'From this view, secondary school may seem a better time to teach a language in a serious, well-planned way.',
  'But there is a stronger reason to start in primary school: younger children can often form the habits of speaking another language more naturally.',
  'Young children often pick up how words sound, how speech moves and simple things to say more easily because they worry less about looking foolish and are happier to copy sounds.',
  'If a child often sings songs, plays word games and hears easy instructions in another language, that language slowly feels normal instead of scary.',
  'Feeling sure of themselves early matters because no one learns a language in one day; they improve by hearing and using it often, making mistakes and fixing them.',
  'So a student who has heard another language since age six is much less likely to think it is too hard when lessons become more difficult in secondary school.',
  'To sum up, secondary school students may study a language with a clearer plan, but primary school is the better time to begin.',
  'Meeting another language early helps children feel sure, speak more naturally and improve step by step, so learning it works much better.',
];
const vocabulary=[
  [['increasingly connected world','people around the world talk to each other more','日益互聯世界'],['ability to speak a foreign language','being able to speak another language','說外語能力'],['valuable educational asset','very useful for learning','有價值的教育優勢']],
  [['While some people believe','Some people think','有些人認為'],['first study another language in secondary school','first learn another language in secondary school','中學才開始學外語'],['I firmly believe','I strongly think','我堅定認為'],['begin at primary school','start in primary school','從小學開始']],
  [['Those who support a later start','People who want children to start later','支持較晚開始者'],['often argue','often say','通常認為'],['more mature','more grown up','較成熟']],
  [['At that age','At that age','在那年齡'],['grammar rules','grammar','文法規則'],['sentence patterns','ways to build sentences','句子結構'],['abstract vocabulary','words for ideas','抽象詞彙'],['more consciously','think more clearly','較有意識'],['in a systematic way','step by step','有系統地']],
  [['Older students','Older students','年紀較大的學生'],['clearer academic goals','know more clearly why they want to learn','更清晰學習目標'],['examinations','exams','考試'],['future employment','getting a job later','未來就業']],
  [['For example','For example','例如'],['teenager','teenager','青少年'],['improve career prospects','help them get better jobs','改善職業前景'],['study with stronger discipline','work harder and keep to a study plan','更自律學習']],
  [['From this perspective','From this view','從這角度'],['more efficient stage','better time','更有效的階段'],['serious language instruction','teach a language in a serious, well-planned way','認真語言教學']],
  [['However','But','然而'],['stronger argument','stronger reason','更有力理由'],['primary school children','younger children','小學生'],['better position','can often','更有條件'],['natural language habits','habits of speaking another language more naturally','自然語言習慣']],
  [['Young learners','Young children','年幼學習者'],['absorb pronunciation','pick up how words sound','吸收發音'],['rhythm','how speech moves','語言節奏'],['basic expressions','simple things to say','基本表達'],['less self-conscious','worry less about looking foolish','較不怕出錯'],['imitate sounds','copy sounds','模仿聲音']],
  [['regularly sings songs','often sings songs','經常唱歌'],['plays language games','plays word games','玩語言遊戲'],['simple classroom instructions','easy instructions','簡單課堂指示'],['gradually becomes familiar','slowly feels normal','漸漸熟悉'],['rather than frightening','instead of scary','而非害怕']],
  [['early confidence','Feeling sure of themselves early','早期信心'],['not mastered overnight','no one learns a language in one day','不可能一夜學會'],['repeated exposure','hearing and using it often','反覆接觸'],['mistakes and correction','making mistakes and fixing them','犯錯改正']],
  [['from the age of six','since age six','從六歲起'],['far less likely','much less likely','遠較不可能'],['wall to climb','think it is too hard','難攀高牆'],['more demanding','more difficult','難度提高']],
  [['In conclusion','To sum up','總結'],['more deliberately','with a clearer plan','更有意識'],['better starting point','better time to begin','更好起點']],
  [['Early exposure','Meeting another language early','早期接觸'],['confidence','feel sure','信心'],['natural habits','speak more naturally','自然習慣'],['steady progress','improve step by step','穩步進步'],['far more effective','works much better','有效得多']],
];
const chunkOverrides=[
  ['In an increasingly connected world,','the ability to speak a foreign language','has become a valuable educational asset.'],
  ['While some people believe that pupils should first study','another language in secondary school,','I firmly believe that language learning','should begin at primary school.'],
  ['Those who support a later start often argue','that secondary school students are more mature.'],
  ['At that age, learners can understand grammar rules,','sentence patterns and abstract vocabulary more consciously,','so teachers may be able to explain the language','in a systematic way.'],
  ['Older students may also have clearer academic goals,','such as preparing for examinations or future employment.'],
  ['For example, a teenager who knows that English, French or Mandarin','could improve career prospects may study','with stronger discipline.'],
  ['From this perspective, secondary school can seem','like a more efficient stage for serious language instruction.'],
  ['However, the stronger argument is that primary school children','are usually in a better position','to build natural language habits.'],
  ['Young learners tend to absorb pronunciation, rhythm','and basic expressions more easily because','they are less self-conscious and more willing','to imitate sounds.'],
  ['If a child regularly sings songs, plays language games','and hears simple classroom instructions in another language,','that language gradually becomes familiar rather than frightening.'],
  ['This early confidence matters because language learning','is not mastered overnight; it grows through','repeated exposure, mistakes and correction.'],
  ['A student who has met a foreign language from the age of six','is therefore far less likely to see it as a wall to climb','when it becomes more demanding in secondary school.'],
  ['In conclusion, although secondary school students','may study languages more deliberately,','primary school is the better starting point.'],
  ['Early exposure builds confidence, natural habits and steady progress,','making foreign-language learning far more effective.'],
];
const simpleChunkOverrides=[
  ['As people around the world talk to each other more,','being able to speak another language','has become very useful for learning.'],
  ['Some people think students should first learn another language','in secondary school, but I strongly think','they should start in primary school.'],
  ['People who want children to start later often say','secondary school students are more grown up.'],
  ['At that age, students can think more clearly about grammar,','ways to build sentences and words for ideas,','so teachers may find it easier to explain','how the language works step by step.'],
  ['Older students may also know more clearly','why they want to learn, such as doing well in exams','or getting a job later.'],
  ['For example, a teenager who knows that English, French or Mandarin','could help them get better jobs may work harder','and keep to a study plan.'],
  ['From this view, secondary school may seem a better time','to teach a language in a serious, well-planned way.'],
  ['But there is a stronger reason to start in primary school:','younger children can often form the habits','of speaking another language more naturally.'],
  ['Young children often pick up how words sound,','how speech moves and simple things to say more easily','because they worry less about looking foolish','and are happier to copy sounds.'],
  ['If a child often sings songs, plays word games','and hears easy instructions in another language,','that language slowly feels normal instead of scary.'],
  ['Feeling sure of themselves early matters because','no one learns a language in one day;','they improve by hearing and using it often,','making mistakes and fixing them.'],
  ['So a student who has heard another language since age six','is much less likely to think it is too hard','when lessons become more difficult in secondary school.'],
  ['To sum up, secondary school students may study a language','with a clearer plan, but primary school','is the better time to begin.'],
  ['Meeting another language early helps children feel sure,','speak more naturally and improve step by step,','so learning it works much better.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('In a connected economy, the ability to work with people overseas has become a useful skill.','以 In ... world ... has become ... 提出外語能力的現代價值',[1,2,7],fixed(0,'In [日益互聯的世界], [說外語的能力] has become [有價值的教育優勢].','開篇確立外語學習時機值得討論的背景。','要說明一種能力因環境改變而變得更有價值時。',['In ', ', ', ' has become '],['促成需要的環境','討論的能力','現時新增的重要性'])),
  card('While some people believe that workers should learn new tools later, I firmly believe that training should begin early.','以 While some ... I firmly believe ... 並列遲學與早學並表態',[0,2,12],fixed(1,'While some people believe that [中學才開始學外語], I firmly believe that [小學便開始].','作者在引言讓出後開始的看法，再明確選小學。','兩方爭論開始時間，要承認一方主張並清楚選另一方時。',['While some people believe that ', ', I firmly believe that '],['先交代的開始時間主張','作者選擇的開始時間'])),
  card('Those who support later training often argue that older learners are more ready.','以 Those who support ... argue ... 公平交代遲開始的成熟理由',[1,3,6],fixed(2,'Those who support [較晚開始] often argue that [中學生較成熟].','第一主體段先概括支持中學才開始的主要理由。','要展開較少支持的一方，先準確說明其成熟度理由時。',['Those who support ', ' often argue that '],['被支持的開始時機','支持者相信的原因'])),
  card('At that age, learners can understand detailed plans more consciously, so coaches may be able to explain the sport in a systematic way.','以 so 把較成熟的理解力接到教師系統教學',[2,4,5],fixed(3,'At that age, [學習者] can understand [文法、句型、抽象詞] more consciously, so [教師] may be able to explain [語言] in [系統方式].','中學生可自覺理解較抽象內容，因此教師較易系統講解。','要由學習者某項認知能力推導教師可採用的教學方式時。',['At that age, ', ' can understand ', ' more consciously, so ', ' may be able to explain ', ' in '],['處於該年齡的學習者','較能理解的抽象內容','受益的教學者','被講解的內容','講解方式'])),
  card('Older trainees may also have clearer goals, such as passing exams or finding work.','以 such as 具體化較年長者更清楚的學習目標',[3,5,6],fixed(4,'[較年長學生] may also have [更清晰的目標], such as [考試與未來就業].','支持者補充年長學習者有較明確的動機來源。','已說能力較成熟，要補充另一項目標上的優勢並舉例時。',[' may also have ', ', such as '],['在較晚時段學習者','相對清楚的目標','目標的具體用途'])),
  card('For example, a teenager who sees how coding may help future work may study with stronger discipline.','以 who knows ... may ... 把職涯目標接到自律學習',[4,6,8],fixed(5,'For example, [知道外語改善前景的青少年] may study with [更強自律].','具體說職業前景可成為中學生認真學習的理由。','要舉例說明一個人看見將來的用途後，可能更自律地學時。',['For example, ', ' may study with '],['看到未來用途的人','因此可能加強的學習態度'])),
  card('From this perspective, later training can seem like a more efficient stage for complex professional skills.','以 From this perspective 概括遲開始似乎較有效率',[2,4,7],fixed(6,'From this perspective, [中學] can seem like [較有效階段] for [認真語言教學].','把成熟理解和清晰目標合併成支持中學的總結。','已列一方幾項好處，要從其角度概括某時段看似較有效時。',['From this perspective, ', ' can seem like ', ' for '],['被評估的階段','支持者給它的比較評價','適用的教學任務'])),
  card('However, the stronger argument is that younger players are usually in a better position to build movement habits naturally.','以 stronger argument 轉向早開始建立自然習慣',[1,6,8],fixed(7,'However, the stronger argument is that [小學生] are usually in a better position to build [自然語言習慣].','作者認為早期自然習慣比晚期系統講解更關鍵。','已公平說完較晚開始的好處，要提出更有力的早期習慣理由時。',['However, the stronger argument is that ', ' are usually in a better position to build '],['較早開始的群體','較容易自然形成的習慣'])),
  card('Young singers tend to absorb rhythm and sounds more easily because they worry less and enjoy copying others.','以 because 聯繫兒童模仿意願與語音學習',[7,9,10],fixed(8,'[年幼學習者] tend to absorb [發音、節奏及基本表達] more easily because [較不怕出錯且願模仿].','低自我監控與願模仿使年幼孩子更容易接受語音。','要解釋某群人為何較易習得一類技能，並指出其行為特點時。',[' tend to absorb ', ' more easily because '],['較易學習的群體','較易吸收的內容','促成學習的特點'])),
  card('If pupils often sing and play simple games, the new language gradually becomes familiar rather than scary.','以 If ... rather than ... 說重複接觸令陌生變熟悉',[8,10,11],fixed(9,'If [孩子經常唱歌玩遊戲聽指示], [外語] gradually becomes [熟悉] rather than [可怕].','輕鬆、反覆的接觸降低孩子對外語的恐懼。','要說某種經常接觸如何把陌生事物逐漸變熟悉，而非令人害怕時。',['If ', ', ', ' gradually becomes ', ' rather than '],['經常出現的低壓活動','逐漸被接納的事物','形成的正面感受','被避免的負面感受'])),
  card('Early confidence matters because swimming is not mastered overnight; it grows through practice and correction.','以 because ...; it grows through ... 說掌握需要反覆犯錯改正',[8,9,11],fixed(10,'[早期信心] matters because [外語] is not mastered overnight; it grows through [反覆接觸、犯錯和改正].','早開始可積累信心，因語言能力需要長期經驗。','要說明某項早期基礎重要，因技能無法速成而須重複練習與修正時。',[' matters because ', ' is not mastered overnight; it grows through '],['重要的早期基礎','無法速成的技能','長期形成的過程'])),
  card('A player who has trained since childhood is therefore far less likely to see harder matches as a wall to climb when they reach a higher league.','以 who has ... is less likely ... 說早接觸使日後較不畏難',[9,10,12],fixed(11,'[六歲起接觸外語的學生] is therefore far less likely to see [較難的中學語言] as [難爬的高牆] when [難度提高].','早期熟悉讓中學進階學習不致顯得不可逾越。','要指出較早建立的熟悉感，如何降低日後面對更高難度的畏懼時。',[' is therefore far less likely to see ', ' as ', ' when '],['已有早期接觸的人','日後面對的任務','原本可能有的恐懼比喻','難度升高的時候'])),
  card('In conclusion, although older players may plan training more deliberately, childhood is the better starting point.','以 although 讓步年長學習有計劃，仍選小學起步',[1,6,13],fixed(12,'In conclusion, although [中學生學得更有意識], [小學] is [更好的起點].','結論承認年長者成熟優勢，仍選早開始。','要在結論承認較晚開始的某個好處，仍明確選更早起點時。',['In conclusion, although ', ', ', ' is '],['讓步承認的晚期優勢','作者選擇的起點','其比較評價'])),
  card('Early practice builds confidence and natural habits, making later learning far more effective.','以 making ... 說早接觸累積多種好處並提升成效',[7,10,12],fixed(13,'[早期接觸] builds [信心、自然習慣及穩定進步], making [外語學習] far more [有效].','最後由早期接觸三項累積結果，推到整體學習成效。','要把一種早期做法帶來的數項基礎，連到長遠成效時。',[' builds ', ', making ', ' far more '],['促成基礎的早期做法','逐步累積的好處','因而受益的學習','提升的表現'])),
];
const wrongReasons=[
  ['這句已比較中學和小學起步，原句先交代外語在當代的重要性。','這句只報告支持遲開始者的理由，未設定世界互聯背景。','這句已轉入作者較強論點，未作開篇的價值設定。'],
  ['這句只指出外語能力有價值，未列兩個起步時間並表態。','這句只呈現遲開始者的成熟理由，未表達作者選小學。','這句是結論讓步後重申立場，原句在引言已首次表態。'],
  ['這句在引言說兩方及作者立場，未只展開遲開始理由。','這句分析中學生理解文法的能力，未先概括其成熟。','這句是支持晚起步方的總結，未先提出成熟前提。'],
  ['這句概括年長者較成熟，未以 so 推到系統講解。','這句補充目標明確，未說理解抽象詞與教師講解的關係。','這句是具體職涯動機例子，未說認知能力如何影響教法。'],
  ['這句說較成熟者可理解文法，未補充目標清晰的另一優勢。','這句以青少年職涯目標作具體例子，原句先概括。','這句總結中學可能較有效，未列考試或就業目標。'],
  ['這句先概括年長學生目標，未以 For example 寫個別青少年。','這句概括中學似乎有效，未說職涯前景如何促進自律。','這句轉向早期習慣的較強理由，與此例方向相反。'],
  ['這句是年長者有清晰目標，未把兩項理由概括成階段評價。','這句青少年例子仍屬具體支持，未以 From this perspective 總結。','這句已指出早起步更強的理由，與晚起步方結語相反。'],
  ['這句在引言已選小學，未在主體段以 stronger argument 轉折。','這句是晚起步方總結，未比較自然習慣與系統講解。','這句解釋年幼者較易模仿語音，未先提出自然習慣主張。'],
  ['這句先概括年幼孩子可建立自然習慣，未解釋語音吸收原因。','這句用唱歌遊戲說熟悉感，未指出較不怕出錯及願模仿。','這句談長期接觸和改正，未說年幼者具體語音優勢。'],
  ['這句分析年幼者為何吸收語音，未以 If 列反覆接觸活動。','這句概括信心需長期積累，未呈現語言由可怕變熟悉。','這句由六歲接觸推到中學少畏難，未寫低壓活動過程。'],
  ['這句說模仿聲音的能力，未解釋語言技能不能一夜學會。','這句列唱歌遊戲形成熟悉感，未抽出犯錯改正的長期機制。','這句已談進入中學後的心理結果，原句先說信心為何重要。'],
  ['這句列低壓活動讓語言熟悉，未講日後中學難度的效果。','這句解釋長期接觸必要，未套到六歲開始的學生身上。','這句是結論讓步與選擇，未用高牆比喻畏難。'],
  ['這句是引言選小學，未在結論承認中學生有意識的優勢。','這句是中學支持方的主體結語，未作最後比較判斷。','這句是最後總結早接觸的累積效果，未以 although 讓步。'],
  ['這句概括早期自然習慣較有力，未列信心進步三項結果。','這句說信心需長期犯錯改正，未以 making 歸納總成效。','這句結論讓步後選小學，未把早接觸轉化成成效機制。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先理解中學生的成熟優勢，再看為何年幼時的自然接觸更有力。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目比較外語應在甚麼時候開始學？',[
    '小學開始，與中學才開始',
    '只比較英語與法語哪種字母較多',
    '只比較課室和圖書館哪裏較安靜',
    '只比較考試應用筆寫還是用電腦',
  ],'兩方爭論外語學習的起步階段。'),
  {type:'multi',prompt:'選出作者對兩方的完整看法',detail:'選兩項，再按「確認」。',options:[
    '中學生較成熟，能有意識學文法與設定目標',
    '小學生較易建立自然語感，因此應較早開始',
    '中學生一旦成熟，便完全不會再犯語言錯誤',
    '年幼孩子只要聽一次外語，就能立即完全掌握',
  ],correct:[0,1],why:'作者承認晚開始的理性優勢，仍認為早接觸的自然習慣更關鍵。'},
];
const route=[sequence('依文章次序排列早學外語論證',[
  ['引言定立場','外語重要；雖有人主張中學才開始，作者選小學。'],
  ['中學派理由','較成熟、懂文法抽象詞、目標較清晰。'],
  ['小學派較強理由','較不怕出錯、願模仿；唱歌遊戲讓語言變熟悉。'],
  ['長期及結論','反覆接觸養信心，進中學時較不畏難。'],
],'文章比較有意識的晚期學習與長期積累的早期自然習慣。')];
const evidence=[
  quiz('支持中學才開始的人重視甚麼？',[
    '學生較成熟，較能理解文法句型和抽象詞',
    '學生只要更年長便完全不需要教師講解',
    '學生在中學前絕對不可能模仿任何聲音',
    '所有青少年都沒有考試或職涯方面的目標',
  ],'支持者以較成熟的認知能力作主要理由。'),
  quiz('職涯前景例子為何支持中學派？',[
    '看見外語對未來工作有用，青少年可能更自律',
    '知道外語用途後，青少年便不需練習任何語言',
    '只要提到職業，所有學生便保證立即精通外語',
    '職涯目標只會影響電腦價格，不影響學習態度',
  ],'較清晰的目標可能成為學習動機。'),
  quiz('年幼孩子為何可能較易吸收發音和節奏？',[
    '較不怕出錯，也更願意模仿語音',
    '已能分析所有抽象文法概念',
    '完全不用聽到或說出任何外語',
    '比所有成年人更清楚未來工作',
  ],'原文以較少自我顧慮及模仿意願解釋語音優勢。'),
  quiz('唱歌、語言遊戲和簡單指示有何作用？',[
    '反覆低壓接觸使外語逐漸熟悉而不嚇人',
    '只要唱歌一次，就能掌握所有艱深文法',
    '讓所有孩子完全停止使用母語交談',
    '把外語變得更陌生，並削弱模仿意願',
  ],'例子把早期活動連到熟悉感與信心。'),
  quiz('「不可能一夜學會」支持甚麼推理？',[
    '語言需反覆接觸、犯錯和改正，早開始可積累',
    '語言只需一次考試，往後便不必再練習',
    '犯錯只會妨礙學習，應完全避免說話',
    '早期接觸完全無用，因為能力不能速成',
  ],'能力靠長期實踐形成，早開始提供積累時間。'),
  quiz('「高牆」比喻說明早接觸的甚麼後效？',[
    '中學難度提高時，學生較不會覺得外語難以跨越',
    '學生進中學後，必須真的攀爬一面學校牆壁',
    '早開始便保證中學外語永遠不會有任何難度',
    '中學學外語唯一目的是參加體育攀石活動',
  ],'早期熟悉降低後來面對高難度時的恐懼。'),
  quiz('結論如何對待中學生的優勢？',[
    '承認他們較有意識學習，但仍選小學作更好起點',
    '完全否定中學生能理解任何文法句型',
    '改稱中學才開始永遠比小學更有效',
    '只討論職業薪酬，不再判斷學習起點',
  ],'作者讓步晚期學習優勢，仍選早期接觸。'),
];
const logic=[
  sequence('中學才開始的支持理由',[
    ['成熟程度','中學生較能自覺理解文法句型與抽象詞。'],
    ['教學方式','教師因此較能系統講解語言。'],
    ['明確目標','考試與未來工作提供學習方向。'],
    ['具體例子','知道外語改善職涯的青少年可能更自律。'],
  ],'作者公平說明較晚開始在理性理解與目標感上的優勢。'),
  sequence('小學開始為何更有力',[
    ['自然吸收','年幼孩子較願模仿，也較不怕出錯。'],
    ['低壓接觸','歌曲遊戲和簡單指示使外語逐漸熟悉。'],
    ['時間積累','能力經反覆接觸、犯錯改正而形成。'],
    ['進階信心','進中學後較不會把難題看成不可跨越。'],
  ],'早接觸的作用是累積自然習慣與信心，不是保證速成。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('學校考慮讓學生早接觸編程，部分教師認為應等到中學才教抽象概念。','哪項最公平比較兩種起步時機？',[
    '中學可教抽象規則，小學可先養熟悉感',
    '只在小學教抽象規則，不讓孩子先做簡單接觸',
    '只等中學才開始，不問早期熟悉感的作用',
    '只讓小學生玩遊戲，不在中學教更深規則',
  ],['分清早期習慣與後期有意識理解兩種優勢。','小學可先以簡單接觸養熟悉，中學再處理抽象規則。','只等中學漏了早期自然接觸的好處。','早期遊戲有用，但中學仍可學較抽象概念。'],[1,3,7,12],'作者承認中學生較能理解抽象內容，仍選小學建立自然習慣。'),
  transfer('小學音樂班讓孩子唱簡短歌曲、模仿節奏，孩子逐漸不怕開口。','哪項最貼近外語範文的早期學習機制？',[
    '低壓反覆模仿使陌生聲音逐漸熟悉',
    '只讓孩子聽歌曲，不給他們模仿節奏的機會',
    '只講音樂術語，不讓孩子低壓反覆唱歌',
    '只評估唱得準不準，不問開口信心變化',
  ],['歌曲模仿與低壓接觸可降低陌生感。','聽歌有用，模仿與重複才能逐漸熟悉。','抽象術語不能取代低壓的唱歌和模仿。','唱準是結果之一，題目更關注開口信心。'],[8,9,10],'幼童較願模仿聲音；歌曲遊戲令語言逐漸熟悉。'),
  transfer('一名中學生知道自己未來想做國際記者，因此開始認真學法語。','這最能支持較晚開始一方的哪個理由？',[
    '清楚的職涯目標可能帶來較自律的學習態度',
    '只看法語教材難度，不問職涯目標如何激勵',
    '只靠未來工作願望，不建立規律學習行動',
    '只比較年齡，不分析目標對自律的作用',
  ],['看見外語的未來用途，可能增強自律。','教材難度不是目標如何促進自律的解釋。','願望可提供動機，仍須落實規律學習。','年齡不能單獨說明明確目標的作用。'],[4,5,6],'清楚的未來就業目標可促使青少年更自律地學外語。'),
  transfer('學校擔心一年級孩子犯發音錯誤，打算等他們長大才讓他們開口說。','哪項回應最符合範文？',[
    '早期試說犯錯改正，有助信心和語感',
    '只等孩子完全準確才說，錯過早期試說機會',
    '只容許犯錯，不給模仿和改正的回饋',
    '只教文法規則，不安排自然開口練習',
  ],['語言能力靠反覆接觸與修正形成。','等完全準確才開口，錯過試說改正的累積。','犯錯可學習，但須有模仿與改正。','只教規則缺少開口實踐。'],[8,9,10],'外語不可能一夜學會，需反覆接觸、犯錯與改正。'),
  transfer('一名孩子六歲起輕鬆接觸西班牙語，進中學後遇到較難文法但不太害怕。','這最能對應範文的哪項長期效果？',[
    '早期熟悉讓進階內容較不像難以跨越的高牆',
    '只看中學文法成績，不問早期接觸的熟悉感',
    '只讓幼年孩子接觸，不在中學提供更深文法',
    '只教進階文法，不承認早期信心的幫助',
  ],['早接觸降低後期面對難度時的畏懼。','成績不能單獨說明早期熟悉帶來的信心。','早接觸有幫助，進階文法仍須教。','中學文法重要，仍可受益於早期語感。'],[9,10,11],'六歲起接觸外語的學生，進中學後較不會把它看成難爬高牆。'),
  transfer('體育教練說高年級學生較懂戰術，因此幼年時不必接觸球感或基本動作。','依範文應如何檢驗此說法？',[
    '大孩子懂戰術，幼年仍可先練自然動作',
    '只教高年級戰術，不安排幼年基本動作練習',
    '只在幼年教球感，不讓大孩子學戰術',
    '只比較兩個年級成績，不問各階段學法',
  ],['比較理性理解與早期習慣，不把一方優勢當全部。','大孩子可學戰術，幼年基本動作也有價值。','球感是基礎，高年級仍須學戰術。','年級成績不是不同階段學習方式的完整分析。'],[3,7,8,12],'中學能系統理解規則，小學較易養成自然習慣。'),
  transfer('小學生每天短時間聽外語問候，老師想知道為何不必等孩子先學完整文法。','哪項最貼近範文的早期目標？',[
    '先讓外語變得熟悉，逐步建立自然反應和信心',
    '先教完整文法，等孩子掌握才開始聽問候',
    '只讓孩子聽問候，不給模仿回應的機會',
    '只看背誦次數，不問外語是否漸漸熟悉',
  ],['早期重點是低壓熟悉與自然習慣，非速成。','範文主張先接觸變熟悉，不必等完整文法。','聽到問候有用，模仿回應能建立自然反應。','背誦次數不等於有熟悉感和信心。'],[7,9,10,13],'小學低壓接觸讓語言熟悉，並積累信心與習慣。'),
  transfer('語言教師為新生安排唱歌和遊戲，也計劃在高年級再教抽象句型。','哪項評估最合範文的時間分工？',[
    '早期養語音熟悉感，較晚再有意識學抽象規則',
    '只在早期安排遊戲，不規劃高年級抽象句型',
    '只在高年級教規則，不給早期語音接觸',
    '只把唱歌當娛樂，不看語音熟悉的作用',
  ],['兩階段可各有側重，起步仍應較早。','早期活動與後期抽象規則互補。','後期規則重要，早期語音熟悉也有用。','唱歌可讓語音熟悉，不只是娛樂。'],[3,8,9,12],'小學先建立自然語感，中學可更有意識地學文法。'),
  transfer('一個孩子看見陌生外語就害怕開口，家長想用低壓方式改善。','哪項做法最接近範文提供的途徑？',[
    '用歌曲遊戲反覆接觸，讓外語變得熟悉',
    '只要求孩子背文法，不用低壓活動建立熟悉',
    '只聽歌曲一次，不讓孩子反覆嘗試開口',
    '只說不要害怕，不安排簡單指示與遊戲',
  ],['低壓且反覆的接觸可把陌生變熟悉。','背規則不是改善害怕開口的低壓方法。','一次聽歌不足以建立熟悉與信心。','口頭安慰沒有提供反覆接觸的活動。'],[8,9,10],'唱歌遊戲和簡單指示令外語逐漸熟悉而非可怕。'),
  transfer('學校要在總結說明，為何小學開始並非只為提早考試。','哪項最貼近作者最後的理由？',[
    '早接觸培養信心與自然習慣，利於長期學習',
    '只說小學可提早考試，不談信心和自然習慣',
    '只看早期接觸量，不問後來能否穩步進步',
    '只強調中學規則，不解釋小學起步的價值',
  ],['起步時間影響長期習慣與信心，而非只提前測驗。','小學開始並非只為提前考試，更為信心和習慣。','接觸量不等於穩步進步，仍要看長期作用。','中學規則重要，不能抹去早期起步的價值。'],[7,10,11,13],'早接觸建立信心、自然習慣和穩步進步，使學習更有效。'),
];
export default {key:'discuss-both-views:15',meta:{topic:'外語應從小學還是中學開始學習',summary:'中學生較成熟且目標清晰；小學生較易模仿語音並積累自然習慣和信心，所以應在小學開始。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
