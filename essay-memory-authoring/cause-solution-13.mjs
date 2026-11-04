// Reviewed Cause/Solution 13: risks of unsupervised internet use and layered safeguards.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-13-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:13'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Children use the internet at younger ages and with less adult watching, so they may meet dangers they are too young to understand.',
  'Parents therefore have two main problems: protecting children from harmful online things and helping them learn to control their internet use.',
  'This essay looks at these problems and ways to fix them.',
  'One main problem is that parents cannot easily see what children view online or who they talk to.',
  'The internet is not one safe place: a child may begin with cartoons, but a click can bring up violent videos, false information or chats with people they do not know.',
  'Because children often cannot tell fun content from content meant to trick them, they may give away private details, copy bad actions or feel scared by upsetting material.',
  'Another problem is the struggle to set limits on screen use.',
  'Apps and devices are made to keep people watching, so children may fight limits, do homework too quickly, sleep late or choose screens over playing with others in person.',
  'Parents therefore need to deal not just with a device, but also with a strong habit.',
  'Clear rules, safety tools and teaching can reduce these problems.',
  'First, parents should make regular home rules: use devices where adults can see, limit screen time until homework is done, and keep phones out of bedrooms at night.',
  'Second, parents should use tools suited to each child’s age, privacy settings and safer search, as extra protection rather than a replacement for talking with children.',
  'Finally, children need to learn how to judge what they see online.',
  'Schools and parents can explain why children must keep personal details private, be careful with people they meet online, and tell adults about upsetting content quickly.',
  'This changes internet safety from a secret fight into something families can talk about openly.',
  'To sum up, internet use without adult supervision creates problems because parents struggle to see risks online and set limits on screen habits.',
  'The best answer is not to ban the internet completely, but to use steady rules, protection and teaching so children can use it safely as they get older.',
];
const vocabulary=[
  [['going online','use the internet','上網'],['less adult supervision','less adult watching','較少成人監督'],['expose them to risks','meet dangers','接觸風險'],['not mature enough to recognise','too young to understand','未成熟到足以辨識']],
  [['face two main difficulties','have two main problems','面對兩大困難'],['harmful digital material','harmful online things','有害網上內容'],['develop self-control online','learn to control their internet use','培養網上自控能力']],
  [['discuss','looks at','討論'],['suggest solutions','ways to fix them','提出解方']],
  [['monitor','see','監察'],['communicate with','talk to','交流']],
  [['single controlled space','one safe place','單一受控空間'],['one click','a click','一次點擊'],['misleading information','false information','誤導資訊'],['strangers','people they do not know','陌生人']],
  [['Since','Because','由於'],['lack the judgement','cannot tell','缺乏判斷力'],['manipulation','content meant to trick them','操控'],['reveal private information','give away private details','透露私人資料'],['disturbing content','upsetting material','令人不安的內容']],
  [['difficulty','problem','困難'],['battle over screen time','struggle to set limits on screen use','螢幕時間的拉鋸']],
  [['Digital devices','Apps and devices','電子設備'],['designed to hold attention','made to keep people watching','設計來吸引注意'],['resist limits','fight limits','抗拒限制'],['rush homework','do homework too quickly','匆忙做功課'],['face-to-face play','playing with others in person','面對面玩耍']],
  [['not only a device, but also a powerful habit','not just with a device, but also with a strong habit','不只設備也有習慣'],['managing','deal','管理']],
  [['reduced through','reduce','透過措施減少'],['technical safeguards','safety tools','技術保障'],['education','teaching','教育']],
  [['consistent household routines','regular home rules','一致家庭規律'],['shared areas','where adults can see','共用空間'],['kept out of bedrooms','keep phones out of bedrooms','不把手機放睡房']],
  [['age-appropriate controls','tools suited to each child’s age','適齡管控功能'],['privacy settings','privacy settings','私隱設定'],['safe-search tools','safer search','安全搜尋'],['substitute for parenting','replacement for talking with children','取代家長管教'],['safety net','extra protection','安全網']],
  [['digital judgement','judge what they see online','網絡判斷力'],['taught','learn','教導']],
  [['personal details should not be shared','keep personal details private','不分享個人資料'],['online strangers may be dangerous','be careful with people they meet online','網上陌生人可能危險'],['reported immediately','tell adults about upsetting content quickly','立即報告']],
  [['turns internet safety','changes internet safety','轉變網絡安全'],['hidden battle','secret fight','隱藏角力'],['open conversation','something families can talk about openly','公開對話']],
  [['In conclusion','To sum up','總結'],['unsupervised internet use','internet use without adult supervision','缺乏監督的上網'],['monitor online risks','see risks online','監察網上風險'],['control digital habits','set limits on screen habits','控制電子設備習慣']],
  [['most effective response','best answer','最有效回應'],['total ban','ban the internet completely','全面禁止'],['steady combination','use steady','持續結合'],['boundaries','rules','界線'],['as they grow','as they get older','隨成長']],
];
export {original,simple,vocabulary};
function frame(i,links,labels,meaning,usage,example,tag,job){
  const value=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed wording ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
  if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched slot labels ${i+1}`);
  return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
  frame(0,[', which can '],['年幼兒童缺少監督而上網的現況','接觸未必能辨識的風險'],'which can 把上網情境連到可能接觸的風險。','提出一項常見行為後，要補上它對某類較脆弱者的可能後果時。','Children may use public chats, which can expose them to strangers.','which can','把行為接到可能風險'),
  frame(1,[': '],['父母面對兩項困難的總述','內容安全與網上自控兩方面'],'冒號將「兩項困難」具體展開，避免只說家長很難管。','引言要先分清兩類性質不同的風險，讓後文分別展開時。','Families face two concerns: unsafe messages and too much screen time.','colon','把問題總數展開成具體類別'),
  frame(2,[' will discuss ',' and suggest '],['本文','前句提出的問題','相應解方'],'will discuss...and suggest 明確對應題目的問題和解方兩問。','引言已概括問題，還需要簡短交代文章將回答哪些部分時。','This report will discuss the risks and suggest safeguards.','will discuss...and suggest','預告問題與解方'),
  frame(3,[' is that '],['家長監察的主要困難','難知孩子看甚麼及和誰交流'],'is that 後直接說明家長難以看見的兩種網上活動。','主體段開始分析安全風險，需先指出監察或控制的困難時。','One major problem is that adults cannot see every private message.','is that','點出監察難題'),
  frame(4,[': ', ', but '],['互聯網並非單一受控空間的概括','孩子起初可能只看卡通的情境','一次點擊可能接觸的風險'],'冒號展開網絡風險的轉變；but 對比無害起點與下一步的危險內容。','要解釋為何看似安全的起點仍可能很快通往有害結果時。','The site may look harmless: a child starts with games, but one link opens an unsafe chat.','colon...but','由無害起點轉到風險'),
  frame(5,['Since ', ', they may '],['孩子難辨娛樂與操控的原因','透露資料、模仿或受驚的可能結果'],'Since 先指出判斷力不足，主句再列可能後果。','某群體尚未具備足夠判斷力，需要說明因此可能受到的影響時。','Since young users may trust strangers, they may share private details.','Since...may','由判斷不足推到風險'),
  frame(6,[' is the '],['另一項家長難題','螢幕時間界線的拉鋸'],'Another difficulty 轉由內容風險到使用時間與習慣。','第一項問題已分析外部風險，接着要轉入自控或習慣問題時。','Another difficulty is the habit of checking phones at night.','Another difficulty is','轉入習慣問題'),
  frame(7,[', so '],['設備設計持續吸引注意的條件','孩子可能抗拒限制及犧牲睡眠或功課'],'so 把設備吸引注意的設計連到孩子的行為後果。','要解釋一項規則為何在實際執行時常遇到阻力時。','Games send frequent alerts, so children may keep checking their phones.','so','把產品設計接到行為後果'),
  frame(8,[' not only ',' but also '],['家長實際在管理的行為','一部設備','背後強大的習慣'],'not only...but also 提醒父母：管設備之外，也要處理已形成的習慣。','問題表面涉及一個物件，實際還涉及持續行為模式時。','Teachers manage not only tablets but also pupils’ study habits.','not only...but also','指出表面物件與深層習慣'),
  frame(9,[' reduced through '],['上述兩類問題','規則、工具及教育三層解方'],'through 把內容與時間問題連到三種互補保護。','完成問題分析後，要概括幾個層面互補的解方時。','Online risks can be reduced through rules, safeguards and open discussion.','reduced through','概括三層解方'),
  frame(10,['First, ', ': '],['家長建立一致家庭規律的行動','共用空間、功課後使用與睡房規則'],'First 開啟家規；冒號把抽象規律轉成可執行安排。','要把抽象的「設立規則」改寫成可實際執行的幾項措施時。','First, families should set clear routines: phones stay outside bedrooms at night.','First...colon','把家庭規則具體化'),
  frame(11,[' not as ', ', but as '],['適齡管控與私隱工具','不能取代家長管教的界線','補充保護的安全網角色'],'not as...but as 限定技術工具的用途：輔助父母，不是把教育外判。','提出一項技術或管理工具時，需要避免把它寫成唯一且足夠的解方時。','Use filters not as a replacement for guidance, but as a backup layer.','not as...but as','界定技術工具的輔助角色'),
  frame(12,['Finally, '],['孩子需要學習判斷網上內容的最後一層措施'],'Finally 把家規和工具之外的教育安排帶入。','已列外部界線與工具，還要補上使用者自身的辨識能力時。','Finally, young users need to learn when to ask an adult for help.','Finally','加入孩子的判斷教育'),
  frame(13,[' can explain why ', ', why ', ', and why '],['學校與父母','個人資料不應分享','陌生人可能危險','令人不安內容應及時報告'],'重複 why 把三條安全原則各自連到背後理由，而非只下命令。','要把一項抽象安全教育拆成數個具體可教的判斷能力時。','Adults can explain why passwords stay private, why strangers need care, and why threats should be reported.','can explain why...','以三個理由教安全判斷'),
  frame(14,[' from ',' into '],['網絡安全教育','隱藏的角力','家人可公開討論的話題'],'from...into 說明教育讓家長與孩子由對抗轉向溝通。','列出原則後，要概括它如何改變人與人之間的互動方式時。','Honest talks can turn secrecy from a risk into a chance to ask for help.','from...into','展示由對抗走向對話'),
  frame(15,[' because '],['缺乏監督上網造成問題的總結','家長難監察內容及管好使用習慣的兩個理由'],'because 以一句話收束外部風險與內部習慣兩條問題線。','結尾回答困難題，須同時回扣兩類不同問題時。','Unsupervised use creates problems because families cannot monitor messages or bedtime habits.','because','在結尾合併兩類問題'),
  frame(16,[' not ', ', but ', ', so that '],['最有效的應對','應排除的全面禁用','規則、保護與教育的配套','孩子隨成長安全上網的目標'],'not...but 排除全面禁止；so that 說明配套目標是逐步安全使用。','結尾要避免只給極端禁令，改以可持續的保護與教育收束時。','The answer is not a total ban, but clear rules and teaching, so that pupils learn safely.','not...but...so that','排除極端措施並說明配套目的'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的問題與解方次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('家長面對哪兩類主要困難？',['避免孩子接觸有害網上內容，以及幫助他們管理使用習慣','只需選擇手機外殼的顏色','只需禁止孩子做任何學校功課','所有孩子都已完全懂得辨識網上操控'],'引言清楚分成內容安全與自控習慣兩部分。'),
  quiz('範文主張哪種解方組合？',['清晰家規、適齡技術保障與安全判斷教育','只靠一個過濾程式，完全不和孩子溝通','只全面禁用，永遠不教孩子判斷','只講一次道理，不設任何實際界線'],'三層措施互補，技術工具不能取代家長和教育。'),
];
const route=[sequence('由兩類風險走到三層保護',[
  ['引言：界定兩項家長困難','內容或陌生人風險，以及螢幕時間與習慣管理。'],
  ['主體一：展示風險如何形成','一次點擊可通往有害內容；吸引注意的設計也使孩子難守界線。'],
  ['主體二：提出相配措施','家規、適齡管控及私隱工具先降低風險；教育提升孩子的判斷。'],
  ['結尾：拒絕單一禁令','以界線、保護和教育配套，讓孩子隨成長逐步安全上網。'],
],'工具是安全網，教育與親子對話仍然必要。')];
const evidence=[
  quiz('為何家長難以完全監察孩子所見內容？',['孩子可由看似安全的卡通，經一次點擊接觸有害內容或陌生人','互聯網所有網站都由同一位家長管理','每個網頁都只提供完全相同的兒童內容','孩子只會在成年人面前使用單一網站'],'範文以一次點擊展示網絡內容的轉變速度。'),
  quiz('孩子判斷力不足會帶來甚麼風險？',['可能透露私隱、模仿不合適行為，或被令人不安的內容嚇怕','必然立即懂得辨識所有操控方式','只會影響手機電池，不會影響行為或私隱','只說別上網，不示範私隱與求助方法'],'原文用 may 列出可能後果，沒有說每個孩子都會遇到。'),
  quiz('螢幕時間為何不只是管理設備？',['產品吸引注意，長期使用會形成需要處理的習慣','設備一關機，任何既有習慣便立刻消失','只有設備顏色會影響孩子睡眠','家長永遠不需要建立日常規律'],'範文由設計吸引注意推到抗拒限制及日常習慣。'),
  quiz('家庭規律包括哪些具體做法？',['在共用空間使用設備、完成功課後限時、夜間手機不放睡房','只換網絡名稱，不改使用時間或位置','讓手機整夜留在孩子床邊而不作討論','完全取消孩子與父母的所有對話'],'第一項解方把一致的家規落到空間、功課與夜間安排。'),
  quiz('技術保障應扮演甚麼角色？',['適齡管控和私隱設定可作安全網，但不能代替家長管教','安裝過濾工具後便不必再教任何網絡判斷','只用密碼就可保證孩子永不接觸陌生人','技術工具和教育必須二選一'],'原文明確說 not as a substitute...but as a safety net。'),
  quiz('網絡判斷教育要教哪三件事？',['私隱資料不應分享、網上陌生人或有風險、令人不安內容應立即報告','只教孩子怎樣延長螢幕時間','只教手機型號，不談私隱與求助','只要求孩子遇事永遠保密'],'最後一組措施教孩子理解風險並懂得求助。'),
];
const logic=[
  sequence('內容風險如何由一次點擊形成',[
    ['家長難完全看見網上活動','不知道孩子看到甚麼或與誰交流。'],
    ['無害起點可能迅速轉變','由卡通跳到暴力影片、誤導內容或陌生人對話。'],
    ['孩子判斷力尚未成熟','難分娛樂、操控與私隱風險。'],
    ['可能出現具體後果','透露資料、模仿不合適行為或受驚。'],
  ],'不要把每次上網說成必然受害；範文分析的是可能風險。'),
  sequence('家規、技術與教育如何分工',[
    ['家規設定可預期界線','共用空間、功課後限時、夜間手機不入房。'],
    ['技術工具提供額外安全網','適齡管控、私隱設定及安全搜尋降低接觸風險。'],
    ['教育培養孩子自身判斷','解釋私隱、陌生人與如何即時求助。'],
    ['親子互動由角力轉對話','孩子逐漸能安全使用網絡。'],
  ],'三層措施互補，沒有任何一項可單獨替代其餘兩項。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('某校學生由兒童影片連到陌生人私訊群組，家長此前只檢查了首頁內容。','哪項分析最貼近範文？',[
    '查後續連結與陌生人互動，勿只信安全首頁',
    '首頁安全便保證後續每個連結同樣安全',
    '只查影片年齡，不看私訊和個資風險',
    '只查陌生人身份，不看後續內容風險',
  ],['範文指出一次點擊可由安全首頁通往危險內容或陌生人互動，兩種後續風險都要檢查。','首頁安全並不能保證所有後續連結安全。','單看影片年齡漏了題目已出現的陌生人私訊及私隱風險。','單查私訊者也漏了連結後可能出現的有害內容。'],[3,4,5],'原文指出互聯網不是單一受控空間，孩子一次點擊便可能轉向風險。'),
  transfer('家長為孩子安裝過濾工具後，打算從此不談私隱或陌生人。','依範文，應怎樣修正？',[
    '適齡工具作安全網，也教孩子判斷與求助',
    '裝工具後毋須再與孩子討論網上情境',
    '只開私隱設定，不教孩子辨認陌生人',
    '只講家庭規則，不檢查裝置的安全設定',
  ],['適齡工具提供額外保護；家長仍須教孩子判斷風險和求助。','把過濾工具當成親子對話的替代品，違反原文的安全網定位。','私隱設定有用，但未教孩子處理陌生人接觸。','家規有用，但不能因此省掉適齡的技術保障。'],[9,10,11,12,13],'原文把技術保障界定為安全網，而非家長管教的替身。'),
  transfer('孩子常在床邊使用手機到深夜，第二天上課疲倦。','哪項家庭措施最直接？',[
    '訂夜間規則，手機放睡房外並討論睡眠',
    '只在早上責備，晚上仍讓手機放床邊',
    '只限制上網總量，不處理睡前放置位置',
    '只在週末沒收手機，平日睡前照常使用',
  ],['夜間手機不入睡房是原文的具體家規，也直接處理晚睡問題。','早上責備沒有改變夜間手機在床邊的條件。','只看上網總量沒有處理題目所指的睡前位置。','週末沒收無法處理平日每晚的晚睡情境。'],[7,8,10],'原文把晚睡列為螢幕習慣後果，提出夜間手機不入房。'),
  transfer('某應用不斷發出提醒，孩子總在功課中途查看螢幕。','哪項因果推理最符合範文？',[
    '通知設計會誘使查看，須配合功課時段規則',
    '只怪孩子不自律，不查通知設計的影響',
    '關掉所有通知便不用再訂任何日常界線',
    '只顧完成功課，不檢查反覆查看的習慣',
  ],['原文把吸引注意的設備設計連到匆忙功課與界線拉鋸，須訂可執行規則。','只責怪孩子忽略通知設計對注意力的影響。','關通知可減少干擾，但不等於日常時間界線不再需要。','只看功課是否完成，漏了反覆查看形成的習慣。'],[6,7,8,10],'原文指出設備留住注意力，家長要處理的不只是一部設備。'),
  transfer('一名學生收到陌生人要求提供住址，卻不確定應否向成年人求助。','哪項教學最忠於範文？',[
    '教個資保密、識別陌生人與及早報告',
    '先回覆陌生人並提供少量資料，再判風險',
    '只封鎖陌生人，不教孩子何時向成人求助',
    '保證所有網上陌生人都值得信任',
  ],['原文把私隱、陌生人和立即報告列為三項需要解釋的安全原則。','先透露資料會增加題目所指的私隱風險。','封鎖陌生人未教孩子遇到可疑要求時向誰求助。','全面避開網絡未教孩子日後如何保護資料和求助。'],[12,13,14],'原文要求學校與家長解釋三項安全原則。'),
  transfer('一位家長主張讓所有十六歲以下孩子永遠不能接觸互聯網。','範文更支持哪個方向？',[
    '設持續界線與教育，隨成長漸進使用',
    '全面禁網而不教孩子任何安全判斷',
    '只教安全技巧，完全不設使用時間界線',
    '只談網絡好處，忽略需要處理的風險',
  ],['原文排除全面禁令，提出持續界線、保護和教育，讓孩子逐步安全使用。','禁網而不教判斷，孩子仍欠缺日後安全使用的能力。','只教技巧而不設時間界線，漏了習慣管理問題。','只談好處忽略原文列出的內容與習慣風險。'],[9,12,16],'原文結尾寫 not a total ban, but... boundaries, protection and education。'),
  transfer('學校只告訴孩子「網上要小心」，沒有教哪些資料不能分享或遇事向誰報告。','哪項補充最有用？',[
    '以私隱陌生人及不安內容教判斷求助',
    '只重複上網要小心，不教判斷步驟',
    '只教下載遊戲，不談私訊或個資保護',
    '只叫孩子自行處理，不建立成人求助途徑',
  ],['範文把抽象的安全提醒拆成私隱、陌生人與令人不安內容的具體教學。','重複口號沒有示範如何辨認或何時求助。','下載遊戲技巧沒有處理私訊或個資風險。','叫孩子獨自處理，違反原文鼓勵及時報告的做法。'],[12,13],'原文用三個 why 具體教私隱、陌生人與報告。'),
  transfer('另一篇文章討論兒童在網上遊戲花太多時間；有人只談刪除遊戲程式。','哪項補充能轉用範文的習慣觀點？',[
    '查通知設計與作息，設一致時間界線',
    '只刪一次程式，便不再討論使用習慣',
    '只怪孩子，不看通知如何分散注意力',
    '只設時間表，不檢查睡眠功課受何影響',
  ],['範文提醒家長管理的不只是程式，更是由注意力設計和作息形成的習慣。','刪一次程式無法保證整體螢幕習慣消失。','只怪孩子忽略通知等設計對注意力的拉扯。','時間表有助建立界線，但仍須檢查睡眠與功課影響。'],[6,7,8,10],'原文把螢幕時間拉鋸解釋為由設計與習慣共同形成。'),
  transfer('家長與孩子每次談網絡安全都變成爭吵，孩子遇到不安內容也不敢說。','哪項改變最符合範文？',[
    '以規則與解釋建立求助對話，教何時報告',
    '只把安全問題保密，避免孩子主動求助',
    '只訂處罰，不解釋私隱或陌生人風險',
    '只等孩子主動報告，從不詢問網上經歷',
  ],['清楚界線與風險解釋有助孩子知道何時報告，讓安全議題能公開討論。','把安全問題保密會阻礙孩子求助。','只處罰未教孩子辨認私隱與陌生人風險。','只等孩子主動說，未主動建立可談論的家庭對話。'],[13,14],'原文說安全教育能把 hidden battle 變成 open conversation。'),
  transfer('結尾已談孩子接觸不當內容，卻忘記螢幕時間習慣與解方。','怎樣修訂最貼近範文？',[
    '總結內容與習慣風險，再提規則保障教育',
    '只列危險內容，不提使用時間和家庭措施',
    '只談家庭時間，不問陌生人或私隱風險',
    '只提全面禁令，不教孩子日後如何判斷',
  ],['結尾應同時回應內容與習慣兩類問題，並收束規則、保護、教育三層解方。','只列內容類型，漏了使用習慣與家庭措施。','只談時間問題，漏了陌生人及私隱等內容風險。','全面禁令與原文的逐步安全使用目標相反。'],[15,16],'原文結尾同時概括 monitor online risks、control digital habits 和三層回應。'),
];
const revisedAlternatives={
  3:[['通知設計會分心，功課規則可由孩子自行決定','關掉部分通知後，可不再談日常查看習慣','只記錄查看次數，暫不處理應用提醒設計'],['文章也重視可執行且一致的界線。','減少提醒不等於習慣管理已完成。','若不處理誘發查看的設計，問題仍在。']],
  4:[['先回覆陌生人，再教學生如何報告可疑要求','教孩子保密住址，但陌生人辨識可留待日後','封鎖陌生人足夠，向成人求助可先省去'],['回覆可疑帳號可能增加私隱風險。','辨認陌生人是安全判斷的一部分。','孩子仍需知道何時及如何向成人求助。']],
  5:[['保留時間界線，安全判斷可待成年再教','只教安全技巧，時間習慣則由孩子自訂','談網絡風險即可，不需漸進使用安排'],['教育須隨使用成長逐步建立。','文章也重視一致的使用時間界線。','理解風險還須配合可實行的界線。']],
};
Object.entries(revisedAlternatives).forEach(([index,[options,reasons]])=>{transferTasks[index].options.splice(1,3,...options);transferTasks[index].explanations.splice(1,3,...reasons);});
export default {key:'cause-solution:13',meta:{topic:'兒童缺乏監督上網的內容與習慣風險',summary:'家長難監察有害內容和螢幕習慣；一致家規、適齡工具與判斷教育共同提供保護。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
