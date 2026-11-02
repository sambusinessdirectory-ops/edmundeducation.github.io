// Human-authored support for Direct Question 17; canonical source text stays in the lesson bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-17-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:17'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'More people and fast growing cities are putting strong pressure on forests, beaches, rivers and other beautiful places.',
  'Saving these places is not just a matter of liking nature; it clearly helps people’s lives, local work and culture.',
  'I will explain these benefits and how governments can stop more of these places from disappearing.',
  'First, protecting beautiful natural places makes people healthier and improves daily life.',
  'Parks, beaches and woods give people room to breathe fresh air, walk and feel better after the stress of city life.',
  'Without these places, a city can feel like a cage made of buildings, especially to children and older people who cannot pay for many other ways to relax.',
  'These places also bring visitors and jobs for local people.',
  'A well-kept mountain path or protected coast can bring visitors, give guides and small shops work, and make local people want to look after the land instead of selling it in small parts.',
  'Natural places also keep a country’s history and culture alive because many are linked to local stories, customs and shared memories.',
  'We can solve the problem with stronger rules about where to build and enough money to care for natural areas.',
  'Governments should draw legal borders around important natural places, stop building in areas that can be easily damaged, and make builders bring back green space if building must happen.',
  'This stops a city from spreading without control over every open area.',
  'At the same time, there must be a practical way to pay for protection.',
  'Money from entry tickets, visits to nature and partnerships between government and businesses can pay for repairs, rubbish collection and park workers, while schools and media can teach people why these places matter.',
  'When people see nature as something valuable that everyone shares, not as empty land ready for buildings, they are more likely to protect it.',
  'To sum up, protecting beautiful natural places helps people’s health, local jobs and a country’s culture.',
  'Strong city plans, steady money and teaching people about nature can reduce the loss of these places, so cities can grow while nature is protected.',
];
const vocabulary=[
  [['Population growth','More people','人口增長'],['rapid urban expansion','fast growing cities','城市快速擴張'],['placing intense pressure on','putting strong pressure on','造成巨大壓力'],['coastlines','beaches','海岸線'],['scenic areas','beautiful places','風景地區']],
  [['Protecting these places','Saving these places','保護這些地方'],['environmental preference','matter of liking nature','環境偏好'],['public, economic and cultural benefits','helps people’s lives, local work and culture','公共經濟文化好處']],
  [['This essay will discuss','I will explain','本文將討論'],['those benefits','these benefits','這些好處'],['prevent further loss','stop more of these places from disappearing','防止進一步流失']],
  [['preserving','protecting','保護'],['natural beauty spots','beautiful natural places','自然美景地點'],['improves public health','makes people healthier','改善公共健康'],['quality of life','daily life','生活質素']],
  [['woodlands','woods','林地'],['place to breathe','room to breathe fresh air','呼吸空間'],['recover from the mental strain of city life','feel better after the stress of city life','舒緩城市生活精神壓力']],
  [['Without such spaces','Without these places','沒有這些空間'],['concrete cage','cage made of buildings','混凝土牢籠'],['elderly residents','older people','長者'],['few affordable ways to relax','cannot pay for many other ways to relax','少有可負擔放鬆方式']],
  [['support tourism','bring visitors','支持旅遊'],['local employment','jobs for local people','本地就業']],
  [['well-protected mountain trail','well-kept mountain path','保護良好山徑'],['coastal reserve','protected coast','海岸保護區'],['attract visitors','bring visitors','吸引遊客'],['create jobs for guides and small businesses','give guides and small shops work','創造導遊和小企工作'],['value their landscape','want to look after the land','珍惜景觀'],['sell it off piece by piece','selling it in small parts','逐點出售']],
  [['In addition','also','此外'],['natural sites','Natural places','自然地點'],['preserve a country’s identity','keep a country’s history and culture alive','保存國家身份認同'],['local history, traditions and collective memory','local stories, customs and shared memories','本地歷史傳統與集體記憶']],
  [['This problem can be tackled','We can solve the problem','可以處理此問題'],['stronger planning laws','stronger rules about where to build','更有力規劃法例'],['practical conservation funding','enough money to care for natural areas','可行保育資金']],
  [['set legal boundaries','draw legal borders','設法律邊界'],['limit construction','stop building','限制建設'],['sensitive zones','areas that can be easily damaged','敏感地區'],['require developers to restore or replace green space','make builders bring back green space','要求發展商修補綠地'],['building is unavoidable','building must happen','建設無可避免']],
  [['This ensures','This stops','這能確保'],['expansion','a city','城市擴張'],['unchecked tide','spreading without control','失控潮水'],['open area','open area','開放空間']],
  [['At the same time','At the same time','同時'],['protection must be made financially realistic','there must be a practical way to pay for protection','保育需可行資金']],
  [['Entrance fees','Money from entry tickets','入場費'],['eco-tourism revenue','visits to nature','生態旅遊收入'],['public-private partnerships','partnerships between government and businesses','公私合作'],['fund maintenance, waste control and park staff','pay for repairs, rubbish collection and park workers','資助保養清廢與員工'],['media campaigns','media','媒體宣傳']],
  [['natural beauty as shared public wealth','nature as something valuable that everyone shares','共享公共財富'],['empty land waiting to be developed','empty land ready for buildings','待發展空地'],['more likely to defend it','more likely to protect it','更可能保護']],
  [['In conclusion','To sum up','總結來說'],['natural beauty spots','beautiful natural places','自然美景地點'],['public health','people’s health','公共健康'],['local economies','local jobs','本地經濟'],['cultural identity','a country’s culture','文化身份認同']],
  [['firm urban planning','Strong city plans','堅定城市規劃'],['reliable funding','steady money','可靠資金'],['public education','teaching people about nature','公共教育'],['development and environmental protection can move forward together','cities can grow while nature is protected','發展與環境保護並進']],
];
const chunkOverrides=[
  ['Population growth and rapid urban expansion','are placing intense pressure on forests, coastlines, rivers','and other scenic areas.'],
  ['Protecting these places is not simply an environmental preference;','it brings clear public, economic and cultural benefits.'],
  ['This essay will discuss those benefits','and suggest how governments can prevent further loss.'],
  ['First, preserving natural beauty spots','improves public health and quality of life.'],
  ['Parks, beaches and woodlands give people','a place to breathe, walk and recover','from the mental strain of city life.'],
  ['Without such spaces, urban living can become a concrete cage,','especially for children and elderly residents','who have few affordable ways to relax.'],
  ['These places also support tourism','and local employment.'],
  ['A well-protected mountain trail or coastal reserve','can attract visitors, create jobs for guides and small businesses,','and give communities a reason to value their landscape','rather than sell it off piece by piece.'],
  ['In addition, natural sites preserve a country’s identity,','as many landscapes are tied to local history,','traditions and collective memory.'],
  ['This problem can be tackled','through stronger planning laws and practical conservation funding.'],
  ['Governments should set legal boundaries around important natural sites,','limit construction in sensitive zones,','and require developers to restore or replace green space','when building is unavoidable.'],
  ['This ensures that expansion does not spread','like an unchecked tide across every open area.'],
  ['At the same time, protection must be made','financially realistic.'],
  ['Entrance fees, eco-tourism revenue and public-private partnerships','can fund maintenance, waste control and park staff,','while schools and media campaigns can teach citizens','why these places matter.'],
  ['When people see natural beauty as shared public wealth','rather than empty land waiting to be developed,','they are more likely to defend it.'],
  ['In conclusion, protecting natural beauty spots','benefits public health, local economies and cultural identity.'],
  ['The loss of these places can be reduced','through firm urban planning, reliable funding and public education,','so that development and environmental protection','can move forward together.'],
];
const simpleChunkOverrides=[
  ['More people and fast growing cities','are putting strong pressure on forests, beaches, rivers','and other beautiful places.'],
  ['Saving these places is not just','a matter of liking nature;','it clearly helps people’s lives, local work and culture.'],
  ['I will explain these benefits','and how governments can stop more of these places','from disappearing.'],
  ['First, protecting beautiful natural places','makes people healthier and improves daily life.'],
  ['Parks, beaches and woods give people room','to breathe fresh air, walk and feel better','after the stress of city life.'],
  ['Without these places, a city can feel','like a cage made of buildings,','especially to children and older people','who cannot pay for many other ways to relax.'],
  ['These places also bring visitors','and jobs for local people.'],
  ['A well-kept mountain path or protected coast','can bring visitors, give guides and small shops work,','and make local people want to look after the land','instead of selling it in small parts.'],
  ['Natural places also keep a country’s history','and culture alive because many are linked','to local stories, customs and shared memories.'],
  ['We can solve the problem','with stronger rules about where to build','and enough money to care for natural areas.'],
  ['Governments should draw legal borders around important natural places,','stop building in areas that can be easily damaged,','and make builders bring back green space','if building must happen.'],
  ['This stops a city from spreading without control','over every open area.'],
  ['At the same time, there must be','a practical way to pay for protection.'],
  ['Money from entry tickets, visits to nature','and partnerships between government and businesses','can pay for repairs, rubbish collection and park workers,','while schools and media can teach people','why these places matter.'],
  ['When people see nature as something valuable','that everyone shares,','not as empty land ready for buildings,','they are more likely to protect it.'],
  ['To sum up, protecting beautiful natural places','helps people’s health, local jobs and a country’s culture.'],
  ['Strong city plans, steady money and teaching people about nature','can reduce the loss of these places,','so cities can grow while nature is protected.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){
  const text=original[i],parts=[];
  let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);
    if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));
    parts.push(part(link,'link','句型固定部分'));
    cursor=at+link.length;
  }
  if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));
  return {formula,meaning,usage,parts};
}
function card(example,functionName,distractors,frame){
  return {example,distractors,frame,patternType:'reviewed',
    answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,
    distractorReason:`這句${functionName}；它表達的是另一種關係。`};
}
const structures=[
  card('Population growth and rapid building are placing intense pressure on old town parks and rivers.','用 are placing pressure on 指出擴張對自然地點造成的壓力',[1,3,9],
    fixed(0,'[人口與城市增長] are placing intense pressure on [自然景觀].','開場指出造成景觀流失的兩股壓力及受影響地方。','題目問如何處理自然美景流失，先交代壓力來源和對象時。',[' are placing intense pressure on '],['造成壓力的增長','承受壓力的自然地點'])),
  card('Saving local gardens is not simply a matter of taste; it brings health, work and cultural benefits.','用 not simply ...; it brings ... 重定保育的公共價值',[0,4,15],
    fixed(1,'Protecting [地方] is not simply [環境偏好]; it brings [公共、經濟及文化好處].','預告保育對人、工作和身份認同有實際價值，而非單純個人喜好。','引言要說明保護自然地點值得公共行動的理由時。',['Protecting ', ' is not simply ', '; it brings '],['受保護的地方','被超越的個人偏好','多方面的公共好處'])),
  card('This essay will discuss those benefits and suggest how councils can prevent further loss.','用 discuss ... and suggest how 對兩個題問作清楚路線預告',[1,9,16],
    fixed(2,'This essay will discuss [保育益處] and suggest how [政府防止再流失].','預告先談保護的好處，再談避免景觀繼續消失的方法。','雙問題目要求益處與解法，引言末句須交代順序時。',['This essay will discuss ', ' and suggest how '],['先說明的益處','其後提出的預防方向'])),
  card('First, preserving local parks improves health and quality of life.','用 First ... improves ... 引出公共健康這一項益處',[1,4,6],
    fixed(3,'First, preserving [自然美景] improves [公共健康] and [生活質素].','第一主體段先提出自然空間對身心及日常生活的好處。','開始列保育好處時，要先明確提出一項可解釋的公共益處時。',['First, preserving ', ' improves ', ' and '],['被保存的自然地點','第一項健康益處','第二項生活益處'])),
  card('Parks and beaches give residents a place to walk, rest and recover from city stress.','用 give people a place to 並列自然空間的實際用途',[3,5,7],
    fixed(4,'[公園海灘林地] give people a place to [呼吸、步行和舒緩壓力].','具體說明公共健康好處來自哪些日常活動。','已說自然空間有利健康，接着要寫人如何使用它時。',[' give people a place to '],['可使用的自然空間','對健康有幫助的活動'])),
  card('Without these parks, city life can become a concrete cage, especially for families who cannot pay for holidays.','用 Without ... especially for 指出缺空間對低成本休憩的影響',[3,4,8],
    fixed(5,'Without [自然空間], urban living can become [混凝土牢籠], especially for [缺少廉價休憩的兒童長者].','以沒有自然空間時的城市生活作對照，突出兒童與長者較少替代選擇。','要說明保育為何也關乎公平使用休憩空間時。',['Without ', ', urban living can become ', ', especially for '],['被移走的自然空間','城市可能變成的環境','特別受影響的人群'])),
  card('These places also support visitors and local jobs.','用 These places also support 加入經濟益處',[3,7,8],
    fixed(6,'These places also support [旅遊業] and [本地就業].','由健康好處轉入自然景觀對本地工作和旅遊的貢獻。','同段還要列第二類保育益處，先用短句定方向時。',['These places also support ', ' and '],['受支持的旅遊活動','因而受益的工作'])),
  card('A protected river path can attract visitors, create jobs for guides, and give residents a reason to value it rather than sell the land.','用 can attract ... create ... and give ... rather than 寫保育與就業和珍惜景觀的連鎖',[4,6,9],
    fixed(7,'[保護良好的山徑或海岸] can attract [遊客], create jobs for [導遊與小企], and give [社區] a reason to value [景觀] rather than [逐步出售].','用具體山徑與海岸保護區，交代旅遊、職位及社區珍惜景觀的連鎖。','已提出旅遊就業益處，需要說清楚它如何形成並影響保護動機時。',[' can attract ', ', create jobs for ', ', and give ', ' a reason to value ', ' rather than '],['能吸引人的自然地點','可能到訪的人','受惠的工作','得到保育理由的社區','被珍惜的景觀','相反的出售行為'])),
  card('In addition, old gardens preserve a town’s identity, as many trees are tied to local stories and memories.','用 as 連自然地點與地方文化記憶',[1,6,15],
    fixed(8,'In addition, [自然地點] preserve [國家身份認同], as [景觀] are tied to [歷史傳統與集體記憶].','第三類好處是文化連結，說明風景不只可供休憩和遊覽。','列完健康與經濟益處，還要補上地方身份與記憶時。',['In addition, ', ' preserve ', ', as ', ' are tied to '],['有文化意義的自然地點','得以保存的身份認同','承載記憶的景觀','相關的歷史與傳統'])),
  card('This problem can be tackled through stronger land-use rules and reliable park funding.','用 can be tackled through 並列規劃法規與保育經費',[2,8,12],
    fixed(9,'This problem can be tackled through [規劃法例] and [保育資金].','轉入方案段，指出一方面控建設，另一方面要有資金管理。','前文已說保育益處，現在要概括兩大防止流失的手段時。',['This problem can be tackled through ', ' and '],['控制開發的法律工具','使保育可持續的經費'])),
  card('Councils should mark protected zones, limit new buildings, and require builders to replace trees when construction is unavoidable.','用 should ... limit ... and require ... when 列政府對開發的三步規則',[9,11,13],
    fixed(10,'Governments should [劃法律邊界], [限制敏感地區施工], and require developers to [修復綠地] when [建設無可避免].','把規劃法寫成可執行的保護區界線、施工限制及補回綠地要求。','已提出規劃法律，需要逐項說明政府與發展商須做甚麼時。',['Governments should ', ', ', ', and require developers to ', ' when '],['政府設保護範圍','限制高風險施工','發展商補救行動','無可避免建設的情況'])),
  card('This ensures that new roads do not spread like an unchecked tide across every open field.','用 does not spread like an unchecked tide 形象說明規劃的防擴張作用',[0,10,14],
    fixed(11,'This ensures that [城市擴張] does not spread like [失控潮水] across [所有空地].','解釋規劃法律的目的：避免建築漫無邊界地侵佔自然空間。','列完建設限制後，要交代它們如何避免累積性的景觀流失時。',['This ensures that ', ' does not spread like ', ' across '],['需要控制的擴張','作比較的失控意象','應保留的開放土地'])),
  card('At the same time, protection must be made financially realistic.','用 At the same time 補上法例以外的經費可行性',[9,10,13],
    fixed(12,'At the same time, [保護工作] must be made [財政上可行].','指出不能只訂禁建規則，保護區的日常管理仍要付費。','規劃措施已說明，接着要加入保育財源時。',['At the same time, ', ' must be made '],['需要持續運作的保護','必須具備的經費條件'])),
  card('Ticket income and partnerships can pay for park staff, while schools can teach residents why green spaces matter.','用 can fund ... while ... can teach 將資金與公眾教育並行',[10,12,14],
    fixed(13,'[入場費、旅遊與公私合作] can fund [保養、廢物管理和人員], while [學校與媒體] can teach [市民為何重要].','列出保育收入怎樣支付日常運作，同時以教育建立民眾支持。','要把「財政可行」具體化，也交代公眾為何願意保護時。',[' can fund ', ', while ', ' can teach '],['可提供資金的來源','要持續支付的保育工作','負責宣傳教育者','需要了解保育價值的人'])),
  card('When residents see a park as shared wealth rather than empty land for new towers, they are more likely to defend it.','用 When ... as ... rather than ... more likely 解釋觀念轉變如何帶來保護行動',[8,11,13],
    fixed(14,'When people see [自然美景] as [共享財富] rather than [待發展空地], they are more likely to [保護].','指出公眾教育要改變土地觀念：從可售空地轉為共同資產。','已說教育市民，接着要說明它如何提升保護意願時。',['When people see ', ' as ', ' rather than ', ', they are more likely to '],['被重新看待的自然地點','希望建立的公共財富觀','須避免的純開發觀','因此較可能採取的行動'])),
  card('In conclusion, protecting local parks benefits health, jobs and cultural identity.','用 benefits 並列三類保育益處回答第一題',[3,6,16],
    fixed(15,'In conclusion, protecting [自然美景] benefits [健康、經濟和文化身份].','結論先歸納保護自然地點的公共、經濟及文化好處。','結論要先直接回答「保護有何益處」時。',['In conclusion, protecting ', ' benefits '],['受保護的自然地點','前文論證的三方面好處'])),
  card('The loss of city parks can be reduced through planning, funding and public education, so that homes and green space move forward together.','用 can be reduced through ... so that 將三類解法連到發展與保育並行',[2,9,15],
    fixed(16,'The loss of [自然地點] can be reduced through [規劃、經費與教育], so that [發展與保育] can move forward together.','結尾把法規、經費和教育連成一套防止流失的組合。','最後回答「如何解決」，並說明發展與保育可同時進行時。',['The loss of ', ' can be reduced through ', ', so that ', ' can move forward together.'],['有流失風險的地方','互相配合的三類措施','期望同時前進的兩個目標'])),
];
const wrongReasons=[
  ['not simply 偏好而有好處說保育價值，沒有增長對哪些景觀施壓。','公共健康是保育益處，沒有問題的壓力來源。','規劃與資金是解法，沒有開場的城市擴張現況。'],
  ['增長施壓只是問題現況，沒有三方面公共價值的重定位。','公園用途只詳解健康好處，沒有經濟與文化的引言總述。','結論重列三項好處，沒有 not simply ...; it brings 的修正步驟。'],
  ['保護有公共價值是立場，沒有雙問題目順序預告。','方案總述只列法律與資金，沒有先談益處後談解法的路線。','結尾的解法是收束，不是引言的內容安排。'],
  ['引言多方面好處只概括，沒有 First 鎖定健康與生活。','公園日常用途是後續解釋，沒有先命名第一種好處。','旅遊工作是另一類益處，沒有公共健康的段首焦點。'],
  ['健康總述沒有說人如何在自然空間活動。','Without 對照缺空間的後果，沒有呼吸散步等正面用途。','山徑遊客工作例子屬經濟作用，沒有健康日常行為。'],
  ['健康段首是正面主張，沒有失去空間時兒童長者怎樣受影響。','公園用途列可做活動，沒有缺空間的比較。','文化身份是另類好處，沒有廉價休憩機會的公平性。'],
  ['健康好處只說身心與生活，沒有引出旅遊和就業。','山徑個案詳解經濟因果，沒有短句先標示第二類好處。','文化身份是第三類好處，沒有旅遊工作。'],
  ['公園用途說身心活動，沒有旅遊如何產生職位。','旅遊工作總說是結果，沒有山徑、導遊與保護動機的連鎖。','法律與資金是解法，沒有自然景觀帶來的就業例子。'],
  ['保護有文化好處只是引言總述，沒有身份與歷史的關聯。','旅遊工作談經濟，沒有集體記憶。','結論重列身份益處，沒有 as 說其文化根據。'],
  ['引言路線說將提出解法，沒有法例與資金的兩類手段。','文化身份是保育益處，沒有轉入具體政策。','經費可行性只講資金一邊，沒有先總說規劃與資金。'],
  ['方案總述只命名法例與資金，沒有邊界、限制與補地的規則。','防止擴張的比喻說規劃目的，沒有政府三步行動。','經費來源是另一層方案，沒有敏感地區開發要求。'],
  ['增長對景觀施壓是問題，沒有規劃後避免失控擴張。','政府三步規則是行動清單，沒有潮水比喻總結其作用。','公眾觀念轉變說保護意願，沒有城市擴張空間問題。'],
  ['方案總述提到保育資金，沒有 At the same time 的可行性轉段。','政府建設規則是法例部分，沒有日常保育經費。','入場費等詳列資源，沒有先提出須財政可行的原則。'],
  ['政府限制建設是土地規劃，沒有保養資金及教育並行。','財政可行是總原則，沒有資金來源和用途。','公眾保護意願是教育後效果，沒有先列如何募資及宣傳。'],
  ['文化身份說景觀承載記憶，沒有空地與公共財富觀的對照。','擴張潮水說法規效果，沒有民眾如何看待自然地點。','入場費與教育說措施，沒有觀念改變如何促成防衛。'],
  ['健康段首只提出一項益處，沒有結論三類總結。','旅遊工作總說只含經濟益處，沒有健康文化。','最後解法句回答防止流失，沒有先收束保護的好處。'],
  ['引言路線只是預告，沒有結論三類措施的完整收束。','方案總述提法律資金，沒有公眾教育和並行目標。','結論前句只答益處，沒有回答怎樣防止流失。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求分別回答甚麼？',[
    '保護自然美景有甚麼好處，以及怎樣減少這些地方流失',
    '城市應建多少住宅，以及哪條山徑最適合收費',
    '孩子應否選修地理，以及導遊應在哪所學校受訓',
    '只描述城市人口增長，不需要提出保育方法',
  ],'先說公共、經濟、文化益處，再提出能防止景觀流失的措施。'),
  {type:'multi',prompt:'選出範文兩段主體的主要論證',detail:'選兩項，再按「確認」。',options:[
    '自然空間改善健康，也支持旅遊工作並保存地方記憶',
    '規劃法例控制建設，經費和公眾教育支撐持續保育',
    '只要城市擴張，所有自然地點都應逐步賣掉',
    '只收取入場費便足夠，毋須限制任何敏感地區建設',
  ],correct:[0,1],why:'一段回答保護的好處；另一段把法律、資金與觀念轉變配成方案。'},
];
const route=[sequence('依照範文次序排好四段的任務',[
  ['引言界定問題','人口與城市擴張壓迫自然地點；保護有多方面公共價值。'],
  ['保護的好處','自然空間有益身心，也創造工作並承載地方文化記憶。'],
  ['防止流失','以法律畫界線並要求補回綠地，用收入付保養且教育市民。'],
  ['結論雙重回答','重申健康、經濟和文化好處，以規劃、資金及教育讓發展與保育並行。'],
],'先說保育為何值得 → 詳列三種益處 → 說明法律和資金怎樣運作 → 回答兩問。')];
const evidence=[
  quiz('公園、海灘和林地如何有益城市居民？',[
    '提供呼吸、步行和舒緩城市精神壓力的地方',
    '只讓居民看到新樓盤，完全不提供休憩空間',
    '只吸引外地遊客，對城市居民身心沒有作用',
    '保證每人不用工作便可改善經濟和生活質素',
  ],'作者以可呼吸、步行和休息的日常用途支撐健康論點。'),
  quiz('為甚麼兒童與長者特別受自然空間消失影響？',[
    '他們較少有可負擔的其他放鬆方法，公共綠地因而重要',
    '他們都可以隨時付費去任何遠方度假，不需本地公園',
    '公園只有遊客能用，兒童長者不能進入任何自然地點',
    '城市建築越密集，他們便一定越容易得到安靜空間',
  ],'concrete cage 比喻突出缺低成本休憩時的城市局限。'),
  quiz('保護山徑或海岸如何幫助本地經濟？',[
    '吸引遊客並創造導遊和小企業職位，也給社區保護動機',
    '只把土地分批出售，完全不考慮旅遊或長期工作',
    '只容許大型外地企業進場，不讓本地人參與',
    '保護後必須禁止所有人到訪，避免任何經濟活動',
  ],'作者把遊客、職位與社區珍惜景觀連成一條因果鏈。'),
  quiz('自然景觀為何還有文化價值？',[
    '它們與本地歷史、傳統和集體記憶相連，保存身份認同',
    '只要有公園，所有居民的文化和歷史便完全相同',
    '景觀只能提供收入，與地方記憶完全沒有關係',
    '只有新建築能記錄文化，自然地點不能承載故事',
  ],'as 把國家身份認同與景觀承載的歷史文化連起來。'),
  quiz('規劃法律在文中包含哪些具體措施？',[
    '劃保護邊界、限制敏感區建設，必要建設後補回綠地',
    '只寫自願守則，不劃界線也不用發展商修補',
    '允許所有開放空間持續建樓，完全不設限制',
    '只限制公園散步，不管理任何建築工程',
  ],'三項措施分別保護範圍、控制施工與處理不可避免的開發。'),
  quiz('為甚麼還需要入場費等收入？',[
    '保育須付保養、廢物管理和公園人員等持續費用',
    '一旦設法律邊界，所有保養工作便不再有成本',
    '收入只用於宣傳開幕，不需要照顧保護區',
    '收入越多就越應把綠地全部出售作建築用地',
  ],'financially realistic 指日常保育工作須有可行的資金來源。'),
  quiz('學校和媒體宣傳希望改變哪種土地觀念？',[
    '讓市民把自然地點當共同財富，而非只當待建空地',
    '讓市民認為所有景觀只可按短期售地價值衡量',
    '讓學生以為公園只供導遊使用，居民不能接觸',
    '讓市民相信保育完全不需關心健康或文化記憶',
  ],'看法轉變讓更多人願意保護共同的自然資產。'),
];
const logic=[
  sequence('第一主體段：三類保育益處',[
    ['公共健康','公園、海灘和林地讓居民呼吸、步行及舒緩壓力。'],
    ['機會公平','兒童與長者較缺其他可負擔的放鬆方式。'],
    ['本地經濟','保護山徑海岸能吸引遊客並帶來導遊和小企工作。'],
    ['保護動機','本地人因工作與景觀相連，更願珍惜而非逐步出售。'],
    ['文化身份','景觀與歷史、傳統及集體記憶相連。'],
  ],'益處由居民日常健康，延伸到本地工作與文化記憶。'),
  sequence('第二主體段：法例、經費及觀念如何配合',[
    ['規劃法例','設法律邊界，限制敏感地區施工。'],
    ['必要開發的修補','無法避免建設時，發展商須修復或補回綠地。'],
    ['持續保育經費','入場費、旅遊收入及公私合作支付保養和人員。'],
    ['公共教育','學校與媒體說明景觀為何重要。'],
    ['保護意願','把自然看成共享財富，市民更可能捍衛它。'],
  ],'法律減少侵佔，經費維持保護區，教育建立社區的長期支持。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('密集住宅區準備把最後一個小公園改建停車場，居民缺少其他免費休憩地點。','哪項最能轉用範文的健康與公平論證？',[
    '保留公園可供步行休息，也照顧無力負擔其他休閒的人',
    '只看停車位收入，完全不問居民還有沒有休憩空間',
    '假設每戶都能付費到遠方度假，不需要本地綠地',
    '只容許遊客使用公園，避免住在附近的居民進入',
  ],[
    '範文把日常舒緩壓力與缺少可負擔替代選擇連在一起。',
    '收入不是文章衡量公園價值的唯一標準。',
    '題目已指出居民缺低成本替代。',
    '自然空間也直接服務本地居民。',
  ],[3,4,5],'範文說自然空間供人散步放鬆，對缺少可負擔替代方式者尤其重要。'),
  transfer('海岸步道保護後，導覽和本地小店增加，居民開始反對把海岸分批賣給發展商。','哪項最貼近範文的經濟因果鏈？',[
    '景觀吸引遊客和工作，也讓社區更願珍惜土地',
    '工作增加證明應立即把步道全部出售作建築',
    '只有發展商可以從遊客獲利，本地小店不會受益',
    '保護步道必然禁止任何人到訪，也不能有導覽',
  ],[
    '原文的山徑海岸例子連接遊客、工作和珍惜景觀的動機。',
    '出售會破壞題目中已形成的長期景觀價值。',
    '題目明說小店增加。',
    '保育可在管理下支持旅遊。',
  ],[6,7],'範文說保護山徑或海岸可吸引遊客、創造工作，並減少社區出售景觀的誘因。'),
  transfer('一片古老林地與地方傳說和節慶相連，規劃文件卻只按木材價格評估。','哪項最能補上範文的文化價值？',[
    '把林地與歷史、傳統和共同記憶一同列入評估',
    '只按木材價格處理，地方故事不應進入評估',
    '只要樹木仍在，節慶便必定不受任何開發影響',
    '因林地有傳說，就完全不用考慮公共使用或維護',
  ],[
    '範文說自然景觀可保存地方身份認同與集體記憶。',
    '只算木材會漏掉題目提供的文化連結。',
    '開發可能改變景觀與社區活動的關係。',
    '文化重要仍須配合公共管理和保護。',
  ],[8,15],'範文把自然地點的價值連到本地歷史、傳統與集體記憶。'),
  transfer('新道路必須經過一段城市邊緣綠地，建設無法完全避免。','哪項最符合範文的規劃措施？',[
    '限制敏感區施工，必要時要求發展商修復或補回綠地',
    '因道路重要，就取消所有保護邊界和補救要求',
    '只在工程完成後說明問題，不要求任何綠地修補',
    '完全不分地區敏感程度，把所有開放空間當相同',
  ],[
    '原文同時提出限制敏感區與無法避免建設時的綠地補救。',
    '必要開發仍可受保護規則約束。',
    '原文要求發展商修復或替代綠地。',
    '敏感區需要更明確的界線與限制。',
  ],[9,10,11],'範文建議畫法律界線、限制敏感區施工，必要開發後補回綠地。'),
  transfer('國家公園有法律保護，但步道破損、垃圾增加，管理處沒有日常經費。','哪項最能補上範文的資金原則？',[
    '用合理入場與旅遊收入支付保養、清潔和公園人員',
    '只設保護牌匾，假設維修和清潔都不需要經費',
    '把所有收入只用於開幕，避開長期運作費用',
    '因管理困難，就立即出售全部公園土地作建築用途',
  ],[
    'financially realistic 需把收入穩定用於具體保育工作。',
    '法律界線不能自行修好步道或清走垃圾。',
    '開幕支出不解決日常保養。',
    '題目需要管理方案，不是放棄保護。',
  ],[12,13],'範文說入場費、旅遊收入與公私合作可支付保養、廢物控制和員工。'),
  transfer('社區只把河岸看成未開發的空地，對保育計劃沒有興趣。學校擬辦地方歷史活動。','哪項最能說明這活動的目的？',[
    '讓居民認識河岸的共享價值，增加保護意願',
    '讓居民只按短期售地價格衡量河岸用途',
    '把活動當成娛樂，不需說明河岸與社區的關係',
    '只告訴居民公園收費，不提它為何值得保護',
  ],[
    '範文把學校教育、共享公共財富觀與更願保護連起來。',
    '這會延續原文反對的待開發空地觀。',
    '歷史關係正是可改變看法的內容。',
    '資金信息之外仍需理解保育價值。',
  ],[8,13,14],'範文主張學校和媒體教市民景觀為何重要，使人把自然看作公共財富。'),
  transfer('政府宣布新的海岸保護區，卻沒有規定範圍，發展商仍逐步在敏感地區建樓。','哪項最能轉用範文對法例的要求？',[
    '畫清法律邊界並限制敏感區施工，防止逐步擴張',
    '只用宣傳口號，不需要清楚指出哪些地方受保護',
    '讓建築自行蔓延，直到所有開放空間都被佔用',
    '只關注遊客數量，完全不管理土地開發和施工',
  ],[
    '範文提出法律邊界和建築限制，避免擴張像失控潮水。',
    '沒有邊界便難實際限制開發。',
    '這正是原文想防止的累積流失。',
    '旅遊價值不能代替規劃規則。',
  ],[9,10,11],'範文以法定邊界與敏感區限制控制建築蔓延。'),
  transfer('一座城市想同時增加住宅和保留河岸樹林，市民擔心兩者只能選一。','哪項最符合範文結論？',[
    '用規劃界線、穩定經費和教育，使發展與保育並行',
    '只建住宅，因自然空間對城市沒有任何公共價值',
    '只設公園但不管維修，假設保護會自動持續',
    '只談文化記憶，不處理建築邊界與日常管理',
  ],[
    '範文結尾明言三類措施可使發展與保育一起向前。',
    '原文列健康、經濟和文化多方面價值。',
    '經費是保育得以持續的條件。',
    '文化好處不能取代實際規劃與資金。',
  ],[10,12,13,16],'範文把城市規劃、可靠經費和公眾教育合用，令發展與環保可並行。'),
  transfer('公園旁開設收費導賞，有人說任何收入都會破壞保育，也有人說收入應全用於建樓。','哪項最能轉用範文的平衡安排？',[
    '妥善管理導賞收入，支付保養並保護景觀界線',
    '只要有收入，就不必再限制敏感地區建築',
    '完全不用收入，卻不提出任何保養資金來源',
    '把收入全用於建樓，讓導賞所依賴的公園消失',
  ],[
    '範文說旅遊收入可資助保養，同時規劃法例保護土地。',
    '資金和法律是互補措施。',
    '日常保養仍須有可行財源。',
    '破壞景觀會損及旅遊和保育本身。',
  ],[7,9,10,13],'範文沒有把旅遊與保育對立；收入可支撐管理，法例可防止開發過度。'),
  transfer('文章要同時回答「保護有何好處」與「怎樣防止流失」。','哪項結論最完整？',[
    '總結健康、工作和文化好處，再配上規劃、經費與教育',
    '只說城市人口增加，不判斷保護自然地點的價值',
    '只列公園很漂亮，不提出可執行的防流失做法',
    '只限制發展商，不說市民、工作與地方文化如何受益',
  ],[
    '範文最後兩句分別總結三種益處與三類互補解法。',
    '第一題須答保育好處。',
    '第二題須答如何減少流失。',
    '只答一部分方案，沒有回應保育多方面價值。',
  ],[15,16],'範文結論先收健康、經濟、文化三項好處，再收規劃、資金與教育方案。'),
];
export default {
  key:'direct-question:17',
  meta:{topic:'自然美景的保護益處與防流失方案',summary:'自然地點有健康、工作與文化價值；規劃法例、保育經費和公眾教育須配合。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks,
};
