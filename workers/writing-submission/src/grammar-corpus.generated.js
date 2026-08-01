// GENERATED FILE. Edit grammar-corpus/corpus-v1.json and run
// node grammar-corpus/validate-and-generate.mjs instead.

export const CORPUS_VERSION = "2026-08-01.1";

export const CORPUS_SENTENCES = Object.freeze([
  {
    "sentenceId": "PARA-0001-S01",
    "paragraphId": "PARA-0001",
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
