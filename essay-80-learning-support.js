/* Essay 80 support: source frames and notes retained from supplied mapping; practice examples authored separately. */
window.ESSAY_80_LEARNING_SUPPORT = {
  "structures": [
    {
      "id": "frame-01",
      "frame": "[先提出的情況句子], but [形成轉折的情況句子]",
      "meaning": "前後兩種情況形成轉折。",
      "usage": "想先說明一方面，再指出與之不同或相反的另一面時。",
      "source": {
        "paragraph": 1,
        "sentence": 1
      },
      "parts": [
        {
          "text": "[先提出的情況句子]",
          "kind": "slot"
        },
        {
          "text": ", but ",
          "kind": "link"
        },
        {
          "text": "[形成轉折的情況句子]",
          "kind": "slot"
        }
      ],
      "context": "天氣很冷，但 Tom 仍然出門。",
      "options": [
        "It was cold, but Tom went out.",
        "It was cold, but Tom stayed inside because of the cold.",
        "It was cold, but went Tom out.",
        "It was cold, but Tom going out."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "兩部分沒有形成題目要求的反差。",
        "第二部分要用主語 Tom + 動詞 went。",
        "第二部分缺少完整的限定動詞。"
      ]
    },
    {
      "id": "frame-02",
      "frame": "[需要解釋的情況句子] because [原因句子]",
      "meaning": "前面的情況由後面的原因解釋。",
      "usage": "先說出一個判斷或結果，再立即交代其原因時。",
      "source": {
        "paragraph": 1,
        "sentence": 2
      },
      "parts": [
        {
          "text": "[需要解釋的情況句子]",
          "kind": "slot"
        },
        {
          "text": " because ",
          "kind": "link"
        },
        {
          "text": "[原因句子]",
          "kind": "slot"
        }
      ],
      "context": "交代 Amy 早睡的原因是累了。",
      "options": [
        "Amy went to bed early because she was tired.",
        "Amy was tired because she went to bed early.",
        "Amy went to bed early because tired.",
        "Amy went to bed early because of she was tired."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "把原因與結果倒轉了。",
        "because 後要有完整主語及動詞。",
        "because of 後接名詞，不接 she was tired 這個完整子句。"
      ]
    },
    {
      "id": "frame-03",
      "frame": "should prioritise [第一種做法或理解] rather than [形成對照的另一種做法或理解]",
      "meaning": "前後兩種做法或理解形成對照。",
      "usage": "要說明採取哪一種做法，或如何理解一件事時。",
      "source": {
        "paragraph": 1,
        "sentence": 2
      },
      "parts": [
        {
          "text": "should prioritise ",
          "kind": "link"
        },
        {
          "text": "[第一種做法或理解]",
          "kind": "slot"
        },
        {
          "text": " rather than ",
          "kind": "link"
        },
        {
          "text": "[形成對照的另一種做法或理解]",
          "kind": "slot"
        }
      ],
      "context": "建議先買食物，而不是買玩具。",
      "options": [
        "We should prioritise buying food rather than buying toys.",
        "We should prioritise buying toys rather than buying food.",
        "We should prioritise to buying food rather than toys.",
        "We should prioritise buying food because buying toys."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "把先後選擇倒轉了。",
        "prioritise 後可接名詞或動名詞，不用 to buying。",
        "because 不能在這裏接 buying toys，也沒有表達兩者取捨。"
      ]
    },
    {
      "id": "frame-04",
      "frame": "[提供條件的做法] allow [受惠對象] to [因此能做的事]",
      "meaning": "這項做法讓某一方能夠做到後面的事。",
      "usage": "想說明一項政策或工具為誰創造了甚麼新機會時。",
      "source": {
        "paragraph": 2,
        "sentence": 1
      },
      "parts": [
        {
          "text": "[提供條件的做法]",
          "kind": "slot"
        },
        {
          "text": " allow ",
          "kind": "link"
        },
        {
          "text": "[受惠對象]",
          "kind": "slot"
        },
        {
          "text": " to ",
          "kind": "link"
        },
        {
          "text": "[因此能做的事]",
          "kind": "slot"
        }
      ],
      "context": "這些鑰匙讓我們可以打開門。",
      "options": [
        "These keys allow us to open the door.",
        "These keys allow us opening the door.",
        "These keys allow we to open the door.",
        "These keys allow us to closing the door."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "allow + 人 + to + 動詞原形。",
        "allow 後用受詞 us，不用 we。",
        "to 後用 open；closing 的形式及意思均不合。"
      ]
    },
    {
      "id": "frame-05",
      "frame": "The strongest reason is that [這項理由句子]",
      "meaning": "後面提出文章此處要着重討論的理由。",
      "usage": "分點論證時，想清楚引出一個重要理由時。",
      "source": {
        "paragraph": 2,
        "sentence": 1
      },
      "parts": [
        {
          "text": "The strongest reason is that ",
          "kind": "link"
        },
        {
          "text": "[這項理由句子]",
          "kind": "slot"
        }
      ],
      "context": "解釋選這家餐廳最重要的理由：食物新鮮。",
      "options": [
        "The strongest reason is that the food is fresh.",
        "The strongest reason is that the food fresh.",
        "The strongest reason that the food is fresh.",
        "The strongest reason is that fresh food."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "that 子句缺少 is。",
        "主句缺少 is。",
        "that 後要有完整句子，不只是名詞組。"
      ]
    },
    {
      "id": "frame-06",
      "frame": "[能採取行動的對象] can [能做到的行動或結果]",
      "meaning": "前面的對象有能力做到後面的事。",
      "usage": "想說明某個人、做法或工具能帶來甚麼效果時。",
      "source": {
        "paragraph": 2,
        "sentence": 2
      },
      "parts": [
        {
          "text": "[能採取行動的對象]",
          "kind": "slot"
        },
        {
          "text": " can ",
          "kind": "link"
        },
        {
          "text": "[能做到的行動或結果]",
          "kind": "slot"
        }
      ],
      "context": "說明 Ben 能游泳。",
      "options": [
        "Ben can swim.",
        "Ben can swims.",
        "Ben can to swim.",
        "Ben can swimming."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "can 後用動詞原形，不加 s。",
        "can 後不用 to。",
        "can 後不用 swimming。"
      ]
    },
    {
      "id": "frame-07",
      "frame": "By contrast, [形成對照的情況句子]",
      "meaning": "後面的情況與前面的情況形成對照。",
      "usage": "已說明一種情況，接着要突出另一種情況的差異時。",
      "source": {
        "paragraph": 2,
        "sentence": 3
      },
      "parts": [
        {
          "text": "By contrast, ",
          "kind": "link"
        },
        {
          "text": "[形成對照的情況句子]",
          "kind": "slot"
        }
      ],
      "context": "前句說 May 喜歡熱茶；下一句對比 Dan 喜歡冷水。",
      "options": [
        "By contrast, Dan likes cold water.",
        "By contrast, May likes hot tea too.",
        "By contrast, Dan like cold water.",
        "By contrast, Dan liking cold water."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "只是重複同一喜好，沒有帶出所要求的差異。",
        "Dan 是第三人稱單數，要用 likes。",
        "缺少限定動詞 likes。"
      ]
    },
    {
      "id": "frame-08",
      "frame": "at the same time, [同時需要考慮的情況句子]",
      "meaning": "同時還有另一個相關情況需要考慮。",
      "usage": "說完一點後，想補充另一點同樣重要的考慮時。",
      "source": {
        "paragraph": 2,
        "sentence": 3
      },
      "parts": [
        {
          "text": "at the same time, ",
          "kind": "link"
        },
        {
          "text": "[同時需要考慮的情況句子]",
          "kind": "slot"
        }
      ],
      "context": "兩個動作同時發生：我煮飯，她洗杯子。",
      "options": [
        "I cook; at the same time, she washes the cups.",
        "I cook; at the same time, she washed the cups yesterday.",
        "I cook; at the same time, she wash the cups.",
        "I cook; at the same time, washes the cups."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "yesterday 指昨天，不是題目要求的同時。",
        "she 要配 washes。",
        "後半句缺少主語 she。"
      ],
      "contextNote": "本句的 at the same time 指「多人同時取用」，是時間上的同時。參考表也列出「補充同樣重要的考慮」的用法；此處先練原句的時間意思。"
    },
    {
      "id": "frame-09",
      "frame": "[前面討論的情況] is especially [特別突出的特點] for [受影響較大的一方]",
      "meaning": "對後面的一方而言，前述情況特別明顯。",
      "usage": "想指出同一問題對某個群體造成更大影響時。",
      "source": {
        "paragraph": 2,
        "sentence": 4
      },
      "parts": [
        {
          "text": "[前面討論的情況]",
          "kind": "slot"
        },
        {
          "text": " is especially ",
          "kind": "link"
        },
        {
          "text": "[特別突出的特點]",
          "kind": "slot"
        },
        {
          "text": " for ",
          "kind": "link"
        },
        {
          "text": "[受影響較大的一方]",
          "kind": "slot"
        }
      ],
      "context": "厚外套對在雪中步行的人特別有用。",
      "options": [
        "A thick coat is especially useful for people walking in snow.",
        "A thick coat is especially use for people walking in snow.",
        "A thick coat especially useful for people walking in snow.",
        "A thick coat is especially useful to walk people in snow."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "is especially 後要用形容詞 useful。",
        "缺少 is。",
        "for 後指出受惠的人；這裏的 to walk people 改變了關係。"
      ]
    },
    {
      "id": "frame-10",
      "frame": "This is especially [特別明顯的特點] for [特點更明顯的情況]",
      "meaning": "在後面的情況下，前述特點尤其明顯。",
      "usage": "想指出某一種情況會令已談到的問題或好處更突出時。",
      "source": {
        "paragraph": 2,
        "sentence": 4
      },
      "parts": [
        {
          "text": "This is especially ",
          "kind": "link"
        },
        {
          "text": "[特別明顯的特點]",
          "kind": "slot"
        },
        {
          "text": " for ",
          "kind": "link"
        },
        {
          "text": "[特點更明顯的情況]",
          "kind": "slot"
        }
      ],
      "context": "前句說新鞋很舒服；指出長途步行時尤其如此。",
      "options": [
        "This is especially true for long walks.",
        "This especially true for long walks.",
        "This is especially truly for long walks.",
        "This is especially true because long walks."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "This 後缺少 is。",
        "is 後用形容詞 true，不用副詞 truly。",
        "because 後須有完整子句；此處應用 for 指出情況。"
      ]
    },
    {
      "id": "frame-11",
      "frame": "For example, [具體例子句子]",
      "meaning": "後面提供一個具體例子。",
      "usage": "提出一般觀點後，想用一個具體情況讓讀者看懂時。",
      "source": {
        "paragraph": 2,
        "sentence": 5
      },
      "parts": [
        {
          "text": "For example, ",
          "kind": "link"
        },
        {
          "text": "[具體例子句子]",
          "kind": "slot"
        }
      ],
      "context": "先說有些水果很甜，再提供具體例子。",
      "options": [
        "For example, this red apple is sweet.",
        "For example, some fruit is sweet.",
        "For example, this red apple sweet.",
        "For example, is sweet this red apple."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "重複一般觀點，沒有提供具體例子。",
        "句子缺少 is。",
        "陳述句次序應為主語 + is + 形容詞。"
      ]
    },
    {
      "id": "frame-12",
      "frame": "[第一種情況句子] whereas [對照情況句子]",
      "meaning": "前後兩種情況形成對照。",
      "usage": "想並排比較兩組人、做法或結果的差異時。",
      "source": {
        "paragraph": 2,
        "sentence": 5
      },
      "parts": [
        {
          "text": "[第一種情況句子]",
          "kind": "slot"
        },
        {
          "text": " whereas ",
          "kind": "link"
        },
        {
          "text": "[對照情況句子]",
          "kind": "slot"
        }
      ],
      "context": "比較 Sue 喜歡貓，Joe 喜歡狗。",
      "options": [
        "Sue likes cats whereas Joe likes dogs.",
        "Sue likes cats whereas Joe likes cats too.",
        "Sue likes cats whereas Joe like dogs.",
        "Sue likes cats whereas likes dogs."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "兩邊都喜歡貓，沒有題目要求的差異。",
        "Joe 是第三人稱單數，要用 likes。",
        "第二子句缺少 Joe。"
      ]
    },
    {
      "id": "frame-13",
      "frame": "[提供條件的做法] allows [受惠對象] to [因此能做的事]",
      "meaning": "這項做法讓某一方能夠做到後面的事。",
      "usage": "想說明一項政策或工具為誰創造了甚麼新機會時。",
      "source": {
        "paragraph": 2,
        "sentence": 6
      },
      "parts": [
        {
          "text": "[提供條件的做法]",
          "kind": "slot"
        },
        {
          "text": " allows ",
          "kind": "link"
        },
        {
          "text": "[受惠對象]",
          "kind": "slot"
        },
        {
          "text": " to ",
          "kind": "link"
        },
        {
          "text": "[因此能做的事]",
          "kind": "slot"
        }
      ],
      "context": "這張矮凳讓孩子夠到水龍頭。",
      "options": [
        "This small chair allows the child to reach the tap.",
        "This small chair allow the child to reach the tap.",
        "This small chair allows the child reach the tap.",
        "This small chair allows the child to reaches the tap."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "單數 chair 要配 allows。",
        "allow + 人 + to + 動詞原形，不能省掉 to。",
        "to 後用 reach。"
      ]
    },
    {
      "id": "frame-14",
      "frame": "In this sense, [從此角度作出的判斷句子]",
      "meaning": "從前述角度看，可以作出後面的判斷。",
      "usage": "舉例或解釋後，想指出它在這個角度上的意義時。",
      "source": {
        "paragraph": 2,
        "sentence": 6
      },
      "parts": [
        {
          "text": "In this sense, ",
          "kind": "link"
        },
        {
          "text": "[從此角度作出的判斷句子]",
          "kind": "slot"
        }
      ],
      "context": "前句說狗會陪著孤單的人；從這角度判斷牠是朋友。",
      "options": [
        "In this sense, a dog can be a friend.",
        "In this sense, a dog can is a friend.",
        "In this sense, can be a friend.",
        "In this sense, a dog is a kind of rain."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "can 後用 be，不用 is。",
        "缺少主語 a dog。",
        "判斷與前面的陪伴理由無關。"
      ]
    },
    {
      "id": "frame-15",
      "frame": "Another important point is that [另一項值得考慮的觀點句子]",
      "meaning": "後面提出另一項重要考慮。",
      "usage": "一項理由說完後，想轉到另一個值得討論的角度時。",
      "source": {
        "paragraph": 3,
        "sentence": 1
      },
      "parts": [
        {
          "text": "Another important point is that ",
          "kind": "link"
        },
        {
          "text": "[另一項值得考慮的觀點句子]",
          "kind": "slot"
        }
      ],
      "context": "已說房子靠近公園；再提出租金低這個新優點。",
      "options": [
        "Another important point is that the rent is low.",
        "Another important point is that the house is near the park.",
        "Another important point that the rent is low.",
        "Another important point is that low rent."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "只是重複原來的優點，沒有提出新的考慮。",
        "主句缺少 is。",
        "that 後需有完整句子 the rent is low。"
      ]
    },
    {
      "id": "frame-16",
      "frame": "[依賴的一方或事情] depend on [所依賴的條件或資源]",
      "meaning": "前者依賴後面的條件或資源。",
      "usage": "要指出一個結果取決於甚麼，或一方依靠甚麼資源時。",
      "source": {
        "paragraph": 3,
        "sentence": 2
      },
      "parts": [
        {
          "text": "[依賴的一方或事情]",
          "kind": "slot"
        },
        {
          "text": " depend on ",
          "kind": "link"
        },
        {
          "text": "[所依賴的條件或資源]",
          "kind": "slot"
        }
      ],
      "context": "花朵依賴雨水。",
      "options": [
        "The flowers depend on rain.",
        "The flowers depend rain.",
        "The flowers depends on rain.",
        "Rain depend on the flowers."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "depend 後需要 on。",
        "複數 flowers 要用 depend。",
        "把依賴方向倒轉，而且 rain 應配 depends。"
      ]
    },
    {
      "id": "frame-17",
      "frame": "If [條件句子], [可能結果句子]",
      "meaning": "如果條件成立，就可能出現後面的結果。",
      "usage": "想先設定一種情況，再說明它可能帶來甚麼結果時。",
      "source": {
        "paragraph": 3,
        "sentence": 3
      },
      "parts": [
        {
          "text": "If ",
          "kind": "link"
        },
        {
          "text": "[條件句子]",
          "kind": "slot"
        },
        {
          "text": ", ",
          "kind": "link"
        },
        {
          "text": "[可能結果句子]",
          "kind": "slot"
        }
      ],
      "context": "若下雨，我們就留在家。",
      "options": [
        "If it rains, we will stay at home.",
        "If it will rains, we stay at home.",
        "If rain, we will stay at home.",
        "If it rains, we will staying at home."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "這種未來條件句的 if 子句用現在式 rains。",
        "if 後需要完整子句 it rains。",
        "will 後用 stay。"
      ]
    },
    {
      "id": "frame-18",
      "frame": "become [可能形成的結果] rather than [另一個對照結果]",
      "meaning": "前面的轉變結果與後面的另一種結果形成對照。",
      "usage": "想指出一項做法會或可能令某事變成哪種狀態，而非另一種狀態時。",
      "source": {
        "paragraph": 3,
        "sentence": 3
      },
      "parts": [
        {
          "text": "become ",
          "kind": "link"
        },
        {
          "text": "[可能形成的結果]",
          "kind": "slot"
        },
        {
          "text": " rather than ",
          "kind": "link"
        },
        {
          "text": "[另一個對照結果]",
          "kind": "slot"
        }
      ],
      "context": "經過練習，成為出色的廚師，而非差勁的廚師。",
      "options": [
        "With practice, we can become good cooks rather than bad cooks.",
        "With practice, we can become bad cooks rather than good cooks.",
        "With practice, we can becomes good cooks rather than bad cooks.",
        "With practice, we can become good cooks because bad cooks."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "把想達成的結果與被排除的結果倒轉。",
        "can 後用 become。",
        "because 不是比較兩種結果的用法，後半也不是完整子句。"
      ]
    },
    {
      "id": "frame-19",
      "frame": "A larger [舊資源] alone cannot meet these needs.",
      "meaning": "單靠增加舊資源，仍無法滿足這些需要。",
      "usage": "要指出單純增加舊資源，仍不足以應付新需要時。",
      "source": {
        "paragraph": 3,
        "sentence": 5
      },
      "parts": [
        {
          "text": "A larger ",
          "kind": "link"
        },
        {
          "text": "[舊資源]",
          "kind": "slot"
        },
        {
          "text": " alone cannot meet these needs.",
          "kind": "link"
        }
      ],
      "context": "家庭缺少食物和衣服；更大的袋子本身不能解決問題。",
      "options": [
        "A larger bag alone cannot meet these needs.",
        "A larger bag alone cannot meets these needs.",
        "A larger bag alone cannot to meet these needs.",
        "A larger bag alone can meet all these needs."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "cannot 後用 meet。",
        "cannot 後不用 to。",
        "can meet all 與所要表達的「單靠袋子不足」相反。"
      ]
    },
    {
      "id": "frame-20",
      "frame": "In conclusion, [總結立場句子]",
      "meaning": "最後把主要立場作出總結。",
      "usage": "文章末段想清楚重申整體判斷時。",
      "source": {
        "paragraph": 4,
        "sentence": 1
      },
      "parts": [
        {
          "text": "In conclusion, ",
          "kind": "link"
        },
        {
          "text": "[總結立場句子]",
          "kind": "slot"
        }
      ],
      "context": "已解釋走路便宜又健康；結尾重申走路是好選擇。",
      "options": [
        "In conclusion, walking is a good choice.",
        "In conclusion, walking a good choice.",
        "In conclusion, is walking a good choice?",
        "In conclusion, my aunt has a blue cat."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "句子缺少 is。",
        "這是提問，沒有重申已論證的立場。",
        "突然加入無關內容，沒有總結前面的論點。"
      ]
    },
    {
      "id": "frame-21",
      "frame": "[實際出現的情況或做法] instead of [原本期待的情況或做法]",
      "meaning": "實際出現的是前面的情況，而非後面的情況。",
      "usage": "想指出現實結果或所採取的做法與原本期待的不同時。",
      "source": {
        "paragraph": 4,
        "sentence": 1
      },
      "parts": [
        {
          "text": "[實際出現的情況或做法]",
          "kind": "slot"
        },
        {
          "text": " instead of ",
          "kind": "link"
        },
        {
          "text": "[原本期待的情況或做法]",
          "kind": "slot"
        }
      ],
      "context": "實際吃蘋果，沒有吃蛋糕。",
      "options": [
        "I ate an apple instead of eating cake.",
        "I ate cake instead of eating an apple.",
        "I ate an apple instead of eat cake.",
        "I ate an apple instead of I ate cake."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "把實際選擇與替代選擇倒轉了。",
        "instead of 後可接名詞或動名詞 eating。",
        "instead of 後不能直接接完整的 I ate cake 子句。"
      ]
    },
    {
      "id": "frame-22",
      "frame": "This approach gives [機構] [更廣覆蓋], [更高效率] and [更切合當代的角色].",
      "meaning": "這種方法令機構覆蓋更廣、效率更高，也更能切合當代角色。",
      "usage": "要列出一種新方法令機構更廣、更有效及更切合時代的作用時。",
      "source": {
        "paragraph": 4,
        "sentence": 2
      },
      "parts": [
        {
          "text": "This approach gives ",
          "kind": "link"
        },
        {
          "text": "[機構]",
          "kind": "slot"
        },
        {
          "text": "[更廣覆蓋]",
          "kind": "slot"
        },
        {
          "text": ", ",
          "kind": "link"
        },
        {
          "text": "[更高效率]",
          "kind": "slot"
        },
        {
          "text": " and ",
          "kind": "link"
        },
        {
          "text": "[更切合當代的角色]",
          "kind": "slot"
        },
        {
          "text": ".",
          "kind": "link"
        }
      ],
      "context": "改成上門煮飯後，小店接觸更多人、減少等候，也適合忙碌家庭。用三個並列名詞組說出好處。",
      "options": [
        "This approach gives the shop more people to cook for, less waiting time and a new way to help busy families.",
        "This approach gives the shop more people to cook for, less waiting time and can help busy families.",
        "This approach give the shop more people to cook for, less waiting time and a new way to help busy families.",
        "This approach gives more people to cook for, less waiting time and a new way to help busy families the shop."
      ],
      "correct": 0,
      "explanations": [
        "符合指定意思，句子結構完整。",
        "並列的三項需要相同的名詞組結構；第三項用 a new way，不用 can help 這個動詞組。",
        "單數 approach 要配 gives。",
        "give + 受惠者 + 所得好處；the shop 的位置錯了。"
      ]
    }
  ],
  "sentences": [
    {
      "simple": "In the past, people thought of libraries as places full of paper books. Now, more and more information is online, so their job has changed.",
      "synonyms": [
        {
          "original": "traditionally",
          "simple": "in the past",
          "meaning": "傳統上；以前"
        },
        {
          "original": "purpose",
          "simple": "job / what it is for",
          "meaning": "用途；作用"
        },
        {
          "original": "increasingly",
          "simple": "more and more",
          "meaning": "愈來愈"
        }
      ],
      "chunks": [
        "Libraries have traditionally been associated",
        "with long shelves of printed books,",
        "but their purpose has changed",
        "in an age where information is increasingly digital."
      ]
    },
    {
      "simple": "I agree that libraries should put computer tools first, not just buy more paper books. These tools help more people get information and learn skills they need today.",
      "synonyms": [
        {
          "original": "prioritise",
          "simple": "put first",
          "meaning": "優先處理"
        },
        {
          "original": "accessible",
          "simple": "easy to get or use",
          "meaning": "容易取得或使用"
        },
        {
          "original": "essential",
          "simple": "needed / very important",
          "meaning": "必要的"
        }
      ],
      "chunks": [
        "I fully agree",
        "that libraries should prioritise technological resources",
        "rather than simply expanding their paper-book collections,",
        "because technology makes knowledge more accessible",
        "and helps users develop skills",
        "that are essential in modern life."
      ]
    },
    {
      "simple": "The main reason is that online tools help libraries serve many more people than paper books do.",
      "synonyms": [
        {
          "original": "strongest reason",
          "simple": "main reason",
          "meaning": "最主要的理由"
        },
        {
          "original": "allow",
          "simple": "let / make it possible for",
          "meaning": "讓；使能夠"
        }
      ],
      "chunks": [
        "The strongest reason is",
        "that digital resources allow libraries",
        "to serve far more people",
        "than printed books can."
      ]
    },
    {
      "simple": "Usually, only one person can borrow a paper book at a time. Someone must pick it up, bring it back and put it away.",
      "synonyms": [
        {
          "original": "physical book",
          "simple": "paper book",
          "meaning": "實體書"
        },
        {
          "original": "collected",
          "simple": "picked up",
          "meaning": "領取"
        },
        {
          "original": "stored",
          "simple": "put away",
          "meaning": "存放"
        }
      ],
      "chunks": [
        "A physical book can usually be borrowed",
        "by only one reader at a time,",
        "and it must be collected, returned and stored."
      ]
    },
    {
      "simple": "But many people can often use online books, study magazines and stored information together, even at home.",
      "synonyms": [
        {
          "original": "By contrast",
          "simple": "But / compared with this",
          "meaning": "相對而言"
        },
        {
          "original": "accessed",
          "simple": "opened or used",
          "meaning": "取用"
        },
        {
          "original": "at the same time",
          "simple": "together / at once",
          "meaning": "同時"
        }
      ],
      "chunks": [
        "By contrast, e-books, online journals,",
        "academic databases and digital archives",
        "can often be accessed by many users",
        "at the same time, even from home."
      ]
    },
    {
      "simple": "This helps students, people who work at different hours, and older people who cannot often go to a library.",
      "synonyms": [
        {
          "original": "especially useful",
          "simple": "very helpful",
          "meaning": "特別有用"
        },
        {
          "original": "elderly people",
          "simple": "older people",
          "meaning": "長者"
        },
        {
          "original": "regularly",
          "simple": "often / at set times",
          "meaning": "經常；定期"
        }
      ],
      "chunks": [
        "This is especially useful for students,",
        "shift workers and elderly people",
        "who may not be able",
        "to visit a library regularly."
      ]
    },
    {
      "simple": "For example, a student can find online study magazines in a few minutes. With only paper books, the student may need to go there many times and lose a lot of time.",
      "synonyms": [
        {
          "original": "assignment",
          "simple": "school task",
          "meaning": "課業"
        },
        {
          "original": "relying on",
          "simple": "using and needing",
          "meaning": "依靠"
        },
        {
          "original": "a great deal of",
          "simple": "a lot of",
          "meaning": "大量"
        }
      ],
      "chunks": [
        "For example, a student preparing for an assignment",
        "can search electronic journals within minutes,",
        "whereas relying only on printed volumes",
        "may involve several visits",
        "and a great deal of wasted time."
      ]
    },
    {
      "simple": "In this way, a library can help people outside its building.",
      "synonyms": [
        {
          "original": "In this sense",
          "simple": "In this way / from this point of view",
          "meaning": "從這個角度看"
        },
        {
          "original": "reach beyond their own walls",
          "simple": "help people outside the building",
          "meaning": "服務館外的人"
        }
      ],
      "chunks": [
        "In this sense, technology allows libraries",
        "to reach beyond their own walls."
      ]
    },
    {
      "simple": "Another key point is that libraries should help people learn useful computer skills.",
      "synonyms": [
        {
          "original": "practical",
          "simple": "useful in real life",
          "meaning": "實用的"
        },
        {
          "original": "build skills",
          "simple": "learn and improve skills",
          "meaning": "培養技能"
        }
      ],
      "chunks": [
        "Another important point is",
        "that modern libraries should help people",
        "build practical digital skills."
      ]
    },
    {
      "simple": "For school, work and public help, people need to find online information, check if it is good, and use it with care.",
      "synonyms": [
        {
          "original": "employment",
          "simple": "work / jobs",
          "meaning": "就業"
        },
        {
          "original": "evaluate",
          "simple": "check how good or useful it is",
          "meaning": "評估"
        },
        {
          "original": "responsibly",
          "simple": "with care for what is right",
          "meaning": "負責任地"
        }
      ],
      "chunks": [
        "Education, employment and public services",
        "increasingly depend on the ability",
        "to search for, evaluate and use",
        "online information responsibly."
      ]
    },
    {
      "simple": "If libraries spend money on computers, work rooms, online lists and trained workers, they become places to learn, not just places to keep things.",
      "synonyms": [
        {
          "original": "invest in",
          "simple": "spend money on to make better",
          "meaning": "投資於"
        },
        {
          "original": "catalogues",
          "simple": "lists of what is available",
          "meaning": "目錄"
        },
        {
          "original": "storage spaces",
          "simple": "places to keep things",
          "meaning": "儲存空間"
        }
      ],
      "chunks": [
        "If libraries invest in computers, media rooms,",
        "online catalogues and trained staff,",
        "they become active learning centres",
        "rather than quiet storage spaces."
      ]
    },
    {
      "simple": "Children can learn to look for facts safely. People can ask for jobs. Adults can use public services online.",
      "synonyms": [
        {
          "original": "research",
          "simple": "look for facts",
          "meaning": "搜尋資料"
        },
        {
          "original": "job seekers",
          "simple": "people looking for work",
          "meaning": "求職者"
        },
        {
          "original": "applications",
          "simple": "requests for jobs",
          "meaning": "求職申請"
        }
      ],
      "chunks": [
        "Children can learn how to research safely,",
        "job seekers can prepare applications,",
        "and adults can access government services",
        "that have moved online."
      ]
    },
    {
      "simple": "More paper books on their own cannot give people all these things.",
      "synonyms": [
        {
          "original": "alone",
          "simple": "on its own",
          "meaning": "單靠；本身"
        },
        {
          "original": "meet these needs",
          "simple": "give people what they need",
          "meaning": "滿足這些需要"
        }
      ],
      "chunks": [
        "A larger paper collection alone",
        "cannot meet these needs."
      ]
    },
    {
      "simple": "More books may look good. But this is like buying more candles when we need electric lights.",
      "synonyms": [
        {
          "original": "impressive",
          "simple": "very good to look at",
          "meaning": "令人印象深刻的"
        },
        {
          "original": "requires",
          "simple": "needs",
          "meaning": "需要"
        }
      ],
      "chunks": [
        "It may look impressive,",
        "but it is like adding more candles",
        "in an age that requires electric light."
      ]
    },
    {
      "simple": "So I agree: libraries should make their computer tools better, not just get more and more paper books.",
      "synonyms": [
        {
          "original": "focus on",
          "simple": "give most attention to",
          "meaning": "集中於"
        },
        {
          "original": "improving",
          "simple": "making better",
          "meaning": "改善"
        },
        {
          "original": "ever-larger",
          "simple": "bigger and bigger",
          "meaning": "愈來愈大的"
        }
      ],
      "chunks": [
        "In conclusion, I completely agree",
        "that libraries should focus on improving their technological resources",
        "instead of building ever-larger collections of paper books."
      ]
    },
    {
      "simple": "This helps libraries reach more people, use time and money better, and do a job that matters today.",
      "synonyms": [
        {
          "original": "wider reach",
          "simple": "helping more people",
          "meaning": "更廣覆蓋"
        },
        {
          "original": "greater efficiency",
          "simple": "using time and money better",
          "meaning": "更高效率"
        },
        {
          "original": "contemporary",
          "simple": "of today",
          "meaning": "當代的"
        }
      ],
      "chunks": [
        "This approach gives libraries wider reach,",
        "greater efficiency and a more relevant role",
        "in contemporary society."
      ]
    }
  ]
};
