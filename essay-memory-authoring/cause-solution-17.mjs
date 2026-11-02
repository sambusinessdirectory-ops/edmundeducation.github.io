// Reviewed Cause/Solution 17: rural-to-urban migration and balanced regional policy.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-17-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:17'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'In many countries, more people from farming areas are leaving villages and going to cities to find paid jobs.',
 'This can cause serious problems in both cities and the countryside, but spending more on rural areas and planning city growth better can help.',
 'One major result is that cities may become too crowded before they can support all the new residents.',
 'When many farm workers arrive quickly, homes, transport and public services may be unable to cope.',
 'As a result, many new arrivals may live in poor homes, have uncertain jobs or compete strongly for low-paid work.',
 'For example, a young farmer without accepted qualifications may move to a big city but find fewer real opportunities than expected.',
 'At the same time, this movement can make village communities weaker.',
 'If too many working-age people leave farming, farms may lack workers, villages may have mostly older people, and local food production may fall slowly.',
 'One useful answer is to make it possible to earn a living in rural areas instead of treating cities as the only way forward.',
 'Governments could pay for water systems, food storage, rural roads and internet access so that farmers can sell goods more easily and earn more regularly.',
 'They should also support up-to-date farming lessons, small companies and food-processing work, creating jobs close to home.',
 'In cities, leaders should prepare for new arrivals instead of waiting for problems to happen.',
 'Affordable homes, job training and dependable public transport would help newcomers find official jobs and avoid being left out.',
 'In short, moving from farms to cities can lead to crowded cities, uncertain work and weaker farming communities.',
 'But if governments create more rural jobs while planning city growth carefully, this movement can cause much less harm and be easier to sustain.',
];
const vocabulary=[
 [['growing number','more people','人數增加'],['farming communities','farming areas','農業社群'],['countryside','villages','鄉村'],['paid employment','paid jobs','有薪工作']],
 [['serious pressure','serious problems','嚴重壓力'],['urban centres','cities','城市中心'],['rural areas','countryside','農村地區'],['stronger rural investment','spending more on rural areas','更多農村投資'],['better-managed urban planning','planning city growth better','更妥善的城市規劃']],
 [['major consequence','major result','主要後果'],['overcrowded','too crowded','過度擁擠'],['absorb the new population','support all the new residents','容納新增人口']],
 [['large numbers','many','大量'],['within a short period','quickly','短時間'],['housing','homes','住房'],['stretched beyond their normal capacity','unable to cope','超出負荷']],
 [['newcomers','new arrivals','新來者'],['poor-quality accommodation','poor homes','差的住所'],['unstable jobs','uncertain jobs','不穩定工作'],['competing intensely','compete strongly','激烈競爭']],
 [['recognised qualifications','accepted qualifications','受認可資歷'],['major city','big city','大城市'],['more opportunities in theory than in practice','fewer real opportunities than expected','表面機會多實際未必']],
 [['At the same time','At the same time','與此同時'],['weaken','make village communities weaker','削弱'],['rural communities','village communities','農村社群']],
 [['working-age people','working-age people','勞動年齡人口'],['leave agriculture','leave farming','離開農業'],['lose labour','lack workers','失去勞動力'],['dominated by the elderly','have mostly older people','長者佔多數'],['gradually decline','fall slowly','逐漸下降']],
 [['practical response','useful answer','實際措施'],['economically viable','possible to earn a living','經濟上可行'],['path to progress','way forward','進步道路']],
 [['invest in','pay for','投資'],['irrigation','water systems','灌溉'],['storage facilities','food storage','儲存設施'],['digital access','internet access','數碼連接'],['more efficiently','more easily','更有效率'],['steadier income','earn more regularly','更穩定收入']],
 [['modern agricultural training','up-to-date farming lessons','現代農業培訓'],['small businesses','small companies','小型企業'],['food-processing industries','food-processing work','食品加工產業'],['employment near people’s homes','jobs close to home','家附近工作']],
 [['authorities','leaders','當局'],['plan for migration','prepare for new arrivals','為人口遷移規劃'],['reacting to it','waiting for problems to happen','事後被動回應']],
 [['Affordable housing','Affordable homes','可負擔住房'],['vocational training','job training','職業培訓'],['reliable public transport','dependable public transport','可靠公共交通'],['formal economy','official jobs','正規經濟'],['pushed to the margins','left out','被邊緣化']],
 [['In conclusion','In short','總結'],['rural-to-urban migration','moving from farms to cities','農村往城市移民'],['overcrowded cities','crowded cities','城市擁擠'],['insecure employment','uncertain work','就業不穩'],['decline in agricultural communities','weaker farming communities','農業社群衰落']],
 [['rural opportunities','rural jobs','農村機會'],['managing urban growth carefully','planning city growth carefully','審慎管理城市增長'],['far less damaging','cause much less harm','損害較少'],['more sustainable','easier to sustain','更可持續']],
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
 frame(0,['In many countries, ', ' in search of '],['農業社群人口往城市移動的趨勢','有薪工作的目標'],'In many countries 限定範圍；in search of 說明遷移者想尋找甚麼。','要描述一個跨地區趨勢，並交代行動者的目標時。','In many countries, graduates move to capitals in search of work.','in search of','說明行動的目的'),
 frame(1,[', but it can be addressed through '],['城鄉同時承受的壓力','農村投資與城市規劃的應對途徑'],'but 從問題轉到可行對策；through 引出實行途徑。','要在同一句概括問題，再預告可行處理方法時。','This shortage strains schools, but it can be addressed through better training.','but...through','由問題轉到方法'),
 frame(2,[' is that '],['一項主要後果','城市未及準備便可能過度擁擠'],'is that 清楚指出後果的具體內容及其發生條件。','段首需要直接提出一項可解釋的後果時。','One major consequence is that buses become too crowded.','is that','明確提出後果'),
 frame(3,['When ', ', '],['大量農村勞工短時間入城的情況','房屋交通及服務可能超負荷的結果'],'When 給出短時間湧入的條件；can 表示公共服務可能受壓。','需要把人口或需求突增與資源負荷連起來時。','When visitors arrive together, roads and clinics can become overloaded.','When...can','由需求突然增加推到資源壓力'),
 frame(4,['As a result, '],['新來者可能面對差的住屋不穩工作及低薪競爭'],'As a result 承接服務不足及擁擠，指出具體生活或工作後果。','前句已有原因或機制，下一句要指出其可觀察影響時。','As a result, some families may accept insecure jobs.','As a result','接出具體後果'),
 frame(5,['For example, ', ' may find that '],['缺乏受認可資歷的年輕農民搬去大城市','表面機會與實際機會不同的發現'],'For example 讓抽象就業問題落到一人的經歷；may find that 保留可能性。','需要用個人情境說明表面機會與實際條件有落差時。','For example, a new graduate may find that job openings require experience.','For example...may find that','用個人經歷展示落差'),
 frame(6,['At the same time, '],['人口流動可能削弱農村社區'],'At the same time 補充城市以外同時發生的影響。','已分析一邊的後果，還要轉去另一個同時受影響的對象時。','At the same time, small villages may lose workers.','At the same time','轉向另一個同時受影響的對象'),
 frame(7,['If ', ', '],['太多勞動年齡人口離開農業的條件','農場缺工村莊老化及糧食減產的可能後果'],'If 把農業人口外流設為條件；三個 may 呈現可能的連鎖影響。','要由一個條件列出幾項相關、但不必然的後果時。','If many nurses leave, clinics may lack staff and waiting times may rise.','If...may','以條件展開多項可能後果'),
 frame(8,[' rather than '],['令農村生活在經濟上可行的實際應對','把城市當作唯一進步道路的舊假設'],'rather than 對照真正需要改善的條件與需要避免的狹窄想法。','提出措施時，想把建設性選擇與不足的原有思路對照時。','A useful response is to improve local jobs rather than push everyone away.','rather than','對照建設性措施與狹窄假設'),
 frame(9,[' so that '],['灌溉儲存道路及數碼連接投資','農民銷售更有效及收入更穩的目的'],'so that 把基建投資連到農民實際收入和銷售效果。','提出資源投入後，需說明受益者因此可做甚麼時。','Councils could improve roads so that growers can reach markets faster.','so that','說明措施的實際目的'),
 frame(10,[', which would '],['農業培訓小企及食品加工支援','在家附近創造就業的可能效果'],'which would 回指整組支援措施，說明其共同的就業作用。','列出多項措施後，要歸納它們共同可能帶來的效果時。','Schools could offer training and tools, which would help local workers.','which would','歸納多項措施的可能作用'),
 frame(11,[' instead of '],['當局應預先規劃人口遷移','問題出現後才被動反應'],'instead of 把預先準備與事後補救清晰對照。','要表明應及早準備，而非等問題發生才應對時。','Hospitals should plan for demand instead of reacting only after queues grow.','instead of','對照預先準備與事後反應'),
 frame(12,[' would help ', ' and avoid '],['可負擔住房培訓及可靠交通','新來者進入正規就業','新來者被邊緣化'],'would help 指出積極的融入效果；and avoid 補上可減少的負面後果。','要說明同一組措施如何同時帶來正面效果並減少風險時。','Training and transport would help workers find jobs and avoid isolation.','would help...and avoid','並列促進融入與避免排斥'),
 frame(13,['In conclusion, '],['城巿擠迫就業不穩及農村衰落三項後果'],'In conclusion 提醒讀者下句概括前文，並集中回答後果問題。','結尾需壓縮前文幾項主要後果時。','In conclusion, rapid change can bring pressure to both homes and schools.','In conclusion','歸納已分析的主要後果'),
 frame(14,['However, if ', ' while ', ', ', ' can '],['第一項改善條件','同步進行的第二項行動','可能因此改善的現象','審慎推論的結果'],'if 設定政策條件；while 強調兩地措施並行；can 保留結果可能性。','結尾要提出兩項並行條件，並審慎推論其可能效果時。','However, if towns create jobs while cities plan housing, migration can be less harmful.','if...while...can','並行條件推到可能改善'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+10)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的城鄉後果及措施次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('人口由農村遷往城市，文章指出哪兩邊會受壓？',['城市住屋交通與就業，以及農村農業與社群','只有城市學校的校服顏色','只有農村天氣，不涉及人口','城市和農村都完全沒有任何變化'],'文章分別分析城市超負荷及農村勞動力流失。'),
 quiz('文章用哪兩類政策配對這些問題？',['投資農村工作與基建，同時預先規劃城市住屋培訓和交通','只在問題發生後臨時處理','完全禁止所有農村居民搬遷','只改城市名字，不改善服務'],'解法同時提高留在農村的可行性，以及城市接納新居民的能力。'),
];
const route=[sequence('從城鄉雙重壓力走到雙地區應對',[
 ['引言：農村人口移往城市','尋找有薪工作，可能同時令城市和農村受壓。'],
 ['後果一：城市未及承接','短期大量到來使住屋交通服務超負荷，就業亦未必如想像容易。'],
 ['後果二：農村人才流失','農場可能缺工，村莊老化，糧食生產逐漸減少。'],
 ['解法：兩邊同時改善','農村投資與近家就業，加上城市住屋培訓交通的預先規劃。'],
],'問題涉及城市和農村，因此解方也要兼顧來源地與目的地。')];
const evidence=[
 quiz('為何城市可能在短期內過度擁擠？',['大量農村勞工迅速到來，住屋交通及公共服務未必有足夠容量','城市一有移民，所有服務就自動倍增','只有城市標誌會受影響','所有新來者都有受認可資歷及穩定住所'],'原文把短時間人口增加連到服務容量不足。'),
 quiz('年輕農民的例子說明甚麼？',['大城市看似機會多，但欠受認可資歷者實際上可能難以受惠','所有年輕農民到城市都必然失業','城市所有職位都不需要資歷','農村人口從來不尋找有薪工作'],'範文用一人經歷說明理論與實際機會的落差。'),
 quiz('勞動年齡人口離開農村可能帶來哪些後果？',['農場缺工、村莊長者比例上升、本地糧食生產下降','農場必然即刻增加勞動力','每個村莊人口一定變得更年輕','糧食產量與農業勞動力完全無關'],'原文用三個 may 展開可能的農村連鎖影響。'),
 quiz('農村灌溉、儲存及道路投資的直接目的為何？',['幫農民更有效出售產品及取得較穩定收入','只為令城市交通更堵塞','只增加農產品在倉庫腐壞的時間','讓所有村民完全不用工作'],'範文用 so that 將基建連到銷售與收入。'),
 quiz('農業培訓、小企及食品加工如何補足農村基建？',['可在居民家附近創造工作，使留在農村更可行','只能創造城市中心的工作','會保證所有農場立即關閉','與收入和就業沒有任何關係'],'原文用 which would 指出多項支援可帶來近家就業。'),
 quiz('城市應如何在新居民抵達前準備？',['規劃可負擔住房、職業培訓及可靠公共交通','等服務崩潰後只發出宣傳海報','只擴建市政府辦公室','不讓新來者進入正規工作'],'範文強調 plan for migration instead of simply reacting。'),
];
const logic=[
 sequence('城市壓力如何形成',[
  ['農村居民尋找有薪工作','較多人在短期內遷往城市。'],
  ['住屋交通與公共服務未及擴充','容量可能不足，生活成本與環境變差。'],
  ['新來者資歷未必被承認','理論上的城市機會未必化為實際工作。'],
  ['城市提前投資住屋培訓交通','較有可能協助新居民進入正規經濟。'],
 ],'不要把「可能」的就業困難說成每名遷移者必然失業。'),
 sequence('農村流失到兩地政策',[
  ['勞動年齡人口離開農業','農場缺工、村莊老化及本地生產受影響。'],
  ['灌溉儲存道路及數碼接入改善','農產品較容易出售，收入較穩。'],
  ['培訓小企及食品加工發展','居民在家附近有更多有薪工作。'],
  ['城市同步規劃增長','人口流動可減少對兩邊的傷害。'],
 ],'農村投資不是禁止遷移；目的是改善選擇，並與城市規劃配套。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('某大城市一年內接收大量農村求職者，租屋和巴士供應暫時跟不上。','哪項分析最忠於範文？',['人口驟增可能使住屋交通與服務超負荷','每名新來者都必然有高薪工作和合適住處','只要有移民，城市房屋數就會自動增加','交通壓力與人口增長和服務需求全無關係'],['原文由短期湧入推到城市容量不足。','原文強調機會未必化為實際工作。','供應不會自動即時增加。','忽略交通需求增加。'],[2,3,4],'原文指出大量人口短時間抵達可令住屋及交通受壓。'),
 transfer('一名農民相信大城市到處有工作，卻發現自己的資歷不獲認可。','哪項推論較合理？',['城市機會看似多，能否就業仍看個人條件','所有城市職位都必然不要求任何資歷','農村居民完全不會因工作而搬往城市','城市有工作，個人就必定能立即受聘'],['原文的年輕農民例子正顯示理論與實際落差。','與已知資歷障礙相反。','與情境事實相反。','把可能性說成必然。'],[4,5],'原文以不獲認可的資歷說明實際就業不一定如預期。'),
 transfer('村莊的年輕農業工人持續外流，農場開始缺人，老人比例上升。','哪一項風險還應一併檢查？',['本地糧食生產可能逐漸下降','村莊一定即時出現更多農業勞工','所有農作物立刻自動增加產量','農場缺工和本地生產完全無關'],['範文把缺工、老化與產量下降連成可能的後果。','與勞工外流相反。','忽略生產所需勞動力。','與原文的條件鏈相反。'],[6,7],'原文說工作年齡人口離開農業可能令本地糧食生產下降。'),
 transfer('政府新建農村儲存設施和道路，但報告只寫「設施很新」。','應補充哪個作用？',['農民更易把產品送市場並有較穩定收入','設施一新便保證所有城市都會停止增長','只需描述建築外牆顏色，不看農民收入','新道路必然使所有農產品立即高價賣出'],['原文用 so that 說明基建要改善銷售與收入。','誇大政策效果。','沒有交代措施的經濟作用。','把改善可能性說成保證。'],[8,9],'原文把灌溉儲存及道路投資連到銷售效率與收入。'),
 transfer('一個農村地區資金足夠建路，卻幾乎沒有本地工作或新技能訓練。','哪項補充最符合範文？',['支援農業培訓與小企加工，創造近家工作','只建更大城市停車場，不投資任何農村工作','禁止村民學習新技能，也不改善農業收入','假設道路本身已保證每個村民都有工作'],['文章在基建之外另提出近家就業。','城市停車場不補農村工作。','與培訓措施相反。','把單項投資誇大成就業保證。'],[9,10],'原文提出培訓、小企與食品加工產業。'),
 transfer('市政府只在租屋短缺爆發後才尋找臨時應急方案。','哪項規劃原則可從範文轉用？',['預先估計遷入人數，準備住屋培訓交通','等所有城市公共服務停頓才開始觀察','只要求新來者自行解決住屋工作與交通','完全不評估人口遷移，也不預先規劃住屋'],['原文直接對比 plan for migration 與 reacting to it。','更加劇被動應對。','忽略公共服務和融入。','與預先規劃相反。'],[11,12],'原文提出城市應預先規劃，並列出配套服務。'),
 transfer('另一篇文章討論青年由小城鎮遷往首都：首都住房受壓，小城鎮商店缺工。','哪種結構最能轉用範文？',['分別分析遷入地容量和遷出地缺人，再施策','只談首都面對的壓力，完全不提來源地','只談商店變化，完全否認城市住房壓力','把所有問題歸咎天氣而不分析人口流動'],['原文把城市與農村雙邊後果和政策分開。','漏掉一條題目明示的影響。','同樣漏掉另一邊。','未解釋題目所給因果。'],[1,2,6,14],'範文以城市和農村兩條並行影響線組織回答。'),
 transfer('有人說農村只要留住所有人口，便不需改善城市住房。','哪項回應最有文本根據？',['農村機會與城市規劃要並行，毋須阻止遷移','只要農村建路，所有居民必然永不搬遷','城市住房與新居民的增加完全沒有關係','禁止所有人移動才是文章唯一可行措施'],['原文說兩地政策互補，沒有主張禁止遷移。','把投資效果說成保證。','忽略城市承接能力。','不符合範文的政策方向。'],[8,11,12,14],'原文結尾用 while 把農村機會與城市規劃並列。'),
 transfer('新移民有工作意願，卻因欠職業培訓和交通接駁而只能做不穩定散工。','哪項城市措施較貼切？',['提供職業培訓與交通，助移民進入正規工作','只更換市政府標誌，不處理就業培訓問題','減少所有公共交通班次，阻礙新來者通勤','等新來者被邊緣化後才考慮就業支援'],['原文把培訓與交通連到正規經濟融入。','與就業障礙無關。','會使接駁更差。','與避免邊緣化的目的相反。'],[11,12],'原文明列培訓與可靠公交作新居民的融入工具。'),
 transfer('文章結尾只說「人口遷移有問題」，沒有回答應怎樣減少傷害。','怎樣修訂較完整？',['概括城市擠迫農村衰落，再提出兩地規劃','只重複有問題，不分析成因或提出措施','只增加大城市人口數字，不提相應政策','宣稱所有農村居民從此都不得遷往城市'],['原文結尾兼顧後果與兩地解方。','沒有回答措施部分。','缺少兩地問題的完整回答。','範文沒有主張禁止流動。'],[13,14],'原文最後兩句概括後果，再以並行政策減害。'),
];
const revisedAlternatives={
  0:[['人口驟增會增加需求，住屋可待租金回落','新來者增加，巴士班次可暫時維持原狀','住屋與交通受壓，原因只在居民收入較低'],['供應跟不上需求時，等待未必能緩解。','新增住戶也會使用交通服務。','容量不足不是單由收入決定。']],
  1:[['城市職位較多，農民便可先不看資歷','資歷暫未認可，城市機會便較少吸引力','城市工作較多，因此求職培訓可省去'],['職位存在不代表個人符合條件。','資歷障礙不抹去遷移動機。','培訓可協助進入適合工作。']],
  2:[['農場缺人，但農產品價格可先不看','老人比例上升，耕作人手仍可維持','青年外移後，農業可只靠新設備'],['人手短缺可能影響產量與供應。','情境已指出農場開始缺人。','設備有用，但不必然取代勞工。']],
  3:[['新道路方便出行，市場銷售仍交由中介','儲存設施有助保鮮，農民收入可另議','報告可增加建築資料，農業收入稍後再談'],['道路與儲存的價值應連到市場與生計。','保存產品也應看能否改善收入。','只描述設施外觀未解釋實際作用。']],
  4:[['先建更多道路，本地工作可由村民自行找','提供技能訓練，但加工工作可搬到城市','支援小企加工，農業培訓可待收入增長'],['道路不能單獨創造就業。','把工作移出農村，未減少外流壓力。','培訓與小企機會可相互支撐。']],
  5:[['先準備臨時住屋，人口變化可事後統計','先增加交通班次，住房需求稍後再評估','人口遷入增加，培訓可交由企業自行安排'],['缺少預測仍易陷入被動應急。','住房與交通都要按預期需求規劃。','城市政策也須考慮新來者就業需要。']],
  6:[['分析首都住房壓力，商店缺工可留待後文','先談小鎮缺工，首都承載量可另案處理','列出兩地現象，遷移原因與政策則較次要'],['結構須照顧遷出地的後果。','城市住屋壓力也是題目明示的後果。','範文把原因、雙向影響和措施連起來。']],
  7:[['農村多建路，城市住房可等人數穩定再改','農村機會增加，城市便可不規劃新住屋','城市需規劃住房，農村發展則可暫停'],['已有城市住屋需求仍需回應。','人口遷移仍可能持續，兩地須並行。','只改城市未處理農村推力。']],
  8:[['提供職業培訓，交通接駁可由僱主處理','改善交通接駁，技能培訓可留待入職','先提供住屋資料，工作支援可之後再談'],['不便通勤仍可能阻礙穩定就業。','缺技能可能使求職者只能做散工。','題目明指培訓與交通兩重障礙。']],
  9:[['概括城市擠迫，農村缺工可在正文再談','提出農村投資，城市規劃可留給下一篇','結尾重述問題，解方細節由讀者自行想像'],['結尾需回收兩地後果。','範文同時提出城市預先規劃。','題目要求回答怎樣減少傷害。']],
};
Object.entries(revisedAlternatives).forEach(([index,[options,reasons]])=>{transferTasks[index].options.splice(1,3,...options);transferTasks[index].explanations.splice(1,3,...reasons);});
export default {key:'cause-solution:17',meta:{topic:'農村人口移往城市對兩地的影響',summary:'城市可能超負荷，農村可能缺工和老化；農村投資與城市預先規劃需同步推進。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
