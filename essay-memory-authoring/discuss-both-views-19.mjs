// Full source-specific memorisation support for Discuss Both Views 19.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:19'];
const original=groups.map(row=>row.english);
const simple=[
  'People have changed nature across the world more than ever before.',
  'Forests have been cut down, seas made dirty and many kinds of plants and animals put close to dying out, so some people say the harm people have done can no longer be fixed.',
  'I understand why some people think this, but I believe real steps can still make the harm smaller and help nature grow back.',
  'People who think nothing can change often say that some harm to nature lasts forever.',
  'For example, once a kind of animal dies out, no new rule or public effort can bring it back.',
  'Also, modern life uses many things that hurt natural places, such as large farms, new roads, flying and making goods in factories.',
  'These are not little habits people can stop in one day; they have become part of how businesses and money work.',
  'So even when governments promise to protect nature more, companies and buyers often still choose what is easy, earns money and helps the economy grow quickly for now.',
  'From this view, the harm people do can seem like a very strong wave that cannot be pushed back.',
  'But I think that way of thinking gives up too soon.',
  'Some losses can never be fixed, but much harm to nature can be reduced, made slower or even partly put right.',
  'Governments can keep forests safe, stop hunting that breaks the law, bring wet places back and punish companies that make rivers dirty or destroy places where animals live.',
  'At the same time, people can change what they buy by wasting less food, choosing goods made in ways that do less harm and helping projects that protect nature.',
  'For example, if a city keeps green places safe and limits building, birds, insects and local plants may return little by little.',
  'Nature can often grow back surprisingly well when people stop harming it again and again.',
  'To sum up, people have clearly done serious harm to nature, and some of that harm cannot be put right.',
  'Even so, I strongly think things can still change.',
  'With strong rules, companies that act carefully and better everyday choices, people can stop making the harm worse and give plants and animals a real chance to live.',
];
const vocabulary=[
  [['Human beings','People','人類'],['altered','changed','改變'],['natural world','nature','自然世界'],['unprecedented scale','more than ever before','空前規模']],
  [['forests have been cleared','Forests have been cut down','森林砍伐'],['oceans polluted','seas made dirty','海洋污染'],['species pushed towards extinction','kinds of plants and animals put close to dying out','物種瀕滅'],['beyond repair','can no longer be fixed','無法修復']],
  [['pessimistic view','why some people think this','悲觀觀點'],['practical action','real steps','實際行動'],['reduce environmental harm','make the harm smaller','減少環境傷害'],['nature to recover','nature grow back','自然恢復']],
  [['change is impossible','nothing can change','無法改變'],['permanent nature','lasts forever','永久性'],['environmental damage','harm to nature','環境破壞']],
  [['Once a species disappears','once a kind of animal dies out','一個物種消失'],['no law or campaign','no new rule or public effort','法律或行動都不能'],['bring it back','bring it back','帶回來']],
  [['In addition','Also','此外'],['modern life','modern life','現代生活'],['harm ecosystems','hurt natural places','傷害生態系統'],['mass farming','large farms','大規模農業'],['road building','new roads','道路建設'],['air travel','flying','航空旅行'],['industrial production','making goods in factories','工業生產']],
  [['not small habits','not little habits','不是小習慣'],['removed overnight','stop in one day','一夜改掉'],['woven into','become part of','融入'],['economies operate','businesses and money work','經濟運作']],
  [['As a result','So','因此'],['governments promise greener policies','governments promise to protect nature more','政府承諾環保政策'],['businesses and consumers','companies and buyers','企業消費者'],['prioritise convenience','choose what is easy','優先便利'],['profit','earns money','利潤'],['short-term growth','helps the economy grow quickly for now','短期增長']],
  [['From this perspective','From this view','從這角度'],['human impact','harm people do','人類影響'],['tide','wave','潮水'],['too powerful to turn back','cannot be pushed back','太強無法逆轉']],
  [['However','But','然而'],['would argue','think','認為'],['too defeatist','gives up too soon','過早放棄']],
  [['Although some losses are irreversible','Some losses can never be fixed','有些損失不可逆'],['environmental damage','harm to nature','環境破壞'],['limited','reduced','限制'],['slowed','made slower','減緩'],['partly reversed','partly put right','部分逆轉']],
  [['protect forests','keep forests safe','保護森林'],['restrict illegal hunting','stop hunting that breaks the law','限制非法狩獵'],['restore wetlands','bring wet places back','修復濕地'],['punish companies','punish companies','懲罰企業'],['pollute rivers','make rivers dirty','污染河流'],['destroy habitats','destroy places where animals live','破壞棲地']],
  [['At the same time','At the same time','同時'],['individuals','people','個人'],['change demand','change what they buy','改變需求'],['eating less wastefully','wasting less food','減少飲食浪費'],['sustainable products','goods made in ways that do less harm','可持續產品'],['conservation projects','projects that protect nature','保育項目']],
  [['For example','For example','例如'],['protected green spaces','green places safe','受保護綠地'],['controls development','limits building','控制開發'],['native plants','local plants','本地植物'],['return over time','return little by little','逐漸回歸']],
  [['remarkably resilient','grow back surprisingly well','驚人復原力'],['constant pressure','harming it again and again','持續壓力']],
  [['In conclusion','To sum up','總結'],['undoubtedly','clearly','無疑'],['deep damage','serious harm','深重傷害'],['cannot be undone','cannot be put right','無法挽回']],
  [['Nevertheless','Even so','儘管如此'],['strongly believe','strongly think','堅信'],['change is still possible','things can still change','仍可改變']],
  [['firm laws','strong rules','嚴格法律'],['responsible businesses','companies that act carefully','負責任企業'],['thoughtful daily choices','better everyday choices','審慎日常選擇'],['stop making the problem worse','stop making the harm worse','停止惡化'],['real chance to survive','real chance to live','生存機會']],
];
const chunkOverrides=[
  ['Human beings have altered the natural world','on an unprecedented scale.'],
  ['Because forests have been cleared, oceans polluted','and many species pushed towards extinction,','some people argue that the damage done to plants and animals','is now beyond repair.'],
  ['While I understand this pessimistic view,','I believe that practical action can still reduce environmental harm','and allow nature to recover.'],
  ['Those who think change is impossible usually point','to the permanent nature of some environmental damage.'],
  ['Once a species disappears, for instance,','no law or campaign can bring it back.'],
  ['In addition, modern life depends heavily on activities','that harm ecosystems, such as mass farming,','road building, air travel and industrial production.'],
  ['These activities are not small habits','that can be removed overnight; they are woven','into the way economies operate.'],
  ['As a result, even when governments promise greener policies,','businesses and consumers often continue to prioritise','convenience, profit and short-term growth.'],
  ['From this perspective, human impact seems like a tide','that is too powerful to turn back.'],
  ['However, I would argue that this view','is too defeatist.'],
  ['Although some losses are irreversible,','many forms of environmental damage can be limited,','slowed or even partly reversed.'],
  ['Governments can protect forests, restrict illegal hunting,','restore wetlands and punish companies','that pollute rivers or destroy habitats.'],
  ['At the same time, individuals can change demand','by eating less wastefully, choosing sustainable products','and supporting conservation projects.'],
  ['For example, when a city creates protected green spaces','and controls development, birds, insects and native plants','can return over time.'],
  ['Nature is often remarkably resilient','if people stop putting constant pressure on it.'],
  ['In conclusion, human activity has undoubtedly caused deep damage','to the natural world, and some of that damage','cannot be undone.'],
  ['Nevertheless, I strongly believe','that change is still possible.'],
  ['With firm laws, responsible businesses','and more thoughtful daily choices, humans can stop','making the problem worse and give plants and animals','a real chance to survive.'],
];
const simpleChunkOverrides=[
  ['People have changed nature across the world','more than ever before.'],
  ['Forests have been cut down, seas made dirty','and many kinds of plants and animals put close to dying out,','so some people say the harm people have done','can no longer be fixed.'],
  ['I understand why some people think this,','but I believe real steps can still make the harm smaller','and help nature grow back.'],
  ['People who think nothing can change often say','that some harm to nature lasts forever.'],
  ['For example, once a kind of animal dies out,','no new rule or public effort can bring it back.'],
  ['Also, modern life uses many things that hurt natural places,','such as large farms, new roads, flying','and making goods in factories.'],
  ['These are not little habits people can stop in one day;','they have become part of how businesses and money work.'],
  ['So even when governments promise to protect nature more,','companies and buyers often still choose what is easy,','earns money and helps the economy grow quickly for now.'],
  ['From this view, the harm people do','can seem like a very strong wave','that cannot be pushed back.'],
  ['But I think that way of thinking','gives up too soon.'],
  ['Some losses can never be fixed,','but much harm to nature can be reduced,','made slower or even partly put right.'],
  ['Governments can keep forests safe,','stop hunting that breaks the law, bring wet places back','and punish companies that make rivers dirty','or destroy places where animals live.'],
  ['At the same time, people can change what they buy','by wasting less food, choosing goods','made in ways that do less harm','and helping projects that protect nature.'],
  ['For example, if a city keeps green places safe','and limits building, birds, insects and local plants','may return little by little.'],
  ['Nature can often grow back surprisingly well','when people stop harming it again and again.'],
  ['To sum up, people have clearly done serious harm','to nature, and some of that harm','cannot be put right.'],
  ['Even so, I strongly think','things can still change.'],
  ['With strong rules, companies that act carefully','and better everyday choices, people can stop','making the harm worse and give plants and animals','a real chance to live.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('People have altered city life on an unprecedented scale.','以 on an unprecedented scale 說人類改變自然的幅度',[1,2,15],fixed(0,'[人類] have altered [自然世界] on an unprecedented scale.','開篇確立環境變化的規模異常大。','要先指出某行動對一個領域造成前所未見的大幅改變時。',[' have altered ', ' on an unprecedented scale.'],['造成改變者','受到改變的領域'])),
  card('Because costs have risen and stores closed, some people argue that the neighbourhood is now beyond repair.','以 Because ... some argue ... 說破壞嚴重導致無法修復論',[0,3,4],fixed(1,'Because [森林海洋物種受損], some people argue that [動植物傷害] is now beyond repair.','列不可忽視的環境損失，再準確呈現悲觀派。','要先列數項損失，再說為何有人得出「已不可修復」的判斷時。',['Because ', ', some people argue that ', ' is now beyond repair.'],['引發悲觀的損失','被判不可修復的結果'])),
  card('While I understand this concern, I believe that practical steps can still reduce the risk and allow people to recover.','以 While I understand ... I believe ... 承認悲觀再選行動',[1,9,16],fixed(2,'While I understand [悲觀看法], I believe that [實際行動] can still [減少傷害] and allow [自然恢復].','引言承認損失嚴重，仍主張減害與恢復可行。','要尊重一方擔憂，但清楚表明仍有可行補救措施時。',['While I understand ', ', I believe that ', ' can still ', ' and allow '],['先承認的擔心','可採取的行動','行動的第一結果','可能恢復的對象'])),
  card('Those who think reform is impossible usually point to the lasting nature of some damage.','以 Those who think ... point to ... 公平概括悲觀理由',[1,4,6],fixed(3,'Those who think [改變不可能] usually point to [某些破壞永久性].','悲觀派認為有些環境傷害不可逆。','要先公平概括反方的核心證據，而非立即否定時。',['Those who think ', ' usually point to '],['被討論的絕對看法','支持該看法的理由'])),
  card('Once a historic building disappears, for instance, no campaign can bring it back.','以 Once ... no ... can ... 舉不可逆損失',[3,5,10],fixed(4,'Once [一個物種消失], for instance, no [法律或運動] can [令它回來].','滅絕一旦發生，不能把同一物種復活。','要舉出真正不可逆轉的損失，並說後續行動的界線時。',['Once ', ', for instance, no ', ' can '],['已不可逆的事件','事後可能提出的措施','措施做不到的事'])),
  card('In addition, daily life depends heavily on systems that use energy, such as roads, flights and factories.','以 In addition ... depends ... such as ... 說現代經濟依賴有害活動',[3,6,7],fixed(5,'In addition, [現代生活] depends heavily on [傷害生態的活動], such as [農業、道路、飛行與工業].','悲觀派第二理由：破壞性活動與現代生活緊密相連。','已列不可逆損失，還要說明問題與日常制度糾纏並舉例時。',['In addition, ', ' depends heavily on ', ', such as '],['被依賴的生活系統','制度中難移除的活動','其具體例子'])),
  card('These are not small habits that can be changed overnight; they are woven into how cities work.','以 not small habits ... woven into ... 說不能一夜改變',[5,7,8],fixed(6,'[這些活動] are not [一夜可改的小習慣]; they are woven into [經濟運作].','問題不是個人隨手能改的小習慣，而是制度的一部分。','要說明某問題之所以難改，是因它深植於制度而非孤立習慣時。',[' are not ', '; they are woven into '],['難改的活動','過分簡化的描述','它深植的系統'])),
  card('As a result, even when leaders promise safer streets, firms often continue to prioritise speed and short-term profit.','以 even when ... still ... 說承諾未必改變短期誘因',[5,6,8],fixed(7,'As a result, even when [政府承諾環保], [企業消費者] often continue to prioritise [便利、利潤及短期增長].','政府承諾與企業消費者的短期選擇可能脫節。','要指出政策承諾存在，實際決策仍受短期誘因牽引時。',['As a result, even when ', ', ', ' often continue to prioritise '],['已作出的承諾','仍作選擇的人','實際優先的短期利益'])),
  card('From this perspective, the problem seems like a wave too powerful to turn back.','以 tide 比喻悲觀派認為影響不可逆',[6,7,9],fixed(8,'From this perspective, [人類影響] seems like [無法逆轉的強大潮水].','把悲觀派的不可逆感概括成潮水比喻。','前面已列困難，要用形象比喻呈現一方覺得力量太大、無從逆轉時。',['From this perspective, ', ' seems like '],['被評估的問題','過於強大的比喻'])),
  card('However, I would argue that this view is too pessimistic.','以 However ... too defeatist 轉入反對完全放棄',[2,8,10],fixed(9,'However, I would argue that [完全無法改善的觀點] is too [悲觀而放棄過早].','作者接受損失嚴重，但反對因此否定一切補救。','已公平陳述難題，要指出「沒有任何事可做」的結論過度消極時。',['However, I would argue that ', ' is too '],['被質疑的看法','它的判斷問題'])),
  card('Although some costs cannot be recovered, many problems can be limited or partly reversed.','以 Although ... many ... can ... 限定損失但保留可改善部分',[4,9,11],fixed(10,'Although [有些損失不可逆], [多種環境破壞] can be [限制、減慢或部分逆轉].','把不可逆與仍可改善的傷害分開，避免全有全無。','要承認一部分不可修復，同時精確說明其他部分仍可改善時。',['Although ', ', ', ' can be '],['必須承認的永久損失','仍有改善空間的部分','可行的改善程度'])),
  card('Governments can protect parks, restore rivers and punish firms that dump waste.','以 Governments can ... and punish ... 列政府可直接採取的措施',[10,12,13],fixed(11,'Governments can [保護森林、限非法狩獵、修濕地] and punish [企業] that [污染河流或毀棲地].','給出可執行的法律與保育措施，而非空泛希望。','要把「可行動」落實成政府可做的保護、修復與執法工作時。',['Governments can ', ' and punish ', ' that '],['政府可執行的保育工作','應負責的企業','須受到制裁的破壞'])),
  card('At the same time, families can change demand by buying less wastefully and choosing safer goods.','以 At the same time ... by ... 補上個人改變需求途徑',[11,13,17],fixed(12,'At the same time, [個人] can change [需求] by [減少浪費、選可持續產品及支持保育].','政府行動之外，個人消費選擇也能改變市場。','已列公共措施，要補充個人可透過幾項日常選擇改變需求時。',['At the same time, ', ' can change ', ' by '],['同樣能行動的人','能影響的市場方向','實際可作的選擇'])),
  card('For example, when a city protects old trees and limits building, birds can return over time.','以 when ... can return over time 舉保護棲地後恢復例子',[11,12,14],fixed(13,'For example, when [城市保護綠地控制開發], [鳥蟲本地植物] can return over time.','受保護的棲地給物種逐步回來的機會。','要用城市政策的具體例子說明限制破壞後，生命可逐漸恢復時。',['For example, when ', ', ', ' can return over time.'],['改變環境的保護行動','逐步回來的生命'])),
  card('Nature is often remarkably resilient if people stop putting pressure on it.','以 resilient if ... 從例子抽出自然復原條件',[10,13,15],fixed(14,'[自然] is often remarkably resilient if [人停止持續施壓].','恢復不是必然；停止反覆破壞是前提。','已見具體復原例子，要抽出「減少持續壓力才有恢復力」的條件時。',[' is often remarkably resilient if '],['可能恢復的系統','必須先減少的壓力'])),
  card('In conclusion, road building has undoubtedly caused deep harm to the area, and some of that damage cannot be undone.','以 and some ... cannot be undone 承認部分傷害永久',[1,10,16],fixed(15,'In conclusion, [人類活動] has undoubtedly caused [深重自然傷害], and some of that damage cannot be undone.','結論不淡化既有傷害，也不否認部分不可挽回。','要在結尾誠實承認已造成的嚴重損失及其部分不可逆時。',['In conclusion, ', ' has undoubtedly caused ', ', and some of that damage cannot be undone.'],['造成傷害的活動','不能輕描淡寫的損失'])),
  card('Nevertheless, I strongly believe that improvement is still possible.','以 Nevertheless 讓步損失後重申改善可行',[2,9,15],fixed(16,'Nevertheless, I strongly believe that [改變] is still possible.','嚴重傷害不等於所有改善都已無望。','已承認重大甚至不可逆損失，仍要重申可改善的立場時。',['Nevertheless, I strongly believe that ', ' is still possible.'],['仍可實現的改變'])),
  card('With strong rules, careful companies and better choices, a town can stop the harm getting worse and give wildlife a real chance to thrive.','以 With ... can ... and give ... 說三方行動帶來生存機會',[11,12,16],fixed(17,'With [嚴格法律、負責企業及審慎選擇], [人類] can stop [問題惡化] and give [動植物] a real chance to [生存].','最後把政府企業個人的行動連到動植物存活。','要以多方措施收束，說明既可止損也可給受害者恢復機會時。',['With ', ', ', ' can stop ', ' and give ', ' a real chance to '],['需要配合的多方措施','能採取行動的主體','先要停止的惡化','因此受益的生命','最終爭取的結果'])),
];
const wrongReasons=[
  ['這句列森林海洋物種損失與悲觀看法，未先設定改變規模。','這句已表達仍可行動的立場，原句先描寫背景。','這句是結論承認傷害，未作開篇環境變化設定。'],
  ['這句只說人類大幅改變自然，未列損失與不可修復判斷。','這句概括悲觀派指向永久傷害，原句先列具體例子。','這句是物種滅絕個案，未並列森林海洋物種三種損失。'],
  ['這句只報告悲觀者說無法修復，未表達作者理解後仍選行動。','這句已在主體段批評過早放棄，原句是引言立場。','這句結論簡短重申可能改變，未提減害與自然恢復。'],
  ['這句以多種環境破壞引出悲觀者，未抽出永久性核心理由。','這句是物種滅絕的具體例子，未先概括反方依據。','這句談經濟活動難移除，與不可逆損失的理由不同。'],
  ['這句概括部分損害永久，未以 Once 舉不能復活物種。','這句列現代生活依賴的有害活動，未說真正不可逆事件。','這句承認部分不可逆仍可改善其他傷害，與悲觀派例子用途不同。'],
  ['這句是物種滅絕例子，未轉到現代生活對傷害性活動的依賴。','這句概括活動已融入經濟，未列農業道路飛行等項目。','這句談政策承諾與短期誘因，未先列制度中的活動。'],
  ['這句列農業道路航空工業，未說它們不能一夜移除的制度原因。','這句說承諾與實際誘因脫節，未界定活動深植經濟。','這句潮水比喻仍是悲觀派感受，未分析制度的難改。'],
  ['這句說有害活動深植制度，未加入即使政策承諾仍優先短利的反差。','這句以潮水比喻無法逆轉感，未解釋企業消費者的選擇。','這句已開始作者反駁，與此處悲觀派的分析不同。'],
  ['這句分析短期利益的選擇，未把悲觀派感受化作潮水比喻。','這句指出過早放棄，未先完整呈現悲觀方的無力感。','這句承認部分不可逆、部分可改善，未描述悲觀方的看法。'],
  ['這句在引言說實際行動仍可減害，未在主體段批評絕對悲觀。','這句潮水比喻呈現悲觀派，未用 However 作作者轉折。','這句已細分不同傷害可改善程度，未先指出全盤放棄的問題。'],
  ['這句舉物種滅絕而無法挽回，未與其他可改善傷害作對照。','這句只批評觀點過度悲觀，未以 Although 劃分永久與可逆。','這句列政府具體措施，未先界定改善的可能程度。'],
  ['這句先說多種傷害可限制減慢，未列政府保護修復執法辦法。','這句列個人的消費選擇，未說政府可做甚麼。','這句是城市綠地例子，未並列保護森林與懲罰污染者。'],
  ['這句列政府可用的法律與保育措施，未補上個人需求。','這句是城市保護綠地的例子，未說個人如何改變消費。','這句結尾概括多方措施，原句先列個人的選擇。'],
  ['這句列政府的幾項措施，未用城市綠地個案展示恢復。','這句說個人如何改變需求，未呈現鳥蟲植物慢慢返回。','這句從個案抽出自然復原力，原句先給具體場景。'],
  ['這句說某城市綠地恢復，未抽成停止施壓的普遍條件。','這句結論承認人類傷害，未說自然可在減壓下復原。','這句重申變化可行，未提出 if 的復原條件。'],
  ['這句引言列嚴重損失，未在結論重申不可逆的範圍。','這句承認部分永久又說其他可改善，原句先收束既有傷害。','這句已重申改變仍可行，未先承認人類造成的損失。'],
  ['這句在引言已表達仍有行動可能，未以 Nevertheless 回應結論讓步。','這句主體段批評悲觀者，未在結論明確重申可能改變。','這句結論先承認傷害，未反轉到仍有希望的立場。'],
  ['這句列政府可採的保育措施，未連企業個人與最後生存機會。','這句只列個人可改變需求，未綜合政府企業個人。','這句簡短說改變仍可能，未說如何止損與幫助動植物。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清哪些損失真正不可逆，再看仍可限制、放慢或部分扭轉的傷害。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目比較對動植物傷害的哪兩種判斷？',[
    '傷害已無法改變，與採取行動仍可改善',
    '只比較陸地動物和海洋動物的外形',
    '只比較不同城市的道路名稱及長度',
    '只比較工廠與農場誰使用更多紙張',
  ],'兩方爭論環境傷害能否透過行動改善。'),
  {type:'multi',prompt:'選出作者對環境傷害的完整看法',detail:'選兩項，再按「確認」。',options:[
    '某些已發生的損失，例如滅絕，確實無法逆轉',
    '仍可限制其他破壞、修復棲地並阻止惡化',
    '只要立法，所有已滅絕物種都會立即復活',
    '只因有些損失永久，就不應再保護任何植物',
  ],correct:[0,1],why:'作者承認部分不可逆，反對因此放棄所有可行補救。'},
];
const route=[sequence('依文章次序排列環境恢復論證',[
  ['引言定立場','破壞規模大；作者理解悲觀，仍主張行動可減害。'],
  ['悲觀方理由','物種滅絕不可逆，現代經濟深依賴有害活動。'],
  ['作者的反駁','部分傷害可限制、放慢、部分逆轉；政府個人可做事。'],
  ['結論多方協力','法律、企業與日常選擇能止損並保留生存機會。'],
],'核心不是保證所有損失都能復原，而是指出仍可改善的範圍和方法。')];
const evidence=[
  quiz('悲觀者舉哪項真正不可逆的損失？',[
    '物種一旦滅絕，法律或活動也不能令它復活',
    '一條街道建成後，永遠無法再種任何樹',
    '只要飛機起飛，所有海洋便立即完全消失',
    '工廠有利潤時，所有動物都已經自然復原',
  ],'物種滅絕是原文的不可逆例子。'),
  quiz('現代生活為何令環境問題難改？',[
    '農業道路航空工業已深植經濟，難以一夜移除',
    '現代生活只靠單一個人習慣，改變毫無難度',
    '所有企業已完全放棄便利和短期利潤',
    '環境損害只由一個家庭的花園造成',
  ],'悲觀者指出有害活動與經濟運作相連。'),
  quiz('作者如何避免全有全無的判斷？',[
    '承認有些損失永久，也指出其他傷害可減慢或修復',
    '宣稱每一種已滅絕生物都可立即恢復',
    '認定任何一項改善都不可能有實際作用',
    '只討論法律字眼，完全不考慮自然變化',
  ],'不同損失有不同可逆程度。'),
  quiz('政府可用哪些具體措施？',[
    '保護森林、限制非法狩獵、修濕地並懲罰污染者',
    '只發口號，不保護任何棲地也不執法',
    '只要求居民買新手機，完全不管河流污染',
    '只在城市建更多道路，不限制任何開發',
  ],'原文列保護、修復與執法三類措施。'),
  quiz('個人能如何改變市場需求？',[
    '減少食物浪費、選較可持續產品及支持保育',
    '只要求政府行動，自己所有購買選擇都不變',
    '只在社交媒體看照片，從不調整消費方式',
    '只買更多浪費資源的產品，期待需求自行下降',
  ],'個人選擇可影響需求，與政府措施互補。'),
  quiz('城市保護綠地的例子如何支持可能恢復？',[
    '限制開發後，鳥蟲和本地植物可逐步回到棲地',
    '所有物種無須棲地，一建大樓便自然復原',
    '只要保護一塊綠地，所有滅絕物種立即復活',
    '綠地一旦受保護，政府便不再需要控制開發',
  ],'例子展示減少持續壓力後的逐步恢復。'),
  quiz('結論提哪三方面配合？',[
    '嚴格法律、負責任企業和較審慎的日常選擇',
    '只有一條法律，毋須企業或消費者改變',
    '只有企業口號，毋須執法或消費選擇',
    '只有個人購物，毋須處理污染企業',
  ],'多方行動才能止損並給動植物機會。'),
];
const logic=[
  sequence('為何有人認為傷害無法改變',[
    ['不可逆事件','物種一旦滅絕，無法靠法律使它復活。'],
    ['制度依賴','農業道路航空工業與經濟深度相連。'],
    ['短期誘因','政策承諾下，企業消費者仍追求便利利潤。'],
    ['悲觀總結','人類影響看似無法逆轉的潮水。'],
  ],'悲觀方有實質理由，但把部分永久損失推成全部無望。'),
  sequence('為何作者認為仍可改善',[
    ['分清範圍','有些損失不可逆，其他破壞可限制或部分修復。'],
    ['政府措施','保森林、限非法狩獵、修濕地、罰污染者。'],
    ['個人選擇','少浪費、選較可持續產品、支持保育。'],
    ['具體恢復','保護城市綠地後鳥蟲與本地植物可回歸。'],
    ['多方結論','法律企業與個人行動可止損、保留生存機會。'],
  ],'補救的目標是減少持續壓力和阻止惡化，並非復活已滅絕物種。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('某海灣有物種已經滅絕，但其他魚類仍因污染而減少；有人因此主張完全放棄保護。','哪項最符合範文的分界？',[
    '承認滅絕無法挽回，仍可減少污染保護尚存魚類',
    '只記錄已滅絕物種，不減少尚存魚類面對的污染',
    '只處理污染來源，不承認已滅絕物種無法挽回',
    '只補養殖魚數量，不修復海灣其他生存條件',
  ],['分清不可逆的個案與仍可減害的部分。','已滅絕不能復活，但尚存魚類仍需減污保護。','減污重要，也要準確承認不可逆的一面。','補魚數未修復整體海灣生存條件。'],[4,9,10,16],'作者承認物種滅絕不可逆，但其他傷害仍可限制或部分修復。'),
  transfer('城市想讓鳥類重返舊區，計劃保護樹木及限制新建築佔用綠地。','範文中的哪項機制最貼近？',[
    '減少棲地壓力，鳥與植物可逐步回來',
    '只限制新建築，不維護已受損的樹木',
    '只種新樹，不限制佔用舊區綠地的工程',
    '只監察鳥數，不減少城市棲地壓力',
  ],['保護與控制開發可讓仍在的物種逐步恢復。','限制建築有用，樹木棲地也須保護。','種新樹有用，佔綠地的工程仍可抵消效果。','監察只見結果，未減少棲地壓力。'],[11,13,14],'城市保護綠地並控開發，鳥蟲和本地植物可逐步回歸。'),
  transfer('政府宣布減碳計劃，但企業仍只看眼前利潤，消費者仍只選最方便的產品。','這最貼近哪項悲觀方理由？',[
    '環保承諾仍受短期誘因牽動實際選擇',
    '只重複政府承諾，不問企業消費者如何選擇',
    '只責怪消費者，不分析企業短期利潤誘因',
    '只看企業報告，不觀察實際產品選擇',
  ],['原文對照政策承諾與短期便利利潤。','承諾不能代替實際選擇。','消費者有責，企業短期利潤誘因也需分析。','報告不是企業和消費者實際行動的全部。'],[5,6,7],'即使政府承諾環保，企業消費者仍可能優先短期利益。'),
  transfer('一個農區依賴大規模耕作養活居民，也想減少對野生動物的傷害。','哪項最符合範文對難度的分析？',[
    '耕作深植經濟，難一夜停下，仍可逐步減少傷害',
    '立即全面停止耕作，不處理居民的糧食需求',
    '只保留現有耕作，不逐步降低野生動物傷害',
    '只比較農產數量，不問耕作與棲地的取捨',
  ],['承認制度依賴，同時不把難改推成完全無望。','全面停耕忽略農區糧食與經濟依賴。','維持耕作仍可逐步降低對野生動物的傷害。','產量不是生計與棲地取捨的完整分析。'],[5,6,10,17],'有害活動深植經濟，難以一夜移除，但仍可採行動減害。'),
  transfer('河流被工廠排污，市政府想採取有執行力的措施。','哪項最貼近範文的政府角色？',[
    '查處排污企業，同時修護河流棲地',
    '只宣傳清潔河流，不調查工廠實際排放',
    '只懲罰企業，不修復已受污染的棲地',
    '只保護河岸植物，不制止持續排污',
  ],['政府可執法並保護自然資源。','宣傳未調查和處罰實際排放。','懲罰有用，棲地亦須保護。','保護河岸不足以止住新的排污。'],[10,11,17],'政府可保護棲地並懲罰污染河流的企業。'),
  transfer('居民想在家中減少環境傷害，但無法親自制定保護森林的法律。','哪項最符合範文的個人作用？',[
    '少浪費，選可持續產品並支持保育',
    '只減少家中用水，不問食品與產品選擇',
    '只捐保育項目，不改日常食物浪費',
    '只改個人習慣，不支持更廣的保育工作',
  ],['個人透過需求端與政府措施互補。','用水有價值，但範文還提到食物與產品選擇。','捐款有用，仍可減少日常浪費。','個人習慣之外，可支持保育項目。'],[11,12,17],'個人可透過減少浪費、可持續產品及保育支援改變需求。'),
  transfer('有人說一片濕地受損後，所有生物都不可能回來，修復工作必定白費。','哪項最準確回應？',[
    '停下破壞並修濕地，物種可能逐步回來',
    '只宣布修復計劃，不停止持續破壞棲地',
    '只保護仍存物種，不改善它們的濕地條件',
    '只看一次鳥類數量，不追蹤棲地恢復',
  ],['自然有條件的恢復力，不等於所有損失可逆。','修復前須停止持續施壓。','物種保護需要相配的濕地棲地。','一次數量不足以判斷逐步恢復。'],[10,11,13,14],'自然在持續壓力減少後可展現恢復力。'),
  transfer('一個舊城區部分歷史建築已拆，其他建築仍可修復；有人說既然不能重建全部，就不必保留剩下的。','哪項推理最接近範文？',[
    '承認已拆的無法復原，仍保護可修建築',
    '只記錄已拆建築，不安排剩餘建築修復',
    '只修一座建築，不評估其他可保留部分',
    '只建模型回憶過去，不保護仍存在的建築',
  ],['不可逆與可改善的部分要分開判斷。','已失去部分不能重建，剩餘仍可保護。','一座有用，題目還有其他可修復建築。','模型記錄不能代替保護現存建築。'],[4,9,10],'部分損失不可逆，不代表其他傷害不能限制或修復。'),
  transfer('社區計劃同時要求地方政府執法、企業減污和居民少用一次性用品。','這最貼近範文的哪種結論？',[
    '政府企業居民各盡責，提高生物存活機會',
    '只要求政府執法，不看企業與居民減少污染',
    '只依靠居民少用用品，不監管企業排污',
    '只看企業承諾，不檢查地方執法成效',
  ],['政府企業個人配合，目標是止損與保留機會。','政府重要，但企業減污和居民選擇也有作用。','居民行動有用，企業排污仍需監管。','企業承諾須有執法檢查。'],[11,12,17],'法律、負責企業及審慎選擇可止損並給動植物機會。'),
  transfer('學校辯論要求學生評估「環境破壞已經太嚴重，所以再努力也沒用」這句話。','哪個答案最貼近作者立場？',[
    '部分損失永久，仍可減害並修復一些棲地',
    '只承認永久損失，不處理仍可修復的棲地',
    '只談修復成功，不承認部分損失無法逆轉',
    '只計目前物種，不分析日後傷害是否可減',
  ],['作者反對把部分不可逆直接推成全盤無望。','永久損失真實，但不應放棄可修復部分。','修復可能有效，仍須承認不可逆損失。','現況統計未回答能否減少往後傷害。'],[1,2,9,10,15,16],'作者承認深重傷害，仍相信限制、減緩和部分逆轉可能。'),
];
export default {key:'discuss-both-views:19',meta:{topic:'人類對動植物的傷害是否仍可改善',summary:'有些滅絕無法挽回，經濟依賴也使改變困難；但政府、企業與個人仍能止損並修復部分棲地。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
