import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:81'].map(x=>x.english);
const simple=[
'For a long time, marriage has meant love and family, but also financial safety.',
'But in many places, women now have many more chances to study and work for money.',
'I fully agree that being able to support themselves is the main reason many women no longer see marriage as something they must do.',
'The clearest reason is that earning money lets women pay for what they need without relying on a husband.',
'In the past, women who had difficulty owning a home, finding a well-paid job, or raising children alone often had to see marriage as a way to stay safe.',
'But a woman with a steady income can pay rent and bills, save money, and decide about her life for herself.',
'For example, a woman with a professional job in a big city may marry later or not marry because her work already gives her the safety marriage once provided.',
'So money gives more than a comfortable life; it gives freedom to choose.',
'Earning her own money also changes what a woman expects from a relationship.',
'If a woman does not need marriage to live safely, marriage needs to bring respect, equal treatment, and real support.',
'A woman who can pay her own way is less likely to stay in an unhappy or controlling marriage only because she cannot afford to leave.',
'This change makes people expect more from marriage: it becomes a free choice rather than a trap.',
'For example, many working women would choose to stay single instead of joining a relationship where they must do most housework, give up career chances, and care for everyone’s feelings.',
'In short, I fully agree that women earning their own money is the main reason marriage seems less necessary in many places.',
'As fewer women need a partner for money, marriage is less about financial safety and must be based on love, respect, and equal treatment.',
];
const vocabulary=[
[['has long been associated','For a long time','長久關聯'],['economic protection','financial safety','經濟保障'],['not only with love and family life','love and family','愛情和家庭']],
[['however','But','然而'],['far greater access to education and paid work','many more chances to study and work for money','更多教育工作機會']],
[['completely agree','fully agree','完全同意'],['financial independence','being able to support themselves','經濟獨立'],['main reason','main reason','主要原因'],['regard marriage as a necessity','see marriage as something they must do','視婚姻為必要']],
[['earning an income','earning money','賺取收入'],['meet their basic needs','pay for what they need','滿足基本需要'],['without depending on a husband','without relying on a husband','不依靠丈夫']],
[['own property','owning a home','擁有財產'],['enter well-paid employment','finding a well-paid job','高薪工作'],['support children alone','raising children alone','獨自養孩子'],['little choice','had to','選擇有限'],['safety net','way to stay safe','安全網']],
[['By contrast','But','相比之下'],['stable salary','steady income','穩定薪水'],['rent a home, pay bills, save for the future','pay rent and bills, save money','租屋付帳儲蓄'],['on her own terms','for herself','按自己條件']],
[['professional woman','woman with a professional job','專業女性'],['postpone or reject marriage','marry later or not marry','推遲或拒絕婚姻'],['security that marriage once promised','safety marriage once provided','過去婚姻承諾的安全']],
[['In this sense','So','從此意義'],['does not simply buy comfort','gives more than a comfortable life','不只買舒適'],['it buys freedom','it gives freedom to choose','買到自由']],
[['Financial independence','Earning her own money','經濟獨立'],['judge relationships','expects from a relationship','判斷關係']],
[['no longer required for survival','does not need marriage to live safely','不再是生存必需'],['emotional respect, equality and genuine companionship','respect, equal treatment, and real support','尊重平等陪伴']],
[['support herself','pay her own way','養活自己'],['less likely to tolerate','less likely to stay','較少忍受'],['controlling or unhappy marriage','unhappy or controlling marriage','控制或不快樂婚姻'],['financially impossible','cannot afford','經濟上不可能']],
[['This shift','This change','這種轉變'],['raises the standard','makes people expect more','提高標準'],['choice rather than a cage','free choice rather than a trap','選擇而非牢籠']],
[['For instance','For example','例如'],['remain single','stay single','保持單身'],['domestic responsibilities','housework','家務責任'],['career sacrifice','give up career chances','事業犧牲'],['emotional labour','care for everyone’s feelings','情感勞動']],
[['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['ability to earn their own income','earning their own money','賺取收入能力'],['key reason','main reason','關鍵原因'],['feels less necessary','seems less necessary','較不必要']],
[['financial dependence fades','fewer women need a partner for money','經濟依賴減少'],['old function as economic protection','financial safety','舊有經濟保障功能'],['firmer ground','based on','更穩固基礎'],['love, respect and equality','love, respect, and equal treatment','愛尊重平等']],
];
const chunkOverrides={7:['In this sense, money does not simply buy comfort;','it buys freedom.'],8:['Financial independence also changes','how women judge relationships.'],11:['This shift raises the standard of marriage itself:','it becomes a choice rather than a cage.']};
const simpleChunkOverrides={7:['So money gives more than a comfortable life;','it gives freedom to choose.'],8:['Earning her own money also changes','what a woman expects from a relationship.'],11:['This change makes people expect more from marriage:','it becomes a free choice rather than a trap.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'按句中的比較、因果和條件判斷功能。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Marriage','love and family life','economic protection'],['Higher education','personal growth','better job prospects'],'引言指出同一制度同時有情感與實際功能。','某制度有多種功能，需先交代討論焦點時。',[1,2,3]),
makeStructure(1,['women','education and paid work'],['young adults','training and paid work'],'用然而轉入改變舊條件的新發展。','先述過去功能，接著指出社會條件已改變時。',[0,2,3]),
makeStructure(2,['this financial independence','many women','marriage'],['this wider access to stable work','many young adults','family support'],'明示完全同意並指出所認同的主要原因。','題目問某變化的主因，作者確定立場時。',[1,3,8]),
makeStructure(3,['earning an income','women','their basic needs','a husband'],['holding a stable job','young adults','their basic needs','their parents'],'先說明收入如何減少對別人的經濟依賴。','論證經濟能力帶來自主時，從基本生活需要開始。',[4,5,7]),
makeStructure(4,['a woman','own property, enter well-paid employment or support children alone','marriage','a safety net'],['a young worker','save money, find stable work or rent a home alone','family support','a safety net'],'以過去選擇有限說明原有安排的保障功能。','比較今昔時，先解釋舊制度何以曾是必要選擇。',[3,5,6]),
makeStructure(5,['a woman with a stable salary','rent a home, pay bills, save for the future and make major life decisions'],['a graduate with a secure job','pay rent, meet expenses, save for training and make career decisions'],'與過去對照，列出收入帶來的具體自主行動。','抽象談獨立後，用生活開支與決策舉證時。',[3,4,6]),
makeStructure(6,['a professional woman in a large city','marriage','her career','the security that marriage once promised'],['a young worker with a stable income','financial help from relatives','her job','the security that family assistance once promised'],'例子顯示新資源可提供舊安排的保障。','要證明原本必要的選擇可能變成可選時。',[4,5,7]),
makeStructure(7,['money','comfort','freedom'],['a scholarship','textbooks','career choice'],'用「不只是……而是……」概括自主的深層意義。','已列具體實益，要提升到更深層的價值時。',[3,5,6]),
makeStructure(8,['Financial independence','women','relationships'],['A stable income','young adults','living arrangements'],'第二段由基本生存轉到對關係質素的判斷。','同一條件除了改變資源，也改變選擇標準時。',[9,10,11]),
makeStructure(9,['marriage','emotional respect, equality and genuine companionship'],['a partnership','trust, fairness and genuine support'],'不再為生存所需時，關係須提供真正品質。','說明舊安排失去必要性後，要以質素吸引人時。',[8,10,11]),
makeStructure(10,['A woman who can support herself','a controlling or unhappy marriage','leaving','financially impossible'],['An employee with savings','an unfair or unsafe job','resigning','financially impossible'],'收入降低被迫留在不良關係的可能。','解釋退出選項如何減少被迫接受不公平安排時。',[8,9,11]),
makeStructure(11,['This shift','marriage','a choice rather than a cage'],['This change','employment','a choice rather than a trap'],'比喻概括選擇自由提高制度標準。','已分析新退出選項，需以短句概括權力轉變時。',[8,9,10]),
makeStructure(12,['many working women','a relationship','domestic responsibilities, career sacrifice and emotional labour','them'],['many financially independent people','a partnership','household duties, career sacrifices and emotional work','them'],'用不平等責任分配說明為何有人寧願不加入。','已說質素標準，需提供具體不平等條件時。',[9,10,11]),
makeStructure(13,['women’s ability to earn their own income','marriage','many countries'],['young adults’ access to stable work','family support','many cities'],'結論重申經濟獨立是主要原因，保留範圍。','結論需直接回答「多大程度同意某主因」時。',[2,8,14]),
makeStructure(14,['financial dependence','marriage','economic protection','love, respect and equality'],['exclusive access to information','a university','a gatekeeper of facts','research, dialogue and mentorship'],'以舊功能消退與新基礎作最後總結。','某安排不再為生存所必需，需指出其正當的新基礎時。',[9,11,13]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'按原文推進次序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者同意經濟獨立是很多女性覺得婚姻不再必要的主因嗎？',['完全同意；收入提供保障，也改變擇偶標準','完全反對；收入與選擇毫無關係','沒有立場；只列舉不同婚禮形式','部分反對；認為婚姻只有經濟用途'],'原文說 main/key reason for many women。'),{type:'multi',prompt:'選出兩段主體的不同機制',detail:'選兩項，再按「確認」。',options:['穩定收入能滿足生活需要，減少經濟依賴','不再依賴婚姻生存後，更重視尊重、平等與陪伴','所有女性都必然永遠不會結婚','經濟獨立令婚姻只能提供收入'],correct:[0,1],why:'一段是基本保障，另一段是關係標準。'}];
const route=[sequence('排好全文四段',[['引言 · 改變與立場','婚姻曾有保障功能；女性教育與就業機會增加。'],['主體一 · 經濟自主','收入支付生活需要，婚姻不再是唯一安全網。'],['主體二 · 關係標準','能養活自己，便不必為錢忍受不平等關係。'],['結論 · 新基礎','經濟依賴減少，婚姻須建立在愛、尊重和平等上。']],'保障功能 → 自主生活 → 關係品質 → 新基礎。')];
const evidence=[Q('過去哪些限制令婚姻像安全網？',['財產、好工作及獨自養孩子的機會不足','所有女性完全不想獲得工作','任何女性都不能與家人同住','婚姻只能提供短期娛樂'],'原文列財產、工作、養育三方面。'),Q('穩定薪水讓人具體能做甚麼？',['租屋、付帳、儲蓄與自行決策','保證任何關係永遠幸福','不需與任何人互相尊重','令社會所有生活成本消失'],'原文列四項生活與決策能力。'),Q('第二段認為婚姻應提供甚麼？',['情感尊重、平等及真誠陪伴','只提供一張房屋租約','只提供更高的工作職位','只提供免除所有家務'],'survival 不再必要後，質素成為關鍵。'),Q('為何有些女性寧願單身？',['不想承擔主要家務、事業犧牲及情感勞動','因為她們從來沒有任何工作','因為所有關係必然只有壞處','因為收入會令愛與尊重無用'],'例子針對責任不平等，並非否定所有關係。')];
const logic=[sequence('主體一：收入如何變成自由？',[['過去限制','財產、好工作及獨自養育選項有限。'],['婚姻舊功能','可成經濟安全網。'],['當今對照','穩定薪水可付生活開支、儲蓄及決策。'],['城市例子','事業已提供以往婚姻承諾的保障。'],['深層推論','金錢不只買舒適，也帶來選擇自由。']],'經濟限制 → 婚姻必要 → 收入自主 → 選擇。'),sequence('主體二：自主如何改變關係標準？',[['生存不再依賴婚姻','關係需有尊重、平等和真正陪伴。'],['退出選項','能養活自己，較少因錢而忍受不幸。'],['比喻','婚姻應是選擇，而非牢籠。'],['不平等例子','家務、事業犧牲與情感勞動不應單方承受。']],'有退出能力 → 可要求品質 → 自主選擇。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('一名員工有穩定收入與儲蓄，因此敢拒絕不合理合約。','可遷移哪項機制？',['經濟保障擴大退出選項與自主決定','收入一穩定，所有合約便必然公平','拒絕合約只表示員工不再需要工作','儲蓄越多，所有人際關係便會消失'],['安全感帶選擇。','不保證公平。','仍可能工作。','無此必然。'],[3,5,7,10],'financial security buys freedom'),
T('過去某人無法獨自租屋或養育孩子，只好依賴一段關係。','婚姻安全網比喻指甚麼？',['關係曾提供當事人難以自行取得的保障','婚姻只是一項完全沒有實用性的娛樂','獨立收入必然令所有關係立即破裂','每段關係都會同樣公平並尊重對方'],['舊有經濟功能。','確有保障功能。','無此必然。','不一定公平。'],[0,4,5],'marriage as a safety net'),
T('一名女性可自行支付房租及帳單，也可選擇是否結婚。','這最直接說明甚麼？',['生活費不必依賴配偶，婚姻因而可選擇','只要有收入，婚姻便永遠不會有感情','自行付房租等於拒絕所有家庭生活','收入增加必然消除每一項生活壓力'],['經濟自主是關鍵。','感情仍重要。','仍可有家庭。','不保證無壓力。'],[3,5,6,7],'rent home, pay bills, decide on own terms'),
T('某合作夥伴不再需要合夥關係才能維持生活。','文章邏輯會如何改變合作標準？',['可更重視尊重、公平與真誠支持','會完全停止關心合作夥伴的感受','只需考慮對方收入，不需考慮品質','既然能退出，就不必履行任何承諾'],['不依賴生存後重質素。','仍重視感受。','非只收入。','自由仍有責任。'],[8,9,11],'no longer required for survival; respect and equality'),
T('某人因無法負擔離職，只好忍受長期不公平工作。','最貼近哪個論點？',['經濟上無法退出，會削弱拒絕壞安排的能力','不公平工作必然使所有員工獲得高收入','無法離職表示員工完全滿意當前安排','只要有工作，任何人都不能提出改善要求'],['類比婚姻退出成本。','未必高收入。','可能被迫。','仍可要求。'],[10,11],'financially impossible to leave'),
T('一位有收入的城市女性延後婚姻，但仍重視親密關係。','哪項推論最準確？',['保障已可由事業提供，結婚時機便可自主','延後婚姻證明她完全不相信愛與尊重','只要有事業，任何人都必定終身單身','收入獨立表示她不再需要與人交往'],['可推遲非否定愛。','仍重視關係。','非必然單身。','仍可交往。'],[5,6,7,9],'career provides security marriage once promised'),
T('一段關係要求一方放棄事業並獨自做大部分家務。','第二段為何可能有人拒絕？',['責任與犧牲分配不平等，未達關係質素標準','任何人只要有工作，就必須拒絕所有家務','做家務代表關係必然沒有任何真誠感情','事業一旦重要，愛與陪伴便失去所有價值'],['例子指出單方負擔。','不是拒絕家務本身。','可有感情。','仍重視愛。'],[9,10,12],'domestic responsibilities and career sacrifice fall mainly on them'),
T('有人說有錢只會帶來舒適，與決定人生方向無關。','原文短句怎樣反駁？',['收入除了舒適，更帶來自由選擇的能力','收入越高，便越不可能作任何決定','舒適與自由在任何時候都完全相同','人生方向永遠只由婚姻制度單獨決定'],['money buys freedom。','與原文相反。','兩者有別。','非單一決定。'],[5,7],'not simply comfort; freedom'),
T('女性就業機會增加後，有人仍選擇結婚。','這與文章立場有矛盾嗎？',['沒有；婚姻可成自主選擇，而非經濟必需','有；文章說任何有收入女性都不得結婚','有；文章否定愛、尊重與陪伴的價值','沒有；因為收入獨立會取消所有家務'],['必要性下降≠禁止。','原文未如此說。','正重視這些。','未取消家務。'],[2,8,9,11,13,14],'choice rather than a cage'),
T('某制度原本提供基本生活保障，如今人們已有其他來源。','按結論，它要靠甚麼維持價值？',['提供超越經濟保障的尊重、公平與陪伴','只要求人們忘記已取得的新保障來源','加強依賴，使參與者失去退出能力','取消所有承諾，令制度不再有共同責任'],['新基礎是關係品質。','不能靠忘記。','與自主相反。','非取消責任。'],[9,11,14],'old economic role fades; new ground of respect'),
T('題目問收入是否許多女性不再覺得婚姻必要的主因。','作者答到甚麼程度？',['完全同意它是主要原因，但說的是許多女性','只部分同意，因為文章完全否定收入作用','完全同意所有女性都永遠不需要關係','沒有表態，只描寫城市工作的日常生活'],['main reason for many。','收入是核心。','不能擴大到所有人。','立場明確。'],[2,13],'completely agree; main reason for many women'),
T('要概括兩段主體的先後關係。','哪項最準確？',['先談收入帶來生活自主，再談關係品質','先談愛情無用，再談所有女性必須單身','先談婚姻只供娛樂，再談收入不重要','先談家務消失，再談任何關係都不需尊重'],['基本需求到關係標準。','非否定愛。','收入是主因。','責任仍在。'],[3,4,5,6,7,8,9,10,11,12],'basic security then standards of relationship'),
];
const plausibleAlternatives=[
  [['收入穩定後，便可較少審視合約是否合理','拒絕這份合約，主要顯示員工已轉換行業','儲蓄增加，便把人際支持列為較次要'],['收入帶來選擇，並不令合約自動公平。','退出一項安排不等於離開工作。','原文談自主，不是減少人際關係。']],
  [['把婚姻只看成情感選擇，略過舊有經濟功能','取得獨立收入後，先把離婚率當唯一指標','只檢查伴侶是否相愛，不問租屋養育條件'],['婚姻曾提供難以自行取得的保障。','收入帶來選擇，不能只從離婚率理解。','題目正指出生活條件的限制。']],
  [['能自行付帳，便先推斷婚姻的情感價值降低','付得起房租後，便把家庭生活列為次要選項','收入增加，便較少問伴侶是否公平分擔責任'],['經濟非必需不等於感情較不重要。','自主選擇仍可包含家庭。','文章第二段更重視關係品質。']],
  [['先比較雙方收入，把尊重與分工留待日後討論','有退出能力後，便把合作承諾看得較輕','優先看能否維持生計，較少問真誠支持'],['收入不是新標準的全部。','自由選擇仍可與責任並存。','不依賴生存後更可重視質素。']],
  [['先計算工作薪金，不查離職所需的生活儲備','無法離職，便把忍受工作當作滿意的線索','先要求員工改善效率，少問合約是否公平'],['薪金不足以說明退出能力。','留在關係或工作中可能出於不得已。','個人努力不能取代條件分析。']],
  [['延後婚姻後，便先推定她較不看重陪伴','事業提供保障後，便以單身率衡量人生選擇','只查收入來源，不問她想要的親密關係'],['延期不等於否定愛。','能選擇並不預定最後是否結婚。','作者重視尊重和陪伴。']],
  [['先查兩人收入差距，家務分工可稍後再談','先請一方減少工作，不問其意願與負擔','有感情便可先維持現狀，犧牲日後再分配'],['收入不能代替平等分工。','單方犧牲正是題目的問題。','真誠感情不等於安排已公平。']],
  [['收入帶來舒適，人生選擇主要交由伴侶決定','把舒適度提升，當作退出壞安排的充分條件','先討論婚姻制度，不查個人是否有收入可選'],['原文指出自主決策也是收入的作用。','舒適與退出能力不是同一回事。','個人資源是選擇能力的基礎。']],
  [['選擇結婚便表示收入沒有改變婚姻的功能','重視感情之餘，仍把婚姻當經濟必需','用是否結婚判定她有否真正的經濟自主'],['經濟自主和結婚可以並存。','必要性與感情價值是兩個層面。','結果相同，作決定的條件仍可能不同。']],
  [['先強調昔日保障功能，少查今日關係質素','以較難退出維持制度參與，不問是否公平','只降低經濟開支，不看尊重與陪伴是否存在'],['舊功能弱化後，需要新的價值依據。','依賴不是理想的關係基礎。','節省開支不足以回應第二段標準。']],
  [['把收入列作因素之一，較少分析其主要作用','從城市個案推定每位女性會作相同選擇','只描述薪金變化，不回答題目要求的立場'],['作者認為收入是許多人的主要原因。','許多不等於每位。','範文立場明確。']],
  [['先談關係品質，再把收入獨立當附帶背景','先討論婚姻感情，再略過過去生活保障','先談家務分工，不查經濟退出能力的變化'],['第一段先建立經濟自主的因果。','過去保障是理解轉變的起點。','兩段有從生計到關係標準的次序。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
transfer[3].options[0]='不再依賴合作維生，可更重視尊重與公平';
export default {key:'opinion:81',meta:{topic:'女性經濟獨立與婚姻必要性',summary:'作者完全同意經濟獨立是許多女性不再把婚姻視為必要的主要原因。過去財產、工作和獨自養育選項受限，婚姻可作安全網；穩定薪水如今讓人支付生活費、儲蓄並自行決策。經濟上有退出能力後，婚姻更須提供尊重、平等與真誠陪伴，而不應因財務依賴使人忍受不幸或單方負擔。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
