(() => {
  'use strict';

  const briefs = {
    A:{task:'A',number:8,title:'Becoming a Veterinary Nurse',writer:'Joey Wong',reader:'Young people or school leavers',purpose:'Give practical career advice about becoming a veterinary nurse',genre:'Website information page',tone:'Clear, practical and semi-formal',wordGuide:'around 150 words',requiredContent:['What veterinary nurses do and the professional qualities they need','Qualifications and future prospects','Challenges of the work'],structure:['Useful title','Reader-focused introduction','Duties and qualities','Training and prospects','Challenges and balanced close'],submissionTarget:['2014-b2-12-information','2014-b2-13-information-cont']},
    B:{task:'B',number:9,title:'Virtual Pets and their Elderly Owners',writer:'Joey Wong, writing for Kerry Lam',reader:'Visitors attending the hospital open day',purpose:'Introduce virtual pets and explain how and why older people use them',genre:'Open-day speech',tone:'Informative, engaging and suitable for live delivery',wordGuide:'around 150 words',requiredContent:['A brief background on virtual pets','A clear focus on how older people use virtual pets'],structure:['Live greeting','Brief definition and background','Older-user evidence and reasons','Concrete activities','Audience-facing conclusion'],submissionTarget:['2014-b2-14-speech','2014-b2-15-speech-cont']},
    C:{task:'C',number:10,title:'Our Hospital’s Work for Animals and the Community',writer:'Joey Wong',reader:'Editor and readers of the Kowloon Herald',purpose:'Respond to Mr W. Squeers’s criticism and explain all relevant voluntary work',genre:'Formal letter to the editor',tone:'Formal, evidence-led and calmly persuasive',wordGuide:'around 200 words',requiredContent:['Accurately identify Squeers’s criticism','Respond to the ecosystem and disease concerns','Mention all major voluntary and free community work'],structure:['Dear Editor','Purpose and fair summary of criticism','Evidence-led response','Responsible-owner advice','Formal conclusion and sign-off'],submissionTarget:['2014-b2-16-letter','2014-b2-17-letter-cont']}
  };

  const rejected = {
    A:['Canadian college and named interviewees','Rabbit detail and presenter reactions','Unsupported salary or entry requirements'],
    B:['Real exotic-pet motives and animal species','Online shopping, banking and family-tree activities','Any claim that all older users earn money'],
    C:['Snake-buying advice','Unapproved staffing or funding ideas','A claim that exotic pets present no disease risk','Invented exact annual-report figures']
  };
  const checklists = {
    A:['Correct writer, reader and information-page genre','Duties and professional qualities are both covered','Qualifications and future prospects are covered','Challenges are covered realistically','Facts are supported and qualified','A useful title and clear paragraphs are used'],
    B:['Kerry speaks to a live open-day audience','Background is brief and accurate','Older people remain the main focus','Chart evidence is not overinterpreted','Reasons and activities are supported','The supplied title and speech conventions are used'],
    C:['Joey writes to the editor','Squeers’s criticism is represented fairly','All major voluntary work is included','Disease risk is qualified, not denied','Tone is formal, calm and evidence-led','Salutation, sign-off and full name are correct']
  };

  const u = (id, kind, text, why, structure, keywords=[], structurePhrases=[], evidence=[]) => ({id,kind,text,why,structure,keywords,structurePhrases,evidence});
  const models = {
    A:{authority:'',genre:'Website information page',title:'Becoming a Veterinary Nurse',units:[
      u('a01','title','Becoming a Veterinary Nurse','Fulfils the explicit title requirement.','Use a direct, informative title.',[],['Becoming a Veterinary Nurse']),
      u('a02','sentence','If you enjoy caring for animals and want a varied career, veterinary nursing may be for you.','Addresses young career readers immediately.','Conditional reader hook: If you …, … may be for you.',['veterinary nursing'],['If you enjoy caring for animals and want a varied career','may be for you'],['p3-cue-12-like-animals']),
      u('a03','sentence','Veterinary nurses care for and support sick animals.','States the core duty concisely.','Topic sentence before examples.',['care for and support sick animals'],['Veterinary nurses','care for and support'],['p06-student-podcast-007']),
      u('a04','sentence','They learn to handle animals properly and perform varied clinical duties, including minor surgical procedures, taking blood and dental cleaning.','Synthesizes the practical and clinical duties.','Use “including” to introduce selected examples.',['handle animals properly','minor surgical procedures','taking blood','dental cleaning'],['learn to','and perform','including'],['p3-cue-14-handle-animals','p3-cue-15-clinical-duties','p06-student-podcast-011','p06-student-podcast-013']),
      u('a05','sentence','The job also involves people: nurses talk to owners, answer their questions and reply to client emails.','Links communication skills to concrete duties.','Colon introduces a compact explanation.',['talk to owners','answer their questions','reply to client emails'],['also involves people:','talk to','answer','reply to'],['p3-cue-13-communication']),
      u('a06','sentence','You should genuinely like animals and have good communication skills.','Names both essential professional qualities.','“Should” gives practical advice without inventing a rule.',['like animals','good communication skills'],['should genuinely like','and have'],['p3-cue-12-like-animals','p3-cue-13-communication']),
      u('a07','sentence','Full-time degree, diploma and certificate programmes are available.','Covers the available qualification routes.','List parallel qualification types.',['degree','diploma','certificate'],['degree, diploma and certificate programmes','are available'],['p05-course-ad-005','p05-course-ad-006','p05-course-ad-007']),
      u('a08','sentence','They provide practical and communication training and include a six-month internship, which may take place locally or overseas.','Explains course content and preserves location uncertainty.','Relative clause adds a qualified detail.',['practical and communication training','six-month internship','locally or overseas'],['provide','and include','which may take place'],['p05-course-ad-008','p05-course-ad-009']),
      u('a09','sentence','After qualifying, you may specialize in an area such as equine care and work in a horse clinic.','Shows one supported career route.','Time opener + qualified possibility.',['equine care','horse clinic'],['After qualifying','may specialize','such as','and work'],['p05-course-ad-012','p05-course-ad-013']),
      u('a10','sentence','A diploma can also be a first step towards further full-time study to become a vet.','Shows the supported further-study route.','“Can” avoids guaranteeing the outcome.',['further full-time study','become a vet'],['can also be','a first step towards','to become'],['p05-course-ad-015','p05-course-ad-016']),
      u('a11','sentence','The work can be demanding.','Signals a balanced change from benefits to challenges.','Short transition topic sentence.',['demanding'],['can be']),
      u('a12','sentence','New nurses may feel nervous when handling animals, and they must be ready for shift work and being on call at night.','Combines emotional and scheduling challenges.','Balanced compound sentence with careful modals.',['feel nervous','shift work','on call at night'],['may feel nervous','when handling','must be ready for','being on call'],['p06-student-podcast-017','p06-student-podcast-020','p06-student-podcast-021']),
      u('a13','sentence','A sick animal may die, so emotional resilience and a way of coping are important.','Ends with the most serious challenge and its implication.','Cause-and-result close using “so”.',['may die','emotional resilience','a way of coping'],['may die','so','are important'],['p06-student-podcast-023','p06-student-podcast-024'])
    ]},
    B:{authority:'',genre:'Open-day speech',title:'Virtual Pets and their Elderly Owners',units:[
      u('b01','title','Virtual Pets and their Elderly Owners','Uses the supplied title.','Keep the supplied title unchanged.',[],['Virtual Pets and their Elderly Owners']),
      u('b02','salutation','Good morning, everyone.','Establishes a live speech and audience.','Brief spoken greeting.',[],['Good morning, everyone']),
      u('b03','sentence','Today I would like to introduce virtual pets, with a special focus on how older people use them.','Announces the exact topic and focus.','Speech signpost + narrowed focus.',['virtual pets','older people'],['Today I would like to introduce','with a special focus on']),
      u('b04','sentence','A virtual pet is a digital application that simulates owning a real pet online, and its use has grown as internet access has become more widespread and affordable.','Gives the requested brief background.','Definition followed by a concise trend.',['digital application','simulates owning a real pet online','internet access'],['is a digital application that','and its use has grown as','has become more widespread and affordable'],['p07-virtual-jungle-013','p07-virtual-jungle-001']),
      u('b05','sentence','Older users form a substantial part of this community.','Returns attention to the required audience group.','Topic sentence linking background to focus.',['Older users'],['form a substantial part of']),
      u('b06','sentence','In the chart, people over 65 account for 26% of virtual-pet users—more than either the 18–29 or the 30–65 group.','Reports the chart accurately without claiming a majority.','Source frame + exact comparison.',['people over 65','26%'],['In the chart','account for','more than either the 18–29 or the 30–65 group'],['p04-online-today-002']),
      u('b07','sentence','Some older people learn about computers and virtual pets from their grandchildren.','Gives one supported route into the hobby.','“Some” protects against overgeneralization.',['learn about computers and virtual pets','grandchildren'],['Some older people','learn about computers and virtual pets from'],['p07-virtual-jungle-005','p07-virtual-jungle-006']),
      u('b08','sentence','Others want a real pet but live in a building where pets are not allowed, so an online pet provides an alternative.','Explains a second reason causally.','Contrast + cause and result.',['pets are not allowed','online pet provides an alternative'],['Others','where pets are not allowed','so'],['p07-virtual-jungle-010','p07-virtual-jungle-011']),
      u('b09','sentence','Some also say the hobby keeps their minds active.','Adds a qualified personal reason.','Attribution avoids presenting opinion as proven benefit.',['keeps their minds active'],['Some also say','keeps their minds active'],['p05-gamer-004']),
      u('b10','sentence','Their activities are varied: they collect animals, run virtual horse ranches and keep several accounts.','Introduces representative activities.','Colon introduces a grouped list.',['collect animals','virtual horse ranches','several accounts'],['are varied:','collect','run','and keep'],['p05-gamer-002','p05-gamer-005','p05-gamer-007']),
      u('b11','sentence','They may breed pets, arrange exchanges and swap animals they do not have.','Adds supported interactive activities.','“May” avoids a universal claim.',['breed pets','arrange exchanges','swap animals'],['may breed pets, arrange exchanges and swap animals','they do not have'],['p08-elderly-news-010','p08-elderly-news-011','p08-elderly-news-012']),
      u('b12','sentence','Some sell animals to online breeders, while others experiment with cross-breeding to create new “super pets”.','Contrasts two further examples.','Some … while others … pattern.',['sell animals','cross-breeding','super pets'],['Some','while others','to create'],['p08-elderly-news-017','p08-elderly-news-018','p08-elderly-news-019','p08-elderly-news-022','p08-elderly-news-023']),
      u('b13','sentence','Virtual pets can therefore help older people learn, create and share an enjoyable interest.','Synthesizes the examples without adding a medical claim.','Evidence-led conclusion using “therefore”.',['learn, create and share'],['can therefore help','learn, create and share'],['p05-gamer-004','p07-virtual-jungle-005','p08-elderly-news-010','p08-elderly-news-022']),
      u('b14','sentence','They are clearly not only for the young.','Returns to the older-user focus.','Short emphatic summary.',['not only for the young'],['clearly','not only for the young']),
      u('b15','signoff','Thank you.','Closes the speech naturally.','Concise oral sign-off.',[],['Thank you'])
    ]},
    C:{authority:'',genre:'Formal letter to the editor',title:'Our Hospital’s Work for Animals and the Community',units:[
      u('c01','salutation','Dear Editor,','Addresses the newspaper editor, not Mr Squeers.','Formal salutation for an unnamed editor.',[],['Dear Editor']),
      u('c02','sentence','I am writing in response to Mr W. Squeers’s letter, which claims that Kowloon Exotic Pets Hospital supports the exotic-pet trade and cares only about money.','States the purpose and attributes the claim accurately.','Formal purpose statement + reporting clause.',['supports the exotic-pet trade','cares only about money'],['I am writing in response to','which claims that','and cares only about money'],['p09-squeers-letter-003','p09-squeers-letter-005','p09-squeers-letter-008']),
      u('c03','sentence','He also raises concerns about released animals damaging the ecosystem and diseases endangering the public.','Completes the fair summary of criticism.','“Also” adds two parallel concerns.',['damaging the ecosystem','diseases endangering the public'],['also raises concerns about','released animals damaging the ecosystem','diseases endangering the public'],['p09-squeers-letter-009','p09-squeers-letter-011','p09-squeers-letter-012']),
      u('c04','sentence','Our record shows that the hospital works against irresponsible trade.','Begins the rebuttal with an evidence-led claim.','Topic sentence framed by records.',['works against irresponsible trade'],['Our record shows that']),
      u('c05','sentence','During the last financial year, two full-time hospital vets volunteered with the AFCD and assisted its vets in raids on pet shops across Hong Kong concerning crimes related to exotic pets.','Gives precise enforcement-support evidence.','Time frame + who + action + purpose.',['two full-time hospital vets','volunteered with the AFCD','raids on pet shops'],['During the last financial year','volunteered with the AFCD and assisted its vets','concerning crimes related to exotic pets'],['p10-annual-report-015','p10-annual-report-016','p10-annual-report-017','p10-annual-report-018','p10-annual-report-019','p10-annual-report-020']),
      u('c06','sentence','The hospital also launched Operation Gar eight months ago.','Introduces the ecological programme.','“Also” adds a new evidence branch.',['Operation Gar','eight months ago'],['also launched','eight months ago'],['p07-hk-times-004','p07-hk-times-005']),
      u('c07','sentence','Staff volunteer to relocate alligator gars to Ocean Park.','States the voluntary action.','Direct subject–action–destination sentence.',['relocate alligator gars','Ocean Park'],['volunteer to relocate','to Ocean Park'],['p07-hk-times-006','p07-hk-times-008']),
      u('c08','sentence','These non-native fish may be released when they grow too large, eat local fish and reduce native fish populations.','Explains the ecological chain cautiously.','Qualified cause chain.',['non-native fish','eat local fish','reduce native fish populations'],['may be released','when they grow too large','eat local fish and reduce native fish populations'],['p07-hk-times-010','p07-hk-times-011','p07-hk-times-012']),
      u('c09','sentence','We also work with the AFCD on free workshops about the ecological damage caused by releasing exotic pets.','Adds preventive public education.','“Also” links action to the same concern.',['free workshops','ecological damage'],['also work with','on free workshops about','caused by'],['p07-hk-times-013','p07-hk-times-014']),
      u('c10','sentence','Our volunteers recently helped at an AFCD open day, where the hospital provided an educational exhibition.','Adds another education activity.','Relative clause explains the contribution.',['AFCD open day','educational exhibition'],['recently helped at','where the hospital provided'],['p11-neelay-email-001','p11-neelay-email-002','p11-neelay-email-004']),
      u('c11','sentence','In addition, the free Orphan Programme accepts unwanted exotic pets, cares for them until new homes are found and helps prevent their release into the wild.','Groups the free programme’s three functions.','Addition linker + parallel verbs.',['free Orphan Programme','new homes','prevent their release'],['In addition','accepts','cares for them until','and helps prevent'],['p09-telegraph-005','p09-telegraph-006','p09-telegraph-007','p09-telegraph-009','p09-telegraph-011']),
      u('c12','sentence','The programme handled more than 100 cases in 2013.','Uses the defensible chart threshold.','Brief quantitative support.',['more than 100 cases','2013'],['handled more than 100 cases','in 2013'],['p10-annual-report-002','p10-annual-report-011']),
      u('c13','sentence','Owners who can no longer keep a pet must not release it into the wild.','Gives the central responsible-owner instruction.','Relative clause + firm prohibition.',['must not release it into the wild'],['who can no longer keep a pet','must not release it'],['p3-cue-16-no-release']),
      u('c14','sentence','They can return it to the shop or contact our hospital.','Provides two actionable alternatives.','Can … or … alternatives.',['return it to the shop','contact our hospital'],['can return','or contact'],['p3-cue-17-return-shop','p3-cue-18-contact-hospital']),
      u('c15','sentence','The Orphan Programme has provided this free service for ten years.','Adds duration and reinforces that the service is free.','Present perfect + duration.',['free service','ten years'],['has provided','for ten years'],['p3-cue-19-orphan-programme','p3-cue-20-ten-years']),
      u('c16','sentence','As for disease, the AFCD advises that incidence associated with exotic pets is low when the animals are handled carefully.','Answers the safety concern with the qualification intact.','Topic shift + attributed, conditional claim.',['incidence','low','handled carefully'],['As for disease','advises that','associated with exotic pets','when the animals are handled carefully'],['p11-neelay-email-005','p11-neelay-email-006','p11-neelay-email-007']),
      u('c17','sentence','Accurate public education, rather than alarm, is therefore essential.','Draws a restrained implication.','Rather than contrast + therefore conclusion.',['public education'],['rather than alarm','is therefore essential']),
      u('c18','sentence','These free services, voluntary operations and educational efforts contradict the suggestion that our only concern is profit.','Synthesizes the rebuttal evidence.','Three-part summary + controlled rebuttal.',['free services','voluntary operations','educational efforts'],['These free services, voluntary operations and educational efforts','contradict the suggestion that'],['p09-telegraph-011','p10-annual-report-018','p11-neelay-email-002']),
      u('c19','sentence','We remain committed to animal welfare, public safety and Hong Kong’s ecosystem.','Ends with a balanced institutional commitment.','Formal three-part closing statement.',['animal welfare','public safety','Hong Kong’s ecosystem'],['remain committed to','animal welfare, public safety and Hong Kong’s ecosystem']),
      u('c20','signoff','Yours faithfully,','Uses the correct sign-off after “Dear Editor”.','Formal unnamed-recipient sign-off.',[],['Yours faithfully']),
      u('c21','name','Joey Wong','Identifies the required writer.','Full-name signature.',[],['Joey Wong'])
    ]}
  };
  const teachingZh={
    A:[
      ['直接回應題目明確要求的標題。','「Becoming + 職業名稱」以動名詞片語作標題，直接指向「成為某職業」的升學及就業主題。'],
      ['一開始便對準正在考慮升學及就業的年輕讀者。','「If + 現在式，主句 + may」構成真實條件句；may be for you 保留選擇空間，適合直接對讀者說話。'],
      ['先用一句話概括獸醫護士的核心職責。','「複數職業名稱 + care for and support + 受詞」用兩個平行動詞概括核心職能。'],
      ['把處理動物及臨床工作綜合成一個完整內容點。','「learn to + V1 and V2」共用 to；including + 名詞／動名詞清單補充例子，不必另開新句。'],
      ['把溝通能力連繫到實際工作。','「also involves people:」把焦點由動物延伸至人；冒號後以 talk to／answer／reply to 三個平行動詞列舉。'],
      ['同時交代兩項重要專業素質。','「should + 原形動詞」提出合宜建議；like… and have… 以平行動詞連接態度與能力。'],
      ['涵蓋資料提供的三種資歷途徑。','「A, B and C + are available」用平行名詞列出三種課程，並以被動式客觀說明現有選擇。'],
      ['說明課程內容，並保留實習地點的不確定性。','「provide… and include…」並列兩項課程內容；非限定關係子句 which may take place… 補充實習地點並保留不確定性。'],
      ['提出一條有來源支持的就業方向。','「After + V-ing」是省略主語的時間狀語；may specialize… and work… 並列兩個可能發展，such as 用來引例。'],
      ['提出一條有來源支持的進修方向。','「can… be a first step towards + 名詞／V-ing」表示可能途徑；to become… 說明最終目的，並非保證。'],
      ['由好處自然轉入工作挑戰，使內容平衡。','「can be + 形容詞」以情態動詞降低斷言力度；短句獨立成段，清楚轉入挑戰。'],
      ['綜合情緒及輪班兩類挑戰。','「may…, and must…」並列可能感受與必要準備；when／for 後接 V-ing，保持動詞形式正確。'],
      ['以最嚴重的挑戰及所需應對能力作結。','「may + 動詞，so + 結果」先保留可能性，再以 so 引出所需能力；複數主語對應 are important。']
    ],
    B:[
      ['沿用題目指定的標題。','「A and their B」以 and 連接主題與特定使用者；their 建立「虛擬寵物—長者擁有者」的關係。'],
      ['建立現場演講及聽眾關係。','「Good morning, everyone.」是面向全體現場聽眾的完整問候；逗號分隔稱呼語 everyone。'],
      ['直接宣布主題，並收窄至長者這個指定焦點。','「Today I would like to + 動詞」禮貌宣布演講主題；with a special focus on + how 子句收窄焦點。'],
      ['提供題目要求的簡短背景。','「A is + 類別 + that 子句」先定義再說功能；and 連接發展趨勢，as + 現在完成式交代背景原因。'],
      ['由一般背景帶回長者這個核心對象。','「主語 + form a substantial part of + 群體」表示佔有重要部分，但不等於多數。'],
      ['準確報告圖表，不誇大為多數。','「In the chart」先標明數據來源；account for + 百分比報告比例，破折號後以 more than either A or B 作精確比較。'],
      ['提出長者接觸虛擬寵物的一個有據途徑。','「Some + 複數名詞」限定只是一部分；learn about A and B from C 清楚交代學習內容及來源。'],
      ['以因果關係解釋另一個使用原因。','「Others… where…, so…」先以 where 關係副詞限定住所，再用 so 引出替代方案的結果。'],
      ['加入一個經說話者歸因的個人理由。','「Some also say + 名詞子句」把功效歸因於部分使用者；keeps + 受詞 + 形容詞採用「使役動詞 + 受詞補語」。'],
      ['先概括活動多樣，再列出具代表性的例子。','「主題句 + 冒號 + 三個平行動詞」：collect／run／keep 共用主語 they，令例子緊湊。'],
      ['補充有來源支持的互動活動。','「may + 三個平行動詞」列出可能活動；they do not have 是省略關係代詞 that 的限定子句，修飾 animals。'],
      ['對照兩類進一步例子。','「Some…, while others…」對照兩組使用者；to create… 是目的不定詞，說明 cross-breeding 的目的。'],
      ['綜合前文例子，但不新增醫療功效。','「can therefore help + 受詞 + 原形動詞」以 therefore 總結因果；learn／create／share 是三個平行原形動詞。'],
      ['再次扣回長者焦點。','「clearly」作評註副詞加強總結；not only 表示「不只」，反駁虛擬寵物只屬年輕人的假設。'],
      ['自然結束現場演講。','「Thank you.」是演講常用獨立結語；短句在口語中清楚提示完結。']
    ],
    C:[
      ['正確寫給報章編輯，而不是直接寫給 Squeers。','「Dear + 職銜，」是未具名專業收件人的正式稱呼；逗號後另起正文。'],
      ['交代寫信目的，並把指控清楚歸於來信者。','「I am writing in response to…」正式交代來信目的；which claims that… 是非限定關係子句，並以 supports… and cares… 平行轉述兩項指控。'],
      ['完整而公平地概括其餘兩項批評。','「also raises concerns about + 名詞片語」補充批評；released animals damaging… 與 diseases endangering… 是兩個平行「名詞 + -ing 分詞」片語。'],
      ['以可核實紀錄開始反駁。','「Our record shows that + 子句」以證據來源作主語；that 子句承載可由後文證明的主張。'],
      ['提供精確的協助執法證據。','「During + 時段」前置時間框架；主句以 volunteered… and assisted… 並列行動，concerning… 後置限定罪行範圍。'],
      ['引入醫院保護生態的另一項工作。','「also + 一般過去式」加入另一項已發生的行動；eight months ago 以 ago 配合過去式交代時間。'],
      ['清楚交代義工行動及目的地。','「volunteer to + 原形動詞」表示自願行動；to Ocean Park 是方向介詞片語，交代遷移目的地。'],
      ['審慎解釋完整生態因果鏈。','「may be + 過去分詞」是保留可能性的情態被動；when 子句共用 they，並列 grow／eat／reduce 三個動詞。'],
      ['加入預防性公眾教育工作。','「work with + 機構 + on + 項目」交代合作對象與項目；caused by… 是過去分詞片語，後置修飾 damage。'],
      ['補充另一項教育活動。','「recently + 一般過去式」交代近期事件；非限定 where 子句補充 open day 上醫院的貢獻。'],
      ['把免費計劃的三項功能綜合在同一句。','「In addition」承接上一項服務；accepts／cares／helps 三個平行動詞共用主語，until 子句說明照顧期限。'],
      ['使用圖表可支持的數量下限。','「handled + 數量 + in + 年份」用一般過去式報告已完成年度數據；more than 表示可證明的下限。'],
      ['提出負責任飼主最重要的禁令。','「Owners who…」以限定關係子句界定對象；must not + 原形動詞表達明確禁令。'],
      ['提供兩個可行替代方法。','「can A or B」用情態動詞及 or 提供兩個可行選擇；return… 與 contact… 是平行動詞片語。'],
      ['補充服務年期，並再次強調免費。','「現在完成式 has provided + for + 時段」表示服務由過去延續至今；this free service 回指前文。'],
      ['保留原來源的條件，審慎回應疾病風險。','「As for + 名詞」轉換議題；advises that… 把判斷歸因於 AFCD，when 子句保留處理得當的條件。'],
      ['從有限證據推導克制的結論。','「A, rather than B, is…」以 rather than 插入對照；therefore 置於 be 動詞前，標示由前文推論的結論。'],
      ['綜合各項反證，回應只求牟利的說法。','「A, B and C + 複數動詞」以三項平行名詞總結證據；the suggestion that… 用 that 子句說明被反駁的內容。'],
      ['以平衡的機構承諾作結。','「remain committed to + 三個平行名詞」以正式承諾收結；to 是介詞，後接名詞而非不定詞。'],
      ['配合 Dear Editor 使用正確正式結語。','「Yours faithfully,」用於未具名收件人；與 Dear Editor 配對，逗號後另行署名。'],
      ['保留題目指定寫作者的身分。','「Joey Wong」以「名字 + 姓氏」獨立成署名行；這是信件格式單元，不是完整句子。']
    ]
  };
  for (const task of 'ABC') models[task].units.forEach((unit,index,all)=>Object.assign(unit,{task,ordinal:index+1,total:all.length,why:teachingZh[task][index][0],structure:teachingZh[task][index][1],whyZh:teachingZh[task][index][0],structureZh:teachingZh[task][index][1]}));

  const prompts = {
    A:[['拆解資料頁任務','確認作者、讀者、文類、目的與三項必寫內容。','先把題目合約寫成一行，別急着抄來源。'],['建立內容骨架','用標題、引入、職責與素質、訓練與前景、挑戰與平衡結語組織。','每段只負責一個清楚功能。'],['獨立完成初稿','先用已核實證據寫自己的資料頁。','證據庫是素材，不是可整段照抄的答案。'],['核對事實與語氣','核對三項內容、限定語、網站語氣和約 150 字指引。','刪除無關院校、姓名、兔子故事及任何自創入職條件。']],
    B:[['拆解演講任務','確認 Kerry 是講者、現場訪客是聽眾，並聚焦長者如何使用虛擬寵物。','保留指定標題和演講語氣。'],['建立內容骨架','用問候、簡短背景、長者比例與原因、具體活動、結語組織。','背景要短，長者必須是主角。'],['獨立完成初稿','先寫自己的開放日演講。','用 some、may 等限定語，不把例子寫成人人都做。'],['核對事實與語氣','核對圖表比較、長者原因、活動例子及現場演講感。','不要混入真實奇珍異獸、購物或銀行活動。']],
    C:[['拆解投書任務','確認寫給編輯、回應 Squeers，並涵蓋所有主要義務與免費工作。','準確轉述批評，別直接寫給 Squeers。'],['建立內容骨架','用稱呼、批評摘要、分組反證、飼主建議、疾病限定、結論與署名。','把執法、生態、重置、教育和安全分組。'],['獨立完成初稿','先寫自己的正式投書。','語氣冷靜，以證據回應，不作人身攻擊。'],['核對事實與語氣','核對所有義務工作、疾病限定、稱呼、結語及約 200 字指引。','不可把低風險改成零風險，也不可虛構數字。']]
  };

  const steps=[];
  for(const task of 'ABC'){
    prompts[task].forEach(([title,lead,hint],index)=>steps.push({id:`writing-${task}-${index}`,task,kind:'writing-prompt',promptIndex:index,title:`Task ${task} · ${title}`,lead,hint,sourcePage:`Stage 5 · Task ${task}`}));
    for(const unit of models[task].units){
      const base={task,unitId:unit.id,ordinal:unit.ordinal,kind:'model-unit',title:`Task ${task} 範文 · ${unit.kind==='sentence'?`第 ${unit.ordinal} 句`:unit.text}`,sourcePage:models[task].authority};
      steps.push({...base,id:`essay-${task}-${unit.ordinal}`});
      unit.evidence.forEach((evidenceId,sourceIndex)=>{
        steps.push({...base,id:`essay-source-${task}-${unit.ordinal}-${sourceIndex}`,kind:'essay-source',evidenceId,sourceIndex,title:`Task ${task} · 核對原文`});
        steps.push({...base,id:`essay-return-${task}-${unit.ordinal}-${sourceIndex}`,kind:'essay-return',evidenceId,sourceIndex,title:`Task ${task} · 回到範文${unit.kind==='sentence'?`第 ${unit.ordinal} 句`:''}`});
      });
    }
  }
  if(steps.length)steps[steps.length-1].final=true;
  window.EDMUND_2014_B2_CURATION_STAGE5=Object.freeze({version:'2014-b2-super-curation-stage5-v3',authority:'',briefs:Object.freeze(briefs),checklists:Object.freeze(checklists),models:Object.freeze(models),rejected:Object.freeze(rejected),prompts:Object.freeze(prompts),steps:Object.freeze(steps)});
})();
