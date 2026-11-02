// Individually authored Cause/Solution 3 lesson: inequality between richer and poorer countries.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-3-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const essay=context.window.ESSAY_MEMORY_LESSONS['cause-solution:3'];
const original=essay.sentences.map(row=>row.english);
const simple=[
  'The difference between rich and poor countries has grown in many places. This starts a loop: wealth brings more wealth, while poor countries find it harder to get out of poverty.',
  'The main reason is that countries do not have the same chance to use the things that help them build wealth over time.',
  'This essay will explain the reason and give useful ways to deal with the problem.',
  'The main reason is that rich countries usually have better schools, more reliable public systems, newer technology and easier ways to get money for businesses.',
  'These good starting points let them make products and services worth more money, such as medicines, software and banking services, which bring in a lot of money.',
  'But poor countries often rely on selling basic materials or on workers paid little.',
  'Because of this, they make less money, get less tax money and find it hard to build roads, schools and hospitals that would help them do as well as others.',
  'This harmful loop continues: the less a country can spend on its people, roads and basic services, the harder it is to do more than survive and achieve real growth.',
  'To make this difference smaller, changes between countries and changes at home are both needed.',
  'Richer countries and world organisations should make trade rules fairer, lower unfair debts and give poorer countries money aimed at schools, healthcare and clean basic services.',
  'This would give poorer countries what they need to grow instead of making them always need help.',
  'Also, governments in poorer countries must be more open about spending, stop dishonest use of power and put public money into industries that create jobs needing training.',
  'For example, job training and help for small local businesses can move workers from jobs without formal contracts into work that produces more value.',
  'In this way, help lets countries stand on their own instead of needing help forever.',
  'To sum up, the growing difference in wealth is mainly caused by unequal chances to use schools, technology, money and reliable public systems.',
  'Fairer rules between countries, careful spending and better ways of running poorer countries can make this difference smaller.',
];
const vocabulary=[
  [['gap','difference','差距'],['wealthy','rich','富裕的'],['impoverished','poor','貧困的'],['widened','grown','擴大'],['cycle','loop','循環'],['prosperity','wealth','富裕／繁榮'],['escape','get out of','擺脫']],
  [['main cause','main reason','主要原因'],['unequal access','not have the same chance','取得機會不平等'],['long-term wealth','wealth over time','長期財富']],
  [['explain this cause','explain the reason','解釋成因'],['suggest practical ways','give useful ways','提出實際方法'],['address it','deal with the problem','處理問題']],
  [['central reason','main reason','核心原因'],['possess','have','擁有'],['education systems','schools','教育制度'],['stronger institutions','more reliable public systems','更穩健的制度'],['advanced technology','newer technology','先進科技'],['investment','money for businesses','投資']],
  [['advantages','good starting points','優勢'],['allow','let','使能夠'],['high-value goods and services','products and services worth more money','高價值商品與服務'],['financial products','banking services','金融產品'],['generate large profits','bring in a lot of money','創造龐大利潤']],
  [['by contrast','but','相比之下'],['depend on','rely on','依賴'],['exporting','selling','出口／售賣'],['raw materials','basic materials','原材料'],['low-paid labour','workers paid little','低薪勞動力']],
  [['As a result','Because of this','因此'],['earn less','make less money','收入較少'],['collect less tax','get less tax money','稅收較少'],['struggle to build','find it hard to build','難以建設'],['compete','do as well as others','競爭']],
  [['vicious circle','harmful loop','惡性循環'],['invest in','spend on','投資'],['infrastructure','roads and basic services','基礎建設'],['move beyond survival','do more than survive','超越僅僅維生'],['genuine development','real growth','真正發展']],
  [['reduce this gap','make this difference smaller','縮小差距'],['international reform','changes between countries','國際改革'],['domestic improvement','changes at home','國內改善']],
  [['Wealthier countries','Richer countries','較富裕國家'],['global institutions','world organisations','全球機構'],['reduce unfair debt burdens','lower unfair debts','減輕不公平債務'],['targeted investment','money aimed at','針對性投資'],['infrastructure','basic services','基礎建設']],
  [['developing economies','poorer countries','發展中經濟體'],['tools to grow','what they need to grow','成長工具'],['rather than','instead of','而非'],['permanently dependent on aid','always need help','永久依賴援助']],
  [['At the same time','Also','同時'],['transparency','open about spending','透明度'],['corruption','dishonest use of power','貪污'],['invest public money','put public money','投放公共資金'],['skilled employment','jobs needing training','技術型就業']],
  [['vocational training','job training','職業培訓'],['informal jobs','jobs without formal contracts','非正式工作'],['more productive work','work that produces more value','更具生產力的工作']],
  [['aid','help','援助'],['stepping stone','lets countries stand on their own','踏腳石'],['crutch','needing help forever','拐杖／長期依賴']],
  [['In conclusion','To sum up','總而言之'],['widening wealth gap','growing difference in wealth','擴大的財富差距'],['unequal access','unequal chances to use','取得機會不平等'],['capital','money','資本'],['stable institutions','reliable public systems','穩定制度']],
  [['reduced','make this difference smaller','減輕'],['fairer global rules','Fairer rules between countries','更公平的全球規則'],['responsible investment','careful spending','負責任的投資'],['stronger domestic governance','better ways of running poorer countries','更完善的國內治理']],
];

// Each linked span is copied exactly from the source. The slot labels describe
// the actual job done by the surrounding words, not the essay topic.
function structure(i,links,labels,meaning,usage,example,distractors,wrongReasons,answerReason){
  const text=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing fixed source wording ${i+1}: ${link}`);
    if(at>cursor)parts.push({text:text.slice(cursor,at),kind:'slot',label:labels[slot++]});
    parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;
  }
  if(cursor<text.length)parts.push({text:text.slice(cursor),kind:'slot',label:labels[slot++]});
  if(slot!==labels.length)throw Error(`Unmatched slot labels ${i+1}`);
  const formula=parts.map(p=>p.kind==='link'?p.text:`[${p.label}]`).join('');
  return {frame:{formula,meaning,usage,parts},example,distractors,wrongReasons,
    answerReason,patternType:'reviewed'};
}
const structures=[
  structure(0,[', creating'],['擴大的差距及其背景','隨之形成的循環'],
    '前半句說明差距擴大；creating 補上這種變化引發自我強化的循環。',
    '要先描述一個變化，再用逗號加 creating 簡潔指出它造成的連帶結果時。',
    'The gap between two schools has grown, creating a cycle in which the stronger school attracts more teachers.',
    [1,6,7],['The main cause of 直接指出原因，沒有用 creating 補充隨之出現的循環。','As a result 另起一句交代後果，沒有在同一句用 creating 接上伴隨結果。','the less...the harder 呈現相互加深的關係，但沒有先描述變化再用 creating 連接。'],
    '示例先說差距擴大，再用 creating 指出因此形成的循環。'),
  structure(1,['The main cause of',' is '],['待解釋的問題','根本原因'],
    'The main cause of 把焦點放在問題，is 後直接說明最主要的根源。',
    '要在分析問題的段落中明確指出主要成因，而非只描述問題表面時。',
    'The main cause of long waiting times is a shortage of buses.',
    [0,6,8],['creating 補充變化造成的結果，沒有用 is 定義問題的主要成因。','As a result 指向前因造成的後果，不是倒過來指出問題的根源。','To reduce 先定目標並提出措施，屬方案而非成因分析。'],
    '示例以 The main cause of 指明問題，再用 is 指出根源。'),
  structure(2,['This essay will explain',' and suggest'],['將解釋的成因','將提出的解決方法'],
    '這句交代文章的兩項工作：解釋成因，然後提出處理方法。',
    '題目同時要求分析原因及提出辦法時，可在引言簡短預告這兩項論述任務。',
    'This essay will explain the shortage and suggest ways to fix it.',
    [3,14,15],['The central reason is that 已開始提出理由，沒有預告文章後面要做的兩項工作。','In conclusion 收束已寫過的原因，不能用來預告下一段的解釋和方案。','It can be reduced through 概括解方，沒有同時預告原因分析。'],
    '示例同時預告解釋問題和提出辦法，次序與原句相同。'),
  structure(3,['The central reason is that'],['完整的原因子句'],
    '固定開頭把後面的完整子句標成核心理由。',
    '已提出問題，接着要在主體段直接說出最關鍵理由時。',
    'The central reason is that many workers cannot reach training centres.',
    [1,6,9],['The main cause of 用名詞片語指出根源，並非 is that 後接完整原因子句。','As a result 承接原因說結果，不是在此提出核心理由。','should make 提出多項行動措施，屬解方而不是核心成因。'],
    '示例在 is that 後接可獨立成立的原因子句。'),
  structure(4,[' allow ',' to ', ', such as ', ', which '],['具備優勢的一方','受益者','可做的高價值活動','具體例子','例子帶來的效果'],
    '先說優勢讓一方做到甚麼，再列例子，最後用 which 補充這些產出帶來的效果。',
    '一種條件使某方能產出成果，而該成果又有具體例子及後續影響時。',
    'Good transport links allow towns to attract firms, such as shops and workshops, which create jobs.',
    [5,6,12],['by contrast 對照另一方，沒有呈現優勢→活動→例子→後續效果的鏈條。','As a result 只承接前因說後果，沒有用 allow...to 和 which 展開產出。','For example 舉一項做法，沒有說明某優勢使誰能產出甚麼。'],
    '示例以 allow...to 說能力，以 such as 舉例，再以 which 說效果。'),
  structure(5,[', by contrast,'],['與前述一方不同的對象','相反的依賴情況'],
    'by contrast 插在主語後，把較貧困國家與前述富裕國家的生產方式對照。',
    '兩個對象的情況不同，且前一方已說明，需要轉向另一方作比較時。',
    'Small schools, by contrast, often lack specialist staff.',
    [4,6,8],['allow...to 解釋能力及效果，沒有把另一方拿來與已說對象對照。','As a result 承接因果，沒有用 by contrast 引入不同對象。','To reduce 開始提出措施，沒有比較兩方現況。'],
    '示例在另一對象後插入 by contrast，清楚轉向對照。'),
  structure(6,['As a result,'],['前述差異造成的一串後果'],
    'As a result 把較低收入、較少稅收及公共建設困難連回前述經濟差異。',
    '已說明原因或差異，接着要列出由此帶來的多個後果時。',
    'As a result, schools lose staff, receive less funding and struggle to buy books.',
    [1,5,14],['The main cause of 追溯問題源頭，沒有從既述原因推導後果。','by contrast 比較兩方情況，沒有標明後一句是前述情況的結果。','In conclusion 總結已論證的原因，不是接續展開中途的後果鏈。'],
    '示例用 As a result 承接前因，列出相互相關的後果。'),
  structure(7,['This becomes a vicious circle: the less',', the harder'],['能投入的資源','走向改善的難度'],
    '冒號後的 the less...the harder 說明投入愈少，改善愈難；困難又使投入更少。',
    '兩種變化互相加深，需要說明「愈少 A，愈難 B」的惡性循環時。',
    'This becomes a vicious circle: the less children read, the harder it is for them to learn.',
    [0,6,13],['creating 說一個變化造成後果，沒有用比較結構顯示兩端互相加深。','As a result 指出後果，沒有呈現 the less 與 the harder 的遞進對應。','In this way 說做法的作用，沒有呈現投入減少與困難增加的循環。'],
    '示例以 the less...the harder 明確呈現兩端相互加深的關係。'),
  structure(8,['To reduce',', both',' and ',' are needed.'],['要縮小的問題','第一種措施','第二種措施'],
    'To reduce 先定目標；both...and 說達到目標需要國際和國內兩個層面的配合。',
    '一個問題不能靠單一措施解決，需要並列兩項缺一不可的行動時。',
    'To reduce delays, both more buses and clearer timetables are needed.',
    [9,10,15],['should make 直接列行動，沒有先用 To reduce 指出目標及兩項必要措施。','rather than 對照有幫助與有害的後果，不是用 both...and 並列兩項必需措施。','It can be reduced through 列解決途徑，但沒有強調兩方同時都需要。'],
    '示例先交代要減少甚麼，再用 both...and 列出兩項必要措施。'),
  structure(9,[' should make ', ', reduce ', ' and support '],['採取行動的一方','要改善的規則','要減輕的負擔','要支持的對象與方法'],
    'should 後並列三項不同但互補的行動，而非把同一措施重複三次。',
    '要提出由同一行動方執行的一套互補措施，並分清每項措施的對象時。',
    'Schools should make lessons clearer, reduce paperwork and support pupils with extra practice.',
    [8,11,12],['both...and 強調兩項必要條件，沒有由同一主語列三個 should 措施。','At the same time 轉到另一行動方的責任，沒有延續同一方的三項建議。','For example 用具體例子支持措施，沒有直接列出整套行動。'],
    '示例由同一主語提出改善、減少和支持三項互補做法。'),
  structure(10,['This would give',' rather than '],['受益者及會得到的工具','要避免的依賴結果'],
    'would 推想前述方案實施後的效果；rather than 排除長期依賴的相反結果。',
    '提出方案後，要說明預期的正面效果，並指出它能避免哪種不理想結果時。',
    'This would give new workers useful skills rather than leave them dependent on help.',
    [4,8,13],['allow...to 說已有優勢使誰能做事，沒有推想某方案的預期效果。','both...and 說同時需要的措施，尚未交代這些措施會帶來的結果。','In this way 評價援助的作用，沒有用 rather than 明確排除另一種效果。'],
    '示例用 would 預想效果，再用 rather than 指出要避免的依賴。'),
  structure(11,['At the same time,',' must ', ', reduce ', ' and invest '],['另一行動方','必須先做的制度改善','要減少的問題','要投資的方向'],
    'At the same time 將責任由國際層面轉回國內；must 後列出改善治理的三個環節。',
    '前面已提出一方的責任，現在要補上另一方也必須同時採取的互補行動時。',
    'At the same time, councils must explain the rules, reduce paperwork and invest in training.',
    [8,9,12],['To reduce 總述兩項必要條件，沒有明確轉向另一行動方。','should make 列出前一方的措施，沒有用 At the same time 交代另一方的責任。','For example 提供一個具體做法，沒有補全另一方的整套責任。'],
    '示例用 At the same time 轉向另一行動方，並列出其責任。'),
  structure(12,['For example,',' can help ', ' move from ', ' into '],['具體做法','受益者','原來較弱的狀態','較好的新狀態'],
    'For example 給具體方案；move from...into 顯示培訓如何讓工人轉換工作狀態。',
    '概括一項方案後，要用可想像的例子說明受益者如何由舊狀態轉到新狀態時。',
    'For example, free lessons can help adults move from insecure jobs into skilled work.',
    [4,9,13],['allow...to 說現有優勢使人能產出，不是用例子描述由舊狀態轉到新狀態。','should make 列措施清單，沒有展示某受益者實際如何轉變。','In this way 總評做法的作用，沒有用 For example 提供具體轉變情境。'],
    '示例先給具體做法，再以 move from...into 呈現轉變。'),
  structure(13,['In this way,',' becomes ', ', not '],['前述措施','真正有用的定位','要排除的依賴定位'],
    'In this way 回指前述改革；踏腳石與拐杖的對照說援助應幫助自主，而非製造依賴。',
    '已說明方法，接着要用精簡對照重估它應發揮的作用與不應變成的負擔時。',
    'In this way, a grant becomes a first step, not a permanent subsidy.',
    [7,10,15],['the less...the harder 描述惡性循環，沒有評價措施應有的定位。','would...rather than 預想兩種後果，沒有用 becomes 把同一措施重新定位。','It can be reduced through 概括解方，沒有用 A becomes B, not C 對照兩種定位。'],
    '示例把補助定位為起步工具，並排除長期依賴的定位。'),
  structure(14,['In conclusion,',' is mainly caused by '],['前文討論的問題','概括出的主要成因'],
    'In conclusion 標示收束；is mainly caused by 概括全文已分析的主要原因。',
    '結尾要回應「為何發生」，並把前文多個原因濃縮成一句時。',
    'In conclusion, the traffic problem is mainly caused by poor planning and limited buses.',
    [1,3,15],['The main cause of 在正文提出成因，沒有標示文章結尾的總結。','The central reason is that 展開核心理由，不是收束全文已論證的原因。','It can be reduced through 概括解決途徑，回答的是如何處理而非為何發生。'],
    '示例在結尾用 is mainly caused by 收束已分析的成因。'),
  structure(15,['It can be reduced through'],['概括的解決途徑'],
    'It 回指前一句的財富差距；through 後並列國際規則、投資及國內治理三種解方。',
    '已清楚指出問題後，在結尾簡潔概括多條改善路徑，且代名詞指向明確時。',
    'It can be reduced through clearer rules and better public transport.',
    [8,9,14],['To reduce...both...and 先設定目標和必需措施，不是結尾的被動式方案總結。','should make 由特定行動方列具體措施，沒有用 It 回指前述問題。','is mainly caused by 概括原因，沒有回答可以透過甚麼途徑改善。'],
    '示例用 It 回指已說明的問題，再以 through 引出改善途徑。'),
];

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先回想範文段落的論證次序，再選下一張意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('這篇文章主要要回答哪兩個問題？',[
    '富國與窮國的財富差距為何擴大，以及可以如何縮小',
    '富國是否應禁止所有窮國出口，以及誰應承擔刑責',
    '國家應只重視教育還是只重視醫療，並選出其中一方',
    '哪一國在單一年份最富裕，以及它的稅率是多少',
  ],'題目是成因與解方；範文先解釋取得致富系統的機會不平等，再提出國際和國內兩層改善。'),
  {type:'multi',prompt:'哪兩項合起來才是範文的解決方向？',detail:'選兩項，再按「確認」。',options:[
    '富裕國家與國際機構改善貿易、債務和針對性投資',
    '較貧困國家改善治理、減少貪污並投資技術就業',
    '只要求窮國等待市場自然改善，不改變現有規則',
    '只給予無限期援助，不幫助國家建立自身能力',
  ],correct:[0,1],why:'範文把國際規則與國內治理視為同時需要的兩個層面。'},
];
const route=[sequence('依照範文次序，排好成因與解方的路線',[
  ['引言：說清問題','財富差距擴大；根源是建立長期財富所需系統的取得機會不平等。'],
  ['主體一：解釋惡性循環','富國有教育、制度、科技與投資優勢；窮國較依賴原料和低薪勞動，稅收不足又妨礙公共建設。'],
  ['主體二：提出兩層解方','國際層面調整貿易、債務與投資；國內層面改善透明度、反貪污和技術就業。'],
  ['結尾：回扣兩問','濃縮主要成因，再歸納國際規則、投資與國內治理三條改善途徑。'],
],'先追溯使差距自我加深的機制，再提出能同時處理外部規則與內部能力的措施。')];
const evidence=[
  quiz('範文把財富差距的主要根源放在哪裏？',[
    '各國取得教育、制度、科技和投資的機會不平等',
    '所有窮國的人民都沒有工作意願或學習能力',
    '富國只因人口較多，便必然取得更高的稅收',
    '窮國已經擁有同等資源，只是不願意出口商品',
  ],'作者分析的是長期創造財富所需系統的差異，不把貧窮簡化成個人意願問題。'),
  quiz('富國的優勢如何轉化為更高收入？',[
    '較好的制度與科技支持高價值商品和服務，再創造較大利潤',
    '只要原料價格下降，富國就能停止生產所有商品',
    '富國只靠低薪勞動而不需要教育、科技或投資',
    '所有醫療和軟件產品都由窮國免費提供給富國',
  ],'範文把優勢、較高價值的產出和利潤串成因果鏈。'),
  quiz('窮國依賴原料與低薪勞動後，哪條後續鏈符合範文？',[
    '收入與稅收較少，難建道路、學校和醫院，也更難競爭',
    '稅收自動增加，所有公共設施便能立即免費建成',
    '原料出口必然讓每個勞動者取得高薪技術職位',
    '公共建設與競爭能力毫無關係，所以不必投資',
  ],'低價值收入限制公共投資，公共投資不足又阻礙下一步發展。'),
  quiz('為何說這是一個「惡性循環」？',[
    '愈無法投資於人與基建，便愈難發展，下一輪可投資資源也更少',
    '每一國只要在某一年較窮，下一年就必然失去所有人口',
    '援助本身一定使每個國家更窮，因此必須全面停止',
    '科技改善必然降低生產力，所以教育與投資沒有作用',
  ],'the less...the harder 說的是相互加深的限制，而不是單一事件。'),
  quiz('國際層面的方案包括哪些具體措施？',[
    '較公平貿易規則、減輕不公債務，並投資教育、醫療和清潔基建',
    '只提高債務利率並禁止任何窮國使用全球市場',
    '只提供沒有目標的現金，不檢查長期能力是否改善',
    '要求較貧困國家完全放棄教育、醫療和公共建設',
  ],'範文提出的是能增加自主成長能力的針對性支持。'),
  quiz('較貧困國家的政府本身還需要做甚麼？',[
    '提升透明度、減少貪污，並把公共資金投入能創造技術就業的產業',
    '把所有公共資金投放短期消費，不建立可持續的職位',
    '把責任完全交予外國，不處理本地治理與資金運用',
    '只延長援助時間，不考慮職業培訓或小型企業',
  ],'外部規則若改善，國內資金仍須被負責任地使用。'),
];
const logic=[
  sequence('主體一：由不平等優勢推到惡性循環',[
    ['起點：建立財富的系統不均','富國較易取得教育、穩定制度、科技和投資。'],
    ['第一層效果：產出價值不同','富國較能生產藥物、軟件和金融服務；窮國較依賴原料及低薪勞動。'],
    ['第二層效果：可投資資源不同','收入和稅收較少，使窮國難建道路、學校與醫院。'],
    ['回到起點：下一輪更難競爭','無法投資於人民及基建，便更難超越僅僅維生的狀態。'],
  ],'每一環都連到下一環，最後又使最初的差距更難縮小。'),
  sequence('主體二：讓援助成為踏腳石的兩層方案',[
    ['國際規則先減少障礙','使貿易更公平、減輕不公債務，並針對教育醫療與清潔基建投資。'],
    ['目標是建立自身工具','支持應使發展中經濟體更能自主成長，而不是永遠依賴援助。'],
    ['國內治理也必須改善','提升透明度、減少貪污，把資源投放能創造技術工作的產業。'],
    ['具體轉變：由不穩定到高價值工作','職業培訓與本地小企幫助工人轉向更具生產力的職位。'],
  ],'國際改革和國內改善相互配合，才把援助變成自立的起步。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('兩所學校的資源差距擴大：較富裕學校更易聘到教師，欠資源學校因成績下降更難吸引教師。','哪項最準確轉用範文的「循環」論證？',[
    '資源優勢吸引更多資源；資源不足又令改善更難，形成循環',
    '較富學校多聘教師，但欠資源學校的下一輪招聘不受影響',
    '只比較兩校本學期教師數，不分析資源如何影響下次招聘',
    '把欠資源學校成績下降當作結果，卻不問它如何反過來影響資源',
  ],['先說優勢自我加強，再說弱勢如何更難擺脫，保留雙向循環。','只說較富學校的優勢，漏了弱校更難吸引教師的反饋。','只比較某一時點，沒有呈現下一輪資源如何繼續分化。','把弱校成績當終點，漏了成績下降會削弱往後的資源吸引力。'],[0,7],'原文開頭說繁榮會吸引繁榮，主體段以「投入愈少、發展愈難」展示差距如何自行加深。'),
  transfer('兩個城市都想發展醫療服務；甲城有訓練中心、可靠醫院和資金渠道，乙城都欠缺。','哪項分析最能轉用範文對「根本原因」的做法？',[
    '先比較兩城取得訓練、制度和資金的機會，再解釋服務差距',
    '先判定乙城居民缺乏動機，不檢查訓練制度與資金渠道',
    '只比較兩城目前醫院規模，不追查形成差距的訓練條件',
    '只補一筆短期資金，不問制度是否讓乙城持續培訓人員',
  ],['把可持續提供服務的條件視為原因，再推到結果。','先責怪居民，未核查可取得的制度與訓練條件。','醫院規模是現況，未解釋差距的根本來源。','短期資金有幫助，但沒有分析持續培訓的制度條件。'],[1,3],'原文把差距根源放在教育、制度、科技與投資的取得機會，而非把現況當成原因。'),
  transfer('一個農業區只出售原料，鄰區則有加工設備、設計人員和品牌渠道。','哪項最合理解釋兩區收益可能不同？',[
    '後者能把原料做成價值較高的產品，因而可能保留更多收入',
    '前者出售更多原料便可保證收入較高，不需比較加工能力',
    '把兩區收入差距全歸於人口數，不看設計和品牌渠道',
    '只看農產品售價，不分析加工後可增加的整體產品價值',
  ],['按「生產能力→較高價值產出→收入」推理，並保留可能性。','原料數量可能影響收入，但不能保證勝過設計加工帶來的附加值。','人口數不能代替加工、設計與品牌渠道的分析。','售價重要，但漏了加工如何提升產品價值。'],[4,5],'原文對照富國的高價值商品服務與窮國的原料、低薪勞動依賴。'),
  transfer('一個地區稅收不足，難以維修道路和訓練工人；企業因此更少投資，下一年稅收又偏低。','哪項概括保留了原文的完整因果鏈？',[
    '低稅收限制公共投資，投資不足又削弱下一輪吸引企業的能力',
    '低稅收影響道路維修，但與企業下一輪投資和稅收無關',
    '只描述企業今年少投資，不分析道路與培訓怎樣影響決定',
    '把低稅收當成最終結果，不問公共投資如何回過頭影響企業',
  ],['同時保留當前限制與下一輪反饋，呈現惡性循環。','只說第一段影響，漏了企業投資與下一年稅收的循環。','只看當年投資，未分析公共條件如何影響投資決定。','只把稅收當結果，漏了投資不足會反過來削弱企業吸引力。'],[6,7],'原文由較少收入和稅收推到基建困難，再推到更難發展的下一輪。'),
  transfer('一個跨區教育計畫既有不公平入學規則，也有地方學校資金使用不透明。','哪組方案最符合範文的兩層解方？',[
    '跨區改入學規則，地方學校亦公開資金並改進教學',
    '只改跨區入學規則，不查地方學校如何使用教學資金',
    '只改善地方學校教學，不移除不公平的跨區入學門檻',
    '先取消跨區計畫，再觀察兩類障礙是否自行消失',
  ],['外部規則與內部治理並行，分別對應兩個已知障礙。','只修跨區規則，地方學校資金不透明仍在。','只修地方教學，跨區入學的不公平門檻仍在。','取消計畫沒有直接解決兩種已知障礙。'],[8,9,11],'原文同時要求國際貿易與債務改革，以及貧困國家改善透明度和投資。'),
  transfer('某社區獲得培訓經費；計畫可以只反覆發現金，也可以建教室、訓練導師和提供實習。','哪項最像範文所說的「踏腳石」？',[
    '以經費建立訓練與實習能力，讓居民日後能靠自身技能工作',
    '把經費主要用於短期現金補助，日後再另找訓練來源',
    '先建教室但不培訓本地導師，讓居民自行尋找工作渠道',
    '只安排一次實習活動，不建立持續課程或本地小企連結',
  ],['投資可持續能力，使援助成為通往自主的起步。','現金可緩解短期困難，卻未建立居民可依靠的技能。','教室本身不足以提供導師與實際工作路徑。','單次實習缺乏持續訓練和企業連結。'],[10,12,13],'原文說定向投資應給予成長工具；職訓與小企讓工作轉型，使援助成為踏腳石。'),
  transfer('兩地都得到同額公共投資；甲地公開採購並追查貪污，乙地不公開支出也不查用途。','哪項推論符合範文的國內治理主張？',[
    '同額資金也要公開用途及防貪，才能有效投資',
    '同額投資就足以保證效果相同，不須公開採購用途',
    '只公開總金額，不追查採購或資金最終去向',
    '先增加投資金額，不處理地方貪污或支出不透明',
  ],['資金投入與治理品質須一起考慮，不能把金額當成果。','同額投資仍可能因資金使用方式不同而成效不同。','只公開總額不能證明採購過程和最終用途清楚。','增加金額未處理支出不透明與貪污。'],[11],'原文指出貧困國家政府必須加強透明度、減少貪污並妥善投資公共資金。'),
  transfer('某鎮的居民多從事不穩定零工；計畫提供技術訓練，並幫小型企業聘用受訓者。','哪項結果最貼近範文的具體例子？',[
    '工人可由不穩定零工轉向較有技能、較能創造價值的工作',
    '先統計受訓者數量，不檢查他們能否取得穩定工作',
    '只補助小企招聘，不提供居民轉向技能工作的訓練',
    '只培訓居民，不協助小型企業提供合適的就業機會',
  ],['保留訓練、小企與工作轉型三個相連環節。','受訓人數不等於真正得到較穩定的技能工作。','招聘補助有用，但未幫居民取得所需技能。','只培訓而沒有企業職位連結，轉職機會可能不足。'],[12],'原文以職業培訓和本地小企說明工人如何由非正式工作轉向更具生產力的職位。'),
  transfer('一個公共衛生計畫有兩種提案：短期派發藥物，或同時訓練本地護理員並改善診所。','若要把援助變成可持續的起步，哪項判斷最準確？',[
    '短期供藥解急需，亦要建立本地人手與診所能力',
    '先派藥物滿足急需，等外援結束後再考慮診所人手',
    '只訓練護理員，不改善診所能否提供持續服務',
    '只改善診所建築，不建立本地人員的醫療能力',
  ],['承認眼前需要，同時建立能持續提供服務的本地能力。','短期派藥有即時價值，但缺了外援停止後的本地能力。','培訓護理員需要配合可持續運作的診所。','建築改善有用，但仍缺本地護理人員。'],[9,10,13],'原文把定向醫療和基建投資視為建立成長工具，而不是永久依賴援助。'),
  transfer('某地想縮小長期收入差距；報告已分析教育與技術機會不均，現在需要寫最後兩句。','哪組結尾最忠於範文的成因與解方次序？',[
    '總結機會差距的成因，提出公平規則投資及治理',
    '只概括教育差距，不處理技術機會或地方治理問題',
    '只列公平規則，不說投資與治理怎樣落實改善',
    '只重述收入差距，再提出未分析的單一短期補助',
  ],['結尾依題目兩問收束：先原因，後方案。','只回扣教育，漏了已分析的技術與治理成因。','只列規則，缺少投資及治理的完整解方。','重述問題並提出單一補助，未總結成因與相配措施。'],[14,15],'範文結尾先概括教育、科技、資本與制度取得不均，再歸納全球規則、投資與治理。'),
];
export default {key:'cause-solution:3',meta:{topic:'富國與窮國的財富差距',summary:'差距來自取得教育、制度、科技和投資的機會不均；國際規則與國內治理須同時改善。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
