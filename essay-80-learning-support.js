/* Essay 80: source-linked learning support and argument transfer practice. */
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "It was cold, but Tom went out.",
        "The rain made the road wet, but the road became wet.",
        "I am an only child, but I have no brothers or sisters.",
        "The shop opens at nine, but nine is its opening time."
      ],
      "correct": 0,
      "explanations": [
        "前後兩種情況形成轉折。 這句用指定框架表達了這個關係。",
        "後半句只是重複結果，沒有轉折。",
        "兩句意思一致，沒有轉折。",
        "這是重述同一事實，沒有轉折。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "Amy went to bed early because she was tired.",
        "The cup broke yesterday because it will fall tomorrow.",
        "May is an only child because she is the only child in her family.",
        "The room is empty because there is nobody in the room."
      ],
      "correct": 0,
      "explanations": [
        "前面的情況由後面的原因解釋。 這句用指定框架表達了這個關係。",
        "明天的事件不能造成昨天的結果。",
        "只是重述，沒有解釋原因。",
        "只是換句話重述空無一人，沒有交代原因。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "We should prioritise buying food rather than buying toys.",
        "We need water first. We should prioritise buying a toy rather than buying water.",
        "Our first job is to feed the hungry cat. We should prioritise washing the car rather than feeding the cat.",
        "We must keep the baby warm first. We should prioritise buying a picture rather than buying a blanket."
      ],
      "correct": 0,
      "explanations": [
        "前後兩種做法或理解形成對照。 這句用指定框架表達了這個關係。",
        "優先次序與已說明的需要相反。",
        "做法沒有遵守已說明的首要工作。",
        "優先選擇沒有回應保暖需要。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "These keys allow us to open the door.",
        "Locked doors allow us to walk through them without opening them.",
        "Empty bottles allow us to drink the water inside them.",
        "Broken phones allow us to make calls when they cannot work."
      ],
      "correct": 0,
      "explanations": [
        "這項做法讓某一方能夠做到後面的事。 這句用指定框架表達了這個關係。",
        "鎖上的門不提供穿門而過的條件。",
        "空瓶內沒有可喝的水。",
        "不能運作的電話沒有提供打電話的條件。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "The strongest reason is that the food is fresh.",
        "We should buy this coat because it keeps us warm. The strongest reason is that two plus two is four.",
        "We should clean the dirty kitchen. The strongest reason is that my name is Tom.",
        "We should help the lost child. The strongest reason is that the moon is round."
      ],
      "correct": 0,
      "explanations": [
        "後面提出文章此處要着重討論的理由。 這句用指定框架表達了這個關係。",
        "事實與買外套的主張沒有關係。",
        "姓名不能支持清潔廚房的主張。",
        "月亮的形狀沒有支持幫助孩子的主張。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "Ben can swim.",
        "An empty cup can hold water that is already inside it.",
        "A stone can eat breakfast.",
        "A chair can read a book by itself."
      ],
      "correct": 0,
      "explanations": [
        "前面的對象有能力做到後面的事。 這句用指定框架表達了這個關係。",
        "空杯沒有已在杯中的水。",
        "石頭沒有進食能力。",
        "椅子沒有閱讀能力。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "May likes hot tea. By contrast, Dan likes cold water.",
        "Mum likes apples. By contrast, Dad likes apples too.",
        "The first box is empty. By contrast, the second box is also empty.",
        "The dog is asleep. By contrast, the cat is asleep too."
      ],
      "correct": 0,
      "explanations": [
        "後面的情況與前面的情況形成對照。 這句用指定框架表達了這個關係。",
        "相同喜好沒有形成對照。",
        "兩個空盒情況一致。",
        "兩者都在睡覺，沒有對比。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "I cook; at the same time, she washes the cups.",
        "I finished lunch at noon. At the same time, I started dinner six hours later.",
        "The bus left yesterday. At the same time, the train will leave tomorrow.",
        "Ben was born in May. At the same time, Sue was born two months later."
      ],
      "correct": 0,
      "explanations": [
        "同時還有另一個相關情況需要考慮。 這句用指定框架表達了這個關係。",
        "相隔六小時，不是同時。",
        "昨天與明天不是同時。",
        "相隔兩個月，不是同時。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "A thick coat is especially useful for people walking in snow.",
        "The shop charges everyone five pounds. The price is especially low for Tom, who pays the same price as everyone else.",
        "Everyone gets the same two-minute break. The break is especially long for Mia because hers is also two minutes.",
        "Each bag weighs one kilo. The weight is especially high for this bag, which also weighs one kilo."
      ],
      "correct": 0,
      "explanations": [
        "對後面的一方而言，前述情況特別明顯。 這句用指定框架表達了這個關係。",
        "沒有資料顯示 Tom 的價格特別低。",
        "相同時長不能證明 Mia 的休息特別長。",
        "相同重量不能支持特別重。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "These shoes are comfortable. This is especially true for long walks.",
        "All tickets cost five pounds. This is especially cheap for children because they pay five pounds, just like adults.",
        "Every runner takes ten minutes. This is especially fast for Kim because Kim also takes ten minutes.",
        "All rooms are ten metres wide. This is especially wide for room two because it is also ten metres wide."
      ],
      "correct": 0,
      "explanations": [
        "在後面的情況下，前述特點尤其明顯。 這句用指定框架表達了這個關係。",
        "只有相同價格，沒有提供兒童特別便宜的比較。",
        "相同時間不能支持 Kim 特別快。",
        "所有房間一樣寬，沒有較明顯的情況。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "Some fruit is sweet. For example, this red apple is sweet.",
        "All the fruit in this bowl is red. For example, the green pear in this bowl is green.",
        "Every child here can swim. For example, Ben is a child here who cannot swim.",
        "These bags are empty. For example, this bag is full of rice."
      ],
      "correct": 0,
      "explanations": [
        "後面提供一個具體例子。 這句用指定框架表達了這個關係。",
        "例子與紅色的概括相反。",
        "例子反駁而不是支持概括。",
        "滿袋米不支持空袋的概括。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "Sue likes cats whereas Joe likes dogs.",
        "The red cup is empty whereas the blue cup is empty too.",
        "Nina arrived at six whereas Tim also arrived at six.",
        "Our dog has four legs whereas their dog also has four legs."
      ],
      "correct": 0,
      "explanations": [
        "前後兩種情況形成對照。 這句用指定框架表達了這個關係。",
        "兩者相同，沒有形成對照。",
        "相同到達時間不形成對照。",
        "相同特徵沒有對比。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "This small chair allows the child to reach the tap.",
        "A locked box allows us to take things out while it stays closed.",
        "An empty plate allows the child to eat the food on it.",
        "A broken lamp allows us to see when it gives no light."
      ],
      "correct": 0,
      "explanations": [
        "這項做法讓某一方能夠做到後面的事。 這句用指定框架表達了這個關係。",
        "關閉鎖上的盒子沒有提供拿出物件的條件。",
        "空碟沒有食物。",
        "不發光的燈沒有提供照明。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "A dog can stay with a lonely person. In this sense, a dog can be a friend.",
        "My bag is blue. In this sense, it can cook dinner.",
        "This pencil is short. In this sense, it is a good place to sleep.",
        "The cake is round. In this sense, it knows my name."
      ],
      "correct": 0,
      "explanations": [
        "從前述角度看，可以作出後面的判斷。 這句用指定框架表達了這個關係。",
        "顏色不能引申出烹飪能力。",
        "長短不能推論成睡覺的地方。",
        "形狀不能支持知道姓名的判斷。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "The house is near a park. Another important point is that the rent is low.",
        "The house is cheap. Another important point is that the house costs little money.",
        "This meal is hot. Another important point is that it is not cold.",
        "The bus is free. Another important point is that we do not have to pay for it."
      ],
      "correct": 0,
      "explanations": [
        "後面提出另一項重要考慮。 這句用指定框架表達了這個關係。",
        "只是重複便宜，沒有增加另一項觀點。",
        "同一溫度事實，不是新增觀點。",
        "再次說免費，沒有新增理由。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "The flowers depend on rain.",
        "These flowers have never been watered. They depend on the water we never give them to stay alive.",
        "Our dinner depends on food that does not exist.",
        "A car with no other power depends on an empty fuel tank to keep moving."
      ],
      "correct": 0,
      "explanations": [
        "前者依賴後面的條件或資源。 這句用指定框架表達了這個關係。",
        "聲稱依賴的供應實際不存在。",
        "不存在的食物不能提供晚餐。",
        "空油箱沒有提供運作所需燃料。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "If it rains, we will stay at home.",
        "If the box is completely empty, it has three balls inside.",
        "If nobody is in the room, there are two people in the room.",
        "If all the lights are off, one of those lights is on."
      ],
      "correct": 0,
      "explanations": [
        "如果條件成立，就可能出現後面的結果。 這句用指定框架表達了這個關係。",
        "結果與空盒條件矛盾。",
        "結果否定了前面的條件。",
        "結果與全部關燈的條件矛盾。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "With practice, we can become good cooks rather than bad cooks.",
        "We want a quiet room. It should become noisy rather than quiet.",
        "We need to cool the soup. It should become hotter rather than cooler.",
        "Our aim is to clean the floor. It should become dirty rather than clean."
      ],
      "correct": 0,
      "explanations": [
        "前面的轉變結果與後面的另一種結果形成對照。 這句用指定框架表達了這個關係。",
        "形成的結果與已表明目標相反。",
        "結果與降溫目的相反。",
        "結果與清潔目標相反。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "We need food and warm clothes. A larger bag alone cannot meet these needs.",
        "We need only a bag that holds ten apples. This larger bag holds ten apples. A larger bag alone cannot meet these needs.",
        "We need only ten seats. This larger bus has ten seats. A larger bus alone cannot meet these needs.",
        "We need only room for six cakes. This larger box holds six cakes. A larger box alone cannot meet these needs."
      ],
      "correct": 0,
      "explanations": [
        "單靠增加舊資源，仍無法滿足這些需要。 這句用指定框架表達了這個關係。",
        "已證明袋子滿足唯一需要，卻又說不足。",
        "已提供所需全部座位，結論不跟隨證據。",
        "唯一容量要求已滿足，不能從此推出不足。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "Walking is cheap and keeps us well. In conclusion, walking is a good choice.",
        "The soup is too cold and too salty for me. In conclusion, it is just right for me.",
        "The bus is late every day and costs too much. In conclusion, it is always on time and cheap.",
        "The shoes are too small and hurt my feet. In conclusion, they fit me perfectly."
      ],
      "correct": 0,
      "explanations": [
        "最後把主要立場作出總結。 這句用指定框架表達了這個關係。",
        "總結與前面兩項評價相反。",
        "總結否定已有證據。",
        "總結沒有跟隨前面理由。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "I ate an apple instead of eating cake.",
        "I drank both tea and coffee. I drank tea instead of coffee.",
        "We travelled by both train and bus. We used the train instead of the bus.",
        "I ate both rice and bread. I ate rice instead of bread."
      ],
      "correct": 0,
      "explanations": [
        "實際出現的是前面的情況，而非後面的情況。 這句用指定框架表達了這個關係。",
        "前句說兩者都選，後句卻說取代。",
        "先說兩種都用，再說沒有用巴士，關係不一致。",
        "兩者都有吃，不能描述為以飯取代麵包。"
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
      "context": "哪一句正確運用了上面的句型及其功能？",
      "options": [
        "The shop now cooks meals in people's homes. This approach gives the shop more people to cook for, less waiting time and a new way to help busy families.",
        "The club now shuts its doors to everyone. This approach gives the club more visitors, less waiting and a useful place in town.",
        "The cafe now serves nobody. This approach gives the cafe more customers, faster meals and a helpful role for families.",
        "The pool is now closed all year. This approach gives the pool more swimmers, shorter waits and a useful role for local children."
      ],
      "correct": 0,
      "explanations": [
        "這種方法令機構覆蓋更廣、效率更高，也更能切合當代角色。 這句用指定框架表達了這個關係。",
        "拒絕所有人不能支持更多訪客等三項好處。",
        "不服務任何人不能帶來這些結果。",
        "全年關閉與三項服務好處矛盾。"
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
        },
        {
          "original": "been associated with",
          "simple": "been thought of together with",
          "meaning": "一直被聯繫在一起"
        },
        {
          "original": "long shelves of printed books",
          "simple": "long rows of paper books",
          "meaning": "長排紙本書"
        },
        {
          "original": "has changed",
          "simple": "is different now",
          "meaning": "已改變"
        },
        {
          "original": "in an age where",
          "simple": "at a time when",
          "meaning": "在某個時代"
        },
        {
          "original": "digital",
          "simple": "on computers or online",
          "meaning": "數碼的"
        }
      ],
      "chunks": [
        "Libraries have traditionally been associated",
        "with long shelves of printed books,",
        "but their purpose has changed",
        "in an age where information is increasingly digital."
      ],
      "simpleChunks": [
        "In the past,",
        "people thought of libraries as",
        "places full of paper books.",
        "Now,",
        "more and more information is",
        "online,",
        "so their job has changed."
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
        },
        {
          "original": "fully agree",
          "simple": "agree completely",
          "meaning": "完全同意"
        },
        {
          "original": "technological resources",
          "simple": "computer tools and services",
          "meaning": "科技資源"
        },
        {
          "original": "rather than",
          "simple": "not just / instead of",
          "meaning": "而不是"
        },
        {
          "original": "expanding",
          "simple": "making bigger",
          "meaning": "擴大"
        },
        {
          "original": "paper-book collections",
          "simple": "the paper books a place has",
          "meaning": "紙本館藏"
        },
        {
          "original": "knowledge",
          "simple": "what people know and learn",
          "meaning": "知識"
        },
        {
          "original": "develop skills",
          "simple": "learn to do things well",
          "meaning": "培養技能"
        }
      ],
      "chunks": [
        "I fully agree",
        "that libraries should prioritise technological resources",
        "rather than simply expanding their paper-book collections,",
        "because technology makes knowledge more accessible",
        "and helps users develop skills",
        "that are essential in modern life."
      ],
      "simpleChunks": [
        "I agree that libraries should",
        "put computer tools first,",
        "not just buy more paper",
        "books.",
        "These tools help more people",
        "get information and learn skills",
        "they need today."
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
        },
        {
          "original": "digital resources",
          "simple": "online tools and information",
          "meaning": "數碼資源"
        },
        {
          "original": "serve",
          "simple": "help / provide things for",
          "meaning": "服務"
        },
        {
          "original": "far more people",
          "simple": "many more people",
          "meaning": "遠多於的人"
        },
        {
          "original": "printed books",
          "simple": "paper books",
          "meaning": "印刷書籍"
        }
      ],
      "chunks": [
        "The strongest reason is",
        "that digital resources allow libraries",
        "to serve far more people",
        "than printed books can."
      ],
      "simpleChunks": [
        "The main reason is that",
        "online tools help libraries serve",
        "many more people than paper",
        "books do."
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
        },
        {
          "original": "usually",
          "simple": "most of the time",
          "meaning": "通常"
        },
        {
          "original": "borrowed",
          "simple": "taken to use and then given back",
          "meaning": "借閱"
        },
        {
          "original": "only one reader at a time",
          "simple": "just one person each time",
          "meaning": "一次只有一人"
        },
        {
          "original": "returned",
          "simple": "brought back",
          "meaning": "歸還"
        },
        {
          "original": "must",
          "simple": "have to",
          "meaning": "必須"
        }
      ],
      "chunks": [
        "A physical book can usually be borrowed",
        "by only one reader at a time,",
        "and it must be collected, returned and stored."
      ],
      "simpleChunks": [
        "Usually,",
        "only one person can borrow",
        "a paper book at a",
        "time.",
        "Someone must pick it up,",
        "bring it back and put",
        "it away."
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
        },
        {
          "original": "e-books",
          "simple": "books on a screen",
          "meaning": "電子書"
        },
        {
          "original": "online journals",
          "simple": "study magazines on the internet",
          "meaning": "網上期刊"
        },
        {
          "original": "academic databases",
          "simple": "stored information for study",
          "meaning": "學術資料庫"
        },
        {
          "original": "digital archives",
          "simple": "old records kept on computers",
          "meaning": "數碼檔案"
        },
        {
          "original": "many users",
          "simple": "many people who use them",
          "meaning": "許多使用者"
        },
        {
          "original": "even from home",
          "simple": "also while at home",
          "meaning": "甚至在家"
        }
      ],
      "chunks": [
        "By contrast, e-books, online journals,",
        "academic databases and digital archives",
        "can often be accessed by many users",
        "at the same time, even from home."
      ],
      "simpleChunks": [
        "But many people can often",
        "use online books,",
        "study magazines and stored information",
        "together,",
        "even at home."
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
        },
        {
          "original": "shift workers",
          "simple": "people working at different times of day",
          "meaning": "輪班工作者"
        },
        {
          "original": "may not be able to",
          "simple": "might not be free or able to",
          "meaning": "未必能夠"
        },
        {
          "original": "visit a library",
          "simple": "go to a library",
          "meaning": "到訪圖書館"
        }
      ],
      "chunks": [
        "This is especially useful for students,",
        "shift workers and elderly people",
        "who may not be able",
        "to visit a library regularly."
      ],
      "simpleChunks": [
        "This helps students,",
        "people who work at different",
        "hours,",
        "and older people who cannot",
        "often go to a library."
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
        },
        {
          "original": "preparing for",
          "simple": "getting ready for",
          "meaning": "準備"
        },
        {
          "original": "search",
          "simple": "look for",
          "meaning": "搜尋"
        },
        {
          "original": "electronic journals",
          "simple": "online study magazines",
          "meaning": "電子期刊"
        },
        {
          "original": "within minutes",
          "simple": "in a few minutes",
          "meaning": "數分鐘內"
        },
        {
          "original": "whereas",
          "simple": "but / while",
          "meaning": "然而；對比"
        },
        {
          "original": "printed volumes",
          "simple": "paper books",
          "meaning": "紙本書冊"
        },
        {
          "original": "may involve",
          "simple": "may need",
          "meaning": "可能涉及"
        },
        {
          "original": "several visits",
          "simple": "going there a few times",
          "meaning": "多次到訪"
        },
        {
          "original": "wasted time",
          "simple": "time lost without useful results",
          "meaning": "浪費的時間"
        }
      ],
      "chunks": [
        "For example, a student preparing for an assignment",
        "can search electronic journals within minutes,",
        "whereas relying only on printed volumes",
        "may involve several visits",
        "and a great deal of wasted time."
      ],
      "simpleChunks": [
        "For example,",
        "a student can find online",
        "study magazines in a few",
        "minutes.",
        "With only paper books,",
        "the student may need to",
        "go there many times and",
        "lose a lot of time."
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
        },
        {
          "original": "technology",
          "simple": "computer tools in this context",
          "meaning": "本句指科技工具"
        },
        {
          "original": "allows",
          "simple": "lets / makes it possible for",
          "meaning": "讓；使能夠"
        },
        {
          "original": "beyond",
          "simple": "outside / further than",
          "meaning": "超越"
        },
        {
          "original": "their own walls",
          "simple": "their own building",
          "meaning": "它們的館舍"
        }
      ],
      "chunks": [
        "In this sense, technology allows libraries",
        "to reach beyond their own walls."
      ],
      "simpleChunks": [
        "In this way,",
        "a library can help people",
        "outside its building."
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
        },
        {
          "original": "Another important point",
          "simple": "One more key idea",
          "meaning": "另一重要觀點"
        },
        {
          "original": "modern",
          "simple": "of today",
          "meaning": "現代的"
        },
        {
          "original": "should help",
          "simple": "ought to give help to",
          "meaning": "應該幫助"
        },
        {
          "original": "digital skills",
          "simple": "skills for using computers and online tools",
          "meaning": "數碼技能"
        }
      ],
      "chunks": [
        "Another important point is",
        "that modern libraries should help people",
        "build practical digital skills."
      ],
      "simpleChunks": [
        "Another key point is that",
        "libraries should help people learn",
        "useful computer skills."
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
        },
        {
          "original": "public services",
          "simple": "help provided for people by public bodies",
          "meaning": "公共服務"
        },
        {
          "original": "depend on",
          "simple": "need / rely on",
          "meaning": "依賴"
        },
        {
          "original": "ability",
          "simple": "being able to do something",
          "meaning": "能力"
        },
        {
          "original": "search for",
          "simple": "look for",
          "meaning": "搜尋"
        },
        {
          "original": "online information",
          "simple": "facts and other material on the internet",
          "meaning": "網上資訊"
        }
      ],
      "chunks": [
        "Education, employment and public services",
        "increasingly depend on the ability",
        "to search for, evaluate and use",
        "online information responsibly."
      ],
      "simpleChunks": [
        "For school,",
        "work and public help,",
        "people need to find online",
        "information,",
        "check if it is good,",
        "and use it with care."
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
        },
        {
          "original": "media rooms",
          "simple": "rooms for using sound, pictures and video",
          "meaning": "媒體室"
        },
        {
          "original": "trained staff",
          "simple": "workers taught to do the job",
          "meaning": "受訓職員"
        },
        {
          "original": "become",
          "simple": "change into",
          "meaning": "成為"
        },
        {
          "original": "active learning centres",
          "simple": "places where people learn by doing",
          "meaning": "活躍的學習中心"
        },
        {
          "original": "rather than",
          "simple": "instead of",
          "meaning": "而不是"
        },
        {
          "original": "quiet",
          "simple": "with little noise or activity",
          "meaning": "安靜的"
        }
      ],
      "chunks": [
        "If libraries invest in computers, media rooms,",
        "online catalogues and trained staff,",
        "they become active learning centres",
        "rather than quiet storage spaces."
      ],
      "simpleChunks": [
        "If libraries spend money on",
        "computers,",
        "work rooms,",
        "online lists and trained workers,",
        "they become places to learn,",
        "not just places to keep",
        "things."
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
        },
        {
          "original": "safely",
          "simple": "without taking unsafe risks",
          "meaning": "安全地"
        },
        {
          "original": "prepare",
          "simple": "get ready",
          "meaning": "準備"
        },
        {
          "original": "adults",
          "simple": "grown-up people",
          "meaning": "成年人"
        },
        {
          "original": "access",
          "simple": "use / get into",
          "meaning": "取用"
        },
        {
          "original": "government services",
          "simple": "help or services from the government",
          "meaning": "政府服務"
        },
        {
          "original": "moved online",
          "simple": "are now on the internet",
          "meaning": "已轉到網上"
        }
      ],
      "chunks": [
        "Children can learn how to research safely,",
        "job seekers can prepare applications,",
        "and adults can access government services",
        "that have moved online."
      ],
      "simpleChunks": [
        "Children can learn to look",
        "for facts safely.",
        "People can ask for jobs.",
        "Adults can use public services",
        "online."
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
        },
        {
          "original": "larger",
          "simple": "bigger",
          "meaning": "更大的"
        },
        {
          "original": "paper collection",
          "simple": "the paper books a place has",
          "meaning": "紙本館藏"
        },
        {
          "original": "cannot",
          "simple": "is not able to",
          "meaning": "不能"
        }
      ],
      "chunks": [
        "A larger paper collection alone",
        "cannot meet these needs."
      ],
      "simpleChunks": [
        "More paper books on their",
        "own cannot give people all",
        "these things."
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
        },
        {
          "original": "may look",
          "simple": "might seem",
          "meaning": "可能看起來"
        },
        {
          "original": "adding more candles",
          "simple": "getting extra candles",
          "meaning": "添加更多蠟燭"
        },
        {
          "original": "in an age",
          "simple": "at a time in history",
          "meaning": "在某個時代"
        },
        {
          "original": "electric light",
          "simple": "light made with electricity",
          "meaning": "電燈"
        }
      ],
      "chunks": [
        "It may look impressive,",
        "but it is like adding more candles",
        "in an age that requires electric light."
      ],
      "simpleChunks": [
        "More books may look good.",
        "But this is like buying",
        "more candles when we need",
        "electric lights."
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
        },
        {
          "original": "In conclusion",
          "simple": "To finish / So",
          "meaning": "總結"
        },
        {
          "original": "completely agree",
          "simple": "agree fully",
          "meaning": "完全同意"
        },
        {
          "original": "technological resources",
          "simple": "computer tools and services",
          "meaning": "科技資源"
        },
        {
          "original": "instead of",
          "simple": "not / rather than",
          "meaning": "而不是"
        },
        {
          "original": "collections of paper books",
          "simple": "groups of paper books kept there",
          "meaning": "紙本館藏"
        }
      ],
      "chunks": [
        "In conclusion, I completely agree",
        "that libraries should focus on improving their technological resources",
        "instead of building ever-larger collections of paper books."
      ],
      "simpleChunks": [
        "So I agree: libraries should",
        "make their computer tools better,",
        "not just get more and",
        "more paper books."
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
        },
        {
          "original": "This approach",
          "simple": "This way of doing things",
          "meaning": "這種做法"
        },
        {
          "original": "more relevant role",
          "simple": "a job that matters more for current needs",
          "meaning": "更切合需要的角色"
        },
        {
          "original": "society",
          "simple": "people living together in a community",
          "meaning": "社會"
        }
      ],
      "chunks": [
        "This approach gives libraries wider reach,",
        "greater efficiency and a more relevant role",
        "in contemporary society."
      ],
      "simpleChunks": [
        "This helps libraries reach more",
        "people,",
        "use time and money better,",
        "and do a job that",
        "matters today."
      ]
    }
  ],
  "transfer": [
    {
      "prompt": "路線遷移：公園應加設遮蔭地方。\n哪個安排先建立主張，再用兩條理由支持，最後作結論？",
      "context": "路線遷移：公園應加設遮蔭地方。",
      "question": "哪個安排先建立主張，再用兩條理由支持，最後作結論？",
      "options": [
        "Choose more shade; explain safe play and cooler rest; repeat the main choice.",
        "Describe cooler rest; repeat the choice twice; add safe play after the ending.",
        "Choose more shade; list several kinds of trees; finish with their planting dates.",
        "Describe safe play; explain the same point again; finish without stating a choice."
      ],
      "correct": 0,
      "explanations": [
        "先立場、兩條不同理由，最後回到立場，形成完整論證。",
        "兩條理由沒有在結論前完整展開，重複立場不能代替支持。",
        "樹木種類和日期屬資料清單，沒有展開兩條支持理由。",
        "重複同一理由，亦缺少清楚立場，未形成指定路線。"
      ],
      "why": "先立場、兩條不同理由，最後回到立場，形成完整論證。",
      "sourceSentenceIndices": [
        0,
        1,
        14,
        15
      ],
      "modelLink": "範文先交代圖書館角色與科技優先的立場，再以「取用更廣」和「數碼技能」分成兩段，最後重申。公園題把兩條理由換成安全玩耍和涼快休息，保留同一篇章路線。"
    },
    {
      "prompt": "主體一 · 主張：要改善巴士服務。\n哪句最直接提出「擴大服務覆蓋」的理由？",
      "context": "主體一 · 主張：要改善巴士服務。",
      "question": "哪句最直接提出「擴大服務覆蓋」的理由？",
      "options": [
        "New bus routes let people in more villages reach the town.",
        "New bus seats let people on busy routes travel more comfortably.",
        "New bus engines let drivers use less fuel on each journey.",
        "New bus signs let regular passengers find their usual stops faster."
      ],
      "correct": 0,
      "explanations": [
        "新路線把原本未被覆蓋的村民納入服務，直接擴大覆蓋。",
        "改善的是已有乘客的舒適度，未顯示接觸更多地方的人。",
        "改善的是燃料效率，未顯示服務人群擴大。",
        "改善的是原有乘客找站的便利，未顯示覆蓋擴大。"
      ],
      "why": "新路線把原本未被覆蓋的村民納入服務，直接擴大覆蓋。",
      "sourceSentenceIndices": [
        2
      ],
      "modelLink": "範文第一主體段先主張數碼資源能服務比紙本書更多的人。這題同樣先提出「措施 → 更多人能使用服務」，把數碼取用換成巴士路線。"
    },
    {
      "prompt": "主體一 · 原有限制：公園只有一個水龍頭。\n哪句最直接解釋同一時間能服務的人數限制？",
      "context": "主體一 · 原有限制：公園只有一個水龍頭。",
      "question": "哪句最直接解釋同一時間能服務的人數限制？",
      "options": [
        "Only one person can fill a bottle while the others wait.",
        "Visitors near the far gate must walk across the park for water.",
        "The tap closes early, so evening visitors cannot fill their bottles.",
        "The tap is quite high, so young children need help reaching it."
      ],
      "correct": 0,
      "explanations": [
        "一人使用、其他人等待，直接呈現同時服務的容量限制。",
        "這是距離限制，並非同一時間服務人數。",
        "這是開放時間限制，並非同時使用容量。",
        "這是使用高度和身體條件限制，並非同時使用容量。"
      ],
      "why": "一人使用、其他人等待，直接呈現同時服務的容量限制。",
      "sourceSentenceIndices": [
        3
      ],
      "modelLink": "範文用「一本實體書通常一次只供一人借閱」建立容量限制。水龍頭題保留「單一資源 → 一次只服務一人 → 其他人等候」的邏輯。"
    },
    {
      "prompt": "主體一 · 對比：居民白天上班，舊診所只在上午開門。\n哪個新做法直接解決這群居民不能到診的限制？",
      "context": "主體一 · 對比：居民白天上班，舊診所只在上午開門。",
      "question": "哪個新做法直接解決這群居民不能到診的限制？",
      "options": [
        "The new clinic opens after work, so these residents can attend.",
        "The new clinic adds morning staff, so patients wait less time.",
        "The new clinic lowers morning fees, so each visit costs less.",
        "The new clinic adds morning rooms, so more patients fit inside."
      ],
      "correct": 0,
      "explanations": [
        "晚間時段直接回應居民白天上班的限制。",
        "增加上午人手可縮短等候，但居民仍在上班。",
        "減低上午收費可降低成本，但沒有解決時間衝突。",
        "增加上午容量仍未讓白天工作的居民到診。"
      ],
      "why": "晚間時段直接回應居民白天上班的限制。",
      "sourceSentenceIndices": [
        3,
        4
      ],
      "modelLink": "範文先指出實體書須到館領取等限制，再對比數碼資源可在家取用。診所題保留「找出舊限制 → 新安排直接解除限制」，把地點限制換成時間衝突。"
    },
    {
      "prompt": "主體一 · 受惠者：送餐讓不能出門的人也能取得飯餐。\n哪組人的需要最直接對應這項新增的取用好處？",
      "context": "主體一 · 受惠者：送餐讓不能出門的人也能取得飯餐。",
      "question": "哪組人的需要最直接對應這項新增的取用好處？",
      "options": [
        "People who cannot leave home because of illness or limited movement.",
        "People who live near cafes and want to compare different meal prices.",
        "People who enjoy cooking at home and want to learn new dishes.",
        "People who eat near work and want a wider choice of lunch places."
      ],
      "correct": 0,
      "explanations": [
        "不能出門的限制正是送餐所解除的障礙。",
        "比較價格可能是需要，但題目沒有提供送餐的價格優勢。",
        "學新菜式是技能需要，送餐本身不是煮食教學。",
        "更多午餐選擇可能有吸引力，但未對應不能出門的限制。"
      ],
      "why": "不能出門的限制正是送餐所解除的障礙。",
      "sourceSentenceIndices": [
        5
      ],
      "modelLink": "範文點名學生、輪班工作者及未必能定期到館的長者。選受惠者時，必須把「這群人的障礙」與「措施解除的限制」配對，而非只找可能喜歡服務的人。"
    },
    {
      "prompt": "主體一 · 例證：泳池延長晚間開放，目的是方便白天工作的居民。\n哪個例子最直接展示這項改變如何幫助目標使用者？",
      "context": "主體一 · 例證：泳池延長晚間開放，目的是方便白天工作的居民。",
      "question": "哪個例子最直接展示這項改變如何幫助目標使用者？",
      "options": [
        "A nurse finishing at six can now swim after her shift.",
        "A pupil finishing at three still swims at her usual time.",
        "A retired swimmer finds that the morning pool is less crowded.",
        "A weekend visitor enjoys the new seats beside the same pool."
      ],
      "correct": 0,
      "explanations": [
        "工作結束後原本無法使用、現在可以，完整呈現目標好處。",
        "她沿用原有時間，未展示延長晚間時段帶來的改變。",
        "早上較少人是另一好處，未直接展示白天工作者能到訪。",
        "新座位改善舒適度，並非晚間開放的取用作用。"
      ],
      "why": "工作結束後原本無法使用、現在可以，完整呈現目標好處。",
      "sourceSentenceIndices": [
        6
      ],
      "modelLink": "範文以學生準備作業為例：數分鐘搜尋電子期刊，對比多次親身到館。好例子要交代具體人物、任務和新安排帶來的改變；護士下班後游泳沿用這個例證方法。"
    },
    {
      "prompt": "主體一 · 結論：小巴開始到偏遠村落接人。\n哪句最準確概括「突破地點限制」這條理由？",
      "context": "主體一 · 結論：小巴開始到偏遠村落接人。",
      "question": "哪句最準確概括「突破地點限制」這條理由？",
      "options": [
        "The service now reaches people who live beyond the town centre.",
        "The service now gives town passengers a more comfortable daily journey.",
        "The service now spends less money carrying its usual town passengers.",
        "The service now makes nearby stops easier for regular passengers to find."
      ],
      "correct": 0,
      "explanations": [
        "結論回到遠離市中心的人也能被服務，概括地點覆蓋。",
        "這概括舒適度，未回到村落新增覆蓋。",
        "這概括成本，未回到地點障礙。",
        "這概括找站便利，未回到遠距離人群。"
      ],
      "why": "結論回到遠離市中心的人也能被服務，概括地點覆蓋。",
      "sourceSentenceIndices": [
        7
      ],
      "modelLink": "範文第一主體段以「reach beyond their own walls」概括數碼服務超越館舍。小巴題同樣把具體措施提升為「服務超越原有地點」的段落結論。"
    },
    {
      "prompt": "主體二 · 主張：社區想開設煮食課。\n哪句最直接以「建立實用能力」支持開課？",
      "context": "主體二 · 主張：社區想開設煮食課。",
      "question": "哪句最直接以「建立實用能力」支持開課？",
      "options": [
        "Cooking classes teach residents to prepare healthy meals without help.",
        "Cooking classes give residents a place to meet people nearby.",
        "Cooking classes bring more visitors to the local community centre.",
        "Cooking classes offer residents ready meals at a lower price."
      ],
      "correct": 0,
      "explanations": [
        "自己能準備飯餐，是學生獲得可運用能力的主張。",
        "交朋友是社交好處，不是煮食能力。",
        "增加中心訪客是使用量好處，不是學會技能。",
        "獲得便宜現成飯餐是供應好處，不等於能自己煮。"
      ],
      "why": "自己能準備飯餐，是學生獲得可運用能力的主張。",
      "sourceSentenceIndices": [
        8
      ],
      "modelLink": "範文第二主體段的主張是圖書館應幫人建立實用數碼技能。煮食題把技能換成獨立準備飯餐，保留「機構不只是提供東西，也讓使用者學會做事」的主線。"
    },
    {
      "prompt": "主體二 · 現代需要：社區建議教居民管理金錢。\n哪句最直接把這項技能連到居民日常必須完成的任務？",
      "context": "主體二 · 現代需要：社區建議教居民管理金錢。",
      "question": "哪句最直接把這項技能連到居民日常必須完成的任務？",
      "options": [
        "Residents must pay bills and plan spending within their monthly income.",
        "Residents can join classes and meet neighbours with similar learning interests.",
        "Residents need clear bank signs to find the nearest local branch.",
        "Residents need banks to offer longer opening hours after their working day."
      ],
      "correct": 0,
      "explanations": [
        "付帳和在收入內計劃支出，是需要金錢管理能力的生活任務。",
        "這是參加課堂的社交機會，未解釋管理金錢的生活需要。",
        "銀行標示改善地點辨識，未解釋為何需要管理收支的能力。",
        "延長開放時間解決到訪限制，未解釋為何需要管理金錢的技能。"
      ],
      "why": "付帳和在收入內計劃支出，是需要金錢管理能力的生活任務。",
      "sourceSentenceIndices": [
        9
      ],
      "modelLink": "範文以教育、就業和公共服務依賴網上資訊能力，解釋為何需要數碼技能。此題同樣把抽象技能連到具體生活任務：管理金錢對應付帳和計劃支出。"
    },
    {
      "prompt": "主體二 · 行動方案：孩子尚未學會在水中安全游泳。\n哪項投入最直接幫助孩子把安全知識變成游泳能力？",
      "context": "主體二 · 行動方案：孩子尚未學會在水中安全游泳。",
      "question": "哪項投入最直接幫助孩子把安全知識變成游泳能力？",
      "options": [
        "Provide pool sessions, trained teachers and guided practice for each child.",
        "Provide pool sessions, safety signs and free entry for each child.",
        "Provide trained teachers, classroom talks and safety videos for each child.",
        "Provide swimming videos, written feedback and weekly quizzes for each child."
      ],
      "correct": 0,
      "explanations": [
        "場地、教師和練習直接組成學習能力的條件。",
        "提供入場和安全資訊，但尚未提供教導初學者的指導練習。",
        "有教師和知識講解，但沒有讓孩子在水中練習。",
        "影片、書面回饋和測驗可檢查知識，仍缺少水中的動作練習。"
      ],
      "why": "場地、教師和練習直接組成學習能力的條件。",
      "sourceSentenceIndices": [
        10
      ],
      "modelLink": "範文提出投資電腦、媒體室、網上目錄和受訓職員，讓圖書館成為學習中心。泳池、教師與指導練習對應「合適設施＋專業支援 → 使用者學會實用技能」，不是單純買更多物品。"
    },
    {
      "prompt": "主體二 · 使用者例子：社區課程教居民安全修理單車。\n哪句最直接展示學員把新能力用於生活？",
      "context": "主體二 · 使用者例子：社區課程教居民安全修理單車。",
      "question": "哪句最直接展示學員把新能力用於生活？",
      "options": [
        "After training, Mei fixes her bike brake safely without the teacher.",
        "After training, Mei buys a repair book recommended by the teacher.",
        "After training, Mei watches the teacher repair several different bike brakes.",
        "After training, Mei receives a tool set to keep at home."
      ],
      "correct": 0,
      "explanations": [
        "自行安全完成修理，展示能力已能用於真實任務。",
        "買書是取得資源，不是已運用修理技能。",
        "觀看教師是接觸示範，未展示自己能做。",
        "取得工具是具備資源，未展示會使用。"
      ],
      "why": "自行安全完成修理，展示能力已能用於真實任務。",
      "sourceSentenceIndices": [
        11
      ],
      "modelLink": "範文用兒童研究、求職者準備申請、成年人使用政府服務，展示數碼技能的實際用途。Mei 自己修好煞車同樣把「學會能力」落實到「某位使用者能完成某件事」。"
    },
    {
      "prompt": "主體二 · 排除替代：社區希望居民能親手完成基本急救。\n為甚麼只買更多急救海報，仍不足以達到這個目標？",
      "context": "主體二 · 排除替代：社區希望居民能親手完成基本急救。",
      "question": "為甚麼只買更多急救海報，仍不足以達到這個目標？",
      "options": [
        "Posters give information but cannot provide practice with trained feedback.",
        "Posters take wall space that could hold more local event notices.",
        "Posters need new printing whenever first-aid advice changes over the years.",
        "Posters may cost more when the centre chooses larger coloured copies."
      ],
      "correct": 0,
      "explanations": [
        "指出資訊資源與親手練習、回饋之間的能力缺口。",
        "牆面空間是管理問題，未解釋為何無法學會急救。",
        "更新指引是維護問題，未解釋資訊與實作能力之間的缺口。",
        "印刷成本是預算問題，未解釋海報與實作能力的差距。"
      ],
      "why": "指出資訊資源與親手練習、回饋之間的能力缺口。",
      "sourceSentenceIndices": [
        12
      ],
      "modelLink": "範文說更多紙本書 alone cannot meet these needs，因為現代任務還需要技能與支援。海報不是毫無價值；它們能提供資訊，但不能單獨替代指導實作，這正是「有用但不足」的論證。"
    },
    {
      "prompt": "主體二 · 比喻結論：想提高足球能力，卻只買更多球衣。\n哪個比喻同樣指出「增加相關物品，卻沒有提供能力訓練」？",
      "context": "主體二 · 比喻結論：想提高足球能力，卻只買更多球衣。",
      "question": "哪個比喻同樣指出「增加相關物品，卻沒有提供能力訓練」？",
      "options": [
        "It is like buying more aprons instead of practising how to cook.",
        "It is like practising more passes instead of buying new football shirts.",
        "It is like training more teachers instead of printing more school posters.",
        "It is like offering more lessons instead of buying more classroom pictures."
      ],
      "correct": 0,
      "explanations": [
        "圍裙與煮食有關，但增加圍裙不等於練習煮食，錯配方向一致。",
        "這是用練習替代購物，方向相反，而且回應能力需要。",
        "這是投資教學支援而非海報，方向相反。",
        "這是提供學習機會而非裝飾，方向相反。"
      ],
      "why": "圍裙與煮食有關，但增加圍裙不等於練習煮食，錯配方向一致。",
      "sourceSentenceIndices": [
        13
      ],
      "modelLink": "範文用「需要電燈的時代卻增加蠟燭」指出舊資源的數量未必回應新需要。本題把比喻轉成球衣與圍裙：物品與活動相關，仍不能代替真正需要的能力訓練。"
    },
    {
      "prompt": "證據遷移：新巴士路線聲稱讓以前沒有服務的居民也能出行。\n哪項資料最直接檢驗這項「覆蓋擴大」的主張？",
      "context": "證據遷移：新巴士路線聲稱讓以前沒有服務的居民也能出行。",
      "question": "哪項資料最直接檢驗這項「覆蓋擴大」的主張？",
      "options": [
        "Three villages without buses now have daily stops used by local residents.",
        "Three busy town stops now have new seats used by regular passengers.",
        "Three old bus routes now use less fuel while carrying their usual passengers.",
        "Three popular bus routes now have new signs showing their usual town stops."
      ],
      "correct": 0,
      "explanations": [
        "以前沒有、現在有，而且有居民使用，直接對應新增覆蓋。",
        "座位資料衡量已有服務的舒適度，不是新覆蓋。",
        "燃料資料衡量效率，未顯示原本未被服務的人能使用。",
        "新標誌衡量資訊便利，未顯示路線覆蓋擴大。"
      ],
      "why": "以前沒有、現在有，而且有居民使用，直接對應新增覆蓋。",
      "sourceSentenceIndices": [
        2,
        4,
        6
      ],
      "modelLink": "範文第一主體段的證據都服務「更廣取用」這個主張，例如多人同時、在家取用及學生節省到館行程。此題要求選能直接檢驗同一主張的資料，而非另一項真實但不同的好處。"
    },
    {
      "prompt": "證據遷移：煮食課聲稱讓原本不會煮食的學員能獨立準備飯餐。\n哪項結果最直接支持「學會實用能力」，而不只是參與課程？",
      "context": "證據遷移：煮食課聲稱讓原本不會煮食的學員能獨立準備飯餐。",
      "question": "哪項結果最直接支持「學會實用能力」，而不只是參與課程？",
      "options": [
        "After the course, ten beginners prepared a full meal without help.",
        "After the course, ten beginners said they enjoyed watching the teacher.",
        "After the course, ten beginners took home a complete recipe book.",
        "After the course, ten beginners signed up for another cooking lesson."
      ],
      "correct": 0,
      "explanations": [
        "初學者無協助完成任務，是能力表現的直接證據。",
        "喜歡觀看反映滿意度，未證明自己能煮。",
        "取得食譜反映得到資源，未證明能運用。",
        "再報讀反映興趣或參與，未證明已掌握能力。"
      ],
      "why": "初學者無協助完成任務，是能力表現的直接證據。",
      "sourceSentenceIndices": [
        8,
        11
      ],
      "modelLink": "範文第二主體段以使用者能安全研究、準備申請或使用政府服務來展示能力。煮食題也要看「學員能完成任務」，不能只用出席、喜歡或取得教材代替技能證據。"
    },
    {
      "prompt": "結論遷移：免費運動班讓更多居民能參加，並教會他們安全運動。\n哪句同時保留「更廣參與」和「實用能力」兩條理由？",
      "context": "結論遷移：免費運動班讓更多居民能參加，並教會他們安全運動。",
      "question": "哪句同時保留「更廣參與」和「實用能力」兩條理由？",
      "options": [
        "The classes reach more residents and teach them to exercise safely.",
        "The classes reach more residents and give them more free places.",
        "The classes teach safer movement and help learners practise correct steps.",
        "The classes lower entry costs and help the centre spend less."
      ],
      "correct": 0,
      "explanations": [
        "同時概括誰能參與更多，以及參與者學會甚麼。",
        "免費名額和更多居民都屬取用主線，遺漏技能。",
        "安全動作和正確步驟都屬技能主線，遺漏覆蓋。",
        "成本主線未概括安全運動能力。"
      ],
      "why": "同時概括誰能參與更多，以及參與者學會甚麼。",
      "sourceSentenceIndices": [
        14,
        15
      ],
      "modelLink": "範文結論重申科技優先，並收回更廣覆蓋、效率和現代角色。此題要求結論保留前文的兩條不同主線；把同一條理由改寫兩次，不能代替完整總結。"
    }
  ]
};
