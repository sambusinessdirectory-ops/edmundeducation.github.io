// Model Essay 15 · Opinion: public speaking makes ability visible and supports cooperation.
const simple=[
  'Speaking clearly and convincingly to a group is often seen as important for success.',
  'I fully agree that speaking well to a group is needed, because success depends not only on what people know but also on how well they explain, support and share it.',
  'First, good speaking helps other people notice your ideas.',
  'At work, many skilled workers are not noticed, not because their work does not matter, but because they cannot explain it clearly to coworkers, customers or bosses.',
  'On the other hand, someone who explains a point clearly and in an interesting way is more likely to gain trust, move up at work and lead others.',
  'For example, an engineer may make a very good product, but if she cannot tell people who might fund or buy it why it helps, the idea may go no further than a meeting.',
  'In this way, speaking to a group helps turn a person’s own skill into an effect on others, and this matters for success at work.',
  'Also, speaking well to a group is needed because people often need to work together to succeed.',
  'Leaders, teachers, business owners and people who organise local activities all need to encourage others, work out agreements, make people feel calm and make them want to act.',
  'When people speak confidently and with care for others, they can avoid confusion and help everyone agree on a shared plan.',
  'During a difficult time, a manager who gives clear directions and encourages a team will do better than one who knows a lot about the work but explains things badly.',
  'In the same way, students who ask questions, explain their views and join discussions become more confident, and this can give them chances later in school and at work.',
  'So good speaking does more than make someone’s skills look good; it helps people put those skills to use.',
  'In short, I fully agree that speaking well to a group is needed to succeed.',
  'It helps people show what they can do clearly, convince others and build the connections that often help people achieve things.',
];
const vocabulary=[
  [['ability to speak persuasively in public','Speaking clearly and convincingly to a group','在公共場合具說服力地表達'],['regarded','seen','被視為'],['key ingredient of success','important for success','成功的關鍵要素']],
  [['completely agree','fully agree','完全同意'],['oratory skills','speaking well to a group','演說能力'],['essential','needed','必不可少'],['rarely depends only on','depends not only on','很少只取決於'],['how convincingly they can express, defend, and share','how well they explain, support and share','說服地表達、捍衛及分享']],
  [['strong speaking skills','good speaking','強大的表達能力'],['make their ideas visible','helps other people notice your ideas','使想法被看見']],
  [['workplace','work','職場'],['capable employees','skilled workers','有能力的員工'],['remain overlooked','are not noticed','仍被忽視'],['work lacks value','work does not matter','工作缺乏價值'],['colleagues, clients, or managers','coworkers, customers or bosses','同事、客戶或管理層']],
  [['By contrast','On the other hand','相比之下'],['present an argument in an organised and engaging way','explains a point clearly and in an interesting way','有條理而吸引人的論述'],['win trust','gain trust','贏得信任'],['secure promotion','move up at work','獲得晉升']],
  [['design an excellent product','make a very good product','設計出色產品'],['investors or customers','people who might fund or buy it','投資者或客戶'],['benefits','why it helps','好處'],['may never leave the meeting room','may go no further than a meeting','想法留在會議室']],
  [['In this sense','In this way','從這個意義上說'],['public speaking','speaking to a group','公開演說'],['private ability','a person’s own skill','個人能力'],['public influence','an effect on others','公共影響力'],['professional success','success at work','職業成功']],
  [['Moreover','Also','此外'],['oratory skills','speaking well to a group','演說能力'],['essential','needed','必要'],['success often requires cooperation','people often need to work together to succeed','成功往往需要合作']],
  [['entrepreneurs','business owners','企業家'],['community organisers','people who organise local activities','社區組織者'],['negotiate','work out agreements','協商'],['calm','make people feel calm','安撫'],['inspire','make them want to act','激勵']],
  [['sensitivity','care for others','顧及他人的敏銳度'],['reduce misunderstandings','avoid confusion','減少誤解'],['bring others onto the same page','help everyone agree on a shared plan','讓人達成共識']],
  [['during a crisis','During a difficult time','危機中'],['clear instructions','clear directions','清晰指示'],['motivates a team','encourages a team','激勵團隊'],['technical expertise','knows a lot about the work','技術專長'],['communicates poorly','explains things badly','溝通欠佳']],
  [['Similarly','In the same way','同樣地'],['defend opinions','explain their views','捍衛觀點'],['participate in discussions','join discussions','參與討論'],['develop a confidence','become more confident','培養自信'],['opens doors','give them chances','打開機會']],
  [['Effective speech','good speaking','有效的表達'],['does not merely decorate ability','does more than make someone’s skills look good','不只裝飾能力'],['releases it','helps people put those skills to use','釋放能力']],
  [['In conclusion','In short','總結來說'],['completely agree','fully agree','完全同意'],['oratory skills','speaking well to a group','演說能力'],['essential for success','needed to succeed','對成功必不可少']],
  [['present their abilities clearly','show what they can do clearly','清楚展示能力'],['persuade others effectively','convince others','有效說服他人'],['relationships','connections','人際關係'],['achievement usually happens','often help people achieve things','成就通常得以發生']],
];
const chunkOverrides=[
  ['The ability to speak persuasively in public','is often regarded as a key ingredient of success.'],
  ['I completely agree that oratory skills are essential,','because success rarely depends only on what people know;','it also depends on how convincingly they can express, defend, and share that knowledge.'],
  ['First, strong speaking skills','allow people to make their ideas visible.'],
  ['In the workplace, many capable employees remain overlooked','not because their work lacks value,','but because they cannot explain it clearly to colleagues, clients, or managers.'],
  ['By contrast, a person who can present an argument','in an organised and engaging way','is more likely to win trust, secure promotion, and lead others.'],
  ['For example, an engineer may design an excellent product,','but if she cannot explain its benefits to investors or customers,','the idea may never leave the meeting room.'],
  ['In this sense, public speaking turns private ability','into public influence,','which is central to professional success.'],
  ['Moreover, oratory skills are essential','because success often requires cooperation.'],
  ['Leaders, teachers, entrepreneurs, and community organisers','all need to encourage, negotiate, calm, and inspire others.'],
  ['When people speak with confidence and sensitivity,','they can reduce misunderstandings','and bring others onto the same page.'],
  ['A manager who gives clear instructions and motivates a team during a crisis','will achieve more than one who has technical expertise','but communicates poorly.'],
  ['Similarly, students who can ask questions, defend opinions, and participate in discussions','develop a confidence that later opens doors','in both study and work.'],
  ['Effective speech, therefore, does not merely decorate ability;','it releases it.'],
  ['In conclusion, I completely agree','that oratory skills are essential for success.'],
  ['They help people present their abilities clearly,','persuade others effectively,','and build the relationships through which achievement usually happens.'],
];
const simpleChunkOverrides=[
  ['Speaking clearly and convincingly to a group','is often seen as important for success.'],
  ['I fully agree that speaking well to a group is needed,','because success depends not only on what people know','but also on how well they explain, support and share it.'],
  ['First, good speaking','helps other people notice your ideas.'],
  ['At work, many skilled workers are not noticed,','not because their work does not matter,','but because they cannot explain it clearly to coworkers, customers or bosses.'],
  ['On the other hand, someone who explains a point','clearly and in an interesting way','is more likely to gain trust, move up at work and lead others.'],
  ['For example, an engineer may make a very good product,','but if she cannot tell people who might fund or buy it why it helps,','the idea may go no further than a meeting.'],
  ['In this way, speaking to a group helps turn a person’s own skill','into an effect on others,','and this matters for success at work.'],
  ['Also, speaking well to a group is needed','because people often need to work together to succeed.'],
  ['Leaders, teachers, business owners and people who organise local activities','all need to encourage others, work out agreements,','make people feel calm and make them want to act.'],
  ['When people speak confidently and with care for others,','they can avoid confusion','and help everyone agree on a shared plan.'],
  ['During a difficult time, a manager who gives clear directions and encourages a team','will do better than one who knows a lot about the work','but explains things badly.'],
  ['In the same way, students who ask questions, explain their views and join discussions','become more confident,','and this can give them chances later in school and at work.'],
  ['So good speaking does more than make someone’s skills look good;','it helps people put those skills to use.'],
  ['In short, I fully agree','that speaking well to a group is needed to succeed.'],
  ['It helps people show what they can do clearly,','convince others and build the connections','that often help people achieve things.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('The ability to explain a plan clearly is often regarded as an important part of leadership.','is often regarded as 標示外界對某能力的普遍評價。','這句只呈現普遍評價，尚未列出作者的論證。',[1,3,13],
    F('[某項能力] is often regarded as [成功的重要條件]','用 is often regarded as 提出社會上的常見看法，為作者是否同意作鋪墊。','引言要先呈現題目中某項能力與成果的關係時。',[['The ability to speak persuasively in public','slot','某項能力'],[' is often regarded as ','link','標示普遍評價'],['a key ingredient of success.','slot','成功的重要條件']])),
  S('I completely agree that reading matters, because learning depends not only on the facts students find; it also depends on how well they compare and explain them.','not only...; it also... 對照知識本身與表達、運用知識的能力。','這句先表明同意，再用兩個互補條件支撐立場。',[0,3,7],
    F('I completely agree that [能力] is essential, because success rarely depends only on [所知內容]; it also depends on [表達、捍衛及分享所知]','先亮出立場，再指出知識與清楚傳達知識兩者都影響成果。','題目問某能力是否必要，而你要指出其他條件單獨存在仍不足夠時。',[['I completely agree that ','link','表明完全同意'],['oratory skills','slot','能力'],[' are essential, because success rarely depends only on ','link','引出不足的單一條件'],['what people know','slot','所知內容'],['; it also depends on ','link','加上另一重要條件'],['how convincingly they can express, defend, and share that knowledge.','slot','表達、捍衛及分享所知']])),
  S('First, clear diagrams allow scientists to make their findings easier for others to see.','allow...to 說明一種做法如何令原本不易見的成果被看見。','這句提出首項作用，未解釋職場中被忽視的原因。',[1,3,6],
    F('First, [有效表達能力] allow [人] to make [原本不易見的想法] visible','首項理由聚焦可見性：想法或能力需要被他人理解，才可能發揮影響。','首段要解釋一項有價值的想法如何被他人看見和採用時。',[['First, ','link','引出首項理由'],['strong speaking skills','slot','有效表達能力'],[' allow ','link','賦予能力'],['people','slot','人'],[' to make ','link','指出可做到的事'],['their ideas','slot','原本不易見的想法'],[' visible.','link','使其被看見']])),
  S('Many volunteers remain unnoticed not because their work is unimportant, but because they have not shown its results clearly.','not because...but because... 糾正被忽視的真正原因，避免誤判工作價值。','這句精確區分「成果無價值」與「成果未被清楚解釋」。',[2,4,5],
    F('In [工作環境], [有能力者] remain overlooked not because [工作無價值], but because [無法清楚解釋給相關人]','用 not because...but because... 排除錯誤原因，指出成果被忽略與表達不足的關係。','要說明有價值的工作為何仍可能得不到相關決策者注意時。',[['In ','link','設定職場'],['the workplace','slot','工作環境'],[', ','link','提出被忽視的人'],['many capable employees','slot','有能力者'],[' remain overlooked not because ','link','排除錯誤原因'],['their work lacks value','slot','工作無價值'],[', but because ','link','指出真正原因'],['they cannot explain it clearly to colleagues, clients, or managers.','slot','無法清楚解釋給相關人']])),
  S('By contrast, a researcher who presents evidence in a clear and engaging way is more likely to gain support, guide a project and influence colleagues.','By contrast 對照前句未能解釋工作的人；more likely 審慎列可能結果。','這句轉向清楚呈現論點後較可能取得的職業結果。',[2,3,5],
    F('By contrast, [能有條理呈現論點的人] is more likely to [取得信任、晉升與領導機會]','與前一句被忽視者對照，說明善於表達者較可能得到哪些具體結果。','指出一項能力不足的損失後，要說明改善它可帶來哪些實際機會時。',[['By contrast, ','link','轉入對照'],['a person who can present an argument in an organised and engaging way','slot','能有條理呈現論點的人'],[' is more likely to ','link','審慎指出可能性'],['win trust, secure promotion, and lead others.','slot','取得信任、晉升與領導機會']])),
  S('For example, a designer may create a useful tool, but if she cannot explain its value to buyers, it may never reach a shop.','but if 設定未能解釋好處的條件，指出好產品也可能無法落地。','這句用具體人物和有條件的失敗結果，展示表達不足的代價。',[3,4,6],
    F('For example, [專業者] may [創造好成果], but if [不能向關鍵人解釋好處], [成果] may [無法被採用]','先承認作品優秀，再用 but if 指出其好處若不能被傳達，成果可能停留原地。','要把抽象的「能力沒有被看見」轉成可理解的個案時。',[['For example, ','link','引出具體例子'],['an engineer','slot','專業者'],[' may ','link','指出可能成就'],['design an excellent product','slot','創造好成果'],[', but if ','link','設定表達不足條件'],['she cannot explain its benefits to investors or customers','slot','不能向關鍵人解釋好處'],[', ','link','接可能後果'],['the idea','slot','成果'],[' may ','link','保持可能而非必然'],['never leave the meeting room.','slot','無法被採用']])),
  S('In this sense, clear explanation turns private research into public understanding, which can support better decisions.','turns...into... 說明轉化；which 指回轉化後的公共影響。','這句總結能力如何透過表達變成他人能採用的影響。',[2,5,12],
    F('In this sense, [表達技能] turns [個人能力] into [他人可見的影響], which is central to [成功領域]','把產品例子的意義提升：表達不是增添裝飾，而是讓能力在公共場合發揮作用。','兩個例子已完成，要指出它們共同證明的轉化機制時。',[['In this sense, ','link','概括例子的意義'],['public speaking','slot','表達技能'],[' turns ','link','發生轉化'],['private ability','slot','個人能力'],[' into ','link','成為'],['public influence','slot','他人可見的影響'],[', which is central to ','link','說明其重要性'],['professional success.','slot','成功領域']])),
  S('Moreover, clear speaking matters because successful teamwork often requires agreement.','Moreover 引出另一作用；because 把表達的重要性連到合作需求。','這句從個人能力被看見，轉向與他人協作。',[1,6,8],
    F('Moreover, [表達技能] are essential because [成果] often requires [合作]','第二主體段提出獨立理由：許多成果需要與他人合作，表達技能因此重要。','首段已論個人能力如何被看見，第二段要轉入與他人合作時。',[['Moreover, ','link','引出第二理由'],['oratory skills','slot','表達技能'],[' are essential because ','link','說明必要性的原因'],['success','slot','成果'],[' often requires ','link','指出需要'],['cooperation.','slot','合作']])),
  S('Coaches, organisers and teachers all need to explain, listen, settle disagreements and encourage others.','列不同角色，再列四類需要用語言完成的協作行動。','這句把「合作」拆成具體人際工作，不只抽象宣稱合作重要。',[7,9,10],
    F('[多類需要合作的角色] all need to [鼓勵、協商、安撫及激勵他人]','以多種職位顯示表達不只用於演說，還用於協商與帶動群體。','提出合作需要某能力後，要列出參與者及具體行動時。',[['Leaders, teachers, entrepreneurs, and community organisers','slot','多類需要合作的角色'],[' all need to ','link','指出共同需求'],['encourage, negotiate, calm, and inspire others.','slot','鼓勵、協商、安撫及激勵他人']])),
  S('When organisers speak clearly and consider people’s feelings, they can prevent confusion and help the group agree on a plan.','When 設定說話方式，can 指出減少誤解與建立共識兩種可能結果。','這句解釋表達如何促成合作，沒有比較兩位管理者。',[7,8,10],
    F('When [人] speak with [自信與體諒], they can [減少誤解] and [促成共識]','把說話方式和協作效果連起來：清楚且顧及他人的表達有助減少誤解、建立共同方向。','列出協作行動後，要解釋表達方式如何影響群體理解時。',[['When ','link','設定表達情況'],['people','slot','人'],[' speak with ','link','指出說話方式'],['confidence and sensitivity','slot','自信與體諒'],[', they can ','link','指出可能作用'],['reduce misunderstandings','slot','減少誤解'],[' and ','link','並列第二作用'],['bring others onto the same page.','slot','促成共識']])),
  S('A coach who gives clear directions and encourages players during a difficult match will achieve more than one who knows the rules but explains them badly.','who...will achieve more than one who... 對照兩種領導者；差別在危機中能否有效傳達。','這句以同一工作場景比較知識與溝通結合後的結果。',[8,9,11],
    F('A [能清楚指示並鼓舞團隊的管理者] will achieve more than one who has [技術知識] but [溝通欠佳]','以危機中的兩位管理者比較：技術知識重要，但不會自然變成有效的團隊行動。','說明合作機制後，要用具體比較呈現該能力的價值時。',[['A manager who gives clear instructions and motivates a team during a crisis','slot','能清楚指示並鼓舞團隊的管理者'],[' will achieve more than one who has ','link','對照兩位管理者'],['technical expertise','slot','技術知識'],[' but ','link','指出不足'],['communicates poorly.','slot','溝通欠佳']])),
  S('Similarly, pupils who ask questions and join discussions build confidence that can later help them at school and at work.','Similarly 由管理者例子轉到學生；that 指回自信對日後機會的作用。','這句擴展合作和表達的應用對象，不只是危機管理。',[7,9,10],
    F('Similarly, [主動提問和討論的學生] develop [自信] that later opens doors in [學習與工作]','用學生例子展示同一表達能力如何培養自信，並延伸到未來機會。','舉出工作中的例子後，還要展示早期練習的後續價值時。',[['Similarly, ','link','加入另一群體'],['students who can ask questions, defend opinions, and participate in discussions','slot','主動提問和討論的學生'],[' develop ','link','累積'],['a confidence','slot','自信'],[' that later opens doors in ','link','連到日後機會'],['both study and work.','slot','學習與工作']])),
  S('Clear explanation, therefore, does not merely display knowledge; it helps people use it.','does not merely...; it... 重新界定表達：不只是外觀，也讓能力發生作用。','這句把兩段例子收束為能力得以運用的原則。',[6,8,11],
    F('[有效表達] does not merely [修飾能力]; it [使能力得以發揮]','用分號對照狹窄看法與更完整功能：好表達使能力被他人理解與運用。','完成多個例子後，要概括某能力如何讓其他能力產生實際成果時。',[['Effective speech','slot','有效表達'],[', therefore, does not merely ','link','否定狹窄理解'],['decorate ability','slot','修飾能力'],['; it ','link','指出真正作用'],['releases it.','slot','使能力得以發揮']])),
  S('In conclusion, I completely agree that clear speaking is essential for effective teamwork.','結論直接重申完全同意，不引入新例。','這句是立場重述，未列三種不同作用。',[1,12,14],
    F('In conclusion, I completely agree that [表達技能] are essential for [成果]','結論明確回到題目與同意程度，無須再加新理由。','兩段理由完成後，要直接回答題目所問的必要性時。',[['In conclusion, I completely agree that ','link','重申完全同意'],['oratory skills','slot','表達技能'],[' are essential for ','link','說明必要關係'],['success.','slot','成果']])),
  S('They help organisers explain ideas, persuade partners and build relationships through which a shared project becomes possible.','列展示能力、說服他人和建立關係三項作用，through which 指向成果形成的途徑。','這句把兩段理由歸納成三種具體作用，而非只重申立場。',[6,12,13],
    F('They help people [展示能力], [說服他人] and [建立關係] through which [成就] usually happens','在結論回收能力可見與合作兩段：清楚展示、有效說服及關係建立。','最後一句要精簡歸納能力如何轉成成果，不增添新論點時。',[['They help people ','link','歸納技能作用'],['present their abilities clearly','slot','展示能力'],[', ','link','並列'],['persuade others effectively','slot','說服他人'],[', and ','link','並列'],['build the relationships','slot','建立關係'],[' through which ','link','指出成果發生的途徑'],['achievement','slot','成就'],[' usually happens.','link','指出通常結果']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者認為公開演說能力對成功有多重要？',[
    '完全同意它重要：能讓已有能力被看見，也有助於說服與合作',
    '完全反對：只要有知識，便永遠不需向他人解釋',
    '只認為演說有助個人曝光，但與合作毫無關係',
    '沒有立場：文章只介紹幾個職位的名稱',
  ],'引言與結論都說 completely agree；兩段分別談讓能力被看見與促成合作。'),
  {type:'multi',prompt:'選出兩條正文論證線',detail:'選兩項，再按「確認」。',options:[
    '清楚表達可讓同事、客戶或投資者理解有價值的工作和想法',
    '說話能力可減少誤解、促成共識並鼓舞團隊合作',
    '只要演說有趣，任何產品不需有實際好處',
    '合作只靠技術知識便會自動形成，無需溝通',
  ],correct:[0,1],why:'第一段用被忽視員工與工程師產品說明可見性；第二段用管理者與學生說明合作。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 立場與核心原因','完全同意演說能力重要：成功不只靠所知，也靠能否說清楚。'],
  ['主體段一 · 能力被看見','員工若不會解釋可能被忽略；工程師須說明產品好處，想法才可能落地。'],
  ['主體段二 · 合作得以形成','領袖、教師等需要鼓勵與協商；清楚、體諒的表達可減少誤解。'],
  ['結論 · 釋放能力','重申完全同意，歸納展示能力、說服他人及建立關係。'],
],'知識和能力 → 清楚表達使其被理解 → 合作使想法落地 → 成就較可能發生。')];
const evidence=[
  Q('為何有能力的員工仍可能在職場被忽略？',[
    '工作有價值，但他們未能向相關人清楚解釋',
    '有能力的員工所做的工作必定沒有價值',
    '只要經理見過員工，便會自動了解所有工作細節',
    '被忽略的唯一原因必然是員工不願工作',
  ],'not because...but because... 清楚排除「工作無價值」，指出「無法解釋清楚」。'),
  Q('工程師產品例子說明甚麼限制？',[
    '產品即使優秀，若無法向投資者或客戶說明好處，想法仍可能停在會議室',
    '只要產品優秀，投資者和客戶便必然已了解全部好處',
    '工程師應只介紹產品外觀，不必說明用途',
    '無法說明好處反而保證產品立即投入市場',
  ],'原文先承認 excellent product，再以 but if 設定無法解釋的條件與可能後果。'),
  Q('「把個人能力轉成公共影響力」在文中指甚麼？',[
    '讓他人理解並可能採用本來只由本人掌握的能力或想法',
    '把產品藏起來，避免同事或客戶知道',
    '只把能力寫在私人筆記，不與任何人交流',
    '認為技術能力和向他人解釋完全相同',
  ],'turns private ability into public influence 概括前面的職場與產品例子。'),
  Q('第二主體段為何列出領袖、教師、企業家和社區組織者？',[
    '不同角色都需要鼓勵、協商、安撫及激勵他人以促成合作',
    '這些角色只需獨自工作，從不需要與他人協調',
    '他們的共同工作只有背誦演說稿',
    '這些職位全部不需要處理誤解或分歧',
  ],'原文以四類角色和四項人際行動，具體展開 success often requires cooperation。'),
  Q('危機中的兩名管理者被用來比較甚麼？',[
    '清楚指示並鼓舞團隊，比只有技術專長卻溝通不佳更能帶動成果',
    '技術知識越多，就必定完全不需向團隊發指示',
    '只要一名管理者有危機經驗，說話方式便不會影響團隊',
    '管理者說得越不清楚，團隊越能自動達成共識',
  ],'more than one who...but communicates poorly 對照技術知識與在危機中帶動團隊的能力。'),
  Q('學生提問、捍衛觀點及討論的例子，如何延伸合作論證？',[
    '這些練習可培養自信，日後在學習及工作中開啟機會',
    '學生只有不參與討論，才可能建立自信',
    '這類表達練習只能對當下考試分數有用',
    '文章說學生的表達能力與未來學習或工作無關',
  ],'Similarly 將同類表達作用從管理者擴到學生；later opens doors 指出日後影響。'),
];
const logic=[
  sequence('第一主體段：能力如何經表達變得可見？',[
    ['首項理由','好的表達使想法能被他人看見。'],
    ['職場問題','有能力員工因解釋不清而被忽略，並非工作沒有價值。'],
    ['對照結果','善於組織及呈現論點者較可能獲信任、晉升及領導機會。'],
    ['工程師例子','產品出色，但未能說明好處便可能停在會議室。'],
    ['段落機制','公開演說把私人的能力轉化為他人能理解的影響力。'],
  ],'能力有價值 → 他人須理解 → 清楚表達使想法被看見與採用。'),
  sequence('第二主體段：好表達如何帶來合作？',[
    ['第二理由','成功往往需要合作，演說能力因此重要。'],
    ['多種角色','領袖、教師等須鼓勵、協商、安撫及激勵他人。'],
    ['表達方式','自信且顧及他人地說話，可減少誤解並促成共識。'],
    ['管理者對照','危機中清楚指示、鼓舞團隊者，比溝通不佳者更有效。'],
    ['學生延伸','提問與討論培養自信，日後可開啟學習及工作機會。'],
    ['段落結論','有效表達不只修飾能力，更讓能力發揮作用。'],
  ],'清楚表達 → 減少誤解與帶動團隊 → 人際關係讓能力發揮作用。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一名研究員完成有用的調查，但社區委員會看不懂原始表格。','哪項最能讓研究能力轉成公共影響？',[
    '用清楚圖表解釋結論、證據和限制，讓委員能據此討論方案',
    '只交出未加說明的表格，並假設每位委員已明白',
    '把數據藏起來，避免委員提出任何問題',
    '只強調自己資歷，不解釋調查究竟發現甚麼',
  ],[
    '這讓他人理解研究成果，保留「個人能力 → 公共影響」的轉化。',
    '原始表格不一定讓非專家理解。',
    '不分享資料便難形成公共討論。',
    '資歷不能代替對發現的解釋。',
  ],[2,3,6],'範文說員工能力可能因解釋不清被忽略，公開表達可使想法被看見。'),
  T('工程師做出一款省電裝置，卻只對潛在買家列出零件編號。','哪項最能運用產品例子的邏輯？',[
    '說明裝置如何減少用電，並用可靠資料回應買家的問題',
    '只重複零件編號，不解釋產品對買家有甚麼好處',
    '因產品省電，便假設買家毋須了解用途也一定採用',
    '只要求買家立即投資，不讓他們提問',
  ],[
    '這把技術成果轉成買家可理解的實際好處。',
    '只有零件編號難讓買家判斷價值。',
    '優秀產品仍可能因表達不足而停滯。',
    '說服包括清楚解答關鍵疑問。',
  ],[3,5,6],'範文的工程師若無法向投資者或顧客解釋好處，想法可能留在會議室。'),
  T('一位能力很強但安靜的教師，想讓同事採用自己有效的教學方法。','哪項最能保留文章的核心，而不把能力等同魅力？',[
    '整理方法、展示學生作品並清楚解釋可重複的步驟',
    '只要求自己變得天生有魅力，不分享教學證據',
    '因教學有效，便認為同事已自動知道全部做法',
    '只提高演說音量，不說明方法與成果',
  ],[
    '這透過可學習的清楚表達讓既有能力被理解。',
    '文章主張的是表達技能，並不要求天生魅力。',
    '有效做法仍須被清楚傳達。',
    '音量不能代替有條理的解釋。',
  ],[2,3,4,6],'範文重點是有條理地解釋工作，使能力與想法被看見。'),
  T('突然停電時，工場主管知道安全程序，但員工不清楚誰要停機、誰要檢查出口。','哪項最貼近危機管理者的比較？',[
    '立即清楚分派任務，確認每人理解，再鼓勵團隊配合執行',
    '只在腦中記住程序，期待員工自行猜出分工',
    '只展示主管的專業證書，不交代停機步驟',
    '讓每人收到互相矛盾的指示，卻不澄清',
  ],[
    '這將技術知識轉成團隊可一起執行的行動。',
    '主管懂程序不等於員工已理解。',
    '證書不能代替危機中的具體指示。',
    '矛盾指示會增加誤解。',
  ],[7,9,10],'範文比較清楚指示並鼓舞團隊的管理者與只具技術知識卻溝通差者。'),
  T('班級專題小組對進度安排有分歧，兩名同學都提出可行但不同的建議。','哪項說話方式最符合「促成共識」？',[
    '先重述雙方關注，再清楚說明共同目標及可接受的分工',
    '只重複自己的建議，完全不聽另一方擔憂',
    '為避免爭論，連截止日期與任務也不說明',
    '只比較誰說話較大聲，不討論計畫內容',
  ],[
    '這兼顧清楚與體諒，有助減少誤解並找到共同方向。',
    '忽略別人的關注會妨礙共識。',
    '不說明分工會留下更多不確定。',
    '音量不能決定方案是否可行。',
  ],[8,9],'範文說自信而敏銳地說話可減少誤解，讓人達成共識。'),
  T('社區活動需要義工分配物資，有人擔心工作太重而不願參與。','哪項最能運用「鼓勵、協商、安撫及激勵」？',[
    '說明工作量，聆聽困難，商量較合適的分工並鼓勵參與',
    '只命令義工接受原安排，不回答工作量疑問',
    '只發布模糊口號，不說明任何人要做甚麼',
    '因有人擔心，便取消與所有義工的溝通',
  ],[
    '這把幾種人際表達行動用在一個需要合作的情境。',
    '不理會疑問難以建立合作。',
    '空泛口號不能代替清楚安排。',
    '擔心時更需要解釋與協商。',
  ],[7,8,9],'範文列多類需要合作的角色及鼓勵、協商、安撫、激勵四種行動。'),
  T('一名學生想到改善校園回收的方法，卻在會議上只說「這很好」，沒有交代步驟。','哪項最能令想法被看見？',[
    '按問題、方案、需要的人手與預期效果，清楚向同學解釋',
    '繼續只說「這很好」，讓大家自行猜方案內容',
    '只把方案寫在私人日記，不與小組分享',
    '因想法可能有用，便認為毋須說明如何實行',
  ],[
    '有條理的說明讓他人能理解並評估想法。',
    '簡單評語不足以呈現具體方案。',
    '私人筆記不會讓團隊看見想法。',
    '實施步驟是說服他人的重要部分。',
  ],[2,4,6],'範文強調有條理、吸引人地提出論點，使能力和想法獲得注意。'),
  T('一位新員工想申請小組長，已完成數項改善流程的工作，但上司不知道成果。','哪項最符合職場段的因果關係？',[
    '用具體前後數據和清楚說明介紹成果，再回應上司的疑問',
    '因工作有價值，便假設上司必然已注意全部細節',
    '只要求晉升，不說明曾改善甚麼或如何改善',
    '把所有工作紀錄藏起來，避免同事知道',
  ],[
    '這讓有價值的工作可被理解，符合表達與晉升機會的關係。',
    '上司未必自動看見員工所有工作。',
    '晉升理由需要可理解的具體成果。',
    '隱藏成果會削弱可見性。',
  ],[3,4],'範文說有能力員工可能因解釋不清而被忽略，善於呈現者較可能獲晉升。'),
  T('一名學生在討論課常有疑問，卻怕發問會顯得自己不懂。','哪項最貼近範文對學生的分析？',[
    '練習清楚發問及說明看法，逐步建立參與討論的自信',
    '永遠不發問，因沉默必然使自己更有自信',
    '只背誦別人的意見，避免表達自己的問題',
    '因現在緊張，便判定將來工作與表達無關',
  ],[
    '這把提問與討論視為可練習的行動及自信來源。',
    '沉默不會自動提升討論自信。',
    '模仿不能取代清楚提出自己的疑問。',
    '範文說自信日後可帶來學習和工作機會。',
  ],[11],'範文以學生提問、捍衛觀點和參與討論，連到日後的自信與機會。'),
  T('小型藝術團體要申請展覽場地，已準備好作品，但管理者不清楚展覽如何服務觀眾。','哪項最能轉用工程師例子？',[
    '向管理者解釋作品內容、觀眾所得與實施安排，並回答關鍵疑問',
    '只把作品留在儲物室，等待管理者自行了解',
    '只說藝術家很有才華，不交代展覽的觀眾價值',
    '因作品已準備好，便認定場地申請必然獲准',
  ],[
    '這將已有作品的價值轉化為決策者能理解的理由。',
    '管理者若看不到作品與方案，難以判斷。',
    '才華聲稱不等於清楚解釋具體價值。',
    '好作品仍可能因說明不足而未被採用。',
  ],[5,6],'範文工程師即使產品優秀，若不能向關鍵人說明好處，想法仍可能停滯。'),
  T('某創業者深知產品技術，團隊卻對上市日期和各自職責理解不同。','哪項最能結合文章兩段理由？',[
    '對外說清產品好處，對內清楚分工和核對共識',
    '只向外部顧客解釋產品，對團隊分工保持含糊',
    '只向團隊說明職責，卻不向顧客解釋產品價值',
    '只強調創業者懂技術，完全不檢查別人是否理解',
  ],[
    '這兼顧能力被外部看見與內部合作兩條論證線。',
    '對外可見不能代替團隊協調。',
    '內部合作不能代替向顧客說明。',
    '個人知識須被清楚分享才能發揮作用。',
  ],[1,5,6,7,9,14],'範文先說表達使能力被看見，再說表達能減少誤解並促成合作。'),
  T('一名技術專家在會議中使用大量術語，同事只點頭卻未明白下一步。','哪項最能檢驗有效表達是否「釋放能力」？',[
    '請同事用自己的話確認步驟，並改用易懂例子說明工作目標',
    '因同事點頭，便假設每人已能正確執行',
    '增加更多未解釋的術語，避免有人提出問題',
    '只看專家的證書，不看團隊是否理解內容',
  ],[
    '這檢查知識是否真正傳到他人並轉成可執行行動。',
    '點頭不一定代表理解。',
    '更多術語可能增加誤解。',
    '證書不能代替團隊理解。',
  ],[1,9,10,12],'範文的「釋放能力」指清楚表達讓知識被他人理解並用於合作。'),
];
const reviewedTransferOptions=[
  ['用圖表解釋結論與證據，讓委員能討論方案','只交出未加說明的表格，假設委員全都明白','把調查數據藏起來，避免委員提出問題','只強調自己資歷，不解釋調查發現甚麼'],
  ['說明省電方式，並用資料回應買家疑問','只重複零件編號，不解釋買家會得到甚麼','產品省電，便認為買家不用了解也會採用','只要求買家立即投資，不讓他們提出疑問'],
  ['整理方法並展示作品，清楚講解可重複步驟','只求變得有魅力，不分享任何教學證據','教學有效，便假定同事已知道全部做法','只提高演說音量，不說明方法和成果'],
  ['清楚分派任務並確認理解，再鼓勵團隊執行','只在腦中記住程序，期待員工自行猜分工','只展示主管證書，不交代停機處理步驟','給每人互相矛盾的指示，卻不作澄清'],
  ['重述雙方關注，再說共同目標與可接受分工','只重複自己的建議，完全不聽對方擔憂','避免爭論，連截止日期與任務也不說明','只比較誰聲音大，不討論實際計畫內容'],
  ['說明工作量並聽困難，再商量分工和鼓勵參與','只命令義工接受安排，不回答工作量問題','只發布模糊口號，不說明任何人要做甚麼','有人擔心，便取消與所有義工的日常溝通'],
  ['按問題、方案、人手與預期效果向同學解釋','繼續只說「這很好」，讓大家猜方案內容','只把方案寫在私人日記，不與小組分享','想法可能有用，便認為不用說明如何實行'],
  ['用前後數據說明成果，再回應上司的疑問','工作有價值，便假設上司已注意全部細節','只要求晉升，不說明改善了甚麼或怎樣改善','把工作紀錄藏起來，避免同事知道成果'],
  ['練習發問及說明看法，逐步建立討論自信','永遠不發問，因沉默必然使自己更有自信','只背誦他人意見，避免表達自己的疑問','現在感到緊張，便斷定工作不需表達'],
  ['向管理者解釋作品價值與安排，回答關鍵疑問','只把作品留在儲物室，等待管理者自行了解','只說藝術家有才華，不交代展覽的觀眾價值','作品準備好，便斷言場地申請一定獲准'],
  ['對外說清產品好處，對內清楚分工和核對共識','只向外部顧客解釋產品，對團隊分工保持含糊','只向團隊說明職責，卻不向顧客解釋產品價值','只強調創業者懂技術，完全不檢查別人是否理解'],
  ['請同事複述步驟，再用易懂例子說明工作目標','同事一點頭，便假設每人都能正確執行','增加未解釋的術語，避免有人提出問題','只看專家證書，不看團隊是否理解內容'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
structures[1].example='I completely agree that reading skills are essential, because success rarely depends only on what students know; it also depends on how well they compare and explain it.';
structures[2].example='First, clear diagrams allow scientists to make their findings visible.';
structures[3].example='In volunteer work, capable people remain overlooked not because their work lacks value, but because they do not explain its results clearly.';
structures[6].example='In this sense, clear explanation turns private research into public understanding, which is central to informed decisions.';
structures[7].example='Moreover, clear speaking skills are essential because teamwork often requires cooperation.';
structures[9].example='When organisers speak with confidence and sensitivity, they can reduce misunderstandings and help the group agree on a plan.';
structures[10].example='A coach who gives clear directions and encourages players during a difficult match will achieve more than one who has deep knowledge but communicates poorly.';
structures[11].example='Similarly, pupils who ask questions and join discussions develop confidence that later opens doors in both study and work.';
structures[13].example='In conclusion, I completely agree that clear speaking skills are essential for effective teamwork.';
structures[14].example='They help people explain ideas, persuade partners, and build the relationships through which progress usually happens.';
export default {
  key:'opinion:15',
  meta:{topic:'演說能力、能力可見性與合作',summary:'作者完全同意演說能力重要：清楚表達使有價值的想法被理解和採用，也減少誤解、建立共識，讓個人能力透過團隊和關係發揮作用。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
