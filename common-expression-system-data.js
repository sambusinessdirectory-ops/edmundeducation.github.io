(function defineCommonExpressionSystemData() {
  "use strict";

  const systems = {
    speaking: {
      key: "speaking",
      navId: "common-expression-speaking",
      href: "common-expression-speaking.html",
      eyebrow: "COMMON EXPRESSION · SPEAKING",
      titleZh: "會話",
      titleEn: "Speaking",
      descriptionZh: "把常用英語表達放回真實對話，掌握意思、語氣、句型及自然回應。",
      descriptionEn: "Learn everyday expressions through meaning, tone, patterns and practical conversation.",
      lessons: []
    },
    written: {
      key: "written",
      navId: "common-expression-written",
      href: "common-expression-written.html",
      eyebrow: "COMMON EXPRESSION · WRITTEN",
      titleZh: "專業寫作",
      titleEn: "Written",
      descriptionZh: "整理可用於清晰、得體及專業寫作的常用表達。",
      descriptionEn: "A reviewed library of common expressions for clear and professional writing.",
      lessons: []
    },
    "rhetorical-speaking": {
      key: "rhetorical-speaking",
      navId: "common-expression-rhetorical-speaking",
      href: "common-expression-rhetorical-speaking.html",
      eyebrow: "COMMON EXPRESSION · RHETORICAL SPEAKING",
      titleZh: "修辭會話",
      titleEn: "Rhetorical Speaking",
      descriptionZh: "學習在說話中自然運用修辭、節奏、語氣及有力表達。",
      descriptionEn: "Use rhetoric, rhythm, tone and emphasis naturally in spoken English.",
      lessons: []
    },
    "rhetorical-writing": {
      key: "rhetorical-writing",
      navId: "common-expression-rhetorical-writing",
      href: "common-expression-rhetorical-writing.html",
      eyebrow: "COMMON EXPRESSION · RHETORICAL WRITING",
      titleZh: "修辭寫作",
      titleEn: "Rhetorical Writing",
      descriptionZh: "建立可令文章更準確、更有層次及更具說服力的修辭表達庫。",
      descriptionEn: "Build a precise and persuasive repertoire of rhetorical written expressions.",
      lessons: []
    },
    "professional-message": {
      key: "professional-message",
      navId: "common-expression-professional-message",
      href: "common-expression-professional-message.html",
      eyebrow: "COMMON EXPRESSION · PROFESSIONAL MESSAGE",
      titleZh: "商業溝通",
      titleEn: "Professional Message",
      descriptionZh: "練習電郵、短訊及工作聯絡中清楚、禮貌而有效的常用表達。",
      descriptionEn: "Practise clear, polite and effective expressions for workplace messages.",
      lessons: []
    },
    "business-speaking": {
      key: "business-speaking",
      navId: "common-expression-business-speaking",
      href: "common-expression-business-speaking.html",
      eyebrow: "COMMON EXPRESSION · BUSINESS SPEAKING",
      titleZh: "商務會話",
      titleEn: "Business Speaking",
      descriptionZh: "掌握會議、匯報、協商及職場對話常用的商務英語表達。",
      descriptionEn: "Master useful English for meetings, presentations, negotiation and workplace dialogue.",
      lessons: []
    }
  };

  function question(id, promptEn, answerEn, promptZh, answerZh) {
    return Object.freeze({
      id,
      promptEn,
      promptZh,
      answerEn,
      answerZh,
      acceptedAnswers: [answerEn]
    });
  }

  const seeYouAround = {
    id: "common-expression-01",
    order: 1,
    slug: "see-you-around",
    titleEn: "See you around",
    titleZh: "有機會再見／之後見",
    level: "A2–B1",
    lessonTypeZh: "日常會話",
    lessonTypeEn: "Everyday conversation",
    summaryZh: "See you around 不只是一句輕鬆告別，也可以表示日後可能在某個地方碰見對方，或表示以前曾在附近見過某人。",
    summaryEn: "See you around can be a casual goodbye, a prediction that people may meet again in an area, or a way to say that somebody looks familiar.",
    source: {
      file: "Common Expression 1 - See you around.pdf",
      pageCount: 17,
      teachingPdfPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      exercisePdfPages: [14, 15, 16],
      answerKeyPdfPages: [16, 17]
    },
    examples: [
      {
        originalEn: "It was nice talking to you. I hope we meet again sometime.",
        originalZh: "很高興和你聊天。希望我們之後有機會再見。",
        targetEn: "It was nice talking to you. See you around.",
        targetZh: "很高興和你聊天。有機會再見。"
      },
      {
        originalEn: "I have to go now. Maybe we will meet again.",
        originalZh: "我現在要走了。也許我們之後會再見。",
        targetEn: "I have to go now. See you around.",
        targetZh: "我現在要走了。有機會再見。"
      },
      {
        originalEn: "You look familiar. I think I have seen you here before.",
        originalZh: "你看起來很眼熟。我覺得我以前在這裡見過你。",
        targetEn: "You look familiar. I've seen you around here before.",
        targetZh: "你看起來很眼熟。我以前好像在這附近見過你。"
      }
    ],
    benefits: [
      ["自然結束非正式對話", "End an informal conversation naturally"],
      ["表示沒有固定安排、但可能再見", "Show that people may meet again without a fixed arrangement"],
      ["描述在某個地方附近碰見對方", "Describe meeting somebody again around a place"],
      ["表示某人看起來眼熟", "Say that somebody looks familiar"],
      ["分辨告別和認出某人的不同意思", "Distinguish a goodbye from recognition"]
    ],
    reminders: [
      ["See you around 通常是 casual 告別，不等於已約定下一次見面的時間。", "It is usually a casual goodbye and does not confirm a future appointment."],
      ["see you around + place 表示可能在該地方附近碰見對方。", "See you around + place refers to meeting again in or near that area."],
      ["I've seen you around 表示以前曾在附近見過對方，不是告別。", "I've seen you around is recognition, not a goodbye."],
      ["固定時間或地點應用 See you at... / See you tomorrow，不用 see you around。", "Use See you at... or See you tomorrow for a fixed arrangement."],
      ["改寫時保留原句不能被目標表達取代的重要資料。", "Keep important information that the target expression cannot replace."]
    ],
    usageGroups: [
      ["用作輕鬆告別", "See you around.", "在對話結尾表示有機會再見；沒有固定約定。"],
      ["加上人名", "See you around, Maya.", "適合朋友、同學、同事或熟人。"],
      ["加簡短祝福或告別語", "See you around. Take care.", "目標表達後可保留祝福、感謝或告別語。"],
      ["完整句式", "I'll see you around.", "表示之後應該會再見到對方，但仍不是正式約定。"],
      ["配合不確定語氣", "Maybe I'll see you around.", "maybe、hopefully、I guess 都可表示可能再見。"],
      ["加地點", "I may see you around the office.", "表示可能在某個範圍或地方附近碰見。"],
      ["around here / there", "Will I see you around here?", "日常口語中指這附近或那附近。"],
      ["認出某人", "I've seen you around before.", "表示覺得對方眼熟。"],
      ["過去經常見到", "I used to see you around the gym.", "描述以前經常在某處見到對方。"],
      ["問句形式", "Will I see you around?", "自然地詢問對方之後會否再在附近出現。"],
      ["雙方互相碰見", "We'll see each other around.", "雙方都有可能再碰見時用 each other。"],
      ["保留原因或情境", "We both work nearby, so I'll see you around.", "只改寫能被目標表達取代的部分。"],
      ["sometime / soon", "Maybe I'll see you around sometime.", "sometime 表示不確定；預計很快再見通常用 See you soon。"],
      ["語氣取決於情境", "Well, see you around.", "可友善，也可因語調而顯得疏離。"],
      ["不適用於固定安排", "See you at the meeting tomorrow.", "已確定時間或地點時，使用精確告別句。"],
      ["around + 時間是另一意思", "I'll see you around 3 p.m.", "這裡 around 表示大約，並非本課 common expression。"]
    ],
    summaryPoints: [
      "See you around. = 輕鬆告別；之後可能再見。",
      "see you around + place = 可能在該地方附近碰見。",
      "I've seen you around. = 以前曾在附近見過；不是告別。"
    ],
    exerciseInstructionEn: "Rewrite each sentence using see you around or a natural form of it. Do not add new concrete information.",
    exerciseInstructionZh: "改寫以下句子，使用 see you around 或它的自然變化形式。不要加入原句沒有的新具體資料。",
    questions: [
      question("ce01-q01", "It was nice talking to you. I hope we meet again sometime.", "It was nice talking to you. See you around.", "很高興和你聊天。希望我們之後有機會再見。", "很高興和你聊天。有機會再見。"),
      question("ce01-q02", "I have to go now. Maybe we will meet again.", "I have to go now. See you around.", "我現在要走了。也許我們之後會再見。", "我現在要走了。有機會再見。"),
      question("ce01-q03", "Thanks for your help. I may meet you again in this building.", "Thanks for your help. I may see you around this building.", "謝謝你的幫忙。我可能會在這棟大樓再見到你。", "謝謝你的幫忙。我可能會在這棟大樓附近再見到你。"),
      question("ce01-q04", "I work here too, so I will probably meet you again in the office.", "I work here too, so I will probably see you around the office.", "我也在這裡工作，所以我可能會在辦公室再見到你。", "我也在這裡工作，所以我可能會在辦公室附近再見到你。"),
      question("ce01-q05", "You look familiar. I think I have seen you here before.", "You look familiar. I think I have seen you around here before.", "你看起來很眼熟。我覺得我以前在這裡見過你。", "你看起來很眼熟。我覺得我以前在這附近見過你。"),
      question("ce01-q06", "I have not seen you here recently. Have you been busy?", "I have not seen you around here recently. Have you been busy?", "我最近沒有在這裡見到你。你最近很忙嗎？", "我最近沒有在這附近見到你。你最近很忙嗎？"),
      question("ce01-q07", "Do you come to this café often? Will I meet you here again?", "Do you come to this café often? Will I see you around here?", "你常來這間咖啡店嗎？我會在這裡再見到你嗎？", "你常來這間咖啡店嗎？我會在這附近再見到你嗎？"),
      question("ce01-q08", "We both study here, so I am sure we will meet again on campus.", "We both study here, so I am sure we will see each other around campus.", "我們都在這裡讀書，所以我肯定我們會在校園再見面。", "我們都在這裡讀書，所以我肯定我們會在校園再碰見。"),
      question("ce01-q09", "It was good meeting you, Anna. I hope we meet again sometime.", "It was good meeting you, Anna. See you around.", "Anna，很高興認識你。希望我們之後有機會再見。", "Anna，很高興認識你。有機會再見。"),
      question("ce01-q10", "I need to leave now. Take care, and maybe we will meet again.", "I need to leave now. See you around. Take care.", "我現在要離開了。保重，也許我們之後會再見。", "我現在要離開了。有機會再見。保重。"),
      question("ce01-q11", "Good luck with your test. I hope we meet again sometime.", "See you around, and good luck with your test.", "祝你考試順利。希望我們之後有機會再見。", "有機會再見，祝你考試順利。"),
      question("ce01-q12", "I often come to this library, so maybe I will meet you here again.", "I often come to this library, so maybe I will see you around here.", "我常來這間圖書館，所以也許我會在這裡再見到你。", "我常來這間圖書館，所以也許我會在這附近再見到你。"),
      question("ce01-q13", "This is a small town. I am sure I will meet you again somewhere here.", "This is a small town. I am sure I will see you around here.", "這是一個小鎮。我肯定會在這裡某個地方再見到你。", "這是一個小鎮。我肯定會在這附近再見到你。"),
      question("ce01-q14", "I used to meet you in the gym quite often.", "I used to see you around the gym quite often.", "我以前經常在健身室見到你。", "我以前經常在健身室附近見到你。"),
      question("ce01-q15", "Are you still working here? Will we meet you here again?", "Are you still working here? Will we see you around here?", "你還在這裡工作嗎？我們之後還會在這裡見到你嗎？", "你還在這裡工作嗎？我們之後還會在這附近見到你嗎？"),
      question("ce01-q16", "Well, I guess we may meet again sometime.", "Well, I guess we will see each other around.", "嗯，我想我們也許之後會再見吧。", "嗯，我想我們之後也許會再碰見吧。"),
      question("ce01-q17", "I do not come here every day, but maybe I will meet you again sometime.", "I do not come here every day, but maybe I will see you around sometime.", "我不是每天都來這裡，但也許我之後會再見到你。", "我不是每天都來這裡，但也許我之後會再見到你。"),
      question("ce01-q18", "We live in the same area, so we may meet each other again.", "We live in the same area, so we may see each other around.", "我們住在同一區，所以我們可能會再碰見對方。", "我們住在同一區，所以我們可能會再碰見。"),
      question("ce01-q19", "I need to get back to my friends. Maybe we will talk again later.", "I need to get back to my friends. See you around.", "我要回去找我的朋友了。也許我們之後會再聊天。", "我要回去找我的朋友了。有機會再見。"),
      question("ce01-q20", "You go to this school too, right? I think I have seen you before.", "You go to this school too, right? I think I have seen you around before.", "你也讀這間學校，對吧？我覺得我以前見過你。", "你也讀這間學校，對吧？我覺得我以前見過你。")
    ]
  };

  const thatsGoodToHear = {
    id: "common-expression-02",
    order: 2,
    slug: "thats-good-to-hear",
    titleEn: "That's good to hear",
    titleZh: "那就好／聽到這樣真好",
    level: "A2–B1",
    lessonTypeZh: "日常回應",
    lessonTypeEn: "Everyday response",
    summaryZh: "當別人告訴你正面、令人安心、情況改善或問題已解決的消息時，用 That's good to hear 作出自然回應。",
    summaryEn: "Use That's good to hear to respond naturally to positive, reassuring or improving news.",
    source: {
      file: "Common Expression 2 - “That’s good to hear.pdf",
      pageCount: 35,
      teachingPdfPages: Array.from({ length: 26 }, (_, index) => index + 1),
      exercisePdfPages: [27, 28, 29, 30, 31],
      answerKeyPdfPages: [31, 32, 33, 34, 35]
    },
    examples: [
      {
        originalEn: "A: I'm feeling much better today.\nB: I'm glad to hear that.",
        originalZh: "A：我今天好很多了。\nB：聽到這樣我很高興。",
        targetEn: "A: I'm feeling much better today.\nB: That's good to hear.",
        targetZh: "A：我今天好很多了。\nB：那就好。"
      },
      {
        originalEn: "A: We found the missing documents.\nB: I'm pleased to hear that.",
        originalZh: "A：我們找到那些遺失的文件了。\nB：聽到這樣我很高興。",
        targetEn: "A: We found the missing documents.\nB: That's good to hear.",
        targetZh: "A：我們找到那些遺失的文件了。\nB：那就好。"
      },
      {
        originalEn: "A: The doctor said it isn't anything serious.\nB: I'm relieved to hear that.",
        originalZh: "A：醫生說沒有甚麼大問題。\nB：聽到這樣我就放心了。",
        targetEn: "A: The doctor said it isn't anything serious.\nB: That's good to hear.",
        targetZh: "A：醫生說沒有甚麼大問題。\nB：那就好。"
      }
    ],
    benefits: [
      ["自然回應好消息或令人安心的消息", "Respond naturally to positive or reassuring news"],
      ["顯示你正在聆聽並關心對方", "Show that you are listening and care about the speaker"],
      ["避免只回答 Okay 而顯得平淡", "Avoid a flat response such as Okay"],
      ["配合消息強度選擇 really、so、great 等語氣", "Match the strength of your response to the news"],
      ["分辨 good to hear、good to know 及 sounds good", "Distinguish good to hear, good to know and sounds good"]
    ],
    reminders: [
      ["只用來回應正面、安心或改善的消息；壞消息通常用 I'm sorry to hear that。", "Use it for positive or reassuring news; bad news usually needs I'm sorry to hear that."],
      ["that 指對方剛才說的整件事情，不是實物。", "That refers to the whole piece of information just given."],
      ["That's good to hear 通常獨立成句；要接子句時用 It's good to hear that...。", "That's good to hear normally stands alone; use It's good to hear that... before a clause."],
      ["That sounds good 回應計劃或建議；That's good to hear 回應已發生或正在改善的消息。", "Sounds good answers a proposal; good to hear answers news."],
      ["改寫時保留原句中不能被目標表達取代的內容。", "Preserve information that the target expression cannot replace."]
    ],
    usageGroups: [
      ["最基本用法", "That's good to hear.", "回應正面、安心或鼓舞的消息。"],
      ["口語簡短形式", "Good to hear.", "日常口語可省略 That's。"],
      ["加強語氣", "That's really good to hear.", "really 表示消息特別令人高興。"],
      ["更溫暖的反應", "That's so good to hear.", "so 帶出更強的感情。"],
      ["健康情況改善", "I'm feeling better. — That's good to hear.", "很典型的使用情境。"],
      ["令人安心的消息", "It isn't serious. — That's good to hear.", "消息不一定令人興奮，也可以只是讓人放心。"],
      ["事情成功完成", "We finished on time. — That's good to hear.", "回應工作或任務順利完成。"],
      ["平安或安全", "We got home safely. — That's good to hear.", "回應對方安全抵達。"],
      ["問題已解決", "The system works again. — That's good to hear.", "適合故障、延誤或投訴已處理的情境。"],
      ["適應新環境", "I enjoy my new job. — Good to hear.", "回應對工作、學校或住所的正面經驗。"],
      ["工作場合", "The presentation went well. — That's good to hear.", "正常、友善的工作對話完全自然。"],
      ["顧客服務", "That's good to hear. Thank you for letting us know.", "可保留禮貌的後續句。"],
      ["Good to hear + clause", "Good to hear you're feeling better.", "口語、簡潔地直接指出好消息。"],
      ["It's good to hear that + clause", "It's good to hear that everything is fine.", "需要在同一句說明消息內容時使用。"],
      ["與 I'm glad to hear that 比較", "That's good to hear.", "意思接近，但目標表達較像即時反應。"],
      ["與 good to know 比較", "That's good to know.", "good to know 強調資料有用；good to hear 強調消息正面。"],
      ["與 sounds good 比較", "That sounds good.", "sounds good 回應計劃、建議或選擇。"],
      ["更強烈的變化", "That's great to hear.", "great / wonderful 可回應非常好的消息。"],
      ["前置回應詞", "Oh, that's good to hear.", "Oh / Well 可令即時反應更自然。"],
      ["壞消息不使用", "I'm sorry to hear that.", "除非故意諷刺，否則不要用 good to hear 回應壞消息。"],
      ["hear 的訊息意思", "I read your message. That's good to hear.", "hear 可指得知消息，不必真的用耳朵聽見。"],
      ["不是『好聽』", "That song sounds good.", "評論聲音好聽時應用 sounds good。"],
      ["hear from you 是另一結構", "It's good to hear from you.", "表示很高興收到對方聯絡。"],
      ["不要硬接 that-clause", "It's good to hear that you're better.", "不要寫 That's good to hear that... 作基本句型。"],
      ["語氣強度", "Good to hear → That's good to hear → That's really good to hear", "按消息重要程度選擇自然強度。"]
    ],
    summaryPoints: [
      "That's good to hear. 回應正面、安心或改善的消息。",
      "Good to hear + clause / It's good to hear that + clause 可以直接指出消息內容。",
      "good to know 回應有用資料；sounds good 回應計劃或建議。",
      "壞消息通常用 I'm sorry to hear that。"
    ],
    exerciseInstructionEn: "Rewrite each response using That's good to hear or a natural form of it. Preserve important information and do not add new concrete details.",
    exerciseInstructionZh: "使用 That's good to hear 或它的自然變化形式改寫。保留重要資料，不要加入原句沒有的新具體內容。",
    questions: [
      question("ce02-q01", "A: I'm feeling much better today.\nB: I'm glad to hear that.", "A: I'm feeling much better today.\nB: That's good to hear.", "A：我今天好很多了。\nB：聽到這樣我很高興。", "A：我今天好很多了。\nB：那就好。"),
      question("ce02-q02", "A: We found the missing documents.\nB: I'm pleased to hear that.", "A: We found the missing documents.\nB: That's good to hear.", "A：我們找到那些遺失的文件了。\nB：聽到這樣我很高興。", "A：我們找到那些遺失的文件了。\nB：那就好。"),
      question("ce02-q03", "A: The doctor said it isn't anything serious.\nB: I'm relieved to hear that.", "A: The doctor said it isn't anything serious.\nB: That's good to hear.", "A：醫生說沒有甚麼嚴重問題。\nB：聽到這樣我就放心了。", "A：醫生說沒有甚麼嚴重問題。\nB：那就好。"),
      question("ce02-q04", "A: The new system is working properly now.\nB: I'm very glad to hear that.", "A: The new system is working properly now.\nB: That's really good to hear.", "A：新系統現在運作正常了。\nB：聽到這樣我真的很高興。", "A：新系統現在運作正常了。\nB：聽到這樣真的很好。"),
      question("ce02-q05", "A: I got home safely.\nB: I'm happy to hear that.", "A: I got home safely.\nB: That's good to hear.", "A：我平安回到家了。\nB：聽到這樣我很高興。", "A：我平安回到家了。\nB：那就好。"),
      question("ce02-q06", "A: I'm enjoying the new job so far.\nB: Glad to hear it.", "A: I'm enjoying the new job so far.\nB: Good to hear.", "A：到目前為止，我很喜歡這份新工作。\nB：聽到這樣就好。", "A：到目前為止，我很喜歡這份新工作。\nB：那就好。"),
      question("ce02-q07", "A: The replacement arrived, and everything is fine now.\nB: I'm glad to hear that. Thanks for letting me know.", "A: The replacement arrived, and everything is fine now.\nB: That's good to hear. Thanks for letting me know.", "A：替換的貨品到了，現在一切都沒有問題。\nB：聽到這樣就好。謝謝你通知我。", "A：替換的貨品到了，現在一切都沒有問題。\nB：那就好。謝謝你通知我。"),
      question("ce02-q08", "A: I passed the final exam.\nB: I'm glad to hear that. You worked hard for it.", "A: I passed the final exam.\nB: That's good to hear. You worked hard for it.", "A：我期末考試合格了。\nB：聽到這樣我很高興。你為此付出了很多努力。", "A：我期末考試合格了。\nB：聽到這樣真好。你為此付出了很多努力。"),
      question("ce02-q09", "A: My dad is recovering much faster than expected.\nB: I'm so glad to hear that.", "A: My dad is recovering much faster than expected.\nB: That's so good to hear.", "A：我爸爸康復得比預期快很多。\nB：聽到這樣我真的太高興了。", "A：我爸爸康復得比預期快很多。\nB：聽到這樣真的太好了。"),
      question("ce02-q10", "A: We managed to finish the project before the deadline.\nB: I'm happy to hear that.", "A: We managed to finish the project before the deadline.\nB: That's good to hear.", "A：我們成功在截止日期前完成了項目。\nB：聽到這樣我很高興。", "A：我們成功在截止日期前完成了項目。\nB：那就好。"),
      question("ce02-q11", "I'm glad to hear that your new flat is much quieter than the old one.", "It's good to hear that your new flat is much quieter than the old one.", "聽到你的新住所比以前那間安靜很多，我很高興。", "聽到你的新住所比以前那間安靜很多，真好。"),
      question("ce02-q12", "I'm glad you're sleeping better now.", "Good to hear you're sleeping better now.", "知道你現在睡得好一點，我很高興。", "聽到你現在睡得好一點，真好。"),
      question("ce02-q13", "A: I spoke to Maya. She said the problem has been sorted out.\nB: I'm glad to hear that.", "A: I spoke to Maya. She said the problem has been sorted out.\nB: That's good to hear.", "A：我跟 Maya 談過。她說問題已經處理好了。\nB：聽到這樣我很高興。", "A：我跟 Maya 談過。她說問題已經處理好了。\nB：那就好。"),
      question("ce02-q14", "A: The delay is only ten minutes.\nB: I'm glad it isn't longer.", "A: The delay is only ten minutes.\nB: Well, that's good to hear.", "A：只會延誤十分鐘。\nB：幸好沒有延誤更久。", "A：只會延誤十分鐘。\nB：那就好。"),
      question("ce02-q15", "A: The vet said our dog should make a full recovery.\nB: I'm very happy to hear that.", "A: The vet said our dog should make a full recovery.\nB: That's really good to hear.", "A：獸醫說我們的狗應該可以完全康復。\nB：聽到這樣我真的很高興。", "A：獸醫說我們的狗應該可以完全康復。\nB：聽到這樣真的很好。"),
      question("ce02-q16", "A: The water is back on now.\nB: I'm glad to hear that.", "A: The water is back on now.\nB: That's good to hear.", "A：現在恢復供水了。\nB：聽到這樣就好。", "A：現在恢復供水了。\nB：那就好。"),
      question("ce02-q17", "A: The children are settling in well at their new school.\nB: I'm happy to hear that.", "A: The children are settling in well at their new school.\nB: That's good to hear.", "A：孩子們在新學校適應得很好。\nB：聽到這樣我很高興。", "A：孩子們在新學校適應得很好。\nB：那就好。"),
      question("ce02-q18", "I'm glad to hear that the pain is much less today.", "It's good to hear that the pain is much less today.", "聽到你今天沒有那麼痛，我很高興。", "聽到今天沒有那麼痛，真好。"),
      question("ce02-q19", "A: The manager approved our revised plan.\nB: I'm glad to hear that. We can move ahead now.", "A: The manager approved our revised plan.\nB: That's good to hear. We can move ahead now.", "A：經理批准了我們修改後的計劃。\nB：聽到這樣就好。我們現在可以繼續進行了。", "A：經理批准了我們修改後的計劃。\nB：那就好。我們現在可以繼續進行了。"),
      question("ce02-q20", "A: I was nervous about the presentation, but it went smoothly.\nB: I'm glad to hear that.", "A: I was nervous about the presentation, but it went smoothly.\nB: That's good to hear.", "A：我之前很擔心那個簡報，不過最後進行得很順利。\nB：聽到這樣我很高興。", "A：我之前很擔心那個簡報，不過最後進行得很順利。\nB：那就好。")
    ]
  };

  systems.speaking.lessons = [seeYouAround, thatsGoodToHear];

  window.EDMUND_COMMON_EXPRESSION_DATA = Object.freeze({
    version: "2026-08-09.1",
    systems: Object.freeze(systems)
  });
})();
