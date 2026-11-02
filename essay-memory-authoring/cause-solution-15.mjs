// Reviewed Cause/Solution 15: eco-tourism risks and local community control.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-15-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:15'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Eco-tourism is often called a careful way to travel, but visitors to distant areas may harm local culture and communities.',
  'This essay looks at the cultural and social problems eco-tourism may cause, then gives ways to protect local people and their traditions.',
  'One main problem is that local culture may be sold as a product.',
  'When tourists pay for experiences they think are real, traditional ceremonies, clothes, music and religious customs may slowly become shows.',
  'As a result, customs that once meant a lot to local people may become little more than things for tourists to see.',
  'This may weaken how local people see their culture, especially young people who may begin to think of it as something to sell instead of protect.',
  'Another problem is that sudden ideas and habits from outside may disturb distant communities.',
  'Tourists may bring different beliefs, ways of spending money and expectations; these may change how local people act and cause arguments.',
  'In some places, food, land and services may cost more, making daily life harder for local families.',
  'Several actions can reduce these problems.',
  'First, local people rather than outside companies should lead eco-tourism.',
  'Local leaders should choose how many tourists may come, which places visitors may enter and which customs should stay private.',
  'This lets communities gain from tourism without losing control of how they live.',
  'Second, governments and tourism businesses should set clear rules for visitors.',
  'For example, before entering distant areas, tourists should learn about local customs, clothing rules, important religious places and acceptable actions.',
  'The number of visitors should also be limited, and some tourism money should help local schools, cultural places, healthcare and nature protection.',
  'To sum up, eco-tourism may harm distant communities by selling culture and changing local life.',
  'But local control, teaching visitors and careful rules can protect traditions while tourism still brings money to the area.',
];
const vocabulary=[
  [['promoted as','called','被宣傳為'],['responsible way to travel','careful way to travel','負責任的旅行'],['remote areas','distant areas','偏遠地區'],['serious pressure','harm','嚴重壓力']],
  [['discuss','looks at','討論'],['cultural and social problems','cultural and social problems','文化社會問題'],['practical measures','ways','實際措施'],['traditions','traditions','傳統']],
  [['major problem','main problem','主要問題'],['commercialised','sold as a product','商業化']],
  [['willing to pay','pay','願意付費'],['“authentic” experiences','experiences they think are real','地道體驗'],['clothing','clothes','服飾'],['religious practices','religious customs','宗教習俗'],['performances','shows','表演']],
  [['As a result','As a result','結果'],['deep spiritual or social meaning','meant a lot to local people','深厚精神社會意義'],['tourist attractions','things for tourists to see','旅遊景點']],
  [['weaken local identity','weaken how local people see their culture','削弱身份認同'],['younger people','young people','年輕人'],['preserve','protect','保存']],
  [['remote communities','distant communities','偏遠社區'],['disrupted','disturb','受干擾'],['sudden outside influence','sudden ideas and habits from outside','突然而來的外部影響']],
  [['values','beliefs','價值觀'],['spending habits','ways of spending money','消費習慣'],['change local behaviour','change how local people act','改變當地行為'],['increase tension','cause arguments','增加緊張關係']],
  [['In some cases','In some places','在某些情況'],['may rise','may cost more','價格可能上升'],['everyday life','daily life','日常生活']],
  [['Several measures','Several actions','幾項措施'],['reduce these problems','reduce these problems','減少問題']],
  [['controlled by local communities','local people','由當地社區主導'],['outside companies','outside companies','外來公司']],
  [['decide','choose','決定'],['how many tourists may visit','how many tourists may come','接待遊客數量'],['open to outsiders','visitors may enter','對外開放'],['remain private','stay private','保持私密']],
  [['benefit from tourism','gain from tourism','從旅遊受益'],['without losing control','without losing control','不失去主導權'],['way of life','how they live','生活方式']],
  [['tourism operators','tourism businesses','旅遊營運者'],['introduce clear rules','set clear rules','訂立清晰規則']],
  [['educated about','learn about','接受相關教育'],['dress codes','clothing rules','服裝規範'],['sacred sites','important religious places','神聖場所'],['acceptable behaviour','acceptable actions','恰當行為']],
  [['Visitor numbers','The number of visitors','遊客人數'],['part of the income','some tourism money','部分收入'],['cultural centres','cultural places','文化中心'],['environmental protection','nature protection','環境保護']],
  [['In conclusion','To sum up','總結'],['commercialising culture','selling culture','文化商業化'],['disturbing local life','changing local life','干擾當地生活']],
  [['However','But','然而'],['community control','local control','社區主導'],['visitor education','teaching visitors','遊客教育'],['careful regulation','careful rules','審慎規管'],['economic benefits','money to the area','經濟利益']],
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
  frame(0,[', but when '],['生態旅遊被宣傳為負責任的旅行','遊客進入偏遠地區後可能帶來的壓力'],'but when 把正面宣傳和有條件出現的負面影響並列，避免把所有旅遊都說成必然有害。','開頭要對照一項活動的理想形象與在特定條件下可能出現的風險時。','Online shopping seems convenient, but when deliveries multiply, streets can become crowded.','but when','以條件指出宣傳與後果的落差'),
  frame(1,[', before suggesting '],['文章將分析的文化及社會問題','隨後提出的保護措施'],'before suggesting 預告先分析問題，再討論解決方法的文章順序。','題目同時問問題及解法，需要在引言清楚標明兩部分時。','This essay will examine the causes of waste, before suggesting ways to cut it.','before suggesting','預告問題與解法的次序'),
  frame(2,[' is that '],['其中一項主要問題','當地文化可能被商品化的具體內容'],'is that 在主題句直接說出問題，不把抽象標籤留給讀者猜。','段首需要直接提出一項可解釋的具體問題時。','One major problem is that local shops may lose customers.','is that','直接提出主體段問題'),
  frame(3,['When ', ', '],['遊客為地道體驗付費的條件','儀式服飾音樂和宗教習俗變表演的可能結果'],'When 指出商業化在甚麼情況下可能發生；may 保留可能性。','要說明一種需求或誘因如何逐步改變原有做法時。','When visitors pay for private ceremonies, some traditions may become shows.','When...may','交代需求到文化變化的機制'),
  frame(4,['As a result, '],['原有精神或社會意義的習俗可能淪為景點'],'As a result 承接前句的付費表演，再說明習俗意義可能如何被取代。','已解釋某做法如何改變，接着要指出其原有意義可能受到甚麼影響時。','As a result, a local festival may become only a tourist show.','As a result','說明上一機制的後果'),
  frame(5,[', especially among ', ', who '],['文化商品化可能削弱身份認同','受影響更明顯的年輕群體','把文化視為商品而非傳承的變化'],'especially among 收窄影響群體；who 解釋該群體為何特別受影響。','要從整體影響推到一類特別容易受影響者的具體想法時。','This may weaken trust, especially among new workers, who may feel ignored.','especially among...who','聚焦群體並解釋影響'),
  frame(6,[' is that '],['另一項不同的問題','外來影響可能干擾偏遠社區'],'Another problem is that 從文化商品化切換到社區生活受干擾的問題。','一項問題已展開，需要清楚開啟另一條不同的影響線時。','Another problem is that heavy traffic may disturb nearby homes.','Another problem is that','切換至第二個問題'),
  frame(7,[', which may '],['遊客帶來的價值觀消費習慣和期望','當地行為改變及居民遊客之間的緊張'],'which 回指前面多項外來影響；may 表示可能造成的社會效果。','列出幾種新因素後，需要概括它們可能造成的變化時。','Visitors bring different habits and expectations, which may create friction.','which may','歸納多項因素的可能影響'),
  frame(8,['In some cases, ', ', making '],['食物土地和服務可能加價的情況','當地家庭日常生活變困難的後果'],'In some cases 限定不是每個地方都如此；making 連接價格上升與生活壓力。','要補充只在部分情況下出現的影響，並說明對受影響者的後果時。','In some cases, rent rises, making life harder for local families.','In some cases...making','限定情況並指出實際後果'),
  frame(9,[' can be taken to '],['可採取的多項措施','減少已分析問題的目標'],'can be taken to 由兩類問題轉入可行措施，語氣不保證問題完全消失。','問題分析結束，準備開啟相應解決方法段時。','Several steps can be taken to reduce crowding.','can be taken to','從問題轉到減害措施'),
  frame(10,['First, ', ' rather than '],['應由當地社區主導的旅遊決策','不應掌握主導權的外來公司'],'rather than 明確比較誰作決策，核心是控制權，不是單純排斥所有外來參與。','要明確區分兩組人或機構的決策權時。','First, the project should be led by residents rather than outside investors.','rather than','指定主導者與替代對象'),
  frame(11,[' should decide ', ', which ', ', and which '],['有權決定的當地領袖','可接待的遊客人數','對外開放的地區','需要保留私密的習俗'],'三個 which/how 項目把社區主導落實為人數、空間和文化界線。','提出某人應主導後，還需列出其具體決策範圍時。','Local leaders should decide how many visitors may enter, which paths are public, and which areas should stay closed.','should decide...which...and which','列出具體決策範圍'),
  frame(12,[' to benefit from tourism without '],['讓社區從旅遊取得收益的安排','失去生活方式主導權的代價'],'without 說明收益與自主權可以並存，不必把兩者當成非此即彼。','要說明某項措施如何兼顧一項利益與需要保護的界線時。','This allows families to earn from tourism without losing their privacy.','without','兼顧收益與保護界線'),
  frame(13,['Second, ', ' should '],['政府及旅遊營運者','為遊客訂立清晰規則的責任'],'Second 開啟與社區主導互補的第二類措施；should 指出執行者和行動。','已提出一組措施，接着要由另一責任方提出互補措施時。','Second, schools and parents should set clear online-safety rules.','Second...should','補上另一組責任人與措施'),
  frame(14,['For example, ', ' before '],['遊客應學習的習俗服飾聖地及行為規範','進入偏遠地區這個時間界線'],'before 指出教育應發生在進入社區之前，而非等冒犯出現才補救。','要把抽象的教育或告知措施化為具體內容及實施時間時。','For example, visitors should learn the local rules before entering the site.','before','具體說明預先教育'),
  frame(15,[', and '],['限制遊客人數的措施','把部分旅遊收入投入公共服務及保護'],'and 把控制旅客規模與收入回饋社區並列，補足行為規則。','兩項措施分別處理規模與收益分配，需要在一句中並列時。','Visitor numbers should be capped, and some ticket income should support local schools.','and','並列容量限制與收益回饋'),
  frame(16,['In conclusion, ', ' by '],['生態旅遊可能傷害偏遠社區的判斷','文化商品化及干擾生活兩條途徑'],'by 在結尾點明傷害如何發生，回收前面兩條問題線。','結尾要概括前文兩種傷害的機制，而不只重複負面判斷時。','In conclusion, tourism can strain towns by raising prices and disturbing daily life.','by','收束兩項傷害機制'),
  frame(17,['However, ', ' while still '],['社區主導遊客教育及審慎規管的保護作用','旅遊仍可帶來的經濟收益'],'while still 說明保護傳統與保留合理經濟收益可以同時成立。','結尾要說明保護措施與可保留的好處可以並存時。','However, clear rules can protect residents while still allowing visitors to spend locally.','while still','以兼顧保護與收益作結'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>`這句用「${specs[j].tag}」${specs[j].job}；沒有用「${target.tag}」${target.job}。`),answerReason:`示例用「${target.tag}」${target.job}。`,patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的問題及對策次序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('生態旅遊在這篇文章中帶來哪兩類問題？',['文化習俗被商品化，以及外來影響干擾社區生活','只有野生動物數量下降，完全不涉及居民','只關乎旅客拍照速度','所有當地文化都會自動消失，沒有例外'],'文章先談文化意義變成表演，再談居民生活和價格受影響。'),
  quiz('文章提出哪兩項主要保護方向？',['社區掌握旅遊決策權，並為遊客訂規則及設人數限制','完全交由外來公司決定所有文化界線','只增加宣傳，不談規則或社區權利','禁止任何旅遊收益回到當地'],'解方把社區主導和遊客管理配在一起。'),
];
const route=[sequence('從文化與社區風險走到兩組保護措施',[
  ['引言：理想與風險','負責任旅行仍可能令偏遠社區承受壓力。'],
  ['主體一：兩類問題','習俗變表演會削弱文化意義；外來習慣及價格可干擾居民生活。'],
  ['主體二：社區主導','當地人決定人數、開放範圍及哪些文化習俗維持私密。'],
  ['主體二與結尾：規則及回饋','先教育遊客、限制人數，並用部分收入支持當地服務。'],
],'先區分文化商品化和社區生活受擾，再把決策權、訪客規則與收益回饋配對。')];
const evidence=[
  quiz('為甚麼付費「地道體驗」可能傷害習俗？',['儀式等習俗可能漸變成迎合遊客的表演，失去原有意義','遊客付費便必然令所有文化立即消失','傳統儀式本來只為旅客售票而設','收入增加就保證年輕人珍惜每項習俗'],'原文用 may gradually 說明可能發生的轉變，不把它說成必然。'),
  quiz('文章如何說明年輕人特別可能受影響？',['他們可能把本身文化視為可出售的東西，而非需要保存的傳承','所有年輕人都拒絕任何傳統，沒有例外','他們只因旅客衣著而失去所有身份','文章沒有提及年輕人'],'原文以 especially among younger people 聚焦身份認同的變化。'),
  quiz('外來影響有哪些具體形式？',['遊客的價值觀、消費習慣及期望可能改變當地行為並增加緊張','只有遊客攜帶的行李顏色','當地人永遠不會受到任何價格影響','所有居民都必然與每名遊客爭吵'],'文章列出三類因素，並以 may 表示可能的社會後果。'),
  quiz('社區主導要落實在哪些決定上？',['遊客數量、開放地區及保持私密的文化習俗','只由外來公司選擇旅遊廣告字體','只決定旅客是否帶相機','由遊客自行決定所有私密儀式是否公開'],'原文以三個可作決定的範圍解釋控制權。'),
  quiz('遊客教育應在何時及包括甚麼？',['進入偏遠地區前，學習習俗、服飾規範、神聖場所與合宜行為','冒犯發生很久後才給予單一傳單','只教遊客如何購買紀念品','不用介紹當地規則，因為人人都知道'],'before entering 把教育安排在抵達社區之前。'),
  quiz('旅遊收入應如何回饋當地？',['部分收入支持學校、文化中心、醫療與環境保護','全部收入必須離開社區，且無需解釋','只用來增加旅客數量，沒有其他用途','文章只談收入，完全沒有談人數限制'],'原文同時提出人數限制與多項社區服務。'),
];
const logic=[
  sequence('付費體驗如何演變成文化問題',[
    ['遊客願為「地道」體驗付費','市場需求使習俗可能被重新包裝。'],
    ['儀式與音樂漸變成表演','原有精神或社會意義可能被削弱。'],
    ['年輕人對文化的看法改變','可能更傾向出售，而非保存文化。'],
    ['社區取得選擇權','決定哪些習俗保持私密，仍可取得合理收入。'],
  ],'文章說的是可能發生的逐步轉變，不能改寫成所有習俗必然消失。'),
  sequence('外來影響與對應的訪客管理',[
    ['價值觀及消費習慣進入社區','當地行為和居民旅客關係可能改變。'],
    ['部分物價可能上升','食物、土地和服務的費用影響當地家庭。'],
    ['預先教育並訂規則','旅客入境前了解文化界線與合宜行為。'],
    ['限制人數並回饋收入','減少壓力，把部分收益投入社區服務。'],
  ],'解方同時控制規模、行為與收益去向，不是一項措施包辦所有問題。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('某村莊把祖先祭典改成每天三場售票表演，居民原本只在特定日子舉行。','哪項分析最接近範文？',['付費需求可能令原有精神意義逐步被表演用途取代','售票一定能保證原有儀式意義完全不變','所有旅客都必然有意傷害村莊文化','只看售票收入，不必了解原本的儀式用途'],['原文把遊客付費與習俗表演化的可能風險連起來。','收入不能保證文化意義不變。','原文分析機制，沒有推定所有旅客的意圖。','原有用途是判斷商業化影響的關鍵。'],[3,4,5],'原文由付費地道體驗推到習俗成為表演及文化意義受損。'),
  transfer('一間旅行公司想獨自決定部落每週接待多少遊客，以及哪些地方可以拍照。','哪項修訂符合範文？',['由當地社區決定接待人數和開放範圍，外來公司按規則營運','由旅行公司自行公開所有私密地方','只問旅客喜好，不讓居民參與','只增加廣告預算，略過接待安排'],['原文把遊客數量和地區開放列為當地領袖的決策。','把文化界線交給外來公司，與主張相反。','忽視居民對生活空間的主導權。','廣告不能替代人數與開放範圍的決定。'],[10,11,12],'原文明說當地社區應主導旅遊，並列出具體決策範圍。'),
  transfer('遊客到達神聖場所後才收到一張模糊的禮儀告示，已有人穿著不合規定的衣服。','下一次怎樣安排較好？',['抵達偏遠地區前清楚教導服飾、神聖場所及合宜行為','等每次冒犯後才猜測規則','把神聖場所直接當作普通購物商場','只限制導遊說話，不提供任何事前資料'],['before entering 是原文提出的預防時機。','延遲教育不能避免已發生的冒犯。','忽略場所的文化或宗教界線。','沒有讓遊客知道如何合宜行動。'],[13,14],'原文把遊客教育安排在進入偏遠地區之前。'),
  transfer('某島因遊客增加，食物和土地租金上升，當地家庭生活更吃力。','哪項因果描述最忠於範文？',['在某些地方，旅遊帶動的價格上升可能增加居民日常負擔','所有旅遊地區的價格必然相同','只要旅客增加，居民收入就必然足以抵消所有成本','土地價格與當地家庭生活完全無關'],['原文以 In some cases 和 may 保留適用範圍與不確定性。','原文沒有說每個地區都如此。','收入與成本不保證自動抵消。','土地成本可影響當地生活。'],[8],'原文列出食物、土地及服務價格可能上升。'),
  transfer('另一篇文章討論大型音樂節：原有的社區慶典為迎合付費觀眾而改變。','哪種論證最能轉用範文？',['由付費需求解釋慶典如何可能變成表演，再討論其原有意義','只說慶典變大，完全不問原有用途','因為有門票，便推定所有人一定反對慶典','突然討論與活動無關的手機牌子'],['範文的文化鏈條是需求、表演化、原有意義可能受損。','漏掉文化變化的關鍵。','把可能性說成普遍必然。','不能回答文化影響。'],[3,4,5],'原文的商業化分析可轉用到其他有付費需求的文化活動。'),
  transfer('地區政府認為只要增加生態旅遊收入，便毋須限制遊客數量。','哪項回應符合範文？',['收入可回饋社區，但仍須由當地人決定接待規模和開放界線','收入增加便能自動消除所有社區壓力','所有私密儀式都應按票價開放','只由外來投資者決定遊客上限'],['原文將收益與人數及文化界線控制並列。','收入不是對所有壓力的保證。','違反保留私密習俗的措施。','決策權應屬當地社區。'],[10,11,12,15],'原文主張旅遊收益與社區自主權並存。'),
  transfer('某旅遊營運者訂了著裝規範，但並未讓附近社區參與訂規則。','還缺少哪一部分？',['讓當地社區決定旅客數量、開放地區及需要保留的習俗','完全取消所有文化界線','只翻譯遊客手冊封面','把決策全部交給未到過當地的投資者'],['訪客行為規則不能取代社區對旅遊的主導。','與保護傳統的目的相反。','只改封面沒有給居民決策權。','與當地社區主導的原文方向相反。'],[10,11,13,14],'原文以社區控制及遊客規則作互補措施。'),
  transfer('學校希望把一項傳統手工藝教給學生，同時有人提議公開所有家庭秘傳步驟。','哪項思路最能借用範文？',['由傳承者決定可公開的內容，保留私密部分，仍讓學生學習','因為要教學，所有家庭內容都必須公開','只由觀眾投票決定何者私密','完全不問工藝持有者的意願'],['原文讓社區選擇哪些習俗可公開及哪些應私密。','教育與公開全部私密資料並非同一回事。','旁觀者不能代替持有者設定文化界線。','忽略傳承者的主導權。'],[11,12],'原文的可轉用原則是讓文化持有者掌握公開界線。'),
  transfer('村莊每年收取旅客費用，但學校及診所仍缺乏資源。','哪個資金安排最符合範文？',['把部分旅遊收入明確投入當地學校、醫療及文化保護','把所有費用只用在外來公司的辦公室裝修','只增加遊客人數，永遠不交代收入去向','因為有旅客費，便自動推定社區已受益'],['原文列出部分收入應支持的當地服務。','沒有把收益回到社區。','人數增加不等於社區服務改善。','收益須有具體用途才可判斷。'],[15],'原文把部分生態旅遊收入連到學校、文化中心、醫療及環保。'),
  transfer('一篇結尾只說「生態旅遊有問題，應該改善」，沒有交代問題或措施。','怎樣改寫較完整？',['概括文化商品化與生活受擾，再提出社區主導、教育及規管','只重複「有問題」四次','只談經濟收益，不提文化或居民','把所有遊客描寫成必然犯法'],['原文結尾回收兩條問題及三項互補措施。','沒有回答題目所問的問題與解法。','漏掉本文的核心風險。','與原文有分寸的 may/can 不符。'],[16,17],'結尾應把具體問題和對應解法一同收束。'),
];
export default {key:'cause-solution:15',meta:{topic:'生態旅遊對偏遠社區的文化與生活影響',summary:'付費體驗可能使習俗表演化，外來影響也可能干擾生活；社區主導、訪客教育與規管共同減害。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
