// Older recruits: judgement and mentoring versus payroll and training needs.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:28'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'As more people become older and keep working for more years, many companies are thinking again about which people they employ.',
 'Hiring more older workers can make some things harder for a business, especially pay costs and teaching people new skills.',
 'Even so, I think the good points are much greater because older workers often help companies make better decisions and remain more steady.',
 'The first big good point is that workers with long experience can make careful decisions for a company.',
 'After dealing with customers, deadlines and problems at work for many years, older workers are often better at seeing risks before they become expensive mistakes.',
 'For example, a manager who has bought goods for a company for many years may see that a supplier cannot be trusted and choose another one early, stopping delays in production.',
 'Older new workers can also help other staff do better because they work carefully and know how to talk to people, so they can teach others well.',
 'A sales worker with many years of experience who helps new staff learn how to agree prices and deal with customers can help a whole team settle into work faster.',
 'So the company gets not just one good worker but a team that can do more and deal better with problems.',
 'Still, there are some bad points.',
 'One is that older new workers may expect higher pay and better work benefits, which can put pressure on the money used to pay staff, especially in small businesses.',
 'If a new business hires several managers with long experience at the same time, its pay costs may grow faster than the money it brings in.',
 'Another problem is that, in companies changing their computer systems quickly, some older workers may at first need more help learning new tools.',
 'For example, a business that changes from paper records to online software may need to give extra training before staff can work as much as before.',
 'Even so, these are problems managers can handle, not strong reasons to refuse older people who apply for jobs.',
 'To sum up, hiring more older people can cost more and need extra teaching at first, but the good points for companies are greater.',
 'Their experience, dependable work and good influence on younger workers often bring more value over many years, especially in jobs needing careful decisions and trust.',
 'For this reason, more companies should be ready to hire them.',
];
const vocabulary=[
 v(['populations age','more people become older','人口老化'],['working lives lengthen','keep working for more years','工作年期延長'],['firms','companies','企業'],['rethinking the composition','thinking again about which people','重新思考組成'],['workforce','employ','勞動力']),
 v(['Recruiting','Hiring','聘用'],['older employees','older workers','年長員工'],['labour costs','pay costs','勞工成本'],['retraining','teaching people new skills','再培訓']),
 v(['Nevertheless','Even so','然而'],['advantages are clearly greater','good points are much greater','優點明顯更大'],['quality of decisions','better decisions','決策質素'],['stability of the organisation','remain more steady','機構穩定']),
 v(['first major benefit','first big good point','第一主要好處'],['depth of judgement','careful decisions','深厚判斷力'],['experienced staff','workers with long experience','資深員工']),
 v(['Having dealt with','After dealing with','曾處理'],['clients','customers','客戶'],['deadlines','deadlines','期限'],['recognising risks','seeing risks','察覺風險'],['costly mistakes','expensive mistakes','昂貴錯誤']),
 v(['seasoned purchasing manager','manager who has bought goods for a company for many years','資深採購經理'],['supplier is unreliable','supplier cannot be trusted','供應商不可靠'],['change vendors early','choose another one early','及早更換供應商'],['preventing delays in production','stopping delays in production','避免生產延誤']),
 v(['Older recruits','Older new workers','年長新聘員工'],['raise the performance of others','help other staff do better','提升他人表現'],['professional discipline','work carefully','專業紀律'],['communication skills','know how to talk to people','溝通技巧'],['effective mentors','teach others well','有效導師']),
 v(['veteran sales executive','sales worker with many years of experience','資深銷售主管'],['coaches new hires','helps new staff learn','指導新員工'],['negotiation','agree prices','談判'],['client handling','deal with customers','處理客戶'],['adjustment period','settle into work faster','適應期']),
 v(['Consequently','So','因此'],['not only one capable employee','not just one good worker','不只一位能幹員工'],['more competent and resilient workforce','team that can do more and deal better with problems','更能幹有韌性團隊']),
 v(['There are, however','Still, there are','然而亦有'],['some disadvantages','some bad points','一些缺點']),
 v(['higher salaries','higher pay','較高薪酬'],['better benefits','better work benefits','較佳福利'],['pressure on payroll budgets','pressure on the money used to pay staff','薪酬預算壓力'],['smaller firms','small businesses','小企業']),
 v(['start-up','new business','初創公司'],['highly experienced managers','managers with long experience','資深經理'],['wage bill','pay costs','薪資開支'],['revenue','money it brings in','收入']),
 v(['Another drawback','Another problem','另一缺點'],['rapid digital change','changing their computer systems quickly','快速數碼轉型'],['initially require more support','at first need more help','初期較需支援'],['newly introduced platforms','new tools','新平台']),
 v(['paper-based systems','paper records','紙本系統'],['cloud software','online software','雲端軟件'],['extra training','extra training','額外培訓'],['output returns to normal','work as much as before','產出恢復正常']),
 v(['Even so','Even so','即使如此'],['managerial challenges','problems managers can handle','管理挑戰'],['compelling reasons','strong reasons','有力理由'],['older applicants','older people who apply for jobs','年長求職者']),
 v(['In conclusion','To sum up','總結'],['employing more older people','hiring more older people','聘用更多年長人'],['increase expenditure','cost more','增加開支'],['short-term training demands','extra teaching at first','短期培訓需求']),
 v(['experience','experience','經驗'],['reliability','dependable work','可靠性'],['positive influence on younger staff','good influence on younger workers','對年輕員工正面影響'],['long-term value','value over many years','長遠價值'],['judgement','careful decisions','判斷力']),
 v(['For this reason','For this reason','基於此原因'],['be willing to recruit','be ready to hire','願意聘用']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'As populations age and working lives lengthen, many schools are rethinking the age mix of their teachers.',d:[1,9,15],relation:'As 交代人口背景與機構人手組成改變',formula:'As [兩項背景變化], many [機構] are rethinking [人手組成]',meaning:'人口老化及工作年期延長，令企業重新思考人手。',links:['As populations age and working lives lengthen, many ', ' are rethinking '],labels:['機構','需重想的組成']},
 {example:'Recruiting more experienced employees can certainly create challenges for a business, particularly in relation to salary costs and training.',d:[0,9,15],relation:'can certainly 承認僱用年長者的成本及培訓挑戰',formula:'Recruiting more [群體] can certainly create challenges for a business, particularly in relation to [兩項代價]',meaning:'更多年長員工可能帶來薪酬與再培訓挑戰。',links:['Recruiting more ', ' can certainly create challenges for a business, particularly in relation to '],labels:['被招聘群體','挑戰']},
 {example:'Nevertheless, the advantages are clearly greater, because experienced workers often enhance both project quality and team stability.',d:[1,9,15],relation:'Nevertheless 由挑戰轉向較重的判斷及穩定收益',formula:'Nevertheless, the advantages are clearly greater, because [人手] often enhance both [好處一] and [好處二]',meaning:'作者認為資深員工提升決策與組織穩定，整體好處較大。',links:['Nevertheless, the advantages are clearly greater, because ', ' often enhance both ', ' and '],labels:['人手','判斷好處','穩定好處']},
 {example:'The first major benefit is the depth of judgement that experienced advisers can bring to a team.',d:[2,9,15],relation:'主題句點出資深判斷力',formula:'The first major benefit is the depth of judgement that [資深者] can bring to [機構]',meaning:'資深員工有更深判斷力。',links:['The first major benefit is the depth of judgement that ', ' can bring to '],labels:['資深者','受益機構']},
 {example:'Having dealt with deadlines and workplace problems for many years, older employees are often better at recognising risks before they become costly mistakes.',d:[3,9,12],relation:'Having dealt with 說經驗來源，before 說及早發現風險',formula:'Having dealt with [長期經驗], [資深者] are often better at recognising risks before they become costly mistakes',meaning:'多年處理客戶與問題，令部分年長員工較能及早察覺風險。',links:['Having dealt with ', ' for many years, older employees are often better at recognising risks before they become costly mistakes.'],labels:['長期經驗']},
 {example:'A seasoned purchasing manager, for example, may detect signs that a supplier is unreliable and change vendors early, thereby preventing supply delays.',d:[3,9,12],relation:'採購經理例子連到早辨供應商問題和防延誤',formula:'A seasoned [職位], for example, may detect signs that [風險] and [預防行動], thereby preventing [損失]',meaning:'資深採購經理可及早換不可靠供應商，避免生產延誤。',links:['A seasoned ', ', for example, may detect signs that ', ' and change vendors early, thereby preventing '],labels:['職位','供應風險','避免的損失']},
 {example:'Older recruits can also raise the performance of junior staff, because their patience and communication skills make them effective mentors.',d:[3,9,12],relation:'because 解釋資深者如何透過紀律與溝通指導他人',formula:'Older recruits can also raise the performance of [其他員工], because [自身特質] make them effective mentors',meaning:'年長員工可作導師，提升其他人的表現。',links:['Older recruits can also raise the performance of ', ', because ', ' make them effective mentors.'],labels:['其他員工','成為導師的特質']},
 {example:'A veteran sales executive who coaches new hires in customer care can shorten the adjustment period for a new team.',d:[3,9,12],relation:'具體銷售導師例子說明縮短團隊適應期',formula:'A veteran [資深職位] who coaches new hires in [技能] can shorten the adjustment period for [團隊]',meaning:'資深銷售主管指導談判及處理客戶，幫整隊更快適應。',links:['A veteran ', ' who coaches new hires in ', ' can shorten the adjustment period for '],labels:['資深職位','指導技能','受益團隊']},
 {example:'Consequently, the firm gains not only one capable employee, but also a stronger and more flexible workforce.',d:[3,9,12],relation:'not only...but also 從個別招聘推到團隊能力提升',formula:'Consequently, the firm gains not only [個別人才], but also [團隊收益]',meaning:'公司得到的不只一名能幹員工，還有更強且更有韌性的團隊。',links:['Consequently, the firm gains not only ', ', but also '],labels:['個別收益','團隊收益']},
 {example:'There are, however, several disadvantages.',d:[3,6,14],relation:'however 轉向承認缺點',formula:'There are, however, [程度] disadvantages',meaning:'文章開始談薪酬與培訓兩項缺點。',links:['There are, however, ', ' disadvantages.'],labels:['程度']},
 {example:'One is that older recruits may command higher salaries and better benefits, which can place pressure on payroll budgets, especially in newer firms.',d:[3,9,14],relation:'which 推出高薪福利對小企薪酬預算壓力',formula:'One is that [人群] may command higher salaries and better benefits, which can place pressure on payroll budgets, especially in [較脆弱機構]',meaning:'年長新員工或需較高薪福利，小企預算尤其受壓。',links:['One is that ', ' may command higher salaries and better benefits, which can place pressure on payroll budgets, especially in '],labels:['人群','較脆弱機構']},
 {example:'If a start-up hires several highly experienced specialists at once, its wage bill may rise faster than its revenue.',d:[3,9,14],relation:'If 舉初創同時聘多位資深經理，支出可能快於收入',formula:'If a start-up hires [高薪人員], its wage bill may rise faster than its revenue',meaning:'初創聘多位資深經理或使薪酬增速超過營收。',links:['If a start-up hires ', ', its wage bill may rise faster than its revenue.'],labels:['高薪人員']},
 {example:'Another drawback is that, in companies undergoing rapid digital change, some older employees may initially require more support when adapting to new systems.',d:[3,9,14],relation:'以 may initially 限定短期數碼適應支援需求',formula:'Another drawback is that, in [變動機構], some [員工] may initially require more support when adapting to [新系統]',meaning:'數碼轉型企業中部分年長員工初期或需更多支援。',links:['Another drawback is that, in ', ', some older employees may initially require more support when adapting to '],labels:['變動機構','新系統']},
 {example:'For instance, a business that replaces paper-based systems with cloud software may need to provide extra training before sales return to normal.',d:[3,9,14],relation:'紙本轉雲端例子說明額外培訓與產出恢復',formula:'For instance, a business that replaces [舊系統] with [新系統] may need to provide extra training before [產出恢復]',meaning:'企業轉雲端可能需額外訓練，產出才恢復。',links:['For instance, a business that replaces ', ' with ', ' may need to provide extra training before '],labels:['舊系統','新系統','產出恢復']},
 {example:'Even so, these are managerial challenges rather than compelling reasons to reject qualified applicants.',d:[3,9,12],relation:'rather than 區分可管理挑戰與拒聘理由',formula:'Even so, these are managerial challenges rather than compelling reasons to [排除群體]',meaning:'成本及培訓是可管理問題，不足以概括拒聘年長者。',links:['Even so, these are managerial challenges rather than compelling reasons to '],labels:['不應據此作的排除']},
 {example:'In conclusion, employing more experienced people can increase expenditure and create short-term training demands, but the benefits for companies are clearly greater.',d:[3,9,12],relation:'結論 but 比較成本培訓與較重長期好處',formula:'In conclusion, employing more [群體] can increase [成本] and create [短期需求], but the benefits for companies are clearly greater',meaning:'作者承認成本及培訓，但認為企業好處更大。',links:['In conclusion, employing more ', ' can increase ', ' and create ', ', but the benefits for companies are clearly greater.'],labels:['群體','成本','短期需求']},
 {example:'Their experience, reliability and positive influence on younger staff usually generate greater long-term value, particularly in roles that depend on judgement and trust.',d:[3,9,12],relation:'列經驗可靠及指導，particularly 限定最有價值崗位',formula:'Their [三項特質] usually generate greater long-term value, particularly in roles that depend on [關鍵要求]',meaning:'經驗、可靠性與指導對需要判斷、信任及連續性的職位尤其有價值。',links:['Their ', ' usually generate greater long-term value, particularly in roles that depend on '],labels:['三項特質','職位要求']},
 {example:'For this reason, more companies should be willing to recruit experienced applicants.',d:[3,9,12],relation:'For this reason 回扣長期價值提出聘用建議',formula:'For this reason, more companies should be willing to recruit [人群]',meaning:'作者建議更多企業願意聘用年長員工。',links:['For this reason, more companies should be willing to recruit '],labels:['招聘人群']},
];
const usageGuides=[
 '當你要用 As 交代兩項社會變化，說明機構為何要重想人手安排時。',
 '當你要先承認聘用某群體的兩項實際挑戰時。',
 '當你要用 Nevertheless 在承認挑戰後，給出好處較重及理由時。',
 '當你要以主題句點出資深者最主要的判斷或經驗好處時。',
 '當你要用 Having dealt with 解釋長期經驗如何幫人及早發現風險時。',
 '當你要用一名具體職位的人，展示及早發現問題與預防損失時。',
 '當你要用 because 說明一名員工如何憑特質提升其他人的表現時。',
 '當你要用一個指導新人的具體例子，說明團隊適應速度如何改變時。',
 '當你要用 not only...but also 從個別人才收益推到整隊的收益時。',
 '當你要用 however 從主要好處轉到必須承認的代價時。',
 '當你要用 which 說明較高個人成本如何影響機構預算時。',
 '當你要用 If 設想同時聘用多名高薪人士，說明薪酬與收入增速的比較時。',
 '當你要用 may initially 將適應困難限定為部分人、初期的支援需要時。',
 '當你要以系統轉換的例子，說明額外訓練可如何幫產出恢復時。',
 '當你要用 rather than 區分可管理問題與足以全面排除某群體的理由時。',
 '當你要在結論承認成本，仍清楚判斷較長期的好處更大時。',
 '當你要列出三項特質，並用 particularly 指明它們最有價值的職位時。',
 '當你要用 For this reason 回指已分析的長期價值，提出實際建議時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把資深判斷、團隊指導與兩項管理代價分開排列。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文討論企業聘用哪類員工的利弊？',['更多年長、有長期經驗的員工。','只聘用剛完成實習的學生。','只讓供應商決定所有薪酬。','只討論辦公室的電腦顏色。'],'older employees 是中心。'),
 {type:'multi',prompt:'範文提出哪兩項主要企業好處？',detail:'選兩項，再按「確認」。',options:['資深判斷可及早發現風險','年長員工可指導新人，提升整隊表現','每名年長員工必然不用任何培訓','聘用後公司薪酬成本必然為零'],correct:[0,1],why:'判斷與導師作用是兩條不同好處。'},
];
const route=[sequence('還原聘用年長員工的權衡',[
 ['背景與立場','人口老化、工作年期延長；作者認為聘用年長者整體較有利。'],
 ['判斷經驗','多年接觸客戶與問題，可及早察覺供應商等風險。'],
 ['導師作用','專業紀律與溝通可指導新人，令整隊較快適應。'],
 ['兩項成本','較高薪福利可壓預算；數碼轉型初期或需額外培訓。'],
 ['結論','挑戰可管理，經驗與可靠性在某些崗位帶來長期價值。'],
 ],'不應把部分人初期需學新系統寫成年長員工普遍不能用科技。')];
const evidence=[
 quiz('資深採購經理的例子支持甚麼？',['較早察覺不可靠供應商，及時更換可避免生產延誤。','所有供應商都必然不可靠。','採購經理只負責辦公室裝修。','生產延誤與供應商完全無關。'],'例子有風險辨認、行動及後果。'),
 quiz('資深銷售主管如何提升整隊？',['指導新人談判與處理客戶，縮短團隊適應期。','只要多一名主管，新人便完全不用學習。','銷售經驗只影響主管自己的薪水。','所有新員工都必然已懂談判。'],'導師作用令收益超過個別員工。'),
 quiz('為何較高薪福利對初創公司尤其有壓力？',['同時聘多名資深經理，薪酬增速可能快過收入。','資深經理都必然不收薪。','初創公司通常有無限預算。','薪酬與營收完全沒有可比較性。'],'原文的 start-up 例子說明現金壓力。'),
 quiz('數碼轉型的缺點如何被限定？',['一些年長員工在新平台初期可能需要更多支援。','所有年長員工永遠不能使用任何電腦。','培訓只會令產出永久下降。','任何年齡的員工都不需學習新系統。'],'some、may、initially 三層限定。'),
 quiz('作者最後為何仍建議聘用年長者？',['經驗、可靠性及對新人影響可創造較大的長期價值。','因為較高薪酬完全不存在。','因為所有公司都沒有數碼轉型。','因為年齡本身保證任何工作表現。'],'承認代價後，依據實際職位價值權衡。'),
];
const logic=[
 sequence('從經驗到整隊效益',[
 ['長期接觸問題','資深員工較可能察覺早期風險。'],
 ['預防行動','供應商不可靠時及早改換，避免延誤。'],
 ['指導新人','把談判及客戶處理方法教給其他人。'],
 ['團隊收益','縮短適應期，提升全隊能力及韌性。'],
 ],'個人判斷與知識傳遞是不同好處。'),
 sequence('兩項成本與管理回應',[
 ['薪酬成本','高薪福利可能擠壓小企業預算。'],
 ['成長風險','初創薪酬支出增速或快於收入。'],
 ['數碼適應','部分員工初期或需新系統培訓。'],
 ['權衡','這些問題可管理，不能直接當作排除年長求職者的理由。'],
 ],'短期培訓需求與整體長期價值要分開比較。'),
];
const transfers=[
 transfer('一名資深採購員發現供應商交貨紀錄愈來愈不穩。','哪句對應範文的判斷力好處？',['他可及早察覺風險並更換供應商，減少往後的生產延誤。','只要資深，就能保證所有供應商永遠可靠。','供應商紀錄與生產時間完全無關。','察覺風險後必須等到延誤發生才處理。'],['辨認風險→預防行動→避免代價。','無此保證。','供應可影響生產。','應及早處理。'],[4,5],'原文採購經理及早換供應商防延誤。'),
 transfer('資深銷售員定期教新同事談判和處理客戶。','哪句指出超過個別員工的收益？',['新人可較快適應，整隊的處事能力也可能提高。','導師只能改善自己的銷售額。','只要有人指導，新同事便完全不用練習。','教導新人必然令整隊不能服務客戶。'],['導師作用可擴大到團隊。','忽略外溢效益。','仍需練習。','方向相反。'],[6,7,8],'原文 not only one employee but more competent workforce。'),
 transfer('一間初創同時聘請四名高薪資深經理，收入尚未增加。','哪句準確指出財務風險？',['薪酬開支可能先於營收快速上升，令公司預算承壓。','只要經理有經驗，薪酬便不會列入開支。','所有初創公司都必然有無限現金。','員工福利與公司支出完全無關。'],['支出增速可能超過收入。','薪酬仍是成本。','無此保證。','福利亦是成本。'],[10,11],'原文 start-up wage bill rise faster than revenue。'),
 transfer('企業由紙本轉用雲端平台，部分員工起初用得不熟。','哪句保持原文的限定？',['部分員工初期可能需要額外培訓，之後產出可逐漸恢復。','所有年長員工都永遠無法學會任何新系統。','短期培訓需要證明公司必須拒聘所有年長人。','更換系統之後完全不可能有學習期。'],['some/may/initially 保留範圍。','年齡刻板化。','問題可管理。','新系統常需適應。'],[12,13,14],'原文 some older employees may initially require more support。'),
 transfer('主管說「年長求職者可能要培訓，所以一概不聘」。','哪句指出推論問題？',['培訓是可管理的成本，應同時比較經驗與指導帶來的長期收益。','有培訓成本便證明任何資深經驗沒有價值。','公司聘用新人從來不需培訓。','年齡本身足以判定所有人的能力。'],['管理挑戰不足以構成全面排除。','忽略好處。','不一定。','需看能力與職位。'],[4,6,12,14],'原文 managerial challenges rather than compelling reasons to avoid。'),
 transfer('一個職位常需判斷供應商是否可信。','哪句依範文指出資深員工可能較有價值的條件？',['這類依賴判斷與信任的工作，可能特別受益於長期經驗。','任何職位都只應按年齡決定招聘。','供應商問題必然只靠電腦自動解決。','資深經驗與風險辨認完全沒有關係。'],['particularly in roles that depend on judgement and trust。','年齡不是唯一準則。','未必。','範文指出關聯。'],[4,16],'原文結論限定判斷信任連續性崗位。'),
 transfer('另一題討論聘用退休教師擔任新教師導師。','哪句真正跨題使用本文的機制？',['應比較資深教師的課堂判斷及指導作用，與薪酬和新系統培訓需求。','因為本文支持年長員工，所有退休教師必然適合所有學校。','只看年齡，不必了解教學能力。','有導師便不可能有任何培訓成本。'],['轉移判斷、帶人與成本兩面。','結論需按職位證據。','能力仍關鍵。','成本可並存。'],[4,6,10,12],'原文兩項收益和兩項管理成本可跨題評估。'),
 transfer('作文只寫「資深員工經驗多」，未說明如何幫公司。','哪句補足可檢驗機制？',['多年處理客戶與問題，或讓他們較早辨認風險並避免昂貴錯誤。','經驗多，因為他們有較多經驗。','只要工作年期長，任何錯誤都必然消失。','經驗只能用來決定員工制服顏色。'],['經驗→風險辨認→避免損失。','循環說法。','無此保證。','不相關。'],[3,4,5],'原文多年經驗促進早期風險辨認。'),
 transfer('一家公司有薪酬壓力，也有新人適應慢的問題。','哪句反映範文對取捨的看法？',['資深員工可能增加薪酬，卻也可能透過指導縮短整隊適應期。','既有薪酬壓力，就不能討論任何團隊收益。','只要有導師，所有薪酬成本便自動消失。','新人適應速度與任何資深員工都無關。'],['成本與團隊收益可同時存在。','忽略好處。','成本不會消失。','可能有關。'],[6,7,10],'原文導師收益與薪酬代價並存。'),
 transfer('結論需要回應「年長員工成本較高」的反方理由。','哪句最貼近原文？',['承認薪酬與短期培訓壓力，仍比較資深判斷、可靠性及指導的長期價值。','只說年齡越大，薪酬越低。','因為有成本，便完全否認經驗好處。','只列好處，不回應任何反方。'],['公平承認代價，再作長期權衡。','與原文相反。','未比較。','缺少回應。'],[15,16,17],'原文承認成本培訓，仍認為長期收益較大。'),
];
export default {key:'advantage-disadvantage:28',meta:{topic:'年長員工的判斷與指導價值',summary:'範文強調資深員工及早察覺風險並指導新人，使團隊受益；較高薪福利和數碼轉型初期培訓是可管理的挑戰，作者認為長期價值更大。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
