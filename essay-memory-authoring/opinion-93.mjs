// Reviewed Opinion 93: personal technology and family communication.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-93-ielts-opinion.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['opinion:93'];const original=source.sentences.map(r=>r.english);
const simple=[
'Many homes now have phones, tablets and laptops, and parents and children often spend time alone with their own screens.',
'I fully agree that this hurts family relationships and makes communication harder, because it cuts the time they spend together and changes how they reply to each other.',
'First, personal devices take away the small everyday moments that help families become close.',
'Families rarely become close through one big talk; they build closeness by doing small things again and again, such as eating together, talking after school and helping with chores.',
'When everyone looks at a screen, families often miss these simple moments.',
'For example, a child may watch videos at dinner while parents reply to work messages, so they eat quietly instead of spending time together.',
'As this continues, family members can feel less close, because they may live in the same home but barely spend real time together.',
'Another problem is that devices can make conversations short and broken up.',
'Talking in person needs care, looking at each other and patience, but digital entertainment makes people expect something new all the time and fast answers.',
'If a teenager always wears headphones or checks social media, parents may struggle to know what worries them, who their friends are or how they behave.',
'Children may also feel that their parents are far away, even when the parents are in the room but thinking about something else.',
'This can reduce trust, and when people do not trust each other, small mistakes can turn into family arguments.',
'To sum up, I fully agree that when every person has their own device, family relationships and communication can break down.',
'By taking time away from daily talks and replacing serious conversation with distractions, personal devices can make a family home feel like separate rooms rather than one shared place.',
];
const vocabulary=[
[['increasingly filled with','now have','越來越多'],['retreat into separate digital worlds','spend time alone with their own screens','各自沉浸於螢幕']],
[['damages family relationships','hurts family relationships','損害家庭關係'],['weakens communication','makes communication harder','削弱溝通'],['reduces shared time','cuts the time they spend together','減少共處時間']],
[['personal technology','personal devices','個人科技產品'],['quietly replaces','take away','悄悄取代'],['family bonds are built','families become close','建立家庭關係']],
[['dramatic conversations','one big talk','重大談話'],['repeated small interactions','doing small things again and again','反覆的小互動'],['daily tasks','chores','日常事情']],
[['every family member','everyone','每位家人'],['these simple moments are easily lost','families often miss these simple moments','簡單時刻容易流失']],
[['during dinner','at dinner','晚餐時'],['answer work messages','reply to work messages','回覆工作訊息'],['a chance to reconnect','spending time together','重新相處的機會']],
[['Over time','As this continues','久而久之'],['emotional distance','feel less close','情感距離'],['no longer share the same space in any meaningful sense','barely spend real time together','沒有真正相處']],
[['Another serious problem','Another problem','另一個嚴重問題'],['shallow and fragmented communication','conversations short and broken up','膚淺而零碎的溝通']],
[['Face-to-face conversation','Talking in person','面對面交談'],['eye contact','looking at each other','眼神接觸'],['constant stimulation and quick replies','something new all the time and fast answers','持續刺激和迅速回覆']],
[['always wearing headphones','always wears headphones','總戴耳機'],['find it harder to understand','struggle to know','更難理解'],['their child’s worries, friendships or behaviour','what worries them, who their friends are or how they behave','孩子的煩惱、友誼或行為']],
[['Similarly','also','同樣地'],['distant figures','far away','疏遠的人'],['physically present but mentally elsewhere','in the room but thinking about something else','人在場而心不在焉']],
[['weakens trust','reduce trust','削弱信任'],['small misunderstandings','small mistakes','小誤解'],['family tension','family arguments','家庭矛盾']],
[['In conclusion','To sum up','總結'],['individual ownership of modern technology','every person has their own device','個人擁有科技產品'],['a breakdown in family relationships and communication','family relationships and communication can break down','家庭關係和溝通破裂']],
[['stealing everyday interaction','taking time away from daily talks','奪走日常互動'],['deep conversation','serious conversation','深入交談'],['a collection of isolated private worlds','separate rooms rather than one shared place','各自隔絕的私人世界']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const value=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error('Missing fixed wording '+(i+1)+': '+link);if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});if(slot!==labels.length)throw Error('Unmatched slot labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[', and', 'it is no longer unusual for '],['家中科技逐漸普及的觀察','與此並行的情況','出現新常態的人與行為'],'and 連接普及情況；no longer unusual 指一種行為已變得常見。','引言先說一項變化已普遍，再指出相伴出現的新日常時。','Phones fill many homes, and now it is no longer unusual for relatives to use separate screens.','and...no longer unusual','交代普及後的新常態'),
frame(1,['I fully agree that ', ', because ', ' and '],['作者同意的影響','第一條原因','第二條不同原因'],'because 後以 and 並列兩條理由，讓立場可在主體段展開。','引言須明確表態，並預告兩條可分別論證的原因時。','I fully agree that this weakens contact, because time together falls and replies become rushed.','agree...because...and','表態並預告雙重原因'),
frame(2,['The first reason is that ', ' through which '],['首先指出的變化','某種關係形成所依賴的時刻或方式'],'through which 交代前面那些日常時刻為何重要。','提出第一條原因後，須指出被取代之事原本有甚麼作用時。','The first reason is that screens replace meals through which families stay close.','reason...through which','指出被取代事物的作用'),
frame(3,[' do not usually ', '; they are ', ', such as '],['一種關係','並非主要靠甚麼建立','實際促成關係的做法','可觀察的小事例子'],'分號對比被誇大的途徑與真正重複出現的途徑；such as 落到例子。','需要更正一種過於戲劇化的想像，再列出日常機制和例子時。','Friendships do not usually grow overnight; they are built slowly, such as through regular calls.','not usually...; they are...such as','對比表面與日常機制'),
frame(4,['When ', ', these ', ' are '],['人人被螢幕佔據的條件','前述共同時刻','容易失去的結果'],'When 設定前提；these 回指上句具體小互動。','已列出重要的日常時刻，下一句要說甚麼條件會令它們流失時。','When people eat apart, these shared moments are reduced.','When...these...are','把條件連回前述時刻'),
frame(5,['For example, ', ' while ', ', so ', ' rather than '],['孩子在晚餐的行為','父母同時做的事','用餐如何變化','本應提供的相聚機會'],'while 顯示同時分心；so 推出結果；rather than 對照失去的機會。','要用同一時刻中兩方的行為，具體展示活動如何失去原本作用時。','For example, one child checks a phone while parents work, so dinner becomes quiet rather than a time to talk.','while...so...rather than','以同時行為說明取代'),
frame(6,['Over time, ', ', because ', ' but '],['反覆習慣造成的長期結果','表面上仍然接近的情況','實際關係的反差'],'Over time 限定累積過程；but 對比同住和真正相處。','前文已有一個日常例子，現在要推到長期變化並揭示表面與實際的差距時。','Over time, contact may weaken, because relatives live together but rarely speak.','Over time...because...but','由習慣推到關係落差'),
frame(7,['Another serious problem is that '],['另一條與前段不同的問題'],'Another serious problem is that 開啟第二條獨立論證。','第一段已談共同時間減少，第二段轉到溝通本身的質素時。','Another serious problem is that replies become brief and distracted.','Another serious problem is that','切換至溝通質素'),
frame(8,[', whereas '],['面對面交談所需的能力','另一種媒介培養的不同期待'],'whereas 作對照，不表示所有使用者必定被改變。','要比較兩種活動對注意力或回應方式提出的不同要求時。','A long talk needs patience, whereas short clips invite quick reactions.','whereas','對照兩種注意力要求'),
frame(9,['If ', ', parents may '],['青少年反覆分心的條件','父母可能較難理解的事情'],'If 限定情況，may 保留個別差異。','要解釋某種持續行為可能如何影響他人了解當事人時。','If a child rarely talks at dinner, parents may miss signs of worry.','If...parents may','用條件說明可能障礙'),
frame(10,['Similarly, ', ' who are ', ' but '],['另一方也可能有的感受','表面上在場的狀態','實際注意力不在場的反差'],'Similarly 把視角轉到另一方；but 對比身體在場與精神缺席。','同一問題也影響另一方，需要展示其對相同落差的感受時。','Similarly, children may notice parents who are at home but focused on work.','Similarly...who are...but','換位指出表面與實際落差'),
frame(11,['This weakens ', ', and without ', ', ', ' can '],['前句情況削弱的關係基礎','缺少該基礎的條件','小誤解','可能擴大的結果'],'without 說明信任缺失這個條件；can 不把緊張關係說成必然。','前文已說明雙方疏遠，接着要指出基礎受損後小問題可能擴大時。','This weakens trust, and without trust, small doubts can grow into arguments.','without...can','指出基礎流失後的風險'),
frame(12,['In conclusion, ', ' can lead to '],['再次表明的立場','可能出現的關係後果'],'In conclusion 重申立場；can lead to 保留可能性。','結尾要回到題目的核心判斷，並避免把結果說成每個家庭必然發生時。','In conclusion, I agree that private screens can lead to weaker family contact.','In conclusion...can lead to','有保留地重申立場'),
frame(13,['By ', ' and ', ', personal devices can ', ' from ', ' into '],['被奪走的日常互動','被取代的深入交談','家庭可能發生的轉變','原先的共同空間','最後的隔絕狀態'],'By 連接兩條機制；from...into 把前後的家庭狀態放在同一對照中。','結尾要收束兩條原因，並具體寫出環境由何種狀態變成何種狀態時。','By reducing shared meals and replacing talks with alerts, personal devices can turn a home from a meeting place into separate corners.','By...from...into','收束機制與家庭轉變'),
];
const structures=specs.map((target,i)=>{const d=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];return {...target,distractors:d,wrongReasons:d.map(j=>'這句以「'+specs[j].tag+'」'+specs[j].job+'；沒有以「'+target.tag+'」'+target.job+'。'),answerReason:'示例保留「'+target.tag+'」的固定部分，用來'+target.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序還原意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
quiz('作者對每位家人擁有個人科技產品的影響持甚麼立場？',['完全同意可能損害家庭關係，並指出共處時間與回應方式兩條原因','完全反對任何家庭成員使用現代科技','只討論手機的價錢而沒有判斷家庭關係','認為一家人同住便保證溝通深入'],'引言明確寫 I fully agree，並分別預告時間和回應方式。'),
quiz('兩個主體段各自分析甚麼？',['日常共處時刻減少；面對面溝通變得膚淺零碎','先比較手機品牌，再討論網絡速度','兩段都只重複孩子在晚餐看影片','第一段只談社交媒體，第二段只談公司工作'],'第一段重點是共同時間，第二段重點是溝通質素。')];
const route=[sequence('由共處時間減少到信任變弱',[
['引言：明確立場','同意個人科技可能損害家庭關係；預告兩條不同原因。'],
['理由一：小互動被取代','吃飯、放學後聊天及互助原本逐漸建立親密感。'],
['晚餐例子與長期結果','每人看螢幕或工作訊息，同住卻漸漸缺少真正相處。'],
['理由二：交談質素下降','快速數碼刺激與面對面交談所需的耐性形成對照。'],
['雙方感受與信任','父母較難理解孩子，孩子也覺得父母心不在焉，小誤解或會擴大。'],
['結尾：收束兩條機制','日常互動與深入談話被分心取代，家庭變得彼此隔絕。']],
'先說時間被取代，再說交談質素和信任的後果。')];
const evidence=[
quiz('文章說家庭關係通常靠甚麼逐漸建立？',['反覆的小互動，如一起吃飯、放學後聊天及互相幫忙','只靠一次戲劇性的重大談話便永久建立','完全依靠每個人的私人電子設備','只要住在同一間屋就自動變親近'],'原文對比 dramatic conversations 與 repeated small interactions。'),
quiz('晚餐例子中，誰同時被甚麼事情分心？',['孩子看影片，父母回覆工作訊息','孩子準備功課，父母只看藝術書','全家人一起商量周末活動','父母和孩子一起關掉設備交談'],'while 指出同一時刻孩子與父母各自分心。'),
quiz('「住在同一屋簷下」為何仍可能產生情感距離？',['身體同住不等於有真正的共同時間和交流','家人必然搬到不同城市才會疏遠','只要共用一張飯桌就足夠建立信任','所有家庭都不能使用任何電子設備'],'原文用 but 對照同住和真正相處。'),
quiz('面對面交談與數碼娛樂有甚麼不同要求？',['交談需要專注與耐心；娛樂常鼓勵期待快速刺激和回覆','兩者都必然使人完全失去耐心','只有數碼娛樂需要認真聆聽與眼神接觸','面對面交談只需要畫面變換和提示音'],'whereas 並列兩種不同的注意力模式。'),
quiz('父母為何可能較難理解青少年？',['孩子長時間戴耳機或看社交媒體，減少讓父母了解其生活的機會','父母知道孩子朋友姓名後便不能再聆聽','只要青少年使用耳機一次便必然斷絕溝通','家人不能用語言談論任何煩惱'],'If 和 may 只在指定情況下提出可能障礙。'),
quiz('結尾用「from...into」總結甚麼變化？',['原本共享的家庭空間可能變成各人隔絕的私人世界','共享空間一定變成更大的住宅','只要有更多設備，所有親人都會更親近','家庭中的每個問題都只由房間數量決定'],'這個對照把兩條機制的總體後果形象化。')];
const logic=[
sequence('小互動如何被個人螢幕取代',[
['小互動原本建立親密感','共餐、聊天、幫忙反覆提供相處機會。'],
['每人轉向自己的螢幕','孩子看影片，父母處理工作訊息。'],
['同一頓飯失去交談功能','一起吃飯變成沉默的例行活動。'],
['長期可能形成情感距離','同住者仍可能缺少真正相處。']],
'範文從可見的日常場景推到逐漸累積的關係變化。'),
sequence('分心如何影響交談與信任',[
['交談需要投入','聆聽、眼神接觸和耐性支持面對面交流。'],
['注意力被快速媒介分散','孩子和父母都可能身在場而心不在焉。'],
['雙方較難互相理解','父母難知孩子煩惱，孩子也感到父母疏遠。'],
['信任流失後小事或擴大','小誤解可能變成家庭矛盾。']],
'第二條論證關注回應方式和信任，不只計算相處時數。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('一家人每天一起吃飯，但每人都看自己的螢幕。','哪個分析最能轉用範文第一段？',['同桌未必等於相處；交談機會可能逐漸減少','同桌吃飯已提供時間，不必再看有否交談','家人各看螢幕，可用訊息補上飯桌交流','談話變少，較可能只由飯菜安排影響'],['範文把同住與真正相處區分開來。','同桌不保證有注意力與交談。','訊息未補上共同晚餐的交流。','情境中螢幕分心是直接線索。'],[3,4,5,6],'原文指出共同日常時刻會因個人螢幕而流失。'),
t('一名家長認為親子關係只需每年一次長談。','如何用範文檢查這種想法？',['留意每天小互動如何逐步累積親密感','每年長談可集中處理問題，日常交流可減少','親密感主要由重要對話建立，小互動可略過','平日關心有用，但只需留意對話音量'],['原文說關係通常透過 repeated small interactions 建立。','長談不能代替每天反覆的小互動。','作者強調日常累積。','音量不是親密感的主要機制。'],[3],'原文對比重大談話與反覆小互動。'),
t('孩子在飯桌上看影片，父母同時處理工作郵件。','哪個因果連接最準確？',['雙方同時分心，飯局較難成為重新聯繫的機會','父母處理電郵有必要，飯局可先不談生活','飯局時間短，宜先延長而不調整螢幕使用','孩子看影片可放鬆，父母便不用主動交談'],['while...so...rather than 對照分心和失去的機會。','必要電郵也會擠走這次交談。','延長時間未必改善分心。','放鬆不等於重新連繫。'],[5],'原文晚餐例子讓兩方的分心同時可見。'),
t('一家人仍住在一起，卻很少真正交談。','範文哪一個對比適用？',['同住不等於有真正相處與情感交流','同住提供接觸機會，因此較少需主動聆聽','情感距離主要由是否分房居住決定','增加共同空間，便可略過日常談話品質'],['原文說 same roof 仍可有 emotional distance。','同住仍可能缺少真正交流。','房間安排未充分解釋情感距離。','空間增加不代替談話品質。'],[6],'原文用 but 對照同住與真正相處。'),
t('青少年常戴耳機，父母發現自己不清楚孩子最近的煩惱。','哪句有最恰當的語氣？',['若孩子常分心，父母可能較難理解他的生活','耳機使用有關，卻不必詢問孩子最近感受','父母不知道煩惱，主因可能只在居住時間','孩子常戴耳機，宜先限制外出而非改善交談'],['If...may 指出條件和可能性。','仍要問孩子感受才能理解煩惱。','時間可能有關，情境更指向缺交流。','限制外出未解家庭聆聽。'],[9],'原文以 if 和 may 限定父母理解孩子的困難。'),
t('一位父親每天在家工作，孩子卻覺得他一直心不在焉。','哪個觀點最貼近範文？',['人在家不等於專注，孩子仍可能感到疏遠','父親在家時間多，可先按時數衡量關心','孩子感到疏遠，較可能只因房間不夠大','在家工作可減通勤，便不用另安排相處'],['原文用 physically present but mentally elsewhere 描述反差。','時數不等於精神投入。','房間大小不是已知原因。','省通勤仍需專注相處。'],[10],'原文也從孩子角度說明父母心不在焉。'),
t('同一家庭因回覆訊息分心，小誤會愈積愈多。','哪個過程最符合範文？',['注意力不足可能削弱信任，再令小誤會擴大','誤會增加，可先要求家人傳更多工作訊息','信任下降只因誤會本身，與注意力較無關','先改善網絡速度，再看對話是否更完整'],['原文指出 trust 減少後 small misunderstandings can grow。','工作訊息增多可能再分心。','注意力不足是信任變化的上游因素。','網速不解對話中斷。'],[8,10,11],'原文由分心與疏遠推到信任和家庭矛盾。'),
t('作文只說「個人設備不好」，沒有說明怎樣影響家庭。','如何依範文補出兩條理由？',['分述共處時間減少與面對面回應質素下降','列設備功能與價格，讓讀者自行推想家庭影響','只說家人較少談話，不說分心怎樣發生','只談房屋面積，不分析共處與回應品質'],['引言預告兩條不同機制，主體段逐一展開。','功能價格未交代家庭機制。','須指出分心如何使談話變少。','房屋面積未回應設備使用。'],[1,2,7],'原文分別分析共同時刻與交談質素。'),
t('學生要寫科技的影響，但怕斷言每個家庭都必然破裂。','哪種寫法最符合範文？',['用 may 或 can 限定可能結果，再說明具體條件','用 may 限定結果，卻不說甚麼使用條件','多列產品名稱，便可代替具體因果路徑','刪去例子後只用概括句描述家庭風險'],['範文用 may、can 等語氣並列出情況。','可能語氣仍需具體條件支持。','名稱不是因果機制。','例子可展示何時發生影響。'],[9,11,12,13],'原文以可能語氣討論關係破裂的風險。'),
t('社區中心設計親子活動，希望加強家人關係。','哪項安排最能用上範文的正面機制？',['安排反覆共餐與交談，讓家人有穩定相處機會','一年辦一次講座，平日交流由家庭自行安排','共同活動只需增加設備，不須安排家人交談','安排共餐，但不留意家人是否專注彼此'],['原文重視 repeated small interactions。','一次講座未建立穩定相處。','設備不等於共同活動。','共餐若仍分心，作用有限。'],[3,4],'原文的正面機制是反覆出現的小互動。'),
t('兩名家人每天傳短訊，但面對面時很少專心聆聽。','哪項區分最接近第二段？',['回覆次數不等於耐心聆聽與深入交談','短訊有回覆，可先按次數評估關係深度','面對面聆聽不足，可用更頻密短訊代替','談話是否深入，先比較設備與螢幕規格'],['原文重視 face-to-face conversation 所需的注意力。','頻率不能直接代表耐心聆聽。','更多短訊未必補足當面交流。','規格不是交談深度。'],[7,8],'第二段分析交談質素而非只計算訊息數。'),
t('結尾要把文章兩段原因收在一個畫面中。','哪個結尾較忠於範文？',['交流被分心取代，家中可能各自隔絕','分心令家人少談話，卻不必分析情感隔閡','寫家人各自隔絕，但不交代互動如何變少','只說科技有用，不收束交流品質的風險'],['from...into 形象收束日常互動及深入交談兩條機制。','需從互動變化推到隔閡。','結尾應回收已解釋的機制。','好處讓步後仍要維持作者判斷。'],[13],'原文以共享家庭空間變成私人世界作結。'),
];
export default {key:'opinion:93',meta:{topic:'個人科技與家庭溝通',summary:'範文以日常共處時刻被取代，以及面對面交談變得零碎兩條機制，說明家庭關係可能受損。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
