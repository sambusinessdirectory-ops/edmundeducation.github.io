import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:89'].map(x=>x.english);
const simple=[
'Professional athletes have a lot of influence in society today.',
'Because many children admire both how athletes play and how they act, I fully agree that athletes should try to be good examples at all times.',
'First, children often copy famous athletes before they really understand why those athletes act as they do.',
'A young fan may see a football player argue with a referee, say cruel things to another player, or brag online, and think this is confidence instead of childish behaviour.',
'After seeing this often, children may begin to think pride, angry behaviour, and poor self-control are normal.',
'But when athletes respect others after losing, practise often, and admit their mistakes, children can learn useful things from their success.',
'What athletes do can teach without words, and for children who copy others easily, this may be stronger than a teacher’s talk.',
'Another point is that professional athletes gain directly from people looking up to them.',
'Their fame, money from brands, and high pay come partly from fans who stay loyal, including young people who buy shirts, watch games, and follow them online.',
'Because athletes enjoy these special benefits, they should also accept the duty to society that comes with them.',
'This does not mean they must be perfect people who never make mistakes.',
'It only means that, during games, in interviews, online, or outside sport, they should act with basic respect, self-control, and honesty.',
'For example, an athlete who stays away from drugs, respects teammates, and truly says sorry after a mistake gives a better example than one who uses talent to excuse bad behaviour.',
'In short, I strongly agree that professional athletes should be good examples at all times.',
'They influence children too much for this to be ignored, and their special position makes responsible behaviour part of their job, not an unfair extra duty.',
];
const vocabulary=[
[['Professional athletes','Professional athletes','職業運動員'],['occupy a powerful place','have a lot of influence','有影響力位置'],['modern society','society today','現代社會']],
[['admire them','admire','崇拜'],['skill','how athletes play','技術'],['image','how they act','形象'],['completely agree','fully agree','完全同意'],['good role models at all times','good examples at all times','任何時候的好榜樣']],
[['famous sports figures','famous athletes','著名體育人物'],['fully understand','really understand','完全明白'],['what famous sports figures do','those athletes act as they do','模仿其行為']],
[['young fan','young fan','年輕球迷'],['footballer','football player','足球員'],['insulting an opponent','say cruel things to another player','侮辱對手'],['boasting online','brag online','網上自誇'],['confidence rather than immaturity','confidence instead of childish behaviour','自信非不成熟']],
[['Over time','After seeing this often','長遠而言'],['normalise','think','正常化'],['arrogance, aggression, and poor discipline','pride, angry behaviour, and poor self-control','傲慢攻擊缺紀律']],
[['By contrast','But','相比之下'],['show respect after defeat','respect others after losing','敗後尊重'],['train consistently','practise often','持續訓練'],['accept responsibility for mistakes','admit their mistakes','承擔錯誤'],['children can actually learn from','children can learn useful things from','孩子可學到']],
[['silent lesson','teach without words','無聲一課'],['impressionable minds','children who copy others easily','易受影響心智'],['louder than any classroom speech','stronger than a teacher’s talk','比課堂演講更有力']],
[['Another important point','Another point','另一重點'],['benefit directly','gain directly','直接受益'],['public admiration','people looking up to them','公眾仰慕']],
[['sponsorships','money from brands','贊助'],['high salaries','high pay','高薪'],['loyalty of ordinary fans','fans who stay loyal','普通球迷忠誠'],['young supporters','young people','年輕支持者'],['watch matches','watch games','觀看比賽']],
[['Since','Because','既然'],['these privileges','these special benefits','這些特權'],['social duty','duty to society','社會責任'],['comes with them','comes with them','隨之而來']],
[['does not mean','does not mean','並不代表'],['live like saints','be perfect people','像聖人生活'],['pretend to be perfect','never make mistakes','假裝完美']],
[['It simply means','It only means','只是意味'],['on the field','during games','球場上'],['away from competition','outside sport','離開比賽'],['basic decency, restraint, and integrity','basic respect, self-control, and honesty','得體克制誠信']],
[['For example','For example','例如'],['avoids drugs','stays away from drugs','遠離毒品'],['treats teammates respectfully','respects teammates','尊重隊友'],['apologises sincerely','truly says sorry','真誠道歉'],['hides behind talent as an excuse for bad conduct','uses talent to excuse bad behaviour','以天賦作藉口']],
[['In conclusion','In short','總結'],['strongly agree','strongly agree','強烈同意'],['professional sportspeople','professional athletes','職業運動員'],['good role models at all times','good examples at all times','任何時候好榜樣']],
[['influence on children','influence children','對兒童影響'],['treated casually','ignored','隨便看待'],['privileged position','special position','優越位置'],['responsible behaviour','responsible behaviour','負責任行為'],['not a burden, but part of the job','part of their job, not an unfair extra duty','非負擔而是職責']],
];
const chunkOverrides={0:['Professional athletes occupy a powerful place','in modern society.'],9:['Since they enjoy these privileges,','they should also accept the social duty that comes with them.'],10:['This does not mean they must live like saints','or pretend to be perfect.']};
const simpleChunkOverrides={0:['Professional athletes have a lot of influence','in society today.'],9:['Because athletes enjoy these special benefits,','they should also accept the duty to society that comes with them.'],10:['This does not mean they must be perfect people','who never make mistakes.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'辨認影響力、榜樣責任與合理界線。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Professional athletes','modern society'],['Online creators','modern society'],'引言定位具有公眾影響力的群體。','討論名人責任時，先交代其社會影響力。',[1,2,7]),
makeStructure(1,['many children','them','their skill','their image','they','good role models at all times'],['many students','public figures','their achievements','their image','those figures','good role models at all times'],'由兒童崇拜技能與形象，推到榜樣責任。','題目問受關注者應否守更高標準，先說明其受眾和原因。',[0,2,13]),
makeStructure(2,['children','famous sports figures','they'],['young viewers','online personalities','the viewers'],'主體一提出模仿先於成熟判斷的機制。','分析偶像行為對年輕受眾的影響時。',[3,4,5]),
makeStructure(3,['A young fan','a footballer','a referee','an opponent','that behaviour','confidence rather than immaturity'],['A young viewer','an influencer','a critic','another creator','that behaviour','confidence rather than immaturity'],'以具體不良行為展示兒童可能誤讀為自信。','已說模仿機制，要示範某負面行為如何被錯誤解讀時。',[2,4,5]),
makeStructure(4,['this','arrogance, aggression, and poor discipline'],['repeated rude behaviour','rudeness, hostility, and poor self-control'],'指出反覆接觸可把不良行為正常化。','分析不良榜樣隨時間可能形成的觀念時。',[2,3,5]),
makeStructure(5,['athletes','respect after defeat, train consistently, and accept responsibility for mistakes','success','children'],['public performers','respect after failure, practise consistently, and accept responsibility for mistakes','success','young viewers'],'以反面對照提出可學的尊重、持續與責任。','已有負面例子，需要用相同角色的正面行為對照時。',[3,4,6]),
makeStructure(6,['Their behaviour','a silent lesson','impressionable minds','that lesson','any classroom speech'],['Their conduct','a silent lesson','young audiences','that lesson','any formal reminder'],'以無聲課比喻榜樣力量。','已列行為，需說明觀察學習可比口頭勸告更有力時。',[2,5,7]),
makeStructure(7,['professional sportspeople','public admiration'],['online performers','public admiration'],'第二理由轉到名人從公眾關注得到利益。','第一段談影響，第二段轉談利益伴隨責任時。',[8,9,10]),
makeStructure(8,['fame, sponsorships, and high salaries','ordinary fans','young supporters','shirts, watch matches, and follow them online'],['fame, brand deals, and high incomes','ordinary followers','young supporters','merchandise, watch shows, and follow them online'],'指出公眾及年輕支持者對名人利益有貢獻。','主張特權伴隨責任，先具體展示利益來源時。',[7,9,10]),
makeStructure(9,['they','these privileges','the social duty'],['influencers','these benefits','the social duty'],'由享有特權推到承擔相應社會責任。','當某群體從公眾支持獲益，要論證回饋責任時。',[7,8,10]),
makeStructure(10,['they','saints','perfect'],['public figures','saints','perfect'],'劃出合理界線：責任不等於完美無錯。','提出較高行為要求後，先排除不合理完美主義時。',[9,11,12]),
makeStructure(11,['they','on the field, in interviews, online, or away from competition','basic decency, restraint, and integrity'],['public creators','at work, in interviews, online, or away from the stage','basic decency, restraint, and integrity'],'界定跨場景的基本得體，而非聖人標準。','已說毋須完美，接著給出實際可遵守的最低標準時。',[9,10,12]),
makeStructure(12,['an athlete','drugs','teammates','a mistake','one who hides behind talent as an excuse for bad conduct'],['a public performer','harmful substances','colleagues','a mistake','one who hides behind fame as an excuse for bad conduct'],'用正面行為對照以天賦作不良行為藉口。','提出基本準則後，需要可觀察行為的對比例子時。',[10,11,14]),
makeStructure(13,['professional sportspeople','good role models at all times'],['public creators','good role models at all times'],'結論重申跨場景榜樣責任。','結論直接回答是否同意持續做榜樣時。',[1,11,14]),
makeStructure(14,['Their influence on children','their privileged position','responsible behaviour','a burden','part of the job'],['The influence of public figures on young viewers','their privileged position','responsible conduct','a burden','part of the job'],'以影響力與特權兩線總結責任為職務部分。','結尾把受眾影響與所得利益結合為責任理由時。',[6,9,13]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者認為職業運動員應在何時作好榜樣？',['任何場合都應有基本得體，但毋須假裝完美','只在比賽得勝的一刻才需尊重人','完全不需顧及兒童或公眾','必須像聖人一樣永遠不犯任何錯'],'作者同意持續責任，明確排除完美主義。'),{type:'multi',prompt:'選出兩段主體不同理由',detail:'選兩項，再按「確認」。',options:['兒童會模仿名人，甚至把不良行為錯看成自信','運動員的高薪與贊助部分來自年輕球迷支持','所有運動員都絕不可能犯錯','只要球技高超便可用天賦開脫壞行為'],correct:[0,1],why:'第一段談影響，第二段談利益和責任。'}];
const route=[sequence('排好全文四段',[['引言 · 完全同意','孩子崇拜技術與形象，運動員應持續作好榜樣。'],['主體一 · 行為模仿','負面行為可被誤讀，正面行為能形成無聲一課。'],['主體二 · 特權責任','球迷支持帶來名氣與收入；基本得體不等於完美。'],['結論 · 職務一部分','影響力與優越位置使負責任行為屬工作責任。']],'兒童模仿 → 良好示範 → 公眾利益 → 合理責任。')];
const evidence=[Q('兒童可能如何誤讀球員爭吵或網上自誇？',['把不成熟行為看成自信','把它必然看成犯規紀錄','認為這只關乎門票價格','把它理解為球場設備問題'],'原文說 confidence rather than immaturity。'),Q('運動員何種正面行為可供學習？',['敗後尊重、持續訓練及承認錯誤','只要贏球便不向任何人道歉','用天賦替所有不良行為開脫','只在訪問時表現出尊重'],'原文列三項。'),Q('名氣、贊助與高薪部分來自甚麼？',['普通球迷，包括購衣看賽事的年輕支持者','只來自運動員的私人家庭','只來自比賽場地的建築材料','與任何公眾支持完全無關'],'公眾忠誠支持是利益來源之一。'),Q('「毋須像聖人」之後的基本準則是甚麼？',['場內外保持得體、克制與誠信','任何場合都要假裝毫無缺點','只在正式訪問中才需守規矩','只要成績好便可侮辱對手'],'責任不等於完美。')];
const logic=[sequence('主體一：為何行為是無聲一課？',[['模仿機制','兒童在理解原因前已會模仿。'],['負面例子','爭吵、侮辱與自誇被誤讀為自信。'],['累積效果','傲慢與攻擊行為或變得正常。'],['正面對照','敗後尊重、持續訓練及承擔錯誤。'],['段落結論','可見行為比課堂說教更有力。']],'受眾模仿 → 負或正行為 → 習慣與觀念。'),sequence('主體二：特權帶來甚麼責任？',[['受益來源','年輕及一般球迷支持名氣、贊助與收入。'],['責任原則','既享特權，亦應承擔社會義務。'],['合理界線','不用像聖人或假裝完美。'],['實際標準','場內外有得體、克制、誠信。'],['對比例子','避毒、尊重、真誠道歉，不以天賦開脫。']],'公眾支持 → 特權 → 可行的基本準則。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('年幼粉絲看到球星辱罵裁判，誤以為這是自信。','第一段指出甚麼風險？',['兒童可能模仿名人，並誤解其不成熟行為','辱罵裁判必然讓孩子懂得尊重規則','粉絲只會注意比分，永不觀察球員行為','有名氣便能使任何不良行為變得正確'],['模仿與錯誤解讀。','並非尊重。','會觀察。','名氣不開脫。'],[2,3,4],'copy behaviour before understanding it'),
T('運動員輸球後尊重對手，承認失誤並繼續訓練。','這示範哪些可學習行為？',['尊重、持續努力及為錯誤負責','只要輸球便應立即責怪所有隊友','成功只靠天賦，不需持續練習','承認失誤代表永遠不能再比賽'],['原文正面對照。','相反。','仍需練習。','可承擔再改進。'],[5,6],'respect defeat, train, accept mistakes'),
T('創作者靠年輕追隨者購買商品與觀看節目取得收入。','文章如何推導責任？',['從公眾支持受益者，應承擔相應社會責任','一旦有收入，便不需再重視任何觀眾','年輕人消費，便代表名人能任意侮辱他人','只要有贊助，個人行為就與社會無關'],['privilege implies duty。','仍須尊重。','不免責。','有影響。'],[7,8,9],'privileges come with social duty'),
T('有人說要求球星做好榜樣等於要求他們永不犯錯。','原文怎樣劃清界線？',['不求完美，仍要求基本得體、克制與誠信','必須像聖人一樣從來不曾犯任何錯','只要會道歉，便可反覆作出任何傷害','榜樣責任只適用於比賽勝利之後'],['聖人標準被排除。','原文反對。','道歉非免責。','跨場景。'],[10,11,12],'not saints; basic decency'),
T('運動員在場上守規矩，網上卻經常侮辱他人。','這符合文章的榜樣標準嗎？',['不符合；網上與場內同樣需保持基本尊重','符合；離開球場便不用顧及兒童觀眾','符合；只要能得分，語言就完全無關','不符合；因運動員必須永遠不會犯錯'],['online also covered。','標準跨場景。','得分不開脫。','非完美要求。'],[1,10,11,13],'on field, interviews, online, away'),
T('孩子看見偶像真誠道歉，因而更願意承認自己的失誤。','這是哪種教育作用？',['行為成為無聲一課，可比口頭教導有力','只有課堂演講能教孩子承擔錯誤','只要偶像道歉，孩子便永遠不會犯錯','真誠道歉一定會讓運動員失去技術'],['silent lesson。','行為亦可教。','非保證。','與技術無關。'],[5,6,12],'behaviour becomes a silent lesson'),
T('一位球星用高超技術作為自己辱罵隊友的藉口。','文中例子如何評價？',['天賦不能替不良行為開脫，仍應尊重隊友','技術越好便越不需向任何人解釋','辱罵隊友是球迷忠誠支持的唯一來源','只要能贏球，就必定沒有社會責任'],['source contrasts excuse。','不免責。','非唯一來源。','有責任。'],[11,12],'talent no excuse for bad conduct'),
T('有人說名人只負責技藝，影響孩子並非其職務。','結論的反駁是甚麼？',['影響力與特權使負責任行為成為職務一部分','名人若有特權，便可完全不理兒童受眾','觀眾只看技藝，從不注意任何人的形象','責任只在接到正式法律命令才會出現'],['part of job。','特權帶責任。','形象受關注。','道德責任。'],[1,7,8,9,14],'responsible behaviour part of job'),
T('球星公開承認錯誤並改正，卻未能維持完美形象。','這是否違反作者要求？',['沒有；基本誠信與承責比假裝完美重要','有；任何錯誤都令其永遠不得再做榜樣','有；承認錯誤必然教孩子拒絕運動','沒有；因球星只須在球場上表現得體'],['不求完美。','錯誤可承擔。','無此必然。','不只場內。'],[5,10,11,12],'not pretend perfect; accept mistakes'),
T('球迷常模仿名人言行，尤其孩子未能判斷背後原因。','這支持哪種責任？',['名人應留意日常言行對年幼受眾的影響','兒童若模仿名人，名人就能完全免責','球迷喜歡球技，便永遠不會看其形象','孩子未成熟，所以任何榜樣都毫無作用'],['影響力是責任基礎。','非免責。','形象亦重要。','榜樣有力。'],[1,2,3,6],'children copy before understanding'),
T('某明星靠粉絲支持取得高薪，但說自己不欠公眾任何操守。','作者會指出甚麼？',['既享受公眾帶來的利益，也應接受相應責任','高薪只由私人天賦形成，與粉絲毫無關係','有責任便等於此人必須假裝自己完美','只要有收入，場外言行便可任意傷人'],['benefit and duty。','粉絲有貢獻。','不求完美。','須得體。'],[7,8,9,10,11],'fame and salary built partly on fans'),
T('要概括作者對職業運動員榜樣責任的立場。','哪項最完整？',['強烈同意持續作好榜樣，毋須完美','完全反對；球星對孩子沒有任何影響','只支持球場內得體，網上言行不作考慮','認為任何錯誤都應永久終止運動員生涯'],['立場與界線俱全。','影響很大。','涵蓋網上。','不求完美。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14],'role models at all times; not saints'),
];
const plausibleAlternatives=[
  [['兒童可能模仿名人，辱罵卻與自信無關','球星言行可能被看見，孩子主要模仿技術','孩子會注意爭吵，但能自行辨別成熟行為'],['情境正顯示孩子把辱罵誤認作自信。','文章指出孩子也可能模仿場外言行。','年幼受眾未必能作出這種判斷。']],
  [['尊重對手有益，輸球便宜暫停訓練','持續訓練重要，失誤可由隊友承擔','承認錯誤可學，但尊重應視勝負而定'],['文章重視在失敗後仍持續努力。','承責不能轉嫁給隊友。','榜樣的基本尊重不取決於勝負。']],
  [['公眾支持有助收入，責任可交予經紀公司','收入來自粉絲，名人應只提供優質作品','受眾年輕，明星的行為可由父母另行解釋'],['經紀安排不能替代本人言行責任。','文章把受益與社會責任連在一起。','家庭教育存在，不會消除名人的影響。']],
  [['不求完美，只需得體地處理勝利時刻','承認可犯錯，便不必再要求基本克制','要求誠信，但場外言行可留給粉絲判斷'],['基本操守不只適用於勝利時。','不求完美不等於放棄行為標準。','文章明確要求場內外都得體。']],
  [['不符合；網上言行會影響形象，但與榜樣無關','符合；場內守規則便足以完成主要責任','不符合；應停止網上使用，場內可保持原樣'],['影響孩子的網上行為也屬榜樣責任。','場內得體不能抵銷場外侮辱。','問題是尊重他人，不是必須離開網絡。']],
  [['行為可成示範，但說教仍比道歉更有力','真誠道歉可影響孩子，仍只屬私人事件','孩子學會承認錯誤，主要因偶像贏球'],['原文強調實際行為可比說教更有力。','公開道歉正可能被年幼粉絲看見。','情境的因果在道歉而非勝利。']],
  [['天賦值得欣賞，隊友是否受傷可留待後說','技術越出色，辱罵便較易被團隊接受','尊重隊友重要，但球星成績可作部分開脫'],['傷害隊友不能因技術高而忽略。','能力不會把辱罵變成合宜行為。','文章明確拒絕以天賦免責。']],
  [['影響力與特權存在，責任主要由教練承擔','技藝是職務核心，場外形象應由市場評價','名人可影響孩子，但只需回應正式投訴'],['教練不能代替名人自己的言行。','文章視榜樣責任為職務的一部分。','日常影響不以正式投訴為限。']],
  [['沒有；承認錯誤有用，場外克制可較少要求','有；作榜樣須維持不出錯的公眾形象','沒有；因球迷主要只看實際運動成績'],['作者仍要求場內外基本克制。','文章明言不要求像聖人般完美。','球迷也會留意言行與誠信。']],
  [['名人應留意形象，主要避免輸球後失望','年幼觀眾會模仿，責任可由學校教導','球迷能判斷好壞，名人只須管比賽技術'],['影響不限於輸球情境。','學校教育不會消除名人行為的作用。','年幼孩子未必能辨別背後原因。']],
  [['粉絲支持帶來收入，操守可交由球隊規定','高薪來自表現，粉絲支持只影響人氣','社會責任存在，但應限於公開比賽場合'],['規則可協助，個人仍須負責。','原文明確把贊助與高薪連到球迷支持。','場外及網上言行亦可能影響粉絲。']],
  [['同意作好榜樣，但只在公開比賽時','強烈同意榜樣責任，要求形象不犯錯','支持運動員有操守，仍以球技為唯一標準'],['作者要求場內外均得體。','原文不要求完美無錯。','文章也重視對年幼受眾的行為示範。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:89',meta:{topic:'職業運動員是否須時刻作好榜樣',summary:'作者強烈同意職業運動員應在不同場合維持好榜樣。孩子會模仿名人，或把爭吵、侮辱和自誇誤認作自信；尊重敗仗、持續訓練與承認錯誤則是有力的無聲一課。運動員的名氣、贊助和高薪部分來自年輕球迷支持，故特權伴隨社會責任；要求的是場內外基本得體、克制、誠信，毋須像聖人般完美。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
