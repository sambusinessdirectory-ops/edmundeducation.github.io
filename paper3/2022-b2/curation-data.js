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
    src: 'https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/public-audio-relay/DSE%20Listening%20-%20Recordings/DSE%202022%20Part%20B.mp3',
    sha256: 'fc303a195a2d87f836d2097fd0d352ce79e8e489ec84ccc7a727bcbd7a6299f9',
    duration: 445.37,
    cues: [
      { time: 0, heading: 'Programme opening', type: 5, note: '先辨認 Julia、Pris 和 Rick 的身分；這是資料來源，不是答案。' },
      { time: 31, heading: 'Awards', type: 1, note: '2021 Neon Award：補足 Task 8 的 recognition。', answer: '2021 Neon Award' },
      { time: 55, heading: 'Products and services', type: 6, note: 'UFO 尺寸、價錢、skyline 上架日和生日牌主要是陪跑資料。' },
      { time: 183, heading: 'History', type: 1, note: 'Pris 於 1980 決定創業，先向當時亞洲第一的 neon master Rick 受訓。', answer: '1980 idea · trained by Rick Lai' },
      { time: 231, heading: 'History continued', type: 1, note: '六個月艱苦訓練後，Pris 於 1981 年創辦公司。', answer: 'six months · founded in 1981' },
      { time: 273, heading: 'Jobs', type: 6, note: '招聘 trainees 的細節屬 B1 主線；對 B2 三題不直接有用。', answer: 'trainees · paid six-month training · September' },
      { time: 350, heading: '3D projections', type: 3, note: '科幻片式巨型移動 3D 投影目前仍不存在；公司只能用技巧製造 3D-like effects。', answer: 'technology does not currently exist · 3D-like tricks' },
      { time: 391, heading: 'Why neon lasts', type: 3, note: 'neon 來自星體內部；顧客也珍惜製作霓虹的 art and craft。', answer: 'inside stars · art and craft' }
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
