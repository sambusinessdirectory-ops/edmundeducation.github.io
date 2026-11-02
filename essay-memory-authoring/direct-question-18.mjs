// Human-authored support for Direct Question 18; exact essay text remains in the source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-18-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:18'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People cut down forests, build bigger cities and kill wild animals for money, so many animals lose the places where they once lived.',
  'I think we must protect animals, not just because we care about them, but because their lives help keep nature stable and support people too.',
  'We must protect animals first because they help keep nature in balance.',
  'If one kind of animal disappears, the problem often spreads through the food chain and harms the whole place where animals live.',
  'For example, if there are no animals that hunt other animals in a forest, smaller animals may increase too fast, eat too many plants and leave less food for other animals.',
  'So losing one kind of animal is not only a loss of that animal; it can damage a much bigger system of living things.',
  'Saving animals therefore helps protect the natural conditions that people need as well.',
  'There are several useful things we can do about this problem.',
  'Governments should make and use stronger rules for protected places, with tight limits on cutting trees, building and hunting there.',
  'But rules must really work: park workers need enough money, people who hunt illegally need serious punishments, and companies that damage animal homes must pay for the damage.',
  'Protecting animals will also work better if local people can take part and gain something from it.',
  'If people can earn money from nature trips, farming that does not harm the land or jobs that protect animals, they are less likely to think wild animals stop them from making a living.',
  'To sum up, protecting animals matters greatly because animals in danger are part of the natural system that keeps living things alive.',
  'The best answer is not one big action, but strong laws, careful use of land and help from local people together.',
];
const vocabulary=[
  [['forests are cleared','People cut down forests','森林被砍伐'],['cities expand','build bigger cities','城市擴張'],['wildlife is hunted for profit','kill wild animals for money','為利獵殺野生動物'],['species','animals','物種'],['being pushed out of the ecosystems that once sustained them','lose the places where they once lived','失去原來的生態棲所']],
  [['protecting animals is essential','we must protect animals','保護動物必要'],['not merely for sentimental reasons','not just because we care about them','不只因為情感'],['survival is tied to ecological stability','lives help keep nature stable','生存關乎生態穩定'],['human welfare','support people too','人類福祉']],
  [['animals must be protected','We must protect animals','動物必須受保護'],['form part of a delicate natural balance','help keep nature in balance','維持脆弱自然平衡']],
  [['one species disappears','one kind of animal disappears','一種動物消失'],['effect rarely stops there','problem often spreads','影響不止於此'],['ripple through the food chain','spreads through the food chain','沿食物鏈擴散'],['weaken an entire habitat','harms the whole place where animals live','削弱整個棲息地']],
  [['predators are removed','there are no animals that hunt other animals','捕食者消失'],['smaller animals may multiply too quickly','smaller animals may increase too fast','小動物過快繁殖'],['damage vegetation','eat too many plants','破壞植被'],['reduce the food available for other species','leave less food for other animals','減少其他物種食物']],
  [['extinction','losing one kind of animal','物種滅絕'],['loss of one creature','loss of that animal','失去一種生物'],['a crack in a much larger living system','damage a much bigger system of living things','更大生命系統受損']],
  [['Protecting animals','Saving animals','保護動物'],['preserve the environmental conditions','protect the natural conditions','維持環境條件'],['human beings also depend','people need as well','人類同樣依賴']],
  [['practical measures','useful things we can do','可行措施'],['address this problem','about this problem','處理問題']],
  [['create and enforce','make and use','制定並執行'],['stronger protected areas','stronger rules for protected places','更有力保護區'],['logging','cutting trees','伐木'],['strictly controlled','tight limits','嚴格限制']],
  [['more than words on paper','rules must really work','不能只停留紙上'],['rangers','park workers','護林員'],['proper funding','enough money','足夠資金'],['illegal hunters','people who hunt illegally','非法獵人'],['serious penalties','serious punishments','嚴厲懲罰'],['held financially responsible','must pay for the damage','承擔財務責任']],
  [['conservation','Protecting animals','保育'],['more effective','work better','更有效'],['local communities','local people','當地社區'],['given a real stake in it','take part and gain something from it','真正參與並受益']],
  [['earn income','earn money','獲得收入'],['eco-tourism','nature trips','生態旅遊'],['sustainable farming','farming that does not harm the land','可持續農業'],['conservation-related jobs','jobs that protect animals','保育工作'],['wildlife as an obstacle to survival','wild animals stop them from making a living','把野生動物視為生存障礙']],
  [['In conclusion','To sum up','總結'],['animal protection is highly important','protecting animals matters greatly','保護動物十分重要'],['endangered species','animals in danger','瀕危物種'],['natural foundation that supports life itself','natural system that keeps living things alive','支撐生命的自然基礎']],
  [['most effective response','best answer','最有效應對'],['not a single dramatic solution','not one big action','不是單一重大方案'],['strict legal protection','strong laws','嚴格法律保護'],['responsible land use','careful use of land','負責任使用土地'],['community involvement','help from local people','社區參與']],
];
const chunkOverrides=[
  ['As forests are cleared, cities expand,','and wildlife is hunted for profit,','many species are being pushed out of the ecosystems','that once sustained them.'],
  ['I believe protecting animals is essential,','not merely for sentimental reasons','but because their survival is tied to ecological stability','and, ultimately, human welfare.'],
  ['The first reason animals must be protected','is that they form part of a delicate natural balance.'],
  ['When one species disappears,','the effect rarely stops there;','it can ripple through the food chain','and weaken an entire habitat.'],
  ['For instance, if predators are removed from a forest,','smaller animals may multiply too quickly,','damage vegetation, and reduce the food available','for other species.'],
  ['In this sense, extinction is not just','the loss of one creature;','it is a crack in a much larger living system.'],
  ['Protecting animals therefore helps preserve','the environmental conditions on which human beings also depend.'],
  ['Several practical measures can be taken','to address this problem.'],
  ['Governments should first create and enforce stronger protected areas,','where logging, construction, and hunting are strictly controlled.'],
  ['Such laws, however, must be more than words on paper:','rangers need proper funding,','illegal hunters must face serious penalties,','and companies that destroy habitats','should be held financially responsible.'],
  ['At the same time, conservation will be more effective','if local communities are given a real stake in it.'],
  ['When people can earn income through eco-tourism,','sustainable farming, or conservation-related jobs,','they are less likely to see wildlife','as an obstacle to survival.'],
  ['In conclusion, animal protection is highly important','because endangered species are part of the natural foundation','that supports life itself.'],
  ['The most effective response is not a single dramatic solution,','but a combination of strict legal protection,','responsible land use, and community involvement.'],
];
const simpleChunkOverrides=[
  ['People cut down forests, build bigger cities','and kill wild animals for money,','so many animals lose the places','where they once lived.'],
  ['I think we must protect animals,','not just because we care about them,','but because their lives help keep nature stable','and support people too.'],
  ['We must protect animals first','because they help keep nature in balance.'],
  ['If one kind of animal disappears,','the problem often spreads through the food chain','and harms the whole place where animals live.'],
  ['For example, if there are no animals','that hunt other animals in a forest,','smaller animals may increase too fast,','eat too many plants and leave less food','for other animals.'],
  ['So losing one kind of animal','is not only a loss of that animal;','it can damage a much bigger system','of living things.'],
  ['Saving animals therefore helps protect','the natural conditions that people need as well.'],
  ['There are several useful things','we can do about this problem.'],
  ['Governments should make and use stronger rules','for protected places, with tight limits','on cutting trees, building and hunting there.'],
  ['But rules must really work:','park workers need enough money,','people who hunt illegally need serious punishments,','and companies that damage animal homes','must pay for the damage.'],
  ['Protecting animals will also work better','if local people can take part','and gain something from it.'],
  ['If people can earn money from nature trips,','farming that does not harm the land','or jobs that protect animals,','they are less likely to think wild animals','stop them from making a living.'],
  ['To sum up, protecting animals matters greatly','because animals in danger are part','of the natural system that keeps living things alive.'],
  ['The best answer is not one big action,','but strong laws, careful use of land','and help from local people together.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){
  const text=original[i],parts=[];let cursor=0,slot=0;
  for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}
  if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));
  return {formula,meaning,usage,parts};
}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('As old trees are cut down and roads expand, many birds are pushed out of places that once sheltered them.','用 As 連上多項人為壓力與動物失去棲地的結果',[1,2,8],
    fixed(0,'As [森林被清除], [城市擴張], and [野生動物被獵捕], many [物種] are being pushed out of [原有生態系統] that once sustained them.','開場把伐林、城市擴張和獵捕連成物種失去棲地的背景。','要交代環境問題的多個原因，並指出共同造成的後果時。',['As ', ', ', ', and ', ', many ', ' are being pushed out of ', ' that once sustained them.'],['森林清除','城市擴張','為利獵捕','受威脅的物種','失去的棲地'])),
  card('I believe saving wetlands is essential, not merely for their beauty but because they protect water and people.','用 not merely ... but because 把保護理由由情感推進到生態與人類利益',[0,5,12],
    fixed(1,'I believe [保護對象] is essential, not merely for [情感理由] but because [生存] is tied to [生態穩定] and, ultimately, [人類福祉].','立場明確：情感可以是理由，但生態與人類福祉提供更深的必要性。','題目問保護動物是否重要，須先給出立場及有說服力的根據時。',['I believe ', ' is essential, not merely for ', ' but because ', ' is tied to ', ' and, ultimately, '],['須保護的對象','情感上的理由','與生態相連的生存','依存的生態條件','最終受影響的人'])),
  card('The first reason mangroves must be protected is that they form part of a coastal balance.','用 The first reason ... is that 明確提出第一項保護理由',[1,3,7],
    fixed(2,'The first reason [動物] must be protected is that [牠們] form part of [脆弱的自然平衡].','第一主體段把「重要」落在動物與整體生態的關係上。','開始解釋保護動物的必要性，先提出可用例子支持的理由時。',['The first reason ', ' must be protected is that ', ' form part of '],['需保護的物種','參與平衡的同一群物種','所維持的自然系統'])),
  card('When one insect disappears, the effect rarely stops there; it can spread through the food chain and harm many birds.','用 When ...; it can ... 顯示單一物種消失後影響如何擴散',[2,4,6],
    fixed(3,'When [一種物種消失], the effect rarely stops there; it can [沿食物鏈擴散] and [削弱棲地].','指出物種消失不是孤立事件，而可能牽動其他生物與棲地。','已提出生態平衡論點，要解釋一種動物消失如何影響整體時。',['When ', ', the effect rarely stops there; it can ', ' and '],['起始的物種變化','傳導到食物鏈的影響','最後受損的棲地'])),
  card('For instance, if large fish are removed, smaller fish may multiply too quickly, eat more plants, and leave less food for others.','用 For instance, if ... may ... 並列具體生態連鎖',[3,5,11],
    fixed(4,'For instance, if [捕食者被移走], [較小動物] may [過快繁殖], [破壞植被], and [減少其他物種食物].','以捕食者消失為例，把數量增加、植被受損和食物減少逐步連起來。','剛說食物鏈會受影響，需要以一個可看見的因果例子解釋時。',['For instance, if ', ', ', ' may ', ', ', ', and '],['被移走的捕食者','數量可能變化的動物','繁殖後果','植物所受影響','其他物種所受影響'])),
  card('In this sense, losing a bee is not just the loss of one insect; it is a crack in a larger food system.','用 not just ...; it is ... 重估物種消失的整體嚴重性',[1,3,12],
    fixed(5,'In this sense, [滅絕] is not just [失去一種生物]; it is [更大生命系統的一道裂縫].','由前面的食物鏈例子概括：滅絕代表整個系統出現缺口。','具體例子已證明連鎖影響，要提高到生態系統層次時。',['In this sense, ', ' is not just ', '; it is '],['需重估的生態事件','表面上的單一損失','更廣泛的系統損害'])),
  card('Protecting rivers therefore helps preserve the water sources on which farms and families also depend.','用 therefore helps preserve ... on which ... depend 將保育連到人類依賴的條件',[2,5,9],
    fixed(6,'Protecting [動物] therefore helps preserve [環境條件] on which [人類] also depend.','從生態平衡推到人類也依賴同一環境，完成保護的重要性論證。','已說一種生物消失可牽動整個系統，要指出為何人也受影響時。',['Protecting ', ' therefore helps preserve ', ' on which ', ' also depend.'],['被保護的生物','得以保全的環境條件','同樣依賴環境的人'])),
  card('Several practical measures can be taken to address disappearing wetlands.','用 Several practical measures can be taken 轉入方案段',[1,8,10],
    fixed(7,'Several practical measures can be taken to address [問題].','標示第二題已開始：接下來要說可執行的保護措施。','由「為甚麼要保護」轉到「怎樣減少危機」時。',['Several practical measures can be taken to address '],['需要解決的問題'])),
  card('Governments should first create and enforce protected river zones, where fishing and building are strictly controlled.','用 create and enforce ... where ... 控制具體破壞行為',[7,9,10],
    fixed(8,'Governments should first create and enforce [保護區], where [伐木、建築和狩獵] are strictly controlled.','政府不只宣布地點受保護，還須執行對破壞行為的限制。','提出法律方案時，要交代受保護範圍與區內哪些活動被管制時。',['Governments should first create and enforce ', ', where ', ' are strictly controlled.'],['要設立並執行的地區','須受嚴格管制的行為'])),
  card('Such rules must be more than words on paper: wardens need funding, poachers face penalties, and firms that damage rivers must pay.','用 more than words on paper: 列出法律真正落地所需的人手、懲罰及責任',[8,10,13],
    fixed(9,'Such laws, however, must be more than words on paper: [護林員需經費], [非法獵人受懲罰], and [破壞棲地的公司須賠償].','指出法律實效取決於執法人員資源、違法代價及公司責任。','已提出保護區法例，接着要避免法律只停留於宣布時。',['Such laws, however, must be more than words on paper: ', ', ', ', and '],['執行者需要的資源','違法者須面對的後果','破壞者須承擔的責任'])),
  card('At the same time, river protection will be more effective if local families have a real stake in it.','用 will be more effective if 交代社區參與是提高保育成效的條件',[8,9,11],
    fixed(10,'At the same time, [保育] will be more effective if [當地社區真正參與並受益].','補上法律執行以外的條件：讓住在當地的人有保護動機。','法律與處罰已說明，要加入社區合作才能長期保護時。',['At the same time, ', ' will be more effective if '],['需要改善成效的保育','提升成效的社區條件'])),
  card('When residents can earn money from guided walks or forest work, they are less likely to see wildlife as a threat to their income.','用 When ... can earn ... they are less likely to see ... as ... 解釋收入如何改變態度',[7,10,13],
    fixed(11,'When [居民] can earn income through [生態旅遊、農業或保育職位], they are less likely to see [野生動物] as [生存障礙].','指出替代生計的作用：使當地人較少把野生動物當成阻礙。','已說社區須參與並受益，要舉出具體收入如何改變保護意願時。',['When ', ' can earn income through ', ', they are less likely to see ', ' as '],['可能得到收入的人','可持續的收入途徑','看法可能改變的對象','原本認為的阻礙'])),
  card('In conclusion, forest protection is highly important because native birds are part of the natural system that supports life.','用 because 把保護重要性與維持生命的自然基礎連起來',[1,6,13],
    fixed(12,'In conclusion, [動物保護] is highly important because [瀕危物種] are part of [支撐生命的自然基礎].','結論先回答「是否重要」，並濃縮生態平衡與人類福祉的理由。','結論需重申保護立場，而理由須回扣前文生態論證時。',['In conclusion, ', ' is highly important because ', ' are part of '],['須重申的重要行動','保護對象','使其重要的自然系統'])),
  card('The most effective response is not one publicity event, but a combination of enforceable rules, careful land use and local participation.','用 not ... but a combination of ... 指出多項配合的解法',[7,9,11],
    fixed(13,'The most effective response is not [單一方案], but a combination of [法律保護], [土地管理], and [社區參與].','結尾收束成相互配合的法律、土地與社區方案，避免只倚賴單一行動。','回答「採取甚麼措施」時，須把前文分散的手段整合成組合時。',['The most effective response is not ', ', but a combination of ', ', ', ', and '],['不足以單獨解決的方案','第一類法律手段','第二類土地手段','第三類社區手段'])),
];
const wrongReasons=[
  ['保護必要性的立場沒有先展示伐林、擴城、獵捕如何使物種失去棲地。','自然平衡是主體段理由，不是多個人為壓力造成的開場結果。','保護區法例是解法，沒有描述物種受威脅的成因。'],
  ['開場背景只述壓力與棲地流失，沒有 not merely ... but because 的立場推進。','系統裂縫比喻只概括生態後果，沒有情感與生態理由的對照。','結論重申重要性，但沒有 not merely ... but because 的引言理由結構。'],
  ['引言立場預告較廣，沒有 The first reason ... is that 的首項理由。','食物鏈連鎖是下一步解釋，不是先定出生態平衡理由。','方案段過渡轉入措施，沒有提出保護重要性的第一個原因。'],
  ['自然平衡是論點，不是 When 某物種消失後影響擴散的因果。','捕食者例子詳寫某情況，但未用 rarely stops there 概括連鎖。','人類依賴環境是段尾推論，沒有食物鏈傳導步驟。'],
  ['物種消失的概括因果沒有捕食者、植被和其他物種食物的例子。','裂縫比喻是例子後的總結，不逐步說明捕食者消失後果。','生態旅遊收入是社區參與的方案例子，沒有食物鏈的生態例子。'],
  ['引言 not merely ... but because 對比保護理由，沒有由個別滅絕推到系統裂縫。','物種消失傳導是前一層機制，沒有 not just ...; it is 的嚴重性重估。','結論重申生態基礎重要，沒有這個比喻式的單一與整體對照。'],
  ['自然平衡的首項理由沒有明說人類也依賴同一環境條件。','裂縫比喻說系統受損，沒有 therefore 推到保護人類環境。','執法責任是方案細節，沒有自然條件與人類依賴關係。'],
  ['引言立場只答是否重要，沒有開始列可採取的措施。','保護區是下一句具體措施，不是先標示「有幾項可行辦法」。','社區參與是後續條件，不是由問題轉到解法的過渡。'],
  ['方案段過渡只說可採取措施，沒有指定保護區及受限制的活動。','執法資金與懲罰保障法律落地，沒有先界定保護區的限制。','社區參與改善成效，沒有政府建立和執行保護區的行動。'],
  ['保護區句列出管制活動，沒有說護林員資金、罰則及公司賠償。','社區參與是另一條成效條件，沒有具體執法與追責。','結論把措施整合，沒有「紙上文字」與執行條件的對照。'],
  ['保護區設立與管制是政府措施，沒有 if 社區參與會更有效的條件。','執法細節涉及護林員與違法責任，不是當地居民得到的保育利益。','生計例子說明參與怎樣運作，不是先提出社區參與原則。'],
  ['措施過渡沒有居民可賺收入的實際路徑或態度改變。','社區利益是總原則，沒有生態旅遊、農業和職位的例子。','結論組合多種手段，沒有 When 收入帶來觀念改變的因果。'],
  ['引言已表明重要性，但沒有結論回扣自然基礎與瀕危物種。','段尾說人類依賴環境，沒有結論 because 的立場重申。','最後措施句回答怎樣做，不是先回答保護是否重要。'],
  ['過渡說有多項措施，沒有結尾把法律、土地與社區配成組合。','執法細節只屬法律一環，沒有整合另外兩類手段。','社區收入例子只講一種做法，沒有總結完整方案組合。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求回答哪兩件事？',[
    '保護瀕危動物是否重要，以及可採取甚麼措施',
    '哪種野生動物最可愛，以及哪個城市最大',
    '只討論森林面積，不需談狩獵或保護方法',
    '只列出生態旅遊收入，不判斷動物保護價值',
  ],'先表明保護動物重要，再提出能落地的保護做法。'),
  {type:'multi',prompt:'選出兩段主體各自要證明的重點',detail:'選兩項，再按「確認」。',options:[
    '物種消失會擾亂食物鏈，也危及人類依賴的環境',
    '法例須真正執行，社區參與也需要有實際利益',
    '只要宣傳野生動物可愛，就不必保護棲地',
    '只要畫出保護區，執法資金與居民生計均不重要',
  ],correct:[0,1],why:'第一段解釋生態連鎖；第二段把法律執行與地方生計連起來。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言：成因與立場','伐林、擴城和牟利獵捕令動物失去棲地；保護牠們關乎生態與人。'],
  ['重要性：生態連鎖','物種消失可擾亂食物鏈；捕食者例子展示影響可擴散到人所依賴的環境。'],
  ['措施：法律與社區','保護區須有真實執法、經費和罰則，也要讓居民有可持續收入。'],
  ['結論：雙題收束','重申物種是生命系統一部分；法律、土地管理和社區參與須配合。'],
],'先說威脅和立場 → 證明保護必要 → 提出可執行措施 → 分別回答兩題。')];
const evidence=[
  quiz('伐林、擴城和牟利獵捕共同造成甚麼問題？',[
    '許多物種被迫離開原本支撐牠們生存的生態系統',
    '所有森林面積增加，動物因此有更多原生棲地',
    '城市減少，非法狩獵也自動完全停止',
    '物種只會搬到同樣安全的地方，不受任何影響',
  ],'開場三種人為壓力都指向棲地流失。'),
  quiz('作者為何說保護動物不只是情感問題？',[
    '動物存活關乎生態穩定，最終也關乎人類福祉',
    '情感因素已能保證任何保護措施都會成功',
    '只有遊客喜歡動物，當地居民不會受影響',
    '保護動物與自然運作或人的生活完全無關',
  ],'not merely ... but because 把理由由情感推進到生態與人類。'),
  quiz('一個物種消失後，影響為何可能擴大？',[
    '影響會沿食物鏈傳開，削弱整個棲息地',
    '每個物種都完全獨立，不會影響別的動物',
    '沒有捕食者時，其他物種數量必然不變',
    '棲息地只取決於道路，不會受食物關係影響',
  ],'食物鏈把單一物種與其他動物和棲地連在一起。'),
  quiz('捕食者從森林消失時，範文預測哪條連鎖？',[
    '小動物繁殖過快，破壞植被並減少其他物種食物',
    '小動物立即滅絕，植物和食物卻毫無變化',
    '所有動物同時搬到城市，森林不再有食物鏈',
    '只有遊客數量變化，棲地和植物不會受影響',
  ],'例子把捕食者、繁殖、植被和食物量依次相連。'),
  quiz('保護區法例要管制哪幾類活動？',[
    '伐木、建設和狩獵須在保護區內受到嚴格管制',
    '只管遊客拍照，不管造成棲地損失的行為',
    '只在保護區外限制狩獵，區內完全沒有規則',
    '只准公司開發，不能讓護林員進入保護區',
  ],'保護區須明確限制會傷害棲地與動物的活動。'),
  quiz('怎樣避免法律只成為紙上文字？',[
    '給護林員經費、懲罰非法獵人，並追究破壞棲地公司的責任',
    '只公布規則，不給執法人員任何工作資源',
    '取消非法獵捕罰則，讓公司自行決定是否賠償',
    '把所有保護責任交給遊客，政府不用參與',
  ],'執行人手、違法代價與財務追責缺一不可。'),
  quiz('生態旅遊和可持續農業怎樣幫助保育？',[
    '讓當地人有收入，較少把野生動物看成生計障礙',
    '保證所有遊客永久居住，令農地完全停止使用',
    '只讓外來公司受益，社區不必參與保育',
    '要求居民放棄一切收入，才有資格保護動物',
  ],'替代收入使社區能參與保育，也改善其看待野生動物的方式。'),
];
const logic=[
  sequence('第一主體段：從單一物種到人類環境',[
    ['首項理由','動物是脆弱自然平衡的一部分。'],
    ['影響傳導','一個物種消失，後果可沿食物鏈擴散。'],
    ['捕食者例子','小動物過度繁殖、植被受損、其他物種食物變少。'],
    ['系統層次','滅絕不只失去一種生物，也會令更大生命系統受損。'],
    ['人類關係','保護動物也保存人類依賴的環境條件。'],
  ],'段落由生態平衡論點，經具體例子，推到人類福祉。'),
  sequence('第二主體段：保護區須能執行，社區須願參與',[
    ['設保護區','政府建立並執行規則，限制伐木、建設和狩獵。'],
    ['提供執法條件','護林員有經費，非法獵人受罰，破壞棲地者須負責。'],
    ['加入當地社區','居民能真正參與保育並從中受益。'],
    ['提供生計','生態旅遊、可持續農業和保育工作帶來收入。'],
    ['改變看法','居民較少把野生動物當成生存障礙。'],
  ],'法律、執法和生計相接，才有長期保護的條件。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('農區把貓頭鷹全數驅走，田鼠很快增多並吃掉幼苗。','哪項最能轉用範文的生態連鎖論證？',[
    '失去捕食者令田鼠過多，繼而損及作物與其他生物',
    '只計算貓頭鷹數量，不問田鼠或作物後來怎樣',
    '認為田鼠與幼苗完全無關，不必觀察食物關係',
    '把所有作物損失歸因於旅遊收入，忽略捕食者變化',
  ],[
    '原文以捕食者消失、小動物激增及植被受損示範食物鏈連鎖。',
    '題目已提供捕食者消失後的連續後果。',
    '幼苗正是田鼠增加後受影響的部分。',
    '題目沒有提供旅遊作為作物損失的原因。',
  ],[3,4,5],'範文的森林例子說捕食者消失可令小動物過快繁殖，並破壞植被。'),
  transfer('一片濕地可減少洪水，地方討論卻只提候鳥是否討人喜歡。','哪項最符合範文的保護理由？',[
    '除了喜愛候鳥，也要考慮濕地如何維持環境和保護人',
    '只要候鳥可愛，就不用再檢視濕地與居民的關係',
    '只談居民情緒，完全不問濕地對自然有甚麼作用',
    '因為候鳥不夠漂亮，就認定濕地沒有保護價值',
  ],[
    '範文把情感理由擴展到生態穩定與人類福祉。',
    '喜愛動物不能取代對環境作用的評估。',
    '題目已指出濕地可減洪水。',
    '保護價值不能只按外觀判定。',
  ],[1,6],'範文說保護動物不僅有情感理由，也關乎環境條件和人類利益。'),
  transfer('海龜保護區已畫在地圖上，但巡查員沒有經費，夜間仍有人偷走龜蛋。','哪項最能補足法律執行？',[
    '給巡查員經費並處罰偷蛋者，讓保護規則真正生效',
    '保留地圖就足夠，毋須安排巡查或處理偷蛋行為',
    '只宣傳海龜可愛，取消所有違法採蛋的懲罰',
    '只看旅遊人數，完全不管保護區內違法活動',
  ],[
    '範文要求保護區有執行資源，違法獵捕須有嚴重後果。',
    '已有名義上的邊界卻仍在偷蛋。',
    '宣傳不能代替巡查與罰則。',
    '旅遊統計無法阻止題目中的偷蛋。',
  ],[8,9],'原文說法律不能只停留紙上：護林員要有經費，非法獵人須受罰。'),
  transfer('木材公司破壞河邊鳥類棲地，卻要求居民自行支付修復費。','哪項最貼近範文的責任安排？',[
    '要求破壞棲地的公司付修復費，並確保規則執行',
    '只向居民收費，讓破壞棲地的公司不用負責',
    '宣布保護口號，卻不追查造成棲地損失者',
    '取消所有公司責任，只靠動物自行另找棲地',
  ],[
    '範文規定破壞棲地的公司須承擔財務責任。',
    '這把成本轉嫁給未造成損害的人。',
    '紙上承諾不能支付修復或確保守法。',
    '受損棲地需要真實修復和追責。',
  ],[9],'範文把財務責任放在破壞棲地的公司身上，而非旁觀居民。'),
  transfer('山村居民過去靠非法獵捕維生，現在可接受導賞訓練和保育工作。','哪項最能解釋收入與保護的關係？',[
    '新工作帶來收入，使居民較少把野生動物當生計阻礙',
    '新工作令所有人更需要獵捕，保育收入完全沒有用',
    '只設罰則而不問其他收入，便可保證村民立即轉業',
    '導賞工作只能給外人，當地居民不應參與保育工作',
  ],[
    '範文以生態旅遊和保育職位說明收入可改善保護動機。',
    '題目提出新的合法收入，不能推成更依賴非法獵捕。',
    '範文同時重視執法與社區參與。',
    '題目明說村民可接受訓練。',
  ],[10,11],'範文說居民若能靠生態旅遊和保育工作賺錢，較少視野生動物為生存障礙。'),
  transfer('政府計劃只辦一日野生動物嘉年華；伐木和違法狩獵仍在持續。','哪項最能轉用範文結論？',[
    '把法例、土地管理與社區參與配合，處理持續威脅',
    '只把嘉年華辦得更大，就能自行阻止伐木與獵捕',
    '只設保護區名稱，不用安排任何執法或合作',
    '只談動物可愛，不處理土地開發和居民生計',
  ],[
    '範文結論明確把多項互補措施放在單一活動之上。',
    '一天活動不能直接控制題目的持續破壞。',
    '名義上的規則沒有執行便易落空。',
    '原文的解法還包含土地和社區。',
  ],[8,9,10,13],'原文最後指出最有效回應是法律保護、負責任土地使用和社區參與的組合。'),
  transfer('學校要解釋為何不能只計算一種昆蟲的數量，而要觀察整個草地。','哪項最符合範文的系統觀？',[
    '一種昆蟲改變可影響食物鏈，並使草地系統受損',
    '每種昆蟲都完全獨立，草地其他生物不會受影響',
    '只要草地還是綠色，就不用觀察任何生物變化',
    '只要一種昆蟲減少，其餘物種必定全部增長',
  ],[
    '範文把單一物種消失與食物鏈和整體棲地相連。',
    '這忽略原文的相互依賴。',
    '外觀不能保證系統內物種關係穩定。',
    '原文說影響可擴散，沒有保證所有物種增長。',
  ],[3,5],'範文用裂縫比喻指出，滅絕損及更大的生命系統。'),
  transfer('地方政府想保護河流魚群，同時讓附近村民維持生計。','哪項最接近範文的社區條件？',[
    '安排可持續養殖和導賞，讓村民參與並得到收入',
    '完全禁止村民工作，也不提供任何其他收入',
    '只請外地公司管理，附近村民不必知道規則',
    '鼓勵無限制捕撈，因為短期收入比魚群更重要',
  ],[
    '範文讓社區從可持續活動受益，以提高保育成效。',
    '原文沒有要求居民失去生計。',
    '當地人的參與是原文的關鍵條件。',
    '無限制捕撈會破壞保護目標。',
  ],[10,11],'範文說生態旅遊、可持續農業和保育工作能讓居民受益並參與。'),
  transfer('新建道路會穿過候鳥棲地；政府稱已有鳥類保護法，卻不審查建設工程。','哪項最符合範文對保護區的要求？',[
    '在保護區嚴格管制建設，並確保規則真正執行',
    '只宣布鳥類珍貴，讓所有工程照常穿過棲地',
    '法律只管遊客，對破壞棲地的建築完全豁免',
    '只檢查是否有人拍照，不用審查道路施工',
  ],[
    '範文要求保護區控制建設，法律也須有執行力。',
    '這沒有處理題目中的道路威脅。',
    '原文把 construction 明列為須管制行為。',
    '拍照與棲地受建設影響並不相同。',
  ],[8,9],'範文說保護區須嚴格管制建設，法律不能只停留紙上。'),
  transfer('文章要同時回答「動物值不值得保護」和「怎樣處理瀕危問題」。','哪項結論最完整？',[
    '重申動物維持生命系統，再總結法律、土地與社區方案',
    '只說哪些動物較受歡迎，不回答保護是否重要',
    '只列保護區名稱，不解釋如何執法或讓社區參與',
    '只說人們喜歡動物，完全不提出任何保護措施',
  ],[
    '範文的兩個結論句先答重要性，再整合三類解法。',
    '受歡迎程度不是原文的重要性論證。',
    '這未完整呈現原文的措施組合。',
    '題目第二問要求可採取的做法。',
  ],[12,13],'範文結論分別重申自然基礎的價值，以及法律、土地管理與社區參與。'),
];
export default {key:'direct-question:18',meta:{topic:'瀕危動物的保護價值與措施',summary:'食物鏈連鎖說明動物保護關乎人類；保護區須執法，社區亦須有可持續收入。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
