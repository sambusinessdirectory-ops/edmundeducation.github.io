// Reviewed Opinion 95: respecting local practices while travelling.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-95-ielts-opinion.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['opinion:95'];const original=source.sentences.map(x=>x.english);
const simple=[
'When people travel abroad, they may meet local customs that seem strange or uncomfortable at first.',
'Some therefore say visitors should follow the local way of life instead of asking local people to change for them.',
'I fully agree, because following local customs shows respect and helps visitors truly understand another culture.',
'First, local customs are often rules people do not write down but use to live together peacefully.',
'They are more than traditions for show; they tell visitors what local people see as polite, humble, sacred or rude.',
'If visitors are loud in a temple, dress against rules at a holy place or enter a home wearing shoes, they may mean no harm but still upset people.',
'But when visitors follow local manners, they show that local people and their beliefs matter rather than treating them as part of the view.',
'This helps avoid needless conflict and lets visitors and locals meet with more respect.',
'Following local customs also makes trips more meaningful.',
'A traveller who always follows their own habits may only look at another culture from the outside: near enough to take pictures, but not close enough to understand it.',
'Small actions, such as learning greetings, eating in the local way or joining daily activities, can help people have real conversations.',
'Local people may then be more willing to explain traditions and tell stories, and treat visitors as guests who care rather than as people just buying things.',
'So following local customs does not take away freedom; it makes the trip richer by letting visitors join in rather than only watch.',
'To sum up, I fully agree that travellers should follow local customs when they visit another culture.',
'Doing so helps people get along and changes a trip from simple sightseeing into respectful cultural sharing.',
];
const vocabulary=[
[['International travel','travel abroad','國際旅行'],['unfamiliar, uncomfortable, or even puzzling','strange or uncomfortable','陌生或令人不自在']],
[['adjust to the local way of life','follow the local way of life','適應當地生活'],['expect the host culture to accommodate them','asking local people to change for them','期望當地文化遷就自己']],
[['I completely agree','I fully agree','完全同意'],['adaptation','following local customs','適應習俗'],['genuine cultural understanding','truly understand another culture','真正理解文化']],
[['local customs','local customs','當地習俗'],['unwritten rules','rules people do not write down','不成文規則'],['peaceful social life','live together peacefully','和睦相處']],
[['not merely decorative traditions','more than traditions for show','不只是點綴性傳統'],['what a community regards as','what local people see as','社群認為'],['offensive','rude','冒犯']],
[['a tourist','visitors','遊客'],['ignores dress expectations','dress against rules','忽視衣著要求'],['innocent in intention but insulting in effect','mean no harm but still upset people','無心但冒犯']],
[['observe local etiquette','follow local manners','遵守禮儀'],['residents are not just part of the scenery','local people and their beliefs matter rather than treating them as part of the view','居民不是風景'],['deserve recognition','matter','值得尊重']],
[['reduces unnecessary tension','helps avoid needless conflict','減少不必要緊張'],['both sides','visitors and locals','雙方'],['more respectful ground','more respect','更尊重的基礎']],
[['Adapting to local practices','Following local customs','適應習俗'],['more meaningful','more meaningful','更有意義']],
[['carries their own habits everywhere','always follows their own habits','到處堅持自己的習慣'],['only through a glass wall','from the outside','隔著玻璃牆'],['close enough to photograph','near enough to take pictures','足以拍照']],
[['Simple acts','Small actions','簡單行為'],['following dining customs','eating in the local way','遵守用餐習俗'],['joining community routines','joining daily activities','參與社區活動'],['real conversation','real conversations','真正交談']],
[['Residents','Local people','居民'],['more likely to explain traditions','more willing to explain traditions','更願意解釋傳統'],['sincere guests','guests who care','真誠客人'],['passing consumers','people just buying things','匆匆消費者']],
[['does not narrow a traveller’s freedom','does not take away freedom','不限制自由'],['expands the experience','makes the trip richer','擴展體驗'],['turning observation into participation','letting visitors join in rather than only watch','從旁觀變參與']],
[['In conclusion','To sum up','總結'],['adapt to local practices and customs','follow local customs','適應習俗'],['travelling in a different culture','visit another culture','前往不同文化旅行']],
[['protects social harmony','helps people get along','維護和諧'],['shallow sightseeing','simple sightseeing','表面觀光'],['respectful cultural exchange','respectful cultural sharing','互相尊重的文化交流']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[' brings people into contact with ', ' that may be '],['使人接觸新事物的活動','起初可能陌生的事物','初見時的感受'],'brings...into contact with 先交代接觸；may be 保留不同旅客的感受差異。','引言要說一項活動使人遇到不熟悉的習慣或環境時。','Moving abroad brings people into contact with habits that may be strange at first.','brings...into contact with...may be','交代接觸與反應'),
frame(1,[' therefore argue that ', ' rather than '],['持此意見的人','旅客應採取的做法','不應期望的相反做法'],'rather than 對比訪客調整自己和要求當地改變兩種責任方向。','先交代接觸差異，再公平呈現一方對誰應調整的主張時。','Some therefore argue that visitors should listen rather than demand new rules.','therefore argue...rather than','呈現誰應調整的主張'),
frame(2,['I completely agree with this view, because ', ' is both ', ' and '],['被作者支持的做法','第一項價值','第二項價值'],'both...and 並列兩條不同理由，分別可展開一段。','引言要明確表態，並預告尊重與理解兩類理由時。','I completely agree with this view, because listening is both polite and useful.','agree...because...both...and','表態並列雙理由'),
frame(3,['The first reason is that ', ' often act as '],['需要被理解的社會習慣','維持相處的規則作用'],'act as 說明習俗在社會生活中實際發揮的作用。','第一段要指出表面小規矩背後有維持相處的功能時。','The first reason is that shared manners often act as quiet social rules.','reason...act as','提出習俗的社會作用'),
frame(4,[' are not merely ', '; they show '],['被誤當成裝飾的習俗','它們更深的社會含義','社群重視或忌諱的行為'],'not merely...; they show 由表象轉到其承載的價值標準。','要更正把某慣例只當外觀的看法，並解釋它傳達的價值時。','These customs are not merely decorations; they show what people value.','not merely...; they show','由表象指出價值'),
frame(5,['If ', ', the action may be ', ' but '],['旅客做出不合習俗行為的條件','行為者的善意本意','可能造成的冒犯效果'],'may be...but 對比意圖與效果，避免把無心直接等同無害。','舉例說明行為者沒有惡意，卻仍可能讓他人感到受冒犯時。','If guests ignore a rule, the action may be innocent but hurtful.','If...may be...but','區分本意與效果'),
frame(6,['By contrast, when ', ', they show that ', ' are not just ', ' but '],['旅客改為遵守禮儀的條件','受到尊重的居民','不應被視作的背景','值得重視的人的價值'],'By contrast 回應前面的冒犯例；not just...but 把居民由背景還原為人。','負面例子之後，要展示守禮如何表達對他人價值的承認時。','By contrast, when guests listen, they show that locals are not just scenery but neighbours with values.','By contrast...not just...but','展示守禮的尊重'),
frame(7,['This reduces ', ' and allows '],['因此減少的摩擦','雙方較尊重地相處的結果'],'This 回指守禮；and 並列減少摩擦與促成交流。','前文已寫出具體守禮行為，接着要說其兩項社交後果時。','This reduces friction and allows both groups to talk calmly.','This reduces...and allows','推出兩項社交後果'),
frame(8,[' also makes ', ' more meaningful.'],['適應當地的做法','因此獲提升的活動'],'also 由尊重居民過渡到旅客自身更豐富的體驗。','第二段要由對他人的社交效果，轉到參與者自己的體驗時。','Joining local meals also makes a trip more meaningful.','also makes...more meaningful','切換到體驗收益'),
frame(9,[' may see ', ': close enough to ', ', but not close enough to '],['只堅持自身習慣的人','被隔開觀看的文化','表面可做到的拍照','不足以做到的理解'],'close enough...but not close enough 對比表面接近與真正理解。','要形象地說明看得見或拍得到，仍未等於理解時。','A visitor may see a village: close enough to photograph, but not close enough to understand.','close enough...but not close enough','對照拍照與理解'),
frame(10,[', such as ', ', can '],['簡單可做的行為','幾項具體例子','由此帶來的對話機會'],'such as 讓抽象的適應變成可做的小行動；can 說明可能機會。','提出做法後要列出具體小事，並接上它們可開啟的交流時。','Small acts, such as learning greetings, can start real conversations.','such as...can','由小行動開啟交流'),
frame(11,[' are more likely to ', ' rather than '],['可能回應的居民','他們願意給予旅客的交流','被避免的純消費者關係'],'more likely 保留機率；rather than 對比真誠客人與過客。','要解釋尊重的行為可能如何改變當地人對訪客的回應時。','Residents are more likely to share stories rather than treat visitors as buyers.','more likely...rather than','指出居民可能回應'),
frame(12,['In this sense, ', ' does not ', '; it ', ' by '],['適應的行為','常見的自由受限疑慮','實際擴展的體驗','從旁觀走向參與的機制'],'does not...; it 更正疑慮；by 解釋體驗增加的方法。','段末要回應一個自由受限的反對意見，並指出更深的收益時。','In this sense, joining local life does not limit freedom; it enriches travel by creating contact.','does not...; it...by','回應疑慮並說明機制'),
frame(13,['In conclusion, ', ' should ', ' when '],['作者重申的立場','被建議的適應做法','適用的跨文化情況'],'when 限定建議適用於身處不同文化的情境。','結尾要直接回答旅客是否應遵守當地做法，以及何時適用時。','In conclusion, visitors should follow customs when travelling abroad.','In conclusion...should...when','重申有情境的立場'),
frame(14,[' protects ', ' and transforms ', ' from ', ' into '],['這種適應','受維護的社會關係','被改善的活動','表面的原始狀態','更有深度的交流狀態'],'from...into 展示旅行體驗的轉變；and 連結社會與個人收益。','結尾要把避免摩擦及得到深入體驗兩條理由合在一起時。','Respect protects harmony and transforms a trip from sightseeing into exchange.','protects...transforms...from...into','總結雙收益與轉變'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者對旅客適應當地習俗持甚麼立場？',['完全同意，因為這既表達尊重也有助真正理解文化','完全反對，認為當地文化必須遷就所有旅客','只討論遊客消費額而不判斷文化接觸','認為旅客照做後就保證所有居民立即歡迎'],'引言用 both...and 預告尊重與理解兩條理由。'),quiz('兩個主體段各自回答甚麼問題？',['為何守禮能避免冒犯；為何參與習俗令旅行更有意義','只比較兩個宗教場所的門票和開放時間','兩段都只重複旅客進入家中時要脫鞋','先討論班級規則，再討論航空公司職位'],'第一段分析禮貌與社會關係，第二段分析文化參與。')];
const route=[sequence('由守禮減少摩擦到參與加深理解',[
['引言：完全同意','適應當地做法是尊重，也有助真正理解。'],['理由一：習俗是不成文規則','它們說明社群認為甚麼禮貌或冒犯。'],['負反例與正做法','無心違反也可能冒犯；遵守禮儀承認居民價值。'],['理由二：參與比旁觀深入','只照自己的習慣可能只是拍照，仍未理解文化。'],['具體小行動與居民回應','問候、用餐方式、社區活動可開啟真誠交談。'],['結尾：從觀光到交流','適應維護和諧，也把旁觀變成參與。']],
'先分析習俗對居民的意義，再分析旅客從參與獲得的理解。')];
const evidence=[
quiz('作者如何看待當地習俗？',['它們常是不成文的相處規則，表達社群價值','它們只為照片增添裝飾而沒有社會含義','它們對居民是否感到冒犯毫無關係','它們只適用於觀光廣告而非日常生活'],'原文用 unwritten rules 與 not merely decorative traditions。'),
quiz('寺廟高聲說話或穿鞋入屋的例子區分甚麼？',['旅客本意可能無心，但實際效果仍會冒犯別人','只要無心，就不可能令任何人不自在','只要別人不快，便能證明旅客一定有惡意','只有旅客明知故犯，習俗才有社會作用'],'原文對照 innocent in intention 與 insulting in effect。'),
quiz('遵守禮儀向居民傳達甚麼？',['居民是有自己價值觀的人，並非觀光風景的背景','居民應只負責讓旅客拍照而不用被尊重','任何禮儀都只為讓遊客節省旅費','居民必須完全放棄自己的生活習慣'],'not just part of the scenery but people whose values deserve recognition。'),
quiz('「玻璃牆」比喻想表達甚麼？',['看得見甚至能拍照，仍可能未真正理解當地文化','玻璃建築是旅客不能進入的唯一原因','只要拍了照片便已經參與所有社區活動','每位旅客都必定在旅行時遇到一面玻璃牆'],'close enough to photograph, but not close enough to understand。'),
quiz('哪些簡單行為可能打開真正交談的大門？',['學問候語、尊重用餐習俗、參與社區日常','只帶自己的習慣來，不與任何居民交談','只拍居民的照片，避免知道他們的故事','只在旅館查門票價格，不接觸地方生活'],'原文列三種可做的小行動。'),
quiz('作者如何回應「適應會減少自由」？',['適應可把旁觀變參與，反而擴展旅行體驗','適應會限制一切行動，所以旅客不應參與','自由只等於任意要求居民改變自己的習慣','旅客只有不學當地問候語才能享受旅行'],'does not narrow...; it expands 直接回應。')];
const logic=[sequence('無心行為為何仍可能造成冒犯',[
['習俗是社會規則','它們標示甚麼禮貌、神聖或冒犯。'],['旅客未必知道規則','高聲說話、衣著或入屋穿鞋可能是無心。'],['本意與效果可能不同','無心並不保證居民不受冒犯。'],['觀察禮儀可減少摩擦','承認居民價值，雙方較能尊重彼此。']],
'第一條論證重點是社交效果，不能只看旅客是否有惡意。'),sequence('由旁觀怎樣走向文化參與',[
['只保留自己習慣','可以拍照卻未必理解。'],['從小行動開始適應','學問候、遵守餐桌習慣、參與日常。'],['當地人較可能打開交流','居民可能分享傳統與故事。'],['旅行體驗變得更深','旅客由旁觀者變成參與者。']],
'第二條論證重點是理解如何透過互動加深。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('遊客不知寺廟需保持安靜，高聲交談令居民不快。','哪項分析最貼近範文？',['本意或許無心，效果卻仍可能冒犯居民','只要旅客無心，就不可能有人感到冒犯','居民不快已證明旅客必然故意破壞規矩','寺廟安靜要求只為方便遊客拍照而設'],['原文區分意圖與影響。','忽略實際影響。','不能從影響推斷意圖。','忽略文化價值。'],[5],'原文以意圖無害、效果冒犯作對照。'),
t('一名學生到外地寄宿，學習進門前先脫鞋。','如何轉用範文第一段？',['守禮表示重視主人習慣，有助減少誤會','守禮只是表演，與主人是否受尊重無關','學生只要脫鞋，便保證永遠沒有誤會','主人應先放棄家規，才算尊重這名學生'],['日常禮儀承載居民價值。','忽略習俗功能。','過度保證。','責任方向相反。'],[3,4,6,7],'原文以入屋穿鞋說明無心冒犯。'),
t('旅客一直照自己的作息，只隔窗拍下街上的節慶。','哪項判斷最符合「玻璃牆」比喻？',['能拍照卻未必理解，仍需嘗試接觸當地人','拍下節慶便已完整理解所有參與者的想法','窗戶玻璃是否透明決定能否理解文化','旅客只要按自己習慣，便必然得到深入交流'],['原文區分看見與理解。','過度推論。','把比喻當字面。','與隔絕情境相反。'],[9,10],'原文說近得可拍照，卻仍未必懂。'),
t('一間學校接待外地交換生，希望讓他們更了解當地生活。','哪項安排最接近第二段？',['教問候語並安排共餐，讓學生與居民交談','只給學生景點照片，不安排任何交流機會','要求學生只使用自己原有的全部生活習慣','讓學生每天記門票價格，避免參與日常活動'],['小行動可開啟真正交談。','只看未參與。','減少接觸。','偏離理解機制。'],[10,11,12],'原文列問候、用餐及社區活動。'),
t('旅客擔心適應當地習俗會失去旅行自由。','範文如何回應？',['適應可能增加參與機會，令體驗更加豐富','任何適應都必然取消旅客的所有自由','只要不適應，便能保證居民分享故事','旅行自由只能理解為請居民改變自己'],['does not narrow...; it expands 對比兩種看法。','絕對化疑慮。','與互動機制相反。','混淆誰應調整。'],[12],'原文說旁觀變參與可擴展體驗。'),
t('一家餐館向遊客解釋當地用餐禮儀，旅客主動學習。','居民較可能怎樣回應？',['把旅客看作真誠客人，願意分享更多故事','立即把所有旅客都視為只會匆忙消費','必然要求每位旅客放棄所有自身文化','只談門票價格，完全不可能交流傳統'],['原文說 sincere guests rather than passing consumers。','方向相反。','過度要求。','忽略交流機會。'],[10,11],'原文用 more likely 表示可能的正面回應。'),
t('有人說「只要沒有惡意，便不需了解當地規矩」。','哪個反例最能檢查這句話？',['無心穿鞋入屋，也可能令主人感到受冒犯','旅客熟悉規矩後，便必然永遠不會犯錯','居民若有規矩，就必定不願意接待旅客','任何習俗都只為裝飾，沒有相處上的作用'],['原文說本意與效果可以不同。','不能保證永不犯錯。','沒有這種推論。','否定原文前提。'],[4,5],'原文用入屋穿鞋示範無心冒犯。'),
t('作文要分析禮儀為甚麼重要，只寫「因為要有禮貌」。','哪項補充更有力？',['解釋習俗如何標示價值，並影響居民感受','只再重複「禮貌很重要」，不交代原因','只比較旅客的行李重量和住宿費用','把所有當地居民描述為相同想法的人'],['原文把規矩和社群價值連起來。','仍欠說明。','與禮儀無關。','過度概括。'],[3,4,5],'原文說習俗不只是表面傳統。'),
t('旅客練習問候語後，居民開始向他講節慶故事。','範文會如何解釋這一連接？',['小小適應可打開交談，讓旅客由旁觀變參與','練習問候語已保證旅客懂得全部當地歷史','居民分享故事只可能因為旅客買了昂貴門票','旅客聽故事仍必須完全拒絕參與任何活動'],['小行動可開啟對話與更深體驗。','過度推論。','與情境不符。','否定參與。'],[10,11,12],'原文連接小行動、真誠交流與參與。'),
t('結尾要同時回收尊重居民和加深旅行體驗兩條理由。','哪句最符合範文？',['適應習俗可減少摩擦，並使觀光變成文化交流','適應習俗只為拍照，不涉及居民價值感受','旅行愈表面，旅客就必然愈深入理解文化','只有要求居民改變規矩，旅行才能成為交流'],['原文結尾同時寫社會和諧及由觀光到交流。','缺少兩條理由。','邏輯相反。','與立場相反。'],[14],'原文以 protects...and transforms...收束。'),
];
export default {key:'opinion:95',meta:{topic:'旅客適應當地習俗與文化理解',summary:'範文以習俗作為社會規則、守禮可避免無心冒犯，以及參與習俗可深化文化理解，支持旅客主動適應。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
