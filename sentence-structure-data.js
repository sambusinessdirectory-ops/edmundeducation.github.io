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
    },
    ss3: {
      numberPage: { 6: 3, 19: 5, 32: 7, 45: 9 }
    },
    ss4: {
      numberPage: { 6: 2, 19: 4, 32: 6, 45: 8 },
      answerNumberPage: { 9: 10, 18: 11, 27: 12, 36: 13 }
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

  const adjectiveInfinitiveQuestions = makeQuestions("ss3", [
    [1, 3, 11, "It is easy to understand this story.", "要理解這個故事很容易。", "This", "This story is easy to understand.", "這個故事很容易理解。", "easy to understand"],
    [2, 3, 11, "It is difficult to lift the box.", "要搬起這個箱子很困難。", "The", "The box is difficult to lift.", "這個箱子很難搬起來。", "difficult to lift"],
    [3, 3, 11, "Using this app is simple.", "使用這個應用程式很簡單。", "This", "This app is simple to use.", "這個應用程式操作簡單。", "simple to use"],
    [4, 3, 11, "It is safe to eat the soup.", "吃這碗湯是安全的。", "The", "The soup is safe to eat.", "這碗湯可以安全食用。", "safe to eat"],
    [5, 3, 11, "Pronouncing this name is hard.", "要讀出這個名字很困難。", "This", "This name is hard to pronounce.", "這個名字很難讀。", "hard to pronounce"],
    [6, 4, 11, "What activity is fun for children? Playing this game.", "甚麼活動對孩子們來說很有趣？玩這個遊戲。", "This", "This game is fun for children to play.", "這個遊戲讓孩子們玩起來很有趣。", "fun for children to play"],
    [7, 4, 11, "It is quick to prepare this snack.", "準備這份小食很快捷。", "This", "This snack is quick to prepare.", "這份小食很快便能準備好。", "quick to prepare"],
    [8, 4, 11, "Following the instructions is easy.", "按照這些指示去做很容易。", "The", "The instructions are easy to follow.", "這些指示很容易跟從。", "easy to follow"],
    [9, 4, 11, "What is convenient for travellers? Keeping this travel card in a wallet.", "甚麼東西方便旅客放在銀包裏？這張旅遊卡。", "This", "This travel card is convenient for travellers to keep in a wallet.", "這張旅遊卡方便旅客放在銀包裏。", "convenient for travellers to keep in a wallet"],
    [10, 4, 12, "Finding the answer is difficult.", "找出答案很困難。", "The", "The answer is difficult to find.", "這個答案很難找出來。", "difficult to find"],
    [11, 4, 12, "People do not find it difficult to prepare this meal.", "人們不覺得準備這頓飯很困難。", "This", "This meal is not difficult to prepare.", "這頓飯不難準備。", "not difficult to prepare"],
    [12, 4, 12, "Wearing these shoes all day is comfortable.", "整天穿着這雙鞋也很舒適。", "These", "These shoes are comfortable to wear all day.", "這雙鞋整天穿着也很舒適。", "comfortable to wear all day"],
    [13, 5, 12, "Beginners find it easy to use the website.", "初學者覺得這個網站很容易使用。", "The", "The website is easy for beginners to use.", "這個網站對初學者來說很容易使用。", "easy for beginners to use"],
    [14, 5, 12, "Crossing the road at night is dangerous.", "晚上橫過這條馬路很危險。", "The", "The road is dangerous to cross at night.", "這條馬路在晚上橫過時很危險。", "dangerous to cross at night"],
    [15, 5, 12, "It is pleasant to listen to this song.", "聆聽這首歌令人感到愉快。", "This", "This song is pleasant to listen to.", "這首歌聽起來令人愉快。", "pleasant to listen to"],
    [16, 5, 12, "Most people find it difficult to turn the old lock.", "大多數人都覺得這把舊鎖很難扭動。", "The", "The old lock is difficult for most people to turn.", "這把舊鎖對大多數人來說都很難扭動。", "difficult for most people to turn"],
    [17, 5, 12, "Operating the machine is simple.", "操作這部機器很簡單。", "The", "The machine is simple to operate.", "這部機器操作簡單。", "simple to operate"],
    [18, 5, 12, "What was this film like? Watching it was interesting.", "這部電影怎麼樣？看這部電影很有趣。", "This", "This film was interesting to watch.", "這部電影觀看起來很有趣。", "interesting to watch"],
    [19, 6, 13, "The desk can be cleaned easily.", "這張書桌可以很容易地清潔。", "The", "The desk is easy to clean.", "這張書桌很容易清潔。", "easy to clean"],
    [20, 6, 13, "Most learners do not find it easy to remember this word.", "大多數學習者都不覺得這個字容易記住。", "This", "This word is not easy for most learners to remember.", "這個字對大多數學習者來說並不容易記住。", "not easy for most learners to remember"],
    [21, 6, 13, "You cannot safely drink the water without boiling it.", "這些水未經煮沸便不能安全飲用。", "The", "The water is not safe to drink without boiling it.", "這些水未經煮沸便不宜飲用。", "not safe to drink without boiling it"],
    [22, 6, 13, "Maintaining the new printer is cheaper than maintaining the old one.", "保養新打印機比保養舊打印機便宜。", "The", "The new printer is cheaper to maintain than the old one.", "新打印機的保養成本比舊打印機低。", "cheaper to maintain than the old one"],
    [23, 6, 13, "Visitors find it difficult to reach the village by public transport.", "訪客覺得乘搭公共交通工具前往這條村很困難。", "This", "This village is difficult for visitors to reach by public transport.", "這條村對訪客來說很難乘搭公共交通工具到達。", "difficult for visitors to reach by public transport"],
    [24, 6, 13, "It is comfortable to sit on this chair.", "坐在這張椅子上很舒適。", "This", "This chair is comfortable to sit on.", "這張椅子坐起來很舒適。", "comfortable to sit on"],
    [25, 6, 13, "What is the online form like? It can be completed easily.", "這份網上表格怎麼樣？它可以很容易地填妥。", "The", "The online form is easy to complete.", "這份網上表格很容易填妥。", "easy to complete"],
    [26, 7, 13, "Young children find it hard to open the medicine bottle.", "年幼兒童覺得這個藥瓶很難打開。", "This", "This medicine bottle is hard for young children to open.", "這個藥瓶對年幼兒童來說很難打開。", "hard for young children to open"],
    [27, 7, 13, "Carrying the suitcase up narrow stairs is awkward.", "沿狹窄樓梯搬運這個行李箱很不方便。", "The", "The suitcase is awkward to carry up narrow stairs.", "這個行李箱很難沿狹窄樓梯搬運。", "awkward to carry up narrow stairs"],
    [28, 7, 14, "Students find it useful to read the article before the lesson.", "學生覺得在上課前閱讀這篇文章很有用。", "This", "This article is useful for students to read before the lesson.", "學生在上課前閱讀這篇文章會很有用。", "useful for students to read before the lesson"],
    [29, 7, 14, "Nobody can climb the wall without special equipment.", "沒有特殊裝備，任何人都無法爬上這道牆。", "The", "The wall is impossible to climb without special equipment.", "沒有特殊裝備，這道牆是不可能爬上去的。", "impossible to climb without special equipment"],
    [30, 7, 14, "It is comfortable to work in these gloves for long periods.", "長時間戴着這雙手套工作也很舒適。", "These", "These gloves are comfortable to work in for long periods.", "長時間戴着這雙手套工作也很舒適。", "comfortable to work in for long periods"],
    [31, 7, 14, "Customers can understand the menu easily even without pictures.", "即使沒有圖片，顧客也能輕易看懂餐牌。", "The", "The menu is easy for customers to understand even without pictures.", "即使沒有圖片，這份餐牌對顧客來說也很容易看懂。", "easy for customers to understand even without pictures"],
    [32, 8, 14, "Exploring the museum with a guide is enjoyable.", "在導遊帶領下參觀博物館很有樂趣。", "The", "The museum is enjoyable to explore with a guide.", "在導遊帶領下參觀這間博物館很有樂趣。", "enjoyable to explore with a guide"],
    [33, 8, 14, "Most users find it difficult to hold this camera steady in one hand.", "大多數使用者都覺得很難單手穩定地拿着這部相機。", "This", "This camera is difficult for most users to hold steady in one hand.", "這部相機對大多數使用者來說都很難單手拿穩。", "difficult for most users to hold steady in one hand"],
    [34, 8, 14, "The software can be installed quickly on most computers.", "這個軟件可以在大多數電腦上快速安裝。", "The", "The software is quick to install on most computers.", "這個軟件可以在大多數電腦上快速完成安裝。", "quick to install on most computers"],
    [35, 8, 14, "Drivers can no longer drive across the old bridge safely.", "駕駛者已不能再安全地駛過這座舊橋。", "The", "The old bridge is no longer safe to drive across.", "這座舊橋已不能再安全駕車駛過。", "no longer safe to drive across"],
    [36, 8, 14, "New staff often find it difficult to understand the report.", "新員工經常覺得這份報告很難理解。", "This", "This report is difficult for new staff to understand.", "這份報告對新員工來說很難理解。", "difficult for new staff to understand"],
    [37, 8, 15, "Parents find it convenient to check the new timetable online.", "家長覺得在網上查看新時間表很方便。", "The", "The new timetable is convenient for parents to check online.", "這份新時間表方便家長在網上查看。", "convenient for parents to check online"],
    [38, 8, 15, "Nobody can ignore the alarm once it starts ringing.", "警報一旦響起，任何人都無法忽視。", "The", "The alarm is impossible to ignore once it starts ringing.", "警報一旦響起，便不可能被忽視。", "impossible to ignore once it starts ringing"],
    [39, 9, 15, "Living in this flat during the summer is pleasant.", "夏天住在這個單位很舒適愉快。", "This", "This flat is pleasant to live in during the summer.", "這個單位在夏天住起來很舒適愉快。", "pleasant to live in during the summer"],
    [40, 9, 15, "What problem does this button have? People can easily press it by accident.", "這個按鈕有甚麼問題？人們很容易意外按下它。", "The", "The button is easy to press by accident.", "這個按鈕很容易被意外按下。", "easy to press by accident"],
    [41, 9, 15, "It is difficult to explain the new policy in a few words.", "要用幾句話解釋這項新政策很困難。", "The", "The new policy is difficult to explain in a few words.", "這項新政策很難用幾句話解釋。", "difficult to explain in a few words"],
    [42, 9, 15, "With adult supervision, this device can be used safely by older children.", "在成人看管下，年紀較大的兒童可以安全使用這部裝置。", "This", "This device is safe for older children to use with adult supervision.", "在成人看管下，這部裝置可供年紀較大的兒童安全使用。", "safe for older children to use with adult supervision"],
    [43, 9, 15, "The customer survey can be completed easily on a mobile phone.", "顧客可以用手提電話輕易完成這份問卷。", "The", "The customer survey is easy to complete on a mobile phone.", "這份顧客問卷很容易用手提電話完成。", "easy to complete on a mobile phone"],
    [44, 9, 15, "Walking along the mountain path after heavy rain is dangerous.", "大雨過後沿着這條山徑步行很危險。", "The", "The mountain path is dangerous to walk along after heavy rain.", "大雨過後，沿着這條山徑步行很危險。", "dangerous to walk along after heavy rain"],
    [45, 10, 15, "When the information is organised clearly, solving the problem becomes easier.", "資料整理清楚後，解決這個問題會變得較容易。", "This", "This problem is easier to solve when the information is organised clearly.", "資料整理清楚後，這個問題會較容易解決。", "easier to solve when the information is organised clearly"],
    [46, 10, 16, "Heating the old building during winter is expensive.", "冬天為這座舊建築物供暖的成本很高。", "The", "The old building is expensive to heat during winter.", "冬天為這座舊建築物供暖很昂貴。", "expensive to heat during winter"],
    [47, 10, 16, "Full-time workers find it easy to fit the online course around their jobs.", "全職工作者覺得很容易把這個網上課程安排在工作以外的時間。", "The", "The online course is easy for full-time workers to fit around their jobs.", "這個網上課程很容易讓全職工作者配合自己的工作時間安排。", "easy for full-time workers to fit around their jobs"],
    [48, 10, 16, "The public notice is across the road. People find it hard to read from there.", "這張公眾告示在馬路對面。人們從這裏很難看清楚。", "This", "This public notice is hard to read from across the road.", "這張公眾告示從馬路對面很難看清楚。", "hard to read from across the road"],
    [49, 10, 16, "Walking around the village market on a quiet morning is pleasant.", "在寧靜的早上逛逛村內市集令人愉快。", "The", "The village market is pleasant to walk around on a quiet morning.", "在寧靜的早上逛逛這個村內市集令人愉快。", "pleasant to walk around on a quiet morning"],
    [50, 10, 16, "Even under pressure, passengers can follow the emergency instructions easily.", "即使在壓力下，乘客也能輕易依照緊急指示行動。", "The", "The emergency instructions are easy for passengers to follow even under pressure.", "即使在壓力下，這些緊急指示對乘客來說也很容易跟從。", "easy for passengers to follow even under pressure"]
  ]);

  const adjectiveInfinitiveLesson = {
    id: "ss3",
    order: 3,
    slug: "adjective-to-infinitive",
    title: "「形容詞 + to-infinitive 句」句型",
    titleZh: "「形容詞 + to-infinitive 句」",
    titleEn: "Adjective + to-infinitive",
    titleEnSource: "editorial-translation",
    source: {
      file: "Sentence Structure 3.pdf",
      pageCount: 16,
      lessonPages: [1, 2],
      exercisePages: [3, 4, 5, 6, 7, 8, 9, 10],
      answerPages: [11, 12, 13, 14, 15, 16]
    },
    formula: "Thing + be + adjective + to + base verb + other information",
    formulas: [
      {
        id: "ss3-formula-positive",
        labelEn: "Positive Form",
        labelZh: "肯定式",
        formula: "Thing + be + adjective + to + base verb + other information"
      },
      {
        id: "ss3-formula-person",
        labelEn: "With a Person",
        labelZh: "加上動作執行者",
        formula: "Thing + be + adjective + for someone + to + base verb"
      },
      {
        id: "ss3-formula-negative",
        labelEn: "Negative Form",
        labelZh: "否定式",
        formula: "Thing + be + not + adjective + to + base verb"
      }
    ],
    example: "English is expensive to learn.",
    exampleZh: "學英文的成本很高。",
    examples: [
      {
        id: "ss3-example-positive",
        scope: "positive",
        labelEn: "Positive Form",
        labelZh: "肯定式",
        en: "This story is easy to understand.",
        zh: "這個故事很容易理解。",
        highlight: "easy to understand"
      },
      {
        id: "ss3-example-person",
        scope: "person",
        labelEn: "With a Person",
        labelZh: "加上動作執行者",
        en: "The website is easy for beginners to use.",
        zh: "這個網站對初學者來說很容易使用。",
        highlight: "easy for beginners to use"
      },
      {
        id: "ss3-example-negative",
        scope: "negative",
        labelEn: "Negative Form",
        labelZh: "否定式",
        en: "This word is not easy to remember.",
        zh: "這個字並不容易記住。",
        highlight: "not easy to remember"
      },
      {
        id: "ss3-example-original",
        scope: "from",
        labelEn: "Original sentence",
        labelZh: "原句",
        en: "It is expensive to learn English.",
        zh: "學英文的成本很高。",
        highlight: "to learn English"
      },
      {
        id: "ss3-example-target",
        scope: "to",
        labelEn: "Target sentence",
        labelZh: "目標句",
        en: "English is expensive to learn.",
        zh: "學英文的成本很高。",
        highlight: "expensive to learn"
      }
    ],
    rules: [
      {
        id: "ss3-rule-01",
        en: "Place the thing receiving the action at the beginning of the sentence.",
        zh: "把接受動作的事物放在句首。",
        examples: ["It is easy to read this book. → This book is easy to read."]
      },
      {
        id: "ss3-rule-02",
        en: "Do not repeat an object pronoun after the to-infinitive.",
        zh: "不要在 to-infinitive 後重複加入代名詞。",
        examples: ["Correct: This book is easy to read.", "Incorrect: This book is easy to read it."]
      },
      {
        id: "ss3-rule-03",
        en: "If the verb requires a preposition, keep the preposition.",
        zh: "如動詞需要介詞，必須保留介詞。",
        examples: ["It is comfortable to sit on this chair. → This chair is comfortable to sit on."]
      },
      {
        id: "ss3-rule-04",
        en: "To identify who performs the action, use for + someone.",
        zh: "如需指出誰執行動作，可使用 for + someone。",
        examples: ["This bottle is hard for young children to open."]
      },
      {
        id: "ss3-rule-05",
        en: "This exercise focuses on saying that something is easy, difficult, safe, expensive or interesting to do. It does not cover other grammatical functions of to-infinitives.",
        zh: "本練習集中訓練「某件事物做起來是容易、困難、安全、昂貴或有趣的」這種用法，不包括其他 to-infinitive 文法功能。",
        examples: ["She is eager to learn.", "The box is too heavy to lift.", "I went outside to get some air."]
      }
    ],
    benefits: [
      {
        id: "ss3-benefit-01",
        en: "This structure lets the listener know immediately what you are talking about. Put this book, the machine or the road first, then describe what it is like to use or do something with it; the focus becomes clearer.",
        zh: "讓別人立即知道你在談甚麼。先說 this book、the machine 或 the road，再描述它做起來如何，重點會更加清楚。"
      },
      {
        id: "ss3-benefit-02",
        en: "It turns a longer idea into one natural English sentence. The sentence ‘It is difficult to understand the report.’ can be rewritten concisely as ‘The report is difficult to understand.’",
        zh: "把較長的意思變成一句自然的英文。It is difficult to understand the report. 可以簡潔地改成：The report is difficult to understand."
      },
      {
        id: "ss3-benefit-03",
        en: "It is useful for describing difficulty, price, safety and the experience of using something, such as easy to use, expensive to repair, safe to drink and comfortable to wear.",
        zh: "方便描述難度、價錢、安全性和使用感受。例如 easy to use、expensive to repair、safe to drink 和 comfortable to wear。"
      },
      {
        id: "ss3-benefit-04",
        en: "It is very practical in daily life. You can use it to review products, compare services, give safety advice, or describe study and work tasks.",
        zh: "在日常生活中非常實用。你可以用它評論產品、比較服務、提供安全提示，或描述學習及工作任務。"
      },
      {
        id: "ss3-benefit-05",
        en: "It makes your English sound more fluent. Once you master this structure, you do not need to begin every sentence with ‘It is...’.",
        zh: "令英文聽起來更流暢。掌握這個句型後，便不需要每次都以 It is... 開始句子。"
      }
    ],
    sourceOmissions: [
      "The PDF supplies the Benefits and Important Rules content in Chinese with English examples, but not full English translations; the stored English explanations are faithful editorial translations.",
      "The PDF title has no separate English subtitle; titleEn is an editorial translation."
    ],
    instructions: {
      en: [
        "Rewrite each sentence using: Thing + be + adjective + to-infinitive.",
        "Preserve the original meaning.",
        "The first word of each answer has been provided."
      ],
      zh: [
        "使用以下句型改寫每句：事物／活動 + be + 形容詞 + to 不定詞。",
        "改寫時必須保留原意。",
        "每題已提供答案的第一個字。"
      ]
    },
    questions: adjectiveInfinitiveQuestions
  };

  const althoughQuestions = makeQuestions("ss4", [
    [1, 2, 10, "It was raining, but Mia walked to school.", "當時正在下雨，但米婭仍然步行上學。", "Although", "Although it was raining, Mia walked to school.", "雖然當時正在下雨，但米婭仍然步行上學。", "Although it was raining, Mia walked to school."],
    [2, 2, 10, "Ben was tired. However, he finished his homework.", "本很疲倦。不過，他仍然完成了家課。", "Although", "Although Ben was tired, he finished his homework.", "雖然本很疲倦，但他仍然完成了家課。", "Although Ben was tired, he finished his homework."],
    [3, 2, 10, "The bag was heavy, but Lily carried it upstairs.", "那個袋子很重，但莉莉仍把它搬到樓上。", "Although", "Although the bag was heavy, Lily carried it upstairs.", "雖然那個袋子很重，但莉莉仍把它搬到樓上。", "Although the bag was heavy, Lily carried it upstairs."],
    [4, 2, 10, "The soup was hot. Even so, Tom began eating it immediately.", "那碗湯很熱。即使如此，湯姆仍立即開始喝湯。", "Although", "Although the soup was hot, Tom began eating it immediately.", "雖然那碗湯很熱，但湯姆仍立即開始喝湯。", "Although the soup was hot, Tom began eating it immediately."],
    [5, 2, 10, "The shop was small, yet it sold many useful items.", "那間店舖很小，卻售賣很多實用物品。", "Although", "Although the shop was small, it sold many useful items.", "雖然那間店舖很小，但它售賣很多實用物品。", "Although the shop was small, it sold many useful items."],
    [6, 3, 10, "Amy was nervous, but she gave her presentation clearly.", "艾米很緊張，但她仍清楚地作出匯報。", "Although", "Although Amy was nervous, she gave her presentation clearly.", "雖然艾米很緊張，但她仍清楚地作出匯報。", "Although Amy was nervous, she gave her presentation clearly."],
    [7, 3, 10, "The bus was crowded. However, we found two seats.", "巴士很擠迫。不過，我們找到了兩個座位。", "Although", "Although the bus was crowded, we found two seats.", "雖然巴士很擠迫，但我們找到了兩個座位。", "Although the bus was crowded, we found two seats."],
    [8, 3, 10, "The film was long but interesting.", "這部電影很長，但很有趣。", "Although", "Although the film was long, it was interesting.", "雖然這部電影很長，但很有趣。", "Although the film was long, it was interesting."],
    [9, 3, 11, "Jack had little money, but he bought his mother a gift.", "傑克沒有太多錢，但他仍買了一份禮物給母親。", "Although", "Although Jack had little money, he bought his mother a gift.", "雖然傑克沒有太多錢，但他仍買了一份禮物給母親。", "Although Jack had little money, he bought his mother a gift."],
    [10, 3, 11, "The question looked easy. Nevertheless, many students answered it incorrectly.", "這條題目看起來很容易。儘管如此，很多學生仍答錯了。", "Although", "Although the question looked easy, many students answered it incorrectly.", "雖然這條題目看起來很容易，但很多學生仍答錯了。", "Although the question looked easy, many students answered it incorrectly."],
    [11, 3, 11, "Despite the cold weather, the children played outside.", "儘管天氣寒冷，孩子們仍在戶外玩耍。", "Although", "Although the weather was cold, the children played outside.", "雖然天氣寒冷，但孩子們仍在戶外玩耍。", "Although the weather was cold, the children played outside."],
    [12, 3, 11, "Sarah practised every day. Even so, she did not win the competition.", "莎拉每天練習。即使如此，她仍沒有在比賽中勝出。", "Although", "Although Sarah practised every day, she did not win the competition.", "雖然莎拉每天練習，但她仍沒有在比賽中勝出。", "Although Sarah practised every day, she did not win the competition."],
    [13, 4, 11, "Despite the heavy traffic, the ambulance reached the hospital on time.", "儘管交通繁忙，救護車仍準時到達醫院。", "Although", "Although the traffic was heavy, the ambulance reached the hospital on time.", "雖然交通繁忙，但救護車仍準時到達醫院。", "Although the traffic was heavy, the ambulance reached the hospital on time."],
    [14, 4, 11, "David does not like vegetables. However, he eats them for his health.", "大衛不喜歡蔬菜。不過，他為了健康仍會吃蔬菜。", "Although", "Although David does not like vegetables, he eats them for his health.", "雖然大衛不喜歡蔬菜，但他為了健康仍會吃蔬菜。", "Although David does not like vegetables, he eats them for his health."],
    [15, 4, 11, "Despite being old, the laptop still works well.", "儘管這部手提電腦很舊，它仍然運作良好。", "Although", "Although the laptop is old, it still works well.", "雖然這部手提電腦很舊，但它仍然運作良好。", "Although the laptop is old, it still works well."],
    [16, 4, 11, "Chloe woke up late, but she caught the train.", "克洛伊很晚才起床，但她仍趕上了火車。", "Although", "Although Chloe woke up late, she caught the train.", "雖然克洛伊很晚才起床，但她仍趕上了火車。", "Although Chloe woke up late, she caught the train."],
    [17, 4, 11, "In spite of being far from the city centre, the hotel attracted many tourists.", "儘管酒店遠離市中心，它仍吸引了很多遊客。", "Although", "Although the hotel was far from the city centre, it attracted many tourists.", "雖然酒店遠離市中心，但它仍吸引了很多遊客。", "Although the hotel was far from the city centre, it attracted many tourists."],
    [18, 4, 12, "The instructions were simple. Nevertheless, Kevin made several mistakes.", "指示很簡單。儘管如此，凱文仍犯了幾個錯誤。", "Although", "Although the instructions were simple, Kevin made several mistakes.", "雖然指示很簡單，但凱文仍犯了幾個錯誤。", "Although the instructions were simple, Kevin made several mistakes."],
    [19, 5, 12, "Despite the high price of the dress, Olivia decided to buy it.", "儘管那條連身裙價格昂貴，奧莉花仍決定購買。", "Although", "Although the dress was expensive, Olivia decided to buy it.", "雖然那條連身裙很昂貴，但奧莉花仍決定購買。", "Although the dress was expensive, Olivia decided to buy it."],
    [20, 5, 12, "The team lost the match, yet the coach praised the players.", "球隊輸了比賽，但教練仍讚賞球員。", "Although", "Although the team lost the match, the coach praised the players.", "雖然球隊輸了比賽，但教練仍讚賞球員。", "Although the team lost the match, the coach praised the players."],
    [21, 5, 12, "In spite of her headache, Grace continued working.", "儘管格蕾絲頭痛，她仍繼續工作。", "Although", "Although Grace had a headache, she continued working.", "雖然格蕾絲頭痛，但她仍繼續工作。", "Although Grace had a headache, she continued working."],
    [22, 5, 12, "The museum was crowded, but we saw every exhibition.", "博物館很擠迫，但我們仍參觀了每個展覽。", "Although", "Although the museum was crowded, we saw every exhibition.", "雖然博物館很擠迫，但我們仍參觀了每個展覽。", "Although the museum was crowded, we saw every exhibition."],
    [23, 5, 12, "Despite its cracked screen, the phone was still usable.", "儘管手機螢幕破裂，它仍然可以使用。", "Although", "Although the phone had a cracked screen, it was still usable.", "雖然手機的螢幕破裂，但它仍然可以使用。", "Although the phone had a cracked screen, it was still usable."],
    [24, 5, 12, "Noah had never cooked before. Even so, he made a good meal.", "諾亞以前從未下廚。即使如此，他仍煮出了一頓美味的飯菜。", "Although", "Although Noah had never cooked before, he made a good meal.", "雖然諾亞以前從未下廚，但他仍煮出了一頓美味的飯菜。", "Although Noah had never cooked before, he made a good meal."],
    [25, 5, 12, "In spite of the cold water, the swimmers entered the sea.", "儘管海水冰冷，游泳者仍走進海中。", "Although", "Although the water was cold, the swimmers entered the sea.", "雖然海水冰冷，但游泳者仍走進海中。", "Although the water was cold, the swimmers entered the sea."],
    [26, 6, 12, "Emma was afraid of heights, but she climbed to the top of the tower.", "艾瑪畏高，但她仍爬到塔頂。", "Although", "Although Emma was afraid of heights, she climbed to the top of the tower.", "雖然艾瑪畏高，但她仍爬到塔頂。", "Although Emma was afraid of heights, she climbed to the top of the tower."],
    [27, 6, 13, "The company made a profit. However, it did not hire more staff.", "公司錄得盈利。不過，它沒有增聘員工。", "Although", "Although the company made a profit, it did not hire more staff.", "雖然公司錄得盈利，但它沒有增聘員工。", "Although the company made a profit, it did not hire more staff."],
    [28, 6, 13, "Despite the medicine’s unpleasant taste, the child took it without complaining.", "儘管藥物味道難聞，那個孩子仍毫無怨言地服下。", "Although", "Although the medicine tasted unpleasant, the child took it without complaining.", "雖然藥物味道難聞，但那個孩子仍毫無怨言地服下。", "Although the medicine tasted unpleasant, the child took it without complaining."],
    [29, 6, 13, "The library was about to close, yet the staff helped us find the book.", "圖書館快要關門，但職員仍協助我們找到那本書。", "Although", "Although the library was about to close, the staff helped us find the book.", "雖然圖書館快要關門，但職員仍協助我們找到那本書。", "Although the library was about to close, the staff helped us find the book."],
    [30, 6, 13, "The flat has no balcony, but it receives plenty of natural light.", "這個單位沒有露台，但有充足的天然光。", "Although", "Although the flat has no balcony, it receives plenty of natural light.", "雖然這個單位沒有露台，但有充足的天然光。", "Although the flat has no balcony, it receives plenty of natural light."],
    [31, 6, 13, "Despite the flight being delayed by two hours, the passengers remained calm.", "儘管航班延誤了兩小時，乘客仍保持冷靜。", "Although", "Although the flight was delayed by two hours, the passengers remained calm.", "雖然航班延誤了兩小時，但乘客仍保持冷靜。", "Although the flight was delayed by two hours, the passengers remained calm."],
    [32, 7, 13, "Maya had carefully checked the report. Nevertheless, she found another error.", "瑪雅已仔細檢查報告。儘管如此，她仍發現另一個錯誤。", "Although", "Although Maya had carefully checked the report, she found another error.", "雖然瑪雅已仔細檢查報告，但她仍發現另一個錯誤。", "Although Maya had carefully checked the report, she found another error."],
    [33, 7, 13, "The village is difficult to reach. Even so, it attracts many visitors.", "這條村落很難到達。即使如此，它仍吸引很多遊客。", "Although", "Although the village is difficult to reach, it attracts many visitors.", "雖然這條村落很難到達，但它仍吸引很多遊客。", "Although the village is difficult to reach, it attracts many visitors."],
    [34, 7, 13, "The school had limited space, but it created a quiet reading area.", "學校空間有限，但仍設立了一個安靜的閱讀區。", "Although", "Although the school had limited space, it created a quiet reading area.", "雖然學校空間有限，但仍設立了一個安靜的閱讀區。", "Although the school had limited space, it created a quiet reading area."],
    [35, 7, 13, "Despite the restaurant being full, the staff found us a table.", "儘管餐廳已滿座，職員仍為我們找到一張桌子。", "Although", "Although the restaurant was full, the staff found us a table.", "雖然餐廳已滿座，但職員仍為我們找到一張桌子。", "Although the restaurant was full, the staff found us a table."],
    [36, 7, 14, "Leo had been warned about the strong wind, but he went sailing.", "里奧已獲提醒風勢強勁，但他仍出海航行。", "Although", "Although Leo had been warned about the strong wind, he went sailing.", "雖然里奧已獲提醒風勢強勁，但他仍出海航行。", "Although Leo had been warned about the strong wind, he went sailing."],
    [37, 7, 14, "The printer had just been repaired. However, it stopped working again.", "打印機剛剛修理好。不過，它又停止運作。", "Although", "Although the printer had just been repaired, it stopped working again.", "雖然打印機剛剛修理好，但它又停止運作。", "Although the printer had just been repaired, it stopped working again."],
    [38, 7, 14, "Aisha speaks softly, yet everyone listens carefully to her.", "艾莎說話聲音輕柔，但每個人都仔細聆聽她說話。", "Although", "Although Aisha speaks softly, everyone listens carefully to her.", "雖然艾莎說話聲音輕柔，但每個人都仔細聆聽她說話。", "Although Aisha speaks softly, everyone listens carefully to her."],
    [39, 8, 14, "Despite the amount of time required by the task, the volunteers completed it before sunset.", "儘管這項任務需要很多時間，義工仍在日落前完成了。", "Although", "Although the task required a lot of time, the volunteers completed it before sunset.", "雖然這項任務需要很多時間，但義工仍在日落前完成了。", "Although the task required a lot of time, the volunteers completed it before sunset."],
    [40, 8, 14, "The path was covered with wet leaves, but the hikers reached the campsite safely.", "小徑鋪滿濕滑的樹葉，但遠足者仍安全抵達營地。", "Although", "Although the path was covered with wet leaves, the hikers reached the campsite safely.", "雖然小徑鋪滿濕滑的樹葉，但遠足者仍安全抵達營地。", "Although the path was covered with wet leaves, the hikers reached the campsite safely."],
    [41, 8, 14, "Despite being short of staff, the hospital ensured that every patient received proper care.", "儘管人手短缺，醫院仍確保每名病人獲得適當照顧。", "Although", "Although the hospital was short of staff, it ensured that every patient received proper care.", "雖然醫院人手短缺，但仍確保每名病人獲得適當照顧。", "Although the hospital was short of staff, it ensured that every patient received proper care."],
    [42, 8, 14, "The new system is more expensive. Even so, it can save the company money over time.", "新系統較昂貴。即使如此，長遠而言它可以為公司節省金錢。", "Although", "Although the new system is more expensive, it can save the company money over time.", "雖然新系統較昂貴，但長遠而言它可以為公司節省金錢。", "Although the new system is more expensive, it can save the company money over time."],
    [43, 8, 14, "In spite of being new to the team, Daniel offered a useful solution.", "儘管丹尼爾剛加入團隊，他仍提出了一個有用的解決方法。", "Although", "Although Daniel was new to the team, he offered a useful solution.", "雖然丹尼爾剛加入團隊，但他仍提出了一個有用的解決方法。", "Although Daniel was new to the team, he offered a useful solution."],
    [44, 8, 14, "The town had experienced heavy rain all week, but the outdoor festival went ahead as planned.", "這個城鎮整個星期都下大雨，但戶外節慶活動仍按計劃舉行。", "Although", "Although the town had experienced heavy rain all week, the outdoor festival went ahead as planned.", "雖然這個城鎮整個星期都下大雨，但戶外節慶活動仍按計劃舉行。", "Although the town had experienced heavy rain all week, the outdoor festival went ahead as planned."],
    [45, 9, 15, "The guide explained the route twice. Nevertheless, some visitors still went the wrong way.", "導遊解釋了路線兩次。儘管如此，一些訪客仍走錯路。", "Although", "Although the guide explained the route twice, some visitors still went the wrong way.", "雖然導遊解釋了路線兩次，但一些訪客仍走錯路。", "Although the guide explained the route twice, some visitors still went the wrong way."],
    [46, 9, 15, "The device is designed for beginners. However, experienced users can also benefit from it.", "這部裝置是為初學者而設。不過，有經驗的用戶也能從中受益。", "Although", "Although the device is designed for beginners, experienced users can also benefit from it.", "雖然這部裝置是為初學者而設，但有經驗的用戶也能從中受益。", "Although the device is designed for beginners, experienced users can also benefit from it."],
    [47, 9, 15, "Despite being under pressure to finish quickly, the workers followed every safety rule.", "儘管工人承受着要盡快完成工作的壓力，他們仍遵守每項安全規則。", "Although", "Although the workers were under pressure to finish quickly, they followed every safety rule.", "雖然工人承受着要盡快完成工作的壓力，但他們仍遵守每項安全規則。", "Although the workers were under pressure to finish quickly, they followed every safety rule."],
    [48, 9, 15, "Sofia had not slept well the night before. Nevertheless, she remained focused throughout the interview.", "蘇菲亞前一晚睡得不好。儘管如此，她在整個面試期間仍保持專注。", "Although", "Although Sofia had not slept well the night before, she remained focused throughout the interview.", "雖然蘇菲亞前一晚睡得不好，但她在整個面試期間仍保持專注。", "Although Sofia had not slept well the night before, she remained focused throughout the interview."],
    [49, 9, 15, "Despite its small budget, the community centre provides a wide range of activities for local families.", "儘管社區中心預算不多，它仍為區內家庭提供多種活動。", "Although", "Although the community centre has a small budget, it provides a wide range of activities for local families.", "雖然社區中心預算不多，但它仍為區內家庭提供多種活動。", "Although the community centre has a small budget, it provides a wide range of activities for local families."],
    [50, 9, 15, "The proposal could improve public transport. However, some residents oppose it because they are worried about construction noise.", "這項建議可以改善公共交通。不過，一些居民因擔心施工噪音而反對。", "Although", "Although the proposal could improve public transport, some residents oppose it because they are worried about construction noise.", "雖然這項建議可以改善公共交通，但一些居民因擔心施工噪音而反對。", "Although the proposal could improve public transport, some residents oppose it because they are worried about construction noise."]
  ]);

  const althoughLesson = {
    id: "ss4",
    order: 4,
    slug: "although-concession-contrast",
    title: "「Although 句」句型",
    titleZh: "「Although 句」表達讓步與對比",
    titleEn: "Using Although to express concession and contrast",
    titleEnSource: "editorial-translation",
    source: {
      file: "Sentence Structure 4.pdf",
      pageCount: 15,
      lessonPages: [1],
      exercisePages: [2, 3, 4, 5, 6, 7, 8, 9],
      answerPages: [10, 11, 12, 13, 14, 15]
    },
    formula: "Although + subject + verb + other information, subject + verb + other information",
    formulas: [
      {
        id: "ss4-formula-although",
        labelEn: "Target Structure",
        labelZh: "目標句型",
        formula: "Although + subject + verb + other information, subject + verb + other information"
      }
    ],
    example: "Although the idea sounds simple, the execution is highly demanding.",
    exampleZh: "雖然這個想法聽起來很簡單，但執行起來要求很高。",
    examples: [
      {
        id: "ss4-example-01",
        en: "Although the idea sounds simple, the execution is highly demanding.",
        zh: "雖然這個想法聽起來很簡單，但執行起來要求很高。",
        highlight: "Although the idea sounds simple, the execution is highly demanding."
      }
    ],
    meaning: {
      zh: [
        "Although 用來連接兩項真實但帶有意外對比的資料。",
        "第一部分說明一個情況，第二部分則說明一個在該情況下仍然成立、甚至有點出乎意料的結果。"
      ]
    },
    rules: [
      {
        id: "ss4-rule-01",
        en: "Although must be followed by a complete clause.",
        zh: "Although 後面必須接完整子句。",
        examples: ["Although the idea sounds simple, …"]
      },
      {
        id: "ss4-rule-02",
        en: "When an Although clause comes at the beginning of a sentence, add a comma after it.",
        zh: "Although 子句放在句首時，後面要加逗號。",
        examples: ["Although it was raining, we went outside."]
      },
      {
        id: "ss4-rule-03",
        en: "Do not use although and but together in the same sentence.",
        zh: "同一句中不要同時使用 although 和 but。",
        examples: [
          "Incorrect: Although it was raining, but we went outside.",
          "Correct: Although it was raining, we went outside."
        ]
      }
    ],
    sourceOmissions: [
      "The PDF gives the Important Rules explanations in Chinese only; the English rule fields and lesson titleEn are editorial translations."
    ],
    benefits: [
      {
        id: "ss4-benefit-01",
        en: "It connects two contrasting facts clearly.",
        zh: "它能把兩項看似相反或出乎意料的事實清楚地連接起來。"
      },
      {
        id: "ss4-benefit-02",
        en: "It makes your English sound smoother.",
        zh: "它能避免使用太多零碎短句，令英語表達更加流暢。"
      },
      {
        id: "ss4-benefit-03",
        en: "It helps you explain balanced ideas.",
        zh: "它能幫助你同時考慮兩方面，特別適合日常解釋、意見寫作、DSE及IELTS。"
      }
    ],
    instructions: {
      en: [
        "Rewrite each sentence using Although to express contrast.",
        "Begin each answer with Although.",
        "The first word of each answer has been provided."
      ],
      zh: [
        "使用 Although 改寫以下句子，以表達讓步或對比。",
        "每個答案須以 Although 開始。",
        "每題已提供答案的第一個字。"
      ]
    },
    questions: althoughQuestions
  };

  const importedLessons = Array.isArray(window.EDMUND_SENTENCE_STRUCTURE_EXPANSION)
    ? window.EDMUND_SENTENCE_STRUCTURE_EXPANSION
    : [];

  window.EDMUND_SENTENCE_STRUCTURE_DATA = Object.freeze({
    version: 1,
    lessons: [
      purposeLesson,
      adjectiveNounLesson,
      adjectiveInfinitiveLesson,
      althoughLesson,
      ...importedLessons
    ]
  });
})();
