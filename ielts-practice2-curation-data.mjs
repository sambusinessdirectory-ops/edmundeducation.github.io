// Source-grounded editorial ledger. Every transcript row has an explicit role.
export const curation = {
  "version": "2026-10-25.1",
  "practice": 2,
  "sourceSha256": "14e9013e7b78f0db874d5c715dd239998f7a04fde7d7b13c95d1a65dd080ffe1",
  "timingBasis": "Existing audio-hash-bound, monotonic word alignment. Decision endpoints manually selected at complete contextual utterances; not new independently listened timing claims.",
  "parts": [
    {
      "part": 1,
      "title": "Help for carers",
      "subtitle": "照顧者支援 · 筆記填空",
      "instructions": "ONE WORD AND/OR A NUMBER",
      "audioSha256": "a300cec20a4fd6c93dce0889de1f271d5af078bc6d5599c2c4906936910cead9",
      "transcriptSha256": "b2ce14bd19f310fbc540dd5f8341f991b2f390170528f2c5136b68a2455d931f",
      "duration": 293.625417,
      "cues": [
        {
          "id": "p1-q1",
          "question": 1,
          "start": 71.82,
          "end": 80.74,
          "endLine": 11,
          "answer": "break",
          "accepted": [
            "Break"
          ],
          "hint": "a 後面要填單數名詞；搵照顧者可得到甚麼。",
          "why": "除了處理其他責任，照顧者亦需要休息。只填 break，毋須再寫 a。",
          "paraphrase": "need a break → give the carer a break",
          "trap": "time 已經是題目上一項，唔係呢個空格。",
          "evidence": [
            {
              "lineId": "p1-line-11",
              "line": 11,
              "quote": "sometimes need a break",
              "revealAt": 80.74
            }
          ],
          "distractors": [],
          "questionText": "This can give the carer a _____."
        },
        {
          "id": "p1-q2",
          "question": 2,
          "start": 97.28,
          "end": 101.82,
          "endLine": 15,
          "answer": "time",
          "accepted": [
            "Time"
          ],
          "hint": "how much 後面要填不可數名詞；留意評估的內容。",
          "why": "評估先問每日花多少時間照顧媽媽，量度的是 time。",
          "paraphrase": "the amount of time → how much time",
          "trap": "tasks 是下一項評估範圍；唔好提早移到下一格。",
          "evidence": [
            {
              "lineId": "p1-line-15",
              "line": 15,
              "quote": "the amount of time you spend looking after your mother every day",
              "revealAt": 101.82
            }
          ],
          "distractors": [],
          "questionText": "Assessment: how much _____ the caring involves."
        },
        {
          "id": "p1-q3",
          "question": 3,
          "start": 111.38,
          "end": 116.56,
          "endLine": 19,
          "answer": "shower",
          "accepted": [
            "Shower"
          ],
          "hint": "have a 後面要填單數名詞；分清已列出的穿衣項目。",
          "why": "錄音由穿衣轉到洗澡；題目把 get into the shower 改寫為 have a shower。",
          "paraphrase": "get into the shower → have a shower",
          "trap": "dressed 對應已印出的 dressing，唔需要重填。",
          "evidence": [
            {
              "lineId": "p1-line-19",
              "line": 19,
              "quote": "help her get into the shower in the morning",
              "revealAt": 116.56
            }
          ],
          "distractors": [],
          "questionText": "Helping her have a _____."
        },
        {
          "id": "p1-q4",
          "question": 4,
          "start": 123.18,
          "end": 132.18,
          "endLine": 24,
          "answer": "money",
          "accepted": [
            "Money"
          ],
          "hint": "dealing with 後面要填需要處理的事物。",
          "why": "cope using money 對應處理金錢；Carol 隨後確認媽媽現在應付不到。",
          "paraphrase": "cope using → deal with",
          "trap": "shopping 和 meals 已列出；留意 And whether 引入的新項目。",
          "evidence": [
            {
              "lineId": "p1-line-22",
              "line": 22,
              "quote": "cope using money",
              "revealAt": 125.32
            }
          ],
          "distractors": [],
          "questionText": "Dealing with _____."
        },
        {
          "id": "p1-q5",
          "question": 5,
          "start": 184.96,
          "end": 199.22,
          "endLine": 29,
          "answer": "memory",
          "accepted": [
            "Memory"
          ],
          "hint": "loss of 後面要填名詞；聽清楚問題和例子的關係。",
          "why": "忘記吃飯及日期都是記憶力衰退的例子。空格要填上位概念 memory。",
          "paraphrase": "problems with her memory → loss of memory",
          "trap": "eat 和 day 是例子，唔係失去的能力。",
          "evidence": [
            {
              "lineId": "p1-line-28",
              "line": 28,
              "quote": "quite bad problems with her memory",
              "revealAt": 194.98
            }
          ],
          "distractors": [],
          "questionText": "An especially difficult aspect: loss of _____."
        },
        {
          "id": "p1-q6",
          "question": 6,
          "start": 199.58,
          "end": 214.96,
          "endLine": 31,
          "answer": "lifting",
          "accepted": [
            "Lifting"
          ],
          "hint": "空格後直接接 her；留意照顧時的身體負擔。",
          "why": "Tom 提出 lifting her，Carol 用媽媽很重及擔心傷背確認這個困難。",
          "paraphrase": "physical difficulties → lifting her",
          "trap": "heavy、back 解釋為何吃力；答案仍是 lifting，保留 -ing。",
          "evidence": [
            {
              "lineId": "p1-line-30",
              "line": 30,
              "quote": "Lifting her, for example?",
              "revealAt": 206.72
            }
          ],
          "distractors": [],
          "questionText": "An especially difficult aspect: _____ her."
        },
        {
          "id": "p1-q7",
          "question": 7,
          "start": 215.42,
          "end": 221.18,
          "endLine": 32,
          "answer": "fall",
          "accepted": [
            "Fall"
          ],
          "hint": "preventing a 後面要填單數名詞；搵要避免的意外。",
          "why": "avoid 對應 preventing；避免媽媽跌倒，所以填 fall。",
          "paraphrase": "avoid … having a fall → prevent a fall",
          "trap": "傷背是照顧者的風險；這題是媽媽可能遇到的意外。",
          "evidence": [
            {
              "lineId": "p1-line-32",
              "line": 32,
              "quote": "avoid the possibility of your mum having a fall",
              "revealAt": 221.18
            }
          ],
          "distractors": [],
          "questionText": "Preventing a _____."
        },
        {
          "id": "p1-q8",
          "question": 8,
          "start": 232.1,
          "end": 238.36,
          "endLine": 35,
          "answer": "taxi",
          "accepted": [
            "Taxi"
          ],
          "hint": "transport costs 下要搵交通工具，唔係目的地。",
          "why": "帶媽媽赴約的例子是乘的士；cost of a taxi 只需填 taxi。",
          "paraphrase": "get a taxi → cost of a taxi",
          "trap": "appointment 是出行目的，唔係交通工具。",
          "evidence": [
            {
              "lineId": "p1-line-35",
              "line": 35,
              "quote": "get a taxi to take your mother for an appointment",
              "revealAt": 238.36
            }
          ],
          "distractors": [],
          "questionText": "Transport costs, e.g. cost of a _____."
        },
        {
          "id": "p1-q9",
          "question": 9,
          "start": 243.88,
          "end": 247.24,
          "endLine": 37,
          "answer": "insurance",
          "accepted": [
            "Insurance"
          ],
          "hint": "fuel and 後面要搵第二項汽車開支。",
          "why": "petrol 已對應題目的 fuel；too 引入另一項可申請的保險費。",
          "paraphrase": "petrol = fuel；insurance 是另一項",
          "trap": "唔好因為先聽到 petrol 就重填題目已有的資料。",
          "evidence": [
            {
              "lineId": "p1-line-37",
              "line": 37,
              "quote": "claim for the insurance too",
              "revealAt": 247.24
            }
          ],
          "distractors": [],
          "questionText": "Car-related costs, e.g. fuel and _____."
        },
        {
          "id": "p1-q10",
          "question": 10,
          "start": 254.36,
          "end": 269.56,
          "endLine": 42,
          "answer": "stress",
          "accepted": [
            "stress"
          ],
          "hint": "reduce 後面要填要減少的事物；追蹤代名詞 it。",
          "why": "it 回指 stress；要聽到議會可提供減壓建議，先完成支援與壓力的連結。",
          "paraphrase": "minimise it → reduce stress",
          "trap": "housework 是上一項支援；這裡轉到照顧者自己的壓力。",
          "evidence": [
            {
              "lineId": "p1-line-40",
              "line": 40,
              "quote": "you're under quite a bit of stress",
              "revealAt": 262.48
            },
            {
              "lineId": "p1-line-42",
              "line": 42,
              "quote": "how to minimise it",
              "revealAt": 269.56
            }
          ],
          "distractors": [],
          "questionText": "Help to reduce _____."
        }
      ],
      "annotations": [
        {
          "id": "p1-line-0",
          "line": 0,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p1-line-1",
          "line": 1,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p1-line-2",
          "line": 2,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p1-line-3",
          "line": 3,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-4",
          "line": 4,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-5",
          "line": 5,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-6",
          "line": 6,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-7",
          "line": 7,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-8",
          "line": 8,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-9",
          "line": 9,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-10",
          "line": 10,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-11",
          "line": 11,
          "role": "evidence",
          "questionIds": [
            1
          ]
        },
        {
          "id": "p1-line-12",
          "line": 12,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-13",
          "line": 13,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-14",
          "line": 14,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-15",
          "line": 15,
          "role": "evidence",
          "questionIds": [
            2
          ]
        },
        {
          "id": "p1-line-16",
          "line": 16,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-17",
          "line": 17,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-18",
          "line": 18,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-19",
          "line": 19,
          "role": "evidence",
          "questionIds": [
            3
          ]
        },
        {
          "id": "p1-line-20",
          "line": 20,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-21",
          "line": 21,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-22",
          "line": 22,
          "role": "evidence",
          "questionIds": [
            4
          ]
        },
        {
          "id": "p1-line-23",
          "line": 23,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-24",
          "line": 24,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-25",
          "line": 25,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p1-line-26",
          "line": 26,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p1-line-27",
          "line": 27,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-28",
          "line": 28,
          "role": "evidence",
          "questionIds": [
            5
          ]
        },
        {
          "id": "p1-line-29",
          "line": 29,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-30",
          "line": 30,
          "role": "evidence",
          "questionIds": [
            6
          ]
        },
        {
          "id": "p1-line-31",
          "line": 31,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-32",
          "line": 32,
          "role": "evidence",
          "questionIds": [
            7
          ]
        },
        {
          "id": "p1-line-33",
          "line": 33,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-34",
          "line": 34,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-35",
          "line": 35,
          "role": "evidence",
          "questionIds": [
            8
          ]
        },
        {
          "id": "p1-line-36",
          "line": 36,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-37",
          "line": 37,
          "role": "evidence",
          "questionIds": [
            9
          ]
        },
        {
          "id": "p1-line-38",
          "line": 38,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-39",
          "line": 39,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-40",
          "line": 40,
          "role": "evidence",
          "questionIds": [
            10
          ]
        },
        {
          "id": "p1-line-41",
          "line": 41,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p1-line-42",
          "line": 42,
          "role": "evidence",
          "questionIds": [
            10
          ]
        },
        {
          "id": "p1-line-43",
          "line": 43,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-44",
          "line": 44,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p1-line-45",
          "line": 45,
          "role": "instruction",
          "questionIds": []
        }
      ]
    },
    {
      "part": 2,
      "title": "Volunteering in Elmleigh",
      "subtitle": "義工職責 · 配對與選擇",
      "instructions": "Q11–16: A–I · Q17–20: A–C",
      "audioSha256": "6279987e4adfecd417602f07341d0acfdf6f3e22412b26c5bfab3c9b6241abfb",
      "transcriptSha256": "bb6f087ec71c03fc092c6fe4a907236764b83d0d2e7124bd385e1d927fa7128c",
      "duration": 396.0025,
      "cues": [
        {
          "id": "p2-q11",
          "question": 11,
          "start": 92.38,
          "end": 99.82,
          "endLine": 8,
          "answer": "D",
          "accepted": [
            "D"
          ],
          "hint": "搵義工實際做甚麼，唔好只留意衣著。",
          "why": "指路和推薦景點，都是向遊客提供建議，選 D。",
          "paraphrase": "recommendations → advice",
          "trap": "T-shirt 只是辨認義工的衣服，唔等於宣傳議會服務。",
          "evidence": [
            {
              "lineId": "p2-line-8",
              "line": 8,
              "quote": "ask how to get to a particular shop",
              "revealAt": 99.82
            },
            {
              "lineId": "p2-line-8",
              "line": 8,
              "quote": "recommendations about what to visit",
              "revealAt": 99.82
            }
          ],
          "distractors": []
        },
        {
          "id": "p2-q12",
          "question": 12,
          "start": 100.84,
          "end": 118.66,
          "endLine": 10,
          "answer": "I",
          "accepted": [
            "I"
          ],
          "hint": "分清觀眾做的事和義工的職責。",
          "why": "觀眾買票後會走錯區；義工帶他們到正確位置，選 I。",
          "paraphrase": "the right place → their seats",
          "trap": "buy tickets 的主語是觀眾；錄音無話義工負責賣票。",
          "evidence": [
            {
              "lineId": "p2-line-9",
              "line": 9,
              "quote": "get everyone in the audience to the right place",
              "revealAt": 111.48
            }
          ],
          "distractors": [
            {
              "line": 10,
              "quote": "buy tickets",
              "candidateAt": 118.66,
              "rejectAt": 118.66,
              "why": "買票的是觀眾；義工帶位，並非賣票。"
            }
          ]
        },
        {
          "id": "p2-q13",
          "question": 13,
          "start": 127.7,
          "end": 143.36,
          "endLine": 13,
          "answer": "H",
          "accepted": [
            "H"
          ],
          "hint": "聽清楚 groups 之間的關係；例子用來解釋哪種角色？",
          "why": "一個團體可借另一團體的旅遊巴，重點是促進機構合作，選 H。",
          "paraphrase": "help each other → cooperation",
          "trap": "well-known author 是出行目的，唔代表義工介紹嘉賓。",
          "evidence": [
            {
              "lineId": "p2-line-12",
              "line": 12,
              "quote": "how groups can help each other",
              "revealAt": 131.8
            }
          ],
          "distractors": []
        },
        {
          "id": "p2-q14",
          "question": 14,
          "start": 160.38,
          "end": 172.32,
          "endLine": 17,
          "answer": "E",
          "accepted": [
            "E"
          ],
          "hint": "留意 though 之後，義工與廣告部的工作有何不同。",
          "why": "義工收集參加者意見及建議，再交摘要給編輯，選 E。",
          "paraphrase": "what people think / suggestions → feedback",
          "trap": "聯絡付款商戶屬廣告部職責；唔可以把部門工作當成義工工作。",
          "evidence": [
            {
              "lineId": "p2-line-16",
              "line": 16,
              "quote": "find out what people think of events they've attended, and any suggestions they have for the future",
              "revealAt": 168.9
            }
          ],
          "distractors": [
            {
              "line": 15,
              "quote": "paid for by local businesses",
              "candidateAt": 159.16,
              "rejectAt": 168.9,
              "why": "商戶付款屬廣告部處理；義工負責收集意見。"
            }
          ]
        },
        {
          "id": "p2-q15",
          "question": 15,
          "start": 182.52,
          "end": 193.76,
          "endLine": 19,
          "answer": "A",
          "accepted": [
            "A"
          ],
          "hint": "留意午餐之後的活動；搵與選項對應的工作。",
          "why": "義工飯後唱歌及演短劇，提供娛樂，選 A。",
          "paraphrase": "put on a show → providing entertainment",
          "trap": "welcome guests 是另一個動作；唔代表題目選項中的介紹嘉賓講者。",
          "evidence": [
            {
              "lineId": "p2-line-19",
              "line": 19,
              "quote": "put on a show",
              "revealAt": 193.76
            },
            {
              "lineId": "p2-line-19",
              "line": 19,
              "quote": "songs and short plays",
              "revealAt": 193.76
            }
          ],
          "distractors": []
        },
        {
          "id": "p2-q16",
          "question": 16,
          "start": 200.32,
          "end": 215.56,
          "endLine": 22,
          "answer": "B",
          "accepted": [
            "B"
          ],
          "hint": "it 指甚麼？留意義工負責宣傳還是更新內容。",
          "why": "it 指議會網站；讓居民知道並使用網站，就是宣傳議會服務，選 B。",
          "paraphrase": "residents know about it → publicity",
          "trap": "網站每日更新是背景；錄音沒有把更新工作交給義工。",
          "evidence": [
            {
              "lineId": "p2-line-21",
              "line": 21,
              "quote": "making sure residents know about it",
              "revealAt": 207.7
            }
          ],
          "distractors": []
        },
        {
          "id": "p2-q17",
          "question": 17,
          "start": 285.98,
          "end": 297.74,
          "endLine": 29,
          "answer": "B",
          "accepted": [
            "B"
          ],
          "hint": "問最多義工；比較數量，唔好只比較活動日數。",
          "why": "book → more for music → even more for science。最多義工是 science festival，選 B。",
          "paraphrase": "even more help → largest number of volunteers",
          "trap": "music 雖然長達一星期，science 只有兩天仍需更多人手。",
          "evidence": [
            {
              "lineId": "p2-line-28",
              "line": 28,
              "quote": "even more help is required for the science festival",
              "revealAt": 294.9
            }
          ],
          "distractors": [
            {
              "line": 27,
              "quote": "The book festival lasts three days",
              "candidateAt": 284.88,
              "rejectAt": 294.9,
              "why": "book、music 的義工數量都少於 science。"
            },
            {
              "line": 28,
              "quote": "More are needed for the music festival, because that lasts a whole week",
              "candidateAt": 294.9,
              "rejectAt": 294.9,
              "why": "music 比 book 多，但 science 還更多。"
            }
          ]
        },
        {
          "id": "p2-q18",
          "question": 18,
          "start": 321.36,
          "end": 331.88,
          "endLine": 32,
          "answer": "A",
          "accepted": [
            "A"
          ],
          "hint": "問最重要要求；留意比 good idea 更強的用字。",
          "why": "essential 指向與人相處及處理難應付的人，屬 interpersonal skills，選 A。",
          "paraphrase": "get on well with people → interpersonal skills",
          "trap": "interest 只是 good idea；flexibility 有用，但 essential 才是最高優先。",
          "evidence": [
            {
              "lineId": "p2-line-32",
              "line": 32,
              "quote": "being able to get on well with other people",
              "revealAt": 331.88
            },
            {
              "lineId": "p2-line-32",
              "line": 32,
              "quote": "deal with someone who's behaving badly",
              "revealAt": 331.88
            }
          ],
          "distractors": [
            {
              "line": 30,
              "quote": "the festival you're most interested in",
              "candidateAt": 305.74,
              "rejectAt": 331.88,
              "why": "個人興趣只是 good idea，不是 essential。"
            },
            {
              "line": 31,
              "quote": "volunteers who are flexible",
              "candidateAt": 320.66,
              "rejectAt": 331.88,
              "why": "靈活變通有用，但最重要是人際技巧。"
            }
          ]
        },
        {
          "id": "p2-q19",
          "question": 19,
          "start": 340.1,
          "end": 355.74,
          "endLine": 35,
          "answer": "B",
          "accepted": [
            "B"
          ],
          "hint": "把培訓、正式工作、檢討三個日期分開。",
          "why": "2 號開始一星期培訓；9 號開始 duties；23 號是跟進面談。問開始工作，選 B。",
          "paraphrase": "duties → working",
          "trap": "2 September 是培訓；23 September 是之後面談。",
          "evidence": [
            {
              "lineId": "p2-line-34",
              "line": 34,
              "quote": "duties the following week, from the 9th onward",
              "revealAt": 344.92
            }
          ],
          "distractors": [
            {
              "line": 33,
              "quote": "a week's training starting on the 2nd",
              "candidateAt": 339.64,
              "rejectAt": 344.92,
              "why": "2 號開始培訓，9 號才正式當值。"
            },
            {
              "line": 35,
              "quote": "the week beginning September 23rd",
              "candidateAt": 355.74,
              "rejectAt": 355.74,
              "why": "23 號是跟進面談，不是首次上班。"
            }
          ]
        },
        {
          "id": "p2-q20",
          "question": 20,
          "start": 369.68,
          "end": 380.84,
          "endLine": 39,
          "answer": "A",
          "accepted": [
            "A"
          ],
          "hint": "問下一次活動；聽清過去與未來的時間標記。",
          "why": "forthcoming 指即將舉行的運河來回旅程，對應 boat trip，選 A。",
          "paraphrase": "forthcoming → next；along the canal → boat trip",
          "trap": "party 屬 in recent years；barbecue 屬 last year，兩者都不是下一次。",
          "evidence": [
            {
              "lineId": "p2-line-38",
              "line": 38,
              "quote": "Our forthcoming event is a trip along the canal from here to Dewhurst and back",
              "revealAt": 374.38
            }
          ],
          "distractors": [
            {
              "line": 37,
              "quote": "a party in the town hall",
              "candidateAt": 368.72,
              "rejectAt": 374.38,
              "why": "過往活動，不是 forthcoming event。"
            },
            {
              "line": 37,
              "quote": "last year a barbecue in Chamber Park",
              "candidateAt": 368.72,
              "rejectAt": 374.38,
              "why": "去年活動，不是 upcoming 運河旅程。"
            }
          ]
        }
      ],
      "annotations": [
        {
          "id": "p2-line-0",
          "line": 0,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p2-line-1",
          "line": 1,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p2-line-2",
          "line": 2,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p2-line-3",
          "line": 3,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-4",
          "line": 4,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p2-line-5",
          "line": 5,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-6",
          "line": 6,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-7",
          "line": 7,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-8",
          "line": 8,
          "role": "evidence",
          "questionIds": [
            11
          ]
        },
        {
          "id": "p2-line-9",
          "line": 9,
          "role": "evidence",
          "questionIds": [
            12
          ]
        },
        {
          "id": "p2-line-10",
          "line": 10,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-11",
          "line": 11,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-12",
          "line": 12,
          "role": "evidence",
          "questionIds": [
            13
          ]
        },
        {
          "id": "p2-line-13",
          "line": 13,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-14",
          "line": 14,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-15",
          "line": 15,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-16",
          "line": 16,
          "role": "evidence",
          "questionIds": [
            14
          ]
        },
        {
          "id": "p2-line-17",
          "line": 17,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-18",
          "line": 18,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-19",
          "line": 19,
          "role": "evidence",
          "questionIds": [
            15
          ]
        },
        {
          "id": "p2-line-20",
          "line": 20,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p2-line-21",
          "line": 21,
          "role": "evidence",
          "questionIds": [
            16
          ]
        },
        {
          "id": "p2-line-22",
          "line": 22,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-23",
          "line": 23,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p2-line-24",
          "line": 24,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p2-line-25",
          "line": 25,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-26",
          "line": 26,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-27",
          "line": 27,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-28",
          "line": 28,
          "role": "evidence",
          "questionIds": [
            17
          ]
        },
        {
          "id": "p2-line-29",
          "line": 29,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-30",
          "line": 30,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-31",
          "line": 31,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-32",
          "line": 32,
          "role": "evidence",
          "questionIds": [
            18
          ]
        },
        {
          "id": "p2-line-33",
          "line": 33,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-34",
          "line": 34,
          "role": "evidence",
          "questionIds": [
            19
          ]
        },
        {
          "id": "p2-line-35",
          "line": 35,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-36",
          "line": 36,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-37",
          "line": 37,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p2-line-38",
          "line": 38,
          "role": "evidence",
          "questionIds": [
            20
          ]
        },
        {
          "id": "p2-line-39",
          "line": 39,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p2-line-40",
          "line": 40,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p2-line-41",
          "line": 41,
          "role": "instruction",
          "questionIds": []
        }
      ]
    },
    {
      "part": 3,
      "title": "Human geography",
      "subtitle": "人文地理 · 觀點與共同決定",
      "instructions": "Q21–25: A–G · Q26–30: A–C",
      "audioSha256": "1b10e1803b4d31fe77e76d57a1f00e04dbe3ca28f68b07e79a0765761b257c83",
      "transcriptSha256": "691e793c4296d3c48c9d397879a76bb5df2498f26847e4b386800795ed88d69d",
      "duration": 361.624667,
      "cues": [
        {
          "id": "p3-q21",
          "question": 21,
          "start": 73.72,
          "end": 76.82,
          "endLine": 8,
          "answer": "D",
          "accepted": [
            "D"
          ],
          "hint": "聽兩人對 population 資料的評價，留意 but。",
          "why": "Colin 用 but 指出雖可能悶，資料很容易在網上搵到，選 D。",
          "paraphrase": "straightforward to find → easy to find facts",
          "trap": "Lots of statistics 與 C 的 small number 相反。",
          "evidence": [
            {
              "lineId": "p3-line-8",
              "line": 8,
              "quote": "quite straightforward to find on the internet",
              "revealAt": 76.82
            }
          ],
          "distractors": []
        },
        {
          "id": "p3-q22",
          "question": 22,
          "start": 93.4,
          "end": 99.48,
          "endLine": 12,
          "answer": "G",
          "accepted": [
            "G"
          ],
          "hint": "搵他們對 health 講課內容的評價。",
          "why": "用地圖追查霍亂來源的講課令 Colin 覺得 fascinating，選 G。",
          "paraphrase": "fascinating → interesting",
          "trap": "唔好把下半句 economies 的新話題歸入 health。",
          "evidence": [
            {
              "lineId": "p3-line-12",
              "line": 12,
              "quote": "fascinating, wasn't it?",
              "revealAt": 99.48
            }
          ],
          "distractors": []
        },
        {
          "id": "p3-q23",
          "question": 23,
          "start": 104.82,
          "end": 110.7,
          "endLine": 17,
          "answer": "B",
          "accepted": [
            "B"
          ],
          "hint": "分清確定事實與可能性；聽完整個回應先判斷。",
          "why": "Rosie 不肯定是否已移出課程，故只可說可能不相關，選 B。",
          "paraphrase": "taken off the syllabus → may not be relevant",
          "trap": "保留 may；不可把未確認的猜測說成已確定刪除。",
          "evidence": [
            {
              "lineId": "p3-line-15",
              "line": 15,
              "quote": "taken off the syllabus for this year",
              "revealAt": 106.96
            },
            {
              "lineId": "p3-line-17",
              "line": 17,
              "quote": "I'm not sure. But it might be best to avoid it.",
              "revealAt": 110.7
            }
          ],
          "distractors": []
        },
        {
          "id": "p3-q24",
          "question": 24,
          "start": 120.9,
          "end": 129.1,
          "endLine": 23,
          "answer": "A",
          "accepted": [
            "A"
          ],
          "hint": "搵對講課內容的批評；係內容模糊，還是資料不可靠？",
          "why": "講得太籠統，沒有實用例子，兩人亦沒怎樣做筆記，選 A。",
          "paraphrase": "all so general → too vague",
          "trap": "沒有例子唔等於沒有研究；唔好選 F。",
          "evidence": [
            {
              "lineId": "p3-line-21",
              "line": 21,
              "quote": "all so general and the lecturer didn't give any useful examples",
              "revealAt": 124.6
            }
          ],
          "distractors": []
        },
        {
          "id": "p3-q25",
          "question": 25,
          "start": 134.24,
          "end": 146.92,
          "endLine": 28,
          "answer": "E",
          "accepted": [
            "E"
          ],
          "hint": "留意數據被怎樣處理，以及可靠程度。",
          "why": "數據可能被刻意改動以配合政治需要，因此未必可靠，選 E。",
          "paraphrase": "manipulated → may not be reliable",
          "trap": "不是完全沒有研究，而是現有數據的可信度有問題。",
          "evidence": [
            {
              "lineId": "p3-line-26",
              "line": 26,
              "quote": "sometimes deliberately manipulated",
              "revealAt": 141.3
            },
            {
              "lineId": "p3-line-27",
              "line": 27,
              "quote": "information gets changed for political reasons",
              "revealAt": 145.48
            }
          ],
          "distractors": []
        },
        {
          "id": "p3-q26",
          "question": 26,
          "start": 220.58,
          "end": 234.54,
          "endLine": 38,
          "answer": "C",
          "accepted": [
            "C"
          ],
          "hint": "問 Rosie 城市的主要問題；留意 more serious。",
          "why": "crime 存在，但她把更嚴重的問題指向失業，選 C。",
          "paraphrase": "people don’t have jobs → unemployment",
          "trap": "theft 是 Colin 的提示；homelessness 比以前改善，並非她指出的主因。",
          "evidence": [
            {
              "lineId": "p3-line-36",
              "line": 36,
              "quote": "another more serious issue, which is that a lot of people don't have jobs",
              "revealAt": 226.88
            }
          ],
          "distractors": [
            {
              "line": 35,
              "quote": "theft and robbery",
              "candidateAt": 220.0,
              "rejectAt": 226.88,
              "why": "有犯罪問題，但 Rosie 說失業更嚴重。"
            },
            {
              "line": 38,
              "quote": "people who are homeless",
              "candidateAt": 234.54,
              "rejectAt": 234.54,
              "why": "仍有無家者，但情況較以前改善。"
            }
          ]
        },
        {
          "id": "p3-q27",
          "question": 27,
          "start": 252.3,
          "end": 268.86,
          "endLine": 48,
          "answer": "A",
          "accepted": [
            "A"
          ],
          "hint": "要同時符合兩人都有、最近新增、正面評價。",
          "why": "Colin 說郊區適合會議設施，Rosie 確認她城市也有，選 A。",
          "paraphrase": "for conferences → conference centres",
          "trap": "商場帶來市中心店舖倒閉；體育設施是願望，兩地都未建。",
          "evidence": [
            {
              "lineId": "p3-line-43",
              "line": 43,
              "quote": "ideal for buildings that need a lot of space, like for conferences",
              "revealAt": 257.56
            },
            {
              "lineId": "p3-line-45",
              "line": 45,
              "quote": "we've got some too",
              "revealAt": 261.44
            }
          ],
          "distractors": [
            {
              "line": 41,
              "quote": "massive new shopping centres",
              "candidateAt": 245.92,
              "rejectAt": 251.98,
              "why": "兩地都有，但後文指出市中心店舖因此倒閉。"
            },
            {
              "line": 46,
              "quote": "more facilities for things like football",
              "candidateAt": 265.62,
              "rejectAt": 268.86,
              "why": "只是願望，兩地都沒有這種新設施。"
            }
          ]
        },
        {
          "id": "p3-q28",
          "question": 28,
          "start": 282.36,
          "end": 297.92,
          "endLine": 54,
          "answer": "A",
          "accepted": [
            "A"
          ],
          "hint": "留意舊工業用地的隱藏問題和預算。",
          "why": "危險物料要清理，費用高而且常無列入預算，選 A。",
          "paraphrase": "not budgeted for → unexpected costs",
          "trap": "Rosie 否定自然環境損害和建築價值；保留清理成本的推論。",
          "evidence": [
            {
              "lineId": "p3-line-52",
              "line": 52,
              "quote": "dangerous materials – chemicals and things – which haven't been properly cleared away",
              "revealAt": 293.04
            },
            {
              "lineId": "p3-line-53",
              "line": 53,
              "quote": "That can't be cheap. And I bet it's often not budgeted for.",
              "revealAt": 297.18
            }
          ],
          "distractors": [
            {
              "line": 50,
              "quote": "doing any harm to the natural environment",
              "candidateAt": 277.86,
              "rejectAt": 277.86,
              "why": "原句有 not，明確否定這種損害；不是正確選項。"
            },
            {
              "line": 51,
              "quote": "architecturally significant",
              "candidateAt": 281.58,
              "rejectAt": 293.04,
              "why": "Rosie 回答 Not really，否定建築價值。"
            }
          ]
        },
        {
          "id": "p3-q29",
          "question": 29,
          "start": 305.16,
          "end": 327.62,
          "endLine": 61,
          "answer": "B",
          "accepted": [
            "B"
          ],
          "hint": "先記候選話題；等兩人決定報告會講哪一個。",
          "why": "他們提過交通與回收，最後決定只講能源，選 B。",
          "paraphrase": "renewable energy / power sources → sustainable energy use",
          "trap": "提及某設計唔等於選它做報告例子；等 stick to 才確定。",
          "evidence": [
            {
              "lineId": "p3-line-57",
              "line": 57,
              "quote": "depend entirely on renewable energy",
              "revealAt": 310.54
            },
            {
              "lineId": "p3-line-61",
              "line": 61,
              "quote": "let's stick to talking about power sources",
              "revealAt": 327.62
            }
          ],
          "distractors": [
            {
              "line": 59,
              "quote": "totally pedestrianised",
              "candidateAt": 319.52,
              "rejectAt": 327.62,
              "why": "交通是提及過的設計，但最後不選作討論焦點。"
            },
            {
              "line": 60,
              "quote": "big plans for recycling",
              "candidateAt": 324.98,
              "rejectAt": 327.62,
              "why": "最後 stick to power sources，排除回收作主題。"
            }
          ]
        },
        {
          "id": "p3-q30",
          "question": 30,
          "start": 343.54,
          "end": 347.28,
          "endLine": 65,
          "answer": "C",
          "accepted": [
            "C"
          ],
          "hint": "問 Colin 不肯定的內容；辨認已知資料與未知進度。",
          "why": "目標及反對原因已交代；他不肯定工程進度，選 C。",
          "paraphrase": "how far they’ve got → how much has been built",
          "trap": "sustainability 是已知目標；unrealistic 是已知反對原因。",
          "evidence": [
            {
              "lineId": "p3-line-65",
              "line": 65,
              "quote": "I'm not sure how far they've got with it",
              "revealAt": 347.28
            }
          ],
          "distractors": [
            {
              "line": 63,
              "quote": "sustainability and so on",
              "candidateAt": 337.64,
              "rejectAt": 347.28,
              "why": "目標已知；未知的是建成進度。"
            },
            {
              "line": 64,
              "quote": "the plans were unrealistic",
              "candidateAt": 342.5,
              "rejectAt": 347.28,
              "why": "反對原因已知；並非 Colin 不確定的內容。"
            }
          ]
        }
      ],
      "annotations": [
        {
          "id": "p3-line-0",
          "line": 0,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p3-line-1",
          "line": 1,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p3-line-2",
          "line": 2,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p3-line-3",
          "line": 3,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-4",
          "line": 4,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-5",
          "line": 5,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-6",
          "line": 6,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-7",
          "line": 7,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-8",
          "line": 8,
          "role": "evidence",
          "questionIds": [
            21
          ]
        },
        {
          "id": "p3-line-9",
          "line": 9,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-10",
          "line": 10,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-11",
          "line": 11,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-12",
          "line": 12,
          "role": "evidence",
          "questionIds": [
            22
          ]
        },
        {
          "id": "p3-line-13",
          "line": 13,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-14",
          "line": 14,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p3-line-15",
          "line": 15,
          "role": "evidence",
          "questionIds": [
            23
          ]
        },
        {
          "id": "p3-line-16",
          "line": 16,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p3-line-17",
          "line": 17,
          "role": "evidence",
          "questionIds": [
            23
          ]
        },
        {
          "id": "p3-line-18",
          "line": 18,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-19",
          "line": 19,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-20",
          "line": 20,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-21",
          "line": 21,
          "role": "evidence",
          "questionIds": [
            24
          ]
        },
        {
          "id": "p3-line-22",
          "line": 22,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-23",
          "line": 23,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p3-line-24",
          "line": 24,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-25",
          "line": 25,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-26",
          "line": 26,
          "role": "evidence",
          "questionIds": [
            25
          ]
        },
        {
          "id": "p3-line-27",
          "line": 27,
          "role": "evidence",
          "questionIds": [
            25
          ]
        },
        {
          "id": "p3-line-28",
          "line": 28,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p3-line-29",
          "line": 29,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p3-line-30",
          "line": 30,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p3-line-31",
          "line": 31,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-32",
          "line": 32,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-33",
          "line": 33,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-34",
          "line": 34,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-35",
          "line": 35,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-36",
          "line": 36,
          "role": "evidence",
          "questionIds": [
            26
          ]
        },
        {
          "id": "p3-line-37",
          "line": 37,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-38",
          "line": 38,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-39",
          "line": 39,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-40",
          "line": 40,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-41",
          "line": 41,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-42",
          "line": 42,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-43",
          "line": 43,
          "role": "evidence",
          "questionIds": [
            27
          ]
        },
        {
          "id": "p3-line-44",
          "line": 44,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-45",
          "line": 45,
          "role": "evidence",
          "questionIds": [
            27
          ]
        },
        {
          "id": "p3-line-46",
          "line": 46,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-47",
          "line": 47,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-48",
          "line": 48,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-49",
          "line": 49,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-50",
          "line": 50,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-51",
          "line": 51,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-52",
          "line": 52,
          "role": "evidence",
          "questionIds": [
            28
          ]
        },
        {
          "id": "p3-line-53",
          "line": 53,
          "role": "evidence",
          "questionIds": [
            28
          ]
        },
        {
          "id": "p3-line-54",
          "line": 54,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p3-line-55",
          "line": 55,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-56",
          "line": 56,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-57",
          "line": 57,
          "role": "evidence",
          "questionIds": [
            29
          ]
        },
        {
          "id": "p3-line-58",
          "line": 58,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-59",
          "line": 59,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-60",
          "line": 60,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-61",
          "line": 61,
          "role": "evidence",
          "questionIds": [
            29
          ]
        },
        {
          "id": "p3-line-62",
          "line": 62,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p3-line-63",
          "line": 63,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-64",
          "line": 64,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p3-line-65",
          "line": 65,
          "role": "evidence",
          "questionIds": [
            30
          ]
        },
        {
          "id": "p3-line-66",
          "line": 66,
          "role": "context",
          "questionIds": []
        }
      ]
    },
    {
      "part": 4,
      "title": "Developing food trends",
      "subtitle": "食品潮流 · 講座筆記",
      "instructions": "ONE WORD ONLY",
      "audioSha256": "4296a626cf53393b8c531324cb6bd001d8d0f89ed4daf8b7f33830e5c4bbb3f5",
      "transcriptSha256": "d34b77eb5bcb56fbe4d94f4301dcf099a92ee0507520a49574be0187ca15042a",
      "duration": 471.565917,
      "cues": [
        {
          "id": "p4-q31",
          "question": 31,
          "start": 91.58,
          "end": 105.04,
          "endLine": 4,
          "answer": "photographs",
          "accepted": [
            "Photographs",
            "photos",
            "pictures"
          ],
          "hint": "空格後有 of food；搵被分享到社交媒體的東西。",
          "why": "被分享的是食物照片；填 photos，photographs 或 pictures 也接受。",
          "paraphrase": "taking photos … sharing them → photos being shared",
          "trap": "smartphone 是背景科技，唔係被分享的食物內容。",
          "evidence": [
            {
              "lineId": "p4-line-4",
              "line": 4,
              "quote": "taking photos of their food and instantly sharing them",
              "revealAt": 105.04
            }
          ],
          "distractors": [],
          "questionText": "The growth in interest in food fashions started with _____ of food being shared on social media."
        },
        {
          "id": "p4-q32",
          "question": 32,
          "start": 151.6,
          "end": 159.64,
          "endLine": 9,
          "answer": "vegan",
          "accepted": [
            "Vegan"
          ],
          "hint": "空格修飾 food brands；搵食品種類。",
          "why": "vegan produce 指純素食品；其銷售迅速上升，填 vegan。",
          "paraphrase": "increase sales quickly → sales have grown rapidly",
          "trap": "influencers 是推廣者，唔係食品種類。",
          "evidence": [
            {
              "lineId": "p4-line-9",
              "line": 9,
              "quote": "vegan produce",
              "revealAt": 159.64
            },
            {
              "lineId": "p4-line-9",
              "line": 9,
              "quote": "increase sales really quickly",
              "revealAt": 159.64
            }
          ],
          "distractors": [],
          "questionText": "Sales of _____ food brands have grown rapidly this way."
        },
        {
          "id": "p4-q33",
          "question": 33,
          "start": 172.98,
          "end": 187.2,
          "endLine": 11,
          "answer": "cooks",
          "accepted": [
            "Cooks",
            "chefs"
          ],
          "hint": "Famous 後要填人物；are 提示複數。",
          "why": "超級市場特別留意名廚餐牌，用 chefs 或 cooks。",
          "paraphrase": "well-known → famous",
          "trap": "supermarkets 是觀察的一方；chefs 才是對潮流有影響的人。",
          "evidence": [
            {
              "lineId": "p4-line-11",
              "line": 11,
              "quote": "well-known chefs are putting on their menus",
              "revealAt": 187.2
            }
          ],
          "distractors": [],
          "questionText": "Famous _____ are influential."
        },
        {
          "id": "p4-q34",
          "question": 34,
          "start": 213.66,
          "end": 221.08,
          "endLine": 15,
          "answer": "reporters",
          "accepted": [
            "Reporters",
            "Journalists"
          ],
          "hint": "搵誰前往探訪，唔好與被探訪的人對調。",
          "why": "公關公司付費安排記者去南非見牛油果農民，填 journalists 或 reporters。",
          "paraphrase": "journalists → reporters；farmers → growers",
          "trap": "growers 已在題目中，是被探訪者，唔係被邀請的人。",
          "evidence": [
            {
              "lineId": "p4-line-15",
              "line": 15,
              "quote": "a group of journalists to travel out to South Africa to meet avocado farmers",
              "revealAt": 221.08
            }
          ],
          "distractors": [],
          "questionText": "_____ were invited to visit growers in South Africa."
        },
        {
          "id": "p4-q35",
          "question": 35,
          "start": 236.22,
          "end": 246.4,
          "endLine": 17,
          "answer": "health",
          "accepted": [
            "Health"
          ],
          "hint": "空格修飾 benefits；留意自然搭配。",
          "why": "廣告強調有益健康，改寫為 health benefits，填 health。",
          "paraphrase": "beneficial for health → health benefits",
          "trap": "nutrients 是營養成分；題目要的是健康益處這個名詞組。",
          "evidence": [
            {
              "lineId": "p4-line-17",
              "line": 17,
              "quote": "beneficial for health",
              "revealAt": 246.4
            }
          ],
          "distractors": [],
          "questionText": "Advertising focused on its _____ benefits."
        },
        {
          "id": "p4-q36",
          "question": 36,
          "start": 311.02,
          "end": 329.38,
          "endLine": 24,
          "answer": "coffee",
          "accepted": [
            "Coffee"
          ],
          "hint": "空格修飾 shops；搵美國採用的推廣渠道。",
          "why": "產品進入連鎖咖啡店，減少大型廣告預算，填 coffee。",
          "paraphrase": "coffee chains → coffee shops",
          "trap": "supermarket samples 是被比較而較遜的方式。",
          "evidence": [
            {
              "lineId": "p4-line-23",
              "line": 23,
              "quote": "getting the product into coffee chains",
              "revealAt": 323.98
            },
            {
              "lineId": "p4-line-23",
              "line": 23,
              "quote": "removed the need for a big advertising budget",
              "revealAt": 323.98
            }
          ],
          "distractors": [
            {
              "line": 24,
              "quote": "offering samples in supermarkets",
              "candidateAt": 329.38,
              "rejectAt": 329.38,
              "why": "錄音說咖啡店方式 far more effective。"
            }
          ],
          "questionText": "Promotion in the USA through _____ shops reduced the need for advertising."
        },
        {
          "id": "p4-q37",
          "question": 37,
          "start": 338.3,
          "end": 354.88,
          "endLine": 27,
          "answer": "environment",
          "accepted": [
            "Environment"
          ],
          "hint": "搵消費者關心的整體議題；例子用來支持甚麼？",
          "why": "用水少及碳足印低都支持較小的環境影響，填 environment。",
          "paraphrase": "less impact on the environment → concerned about the environment",
          "trap": "water、carbon footprint 是環境影響的例子，唔係整體答案。",
          "evidence": [
            {
              "lineId": "p4-line-26",
              "line": 26,
              "quote": "less of an impact on the environment",
              "revealAt": 343.36
            }
          ],
          "distractors": [],
          "questionText": "It appealed to consumers who are concerned about the _____."
        },
        {
          "id": "p4-q38",
          "question": 38,
          "start": 371.58,
          "end": 389.36,
          "endLine": 30,
          "answer": "reputation",
          "accepted": [
            "Reputation"
          ],
          "hint": "strengthen the 後面要填名詞；留意對整個海產業的效果。",
          "why": "skrei 的需求幫助建立挪威漁業聲譽，填 reputation。",
          "paraphrase": "build → strengthen；fisheries → seafood industry",
          "trap": "excellent seafood 是人們聯想到的品質，唔係此空格。",
          "evidence": [
            {
              "lineId": "p4-line-29",
              "line": 29,
              "quote": "build the reputation of Norway's fisheries in general",
              "revealAt": 380.66
            }
          ],
          "distractors": [],
          "questionText": "Norwegian skrei has helped strengthen the _____ of Norwegian seafood."
        },
        {
          "id": "p4-q39",
          "question": 39,
          "start": 418.68,
          "end": 428.84,
          "endLine": 35,
          "answer": "price",
          "accepted": [
            "Price",
            "cost"
          ],
          "hint": "分清需求上升這個原因，以及它造成的結果。",
          "why": "需求高峰令價格急升，當地人負擔不起，填 price 或 cost。",
          "paraphrase": "price soared → increase in price",
          "trap": "demand 是導因；空格問藜麥成功後上升的價格。",
          "evidence": [
            {
              "lineId": "p4-line-35",
              "line": 35,
              "quote": "the price soared, making it unaffordable for local people",
              "revealAt": 428.84
            }
          ],
          "distractors": [],
          "questionText": "Quinoa: its success led to an increase in its _____."
        },
        {
          "id": "p4-q40",
          "question": 40,
          "start": 446.58,
          "end": 457.52,
          "endLine": 38,
          "answer": "soil",
          "accepted": [
            "Soil"
          ],
          "hint": "poor quality 後要填受影響的事物，唔好重複品質下降。",
          "why": "全年耕作令土壤肥沃程度下降；poor quality 已表達下降，填 soil。",
          "paraphrase": "fertility decreased → poor quality soil",
          "trap": "fertility 是下降的性質；soil 才是受影響的物質。",
          "evidence": [
            {
              "lineId": "p4-line-38",
              "line": 38,
              "quote": "the fertility of the soil decreased dramatically",
              "revealAt": 457.52
            }
          ],
          "distractors": [],
          "questionText": "Overuse of resources resulted in poor quality _____."
        }
      ],
      "annotations": [
        {
          "id": "p4-line-0",
          "line": 0,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p4-line-1",
          "line": 1,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p4-line-2",
          "line": 2,
          "role": "instruction",
          "questionIds": []
        },
        {
          "id": "p4-line-3",
          "line": 3,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-4",
          "line": 4,
          "role": "evidence",
          "questionIds": [
            31
          ]
        },
        {
          "id": "p4-line-5",
          "line": 5,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-6",
          "line": 6,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-7",
          "line": 7,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-8",
          "line": 8,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-9",
          "line": 9,
          "role": "evidence",
          "questionIds": [
            32
          ]
        },
        {
          "id": "p4-line-10",
          "line": 10,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-11",
          "line": 11,
          "role": "evidence",
          "questionIds": [
            33
          ]
        },
        {
          "id": "p4-line-12",
          "line": 12,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-13",
          "line": 13,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-14",
          "line": 14,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-15",
          "line": 15,
          "role": "evidence",
          "questionIds": [
            34
          ]
        },
        {
          "id": "p4-line-16",
          "line": 16,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-17",
          "line": 17,
          "role": "evidence",
          "questionIds": [
            35
          ]
        },
        {
          "id": "p4-line-18",
          "line": 18,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-19",
          "line": 19,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-20",
          "line": 20,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-21",
          "line": 21,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-22",
          "line": 22,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-23",
          "line": 23,
          "role": "evidence",
          "questionIds": [
            36
          ]
        },
        {
          "id": "p4-line-24",
          "line": 24,
          "role": "distractor",
          "questionIds": []
        },
        {
          "id": "p4-line-25",
          "line": 25,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-26",
          "line": 26,
          "role": "evidence",
          "questionIds": [
            37
          ]
        },
        {
          "id": "p4-line-27",
          "line": 27,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-28",
          "line": 28,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-29",
          "line": 29,
          "role": "evidence",
          "questionIds": [
            38
          ]
        },
        {
          "id": "p4-line-30",
          "line": 30,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-31",
          "line": 31,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-32",
          "line": 32,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-33",
          "line": 33,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-34",
          "line": 34,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-35",
          "line": 35,
          "role": "evidence",
          "questionIds": [
            39
          ]
        },
        {
          "id": "p4-line-36",
          "line": 36,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-37",
          "line": 37,
          "role": "context",
          "questionIds": []
        },
        {
          "id": "p4-line-38",
          "line": 38,
          "role": "evidence",
          "questionIds": [
            40
          ]
        },
        {
          "id": "p4-line-39",
          "line": 39,
          "role": "noise",
          "questionIds": []
        },
        {
          "id": "p4-line-40",
          "line": 40,
          "role": "instruction",
          "questionIds": []
        }
      ]
    }
  ]
};
