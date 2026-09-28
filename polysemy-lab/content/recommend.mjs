export default {
  "id": "recommend",
  "word": "recommend",
  "number": 530,
  "version": 1,
  "mass": true,
  "senses": [
    {
      "id": "recommend-01",
      "title": "推薦",
      "form": "recommend = suggest something because you think it is good/suitable（推薦）",
      "en": "To tell someone that you think a person, product, book, place, service, etc. is good,",
      "zh": "推薦",
      "note": "留意語境：recommend = suggest something because you think it is good/suitable（推薦）。這裡指「推薦」。",
      "examples": [
        [
          "Several friends kept recommending the book to me.",
          "有幾位朋友一直向我推薦這本書。",
          "推薦"
        ],
        [
          "Can you recommend a good restaurant?",
          "你可以推薦一間好的餐廳嗎？",
          "推薦"
        ],
        [
          "I would highly recommend this course.",
          "我會非常推薦這門課程。",
          "推薦"
        ]
      ],
      "options": [
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "recommend-02",
      "title": "建議；勸告",
      "form": "recommend = advise a course of action（建議）",
      "en": "recommend = advise a course of action（建議）",
      "zh": "建議；勸告",
      "note": "留意語境：recommend = advise a course of action（建議）。這裡指「建議；勸告」。",
      "examples": [
        [
          "The doctor recommended more rest.",
          "醫生建議多休息。",
          "建議；勸告"
        ],
        [
          "I recommend taking the earlier train.",
          "我建議乘搭較早的火車。",
          "建議；勸告"
        ]
      ],
      "options": [
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05",
        "recommend-01"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "recommend-03",
      "title": "建議；提議",
      "form": "recommend = formally advise or propose something（正式建議）",
      "en": "recommend = formally advise or propose something（正式建議）",
      "zh": "建議；提議",
      "note": "留意語境：recommend = formally advise or propose something（正式建議）。這裡指「建議；提議」。",
      "examples": [
        [
          "The committee recommended several changes.",
          "委員會建議作出幾項修改。",
          "建議；提議"
        ],
        [
          "The report recommends further research.",
          "報告建議進一步研究。",
          "建議；提議"
        ]
      ],
      "options": [
        "recommend-03",
        "recommend-04",
        "recommend-05",
        "recommend-01",
        "recommend-02"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "recommend-04",
      "title": "推薦；舉薦",
      "form": "recommend = put someone forward as suitable（推薦某人）",
      "en": "recommend = put someone forward as suitable（推薦某人）",
      "zh": "推薦；舉薦",
      "note": "留意語境：recommend = put someone forward as suitable（推薦某人）。這裡指「推薦；舉薦」。",
      "examples": [
        [
          "She was recommended for promotion.",
          "她獲推薦晉升。",
          "推薦；舉薦"
        ],
        [
          "His manager recommended him for the position.",
          "他的經理推薦他擔任這個職位。",
          "推薦；舉薦"
        ]
      ],
      "options": [
        "recommend-04",
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "recommend-05",
      "title": "使值得考慮；使有吸引力",
      "form": "recommend = make something attractive or worthy（較正式）",
      "en": "recommend = make something attractive or worthy（較正式）",
      "zh": "使值得考慮；使有吸引力",
      "note": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "examples": [
        [
          "His experience recommends him for the role.",
          "他的經驗令他很適合／值得考慮這個職位。",
          "使值得考慮；使有吸引力"
        ],
        [
          "Its simplicity recommends it to beginners.",
          "它的簡單易用令它很適合推薦給初學者。",
          "使值得考慮；使有吸引力"
        ],
        [
          "The report makes several useful recommendations.",
          "這份報告提出了幾項有用的建議。",
          "使值得考慮；使有吸引力"
        ],
        [
          "I bought the book on a friend’s recommendation.",
          "我是因為朋友的推薦而買這本書的。",
          "使值得考慮；使有吸引力"
        ],
        [
          "She asked her professor for a recommendation.",
          "她請教授為她提供一份推薦信／推薦意見。",
          "使值得考慮；使有吸引力"
        ],
        [
          "It is a highly recommendable introduction to the subject.",
          "這是一本很值得推薦的入門書。",
          "使值得考慮；使有吸引力"
        ]
      ],
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "excludedOverlaps": []
    }
  ],
  "questions": [
    {
      "id": "recommend-01-0",
      "sense": "recommend-01",
      "en": "Several friends kept recommending the book to me.",
      "zh": "有幾位朋友一直向我推薦這本書。",
      "masked": "Several friends kept ____ the book to me.",
      "options": [
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05"
      ],
      "explanation": "留意語境：recommend = suggest something because you think it is good/suitable（推薦）。這裡指「推薦」。",
      "sentenceIndex": 0,
      "sourcePractice": 1,
      "targets": [
        "recommending"
      ],
      "optionReasons": {
        "recommend-01": "本句的意思是「推薦」。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。"
      }
    },
    {
      "id": "recommend-01-1",
      "sense": "recommend-01",
      "en": "Can you recommend a good restaurant?",
      "zh": "你可以推薦一間好的餐廳嗎？",
      "masked": "Can you ____ a good restaurant?",
      "options": [
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05"
      ],
      "explanation": "留意語境：recommend = suggest something because you think it is good/suitable（推薦）。這裡指「推薦」。",
      "sentenceIndex": 1,
      "sourcePractice": 2,
      "targets": [
        "recommend"
      ],
      "optionReasons": {
        "recommend-01": "本句的意思是「推薦」。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。"
      }
    },
    {
      "id": "recommend-01-2",
      "sense": "recommend-01",
      "en": "I would highly recommend this course.",
      "zh": "我會非常推薦這門課程。",
      "masked": "I would highly ____ this course.",
      "options": [
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05"
      ],
      "explanation": "留意語境：recommend = suggest something because you think it is good/suitable（推薦）。這裡指「推薦」。",
      "sentenceIndex": 2,
      "sourcePractice": 3,
      "targets": [
        "recommend"
      ],
      "optionReasons": {
        "recommend-01": "本句的意思是「推薦」。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。"
      }
    },
    {
      "id": "recommend-02-0",
      "sense": "recommend-02",
      "en": "The doctor recommended more rest.",
      "zh": "醫生建議多休息。",
      "masked": "The doctor ____ more rest.",
      "options": [
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05",
        "recommend-01"
      ],
      "explanation": "留意語境：recommend = advise a course of action（建議）。這裡指「建議；勸告」。",
      "sentenceIndex": 3,
      "sourcePractice": 4,
      "targets": [
        "recommended"
      ],
      "optionReasons": {
        "recommend-02": "本句的意思是「建議；勸告」。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。",
        "recommend-01": "「推薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-02-1",
      "sense": "recommend-02",
      "en": "I recommend taking the earlier train.",
      "zh": "我建議乘搭較早的火車。",
      "masked": "I ____ taking the earlier train.",
      "options": [
        "recommend-02",
        "recommend-03",
        "recommend-04",
        "recommend-05",
        "recommend-01"
      ],
      "explanation": "留意語境：recommend = advise a course of action（建議）。這裡指「建議；勸告」。",
      "sentenceIndex": 4,
      "sourcePractice": 5,
      "targets": [
        "recommend"
      ],
      "optionReasons": {
        "recommend-02": "本句的意思是「建議；勸告」。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。",
        "recommend-01": "「推薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-03-0",
      "sense": "recommend-03",
      "en": "The committee recommended several changes.",
      "zh": "委員會建議作出幾項修改。",
      "masked": "The committee ____ several changes.",
      "options": [
        "recommend-03",
        "recommend-04",
        "recommend-05",
        "recommend-01",
        "recommend-02"
      ],
      "explanation": "留意語境：recommend = formally advise or propose something（正式建議）。這裡指「建議；提議」。",
      "sentenceIndex": 5,
      "sourcePractice": 6,
      "targets": [
        "recommended"
      ],
      "optionReasons": {
        "recommend-03": "本句的意思是「建議；提議」。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。"
      }
    },
    {
      "id": "recommend-03-1",
      "sense": "recommend-03",
      "en": "The report recommends further research.",
      "zh": "報告建議進一步研究。",
      "masked": "The report ____ further research.",
      "options": [
        "recommend-03",
        "recommend-04",
        "recommend-05",
        "recommend-01",
        "recommend-02"
      ],
      "explanation": "留意語境：recommend = formally advise or propose something（正式建議）。這裡指「建議；提議」。",
      "sentenceIndex": 6,
      "sourcePractice": 7,
      "targets": [
        "recommends"
      ],
      "optionReasons": {
        "recommend-03": "本句的意思是「建議；提議」。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。"
      }
    },
    {
      "id": "recommend-04-0",
      "sense": "recommend-04",
      "en": "She was recommended for promotion.",
      "zh": "她獲推薦晉升。",
      "masked": "She was ____ for promotion.",
      "options": [
        "recommend-04",
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03"
      ],
      "explanation": "留意語境：recommend = put someone forward as suitable（推薦某人）。這裡指「推薦；舉薦」。",
      "sentenceIndex": 7,
      "sourcePractice": 8,
      "targets": [
        "recommended"
      ],
      "optionReasons": {
        "recommend-04": "本句的意思是「推薦；舉薦」。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。"
      }
    },
    {
      "id": "recommend-04-1",
      "sense": "recommend-04",
      "en": "His manager recommended him for the position.",
      "zh": "他的經理推薦他擔任這個職位。",
      "masked": "His manager ____ him for the position.",
      "options": [
        "recommend-04",
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03"
      ],
      "explanation": "留意語境：recommend = put someone forward as suitable（推薦某人）。這裡指「推薦；舉薦」。",
      "sentenceIndex": 8,
      "sourcePractice": 9,
      "targets": [
        "recommended"
      ],
      "optionReasons": {
        "recommend-04": "本句的意思是「推薦；舉薦」。",
        "recommend-05": "「使值得考慮；使有吸引力」與本句語境不同。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。"
      }
    },
    {
      "id": "recommend-05-0",
      "sense": "recommend-05",
      "en": "His experience recommends him for the role.",
      "zh": "他的經驗令他很適合／值得考慮這個職位。",
      "masked": "His experience ____ him for the role.",
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "explanation": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "sentenceIndex": 9,
      "sourcePractice": 10,
      "targets": [
        "recommends"
      ],
      "optionReasons": {
        "recommend-05": "本句的意思是「使值得考慮；使有吸引力」。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-05-1",
      "sense": "recommend-05",
      "en": "Its simplicity recommends it to beginners.",
      "zh": "它的簡單易用令它很適合推薦給初學者。",
      "masked": "Its simplicity ____ it to beginners.",
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "explanation": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "sentenceIndex": 10,
      "sourcePractice": 11,
      "targets": [
        "recommends"
      ],
      "optionReasons": {
        "recommend-05": "本句的意思是「使值得考慮；使有吸引力」。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-05-2",
      "sense": "recommend-05",
      "en": "The report makes several useful recommendations.",
      "zh": "這份報告提出了幾項有用的建議。",
      "masked": "The report makes several useful ____.",
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "explanation": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "sentenceIndex": 11,
      "sourcePractice": 12,
      "targets": [
        "recommendations"
      ],
      "optionReasons": {
        "recommend-05": "本句的意思是「使值得考慮；使有吸引力」。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-05-3",
      "sense": "recommend-05",
      "en": "I bought the book on a friend’s recommendation.",
      "zh": "我是因為朋友的推薦而買這本書的。",
      "masked": "I bought the book on a friend’s ____.",
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "explanation": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "sentenceIndex": 12,
      "sourcePractice": 13,
      "targets": [
        "recommendation"
      ],
      "optionReasons": {
        "recommend-05": "本句的意思是「使值得考慮；使有吸引力」。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-05-4",
      "sense": "recommend-05",
      "en": "She asked her professor for a recommendation.",
      "zh": "她請教授為她提供一份推薦信／推薦意見。",
      "masked": "She asked her professor for a ____.",
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "explanation": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "sentenceIndex": 13,
      "sourcePractice": 14,
      "targets": [
        "recommendation"
      ],
      "optionReasons": {
        "recommend-05": "本句的意思是「使值得考慮；使有吸引力」。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。"
      }
    },
    {
      "id": "recommend-05-5",
      "sense": "recommend-05",
      "en": "It is a highly recommendable introduction to the subject.",
      "zh": "這是一本很值得推薦的入門書。",
      "masked": "It is a highly ____ introduction to the subject.",
      "options": [
        "recommend-05",
        "recommend-01",
        "recommend-02",
        "recommend-03",
        "recommend-04"
      ],
      "explanation": "留意語境：recommend = make something attractive or worthy（較正式）。這裡指「使值得考慮；使有吸引力」。",
      "sentenceIndex": 14,
      "sourcePractice": 15,
      "targets": [
        "recommendable"
      ],
      "optionReasons": {
        "recommend-05": "本句的意思是「使值得考慮；使有吸引力」。",
        "recommend-01": "「推薦」與本句語境不同。",
        "recommend-02": "「建議；勸告」與本句語境不同。",
        "recommend-03": "「建議；提議」與本句語境不同。",
        "recommend-04": "「推薦；舉薦」與本句語境不同。"
      }
    }
  ],
  "comparisons": [],
  "source": {
    "path": "manuals/recommend.pdf",
    "file": "530_recommend_Polysemy Exercise.pdf",
    "sha256": "2f013ba47830d103be176d173f64456b6678629b78102185fa9fcb2ccf1f5f3d",
    "pages": 10
  }
};
