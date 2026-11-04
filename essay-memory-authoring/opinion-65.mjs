// Raw source fragments in the introduction form one complete second sentence.
const simple=[
  'Computer translation is now common in everyday life, and it can change many pieces of writing into another language in seconds.',
  'But I strongly disagree that this makes learning another language useless: a language does more than help us understand words; it also shapes how we think, make friends, and take part in another way of life.',
  'First, however easy it is to use, computer translation cannot take the place of truly understanding another person.',
  'Many things people say carry a feeling, a joke, a level of respect, or an idea from their culture that you cannot see by reading only the exact words.',
  'A phone may change a sentence into another language correctly, but it may still miss whether the person sounds friendly, mocking, very polite, or rude.',
  'For example, a traveller who uses only an app may understand a food list, but may still miss local ways of behaving or how strongly people feel about certain words.',
  'So translation is like a map: it helps you find the way, but it cannot show everything you would see if you were there.',
  'Knowing the language helps people speak with others in a more natural and respectful way.',
  'Second, studying another language gives people useful skills for school and work that last for a long time.',
  'It helps people think in different ways, pay closer attention when others speak, and explain their own ideas more clearly.',
  'These abilities are useful in many places, not only when studying a language.',
  'At work, for example, someone who speaks to clients in other countries without help often gains more trust than someone who must stop after each sentence to use a device.',
  'Speaking directly builds trust, saves time, and helps people feel closer, especially when making agreements, answering questions in interviews, or working with others.',
  'Even as devices get better, people who know another language will still benefit because they can speak without a screen coming between them and other people.',
  'In short, I strongly disagree that learning other languages is a waste of time.',
  'Computers can help us speak across languages, but they cannot replace knowing another culture, feeling able to speak, and connecting with people directly.',
];
const vocabulary=[
  [['Translation software','Computer translation','翻譯軟件'],['ordinary part of daily life','common in everyday life','日常生活普通一部分'],['convert many texts','change many pieces of writing into another language','轉換許多文本'],['within seconds','in seconds','數秒內']],
  [['However','But','然而'],['completely disagree','strongly disagree','完全不同意'],['foreign-language learning pointless','learning another language useless','外語學習無意義'],['decoding words','understand words','解讀文字'],['way of thinking','shapes how we think','思考方式'],['building relationships','make friends','建立關係'],['participating in another culture','take part in another way of life','參與另一文化']],
  [['first reason','First','第一原因'],['however convenient','however easy it is to use','無論多方便'],['cannot replace','cannot take the place of','不能取代'],['genuine human understanding','truly understanding another person','真正人類理解']],
  [['expressions','things people say','表達'],['tone','feeling','語氣'],['humour','joke','幽默'],['politeness','level of respect','禮貌'],['cultural assumptions','idea from their culture','文化假設'],['literal meaning of words','exact words','字面意思']],
  [['device','phone','裝置'],['translate a sentence accurately','change a sentence into another language correctly','準確翻譯一句'],['speaker','person','說話者'],['warm','friendly','親切'],['sarcastic','mocking','諷刺'],['formal','very polite','正式']],
  [['tourist','traveller','遊客'],['relies entirely on a translation app','uses only an app','完全依賴翻譯程式'],['restaurant menu','food list','餐廳菜單'],['local etiquette','local ways of behaving','當地禮儀'],['emotional weight of certain phrases','how strongly people feel about certain words','短語情感分量']],
  [['In this sense','So','從這意義上'],['translation is like a map','translation is like a map','翻譯如地圖'],['useful for direction','helps you find the way','有助指路'],['unable to recreate the full landscape','cannot show everything you would see if you were there','不能重現全貌']],
  [['Learning the language','Knowing the language','學習語言'],['engage with others','speak with others','與他人交流'],['more naturally','more natural','更自然'],['respectfully','respectful','更有尊重']],
  [['Another reason','Second','另一原因'],['studying a foreign language','studying another language','學習外語'],['lasting educational and professional benefits','useful skills for school and work that last for a long time','長遠教育與職業好處']],
  [['trains people','helps people','訓練人'],['think more flexibly','think in different ways','更靈活思考'],['listen more carefully','pay closer attention when others speak','更仔細聆聽'],['express ideas with greater precision','explain their own ideas more clearly','更精準表達']],
  [['These skills','These abilities','這些能力'],['valuable far beyond','useful in many places, not only','遠超出'],['language classroom','studying a language','語言課堂']],
  [['In the workplace','At work','職場'],['overseas clients','clients in other countries','海外客戶'],['can speak directly to overseas clients','speaks to clients in other countries without help','直接與海外客戶交談'],['more trusted','gains more trust','更獲信任'],['pause after every sentence','stop after each sentence','每句後停下'],['machine','device','機器']],
  [['Direct communication','Speaking directly','直接溝通'],['creates confidence','builds trust','建立信心'],['speed','saves time','速度'],['stronger human connection','helps people feel closer','更強人際連結'],['negotiations','making agreements','談判'],['teamwork','working with others','團隊合作']],
  [['Even if technology improves','Even as devices get better','即使科技進步'],['have an advantage','benefit','有優勢'],['communicate','speak','溝通'],['digital wall standing between them and others','screen coming between them and other people','數碼牆隔開彼此']],
  [['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['foreign languages','other languages','外語'],['waste of time','waste of time','浪費時間']],
  [['support communication','help us speak across languages','支援溝通'],['cannot replace','cannot replace','不能取代'],['cultural understanding','knowing another culture','文化理解'],['personal confidence','feeling able to speak','個人信心'],['human connection','connecting with people directly','人際連結']],
];
const chunkOverrides=[
  ['Translation software has become an ordinary part of daily life,','and it can now convert many texts within seconds.'],
  ['However, I completely disagree that this makes foreign-language learning pointless,','because a language is not only a tool for decoding words; it is also a way of thinking, building relationships and participating in another culture.'],
  ['The first reason is that computer translation, however convenient,','cannot replace genuine human understanding.'],
  ['Many expressions carry tone, humour, politeness and cultural assumptions','that are hidden behind the literal meaning of words.'],
  ['A device may translate a sentence accurately on the surface,','but it may still miss whether the speaker is being warm, sarcastic, formal or rude.'],
  ['For example, a tourist who relies entirely on a translation app may understand a restaurant menu,','but they may still fail to notice local etiquette or the emotional weight of certain phrases.'],
  ['In this sense, translation is like a map:','useful for direction, but unable to recreate the full landscape.'],
  ['Learning the language allows people','to engage with others more naturally and respectfully.'],
  ['Another reason is that studying a foreign language','brings lasting educational and professional benefits.'],
  ['It trains people to think more flexibly, listen more carefully','and express ideas with greater precision.'],
  ['These skills are valuable','far beyond the language classroom.'],
  ['In the workplace, for instance, an employee who can speak directly to overseas clients is often more trusted','than someone who must pause after every sentence to use a machine.'],
  ['Direct communication creates confidence, speed and a stronger human connection,','especially in negotiations, interviews or teamwork.'],
  ['Even if technology improves, people who know another language will still have an advantage','because they can communicate without a digital wall standing between them and others.'],
  ['In conclusion, I completely disagree','that learning foreign languages is a waste of time.'],
  ['Computers can support communication,','but they cannot replace the cultural understanding, personal confidence and human connection that language learning provides.'],
];
const simpleChunkOverrides=[
  ['Computer translation is now common in everyday life,','and it can change many pieces of writing into another language in seconds.'],
  ['But I strongly disagree that this makes learning another language useless:','a language does more than help us understand words; it also shapes how we think, make friends, and take part in another way of life.'],
  ['First, however easy it is to use, computer translation','cannot take the place of truly understanding another person.'],
  ['Many things people say carry a feeling, a joke, a level of respect, or an idea from their culture','that you cannot see by reading only the exact words.'],
  ['A phone may change a sentence into another language correctly,','but it may still miss whether the person sounds friendly, mocking, very polite, or rude.'],
  ['For example, a traveller who uses only an app may understand a food list,','but may still miss local ways of behaving or how strongly people feel about certain words.'],
  ['So translation is like a map:','it helps you find the way, but it cannot show everything you would see if you were there.'],
  ['Knowing the language helps people','speak with others in a more natural and respectful way.'],
  ['Second, studying another language','gives people useful skills for school and work that last for a long time.'],
  ['It helps people think in different ways, pay closer attention when others speak,','and explain their own ideas more clearly.'],
  ['These abilities are useful in many places,','not only when studying a language.'],
  ['At work, for example, someone who speaks to clients in other countries without help often gains more trust','than someone who must stop after each sentence to use a device.'],
  ['Speaking directly builds trust, saves time, and helps people feel closer,','especially when making agreements, answering questions in interviews, or working with others.'],
  ['Even as devices get better, people who know another language will still benefit','because they can speak without a screen coming between them and other people.'],
  ['In short, I strongly disagree','that learning other languages is a waste of time.'],
  ['Computers can help us speak across languages,','but they cannot replace knowing another culture, feeling able to speak, and connecting with people directly.'],
];
const F=(formula,meaning,usage,parts)=>({formula,meaning,usage,parts});
const S=(example,answerReason,distractorReason,distractors,frame)=>({example,answerReason,distractorReason,distractors,frame});
const structures=[
  S('Online banking has become an ordinary part of daily life, and it can now move money within seconds.','and 把普及程度與速度連成背景，為下一句的限制作鋪墊。','速度快是作者承認的好處，不是全文結論。',[1,2,8],F('[技術] has become an ordinary part of daily life, and it can now [迅速完成任務]','先承認新工具普及且有效率。','題目以新技術取代舊學習為前提時，先準確承認其實際能力。',[['Translation software','slot','技術'],[' has become an ordinary part of daily life, and it can now ','link','已普及且可迅速'],['convert many texts within seconds.','slot','迅速完成任務']])),
  S('However, I completely disagree that this makes art education pointless, because art is not only a tool for decorating walls; it is also a way of thinking, building relationships and participating in another culture.','However 轉入反對；not only...; it is also... 擴大一項學習的意義。','作者承認翻譯有用，但反對由此推得學習無用。',[0,2,14],F('However, I completely disagree that [前述便利] makes [學習] pointless, because [所學] is not only [狹窄功能]; it is also [更廣作用]','直接反對過度推論，並提出較完整的價值範圍。','題目把一項學習縮成單一工具功能時，要指出其更廣的人文作用。',[['However, I completely disagree that ','link','轉折並反對'],['this','slot','前述便利'],[' makes ','link','作出過度推論'],['foreign-language learning','slot','學習'],[' pointless, because ','link','提出反對原因'],['a language','slot','所學'],[' is not only ','link','不只是'],['a tool for decoding words','slot','狹窄功能'],['; it is also ','link','也是'],['a way of thinking, building relationships and participating in another culture.','slot','更廣作用']])),
  S('The first reason is that online lessons, however convenient, cannot replace genuine classroom discussion.','however convenient 插入有限讓步，再用 cannot replace 指不能代替的人類功能。','不是否定電腦翻譯方便，而是界定其邊界。',[1,3,6],F('The first reason is that [工具], however convenient, cannot replace [人的能力]','承認便利，同時指出不可代替的部分。','比較自動工具與人類能力時，要避免把方便誤當完全替代。',[['The first reason is that ','link','提出首因'],['computer translation','slot','工具'],[', however convenient, cannot replace ','link','雖方便仍不能取代'],['genuine human understanding.','slot','人的能力']])),
  S('Many school rules carry history, values, and cultural assumptions that are hidden behind the literal wording.','that are hidden behind... 說明表面文字之外還有語境。','不是說字面意思必然錯誤，而是並不足夠。',[2,4,5],F('Many [表達] carry [語境內容] that are hidden behind [字面內容]','列出機器可能看不到的非字面層次。','要解釋文字正確仍可能漏掉語氣或文化含意時。',[['Many ','link','許多'],['expressions','slot','表達'],[' carry ','link','承載'],['tone, humour, politeness and cultural assumptions','slot','語境內容'],[' that are hidden behind ','link','藏於'],['the literal meaning of words.','slot','字面內容']])),
  S('A report may describe a pupil accurately on the surface, but it may still miss whether the child feels curious, anxious, confident or worried.','may...but may still... 對照表面準確與深層語氣遺漏。','句子沒有宣稱每次翻譯都錯，只說可能錯過微妙之處。',[2,3,5],F('A [工具] may [表面正確], but it may still miss whether [更深層狀態]','將準確度與真正理解分開。','有人只以表面文字準確度判斷工具是否已完全理解時。',[['A ','link','提出工具'],['device','slot','工具'],[' may ','link','可能'],['translate a sentence accurately on the surface','slot','表面正確'],[', but it may still miss whether ','link','卻可能忽略'],['the speaker is being warm, sarcastic, formal or rude.','slot','更深層狀態']])),
  S('For example, a pupil who relies entirely on a dictionary may understand a story, but they may still fail to notice the writer’s humour or the emotional weight of certain phrases.','may understand...but...fail to notice... 以人物例子展示表面懂與真正懂的差別。','例子不要求不用應用程式，只反對完全依賴。',[3,4,6],F('For example, [完全依賴工具的人] may understand [表面內容], but they may fail to notice [文化與情感]','用具體人物證明字面理解可能不足。','已解釋非字面含意後，需要一個使用工具的真實情境時。',[['For example, ','link','舉例'],['a tourist who relies entirely on a translation app','slot','完全依賴工具的人'],[' may understand ','link','可能明白'],['a restaurant menu','slot','表面內容'],[', but they may still fail to notice ','link','卻可能看不到'],['local etiquette or the emotional weight of certain phrases.','slot','文化與情感']])),
  S('In this sense, an exam score is like a map: useful for direction, but unable to recreate the full landscape.','地圖比喻承認指路價值，同時表達不能重現全部經驗。','不是主張翻譯完全無用；前半明說 useful。',[2,4,7],F('In this sense, [工具] is like a map: useful for direction, but unable to recreate the full landscape','以比喻總結工具有用但有界限。','已論述具體限制後，要用一句容易記住的類比概括時。',[['In this sense, ','link','由前文推論'],['translation','slot','工具'],[' is like a map: useful for direction, but unable to recreate the full landscape.','link','有用但不完整的地圖']])),
  S('Learning local customs allows people to engage with others more naturally and respectfully.','allows people to 後直接指出親身學習能帶來的交往品質。','不是只談翻譯出正確詞語，而是互動更自然有禮。',[2,6,8],F('Learning [深層知識] allows people to engage with others more naturally and respectfully','由工具限制轉到親身學習的正面價值。','已指出自動工具不足，需要說明人學會後與他人互動有何不同時。',[['Learning ','link','學習'],['the language','slot','深層知識'],[' allows people to engage with others more naturally and respectfully.','link','使交流更自然有禮']])),
  S('Another reason is that studying music brings lasting educational and social benefits.','Another reason 開第二條理由；lasting 擴展至較長期的學習與工作。','此段不是重複文化語氣，而是另談可轉用能力。',[2,7,9],F('Another reason is that studying [學科] brings lasting [多方面效益]','另起一段提出持久的能力好處。','完成即時人際理解的理由後，要再論長期教育或工作效益時。',[['Another reason is that studying ','link','另一原因：學習'],['a foreign language','slot','學科'],[' brings lasting ','link','帶來長遠'],['educational and professional benefits.','slot','多方面效益']])),
  S('It trains people to observe more carefully, ask better questions and work with greater patience.','三個平行動詞指出能力如何可跨情境使用。','不是只說單字量增加，還包括思考、聆聽和表達。',[8,10,11],F('It trains people to [能力一], [能力二] and [能力三]','把學習的抽象收益拆成三個可使用能力。','主張一門學科有長遠價值時，要具體列出它訓練哪些通用能力。',[['It trains people to ','link','訓練人'],['think more flexibly','slot','能力一'],[', ','link','並列'],['listen more carefully','slot','能力二'],[' and ','link','並列'],['express ideas with greater precision.','slot','能力三']])),
  S('These skills are valuable far beyond the school library.','far beyond 把能力的用途從原來課室推到其他生活場景。','作者接着會給職場例子，不只重複本句。',[8,9,11],F('These skills are valuable far beyond [原本學習場所]','從能力清單過渡到跨場景例子。','已列通用能力，需要提醒讀者它們不限於課堂時。',[['These skills are valuable far beyond ','link','價值遠超'],['the language classroom.','slot','原本學習場所']])),
  S('In the workplace, for instance, an employee who can speak directly to customers is often more trusted than someone who must pause after every sentence to consult a script.','more trusted than 是比較；兩種溝通方式的差別在即時直接性。','不是說使用機器的人必然不值得信任，只談相對優勢。',[9,10,12],F('In the workplace, [直接溝通者] is often more trusted than [須中途依賴工具者]','以工作情境支持直接溝通的優勢。','要展示通用能力在工作中如何比依賴工具更有利時。',[['In the workplace, for instance, ','link','職場例子'],['an employee who can speak directly to overseas clients','slot','直接溝通者'],[' is often more trusted than ','link','通常更獲信任'],['someone who must pause after every sentence to use a machine.','slot','須中途依賴工具者']])),
  S('Group practice creates confidence, speed and a stronger human connection, especially in performances, interviews or teamwork.','三項結果後再列特別重要的情境，說明為何直接互動有價值。','此句不是單靠速度衡量，更包括信任與人際連結。',[9,11,13],F('[直接互動] creates [三項效益], especially in [特定高互動情境]','由個別職場例子抽出一般互動好處。','例子已展示直接交流後，要概括它在哪些需要互信的情境特別有用時。',[['Direct communication','slot','直接互動'],[' creates ','link','帶來'],['confidence, speed and a stronger human connection','slot','三項效益'],[', especially in ','link','尤其在'],['negotiations, interviews or teamwork.','slot','高互動情境']])),
  S('Even if tools improve, teachers who know their pupils will still have an advantage because they can respond without a screen between them and students.','Even if 承認技術進步；will still 把人類能力的優勢保留。','作者不是預測翻譯工具永不改善。',[2,11,12],F('Even if [技術改善], [具直接能力的人] will still have an advantage because [無數碼屏障的行動]','在承認技術進步的條件下重申人的優勢。','對方相信工具將持續改進時，要說明即使如此哪些能力仍有價值。',[['Even if ','link','即使'],['technology improves','slot','技術改善'],[', ','link','仍'],['people who know another language','slot','具直接能力的人'],[' will still have an advantage because ','link','仍有優勢，因為'],['they can communicate without a digital wall standing between them and others.','slot','無數碼屏障的行動']])),
  S('In conclusion, I completely disagree that learning first aid is a waste of time.','結論直接回應「浪費時間」的說法，維持反對立場。','不是變成只承認部分用處；結論仍 completely disagree。',[1,2,15],F('In conclusion, I completely disagree that learning [技能] is a waste of time','末段直接答回題目價值判斷。','題目問一種學習是否浪費時間時，結論要清楚重申立場。',[['In conclusion, I completely disagree that learning ','link','總結反對'],['foreign languages','slot','技能'],[' is a waste of time.','link','不是浪費時間']])),
  S('Online tools can support learning, but they cannot replace the personal guidance, confidence and trust that a good teacher provides.','can support...but cannot replace 清楚定位工具是輔助而非完全替代。','作者沒有要求停止使用電腦；是界定其角色。',[1,6,14],F('[工具] can support [活動], but they cannot replace [人的多種價值] that [親身學習] provides','以輔助與替代的區分結束全文。','結論要同時承認科技用處並保留人的不可替代作用時。',[['Computers','slot','工具'],[' can support ','link','可支援'],['communication','slot','活動'],[', but they cannot replace ','link','卻不能取代'],['the cultural understanding, personal confidence and human connection','slot','人的多種價值'],[' that ','link','由'],['language learning','slot','親身學習'],[' provides.','link','提供']])),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依照原文的推進次序，逐一點選下一步。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[
  Q('作者對「有翻譯軟件便不用學外語」持甚麼立場？',['完全不同意；語言還關乎文化理解、人際連結及能力培養','完全同意；機器已能取代所有人類理解','沒有立場；只討論手機價格','只反對旅行時使用任何翻譯工具'],'引言明言 completely disagree；全文承認工具方便，卻指出其界限。'),
  {type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['字面翻譯可能漏掉語氣、禮儀與文化含意','學語言能訓練思考、聆聽與表達，也有職場價值','所有翻譯結果必定錯誤，連菜單也不能看','學語言只為記住每個單字的中文'],correct:[0,1],why:'主體一比較字面與深層理解；主體二論通用能力與直接交流。'},
];
const route=[sequence('排好全文四段',[
  ['引言 · 工具有用但不夠','承認翻譯軟件速度快，反對把學外語判作無意義。'],
  ['主體一 · 人類理解','語氣、幽默、禮貌及文化可能超出字面；遊客例子和地圖比喻說明限制。'],
  ['主體二 · 長遠能力','語言學習訓練思考、聆聽、表達，直接與海外客戶溝通也有優勢。'],
  ['結論 · 支援不是取代','電腦有助溝通，卻不能取代文化理解、信心和人際連結。'],
],'工具效率 → 字面理解的界限 → 可轉用能力與直接交流 → 輔助但不取代。')];
const evidence=[
  Q('原文承認翻譯軟件能做甚麼？',['在幾秒內翻譯許多文本','完全讀懂每一種語氣','自動建立人際信任','令外語學習沒有任何價值'],'引言先承認 convert many texts within seconds。'),
  Q('哪四種內容可能藏在字面意思之外？',['語氣、幽默、禮貌和文化假設','租金、交通、稅率和住房','速度、儲存、電池和重量','日期、頁數、字體和顏色'],'原文列 tone, humour, politeness and cultural assumptions。'),
  Q('為何表面準確的翻譯仍可能不足？',['仍可能看不出說話者親切、諷刺、正式還是粗魯','因為任何文字都沒有字面意思','因為手機無法顯示完整句子','因為所有談話只有同一種語氣'],'may still miss whether the speaker is being warm, sarcastic, formal or rude。'),
  Q('遊客例子區分哪兩種理解？',['讀懂菜單與察覺當地禮儀、詞句情感','看見餐廳與找到機場方向','閱讀價錢與計算手機電量','訂位時間與餐廳座位數'],'遊客可懂 menu，卻仍可能看不到 etiquette 與 emotional weight。'),
  Q('翻譯被比作地圖，重點是甚麼？',['可以指路，卻無法重現完整景觀','既不能指路，也沒有任何用途','只適合畫出山脈和海岸','能完整取代親身到訪的經驗'],'useful for direction, but unable to recreate the full landscape。'),
  Q('學外語訓練哪三項通用能力？',['靈活思考、仔細聆聽、精準表達','更快打字、更大音量、更長睡眠','提高畫畫、游泳和駕駛速度','只增加字典頁數和手機容量'],'think more flexibly, listen more carefully, express ideas with greater precision。'),
  Q('職場例子比較哪兩種溝通方式？',['直接跟海外客戶談與每句後停下來用機器','用電話談與用電子郵件談','上班早到與工作日遲到','坐在辦公室與在家工作'],'原文比較直接交談與每句後依賴機器。'),
  Q('技術進步後，作者認為學語言者仍有何優勢？',['可不隔着數碼牆與人直接溝通','能保證每次談判都成功','永遠不需要使用任何技術','能立刻懂得全球所有語言'],'Even if technology improves...without a digital wall。'),
];
const logic=[
  sequence('主體一：為何翻譯不能完全代替學習？',[
    ['有限讓步','翻譯方便，卻無法代替真正理解人。'],
    ['語言層次','字面以外有語氣、幽默、禮貌與文化假設。'],
    ['準確仍有限','表面翻對字句，仍可能錯過親切或諷刺。'],
    ['遊客例子','讀懂菜單，不等於懂當地禮儀及情感分量。'],
    ['地圖比喻','可提供方向，無法重現全部景觀。'],
    ['段落收束','親自學語言令交流更自然有禮。'],
  ],'便利 → 非字面層次 → 具體例子 → 有界限的工具 → 親身學習。'),
  sequence('主體二：語言學習有何長遠價值？',[
    ['另一理由','外語學習有教育與職業效益。'],
    ['通用能力','訓練思考、聆聽和精準表達。'],
    ['課堂以外','能力能用於其他生活與工作情境。'],
    ['職場對照','直接與客戶交談者，較常比每句停下用機器者獲信任。'],
    ['一般結果','直接交流建立信心、速度與人際連結。'],
    ['未來反駁','即使技術進步，沒有數碼牆的溝通仍有優勢。'],
  ],'長遠收益 → 可轉用能力 → 職場對照 → 人際結果 → 面對技術進步仍成立。'),
];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
  T('一個導航程式能迅速提供路線，但旅客想真正認識一座城市。','哪項推論最符合本文的地圖比喻？',['導航能幫忙找路，親身走訪才能體會地方生活','導航可帶路，文化體會可由景點評分替代','只要路線清楚，城市生活可留待下次了解','不用導航能多走路，便可自動理解地方'],['承認工具有方向價值，也保留親身經驗。','評分不等於親身生活理解。','路線清楚未呈現文化。','多走路仍需觀察與交流。'],[2,6,7],'translation is like a map；useful for direction, but incomplete。'),
  T('學生用軟件把外國小說翻成中文，字句看似正確，卻不懂主角在開玩笑。','哪項解釋最貼近第一段？',['字面可準，幽默語氣仍需語境理解','中文字句正確，人物幽默可從標點推斷','語氣不明，可先只用詞典逐字對照','小說情節可讀，但幽默可暫不理解'],['surface accuracy 不保證理解 humour。','幽默依賴語境，不只標點。','逐字對照仍可能漏語氣。','幽默是人物意思的一部分。'],[3,4],'literal meaning；tone and humour。'),
  T('醫院的自動訊息可準確傳達預約時間，但病人也需要安慰與尊重。','怎樣套用「可支援但不能取代」的區分？',['自動訊息處理資料，醫護仍須回應人的感受','訊息準確，病人感受可由後續問卷處理','醫護安慰重要，預約資訊可交由家屬','自動工具可傳時間，醫護便只需談治療'],['工具傳資訊，人的互動承載情感。','問卷不能取代當下尊重。','病人仍需準確預約資訊。','醫護回應感受不只治療。'],[1,4,15],'can support communication, but cannot replace...human connection。'),
  T('博物館提供語音導覽，參觀者仍希望與當地藝術家交談。','哪項最能保留兩種方式的價值？',['導覽介紹作品，交談補足創作語境','語音導覽有資訊，藝術家交談可留待日後','藝術家能說創作，可暫停語音導覽','作品名稱記得清楚，創作語境可後查'],['工具與真人交流各有不同作用。','直接交談補語音導覽。','兩種方式可並行。','名稱未說明創作語境。'],[3,7,15],'tool support versus human understanding。'),
  T('職員熟悉外語，能在談判中直接回應客戶；另一位每句都要先查程式。','哪項優勢符合第二段？',['直接回應較流暢，也較容易建立信任與連結','直接回應較快，客戶信任可待合約後看','每句查程式可確保字準，交流停頓可接受','熟悉外語有幫助，文化理解仍可先略過'],['原文將直接交流連到速度、信心及信任。','信任在談判過程中建立。','停頓可能削弱流暢。','文化理解亦影響互動。'],[11,12,13],'more trusted；confidence, speed and human connection。'),
  T('有人說「機器可譯字，因此學語言只是在背同一批字」。','哪項回應最準確？',['語言還涉及思考、關係與文化參與','機器能譯字，語言學習可只練發音','學語言可建立關係，文化參與可另靠導覽','字典有詞條，交談語氣可待使用時再學'],['引言以 not only...also... 擴大學習價值。','語言不只發音和字義。','文化參與與直接互動相關。','語氣宜在交流中練。'],[1,3,7],'not only decoding words；also thinking, relationships, culture。'),
  T('學校評估音樂教育，反對者只問學生以後會否成為職業音樂家。','哪項做法符合文章的通用能力論證？',['檢視音樂如何練聆聽合作與表達','先計職業演奏者人數，再決定課程價值','音樂可練合作，卻不需評估聆聽能力','課堂有表達價值，但只看作品分數'],['不只看單一職業用途，也看可轉用能力。','職業結果不是唯一價值。','合作與聆聽都在課堂中。','分數未涵蓋合作表達。'],[8,9,10],'skills valuable far beyond the classroom。'),
  T('一位求職者用翻譯機完成海外面試，但想改善回答的即時性。','哪項長期策略最接近本文？',['學習對方語言，練習直接聆聽和回應問題','先升級翻譯機，直接回應可在入職後練','背熟答案可減停頓，聆聽可另行練習','先練詞彙，客戶互動可交由機器完成'],['直接聽與答可減少數碼屏障。','工具更新未練即時回答。','面試要聽未預期問題。','客戶互動仍需本人能力。'],[9,11,13],'direct communication without a digital wall。'),
  T('有人認為即使翻譯技術繼續改善，學外語的價值也會歸零。','哪項回應最切合作者的讓步？',['機器更好，直接交流與文化理解仍有價值','機器更快，文化理解可由軟件評分代替','直接交流有益，但語言學習可暫緩','翻譯改善後，只看速度不查語氣信任'],['Even if 承認進步，仍指出人的優勢。','軟件評分不等於文化理解。','技術進步不取消學習價值。','語氣信任是原文重點。'],[1,13,15],'Even if technology improves...still have an advantage。'),
  T('一本教科書能列出禮貌句式，但學生未必懂何時用得自然。','哪項最符合「字面之外」的觀點？',['真實互動可教語氣、場合與關係','句式拼字正確，使用場合可由對方猜測','禮貌句式有用，互動語氣可後期練','只背課本例句，不留意談話關係'],['情境與關係決定表達是否恰當。','合適場合不能靠對方猜。','自然使用需真實練習。','關係影響禮貌說法。'],[3,4,7],'tone, politeness and cultural assumptions。'),
  T('公司只用自動回覆處理投訴，顧客感到自己的情緒被忽略。','依本文邏輯，問題在哪裏？',['訊息可傳資料，卻可能漏掉語氣與人際關懷','回覆快速，情緒照顧可留到投訴升級後','顧客不滿可先加快回覆，語氣不用檢查','人際關懷重要，但資料傳遞可全交機器'],['表面功能有用，深層理解仍可能不足。','投訴當下就需要被理解。','速度不等於關懷。','資料工具與人際回應各有作用。'],[2,3,4,15],'accurate on the surface, but may miss tone。'),
  T('要用一句話概括全文，而不把作者寫成反科技。','哪項最準確？',['電腦可幫忙，學外語仍帶來理解、能力與連結','電腦能幫翻譯，外語學習可只留給專業者','學外語有價值，但只重閱讀菜單與路牌','機器幫忙後，文化信任可另用科技建立'],['工具可支援，學習仍有不可取代的多種價值。','學習價值不只專業用途。','原文還談思考與工作。','科技未必代替人的信任。'],[0,1,2,7,8,9,11,12,13,14,15],'support communication, but cannot replace...。'),
];
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["However, I completely disagree that ","link","句型固定部分"],["this","slot","前述便利"],[" makes ","link","句型固定部分"],["foreign-language learning","slot","受到質疑的學習"],[" pointless, because ","link","句型固定部分"],["a language","slot","所學事物"],[" is not only ","link","句型固定部分"],["a tool for decoding words","slot","被縮窄的功能"],["; it is also ","link","句型固定部分"],["a way of thinking, building relationships and participating in another culture","slot","更廣泛的作用"],[".","link","句型固定部分"]];
structures[1].frame.formula="However, I completely disagree that [前述便利] makes [受到質疑的學習] pointless, because [所學事物] is not only [被縮窄的功能]; it is also [更廣泛的作用].";
export default {key:'opinion:65',meta:{topic:'翻譯軟件是否令外語學習變得無意義',summary:'作者完全不同意。機器能快速翻譯字句，卻可能漏掉語氣、幽默、禮儀及文化假設；遊客看懂菜單仍可能不懂當地互動。外語學習也訓練靈活思考、仔細聆聽與精準表達，直接與海外客戶溝通較易建立信任。電腦可支援交流，不能取代文化理解、信心和人際連結。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
