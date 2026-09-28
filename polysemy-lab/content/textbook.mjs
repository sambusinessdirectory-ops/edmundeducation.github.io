export default {
  "id": "textbook",
  "word": "textbook",
  "number": 364,
  "version": 1,
  "mass": true,
  "senses": [
    {
      "id": "textbook-01",
      "title": "教科書",
      "form": "textbook = educational book for a subject（教學用書）",
      "en": "A book designed to teach a particular subject systematically, especially in school,",
      "zh": "教科書",
      "note": "留意語境：textbook = educational book for a subject（教學用書）。這裡指「教科書」。",
      "examples": [
        [
          "Old tram routes can tell you more about a city than a history textbook.",
          "舊電車路線比歷史教科書更能告訴你一座城市的故事。",
          "教科書"
        ],
        [
          "Students must bring their science textbooks to class.",
          "學生必須把科學教科書帶到課堂上。",
          "教科書"
        ],
        [
          "The course uses a new economics textbook.",
          "這門課使用一本新的經濟學教科書。",
          "教科書"
        ]
      ],
      "options": [
        "textbook-01",
        "textbook-02",
        "textbook-03"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "textbook-02",
      "title": "標準典型的；教科書式的",
      "form": "textbook + example/case（典型例子）",
      "en": "Perfectly or very clearly showing the typical features of a particular situation, pattern,",
      "zh": "標準典型的；教科書式的",
      "note": "留意語境：textbook + example/case（典型例子）。這裡指「標準典型的；教科書式的」。",
      "examples": [
        [
          "This is a textbook example of poor planning.",
          "這是一個非常典型／教科書式的規劃失誤例子。",
          "標準典型的；教科書式的"
        ],
        [
          "The patient showed textbook symptoms of the condition.",
          "病人出現了這種情況的典型症狀。",
          "標準典型的；教科書式的"
        ]
      ],
      "options": [
        "textbook-02",
        "textbook-03",
        "textbook-01"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "textbook-03",
      "title": "標準",
      "form": "textbook = done exactly according to standard principles/procedure（標準規範的）",
      "en": "textbook = done exactly according to standard principles/procedure（標準規範的）",
      "zh": "標準",
      "note": "留意語境：textbook = done exactly according to standard principles/procedure（標準規範的）。這裡指「標準」。",
      "examples": [
        [
          "The goalkeeper made a textbook save.",
          "守門員完成了一次標準而教科書式的撲救。",
          "標準"
        ],
        [
          "It was a textbook landing.",
          "那是一次完全符合標準的完美降落。",
          "標準"
        ],
        [
          "The explanation was clear but slightly textbook-like.",
          "這個解釋很清楚，但有點像教科書式、較生硬正式。",
          "標準"
        ],
        [
          "Her answer sounded too textbook-like for a casual conversation.",
          "她的回答在日常對話中聽起來太教科書式／太正式生硬。",
          "標準"
        ]
      ],
      "options": [
        "textbook-03",
        "textbook-01",
        "textbook-02"
      ],
      "excludedOverlaps": []
    }
  ],
  "questions": [
    {
      "id": "textbook-01-0",
      "sense": "textbook-01",
      "en": "Old tram routes can tell you more about a city than a history textbook.",
      "zh": "舊電車路線比歷史教科書更能告訴你一座城市的故事。",
      "masked": "Old tram routes can tell you more about a city than a history ____.",
      "options": [
        "textbook-01",
        "textbook-02",
        "textbook-03"
      ],
      "explanation": "留意語境：textbook = educational book for a subject（教學用書）。這裡指「教科書」。",
      "sentenceIndex": 0,
      "sourcePractice": 1,
      "targets": [
        "textbook"
      ],
      "optionReasons": {
        "textbook-01": "本句的意思是「教科書」。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。",
        "textbook-03": "「標準」與本句語境不同。"
      }
    },
    {
      "id": "textbook-01-1",
      "sense": "textbook-01",
      "en": "Students must bring their science textbooks to class.",
      "zh": "學生必須把科學教科書帶到課堂上。",
      "masked": "Students must bring their science ____ to class.",
      "options": [
        "textbook-01",
        "textbook-02",
        "textbook-03"
      ],
      "explanation": "留意語境：textbook = educational book for a subject（教學用書）。這裡指「教科書」。",
      "sentenceIndex": 1,
      "sourcePractice": 2,
      "targets": [
        "textbooks"
      ],
      "optionReasons": {
        "textbook-01": "本句的意思是「教科書」。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。",
        "textbook-03": "「標準」與本句語境不同。"
      }
    },
    {
      "id": "textbook-01-2",
      "sense": "textbook-01",
      "en": "The course uses a new economics textbook.",
      "zh": "這門課使用一本新的經濟學教科書。",
      "masked": "The course uses a new economics ____.",
      "options": [
        "textbook-01",
        "textbook-02",
        "textbook-03"
      ],
      "explanation": "留意語境：textbook = educational book for a subject（教學用書）。這裡指「教科書」。",
      "sentenceIndex": 2,
      "sourcePractice": 3,
      "targets": [
        "textbook"
      ],
      "optionReasons": {
        "textbook-01": "本句的意思是「教科書」。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。",
        "textbook-03": "「標準」與本句語境不同。"
      }
    },
    {
      "id": "textbook-02-0",
      "sense": "textbook-02",
      "en": "This is a textbook example of poor planning.",
      "zh": "這是一個非常典型／教科書式的規劃失誤例子。",
      "masked": "This is a ____ of poor planning.",
      "options": [
        "textbook-02",
        "textbook-03",
        "textbook-01"
      ],
      "explanation": "留意語境：textbook + example/case（典型例子）。這裡指「標準典型的；教科書式的」。",
      "sentenceIndex": 3,
      "sourcePractice": 4,
      "targets": [
        "textbook example"
      ],
      "optionReasons": {
        "textbook-02": "本句的意思是「標準典型的；教科書式的」。",
        "textbook-03": "「標準」與本句語境不同。",
        "textbook-01": "「教科書」與本句語境不同。"
      }
    },
    {
      "id": "textbook-02-1",
      "sense": "textbook-02",
      "en": "The patient showed textbook symptoms of the condition.",
      "zh": "病人出現了這種情況的典型症狀。",
      "masked": "The patient showed ____ of the condition.",
      "options": [
        "textbook-02",
        "textbook-03",
        "textbook-01"
      ],
      "explanation": "留意語境：textbook + example/case（典型例子）。這裡指「標準典型的；教科書式的」。",
      "sentenceIndex": 4,
      "sourcePractice": 5,
      "targets": [
        "textbook symptoms"
      ],
      "optionReasons": {
        "textbook-02": "本句的意思是「標準典型的；教科書式的」。",
        "textbook-03": "「標準」與本句語境不同。",
        "textbook-01": "「教科書」與本句語境不同。"
      }
    },
    {
      "id": "textbook-03-0",
      "sense": "textbook-03",
      "en": "The goalkeeper made a textbook save.",
      "zh": "守門員完成了一次標準而教科書式的撲救。",
      "masked": "The goalkeeper made a ____.",
      "options": [
        "textbook-03",
        "textbook-01",
        "textbook-02"
      ],
      "explanation": "留意語境：textbook = done exactly according to standard principles/procedure（標準規範的）。這裡指「標準」。",
      "sentenceIndex": 5,
      "sourcePractice": 6,
      "targets": [
        "textbook save"
      ],
      "optionReasons": {
        "textbook-03": "本句的意思是「標準」。",
        "textbook-01": "「教科書」與本句語境不同。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。"
      }
    },
    {
      "id": "textbook-03-1",
      "sense": "textbook-03",
      "en": "It was a textbook landing.",
      "zh": "那是一次完全符合標準的完美降落。",
      "masked": "It was a ____.",
      "options": [
        "textbook-03",
        "textbook-01",
        "textbook-02"
      ],
      "explanation": "留意語境：textbook = done exactly according to standard principles/procedure（標準規範的）。這裡指「標準」。",
      "sentenceIndex": 6,
      "sourcePractice": 7,
      "targets": [
        "textbook landing"
      ],
      "optionReasons": {
        "textbook-03": "本句的意思是「標準」。",
        "textbook-01": "「教科書」與本句語境不同。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。"
      }
    },
    {
      "id": "textbook-03-2",
      "sense": "textbook-03",
      "en": "The explanation was clear but slightly textbook-like.",
      "zh": "這個解釋很清楚，但有點像教科書式、較生硬正式。",
      "masked": "The explanation was clear but slightly ____.",
      "options": [
        "textbook-03",
        "textbook-01",
        "textbook-02"
      ],
      "explanation": "留意語境：textbook = done exactly according to standard principles/procedure（標準規範的）。這裡指「標準」。",
      "sentenceIndex": 7,
      "sourcePractice": 8,
      "targets": [
        "textbook-like"
      ],
      "optionReasons": {
        "textbook-03": "本句的意思是「標準」。",
        "textbook-01": "「教科書」與本句語境不同。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。"
      }
    },
    {
      "id": "textbook-03-3",
      "sense": "textbook-03",
      "en": "Her answer sounded too textbook-like for a casual conversation.",
      "zh": "她的回答在日常對話中聽起來太教科書式／太正式生硬。",
      "masked": "Her answer sounded too ____ for a casual conversation.",
      "options": [
        "textbook-03",
        "textbook-01",
        "textbook-02"
      ],
      "explanation": "留意語境：textbook = done exactly according to standard principles/procedure（標準規範的）。這裡指「標準」。",
      "sentenceIndex": 8,
      "sourcePractice": 9,
      "targets": [
        "textbook-like"
      ],
      "optionReasons": {
        "textbook-03": "本句的意思是「標準」。",
        "textbook-01": "「教科書」與本句語境不同。",
        "textbook-02": "「標準典型的；教科書式的」與本句語境不同。"
      }
    }
  ],
  "comparisons": [],
  "source": {
    "path": "manuals/textbook.pdf",
    "file": "364_textbook_Polysemy Exercise.pdf",
    "sha256": "632a3027a76365966fb9056298d02f3524bfb194badd0a1e39082102bf8f0e19",
    "pages": 7
  }
};
