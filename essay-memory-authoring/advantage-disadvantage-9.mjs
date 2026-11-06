// School uniforms: equality and belonging versus expression and family cost.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:9'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Many schools see uniforms as part of keeping order, but other schools let children choose their clothes much more freely.',
 'Making students wear a uniform has clear good points, especially making them seem more equal and part of the same school. But it can also make it harder for them to show who they are and can cost families money.',
 'One big good point is that a uniform makes differences between richer and poorer children less easy to see.',
 'When all students wear similar clothes, children from poorer families may feel less ashamed of cheap or old-fashioned clothes, while richer children have fewer chances to show costly labels.',
 'This can help the classroom feel fairer, where children are judged more for what they do and how hard they try than for their clothes.',
 'Uniforms can also make students feel that they belong.',
 'A child wearing the same colours and school sign as classmates may feel part of one group, like sports players whose clothes remind them that they are on a team.',
 'But school uniforms also have bad points.',
 'The clearest problem is that they leave less room for each student to be different.',
 'Children, particularly teenagers, often use clothes to try out who they are, how sure they feel of themselves and what they like.',
 'If schools control every small detail, they may feel too strict. Choices about hair, shoes or small things people wear may then cause arguments instead of helping students learn.',
 'Another problem is money.',
 'Uniforms are meant to make choosing clothes easier, but they can cost a lot when schools demand special coats, shoes, sports clothes or clothes for different seasons from chosen shops.',
 'For families with several children, these costs can put real pressure on the money they have to spend.',
 'To sum up, school uniforms may help students seem more equal and feel part of the school, but they may also make it harder to show who they are and put pressure on family money.',
 'Overall, uniforms bring clear benefits for how students live together, but they also have money and personal costs.',
];
const vocabulary=[
 v(['treated as','see','視為'],['discipline','keeping order','紀律'],['allow','let','容許'],['far more freedom','much more freely','更多自由']),
 v(['Requiring pupils','Making students','要求學生'],['clear benefits','clear good points','明顯好處'],['equality','more equal','平等'],['school identity','part of the same school','學校身份認同'],['self-expression','show who they are','自我表達'],['family finances','cost families money','家庭財政']),
 v(['major advantage','big good point','主要優點'],['reduces','makes','減少'],['visible social differences','differences between richer and poorer children less easy to see','可見社會差異']),
 v(['pupils from poorer families','children from poorer families','較貧困家庭的學生'],['embarrassed','ashamed','尷尬'],['unfashionable','old-fashioned','不時尚'],['wealthier pupils','richer children','較富裕學生'],['expensive brands','costly labels','昂貴品牌']),
 v(['more equal place','fairer','更平等的地方'],['judged','judged','受到評價'],['behaviour and effort','what they do and how hard they try','行為和努力']),
 v(['strengthen','make','加強'],['sense of belonging','feel that they belong','歸屬感']),
 v(['badge','school sign','校徽'],['classmates','classmates','同學'],['shared community','one group','共同群體'],['sports team','sports players','運動隊伍'],['kit','clothes','隊服']),
 v(['However','But','然而'],['disadvantages','bad points','缺點']),
 v(['most obvious','clearest','最明顯'],['limit individuality','leave less room for each student to be different','限制個人特色']),
 v(['especially','particularly','尤其'],['explore their personality','try out who they are','探索個性'],['confidence','how sure they feel of themselves','自信'],['taste','what they like','品味']),
 v(['tightly controlled','control','嚴格控制'],['unnecessarily rigid','too strict','不必要地僵化'],['minor choices','Choices','小選擇'],['accessories','small things people wear','飾物'],['sources of conflict','cause arguments','衝突來源']),
 v(['Another drawback','Another problem','另一個缺點'],['cost','money','成本']),
 v(['Although','but','雖然'],['simplify clothing','make choosing clothes easier','簡化衣著'],['surprisingly expensive','cost a lot','出乎意料地昂貴'],['specific jackets','special coats','特定外套'],['sportswear','sports clothes','運動服'],['seasonal items','clothes for different seasons','季節性衣物'],['selected suppliers','chosen shops','指定供應商']),
 v(['several children','several children','幾個孩子'],['place a real strain','put real pressure','造成實際壓力'],['household budget','money they have to spend','家庭預算']),
 v(['In conclusion','To sum up','總結'],['promote equality','help students seem more equal','促進平等'],['stronger school identity','feel part of the school','更強學校身份認同'],['restrict personal expression','make it harder to show who they are','限制自我表達'],['financial pressure','pressure on family money','財政壓力']),
 v(['Overall','Overall','整體而言'],['clear social benefits','clear benefits for how students live together','明顯社會好處'],['practical and personal drawbacks','money and personal costs','實際及個人缺點']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many schools, phones are treated as a distraction, while others allow pupils to use them in class.',d:[1,7,11],relation:'以 while 對比兩類學校做法',formula:'In many schools, [做法甲], while others [做法乙]',meaning:'有些學校把校服視為紀律一部分，另一些給學生更多衣著自由。',usage:'while 連的是兩種做法，不代表作者此刻已選邊。',links:['In many schools, ', ', while others ','.'],labels:['第一做法','另一做法']},
 {example:'Requiring pupils to follow a dress code has several clear benefits, especially in relation to equality and belonging, but it can also create problems for personal choice and cost.',d:[0,8,11],relation:'在引言同時列明校服的兩組利與兩組弊',formula:'Requiring pupils to [要求] has several clear benefits, especially in relation to [好處], but it can also create problems for [弊端]',meaning:'校服有助平等及歸屬，也可能妨礙表達並帶來家庭開支。',usage:'列出兩邊後，正文要分別用機制和例子支持。',links:['Requiring pupils to ', ' has several clear benefits, especially in relation to ', ', but it can also create problems for ','.'],labels:['要求','好處','弊端']},
 {example:'One major advantage is that a common outfit reduces visible differences in family income.',d:[1,5,8],relation:'第一好處從可見的貧富差異切入',formula:'One major advantage is that [措施] reduces visible [差異]',meaning:'相似衣著能減少孩子之間一眼可見的社會差異。',usage:'可見差異減少不等於所有經濟不平等消失。',links:['One major advantage is that ', ' reduces visible ','.'],labels:['措施','差異']},
 {example:'If everyone wears similar clothes, pupils from poorer families are less likely to feel embarrassed by old coats, and wealthier pupils have fewer chances to display costly labels.',d:[2,7,12],relation:'用 If 同時解釋較貧困及富裕學生的可見衣著比較',formula:'If everyone wears similar clothes, pupils from poorer families are less likely to [負面感受], and wealthier pupils have fewer chances to [炫示行為]',meaning:'相近衣著減少窮學生的尷尬和富學生展示昂貴品牌的機會。',usage:'這是可見比較的可能減少，不表示學生完全不會比較。',links:['If everyone wears similar clothes, pupils from poorer families are less likely to ', ', and wealthier pupils have fewer chances to ','.'],labels:['減少的尷尬','減少的炫示']},
 {example:'This can make the classroom feel like a fairer place, where children are judged more by their effort than by their clothes.',d:[2,8,13],relation:'This 回指相似衣著，進一步推到評價標準',formula:'This can make the classroom feel like [更平等環境], where children are judged more by [內在行為] than by [外表]',meaning:'課室可能更平等，孩子較多按行為與努力而非衣著被看待。',usage:'can/f​​eel 保留主觀可能性，不可宣稱校服消除偏見。',links:['This can make the classroom feel like ', ', where children are judged more by ', ' than by ','.'],labels:['環境','評價依據','外在比較']},
 {example:'Uniforms can also strengthen a sense of shared purpose.',d:[2,8,11],relation:'短主題句提出第二好處：歸屬感',formula:'Uniforms can also strengthen a sense of [群體感受]',meaning:'校服也可能加強學生的歸屬感。',usage:'下一句須用共同顏色、校徽和隊服比喻補充機制。',links:['Uniforms can also strengthen a sense of ','.'],labels:['群體感受']},
 {example:'A child who puts on the same colours and badge as their classmates may feel that they are part of a shared school, much like a sports team whose kit reminds its members of their common goal.',d:[3,9,12],relation:'用同色校徽與運動隊服比喻具體化群體認同',formula:'A child who puts on [共同標誌] may feel that they are part of [群體], much like a sports team whose kit [提醒作用]',meaning:'同色與校徽可讓孩子感到自己屬於更大的群體。',usage:'may feel 是可能的心理效果；運動隊服只是比喻。',links:['A child who puts on ', ' may feel that they are part of ', ', much like a sports team whose kit ','.'],labels:['共同標誌','所屬群體','比喻效果']},
 {example:'However, school uniforms also have limits.',d:[2,5,11],relation:'用 However 把論證從好處轉到缺點',formula:'However, school uniforms also have [反面評價]',meaning:'校服也有不能忽略的缺點。',usage:'轉折後須具體分析自我表達和家庭成本。',links:['However, school uniforms also have ','.'],labels:['反面評價']},
 {example:'The most obvious one is that they limit personal choice.',d:[2,5,11],relation:'one 回指上一句的 disadvantages',formula:'The most obvious one is that they [首要缺點]',meaning:'最明顯的弊端是限制個人特色。',usage:'one 需有前句的複數缺點作先行詞，不能單獨開段。',links:['The most obvious one is that they ','.'],labels:['首要缺點']},
 {example:'Children, especially teenagers, often use clothing to explore their identity, confidence, and preferences.',d:[3,6,12],relation:'說明服裝為何與青少年自我探索相關',formula:'Children, especially teenagers, often use clothing to explore [自我面向]',meaning:'青少年可能透過衣著探索個性、自信和品味。',usage:'often 表常見情況，不代表所有學生都同樣依賴衣服表達。',links:['Children, especially teenagers, often use clothing to explore ','.'],labels:['探索的自我面向']},
 {example:'If every detail is tightly controlled, school may start to feel unnecessarily rigid, and small choices about hair and shoes can become sources of conflict rather than learning.',d:[3,7,13],relation:'以 If 解釋過度管制如何把小選擇變成衝突',formula:'If every detail is tightly controlled, school may start to feel unnecessarily rigid, and [小選擇] can become sources of conflict rather than learning',meaning:'規範過細可能讓學校過分僵化，髮型等小事變成爭拗。',usage:'此處批評的是每個細節都嚴管；不等於任何校服規定都有同等後果。',links:['If every detail is tightly controlled, school may start to feel unnecessarily rigid, and ', ' can become sources of conflict rather than learning.'],labels:['小選擇']},
 {example:'Another drawback is the expense for families.',d:[2,5,8],relation:'以另一個短主題句從表達限制轉到家庭開支',formula:'Another drawback is [第二弊端]',meaning:'另一個弊端是購買校服的成本。',usage:'短句要接下一句的指定外套、鞋、運動服等具體開支。',links:['Another drawback is ','.'],labels:['第二弊端']},
 {example:'Although uniforms are meant to simplify clothing, they can be surprisingly expensive when schools require special jackets and sportswear from selected suppliers.',d:[3,6,11],relation:'用 Although 對比簡化衣著的本意與指定用品的高成本',formula:'Although uniforms are meant to simplify clothing, they can be surprisingly expensive when [指定購買條件]',meaning:'校服本意簡化衣著，指定用品及供應商卻可令費用高。',usage:'句中 when 清楚指出費用高的條件，不可說所有校服必定昂貴。',links:['Although uniforms are meant to simplify clothing, they can be surprisingly expensive when ','.'],labels:['昂貴的條件']},
 {example:'For families with several children, these costs can place a real strain on the family budget.',d:[3,7,12],relation:'把多件指定校服成本連到多子女家庭預算',formula:'For families with [家庭條件], these costs can place a real strain on [預算]',meaning:'多子女家庭可能承受較大的校服費用壓力。',usage:'these costs 回指上一句的校服用品與指定購買開支。',links:['For families with ', ', these costs can place a real strain on ','.'],labels:['家庭條件','受壓資源']},
 {example:'In conclusion, school uniforms can promote equality, discipline, and a stronger school identity, but they may also restrict individuality and create financial pressure.',d:[1,7,12],relation:'結論總結平等與歸屬好處，以及表達與財務缺點',formula:'In conclusion, school uniforms can promote [好處], but they may also restrict [表達] and create [費用壓力]',meaning:'校服可能促進平等及身份認同，但也可能限制表達、增加費用。',usage:'原文也提 discipline，但正文沒有獨立展開；練習時勿把它當已充分證明的主論點。',links:['In conclusion, school uniforms can promote ', ', but they may also restrict ', ' and create ','.'],labels:['好處','個人表達','經濟壓力']},
 {example:'Overall, they bring clear social benefits, while also creating financial and personal drawbacks.',d:[1,7,11],relation:'以 while 在最後一句保持利弊並列的平衡',formula:'Overall, they bring [好處], while also creating [弊端]',meaning:'校服有社會層面的好處，也有個人與實際層面的缺點。',usage:'這篇範文最後作平衡總結，沒有宣稱一邊決定性壓倒另一邊。',links:['Overall, they bring ', ', while also creating ','.'],labels:['好處','弊端']},
];
const usageGuides=[
 '當你要用 while 對比兩個機構或群體的不同做法，而暫時不下判斷時。',
 '當你要在引言先列一項要求的主要好處及可能代價，再逐段分析時。',
 '當你要用主題句指出一項措施如何減少表面可見的差異時。',
 '當你要用 If 解釋同一措施對兩個不同群體各有甚麼可能影響時。',
 '當你要用 This 回指前句的變化，再比較人們按行為還是外表評價他人時。',
 '當你要提出第二項與第一項不同的群體或心理好處時。',
 '當你要用熟悉的群體標誌作比喻，解釋抽象的歸屬感時。',
 '當你已分析好處，接着要用 However 明確轉向缺點時。',
 '當你要用 one 回指上一句的複數缺點，挑出最明顯的一項時。',
 '當你要解釋一項個人選擇為何關乎身份探索或自我表達時。',
 '當你要以 If 指出規管過細時，小選擇如何可能變成衝突時。',
 '當你要用短主題句從第一項缺點轉到成本等第二項代價時。',
 '當你要用 Although 對比一項措施的簡化本意，與特定條件下反而增加的費用時。',
 '當你要指出同一費用對特定家庭或群體的預算壓力較大時。',
 '當你在結論同時回收群體好處、個人代價及財務代價時。',
 '當你要用 while 在最後一句保持兩邊並列，而不宣稱某邊全面勝出時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的段落順序，把好處、機制及代價配對。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這篇文章評估甚麼做法的優點與缺點？',['要求學生穿校服','只比較兩種運動服','取消所有學校規則','把校徽改成新顏色'],'題目是 school uniforms 的利弊。'),
 {type:'multi',prompt:'正文實際展開的兩組主要好處是甚麼？',detail:'選兩項，再按「確認」。',options:['減少可見的貧富衣著差異','透過共同標誌加強歸屬感','保證家庭毋須買任何衣服','保證每名學生取得更高分數'],correct:[0,1],why:'正文先分析平等，再以共同顏色、校徽和隊服比喻解釋歸屬。'},
];
const route=[sequence('依範文重排校服利弊',[
 ['兩種做法與總覽','有學校把校服視為紀律一部分，也有學校給衣著自由；範文提出利弊兩邊。'],
 ['可見差異','相似衣著減少便宜衣服帶來的尷尬及展示名牌的機會。'],
 ['群體歸屬','共同顏色與校徽像隊服，可能讓學生感到自己屬於學校群體。'],
 ['自我表達','過細衣著規定或限制個性探索，讓小選擇變成衝突。'],
 ['家庭成本與結論','指定外套等費用可能壓迫多子女家庭；作者最後並列社會好處與實際、個人缺點。'],
 ],'最後一句是平衡利弊，不是宣布某一方完全勝出。')];
const evidence=[
 quiz('校服如何可能減少可見的社會差異？',['大家穿相似衣服，便宜衣服較少惹尷尬，昂貴品牌也較難展示','校服令每個家庭收入完全相同','所有學生都不再關注同學','昂貴品牌會自動消失於市場'],'範文只說可見衣著比較可能減少。'),
 quiz('「孩子更多按努力而非衣著被看待」依賴哪個前文條件？',['大家穿相似衣服，外表差異較不顯眼','所有人考試分數相同','學校完全取消體育課','孩子從不討論服裝'],'This 回指相似衣著帶來的視覺效果。'),
 quiz('運動隊服的比喻支援哪個好處？',['共同顏色與標誌可能加強群體歸屬','校服會提高體育成績','每所學校都是運動隊','學生必須參加競賽'],'比喻指向 shared community，而非運動表現。'),
 quiz('為何過細規定可能限制自我表達？',['衣著、髮型及飾物也可讓青少年探索個性，小選擇可能變成爭拗','所有青少年只靠衣服才能知道自己是誰','任何規定都必然造成嚴重衝突','選鞋子與學校生活完全無關'],'範文聚焦 tightly controlled 的情況，沒有普遍化到所有規則。'),
 quiz('甚麼條件可能令校服比預期貴？',['要求指定外套、鞋、運動服或季節用品，並限制供應商','學生可自由使用現有合適衣服','所有衣物完全免費','家庭可任選任何平價替代品'],'昂貴來自多種指定用品及供應渠道。'),
];
const logic=[
 sequence('平等論證的完整機制',[
 ['共同衣著','學生穿相似衣服。'],
 ['可見比較','貧困學生較少因便宜衣服尷尬，富裕學生較少炫示名牌。'],
 ['課室感受','學生可能更覺得彼此平等。'],
 ['評價焦點','行為與努力相對衣著變得更重要。'],
 ],'只說「校服促進平等」不夠，須解釋可見比較如何改變。'),
 sequence('歸屬、表達與開支的三條線',[
 ['共同標誌','相同顏色、校徽可能像隊服一樣提醒群體身份。'],
 ['表達空間','規則過細時，青少年較少透過衣著探索個性。'],
 ['購買條件','指定用品、季節服裝與供應商可能提高支出。'],
 ['結尾權衡','社會好處與個人、財務缺點都保留。'],
 ],'群體身份、個人表達與家庭成本是不同評價維度。'),
];
const transfers=[
 transfer('學校考慮讓全體學生使用相同款式書包。','哪句合理轉用「可見差異」的論證？',["同款書包可減少名牌展示，卻不能消除收入差異", "書包外觀相同後，學生便不可能在其他物品上互相比較", "統一款式能減少可見差異，所以各家收入也會趨於相同", "名牌書包較少出現，便表示學生不再留意同學的行為"],["只減少一項可見比較，不保證經濟平等。", "其他比較仍可能存在。", "外觀不改變收入。", "把衣物比較轉成另一不相干結果。"],[2,3,4],'原文相似衣服減少可見比較，並未宣稱不平等消失。'),
 transfer('一支社團隊伍讓成員在活動日佩戴共同徽章。','哪句準確使用隊服比喻的邏輯？',["共同徽章或提醒成員屬同一隊，因而增加歸屬感", "佩戴同一徽章後，所有成員的技能和工作量便會相同", "隊員已有徽章，所以活動時不再需要互相合作", "徽章可能提供身份象徵，卻不可能影響任何團隊感"],["共同可見標誌可作團隊身份提醒。", "標誌不等於能力相同。", "象徵不取代實際合作。", "忽略身份提示作用。"],[5,6],'原文 same colours and badge→shared community，like a sports team。'),
 transfer('某學校允許校服，但對襪子和髮夾的顏色也作極細規定。','哪句分析過度管制的可能代價？',["細節全受規管，學生或感僵化並易生爭拗", "制服有基本規範，便表示任何細節限制都不會造成壓力", "學校多管一種顏色，就能讓所有學生更充分表達個性", "規定細節或有管理目的，所以學生不可能因小事爭論"],["指出過度微觀管制的代價。", "基本規範不等於所有細節無害。", "限制太細可能壓縮選擇。", "目的不取消實際摩擦。"],[9,10],'原文 If every detail is tightly controlled→rigid/conflict。'),
 transfer('校服政策要求同時購買校內專用外套與運動服。','哪句把費用顧慮說具體？',["專用衣物增加購買項目，多子女家庭或更受壓", "指定服裝能維持一致，所以家庭不需要計算新增支出", "多子女家庭要買更多件，但每件必定比原有便服便宜", "運動服與外套都是校服，因此總購買數量不會增加"],["把指定用品數量連到家庭總費用。", "政策目的不取消價格。", "價格未必較低。", "項目增加可能加重預算。"],[12,13],'原文指定外套、運動服與供應商→家庭預算壓力。'),
 transfer('有人主張共通服裝使課室更平等。','哪句避免把「較平等的感受」寫成保證？',["衣著差異較不顯眼時，學生或能較重視行為與努力", "所有人穿相同衣服，便代表個人的努力與品格都一致", "可見比較減少後，學生便完全不會再產生任何偏見", "統一服裝或改善感受，所以家庭收入差距已經消失"],["改善可見比較與感受，未保證根本平等。", "外表一致不等於個人一致。", "偏見不會自動歸零。", "收入差距不因衣服消失。"],[3,4],'原文 This can make the classroom feel like a more equal place。'),
 transfer('社團希望有共同形象，但成員仍想保留個人風格。','哪句公平呈現兩種需要？',["共同標誌增群體感，過細規定卻壓縮個人表達", "社團若採用同一標誌，成員便無法保留任何個人風格", "個人風格值得保留，因此社團不應建立任何共同形象", "標誌能帶來團隊感，所以無論多細的服裝規定都合理"],["保留群體認同與個人表達兩種需要。", "共同標誌不等於全面統一。", "個人風格不排斥共同元素。", "團隊感不正當化所有限制。"],[5,9,10],'原文一方面說 belonging，另一方面說 individuality。'),
 transfer('學校引入指定平板電腦型號，理由是上課工具一致。','哪句轉用「本意與實際成本」的對比？',["工具一致方便教學，指定型號或加重家庭開支", "平板款式相同，便足以證明每個家庭都有同樣支付能力", "指定型號可能較貴，所以統一工具不可能有教學用途", "學校指定供應商，便表示該產品一定是最便宜選擇"],["比較統一教學與實際購買成本。", "一致不代表負擔相同。", "費用代價不否定教學可能。", "指定不保證低價。"],[12,13],'原文 Although uniforms meant to simplify clothing, specified items can be expensive。'),
 transfer('作文須比較學校制服與自由衣著。','哪句提供沒有過度下結論的平衡收束？',["制服有助認同、減少比較，也可能限表達和增開支", "制服能讓學生有群體感，便足以解決所有紀律問題", "自由衣著可保留個性，所以家庭便完全不用購買服裝", "部分家庭有費用壓力，便證明制服沒有任何共同形象價值"],["完整承認兩邊收益與代價，避免絕對判斷。", "群體感不保證紀律。", "自由衣著仍有成本。", "成本不取消可能收益。"],[2,5,9,13,15],'原文最後並列社會好處及個人、實際缺點。'),
 transfer('校方聲稱校服會提升學生紀律。','哪句符合這篇範文的證據範圍？',["正文談平等與歸屬，紀律改善仍需另找證據", "引言提過紀律，便表示正文已詳細證明紀律必定提升", "校服可能影響紀律，所以不必再區分有論證與無論證", "正文談群體認同，便可直接推出所有學生的守規情況"],["區分範文確實論證與僅提及的效果。", "提及不等於已證明。", "仍需看論證支持。", "群體感不自動證明紀律。"],[0,14],'原文首尾提 discipline，正文未獨立展開其改善機制。'),
 transfer('另一篇作文談公司員工服裝規定。','哪句可轉移範文的完整分析框架？',["同款服裝可增團隊感，也限選擇；指定供應須查開支", "公司有統一服裝後，員工個人選擇和費用便不需評估", "員工可能不喜歡規定，所以共同服裝不可能帶來團隊感", "公司服裝與校服有類似面向，因此兩題結論必然相同"],["轉移認同、表達與費用三個分析面向。", "只看認同漏掉代價。", "代價不否定可能收益。", "新題結論需另證。"],[5,9,12,13],'原文 belonging、individuality、cost 可轉為分析維度。'),
];
const revised=[
 {wrong:['書包外觀相同後，學生可能轉向比較其他學用品','統一款式能減少可見差異，家庭仍須支付書包費','名牌書包較少出現，學校可再規範其他學用品'],why:['指出可能轉移比較，卻沒有概括家庭收入仍有差異。','有提費用，未清楚區分可見衣著與收入不平等。','是可能的後續規範，未回答此措施的實際邊界。']},
 {wrong:['共同徽章提醒隊員身份，合作方式則由導師決定','佩戴徽章可方便辨認成員，技能仍須另作訓練','徽章可能提供團隊象徵，活動結束後便可收起'],why:['只談身份與管理，未說明提醒如何增加歸屬感。','辨認有用，卻不是隊服比喻的群體感機制。','強調使用時間，未解釋共同象徵對成員的作用。']},
 {wrong:['襪子髮夾受規管，學生可另用個人書包表達風格','細節統一方便管理，學生的不滿可待學期末討論','規定顏色有管理目的，因此教師應加強日常巡查'],why:['轉移表達方式是對策，未指出細規可能產生爭拗。','管理方便不應推遲處理已知的僵化感。','更嚴巡查可能增加而非減少細節管制的摩擦。']},
 {wrong:['專用外套與運動服增加用品種類，學校可提供清單','多子女家庭要買更多件，可先安排分期付款減壓','指定服裝或品質較好，價格應由家長自行查詢'],why:['清單有用，沒有寫出增加項目如何加重家庭開支。','分期是付款方法，不會自動減少指定用品總成本。','品質可能較好，但未說明多子女家庭的費用顧慮。']},
 {wrong:['衣著差異較不顯眼時，學生可注意同學成績','學生穿相同衣服，可減少衣著相關的公開討論','統一服裝或改善課室氣氛，家長可再討論開支'],why:['成績也可能成比較來源，未表達關注努力與行為。','只談減少討論，沒有說明平等感的合理限定。','開支值得談，卻未指出可見差異減少不等於收入相同。']},
 {wrong:['共同標誌能增團隊感，其他衣著可由主管決定','社團保留個人風格，識別成員可改用共同名牌','標誌有助形象，活動時可再統一成員的鞋子'],why:['主管決定其他衣著仍可能壓縮個人表達。','名牌可識別，但未兼顧成員想要的共同形象。','增加細規可能削弱題目所說的個人風格。']},
 {wrong:['工具一致可方便教學，家庭可自行比較不同商店','指定型號可能較貴，學生可先共用校內平板設備','學校統一供應商後，家長可向校方詢問購買折扣'],why:['比價有幫助，但未明確指出指定型號可能加重負擔。','共用設備是可能對策，沒有完整比較本意與家庭成本。','詢問折扣有用，仍未評估實際購買開支。']},
 {wrong:['制服或助認同，學生的個人風格可在課外表達','自由衣著能保留個性，家庭仍須購買合適衣物','部分家庭有費用壓力，校方可提供二手制服'],why:['只處理表達限制，未回顧費用及減少比較的兩面。','只談自由衣著，沒有概括制服的可能收益。','提出對策，卻未完整收束身份與表達的權衡。']},
 {wrong:['引言提到紀律，校方可先用出席率檢查變化','校服可能影響紀律，正文的歸屬論證可作旁證','正文談群體認同，因此紀律改善值得再研究'],why:['出席率可作資料，仍未證明範文已論證紀律。','歸屬感與紀律相關性未在正文獨立建立。','值得研究是合理，但不能當作本文已有的證據。']},
 {wrong:['同款服裝或增團隊感，供應商報價可另行研究','員工需要保留風格，因此公司可用徽章取代制服','公司服裝與校服相似，應先採用學校的成本資料'],why:['只有團隊感與報價，未把表達限制納入框架。','徽章是可能方案，未完整分析認同、選擇與開支。','題材相似不代表成本資料或結論可直接照搬。']}
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
export default {key:'advantage-disadvantage:9',meta:{topic:'校服的平等、歸屬、表達與家庭成本',summary:'範文指出校服或減少可見衣著比較並加強群體歸屬，同時可能限制青少年表達及增加指定用品開支；結論保留兩邊。紀律雖在首尾出現，正文並未獨立展開。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
