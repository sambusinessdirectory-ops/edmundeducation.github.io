// Individually authored support for Direct Question 39.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-39-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:39'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Every group of people shows its culture through music and art, including songs, pictures, dance, statues and shows for the public.',
  'These things people make are more than fun; they mean something to society and to each person.',
  'I will explain how music and art help a society know who it is and help each person understand feelings.',
  'For society, music and art matter because they keep culture alive and help people feel that they belong together.',
  'Laws, money and government are not the only things that make a society what it is; stories, feelings and ideas handed from older to younger people also matter.',
  'Old songs, paintings on walls, celebrations and shows can keep memories of the past alive in ways that school books alone cannot.',
  'For example, songs of a country or old dances can help people remember where they come from, especially at public celebrations or during hard times.',
  'So art is like a bridge for culture: it joins past and present and helps people feel they belong to a larger group.',
  'For each person, music and art matter just as much because they give people ways to show feelings, think of new things and understand themselves.',
  'Many feelings are hard to put into words, but a song, picture or poem can show them very clearly.',
  'For example, someone who feels worried after work may play music to feel calm, while someone else may draw or write to help with sadness or confusion.',
  'These things do more than pass the time; they help people understand what they feel inside.',
  'Without these ways to show feelings, life might focus more on useful things but feel colder and less caring.',
  'To sum up, music and art matter because they give societies a strong culture and give each person room for feelings.',
  'They keep a group’s identity, help people connect and let them show feelings that everyday words often cannot express.',
];
const vocabulary=[
  [['Every culture','Every group of people','每種文化'],['expresses itself','shows its culture','表達自己'],['paintings','pictures','繪畫'],['sculpture','statues','雕塑'],['public performances','shows for the public','公共表演']],
  [['creative forms','things people make','創作形式'],['not merely sources of entertainment','more than fun','不只是娛樂'],['social meaning','mean something to society','社會意義'],['personal value','to each person','個人價值']],
  [['This essay will explain','I will explain','本文將解釋'],['strengthen social identity','help a society know who it is','強化社會身份'],['enrich individual emotional life','help each person understand feelings','豐富個人情感']],
  [['At the societal level','For society','社會層面'],['preserve culture','keep culture alive','保存文化'],['shared sense of belonging','feel that they belong together','共同歸屬感']],
  [['not defined only by','not the only things that make','不只由…定義'],['laws, economy, or political system','Laws, money and government','法律經濟政治'],['stories, emotions, and values','stories, feelings and ideas','故事情感價值'],['from one generation to the next','from older to younger people','代代相傳']],
  [['Traditional songs','Old songs','傳統歌曲'],['murals','paintings on walls','壁畫'],['festivals','celebrations','節慶'],['historical memory','memories of the past','歷史記憶'],['textbooks alone cannot','school books alone cannot','課本不足']],
  [['national songs','songs of a country','國家歌曲'],['folk dances','old dances','民間舞蹈'],['common roots','where they come from','共同根源'],['public celebrations','public celebrations','公共慶典'],['difficult periods','hard times','艱難時期']],
  [['In this sense','So','從這意義'],['cultural bridge','bridge for culture','文化橋樑'],['connect the past with the present','joins past and present','連接過去現在'],['part of something larger than themselves','belong to a larger group','較大整體']],
  [['For individuals','For each person','個人層面'],['equally valuable','matter just as much','同樣有價值'],['powerful outlet','ways to show','表達渠道'],['emotion, imagination, and self-understanding','feelings, think of new things and understand themselves','情感想像自我理解']],
  [['difficult to explain directly','hard to put into words','難直接解釋'],['a song, a painting, or a poem','a song, picture or poem','歌畫詩'],['surprising clarity','very clearly','清楚表達']],
  [['feels stressed','feels worried','感到壓力'],['calm down','feel calm','平靜'],['draw or write','draw or write','畫或寫'],['process sadness or confusion','help with sadness or confusion','處理難過困惑']],
  [['do not simply fill empty time','do more than pass the time','不只打發時間'],['make sense of their inner lives','understand what they feel inside','理解內心']],
  [['forms of expression','ways to show feelings','表達方式'],['more practical perhaps','focus more on useful things','或許更實用'],['colder and less human','colder and less caring','較冰冷缺人情']],
  [['In conclusion','To sum up','總結'],['cultural depth','strong culture','文化深度'],['emotional space','room for feelings','情感空間']],
  [['preserve identity','keep a group’s identity','保存身份'],['build connection','help people connect','建立連繫'],['ordinary language','everyday words','日常言語'],['express what ordinary language often cannot','show feelings that everyday words often cannot express','表達言語難表達之事']],
];
const chunkOverrides=[
  ['Every culture expresses itself through music and art,','whether through songs, paintings, dance, sculpture,','or public performances.'],
  ['These creative forms are not merely sources of entertainment;','they carry social meaning and personal value.'],
  ['This essay will explain how music and art','strengthen social identity and enrich individual emotional life.'],
  ['At the societal level, music and art are important','because they preserve culture','and create a shared sense of belonging.'],
  ['A society is not defined only by its laws,','economy, or political system,','but also by the stories, emotions, and values','that people pass from one generation to the next.'],
  ['Traditional songs, murals, festivals, and performances','often keep historical memory alive','in a way that textbooks alone cannot.'],
  ['For example, national songs or folk dances','can remind people of their common roots,','especially during public celebrations or difficult periods.'],
  ['In this sense, the arts act as a cultural bridge:','they connect the past with the present','and help people feel','that they are part of something larger than themselves.'],
  ['For individuals, music and art are equally valuable','because they provide a powerful outlet','for emotion, imagination, and self-understanding.'],
  ['Many feelings are difficult to explain directly,','but a song, a painting, or a poem','can express them with surprising clarity.'],
  ['Someone who feels stressed after work, for instance,','may listen to music to calm down,','while another person may draw or write','in order to process sadness or confusion.'],
  ['These activities do not simply fill empty time;','they help people make sense of their inner lives.'],
  ['Without such forms of expression,','life would be more practical perhaps,','but also colder and less human.'],
  ['In conclusion, music and art are important','because they give societies cultural depth','and give individuals emotional space.'],
  ['They preserve identity, build connection,','and allow people to express','what ordinary language often cannot.'],
];
const simpleChunkOverrides=[
  ['Every group of people shows its culture','through music and art,','including songs, pictures, dance, statues','and shows for the public.'],
  ['These things people make are more than fun;','they mean something to society and to each person.'],
  ['I will explain how music and art','help a society know who it is','and help each person understand feelings.'],
  ['For society, music and art matter','because they keep culture alive','and help people feel that they belong together.'],
  ['Laws, money and government are not the only things','that make a society what it is;','stories, feelings and ideas','handed from older to younger people also matter.'],
  ['Old songs, paintings on walls, celebrations and shows','can keep memories of the past alive','in ways that school books alone cannot.'],
  ['For example, songs of a country or old dances','can help people remember where they come from,','especially at public celebrations or during hard times.'],
  ['So art is like a bridge for culture:','it joins past and present','and helps people feel they belong to a larger group.'],
  ['For each person, music and art matter just as much','because they give people ways to show feelings,','think of new things and understand themselves.'],
  ['Many feelings are hard to put into words,','but a song, picture or poem','can show them very clearly.'],
  ['For example, someone who feels worried after work','may play music to feel calm,','while someone else may draw or write','to help with sadness or confusion.'],
  ['These things do more than pass the time;','they help people understand what they feel inside.'],
  ['Without these ways to show feelings,','life might focus more on useful things','but feel colder and less caring.'],
  ['To sum up, music and art matter','because they give societies a strong culture','and give each person room for feelings.'],
  ['They keep a group’s identity, help people connect','and let them show feelings','that everyday words often cannot express.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的意思關係相同。`,distractorReason:`這句${focus}，但沒有原句的意思關係。`};}
const structures=[
  card('Every town expresses itself through crafts, whether through pottery, songs, or street art.','以 whether through 列文化表達的多種藝術形式',[1,3,5],fixed(0,'[每種文化] expresses itself through [音樂與藝術], whether through [歌曲繪畫舞蹈雕塑] or [公共表演].','開題以一組藝術形式說明文化表達並不限於單一媒介。','題目同時談音樂與藝術，先具體展示其多樣形式時。',[' expresses itself through ', ', whether through ', ', or '],['作表達的文化','表達媒介','前幾種例子','最後一類公共表演'])),
  card('These activities are not merely entertainment; they carry meaning for a town and its residents.','以 not merely ...; they carry 區分娛樂與社會個人價值',[0,2,3],fixed(1,'[藝術形式] are not merely [娛樂]; they carry [社會意義] and [個人價值].','指出本文不只談藝術好看好玩，還要談社會和個人兩個層面。','開篇列完藝術形式，需把分析焦點提升到題目要求的重要性時。',[' are not merely ', '; they carry ', ' and '],['被評價的創作形式','不足以概括的娛樂作用','社會層面價值','個人層面價值'])),
  card('This essay will explain how local sports strengthen community identity and enrich individual confidence.','以 how ... and ... 預告社會與個人兩條論證',[1,3,8],fixed(2,'This essay will explain how [音樂與藝術] strengthen [社會身份] and enrich [個人情感生活].','引言末句預告兩段分工：集體身份與個人情感。','題目問對社會和個人有何重要性，需明確安排兩條答題線時。',['This essay will explain how ', ' strengthen ', ' and enrich '],['被分析的創作形式','社會層面的結果','個人層面的結果'])),
  card('At the societal level, music and dance are important because they preserve local stories and create a sense of belonging.','以 At the societal level 先談文化保存及共同歸屬',[2,4,8],fixed(3,'At the societal level, [音樂藝術] are important because they [保存文化] and create [共同歸屬感].','第一主體段聚焦藝術如何維繫社會文化和人際連繫。','兩層題目先答社會面向，要明確提出兩種集體效益時。',['At the societal level, ', ' are important because they ', ' and create '],['有社會作用的藝術','文化保存作用','共同身份感'])),
  card('A society is not defined only by its budget and rules, but also by memories passed between generations.','以 not only ... but also 修正只以制度定義社會的看法',[3,5,6],fixed(4,'A society is not defined only by [法律經濟政治], but also by [代代相傳的故事情感與價值].','社會身份也來自人們傳遞的故事和感受，而不只制度。','已說藝術保存文化，須解釋為甚麼社會身份會包含歌畫傳承的內容時。',['A society is not defined only by ', ', but also by '],['較窄的制度定義','藝術可承載的世代內容'])),
  card('Old songs and murals often keep local memories alive in a way that books alone cannot.','以 in a way that textbooks alone cannot 比較藝術和書本',[4,6,7],fixed(5,'[傳統歌曲壁畫節慶表演] often keep [歷史記憶] alive in a way that [課本] alone cannot.','藝術能讓歷史記憶被聽見和參與，補足單靠課本的不足。','已說故事價值，要具體指出哪些藝術形式在保存記憶上有獨特作用時。',[' often keep ', ' alive in a way that ', ' alone cannot.'],['可參與的藝術形式','被保存的記憶','單靠它不足的載體'])),
  card('For example, local dances can remind families of their roots, especially during public celebrations or hard times.','以 For example ... especially 將文化根源放入兩種場合',[5,7,9],fixed(6,'For example, [國歌或民間舞] can remind [人們] of [共同根源], especially during [公共慶典或艱難時期].','以歌舞在慶典與困境中的共同記憶具體化社會歸屬。','已說藝術保存記憶，要用可看見人們共同參與的場合舉例時。',['For example, ', ' can remind ', ' of ', ', especially during '],['引發記憶的歌舞','被喚起的人','共同的文化根源','感受特別明顯的場合'])),
  card('In this sense, local arts act as a cultural bridge: they connect earlier residents with people today and help neighbours feel that they are part of one community.','以 cultural bridge: 說藝術連接前後世代',[5,6,8],fixed(7,'In this sense, [藝術] act as [文化橋樑]: they connect [過去] with [現在] and help [人們] feel that they are part of [更大社群].','歌舞不只是活動，也讓人感到自己屬於延續中的文化。','公共慶典例子已提出，要總結藝術如何把過去現在與個人連起來時。',['In this sense, ', ' act as ', ': they connect ', ' with ', ' and help ', ' feel that they are part of '],['能連接的藝術','文化橋樑比喻','被連的過去','被連的現在','獲得歸屬的人','較大的群體'])),
  card('For individuals, drawing and music are equally valuable because they provide an outlet for feelings and new ideas.','以 For individuals 轉入情感想像與自我理解',[2,7,9],fixed(8,'For individuals, [音樂與藝術] are equally valuable because they provide [表達渠道] for [情緒、想像與自我理解].','第二主體段改看個人：藝術成為表達和理解內心的方式。','社會效益已論證完，須明確回答題目對個人的重要性時。',['For individuals, ', ' are equally valuable because they provide ', ' for '],['具有個人作用的藝術','可使用的表達出口','被表達與理解的內心內容'])),
  card('Some feelings are difficult to explain directly, but a poem can express them with surprising clarity.','以 but 對照言語難說與藝術能表達',[8,10,11],fixed(9,'[許多感受] are difficult to explain directly, but [歌畫詩] can express them with [出人意料的清晰].','藝術可把難用平常語言說清的感受呈現出來。','已說藝術是情緒出口，要解釋它相對直接說話的獨特優勢時。',[' are difficult to explain directly, but ', ' can express them with '],['難直說的感受','可代為表達的作品','表達效果'])),
  card('Someone stressed after class may listen to songs to calm down, while another person may draw in order to process worry.','以 while 比較兩種不同情緒調節方式',[8,9,11],fixed(10,'[工作後受壓的人] may listen to [音樂] to [平靜], while [另一人] may [畫畫或寫作] in order to [處理悲傷困惑].','以聽、畫、寫兩種情境展示藝術如何處理情緒。','抽象說完藝術表達情緒，要給出個人在日常如何使用它的例子時。',[' may listen to ', ' to ', ', while ', ' may ', ' in order to '],['第一位需要調節的人','使用的音樂','第一種情緒結果','另一位參與者','另一種藝術行動','要處理的感受'])),
  card('These activities do not simply pass time; they help people make sense of their inner lives.','以 not simply ...; they help 區分消遣與理解內心',[9,10,12],fixed(11,'These activities do not simply [填補空閒]; they help [人們] make sense of [內心生活].','聽畫寫的作用是理解自己，而非只消磨時間。','具體日常例子已列出，要概括其更深的情感作用時。',['These activities do not simply ', '; they help ', ' make sense of '],['表面的消遣用途','受益的人','真正被理解的內在經驗'])),
  card('Without art, daily life would be efficient, but also colder and less caring.','以 Without ... perhaps, but also 想像缺藝術的生活代價',[8,11,13],fixed(12,'Without [藝術表達], [生活] would be [或許較實用], but also [較冷漠、較缺人情].','承認沒藝術或許可專注實用事務，卻會失去情感溫度。','個人情感作用已說清，要凸顯失去這類表達的生活會少甚麼時。',['Without ', ', ', ' would be ', ', but also '],['被移除的表達方式','受影響的生活','有限的實用好處','更大的情感損失'])),
  card('In conclusion, music and drawing are important because they give towns cultural depth and give residents emotional space.','以 give societies ... and give individuals ... 雙層收束',[3,8,14],fixed(13,'In conclusion, [音樂與藝術] are important because they give [社會] [文化深度] and give [個人] [情感空間].','結論第一句同時回答對社會與個人的重要性。','題目只有一問但包含兩個對象，末段須讓兩者都明確出現時。',['In conclusion, ', ' are important because they give ', ' ', ' and give ', ' '],['被評價的藝術','社會受益者','社會文化結果','個人受益者','個人情感結果'])),
  card('They preserve local identity, connect neighbours, and allow people to express what ordinary words cannot.','以三動詞並列保存身份、連結和超言語表達',[7,11,13],fixed(14,'They [保存身份], [建立連繫], and allow people to [表達日常言語難表達之事].','用社會身份、人際連結與個人表達三項功能收束全篇。','結論最後一句需把兩段的具體功能合成可記住的清單時。',[', ', ', and allow people to '],['第一項社會作用','第二項人際作用','第三項個人作用'])),
];
const wrongReasons=[
  ['娛樂與價值對照是下一句判斷，未列音樂藝術形式。','社會層面主張已進入原因，非開篇媒介展示。','歷史記憶例子只談部分藝術形式，非總覽。'],
  ['開篇藝術形式清單沒有說不只是娛樂。','引言末句預告社會個人兩面，未區分娛樂與價值。','社會理由只談集體作用，沒有個人價值。'],
  ['娛樂與價值的對照提示兩面，未說各自的論證焦點。','社會段只說身份，未預告個人情感。','個人段只說情緒，未回到引言雙線安排。'],
  ['引言預告兩面，尚未開始社會段保存文化的理由。','社會定義是後一句解釋，未先提出藝術的集體作用。','個人情感段是另一層面，不是社會歸屬。'],
  ['社會段理由只概括文化和歸屬，未對照制度與代際故事。','歌曲壁畫是具體證據，沒有先說社會身份何以超越制度。','慶典歌舞是後續例子，未談法律經濟的狹窄定義。'],
  ['社會定義是一般論述，未指出歌曲壁畫的保存作用。','歌舞慶典例子只談共同根源，沒有課本不足的比較。','文化橋樑是總結，不是具體形式清單。'],
  ['歌曲壁畫保存記憶是總論，未把歌舞放進慶典或困境。','文化橋樑是例子之後的概括。','個人情感作用是另一段，沒有社會共同根源。'],
  ['歷史記憶清單是前提，沒有橋樑比喻。','歌舞例子只是場合，尚未總結過去現在如何相連。','個人情緒段是下一層面，不是文化群體連結。'],
  ['引言只預告個人情感，未詳述情緒想像自我理解。','文化橋樑是社會面向，沒有個人的表達出口。','難言感受是後續機制，未先提出個人價值總論。'],
  ['個人情感出口是總論，未對照言語難說與藝術清楚。','壓力後的聽畫寫是下一句例子。','打發時間對照是更後的概括。'],
  ['藝術能清楚表達是一般機制，沒有兩種日常情境。','打發時間對照是例子後總結，未列聽畫寫行動。','缺藝術生活較冷是反事實推想，非具體個案。'],
  ['難言感受是前提，尚未總結藝術不只消磨時間。','聽畫寫例子是具體用法，未提理解內心的更深作用。','缺藝術較冷是後果，不是活動自身價值。'],
  ['個人表達出口是正面作用，沒有 Without 的缺失設想。','理解內心是前句價值，未說失去後的生活代價。','結論文化情感雙面收束，不是缺藝術的假設。'],
  ['社會理由只回答集體文化，沒有個人情感空間。','個人段只回答情緒，未同時收束社會面向。','末句列三功能，但非 In conclusion 雙對象框架。'],
  ['文化橋樑是社會面向比喻，未列個人超言語表達。','打發時間對照是個人面向，未整合身份與連結。','前句只用文化深度和情感空間概括，未列三項動詞功能。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先區分社會層面與個人層面，再依範文次序排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分析哪兩個受益對象？',[
    '社會整體，以及每一位接觸音樂或藝術的人',
    '只有賣畫的人，不必談欣賞或創作的人',
    '只有一種樂器，不必談其他創作形式',
    '只有政府預算，不必談文化或人的感受',
  ],'範文分別論證藝術對社會身份和個人情緒的作用。'),
  {type:'multi',prompt:'選出範文的兩項主要價值',detail:'選兩項，再按「確認」。',options:[
    '藝術保存共同記憶，建立社群歸屬感',
    '藝術讓個人表達難以直接說清的感受',
    '藝術唯一的作用只是填補空閒時間',
    '社會身份只能由法律和經濟數字定義',
  ],correct:[0,1],why:'一條社會線是文化與連結；一條個人線是情緒表達。'},
];
const route=[sequence('依文章次序排列四段的工作',[
  ['引言提出兩層價值','音樂藝術不只是娛樂，還有社會和個人作用。'],
  ['社會層面','藝術保存代際故事和歷史記憶，形成共同根源。'],
  ['個人層面','歌曲畫詩讓人處理壓力與悲傷，理解內心。'],
  ['結論整合','文化深度、情感空間與超越日常言語的表達。'],
],'作者不是把社會和個人混作同一效果，而是分段展開。')];
const evidence=[
  quiz('為甚麼社會不能只由法律和經濟定義？',[
    '代代相傳的故事、情感和價值也塑造共同身份',
    '因為法律和經濟永遠與社會完全無關',
    '只要有市場價格，便不會再有文化記憶',
    '社會所有故事都只屬於單獨一個人',
  ],'原文用 not only ... but also 把制度和文化內容並列。'),
  quiz('藝術如何補足課本的歷史記憶？',[
    '歌曲、壁畫與表演讓人以可參與方式感受過去',
    '課本一旦存在，所有歌曲便立即沒有價值',
    '壁畫和節慶只能保存市場價格，不能保存記憶',
    '只有課本能讓不同世代聽到任何歷史故事',
  ],'藝術可透過聲音、圖像和活動延續共同記憶。'),
  quiz('國歌或民間舞在慶典與困難時期的例子說明甚麼？',[
    '共同參與能提醒人們自己有相連的文化根源',
    '只要有人跳舞，社會便不再面對任何困難',
    '歌舞只能用於私人娛樂，不能喚起共同記憶',
    '公共慶典會自動刪去所有地方文化的痕跡',
  ],'藝術在集體場合能加強歸屬感。'),
  quiz('對個人而言，歌畫詩能補足甚麼？',[
    '有些感受難直接說清，作品卻可幫人表達',
    '人類所有感受都能用一句話完全解釋',
    '歌畫詩只能告訴人價格，無法表達情緒',
    '只要有藝術，就不必再與任何人交談',
  ],'原文說藝術可讓難言的感受變得清晰。'),
  quiz('下班壓力的例子提供哪兩種做法？',[
    '聽音樂平靜心情，或畫畫寫作處理悲傷困惑',
    '只看售票資料，不讓自己接觸作品',
    '只要求別人立即消除所有情緒反應',
    '只把感受藏起來，完全不尋找表達渠道',
  ],'例子展示藝術在日常情緒調節中的具體用途。'),
  quiz('為何活動不只是「打發時間」？',[
    '它們幫人理解自己的感受與內心生活',
    '它們只會讓人忘記所有生活經驗',
    '它們完全沒有任何超越消遣的意義',
    '它們只能用於裝飾牆壁，無法影響人',
  ],'作者在具體例子後指出自我理解的更深作用。'),
  quiz('結論怎樣兼顧題目兩個對象？',[
    '社會得文化深度，個人得情感表達空間',
    '只談個人感受，完全不說社會文化',
    '只談法律制度，完全不說個人情緒',
    '只列畫作價格，避談身份和連結',
  ],'結論第一句明確並列社會和個人所得。'),
];
const logic=[
  sequence('藝術的社會作用',[
    ['藝術不只娛樂','歌曲、繪畫和表演有共同意義。'],
    ['文化組成社會','故事情感價值與制度一同塑造身份。'],
    ['歷史記憶延續','傳統歌、壁畫和節慶補足課本。'],
    ['共同場合喚根源','歌舞在慶典或困難時連結居民。'],
    ['文化橋樑','人們感到自己屬於超越個人的整體。'],
  ],'社會面向從形式、記憶、場合一路推到共同身份。'),
  sequence('藝術的個人作用',[
    ['難說的感受','日常話語未必足以表達情緒。'],
    ['作品作出口','歌畫詩可把感受清楚呈現。'],
    ['日常用法','聽音樂、畫畫或寫作處理壓力悲傷。'],
    ['不只消遣','活動幫人理解內心。'],
    ['情感溫度','少了表達方式，生活或許實用卻更冷。'],
  ],'作者由表達難題、具體用法推到個人情感價值。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('某城只有法律和產值介紹，居民卻想知道祖輩的歌曲與地方故事。','哪項最能轉用範文的社會身份論證？',[
    '把歌曲與地方故事也納入城市身份的介紹',
    '只報產值數字，完全不理世代傳下的故事',
    '只列法律名稱，避免居民接觸任何藝術',
    '認為歌曲和故事與社會身份毫無關係',
  ],['原文說社會不只由制度定義，也由世代故事價值塑造。','忽略文化。','與題目需求相反。','藝術有集體意義。'],[3,4,5],'範文說法律經濟以外，代代相傳的故事和情感也定義社會。'),
  transfer('村民想在公共節日重唱多年未唱的地方歌曲，讓不同年齡的人一起參與。','哪項最貼近範文的共同根源例子？',[
    '共同唱歌可喚起地方記憶，幫居民感到彼此相連',
    '只要歌曲古老，居民便必定不能理解其內容',
    '節日只關乎門票，不可能與社區歸屬有關',
    '完全不讓年輕人參與，避免世代共同經驗',
  ],['原文以歌舞在公共場合喚起共同根源。','可透過活動理解。','歸屬是例子核心。','世代一起參與有作用。'],[5,6,7],'範文說國歌民間舞在慶典或困難時提醒人們共同根源。'),
  transfer('一面記錄移民家庭經歷的壁畫將被拆除，官方說課本已有歷史資料。','哪項最能運用藝術補足課本的原則？',[
    '評估壁畫讓地方記憶被看見，不只看課本記載',
    '只因有課本，就斷定壁畫沒有任何記憶作用',
    '只保留壁畫顏料價格，不問家庭經歷為何',
    '只要拆除壁畫，移民故事便自動更易被了解',
  ],['壁畫可使歷史記憶以課本以外的方式留存。','原文明言課本不足。','價格不等於故事。','拆除可能失去入口。'],[4,5],'範文列壁畫節慶保存記憶，作用是課本單獨難以做到的。'),
  transfer('一位員工下班後心情沉重，說不清原因，想找一種方式慢慢理解感受。','哪項最能套用範文的個人情緒作用？',[
    '聽歌或畫畫，把難說的感受慢慢表達出來',
    '只看演唱會票價，不讓自己接觸任何作品',
    '斷言所有情緒都必須在一句話內說得完全清楚',
    '只把感受壓下去，避免嘗試任何表達方式',
  ],['原文以音樂、繪畫處理壓力及難言感受。','價格不是方法。','感受常難直說。','表達可助理解。'],[8,9,10,11],'範文說歌畫詩可表達難直說的感受，聽音樂或畫寫可處理情緒。'),
  transfer('一所學校說畫畫課只是用來填補課表空檔，準備取消學生自由創作時間。','哪項最能轉用「不只打發時間」的判斷？',[
    '先看畫畫如何幫學生表達和理解自己的心情',
    '只把課表空位填滿，不問活動對學生有何作用',
    '斷定所有繪畫活動都不可能幫人理解感受',
    '只數畫紙張數，不觀察學生如何使用作品',
  ],['原文把藝術從消遣提升到理解內心。','忽略教育情感作用。','與原文相反。','紙量不是評估核心。'],[9,10,11],'範文說藝術活動不只是填補時間，還幫人理解內心生活。'),
  transfer('醫院想為長期住院者提供音樂和詩歌活動，有人認為只有醫療器械才有價值。','哪項最能運用範文的情感空間理由？',[
    '保留醫療，也給病人用作品表達難說的感受',
    '只因器械有用，就否定所有情緒表達需要',
    '把活動當成單純裝飾，不讓病人參與',
    '只計算詩歌字數，不問病人能否理解自己',
  ],['實用需求與情感表達可並存；原文強調後者。','會使生活更冷。','參與才有表達作用。','字數不等於情感價值。'],[8,9,11,12],'範文說沒有藝術或許更實用，卻可能更冰冷、少人情。'),
  transfer('城市規劃者問：在戰後紀念廣場播放地方樂曲，對居民有何社會意義？','哪項最符合文化橋樑的推論？',[
    '樂曲連起過去與現在，讓居民感到同屬一個社群',
    '樂曲只會增加擴音器費用，不可能喚起共同記憶',
    '紀念廣場只能保存法律文件，不能有藝術元素',
    '只要播放樂曲，就必然消除全部歷史傷痛',
  ],['文化橋樑把歷史記憶與當下歸屬連起來。','記憶是原文作用。','藝術可存在公共空間。','效果不應絕對化。'],[5,6,7],'範文以歌舞在艱難時期提醒共同根源，再用橋樑比喻其連結作用。'),
  transfer('一個青年用詩寫下喪親感受，比直接對朋友講述更能說清自己。','哪項最貼近範文的表達機制？',[
    '詩可把難直說的感受呈現出來，幫他理解內心',
    '只要寫詩，就代表青年從來沒有任何悲傷感',
    '朋友聽不懂一句話，詩便必然完全沒有作用',
    '詩的唯一用途是填滿時間，與情緒完全無關',
  ],['原文說作品可清楚表達難言情感並助自我理解。','情緒是創作原因。','詩可提供另一渠道。','不只消遣。'],[9,10,11],'範文說詩歌可清楚表達難直說的感受，藝術助人理解內心。'),
  transfer('地方文化中心只辦高票房表演，打算刪去較小型的傳統舞蹈和社區合唱。','哪項評估最完整？',[
    '同看票房、文化記憶及居民共享歸屬的作用',
    '只要票房低，表演就必定沒有任何集體價值',
    '只看舞台燈光費用，不問歌舞保存了甚麼',
    '只刊售票廣告，避免居民參與任何社區活動',
  ],['原文說藝術有娛樂以外的社會意義。','票房不等於全部價值。','記憶與歸屬需評估。','參與有作用。'],[1,3,5,6],'範文說歌舞可保存歷史記憶並建立共同歸屬，超越娛樂。'),
  transfer('議會要寫音樂藝術政策目標，只有「增加售票」一項。','哪項目標更能回應範文的社會與個人雙線？',[
    '保存文化連結，並讓居民有表達情緒的機會',
    '只要票售得多，就不必管文化或個人感受',
    '只做社會標誌，不讓任何個人使用藝術',
    '只談個人情緒，完全不理共同歷史與身份',
  ],['範文結論同時重申文化深度和個人情感空間。','漏兩項價值。','漏個人。','漏社會。'],[2,3,8,13,14],'範文分段談社會身份與個人情感，結論兩面合收。'),
];
const revised=[
  {options:['把歌曲和地方故事納入城市身份的介紹。','城市介紹以法律和產值為主，歌曲可另列。','將歌曲改作商業廣告，地方故事只放檔案。','城市身份先由產值衡量，居民記憶留待之後。'],explanations:['共同記憶與制度經濟資訊都能構成城市身份。','另列但弱化歌曲會漏掉題述居民需求。','宣傳與存檔未必讓居民接觸共同故事。','產值不足以代表世代傳下的文化記憶。']},
  {options:['共同唱歌喚起地方記憶，讓居民感到彼此相連。','歌詞年代久遠，活動主要用來測試居民記憶。','讓熟悉歌曲的長者獨唱，年輕人只負責售票。','活動有助聚集人群，但共同歷史可暫不提及。'],explanations:['不同年齡一起參與可形成共同根源與歸屬感。','文化作用不止於能否背熟歌詞。','排除年輕人會削弱跨代連結。','聚會人數不等於已理解地方歷史。']},
  {options:['評估壁畫如何讓移民經歷被看見，補足課本。','課本已有史料，壁畫可只按顏料成本評估。','保留壁畫作品，移民家庭故事則留在檔案。','拆除壁畫後，再用課本摘要代替現場記憶。'],explanations:['藝術可用不同於課本的方式保存集體記憶。','材料價格不能衡量故事被看見的價值。','只保留圖像而忽略其故事會削弱作用。','摘要未必保留壁畫在公共空間的體驗。']},
  {options:['聽音樂或畫畫，逐步表達難以直接說出的感受。','先比較門票價格，再決定是否需要談內心感受。','暫緩創作，要求先用一句話準確說清全部感受。','以工作成果評估壓力，藝術活動只作消遣。'],explanations:['作品可提供非口頭的情緒表達與理解途徑。','票價不是題目要求的情緒處理機制。','正因難直說，藝術表達才可能有用。','藝術有超出休閒的個人情感作用。']},
  {options:['觀察畫畫如何幫學生表達及理解自己的心情。','保留畫畫作課表填空，先不評估學生的表達。','以畫紙消耗量衡量課程，作品討論留待課後。','把自由創作換成臨摹比賽，較少談學生感受。'],explanations:['藝術活動可成為理解內心的教育機會。','只看時間安排會忽略情感作用。','材料使用量不能代表理解是否加深。','臨摹技巧與個人表達並非同一目標。']},
  {options:['醫療照顧之外，給病人藉作品表達感受的空間。','先提供醫療器械，情緒活動等康復出院後再辦。','保留音樂作病房背景聲，不安排病人參與表達。','以詩歌字數評估活動成效，較少詢問病人感受。'],explanations:['醫療與情感表達可並行，作品能給病人另一渠道。','長期住院者在院內也可能需要情緒支持。','背景音樂不能完全代表主動表達。','字數不足以判斷活動的情感價值。']},
  {options:['樂曲連結歷史記憶與現在，增強共同歸屬感。','樂曲可營造氣氛，但廣場歷史可只靠告示說明。','樂曲幫助紀念儀式，居民連結則主要靠售票。','播放樂曲可表達記憶，但毋須再討論戰後傷痛。'],explanations:['公共藝術可以把共同歷史帶進當下生活。','氣氛之外，樂曲也可能承載地方記憶。','售票不是題述社會歸屬機制。','藝術表達不能取代對創傷的持續理解。']},
  {options:['詩將難直說的喪親感受呈現出來，助他理解內心。','詩可整理語句，但喪親感受仍宜只用直說處理。','寫詩既然讓他說清自己，便表示悲傷已經結束。','詩幫他記錄事件經過，但與理解情緒關係較弱。'],explanations:['創作可將難言的感受變成可觀察、可思考的作品。','題目已說詩比直接講述更能表達。','清楚表達不等於情緒已消失。','此處重點正是詩與內在理解的連結。']},
  {options:['評估票房之外，也看文化記憶和居民共享歸屬。','以票房作主要準則，文化作用改交節慶活動。','保留舞蹈形式，但社區合唱可只按收入衡量。','把傳統節目移到資料庫，現場活動只辦高票房。'],explanations:['表演可同時有經濟與公共文化價值。','票房不能完全代表記憶和歸屬作用。','合唱也是題目所述的共同參與方式。','存檔不能完全取代居民共享的現場經驗。']},
  {options:['保存共同文化連結，也給居民表達情緒的機會。','增加售票並保存作品，但居民情感需求另行處理。','建立城市文化標誌，個人使用藝術的機會較少。','提供個人情緒活動，地方歷史則交由觀光宣傳。'],explanations:['同時回應社會身份與個人情緒兩條論證。','售票和存檔仍未充分處理個人表達。','只談社會標誌漏掉藝術的個人作用。','只談情緒則漏掉共同歷史與身份。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:39',meta:{topic:'音樂藝術對社會及個人的作用',summary:'藝術保存共同身份與歷史記憶，也讓個人表達難言感受並理解內心。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
