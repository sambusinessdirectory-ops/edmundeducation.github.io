(function () {
  "use strict";

  const sourcePageOverrides = {
    ss1: {
      numberPage: { 10: 2, 29: 5, 35: 6 },
      starterPage: { 16: 4, 41: 8 },
      answerNumberPage: { 4: 9, 21: 11, 38: 13 }
    },
    ss2: {
      starterPage: { 3: 3, 9: 4, 15: 5, 21: 6, 27: 7, 33: 8, 39: 9, 45: 10 }
    }
  };

  const makeQuestions = (lessonId, rows) => rows.map((row) => {
    const [
      number,
      questionPage,
      answerPage,
      promptEn,
      promptZh,
      firstWordHint,
      answerEn,
      answerZh,
      highlight,
      answerZhSource = "pdf"
    ] = row;
    const pageOverrides = sourcePageOverrides[lessonId] || {};
    return {
      id: `${lessonId}-q${String(number).padStart(2, "0")}`,
      number,
      source: {
        numberPage: pageOverrides.numberPage?.[number] || questionPage,
        questionPage,
        starterPage: pageOverrides.starterPage?.[number] || questionPage,
        answerNumberPage: pageOverrides.answerNumberPage?.[number] || answerPage,
        answerPage
      },
      prompt: promptEn,
      promptZh,
      starter: firstWordHint,
      answer: answerEn,
      answerZh,
      answerZhSource,
      highlight
    };
  });

  const purposeQuestions = makeQuestions("ss1", [
    [1, 1, 9, "I went to the library because I wanted to borrow a book.", "我去了圖書館，因為我想借一本書。", "I", "I went to the library to borrow a book.", "我去圖書館借一本書。", "to borrow a book"],
    [2, 1, 9, "Lily got up early so that she could catch the first bus.", "莉莉早起，以便趕上第一班巴士。", "Lily", "Lily got up early to catch the first bus.", "莉莉早起，以趕上第一班巴士。", "to catch the first bus"],
    [3, 1, 9, "Tom needed to ask a question, so he called his teacher.", "湯姆需要問一個問題，所以他打電話給老師。", "Tom", "Tom called his teacher to ask a question.", "湯姆打電話給老師問一個問題。", "to ask a question"],
    [4, 2, 10, "We went to the supermarket for some fresh fruit.", "我們去超級市場買一些新鮮水果。", "We", "We went to the supermarket to buy some fresh fruit.", "我們去超級市場買一些新鮮水果。", "to buy some fresh fruit"],
    [5, 2, 10, "Mia opened the window because she wanted to get some fresh air.", "米婭打開窗戶，因為她想呼吸一些新鮮空氣。", "Mia", "Mia opened the window to get some fresh air.", "米婭打開窗戶，以呼吸一些新鮮空氣。", "to get some fresh air"],
    [6, 2, 10, "Jack is saving money because he wants to buy a new bicycle.", "傑克正在存錢，因為他想買一輛新單車。", "Jack", "Jack is saving money to buy a new bicycle.", "傑克正在存錢買一輛新單車。", "to buy a new bicycle"],
    [7, 2, 10, "Why did Ben visit the doctor? He wanted to get some advice.", "本為甚麼去看醫生？他想得到一些建議。", "Ben", "Ben visited the doctor to get some advice.", "本去看醫生，以得到一些建議。", "to get some advice"],
    [8, 2, 10, "I use a notebook for writing down new words.", "我使用筆記簿來記下新單字。", "I", "I use a notebook to write down new words.", "我使用筆記簿記下新單字。", "to write down new words"],
    [9, 2, 10, "Emma wore a thick coat because she wanted to stay warm.", "艾瑪穿上厚外套，因為她想保暖。", "Emma", "Emma wore a thick coat to stay warm.", "艾瑪穿上厚外套保暖。", "to stay warm"],
    [10, 3, 10, "The students practised English every day. Their goal was to improve their speaking skills.", "學生每天練習英語。他們的目標是提升口語能力。", "The", "The students practised English every day to improve their speaking skills.", "學生每天練習英語，以提升口語能力。", "to improve their speaking skills"],
    [11, 3, 10, "Sarah joined a cooking class because she wanted to learn how to make Italian food.", "莎拉參加烹飪班，因為她想學習製作意大利菜。", "Sarah", "Sarah joined a cooking class to learn how to make Italian food.", "莎拉參加烹飪班，以學習製作意大利菜。", "to learn how to make Italian food"],
    [12, 3, 10, "David spoke quietly in order that he would not wake the baby.", "大衛輕聲說話，以免吵醒嬰兒。", "David", "David spoke quietly to avoid waking the baby.", "大衛輕聲說話，以免吵醒嬰兒。", "to avoid waking the baby"],
    [13, 3, 11, "This button is for turning on the computer.", "這個按鈕是用來開啟電腦的。", "This", "This button is used to turn on the computer.", "這個按鈕是用來開啟電腦的。", "to turn on the computer"],
    [14, 3, 11, "Why did Amy bring a camera? She wanted to take pictures of the beautiful view.", "艾米為甚麼帶相機？她想拍下美麗的景色。", "Amy", "Amy brought a camera to take pictures of the beautiful view.", "艾米帶了相機，以拍下美麗的景色。", "to take pictures of the beautiful view"],
    [15, 3, 11, "The purpose of this meeting is to discuss our new project.", "這次會議的目的是討論我們的新項目。", "This", "This meeting is being held to discuss our new project.", "這次會議是為了討論我們的新項目而舉行的。", "to discuss our new project"],
    [16, 3, 11, "Kevin went online. His aim was to find information about the museum.", "凱文上網。他的目的是尋找有關博物館的資料。", "Kevin", "Kevin went online to find information about the museum.", "凱文上網，以尋找有關博物館的資料。", "to find information about the museum"],
    [17, 4, 11, "Take an umbrella so that you can stay dry in the rain.", "帶一把雨傘，這樣你便可以在雨中保持乾爽。", "Take", "Take an umbrella to stay dry in the rain.", "帶一把雨傘，以便在雨中保持乾爽。", "to stay dry in the rain"],
    [18, 4, 11, "My mother gave me some money for buying lunch.", "媽媽給了我一些錢買午餐。", "My", "My mother gave me some money to buy lunch.", "媽媽給了我一些錢買午餐。", "to buy lunch"],
    [19, 4, 11, "The team held an extra practice because they hoped to win the next match.", "球隊進行了額外訓練，因為他們希望在下一場比賽中勝出。", "The", "The team held an extra practice to have a better chance of winning the next match.", "球隊進行了額外訓練，以增加在下一場比賽中勝出的機會。", "to have a better chance of winning the next match"],
    [20, 4, 11, "Jason moved closer to the screen. This allowed him to see the words more clearly.", "傑森移近螢幕，這讓他能夠更清楚地看到文字。", "Jason", "Jason moved closer to the screen to see the words more clearly.", "傑森移近螢幕，以更清楚地看到文字。", "to see the words more clearly"],
    [21, 4, 12, "Olivia went to the bank because she needed to open a new account.", "奧莉花去了銀行，因為她需要開設一個新戶口。", "Olivia", "Olivia went to the bank to open a new account.", "奧莉花去銀行開設一個新戶口。", "to open a new account"],
    [22, 4, 12, "The teacher repeated the instructions so that everyone could understand them.", "老師重複了指示，以便每個人都能明白。", "The", "The teacher repeated the instructions to help everyone understand them.", "老師重複了指示，以幫助每個人明白。", "to help everyone understand them"],
    [23, 5, 12, "Henry left the house early so that he would not be late for work.", "亨利提早離開家，以免上班遲到。", "Henry", "Henry left the house early to avoid being late for work.", "亨利提早離開家，以免上班遲到。", "to avoid being late for work"],
    [24, 5, 12, "This machine was designed for cleaning the floor.", "這部機器是為清潔地板而設計的。", "This", "This machine was designed to clean the floor.", "這部機器是為清潔地板而設計的。", "to clean the floor"],
    [25, 5, 12, "With the aim of improving her health, Chloe started exercising three times a week.", "為了改善健康，克洛伊開始每星期做三次運動。", "Chloe", "Chloe started exercising three times a week to improve her health.", "克洛伊開始每星期做三次運動，以改善健康。", "to improve her health"],
    [26, 5, 12, "Why are they decorating the hall? They are going to hold a school party there.", "他們為甚麼正在佈置禮堂？他們打算在那裏舉行學校派對。", "They", "They are decorating the hall to hold a school party there.", "他們正在佈置禮堂，以便在那裏舉行學校派對。", "to hold a school party there"],
    [27, 5, 12, "The police officer stopped the traffic. This allowed the children to cross the road safely.", "警員截停車輛，讓孩子們可以安全地橫過馬路。", "The", "The police officer stopped the traffic to help the children cross the road safely.", "警員截停車輛，以幫助孩子們安全地橫過馬路。", "to help the children cross the road safely"],
    [28, 5, 12, "You should read the question carefully before answering because you need to avoid careless mistakes.", "你應該在作答前仔細閱讀題目，因為你需要避免粗心大意的錯誤。", "You", "You should read the question carefully before answering to avoid making careless mistakes.", "你應該在作答前仔細閱讀題目，以避免犯粗心大意的錯誤。", "to avoid making careless mistakes"],
    [29, 6, 12, "A special room was prepared for the guests to rest in.", "工作人員準備了一個特別的房間，讓客人休息。", "A", "A special room was prepared to give the guests a place to rest.", "工作人員準備了一個特別的房間，讓客人有地方休息。", "to give the guests a place to rest"],
    [30, 6, 13, "Lucy wrote a list of everything she needed. In this way, she would not forget anything at the supermarket.", "露西寫下了所有需要的東西。這樣，她便不會在超級市場遺漏任何東西。", "Lucy", "Lucy wrote a list of everything she needed to avoid forgetting anything at the supermarket.", "露西寫下了所有需要的東西，以免在超級市場遺漏任何東西。", "to avoid forgetting anything at the supermarket"],
    [31, 6, 13, "Noah turned on the desk lamp because he wanted to read more clearly.", "諾亞打開書桌燈，因為他想更清楚地閱讀。", "Noah", "Noah turned on the desk lamp to read more clearly.", "諾亞打開書桌燈，以便更清楚地閱讀。", "to read more clearly"],
    [32, 6, 13, "The museum provides maps so that visitors can find the different rooms easily.", "博物館提供地圖，讓訪客可以輕鬆找到不同的展覽室。", "The", "The museum provides maps to help visitors find the different rooms easily.", "博物館提供地圖，以幫助訪客輕鬆找到不同的展覽室。", "to help visitors find the different rooms easily"],
    [33, 6, 13, "Maya carries a reusable bottle because she wants to reduce plastic waste.", "瑪雅攜帶可重用水瓶，因為她想減少塑膠廢物。", "Maya", "Maya carries a reusable bottle to reduce plastic waste.", "瑪雅攜帶可重用水瓶，以減少塑膠廢物。", "to reduce plastic waste"],
    [34, 6, 13, "The ladder is for reaching the top shelf.", "這把梯子是用來拿取最高層架上的東西的。", "The", "The ladder is used to reach the top shelf.", "這把梯子是用來拿取最高層架上的東西的。", "to reach the top shelf"],
    [35, 7, 13, "Why did Leo set an alarm? He wanted to wake up on time.", "里奧為甚麼設定鬧鐘？他想準時起床。", "Leo", "Leo set an alarm to wake up on time.", "里奧設定鬧鐘，以便準時起床。", "to wake up on time"],
    [36, 7, 13, "The nurse closed the door. This gave the patient more privacy.", "護士關上房門。這讓病人有更多私人空間。", "The", "The nurse closed the door to give the patient more privacy.", "護士關上房門，讓病人有更多私人空間。", "to give the patient more privacy"],
    [37, 7, 13, "With the goal of making fewer spelling mistakes, Grace checked her work twice.", "為了減少串字錯誤，格蕾絲檢查了自己的功課兩次。", "Grace", "Grace checked her work twice to reduce her spelling mistakes.", "格蕾絲檢查了自己的功課兩次，以減少串字錯誤。", "to reduce her spelling mistakes"],
    [38, 7, 14, "The lights were switched off so that electricity would not be wasted.", "燈被關掉，以免浪費電力。", "The", "The lights were switched off to avoid wasting electricity.", "燈被關掉，以免浪費電力。", "to avoid wasting electricity"],
    [39, 7, 14, "Use this key if you need to open the back door.", "如需打開後門，請使用這把鑰匙。", "Use", "Use this key to open the back door.", "使用這把鑰匙打開後門。", "to open the back door"],
    [40, 7, 14, "Ava lowered her voice because she did not want to disturb the people who were reading.", "艾娃降低聲量，因為她不想打擾正在閱讀的人。", "Ava", "Ava lowered her voice to avoid disturbing the people who were reading.", "艾娃降低聲量，以免打擾正在閱讀的人。", "to avoid disturbing the people who were reading"],
    [41, 7, 14, "Ethan went to the customer service desk. He needed to ask for help with his lost bag.", "伊森去了顧客服務處。他需要就遺失的袋子尋求協助。", "Ethan", "Ethan went to the customer service desk to ask for help with his lost bag.", "伊森去顧客服務處，就遺失的袋子尋求協助。", "to ask for help with his lost bag"],
    [42, 8, 14, "The school installed more water fountains so that students could refill their bottles easily.", "學校安裝了更多飲水機，讓學生可以輕鬆地為水瓶加水。", "The", "The school installed more water fountains to make it easier for students to refill their bottles.", "學校安裝了更多飲水機，讓學生可以更輕鬆地為水瓶加水。", "to make it easier for students to refill their bottles"],
    [43, 8, 14, "This shelf is used for displaying the library’s new books.", "這個書架是用來展示圖書館的新書的。", "This", "This shelf is used to display the library’s new books.", "這個書架是用來展示圖書館的新書的。", "to display the library’s new books"],
    [44, 8, 14, "With the intention of making the room brighter, Zoe opened the curtains.", "為了讓房間更加明亮，佐伊拉開了窗簾。", "Zoe", "Zoe opened the curtains to make the room brighter.", "佐伊拉開窗簾，讓房間更加明亮。", "to make the room brighter"],
    [45, 8, 14, "Daniel checked the train timetable because he did not want to miss the last train.", "丹尼爾查看火車時間表，因為他不想錯過尾班車。", "Daniel", "Daniel checked the train timetable to avoid missing the last train.", "丹尼爾查看火車時間表，以免錯過尾班車。", "to avoid missing the last train"],
    [46, 8, 14, "Why did the chef taste the soup? He wanted to check whether it needed more salt.", "廚師為甚麼品嘗湯？他想檢查湯是否需要加更多鹽。", "The", "The chef tasted the soup to check whether it needed more salt.", "廚師品嘗湯，以檢查湯是否需要加更多鹽。", "to check whether it needed more salt"],
    [47, 8, 15, "Emma wrote the instructions step by step. This made them easier for her younger brother to follow.", "艾瑪逐步寫下指示。這使她的弟弟更容易跟從指示。", "Emma", "Emma wrote the instructions step by step to make them easier for her younger brother to follow.", "艾瑪逐步寫下指示，讓她的弟弟更容易跟從。", "to make them easier for her younger brother to follow"],
    [48, 9, 15, "A small bridge was built so that the villagers could cross the river safely.", "人們建造了一座小橋，讓村民可以安全地過河。", "A", "A small bridge was built to help the villagers cross the river safely.", "人們建造了一座小橋，以幫助村民安全地過河。", "to help the villagers cross the river safely"],
    [49, 9, 15, "The purpose of wearing these gloves is to protect your hands from the paint.", "戴上這些手套的目的是保護雙手，避免沾上油漆。", "You", "You should wear these gloves to protect your hands from the paint.", "你應該戴上這些手套，以保護雙手，避免沾上油漆。", "to protect your hands from the paint"],
    [50, 9, 15, "The coach showed the players a video of their previous game. His goal was to help them understand their mistakes.", "教練向球員播放上一場比賽的影片。他的目標是幫助他們了解自己的錯誤。", "The", "The coach showed the players a video of their previous game to help them understand their mistakes.", "教練向球員播放上一場比賽的影片，以幫助他們了解自己的錯誤。", "to help them understand their mistakes"]
  ]);

  const purposeLesson = {
    id: "ss1",
    order: 1,
    slug: "purpose-to-verb",
    title: "「to + 動詞」句型",
    titleEn: "Using ‘to + verb’ to express purpose",
    titleEnSource: "editorial-translation",
    titleZh: "「to + 動詞」表達目的",
    source: {
      file: "Sentence Structure 1 - 「to + 動詞」表達目的.pdf",
      pageCount: 15,
      lessonPages: [1],
      exercisePages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      answerPages: [9, 10, 11, 12, 13, 14, 15]
    },
    formula: "Subject + action + to + base verb + other information",
    formulas: [
      {
        id: "ss1-formula-purpose",
        labelEn: "Target Structure",
        labelZh: "目標句型",
        formula: "Subject + action + to + base verb + other information"
      }
    ],
    examples: [
      {
        id: "ss1-example-01",
        en: "I want to go to school to learn something challenging.",
        zh: "我想去上學，去學一些有挑戰性的東西。",
        highlight: "to learn something challenging"
      }
    ],
    example: "I want to go to school to learn something challenging.",
    exampleZh: "我想去上學，去學一些有挑戰性的東西。",
    rules: [
      {
        id: "ss1-rule-01",
        en: "Always use the base form of the verb after to.",
        zh: "to 後面必須使用動詞原形。",
        examples: ["to learn", "to buy", "to avoid"]
      },
      {
        id: "ss1-rule-02",
        en: "Keep the tense in the main action; the purpose verb after to does not change.",
        zh: "時態應保留在主要動作；to 後面的目的動詞不會隨時態改變。",
        examples: ["went to borrow", "is saving to buy"]
      },
      {
        id: "ss1-rule-03",
        en: "Remove repeated reason words such as because, so that or in order that when you rewrite the sentence.",
        zh: "改寫時，應刪去重複表達原因或目的的 because、so that 或 in order that。",
        examples: []
      },
      {
        id: "ss1-rule-04",
        en: "Keep all important information from the original sentence and begin with the word provided.",
        zh: "答案須保留原句的重要資料，並使用題目提供的第一個字開始。",
        examples: []
      }
    ],
    benefits: [
      {
        id: "ss1-benefit-01",
        en: "This structure shows the purpose of an action clearly and directly.",
        zh: "這個句型能清楚直接地說明一個動作的目的。"
      },
      {
        id: "ss1-benefit-02",
        en: "It combines an action and its reason into one shorter, smoother sentence.",
        zh: "它能把一個動作和背後原因合併成一句更精簡、更流暢的句子。"
      },
      {
        id: "ss1-benefit-03",
        en: "It helps you vary your sentence structure instead of repeatedly using because or so that.",
        zh: "它能增加句式變化，避免反覆使用 because 或 so that。"
      }
    ],
    sourceOmissions: ["The PDF does not contain separate Important Rules or Benefits sections; these two bilingual teaching pages are editorial additions based on the exercise pattern."],
    instructions: {
      en: [
        "Rewrite each sentence using to + verb to show its purpose.",
        "The first word of each answer has been provided."
      ],
      zh: [
        "使用 to + 動詞 改寫以下句子，以表達目的。",
        "每題已提供答案的第一個字。"
      ]
    },
    questions: purposeQuestions
  };

  const adjectiveNounQuestions = makeQuestions("ss2", [
    [1, 2, 11, "I am optimistic.", "我是樂觀的。", "I", "I am an optimistic person.", "我是個樂觀的人。", "an optimistic person"],
    [2, 2, 11, "Amy is patient.", "艾米很有耐性。", "Amy", "Amy is a patient person.", "艾米是個有耐性的人。", "a patient person"],
    [3, 2, 11, "Ben is honest.", "本很誠實。", "Ben", "Ben is an honest person.", "本是個誠實的人。", "an honest person"],
    [4, 3, 11, "Chloe is friendly.", "克洛伊很友善。", "Chloe", "Chloe is a friendly person.", "克洛伊是個友善的人。", "a friendly person"],
    [5, 3, 11, "Leo is active.", "里奧很活躍。", "Leo", "Leo is an active person.", "里奧是個活躍的人。", "an active person"],
    [6, 3, 11, "Nina is a student. She is diligent.", "妮娜是一名學生。她很勤奮。", "Nina", "Nina is a diligent student.", "妮娜是一名勤奮的學生。", "a diligent student"],
    [7, 3, 11, "Omar is a neighbour, and he is helpful.", "奧馬爾是一名鄰居，而且他很樂於助人。", "Omar", "Omar is a helpful neighbour.", "奧馬爾是一名樂於助人的鄰居。", "a helpful neighbour"],
    [8, 3, 11, "They are players. They are energetic.", "他們是球員。他們精力充沛。", "They", "They are energetic players.", "他們是精力充沛的球員。", "energetic players"],
    [9, 3, 12, "We are employees, and we are responsible.", "我們是僱員，而且我們很負責任。", "We", "We are responsible employees.", "我們是負責任的僱員。", "responsible employees"],
    [10, 4, 12, "My aunt is a nurse. She is caring.", "我的姨母是一名護士。她很有愛心。", "My", "My aunt is a caring nurse.", "我的姨母是一名有愛心的護士。", "a caring nurse"],
    [11, 4, 12, "Lily is a designer. She is creative.", "莉莉是一名設計師。她很有創意。", "Lily", "Lily is a creative designer.", "莉莉是一名有創意的設計師。", "a creative designer"],
    [12, 4, 12, "Mr Chan is our teacher, and he is patient.", "陳先生是我們的老師，而且他很有耐性。", "Mr", "Mr Chan is a patient teacher.", "陳先生是一名有耐性的老師。", "a patient teacher"],
    [13, 4, 12, "Maya is talented, and she is a singer.", "瑪雅很有才華，而且她是一名歌手。", "Maya", "Maya is a talented singer.", "瑪雅是一名有才華的歌手。", "a talented singer"],
    [14, 4, 12, "What kind of driver is Daniel? He is careful.", "丹尼爾是怎樣的司機？他駕駛時很小心。", "Daniel", "Daniel is a careful driver.", "丹尼爾是一名小心謹慎的司機。", "a careful driver"],
    [15, 4, 12, "Grace works as a secretary and is organised.", "格蕾絲任職秘書，而且做事很有條理。", "Grace", "Grace is an organised secretary.", "格蕾絲是一名有條理的秘書。", "an organised secretary"],
    [16, 5, 12, "Ethan is a chef. He is experienced.", "伊森是一名廚師。他經驗豐富。", "Ethan", "Ethan is an experienced chef.", "伊森是一名經驗豐富的廚師。", "an experienced chef"],
    [17, 5, 13, "Olivia is curious. She is a learner.", "奧莉花充滿好奇心。她是一名學習者。", "Olivia", "Olivia is a curious learner.", "奧莉花是一名充滿好奇心的學習者。", "a curious learner"],
    [18, 5, 13, "Noah is a child who is cheerful.", "諾亞是個孩子，而且性格開朗。", "Noah", "Noah is a cheerful child.", "諾亞是一個性格開朗的孩子。", "a cheerful child"],
    [19, 5, 13, "The twins are our guests. They are polite.", "這對雙胞胎是我們的客人。他們很有禮貌。", "The", "The twins are polite guests.", "這對雙胞胎是有禮貌的客人。", "polite guests"],
    [20, 5, 13, "My parents are understanding.", "我的父母很善解人意。", "My", "My parents are understanding people.", "我的父母是善解人意的人。", "understanding people"],
    [21, 5, 13, "This is a tool. It is useful.", "這是一件工具。它很實用。", "This", "This is a useful tool.", "這是一件實用的工具。", "a useful tool"],
    [22, 6, 13, "That watch is expensive.", "那隻手錶很昂貴。", "That", "That is an expensive watch.", "那是一隻昂貴的手錶。", "an expensive watch"],
    [23, 6, 13, "The chair is comfortable.", "這張椅子很舒適。", "It", "It is a comfortable chair.", "這是一張舒適的椅子。", "a comfortable chair"],
    [24, 6, 13, "This book is interesting.", "這本書很有趣。", "This", "This is an interesting book.", "這是一本有趣的書。", "an interesting book"],
    [25, 6, 14, "The teacher says the question is difficult.", "老師說這個問題很難。", "The", "The teacher says it is a difficult question.", "老師說這是一個很難的問題。", "a difficult question"],
    [26, 6, 14, "Hong Kong is a city, and it is busy.", "香港是一個城市，而且十分繁忙。", "Hong", "Hong Kong is a busy city.", "香港是一個繁忙的城市。", "a busy city"],
    [27, 6, 14, "The new library is modern. It is a building.", "新圖書館很現代化。它是一座建築物。", "The", "The new library is a modern building.", "新圖書館是一座現代化的建築物。", "a modern building"],
    [28, 7, 14, "That place is a village, and it is peaceful.", "那個地方是一個村莊，而且很寧靜。", "That", "That is a peaceful village.", "那是一個寧靜的村莊。", "a peaceful village"],
    [29, 7, 14, "This road is dangerous.", "這條路很危險。", "It", "It is a dangerous road.", "這是一條危險的道路。", "a dangerous road"],
    [30, 7, 14, "The panda is an animal. It is gentle.", "這隻熊貓是動物。牠很溫馴。", "The", "The panda is a gentle animal.", "這隻熊貓是一種溫馴的動物。", "a gentle animal"],
    [31, 7, 14, "Emma is a teammate. She is very reliable.", "艾瑪是一名隊友。她非常可靠。", "Emma", "Emma is a very reliable teammate.", "艾瑪是一名非常可靠的隊友。", "a very reliable teammate"],
    [32, 7, 14, "Jason is a student, and he is unusually quiet.", "傑森是一名學生，而且他異常安靜。", "Jason", "Jason is an unusually quiet student.", "傑森是一名異常安靜的學生。", "an unusually quiet student"],
    [33, 7, 15, "This solution is not complicated.", "這個解決方法並不複雜。", "This", "This is not a complicated solution.", "這並不是一個複雜的解決方法。", "a complicated solution"],
    [34, 8, 15, "How was the match? It was exciting.", "比賽怎樣？比賽很刺激。", "It", "It was an exciting match.", "這是一場刺激的比賽。", "an exciting match"],
    [35, 8, 15, "The result was not surprising.", "結果並不令人意外。", "It", "It was not a surprising result.", "這並不是一個令人意外的結果。", "a surprising result"],
    [36, 8, 15, "That decision was sensible.", "那個決定很明智。", "That", "That was a sensible decision.", "那是一個明智的決定。", "a sensible decision"],
    [37, 8, 15, "The rule is not difficult.", "這條規則並不困難。", "It", "It is not a difficult rule.", "這並不是一條困難的規則。", "a difficult rule"],
    [38, 8, 15, "The museum is an attraction, and it is popular.", "博物館是一個景點，而且很受歡迎。", "The", "The museum is a popular attraction.", "這間博物館是一個受歡迎的景點。", "a popular attraction"],
    [39, 8, 15, "Our dog is an animal. It is very loyal.", "我們的狗是動物。牠非常忠心。", "Our", "Our dog is a very loyal animal.", "我們的狗是一種非常忠心的動物。", "a very loyal animal"],
    [40, 9, 15, "The laptop is a machine, and it is not powerful.", "這部手提電腦是一部機器，而且功能不強大。", "The", "The laptop is not a powerful machine.", "這部手提電腦並不是一部功能強大的機器。", "a powerful machine"],
    [41, 9, 16, "What is Aisha like? She is calm.", "艾莎是個怎樣的人？她很冷靜。", "Aisha", "Aisha is a calm person.", "艾莎是個冷靜的人。", "a calm person"],
    [42, 9, 16, "What kind of worker is Marcus? He is dependable.", "馬庫斯是個怎樣的員工？他很可靠。", "Marcus", "Marcus is a dependable worker.", "馬庫斯是一名可靠的員工。", "a dependable worker"],
    [43, 9, 16, "Everyone in the class knows that Sofia is thoughtful.", "班上每個人都知道蘇菲亞很體貼。", "Everyone", "Everyone in the class knows that Sofia is a thoughtful person.", "班上每個人都知道蘇菲亞是個體貼的人。", "a thoughtful person"],
    [44, 9, 16, "I think the plan is practical.", "我認為這個計劃很實際可行。", "I", "I think it is a practical plan.", "我認為這是一個實際可行的計劃。", "a practical plan"],
    [45, 9, 16, "The guide said the path was safe.", "導遊說這條小徑很安全。", "The", "The guide said it was a safe path.", "導遊說這是一條安全的小徑。", "a safe path"],
    [46, 10, 16, "The manager explained that the task was urgent.", "經理解釋說，這項任務很緊急。", "The", "The manager explained that it was an urgent task.", "經理解釋說，這是一項緊急任務。", "an urgent task"],
    [47, 10, 16, "The doctor told us that the illness was serious.", "醫生告訴我們，這種疾病很嚴重。", "The", "The doctor told us that it was a serious illness.", "醫生告訴我們，這是一種嚴重的疾病。", "a serious illness"],
    [48, 10, 16, "Although the room is small, it is comfortable.", "雖然房間很小，但很舒適。", "Although", "Although it is a small room, it is comfortable.", "雖然這是一個小房間，但很舒適。", "a small room"],
    [49, 10, 17, "The film was long, but it was engaging.", "這部電影很長，但很吸引人。", "It", "It was a long but engaging film.", "這是一部很長但很吸引人的電影。", "a long but engaging film"],
    [50, 10, 17, "The project was challenging, but it was valuable for the team.", "這個項目很具挑戰性，但對團隊很有價值。", "It", "It was a challenging but valuable project for the team.", "這是一個具挑戰性但對團隊很有價值的項目。", "a challenging but valuable project", "editorial-missing-in-pdf"]
  ]).map((question) => {
    if (question.id === "ss2-q12") {
      return { ...question, acceptedAnswers: ["Mr Chan is our patient teacher."] };
    }
    if (question.id === "ss2-q19") {
      return { ...question, acceptedAnswers: ["The twins are our polite guests."] };
    }
    return question;
  });

  const adjectiveNounLesson = {
    id: "ss2",
    order: 2,
    slug: "adjective-to-adjective-noun",
    title: "「形容詞句 → 形容詞＋名詞句」句型",
    titleZh: "「形容詞句 → 形容詞＋名詞句」",
    titleEn: "Adjective to adjective + noun",
    source: {
      file: "Sentence Structure 2 - Adjective to Adjective+Noun.pdf",
      pageCount: 17,
      lessonPages: [1, 2],
      exercisePages: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      answerPages: [11, 12, 13, 14, 15, 16, 17],
      omissions: [
        {
          field: "questions[49].answerZh",
          note: "The PDF answer key omits the Chinese answer for question 50; the stored translation is editorial."
        }
      ]
    },
    formula: "Subject + be + a/an + adjective + singular noun; Subject + be + adjective + plural noun",
    formulas: [
      {
        id: "ss2-formula-from",
        labelEn: "From: adjective after be",
        labelZh: "From：形容詞放在 be 後面",
        formula: "Subject + be + adjective"
      },
      {
        id: "ss2-formula-singular",
        labelEn: "To: singular",
        labelZh: "To：形容詞放在名詞前面；單數",
        formula: "Subject + be + a/an + adjective + singular noun"
      },
      {
        id: "ss2-formula-plural",
        labelEn: "To: plural",
        labelZh: "To：形容詞放在名詞前面；複數",
        formula: "Subject + be + adjective + plural noun"
      }
    ],
    example: "I am an optimistic person.",
    exampleZh: "我是個樂觀的人。",
    examples: [
      {
        id: "ss2-example-from",
        scope: "from",
        en: "I am optimistic.",
        zh: "我是樂觀的。",
        highlight: "optimistic"
      },
      {
        id: "ss2-example-singular",
        scope: "singular",
        en: "I am an optimistic person.",
        zh: "我是個樂觀的人。",
        highlight: "an optimistic person"
      },
      {
        id: "ss2-example-plural",
        scope: "plural",
        en: "They are polite people.",
        zh: "他們是有禮貌的人。",
        highlight: "polite people"
      }
    ],
    rules: [
      {
        id: "ss2-rule-01",
        zh: "a / an 要按照後面形容詞的讀音選擇。",
        examples: ["an honest person", "a useful tool"]
      },
      {
        id: "ss2-rule-02",
        zh: "複數名詞前不使用 a 或 an。",
        examples: ["responsible employees", "energetic players"]
      },
      {
        id: "ss2-rule-03",
        zh: "如題目已提供 student、teacher、book、city 等名詞，答案須保留該名詞。",
        examples: []
      },
      {
        id: "ss2-rule-04",
        zh: "如題目只描述人物而沒有提供身分或職業，請使用 person 或 people。",
        examples: []
      }
    ],
    benefits: [
      {
        id: "ss2-benefit-01",
        en: "This structure helps you give a fuller description instead of using only one adjective.",
        zh: "這個句型能讓描述更完整，而不只是說出一個形容詞。"
      },
      {
        id: "ss2-benefit-02",
        en: "It helps you combine two short pieces of information into one smoother sentence.",
        zh: "它能把兩項簡單資料合併成一句更流暢的句子。"
      },
      {
        id: "ss2-benefit-03",
        en: "It also helps you learn where adjectives belong and when to use a or an.",
        zh: "它亦能幫助你掌握形容詞的位置，以及何時使用 a 或 an。"
      }
    ],
    instructions: {
      en: [
        "Rewrite each sentence by changing the adjective after be into an adjective before a noun.",
        "Use the noun provided in the question. If no noun is provided for a person, use person or people.",
        "The first word of each answer has been provided."
      ],
      zh: [
        "把 be 後面的形容詞改為放在名詞前的形容詞，並重寫句子。",
        "使用題目提供的名詞。如題目只描述人物而沒有提供名詞，請使用 person 或 people。",
        "每題已提供答案的第一個字。"
      ]
    },
    questions: adjectiveNounQuestions
  };

  window.EDMUND_SENTENCE_STRUCTURE_DATA = Object.freeze({
    version: 1,
    lessons: [purposeLesson, adjectiveNounLesson]
  });
})();
