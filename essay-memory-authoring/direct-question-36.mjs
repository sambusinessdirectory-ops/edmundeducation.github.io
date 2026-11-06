// Sentence-by-sentence authored memorisation support for Direct Question 36.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-36-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:36'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'What children do before they start school often affects how well they do in their first years there.',
  'Learning to read early is very important because it helps children understand words, directions and ideas, which they need for school.',
  'But reading alone does not decide how well a child will do; young children are also affected by home life, how they get on with others and whether they can handle their feelings.',
  'Reading early matters a lot at school because children need it in almost every subject.',
  'A child who can read words, understand a sentence and follow a short story learns more than English; they learn how to learn new things.',
  'For example, children need to read questions correctly even on an easy maths page, and they need to understand written explanations in science.',
  'So children who read early are less likely to feel confused in class and more likely to feel sure of themselves when work gets harder.',
  'Feeling sure of themselves can help them move forward: they may ask questions, finish work by themselves and learn good study habits.',
  'Even so, other things that happen before school also affect how well children do later.',
  'One very important thing is help from parents, especially when they often talk with children, answer questions and keep a calm daily routine at home.',
  'Children with this help often start school knowing more words, able to focus better and understanding that learning matters.',
  'How children get on with others and handle feelings is also important.',
  'Children who can share toys, wait for their turn and deal with small disappointments are usually more ready for school lessons.',
  'So doing well before school is not just about books; it also comes from talking, playing and having steady relationships.',
  'To sum up, reading early is very important because it helps children understand schoolwork, feel sure of themselves and learn on their own in every subject.',
  'Even so, how children do later at school also depends on help from family, handling feelings well and learning how to get on with others before school.',
];
const vocabulary=[
  [['first years at school','first years there','入學首數年'],['shaped by','affects','受影響'],['formal education begins','start school','正式教育開始']],
  [['Early reading','Learning to read early','早期閱讀'],['especially important','very important','尤其重要'],['gives children access to','helps children understand','讓孩子接觸'],['language, instructions and ideas','words, directions and ideas','語言指示觀念'],['academic learning','school','學科學習']],
  [['reading alone','reading alone','單靠閱讀'],['does not determine success','does not decide how well a child will do','不能決定成功'],['preschool children','young children','學前兒童'],['home environment','home life','家庭環境'],['social development','how they get on with others','社交發展'],['emotional readiness','whether they can handle their feelings','情緒準備']],
  [['Early reading skills','Reading early','早期閱讀能力'],['crucial role','matters a lot','關鍵作用'],['academic performance','at school','學業表現'],['gateway to almost every subject','need it in almost every subject','各科基礎']],
  [['recognise words','read words','認字'],['follow a sentence','understand a sentence','理解句子'],['simple story','short story','簡單故事'],['not merely learning English','learns more than English','不只學英語'],['learning how to learn','learn how to learn new things','學會學習']],
  [['basic mathematics worksheet','easy maths page','基本數學工作紙'],['read questions accurately','read questions correctly','準確讀題'],['science','science','科學'],['understanding explanations','understand written explanations','理解解釋']],
  [['Early readers','children who read early','早期閱讀者'],['less likely to feel lost','less likely to feel confused','較不易迷失'],['build confidence','feel sure of themselves','建立自信'],['schoolwork becomes harder','work gets harder','課業變難']],
  [['This confidence','Feeling sure of themselves','這份自信'],['quiet engine of progress','help them move forward','推進進步'],['complete tasks independently','finish work by themselves','獨立完成任務'],['stronger study habits','good study habits','更好的學習習慣']],
  [['That said','Even so','話雖如此'],['preschool factors','things that happen before school','學前因素'],['later achievement','how well children do later','日後成就']],
  [['parental involvement','help from parents','父母參與'],['talk to children regularly','often talk with children','經常交談'],['answer their questions','answer questions','回答提問'],['calm routine at home','calm daily routine at home','安定生活規律']],
  [['Such children','Children with this help','這些孩子'],['better vocabulary','knowing more words','詞彙較豐富'],['stronger concentration','able to focus better','較能專注'],['clearer sense that learning matters','understanding that learning matters','明白學習重要']],
  [['Social and emotional development','How children get on with others and handle feelings','社交情緒發展'],['another key factor','also important','另一關鍵因素']],
  [['share toys','share toys','分享玩具'],['wait for their turn','wait for their turn','輪候'],['cope with small frustrations','deal with small disappointments','處理小挫折'],['better prepared for classroom life','more ready for school lessons','更能適應課堂']],
  [['In this sense','So','從這角度'],['preschool success','doing well before school','學前發展'],['not only built with books','not just about books','不只靠書本'],['conversation, play and stable relationships','talking, playing and having steady relationships','對話遊戲與穩定關係']],
  [['In conclusion','To sum up','總結'],['early reading skills','reading early','早期閱讀能力'],['extremely important','very important','極重要'],['support understanding, confidence and independent learning','helps children understand schoolwork, feel sure of themselves and learn on their own','支援理解自信獨立學習'],['across the curriculum','in every subject','各學科']],
  [['Nevertheless','Even so','然而'],['academic future','how children do later at school','未來學業'],['family support','help from family','家庭支持'],['emotional maturity','handling feelings well','情緒成熟'],['social habits','learning how to get on with others','社交習慣']],
];
const chunkOverrides=[
  ['A child’s first years at school','are often shaped by what has already happened','before formal education begins.'],
  ['Early reading is especially important','because it gives children access to language, instructions and ideas,','all of which are central to academic learning.'],
  ['However, reading alone does not determine success;','preschool children are also strongly influenced','by their home environment, social development and emotional readiness.'],
  ['Early reading skills play a crucial role','in academic performance','because they form the gateway to almost every subject.'],
  ['A child who can recognise words, follow a sentence','and understand a simple story','is not merely learning English;','they are learning how to learn.'],
  ['For example, even a basic mathematics worksheet','requires pupils to read questions accurately,','while science depends heavily on understanding explanations.'],
  ['Early readers are therefore less likely to feel lost in class','and more likely to build confidence','as schoolwork becomes harder.'],
  ['This confidence can become a quiet engine of progress,','pushing them to ask questions,','complete tasks independently and develop stronger study habits.'],
  ['That said, several other preschool factors','also shape later achievement.'],
  ['One of the most important is parental involvement,','especially when parents talk to children regularly,','answer their questions and create a calm routine at home.'],
  ['Such children often arrive at school','with better vocabulary, stronger concentration','and a clearer sense that learning matters.'],
  ['Social and emotional development','is another key factor.'],
  ['Children who can share toys, wait for their turn','and cope with small frustrations','are usually better prepared for classroom life.'],
  ['In this sense, preschool success is not only built with books;','it is also built through conversation, play','and stable relationships.'],
  ['In conclusion, early reading skills are extremely important','because they support understanding, confidence and independent learning','across the curriculum.'],
  ['Nevertheless, a child’s academic future','is also shaped by family support, emotional maturity','and social habits developed before school.'],
];
const simpleChunkOverrides=[
  ['What children do before they start school','often affects how well they do','in their first years there.'],
  ['Learning to read early is very important','because it helps children understand words, directions and ideas,','which they need for school.'],
  ['But reading alone does not decide how well a child will do;','young children are also affected by home life,','how they get on with others','and whether they can handle their feelings.'],
  ['Reading early matters a lot at school','because children need it in almost every subject.'],
  ['A child who can read words, understand a sentence','and follow a short story learns more than English;','they learn how to learn new things.'],
  ['For example, children need to read questions correctly','even on an easy maths page,','and they need to understand written explanations in science.'],
  ['So children who read early are less likely','to feel confused in class','and more likely to feel sure of themselves','when work gets harder.'],
  ['Feeling sure of themselves can help them move forward:','they may ask questions, finish work by themselves','and learn good study habits.'],
  ['Even so, other things that happen before school','also affect how well children do later.'],
  ['One very important thing is help from parents,','especially when they often talk with children,','answer questions and keep a calm daily routine at home.'],
  ['Children with this help often start school','knowing more words, able to focus better','and understanding that learning matters.'],
  ['How children get on with others','and handle feelings is also important.'],
  ['Children who can share toys, wait for their turn','and deal with small disappointments','are usually more ready for school lessons.'],
  ['So doing well before school is not just about books;','it also comes from talking, playing','and having steady relationships.'],
  ['To sum up, reading early is very important','because it helps children understand schoolwork,','feel sure of themselves and learn on their own','in every subject.'],
  ['Even so, how children do later at school','also depends on help from family,','handling feelings well','and learning how to get on with others before school.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的語意關係相同。`,distractorReason:`這句${focus}，但沒有原句所建立的關係。`};}
const structures=[
  card('A pupil’s first months in class are often shaped by the support received at home before school.','以 are shaped by 把入學後表現連到入學前經歷',[1,3,8],fixed(0,'[孩子入學最初幾年] are often shaped by [入學前經歷] before [正式教育開始].','先建立時間關係：入學前經歷會影響入學後表現。','題目問早期能力的影響，要從孩子入學前後的連續性開篇時。',[' are often shaped by ', ' before '],['受到影響的學校階段','已經發生的學前經歷','正式學校階段開始點'])),
  card('Early music is especially important because it gives children access to sounds and patterns, all of which are central to later learning.','以 all of which 回指語言指示觀念的學習作用',[0,3,4],fixed(1,'[早期閱讀] is especially important because it gives children access to [語言、指示與觀念], all of which are central to [學科學習].','閱讀提供的不是單一科目技巧，而是理解學習內容的共同入口。','要指出某能力為何重要，用 because 說明它提供的資源，再用 all of which 補足用途時。',[' is especially important because it gives children access to ', ', all of which are central to '],['被評價的早期能力','該能力打開的內容','這些內容所支援的學習'])),
  card('However, drawing alone does not determine success; children are also strongly influenced by family and friendships.','以 However ... alone does not ...; also 平衡閱讀與其他因素',[1,8,11],fixed(2,'However, [閱讀] alone does not determine [學業成功]; [學前兒童] are also strongly influenced by [家庭、社交與情緒準備].','防止把閱讀說成唯一條件，預告第二問的其他學前因素。','雙問題目中已肯定閱讀，接着須避免單因解釋並引出其他因素時。',['However, ', ' alone does not determine ', '; ', ' are also strongly influenced by '],['重要但非唯一的能力','不能單獨決定的結果','受其他因素影響的孩子','另外需要考慮的條件'])),
  card('Early listening skills play a crucial role in school because they form the gateway to almost every subject.','以 because 連早期閱讀與跨學科成績',[1,4,5],fixed(3,'[早期閱讀能力] play a crucial role in [學業表現] because they form the gateway to [幾乎每科].','主體段先提出閱讀是跨學科的基礎。','要論證閱讀的重要程度，需指出它不只影響語文課時。',[' play a crucial role in ', ' because they form the gateway to '],['被評價的早期能力','受影響的學業結果','因而可進入的學科'])),
  card('A child who can follow signs and simple instructions is not merely learning words; they are learning how to work alone.','以 not merely ...; they are ... 升格閱讀到學會學習',[3,5,6],fixed(4,'A child who can [認字讀句明白故事] is not merely learning [英語]; they are learning [怎樣學習].','閱讀理解同時教孩子處理新資訊，而非只增英語知識。','已說閱讀通往各科，要解釋識字讀句為何帶來一般學習能力時。',['A child who can ', ' is not merely learning ', '; they are learning '],['已具備的閱讀能力','較窄的科目理解','更廣的學習能力'])),
  card('For example, even a maths quiz requires pupils to read carefully, while science depends heavily on clear explanations.','以 while 並列數學與科學的閱讀需求',[3,4,6],fixed(5,'For example, even [基本數學工作紙] requires pupils to [準確讀題], while [科學] depends heavily on [理解解釋].','以數學題目及科學說明證明閱讀影響多個學科。','跨學科主張已提出，要用至少兩門不同學科支持時。',['For example, even ', ' requires pupils to ', ', while ', ' depends heavily on '],['第一門課的文字材料','第一門課所需閱讀行動','第二門課','第二門課所需理解'])),
  card('Early readers are therefore less likely to feel lost and more likely to build confidence as lessons become harder.','以 less likely ... more likely 對照迷失與自信',[5,7,8],fixed(6,'[早期具閱讀能力孩子] are therefore less likely to [課堂迷失] and more likely to [建立自信] as [課業變難].','能讀懂課堂內容，較不易跟不上，亦較能建立自信。','兩科例子已說明閱讀用途，要交代它對孩子課堂感受的後續影響時。',[' are therefore less likely to ', ' and more likely to ', ' as '],['較有準備的學生','較少出現的困境','較可能形成的心理好處','課業難度變化'])),
  card('This confidence can become a quiet engine of progress, pushing them to ask questions, complete tasks independently and build study habits.','以 pushing ... 串起自信與三項學習行動',[6,8,9],fixed(7,'This confidence can become [進步動力], pushing them to [發問], [獨立完成任務] and [培養學習習慣].','自信不只感受較好，也推動提問、獨立做事和習慣養成。','已說閱讀帶來自信，要解釋這份自信如何轉成學習行動時。',['This confidence can become ', ', pushing them to ', ', ', ' and '],['自信後續作用','第一項主動行動','第二項獨立行動','第三項長期習慣'])),
  card('That said, several other early experiences also shape school results.','以 That said 轉入閱讀之外的學前因素',[2,7,9],fixed(8,'That said, [其他學前因素] also shape [日後學業成就].','在肯定閱讀後，轉答題目問的其他學前條件。','閱讀的重要性已論證完，須平衡轉到第二問時。',['That said, ', ' also shape '],['閱讀以外的條件','受其影響的後來表現'])),
  card('One of the most important is family help, especially when parents talk to children regularly, answer their questions and keep routines.','以 especially when 列父母參與的具體做法',[8,10,11],fixed(9,'One of the most important is [父母參與], especially when [父母] talk to children regularly, [回答提問] and [建立安定家居規律].','把家庭支持拆成可觀察的交談、答問和日常規律。','已提出其他學前因素，要先用具體家庭互動說明其中一項時。',['One of the most important is ', ', especially when ', ' talk to children regularly, ', ' and '],['被提出的重要因素','採取行動的父母','第二項互動行為','第三項生活安排'])),
  card('Such children often arrive at school with more words, better focus and a clearer sense that school matters.','以 with 列家庭互動帶來的三項入學準備',[9,11,12],fixed(10,'Such children often arrive at school with [較豐富詞彙], [較強專注] and [學習重要的認識].','家庭交流與規律可能在詞彙、專注和學習態度上留下效果。','已說家長怎樣參與，接着要指出孩子帶着甚麼能力入學時。',['Such children often arrive at school with ', ', ', ' and '],['第一項語言準備','第二項注意力準備','第三項學習態度'])),
  card('Social and emotional growth is another key factor.','以 another key factor 轉入社交與情緒準備',[8,10,12],fixed(11,'[社交與情緒發展] is another key factor.','第二個閱讀以外因素是孩子能否與人相處及處理感受。','家庭參與已談完，要提出另一種學前準備時。',[' is another key factor.'],['另一項關鍵發展面向'])),
  card('Children who can share, take turns and handle small disappointments are usually better prepared for class.','以 who ... are better prepared 連社交行動到課堂適應',[10,11,13],fixed(12,'Children who can [分享], [輪候] and [處理小挫折] are usually better prepared for [課堂生活].','具體說明能合作、等待、應對挫折如何幫孩子適應課堂。','社交情緒因素已提出，要用孩子在同伴間的可觀察行為作證時。',['Children who can ', ', ', ' and ', ' are usually better prepared for '],['第一項同伴行為','第二項自控行為','第三項情緒能力','因此更適應的環境'])),
  card('In this sense, readiness is not only built with books; it is also built through play and relationships.','以 not only ...; also ... 平衡書本與關係遊戲',[11,12,14],fixed(13,'In this sense, [學前發展] is not only built with [書本]; it is also built through [對話、遊戲及穩定關係].','總結第二段：閱讀重要，但對話與社交經驗同樣塑造學習準備。','讀書與其他學前因素都說完，要防止讀者只看到書本能力時。',['In this sense, ', ' is not only built with ', '; it is also built through '],['受到多方塑造的發展','不是唯一來源的書本','同樣重要的人際經驗'])),
  card('In conclusion, early maths skills are extremely important because they support confidence and independent work across lessons.','以 because 收束閱讀對各科理解自信自主的作用',[1,3,15],fixed(14,'In conclusion, [早期閱讀能力] are extremely important because they support [理解、自信及獨立學習] across [所有學科].','結論先回答閱讀究竟有多重要，並重提跨學科好處。','末段需簡潔回應第一問，不只說「重要」還要說如何幫助學業時。',['In conclusion, ', ' are extremely important because they support ', ' across '],['被評價的早期能力','支持的三項學習結果','好處所及範圍'])),
  card('Nevertheless, later achievement is also shaped by family care, emotional readiness and social habits.','以 Nevertheless 提醒閱讀以外的三項學前條件',[2,9,14],fixed(15,'Nevertheless, [孩子未來學業] is also shaped by [家庭支持], [情緒成熟] and [入學前形成的社交習慣].','最後補答第二問：家庭、情緒與社交習慣也影響學業。','閱讀作用已總結，仍須清楚保留其他學前因素的重要性時。',['Nevertheless, ', ' is also shaped by ', ', ', ' and '],['被塑造的日後表現','第一項家庭條件','第二項情緒條件','第三項社交條件'])),
];
const wrongReasons=[
  ['閱讀重要是引言判斷，沒有先連學前經歷與入學後表現。','閱讀跨各科是主體段理由，非時間背景。','其他因素轉折在後，未建立孩子發展的前後連續性。'],
  ['入學前經歷是廣背景，未說閱讀開啟語言指示觀念。','跨科入口是主體段結論，沒有列閱讀帶來的三類內容。','識字讀句是個體能力例子，非引言理由總述。'],
  ['閱讀重要是前句肯定，沒有 alone does not 的限制。','其他因素轉折在主體段，未於引言預告三面向。','社交情緒只是其中一項，沒有家庭與閱讀的平衡。'],
  ['引言已有閱讀理由，但沒有主體段明確聚焦學業跨科。','識字讀句是後續機制，非段首主理由。','數學與科學是跨科例子，未先提出總論。'],
  ['跨科入口是概括，未區分學英語與學會學習。','數學科學例子是下一步證據。','自信效果是更後的學習後果，不是 not merely 的概念提升。'],
  ['閱讀是各科入口的總論，沒有數學題與科學解釋。','識字讀句是能力清單，未見兩門學科的應用。','自信是跨科成功後果，不是具體數學科學證據。'],
  ['數學與科學需要閱讀是技能用途，未談迷失與自信對照。','自信推動習慣是下一步，非閱讀直接課堂感受。','其他因素轉折是第二問，不是閱讀帶來的信心。'],
  ['迷失與自信只描述心理變化，沒有後續發問與自主行動。','閱讀以外因素是轉折，不是自信推動進步。','父母參與是其他條件，沒有自信帶來的學習習慣。'],
  ['引言限制是早期預告，沒有 That said 的段間轉折。','自信推動行動仍在閱讀論證，未轉入其他因素。','父母參與是轉折後的首項細節，不是轉折標示。'],
  ['其他因素轉折未列父母交談、答問與規律。','家庭結果是下一句，並非父母具體做法。','社交情緒是另一因素，不是親子互動。'],
  ['家長做法是原因，未說孩子帶着詞彙、專注與學習態度入學。','社交情緒是第二因素，不是家庭互動的三項效果。','分享等待是社交行為，不是入學詞彙與專注。'],
  ['其他因素總轉折未單獨提出社交與情緒。','父母參與是第一因素，並非另一關鍵面向。','分享等待是此因素的後續具體例子。'],
  ['家庭結果是詞彙專注，未談同伴間分享等待。','社交情緒只是標題，沒有可觀察行為。','書本與遊戲平衡是段末總結，不是課堂適應例子。'],
  ['社交情緒因素只標示方向，沒有書本與人際來源對照。','分享等待是具體能力，尚未總結書本以外的準備。','結論閱讀重要只回應第一問，未收束非書本因素。'],
  ['閱讀開啟語言觀念是引言預告，未收束全篇三項效果。','跨科入口是第一段總論，未概括理解自信自主。','最後其他因素句回應第二問，不是閱讀重要的總結。'],
  ['引言閱讀非唯一是預告，未經主體證據與結論重申。','父母交談只是家庭因素細節，沒有三項並列總結。','前句結論只強調閱讀，未補回家庭情緒社交。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清閱讀的跨科作用與其他學前條件，再依範文排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目有哪兩個不同焦點？',[
    '早期閱讀對學業有多重要，以及還有哪些學前因素',
    '孩子該讀幾頁書，以及哪間圖書館最漂亮',
    '學校該買多少課桌，以及英語考試何時舉行',
    '是否取消學前教育，以及每位家長應教哪本書',
  ],'範文既要評估閱讀，也要指出閱讀以外的學前因素。'),
  {type:'multi',prompt:'選出範文的兩條主線',detail:'選兩項，再按「確認」。',options:[
    '閱讀幫孩子理解各科題目並建立學習自信',
    '家庭交流及社交情緒準備也會影響入學表現',
    '只要會認字，家庭和情緒便完全不再重要',
    '閱讀只影響英語課，與數學和科學無關',
  ],correct:[0,1],why:'作者肯定閱讀的跨科作用，同時強調家庭與社交情緒。'},
];
const route=[sequence('依範文次序排好四段的任務',[
  ['引言先平衡','閱讀重要，但家庭、社交和情緒也影響未來學業。'],
  ['閱讀如何支援各科','識字讀句使孩子能做數學、理解科學並建立自信。'],
  ['其他學前條件','父母交談與規律帶來詞彙專注；分享等待助適應課堂。'],
  ['結論答齊兩問','閱讀支持理解和自主學習，家庭與情緒社交仍塑造結果。'],
],'先說閱讀的作用，再用兩組學前因素補足學業成功的解釋。')];
const evidence=[
  quiz('為何早期閱讀不只影響英文課？',[
    '數學要準確讀題，科學也要理解文字解釋',
    '數學與科學完全不需要任何文字或指示',
    '只有英文課會要求學生聽懂教師說話',
    '閱讀只用於故事書，從不進入其他學科',
  ],'作者用數學與科學展示閱讀的跨科入口作用。'),
  quiz('閱讀帶來的自信之後可能推動甚麼？',[
    '主動提問、獨立完成任務並形成學習習慣',
    '只要有自信，便不需要再聽任何課堂指示',
    '學生只會停止提問，避免嘗試獨立學習',
    '自信只能影響書寫速度，不會影響學習行為',
  ],'範文把信心推向可觀察的主動學習行動。'),
  quiz('父母參與在文章中具體指甚麼？',[
    '經常交談、回答提問並建立安定的家居規律',
    '只買課本，平日完全不跟孩子說話',
    '替孩子完成全部功課，避免孩子自行思考',
    '每天更換所有規則，讓孩子無法預測生活',
  ],'家庭支持是互動和穩定作息，而非單靠購買教材。'),
  quiz('這種家庭環境如何反映在孩子入學時？',[
    '詞彙較豐富、較能專注，也明白學習重要',
    '所有孩子必定已能做完各年級所有試卷',
    '孩子一定不需要教師或同學的任何幫助',
    '入學時只會記住玩具價格，與學習無關',
  ],'原文列詞彙、專注與學習態度三項準備。'),
  quiz('哪些行為顯示孩子有社交情緒準備？',[
    '分享玩具、輪候和應付小挫折',
    '永遠不能接受同學先用玩具',
    '遇到小困難便完全停止參與',
    '只會單獨認字，從不與人相處',
  ],'這些日常行為有助孩子適應課堂。'),
  quiz('「不只由書本建立」要提醒讀者甚麼？',[
    '對話、遊戲和穩定關係也支援入學準備',
    '只要有遊戲，孩子便完全不需要閱讀',
    '只要有書本，孩子便不必學會與人相處',
    '書本與關係都無法對學前發展產生影響',
  ],'作者要避免將學前成就歸於單一因素。'),
  quiz('結論怎樣同時回答兩問？',[
    '重申閱讀的跨科作用，也保留家庭情緒社交因素',
    '只說閱讀很重要，完全不提其他學前條件',
    '只談家庭支持，否認閱讀對數學科學的作用',
    '只比較課本價格，不判斷孩子如何準備入學',
  ],'雙問題目要分別回應，不能只總結其中一條線。'),
];
const logic=[
  sequence('閱讀如何由技能變成學業表現',[
    ['識字讀句','孩子能辨認詞語並理解簡單故事。'],
    ['跨學科入口','數學需讀題，科學需理解解釋。'],
    ['較不迷失','孩子較容易跟上課堂活動。'],
    ['建立自信','課業變難時仍敢繼續學。'],
    ['主動學習','發問、獨立完成任務並養成習慣。'],
  ],'閱讀的作用經由理解、課堂參與與自信逐步擴展。'),
  sequence('閱讀以外的兩條學前準備',[
    ['父母參與','交談、答問並維持安定的家居規律。'],
    ['入學語言與專注','孩子帶着較多詞彙及較好的注意力入學。'],
    ['社交情緒能力','學會分享、輪候及應對小挫折。'],
    ['適應課堂','更能參與與同學一起進行的學習。'],
    ['整體準備','書本之外還有對話、遊戲和穩定關係。'],
  ],'家庭與社交情緒並非取代閱讀，而是共同塑造學業準備。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('教師發現一名學生會算數，但常看不懂數學應用題的文字。','哪項最能運用範文的跨科閱讀理由？',[
    '協助他讀懂題目，因閱讀也影響數學表現',
    '只增加算式難度，完全不理他看不懂題目',
    '認定閱讀只屬英文課，數學題目毋須理解',
    '只要會背答案，就不需要讀懂任何新問題',
  ],['原文用數學工作紙說明理解題目也需閱讀。','缺少題意理解。','閱讀跨科。','新問題仍要讀懂。'],[3,4,5],'範文以數學題目和科學解釋說明閱讀是多科學習入口。'),
  transfer('一位家長想只買更多故事書，卻很少與學前孩子交談或回答提問。','哪項最符合範文的平衡看法？',[
    '保留閱讀，也增加交談答問和穩定的生活規律',
    '只買書就足夠，家中交流不會有任何作用',
    '立即停止閱讀，只讓孩子觀看娛樂影片',
    '只要求背誦書名，不讓孩子提出任何問題',
  ],['原文肯定閱讀，也把父母參與列為另一重要因素。','閱讀不是唯一條件。','不必捨棄閱讀。','答問是家庭支持。'],[2,9,10,13],'範文說閱讀重要但不單獨決定成功，家長交談答問也有作用。'),
  transfer('一名新生讀書不錯，卻不肯輪候，也常因小挫折停止參與小組活動。','哪項最能套用範文的社交情緒因素？',[
    '練習輪候與應對挫折，幫他更好適應課堂',
    '只追加閱讀練習，完全不理同伴活動困難',
    '只因會讀書，就斷定所有情緒能力已成熟',
    '取消所有合作活動，避免孩子學習與人相處',
  ],['原文把輪候及處理小挫折連到課堂準備。','閱讀不能單獨補足社交能力。','兩者不同。','合作本身可練習。'],[2,11,12],'範文說分享、輪候與應對小挫折使孩子較能適應課堂。'),
  transfer('一所幼兒園要評估入學準備，清單只有「能認多少字」。','哪項最能補足範文的多因素標準？',[
    '加看家庭交流、專注、分享及處理情緒的能力',
    '只把認字數再乘十，避免觀察其他能力',
    '完全刪除閱讀，只比較孩子的玩具價格',
    '只問家長買書花多少錢，不問孩子如何學',
  ],['範文認為閱讀與家庭、社交、情緒共同影響準備。','仍是單一指標。','閱讀仍重要。','支出不等於發展。'],[2,9,10,11,12,13],'範文在結論並列閱讀、家庭支持、情緒成熟與社交習慣。'),
  transfer('學生讀得懂科學說明後，開始敢問問題，也能獨立完成實驗紀錄。','哪項最符合範文的信心鏈條？',[
    '讀懂內容帶來自信，再推動提問與獨立做事',
    '一旦會閱讀，就完全不需要再理解科學解釋',
    '敢提問會令所有學生必然失去學習信心',
    '獨立紀錄只與文具品牌有關，與理解無關',
  ],['原文把閱讀理解、自信及主動學習順序連接。','理解仍是核心。','與原文相反。','文具無法解釋。'],[5,6,7],'範文說閱讀使孩子較不迷失、建立自信，繼而發問與獨立完成任務。'),
  transfer('孩子入學前每天與照顧者聊天、提問，也有規律睡眠與活動時間。','哪項最能運用家庭參與的例子？',[
    '家中互動和規律有助詞彙、專注及學習態度',
    '只要有規律，孩子便完全不需要任何學校課堂',
    '家長答問只會減少詞彙，不能影響孩子準備',
    '聊天只能決定玩具數量，與語言發展無關',
  ],['原文列家長交談、答問與安定規律的入學好處。','學校仍重要。','與原文相反。','交流關乎語言。'],[9,10],'範文說親子交談答問和家居規律可帶來詞彙、專注與學習態度。'),
  transfer('學校想讓小一學生閱讀簡短實驗指示，卻把識字課視為只對英文成績有用。','哪項最能修正這個判斷？',[
    '閱讀讓孩子理解科學指示，也是在學會如何學習',
    '科學實驗完全不需任何說明或文字提示',
    '只要孩子懂英文，便自動會做所有科學實驗',
    '識字只會影響圖書館借閱，絕不影響各學科',
  ],['原文說識字讀句不只是英語，科學也需要解釋理解。','實驗指示要讀。','語言只是必要而非充分。','跨科作用被忽略。'],[3,4,5],'範文說閱讀是學會學習的入口，科學依賴理解解釋。'),
  transfer('一個家庭因孩子提早識字而認為他不必再參與遊戲和同伴活動。','哪項最貼近範文的結尾平衡？',[
    '閱讀仍重要，遊戲與穩定關係也支援學前發展',
    '只要識字早，分享和處理挫折便完全無用',
    '停止所有閱讀，才能改善孩子的社交表現',
    '只比較識字速度，毋須觀察孩子如何合作',
  ],['原文說學前成功不只靠書本，也來自遊戲和關係。','社交情緒仍有作用。','兩者可並行。','合作是準備之一。'],[11,12,13,15],'範文說書本、對話、遊戲和穩定關係一起構成學前準備。'),
  transfer('新生能認很多字，但入學後遇到較難課業便不敢嘗試。','哪項最能運用範文對信心的解釋？',[
    '協助他理解新題並累積自信，再鼓勵主動發問',
    '只看認字總數，不理他在課堂是否感到迷失',
    '要求他永遠不問問題，避免暴露任何困難',
    '斷言識字必然立即消除所有學習或情緒困難',
  ],['閱讀的好處經由跟上課堂與建立自信擴展。','感受和行動也重要。','發問是正面結果。','不能作絕對推論。'],[4,6,7],'範文說早期閱讀降低課堂迷失，信心又推動提問和獨立學習。'),
  transfer('議會要設學前計劃，預算只能分配給故事時間、家長工作坊及合作遊戲。','哪項組合最符合範文的整體邏輯？',[
    '三項相互配合，兼顧閱讀、親子互動與社交情緒',
    '只准故事時間存在，完全取消家長與同伴活動',
    '只談遊戲，不讓孩子接觸任何詞語或故事',
    '只選最貴場地，不問活動能培養甚麼能力',
  ],['範文同時重視閱讀與其他學前條件。','忽略家庭社交。','忽略閱讀。','場地價格不是發展標準。'],[1,2,9,12,13,14,15],'範文最後兩句分別總結閱讀跨科好處與家庭情緒社交因素。'),
];
const revised=[
  {options:['幫他讀懂應用題文字，因閱讀也影響數學表現。','再增加算式練習量，讓他先記住常見答案。','把應用題改成口頭解說，暫緩文字理解訓練。','先教艱深數學公式，題目用字留待英文課處理。'],explanations:['題目理解是完成數學工作的前提。','算式熟練仍不能解決讀不懂題意。','口頭協助可作過渡，但未處理閱讀困難。','閱讀能力跨學科，不能只交給英文課。']},
  {options:['保留閱讀，並增加親子交談、答問與穩定作息。','增加書本數量，親子交談暫待入學後開始。','把閱讀時間改為影片時間，以減少孩子提問。','專注背誦書名及字詞，生活作息由學校處理。'],explanations:['閱讀、家庭互動與規律生活可互相支持。','多買書不能取代家長與孩子的實際交流。','影片並非本文提出的親子答問替代方式。','背誦與購書不足以涵蓋家庭支持。']},
  {options:['練習輪候及應對挫折，幫他適應小組課堂。','增加個人閱讀時間，延後處理小組合作問題。','將讀書表現視作社交能力的充分證據。','減少同伴活動，讓他先自行熟悉課本。'],explanations:['社交與情緒技能是閱讀以外的入學準備。','個人閱讀不能直接練習輪候與合作。','認字與處理挫折是不同能力。','迴避同伴活動會減少練習機會。']},
  {options:['另看家庭交流、專注、分享及情緒調節能力。','把認字量提高門檻，維持單項測量方式。','以家庭購書支出取代孩子閱讀與合作觀察。','只加入算術成績，仍不評估社交情緒準備。'],explanations:['以多個與學前適應相關的因素補足清單。','提高同一指標的門檻仍忽略其他能力。','家庭支出不能直接代表孩子能力。','多一項學科分數仍未覆蓋社交情緒因素。']},
  {options:['讀懂說明使他更有信心，進而敢問及獨立完成。','先要求獨立完成紀錄，閱讀理解留到下學期。','把提問歸因於實驗器材更新，略過題意理解。','鼓勵背熟科學段落，但不檢查能否理解內容。'],explanations:['理解、自信與自主學習形成連續的學習路徑。','要求成果先於理解，難以建立穩固信心。','器材更新不能解釋題述閱讀帶來的改變。','單純背誦未必促成提問和獨立記錄。']},
  {options:['家中交談、答問與規律有助詞彙、專注及學習。','家中規律可補助睡眠，但交談與詞彙關係較弱。','家長提問可練記憶，卻應避免孩子自行提問。','家中互動有益，但幼兒園的活動便可相應取消。'],explanations:['本文把家庭互動與規律連到多項入學能力。','日常交談正是詞彙發展的來源之一。','讓孩子提問是有價值的互動。','家庭支持與學校活動可以並行。']},
  {options:['識字有助理解科學指示，也支援跨科學習。','科學課可依賴示範，閱讀只影響英語成績。','識字使實驗步驟容易背誦，不必理解原因。','先完成科學實驗，讀說明留待回家後處理。'],explanations:['閱讀支援理解其他學科的指示與解釋。','示範有幫助，但題述仍有文字指示。','背誦步驟不等於理解新題或解釋。','先讀懂指示可避免做錯實驗。']},
  {options:['繼續閱讀，也保留遊戲、同伴互動與穩定關係。','提早識字後，把同伴遊戲移至入學後再安排。','用遊戲完全取代故事書，以集中訓練社交。','依識字速度分組，暫不觀察孩子如何合作。'],explanations:['閱讀與社交情緒發展都是學前準備的一部分。','延後互動會錯過目前可練習的機會。','停止閱讀會失去另一項重要的學習支援。','識字快慢不能代替合作能力觀察。']},
  {options:['幫他讀懂新題並累積信心，再鼓勵主動發問。','提高認字測試分數，稍後再處理課堂信心。','暫時避免提問，以免他意識到自己有困難。','把認字多視為適應良好，略過較難課業反應。'],explanations:['理解新挑戰後的信心可促進主動學習。','認字數量不能直接解決面對新題的退縮。','適當提問能幫助理解，不應被壓抑。','題述已顯示識字與自信並未同步。']},
  {options:['三項互補，兼顧閱讀、家庭互動與社交情緒。','增加故事時間，但暫緩家長工作坊與合作遊戲。','增加合作遊戲，但停止故事時間與親子互動。','先建較大的活動場地，再決定是否提供三項活動。'],explanations:['三種安排分別對應本文的關鍵學前因素。','只增加閱讀時數會遺漏另外兩類支持。','遊戲有益，卻不宜排除閱讀與家庭支持。','場地規模不能替代活動的教育目標。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:36',meta:{topic:'早期閱讀與其他學前成功因素',summary:'閱讀支援各科理解、自信及自主學習；家庭交流與社交情緒準備也不可缺。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
