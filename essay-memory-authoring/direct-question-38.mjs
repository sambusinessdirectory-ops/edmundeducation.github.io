// Source-specific lesson support for Direct Question 38.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-38-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:38'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'What happened in the past has always helped people in a society understand who they are.',
  'Different groups keep records of the past in different ways, but children can learn history from school, stories, places people remember together and old customs.',
  'History is still important because it helps people know who they are, learn from the past and decide where to go together.',
  'There are many ways to teach younger people what happened in the past.',
  'The clearest way is school, because teachers can explain big events, important people and how their country changed.',
  'But we do not find history only in school books.',
  'People also keep it in stories told aloud, family memories, buildings made to remember events, museums, films about real life and national events.',
  'For example, older family members may tell children about war or moving to another country, helping them see the past as part of their family, not just pages in a book.',
  'In this way, history connects people of different ages like a bridge, even if they never met.',
  'History is also very important because it gives people a shared idea of who they are and helps them make better choices.',
  'A group that knows its past is more likely to value its language, customs, ideas and difficult experiences.',
  'Without knowing this, people may feel they have no roots, like living in a house whose base they cannot see.',
  'More than that, history shows societies what happened because of people’s choices.',
  'Wars, fights for change, new things found by scientists and mistakes by governments teach us about power, fair treatment, fights and improvement.',
  'If people do not learn these lessons, they may make old mistakes again in new ways.',
  'To sum up, people can teach history through schools, families, museums and other cultural places, media and public customs.',
  'History matters not just because it keeps facts from the past, but because it helps a society know where it came from, who it is and where it should go.',
];
const vocabulary=[
  [['History','What happened in the past','歷史'],['societies','people in a society','社會'],['understand themselves','understand who they are','理解自身']],
  [['different cultures','Different groups','不同文化'],['preserve the past','keep records of the past','保存過去'],['passed on','learn','傳承'],['education','school','教育'],['storytelling','stories','故事傳承'],['public memory','places people remember together','公共記憶'],['cultural traditions','old customs','文化傳統']],
  [['identity','know who they are','身份'],['wisdom','learn from the past','智慧'],['shared sense of direction','decide where to go together','共同方向感']],
  [['several ways','many ways','幾種方法'],['handed down','teach','傳承'],['younger generations','younger people','年輕一代']],
  [['most obvious method','clearest way','最明顯方法'],['formal education','school','正規教育'],['major events','big events','重大事件'],['influential figures','important people','重要人物'],['development of their own country','how their country changed','國家發展']],
  [['However','But','然而'],['not only found in textbooks','do not find history only in school books','不只在課本']],
  [['oral traditions','stories told aloud','口述傳統'],['family stories','family memories','家庭故事'],['monuments','buildings made to remember events','紀念碑'],['documentaries','films about real life','紀錄片'],['national ceremonies','national events','國家儀式']],
  [['grandparents','older family members','祖父母'],['wartime hardship','war','戰時艱難'],['migration','moving to another country','移民'],['distant chapter in a book','pages in a book','書本遙遠篇章'],['family’s living memory','part of their family','家庭鮮活記憶']],
  [['In this way','In this way','如此一來'],['bridge between generations','connects people of different ages like a bridge','世代橋樑'],['people who never met','they never met','從未見過面的人'],['remain connected','connects','保持連結']],
  [['vital to society','very important','對社會重要'],['collective identity','shared idea of who they are','集體身份'],['wiser decisions','better choices','更明智決定']],
  [['A community','A group','社群'],['understands its past','knows its past','理解過去'],['appreciate','value','珍惜'],['values','ideas','價值觀'],['struggles','difficult experiences','奮鬥歷程']],
  [['Without this knowledge','Without knowing this','缺乏歷史知識'],['rootless','no roots','失去根基'],['foundations','base','地基']],
  [['More importantly','More than that','更重要'],['consequences','what happened because of','後果'],['human choices','people’s choices','人的選擇']],
  [['social movements','fights for change','社會運動'],['scientific discoveries','new things found by scientists','科學發現'],['political mistakes','mistakes by governments','政治錯誤'],['justice','fair treatment','公義'],['progress','improvement','進步']],
  [['lessons are ignored','people do not learn these lessons','忽視教訓'],['repeat old errors','make old mistakes again','重犯錯誤'],['under new names','in new ways','以新形式']],
  [['In conclusion','To sum up','總結'],['passed on','teach','傳承'],['cultural institutions','museums and other cultural places','文化機構'],['public traditions','public customs','公共傳統']],
  [['importance lies','matters','重要性'],['not only in preserving old facts','not just because it keeps facts from the past','不只保存舊事實'],['where it came from','where it came from','從何而來'],['who it is','who it is','自己是誰'],['move forward','where it should go','如何前進']],
];
const chunkOverrides=[
  ['History has always been one of the main ways','through which societies understand themselves.'],
  ['Although different cultures preserve the past in different forms,','history can be passed on through education, storytelling,','public memory, and cultural traditions.'],
  ['It remains important because it gives people identity,','wisdom, and a shared sense of direction.'],
  ['There are several ways in which history','can be handed down to younger generations.'],
  ['The most obvious method is formal education,','as schools can teach students about major events,','influential figures, and the development of their own country.'],
  ['However, history is not only found','in textbooks.'],
  ['It is also preserved through oral traditions, family stories,','monuments, museums, documentaries, and national ceremonies.'],
  ['For example, grandparents may tell children','about wartime hardship or migration,','allowing them to feel that the past','is not just a distant chapter in a book,','but part of their family’s living memory.'],
  ['In this way, history is like a bridge','between generations: it allows people who never met','to remain connected.'],
  ['History is also vital to society','because it shapes collective identity','and helps people make wiser decisions.'],
  ['A community that understands its past','is more likely to appreciate','its language, customs, values, and struggles.'],
  ['Without this knowledge, people may feel rootless,','as if they are living in a house','whose foundations they cannot see.'],
  ['More importantly, history teaches societies','the consequences of human choices.'],
  ['Wars, social movements, scientific discoveries, and political mistakes','all provide lessons about power, justice, conflict, and progress.'],
  ['If these lessons are ignored,','societies may repeat old errors under new names.'],
  ['In conclusion, history can be passed on','through schools, families, cultural institutions, media,','and public traditions.'],
  ['Its importance lies not only in preserving old facts,','but also in helping society understand','where it came from, who it is,','and how it should move forward.'],
];
const simpleChunkOverrides=[
  ['What happened in the past has always helped','people in a society understand who they are.'],
  ['Different groups keep records of the past','in different ways,','but children can learn history from school, stories,','places people remember together and old customs.'],
  ['History is still important because it helps people','know who they are, learn from the past','and decide where to go together.'],
  ['There are many ways to teach younger people','what happened in the past.'],
  ['The clearest way is school,','because teachers can explain big events, important people','and how their country changed.'],
  ['But we do not find history only','in school books.'],
  ['People also keep it in stories told aloud,','family memories, buildings made to remember events, museums,','films about real life and national events.'],
  ['For example, older family members may tell children','about war or moving to another country,','helping them see the past as part of their family,','not just pages in a book.'],
  ['In this way, history connects people of different ages','like a bridge, even if they never met.'],
  ['History is also very important','because it gives people a shared idea of who they are','and helps them make better choices.'],
  ['A group that knows its past','is more likely to value','its language, customs, ideas and difficult experiences.'],
  ['Without knowing this, people may feel they have no roots,','like living in a house whose base they cannot see.'],
  ['More than that, history shows societies','what happened because of people’s choices.'],
  ['Wars, fights for change, new things found by scientists','and mistakes by governments','teach us about power, fair treatment, fights and improvement.'],
  ['If people do not learn these lessons,','they may make old mistakes again in new ways.'],
  ['To sum up, people can teach history','through schools, families, museums and other cultural places,','media and public customs.'],
  ['History matters not just because it keeps facts from the past,','but because it helps a society know','where it came from, who it is','and where it should go.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的語意關係相同。`,distractorReason:`這句${focus}，但沒有原句的語意關係。`};}
const structures=[
  card('Family history has always been one of the main ways through which children understand who they are.','以 through which 說歷史是社會理解自身的渠道',[1,3,9],fixed(0,'[歷史] has always been one of the main ways through which [社會] understand [自身].','開題先指出歷史不只是舊資料，亦幫社會理解身份。','題目問歷史的重要性，先提出它對社會自我理解的基本作用時。',[' has always been one of the main ways through which ', ' understand '],['讓人理解自身的媒介','使用它的社會','所理解的身份'])),
  card('Although families save memories differently, stories can be passed on through photos, letters and celebrations.','以 Although ... 不同形式再列共同傳承渠道',[0,3,5],fixed(1,'Although [文化保存形式各異], [歷史] can be passed on through [教育、故事、公共記憶與傳統].','承認文化方法不同，再概括四類傳承渠道。','引言要回答歷史如何傳給下一代，先給出範圍廣而有類別的答案時。',['Although ', ', ', ' can be passed on through '],['各文化的差異','可被傳承的歷史','傳承的方法類別'])),
  card('It remains important because it gives a town identity, lessons, and a common goal.','以 because 概括身份智慧與共同方向三種價值',[0,9,16],fixed(2,'It remains important because it gives [人們] [身份], [智慧] and [共同方向].','引言回答第二問：歷史幫人知道身份、學會判斷並有共同方向。','題目問為何重要，需要在開頭概括其三項社會作用時。',['It remains important because it gives ', ' ', ', ', ' and '],['從歷史受益的人','第一項身份價值','第二項判斷價值','第三項共同行動價值'])),
  card('There are several ways in which local knowledge can be handed down to younger residents.','以 There are several ways 預告傳承方法段',[1,4,6],fixed(3,'There are several ways in which [歷史] can be handed down to [年輕一代].','第一主體段先標示接下來要談傳承方式。','引言已列方法總類，主體段要分層展開其具體渠道時。',['There are several ways in which ', ' can be handed down to '],['被傳遞的知識','下一代接收者'])),
  card('The most obvious method is school, as teachers can teach children about key events and the town’s development.','以 as 說學校如何教授重大事件人物與國家發展',[3,5,6],fixed(4,'The most obvious method is [正規教育], as [學校] can teach [學生] about [重大事件、人物與國家發展].','最正式的傳承渠道是學校，內容涵蓋事件、人物和自身國家發展。','方法段第一項要先說清學校能教甚麼，而不只說「應教歷史」時。',['The most obvious method is ', ', as ', ' can teach ', ' about '],['第一個方法','教學機構','受教者','所學的歷史內容'])),
  card('However, local memory is not only found in textbooks.','以 However ... not only 轉出課本之外的渠道',[4,6,7],fixed(5,'However, [歷史] is not only found in [課本].','防止傳承方式只剩學校課程，引出生活與公共記憶。','學校方法已說完，要轉向家族和公共文化渠道時。',['However, ', ' is not only found in '],['還有其他載體的歷史','不足以獨佔傳承的課本'])),
  card('It is also preserved through family stories, monuments, films, and community ceremonies.','以 also preserved through 列非課本的多種載體',[4,5,7],fixed(6,'It is also preserved through [口述傳統], [家庭故事], [紀念碑、博物館、紀錄片] and [國家儀式].','說明歷史不只在紙上，也可由人、場所、影片和儀式保存。','已指出課本不是唯一渠道，要具體列出其他傳承載體時。',['It is also preserved through ', ', ', ', ', ' and '],['口耳相傳','家庭敘述','公共文化載體','共同儀式'])),
  card('For example, grandparents may tell children about their journey, allowing them to feel that migration is not just a distant textbook page, but part of their family’s living memory.','以 For example ... allowing 示範祖輩故事如何變活記憶',[6,8,10],fixed(7,'For example, [祖父母] may tell [孩子] about [戰時艱難或移民], allowing them to feel that [過去] is not just [書本遙遠篇章], but part of [家庭鮮活記憶].','祖輩親述讓歷史從抽象課文變成與孩子有關的家庭經驗。','列完口述家庭故事，要以一段可想像的代際交流解釋其作用時。',['For example, ', ' may tell ', ' about ', ', allowing them to feel that ', ' is not just ', ', but part of '],['敘述的長輩','聆聽的孩子','講述的歷史經歷','被重新感受的過去','被超越的課本印象','變得切身的記憶'])),
  card('In this way, family history is like a bridge between generations: it allows people who never met to remain connected.','以 bridge between generations 比喻跨世代連結',[6,7,9],fixed(8,'In this way, [歷史] is like a bridge between [世代]: it allows [從未相遇的人] to remain [連結].','祖父母故事之後，用橋樑比喻說明不同時代的人仍能相連。','具體故事已說完，要總結口述歷史如何跨過世代距離時。',['In this way, ', ' is like a bridge between ', ': it allows ', ' to remain '],['起連結作用的歷史','被連結的世代','受益的人','得以保持的關係'])),
  card('Family history is also vital to children because it shapes a shared identity and helps people make wiser decisions.','以 because 回到社會價值：身份與較明智決策',[2,8,10],fixed(9,'[歷史] is also vital to [社會] because it shapes [集體身份] and helps people make [更明智決定].','第二主體段轉答歷史為何重要，分成身份和決策兩線。','傳承渠道已說完，需先標明保存歷史帶來哪兩種主要社會好處時。',[' is also vital to ', ' because it shapes ', ' and helps people make '],['重要的歷史','受益的社會','第一項集體作用','第二項決策作用'])),
  card('A community that knows its past is more likely to appreciate its language and struggles.','以 that ... more likely to 連理解過去與珍惜文化',[9,11,12],fixed(10,'A community that [理解過去] is more likely to appreciate [語言、習俗、價值與奮鬥].','知道過往經歷，較會珍惜本身文化與曾經面對的困難。','集體身份已提出，接着要說社群具體會珍惜甚麼時。',['A community that ', ' is more likely to appreciate '],['社區已具備的歷史理解','因此更重視的文化內容'])),
  card('Without knowledge of their past, villagers may feel rootless, as if they are living in a house with hidden foundations.','以 Without ... as if 用無地基房子比喻失根',[9,10,13],fixed(11,'Without [對過去的認識], [人們] may feel [失根], as if they are living in [看不見地基的房子].','缺少歷史知識的人可能不知道自己所依靠的社會根基。','已說歷史帶來身份，還要描寫缺乏它的心理感受時。',['Without ', ', ', ' may feel ', ', as if they are living in '],['缺失的知識','受影響的人','可能產生的感受','說明感受的比喻'])),
  card('More importantly, family history teaches children the consequences of earlier choices.','以 More importantly 轉入人類選擇後果的教訓',[9,11,14],fixed(12,'More importantly, [歷史] teaches [社會] [人的選擇帶來的後果].','由身份作用升到決策作用：歷史提供行動後果。','已說文化根基，還需指出歷史如何幫社會避免重犯錯誤時。',['More importantly, ', ' teaches ', ' the consequences of '],['提供教訓的歷史','學習的社會','被檢視的選擇'])),
  card('Wars and reform movements all provide lessons about power, fairness and progress.','以事件清單對應權力公義衝突進步的教訓',[12,14,15],fixed(13,'[戰爭、社會運動、科學發現與政治錯誤] all provide lessons about [權力、公義、衝突與進步].','以多類歷史事件展示社會可以從甚麼選擇學教訓。','已說歷史教選擇後果，要用不只戰爭的一組例子支持時。',[' all provide lessons about '],['可供反思的歷史事件','可以學到的社會議題'])),
  card('If these lessons are ignored, a city may repeat old mistakes under new names.','以 If 指出忽略歷史可能重犯錯誤',[12,13,16],fixed(14,'If [歷史教訓被忽視], [社會] may repeat [舊錯誤] under [新名稱].','不同年代的問題可能改名再現，若不學過去便難辨認。','列完歷史教訓，要說明忽視它們的實際風險時。',['If ', ', ', ' may repeat ', ' under '],['被忽視的教訓','有可能重犯的社會','重複的錯誤','重新出現的外表'])),
  card('In conclusion, local history can be passed on through schools, families, museums, and public festivals.','以 through 列傳承渠道回應第一問',[1,3,16],fixed(15,'In conclusion, [歷史] can be passed on through [學校], [家庭], [文化機構與媒體] and [公共傳統].','結論第一句整合正式、家族、文化機構及公共渠道。','末段要先清楚回答歷史怎樣傳給下一代時。',['In conclusion, ', ' can be passed on through ', ', ', ', ', ' and '],['被傳承的歷史','學校渠道','家庭渠道','文化媒體渠道','公共活動渠道'])),
  card('Its importance lies not only in saving dates, but also in helping people understand their roots, their shared past, and how to make choices.','以 not only ... but also 重估歷史超越舊事實的作用',[2,9,15],fixed(16,'Its importance lies not only in [保存舊事實], but also in helping [社會] understand [從何而來], [自己是誰] and [如何前進].','結論第二句重申歷史不只存事實，還幫社會認識身份及方向。','第一問的渠道已總結，最後要答為何傳承值得做時。',['Its importance lies not only in ', ', but also in helping ', ' understand ', ', ', ', and '],['較窄的保存功能','受益的社會','對根源的認識','對身份的認識','對未來方向的判斷'])),
];
const wrongReasons=[
  ['傳承渠道是引言第二句，未先提出歷史與社會自我理解。','方法段預告只說怎樣傳遞，沒有 through which 身份作用。','重要性段總論較具體，尚未是開篇基本定位。'],
  ['歷史幫社會認識自己是價值，不是保存方式清單。','方法段預告沒有承認文化傳承形式不同。','課本之外的渠道是後文展開，未概括四類入口。'],
  ['歷史助社會理解自己只談身份一面，沒有智慧和方向。','社會價值段會詳說身份決策，非引言三項概括。','結尾重要性再總結，不是開頭的總答。'],
  ['引言渠道已有答案範圍，但未標示主體段將逐項展開。','學校是第一種具體方法，不是方法段總起。','課本限制是轉折，不是 There are several ways 的預告。'],
  ['方法段總起沒有正式教育的事件人物國家內容。','課本之外的轉折未說學校教甚麼。','非課本載體是另一組方法，非正規教育。'],
  ['學校教學是第一方法，沒有 However 轉離課本。','口述紀念碑清單是轉折後的細節。','祖輩講述是非課本例子，不是轉折本身。'],
  ['學校方法只有課堂內容，未列家庭公共文化載體。','課本轉折只說不止一處，沒有載體清單。','祖輩故事是其中一項的具體例子。'],
  ['載體清單未顯示祖輩談戰爭或移民如何成家庭記憶。','世代橋樑是例子後的比喻收束。','文化身份段已轉入重要性，不是口述故事的具體運作。'],
  ['非課本載體是列舉，尚未總結跨世代連結。','祖輩故事仍是具體情景，未用橋樑比喻。','社會重要性總論談身份和決策，非祖孫連結。'],
  ['引言重要性只概括身份智慧，未分成集體身份和決策。','世代橋樑是前段傳承作用，不是社會判斷。','社群珍惜文化是身份作用細節，尚未提出雙好處。'],
  ['社會重要性總論沒有說具體珍惜語言習俗奮鬥。','失根比喻是缺少歷史的負面情況。','人類選擇後果是另一條決策作用。'],
  ['集體身份總論仍是正面作用，未以無地基房子呈現缺失。','珍惜文化是有歷史知識的效果，不是失根感。','選擇後果屬決策智慧，非根源比喻。'],
  ['社會重要性總論說兩好處，未聚焦人的選擇後果。','失根比喻是身份線，未轉入決策教訓。','各類事件是下一句證據，不是 More importantly 提出的作用。'],
  ['選擇後果只是概括，沒有戰爭運動科學錯誤清單。','忽視教訓的重犯風險是後續結果。','結論傳承渠道沒有提供權力公義的事件教訓。'],
  ['人類選擇的教訓是正面作用，沒有 If 忽視後果。','各類事件是教材，未說重犯風險。','末句重要性是整體價值，不是忽視的條件結果。'],
  ['引言列傳承類別，尚未經兩段詳述後收束。','方法段總起沒有結論中的五類渠道。','末句重申重要性，非先回答怎樣傳承。'],
  ['引言重要性概括身份智慧，未對照存事實與認識方向。','社會價值段總論只說身份決策，沒有末句三個自問。','前句結論只列方法，尚未回答為何值得傳承。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清傳承渠道與社會價值，再依文章次序排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目實際問哪兩件事？',[
    '歷史可以怎樣傳給下一代，以及它為何對社會重要',
    '哪間博物館最昂貴，以及誰能背最多年份',
    '歷史課該用甚麼字體，以及課室應在哪一層',
    '是否刪去所有記錄，以及紀錄片應拍多長',
  ],'文章先談傳承方法，再談身份與判斷的社會價值。'),
  {type:'multi',prompt:'選出範文對歷史重要性的兩條主理由',detail:'選兩項，再按「確認」。',options:[
    '理解過去使社群更珍惜共同語言和身份',
    '過往選擇的後果可幫社會避免重犯錯誤',
    '只要保存年份，社會便不用理解任何選擇',
    '歷史唯一作用是增加紀念碑的門票收入',
  ],correct:[0,1],why:'範文的兩條價值線是集體身份與較明智的決策。'},
];
const route=[sequence('依範文次序排好四段',[
  ['引言答兩問','歷史可經學校故事與公共傳統傳承，也提供身份智慧方向。'],
  ['先談傳承渠道','學校教事件人物；家庭故事、紀念碑和儀式補足課本。'],
  ['再談社會作用','歷史塑造身份，也以人類選擇的教訓幫社會判斷。'],
  ['結論收束','列渠道並重申歷史幫社會了解根源身份和前進方向。'],
],'方法與重要性分別回答題目的兩問。')];
const evidence=[
  quiz('正規教育可教學生甚麼？',[
    '重大事件、重要人物及自己國家的發展',
    '只教日期，不讓學生知道事件或人物',
    '只播娛樂廣告，不解釋本國的任何變化',
    '只要求學生記課本封面，完全不學內容',
  ],'原文列學校教學的三類歷史內容。'),
  quiz('課本之外有哪些傳承渠道？',[
    '口述故事、家庭記憶、紀念碑、博物館和儀式',
    '只有課本，家庭和公共場所都不能保存歷史',
    '只有商店價格，不能有任何故事或紀錄片',
    '只要有電視，所有長輩記憶便完全沒有作用',
  ],'作者指出歷史同時存於人、場所、媒體和儀式。'),
  quiz('祖父母講戰時或移民經歷的例子帶來甚麼？',[
    '孩子感到過去是家族活的記憶，不只是書本章節',
    '孩子必定以為祖父母從未經歷任何事情',
    '課本從此完全沒有保存歷史的作用',
    '戰爭和移民只能以電影特效講述',
  ],'親人敘述把遙遠歷史變成切身連結。'),
  quiz('失根與看不見地基的房子比喻甚麼？',[
    '缺乏對過去的了解，使人難感到有穩固根源',
    '每戶房子都必須重新興建地基才能學歷史',
    '只要懂建築，便不再需要任何文化記憶',
    '歷史與社群的身份感完全沒有任何關聯',
  ],'看不見地基比喻不了解支撐自身的歷史。'),
  quiz('哪些事件可讓社會反思人的選擇？',[
    '戰爭、社會運動、科學發現與政治錯誤',
    '只有戰爭，其他人類行動都沒有歷史教訓',
    '只看最新商品，完全不研究過去任何決定',
    '只背建築名稱，不問權力公義或衝突',
  ],'範文把不同事件連到權力、公義、衝突和進步。'),
  quiz('忽略歷史教訓有甚麼風險？',[
    '社會可能用新的名稱和形式重犯舊錯',
    '只要事情改名，舊錯就絕不可能再出現',
    '所有社會決策都不受以前經驗影響',
    '只要有博物館，所有錯誤便自動消失',
  ],'認識相似的錯誤，有助社會在新情境中辨認風險。'),
  quiz('結論為何說歷史不只是舊事實？',[
    '它也幫社會認識根源、身份和往後的方向',
    '它只讓學生背更多年份，與現在毫無關係',
    '它只記錄紀念碑的高度，不涉及人的選擇',
    '它只能保存在課本，無法帶來共同理解',
  ],'保存是手段，身份與判斷是更深的社會作用。'),
];
const logic=[
  sequence('歷史怎樣跨世代傳遞',[
    ['學校教學','事件、人物和國家發展建立正式基礎。'],
    ['課本外載體','家族口述、紀念碑、博物館和儀式。'],
    ['祖輩親述','戰爭或移民經歷令孩子感到切身。'],
    ['活的家庭記憶','過去不只是遙遠的書本章節。'],
    ['世代橋樑','未曾見面的人也可因故事保持連結。'],
  ],'範文從學校擴展到家族與公共記憶，再以例子說明傳承作用。'),
  sequence('歷史為何幫助社會',[
    ['集體身份','社群更珍惜語言、習俗、價值和奮鬥。'],
    ['沒有歷史會失根','像住在看不見地基的房子。'],
    ['人類選擇的後果','戰爭、改革、發現與政治錯誤留下教訓。'],
    ['忽視會重犯','舊錯可能換名稱後再次出現。'],
    ['知道如何前進','社會明白根源和自身，便較能判斷方向。'],
  ],'作者把文化身份與社會決策連成歷史的重要性。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('學校歷史課只要求背年份，學生不知道當年事件如何改變自己的城市。','哪項最能運用範文的正規教育作用？',[
    '教事件人物與城市變遷，讓學生理解現在的由來',
    '只增加年份數量，避免解釋人物和社會轉變',
    '只把課本封面換新，完全不調整歷史內容',
    '要求學生不再談本地歷史，只背遙遠地名',
  ],['範文說學校應教事件人物和自身國家發展。','背誦不等於理解。','封面無關內容。','本地發展是重點。'],[3,4],'範文把正式教育列為首項方法，內容包括重大事件、人物和國家發展。'),
  transfer('祖母願意向孫女講述當年搬離家鄉的經歷，但孫女只在課本看過「移民」一詞。','哪項最能轉用家族活記憶的機制？',[
    '記錄祖母經歷，讓課本中的移民成為切身家族故事',
    '只背移民定義，不讓孫女聽祖母的實際經驗',
    '認為家人親述沒有任何歷史價值，只能看課本',
    '只換課本字體，不問搬遷怎樣影響家庭生活',
  ],['原文以祖父母講移民讓遙遠過去成家族記憶。','少切身連結。','口述是歷史渠道。','字體無關經歷。'],[6,7,8],'範文說祖父母講戰時或移民經歷，讓孩子感到過去是家族活記憶。'),
  transfer('市政府想保存河岸工業史，只出版一本教材，未考慮工人訪談和舊廠房展覽。','哪項最符合範文的多渠道傳承？',[
    '教材結合工人故事與展覽，讓歷史有多個入口',
    '只出版教材，永不保留任何口述或實物記錄',
    '只建展覽場地，卻完全不解釋其歷史背景',
    '只談現今商店，避免提到河岸以往的工業',
  ],['學校、口述、公共場所可互補。','課本不是唯一載體。','展品仍需脈絡。','會切斷地方記憶。'],[1,4,5,6,15],'範文說歷史可經學校、口述、文化場所和公共記憶傳承。'),
  transfer('一座城市幾十年前因排水設計錯誤遭水浸，如今新工程出現相似決策。','哪項最能運用歷史的決策價值？',[
    '查舊工程失誤，避免新方案換名稱重犯錯誤',
    '只要新工程改了名稱，過去的問題便不會再出現',
    '拒絕檢查舊水浸紀錄，只看新工程的宣傳',
    '只背當年日期，不問哪項錯誤選擇導致災害',
  ],['原文說人類選擇後果可供學習，忽視或換名重犯。','改名不改機制。','需要舊資料。','日期不是全部。'],[12,13,14],'範文說歷史教選擇後果，忽視教訓可能以新名重犯舊錯。'),
  transfer('社區青年不明白本地語言和節慶從哪裏來，覺得自己與周圍生活沒有連結。','哪項最能運用集體身份論證？',[
    '分享社區過去，助青年理解語言習俗與根源',
    '只說傳統年代久遠，完全不解釋其由來',
    '叫青年忽略所有社區記憶，只看外地廣告',
    '只新增節日門票，不讓居民理解任何故事',
  ],['理解過去可使社群珍惜文化並減少失根感。','缺歷史脈絡。','會加重失根。','門票不等於認同。'],[9,10,11],'範文說社群理解過去，更珍惜語言習俗；失去知識則可能感到無根。'),
  transfer('一間醫院想保存多年來的治療改進，只列最新成功個案，刪去以前的失誤。','哪項最能轉用歷史教人選擇後果的邏輯？',[
    '保留舊失誤與修正，讓新團隊學到決策教訓',
    '只刊成功消息，讓醫護完全看不到曾犯錯誤',
    '只背舊病歷編號，不問當時錯誤為何發生',
    '只換醫院標誌，便認為過去問題已不可能重現',
  ],['歷史價值在於理解選擇與後果，防止重犯。','刪誤會失教訓。','編號不足以解釋。','改標誌不改風險。'],[12,13,14],'範文說科學發現與錯誤都能提供教訓，忽略會重犯。'),
  transfer('兒童博物館只展示舊船模型，沒有船員故事、航線或對今日港口的影響。','哪項最能補足歷史的身份與理解作用？',[
    '以模型連結船員故事與港口變遷，解釋城市歷史',
    '只增加模型數量，不說船和居民有甚麼關係',
    '把船員訪談刪去，只留下模型的售價資料',
    '只問模型大小，避免提到本地港口如何形成',
  ],['物件配合故事和地方發展才有歷史意義。','數量不等於理解。','訪談是活記憶。','港口變遷是重點。'],[0,4,6,9],'範文說歷史幫社會理解自己，學校和文化機構可教自身發展。'),
  transfer('國家紀念日有遊行，但年輕人不清楚紀念的是甚麼事件或其教訓。','哪項最符合文章的傳承方法？',[
    '保留儀式並解釋事件和後果，讓參與者真正理解',
    '只增加隊伍數目，完全不談所紀念的過去',
    '禁止所有學校介紹事件，只准看遊行外觀',
    '認為有儀式便不用知道任何歷史人物和選擇',
  ],['公共儀式是渠道，理解事件及教訓才達到目的。','缺意義。','學校可補充。','儀式不自動產生知識。'],[4,6,12,15],'範文把國家儀式列為保存歷史的渠道，也重視事件教訓。'),
  transfer('家族幾代人沒有見過創業的曾祖父母，舊信件與錄音仍保存下來。','哪項最能運用「橋樑」比喻？',[
    '讀信件聽錄音，讓未曾相遇的世代保持連結',
    '只因沒見過面，就斷言信件不能傳達任何經歷',
    '立即刪去錄音，避免家族成員理解以前生活',
    '只數信件張數，不問其中講述了甚麼故事',
  ],['原文說歷史讓未見過面的人仍能相連。','記錄可跨時間。','刪除會失去渠道。','故事內容有作用。'],[7,8],'範文以家族口述和世代橋樑說明未見面者仍可連結。'),
  transfer('地方議會問：「花錢保存舊檔案，是否只是為了儲存年份？」','哪項回答最完整？',[
    '保存資料也幫社會理解根源、身份及前進方向',
    '只要檔案有年份，就不需知道任何人做過甚麼',
    '保存檔案完全不能影響居民對社區的理解',
    '只把檔案鎖起來，不讓公眾使用或學習',
  ],['結論明確說歷史不只保存舊事實，亦幫社會辨認自身方向。','年份只是資料。','理解身份是核心。','傳承需可接觸。'],[2,9,16],'範文最後指出歷史超越舊事實，幫社會理解從何而來、自己是誰和如何前進。'),
];
const revised=[
  {options:['教事件人物與城市變遷，讓學生理解現在的由來。','增加年代測驗，城市變遷留待地理課再解釋。','更新課本封面，事件人物仍維持原有簡短介紹。','改教較遠地區的歷史，本地城市只留作課外閱讀。'],explanations:['人物、事件與本地發展連結，才讓歷史可理解。','年份本身不能說明事件如何影響城市。','封面更新不會補上內容脈絡。','本地變遷正是題述學生需要理解的部分。']},
  {options:['記錄祖母經歷，讓課本中的移民成為家族故事。','先背移民定義，祖母經歷留待正式課程結束後。','只把祖母的日期記下，較少詢問搬遷的感受。','用課本例子解釋移民，家庭經歷改寫成統計。'],explanations:['口述把抽象概念連到親身家族記憶。','定義有用，但不足以呈現題述切身經驗。','日期不能單獨表達遷移如何影響生活。','統計不應取代家人講述的具體故事。']},
  {options:['結合教材、工人訪談與舊廠展覽，提供多個入口。','先完成教材，工人訪談和展覽不列入保存計劃。','設舊廠展覽，但展品暫不說明工人與城市關係。','保存工人訪談，河岸工業史則不進入學校教材。'],explanations:['文字、活記憶與公共空間可互相補充。','只用教材會少了口述及實物脈絡。','展品需要故事才能說明地方歷史。','只有訪談也會少一個面向學生的入口。']},
  {options:['查舊工程失誤，避免新方案換名稱重犯錯誤。','新工程名稱不同，可先沿用舊設計再看成效。','先檢查新工程預算，舊水浸紀錄較後再整理。','讓學生背當年水浸日期，工程人員照新圖施工。'],explanations:['理解過往選擇和後果，才可檢查相似風險。','更名不會消除相同的設計問題。','舊事故資料應在決策前納入。','背日期不能替代分析失誤機制。']},
  {options:['分享社區過去，助青年理解語言習俗與根源。','只介紹節慶日程，歷史來源留待下一代再說。','把本地語言列成字表，居民故事改作附錄。','以外地文化廣告引流，社區過去較少提及。'],explanations:['了解共同過去可強化身份和歸屬。','日程不會自行說明傳統的由來。','字表缺少習俗與人的故事脈絡。','外地內容無法回答本地失根感。']},
  {options:['保留舊失誤與修正，讓新團隊理解決策教訓。','只列成功個案，錯誤做法留在封存病歷中。','整理舊病例編號，較少討論失誤如何發生。','更新醫院標誌，過往流程問題留待下次檢討。'],explanations:['理解失誤及修正能幫助防止重犯。','刪去教訓會使團隊少一條學習路徑。','編號不能說明決策和結果之間的關係。','標誌更新不會改變流程中的風險。']},
  {options:['把船模型連到船員故事和港口變遷，解釋城市史。','增加模型數量，故事留給參觀者自行查找。','展示模型售價與尺寸，船員訪談另行存檔。','只講航海技術，港口對今日城市的影響略過。'],explanations:['物件與人物、地方發展並置，才有歷史脈絡。','更多模型不會自動說明地方身份。','價格尺寸不能代替船員經歷。','技術資料之外仍要交代城市變遷。']},
  {options:['保留遊行並解釋事件與後果，讓參與者理解。','增加隊伍數量，事件講解留待明年學校課。','保留遊行，但學校較少討論相關歷史人物。','只讓參與者記住日期，活動目的由標語說明。'],explanations:['公共儀式與對事件的理解應相互支援。','更多隊伍不能代替歷史解釋。','學校是另一個重要的傳承渠道。','日期和標語不足以交代選擇及其後果。']},
  {options:['讀信聽錄音，讓未相遇的世代仍保持連結。','保留信件日期，內容較少在家族中分享。','只在檔案箱保存錄音，暫不讓後代接觸。','整理信件張數，家族故事留給其他資料。'],explanations:['記錄能跨越世代，讓後人接觸未見過的親人。','日期不足以呈現親人的生活經驗。','無法接觸的錄音難發揮橋樑作用。','數量不等於故事內容。']},
  {options:['保存資料也幫社會理解根源、身份與前進方向。','保存年份即可，人物選擇和後果可另行研究。','檔案主要供存放，居民理解較適合交由宣傳。','先封存舊資料，新城發展方向只依現時需求。'],explanations:['歷史記錄可支援身份理解和未來決策。','年份只是入口，還需知道事件與後果。','公共接觸與理解是保存的重要價值。','忽略過去可能重複已有問題。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:38',meta:{topic:'歷史如何傳承及其社會重要性',summary:'學校、家族故事與公共記憶傳承歷史；歷史塑造集體身份並提供選擇後果的教訓。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
