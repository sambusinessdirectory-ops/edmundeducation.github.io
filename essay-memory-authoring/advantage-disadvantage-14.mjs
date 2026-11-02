// Renting: lower upfront barrier and mobility versus security, equity and control.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:14'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many countries, renting a home is common, especially in big cities where homes cost a great deal to buy.',
 'Renting has clear good points, such as more freedom with money and an easier time moving, but it also has problems, such as feeling unsure about staying and not gaining the long-term benefits of owning a home.',
 'One big good point is that renting needs much less money at the start.',
 'Buying a home usually needs a large first payment, legal costs and loan payments for many years. Renting is easier to start for young adults, newly married people and people with lower incomes.',
 'So people who rent can use their savings for other important things, such as education, caring for children or money for emergencies.',
 'Renting also makes it easier for people to move.',
 'For example, if a worker gets a job in another city, moving when a rental agreement ends is usually much easier than selling a home.',
 'Also, people who rent often do not have to pay for big repairs, which can cost home owners a lot.',
 'But renting has problems too.',
 'Perhaps the biggest problem is that people may not be sure how long they can stay.',
 'People who rent may have to pay higher rent, follow strict agreements or move suddenly if the owner decides to sell the home.',
 'This lack of certainty can be especially hard for families with children, because moving often may interrupt school and friendships.',
 'Another problem is that paying rent does not help someone build a share in a property.',
 'After paying rent for years, a renter may have little property wealth from those payments, while a home owner slowly gains an asset whose value may rise over time.',
 'People who rent also have less power to change their home, because even small changes often need the owner to agree.',
 'To sum up, renting can be attractive because it needs less money at the start, lets people move more easily and often leaves big repairs to others.',
 'Still, these benefits come with less certainty about staying, less power to change the home and no property wealth gained from rent payments.',
];
const vocabulary=[
 v(['renting','renting a home','租屋'],['common housing choice','common','常見居住選擇'],['large cities','big cities','大城市'],['property prices','homes cost','房價'],['extremely high','a great deal','極高']),
 v(['financial flexibility','more freedom with money','財務彈性'],['greater mobility','easier time moving','更易搬遷'],['insecurity','feeling unsure about staying','居住不穩'],['absence of long-term ownership benefits','not gaining the long-term benefits of owning a home','沒有長期擁有好處']),
 v(['major advantage','big good point','主要優點'],['far less money','much less money','少得多資金'],['at the outset','at the start','起初']),
 v(['property','home','物業'],['substantial deposit','large first payment','大筆首期'],['legal fees','legal costs','法律費用'],['long-term mortgage repayments','loan payments for many years','長期按揭供款'],['more accessible','easier to start','較易負擔'],['young adults','young adults','年輕成年人'],['people with modest incomes','people with lower incomes','收入不高的人']),
 v(['As a result','So','因此'],['tenants','people who rent','租客'],['direct their savings','use their savings','運用儲蓄'],['priorities','important things','優先事項'],['childcare','caring for children','照顧孩子'],['emergency funds','money for emergencies','應急儲備']),
 v(['freedom to move','easier for people to move','搬遷自由'],['more easily','easier','更容易']),
 v(['job offer','gets a job','工作機會'],['for instance','For example','例如'],['lease','rental agreement','租約'],['sell a home','selling a home','出售房屋']),
 v(['Moreover','Also','此外'],['tenants','people who rent','租客'],['spared major repair costs','do not have to pay for big repairs','免負大型維修費'],['heavy burden','cost home owners a lot','沉重負擔'],['homeowners','home owners','業主']),
 v(['However','But','然而'],['not without drawbacks','has problems too','並非沒有缺點']),
 v(['Perhaps','Perhaps','或許'],['most serious','biggest','最嚴重'],['lack of security','not be sure how long they can stay','缺乏居住保障']),
 v(['Tenants','People who rent','租客'],['rising rents','higher rent','租金上升'],['restrictive contracts','strict agreements','限制性合約'],['sudden eviction','move suddenly','突然搬遷'],['landlord','owner','業主']),
 v(['uncertainty','lack of certainty','不確定性'],['families with children','families with children','有孩子家庭'],['disrupted','interrupt','打亂'],['frequent moves','moving often','經常搬家']),
 v(['Another disadvantage','Another problem','另一缺點'],['rent payments','paying rent','租金支出'],['do not build equity','does not help someone build a share in a property','不會累積物業權益']),
 v(['monthly rent','rent','每月租金'],['tenant','renter','租客'],['little to show for it financially','little property wealth from those payments','未累積多少物業財富'],['homeowners','home owner','業主'],['gradually acquire an asset','slowly gains an asset','逐漸獲得資產'],['may increase in value','value may rise','可能升值']),
 v(['Renters','People who rent','租客'],['limited control','less power','控制權有限'],['minor alterations','small changes','小改動'],['landlord’s approval','owner to agree','業主批准']),
 v(['In summary','To sum up','總結'],['lowers the initial financial barrier','needs less money at the start','降低初期財務門檻'],['offers flexibility','lets people move more easily','提供彈性'],['major maintenance','big repairs','大型維修']),
 v(['Nevertheless','Still','儘管如此'],['weaker residential security','less certainty about staying','較弱居住保障'],['limited personal control','less power to change the home','較少個人控制權'],['do not accumulate property wealth','no property wealth gained from rent payments','不累積物業財富']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many countries, renting has become a common choice, especially in cities where buying a home is expensive.',d:[1,8,15],relation:'以高房價背景引出租屋的普遍性',formula:'In many countries, renting has become [居住趨勢], especially in [特定地點]',meaning:'租屋在多國常見，房價高的大城市尤其如此。',usage:'背景句只說常見，未判定租屋一定比買樓適合所有人。',links:['In many countries, renting has become ', ', especially in ','.'],labels:['居住趨勢','特定地點']},
 {example:'This arrangement offers several clear advantages, including lower starting costs and easier moves, although it also brings notable disadvantages, such as limited security and less control.',d:[0,8,15],relation:'引言同時列出財務／搬遷好處與保障／權益缺點',formula:'This arrangement offers several clear advantages, including [好處], although it also brings notable disadvantages, such as [缺點]',meaning:'租屋有財務彈性和流動性，也有保障及長期擁有權益不足的缺點。',usage:'四個方向須在正文具體展開，不能只列詞。',links:['This arrangement offers several clear advantages, including ', ', although it also brings notable disadvantages, such as ','.'],labels:['好處','缺點']},
 {example:'One major advantage of renting is that it requires far less money before a person moves in.',d:[1,9,12],relation:'第一好處聚焦起初所需資金，非總成本',formula:'One major advantage of renting is that it requires far less money [比較時間]',meaning:'租屋起初需要的資金通常較少。',usage:'at the outset 指初期，不能把這句誤讀為長期總支出較低。',links:['One major advantage of renting is that it requires far less money ','.'],labels:['比較時間']},
 {example:'Buying a property usually demands a large deposit and legal fees, whereas renting is far more accessible for people starting their careers.',d:[2,8,12],relation:'用 whereas 比較買樓的初期資金門檻與租屋的可及性',formula:'Buying a property usually demands [購買成本], whereas renting is far more accessible for [較易租屋的人]',meaning:'首期、法律費及按揭與租屋初期門檻形成對比。',usage:'usually/far more accessible 仍是概括，具體金額依市場與個案而變。',links:['Buying a property usually demands ', ', whereas renting is far more accessible for ','.'],labels:['買樓費用','受益群體']},
 {example:'As a result, tenants can direct their savings towards education, childcare or a fund for emergencies.',d:[3,8,12],relation:'由較低初期支出推到儲蓄可用於其他優先事項',formula:'As a result, tenants can direct their savings towards [其他需要]',meaning:'部分租客可把儲蓄用於教育、育兒或應急。',usage:'can 表可選擇，不能保證每位租客都有剩餘儲蓄。',links:['As a result, tenants can direct their savings towards ','.'],labels:['其他需要']},
 {example:'Renting also gives people the freedom to change cities more easily.',d:[2,9,12],relation:'第二好處從起始資金轉到搬遷自由',formula:'Renting also gives people the freedom to [搬遷選擇] more easily',meaning:'租屋通常讓人較容易搬遷。',usage:'下一句須用租約到期與售樓程序比較說明。',links:['Renting also gives people the freedom to ', ' more easily.'],labels:['搬遷選擇']},
 {example:'If a worker receives a job offer in another city, for instance, it is usually much easier to move at the end of a lease than to sell a property.',d:[3,8,12],relation:'以跨城市工作例子說明租約結束比售樓更易搬',formula:'If a worker receives a job offer in another city, for instance, it is usually much easier to [租客行動] than to [業主行動]',meaning:'員工跨城市轉職時，租約結束後搬走通常比售屋容易。',usage:'at the end of a lease 是明確條件，不能說租客任何時候都能無成本搬走。',links:['If a worker receives a job offer in another city, for instance, it is usually much easier to ', ' than to ','.'],labels:['租客行動','業主行動']},
 {example:'Moreover, tenants are often spared major repair costs, which would otherwise place a heavy burden on property owners.',d:[3,9,12],relation:'補充租客往往不用承擔大型維修費的好處',formula:'Moreover, tenants are often spared [大型費用], which would otherwise place a heavy burden on [承擔者]',meaning:'租客往往免付大型維修開支，而業主可能承擔這項負擔。',usage:'often 是範文限定詞，實際維修責任視合約及地方法規而定。',links:['Moreover, tenants are often spared ', ', which would otherwise place a heavy burden on ','.'],labels:['大型費用','承擔者']},
 {example:'However, renting is not without risks.',d:[2,5,12],relation:'轉入租屋缺點的段落',formula:'However, renting is not without [缺點類別]',meaning:'租屋除了好處，也有保障、權益及控制方面的缺點。',usage:'not without 意思是「有」，後面要提出具體弊端。',links:['However, renting is not without ','.'],labels:['缺點類別']},
 {example:'Perhaps the most serious one is the uncertainty it creates.',d:[2,5,12],relation:'one 回指 drawbacks，指出居住保障不足',formula:'Perhaps the most serious one is [最大缺點]',meaning:'作者認為居住保障不足可能是最嚴重問題。',usage:'Perhaps 表作者審慎評估，不能當成每位租客的共同排序。',links:['Perhaps the most serious one is ','.'],labels:['最大缺點']},
 {example:'Tenants may face higher rent or a sudden move if the landlord decides to sell the property.',d:[4,8,13],relation:'用可能加租、合約限制或突然搬遷具體化不穩定',formula:'Tenants may face [可能影響] if the landlord decides to [業主行動]',meaning:'業主若出售物業，租客可能面對租金或居住安排變動。',usage:'may 保留可能性；具體權利與程序依合約及地方法律。',links:['Tenants may face ', ' if the landlord decides to ','.'],labels:['租客可能面對的事','業主行動']},
 {example:'This uncertainty can be especially difficult for families with children, whose schooling and friendships may be disrupted by frequent moves.',d:[4,9,13],relation:'以家庭搬遷推到孩子學業與社交可能中斷',formula:'This uncertainty can be especially difficult for [家庭], whose [生活面向] may be disrupted by frequent moves',meaning:'頻繁搬家可能打亂孩子的學業和社交。',usage:'This uncertainty 指前句的加租、合約或搬遷風險。',links:['This uncertainty can be especially difficult for ', ', whose ', ' may be disrupted by frequent moves.'],labels:['受影響家庭','孩子生活']},
 {example:'Another disadvantage is that rent payments do not build a share of ownership in the home.',d:[2,5,9],relation:'另一缺點轉到租金本身不累積物業權益',formula:'Another disadvantage is that rent payments do not build [長期物業權益]',meaning:'支付租金不會使租客因該筆租金而取得物業權益。',usage:'這句只談 rent payments；不能說租客完全不能儲蓄或投資。',links:['Another disadvantage is that rent payments do not build ','.'],labels:['長期物業權益']},
 {example:'After years of paying monthly rent, a tenant may have little property equity from those payments, while homeowners gradually acquire an asset that may increase in value over time.',d:[3,9,12],relation:'用 while 比較多年租金支出與業主可能累積資產',formula:'After years of paying monthly rent, a tenant may have [租金後權益], while homeowners gradually acquire [可能增值的資產]',meaning:'租金本身不建物業權益；業主則可能逐漸擁有升值資產。',usage:'may increase 表房產可能升值，不能保證每所房屋都升值。',links:['After years of paying monthly rent, a tenant may have ', ', while homeowners gradually acquire ','.'],labels:['租金後權益','業主資產']},
 {example:'Renters also have limited control over their living space, since even minor alterations often require the landlord’s agreement.',d:[3,9,12],relation:'用 since 說明租客改動居住空間常須業主同意',formula:'Renters also have limited control over their living space, since even minor alterations often require [批准者]',meaning:'租客改動住房的權限可能受業主批准限制。',usage:'often 保留合約差異，勿說每一種微小改動都必須批准。',links:['Renters also have limited control over their living space, since even minor alterations often require ','.'],labels:['批准者']},
 {example:'In summary, renting can be attractive because it lowers the initial financial barrier, offers flexibility and reduces responsibility for major repairs.',d:[1,9,12],relation:'總結初期門檻、搬遷彈性及大型維修三項好處',formula:'In summary, renting can be attractive because it [財務好處], [彈性好處] and [維修好處]',meaning:'租屋吸引之處是初期負擔較低、彈性較大及大型維修責任可能較少。',usage:'結論列已論證好處，不應寫成租屋在所有成本面向都更便宜。',links:['In summary, renting can be attractive because it ', ', ', ' and ','.'],labels:['財務好處','彈性好處','維修好處']},
 {example:'Nevertheless, these benefits are balanced by weaker residential security, limited control and the fact that tenants do not build property equity through rent payments.',d:[1,8,12],relation:'最後以 Nevertheless 與 balanced by 保留保障、控制及權益缺點',formula:'Nevertheless, these benefits are balanced by [保障風險], [控制限制] and the fact that [權益限制]',meaning:'好處要與居住保障不足、改動權受限及租金不建物業權益一起看。',usage:'balanced by 是並列權衡，原文未說每個人都應買或都應租。',links:['Nevertheless, these benefits are balanced by ', ', ', ' and the fact that ','.'],labels:['保障風險','控制限制','權益限制']},
];
const usageGuides=[
 '當你要先交代一種選擇在哪些地點或條件下愈來愈普遍時。',
 '當你要在引言同時列出彈性好處與保障等代價，再逐段展開時。',
 '當你要比較兩種選擇，特別強調起初所需資金，而非長期總成本時。',
 '當你要用 whereas 對比兩種安排的財務門檻及較容易採用的群體時。',
 '當你要用 As a result 說明較低起始負擔如何讓資源可轉向其他需要時。',
 '當你要從財務好處轉入搬遷或轉換安排的彈性時。',
 '當你要提出工作地點改變的假設，再比較兩種安排的退出程序時。',
 '當你要補充某項大額費用通常由誰承擔，並用 which 說明負擔時。',
 '當你已說完好處，要用 not without 轉入真實但尚未展開的缺點時。',
 '當你要用 one 回指前句的複數缺點，選出可能最嚴重的一項時。',
 '當你要列出某群體可能面對的幾種變動，並以 if 指明觸發條件時。',
 '當你要用 This uncertainty 回指前句風險，再說特定家庭為何更受影響時。',
 '當你要從短期成本轉入長期權益是否能累積的另一項缺點時。',
 '當你要用 while 對比兩群人多年付款後可能得到的不同資產結果時。',
 '當你要用 since 解釋使用者為何不能完全改動或控制所用空間時。',
 '當你在結論先集中回顧初期成本、彈性與維修等多項好處時。',
 '當你已回顧好處，再以 Nevertheless 列出必須一併權衡的保障、控制與權益限制時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文次序分清初期資金、搬遷、維修、保障和權益。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('範文評估哪一種居住安排？',['租屋的優點與缺點','只討論建築物外觀','只比較兩間銀行利率','只討論裝修設計'],'renting 是文章中心。'),
 {type:'multi',prompt:'範文列出的兩種主要優點是甚麼？',detail:'選兩項，再按「確認」。',options:['較低的初期資金門檻','較容易因工作需要搬遷','保證租金永不上升','保證所有租客得到物業權益'],correct:[0,1],why:'起始成本與流動性是正文主線，另補充大型維修。'},
];
const route=[sequence('依範文還原租屋利弊',[
 ['背景與總覽','高房價城市常見租屋；文章提出彈性與保障／權益的兩面。'],
 ['初期門檻','買樓需首期、法律費與按揭；租屋讓部分人保留儲蓄處理其他需要。'],
 ['搬遷與維修','租約到期較易跨城市搬走；租客往往免付大型維修費。'],
 ['居住保障','加租、合約限制或因業主出售而搬遷，可能打亂有孩子家庭的生活。'],
 ['長期權益與控制','租金本身不建物業權益，改動住房亦常需業主同意；結論平衡利弊。'],
 ],'「初期所需較少」與「長期總成本」是不同問題。')];
const evidence=[
 quiz('「起初需要較少資金」在範文中如何比較？',['買樓通常有首期、法律費與長期按揭；租屋起始門檻較低','租屋多年後必定比買樓便宜','任何買樓人士都不能儲蓄','租屋完全不需付任何費用'],'原文限定 at the outset。'),
 quiz('租屋如何可能幫助跨城市轉職？',['租約結束時搬遷通常比出售房屋容易','租客在任何日子都能無條件搬走','轉職後必定不用付租金','業主都必須先出售房屋才能換工作'],'關鍵條件是 at the end of a lease。'),
 quiz('範文對大型維修費用了甚麼限定？',['租客往往毋須負擔，業主可能承受較大開支','所有租客都永不需支付任何維修費','所有業主都不用維修房屋','每份租約的維修責任完全相同'],'often 留出合約及個案差異。'),
 quiz('居住不穩對有孩子家庭可能有何影響？',['若經常搬遷，孩子的學業與社交生活可能受打亂','每次搬家都必然令孩子退學','加租一定提高孩子成績','租客不可能與鄰居建立關係'],'範文使用 may be disrupted。'),
 quiz('租金與物業權益的關係應如何準確表述？',['支付的租金本身不會讓租客累積該物業的權益','租客絕不可能擁有任何形式的資產','所有房屋都保證升值','買樓從不需要承擔任何成本'],'不建 equity 指 rent payments，不是所有儲蓄或資產。'),
];
const logic=[
 sequence('初期資金與搬遷彈性',[
 ['買樓門檻','首期、法律費和長期按揭供款通常涉及較多承擔。'],
 ['租屋初期','開始居住所需資金相對較少，部分儲蓄可用於其他需要。'],
 ['工作變動','另一城市的職位可能需要搬遷。'],
 ['租約條件','租約到期搬走通常比出售房屋簡單。'],
 ],'初期資金與搬遷是兩條獨立好處，並非長期財務回報的保證。'),
 sequence('保障、權益與居住控制',[
 ['居住不確定','租金、合約或業主售樓可能改變租客的安排。'],
 ['家庭後果','頻繁搬家或打亂孩子上學和友誼。'],
 ['權益差異','租金本身不建物業權益，業主則可能逐漸擁有資產。'],
 ['改動權限','租客的小型改動亦常需業主批准。'],
 ],'三項缺點要分開說，不要把「租客無物業權益」寫成「租客沒有任何資產」。'),
];
const transfers=[
 transfer('一名年輕員工可能兩年內轉職至另一城市。','哪句準確應用租屋的搬遷論證？',['若租約適時結束，搬走通常較易安排；買樓則可能需要出售物業。','租客可以在任何日子完全無成本離開。','買樓人士永遠不能到另一城市工作。','跨城市工作必定令所有人收入增加。'],['有租約到期條件，並作適度比較。','忽略租約條款。','過度斷言。','無收入保證。'],[5,6],'原文 job offer→move at end of lease easier than sell a home。'),
 transfer('新婚夫婦正在比較租屋與買樓的起始支出。','哪句正確限定比較時間？',['買樓通常需首期和法律費，租屋起初資金門檻較低，但這不等於長期總成本較低。','租屋第一年較易開始，所以十年總支出必然更少。','買樓完全沒有任何起始支出。','租屋不需任何租金或按金。'],['區分初期門檻與長期費用。','時間尺度錯誤。','與原文相反。','仍有租住費用。'],[2,3],'原文 far less money at the outset。'),
 transfer('某家庭租屋後把保留的儲蓄用於照顧孩子。','哪句連好前因後果？',['較低的起始資金需求，可能讓家庭把部分儲蓄轉投育兒等需要。','租屋令每個家庭都必然有大量儲蓄。','付租金會自動變成育兒津貼。','育兒支出與家庭資金安排完全無關。'],['起始門檻→可選擇的其他用途。','無儲蓄保證。','無此機制。','有資源取捨。'],[3,4],'原文 tenants can direct savings toward education/childcare/emergency。'),
 transfer('租約規定某些大型維修由業主負責。','哪句合理使用範文的維修論點？',['在這種安排下，租客或可避開部分大型維修開支，業主則承擔相應責任。','所有租約的每一項維修都由業主支付。','只要租屋，房屋便永遠不用維修。','業主負責維修便代表租金一定不變。'],['符合具體條件並保留 often。','合約可不同。','維修仍存在。','租金另有因素。'],[7],'原文 tenants often spared major repair costs。'),
 transfer('一家有孩子的租戶因租屋安排變動而可能頻繁搬家。','哪句解釋範文關心的後果？',['經常搬遷可能打亂孩子的學校安排和友誼，因此居住保障值得考慮。','每次搬家都必然令孩子沒有任何朋友。','只要學校不變，搬遷就完全不影響家庭。','租屋不穩只會影響業主，與租客無關。'],['保障風險→學業社交後果。','過度斷言。','仍可能有其他影響。','方向相反。'],[9,10,11],'原文 uncertainty especially difficult for families with children。'),
 transfer('有人說租屋二十年後「一定一無所有」。','哪句修正這種過度說法？',['租金本身不建立該物業的權益，但租客仍可能透過其他方式儲蓄或持有資產。','所有租客必然沒有任何資產。','支付租金便自動取得房屋所有權。','業主的房產價值必然每年上升。'],['只限定租金與該物業權益的關係。','過度擴張。','與原文相反。','may increase 非保證。'],[12,13],'原文 rent payments do not build equity，非所有財富。'),
 transfer('業主要求租客裝修前先取得同意。','哪句說明租屋控制權的條件？',['即使是小改動，租客也常須取得業主批准，因此對居住空間的控制較有限。','租客從不可以更換任何物件。','每個業主都必然拒絕所有改動。','裝修同意與居住空間控制毫無關係。'],['把批准條件與控制權連起來。','過度絕對。','無此保證。','直接相關。'],[14],'原文 minor alterations often require landlord approval。'),
 transfer('一份作文結論要保留租屋的好處與缺點。','哪句最完整且不下絕對判斷？',['租屋或降低初期門檻並便利搬遷，但居住保障、物業權益與改動權仍需權衡。','租屋對每個人都必然是最好選擇。','租屋完全沒有任何好處。','買樓者永遠不會面對任何維修費。'],['列出兩邊而無普遍建議。','原文未普遍推薦。','抹掉好處。','與維修論點相反。'],[15,16],'原文 In summary...Nevertheless... balanced by。'),
 transfer('另一篇文章比較租用設備與購買設備。','哪句可轉用本文的分析框架？',['租用可能較易開始及更方便更換，但長期權益、使用控制和合約穩定性仍要看。','租設備與租房完全相同，所有條款必然一致。','起始費用低便證明長期費用必然最低。','設備租用沒有任何使用限制。'],['轉移時間、彈性、權益、控制等維度，保留情境差異。','跨情境不保證同條款。','時間尺度錯。','可能有合約限制。'],[2,5,12,14],'原文初期門檻、流動性、權益與控制可作比較維度。'),
 transfer('有人用「業主的資產可能升值」作買樓理由。','哪句保留原文不確定性？',['業主逐漸擁有物業資產，而其價值可能隨時間上升，並非保證。','所有房屋一定每年升值。','租客支付租金會自動得到同一房屋的所有權。','房屋升值與資產價值完全無關。'],['may increase 的限定保留下來。','把可能寫成必然。','與 equity 對比相反。','直接相關。'],[13],'原文 an asset that may increase in value over time。'),
];
export default {key:'advantage-disadvantage:14',meta:{topic:'租屋的初期門檻、搬遷彈性與居住保障',summary:'範文說租屋起初所需資金較少、較易因工作搬遷，租客往往免付大型維修；缺點是居住不穩、租金本身不建物業權益，以及住房改動受限。文章沒有給所有人相同的租買結論。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
