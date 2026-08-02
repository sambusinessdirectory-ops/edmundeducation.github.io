// GENERATED FILE. Edit grammar-corpus/corpus-v1.json and run
// node grammar-corpus/validate-and-generate.mjs instead.

export const CORPUS_VERSION = "2026-08-02.1";

export const CORPUS_SENTENCES = Object.freeze([
  {
    "sentenceId": "PARA-0001-S01",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "In recent years, many company requires their staffs to wears uniforms at work.",
    "correctedSentence": "In recent years, many companies require their staff to wear uniforms at work.",
    "categories": [
      "countability",
      "infinitive_or_gerund",
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "MANY_PLURAL_NOUN",
      "PLURAL_SUBJECT_VERB",
      "STAFF_COLLECTIVE_NOUN",
      "TO_BASE_VERB"
    ],
    "structureTags": [
      "category:countability",
      "category:infinitive_or_gerund",
      "category:singular_plural",
      "category:subject_verb_agreement",
      "infinitive_to",
      "quantifier",
      "rule:MANY_PLURAL_NOUN",
      "rule:PLURAL_SUBJECT_VERB",
      "rule:STAFF_COLLECTIVE_NOUN",
      "rule:TO_BASE_VERB"
    ],
    "explanationZhHant": "many 後面的可數名詞通常要用複數，所以寫 companies。 companies 是複數主語，現在式動詞用 require，不加 s。 staff 通常是集合名詞。可寫 staff 或 staff members，一般不寫 staffs。 to 後面使用動詞原形，所以是 to wear。",
    "issues": [
      {
        "issueId": "PARA-0001-I001",
        "ruleId": "MANY_PLURAL_NOUN",
        "category": "singular_plural",
        "originalText": "company",
        "replacementText": "companies",
        "occurrence": 1,
        "explanationZhHant": "many 後面的可數名詞通常要用複數，所以寫 companies。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I002",
        "ruleId": "PLURAL_SUBJECT_VERB",
        "category": "subject_verb_agreement",
        "originalText": "requires",
        "replacementText": "require",
        "occurrence": 1,
        "explanationZhHant": "companies 是複數主語，現在式動詞用 require，不加 s。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I003",
        "ruleId": "STAFF_COLLECTIVE_NOUN",
        "category": "countability",
        "originalText": "staffs",
        "replacementText": "staff",
        "occurrence": 1,
        "explanationZhHant": "staff 通常是集合名詞。可寫 staff 或 staff members，一般不寫 staffs。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I004",
        "ruleId": "TO_BASE_VERB",
        "category": "infinitive_or_gerund",
        "originalText": "wears",
        "replacementText": "wear",
        "occurrence": 1,
        "explanationZhHant": "to 後面使用動詞原形，所以是 to wear。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0001-S02",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "This policy have several advantage for both workers and customer.",
    "correctedSentence": "This policy has several advantages for both workers and customers.",
    "categories": [
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "GENERAL_GROUP_PLURAL",
      "SEVERAL_PLURAL_NOUN",
      "SINGULAR_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:singular_plural",
      "category:subject_verb_agreement",
      "coordination",
      "have_auxiliary",
      "quantifier",
      "rule:GENERAL_GROUP_PLURAL",
      "rule:SEVERAL_PLURAL_NOUN",
      "rule:SINGULAR_SUBJECT_VERB"
    ],
    "explanationZhHant": "policy 是第三身單數，所以使用 has。 several 後面要接可數名詞複數，所以是 advantages。 這裡泛指顧客這個群體，所以使用 customers。",
    "issues": [
      {
        "issueId": "PARA-0001-I005",
        "ruleId": "SINGULAR_SUBJECT_VERB",
        "category": "subject_verb_agreement",
        "originalText": "have",
        "replacementText": "has",
        "occurrence": 1,
        "explanationZhHant": "policy 是第三身單數，所以使用 has。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I006",
        "ruleId": "SEVERAL_PLURAL_NOUN",
        "category": "singular_plural",
        "originalText": "advantage",
        "replacementText": "advantages",
        "occurrence": 1,
        "explanationZhHant": "several 後面要接可數名詞複數，所以是 advantages。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I007",
        "ruleId": "GENERAL_GROUP_PLURAL",
        "category": "singular_plural",
        "originalText": "customer",
        "replacementText": "customers",
        "occurrence": 1,
        "explanationZhHant": "這裡泛指顧客這個群體，所以使用 customers。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0001-S03",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "First, customers can identifies employees quickly, especially when they needs help.",
    "correctedSentence": "First, customers can identify employees quickly, especially when they need help.",
    "categories": [
      "modal_or_auxiliary",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PLURAL_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:subject_verb_agreement",
      "modal",
      "question_word",
      "rule:MODAL_BASE_VERB",
      "rule:PLURAL_SUBJECT_VERB"
    ],
    "explanationZhHant": "can 後面使用動詞原形，所以是 can identify。 they 是複數主語，所以使用 need，不加 s。",
    "issues": [
      {
        "issueId": "PARA-0001-I008",
        "ruleId": "MODAL_BASE_VERB",
        "category": "modal_or_auxiliary",
        "originalText": "identifies",
        "replacementText": "identify",
        "occurrence": 1,
        "explanationZhHant": "can 後面使用動詞原形，所以是 can identify。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I009",
        "ruleId": "PLURAL_SUBJECT_VERB",
        "category": "subject_verb_agreement",
        "originalText": "needs",
        "replacementText": "need",
        "occurrence": 1,
        "explanationZhHant": "they 是複數主語，所以使用 need，不加 s。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0001-S04",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Second, a uniform can reduces how much money staff spend for work clothes.",
    "correctedSentence": "Second, a uniform can reduce how much money staff spend on work clothes.",
    "categories": [
      "modal_or_auxiliary",
      "preposition"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "SPEND_MONEY_ON"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:preposition",
      "modal",
      "quantifier",
      "question_word",
      "rule:MODAL_BASE_VERB",
      "rule:SPEND_MONEY_ON"
    ],
    "explanationZhHant": "can 後面使用動詞原形，所以是 can reduce。 表示「花錢在某事上」使用 spend money on something。",
    "issues": [
      {
        "issueId": "PARA-0001-I010",
        "ruleId": "MODAL_BASE_VERB",
        "category": "modal_or_auxiliary",
        "originalText": "reduces",
        "replacementText": "reduce",
        "occurrence": 1,
        "explanationZhHant": "can 後面使用動詞原形，所以是 can reduce。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I011",
        "ruleId": "SPEND_MONEY_ON",
        "category": "preposition",
        "originalText": "spend for",
        "replacementText": "spend on",
        "occurrence": 1,
        "explanationZhHant": "表示「花錢在某事上」使用 spend money on something。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0001-S05",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "However, some employee feels uncomfortable because the same design do not suit everyone.",
    "correctedSentence": "However, some employees feel uncomfortable because the same design does not suit everyone.",
    "categories": [
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "GENERAL_SOME_PLURAL",
      "PLURAL_SUBJECT_VERB",
      "SINGULAR_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:singular_plural",
      "category:subject_verb_agreement",
      "negation",
      "quantifier",
      "rule:GENERAL_SOME_PLURAL",
      "rule:PLURAL_SUBJECT_VERB",
      "rule:SINGULAR_SUBJECT_VERB"
    ],
    "explanationZhHant": "這裡泛指部分員工，所以使用 some employees。 employees 是複數，因此使用 feel。 design 是第三身單數，因此使用 does not。",
    "issues": [
      {
        "issueId": "PARA-0001-I012",
        "ruleId": "GENERAL_SOME_PLURAL",
        "category": "singular_plural",
        "originalText": "employee",
        "replacementText": "employees",
        "occurrence": 1,
        "explanationZhHant": "這裡泛指部分員工，所以使用 some employees。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I013",
        "ruleId": "PLURAL_SUBJECT_VERB",
        "category": "subject_verb_agreement",
        "originalText": "feels",
        "replacementText": "feel",
        "occurrence": 1,
        "explanationZhHant": "employees 是複數，因此使用 feel。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I014",
        "ruleId": "SINGULAR_SUBJECT_VERB",
        "category": "subject_verb_agreement",
        "originalText": "do",
        "replacementText": "does",
        "occurrence": 1,
        "explanationZhHant": "design 是第三身單數，因此使用 does not。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0001-S06",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Uniforms may also makes workers feel that they has less personal freedom.",
    "correctedSentence": "Uniforms may also make workers feel that they have less personal freedom.",
    "categories": [
      "modal_or_auxiliary",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PLURAL_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:subject_verb_agreement",
      "have_auxiliary",
      "modal",
      "rule:MODAL_BASE_VERB",
      "rule:PLURAL_SUBJECT_VERB"
    ],
    "explanationZhHant": "may 後面使用動詞原形，所以是 may make。 they 是複數主語，因此使用 have。",
    "issues": [
      {
        "issueId": "PARA-0001-I015",
        "ruleId": "MODAL_BASE_VERB",
        "category": "modal_or_auxiliary",
        "originalText": "makes",
        "replacementText": "make",
        "occurrence": 1,
        "explanationZhHant": "may 後面使用動詞原形，所以是 may make。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I016",
        "ruleId": "PLURAL_SUBJECT_VERB",
        "category": "subject_verb_agreement",
        "originalText": "has",
        "replacementText": "have",
        "occurrence": 1,
        "explanationZhHant": "they 是複數主語，因此使用 have。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0001-S07",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "In my opinion, companies should provides suitable uniforms and allows employees to choose between several styles, so the policy can remain professional without caused unnecessary discomfort at work.",
    "correctedSentence": "In my opinion, companies should provide suitable uniforms and allow employees to choose between several styles, so the policy can remain professional without causing unnecessary discomfort at work.",
    "categories": [
      "infinitive_or_gerund",
      "modal_or_auxiliary",
      "parallelism"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PREPOSITION_GERUND",
      "SHARED_MODAL_PARALLEL"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:modal_or_auxiliary",
      "category:parallelism",
      "coordination",
      "infinitive_to",
      "modal",
      "quantifier",
      "rule:MODAL_BASE_VERB",
      "rule:PREPOSITION_GERUND",
      "rule:SHARED_MODAL_PARALLEL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "should 後面使用動詞原形，所以是 should provide。 should 同時控制 provide 和 allow，兩個動詞都要使用原形。 without 是介詞，後面的動作通常使用動名詞，所以是 without causing。",
    "issues": [
      {
        "issueId": "PARA-0001-I017",
        "ruleId": "MODAL_BASE_VERB",
        "category": "modal_or_auxiliary",
        "originalText": "provides",
        "replacementText": "provide",
        "occurrence": 1,
        "explanationZhHant": "should 後面使用動詞原形，所以是 should provide。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I018",
        "ruleId": "SHARED_MODAL_PARALLEL",
        "category": "parallelism",
        "originalText": "allows",
        "replacementText": "allow",
        "occurrence": 1,
        "explanationZhHant": "should 同時控制 provide 和 allow，兩個動詞都要使用原形。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0001-I019",
        "ruleId": "PREPOSITION_GERUND",
        "category": "infinitive_or_gerund",
        "originalText": "caused",
        "replacementText": "causing",
        "occurrence": 1,
        "explanationZhHant": "without 是介詞，後面的動作通常使用動名詞，所以是 without causing。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S01",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Last summer, my family travelled to Japan for visit several cities.",
    "correctedSentence": "Last summer, my family travelled to Japan to visit several cities.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "PURPOSE_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "infinitive_to",
      "quantifier",
      "rule:PURPOSE_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "表示「前往日本是為了參觀城市」，通常使用 to + 動詞原形 表達目的，所以寫 to visit。",
    "issues": [
      {
        "issueId": "PARA-0002-I001",
        "ruleId": "PURPOSE_TO_INFINITIVE",
        "category": "infinitive_or_gerund",
        "originalText": "for visit",
        "replacementText": "to visit",
        "occurrence": 1,
        "explanationZhHant": "表示「前往日本是為了參觀城市」，通常使用 to + 動詞原形 表達目的，所以寫 to visit。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S02",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "We stayed in a hotel which was located near from the railway station, so travelling was very convenience.",
    "correctedSentence": "We stayed in a hotel which was located near the railway station, so travelling was very convenient.",
    "categories": [
      "preposition",
      "word_form"
    ],
    "ruleIds": [
      "ADJECTIVE_AFTER_BE",
      "NEAR_PREPOSITION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:word_form",
      "rule:ADJECTIVE_AFTER_BE",
      "rule:NEAR_PREPOSITION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "near 可以直接接地方，所以寫 near the railway station。也可以寫 close to the railway station。 convenience 是名詞；這裡放在 was very 後面，需要形容詞 convenient。",
    "issues": [
      {
        "issueId": "PARA-0002-I002",
        "ruleId": "NEAR_PREPOSITION",
        "category": "preposition",
        "originalText": "near from",
        "replacementText": "near",
        "occurrence": 1,
        "explanationZhHant": "near 可以直接接地方，所以寫 near the railway station。也可以寫 close to the railway station。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0002-I003",
        "ruleId": "ADJECTIVE_AFTER_BE",
        "category": "word_form",
        "originalText": "convenience",
        "replacementText": "convenient",
        "occurrence": 1,
        "explanationZhHant": "convenience 是名詞；這裡放在 was very 後面，需要形容詞 convenient。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S03",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "On the first day, we collected many informations from a tourist centre and asked the staff where should we go.",
    "correctedSentence": "On the first day, we collected much information from a tourist centre and asked the staff where we should go.",
    "categories": [
      "countability",
      "sentence_structure"
    ],
    "ruleIds": [
      "INDIRECT_QUESTION_ORDER",
      "INFORMATION_UNCOUNTABLE"
    ],
    "structureTags": [
      "category:countability",
      "category:sentence_structure",
      "coordination",
      "modal",
      "quantifier",
      "question_word",
      "rule:INDIRECT_QUESTION_ORDER",
      "rule:INFORMATION_UNCOUNTABLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "information 在一般英文中是不可數名詞，不能寫 informations。可以寫 much information、a lot of information 或 several pieces of information。 這是放在 asked 後面的間接問句，使用陳述句語序：where + 主語 + 動詞。",
    "issues": [
      {
        "issueId": "PARA-0002-I004",
        "ruleId": "INFORMATION_UNCOUNTABLE",
        "category": "countability",
        "originalText": "many informations",
        "replacementText": "much information",
        "occurrence": 1,
        "explanationZhHant": "information 在一般英文中是不可數名詞，不能寫 informations。可以寫 much information、a lot of information 或 several pieces of information。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0002-I005",
        "ruleId": "INDIRECT_QUESTION_ORDER",
        "category": "sentence_structure",
        "originalText": "where should we go",
        "replacementText": "where we should go",
        "occurrence": 1,
        "explanationZhHant": "這是放在 asked 後面的間接問句，使用陳述句語序：where + 主語 + 動詞。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S04",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "They suggested us to visit an ancient temple that built over five hundred years ago.",
    "correctedSentence": "They suggested that we visit an ancient temple that was built over five hundred years ago.",
    "categories": [
      "sentence_structure",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PASSIVE_RELATIVE_CLAUSE",
      "SUGGEST_CONSTRUCTION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "infinitive_to",
      "rule:PASSIVE_RELATIVE_CLAUSE",
      "rule:SUGGEST_CONSTRUCTION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "suggest 通常使用 suggest that + 主語 + 動詞，或者 suggest + verb-ing。不要直接寫 suggest someone to do。 寺廟是「被建造」，所以需要被動語態 was built。",
    "issues": [
      {
        "issueId": "PARA-0002-I006",
        "ruleId": "SUGGEST_CONSTRUCTION",
        "category": "sentence_structure",
        "originalText": "suggested us to visit",
        "replacementText": "suggested that we visit",
        "occurrence": 1,
        "explanationZhHant": "suggest 通常使用 suggest that + 主語 + 動詞，或者 suggest + verb-ing。不要直接寫 suggest someone to do。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0002-I007",
        "ruleId": "PASSIVE_RELATIVE_CLAUSE",
        "category": "verb_form_or_tense",
        "originalText": "that built",
        "replacementText": "that was built",
        "occurrence": 1,
        "explanationZhHant": "寺廟是「被建造」，所以需要被動語態 was built。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S05",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Although the weather was heavily raining, the temple was more beautiful than I expected.",
    "correctedSentence": "Although it was raining heavily, the temple was more beautiful than I expected.",
    "categories": [
      "sentence_structure",
      "word_form"
    ],
    "ruleIds": [
      "ADVERB_POSITION",
      "RAIN_IT_CONSTRUCTION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:word_form",
      "rule:ADVERB_POSITION",
      "rule:RAIN_IT_CONSTRUCTION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "描述正在下雨時，最自然的主語通常是形式主語 it：It was raining. heavily 修飾下雨的程度，通常放在 raining 後面：raining heavily。",
    "issues": [
      {
        "issueId": "PARA-0002-I008",
        "ruleId": "RAIN_IT_CONSTRUCTION",
        "category": "sentence_structure",
        "originalText": "the weather",
        "replacementText": "it",
        "occurrence": 1,
        "explanationZhHant": "描述正在下雨時，最自然的主語通常是形式主語 it：It was raining.",
        "confidence": 1
      },
      {
        "issueId": "PARA-0002-I009",
        "ruleId": "ADVERB_POSITION",
        "category": "word_form",
        "originalText": "heavily raining",
        "replacementText": "raining heavily",
        "occurrence": 1,
        "explanationZhHant": "heavily 修飾下雨的程度，通常放在 raining 後面：raining heavily。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S06",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "If we had brought an umbrella, we would not got wet.",
    "correctedSentence": "If we had brought an umbrella, we would not have got wet.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "THIRD_CONDITIONAL_RESULT"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "conditional",
      "have_auxiliary",
      "modal",
      "negation",
      "rule:THIRD_CONDITIONAL_RESULT"
    ],
    "explanationZhHant": "前面使用 If + had + 過去分詞，結果部分通常使用 would have + 過去分詞。",
    "issues": [
      {
        "issueId": "PARA-0002-I010",
        "ruleId": "THIRD_CONDITIONAL_RESULT",
        "category": "verb_form_or_tense",
        "originalText": "would not got",
        "replacementText": "would not have got",
        "occurrence": 1,
        "explanationZhHant": "前面使用 If + had + 過去分詞，結果部分通常使用 would have + 過去分詞。",
        "confidence": 1
      }
    ]
  },
  {
    "sentenceId": "PARA-0002-S07",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Overall, the journey gave us many memory and broaden our knowledge.",
    "correctedSentence": "Overall, the journey gave us many memories and broadened our knowledge.",
    "categories": [
      "parallelism",
      "singular_plural"
    ],
    "ruleIds": [
      "MANY_PLURAL_NOUN",
      "PAST_TENSE_PARALLEL"
    ],
    "structureTags": [
      "category:parallelism",
      "category:singular_plural",
      "coordination",
      "quantifier",
      "rule:MANY_PLURAL_NOUN",
      "rule:PAST_TENSE_PARALLEL"
    ],
    "explanationZhHant": "many 後面接可數名詞複數，所以寫 many memories。 整段描述去年的旅程；gave 和 broadened 是兩個並列的過去式動作。",
    "issues": [
      {
        "issueId": "PARA-0002-I011",
        "ruleId": "MANY_PLURAL_NOUN",
        "category": "singular_plural",
        "originalText": "many memory",
        "replacementText": "many memories",
        "occurrence": 1,
        "explanationZhHant": "many 後面接可數名詞複數，所以寫 many memories。",
        "confidence": 1
      },
      {
        "issueId": "PARA-0002-I012",
        "ruleId": "PAST_TENSE_PARALLEL",
        "category": "parallelism",
        "originalText": "broaden",
        "replacementText": "broadened",
        "occurrence": 1,
        "explanationZhHant": "整段描述去年的旅程；gave 和 broadened 是兩個並列的過去式動作。",
        "confidence": 1
      }
    ]
  }
].map((entry) => Object.freeze({
  ...entry,
  categories: Object.freeze(entry.categories),
  ruleIds: Object.freeze(entry.ruleIds),
  structureTags: Object.freeze(entry.structureTags),
  issues: Object.freeze(entry.issues.map((issue) => Object.freeze(issue)))
})));

export const CORPUS_GUIDANCE_SENTENCES = Object.freeze([
  {
    "sentenceId": "PARA-0001-S01",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "In recent years, many company requires their staffs to wears uniforms at work.",
    "correctedSentence": "In recent years, many companies require their staff to wear uniforms at work.",
    "categories": [
      "countability",
      "infinitive_or_gerund",
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "MANY_PLURAL_NOUN",
      "PLURAL_SUBJECT_VERB",
      "STAFF_COLLECTIVE_NOUN",
      "TO_BASE_VERB"
    ],
    "structureTags": [
      "category:countability",
      "category:infinitive_or_gerund",
      "category:singular_plural",
      "category:subject_verb_agreement",
      "infinitive_to",
      "quantifier",
      "rule:MANY_PLURAL_NOUN",
      "rule:PLURAL_SUBJECT_VERB",
      "rule:STAFF_COLLECTIVE_NOUN",
      "rule:TO_BASE_VERB"
    ],
    "explanationZhHant": "many 後面的可數名詞通常要用複數，所以寫 companies。 companies 是複數主語，現在式動詞用 require，不加 s。 staff 通常是集合名詞。可寫 staff 或 staff members，一般不寫 staffs。 to 後面使用動詞原形，所以是 to wear。"
  },
  {
    "sentenceId": "PARA-0001-S02",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "This policy have several advantage for both workers and customer.",
    "correctedSentence": "This policy has several advantages for both workers and customers.",
    "categories": [
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "GENERAL_GROUP_PLURAL",
      "SEVERAL_PLURAL_NOUN",
      "SINGULAR_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:singular_plural",
      "category:subject_verb_agreement",
      "coordination",
      "have_auxiliary",
      "quantifier",
      "rule:GENERAL_GROUP_PLURAL",
      "rule:SEVERAL_PLURAL_NOUN",
      "rule:SINGULAR_SUBJECT_VERB"
    ],
    "explanationZhHant": "policy 是第三身單數，所以使用 has。 several 後面要接可數名詞複數，所以是 advantages。 這裡泛指顧客這個群體，所以使用 customers。"
  },
  {
    "sentenceId": "PARA-0001-S03",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "First, customers can identifies employees quickly, especially when they needs help.",
    "correctedSentence": "First, customers can identify employees quickly, especially when they need help.",
    "categories": [
      "modal_or_auxiliary",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PLURAL_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:subject_verb_agreement",
      "modal",
      "question_word",
      "rule:MODAL_BASE_VERB",
      "rule:PLURAL_SUBJECT_VERB"
    ],
    "explanationZhHant": "can 後面使用動詞原形，所以是 can identify。 they 是複數主語，所以使用 need，不加 s。"
  },
  {
    "sentenceId": "PARA-0001-S04",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Second, a uniform can reduces how much money staff spend for work clothes.",
    "correctedSentence": "Second, a uniform can reduce how much money staff spend on work clothes.",
    "categories": [
      "modal_or_auxiliary",
      "preposition"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "SPEND_MONEY_ON"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:preposition",
      "modal",
      "quantifier",
      "question_word",
      "rule:MODAL_BASE_VERB",
      "rule:SPEND_MONEY_ON"
    ],
    "explanationZhHant": "can 後面使用動詞原形，所以是 can reduce。 表示「花錢在某事上」使用 spend money on something。"
  },
  {
    "sentenceId": "PARA-0001-S05",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "However, some employee feels uncomfortable because the same design do not suit everyone.",
    "correctedSentence": "However, some employees feel uncomfortable because the same design does not suit everyone.",
    "categories": [
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "GENERAL_SOME_PLURAL",
      "PLURAL_SUBJECT_VERB",
      "SINGULAR_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:singular_plural",
      "category:subject_verb_agreement",
      "negation",
      "quantifier",
      "rule:GENERAL_SOME_PLURAL",
      "rule:PLURAL_SUBJECT_VERB",
      "rule:SINGULAR_SUBJECT_VERB"
    ],
    "explanationZhHant": "這裡泛指部分員工，所以使用 some employees。 employees 是複數，因此使用 feel。 design 是第三身單數，因此使用 does not。"
  },
  {
    "sentenceId": "PARA-0001-S06",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Uniforms may also makes workers feel that they has less personal freedom.",
    "correctedSentence": "Uniforms may also make workers feel that they have less personal freedom.",
    "categories": [
      "modal_or_auxiliary",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PLURAL_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:subject_verb_agreement",
      "have_auxiliary",
      "modal",
      "rule:MODAL_BASE_VERB",
      "rule:PLURAL_SUBJECT_VERB"
    ],
    "explanationZhHant": "may 後面使用動詞原形，所以是 may make。 they 是複數主語，因此使用 have。"
  },
  {
    "sentenceId": "PARA-0001-S07",
    "paragraphId": "PARA-0001",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "In my opinion, companies should provides suitable uniforms and allows employees to choose between several styles, so the policy can remain professional without caused unnecessary discomfort at work.",
    "correctedSentence": "In my opinion, companies should provide suitable uniforms and allow employees to choose between several styles, so the policy can remain professional without causing unnecessary discomfort at work.",
    "categories": [
      "infinitive_or_gerund",
      "modal_or_auxiliary",
      "parallelism"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PREPOSITION_GERUND",
      "SHARED_MODAL_PARALLEL"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:modal_or_auxiliary",
      "category:parallelism",
      "coordination",
      "infinitive_to",
      "modal",
      "quantifier",
      "rule:MODAL_BASE_VERB",
      "rule:PREPOSITION_GERUND",
      "rule:SHARED_MODAL_PARALLEL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "should 後面使用動詞原形，所以是 should provide。 should 同時控制 provide 和 allow，兩個動詞都要使用原形。 without 是介詞，後面的動作通常使用動名詞，所以是 without causing。"
  },
  {
    "sentenceId": "PARA-0002-S01",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Last summer, my family travelled to Japan for visit several cities.",
    "correctedSentence": "Last summer, my family travelled to Japan to visit several cities.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "PURPOSE_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "infinitive_to",
      "quantifier",
      "rule:PURPOSE_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "表示「前往日本是為了參觀城市」，通常使用 to + 動詞原形 表達目的，所以寫 to visit。"
  },
  {
    "sentenceId": "PARA-0002-S02",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "We stayed in a hotel which was located near from the railway station, so travelling was very convenience.",
    "correctedSentence": "We stayed in a hotel which was located near the railway station, so travelling was very convenient.",
    "categories": [
      "preposition",
      "word_form"
    ],
    "ruleIds": [
      "ADJECTIVE_AFTER_BE",
      "NEAR_PREPOSITION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:word_form",
      "rule:ADJECTIVE_AFTER_BE",
      "rule:NEAR_PREPOSITION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "near 可以直接接地方，所以寫 near the railway station。也可以寫 close to the railway station。 convenience 是名詞；這裡放在 was very 後面，需要形容詞 convenient。"
  },
  {
    "sentenceId": "PARA-0002-S03",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "On the first day, we collected many informations from a tourist centre and asked the staff where should we go.",
    "correctedSentence": "On the first day, we collected much information from a tourist centre and asked the staff where we should go.",
    "categories": [
      "countability",
      "sentence_structure"
    ],
    "ruleIds": [
      "INDIRECT_QUESTION_ORDER",
      "INFORMATION_UNCOUNTABLE"
    ],
    "structureTags": [
      "category:countability",
      "category:sentence_structure",
      "coordination",
      "modal",
      "quantifier",
      "question_word",
      "rule:INDIRECT_QUESTION_ORDER",
      "rule:INFORMATION_UNCOUNTABLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "information 在一般英文中是不可數名詞，不能寫 informations。可以寫 much information、a lot of information 或 several pieces of information。 這是放在 asked 後面的間接問句，使用陳述句語序：where + 主語 + 動詞。"
  },
  {
    "sentenceId": "PARA-0002-S04",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "They suggested us to visit an ancient temple that built over five hundred years ago.",
    "correctedSentence": "They suggested that we visit an ancient temple that was built over five hundred years ago.",
    "categories": [
      "sentence_structure",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PASSIVE_RELATIVE_CLAUSE",
      "SUGGEST_CONSTRUCTION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "infinitive_to",
      "rule:PASSIVE_RELATIVE_CLAUSE",
      "rule:SUGGEST_CONSTRUCTION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "suggest 通常使用 suggest that + 主語 + 動詞，或者 suggest + verb-ing。不要直接寫 suggest someone to do。 寺廟是「被建造」，所以需要被動語態 was built。"
  },
  {
    "sentenceId": "PARA-0002-S05",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Although the weather was heavily raining, the temple was more beautiful than I expected.",
    "correctedSentence": "Although it was raining heavily, the temple was more beautiful than I expected.",
    "categories": [
      "sentence_structure",
      "word_form"
    ],
    "ruleIds": [
      "ADVERB_POSITION",
      "RAIN_IT_CONSTRUCTION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:word_form",
      "rule:ADVERB_POSITION",
      "rule:RAIN_IT_CONSTRUCTION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "描述正在下雨時，最自然的主語通常是形式主語 it：It was raining. heavily 修飾下雨的程度，通常放在 raining 後面：raining heavily。"
  },
  {
    "sentenceId": "PARA-0002-S06",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "If we had brought an umbrella, we would not got wet.",
    "correctedSentence": "If we had brought an umbrella, we would not have got wet.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "THIRD_CONDITIONAL_RESULT"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "conditional",
      "have_auxiliary",
      "modal",
      "negation",
      "rule:THIRD_CONDITIONAL_RESULT"
    ],
    "explanationZhHant": "前面使用 If + had + 過去分詞，結果部分通常使用 would have + 過去分詞。"
  },
  {
    "sentenceId": "PARA-0002-S07",
    "paragraphId": "PARA-0002",
    "partition": "retrieval",
    "reviewPolicy": "exact",
    "sourceSentence": "Overall, the journey gave us many memory and broaden our knowledge.",
    "correctedSentence": "Overall, the journey gave us many memories and broadened our knowledge.",
    "categories": [
      "parallelism",
      "singular_plural"
    ],
    "ruleIds": [
      "MANY_PLURAL_NOUN",
      "PAST_TENSE_PARALLEL"
    ],
    "structureTags": [
      "category:parallelism",
      "category:singular_plural",
      "coordination",
      "quantifier",
      "rule:MANY_PLURAL_NOUN",
      "rule:PAST_TENSE_PARALLEL"
    ],
    "explanationZhHant": "many 後面接可數名詞複數，所以寫 many memories。 整段描述去年的旅程；gave 和 broadened 是兩個並列的過去式動作。"
  },
  {
    "sentenceId": "PARA-0003-S01",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Last month, I joined an community reading programme at the library.",
    "correctedSentence": "Last month, I joined a community reading programme at the library.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_INDEFINITE_CONSONANT_SOUND_A"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "rule:ARTICLE_INDEFINITE_CONSONANT_SOUND_A",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「an」在此應改為「a」。community 以輔音音素/k/開始，前面用 a， 不用 an。 公式：a + 輔音音素開首的單數可數名詞。"
  },
  {
    "sentenceId": "PARA-0003-S02",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The organiser gave each volunteers a guide and asked us arriving on Saturday mornings.",
    "correctedSentence": "The organiser gave each volunteer a guide and asked us to arrive on Saturday mornings.",
    "categories": [
      "infinitive_or_gerund",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_EACH_SINGULAR_COUNT_NOUN",
      "VERB_ASK_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:singular_plural",
      "coordination",
      "rule:NOUN_EACH_SINGULAR_COUNT_NOUN",
      "rule:VERB_ASK_NP_TO_INFINITIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「volunteers」在此應改為「volunteer」。each 後面接單數可數名詞，所以寫 each volunteer，不用 volunteers。 「arriving」在此應改為「to arrive」。ask + 人後面用 to + 動詞原形，所以寫 asked us to arrive。"
  },
  {
    "sentenceId": "PARA-0003-S03",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "My main duty was to helping children to choose books that was suitable for their age.",
    "correctedSentence": "My main duty was to help children to choose books that were suitable for their age.",
    "categories": [
      "infinitive_or_gerund",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_PAST_PLURAL_SUBJECT_WERE",
      "TO_BASE_VERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "category:subject_verb_agreement",
      "infinitive_to",
      "rule:SVA_PAST_PLURAL_SUBJECT_WERE",
      "rule:TO_BASE_VERB",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「helping」在此應改為「help」。to 不定詞後面用動詞原形，所以寫 to help， 不是 to helping。 「that was」在此應改為「that were」。關係分句的主語是複數 books， 所以 be 的過去式用 were。"
  },
  {
    "sentenceId": "PARA-0003-S04",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One boy said he was interested on space, so I showed him a book about planets.",
    "correctedSentence": "One boy said he was interested in space, so I showed him a book about planets.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "PREP_INTERESTED_IN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "rule:PREP_INTERESTED_IN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「on」在此應改為「in」。interested 的固定搭配是 interested in + 名詞／動名詞，所以寫 interested in space。"
  },
  {
    "sentenceId": "PARA-0003-S05",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The pictures were clear, and he read for twenty minutes.",
    "correctedSentence": "The pictures were clear, and he read for twenty minutes.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary",
      "coordination"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0003-S06",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Before leaving, every child returned a name card to the front desk.",
    "correctedSentence": "Before leaving, every child returned a name card to the front desk.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "infinitive_to",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0003-S07",
    "paragraphId": "PARA-0003",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "I enjoyed to work there because the staff were patient and the programme made me more confidence when speaking to strangers.",
    "correctedSentence": "I enjoyed working there because the staff were patient and the programme made me more confident when speaking to strangers.",
    "categories": [
      "infinitive_or_gerund",
      "word_form"
    ],
    "ruleIds": [
      "VERB_ENJOY_GERUND",
      "WORDFORM_MAKE_OBJECT_ADJECTIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "category:word_form",
      "coordination",
      "infinitive_to",
      "question_word",
      "rule:VERB_ENJOY_GERUND",
      "rule:WORDFORM_MAKE_OBJECT_ADJECTIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「to work」在此應改為「working」。enjoy 後面接動名詞，所以寫 enjoyed working， 不寫 enjoyed to work。 「confidence」在此應改為「confident」。make + 人／物 + 形容詞。 me 後面要用形容詞 confident，不用名詞 confidence。"
  },
  {
    "sentenceId": "PARA-0004-S01",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Yesterday, my parents used a shopping app because our fridge were almost empty.",
    "correctedSentence": "Yesterday, my parents used a shopping app because our fridge was almost empty.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_PAST_SINGULAR_SUBJECT_WAS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "rule:SVA_PAST_SINGULAR_SUBJECT_WAS",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「were」在此應改為「was」。fridge 單數主語，be 的過去式用 was，所以寫 our fridge was。"
  },
  {
    "sentenceId": "PARA-0004-S02",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The app showed many information and allowed customers compare prices between shops.",
    "correctedSentence": "The app showed much information and allowed customers to compare prices between shops.",
    "categories": [
      "countability",
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "INFORMATION_UNCOUNTABLE",
      "VERB_ALLOW_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:countability",
      "category:infinitive_or_gerund",
      "coordination",
      "quantifier",
      "rule:INFORMATION_UNCOUNTABLE",
      "rule:VERB_ALLOW_NP_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「many information」在此應改為「much information」。information 是不可數名詞，不能用 many；這裡可寫 much information。 「allowed customers compare」在此應改為「allowed customers to compare」。allow + 人 + to + 動詞原形，所以寫 allowed customers to compare。"
  },
  {
    "sentenceId": "PARA-0004-S03",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "My mother asked me where could we buy cheaper fruit, but I was not sure.",
    "correctedSentence": "My mother asked me where we could buy cheaper fruit, but I was not sure.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "INDIRECT_QUESTION_ORDER"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "coordination",
      "modal",
      "negation",
      "question_word",
      "rule:INDIRECT_QUESTION_ORDER",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「where could we buy」在此應改為「where we could buy」。asked 後面是間接問句，要用陳述句語序： where + 主語 + 情態動詞。"
  },
  {
    "sentenceId": "PARA-0004-S04",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "We decided ordering from a supermarket that located near our home.",
    "correctedSentence": "We decided to order from a supermarket that was located near our home.",
    "categories": [
      "infinitive_or_gerund",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
      "VERB_DECIDE_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:sentence_structure",
      "rule:CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
      "rule:VERB_DECIDE_TO_INFINITIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「ordering」在此應改為「to order」。decide 後面通常接 to 不定詞，所以寫 decided to order。 「that located」在此應改為「that was located」。supermarket 是「位於」某處，完整被動關係分句要有 be + 過去分詞： that was located。"
  },
  {
    "sentenceId": "PARA-0004-S05",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The driver could to deliver the bags before dinner.",
    "correctedSentence": "The driver could deliver the bags before dinner.",
    "categories": [
      "modal_or_auxiliary"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "infinitive_to",
      "modal",
      "rule:MODAL_BASE_VERB"
    ],
    "explanationZhHant": "「could to deliver」在此應改為「could deliver」。could 後面直接用動詞原形，不用 to，所以寫 could deliver。"
  },
  {
    "sentenceId": "PARA-0004-S06",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The payment was made through the app.",
    "correctedSentence": "The payment was made through the app.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0004-S07",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "When the order arrived, two bottle of milk was missing.",
    "correctedSentence": "When the order arrived, two bottles of milk were missing.",
    "categories": [
      "singular_plural",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "NOUN_NUMERAL_PLURAL_COUNT_NOUN",
      "SVA_PAST_PLURAL_SUBJECT_WERE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:singular_plural",
      "category:subject_verb_agreement",
      "question_word",
      "rule:NOUN_NUMERAL_PLURAL_COUNT_NOUN",
      "rule:SVA_PAST_PLURAL_SUBJECT_WERE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「bottle」在此應改為「bottles」。two 後面接複數可數名詞，所以寫 two bottles。 「was」在此應改為「were」。完整主語是 two bottles of milk，中心詞 bottles 是複數，所以用 were。"
  },
  {
    "sentenceId": "PARA-0004-S08",
    "paragraphId": "PARA-0004",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "I contacted with support and discussed about the problem; they quickly apologised, sent the missing items, and refund the fee within an hour.",
    "correctedSentence": "I contacted support and discussed the problem; they quickly apologised, sent the missing items, and refunded the fee within an hour.",
    "categories": [
      "other_grammar",
      "parallelism"
    ],
    "ruleIds": [
      "PARALLEL_PAST_TENSE_COORDINATED",
      "VERB_CONTACT_DIRECT_OBJECT",
      "VERB_DISCUSS_DIRECT_OBJECT"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:parallelism",
      "coordination",
      "rule:PARALLEL_PAST_TENSE_COORDINATED",
      "rule:VERB_CONTACT_DIRECT_OBJECT",
      "rule:VERB_DISCUSS_DIRECT_OBJECT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「contacted with」在此應改為「contacted」。contact 作動詞時直接接對象，所以寫 contacted support， 不加 with。 「discussed about」在此應改為「discussed」。discuss 作動詞時直接接討論內容，所以寫 discussed the problem，不加 about。 「refund」在此應改為「refunded」。apologised、sent 和 refunded 是三個並列的過去式動作，所以 refund 要改為 refunded。"
  },
  {
    "sentenceId": "PARA-0005-S01",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Our hiking club is planning a short trip.",
    "correctedSentence": "Our hiking club is planning a short trip.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0005-S02",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The list of places are on the noticeboard, but neither route include a climb.",
    "correctedSentence": "The list of places is on the noticeboard, but neither route includes a climb.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_PRESENT_NEITHER_SINGULAR_S_FORM",
      "SVA_PRESENT_SINGULAR_HEAD_OF_PHRASE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "coordination",
      "rule:SVA_PRESENT_NEITHER_SINGULAR_S_FORM",
      "rule:SVA_PRESENT_SINGULAR_HEAD_OF_PHRASE"
    ],
    "explanationZhHant": "「are」在此應改為「is」。真正的主語中心詞是單數 list；of places 只是修飾語，所以寫 The list… is。 「include」在此應改為「includes」。neither route 按單數主語處理，所以一般現在式動詞用 includes。"
  },
  {
    "sentenceId": "PARA-0005-S03",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The leader said we must to bring water, and she asked each members arrive at the station by eight.",
    "correctedSentence": "The leader said we must bring water, and she asked each member to arrive at the station by eight.",
    "categories": [
      "infinitive_or_gerund",
      "modal_or_auxiliary",
      "singular_plural"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "NOUN_EACH_SINGULAR_COUNT_NOUN",
      "VERB_ASK_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:modal_or_auxiliary",
      "category:singular_plural",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:MODAL_BASE_VERB",
      "rule:NOUN_EACH_SINGULAR_COUNT_NOUN",
      "rule:VERB_ASK_NP_TO_INFINITIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「must to bring」在此應改為「must bring」。must 後面直接用動詞原形，不加 to，所以寫 must bring。 「members」在此應改為「member」。each 後面接單數可數名詞，所以寫 each member。 「arrive」在此應改為「to arrive」。ask + 人後面用 to + 動詞原形，所以寫 asked each member to arrive。"
  },
  {
    "sentenceId": "PARA-0005-S04",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She asked, “Where should we meet?” because the station has two exits.",
    "correctedSentence": "She asked, “Where should we meet?” because the station has two exits.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "have_auxiliary",
      "modal",
      "question_word",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0005-S05",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "There are less buses in the morning, so everyone must arrive on time.",
    "correctedSentence": "There are fewer buses in the morning, so everyone must arrive on time.",
    "categories": [
      "countability"
    ],
    "ruleIds": [
      "COUNT_FEWER_PLURAL_COUNT_NOUN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:countability",
      "modal",
      "rule:COUNT_FEWER_PLURAL_COUNT_NOUN",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「less」在此應改為「fewer」。buses 是可數名詞複數，表示數量較少用 fewer， 不用 less。"
  },
  {
    "sentenceId": "PARA-0005-S06",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A jacket is useful for keeping warm, but if it will rain, the group will visit a museum that located nearby.",
    "correctedSentence": "A jacket is useful for keeping warm, but if it rains, the group will visit a museum that is located nearby.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
      "CONDITIONAL_FIRST_IF_PRESENT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "conditional",
      "coordination",
      "modal",
      "rule:CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
      "rule:CONDITIONAL_FIRST_IF_PRESENT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「it will rain」在此應改為「it rains」。第一條件句的 if 分句通常用一般現在式，所以寫 if it rains； will 放在結果分句。 「that located」在此應改為「that is located」。museum 是「位於」附近，所以關係分句要有 is located。"
  },
  {
    "sentenceId": "PARA-0005-S07",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The equipment are stored there.",
    "correctedSentence": "The equipment is stored there.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_PRESENT_UNCOUNTABLE_SUBJECT_SINGULAR_BE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "rule:SVA_PRESENT_UNCOUNTABLE_SUBJECT_SINGULAR_BE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「are」在此應改為「is」。equipment 是不可數名詞，按單數處理，所以寫 The equipment is。"
  },
  {
    "sentenceId": "PARA-0005-S08",
    "paragraphId": "PARA-0005",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The staff have agreed to show us around.",
    "correctedSentence": "The staff have agreed to show us around.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "have_auxiliary",
      "infinitive_to",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0006-S01",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Despite of receiving only a small grant, our neighbourhood repair café has become one of the most useful project in the district.",
    "correctedSentence": "Despite receiving only a small grant, our neighbourhood repair café has become one of the most useful projects in the district.",
    "categories": [
      "preposition",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_ONE_OF_SUPERLATIVE_PLURAL_NOUN",
      "PREP_DESPITE_NO_OF"
    ],
    "structureTags": [
      "category:preposition",
      "category:singular_plural",
      "have_auxiliary",
      "rule:NOUN_ONE_OF_SUPERLATIVE_PLURAL_NOUN",
      "rule:PREP_DESPITE_NO_OF",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Despite of receiving」在此應改為「Despite receiving」。despite 本身已經是介詞，後面直接接名詞或動名詞，不加 of。 公式： despite + 名詞／動名詞。正確對照：in spite of receiving，因為 in spite 後面需要 of。 「one of the most useful project」在此應改為「one of the most useful projects」。one of 表示「一群之中的一個」，所以 of 後面的可數名詞用複數。公式：one of the + 最高級 + 複數名詞。正確對照： This is the most useful project."
  },
  {
    "sentenceId": "PARA-0006-S02",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "It has operated since six months and used to offering help only with lamps, but it now accepts bicycles, radios and small kitchen machines.",
    "correctedSentence": "It has operated for six months and used to offer help only with lamps, but it now accepts bicycles, radios and small kitchen machines.",
    "categories": [
      "infinitive_or_gerund",
      "preposition"
    ],
    "ruleIds": [
      "PREP_DURATION_FOR_PERIOD",
      "VERB_USED_TO_BASE_VERB"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:preposition",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "rule:PREP_DURATION_FOR_PERIOD",
      "rule:VERB_USED_TO_BASE_VERB",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「since six months」在此應改為「for six months」。six months 是一段時間，要用 for。since 後面通常接起點。公式：for + 時段； since + 起點。正確：for six months／ since March。 「used to offering」在此應改為「used to offer」。used to 表示過去的習慣或狀態，後面用動詞原形。公式：used to + 動詞原形。邊界：be used to + 名詞／動名詞，例如 She is used to working late。"
  },
  {
    "sentenceId": "PARA-0006-S03",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Many residents look forward to learn simple skills instead of throwing damaged objects away.",
    "correctedSentence": "Many residents look forward to learning simple skills instead of throwing damaged objects away.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_LOOK_FORWARD_TO_GERUND"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "infinitive_to",
      "quantifier",
      "rule:VERB_LOOK_FORWARD_TO_GERUND",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「look forward to learn」在此應改為「look forward to learning」。look forward to 裡面的 to 是介詞，所以後面的動作用動名詞。公式： look forward to + 名詞／動名詞。正確對照： hope to learn，因為 hope 後面的 to 是不定詞標記。"
  },
  {
    "sentenceId": "PARA-0006-S04",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Last Saturday, the volunteers managed fixing twenty items and prevented several batteries ending up in the rubbish.",
    "correctedSentence": "Last Saturday, the volunteers managed to fix twenty items and prevented several batteries from ending up in the rubbish.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_MANAGE_TO_INFINITIVE",
      "VERB_PREVENT_NP_FROM_GERUND"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "coordination",
      "quantifier",
      "rule:VERB_MANAGE_TO_INFINITIVE",
      "rule:VERB_PREVENT_NP_FROM_GERUND",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「managed fixing」在此應改為「managed to fix」。這裡 manage 表示「成功做到」，後面接 to 不定詞。公式： manage to + 動詞原形。邊界： manage a repair team 中， manage 可直接接名詞，意思是「管理」。 「prevented several batteries ending」在此應改為「prevented several batteries from ending」。prevent 後面先寫受影響的人或物，再用 from + 動名詞表示被阻止的動作。公式： prevent + 人／物 + from + 動名詞。邊界： prevent an accident 可直接接名詞。"
  },
  {
    "sentenceId": "PARA-0006-S05",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At the entrance, a coordinator carefully explained new visitors the safety rules and provided every team by the necessary gloves.",
    "correctedSentence": "At the entrance, a coordinator carefully explained the safety rules to new visitors and provided every team with the necessary gloves.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "VERB_EXPLAIN_THING_TO_PERSON",
      "VERB_PROVIDE_NP_WITH_NP"
    ],
    "structureTags": [
      "category:other_grammar",
      "coordination",
      "rule:VERB_EXPLAIN_THING_TO_PERSON",
      "rule:VERB_PROVIDE_NP_WITH_NP",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「explained new visitors the safety rules」在此應改為「explained the safety rules to new visitors」。explain 先接所解釋的內容，再用 to 接聽者。公式： explain + 事情 + to + 人。正確替代： The coordinator told the visitors the safety rules，因為 tell 可使用雙賓語。 「provided every team by the necessary gloves」在此應改為「provided every team with the necessary gloves」。表示「為某人提供某物」可用 provide + 人 + with + 物。這裡不能用 by。另一個正確寫法是 provide the necessary gloves for every team。"
  },
  {
    "sentenceId": "PARA-0006-S06",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She also reminded to write their names on a form before entering the workshop.",
    "correctedSentence": "She also reminded them to write their names on a form before entering the workshop.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_REMIND_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "infinitive_to",
      "rule:VERB_REMIND_NP_TO_INFINITIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「reminded to write」在此應改為「reminded them to write」。remind 通常要指出提醒的對象。這裡 them 指上一句的 new visitors。 公式： remind + 人 + to + 動詞原形。邊界： remember to write 表示主語自己記得做某事。"
  },
  {
    "sentenceId": "PARA-0006-S07",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Parents were happy because the organisers let children to test safe tools, although they made everyone to wear eye protection.",
    "correctedSentence": "Parents were happy because the organisers let children test safe tools, although they made everyone wear eye protection.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_LET_NP_BASE_VERB",
      "VERB_MAKE_NP_BASE_VERB_ACTIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "infinitive_to",
      "rule:VERB_LET_NP_BASE_VERB",
      "rule:VERB_MAKE_NP_BASE_VERB_ACTIVE"
    ],
    "explanationZhHant": "「let children to test」在此應改為「let children test」。let 後面接人，再直接用動詞原形，不加 to。 公式：let + 人 + 動詞原形。正確對照：allow children to test， 因為 allow 需要 to 不定詞。 「made everyone to wear」在此應改為「made everyone wear」。主動句中的使役動詞 make 使用 make + 人 + 動詞原形，不加 to。邊界：被動句要恢復 to，例如 Everyone was made to wear eye protection。"
  },
  {
    "sentenceId": "PARA-0006-S08",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One instructor advised avoiding to touch loose wires and suggested considering to replace any cracked plug.",
    "correctedSentence": "One instructor advised avoiding touching loose wires and suggested considering replacing any cracked plug.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_AVOID_GERUND",
      "VERB_CONSIDER_GERUND"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "coordination",
      "infinitive_to",
      "rule:VERB_AVOID_GERUND",
      "rule:VERB_CONSIDER_GERUND",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「to touch」在此應改為「touching」。avoid 後面接名詞或動名詞，不接 to 不定詞。公式： avoid + 動名詞。正確對照：avoid loose wires，因為 loose wires 是名詞詞組。 「considering to replace」在此應改為「considering replacing」。consider 表示「考慮做某事」時，後面接動名詞。公式： consider + 動名詞。邊界： consider the proposal 中， consider 可直接接名詞。"
  },
  {
    "sentenceId": "PARA-0006-S09",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Another volunteer insisted checking each cable twice and said that he was responsible recording every repair.",
    "correctedSentence": "Another volunteer insisted on checking each cable twice and said that he was responsible for recording every repair.",
    "categories": [
      "infinitive_or_gerund",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_RESPONSIBLE_FOR_GERUND",
      "VERB_INSIST_ON_GERUND"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "category:word_form",
      "coordination",
      "rule:ADJ_RESPONSIBLE_FOR_GERUND",
      "rule:VERB_INSIST_ON_GERUND",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「insisted checking」在此應改為「insisted on checking」。insist 後面接動作時，可用 on + 動名詞。公式： insist on + 名詞／動名詞。另一個正確結構是 insist that + 分句，例如 He insisted that we check every cable。 「responsible recording」在此應改為「responsible for recording」。responsible 表示「負責某件事」時，用 responsible for + 名詞／動名詞。邊界： responsible to the manager 可表示「向經理負責」。"
  },
  {
    "sentenceId": "PARA-0006-S10",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Most visitors prefer repairing old things than buying new ones, and several said they would rather to donate unused tools than throwing them away.",
    "correctedSentence": "Most visitors prefer repairing old things to buying new ones, and several said they would rather donate unused tools than throw them away.",
    "categories": [
      "comparison",
      "other_grammar"
    ],
    "ruleIds": [
      "COMP_PREFER_A_TO_B",
      "VERB_WOULD_RATHER_BASE_THAN_BASE"
    ],
    "structureTags": [
      "category:comparison",
      "category:other_grammar",
      "coordination",
      "infinitive_to",
      "modal",
      "quantifier",
      "rule:COMP_PREFER_A_TO_B",
      "rule:VERB_WOULD_RATHER_BASE_THAN_BASE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「prefer repairing old things than buying new ones」在此應改為「prefer repairing old things to buying new ones」。比較兩個偏好選項時，prefer 使用 A to B，不用 than。兩邊應保持相同形式。公式： prefer + 名詞／動名詞 + to + 名詞／動名詞。 「would rather to donate unused tools than throwing them away」在此應改為「would rather donate unused tools than throw them away」。would rather 後面用動詞原形； than 後面的平行動作也用動詞原形。這是一組相依修改。公式： would rather + 動詞原形 + than + 動詞原形。邊界： would prefer to donate 中則保留 to。"
  },
  {
    "sentenceId": "PARA-0006-S11",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The printed instructions were enough clear for beginners to follow, and the final demonstration was such practical that nobody became confused.",
    "correctedSentence": "The printed instructions were clear enough for beginners to follow, and the final demonstration was so practical that nobody became confused.",
    "categories": [
      "comparison",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_ENOUGH_AFTER_ADJECTIVE",
      "DEGREE_SO_ADJECTIVE_THAT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:word_form",
      "coordination",
      "infinitive_to",
      "rule:ADJ_ENOUGH_AFTER_ADJECTIVE",
      "rule:DEGREE_SO_ADJECTIVE_THAT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「enough clear」在此應改為「clear enough」。enough 修飾形容詞或副詞時，放在它們後面。公式：形容詞／副詞 + enough。 邊界： enough 修飾名詞時放在名詞前面，例如 enough information。 「such practical that」在此應改為「so practical that」。practical 是沒有名詞跟隨的形容詞，所以使用 so practical that。公式：so + 形容詞／副詞 + that。對照：such a practical demonstration that，其中 such 後面有名詞詞組。"
  },
  {
    "sentenceId": "PARA-0006-S12",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At closing time, two students were responsible for both sorting spare parts and to clean the tables.",
    "correctedSentence": "At closing time, two students were responsible for both sorting spare parts and cleaning the tables.",
    "categories": [
      "parallelism"
    ],
    "ruleIds": [
      "PARALLEL_BOTH_AND_MATCHING_GERUNDS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:parallelism",
      "coordination",
      "infinitive_to",
      "rule:PARALLEL_BOTH_AND_MATCHING_GERUNDS",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「both sorting spare parts and to clean the tables」在此應改為「both sorting spare parts and cleaning the tables」。both A and B 連接的兩部分要使用相同文法形式。第一部分是動名詞 sorting， 第二部分也應用 cleaning。公式： both + 動名詞 + and + 動名詞。"
  },
  {
    "sentenceId": "PARA-0006-S13",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Each visitor later chose between taking the item home or leaving it for collection.",
    "correctedSentence": "Each visitor later chose between taking the item home and leaving it for collection.",
    "categories": [
      "conjunction"
    ],
    "ruleIds": [
      "CONJ_BETWEEN_AND_NOT_OR"
    ],
    "structureTags": [
      "category:conjunction",
      "coordination",
      "rule:CONJ_BETWEEN_AND_NOT_OR",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「between taking the item home or leaving it for collection」在此應改為「between taking the item home and leaving it for collection」。between 連接兩個選項時，標準結構是 between A and B， 不用 or。 邊界： either A or B 才使用 or。"
  },
  {
    "sentenceId": "PARA-0006-S14",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Between my neighbour and I, we carried the volunteers tools to a cupboard beside a resident who's bicycle had been repaired.",
    "correctedSentence": "Between my neighbour and me, we carried the volunteers' tools to a cupboard beside a resident whose bicycle had been repaired.",
    "categories": [
      "possessive",
      "pronoun"
    ],
    "ruleIds": [
      "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "PRONOUN_AFTER_PREPOSITION_OBJECT_CASE",
      "PRONOUN_RELATIVE_WHOSE_POSSESSIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:possessive",
      "category:pronoun",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "question_word",
      "rule:POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "rule:PRONOUN_AFTER_PREPOSITION_OBJECT_CASE",
      "rule:PRONOUN_RELATIVE_WHOSE_POSSESSIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Between my neighbour and I」在此應改為「Between my neighbour and me」。between 是介詞，後面的代名詞使用賓格 me，不用主格 I。公式：介詞 + 賓格代名詞。對照： My neighbour and I carried the tools，其中整個詞組是主語。 「volunteers tools」在此應改為「volunteers' tools」。tools 屬於多名 volunteers。規則複數名詞已經以 s 結尾，所以在 s 後面加撇號。公式：複數名詞-s + '。對照： one volunteer's tools； children's tools。 「who's bicycle」在此應改為「whose bicycle」。whose 表示「誰的」，在這裡修飾 bicycle。 who's 是 who is 或 who has 的縮寫。正確對照：Who's ready? = Who is ready?"
  },
  {
    "sentenceId": "PARA-0006-S15",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The amount of volunteers was encouraging, while the others participants promised to return.",
    "correctedSentence": "The number of volunteers was encouraging, while the other participants promised to return.",
    "categories": [
      "article_or_determiner",
      "countability"
    ],
    "ruleIds": [
      "COUNT_NUMBER_OF_PLURAL_COUNT_NOUN",
      "DETERMINER_OTHER_BEFORE_PLURAL_NOUN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:article_or_determiner",
      "category:countability",
      "infinitive_to",
      "rule:COUNT_NUMBER_OF_PLURAL_COUNT_NOUN",
      "rule:DETERMINER_OTHER_BEFORE_PLURAL_NOUN",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「amount of volunteers」在此應改為「number of volunteers」。volunteers 是可數名詞複數，所以表示數量時使用 number of。公式： number of + 複數可數名詞；amount of + 不可數名詞。正確對照：the amount of equipment。 「others participants」在此應改為「other participants」。other 可直接放在複數名詞前作限定詞；others 是代名詞，後面不再接名詞。公式： other + 複數名詞。對照： The others promised to return。"
  },
  {
    "sentenceId": "PARA-0006-S16",
    "paragraphId": "PARA-0006",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "By the time the doors closed, the final guest already left, the coordinator still had three forms to check before the next community event in early autumn.",
    "correctedSentence": "By the time the doors closed, the final guest had already left; the coordinator still had three forms to check before the next community event in early autumn.",
    "categories": [
      "punctuation",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PUNCT_COMMA_SPLICE_SEMICOLON",
      "TENSE_PAST_PERFECT_BY_THE_TIME_EARLIER_EVENT"
    ],
    "structureTags": [
      "category:punctuation",
      "category:verb_form_or_tense",
      "have_auxiliary",
      "infinitive_to",
      "rule:PUNCT_COMMA_SPLICE_SEMICOLON",
      "rule:TENSE_PAST_PERFECT_BY_THE_TIME_EARLIER_EVENT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「already left」在此應改為「had already left」。關門和最後一位訪客離開都是過去事件，而訪客離開發生得更早，所以用過去完成式 had left。公式：較早的過去事件用 had + 過去分詞。 「,」在此應改為「;」。the final guest had already left 和 the coordinator still had three forms to check 都是完整主句，不能只用逗號連接。可用分號、句號，或加入 and／but 等連接詞。"
  },
  {
    "sentenceId": "PARA-0007-S01",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Following last winter’s floods, the council set out a panel to look into on why the drainage programme had fallen beneath schedule.",
    "correctedSentence": "Following last winter’s floods, the council set up a panel to look into why the drainage programme had fallen behind schedule.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_FALL_BEHIND_SCHEDULE",
      "PHRASAL_LOOK_INTO_NO_EXTRA_PREPOSITION",
      "PHRASAL_SET_UP_ESTABLISH_PARTICLE_UP"
    ],
    "structureTags": [
      "category:preposition",
      "have_auxiliary",
      "infinitive_to",
      "question_word",
      "rule:COLLOC_FALL_BEHIND_SCHEDULE",
      "rule:PHRASAL_LOOK_INTO_NO_EXTRA_PREPOSITION",
      "rule:PHRASAL_SET_UP_ESTABLISH_PARTICLE_UP",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「set out」在此應改為「set up」。／設立一個小組」要用 set up。setout 可表示出發、陳述或排列，不表示在本句中成立調查小組。公式：set up + 組織／系統／小組。 「look into on」在此應改為「look into」。look into 本身已包含介詞粒子 into，後面直接接事情或疑問分句，不再加 on。 公式：look into + 名詞／why 分句。 「fallen beneath schedule」在此應改為「fallen behind schedule」。表示進度遲於計劃時，固定搭配是 fall behind schedule。 below 可用於 below target／ below budget，但不宜取代 behind schedule。"
  },
  {
    "sentenceId": "PARA-0007-S02",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The chair asked engineers to follow on every complaint and come up to a plan that would account about the failures.",
    "correctedSentence": "The chair asked engineers to follow up on every complaint and come up with a plan that would account for the failures.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "PHRASAL_COME_UP_WITH_PLAN",
      "PHRASAL_FOLLOW_UP_ON_COMPLAINT",
      "PREP_ACCOUNT_FOR_EXPLANATION"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:PHRASAL_COME_UP_WITH_PLAN",
      "rule:PHRASAL_FOLLOW_UP_ON_COMPLAINT",
      "rule:PREP_ACCOUNT_FOR_EXPLANATION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「follow on every complaint」在此應改為「follow up on every complaint」。表示繼續調查或處理投訴，用 follow up on + complaint。 follow on 表示某事接着另一件事發生，意思不同。邊界：follow up every complaint 也可以是正確的及物用法，不應強制加入 on。 「come up to a plan」在此應改為「come up with a plan」。表示想出計劃，用 come up with。come up to 可表示走近某人或達到某個水平，例如 come up to the required standard。 「account about」在此應改為「account for」。account for 表示解釋某件事、構成某個比例或造成某個結果。這裡要寫 account for the failures。 account to someone 則可表示向某人負責。"
  },
  {
    "sentenceId": "PARA-0007-S03",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Not only several contractors failed to comply to the safety code, and they also tried to cover up about delays that should have been reported earlier.",
    "correctedSentence": "Not only did several contractors fail to comply with the safety code, but they also tried to cover up delays that should have been reported earlier.",
    "categories": [
      "conjunction",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_NOT_ONLY_INITIAL_INVERSION",
      "CONJ_NOT_ONLY_BUT_ALSO_CLAUSES",
      "PHRASAL_COVER_UP_DIRECT_OBJECT",
      "PREP_COMPLY_WITH_REQUIREMENT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "category:preposition",
      "category:sentence_structure",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "negation",
      "quantifier",
      "rule:CLAUSE_NOT_ONLY_INITIAL_INVERSION",
      "rule:CONJ_NOT_ONLY_BUT_ALSO_CLAUSES",
      "rule:PHRASAL_COVER_UP_DIRECT_OBJECT",
      "rule:PREP_COMPLY_WITH_REQUIREMENT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Not only several contractors failed」在此應改為「Not only did several contractors fail」。Not only 放在句首並修飾整個分句時，要使用助動詞倒裝：Not only + did + 主語 + 動詞原形。邊界： Not only the contractors but also the engineers agreed 中， not only 只連接名詞詞組，因此不用倒裝。 「comply to」在此應改為「comply with」。comply 的固定搭配是 comply with + 規則／法律／要求，所以寫 comply with the safety code。 「and they also」在此應改為「but they also」。not only 所引出的兩部分通常由 but also 配合。當兩邊都是完整分句，可寫 Not only did X…, but X also…。沒有 not only 時，and also 可以正確使用。 「cover up about delays」在此應改為「cover up delays」。cover up 表示掩飾時直接接賓語，不加 about。亦可把名詞放在中間： cover the delays up； 代名詞必須放中間： cover them up。"
  },
  {
    "sentenceId": "PARA-0007-S04",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "No sooner the investigators had drawn up on a timetable when one supplier pulled off of the project.",
    "correctedSentence": "No sooner had the investigators drawn up a timetable than one supplier pulled out of the project.",
    "categories": [
      "conjunction",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_NO_SOONER_PAST_PERFECT_INVERSION",
      "CONJ_NO_SOONER_THAN",
      "PHRASAL_DRAW_UP_DIRECT_OBJECT",
      "PHRASAL_PULL_OUT_OF_PROJECT"
    ],
    "structureTags": [
      "category:conjunction",
      "category:preposition",
      "category:sentence_structure",
      "have_auxiliary",
      "negation",
      "question_word",
      "rule:CLAUSE_NO_SOONER_PAST_PERFECT_INVERSION",
      "rule:CONJ_NO_SOONER_THAN",
      "rule:PHRASAL_DRAW_UP_DIRECT_OBJECT",
      "rule:PHRASAL_PULL_OUT_OF_PROJECT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「No sooner the investigators had」在此應改為「No sooner had the investigators」。No sooner 放在句首時，要使用過去完成式倒裝：No sooner + had + 主語 + 過去分詞。 「drawn up on a timetable」在此應改為「drawn up a timetable」。draw up 表示草擬或制定時直接接賓語，所以寫 draw up a timetable，不加 on。 「when」在此應改為「than」。標準配對是 no sooner… than…。對照： hardly／ scarcely… when…。 系統不可把兩組連接詞混合。 「pulled off of the project」在此應改為「pulled out of the project」。表示退出計劃，用 pull out of + project。 pull off 表示成功完成困難的事情，例如 pull off a difficult rescue，意思不同。"
  },
  {
    "sentenceId": "PARA-0007-S05",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Only after the financial records had been examined the panel ruled out against fraud.",
    "correctedSentence": "Only after the financial records had been examined did the panel rule out fraud.",
    "categories": [
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_ONLY_AFTER_INITIAL_INVERSION",
      "PHRASAL_RULE_OUT_DIRECT_OBJECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:sentence_structure",
      "have_auxiliary",
      "rule:CLAUSE_ONLY_AFTER_INITIAL_INVERSION",
      "rule:PHRASAL_RULE_OUT_DIRECT_OBJECT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「the panel ruled」在此應改為「did the panel rule」。Only after + 分句放在句首時，主句要倒裝： Only after… did + 主語 + 動詞原形。若 only after 放在句尾，則不用倒裝：The panel ruled out fraud only after examining the records。 「against fraud」在此應改為「fraud」。rule out 表示排除某個可能性時直接接賓語，不加 against。邊界：rule against a company 是法律裁決對該公司不利，屬另一個結構。"
  },
  {
    "sentenceId": "PARA-0007-S06",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "What it concerned residents most was that officials had put off replace pumps on that several low-lying districts depended.",
    "correctedSentence": "What concerned residents most was that officials had put off replacing pumps on which several low-lying districts depended.",
    "categories": [
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_FUSED_RELATIVE_NO_RESUMPTIVE_PRONOUN",
      "CLAUSE_RELATIVE_FRONTED_PREPOSITION_WHICH",
      "PHRASAL_PUT_OFF_GERUND"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:sentence_structure",
      "have_auxiliary",
      "quantifier",
      "question_word",
      "rule:CLAUSE_FUSED_RELATIVE_NO_RESUMPTIVE_PRONOUN",
      "rule:CLAUSE_RELATIVE_FRONTED_PREPOSITION_WHICH",
      "rule:PHRASAL_PUT_OFF_GERUND",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「What it concerned」在此應改為「What concerned」。What concerned residents most 是融合關係分句；what 已同時表示「那件事」並在分句中擔任主語，因此不能再加入 it。 「put off replace」在此應改為「put off replacing」。put off 表示延遲某個動作時，後面接動名詞。公式：put off + 名詞／動名詞。正確：put off replacing the pumps／put off the replacement。 「on that」在此應改為「on which」。介詞放在關係代名詞前面時，物件使用 which，不使用 that。所以寫 pumps on which the districts depended。另一個正確寫法是 pumps which the districts depended on。"
  },
  {
    "sentenceId": "PARA-0007-S07",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The committee recommended that each contractor provides monthly evidence and that emergency drills carried out twice a year.",
    "correctedSentence": "The committee recommended that each contractor provide monthly evidence and that emergency drills be carried out twice a year.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_RECOMMEND_THAT_BASE_SUBJUNCTIVE",
      "CLAUSE_RECOMMEND_THAT_PASSIVE_BE_SUBJUNCTIVE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "coordination",
      "rule:CLAUSE_RECOMMEND_THAT_BASE_SUBJUNCTIVE",
      "rule:CLAUSE_RECOMMEND_THAT_PASSIVE_BE_SUBJUNCTIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「contractor provides」在此應改為「contractor provide」。recommend that 後面表達要求或建議時，可使用原形虛擬語氣： that each contractor provide。英式英文亦接受 that each contractor should provide。 「drills carried out」在此應改為「drills be carried out」。被動虛擬語氣要保留 be： recommend that + 主語 + be + 過去分詞。亦可寫 should be carried out。"
  },
  {
    "sentenceId": "PARA-0007-S08",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "It is essential that the revised system is tested before the rainy season began, lest another breakdown leaves families without assistance.",
    "correctedSentence": "It is essential that the revised system be tested before the rainy season begins, lest another breakdown leave families without assistance.",
    "categories": [
      "sentence_structure",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "CLAUSE_ESSENTIAL_THAT_SUBJUNCTIVE_BE",
      "CLAUSE_LEST_BASE_SUBJUNCTIVE",
      "TENSE_BEFORE_FUTURE_EVENT_PRESENT_SIMPLE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "rule:CLAUSE_ESSENTIAL_THAT_SUBJUNCTIVE_BE",
      "rule:CLAUSE_LEST_BASE_SUBJUNCTIVE",
      "rule:TENSE_BEFORE_FUTURE_EVENT_PRESENT_SIMPLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「system is tested」在此應改為「system be tested」。essential that 後面表達必要安排時，可用原形虛擬語氣 be tested。 英式英文也可寫 should be tested。 「rainy season began」在此應改為「rainy season begins」。本句談論尚未來臨的雨季。before 引出的未來時間分句通常用一般現在式，不用過去式。若整段談論過去事件， began 才可能正確。 「lest another breakdown leaves」在此應改為「lest another breakdown leave」。正式英文中的 lest 可接原形虛擬語氣：lest + 主語 + 動詞原形。英式英文亦常用 lest… should leave。"
  },
  {
    "sentenceId": "PARA-0007-S09",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If had the council acted sooner, it might have prevented damage that is believed having cost local businesses millions.",
    "correctedSentence": "Had the council acted sooner, it might have prevented damage that is believed to have cost local businesses millions.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_REPORTING_PASSIVE_PERFECT_INFINITIVE",
      "CONDITIONAL_INVERTED_HAD_NO_IF"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "conditional",
      "have_auxiliary",
      "modal",
      "rule:CLAUSE_REPORTING_PASSIVE_PERFECT_INFINITIVE",
      "rule:CONDITIONAL_INVERTED_HAD_NO_IF",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「If had the council acted」在此應改為「Had the council acted」。第三條件句可省略 if， 並把 had 放到主語前：Had the council acted…。 不能同時保留 if 和倒裝。另一個正確寫法是 If the council had acted…。 「is believed having cost」在此應改為「is believed to have cost」。damage 發生在現在的相信或估計之前，因此使用被動報告結構 is believed to have + 過去分詞。邊界：The project is believed to cost £5 million 可表示目前估計的成本。"
  },
  {
    "sentenceId": "PARA-0007-S10",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Much although the mayor wanted to defend the original scheme, she admitted that the authority had failed to live up with its promises.",
    "correctedSentence": "Much as the mayor wanted to defend the original scheme, she admitted that the authority had failed to live up to its promises.",
    "categories": [
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_MUCH_AS_CONCESSIVE",
      "PHRASAL_LIVE_UP_TO_PROMISE"
    ],
    "structureTags": [
      "category:preposition",
      "category:sentence_structure",
      "have_auxiliary",
      "infinitive_to",
      "quantifier",
      "rule:CLAUSE_MUCH_AS_CONCESSIVE",
      "rule:PHRASAL_LIVE_UP_TO_PROMISE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Much although」在此應改為「Much as」。Much as + 主語 + 動詞可表示「雖然」。不能把 much 和 although 直接組合。另一個正確寫法是 Although the mayor wanted…。 「live up with」在此應改為「live up to」。live up to 表示達到期望、標準或履行承諾，所以寫 live up to its promises。"
  },
  {
    "sentenceId": "PARA-0007-S11",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Residents would rather the council publishes all future reports than withholding inconvenient findings.",
    "correctedSentence": "Residents would rather the council published all future reports than withheld inconvenient findings.",
    "categories": [
      "modal_or_auxiliary",
      "parallelism"
    ],
    "ruleIds": [
      "MOOD_WOULD_RATHER_DIFFERENT_SUBJECT_PAST",
      "PARALLEL_WOULD_RATHER_SHARED_SUBJECT_PAST"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:parallelism",
      "modal",
      "rule:MOOD_WOULD_RATHER_DIFFERENT_SUBJECT_PAST",
      "rule:PARALLEL_WOULD_RATHER_SHARED_SUBJECT_PAST",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「would rather the council publishes」在此應改為「would rather the council published」。would rather 後面若有另一個主語，對現在或將來的期望通常用過去式： would rather + 人／機構 + 過去式。邊界：同一主語時用動詞原形，例如 Residents would rather publish the reports。 「than withholding」在此應改為「than withheld」。council 同時控制 published 和 withheld，兩個假設動作要使用相同的過去式形式。公式：would rather + 主語 + 過去式 A + than + 過去式 B。"
  },
  {
    "sentenceId": "PARA-0007-S12",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "By next June, the new monitoring team will take over of the temporary inspectors.",
    "correctedSentence": "By next June, the new monitoring team will have taken over from the temporary inspectors.",
    "categories": [
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PHRASAL_TAKE_OVER_FROM_PREDECESSOR",
      "TENSE_FUTURE_PERFECT_BY_DEADLINE"
    ],
    "structureTags": [
      "category:preposition",
      "category:verb_form_or_tense",
      "modal",
      "rule:PHRASAL_TAKE_OVER_FROM_PREDECESSOR",
      "rule:TENSE_FUTURE_PERFECT_BY_DEADLINE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「take」在此應改為「have taken」。By next June 表示在未來期限之前完成接管，所以使用未來完成式：will have + 過去分詞。若意思是「正正在六月接管」，簡單將來式才可能合適。 「of」在此應改為「from」。表示接替某人或某組人，用 take over from。 邊界：take over a company 可直接接賓語，表示取得公司的控制權。"
  },
  {
    "sentenceId": "PARA-0007-S13",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "However the repairs complicated may become, officials must deal about them transparently.",
    "correctedSentence": "However complicated the repairs may become, officials must deal with them transparently.",
    "categories": [
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_HOWEVER_ADJECTIVE_CONCESSIVE_ORDER",
      "PREP_DEAL_WITH_PROBLEM"
    ],
    "structureTags": [
      "category:preposition",
      "category:sentence_structure",
      "modal",
      "rule:CLAUSE_HOWEVER_ADJECTIVE_CONCESSIVE_ORDER",
      "rule:PREP_DEAL_WITH_PROBLEM",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「However the repairs complicated may become」在此應改為「However complicated the repairs may become」。however 表示「無論多麼」時，形容詞要立即放在 however 後面。公式： however + 形容詞 + 主語 + may／might + 動詞。亦可寫 No matter how complicate d…。 「deal about」在此應改為「deal with」。deal with 表示處理問題。deal in 則表示買賣某類貨品，例如 deal in antiques；deal about 不是本句所需搭配。"
  },
  {
    "sentenceId": "PARA-0007-S14",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Having reviewed the evidence, the conclusion was that what the city needs is not another short-term campaign but a permanent maintenance strategy.",
    "correctedSentence": "Having reviewed the evidence, the panel concluded that what the city needs is not another short-term campaign but a permanent maintenance strategy.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "PARTICIPLE_PERFECT_MATCHED_SUBJECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "coordination",
      "negation",
      "question_word",
      "rule:PARTICIPLE_PERFECT_MATCHED_SUBJECT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Having reviewed the evidence, the conclusion was」在此應改為「Having reviewed the evidence, the panel concluded」。Having reviewed the evidence 的隱含執行者必須是主句主語。能夠「審閱證據」的是 panel，不是 conclusion。邊界： Having been reviewed, the evidence was archived 是正確被動結構，因為 evidence 是被審閱的事物。"
  },
  {
    "sentenceId": "PARA-0007-S15",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The more consistently agencies work together, similar failures are the less likely to recur.",
    "correctedSentence": "The more consistently agencies work together, the less likely similar failures are to recur.",
    "categories": [
      "comparison"
    ],
    "ruleIds": [
      "COMP_CORRELATIVE_THE_MORE_THE_LESS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "infinitive_to",
      "rule:COMP_CORRELATIVE_THE_MORE_THE_LESS"
    ],
    "explanationZhHant": "「similar failures are the less likely」在此應改為「the less likely similar failures are」。表示兩件事按比例變化時，兩個分句都要以 the + 比較級開始。公式：The more…, the less + 形容詞 + 主語 + 動詞。"
  },
  {
    "sentenceId": "PARA-0007-S16",
    "paragraphId": "PARA-0007",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Until all recommendations will be implemented, no department can take it as granted that public confidence will simply return without sustained effort or scrutiny.",
    "correctedSentence": "Until all recommendations have been implemented, no department can take it for granted that public confidence will simply return without sustained effort or scrutiny.",
    "categories": [
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "COLLOC_TAKE_IT_FOR_GRANTED",
      "TENSE_UNTIL_PRESENT_PERFECT_NOT_WILL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:verb_form_or_tense",
      "coordination",
      "modal",
      "negation",
      "rule:COLLOC_TAKE_IT_FOR_GRANTED",
      "rule:TENSE_UNTIL_PRESENT_PERFECT_NOT_WILL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「will be implemented」在此應改為「have been implemented」。until 引出的未來時間分句一般不用 will。現在完成式強調所有建議先完成： until… have been implemented。另一個正確寫法是 until all recommendations are implemented。間接問句則可以用 will，例如 We do not know when they will be implemented。 「take it as granted」在此應改為「take it for granted」。固定搭配是 take it for granted that…，表示未經思考便假定某事必然成立。邊界：take it as given that… 也是正確搭配，但使用 given，不使用 granted。"
  },
  {
    "sentenceId": "PARA-0008-S01",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Good health policy should not begin at the hospital door.",
    "correctedSentence": "Good health policy should not begin at the hospital door.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "modal",
      "negation"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0008-S02",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "I completely agree with preventing illness is more important to treating it after it has already developed, and public funding should therefore give the strongest priority for prevention.",
    "correctedSentence": "I completely agree that preventing illness is more important than treating it after it has already developed, and public funding should therefore give prevention the strongest priority.",
    "categories": [
      "comparison",
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_GIVE_NP_PRIORITY",
      "COMP_MORE_ADJECTIVE_THAN_COMPLEMENT",
      "VERB_AGREE_THAT_FINITE_CLAUSE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:other_grammar",
      "category:preposition",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "rule:COLLOC_GIVE_NP_PRIORITY",
      "rule:COMP_MORE_ADJECTIVE_THAN_COMPLEMENT",
      "rule:VERB_AGREE_THAT_FINITE_CLAUSE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「agree with preventing illness is」在此應改為「agree that preventing illness is」。agree 接完整內容分句時，用 agree that + 主語 + 動詞。agree with 通常接人、意見或名詞詞組，例如 agree with the proposal；不能在 with 後直接接 preventing illness is... 這類完整分句。 「more important to treating」在此應改為「more important than treating」。比較兩件事的重要程度時，用 more important than。 important to someone 也可以正確，意思是「對某人重要」，但不是本句的比較結構。 「give the strongest priority for prevention」在此應改為「give prevention the strongest priority」。本句使用 give + 對象 + priority：give prevention the strongest priority。另一個正確寫法是 give the strongest priority to prevention；這個結構不用 for。"
  },
  {
    "sentenceId": "PARA-0008-S03",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The first reason is that prevention saves both money as human suffering.",
    "correctedSentence": "The first reason is that prevention saves both money and human suffering.",
    "categories": [
      "conjunction"
    ],
    "ruleIds": [
      "CONJ_BOTH_AND_REQUIRED"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "rule:CONJ_BOTH_AND_REQUIRED",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「both money as human suffering」在此應改為「both money and human suffering」。both 的標準配對連接詞是 and。公式： both A and B。如果不用 both，則 A as well as B 可以成立，但不可混合成 both A as B。"
  },
  {
    "sentenceId": "PARA-0008-S04",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "When governments invest on health education, vaccination programmes, early screening, safe parks, and better nutrition in schools, many serious conditions can stop before they become expensive medicine crises.",
    "correctedSentence": "When governments invest in health education, vaccination programmes, early screening, safe parks, and better nutrition in schools, many serious conditions can be stopped before they become expensive medical crises.",
    "categories": [
      "modal_or_auxiliary",
      "preposition",
      "word_form"
    ],
    "ruleIds": [
      "MODAL_PASSIVE_BE_PARTICIPLE",
      "PREP_INVEST_IN_FIELD",
      "WORDFORM_NOUN_PREMODIFIER_MEDICAL_ADJECTIVE"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:preposition",
      "category:word_form",
      "coordination",
      "modal",
      "quantifier",
      "question_word",
      "rule:MODAL_PASSIVE_BE_PARTICIPLE",
      "rule:PREP_INVEST_IN_FIELD",
      "rule:WORDFORM_NOUN_PREMODIFIER_MEDICAL_ADJECTIVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「invest on health education」在此應改為「invest in health education」。表示把資源投放於某個範疇，用 invest in + 項目／領域。也可寫 invest money in education。本句不用 on。 「conditions can stop」在此應改為「conditions can be stopped」。conditions 是被阻止發展成危機的事物，所以要用被動語態。情態動詞後的被動結構是 can + be + 過去分詞。The bleeding can stop 中的 stop 則是不及物用法，意思不同。 「medicine crises」在此應改為「medical crises」。crises 前面需要形容詞 medical， 表示「醫療方面的」。 medicine 是名詞，雖然可在 medicine cabinet 等固定組合中修飾另一名詞，但不適用於 medical crisis。"
  },
  {
    "sentenceId": "PARA-0008-S05",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A health system, that only responds after people are already sick, is always fighting fires: hospitals become crowded, doctors are overstretched, and taxpayers must pay long-term treatment that might have avoided.",
    "correctedSentence": "A health system that only responds after people are already sick is always fighting fires: hospitals become crowded, doctors are overstretched, and taxpayers must pay for long-term treatment that might have been avoided.",
    "categories": [
      "modal_or_auxiliary",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_RELATIVE_RESTRICTIVE_THAT_NO_COMMAS",
      "MODAL_PERFECT_PASSIVE_HAVE_BEEN_PARTICIPLE",
      "PREP_PAY_FOR_SERVICE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:modal_or_auxiliary",
      "category:preposition",
      "category:sentence_structure",
      "coordination",
      "have_auxiliary",
      "modal",
      "rule:CLAUSE_RELATIVE_RESTRICTIVE_THAT_NO_COMMAS",
      "rule:MODAL_PERFECT_PASSIVE_HAVE_BEEN_PARTICIPLE",
      "rule:PREP_PAY_FOR_SERVICE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「A health system, that only responds after people are already sick, is」在此應改為「A health system that only responds after people are already sick is」。that only responds... 用來界定是哪一類 health system，是限制性關係分句，因此前後不加逗號。非限制性補充資料通常用 which 並以逗號分隔，例如 The system, which was introduced last year, is expensiv e. 「pay long-term treatment」在此應改為「pay for long-term treatment」。表示支付某項服務或物品的費用，用 pay for + 事物。 pay the bill 可直接接賓語，但 treatment 在這個意思下要寫 pay for treatment。 「might have avoided」在此應改為「might have been avoided」。treatment 是「本來可能被避免」的事物，所以用完成式被動語態：might have been + 過去分詞。 The hospital might have avoided the expense 才是主動結構。"
  },
  {
    "sentenceId": "PARA-0008-S06",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For example, if children are taught healthy eating habits and are given at places to exercise, they are less likely of developing obesity-related illnesses later at life.",
    "correctedSentence": "For example, if children are taught healthy eating habits and are given places to exercise, they are less likely to develop obesity-related illnesses later in life.",
    "categories": [
      "other_grammar",
      "preposition",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_LIKELY_TO_INFINITIVE",
      "COLLOC_LATER_IN_LIFE",
      "VERB_GIVE_PASSIVE_DIRECT_OBJECT_NO_PREPOSITION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:preposition",
      "category:word_form",
      "conditional",
      "coordination",
      "infinitive_to",
      "rule:ADJ_LIKELY_TO_INFINITIVE",
      "rule:COLLOC_LATER_IN_LIFE",
      "rule:VERB_GIVE_PASSIVE_DIRECT_OBJECT_NO_PREPOSITION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「are given at places」在此應改為「are given places」。被動句中的 be given 可以直接接所給予的事物：be given places， 不加 at。 The lecture was given at the school 中的 at 表示活動地點，屬另一個結構。 「less likely of developing」在此應改為「less likely to develop」。likely 後面表示可能發生的動作時，用 to + 動詞原形。公式：be likely to do。如果使用名詞 likelihood，則可寫 the likelihood of developing an illness。 「later at life」在此應改為「later in life」。是 later in life，表示在人生較後階段。也可寫 at a later stage in life，但不能直接寫 later at life。"
  },
  {
    "sentenceId": "PARA-0008-S07",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "This means that fewer patients needing complex surgery, lifelong medication, or repeated hospital visits.",
    "correctedSentence": "This means fewer patients needing complex surgery, lifelong medication, or repeated hospital visits.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_MEAN_THAT_REQUIRES_FINITE_PREDICATE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "coordination",
      "rule:CLAUSE_MEAN_THAT_REQUIRES_FINITE_PREDICATE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「This means that fewer patients needing」在此應改為「This means fewer patients needing」。mean that 後面必須接完整分句，即需要有限動詞，例如 This means that fewer patients will need surgery. 原句選用名詞詞組 fewer patients needing... 作賓語，因此不要加入 that。"
  },
  {
    "sentenceId": "PARA-0008-S08",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Prevention, therefore, does not merely reduce costs; it protects people of pain that no medicine can fully erase it.",
    "correctedSentence": "Prevention, therefore, does not merely reduce costs; it protects people from pain that no medicine can fully erase.",
    "categories": [
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_RELATIVE_OBJECT_NO_RESUMPTIVE_PRONOUN",
      "PREP_PROTECT_NP_FROM_NP"
    ],
    "structureTags": [
      "category:preposition",
      "category:sentence_structure",
      "modal",
      "negation",
      "rule:CLAUSE_RELATIVE_OBJECT_NO_RESUMPTIVE_PRONOUN",
      "rule:PREP_PROTECT_NP_FROM_NP"
    ],
    "explanationZhHant": "「of」在此應改為「from」。表示保護某人免受某事影響，用 protect + 人 + from + 事物。某些語境亦可用 protect against disease，但 protect someone of something 不成立。 「erase it」在此應改為「erase」。that 已把 pain 連接到關係分句，並代表 erase 的賓語，所以句末不可再加入 it。正確結構是 pain + that + 主語 + 動詞。"
  },
  {
    "sentenceId": "PARA-0008-S09",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Another reason is due to preventive spending creates a fairer society.",
    "correctedSentence": "Another reason is that preventive spending creates a fairer society.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_REASON_COPULAR_THAT_CLAUSE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "infinitive_to",
      "rule:CLAUSE_REASON_COPULAR_THAT_CLAUSE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「reason is due to」在此應改為「reason is that」。reason is that + 完整分句用來說明原因內容。due to 後面通常接名詞詞組，例如 The improvement is due to preventive spending；不能直接接 preventive spending creates... 這個有限分句。"
  },
  {
    "sentenceId": "PARA-0008-S10",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Treatment often reaches people only after damage has done, whereas that prevention can protect whole communities before illness takes its root.",
    "correctedSentence": "Treatment often reaches people only after damage has been done, whereas prevention can protect whole communities before illness takes root.",
    "categories": [
      "conjunction",
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "COLLOC_TAKE_ROOT_NO_POSSESSIVE",
      "CONJ_WHEREAS_DIRECT_FINITE_CLAUSE",
      "TENSE_PRESENT_PERFECT_PASSIVE"
    ],
    "structureTags": [
      "category:conjunction",
      "category:preposition",
      "category:verb_form_or_tense",
      "have_auxiliary",
      "modal",
      "rule:COLLOC_TAKE_ROOT_NO_POSSESSIVE",
      "rule:CONJ_WHEREAS_DIRECT_FINITE_CLAUSE",
      "rule:TENSE_PRESENT_PERFECT_PASSIVE"
    ],
    "explanationZhHant": "「damage has done」在此應改為「damage has been done」。damage 是被造成的，所以現在完成式要使用被動結構： has been + 過去分詞。主動句需要有施事者，例如 The delay has done serious damage. 「whereas that prevention」在此應改為「whereas prevention」。whereas 本身是連接詞，後面直接接主語 + 動詞，不再加入 that。公式：分句 A, whereas 分句 B。 「illness takes its root」在此應改為「illness takes root」。take root 是固定搭配，表示開始穩固存在或發展，不加入 its。A tree spreads its roots 中的 its roots 是普通名詞詞組，意思不同。"
  },
  {
    "sentenceId": "PARA-0008-S11",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "This is especially important for poorer families, which may lack of access for nutritious food, safe housing, mental-health support, or regular medical checks.",
    "correctedSentence": "This is especially important for poorer families, who may lack access to nutritious food, safe housing, mental-health support, or regular medical checks.",
    "categories": [
      "other_grammar",
      "preposition",
      "pronoun"
    ],
    "ruleIds": [
      "PREP_ACCESS_TO_RESOURCE",
      "PRONOUN_RELATIVE_HUMAN_NONRESTRICTIVE_WHO",
      "VERB_LACK_DIRECT_OBJECT_NO_OF"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:preposition",
      "category:pronoun",
      "coordination",
      "modal",
      "rule:PREP_ACCESS_TO_RESOURCE",
      "rule:PRONOUN_RELATIVE_HUMAN_NONRESTRICTIVE_WHO",
      "rule:VERB_LACK_DIRECT_OBJECT_NO_OF",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「which」在此應改為「who」。先行詞 families 指人，所以非限制性關係分句使用 who。which 通常指事物；逗號後也不使用限制性關係代名詞 that。 「of access」在此應改為「access」。lack 作動詞時直接接賓語： lack access， 不加 of。 如果使用名詞 lack，則寫 a lack of access。 「for」在此應改為「to」。表示能夠取得某項資源，用 access to + 事物。 access for disabled visitors 中的 for 可表示受惠對象，但不是本句所需意思。"
  },
  {
    "sentenceId": "PARA-0008-S12",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If public money is used to improve air quality, providing free health screenings, support school meals, and promote active lifestyles, the benefits are shared wide rather than reserve for those whom can afford for private care.",
    "correctedSentence": "If public money is used to improve air quality, provide free health screenings, support school meals, and promote active lifestyles, the benefits are shared widely rather than reserved for those who can afford private care.",
    "categories": [
      "other_grammar",
      "parallelism",
      "pronoun",
      "word_form"
    ],
    "ruleIds": [
      "PARALLEL_RATHER_THAN_PASSIVE_PARTICIPLES",
      "PARALLEL_SHARED_TO_INFINITIVE_BASE_VERBS",
      "PRONOUN_RELATIVE_SUBJECT_WHO_NOT_WHOM",
      "VERB_AFFORD_DIRECT_OBJECT_NO_FOR",
      "WORDFORM_MANNER_ADVERB_AFTER_VERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:parallelism",
      "category:pronoun",
      "category:word_form",
      "conditional",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:PARALLEL_RATHER_THAN_PASSIVE_PARTICIPLES",
      "rule:PARALLEL_SHARED_TO_INFINITIVE_BASE_VERBS",
      "rule:PRONOUN_RELATIVE_SUBJECT_WHO_NOT_WHOM",
      "rule:VERB_AFFORD_DIRECT_OBJECT_NO_FOR",
      "rule:WORDFORM_MANNER_ADVERB_AFTER_VERB",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「providing」在此應改為「provide」。to 同時控制後面的並列動詞，所以各項都使用動詞原形： to improve, provide, support, and promote。若改用 used for，整組才可使用動名詞。 「wide」在此應改為「widely」。widely 是副詞，在這裡修飾 shared，表示利益廣泛地被分享。 wide 可在 open wide 或 far and wide 等結構中作副詞，但本句需要 widely。 「reserve」在此應改為「reserved」。shared 和 reserved 都由前面的 are 控制，兩者應同為過去分詞。也可寫 are shared widely rather than being reserved。 「whom」在此應改為「who」。關係代名詞在分句中是 can afford 的主語，所以用 who。 whom 用作賓語，例如 the families whom the programme supports。 「for private」在此應改為「private」。afford 作動詞時直接接所能負擔的事物，不加 for。對照：pay for private care 使用 for，因為動詞是 pay。"
  },
  {
    "sentenceId": "PARA-0008-S13",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In this sense, prevention is not just a medical strategy; it is a social investment that helps citizens remain healthily, productivity, and independently.",
    "correctedSentence": "In this sense, prevention is not just a medical strategy; it is a social investment that helps citizens remain healthy, productive, and independent.",
    "categories": [
      "conjunction"
    ],
    "ruleIds": [
      "LINKING_REMAIN_ADJECTIVE_COMPLEMENTS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "coordination",
      "negation",
      "rule:LINKING_REMAIN_ADJECTIVE_COMPLEMENTS"
    ],
    "explanationZhHant": "「remain healthily, productivity, and independently」在此應改為「remain healthy, productive, and independent」。remain 是連繫動詞，後面使用形容詞描述 citizens 的狀態。三項亦要保持平行： healthy, productive, and independent。副詞通常修飾動作，而不是在這裡描述主語。"
  },
  {
    "sentenceId": "PARA-0008-S14",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In conclusion, governments should clearly prioritise on the prevention of disease because of it reduces avoidable suffering, lowering pressure to healthcare systems, and protects society more equally.",
    "correctedSentence": "In conclusion, governments should clearly prioritise the prevention of disease because it reduces avoidable suffering, lowers pressure on healthcare systems, and protects society more equally.",
    "categories": [
      "conjunction",
      "other_grammar",
      "parallelism",
      "preposition"
    ],
    "ruleIds": [
      "CONJ_BECAUSE_FINITE_CLAUSE_NOT_BECAUSE_OF",
      "PARALLEL_FINITE_VERBS_SHARED_SUBJECT",
      "PREP_PRESSURE_ON_SYSTEM",
      "VERB_PRIORITISE_DIRECT_OBJECT_NO_ON"
    ],
    "structureTags": [
      "category:conjunction",
      "category:other_grammar",
      "category:parallelism",
      "category:preposition",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:CONJ_BECAUSE_FINITE_CLAUSE_NOT_BECAUSE_OF",
      "rule:PARALLEL_FINITE_VERBS_SHARED_SUBJECT",
      "rule:PREP_PRESSURE_ON_SYSTEM",
      "rule:VERB_PRIORITISE_DIRECT_OBJECT_NO_ON",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「on the」在此應改為「the」。prioritise 是及物動詞，直接接賓語： prioritise prevention。使用名詞 priority 時，才可寫 give priority to prevention。 「of it」在此應改為「it」。because 後面接完整分句： because it reduces...。because of 後面接名詞詞組，例如 because of the reduction in suffering。 「lowering」在此應改為「lowers」。主語 it 同時控制三個並列的一般現在式動詞： reduces, lowers, and protects。 lowering 可在另一種結構中成立，例如 It reduces suffering, thereby lowering pressure on hospitals. 「to」在此應改為「on」。表示某個系統承受負擔，用 pressure on + 系統／人。 pressure to do something 則表示做某事的壓力，例如 pressure to reduce costs。"
  },
  {
    "sentenceId": "PARA-0008-S15",
    "paragraphId": "PARA-0008",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Although treating illness matters, but preventing it is the more wiser use for public money.",
    "correctedSentence": "Treating illness matters, but preventing it is the wiser use of public money.",
    "categories": [
      "comparison",
      "conjunction",
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_USE_OF_PUBLIC_MONEY",
      "COMP_DOUBLE_COMPARATIVE_NO_MORE",
      "CONJ_ALTHOUGH_NO_COORDINATING_BUT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:conjunction",
      "category:preposition",
      "coordination",
      "rule:COLLOC_USE_OF_PUBLIC_MONEY",
      "rule:COMP_DOUBLE_COMPARATIVE_NO_MORE",
      "rule:CONJ_ALTHOUGH_NO_COORDINATING_BUT",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Although treating」在此應改為「Treating」。although 和 but 不應同時連接同一對分句。可寫 Although treating illness matters, preventing it is wiser，或像目標句一樣寫 Treating illness matters, but...。 「more wiser」在此應改為「wiser」。wiser 已經是比較級，不再加入 more。可以寫 much wiser，因為 much 是程度副詞，不是另一個比較級標記。 「for」在此應改為「of」。表示「公共資金的運用」，用 the use of public money。 money for treatment 可以成立，但那表示撥作治療用途的資金，結構和意思不同。"
  },
  {
    "sentenceId": "PARA-0009-S01",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Nowadays, many employers blame on the phenomenon of overwork during holiday as their employers offer jobs for them apart from working hours.",
    "correctedSentence": "Nowadays, many employees complain about the phenomenon of overwork during holidays as their employers give them work outside working hours.",
    "categories": [
      "other_grammar",
      "preposition",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "COLLOC_GIVE_PERSON_WORK",
      "NOUN_RECURRING_HOLIDAY_PLURAL",
      "PREP_OUTSIDE_WORKING_HOURS",
      "VERB_COMPLAIN_ABOUT_PROBLEM",
      "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "category:singular_plural",
      "category:word_choice",
      "quantifier",
      "rule:COLLOC_GIVE_PERSON_WORK",
      "rule:NOUN_RECURRING_HOLIDAY_PLURAL",
      "rule:PREP_OUTSIDE_WORKING_HOURS",
      "rule:VERB_COMPLAIN_ABOUT_PROBLEM",
      "rule:WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「many employers」在此應改為「many employees」。employer 是僱主， employee 是僱員。下文說這些人的僱主在非工作時間給他們工作，因此原意很可能是 employees。不過這項修改涉及人物角色，系統應先根據上下文判斷，不宜只靠單句自動更改。 「blame on the phenomenon」在此應改為「complain about the phenomenon」。如果原意是「抱怨某個問題」，用 complain about + 問題。 blame 的結構不同： blame someone for something 或 blame something on someone。由於更換動詞可能改變意思，建議老師確認。 「during holiday」在此應改為「during holidays」。這裡泛指多次假期，而不是某一個特定假期，所以用複數 holidays。若指一個特定假期，可寫 during the holiday。 「offer jobs for them」在此應改為「give them work」。offer someone a job 通常表示提供一個職位；本句則指僱主在下班後給員工工作，所以可寫 give them work。 另一個正確寫法是 assign work to them。 這項修改涉及 job 和 work 的意思差別，宜保留老師覆核。 「apart from working hours」在此應改為「outside working hours」。表示「在工作時間以外」，用 outside working hours。 apart from 通常表示「除…… 之外」或「除了」，例如 Apart from Sunday, the office is open every day."
  },
  {
    "sentenceId": "PARA-0009-S02",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "I highly believe that this problem has placed detrimental effects on workers, in terms of workloads, stress and social relationships.",
    "correctedSentence": "I strongly believe that this problem has had detrimental effects on workers, in terms of workloads, stress and social relationships.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_HAVE_EFFECTS_ON",
      "COLLOC_STRONGLY_BELIEVE"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "have_auxiliary",
      "rule:COLLOC_HAVE_EFFECTS_ON",
      "rule:COLLOC_STRONGLY_BELIEVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「highly believe」在此應改為「strongly believe」。表示相信程度很高，標準搭配是 strongly believe。 highly 常修飾 successful、 unlikely、 recommended 等詞； highly believe 並非一般標準搭配。 「has placed detrimental effects on」在此應改為「has had detrimental effects on」。表示某事對某人產生影響，可用 have an effect on 或 have effects on。 所以這裡寫 has had detrimental effects on workers。另一個正確結構是 has placed considerablepressure on workers，但不能混合兩個搭配。"
  },
  {
    "sentenceId": "PARA-0009-S03",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The most significant problem is that workers may suffer from higher workloads.",
    "correctedSentence": "The most significant problem is that workers may suffer from higher workloads.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary",
      "modal"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0009-S04",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "As employers are able to connect with them at all times, they can offer job duties and request on urgent projects.",
    "correctedSentence": "As employers are able to connect with them at all times, they can assign duties and request work on urgent projects.",
    "categories": [
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_ASSIGN_DUTIES",
      "VERB_REQUEST_WORK_DIRECT_OBJECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:preposition",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:COLLOC_ASSIGN_DUTIES",
      "rule:VERB_REQUEST_WORK_DIRECT_OBJECT"
    ],
    "explanationZhHant": "「offer job duties」在此應改為「assign duties」。工作任務通常由僱主 assign，所以用 assign duties。offer a job 是提供職位； offer help 是提供協助，與分派職責不同。 「request on urgent projects」在此應改為「request work on urgent projects」。request 作動詞時需要直接賓語。本句可寫 request work on urgent projects。更清楚的替代寫法是 ask employees to work on urgent projects。"
  },
  {
    "sentenceId": "PARA-0009-S05",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "As such, employers may sacrifice their holiday and take extra amount of work.",
    "correctedSentence": "As such, employees may sacrifice their holidays and take on an extra amount of work.",
    "categories": [
      "article_or_determiner",
      "preposition",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "ARTICLE_AMOUNT_OF_WORK_AN",
      "NOUN_RECURRING_HOLIDAY_PLURAL",
      "PHRASAL_TAKE_ON_WORK",
      "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "category:singular_plural",
      "category:word_choice",
      "coordination",
      "modal",
      "rule:ARTICLE_AMOUNT_OF_WORK_AN",
      "rule:NOUN_RECURRING_HOLIDAY_PLURAL",
      "rule:PHRASAL_TAKE_ON_WORK",
      "rule:WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER"
    ],
    "explanationZhHant": "「employers may sacrifice」在此應改為「employees may sacrifice」。整段討論員工因假日工作而失去休息時間，所以主語很可能是 employees。由於僱主理論上也可以犧牲假期，系統不應在欠缺上下文時自動更換。 「their holiday」在此應改為「their holidays」。這裡泛指員工的假期，通常用複數 holidays。若文章只談某一個指定假期， their holiday 也可能成立。 「take」在此應改為「take on」。表示接受額外工作或責任，用片語動詞 take on。公式： take on + work／ responsibility／a task。take work home 則是另一個正確結構。 「extra amount」在此應改為「an extra amount」。amount 是單數可數名詞，前面需要限定詞，所以寫 an extra amount of work。更自然但較非最小的寫法是 take on extra work。"
  },
  {
    "sentenceId": "PARA-0009-S06",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Besides, working on holidays imposes high pressure on employees.",
    "correctedSentence": "Besides, working on holidays imposes high pressure on employees.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0009-S07",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Due to the fact that workers have to stay alert for phone calls from employers, they may devote less time on relaxation and be prepared for the request.",
    "correctedSentence": "Due to the fact that workers have to stay alert for phone calls from employers, they may devote less time to relaxation and be prepared for requests.",
    "categories": [
      "preposition",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_GENERIC_REQUEST_PLURAL",
      "PREP_DEVOTE_TIME_TO"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:singular_plural",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "rule:NOUN_GENERIC_REQUEST_PLURAL",
      "rule:PREP_DEVOTE_TIME_TO",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「devote less time on relaxation」在此應改為「devote less time to relaxation」。devote 的固定結構是 devote + 時間／精力 + to + 名詞／動名詞。所以寫 devote less time to relaxation。 「the request」在此應改為「requests」。前文沒有指出某一項特定要求，因此泛指僱主可能提出的各種要求時，用複數 requests。若上下文已有一項明確要求，the request 便可能正確。"
  },
  {
    "sentenceId": "PARA-0009-S08",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "As a result, they have less chance to relive their stress during holiday, and which may boost their anxiety under stress.",
    "correctedSentence": "As a result, they have less chance to relieve their stress during holidays, which may boost their anxiety under stress.",
    "categories": [
      "sentence_structure",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "CLAUSE_NONRESTRICTIVE_WHICH_NO_COORDINATING_AND",
      "NOUN_RECURRING_HOLIDAY_PLURAL",
      "WORDCHOICE_RELIEVE_STRESS_NOT_RELIVE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:singular_plural",
      "category:word_choice",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "rule:CLAUSE_NONRESTRICTIVE_WHICH_NO_COORDINATING_AND",
      "rule:NOUN_RECURRING_HOLIDAY_PLURAL",
      "rule:WORDCHOICE_RELIEVE_STRESS_NOT_RELIVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「relive their stress」在此應改為「relieve their stress」。relieve stress 表示減輕壓力。 relive 表示重新經歷某件事，例如 relive a childhood memory。 兩詞拼法接近，但意思不同。 「during holiday」在此應改為「during holidays」。本句泛指假日期間的休息機會，因此用 during holidays。指一個特定假期時可寫 during the holiday。 「, and which」在此應改為「, which」。which may boost... 是補充前面整個結果的非限制性關係分句。前面已有逗號連接，因此不再加入 and。 另一個正確寫法是分成兩個主句：..., and this may boost their anxiety."
  },
  {
    "sentenceId": "PARA-0009-S09",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Moreover, employees who need to work 247 may spend less time with their friends or partners.",
    "correctedSentence": "Moreover, employees who need to work 24/7 may spend less time with their friends or partners.",
    "categories": [
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "ORTHOGRAPHY_TWENTY_FOUR_SEVEN_SLASH"
    ],
    "structureTags": [
      "category:spelling_or_spacing",
      "coordination",
      "infinitive_to",
      "modal",
      "question_word",
      "rule:ORTHOGRAPHY_TWENTY_FOUR_SEVEN_SLASH",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「247」在此應改為「24/7」。表示每日二十四小時、每週七日，通常寫成 24/7。 由於修改涉及數字，系統必須確認這不是原作者真正想寫的數值 247。"
  },
  {
    "sentenceId": "PARA-0009-S10",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In addition to family gathering, employers who have to stay behind for work may devote less time in social activities.",
    "correctedSentence": "In addition to family gatherings, employees who have to stay behind at work may devote less time to social activities.",
    "categories": [
      "preposition",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "NOUN_RECURRING_FAMILY_GATHERING_PLURAL",
      "PREP_DEVOTE_TIME_TO",
      "PREP_STAY_BEHIND_AT_WORK",
      "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER"
    ],
    "structureTags": [
      "category:preposition",
      "category:singular_plural",
      "category:word_choice",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "question_word",
      "rule:NOUN_RECURRING_FAMILY_GATHERING_PLURAL",
      "rule:PREP_DEVOTE_TIME_TO",
      "rule:PREP_STAY_BEHIND_AT_WORK",
      "rule:WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「family gathering」在此應改為「family gatherings」。gathering 是單數可數名詞，不能在沒有冠詞或其他限定詞的情況下單獨使用。這裡泛指家庭聚會，所以用複數 family gatherings。 「employers who have」在此應改為「employees who have」。留在工作場所並減少社交活動的人，按文章脈絡應是僱員 employees。這仍屬人物角色判斷，應保留老師覆核。 「stay behind for work」在此應改為「stay behind at work」。表示下班時間後仍留在工作場所，可寫 stay behind at work。stay behind for a meeting 則表示為了參加會議而留下，當中 for 引出目的。 「devote less time in social activities」在此應改為「devote less time to social activities」。devote time 後面使用 to，所以寫 devote less time to social activities。spendless time in social activities 在部分語境可用 in，但動詞換成 devote 後便要使用 to。"
  },
  {
    "sentenceId": "PARA-0009-S11",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "This generally destroys their social bonding with peers and draws on negative effects to their social relationships.",
    "correctedSentence": "This generally destroys their social bonding with peers and has negative effects on their social relationships.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_HAVE_EFFECTS_ON"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "infinitive_to",
      "rule:COLLOC_HAVE_EFFECTS_ON",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「draws on negative effects to」在此應改為「has negative effects on」。have negative effects on + 人／事物是標準搭配。 draw on 表示利用資源或經驗，例如 draw on previous research，不能用來表示造成負面影響。"
  },
  {
    "sentenceId": "PARA-0009-S12",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "However, some may judge that being connected with employers enhances their working efficiency.",
    "correctedSentence": "However, some may judge that being connected with employers enhances workers' working efficiency.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:pronoun",
      "modal",
      "quantifier",
      "rule:PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「their working efficiency」在此應改為「workers' working efficiency」。their 可能指 employers、 workers 或前面的 some，指涉不清。根據論點，原意似乎是工人的工作效率，因此明確寫成 workers'working efficiency。若原意是僱主的效率，則應保留另一個版本。"
  },
  {
    "sentenceId": "PARA-0009-S13",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Workers who have difficulties can ask for advice from their employers and to receive immediate responses.",
    "correctedSentence": "Workers who have difficulties can ask for advice from their employers and receive immediate responses.",
    "categories": [
      "parallelism"
    ],
    "ruleIds": [
      "SHARED_MODAL_PARALLEL"
    ],
    "structureTags": [
      "category:parallelism",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "question_word",
      "rule:SHARED_MODAL_PARALLEL"
    ],
    "explanationZhHant": "「and to receive」在此應改為「and receive」。情態動詞 can 同時控制 ask 和 receive， 兩個動詞都用原形。公式：can + 動詞原形 A + and + 動詞原形 B。"
  },
  {
    "sentenceId": "PARA-0009-S14",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "But, as far as I am concerned, this is more beneficial to employers than workers, as they have no obligation to work on every occasion.",
    "correctedSentence": "But, as far as I am concerned, this is more beneficial to employers than workers, as workers have no obligation to work on every occasion.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "PRONOUN_AMBIGUOUS_THEY_EXPLICIT_WORKERS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:pronoun",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "negation",
      "rule:PRONOUN_AMBIGUOUS_THEY_EXPLICIT_WORKERS",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「as they have no obligation」在此應改為「as workers have no obligation」。they 前面同時出現 employers 和 workers， 讀者不能安全確定所指對象。根據文章立場，應是 workers 沒有義務隨時工作，因此用明確名詞。"
  },
  {
    "sentenceId": "PARA-0009-S15",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Conversely, employers should respect their freedom and support workers during workdays.",
    "correctedSentence": "Conversely, employers should respect workers' freedom and support workers during workdays.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS"
    ],
    "structureTags": [
      "category:pronoun",
      "coordination",
      "modal",
      "rule:PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「respect their freedom」在此應改為「respect workers' freedom」。最近的複數名詞是 employers，所以 their freedom 容易被理解為僱主的自由。若原意是員工的自由，應明確寫成 workers'freedom。"
  },
  {
    "sentenceId": "PARA-0009-S16",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Also, workers should set boundaries for their working hours and avoid excessive workloads to keep themselves healthy.",
    "correctedSentence": "Also, workers should set boundaries for their working hours and avoid excessive workloads to keep themselves healthy.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "coordination",
      "infinitive_to",
      "modal",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0009-S17",
    "paragraphId": "PARA-0009",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "To sum up, employers should avoid contacting their workers during holiday, which can prevent them from excessive work, loads of stress and to keep close relationship with their friends.",
    "correctedSentence": "To sum up, employers should avoid contacting their workers during holidays, which can protect them from excessive work and loads of stress and can help them maintain close relationships with their friends.",
    "categories": [
      "other_grammar",
      "parallelism",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_GENERIC_RELATIONSHIP_PLURAL",
      "NOUN_RECURRING_HOLIDAY_PLURAL",
      "PARALLEL_RESULT_PROTECT_AND_HELP",
      "VERB_PROTECT_NP_FROM_NP"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:parallelism",
      "category:singular_plural",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:NOUN_GENERIC_RELATIONSHIP_PLURAL",
      "rule:NOUN_RECURRING_HOLIDAY_PLURAL",
      "rule:PARALLEL_RESULT_PROTECT_AND_HELP",
      "rule:VERB_PROTECT_NP_FROM_NP",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「holiday」在此應改為「holidays」。結論泛指所有假期，所以使用複數 holidays。特定的一次假期則需寫 during the holiday。 「prevent them from excessive work,」在此應改為「protect them from excessive work and」。prevent + 人 + from 後面通常接動名詞，例如 prevent workers from overworking。若後面直接接名詞 excessive work，可改用 protect workers from excessive work。 「to keep」在此應改為「can help them maintain」。前一部分表示「保護工人免受工作和壓力」，後一部分則表示「幫助他們維持關係」。兩個結果需要各自完整的動詞結構：can protect... and can help them maintain...。 「relationship」在此應改為「relationships」。工人可能與多位朋友維持多段關係，因此泛指時使用複數 close relationships。若只談與一位指定朋友的關係，單數才可能成立。"
  },
  {
    "sentenceId": "PARA-0010-S01",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In many schools, In order to train students discipline.",
    "correctedSentence": "In many schools, uniforms are required in order to instil discipline in students.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_FRAGMENT_PURPOSE_ADJUNCT_MAIN_CLAUSE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "infinitive_to",
      "quantifier",
      "rule:CLAUSE_FRAGMENT_PURPOSE_ADJUNCT_MAIN_CLAUSE"
    ],
    "explanationZhHant": "「In many schools, In order to train students discipline.」在此應改為「In many schools, uniforms are required in order to instil discipline in students.」。in order to + 動詞是表示目的的從屬結構，不能單獨成句，必須依附主句。目標句補回 uniforms are required。此外，表示「培養紀律」可用 instil discipline in students。由於主句是根據下一句推斷，必須由老師確認。"
  },
  {
    "sentenceId": "PARA-0010-S02",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Schools have stringent requestment in uniform.",
    "correctedSentence": "Schools have stringent uniform requirements.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_UNIFORM_REQUIREMENTS_COMPOUND_NOUN"
    ],
    "structureTags": [
      "category:preposition",
      "have_auxiliary",
      "rule:COLLOC_UNIFORM_REQUIREMENTS_COMPOUND_NOUN"
    ],
    "explanationZhHant": "「requestment in uniform」在此應改為「uniform requirements」。requestment 不是這個意思下的標準名詞；應用 requirements。表示校服規定時，通常把單數名詞 uniform 放在 requirements 前：uniform requirements。另一個正確寫法是 requirements regarding uniforms。"
  },
  {
    "sentenceId": "PARA-0010-S03",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Some schools allow children to dress with for more freedom.",
    "correctedSentence": "Some schools allow children to dress more freely.",
    "categories": [
      "word_form"
    ],
    "ruleIds": [
      "WORDFORM_DRESS_FREELY_ADVERB"
    ],
    "structureTags": [
      "category:word_form",
      "infinitive_to",
      "quantifier",
      "rule:WORDFORM_DRESS_FREELY_ADVERB"
    ],
    "explanationZhHant": "「dress with for more freedom」在此應改為「dress more freely」。dress 在這裡是不及物動詞，可用副詞 freely 修飾。 with 後面需要賓語，例如 dress with greater variety； 原句的 with for 不能構成一個完整結構。"
  },
  {
    "sentenceId": "PARA-0010-S04",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Requiring pupils to wear a uniform has several clear benefits, especially wearing uniform can help students more focus on studies, but schools allowing casual wear will increase the time and cost and even cause psychological problems.",
    "correctedSentence": "Requiring pupils to wear a uniform has several clear benefits, especially because wearing a uniform can help students focus more on studies, but schools allowing casual wear will increase the time and cost and even cause psychological problems.",
    "categories": [
      "article_or_determiner",
      "sentence_structure",
      "word_form"
    ],
    "ruleIds": [
      "ADVERB_FOCUS_MORE_AFTER_VERB",
      "ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
      "CLAUSE_ESPECIALLY_BECAUSE_FINITE_REASON"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:sentence_structure",
      "category:word_form",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "quantifier",
      "rule:ADVERB_FOCUS_MORE_AFTER_VERB",
      "rule:ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
      "rule:CLAUSE_ESPECIALLY_BECAUSE_FINITE_REASON",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「especially」在此應改為「especially because」。wearing a uniform can help... 是完整分句。若它用來解釋「為甚麼有好處」，需要 because 引出原因。 especially 本身是副詞，不能單獨充當連接完整分句的從屬連接詞。 「wearing uniform」在此應改為「wearing a uniform」。uniform 在這裡是單數可數名詞，因此需要冠詞 a。即使整個結構由動名詞 wearing 開始，動名詞後面的名詞詞組仍須遵守冠詞規則。泛指多種校服時可寫 wearing uniforms。 「help students more focus」在此應改為「help students focus more」。help + 人 + 動詞原形是正確結構；程度副詞 more 在這裡修飾 focus，通常放在動詞後面。另一個正確寫法是 help students to focus more。"
  },
  {
    "sentenceId": "PARA-0010-S05",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One major advantage Wearing uniform can reduce this wearing anxiety and help students concentrate on studies.",
    "correctedSentence": "One major advantage is that wearing a uniform can reduce anxiety about clothing and help students concentrate on studies.",
    "categories": [
      "article_or_determiner",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
      "CLAUSE_COPULAR_ADVANTAGE_IS_THAT",
      "COLLOC_ANXIETY_ABOUT_CLOTHING"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "category:sentence_structure",
      "coordination",
      "modal",
      "rule:ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
      "rule:CLAUSE_COPULAR_ADVANTAGE_IS_THAT",
      "rule:COLLOC_ANXIETY_ABOUT_CLOTHING",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「One major advantage」在此應改為「One major advantage is that」。One major advantage 只是一個名詞詞組，仍欠謂語。用 is that + 完整分句說明該優點的內容。公式：The advantage is that + 主語 + 動詞。 「Wearing uniform」在此應改為「wearing a uniform」。uniform 是單數可數名詞，要加 a。加入 is that 後， wearing 不再位於句首，因此改用小寫。 「this wearing anxiety」在此應改為「anxiety about clothing」。anxiety 通常用 about 或 over 引出令人憂慮的事情。 wearing anxiety 不能清楚表達「對衣着的焦慮」。也可寫 clothing-related anxiety。"
  },
  {
    "sentenceId": "PARA-0010-S06",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If students spend less time choosing outfits clothes, they can reserve more time for homework and get quality time to sleep in the morning, as well as students maintain energy in the lesson.",
    "correctedSentence": "If students spend less time choosing outfits, they can reserve more time for homework, have more time to sleep in the morning, and maintain energy in the lesson.",
    "categories": [
      "parallelism",
      "preposition",
      "singular_plural"
    ],
    "ruleIds": [
      "COLLOC_HAVE_TIME_TO_SLEEP",
      "NOUN_REDUNDANT_OUTFITS_CLOTHES",
      "SHARED_MODAL_PARALLEL"
    ],
    "structureTags": [
      "category:parallelism",
      "category:preposition",
      "category:singular_plural",
      "conditional",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:COLLOC_HAVE_TIME_TO_SLEEP",
      "rule:NOUN_REDUNDANT_OUTFITS_CLOTHES",
      "rule:SHARED_MODAL_PARALLEL",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「outfits clothes」在此應改為「outfits」。outfit 本身已表示一套衣服，不能把 outfits clothes 當作一般名詞組合。可保留 outfits，或改為單獨的 clothes。 「homework and get quality」在此應改為「homework, have more」。quality time 通常指有意義地與某人相處或從事重視的活動，不等於可供睡眠的時間。若原意是「多一點時間睡覺」，可寫 have more time to sleep；若強調睡眠量，可寫 get enough sleep。 「as well as students」在此應改為「and」。情態動詞 can 同時控制 reserve、have 和 maintain，所以三個動詞都用原形，亦不重複主語 students。公式： can + verb A, verb B, and verb C。"
  },
  {
    "sentenceId": "PARA-0010-S07",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Uniforms can create the fair schools environment.",
    "correctedSentence": "Uniforms can create a fair school environment.",
    "categories": [
      "article_or_determiner",
      "singular_plural"
    ],
    "ruleIds": [
      "ARTICLE_INDEFINITE_FIRST_MENTION_A",
      "NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_ENVIRONMENT"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:singular_plural",
      "modal",
      "rule:ARTICLE_INDEFINITE_FIRST_MENTION_A",
      "rule:NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_ENVIRONMENT"
    ],
    "explanationZhHant": "「the fair」在此應改為「a fair」。這裡首次提出一種尚未特定的校園環境，因此使用 a fair school environment。若前文已界定某一個特定環境， the 才可能成立。 「schools environment」在此應改為「school environment」。普通名詞放在另一名詞前作修飾語時，通常使用單數，所以是 school environment。複數形式只在少數固定或詞彙化組合中保留。"
  },
  {
    "sentenceId": "PARA-0010-S08",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If schools allow the students causal wear, everyday schools will become a faishon show, Some affluent student dressed to flex, while a normal students only have 2-3 outfits to change.",
    "correctedSentence": "If schools allow the students to wear casual clothes, schools will become fashion shows every day; some affluent students dress to flex, while normal students have only 2-3 outfits to change into.",
    "categories": [
      "article_or_determiner",
      "infinitive_or_gerund",
      "preposition",
      "punctuation",
      "sentence_structure",
      "singular_plural",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ARTICLE_PLURAL_NOUN_NO_A",
      "CLAUSE_EVERY_DAY_ADVERBIAL_POSITION_AND_NUMBER",
      "GENERAL_SOME_PLURAL",
      "PHRASAL_CHANGE_INTO_CLOTHING",
      "PUNCT_COMMA_SPLICE_SEMICOLON",
      "TENSE_GENERAL_PRESENT_CONSISTENCY",
      "VERB_ALLOW_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:infinitive_or_gerund",
      "category:preposition",
      "category:punctuation",
      "category:sentence_structure",
      "category:singular_plural",
      "category:verb_form_or_tense",
      "conditional",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "quantifier",
      "rule:ARTICLE_PLURAL_NOUN_NO_A",
      "rule:CLAUSE_EVERY_DAY_ADVERBIAL_POSITION_AND_NUMBER",
      "rule:GENERAL_SOME_PLURAL",
      "rule:PHRASAL_CHANGE_INTO_CLOTHING",
      "rule:PUNCT_COMMA_SPLICE_SEMICOLON",
      "rule:TENSE_GENERAL_PRESENT_CONSISTENCY",
      "rule:VERB_ALLOW_NP_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「causal wear」在此應改為「to wear casual clothes」。allow 表示准許某人做事時，用 allow + 人 + to + 動詞原形。此外， causal 表示「因果的」；衣着應用 casual。 完整結構是 allow the students to wear casual clothes。也可寫 allow casual wear。 「everyday schools will become a faishon show」在此應改為「schools will become fashion shows every day」。everyday 是形容詞，例如 everyday clothing；表示「每天」要寫兩個字 every day，並作時間副詞。 schools 是複數，所以表語名詞亦改為複數 fashion shows。 faishon 同時改正為 fashion。 「, Some」在此應改為「; some」。前後都是可獨立成句的主句，不能只用逗號連接。這裡使用分號，並把後面的 some 改為小寫。也可使用句號或加入適當連接詞。 「student」在此應改為「students」。若干富裕學生， some 後面使用複數可數名詞 students。some student 也可表示「某一位不知名的學生」，但不符合這裡的群體概括。 「dressed」在此應改為「dress」。這段描述一般校園情況，而不是一次已完成的過去事件，因此使用一般現在式 dress。 若整段是在敘述過去某一天， dressed 才可能適合。 「a normal students only have」在此應改為「normal students have only」。a 只能配合單數可數名詞。可寫 a normal student 或 normal students；本句採用複數，與前面的 some affluent students 對照。 「change」在此應改為「change into」。表示換上某套衣服，用 change into + 衣物。 outfits to change 可能被理解為「需要修改的服裝」，意思不同。"
  },
  {
    "sentenceId": "PARA-0010-S09",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Teenagers value their friendships and care about what their think, personal outfits become a main topic in schools.",
    "correctedSentence": "Teenagers value their friendships and care about what their friends think, so personal outfits become a main topic in schools.",
    "categories": [
      "article_or_determiner",
      "punctuation"
    ],
    "ruleIds": [
      "DETERMINER_POSSESSIVE_REQUIRES_NOUN",
      "PUNCT_COMMA_SPLICE_CAUSAL_SO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:punctuation",
      "coordination",
      "question_word",
      "rule:DETERMINER_POSSESSIVE_REQUIRES_NOUN",
      "rule:PUNCT_COMMA_SPLICE_CAUSAL_SO"
    ],
    "explanationZhHant": "「what their think」在此應改為「what their friends think」。their 是所有格限定詞，後面必須有名詞。根據前面的 friendships，目標句補上 friends。也可寫 what others think。 由於所指人物需靠上文推斷，建議老師確認。 「, personal outfits」在此應改為「, so personal outfits」。前後是兩個完整主句，而且後句是前句的結果，因此加入 so。也可用分號，但分號不會明確標示因果關係。"
  },
  {
    "sentenceId": "PARA-0010-S10",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If some students can't expand that even cause bullying in school.",
    "correctedSentence": "If some students can't afford such clothes, this may even cause bullying in school.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "AMBIGUOUS_EXPAND_AFFORD_CONDITIONAL_RECONSTRUCTION"
    ],
    "structureTags": [
      "category:other_grammar",
      "conditional",
      "modal",
      "quantifier",
      "rule:AMBIGUOUS_EXPAND_AFFORD_CONDITIONAL_RECONSTRUCTION",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「can't expand that even cause」在此應改為「can't afford such clothes, this may even cause」。expand 不表示「有能力購買」。按上下文，可能原意是 afford such clothes。此外， if 分句後必須有完整主句，因此補上主語和有限動詞 this may even cause。 由於 expand 可能代表其他原意，不能在沒有上下文時自動修改。"
  },
  {
    "sentenceId": "PARA-0010-S11",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Therefore children will face mental health problems.",
    "correctedSentence": "Therefore, children will face mental health problems.",
    "categories": [
      "punctuation"
    ],
    "ruleIds": [
      "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA"
    ],
    "structureTags": [
      "category:punctuation",
      "modal",
      "rule:PUNCT_INTRODUCTORY_ADVERBIAL_COMMA"
    ],
    "explanationZhHant": "「Therefore」在此應改為「Therefore,」。Therefore 在句首作連接副詞，正式寫作中通常以逗號與主句分隔。"
  },
  {
    "sentenceId": "PARA-0010-S12",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For these reasons uniforms can reslove the students choosing outfits problems and make campus life equal.",
    "correctedSentence": "For these reasons, uniforms can resolve students' problems with choosing outfits and make campus life equal.",
    "categories": [
      "possessive",
      "punctuation",
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "POSSESSIVE_PLURAL_PROBLEMS_WITH_GERUND",
      "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "SPELLING_RESOLVE"
    ],
    "structureTags": [
      "category:possessive",
      "category:punctuation",
      "category:spelling_or_spacing",
      "coordination",
      "modal",
      "rule:POSSESSIVE_PLURAL_PROBLEMS_WITH_GERUND",
      "rule:PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "rule:SPELLING_RESOLVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「For these reasons」在此應改為「For these reasons,」。較長的句首介詞短語通常以逗號與主句分隔，讓句子邊界清楚。 「reslove」在此應改為「resolve」。正確拼法是 resolve。這是拼字問題，不是句法規則。 「the students choosing outfits problems」在此應改為「students' problems with choosing outfits」。表示問題屬於多名學生，用複數所有格 students'。表示「在做某事方面的問題」，常用 problems with + 動名詞。公式： people's problems with doing something。"
  },
  {
    "sentenceId": "PARA-0010-S13",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "However schools uniforms also have disadvantages.",
    "correctedSentence": "However, school uniforms also have disadvantages.",
    "categories": [
      "punctuation",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_UNIFORM",
      "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA"
    ],
    "structureTags": [
      "category:punctuation",
      "category:singular_plural",
      "have_auxiliary",
      "rule:NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_UNIFORM",
      "rule:PUNCT_INTRODUCTORY_ADVERBIAL_COMMA"
    ],
    "explanationZhHant": "「However」在此應改為「However,」。However 在句首表示轉折時，通常在後面加逗號。若 however 表示「無論多麼」，結構不同，例如 However expensive they are,...。 「schools uniforms」在此應改為「school uniforms」。school 在 school uniforms 中作名詞修飾語，通常使用單數。這不代表只有一間學校或一件校服。"
  },
  {
    "sentenceId": "PARA-0010-S14",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "the most obvious one is that uniforms are not comfortable and practical.",
    "correctedSentence": "The most obvious one is that uniforms are neither comfortable nor practical.",
    "categories": [
      "conjunction",
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "CONJ_NEITHER_NOR_NEGATIVE_COORDINATION",
      "ORTHOGRAPHY_SENTENCE_INITIAL_CAPITAL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "category:spelling_or_spacing",
      "coordination",
      "negation",
      "rule:CONJ_NEITHER_NOR_NEGATIVE_COORDINATION",
      "rule:ORTHOGRAPHY_SENTENCE_INITIAL_CAPITAL"
    ],
    "explanationZhHant": "「the」在此應改為「The」。完整句子的第一個字母要使用大寫。 「not comfortable and practical」在此應改為「neither comfortable nor practical」。not A and B 有時只表示「並非同時兼具 A 和 B」， 不一定否定兩項。根據下文，作者似乎想表示校服既不舒適，也不實用，因此用 neither A nor B。由於修改會確定否定範圍，需老師確認。"
  },
  {
    "sentenceId": "PARA-0010-S15",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Although uniforms look decent, they can't take away sweat and uniform quality not warm in the winnter.",
    "correctedSentence": "Although uniforms look decent, they can't wick away sweat and they are not warm in winter.",
    "categories": [
      "preposition",
      "sentence_structure",
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "CLAUSE_MISSING_COPULA_ADJECTIVE_COMPLEMENT",
      "COLLOC_WICK_AWAY_SWEAT",
      "SPELLING_WINTER"
    ],
    "structureTags": [
      "category:preposition",
      "category:sentence_structure",
      "category:spelling_or_spacing",
      "coordination",
      "modal",
      "negation",
      "rule:CLAUSE_MISSING_COPULA_ADJECTIVE_COMPLEMENT",
      "rule:COLLOC_WICK_AWAY_SWEAT",
      "rule:SPELLING_WINTER"
    ],
    "explanationZhHant": "「take」在此應改為「wick」。描述布料把汗水帶離皮膚時，常用 wick away sweat。 absorb sweat 也可能成立，但意思偏向吸收汗水； take away sweat 雖可理解，並非標準衣料搭配。 「uniform quality」在此應改為「they are」。not warm 是形容詞補語，前面需要主語和連繫動詞 be。目標句以 they 指回 uniforms：they are not warm。若原意是品質差，可另寫 the material is not warm enough。 「the winnter」在此應改為「winter」。正確拼法是 winter。"
  },
  {
    "sentenceId": "PARA-0010-S16",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For example the student finishing the PE leasson T-shirt always get wet and the jacket too thin can't keep warm.",
    "correctedSentence": "For example, after a student finishes a PE lesson, their T-shirt always gets wet, and their jacket is too thin to keep them warm.",
    "categories": [
      "infinitive_or_gerund",
      "punctuation",
      "subject_verb_agreement",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_TOO_TO_CAUSATIVE_KEEP_OBJECT",
      "PARTICIPLE_MALFORMED_MODIFIER_POSSESSIVE_RECONSTRUCTION",
      "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "SINGULAR_SUBJECT_VERB"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:punctuation",
      "category:subject_verb_agreement",
      "category:word_form",
      "coordination",
      "modal",
      "rule:ADJ_TOO_TO_CAUSATIVE_KEEP_OBJECT",
      "rule:PARTICIPLE_MALFORMED_MODIFIER_POSSESSIVE_RECONSTRUCTION",
      "rule:PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "rule:SINGULAR_SUBJECT_VERB",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「For example」在此應改為「For example,」。For example 位於句首並引出例子時，通常在後面加逗號。 「the student finishing the PE leasson T-shirt」在此應改為「after a student finishes a PE lesson, their T-shirt」。原詞序不能清楚顯示誰完成體育課、哪件 T-shirt 屬於誰。目標句先用時間分句 after a student finish es...， 再用所有格 their T-shirt。 leasson 同時改為 lesson。 「get」在此應改為「gets」。動詞的真正主語是單數 T-shirt，所以一般現在式用 gets。 附近的 student 或 lesson 不控制這個動詞。 「wet and the jacket too thin can't keep warm」在此應改為「wet, and their jacket is too thin to keep them warm」。第二部分需要完整主句： their jacket is...。 too + 形容詞 + to + 動詞原形表示程度過高而無法達到結果； keep 還需要受詞和形容詞補語：keep them warm。"
  },
  {
    "sentenceId": "PARA-0010-S17",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Another drawback is cost.",
    "correctedSentence": "Another drawback is cost.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0010-S18",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Although uniforms are meant to simplify clothing but the suppliers price increase every years.",
    "correctedSentence": "Although uniforms are meant to simplify clothing, the suppliers' prices increase every year.",
    "categories": [
      "conjunction",
      "possessive",
      "singular_plural"
    ],
    "ruleIds": [
      "CONJ_ALTHOUGH_NO_COORDINATING_BUT",
      "NOUN_EVERY_SINGULAR_COUNT_NOUN",
      "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "category:possessive",
      "category:singular_plural",
      "coordination",
      "infinitive_to",
      "rule:CONJ_ALTHOUGH_NO_COORDINATING_BUT",
      "rule:NOUN_EVERY_SINGULAR_COUNT_NOUN",
      "rule:POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「clothing but」在此應改為「clothing,」。although 已經引出讓步分句，同一對分句不再使用 but。可寫 Although A, B，或不用 although 而寫 A, but B。 「suppliers price」在此應改為「suppliers' prices」。價格屬於多名供應商，所以在規則複數 suppliers 的 s 後加撇號。多名供應商可能有多個價格，因此中心名詞用複數 prices。若只有一名供應商，則寫 the supplier's price。 「every years」在此應改為「every year」。every 後面接單數可數名詞，所以寫 every year。 比較： all years、 many years。"
  },
  {
    "sentenceId": "PARA-0010-S19",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If the students in developmental stage, keep to change every year.",
    "correctedSentence": "If the students are at a developmental stage, they need to change their uniforms every year.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_CONDITIONAL_MAIN_CLAUSE_SUBJECT_AND_PREDICATE",
      "CLAUSE_COPULAR_PREPOSITIONAL_STAGE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "conditional",
      "infinitive_to",
      "rule:CLAUSE_CONDITIONAL_MAIN_CLAUSE_SUBJECT_AND_PREDICATE",
      "rule:CLAUSE_COPULAR_PREPOSITIONAL_STAGE"
    ],
    "explanationZhHant": "「in developmental stage」在此應改為「are at a developmental stage」。students 後面需要有限動詞 are。表示某人處於某一發展階段，可寫 be at a developmental stage； stage 是單數可數名詞，需要 a。 「keep to change every year」在此應改為「they need to change their uniforms every year」。if 從句後面需要完整主句。原句缺少主語，也沒有說明甚麼需要更換。目標句按上下文補成 they need to change their uniforms。也可能改為被動式 their uniforms need to be changed，因此需老師確認原意。"
  },
  {
    "sentenceId": "PARA-0010-S20",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For income family this become a heavy hidden financial burden.",
    "correctedSentence": "For low-income families, this becomes a heavy hidden financial burden.",
    "categories": [
      "subject_verb_agreement",
      "word_form"
    ],
    "ruleIds": [
      "SINGULAR_SUBJECT_VERB",
      "WORDFORM_LOW_INCOME_ATTRIBUTIVE_HYPHEN"
    ],
    "structureTags": [
      "category:subject_verb_agreement",
      "category:word_form",
      "rule:SINGULAR_SUBJECT_VERB",
      "rule:WORDFORM_LOW_INCOME_ATTRIBUTIVE_HYPHEN"
    ],
    "explanationZhHant": "「income family this」在此應改為「low-income families, this」。表示收入較低的家庭，常用複合形容詞 low-income， 放在名詞前時加連字號。文章泛指多個家庭，因此用 families，並在句首短語後加逗號。 low 是根據「沉重負擔」推斷，需老師確認。 「become」在此應改為「becomes」。主語是單數指示代名詞 this，所以一般現在式動詞用 becomes。介詞短語 For low-income families 不控制動詞形式。"
  },
  {
    "sentenceId": "PARA-0010-S21",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Therefore uniforms may solve social problems at schools, but they can also create parents and students economic difficulties.",
    "correctedSentence": "Therefore, uniforms may solve social problems at schools, but they can also create economic difficulties for parents and students.",
    "categories": [
      "other_grammar",
      "punctuation"
    ],
    "ruleIds": [
      "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "VERB_CREATE_NP_FOR_BENEFICIARY"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:punctuation",
      "coordination",
      "modal",
      "rule:PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "rule:VERB_CREATE_NP_FOR_BENEFICIARY"
    ],
    "explanationZhHant": "「Therefore」在此應改為「Therefore,」。句首連接副詞 Therefore 後面通常使用逗號。 「create parents and students economic difficulties」在此應改為「create economic difficulties for parents and students」。create 先直接接被創造或造成的事物，再用 for 引出受影響的人： create + difficulties + for + people。不能把 parents and students 直接放在 economic difficulties 前作雙賓語。"
  },
  {
    "sentenceId": "PARA-0010-S22",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In conclusion school uniforms can make wearing easier for the students and reduce comparison but they can cause financial pressure.",
    "correctedSentence": "In conclusion, school uniforms can make dressing easier for the students and reduce comparison, but they can cause financial pressure.",
    "categories": [
      "preposition",
      "punctuation"
    ],
    "ruleIds": [
      "COLLOC_MAKE_DRESSING_EASIER",
      "PUNCT_COORDINATED_INDEPENDENT_CLAUSES_COMMA",
      "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA"
    ],
    "structureTags": [
      "category:preposition",
      "category:punctuation",
      "coordination",
      "modal",
      "rule:COLLOC_MAKE_DRESSING_EASIER",
      "rule:PUNCT_COORDINATED_INDEPENDENT_CLAUSES_COMMA",
      "rule:PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「conclusion」在此應改為「conclusion,」。In conclusion 是句首引導語，通常在後面加逗號。 「wearing」在此應改為「dressing」。單獨的 wearing 通常需要說明穿甚麼，例如 wearing uniforms。表示「令穿衣更容易」，可用名詞化動作 dressing，也可寫 make getting dressed easier。 「comparison」在此應改為「comparison,」。school uniforms can... 和 they can cause... 都是完整主句，由 but 連接時，正式寫作通常在 but 前加逗號。"
  },
  {
    "sentenceId": "PARA-0010-S23",
    "paragraphId": "PARA-0010",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Overall, they bring clear learning environment benefits, while also creating practical and personal drawbacks.",
    "correctedSentence": "Overall, they bring clear learning environment benefits, while also creating practical and personal drawbacks.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "coordination",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0011-S01",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In today's society, work become a part of our life, so our private time it has been connected with our work.",
    "correctedSentence": "In today's society, work has become a part of our lives, so our private time has been connected with our work.",
    "categories": [
      "sentence_structure",
      "singular_plural",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "CLAUSE_MAIN_SUBJECT_NO_RESUMPTIVE_PRONOUN",
      "NOUN_DISTRIBUTIVE_POSSESSIVE_PLURAL_LIVES",
      "TENSE_PRESENT_PERFECT_CHANGE_TO_PRESENT_STATE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:singular_plural",
      "category:verb_form_or_tense",
      "have_auxiliary",
      "rule:CLAUSE_MAIN_SUBJECT_NO_RESUMPTIVE_PRONOUN",
      "rule:NOUN_DISTRIBUTIVE_POSSESSIVE_PLURAL_LIVES",
      "rule:TENSE_PRESENT_PERFECT_CHANGE_TO_PRESENT_STATE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「work become」在此應改為「work has become」。工作發展至今已成為生活的一部分，因此目標句使用現在完成式 has become。 work 是單數不可數主語，所以不能直接接 become。 若原意是一般規律，work becomes 也可成立，故應保留為可接受替代。 「our life」在此應改為「our lives」。our 指多個人的生活，這裡通常用複數 our lives。 在把眾人的生活視為一個整體概念時，our life asa community 也可能成立，但本句是一般個人生活。 「our private time it has」在此應改為「our private time has」。our private time 已經是主句主語，不能再加入代名詞 it 重複同一主語。公式：主語 + 有限動詞，不是主語 + it + 有限動詞。"
  },
  {
    "sentenceId": "PARA-0011-S02",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "This problem is usually caused by over workload leads to work stress and weakened boundaries between professional and private life.",
    "correctedSentence": "This problem is usually caused by excessive workloads, which lead to work stress and weakened boundaries between professional and private life.",
    "categories": [
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_CAUSED_BY_NP_RELATIVE_RESULT",
      "COLLOC_EXCESSIVE_WORKLOAD_PLURAL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:sentence_structure",
      "coordination",
      "infinitive_to",
      "rule:CLAUSE_CAUSED_BY_NP_RELATIVE_RESULT",
      "rule:COLLOC_EXCESSIVE_WORKLOAD_PLURAL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「over workload」在此應改為「excessive workloads,」。over 不能直接這樣修飾 workload。表示工作量過多，可用 an excessive workload 或泛指多種工作負擔的 excessive workloads。 「leads」在此應改為「which lead」。is caused 已是主句的有限動詞，後面的 leads 不能在沒有連接詞下直接形成第二個謂語。加入 which 建立關係分句；先行詞 workloads 是複數，所以用 lead。"
  },
  {
    "sentenceId": "PARA-0011-S03",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If the government set a limits maximum working hour and set personal boundaries can protect employees work life balance.",
    "correctedSentence": "If the government sets a maximum limit on working hours and employees set personal boundaries, these measures can protect employees' work-life balance.",
    "categories": [
      "possessive",
      "sentence_structure",
      "singular_plural",
      "spelling_or_spacing",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "CLAUSE_COORDINATED_IF_CLAUSES_EXPLICIT_SUBJECT",
      "CLAUSE_FRONTED_IF_MAIN_CLAUSE_SUBJECT",
      "NOUN_MAXIMUM_LIMIT_ON_WORKING_HOURS",
      "ORTHOGRAPHY_COMPOUND_WORK_LIFE_HYPHEN",
      "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "SVA_PRESENT_SINGULAR_GOVERNMENT_S_FORM"
    ],
    "structureTags": [
      "category:possessive",
      "category:sentence_structure",
      "category:singular_plural",
      "category:spelling_or_spacing",
      "category:subject_verb_agreement",
      "conditional",
      "coordination",
      "modal",
      "rule:CLAUSE_COORDINATED_IF_CLAUSES_EXPLICIT_SUBJECT",
      "rule:CLAUSE_FRONTED_IF_MAIN_CLAUSE_SUBJECT",
      "rule:NOUN_MAXIMUM_LIMIT_ON_WORKING_HOURS",
      "rule:ORTHOGRAPHY_COMPOUND_WORK_LIFE_HYPHEN",
      "rule:POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "rule:SVA_PRESENT_SINGULAR_GOVERNMENT_S_FORM",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「set」在此應改為「sets」。the government 在本句視為單數機構，一般現在式動詞用 sets。英式英文有時可把集體名詞視為複數，但本句聚焦政府作為一個政策制定者。 「limits maximum working hour」在此應改為「maximum limit on working hours」。a 後面要接單數 limit； maximum 放在名詞前；表示對某事設定上限，用 a limit on + 名詞。這裡泛指每週或每日工時，所以用複數 working hours。 「and」在此應改為「and employees」。第一個動作由 the government 執行，第二個動作則按原意由 employees 執行。主語不同時，不能讓兩個動詞錯誤地共用同一主語，因此要明確補上 employees。 「boundaries」在此應改為「boundaries, these measures」。句首 If... 部分是條件分句，之後仍需要一個完整主句。原文只有 can protect，欠缺主語；目標句加入 these measures，並以逗號分隔條件分句。 「employees」在此應改為「employees'」。work–life balance 屬於多名 employees。規則複數名詞已以 s 結尾，所以在 s 後加撇號： employees'。 「work life」在此應改為「work-life」。work-life 共同修飾 balance，是慣用的複合修飾語，因此通常加連字號。單獨並列兩個名詞時未必需要連字號。"
  },
  {
    "sentenceId": "PARA-0011-S04",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One major reason is that many employess facing a heavy workload.",
    "correctedSentence": "One major reason is that many employees face a heavy workload.",
    "categories": [
      "sentence_structure",
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "CLAUSE_THAT_PLURAL_SUBJECT_FINITE_PRESENT",
      "SPELLING_EMPLOYEES"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:spelling_or_spacing",
      "quantifier",
      "rule:CLAUSE_THAT_PLURAL_SUBJECT_FINITE_PRESENT",
      "rule:SPELLING_EMPLOYEES",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「employess」在此應改為「employees」。正確拼法是 employees。這是拼字問題，不是句法規則。 「facing」在此應改為「face」。that 後面需要完整分句。 many employees 是複數主語，因此使用一般現在式有限動詞 face。 employees facing... 可作名詞詞組，但不能在這裡單獨充當完整分句。"
  },
  {
    "sentenceId": "PARA-0011-S05",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Nowadays messaging app are common caused staff have a lot of email messages to reply, since it is so convenient to manage documents and meetings, so the end of the working day no longer feels like a real end.",
    "correctedSentence": "Nowadays, messaging apps are common, causing staff to have a lot of email messages to reply to; since it is so convenient to manage documents and meetings, the end of the working day no longer feels like a real end.",
    "categories": [
      "conjunction",
      "infinitive_or_gerund",
      "preposition",
      "punctuation",
      "singular_plural"
    ],
    "ruleIds": [
      "CONJ_SINCE_NO_RESULT_SO",
      "NOUN_GENERIC_PLURAL_MESSAGING_APPS",
      "PARTICIPLE_RESULT_CAUSING_CLAUSE",
      "PREP_REPLY_TO_MESSAGE",
      "PUNCT_COMMA_SPLICE_SEMICOLON",
      "PUNCT_INTRODUCTORY_ADVERB_COMMA",
      "VERB_CAUSE_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "category:infinitive_or_gerund",
      "category:preposition",
      "category:punctuation",
      "category:singular_plural",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "negation",
      "rule:CONJ_SINCE_NO_RESULT_SO",
      "rule:NOUN_GENERIC_PLURAL_MESSAGING_APPS",
      "rule:PARTICIPLE_RESULT_CAUSING_CLAUSE",
      "rule:PREP_REPLY_TO_MESSAGE",
      "rule:PUNCT_COMMA_SPLICE_SEMICOLON",
      "rule:PUNCT_INTRODUCTORY_ADVERB_COMMA",
      "rule:VERB_CAUSE_NP_TO_INFINITIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Nowadays」在此應改為「Nowadays,」。Nowadays 位於句首作時間副詞，正式寫作中通常在後面加逗號。 「app」在此應改為「apps」。are 要配合複數主語，因此用 messaging apps。若使用單數，則要寫 a messaging app is。 「common caused」在此應改為「common, causing」。are common 已構成完整謂語。後面表示其結果時，可用逗號加現在分詞 causing...。直接寫 are common caused 會把兩個不相容的動詞形式放在一起。 「staff have」在此應改為「staff to have」。cause 表示導致某人處於某情況或做某事時，用 cause + 人 + to + 動詞原形。所以寫 causing staff to have...。 「reply」在此應改為「reply to」。reply 表示回覆某封訊息時，需要介詞 to。在 messages to reply to 中， messages 是 to 的邏輯賓語，因此介詞保留在不定詞末端。 reply to messages 也是正確的完整形式。 「,」在此應改為「;」。前半句和由 since... 開始的後半部分各自形成完整的複合主句，不能只用逗號連接。此處使用分號；也可改用句號。 「, so」在此應改為「,」。since 已引出原因分句，主句前不再加入結果連接詞 so。可寫 Since A, B， 或 A, so B， 但一般不混合成 Since A, soB。"
  },
  {
    "sentenceId": "PARA-0011-S06",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "As a result a person may be physically at home, but mentally still at the office desk.",
    "correctedSentence": "As a result, a person may be physically at home, but mentally still at the office desk.",
    "categories": [
      "punctuation"
    ],
    "ruleIds": [
      "PUNCT_INTRODUCTORY_LINKER_COMMA"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:punctuation",
      "coordination",
      "modal",
      "rule:PUNCT_INTRODUCTORY_LINKER_COMMA"
    ],
    "explanationZhHant": "「As a result」在此應改為「As a result,」。As a result 是句首連接語，後面通常加逗號。後面的 but mentally still... 是省略了重複主語和助動詞的平行結構，本身可以成立。"
  },
  {
    "sentenceId": "PARA-0011-S07",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Another cause is financial pressure.",
    "correctedSentence": "Another cause is financial pressure.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0011-S08",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Face of high house prices, bus fares and food keep going up, people give up their free time and face heavy work stress just to keep their jobs.",
    "correctedSentence": "Faced with high house prices, rising bus fares and food prices, people give up their free time and face heavy work stress just to keep their jobs.",
    "categories": [
      "infinitive_or_gerund",
      "parallelism"
    ],
    "ruleIds": [
      "PARALLEL_PRICE_NOUNS_RISING_MODIFIER",
      "PARTICIPLE_FACED_WITH_CIRCUMSTANCE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:parallelism",
      "coordination",
      "infinitive_to",
      "rule:PARALLEL_PRICE_NOUNS_RISING_MODIFIER",
      "rule:PARTICIPLE_FACED_WITH_CIRCUMSTANCE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Face of」在此應改為「Faced with」。表示某人面對某些處境，用過去分詞結構 Faced with + 名詞。 face of 通常表示某物的表面或面貌，例如 the face of the building， 不是本句所需意思。 「bus fares and food keep going up」在此應改為「rising bus fares and food prices」。Faced with 後面需要平行的名詞詞組。按上下文，作者似乎指車費和食品價格上升，因此改為 rising bus fares and food prices。因為原文的 food 也可能有其他意思，應由老師確認。"
  },
  {
    "sentenceId": "PARA-0011-S09",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Over time, their tired bodies to make money.",
    "correctedSentence": "Over time, their bodies become tired as they work to make money.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_FRAGMENT_SUBJECT_ADJECTIVE_INFINITIVE_RECONSTRUCTION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "infinitive_to",
      "rule:CLAUSE_FRAGMENT_SUBJECT_ADJECTIVE_INFINITIVE_RECONSTRUCTION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「their tired bodies to make money」在此應改為「their bodies become tired as they work to make money」。原文只有名詞詞組 their tired bodies 和不定詞，沒有有限動詞，因此不是完整句子。目標句加入 become，再以 as 說明身體疲累時正在進行的工作。這是原意推斷，須老師覆核。"
  },
  {
    "sentenceId": "PARA-0011-S10",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Because they do not have enough rest for a long time, they work become slower and slower and need more time to finish the work, After that, they lose their personal life.",
    "correctedSentence": "Because they do not have enough rest for a long time, they work more and more slowly and need more time to finish the work; after that, they lose their personal life.",
    "categories": [
      "punctuation",
      "word_form"
    ],
    "ruleIds": [
      "PUNCT_COMMA_SPLICE_SEMICOLON",
      "WORDFORM_VERB_MODIFIED_BY_ADVERB_COMPARATIVE"
    ],
    "structureTags": [
      "category:punctuation",
      "category:word_form",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "negation",
      "rule:PUNCT_COMMA_SPLICE_SEMICOLON",
      "rule:WORDFORM_VERB_MODIFIED_BY_ADVERB_COMPARATIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「they work become slower and slower」在此應改為「they work more and more slowly」。work 是動作，應由副詞 slowly 修飾。表示動作逐漸變慢，用 more and more slowly。 become slower 可描述人或事物的狀態，但不能直接放在 they work 後形成雙重謂語。 「, After」在此應改為「; after」。前後都是完整主句，不能只用逗號連接。改用分號後， after 不再位於新句句首，因此使用小寫。句號加大寫 After 也是正確替代。"
  },
  {
    "sentenceId": "PARA-0011-S11",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The most effective solution is the government to limit the maximum working hours for certain jobs.",
    "correctedSentence": "The most effective solution is for the government to limit the maximum working hours for certain jobs.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_COPULAR_FOR_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "infinitive_to",
      "rule:CLAUSE_COPULAR_FOR_NP_TO_INFINITIVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「solution is the government to limit」在此應改為「solution is for the government to limit」。在 be 後用不定詞分句並明確指出執行者時，使用 for + 人／機構 + to + 動詞。公式： The solution is for X to do Y."
  },
  {
    "sentenceId": "PARA-0011-S12",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For examples, clerks and sales assistants can only work 6 days per week and 8 hours per day.",
    "correctedSentence": "For example, clerks and sales assistants can only work 6 days per week and 8 hours per day.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "FIXED_FOR_EXAMPLE_SINGULAR"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "modal",
      "rule:FIXED_FOR_EXAMPLE_SINGULAR"
    ],
    "explanationZhHant": "「For examples」在此應改為「For example」。引出一個或一組例子時，固定連接語是 For example。 examples 可用在普通名詞結構，如 These are useful examp les."
  },
  {
    "sentenceId": "PARA-0011-S13",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Also the employees can choose not to read or reply the work messages after work, and theirs bosses cannot punish or give them bad reviews for this.",
    "correctedSentence": "Also, the employees can choose not to read or reply to the work messages after work, and their bosses cannot punish them or give them bad reviews for this.",
    "categories": [
      "parallelism",
      "preposition",
      "pronoun",
      "punctuation"
    ],
    "ruleIds": [
      "PARALLEL_TRANSITIVE_VERBS_EXPLICIT_OBJECT",
      "PREP_REPLY_TO_MESSAGE",
      "PRONOUN_POSSESSIVE_DETERMINER_THEIR",
      "PUNCT_INTRODUCTORY_LINKER_COMMA"
    ],
    "structureTags": [
      "category:parallelism",
      "category:preposition",
      "category:pronoun",
      "category:punctuation",
      "coordination",
      "infinitive_to",
      "modal",
      "negation",
      "rule:PARALLEL_TRANSITIVE_VERBS_EXPLICIT_OBJECT",
      "rule:PREP_REPLY_TO_MESSAGE",
      "rule:PRONOUN_POSSESSIVE_DETERMINER_THEIR",
      "rule:PUNCT_INTRODUCTORY_LINKER_COMMA"
    ],
    "explanationZhHant": "「Also」在此應改為「Also,」。Also 位於句首並連接論點時，通常在後面加逗號。 「reply the work messages」在此應改為「reply to the work messages」。reply 作動詞並接回覆對象時，用 reply to + 訊息／人。 answer the messages 可直接接賓語，但 reply 不可照搬 answer 的結構。 「theirs bosses」在此應改為「their bosses」。名詞 bosses 前需要所有格限定詞 their。 theirs 是獨立所有格代名詞，後面不能再接名詞，例如 The decision is their s. 「punish or give them bad reviews」在此應改為「punish them or give them bad reviews」。punish 是及物動詞，需要受詞。後面的 them 是 give 的間接受詞，不能自動倒推為 punish 的受詞，因此要明確寫 punish them。"
  },
  {
    "sentenceId": "PARA-0011-S14",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Hope this can help workers keep more personal and more rest time.",
    "correctedSentence": "I hope this can help workers have more personal time and more rest time.",
    "categories": [
      "parallelism",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_FRAGMENT_MISSING_SUBJECT_I_HOPE",
      "COLLOC_HAVE_PERSONAL_TIME",
      "PARALLEL_COORDINATED_NOUN_PHRASES_REPEATED_HEAD"
    ],
    "structureTags": [
      "category:parallelism",
      "category:preposition",
      "category:sentence_structure",
      "coordination",
      "modal",
      "rule:CLAUSE_FRAGMENT_MISSING_SUBJECT_I_HOPE",
      "rule:COLLOC_HAVE_PERSONAL_TIME",
      "rule:PARALLEL_COORDINATED_NOUN_PHRASES_REPEATED_HEAD"
    ],
    "explanationZhHant": "「Hope this」在此應改為「I hope this」。陳述句中的 hope 需要主語。根據文章由第一身表達立場，補回 I。祈使句可省略主語，但 Hope this... 在此不是自然的祈使結構。 「keep」在此應改為「have」。表示工人擁有較多私人時間，通常用 have more personal time。keep time 有守時、記錄時間等其他意思，因此在這裡不夠準確。 「more personal and more rest time」在此應改為「more personal time and more rest time」。personal 是形容詞，不能單獨作 have 的受詞。加入名詞 time 後，兩部分成為平行名詞詞組：more personal time 和 more rest time。"
  },
  {
    "sentenceId": "PARA-0011-S15",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At the same time people should set a clear boundaries for work.",
    "correctedSentence": "At the same time, people should set clear boundaries for work.",
    "categories": [
      "article_or_determiner",
      "punctuation"
    ],
    "ruleIds": [
      "ARTICLE_A_PLURAL_NOUN_DELETE",
      "PUNCT_INTRODUCTORY_LINKER_COMMA"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:punctuation",
      "modal",
      "rule:ARTICLE_A_PLURAL_NOUN_DELETE",
      "rule:PUNCT_INTRODUCTORY_LINKER_COMMA"
    ],
    "explanationZhHant": "「At the same time」在此應改為「At the same time,」。句首連接短語 At the same time 後面通常加逗號。 「a clear boundaries」在此應改為「clear boundaries」。a 只能接單數可數名詞，不能接複數 boundaries。可寫 a clear boundary 或 clear boundaries；本段談多種界線，所以採用複數。"
  },
  {
    "sentenceId": "PARA-0011-S16",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For examples, after work turn off work notifications, and leaves more time for doing exercise and having family dinners.",
    "correctedSentence": "For example, after work, people can turn off work notifications and leave more time for doing exercise and having family dinners.",
    "categories": [
      "parallelism",
      "preposition",
      "punctuation",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_EXAMPLE_EXPLICIT_GENERIC_SUBJECT_MODAL",
      "FIXED_FOR_EXAMPLE_SINGULAR",
      "PUNCT_INTRODUCTORY_PREPOSITIONAL_PHRASE_COMMA",
      "SHARED_MODAL_PARALLEL"
    ],
    "structureTags": [
      "category:parallelism",
      "category:preposition",
      "category:punctuation",
      "category:sentence_structure",
      "coordination",
      "rule:CLAUSE_EXAMPLE_EXPLICIT_GENERIC_SUBJECT_MODAL",
      "rule:FIXED_FOR_EXAMPLE_SINGULAR",
      "rule:PUNCT_INTRODUCTORY_PREPOSITIONAL_PHRASE_COMMA",
      "rule:SHARED_MODAL_PARALLEL",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「examples」在此應改為「example」。固定連接語使用單數 For example。 「after work」在此應改為「after work,」。after work 位於主句前作時間狀語，加入逗號可清楚標示主句從 people 開始。短狀語的逗號有時可省略，但本句結構複雜，應保留。 「turn off」在此應改為「people can turn off」。原句可能被讀成祈使句，但整段正在概括人們可以採取的措施。目標句補上一般主語 people 和情態動詞 can。 若作者確實想直接向讀者提出命令， turn off... 也可能成立。 「notifications, and leaves」在此應改為「notifications and leave」。can 同時控制 turn off 和 leave， 兩個動詞都使用原形。共用同一主語和情態動詞時，通常不在 and 前加逗號。"
  },
  {
    "sentenceId": "PARA-0011-S17",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Without such boundaries, personal life becomes the first thing to be sacrificed.",
    "correctedSentence": "Without such boundaries, personal life becomes the first thing to be sacrificed.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary",
      "infinitive_to",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0011-S18",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In conclusion, work stress and financial pressure is closely connected to our standard of living and quality of life.",
    "correctedSentence": "In conclusion, work stress and financial pressure are closely connected to our standard of living and quality of life.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_PRESENT_COMPOUND_SUBJECT_ARE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "coordination",
      "infinitive_to",
      "rule:SVA_PRESENT_COMPOUND_SUBJECT_ARE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「work stress and financial pressure is」在此應改為「work stress and financial pressure are」。work stress 和 financial pressure 由 and 連接，形成複合複數主語，所以使用 are。若兩個名詞被視為同一個不可分概念，單數才偶爾可能成立。"
  },
  {
    "sentenceId": "PARA-0011-S19",
    "paragraphId": "PARA-0011",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "However If the government and employers give a better work condition and individuals draw a clearer line between their jobs and the rests of their lives.this problem can be solved.",
    "correctedSentence": "However, if the government and employers provide better working conditions and individuals draw a clearer line between their jobs and the rest of their lives, this problem can be solved.",
    "categories": [
      "preposition",
      "punctuation",
      "sentence_structure",
      "singular_plural"
    ],
    "ruleIds": [
      "CLAUSE_FRONTED_IF_COMMA_BEFORE_MAIN",
      "COLLOC_PROVIDE_CONDITIONS",
      "NOUN_THE_REST_OF_SINGULAR_REST",
      "NOUN_WORKING_CONDITIONS_PLURAL",
      "PUNCT_HOWEVER_COMMA_LOWERCASE_IF"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:punctuation",
      "category:sentence_structure",
      "category:singular_plural",
      "conditional",
      "coordination",
      "modal",
      "rule:CLAUSE_FRONTED_IF_COMMA_BEFORE_MAIN",
      "rule:COLLOC_PROVIDE_CONDITIONS",
      "rule:NOUN_THE_REST_OF_SINGULAR_REST",
      "rule:NOUN_WORKING_CONDITIONS_PLURAL",
      "rule:PUNCT_HOWEVER_COMMA_LOWERCASE_IF",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「However If」在此應改為「However, if」。However 是句首連接副詞，後面加逗號。if 仍在同一句內，因此使用小寫。 「give a」在此應改為「provide」。表示政府或僱主創造工作條件，常用 provide working conditions。 give 也可使用，但通常需要明確受詞，如 give employees better working conditions。 「work condition」在此應改為「working conditions」。固定名詞詞組通常是 working conditions，並以複數泛指工時、待遇及環境等多方面條件。改為複數後，不再使用單數冠詞 a。 「rests」在此應改為「rest」。表示剩餘部分時，固定結構是 the rest of + 名詞， 其中 rest 保持單數。 rests 可作動詞或表示多次休息，但不適用於此結構。 「.this」在此應改為「, this」。if 分句一直延伸至 their lives， 其後的 this problem can be solved 才是主句。因此不能在兩者之間使用句號；應以逗號分隔，並把 this 改為小寫。"
  },
  {
    "sentenceId": "PARA-0012-S01",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In recent years, more and more companies requires staff needed to wore uniforms at work.",
    "correctedSentence": "In recent years, more and more companies require staff to wear uniforms at work.",
    "categories": [
      "infinitive_or_gerund",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "PLURAL_SUBJECT_VERB",
      "VERB_REQUIRE_NP_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:subject_verb_agreement",
      "coordination",
      "infinitive_to",
      "rule:PLURAL_SUBJECT_VERB",
      "rule:VERB_REQUIRE_NP_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「companies requires」在此應改為「companies require」。companies 是複數主語。一般現在式中，複數主語後面的動詞用原形，所以寫 companies require，不用 companies requires。 「staff needed to wore」在此應改為「staff to wear」。require 表示要求某人做某事時，使用 require + 人 + to + 動詞原形。 require 已經控制後面的不定詞，不能加入 needed； to 後面亦要用原形 wear，不用過去式 wore。"
  },
  {
    "sentenceId": "PARA-0012-S02",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "There are some advantages of a company having a uniform for example customer can quickly locate staff in retail stores and enhanced trust and professionalism.",
    "correctedSentence": "There are some advantages of a company having a uniform policy; for example, customers can quickly locate staff in retail stores, and uniforms enhance trust and professionalism.",
    "categories": [
      "sentence_structure",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "CLAUSE_COORDINATED_MISSING_SUBJECT_FINITE_VERB",
      "LEXICAL_UNIFORM_POLICY_COMPANY_CONTEXT",
      "NOUN_GENERIC_CUSTOMER_PLURAL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:singular_plural",
      "category:word_choice",
      "coordination",
      "modal",
      "quantifier",
      "rule:CLAUSE_COORDINATED_MISSING_SUBJECT_FINITE_VERB",
      "rule:LEXICAL_UNIFORM_POLICY_COMPANY_CONTEXT",
      "rule:NOUN_GENERIC_CUSTOMER_PLURAL",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「for example」在此應改為「policy; for example,」。公司不是「穿上一件校服」，而是實施制服政策，因此按上下文補成 a uniform policy。 前後是兩個獨立內容單位，所以用分號；for example 後面加逗號。若原意真的是公司擁有一件制服，則不應加入 policy。 「customer」在此應改為「customers」。這裡泛指一般顧客，而不是一位特定顧客，所以使用複數 customers。若只談一位已知顧客，則要寫 the customer 或 a customer。 「stores and enhanced」在此應改為「stores, and uniforms enhance」。customers can locate staff 已是完整分句； enhanced 不能在沒有主語的情況下直接與它並列。第二個意思是制服提升信任和專業形象，因此補回主語 uniforms，並用一般現在式 enhance。"
  },
  {
    "sentenceId": "PARA-0012-S03",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In staff opinion, a uniform can doesn’t required a work wardrobe expenses and it can less wear and tear on personal clothes",
    "correctedSentence": "In the staff's opinion, a uniform can reduce expenses for a work wardrobe and wear and tear on personal clothes.",
    "categories": [
      "modal_or_auxiliary",
      "parallelism",
      "possessive",
      "punctuation",
      "singular_plural"
    ],
    "ruleIds": [
      "MODAL_NEGATION_SINGLE_AUXILIARY_BASE_VERB",
      "NOUN_EXPENSES_FOR_WORK_WARDROBE",
      "PARALLEL_SHARED_REDUCE_COORDINATED_OBJECTS",
      "POSSESSIVE_COLLECTIVE_STAFF_OPINION",
      "PUNCT_SENTENCE_FINAL_FULL_STOP"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:parallelism",
      "category:possessive",
      "category:punctuation",
      "category:singular_plural",
      "coordination",
      "modal",
      "rule:MODAL_NEGATION_SINGLE_AUXILIARY_BASE_VERB",
      "rule:NOUN_EXPENSES_FOR_WORK_WARDROBE",
      "rule:PARALLEL_SHARED_REDUCE_COORDINATED_OBJECTS",
      "rule:POSSESSIVE_COLLECTIVE_STAFF_OPINION",
      "rule:PUNCT_SENTENCE_FINAL_FULL_STOP",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「In staff opinion」在此應改為「In the staff's opinion」。固定結構是 in someone 's opinion。這裡的 opinion 屬於 staff，因此使用定冠詞和所有格：in the staff's opinion。也可寫 in the opinion of the staff。 「can doesn’t required」在此應改為「can reduce」。一個動詞組不能同時使用 can 和 doesn't 來控制同一個主要動詞；can 後面亦只能接動詞原形。按上下文，作者想表達制服可減少開支，因此改為 can reduce。 若原意是「不需要另外購買衣服」，另一個正確寫法是 means that staff do not need a separate work wardrobe。 「a work wardrobe expenses」在此應改為「expenses for a work wardrobe」。expenses 是複數名詞，前面不能使用單數冠詞 a。表示某項用途所需的開支，可寫 expenses for + 名詞詞組，所以是 expenses for awork wardrobe。 「and it can less wear and tear」在此應改為「and wear and tear」。reduce 同時控制兩個賓語： expenses 和 wear and tear。 less 是比較限定詞或形容詞，不能在這裡直接充當動詞。公式： reduce A and B。 「personal clothes」在此應改為「personal clothes.」。完整陳述句結束時需要句號。段落換行本身不能取代句末標點。"
  },
  {
    "sentenceId": "PARA-0012-S04",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "To begin with, the advantage is that customers can easily located their staff who are wearing uniforms.",
    "correctedSentence": "To begin with, the advantage is that customers can easily locate staff who are wearing uniforms.",
    "categories": [
      "modal_or_auxiliary",
      "pronoun"
    ],
    "ruleIds": [
      "MODAL_BASE_VERB",
      "PRONOUN_POSSESSIVE_CUSTOMER_STAFF_NONPOSSESSION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:modal_or_auxiliary",
      "category:pronoun",
      "infinitive_to",
      "modal",
      "question_word",
      "rule:MODAL_BASE_VERB",
      "rule:PRONOUN_POSSESSIVE_CUSTOMER_STAFF_NONPOSSESSION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「can easily located」在此應改為「can easily locate」。can 後面直接使用動詞原形，所以寫 can easily locate。 副詞 easily 可以放在情態動詞後、主要動詞前。 「their staff」在此應改為「staff」。their 最自然會指向主語 customers，形成「顧客所擁有的員工」，不符合上下文。若意思是顧客辨認店內員工，直接寫 locate staff。 若指某公司的員工，可寫 locate the company 's staff。"
  },
  {
    "sentenceId": "PARA-0012-S05",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Customers can have a first impression of the business.",
    "correctedSentence": "Customers can have a first impression of the business.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "have_auxiliary",
      "modal"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0012-S06",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A clear illustration, if you enter an international airport with the staff do not wearing a proper uniform, you will think that there are a loss of trusts and professionalism.",
    "correctedSentence": "As a clear illustration, if you enter an international airport where the staff are not wearing a proper uniform, you will think that there is a loss of trust and professionalism.",
    "categories": [
      "countability",
      "modal_or_auxiliary",
      "sentence_structure",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "AUXILIARY_PROGRESSIVE_BE_NOT_ING",
      "CLAUSE_ILLUSTRATION_AS_ADJUNCT",
      "CLAUSE_RELATIVE_LOCATION_WHERE",
      "COUNT_TRUST_ABSTRACT_UNCOUNTABLE",
      "SVA_EXISTENTIAL_THERE_SINGULAR_HEAD_IS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:countability",
      "category:modal_or_auxiliary",
      "category:sentence_structure",
      "category:subject_verb_agreement",
      "conditional",
      "coordination",
      "modal",
      "negation",
      "rule:AUXILIARY_PROGRESSIVE_BE_NOT_ING",
      "rule:CLAUSE_ILLUSTRATION_AS_ADJUNCT",
      "rule:CLAUSE_RELATIVE_LOCATION_WHERE",
      "rule:COUNT_TRUST_ABSTRACT_UNCOUNTABLE",
      "rule:SVA_EXISTENTIAL_THERE_SINGULAR_HEAD_IS",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「A clear illustration」在此應改為「As a clear illustration」。A clear illustration 單獨放在逗號前只是名詞詞組，沒有連接到後面的例子。加入 as 後，它成為句首狀語：As a clear illustr ation,...。更常見的替代寫法是 For example,...。 「with」在此應改為「where」。後面是包含主語和動詞的完整分句，用來描述 airport 裡的情況，因此使用關係副詞 where。 with 後面不能直接接 the staff do... 這種有限分句。 「do not wearing」在此應改為「are not wearing」。現在進行式使用 be + 動詞-ing。 主語 the staff 在本句按複數群體處理，所以寫 are not wearing。do not 後面則必須接原形 wear。 「there are a loss」在此應改為「there is a loss」。存現句的動詞要配合後面的真正主語。a loss 是單數，因此使用 there is，不用 there are。 「trusts」在此應改為「trust」。trust 表示抽象的信任時通常是不可數名詞，所以寫 aloss of trust。 trusts 可以指法律上的信託安排，但不是本句的意思。"
  },
  {
    "sentenceId": "PARA-0012-S07",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "However, it will have more commutations with passengers and staff if they wearing uniforms.",
    "correctedSentence": "However, there will be more communication between passengers and staff if the staff wear uniforms.",
    "categories": [
      "preposition",
      "pronoun",
      "sentence_structure",
      "verb_form_or_tense",
      "word_choice"
    ],
    "ruleIds": [
      "CLAUSE_EXISTENTIAL_THERE_WILL_BE",
      "PREP_COMMUNICATION_BETWEEN_A_AND_B",
      "PRONOUN_AMBIGUOUS_THEY_EXPLICIT_STAFF",
      "TENSE_IF_PRESENT_FINITE_VERB",
      "WORDCHOICE_COMMUNICATION_NOT_COMMUTATION"
    ],
    "structureTags": [
      "category:preposition",
      "category:pronoun",
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "category:word_choice",
      "conditional",
      "coordination",
      "have_auxiliary",
      "modal",
      "rule:CLAUSE_EXISTENTIAL_THERE_WILL_BE",
      "rule:PREP_COMMUNICATION_BETWEEN_A_AND_B",
      "rule:PRONOUN_AMBIGUOUS_THEY_EXPLICIT_STAFF",
      "rule:TENSE_IF_PRESENT_FINITE_VERB",
      "rule:WORDCHOICE_COMMUNICATION_NOT_COMMUTATION",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「it will have」在此應改為「there will be」。表示某事將會存在或發生，用 there will be + 名詞。 it will have 需要一個有明確指涉的主語，並表示該主語擁有某物，不適合本句。 「commutations」在此應改為「communication」。communication 表示人與人之間的溝通，通常作不可數名詞。 commutation 是另一個真實英文詞，可表示減刑、換向或付款轉換，不是本句意思。 「with passengers and staff」在此應改為「between passengers and staff」。表示兩個群體彼此溝通，用 communication between A and B。 communication with passengers 可表示某一方與乘客溝通，但當兩方並列時， between 較準確。 「they」在此應改為「the staff」。前面同時出現 passengers 和 staff，they 可能指任何一方或兩方。由於穿制服的是員工，應明確寫 the staff。 若上下文另有所指，系統應保留原句並要求確認。 「wearing」在此應改為「wear」。if 後面需要一個完整有限分句。主語是 the staff， 所以使用一般現在式 wear。 單獨的 wearing 不能作這個條件分句的謂語。"
  },
  {
    "sentenceId": "PARA-0012-S08",
    "paragraphId": "PARA-0012",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A further dimensions is you will easy to locate the staff of a shops and it will increase companies profits, imaged if you enter a retai shop and no staff wearing uniform, you will need more time to figure out someone looking at a shelf is an employees and it is no good at all.",
    "correctedSentence": "A further dimension is that you will easily locate the staff in a shop, and this will increase companies' profits; imagine entering a retail shop where no staff are wearing a uniform: you will need more time to figure out whether someone looking at a shelf is an employee, and it is no good at all.",
    "categories": [
      "article_or_determiner",
      "infinitive_or_gerund",
      "possessive",
      "preposition",
      "pronoun",
      "punctuation",
      "sentence_structure",
      "singular_plural",
      "spelling_or_spacing",
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "ADVERB_EASILY_MODIFIES_LOCATE",
      "ARTICLE_AN_SINGULAR_COUNT_NOUN",
      "ARTICLE_A_SINGULAR_COUNT_NOUN",
      "CLAUSE_COPULAR_NOUN_THAT_CLAUSE",
      "CLAUSE_EMBEDDED_YES_NO_WHETHER",
      "CLAUSE_NO_STAFF_BE_PROGRESSIVE_ARTICLE",
      "CLAUSE_RELATIVE_LOCATION_WHERE",
      "NOUN_A_SINGULAR_COUNT_NOUN",
      "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "PREP_STAFF_IN_SHOP",
      "PRONOUN_THIS_CLAUSAL_REFERENCE",
      "PUNCT_COLON_EXPLANATORY_MAIN_CLAUSE",
      "PUNCT_COMMA_SPLICE_SEMICOLON",
      "SPELLING_RETAIL",
      "VERB_IMAGINE_GERUND",
      "WORDCHOICE_IMAGINE_NOT_IMAGE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:article_or_determiner",
      "category:infinitive_or_gerund",
      "category:possessive",
      "category:preposition",
      "category:pronoun",
      "category:punctuation",
      "category:sentence_structure",
      "category:singular_plural",
      "category:spelling_or_spacing",
      "category:word_choice",
      "category:word_form",
      "conditional",
      "coordination",
      "infinitive_to",
      "modal",
      "negation",
      "rule:ADVERB_EASILY_MODIFIES_LOCATE",
      "rule:ARTICLE_AN_SINGULAR_COUNT_NOUN",
      "rule:ARTICLE_A_SINGULAR_COUNT_NOUN",
      "rule:CLAUSE_COPULAR_NOUN_THAT_CLAUSE",
      "rule:CLAUSE_EMBEDDED_YES_NO_WHETHER",
      "rule:CLAUSE_NO_STAFF_BE_PROGRESSIVE_ARTICLE",
      "rule:CLAUSE_RELATIVE_LOCATION_WHERE",
      "rule:NOUN_A_SINGULAR_COUNT_NOUN",
      "rule:POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
      "rule:PREP_STAFF_IN_SHOP",
      "rule:PRONOUN_THIS_CLAUSAL_REFERENCE",
      "rule:PUNCT_COLON_EXPLANATORY_MAIN_CLAUSE",
      "rule:PUNCT_COMMA_SPLICE_SEMICOLON",
      "rule:SPELLING_RETAIL",
      "rule:VERB_IMAGINE_GERUND",
      "rule:WORDCHOICE_IMAGINE_NOT_IMAGE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「dimensions」在此應改為「dimension」。a 後面要接單數可數名詞，所以寫 a further dimension。若使用複數，則要刪除 a： further dimensions。 「is」在此應改為「is that」。dimension is 後面要接說明其內容的補語。完整有限分句通常由 that 引出：The dimension is that + 主語 + 動詞。 「easy to」在此應改為「easily」。easy 是形容詞，不能直接修飾動作 locate； 應使用副詞 easily。 此外， will 後面直接接動詞原形，不加 to。 「of」在此應改為「in」。處某間店舖，用 staff in a shop。staff of a company 可表示屬於某公司的員工，但這裡重點是顧客在店內尋找員工。 「shops」在此應改為「shop,」。a 只能接單數可數名詞，所以寫 a shop。複數形式則應寫 shops，並刪除 a。 「it」在此應改為「this」。it 容易被理解為指最近的 shop 或 staff。本句實際指「能迅速找到員工」這個整體情況，因此用 this 指回上一個分句。更明確的寫法是 this ease of identification will increase...。 「companies」在此應改為「companies'」。profits 屬於多間 companies。 規則複數名詞已以 s 結尾，所以在 s 後加撇號： companies ' profits。若只有一間公司，則寫 a company's profits。 「,」在此應改為「;」。前面的陳述句和後面的祈使句 imagine... 都可以獨立成句，不能只用逗號連接。這裡使用分號；句號亦可。 「imaged」在此應改為「imagine」。表示「試想一下」要用動詞 imagine。 image 作動詞可表示為某物成像或想像其圖像，但 imaged 是過去式，不能在這個祈使句位置使用。 「if you enter」在此應改為「entering」。imagine 後面可接動名詞，表示想像某個動作或情境： imagine entering a shop。也可寫 imagine that you enter a shop。 「retai」在此應改為「retail」。正確拼法是 retail。這是拼字問題，不是句法規則。 「and」在此應改為「where」。後面的內容描述 retail shop 內部的情況，因此用 where 引出地點關係分句。and no staff wearing... 缺乏有限動詞，亦不能清楚修飾 shop。 「wearing uniform」在此應改為「are wearing a uniform」。關係分句需要有限動詞，所以"
  },
  {
    "sentenceId": "PARA-0013-S01",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The pie chart illustrates the age of residents of Yemen and Italy in 2000 and projections for 2050.",
    "correctedSentence": "The pie chart illustrates the age distributions of the populations of Yemen and Italy in 2000 and the projected distributions for 2050.",
    "categories": [
      "parallelism",
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_CHART_AGE_DISTRIBUTION_POPULATION",
      "PARALLEL_CHART_ACTUAL_AND_PROJECTED_DISTRIBUTIONS"
    ],
    "structureTags": [
      "category:parallelism",
      "category:preposition",
      "coordination",
      "rule:COLLOC_CHART_AGE_DISTRIBUTION_POPULATION",
      "rule:PARALLEL_CHART_ACTUAL_AND_PROJECTED_DISTRIBUTIONS"
    ],
    "explanationZhHant": "「the age of residents」在此應改為「the age distributions of the populations」。圖表比較的是人口中不同年齡組別所佔的比例，因此通常寫 age distribution of the population，而不是只寫個別居民的 age。原句並非完全不能理解，但目標寫法更準確地描述統計內容。 「and projections for 2050」在此應改為「and the projected distributions for 2050」。前面描述的是 2000 年的年齡分布，後面亦應使用平行名詞詞組表示 2050 年的預測分布。 projected 是形容詞，修飾 distributions。若圖表實際展示其他預測數據，中心名詞須按原圖調整。"
  },
  {
    "sentenceId": "PARA-0013-S02",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Overall, Yemen residents is younger than Italy in 2000, this pattern keep diversifying to 2050.",
    "correctedSentence": "Overall, Yemen's population was younger than Italy's in 2000, and this contrast is expected to become more pronounced by 2050.",
    "categories": [
      "comparison",
      "preposition",
      "punctuation",
      "singular_plural",
      "verb_form_or_tense",
      "word_choice"
    ],
    "ruleIds": [
      "COMP_POPULATION_POSSESSIVE_ELLIPSIS",
      "NOUN_COUNTRY_POPULATION_POSSESSIVE",
      "PREP_BY_FUTURE_DEADLINE",
      "PUNCT_COMMA_SPLICE_COORDINATOR_AND",
      "TENSE_PAST_DATA_YEAR_WAS",
      "TENSE_PROJECTION_EXPECTED_TO_BECOME",
      "WORDCHOICE_CONTRAST_NOT_PATTERN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:preposition",
      "category:punctuation",
      "category:singular_plural",
      "category:verb_form_or_tense",
      "category:word_choice",
      "rule:COMP_POPULATION_POSSESSIVE_ELLIPSIS",
      "rule:NOUN_COUNTRY_POPULATION_POSSESSIVE",
      "rule:PREP_BY_FUTURE_DEADLINE",
      "rule:PUNCT_COMMA_SPLICE_COORDINATOR_AND",
      "rule:TENSE_PAST_DATA_YEAR_WAS",
      "rule:TENSE_PROJECTION_EXPECTED_TO_BECOME",
      "rule:WORDCHOICE_CONTRAST_NOT_PATTERN",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Yemen residents」在此應改為「Yemen's population」。比較國家的人口結構時，可用 country's population。Yemen residents 缺乏標準的國籍形容詞或所有格形式。其他正確寫法包括 Yemeni residents 和 the residents of Yemen。 「is」在此應改為「was」。句子明確描述 2000 年的情況，因此使用過去式 was。後面的 2050 年預測則使用將來或預測結構。 「Italy」在此應改為「Italy's」。前面比較的是 Yemen's population，所以後面也要比較 Italy 的人口，而不是把人口直接與國家比較。 Italy's 省略了重複的 population。公式： A's population is younger than B's. 「this」在此應改為「and this」。前後都是完整主句，不能只用逗號連接。加入 and 後，兩個主句形成正確的並列結構。分號或句號也是可接受替代。 「pattern」在此應改為「contrast」。本句描述的是兩國人口年齡結構之間的差異，因此 contrast 較能準確指回前面的比較。 pattern 本身不是文法錯誤，但未清楚表示哪一種模式正在改變。 「keep diversifying」在此應改為「is expected to become more pronounced」。diversify 通常表示種類變得更多，不適合直接描述兩國差異擴大。 2050 年亦是預測數據，因此使用 is expected to + 動詞原形。若原意只是差異持續存在，也可寫 is expected to continue。 「to 2050」在此應改為「by 2050」。表示某種狀況在 2050 年之前或到該年時形成，用 by 2050。to 2050 通常需要由 from 配對，如 from 2000 to 2050。"
  },
  {
    "sentenceId": "PARA-0013-S03",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "However, both country are projected to aged; the proportion of children will decline, while the older groups, in Italy, will become lager.",
    "correctedSentence": "However, both countries are projected to age; the proportion of children will decline, while the older age group in Italy will become larger.",
    "categories": [
      "infinitive_or_gerund",
      "punctuation",
      "singular_plural",
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "NOUN_BOTH_PLURAL_COUNT_NOUN",
      "NOUN_SINGLE_OLDER_AGE_GROUP",
      "PUNCT_RESTRICTIVE_PREPOSITIONAL_PHRASE_NO_PARENTHESES",
      "SPELLING_LARGER",
      "TO_BASE_VERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "category:punctuation",
      "category:singular_plural",
      "category:spelling_or_spacing",
      "infinitive_to",
      "modal",
      "rule:NOUN_BOTH_PLURAL_COUNT_NOUN",
      "rule:NOUN_SINGLE_OLDER_AGE_GROUP",
      "rule:PUNCT_RESTRICTIVE_PREPOSITIONAL_PHRASE_NO_PARENTHESES",
      "rule:SPELLING_LARGER",
      "rule:TO_BASE_VERB",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「country」在此應改為「countries」。both 表示兩者，後面接複數可數名詞，所以寫 both countries。 「aged」在此應改為「age」。to 不定詞後面使用動詞原形。這裡 age 作動詞，表示人口結構逐漸老化，所以寫 projected to age。 「groups,」在此應改為「age group」。根據本段列出的三個年齡組別，Italy 的較年長組別似乎只指 60 歲或以上的一組，因此使用單數 older age group。 若原圖真的把長者細分成多組，複數則可能正確。 「Italy,」在此應改為「Italy」。in Italy 用來說明是哪一個國家的較年長組別，是必要的限定資料，不應用兩個逗號把它當作可刪除的插入語。 「lager」在此應改為「larger」。表示比例較大，要寫 larger。lager 是一種啤酒，屬於另一個真實英文詞。"
  },
  {
    "sentenceId": "PARA-0013-S04",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In Yemen, the population of 0-14 years old is almost one-half, got 50.1%, slightly more than 15-59 years old 46.3%.",
    "correctedSentence": "In Yemen, people aged 0–14 accounted for 50.1% of the population, slightly higher than the 46.3% recorded for those aged 15–59.",
    "categories": [
      "comparison",
      "preposition",
      "word_choice"
    ],
    "ruleIds": [
      "AGE_PEOPLE_AGED_RANGE",
      "COLLOC_ACCOUNT_FOR_PERCENTAGE",
      "COMP_FIGURE_FOR_GROUP",
      "COMP_PERCENTAGE_HIGHER_THAN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:preposition",
      "category:word_choice",
      "rule:AGE_PEOPLE_AGED_RANGE",
      "rule:COLLOC_ACCOUNT_FOR_PERCENTAGE",
      "rule:COMP_FIGURE_FOR_GROUP",
      "rule:COMP_PERCENTAGE_HIGHER_THAN"
    ],
    "explanationZhHant": "「the population of 0-14 years old」在此應改為「people aged 0–14」。表示某個年齡範圍內的人，可用 people aged + 年齡範圍。 years old 通常放在明確年齡後作表語，例如 They are 14 years old，不能直接寫 population of 0–14 years old。 「is almost one-half, got 50.1%」在此應改為「accounted for 50.1% of the population」。圖表寫作中，表示某組別佔整體某個百分比，可用 account for + 百分比 + of the total/population。 2000 年是過去數據，所以用 accounted for。 got 50.1% 不適合描述人口比例。 「more than」在此應改為「higher than」。比較數字、比例或百分比時，通常用 higher than。 more than 並非必然錯誤，但更常表示數量超過某個數值， 而不是比較兩個比例。 「15-59 years old 46.3%」在此應改為「the 46.3% recorded for those aged 15–59」。higher than 後面需要明確的比較對象。目標句先寫百分比，再用 recorded for those aged 15–59 說明該數字屬於哪個組別。"
  },
  {
    "sentenceId": "PARA-0013-S05",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "By 2050, this trend will be reversed.",
    "correctedSentence": "By 2050, this trend will be reversed.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary",
      "modal",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0013-S06",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The 15-59 age group will exceed 0-14 years old to 57.3%.",
    "correctedSentence": "The 15–59 age group will exceed the 0–14 age group and rise to 57.3%.",
    "categories": [
      "other_grammar",
      "word_choice"
    ],
    "ruleIds": [
      "AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
      "VERB_EXCEED_OBJECT_AND_RISE_TO_PERCENT"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:word_choice",
      "modal",
      "rule:AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
      "rule:VERB_EXCEED_OBJECT_AND_RISE_TO_PERCENT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「15-59 age group will exceed 0-14 years old」在此應改為「15–59 age group will exceed the 0–14 age group」。年齡範圍放在 age group 前作修飾語時，不使用 years old。公式：the 0–14 age group。 對照： children who are 14 years old。 「to 57.3%」在此應改為「and rise to 57.3%」。exceed 是及物動詞，直接接被超越的對象： exceed the 0–14 age group。 表示比例上升至某個終點，則用另一個動詞 rise to 57.3%。 不能把兩個結構混合成 exceed X to 57.3%。"
  },
  {
    "sentenceId": "PARA-0013-S07",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The elderly population will remain comparatively small, though it is expected to increase from 3.6% to 5.7%.",
    "correctedSentence": "The elderly population will remain comparatively small, though it is expected to increase from 3.6% to 5.7%.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "be_auxiliary",
      "infinitive_to",
      "modal",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0013-S08",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In Italy, the 15-59 years old age group keep being the largest slice from 2000 to 2050.",
    "correctedSentence": "In Italy, the 15–59 age group is expected to remain the largest segment in both 2000 and 2050.",
    "categories": [
      "preposition",
      "verb_form_or_tense",
      "word_choice"
    ],
    "ruleIds": [
      "AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
      "COLLOC_CHART_SEGMENT_NOT_SLICE",
      "TENSE_CHART_EXPECTED_TO_REMAIN",
      "TIME_CHART_TWO_SNAPSHOTS_IN_BOTH_YEARS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "category:verb_form_or_tense",
      "category:word_choice",
      "rule:AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
      "rule:COLLOC_CHART_SEGMENT_NOT_SLICE",
      "rule:TENSE_CHART_EXPECTED_TO_REMAIN",
      "rule:TIME_CHART_TWO_SNAPSHOTS_IN_BOTH_YEARS",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「15-59 years old age group」在此應改為「15–59 age group」。年齡範圍已經修飾 age group， 所以刪除 years old。這是 S06 同一規則在不同國家和句子位置的轉移案例。 「keep being」在此應改為「is expected to remain」。主語 age group 是單數，因此原本至少要寫 keeps； 但本句同時描述 2050 年的預測，正式圖表寫作更適合使用 is expected to remain。keeps being 在某些一般語境中可以成立，但不適合這個預測框架。 「slice」在此應改為「segment」。slice 可以描述圓形圖中的一塊，因此並非文法錯誤；不過正式報告通常用 segment、 category 或 age group。 這項修改屬圖表語域建議。 「from 2000 to 2050」在此應改為「in both 2000 and 2050」。圖表只提供 2000 和 2050 兩個時間點時， in both 2000 and 2050 不會暗示中間每一年都有數據。若圖表真的展示連續趨勢， from 2000 to 2050 可以保留。"
  },
  {
    "sentenceId": "PARA-0013-S09",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Although it predicted to fall from 61.6% to 46.2%.",
    "correctedSentence": "It is predicted to fall from 61.6% to 46.2%.",
    "categories": [
      "sentence_structure",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "CLAUSE_SUBORDINATOR_FRAGMENT_REMOVE_ALTHOUGH",
      "PASSIVE_PREDICT_BE_PARTICIPLE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "infinitive_to",
      "rule:CLAUSE_SUBORDINATOR_FRAGMENT_REMOVE_ALTHOUGH",
      "rule:PASSIVE_PREDICT_BE_PARTICIPLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Although it」在此應改為「It」。although 會把後面的內容變成從屬分句，因此不能單獨成句。最小修正是刪除 Although。另一個正確方案是把它接回上一句：..., although it is predicted to fall...。 「predicted」在此應改為「is predicted」。這個年齡組是「被預測」下降，因此使用被動語態 be + 過去分詞：is predicted。"
  },
  {
    "sentenceId": "PARA-0013-S10",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The elderly group almost doubled from 24.1% to 42.3%.",
    "correctedSentence": "The proportion of elderly residents is projected to almost double from 24.1% to 42.3%.",
    "categories": [
      "singular_plural",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "NOUN_CHART_PROPORTION_OF_ELDERLY_RESIDENTS",
      "TENSE_PROJECTION_IS_PROJECTED_TO_DOUBLE"
    ],
    "structureTags": [
      "category:singular_plural",
      "category:verb_form_or_tense",
      "rule:NOUN_CHART_PROPORTION_OF_ELDERLY_RESIDENTS",
      "rule:TENSE_PROJECTION_IS_PROJECTED_TO_DOUBLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「The elderly group」在此應改為「The proportion of elderly residents」。百分比由 24.1% 變成 42.3%， 真正變化的是長者所佔的比例，而不是長者這個群體本身「加倍」。原寫法可理解，但目標寫法在統計上更精確。 「almost doubled」在此應改為「is projected to almost double」。42.3% 是 2050 年的預測值，因此不能使用表示已完成過去事件的 doubled。使用 is projected to + 動詞原形表達預測。"
  },
  {
    "sentenceId": "PARA-0013-S11",
    "paragraphId": "PARA-0013",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The youngster group has nearly remain unchanged through the prediction, just shrink slightly from 14.3% to 11.5%.",
    "correctedSentence": "The youngest age group is projected to remain relatively stable over the period, shrinking only slightly from 14.3% to 11.5%.",
    "categories": [
      "infinitive_or_gerund",
      "preposition",
      "verb_form_or_tense",
      "word_form"
    ],
    "ruleIds": [
      "PARTICIPLE_SUPPLEMENTARY_SHRINKING",
      "PREP_OVER_PERIOD",
      "TENSE_PROJECTION_REMAIN_STABLE",
      "WORDFORM_SUPERLATIVE_YOUNGEST_AGE_GROUP"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:preposition",
      "category:verb_form_or_tense",
      "category:word_form",
      "have_auxiliary",
      "rule:PARTICIPLE_SUPPLEMENTARY_SHRINKING",
      "rule:PREP_OVER_PERIOD",
      "rule:TENSE_PROJECTION_REMAIN_STABLE",
      "rule:WORDFORM_SUPERLATIVE_YOUNGEST_AGE_GROUP",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「youngster」在此應改為「youngest age」。youngster 指一名年輕人，不能自然地表示三個年齡分類中最年輕的一組。使用最高級形容詞 youngest 修飾 age group。 「has nearly remain unchanged」在此應改為「is projected to remain relatively stable」。has 後面本應使用過去分詞 remained，但本句包含 2050 年預測，因此現在完成式亦不合適。目標句使用 is projected to remain。 relatively stable 也容許比例有輕微變化。 「through the prediction」在此應改為「over the period」。prediction 是預測內容，不是一段時間。表示數據在整個時間範圍內維持穩定，可用 over the period 或 throughout the period。 「just shrink」在此應改為「shrinking only」。逗號後面的部分補充說明「保持相對穩定」的具體變化，可用現在分詞 shrinking。 only slightly 修飾縮減程度。另一個正確寫法是 and is expected to shrink only slightly。"
  },
  {
    "sentenceId": "PARA-0014-S01",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The museum launched a digital archive for photographs, diaries and oral histories.",
    "correctedSentence": "The museum launched a digital archive for photographs, diaries and oral histories.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "coordination",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0014-S02",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Not until the exhibition opened residents realised how much history remained unrecorded.",
    "correctedSentence": "Not until the exhibition opened did residents realise how much history remained unrecorded.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_NOT_UNTIL_INITIAL_MAIN_INVERSION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "negation",
      "quantifier",
      "question_word",
      "rule:CLAUSE_NOT_UNTIL_INITIAL_MAIN_INVERSION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Not until the exhibition opened residents realised」在此應改為「Not until the exhibition opened did residents realise」。Not until + 分句放在句首時，後面的主句要使用助動詞倒裝： did + 主語 + 動詞原形。若放在句尾，則不用倒裝： Residents did not realise it until the exhibition opened."
  },
  {
    "sentenceId": "PARA-0014-S03",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Rarely the museum had received donations, and volunteers worked hardly to catalogue them.",
    "correctedSentence": "Rarely had the museum received donations, and volunteers worked hard to catalogue them.",
    "categories": [
      "sentence_structure",
      "word_form"
    ],
    "ruleIds": [
      "ADVERB_HARD_NOT_HARDLY_EFFORT",
      "CLAUSE_RARELY_INITIAL_PAST_PERFECT_INVERSION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:word_form",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "rule:ADVERB_HARD_NOT_HARDLY_EFFORT",
      "rule:CLAUSE_RARELY_INITIAL_PAST_PERFECT_INVERSION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Rarely the museum had received」在此應改為「Rarely had the museum received」。Rarely 等具否定或限制意思的副詞放在句首時，要把助動詞放到主語前。這裡原本是過去完成式，所以寫 Rarely had the museum received...。 「worked hardly」在此應改為「worked hard」。hard 可作副詞，表示努力地； hardly 表示「幾乎不」。因此 worked hardly 會變成幾乎沒有工作，不符合原意。"
  },
  {
    "sentenceId": "PARA-0014-S04",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Every file needed checking, but staff had better to confirm whether it's label matched the box.",
    "correctedSentence": "Every file needed checking, but staff had better confirm whether its label matched the box.",
    "categories": [
      "modal_or_auxiliary",
      "possessive"
    ],
    "ruleIds": [
      "MODAL_HAD_BETTER_BASE_VERB",
      "POSSESSIVE_ITS_NO_APOSTROPHE"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "category:possessive",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "rule:MODAL_HAD_BETTER_BASE_VERB",
      "rule:POSSESSIVE_ITS_NO_APOSTROPHE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「had better to confirm」在此應改為「had better confirm」。had better 後面直接使用動詞原形，不加 to。公式： had better + 動詞原形。 「it's label」在此應改為「its label」。its 是所有格限定詞，表示「它的」； it's 是 it is 或 it has 的縮寫。名詞 label 前要用 its。"
  },
  {
    "sentenceId": "PARA-0014-S05",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Several records need to digitise, while two films are worth to restore.",
    "correctedSentence": "Several records need to be digitised, while two films are worth restoring.",
    "categories": [
      "infinitive_or_gerund",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_WORTH_GERUND",
      "INFINITIVE_NEED_PASSIVE_TO_BE_PARTICIPLE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:infinitive_or_gerund",
      "category:word_form",
      "infinitive_to",
      "quantifier",
      "rule:ADJ_WORTH_GERUND",
      "rule:INFINITIVE_NEED_PASSIVE_TO_BE_PARTICIPLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「records need to digitise」在此應改為「records need to be digitised」。records 是被數碼化的事物，所以要用被動不定詞： need to be + 過去分詞。另一個正確寫法是 The staff need to digitise the records. 「worth to restore」在此應改為「worth restoring」。worth 後面接名詞或動名詞，不接 to 不定詞。公式：be worth + 動名詞。也可寫 It is worthwhile to restore the films."
  },
  {
    "sentenceId": "PARA-0014-S06",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The museum had a technician to repair the scanner and got a volunteer install software.",
    "correctedSentence": "The museum had a technician repair the scanner and got a volunteer to install software.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "CAUSATIVE_GET_NP_TO_INFINITIVE",
      "CAUSATIVE_HAVE_NP_BASE_VERB"
    ],
    "structureTags": [
      "category:other_grammar",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "rule:CAUSATIVE_GET_NP_TO_INFINITIVE",
      "rule:CAUSATIVE_HAVE_NP_BASE_VERB"
    ],
    "explanationZhHant": "「had a technician to repair」在此應改為「had a technician repair」。主動使役結構使用 have + 人 + 動詞原形，所以不加 to。 若重點是物件接受維修，可寫 had the scanner repaired。 「got a volunteer install」在此應改為「got a volunteer to install」。get 表示說服或安排某人做事時，使用 get + 人 + to + 動詞原形。 它與 have + 人 + 動詞原形的結構不同。"
  },
  {
    "sentenceId": "PARA-0014-S07",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Staff needn't stayed late, although they stayed until midnight.",
    "correctedSentence": "Staff needn't have stayed late, although they stayed until midnight.",
    "categories": [
      "modal_or_auxiliary"
    ],
    "ruleIds": [
      "MODAL_NEEDNT_HAVE_PAST_PARTICIPLE"
    ],
    "structureTags": [
      "category:modal_or_auxiliary",
      "rule:MODAL_NEEDNT_HAVE_PAST_PARTICIPLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「needn't stayed」在此應改為「needn't have stayed」。表示某人實際做了某件事，但事後發現沒有必要，用 needn't have + 過去分詞。 didn't need to stay 可能表示根本沒有留下，意思不同。"
  },
  {
    "sentenceId": "PARA-0014-S08",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Under no circumstances visitors should remove originals, nor they may photograph private documents.",
    "correctedSentence": "Under no circumstances should visitors remove originals, nor may they photograph private documents.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_NOR_AUXILIARY_INVERSION",
      "CLAUSE_UNDER_NO_CIRCUMSTANCES_INVERSION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "modal",
      "negation",
      "rule:CLAUSE_NOR_AUXILIARY_INVERSION",
      "rule:CLAUSE_UNDER_NO_CIRCUMSTANCES_INVERSION"
    ],
    "explanationZhHant": "「Under no circumstances visitors should remove」在此應改為「Under no circumstances should visitors remove」。Under no circumstances 放在句首時，主句使用助動詞倒裝： should + 主語 + 動詞原形。 「nor they may photograph」在此應改為「nor may they photograph」。nor 接續另一個否定分句時，通常使用助動詞倒裝：nor + 助動詞 + 主語。"
  },
  {
    "sentenceId": "PARA-0014-S09",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Guests borrowed devices; the curator told them to turn off them and parents to look their children after.",
    "correctedSentence": "Guests borrowed devices; the curator told them to turn them off and parents to look after their children.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "PHRASAL_LOOK_AFTER_INSEPARABLE",
      "PHRASAL_SEPARABLE_PRONOUN_BETWEEN_VERB_PARTICLE"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "infinitive_to",
      "rule:PHRASAL_LOOK_AFTER_INSEPARABLE",
      "rule:PHRASAL_SEPARABLE_PRONOUN_BETWEEN_VERB_PARTICLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「turn off them」在此應改為「turn them off」。turn off 是可分片語動詞。賓語是代名詞時，代名詞必須放在動詞和粒子之間： turn them off。完整名詞則兩種位置都可： turn off the devices／turn the devices off。 「look their children after」在此應改為「look after their children」。look after 是不可分的介詞片語動詞，賓語要放在整個結構後面。不能把 their children 插入 look 和 after 之間。"
  },
  {
    "sentenceId": "PARA-0014-S10",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "During May, the museum received 312 submissions from schools, shops and residents.",
    "correctedSentence": "During May, the museum received 312 submissions from schools, shops and residents.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "coordination",
      "modal",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0014-S11",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A number of applications was incomplete, whereas the number of rejections were small.",
    "correctedSentence": "A number of applications were incomplete, whereas the number of rejections was small.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_A_NUMBER_OF_PLURAL_VERB",
      "SVA_THE_NUMBER_OF_SINGULAR_VERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "rule:SVA_A_NUMBER_OF_PLURAL_VERB",
      "rule:SVA_THE_NUMBER_OF_SINGULAR_VERB"
    ],
    "explanationZhHant": "「A number of applications was」在此應改為「A number of applications were」。a number of + 複數名詞表示若干個，意思接近 several， 因此使用複數動詞。不要與 the number of 混淆。 「the number of rejections were」在此應改為「the number of rejections was」。the number of... 的中心詞是單數 number，所以用單數動詞 was。後面的複數 rejections 不控制動詞。"
  },
  {
    "sentenceId": "PARA-0014-S12",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "More than one volunteers were uncertain, and Lena is one of those assistants who works late answering questions.",
    "correctedSentence": "More than one volunteer was uncertain, and Lena is one of those assistants who work late answering questions.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_MORE_THAN_ONE_SINGULAR_NOUN_VERB",
      "SVA_ONE_OF_THOSE_WHO_PLURAL_RELATIVE_VERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "coordination",
      "question_word",
      "rule:SVA_MORE_THAN_ONE_SINGULAR_NOUN_VERB",
      "rule:SVA_ONE_OF_THOSE_WHO_PLURAL_RELATIVE_VERB",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「More than one volunteers were」在此應改為「More than one volunteer was」。固定結構 more than one 後面使用單數可數名詞，並通常配合單數動詞：more than one volunteer was...。 「one of those assistants who works」在此應改為「one of those assistants who work」。關係代名詞 who 的先行詞是複數 those assistants，所以關係分句用 work。Lena 是這群會留至很晚工作的助理之一。"
  },
  {
    "sentenceId": "PARA-0014-S13",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The only coordinator who know encryption, together with two interns, have prepared a manual.",
    "correctedSentence": "The only coordinator who knows encryption, together with two interns, has prepared a manual.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_RELATIVE_SINGULAR_ANTECEDENT_S_FORM",
      "SVA_TOGETHER_WITH_HEAD_SUBJECT"
    ],
    "structureTags": [
      "category:subject_verb_agreement",
      "have_auxiliary",
      "question_word",
      "rule:SVA_RELATIVE_SINGULAR_ANTECEDENT_S_FORM",
      "rule:SVA_TOGETHER_WITH_HEAD_SUBJECT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「coordinator who know」在此應改為「coordinator who knows」。who 指回單數 coordinator，因此一般現在式用第三身單數 knows。 「, together with two interns, have prepared」在此應改為「, together with two interns, has prepared」。together with two interns 是附加資料，不會把主語變成複數。真正的中心主語是單數 coordinator，所以用 has。"
  },
  {
    "sentenceId": "PARA-0014-S14",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Either the interns or the archivist are expected to answer questions.",
    "correctedSentence": "Either the interns or the archivist is expected to answer questions.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_EITHER_OR_NEAREST_SUBJECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "coordination",
      "infinitive_to",
      "rule:SVA_EITHER_OR_NEAREST_SUBJECT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Either the interns or the archivist are」在此應改為「Either the interns or the archivist is」。在 either A or B 結構中，動詞通常配合較接近它的主語。最近的是單數 archivist，所以用 is。為避免不自然，也可改寫為 Either the archivist or the interns are...。"
  },
  {
    "sentenceId": "PARA-0014-S15",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Ten kilometres are too far; three hundred pounds were enough for transport.",
    "correctedSentence": "Ten kilometres is too far; three hundred pounds was enough for transport.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_MEASURE_DISTANCE_SINGULAR",
      "SVA_MEASURE_MONEY_AMOUNT_SINGULAR"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "rule:SVA_MEASURE_DISTANCE_SINGULAR",
      "rule:SVA_MEASURE_MONEY_AMOUNT_SINGULAR",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Ten kilometres are too far」在此應改為「Ten kilometres is too far」。一段距離被視為一個整體量度時，使用單數動詞。比較： Ten kilometres of roads were repaired 中，主語是複數道路。 「three hundred pounds were enough」在此應改為「three hundred pounds was enough」。一筆金額被視為一個整體數量時，用單數動詞 was。若指多枚實體硬幣，複數動詞才可能合適。"
  },
  {
    "sentenceId": "PARA-0014-S16",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The news were welcomed; two-thirds of the equipment were bought, while half of the volunteers was recruited.",
    "correctedSentence": "The news was welcomed; two-thirds of the equipment was bought, while half of the volunteers were recruited.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_FRACTION_PLURAL_HEAD_PLURAL",
      "SVA_FRACTION_UNCOUNTABLE_HEAD_SINGULAR",
      "SVA_NEWS_SINGULAR"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "rule:SVA_FRACTION_PLURAL_HEAD_PLURAL",
      "rule:SVA_FRACTION_UNCOUNTABLE_HEAD_SINGULAR",
      "rule:SVA_NEWS_SINGULAR",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「The news were welcomed」在此應改為「The news was welcomed」。news 雖然以 s 結尾，但在標準英文中是不可數單數名詞，因此配合 was。 「two-thirds of the equipment were」在此應改為「two-thirds of the equipment was」。分數結構的動詞配合 of 後面的名詞。 equipment 是不可數單數，所以用 was。 「half of the volunteers was」在此應改為「half of the volunteers were」。volunteers 是複數，因此 half of the volunteers 配合複數動詞 were。"
  },
  {
    "sentenceId": "PARA-0014-S17",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The scanner is twice more efficient than its predecessor, and its output is superior than the earlier model.",
    "correctedSentence": "The scanner is twice as efficient as its predecessor, and its output is superior to that of the earlier model.",
    "categories": [
      "comparison"
    ],
    "ruleIds": [
      "COMP_ELLIPSIS_THAT_OF_SINGULAR_NOUN",
      "COMP_MULTIPLIER_TWICE_AS_ADJECTIVE_AS",
      "COMP_SUPERIOR_TO"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "coordination",
      "rule:COMP_ELLIPSIS_THAT_OF_SINGULAR_NOUN",
      "rule:COMP_MULTIPLIER_TWICE_AS_ADJECTIVE_AS",
      "rule:COMP_SUPERIOR_TO"
    ],
    "explanationZhHant": "「twice more efficient than」在此應改為「twice as efficient as」。表示倍數比較時，標準結構是 twice as + 形容詞 + as。twice more efficient than 容易造成倍數意思不清。 「superior than」在此應改為「superior to」。superior 的比較搭配使用 to，不用 than。相同規則亦常見於 inferior to、senior to。 「the earlier model」在此應改為「that of the earlier model」。要比較的是兩部掃描器的 output， 而不是把 output 與 model 比較。that 代替已出現的單數名詞 output： that of the earlier model。"
  },
  {
    "sentenceId": "PARA-0014-S18",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The storage system is the same with the national archive's, but its fee is too much expensive.",
    "correctedSentence": "The storage system is the same as the national archive's, but its fee is much too expensive.",
    "categories": [
      "comparison"
    ],
    "ruleIds": [
      "COMP_SAME_AS",
      "DEGREE_MUCH_TOO_ADJECTIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "coordination",
      "quantifier",
      "rule:COMP_SAME_AS",
      "rule:DEGREE_MUCH_TOO_ADJECTIVE"
    ],
    "explanationZhHant": "「the same with」在此應改為「the same as」。表示兩者相同時，使用 the same as。with 可出現在 share something with 等其他結構，但不適用於這個比較框架。 「too much expensive」在此應改為「much too expensive」。too 修飾形容詞 expensive； much 再加強 too，所以詞序是 much too + 形容詞。too much 則通常修飾不可數名詞，例如 too much money。"
  },
  {
    "sentenceId": "PARA-0014-S19",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "It is high time the council provides funding, and residents wish it approved the second phase last year.",
    "correctedSentence": "It is high time the council provided funding, and residents wish it had approved the second phase last year.",
    "categories": [
      "modal_or_auxiliary"
    ],
    "ruleIds": [
      "MOOD_HIGH_TIME_PAST",
      "MOOD_WISH_PAST_REGRET_PAST_PERFECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:modal_or_auxiliary",
      "coordination",
      "rule:MOOD_HIGH_TIME_PAST",
      "rule:MOOD_WISH_PAST_REGRET_PAST_PERFECT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「provides」在此應改為「provided」。It is high time + 主語 + 過去式表示某事早就應該發生。這個過去式表達的是現在的迫切需要，不是過去時間。 「it」在此應改為「it had」。對已經沒有發生的過去事情表示遺憾，用 wish + 主語 + had + 過去分詞。"
  },
  {
    "sentenceId": "PARA-0014-S20",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "If only the finance team released the money earlier, workshops would not have been delayed.",
    "correctedSentence": "If only the finance team had released the money earlier, workshops would not have been delayed.",
    "categories": [
      "modal_or_auxiliary"
    ],
    "ruleIds": [
      "MOOD_IF_ONLY_PAST_REGRET_PAST_PERFECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:modal_or_auxiliary",
      "conditional",
      "have_auxiliary",
      "modal",
      "negation",
      "rule:MOOD_IF_ONLY_PAST_REGRET_PAST_PERFECT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「If only the finance team released」在此應改為「If only the finance team had released」。If only 表示對過去事實的遺憾時，使用過去完成式。結果分句的 would not have been delayed 亦顯示這是過去反事實情況。"
  },
  {
    "sentenceId": "PARA-0014-S21",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Were it not for donations, the archive will close next winter.",
    "correctedSentence": "Were it not for donations, the archive would close next winter.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CONDITIONAL_INVERTED_WERE_WOULD"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "modal",
      "negation",
      "rule:CONDITIONAL_INVERTED_WERE_WOULD"
    ],
    "explanationZhHant": "「Were it not for donations, the archive will close」在此應改為「Were it not for donations, the archive would close」。Were it not for... 相當於 If it were not for...，是現在或未來的反事實條件，因此結果部分用 would + 動詞原形。"
  },
  {
    "sentenceId": "PARA-0014-S22",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Should any donor will object, the museum will remove the files.",
    "correctedSentence": "Should any donor object, the museum will remove the files.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CONDITIONAL_INVERTED_SHOULD_BASE_VERB"
    ],
    "structureTags": [
      "category:sentence_structure",
      "modal",
      "rule:CONDITIONAL_INVERTED_SHOULD_BASE_VERB"
    ],
    "explanationZhHant": "「Should any donor will object」在此應改為「Should any donor object」。Should + 主語 + 動詞原形是正式的倒裝條件句，相當於 If any donor should object。 should 後面不能再加入 will。"
  },
  {
    "sentenceId": "PARA-0014-S23",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Unless the server does not fail, staff will keep an offline copy in case the database will become unavailable.",
    "correctedSentence": "Unless the server fails, staff will keep an offline copy in case the database becomes unavailable.",
    "categories": [
      "conjunction",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_IN_CASE_FUTURE_PRESENT",
      "CONJ_UNLESS_NO_REDUNDANT_NEGATION"
    ],
    "structureTags": [
      "category:conjunction",
      "category:sentence_structure",
      "modal",
      "negation",
      "rule:CLAUSE_IN_CASE_FUTURE_PRESENT",
      "rule:CONJ_UNLESS_NO_REDUNDANT_NEGATION"
    ],
    "explanationZhHant": "「Unless the server does not fail」在此應改為「Unless the server fails」。unless 本身已表示「如果不」，一般不再加入否定詞。unless it fails 即「除非它發生故障」。只有在刻意表達另一層否定意思時才可能保留 not。 「in case the database will become unavailable」在此應改為「in case the database becomes unavailable」。in case 引出的未來可能情況通常用一般現在式，不用 will。主句可保留將來式。"
  },
  {
    "sentenceId": "PARA-0014-S24",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The extension depends on if the museum can prove its value.",
    "correctedSentence": "The extension depends on whether the museum can prove its value.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_PREPOSITION_WHETHER_NOT_IF"
    ],
    "structureTags": [
      "category:sentence_structure",
      "conditional",
      "modal",
      "rule:CLAUSE_PREPOSITION_WHETHER_NOT_IF"
    ],
    "explanationZhHant": "「depends on if」在此應改為「depends on whether」。疑問分句直接放在介詞 on 後面時，標準寫法使用 whether。if 一般不能直接跟在介詞後。"
  },
  {
    "sentenceId": "PARA-0014-S25",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The reason why officials remain cautious is because no long-term budget exists.",
    "correctedSentence": "The reason why officials remain cautious is that no long-term budget exists.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_REASON_WHY_IS_THAT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "negation",
      "question_word",
      "rule:CLAUSE_REASON_WHY_IS_THAT"
    ],
    "explanationZhHant": "「is because」在此應改為「is that」。正式標準結構是 The reason why... is that + 分句。because 本身表示原因，在 reason is because 中形成重複。非正式英文偶爾可見原寫法，因此新規則宜先設為 suggestion-only。"
  },
  {
    "sentenceId": "PARA-0014-S26",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "It was not until auditors finished when the council released payment.",
    "correctedSentence": "It was not until auditors finished that the council released payment.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLEFT_IT_WAS_NOT_UNTIL_THAT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "negation",
      "question_word",
      "rule:CLEFT_IT_WAS_NOT_UNTIL_THAT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「when」在此應改為「that」。強調句型固定使用 It was not until X that Y。 when 可引出普通時間分句，但不能取代這個強調結構中的 that。"
  },
  {
    "sentenceId": "PARA-0014-S27",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "What the project now needs are a permanent funding arrangement.",
    "correctedSentence": "What the project now needs is a permanent funding arrangement.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "PSEUDOCLEFT_WHAT_CLAUSE_SINGULAR_IS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "question_word",
      "rule:PSEUDOCLEFT_WHAT_CLAUSE_SINGULAR_IS",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「What the project now needs are a permanent funding arrangement」在此應改為「What the project now needs is a permanent funding arrangement」。What the project now needs 是融合關係分句，在這裡指一項需要；後面的表語也是單數 a... arrangement，因此用 is。"
  },
  {
    "sentenceId": "PARA-0014-S28",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "So complicated the forms were that donors signed wrongly, and such the confusion was that staff arranged another briefing.",
    "correctedSentence": "So complicated were the forms that donors signed wrongly, and such was the confusion that staff arranged another briefing.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_SO_ADJECTIVE_INVERSION",
      "CLAUSE_SUCH_WAS_NOUN_INVERSION"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "coordination",
      "rule:CLAUSE_SO_ADJECTIVE_INVERSION",
      "rule:CLAUSE_SUCH_WAS_NOUN_INVERSION",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「So complicated the forms were」在此應改為「So complicated were the forms」。So + 形容詞放在句首以加強語氣時，使用主語與 be 的倒裝：So complicated were the forms that...。 「such the confusion was」在此應改為「such was the confusion」。正式強調結構是 Such was + 名詞詞組 + that...，表示程度非常高。不可把 the confusion 放在 was 前。"
  },
  {
    "sentenceId": "PARA-0014-S29",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Whomever wants to withdraw a photograph may do so, and the archive will return all what families reject.",
    "correctedSentence": "Whoever wants to withdraw a photograph may do so, and the archive will return all that families reject.",
    "categories": [
      "pronoun",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_ALL_THAT_NOT_ALL_WHAT",
      "PRONOUN_WHOEVER_SUBJECT_CASE"
    ],
    "structureTags": [
      "category:pronoun",
      "category:sentence_structure",
      "coordination",
      "infinitive_to",
      "modal",
      "question_word",
      "rule:CLAUSE_ALL_THAT_NOT_ALL_WHAT",
      "rule:PRONOUN_WHOEVER_SUBJECT_CASE"
    ],
    "explanationZhHant": "「Whomever wants」在此應改為「Whoever wants」。融合關係詞在內部分句中是 wants 的主語，因此使用主格 whoever。 whomever 只適合在內部分句中擔任賓語的正式用法。 「all what families reject」在此應改為「all that families reject」。all 後面接關係分句時使用 that，不用 what。另一個正確寫法是 everything that families reject 或 what families reject，但不能把 all 和 what 疊用。"
  },
  {
    "sentenceId": "PARA-0014-S30",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The way how volunteers describe images must be consistent, because the fact of that some diaries contain private details requires care.",
    "correctedSentence": "The way in which volunteers describe images must be consistent, because the fact that some diaries contain private details requires care.",
    "categories": [
      "sentence_structure",
      "singular_plural"
    ],
    "ruleIds": [
      "CLAUSE_THE_WAY_IN_WHICH_NOT_HOW",
      "NOUN_FACT_THAT_CLAUSE_NO_OF"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:singular_plural",
      "modal",
      "quantifier",
      "question_word",
      "rule:CLAUSE_THE_WAY_IN_WHICH_NOT_HOW",
      "rule:NOUN_FACT_THAT_CLAUSE_NO_OF"
    ],
    "explanationZhHant": "「The way how volunteers describe」在此應改為「The way in which volunteers describe」。標準寫法可用 the way in which...、 the way... 或單獨的 how...。一般不使用重複的 the way how...。 「the fact of that」在此應改為「the fact that」。名詞 fact 後面直接由 that 引出同位內容分句，不加入 of。 the fact of the matter 則是另一個名詞結構。"
  },
  {
    "sentenceId": "PARA-0014-S31",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The museum has made research and done progress, but the committee must take into consideration of costs and pay attention on security.",
    "correctedSentence": "The museum has conducted research and made progress, but the committee must take into consideration costs and pay attention to security.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "COLLOC_CONDUCT_RESEARCH",
      "COLLOC_MAKE_PROGRESS",
      "COLLOC_TAKE_INTO_CONSIDERATION_NO_OF",
      "PREP_PAY_ATTENTION_TO"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "have_auxiliary",
      "modal",
      "rule:COLLOC_CONDUCT_RESEARCH",
      "rule:COLLOC_MAKE_PROGRESS",
      "rule:COLLOC_TAKE_INTO_CONSIDERATION_NO_OF",
      "rule:PREP_PAY_ATTENTION_TO"
    ],
    "explanationZhHant": "「has made research」在此應改為「has conducted research」。research 通常配合 conduct、 carry out 或 do，不使用 make research。 do research 也是正確替代。 「done progress」在此應改為「made progress」。固定搭配是 make progress。 progress 在這裡通常是不可數名詞，不寫 do progress 或 make a progress。 「take into consideration of costs」在此應改為「take into consideration costs」。take into consideration 後面直接接考慮的事項，不加 of。較常見的另一詞序是 take costs into consideration。 「pay attention on security」在此應改為「pay attention to security」。固定搭配是 pay attention to + 名詞／動名詞。這裡的 to 是介詞。"
  },
  {
    "sentenceId": "PARA-0014-S32",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A colleague of me objected and called preservation somebody's else responsibility.",
    "correctedSentence": "A colleague of mine objected and called preservation somebody else's responsibility.",
    "categories": [
      "possessive",
      "pronoun"
    ],
    "ruleIds": [
      "POSSESSIVE_INDEFINITE_PRONOUN_ELSES",
      "PRONOUN_DOUBLE_GENITIVE_OF_MINE"
    ],
    "structureTags": [
      "category:possessive",
      "category:pronoun",
      "coordination",
      "rule:POSSESSIVE_INDEFINITE_PRONOUN_ELSES",
      "rule:PRONOUN_DOUBLE_GENITIVE_OF_MINE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「colleague of me」在此應改為「colleague of mine」。a colleague of... 後面使用獨立所有格代名詞 mine，形成雙重所有格。也可寫 my colleague， 但兩者在語境上可能略有差別。 「somebody's else responsibility」在此應改為「somebody else's responsibility」。else 跟在 somebody、 anyone 等不定代名詞後時，所有格標記加在整個詞組末端： somebody else's。"
  },
  {
    "sentenceId": "PARA-0014-S33",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Myself and the curator disagreed, although the chair asked myself to prepare a proposal.",
    "correctedSentence": "The curator and I disagreed, although the chair asked me to prepare a proposal.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "PRONOUN_REFLEXIVE_NOT_COORDINATED_SUBJECT",
      "PRONOUN_REFLEXIVE_REQUIRES_COREFERENCE"
    ],
    "structureTags": [
      "category:pronoun",
      "coordination",
      "infinitive_to",
      "rule:PRONOUN_REFLEXIVE_NOT_COORDINATED_SUBJECT",
      "rule:PRONOUN_REFLEXIVE_REQUIRES_COREFERENCE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Myself and the curator disagreed」在此應改為「The curator and I disagreed」。反身代名詞 myself 不能只為了顯得正式而代替主格 I。整個並列詞組是主語，所以用 the curator and I。 「the chair asked myself」在此應改為「the chair asked me」。反身代名詞要與同一分句的主語指向同一人，例如 I asked myself。這裡主語是 the chair，受詞是作者，所以用 me。"
  },
  {
    "sentenceId": "PARA-0014-S34",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The decision will follow after lawyers have given an advice.",
    "correctedSentence": "The decision will follow after lawyers have given some advice.",
    "categories": [
      "countability"
    ],
    "ruleIds": [
      "COUNT_ADVICE_UNCOUNTABLE_SOME"
    ],
    "structureTags": [
      "category:countability",
      "have_auxiliary",
      "modal",
      "rule:COUNT_ADVICE_UNCOUNTABLE_SOME"
    ],
    "explanationZhHant": "「an」在此應改為「some」。advice 是不可數名詞，不能直接配合 an。可寫 some advice、a piece of advice 或直接 advice。"
  },
  {
    "sentenceId": "PARA-0014-S35",
    "paragraphId": "PARA-0014",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Whatever the outcome, the archive has encouraged residents to value records that might otherwise disappear.",
    "correctedSentence": "Whatever the outcome, the archive has encouraged residents to value records that might otherwise disappear.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0015-S01",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The Northbridge University has begun a community research fellowship in the September 2023.",
    "correctedSentence": "Northbridge University began a community research fellowship in September 2023.",
    "categories": [
      "article_or_determiner",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ARTICLE_MONTH_NAME_ZERO",
      "ARTICLE_PROPER_INSTITUTION_NORTHBRIDGE_ZERO",
      "TENSE_PAST_SIMPLE_FINISHED_TIME"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:verb_form_or_tense",
      "have_auxiliary",
      "rule:ARTICLE_MONTH_NAME_ZERO",
      "rule:ARTICLE_PROPER_INSTITUTION_NORTHBRIDGE_ZERO",
      "rule:TENSE_PAST_SIMPLE_FINISHED_TIME"
    ],
    "explanationZhHant": "「The Northbridge University」在此應改為「Northbridge University」。Northbridge University 是本資料集指定的完整校名，前面不加 the。正式機構名稱的冠詞屬於名稱本身，系統必須先確認官方寫法，不可只看 University 自動刪除冠詞。 「has begun」在此應改為「began」。in September 2023 是已完成的明確過去時間，一般使用過去式 began， 不用現在完成式。公式：明確過去時間 + 過去式。 「the September 2023」在此應改為「September 2023」。月份名稱直接與年份配合時通常不用冠詞：in September 2023。若有修飾語，可寫 in the September of that year，但意思和結構不同。"
  },
  {
    "sentenceId": "PARA-0015-S02",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Since then, the scheme attracted students from United Kingdom, Netherlands and several partner colleges.",
    "correctedSentence": "Since then, the scheme has attracted students from the United Kingdom, the Netherlands and several partner colleges.",
    "categories": [
      "article_or_determiner",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ARTICLE_COUNTRY_NETHERLANDS_THE",
      "ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
      "TENSE_PRESENT_PERFECT_SINCE_THEN"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:verb_form_or_tense",
      "coordination",
      "quantifier",
      "rule:ARTICLE_COUNTRY_NETHERLANDS_THE",
      "rule:ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
      "rule:TENSE_PRESENT_PERFECT_SINCE_THEN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Since then, the scheme attracted」在此應改為「Since then, the scheme has attracted」。Since then 表示由過去某點延續至現在，通常使用現在完成式：has attracted。若敘述的參考時間也在過去，過去完成式可能更合適。 「from United Kingdom」在此應改為「from the United Kingdom」。國名 the United Kingdom 固定帶 the。國名冠詞應按已核准的專名資料處理，不宜推廣成所有國名都加 the。 「Netherlands」在此應改為「the Netherlands」。標準國名是 the Netherlands。對照： France、 Japan 等大部分國名不用冠詞。"
  },
  {
    "sentenceId": "PARA-0015-S03",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Students who attend the university for the first time often need guidance, whereas visitors who come to university for public lectures need different information.",
    "correctedSentence": "Students who attend university for the first time often need guidance, whereas visitors who come to the university for public lectures need different information.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
      "ARTICLE_SPECIFIC_UNIVERSITY_THE_VISIT"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "infinitive_to",
      "question_word",
      "rule:ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
      "rule:ARTICLE_SPECIFIC_UNIVERSITY_THE_VISIT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「attend the university」在此應改為「attend university」。英式英文中，表示以學生身分接受大學教育時，可使用零冠詞： attend university／go to university。若指某間特定大學， attend the university 也可能成立。 「come to university for public lectures」在此應改為「come to the university for public lectures」。訪客不是以學生身分「上大學」，而是前往前文所指的特定大學參加講座，因此使用 the university。判斷取決於人物角色和目的。"
  },
  {
    "sentenceId": "PARA-0015-S04",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The Professor Malik, programme director, said that the fellowship has received a great deal of applications but only few funding.",
    "correctedSentence": "Professor Malik, the programme director, said that the fellowship had received a large number of applications but only a little funding.",
    "categories": [
      "article_or_determiner",
      "countability",
      "sentence_structure",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "APPOSITION_UNIQUE_ROLE_THE_AND_COMMAS",
      "ARTICLE_TITLE_NAME_ZERO",
      "QUANTIFIER_FEW_LITTLE_UNCOUNTABLE_FUNDING",
      "QUANTIFIER_GREAT_DEAL_UNCOUNTABLE_NOT_APPLICATIONS",
      "REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:countability",
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "coordination",
      "have_auxiliary",
      "rule:APPOSITION_UNIQUE_ROLE_THE_AND_COMMAS",
      "rule:ARTICLE_TITLE_NAME_ZERO",
      "rule:QUANTIFIER_FEW_LITTLE_UNCOUNTABLE_FUNDING",
      "rule:QUANTIFIER_GREAT_DEAL_UNCOUNTABLE_NOT_APPLICATIONS",
      "rule:REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「The Professor Malik」在此應改為「Professor Malik」。職銜直接放在人名之前時通常不用冠詞： Professor Malik、 Dr Chen。若沒有姓名，可以寫 the professor。 「programme director」在此應改為「the programme director」。the programme director 是補充說明 Professor Malik 身分的非限制性同位語。它指一個特定職位，因此使用 the，並由逗號分隔。 「has received」在此應改為「had received」。主句使用過去式 said，而收取申請發生在說話之前，因此可回移為過去完成式 had received。如果內容仍屬當前有效事實，有時可以不回移。 「a great deal of applications」在此應改為「a large number of applications」。a great deal of 修飾不可數名詞； applications 是複數可數名詞，所以用 a large number of。對照： a great deal of interest。 「few funding」在此應改為「a little funding」。funding 是不可數名詞，要用 little／ a little， 不用 few。原意是雖然資金不多，但仍有一些，因此選擇較正面的 a little。"
  },
  {
    "sentenceId": "PARA-0015-S05",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "For the past three months, the selection team reviewed portfolios contained field notes, interviews and statistical analysises.",
    "correctedSentence": "For the past three months, the selection team has been reviewing portfolios containing field notes, interviews and statistical analyses.",
    "categories": [
      "sentence_structure",
      "singular_plural",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "CLAUSE_REDUCED_RELATIVE_ACTIVE_PRESENT_PARTICIPLE",
      "NOUN_IRREGULAR_ANALYSIS_ANALYSES",
      "TENSE_PRESENT_PERFECT_PROGRESSIVE_FOR_DURATION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:singular_plural",
      "category:verb_form_or_tense",
      "coordination",
      "rule:CLAUSE_REDUCED_RELATIVE_ACTIVE_PRESENT_PARTICIPLE",
      "rule:NOUN_IRREGULAR_ANALYSIS_ANALYSES",
      "rule:TENSE_PRESENT_PERFECT_PROGRESSIVE_FOR_DURATION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「reviewed」在此應改為「has been reviewing」。For the past three months 表示活動由過去持續至現在，並強調過程，因此使用現在完成進行式。若工作已經全部完成，其他時態才可能成立。 「portfolios contained」在此應改為「portfolios containing」。portfolios 主動「包含」資料，所以可使用現在分詞縮減關係分句： portfolios contain ing...， 相當於 portfolios that contain...。 「analysises」在此應改為「analyses」。analysis 的複數是 analyses。不能在完整單數形式後直接加-es。發音也會由單數結尾/sɪs/轉為複數/siːz/。"
  },
  {
    "sentenceId": "PARA-0015-S06",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The database is containing twenty criterias, although each application is judged against only one criteria at a time.",
    "correctedSentence": "The database contains twenty criteria, although each application is judged against only one criterion at a time.",
    "categories": [
      "singular_plural",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
      "NOUN_IRREGULAR_CRITERION_CRITERIA_PLURAL",
      "NOUN_IRREGULAR_CRITERION_CRITERIA_SINGULAR"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:singular_plural",
      "category:verb_form_or_tense",
      "rule:ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
      "rule:NOUN_IRREGULAR_CRITERION_CRITERIA_PLURAL",
      "rule:NOUN_IRREGULAR_CRITERION_CRITERIA_SINGULAR",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「is containing」在此應改為「contains」。contain 表示某物包含甚麼時通常是狀態動詞，用一般現在式 contains，不用進行式。當 contain 表示正在控制火勢等較動態意思時，進行式可能成立。 「criterias」在此應改為「criteria」。criterion 的複數是 criteria，不寫 criterias。 twenty 後面需要複數形式。 「criteria」在此應改為「criterion」。one 後面接單數，所以使用 criterion。 criteria 是複數。"
  },
  {
    "sentenceId": "PARA-0015-S07",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Few candidates have submitted excellent work; a few, however, have explained how their evidence relates to their conclusions.",
    "correctedSentence": "A few candidates have submitted excellent work; few, however, have explained how their evidence relates to their conclusions.",
    "categories": [
      "countability"
    ],
    "ruleIds": [
      "QUANTIFIER_A_FEW_POSITIVE_SMALL_NUMBER",
      "QUANTIFIER_FEW_NEGATIVE_SMALL_NUMBER"
    ],
    "structureTags": [
      "category:countability",
      "have_auxiliary",
      "infinitive_to",
      "question_word",
      "rule:QUANTIFIER_A_FEW_POSITIVE_SMALL_NUMBER",
      "rule:QUANTIFIER_FEW_NEGATIVE_SMALL_NUMBER",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Few」在此應改為「A few」。a few 表示「有一些」，帶正面存在意思；few 表示「幾乎沒有」。根據本句要指出已有一些優秀作品，使用 a few。兩者都合文法，但意思不同。 「; a」在此應改為「;」。後半句要表達能清楚解釋證據的人很少，因此用 few。若作者只是中性地說有幾人做到，a few 也正確。"
  },
  {
    "sentenceId": "PARA-0015-S08",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "There is a few time before interviews begin, but few extra time has been reserved for applicants requiring adjustments.",
    "correctedSentence": "There is little time before interviews begin, but a little extra time has been reserved for applicants requiring adjustments.",
    "categories": [
      "countability"
    ],
    "ruleIds": [
      "QUANTIFIER_A_LITTLE_UNCOUNTABLE_POSITIVE",
      "QUANTIFIER_LITTLE_UNCOUNTABLE_SCARCITY"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:countability",
      "coordination",
      "have_auxiliary",
      "rule:QUANTIFIER_A_LITTLE_UNCOUNTABLE_POSITIVE",
      "rule:QUANTIFIER_LITTLE_UNCOUNTABLE_SCARCITY",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「a few」在此應改為「little」。time 在這裡是不可數名詞，所以不用 few。 little time 表示剩餘時間很少。 「few」在此應改為「a little」。a little 修飾不可數名詞，表示仍有少量可用。a little extra time 與前面的 little time 形成有意義的對照。"
  },
  {
    "sentenceId": "PARA-0015-S09",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Of the two interview rooms, one is beside the library and another is inside the student centre.",
    "correctedSentence": "Of the two interview rooms, one is beside the library and the other is inside the student centre.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "DETERMINER_TWO_ITEMS_THE_OTHER"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:article_or_determiner",
      "coordination",
      "rule:DETERMINER_TWO_ITEMS_THE_OTHER"
    ],
    "explanationZhHant": "「another」在此應改為「the other」。已明確只有兩間房，提到其中一間後，餘下的特定一間使用 the other。 another 通常表示同類中另一個，但不一定是最後剩下的一個。"
  },
  {
    "sentenceId": "PARA-0015-S10",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At last Monday, the coordinator said applicants that the timetable has changed.",
    "correctedSentence": "Last Monday, the coordinator told applicants that the timetable had changed.",
    "categories": [
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PREP_LAST_NAMED_DAY_ZERO",
      "REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT",
      "REPORTING_SAY_TELL_TELL_PERSON_THAT"
    ],
    "structureTags": [
      "category:preposition",
      "category:verb_form_or_tense",
      "have_auxiliary",
      "rule:PREP_LAST_NAMED_DAY_ZERO",
      "rule:REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT",
      "rule:REPORTING_SAY_TELL_TELL_PERSON_THAT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「At last」在此應改為「Last」。last Monday 本身已是完整時間副詞，不在前面加 at。 比較： at six o'clock、on Monday、last Monday。 「said」在此應改為「told」。tell 可直接接聽者： tell someone that...。say 若要加入聽者，通常寫 say to someone that...。 「has」在此應改為「had」。時間表在協調員通知之前已改動，因此回移成 had changed。如果改動仍被當作現在有效的新消息，保留現在完成式有時也可接受。"
  },
  {
    "sentenceId": "PARA-0015-S11",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She said that the online portal failed last evening and asked that whether everyone had saved a copy.",
    "correctedSentence": "She said that the online portal had failed the previous evening and asked whether everyone had saved a copy.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "REPORTED_SPEECH_BACKSHIFT_PAST_SIMPLE_TO_PAST_PERFECT",
      "REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS",
      "REPORTING_ASK_WHETHER_NO_THAT"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "coordination",
      "have_auxiliary",
      "rule:REPORTED_SPEECH_BACKSHIFT_PAST_SIMPLE_TO_PAST_PERFECT",
      "rule:REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS",
      "rule:REPORTING_ASK_WHETHER_NO_THAT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「failed」在此應改為「had failed」。系統故障發生在她說話之前，因此使用過去完成式，清楚顯示兩個過去事件的先後次序。 「last」在此應改為「the previous」。間接引述從較後的時間回顧說話內容時， last evening 常改為 the previous evening。若敘述時間仍與原說話時間相同，則不一定需要改。 「asked that」在此應改為「asked」。ask 後面的間接是非問句直接由 whether 或 if 引出，不同時使用 that。"
  },
  {
    "sentenceId": "PARA-0015-S12",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She warned candidates do not upload confidential material and denied to share any files with outside organisations.",
    "correctedSentence": "She warned candidates not to upload confidential material and denied sharing any files with outside organisations.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "REPORTING_DENY_GERUND",
      "REPORTING_WARN_NP_NOT_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "coordination",
      "infinitive_to",
      "negation",
      "rule:REPORTING_DENY_GERUND",
      "rule:REPORTING_WARN_NP_NOT_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「do not」在此應改為「not to」。表示警告某人不要做某事，用 warn + 人 + not to + 動詞原形。 另一個正確結構是 warn someone against doing something。 「to share」在此應改為「sharing」。deny 表示否認做過某事時，後面接動名詞： deny doing。 也可接 that 分句，例如 denied that she had shared the files。"
  },
  {
    "sentenceId": "PARA-0015-S13",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One applicant asked, “Why the portal rejected my form?”",
    "correctedSentence": "One applicant asked, “Why did the portal reject my form?”",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "QUESTION_DIRECT_WH_OBJECT_DO_SUPPORT"
    ],
    "structureTags": [
      "category:sentence_structure",
      "question_word",
      "rule:QUESTION_DIRECT_WH_OBJECT_DO_SUPPORT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Why the portal rejected」在此應改為「Why did the portal reject」。這是直接問句， why 問原因而不是主語，所以一般過去式需要 did 倒裝；加入 did 後，主要動詞回到原形 reject。"
  },
  {
    "sentenceId": "PARA-0015-S14",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Another asked, “Does every reference has to be signed?”",
    "correctedSentence": "Another asked, “Does every reference have to be signed?”",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "QUESTION_DOES_BASE_VERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "have_auxiliary",
      "infinitive_to",
      "rule:QUESTION_DOES_BASE_VERB",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Does every reference has」在此應改為「Does every reference have」。does 已承擔第三身單數和現在時標記，後面的主要動詞使用原形 have。"
  },
  {
    "sentenceId": "PARA-0015-S15",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The coordinator replied that references submitting without signatures would be returned.",
    "correctedSentence": "The coordinator replied that references submitted without signatures would be returned.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_REDUCED_RELATIVE_PASSIVE_PARTICIPLE_FORM"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "modal",
      "rule:CLAUSE_REDUCED_RELATIVE_PASSIVE_PARTICIPLE_FORM",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「references submitting without signatures」在此應改為「references submitted without signatures」。references 是「被提交」的文件，所以縮減關係分句使用過去分詞 submitted。 submitting 會表示 references 主動提交其他東西。"
  },
  {
    "sentenceId": "PARA-0015-S16",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She also promised each applicant to contact them once the technicians had restored the system.",
    "correctedSentence": "She also promised to contact each applicant once the technicians had restored the system.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "REPORTING_PROMISE_SPEAKER_TO_INFINITIVE"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "have_auxiliary",
      "infinitive_to",
      "rule:REPORTING_PROMISE_SPEAKER_TO_INFINITIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「promised each applicant to contact them」在此應改為「promised to contact each applicant」。做出承諾的人也是執行聯絡的人，因此用 promise to + 動詞。 promise someone to do 不能表示說話者承諾自己做事。也可寫 promised each applicant that she would contact them。"
  },
  {
    "sentenceId": "PARA-0015-S17",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Several questions nevertheless remain.",
    "correctedSentence": "Several questions nevertheless remain.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "quantifier"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0015-S18",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The old scanner and the new laptop were tested together, but it was faster.",
    "correctedSentence": "The old scanner and the new laptop were tested together, but the laptop was faster.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "REFERENCE_AMBIGUOUS_IT_MULTIPLE_ANTECEDENTS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:pronoun",
      "coordination",
      "rule:REFERENCE_AMBIGUOUS_IT_MULTIPLE_ANTECEDENTS",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「but it was faster」在此應改為「but the laptop was faster」。前面有 scanner 和 laptop 兩個可能的單數先行詞，it 指涉不安全。系統只有在原意已記錄為 laptop 時才可明確改寫；否則應要求補充資料。"
  },
  {
    "sentenceId": "PARA-0015-S19",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The red folders were stronger than the blue, although the last were cheaper.",
    "correctedSentence": "The red folders were stronger than the blue ones, although the latter were cheaper.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "REFERENCE_LATTER_SECOND_OF_TWO",
      "REFERENCE_ONE_ONES_ADJECTIVE_ELLIPSIS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:pronoun",
      "rule:REFERENCE_LATTER_SECOND_OF_TWO",
      "rule:REFERENCE_ONE_ONES_ADJECTIVE_ELLIPSIS",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「the blue」在此應改為「the blue ones」。blue 是形容詞；若省略複數名詞 folders，要用代名詞 ones 承接：the blue ones。 the rich 等指人群的名詞化形容詞是另一類結構。 「the last」在此應改為「the latter」。在剛提到的兩個群體中指第二個，可用 the latter。the last 通常指一個序列中最後的一項，不一定只是兩者中的第二者。"
  },
  {
    "sentenceId": "PARA-0015-S20",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The committee rejected the original timetable because it was unrealistic, although it had drafted it.",
    "correctedSentence": "The committee rejected the original timetable because the timetable was unrealistic, although the committee itself had drafted it.",
    "categories": [
      "pronoun"
    ],
    "ruleIds": [
      "REFERENCE_CHAIN_MULTIPLE_IT_ABSTAIN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:pronoun",
      "have_auxiliary",
      "rule:REFERENCE_CHAIN_MULTIPLE_IT_ABSTAIN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「because it was unrealistic, although it had drafted it」在此應改為「because the timetable was unrealistic, although the committee itself had drafted it」。三個 it 可能分別指 committee 或 timetable，單靠句子不能安全確定。目標句依據已記錄原意解開指涉；沒有原意資料時，預期行動應是 abstention。"
  },
  {
    "sentenceId": "PARA-0015-S21",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Applications were submitted after the deadline will be considered only if evidence for an emergency is provided.",
    "correctedSentence": "Applications submitted after the deadline will be considered only if evidence of an emergency is provided.",
    "categories": [
      "sentence_structure",
      "singular_plural"
    ],
    "ruleIds": [
      "CLAUSE_REDUCED_RELATIVE_PASSIVE_REMOVE_FINITE_BE",
      "NOUN_EVIDENCE_OF_EVENT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "category:singular_plural",
      "conditional",
      "modal",
      "rule:CLAUSE_REDUCED_RELATIVE_PASSIVE_REMOVE_FINITE_BE",
      "rule:NOUN_EVIDENCE_OF_EVENT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Applications were submitted after the deadline will」在此應改為「Applications submitted after the deadline will」。will be considered 已是主句謂語。前面的 submitted after the deadline 應作縮減被動關係分句，不能另用有限動詞 were。 「evidence for an emergency」在此應改為「evidence of an emergency」。表示證明某件事存在或發生，用 evidence of + 事情。 evidence fora theory 可表示支持某理論的證據，意思不同。"
  },
  {
    "sentenceId": "PARA-0015-S22",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Maya the programme officer will review reports wrote in languages other than English.",
    "correctedSentence": "Maya, the programme officer, will review reports written in languages other than English.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "APPOSITION_NONRESTRICTIVE_COMMAS",
      "CLAUSE_REDUCED_RELATIVE_PASSIVE_WRITTEN_NOT_WROTE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "modal",
      "rule:APPOSITION_NONRESTRICTIVE_COMMAS",
      "rule:CLAUSE_REDUCED_RELATIVE_PASSIVE_WRITTEN_NOT_WROTE"
    ],
    "explanationZhHant": "「Maya the programme officer」在此應改為「Maya, the programme officer,」。the programme officer 是補充 Maya 身分的非限制性同位語，前後使用逗號。若有多位名叫 Maya 的人，而職位用來辨認其中一位，標點可能不同。 「reports wrote」在此應改為「reports written」。reports 是「被寫成」某種語言，所以使用過去分詞 written。 wrote 是主動過去式，不能直接放在名詞後構成被動修飾語。"
  },
  {
    "sentenceId": "PARA-0015-S23",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The scheme also requires more careful use of articles and institutional names.",
    "correctedSentence": "The scheme also requires more careful use of articles and institutional names.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "coordination"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0015-S24",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Participants conduct the research in library, but they go to the university to study.",
    "correctedSentence": "Participants conduct research in the library, but they go to university to study.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
      "ARTICLE_SPECIFIC_KNOWN_PLACE_THE",
      "ARTICLE_UNCOUNTABLE_GENERIC_RESEARCH_ZERO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "coordination",
      "infinitive_to",
      "rule:ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
      "rule:ARTICLE_SPECIFIC_KNOWN_PLACE_THE",
      "rule:ARTICLE_UNCOUNTABLE_GENERIC_RESEARCH_ZERO"
    ],
    "explanationZhHant": "「conduct the research」在此應改為「conduct research」。泛指研究活動時， research 是不可數名詞並使用零冠詞。若指前文已界定的某項研究，可使用 the research。 「in library」在此應改為「in the library」。這裡指該大學內已知的特定圖書館，單數可數名詞前需要 the。 「go to the university to study」在此應改為「go to university to study」。英式英文中，以學生身分接受大學教育時通常說 go to university。 若意思是前往某所特定大學的校園，則可保留 the。"
  },
  {
    "sentenceId": "PARA-0015-S25",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Dr Chen works at Northbridge University, while her brother works at University of Westhaven.",
    "correctedSentence": "Dr Chen works at Northbridge University, while her brother works at the University of Westhaven.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_INSTITUTION_UNIVERSITY_OF_NAME_THE"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "rule:ARTICLE_INSTITUTION_UNIVERSITY_OF_NAME_THE"
    ],
    "explanationZhHant": "「at University of Westhaven」在此應改為「at the University of Westhaven」。the University of Westhaven 是本資料集指定的官方名稱形式。 University of + 地名常帶 the，但系統仍應按機構正式名稱核對。"
  },
  {
    "sentenceId": "PARA-0015-S26",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One visiting scholar came from Netherlands, and the other came from United Kingdom.",
    "correctedSentence": "One visiting scholar came from the Netherlands, and another came from the United Kingdom.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_COUNTRY_NETHERLANDS_THE",
      "ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
      "DETERMINER_OPEN_SET_ANOTHER"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "coordination",
      "rule:ARTICLE_COUNTRY_NETHERLANDS_THE",
      "rule:ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
      "rule:DETERMINER_OPEN_SET_ANOTHER",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「from Netherlands」在此應改為「from the Netherlands」。the Netherlands 固定帶定冠詞。此規則是詞彙化專名規則，不應套用到所有國家。 「the other came」在此應改為「another came」。本句只列出其中兩名訪問學者，但並未表示總共只有兩名，因此用 another 表示另有一人。若全組確實只有兩人，the other 才正確。 「from United Kingdom」在此應改為「from the United Kingdom」。國名的完整標準形式是 the United Kingdom。冠詞屬於專名模式的一部分。"
  },
  {
    "sentenceId": "PARA-0015-S27",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Each name must retain its official article pattern.",
    "correctedSentence": "Each name must retain its official article pattern.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "modal"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0015-S28",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At the final briefing, the chair asked, “How many candidates did complete the ethics training?”",
    "correctedSentence": "At the final briefing, the chair asked, “How many candidates completed the ethics training?”",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "QUESTION_WH_SUBJECT_NO_DO_SUPPORT"
    ],
    "structureTags": [
      "category:sentence_structure",
      "quantifier",
      "question_word",
      "rule:QUESTION_WH_SUBJECT_NO_DO_SUPPORT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「How many candidates did complete」在此應改為「How many candidates completed」。how many candidates 本身是 completed 的主語。主語疑問句通常不使用 do／ does／ did。對照：How many forms did the candidates complete? 中，疑問詞問賓語，所以需要 did。"
  },
  {
    "sentenceId": "PARA-0015-S29",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Nobody did not answer immediately, but no candidate had forgotten the requirement.",
    "correctedSentence": "Nobody answered immediately, but no candidate had forgotten the requirement.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "NEGATION_NOBODY_NO_DOUBLE_NEGATIVE"
    ],
    "structureTags": [
      "category:sentence_structure",
      "coordination",
      "have_auxiliary",
      "negation",
      "rule:NEGATION_NOBODY_NO_DOUBLE_NEGATIVE"
    ],
    "explanationZhHant": "「Nobody did not answer」在此應改為「Nobody answered」。標準英文中， nobody 已帶否定意思，不再加入 not。但雙重否定有時可能被理解為「不是沒有人回答」，所以系統應先確認作者是否真正想表達無人回答。"
  },
  {
    "sentenceId": "PARA-0015-S30",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The chair explained that a solution for the delay depended of cooperation among departments.",
    "correctedSentence": "The chair explained that a solution to the delay depended on cooperation among departments.",
    "categories": [
      "other_grammar",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_SOLUTION_TO_PROBLEM",
      "VERB_DEPEND_ON"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:singular_plural",
      "rule:NOUN_SOLUTION_TO_PROBLEM",
      "rule:VERB_DEPEND_ON",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「a solution for the delay」在此應改為「a solution to the delay」。solution 表示解決某個問題的方法時，固定搭配是 solution to + 問題。a solution for cleaning glass 可引出用途，但意思不同。 「depended of」在此應改為「depended on」。depend 的固定搭配是 depend on + 人／事物／分句。"
  },
  {
    "sentenceId": "PARA-0015-S31",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She was aware about the pressure on staff and concerned of its effect on applicants.",
    "correctedSentence": "She was aware of the pressure on staff and concerned about its effect on applicants.",
    "categories": [
      "word_form"
    ],
    "ruleIds": [
      "ADJ_AWARE_OF",
      "ADJ_CONCERNED_ABOUT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:word_form",
      "coordination",
      "rule:ADJ_AWARE_OF",
      "rule:ADJ_CONCERNED_ABOUT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「aware about」在此應改為「aware of」。aware 後面通常用 of + 名詞，或接 that 分句： aware of the pressure／ aware that staff were under pressure。 「concerned of」在此應改為「concerned about」。表示為某事擔憂，用 concerned about。 concerned with 可表示涉及某個主題，意思不同。"
  },
  {
    "sentenceId": "PARA-0015-S32",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The department is owning two recorders, and the equipment is belonging to the university.",
    "correctedSentence": "The department owns two recorders, and the equipment belongs to the university.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ASPECT_STATIVE_BELONG_SIMPLE_NOT_PROGRESSIVE",
      "ASPECT_STATIVE_OWN_SIMPLE_NOT_PROGRESSIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:verb_form_or_tense",
      "coordination",
      "infinitive_to",
      "rule:ASPECT_STATIVE_BELONG_SIMPLE_NOT_PROGRESSIVE",
      "rule:ASPECT_STATIVE_OWN_SIMPLE_NOT_PROGRESSIVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「is owning」在此應改為「owns」。own 表示擁有時通常是狀態動詞，使用一般現在式。若 own 被特殊地轉成動態或暫時意思，才可能有例外。 「is belonging」在此應改為「belongs」。belong 表示所屬關係，通常不用進行式。標準結構是 belong to + 所有人／機構。"
  },
  {
    "sentenceId": "PARA-0015-S33",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Staff are knowing that the software is containing sensitive data, so they check each permission setting this week before approving public access.",
    "correctedSentence": "Staff know that the software contains sensitive data, so they are checking each permission setting this week before approving public access.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
      "ASPECT_STATIVE_KNOW_SIMPLE_NOT_PROGRESSIVE",
      "ASPECT_TEMPORARY_ACTIVITY_PRESENT_PROGRESSIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:verb_form_or_tense",
      "rule:ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
      "rule:ASPECT_STATIVE_KNOW_SIMPLE_NOT_PROGRESSIVE",
      "rule:ASPECT_TEMPORARY_ACTIVITY_PRESENT_PROGRESSIVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「are knowing」在此應改為「know」。know 表示持有知識或認知狀態，通常使用一般時態。 get to know 表示逐漸認識時則可有進行形式。 「is containing」在此應改為「contains」。軟件持有敏感資料是一個狀態，所以使用 contains。這與 S06 的 database 構成跨詞彙環境的轉移案例。 「check」在此應改為「are checking」。this week 表示目前有限期間內正在進行的臨時工作，因此使用現在進行式。若這是每週固定程序，則一般現在式可能正確。"
  },
  {
    "sentenceId": "PARA-0015-S34",
    "paragraphId": "PARA-0015",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Whatever the final decision will be, the fellowship will continue providing opportunities for students whose work might otherwise remain unseen.",
    "correctedSentence": "Whatever the final decision is, the fellowship will continue providing opportunities for students whose work might otherwise remain unseen.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_WHATEVER_FUTURE_PRESENT_NOT_WILL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "modal",
      "rule:CLAUSE_WHATEVER_FUTURE_PRESENT_NOT_WILL",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「will be」在此應改為「is」。whatever 引出的從屬分句談論未來時，通常使用一般現在式，不在分句內加入 will。主句可使用將來式或其他合適時態。"
  },
  {
    "sentenceId": "PARA-0016-S01",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The Eastford College launched an orientation and transport trial for international students on last autumn.",
    "correctedSentence": "Eastford College launched an orientation and transport trial for international students last autumn.",
    "categories": [
      "article_or_determiner",
      "preposition"
    ],
    "ruleIds": [
      "ARTICLE_PROPER_INSTITUTION_EASTFORD_ZERO",
      "PREP_LAST_TIME_EXPRESSION_ZERO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "coordination",
      "rule:ARTICLE_PROPER_INSTITUTION_EASTFORD_ZERO",
      "rule:PREP_LAST_TIME_EXPRESSION_ZERO",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「The Eastford College」在此應改為「Eastford College」。Eastford College 是完整專名，前面不用 the。正式名稱的冠詞必須按機構核准寫法處理；例如 the University of Westhaven 可以正確帶 the。 「on last autumn」在此應改為「last autumn」。last／ next／ this + 時間名詞通常直接作時間副詞，不加 on、in 或 at：last autumn、 next week。"
  },
  {
    "sentenceId": "PARA-0016-S02",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "During first week, students attend the university by day and return to home by the bus in the evening.",
    "correctedSentence": "During the first week, students attend university by day and return home by bus in the evening.",
    "categories": [
      "article_or_determiner",
      "preposition"
    ],
    "ruleIds": [
      "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_ROLE",
      "ARTICLE_ORDINAL_SPECIFIC_THE",
      "ARTICLE_TRANSPORT_BY_ZERO",
      "PREP_HOME_DIRECTION_NO_TO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "coordination",
      "infinitive_to",
      "rule:ARTICLE_INSTITUTION_UNIVERSITY_ZERO_ROLE",
      "rule:ARTICLE_ORDINAL_SPECIFIC_THE",
      "rule:ARTICLE_TRANSPORT_BY_ZERO",
      "rule:PREP_HOME_DIRECTION_NO_TO",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「During first week」在此應改為「During the first week」。序數詞表示某個明確次序時，通常使用 the： the first week。若 First Week 是正式活動名稱，冠詞模式可能不同。 「attend the university」在此應改為「attend university」。英式英文中，以學生身分接受大學教育時可使用零冠詞： attend university。若指某一所特定大學， attend the university 也可能正確。 「return to home」在此應改為「return home」。home 作方向副詞時，前面不用 to： go home、come home、 return home。若有名詞限定，可寫 return to their home。 「by the bus」在此應改為「by bus」。表示交通方式，用 by + 零冠詞交通工具：by bus、by train。表示人在某一架巴士上時，則寫 on the bus。"
  },
  {
    "sentenceId": "PARA-0016-S03",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "They have the breakfast in their residences before taking number 12 bus.",
    "correctedSentence": "They have breakfast in their residences before taking the number 12 bus.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_MEAL_ROUTINE_ZERO",
      "ARTICLE_ROUTE_NUMBER_DEFINITE_THE"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "have_auxiliary",
      "rule:ARTICLE_MEAL_ROUTINE_ZERO",
      "rule:ARTICLE_ROUTE_NUMBER_DEFINITE_THE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「have the breakfast」在此應改為「have breakfast」。泛指日常用餐活動時，餐名通常用零冠詞： have breakfast。指某一頓特定早餐時可寫 the breakfast served by the hotel。 「taking number 12 bus」在此應改為「taking the number 12 bus」。指具有特定路線編號的巴士時，使用 the：the number 12 bus。 也可寫 take bus number 12。"
  },
  {
    "sentenceId": "PARA-0016-S04",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At the college, they meet in a main library rather than in the class.",
    "correctedSentence": "At the college, they meet in the main library rather than in class.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_INSTITUTION_CLASS_ZERO_ACTIVITY",
      "ARTICLE_UNIQUE_CONTEXT_MAIN_THE"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "rule:ARTICLE_INSTITUTION_CLASS_ZERO_ACTIVITY",
      "rule:ARTICLE_UNIQUE_CONTEXT_MAIN_THE"
    ],
    "explanationZhHant": "「in a main library」在此應改為「in the main library」。一間學院通常有在語境中可識別的主要圖書館，因此使用 the main library。若有多間同等的主要圖書館，a 才可能合適。 「in the class」在此應改為「in class」。in class 表示正在上課或參與課堂活動。in the class 可指某一個已知班別，例如 the talleststudent in the class，所以要按原意判斷。"
  },
  {
    "sentenceId": "PARA-0016-S05",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Students who need medical advice go to the hospital through the campus clinic, whereas those visiting a friend go to hospital as visitors.",
    "correctedSentence": "Students who need medical advice go to hospital through the campus clinic, whereas those visiting a friend go to the hospital as visitors.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "ARTICLE_HOSPITAL_INSTITUTIONAL_ZERO_BRITISH",
      "ARTICLE_HOSPITAL_SPECIFIC_BUILDING_THE"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "infinitive_to",
      "question_word",
      "rule:ARTICLE_HOSPITAL_INSTITUTIONAL_ZERO_BRITISH",
      "rule:ARTICLE_HOSPITAL_SPECIFIC_BUILDING_THE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「go to the hospital」在此應改為「go to hospital」。英式英文中，病人為接受醫療而去醫院，可用 go to hospital。美式英文常用 go to the hospital，因此不可把美式形式判作文法錯誤。 「go to hospital as visitors」在此應改為「go to the hospital as visitors」。以訪客身分前往某間醫院建築，不是接受住院服務，因此使用 the hospital。"
  },
  {
    "sentenceId": "PARA-0016-S06",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In the afternoon, some listen the radio, while others watch the television in common room.",
    "correctedSentence": "In the afternoon, some listen to the radio, while others watch television in the common room.",
    "categories": [
      "article_or_determiner",
      "preposition"
    ],
    "ruleIds": [
      "ARTICLE_MEDIA_TELEVISION_ZERO",
      "ARTICLE_SPECIFIC_COMMON_ROOM_THE",
      "PREP_LISTEN_TO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "quantifier",
      "rule:ARTICLE_MEDIA_TELEVISION_ZERO",
      "rule:ARTICLE_SPECIFIC_COMMON_ROOM_THE",
      "rule:PREP_LISTEN_TO"
    ],
    "explanationZhHant": "「listen the radio」在此應改為「listen to the radio」。listen 接聆聽對象時需要 to： listen to music／ the radio。 hear 則可直接接賓語。 「watch the television」在此應改為「watch television」。表示觀看電視節目這種活動時，通常寫 watch television。 watch the television 可表示注視某部電視機。 「in common room」在此應改為「in the common room」。common room 是單數可數名詞，並指學生已知的特定房間，所以需要 the。"
  },
  {
    "sentenceId": "PARA-0016-S07",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "During the tour, the guide stopped explaining the ticket machine and reminded students locking their rooms.",
    "correctedSentence": "During the tour, the guide stopped to explain the ticket machine and reminded students to lock their rooms.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_REMIND_NP_TO_INFINITIVE",
      "VERB_STOP_TO_INFINITIVE_PURPOSE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "coordination",
      "rule:VERB_REMIND_NP_TO_INFINITIVE",
      "rule:VERB_STOP_TO_INFINITIVE_PURPOSE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「stopped explaining」在此應改為「stopped to explain」。stop to explain 表示停下原本的活動，目的是進行解釋；stop explaining 表示停止解釋。兩者都合文法，但意思不同，系統必須根據已記錄原意選擇。 「reminded students locking」在此應改為「reminded students to lock」。remind + 人 + to + 動詞原形表示提醒某人做尚未完成的事。若提醒某人記起過去事件，可用 remind someone of...。"
  },
  {
    "sentenceId": "PARA-0016-S08",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One student remembered to leave her card on a bus and tried to call the lost-property office.",
    "correctedSentence": "One student remembered leaving her card on a bus and tried calling the lost-property office.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_REMEMBER_GERUND_PAST_MEMORY",
      "VERB_TRY_GERUND_EXPERIMENT"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "coordination",
      "infinitive_to",
      "rule:VERB_REMEMBER_GERUND_PAST_MEMORY",
      "rule:VERB_TRY_GERUND_EXPERIMENT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「remembered to leave」在此應改為「remembered leaving」。remember doing 表示記得曾經做過某事。 remember to do 表示記得要做某事並執行。原意是她回想自己把卡留在巴士上，因此用動名詞。 「tried to call」在此應改為「tried calling」。try doing 表示嘗試某個方法，看看是否有效；try to do 表示努力完成某事。兩者均可能正確，必須按語境處理。"
  },
  {
    "sentenceId": "PARA-0016-S09",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Replacing the card meant to complete another form, but she did not mean delaying the group.",
    "correctedSentence": "Replacing the card meant completing another form, but she did not mean to delay the group.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "VERB_MEAN_GERUND_ENTAIL",
      "VERB_MEAN_TO_INFINITIVE_INTENTION"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "coordination",
      "infinitive_to",
      "negation",
      "rule:VERB_MEAN_GERUND_ENTAIL",
      "rule:VERB_MEAN_TO_INFINITIVE_INTENTION",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「meant to complete」在此應改為「meant completing」。mean doing 表示某件事必然涉及另一件事。更換卡片會涉及填寫另一張表格。 mean to do 則表示有意打算做某事。 「did not mean delaying」在此應改為「did not mean to delay」。表示沒有打算延誤小組，用 mean to + 動詞原形。mean delaying 會表示某情況意味著延誤。"
  },
  {
    "sentenceId": "PARA-0016-S10",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Since the trial began, the college collected feedbacks from more than two hundred students.",
    "correctedSentence": "Since the trial began, the college has collected feedback from more than two hundred students.",
    "categories": [
      "countability",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "COUNT_FEEDBACK_UNCOUNTABLE",
      "TENSE_PRESENT_PERFECT_SINCE_PAST_POINT"
    ],
    "structureTags": [
      "category:countability",
      "category:verb_form_or_tense",
      "rule:COUNT_FEEDBACK_UNCOUNTABLE",
      "rule:TENSE_PRESENT_PERFECT_SINCE_PAST_POINT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Since the trial began, the college collected」在此應改為「Since the trial began, the college has collected」。since + 過去起點通常與現在完成式配合，表示由試行開始至現在所累積的結果。 「feedbacks」在此應改為「feedback」。feedback 表示意見或回饋時通常是不可數名詞。可寫 some feedback、 comments 或 pieces of feedback，一般不寫 feedbacks。"
  },
  {
    "sentenceId": "PARA-0016-S11",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Most of students have found the maps useful, but most of students interviewed asked for clearer fare information.",
    "correctedSentence": "Most students have found the maps useful, but most of the students interviewed asked for clearer fare information.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "DETERMINER_MOST_GENERIC_PLURAL_NO_OF",
      "DETERMINER_MOST_OF_SPECIFIC_GROUP"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "coordination",
      "have_auxiliary",
      "rule:DETERMINER_MOST_GENERIC_PLURAL_NO_OF",
      "rule:DETERMINER_MOST_OF_SPECIFIC_GROUP",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Most of students」在此應改為「Most students」。泛指大部分學生時，用 most + 複數名詞，不加 of：most students。 「most of students interviewed」在此應改為「most of the students interviewed」。指已接受訪問的特定學生群體時，用 most of the + 複數名詞。公式：most students 泛指； most of the students 指特定群體。"
  },
  {
    "sentenceId": "PARA-0016-S12",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A few had previously travelled alone, whereas few knew how to use the regional ticketing app.",
    "correctedSentence": "A few had previously travelled alone, whereas few knew how to use the regional ticketing app.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "have_auxiliary",
      "infinitive_to",
      "question_word",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0016-S13",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "There was little of time during the first session, although tutors allowed a few extra time for questions.",
    "correctedSentence": "There was little time during the first session, although tutors allowed a little extra time for questions.",
    "categories": [
      "countability"
    ],
    "ruleIds": [
      "QUANTIFIER_A_LITTLE_UNCOUNTABLE",
      "QUANTIFIER_LITTLE_NO_OF_BEFORE_NOUN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:countability",
      "rule:QUANTIFIER_A_LITTLE_UNCOUNTABLE",
      "rule:QUANTIFIER_LITTLE_NO_OF_BEFORE_NOUN",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「little of time」在此應改為「little time」。little 直接修飾不可數名詞： little time。只有在 little of the time 這種帶限定詞的結構中才使用 of。 「a few extra time」在此應改為「a little extra time」。time 在此是不可數名詞，所以使用 a little， 不用修飾複數可數名詞的 a few。"
  },
  {
    "sentenceId": "PARA-0016-S14",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Each of students received a card, and all them were asked to keep it.",
    "correctedSentence": "Each of the students received a card, and all of them were asked to keep it.",
    "categories": [
      "article_or_determiner"
    ],
    "ruleIds": [
      "DETERMINER_ALL_OF_OBJECT_PRONOUN",
      "DETERMINER_EACH_OF_THE_PLURAL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:article_or_determiner",
      "coordination",
      "infinitive_to",
      "rule:DETERMINER_ALL_OF_OBJECT_PRONOUN",
      "rule:DETERMINER_EACH_OF_THE_PLURAL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Each of students」在此應改為「Each of the students」。each of 後面通常接代名詞或帶限定詞的複數名詞： each of them、 each of the students。 「all them」在此應改為「all of them」。all 放在賓格代名詞前時需要 of： all of them。在主語位置也可寫 They all received cards。"
  },
  {
    "sentenceId": "PARA-0016-S15",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One student said that she had gone to London last year but had never gone to Eastford before.",
    "correctedSentence": "One student said that she had been to London the previous year but had never been to Eastford before.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ASPECT_BEEN_TO_RETURNED_VISIT",
      "ASPECT_NEVER_BEEN_TO_EXPERIENCE",
      "REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "negation",
      "rule:ASPECT_BEEN_TO_RETURNED_VISIT",
      "rule:ASPECT_NEVER_BEEN_TO_EXPERIENCE",
      "rule:REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS"
    ],
    "explanationZhHant": "「had gone to London」在此應改為「had been to London」。have／ had been to 表示曾到訪並已離開；have／had gone to 通常表示已前往而仍未返回。由於學生現在正在講述經歷，目標用 been to。 「last year」在此應改為「the previous year」。間接引述從較後的敘述時間回顧原話時，last year 常改為 the previous year。 若報告仍在同一時間框架內， 原時間詞也可能保留。 「had never gone to Eastford before」在此應改為「had never been to Eastford before」。表示過去某時點之前從未有到訪經驗，通常用 had never been to。"
  },
  {
    "sentenceId": "PARA-0016-S16",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She explained that her brother had been to Manchester and would not return until Friday.",
    "correctedSentence": "She explained that her brother had gone to Manchester and would not return until Friday.",
    "categories": [
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ASPECT_GONE_TO_STILL_AWAY"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:verb_form_or_tense",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "modal",
      "negation",
      "rule:ASPECT_GONE_TO_STILL_AWAY",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「had been to Manchester and would not return」在此應改為「had gone to Manchester and would not return」。would not return until Friday 顯示哥哥當時仍在 Manchester，因此用 had gone to。若他已經回來，才可用 had been to。"
  },
  {
    "sentenceId": "PARA-0016-S17",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Another student apologised the tutor about arriving late and blamed the delay for a cancelled train.",
    "correctedSentence": "Another student apologised to the tutor for arriving late and blamed the delay on a cancelled train.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "VERB_APOLOGISE_FOR_REASON",
      "VERB_APOLOGISE_TO_PERSON",
      "VERB_BLAME_RESULT_ON_CAUSE"
    ],
    "structureTags": [
      "category:other_grammar",
      "coordination",
      "rule:VERB_APOLOGISE_FOR_REASON",
      "rule:VERB_APOLOGISE_TO_PERSON",
      "rule:VERB_BLAME_RESULT_ON_CAUSE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「apologised the tutor」在此應改為「apologised to the tutor」。人道歉，用 apologise to + 人。 「about arriving late」在此應改為「for arriving late」。表示為某個行為道歉，用 apologise for + 名詞／動名詞。 about 可用於談論道歉的主題，但不是這個標準框架。 「blamed the delay for a cancelled train」在此應改為「blamed the delay on a cancelled train」。blame + 結果 + on + 原因：把延誤歸咎於火車取消。另一個正確結構是 blame the cancelled train for the delay。 兩個賓語角色不可倒轉。"
  },
  {
    "sentenceId": "PARA-0016-S18",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The tutor congratulated her for finding an alternative route and reminded to everyone that the next workshop will begin at nine.",
    "correctedSentence": "The tutor congratulated her on finding an alternative route and reminded everyone that the next workshop would begin at nine.",
    "categories": [
      "other_grammar",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "REPORTED_SPEECH_FUTURE_IN_PAST",
      "VERB_CONGRATULATE_NP_ON",
      "VERB_REMIND_DIRECT_PERSON_NO_TO"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:verb_form_or_tense",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:REPORTED_SPEECH_FUTURE_IN_PAST",
      "rule:VERB_CONGRATULATE_NP_ON",
      "rule:VERB_REMIND_DIRECT_PERSON_NO_TO",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「congratulated her for finding」在此應改為「congratulated her on finding」。固定結構是 congratulate + 人 + on + 名詞／動名詞。 「reminded to everyone that」在此應改為「reminded everyone that」。remind 直接接被提醒的人，不在前面加 to： remind everyone that...。 「will begin」在此應改為「would begin」。從過去敘述點描述其後發生的事情，可把 will 回移為 would。 如果九時的工作坊在報告當刻仍屬未來，保留 will 也可能合理。"
  },
  {
    "sentenceId": "PARA-0016-S19",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "“Why the evening bus does stop so early?” one student asked.",
    "correctedSentence": "“Why does the evening bus stop so early?” one student asked.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "QUESTION_DIRECT_WH_AUX_SUBJECT_ORDER"
    ],
    "structureTags": [
      "category:sentence_structure",
      "question_word",
      "rule:QUESTION_DIRECT_WH_AUX_SUBJECT_ORDER",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Why the evening bus does stop」在此應改為「Why does the evening bus stop」。直接疑問句使用疑問詞 + 助動詞 + 主語 + 動詞原形。 does 已承擔第三身單數標記，所以主要動詞用 stop。"
  },
  {
    "sentenceId": "PARA-0016-S20",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "“How many routes serve the campus?” asked another.",
    "correctedSentence": "“How many routes serve the campus?” asked another.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "quantifier",
      "question_word",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0016-S21",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The tutor replied that nobody had complained previously, but neither the transport office had published a full timetable.",
    "correctedSentence": "The tutor replied that nobody had complained previously, but neither had the transport office published a full timetable.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_NEITHER_AUXILIARY_INVERSION"
    ],
    "structureTags": [
      "category:sentence_structure",
      "coordination",
      "have_auxiliary",
      "rule:CLAUSE_NEITHER_AUXILIARY_INVERSION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「neither the transport office had published」在此應改為「neither had the transport office published」。neither 接續前面的否定分句時，要使用助動詞倒裝： neither + 助動詞 + 主語。"
  },
  {
    "sentenceId": "PARA-0016-S22",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One student said that he did not have some cash; another replied, “Neither I do.”",
    "correctedSentence": "One student said that he did not have any cash; another replied, “Neither do I.”",
    "categories": [
      "article_or_determiner",
      "sentence_structure"
    ],
    "ruleIds": [
      "DETERMINER_ANY_IN_NEGATIVE_CLAUSE",
      "RESPONSE_NEITHER_AUXILIARY_INVERSION"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:sentence_structure",
      "have_auxiliary",
      "negation",
      "quantifier",
      "rule:DETERMINER_ANY_IN_NEGATIVE_CLAUSE",
      "rule:RESPONSE_NEITHER_AUXILIARY_INVERSION",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「did not have some cash」在此應改為「did not have any cash」。一般否定句通常用 any：not have any cash。 some 可出現在預期肯定答案的問句、提議或強調語境中。 「Neither I do」在此應改為「Neither do I」。表示自己也不具備前述情況，用 Neither + 助動詞 + 主語。對照肯定回應：So do I."
  },
  {
    "sentenceId": "PARA-0016-S23",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The tutor added, “The app is working now, is it?”",
    "correctedSentence": "The tutor added, “The app is working now, isn't it?”",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "QUESTION_TAG_POSITIVE_MAIN_NEGATIVE_TAG"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "rule:QUESTION_TAG_POSITIVE_MAIN_NEGATIVE_TAG",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「The app is working now, is it?」在此應改為「The app is working now, isn't it?」。中性的確認問句通常由肯定主句配合否定附加問句： isn't it?。同極性的 is it? 可在驚訝、質疑或挑戰語氣中成立，因此不應忽略語調和語境。"
  },
  {
    "sentenceId": "PARA-0016-S24",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The college is also reviewing reports submitted by students who living outside the city.",
    "correctedSentence": "The college is also reviewing reports submitted by students living outside the city.",
    "categories": [
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_REDUCED_RELATIVE_NO_WHO_BEFORE_PARTICIPLE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:sentence_structure",
      "question_word",
      "rule:CLAUSE_REDUCED_RELATIVE_NO_WHO_BEFORE_PARTICIPLE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「students who living」在此應改為「students living」。可寫完整關係分句 students who are living...，或縮減為 students living...。不能只保留 who 而省略必要的 are。"
  },
  {
    "sentenceId": "PARA-0016-S25",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The reports contain several analysis of travel patterns, two serieses of photographs and three appendix.",
    "correctedSentence": "The reports contain several analyses of travel patterns, two series of photographs and three appendices.",
    "categories": [
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_INVARIABLE_SERIES_PLURAL",
      "NOUN_IRREGULAR_ANALYSIS_ANALYSES",
      "NOUN_IRREGULAR_APPENDIX_APPENDICES"
    ],
    "structureTags": [
      "category:singular_plural",
      "coordination",
      "quantifier",
      "rule:NOUN_INVARIABLE_SERIES_PLURAL",
      "rule:NOUN_IRREGULAR_ANALYSIS_ANALYSES",
      "rule:NOUN_IRREGULAR_APPENDIX_APPENDICES"
    ],
    "explanationZhHant": "「several analysis」在此應改為「several analyses」。several 後面接複數； analysis 的不規則複數是 analyses。 「two serieses」在此應改為「two series」。series 的單數和複數形式相同： one series、two series。 「three appendix」在此應改為「three appendices」。appendix 的正式複數常為 appendices。 appendixes 亦可見於部分一般語境，兩者應按語域接受。"
  },
  {
    "sentenceId": "PARA-0016-S26",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "One phenomena appearing repeatedly is that students which live more far away spend lesser time on campus.",
    "correctedSentence": "One phenomenon appearing repeatedly is that students who live farther away spend less time on campus.",
    "categories": [
      "comparison",
      "countability",
      "pronoun",
      "singular_plural"
    ],
    "ruleIds": [
      "COMP_FAR_FARTHER_OR_FURTHER",
      "NOUN_IRREGULAR_PHENOMENON_SINGULAR",
      "PRONOUN_RELATIVE_HUMAN_WHO",
      "QUANTIFIER_LESS_UNCOUNTABLE_NOT_LESSER"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:countability",
      "category:pronoun",
      "category:singular_plural",
      "rule:COMP_FAR_FARTHER_OR_FURTHER",
      "rule:NOUN_IRREGULAR_PHENOMENON_SINGULAR",
      "rule:PRONOUN_RELATIVE_HUMAN_WHO",
      "rule:QUANTIFIER_LESS_UNCOUNTABLE_NOT_LESSER",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「One phenomena」在此應改為「One phenomenon」。phenomenon 是單數， phenomena 是複數。one 後面使用單數。 「students which」在此應改為「students who」。關係分句中作主語，通常使用 who。限制性關係分句中 that 也可成立。 「more far away」在此應改為「farther away」。far 的標準比較級是 farther 或 further，不用 more far。兩者均可指實際距離，尤其在英式英文中。 「lesser time」在此應改為「less time」。表示不可數名詞數量較少，用 less time。 lesser 通常表示地位、程度或重要性較低，如 a lesser offence。"
  },
  {
    "sentenceId": "PARA-0016-S27",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The red route is more faster than the blue, while the last is more cheap.",
    "correctedSentence": "The red route is faster than the blue one, while the latter is cheaper.",
    "categories": [
      "comparison",
      "pronoun"
    ],
    "ruleIds": [
      "COMP_DOUBLE_COMPARATIVE_NO_MORE",
      "COMP_SHORT_ADJECTIVE_ER_FORM",
      "REFERENCE_LATTER_SECOND_OF_TWO",
      "REFERENCE_ONE_REPLACES_SINGULAR_COUNT_NOUN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:pronoun",
      "rule:COMP_DOUBLE_COMPARATIVE_NO_MORE",
      "rule:COMP_SHORT_ADJECTIVE_ER_FORM",
      "rule:REFERENCE_LATTER_SECOND_OF_TWO",
      "rule:REFERENCE_ONE_REPLACES_SINGULAR_COUNT_NOUN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「more faster」在此應改為「faster」。faster 已經是比較級，不能再加入 more。 「the blue」在此應改為「the blue one」。省略已出現的單數可數名詞 route 時，用 one 承接：the blue one。 「the last」在此應改為「the latter」。在剛提及的兩項中指第二項，用 the latter。 the last 通常指整個序列中最後一項。 「more cheap」在此應改為「cheaper」。短形容詞 cheap 通常加-er 形成比較級： cheaper。"
  },
  {
    "sentenceId": "PARA-0016-S28",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At the final meeting, the coordinator asked did the survey represented every group fair.",
    "correctedSentence": "At the final meeting, the coordinator asked whether the survey had represented every group fairly.",
    "categories": [
      "sentence_structure",
      "word_form"
    ],
    "ruleIds": [
      "CLAUSE_INDIRECT_YES_NO_WHETHER_STATEMENT_ORDER",
      "WORDFORM_ADVERB_FAIRLY_MODIFIES_VERB"
    ],
    "structureTags": [
      "category:sentence_structure",
      "category:word_form",
      "rule:CLAUSE_INDIRECT_YES_NO_WHETHER_STATEMENT_ORDER",
      "rule:WORDFORM_ADVERB_FAIRLY_MODIFIES_VERB",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「asked did the survey represented」在此應改為「asked whether the survey had represented」。ask 後面的間接是非問句由 whether／if 引出，並使用陳述句語序。調查代表各群體發生在會議前，因此目標使用過去完成式。 「fair」在此應改為「fairly」。fairly 是副詞，在此修飾動詞 represented。 fair 是形容詞，通常描述名詞或放在連繫動詞後。"
  },
  {
    "sentenceId": "PARA-0016-S29",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "She noted that the data was limited and that some of the evidences were inconclusive.",
    "correctedSentence": "She noted that the data were limited and that some of the evidence was inconclusive.",
    "categories": [
      "countability",
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "COUNT_EVIDENCE_UNCOUNTABLE",
      "SVA_DATA_ACADEMIC_PLURAL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:countability",
      "category:subject_verb_agreement",
      "coordination",
      "quantifier",
      "rule:COUNT_EVIDENCE_UNCOUNTABLE",
      "rule:SVA_DATA_ACADEMIC_PLURAL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「the data was limited」在此應改為「the data were limited」。正式學術語境可把 data 視為 datum 的複數，因此用 were。 現代一般英文亦常把 data 當集合或不可數名詞並配合 was，不可一律拒絕。 「some of the evidences were」在此應改為「some of the evidence was」。evidence 表示證據整體時通常不可數，使用 some evidence 和單數動詞。要計算可寫 pieces of evidence。"
  },
  {
    "sentenceId": "PARA-0016-S30",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The committee therefore requested for more informations from students which journeys involved more one form of transport.",
    "correctedSentence": "The committee therefore requested more information from students whose journeys involved more than one form of transport.",
    "categories": [
      "countability",
      "other_grammar",
      "pronoun"
    ],
    "ruleIds": [
      "INFORMATION_UNCOUNTABLE",
      "PRONOUN_RELATIVE_WHOSE_POSSESSIVE",
      "QUANTIFIER_MORE_THAN_ONE",
      "VERB_REQUEST_DIRECT_OBJECT_NO_FOR"
    ],
    "structureTags": [
      "category:countability",
      "category:other_grammar",
      "category:pronoun",
      "rule:INFORMATION_UNCOUNTABLE",
      "rule:PRONOUN_RELATIVE_WHOSE_POSSESSIVE",
      "rule:QUANTIFIER_MORE_THAN_ONE",
      "rule:VERB_REQUEST_DIRECT_OBJECT_NO_FOR",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「requested for more」在此應改為「requested more」。request 作及物動詞時直接接所要求的事物： request more information。名詞結構則可寫 a request for information。 「informations」在此應改為「information」。information 通常不可數，不寫複數 informations。可使用 items／ pieces of information。 「students which journeys」在此應改為「students whose journeys」。journeys 屬於 students， 因此使用所有格關係代名詞 whose。 「more one form」在此應改為「more than one form」。表示數量超過一個，固定結構是 more than one + 單數可數名詞。"
  },
  {
    "sentenceId": "PARA-0016-S31",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "It also asked each participant to check that their address were correct.",
    "correctedSentence": "It also asked each participant to check that their address was correct.",
    "categories": [
      "subject_verb_agreement"
    ],
    "ruleIds": [
      "SVA_POSSESSIVE_THEIR_SINGULAR_HEAD_WAS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:subject_verb_agreement",
      "infinitive_to",
      "rule:SVA_POSSESSIVE_THEIR_SINGULAR_HEAD_WAS",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「their address were」在此應改為「their address was」。動詞與中心名詞 address 配合，而不是與所有格限定詞 their 配合。每名參與者有一個地址，因此用單數 was。單數 they／ their 不要求後面的名詞和動詞變成複數。"
  },
  {
    "sentenceId": "PARA-0016-S32",
    "paragraphId": "PARA-0016",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Whatever the results show, the college will continue throughout the year to provide guidance, and students will know to whom to contact when a problem will arise.",
    "correctedSentence": "Whatever the results show, the college will continue throughout the year to provide guidance, and students will know whom to contact when a problem arises.",
    "categories": [
      "infinitive_or_gerund",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_WHEN_FUTURE_PRESENT",
      "VERB_CONTACT_WH_INFINITIVE_NO_PREPOSITION"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:sentence_structure",
      "coordination",
      "infinitive_to",
      "modal",
      "question_word",
      "rule:CLAUSE_WHEN_FUTURE_PRESENT",
      "rule:VERB_CONTACT_WH_INFINITIVE_NO_PREPOSITION"
    ],
    "explanationZhHant": "「to whom」在此應改為「whom」。contact 是及物動詞，直接接賓語，因此在 whom to contact 前不加 to。對照： whom to speak to，因為 speak 需要介詞。 「will arise」在此應改為「arises」。指未來的時間分句通常使用一般現在式：when a problem arises。 主句才使用將來或情態結構。"
  },
  {
    "sentenceId": "PARA-0017-S01",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The three maps show how Riverside district has changed from 1995 until 2025 and how it proposes to develop until 2035.",
    "correctedSentence": "The three maps show how the Riverside district changed between 1995 and 2025 and how it is proposed to be developed by 2035.",
    "categories": [
      "article_or_determiner",
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ARTICLE_NAMED_DISTRICT_THE",
      "PASSIVE_PROPOSAL_SUBJECT_IS_PROPOSED_TO_BE",
      "PREP_MAP_FUTURE_BY_YEAR",
      "PREP_MAP_PERIOD_BETWEEN_AND",
      "TENSE_MAP_COMPLETED_PERIOD_PAST_SIMPLE"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "category:verb_form_or_tense",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "question_word",
      "rule:ARTICLE_NAMED_DISTRICT_THE",
      "rule:PASSIVE_PROPOSAL_SUBJECT_IS_PROPOSED_TO_BE",
      "rule:PREP_MAP_FUTURE_BY_YEAR",
      "rule:PREP_MAP_PERIOD_BETWEEN_AND",
      "rule:TENSE_MAP_COMPLETED_PERIOD_PAST_SIMPLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Riverside district」在此應改為「the Riverside district」。district 是普通可數名詞， Riverside 在這裡只用作名稱修飾語，因此完整名詞詞組使用 the Riverside district。正式名稱若只是 Riverside，則可能不用冠詞。 「has changed」在此應改為「changed」。1995 至 2025 是已完成的歷史時段，因此用一般過去式描述已發生的改變。若其中一幅圖表示現在，而改變延續至今，現在完成式才可能成立。 「from 1995 until 2025」在此應改為「between 1995 and 2025」。封閉的兩個時間點可用 between A and B。 from 必須與 to 配對； until 通常表示某狀態持續至某時。 「it proposes to develop」在此應改為「it is proposed to be developed」。district 是接受發展工程的地方，不是主動提出計劃的人，因此使用被動結構：is proposed to be developed。 「until 2035」在此應改為「by 2035」。by 2035 表示最遲到該年時完成或形成。 until 2035 表示某狀態一直持續至該年。"
  },
  {
    "sentenceId": "PARA-0017-S02",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Overall, the area has transformed from a lightly-developed riverside settlement to a density mixed-use neighbourhood, and the next phase intends improving pedestrian access while remain the central park.",
    "correctedSentence": "Overall, the area has evolved from a lightly developed riverside settlement into a denser mixed-use neighbourhood, and the next phase is intended to improve pedestrian access while retaining the central park.",
    "categories": [
      "preposition",
      "sentence_structure",
      "spelling_or_spacing",
      "verb_form_or_tense",
      "word_form"
    ],
    "ruleIds": [
      "CLAUSE_WHILE_SHARED_SUBJECT_PARTICIPLE",
      "COLLOC_EVOLVE_FROM_INTO",
      "ORTHOGRAPHY_LY_ADVERB_NO_HYPHEN",
      "PASSIVE_INTEND_BE_INTENDED_TO",
      "WORDFORM_DENSITY_TO_DENSER"
    ],
    "structureTags": [
      "category:preposition",
      "category:sentence_structure",
      "category:spelling_or_spacing",
      "category:verb_form_or_tense",
      "category:word_form",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "rule:CLAUSE_WHILE_SHARED_SUBJECT_PARTICIPLE",
      "rule:COLLOC_EVOLVE_FROM_INTO",
      "rule:ORTHOGRAPHY_LY_ADVERB_NO_HYPHEN",
      "rule:PASSIVE_INTEND_BE_INTENDED_TO",
      "rule:WORDFORM_DENSITY_TO_DENSER",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「transformed」在此應改為「evolved」。描述地區逐步發展成另一種形態，常用 evolve from A into B。 transform from A into B 亦可成立；原句的主要問題是搭配不穩定而非絕對不合文法。 「lightly-developed」在此應改為「lightly developed」。以-ly 結尾的副詞和其後的分詞或形容詞一般不用連字號，例如 lightly developed、densely populated。 「to a density」在此應改為「into a denser」。density 是名詞；在這裡要用形容詞比較級 denser 描述 neighbourhood。 「intends improving」在此應改為「is intended to improve」。phase 本身沒有意圖；它是被設計來達到某目的，因此使用 be intended to + 動詞原形。 「remain」在此應改為「retaining」。省略重複主語時， while 後可用現在分詞：while retaining...。也可寫完整分句 while it retains...。"
  },
  {
    "sentenceId": "PARA-0017-S03",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "On 1995, a two-lanes road went from west towards east besides the northern bank of River Elin.",
    "correctedSentence": "In 1995, a two-lane road ran from west to east along the northern bank of the River Elin.",
    "categories": [
      "article_or_determiner",
      "preposition",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "ARTICLE_RIVER_NAME_THE_RIVER_NAME",
      "MAP_ROUTE_RUN_FROM_TO",
      "NOUN_COMPOUND_NUMERAL_SINGULAR_HYPHEN",
      "PREP_MAP_ALONG_BANK_NOT_BESIDES",
      "PREP_YEAR_IN"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "category:singular_plural",
      "category:word_choice",
      "rule:ARTICLE_RIVER_NAME_THE_RIVER_NAME",
      "rule:MAP_ROUTE_RUN_FROM_TO",
      "rule:NOUN_COMPOUND_NUMERAL_SINGULAR_HYPHEN",
      "rule:PREP_MAP_ALONG_BANK_NOT_BESIDES",
      "rule:PREP_YEAR_IN"
    ],
    "explanationZhHant": "「On 1995」在此應改為「In 1995」。年份前使用 in。on 用於日期，例如 on 5 May 1995。 「a two-lanes road」在此應改為「a two-lane road」。數字和量度單位共同放在名詞前作修飾語時，單位用單數並加連字號：a two-lane road。 「went from west towards east」在此應改為「ran from west to east」。描述道路的走向通常用 run from A to B。 go towards 可描述移動方向，但較不適合靜態地圖中的道路位置。 「besides the northern bank」在此應改為「along the northern bank」。along 表示道路與河岸平行延伸。 besides 表示「此外」；beside 才表示「在旁邊」，但仍不一定表達沿線延伸。 「River Elin」在此應改為「the River Elin」。本資料集把官方名稱定為 the River Elin。河流名稱通常帶 the，但專名必須按地圖標示確認。"
  },
  {
    "sentenceId": "PARA-0017-S04",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A row of cottages stood in the north side of the road, opposite of a small park.",
    "correctedSentence": "A row of cottages stood on the north side of the road, opposite a small park.",
    "categories": [
      "preposition",
      "word_choice"
    ],
    "ruleIds": [
      "MAP_OPPOSITE_DIRECT_OBJECT",
      "PREP_ON_SIDE_OF"
    ],
    "structureTags": [
      "category:preposition",
      "category:word_choice",
      "rule:MAP_OPPOSITE_DIRECT_OBJECT",
      "rule:PREP_ON_SIDE_OF"
    ],
    "explanationZhHant": "「in the north side of」在此應改為「on the north side of」。表示某物位於道路或區域的某一邊，用 on the north side of。 「opposite of a small park」在此應改為「opposite a small park」。opposite 作介詞時可直接接名詞：opposite the park。 opposite to 在部分英式用法中亦可能成立，但不寫 opposite of。"
  },
  {
    "sentenceId": "PARA-0017-S05",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The post office laid among the park and a grocery shop, while a warehouse occupied the site on the east end in the district.",
    "correctedSentence": "The post office lay between the park and a grocery shop, while a warehouse occupied the site at the eastern end of the district.",
    "categories": [
      "other_grammar",
      "preposition",
      "word_choice"
    ],
    "ruleIds": [
      "MAP_LOCATION_AT_EASTERN_END_OF",
      "PREP_BETWEEN_TWO_LANDMARKS",
      "VERB_LIE_PAST_LAY_NOT_LAID"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "category:word_choice",
      "coordination",
      "rule:MAP_LOCATION_AT_EASTERN_END_OF",
      "rule:PREP_BETWEEN_TWO_LANDMARKS",
      "rule:VERB_LIE_PAST_LAY_NOT_LAID",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「laid」在此應改為「lay」。表示建築物位於某處，動詞是 lie，過去式為 lay。laid 是及物動詞 lay 的過去式，例如 laid the map on the table。 「among the park and a grocery shop」在此應改為「between the park and a grocery shop」。只有兩個明確地標時使用 between A and B。 「on the east end in the district」在此應改為「at the eastern end of the district」。固定位置框架是 at the eastern end of + 地區／道路。 eastern 是放在名詞前的形容詞。"
  },
  {
    "sentenceId": "PARA-0017-S06",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At south of the river, farmlands extended until the railway, and the area could only access through a narrow walking bridge.",
    "correctedSentence": "South of the river, farmland extended towards the railway, and the area was accessible only via a narrow footbridge.",
    "categories": [
      "countability",
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_ACCESSIBLE_BE_COMPLEMENT",
      "COUNT_FARMLAND_UNCOUNTABLE",
      "MAP_ACCESS_VIA_FOOTBRIDGE",
      "MAP_EXTEND_TOWARDS",
      "MAP_LOCATION_SOUTH_OF_NO_AT"
    ],
    "structureTags": [
      "category:countability",
      "category:word_choice",
      "category:word_form",
      "coordination",
      "modal",
      "rule:ADJ_ACCESSIBLE_BE_COMPLEMENT",
      "rule:COUNT_FARMLAND_UNCOUNTABLE",
      "rule:MAP_ACCESS_VIA_FOOTBRIDGE",
      "rule:MAP_EXTEND_TOWARDS",
      "rule:MAP_LOCATION_SOUTH_OF_NO_AT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「At south of the river」在此應改為「South of the river」。south of + 地標本身已是位置介詞結構，不在前面加 at。若指區域內部，可寫 in the south of the district。 「farmlands」在此應改為「farmland」。farmland 表示農地整體時通常不可數。要表示多塊土地，可寫 areas of farmland 或 fields。 「extended until the railway」在此應改為「extended towards the railway」。表示土地朝某一方向延伸但未必到達終點，用 extend towards。 until 主要表示時間界線。 「the area could only access」在此應改為「the area was accessible only」。area 是可被到達的地方，應用形容詞 accessible 配合 be。 若使用動詞，主語應是人：People could access the area。 「through a narrow walking bridge」在此應改為「via a narrow footbridge」。表示到達某地所經由的設施，可用 via。專供行人使用的小橋通常稱為 footbridge。"
  },
  {
    "sentenceId": "PARA-0017-S07",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "No road bridge was crossed the river, and there had no direct connection between the station to the town centre.",
    "correctedSentence": "No road bridge crossed the river, and there was no direct connection between the station and the town centre.",
    "categories": [
      "other_grammar",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CLAUSE_EXISTENTIAL_THERE_WAS_NO",
      "PREP_CONNECTION_BETWEEN_AND",
      "VERB_BRIDGE_CROSS_ACTIVE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:preposition",
      "category:sentence_structure",
      "coordination",
      "have_auxiliary",
      "infinitive_to",
      "negation",
      "rule:CLAUSE_EXISTENTIAL_THERE_WAS_NO",
      "rule:PREP_CONNECTION_BETWEEN_AND",
      "rule:VERB_BRIDGE_CROSS_ACTIVE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「No road bridge was crossed the river」在此應改為「No road bridge crossed the river」。bridge 橫跨 river， 所以 cross 用主動式。被動式應由被跨越的事物作主語： The river was crossed by a bridge。 「there had no direct connection」在此應改為「there was no direct connection」。英文存現句使用 there + be： there was no...。不能把粵語或中文的「有」直接翻成 there had。 「between the station to the town centre」在此應改為「between the station and the town centre」。between 與 and 配對。另一個正確框架是 a connection from the station to the town centre。"
  },
  {
    "sentenceId": "PARA-0017-S08",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "During following thirty years, the cottages replaced by three apartment blocks, and the grocery shop was converted as a medical centre.",
    "correctedSentence": "Over the following thirty years, the cottages were replaced by three apartment blocks, and the grocery shop was converted into a medical centre.",
    "categories": [
      "other_grammar",
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PASSIVE_PAST_WERE_REPLACED_BY",
      "PREP_OVER_THE_FOLLOWING_PERIOD",
      "VERB_CONVERT_INTO"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:preposition",
      "category:verb_form_or_tense",
      "coordination",
      "rule:PASSIVE_PAST_WERE_REPLACED_BY",
      "rule:PREP_OVER_THE_FOLLOWING_PERIOD",
      "rule:VERB_CONVERT_INTO",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「During following thirty years」在此應改為「Over the following thirty years」。the following thirty years 是特定時段，需要 the。描述整段期間的發展可用 over。 during 也可，但同樣需要 the。 「the cottages replaced by」在此應改為「the cottages were replaced by」。cottages 是被取代的設施，所以需要過去被動語態 were replaced by。 「converted as a medical centre」在此應改為「converted into a medical centre」。表示建築物改作另一種用途，用 convert A into B；被動式為 A was converted into B。"
  },
  {
    "sentenceId": "PARA-0017-S09",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The park was expanded to east, despite its original entrance remained at the same location.",
    "correctedSentence": "The park was enlarged eastwards, although its original entrance remained in the same position.",
    "categories": [
      "conjunction",
      "word_choice"
    ],
    "ruleIds": [
      "CONJ_ALTHOUGH_FINITE_CLAUSE",
      "MAP_ENLARGE_EASTWARDS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:conjunction",
      "category:word_choice",
      "infinitive_to",
      "rule:CONJ_ALTHOUGH_FINITE_CLAUSE",
      "rule:MAP_ENLARGE_EASTWARDS",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「expanded to east」在此應改為「enlarged eastwards」。eastwards 是方向副詞，可直接修飾擴建動作。也可寫 expanded to the east，但不能省略 the。 「despite its original entrance remained at the same location」在此應改為「although its original entrance remained in the same position」。although 後面接完整有限分句。 despite 後面接名詞或動名詞，例如 despite the entrance remaining unchanged。"
  },
  {
    "sentenceId": "PARA-0017-S10",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The warehouse demolished, and a supermarket constructed over its previous site.",
    "correctedSentence": "The warehouse was demolished, and a supermarket was built on its former site.",
    "categories": [
      "verb_form_or_tense",
      "word_choice"
    ],
    "ruleIds": [
      "MAP_BUILD_ON_FORMER_SITE",
      "PASSIVE_PAST_WAS_BUILT",
      "PASSIVE_PAST_WAS_DEMOLISHED"
    ],
    "structureTags": [
      "category:verb_form_or_tense",
      "category:word_choice",
      "coordination",
      "rule:MAP_BUILD_ON_FORMER_SITE",
      "rule:PASSIVE_PAST_WAS_BUILT",
      "rule:PASSIVE_PAST_WAS_DEMOLISHED",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「The warehouse demolished」在此應改為「The warehouse was demolished」。warehouse 是被拆除的建築，需要 was + 過去分詞。 「a supermarket constructed」在此應改為「a supermarket was built」。supermarket 是被建造的設施，主句需要完整的被動謂語。 was constructed 也是正確替代。 「over its previous site」在此應改為「on its former site」。建築物佔用一塊地點時通常用 on a site。 former site 表示先前由另一設施佔用的位置。"
  },
  {
    "sentenceId": "PARA-0017-S11",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A road bridge was constructed across the river, linking between the main road and the station.",
    "correctedSentence": "A road bridge was constructed across the river, linking the main road with the station.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "VERB_LINK_A_WITH_B_NO_BETWEEN"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "coordination",
      "rule:VERB_LINK_A_WITH_B_NO_BETWEEN",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「linking between the main road and the station」在此應改為「linking the main road with the station」。動詞 link 使用 link A with/to B。名詞結構才可寫 a link between A and B。"
  },
  {
    "sentenceId": "PARA-0017-S12",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In addition, the footbridge was moved for about 200 metres at the west from its original position.",
    "correctedSentence": "In addition, the footbridge was relocated about 200 metres west of its original position.",
    "categories": [
      "word_choice"
    ],
    "ruleIds": [
      "MAP_DISTANCE_WEST_OF",
      "MEASURE_MOVE_DISTANCE_NO_FOR"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:word_choice",
      "rule:MAP_DISTANCE_WEST_OF",
      "rule:MEASURE_MOVE_DISTANCE_NO_FOR",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「moved for about 200 metres」在此應改為「relocated about 200 metres」。距離可直接放在移動動詞後：moved 200 metres。 for 通常引出持續時間，不引出這種空間距離。 「at the west from its original position」在此應改為「west of its original position」。表示相對位置，用距離 + west of + 地標：200 metres west of...。"
  },
  {
    "sentenceId": "PARA-0017-S13",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The road section next the park was made pedestrian, with traffic redirected in a new bypass which ran around north edge of district.",
    "correctedSentence": "The section of road beside the park was pedestrianised, with traffic diverted onto a new bypass running around the northern edge of the district.",
    "categories": [
      "article_or_determiner",
      "preposition",
      "word_form"
    ],
    "ruleIds": [
      "ARTICLE_DEFINED_DISTRICT_THE",
      "PREP_DIVERT_TRAFFIC_ONTO",
      "PREP_NEXT_TO_REQUIRES_TO",
      "WORDFORM_NORTH_TO_NORTHERN_ATTRIBUTIVE",
      "WORDFORM_PEDESTRIANISE_ROAD"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:article_or_determiner",
      "category:preposition",
      "category:word_form",
      "rule:ARTICLE_DEFINED_DISTRICT_THE",
      "rule:PREP_DIVERT_TRAFFIC_ONTO",
      "rule:PREP_NEXT_TO_REQUIRES_TO",
      "rule:WORDFORM_NORTH_TO_NORTHERN_ATTRIBUTIVE",
      "rule:WORDFORM_PEDESTRIANISE_ROAD",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「The road section next」在此應改為「The section of road beside」。可寫 next to the park 或 beside the park。 next 單獨不能在這裡作介詞。 「made pedestrian」在此應改為「pedestrianised」。把道路改為行人專用區，標準地圖描述動詞是 pedestrianise。made pedestria n-only 也是正確替代。 「redirected in a new bypass which ran」在此應改為「diverted onto a new bypass running」。把交通流改道至另一條道路，用 divert traffic onto + 道路。into 多表示進入封閉空間。 「north」在此應改為「the northern」。放在名詞 edge 前作修飾語時，使用形容詞 northern。 「district」在此應改為「the district」。這裡指前文已界定的 Riverside district，因此使用 the district。"
  },
  {
    "sentenceId": "PARA-0017-S14",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A parking was added besides the supermarket, and a bus station was installed on the cross of the bypass with Station Road.",
    "correctedSentence": "A car park was added next to the supermarket, and a bus stop was installed at the junction of the bypass and Station Road.",
    "categories": [
      "countability",
      "word_choice"
    ],
    "ruleIds": [
      "COUNT_PARKING_CAR_PARK",
      "MAP_BUS_STOP_NOT_STATION",
      "MAP_JUNCTION_AT_OF_AND",
      "WORDCHOICE_BESIDE_NOT_BESIDES"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:countability",
      "category:word_choice",
      "coordination",
      "rule:COUNT_PARKING_CAR_PARK",
      "rule:MAP_BUS_STOP_NOT_STATION",
      "rule:MAP_JUNCTION_AT_OF_AND",
      "rule:WORDCHOICE_BESIDE_NOT_BESIDES",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「A parking」在此應改為「A car park」。parking 表示泊車活動或泊車空間整體時通常不可數。圖上的一個獨立設施應寫 a car park 或 a parking area。 「besides the supermarket」在此應改為「next to the supermarket」。beside／ next to 表示在旁邊； besides 表示「此外」或「除……之外」。 「a bus station」在此應改為「a bus stop」。bus stop 是路旁停靠點；bus station 是較大型、有多條路線的總站。必須按地圖符號確認，不能只靠句子猜測。 「on the cross of the bypass with Station Road」在此應改為「at the junction of the bypass and Station Road」。道路交會點使用 at the junction of A and B。cross 通常是動詞；名詞可用 crossroads，但結構不同。"
  },
  {
    "sentenceId": "PARA-0017-S15",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Regardless these changes, the railway station remained out of the district border, at south of the new bridge.",
    "correctedSentence": "Despite these changes, the railway station remained outside the district boundary, south of the new bridge.",
    "categories": [
      "preposition",
      "word_choice"
    ],
    "ruleIds": [
      "MAP_LOCATION_SOUTH_OF_NO_AT",
      "MAP_OUTSIDE_BOUNDARY",
      "PREP_REGARDLESS_OF"
    ],
    "structureTags": [
      "category:preposition",
      "category:word_choice",
      "rule:MAP_LOCATION_SOUTH_OF_NO_AT",
      "rule:MAP_OUTSIDE_BOUNDARY",
      "rule:PREP_REGARDLESS_OF",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Regardless these changes」在此應改為「Despite these changes」。regardless 後面必須使用 of： regardless of these changes。 目標句採用同義而較精簡的 despite these changes。 「out of the district border」在此應改為「outside the district boundary」。表示位於區域邊界之外，通常用 outside + 地區／ boundary。 out of 多表示從內部移出。 「at south of the new bridge」在此應改為「south of the new bridge」。south of 已直接表示相對位置，不加 at。"
  },
  {
    "sentenceId": "PARA-0017-S16",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The supermarket faced to medical centre, whereas the bus stop was located diagonal opposite with the park entrance.",
    "correctedSentence": "The supermarket faced the medical centre, whereas the bus stop was situated diagonally opposite the park entrance.",
    "categories": [
      "other_grammar",
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "MAP_OPPOSITE_NO_WITH",
      "VERB_FACE_DIRECT_OBJECT",
      "WORDFORM_DIAGONALLY_ADVERB"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:word_choice",
      "category:word_form",
      "infinitive_to",
      "rule:MAP_OPPOSITE_NO_WITH",
      "rule:VERB_FACE_DIRECT_OBJECT",
      "rule:WORDFORM_DIAGONALLY_ADVERB",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「faced to medical centre」在此應改為「faced the medical centre」。face 表示朝向某地時直接接賓語，不加 to。 此處也需要 the 指已知的 medical centre。 「located diagonal」在此應改為「situated diagonally」。修飾位置關係 opposite 要用副詞 diagonally，不用形容詞 diagonal。 「opposite with the park entrance」在此應改為「opposite the park entrance」。opposite 作介詞時直接接地標，不使用 with。"
  },
  {
    "sentenceId": "PARA-0017-S17",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Until 2035, it is planned a walkway for connecting the station with public square, and bicycle parkings will be supplied in the both sides of southern ramp.",
    "correctedSentence": "By 2035, a walkway is planned to connect the station to the public square, and bicycle parking will be provided on both sides of the southern ramp.",
    "categories": [
      "article_or_determiner",
      "countability",
      "infinitive_or_gerund",
      "other_grammar",
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "ARTICLE_SPECIFIC_RAMP_THE",
      "COLLOC_PROVIDE_PARKING",
      "COUNT_BICYCLE_PARKING_UNCOUNTABLE",
      "PASSIVE_PLANNED_FEATURE_SUBJECT_FRONTING",
      "PREP_MAP_FUTURE_BY_YEAR",
      "PREP_ON_BOTH_SIDES_NO_THE",
      "PURPOSE_TO_INFINITIVE",
      "VERB_CONNECT_A_TO_B"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:article_or_determiner",
      "category:countability",
      "category:infinitive_or_gerund",
      "category:other_grammar",
      "category:preposition",
      "category:verb_form_or_tense",
      "coordination",
      "modal",
      "rule:ARTICLE_SPECIFIC_RAMP_THE",
      "rule:COLLOC_PROVIDE_PARKING",
      "rule:COUNT_BICYCLE_PARKING_UNCOUNTABLE",
      "rule:PASSIVE_PLANNED_FEATURE_SUBJECT_FRONTING",
      "rule:PREP_MAP_FUTURE_BY_YEAR",
      "rule:PREP_ON_BOTH_SIDES_NO_THE",
      "rule:PURPOSE_TO_INFINITIVE",
      "rule:VERB_CONNECT_A_TO_B",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Until」在此應改為「By」。表示該設施到 2035 年時預計建成，用 by。 「it is planned a walkway」在此應改為「a walkway is planned」。英文不使用 it is planned + 名詞來表示某項設施獲規劃。應把設施放作被動句主語：A walkway is planned。 「for connecting」在此應改為「to connect」。表示建造 walkway 的目的，用 to + 動詞原形。for + 動名詞可描述物件的一般用途，但本句是具體建設目的。 「with」在此應改為「to the」。實體路線連接兩個地點時，可用 connect A to B。 the public square 是已規劃的特定設施，需要 the。 connect A with B 也可成立。 「parkings」在此應改為「parking」。parking 表示泊車設施整體時不可數。要計算可寫 bicycle parking spaces 或 bicycle racks。 「supplied」在此應改為「provided」。表示設置公共設施通常用 provide parking。supply 多用於可供應的物品或服務，例如水、電或設備。 「in the」在此應改為「on」。固定結構是 on both sides of...。 both 已限定兩邊，不在前面加入 the。 「southern」在此應改為「the southern」。這裡指已界定的特定斜道，需要 the。"
  },
  {
    "sentenceId": "PARA-0017-S18",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "According to 2035 proposal, the medical centre is due for extending to north, and a pharmacy will add adjacent with it.",
    "correctedSentence": "In the 2035 proposal, the medical centre is due to be extended to the north, and a pharmacy will be added beside it.",
    "categories": [
      "verb_form_or_tense",
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_ADJACENT_TO",
      "MAP_DIRECTION_TO_THE_NORTH",
      "MAP_IN_THE_PROPOSAL",
      "PASSIVE_DUE_TO_BE_PARTICIPLE",
      "PASSIVE_FUTURE_WILL_BE_ADDED"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:verb_form_or_tense",
      "category:word_choice",
      "category:word_form",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:ADJ_ADJACENT_TO",
      "rule:MAP_DIRECTION_TO_THE_NORTH",
      "rule:MAP_IN_THE_PROPOSAL",
      "rule:PASSIVE_DUE_TO_BE_PARTICIPLE",
      "rule:PASSIVE_FUTURE_WILL_BE_ADDED",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「According to 2035 proposal」在此應改為「In the 2035 proposal」。表示某設施出現在一份規劃方案內， 可寫 in the proposal。若使用 according to， 也必須寫 according to the 2035 proposal。 「is due for extending」在此應改為「is due to be extended」。表示預定進行的被動工程，用 be due to be + 過去分詞。 名詞結構可寫 is due for extension。 「to north」在此應改為「to the north」。表示擴建方向，可寫 to the north 或 northwards。此結構中的方位名詞需要 the。 「a pharmacy will add」在此應改為「a pharmacy will be added」。pharmacy 是將被增設的設施，需要將來被動語態。 「adjacent with it」在此應改為「beside it」。adjacent 的固定搭配是 adjacent to，不用 with。 目標句採用較簡單的 beside it。"
  },
  {
    "sentenceId": "PARA-0017-S19",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Apartment block at centre will knock down, and its site will turn to a public square surrounding with cafés.",
    "correctedSentence": "The central apartment block will be demolished, with the site becoming a public square surrounded by cafés.",
    "categories": [
      "other_grammar",
      "verb_form_or_tense",
      "word_choice"
    ],
    "ruleIds": [
      "MAP_CENTRAL_FEATURE_ARTICLE_AND_WORD_FORM",
      "PASSIVE_PHRASAL_KNOCK_DOWN",
      "PASSIVE_SURROUNDED_BY",
      "VERB_TURN_INTO_NOT_TURN_TO"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:verb_form_or_tense",
      "category:word_choice",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:MAP_CENTRAL_FEATURE_ARTICLE_AND_WORD_FORM",
      "rule:PASSIVE_PHRASAL_KNOCK_DOWN",
      "rule:PASSIVE_SURROUNDED_BY",
      "rule:VERB_TURN_INTO_NOT_TURN_TO",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Apartment block at centre will」在此應改為「The central apartment block will」。指三座公寓中位於中央的特定一座，用 the central apartment block。 central 是前置形容詞。 「knock down」在此應改為「be demolished」。建築物是被拆卸的對象，因此要使用被動式： will be knocked down 或 will be demolished。 「and its site will turn to」在此應改為「with the site becoming」。表示地點轉變成另一種用途，用 turn into 或 become。 turn to 常表示轉向某人、某方法或某頁。 「surrounding with」在此應改為「surrounded by」。public square 是被 cafés 包圍的地方，所以用 surrounded by。 surrounded with 只在少數「配備／裝飾」語境可見。"
  },
  {
    "sentenceId": "PARA-0017-S20",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "A cycling path will run along side both river banks and pass under of the road bridge.",
    "correctedSentence": "A cycle path will run alongside both banks of the river and pass beneath the road bridge.",
    "categories": [
      "article_or_determiner",
      "preposition",
      "spelling_or_spacing"
    ],
    "ruleIds": [
      "COLLOC_CYCLE_PATH",
      "DETERMINER_BOTH_BANKS_OF_RIVER",
      "ORTHOGRAPHY_ALONGSIDE_ONE_WORD",
      "PREP_BENEATH_NO_OF"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:preposition",
      "category:spelling_or_spacing",
      "coordination",
      "modal",
      "rule:COLLOC_CYCLE_PATH",
      "rule:DETERMINER_BOTH_BANKS_OF_RIVER",
      "rule:ORTHOGRAPHY_ALONGSIDE_ONE_WORD",
      "rule:PREP_BENEATH_NO_OF",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「cycling path」在此應改為「cycle path」。指專供單車使用的道路，常用固定複合名詞 cycle path。 cycling path 可以理解，但不是一般地圖標示。 「along side」在此應改為「alongside」。介詞 alongside 表示沿着或緊鄰某物，寫作一個字。 along the side of 則是另一個完整結構。 「both river banks」在此應改為「both banks of the river」。both river banks 並非一定錯，但 both banks of the river 更清楚地表示同一條河的兩岸。本規則應先作 suggestio n-only，避免攻擊正確複合名詞。 「under of the road bridge」在此應改為「beneath the road bridge」。under 和 beneath 都直接接名詞，不加 of。"
  },
  {
    "sentenceId": "PARA-0017-S21",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Two ramps will provide the path an access from every side of the bridge.",
    "correctedSentence": "Two ramps will provide access to the path from either side of the bridge.",
    "categories": [
      "article_or_determiner",
      "other_grammar"
    ],
    "ruleIds": [
      "DETERMINER_EITHER_SIDE_OF_TWO",
      "VERB_PROVIDE_ACCESS_TO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:other_grammar",
      "modal",
      "rule:DETERMINER_EITHER_SIDE_OF_TWO",
      "rule:VERB_PROVIDE_ACCESS_TO"
    ],
    "explanationZhHant": "「provide the path an access」在此應改為「provide access to the path」。access 在這裡不可數。固定結構是 provide access to + 地點／設施，不能把 path 和 access 當作雙賓語。 「from every side of the bridge」在此應改為「from either side of the bridge」。橋只有兩邊，因此指其中任何一邊時用 either side。 every 通常用於三個或以上可逐一計算的項目。"
  },
  {
    "sentenceId": "PARA-0017-S22",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The existing car park will relocate underground, which allows the above land to use for a playground.",
    "correctedSentence": "The existing car park will be moved underground, allowing the land above it to be used as a playground.",
    "categories": [
      "preposition",
      "sentence_structure",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "CLAUSE_RESULT_ALLOWING_LAND_ABOVE_IT",
      "PASSIVE_FUTURE_WILL_BE_MOVED",
      "PASSIVE_INFINITIVE_TO_BE_USED",
      "PREP_USED_AS_ROLE"
    ],
    "structureTags": [
      "category:preposition",
      "category:sentence_structure",
      "category:verb_form_or_tense",
      "infinitive_to",
      "modal",
      "rule:CLAUSE_RESULT_ALLOWING_LAND_ABOVE_IT",
      "rule:PASSIVE_FUTURE_WILL_BE_MOVED",
      "rule:PASSIVE_INFINITIVE_TO_BE_USED",
      "rule:PREP_USED_AS_ROLE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「relocate」在此應改為「be moved」。car park 是被遷移的設施，需要被動式。若主語是管理部門，可寫 The council will relocate the car park。 「which allows the above land」在此應改為「allowing the land above it」。the above land 通常表示「上文提及的土地」，不是物理上位於上方的土地。應寫 the land above it。現在分詞 allowing 清楚表示前述工程的結果。 「use」在此應改為「be used」。land 是被使用的地方，因此不定詞要使用被動式 to be used。 「for」在此應改為「as」。某地方直接充當某種設施時，用 used as + 身分／用途。used for 通常接動名詞或活動，例如 used for playing。"
  },
  {
    "sentenceId": "PARA-0017-S23",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In the south-east corner from the district, part of farmland will divide to plots of detached housings.",
    "correctedSentence": "At the south-eastern corner of the district, part of the farmland will be divided into plots for detached houses.",
    "categories": [
      "article_or_determiner",
      "other_grammar",
      "verb_form_or_tense",
      "word_choice"
    ],
    "ruleIds": [
      "ARTICLE_PART_OF_THE_LAND",
      "MAP_CORNER_AT_OF",
      "MAP_PLOTS_FOR_HOUSES_HOUSING_COUNTABILITY",
      "PASSIVE_FUTURE_WILL_BE_DIVIDED",
      "VERB_DIVIDE_INTO"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:other_grammar",
      "category:verb_form_or_tense",
      "category:word_choice",
      "infinitive_to",
      "modal",
      "rule:ARTICLE_PART_OF_THE_LAND",
      "rule:MAP_CORNER_AT_OF",
      "rule:MAP_PLOTS_FOR_HOUSES_HOUSING_COUNTABILITY",
      "rule:PASSIVE_FUTURE_WILL_BE_DIVIDED",
      "rule:VERB_DIVIDE_INTO",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「In the south-east corner from」在此應改為「At the south-eastern corner of」。地圖位置常用 at the... corner of + 地區。前置修飾語使用形容詞 south-eastern。 「farmland」在此應改為「the farmland」。這裡指前文已提及的特定 farmland，因此使用 the。泛指農地時，零冠詞可以成立。 「divide」在此應改為「be divided」。farmland 是被劃分的土地，需要將來被動語態。 「to」在此應改為「into」。把一個整體分成多個部分，用 divide A into B。 divide between/among 可表示分配給不同人。 「of detached housings」在此應改為「for detached houses」。housing 通常不可數，表示房屋供應整體；可逐一計算的建築物是 houses。土地預留給某種建築，用 plots for...。"
  },
  {
    "sentenceId": "PARA-0017-S24",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "These homes will be facing to the river and will connect with the station through a road branched from Station Road.",
    "correctedSentence": "These homes will face the river and will be connected to the station by a road branching off Station Road.",
    "categories": [
      "other_grammar",
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PASSIVE_CONNECTED_TO",
      "PHRASAL_BRANCH_OFF",
      "PREP_BY_ROAD_MEANS_OF_CONNECTION",
      "VERB_FACE_DIRECT_OBJECT"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:preposition",
      "category:verb_form_or_tense",
      "coordination",
      "infinitive_to",
      "modal",
      "rule:PASSIVE_CONNECTED_TO",
      "rule:PHRASAL_BRANCH_OFF",
      "rule:PREP_BY_ROAD_MEANS_OF_CONNECTION",
      "rule:VERB_FACE_DIRECT_OBJECT",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「be facing to」在此應改為「face」。face 表示建築朝向某地時直接接賓語。一般規劃描述使用簡單將來式，不必使用進行式。 「connect with」在此應改為「be connected to」。homes 是透過道路被連接至車站的地點，因此用被動式 be connected to。 「through」在此應改為「by」。表示兩地由某條道路連接，用 by a road。 through 可描述道路穿過森林或城鎮。 「branched from」在此應改為「branching off」。道路從主要道路分岔，用 branch off + 道路。現在分詞 branching 主動修飾 road； branched 會形成不完整或錯誤的被動意思。"
  },
  {
    "sentenceId": "PARA-0017-S25",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At the end, the footbridge will remain as unchanged, but the neighbour riverbank will widen for creating a viewing place.",
    "correctedSentence": "Finally, the footbridge will remain unchanged, but the nearby riverbank will be widened to create a viewing area.",
    "categories": [
      "conjunction",
      "verb_form_or_tense",
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "LINKER_FINALLY_NOT_AT_THE_END",
      "LINKING_REMAIN_ADJECTIVE_NO_AS",
      "MAP_PURPOSE_CREATE_VIEWING_AREA",
      "PASSIVE_FUTURE_WILL_BE_WIDENED",
      "WORDFORM_NEARBY_ATTRIBUTIVE"
    ],
    "structureTags": [
      "category:conjunction",
      "category:verb_form_or_tense",
      "category:word_choice",
      "category:word_form",
      "coordination",
      "modal",
      "rule:LINKER_FINALLY_NOT_AT_THE_END",
      "rule:LINKING_REMAIN_ADJECTIVE_NO_AS",
      "rule:MAP_PURPOSE_CREATE_VIEWING_AREA",
      "rule:PASSIVE_FUTURE_WILL_BE_WIDENED",
      "rule:WORDFORM_NEARBY_ATTRIBUTIVE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「At the end」在此應改為「Finally」。finally 可作篇章連接語，引出最後一項變化。at the end 通常需要說明甚麼的末端，例如 at the end of the road。 「as unchanged」在此應改為「unchanged」。remain 是連繫動詞，後面直接接形容詞補語 unchanged，不用 as。 「neighbour」在此應改為「nearby」。neighbour 是名詞，通常指人或相鄰事物；修飾位置接近的 riverbank 可用形容詞 nearby 或 neighbouring。 「widen」在此應改為「be widened」。人為工程把 riverbank 擴闊，因此使用被動式。若自然作用令河岸自行變闊，不及物 will widen 才可能成立。 「for creating a viewing place」在此應改為「to create a viewing area」。具體工程目的用 to create。地圖設施通常稱為 viewing area、 viewing platform 或 observation area。"
  },
  {
    "sentenceId": "PARA-0017-S26",
    "paragraphId": "PARA-0017",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "By 2035, most of residents will reside at a walking distance from shops, public transports and opened spaces.",
    "correctedSentence": "By 2035, most residents will live within walking distance of shops, public transport and open space.",
    "categories": [
      "article_or_determiner",
      "countability",
      "preposition",
      "word_form"
    ],
    "ruleIds": [
      "COLLOC_WITHIN_WALKING_DISTANCE_OF",
      "COUNT_PUBLIC_TRANSPORT_UNCOUNTABLE",
      "DETERMINER_MOST_GENERIC_NO_OF",
      "WORDFORM_OPEN_SPACE_NOT_OPENED"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:countability",
      "category:preposition",
      "category:word_form",
      "coordination",
      "modal",
      "rule:COLLOC_WITHIN_WALKING_DISTANCE_OF",
      "rule:COUNT_PUBLIC_TRANSPORT_UNCOUNTABLE",
      "rule:DETERMINER_MOST_GENERIC_NO_OF",
      "rule:WORDFORM_OPEN_SPACE_NOT_OPENED",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「of residents」在此應改為「residents」。泛指大部分居民，用 most residents。指某一群已界定居民時才寫 most of the residents。 「reside at a walking distance from」在此應改為「live within walking distance of」。固定搭配是 within walking distance of + 地點。at a distance from 可表示一般距離，但不能混合兩種框架。 「transports」在此應改為「transport」。public transport 表示公共交通系統整體時不可數。要計算可寫 forms of public transport。 「opened spaces」在此應改為「open space」。open space 指未被建築物佔用的公共空間。opened 是動詞過去分詞，表示某物已被打開。open spaces 也可用於多個獨立空間。"
  },
  {
    "sentenceId": "PARA-0018-S01",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The line graph illustrates about annual household electricity use in four regions, measured by MWh, between 2005 to 2035, while the bar chart compares between its sources.",
    "correctedSentence": "The line graph illustrates annual household electricity use in four regions, measured in MWh, between 2005 and 2035, while the bar chart compares its sources.",
    "categories": [
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "PREP_BETWEEN_AND_TIME_RANGE",
      "PREP_MEASURED_IN_UNIT",
      "VERB_COMPARE_DIRECT_OBJECT_NO_BETWEEN",
      "VERB_ILLUSTRATE_DIRECT_OBJECT_NO_ABOUT"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "rule:PREP_BETWEEN_AND_TIME_RANGE",
      "rule:PREP_MEASURED_IN_UNIT",
      "rule:VERB_COMPARE_DIRECT_OBJECT_NO_BETWEEN",
      "rule:VERB_ILLUSTRATE_DIRECT_OBJECT_NO_ABOUT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「illustrates about」在此應改為「illustrates」。illustrate 是及物動詞，直接接所展示的內容，不加 about。對照： provide information about electricity use。 「measured by MWh」在此應改為「measured in MWh」。表示數據使用甚麼單位，用 measured in + 單位。 measured by 可引出測量工具或方法，例如 measured by a digital meter。 「between 2005 to 2035」在此應改為「between 2005 and 2035」。between 必須與 and 配對。另一個正確框架是 from 2005 to 2035。 「compares between its sources」在此應改為「compares its sources」。compare 作動詞時直接接比較對象。名詞結構才使用 a comparison between A and B。"
  },
  {
    "sentenceId": "PARA-0018-S02",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Overall, Northland led initially but Eastport overtook than it, whereas Westmere remained lowest from the four for most of period.",
    "correctedSentence": "Overall, Northland led initially but Eastport overtook it, whereas Westmere remained the lowest of the four for most of the period.",
    "categories": [
      "article_or_determiner",
      "comparison",
      "other_grammar"
    ],
    "ruleIds": [
      "ARTICLE_MOST_OF_DEFINITE_PERIOD",
      "ARTICLE_SUPERLATIVE_THE_REQUIRED",
      "COMP_SUPERLATIVE_OF_DEFINED_SET",
      "VERB_OVERTAKE_DIRECT_OBJECT_NO_THAN"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:comparison",
      "category:other_grammar",
      "coordination",
      "rule:ARTICLE_MOST_OF_DEFINITE_PERIOD",
      "rule:ARTICLE_SUPERLATIVE_THE_REQUIRED",
      "rule:COMP_SUPERLATIVE_OF_DEFINED_SET",
      "rule:VERB_OVERTAKE_DIRECT_OBJECT_NO_THAN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「overtook than it」在此應改為「overtook it」。overtake 是及物動詞，直接接被超越的對象，不使用 than。 become higher than 才需要 than。 「remained lowest」在此應改為「remained the lowest」。最高級表示一組之中的極端位置，通常使用 the： the lowest。 「from the four」在此應改為「of the four」。表示某項在一個已界定群組中的最高或最低位置，用 of + 群組： the lowest of the four。 「most of period」在此應改為「most of the period」。most of 後面接特定單數名詞時，需要限定詞： most of the period。 泛指多個時段則可寫 most periods。"
  },
  {
    "sentenceId": "PARA-0018-S03",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At 2005, the figure of Northland stood 4.0 MWh, comparing with 3.2 MWh of Eastport.",
    "correctedSentence": "In 2005, the figure for Northland stood at 4.0 MWh, compared with 3.2 MWh for Eastport.",
    "categories": [
      "infinitive_or_gerund",
      "preposition",
      "singular_plural"
    ],
    "ruleIds": [
      "COLLOC_STAND_AT_VALUE",
      "NOUN_FIGURE_FOR_CATEGORY",
      "PARTICIPLE_COMPARED_WITH_BASELINE",
      "PREP_YEAR_IN"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "category:preposition",
      "category:singular_plural",
      "rule:COLLOC_STAND_AT_VALUE",
      "rule:NOUN_FIGURE_FOR_CATEGORY",
      "rule:PARTICIPLE_COMPARED_WITH_BASELINE",
      "rule:PREP_YEAR_IN",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「At 2005」在此應改為「In 2005」。年份前使用 in。at 用於鐘點或非常具體的時間點，例如 at 6 p.m.。 「the figure of Northland」在此應改為「the figure for Northland」。圖表中的某個國家或類別所對應的數字，通常寫 the figure for + 類別。the population of Northland 則可使用 of。 「stood 4.0 MWh」在此應改為「stood at 4.0 MWh」。stand at + 數值表示某項數據處於指定水平。不能直接寫 stand 4.0。 「comparing with」在此應改為「compared with」。這裡是「 Northland 的數字被拿來與 Eastport 比較」，使用過去分詞 compared with。 comparing 需要一個主動進行比較的執行者。 「3.2 MWh of Eastport」在此應改為「3.2 MWh for Eastport」。某類別所錄得的數值使用 for：3.2 MWh for Eastport。"
  },
  {
    "sentenceId": "PARA-0018-S04",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Northland then rose from 4.0 by a peak at 4.5 MWh in 2010, an increase by 0.5 MWh.",
    "correctedSentence": "Northland then rose from 4.0 to a peak of 4.5 MWh in 2010, an increase of 0.5 MWh.",
    "categories": [
      "comparison",
      "singular_plural"
    ],
    "ruleIds": [
      "CHANGE_RISE_FROM_TO",
      "NOUN_INCREASE_OF_AMOUNT",
      "NOUN_PEAK_OF_VALUE"
    ],
    "structureTags": [
      "category:comparison",
      "category:singular_plural",
      "rule:CHANGE_RISE_FROM_TO",
      "rule:NOUN_INCREASE_OF_AMOUNT",
      "rule:NOUN_PEAK_OF_VALUE"
    ],
    "explanationZhHant": "「by」在此應改為「to」。描述起點和終點，用 rise from A to B。by 表示改變的幅度，而不是終點。 「at」在此應改為「of」。名詞結構使用 a peak of + 數值。 動詞結構則使用 peaked at + 數值。 「by」在此應改為「of」。名詞 increase 後面用 of 表示增加幅度：an increase of 0.5。 動詞則寫 increased by 0.5。"
  },
  {
    "sentenceId": "PARA-0018-S05",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "After peaked, consumption fell of 1.1 MWh at 3.4 MWh on 2025.",
    "correctedSentence": "After peaking, consumption fell by 1.1 MWh to 3.4 MWh in 2025.",
    "categories": [
      "comparison",
      "preposition",
      "sentence_structure"
    ],
    "ruleIds": [
      "CHANGE_FALL_BY_AMOUNT",
      "CHANGE_FALL_TO_ENDPOINT",
      "CLAUSE_AFTER_GERUND_SAME_SUBJECT",
      "PREP_YEAR_IN"
    ],
    "structureTags": [
      "category:comparison",
      "category:preposition",
      "category:sentence_structure",
      "rule:CHANGE_FALL_BY_AMOUNT",
      "rule:CHANGE_FALL_TO_ENDPOINT",
      "rule:CLAUSE_AFTER_GERUND_SAME_SUBJECT",
      "rule:PREP_YEAR_IN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「After peaked」在此應改為「After peaking」。after 作介詞並直接接動作時，使用動名詞： after peaking。 也可寫完整分句 after it peaked。 「fell of 1.1 MWh」在此應改為「fell by 1.1 MWh」。fall by + 數值表示下降了多少。名詞結構才使用 a fall of 1.1 MWh。 「at 3.4 MWh」在此應改為「to 3.4 MWh」。fall to + 數值表示下降後的最終水平。fall by 表示下降幅度。 「on 2025」在此應改為「in 2025」。年份前使用 in；日期前才使用 on，例如 on 5 May 2025。"
  },
  {
    "sentenceId": "PARA-0018-S06",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Until 2035, the figure is forecast to have fallen further at 3.0 MWh.",
    "correctedSentence": "By 2035, the figure is forecast to have fallen further to 3.0 MWh.",
    "categories": [
      "comparison",
      "preposition"
    ],
    "ruleIds": [
      "CHANGE_FALL_TO_ENDPOINT",
      "PREP_BY_DEADLINE_NOT_UNTIL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:preposition",
      "have_auxiliary",
      "infinitive_to",
      "rule:CHANGE_FALL_TO_ENDPOINT",
      "rule:PREP_BY_DEADLINE_NOT_UNTIL"
    ],
    "explanationZhHant": "「Until 2035」在此應改為「By 2035」。by 2035 表示最遲到 2035 年時達到該水平。 until 2035 表示某狀態持續至 2035 年。 「fallen further at 3.0 MWh」在此應改為「fallen further to 3.0 MWh」。表示下降後到達的水平，用 fall to。"
  },
  {
    "sentenceId": "PARA-0018-S07",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Eastport had risen steadily from 3.2 to 4.4 MWh between 2005 to 2025 before reaching to 4.8 MWh in 2035.",
    "correctedSentence": "Eastport rose steadily from 3.2 to 4.4 MWh between 2005 and 2025 before reaching 4.8 MWh in 2035.",
    "categories": [
      "other_grammar",
      "preposition",
      "verb_form_or_tense"
    ],
    "ruleIds": [
      "PREP_BETWEEN_AND_TIME_RANGE",
      "TENSE_PAST_PERFECT_REQUIRES_PAST_REFERENCE",
      "VERB_REACH_DIRECT_OBJECT_NO_TO"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "category:verb_form_or_tense",
      "have_auxiliary",
      "rule:PREP_BETWEEN_AND_TIME_RANGE",
      "rule:TENSE_PAST_PERFECT_REQUIRES_PAST_REFERENCE",
      "rule:VERB_REACH_DIRECT_OBJECT_NO_TO",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「had risen steadily」在此應改為「rose steadily」。過去完成式通常需要另一個較後的過去參考點。本句只是按時間順序描述圖表數據，因此使用一般過去式。 「between 2005 to 2025」在此應改為「between 2005 and 2025」。between A and B 是固定配對，不能混用 to。 「reaching to 4.8 MWh」在此應改為「reaching 4.8 MWh」。reach 是及物動詞，直接接數值，不加 to。對照： rise to 4.8 MWh。"
  },
  {
    "sentenceId": "PARA-0018-S08",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "This represented a rise by 1.6 MWh, or 50 per cents.",
    "correctedSentence": "This represented a rise of 1.6 MWh, or 50 per cent.",
    "categories": [
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "NOUN_RISE_OF_AMOUNT",
      "UNIT_PER_CENT_INVARIABLE"
    ],
    "structureTags": [
      "category:singular_plural",
      "category:word_choice",
      "coordination",
      "rule:NOUN_RISE_OF_AMOUNT",
      "rule:UNIT_PER_CENT_INVARIABLE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「a rise by 1.6 MWh」在此應改為「a rise of 1.6 MWh」。名詞 rise 用 of 表示幅度。動詞才寫 rose by 1.6 MWh。 「50 per cents」在此應改為「50 per cent」。per cent 在數字後不加複數 s：one per cent、50 percent。"
  },
  {
    "sentenceId": "PARA-0018-S09",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "By 2020, Eastport had surpassed than Northland with 0.6 MWh.",
    "correctedSentence": "By 2020, Eastport had surpassed Northland by 0.6 MWh.",
    "categories": [
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "PREP_MARGIN_BY_DIFFERENCE",
      "VERB_SURPASS_DIRECT_OBJECT_NO_THAN"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "have_auxiliary",
      "rule:PREP_MARGIN_BY_DIFFERENCE",
      "rule:VERB_SURPASS_DIRECT_OBJECT_NO_THAN",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「surpassed than Northland」在此應改為「surpassed Northland」。surpass 是及物動詞，直接接被超越的對象。 was higher than Northland 才使用 than。 「with 0.6 MWh」在此應改為「by 0.6 MWh」。表示一項數據比另一項高出多少，用 by + 差額： surpassed Northland by 0.6 MWh。"
  },
  {
    "sentenceId": "PARA-0018-S10",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In 2035, Eastport is expected to use one and three-fifths times as much electricity than Northland.",
    "correctedSentence": "In 2035, Eastport is expected to use one and three-fifths times as much electricity as Northland.",
    "categories": [
      "comparison"
    ],
    "ruleIds": [
      "COMP_MULTIPLIER_AS_MUCH_AS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "coordination",
      "infinitive_to",
      "quantifier",
      "rule:COMP_MULTIPLIER_AS_MUCH_AS",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「times as much electricity than」在此應改為「times as much electricity as」。不可數名詞的倍數比較使用倍數 + as much + 名詞 + as。可數複數則用 as many... as。"
  },
  {
    "sentenceId": "PARA-0018-S11",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Southvale fluctuated from 2.7 and 3.1 MWh between 2010 to 2025.",
    "correctedSentence": "Southvale fluctuated between 2.7 and 3.1 MWh from 2010 to 2025.",
    "categories": [
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "PREP_FROM_TO_TIME_RANGE",
      "VERB_FLUCTUATE_BETWEEN_AND"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "coordination",
      "rule:PREP_FROM_TO_TIME_RANGE",
      "rule:VERB_FLUCTUATE_BETWEEN_AND",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「fluctuated from 2.7 and 3.1」在此應改為「fluctuated between 2.7 and 3.1」。表示數值在兩個水平之間反覆變動，用 fluctuate between A and B。 「between 2010 to 2025」在此應改為「from 2010 to 2025」。from 與 to 配對； between 則與 and 配對。"
  },
  {
    "sentenceId": "PARA-0018-S12",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "It bottomed at 2.7 MWh in 2015, recovered by 3.1 MWh in 2020 and levelled at 3.0 MWh.",
    "correctedSentence": "It bottomed out at 2.7 MWh in 2015, recovered to 3.1 MWh in 2020 and levelled off at 3.0 MWh.",
    "categories": [
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "PHRASAL_BOTTOM_OUT_AT",
      "PHRASAL_LEVEL_OFF_AT",
      "VERB_RECOVER_TO_LEVEL"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "coordination",
      "rule:PHRASAL_BOTTOM_OUT_AT",
      "rule:PHRASAL_LEVEL_OFF_AT",
      "rule:VERB_RECOVER_TO_LEVEL",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「bottomed at」在此應改為「bottomed out at」。表示下降至最低點，用 bottom out at + 數值。名詞寫法是 reached alow of...。 「recovered by 3.1 MWh」在此應改為「recovered to 3.1 MWh」。recover to + 數值表示回升後的水平。 recover by 0.4 MWh 可表示回升幅度。 「levelled at 3.0 MWh」在此應改為「levelled off at 3.0 MWh」。表示數據停止上升或下降並趨於穩定，用 level off at + 數值。"
  },
  {
    "sentenceId": "PARA-0018-S13",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Throughout of the period, its values ranged between 2.7 to 3.3 MWh.",
    "correctedSentence": "Over the period, its values ranged from 2.7 to 3.3 MWh.",
    "categories": [
      "other_grammar",
      "preposition"
    ],
    "ruleIds": [
      "PREP_THROUGHOUT_NO_OF",
      "VERB_RANGE_FROM_TO"
    ],
    "structureTags": [
      "category:other_grammar",
      "category:preposition",
      "rule:PREP_THROUGHOUT_NO_OF",
      "rule:VERB_RANGE_FROM_TO",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「Throughout of the period」在此應改為「Over the period」。throughout 直接接名詞，不加 of： throughout the period。本句也可寫 over the period。 「ranged between 2.7 to 3.3」在此應改為「ranged from 2.7 to 3.3」。正確配對是 range from A to B 或 range between A and B。"
  },
  {
    "sentenceId": "PARA-0018-S14",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Westmere started from 2.1 MWh and increased 1.1 MWh until 3.2 MWh.",
    "correctedSentence": "Westmere started at 2.1 MWh and increased by 1.1 MWh to 3.2 MWh.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "VERB_INCREASE_BY_AMOUNT",
      "VERB_INCREASE_TO_ENDPOINT",
      "VERB_START_AT_VALUE"
    ],
    "structureTags": [
      "category:other_grammar",
      "coordination",
      "rule:VERB_INCREASE_BY_AMOUNT",
      "rule:VERB_INCREASE_TO_ENDPOINT",
      "rule:VERB_START_AT_VALUE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「started from 2.1 MWh」在此應改為「started at 2.1 MWh」。描述圖表數列的初始數值，通常用 start at + 數值。時間範圍可寫 from 2005。 「increased 1.1 MWh」在此應改為「increased by 1.1 MWh」。increase by + 數值表示增加幅度。不能在這個意思下直接把數值放在不及物動詞後。 「until 3.2 MWh」在此應改為「to 3.2 MWh」。increase to + 數值表示增加後的水平。 until 用於時間或某種持續界線。"
  },
  {
    "sentenceId": "PARA-0018-S15",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The 2035 figure is projected to be about one-and-half times than the 2005 level.",
    "correctedSentence": "The 2035 figure is projected to be about one and a half times the 2005 level.",
    "categories": [
      "comparison",
      "word_choice"
    ],
    "ruleIds": [
      "COMP_MULTIPLIER_TIMES_NO_THAN",
      "NUMERAL_ONE_AND_A_HALF"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:word_choice",
      "coordination",
      "infinitive_to",
      "rule:COMP_MULTIPLIER_TIMES_NO_THAN",
      "rule:NUMERAL_ONE_AND_A_HALF",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「one-and-half」在此應改為「one and a half」。獨立倍數詞組寫成 one and a half。作複合前置修飾語時可加連字號，例如 a one-and-a-half-fol d increase。 「times than the 2005 level」在此應改為「times the 2005 level」。倍數 + times + 名詞詞組後面不加 than。另一個結構是 one and a half times as high as...。"
  },
  {
    "sentenceId": "PARA-0018-S16",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Westmere remained under than Southvale until 2025 but is projected to catch it up by 2035.",
    "correctedSentence": "Westmere remained below Southvale until 2025 but is projected to catch up with it by 2035.",
    "categories": [
      "comparison",
      "preposition"
    ],
    "ruleIds": [
      "COMP_BELOW_DIRECT_NO_THAN",
      "PHRASAL_CATCH_UP_WITH"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:preposition",
      "coordination",
      "infinitive_to",
      "rule:COMP_BELOW_DIRECT_NO_THAN",
      "rule:PHRASAL_CATCH_UP_WITH",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「under than Southvale」在此應改為「below Southvale」。below 可直接接比較對象，不加 than。若使用形容詞比較級，可寫 lower than Southvale。 「catch it up」在此應改為「catch up with it」。表示數值追上另一項，用 catch up with + 對象。 catch someone up 可在英式英文中表示向某人補充最新情況，意思不同。"
  },
  {
    "sentenceId": "PARA-0018-S17",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The bar chart presents the proportions of electricity generated from coal, gas and renewables.",
    "correctedSentence": "The bar chart presents the proportions of electricity generated from coal, gas and renewables.",
    "categories": [],
    "ruleIds": [],
    "structureTags": [
      "coordination",
      "verb_ed_surface"
    ],
    "explanationZhHant": ""
  },
  {
    "sentenceId": "PARA-0018-S18",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "In 2005, coal made 45 per cent from generation, gas 37 per cent and renewables 18 per cent.",
    "correctedSentence": "In 2005, coal made up 45 per cent of generation, gas 37 per cent and renewables 18 per cent.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "PHRASAL_MAKE_UP_PERCENT_OF_TOTAL"
    ],
    "structureTags": [
      "category:preposition",
      "coordination",
      "rule:PHRASAL_MAKE_UP_PERCENT_OF_TOTAL"
    ],
    "explanationZhHant": "「made 45 per cent from generation」在此應改為「made up 45 per cent of generation」。表示某部分構成整體的某個比例，用 make up + 百分比 + of + 整體。被動結構 The total is made up of... 表示整體由哪些部分組成。"
  },
  {
    "sentenceId": "PARA-0018-S19",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Coal's share is forecast to fall by 20 per cent, a decrease by 25 per cent points.",
    "correctedSentence": "Coal's share is forecast to fall to 20 per cent, a decrease of 25 percentage points.",
    "categories": [
      "comparison",
      "singular_plural",
      "word_choice"
    ],
    "ruleIds": [
      "CHANGE_FALL_TO_ENDPOINT",
      "NOUN_DECREASE_OF_AMOUNT",
      "UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:singular_plural",
      "category:word_choice",
      "infinitive_to",
      "rule:CHANGE_FALL_TO_ENDPOINT",
      "rule:NOUN_DECREASE_OF_AMOUNT",
      "rule:UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS"
    ],
    "explanationZhHant": "「by」在此應改為「to」。是 45%，最終比例是 20%，所以 20% 是終點，要用 fall to。 它實際下降了 25 percentage points。 「by」在此應改為「of」。名詞 decrease 用 of 表示減少幅度。動詞才寫 decreased by 25。 「per cent」在此應改為「percentage」。兩個百分比之間的絕對差使用 percentage points。 由 45% 降至 20% 是下降 25 percentage points。"
  },
  {
    "sentenceId": "PARA-0018-S20",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "This equals with a reduction by 56 per cent comparing with its original share.",
    "correctedSentence": "This is equivalent to a reduction of 56 per cent relative to its share.",
    "categories": [
      "preposition",
      "singular_plural",
      "word_form"
    ],
    "ruleIds": [
      "ADJ_EQUIVALENT_TO",
      "NOUN_REDUCTION_OF_AMOUNT",
      "PREP_RELATIVE_TO_BASELINE"
    ],
    "structureTags": [
      "category:preposition",
      "category:singular_plural",
      "category:word_form",
      "rule:ADJ_EQUIVALENT_TO",
      "rule:NOUN_REDUCTION_OF_AMOUNT",
      "rule:PREP_RELATIVE_TO_BASELINE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「equals with」在此應改為「is equivalent to」。固定結構是 be equivalent to + 名詞。動詞 equal 則直接接賓語，例如 The reduction equals 25 points。 「a reduction by 56 per cent」在此應改為「a reduction of 56 per cent」。名詞 reduction 用 of 表示幅度；動詞結構為 was reduced by 56 per cent。 「comparing with its original share」在此應改為「relative to its share」。表示計算以某個原有數值為基準，可用 relative to。也可寫 compared with its original share，但不能用沒有明確主動執行者的 comparing with。"
  },
  {
    "sentenceId": "PARA-0018-S21",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Renewables are expected to rise 18 to 47 per cent, gaining 29 per cent points.",
    "correctedSentence": "Renewables are expected to rise from 18 to 47 per cent, gaining 29 percentage points.",
    "categories": [
      "comparison",
      "word_choice"
    ],
    "ruleIds": [
      "CHANGE_RISE_FROM_TO",
      "UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:word_choice",
      "infinitive_to",
      "rule:CHANGE_RISE_FROM_TO",
      "rule:UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「rise 18 to 47 per cent」在此應改為「rise from 18 to 47 per cent」。同時給出起點和終點時，使用 rise from A to B。 「29 per cent points」在此應改為「29 percentage points」。18% 至 47% 的差距是 29 percentage points。"
  },
  {
    "sentenceId": "PARA-0018-S22",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Their share will therefore be more than two and a half folds its 2005 level.",
    "correctedSentence": "Their share will therefore be more than two and a half times its 2005 level.",
    "categories": [
      "comparison"
    ],
    "ruleIds": [
      "COMP_MULTIPLIER_TIMES_NOT_FOLDS"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "coordination",
      "modal",
      "rule:COMP_MULTIPLIER_TIMES_NOT_FOLDS"
    ],
    "explanationZhHant": "「two and a half folds」在此應改為「two and a half times」。數字倍數後使用 times。 twofold 是單一詞，可寫 a twofold increase，但不寫 two folds。"
  },
  {
    "sentenceId": "PARA-0018-S23",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Wind and solar together will be made up 47 per cent of total generation.",
    "correctedSentence": "Wind and solar together will make up 47 per cent of total generation.",
    "categories": [
      "preposition"
    ],
    "ruleIds": [
      "PHRASAL_MAKE_UP_PERCENT_OF_TOTAL"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:preposition",
      "coordination",
      "modal",
      "rule:PHRASAL_MAKE_UP_PERCENT_OF_TOTAL"
    ],
    "explanationZhHant": "「will be made up 47 per cent」在此應改為「will make up 47 per cent」。wind and solar 是構成比例的部分，因此用主動式 make up 47 per cent。被動式應由整體作主語： The total is made up of several sources。"
  },
  {
    "sentenceId": "PARA-0018-S24",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Gas, in contrary, is projected to decline slightly, between 37 and 33 per cent.",
    "correctedSentence": "Gas, by contrast, is projected to decline slightly, from 37 to 33 per cent.",
    "categories": [
      "comparison",
      "conjunction"
    ],
    "ruleIds": [
      "CHANGE_DECLINE_FROM_TO",
      "LINKER_BY_CONTRAST"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:comparison",
      "category:conjunction",
      "coordination",
      "infinitive_to",
      "rule:CHANGE_DECLINE_FROM_TO",
      "rule:LINKER_BY_CONTRAST",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「in contrary」在此應改為「by contrast」。表示兩組數據形成對比，可用句首連接語 by contrast 或 in contrast。on the contrary 通常用來直接否定前述看法。 「between 37 and 33 per cent」在此應改為「from 37 to 33 per cent」。描述有方向的下降過程，用 decline from A to B。 between A and B 較適合描述變動範圍。"
  },
  {
    "sentenceId": "PARA-0018-S25",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The gap among gas and renewables will shift from 19 percentage points favouring gas into 14 percentage points favouring renewables.",
    "correctedSentence": "The gap between gas and renewables will shift from 19 percentage points favouring gas to 14 percentage points favouring renewables.",
    "categories": [
      "comparison",
      "singular_plural"
    ],
    "ruleIds": [
      "CHANGE_SHIFT_FROM_TO",
      "NOUN_GAP_BETWEEN_TWO"
    ],
    "structureTags": [
      "category:comparison",
      "category:singular_plural",
      "coordination",
      "modal",
      "rule:CHANGE_SHIFT_FROM_TO",
      "rule:NOUN_GAP_BETWEEN_TWO",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「The gap among gas and renewables」在此應改為「The gap between gas and renewables」。只有兩個比較項目時，使用 the gap between A and B。 「into 14 percentage points」在此應改為「to 14 percentage points」。數值由一個水平轉變至另一個水平，用 shift from A to B。 into 通常表示轉化成另一種形式。"
  },
  {
    "sentenceId": "PARA-0018-S26",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Between the three sources, renewables will record the most large absolute increase.",
    "correctedSentence": "Of the three sources, renewables will record the largest absolute increase.",
    "categories": [
      "comparison"
    ],
    "ruleIds": [
      "COMP_LARGE_SUPERLATIVE_LARGEST",
      "COMP_SUPERLATIVE_OF_DEFINED_SET"
    ],
    "structureTags": [
      "category:comparison",
      "modal",
      "rule:COMP_LARGE_SUPERLATIVE_LARGEST",
      "rule:COMP_SUPERLATIVE_OF_DEFINED_SET"
    ],
    "explanationZhHant": "「Between the three sources」在此應改為「Of the three sources」。最高級前的比較群體使用 of：the largest of the three sources。 「the most large」在此應改為「the largest」。large 的最高級是 largest， 不用 most large。"
  },
  {
    "sentenceId": "PARA-0018-S27",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Coal will experience the most sharp fall between the three, while gas will remain a second largest source.",
    "correctedSentence": "Coal will experience the sharpest fall of the three, while gas will remain the second-largest source.",
    "categories": [
      "article_or_determiner",
      "comparison"
    ],
    "ruleIds": [
      "ARTICLE_ORDINAL_RANK_THE_SECOND_LARGEST",
      "COMP_SHARP_SUPERLATIVE_SHARPEST",
      "COMP_SUPERLATIVE_OF_DEFINED_SET"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:comparison",
      "modal",
      "rule:ARTICLE_ORDINAL_RANK_THE_SECOND_LARGEST",
      "rule:COMP_SHARP_SUPERLATIVE_SHARPEST",
      "rule:COMP_SUPERLATIVE_OF_DEFINED_SET"
    ],
    "explanationZhHant": "「the most sharp fall」在此應改為「the sharpest fall」。短形容詞 sharp 加-est 形成最高級： the sharpest。 「between the three」在此應改為「of the three」。說明最高級所屬的三項群體，用 of the three。 「a second largest source」在此應改為「the second-largest source」。表示已界定群體中的第二名，使用 the + 序數詞 + 最高級。 second-largest 共同修飾 source， 所以加連字號。"
  },
  {
    "sentenceId": "PARA-0018-S28",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The figures for coal, gas and renewables will be 20, 33 and 47 per cents, respectably.",
    "correctedSentence": "The figures for coal, gas and renewables will be 20, 33 and 47 per cent, respectively.",
    "categories": [
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "UNIT_PER_CENT_INVARIABLE",
      "WORDFORM_RESPECTIVELY_NOT_RESPECTABLY"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:word_choice",
      "category:word_form",
      "coordination",
      "modal",
      "rule:UNIT_PER_CENT_INVARIABLE",
      "rule:WORDFORM_RESPECTIVELY_NOT_RESPECTABLY"
    ],
    "explanationZhHant": "「per cents」在此應改為「per cent」。per cent 不因數字大於一而加 s。 「respectably」在此應改為「respectively」。respectively 表示兩組依次列出的項目一一對應。 respectably 表示以可敬或尚算不錯的方式，意思不同。"
  },
  {
    "sentenceId": "PARA-0018-S29",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Taking together, the charts indicate convergence in consumption and a shift towards renewable generation.",
    "correctedSentence": "Taken together, the charts indicate convergence in consumption and a shift towards renewable generation.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "PARTICIPLE_TAKEN_TOGETHER_PASSIVE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "coordination",
      "rule:PARTICIPLE_TAKEN_TOGETHER_PASSIVE",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Taking together」在此應改為「Taken together」。兩幅圖是「被放在一起考慮」，所以使用過去分詞 Taken together。 Taking the charts together, we can see... 才是主動結構。"
  },
  {
    "sentenceId": "PARA-0018-S30",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "Comparing with 2005, the projected 2035 energy mix contains a much smaller coal share.",
    "correctedSentence": "Compared with 2005, the projected 2035 energy mix contains a much smaller coal share.",
    "categories": [
      "infinitive_or_gerund"
    ],
    "ruleIds": [
      "PARTICIPLE_COMPARED_WITH_BASELINE"
    ],
    "structureTags": [
      "category:infinitive_or_gerund",
      "quantifier",
      "rule:PARTICIPLE_COMPARED_WITH_BASELINE",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「Comparing with 2005」在此應改為「Compared with 2005」。2035 的能源組合是被拿來與 2005 比較，因此用 Compared with。 Comparing the two years, we can see... 則有明確的主動執行者。"
  },
  {
    "sentenceId": "PARA-0018-S31",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The combined regional total is projected to raise from 12.1 to 14.3 MWh.",
    "correctedSentence": "The combined regional total is projected to rise from 12.1 to 14.3 MWh.",
    "categories": [
      "other_grammar"
    ],
    "ruleIds": [
      "VERB_RISE_INTRANSITIVE_NOT_RAISE"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "infinitive_to",
      "rule:VERB_RISE_INTRANSITIVE_NOT_RAISE",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「to raise from 12.1」在此應改為「to rise from 12.1」。rise 是不及物動詞，表示數值自行上升。raise 是及物動詞，需要賓語，例如 The policy raised the total。"
  },
  {
    "sentenceId": "PARA-0018-S32",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "The difference of the fastest-growing and slowest-growing regions is projected to be widened.",
    "correctedSentence": "The difference between the fastest-growing and slowest-growing regions is projected to widen.",
    "categories": [
      "other_grammar",
      "singular_plural"
    ],
    "ruleIds": [
      "NOUN_DIFFERENCE_BETWEEN",
      "VERB_WIDEN_INTRANSITIVE_TREND"
    ],
    "structureTags": [
      "be_auxiliary",
      "category:other_grammar",
      "category:singular_plural",
      "coordination",
      "infinitive_to",
      "rule:NOUN_DIFFERENCE_BETWEEN",
      "rule:VERB_WIDEN_INTRANSITIVE_TREND",
      "verb_ed_surface",
      "verb_ing_surface"
    ],
    "explanationZhHant": "「The difference of」在此應改為「The difference between」。比較兩項事物之間的差別，用 the difference between A and B。a difference of 2 MWh 則表示差額大小。 「is projected to be widened」在此應改為「is projected to widen」。當 difference 本身逐漸擴大時， widen 作不及物動詞。被動式暗示有外在執行者把差距擴大，因此這項規則應保留原意檢查。"
  },
  {
    "sentenceId": "PARA-0018-S33",
    "paragraphId": "PARA-0018",
    "partition": "development",
    "reviewPolicy": "guidance",
    "sourceSentence": "At end of the period, Eastport will rank the first, followed with Southvale and Westmere, with Northland at last.",
    "correctedSentence": "At the end of the period, Eastport will rank first, followed by Southvale and Westmere, with Northland last.",
    "categories": [
      "article_or_determiner",
      "verb_form_or_tense",
      "word_choice",
      "word_form"
    ],
    "ruleIds": [
      "ADVERB_RANK_FIRST_NO_THE",
      "ARTICLE_END_OF_PERIOD_THE",
      "PASSIVE_FOLLOWED_BY",
      "PREDICATIVE_LAST_NO_AT"
    ],
    "structureTags": [
      "category:article_or_determiner",
      "category:verb_form_or_tense",
      "category:word_choice",
      "category:word_form",
      "coordination",
      "modal",
      "rule:ADVERB_RANK_FIRST_NO_THE",
      "rule:ARTICLE_END_OF_PERIOD_THE",
      "rule:PASSIVE_FOLLOWED_BY",
      "rule:PREDICATIVE_LAST_NO_AT",
      "verb_ed_surface"
    ],
    "explanationZhHant": "「At」在此應改為「At the」。固定結構是 at the end of + 時段／事物。 in the end 則表示「最終」。 「the first」在此應改為「first」。first 在 rank first 中作排名補語，不使用冠詞。對照名詞詞組： the first position。 「with」在此應改為「by」。表示排名次序中後面接着甚麼，用被動結構 be followed by。 「at last」在此應改為「last」。last 可直接作排名補語： Northland was last。 at last 表示等待一段時間後「終於」，意思不同。"
  }
].map((entry) => Object.freeze({
  ...entry,
  categories: Object.freeze(entry.categories),
  ruleIds: Object.freeze(entry.ruleIds),
  structureTags: Object.freeze(entry.structureTags)
})));
