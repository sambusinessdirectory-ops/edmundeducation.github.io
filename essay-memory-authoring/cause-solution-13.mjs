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
  quiz('孩子判斷力不足會帶來甚麼風險？',['可能透露私隱、模仿不合適行為，或被令人不安的內容嚇怕','必然立即懂得辨識所有操控方式','只會影響手機電池，不會影響行為或私隱','保證所有網上陌生人都值得信任'],'原文用 may 列出可能後果，沒有說每個孩子都會遇到。'),
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
    '檢查連結後的內容與陌生人互動，因為安全的起點不能保證下一步安全',
    '只要首頁是兒童影片，所有後續連結必然安全',
    '只問孩子喜歡哪套卡通，不看訊息與私隱風險',
    '認為陌生人私訊一定等同學校課程',
  ],['範文用一次點擊展示內容可以迅速轉向有害或陌生人互動。','把安全起點誤當整條路線的保證。','未處理題目已出現的私訊風險。','陌生人私訊不能直接當作受控課程。'],[3,4,5],'原文指出互聯網不是單一受控空間，孩子一次點擊便可能轉向風險。'),
  transfer('家長為孩子安裝過濾工具後，打算從此不談私隱或陌生人。','依範文，應怎樣修正？',[
    '保留適齡工具作安全網，同時教孩子判斷與求助',
    '既然有工具，就完全不必再和孩子對話',
    '把所有私隱設定關掉，讓孩子自己猜測',
    '只用工具而不建立任何家庭界線',
  ],['原文說工具不是管教的替代品，教育仍然必要。','與 not as a substitute 的明確限定相反。','關閉私隱設定會減少一層保護。','範文同時要求家規與技術保障。'],[9,10,11,12,13],'原文把技術保障界定為安全網，而非家長管教的替身。'),
  transfer('孩子常在床邊使用手機到深夜，第二天上課疲倦。','哪項家庭措施最直接？',[
    '建立一致的夜間規則，把手機放在睡房外並討論睡眠影響',
    '只在早上責備孩子，但晚上仍讓手機放床邊',
    '完全不設時間或位置界線',
    '只更換手機殼，不處理夜間使用習慣',
  ],['範文明列手機夜間不放睡房，針對晚睡習慣。','早上責備不能代替夜間可執行規則。','與一致家規方向相反。','手機殼不影響使用時間。'],[7,8,10],'原文把晚睡列為螢幕習慣後果，提出夜間手機不入房。'),
  transfer('某應用不斷發出提醒，孩子總在功課中途查看螢幕。','哪項因果推理最符合範文？',[
    '吸引注意的設計可加強查看習慣，因此要配合功課時段規則',
    '所有孩子查看螢幕都只因故意不尊重家長',
    '通知設計與注意力完全無關',
    '只要完成一次功課，長期習慣便自動消失',
  ],['範文把設備設計、抗拒界線及匆忙做功課連起來。','把行為全部推給性格，忽略產品設計。','與原文設計吸引注意的說法相反。','一次成功不等於已改變習慣。'],[6,7,8,10],'原文指出設備留住注意力，家長要處理的不只是一部設備。'),
  transfer('一名學生收到陌生人要求提供住址，卻不確定應否向成年人求助。','哪項教學最忠於範文？',[
    '說明個人資料應保密，陌生人可能帶來風險，有疑慮要即時報告',
    '鼓勵學生先提供住址，再看對方反應',
    '只叫學生閉口不談，不解釋原因',
    '保證所有網上陌生人都值得信任',
  ],['範文的三個 why 正針對私隱、陌生人與求助。','先分享住址會增加私隱風險。','只下命令，未培養判斷力。','原文警告陌生人可能危險。'],[12,13,14],'原文要求學校與家長解釋三項安全原則。'),
  transfer('一位家長主張讓所有十六歲以下孩子永遠不能接觸互聯網。','範文更支持哪個方向？',[
    '建立持續界線、保護和教育，讓孩子隨成長逐步安全使用',
    '只用全面禁令，永不教任何網絡判斷',
    '完全不設界線，讓孩子自行面對所有風險',
    '只談網絡好處，否認任何可能危險',
  ],['原文明確排除全面禁用，提出三層可持續措施。','缺少學習安全使用的機會。','忽略內容與習慣兩類實際風險。','與文章列出的風險相反。'],[9,12,16],'原文結尾寫 not a total ban, but... boundaries, protection and education。'),
  transfer('學校只告訴孩子「網上要小心」，沒有教哪些資料不能分享或遇事向誰報告。','哪項補充最有用？',[
    '用私隱資料、陌生人及令人不安內容三種具體情境教判斷和求助',
    '只把同一句口號重複更多次',
    '只教如何下載遊戲，不談安全',
    '要求所有問題只由孩子獨自處理',
  ],['範文把抽象的安全教育拆成三條可操作的理由。','口號沒有增加辨識或求助能力。','遊戲下載不是範文的安全重點。','原文要求立即報告令人不安的內容。'],[12,13],'原文用三個 why 具體教私隱、陌生人與報告。'),
  transfer('另一篇文章討論兒童在網上遊戲花太多時間；有人只談刪除遊戲程式。','哪項補充能轉用範文的習慣觀點？',[
    '檢查吸引注意的設計和日常作息，建立一致時間界線',
    '刪一次程式便保證孩子不再使用任何螢幕',
    '只責怪孩子，完全不看裝置如何吸引注意',
    '把睡眠與功課影響排除在討論之外',
  ],['範文提醒家長管理的還有習慣，不只某個程式或裝置。','一次刪除不能保證習慣改變。','忽略了產品設計造成的注意力拉扯。','範文明列晚睡與匆忙功課。'],[6,7,8,10],'原文把螢幕時間拉鋸解釋為由設計與習慣共同形成。'),
  transfer('家長與孩子每次談網絡安全都變成爭吵，孩子遇到不安內容也不敢說。','哪項改變最符合範文？',[
    '以清楚規則和解釋建立可求助的對話，讓孩子知道何時報告',
    '把所有安全問題都變成不可說的秘密',
    '只增加責備，不解釋私隱和陌生人風險',
    '認為孩子不報告便代表從未遇到問題',
  ],['範文希望由隱藏角力轉為公開對話。','秘密會阻礙即時求助。','責備不能替代判斷教育。','不報告不等於沒有遇到風險。'],[13,14],'原文說安全教育能把 hidden battle 變成 open conversation。'),
  transfer('結尾已談孩子接觸不當內容，卻忘記螢幕時間習慣與解方。','怎樣修訂最貼近範文？',[
    '同時歸納內容風險與習慣困難，再提出規則、保障和教育配套',
    '只再列更多不當內容名稱，不談家長可做甚麼',
    '突然討論與網絡安全無關的交通擠塞',
    '宣稱家長根本沒有遇到任何難題',
  ],['結尾應回應兩類問題和三層解方。','只列內容，漏答習慣及如何解決。','與題目無關。','推翻全文的問題分析。'],[15,16],'原文結尾同時概括 monitor online risks、control digital habits 和三層回應。'),
];
export default {key:'cause-solution:13',meta:{topic:'兒童缺乏監督上網的內容與習慣風險',summary:'家長難監察有害內容和螢幕習慣；一致家規、適齡工具與判斷教育共同提供保護。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
