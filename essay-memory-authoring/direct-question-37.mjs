// Individually reviewed support for Direct Question 37; canonical essay text is loaded unchanged.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-37-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:37'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Modern life has brought many good things, but it has also made many old ways of living less common.',
  'I think it is important to keep these ways alive because they help people know who they are and feel connected to people before them.',
  'We can do this by bringing them into schools and community life, instead of keeping them only as things to look at in museums.',
  'The main reason to protect old ways of living is that they connect people to their past and to each other.',
  'Local celebrations, family customs, old skills and food from different areas are more than old habits; they hold ideas, memories and knowledge that new machines or shopping cannot replace.',
  'If these ways disappear, young people may still live in modern cities but may not feel part of the story of the people before them.',
  'For example, a child who only knows popular culture from around the world may use the newest devices but know little about the words, manners or celebrations of their grandparents.',
  'So old customs link younger and older people and help societies remember where they came from as they change.',
  'But old customs will continue only if people keep doing them in everyday life.',
  'Schools should use activities to teach local history, old arts and community customs instead of just making pupils learn facts by heart, so they can take part in culture.',
  'At the same time, governments and local groups should help pay for celebrations, craft markets, projects that record older people’s stories and places where older people can teach young people.',
  'Technology can help too: short videos, saved material online and online classes let people far from their home communities learn about old customs.',
  'To sum up, old ways of living are worth keeping because they protect who people are and keep their connections strong.',
  'The best way is not to reject modern life, but to put old customs into schools, community events and online spaces, so people still use them today.',
];
const vocabulary=[
  [['Modernisation','Modern life','現代化'],['clear benefits','many good things','明顯好處'],['traditional ways of life','old ways of living','傳統生活方式'],['pushed many traditional ways of life to the margins','made many old ways of living less common','推向邊緣']],
  [['In my view','I think','在我看來'],['preserving these traditions','keep these ways alive','保存傳統'],['cultural identity','know who they are','文化身份'],['social continuity','feel connected to people before them','世代延續']],
  [['achieved','do this','達成'],['making traditions part of education and community life','bringing them into schools and community life','融入學校社區'],['rather than treating them as museum pieces','instead of keeping them only as things to look at in museums','不是當展品']],
  [['traditional lifestyles','old ways of living','傳統生活'],['protected','protect','保護'],['connect people with their history','connect people to their past','連結歷史'],['with one another','to each other','連結彼此']],
  [['Customs','old habits','習俗'],['local festivals','Local celebrations','本地節日'],['family rituals','family customs','家庭儀式'],['traditional crafts','old skills','傳統工藝'],['regional food','food from different areas','地方食物'],['not merely old habits','more than old habits','不只是舊習'],['shared values, memories and forms of knowledge','ideas, memories and knowledge','價值記憶知識'],['cannot be replaced','cannot replace','不能取代']],
  [['these practices disappear','these ways disappear','傳統消失'],['younger generations','young people','年輕一代'],['sense of belonging','feel part','歸屬感'],['wider story','story of the people before them','較大的歷史脈絡']],
  [['global popular culture','popular culture from around the world','全球流行文化'],['latest devices','newest devices','最新設備'],['know little about','know little about','所知不多'],['language, manners or celebrations','words, manners or celebrations','語言禮儀慶典'],['grandparents’ lives','their grandparents','祖父母生活']],
  [['In this sense','So','從這意義'],['tradition acts as a bridge between generations','old customs link younger and older people','傳統連結世代'],['remain rooted','remember where they came from','不忘根源'],['move forward','change','向前發展']],
  [['However','But','然而'],['survive','continue','延續'],['kept alive in practical ways','keep doing them in everyday life','以實際方式延續']],
  [['Schools should teach','Schools should use activities to teach','學校應教'],['local history','local history','本地歷史'],['traditional arts','old arts','傳統藝術'],['through activities','use activities','透過活動'],['dry memorisation','just making pupils learn facts by heart','枯燥背誦'],['experience culture','take part in culture','體驗文化']],
  [['At the same time','At the same time','同時'],['governments and local communities','governments and local groups','政府和社區'],['support festivals','help pay for celebrations','支持節日'],['craft markets','craft markets','工藝市集'],['oral-history projects','projects that record older people’s stories','口述歷史'],['pass on skills to the young','teach young people','傳授技能']],
  [['Technology can also help','Technology can help too','科技亦可幫忙'],['digital archives','saved material online','數碼檔案'],['online lessons','online classes','網上課程'],['traditional knowledge accessible','learn about old customs','可接觸傳統知識'],['living far from their original communities','far from their home communities','遠離原鄉']],
  [['In conclusion','To sum up','總結'],['preserve traditional ways of life','old ways of living are worth keeping','保留傳統生活'],['cultural identity','who people are','文化身份'],['social bonds','connections strong','社會連繫']],
  [['best approach','best way','最佳方法'],['not to resist modern life','not to reject modern life','不抗拒現代'],['weave tradition into education','put old customs into schools','融入教育'],['community activities and digital platforms','community events and online spaces','社區與數碼平台'],['living part of society','people still use them today','持續活用']],
];
const chunkOverrides=[
  ['Modernisation has brought clear benefits,','but it has also pushed many traditional ways of life','to the margins.'],
  ['In my view, preserving these traditions is important','because they give people cultural identity and social continuity.'],
  ['This can be achieved by making traditions','part of education and community life,','rather than treating them as museum pieces.'],
  ['The main reason traditional lifestyles should be protected','is that they connect people with their history','and with one another.'],
  ['Customs such as local festivals, family rituals,','traditional crafts and regional food','are not merely old habits;','they carry shared values, memories and forms of knowledge','that cannot be replaced by technology or consumer culture.'],
  ['When these practices disappear,','younger generations may still live in modern cities,','but they can lose a sense of belonging','to a wider story.'],
  ['For example, a child who learns only global popular culture','may know how to use the latest devices,','yet know little about the language, manners or celebrations','that shaped their grandparents’ lives.'],
  ['In this sense, tradition acts as a bridge','between generations and helps societies remain rooted','while they move forward.'],
  ['However, traditions survive only if','they are kept alive in practical ways.'],
  ['Schools should teach local history, traditional arts','and community customs through activities','rather than dry memorisation,','so students can experience culture','instead of simply reading about it.'],
  ['At the same time, governments and local communities','should support festivals, craft markets, oral-history projects','and public spaces where older people','can pass on skills to the young.'],
  ['Technology can also help: short videos, digital archives','and online lessons','can make traditional knowledge accessible','to people living far from their original communities.'],
  ['In conclusion, it is important to preserve','traditional ways of life','because they protect cultural identity and strengthen social bonds.'],
  ['The best approach is not to resist modern life,','but to weave tradition into education,','community activities and digital platforms,','so it remains a living part of society.'],
];
const simpleChunkOverrides=[
  ['Modern life has brought many good things,','but it has also made many old ways of living','less common.'],
  ['I think it is important to keep these ways alive','because they help people know who they are','and feel connected to people before them.'],
  ['We can do this by bringing them','into schools and community life,','instead of keeping them only','as things to look at in museums.'],
  ['The main reason to protect old ways of living','is that they connect people to their past','and to each other.'],
  ['Local celebrations, family customs, old skills','and food from different areas','are more than old habits;','they hold ideas, memories and knowledge','that new machines or shopping cannot replace.'],
  ['If these ways disappear,','young people may still live in modern cities','but may not feel part','of the story of the people before them.'],
  ['For example, a child who only knows popular culture','from around the world may use the newest devices','but know little about the words, manners or celebrations','of their grandparents.'],
  ['So old customs link younger and older people','and help societies remember where they came from','as they change.'],
  ['But old customs will continue only if','people keep doing them in everyday life.'],
  ['Schools should use activities to teach local history,','old arts and community customs','instead of just making pupils learn facts by heart,','so they can take part in culture.'],
  ['At the same time, governments and local groups','should help pay for celebrations, craft markets,','projects that record older people’s stories','and places where older people can teach young people.'],
  ['Technology can help too: short videos,','saved material online and online classes','let people far from their home communities','learn about old customs.'],
  ['To sum up, old ways of living are worth keeping','because they protect who people are','and keep their connections strong.'],
  ['The best way is not to reject modern life,','but to put old customs into schools,','community events and online spaces,','so people still use them today.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句建立相同的意思關係。`,distractorReason:`這句${focus}，但並非原句的意思關係。`};}
const structures=[
  card('Digital tools have brought benefits, but they have also pushed old crafts out of daily life.','以 but 並列現代化好處與傳統邊緣化',[1,2,3],fixed(0,'[現代化] has brought [明顯好處], but it has also pushed [傳統生活方式] to the margins.','先承認現代生活有好處，再指出傳統受擠壓。','開題談現代化與傳統的張力，要避免把現代化一概說成壞事時。',[' has brought ', ', but it has also pushed ', ' to the margins.'],['帶來變化的現代化','先承認的好處','受擠壓的傳統'])),
  card('In my view, keeping local songs matters because they help people know their roots and stay connected.','以 because 表明保留傳統的身份與世代理由',[0,3,12],fixed(1,'In my view, preserving [傳統] is important because they give people [文化身份] and [世代連續性].','回答傳統為何值得保留：身份認同及人與前代的連結。','題目問傳統是否重要，須在引言表態並預告兩項原因時。',['In my view, preserving ', ' is important because they give people ', ' and '],['被保留的傳統','第一項身份好處','第二項社會連結'])),
  card('This can be achieved by teaching songs in school and singing them locally, rather than locking them in archives.','以 by ... rather than ... 區分生活實踐與靜態展品',[1,8,9],fixed(2,'This can be achieved by making [傳統] part of [教育與社區生活], rather than treating them as [博物館展品].','回答怎樣保存：讓傳統可學可用，而非只供觀看。','題目第二問要求可行方法，要先給出融入日常的總方向時。',['This can be achieved by making ', ' part of ', ', rather than treating them as '],['要活用的傳統','應融入的生活場域','應避免的靜態定位'])),
  card('The main reason local songs should survive is that they connect people to their past and neighbours.','以 The main reason ... is that 提出歷史與社群連結',[1,4,7],fixed(3,'The main reason [傳統生活方式應受保護] is that they connect [人們] with [歷史] and with [彼此].','主體段先提出傳統如何同時連接過去與當代社群。','開始說傳統的重要性，需把文化作用具體成歷史和人際連結時。',['The main reason ', ' is that they connect ', ' with ', ' and with '],['需保護的生活方式','被連結的人','歷史脈絡','同代社群'])),
  card('Village songs are not merely old tunes; they carry memories that new devices cannot replace.','以 not merely ...; they carry ... 修正舊習的價值',[3,5,6],fixed(4,'[節日、儀式、工藝和地方食物] are not merely [舊習慣]; they carry [共享價值、記憶與知識] that cannot be replaced by [科技或消費文化].','列出傳統的具體形式，再說其難被新產品取代的知識記憶。','有人把習俗當作過時習慣，要指出它們承載的社會內容時。',[' are not merely ', '; they carry ', ' that cannot be replaced by '],['具體傳統例子','被否定的狹窄看法','真正承載的內容','無法替代的現代力量'])),
  card('When local songs disappear, young people may still live here but lose a sense of belonging.','以 When ... may still ... but 說明傳統消失後的歸屬損失',[4,6,7],fixed(5,'When [傳統實踐消失], [年輕一代] may still live in [現代城市], but they can lose [與較大歷史脈絡的歸屬].','現代生活繼續，卻不一定保住年輕人與前代的連繫。','傳統的價值已說明，要指出它消失會造成甚麼難看見的損失時。',['When ', ', ', ' may still live in ', ', but they can lose '],['逐漸消失的實踐','可能受影響的人','仍存在的現代生活','可失去的歸屬感'])),
  card('For example, a child may use new apps yet know little about the songs their grandparents sang.','以 may ... yet ... 對照科技熟練與文化陌生',[5,7,8],fixed(6,'For example, [只接觸全球流行文化的孩子] may know how to use [最新設備], yet know little about [祖父母的語言禮儀慶典].','具體呈現傳統斷裂：孩子懂新科技卻不了解家族文化。','已談歸屬感流失，要讓讀者看見它在孩子身上的具體樣子時。',['For example, ', ' may know how to use ', ', yet know little about '],['文化接觸偏窄的孩子','熟悉的現代工具','不熟悉的前代生活'])),
  card('In this sense, local songs bridge generations and keep a village rooted while it changes.','以 bridge between generations 總結傳統連過去與未來',[5,6,8],fixed(7,'In this sense, [傳統] acts as a bridge between [世代] and helps [社會] remain rooted while they [向前發展].','傳統不是阻止現代化，而是讓社會前進時不失根源。','孩子例子已說明代際斷裂，需用一個總結比喻說傳統的連結作用時。',['In this sense, ', ' acts as a bridge between ', ' and helps ', ' remain rooted while they '],['能連結的傳統','被連起來的世代','受益的社會','仍然進行的變化'])),
  card('However, songs survive only if people keep singing them in everyday life.','以 only if 指出傳統延續依賴持續實踐',[2,7,9],fixed(8,'However, [傳統] survive only if [在生活中持續實踐].','第二主體段由保留價值轉到保存方法，核心是活用。','已論證值得保存，接着要說不能只收藏而必須持續參與時。',['However, ', ' survive only if '],['需要延續的傳統','延續不可缺少的條件'])),
  card('Schools should teach local songs through singing, rather than rote copying, so pupils can experience them.','以 through ... rather than ... so 對照體驗與死記',[2,8,10],fixed(9,'Schools should teach [本地歷史藝術習俗] through [活動] rather than [枯燥背誦], so [學生體驗文化] instead of [只讀文字].','學校應讓學生親身做，而非只背名稱和年代。','想提出教育方法時，須說明活動如何比枯燥背誦更能讓傳統活下去。',['Schools should teach ', ' through ', ' rather than ', ', so ', ' instead of '],['要教的本地文化','親身參與方式','應避免的教法','學生活用的結果','較淺的接觸方式'])),
  card('At the same time, councils can fund festivals and shared spaces where elders teach younger people.','以 At the same time 加入政府社區的傳承渠道',[8,9,11],fixed(10,'At the same time, [政府與社區] should support [節日、市集與口述史] and [公共空間] where [長者] can pass on skills to [年輕人].','學校以外，社區活動和代際教學場所也要有支持。','校內活動已提出，再加上校外讓長者直接傳技的實際渠道時。',['At the same time, ', ' should support ', ' and ', ' where ', ' can pass on skills to '],['應共同出力的主體','活動及紀錄計劃','可傳技的空間','傳授者','學習者'])),
  card('Technology can also help: videos and online lessons let distant families learn local songs.','以冒號列數碼工具擴大遠方人的接觸',[8,10,13],fixed(11,'Technology can also help: [短片、數碼檔案與網課] can make [傳統知識] accessible to [遠離原社區的人].','數碼工具不一定取代傳統，也能讓離鄉者接觸它。','已列學校和社區做法，還要照顧不住原社區的人時。',['Technology can also help: ', ' can make ', ' accessible to '],['可用的數碼工具','藉此可接觸的知識','因距離而受益的人'])),
  card('In conclusion, local songs should be preserved because they protect identity and strengthen bonds.','以 because 重申傳統的身份及社群作用',[1,7,13],fixed(12,'In conclusion, it is important to preserve [傳統生活方式] because they protect [文化身份] and strengthen [社會連繫].','結論先答傳統重要性，回扣身份與連繫兩項原因。','兩個主體段已完成，末段需先明確回答值不值得保留時。',['In conclusion, it is important to preserve ', ' because they protect ', ' and strengthen '],['要保留的生活方式','文化上的好處','人際社會好處'])),
  card('The best approach is not to reject phones, but to share local songs through schools, events and online lessons.','以 not to ... but to ... so 拒絕反現代與活用傳統的假兩難',[2,9,12],fixed(13,'The best approach is not to [抗拒現代生活], but to [把傳統融入教育社區數碼平台], so it remains [社會中活的部分].','保存傳統不必抗拒科技；把傳統放進日常及數碼場域才能活下去。','結論回答「如何做到」，要說清不需排斥現代生活而要活化傳統時。',['The best approach is not to ', ', but to ', ', so it remains '],['被排除的反現代做法','真正提倡的融入方式','要達到的持續狀態'])),
];
const wrongReasons=[
  ['文化身份立場只評價傳統，沒有承認現代化的好處及其代價。','教育社區方法是政策方向，不是背景張力。','歷史連結是重要原因，沒有 but 的雙面開題。'],
  ['現代化雙面描述是背景，未對傳統保存明確表態。','歷史與彼此連結是主體段詳述，尚未概括身份延續。','結論重申理由，並非引言首度給出作者立場。'],
  ['身份理由回答為何保存，沒有 by ... rather than 的做法對比。','實際延續條件只指出活用，未給教育社區總方案。','校內活動是後文具體措施，非引言整體方向。'],
  ['身份和社會連續性只是引言預告，沒有主體段歷史與彼此連結。','習俗清單是細證，未提出主理由。','代際橋樑是後文比喻收束。'],
  ['主理由只說連結，沒有舊習與承載價值的對照。','年輕人失歸屬是傳統消失後果，未列具體習俗。','孩子懂科技不懂家文化是例子，不是習俗價值清單。'],
  ['習俗價值清單是前提，未說消失後年輕人如何受影響。','孩子例子是下一步具體呈現。','代際橋樑是保留傳統的總結，不是消失造成的失落。'],
  ['傳統消失後果是總述，沒有孩子懂設備卻不懂祖父母文化。','代際橋樑是例子之後的結論。','傳統活用條件轉入第二問，不是代際斷裂的例子。'],
  ['歸屬損失只說可能後果，沒有橋樑與向前的比喻。','孩子例子展示斷裂，尚未總結根源與前進可並存。','實際活用是保存方法，不是傳統的世代作用。'],
  ['引言方法已說融入教育社區，沒有 only if 的必要條件。','代際橋樑仍在保存理由，未轉入做法。','學校活動是條件之後的具體方法。'],
  ['引言方法是總方向，未對照活動與枯燥背誦。','活用條件是原則，未說學校怎樣做。','社區支持是校外渠道，不是學校教學方式。'],
  ['傳統活用條件未列政府社區的節日市集傳技場所。','學校活動是校內教法，非校外代際渠道。','數碼工具照顧遠居者，與現場傳技不同。'],
  ['活用條件未列短片檔案網課。','學校活動需要在場參與，沒有解決遠居者距離問題。','社區市集傳技是線下場域，不是數碼可及性。'],
  ['引言身份理由未經兩段論證，不是結論重申。','橋樑比喻是主體段收束，沒有結尾政策判斷。','末句回答怎樣做，而非先說為何重要。'],
  ['引言教育社區方法沒有整合數碼工具與不抗拒現代。','學校活動只是方法之一，缺社區數碼整合。','前句結論只重申重要性，沒有 not to ... but to 的方法取捨。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清保存理由與實際做法，再按範文次序排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要回答哪兩個問題？',[
    '保留傳統生活是否重要，以及可以用甚麼方式保留',
    '哪件古物最昂貴，以及博物館應收多少門票',
    '所有科技是否有害，以及城市應如何拆除手機',
    '哪個節日最熱鬧，以及誰能買最多傳統食物',
  ],'作者一方面說明值得保留，另一方面提出學校、社區及數碼做法。'),
  {type:'multi',prompt:'選出範文的兩項主要判斷',detail:'選兩項，再按「確認」。',options:[
    '傳統保存身份與世代連繫，值得延續',
    '傳統要透過教育、社區與科技繼續被使用',
    '要保留傳統，就必須完全拒絕現代生活',
    '只把習俗放入博物館展櫃便已足夠',
  ],correct:[0,1],why:'範文既說價值，也強調活的傳承方式。'},
];
const route=[sequence('依範文次序排列四段的工作',[
  ['引言承認張力','現代化有益，也令傳統邊緣化；作者主張保存並活用。'],
  ['為何值得保存','習俗承載記憶知識，讓年輕人與前代相連。'],
  ['如何實際傳承','學校活動、社區節日和數碼工具共同使傳統可接觸。'],
  ['結論回應兩問','重申身份與連繫價值，選擇融入現代生活的做法。'],
],'第一主體段答重要性，第二主體段答如何做到。')];
const evidence=[
  quiz('傳統習俗為何不只是舊習慣？',[
    '節日、工藝和地方食物承載共享價值、記憶與知識',
    '只因年代久遠，便必然完全沒有現代意義',
    '所有傳統都只能用新手機取代，毋須再學習',
    '地方食物與節日從未與家庭或社群有關',
  ],'原文以具體習俗說明傳統承載代際內容。'),
  quiz('孩子懂新設備卻不懂祖父母的文化，說明甚麼？',[
    '科技熟練不能自動帶來對家族語言與禮儀的認識',
    '孩子只要會用設備，就必然知道全部祖輩習俗',
    '祖父母生活和孩子的歸屬感完全沒有關聯',
    '只接觸全球文化必定使每一種本地習俗更強',
  ],'例子把現代技能與代際文化知識分開。'),
  quiz('「世代橋樑」比喻的核心是甚麼？',[
    '社會前進時仍可維持與過去和彼此的連結',
    '為保留傳統，社會必須停用所有新科技',
    '傳統只存在於真實的橋梁建築結構中',
    '年輕一代應與長者完全停止交流',
  ],'原文不是反現代，而是讓發展不切斷根源。'),
  quiz('學校應如何讓學生體驗傳統？',[
    '用活動教授本地歷史藝術與習俗，而非只背誦',
    '只要求學生背完名稱，不讓他們參加任何活動',
    '完全不教地方文化，只讀世界名人廣告',
    '把每項文化都鎖入展櫃，不允許孩子接觸',
  ],'活動讓文化成為可做、可感受的生活經驗。'),
  quiz('政府社區可建立哪些傳承渠道？',[
    '節日、市集、口述史及長者教年輕人的空間',
    '只建更多空置展櫃，不讓長者分享技能',
    '只宣傳國際商品，不支援地方節日',
    '只錄一段片，卻禁止任何人觀看或學習',
  ],'原文列具體社區活動與面對面傳技場所。'),
  quiz('科技在文章中扮演甚麼角色？',[
    '短片、數碼檔案和網課讓遠方人也接觸傳統',
    '新科技一出現，所有傳統便不可能再被保存',
    '科技只可用來移除地方語言和習俗資料',
    '網上資料只能讓住原社區的人學習文化',
  ],'作者把科技看成擴大傳承可及性的工具。'),
  quiz('結論的「不是抗拒現代，而是融入」要避免甚麼？',[
    '避免把保留傳統和使用現代工具當成只能二選一',
    '避免任何學校或社區教人參與傳統活動',
    '避免所有數碼工具接觸傳統知識',
    '避免長者向年輕人分享本地技能',
  ],'文章提出兼用教育、社區和數碼渠道的活傳承。'),
];
const logic=[
  sequence('傳統為何重要',[
    ['習俗承載內容','節日工藝食物帶着共同價值、記憶與知識。'],
    ['消失帶來斷裂','年輕人可能失去對前代故事的歸屬。'],
    ['孩子例子','會用新設備，也未必懂祖輩語言禮儀。'],
    ['代際橋樑','傳統把歷史與當下生活連起來。'],
    ['前進仍有根','社會不用停下發展，也可保留身份。'],
  ],'範文以價值、損失、例子和比喻逐步回答重要性。'),
  sequence('傳統怎樣活下去',[
    ['必須持續實踐','收藏不能代替日常參與。'],
    ['學校親身活動','本地歷史藝術不只靠死記。'],
    ['社區與長者','節日、市集、口述史和傳技空間。'],
    ['數碼延伸','短片與網課讓離鄉者也能學。'],
    ['融入現代生活','傳統繼續被使用，而非只成展品。'],
  ],'三種渠道互補，讓傳承有場所、參與者與遠方入口。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一座城市修建新廣場，打算拆走老街區的手工藝工作坊。','哪項最能運用範文的現代與傳統平衡？',[
    '保留工藝場地並融入新廣場，讓新設施與傳承並存',
    '只因要現代化，就把所有手工藝活動永久取消',
    '只鎖起工作坊舊工具，不再讓任何人學會使用',
    '只拍新廣場廣告，不理老街工藝的社區記憶',
  ],['原文承認現代化好處，也主張傳統繼續融入生活。','這切斷傳承。','展品不能代替實踐。','記憶是傳統價值。'],[0,2,13],'範文不要求拒絕現代生活，而是把傳統融入新場域。'),
  transfer('孩子會使用最新手機，卻不知道祖父母家鄉的問候語和節日。','哪項最能套用範文的代際例子？',[
    '安排長者分享語言與節日，補回孩子和前代的連結',
    '只因孩子會用手機，就假設他已懂全部家族習俗',
    '不讓長者和孩子交談，以免本地語言重新出現',
    '只增加手機功能，完全不問孩子對家族有何認識',
  ],['原文用科技熟練與不懂祖輩文化作對照。','科技不自動帶來文化知識。','交流有助傳承。','設備功能無法補足歸屬。'],[5,6,7],'範文以孩子懂設備卻不了解祖父母語言禮儀為例。'),
  transfer('學校把傳統音樂課改成只背樂器名稱，不讓學生聽或演奏。','哪項最符合範文的學校教法？',[
    '讓學生聽奏並訪問樂師，以活動代替只背名稱',
    '只增加樂器名稱測驗，避免任何實際文化接觸',
    '把樂器封進櫃裏，讓學生永遠不能聽見其聲音',
    '只教國際流行歌，完全不提社區的音樂傳統',
  ],['原文反對枯燥背誦，鼓勵親身體驗本地文化。','只背無體驗。','展櫃不能代替實踐。','地方文化應可接觸。'],[2,8,9],'範文說學校應以活動教授傳統，而不只是乾背或閱讀。'),
  transfer('地方語言只留在博物館錄音機裏，社區年輕人從未聽過它被日常使用。','哪項最能運用「活的傳統」原則？',[
    '邀請長者在社區活動中說本地語言並教年輕人',
    '只把錄音機加上玻璃罩，避免任何人學會說話',
    '只記錄語言名字，不讓家庭和學校實際使用',
    '只播放外地廣告，讓本地語言完全退出生活',
  ],['原文說傳統須在實際活動中延續，不只作展品。','保存物件不等於傳承。','使用是關鍵。','會加速消失。'],[2,8,9,10],'範文要求把傳統放入教育和社區生活，而非只當博物館展品。'),
  transfer('一群青年移居海外，想學家鄉的菜式和節日習俗，卻無法回鄉。','哪項最能運用文章的科技方案？',[
    '製作短片和網課，讓遠居者也能學習地方傳統',
    '只辦家鄉現場課，完全不提供任何遠距入口',
    '把食譜和錄音刪除，避免海外青年知道內容',
    '只說科技會傷害傳統，不考慮實際學習需要',
  ],['原文指數碼資料可讓遠離原社區者接觸傳統。','距離仍是障礙。','刪除資料會失傳。','科技可作工具。'],[10,11,13],'範文列短片、數碼檔案和網課幫助遠居者學傳統。'),
  transfer('城鎮要保存木工手藝，只補助工具展覽，未安排師傅教學。','哪項最符合範文的社區傳承方式？',[
    '設工藝市集和教學空間，讓師傅把技巧傳給新人',
    '只陳列木工工具，不讓任何年輕人嘗試製作',
    '只給展品拍照，拒絕舉辦社區活動或課程',
    '把所有師傅搬離社區，避免有人學到木工技藝',
  ],['原文強調長者在公共空間把技能傳給年輕人。','工具陳列不足。','活動是實踐渠道。','會切斷傳技。'],[8,10],'範文提出工藝市集和長者傳技的公共空間。'),
  transfer('一個社區節日仍有人參加，但主辦方說它只是過時娛樂，沒有其他價值。','哪項最能轉用範文的文化價值論證？',[
    '調查節日的記憶與共同價值，讓居民理解其意義',
    '只按售票數決定節日是否有身份或社會作用',
    '因為習俗古老，就斷言其中沒有任何可學知識',
    '只換節日海報，不問家族和社區為何仍參與',
  ],['原文說習俗不只是舊習，承載價值、記憶與知識。','售票不足以衡量全部。','舊不等於無知識。','要問參與意義。'],[3,4,7],'範文以節日、工藝、地方食物說明傳統承載共享價值與記憶。'),
  transfer('學校想記錄街坊故事，學生只在網上閱讀，沒有機會和講述者見面。','哪項最能結合範文的兩種做法？',[
    '讓學生訪談長者並建數碼檔案，兼顧接觸與保存',
    '只下載文字，不聽長者親自解釋經歷和技能',
    '只做訪談而立即刪除內容，遠居者永遠看不到',
    '只在展櫃放訪談標題，不讓學生參與任何活動',
  ],['口述史加親身活動和數碼檔案可互補。','少實際交流。','少遠距保存。','仍是靜態展品。'],[9,10,11],'範文同時提出活動、口述歷史及數碼檔案。'),
  transfer('市政廳要決定傳統舞蹈的資助標準，有人只問它是否和最新科技一樣新。','哪項判斷最符合文章的立場？',[
    '看它能否連結世代並讓社區參與，無須排斥科技',
    '只要舞蹈年代久遠，就必定沒有文化和社會價值',
    '只要有科技工具，就不必保留任何傳統活動',
    '只看舞台燈光價格，不問年輕人能否學習舞蹈',
  ],['原文重視代際連結，也認為現代工具可促傳承。','年代不等於無價值。','科技可幫助。','參與學習是關鍵。'],[1,7,11,13],'範文說傳統是世代橋樑，最佳方案是融入而非抗拒現代生活。'),
  transfer('議會有三項預算：學校文化活動、社區工藝節和讓海外居民觀看的網課。','哪項資源分配最貼近範文的完整方法？',[
    '三項互相配合，讓傳統能在場參與也能遠距學習',
    '只買博物館展櫃，不安排學生或居民接觸',
    '只做線上宣傳，完全不讓本地師傅教年輕人',
    '只辦一次節日，不留下任何可再學習的資料',
  ],['原文把教育、社區和數碼渠道結合成活傳承。','缺生活參與。','缺代際傳技。','缺長期可及性。'],[2,9,10,11,13],'範文引言與結論都主張教育、社區及數碼平台相互補足。'),
];
export default {key:'direct-question:37',meta:{topic:'現代化下保存傳統生活方式',summary:'傳統維繫文化身份與代際連結；學校活動、社區傳技和數碼工具使它持續被使用。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
