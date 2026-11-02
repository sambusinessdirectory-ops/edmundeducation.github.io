// Online contact versus deeper relationships: acknowledge access, weigh quality.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:39'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In the last few years, talking online has become a very common way to meet people and keep in touch.',
 'Some say removing distance makes relationships stronger, but I think, overall, online contact has left many people feeling more alone.',
 'First, the internet really can help people feel closer.',
 'Social media, message apps and online groups let people keep in touch even when they live far apart.',
 'This is very useful for families living apart for work, study or moving countries: they can share daily news almost at once instead of waiting to visit.',
 'The internet also helps people who do not feel welcome where they live find others who like the same things.',
 'For example, a quiet student who finds school friendships hard may feel better joining an online music, game or art group.',
 'In this way, talking online can help people meet others they might never meet otherwise.',
 'But I think a stronger point is that making friends online often leads to weaker and less happy relationships.',
 'People may spend hours looking at posts, sending short messages or reacting to pictures, but these small exchanges rarely feel as deep as talking in person.',
 'When people get used to talking through screens, they may slowly stop meeting friends, noticing body language or having hard but important conversations in real life.',
 'For example, friends may sit in the same café while each one looks only at their own phone.',
 'They may be close together in the room, but they are far apart as friends.',
 'After a while, relationships may become easier to manage but feel less important.',
 'To sum up, the internet certainly makes it easier to contact people and make new friends.',
 'Still, I think it leaves society more alone because talking online too often takes the place of real contact instead of making it stronger.',
];
const vocabulary=[
 v(['In recent years','In the last few years','近年'],['online communication','talking online','網上溝通'],['maintain social contact','keep in touch','維持聯繫']),
 v(['removing barriers of distance','removing distance','消除距離障礙'],['on balance','overall','整體而言'],['socially isolated','feeling more alone','社交孤立']),
 v(['On the one hand','First','一方面'],['certainly','really','確實'],['bring people closer together','help people feel closer','拉近距離']),
 v(['Social media platforms','Social media','社交平台'],['messaging apps','message apps','通訊程式'],['online communities','online groups','網上社群'],['stay in touch','keep in touch','保持聯絡']),
 v(['especially valuable','very useful','尤其有價值'],['separated','living apart','分隔'],['migration','moving countries','移民'],['almost instantly','almost at once','幾乎即時'],['occasional visits','waiting to visit','偶爾探訪']),
 v(['feel excluded','do not feel welcome','感到被排斥'],['local environment','where they live','本地環境'],['similar interests','like the same things','相同興趣']),
 v(['shy student','quiet student','害羞學生'],['struggles to make friends','finds school friendships hard','難交朋友'],['more confident','feel better','更有信心'],['joining an online group','joining an online','加入網上群組']),
 v(['In this sense','In this way','從此意義'],['digital communication','talking online','數位溝通'],['act as a bridge','help people meet','搭橋'],['otherwise never meet','never meet otherwise','原本不會遇見']),
 v(['However','But','然而'],['stronger argument','stronger point','更有力論點'],['online socialising','making friends online','網上社交'],['thinner','weaker','薄弱'],['less satisfying','less happy','較不滿足']),
 v(['scrolling through posts','looking at posts','瀏覽帖文'],['reacting to photos','reacting to pictures','回應照片'],['interactions','small exchanges','互動'],['emotional depth','feel as deep','情感深度'],['face-to-face conversation','talking in person','面對面談話']),
 v(['become used to','get used to','習慣'],['communicating through screens','talking through screens','透過螢幕溝通'],['gradually lose the habit','slowly stop','逐漸失去習慣'],['reading body language','noticing body language','理解肢體語言'],['awkward but necessary','hard but important','尷尬卻必要']),
 v(['For instance','For example','例如'],['absorbed in','looks only at','沉浸於'],['their own phone','their own phone','自己的手機']),
 v(['Although','but','雖然'],['physically close','close together in the room','身體接近'],['socially distant','far apart as friends','社交疏離']),
 v(['Over time','After a while','長遠而言'],['convenient','easier to manage','方便'],['less meaningful','less important','較缺意義']),
 v(['In conclusion','To sum up','總結'],['undoubtedly','certainly','無疑'],['contact one another','contact people','互相聯絡'],['form new connections','make new friends','建立新關係']),
 v(['Nevertheless','Still','然而'],['more isolated overall','more alone','整體更孤立'],['replaces','takes the place of','取代'],['rather than strengthens','instead of making it stronger','而非加強'],['genuine human contact','real contact','真實人際接觸']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));return {formula:s.formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'online communication',replacement:'video calling',slot:'近期普及的溝通方式',formula:'In recent years, [方式] has become one of the most common ways to [社交用途]',meaning:'網上交流已成認識和聯繫他人的常見途徑。',usage:'當引言要交代一種近年普及的社會行為時。',relation:'現在完成式交代近期變化',d:[2,8,14]},
 {target:'removing barriers of distance',replacement:'making daily contact easier',slot:'支持者所指的好處',formula:'While some argue that [好處], I believe that [整體壞處]',meaning:'作者承認跨距聯繫好處，總體仍認為更孤立。',usage:'當引言要承認一項好處，仍作相反的整體判斷時。',relation:'While 作讓步而 on balance 定權衡',d:[2,8,15]},
 {target:'the internet',replacement:'video calling',slot:'可能拉近人的媒介',formula:'On the one hand, [媒介] can certainly bring people closer together',meaning:'先承認網絡可拉近距離。',usage:'當第一方的說法確有根據，需先公平承認時。',relation:'On the one hand 公平開首方',d:[8,9,15]},
 {target:'Social media platforms, messaging apps and online communities',replacement:'Video calls, group chats and shared photo albums',slot:'具體溝通工具',formula:'[工具] allow individuals to stay in touch even when [距離]',meaning:'通訊工具讓異地的人保持聯絡。',usage:'當要以多個具體工具支持一項溝通功能時。',relation:'even when 指遠距離仍可聯繫',d:[8,9,15]},
 {target:'families separated by work, study or migration',replacement:'friends separated by work or travel',slot:'特別受益的人',formula:'This is especially valuable for [群體], as [即時好處] rather than [舊做法]',meaning:'分隔家庭可即時分享日常，而不用等待探訪。',usage:'當你要指出同一便利對某個群體特別重要時。',relation:'as 解釋特別受益的原因',d:[8,9,15]},
 {target:'people who feel excluded in their local environment',replacement:'people who live in small towns',slot:'線下較難找到同伴的人',formula:'The internet also helps [群體] to find others with similar interests',meaning:'本地感排斥者可找志同道合者。',usage:'當你要補充一項服務對較難接觸同伴的人有用時。',relation:'also 引入第二種受益者',d:[8,9,15]},
 {target:'a shy student',replacement:'a new student',slot:'具體例子的人物',formula:'For example, [人物] may feel more confident joining [合適群體]',meaning:'害羞學生可在網上興趣群組更有信心。',usage:'當你要用一個具體人物展示普遍好處如何發生時。',relation:'For example 把弱聯繫群體具體化',d:[8,9,15]},
 {target:'digital communication',replacement:'online hobby groups',slot:'搭橋的媒介',formula:'In this sense, [媒介] can act as a bridge between people who might otherwise never meet',meaning:'數位溝通可讓原本不會相遇的人相識。',usage:'當舉例後要概括一種媒介的連接作用時。',relation:'In this sense 概括跨人群連結',d:[8,9,15]},
 {target:'online socialising',replacement:'brief group-chat contact',slot:'作者質疑的聯繫方式',formula:'However, I think the stronger argument is that [方式] creates [較弱聯繫]',meaning:'作者認為網上社交常更薄弱、不滿足。',usage:'當你要從公平承認的好處轉到自己認為更強的反論時。',relation:'However 加 stronger argument 轉作者重點',d:[2,3,15]},
 {target:'scrolling through posts, sending short messages or reacting to photos',replacement:'sending emojis, liking posts or sharing photos',slot:'頻繁卻較淺的互動',formula:'Many people spend hours [行為], but these interactions rarely provide [深度]',meaning:'大量簡短互動缺少面對面情感深度。',usage:'當要區分聯繫的次數與關係的深度時。',relation:'but 反轉數量多等於深度足的假設',d:[3,8,15]},
 {target:'communicating through screens',replacement:'texting in short messages',slot:'逐漸習慣的溝通方式',formula:'When people become used to [方式], they may gradually lose the habit of [線下能力]',meaning:'長期透過螢幕可削弱線下相處習慣。',usage:'當你要指出長期習慣可能替代另一項必要能力時。',relation:'When 加 may 演繹逐漸發生的風險',d:[3,8,15]},
 {target:'a group of friends',replacement:'two classmates',slot:'例子中的相聚者',formula:'For instance, [人們] may sit together while each is absorbed in [個人設備]',meaning:'朋友同坐咖啡店卻各看自己的手機。',usage:'當你要用可觀察的日常場景呈現抽象疏離時。',relation:'while 對照同處與各自看手機',d:[3,8,15]},
 {target:'physically close',replacement:'sitting nearby',slot:'空間上的接近',formula:'Although [空間接近], [社交距離遠]',meaning:'身體接近仍可社交疏離。',usage:'當你要用 Although 對照表面接近與實際關係時。',relation:'Although 把物理距離和關係品質分開',d:[3,8,15]},
 {target:'more convenient',replacement:'easier to maintain',slot:'看似得到的便利',formula:'Over time, this can make relationships feel [便利] but [缺少意義]',meaning:'關係更方便，卻可能更缺意義。',usage:'當你要比較某改變帶來的便利與其品質代價時。',relation:'but 總結便利與意義的取捨',d:[3,8,15]},
 {target:'the internet',replacement:'video calls',slot:'促進聯絡的工具',formula:'In conclusion, [工具] has made contact and new connections easier',meaning:'結論先承認聯繫變容易。',usage:'當結論要先保留反方確實成立的好處時。',relation:'undoubtedly 承認對方的真實收益',d:[8,9,15]},
 {target:'online interaction',replacement:'brief digital exchange',slot:'可能取代真實互動的方式',formula:'Nevertheless, [整體判斷] because [方式] replaces rather than strengthens [真實接觸]',meaning:'聯繫增加不保證不孤立；網上互動可能取代真實接觸。',usage:'當結論要區分補充一種好處與取代更重要的活動時。',relation:'because 加 replaces rather than strengthens 定核心機制',d:[8,9,14]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'區分聯絡方便與關係品質。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對網上社交的整體判斷是甚麼？',['雖有遠距聯繫好處，整體上卻使許多人更孤立。','網絡完全不能讓分隔家庭保持任何聯絡。','只要訊息數量增加，關係深度便必然提高。','朋友身處同一地方就一定會深入交談。'],'論文權衡的是關係品質，不只是聯絡次數。'),{type:'multi',prompt:'哪些例子支持文章兩方？',detail:'選兩項，再按「確認」。',options:['分隔家庭可即時分享日常。','同坐咖啡店卻各自看手機。','所有網上群組都禁止共同興趣。','短訊必然比面談更有情感深度。'],correct:[0,1],why:'一項支持跨距聯繫，一項展示同處仍疏離。'}];
const route=[sequence('還原四段論證',[['引言','網上社交普及；承認方便但判整體更孤立。'],['聯繫收益','遠距家人及本地難找同伴者可保持聯繫。'],['孤立機制','大量淺互動替代面談與肢體語言；同坐仍各看手機。'],['結論','承認聯絡容易，仍認真實接觸常被取代。']],'本文重點是接觸機會與關係品質的區別。')];
const evidence=[quiz('異地家庭具體得到甚麼便利？',['幾乎即時分享日常，而非只等偶爾探訪。','不再需要任何彼此交流或分享日常。','必須每週乘飛機才可以交換訊息。','工作學習或移民都不會令家人分隔。'],'即時分享克服距離。'),quiz('害羞學生的例子證明甚麼？',['興趣群組可連接本地難交朋友的人。','每位學生都必須加入相同的網上群組。','網絡讓所有害羞學生立刻不再害羞。','網上友誼必然完全取代學校友誼。'],'網絡可搭橋，但不保證取代全部線下關係。'),quiz('作者為何質疑頻繁短訊？',['互動次數多，仍可能缺少面談的情感深度。','短訊太慢，不能傳送任何文字或圖片。','每次按讚都必然造成嚴重社交衝突。','所有面對面談話都必然缺少情感。'],'數量與品質不同。'),quiz('咖啡店例子展示甚麼？',['同坐近處仍可能因各看手機而疏離。','坐在同一桌便保證有高品質交流。','手機令朋友永遠不能進入任何咖啡店。','所有網上群組都不容許朋友見面。'],'物理接近不保證社交接近。')];
const logic=[sequence('網絡如何拉近人',[['工具','社交平台、訊息程式及網上群組。'],['遠距','分隔家人幾乎即時分享生活。'],['排斥','本地難交朋友者找到相同興趣者。'],['概括','網絡搭起原本不會相遇者的橋樑。']],'先公平承認連結作用。'),sequence('為何仍可能更孤立',[['頻率','短訊按讚及瀏覽花大量時間。'],['品質','淺互動較少面談的情感深度。'],['習慣','線下見面與理解肢體語言漸少。'],['結論','網上交流取代而非加強真實接觸。']],'解釋取代機制而非只宣稱孤立。')];
const transfers=[
 transfer('異地家人每天用視像通話分享近況。','哪句支持網絡聯繫的一方？',['跨越距離的即時交流可維繫分隔家人的關係。','只要相隔兩地，家人便完全不能再分享生活。','視像通話會令所有家庭永遠不再親身探訪。','每天通話必然讓每段家庭關係比以前更差。'],['克服距離是確實收益。','相反。','不必然。','過度。'],[3,4],'distance barrier removed。'),
 transfer('學生身邊沒有人喜歡同一種音樂。','哪句能轉用搭橋的邏輯？',['網上興趣群組可幫他找到原本難以認識的同伴。','學生若沒有同好，就應永遠停止接觸其他人。','網上群組只能容許居住在同一條街的人加入。','找到網上同好代表線下所有友誼都毫無價值。'],['相同興趣跨本地限制。','不合理。','相反。','過度。'],[5,6,7],'bridge otherwise never meet。'),
 transfer('一人每天收到很多按讚，卻仍感到孤單。','哪句分析數量與品質差別？',['網上回應雖多，仍可能缺少深入交談的支持。','只要按讚夠多，所有孤單感就保證立即消失。','按讚數目足以證明所有朋友必定真誠了解他。','面對面談話一律比按讚淺薄，完全沒有例外。'],['互動量不等於情感深度。','不保證。','不能證明。','過度。'],[8,9],'thin connection despite frequency。'),
 transfer('四位朋友同桌用餐，卻全程只看手機。','哪句準確解釋例子？',['他們在空間上很近，互動上卻可能互相疏離。','他們身在同一張桌，便保證深度交流已發生。','只要有人帶手機，所有朋友便必定彼此討厭。','即使全程不說話，也可證明談話次數已增加。'],['物理接近不等於社交接近。','無保證。','無證據。','相反。'],[11,12],'physically close socially distant。'),
 transfer('作文只說「網絡令社會孤立」。','哪句補足可能的機制？',['過度依賴螢幕或使人漸少親身見面和理解表情。','網絡只要存在，就會立即禁止所有人見面談話。','不論使用時間多少，朋友都一定會忘記彼此名字。','因為螢幕有光，所以所有線下對話都不再必要。'],['習慣替代需說清楚。','過度。','無證據。','無關。'],[9,10],'screen habit replaces meetings。'),
 transfer('另一題問遠距辦公是否促進團隊合作。','哪句可借用本文的比較尺度？',['比較聯絡方便程度，亦要看互信與討論深度。','只要訊息速度較快，團隊互信便必然更深。','只要員工同坐一室，便不需任何真正的交流。','遠距和同處都不用看工作成果與合作感受。'],['方便與品質分開衡量。','不保證。','仍需交流。','要衡量。'],[3,9,12],'access versus connection quality。'),
 transfer('有人認為網上溝通全無好處。','哪句更公平地呈現文章？',['它可連異地人與同好，只是未必能替代深入面談。','它完全不能傳送任何生活訊息或共同興趣。','它既能連人，就必然讓所有人再也不會孤獨。','只要網上有朋友，線下交流就必須完全停止。'],['承認收益而指出限制。','不實。','過度。','不必。'],[3,5,14,15],'concede contact advantage。'),
 transfer('某人偏好短訊，漸漸不願處理尷尬面談。','哪句指出長期風險？',['長期習慣螢幕交流或削弱處理線下對話的能力。','短訊能保證每人愈來愈擅長處理所有難談話題。','尷尬面談完全沒有任何價值，理應全部取消。','只要能傳短訊，人便不再需要理解肢體語言。'],['線下能力或流失。','無保證。','過度。','仍需要。'],[10],'loss of real-life habits。'),
 transfer('文章結論要同時承認方便與指出孤立。','哪句最完整？',['聯絡雖更方便，但真實接觸若被取代仍可更孤立。','因網上聯絡方便，所以真實接觸必然同時增加。','因有人感孤立，便證明網絡不能幫助任何家庭。','聯繫方式只要改變，所有關係便會永久完全相同。'],['讓步與核心機制兼有。','不必然。','過度。','不合理。'],[14,15],'replaces rather than strengthens。'),
 transfer('朋友每週視像聯絡，也每月親身相聚。','哪句最合文章的限定說法？',['網上交流可補充真實接觸，問題在於它被用來取代。','只要用視像聯絡，朋友便必定永遠失去親密感。','只要每月見面，所有網上聯絡便必然完全無用。','兩種方式只可選其一，並不能同時服務友誼。'],['關鍵是補充還是取代。','過度。','仍有用。','可並存。'],[15],'supplement versus replace。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["跨越距離的即時交流可維繫分隔家人的關係。","家人能即時交談，關係仍主要取決於共同居住。","視像可看到表情，但不足以分享日常生活近況。","每天通話讓家人方便安排探訪，分隔時則少有交流。"],["網上興趣群組可幫他找到原本難以認識的同伴。","網上群組可提供新歌推薦，認識同伴仍靠同校活動。","學生能找到同好，但群組的作用只在購買音樂。","網上聊天方便，興趣相同者卻難以在其中結識。"],["網上回應雖多，仍可能缺少深入交談的支持。","按讚雖短暫，數量夠多便能代替深入交談。","孤單感主要取決於發文頻率，與支持深度無關。","網上回應多，便可推定朋友已理解他的處境。"],["他們在空間上很近，互動上卻可能互相疏離。","朋友能同桌吃飯，因此日後仍可再補回當晚交流。","看手機可分享資訊，但未注意彼此當下的感受。","四人距離很近，故能由沉默直接建立互相信任。"],["過度依賴螢幕或使人漸少親身見面和理解表情。","長時間用網絡可減少外出，卻不影響理解表情。","網上聯絡多了，親身見面次數應由平台決定。","螢幕交流能帶來資訊，孤立主要來自網速不穩。"],["比較聯絡方便程度，亦要看互信與討論深度。","可比較訊息數量與會議成本，互信則留待考核。","聯絡更快捷便是合作改善，討論深度可略過。","同處辦公可讓員工見面，工作成果則無需評估。"],["它可連異地人與同好，只是未必能替代深入面談。","網上溝通可連結異地人，故面談只用於緊急情況。","找到興趣群組可減孤單，可以少維持線下友誼。","網絡有方便之處，深入交流則主要靠按讚數量。"],["長期習慣螢幕交流或削弱處理線下對話的能力。","短訊可避免尷尬，但難談話題可交給別人處理。","他不願面談是性格問題，與長期螢幕習慣無關。","線下對話需要練習，短訊卻可直接取代該能力。"],["聯絡雖更方便，但真實接觸若被取代仍可更孤立。","聯絡更方便，故孤立感主要只由朋友數量決定。","真實接觸若減少，網上頻繁回應仍可充分補足。","網絡可能帶來孤立，結論因此不必談方便之處。"],["網上交流可補充真實接觸，問題在於它被用來取代。","視像能維繫友誼，親身相聚則可改為節日活動。","定期面談有益，網上交流只適合安排見面時間。","兩種方式可並存，卻未分辨補充與取代的差別。"]];
const editorialTransferReasons=[["相隔兩地也可藉即時分享維繫關係。","視像正能分享日常生活。","探訪可安排，但此例重點是分隔時的交流。"],["網上群組有助找同好，不限同校活動。","找到同伴不只用於購買音樂。","共同興趣正是群組結識新人的原因。"],["數量不能代替深入支持。","孤獨與交流質素有關。","按讚不能證明朋友理解處境。"],["日後可談，也不代表當晚有互動。","只看手機未必有注意朋友。","同桌距離近，不等於深度交流。"],["長用螢幕也可能削弱面對面理解。","平台不會自動決定人是否見面。","網速與原文的親身關係機制不同。"],["互信不能只留到考核時才看。","速度與討論深度是不同維度。","工作成果仍需評估。"],["線下面談仍有重要的深入支持作用。","找到同好不代表可停止其他友誼。","按讚數量不能代替深入交流。"],["把難談話題交他人，未解決自己的能力退化。","習慣螢幕可能影響面談能力。","短訊不能直接替代肢體與面談技能。"],["朋友數量不是孤立的唯一原因。","頻繁網上回應未必補足真實接觸。","結論須承認網絡聯絡的便利。"],["每月相聚也是重要安排，不只節日。","網上交流也能在分隔時維持友誼。","核心是補充有益、完全取代有風險。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[1].frame.parts=[["While some argue that ","link","句型固定部分"],["this has made human relationships stronger by removing barriers of distance","slot","好處"],[", I believe that ","link","句型固定部分"],["it has, on balance, made many people more socially isolated.","slot","整體壞處"]];
structures[4].frame.parts=[["This is especially valuable for ","link","句型固定部分"],["families separated by work, study or migration","slot","群體"],[", as ","link","句型固定部分"],["they can share daily experiences almost instantly","slot","即時好處"],[" rather than ","link","句型固定部分"],["waiting for occasional visits.","slot","舊做法"]];
structures[8].frame.parts=[["However, I think the stronger argument is that ","link","句型固定部分"],["online socialising often","slot","方式"],[" creates ","link","句型固定部分"],["a thinner and less satisfying form of connection.","slot","較弱聯繫"]];
structures[12].frame.parts=[["Although ","link","句型固定部分"],["they are physically close","slot","空間接近"],[", ","link","句型固定部分"],["they are socially distant.","slot","社交距離遠"]];
// Reviewed connector structure decompositions.
structures[11].frame.parts=[["For instance, ","link","句型固定部分"],["a group of friends","slot","同處的人"],[" may sit together in ","link","句型固定部分"],["a café","slot","同處地點"],[" while each person is absorbed in ","link","句型固定部分"],["their own phone","slot","各自注視的事物"],[".","link","句型固定部分"]];
structures[11].frame.formula="For instance, [同處的人] may sit together in [同處地點] while each person is absorbed in [各自注視的事物].";
structures[15].frame.parts=[["Nevertheless, I believe ","link","句型固定部分"],["it has made society more isolated overall","slot","整體判斷"],[" because ","link","句型固定部分"],["online interaction","slot","可能取代接觸的方式"],[" too often replaces, rather than strengthens, ","link","句型固定部分"],["genuine human contact","slot","本應加強的關係"],[".","link","句型固定部分"]];
structures[15].frame.formula="Nevertheless, I believe [整體判斷] because [可能取代接觸的方式] too often replaces, rather than strengthens, [本應加強的關係].";
structures[0].frame.parts=[["In recent years, ","link","句型固定部分"],["online communication","slot","普及的溝通方式"],[" has become one of the most common ways for people to ","link","句型固定部分"],["meet others and maintain social contact","slot","社交用途"],[".","link","句型固定部分"]];
structures[0].frame.formula="In recent years, [普及的溝通方式] has become one of the most common ways for people to [社交用途].";
structures[9].frame.parts=[["Many people now spend hours ","link","句型固定部分"],["scrolling through posts, sending short messages or reacting to photos","slot","頻繁的網上行為"],[", but these interactions rarely provide ","link","句型固定部分"],["the emotional depth of face-to-face conversation","slot","缺少的情感深度"],[".","link","句型固定部分"]];
structures[9].frame.formula="Many people now spend hours [頻繁的網上行為], but these interactions rarely provide [缺少的情感深度].";
// Source-aligned remaining frames.
structures[3].frame.parts=[["Social media platforms, messaging apps and online communities","slot","工具"],[" allow individuals to stay in touch even when ","link","句型固定部分"],["they live in different cities or countries.","slot","距離"]];
structures[6].frame.parts=[["For example, ","link","句型固定部分"],["a shy student who struggles to make friends at school","slot","人物"],[" may feel more confident joining ","link","句型固定部分"],["an online group about music, gaming or art.","slot","合適群體"]];
structures[10].frame.parts=[["When people become used to ","link","句型固定部分"],["communicating through screens","slot","方式"],[", they may gradually lose the habit of ","link","句型固定部分"],["meeting friends in person, reading body language, or dealing with awkward but necessary real-life conversations.","slot","線下能力"]];
structures[13].frame.parts=[["Over time, this can make relationships feel ","link","句型固定部分"],["more convenient","slot","便利"],[" but ","link","句型固定部分"],["less meaningful.","slot","缺少意義"]];
export default {key:'discuss-both-views:39',meta:{topic:'網上社交使人更親近還是更孤立',summary:'先承認網絡跨距聯繫家庭與同好的作用，再以短促互動、線下習慣流失及同桌各看手機說明接觸數量不等於關係深度。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
