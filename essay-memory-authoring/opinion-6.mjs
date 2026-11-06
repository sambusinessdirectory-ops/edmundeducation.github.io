// Model Essay 6 · Opinion: small shops and the life of local communities.
const simple=[
  'As big supermarket chains control more shops, small independent stores in many towns now find it hard to stay open.',
  'I fully agree that losing small local shops can destroy local communities because these shops keep people connected and support the local economy that gives the area its character.',
  'First, small shops help people stay connected; they are more than places to buy things.',
  'When people often go to the same bakery, food shop, or café, they get to know the workers there.',
  'As time passes, these regular conversations build trust, knowledge about the area, and a feeling of belonging.',
  'This is especially important for older people and those who live alone because such meetings may be a big part of their day.',
  'When these shops shut, shopping feels less personal because people just go to a supermarket, pay, and leave.',
  'For example, an older customer who talked to a nearby shop owner every morning may lose one of the few people he speaks to.',
  'So the casual connections that keep a neighbourhood close begin to grow weaker.',
  'Local shops also keep money and a town\'s special character in the area.',
  'Because local families often own these shops, they are more likely to spend their profits nearby by hiring local people, buying from nearby suppliers, and helping local events.',
  'This keeps money moving locally: money spent at one nearby business helps other nearby services stay open.',
  'Small shops also give a town centre its own character; a street with bookshops run by families, cafés, and food stalls shows who lives there.',
  'In contrast, when large supermarket chains take over, they keep profits and decisions in a few central offices, and shopping streets slowly start to look alike.',
  'A town may still have shops and shoppers, but it may no longer work as a real community in the way people live together.',
  'In short, I strongly agree that losing small local shops can cause local communities to die out.',
  'Without local shops, neighbourhoods lose both close relationships and local ways of earning and spending money that let people live together as a community.',
];
const vocabulary=[
  [['retail markets','shops','零售市場'],['dominated by','control','主導'],['independent shops','small independent stores','獨立商店'],['struggle to survive','find it hard to stay open','艱難求存']],
  [['completely agree','fully agree','完全同意'],['disappearance','losing','消失'],['death of local communities','destroy local communities','社區消亡'],['sustain','keep','維繫'],['social relationships','people connected','人際關係'],['economic life','local economy','經濟生活'],['community identity','area its character','社區認同']],
  [['function as social anchors','help people stay connected','充當社交支點'],['rather than','more than','而非只是'],['places of transaction','places to buy things','交易場所']],
  [['residents','people','居民'],['regularly visit','often go to','經常光顧'],['grocer','food shop','雜貨店'],['develop familiarity with','get to know','漸漸熟悉']],
  [['Over time','As time passes','隨着時間過去'],['repeated exchanges','regular conversations','一再出現的互動'],['local knowledge','knowledge about the area','對地方的了解'],['a sense of belonging','a feeling of belonging','歸屬感']],
  [['This matters especially for','This is especially important for','這尤其重要'],['older residents','older people','年長居民'],['people who live alone','those who live alone','獨居人士'],['such encounters','such meetings','這類相遇'],['form an important part of daily life','be a big part of their day','成為日常生活的重要部分']],
  [['Once these shops close','When these shops shut','一旦商店倒閉'],['impersonal','less personal','缺乏人情味'],['simply visit','just go to','只是走進']],
  [['elderly customer','older customer','年長顧客'],['local shopkeeper','nearby shop owner','本地店主'],['social contacts','people he speaks to','社交接觸']],
  [['As a result','So','結果'],['informal ties','casual connections','非正式聯繫'],['hold a neighbourhood together','keep a neighbourhood close','維繫社區'],['begin to weaken','begin to grow weaker','開始削弱']],
  [['Local businesses','Local shops','本地企業'],['character','special character','特色'],['within the area','in the area','留在當地']],
  [['owned by local families','local families often own these shops','由本地家庭擁有'],['earnings','profits','收益'],['reinvested nearby','spend their profits nearby','再投放附近'],['local hiring','hiring local people','聘用本地人'],['neighbourhood events','local events','社區活動']],
  [['creates a cycle','keeps money moving locally','形成循環'],['local spending','money spent at one nearby business','本地消費'],['local services','nearby services','本地服務'],['survive','stay open','持續生存']],
  [['Independent shops','Small shops','獨立商店'],['distinctive identity','own character','獨特身分'],['family-run bookstores','bookshops run by families','家庭經營書店'],['reflects the people who live there','shows who lives there','反映當地居民']],
  [['By contrast','In contrast','相反'],['dominate','take over','佔據主導'],['centralised','in a few central offices','集中管理'],['high streets','shopping streets','商業街'],['uniform','look alike','千篇一律']],
  [['A place','A town','一個地方'],['consumers','shoppers','消費者'],['functions as a genuine community','work as a real community','作為真正社區運作'],['in the fuller social sense','in the way people live together','在更完整的社會意義上']],
  [['In conclusion','In short','總而言之'],['closure of small local businesses','losing small local shops','小型本地企業倒閉'],['bring about the death of local communities','cause local communities to die out','導致地方社區消亡']],
  [['Without them','Without local shops','沒有它們'],['human relationships','close relationships','人際關係'],['locally rooted economic networks','local ways of earning and spending money','扎根本地的經濟網絡'],['make communal life possible','let people live together as a community','使共同生活成為可能']],
];

// Split at complete ideas. Each array joins to the exact source or plain sentence.
const chunkOverrides=[
  ['Because retail markets are increasingly dominated by supermarket chains,','independent shops in many towns','now struggle to survive.'],
  ['I completely agree that the disappearance of small local businesses','can lead to the death of local communities,','because these businesses sustain both social relationships','and the economic life on which community identity depends.'],
  ['First, small businesses function as social anchors','rather than mere places of transaction.'],
  ['When residents regularly visit the same bakery, grocer or café,','they develop familiarity with the people who work there.'],
  ['Over time, these repeated exchanges create trust,','local knowledge and a sense of belonging.'],
  ['This matters especially for older residents and people who live alone,','for whom such encounters may form','an important part of daily life.'],
  ['Once these shops close,','shopping becomes more impersonal,','as people simply visit a supermarket, pay and leave.'],
  ['For example, an elderly customer','who once spoke to a local shopkeeper every morning','may lose one of his few social contacts.'],
  ['As a result, the informal ties','that hold a neighbourhood together','begin to weaken.'],
  ['Local businesses also keep','money and character within the area.'],
  ['Because they are often owned by local families,','their earnings are more likely to be reinvested nearby','through local hiring, nearby suppliers','and support for neighbourhood events.'],
  ['This creates a cycle','in which local spending helps','other local services survive.'],
  ['Independent shops also give a town centre its distinctive identity;','a street filled with family-run bookstores, cafés and food stalls','reflects the people who live there.'],
  ['By contrast, when chain supermarkets dominate,','profits and decision-making are centralised,','and high streets gradually become uniform.'],
  ['A place may still contain shops and consumers,','but it no longer functions as a genuine community','in the fuller social sense.'],
  ['In conclusion, I strongly agree','that the closure of small local businesses','can bring about the death of local communities.'],
  ['Without them, neighbourhoods lose both the human relationships','and the locally rooted economic networks','that make communal life possible.'],
];
const simpleChunkOverrides=[
  ['As big supermarket chains control more shops,','small independent stores in many towns','now find it hard to stay open.'],
  ['I fully agree that losing small local shops can destroy local communities','because these shops keep people connected','and support the local economy that gives the area its character.'],
  ['First, small shops help people stay connected;','they are more than places to buy things.'],
  ['When people often go to the same bakery, food shop, or café,','they get to know the workers there.'],
  ['As time passes, these regular conversations build trust,','knowledge about the area, and a feeling of belonging.'],
  ['This is especially important for older people and those who live alone','because such meetings may be a big part of their day.'],
  ['When these shops shut,','shopping feels less personal','because people just go to a supermarket, pay, and leave.'],
  ['For example, an older customer','who talked to a nearby shop owner every morning','may lose one of the few people he speaks to.'],
  ['So the casual connections','that keep a neighbourhood close','begin to grow weaker.'],
  ["Local shops also keep money","and a town's special character in the area."],
  ['Because local families often own these shops,','they are more likely to spend their profits nearby','by hiring local people, buying from nearby suppliers,','and helping local events.'],
  ['This keeps money moving locally:','money spent at one nearby business helps','other nearby services stay open.'],
  ['Small shops also give a town centre its own character;','a street with bookshops run by families, cafés, and food stalls','shows who lives there.'],
  ['In contrast, when large supermarket chains take over,','they keep profits and decisions in a few central offices,','and shopping streets slowly start to look alike.'],
  ['A town may still have shops and shoppers,','but it may no longer work as a real community','in the way people live together.'],
  ['In short, I strongly agree','that losing small local shops','can cause local communities to die out.'],
  ['Without local shops, neighbourhoods lose both close relationships','and local ways of earning and spending money','that let people live together as a community.'],
];

const frame=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const structure=(example,answerReason,distractorReason,distractors,frameOverride)=>({
  example,answerReason,distractorReason,distractors,frame:frameOverride,
});
const structures=[
  structure('Because the river flooded the road, buses could not reach the village.','Because 先交代水浸這項原因，再說明巴士無法進村的結果。','這句使用 Because 把原因放在前面，再引出結果。',[3,10,13],
    frame('Because [先成立的原因], [因此出現的結果]','句首 Because 先交代原因；逗號後才說由此出現的結果。','需要先交代一項原因，再說明它對另一件事造成甚麼影響時。',[['Because','link','引出原因'],[' retail markets are increasingly dominated by supermarket chains','slot','先成立的原因'],[',','link','接上結果'],[' independent shops in many towns now struggle to survive.','slot','因此出現的結果']])),
  structure('I completely agree that the library should open on Sundays, because many workers cannot visit it on weekdays.','先提出贊成延長開放的立場，再用 because 解釋這個判斷。','這句先給判斷，再以 because 補充理由。',[0,4,14],
    frame('I [同意程度] agree that [立場與可能後果], because [支撐立場的原因]','先明確表態及預測可能後果，再用 because 交代支持這個立場的理由；can 不表示必然。','在引言提出立場，並立即預告為何持這個立場時。',[['I ','link','發言者'],['completely','slot','同意程度'],[' agree that ','link','表明立場'],['the disappearance of small local businesses can lead to the death of local communities','slot','立場與可能後果'],[', because ','link','引出支持立場的原因'],['these businesses sustain both social relationships and the economic life on which community identity depends.','slot','支撐立場的原因']])),
  structure('First, community gardens function as meeting places rather than mere plots for growing food.','First 引出首項理由；rather than 指出不能只把花園看成種植場地。','這句用 First 標示第一點，再以 rather than 排除過於狹窄的理解。',[0,9,15],
    frame('First, [對象] function as [較完整的作用] rather than [過於狹窄的作用]','First 引出首項理由；rather than 比較兩種功能，強調前者不應被縮減成後者。','第一項理由要糾正讀者對某事物作用的狹窄理解時。',[['First,','link','第一項理由'],[' small businesses ','slot','討論對象'],['function as','link','說明實際作用'],[' social anchors ','slot','較完整的作用'],['rather than','link','排除過於狹窄的理解'],[' mere places of transaction.','slot','過於狹窄的作用']])),
  structure('When neighbours meet each week, they begin to know one another better.','When 說明定期相遇的情況，後面指出由此形成的熟悉感。','這句用 When 設定情況，主句交代當時或隨之出現的變化。',[0,6,13],
    frame('When [反覆出現的情況], [在此情況下形成的變化]','When 先設定常出現的情況，主句再說明人或事如何在這情況下改變。','要解釋一種反覆發生的情況如何使人逐漸熟悉或改變時。',[['When','link','設定情況'],[' residents regularly visit the same bakery, grocer or café','slot','反覆出現的情況'],[',','link','接上變化'],[' they develop familiarity with the people who work there.','slot','在此情況下形成的變化']])),
  structure('Over time, these short daily walks create a habit of exercise.','Over time 標示小幅做法長期累積後出現的變化。','這句以 Over time 表示逐漸累積，而非一次便完成。',[0,7,15],
    frame('Over time, [反覆進行的事] create [逐漸形成的結果]','Over time 把焦點放在長期累積；後面指出反覆互動逐漸建立的結果。','要把一連串小互動與長期形成的結果連起來時。',[['Over time,','link','標示長期累積'],[' these repeated exchanges ','slot','反覆進行的事'],['create','link','產生'],[' trust, local knowledge and a sense of belonging.','slot','逐漸形成的結果']])),
  structure('This matters especially for new students, for whom a friendly greeting may be the only welcome they receive that day.','for whom 把「對誰重要」與「為甚麼重要」連接，may 保留可能性。','這句以 for whom 指回前面的群體，說明該情況對他們的可能作用。',[3,7,16],
    frame('This matters especially for [特別受影響的人], for whom [前述經驗] may [可能的重要作用]','for whom 指回前面提到的人；may 審慎說明某種經驗對他們可能有何重要性。','一般做法對某類人可能特別重要，需要交代原因時。',[['This matters especially for ','link','指出特別受影響者'],['older residents and people who live alone','slot','特別受影響的人'],[', for whom','link','指回前述的人'],[' such encounters ','slot','前述經驗'],['may','link','保留可能性'],[' form an important part of daily life.','slot','可能的重要作用']])),
  structure('Once the clinic closes, treatment becomes harder to reach, as patients must travel farther.','Once 引出診所關閉後的情況，as 再解釋看病為何變難。','這句同時使用 Once 標出轉折點，並用 as 補充結果背後的原因。',[3,5,13],
    frame('Once [關鍵情況發生], [隨之出現的變化], as [解釋該變化的原因]','Once 指出情況一旦改變，主句說其後果；as 再解釋這個後果為何出現。','需要同時說明觸發某變化的事件，以及結果背後的實際機制時。',[['Once','link','標示關鍵情況'],[' these shops close','slot','關鍵情況發生'],[',','link','接上變化'],[' shopping becomes more impersonal','slot','隨之出現的變化'],[', as','link','解釋變化原因'],[' people simply visit a supermarket, pay and leave.','slot','實際機制']])),
  structure('For example, a patient who used the nearby clinic each week may lose a familiar source of help.','For example 把一般影響落到一名具體人物的可能損失。','這句用 For example 引入一個具體人物與其可能遭遇的事。',[5,8,15],
    frame('For example, [具體人物與其原有習慣] may [可能失去的事物]','For example 提供具體人物的情況；may 審慎說明可能而非必然的損失。','已提出一般性的影響，要用可想像的個人情況說清楚時。',[['For example,','link','引入具體例子'],[' an elderly customer who once spoke to a local shopkeeper every morning ','slot','人物與原有習慣'],['may','link','保留可能性'],[' lose one of his few social contacts.','slot','可能失去的事物']])),
  structure('As a result, the trust that helps a team work together begins to weaken.','As a result 收束前述變化，再指出團隊信任開始減弱。','這句用 As a result 接出前文的後果。',[4,6,13],
    frame('As a result, [維持關係的事物] begin to [逐漸出現的負面變化]','As a result 接續前文的原因；後面說原有關係如何開始改變。','已解釋某些接觸如何減少，接着要收束為關係層面的後果時。',[['As a result,','link','接前文結果'],[' the informal ties that hold a neighbourhood together ','slot','維持關係的事物'],['begin to','link','標示變化開始'],[' weaken.','slot','逐漸出現的負面變化']])),
  structure('Local libraries also keep knowledge and shared stories within the community.','also 補上一項作用；keep...within 指資源與特色留在同一地方。','這句用 also 補充前文，再指出某些資源仍留在原有範圍內。',[2,11,13],
    frame('[本地事物] also keep [兩項資源或特色] within [相關地方]','also 補充另一項作用；keep...within 說明資源或特色仍留在特定範圍。','完成一方面論證後，要指出同一事物在另一範疇的作用時。',[['Local businesses ','slot','本地事物'],['also keep','link','補充保留作用'],[' money and character ','slot','兩項資源或特色'],['within','link','標示保留範圍'],[' the area.','slot','相關地方']])),
  structure('Because local clubs run these halls, their fees are more likely to be spent nearby through local hiring and supplies.','Because 給出本地球會管理的原因；more likely to 謹慎說明收入可能流向本地。','這句先用 Because 說明原因，再用 more likely to 表示較高可能性。',[0,5,13],
    frame('Because [形成傾向的原因], [對象] are more likely to [較可能的做法] through [具體途徑]','Because 先指出為何較可能出現某做法；more likely to 表示傾向，through 說明具體途徑。','要解釋某種安排為何較可能有效，並列出可核查的實際途徑時。',[['Because','link','引出原因'],[' they are often owned by local families','slot','形成傾向的原因'],[',','link','接上可能結果'],[' their earnings ','slot','對象'],['are more likely to','link','表示較高可能性'],[' be reinvested nearby ','slot','較可能的做法'],['through','link','引出具體途徑'],[' local hiring, nearby suppliers and support for neighbourhood events.','slot','具體途徑']])),
  structure('This creates a cycle in which regular theatre attendance helps nearby cafés stay open.','in which 解釋循環如何運作，而非只宣稱形成一個循環。','這句用 This creates 指出結果，in which 展開其內部運作方式。',[9,10,12],
    frame('This creates a cycle in which [一項本地活動] helps [另一項活動持續]','This creates a cycle 指出前文做法形成循環；in which 具體解釋循環如何運作。','前文已交代一個做法，接着要說明它如何形成互相支撐的循環時。',[['This creates a cycle','link','指出形成循環'],[' in which','link','解釋循環運作'],[' local spending ','slot','一項本地活動'],['helps','link','指出支撐作用'],[' other local services survive.','slot','另一項活動持續']])),
  structure('Public gardens also give a city its own character; a square full of trees and people reflects what residents value.','分號連接一般判斷與具體場景，後半句展示地方特色如何被看見。','這句先提出身分作用，再用分號和具體場景展示它。',[2,11,14],
    frame('[本地事物] also give [地方] its [獨特身分]; [具體場景] reflects [與地方相關的人或價值]','前半句提出地方身分的判斷；分號後的具體場景展示這判斷如何成立。','提出某做法能形成特色後，要用一個可見場景說明時。',[['Independent shops','slot','本地事物'],[' also give ','link','指出作用'],['a town centre','slot','地方'],[' its ','link','所有關係'],['distinctive identity','slot','獨特身分'],['; ','link','接上具體場景'],['a street filled with family-run bookstores, cafés and food stalls','slot','具體場景'],[' reflects ','link','顯示'],['the people who live there.','slot','與地方相關的人或價值']])),
  structure('By contrast, when large firms control the market, decisions move to distant offices, and local workers have less say.','By contrast 對照先前情況；when 設定條件，後面列出兩項不同後果。','這句以 By contrast 引出對照，再用 when 說明此情況下的兩項後果。',[6,10,12],
    frame('By contrast, when [相反情況成立], [第一項變化], and [第二項變化]','By contrast 轉向與前文相反的情況；when 設定條件，再列出兩項結果。','已展示一種模式的作用，要轉向對照模式並說明其兩項影響時。',[['By contrast, when','link','引出對照情況'],[' chain supermarkets dominate','slot','相反情況成立'],[',','link','接第一項變化'],[' profits and decision-making are centralised','slot','第一項變化'],[', and','link','並列第二項變化'],[' high streets gradually become uniform.','slot','第二項變化']])),
  structure('A school may still have classrooms and teachers, but it no longer offers a safe place to learn.','may still 承認表面存在的條件；but 轉向較深層的缺失。','這句用 may still 和 but 對照表面仍有與實質已失去。',[2,9,13],
    frame('[地方] may still [保留表面事物], but [該地方] no longer [具備的深層功能]','may still 承認表面的保留；but 指出更重要的功能已經失去。','有人可能以表面仍存在的事物反駁時，要指出關鍵功能其實已喪失。',[['A place ','slot','地方'],['may still','link','承認表面保留'],[' contain shops and consumers','slot','保留表面事物'],[', but','link','轉向深層缺失'],[' it ','slot','該地方'],['no longer','link','指出功能喪失'],[' functions as a genuine community in the fuller social sense.','slot','具備的深層功能']])),
  structure('In conclusion, I strongly agree that losing public libraries would harm many neighbourhoods.','In conclusion 收束全文，重申作者對圖書館關閉的立場。','這句以 In conclusion 標示總結，再重申前文論證的立場。',[1,8,16],
    frame('In conclusion, I [同意程度] agree that [重申的立場]','In conclusion 標示全文收束；後面重申已在主體段支持過的立場。','文章已完成論證，要在結尾明確回扣問題與自己的立場時。',[['In conclusion,','link','全文收束'],[' I ','link','發言者'],['strongly','slot','同意程度'],[' agree that ','link','重申立場'],['the closure of small local businesses can bring about the death of local communities.','slot','重申的立場']])),
  structure('Without safe buses, residents lose both a way to work and a chance to stay connected.','Without 提出缺少安全巴士的條件；both...and 並列兩種損失。','這句用 Without 指出條件，再用 both...and 列出兩種不同損失。',[1,6,10],
    frame('Without [缺少的條件], [受影響者] lose both [第一項損失] and [第二項損失]','Without 指出缺少甚麼；both...and 並列因此失去的兩項不同事物。','結尾要把一項缺失造成的兩類損失一起收束時。',[['Without','link','提出缺少的條件'],[' them','slot','缺少的條件'],[',','link','接上損失'],[' neighbourhoods ','slot','受影響者'],['lose both','link','並列兩項損失'],[' the human relationships ','slot','第一項損失'],['and','link','連接第二項'],[' the locally rooted economic networks that make communal life possible.','slot','第二項損失']])),
];

const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({
  type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',
  items:rows.map(([title,body])=>({title,body})),why,
});
const intro=[
  Q('作者對「小型本地企業倒閉會令地方社區消亡」持甚麼立場？',[
    '完全同意：商店關閉會削弱人際聯繫與本地經濟網絡',
    '完全反對：只要有連鎖超市，社區關係必定更緊密',
    '部分同意：只承認店主收入下降，不認為居民受影響',
    '沒有表態：全文只比較貨品價格和商店面積',
  ],'引言的 completely agree 和結論的 strongly agree 一致；兩條主線分別是社交支點與本地經濟／身分。'),
  {type:'multi',prompt:'選出作者用來支持立場的兩條不同主線',detail:'選兩項，再按「確認」。',options:[
    '小店讓居民重複相遇、建立熟悉與信任；關店會削弱這些聯繫',
    '小店把收益和特色留在本地；連鎖企業集中決策與利潤',
    '超市必然售賣品質較差的貨品，故不應進入任何城鎮',
    '居民只要購物速度更快，便能補回所有失去的人際關係',
  ],correct:[0,1],why:'第一主體段談社交接觸；第二主體段談本地資金循環與街道身分。原文沒有作貨品質素或購物速度的絕對判斷。'},
];
const route=[sequence('先掌握範文四段如何推進',[
  ['引言 · 立場','交代連鎖超市擴張與小店求存，完全同意小店消失可令社區衰亡；預告社交與經濟兩條原因。'],
  ['主體段一 · 社交支點','重複光顧使居民熟悉店員，累積信任與歸屬；小店關閉後，長者尤其可能失去日常接觸。'],
  ['主體段二 · 本地循環與特色','家庭經營商店較可能把收入再投放附近，也讓商業街反映居民；大型連鎖主導時，利潤集中而街道趨同。'],
  ['結論 · 雙重損失','重申完全同意：沒有小店，社區同時失去人際關係及扎根本地的經濟網絡。'],
],'小店難存 → 社交接觸流失 → 本地資金與特色流失 → 真正的社區功能削弱。')];
const evidence=[
  Q('為甚麼作者稱小型企業為 social anchors？',[
    '居民反覆光顧同一店舖，逐漸熟悉店員，建立信任與歸屬',
    '小店通常比所有超市便宜，居民因此必定認識彼此',
    '店主會正式安排居民參加社交課程',
    '只要店舖仍有交易，居民便不會感到孤獨',
  ],'social anchors 指人與人之間反覆、自然的接觸；原文沒有提供價格或正式課程的證據。'),
  Q('長者與獨居人士的例子，具體說明哪一類風險？',[
    '關店可能使本來就少有日常交談的人失去其中一位熟人',
    '長者必定不會使用超市，因而完全無法購物',
    '只要店主每天早上營業，任何人都不會孤獨',
    '社區聯繫只對長者有用，其他居民不受影響',
  ],'原文用 may lose one of his few social contacts 表示可能失去有限的社交接觸，不是對所有長者作必然預測。'),
  Q('作者用甚麼機制解釋小店如何支持本地經濟？',[
    '本地家庭擁有商店時，收益較可能經聘人、採購和社區活動再投放附近',
    '商店賺到的所有錢都會直接平均分給居民',
    '小店不需要供應商或員工，因此沒有營運成本',
    '連鎖超市不得聘請本地居民，故只有小店能創造職位',
  ],'原文使用 are more likely to，並具體列出 local hiring、nearby suppliers、neighbourhood events。'),
  Q('「This creates a cycle」的循環具體指甚麼？',[
    '本地消費支持其他附近服務存續，令資源在地方內繼續發揮作用',
    '居民買一次東西後便永遠不再需要其他服務',
    '超市把所有利潤存到中央辦公室後，街道自然更獨特',
    '任何小店都會自行培養出新一代店主，不需顧客支持',
  ],'in which 後面明確說 local spending helps other local services survive；不能只記「cycle」這個字而忽略運作。'),
  Q('家族經營書店、咖啡館和小吃攤的街景，支持哪項論點？',[
    '多樣的本地商店使城鎮中心有自身特色，並反映在那裏生活的人',
    '街上有書店便證明所有居民每天閱讀',
    '只要商店由家庭經營，就必定比連鎖超市更賺錢',
    '街景只關乎遊客拍照，與地方身分無關',
  ],'原文以具體街景支撐 distinctive identity；它沒有推論每人的閱讀習慣或盈利。'),
  Q('「仍有商店和消費者」為何不足以證明社區仍然健全？',[
    '場所可保留購物活動，卻已失去人際聯繫與扎根本地的經濟作用',
    '只要城鎮有商店，所有社交關係便自動存在',
    '作者認為消費者數目應該是唯一的社區指標',
    '購物一旦變方便，社區便不再需要任何居民',
  ],'but 後面否定的是 genuine community in the fuller social sense；作者區分表面的買賣與深層社區功能。'),
];
const logic=[
  sequence('第一主體段：日常買賣怎樣變成社區聯繫？',[
    ['不只是交易','小店充當社交支點，而非純粹買賣場所。'],
    ['重複相遇','居民經常到同一店舖，逐漸認識那裏的工作者。'],
    ['長期累積','交談建立信任、地方知識與歸屬感。'],
    ['特別受影響者','這些相遇對長者與獨居者可能是重要的日常部分。'],
    ['關閉後的變化','購物變得較沒有人情味，有些人失去少數的社交接觸。'],
    ['段落結論','原本維繫鄰里的非正式聯繫逐漸減弱。'],
  ],'重複相遇 → 熟悉與信任 → 關店後個人接觸流失 → 社區聯繫減弱。'),
  sequence('第二主體段：小店為何同時保留金錢與地方特色？',[
    ['段落主張','小店把資金與特色留在本地。'],
    ['收入再投放','本地家庭經營的小店較可能僱用本地人、向附近供應商採購和支持社區活動。'],
    ['經濟循環','本地消費幫助其他附近服務繼續營業。'],
    ['具體街景','不同家庭經營商店令城鎮中心反映當地生活。'],
    ['對照大型連鎖','大型連鎖主導時，利潤與決策集中，商業街漸漸變得相似。'],
    ['深層判斷','有店舖與消費者仍不足以證明一個地方是真正的社區。'],
  ],'收益留在本地 → 支持其他服務 → 形成特色 → 對照利潤集中與街道趨同。'),
];

const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  type:'quiz',prompt:question,context,question,options,correct:0,explanations,
  why:explanations[0],sourceSentenceIndices,modelLink,
});
const transfer=[
  T('市議會考慮關閉社區圖書館，改用一個大型網上借書平台。','哪項最能轉用「日常相遇形成社交支點」的推理？',[
    '分析常到圖書館的人如何認識職員與其他讀者，並在關閉後失去這些接觸',
    '只比較平台藏書數量，因為借書量可代表所有社交聯繫',
    '假設每位讀者都反對網上借書，所以不必了解使用情況',
    '以平台開發成本證明現有圖書館不具任何社交作用',
  ],[
    '這保留「反覆相遇 → 熟悉與聯繫 → 關閉後流失」的因果鏈。',
    '藏書數量不能顯示居民是否建立或失去人際聯繫。',
    '原文沒有把個別人的選擇說成所有人都相同。',
    '開發成本不能取代對地方接觸的分析。',
  ],[2,3,4,6,8],'原文說重複光顧同一小店會逐漸熟悉店員；關店後維繫社區的非正式聯繫開始減弱。'),
  T('一間社區診所將搬到大型醫療中心，原有的長者病人需改用自助登記。','哪項最準確運用長者例子的作用？',[
    '查明病人會否失去與熟悉職員的日常接觸，尤其是原本少有人交談者',
    '推斷所有長者都無法操作自助機，故診所絕對不能搬遷',
    '只計算新中心的房間數目，便判定病人的社交狀況',
    '認為長者可見到更多病人，所以必定結交更多朋友',
  ],[
    '這把焦點放在「少數熟人接觸可能流失」的原文例證上。',
    '原文以 may 保留可能性，沒有對所有長者作絕對推斷。',
    '房間數目無法直接說明熟人接觸是否被替代。',
    '見到更多陌生人不等於建立相同的熟悉關係。',
  ],[5,6,7],'原文說日常小店交談可能對獨居者很重要，長者可能失去少數社交接觸之一。'),
  T('學校把每天由熟悉職員供餐的飯堂，改為學生自行從機器取餐。','哪項最貼近範文對「效率與人情味」的分析？',[
    '比較新流程是否省時，也觀察原本反覆交談和互相認識的機會有否減少',
    '只要取餐變快，便推論學生與職員的關係必定改善',
    '機器沒有職員，所以學生必定再也不會跟任何人說話',
    '只研究機器品牌，並以售價推斷學生的歸屬感',
  ],[
    '這把交易便利與日常熟悉感分開考察，符合原文的具體機制。',
    '處理速度不能單獨證明人際關係改善。',
    '原文說聯繫可能減弱，不是所有交談必然消失。',
    '品牌與售價不足以判斷歸屬感的變化。',
  ],[3,4,6,8],'原文以小店的反覆相遇對照在超市「進店、付款、離開」的較沒有人情味的流程。'),
  T('公共部門擬把所有服務櫃台合併成一個遠距離呼叫中心。','哪項能恰當應用「表面服務仍在，深層功能或已失去」？',[
    '承認服務仍可辦理，再檢視居民是否失去熟悉職員與地方性的協助',
    '聲稱只要電話接通，所有居民便維持原有社區關係',
    '由櫃台數目下降，直接斷言所有服務質素必定下降',
    '只比較電話費用，不理會居民與服務者的關係',
  ],[
    '這用 may still...but 的邏輯區分形式上的服務與地方關係的功能。',
    '能辦理交易不等於維持同樣的人際關係。',
    '原文要求解釋機制，不能僅靠數量作必然預測。',
    '電話費用無法回答地方接觸是否流失。',
  ],[6,8,14],'原文指出一個地方即使仍有商店與消費者，也可能不再具備完整的真正社區功能。'),
  T('地方政府要決定是否保留居民經營的週末市集。','哪項最能轉用「本地收入再投放」？',[
    '調查攤主會否聘用附近居民、向本地供應商採購，並支持周邊活動',
    '只比較市集與大型商場的招牌大小，便推斷地方受益程度',
    '假設居民經營者必定把全部利潤捐出，毋須查核去向',
    '把市集人流視為收入必然留在本地的唯一證據',
  ],[
    '這直接檢查原文列出的僱人、採購與活動三條再投放途徑。',
    '招牌大小無法反映收益流向。',
    '原文說較可能再投放，並沒有說全部利潤都會捐出。',
    '人流不能單獨證明收入最終留在哪裏。',
  ],[9,10,11],'原文把本地家庭擁有與附近僱人、供應商和社區活動相連，使用 more likely 而非必然。'),
  T('大型平台接管一個城市多間原由居民經營的音樂學校。','哪項最能轉用「決策集中」的對照？',[
    '檢查收費、課程與聘人決定是否轉到總部，以及本地特色有否被統一安排取代',
    '只要平台有總部，便認定每位學生都會停止學音樂',
    '只比較平台商標顏色，便斷定所有教學內容相同',
    '假定連鎖規模越大，本地教師便必定有更大決策權',
  ],[
    '這同時檢查決策地點與地方特色兩個原文對照點。',
    '決策集中不等於學習必然停止。',
    '商標顏色不足以證明實際教學是否趨同。',
    '規模與本地決策權不能直接畫等號。',
  ],[12,13],'原文對照小店的地方身分與連鎖超市主導後的利潤、決策集中及街道趨同。'),
  T('連鎖咖啡店進駐後，舊街仍然有很多顧客，但原來的家庭店舖相繼離開。','哪項結論最貼近範文？',[
    '不能只看顧客數目；還須看街道是否保留本地特色與居民之間的聯繫',
    '顧客數目上升便證明本地利潤與人際聯繫也必然增加',
    '家庭店舖離開後，街道必定立即沒有任何商店',
    '只要咖啡品質相同，地方身分便不可能改變',
  ],[
    '這重建「仍有消費」與「真正社區功能」之間的區別。',
    '顧客數目不能推導收益去向與熟悉關係。',
    '原文正承認一個地方可仍有商店和消費者。',
    '貨品質素不能單獨說明地方特色。',
  ],[12,13,14],'原文說商業街可能趨於一致，並提醒讀者仍有店舖與顧客不代表仍是完整的社區。'),
  T('城市想以統一設計的連鎖店取代各區獨立運動用品店。','哪項證據最能支持「地方特色」而非只談價格？',[
    '記錄不同店舖如何因應當區運動習慣、球會與居民需求提供不同服務',
    '只列出每間店的折扣幅度，不描述其與地方生活的關係',
    '把連鎖店數目當作不同地區都具有同樣特色的證據',
    '只詢問旅客是否喜歡統一店面，便代表所有居民的看法',
  ],[
    '這以可見的地方生活場景，支撐店舖反映居民的論點。',
    '折扣可談價格，卻未證明地方身分。',
    '各區相同反而可能是原文所說的趨同。',
    '旅客偏好不能代替不同居民的地方經驗。',
  ],[12,13],'原文以家族書店、咖啡館及小吃攤的具體街景展示城鎮身分。'),
  T('社區球會改由全國機構管理，活動仍照常舉行。','哪項最能運用範文的雙重主線？',[
    '檢視熟人聯繫有否改變，以及會費與採購是否仍支持附近的服務',
    '活動仍在便代表球會的社交與經濟作用完全一樣',
    '只比較球衣款式，便斷定居民不再互相認識',
    '認為全國機構一定更差，所以毋須研究實際運作',
  ],[
    '這同時保留人際關係與本地經濟網絡兩條不同推理。',
    '形式上繼續活動，不足以證明深層功能不變。',
    '球衣不能單獨說明聯繫與資金流向。',
    '原文以具體機制論證，不靠機構標籤作絕對判斷。',
  ],[2,4,9,10,14,16],'範文結論說社區同時失去人際關係和扎根本地的經濟網絡，兩者都須檢查。'),
  T('鄉鎮的維修店關閉，居民改用外地公司的郵寄維修服務。','哪項最能說明本地經濟的循環可能被切斷？',[
    '追蹤維修費是否離開鄉鎮，並看附近零件供應商與其他服務有否失去生意',
    '只要郵寄方便，便推論鄉鎮其他服務必定更繁榮',
    '維修店關閉便證明當地所有居民再也不能修理物品',
    '只比較兩種服務的包裝樣式，不追蹤支出流向',
  ],[
    '這把支出流向與附近服務存續連起來，對應原文的 cycle。',
    '便利程度不能代替對地方經濟的檢查。',
    '關閉一家店不等於所有維修途徑消失。',
    '包裝樣式與本地資金循環無直接關係。',
  ],[9,10,11],'原文說本地消費幫助其他本地服務生存，形成互相支撐的循環。'),
  T('某區公園改為私人預約場地，仍然每週開放。','哪項最能轉用「地點仍在，不代表社區作用仍在」？',[
    '檢查原本每天在公園偶遇的居民，是否還能自然相遇並建立熟悉感',
    '公園仍開放便證明原有居民的接觸機會完全不變',
    '公園改制便表示所有居民都不再離開住所',
    '只看草地面積，便知道居民之間的信任是否存在',
  ],[
    '這檢查公園的社交功能，而不只看它是否仍能進入。',
    '開放時數不能直接證明相遇模式相同。',
    '改制與所有居民的行動之間沒有必然關係。',
    '面積不能單獨測量重複相遇與信任。',
  ],[2,3,4,14],'範文區分形式上的商店與深層社區功能；反覆相遇才能逐漸建立熟悉與信任。'),
  T('政府討論把本地經營的安老服務併入大型連鎖機構。','哪項最能形成有分寸的跨主題結論？',[
    '比較照顧者與長者的熟悉關係及服務支出流向，再判斷合併是否削弱地方社區',
    '因機構變大便斷言所有長者必然失去每一位熟人',
    '只要服務繼續提供，便認定人際與本地經濟作用完全不變',
    '只計算新機構的辦公室數量，不調查服務和支出的實際變化',
  ],[
    '這把原文兩條機制轉到安老服務，並保留需查證的可能性。',
    '原文使用 may 與 more likely，沒有作必然預測。',
    '形式上仍有服務，不等於兩種深層社區功能相同。',
    '辦公室數目不能代替對人際關係及支出流向的研究。',
  ],[5,7,10,14,16],'範文從熟人接觸及本地經濟網絡兩方面判斷社區是否維持，並使用可能性而非絕對斷言。'),
];

structures[8].example='As a result, the links that help a team work together begin to weaken.';
const reviewedTransferOptions=[
  ['看常到圖書館者的熟人接觸，及關閉後的失落','只看藏書量，便當作全部社交聯繫證據','假定所有讀者反對網借，不查使用情況','只看平台成本，便否定圖書館社交作用'],
  ['看病人會否失去熟悉職員，特別是少交談者','斷定長者都不能用自助機，故不能搬遷','只看新中心房間數，便推定病人社交','見到更多病人便斷定必會結交朋友'],
  ['比較省時與否，也看反覆交談機會有否減少','取餐變快便斷定學生與職員關係改善','沒職員便斷定學生再不會與人說話','只看機器品牌售價便推定學生歸屬'],
  ['承認服務仍在，再查熟悉職員協助有否流失','電話接通便斷定原有社區關係仍在','櫃台變少便斷定所有服務質素下降','只比電話費，不理居民與服務者關係'],
  ['看攤主聘本地人及向附近供應商採購','只比市集商場招牌，便判定地區得益','假定居民攤主把全部利潤捐出','只看人流便斷定收入全留在本地'],
  ['查決策是否轉總部及本地特色有否消失','平台有總部便斷定學生不再學音樂','只比商標顏色，便斷定教學內容相同','連鎖變大便斷定本地教師更有權'],
  ['不只看客量，也看地方特色與居民聯繫','客量上升便斷定本地利潤聯繫均增加','家庭店離開便斷定街道再無商店','咖啡品質相同便斷定地方身分不變'],
  ['看店舖如何因居民球會需求提供服務','只列店舖折扣，不談與地方生活關係','把連鎖店數目當作各地特色證據','只問旅客喜好，便代表所有居民看法'],
  ['同看熟人聯繫與會費採購的本地作用','活動仍在便斷定社交經濟作用不變','只比球衣款式便判斷居民不相識','全國機構一定更差，毋須查運作'],
  ['追蹤維修費流向與附近商戶生意','郵寄方便便斷定鄉鎮服務更興旺','維修店關閉便斷定全鎮無人能維修','只比包裝，不追蹤維修費用去向'],
  ['看公園偶遇能否維持居民熟悉關係','公園開放便斷定原有接觸機會不變','公園改制便斷定居民不再外出','只看草地面積便推定居民信任'],
  ['比較熟人關係與服務支出，再判斷合併影響','機構變大便斷定長者失去全部熟人','服務仍在便斷定人際與經濟作用不變','只數辦公室，不查服務支出實際變化'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
export default {
  key:'opinion:6',
  meta:{topic:'小店、社交聯繫與地方經濟',summary:'作者完全同意小店關閉可令社區衰亡：日常熟人聯繫逐漸消失，本地收入循環和街道特色也被削弱。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
