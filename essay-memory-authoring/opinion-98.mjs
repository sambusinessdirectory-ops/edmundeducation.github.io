// Reviewed Opinion 98: flight taxes, unequal impact, and cleaner transport.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-98-ielts-opinion.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['opinion:98'];const original=source.sentences.map(x=>x.english);
const simple=[
'Flying has become a clear example of modern convenience, but its harm to the environment is harder and harder to ignore.',
'Some people say governments should put higher taxes on flights to reduce how many people fly.',
'I do not think this would solve the problem, because it would hurt some travellers much more than others but do little to change how flying works.',
'First, a higher tax on flights would be a rough and unfair way to act.',
'Many people do not fly for fun; they fly for jobs, study, medical care or family needs.',
'If tickets cost more, these people might simply pay more instead of staying home, especially when they have no practical other way to travel.',
'Meanwhile, richer tourists would hardly notice the higher cost, so regular travellers would suffer more than wealthy people who fly often.',
'A policy that mostly decides who can pay to fly, instead of changing how planes are run, is not a real way to protect the environment.',
'The bigger problem is that planes still use a lot of dirty fuel, and taxes by themselves do not fix this.',
'Airlines might charge customers more without buying cleaner planes, while governments might use the extra money for other things.',
'A better plan would be to spend money directly on cleaner planes, fuels that pollute less and fast trains for shorter trips.',
'For example, if people could afford to take a train between big cities, many would choose it without feeling pushed away from flying.',
'This could lower pollution in a way that works and lasts.',
'To sum up, putting more tax on flights would not end the environmental damage from flying.',
'Instead of making price a barrier, governments should improve clean transport and provide other realistic ways to avoid some flights.',
];
const vocabulary=[
[['Air travel','Flying','航空旅行'],['most visible symbols of modern convenience','a clear example of modern convenience','現代便利的象徵'],['environmental cost','harm to the environment','環境代價']],
[['Some argue','Some people say','有人主張'],['raise taxes on flights','put higher taxes on flights','提高航班稅'],['the number of passengers','how many people fly','乘客數量']],
[['I disagree','I do not think','不同意'],['travellers unevenly','some travellers much more than others','不均等影響旅客'],['the aviation system itself','how flying works','航空系統本身']],
[['To begin with','First','首先'],['a higher flight tax','a higher tax on flights','更高航班稅'],['a blunt and unfair tool','a rough and unfair way to act','粗糙不公措施']],
[['do not fly for pleasure','do not fly for fun','並非為享樂飛行'],['education','study','教育'],['medical treatment','medical care','求醫'],['family responsibilities','family needs','家庭責任']],
[['tickets became more expensive','tickets cost more','機票更貴'],['simply pay more','simply pay more','只好多付錢'],['no realistic alternative','no practical other way to travel','沒有可行替代']],
[['At the same time','Meanwhile','與此同時'],['wealthier tourists','richer tourists','較富裕旅客'],['barely feel the increase','hardly notice the higher cost','幾乎不受加價影響'],['frequent luxury passengers','wealthy people who fly often','經常乘機高消費旅客']],
[['mainly changes who can afford to fly','mostly decides who can pay to fly','主要改變誰能負擔'],['how aviation operates','how planes are run','航空如何運作'],['a genuine environmental solution','a real way to protect the environment','真正環保對策']],
[['The deeper problem','The bigger problem','更深層問題'],['rely heavily on polluting fuel','use a lot of dirty fuel','大量依賴污染燃料'],['taxation alone','taxes by themselves','單靠徵稅']],
[['pass the cost to customers','charge customers more','轉嫁成本'],['improving their fleets','buying cleaner planes','改善機隊'],['extra revenue','extra money','額外收入'],['unrelated areas','other things','不相關用途']],
[['A more effective approach','A better plan','更有效方法'],['invest directly','spend money directly','直接投資'],['cleaner aircraft technology','cleaner planes','較潔淨飛機'],['high-speed rail routes for shorter journeys','fast trains for shorter trips','短途高速鐵路']],
[['affordable train','afford to take a train','負擔得起火車'],['major cities','big cities','主要城市'],['forced off planes','pushed away from flying','被迫不搭飛機']],
[['reduce emissions','lower pollution','減少排放'],['practical and lasting way','a way that works and lasts','實際持久方式']],
[['In conclusion','To sum up','總結'],['increasing tax on flights','putting more tax on flights','提高航班稅'],['environmental damage caused by aviation','environmental damage from flying','航空環境破壞']],
[['price as a gatekeeper','price a barrier','以價格作門檻'],['cleaner transport systems','clean transport','較潔淨交通系統'],['realistic alternatives','other realistic ways','可行替代方式'],['reduce the need to fly','avoid some flights','減少飛行需求']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[' has become ', ', but '],['已變普遍的活動','它代表的便利','同時出現的環境代價'],'has become 指已形成的趨勢；but 同時提出其代價。','引言要承認一種活動方便而普遍，亦引出其負面外部影響時。','Fast delivery has become convenient, but its packaging waste is rising.','has become...but','便利與代價並列'),
frame(1,['Some argue that ', ' should ', ' in order to '],['被要求行動的政府','主張採用的政策','希望達到的人數變化'],'in order to 明示稅收方案聲稱要達到的目的。','交代一項被提議的公共政策及其支持者聲稱的目的時。','Some argue that councils should raise parking fees in order to cut car use.','argue...should...in order to','呈現政策及目的'),
frame(2,['I disagree that ', ', because ', ' while '],['被否定的政策效果','旅客受影響不均','系統本身改變太少'],'because 和 while 並列公平與根源成效兩項缺點。','引言要反對某政策能解決問題，並預告兩種不同不足時。','I disagree that this fixes waste, because it hurts families while leaving producers unchanged.','disagree...because...while','表態並預告雙缺點'),
frame(3,['To begin with, ', ' would be '],['首先評估的加稅措施','粗糙不公的判斷'],'To begin with 開始第一條反對論證；would be 表示對政策可能後果的評估。','第一段要先提出一項政策在分配上有問題時。','To begin with, a flat fee would be unfair to poorer users.','To begin with...would be','提出政策公平問題'),
frame(4,[' do not ', '; they '],['被忽略的旅客','不是唯一的享樂動機','實際的工作學習求醫責任'],'分號對比被假設的享樂與必需出行。','要糾正把所有使用者都當成可輕易取消需求的想法時。','Patients do not travel for fun; they travel to receive care.','do not...; they','區分享樂與需要'),
frame(5,['If ', ', these ', ' rather than ', ' especially when '],['票價提高的條件','必需旅客被迫多付的反應','未必停止出行的對照','缺少可行替代的情況'],'rather than 表示加價可能只是轉嫁負擔；especially when 限定沒有替代方案。','一項費用上升時，需要說明為何某些人仍不得不付費時。','If fares rise, these passengers may pay more rather than stop travelling, especially when no trains exist.','If...rather than...especially when','說明必要需求不消失'),
frame(6,['At the same time, ', ', so ', ' more than '],['富裕者受影響較小','政策對普通人的負擔','被對照的高消費者'],'At the same time 接另一群人；more than 呈現負擔不均。','已有必需旅客例子，還要比較高收入使用者是否同樣受影響時。','At the same time, wealthy users may continue, so a fee hurts workers more than rich clients.','At the same time...more than','比較不同群體負擔'),
frame(7,[' that mainly ', ', rather than ', ', cannot be considered '],['被評估的措施','主要改變的支付能力','未處理的運作方式','不能稱為的真正解方'],'rather than 對比誰付得起與系統怎樣運作；cannot 收束判斷。','一項措施主要改變服務門檻，卻未處理造成問題的制度時。','A fee that mainly excludes families, rather than improves engines, cannot be considered a real fix.','rather than...cannot be considered','區分門檻與解方'),
frame(8,['The deeper problem is that ', ', and '],['仍在的源頭污染','單靠稅項無法自動修正的部分'],'The deeper problem is that 由票價轉到技術源頭；and 加上稅收本身的限制。','第一段談公平後，第二段要指出更深層的制度或技術根源時。','The deeper problem is that old buses pollute, and fares alone will not fix engines.','deeper problem...and','指出根源與稅項限制'),
frame(9,[' may ', ' without ', ', while ', ' may '],['可能轉嫁成本的航空公司','增加給顧客的費用','未做的機隊改善','收到收入的政府','收入未必用於減污的結果'],'兩個 may 表示政策結果不受保證；without 和 while 指出兩個失效途徑。','要說某項收入或成本變化未必自動帶來提供者及政府的實際改革時。','Firms may raise prices without cleaner tools, while councils may spend revenue elsewhere.','may...without...while...may','列出自動改善的漏洞'),
frame(10,['A more effective approach would be to '],['直接投資的具體政策組合'],'would be to 提出可執行的替代，而非空泛說應改善。','批評政策後，要給出可由政府或行業直接採取的措施時。','A more effective approach would be to fund cleaner engines and useful trains.','more effective...would be to','提出可執行替代'),
frame(11,['For example, if ', ', many would ', ' without '],['價格可負擔的鐵路條件','可能自願改選的行為','不被迫放棄飛行的感受'],'if 設定可行選擇；without 區分自願替代和以價格逼走。','要用具體例子說明替代方案如何讓人自願減少某行為時。','For example, if trains are affordable, many would take them without feeling excluded.','For example...if...without','展示自願替代'),
frame(12,['This would ', ' in a '],['替代方案的排放結果','實際而持久的效果方式'],'This 回指鐵路例子；in a 指效果不只短暫。','一個可行例子之後，要用短句總結其減排效果和持久性時。','This would cut waste in a practical and lasting way.','This would...in a','概括可持續效果'),
frame(13,['In conclusion, ', ' would not '],['加稅方案','它未能達到的環境目標'],'In conclusion 直接回答題目問加稅能否解決問題。','結尾要評估一項政策是否真能解決題目中的問題時。','In conclusion, a ticket tax would not solve aviation pollution.','In conclusion...would not','直接回答解決程度'),
frame(14,['Instead of ', ', governments should ', ' that '],['以價格作門檻的做法','應聚焦的較清潔交通方案','替代方案減少需求的作用'],'Instead of 換掉價格門檻；that 說明替代交通如何降低需求。','結尾要把受批評的價格措施替換成源頭與可行替代時。','Instead of raising a gate fee, governments should fund trains that replace short flights.','Instead of...governments should...that','以建設性方案收束'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者認為提高航班稅能解決航空業的環境問題嗎？',['不能；它影響旅客不均，亦未直接改變航空系統','能；加稅本身會自動讓每班飛機改用清潔燃料','文章只討論航空公司的機上餐飲售價','作者相信每位旅客都是為了娛樂才飛行'],'引言預告公平和制度源頭兩個不足。'),quiz('兩個主體段分別論證甚麼？',['加稅對必需旅客不公；更需清潔技術與可行替代','第一段談旅行保險，第二段談航空制服','兩段都只重複政府應徵收多少稅款','只比較飛機與火車的座椅設計'],'第一段論不均負擔，第二段論系統改善與鐵路。')];
const route=[sequence('從稅負不均到可行替代',[
['引言：不同意加稅可解決','稅項影響不均，且未直接改變航空系統。'],['理由一：必需旅客仍要飛','工作、讀書、求醫、家庭責任不能一律取消。'],['兩類旅客負擔對比','普通人多付，富裕高消費者可能照飛。'],['理由二：稅收未必改變機隊','航空公司可轉嫁成本，政府也可把收入用於別處。'],['直接投資與鐵路替代','清潔飛機、燃料和可負擔高速鐵路可減少不必要飛行。'],['結尾：取代價格門檻','政府應聚焦較清潔交通與切實可行的替代。']],
'先指出加稅未必改變行為且分配不公，再提出直接改革。')];
const evidence=[quiz('文章列出哪些並非享樂的飛行理由？',['工作、教育、求醫與家庭責任','只為在機上觀看電影','只為收集航空公司積分','只為購買機場免稅商品'],'原文不把所有乘客都視為可隨意取消旅行的遊客。'),quiz('沒有可行替代時，加稅可能對必需旅客造成甚麼？',['仍須出行，只能多付錢而不一定停飛','必然使每名旅客立即改搭高速鐵路','保證乘客所有工作和家庭責任消失','使每班飛機的燃料立即變清潔'],'rather than stop flying 指需求可能繼續。'),quiz('富裕旅客在文中的作用是甚麼？',['對比普通旅客所承受的不均負擔','證明所有人支付稅款時負擔相同','說明只有富人才可能需要求醫','證明每位乘客都必然有可行鐵路替代'],'wealthier tourists barely feel the increase。'),quiz('作者為何說加稅不會自動改善航空系統？',['公司可轉嫁成本，政府也可把稅收用在別處','航空公司必然已同意改良每架飛機','提高稅項會令所有短途鐵路立即完工','乘客少一人就代表舊飛機已換成新飛機'],'原文列出兩個未必把錢用於減污的途徑。'),quiz('高速鐵路例子需要符合甚麼條件？',['城市之間火車可負擔，乘客才可能自願改選','火車價格愈高，普通人就愈易改搭','乘客必須被全面禁止乘搭飛機','所有目的地都必須已可用鐵路到達'],'if 和 affordable 使替代方案具體可行。'),quiz('結尾用 Instead of 對比哪兩條政策方向？',['不以價格排除旅客，改用清潔系統與可行替代減少飛行','只把航班稅改名，不改任何航空運作','只提高價格而完全放棄清潔燃料','完全不處理航空污染或乘客需求'],'原文以 price as a gatekeeper 對比 cleaner transport。')];
const logic=[sequence('加稅如何未必減少真正問題',[
['乘客有必要出行','工作、教育、求醫、探親仍需要交通。'],['票價上升但需求仍在','缺可行替代的人只能多付錢。'],['富裕高使用者影響較小','政策負擔不均。'],['航空系統未被迫改變','誰付得起飛行改了，污染源頭卻可能照舊。']],
'第一段區分加價、出行需要與源頭排放。'),sequence('直接改革為何更可行',[
['稅收不保證用於減污','公司可轉嫁成本，政府可改作別用。'],['直接投資技術與燃料','讓航班本身逐步較清潔。'],['建立可負擔鐵路','短途旅客有自願替代選擇。'],['減少不必要航班','排放有機會實際而長久下降。']],
'第二段把政府投入與有條件的自願替代連起來。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('學生需要乘機到外地求學，票價加稅後仍沒有鐵路可選。','哪項結果最符合範文？',['學生可能只好多付費用，未必能停止出行','學生仍須出行，先比較機票價格與行程時長','加稅後機票變貴，可暫不考慮學業需要','學生無鐵路可選，便先增加航班座位數'],['原文說必要需求在無替代時仍在。','情境核心是必要行程沒有替代。','學業需要不因票價上升消失。','座位數未解決排放與費用。'],[4,5],'原文以教育等必要旅程和無替代條件分析加稅。'),
t('航空公司把新稅款全部轉嫁乘客，機隊沒有任何改善。','文章第二段會如何評估？',['票價變高不等於飛機變清潔，源頭仍未處理','票價提高可減客量，機隊問題可留待後期','航空公司轉嫁成本，也許正積極更新機隊','先統計乘客付費，不查每趟飛行的排放'],['這是原文的 pass cost without improving fleets。','機隊排放仍需從源頭處理。','情境明說機隊未改善。','乘客付費不代表每趟航班更清潔。'],[8,9],'原文指出成本可轉嫁，未必改善機隊。'),
t('政府收了航空稅，卻把收入用於與交通無關的工程。','這揭示哪個政策漏洞？',['加稅收入不保證用於改善航空排放系統','稅收有增加，便可暫不追查具體支出用途','用在別處也可能有益，但未針對航空排放','收入若未投交通，可先只提高稅率'],['原文明說 extra revenue 可用於 unrelated areas。','稅收用途決定是否改善航空排放。','其他益處不等於題目要求的減排。','提高稅率仍未修正用途。'],[9,10],'原文不把收稅當成自動減排。'),
t('城市間開通票價合理的高速鐵路，不少旅客自願改搭。','哪項論證最貼近範文？',['可負擔鐵路讓人自願少飛，而非被加價逼走','鐵路可用，卻不必把票價維持可負擔','旅客改搭鐵路，便不用再查短途航班需求','有替代方式後，可只按火車速度作比較'],['原文例子的關鍵是 affordable train 和自願選擇。','可負擔價格是自願改搭的條件。','仍要看短途需求如何轉移。','速度之外亦有價格。'],[10,11,12],'原文以可負擔鐵路示範自願替代。'),
t('一個地方提高入場費，結果窮人少參觀，富人幾乎無感。','可轉用哪項公平檢查？',['政策只改變誰付得起，未解決原問題','少人入場可降擠迫，服務內容可先不改善','富人仍可進入，便不必評估負擔是否公平','高入場費帶來收入，先不查活動質素'],['原文區分價格門檻和問題解決。','入場減少不必然解決原問題。','富人無感正顯示不均。','收入與服務質素要分開檢查。'],[6,7],'原文說措施主要改變誰能負擔飛行。'),
t('作文說「任何航班稅都必然讓航空公司更新機隊」。','怎樣用範文修正？',['公司可能轉嫁成本，改機隊仍需直接政策','加稅可讓公司增收入，更新機隊可稍後再談','公司或轉嫁成本，但不必提出直接減排政策','稅收入庫後，可先不檢查用途與排放'],['原文警告稅收不自動促成改革。','稅本身不必促使更新。','需有直接政策改變機隊。','用途和排放仍須監察。'],[8,9,10],'原文列出公司與政府兩個未保證的環節。'),
t('政府想減少短途航空排放，又不想只靠提高票價排除普通人。','哪項組合最符合範文？',['投資清潔航空，提供可負擔鐵路替代','先提高票價，清潔技術可留待下一階段','提供鐵路替代，但票價可暫不考慮','先禁止短途航班，不查鐵路能否承接'],['原文雙軌是技術改善和實際替代。','只有加價仍排除普通人。','不可負擔鐵路不是實用替代。','禁飛前須查其他運力。'],[10,11,14],'原文結尾用清潔系統和替代方式取代價格門檻。'),
t('家庭需要出國照顧親人，稅項增加並無改變其需要。','哪項說法最貼近範文？',['必要探親未必停，家庭可能只好多付','家庭仍須出行，可先把稅款視為必要成本','探親可用鐵路，但不查路線是否存在','稅項未改需求，因此只需增加航班數'],['原文列家庭責任及無替代時仍會出行。','必要行程帶來實際財務負擔。','情境說沒有替代路線。','增加航班未解減排問題。'],[4,5],'原文不把所有飛行都當享樂。'),
t('學校收取高額課外活動費，卻未把錢用於改善活動內容。','哪種轉用最準確？',['增加收費若不改善服務，只會提高參與門檻','提高收費可減參與，服務內容稍後再改善','活動費收入增加，可先看帳目而不查內容','窮人參與較少，便可當作活動篩選有成效'],['價格門檻和供應品質可分開。','收費未必改善服務。','帳目不能說明活動內容。','少人參與可反映費用門檻。'],[7,9],'原文區分誰能支付與服務本身有否改善。'),
t('結尾要回答航班稅能在多大程度上解決航空環境問題。','哪句最符合範文？',['單靠加稅不足，還需清潔機隊與替代','加稅有一定作用，替代方案可留待日後','只減旅客數量，不查航空系統排放','投資清潔系統，卻不提供可行替代'],['原文反對稅項單獨解決，提出替代。','替代方案是結論重點。','只減客量未改源頭。','清潔技術與可行替代可並行。'],[13,14],'原文結尾由價格門檻轉到清潔交通及可行替代。'),
];
export default {key:'opinion:98',meta:{topic:'提高航班稅能否解決航空環境問題',summary:'範文指出加稅對必要出行者負擔不均，也未保證改善航空系統；主張直接投資較清潔技術與可負擔鐵路。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
