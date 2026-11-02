import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:84'].map(x=>x.english);
const simple=[
'Many governments spend a lot of public money on projects looking for life outside Earth.',
'I fully agree that this is a poor use of tax money because governments must first deal with people’s urgent problems, and private groups can also carry out this research.',
'The clearest reason is that government money is limited, so it should first help people whose basic needs are not met.',
'In many places, hospitals are too full, schools need more supplies, and poorer families have trouble paying for homes and food.',
'When a government spends a lot of money looking for life from another planet, it puts a faraway possibility before suffering people can see now.',
'This is hard to support because public services are basic needs, not extra treats; they help society stay strong.',
'For example, money for medical tools, mental-health care, or country schools may help people within a few years, while looking for life beyond Earth may not give useful results for a very long time.',
'Government money should not look to the stars while people at home still lack help.',
'Another reason is that finding life on other planets is an interesting question for scientists, not a main duty of government.',
'Space science can lead to new ideas, but finding alien life in particular should not come before problems such as poverty, illness, and lack of jobs.',
'If large technology companies, universities, or international research groups want to study this question, they may be better able to handle years of uncertain results without failing public duties.',
'But governments are chosen to provide safety, chances to succeed, and basic help.',
'Money used for uncertain projects cannot at the same time make health care easier to get, schools fairer, or cities safer.',
'In short, I fully agree that governments should spend less on looking for life on other planets and use that money for public problems.',
'Being curious is good, but governments must first help people at home before looking for life in the sky.',
];
const vocabulary=[
[['devote substantial public funds','spend a lot of public money','投放大量公帑'],['programmes','projects','計劃'],['beyond Earth','outside Earth','地球以外']],
[['completely agree','fully agree','完全同意'],['unjustifiable use','poor use','不合理用途'],['taxpayers’ money','tax money','納稅人金錢'],['immediate duty','must first','即時責任'],['pursued by private organisations','private groups can also carry out','由私人機構進行']],
[['public money is limited','government money is limited','公帑有限'],['basic needs are still unmet','basic needs are not met','基本需要未滿足']],
[['overcrowded','too full','過度擠迫'],['lack resources','need more supplies','缺乏資源'],['low-income families','poorer families','低收入家庭'],['struggle with housing and food','have trouble paying for homes and food','住房食物困難']],
[['huge sums','a lot of money','巨額資金'],['detect alien life','looking for life from another planet','探測外星生命'],['distant possibility','faraway possibility','遙遠可能'],['visible suffering','suffering people can see now','眼前痛苦']],
[['hard to defend','hard to support','難以辯護'],['public services are not luxuries','public services are basic needs, not extra treats','公共服務非奢侈'],['foundation of a stable society','help society stay strong','穩定社會基礎']],
[['directed towards','for','投放於'],['medical equipment','medical tools','醫療設備'],['mental-health support','mental-health care','精神健康支援'],['rural schools','country schools','鄉村學校'],['extraterrestrial life','life beyond Earth','地球外生命'],['no practical benefit for generations','not give useful results for a very long time','幾代無實際利益']],
[['Government budgets','Government money','政府預算'],['chase stars','look to the stars','追逐星辰'],['ordinary citizens','people at home','普通市民'],['left in the dark','still lack help','仍被留在黑暗']],
[['discovering life on other planets','finding life on other planets','發現其他星球生命'],['scientific curiosity','interesting question for scientists','科學好奇'],['core governmental responsibility','main duty of government','政府核心責任']],
[['Granted','Space science can','誠然'],['inspire innovation','lead to new ideas','激發創新'],['specific goal','in particular','具體目標'],['priority over poverty, disease, and unemployment','come before problems such as poverty, illness, and lack of jobs','比公共問題優先']],
[['wealthy technology companies','large technology companies','富有科技公司'],['international research bodies','international research groups','國際研究機構'],['better placed','better able','更適合'],['long-term uncertainty','years of uncertain results','長期不確定'],['neglecting public duties','failing public duties','忽略公共責任']],
[['by contrast','But','相比之下'],['elected','chosen','被選出'],['security, opportunity, and basic welfare','safety, chances to succeed, and basic help','安全機會基本福利']],
[['speculative missions','uncertain projects','投機性任務'],['healthcare more accessible','health care easier to get','醫療更易取得'],['education more equal','schools fairer','教育更平等'],['cities safer','cities safer','城市更安全']],
[['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['reduce spending','spend less','減少開支'],['redirect those funds','use that money','重新分配資金']],
[['Curiosity is valuable','Being curious is good','好奇有價值'],['public responsibility','governments','公共責任'],['come first','must first','先行'],['repair the ground beneath its people’s feet','help people at home','先修補人民腳下土地']],
];
const chunkOverrides={7:['Government budgets should not chase stars','while ordinary citizens are left in the dark.'],8:['Another reason is that discovering life on other planets','is a scientific curiosity rather than a core governmental responsibility.'],11:['Governments, by contrast, are elected','to provide security, opportunity, and basic welfare.']};
const simpleChunkOverrides={7:['Government money should not look to the stars','while people at home still lack help.'],8:['Another reason is that finding life on other planets','is an interesting question for scientists, not a main duty of government.'],11:['But governments are chosen','to provide safety, chances to succeed, and basic help.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'比較預算有限、公共責任與替代執行者的關係。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Many governments','substantial public funds','programmes that search for life beyond Earth'],['Many cities','substantial public funds','programmes that build new sports venues'],'引言先交代有爭議的公帑用途。','討論政府支出優先次序時，先明確指出資金去向。',[1,2,3]),
makeStructure(1,['this','governments','human problems','private organisations','the state'],['funding a speculative research project','public authorities','urgent housing needs','private research foundations','the public sector'],'表態反對並列即時責任與替代執行者。','反對政府承擔某項開支時，給出優先與分工兩個理由。',[0,2,10]),
makeStructure(2,['public money','citizens','basic needs'],['the local budget','residents','essential needs'],'以資源有限推導先滿足基本需要。','預算有限，須建立公共支出優先原則時。',[1,3,4]),
makeStructure(3,['hospitals','schools','low-income families','housing and food'],['clinics','public schools','low-income families','transport and rent'],'列具體公共需求，避免只說「人民有問題」。','指出多個可見的急迫需求作預算對照時。',[2,4,6]),
makeStructure(4,['a government','huge sums','alien life','a distant possibility','visible suffering'],['a national government','large sums','a rare astronomical signal','a distant possibility','present hardship'],'以遠期可能對照眼前苦難，形成價值判斷。','評估一筆公帑時，需比較回報時間與目前需求。',[2,3,5]),
makeStructure(5,['This choice','public services','luxuries','the foundation of a stable society'],['That choice','essential public services','optional extras','the foundation of a healthy community'],'強調公共服務是基本基礎，不是額外享受。','有人把必需公共服務當成可延後項目時。',[2,4,6]),
makeStructure(6,['medical equipment, mental-health support, or rural schools','lives within years','the search for extraterrestrial life','no practical benefit for generations'],['water systems, health clinics, or local schools','lives within years','a distant prestige project','no practical benefit for generations'],'用具體近程利益對照遠期不確定成果。','要比較兩類公共投資的時限與受益者時。',[3,4,7]),
makeStructure(7,['Government budgets','stars','ordinary citizens','the dark'],['City budgets','prestige','local families','the dark'],'用形象比喻收束優先次序。','已列眼前未滿足需求，段末以簡短比喻重申時。',[4,5,6]),
makeStructure(8,['discovering life on other planets','a scientific curiosity','a core governmental responsibility'],['building a private art collection','a cultural interest','a core governmental responsibility'],'第二段由優先次序轉到誰應承擔研究。','已說明資金有限，接著區分政府核心職責與其他活動時。',[9,10,11]),
makeStructure(9,['space science','innovation','the specific goal of finding alien life','poverty, disease, and unemployment'],['arts research','new ideas','the specific goal of buying a prestige collection','housing, disease, and unemployment'],'讓步承認整個領域有價值，否定其中一個目標的優先性。','避免把反對特定項目寫成反對整個研究領域時。',[8,10,12]),
makeStructure(10,['wealthy technology companies, universities, or international research bodies','this question','long-term uncertainty','public duties'],['private foundations, universities, or research consortia','that question','long-term uncertainty','public duties'],'提出可承擔長期不確定性的替代執行者。','不是要終止探索，而是論證可由其他機構承擔時。',[1,8,11]),
makeStructure(11,['Governments','security, opportunity, and basic welfare'],['City councils','safety, opportunity, and essential services'],'對照私人研究者，明確政府授權任務。','評估機構是否適合承擔某事，先界定其職責時。',[8,10,12]),
makeStructure(12,['speculative missions','healthcare more accessible, education more equal, or cities safer'],['low-priority prestige projects','hospitals better equipped, schools more inclusive, or streets safer'],'用每元機會成本指出被放棄的公共利益。','預算有限，要說明資金轉用的具體代價時。',[2,6,11]),
makeStructure(13,['the search for life on other planets','public problems'],['a low-priority prestige project','urgent public needs'],'結論提出減少特定開支及轉投公共問題。','全文比較優先次序後，清楚給出預算重分配方案時。',[1,12,14]),
makeStructure(14,['Curiosity','public responsibility','a government','the ground beneath its people’s feet','life in the sky'],['Innovation','public responsibility','a city council','the roads beneath its residents’ feet','a distant showpiece'],'承認好奇心價值，仍以當前公共責任作優先。','結尾保留低優先目標的價值，同時重申先後次序時。',[4,7,13]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'按原文推進次序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者是否支持政府繼續大量資助尋找外星生命？',['完全反對；應優先處理民生，探索可由其他機構做','完全支持；醫院學校均無資金需要','沒有立場；只描述太空電影','反對全部太空科學，不承認任何創新'],'作者反對的是特定尋找外星生命項目的公帑優先權。'),{type:'multi',prompt:'選出兩段主體不同理由',detail:'選兩項，再按「確認」。',options:['公帑有限，醫療、教育、住食等眼前需要更急迫','尋找外星生命非政府核心職責，可由其他研究機構探索','任何私人機構都絕不能研究太空','所有太空科學研究都沒有任何價值'],correct:[0,1],why:'主體一談預算優先，主體二談政府與其他機構分工。'}];
const route=[sequence('排好全文四段',[['引言 · 立場和兩理由','反對以大量公帑尋找外星生命；優先民生與機構分工。'],['主體一 · 有限資源','醫院、學校、低收入家庭需要眼前支援。'],['主體二 · 公共責任','承認太空創新，仍由其他機構承擔不確定探索。'],['結論 · 重分配','減少特定項目開支，轉投公共問題。']],'有限預算 → 急迫民生 → 誰承擔探索 → 政策結論。')];
const evidence=[Q('作者列哪些眼前公共需求？',['擠迫醫院、資源不足學校及住食困難家庭','只有觀測外星人消息','只有太空旅行票價','只有企業品牌設計'],'原文列醫療、教育、住食。'),Q('作者承認哪一點？',['太空科學可激發創新','尋找外星生命必然毫無學術意義','所有私人研究都比醫療更急迫','研究成果一定在一年內出現'],'讓步只認可 space science can inspire innovation。'),Q('誰可能承擔長期不確定的研究？',['科技公司、大學與國際研究機構','只有急症室與鄉村學校','只有低收入家庭','只有城市交通警察'],'原文列三類替代執行者。'),Q('政府被選出來提供甚麼？',['安全、機會及基本福利','只為探索太空奇聞','只替私人企業投資','只管理娛樂節目'],'原文明示 core duty。')];
const logic=[sequence('主體一：為何公帑要先顧民生？',[['原則','資金有限，基本需要應優先。'],['現況','醫院擠迫、學校缺資源、家庭住食困難。'],['對比','遠期不確定探索與眼前可見痛苦。'],['時間例子','醫療等投資數年可見成果，外星搜尋或幾代無實益。'],['比喻總結','普通人仍在黑暗，不應只追逐星辰。']],'有限預算 → 已知需要 → 機會成本。'),sequence('主體二：誰應承擔長期探索？',[['區分','太空科學可創新，特定外星搜尋未必優先。'],['替代者','私人科技公司、大學、國際研究組織。'],['分工理由','它們可承擔長期不確定，政府有公眾職責。'],['機會成本','每元探索資金不可同時改善醫療教育安全。']],'承認研究價值 → 其他執行者 → 政府核心責任。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('城市預算有限，醫院床位不足，同時有人要求興建昂貴地標。','文章會先比較甚麼？',['先比較眼前需要與遠期利益的優先次序','地標外形是否足夠吸引外地遊客拍照','醫院與地標可否使用相同建築材料','有沒有企業願意設計地標的宣傳標語'],['有限預算先顧基本。','非核心準則。','與優先無關。','亦非核心。'],[2,3,4,5,6],'limited public money; basic needs first'),
T('有人說反對公帑尋找外星生命等於反對所有太空科學。','哪項修正最準確？',['承認太空科學可創新，只質疑外星搜尋優先','作者主張任何科技探索都應立刻全面停止','作者認為私人機構不應接觸任何研究','作者說所有公共問題都已完全解決'],['特定目標與整體領域有別。','未全面反對。','私人可承擔。','公共問題仍在。'],[8,9,10],'space science can inspire innovation; specific goal no priority'),
T('私人研究機構願以自有資金承擔多年不確定的項目。','這如何配合作者分工？',['可由非政府機構探索，公帑先履行基本職責','只要研究私營，醫療開支便可完全取消','政府必須同時資助所有私人研究計劃','私人資金存在，就證明研究必然有結果'],['其他機構可承擔風險。','醫療仍重要。','非所有項目。','結果仍不確定。'],[1,8,10,11],'private bodies accept long-term uncertainty'),
T('政府把一筆預算投向不確定計劃，便無法用它改善鄉村學校。','這呈現哪個概念？',['每筆公共開支都有放棄其他用途的機會成本','只要有學校，任何研究就永遠沒有價值','資金一旦分配，學校便不再需要其他服務','不確定計劃會立刻修好全部鄉村學校'],['每元不能用兩次。','未否定研究。','仍需服務。','用途不同。'],[6,12],'every dollar spent is a dollar not spent elsewhere'),
T('某科學項目可能幾十年後才見成效，現在居民急需醫療。','作者會怎樣排序？',['公帑優先處理眼前急需，再考慮遠期探索','只要結果可能有趣，就應立即停掉醫療','任何長期研究都不得由任何人繼續進行','居民有醫療需要，就能保證科研毫無成果'],['時間與責任排序。','與原文相反。','私人可探索。','非零成果。'],[2,4,6,9],'within years versus no benefit for generations'),
T('一項研究有學術好奇心價值，但非民選政府的核心任務。','哪項分工較吻合文章？',['先讓政府履行基本福利，另讓研究機構探索','政府必須放棄所有安全與教育方面責任','學術好奇有價值，便自動高於所有民生','研究有不確定性，就不可能由任何人做'],['可分工。','政府仍有職責。','不自動優先。','機構可承擔。'],[8,9,10,11],'scientific curiosity versus governmental duty'),
T('公眾仍缺基本住房，有人要求政府先資助昂貴的象徵工程。','比喻句會批評甚麼？',['追逐遠方光環，卻忽略腳下可見的困難','只要有象徵建築，住房就會自動增加','所有象徵工程都必然沒有文化價值','住房問題只能由私人家庭自行解決'],['追星與暗處市民對照。','無此保證。','未全盤否定。','政府有責任。'],[4,7,14],'chase stars while citizens left in dark'),
T('城市管理者先購置醫療設備，再研究遠期文化項目。','這遵守了哪個先後原則？',['有限資金應先保障尚未滿足的基本需求','文化項目一律犯法而不應有人研究','只要購買醫療設備，教育便不再重要','醫療設備投資一定令所有人立即痊癒'],['基本需求優先。','非全盤禁止。','教育亦重要。','不保證痊癒。'],[2,3,5,6],'public services are foundation'),
T('大學希望研究外星生命，但地方醫院正缺護士。','作者最可能支持哪項安排？',['大學可探索，政府先把公帑投向迫切服務','醫院缺護士，所有大學必須停止研究','有大學願研究，政府便不必支持醫院','研究若由大學進行，就必然無需任何資金'],['機構分工。','非全禁研究。','政府仍有責。','仍需資金。'],[9,10,11],'universities better placed; governments elected for welfare'),
T('有人說政府可同時投入兩項計劃，不必比較用途。','文章會提醒甚麼？',['公共預算有限，選一用途便放棄另一用途','只要支出兩項，公帑就會自動增加','醫院與學校都不需要政府進行投資','有長期項目就表示民眾不再受苦'],['有限預算及機會成本。','不會自增。','仍有需求。','苦難仍在。'],[2,12],'public money limited; every dollar has alternative use'),
T('要準確概括作者對科研的看法。','哪項最合適？',['承認探索有價值，但民選政府應先顧民生','否定全部科研，認為私人也不應探索','相信每項探索都必然立即改善醫療','認為只有外星生命研究才算政府責任'],['承認價值與優先。','私人可研究。','不保證。','正相反。'],[9,10,11,14],'curiosity valuable; public responsibility first'),
T('題目問是否同意政府浪費錢，應轉投公共問題。','作者的完整立場是甚麼？',['完全同意減少特定外星搜尋開支，轉投民生','完全反對，認為公共問題都無須公帑','只部分同意，因醫療教育均非政府職責','沒有表態，只描述科技企業研究方式'],['結論直接重申。','與原文相反。','政府有職責。','立場明確。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14],'reduce search spending; redirect to public problems'),
];
const plausibleAlternatives=[
  [['先比較醫院與地標的施工時間，再決定用途','先看地標可帶來多少拍照人次與曝光','先確認醫院需求，再用餘款承擔地標成本'],['施工時間不足以決定公共資源優先次序。','流量不能直接勝過迫切醫療需求。','須比較需要與利益，而非先預設建地標。']],
  [['承認太空科學可創新，因而優先搜尋外星','質疑特定搜尋預算，進一步停掉基礎科學','探索有價值，民生需求可待成果出現後處理'],['承認創新不等於優先使用公帑搜尋。','作者沒有否定整體科技研究。','遠期成果不能代替眼前公共服務。']],
  [['私人機構可探索，政府仍須配對相關研究資金','私人研究有不確定性，公帑宜先補貼風險','非政府機構願投入，民生責任可交由捐款'],['分工不要求政府共同資助每個計劃。','作者主張公帑優先用於基本服務。','政府仍負有民生與福利職責。']],
  [['學校可改善，但不確定研究更能吸引外地人','公共資金可分配，鄉村學校需求較易延後','研究有遠期價值，故學校改善不算成本'],['外地吸引力不能抹去學校機會成本。','被放棄的學校用途正是機會成本。','任何轉投都意味另一項用途須等待。']],
  [['公帑先資助長期探索，醫療可待成果轉化','醫療有需要，但科研應由政府全面退出','可先改善醫療，再停止研究機構的遠期探索'],['居民的當前醫療需求更迫切。','文章容許其他機構繼續探索。','排序公帑用途不要求停止外部研究。']],
  [['政府可履行福利，研究機構則需等公帑批准','學術好奇有價值，政府應先於住房投資','非政府機構能探索，政府可暫緩基本福利'],['非政府探索不必以公帑為先決條件。','研究價值與政府核心責任要分開判斷。','私人承擔科研不能減少政府民生義務。']],
  [['追逐遠期利益，但可把住房問題留待市場','象徵工程可吸引投資，基本住房可稍後處理','住房仍未解決，政府宜先宣傳象徵工程'],['把眼前困難交由市場未回應公帑優先問題。','可能利益未必應先於迫切住房。','宣傳不能代替解決可見的基本需要。']],
  [['有限資金應先完成遠期文化項目的設計','醫療優先後，其他基本服務便可延後','基本需求重要，文化項目應由政府永不資助'],['設計遠期項目仍須與眼前需要比較。','基本需要不只醫療，也包括其他服務。','先後排序不等於永久排除文化項目。']],
  [['大學可探索，政府應先資助研究設備','政府應補助兩者，護士不足可由醫院處理','大學自籌研究後，政府可減少醫院投入'],['醫院缺護士是迫切公共服務需要。','有限公帑仍須作優先排序。','研究分工不能成為削減醫院支援的理由。']],
  [['兩項都值得投入，醫院可自行尋找餘款','公共預算有限，便應先比較項目知名度','政府若分拆預算，機會成本便會減少'],['把民生需求交給醫院未解決財政取捨。','知名度不是公共利益的唯一準則。','分拆預算仍可能推遲迫切服務。']],
  [['探索有價值，政府因此應優先資助搜尋','民生重要，太空科學則不值得其他機構做','科研可帶來創新，政府民生職責可稍後履行'],['認可科研不等於公帑優先投入特定搜尋。','文章容許大學與私人機構探索。','迫切服務不能等候不確定的科研成果。']],
  [['大致同意轉投民生，但要停止其他太空研究','支持科研創新，故維持特定搜尋的公帑優先','同意民生有需要，但外星搜尋也屬基本福利'],['作者只質疑特定公帑用途，非整體研究。','忽略了有限預算與眼前迫切服務。','外星搜尋不是政府基本福利職責。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:84',meta:{topic:'政府應否資助尋找外星生命',summary:'作者完全同意政府應減少尋找外星生命的開支並轉投民生。公共資金有限，醫療、學校及低收入家庭有眼前需要；特定外星搜尋或多年無實際收益。作者承認太空科學可促創新，但尋找外星生命非政府核心責任；科技企業、大學和研究機構可承擔長期不確定性。政府須先履行安全、機會和基本福利職責。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
