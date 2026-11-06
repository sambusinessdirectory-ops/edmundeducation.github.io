// City versus countryside childhood: balanced, setting-specific opportunities and constraints.
// Hold for canonical Chinese source repair in advantage-disadvantage-12-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:12'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'People often say that where a child grows up can affect almost every part of how they develop.',
 'Many people think cities offer more chances and make daily life easier, while the countryside is often seen as a healthier and quieter place.',
 'This essay will look at the good and bad points of both places.',
 'There are several good points to growing up in a city.',
 'First, cities usually make it easier to go to good schools, see doctors for particular needs and join many different activities outside class.',
 'This means children are more likely to get strong help with their studies and find what they are good at in music, sport or technology.',
 'Also, city life brings them into contact with people from different cultures, which can help them see more of the world and deal better with change.',
 'But these good points often bring serious problems too.',
 'Cities are often full of people, loud and dirty, and many children have few safe places to play outside.',
 'Also, busy roads, more crime and the fast speed of city life can make children and their parents feel stressed.',
 'In comparison, the countryside can give children a quieter and more stable childhood.',
 'Cleaner air, open areas and more time near nature are all good for the body and for how people feel.',
 'People in country communities often know and help one another more, so children may feel that they belong and are safe.',
 'Still, country life also has bad points.',
 'Schools and medical services may be fewer and not as good, which can hold back children later.',
 'Also, country areas may have fewer chances to meet people, enjoy culture and take part in fun activities. Being far from many people can sometimes leave children with fewer different people and ideas to learn from.',
 'To sum up, both city and country life have their own good and bad points for children.',
 'Cities give more chances and a wider range of experiences, while the countryside gives space, peace and a closer link to nature.',
];
const vocabulary=[
 v(['It is often argued','People often say','人們常說'],['place where a child grows up','where a child grows up','孩子成長的地方'],['shape','affect','影響'],['nearly every aspect','almost every part','幾乎每一方面'],['development','how they develop','發展']),
 v(['widely associated with','Many people think','普遍聯繫'],['opportunity','more chances','機會'],['convenience','make daily life easier','便利'],['countryside','countryside','鄉村'],['healthier and more peaceful','healthier and quieter','更健康寧靜']),
 v(['examine','look at','探討'],['advantages and disadvantages','good and bad points','優點及缺點'],['both settings','both places','兩種環境']),
 v(['offers several important benefits','There are several good points','帶來幾項重要好處'],['Growing up in a city','growing up in a city','在城市成長']),
 v(['To begin with','First','首先'],['urban areas','cities','城市地區'],['better access','easier to go','較容易接觸'],['high-quality schools','good schools','優質學校'],['specialised healthcare','see doctors for particular needs','專科醫療'],['extracurricular activities','activities outside class','課外活動']),
 v(['This means','This means','這意味'],['strong academic support','strong help with their studies','良好學業支援'],['discover talents','find what they are good at','發掘才能'],['fields','in','領域']),
 v(['In addition','Also','此外'],['exposes them to cultural diversity','brings them into contact with people from different cultures','接觸多元文化'],['broaden their horizons','help them see more of the world','擴闊眼界'],['more adaptable','deal better with change','更能適應']),
 v(['However','But','然而'],['advantages','good points','好處'],['serious drawbacks','serious problems','嚴重缺點']),
 v(['frequently crowded','often full of people','經常擠迫'],['noisy','loud','嘈雜'],['polluted','dirty','受污染'],['limited access','few','較少接觸'],['safe outdoor space','safe places to play outside','安全戶外空間']),
 v(['Moreover','Also','此外'],['heavy traffic','busy roads','繁忙交通'],['higher crime rates','more crime','較高犯罪率'],['fast pace','fast speed','急促節奏'],['create stress','feel stressed','造成壓力']),
 v(['By contrast','In comparison','相比之下'],['countryside','countryside','鄉村'],['calmer','quieter','較平靜'],['more grounded childhood','more stable childhood','較踏實童年']),
 v(['Cleaner air','Cleaner air','更清潔空氣'],['open spaces','open areas','開闊空間'],['closer contact with nature','more time near nature','更親近大自然'],['conducive to','good for','有利於'],['physical health','the body','身體健康'],['emotional well-being','how people feel','情緒安康']),
 v(['Rural communities','country communities','鄉村社區'],['close-knit','know and help one another more','緊密'],['sense of belonging','feel that they belong','歸屬感'],['security','are safe','安全感']),
 v(['Nevertheless','Still','儘管如此'],['not without disadvantages','also has bad points','也有缺點']),
 v(['facilities','services','設施'],['fewer in number','fewer','數量較少'],['less advanced','not as good','較不先進'],['restrict children’s development','hold back children','限制孩子發展'],['in the long run','later','長遠']),
 v(['Furthermore','Also','此外'],['rural areas','country areas','鄉村地區'],['fewer social, cultural and recreational opportunities','fewer chances to meet people, enjoy culture and take part in fun activities','較少社交文化休閒機會'],['relative isolation','Being far from many people','相對隔離'],['exposure to different people and ideas','different people and ideas to learn from','接觸不同人與觀點']),
 v(['In conclusion','To sum up','總結'],['distinct','their own','各有不同'],['advantages and disadvantages','good and bad points','優點及缺點']),
 v(['Urban life','Cities','城市生活'],['opportunity and variety','more chances and a wider range of experiences','機會與多樣性'],['whereas','while','而'],['rural life','the countryside','鄉村生活'],['tranquillity','peace','寧靜'],['connection to nature','link to nature','與自然連繫']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'It is often argued that early experiences can shape nearly every aspect of later behaviour.',d:[1,10,16],relation:'用背景觀點引出童年環境可能影響發展',formula:'It is often argued that [早期條件] can shape nearly every aspect of [發展面向]',meaning:'孩子在哪裡成長，可能影響發展的很多方面。',usage:'It is often argued 呈現常見觀點，並非已提供證據證明每個面向都受同等影響。',links:['It is often argued that ', ' can shape nearly every aspect of ','.'],labels:['早期條件','受影響面向']},
 {example:'While cities are widely associated with jobs and transport, the countryside is often regarded as calmer and greener.',d:[0,10,16],relation:'以 While 對照城市的機會與鄉村的健康寧靜形象',formula:'While cities are widely associated with [城市印象], the countryside is often regarded as [鄉村印象]',meaning:'城市通常被聯想到機會便利，鄉村則被視為健康寧靜。',usage:'這是兩地的常見印象，不等於每一座城市或鄉村都一樣。',links:['While cities are widely associated with ', ', the countryside is often regarded as ','.'],labels:['城市印象','鄉村印象']},
 {example:'This essay will examine the advantages and disadvantages of both approaches.',d:[0,10,16],relation:'明確預告會比較兩種成長環境的利弊',formula:'This essay will examine the advantages and disadvantages of [比較對象]',meaning:'文章將分別探討城市與鄉村的好處和缺點。',usage:'路線句本身無論據，正文仍須按兩個環境分開分析。',links:['This essay will examine the advantages and disadvantages of ','.'],labels:['比較對象']},
 {example:'Growing up in a city offers several chances to learn from museums.',d:[2,8,13],relation:'以城市主題句開始第一組好處',formula:'Growing up in a city offers [城市好處]',meaning:'城市成長可帶來教育、醫療及活動等機會。',usage:'下一句須列出可得資源，再說明孩子能從中得到甚麼。',links:['Growing up in a city offers ','.'],labels:['城市好處']},
 {example:'To begin with, urban areas usually provide better access to libraries and after-school clubs.',d:[3,8,13],relation:'以 To begin with 列出城市更容易接觸的資源',formula:'To begin with, urban areas usually provide better access to [具體資源]',meaning:'城市通常較易接觸好學校、專科醫療及課外活動。',usage:'usually/better access 是相對判斷，不要寫成鄉村完全沒有服務。',links:['To begin with, urban areas usually provide better access to ','.'],labels:['具體資源']},
 {example:'This means that children are more likely to get early support and to discover talents in fields such as art and sport.',d:[4,8,12],relation:'This means 把前句資源轉成學業支援與才能探索',formula:'This means that children are more likely to [學習支援] and to [探索機會]',meaning:'更多資源可能帶來較強學業支援，也讓孩子發掘才能。',usage:'This 指前句的學校、醫療及活動可及性。',links:['This means that children are more likely to ', ' and to ','.'],labels:['學業支援','才能探索']},
 {example:'In addition, city life exposes them to new perspectives, which can broaden their horizons and help them become more flexible.',d:[4,9,12],relation:'由文化多樣性推到眼界與適應能力',formula:'In addition, city life exposes them to [不同接觸], which can broaden their horizons and help them become [能力結果]',meaning:'多元文化接觸或擴闊眼界，增加適應力。',usage:'can 表可能機制，不能假設所有城市孩子自動開放。',links:['In addition, city life exposes them to ', ', which can broaden their horizons and help them become ','.'],labels:['多元接觸','能力變化']},
 {example:'However, these advantages often come with higher costs.',d:[3,10,13],relation:'轉折提示城市優勢伴隨代價',formula:'However, these advantages often come with [相關代價]',meaning:'城市的機會便利可能伴隨環境與壓力問題。',usage:'these advantages 回指城市資源與多元接觸；後面要列具體缺點。',links:['However, these advantages often come with ','.'],labels:['相關代價']},
 {example:'Cities are frequently busy and expensive, and many children have limited access to quiet study space.',d:[4,7,12],relation:'具體列出城市擠迫嘈雜污染及安全戶外空間不足',formula:'Cities are frequently [環境問題], and many children have limited access to [欠缺資源]',meaning:'擠迫、噪音和污染可能與安全戶外空間不足同時存在。',usage:'frequently/many 限定範圍，不應概括所有城市。',links:['Cities are frequently ', ', and many children have limited access to ','.'],labels:['環境問題','不足資源']},
 {example:'Moreover, heavy traffic and the fast pace of urban life can create stress for both children and their parents.',d:[4,8,13],relation:'增加交通、犯罪及快節奏造成家庭壓力的論點',formula:'Moreover, [城市壓力來源] can create stress for both children and their parents',meaning:'交通、犯罪率及城市節奏可能令孩子與父母有壓力。',usage:'這是範文列出的可能壓力，不是對所有城市犯罪率的實證比較。',links:['Moreover, ', ' can create stress for both children and their parents.'],labels:['壓力來源']},
 {example:'By contrast, the countryside can provide a quieter start to life.',d:[3,7,13],relation:'以 By contrast 由城市代價轉入鄉村較平靜的童年',formula:'By contrast, the countryside can provide [另一類成長環境]',meaning:'鄉村可能給孩子較平靜踏實的童年。',usage:'轉場後需說明空氣、空間、大自然及社區關係。',links:['By contrast, the countryside can provide ','.'],labels:['另一成長環境']},
 {example:'Cleaner air, regular exercise and more time outdoors are all conducive to physical health and emotional well-being.',d:[4,8,14],relation:'把空氣、空間與自然接觸連到身心健康',formula:'Cleaner air, [條件二] and [條件三] are all conducive to [健康結果]',meaning:'較乾淨空氣、開闊空間和親近自然有利身心健康。',usage:'conducive to 指有利條件，不是每個孩子健康的保證。',links:['Cleaner air, ', ' and ', ' are all conducive to ','.'],labels:['環境條件二','環境條件三','健康結果']},
 {example:'Rural communities are also often more close-knit, so children may grow up with a stronger sense of belonging and safety.',d:[5,8,14],relation:'用 so 連接緊密社區與可能的歸屬及安全感',formula:'Rural communities are also often more close-knit, so children may grow up with [可能感受]',meaning:'鄉村社區較緊密，孩子或更有歸屬及安全感。',usage:'often/may 保留範圍與可能性；不能說所有鄉村都較安全。',links:['Rural communities are also often more close-knit, so children may grow up with ','.'],labels:['可能感受']},
 {example:'Nevertheless, life in the countryside is not without costs.',d:[3,8,11],relation:'轉折承認鄉村亦有缺點',formula:'Nevertheless, life in the countryside is not without [代價]',meaning:'鄉村生活也有教育、醫療及活動機會不足的問題。',usage:'not without 是委婉表達「有」，下一句應具體說明。',links:['Nevertheless, life in the countryside is not without ','.'],labels:['代價']},
 {example:'Educational and medical facilities may be fewer in number and less advanced, which can restrict children’s choices later in life.',d:[4,10,13],relation:'由教育醫療資源較少、較不先進推到長遠限制',formula:'Educational and medical facilities may be [資源差異], which can restrict children’s [長遠結果]',meaning:'較少或較不先進的設施可能限制長遠發展。',usage:'may/can 是可能性；不能推論每個鄉村設施都不足。',links:['Educational and medical facilities may be ', ', which can restrict children’s ','.'],labels:['資源差異','受限制結果']},
 {example:'Furthermore, rural areas may offer fewer cultural and social activities, and this relative isolation can sometimes limit a child’s access to new perspectives.',d:[4,9,13],relation:'補充鄉村社交文化休閒機會較少的另一弊端',formula:'Furthermore, rural areas may offer fewer [活動機會], and this relative isolation can sometimes limit a child’s [接觸面]',meaning:'相對隔離可能減少孩子接觸不同人士與想法的機會。',usage:'fewer/sometimes 限定比較，不表示鄉村孩子完全不接觸新觀點。',links:['Furthermore, rural areas may offer fewer ', ', and this relative isolation can sometimes limit a child’s ','.'],labels:['活動機會','受限制接觸']},
 {example:'In conclusion, both public and private schools offer distinct advantages and disadvantages for children.',d:[2,7,13],relation:'結尾明確回顧兩種環境各有利弊',formula:'In conclusion, both [對象甲] and [對象乙] offer distinct advantages and disadvantages for [受影響者]',meaning:'城市和鄉村對孩子都有不同好處及缺點。',usage:'此篇採平衡收束，不可假設作者說某一邊全面勝出。',links:['In conclusion, both ', ' and ', ' offer distinct advantages and disadvantages for ','.'],labels:['第一環境','第二環境','受影響者']},
 {example:'Urban life provides many learning options, whereas rural life offers space and a closer connection to nature.',d:[2,7,13],relation:'以 whereas 在最後一句並列城市機會與鄉村自然環境',formula:'Urban life provides [城市優勢], whereas rural life offers [鄉村優勢]',meaning:'城市提供機會與多樣性，鄉村提供空間寧靜與自然接觸。',usage:'whereas 對比兩種主要長處，不代表各自沒有對方的長處。',links:['Urban life provides ', ', whereas rural life offers ','.'],labels:['城市優勢','鄉村優勢']},
];
const usageGuides=[
 '當你要先提出一個常見觀點，說某種早期條件可能廣泛影響日後發展時。',
 '當你要用 While 對比兩種環境的常見印象，暫時不判定哪個較好時。',
 '當你要在引言明確預告會檢視兩個比較對象各自利弊時。',
 '當你要用主題句開始分析第一個環境或選項的好處時。',
 '當你要以 To begin with 列出第一個選項更容易取得的具體資源時。',
 '當你要用 This means 把前句的資源可及性推到受益者的機會時。',
 '當你要補充一項接觸經驗，並以 which 說明它可能促進的能力時。',
 '當你已說明好處，要以 However 轉到同一選項伴隨的代價時。',
 '當你要一面描述環境問題，一面指出特定群體難以取得的資源時。',
 '當你要用 Moreover 補充幾項壓力來源，並指出不只一個群體受影響時。',
 '當你要從第一種環境轉到另一種，先提出它的不同長處時。',
 '當你要列出幾個具體環境條件，並說它們有利於身心結果時。',
 '當你要用 so 把緊密的群體關係連到可能的歸屬或安全感時。',
 '當你已說明另一選項好處，要用 not without 承認它也有缺點時。',
 '當你要把設施的數量或品質差異，連到長遠可能受限的發展時。',
 '當你要補充機會較少，並解釋相對隔離可能限制接觸面時。',
 '當你在結論要提醒讀者兩個比較對象各有不同利弊時。',
 '當你要用 whereas 平行列出兩種環境的主要長處，而不作絕對排名時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把城市與鄉村各自的好處及限制放回原文位置。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這篇文章比較哪兩種童年成長環境？',['城市與鄉村','男校與女校','紙本與電子書','全日制與半日制學校'],'city and countryside 是兩個比較對象。'),
 {type:'multi',prompt:'正文分別指出城市與鄉村的哪一組主要長處？',detail:'選兩項，再按「確認」。',options:['城市較容易接觸學校、專科醫療及多種活動','鄉村有較開闊空間、較親近自然與較緊密社區','城市完全沒有任何環境問題','鄉村所有學校都比城市先進'],correct:[0,1],why:'文章把資源與多樣性歸於城市，把自然與社區關係歸於鄉村。'},
];
const route=[sequence('依範文重排兩地比較',[
 ['引言與比較路線','成長地方可能影響發展；文章會看城市與鄉村各自利弊。'],
 ['城市好處','學校、專科醫療、課外活動較易接觸，多元文化可擴闊眼界。'],
 ['城市限制','擠迫、噪音、污染、安全戶外空間不足，以及急促節奏的壓力。'],
 ['鄉村好處','較乾淨空氣、空間、自然接觸及緊密社區。'],
 ['鄉村限制及結論','教育醫療設施及多樣活動可能較少；最後並列兩地不同長處。'],
 ],'作者比較兩個環境，最後沒有宣稱其中一方全面勝出。')];
const evidence=[
 quiz('城市資源如何可能影響孩子？',['較易得到學業支援，亦有更多機會發現音樂、體育等才能','保證所有城市孩子都考第一','令鄉村孩子完全不能學音樂','只要住城市便不需父母幫助'],'範文以 more likely 表資源帶來的可能機會。'),
 quiz('城市文化多樣性的可能效果是甚麼？',['接觸不同文化或擴闊眼界、增加適應力','孩子必然學會所有語言','不同文化只會造成衝突','城市不可能有任何共同文化'],'can 保留可能性。'),
 quiz('範文列出哪兩組城市缺點？',['環境與安全戶外空間問題，以及交通、犯罪率和快節奏壓力','只有學校費用與校服顏色','只有太多樹木與過於安靜','只有醫療設施太少'],'分開看居住環境與家庭壓力。'),
 quiz('鄉村緊密社區與哪個可能效果相連？',['孩子可能更有歸屬感與安全感','所有鄉村都不會有犯罪','每名孩子都必然認識全區居民','鄉村不再需要學校'],'原文 often/may 限定。'),
 quiz('鄉村的兩組限制是甚麼？',['教育醫療設施可能較少，以及社交文化活動較少','空氣必然比城市更髒','所有孩子都完全不能接觸其他人','鄉村一定沒有任何優點'],'資源與多元接觸是兩個不同限制。'),
];
const logic=[
 sequence('城市的機會與代價',[
 ['資源可及性','學校、專科醫療和課外活動較易接觸。'],
 ['可能收穫','學業支援、才能探索及文化眼界增加。'],
 ['生活環境代價','擠迫、噪音、污染與安全戶外空間不足。'],
 ['家庭壓力','交通與快節奏等條件可能令親子受壓。'],
 ],'同一地方可同時提供多種機會及造成生活壓力。'),
 sequence('鄉村的健康感受與資源限制',[
 ['自然條件','空氣、開放空間及親近自然有利身心。'],
 ['社區關係','較緊密的社區可能提升歸屬及安全感。'],
 ['服務限制','教育醫療設施可能較少、較不先進。'],
 ['接觸限制','社交文化休閒機會較少，接觸不同觀點可能受限。'],
 ],'不能只以「安靜」或「資源少」一個詞替代完整權衡。'),
];
const transfers=[
 transfer('一個家庭在選擇居住地時看重孩子的音樂、體育課外機會。','哪句把城市資源與孩子收穫連起來？',["附近課外活動較多，孩子或較易探索音樂與體育興趣才能", "城市課外活動增加後，孩子便必然擅長每一種藝術和運動", "孩子能接觸更多活動，卻不可能從中發現新的興趣", "活動種類多可方便安排，但才能探索只取決於住宅大小"],["把資源可及性連到探索機會，未保證天賦結果。", "機會不保證人人擅長。", "參與可幫助發現興趣。", "住宅大小不是此機制。"],[4,5],'原文 better access to activities→discover talents。'),
 transfer('城市有優質學校，但住宅附近缺少安全遊樂場。','哪句能同時評估機會與生活環境？',["優質學校或利學習，缺安全遊樂場則可能限制戶外活動", "學校資源較好，便能抵消所有缺少戶外空間的影響", "城市有好學校時，孩子就不再需要任何休息和遊玩", "戶外場地不足值得注意，所以學校品質不可能有價值"],["學習資源與日常環境是不同面向。", "好學校不取消場地限制。", "仍需活動空間。", "代價不否定學校收益。"],[4,8],'原文城市有教育資源，也有安全戶外空間不足。'),
 transfer('某鄉村社區居民互相熟悉，但醫療設施距離較遠。','哪句保持兩面分析？',["熟悉鄰里或帶來歸屬感，醫療距離遠則限制服務可及性", "社區居民互相熟悉，便代表醫療設施一定就在附近", "醫療距離較遠，便足以否定鄰里關係帶來的所有支持", "鄰里關係與醫療距離都存在，卻不可能影響家庭生活"],["保留社區連結與醫療可及性兩面。", "親密關係不等於設施近。", "設施代價不取消人際收益。", "兩者都可能影響生活。"],[12,14],'原文 close-knit community 與 fewer medical facilities 並存。'),
 transfer('一名學生在城市每天接觸不同文化背景的同學。','哪句謹慎描述可能效果？',["長期接觸不同文化同學或能擴闊眼界並練習適應差異", "同學背景多元，便能讓每人立即熟悉所有文化習俗", "文化差異可帶來學習，但學生因此不用再練習溝通", "只有聽老師講授文化，與同學互動完全不能帶來理解"],["多樣互動可能促進理解與適應。", "接觸不保證精通。", "仍須學習溝通。", "直接互動也可能有幫助。"],[6],'原文 cultural diversity can broaden horizons and help adaptability。'),
 transfer('某地方空氣較乾淨，也有大片公園。','哪句正確運用「有利條件」而非「保證結果」？',["清潔空氣與公園有利身心，但健康仍受其他因素影響", "空氣較乾淨後，每個孩子便能保證永遠不會生病", "附近有大片公園，便表示醫療和飲食條件不再重要", "環境可影響生活感受，所以個人習慣必然毫無作用"],["把有利條件與結果保證分開。", "環境改善不消除一切疾病。", "健康仍受多因素影響。", "個人習慣也可能重要。"],[11],'原文 cleaner air/open spaces conducive to physical and emotional well-being。'),
 transfer('一家人喜歡鄉村安靜，但擔心孩子難接觸不同想法。','哪句完整描述這個取捨？',["安靜與自然接觸或有益，活動較少卻限制多樣社交機會", "鄉村環境較安靜，便可保證孩子熟悉各種不同觀點", "當地活動較少，便表示鄉村不可能提供任何自然益處", "孩子可在自然中遊玩，所以不同人際接觸已不再重要"],["保留鄉村的環境好處與文化交流代價。", "安靜不保證觀點多樣。", "活動少不取消自然收益。", "自然接觸不取代人際交流。"],[10,11,15],'原文 countryside tranquillity versus relative isolation。'),
 transfer('作文題目要比較兩種教育環境各自的優點與缺點。','哪句提供不偏一方的結尾方式？',["回顧兩地主要收穫和限制，避免宣稱一方對所有家庭最好", "只需列出城市好處，因鄉村的自然環境不屬於比較範圍", "兩地各有優點，便表示每個家庭都會作出相同的選擇", "只用一個孩子的經驗，就能判斷所有人的最佳居住地"],["結尾需按不同面向公平比較。", "漏掉另一方的收益。", "多面比較不導致人人同選。", "個案不能代表所有家庭。"],[2,16,17],'原文 In conclusion both settings have distinct pros and cons。'),
 transfer('某地有更多學校選擇，但交通擠塞令家長與孩子每天受壓。','哪句解釋兩者如何並存？',["教育選擇較多與交通壓力可同時存在，須分別衡量影響", "學校增多後，所有家庭的通勤路程便會自動變短", "家長每天塞車有壓力，便證明學校選擇不可能增加", "交通擠塞或影響生活，但完全不需要納入居住地比較"],["分清教育機會與日常通勤代價。", "學校數量不保證交通改善。", "兩面可同時存在。", "交通仍是家庭條件。"],[4,5,9],'原文城市資源優勢與交通快節奏壓力。'),
 transfer('一個鄉村家庭希望孩子將來接觸更多不同職業和文化。','哪句根據範文指出需留意的條件？',["文化活動若較少，孩子接觸不同職業與觀點的機會或受限", "鄉村社區較安靜，因此孩子必然無法接觸任何外地人", "孩子在鄉村能接觸自然，便不再需要了解不同職業", "當地活動較少，便代表孩子不可能透過其他途徑學習"],["指出機會可能減少，未把學習說成不可能。", "過度否定所有交流。", "自然與職業視野不同。", "仍可能有其他途徑。"],[15],'原文 fewer opportunities/relative isolation can sometimes limit exposure。'),
 transfer('寫城市與鄉村比較時，作者最後並列兩地特點。','哪句最貼近這篇範文的最終立場？',["城市多機會與多樣體驗，鄉村多空間、寧靜和自然接觸", "城市資源較多，所以每個城市孩子的生活一定較好", "鄉村較安靜，因此教育與醫療條件都不必納入比較", "兩地各有好處，便表示孩子的實際生活條件完全相同"],["並列兩地不同優勢，沒有絕對評價。", "個別家庭條件仍不同。", "鄉村益處不取消其他比較。", "好處不同不等於結果相同。"],[16,17],'原文 Urban life provides...whereas rural life offers...。'),
];
const revised=[
 {wrong:['附近活動較多，孩子的藝術表現便應高於鄉村同齡孩子','附近活動較多，家長便可省去觀察孩子興趣的時間','附近活動較多，孩子的才能主要取決於課程的數量'],why:['活動機會不等於相對表現優勢。','資源可增加探索機會，家長仍需留意孩子的興趣。','課程數量本身不能決定孩子的才能。']},
 {wrong:['優質學校有助學習，因此戶外活動空間不必列入評估','缺安全遊樂場會影響活動，因此學校品質也無助學習','孩子在優質學校學習，校內活動便能取代戶外遊樂'],why:['學校收益不能消除遊樂空間的限制。','場地不足不否定學校的學習價值。','校內活動無法直接取代安全的戶外空間。']},
 {wrong:['熟悉鄰里或帶來歸屬感，也表示醫療服務應更容易取得','醫療距離遠限制服務，因此鄰里支持便沒有實際價值','熟悉鄰里能提供幫助，便可代替孩子需要的醫療服務'],why:['人際連結不能證明醫療設施較近。','醫療不便與鄰里支持可以同時存在。','鄰里互助不能代替專業醫療服務。']},
 {wrong:['不同文化同學增加接觸，學生便會自然熟悉各種習俗','文化差異可擴闊眼界，因此日常溝通練習不再重要','課堂講解文化可增進理解，同學之間的互動則較無用'],why:['接觸機會不保證對每種文化都有深入理解。','理解和適應仍需透過交流與練習。','同儕互動也是接觸不同觀點的方式。']},
 {wrong:['清潔空氣與公園能改善環境，孩子的健康便主要由此決定','附近公園有助活動，因此飲食與醫療條件影響較輕微','清潔空氣利於身體，情緒健康可留待另外再詳細考慮'],why:['有利環境不等於健康只由環境決定。','飲食及醫療仍是重要健康因素。','原文同時提到身體和情緒健康。']},
 {wrong:['安靜與自然接觸或有益，因此觀點多樣性也會隨之增加','活動較少限制社交機會，於是自然環境的好處可忽略','安靜環境有益專注，因此孩子不必與不同人士接觸'],why:['自然條件不必然帶來多元社交。','社交限制不能抹去自然環境的益處。','專注與接觸不同觀點是不同面向。']},
 {wrong:['回顧城市的教育優勢即可，因鄉村優點已在正文提及','兩地各有長處，所以可在結尾宣稱每個家庭同樣受益','依一個孩子的生活經驗，推論兩地各自適合甚麼家庭'],why:['結論仍應公平收束兩種環境的主要面向。','各有長處不代表家庭條件與收穫相同。','單一個案不足以概括兩種環境。']},
 {wrong:['學校選擇較多可提升學習，因此交通壓力屬次要問題','交通壓力增加時，新增學校選擇便失去原本的價值','學校數量與交通壓力不同，故只需選一項作出評估'],why:['交通壓力仍可能影響家庭日常生活。','通勤代價不直接取消教育選擇的好處。','兩種影響應分開衡量，而非任選其一。']},
 {wrong:['文化活動若較少，孩子便難以從身邊的人接觸新觀點','鄉村自然環境較豐富，足以補足不同職業的接觸機會','當地文化活動較少，便可推論孩子的教育資源也較差'],why:['活動少不等於身邊的人不能提供觀點。','自然接觸與職業文化接觸是不同經驗。','活動數量不能單獨證明教育品質。']},
 {wrong:['城市資源較多，故教育機會應是選擇居住地的主要準則','鄉村環境較安靜，故可以在結論略過其他生活條件','兩地都有各自好處，因此最後可把其差異概括為相同'],why:['原文並列多種優勢，沒有訂出通用優先順序。','安靜是優點之一，結論仍要保留其他差異。','各有好處不等於兩地條件相同。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
export default {key:'advantage-disadvantage:12',meta:{topic:'城市與鄉村童年環境的資源和生活條件',summary:'範文平衡比較：城市較易接觸教育、醫療、活動和多元文化，但有擠迫污染與壓力；鄉村較寧靜、親近自然和社區緊密，但服務及多樣接觸機會可能較少。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
