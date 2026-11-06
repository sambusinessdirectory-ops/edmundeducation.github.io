// Model Essay 26 · Opinion: gender stereotypes and peaceful behaviour.
const simple=[
  'Talks about men, women and violence often depend on old ideas about personality.',
  'Although people sometimes say women care more and argue less than men, I do not agree at all that women are born more peaceful.',
  'I think how peacefully someone acts is shaped much more by how they grow up, what society expects and who has power than by whether they are male or female.',
  'First, saying women are born more peaceful makes the way personality develops seem too simple.',
  'From a young age, boys and girls are often taught to act in different ways: girls may be told to be patient, polite and aware of others’ feelings, while boys may be praised for being tough, wanting to win and taking control.',
  'After a long time, people may think these rules are natural when they are really learned roles.',
  'For example, a girl often told not to argue may learn to disagree quietly, while a boy praised for winning arguments may begin to speak more strongly.',
  'This does not show that one sex is born peaceful and the other born aggressive; it shows that society teaches people different ways to act that others accept.',
  'Also, saying women are born to care for others can hurt them because it gives them unfair duties and makes excuses for men who act aggressively.',
  'If people think all women are naturally gentle, they may judge women who have strong goals, show anger or speak firmly about politics as unusual.',
  'At the same time, people may treat violent men as if they are just acting naturally, and so expect less responsibility from them.',
  'In fact, men and women can both be caring, cruel, good at settling disagreements or willing to argue, depending on their beliefs, situation and choices.',
  'A woman in charge can make hard and cruel choices, just as a male teacher or father can help create a peaceful and caring place.',
  'In short, I fully reject the idea that women are usually more peaceful because they are born more caring.',
  'Being peaceful is not a mark put on one sex at birth; it grows through learning, culture and taking responsibility for what we do.',
];
const vocabulary=[
  [['Discussions about gender and violence','Talks about men, women and violence','關於性別與暴力的討論'],['rest on','depend on','建立於'],['long-standing assumptions','old ideas','長久假設'],['personality','personality','性格']],
  [['While','Although','雖然'],['more caring','care more','更關懷他人'],['less confrontational','argue less','較少對抗'],['completely disagree','do not agree at all','完全不同意'],['naturally more peaceful','born more peaceful','天生更和平']],
  [['In my view','I think','在我看來'],['peacefulness','how peacefully someone acts','和平的性格'],['upbringing','how they grow up','成長環境'],['social expectations','what society expects','社會期望'],['power','who has power','權力'],['biological sex','whether they are male or female','生理性別']],
  [['born more peace-loving','born more peaceful','天生更愛和平'],['oversimplifies','seem too simple','過度簡化'],['how character is formed','the way personality develops','性格如何形成']],
  [['From childhood','From a young age','從童年'],['behave in different ways','act in different ways','以不同方式行事'],['emotionally aware','aware of others’ feelings','具情緒覺察'],['whereas','while','而'],['toughness','being tough','堅強'],['competitiveness','wanting to win','好勝'],['dominance','taking control','支配性']],
  [['Over time','After a long time','隨時間'],['these expectations','these rules','這些期望'],['a mask','learned roles','面具'],['mistake for nature','are natural','誤當天性']],
  [['repeatedly told','often told','反覆被告知'],['avoid conflict','not to argue','避免衝突'],['express disagreement quietly','disagree quietly','安靜表達不同意見'],['rewarded for winning arguments','praised for winning arguments','因贏爭論受獎'],['more forceful','speak more strongly','更強勢']],
  [['does not prove','does not show','不能證明'],['naturally aggressive','born aggressive','天生具攻擊性'],['society trains people','society teaches people','社會訓練人'],['acceptable behaviour','ways to act that others accept','可接受行為']],
  [['Moreover','Also','此外'],['naturally nurturing','born to care for others','天生具養育特質'],['harmful','hurt','有害'],['unfair moral expectations','unfair duties','不公平道德期望'],['excuses aggression in men','makes excuses for men who act aggressively','為男性攻擊性開脫']],
  [['assumed to be gentle by nature','think all women are naturally gentle','被假設天生溫柔'],['ambitious','have strong goals','有野心'],['politically assertive','speak firmly about politics','政治上立場堅定'],['abnormal','unusual','不正常']],
  [['At the same time','At the same time','與此同時'],['show violence','violent','表現暴力'],['following their instincts','acting naturally','順從本能'],['lowers the standard of responsibility','expect less responsibility','降低責任要求']],
  [['In reality','In fact','事實上'],['compassionate','caring','有同情心'],['diplomatic','good at settling disagreements','圓融'],['confrontational','willing to argue','具對抗性'],['circumstances','situation','處境']],
  [['female leader','woman in charge','女性領袖'],['ruthless decisions','hard and cruel choices','冷酷決定'],['male teacher or father','male teacher or father','男性教師或父親'],['calm and caring environment','peaceful and caring place','平靜關懷的環境']],
  [['In conclusion','In short','總結來說'],['entirely reject','fully reject','完全反對'],['generally more peaceful','usually more peaceful','通常更和平'],['naturally more nurturing','born more caring','天生更具養育特質']],
  [['Peace','Being peaceful','和平'],['not written into one gender like a birthmark','not a mark put on one sex at birth','不像胎記般寫在某性別身上'],['cultivated','grows','培養'],['personal responsibility','taking responsibility for what we do','個人責任']],
];
const chunkOverrides=[
  ['Discussions about gender and violence','often rest on long-standing assumptions about personality.'],
  ['While women are sometimes described as more caring and less confrontational than men,','I completely disagree that they are naturally more peaceful.'],
  ['In my view, peacefulness is shaped far more','by upbringing, social expectations and power','than by biological sex.'],
  ['First, the idea that women are born more peace-loving','oversimplifies how character is formed.'],
  ['From childhood, boys and girls are often taught to behave in different ways:','girls may be encouraged to be patient, polite and emotionally aware,','whereas boys may be praised for toughness, competitiveness and dominance.'],
  ['Over time, these expectations can become a mask','that people mistake for nature.'],
  ['For example, a girl who is repeatedly told to avoid conflict may learn to express disagreement quietly,','while a boy who is rewarded for winning arguments may become more forceful.'],
  ['This does not prove that one sex is naturally peaceful and the other naturally aggressive;','it shows that society trains people to perform different versions of acceptable behaviour.'],
  ['Moreover, describing women as naturally nurturing can be harmful','because it places unfair moral expectations on them','and excuses aggression in men.'],
  ['If women are assumed to be gentle by nature,','those who are ambitious, angry or politically assertive','may be judged as abnormal.'],
  ['At the same time, men who show violence may be treated as if they are simply following their instincts,','which lowers the standard of responsibility expected of them.'],
  ['In reality, both men and women can be compassionate, cruel, diplomatic or confrontational','depending on their values, circumstances and choices.'],
  ['A female leader can make ruthless decisions,','just as a male teacher or father can create a calm and caring environment.'],
  ['In conclusion, I entirely reject the claim','that women are generally more peaceful because they are naturally more nurturing.'],
  ['Peace is not written into one gender like a birthmark;','it is cultivated through education, culture and personal responsibility.'],
];
const simpleChunkOverrides=[
  ['Talks about men, women and violence','often depend on old ideas about personality.'],
  ['Although people sometimes say women care more and argue less than men,','I do not agree at all that women are born more peaceful.'],
  ['I think how peacefully someone acts is shaped much more','by how they grow up, what society expects and who has power','than by whether they are male or female.'],
  ['First, saying women are born more peaceful','makes the way personality develops seem too simple.'],
  ['From a young age, boys and girls are often taught to act in different ways:','girls may be told to be patient, polite and aware of others’ feelings,','while boys may be praised for being tough, wanting to win and taking control.'],
  ['After a long time, people may think these rules are natural','when they are really learned roles.'],
  ['For example, a girl often told not to argue may learn to disagree quietly,','while a boy praised for winning arguments may begin to speak more strongly.'],
  ['This does not show that one sex is born peaceful and the other born aggressive;','it shows that society teaches people different ways to act that others accept.'],
  ['Also, saying women are born to care for others can hurt them','because it gives them unfair duties','and makes excuses for men who act aggressively.'],
  ['If people think all women are naturally gentle,','they may judge women who have strong goals, show anger or speak firmly about politics','as unusual.'],
  ['At the same time, people may treat violent men as if they are just acting naturally,','and so expect less responsibility from them.'],
  ['In fact, men and women can both be caring, cruel, good at settling disagreements or willing to argue,','depending on their beliefs, situation and choices.'],
  ['A woman in charge can make hard and cruel choices,','just as a male teacher or father can help create a peaceful and caring place.'],
  ['In short, I fully reject the idea','that women are usually more peaceful because they are born more caring.'],
  ['Being peaceful is not a mark put on one sex at birth;','it grows through learning, culture and taking responsibility for what we do.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Discussions about children’s behaviour often rest on old assumptions about personality.','rest on 指出討論的隱含前提，未證明這些前提準確。','引言先揭示常見假設，為反駁先天性別本質論鋪路。',[1,2,3],
    F('Discussions about [性別與暴力] often rest on [長久性格假設]','交代議題背後有未經檢驗的性格假設。','引言需要指出爭議論點的前提，而不先替它背書時。',[['Discussions about ','link','設定議題'],['gender and violence','slot','性別與暴力'],[' often rest on ','link','依賴'],['long-standing assumptions about personality.','slot','長久性格假設']])),
  S('While girls are sometimes described as quieter than boys, I disagree that they are naturally less assertive.','While 承認常見描述；主句反對由觀察推到天生特質。','這是作者反對性別本質化，不是說每個人行為都相同。',[0,2,4],
    F('While [女性常被描述較關懷及少對抗], I completely disagree that [天生更和平]','先公平轉述印象，再清楚否定把它當先天原因的說法。','題目由觀察到的差異推斷成因時，要分開描述與解釋時。',[['While ','link','讓步轉述'],['women are sometimes described as more caring and less confrontational than men','slot','女性常被描述較關懷及少對抗'],[', I completely disagree that ','link','明確反對推論'],['they are naturally more peaceful.','slot','天生更和平']])),
  S('In my view, cooperation is shaped more by family teaching and power than by biological sex.','far more...than... 比較解釋力，提出成長、期望與權力較關鍵。','這不是逐人量化哪個因素多少，而是文章的論證方向。',[1,3,9],
    F('In my view, [和平行為] is shaped far more by [成長、社會期望及權力] than by [生理性別]','概括兩段：行為學習與刻板標籤的權力後果。','表態後，要交代為何不接受某種單一成因解釋時。',[['In my view, ','link','提出解釋'],['peacefulness','slot','和平行為'],[' is shaped far more by ','link','比較主要因素'],['upbringing, social expectations and power','slot','成長、社會期望及權力'],[' than by ','link','較少由此決定'],['biological sex.','slot','生理性別']])),
  S('First, claiming that boys are born competitive oversimplifies how behaviour develops.','oversimplifies 指批評單一先天解釋忽略了後天形成過程。','第一主體段還需用童年教養和獎勵的例子證明。',[2,4,8],
    F('First, [某性別天生愛和平的想法] oversimplifies [性格形成過程]','指出先天標籤無法說明教養與社會獎勵的作用。','首段要診斷一項本質化主張的推理在哪一步過於簡化時。',[['First, ','link','第一理由'],['the idea that women are born more peace-loving','slot','某性別天生愛和平的想法'],[' oversimplifies ','link','過度簡化'],['how character is formed.','slot','性格形成過程']])),
  S('From childhood, children may be taught different roles: some are praised for patience whereas others are praised for winning.','From childhood 指學習起點；冒號列不同期望；whereas 對照兩種獎勵。','這句描述社會教導的可能模式，不能當成所有家庭都如此的定律。',[3,5,7],
    F('From childhood, [男孩女孩常被教不同做法]: [女孩可能被鼓勵耐心], whereas [男孩可能因強勢受讚]','把看似天然的行為差異，追溯到童年的不同規範與獎勵。','要具體說明社會期待如何經日常互動被學會時。',[['From childhood, ','link','交代形成時間'],['boys and girls are often taught to behave in different ways','slot','男孩女孩常被教不同做法'],[': ','link','列兩種方式'],['girls may be encouraged to be patient, polite and emotionally aware','slot','女孩可能被鼓勵耐心'],[', whereas ','link','對照'],['boys may be praised for toughness, competitiveness and dominance.','slot','男孩可能因強勢受讚']])),
  S('Over time, repeated expectations can look like a natural trait even when they are learned.','Over time 說反覆期望如何被誤認為天性；mask 是外在角色的比喻。','不是說真正的天性必然不存在，而是說表現不能直接證明天性。',[4,6,7],
    F('Over time, [社會期望] can become [面具] that people mistake for [天性]','說明學得的社交角色如何被外界錯誤歸因為先天本質。','列出不同群體獲得的不同鼓勵後，要說明為何結果會被誤認為天生時。',[['Over time, ','link','指出累積'],['these expectations','slot','社會期望'],[' can become ','link','可能變成'],['a mask','slot','面具'],[' that people mistake for ','link','被誤當成'],['nature.','slot','天性']])),
  S('For example, a child repeatedly told not to argue may disagree quietly, while a child praised for winning debates may speak forcefully.','兩個 may 及 while 對照不同教導與可能的說話方式。','例子展示社會訓練，不證明任何一方天生如此。',[4,5,8],
    F('For example, [被教避免衝突的女孩] may [安靜表達異議], while [因贏爭論受獎的男孩] may [更強勢]','以平行例子示範獎勵機制，而非性別本性，如何塑造表現。','要把不同成長規範轉成可觀察行為例子時。',[['For example, ','link','引出平行例子'],['a girl who is repeatedly told to avoid conflict','slot','被教避免衝突的女孩'],[' may learn to ','link','可能學會'],['express disagreement quietly','slot','安靜表達異議'],[', while ','link','對照另一組'],['a boy who is rewarded for winning arguments','slot','因贏爭論受獎的男孩'],[' may become ','link','可能變得'],['more forceful.','slot','更強勢']])),
  S('This does not prove that one group is born polite and the other aggressive; it shows that expectations train different behaviours.','does not prove...; it shows... 限制例子所能證明的事，改用社會訓練解釋。','這句主動防止學生把兩個例子又轉成另一個性別刻板印象。',[5,6,9],
    F('This does not prove [兩性天生一和平一具攻擊性]; it shows [社會訓練不同的可接受行為]','將描述性差異與成因分開，明確阻止以例子證成先天刻板印象。','舉出不同鼓勵的例子後，要避免把學來的差異誤讀成天生差異時。',[['This does not prove that ','link','否定不能證明的事'],['one sex is naturally peaceful and the other naturally aggressive','slot','兩性天生一和平一具攻擊性'],['; it shows that ','link','轉向能說明的事'],['society trains people to perform different versions of acceptable behaviour.','slot','社會訓練不同的可接受行為']])),
  S('Moreover, calling mothers naturally selfless can be harmful because it imposes unfair duties and excuses fathers from caring.','because 解釋刻板標籤的雙向道德後果：加責於一方，替另一方開脫。','這段批評標籤的規範效果，與前段解釋標籤形成不同。',[7,9,10],
    F('Moreover, describing [女性天生照顧者] can be harmful because it [給女性不公平期望] and [替男性攻擊性開脫]','第二段轉向刻板印象造成的責任不對等。','解釋差異如何形成後，還要分析把它固定成標籤的傷害時。',[['Moreover, describing ','link','提出另一問題'],['women as naturally nurturing','slot','女性天生照顧者'],[' can be harmful because it ','link','說明危害原因'],['places unfair moral expectations on them','slot','給女性不公平期望'],[' and ','link','並列另一危害'],['excuses aggression in men.','slot','替男性攻擊性開脫']])),
  S('If women are assumed gentle by nature, a woman who argues firmly may be judged as unusual.','If 設不合理假定；may 指可能的社會評價後果。','這句不是說有野心或表達憤怒本身不正常，而是批評那種標籤。',[8,10,12],
    F('If [女性被假定天生溫柔], [有野心、憤怒或政治主張者] may be judged as [異常]','具體顯示「天生溫柔」標籤怎樣限制女性的可接受行為。','要展開某種刻板期望對一個群體的具體後果時。',[['If ','link','設定社會假定'],['women are assumed to be gentle by nature','slot','女性被假定天生溫柔'],[', ','link','接受影響者'],['those who are ambitious, angry or politically assertive','slot','有野心、憤怒或政治主張者'],[' may be judged as ','link','可能被評為'],['abnormal.','slot','異常']])),
  S('At the same time, aggressive men may be excused as following instinct, which lowers what society expects of them.','At the same time 提另一側後果；which 指這種開脫降低責任要求。','文章反對以性別本能合理化暴力，主張個人仍須負責。',[8,9,12],
    F('At the same time, [表現暴力的男性] may be treated as if [只是順從本能], which [降低責任要求]','與上一句女性被過度要求對照，說明刻板印象如何替男性開脫。','要完整呈現同一種刻板觀念對兩個群體的不公平後果時。',[['At the same time, ','link','轉向另一側'],['men who show violence','slot','表現暴力的男性'],[' may be treated as if ','link','可能被視為'],['they are simply following their instincts','slot','只是順從本能'],[', which ','link','指出此看法後果'],['lowers the standard of responsibility expected of them.','slot','降低責任要求']])),
  S('In reality, people of every sex may act kindly or harshly depending on values, circumstances and choices.','both...depending on... 反對將特質固定配給某個性別，指出情境與選擇。','不是說所有人行為一樣，而是不同特質不屬某性別專有。',[9,10,13],
    F('In reality, [男女] can be [關懷、殘酷、圓融或對抗] depending on [價值觀、處境和選擇]','提出非刻板的替代解釋：具體行為須看人及情境。','分析雙向不公平後，要提出較準確的判斷方式時。',[['In reality, ','link','提出較準確說法'],['both men and women','slot','男女'],[' can be ','link','都可能是'],['compassionate, cruel, diplomatic or confrontational','slot','關懷、殘酷、圓融或對抗'],[' depending on ','link','視乎'],['their values, circumstances and choices.','slot','價值觀、處境和選擇']])),
  S('A female manager may make a cruel decision, just as a father may create a caring home.','just as 用交叉例子打破「女性只能照顧、男性只能強勢」的預設。','這是可能例子，不是把另一種性格固定指派給男女。',[10,11,14],
    F('[女性領袖可作冷酷決定], just as [男性教師或父親可建立關懷環境]','用反刻板的兩個可能例子，支撐男女都能表現多種行為。','提出不按群體標籤固定分配品質後，要給出具體人物例子時。',[['A female leader can make ruthless decisions','slot','女性領袖可作冷酷決定'],[', just as ','link','平行對照'],['a male teacher or father can create a calm and caring environment.','slot','男性教師或父親可建立關懷環境']])),
  S('In conclusion, I entirely reject the claim that one gender is peaceful simply because of a natural caring instinct.','結論直接否定「較和平因天生養育特質」的因果主張。','反對因果歸因，不是否定個人可以有關懷特質。',[1,12,14],
    F('In conclusion, I entirely reject the claim that [女性通常更和平] because [天生更會照顧]','重申反對把和平行為歸因於某一性別的先天特質。','結論要精確回答題目對某種特質來源的判斷時。',[['In conclusion, I entirely reject the claim that ','link','總結反對'],['women are generally more peaceful','slot','女性通常更和平'],[' because ','link','所聲稱的原因'],['they are naturally more nurturing.','slot','天生更會照顧']])),
  S('Peace is not written into one gender like a birthmark; it grows through education, culture and responsibility.','birthmark 比喻否定某性別天生擁有和平；分號提出可培養來源。','結尾把和平歸於教育、文化與個人責任，不把責任推給生理性別。',[2,8,13],
    F('[和平] is not written into [某一性別] like [胎記]; it is cultivated through [教育、文化和個人責任]','以胎記比喻收束，將討論轉回可學習、可負責的行為。','最後一句要反駁固定標籤，並指出更有根據的替代來源時。',[['Peace','slot','和平'],[' is not written into ','link','不是天生寫入'],['one gender','slot','某一性別'],[' like ','link','比喻'],['a birthmark','slot','胎記'],['; it is cultivated through ','link','可透過此培養'],['education, culture and personal responsibility.','slot','教育、文化和個人責任']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者是否同意「女性因天生更會照顧，所以一般更和平」？',[
    '完全不同意：表現受教養、社會期望、權力和個人選擇影響，不能按性別定性',
    '完全同意：某性別天生只能和平，另一性別天生只能具攻擊性',
    '認為所有人必然做出完全相同的選擇',
    '沒有立場：只描述男女穿着的差別',
  ],'引言與結論都拒絕先天性別歸因，並提出 upbringing, social expectations and power。'),
  {type:'multi',prompt:'選出兩條不同的反駁理由',detail:'選兩項，再按「確認」。',options:[
    '從小接受的鼓勵與獎勵可塑造表現，學得的角色可能被誤看成天性',
    '先天照顧者的標籤會不公平要求女性，也可能為男性暴力開脫',
    '女孩與男孩在每個家庭都一定接受完全相同的教導',
    '某一性別若曾作錯決定，便代表全體都天生如此',
  ],correct:[0,1],why:'第一主體段解釋社會訓練，第二主體段分析刻板標籤的責任後果。'},
];
const route=[sequence('先排好全文四段',[
  ['引言 · 反對先天性別歸因','作者反對女性天生更和平，提出教養、期望與權力的解釋。'],
  ['主體段一 · 社會訓練','男女可能因不同教導與獎勵表現不同；後天面具不能直接當天性。'],
  ['主體段二 · 標籤的不公平','把女性定為天生照顧者，可能加重其道德負擔，並降低對男性暴力的責任要求。'],
  ['結論 · 和平需要培養','和平不是某性別的胎記，而與教育、文化和個人責任有關。'],
],'先天假設 → 不同社會訓練 → 雙向不公平責任 → 以培養和選擇解釋和平。')];
const evidence=[
  Q('第一主體段如何解釋看似不同的男女行為？',[
    '童年教導與獎勵可能不同，後天學得的表現被誤認為天性',
    '只要觀察到差異，就已證明某性別天生更和平',
    '男孩和女孩從來不受任何社會期望影響',
    '社會訓練必然令每個個體有完全一樣的行為',
  ],'From childhood... / expectations...mask 是主要因果鏈；may 和 often 保留限定。'),
  Q('被教避免衝突的女孩與因贏爭論受獎的男孩，例子能證明甚麼？',[
    '不同鼓勵可能使人學到不同表達方式，不能由結果直接推定先天本性',
    '女孩永遠不會有不同意見',
    '男孩天生只能以強勢方式說話',
    '兩種表現已證明兩性在所有處境中都一樣',
  ],'This does not prove...; it shows... 明確限制例子的證據意義。'),
  Q('「天生照顧者」標籤對女性可能造成甚麼不公平？',[
    '把溫柔當作必然義務，使有野心、憤怒或立場堅定者被視為異常',
    '保證所有女性都不需承擔任何責任',
    '證明女性不能作出任何強硬決定',
    '使每個人的個別選擇都得到公平評價',
  ],'女性被 assumed gentle by nature 後，特定行為 may be judged as abnormal。'),
  Q('同一標籤對男性責任要求有何可能影響？',[
    '把暴力錯當自然本能，可能降低社會對其個人責任的要求',
    '令男性對每個行為都負上更高責任',
    '證明所有男性天生暴力，且不能作任何選擇',
    '令暴力行為自然變成和平行為',
  ],'treated as if...following instincts, which lowers...responsibility 是原文關鍵。'),
  Q('女性領袖與男性教師或父親的交叉例子，想指出甚麼？',[
    '關懷或冷酷等特質不能固定配給某一性別，須看具體價值、處境與選擇',
    '所有女性領袖都必定冷酷',
    '所有男性教師都必定和平',
    '性別足以預測每個人的下一個決定',
  ],'just as 與前句 both men and women...depending on... 一起打破固定配給。'),
  Q('「和平不是胎記」比喻在結論中有甚麼作用？',[
    '否定某性別天生獨有和平，改指教育、文化與個人責任能培養行為',
    '表示人的皮膚真的會顯示是否和平',
    '表示教育對人的行為完全沒有作用',
    '表示責任只取決於出生時的生理特徵',
  ],'not written into one gender like a birthmark 與 cultivated through... 明確對照。'),
];
const logic=[
  sequence('第一主體段：社會如何把學得的表現誤當天性？',[
    ['第一問題','女性天生更和平的說法過度簡化性格形成。'],
    ['童年規範','男女可能接受不同的耐心、強勢及競爭鼓勵。'],
    ['累積效果','反覆期望像面具，可能被誤當天性。'],
    ['平行例子','女孩被教避免衝突，男孩因贏爭論受獎。'],
    ['可能表現','前者可安靜表達異議，後者可更強勢。'],
    ['限制結論','例子顯示社會訓練，不能證明某性別天生和平或暴力。'],
  ],'不同教導 → 不同表現 → 後天角色被誤認為先天特質。'),
  sequence('第二主體段：先天標籤如何造成責任不公？',[
    ['另一問題','女性天生照顧者的描述可造成雙向傷害。'],
    ['對女性','有野心、憤怒或堅定表態者可能被判異常。'],
    ['對男性','暴力可能被錯當本能，降低其責任要求。'],
    ['替代判準','男女皆可能表現多種特質，須看價值、處境與選擇。'],
    ['交叉例子','女性領袖可強硬，男性教師或父親可營造關懷環境。'],
    ['結尾原則','和平不是性別胎記，而須教育、文化及個人責任培養。'],
  ],'先天標籤 → 女性被加上義務、男性可能被開脫 → 用個人選擇與責任取代刻板判斷。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一個班級只稱讚男生在辯論中壓倒別人，卻要求女生總是避免衝突。','哪項最能運用第一主體段的因果分析？',[
    '不同獎勵可能教出不同表達方式，不能把結果直接當成天生性格',
    '女生不公開爭論，便證明她們天生沒有不同意見',
    '男生被讚賞，便證明他們一出生就只能強勢',
    '只要有教室規則，任何人都不再作個人選擇',
  ],[
    '範文以避免衝突與贏爭論受獎的平行例子，說明社會訓練。',
    '安靜表達仍可有不同意見。',
    '獎勵不證明先天性。',
    '社會期望有影響，不等於人沒有選擇。',
  ],[4,5,6,7,8],'範文說不同期望可能成為面具，不能證明性別的自然本性。'),
  T('一家企業認為女性員工「天生較會照顧人」，所以把所有無薪關懷工作都交給她們。','哪項最能指出此標籤的危害？',[
    '把照顧能力當性別義務，會給女性不公平的道德與工作負擔',
    '女性一出生就必須無薪承擔每項照顧工作',
    '只要工作叫關懷，便完全不用考慮公平分配',
    '企業對男性的責任安排與刻板印象毫無關係',
  ],[
    '範文批評「天生養育者」標籤帶來不公平道德期望。',
    '這正是文章反對的先天化義務。',
    '公平分配仍須考慮。',
    '標籤也可能降低男性責任。',
  ],[9,10,11],'範文說 naturally nurturing 的描述 places unfair moral expectations on women。'),
  T('一名男學生對同學作出暴力行為，有人說「男孩就是這樣，不必追究」。','哪項最符合第二主體段？',[
    '不能把暴力當成性別本能而降低對個人行為的責任要求',
    '只要是男孩，暴力便自然無害',
    '因有人暴力，所有男孩都必定有同一性格',
    '只要談到教養，個人便完全不用為行為負責',
  ],[
    '範文特別反對以本能說法為男性攻擊性開脫。',
    '性別不是免責理由。',
    '個別行為不能推到群體天性。',
    '結論仍強調 personal responsibility。',
  ],[9,11,14],'範文說跟隨本能的看法會 lowers the standard of responsibility。'),
  T('一名女議員堅定反對某項政策，評論者稱她「不像真正的女性」。','哪項最能指出評論的錯誤？',[
    '把女性預設為天生溫柔，便可能錯把堅定政治表態評成異常',
    '女性表達政治立場必然表示她不關心人',
    '只有男性才可能對政策有堅定意見',
    '任何批評政策的行為都屬於暴力',
  ],[
    '範文正以 politically assertive 被視為 abnormal 說明標籤限制。',
    '堅定與關懷不互斥。',
    '政治表態不能按性別配給。',
    '不同意不等於暴力。',
  ],[9,10,12],'範文批評用先天溫柔標準評價有野心或政治立場的女性。'),
  T('一位男性教師耐心調解學生衝突，家長說「男性不可能天生有關懷能力」。','哪項最能轉用交叉例子？',[
    '男性也能創造平靜關懷的環境，不能把這些行為專屬於女性',
    '一位教師耐心，便證明所有男性都一樣',
    '因教師是男性，調解行為便不算關懷',
    '只有天生傾向能解釋他的每一個選擇',
  ],[
    '範文舉男性教師或父親建立關懷環境，打破性別專屬推論。',
    '個例不代表全體。',
    '行為仍可作關懷的例子。',
    '文章也看教養與選擇。',
  ],[12,13,14],'範文說 male teacher or father can create a calm and caring environment。'),
  T('同一位女性領袖有時作出嚴格決策，也會在私人生活中關心朋友。','哪項最能避免把人塞進單一性別標籤？',[
    '看具體價值、處境與選擇，不因女性身分預設所有決定都溫柔',
    '她一旦作過嚴格決策，便永遠沒有關懷能力',
    '她會關心朋友，便不可能作任何強硬決定',
    '任何女性領袖必定與她作出相同選擇',
  ],[
    '範文指出同一性別的人可有多種特質，行為需按情境判斷。',
    '人不必只有一種特質。',
    '關懷與強硬決策可以出現在不同情況。',
    '不能由個例推定全體。',
  ],[12,13],'範文說 both men and women can be compassionate, cruel...depending on values, circumstances and choices。'),
  T('報章看見男孩在比賽中爭勝，就下標題「男生天生好鬥；女生天生和平」。','哪項最能指出其證據不足？',[
    '一次競爭表現不能證明整個性別的天性；應考慮教導、獎勵與情境',
    '只要標題提到性別，便自動證明其因果正確',
    '男孩爭勝便證明所有女孩從來不想贏',
    '一次比賽足以推定每個人的終身性格',
  ],[
    '範文反對由社會表現直接推到先天本質。',
    '標題不會增加證據。',
    '一方表現不能證明另一方。',
    '單次情境不能決定終身性格。',
  ],[3,4,7,8],'範文說社會可能獎勵 competitiveness，但這 does not prove 先天差異。'),
  T('家長告訴女兒「你應永遠讓步」，卻告訴兒子「必須贏每場爭論」。','哪項最能解釋日後可能出現的表現差異？',[
    '兩人受不同期望影響，可能學到不同處理衝突的方法',
    '女兒日後安靜，便證明出生前已決定她不能爭辯',
    '兒子日後強勢，便證明所有男性天生有暴力傾向',
    '家長的反覆教導絕不可能影響孩子說話方式',
  ],[
    '這與範文的平行例子直接相應，仍用「可能」保留個體差異。',
    '學得方式不能證明出生前決定。',
    '強勢與暴力也不可混為一談。',
    '教導是原文的核心機制。',
  ],[4,5,6,7],'範文從反覆被教避免衝突及因爭論獲獎，推到可能的表達方式。'),
  T('社區計劃只邀請女性做調解員，理由是「和平是女性的胎記」。','哪項最符合文章結論？',[
    '調解能力可透過教育與責任培養，不能只憑性別判定誰適合',
    '只要是女性，不需訓練便一定能有效調解',
    '男性即使受訓，也不可能營造平靜環境',
    '調解能力只能由出生時的生理特徵決定',
  ],[
    '範文的胎記比喻正否定性別天生擁有和平，改談培養。',
    '範文沒有提出無須訓練的保證。',
    '男性教師的例子反對此說。',
    '個人責任與教育仍重要。',
  ],[12,13,14],'範文說 Peace is not written into one gender like a birthmark。'),
  T('一位教練在男女隊員衝突後，只要求女生負責安撫，說男生發怒「很正常」。','哪項最能指出雙向不公平？',[
    '女生被加上額外照顧義務，男生的攻擊行為卻可能被錯誤開脫',
    '性別規則使所有隊員的責任完全相同',
    '只要教練說正常，暴力便不用再評估',
    '女生若有不滿，便證明她們沒有任何關懷能力',
  ],[
    '範文的第二段同時指出女性負擔與男性責任被降低。',
    '這種分工並不相同。',
    '標籤不應免除行為責任。',
    '表達不滿不會取消關懷能力。',
  ],[9,10,11,14],'範文說 naturally nurturing 的說法既 places unfair expectations 又 excuses aggression。'),
  T('學校研究報告只根據少量課堂觀察，聲稱「某性別天生更和平」。','哪項最能按照文章的推理要求修正？',[
    '區分觀察到的行為與先天原因，檢查教育、社會期望和權力等替代解釋',
    '只要有觀察，便不必分析行為如何形成',
    '少量觀察足以判定每個個體的本性',
    '只要提出替代解釋，就表示男女不會有任何行為差異',
  ],[
    '範文反對由表現直接推先天原因，並提出多個塑造因素。',
    '觀察與因果歸因是不同步驟。',
    '樣本及個體差異不能忽略。',
    '承認可能差異不等於接受天生單因。',
  ],[1,2,3,8,12],'範文說 upbringing, social expectations and power 比 biological sex 更能解釋和平行為。'),
  T('班級活動要求學生輪流主持、傾聽、調解和為行為負責，不按性別先分配角色。','哪項最能結合兩段論證？',[
    '以共同練習與個人責任培養和平行為，避免把關懷義務或暴力藉口按性別分配',
    '只讓某性別練習傾聽，因另一性別天生不可能學會',
    '活動中一旦出現爭論，便只能歸咎於天性',
    '只要角色輪替，所有學生便一定即時做出完全相同決定',
  ],[
    '這同時處理社會訓練和責任分配，符合結論的培養論。',
    '學習機會不應依性別本質化。',
    '爭論還需看情境與選擇。',
    '輪替提供機會，不保證同一結果。',
  ],[4,7,8,9,11,14],'範文以社會訓練解釋表現，並說和平透過教育、文化和個人責任培養。'),
];
const reviewedTransferOptions=[
  ['不同獎勵可教出不同表達，不等於天生性格','女生少爭論，便證明她們天生沒有意見','男生受讚賞，便證明他們出生就很強勢','教室有規則，所有人便不能再作選擇'],
  ['把照顧工作當性別義務，會增添不公平負擔','女性一出生，便必須無薪承擔全部照顧','工作叫關懷，便完全不用考慮公平分配','企業對男性責任與性別標籤毫無關係'],
  ['不把暴力當性別本能，仍追究個人行為責任','男孩作出暴力行為，便可認定自然無害','有人暴力，所有男孩便必定有同一性格','談到教養，個人便完全不用為行為負責'],
  ['預設女性天生溫柔，會錯把堅定表態當異常','女性表達政治立場，便證明她不關心人','只有男性才可能對公共政策有堅定意見','任何批評政策的行為，都屬於實際暴力'],
  ['男性也可關懷調解，不把和平行為專屬女性','一位男教師耐心，便證明所有男性相同','教師是男性，調解行為便不算真正關懷','只有天生傾向，才能解釋他每一個選擇'],
  ['看價值、處境與選擇，不憑性別預設決定','她作過嚴格決策，便永遠沒有關懷能力','她關心朋友，便不能作任何強硬決定','女性領袖必然作出與她完全相同的選擇'],
  ['一次爭勝不證明天性，還要查教導與情境','標題提及性別，便自動證明因果正確','男孩爭勝，便證明女孩從來不想贏','一次比賽足以推定每個人的終身性格'],
  ['不同期望或教出不同的衝突處理方式','女兒日後安靜，便證明出生前不能爭辯','兒子日後強勢，便證明男性天生暴力','家長反覆教導，絕不影響孩子說話方式'],
  ['調解可靠教育培養，不能只憑性別選人','女性不需訓練，便一定能有效調解','男性即使受訓，也不能營造平靜環境','調解只由出生時的生理特徵決定'],
  ['女生被加照顧義務，男生暴力卻可能獲開脫','性別規則使每個隊員責任完全相同','教練說暴力正常，便毋須再作任何評估','女生有不滿，便表示她們毫無關懷能力'],
  ['分清行為與先天原因，再查教育和期望','只要觀察到行為，便不必分析其成因','少量觀察，便足以判定每個人的本性','有替代解釋，男女便不會有行為差異'],
  ['共同練習並追究責任，不按性別分配關懷或藉口','只讓一種性別練傾聽，因另一方完全學不會','一出現爭論，便只能歸咎於個人天生性格','角色一輪替，所有學生便立即作出相同決定'],
];
reviewedTransferOptions.forEach((options,i)=>{transfer[i].options=options;});
const plausibleAlternatives=[
  [['女生少在課上爭論，便先推定她們較少不同意見','男生受讚賞，便把強勢表達主要歸於先天','班規既有差別，便較少查學生自己的選擇'],['安靜表達也可包含不同意見。','獎勵方式是後天影響，不能跳到先天原因。','社會期望與個人選擇都值得看。']],
  [['按女員工較會照顧人的印象，繼續分派無薪工作','工作既稱關懷，便先不核對實際分工是否公平','只查女性工作量，不問男性被免除哪些責任'],['刻板印象不能作無薪分工的依據。','工作名稱不能代替公平分析。','範文指出標籤對男女的責任都有影響。']],
  [['先讓男孩道歉，暫不細查傷害與個人責任','以男孩個案，推測同班男生較易作出暴力','把行為主要歸因教養，較少問本人選擇'],['道歉不等於充分問責。','單一個案不能代表整個性別。','教養重要，但個人責任仍存在。']],
  [['把堅定表態當成較欠關懷的主要線索','先比較男女議員語氣，再決定誰能議政','只看她有否讓步，不查政策主張的內容'],['堅定和關懷可以並存。','議政能力不能由性別化的語氣標準決定。','一項表態不能概括整個人格。']],
  [['把一位男教師的耐心推到其他男性教師','先看教師的性別，再評估調解是否算關懷','把調解表現只歸先天，不查訓練與選擇'],['個例不代表群體。','行為本身可作關懷的證據。','範文也強調環境與個人決定。']],
  [['見她作嚴格決定，便把關懷記錄列為次要','因她關心朋友，便少查她的政策決定','以一位領袖的做法，預測同組女性的選擇'],['不同場合可表現不同特質。','私人關懷不能取代對公共決定的分析。','個例不能代表所有女性。']],
  [['以標題中的性別分類代替對獎勵方式的調查','只記男孩爭勝，不查女孩對比賽的態度','把單次比賽表現當作較穩定的性格線索'],['標題不會自動提供因果證據。','一方行為不足以證明另一方天性。','單次表現不足以定終身特質。']],
  [['按子女日後表達方式，推定差異主要出於天性','兒子爭論較強勢，便把強勢直接當成暴力','先比較出生時氣質，少問反覆教導的內容'],['後天教導是題目已給的關鍵原因。','強勢說話不等於傷害或暴力。','先天傾向不能取代環境分析。']],
  [['按女性身分先選調解員，培訓安排另作考慮','因有男教師能調解，便把每位男性看作相同','先看生理特徵，不查候選人的訓練成果'],['能力應靠培養與實際表現評估。','個別男教師不代表所有男性。','性別不能取代能力和責任。']],
  [['把照顧工作先給女生，再請男生協助較少部分','對男生發怒先作提醒，暫不記錄造成的傷害','女生提出不滿後，便降低對她的關懷評價'],['額外義務仍主要落在女生身上。','提醒不能替代對行為的責任分析。','不滿和關懷能力並不互斥。']],
  [['只列出行為差異，便推定已有足夠先天證據','用少量課堂觀察，概括其他班級的學生','承認可能有差異，便先忽略教導與權力作用'],['觀察與先天因果推論是兩回事。','小樣本不能代表所有個體。','差異也可能由環境造成。']],
  [['按性別給不同傾聽時段，主持角色才輪替','出現爭論時先看性別，較少查具體互動過程','安排輪替後，便不用觀察學生實際學習成效'],['仍按性別分配能力練習。','爭論須看情境、選擇與責任。','機會相同不代表成果可免評估。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
structures[1].example='While girls are sometimes described as quieter than boys, I completely disagree that they are naturally less assertive.';
structures[2].example='In my view, cooperation is shaped far more by family teaching and power than by biological sex.';
structures[4].example='From childhood, children may be taught different roles: some are praised for patience, whereas others are praised for winning.';
structures[5].example='Over time, repeated expectations can become a mask that people mistake for a natural trait.';
structures[6].example='For example, a child repeatedly told not to argue may learn to disagree quietly, while a child praised for winning debates may become more forceful.';
structures[8].example='Moreover, describing mothers as naturally selfless can be harmful because it imposes unfair duties and excuses fathers from caring.';
structures[10].example='At the same time, aggressive men may be treated as if they are following instinct, which lowers what society expects of them.';
structures[11].example='In reality, people of every sex can be kind or harsh depending on values, circumstances and choices.';
structures[14].example='Peace is not written into one gender like a birthmark; it is cultivated through education, culture and responsibility.';
export default {
  key:'opinion:26',
  meta:{topic:'性別刻板印象、和平行為與個人責任',summary:'作者完全反對把女性較和平歸因於天生照顧特質。不同的教養與獎勵可塑造表現；先天標籤亦會不公平要求女性，並可能為男性暴力開脫。和平須由教育、文化與責任培養。'},
  simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,
  mediumExtras:[],
};
