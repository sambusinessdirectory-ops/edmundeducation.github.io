export default {
  "id": "chat",
  "word": "chat",
  "number": 312,
  "version": 1,
  "mass": true,
  "senses": [
    {
      "id": "chat-01",
      "title": "閒聊；聊天",
      "form": "chat = informal conversation（口頭交談）",
      "en": "A friendly, informal conversation, usually not highly structured or formal.",
      "zh": "閒聊；聊天",
      "note": "留意語境：chat = informal conversation（口頭交談）。這裡指「閒聊；聊天」。",
      "examples": [
        [
          "Even after a short chat, I often walk away feeling lighter and more awake.",
          "即使只是短短聊幾句，我往往也會覺得心情更輕鬆、頭腦更清醒。",
          "閒聊；聊天"
        ],
        [
          "We had a quick chat before the meeting.",
          "會議前我們簡單聊了幾句。",
          "閒聊；聊天"
        ],
        [
          "She stopped for a chat with her neighbour.",
          "她停下來跟鄰居聊了一會兒。",
          "閒聊；聊天"
        ]
      ],
      "options": [
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "chat-02",
      "title": "聊天；閒談",
      "form": "chat = talk informally（動詞）",
      "en": "chat = talk informally（動詞）",
      "zh": "聊天；閒談",
      "note": "留意語境：chat = talk informally（動詞）。這裡指「聊天；閒談」。",
      "examples": [
        [
          "We chatted for twenty minutes after class.",
          "下課後我們聊了二十分鐘。",
          "聊天；閒談"
        ],
        [
          "She was chatting with a friend outside the café.",
          "她正在咖啡店外和朋友聊天。",
          "聊天；閒談"
        ]
      ],
      "options": [
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05",
        "chat-01"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "chat-03",
      "title": "線上聊天；即時對話",
      "form": "chat = online text conversation（網上通訊）",
      "en": "chat = online text conversation（網上通訊）",
      "zh": "線上聊天；即時對話",
      "note": "留意語境：chat = online text conversation（網上通訊）。這裡指「線上聊天；即時對話」。",
      "examples": [
        [
          "You can contact customer support through live chat.",
          "你可以透過即時線上聊天聯絡客戶服務。",
          "線上聊天；即時對話"
        ],
        [
          "We continued the discussion in the group chat.",
          "我們在群組聊天室／聊天群組裡繼續討論。",
          "線上聊天；即時對話"
        ]
      ],
      "options": [
        "chat-03",
        "chat-04",
        "chat-05",
        "chat-01",
        "chat-02"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "chat-04",
      "title": "聊天室；對話串；聊天視窗",
      "form": "chat = chat session/channel/thread（數碼介面）",
      "en": "chat = chat session/channel/thread（數碼介面）",
      "zh": "聊天室；對話串；聊天視窗",
      "note": "留意語境：chat = chat session/channel/thread（數碼介面）。這裡指「聊天室；對話串；聊天視窗」。",
      "examples": [
        [
          "I sent the photo in the family chat.",
          "我把照片傳到家庭聊天群組／對話串裡。",
          "聊天室；對話串；聊天視窗"
        ],
        [
          "Open the chat and check the last message.",
          "打開那個聊天視窗／對話串，看看最後一則訊息。",
          "聊天室；對話串；聊天視窗"
        ]
      ],
      "options": [
        "chat-04",
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03"
      ],
      "excludedOverlaps": []
    },
    {
      "id": "chat-05",
      "title": "即時客服對話",
      "form": "chat = customer-service interaction（客服對話）",
      "en": "chat = customer-service interaction（客服對話）",
      "zh": "即時客服對話",
      "note": "留意語境：chat = customer-service interaction（客服對話）。這裡指「即時客服對話」。",
      "examples": [
        [
          "I used the website’s live chat to ask about my order.",
          "我使用網站的即時客服聊天功能查詢訂單。",
          "即時客服對話"
        ],
        [
          "The company offers 24-hour chat support.",
          "這家公司提供二十四小時線上聊天客服。",
          "即時客服對話"
        ],
        [
          "She was very chatty during lunch.",
          "她午飯時非常健談／很愛聊天。",
          "即時客服對話"
        ],
        [
          "He becomes more chatty when he feels comfortable.",
          "他感到自在時會變得更健談。",
          "即時客服對話"
        ]
      ],
      "options": [
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04"
      ],
      "excludedOverlaps": []
    }
  ],
  "questions": [
    {
      "id": "chat-01-0",
      "sense": "chat-01",
      "en": "Even after a short chat, I often walk away feeling lighter and more awake.",
      "zh": "即使只是短短聊幾句，我往往也會覺得心情更輕鬆、頭腦更清醒。",
      "masked": "Even after a short ____, I often walk away feeling lighter and more awake.",
      "options": [
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05"
      ],
      "explanation": "留意語境：chat = informal conversation（口頭交談）。這裡指「閒聊；聊天」。",
      "sentenceIndex": 0,
      "sourcePractice": 1,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-01": "本句的意思是「閒聊；聊天」。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。"
      }
    },
    {
      "id": "chat-01-1",
      "sense": "chat-01",
      "en": "We had a quick chat before the meeting.",
      "zh": "會議前我們簡單聊了幾句。",
      "masked": "We had a quick ____ before the meeting.",
      "options": [
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05"
      ],
      "explanation": "留意語境：chat = informal conversation（口頭交談）。這裡指「閒聊；聊天」。",
      "sentenceIndex": 1,
      "sourcePractice": 2,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-01": "本句的意思是「閒聊；聊天」。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。"
      }
    },
    {
      "id": "chat-01-2",
      "sense": "chat-01",
      "en": "She stopped for a chat with her neighbour.",
      "zh": "她停下來跟鄰居聊了一會兒。",
      "masked": "She stopped for a ____ with her neighbour.",
      "options": [
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05"
      ],
      "explanation": "留意語境：chat = informal conversation（口頭交談）。這裡指「閒聊；聊天」。",
      "sentenceIndex": 2,
      "sourcePractice": 3,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-01": "本句的意思是「閒聊；聊天」。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。"
      }
    },
    {
      "id": "chat-02-0",
      "sense": "chat-02",
      "en": "We chatted for twenty minutes after class.",
      "zh": "下課後我們聊了二十分鐘。",
      "masked": "We ____ for twenty minutes after class.",
      "options": [
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05",
        "chat-01"
      ],
      "explanation": "留意語境：chat = talk informally（動詞）。這裡指「聊天；閒談」。",
      "sentenceIndex": 3,
      "sourcePractice": 4,
      "targets": [
        "chatted"
      ],
      "optionReasons": {
        "chat-02": "本句的意思是「聊天；閒談」。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。",
        "chat-01": "「閒聊；聊天」與本句語境不同。"
      }
    },
    {
      "id": "chat-02-1",
      "sense": "chat-02",
      "en": "She was chatting with a friend outside the café.",
      "zh": "她正在咖啡店外和朋友聊天。",
      "masked": "She was ____ with a friend outside the café.",
      "options": [
        "chat-02",
        "chat-03",
        "chat-04",
        "chat-05",
        "chat-01"
      ],
      "explanation": "留意語境：chat = talk informally（動詞）。這裡指「聊天；閒談」。",
      "sentenceIndex": 4,
      "sourcePractice": 5,
      "targets": [
        "chatting"
      ],
      "optionReasons": {
        "chat-02": "本句的意思是「聊天；閒談」。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。",
        "chat-01": "「閒聊；聊天」與本句語境不同。"
      }
    },
    {
      "id": "chat-03-0",
      "sense": "chat-03",
      "en": "You can contact customer support through live chat.",
      "zh": "你可以透過即時線上聊天聯絡客戶服務。",
      "masked": "You can contact customer support through live ____.",
      "options": [
        "chat-03",
        "chat-04",
        "chat-05",
        "chat-01",
        "chat-02"
      ],
      "explanation": "留意語境：chat = online text conversation（網上通訊）。這裡指「線上聊天；即時對話」。",
      "sentenceIndex": 5,
      "sourcePractice": 6,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-03": "本句的意思是「線上聊天；即時對話」。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。"
      }
    },
    {
      "id": "chat-03-1",
      "sense": "chat-03",
      "en": "We continued the discussion in the group chat.",
      "zh": "我們在群組聊天室／聊天群組裡繼續討論。",
      "masked": "We continued the discussion in the group ____.",
      "options": [
        "chat-03",
        "chat-04",
        "chat-05",
        "chat-01",
        "chat-02"
      ],
      "explanation": "留意語境：chat = online text conversation（網上通訊）。這裡指「線上聊天；即時對話」。",
      "sentenceIndex": 6,
      "sourcePractice": 7,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-03": "本句的意思是「線上聊天；即時對話」。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。",
        "chat-05": "「即時客服對話」與本句語境不同。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。"
      }
    },
    {
      "id": "chat-04-0",
      "sense": "chat-04",
      "en": "I sent the photo in the family chat.",
      "zh": "我把照片傳到家庭聊天群組／對話串裡。",
      "masked": "I sent the photo in the family ____.",
      "options": [
        "chat-04",
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03"
      ],
      "explanation": "留意語境：chat = chat session/channel/thread（數碼介面）。這裡指「聊天室；對話串；聊天視窗」。",
      "sentenceIndex": 7,
      "sourcePractice": 8,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-04": "本句的意思是「聊天室；對話串；聊天視窗」。",
        "chat-05": "「即時客服對話」與本句語境不同。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。"
      }
    },
    {
      "id": "chat-04-1",
      "sense": "chat-04",
      "en": "Open the chat and check the last message.",
      "zh": "打開那個聊天視窗／對話串，看看最後一則訊息。",
      "masked": "Open the ____ and check the last message.",
      "options": [
        "chat-04",
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03"
      ],
      "explanation": "留意語境：chat = chat session/channel/thread（數碼介面）。這裡指「聊天室；對話串；聊天視窗」。",
      "sentenceIndex": 8,
      "sourcePractice": 9,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-04": "本句的意思是「聊天室；對話串；聊天視窗」。",
        "chat-05": "「即時客服對話」與本句語境不同。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。"
      }
    },
    {
      "id": "chat-05-0",
      "sense": "chat-05",
      "en": "I used the website’s live chat to ask about my order.",
      "zh": "我使用網站的即時客服聊天功能查詢訂單。",
      "masked": "I used the website’s live ____ to ask about my order.",
      "options": [
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04"
      ],
      "explanation": "留意語境：chat = customer-service interaction（客服對話）。這裡指「即時客服對話」。",
      "sentenceIndex": 9,
      "sourcePractice": 10,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-05": "本句的意思是「即時客服對話」。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。"
      }
    },
    {
      "id": "chat-05-1",
      "sense": "chat-05",
      "en": "The company offers 24-hour chat support.",
      "zh": "這家公司提供二十四小時線上聊天客服。",
      "masked": "The company offers 24-hour ____ support.",
      "options": [
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04"
      ],
      "explanation": "留意語境：chat = customer-service interaction（客服對話）。這裡指「即時客服對話」。",
      "sentenceIndex": 10,
      "sourcePractice": 11,
      "targets": [
        "chat"
      ],
      "optionReasons": {
        "chat-05": "本句的意思是「即時客服對話」。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。"
      }
    },
    {
      "id": "chat-05-2",
      "sense": "chat-05",
      "en": "She was very chatty during lunch.",
      "zh": "她午飯時非常健談／很愛聊天。",
      "masked": "She was very ____ during lunch.",
      "options": [
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04"
      ],
      "explanation": "留意語境：chat = customer-service interaction（客服對話）。這裡指「即時客服對話」。",
      "sentenceIndex": 11,
      "sourcePractice": 12,
      "targets": [
        "chatty"
      ],
      "optionReasons": {
        "chat-05": "本句的意思是「即時客服對話」。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。"
      }
    },
    {
      "id": "chat-05-3",
      "sense": "chat-05",
      "en": "He becomes more chatty when he feels comfortable.",
      "zh": "他感到自在時會變得更健談。",
      "masked": "He becomes more ____ when he feels comfortable.",
      "options": [
        "chat-05",
        "chat-01",
        "chat-02",
        "chat-03",
        "chat-04"
      ],
      "explanation": "留意語境：chat = customer-service interaction（客服對話）。這裡指「即時客服對話」。",
      "sentenceIndex": 12,
      "sourcePractice": 13,
      "targets": [
        "chatty"
      ],
      "optionReasons": {
        "chat-05": "本句的意思是「即時客服對話」。",
        "chat-01": "「閒聊；聊天」與本句語境不同。",
        "chat-02": "「聊天；閒談」與本句語境不同。",
        "chat-03": "「線上聊天；即時對話」與本句語境不同。",
        "chat-04": "「聊天室；對話串；聊天視窗」與本句語境不同。"
      }
    }
  ],
  "comparisons": [],
  "source": {
    "path": "manuals/chat.pdf",
    "file": "312_chat_Polysemy Exercise.pdf",
    "sha256": "a2861c55ccc46d34f0c307673ef4a75f17ba366f18636e0bfec5769f12a2f871",
    "pages": 9
  }
};
