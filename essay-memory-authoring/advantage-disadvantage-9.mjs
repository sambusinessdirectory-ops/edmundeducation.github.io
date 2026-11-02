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
 transfer('學校考慮讓全體學生使用相同款式書包。','哪句合理轉用「可見差異」的論證？',['相同款式可能減少名牌書包的展示，但不能消除家庭收入差距。','相同書包會令所有家庭收入變成一樣。','書包相同便能保證每名學生互相喜歡。','品牌不再出現在書包上，學生便永遠不會比較。'],['可見比較減少，但仍保留其他差異。','把表面一致誤當經濟平等。','無人際保證。','過度斷言。'],[2,3,4],'原文相似衣服減少可見比較，並未宣稱不平等消失。'),
 transfer('一支社團隊伍讓成員在活動日佩戴共同徽章。','哪句準確使用隊服比喻的邏輯？',['共同徽章可能提醒成員屬於同一團隊，增強歸屬感。','佩戴徽章保證每個成員表現一樣。','徽章會替成員完成全部工作。','只有參加運動的人才可能有歸屬感。'],['共同標誌→群體感受。','無表現保證。','標誌不替代行動。','比喻可延伸至非運動團體。'],[5,6],'原文 same colours and badge→shared community，like a sports team。'),
 transfer('某學校允許校服，但對襪子和髮夾的顏色也作極細規定。','哪句分析過度管制的可能代價？',['小選擇若全受控制，學生可能感到不必要的僵化，並為細節爭拗。','只要有校服，就一定出現嚴重衝突。','髮夾顏色會直接決定學生成績。','細節越多，學生必然越能探索個性。'],['指出 tightly controlled 的條件及後果。','過度普遍化。','無分數機制。','方向相反。'],[9,10],'原文 If every detail is tightly controlled→rigid/conflict。'),
 transfer('校服政策要求同時購買校內專用外套與運動服。','哪句把費用顧慮說具體？',['指定用品會增加購買項目，多子女家庭可能面對較大預算壓力。','只要叫校服，價錢一定比任何便服低。','外套和運動服完全不需要付費。','購買項目增加與家庭預算沒有任何關係。'],['購買條件→成本→多子女家庭壓力。','非所有校服都便宜。','與條件相反。','忽略開支。'],[12,13],'原文指定外套、運動服與供應商→家庭預算壓力。'),
 transfer('有人主張共通服裝使課室更平等。','哪句避免把「較平等的感受」寫成保證？',['衣著差異較少顯眼時，學生可能更重視同學的行為與努力。','只要穿一樣，所有偏見都會消失。','共通服裝令每個人的努力自動相同。','外表差異減少便證明所有人經濟狀況一致。'],['保留 may/can 的可能性與具體機制。','過度保證。','無此因果。','外表非收入。'],[3,4],'原文 This can make the classroom feel like a more equal place。'),
 transfer('社團希望有共同形象，但成員仍想保留個人風格。','哪句公平呈現兩種需要？',['共同標誌可培養群體感，若規定過細也可能壓縮個人表達。','有共同標誌就絕不可能保留個人風格。','個人風格存在便不能有任何團隊感。','只要成員喜歡同一顏色，所有成本便消失。'],['歸屬與表達同時成立，須看規定程度。','絕對化。','不必互斥。','顏色不消除成本。'],[5,9,10],'原文一方面說 belonging，另一方面說 individuality。'),
 transfer('學校引入指定平板電腦型號，理由是上課工具一致。','哪句轉用「本意與實際成本」的對比？',['統一工具或使使用更簡單，但指定型號也可能提高家庭支出。','工具一致便代表每個家庭都付得起。','費用高便證明統一工具沒有任何教學用途。','只要學校要求購買，指定型號一定最便宜。'],['先承認簡化本意，再指出指定購買代價。','忽略負擔差異。','抹掉可能好處。','無價格根據。'],[12,13],'原文 Although uniforms meant to simplify clothing, specified items can be expensive。'),
 transfer('作文須比較學校制服與自由衣著。','哪句提供沒有過度下結論的平衡收束？',['制服可能加強群體認同並減少可見比較，也可能限制表達並增加部分家庭開支。','制服一定解決全部紀律與不平等問題。','自由衣著一定使所有家庭沒有任何費用。','只要有一項缺點，所有好處便不存在。'],['完整回顧兩組正文支持的利弊。','把未充分證明的紀律放大。','自由衣著也有費用。','無法合理權衡。'],[2,5,9,13,15],'原文最後並列社會好處及個人、實際缺點。'),
 transfer('校方聲稱校服會提升學生紀律。','哪句符合這篇範文的證據範圍？',['範文提及紀律，但正文主要論證平等與歸屬，若主張紀律改善仍需額外證據。','範文已用詳細數據證明紀律必定改善。','只要引言出現紀律，正文便毋須任何支持。','紀律與校服絕對不可能有關。'],['區分提及與充分論證。','無數據。','論點仍需支持。','過度否定。'],[0,14],'原文首尾提 discipline，正文未獨立展開其改善機制。'),
 transfer('另一篇作文談公司員工服裝規定。','哪句可轉移範文的完整分析框架？',['同款服裝或提升團隊感，也可限制個人選擇；若要指定供應商，還須評估員工開支。','公司服裝與學校校服完全一樣，所有效果必然相同。','只需討論顏色，無須考慮個人或費用。','有團隊感便證明所有員工都喜歡規定。'],['轉移群體、表達和成本三個維度，同時保留情境差異。','跨情境不保證相同。','漏核心代價。','無喜好保證。'],[5,9,12,13],'原文 belonging、individuality、cost 可轉為分析維度。'),
];
export default {key:'advantage-disadvantage:9',meta:{topic:'校服的平等、歸屬、表達與家庭成本',summary:'範文指出校服或減少可見衣著比較並加強群體歸屬，同時可能限制青少年表達及增加指定用品開支；結論保留兩邊。紀律雖在首尾出現，正文並未獨立展開。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
