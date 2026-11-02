const simple=[
  'Many children watch television every day, and some people think it is an easy way to help them learn.',
  'But I strongly disagree that children should be told to watch it often at home or at school.',
  'Even a good programme cannot take the place of learning where children do things and teachers help them.',
  'The main problem is that television often makes children watch and listen without taking an active part in learning.',
  'When a child reads, talks, writes, tries things out, or asks questions, they must think: they check ideas, fix mistakes, and understand more.',
  'But television often presents information in a smooth flow, with little chance to think about it or talk back.',
  'For example, a child who watches a programme about plants may remember a few bright pictures, but a child who grows a plant, writes down how it changes, and explains it to a teacher is more likely to understand it well.',
  'Watching television often can therefore make children feel as if they have learned, while they have not spent enough time building thinking skills.',
  'Another reason is that watching television often at home and school may make it harder for children to focus and get along with others.',
  'Young children need regular activities that help them wait, pay attention, and talk with people.',
  'If children use screens too often for learning, slower and harder tasks like reading a chapter, solving a problem, or listening to classmates may seem less interesting.',
  'At home, this may also leave less time to talk with family, play outside, and study alone.',
  'At school, it may turn useful class time into a programme that only talks to students, who watch instead of joining in.',
  'Learning should not be like sitting in a theatre; it should be like working with others and trying things out.',
  'In short, I strongly disagree that children should be told to watch television often.',
  'If it becomes an everyday habit at home and school, it may make children less active, make it harder to focus, and take time from better ways to learn.',
];
const vocabulary=[
  [['Television','television','電視'],['familiar part','watch','熟悉部分'],['daily lives','every day','日常生活'],['support learning','help them learn','支持學習']],
  [['However','But','然而'],['completely disagree','strongly disagree','完全不同意'],['encouraged','told','鼓勵'],['regularly','often','定期'],['either at home or at school','at home or at school','在家或學校']],
  [['well made','good','製作精良'],['regular viewing','a good programme','定期觀看'],['poor substitute','cannot take the place','不能好好取代'],['active, guided education','learning where children do things and teachers help them','主動而有引導的教育']],
  [['main problem','main problem','主要問題'],['passive receivers','watch and listen without taking an active part','被動接收者'],['active learners','active part in learning','主動學習者']],
  [['discusses','talks','討論'],['experiments','tries things out','實驗'],['the mind has to work','they must think','大腦必須運作'],['ideas are tested','they check ideas','檢驗想法'],['mistakes are corrected','fix mistakes','糾正錯誤'],['understanding becomes deeper','understand more','理解加深']],
  [['by contrast','But','相比之下'],['delivers information','presents information','傳遞資訊'],['polished stream','smooth flow','經包裝的連續內容'],['little room','little chance','空間很少'],['reflection or interaction','think about it or talk back','反思或互動']],
  [['science programme','programme','科學節目'],['colourful images','bright pictures','色彩畫面'],['grows a plant','grows a plant','種植物'],['records its changes','writes down how it changes','記錄變化'],['explains the process','explains it','解釋過程'],['far more likely to understand the concept properly','more likely to understand it well','更可能真正理解']],
  [['Regular television viewing','Watching television often','定期看電視'],['illusion of learning','feel as if they have learned','學習錯覺'],['intellectual habits','thinking skills','思考習慣'],['underdeveloped','not spent enough time building','發展不足']],
  [['encouraging television at both home and school','watching television often at home and school','家校鼓勵常看電視'],['weaken children’s concentration','make it harder for children to focus','削弱專注力'],['social development','get along with others','社交發展']],
  [['Young learners','Young children','年幼學習者'],['routines','regular activities','日常安排'],['train patience','help them wait','訓練耐心'],['attention','pay attention','專注'],['communication','talk with people','溝通']],
  [['screens','screens','螢幕'],['normal learning tool too often','too often for learning','過頻繁學習工具'],['slower but more demanding tasks','slower and harder tasks','較慢且要求高任務'],['less appealing','less interesting','較不吸引'],['listening to classmates','listening to classmates','聆聽同學']],
  [['At home','At home','在家'],['reduce time','leave less time','減少時間'],['family conversation','talk with family','家庭對話'],['outdoor play','play outside','戶外玩耍'],['independent study','study alone','自主學習']],
  [['At school','At school','在校'],['valuable classroom time','useful class time','寶貴課堂時間'],['one-way broadcast','programme that only talks to students','單向播放'],['watch rather than participate','watch instead of joining in','觀看而不參與']],
  [['Education','Learning','教育'],['theatre seat','sitting in a theatre','劇院座位'],['workshop','working with others and trying things out','工作坊']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['encouraged','told','被鼓勵'],['regularly','often','定期']],
  [['regular habit','everyday habit','常規習慣'],['encourages passivity','make children less active','鼓勵被動'],['weakens attention','make it harder to focus','削弱專注力'],['richer forms of learning','better ways to learn','更豐富學習形式']],
];
const chunkOverrides=[
  ['Television has become a familiar part of many children\'s daily lives,','and it is sometimes seen as an easy way to support learning.'],
  ['However, I completely disagree','that children should be encouraged to watch it regularly either at home or at school.'],
  ['Even when a programme is well made,','regular viewing is a poor substitute for active, guided education.'],
  ['The main problem is that television usually turns children into passive receivers','rather than active learners.'],
  ['When a child reads, discusses, writes, experiments, or asks questions, the mind has to work:','ideas are tested, mistakes are corrected, and understanding becomes deeper.'],
  ['Television, by contrast, often delivers information in a polished stream,','leaving little room for reflection or interaction.'],
  ['For example, a child watching a science programme about plants may remember a few colourful images,','but a child who grows a plant, records its changes, and explains the process to a teacher','is far more likely to understand the concept properly.'],
  ['Regular television viewing therefore risks creating the illusion of learning,','while real intellectual habits remain underdeveloped.'],
  ['Another reason is that encouraging television at both home and school','would weaken children’s concentration and social development.'],
  ['Young learners need routines','that train patience, attention, and communication.'],
  ['If screens become a normal learning tool too often,','children may find slower but more demanding tasks, such as reading a chapter, solving a problem, or listening to classmates,','less appealing.'],
  ['At home, this could also reduce time','for family conversation, outdoor play, and independent study.'],
  ['At school, it may turn valuable classroom time into a one-way broadcast,','where students watch rather than participate.'],
  ['Education should not be a theatre seat;','it should be a workshop.'],
  ['In conclusion, I completely disagree with the idea','that children should be encouraged to watch television regularly.'],
  ['As a regular habit at home and in school, it encourages passivity,','weakens attention, and takes children away from richer forms of learning.'],
];
const simpleChunkOverrides=[
  ['Many children watch television every day,','and some people think it is an easy way to help them learn.'],
  ['But I strongly disagree','that children should be told to watch it often at home or at school.'],
  ['Even a good programme cannot take the place of learning','where children do things and teachers help them.'],
  ['The main problem is that television often makes children watch and listen','without taking an active part in learning.'],
  ['When a child reads, talks, writes, tries things out, or asks questions, they must think:','they check ideas, fix mistakes, and understand more.'],
  ['But television often presents information in a smooth flow,','with little chance to think about it or talk back.'],
  ['For example, a child who watches a programme about plants may remember a few bright pictures,','but a child who grows a plant, writes down how it changes, and explains it to a teacher','is more likely to understand it well.'],
  ['Watching television often can therefore make children feel as if they have learned,','while they have not spent enough time building thinking skills.'],
  ['Another reason is that watching television often at home and school','may make it harder for children to focus and get along with others.'],
  ['Young children need regular activities','that help them wait, pay attention, and talk with people.'],
  ['If children use screens too often for learning,','slower and harder tasks like reading a chapter, solving a problem, or listening to classmates','may seem less interesting.'],
  ['At home, this may also leave less time','to talk with family, play outside, and study alone.'],
  ['At school, it may turn useful class time into a programme that only talks to students,','who watch instead of joining in.'],
  ['Learning should not be like sitting in a theatre;','it should be like working with others and trying things out.'],
  ['In short, I strongly disagree','that children should be told to watch television often.'],
  ['If it becomes an everyday habit at home and school, it may make children less active,','make it harder to focus, and take time from better ways to learn.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Television is familiar to children and can seem an easy teaching aid.','and 連日常普及與「看似容易幫學習」的印象。','這是背景與他人觀感，不是作者支持常看電視。',[1,2,3],F('[電視] has become [孩子日常熟悉部分], and is sometimes seen as [簡單學習工具]','交代日常背景及政策吸引力。','要介紹一項常見工具，並交代人們認為它有何便利時。',[['Television','slot','電視'],[' has become ','link','已成為'],['a familiar part of many children\'s daily lives','slot','孩子日常熟悉部分'],[', and it is sometimes seen as ','link','有時被視為'],['an easy way to support learning.','slot','簡單學習工具']])),
  S('I disagree with encouraging regular viewing at home or school.','either...or... 明確覆蓋家庭及學校兩個環境。','作者反對鼓勵「定期觀看」，不等於每一次觀看都必然有害。',[0,2,14],F('I completely disagree that [孩子] should be encouraged to [在家或學校定期看電視]','直接回答題目的地點與頻率。','題目同時涉及多個場景及使用頻率，要在立場句界定範圍時。',[['However, I completely disagree that ','link','轉折並表態'],['children','slot','孩子'],[' should be encouraged to ','link','不應被鼓勵'],['watch it regularly either at home or at school.','slot','在家或學校定期看電視']])),
  S('Even a well-made show is a weak replacement for active, guided learning.','Even when 先讓步節目品質；主句仍否定它替代主動引導教育。','不是說所有節目都製作差。',[1,3,6],F('Even when [節目製作精良], [定期觀看] is a poor substitute for [主動、有引導教育]','承認媒體品質仍區分觀看與真正教學。','當某工具即使品質好，也不足取代更積極的學習過程時。',[['Even when ','link','先讓步'],['a programme is well made','slot','節目製作精良'],[', ','link','仍'],['regular viewing','slot','定期觀看'],[' is a poor substitute for ','link','難取代'],['active, guided education.','slot','主動、有引導教育']])),
  S('Television often leaves children passive rather than active learners.','turns...into...rather than... 對比被動接受與主動參與。','usually 是頻率判斷，不表示每次看電視都如此。',[2,4,5],F('[電視] usually turns [孩子] into [被動接收者] rather than [主動學習者]','指出定期觀看的主要學習方式問題。','要比較一項媒介令學習者被動或主動時。',[['The main problem is that ','link','指出主要問題'],['television','slot','電視'],[' usually turns ','link','通常令'],['children','slot','孩子'],[' into ','link','變成'],['passive receivers','slot','被動接收者'],[' rather than ','link','而非'],['active learners.','slot','主動學習者']])),
  S('Reading, discussing, trying and questioning make learners test ideas and correct mistakes.','When 列主動行為；冒號後解釋思想如何得到檢驗與理解。','不是說每個孩子每次都需完成所有五種活動。',[3,5,6],F('When [孩子閱讀討論寫作實驗提問], [大腦] must work: [想法受檢驗、錯誤被糾正、理解加深]','具體解釋主動學習如何運作。','要把抽象的能力或行為拆成可觀察的步驟及結果時。',[['When ','link','設定主動活動'],['a child reads, discusses, writes, experiments, or asks questions','slot','孩子閱讀討論寫作實驗提問'],[', ','link','則'],['the mind','slot','大腦'],[' has to work: ','link','須運作，於是'],['ideas are tested, mistakes are corrected, and understanding becomes deeper.','slot','想法受檢驗、錯誤被糾正、理解加深']])),
  S('Television often presents ready-made information with little time for thought or exchange.','by contrast 對照前句主動行為；leaving 指資訊流下反思與互動空間少。','原文用 often，不是否定所有互動性媒體。',[3,4,6],F('[電視] often delivers [經包裝資訊流], leaving little room for [反思或互動]','與閱讀、提問、實驗等學習方式作對比。','要說明某種媒介提供資訊卻少讓使用者參與處理時。',[['Television','slot','電視'],[', by contrast, often delivers ','link','相比之下常傳送'],['information in a polished stream','slot','經包裝資訊流'],[', leaving little room for ','link','少有空間'],['reflection or interaction.','slot','反思或互動']])),
  S('Growing and recording a plant promotes deeper understanding than only watching bright images.','may remember...but...far more likely 對比畫面記憶與實作理解。','作者說更可能理解，沒有保證每個實作者都必然理解。',[4,5,7],F('[觀看植物節目孩子] may remember [彩色畫面], but [種植記錄並向教師解釋的孩子] is far more likely to [真正理解概念]','用對照例子說明主動實作優勢。','要比較被動接收與親身實作、記錄及解說所得的理解深度時。',[['For example, ','link','引出例子'],['a child watching a science programme about plants','slot','觀看植物節目孩子'],[' may remember ','link','可能只記得'],['a few colourful images','slot','彩色畫面'],[', but ','link','但'],['a child who grows a plant, records its changes, and explains the process to a teacher','slot','種植記錄並向教師解釋的孩子'],[' is far more likely to ','link','更可能'],['understand the concept properly.','slot','真正理解概念']])),
  S('Regular viewing can feel like learning while thinking habits remain weak.','therefore 回扣例子；illusion of learning 對比感覺與能力形成。','risks 表示風險，不表示每個觀看者必然沒有學習。',[5,6,8],F('[定期看電視] risks creating [學習錯覺], while [真正思考習慣] remain [發展不足]','收束被動觀看可能產生的學習風險。','要區分表面吸收資訊與實際能力是否增長時。',[['Regular television viewing','slot','定期看電視'],[' therefore risks creating ','link','因此或造成'],['the illusion of learning','slot','學習錯覺'],[', while ','link','但'],['real intellectual habits','slot','真正思考習慣'],[' remain ','link','仍'],['underdeveloped.','slot','發展不足']])),
  S('Encouraging TV at home and school may weaken focus and social growth.','Another reason 轉第二段；both home and school 指兩處常規觀看累積。','原文用 would 表論證推測，並非已量度每名學生結果。',[7,9,10],F('[家校都鼓勵看電視] would weaken [孩子專注與社交發展]','由認知學習轉到注意力和社交。','一段已談理解深度，另一段要指出日常習慣的其他影響時。',[['Another reason is that ','link','引出第二理由'],['encouraging television at both home and school','slot','家校都鼓勵看電視'],[' would weaken ','link','會削弱'],['children’s concentration and social development.','slot','孩子專注與社交發展']])),
  S('Young learners need activities that build patience, attention and communication.','routines that train... 指日常安排需鍛鍊三種能力。','不是說只靠單一活動即可完全建立能力。',[8,10,11],F('[年幼學習者] need [訓練耐性、專注和溝通的日常安排]','提出孩子成長所需的學習習慣。','要評估某種日常工具是否佔用訓練重要能力的時間時。',[['Young learners','slot','年幼學習者'],[' need ','link','需要'],['routines that train patience, attention, and communication.','slot','訓練耐性、專注和溝通的日常安排']])),
  S('Frequent screen use may make reading, problem-solving and listening less appealing.','If 設螢幕過頻條件；may 保留可能；such as 列較慢而更費心的任務。','不能寫成所有孩子都必然不再閱讀。',[8,9,11],F('If [螢幕過頻成常規學習工具], [孩子] may find [閱讀、解題、聆聽等較慢任務] [不那麼吸引]','指出螢幕習慣可能如何改變學習偏好。','要說明某種容易快速刺激的習慣可能影響較慢任務的吸引力時。',[['If ','link','設定過頻使用'],['screens become a normal learning tool too often','slot','螢幕過頻成常規學習工具'],[', ','link','則'],['children','slot','孩子'],[' may find ','link','可能覺得'],['slower but more demanding tasks, such as reading a chapter, solving a problem, or listening to classmates','slot','閱讀、解題、聆聽等較慢任務'],[', ','link','變得'],['less appealing.','slot','不那麼吸引']])),
  S('At home, screen time may crowd out family talk, outdoor play and independent study.','At home 限定環境；could reduce time 指觀看可能擠走其他活動。','不是說每個家庭一開電視便完全沒有對話。',[9,10,12],F('At home, [常規看電視] could reduce time for [家庭對話、戶外玩耍、自主學習]','把注意力論證落到家庭時間分配。','要指出一種日常習慣可能擠走哪些其他重要活動時。',[['At home, ','link','限定家庭場景'],['this','slot','常規看電視'],[' could also reduce time for ','link','亦可能減少'],['family conversation, outdoor play, and independent study.','slot','家庭對話、戶外玩耍、自主學習']])),
  S('At school, watching may turn class into a one-way broadcast rather than participation.','At school 與前句 At home 並列；where...rather than... 對比觀看與參與。','不是說教師永遠不能用任何影像材料。',[10,11,13],F('At school, [常規看電視] may turn [課堂時間] into [單向播放] where [學生觀看而不參與]','把被動問題落到課堂互動。','要比較單向資訊傳送與使用者實際參與時。',[['At school, ','link','限定學校場景'],['it','slot','常規看電視'],[' may turn ','link','可能把'],['valuable classroom time','slot','課堂時間'],[' into ','link','變成'],['a one-way broadcast','slot','單向播放'],[', where ','link','在其中'],['students watch rather than participate.','slot','學生觀看而不參與']])),
  S('Education should be a workshop rather than a theatre seat.','theatre/workshop 對比被動觀看座位與動手參與場域。','此處是比喻，不是要求把教室真的改建成工作坊。',[4,12,14],F('[教育] should not be [劇院座位]; it should be [工作坊]','以精簡比喻收束主動學習觀。','已說明被動接收的缺點，要用簡潔對照強調主動參與時。',[['Education','slot','教育'],[' should not be ','link','不應是'],['a theatre seat','slot','劇院座位'],['; it should be ','link','應是'],['a workshop.','slot','工作坊']])),
  S('I oppose encouraging children to watch television regularly.','In conclusion 重申反對定期鼓勵觀看，不針對偶爾使用節目。','回應原題 at home and school 的常規建議。',[1,13,15],F('In conclusion, I completely disagree with [鼓勵孩子定期看電視的主張]','結論直接重申頻率上的立場。','完成兩條理由後，要重新回答是否應把某行為變成常規時。',[['In conclusion, I completely disagree with ','link','總結反對'],['the idea that children should be encouraged to watch television regularly.','slot','鼓勵孩子定期看電視的主張']])),
  S('Regular viewing at home and school risks passivity, weaker attention and missed richer learning.','As a regular habit 限定家校常規；三項後果收束全文。','原文此句較肯定，但全文前面用 usually/risk/may 保留情境差異。',[7,8,14],F('As [家校常規習慣], [看電視] encourages [被動], weakens [專注], and takes [孩子] away from [更豐富學習]','以三類代價概括兩個主體段。','結尾要合併前述不同代價，回扣是否值得養成某習慣時。',[['As a regular habit at home and in school, ','link','限定家校常規'],['it','slot','看電視'],[' encourages ','link','促成'],['passivity','slot','被動'],[', weakens ','link','削弱'],['attention','slot','專注'],[', and takes ','link','並使'],['children','slot','孩子'],[' away from ','link','遠離'],['richer forms of learning.','slot','更豐富學習']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否贊成鼓勵孩子在家與學校定期看電視？',['完全反對：定期觀看較被動，並可能擠走主動學習及社交活動','完全贊成：看電視可完全取代教師','只贊成取消所有閱讀','沒有立場：只談植物節目'],'I completely disagree；poor substitute for active, guided education。'),
  {type:'multi',prompt:'選出兩條不同的反對理由',detail:'選兩項，再按「確認」。',options:['主動閱讀、實驗與提問可檢驗想法；電視常使孩子被動接收','頻繁看螢幕可能削弱專注、社交與家庭交流，擠走較豐富活動','任何節目都必然製作差','每個孩子一看電視就完全無法學習'],correct:[0,1],why:'第一段比較學習深度，第二段比較注意力與家校社交活動。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對家校常看','節目即使製作良好，也難取代主動引導學習。'],
  ['主體段一 · 被動與主動','閱讀實驗提問可深化理解；植物例子對比畫面記憶與實作。'],
  ['主體段二 · 專注與社交','頻繁螢幕可能擠走閱讀、家庭交談、戶外玩與課堂參與。'],
  ['結論 · 教育應像工作坊','反對把定期看電視培養成家校習慣。'],
],'電視易用 → 學習方式較被動 → 其他活動被擠走 → 主張主動參與。')];
const evidence=[
  Q('為何節目製作良好仍不足以代替教育？',['定期觀看通常缺少主動提問、實作與教師引導','因所有節目必然錯誤','因孩子永遠不能從影像記得任何內容','因教師不應回答問題'],'Even when...well made，仍是 poor substitute。'),
  Q('文章列出哪些主動學習行為？',['閱讀、討論、寫作、實驗與提問','只坐著看畫面','只背節目片名','只比較電視尺寸'],'When 句列行為及檢驗想法的效果。'),
  Q('植物例子比較甚麼？',['觀看者或記得畫面，親手種植、記錄並解釋者更可能真正理解','所有觀看者必然完全無知','種植物必然不能學科學','只有鮮豔畫面才可檢驗想法'],'may remember 與 far more likely to understand 的對比。'),
  Q('「學習錯覺」指甚麼？',['看過資訊似乎等於學會，但思考與實作習慣可能未充分發展','孩子所有時間都未曾接觸任何資訊','節目只要好看就等於理解','電視永遠不播放教育內容'],'illusion of learning 與 underdeveloped habits。'),
  Q('在家常看電視可能減少哪些活動時間？',['家庭對話、戶外玩耍與自主學習','只減少看電視時間','只增加與家人交談時間','完全不影響其他活動'],'At home 句直接列三項。'),
  Q('「劇院座位」與「工作坊」比喻強調甚麼？',['教育應讓學生參與、嘗試和交流，而非只坐著觀看','所有學校都應改成劇院','只有劇院能讓孩子學習','工作坊只指木工課'],'theatre seat/workshop 對比被動與主動。'),
];
const logic=[
  sequence('第一主體段：觀看與主動學習有何差異？',[
    ['中心對比','電視常讓孩子被動接收。'],
    ['主動行為','閱讀、討論、寫作、實驗和提問促使大腦工作。'],
    ['電視形式','經包裝的資訊流常少反思與互動。'],
    ['植物例子','觀看可能記得畫面；種植、記錄及解釋較能深化理解。'],
    ['段落結論','定期觀看或帶來學習錯覺，思考習慣未充分發展。'],
  ],'被動接收 → 缺少檢驗與互動 → 實作較深 → 表面學習風險。'),
  sequence('第二主體段：家校常看如何影響其他能力？',[
    ['發展目標','幼兒需耐心、專注和溝通的日常訓練。'],
    ['螢幕習慣','過頻使用或使閱讀、解題、聽同學較不吸引。'],
    ['家庭時間','可能擠走家庭對話、戶外遊玩和自主學習。'],
    ['課堂時間','可能變成單向播放，學生觀看而不參與。'],
    ['比喻收束','教育應是工作坊而非劇院座位。'],
  ],'重要能力需練習 → 過頻螢幕擠時間 → 家校互動減少 → 倡主動參與。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('科學課讓學生看植物影片後便結束；另一班種植物、記錄並向教師解釋。','文章會認為哪班較可能真正理解？',['實作、記錄並解釋的班，因學生需要檢驗想法與糾正錯誤','只看影片的班必然理解較深','兩班都不可能學植物','教師解釋必然妨礙理解'],['植物例子直接比較觀看與主動實作。','原文判斷相反。','實作可深化。','教師回應是引導。'],[4,6],'grows a plant, records its changes, and explains the process。'),
  T('一個節目拍得很好，學校因此打算每天用它取代討論和實驗。','作者會指出甚麼？',['即使節目製作好，定期觀看也難取代主動、有引導的學習','節目品質好就保證完全取代教師','討論與實驗永遠無用','所有影片都必然內容錯誤'],['Even when...well made 是重要讓步。','忽視主動過程。','原文肯定實作。','沒有此主張。'],[2,4,5],'Even when a programme is well made...poor substitute。'),
  T('學生看完影片能說出幾張畫面，卻解釋不了所學概念。','文章稱這種風險為甚麼？',['看似在學習，但思考習慣及理解未充分建立的學習錯覺','已充分理解所有概念','只要畫面鮮豔就不需解釋','影像必然完全沒有任何資訊'],['illusion of learning 連到例子。','與情境不符。','畫面記憶非理解。','原文承認可記畫面。'],[6,7],'illusion of learning；intellectual habits remain underdeveloped。'),
  T('某孩子每天放學後長時間看節目，較少和家人說話或到戶外玩。','本文第二段會關注哪項代價？',['家中電視時間可能擠走家庭對話與戶外活動','電視時間必然增加所有家庭交流','戶外玩耍不是孩子的活動','文章只關心課堂，不關心家庭'],['At home 明列 conversation/outdoor play。','與原文相反。','原文視為重要。','兩處皆談。'],[8,11],'reduce time for family conversation, outdoor play。'),
  T('課堂把所有時間用於播放節目，學生只能看，不能提問或合作。','「劇院與工作坊」比喻如何應用？',['課堂應像工作坊讓學生參與，而不只像劇院座位被動觀看','教室必須設舞台和售票處','只要播放清晰，互動便不重要','學生觀看等同親手實驗'],['theatre seat/workshop 對比參與。','是比喻。','作者重視互動。','觀看與實作不同。'],[12,13],'students watch rather than participate；workshop。'),
  T('學校想讓孩子定期用螢幕代替閱讀章節和解難練習。','作者擔心哪種學習偏好？',['孩子可能覺得較慢、較費心的閱讀與解題不吸引','所有孩子必然立刻失去閱讀能力','閱讀與解題不需專注','螢幕不可能影響時間安排'],['If...may find...less appealing 保留可能性。','不是必然完全喪失。','這些任務較 demanding。','時間會被擠走。'],[9,10],'slower but more demanding tasks...less appealing。'),
  T('有人說：「作者禁止任何教育影片，連偶爾觀看也不准。」','哪項更準確？',['作者反對鼓勵家校定期觀看作常規，並未把每次教育影片說成必然無效','轉述完全準確','作者只反對在校，不反對在家','作者認為影片必然比實驗有效'],['regularly / regular habit 是範圍。','原文未作絕對禁令。','家校皆反對常規。','主動更佳。'],[1,2,14,15],'watch it regularly either at home or at school。'),
  T('一個孩子看科學資訊時同時提問、實驗及向教師解釋。','文章的核心評估應看甚麼？',['孩子是否主動檢驗想法、糾正錯誤並深化理解，而非只看了多久','只看節目播放分鐘數','只看畫面顏色是否鮮豔','只看電視型號'],['主動過程是核心，不宜以觀看時數代替。','時間不等於理解。','例子說畫面記憶有限。','無關學習。'],[3,4,6,7],'ideas are tested, mistakes are corrected, and understanding becomes deeper。'),
  T('另一議題中，有人提議每天用錄音代替學生與教師對話。','可跨題套用哪種檢查？',['比較單向資訊輸入與學生提問、回應和實作的機會','只看錄音音量是否夠大','任何錄音都必然有害','只要有人聽到聲音就必然理解'],['本文比較 polished stream 與 reflection/interaction。','音量不是核心。','沒有絕對禁用。','被動接收不足。'],[3,4,5,12],'little room for reflection or interaction。'),
  T('一所學校希望訓練孩子耐心、專注及溝通。','哪組活動較符合本文？',['閱讀、解題、聆聽同學及家庭交談，並讓孩子主動參與','只增加單向播放時間','完全取消學生提問','只讓孩子記住鮮豔畫面'],['原文列這些需訓練的能力及活動。','單向較被動。','提問是主動。','畫面記憶不等於理解。'],[4,9,10,11,12],'routines that train patience, attention, and communication。'),
  T('家庭與學校都將看電視列為每天的主要學習安排。','文章會評估哪些合併後果？',['被動接收、專注力下降，以及家庭對話和課堂參與時間減少','所有孩子必然即時成為專家','只有學校環境會受影響','定期觀看必然增加戶外玩耍'],['結論把家校常規後果合併。','沒有保證。','家校都談。','可能擠走活動。'],[3,8,10,11,12,15],'regular habit at home and in school...passivity, weakens attention。'),
  T('要用一句話概括文章立場而不過度概括。','哪項最好？',['作者反對鼓勵孩子在家校定期看電視，主張更多主動引導學習與能訓練專注、社交的活動','作者認為每個節目都製作差','作者要求完全取消所有影像','作者只關心孩子會否記住節目名字'],['兩段分別談學習深度與其他能力。','即使節目好仍不足。','未作全面禁令。','非論證重點。'],[1,2,3,4,8,9,12,13,14,15],'poor substitute for active, guided education；theatre seat/workshop。'),
];
export default {
  key:'opinion:49',
  meta:{topic:'兒童定期看電視、主動學習與專注社交',summary:'作者反對鼓勵兒童在家與學校定期看電視。即使節目製作良好，持續單向觀看也難取代閱讀、討論、實驗及教師引導；植物例子說明畫面記憶和真正理解有別。過頻螢幕使用又可能擠走較慢的閱讀解題、家庭對話、戶外活動及課堂參與。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[],
};
