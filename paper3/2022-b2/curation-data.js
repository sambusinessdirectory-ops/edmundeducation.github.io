(function () {
  'use strict';

  const types = {
    1: { label: 'Task 8 直接可用', short: 'T8', next: '放入公司歷史的時間線，並改寫成網站語氣。' },
    2: { label: 'Task 9 直接可用', short: 'T9', next: '用來正面回應居民的憂慮，保持關心而不推卸責任。' },
    3: { label: 'Task 10 直接可用', short: 'T10', next: '放入演說相應段落，補上解釋或評價。' },
    4: { label: '語義相關／可轉述', short: '轉述', next: '只取意思；按文體和受眾重新表達。' },
    5: { label: '提示／指路／篩選', short: '路標', next: '不要當成正文；用它判斷資料來源、文體和取捨。' },
    6: { label: '無關噪音／行政字樣', short: '排除', next: '不寫入答案；把字數留給任務要求。' }
  };

  const tasks = [
    { id: 8, title: '公司網站簡史', purpose: '創辦靈感、公司命名、夢想成真、1990 年後的增長與認可。', sources: '剪報、日記、業績報告、podcast' },
    { id: 9, title: '回覆居民協會', purpose: '回應 light pollution 和 rotating cube safety，並提出會面。', sources: '居民電郵、新聞附件、會議紀錄、EPD 指引' },
    { id: 10, title: '藝術館開幕演說', purpose: '3D projection、drone displays、neon 的 lasting appeal。', sources: '產品冊、旅遊博客、顧客調查、會議紀錄、podcast' }
  ];

  const podcast = {
    src: 'https://edmund-neural-audio.edmundeducation.workers.dev/DSE%20Listening%20-%20Recordings/DSE%202022%20Part%20B.mp3',
    sha256: 'fc303a195a2d87f836d2097fd0d352ce79e8e489ec84ccc7a727bcbd7a6299f9',
    duration: 445.37,
    cues: [
      { id: 'opening', from: 0, at: 30.8, heading: 'Programme opening', type: 5, field: null, note: '先辨認 Julia、Pris 和 Rick 的身分；這是資料來源，不是答案。' },
      { id: 'awards', from: 30.8, at: 54.8, heading: 'Awards', type: 1, task: 'A', field: '3-1', note: '2021 Neon Award', help: '獎項名稱和年份都是 Task 8 recognition 的直接證據。' },
      { id: 'products', from: 54.8, at: 182.8, heading: 'Products and services', type: 6, field: '3-2', note: 'UFO sizes and price; Hong Kong Skyline available 7 June; custom neon signs', help: '這些是聆聽筆記答案，但不應直接搬入三篇 B2 寫作。' },
      { id: 'history-start', from: 182.8, at: 230.8, heading: 'History', type: 1, task: 'A', field: '3-3', note: '1980: decided to start company; trained by Rick Lai, Asia’s no. 1 neon master', help: '先分清 1980 的構思和 1981 的正式創辦。' },
      { id: 'history-finish', from: 230.8, at: 272.8, heading: 'History continued', type: 1, task: 'A', field: '3-3', note: 'Six months of hard training; founded Shiny Diamond Lighting in 1981', help: '六個月訓練和 1981 創辦年份完成 Task 8 的 dream-to-reality 時間線。' },
      { id: 'jobs', from: 272.8, at: 349.8, heading: 'Jobs', type: 6, field: '3-4', note: 'Trainees; six months’ paid training; programme starts in September', help: '這是筆記表答案，但屬招聘干擾，不能誤當 Pris 當年的訓練。' },
      { id: 'projections', from: 349.8, at: 390.8, heading: '3D projections', type: 3, task: 'C', field: '3-5', note: 'Science-fiction 3D technology does not currently exist; 3D-like effects use tricks', help: '先交代真正科幻式投影仍不存在，再連到產品冊的 3D-like examples。' },
      { id: 'neon', from: 390.8, at: 443.5, heading: 'Why neon lasts', type: 3, task: 'C', field: '3-5', note: 'Neon gas comes from inside stars; customers value its art and craft', help: '這兩個理由支援 Task 10 的 lasting appeal。' }
    ],
    transcript: [
      { section: 'Awards', start: 0, end: 10, speaker: 'Julia', type: 5, text: 'Hello listeners wherever you are, and once again I Wish You Were Here with my two spectacular guests: Pris Fong, owner of Shiny Diamond Lighting, and the company’s chief designer and neon artist Rick Lai.', translation: '主持介紹公司東主 Pris Fong，以及首席設計師兼霓虹藝術家 Rick Lai。' },
      { section: 'Awards', start: 10, end: 18, speaker: 'Pris / Rick', type: 6, text: 'My pleasure, Julia, to be here. Hello everyone.', translation: '嘉賓向主持和聽眾問好。' },
      { section: 'Awards', start: 18, end: 35, speaker: 'Julia', type: 5, text: 'Now Pris, your company has not only been a sparkling success, but you have won many prestigious awards. Which award means the most to you though?', translation: '主持問哪一個獎項對公司最重要。' },
      { section: 'Awards', start: 35, end: 43, speaker: 'Pris', type: 1, task: 'A', text: 'Well, it has to be the one we were awarded last year—the 2021 Neon Award.', translation: '公司去年獲得 2021 Neon Award。' },
      { section: 'Awards', start: 43, end: 54.8, speaker: 'Julia / Pris', type: 1, task: 'A', text: 'It’s an award given to companies who make neon lights. Winning the 2021 Neon Award is something we are very, very proud of.', translation: '這是頒給霓虹燈公司的獎項，公司對得獎非常自豪。' },
      { section: 'Products and services', start: 54.8, end: 92, speaker: 'Julia / Rick', type: 6, text: 'The UFO comes in green or yellow, in large and small sizes. The small UFO costs $600.', translation: 'UFO 有綠色或黃色及大小型號，小型售六百元。' },
      { section: 'Products and services', start: 92, end: 126, speaker: 'Julia / Rick', type: 6, text: 'The Hong Kong Skyline can cover a wall and will be available on the 7th of June.', translation: 'Hong Kong Skyline 可覆蓋整面牆，六月七日推出。' },
      { section: 'Products and services', start: 126, end: 158, speaker: 'Rick', type: 6, text: 'Customers can send designs through the webpage and the neon artists will make them into neon signs.', translation: '顧客可經網頁提交設計，由霓虹藝術家製成招牌。' },
      { section: 'Products and services', start: 158, end: 182.8, speaker: 'Rick', type: 6, text: 'Birthday cake signs can show the birthday boy or girl’s name and age.', translation: '生日蛋糕招牌可顯示壽星名字和年齡。' },
      { section: 'History', start: 182.8, end: 203, speaker: 'Julia / Pris', type: 1, task: 'A', text: 'In 1980, when I decided I wanted to start my own company, I realised I needed training from the best—and the best was Rick.', translation: 'Pris 在 1980 年決定創業，明白要先向最好的 Rick 學習。' },
      { section: 'History', start: 203, end: 231, speaker: 'Pris', type: 1, task: 'A', text: 'I was thinking about starting a company in 1980, but I did not actually found the company until 1981. I needed to get trained first.', translation: '1980 年只是構思；接受訓練後，到 1981 年才正式創辦公司。' },
      { section: 'History', start: 231, end: 251, speaker: 'Pris', type: 1, task: 'A', text: 'Rick Lai was the number one neon master in Asia. Once I had finished my training with Rick, I founded Shiny Diamond Lighting.', translation: 'Rick 當時是亞洲第一霓虹大師；Pris 完成訓練後創辦公司。' },
      { section: 'History', start: 251, end: 272.8, speaker: 'Pris', type: 1, task: 'A', text: 'Rick trained me for six months. It was six long months of learning and very hard work.', translation: 'Rick 訓練她六個月，過程漫長而艱苦。' },
      { section: 'Jobs', start: 272.8, end: 315, speaker: 'Pris', type: 6, text: 'We are looking for trainees to become neon light makers. We will train each trainee for six months and they will be paid.', translation: '公司招聘霓虹燈製作學員，提供六個月有薪訓練。' },
      { section: 'Jobs', start: 315, end: 349.8, speaker: 'Julia / Pris', type: 6, text: 'Six months of paid training is a wonderful opportunity. The training programme will start in September this year.', translation: '有薪訓練計劃於今年九月開始。' },
      { section: '3D projections and neon', start: 349.8, end: 370, speaker: 'Julia / Rick', type: 3, task: 'C', text: 'The technology to produce the kind of 3D projections we see in science-fiction films does not currently exist.', translation: '科幻電影式的真正 3D 投影技術目前仍不存在。' },
      { section: '3D projections and neon', start: 370, end: 390.8, speaker: 'Rick', type: 3, task: 'C', text: 'However, we can still create a kind of 3D projection using certain tricks. Our brochure highlights two futuristic 3D projection products.', translation: '公司可用技巧製造 3D-like 效果，產品冊有兩個例子。' },
      { section: '3D projections and neon', start: 390.8, end: 407, speaker: 'Pris', type: 3, task: 'C', text: 'Of course, people will always love neon. Neon gas comes from the inside of stars.', translation: '人們會一直喜愛霓虹；霓虹氣體來自恆星內部。' },
      { section: '3D projections and neon', start: 407, end: 427, speaker: 'Rick', type: 3, task: 'C', text: 'Customers love the art and craft of neon. That is why they prefer neon signs to newer technologies like LEDs.', translation: '顧客珍惜霓虹的藝術與工藝，所以寧選霓虹而非 LED。' },
      { section: '3D projections and neon', start: 427, end: 443.5, speaker: 'Pris / Julia', type: 5, text: 'Customers do love the art and craft of neon. Thank you both for a very illuminating discussion.', translation: 'Pris 確認顧客喜愛霓虹工藝，主持結束訪問。' }
    ]
  };

  const essays = [
    {
      task: 8,
      title: 'A Short History of Shiny Diamond Lighting Ltd',
      paragraphs: [
        'Shiny Diamond Lighting Ltd began with a life-changing experience. In 1980, our founder, Pris Fong, was injured while climbing Manaslu in Nepal. During her recovery, she began to reflect on her future and decided to pursue a new dream: starting her own company and making neon lights.',
        'Turning a Dream into Reality',
        'The company’s name was also inspired by this experience. As Ms Fong left the mountain by helicopter, she saw the icy peak shining in the sun and made a sketch of the unforgettable view. That image later inspired the name “Shiny Diamond”. After returning to Hong Kong, she took the first practical step towards her dream by receiving training from Rick Lai, then Asia’s leading neon master. After six months of hard work, she founded the company in 1981.',
        'Growth and Recognition',
        'Since 1990, Shiny Diamond Lighting Ltd has grown remarkably. Staff numbers have risen from 14 to 65, while profits have increased from HK$20 million to HK$214 million. In 2021, the company won the Neon Award, and by 2022 it had become the second largest lighting company in Asia.'
      ],
      guide: [
        ['Shiny Diamond Lighting Ltd began with a life-changing experience.', '以概括句開段，建立正面的公司網站語氣。', 'Task 8 brief'],
        ['In 1980, our founder, Pris Fong, was injured while climbing Manaslu in Nepal.', '用年份、人物和事件建立清楚時間線。', 'DF pp.5–6'],
        ['During her recovery, she began to reflect on her future and decided to pursue a new dream: starting her own company and making neon lights.', '把日記的零散想法整合成「創辦靈感」。', 'DF p.6'],
        ['The company’s name was also inspired by this experience.', '小標題後用主題句轉入命名來源。', 'Task 8 brief'],
        ['As Ms Fong left the mountain by helicopter, she saw the icy peak shining in the sun and made a sketch of the unforgettable view.', '把直升機、陽光和素描三項證據合成完整句。', 'DF p.6'],
        ['That image later inspired the name “Shiny Diamond”.', '明確回答公司名稱怎樣來。', 'DF pp.5–6'],
        ['After returning to Hong Kong, she took the first practical step towards her dream by receiving training from Rick Lai, then Asia’s leading neon master.', '把 listening 的 trainer 資料接到日記的「new adventure」。', 'Podcast + DF p.6'],
        ['After six months of hard work, she founded the company in 1981.', '用訓練長度和創辦年份完成 dream-to-reality。', 'Podcast'],
        ['Since 1990, Shiny Diamond Lighting Ltd has grown remarkably.', '時間標記直接對應題目要求。', 'Task 8 brief'],
        ['Staff numbers have risen from 14 to 65, while profits have increased from HK$20 million to HK$214 million.', '選圖表首尾數據，用 while 壓縮比較。', 'DF p.7'],
        ['In 2021, the company won the Neon Award, and by 2022 it had become the second largest lighting company in Asia.', '用獎項和排名同時完成 recognition。', 'Podcast + DF p.7']
      ]
    },
    {
      task: 9,
      title: 'Formal Reply Email',
      paragraphs: [
        'Dear Mr Chan,',
        'Thank you for your email. I am writing to respond to the concerns raised by the Wan Yuen Estate Residents’ Association regarding the proposed lighting display at Fortune Phoenix Towers.',
        'Firstly, regarding light pollution, Shiny Diamond Lighting Ltd strictly adheres to the Light Emission Guidelines issued by the Environmental Protection Department. According to the guidelines, outdoor lighting must not exceed levels that interfere with human sleep. In addition, by law, all outdoor lighting displays must be dimmed by the building’s management by 11 p.m.',
        'Secondly, concerning the safety of the rotating cube, we understand why residents are worried. However, the 2015 incident mentioned in your email was later confirmed by an independent team of engineers to have been caused by poor maintenance. The original installation had, in fact, passed all safety checks. Since then, our company has worked closely with each building’s management office to ensure regular maintenance is carried out.',
        'Our company cares deeply about residents living near our lighting displays. Should you wish to discuss this matter further, we would be pleased to meet members of your Association at a convenient time.',
        'Yours sincerely,\nNico Lin'
      ],
      guide: [
        ['Thank you for your email. I am writing to respond to the concerns raised by the Wan Yuen Estate Residents’ Association regarding the proposed lighting display at Fortune Phoenix Towers.', '先確認來信目的，語氣正式而直接。', 'DF p.9'],
        ['Firstly, regarding light pollution, Shiny Diamond Lighting Ltd strictly adheres to the Light Emission Guidelines issued by the Environmental Protection Department.', '第一個 concerns 用清晰路標和公司承諾回應。', 'DF p.7'],
        ['According to the guidelines, outdoor lighting must not exceed levels that interfere with human sleep.', '引用真正相關的 EPD 規則作證據。', 'DF p.7'],
        ['In addition, by law, all outdoor lighting displays must be dimmed by the building’s management by 11 p.m.', '補入會議紀錄的新資料，不能只抄舊附件。', 'DF p.11'],
        ['Secondly, concerning the safety of the rotating cube, we understand why residents are worried.', '先承認憂慮，避免只顧辯解。', 'DF p.9'],
        ['However, the 2015 incident mentioned in your email was later confirmed by an independent team of engineers to have been caused by poor maintenance.', '準確重述調查結果，但不談 fault/liability。', 'DF pp.10–11'],
        ['The original installation had, in fact, passed all safety checks.', '補上對公司有利且可核實的事實。', 'DF p.10'],
        ['Since then, our company has worked closely with each building’s management office to ensure regular maintenance is carried out.', '以事故後的改善措施恢復信心。', 'DF p.11'],
        ['Our company cares deeply about residents living near our lighting displays.', '依上司指示明確表達關心。', 'DF p.11'],
        ['Should you wish to discuss this matter further, we would be pleased to meet members of your Association at a convenient time.', '用禮貌條件句提出會面，完成 action point。', 'DF p.11']
      ]
    },
    {
      task: 10,
      title: 'Short Speech',
      paragraphs: [
        '(Continuation after the introduction supplied in the Question-Answer Book)',
        'I would like to begin by talking about 3D projection technology. Although the enormous moving projections in science-fiction films are not yet possible, we can create convincing 3D-like effects. The Breeze uses a rotating blade of light, while The Wall projects images onto a wall of water. These products show what clever design can already achieve.',
        'Now let me turn to drone displays. The spectacular show at the Tokyo Olympic Games Opening Ceremony showed their promise. Nevertheless, programming thousands of drones is complicated and expensive. There are also safety concerns: such displays require good weather, which limits when they can be used.',
        'Last but not least, neon lights retain a special appeal. In our latest survey, 93% of customers chose their warm glow as the feature they loved most. Neon gas comes from inside stars, a fact that still amazes our customers. They also appreciate the art and craft behind every neon sign. The combination of human skill and that warm, familiar light gives neon a lasting place in our cities.',
        'We will continue to explore new technology while keeping neon central to our work. Thank you.'
      ],
      guide: [
        ['I would like to begin by talking about 3D projection technology.', '演說路標承接題目提供的 introduction。', 'QAB Task 10'],
        ['Although the enormous moving projections in science-fiction films are not yet possible, we can create convincing 3D-like effects.', '用 although 對比目前限制和可行方向。', 'Podcast'],
        ['The Breeze uses a rotating blade of light, while The Wall projects images onto a wall of water.', '選兩個產品作具體例子。', 'DF p.8'],
        ['These products show what clever design can already achieve.', '不要只列資料；加一句評價連回「未來」。', 'Inference from DF p.8'],
        ['Now let me turn to drone displays.', '口語化轉折清楚標示第二部分。', 'Task 10 brief'],
        ['The spectacular show at the Tokyo Olympic Games Opening Ceremony showed their promise.', '用博客事件支持 drones 的潛力。', 'DF p.5'],
        ['Nevertheless, programming thousands of drones is complicated and expensive.', '保留博客專家提出的兩項限制。', 'DF p.5'],
        ['There are also safety concerns: such displays require good weather, which limits when they can be used.', '把會議紀錄的天氣限制轉成安全評價。', 'DF p.11'],
        ['Last but not least, neon lights retain a special appeal.', '第三段主題句直接回答 lasting appeal。', 'Task 10 brief'],
        ['In our latest survey, 93% of customers chose their warm glow as the feature they loved most.', '精選最有說服力的調查數據。', 'DF p.8'],
        ['Neon gas comes from inside stars, a fact that still amazes our customers.', '加入 listening 的 memorable fact。', 'Podcast'],
        ['They also appreciate the art and craft behind every neon sign.', '補上顧客偏愛 neon 而非 LED 的原因。', 'Podcast'],
        ['The combination of human skill and that warm, familiar light gives neon a lasting place in our cities.', '綜合兩個來源形成自己的結論。', 'Synthesis'],
        ['We will continue to explore new technology while keeping neon central to our work.', '收結三個主題並重申公司方向。', 'DF p.11 + synthesis']
      ]
    }
  ];

  window.EDMUND_2022_B2_CURATION = { version: '2026-11-11', types, tasks, podcast, essays };
}());
