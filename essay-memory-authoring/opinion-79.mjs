import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:79'].map(x=>x.english);
const simple=[
'In many homes, people judge activities by how soon they see clear results.',
'So some people think children who read story books for hours are wasting time they could spend on more useful tasks.',
'I strongly disagree because reading stories builds language, thinking, and understanding of feelings in ways few other children’s activities can.',
'The first reason is that story books help children build skills needed for almost all learning.',
'When children read, they are not just filling time; they learn new words, ways to make sentences, ideas, and ways to put events in order.',
'A child following a story must remember earlier parts, guess what might happen next, and understand why people in the story act as they do.',
'That is thinking practice, not doing nothing.',
'For example, a child who often reads adventure stories may slowly get better at explaining why things happen, describing events, and writing clear paragraphs at school.',
'Other activities can teach good habits, but story books give children many chances to use language, which helps them learn almost every school subject.',
'Reading story books also matters because it builds imagination and understanding of others’ feelings.',
'Unlike many kinds of fun, a book does not show a child every picture; children must imagine places, voices, danger, and feelings for themselves.',
'This calm use of imagination helps children focus and gives them time to think deeply.',
'Even more important, stories help children see life from another person’s view.',
'A child reading about someone lonely, an animal that is afraid, or a brave friend can start to understand feelings outside their own life.',
'This growth in understanding feelings is not an extra with no purpose; it can help children be kinder friends, listen better, and grow into more thoughtful adults.',
'In short, I strongly reject the idea that children waste time by reading story books.',
'It is not useless at all; reading is a very rich way for children to build language, imagination, and character.',
];
const vocabulary=[
[['often judged','judge','往往被評價'],['how quickly','how soon','多快'],['visible results','clear results','可見成果']],
[['For that reason','So','因此'],['spend many hours','for hours','花很多時間'],['wasting time','wasting time','浪費時間'],['practical pursuits','useful tasks','實用活動']],
[['completely disagree','strongly disagree','完全不同意'],['develops language, thinking, and emotional intelligence','builds language, thinking, and understanding of feelings','培養語言思考情緒智力'],['few childhood activities can match','few other children’s activities can','少有活動能相比']],
[['build the foundation','build skills needed','建立基礎'],['almost every form of learning','almost all learning','幾乎所有學習']],
[['not merely passing time','not just filling time','不只消磨時間'],['absorbing vocabulary','learn new words','吸收詞彙'],['sentence patterns','ways to make sentences','句式'],['ways of organising events','ways to put events in order','組織事件']],
[['follows a plot','following a story','跟隨情節'],['remember earlier details','remember earlier parts','記住細節'],['predict what may happen next','guess what might happen next','預測後續'],['characters make certain choices','people in the story act as they do','角色選擇']],
[['mental training','thinking practice','思維訓練'],['idleness','doing nothing','無所事事']],
[['regularly reads','often reads','經常閱讀'],['gradually become better','slowly get better','逐漸更擅長'],['explaining causes','explaining why things happen','解釋原因'],['coherent paragraphs','clear paragraphs','連貫段落']],
[['useful habits','good habits','有用習慣'],['language-rich environment','many chances to use language','語言豐富環境'],['bridge to almost every academic subject','helps them learn almost every school subject','通往各學科橋樑']],
[['valuable','matters','有價值'],['develops imagination and empathy','builds imagination and understanding of others’ feelings','培養想像與同理心']],
[['forms of entertainment','kinds of fun','娛樂形式'],['hand every image to the child ready-made','show a child every picture','現成展示畫面'],['picture places, voices, dangers, and emotions internally','imagine places, voices, danger, and feelings for themselves','自行想像場景']],
[['quiet act of imagination','calm use of imagination','安靜想像'],['strengthens concentration','helps children focus','加強專注'],['space to think deeply','time to think deeply','深入思考空間']],
[['More importantly','Even more important','更重要'],['step into other people’s shoes','see life from another person’s view','代入他人處境']],
[['lonely character','someone lonely','孤單角色'],['frightened animal','animal that is afraid','受驚動物'],['beyond his or her own small world','outside their own life','超出自身世界']],
[['emotional growth','growth in understanding feelings','情感成長'],['decorative extra','extra with no purpose','可有可無裝飾'],['kinder classmates','kinder friends','更友善同學'],['better listeners','listen better','更好聆聽者'],['thoughtful adults','more thoughtful adults','更體貼成年人']],
[['In conclusion','In short','總結'],['completely reject','strongly reject','完全反對'],['a waste of time','waste time','浪費時間']],
[['Far from being useless','not useless at all','絕非無用'],['one of the richest ways','a very rich way','最豐富方式之一'],['language, imagination, and character','language, imagination, and character','語言想像品格']],
];
const chunkOverrides={6:['This is mental training,','not idleness.'],12:['More importantly, stories allow them','to step into other people’s shoes.'],16:['Far from being useless,','it is one of the richest ways for children to build language, imagination, and character.']};
const simpleChunkOverrides={6:['That is thinking practice,','not doing nothing.'],12:['Even more important, stories help children','see life from another person’s view.'],16:['It is not useless at all;','reading is a very rich way for children to build language, imagination, and character.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'根據句中因果、對比與實際功能判斷。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['activities','visible results'],['creative hobbies','visible skills'],'引言指出人們常用短期成果衡量活動。','題目把長遠價值誤當沒有即時效益時。',[1,2,3]),
makeStructure(1,['children who spend many hours reading story books','more practical pursuits'],['young people who spend time drawing','exam preparation'],'把對方「浪費時間」主張完整交代。','需要公平提出對方認為時間應改用於何處時。',[0,2,3]),
makeStructure(2,['story reading','language, thinking, and emotional intelligence','few childhood activities'],['playing music','memory, attention, and cooperation','few quick entertainment options'],'明示完全反對，並概述三種長遠收益。','反駁「無用」主張時，先列實際能力成果。',[1,3,9]),
makeStructure(3,['story books','almost every form of learning'],['early conversations','almost every form of teamwork'],'主體一指出基礎能力可轉移到其他學習。','討論活動的價值時，先交代其基礎性作用。',[4,5,8]),
makeStructure(4,['children','vocabulary, sentence patterns, ideas, and ways of organising events'],['beginners','new terms, common patterns, ideas, and ways of ordering steps'],'用不只消磨時間，列出實際學習內容。','回應某活動被視為消遣時，具體列出它訓練甚麼。',[3,5,6]),
makeStructure(5,['A child who follows a plot','earlier details','what may happen next','characters make certain choices'],['A student who follows an experiment','earlier observations','what may happen next','researchers make certain choices'],'從記憶、預測及推論展示思考過程。','要拆解活動背後的認知步驟時。',[4,6,7]),
makeStructure(6,['mental training','idleness'],['active practice','empty leisure'],'用簡短對照推翻「無所事事」標籤。','已列出具體思考步驟，要一句概括其性質時。',[4,5,7]),
makeStructure(7,['a child who regularly reads adventure stories','explaining causes, describing situations, and writing coherent paragraphs'],['a child who regularly listens to rich stories','explaining reasons, describing events, and speaking clearly'],'生活例子說明練習可轉為學校表達能力。','抽象指出能力後，要展示它如何在其他場景出現時。',[4,5,8]),
makeStructure(8,['Other activities','useful habits','story books','a language-rich environment','language','almost every academic subject'],['Team sports','useful routines','debate clubs','a language-rich environment','clear expression','almost every school task'],'承認其他活動也有用，再指出語言跨學科價值。','比較不同活動時，避免否定對方所有收穫。',[3,7,9]),
makeStructure(9,['Reading story books','imagination and empathy'],['Listening to personal stories','imagination and empathy'],'第二理由由學業能力轉向想像與同理心。','已談知識或技能，轉談情感與人際能力時。',[10,11,13]),
makeStructure(10,['a book','every image','the child','places, voices, dangers, and emotions'],['an audio story','every scene','a child','places, faces, risks, and emotions'],'比較現成畫面與讀者主動想像。','解釋媒介如何要求使用者自己建構心像時。',[9,11,12]),
makeStructure(11,['This quiet act of imagination','concentration','children','think deeply'],['This quiet practice of reflection','attention','students','consider ideas carefully'],'由想像活動推至專注和深入思考。','已說明內在想像，需解釋其認知好處時。',[9,10,12]),
makeStructure(12,['stories','other people’s shoes'],['personal accounts','other people’s shoes'],'用常用比喻引入同理心。','第二理由需要從想像轉向理解他人處境時。',[9,13,14]),
makeStructure(13,['A child who reads about a lonely character, a frightened animal, or a brave friend','feelings beyond his or her own small world'],['A learner who reads about a displaced family, an anxious worker, or a new neighbour','experiences beyond his or her own familiar world'],'以多種人物經歷說明同理心如何形成。','提出抽象同理心後，示範讀者如何接觸不同情感時。',[12,14,15]),
makeStructure(14,['That kind of emotional growth','children','kinder classmates, better listeners, and more thoughtful adults'],['That kind of social understanding','young people','kinder neighbours, better listeners, and more thoughtful citizens'],'說明情感能力不是裝飾，而有日常人際成果。','需反駁軟技能無實際用途，列出可見行為結果時。',[9,12,13]),
makeStructure(15,['reading children’s story books','a waste of time'],['practising music in childhood','a waste of time'],'結論直接回題目的浪費時間說法。','全文反駁某活動無用，結尾明確重申立場時。',[2,14,16]),
makeStructure(16,['it','language, imagination, and character'],['creative play','curiosity, imagination, and character'],'以三項能力作最後總結。','結尾要把多段收益濃縮成幾項核心能力時。',[2,8,15]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'按原文推進次序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者認為兒童讀故事書是浪費時間嗎？',['完全反對；閱讀培養語言、思考、想像與同理心','完全同意；只有即時可見成績才算有用','沒有表態；文章只講通勤讀書','部分同意；閱讀不能幫助學習'],'作者清楚完全反對。'),{type:'multi',prompt:'選出兩段主體各自的核心理由',detail:'選兩項，再按「確認」。',options:['故事閱讀訓練語言與情節推理，是學習基礎','想像人物處境有助專注與同理心','兒童讀書可立即取得所有學科滿分','只有故事書才可教導任何有用習慣'],correct:[0,1],why:'主體一談語言與推理，主體二談想像與情感。'}];
const route=[sequence('排好全文四段',[['引言 · 反對浪費說','質疑只以即時成果衡量活動。'],['主體一 · 學習基礎','詞彙、句式與情節推理轉化為表達能力。'],['主體二 · 內在成長','自行想像、專注並理解他人感受。'],['結論 · 多重收穫','故事書有助語言、想像及品格形成。']],'即時成果標準 → 認知訓練 → 情感成長 → 反對浪費說。')];
const evidence=[Q('跟隨情節時孩子需做哪三件事？',['記舊細節、預測後續、理解角色選擇','只數書頁、測量書架、記下書價','只模仿封面、尋找廣告、關閉圖書','只記作者姓名、出版社與出版年份'],'原文列記憶、預測、理解動機。'),Q('經常讀冒險故事可幫助甚麼學校表達？',['解釋原因、描述情境及寫連貫段落','保證每科考試都取得滿分','完全取代教師和同學','不用學習任何新詞語'],'例子展示可轉移的語言能力。'),Q('書本與現成影像娛樂相比要求甚麼？',['孩子自行想像場景、聲音、危險與情感','只需背下每一頁的頁碼','孩子必須複製每幅現成圖片','所有人物畫面都自動播放'],'書本不把所有畫面現成給孩子。'),Q('故事如何培養同理心？',['閱讀不同人物，理解自己生活外的感受','只讓孩子重複自己的日常經歷','保證孩子從不感到害怕','使所有故事人物擁有同一想法'],'代入孤單、受驚、勇敢等處境。')];
const logic=[sequence('主體一：故事書怎樣支撐學習？',[['文字輸入','詞彙、句式、想法和事件次序。'],['情節推理','記憶舊事、預測後續、理解選擇。'],['辨明性質','這是思維訓練，而非無所事事。'],['學校成果','更能解釋原因、描述情境、寫連貫段落。'],['廣泛作用','語言是學習各學科的橋樑。']],'閱讀內容 → 思考步驟 → 可轉移表達能力。'),sequence('主體二：閱讀如何帶來情感成長？',[['主動想像','書本不提供每一幅現成畫面。'],['認知效果','想像加強專注，提供深入思考空間。'],['代入他人','故事讓孩子走進不同人物處境。'],['情感例子','理解孤單、恐懼、勇氣等感受。'],['實際作用','變得更友善、更會聆聽、更體貼。']],'自行想像 → 同理心 → 人際行為。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('孩子讀故事時，記住前文並猜測角色下一步行動。','這反映甚麼能力？',['閱讀同時訓練記憶、預測與因果推理','讀故事只是在消耗時間，完全無需思考','只要能預測情節，便必然精通每科','記住角色名字等於懂得全部社會知識'],['對應情節推理。','有認知活動。','不保證全科。','不等於全部知識。'],[4,5,6],'remember details; predict; understand choices'),
T('家長只重視孩子立刻考到多少分，忽略長期表達能力。','文章會質疑哪項判準？',['只靠即時可見成果衡量活動是否有價值','應以孩子讀過多少書封面判斷能力','只要有考試分數，所有活動都必然無用','任何長期活動都無法影響日後學習'],['引言批評狹窄尺度。','封面非成果。','非全部無用。','長期效益是重點。'],[0,1,2],'judged by visible results'),
T('一名學生讀冒險故事後，更善於解釋事件原因。','這符合哪個轉移？',['情節閱讀可支持學校的連貫表達能力','故事只訓練記住故事封面的顏色','只要讀一本書，寫作便保證滿分','解釋原因完全不需要理解先後事件'],['原文冒險故事例子。','不只封面。','非保證滿分。','需理解情節。'],[5,7,8],'explaining causes; coherent paragraphs'),
T('學生聽故事時要在腦中建構人物聲音與場景。','哪個主體二論點適用？',['自行想像可促進專注與深入思考','只有現成影像才能引發任何想像','腦中有畫面，就表示沒有認知活動','想像人物會令學生忘記所有現實事物'],['主動建構畫面。','非只靠現成。','正是認知活動。','無此必然。'],[9,10,11],'picture places and voices internally'),
T('孩子讀到孤單角色，開始理解新同學的感受。','這是哪種長遠收穫？',['代入他人處境，形成同理心與友善行為','只會學到孤單角色使用甚麼顏色衣服','理解新同學代表不用再練習聆聽','閱讀一次便保證每個同學永不爭執'],['故事與人際連結。','非只細節。','聆聽仍重要。','不保證。'],[12,13,14],'step into others’ shoes; kinder classmates'),
T('有人認為語言學習只對語文科有幫助。','主體一怎樣回應？',['語言可作理解幾乎所有學科的橋樑','只有故事書才會培養任何生活習慣','學習理科完全不需要讀懂題目文字','只要識字，便不用掌握任何學科概念'],['language bridge across subjects。','其他活動也有用。','需讀懂文字。','識字不足。'],[3,8],'language is bridge to academic subjects'),
T('孩子學畫畫也能培養耐心，家長因此說故事書毫無價值。','作者會怎樣比較？',['其他活動有益，閱讀另有語言優勢','否定畫畫所有益處，才可支持閱讀','只要畫畫有用，閱讀便必然沒有作用','兩種活動只能挑一種，絕不可並行'],['Other activities may teach habits, but...','不需否定。','可並存。','非二選一。'],[8],'other activities may teach useful habits; books language-rich'),
T('故事書讓孩子理解一隻受驚動物的感受。','哪項推論最貼近文章？',['讀者可練習理解自身經驗之外的情緒','動物故事只教孩子背下動物名字','孩子讀過一次便不會再感到害怕','只要有受驚情節，故事便沒有教育價值'],['對應情感世界擴展。','不只名字。','非保證。','有情感價值。'],[12,13],'feelings beyond own small world'),
T('某活動看似安靜，卻讓孩子安排事件次序、思考人物動機。','文章會如何評價？',['外表安靜不等於無所事事，仍是思維訓練','只有大聲活動才可能訓練任何能力','人物動機與情節次序都不需要推理','思考活動若無即時分數便毫無作用'],['This is mental training。','安靜亦能思考。','需推理。','長期能力。'],[4,5,6],'mental training, not idleness'),
T('學生從角色的選擇學到如何聆聽和體諒同學。','這說明情感成長有何作用？',['不只是裝飾，還可改善實際人際行為','只在故事中有效，現實中必然完全無用','能讓學生從此毋須再與他人溝通','讀者只要有同理心，就永遠不犯錯'],['emotional growth has practical effects。','可轉移。','仍要溝通。','非完美保證。'],[12,13,14],'not decorative extra; better listeners'),
T('孩子能透過故事同時練詞彙、預測情節、想像人物。','對「浪費時間」說法最好的回應？',['同一活動能培養多種可轉移能力','故事只有在考試出現時才有任何用處','只要讀得夠快，孩子便不需要理解','任何有趣活動都無法同時產生學習'],['整合兩段主體。','價值更廣。','理解是核心。','樂趣可有學習。'],[2,4,5,9,10,11,12,14],'language, thinking and emotional intelligence'),
T('要概括作者對兒童讀故事書的看法。','哪項最完整？',['反對浪費說；閱讀培養語言想像與品格','完全支持浪費說；故事只會妨礙學習','不作判斷；文章僅介紹幾類兒童故事書','部分贊成；故事能學詞語但不能同理'],['立場與兩段收益俱全。','與原文相反。','有明確立場。','同理是重點。'],[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],'Far from being useless; language, imagination, character'),
];
const plausibleAlternatives=[
  [['閱讀訓練記憶，預測則主要靠猜測運氣','閱讀能預測情節，因果推理可留給課堂','記住前文有用，人物選擇則較少值得分析'],['預測須利用線索，不只是碰運氣。','閱讀情節本身也練習因果思考。','分析角色行動正是閱讀的認知活動。']],
  [['只看即時分數，長期表達可由其他活動補足','閱讀成果較難量度，故宜先看購書數量','長期表達有價值，但應先達成短期分數'],['把可見分數置於閱讀的長期價值之前。','購書數量不能衡量能力發展。','作者質疑只依即時成果排序的準則。']],
  [['情節閱讀可培養表達，寫作仍只靠背詞','故事幫助記憶人物，連貫表達靠考試','讀冒險故事有趣，解釋原因則由理科教學'],['組織事件也能支持連貫寫作。','故事中的因果理解可轉移到學校表達。','情境明示學生更善於解釋事件原因。']],
  [['自行想像有助投入，深入思考則要看影片','在腦中建構場景，可減少對情節的注意','聽故事主要訓練記憶，想像作用較小'],['文章認為想像亦促進專注與思考。','想像場景往往要求追蹤情節。','題目明確涉及主動建構人物與場景。']],
  [['代入他人處境有益，友善行為仍需另學','理解孤單角色，便可先忽略新同學的處境','閱讀可促同理心，主要仍是增加詞彙量'],['文章指出同理心可影響日常待人方式。','故事經驗可幫助理解真實他人的感受。','此例聚焦情感成長，不只是詞彙。']],
  [['語言有助多科學習，但影響主要在語文課','理解題目文字有用，學科概念則不必學','閱讀可增詞彙，各科仍應避開文字材料'],['語言基礎可支撐多個學科。','語言是橋樑，不是替代學科概念。','多數學科都須閱讀及理解材料。']],
  [['畫畫有益，閱讀可等到語文測驗前再做','其他活動有益，語言能力只能從閱讀取得','畫畫訓練耐心，故事書則主要帶來娛樂'],['閱讀的語言作用不只在臨時應試。','作者沒有說語言只能透過故事書培養。','把閱讀的認知與語言作用漏掉。']],
  [['動物故事可引起好奇，情緒理解則較有限','讀者能理解動物恐懼，仍與他人感受無關','受驚情節能建立記憶，主要作用在詞彙'],['作者強調代入不同生命處境。','理解他者感受正是可轉移的能力。','此例談同理心，不只是記詞。']],
  [['安靜活動可訓練思維，但較難用在學校','安排事件次序有用，人物動機只需記住','活動安靜，家長可先看分數再判斷價值'],['閱讀中的思考可支持學校表達。','分析動機需要推論，不只是記憶。','即時分數不是本文的唯一判準。']],
  [['情感成長有助理解故事，現實應用則較弱','同理心能改善待人方式，仍只是學習裝飾','聆聽同學有益，故事角色選擇則無關'],['文章把故事中的代入連到日常行為。','實際人際行為正顯示情感成長的作用。','角色選擇可成為理解他人動機的練習。']],
  [['同一活動可練多種能力，主要仍服務考試','故事能練詞彙與想像，預測則不算能力','多項收穫存在，但閱讀仍應視為消遣'],['可轉移能力不只限於應試。','預測情節包含理解與推理。','閱讀有學習與情感價值，並非純消遣。']],
  [['反對浪費說；閱讀主要培養語言技能','部分反對；故事可增詞彙但少有其他作用','反對浪費說；故事重點在減少課外活動'],['遺漏想像、專注與同理心的收穫。','文章指出跨越詞彙的多方面能力。','閱讀價值不以減少其他活動為前提。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:79',meta:{topic:'兒童讀故事書是否浪費時間',summary:'作者完全反對故事書浪費時間的說法。閱讀讓兒童吸收詞彙、句式及事件次序，記憶、預測並理解角色選擇，進而改善學校表達；其他活動有益，閱讀仍提供跨學科的語言基礎。故事也讓孩子自行想像，增強專注，代入不同人物，培養同理心與日常人際能力。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
