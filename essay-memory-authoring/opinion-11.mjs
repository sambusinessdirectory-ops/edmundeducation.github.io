// Model Essay 11 · Opinion: fair hiring, talent and the true cost of discrimination.
const simple=[
  "Hiring should depend on skills and what a business needs, not guesses about someone's family life.",
  'Yet some people say small firms should not hire young women who have not started families, so they will not have to pay for maternity leave later.',
  'This essay says that view is completely wrong because it judges people unfairly instead of by their skills and because it may cost firms more money in the long run.',
  'First, I fully disagree because refusing to hire women who might have children is unfair and stops firms from choosing the best applicants.',
  'When an employer leaves out qualified women for a reason that has nothing to do with work, there are fewer good people to choose from, so poor hiring choices become more likely.',
  'For example, a small design company might turn down a very good applicant and hire someone less skilled instead; this could lead to weaker ideas, less happy clients and lower income.',
  'This rule can also hurt the whole workplace.',
  'When workers see that a company hires based on unfair ideas rather than skills, they trust managers less and feel worse about their work.',
  "In a small business, where each worker's contribution is easy to see, this loss of trust can quickly make people work together less well and get less done.",
  'The second reason is that the money argument behind this idea is wrong.',
  'Maternity leave is a short and known cost, while hiring the wrong people and losing staff again and again can cost much more over time.',
  'If a company only considers a smaller group of applicants, it is more likely to spend money training unsuitable workers again, fixing errors and replacing workers who do not work well.',
  'By comparison, fair and supportive hiring often helps workers stay.',
  'Workers who feel respected are more likely to stay with the company and return that support through loyal, careful work.',
  'For example, a small shop may pay for a temporary worker for a short time while a parent is on leave, but it is more likely to keep a skilled employee for years.',
  'In short, I fully disagree that small businesses should avoid hiring young women to avoid maternity leave.',
  'This is unfair, wastes people\'s skills and misunderstands costs, so firms should hire for ability rather than guesses about whether applicants will have families.',
];
const vocabulary=[
  [['Employment decisions','Hiring','聘用決策'],['competence','skills','能力'],['business need','what a business needs','業務需要'],['assumptions','guesses','假設'],['an applicant’s private life',"someone's family life",'求職者私生活']],
  [['nevertheless','Yet','然而'],['argue','say','主張'],['should avoid hiring','should not hire','避免聘用'],['future expense','pay for maternity leave later','未來開支']],
  [['will argue','says','將論證'],['entirely wrong','completely wrong','完全錯誤'],['replaces merit with discrimination','judges people unfairly instead of by their skills','以歧視取代能力評估'],['financially short-sighted','may cost firms more money in the long run','財務上短視']],
  [['The first reason','First','第一個原因'],['recruitment based on possible motherhood','refusing to hire women who might have children','以可能成為母親作招聘依據'],['prevents businesses from selecting the strongest candidates','stops firms from choosing the best applicants','妨礙選出最優秀者']],
  [['excludes qualified women','leaves out qualified women','排除合資格女性'],['factor unrelated to job performance','reason that has nothing to do with work','與工作表現無關的因素'],['talent pool','good people to choose from','人才庫'],['poor hiring decisions','poor hiring choices','錯誤聘用決定']],
  [['design firm','design company','設計公司'],['reject an excellent applicant','turn down a very good applicant','拒絕優秀申請者'],['appoint a less capable worker','hire someone less skilled','聘用能力較弱的人'],['leading to','this could lead to','導致'],['lower client satisfaction','less happy clients','較低客戶滿意度'],['reduced revenue','lower income','收入減少']],
  [['This policy','This rule','這種政策'],['damage','hurt','傷害'],['workplace more broadly','whole workplace','整體工作環境']],
  [['employees realise','workers see','員工意識到'],['hiring is shaped by prejudice rather than ability','a company hires based on unfair ideas rather than skills','聘用由偏見而非能力決定'],['confidence in management declines','trust managers less','對管理層信心下降'],['morale suffers','feel worse about their work','士氣受損']],
  [['member of staff','worker','員工'],['visible impact','contribution is easy to see','明顯影響'],['undermine teamwork and productivity','make people work together less well and get less done','削弱合作與效率']],
  [['financial logic','money argument','財務邏輯'],['deeply flawed','wrong','有很大缺陷']],
  [['temporary and predictable cost','short and known cost','暫時可預見的成本'],['whereas','while','相反／而'],['bad recruitment','hiring the wrong people','錯誤招聘'],['repeated staff turnover','losing staff again and again','反覆人員流動'],['long-term expense','cost much more over time','長期開支']],
  [['restricted group','smaller group of applicants','受限制群體'],['retraining unsuitable employees','training unsuitable workers again','重新培訓不合適員工'],['correcting mistakes','fixing errors','修正錯誤'],['do not perform well','do not work well','表現不佳']],
  [['By contrast','By comparison','相比之下'],['employment practices','hiring','聘用做法'],['improve retention','helps workers stay','提高留任率']],
  [['remain with the company','stay with the company','留在公司'],['repay that support','return that support','回報支持'],['loyalty and conscientious work','loyal, careful work','忠誠及盡責工作']],
  [['For instance','For example','例如'],['small retailer','small shop','小型零售商'],['arranges temporary cover','pay for a temporary worker','安排臨時替補'],['parental leave','a parent is on leave','育兒假'],['may face a short-term cost','may pay for a temporary worker for a short time','短期成本'],['experienced employee','skilled employee','有經驗員工']],
  [['In conclusion','In short','總而言之'],['completely disagree','fully disagree','完全不同意'],['in order to avoid maternity leave','to avoid maternity leave','為避免產假']],
  [['This approach','This','這種做法'],['unjust','unfair','不公正'],['wastes talent',"wastes people's skills",'浪費人才'],['rests on a false understanding of cost','misunderstands costs','基於錯誤成本理解'],['recruitment','hire','招聘'],['merit','ability','能力'],['anticipated family choices','guesses about whether applicants will have families','預期家庭選擇']],
];
const chunkOverrides=[
  ['Employment decisions should be based on competence and business need','rather than assumptions about an applicant’s private life.'],
  ['Some people nevertheless argue that small businesses should avoid hiring young women','who have not yet started families','so that maternity leave will not become a future expense.'],
  ['This essay will argue that this view is entirely wrong','because it replaces merit with discrimination','and because it is financially short-sighted.'],
  ['The first reason I completely disagree','is that recruitment based on possible motherhood is unfair','and prevents businesses from selecting the strongest candidates.'],
  ['Once an employer excludes qualified women','for a factor unrelated to job performance,','the talent pool immediately becomes smaller,','which makes poor hiring decisions more likely.'],
  ['A small design firm, for example, might reject an excellent applicant','and appoint a less capable worker instead,','leading to weaker ideas, lower client satisfaction','and reduced revenue.'],
  ['This policy can also damage','the workplace more broadly.'],
  ['When employees realise that hiring is shaped by prejudice rather than ability,','confidence in management declines','and morale suffers.'],
  ['In a small business, where every member of staff has a visible impact,','this loss of trust can quickly undermine','teamwork and productivity.'],
  ['The second reason is that','the financial logic behind this argument is deeply flawed.'],
  ['Maternity leave is a temporary and predictable cost,','whereas bad recruitment and repeated staff turnover','create much more serious long-term expense.'],
  ['If a company hires from a restricted group,','it is more likely to spend money retraining unsuitable employees,','correcting mistakes and replacing people','who do not perform well.'],
  ['By contrast, fair and supportive employment practices','often improve retention.'],
  ['Workers who feel respected are more likely to remain with the company','and repay that support with loyalty and conscientious work.'],
  ['For instance, a small retailer that arranges temporary cover during parental leave','may face a short-term cost,','but it is far more likely to keep an experienced employee for years.'],
  ['In conclusion, I completely disagree','that small businesses should avoid hiring young women','in order to avoid maternity leave.'],
  ['This approach is unjust, wastes talent','and rests on a false understanding of cost,','so recruitment should always be based on merit','rather than anticipated family choices.'],
];
const simpleChunkOverrides=[
  ['Hiring should depend on skills and what a business needs,','not guesses about someone\'s family life.'],
  ['Yet some people say small firms should not hire young women','who have not started families,','so they will not have to pay for maternity leave later.'],
  ['This essay says that view is completely wrong','because it judges people unfairly instead of by their skills','and because it may cost firms more money in the long run.'],
  ['First, I fully disagree','because refusing to hire women who might have children is unfair','and stops firms from choosing the best applicants.'],
  ['When an employer leaves out qualified women','for a reason that has nothing to do with work,','there are fewer good people to choose from,','so poor hiring choices become more likely.'],
  ['For example, a small design company might turn down a very good applicant','and hire someone less skilled instead;','this could lead to weaker ideas, less happy clients','and lower income.'],
  ['This rule can also hurt','the whole workplace.'],
  ['When workers see that a company hires based on unfair ideas rather than skills,','they trust managers less','and feel worse about their work.'],
  ['In a small business, where each worker\'s contribution is easy to see,','this loss of trust can quickly make people','work together less well and get less done.'],
  ['The second reason is that','the money argument behind this idea is wrong.'],
  ['Maternity leave is a short and known cost,','while hiring the wrong people and losing staff again and again','can cost much more over time.'],
  ['If a company only considers a smaller group of applicants,','it is more likely to spend money training unsuitable workers again,','fixing errors and replacing workers','who do not work well.'],
  ['By comparison, fair and supportive hiring','often helps workers stay.'],
  ['Workers who feel respected are more likely to stay with the company','and return that support through loyal, careful work.'],
  ['For example, a small shop may pay for a temporary worker for a short time','while a parent is on leave,','but it is more likely to keep a skilled employee for years.'],
  ['In short, I fully disagree','that small businesses should avoid hiring young women','to avoid maternity leave.'],
  ["This is unfair, wastes people's skills",'and misunderstands costs,','so firms should hire for ability','rather than guesses about whether applicants will have families.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({
  example,answerReason,distractorReason,distractors,frame,
});
const structures=[
  S('Scholarship decisions should be based on academic need rather than guesses about a student’s background.','should be based on...rather than 對照應使用的證據與不應依賴的猜測。','這句提出決策標準，並排除無關推斷。',[4,10,15],
    F('[決策] should be based on [相關證據] rather than [無關推測]','指出應以甚麼資料作決策，並用 rather than 排除不相干的假設。','要在論證開端訂明公平而相關的判斷標準時。',[['Employment decisions ','slot','決策'],['should be based on','link','提出正確依據'],[' competence and business need ','slot','相關證據'],['rather than','link','排除錯誤依據'],[' assumptions about an applicant’s private life.','slot','無關推測']])),
  S('Some people nevertheless argue that schools should reject older books so that pupils will not face difficult language.','nevertheless 轉述與前文原則相反的看法，so that 指出支持者想避免的結果。','這句只呈現他人主張及目的，尚未表示作者同意。',[0,2,10],
    F('Some people nevertheless argue that [有爭議做法] so that [希望避免的後果]','nevertheless 表示此主張與剛提出的標準有張力；so that 交代主張者認為的目的。','引言先提出一般原則，接着要公平轉述題目中相反主張及其理由時。',[['Some people nevertheless argue that','link','轉述相反主張'],[' small businesses should avoid hiring young women who have not yet started families ','slot','有爭議做法'],['so that','link','指出主張目的'],[' maternity leave will not become a future expense.','slot','希望避免的後果']])),
  S('This essay will argue that this plan is wrong because it ignores the best students and because it wastes school resources.','兩個 because 分別預告公平選拔與資源使用兩項理由。','這句先表明判斷，再用兩個 because 引出不同主線。',[1,3,9],
    F('This essay will argue that [作者判斷] because [第一項理由] and because [第二項理由]','先明確下判斷，再以兩個 because 預告可分段展開的不同理由。','引言有清晰立場，且正文會用兩項獨立理由支持時。',[['This essay will argue that','link','表明將論證的判斷'],[' this view is entirely wrong ','slot','作者判斷'],['because','link','第一項理由'],[' it replaces merit with discrimination ','slot','第一項理由'],['and because','link','第二項理由'],[' it is financially short-sighted.','slot','第二項理由']])),
  S('The first reason I completely disagree is that this rule is unfair and prevents the school from choosing its strongest students.','is that 指出首項反對理由，and 連接不公平與選拔受損兩個效果。','這句把價值判斷及實際後果一同放入首項理由。',[2,4,10],
    F('The first reason I completely disagree is that [做法] is unfair and prevents [機構] from selecting [最佳人選]','先說做法不公平，再指出它也妨礙選出最合適的人。','開始首段論證時，要同時交代一項做法的公平性與實際效果。',[['The first reason I completely disagree is that','link','引出首項反對理由'],[' recruitment based on possible motherhood ','slot','做法'],['is unfair and prevents','link','連接不公平與選拔損失'],[' businesses ','slot','機構'],['from selecting','link','指出選拔受阻'],[' the strongest candidates.','slot','最佳人選']])),
  S('Once a school excludes qualified pupils for an unrelated detail, its options become fewer, which makes poor decisions more likely.','Once 設定無關排除，which 指回選擇變少帶來的決策風險。','這句把不公平排除連到人才庫縮小，再連到較差決策。',[3,5,11],
    F('Once [機構排除合資格者] for [無關因素], [可選人群] becomes smaller, which makes [錯誤決策] more likely','先說無關因素使合資格者被排除，再說選擇範圍變窄如何提高錯誤決策風險。','要解釋帶有偏見的決策如何同時傷害個人及整體成果時。',[['Once','link','設定排除條件'],[' an employer excludes qualified women ','slot','機構排除合資格者'],['for','link','指出理由'],[' a factor unrelated to job performance','slot','無關因素'],[',','link','接範圍變化'],[' the talent pool ','slot','可選人群'],['immediately becomes smaller, which makes','link','連到錯誤風險'],[' poor hiring decisions ','slot','錯誤決策'],['more likely.','link','可能性提高']])),
  S('A local school, for example, might reject a strong teacher and appoint a weaker one instead, leading to poorer lessons and lower pupil confidence.','might 審慎提出可能例子，leading to 列出錯選後果。','這句以具體人選比較展示排除優秀者的實際代價。',[4,7,14],
    F('[具體機構], for example, might reject [優秀人選] and appoint [較弱人選] instead, leading to [多項實際損失]','例子先說不合理選人，再列其在工作品質及使用者滿意上的後果。','提出抽象的錯誤決策後，要說明它會造成甚麼具體損失時。',[['A small design firm','slot','具體機構'],[', for example, might reject','link','引出可能錯選'],[' an excellent applicant ','slot','優秀人選'],['and appoint','link','對照任用'],[' a less capable worker ','slot','較弱人選'],['instead, leading to','link','指出後果'],[' weaker ideas, lower client satisfaction and reduced revenue.','slot','多項實際損失']])),
  S('This rule can also damage the whole school.','also 從個別選人損失擴展到整個工作環境。','這句用 can 審慎提出較廣影響，下一句須解釋機制。',[3,8,12],
    F('[做法] can also damage [較廣的組織環境]','also 把影響由個別決策擴到整個組織；can 不表示每次必然發生。','已說明一次決策的後果，要轉入群體信任與士氣時。',[['This policy ','slot','做法'],['can also damage','link','提出較廣影響'],[' the workplace more broadly.','slot','較廣的組織環境']])),
  S('When teachers realise that promotions follow favouritism rather than skill, trust in leaders declines and morale suffers.','When 設定員工看見偏見的情況，後面列信任與士氣兩項影響。','這句把不公平做法與整個團隊的感受連起來。',[4,6,10],
    F('When [員工意識到偏見取代能力], [對管理者的信心] declines and [士氣] suffers','員工如何理解選拔標準，會影響其對管理者的信任及工作士氣。','要追蹤一項不公平決策如何由個別當事人擴散至整個群體時。',[['When','link','設定員工認知'],[' employees realise that hiring is shaped by prejudice rather than ability','slot','員工意識到偏見取代能力'],[',','link','接團隊反應'],[' confidence in management ','slot','對管理者的信心'],['declines and','link','並列士氣影響'],[' morale ','slot','士氣'],['suffers.','link','受到損害']])),
  S('In a small clinic, where each worker affects patients directly, this loss of trust can quickly weaken teamwork and service quality.','where 補充小組織每人的影響可見，解釋失去信任為何迅速影響合作。','這句把環境特點與後果速度連起來。',[4,7,11],
    F('In [小型機構], where [每人影響清楚可見], [失去信任] can quickly undermine [合作與表現]','先說小型組織的人員影響較顯眼，再說信任流失可能迅速傷害合作及成果。','要解釋為何同一種問題在較小群體中更容易擴散時。',[['In','link','設定機構環境'],[' a small business','slot','小型機構'],[', where','link','補充環境特點'],[' every member of staff has a visible impact','slot','每人影響清楚可見'],[',','link','接上後果'],[' this loss of trust ','slot','失去信任'],['can quickly undermine','link','指出可能迅速損害'],[' teamwork and productivity.','slot','合作與表現']])),
  S('The second reason is that the money argument behind this policy is deeply flawed.','第二主體段轉向財務論證，指出對方的成本比較有缺陷。','這句明確引入第二項不同理由，不重複公平論證。',[2,6,12],
    F('The second reason is that [對方論證的某部分] is deeply flawed','在第一理由後另指出對方推理哪一部分有問題，後文須提供具體比較。','第二段要從公平或選拔問題轉向成本、風險等另一項理由時。',[['The second reason is that','link','引出第二理由'],[' the financial logic behind this argument ','slot','對方論證的某部分'],['is deeply flawed.','link','指出推理缺陷']])),
  S('A planned training course is a temporary and predictable cost, whereas repeated mistakes and staff turnover create a much larger long-term expense.','whereas 對照可計畫的短成本與反覆出現的長成本。','這句糾正只看眼前開支的狹窄比較。',[3,9,14],
    F('[可預見的短成本] is a temporary and predictable cost, whereas [錯誤選擇與反覆流失] create [較大長成本]','先承認短期開支存在，再對照錯誤選擇及人員流失可能造成更大長期開支。','要回應一項只計眼前成本、忽略長遠代價的主張時。',[['Maternity leave ','slot','可預見的短成本'],['is a temporary and predictable cost, whereas','link','對照長短成本'],[' bad recruitment and repeated staff turnover ','slot','錯誤選擇與反覆流失'],['create','link','造成'],[' much more serious long-term expense.','slot','較大長成本']])),
  S('If a club selects from too few volunteers, it is more likely to spend time retraining unsuitable people and fixing errors.','If 設定範圍被縮小，more likely to 審慎指出額外訓練及修錯的支出。','這句把抽象長期成本拆成可觀察的工作。',[4,10,14],
    F('If [機構只從受限人群選人], it is more likely to spend [資源] [重訓、修錯與替換]','先說選擇範圍縮小，再說為何可能增加重訓、修錯與替換的成本。','要具體解釋選擇範圍受限如何轉化為可見開支時。',[['If','link','設定受限選拔'],[' a company hires from a restricted group','slot','機構只從受限人群選人'],[', it is more likely to spend','link','較可能支出'],[' money ','slot','資源'],['retraining unsuitable employees, correcting mistakes and replacing people who do not perform well.','slot','重訓、修錯與替換']])),
  S('By contrast, fair and supportive school policies often help good teachers stay.','By contrast 從不公平做法轉向支持性的替代做法及留任結果。','這句提出可對照的正面做法，而非只批評前一做法。',[6,10,13],
    F('By contrast, [公平而支持性的做法] often improve [留任結果]','轉向另一種做法，指出其較可能帶來的正面留任效果；often 不是保證。','指出一種限制的代價後，要提出較合理的替代原則時。',[['By contrast,','link','轉入替代做法'],[' fair and supportive employment practices ','slot','公平而支持性的做法'],['often improve','link','指出常見效果'],[' retention.','slot','留任結果']])),
  S('Workers who feel respected are more likely to remain with a school and repay that support with loyal, careful teaching.','who 限定感到被尊重的員工；more likely to 審慎連到留任與盡責工作。','這句解釋支持性做法如何通過員工感受影響留任。',[7,11,14],
    F('[感到被尊重的員工] are more likely to remain with [機構] and repay that support with [忠誠及盡責行動]','被尊重的感受與較可能留任相連，後半句補充員工可能如何回報支持。','提出一項較好的長期結果後，還要說明人為何願意作出該選擇時。',[['Workers who feel respected ','slot','感到被尊重的員工'],['are more likely to remain with','link','較可能留任'],[' the company ','slot','機構'],['and repay that support with','link','指出回報方式'],[' loyalty and conscientious work.','slot','忠誠及盡責行動']])),
  S('For instance, a small school that hires temporary cover during leave may face a short-term cost, but it is far more likely to keep a skilled teacher for years.','but 對照臨時支出與留住有經驗者的長期收益。','這句以具體例子說明短成本與長期留任可同時成立。',[10,12,15],
    F('For instance, [小型機構作出臨時安排] may face [短期成本], but it is far more likely to keep [有經驗者] for years','先承認有短期支出，再說明這安排可能保留有經驗員工多年；兩邊都要計入成本比較。','要在同一例子中比較短期投入與長期成果時。',[['For instance,','link','引出具體例子'],[' a small retailer that arranges temporary cover during parental leave ','slot','小型機構作出臨時安排'],['may face','link','承認短期支出'],[' a short-term cost','slot','短期成本'],[', but it is far more likely to keep','link','轉向留任收益'],[' an experienced employee ','slot','有經驗者'],['for years.','link','標示長期']])),
  S('In conclusion, I completely disagree that schools should avoid hiring experienced teachers to avoid short absences.','結論重申反對以預測中的缺席排除合資格人選。','這句收束已提出的公平與成本理由。',[1,2,16],
    F('In conclusion, I completely disagree that [機構] should avoid hiring [人群] in order to avoid [預期成本]','重申反對以可能出現的成本作為排除人選的理由；不加新論點。','兩段理由已論證完，要直接回應題目的聘用主張時。',[['In conclusion, I completely disagree that','link','收束並重申反對'],[' small businesses ','slot','機構'],['should avoid hiring','link','指出被反對的做法'],[' young women ','slot','人群'],['in order to avoid','link','指出所欲避免'],[' maternity leave.','slot','預期成本']])),
  S('This policy is unfair, wastes strong applicants and misunderstands costs, so selection should be based on skills rather than guesses about family plans.','so 把不公、人才浪費及成本誤判收束成應採用的選拔原則。','這句在結尾把三項問題與更公平的判準連起來。',[0,10,15],
    F('[錯誤做法] is unjust, wastes [人才] and rests on [錯誤成本理解], so [選拔] should be based on [能力] rather than [私人生活猜測]','先概括做法的不公、人才損失和成本誤判，再用 so 推到可執行的正確選拔標準。','結論要從批評某個做法，回到可實際採用的正面原則時。',[['This approach ','slot','錯誤做法'],['is unjust, wastes','link','指出不公與浪費'],[' talent ','slot','人才'],['and rests on','link','指出錯誤依據'],[' a false understanding of cost','slot','錯誤成本理解'],[', so','link','推出改正原則'],[' recruitment ','slot','選拔'],['should always be based on','link','指出正確依據'],[' merit ','slot','能力'],['rather than','link','排除錯誤依據'],[' anticipated family choices.','slot','私人生活猜測']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({
  type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',
  items:rows.map(([title,body])=>({title,body})),why,
});
const intro=[
  Q('作者是否贊成小企業為避免產假成本而不聘用年輕女性？',[
    '完全反對：應按能力聘人；這種排除既不公平，也可能造成更大長期成本',
    '完全贊成：未來家庭選擇比工作能力更適合用作招聘依據',
    '部分贊成：只要職位涉及設計，便應排除所有年輕女性',
    '沒有立場：文章只列出企業人數',
  ],'引言說 entirely wrong；結論說 completely disagree；兩段分別談公平與人才、短期和長期成本。'),
  {type:'multi',prompt:'選出作者的兩條主要反對理由',detail:'選兩項，再按「確認」。',options:[
    '按可能成為母親的猜測排除合資格者，縮小人才選擇並傷害團隊信任',
    '產假屬暫時可預見成本；錯選、重訓與員工反覆離開可能更昂貴',
    '每名員工必定在同一時間請假，因此企業永遠無法營運',
    '顧客只關心招聘廣告的顏色，不會在意服務品質',
  ],correct:[0,1],why:'第一主體段從公平推到選人與士氣；第二主體段比較可計畫的短成本與錯誤聘用的長成本。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 原則與立場','聘用應看能力和業務需要；完全反對以預測產假成本排除年輕女性。'],
  ['主體段一 · 公平與人才','排除合資格者令人才庫變小、錯選風險增加，偏見也削弱信任及合作。'],
  ['主體段二 · 真正成本','產假是暫時成本；選錯人、重訓及反覆流失可能更貴，支持員工可提高留任。'],
  ['結論 · 招聘標準','重申完全反對，以能力而非對家庭選擇的猜測作招聘依據。'],
],'無關猜測排除人選 → 人才與信任受損 → 長期成本更高 → 應以能力聘人。')];
const evidence=[
  Q('以未來可能成為母親作為排除條件，為何會傷害企業選人？',[
    '合資格人選被排除，人才庫變小，較差的聘用決定更容易出現',
    '排除更多人便必然找到最優秀的員工',
    '求職者的家庭計畫必然準確預示其工作能力',
    '企業只要招聘人數減少，就不再需要評估能力',
  ],'原文由 excludes qualified women 推到 talent pool smaller，再到 poor hiring decisions more likely。'),
  Q('小型設計公司的例子具體展示甚麼損失？',[
    '錯過優秀申請者，改聘較弱人選，可能令創意、客戶滿意及收入下降',
    '拒絕優秀人選必定使每名顧客立即增加消費',
    '只要員工較弱，作品品質就與收入完全無關',
    '設計公司的聘用決定不會影響任何客戶',
  ],'例子具名比較兩位人選，再以 leading to 列出三項企業後果。'),
  Q('員工發現招聘受偏見而非能力影響，原文預期甚麼？',[
    '對管理層的信心下降，士氣受損，並可能影響小團隊合作',
    '員工必然因此更信任管理層',
    '所有員工會立即離職，沒有任何其他可能',
    '招聘依據與員工對管理層的看法完全無關',
  ],'When... 後列 confidence declines 和 morale suffers；小企業下一句再說團隊合作與效率。'),
  Q('作者如何比較產假與錯誤聘用的成本？',[
    '產假是暫時、可預見的；錯選與人員反覆流動可能造成較大的長期開支',
    '產假與錯選人都不會帶來任何成本',
    '只要不聘年輕女性，其他聘用決定便保證正確',
    '產假必定比多年重訓與更替的全部支出更高',
  ],'whereas 對照兩種成本的性質與時間範圍，不是單看眼前現金支出。'),
  Q('只從受限制人群選人，可能引致哪三種額外開支？',[
    '重新培訓不合適者、修正錯誤、替換表現不佳員工',
    '只增加辦公室的窗戶數目',
    '保證所有員工能力完全相同，毋須培訓',
    '使錯誤自動消失，企業不需再負擔成本',
  ],'原文把長期成本具體拆為 retraining、correcting mistakes、replacing people。'),
  Q('臨時替補例子為何支持公平而具支持性的聘用？',[
    '即使有短期替補成本，也可能保留一名有經驗的員工多年',
    '臨時替補一出現，原有員工便必然離職',
    '留住有經驗者與企業的長期成本完全無關',
    '只要有育兒假，企業永遠無法安排任何替補',
  ],'but 對照短成本與更可能留住經驗員工的長期利益。'),
];
const logic=[
  sequence('第一主體段：偏見如何同時傷害人選與團隊？',[
    ['首項理由','以可能成為母親決定招聘既不公平，也妨礙選出最強人選。'],
    ['人才庫縮小','排除與工作表現無關的合資格者，選擇變少。'],
    ['錯選例子','設計公司可能錯過優秀申請者，改聘較弱者。'],
    ['直接後果','作品創意、客戶滿意和收入可能下降。'],
    ['員工觀感','員工發現偏見凌駕能力，對管理層失去信心。'],
    ['團隊後果','小團隊的合作與效率可能迅速受損。'],
  ],'無關條件排除 → 選擇變少 → 錯選風險 → 信任、合作與工作成果受損。'),
  sequence('第二主體段：只避免眼前成本，為何反而可能更貴？',[
    ['第二理由','以產假成本作排除依據的財務推理有缺陷。'],
    ['短成本','產假屬暫時而可預見的開支。'],
    ['長成本','選錯人和員工反覆離開，可能需要重訓、修錯與更替。'],
    ['替代做法','公平、支持性的做法有助員工留任。'],
    ['員工回應','感到被尊重者較可能留任並盡責工作。'],
    ['零售例子','臨時替補需花錢，但可能保留有經驗者多年。'],
  ],'短期可計畫成本 ↔ 長期錯選與流失成本；支持員工可改善留任。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transfer=[
  T('小餐館只面試住在附近的求職者，卻沒有證據顯示遠處居民不能準時上班。','哪項最能轉用範文的選人原則？',[
    '以職位所需能力和實際出勤資料評估人選，不用未證實的住址猜測',
    '只靠住址推斷工作能力，毋須面試合資格者',
    '因有人住得遠便認定其專業能力必然較低',
    '只比較應徵者衣服顏色，不評估工作需要',
  ],[
    '這把「相關能力」與「無關假設」分開，保留原文原則。',
    '住址猜測不能代替工作相關證據。',
    '路程與專業能力不是同一回事。',
    '衣服顏色同樣不是職位能力依據。',
  ],[0,3,4,16],'範文主張招聘按 competence and business need，而非對私人生活的假設。'),
  T('學校先排除所有轉職者，然後抱怨合適教師太少。','哪項最能運用「人才庫縮小」？',[
    '檢查被排除者的教學能力；無關條件可能令學校錯過優秀人選',
    '排除人數越多，就保證選擇範圍越大',
    '只看求職者上一份工作名稱，便知道教學效果',
    '既然合適人選少，就再增加無關排除條件',
  ],[
    '這保留無關篩選、合資格人選減少與錯選風險的因果鏈。',
    '排除更多人會縮小而非擴大可選範圍。',
    '職銜不能代替教學能力評估。',
    '更多無關條件會加重原問題。',
  ],[3,4,5],'原文說排除合資格者令 talent pool 變小，錯誤聘用較可能出現。'),
  T('一間設計工作室因對求職者家庭安排的猜測，錯過作品集最強的人。','哪項最能轉用範文的具體例子？',[
    '比較被拒者與實際聘用者的設計能力，再追蹤作品、客戶與收入後果',
    '只因被聘者比較方便，便認定作品必定更好',
    '作品集最強者被拒，便保證企業每年虧損同一金額',
    '只看工作室招牌，不問聘用人選如何影響成果',
  ],[
    '這從錯過優秀人選走到可觀察的品質、滿意和收入結果。',
    '便利不能直接證明設計能力更高。',
    '原文說可能後果，沒有保證固定虧損。',
    '招牌無法代替人選與成果的比較。',
  ],[4,5],'範文的小設計公司例子把錯選連到創意較弱、客戶滿意下降和收入減少。'),
  T('公司員工發現升職取決於經理的私人偏好，而非工作表現。','哪項最能轉用團隊信任的分析？',[
    '說明員工對管理層的信任可能下降，進一步影響士氣與合作',
    '因經理有偏好便保證全體員工士氣上升',
    '只看升職公告字體，不研究員工反應',
    '認為個別升職決定絕不影響團隊觀感',
  ],[
    '這保留「偏見凌駕能力 → 信心下降 → 士氣與合作受損」。',
    '不公正感通常不能直接支持士氣上升的斷言。',
    '字體與管理信任不同。',
    '原文正分析招聘依據的廣泛組織影響。',
  ],[6,7,8],'範文說員工察覺 prejudice rather than ability，對管理層信心下降，士氣與團隊合作受影響。'),
  T('小診所擔心員工短期請假要安排替補，因此想用無關條件縮小招聘範圍。','哪項最能回應其成本理由？',[
    '比較可計畫的臨時替補費與錯選、重訓及反覆流失的長期費用',
    '只看一週替補費，便認定排除人選永遠最省錢',
    '因為要安排替補，便認為能力評估可完全取消',
    '只比較診所牆色，不計算任何人事開支',
  ],[
    '這保留短期可預見成本與更大長期成本的比較。',
    '只看一週不能代表多年支出。',
    '替補安排不會使能力不重要。',
    '牆色不是人事成本資料。',
  ],[9,10,11,14],'範文以短期產假成本對照錯誤聘用與人員流動造成的長期開支。'),
  T('一間零售店因篩選過窄，聘入不適合者，半年內多次重訓和更替。','哪項最能轉用範文列出的具體成本？',[
    '把重訓時間、修錯支出與替換員工的成本分開記錄',
    '只算第一次面試的車費，其他支出一概忽略',
    '因店舖仍有員工便斷定沒有任何更替費用',
    '只看每月廣告次數，便當作已算出人事成本',
  ],[
    '這直接對應 retraining、correcting mistakes、replacing people 三項。',
    '面試車費不能涵蓋反覆人員開支。',
    '有人在職不等於沒有重訓或更替。',
    '廣告次數不能代替實際成本。',
  ],[10,11],'原文把受限招聘帶來的財務風險拆成重訓、修錯及替換表現不佳者。'),
  T('公司為照顧者提供可預先安排的短期假期，主管擔心這一定是浪費。','哪項最貼近範文的留任分析？',[
    '計算短期替補費，也追蹤支持性安排能否留住有經驗員工',
    '只因有短期費用便認定員工多年經驗毫無價值',
    '保證每位員工都會因此永遠留任，毋須觀察',
    '只看假期名稱，不比較實際短期與長期成本',
  ],[
    '這把可計畫支出與可能的長期留任效益放在一起。',
    '短期支出不能單獨否定經驗與留任價值。',
    '原文說較可能留任，沒有保證每個人。',
    '名稱不能代替成本和人員結果。',
  ],[10,12,13,14],'範文的小零售商例子承認短期替補成本，同時指出較可能留住有經驗者多年。'),
  T('一間志願機構公開按能力選人，並向所有成員解釋選拔準則。','哪項最能轉用範文的正面替代做法？',[
    '觀察公平準則是否令成員更信任管理者，並願意持續參與',
    '只要準則公開，就保證每位志願者永遠不離開',
    '認為選拔透明便不必再看工作能力',
    '只統計公告字數，便推斷團隊士氣',
  ],[
    '這把公平、信任與留任連起來，同時保留需觀察的可能性。',
    '公平做法可改善留任，並非保證。',
    '公平和能力都在原文的正確準則中。',
    '字數不能直接代表信任。',
  ],[7,8,12,13],'範文對照偏見與公平做法，指出被尊重的員工較可能留任並盡責。'),
  T('僱主認為只要避開所有可能請假的人，便一定能減少成本。','哪項反駁最完整？',[
    '請假只是可計畫成本之一；排除合資格者也可能令選人變差、重訓與流失增加',
    '請假永遠不需安排，因此毋須比較成本',
    '只要縮小人選，選到最合適員工的機會必然上升',
    '以求職者私人資料代替工作能力，可保證沒有失誤',
  ],[
    '這同時保留人才選擇與長期成本兩條主線。',
    '原文承認短期安排有成本。',
    '人才庫縮小可能增加錯選風險。',
    '私人生活猜測與工作表現無必然關係。',
  ],[0,3,4,10,11,16],'範文指出短成本可預見，無關排除反而可能造成較差聘用及長期開支。'),
  T('公司把「未婚者可能離職」當作拒聘理由，卻沒有考察申請者的技能。','哪項最符合範文結論的原則？',[
    '按工作能力與業務需要評估申請者，而非推測其未來私人選擇',
    '只要對私人生活有猜測，便無須測試能力',
    '未婚身分能準確預測每人的多年表現',
    '只比較申請表封面，便決定誰最合適',
  ],[
    '這把原文的 merit 標準轉用到另一種與職位無關的推測。',
    '猜測不能代替相關能力。',
    '個人身分不保證將來行為或工作表現。',
    '封面不是職位能力。',
  ],[0,2,3,16],'範文開首與結論都主張以能力和業務需要聘人，不以預期家庭選擇作判斷。'),
  T('小學為教師提供短期替補安排，留住一位熟悉學生多年的老師。','哪項最能解釋這項安排的長期價值？',[
    '短期支出換來熟悉學生的教師繼續任教，可減少重新招聘與磨合',
    '臨時替補花錢，所以留任有經驗教師必定毫無價值',
    '只要教師曾請假，便不再具備教學能力',
    '只看替補老師姓名，不問原教師是否留任',
  ],[
    '這將可計畫短成本與保留經驗的長期效益連起來。',
    '短成本與長期效益須一起比較。',
    '請假不等於能力消失。',
    '姓名不能代替留任與重聘資料。',
  ],[10,12,13,14],'範文以臨時替補的短成本，對照保留有經驗員工多年的可能收益。'),
  T('管理層想改善小團隊效率，卻仍以與工作無關的身分猜測作聘用。','哪項最能結合範文兩段？',[
    '移除無關篩選，以能力選人，並比較人才、信任與長期人事成本的變化',
    '只要求員工更快工作，不改選人準則',
    '只看眼前替補費，不計錯選與流失',
    '宣布公平口號，仍繼續排除合資格者',
  ],[
    '這同時處理人才及團隊信任與長期財務兩條原因。',
    '效率問題可能來自錯選與信任受損，不能只催促。',
    '只計短成本會漏掉原文第二段。',
    '口號若與實際選拔相反，不能改善人才庫。',
  ],[0,4,7,8,10,11,16],'範文先分析不公平篩選如何傷害人才與合作，再指出錯選和流失的長期成本。'),
];
const reviewedTransferOptions=[
  ['按工作能力與出勤資料選人，不憑未證實的住址猜測','只靠住址推斷能力，毋須面試合資格的申請者','因住得較遠，便斷定其專業能力一定比較低下','只比較應徵者衣服顏色，不評估職位真正需要'],
  ['檢查被排除者能力，避免無關條件縮小人才庫','排除人數愈多，便保證合適人選範圍愈大','只看上一份工作名稱，便推論教學效果如何','合適人選較少，便再加入更多無關篩選條件'],
  ['比較被拒與受聘者能力，再追蹤作品及收入後果','只因受聘者較方便，便認定其設計作品必定更好','最強作品集被拒，便保證企業每年虧損固定金額','只看工作室招牌，不問聘用決定如何影響成果'],
  ['分析管理層失去信任後，員工士氣與合作如何受影響','經理有偏好，便保證全體員工的士氣因此上升','只看升職公告字體，不調查員工對決定的反應','認為一項升職決定絕不會影響整個團隊的觀感'],
  ['比較短期替補費與錯選、重訓及流失的長期費用','只看一週替補費，便認定排除人選永遠最省錢','因需要安排替補，便完全取消對工作能力的評估','只比較診所牆色，不計算實際人事相關開支'],
  ['分開記錄重訓、修錯及更換員工的實際成本','只算初次面試的車費，其他支出一概忽略','店舖仍有員工，便斷定從未產生更替費用','只看廣告次數，便當作算出全部人事成本'],
  ['計算替補費，也追蹤支持安排能否留住資深員工','有短期費用，便認定多年經驗完全沒有價值','保證每位員工都會永遠留任，無須再作觀察','只看假期名稱，不比較短期與長期實際成本'],
  ['觀察公平準則能否增加信任與持續參與','準則一旦公開，便保證志願者永遠不會離開','選拔透明，便認為不必再評估實際工作能力','只統計公告字數，便推斷整個團隊士氣'],
  ['比較請假成本，也計算錯選、重訓與流失的風險','請假永遠不用安排，因此根本毋須比較任何成本','縮小人選範圍，便保證聘得最合適員工的機會上升','以私人資料代替能力評估，便保證選人沒有失誤'],
  ['按能力與業務需要選人，不猜測未來私人選擇','對私人生活有猜測，便不再需要測試工作能力','未婚身分能準確預測每個人多年的工作表現','只比較申請表封面，便決定誰最適合職位'],
  ['短期支出可留住資深教師，減少重新招聘與磨合','臨時替補要花錢，所以留任有經驗教師沒有價值','教師曾經請假，便斷定他不再具備教學能力','只看替補老師姓名，不查原教師能否繼續留任'],
  ['移除無關篩選，並衡量人才、信任及長期成本','只要求員工更快工作，不改原有的選人準則','只看眼前替補費，不計將來錯選與人員流失','口頭宣示公平，仍然繼續排除合資格申請者'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
structures[3].example='The first reason I completely disagree is that this rule is unfair and prevents the school from selecting its strongest students.';
structures[4].example='Once a school excludes qualified pupils for an unrelated detail, the talent pool immediately becomes smaller, which makes poor decisions more likely.';
structures[8].example='In a small clinic, where each worker affects patients directly, this loss of trust can quickly undermine teamwork and service quality.';
structures[12].example='By contrast, fair and supportive school policies often improve teacher retention.';
structures[15].example='In conclusion, I completely disagree that schools should avoid hiring experienced teachers in order to avoid short absences.';
structures[16].example='This policy is unjust, wastes strong applicants and rests on a false understanding of cost, so recruitment should always be based on skills rather than guesses about family plans.';
export default {
  key:'opinion:11',
  meta:{topic:'公平招聘與真正的人事成本',summary:'作者完全反對以預測產假成本排除年輕女性：此舉縮小合資格人才庫、削弱團隊信任，亦忽略錯選與流失的長期成本。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
