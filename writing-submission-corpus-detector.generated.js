// GENERATED FILE. Edit grammar-corpus/corpus-v1.json and run
// node grammar-corpus/validate-and-generate.mjs instead.

export const CORPUS_DETECTOR_VERSION = "2026-08-02.1";

export const CORPUS_DETECTOR_RULES = Object.freeze([
  {
    "ruleId": "MANY_PLURAL_NOUN",
    "category": "singular_plural",
    "titleZhHant": "many 後使用可數名詞複數",
    "formula": "many + plural countable noun",
    "structuralSignature": [
      "many",
      "singular_countable_noun"
    ],
    "incorrectPattern": "many + singular countable noun",
    "correctPattern": "many + plural countable noun",
    "explanationZhHant": "many 後面接可數名詞複數。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-MANY_PLURAL_NOUN-01",
        "exampleText": "Many a traveller has made this mistake.",
        "explanationZhHant": "正式結構 many a + 單數名詞 + 單數動詞 是例外。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "PLURAL_SUBJECT_VERB",
    "category": "subject_verb_agreement",
    "titleZhHant": "複數主語與現在式動詞一致",
    "formula": "plural subject + base-form present verb",
    "structuralSignature": [
      "plural_subject",
      "present_verb_s"
    ],
    "incorrectPattern": "plural subject + present verb ending in s",
    "correctPattern": "plural subject + base-form present verb",
    "explanationZhHant": "複數主語在一般現在式中通常配合不加 s 的動詞。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "STAFF_COLLECTIVE_NOUN",
    "category": "countability",
    "titleZhHant": "staff 的集合名詞用法",
    "formula": "staff / staff members",
    "structuralSignature": [
      "staff",
      "nonstandard_plural"
    ],
    "incorrectPattern": "staffs when referring generally to employees",
    "correctPattern": "staff or staff members",
    "explanationZhHant": "staff 通常是集合名詞。可寫 staff 或 staff members，一般不寫 staffs。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "TO_BASE_VERB",
    "category": "infinitive_or_gerund",
    "titleZhHant": "to 後使用動詞原形",
    "formula": "to + base verb",
    "structuralSignature": [
      "infinitive_to",
      "inflected_verb"
    ],
    "incorrectPattern": "infinitive to + inflected verb",
    "correctPattern": "infinitive to + base verb",
    "explanationZhHant": "不定詞 to 後面使用動詞原形。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "SINGULAR_SUBJECT_VERB",
    "category": "subject_verb_agreement",
    "titleZhHant": "單數主語與現在式動詞一致",
    "formula": "third-person singular subject + present verb ending in s",
    "structuralSignature": [
      "singular_subject",
      "base_present_verb"
    ],
    "incorrectPattern": "third-person singular subject + base present verb",
    "correctPattern": "third-person singular subject + present verb ending in s",
    "explanationZhHant": "第三身單數主語在一般現在式中，動詞通常要加 s 或使用相應的單數形式。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "SEVERAL_PLURAL_NOUN",
    "category": "singular_plural",
    "titleZhHant": "several 後使用可數名詞複數",
    "formula": "several + plural countable noun",
    "structuralSignature": [
      "several",
      "singular_countable_noun"
    ],
    "incorrectPattern": "several + singular countable noun",
    "correctPattern": "several + plural countable noun",
    "explanationZhHant": "several 後面要接可數名詞複數。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "GENERAL_GROUP_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "泛指群體時使用複數名詞",
    "formula": "general group reference -> plural noun",
    "structuralSignature": [
      "general_reference",
      "singular_countable_noun"
    ],
    "incorrectPattern": "bare singular countable noun used for a general group",
    "correctPattern": "plural countable noun used for a general group",
    "explanationZhHant": "泛指某一類人或事物時，通常使用可數名詞複數。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "MODAL_BASE_VERB",
    "category": "modal_or_auxiliary",
    "titleZhHant": "情態動詞後使用動詞原形",
    "formula": "can / could / may / might / should / must + base verb",
    "structuralSignature": [
      "modal",
      "inflected_verb"
    ],
    "incorrectPattern": "modal + inflected verb",
    "correctPattern": "modal + base verb",
    "explanationZhHant": "can、may、should 等情態動詞後面，要直接使用最基本的動詞形式，不加 s、ed 或 ing。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "SPEND_MONEY_ON",
    "category": "preposition",
    "titleZhHant": "spend money on 的介詞搭配",
    "formula": "spend money on something",
    "structuralSignature": [
      "spend",
      "money",
      "for"
    ],
    "incorrectPattern": "spend money for something",
    "correctPattern": "spend money on something",
    "explanationZhHant": "表示「花錢在某事上」使用 spend money on something。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "GENERAL_SOME_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "some 泛指可數群體時使用複數",
    "formula": "some + plural countable noun",
    "structuralSignature": [
      "some",
      "singular_countable_noun"
    ],
    "incorrectPattern": "some + singular countable noun in a group reference",
    "correctPattern": "some + plural countable noun",
    "explanationZhHant": "some 泛指一群可數的人或事物時，後面的名詞使用複數。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "SHARED_MODAL_PARALLEL",
    "category": "parallelism",
    "titleZhHant": "共用情態動詞的平行結構",
    "formula": "modal + base verb + and + base verb",
    "structuralSignature": [
      "modal",
      "coordinated_verbs",
      "inflected_second_verb"
    ],
    "incorrectPattern": "modal + base verb + and + inflected verb",
    "correctPattern": "modal + base verb + and + base verb",
    "explanationZhHant": "情態動詞同時控制兩個並列動詞時，兩個動詞都使用原形。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "PREPOSITION_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "介詞後使用動名詞",
    "formula": "preposition + verb-ing",
    "structuralSignature": [
      "preposition",
      "past_or_base_verb"
    ],
    "incorrectPattern": "preposition + finite or past verb",
    "correctPattern": "preposition + verb-ing",
    "explanationZhHant": "介詞後面的動作通常使用動名詞形式。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "PURPOSE_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "使用不定詞表達行動目的",
    "formula": "action + to + base verb",
    "structuralSignature": [
      "movement_or_action",
      "for",
      "base_verb"
    ],
    "incorrectPattern": "action + for + base verb",
    "correctPattern": "action + to + base verb",
    "explanationZhHant": "表示某個行動的目的時，通常使用 to + 動詞原形。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-PURPOSE_TO_INFINITIVE-01",
        "exampleText": "This bag is for carrying books.",
        "explanationZhHant": "for + verb-ing 可以表示物件的用途。這不等於「某人做某事的目的」。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "NEAR_PREPOSITION",
    "category": "preposition",
    "titleZhHant": "near 直接接地方",
    "formula": "near + place / close to + place",
    "structuralSignature": [
      "near",
      "from",
      "place"
    ],
    "incorrectPattern": "near from + place",
    "correctPattern": "near + place",
    "explanationZhHant": "near 可以直接接地方；也可以使用 close to。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-NEAR_PREPOSITION-01",
        "exampleText": "The negotiations were near to completion.",
        "explanationZhHant": "near to 在部分語境可以成立，因此系統不應一律刪除 to。near from 才是本例的問題。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "ADJECTIVE_AFTER_BE",
    "category": "word_form",
    "titleZhHant": "be 後使用形容詞描述狀態",
    "formula": "be + degree adverb + adjective",
    "structuralSignature": [
      "be",
      "very",
      "noun_form"
    ],
    "incorrectPattern": "be + very + noun form",
    "correctPattern": "be + very + adjective form",
    "explanationZhHant": "be 動詞後描述主語狀態時，需要使用形容詞，而不是相關名詞。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-ADJECTIVE_AFTER_BE-01",
        "exampleText": "We travelled for convenience.",
        "explanationZhHant": "convenience 作名詞時完全正確；本例錯在 was very convenience 需要形容詞。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "INFORMATION_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "information 是不可數名詞",
    "formula": "much information / pieces of information",
    "structuralSignature": [
      "many",
      "information_plural"
    ],
    "incorrectPattern": "many informations",
    "correctPattern": "much information or pieces of information",
    "explanationZhHant": "information 在一般英文中是不可數名詞，不能直接加 s。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-INFORMATION_UNCOUNTABLE-01",
        "exampleText": "We received three pieces of information.",
        "explanationZhHant": "需要計算資料數量時，可以使用 pieces/items of information。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "INDIRECT_QUESTION_ORDER",
    "category": "sentence_structure",
    "titleZhHant": "間接問句使用陳述句語序",
    "formula": "reporting verb + question word + subject + auxiliary/verb",
    "structuralSignature": [
      "reporting_verb",
      "question_word",
      "auxiliary_before_subject"
    ],
    "incorrectPattern": "ask + question word + auxiliary + subject + verb",
    "correctPattern": "ask + question word + subject + auxiliary/verb",
    "explanationZhHant": "間接問句不是獨立問題，因此使用陳述句語序。疑問詞後面先寫主語，再寫動詞。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-INDIRECT_QUESTION_ORDER-01",
        "exampleText": "She asked, “Where should we go?”",
        "explanationZhHant": "直接引述問題時使用疑問句語序；只有間接問句使用 where we should go。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "SUGGEST_CONSTRUCTION",
    "category": "sentence_structure",
    "titleZhHant": "suggest 的句型",
    "formula": "suggest that + subject + base verb / suggest + verb-ing",
    "structuralSignature": [
      "suggest",
      "object_pronoun",
      "to_infinitive"
    ],
    "incorrectPattern": "suggest someone to do",
    "correctPattern": "suggest that someone do or suggest doing",
    "explanationZhHant": "suggest 通常使用 suggest that + 主語 + 動詞，或者 suggest + verb-ing。不要直接寫 suggest someone to do。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-SUGGEST_CONSTRUCTION-01",
        "exampleText": "They suggested visiting the temple.",
        "explanationZhHant": "suggest + verb-ing 是正確結構。",
        "englishVariant": "both"
      },
      {
        "exceptionId": "EX-SUGGEST_CONSTRUCTION-02",
        "exampleText": "They suggested to us that we visit the temple.",
        "explanationZhHant": "suggest to someone that... 可以成立，但不能寫 suggest someone to do。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "PASSIVE_RELATIVE_CLAUSE",
    "category": "verb_form_or_tense",
    "titleZhHant": "關係子句中的被動語態",
    "formula": "relative pronoun + be + past participle",
    "structuralSignature": [
      "inanimate_subject",
      "relative_pronoun",
      "bare_past_participle"
    ],
    "incorrectPattern": "thing + that + past participle without be",
    "correctPattern": "thing + that + be + past participle",
    "explanationZhHant": "主語是動作的承受者時，關係子句需要使用 be + 過去分詞的被動語態。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-PASSIVE_RELATIVE_CLAUSE-01",
        "exampleText": "We met the workers who built the temple.",
        "explanationZhHant": "workers 主動建造寺廟，所以使用主動式 built，不需要 were built。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "RAIN_IT_CONSTRUCTION",
    "category": "sentence_structure",
    "titleZhHant": "描述下雨時使用形式主語 it",
    "formula": "it + be + raining",
    "structuralSignature": [
      "weather_subject",
      "be",
      "raining"
    ],
    "incorrectPattern": "the weather + be + raining",
    "correctPattern": "it + be + raining",
    "explanationZhHant": "描述正在下雨時，最自然的主語通常是形式主語 it。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-RAIN_IT_CONSTRUCTION-01",
        "exampleText": "The weather was rainy.",
        "explanationZhHant": "使用形容詞 rainy 時，可以用 the weather 作主語。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "ADVERB_POSITION",
    "category": "word_form",
    "titleZhHant": "副詞放在適當位置修飾動詞",
    "formula": "verb + manner adverb",
    "structuralSignature": [
      "manner_adverb",
      "verb_ing"
    ],
    "incorrectPattern": "manner adverb before the target verb in this construction",
    "correctPattern": "target verb + manner adverb",
    "explanationZhHant": "副詞修飾動作的程度或方式時，要放在合適的位置。",
    "englishVariant": "both",
    "exceptions": []
  },
  {
    "ruleId": "THIRD_CONDITIONAL_RESULT",
    "category": "verb_form_or_tense",
    "titleZhHant": "第三條件句的結果部分",
    "formula": "If + had + past participle, would have + past participle",
    "structuralSignature": [
      "if_had_participle",
      "would",
      "past_form_without_have"
    ],
    "incorrectPattern": "If + had + past participle, would + past form",
    "correctPattern": "If + had + past participle, would have + past participle",
    "explanationZhHant": "第三條件句談論未發生的過去情況；結果部分通常使用 would have + 過去分詞。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-THIRD_CONDITIONAL_RESULT-01",
        "exampleText": "If I had studied medicine, I would be a doctor now.",
        "explanationZhHant": "這是混合條件句：過去條件造成現在結果，因此可以使用 would be。",
        "englishVariant": "both"
      },
      {
        "exceptionId": "EX-THIRD_CONDITIONAL_RESULT-02",
        "exampleText": "If we had brought an umbrella, we would not have gotten wet.",
        "explanationZhHant": "gotten 是常見美式英文；got 是本例採用的英式英文。",
        "englishVariant": "American English"
      }
    ]
  },
  {
    "ruleId": "PAST_TENSE_PARALLEL",
    "category": "parallelism",
    "titleZhHant": "敘述過去事件時保持並列動詞時態一致",
    "formula": "past verb + and + past verb",
    "structuralSignature": [
      "past_narrative",
      "past_verb",
      "and",
      "base_verb"
    ],
    "incorrectPattern": "past verb + and + base present verb in a past narrative",
    "correctPattern": "past verb + and + past verb",
    "explanationZhHant": "同一過去敘述中的並列動作，通常使用一致的過去式。",
    "englishVariant": "both",
    "exceptions": [
      {
        "exceptionId": "EX-PAST_TENSE_PARALLEL-01",
        "exampleText": "The journey may broaden our knowledge.",
        "explanationZhHant": "情態動詞 may 後面使用動詞原形，所以這裡的 broaden 正確。",
        "englishVariant": "both"
      }
    ]
  },
  {
    "ruleId": "ADJ_ACCESSIBLE_BE_COMPLEMENT",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ ACCESSIBLE BE_COMPLEMENT",
    "formula": "ADJ.ACCESSIBLE.BE_COMPLEMENT",
    "structuralSignature": [
      "adj",
      "accessible",
      "be_complement"
    ],
    "incorrectPattern": "the area could only access",
    "correctPattern": "the area was accessible only",
    "explanationZhHant": "area 是可被到達的地方，應用形容詞 accessible 配合 be。 若使用動詞，主語應是人：People could access the area。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_ADJACENT_TO",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ ADJACENT TO",
    "formula": "ADJ.ADJACENT.TO",
    "structuralSignature": [
      "adj",
      "adjacent",
      "to"
    ],
    "incorrectPattern": "adjacent with it",
    "correctPattern": "beside it",
    "explanationZhHant": "adjacent 的固定搭配是 adjacent to，不用 with。 目標句採用較簡單的 beside it。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_AWARE_OF",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ AWARE OF",
    "formula": "ADJ.AWARE.OF",
    "structuralSignature": [
      "adj",
      "aware",
      "of"
    ],
    "incorrectPattern": "aware about",
    "correctPattern": "aware of",
    "explanationZhHant": "aware 後面通常用 of + 名詞，或接 that 分句： aware of the pressure／ aware that staff were under pressure。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_CONCERNED_ABOUT",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ CONCERNED ABOUT",
    "formula": "ADJ.CONCERNED.ABOUT",
    "structuralSignature": [
      "adj",
      "concerned",
      "about"
    ],
    "incorrectPattern": "concerned of",
    "correctPattern": "concerned about",
    "explanationZhHant": "表示為某事擔憂，用 concerned about。 concerned with 可表示涉及某個主題，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_ENOUGH_AFTER_ADJECTIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ ENOUGH AFTER_ADJECTIVE",
    "formula": "ADJ.ENOUGH.AFTER_ADJECTIVE",
    "structuralSignature": [
      "adj",
      "enough",
      "after_adjective"
    ],
    "incorrectPattern": "enough clear",
    "correctPattern": "clear enough",
    "explanationZhHant": "enough 修飾形容詞或副詞時，放在它們後面。公式：形容詞／副詞 + enough。 邊界： enough 修飾名詞時放在名詞前面，例如 enough information。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_EQUIVALENT_TO",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ EQUIVALENT TO",
    "formula": "ADJ.EQUIVALENT.TO",
    "structuralSignature": [
      "adj",
      "equivalent",
      "to"
    ],
    "incorrectPattern": "equals with",
    "correctPattern": "is equivalent to",
    "explanationZhHant": "固定結構是 be equivalent to + 名詞。動詞 equal 則直接接賓語，例如 The reduction equals 25 points。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_LIKELY_TO_INFINITIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ LIKELY TO_INFINITIVE",
    "formula": "ADJ.LIKELY.TO_INFINITIVE",
    "structuralSignature": [
      "adj",
      "likely",
      "to_infinitive"
    ],
    "incorrectPattern": "less likely of developing",
    "correctPattern": "less likely to develop",
    "explanationZhHant": "likely 後面表示可能發生的動作時，用 to + 動詞原形。公式：be likely to do。如果使用名詞 likelihood，則可寫 the likelihood of developing an illness。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_RESPONSIBLE_FOR_GERUND",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ RESPONSIBLE FOR_GERUND",
    "formula": "ADJ.RESPONSIBLE.FOR_GERUND",
    "structuralSignature": [
      "adj",
      "responsible",
      "for_gerund"
    ],
    "incorrectPattern": "responsible recording",
    "correctPattern": "responsible for recording",
    "explanationZhHant": "responsible 表示「負責某件事」時，用 responsible for + 名詞／動名詞。邊界： responsible to the manager 可表示「向經理負責」。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_TOO_TO_CAUSATIVE_KEEP_OBJECT",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ TOO_TO CAUSATIVE_KEEP_OBJECT",
    "formula": "ADJ.TOO_TO.CAUSATIVE_KEEP_OBJECT",
    "structuralSignature": [
      "adj",
      "too_to",
      "causative_keep_object"
    ],
    "incorrectPattern": "wet and the jacket too thin can't keep warm",
    "correctPattern": "wet, and their jacket is too thin to keep them warm",
    "explanationZhHant": "第二部分需要完整主句： their jacket is...。 too + 形容詞 + to + 動詞原形表示程度過高而無法達到結果； keep 還需要受詞和形容詞補語：keep them warm。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADJ_WORTH_GERUND",
    "category": "word_form",
    "titleZhHant": "文法規則：ADJ WORTH GERUND",
    "formula": "ADJ.WORTH.GERUND",
    "structuralSignature": [
      "adj",
      "worth",
      "gerund"
    ],
    "incorrectPattern": "worth to restore",
    "correctPattern": "worth restoring",
    "explanationZhHant": "worth 後面接名詞或動名詞，不接 to 不定詞。公式：be worth + 動名詞。也可寫 It is worthwhile to restore the films.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADVERB_EASILY_MODIFIES_LOCATE",
    "category": "word_form",
    "titleZhHant": "文法規則：ADVERB EASILY MODIFIES_LOCATE",
    "formula": "ADVERB.EASILY.MODIFIES_LOCATE",
    "structuralSignature": [
      "adverb",
      "easily",
      "modifies_locate"
    ],
    "incorrectPattern": "easy to",
    "correctPattern": "easily",
    "explanationZhHant": "easy 是形容詞，不能直接修飾動作 locate； 應使用副詞 easily。 此外， will 後面直接接動詞原形，不加 to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADVERB_FOCUS_MORE_AFTER_VERB",
    "category": "word_form",
    "titleZhHant": "文法規則：ADVERB FOCUS_MORE AFTER_VERB",
    "formula": "ADVERB.FOCUS_MORE.AFTER_VERB",
    "structuralSignature": [
      "adverb",
      "focus_more",
      "after_verb"
    ],
    "incorrectPattern": "help students more focus",
    "correctPattern": "help students focus more",
    "explanationZhHant": "help + 人 + 動詞原形是正確結構；程度副詞 more 在這裡修飾 focus，通常放在動詞後面。另一個正確寫法是 help students to focus more。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADVERB_HARD_NOT_HARDLY_EFFORT",
    "category": "word_form",
    "titleZhHant": "文法規則：ADVERB HARD NOT_HARDLY EFFORT",
    "formula": "ADVERB.HARD.NOT_HARDLY.EFFORT",
    "structuralSignature": [
      "adverb",
      "hard",
      "not_hardly",
      "effort"
    ],
    "incorrectPattern": "worked hardly",
    "correctPattern": "worked hard",
    "explanationZhHant": "hard 可作副詞，表示努力地； hardly 表示「幾乎不」。因此 worked hardly 會變成幾乎沒有工作，不符合原意。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ADVERB_RANK_FIRST_NO_THE",
    "category": "word_form",
    "titleZhHant": "文法規則：ADVERB RANK_FIRST NO_THE",
    "formula": "ADVERB.RANK_FIRST.NO_THE",
    "structuralSignature": [
      "adverb",
      "rank_first",
      "no_the"
    ],
    "incorrectPattern": "the first",
    "correctPattern": "first",
    "explanationZhHant": "first 在 rank first 中作排名補語，不使用冠詞。對照名詞詞組： the first position。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "AGE_PEOPLE_AGED_RANGE",
    "category": "word_choice",
    "titleZhHant": "文法規則：AGE PEOPLE_AGED RANGE",
    "formula": "AGE.PEOPLE_AGED.RANGE",
    "structuralSignature": [
      "age",
      "people_aged",
      "range"
    ],
    "incorrectPattern": "the population of 0-14 years old",
    "correctPattern": "people aged 0–14",
    "explanationZhHant": "表示某個年齡範圍內的人，可用 people aged + 年齡範圍。 years old 通常放在明確年齡後作表語，例如 They are 14 years old，不能直接寫 population of 0–14 years old。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
    "category": "word_choice",
    "titleZhHant": "文法規則：AGE RANGE ATTRIBUTIVE_AGE_GROUP",
    "formula": "AGE.RANGE.ATTRIBUTIVE_AGE_GROUP",
    "structuralSignature": [
      "age",
      "range",
      "attributive_age_group"
    ],
    "incorrectPattern": "15-59 age group will exceed 0-14 years old",
    "correctPattern": "15–59 age group will exceed the 0–14 age group",
    "explanationZhHant": "年齡範圍放在 age group 前作修飾語時，不使用 years old。公式：the 0–14 age group。 對照： children who are 14 years old。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "AMBIGUOUS_EXPAND_AFFORD_CONDITIONAL_RECONSTRUCTION",
    "category": "other_grammar",
    "titleZhHant": "文法規則：AMBIGUOUS EXPAND_AFFORD CONDITIONAL_RECONSTRUCTION",
    "formula": "AMBIGUOUS.EXPAND_AFFORD.CONDITIONAL_RECONSTRUCTION",
    "structuralSignature": [
      "ambiguous",
      "expand_afford",
      "conditional_reconstruction"
    ],
    "incorrectPattern": "can't expand that even cause",
    "correctPattern": "can't afford such clothes, this may even cause",
    "explanationZhHant": "expand 不表示「有能力購買」。按上下文，可能原意是 afford such clothes。此外， if 分句後必須有完整主句，因此補上主語和有限動詞 this may even cause。 由於 expand 可能代表其他原意，不能在沒有上下文時自動修改。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "APPOSITION_NONRESTRICTIVE_COMMAS",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：APPOSITION NONRESTRICTIVE COMMAS",
    "formula": "APPOSITION.NONRESTRICTIVE.COMMAS",
    "structuralSignature": [
      "apposition",
      "nonrestrictive",
      "commas"
    ],
    "incorrectPattern": "Maya the programme officer",
    "correctPattern": "Maya, the programme officer,",
    "explanationZhHant": "the programme officer 是補充 Maya 身分的非限制性同位語，前後使用逗號。若有多位名叫 Maya 的人，而職位用來辨認其中一位，標點可能不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "APPOSITION_UNIQUE_ROLE_THE_AND_COMMAS",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：APPOSITION UNIQUE_ROLE THE_AND_COMMAS",
    "formula": "APPOSITION.UNIQUE_ROLE.THE_AND_COMMAS",
    "structuralSignature": [
      "apposition",
      "unique_role",
      "the_and_commas"
    ],
    "incorrectPattern": "programme director",
    "correctPattern": "the programme director",
    "explanationZhHant": "the programme director 是補充說明 Professor Malik 身分的非限制性同位語。它指一個特定職位，因此使用 the，並由逗號分隔。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_AMOUNT_OF_WORK_AN",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE AMOUNT_OF_WORK AN",
    "formula": "ARTICLE.AMOUNT_OF_WORK.AN",
    "structuralSignature": [
      "article",
      "amount_of_work",
      "an"
    ],
    "incorrectPattern": "extra amount",
    "correctPattern": "an extra amount",
    "explanationZhHant": "amount 是單數可數名詞，前面需要限定詞，所以寫 an extra amount of work。更自然但較非最小的寫法是 take on extra work。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_AN_SINGULAR_COUNT_NOUN",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE AN SINGULAR_COUNT_NOUN",
    "formula": "ARTICLE.AN.SINGULAR_COUNT_NOUN",
    "structuralSignature": [
      "article",
      "an",
      "singular_count_noun"
    ],
    "incorrectPattern": "employees",
    "correctPattern": "employee,",
    "explanationZhHant": "an 後面接單數可數名詞，所以寫 an employee。 複數形式則不用 an： employees。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_A_PLURAL_NOUN_DELETE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE A PLURAL_NOUN DELETE",
    "formula": "ARTICLE.A.PLURAL_NOUN.DELETE",
    "structuralSignature": [
      "article",
      "a",
      "plural_noun",
      "delete"
    ],
    "incorrectPattern": "a clear boundaries",
    "correctPattern": "clear boundaries",
    "explanationZhHant": "a 只能接單數可數名詞，不能接複數 boundaries。可寫 a clear boundary 或 clear boundaries；本段談多種界線，所以採用複數。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_A_SINGULAR_COUNT_NOUN",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE A SINGULAR_COUNT_NOUN",
    "formula": "ARTICLE.A.SINGULAR_COUNT_NOUN",
    "structuralSignature": [
      "article",
      "a",
      "singular_count_noun"
    ],
    "incorrectPattern": "shops",
    "correctPattern": "shop,",
    "explanationZhHant": "a 只能接單數可數名詞，所以寫 a shop。複數形式則應寫 shops，並刪除 a。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_COUNTRY_NETHERLANDS_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE COUNTRY NETHERLANDS THE",
    "formula": "ARTICLE.COUNTRY.NETHERLANDS.THE",
    "structuralSignature": [
      "article",
      "country",
      "netherlands",
      "the"
    ],
    "incorrectPattern": "Netherlands",
    "correctPattern": "the Netherlands",
    "explanationZhHant": "標準國名是 the Netherlands。對照： France、 Japan 等大部分國名不用冠詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE COUNTRY UNITED_KINGDOM THE",
    "formula": "ARTICLE.COUNTRY.UNITED_KINGDOM.THE",
    "structuralSignature": [
      "article",
      "country",
      "united_kingdom",
      "the"
    ],
    "incorrectPattern": "from United Kingdom",
    "correctPattern": "from the United Kingdom",
    "explanationZhHant": "國名 the United Kingdom 固定帶 the。國名冠詞應按已核准的專名資料處理，不宜推廣成所有國名都加 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_DEFINED_DISTRICT_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE DEFINED_DISTRICT THE",
    "formula": "ARTICLE.DEFINED_DISTRICT.THE",
    "structuralSignature": [
      "article",
      "defined_district",
      "the"
    ],
    "incorrectPattern": "district",
    "correctPattern": "the district",
    "explanationZhHant": "這裡指前文已界定的 Riverside district，因此使用 the district。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_END_OF_PERIOD_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE END_OF_PERIOD THE",
    "formula": "ARTICLE.END_OF_PERIOD.THE",
    "structuralSignature": [
      "article",
      "end_of_period",
      "the"
    ],
    "incorrectPattern": "At",
    "correctPattern": "At the",
    "explanationZhHant": "固定結構是 at the end of + 時段／事物。 in the end 則表示「最終」。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_HOSPITAL_INSTITUTIONAL_ZERO_BRITISH",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE HOSPITAL INSTITUTIONAL_ZERO_BRITISH",
    "formula": "ARTICLE.HOSPITAL.INSTITUTIONAL_ZERO_BRITISH",
    "structuralSignature": [
      "article",
      "hospital",
      "institutional_zero_british"
    ],
    "incorrectPattern": "go to the hospital",
    "correctPattern": "go to hospital",
    "explanationZhHant": "英式英文中，病人為接受醫療而去醫院，可用 go to hospital。美式英文常用 go to the hospital，因此不可把美式形式判作文法錯誤。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_HOSPITAL_SPECIFIC_BUILDING_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE HOSPITAL SPECIFIC_BUILDING_THE",
    "formula": "ARTICLE.HOSPITAL.SPECIFIC_BUILDING_THE",
    "structuralSignature": [
      "article",
      "hospital",
      "specific_building_the"
    ],
    "incorrectPattern": "go to hospital as visitors",
    "correctPattern": "go to the hospital as visitors",
    "explanationZhHant": "以訪客身分前往某間醫院建築，不是接受住院服務，因此使用 the hospital。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_INDEFINITE_CONSONANT_SOUND_A",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE INDEFINITE CONSONANT_SOUND A",
    "formula": "ARTICLE.INDEFINITE.CONSONANT_SOUND.A",
    "structuralSignature": [
      "article",
      "indefinite",
      "consonant_sound",
      "a"
    ],
    "incorrectPattern": "an",
    "correctPattern": "a",
    "explanationZhHant": "community 以輔音音素/k/開始，前面用 a， 不用 an。 公式：a + 輔音音素開首的單數可數名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_INDEFINITE_FIRST_MENTION_A",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE INDEFINITE FIRST_MENTION A",
    "formula": "ARTICLE.INDEFINITE.FIRST_MENTION.A",
    "structuralSignature": [
      "article",
      "indefinite",
      "first_mention",
      "a"
    ],
    "incorrectPattern": "the fair",
    "correctPattern": "a fair",
    "explanationZhHant": "這裡首次提出一種尚未特定的校園環境，因此使用 a fair school environment。若前文已界定某一個特定環境， the 才可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_INSTITUTION_CLASS_ZERO_ACTIVITY",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE INSTITUTION CLASS ZERO_ACTIVITY",
    "formula": "ARTICLE.INSTITUTION.CLASS.ZERO_ACTIVITY",
    "structuralSignature": [
      "article",
      "institution",
      "class",
      "zero_activity"
    ],
    "incorrectPattern": "in the class",
    "correctPattern": "in class",
    "explanationZhHant": "in class 表示正在上課或參與課堂活動。in the class 可指某一個已知班別，例如 the talleststudent in the class，所以要按原意判斷。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_OF_NAME_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE INSTITUTION UNIVERSITY_OF_NAME THE",
    "formula": "ARTICLE.INSTITUTION.UNIVERSITY_OF_NAME.THE",
    "structuralSignature": [
      "article",
      "institution",
      "university_of_name",
      "the"
    ],
    "incorrectPattern": "at University of Westhaven",
    "correctPattern": "at the University of Westhaven",
    "explanationZhHant": "the University of Westhaven 是本資料集指定的官方名稱形式。 University of + 地名常帶 the，但系統仍應按機構正式名稱核對。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_ROLE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE INSTITUTION UNIVERSITY ZERO_ROLE",
    "formula": "ARTICLE.INSTITUTION.UNIVERSITY.ZERO_ROLE",
    "structuralSignature": [
      "article",
      "institution",
      "university",
      "zero_role"
    ],
    "incorrectPattern": "attend the university",
    "correctPattern": "attend university",
    "explanationZhHant": "英式英文中，以學生身分接受大學教育時可使用零冠詞： attend university。若指某一所特定大學， attend the university 也可能正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE INSTITUTION UNIVERSITY ZERO_STUDENT_ROLE",
    "formula": "ARTICLE.INSTITUTION.UNIVERSITY.ZERO_STUDENT_ROLE",
    "structuralSignature": [
      "article",
      "institution",
      "university",
      "zero_student_role"
    ],
    "incorrectPattern": "attend the university",
    "correctPattern": "attend university",
    "explanationZhHant": "英式英文中，表示以學生身分接受大學教育時，可使用零冠詞： attend university／go to university。若指某間特定大學， attend the university 也可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_MEAL_ROUTINE_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE MEAL ROUTINE_ZERO",
    "formula": "ARTICLE.MEAL.ROUTINE_ZERO",
    "structuralSignature": [
      "article",
      "meal",
      "routine_zero"
    ],
    "incorrectPattern": "have the breakfast",
    "correctPattern": "have breakfast",
    "explanationZhHant": "泛指日常用餐活動時，餐名通常用零冠詞： have breakfast。指某一頓特定早餐時可寫 the breakfast served by the hotel。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_MEDIA_TELEVISION_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE MEDIA TELEVISION ZERO",
    "formula": "ARTICLE.MEDIA.TELEVISION.ZERO",
    "structuralSignature": [
      "article",
      "media",
      "television",
      "zero"
    ],
    "incorrectPattern": "watch the television",
    "correctPattern": "watch television",
    "explanationZhHant": "表示觀看電視節目這種活動時，通常寫 watch television。 watch the television 可表示注視某部電視機。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_MONTH_NAME_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE MONTH_NAME ZERO",
    "formula": "ARTICLE.MONTH_NAME.ZERO",
    "structuralSignature": [
      "article",
      "month_name",
      "zero"
    ],
    "incorrectPattern": "the September 2023",
    "correctPattern": "September 2023",
    "explanationZhHant": "月份名稱直接與年份配合時通常不用冠詞：in September 2023。若有修飾語，可寫 in the September of that year，但意思和結構不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_MOST_OF_DEFINITE_PERIOD",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE MOST_OF DEFINITE_PERIOD",
    "formula": "ARTICLE.MOST_OF.DEFINITE_PERIOD",
    "structuralSignature": [
      "article",
      "most_of",
      "definite_period"
    ],
    "incorrectPattern": "most of period",
    "correctPattern": "most of the period",
    "explanationZhHant": "most of 後面接特定單數名詞時，需要限定詞： most of the period。 泛指多個時段則可寫 most periods。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_NAMED_DISTRICT_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE NAMED_DISTRICT THE",
    "formula": "ARTICLE.NAMED_DISTRICT.THE",
    "structuralSignature": [
      "article",
      "named_district",
      "the"
    ],
    "incorrectPattern": "Riverside district",
    "correctPattern": "the Riverside district",
    "explanationZhHant": "district 是普通可數名詞， Riverside 在這裡只用作名稱修飾語，因此完整名詞詞組使用 the Riverside district。正式名稱若只是 Riverside，則可能不用冠詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_ORDINAL_RANK_THE_SECOND_LARGEST",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE ORDINAL_RANK THE_SECOND_LARGEST",
    "formula": "ARTICLE.ORDINAL_RANK.THE_SECOND_LARGEST",
    "structuralSignature": [
      "article",
      "ordinal_rank",
      "the_second_largest"
    ],
    "incorrectPattern": "a second largest source",
    "correctPattern": "the second-largest source",
    "explanationZhHant": "表示已界定群體中的第二名，使用 the + 序數詞 + 最高級。 second-largest 共同修飾 source， 所以加連字號。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_ORDINAL_SPECIFIC_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE ORDINAL SPECIFIC_THE",
    "formula": "ARTICLE.ORDINAL.SPECIFIC_THE",
    "structuralSignature": [
      "article",
      "ordinal",
      "specific_the"
    ],
    "incorrectPattern": "During first week",
    "correctPattern": "During the first week",
    "explanationZhHant": "序數詞表示某個明確次序時，通常使用 the： the first week。若 First Week 是正式活動名稱，冠詞模式可能不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_PART_OF_THE_LAND",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE PART_OF_THE_LAND",
    "formula": "ARTICLE.PART_OF_THE_LAND",
    "structuralSignature": [
      "article",
      "part_of_the_land"
    ],
    "incorrectPattern": "farmland",
    "correctPattern": "the farmland",
    "explanationZhHant": "這裡指前文已提及的特定 farmland，因此使用 the。泛指農地時，零冠詞可以成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_PLURAL_NOUN_NO_A",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE PLURAL_NOUN NO_A",
    "formula": "ARTICLE.PLURAL_NOUN.NO_A",
    "structuralSignature": [
      "article",
      "plural_noun",
      "no_a"
    ],
    "incorrectPattern": "a normal students only have",
    "correctPattern": "normal students have only",
    "explanationZhHant": "a 只能配合單數可數名詞。可寫 a normal student 或 normal students；本句採用複數，與前面的 some affluent students 對照。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_PROPER_INSTITUTION_EASTFORD_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE PROPER_INSTITUTION EASTFORD_ZERO",
    "formula": "ARTICLE.PROPER_INSTITUTION.EASTFORD_ZERO",
    "structuralSignature": [
      "article",
      "proper_institution",
      "eastford_zero"
    ],
    "incorrectPattern": "The Eastford College",
    "correctPattern": "Eastford College",
    "explanationZhHant": "Eastford College 是完整專名，前面不用 the。正式名稱的冠詞必須按機構核准寫法處理；例如 the University of Westhaven 可以正確帶 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_PROPER_INSTITUTION_NORTHBRIDGE_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE PROPER_INSTITUTION NORTHBRIDGE_ZERO",
    "formula": "ARTICLE.PROPER_INSTITUTION.NORTHBRIDGE_ZERO",
    "structuralSignature": [
      "article",
      "proper_institution",
      "northbridge_zero"
    ],
    "incorrectPattern": "The Northbridge University",
    "correctPattern": "Northbridge University",
    "explanationZhHant": "Northbridge University 是本資料集指定的完整校名，前面不加 the。正式機構名稱的冠詞屬於名稱本身，系統必須先確認官方寫法，不可只看 University 自動刪除冠詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_RIVER_NAME_THE_RIVER_NAME",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE RIVER_NAME THE_RIVER_NAME",
    "formula": "ARTICLE.RIVER_NAME.THE_RIVER_NAME",
    "structuralSignature": [
      "article",
      "river_name",
      "the_river_name"
    ],
    "incorrectPattern": "River Elin",
    "correctPattern": "the River Elin",
    "explanationZhHant": "本資料集把官方名稱定為 the River Elin。河流名稱通常帶 the，但專名必須按地圖標示確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_ROUTE_NUMBER_DEFINITE_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE ROUTE_NUMBER DEFINITE_THE",
    "formula": "ARTICLE.ROUTE_NUMBER.DEFINITE_THE",
    "structuralSignature": [
      "article",
      "route_number",
      "definite_the"
    ],
    "incorrectPattern": "taking number 12 bus",
    "correctPattern": "taking the number 12 bus",
    "explanationZhHant": "指具有特定路線編號的巴士時，使用 the：the number 12 bus。 也可寫 take bus number 12。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE SINGULAR_COUNT UNIFORM IN_GERUND",
    "formula": "ARTICLE.SINGULAR_COUNT.UNIFORM.IN_GERUND",
    "structuralSignature": [
      "article",
      "singular_count",
      "uniform",
      "in_gerund"
    ],
    "incorrectPattern": "wearing uniform",
    "correctPattern": "wearing a uniform",
    "explanationZhHant": "uniform 在這裡是單數可數名詞，因此需要冠詞 a。即使整個結構由動名詞 wearing 開始，動名詞後面的名詞詞組仍須遵守冠詞規則。泛指多種校服時可寫 wearing uniforms。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_SPECIFIC_COMMON_ROOM_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE SPECIFIC COMMON_ROOM_THE",
    "formula": "ARTICLE.SPECIFIC.COMMON_ROOM_THE",
    "structuralSignature": [
      "article",
      "specific",
      "common_room_the"
    ],
    "incorrectPattern": "in common room",
    "correctPattern": "in the common room",
    "explanationZhHant": "common room 是單數可數名詞，並指學生已知的特定房間，所以需要 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_SPECIFIC_KNOWN_PLACE_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE SPECIFIC_KNOWN_PLACE THE",
    "formula": "ARTICLE.SPECIFIC_KNOWN_PLACE.THE",
    "structuralSignature": [
      "article",
      "specific_known_place",
      "the"
    ],
    "incorrectPattern": "in library",
    "correctPattern": "in the library",
    "explanationZhHant": "這裡指該大學內已知的特定圖書館，單數可數名詞前需要 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_SPECIFIC_RAMP_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE SPECIFIC_RAMP THE",
    "formula": "ARTICLE.SPECIFIC_RAMP.THE",
    "structuralSignature": [
      "article",
      "specific_ramp",
      "the"
    ],
    "incorrectPattern": "southern",
    "correctPattern": "the southern",
    "explanationZhHant": "這裡指已界定的特定斜道，需要 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_SPECIFIC_UNIVERSITY_THE_VISIT",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE SPECIFIC_UNIVERSITY THE_VISIT",
    "formula": "ARTICLE.SPECIFIC_UNIVERSITY.THE_VISIT",
    "structuralSignature": [
      "article",
      "specific_university",
      "the_visit"
    ],
    "incorrectPattern": "come to university for public lectures",
    "correctPattern": "come to the university for public lectures",
    "explanationZhHant": "訪客不是以學生身分「上大學」，而是前往前文所指的特定大學參加講座，因此使用 the university。判斷取決於人物角色和目的。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_SUPERLATIVE_THE_REQUIRED",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE SUPERLATIVE THE_REQUIRED",
    "formula": "ARTICLE.SUPERLATIVE.THE_REQUIRED",
    "structuralSignature": [
      "article",
      "superlative",
      "the_required"
    ],
    "incorrectPattern": "remained lowest",
    "correctPattern": "remained the lowest",
    "explanationZhHant": "最高級表示一組之中的極端位置，通常使用 the： the lowest。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_TITLE_NAME_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE TITLE_NAME ZERO",
    "formula": "ARTICLE.TITLE_NAME.ZERO",
    "structuralSignature": [
      "article",
      "title_name",
      "zero"
    ],
    "incorrectPattern": "The Professor Malik",
    "correctPattern": "Professor Malik",
    "explanationZhHant": "職銜直接放在人名之前時通常不用冠詞： Professor Malik、 Dr Chen。若沒有姓名，可以寫 the professor。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_TRANSPORT_BY_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE TRANSPORT BY_ZERO",
    "formula": "ARTICLE.TRANSPORT.BY_ZERO",
    "structuralSignature": [
      "article",
      "transport",
      "by_zero"
    ],
    "incorrectPattern": "by the bus",
    "correctPattern": "by bus",
    "explanationZhHant": "表示交通方式，用 by + 零冠詞交通工具：by bus、by train。表示人在某一架巴士上時，則寫 on the bus。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_UNCOUNTABLE_GENERIC_RESEARCH_ZERO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE UNCOUNTABLE_GENERIC RESEARCH ZERO",
    "formula": "ARTICLE.UNCOUNTABLE_GENERIC.RESEARCH.ZERO",
    "structuralSignature": [
      "article",
      "uncountable_generic",
      "research",
      "zero"
    ],
    "incorrectPattern": "conduct the research",
    "correctPattern": "conduct research",
    "explanationZhHant": "泛指研究活動時， research 是不可數名詞並使用零冠詞。若指前文已界定的某項研究，可使用 the research。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ARTICLE_UNIQUE_CONTEXT_MAIN_THE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：ARTICLE UNIQUE_CONTEXT MAIN_THE",
    "formula": "ARTICLE.UNIQUE_CONTEXT.MAIN_THE",
    "structuralSignature": [
      "article",
      "unique_context",
      "main_the"
    ],
    "incorrectPattern": "in a main library",
    "correctPattern": "in the main library",
    "explanationZhHant": "一間學院通常有在語境中可識別的主要圖書館，因此使用 the main library。若有多間同等的主要圖書館，a 才可能合適。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_BEEN_TO_RETURNED_VISIT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT BEEN_TO RETURNED_VISIT",
    "formula": "ASPECT.BEEN_TO.RETURNED_VISIT",
    "structuralSignature": [
      "aspect",
      "been_to",
      "returned_visit"
    ],
    "incorrectPattern": "had gone to London",
    "correctPattern": "had been to London",
    "explanationZhHant": "have／ had been to 表示曾到訪並已離開；have／had gone to 通常表示已前往而仍未返回。由於學生現在正在講述經歷，目標用 been to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_GONE_TO_STILL_AWAY",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT GONE_TO STILL_AWAY",
    "formula": "ASPECT.GONE_TO.STILL_AWAY",
    "structuralSignature": [
      "aspect",
      "gone_to",
      "still_away"
    ],
    "incorrectPattern": "had been to Manchester and would not return",
    "correctPattern": "had gone to Manchester and would not return",
    "explanationZhHant": "would not return until Friday 顯示哥哥當時仍在 Manchester，因此用 had gone to。若他已經回來，才可用 had been to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_NEVER_BEEN_TO_EXPERIENCE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT NEVER_BEEN_TO EXPERIENCE",
    "formula": "ASPECT.NEVER_BEEN_TO.EXPERIENCE",
    "structuralSignature": [
      "aspect",
      "never_been_to",
      "experience"
    ],
    "incorrectPattern": "had never gone to Eastford before",
    "correctPattern": "had never been to Eastford before",
    "explanationZhHant": "表示過去某時點之前從未有到訪經驗，通常用 had never been to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_STATIVE_BELONG_SIMPLE_NOT_PROGRESSIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT STATIVE BELONG SIMPLE_NOT_PROGRESSIVE",
    "formula": "ASPECT.STATIVE.BELONG.SIMPLE_NOT_PROGRESSIVE",
    "structuralSignature": [
      "aspect",
      "stative",
      "belong",
      "simple_not_progressive"
    ],
    "incorrectPattern": "is belonging",
    "correctPattern": "belongs",
    "explanationZhHant": "belong 表示所屬關係，通常不用進行式。標準結構是 belong to + 所有人／機構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT STATIVE CONTAIN SIMPLE_NOT_PROGRESSIVE",
    "formula": "ASPECT.STATIVE.CONTAIN.SIMPLE_NOT_PROGRESSIVE",
    "structuralSignature": [
      "aspect",
      "stative",
      "contain",
      "simple_not_progressive"
    ],
    "incorrectPattern": "is containing",
    "correctPattern": "contains",
    "explanationZhHant": "contain 表示某物包含甚麼時通常是狀態動詞，用一般現在式 contains，不用進行式。當 contain 表示正在控制火勢等較動態意思時，進行式可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_STATIVE_KNOW_SIMPLE_NOT_PROGRESSIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT STATIVE KNOW SIMPLE_NOT_PROGRESSIVE",
    "formula": "ASPECT.STATIVE.KNOW.SIMPLE_NOT_PROGRESSIVE",
    "structuralSignature": [
      "aspect",
      "stative",
      "know",
      "simple_not_progressive"
    ],
    "incorrectPattern": "are knowing",
    "correctPattern": "know",
    "explanationZhHant": "know 表示持有知識或認知狀態，通常使用一般時態。 get to know 表示逐漸認識時則可有進行形式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_STATIVE_OWN_SIMPLE_NOT_PROGRESSIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT STATIVE OWN SIMPLE_NOT_PROGRESSIVE",
    "formula": "ASPECT.STATIVE.OWN.SIMPLE_NOT_PROGRESSIVE",
    "structuralSignature": [
      "aspect",
      "stative",
      "own",
      "simple_not_progressive"
    ],
    "incorrectPattern": "is owning",
    "correctPattern": "owns",
    "explanationZhHant": "own 表示擁有時通常是狀態動詞，使用一般現在式。若 own 被特殊地轉成動態或暫時意思，才可能有例外。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ASPECT_TEMPORARY_ACTIVITY_PRESENT_PROGRESSIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：ASPECT TEMPORARY_ACTIVITY PRESENT_PROGRESSIVE",
    "formula": "ASPECT.TEMPORARY_ACTIVITY.PRESENT_PROGRESSIVE",
    "structuralSignature": [
      "aspect",
      "temporary_activity",
      "present_progressive"
    ],
    "incorrectPattern": "check",
    "correctPattern": "are checking",
    "explanationZhHant": "this week 表示目前有限期間內正在進行的臨時工作，因此使用現在進行式。若這是每週固定程序，則一般現在式可能正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "AUXILIARY_PROGRESSIVE_BE_NOT_ING",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：AUXILIARY PROGRESSIVE BE_NOT_ING",
    "formula": "AUXILIARY.PROGRESSIVE.BE_NOT_ING",
    "structuralSignature": [
      "auxiliary",
      "progressive",
      "be_not_ing"
    ],
    "incorrectPattern": "do not wearing",
    "correctPattern": "are not wearing",
    "explanationZhHant": "現在進行式使用 be + 動詞-ing。 主語 the staff 在本句按複數群體處理，所以寫 are not wearing。do not 後面則必須接原形 wear。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CAUSATIVE_GET_NP_TO_INFINITIVE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：CAUSATIVE GET NP TO_INFINITIVE",
    "formula": "CAUSATIVE.GET.NP.TO_INFINITIVE",
    "structuralSignature": [
      "causative",
      "get",
      "np",
      "to_infinitive"
    ],
    "incorrectPattern": "got a volunteer install",
    "correctPattern": "got a volunteer to install",
    "explanationZhHant": "get 表示說服或安排某人做事時，使用 get + 人 + to + 動詞原形。 它與 have + 人 + 動詞原形的結構不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CAUSATIVE_HAVE_NP_BASE_VERB",
    "category": "other_grammar",
    "titleZhHant": "文法規則：CAUSATIVE HAVE NP BASE_VERB",
    "formula": "CAUSATIVE.HAVE.NP.BASE_VERB",
    "structuralSignature": [
      "causative",
      "have",
      "np",
      "base_verb"
    ],
    "incorrectPattern": "had a technician to repair",
    "correctPattern": "had a technician repair",
    "explanationZhHant": "主動使役結構使用 have + 人 + 動詞原形，所以不加 to。 若重點是物件接受維修，可寫 had the scanner repaired。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CHANGE_DECLINE_FROM_TO",
    "category": "comparison",
    "titleZhHant": "文法規則：CHANGE DECLINE FROM_TO",
    "formula": "CHANGE.DECLINE.FROM_TO",
    "structuralSignature": [
      "change",
      "decline",
      "from_to"
    ],
    "incorrectPattern": "between 37 and 33 per cent",
    "correctPattern": "from 37 to 33 per cent",
    "explanationZhHant": "描述有方向的下降過程，用 decline from A to B。 between A and B 較適合描述變動範圍。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CHANGE_FALL_BY_AMOUNT",
    "category": "comparison",
    "titleZhHant": "文法規則：CHANGE FALL BY_AMOUNT",
    "formula": "CHANGE.FALL.BY_AMOUNT",
    "structuralSignature": [
      "change",
      "fall",
      "by_amount"
    ],
    "incorrectPattern": "fell of 1.1 MWh",
    "correctPattern": "fell by 1.1 MWh",
    "explanationZhHant": "fall by + 數值表示下降了多少。名詞結構才使用 a fall of 1.1 MWh。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CHANGE_FALL_TO_ENDPOINT",
    "category": "comparison",
    "titleZhHant": "文法規則：CHANGE FALL TO_ENDPOINT",
    "formula": "CHANGE.FALL.TO_ENDPOINT",
    "structuralSignature": [
      "change",
      "fall",
      "to_endpoint"
    ],
    "incorrectPattern": "at 3.4 MWh",
    "correctPattern": "to 3.4 MWh",
    "explanationZhHant": "fall to + 數值表示下降後的最終水平。fall by 表示下降幅度。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CHANGE_RISE_FROM_TO",
    "category": "comparison",
    "titleZhHant": "文法規則：CHANGE RISE FROM_TO",
    "formula": "CHANGE.RISE.FROM_TO",
    "structuralSignature": [
      "change",
      "rise",
      "from_to"
    ],
    "incorrectPattern": "by",
    "correctPattern": "to",
    "explanationZhHant": "描述起點和終點，用 rise from A to B。by 表示改變的幅度，而不是終點。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CHANGE_SHIFT_FROM_TO",
    "category": "comparison",
    "titleZhHant": "文法規則：CHANGE SHIFT FROM_TO",
    "formula": "CHANGE.SHIFT.FROM_TO",
    "structuralSignature": [
      "change",
      "shift",
      "from_to"
    ],
    "incorrectPattern": "into 14 percentage points",
    "correctPattern": "to 14 percentage points",
    "explanationZhHant": "數值由一個水平轉變至另一個水平，用 shift from A to B。 into 通常表示轉化成另一種形式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_AFTER_GERUND_SAME_SUBJECT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE AFTER GERUND_SAME_SUBJECT",
    "formula": "CLAUSE.AFTER.GERUND_SAME_SUBJECT",
    "structuralSignature": [
      "clause",
      "after",
      "gerund_same_subject"
    ],
    "incorrectPattern": "After peaked",
    "correctPattern": "After peaking",
    "explanationZhHant": "after 作介詞並直接接動作時，使用動名詞： after peaking。 也可寫完整分句 after it peaked。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_ALL_THAT_NOT_ALL_WHAT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE ALL_THAT NOT_ALL_WHAT",
    "formula": "CLAUSE.ALL_THAT.NOT_ALL_WHAT",
    "structuralSignature": [
      "clause",
      "all_that",
      "not_all_what"
    ],
    "incorrectPattern": "all what families reject",
    "correctPattern": "all that families reject",
    "explanationZhHant": "all 後面接關係分句時使用 that，不用 what。另一個正確寫法是 everything that families reject 或 what families reject，但不能把 all 和 what 疊用。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_CAUSED_BY_NP_RELATIVE_RESULT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE CAUSED_BY NP RELATIVE_RESULT",
    "formula": "CLAUSE.CAUSED_BY.NP.RELATIVE_RESULT",
    "structuralSignature": [
      "clause",
      "caused_by",
      "np",
      "relative_result"
    ],
    "incorrectPattern": "leads",
    "correctPattern": "which lead",
    "explanationZhHant": "is caused 已是主句的有限動詞，後面的 leads 不能在沒有連接詞下直接形成第二個謂語。加入 which 建立關係分句；先行詞 workloads 是複數，所以用 lead。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_CONDITIONAL_MAIN_CLAUSE_SUBJECT_AND_PREDICATE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE CONDITIONAL MAIN_CLAUSE SUBJECT_AND_PREDICATE",
    "formula": "CLAUSE.CONDITIONAL.MAIN_CLAUSE.SUBJECT_AND_PREDICATE",
    "structuralSignature": [
      "clause",
      "conditional",
      "main_clause",
      "subject_and_predicate"
    ],
    "incorrectPattern": "keep to change every year",
    "correctPattern": "they need to change their uniforms every year",
    "explanationZhHant": "if 從句後面需要完整主句。原句缺少主語，也沒有說明甚麼需要更換。目標句按上下文補成 they need to change their uniforms。也可能改為被動式 their uniforms need to be changed，因此需老師確認原意。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_COORDINATED_IF_CLAUSES_EXPLICIT_SUBJECT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE COORDINATED_IF_CLAUSES EXPLICIT_SUBJECT",
    "formula": "CLAUSE.COORDINATED_IF_CLAUSES.EXPLICIT_SUBJECT",
    "structuralSignature": [
      "clause",
      "coordinated_if_clauses",
      "explicit_subject"
    ],
    "incorrectPattern": "and",
    "correctPattern": "and employees",
    "explanationZhHant": "第一個動作由 the government 執行，第二個動作則按原意由 employees 執行。主語不同時，不能讓兩個動詞錯誤地共用同一主語，因此要明確補上 employees。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_COORDINATED_MISSING_SUBJECT_FINITE_VERB",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE COORDINATED MISSING_SUBJECT_FINITE_VERB",
    "formula": "CLAUSE.COORDINATED.MISSING_SUBJECT_FINITE_VERB",
    "structuralSignature": [
      "clause",
      "coordinated",
      "missing_subject_finite_verb"
    ],
    "incorrectPattern": "stores and enhanced",
    "correctPattern": "stores, and uniforms enhance",
    "explanationZhHant": "customers can locate staff 已是完整分句； enhanced 不能在沒有主語的情況下直接與它並列。第二個意思是制服提升信任和專業形象，因此補回主語 uniforms，並用一般現在式 enhance。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_COPULAR_ADVANTAGE_IS_THAT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE COPULAR ADVANTAGE IS_THAT",
    "formula": "CLAUSE.COPULAR.ADVANTAGE.IS_THAT",
    "structuralSignature": [
      "clause",
      "copular",
      "advantage",
      "is_that"
    ],
    "incorrectPattern": "One major advantage",
    "correctPattern": "One major advantage is that",
    "explanationZhHant": "One major advantage 只是一個名詞詞組，仍欠謂語。用 is that + 完整分句說明該優點的內容。公式：The advantage is that + 主語 + 動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_COPULAR_FOR_NP_TO_INFINITIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE COPULAR FOR_NP_TO_INFINITIVE",
    "formula": "CLAUSE.COPULAR.FOR_NP_TO_INFINITIVE",
    "structuralSignature": [
      "clause",
      "copular",
      "for_np_to_infinitive"
    ],
    "incorrectPattern": "solution is the government to limit",
    "correctPattern": "solution is for the government to limit",
    "explanationZhHant": "在 be 後用不定詞分句並明確指出執行者時，使用 for + 人／機構 + to + 動詞。公式： The solution is for X to do Y.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_COPULAR_NOUN_THAT_CLAUSE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE COPULAR NOUN_THAT_CLAUSE",
    "formula": "CLAUSE.COPULAR.NOUN_THAT_CLAUSE",
    "structuralSignature": [
      "clause",
      "copular",
      "noun_that_clause"
    ],
    "incorrectPattern": "is",
    "correctPattern": "is that",
    "explanationZhHant": "dimension is 後面要接說明其內容的補語。完整有限分句通常由 that 引出：The dimension is that + 主語 + 動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_COPULAR_PREPOSITIONAL_STAGE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE COPULAR PREPOSITIONAL_STAGE",
    "formula": "CLAUSE.COPULAR.PREPOSITIONAL_STAGE",
    "structuralSignature": [
      "clause",
      "copular",
      "prepositional_stage"
    ],
    "incorrectPattern": "in developmental stage",
    "correctPattern": "are at a developmental stage",
    "explanationZhHant": "students 後面需要有限動詞 are。表示某人處於某一發展階段，可寫 be at a developmental stage； stage 是單數可數名詞，需要 a。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_EMBEDDED_YES_NO_WHETHER",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE EMBEDDED_YES_NO WHETHER",
    "formula": "CLAUSE.EMBEDDED_YES_NO.WHETHER",
    "structuralSignature": [
      "clause",
      "embedded_yes_no",
      "whether"
    ],
    "incorrectPattern": "someone",
    "correctPattern": "whether someone",
    "explanationZhHant": "作者要判斷的是「某人是否為員工」，因此需要 whether 引出嵌入式是非問句。公式：figure out whether + 主語 + 動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_ESPECIALLY_BECAUSE_FINITE_REASON",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE ESPECIALLY BECAUSE FINITE_REASON",
    "formula": "CLAUSE.ESPECIALLY.BECAUSE.FINITE_REASON",
    "structuralSignature": [
      "clause",
      "especially",
      "because",
      "finite_reason"
    ],
    "incorrectPattern": "especially",
    "correctPattern": "especially because",
    "explanationZhHant": "wearing a uniform can help... 是完整分句。若它用來解釋「為甚麼有好處」，需要 because 引出原因。 especially 本身是副詞，不能單獨充當連接完整分句的從屬連接詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_ESSENTIAL_THAT_SUBJUNCTIVE_BE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE ESSENTIAL THAT SUBJUNCTIVE_BE",
    "formula": "CLAUSE.ESSENTIAL.THAT.SUBJUNCTIVE_BE",
    "structuralSignature": [
      "clause",
      "essential",
      "that",
      "subjunctive_be"
    ],
    "incorrectPattern": "system is tested",
    "correctPattern": "system be tested",
    "explanationZhHant": "essential that 後面表達必要安排時，可用原形虛擬語氣 be tested。 英式英文也可寫 should be tested。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_EVERY_DAY_ADVERBIAL_POSITION_AND_NUMBER",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE EVERY_DAY ADVERBIAL_POSITION_AND_NUMBER",
    "formula": "CLAUSE.EVERY_DAY.ADVERBIAL_POSITION_AND_NUMBER",
    "structuralSignature": [
      "clause",
      "every_day",
      "adverbial_position_and_number"
    ],
    "incorrectPattern": "everyday schools will become a faishon show",
    "correctPattern": "schools will become fashion shows every day",
    "explanationZhHant": "everyday 是形容詞，例如 everyday clothing；表示「每天」要寫兩個字 every day，並作時間副詞。 schools 是複數，所以表語名詞亦改為複數 fashion shows。 faishon 同時改正為 fashion。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_EXAMPLE_EXPLICIT_GENERIC_SUBJECT_MODAL",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE EXAMPLE EXPLICIT_GENERIC_SUBJECT_MODAL",
    "formula": "CLAUSE.EXAMPLE.EXPLICIT_GENERIC_SUBJECT_MODAL",
    "structuralSignature": [
      "clause",
      "example",
      "explicit_generic_subject_modal"
    ],
    "incorrectPattern": "turn off",
    "correctPattern": "people can turn off",
    "explanationZhHant": "原句可能被讀成祈使句，但整段正在概括人們可以採取的措施。目標句補上一般主語 people 和情態動詞 can。 若作者確實想直接向讀者提出命令， turn off... 也可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_EXISTENTIAL_THERE_WAS_NO",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE EXISTENTIAL THERE_WAS_NO",
    "formula": "CLAUSE.EXISTENTIAL.THERE_WAS_NO",
    "structuralSignature": [
      "clause",
      "existential",
      "there_was_no"
    ],
    "incorrectPattern": "there had no direct connection",
    "correctPattern": "there was no direct connection",
    "explanationZhHant": "英文存現句使用 there + be： there was no...。不能把粵語或中文的「有」直接翻成 there had。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_EXISTENTIAL_THERE_WILL_BE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE EXISTENTIAL THERE_WILL_BE",
    "formula": "CLAUSE.EXISTENTIAL.THERE_WILL_BE",
    "structuralSignature": [
      "clause",
      "existential",
      "there_will_be"
    ],
    "incorrectPattern": "it will have",
    "correctPattern": "there will be",
    "explanationZhHant": "表示某事將會存在或發生，用 there will be + 名詞。 it will have 需要一個有明確指涉的主語，並表示該主語擁有某物，不適合本句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_FRAGMENT_MISSING_SUBJECT_I_HOPE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE FRAGMENT MISSING_SUBJECT I_HOPE",
    "formula": "CLAUSE.FRAGMENT.MISSING_SUBJECT.I_HOPE",
    "structuralSignature": [
      "clause",
      "fragment",
      "missing_subject",
      "i_hope"
    ],
    "incorrectPattern": "Hope this",
    "correctPattern": "I hope this",
    "explanationZhHant": "陳述句中的 hope 需要主語。根據文章由第一身表達立場，補回 I。祈使句可省略主語，但 Hope this... 在此不是自然的祈使結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_FRAGMENT_PURPOSE_ADJUNCT_MAIN_CLAUSE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE FRAGMENT PURPOSE_ADJUNCT MAIN_CLAUSE",
    "formula": "CLAUSE.FRAGMENT.PURPOSE_ADJUNCT.MAIN_CLAUSE",
    "structuralSignature": [
      "clause",
      "fragment",
      "purpose_adjunct",
      "main_clause"
    ],
    "incorrectPattern": "In many schools, In order to train students discipline.",
    "correctPattern": "In many schools, uniforms are required in order to instil discipline in students.",
    "explanationZhHant": "in order to + 動詞是表示目的的從屬結構，不能單獨成句，必須依附主句。目標句補回 uniforms are required。此外，表示「培養紀律」可用 instil discipline in students。由於主句是根據下一句推斷，必須由老師確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_FRAGMENT_SUBJECT_ADJECTIVE_INFINITIVE_RECONSTRUCTION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE FRAGMENT SUBJECT_ADJECTIVE INFINITIVE_RECONSTRUCTION",
    "formula": "CLAUSE.FRAGMENT.SUBJECT_ADJECTIVE.INFINITIVE_RECONSTRUCTION",
    "structuralSignature": [
      "clause",
      "fragment",
      "subject_adjective",
      "infinitive_reconstruction"
    ],
    "incorrectPattern": "their tired bodies to make money",
    "correctPattern": "their bodies become tired as they work to make money",
    "explanationZhHant": "原文只有名詞詞組 their tired bodies 和不定詞，沒有有限動詞，因此不是完整句子。目標句加入 become，再以 as 說明身體疲累時正在進行的工作。這是原意推斷，須老師覆核。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_FRONTED_IF_COMMA_BEFORE_MAIN",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE FRONTED_IF COMMA_BEFORE_MAIN",
    "formula": "CLAUSE.FRONTED_IF.COMMA_BEFORE_MAIN",
    "structuralSignature": [
      "clause",
      "fronted_if",
      "comma_before_main"
    ],
    "incorrectPattern": ".this",
    "correctPattern": ", this",
    "explanationZhHant": "if 分句一直延伸至 their lives， 其後的 this problem can be solved 才是主句。因此不能在兩者之間使用句號；應以逗號分隔，並把 this 改為小寫。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_FRONTED_IF_MAIN_CLAUSE_SUBJECT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE FRONTED_IF MAIN_CLAUSE_SUBJECT",
    "formula": "CLAUSE.FRONTED_IF.MAIN_CLAUSE_SUBJECT",
    "structuralSignature": [
      "clause",
      "fronted_if",
      "main_clause_subject"
    ],
    "incorrectPattern": "boundaries",
    "correctPattern": "boundaries, these measures",
    "explanationZhHant": "句首 If... 部分是條件分句，之後仍需要一個完整主句。原文只有 can protect，欠缺主語；目標句加入 these measures，並以逗號分隔條件分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_FUSED_RELATIVE_NO_RESUMPTIVE_PRONOUN",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE FUSED_RELATIVE NO_RESUMPTIVE_PRONOUN",
    "formula": "CLAUSE.FUSED_RELATIVE.NO_RESUMPTIVE_PRONOUN",
    "structuralSignature": [
      "clause",
      "fused_relative",
      "no_resumptive_pronoun"
    ],
    "incorrectPattern": "What it concerned",
    "correctPattern": "What concerned",
    "explanationZhHant": "What concerned residents most 是融合關係分句；what 已同時表示「那件事」並在分句中擔任主語，因此不能再加入 it。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_HOWEVER_ADJECTIVE_CONCESSIVE_ORDER",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE HOWEVER ADJECTIVE CONCESSIVE_ORDER",
    "formula": "CLAUSE.HOWEVER.ADJECTIVE.CONCESSIVE_ORDER",
    "structuralSignature": [
      "clause",
      "however",
      "adjective",
      "concessive_order"
    ],
    "incorrectPattern": "However the repairs complicated may become",
    "correctPattern": "However complicated the repairs may become",
    "explanationZhHant": "however 表示「無論多麼」時，形容詞要立即放在 however 後面。公式： however + 形容詞 + 主語 + may／might + 動詞。亦可寫 No matter how complicate d…。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_ILLUSTRATION_AS_ADJUNCT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE ILLUSTRATION AS_ADJUNCT",
    "formula": "CLAUSE.ILLUSTRATION.AS_ADJUNCT",
    "structuralSignature": [
      "clause",
      "illustration",
      "as_adjunct"
    ],
    "incorrectPattern": "A clear illustration",
    "correctPattern": "As a clear illustration",
    "explanationZhHant": "A clear illustration 單獨放在逗號前只是名詞詞組，沒有連接到後面的例子。加入 as 後，它成為句首狀語：As a clear illustr ation,...。更常見的替代寫法是 For example,...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_INDIRECT_YES_NO_WHETHER_STATEMENT_ORDER",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE INDIRECT_YES_NO WHETHER_STATEMENT_ORDER",
    "formula": "CLAUSE.INDIRECT_YES_NO.WHETHER_STATEMENT_ORDER",
    "structuralSignature": [
      "clause",
      "indirect_yes_no",
      "whether_statement_order"
    ],
    "incorrectPattern": "asked did the survey represented",
    "correctPattern": "asked whether the survey had represented",
    "explanationZhHant": "ask 後面的間接是非問句由 whether／if 引出，並使用陳述句語序。調查代表各群體發生在會議前，因此目標使用過去完成式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_IN_CASE_FUTURE_PRESENT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE IN_CASE FUTURE_PRESENT",
    "formula": "CLAUSE.IN_CASE.FUTURE_PRESENT",
    "structuralSignature": [
      "clause",
      "in_case",
      "future_present"
    ],
    "incorrectPattern": "in case the database will become unavailable",
    "correctPattern": "in case the database becomes unavailable",
    "explanationZhHant": "in case 引出的未來可能情況通常用一般現在式，不用 will。主句可保留將來式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_LEST_BASE_SUBJUNCTIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE LEST BASE_SUBJUNCTIVE",
    "formula": "CLAUSE.LEST.BASE_SUBJUNCTIVE",
    "structuralSignature": [
      "clause",
      "lest",
      "base_subjunctive"
    ],
    "incorrectPattern": "lest another breakdown leaves",
    "correctPattern": "lest another breakdown leave",
    "explanationZhHant": "正式英文中的 lest 可接原形虛擬語氣：lest + 主語 + 動詞原形。英式英文亦常用 lest… should leave。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_MAIN_SUBJECT_NO_RESUMPTIVE_PRONOUN",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE MAIN_SUBJECT NO_RESUMPTIVE_PRONOUN",
    "formula": "CLAUSE.MAIN_SUBJECT.NO_RESUMPTIVE_PRONOUN",
    "structuralSignature": [
      "clause",
      "main_subject",
      "no_resumptive_pronoun"
    ],
    "incorrectPattern": "our private time it has",
    "correctPattern": "our private time has",
    "explanationZhHant": "our private time 已經是主句主語，不能再加入代名詞 it 重複同一主語。公式：主語 + 有限動詞，不是主語 + it + 有限動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_MEAN_THAT_REQUIRES_FINITE_PREDICATE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE MEAN THAT REQUIRES_FINITE_PREDICATE",
    "formula": "CLAUSE.MEAN.THAT.REQUIRES_FINITE_PREDICATE",
    "structuralSignature": [
      "clause",
      "mean",
      "that",
      "requires_finite_predicate"
    ],
    "incorrectPattern": "This means that fewer patients needing",
    "correctPattern": "This means fewer patients needing",
    "explanationZhHant": "mean that 後面必須接完整分句，即需要有限動詞，例如 This means that fewer patients will need surgery. 原句選用名詞詞組 fewer patients needing... 作賓語，因此不要加入 that。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_MISSING_COPULA_ADJECTIVE_COMPLEMENT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE MISSING_COPULA ADJECTIVE_COMPLEMENT",
    "formula": "CLAUSE.MISSING_COPULA.ADJECTIVE_COMPLEMENT",
    "structuralSignature": [
      "clause",
      "missing_copula",
      "adjective_complement"
    ],
    "incorrectPattern": "uniform quality",
    "correctPattern": "they are",
    "explanationZhHant": "not warm 是形容詞補語，前面需要主語和連繫動詞 be。目標句以 they 指回 uniforms：they are not warm。若原意是品質差，可另寫 the material is not warm enough。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_MUCH_AS_CONCESSIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE MUCH_AS CONCESSIVE",
    "formula": "CLAUSE.MUCH_AS.CONCESSIVE",
    "structuralSignature": [
      "clause",
      "much_as",
      "concessive"
    ],
    "incorrectPattern": "Much although",
    "correctPattern": "Much as",
    "explanationZhHant": "Much as + 主語 + 動詞可表示「雖然」。不能把 much 和 although 直接組合。另一個正確寫法是 Although the mayor wanted…。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NEITHER_AUXILIARY_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NEITHER AUXILIARY_INVERSION",
    "formula": "CLAUSE.NEITHER.AUXILIARY_INVERSION",
    "structuralSignature": [
      "clause",
      "neither",
      "auxiliary_inversion"
    ],
    "incorrectPattern": "neither the transport office had published",
    "correctPattern": "neither had the transport office published",
    "explanationZhHant": "neither 接續前面的否定分句時，要使用助動詞倒裝： neither + 助動詞 + 主語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NONRESTRICTIVE_WHICH_NO_COORDINATING_AND",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NONRESTRICTIVE_WHICH NO_COORDINATING_AND",
    "formula": "CLAUSE.NONRESTRICTIVE_WHICH.NO_COORDINATING_AND",
    "structuralSignature": [
      "clause",
      "nonrestrictive_which",
      "no_coordinating_and"
    ],
    "incorrectPattern": ", and which",
    "correctPattern": ", which",
    "explanationZhHant": "which may boost... 是補充前面整個結果的非限制性關係分句。前面已有逗號連接，因此不再加入 and。 另一個正確寫法是分成兩個主句：..., and this may boost their anxiety.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NOR_AUXILIARY_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NOR AUXILIARY_INVERSION",
    "formula": "CLAUSE.NOR.AUXILIARY_INVERSION",
    "structuralSignature": [
      "clause",
      "nor",
      "auxiliary_inversion"
    ],
    "incorrectPattern": "nor they may photograph",
    "correctPattern": "nor may they photograph",
    "explanationZhHant": "nor 接續另一個否定分句時，通常使用助動詞倒裝：nor + 助動詞 + 主語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NOT_ONLY_INITIAL_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NOT_ONLY INITIAL_INVERSION",
    "formula": "CLAUSE.NOT_ONLY.INITIAL_INVERSION",
    "structuralSignature": [
      "clause",
      "not_only",
      "initial_inversion"
    ],
    "incorrectPattern": "Not only several contractors failed",
    "correctPattern": "Not only did several contractors fail",
    "explanationZhHant": "Not only 放在句首並修飾整個分句時，要使用助動詞倒裝：Not only + did + 主語 + 動詞原形。邊界： Not only the contractors but also the engineers agreed 中， not only 只連接名詞詞組，因此不用倒裝。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NOT_UNTIL_INITIAL_MAIN_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NOT_UNTIL INITIAL_MAIN_INVERSION",
    "formula": "CLAUSE.NOT_UNTIL.INITIAL_MAIN_INVERSION",
    "structuralSignature": [
      "clause",
      "not_until",
      "initial_main_inversion"
    ],
    "incorrectPattern": "Not until the exhibition opened residents realised",
    "correctPattern": "Not until the exhibition opened did residents realise",
    "explanationZhHant": "Not until + 分句放在句首時，後面的主句要使用助動詞倒裝： did + 主語 + 動詞原形。若放在句尾，則不用倒裝： Residents did not realise it until the exhibition opened.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NO_SOONER_PAST_PERFECT_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NO_SOONER PAST_PERFECT_INVERSION",
    "formula": "CLAUSE.NO_SOONER.PAST_PERFECT_INVERSION",
    "structuralSignature": [
      "clause",
      "no_sooner",
      "past_perfect_inversion"
    ],
    "incorrectPattern": "No sooner the investigators had",
    "correctPattern": "No sooner had the investigators",
    "explanationZhHant": "No sooner 放在句首時，要使用過去完成式倒裝：No sooner + had + 主語 + 過去分詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_NO_STAFF_BE_PROGRESSIVE_ARTICLE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE NO_STAFF BE_PROGRESSIVE ARTICLE",
    "formula": "CLAUSE.NO_STAFF.BE_PROGRESSIVE.ARTICLE",
    "structuralSignature": [
      "clause",
      "no_staff",
      "be_progressive",
      "article"
    ],
    "incorrectPattern": "wearing uniform",
    "correctPattern": "are wearing a uniform",
    "explanationZhHant": "關係分句需要有限動詞，所以在 wearing 前加入 are。 uniform 是單數可數名詞，前面需要冠詞 a。本句把 staff 視為多名員工，因此使用 are。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_ONLY_AFTER_INITIAL_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE ONLY_AFTER INITIAL_INVERSION",
    "formula": "CLAUSE.ONLY_AFTER.INITIAL_INVERSION",
    "structuralSignature": [
      "clause",
      "only_after",
      "initial_inversion"
    ],
    "incorrectPattern": "the panel ruled",
    "correctPattern": "did the panel rule",
    "explanationZhHant": "Only after + 分句放在句首時，主句要倒裝： Only after… did + 主語 + 動詞原形。若 only after 放在句尾，則不用倒裝：The panel ruled out fraud only after examining the records。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_PREPOSITION_WHETHER_NOT_IF",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE PREPOSITION WHETHER NOT_IF",
    "formula": "CLAUSE.PREPOSITION.WHETHER.NOT_IF",
    "structuralSignature": [
      "clause",
      "preposition",
      "whether",
      "not_if"
    ],
    "incorrectPattern": "depends on if",
    "correctPattern": "depends on whether",
    "explanationZhHant": "疑問分句直接放在介詞 on 後面時，標準寫法使用 whether。if 一般不能直接跟在介詞後。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RARELY_INITIAL_PAST_PERFECT_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RARELY INITIAL_PAST_PERFECT_INVERSION",
    "formula": "CLAUSE.RARELY.INITIAL_PAST_PERFECT_INVERSION",
    "structuralSignature": [
      "clause",
      "rarely",
      "initial_past_perfect_inversion"
    ],
    "incorrectPattern": "Rarely the museum had received",
    "correctPattern": "Rarely had the museum received",
    "explanationZhHant": "Rarely 等具否定或限制意思的副詞放在句首時，要把助動詞放到主語前。這裡原本是過去完成式，所以寫 Rarely had the museum received...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REASON_COPULAR_THAT_CLAUSE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REASON COPULAR_THAT_CLAUSE",
    "formula": "CLAUSE.REASON.COPULAR_THAT_CLAUSE",
    "structuralSignature": [
      "clause",
      "reason",
      "copular_that_clause"
    ],
    "incorrectPattern": "reason is due to",
    "correctPattern": "reason is that",
    "explanationZhHant": "reason is that + 完整分句用來說明原因內容。due to 後面通常接名詞詞組，例如 The improvement is due to preventive spending；不能直接接 preventive spending creates... 這個有限分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REASON_WHY_IS_THAT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REASON_WHY IS_THAT",
    "formula": "CLAUSE.REASON_WHY.IS_THAT",
    "structuralSignature": [
      "clause",
      "reason_why",
      "is_that"
    ],
    "incorrectPattern": "is because",
    "correctPattern": "is that",
    "explanationZhHant": "正式標準結構是 The reason why... is that + 分句。because 本身表示原因，在 reason is because 中形成重複。非正式英文偶爾可見原寫法，因此新規則宜先設為 suggestion-only。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RECOMMEND_THAT_BASE_SUBJUNCTIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RECOMMEND THAT BASE_SUBJUNCTIVE",
    "formula": "CLAUSE.RECOMMEND.THAT.BASE_SUBJUNCTIVE",
    "structuralSignature": [
      "clause",
      "recommend",
      "that",
      "base_subjunctive"
    ],
    "incorrectPattern": "contractor provides",
    "correctPattern": "contractor provide",
    "explanationZhHant": "recommend that 後面表達要求或建議時，可使用原形虛擬語氣： that each contractor provide。英式英文亦接受 that each contractor should provide。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RECOMMEND_THAT_PASSIVE_BE_SUBJUNCTIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RECOMMEND THAT PASSIVE_BE_SUBJUNCTIVE",
    "formula": "CLAUSE.RECOMMEND.THAT.PASSIVE_BE_SUBJUNCTIVE",
    "structuralSignature": [
      "clause",
      "recommend",
      "that",
      "passive_be_subjunctive"
    ],
    "incorrectPattern": "drills carried out",
    "correctPattern": "drills be carried out",
    "explanationZhHant": "被動虛擬語氣要保留 be： recommend that + 主語 + be + 過去分詞。亦可寫 should be carried out。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REDUCED_RELATIVE_ACTIVE_PRESENT_PARTICIPLE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REDUCED_RELATIVE ACTIVE_PRESENT_PARTICIPLE",
    "formula": "CLAUSE.REDUCED_RELATIVE.ACTIVE_PRESENT_PARTICIPLE",
    "structuralSignature": [
      "clause",
      "reduced_relative",
      "active_present_participle"
    ],
    "incorrectPattern": "portfolios contained",
    "correctPattern": "portfolios containing",
    "explanationZhHant": "portfolios 主動「包含」資料，所以可使用現在分詞縮減關係分句： portfolios contain ing...， 相當於 portfolios that contain...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REDUCED_RELATIVE_NO_WHO_BEFORE_PARTICIPLE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REDUCED_RELATIVE NO_WHO_BEFORE_PARTICIPLE",
    "formula": "CLAUSE.REDUCED_RELATIVE.NO_WHO_BEFORE_PARTICIPLE",
    "structuralSignature": [
      "clause",
      "reduced_relative",
      "no_who_before_participle"
    ],
    "incorrectPattern": "students who living",
    "correctPattern": "students living",
    "explanationZhHant": "可寫完整關係分句 students who are living...，或縮減為 students living...。不能只保留 who 而省略必要的 are。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REDUCED_RELATIVE_PASSIVE_PARTICIPLE_FORM",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REDUCED_RELATIVE PASSIVE PARTICIPLE_FORM",
    "formula": "CLAUSE.REDUCED_RELATIVE.PASSIVE.PARTICIPLE_FORM",
    "structuralSignature": [
      "clause",
      "reduced_relative",
      "passive",
      "participle_form"
    ],
    "incorrectPattern": "references submitting without signatures",
    "correctPattern": "references submitted without signatures",
    "explanationZhHant": "references 是「被提交」的文件，所以縮減關係分句使用過去分詞 submitted。 submitting 會表示 references 主動提交其他東西。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REDUCED_RELATIVE_PASSIVE_REMOVE_FINITE_BE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REDUCED_RELATIVE PASSIVE REMOVE_FINITE_BE",
    "formula": "CLAUSE.REDUCED_RELATIVE.PASSIVE.REMOVE_FINITE_BE",
    "structuralSignature": [
      "clause",
      "reduced_relative",
      "passive",
      "remove_finite_be"
    ],
    "incorrectPattern": "Applications were submitted after the deadline will",
    "correctPattern": "Applications submitted after the deadline will",
    "explanationZhHant": "will be considered 已是主句謂語。前面的 submitted after the deadline 應作縮減被動關係分句，不能另用有限動詞 were。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REDUCED_RELATIVE_PASSIVE_WRITTEN_NOT_WROTE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REDUCED_RELATIVE PASSIVE WRITTEN_NOT_WROTE",
    "formula": "CLAUSE.REDUCED_RELATIVE.PASSIVE.WRITTEN_NOT_WROTE",
    "structuralSignature": [
      "clause",
      "reduced_relative",
      "passive",
      "written_not_wrote"
    ],
    "incorrectPattern": "reports wrote",
    "correctPattern": "reports written",
    "explanationZhHant": "reports 是「被寫成」某種語言，所以使用過去分詞 written。 wrote 是主動過去式，不能直接放在名詞後構成被動修飾語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RELATIVE_FRONTED_PREPOSITION_WHICH",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RELATIVE FRONTED_PREPOSITION WHICH",
    "formula": "CLAUSE.RELATIVE.FRONTED_PREPOSITION.WHICH",
    "structuralSignature": [
      "clause",
      "relative",
      "fronted_preposition",
      "which"
    ],
    "incorrectPattern": "on that",
    "correctPattern": "on which",
    "explanationZhHant": "介詞放在關係代名詞前面時，物件使用 which，不使用 that。所以寫 pumps on which the districts depended。另一個正確寫法是 pumps which the districts depended on。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RELATIVE_LOCATION_WHERE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RELATIVE LOCATION WHERE",
    "formula": "CLAUSE.RELATIVE.LOCATION.WHERE",
    "structuralSignature": [
      "clause",
      "relative",
      "location",
      "where"
    ],
    "incorrectPattern": "with",
    "correctPattern": "where",
    "explanationZhHant": "後面是包含主語和動詞的完整分句，用來描述 airport 裡的情況，因此使用關係副詞 where。 with 後面不能直接接 the staff do... 這種有限分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RELATIVE_OBJECT_NO_RESUMPTIVE_PRONOUN",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RELATIVE OBJECT NO_RESUMPTIVE_PRONOUN",
    "formula": "CLAUSE.RELATIVE.OBJECT.NO_RESUMPTIVE_PRONOUN",
    "structuralSignature": [
      "clause",
      "relative",
      "object",
      "no_resumptive_pronoun"
    ],
    "incorrectPattern": "erase it",
    "correctPattern": "erase",
    "explanationZhHant": "that 已把 pain 連接到關係分句，並代表 erase 的賓語，所以句末不可再加入 it。正確結構是 pain + that + 主語 + 動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RELATIVE PASSIVE_BE_PARTICIPLE",
    "formula": "CLAUSE.RELATIVE.PASSIVE_BE_PARTICIPLE",
    "structuralSignature": [
      "clause",
      "relative",
      "passive_be_participle"
    ],
    "incorrectPattern": "that located",
    "correctPattern": "that was located",
    "explanationZhHant": "supermarket 是「位於」某處，完整被動關係分句要有 be + 過去分詞： that was located。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RELATIVE_RESTRICTIVE_THAT_NO_COMMAS",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RELATIVE RESTRICTIVE_THAT NO_COMMAS",
    "formula": "CLAUSE.RELATIVE.RESTRICTIVE_THAT.NO_COMMAS",
    "structuralSignature": [
      "clause",
      "relative",
      "restrictive_that",
      "no_commas"
    ],
    "incorrectPattern": "A health system, that only responds after people are already sick, is",
    "correctPattern": "A health system that only responds after people are already sick is",
    "explanationZhHant": "that only responds... 用來界定是哪一類 health system，是限制性關係分句，因此前後不加逗號。非限制性補充資料通常用 which 並以逗號分隔，例如 The system, which was introduced last year, is expensiv e.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_REPORTING_PASSIVE_PERFECT_INFINITIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE REPORTING_PASSIVE PERFECT_INFINITIVE",
    "formula": "CLAUSE.REPORTING_PASSIVE.PERFECT_INFINITIVE",
    "structuralSignature": [
      "clause",
      "reporting_passive",
      "perfect_infinitive"
    ],
    "incorrectPattern": "is believed having cost",
    "correctPattern": "is believed to have cost",
    "explanationZhHant": "damage 發生在現在的相信或估計之前，因此使用被動報告結構 is believed to have + 過去分詞。邊界：The project is believed to cost £5 million 可表示目前估計的成本。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_RESULT_ALLOWING_LAND_ABOVE_IT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE RESULT ALLOWING LAND_ABOVE_IT",
    "formula": "CLAUSE.RESULT.ALLOWING.LAND_ABOVE_IT",
    "structuralSignature": [
      "clause",
      "result",
      "allowing",
      "land_above_it"
    ],
    "incorrectPattern": "which allows the above land",
    "correctPattern": "allowing the land above it",
    "explanationZhHant": "the above land 通常表示「上文提及的土地」，不是物理上位於上方的土地。應寫 the land above it。現在分詞 allowing 清楚表示前述工程的結果。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_SO_ADJECTIVE_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE SO_ADJECTIVE INVERSION",
    "formula": "CLAUSE.SO_ADJECTIVE.INVERSION",
    "structuralSignature": [
      "clause",
      "so_adjective",
      "inversion"
    ],
    "incorrectPattern": "So complicated the forms were",
    "correctPattern": "So complicated were the forms",
    "explanationZhHant": "So + 形容詞放在句首以加強語氣時，使用主語與 be 的倒裝：So complicated were the forms that...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_SUBORDINATOR_FRAGMENT_REMOVE_ALTHOUGH",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE SUBORDINATOR_FRAGMENT REMOVE_ALTHOUGH",
    "formula": "CLAUSE.SUBORDINATOR_FRAGMENT.REMOVE_ALTHOUGH",
    "structuralSignature": [
      "clause",
      "subordinator_fragment",
      "remove_although"
    ],
    "incorrectPattern": "Although it",
    "correctPattern": "It",
    "explanationZhHant": "although 會把後面的內容變成從屬分句，因此不能單獨成句。最小修正是刪除 Although。另一個正確方案是把它接回上一句：..., although it is predicted to fall...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_SUCH_WAS_NOUN_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE SUCH_WAS NOUN_INVERSION",
    "formula": "CLAUSE.SUCH_WAS.NOUN_INVERSION",
    "structuralSignature": [
      "clause",
      "such_was",
      "noun_inversion"
    ],
    "incorrectPattern": "such the confusion was",
    "correctPattern": "such was the confusion",
    "explanationZhHant": "正式強調結構是 Such was + 名詞詞組 + that...，表示程度非常高。不可把 the confusion 放在 was 前。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_THAT_PLURAL_SUBJECT_FINITE_PRESENT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE THAT PLURAL_SUBJECT FINITE_PRESENT",
    "formula": "CLAUSE.THAT.PLURAL_SUBJECT.FINITE_PRESENT",
    "structuralSignature": [
      "clause",
      "that",
      "plural_subject",
      "finite_present"
    ],
    "incorrectPattern": "facing",
    "correctPattern": "face",
    "explanationZhHant": "that 後面需要完整分句。 many employees 是複數主語，因此使用一般現在式有限動詞 face。 employees facing... 可作名詞詞組，但不能在這裡單獨充當完整分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_THE_WAY_IN_WHICH_NOT_HOW",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE THE_WAY IN_WHICH NOT_HOW",
    "formula": "CLAUSE.THE_WAY.IN_WHICH.NOT_HOW",
    "structuralSignature": [
      "clause",
      "the_way",
      "in_which",
      "not_how"
    ],
    "incorrectPattern": "The way how volunteers describe",
    "correctPattern": "The way in which volunteers describe",
    "explanationZhHant": "標準寫法可用 the way in which...、 the way... 或單獨的 how...。一般不使用重複的 the way how...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_UNDER_NO_CIRCUMSTANCES_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE UNDER_NO_CIRCUMSTANCES INVERSION",
    "formula": "CLAUSE.UNDER_NO_CIRCUMSTANCES.INVERSION",
    "structuralSignature": [
      "clause",
      "under_no_circumstances",
      "inversion"
    ],
    "incorrectPattern": "Under no circumstances visitors should remove",
    "correctPattern": "Under no circumstances should visitors remove",
    "explanationZhHant": "Under no circumstances 放在句首時，主句使用助動詞倒裝： should + 主語 + 動詞原形。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_WHATEVER_FUTURE_PRESENT_NOT_WILL",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE WHATEVER FUTURE_PRESENT_NOT_WILL",
    "formula": "CLAUSE.WHATEVER.FUTURE_PRESENT_NOT_WILL",
    "structuralSignature": [
      "clause",
      "whatever",
      "future_present_not_will"
    ],
    "incorrectPattern": "will be",
    "correctPattern": "is",
    "explanationZhHant": "whatever 引出的從屬分句談論未來時，通常使用一般現在式，不在分句內加入 will。主句可使用將來式或其他合適時態。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_WHEN_FUTURE_PRESENT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE WHEN FUTURE_PRESENT",
    "formula": "CLAUSE.WHEN.FUTURE_PRESENT",
    "structuralSignature": [
      "clause",
      "when",
      "future_present"
    ],
    "incorrectPattern": "will arise",
    "correctPattern": "arises",
    "explanationZhHant": "指未來的時間分句通常使用一般現在式：when a problem arises。 主句才使用將來或情態結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLAUSE_WHILE_SHARED_SUBJECT_PARTICIPLE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLAUSE WHILE SHARED_SUBJECT PARTICIPLE",
    "formula": "CLAUSE.WHILE.SHARED_SUBJECT.PARTICIPLE",
    "structuralSignature": [
      "clause",
      "while",
      "shared_subject",
      "participle"
    ],
    "incorrectPattern": "remain",
    "correctPattern": "retaining",
    "explanationZhHant": "省略重複主語時， while 後可用現在分詞：while retaining...。也可寫完整分句 while it retains...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CLEFT_IT_WAS_NOT_UNTIL_THAT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CLEFT IT_WAS_NOT_UNTIL THAT",
    "formula": "CLEFT.IT_WAS_NOT_UNTIL.THAT",
    "structuralSignature": [
      "cleft",
      "it_was_not_until",
      "that"
    ],
    "incorrectPattern": "when",
    "correctPattern": "that",
    "explanationZhHant": "強調句型固定使用 It was not until X that Y。 when 可引出普通時間分句，但不能取代這個強調結構中的 that。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_ACCOUNT_FOR_PERCENTAGE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC ACCOUNT_FOR PERCENTAGE",
    "formula": "COLLOC.ACCOUNT_FOR.PERCENTAGE",
    "structuralSignature": [
      "colloc",
      "account_for",
      "percentage"
    ],
    "incorrectPattern": "is almost one-half, got 50.1%",
    "correctPattern": "accounted for 50.1% of the population",
    "explanationZhHant": "圖表寫作中，表示某組別佔整體某個百分比，可用 account for + 百分比 + of the total/population。 2000 年是過去數據，所以用 accounted for。 got 50.1% 不適合描述人口比例。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_ANXIETY_ABOUT_CLOTHING",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC ANXIETY_ABOUT CLOTHING",
    "formula": "COLLOC.ANXIETY_ABOUT.CLOTHING",
    "structuralSignature": [
      "colloc",
      "anxiety_about",
      "clothing"
    ],
    "incorrectPattern": "this wearing anxiety",
    "correctPattern": "anxiety about clothing",
    "explanationZhHant": "anxiety 通常用 about 或 over 引出令人憂慮的事情。 wearing anxiety 不能清楚表達「對衣着的焦慮」。也可寫 clothing-related anxiety。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_ASSIGN_DUTIES",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC ASSIGN DUTIES",
    "formula": "COLLOC.ASSIGN.DUTIES",
    "structuralSignature": [
      "colloc",
      "assign",
      "duties"
    ],
    "incorrectPattern": "offer job duties",
    "correctPattern": "assign duties",
    "explanationZhHant": "工作任務通常由僱主 assign，所以用 assign duties。offer a job 是提供職位； offer help 是提供協助，與分派職責不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_CHART_AGE_DISTRIBUTION_POPULATION",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC CHART AGE_DISTRIBUTION POPULATION",
    "formula": "COLLOC.CHART.AGE_DISTRIBUTION.POPULATION",
    "structuralSignature": [
      "colloc",
      "chart",
      "age_distribution",
      "population"
    ],
    "incorrectPattern": "the age of residents",
    "correctPattern": "the age distributions of the populations",
    "explanationZhHant": "圖表比較的是人口中不同年齡組別所佔的比例，因此通常寫 age distribution of the population，而不是只寫個別居民的 age。原句並非完全不能理解，但目標寫法更準確地描述統計內容。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_CHART_SEGMENT_NOT_SLICE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC CHART SEGMENT NOT_SLICE",
    "formula": "COLLOC.CHART.SEGMENT.NOT_SLICE",
    "structuralSignature": [
      "colloc",
      "chart",
      "segment",
      "not_slice"
    ],
    "incorrectPattern": "slice",
    "correctPattern": "segment",
    "explanationZhHant": "slice 可以描述圓形圖中的一塊，因此並非文法錯誤；不過正式報告通常用 segment、 category 或 age group。 這項修改屬圖表語域建議。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_CONDUCT_RESEARCH",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC CONDUCT_RESEARCH",
    "formula": "COLLOC.CONDUCT_RESEARCH",
    "structuralSignature": [
      "colloc",
      "conduct_research"
    ],
    "incorrectPattern": "has made research",
    "correctPattern": "has conducted research",
    "explanationZhHant": "research 通常配合 conduct、 carry out 或 do，不使用 make research。 do research 也是正確替代。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_CYCLE_PATH",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC CYCLE_PATH",
    "formula": "COLLOC.CYCLE_PATH",
    "structuralSignature": [
      "colloc",
      "cycle_path"
    ],
    "incorrectPattern": "cycling path",
    "correctPattern": "cycle path",
    "explanationZhHant": "指專供單車使用的道路，常用固定複合名詞 cycle path。 cycling path 可以理解，但不是一般地圖標示。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_EVOLVE_FROM_INTO",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC EVOLVE FROM_INTO",
    "formula": "COLLOC.EVOLVE.FROM_INTO",
    "structuralSignature": [
      "colloc",
      "evolve",
      "from_into"
    ],
    "incorrectPattern": "transformed",
    "correctPattern": "evolved",
    "explanationZhHant": "描述地區逐步發展成另一種形態，常用 evolve from A into B。 transform from A into B 亦可成立；原句的主要問題是搭配不穩定而非絕對不合文法。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_EXCESSIVE_WORKLOAD_PLURAL",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC EXCESSIVE_WORKLOAD PLURAL",
    "formula": "COLLOC.EXCESSIVE_WORKLOAD.PLURAL",
    "structuralSignature": [
      "colloc",
      "excessive_workload",
      "plural"
    ],
    "incorrectPattern": "over workload",
    "correctPattern": "excessive workloads,",
    "explanationZhHant": "over 不能直接這樣修飾 workload。表示工作量過多，可用 an excessive workload 或泛指多種工作負擔的 excessive workloads。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_FALL_BEHIND_SCHEDULE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC FALL_BEHIND_SCHEDULE",
    "formula": "COLLOC.FALL_BEHIND_SCHEDULE",
    "structuralSignature": [
      "colloc",
      "fall_behind_schedule"
    ],
    "incorrectPattern": "fallen beneath schedule",
    "correctPattern": "fallen behind schedule",
    "explanationZhHant": "表示進度遲於計劃時，固定搭配是 fall behind schedule。 below 可用於 below target／ below budget，但不宜取代 behind schedule。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_GIVE_NP_PRIORITY",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC GIVE NP PRIORITY",
    "formula": "COLLOC.GIVE.NP.PRIORITY",
    "structuralSignature": [
      "colloc",
      "give",
      "np",
      "priority"
    ],
    "incorrectPattern": "give the strongest priority for prevention",
    "correctPattern": "give prevention the strongest priority",
    "explanationZhHant": "本句使用 give + 對象 + priority：give prevention the strongest priority。另一個正確寫法是 give the strongest priority to prevention；這個結構不用 for。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_GIVE_PERSON_WORK",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC GIVE PERSON WORK",
    "formula": "COLLOC.GIVE.PERSON.WORK",
    "structuralSignature": [
      "colloc",
      "give",
      "person",
      "work"
    ],
    "incorrectPattern": "offer jobs for them",
    "correctPattern": "give them work",
    "explanationZhHant": "offer someone a job 通常表示提供一個職位；本句則指僱主在下班後給員工工作，所以可寫 give them work。 另一個正確寫法是 assign work to them。 這項修改涉及 job 和 work 的意思差別，宜保留老師覆核。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_HAVE_EFFECTS_ON",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC HAVE_EFFECTS ON",
    "formula": "COLLOC.HAVE_EFFECTS.ON",
    "structuralSignature": [
      "colloc",
      "have_effects",
      "on"
    ],
    "incorrectPattern": "has placed detrimental effects on",
    "correctPattern": "has had detrimental effects on",
    "explanationZhHant": "表示某事對某人產生影響，可用 have an effect on 或 have effects on。 所以這裡寫 has had detrimental effects on workers。另一個正確結構是 has placed considerablepressure on workers，但不能混合兩個搭配。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_HAVE_PERSONAL_TIME",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC HAVE_PERSONAL_TIME",
    "formula": "COLLOC.HAVE_PERSONAL_TIME",
    "structuralSignature": [
      "colloc",
      "have_personal_time"
    ],
    "incorrectPattern": "keep",
    "correctPattern": "have",
    "explanationZhHant": "表示工人擁有較多私人時間，通常用 have more personal time。keep time 有守時、記錄時間等其他意思，因此在這裡不夠準確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_HAVE_TIME_TO_SLEEP",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC HAVE_TIME TO_SLEEP",
    "formula": "COLLOC.HAVE_TIME.TO_SLEEP",
    "structuralSignature": [
      "colloc",
      "have_time",
      "to_sleep"
    ],
    "incorrectPattern": "homework and get quality",
    "correctPattern": "homework, have more",
    "explanationZhHant": "quality time 通常指有意義地與某人相處或從事重視的活動，不等於可供睡眠的時間。若原意是「多一點時間睡覺」，可寫 have more time to sleep；若強調睡眠量，可寫 get enough sleep。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_LATER_IN_LIFE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC LATER IN_LIFE",
    "formula": "COLLOC.LATER.IN_LIFE",
    "structuralSignature": [
      "colloc",
      "later",
      "in_life"
    ],
    "incorrectPattern": "later at life",
    "correctPattern": "later in life",
    "explanationZhHant": "是 later in life，表示在人生較後階段。也可寫 at a later stage in life，但不能直接寫 later at life。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_MAKE_DRESSING_EASIER",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC MAKE DRESSING_EASIER",
    "formula": "COLLOC.MAKE.DRESSING_EASIER",
    "structuralSignature": [
      "colloc",
      "make",
      "dressing_easier"
    ],
    "incorrectPattern": "wearing",
    "correctPattern": "dressing",
    "explanationZhHant": "單獨的 wearing 通常需要說明穿甚麼，例如 wearing uniforms。表示「令穿衣更容易」，可用名詞化動作 dressing，也可寫 make getting dressed easier。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_MAKE_PROGRESS",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC MAKE_PROGRESS",
    "formula": "COLLOC.MAKE_PROGRESS",
    "structuralSignature": [
      "colloc",
      "make_progress"
    ],
    "incorrectPattern": "done progress",
    "correctPattern": "made progress",
    "explanationZhHant": "固定搭配是 make progress。 progress 在這裡通常是不可數名詞，不寫 do progress 或 make a progress。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_PROVIDE_CONDITIONS",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC PROVIDE CONDITIONS",
    "formula": "COLLOC.PROVIDE.CONDITIONS",
    "structuralSignature": [
      "colloc",
      "provide",
      "conditions"
    ],
    "incorrectPattern": "give a",
    "correctPattern": "provide",
    "explanationZhHant": "表示政府或僱主創造工作條件，常用 provide working conditions。 give 也可使用，但通常需要明確受詞，如 give employees better working conditions。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_PROVIDE_PARKING",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC PROVIDE PARKING",
    "formula": "COLLOC.PROVIDE.PARKING",
    "structuralSignature": [
      "colloc",
      "provide",
      "parking"
    ],
    "incorrectPattern": "supplied",
    "correctPattern": "provided",
    "explanationZhHant": "表示設置公共設施通常用 provide parking。supply 多用於可供應的物品或服務，例如水、電或設備。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_STAND_AT_VALUE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC STAND_AT VALUE",
    "formula": "COLLOC.STAND_AT.VALUE",
    "structuralSignature": [
      "colloc",
      "stand_at",
      "value"
    ],
    "incorrectPattern": "stood 4.0 MWh",
    "correctPattern": "stood at 4.0 MWh",
    "explanationZhHant": "stand at + 數值表示某項數據處於指定水平。不能直接寫 stand 4.0。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_STRONGLY_BELIEVE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC STRONGLY_BELIEVE",
    "formula": "COLLOC.STRONGLY_BELIEVE",
    "structuralSignature": [
      "colloc",
      "strongly_believe"
    ],
    "incorrectPattern": "highly believe",
    "correctPattern": "strongly believe",
    "explanationZhHant": "表示相信程度很高，標準搭配是 strongly believe。 highly 常修飾 successful、 unlikely、 recommended 等詞； highly believe 並非一般標準搭配。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_TAKE_INTO_CONSIDERATION_NO_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC TAKE_INTO_CONSIDERATION NO_OF",
    "formula": "COLLOC.TAKE_INTO_CONSIDERATION.NO_OF",
    "structuralSignature": [
      "colloc",
      "take_into_consideration",
      "no_of"
    ],
    "incorrectPattern": "take into consideration of costs",
    "correctPattern": "take into consideration costs",
    "explanationZhHant": "take into consideration 後面直接接考慮的事項，不加 of。較常見的另一詞序是 take costs into consideration。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_TAKE_IT_FOR_GRANTED",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC TAKE_IT_FOR_GRANTED",
    "formula": "COLLOC.TAKE_IT_FOR_GRANTED",
    "structuralSignature": [
      "colloc",
      "take_it_for_granted"
    ],
    "incorrectPattern": "take it as granted",
    "correctPattern": "take it for granted",
    "explanationZhHant": "固定搭配是 take it for granted that…，表示未經思考便假定某事必然成立。邊界：take it as given that… 也是正確搭配，但使用 given，不使用 granted。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_TAKE_ROOT_NO_POSSESSIVE",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC TAKE_ROOT NO_POSSESSIVE",
    "formula": "COLLOC.TAKE_ROOT.NO_POSSESSIVE",
    "structuralSignature": [
      "colloc",
      "take_root",
      "no_possessive"
    ],
    "incorrectPattern": "illness takes its root",
    "correctPattern": "illness takes root",
    "explanationZhHant": "take root 是固定搭配，表示開始穩固存在或發展，不加入 its。A tree spreads its roots 中的 its roots 是普通名詞詞組，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_UNIFORM_REQUIREMENTS_COMPOUND_NOUN",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC UNIFORM_REQUIREMENTS COMPOUND_NOUN",
    "formula": "COLLOC.UNIFORM_REQUIREMENTS.COMPOUND_NOUN",
    "structuralSignature": [
      "colloc",
      "uniform_requirements",
      "compound_noun"
    ],
    "incorrectPattern": "requestment in uniform",
    "correctPattern": "uniform requirements",
    "explanationZhHant": "requestment 不是這個意思下的標準名詞；應用 requirements。表示校服規定時，通常把單數名詞 uniform 放在 requirements 前：uniform requirements。另一個正確寫法是 requirements regarding uniforms。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_USE_OF_PUBLIC_MONEY",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC USE OF PUBLIC_MONEY",
    "formula": "COLLOC.USE.OF.PUBLIC_MONEY",
    "structuralSignature": [
      "colloc",
      "use",
      "of",
      "public_money"
    ],
    "incorrectPattern": "for",
    "correctPattern": "of",
    "explanationZhHant": "表示「公共資金的運用」，用 the use of public money。 money for treatment 可以成立，但那表示撥作治療用途的資金，結構和意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_WICK_AWAY_SWEAT",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC WICK_AWAY SWEAT",
    "formula": "COLLOC.WICK_AWAY.SWEAT",
    "structuralSignature": [
      "colloc",
      "wick_away",
      "sweat"
    ],
    "incorrectPattern": "take",
    "correctPattern": "wick",
    "explanationZhHant": "描述布料把汗水帶離皮膚時，常用 wick away sweat。 absorb sweat 也可能成立，但意思偏向吸收汗水； take away sweat 雖可理解，並非標準衣料搭配。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COLLOC_WITHIN_WALKING_DISTANCE_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：COLLOC WITHIN_WALKING_DISTANCE_OF",
    "formula": "COLLOC.WITHIN_WALKING_DISTANCE_OF",
    "structuralSignature": [
      "colloc",
      "within_walking_distance_of"
    ],
    "incorrectPattern": "reside at a walking distance from",
    "correctPattern": "live within walking distance of",
    "explanationZhHant": "固定搭配是 within walking distance of + 地點。at a distance from 可表示一般距離，但不能混合兩種框架。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_BELOW_DIRECT_NO_THAN",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP BELOW DIRECT_NO_THAN",
    "formula": "COMP.BELOW.DIRECT_NO_THAN",
    "structuralSignature": [
      "comp",
      "below",
      "direct_no_than"
    ],
    "incorrectPattern": "under than Southvale",
    "correctPattern": "below Southvale",
    "explanationZhHant": "below 可直接接比較對象，不加 than。若使用形容詞比較級，可寫 lower than Southvale。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_CORRELATIVE_THE_MORE_THE_LESS",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP CORRELATIVE THE_MORE_THE_LESS",
    "formula": "COMP.CORRELATIVE.THE_MORE_THE_LESS",
    "structuralSignature": [
      "comp",
      "correlative",
      "the_more_the_less"
    ],
    "incorrectPattern": "similar failures are the less likely",
    "correctPattern": "the less likely similar failures are",
    "explanationZhHant": "表示兩件事按比例變化時，兩個分句都要以 the + 比較級開始。公式：The more…, the less + 形容詞 + 主語 + 動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_DOUBLE_COMPARATIVE_NO_MORE",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP DOUBLE_COMPARATIVE NO_MORE",
    "formula": "COMP.DOUBLE_COMPARATIVE.NO_MORE",
    "structuralSignature": [
      "comp",
      "double_comparative",
      "no_more"
    ],
    "incorrectPattern": "more wiser",
    "correctPattern": "wiser",
    "explanationZhHant": "wiser 已經是比較級，不再加入 more。可以寫 much wiser，因為 much 是程度副詞，不是另一個比較級標記。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_ELLIPSIS_THAT_OF_SINGULAR_NOUN",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP ELLIPSIS THAT_OF SINGULAR_NOUN",
    "formula": "COMP.ELLIPSIS.THAT_OF.SINGULAR_NOUN",
    "structuralSignature": [
      "comp",
      "ellipsis",
      "that_of",
      "singular_noun"
    ],
    "incorrectPattern": "the earlier model",
    "correctPattern": "that of the earlier model",
    "explanationZhHant": "要比較的是兩部掃描器的 output， 而不是把 output 與 model 比較。that 代替已出現的單數名詞 output： that of the earlier model。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_FAR_FARTHER_OR_FURTHER",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP FAR FARTHER_OR_FURTHER",
    "formula": "COMP.FAR.FARTHER_OR_FURTHER",
    "structuralSignature": [
      "comp",
      "far",
      "farther_or_further"
    ],
    "incorrectPattern": "more far away",
    "correctPattern": "farther away",
    "explanationZhHant": "far 的標準比較級是 farther 或 further，不用 more far。兩者均可指實際距離，尤其在英式英文中。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_FIGURE_FOR_GROUP",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP FIGURE_FOR GROUP",
    "formula": "COMP.FIGURE_FOR.GROUP",
    "structuralSignature": [
      "comp",
      "figure_for",
      "group"
    ],
    "incorrectPattern": "15-59 years old 46.3%",
    "correctPattern": "the 46.3% recorded for those aged 15–59",
    "explanationZhHant": "higher than 後面需要明確的比較對象。目標句先寫百分比，再用 recorded for those aged 15–59 說明該數字屬於哪個組別。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_LARGE_SUPERLATIVE_LARGEST",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP LARGE SUPERLATIVE_LARGEST",
    "formula": "COMP.LARGE.SUPERLATIVE_LARGEST",
    "structuralSignature": [
      "comp",
      "large",
      "superlative_largest"
    ],
    "incorrectPattern": "the most large",
    "correctPattern": "the largest",
    "explanationZhHant": "large 的最高級是 largest， 不用 most large。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_MORE_ADJECTIVE_THAN_COMPLEMENT",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP MORE_ADJECTIVE THAN_COMPLEMENT",
    "formula": "COMP.MORE_ADJECTIVE.THAN_COMPLEMENT",
    "structuralSignature": [
      "comp",
      "more_adjective",
      "than_complement"
    ],
    "incorrectPattern": "more important to treating",
    "correctPattern": "more important than treating",
    "explanationZhHant": "比較兩件事的重要程度時，用 more important than。 important to someone 也可以正確，意思是「對某人重要」，但不是本句的比較結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_MULTIPLIER_AS_MUCH_AS",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP MULTIPLIER AS_MUCH_AS",
    "formula": "COMP.MULTIPLIER.AS_MUCH_AS",
    "structuralSignature": [
      "comp",
      "multiplier",
      "as_much_as"
    ],
    "incorrectPattern": "times as much electricity than",
    "correctPattern": "times as much electricity as",
    "explanationZhHant": "不可數名詞的倍數比較使用倍數 + as much + 名詞 + as。可數複數則用 as many... as。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_MULTIPLIER_TIMES_NOT_FOLDS",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP MULTIPLIER TIMES_NOT_FOLDS",
    "formula": "COMP.MULTIPLIER.TIMES_NOT_FOLDS",
    "structuralSignature": [
      "comp",
      "multiplier",
      "times_not_folds"
    ],
    "incorrectPattern": "two and a half folds",
    "correctPattern": "two and a half times",
    "explanationZhHant": "數字倍數後使用 times。 twofold 是單一詞，可寫 a twofold increase，但不寫 two folds。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_MULTIPLIER_TIMES_NO_THAN",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP MULTIPLIER TIMES_NO_THAN",
    "formula": "COMP.MULTIPLIER.TIMES_NO_THAN",
    "structuralSignature": [
      "comp",
      "multiplier",
      "times_no_than"
    ],
    "incorrectPattern": "times than the 2005 level",
    "correctPattern": "times the 2005 level",
    "explanationZhHant": "倍數 + times + 名詞詞組後面不加 than。另一個結構是 one and a half times as high as...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_MULTIPLIER_TWICE_AS_ADJECTIVE_AS",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP MULTIPLIER TWICE_AS_ADJECTIVE_AS",
    "formula": "COMP.MULTIPLIER.TWICE_AS_ADJECTIVE_AS",
    "structuralSignature": [
      "comp",
      "multiplier",
      "twice_as_adjective_as"
    ],
    "incorrectPattern": "twice more efficient than",
    "correctPattern": "twice as efficient as",
    "explanationZhHant": "表示倍數比較時，標準結構是 twice as + 形容詞 + as。twice more efficient than 容易造成倍數意思不清。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_PERCENTAGE_HIGHER_THAN",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP PERCENTAGE HIGHER_THAN",
    "formula": "COMP.PERCENTAGE.HIGHER_THAN",
    "structuralSignature": [
      "comp",
      "percentage",
      "higher_than"
    ],
    "incorrectPattern": "more than",
    "correctPattern": "higher than",
    "explanationZhHant": "比較數字、比例或百分比時，通常用 higher than。 more than 並非必然錯誤，但更常表示數量超過某個數值， 而不是比較兩個比例。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_POPULATION_POSSESSIVE_ELLIPSIS",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP POPULATION POSSESSIVE_ELLIPSIS",
    "formula": "COMP.POPULATION.POSSESSIVE_ELLIPSIS",
    "structuralSignature": [
      "comp",
      "population",
      "possessive_ellipsis"
    ],
    "incorrectPattern": "Italy",
    "correctPattern": "Italy's",
    "explanationZhHant": "前面比較的是 Yemen's population，所以後面也要比較 Italy 的人口，而不是把人口直接與國家比較。 Italy's 省略了重複的 population。公式： A's population is younger than B's.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_PREFER_A_TO_B",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP PREFER A_TO_B",
    "formula": "COMP.PREFER.A_TO_B",
    "structuralSignature": [
      "comp",
      "prefer",
      "a_to_b"
    ],
    "incorrectPattern": "prefer repairing old things than buying new ones",
    "correctPattern": "prefer repairing old things to buying new ones",
    "explanationZhHant": "比較兩個偏好選項時，prefer 使用 A to B，不用 than。兩邊應保持相同形式。公式： prefer + 名詞／動名詞 + to + 名詞／動名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_SAME_AS",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP SAME_AS",
    "formula": "COMP.SAME_AS",
    "structuralSignature": [
      "comp",
      "same_as"
    ],
    "incorrectPattern": "the same with",
    "correctPattern": "the same as",
    "explanationZhHant": "表示兩者相同時，使用 the same as。with 可出現在 share something with 等其他結構，但不適用於這個比較框架。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_SHARP_SUPERLATIVE_SHARPEST",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP SHARP SUPERLATIVE_SHARPEST",
    "formula": "COMP.SHARP.SUPERLATIVE_SHARPEST",
    "structuralSignature": [
      "comp",
      "sharp",
      "superlative_sharpest"
    ],
    "incorrectPattern": "the most sharp fall",
    "correctPattern": "the sharpest fall",
    "explanationZhHant": "短形容詞 sharp 加-est 形成最高級： the sharpest。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_SHORT_ADJECTIVE_ER_FORM",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP SHORT_ADJECTIVE ER_FORM",
    "formula": "COMP.SHORT_ADJECTIVE.ER_FORM",
    "structuralSignature": [
      "comp",
      "short_adjective",
      "er_form"
    ],
    "incorrectPattern": "more cheap",
    "correctPattern": "cheaper",
    "explanationZhHant": "短形容詞 cheap 通常加-er 形成比較級： cheaper。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_SUPERIOR_TO",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP SUPERIOR TO",
    "formula": "COMP.SUPERIOR.TO",
    "structuralSignature": [
      "comp",
      "superior",
      "to"
    ],
    "incorrectPattern": "superior than",
    "correctPattern": "superior to",
    "explanationZhHant": "superior 的比較搭配使用 to，不用 than。相同規則亦常見於 inferior to、senior to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COMP_SUPERLATIVE_OF_DEFINED_SET",
    "category": "comparison",
    "titleZhHant": "文法規則：COMP SUPERLATIVE OF_DEFINED_SET",
    "formula": "COMP.SUPERLATIVE.OF_DEFINED_SET",
    "structuralSignature": [
      "comp",
      "superlative",
      "of_defined_set"
    ],
    "incorrectPattern": "from the four",
    "correctPattern": "of the four",
    "explanationZhHant": "表示某項在一個已界定群組中的最高或最低位置，用 of + 群組： the lowest of the four。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONDITIONAL_FIRST_IF_PRESENT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CONDITIONAL FIRST IF_PRESENT",
    "formula": "CONDITIONAL.FIRST.IF_PRESENT",
    "structuralSignature": [
      "conditional",
      "first",
      "if_present"
    ],
    "incorrectPattern": "it will rain",
    "correctPattern": "it rains",
    "explanationZhHant": "第一條件句的 if 分句通常用一般現在式，所以寫 if it rains； will 放在結果分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONDITIONAL_INVERTED_HAD_NO_IF",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CONDITIONAL INVERTED_HAD NO_IF",
    "formula": "CONDITIONAL.INVERTED_HAD.NO_IF",
    "structuralSignature": [
      "conditional",
      "inverted_had",
      "no_if"
    ],
    "incorrectPattern": "If had the council acted",
    "correctPattern": "Had the council acted",
    "explanationZhHant": "第三條件句可省略 if， 並把 had 放到主語前：Had the council acted…。 不能同時保留 if 和倒裝。另一個正確寫法是 If the council had acted…。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONDITIONAL_INVERTED_SHOULD_BASE_VERB",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CONDITIONAL INVERTED_SHOULD BASE_VERB",
    "formula": "CONDITIONAL.INVERTED_SHOULD.BASE_VERB",
    "structuralSignature": [
      "conditional",
      "inverted_should",
      "base_verb"
    ],
    "incorrectPattern": "Should any donor will object",
    "correctPattern": "Should any donor object",
    "explanationZhHant": "Should + 主語 + 動詞原形是正式的倒裝條件句，相當於 If any donor should object。 should 後面不能再加入 will。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONDITIONAL_INVERTED_WERE_WOULD",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：CONDITIONAL INVERTED_WERE WOULD",
    "formula": "CONDITIONAL.INVERTED_WERE.WOULD",
    "structuralSignature": [
      "conditional",
      "inverted_were",
      "would"
    ],
    "incorrectPattern": "Were it not for donations, the archive will close",
    "correctPattern": "Were it not for donations, the archive would close",
    "explanationZhHant": "Were it not for... 相當於 If it were not for...，是現在或未來的反事實條件，因此結果部分用 would + 動詞原形。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_ALTHOUGH_FINITE_CLAUSE",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ ALTHOUGH FINITE_CLAUSE",
    "formula": "CONJ.ALTHOUGH.FINITE_CLAUSE",
    "structuralSignature": [
      "conj",
      "although",
      "finite_clause"
    ],
    "incorrectPattern": "despite its original entrance remained at the same location",
    "correctPattern": "although its original entrance remained in the same position",
    "explanationZhHant": "although 後面接完整有限分句。 despite 後面接名詞或動名詞，例如 despite the entrance remaining unchanged。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_ALTHOUGH_NO_COORDINATING_BUT",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ ALTHOUGH NO_COORDINATING_BUT",
    "formula": "CONJ.ALTHOUGH.NO_COORDINATING_BUT",
    "structuralSignature": [
      "conj",
      "although",
      "no_coordinating_but"
    ],
    "incorrectPattern": "Although treating",
    "correctPattern": "Treating",
    "explanationZhHant": "although 和 but 不應同時連接同一對分句。可寫 Although treating illness matters, preventing it is wiser，或像目標句一樣寫 Treating illness matters, but...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_BECAUSE_FINITE_CLAUSE_NOT_BECAUSE_OF",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ BECAUSE FINITE_CLAUSE NOT_BECAUSE_OF",
    "formula": "CONJ.BECAUSE.FINITE_CLAUSE.NOT_BECAUSE_OF",
    "structuralSignature": [
      "conj",
      "because",
      "finite_clause",
      "not_because_of"
    ],
    "incorrectPattern": "of it",
    "correctPattern": "it",
    "explanationZhHant": "because 後面接完整分句： because it reduces...。because of 後面接名詞詞組，例如 because of the reduction in suffering。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_BETWEEN_AND_NOT_OR",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ BETWEEN AND NOT_OR",
    "formula": "CONJ.BETWEEN.AND.NOT_OR",
    "structuralSignature": [
      "conj",
      "between",
      "and",
      "not_or"
    ],
    "incorrectPattern": "between taking the item home or leaving it for collection",
    "correctPattern": "between taking the item home and leaving it for collection",
    "explanationZhHant": "between 連接兩個選項時，標準結構是 between A and B， 不用 or。 邊界： either A or B 才使用 or。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_BOTH_AND_REQUIRED",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ BOTH AND REQUIRED",
    "formula": "CONJ.BOTH.AND.REQUIRED",
    "structuralSignature": [
      "conj",
      "both",
      "and",
      "required"
    ],
    "incorrectPattern": "both money as human suffering",
    "correctPattern": "both money and human suffering",
    "explanationZhHant": "both 的標準配對連接詞是 and。公式： both A and B。如果不用 both，則 A as well as B 可以成立，但不可混合成 both A as B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_NEITHER_NOR_NEGATIVE_COORDINATION",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ NEITHER_NOR NEGATIVE_COORDINATION",
    "formula": "CONJ.NEITHER_NOR.NEGATIVE_COORDINATION",
    "structuralSignature": [
      "conj",
      "neither_nor",
      "negative_coordination"
    ],
    "incorrectPattern": "not comfortable and practical",
    "correctPattern": "neither comfortable nor practical",
    "explanationZhHant": "not A and B 有時只表示「並非同時兼具 A 和 B」， 不一定否定兩項。根據下文，作者似乎想表示校服既不舒適，也不實用，因此用 neither A nor B。由於修改會確定否定範圍，需老師確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_NOT_ONLY_BUT_ALSO_CLAUSES",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ NOT_ONLY BUT_ALSO CLAUSES",
    "formula": "CONJ.NOT_ONLY.BUT_ALSO.CLAUSES",
    "structuralSignature": [
      "conj",
      "not_only",
      "but_also",
      "clauses"
    ],
    "incorrectPattern": "and they also",
    "correctPattern": "but they also",
    "explanationZhHant": "not only 所引出的兩部分通常由 but also 配合。當兩邊都是完整分句，可寫 Not only did X…, but X also…。沒有 not only 時，and also 可以正確使用。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_NO_SOONER_THAN",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ NO_SOONER THAN",
    "formula": "CONJ.NO_SOONER.THAN",
    "structuralSignature": [
      "conj",
      "no_sooner",
      "than"
    ],
    "incorrectPattern": "when",
    "correctPattern": "than",
    "explanationZhHant": "標準配對是 no sooner… than…。對照： hardly／ scarcely… when…。 系統不可把兩組連接詞混合。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_SINCE_NO_RESULT_SO",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ SINCE NO_RESULT_SO",
    "formula": "CONJ.SINCE.NO_RESULT_SO",
    "structuralSignature": [
      "conj",
      "since",
      "no_result_so"
    ],
    "incorrectPattern": ", so",
    "correctPattern": ",",
    "explanationZhHant": "since 已引出原因分句，主句前不再加入結果連接詞 so。可寫 Since A, B， 或 A, so B， 但一般不混合成 Since A, soB。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_UNLESS_NO_REDUNDANT_NEGATION",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ UNLESS NO_REDUNDANT_NEGATION",
    "formula": "CONJ.UNLESS.NO_REDUNDANT_NEGATION",
    "structuralSignature": [
      "conj",
      "unless",
      "no_redundant_negation"
    ],
    "incorrectPattern": "Unless the server does not fail",
    "correctPattern": "Unless the server fails",
    "explanationZhHant": "unless 本身已表示「如果不」，一般不再加入否定詞。unless it fails 即「除非它發生故障」。只有在刻意表達另一層否定意思時才可能保留 not。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "CONJ_WHEREAS_DIRECT_FINITE_CLAUSE",
    "category": "conjunction",
    "titleZhHant": "文法規則：CONJ WHEREAS DIRECT_FINITE_CLAUSE",
    "formula": "CONJ.WHEREAS.DIRECT_FINITE_CLAUSE",
    "structuralSignature": [
      "conj",
      "whereas",
      "direct_finite_clause"
    ],
    "incorrectPattern": "whereas that prevention",
    "correctPattern": "whereas prevention",
    "explanationZhHant": "whereas 本身是連接詞，後面直接接主語 + 動詞，不再加入 that。公式：分句 A, whereas 分句 B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_ADVICE_UNCOUNTABLE_SOME",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT ADVICE UNCOUNTABLE SOME",
    "formula": "COUNT.ADVICE.UNCOUNTABLE.SOME",
    "structuralSignature": [
      "count",
      "advice",
      "uncountable",
      "some"
    ],
    "incorrectPattern": "an",
    "correctPattern": "some",
    "explanationZhHant": "advice 是不可數名詞，不能直接配合 an。可寫 some advice、a piece of advice 或直接 advice。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_BICYCLE_PARKING_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT BICYCLE_PARKING UNCOUNTABLE",
    "formula": "COUNT.BICYCLE_PARKING.UNCOUNTABLE",
    "structuralSignature": [
      "count",
      "bicycle_parking",
      "uncountable"
    ],
    "incorrectPattern": "parkings",
    "correctPattern": "parking",
    "explanationZhHant": "parking 表示泊車設施整體時不可數。要計算可寫 bicycle parking spaces 或 bicycle racks。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_EVIDENCE_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT EVIDENCE UNCOUNTABLE",
    "formula": "COUNT.EVIDENCE.UNCOUNTABLE",
    "structuralSignature": [
      "count",
      "evidence",
      "uncountable"
    ],
    "incorrectPattern": "some of the evidences were",
    "correctPattern": "some of the evidence was",
    "explanationZhHant": "evidence 表示證據整體時通常不可數，使用 some evidence 和單數動詞。要計算可寫 pieces of evidence。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_FARMLAND_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT FARMLAND UNCOUNTABLE",
    "formula": "COUNT.FARMLAND.UNCOUNTABLE",
    "structuralSignature": [
      "count",
      "farmland",
      "uncountable"
    ],
    "incorrectPattern": "farmlands",
    "correctPattern": "farmland",
    "explanationZhHant": "farmland 表示農地整體時通常不可數。要表示多塊土地，可寫 areas of farmland 或 fields。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_FEEDBACK_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT FEEDBACK UNCOUNTABLE",
    "formula": "COUNT.FEEDBACK.UNCOUNTABLE",
    "structuralSignature": [
      "count",
      "feedback",
      "uncountable"
    ],
    "incorrectPattern": "feedbacks",
    "correctPattern": "feedback",
    "explanationZhHant": "feedback 表示意見或回饋時通常是不可數名詞。可寫 some feedback、 comments 或 pieces of feedback，一般不寫 feedbacks。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_FEWER_PLURAL_COUNT_NOUN",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT FEWER PLURAL_COUNT_NOUN",
    "formula": "COUNT.FEWER.PLURAL_COUNT_NOUN",
    "structuralSignature": [
      "count",
      "fewer",
      "plural_count_noun"
    ],
    "incorrectPattern": "less",
    "correctPattern": "fewer",
    "explanationZhHant": "buses 是可數名詞複數，表示數量較少用 fewer， 不用 less。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_NUMBER_OF_PLURAL_COUNT_NOUN",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT NUMBER_OF PLURAL_COUNT_NOUN",
    "formula": "COUNT.NUMBER_OF.PLURAL_COUNT_NOUN",
    "structuralSignature": [
      "count",
      "number_of",
      "plural_count_noun"
    ],
    "incorrectPattern": "amount of volunteers",
    "correctPattern": "number of volunteers",
    "explanationZhHant": "volunteers 是可數名詞複數，所以表示數量時使用 number of。公式： number of + 複數可數名詞；amount of + 不可數名詞。正確對照：the amount of equipment。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_PARKING_CAR_PARK",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT PARKING CAR_PARK",
    "formula": "COUNT.PARKING.CAR_PARK",
    "structuralSignature": [
      "count",
      "parking",
      "car_park"
    ],
    "incorrectPattern": "A parking",
    "correctPattern": "A car park",
    "explanationZhHant": "parking 表示泊車活動或泊車空間整體時通常不可數。圖上的一個獨立設施應寫 a car park 或 a parking area。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_PUBLIC_TRANSPORT_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT PUBLIC_TRANSPORT UNCOUNTABLE",
    "formula": "COUNT.PUBLIC_TRANSPORT.UNCOUNTABLE",
    "structuralSignature": [
      "count",
      "public_transport",
      "uncountable"
    ],
    "incorrectPattern": "transports",
    "correctPattern": "transport",
    "explanationZhHant": "public transport 表示公共交通系統整體時不可數。要計算可寫 forms of public transport。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "COUNT_TRUST_ABSTRACT_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：COUNT TRUST ABSTRACT_UNCOUNTABLE",
    "formula": "COUNT.TRUST.ABSTRACT_UNCOUNTABLE",
    "structuralSignature": [
      "count",
      "trust",
      "abstract_uncountable"
    ],
    "incorrectPattern": "trusts",
    "correctPattern": "trust",
    "explanationZhHant": "trust 表示抽象的信任時通常是不可數名詞，所以寫 aloss of trust。 trusts 可以指法律上的信託安排，但不是本句的意思。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DEGREE_MUCH_TOO_ADJECTIVE",
    "category": "comparison",
    "titleZhHant": "文法規則：DEGREE MUCH_TOO ADJECTIVE",
    "formula": "DEGREE.MUCH_TOO.ADJECTIVE",
    "structuralSignature": [
      "degree",
      "much_too",
      "adjective"
    ],
    "incorrectPattern": "too much expensive",
    "correctPattern": "much too expensive",
    "explanationZhHant": "too 修飾形容詞 expensive； much 再加強 too，所以詞序是 much too + 形容詞。too much 則通常修飾不可數名詞，例如 too much money。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DEGREE_SO_ADJECTIVE_THAT",
    "category": "comparison",
    "titleZhHant": "文法規則：DEGREE SO_ADJECTIVE THAT",
    "formula": "DEGREE.SO_ADJECTIVE.THAT",
    "structuralSignature": [
      "degree",
      "so_adjective",
      "that"
    ],
    "incorrectPattern": "such practical that",
    "correctPattern": "so practical that",
    "explanationZhHant": "practical 是沒有名詞跟隨的形容詞，所以使用 so practical that。公式：so + 形容詞／副詞 + that。對照：such a practical demonstration that，其中 such 後面有名詞詞組。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_ALL_OF_OBJECT_PRONOUN",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER ALL_OF OBJECT_PRONOUN",
    "formula": "DETERMINER.ALL_OF.OBJECT_PRONOUN",
    "structuralSignature": [
      "determiner",
      "all_of",
      "object_pronoun"
    ],
    "incorrectPattern": "all them",
    "correctPattern": "all of them",
    "explanationZhHant": "all 放在賓格代名詞前時需要 of： all of them。在主語位置也可寫 They all received cards。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_ANY_IN_NEGATIVE_CLAUSE",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER ANY IN_NEGATIVE_CLAUSE",
    "formula": "DETERMINER.ANY.IN_NEGATIVE_CLAUSE",
    "structuralSignature": [
      "determiner",
      "any",
      "in_negative_clause"
    ],
    "incorrectPattern": "did not have some cash",
    "correctPattern": "did not have any cash",
    "explanationZhHant": "一般否定句通常用 any：not have any cash。 some 可出現在預期肯定答案的問句、提議或強調語境中。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_BOTH_BANKS_OF_RIVER",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER BOTH_BANKS_OF_RIVER",
    "formula": "DETERMINER.BOTH_BANKS_OF_RIVER",
    "structuralSignature": [
      "determiner",
      "both_banks_of_river"
    ],
    "incorrectPattern": "both river banks",
    "correctPattern": "both banks of the river",
    "explanationZhHant": "both river banks 並非一定錯，但 both banks of the river 更清楚地表示同一條河的兩岸。本規則應先作 suggestio n-only，避免攻擊正確複合名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_EACH_OF_THE_PLURAL",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER EACH_OF THE_PLURAL",
    "formula": "DETERMINER.EACH_OF.THE_PLURAL",
    "structuralSignature": [
      "determiner",
      "each_of",
      "the_plural"
    ],
    "incorrectPattern": "Each of students",
    "correctPattern": "Each of the students",
    "explanationZhHant": "each of 後面通常接代名詞或帶限定詞的複數名詞： each of them、 each of the students。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_EITHER_SIDE_OF_TWO",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER EITHER_SIDE OF_TWO",
    "formula": "DETERMINER.EITHER_SIDE.OF_TWO",
    "structuralSignature": [
      "determiner",
      "either_side",
      "of_two"
    ],
    "incorrectPattern": "from every side of the bridge",
    "correctPattern": "from either side of the bridge",
    "explanationZhHant": "橋只有兩邊，因此指其中任何一邊時用 either side。 every 通常用於三個或以上可逐一計算的項目。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_MOST_GENERIC_NO_OF",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER MOST GENERIC_NO_OF",
    "formula": "DETERMINER.MOST.GENERIC_NO_OF",
    "structuralSignature": [
      "determiner",
      "most",
      "generic_no_of"
    ],
    "incorrectPattern": "of residents",
    "correctPattern": "residents",
    "explanationZhHant": "泛指大部分居民，用 most residents。指某一群已界定居民時才寫 most of the residents。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_MOST_GENERIC_PLURAL_NO_OF",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER MOST GENERIC_PLURAL_NO_OF",
    "formula": "DETERMINER.MOST.GENERIC_PLURAL_NO_OF",
    "structuralSignature": [
      "determiner",
      "most",
      "generic_plural_no_of"
    ],
    "incorrectPattern": "Most of students",
    "correctPattern": "Most students",
    "explanationZhHant": "泛指大部分學生時，用 most + 複數名詞，不加 of：most students。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_MOST_OF_SPECIFIC_GROUP",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER MOST_OF SPECIFIC_GROUP",
    "formula": "DETERMINER.MOST_OF.SPECIFIC_GROUP",
    "structuralSignature": [
      "determiner",
      "most_of",
      "specific_group"
    ],
    "incorrectPattern": "most of students interviewed",
    "correctPattern": "most of the students interviewed",
    "explanationZhHant": "指已接受訪問的特定學生群體時，用 most of the + 複數名詞。公式：most students 泛指； most of the students 指特定群體。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_OPEN_SET_ANOTHER",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER OPEN_SET ANOTHER",
    "formula": "DETERMINER.OPEN_SET.ANOTHER",
    "structuralSignature": [
      "determiner",
      "open_set",
      "another"
    ],
    "incorrectPattern": "the other came",
    "correctPattern": "another came",
    "explanationZhHant": "本句只列出其中兩名訪問學者，但並未表示總共只有兩名，因此用 another 表示另有一人。若全組確實只有兩人，the other 才正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_OTHER_BEFORE_PLURAL_NOUN",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER OTHER BEFORE_PLURAL_NOUN",
    "formula": "DETERMINER.OTHER.BEFORE_PLURAL_NOUN",
    "structuralSignature": [
      "determiner",
      "other",
      "before_plural_noun"
    ],
    "incorrectPattern": "others participants",
    "correctPattern": "other participants",
    "explanationZhHant": "other 可直接放在複數名詞前作限定詞；others 是代名詞，後面不再接名詞。公式： other + 複數名詞。對照： The others promised to return。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_POSSESSIVE_REQUIRES_NOUN",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER POSSESSIVE REQUIRES_NOUN",
    "formula": "DETERMINER.POSSESSIVE.REQUIRES_NOUN",
    "structuralSignature": [
      "determiner",
      "possessive",
      "requires_noun"
    ],
    "incorrectPattern": "what their think",
    "correctPattern": "what their friends think",
    "explanationZhHant": "their 是所有格限定詞，後面必須有名詞。根據前面的 friendships，目標句補上 friends。也可寫 what others think。 由於所指人物需靠上文推斷，建議老師確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "DETERMINER_TWO_ITEMS_THE_OTHER",
    "category": "article_or_determiner",
    "titleZhHant": "文法規則：DETERMINER TWO_ITEMS THE_OTHER",
    "formula": "DETERMINER.TWO_ITEMS.THE_OTHER",
    "structuralSignature": [
      "determiner",
      "two_items",
      "the_other"
    ],
    "incorrectPattern": "another",
    "correctPattern": "the other",
    "explanationZhHant": "已明確只有兩間房，提到其中一間後，餘下的特定一間使用 the other。 another 通常表示同類中另一個，但不一定是最後剩下的一個。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "FIXED_FOR_EXAMPLE_SINGULAR",
    "category": "preposition",
    "titleZhHant": "文法規則：FIXED FOR_EXAMPLE SINGULAR",
    "formula": "FIXED.FOR_EXAMPLE.SINGULAR",
    "structuralSignature": [
      "fixed",
      "for_example",
      "singular"
    ],
    "incorrectPattern": "For examples",
    "correctPattern": "For example",
    "explanationZhHant": "引出一個或一組例子時，固定連接語是 For example。 examples 可用在普通名詞結構，如 These are useful examp les.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "INFINITIVE_NEED_PASSIVE_TO_BE_PARTICIPLE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：INFINITIVE NEED PASSIVE TO_BE_PARTICIPLE",
    "formula": "INFINITIVE.NEED.PASSIVE.TO_BE_PARTICIPLE",
    "structuralSignature": [
      "infinitive",
      "need",
      "passive",
      "to_be_participle"
    ],
    "incorrectPattern": "records need to digitise",
    "correctPattern": "records need to be digitised",
    "explanationZhHant": "records 是被數碼化的事物，所以要用被動不定詞： need to be + 過去分詞。另一個正確寫法是 The staff need to digitise the records.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "LEXICAL_UNIFORM_POLICY_COMPANY_CONTEXT",
    "category": "word_choice",
    "titleZhHant": "文法規則：LEXICAL UNIFORM_POLICY COMPANY_CONTEXT",
    "formula": "LEXICAL.UNIFORM_POLICY.COMPANY_CONTEXT",
    "structuralSignature": [
      "lexical",
      "uniform_policy",
      "company_context"
    ],
    "incorrectPattern": "for example",
    "correctPattern": "policy; for example,",
    "explanationZhHant": "公司不是「穿上一件校服」，而是實施制服政策，因此按上下文補成 a uniform policy。 前後是兩個獨立內容單位，所以用分號；for example 後面加逗號。若原意真的是公司擁有一件制服，則不應加入 policy。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "LINKER_BY_CONTRAST",
    "category": "conjunction",
    "titleZhHant": "文法規則：LINKER BY_CONTRAST",
    "formula": "LINKER.BY_CONTRAST",
    "structuralSignature": [
      "linker",
      "by_contrast"
    ],
    "incorrectPattern": "in contrary",
    "correctPattern": "by contrast",
    "explanationZhHant": "表示兩組數據形成對比，可用句首連接語 by contrast 或 in contrast。on the contrary 通常用來直接否定前述看法。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "LINKER_FINALLY_NOT_AT_THE_END",
    "category": "conjunction",
    "titleZhHant": "文法規則：LINKER FINALLY NOT_AT_THE_END",
    "formula": "LINKER.FINALLY.NOT_AT_THE_END",
    "structuralSignature": [
      "linker",
      "finally",
      "not_at_the_end"
    ],
    "incorrectPattern": "At the end",
    "correctPattern": "Finally",
    "explanationZhHant": "finally 可作篇章連接語，引出最後一項變化。at the end 通常需要說明甚麼的末端，例如 at the end of the road。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "LINKING_REMAIN_ADJECTIVE_COMPLEMENTS",
    "category": "conjunction",
    "titleZhHant": "文法規則：LINKING REMAIN ADJECTIVE_COMPLEMENTS",
    "formula": "LINKING.REMAIN.ADJECTIVE_COMPLEMENTS",
    "structuralSignature": [
      "linking",
      "remain",
      "adjective_complements"
    ],
    "incorrectPattern": "remain healthily, productivity, and independently",
    "correctPattern": "remain healthy, productive, and independent",
    "explanationZhHant": "remain 是連繫動詞，後面使用形容詞描述 citizens 的狀態。三項亦要保持平行： healthy, productive, and independent。副詞通常修飾動作，而不是在這裡描述主語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "LINKING_REMAIN_ADJECTIVE_NO_AS",
    "category": "conjunction",
    "titleZhHant": "文法規則：LINKING REMAIN ADJECTIVE NO_AS",
    "formula": "LINKING.REMAIN.ADJECTIVE.NO_AS",
    "structuralSignature": [
      "linking",
      "remain",
      "adjective",
      "no_as"
    ],
    "incorrectPattern": "as unchanged",
    "correctPattern": "unchanged",
    "explanationZhHant": "remain 是連繫動詞，後面直接接形容詞補語 unchanged，不用 as。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_ACCESS_VIA_FOOTBRIDGE",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP ACCESS VIA_FOOTBRIDGE",
    "formula": "MAP.ACCESS.VIA_FOOTBRIDGE",
    "structuralSignature": [
      "map",
      "access",
      "via_footbridge"
    ],
    "incorrectPattern": "through a narrow walking bridge",
    "correctPattern": "via a narrow footbridge",
    "explanationZhHant": "表示到達某地所經由的設施，可用 via。專供行人使用的小橋通常稱為 footbridge。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_BUILD_ON_FORMER_SITE",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP BUILD ON_FORMER_SITE",
    "formula": "MAP.BUILD.ON_FORMER_SITE",
    "structuralSignature": [
      "map",
      "build",
      "on_former_site"
    ],
    "incorrectPattern": "over its previous site",
    "correctPattern": "on its former site",
    "explanationZhHant": "建築物佔用一塊地點時通常用 on a site。 former site 表示先前由另一設施佔用的位置。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_BUS_STOP_NOT_STATION",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP BUS_STOP NOT_STATION",
    "formula": "MAP.BUS_STOP.NOT_STATION",
    "structuralSignature": [
      "map",
      "bus_stop",
      "not_station"
    ],
    "incorrectPattern": "a bus station",
    "correctPattern": "a bus stop",
    "explanationZhHant": "bus stop 是路旁停靠點；bus station 是較大型、有多條路線的總站。必須按地圖符號確認，不能只靠句子猜測。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_CENTRAL_FEATURE_ARTICLE_AND_WORD_FORM",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP CENTRAL_FEATURE ARTICLE_AND_WORD_FORM",
    "formula": "MAP.CENTRAL_FEATURE.ARTICLE_AND_WORD_FORM",
    "structuralSignature": [
      "map",
      "central_feature",
      "article_and_word_form"
    ],
    "incorrectPattern": "Apartment block at centre will",
    "correctPattern": "The central apartment block will",
    "explanationZhHant": "指三座公寓中位於中央的特定一座，用 the central apartment block。 central 是前置形容詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_CORNER_AT_OF",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP CORNER AT_OF",
    "formula": "MAP.CORNER.AT_OF",
    "structuralSignature": [
      "map",
      "corner",
      "at_of"
    ],
    "incorrectPattern": "In the south-east corner from",
    "correctPattern": "At the south-eastern corner of",
    "explanationZhHant": "地圖位置常用 at the... corner of + 地區。前置修飾語使用形容詞 south-eastern。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_DIRECTION_TO_THE_NORTH",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP DIRECTION TO_THE_NORTH",
    "formula": "MAP.DIRECTION.TO_THE_NORTH",
    "structuralSignature": [
      "map",
      "direction",
      "to_the_north"
    ],
    "incorrectPattern": "to north",
    "correctPattern": "to the north",
    "explanationZhHant": "表示擴建方向，可寫 to the north 或 northwards。此結構中的方位名詞需要 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_DISTANCE_WEST_OF",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP DISTANCE WEST_OF",
    "formula": "MAP.DISTANCE.WEST_OF",
    "structuralSignature": [
      "map",
      "distance",
      "west_of"
    ],
    "incorrectPattern": "at the west from its original position",
    "correctPattern": "west of its original position",
    "explanationZhHant": "表示相對位置，用距離 + west of + 地標：200 metres west of...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_ENLARGE_EASTWARDS",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP ENLARGE EASTWARDS",
    "formula": "MAP.ENLARGE.EASTWARDS",
    "structuralSignature": [
      "map",
      "enlarge",
      "eastwards"
    ],
    "incorrectPattern": "expanded to east",
    "correctPattern": "enlarged eastwards",
    "explanationZhHant": "eastwards 是方向副詞，可直接修飾擴建動作。也可寫 expanded to the east，但不能省略 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_EXTEND_TOWARDS",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP EXTEND TOWARDS",
    "formula": "MAP.EXTEND.TOWARDS",
    "structuralSignature": [
      "map",
      "extend",
      "towards"
    ],
    "incorrectPattern": "extended until the railway",
    "correctPattern": "extended towards the railway",
    "explanationZhHant": "表示土地朝某一方向延伸但未必到達終點，用 extend towards。 until 主要表示時間界線。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_IN_THE_PROPOSAL",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP IN_THE_PROPOSAL",
    "formula": "MAP.IN_THE_PROPOSAL",
    "structuralSignature": [
      "map",
      "in_the_proposal"
    ],
    "incorrectPattern": "According to 2035 proposal",
    "correctPattern": "In the 2035 proposal",
    "explanationZhHant": "表示某設施出現在一份規劃方案內， 可寫 in the proposal。若使用 according to， 也必須寫 according to the 2035 proposal。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_JUNCTION_AT_OF_AND",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP JUNCTION AT_OF_AND",
    "formula": "MAP.JUNCTION.AT_OF_AND",
    "structuralSignature": [
      "map",
      "junction",
      "at_of_and"
    ],
    "incorrectPattern": "on the cross of the bypass with Station Road",
    "correctPattern": "at the junction of the bypass and Station Road",
    "explanationZhHant": "道路交會點使用 at the junction of A and B。cross 通常是動詞；名詞可用 crossroads，但結構不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_LOCATION_AT_EASTERN_END_OF",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP LOCATION AT_EASTERN_END_OF",
    "formula": "MAP.LOCATION.AT_EASTERN_END_OF",
    "structuralSignature": [
      "map",
      "location",
      "at_eastern_end_of"
    ],
    "incorrectPattern": "on the east end in the district",
    "correctPattern": "at the eastern end of the district",
    "explanationZhHant": "固定位置框架是 at the eastern end of + 地區／道路。 eastern 是放在名詞前的形容詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_LOCATION_SOUTH_OF_NO_AT",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP LOCATION SOUTH_OF NO_AT",
    "formula": "MAP.LOCATION.SOUTH_OF.NO_AT",
    "structuralSignature": [
      "map",
      "location",
      "south_of",
      "no_at"
    ],
    "incorrectPattern": "At south of the river",
    "correctPattern": "South of the river",
    "explanationZhHant": "south of + 地標本身已是位置介詞結構，不在前面加 at。若指區域內部，可寫 in the south of the district。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_OPPOSITE_DIRECT_OBJECT",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP OPPOSITE DIRECT_OBJECT",
    "formula": "MAP.OPPOSITE.DIRECT_OBJECT",
    "structuralSignature": [
      "map",
      "opposite",
      "direct_object"
    ],
    "incorrectPattern": "opposite of a small park",
    "correctPattern": "opposite a small park",
    "explanationZhHant": "opposite 作介詞時可直接接名詞：opposite the park。 opposite to 在部分英式用法中亦可能成立，但不寫 opposite of。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_OPPOSITE_NO_WITH",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP OPPOSITE NO_WITH",
    "formula": "MAP.OPPOSITE.NO_WITH",
    "structuralSignature": [
      "map",
      "opposite",
      "no_with"
    ],
    "incorrectPattern": "opposite with the park entrance",
    "correctPattern": "opposite the park entrance",
    "explanationZhHant": "opposite 作介詞時直接接地標，不使用 with。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_OUTSIDE_BOUNDARY",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP OUTSIDE_BOUNDARY",
    "formula": "MAP.OUTSIDE_BOUNDARY",
    "structuralSignature": [
      "map",
      "outside_boundary"
    ],
    "incorrectPattern": "out of the district border",
    "correctPattern": "outside the district boundary",
    "explanationZhHant": "表示位於區域邊界之外，通常用 outside + 地區／ boundary。 out of 多表示從內部移出。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_PLOTS_FOR_HOUSES_HOUSING_COUNTABILITY",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP PLOTS_FOR_HOUSES HOUSING_COUNTABILITY",
    "formula": "MAP.PLOTS_FOR_HOUSES.HOUSING_COUNTABILITY",
    "structuralSignature": [
      "map",
      "plots_for_houses",
      "housing_countability"
    ],
    "incorrectPattern": "of detached housings",
    "correctPattern": "for detached houses",
    "explanationZhHant": "housing 通常不可數，表示房屋供應整體；可逐一計算的建築物是 houses。土地預留給某種建築，用 plots for...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_PURPOSE_CREATE_VIEWING_AREA",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP PURPOSE CREATE_VIEWING_AREA",
    "formula": "MAP.PURPOSE.CREATE_VIEWING_AREA",
    "structuralSignature": [
      "map",
      "purpose",
      "create_viewing_area"
    ],
    "incorrectPattern": "for creating a viewing place",
    "correctPattern": "to create a viewing area",
    "explanationZhHant": "具體工程目的用 to create。地圖設施通常稱為 viewing area、 viewing platform 或 observation area。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MAP_ROUTE_RUN_FROM_TO",
    "category": "word_choice",
    "titleZhHant": "文法規則：MAP ROUTE RUN FROM_TO",
    "formula": "MAP.ROUTE.RUN.FROM_TO",
    "structuralSignature": [
      "map",
      "route",
      "run",
      "from_to"
    ],
    "incorrectPattern": "went from west towards east",
    "correctPattern": "ran from west to east",
    "explanationZhHant": "描述道路的走向通常用 run from A to B。 go towards 可描述移動方向，但較不適合靜態地圖中的道路位置。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MEASURE_MOVE_DISTANCE_NO_FOR",
    "category": "word_choice",
    "titleZhHant": "文法規則：MEASURE MOVE DISTANCE NO_FOR",
    "formula": "MEASURE.MOVE.DISTANCE.NO_FOR",
    "structuralSignature": [
      "measure",
      "move",
      "distance",
      "no_for"
    ],
    "incorrectPattern": "moved for about 200 metres",
    "correctPattern": "relocated about 200 metres",
    "explanationZhHant": "距離可直接放在移動動詞後：moved 200 metres。 for 通常引出持續時間，不引出這種空間距離。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MODAL_HAD_BETTER_BASE_VERB",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MODAL HAD_BETTER BASE_VERB",
    "formula": "MODAL.HAD_BETTER.BASE_VERB",
    "structuralSignature": [
      "modal",
      "had_better",
      "base_verb"
    ],
    "incorrectPattern": "had better to confirm",
    "correctPattern": "had better confirm",
    "explanationZhHant": "had better 後面直接使用動詞原形，不加 to。公式： had better + 動詞原形。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MODAL_NEEDNT_HAVE_PAST_PARTICIPLE",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MODAL NEEDNT_HAVE PAST_PARTICIPLE",
    "formula": "MODAL.NEEDNT_HAVE.PAST_PARTICIPLE",
    "structuralSignature": [
      "modal",
      "neednt_have",
      "past_participle"
    ],
    "incorrectPattern": "needn't stayed",
    "correctPattern": "needn't have stayed",
    "explanationZhHant": "表示某人實際做了某件事，但事後發現沒有必要，用 needn't have + 過去分詞。 didn't need to stay 可能表示根本沒有留下，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MODAL_NEGATION_SINGLE_AUXILIARY_BASE_VERB",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MODAL NEGATION SINGLE_AUXILIARY BASE_VERB",
    "formula": "MODAL.NEGATION.SINGLE_AUXILIARY.BASE_VERB",
    "structuralSignature": [
      "modal",
      "negation",
      "single_auxiliary",
      "base_verb"
    ],
    "incorrectPattern": "can doesn’t required",
    "correctPattern": "can reduce",
    "explanationZhHant": "一個動詞組不能同時使用 can 和 doesn't 來控制同一個主要動詞；can 後面亦只能接動詞原形。按上下文，作者想表達制服可減少開支，因此改為 can reduce。 若原意是「不需要另外購買衣服」，另一個正確寫法是 means that staff do not need a separate work wardrobe。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MODAL_PASSIVE_BE_PARTICIPLE",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MODAL PASSIVE BE_PARTICIPLE",
    "formula": "MODAL.PASSIVE.BE_PARTICIPLE",
    "structuralSignature": [
      "modal",
      "passive",
      "be_participle"
    ],
    "incorrectPattern": "conditions can stop",
    "correctPattern": "conditions can be stopped",
    "explanationZhHant": "conditions 是被阻止發展成危機的事物，所以要用被動語態。情態動詞後的被動結構是 can + be + 過去分詞。The bleeding can stop 中的 stop 則是不及物用法，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MODAL_PERFECT_PASSIVE_HAVE_BEEN_PARTICIPLE",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MODAL PERFECT_PASSIVE HAVE_BEEN_PARTICIPLE",
    "formula": "MODAL.PERFECT_PASSIVE.HAVE_BEEN_PARTICIPLE",
    "structuralSignature": [
      "modal",
      "perfect_passive",
      "have_been_participle"
    ],
    "incorrectPattern": "might have avoided",
    "correctPattern": "might have been avoided",
    "explanationZhHant": "treatment 是「本來可能被避免」的事物，所以用完成式被動語態：might have been + 過去分詞。 The hospital might have avoided the expense 才是主動結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MOOD_HIGH_TIME_PAST",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MOOD HIGH_TIME PAST",
    "formula": "MOOD.HIGH_TIME.PAST",
    "structuralSignature": [
      "mood",
      "high_time",
      "past"
    ],
    "incorrectPattern": "provides",
    "correctPattern": "provided",
    "explanationZhHant": "It is high time + 主語 + 過去式表示某事早就應該發生。這個過去式表達的是現在的迫切需要，不是過去時間。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MOOD_IF_ONLY_PAST_REGRET_PAST_PERFECT",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MOOD IF_ONLY PAST_REGRET PAST_PERFECT",
    "formula": "MOOD.IF_ONLY.PAST_REGRET.PAST_PERFECT",
    "structuralSignature": [
      "mood",
      "if_only",
      "past_regret",
      "past_perfect"
    ],
    "incorrectPattern": "If only the finance team released",
    "correctPattern": "If only the finance team had released",
    "explanationZhHant": "If only 表示對過去事實的遺憾時，使用過去完成式。結果分句的 would not have been delayed 亦顯示這是過去反事實情況。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MOOD_WISH_PAST_REGRET_PAST_PERFECT",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MOOD WISH PAST_REGRET PAST_PERFECT",
    "formula": "MOOD.WISH.PAST_REGRET.PAST_PERFECT",
    "structuralSignature": [
      "mood",
      "wish",
      "past_regret",
      "past_perfect"
    ],
    "incorrectPattern": "it",
    "correctPattern": "it had",
    "explanationZhHant": "對已經沒有發生的過去事情表示遺憾，用 wish + 主語 + had + 過去分詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "MOOD_WOULD_RATHER_DIFFERENT_SUBJECT_PAST",
    "category": "modal_or_auxiliary",
    "titleZhHant": "文法規則：MOOD WOULD_RATHER DIFFERENT_SUBJECT PAST",
    "formula": "MOOD.WOULD_RATHER.DIFFERENT_SUBJECT.PAST",
    "structuralSignature": [
      "mood",
      "would_rather",
      "different_subject",
      "past"
    ],
    "incorrectPattern": "would rather the council publishes",
    "correctPattern": "would rather the council published",
    "explanationZhHant": "would rather 後面若有另一個主語，對現在或將來的期望通常用過去式： would rather + 人／機構 + 過去式。邊界：同一主語時用動詞原形，例如 Residents would rather publish the reports。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NEGATION_NOBODY_NO_DOUBLE_NEGATIVE",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：NEGATION NOBODY NO_DOUBLE_NEGATIVE",
    "formula": "NEGATION.NOBODY.NO_DOUBLE_NEGATIVE",
    "structuralSignature": [
      "negation",
      "nobody",
      "no_double_negative"
    ],
    "incorrectPattern": "Nobody did not answer",
    "correctPattern": "Nobody answered",
    "explanationZhHant": "標準英文中， nobody 已帶否定意思，不再加入 not。但雙重否定有時可能被理解為「不是沒有人回答」，所以系統應先確認作者是否真正想表達無人回答。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_ENVIRONMENT",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN ATTRIBUTIVE SINGULAR SCHOOL_ENVIRONMENT",
    "formula": "NOUN.ATTRIBUTIVE.SINGULAR.SCHOOL_ENVIRONMENT",
    "structuralSignature": [
      "noun",
      "attributive",
      "singular",
      "school_environment"
    ],
    "incorrectPattern": "schools environment",
    "correctPattern": "school environment",
    "explanationZhHant": "普通名詞放在另一名詞前作修飾語時，通常使用單數，所以是 school environment。複數形式只在少數固定或詞彙化組合中保留。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_UNIFORM",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN ATTRIBUTIVE SINGULAR SCHOOL_UNIFORM",
    "formula": "NOUN.ATTRIBUTIVE.SINGULAR.SCHOOL_UNIFORM",
    "structuralSignature": [
      "noun",
      "attributive",
      "singular",
      "school_uniform"
    ],
    "incorrectPattern": "schools uniforms",
    "correctPattern": "school uniforms",
    "explanationZhHant": "school 在 school uniforms 中作名詞修飾語，通常使用單數。這不代表只有一間學校或一件校服。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_A_SINGULAR_COUNT_NOUN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN A SINGULAR_COUNT_NOUN",
    "formula": "NOUN.A.SINGULAR_COUNT_NOUN",
    "structuralSignature": [
      "noun",
      "a",
      "singular_count_noun"
    ],
    "incorrectPattern": "dimensions",
    "correctPattern": "dimension",
    "explanationZhHant": "a 後面要接單數可數名詞，所以寫 a further dimension。若使用複數，則要刪除 a： further dimensions。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_BOTH_PLURAL_COUNT_NOUN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN BOTH PLURAL_COUNT_NOUN",
    "formula": "NOUN.BOTH.PLURAL_COUNT_NOUN",
    "structuralSignature": [
      "noun",
      "both",
      "plural_count_noun"
    ],
    "incorrectPattern": "country",
    "correctPattern": "countries",
    "explanationZhHant": "both 表示兩者，後面接複數可數名詞，所以寫 both countries。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_CHART_PROPORTION_OF_ELDERLY_RESIDENTS",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN CHART PROPORTION_OF_ELDERLY_RESIDENTS",
    "formula": "NOUN.CHART.PROPORTION_OF_ELDERLY_RESIDENTS",
    "structuralSignature": [
      "noun",
      "chart",
      "proportion_of_elderly_residents"
    ],
    "incorrectPattern": "The elderly group",
    "correctPattern": "The proportion of elderly residents",
    "explanationZhHant": "百分比由 24.1% 變成 42.3%， 真正變化的是長者所佔的比例，而不是長者這個群體本身「加倍」。原寫法可理解，但目標寫法在統計上更精確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_COMPOUND_NUMERAL_SINGULAR_HYPHEN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN COMPOUND NUMERAL SINGULAR_HYPHEN",
    "formula": "NOUN.COMPOUND.NUMERAL.SINGULAR_HYPHEN",
    "structuralSignature": [
      "noun",
      "compound",
      "numeral",
      "singular_hyphen"
    ],
    "incorrectPattern": "a two-lanes road",
    "correctPattern": "a two-lane road",
    "explanationZhHant": "數字和量度單位共同放在名詞前作修飾語時，單位用單數並加連字號：a two-lane road。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_COUNTRY_POPULATION_POSSESSIVE",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN COUNTRY_POPULATION POSSESSIVE",
    "formula": "NOUN.COUNTRY_POPULATION.POSSESSIVE",
    "structuralSignature": [
      "noun",
      "country_population",
      "possessive"
    ],
    "incorrectPattern": "Yemen residents",
    "correctPattern": "Yemen's population",
    "explanationZhHant": "比較國家的人口結構時，可用 country's population。Yemen residents 缺乏標準的國籍形容詞或所有格形式。其他正確寫法包括 Yemeni residents 和 the residents of Yemen。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_DECREASE_OF_AMOUNT",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN DECREASE OF_AMOUNT",
    "formula": "NOUN.DECREASE.OF_AMOUNT",
    "structuralSignature": [
      "noun",
      "decrease",
      "of_amount"
    ],
    "incorrectPattern": "by",
    "correctPattern": "of",
    "explanationZhHant": "名詞 decrease 用 of 表示減少幅度。動詞才寫 decreased by 25。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_DIFFERENCE_BETWEEN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN DIFFERENCE BETWEEN",
    "formula": "NOUN.DIFFERENCE.BETWEEN",
    "structuralSignature": [
      "noun",
      "difference",
      "between"
    ],
    "incorrectPattern": "The difference of",
    "correctPattern": "The difference between",
    "explanationZhHant": "比較兩項事物之間的差別，用 the difference between A and B。a difference of 2 MWh 則表示差額大小。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_DISTRIBUTIVE_POSSESSIVE_PLURAL_LIVES",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN DISTRIBUTIVE POSSESSIVE_PLURAL LIVES",
    "formula": "NOUN.DISTRIBUTIVE.POSSESSIVE_PLURAL.LIVES",
    "structuralSignature": [
      "noun",
      "distributive",
      "possessive_plural",
      "lives"
    ],
    "incorrectPattern": "our life",
    "correctPattern": "our lives",
    "explanationZhHant": "our 指多個人的生活，這裡通常用複數 our lives。 在把眾人的生活視為一個整體概念時，our life asa community 也可能成立，但本句是一般個人生活。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_EACH_SINGULAR_COUNT_NOUN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN EACH SINGULAR_COUNT_NOUN",
    "formula": "NOUN.EACH.SINGULAR_COUNT_NOUN",
    "structuralSignature": [
      "noun",
      "each",
      "singular_count_noun"
    ],
    "incorrectPattern": "volunteers",
    "correctPattern": "volunteer",
    "explanationZhHant": "each 後面接單數可數名詞，所以寫 each volunteer，不用 volunteers。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_EVERY_SINGULAR_COUNT_NOUN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN EVERY SINGULAR_COUNT_NOUN",
    "formula": "NOUN.EVERY.SINGULAR_COUNT_NOUN",
    "structuralSignature": [
      "noun",
      "every",
      "singular_count_noun"
    ],
    "incorrectPattern": "every years",
    "correctPattern": "every year",
    "explanationZhHant": "every 後面接單數可數名詞，所以寫 every year。 比較： all years、 many years。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_EVIDENCE_OF_EVENT",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN EVIDENCE OF_EVENT",
    "formula": "NOUN.EVIDENCE.OF_EVENT",
    "structuralSignature": [
      "noun",
      "evidence",
      "of_event"
    ],
    "incorrectPattern": "evidence for an emergency",
    "correctPattern": "evidence of an emergency",
    "explanationZhHant": "表示證明某件事存在或發生，用 evidence of + 事情。 evidence fora theory 可表示支持某理論的證據，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_EXPENSES_FOR_WORK_WARDROBE",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN EXPENSES FOR_WORK_WARDROBE",
    "formula": "NOUN.EXPENSES.FOR_WORK_WARDROBE",
    "structuralSignature": [
      "noun",
      "expenses",
      "for_work_wardrobe"
    ],
    "incorrectPattern": "a work wardrobe expenses",
    "correctPattern": "expenses for a work wardrobe",
    "explanationZhHant": "expenses 是複數名詞，前面不能使用單數冠詞 a。表示某項用途所需的開支，可寫 expenses for + 名詞詞組，所以是 expenses for awork wardrobe。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_FACT_THAT_CLAUSE_NO_OF",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN FACT THAT_CLAUSE NO_OF",
    "formula": "NOUN.FACT.THAT_CLAUSE.NO_OF",
    "structuralSignature": [
      "noun",
      "fact",
      "that_clause",
      "no_of"
    ],
    "incorrectPattern": "the fact of that",
    "correctPattern": "the fact that",
    "explanationZhHant": "名詞 fact 後面直接由 that 引出同位內容分句，不加入 of。 the fact of the matter 則是另一個名詞結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_FIGURE_FOR_CATEGORY",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN FIGURE FOR_CATEGORY",
    "formula": "NOUN.FIGURE.FOR_CATEGORY",
    "structuralSignature": [
      "noun",
      "figure",
      "for_category"
    ],
    "incorrectPattern": "the figure of Northland",
    "correctPattern": "the figure for Northland",
    "explanationZhHant": "圖表中的某個國家或類別所對應的數字，通常寫 the figure for + 類別。the population of Northland 則可使用 of。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_GAP_BETWEEN_TWO",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN GAP BETWEEN_TWO",
    "formula": "NOUN.GAP.BETWEEN_TWO",
    "structuralSignature": [
      "noun",
      "gap",
      "between_two"
    ],
    "incorrectPattern": "The gap among gas and renewables",
    "correctPattern": "The gap between gas and renewables",
    "explanationZhHant": "只有兩個比較項目時，使用 the gap between A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_GENERIC_CUSTOMER_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN GENERIC_CUSTOMER PLURAL",
    "formula": "NOUN.GENERIC_CUSTOMER.PLURAL",
    "structuralSignature": [
      "noun",
      "generic_customer",
      "plural"
    ],
    "incorrectPattern": "customer",
    "correctPattern": "customers",
    "explanationZhHant": "這裡泛指一般顧客，而不是一位特定顧客，所以使用複數 customers。若只談一位已知顧客，則要寫 the customer 或 a customer。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_GENERIC_PLURAL_MESSAGING_APPS",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN GENERIC PLURAL MESSAGING_APPS",
    "formula": "NOUN.GENERIC.PLURAL.MESSAGING_APPS",
    "structuralSignature": [
      "noun",
      "generic",
      "plural",
      "messaging_apps"
    ],
    "incorrectPattern": "app",
    "correctPattern": "apps",
    "explanationZhHant": "are 要配合複數主語，因此用 messaging apps。若使用單數，則要寫 a messaging app is。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_GENERIC_RELATIONSHIP_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN GENERIC_RELATIONSHIP PLURAL",
    "formula": "NOUN.GENERIC_RELATIONSHIP.PLURAL",
    "structuralSignature": [
      "noun",
      "generic_relationship",
      "plural"
    ],
    "incorrectPattern": "relationship",
    "correctPattern": "relationships",
    "explanationZhHant": "工人可能與多位朋友維持多段關係，因此泛指時使用複數 close relationships。若只談與一位指定朋友的關係，單數才可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_GENERIC_REQUEST_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN GENERIC_REQUEST PLURAL",
    "formula": "NOUN.GENERIC_REQUEST.PLURAL",
    "structuralSignature": [
      "noun",
      "generic_request",
      "plural"
    ],
    "incorrectPattern": "the request",
    "correctPattern": "requests",
    "explanationZhHant": "前文沒有指出某一項特定要求，因此泛指僱主可能提出的各種要求時，用複數 requests。若上下文已有一項明確要求，the request 便可能正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_INCREASE_OF_AMOUNT",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN INCREASE OF_AMOUNT",
    "formula": "NOUN.INCREASE.OF_AMOUNT",
    "structuralSignature": [
      "noun",
      "increase",
      "of_amount"
    ],
    "incorrectPattern": "by",
    "correctPattern": "of",
    "explanationZhHant": "名詞 increase 後面用 of 表示增加幅度：an increase of 0.5。 動詞則寫 increased by 0.5。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_INVARIABLE_SERIES_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN INVARIABLE SERIES PLURAL",
    "formula": "NOUN.INVARIABLE.SERIES.PLURAL",
    "structuralSignature": [
      "noun",
      "invariable",
      "series",
      "plural"
    ],
    "incorrectPattern": "two serieses",
    "correctPattern": "two series",
    "explanationZhHant": "series 的單數和複數形式相同： one series、two series。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_IRREGULAR_ANALYSIS_ANALYSES",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN IRREGULAR ANALYSIS_ANALYSES",
    "formula": "NOUN.IRREGULAR.ANALYSIS_ANALYSES",
    "structuralSignature": [
      "noun",
      "irregular",
      "analysis_analyses"
    ],
    "incorrectPattern": "analysises",
    "correctPattern": "analyses",
    "explanationZhHant": "analysis 的複數是 analyses。不能在完整單數形式後直接加-es。發音也會由單數結尾/sɪs/轉為複數/siːz/。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_IRREGULAR_APPENDIX_APPENDICES",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN IRREGULAR APPENDIX_APPENDICES",
    "formula": "NOUN.IRREGULAR.APPENDIX_APPENDICES",
    "structuralSignature": [
      "noun",
      "irregular",
      "appendix_appendices"
    ],
    "incorrectPattern": "three appendix",
    "correctPattern": "three appendices",
    "explanationZhHant": "appendix 的正式複數常為 appendices。 appendixes 亦可見於部分一般語境，兩者應按語域接受。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_IRREGULAR_CRITERION_CRITERIA_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN IRREGULAR CRITERION_CRITERIA PLURAL",
    "formula": "NOUN.IRREGULAR.CRITERION_CRITERIA.PLURAL",
    "structuralSignature": [
      "noun",
      "irregular",
      "criterion_criteria",
      "plural"
    ],
    "incorrectPattern": "criterias",
    "correctPattern": "criteria",
    "explanationZhHant": "criterion 的複數是 criteria，不寫 criterias。 twenty 後面需要複數形式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_IRREGULAR_CRITERION_CRITERIA_SINGULAR",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN IRREGULAR CRITERION_CRITERIA SINGULAR",
    "formula": "NOUN.IRREGULAR.CRITERION_CRITERIA.SINGULAR",
    "structuralSignature": [
      "noun",
      "irregular",
      "criterion_criteria",
      "singular"
    ],
    "incorrectPattern": "criteria",
    "correctPattern": "criterion",
    "explanationZhHant": "one 後面接單數，所以使用 criterion。 criteria 是複數。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_IRREGULAR_PHENOMENON_SINGULAR",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN IRREGULAR PHENOMENON_SINGULAR",
    "formula": "NOUN.IRREGULAR.PHENOMENON_SINGULAR",
    "structuralSignature": [
      "noun",
      "irregular",
      "phenomenon_singular"
    ],
    "incorrectPattern": "One phenomena",
    "correctPattern": "One phenomenon",
    "explanationZhHant": "phenomenon 是單數， phenomena 是複數。one 後面使用單數。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_MAXIMUM_LIMIT_ON_WORKING_HOURS",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN MAXIMUM_LIMIT ON_WORKING_HOURS",
    "formula": "NOUN.MAXIMUM_LIMIT.ON_WORKING_HOURS",
    "structuralSignature": [
      "noun",
      "maximum_limit",
      "on_working_hours"
    ],
    "incorrectPattern": "limits maximum working hour",
    "correctPattern": "maximum limit on working hours",
    "explanationZhHant": "a 後面要接單數 limit； maximum 放在名詞前；表示對某事設定上限，用 a limit on + 名詞。這裡泛指每週或每日工時，所以用複數 working hours。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_NUMERAL_PLURAL_COUNT_NOUN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN NUMERAL PLURAL_COUNT_NOUN",
    "formula": "NOUN.NUMERAL.PLURAL_COUNT_NOUN",
    "structuralSignature": [
      "noun",
      "numeral",
      "plural_count_noun"
    ],
    "incorrectPattern": "bottle",
    "correctPattern": "bottles",
    "explanationZhHant": "two 後面接複數可數名詞，所以寫 two bottles。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_ONE_OF_SUPERLATIVE_PLURAL_NOUN",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN ONE_OF SUPERLATIVE PLURAL_NOUN",
    "formula": "NOUN.ONE_OF.SUPERLATIVE.PLURAL_NOUN",
    "structuralSignature": [
      "noun",
      "one_of",
      "superlative",
      "plural_noun"
    ],
    "incorrectPattern": "one of the most useful project",
    "correctPattern": "one of the most useful projects",
    "explanationZhHant": "one of 表示「一群之中的一個」，所以 of 後面的可數名詞用複數。公式：one of the + 最高級 + 複數名詞。正確對照： This is the most useful project.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_PEAK_OF_VALUE",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN PEAK OF_VALUE",
    "formula": "NOUN.PEAK.OF_VALUE",
    "structuralSignature": [
      "noun",
      "peak",
      "of_value"
    ],
    "incorrectPattern": "at",
    "correctPattern": "of",
    "explanationZhHant": "名詞結構使用 a peak of + 數值。 動詞結構則使用 peaked at + 數值。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_RECURRING_FAMILY_GATHERING_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN RECURRING_FAMILY_GATHERING PLURAL",
    "formula": "NOUN.RECURRING_FAMILY_GATHERING.PLURAL",
    "structuralSignature": [
      "noun",
      "recurring_family_gathering",
      "plural"
    ],
    "incorrectPattern": "family gathering",
    "correctPattern": "family gatherings",
    "explanationZhHant": "gathering 是單數可數名詞，不能在沒有冠詞或其他限定詞的情況下單獨使用。這裡泛指家庭聚會，所以用複數 family gatherings。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_RECURRING_HOLIDAY_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN RECURRING_HOLIDAY PLURAL",
    "formula": "NOUN.RECURRING_HOLIDAY.PLURAL",
    "structuralSignature": [
      "noun",
      "recurring_holiday",
      "plural"
    ],
    "incorrectPattern": "during holiday",
    "correctPattern": "during holidays",
    "explanationZhHant": "這裡泛指多次假期，而不是某一個特定假期，所以用複數 holidays。若指一個特定假期，可寫 during the holiday。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_REDUCTION_OF_AMOUNT",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN REDUCTION OF_AMOUNT",
    "formula": "NOUN.REDUCTION.OF_AMOUNT",
    "structuralSignature": [
      "noun",
      "reduction",
      "of_amount"
    ],
    "incorrectPattern": "a reduction by 56 per cent",
    "correctPattern": "a reduction of 56 per cent",
    "explanationZhHant": "名詞 reduction 用 of 表示幅度；動詞結構為 was reduced by 56 per cent。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_REDUNDANT_OUTFITS_CLOTHES",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN REDUNDANT OUTFITS_CLOTHES",
    "formula": "NOUN.REDUNDANT.OUTFITS_CLOTHES",
    "structuralSignature": [
      "noun",
      "redundant",
      "outfits_clothes"
    ],
    "incorrectPattern": "outfits clothes",
    "correctPattern": "outfits",
    "explanationZhHant": "outfit 本身已表示一套衣服，不能把 outfits clothes 當作一般名詞組合。可保留 outfits，或改為單獨的 clothes。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_RISE_OF_AMOUNT",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN RISE OF_AMOUNT",
    "formula": "NOUN.RISE.OF_AMOUNT",
    "structuralSignature": [
      "noun",
      "rise",
      "of_amount"
    ],
    "incorrectPattern": "a rise by 1.6 MWh",
    "correctPattern": "a rise of 1.6 MWh",
    "explanationZhHant": "名詞 rise 用 of 表示幅度。動詞才寫 rose by 1.6 MWh。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_SINGLE_OLDER_AGE_GROUP",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN SINGLE_OLDER_AGE_GROUP",
    "formula": "NOUN.SINGLE_OLDER_AGE_GROUP",
    "structuralSignature": [
      "noun",
      "single_older_age_group"
    ],
    "incorrectPattern": "groups,",
    "correctPattern": "age group",
    "explanationZhHant": "根據本段列出的三個年齡組別，Italy 的較年長組別似乎只指 60 歲或以上的一組，因此使用單數 older age group。 若原圖真的把長者細分成多組，複數則可能正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_SOLUTION_TO_PROBLEM",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN SOLUTION TO_PROBLEM",
    "formula": "NOUN.SOLUTION.TO_PROBLEM",
    "structuralSignature": [
      "noun",
      "solution",
      "to_problem"
    ],
    "incorrectPattern": "a solution for the delay",
    "correctPattern": "a solution to the delay",
    "explanationZhHant": "solution 表示解決某個問題的方法時，固定搭配是 solution to + 問題。a solution for cleaning glass 可引出用途，但意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_THE_REST_OF_SINGULAR_REST",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN THE_REST_OF SINGULAR_REST",
    "formula": "NOUN.THE_REST_OF.SINGULAR_REST",
    "structuralSignature": [
      "noun",
      "the_rest_of",
      "singular_rest"
    ],
    "incorrectPattern": "rests",
    "correctPattern": "rest",
    "explanationZhHant": "表示剩餘部分時，固定結構是 the rest of + 名詞， 其中 rest 保持單數。 rests 可作動詞或表示多次休息，但不適用於此結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NOUN_WORKING_CONDITIONS_PLURAL",
    "category": "singular_plural",
    "titleZhHant": "文法規則：NOUN WORKING_CONDITIONS PLURAL",
    "formula": "NOUN.WORKING_CONDITIONS.PLURAL",
    "structuralSignature": [
      "noun",
      "working_conditions",
      "plural"
    ],
    "incorrectPattern": "work condition",
    "correctPattern": "working conditions",
    "explanationZhHant": "固定名詞詞組通常是 working conditions，並以複數泛指工時、待遇及環境等多方面條件。改為複數後，不再使用單數冠詞 a。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "NUMERAL_ONE_AND_A_HALF",
    "category": "word_choice",
    "titleZhHant": "文法規則：NUMERAL ONE_AND_A_HALF",
    "formula": "NUMERAL.ONE_AND_A_HALF",
    "structuralSignature": [
      "numeral",
      "one_and_a_half"
    ],
    "incorrectPattern": "one-and-half",
    "correctPattern": "one and a half",
    "explanationZhHant": "獨立倍數詞組寫成 one and a half。作複合前置修飾語時可加連字號，例如 a one-and-a-half-fol d increase。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ORTHOGRAPHY_ALONGSIDE_ONE_WORD",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：ORTHOGRAPHY ALONGSIDE ONE_WORD",
    "formula": "ORTHOGRAPHY.ALONGSIDE.ONE_WORD",
    "structuralSignature": [
      "orthography",
      "alongside",
      "one_word"
    ],
    "incorrectPattern": "along side",
    "correctPattern": "alongside",
    "explanationZhHant": "介詞 alongside 表示沿着或緊鄰某物，寫作一個字。 along the side of 則是另一個完整結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ORTHOGRAPHY_COMPOUND_WORK_LIFE_HYPHEN",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：ORTHOGRAPHY COMPOUND_WORK_LIFE HYPHEN",
    "formula": "ORTHOGRAPHY.COMPOUND_WORK_LIFE.HYPHEN",
    "structuralSignature": [
      "orthography",
      "compound_work_life",
      "hyphen"
    ],
    "incorrectPattern": "work life",
    "correctPattern": "work-life",
    "explanationZhHant": "work-life 共同修飾 balance，是慣用的複合修飾語，因此通常加連字號。單獨並列兩個名詞時未必需要連字號。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ORTHOGRAPHY_LY_ADVERB_NO_HYPHEN",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：ORTHOGRAPHY LY_ADVERB NO_HYPHEN",
    "formula": "ORTHOGRAPHY.LY_ADVERB.NO_HYPHEN",
    "structuralSignature": [
      "orthography",
      "ly_adverb",
      "no_hyphen"
    ],
    "incorrectPattern": "lightly-developed",
    "correctPattern": "lightly developed",
    "explanationZhHant": "以-ly 結尾的副詞和其後的分詞或形容詞一般不用連字號，例如 lightly developed、densely populated。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ORTHOGRAPHY_SENTENCE_INITIAL_CAPITAL",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：ORTHOGRAPHY SENTENCE_INITIAL CAPITAL",
    "formula": "ORTHOGRAPHY.SENTENCE_INITIAL.CAPITAL",
    "structuralSignature": [
      "orthography",
      "sentence_initial",
      "capital"
    ],
    "incorrectPattern": "the",
    "correctPattern": "The",
    "explanationZhHant": "完整句子的第一個字母要使用大寫。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "ORTHOGRAPHY_TWENTY_FOUR_SEVEN_SLASH",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：ORTHOGRAPHY TWENTY_FOUR_SEVEN SLASH",
    "formula": "ORTHOGRAPHY.TWENTY_FOUR_SEVEN.SLASH",
    "structuralSignature": [
      "orthography",
      "twenty_four_seven",
      "slash"
    ],
    "incorrectPattern": "247",
    "correctPattern": "24/7",
    "explanationZhHant": "表示每日二十四小時、每週七日，通常寫成 24/7。 由於修改涉及數字，系統必須確認這不是原作者真正想寫的數值 247。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_BOTH_AND_MATCHING_GERUNDS",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL BOTH_AND MATCHING_GERUNDS",
    "formula": "PARALLEL.BOTH_AND.MATCHING_GERUNDS",
    "structuralSignature": [
      "parallel",
      "both_and",
      "matching_gerunds"
    ],
    "incorrectPattern": "both sorting spare parts and to clean the tables",
    "correctPattern": "both sorting spare parts and cleaning the tables",
    "explanationZhHant": "both A and B 連接的兩部分要使用相同文法形式。第一部分是動名詞 sorting， 第二部分也應用 cleaning。公式： both + 動名詞 + and + 動名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_CHART_ACTUAL_AND_PROJECTED_DISTRIBUTIONS",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL CHART ACTUAL_AND_PROJECTED_DISTRIBUTIONS",
    "formula": "PARALLEL.CHART.ACTUAL_AND_PROJECTED_DISTRIBUTIONS",
    "structuralSignature": [
      "parallel",
      "chart",
      "actual_and_projected_distributions"
    ],
    "incorrectPattern": "and projections for 2050",
    "correctPattern": "and the projected distributions for 2050",
    "explanationZhHant": "前面描述的是 2000 年的年齡分布，後面亦應使用平行名詞詞組表示 2050 年的預測分布。 projected 是形容詞，修飾 distributions。若圖表實際展示其他預測數據，中心名詞須按原圖調整。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_COORDINATED_NOUN_PHRASES_REPEATED_HEAD",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL COORDINATED_NOUN_PHRASES REPEATED_HEAD",
    "formula": "PARALLEL.COORDINATED_NOUN_PHRASES.REPEATED_HEAD",
    "structuralSignature": [
      "parallel",
      "coordinated_noun_phrases",
      "repeated_head"
    ],
    "incorrectPattern": "more personal and more rest time",
    "correctPattern": "more personal time and more rest time",
    "explanationZhHant": "personal 是形容詞，不能單獨作 have 的受詞。加入名詞 time 後，兩部分成為平行名詞詞組：more personal time 和 more rest time。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_FINITE_VERBS_SHARED_SUBJECT",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL FINITE_VERBS SHARED_SUBJECT",
    "formula": "PARALLEL.FINITE_VERBS.SHARED_SUBJECT",
    "structuralSignature": [
      "parallel",
      "finite_verbs",
      "shared_subject"
    ],
    "incorrectPattern": "lowering",
    "correctPattern": "lowers",
    "explanationZhHant": "主語 it 同時控制三個並列的一般現在式動詞： reduces, lowers, and protects。 lowering 可在另一種結構中成立，例如 It reduces suffering, thereby lowering pressure on hospitals.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_PAST_TENSE_COORDINATED",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL PAST_TENSE COORDINATED",
    "formula": "PARALLEL.PAST_TENSE.COORDINATED",
    "structuralSignature": [
      "parallel",
      "past_tense",
      "coordinated"
    ],
    "incorrectPattern": "refund",
    "correctPattern": "refunded",
    "explanationZhHant": "apologised、sent 和 refunded 是三個並列的過去式動作，所以 refund 要改為 refunded。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_PRICE_NOUNS_RISING_MODIFIER",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL PRICE_NOUNS RISING_MODIFIER",
    "formula": "PARALLEL.PRICE_NOUNS.RISING_MODIFIER",
    "structuralSignature": [
      "parallel",
      "price_nouns",
      "rising_modifier"
    ],
    "incorrectPattern": "bus fares and food keep going up",
    "correctPattern": "rising bus fares and food prices",
    "explanationZhHant": "Faced with 後面需要平行的名詞詞組。按上下文，作者似乎指車費和食品價格上升，因此改為 rising bus fares and food prices。因為原文的 food 也可能有其他意思，應由老師確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_RATHER_THAN_PASSIVE_PARTICIPLES",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL RATHER_THAN PASSIVE_PARTICIPLES",
    "formula": "PARALLEL.RATHER_THAN.PASSIVE_PARTICIPLES",
    "structuralSignature": [
      "parallel",
      "rather_than",
      "passive_participles"
    ],
    "incorrectPattern": "reserve",
    "correctPattern": "reserved",
    "explanationZhHant": "shared 和 reserved 都由前面的 are 控制，兩者應同為過去分詞。也可寫 are shared widely rather than being reserved。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_RESULT_PROTECT_AND_HELP",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL RESULT PROTECT_AND_HELP",
    "formula": "PARALLEL.RESULT.PROTECT_AND_HELP",
    "structuralSignature": [
      "parallel",
      "result",
      "protect_and_help"
    ],
    "incorrectPattern": "to keep",
    "correctPattern": "can help them maintain",
    "explanationZhHant": "前一部分表示「保護工人免受工作和壓力」，後一部分則表示「幫助他們維持關係」。兩個結果需要各自完整的動詞結構：can protect... and can help them maintain...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_SHARED_REDUCE_COORDINATED_OBJECTS",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL SHARED_REDUCE COORDINATED_OBJECTS",
    "formula": "PARALLEL.SHARED_REDUCE.COORDINATED_OBJECTS",
    "structuralSignature": [
      "parallel",
      "shared_reduce",
      "coordinated_objects"
    ],
    "incorrectPattern": "and it can less wear and tear",
    "correctPattern": "and wear and tear",
    "explanationZhHant": "reduce 同時控制兩個賓語： expenses 和 wear and tear。 less 是比較限定詞或形容詞，不能在這裡直接充當動詞。公式： reduce A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_SHARED_TO_INFINITIVE_BASE_VERBS",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL SHARED_TO_INFINITIVE BASE_VERBS",
    "formula": "PARALLEL.SHARED_TO_INFINITIVE.BASE_VERBS",
    "structuralSignature": [
      "parallel",
      "shared_to_infinitive",
      "base_verbs"
    ],
    "incorrectPattern": "providing",
    "correctPattern": "provide",
    "explanationZhHant": "to 同時控制後面的並列動詞，所以各項都使用動詞原形： to improve, provide, support, and promote。若改用 used for，整組才可使用動名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_TRANSITIVE_VERBS_EXPLICIT_OBJECT",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL TRANSITIVE_VERBS EXPLICIT_OBJECT",
    "formula": "PARALLEL.TRANSITIVE_VERBS.EXPLICIT_OBJECT",
    "structuralSignature": [
      "parallel",
      "transitive_verbs",
      "explicit_object"
    ],
    "incorrectPattern": "punish or give them bad reviews",
    "correctPattern": "punish them or give them bad reviews",
    "explanationZhHant": "punish 是及物動詞，需要受詞。後面的 them 是 give 的間接受詞，不能自動倒推為 punish 的受詞，因此要明確寫 punish them。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARALLEL_WOULD_RATHER_SHARED_SUBJECT_PAST",
    "category": "parallelism",
    "titleZhHant": "文法規則：PARALLEL WOULD_RATHER SHARED_SUBJECT PAST",
    "formula": "PARALLEL.WOULD_RATHER.SHARED_SUBJECT.PAST",
    "structuralSignature": [
      "parallel",
      "would_rather",
      "shared_subject",
      "past"
    ],
    "incorrectPattern": "than withholding",
    "correctPattern": "than withheld",
    "explanationZhHant": "council 同時控制 published 和 withheld，兩個假設動作要使用相同的過去式形式。公式：would rather + 主語 + 過去式 A + than + 過去式 B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_COMPARED_WITH_BASELINE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE COMPARED_WITH BASELINE",
    "formula": "PARTICIPLE.COMPARED_WITH.BASELINE",
    "structuralSignature": [
      "participle",
      "compared_with",
      "baseline"
    ],
    "incorrectPattern": "comparing with",
    "correctPattern": "compared with",
    "explanationZhHant": "這裡是「 Northland 的數字被拿來與 Eastport 比較」，使用過去分詞 compared with。 comparing 需要一個主動進行比較的執行者。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_FACED_WITH_CIRCUMSTANCE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE FACED_WITH CIRCUMSTANCE",
    "formula": "PARTICIPLE.FACED_WITH.CIRCUMSTANCE",
    "structuralSignature": [
      "participle",
      "faced_with",
      "circumstance"
    ],
    "incorrectPattern": "Face of",
    "correctPattern": "Faced with",
    "explanationZhHant": "表示某人面對某些處境，用過去分詞結構 Faced with + 名詞。 face of 通常表示某物的表面或面貌，例如 the face of the building， 不是本句所需意思。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_MALFORMED_MODIFIER_POSSESSIVE_RECONSTRUCTION",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE MALFORMED_MODIFIER POSSESSIVE_RECONSTRUCTION",
    "formula": "PARTICIPLE.MALFORMED_MODIFIER.POSSESSIVE_RECONSTRUCTION",
    "structuralSignature": [
      "participle",
      "malformed_modifier",
      "possessive_reconstruction"
    ],
    "incorrectPattern": "the student finishing the PE leasson T-shirt",
    "correctPattern": "after a student finishes a PE lesson, their T-shirt",
    "explanationZhHant": "原詞序不能清楚顯示誰完成體育課、哪件 T-shirt 屬於誰。目標句先用時間分句 after a student finish es...， 再用所有格 their T-shirt。 leasson 同時改為 lesson。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_PERFECT_MATCHED_SUBJECT",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE PERFECT MATCHED_SUBJECT",
    "formula": "PARTICIPLE.PERFECT.MATCHED_SUBJECT",
    "structuralSignature": [
      "participle",
      "perfect",
      "matched_subject"
    ],
    "incorrectPattern": "Having reviewed the evidence, the conclusion was",
    "correctPattern": "Having reviewed the evidence, the panel concluded",
    "explanationZhHant": "Having reviewed the evidence 的隱含執行者必須是主句主語。能夠「審閱證據」的是 panel，不是 conclusion。邊界： Having been reviewed, the evidence was archived 是正確被動結構，因為 evidence 是被審閱的事物。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_RESULT_CAUSING_CLAUSE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE RESULT CAUSING_CLAUSE",
    "formula": "PARTICIPLE.RESULT.CAUSING_CLAUSE",
    "structuralSignature": [
      "participle",
      "result",
      "causing_clause"
    ],
    "incorrectPattern": "common caused",
    "correctPattern": "common, causing",
    "explanationZhHant": "are common 已構成完整謂語。後面表示其結果時，可用逗號加現在分詞 causing...。直接寫 are common caused 會把兩個不相容的動詞形式放在一起。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_SUPPLEMENTARY_SHRINKING",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE SUPPLEMENTARY SHRINKING",
    "formula": "PARTICIPLE.SUPPLEMENTARY.SHRINKING",
    "structuralSignature": [
      "participle",
      "supplementary",
      "shrinking"
    ],
    "incorrectPattern": "just shrink",
    "correctPattern": "shrinking only",
    "explanationZhHant": "逗號後面的部分補充說明「保持相對穩定」的具體變化，可用現在分詞 shrinking。 only slightly 修飾縮減程度。另一個正確寫法是 and is expected to shrink only slightly。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PARTICIPLE_TAKEN_TOGETHER_PASSIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：PARTICIPLE TAKEN_TOGETHER PASSIVE",
    "formula": "PARTICIPLE.TAKEN_TOGETHER.PASSIVE",
    "structuralSignature": [
      "participle",
      "taken_together",
      "passive"
    ],
    "incorrectPattern": "Taking together",
    "correctPattern": "Taken together",
    "explanationZhHant": "兩幅圖是「被放在一起考慮」，所以使用過去分詞 Taken together。 Taking the charts together, we can see... 才是主動結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_CONNECTED_TO",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE CONNECTED_TO",
    "formula": "PASSIVE.CONNECTED_TO",
    "structuralSignature": [
      "passive",
      "connected_to"
    ],
    "incorrectPattern": "connect with",
    "correctPattern": "be connected to",
    "explanationZhHant": "homes 是透過道路被連接至車站的地點，因此用被動式 be connected to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_DUE_TO_BE_PARTICIPLE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE DUE_TO_BE_PARTICIPLE",
    "formula": "PASSIVE.DUE_TO_BE_PARTICIPLE",
    "structuralSignature": [
      "passive",
      "due_to_be_participle"
    ],
    "incorrectPattern": "is due for extending",
    "correctPattern": "is due to be extended",
    "explanationZhHant": "表示預定進行的被動工程，用 be due to be + 過去分詞。 名詞結構可寫 is due for extension。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_FOLLOWED_BY",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE FOLLOWED_BY",
    "formula": "PASSIVE.FOLLOWED_BY",
    "structuralSignature": [
      "passive",
      "followed_by"
    ],
    "incorrectPattern": "with",
    "correctPattern": "by",
    "explanationZhHant": "表示排名次序中後面接着甚麼，用被動結構 be followed by。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_FUTURE_WILL_BE_ADDED",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE FUTURE WILL_BE_ADDED",
    "formula": "PASSIVE.FUTURE.WILL_BE_ADDED",
    "structuralSignature": [
      "passive",
      "future",
      "will_be_added"
    ],
    "incorrectPattern": "a pharmacy will add",
    "correctPattern": "a pharmacy will be added",
    "explanationZhHant": "pharmacy 是將被增設的設施，需要將來被動語態。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_FUTURE_WILL_BE_DIVIDED",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE FUTURE WILL_BE_DIVIDED",
    "formula": "PASSIVE.FUTURE.WILL_BE_DIVIDED",
    "structuralSignature": [
      "passive",
      "future",
      "will_be_divided"
    ],
    "incorrectPattern": "divide",
    "correctPattern": "be divided",
    "explanationZhHant": "farmland 是被劃分的土地，需要將來被動語態。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_FUTURE_WILL_BE_MOVED",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE FUTURE WILL_BE_MOVED",
    "formula": "PASSIVE.FUTURE.WILL_BE_MOVED",
    "structuralSignature": [
      "passive",
      "future",
      "will_be_moved"
    ],
    "incorrectPattern": "relocate",
    "correctPattern": "be moved",
    "explanationZhHant": "car park 是被遷移的設施，需要被動式。若主語是管理部門，可寫 The council will relocate the car park。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_FUTURE_WILL_BE_WIDENED",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE FUTURE WILL_BE_WIDENED",
    "formula": "PASSIVE.FUTURE.WILL_BE_WIDENED",
    "structuralSignature": [
      "passive",
      "future",
      "will_be_widened"
    ],
    "incorrectPattern": "widen",
    "correctPattern": "be widened",
    "explanationZhHant": "人為工程把 riverbank 擴闊，因此使用被動式。若自然作用令河岸自行變闊，不及物 will widen 才可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_INFINITIVE_TO_BE_USED",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE INFINITIVE TO_BE_USED",
    "formula": "PASSIVE.INFINITIVE.TO_BE_USED",
    "structuralSignature": [
      "passive",
      "infinitive",
      "to_be_used"
    ],
    "incorrectPattern": "use",
    "correctPattern": "be used",
    "explanationZhHant": "land 是被使用的地方，因此不定詞要使用被動式 to be used。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_INTEND_BE_INTENDED_TO",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE INTEND BE_INTENDED_TO",
    "formula": "PASSIVE.INTEND.BE_INTENDED_TO",
    "structuralSignature": [
      "passive",
      "intend",
      "be_intended_to"
    ],
    "incorrectPattern": "intends improving",
    "correctPattern": "is intended to improve",
    "explanationZhHant": "phase 本身沒有意圖；它是被設計來達到某目的，因此使用 be intended to + 動詞原形。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PAST_WAS_BUILT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PAST WAS_BUILT",
    "formula": "PASSIVE.PAST.WAS_BUILT",
    "structuralSignature": [
      "passive",
      "past",
      "was_built"
    ],
    "incorrectPattern": "a supermarket constructed",
    "correctPattern": "a supermarket was built",
    "explanationZhHant": "supermarket 是被建造的設施，主句需要完整的被動謂語。 was constructed 也是正確替代。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PAST_WAS_DEMOLISHED",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PAST WAS_DEMOLISHED",
    "formula": "PASSIVE.PAST.WAS_DEMOLISHED",
    "structuralSignature": [
      "passive",
      "past",
      "was_demolished"
    ],
    "incorrectPattern": "The warehouse demolished",
    "correctPattern": "The warehouse was demolished",
    "explanationZhHant": "warehouse 是被拆除的建築，需要 was + 過去分詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PAST_WERE_REPLACED_BY",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PAST WERE_REPLACED_BY",
    "formula": "PASSIVE.PAST.WERE_REPLACED_BY",
    "structuralSignature": [
      "passive",
      "past",
      "were_replaced_by"
    ],
    "incorrectPattern": "the cottages replaced by",
    "correctPattern": "the cottages were replaced by",
    "explanationZhHant": "cottages 是被取代的設施，所以需要過去被動語態 were replaced by。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PHRASAL_KNOCK_DOWN",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PHRASAL KNOCK_DOWN",
    "formula": "PASSIVE.PHRASAL.KNOCK_DOWN",
    "structuralSignature": [
      "passive",
      "phrasal",
      "knock_down"
    ],
    "incorrectPattern": "knock down",
    "correctPattern": "be demolished",
    "explanationZhHant": "建築物是被拆卸的對象，因此要使用被動式： will be knocked down 或 will be demolished。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PLANNED_FEATURE_SUBJECT_FRONTING",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PLANNED_FEATURE SUBJECT_FRONTING",
    "formula": "PASSIVE.PLANNED_FEATURE.SUBJECT_FRONTING",
    "structuralSignature": [
      "passive",
      "planned_feature",
      "subject_fronting"
    ],
    "incorrectPattern": "it is planned a walkway",
    "correctPattern": "a walkway is planned",
    "explanationZhHant": "英文不使用 it is planned + 名詞來表示某項設施獲規劃。應把設施放作被動句主語：A walkway is planned。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PREDICT_BE_PARTICIPLE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PREDICT BE_PARTICIPLE",
    "formula": "PASSIVE.PREDICT.BE_PARTICIPLE",
    "structuralSignature": [
      "passive",
      "predict",
      "be_participle"
    ],
    "incorrectPattern": "predicted",
    "correctPattern": "is predicted",
    "explanationZhHant": "這個年齡組是「被預測」下降，因此使用被動語態 be + 過去分詞：is predicted。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_PROPOSAL_SUBJECT_IS_PROPOSED_TO_BE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE PROPOSAL SUBJECT IS_PROPOSED_TO_BE",
    "formula": "PASSIVE.PROPOSAL.SUBJECT.IS_PROPOSED_TO_BE",
    "structuralSignature": [
      "passive",
      "proposal",
      "subject",
      "is_proposed_to_be"
    ],
    "incorrectPattern": "it proposes to develop",
    "correctPattern": "it is proposed to be developed",
    "explanationZhHant": "district 是接受發展工程的地方，不是主動提出計劃的人，因此使用被動結構：is proposed to be developed。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PASSIVE_SURROUNDED_BY",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：PASSIVE SURROUNDED_BY",
    "formula": "PASSIVE.SURROUNDED_BY",
    "structuralSignature": [
      "passive",
      "surrounded_by"
    ],
    "incorrectPattern": "surrounding with",
    "correctPattern": "surrounded by",
    "explanationZhHant": "public square 是被 cafés 包圍的地方，所以用 surrounded by。 surrounded with 只在少數「配備／裝飾」語境可見。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_BOTTOM_OUT_AT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL BOTTOM_OUT AT",
    "formula": "PHRASAL.BOTTOM_OUT.AT",
    "structuralSignature": [
      "phrasal",
      "bottom_out",
      "at"
    ],
    "incorrectPattern": "bottomed at",
    "correctPattern": "bottomed out at",
    "explanationZhHant": "表示下降至最低點，用 bottom out at + 數值。名詞寫法是 reached alow of...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_BRANCH_OFF",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL BRANCH_OFF",
    "formula": "PHRASAL.BRANCH_OFF",
    "structuralSignature": [
      "phrasal",
      "branch_off"
    ],
    "incorrectPattern": "branched from",
    "correctPattern": "branching off",
    "explanationZhHant": "道路從主要道路分岔，用 branch off + 道路。現在分詞 branching 主動修飾 road； branched 會形成不完整或錯誤的被動意思。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_CATCH_UP_WITH",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL CATCH_UP_WITH",
    "formula": "PHRASAL.CATCH_UP_WITH",
    "structuralSignature": [
      "phrasal",
      "catch_up_with"
    ],
    "incorrectPattern": "catch it up",
    "correctPattern": "catch up with it",
    "explanationZhHant": "表示數值追上另一項，用 catch up with + 對象。 catch someone up 可在英式英文中表示向某人補充最新情況，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_CHANGE_INTO_CLOTHING",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL CHANGE_INTO CLOTHING",
    "formula": "PHRASAL.CHANGE_INTO.CLOTHING",
    "structuralSignature": [
      "phrasal",
      "change_into",
      "clothing"
    ],
    "incorrectPattern": "change",
    "correctPattern": "change into",
    "explanationZhHant": "表示換上某套衣服，用 change into + 衣物。 outfits to change 可能被理解為「需要修改的服裝」，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_COME_UP_WITH_PLAN",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL COME_UP_WITH PLAN",
    "formula": "PHRASAL.COME_UP_WITH.PLAN",
    "structuralSignature": [
      "phrasal",
      "come_up_with",
      "plan"
    ],
    "incorrectPattern": "come up to a plan",
    "correctPattern": "come up with a plan",
    "explanationZhHant": "表示想出計劃，用 come up with。come up to 可表示走近某人或達到某個水平，例如 come up to the required standard。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_COVER_UP_DIRECT_OBJECT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL COVER_UP DIRECT_OBJECT",
    "formula": "PHRASAL.COVER_UP.DIRECT_OBJECT",
    "structuralSignature": [
      "phrasal",
      "cover_up",
      "direct_object"
    ],
    "incorrectPattern": "cover up about delays",
    "correctPattern": "cover up delays",
    "explanationZhHant": "cover up 表示掩飾時直接接賓語，不加 about。亦可把名詞放在中間： cover the delays up； 代名詞必須放中間： cover them up。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_DRAW_UP_DIRECT_OBJECT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL DRAW_UP DIRECT_OBJECT",
    "formula": "PHRASAL.DRAW_UP.DIRECT_OBJECT",
    "structuralSignature": [
      "phrasal",
      "draw_up",
      "direct_object"
    ],
    "incorrectPattern": "drawn up on a timetable",
    "correctPattern": "drawn up a timetable",
    "explanationZhHant": "draw up 表示草擬或制定時直接接賓語，所以寫 draw up a timetable，不加 on。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_FOLLOW_UP_ON_COMPLAINT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL FOLLOW_UP_ON COMPLAINT",
    "formula": "PHRASAL.FOLLOW_UP_ON.COMPLAINT",
    "structuralSignature": [
      "phrasal",
      "follow_up_on",
      "complaint"
    ],
    "incorrectPattern": "follow on every complaint",
    "correctPattern": "follow up on every complaint",
    "explanationZhHant": "表示繼續調查或處理投訴，用 follow up on + complaint。 follow on 表示某事接着另一件事發生，意思不同。邊界：follow up every complaint 也可以是正確的及物用法，不應強制加入 on。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_LEVEL_OFF_AT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL LEVEL_OFF AT",
    "formula": "PHRASAL.LEVEL_OFF.AT",
    "structuralSignature": [
      "phrasal",
      "level_off",
      "at"
    ],
    "incorrectPattern": "levelled at 3.0 MWh",
    "correctPattern": "levelled off at 3.0 MWh",
    "explanationZhHant": "表示數據停止上升或下降並趨於穩定，用 level off at + 數值。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_LIVE_UP_TO_PROMISE",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL LIVE_UP_TO PROMISE",
    "formula": "PHRASAL.LIVE_UP_TO.PROMISE",
    "structuralSignature": [
      "phrasal",
      "live_up_to",
      "promise"
    ],
    "incorrectPattern": "live up with",
    "correctPattern": "live up to",
    "explanationZhHant": "live up to 表示達到期望、標準或履行承諾，所以寫 live up to its promises。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_LOOK_AFTER_INSEPARABLE",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL LOOK_AFTER INSEPARABLE",
    "formula": "PHRASAL.LOOK_AFTER.INSEPARABLE",
    "structuralSignature": [
      "phrasal",
      "look_after",
      "inseparable"
    ],
    "incorrectPattern": "look their children after",
    "correctPattern": "look after their children",
    "explanationZhHant": "look after 是不可分的介詞片語動詞，賓語要放在整個結構後面。不能把 their children 插入 look 和 after 之間。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_LOOK_INTO_NO_EXTRA_PREPOSITION",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL LOOK_INTO NO_EXTRA_PREPOSITION",
    "formula": "PHRASAL.LOOK_INTO.NO_EXTRA_PREPOSITION",
    "structuralSignature": [
      "phrasal",
      "look_into",
      "no_extra_preposition"
    ],
    "incorrectPattern": "look into on",
    "correctPattern": "look into",
    "explanationZhHant": "look into 本身已包含介詞粒子 into，後面直接接事情或疑問分句，不再加 on。 公式：look into + 名詞／why 分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_MAKE_UP_PERCENT_OF_TOTAL",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL MAKE_UP PERCENT_OF_TOTAL",
    "formula": "PHRASAL.MAKE_UP.PERCENT_OF_TOTAL",
    "structuralSignature": [
      "phrasal",
      "make_up",
      "percent_of_total"
    ],
    "incorrectPattern": "made 45 per cent from generation",
    "correctPattern": "made up 45 per cent of generation",
    "explanationZhHant": "表示某部分構成整體的某個比例，用 make up + 百分比 + of + 整體。被動結構 The total is made up of... 表示整體由哪些部分組成。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_PULL_OUT_OF_PROJECT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL PULL_OUT_OF PROJECT",
    "formula": "PHRASAL.PULL_OUT_OF.PROJECT",
    "structuralSignature": [
      "phrasal",
      "pull_out_of",
      "project"
    ],
    "incorrectPattern": "pulled off of the project",
    "correctPattern": "pulled out of the project",
    "explanationZhHant": "表示退出計劃，用 pull out of + project。 pull off 表示成功完成困難的事情，例如 pull off a difficult rescue，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_PUT_OFF_GERUND",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL PUT_OFF GERUND",
    "formula": "PHRASAL.PUT_OFF.GERUND",
    "structuralSignature": [
      "phrasal",
      "put_off",
      "gerund"
    ],
    "incorrectPattern": "put off replace",
    "correctPattern": "put off replacing",
    "explanationZhHant": "put off 表示延遲某個動作時，後面接動名詞。公式：put off + 名詞／動名詞。正確：put off replacing the pumps／put off the replacement。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_RULE_OUT_DIRECT_OBJECT",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL RULE_OUT DIRECT_OBJECT",
    "formula": "PHRASAL.RULE_OUT.DIRECT_OBJECT",
    "structuralSignature": [
      "phrasal",
      "rule_out",
      "direct_object"
    ],
    "incorrectPattern": "against fraud",
    "correctPattern": "fraud",
    "explanationZhHant": "rule out 表示排除某個可能性時直接接賓語，不加 against。邊界：rule against a company 是法律裁決對該公司不利，屬另一個結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_SEPARABLE_PRONOUN_BETWEEN_VERB_PARTICLE",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL SEPARABLE PRONOUN BETWEEN_VERB_PARTICLE",
    "formula": "PHRASAL.SEPARABLE.PRONOUN.BETWEEN_VERB_PARTICLE",
    "structuralSignature": [
      "phrasal",
      "separable",
      "pronoun",
      "between_verb_particle"
    ],
    "incorrectPattern": "turn off them",
    "correctPattern": "turn them off",
    "explanationZhHant": "turn off 是可分片語動詞。賓語是代名詞時，代名詞必須放在動詞和粒子之間： turn them off。完整名詞則兩種位置都可： turn off the devices／turn the devices off。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_SET_UP_ESTABLISH_PARTICLE_UP",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL SET_UP ESTABLISH PARTICLE_UP",
    "formula": "PHRASAL.SET_UP.ESTABLISH.PARTICLE_UP",
    "structuralSignature": [
      "phrasal",
      "set_up",
      "establish",
      "particle_up"
    ],
    "incorrectPattern": "set out",
    "correctPattern": "set up",
    "explanationZhHant": "／設立一個小組」要用 set up。setout 可表示出發、陳述或排列，不表示在本句中成立調查小組。公式：set up + 組織／系統／小組。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_TAKE_ON_WORK",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL TAKE_ON WORK",
    "formula": "PHRASAL.TAKE_ON.WORK",
    "structuralSignature": [
      "phrasal",
      "take_on",
      "work"
    ],
    "incorrectPattern": "take",
    "correctPattern": "take on",
    "explanationZhHant": "表示接受額外工作或責任，用片語動詞 take on。公式： take on + work／ responsibility／a task。take work home 則是另一個正確結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PHRASAL_TAKE_OVER_FROM_PREDECESSOR",
    "category": "preposition",
    "titleZhHant": "文法規則：PHRASAL TAKE_OVER_FROM PREDECESSOR",
    "formula": "PHRASAL.TAKE_OVER_FROM.PREDECESSOR",
    "structuralSignature": [
      "phrasal",
      "take_over_from",
      "predecessor"
    ],
    "incorrectPattern": "of",
    "correctPattern": "from",
    "explanationZhHant": "表示接替某人或某組人，用 take over from。 邊界：take over a company 可直接接賓語，表示取得公司的控制權。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "POSSESSIVE_COLLECTIVE_STAFF_OPINION",
    "category": "possessive",
    "titleZhHant": "文法規則：POSSESSIVE COLLECTIVE_STAFF OPINION",
    "formula": "POSSESSIVE.COLLECTIVE_STAFF.OPINION",
    "structuralSignature": [
      "possessive",
      "collective_staff",
      "opinion"
    ],
    "incorrectPattern": "In staff opinion",
    "correctPattern": "In the staff's opinion",
    "explanationZhHant": "固定結構是 in someone 's opinion。這裡的 opinion 屬於 staff，因此使用定冠詞和所有格：in the staff's opinion。也可寫 in the opinion of the staff。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "POSSESSIVE_INDEFINITE_PRONOUN_ELSES",
    "category": "possessive",
    "titleZhHant": "文法規則：POSSESSIVE INDEFINITE_PRONOUN ELSES",
    "formula": "POSSESSIVE.INDEFINITE_PRONOUN.ELSES",
    "structuralSignature": [
      "possessive",
      "indefinite_pronoun",
      "elses"
    ],
    "incorrectPattern": "somebody's else responsibility",
    "correctPattern": "somebody else's responsibility",
    "explanationZhHant": "else 跟在 somebody、 anyone 等不定代名詞後時，所有格標記加在整個詞組末端： somebody else's。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "POSSESSIVE_ITS_NO_APOSTROPHE",
    "category": "possessive",
    "titleZhHant": "文法規則：POSSESSIVE ITS NO_APOSTROPHE",
    "formula": "POSSESSIVE.ITS.NO_APOSTROPHE",
    "structuralSignature": [
      "possessive",
      "its",
      "no_apostrophe"
    ],
    "incorrectPattern": "it's label",
    "correctPattern": "its label",
    "explanationZhHant": "its 是所有格限定詞，表示「它的」； it's 是 it is 或 it has 的縮寫。名詞 label 前要用 its。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "POSSESSIVE_PLURAL_PROBLEMS_WITH_GERUND",
    "category": "possessive",
    "titleZhHant": "文法規則：POSSESSIVE PLURAL PROBLEMS_WITH_GERUND",
    "formula": "POSSESSIVE.PLURAL.PROBLEMS_WITH_GERUND",
    "structuralSignature": [
      "possessive",
      "plural",
      "problems_with_gerund"
    ],
    "incorrectPattern": "the students choosing outfits problems",
    "correctPattern": "students' problems with choosing outfits",
    "explanationZhHant": "表示問題屬於多名學生，用複數所有格 students'。表示「在做某事方面的問題」，常用 problems with + 動名詞。公式： people's problems with doing something。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
    "category": "possessive",
    "titleZhHant": "文法規則：POSSESSIVE REGULAR_PLURAL APOSTROPHE",
    "formula": "POSSESSIVE.REGULAR_PLURAL.APOSTROPHE",
    "structuralSignature": [
      "possessive",
      "regular_plural",
      "apostrophe"
    ],
    "incorrectPattern": "volunteers tools",
    "correctPattern": "volunteers' tools",
    "explanationZhHant": "tools 屬於多名 volunteers。規則複數名詞已經以 s 結尾，所以在 s 後面加撇號。公式：複數名詞-s + '。對照： one volunteer's tools； children's tools。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREDICATIVE_LAST_NO_AT",
    "category": "word_choice",
    "titleZhHant": "文法規則：PREDICATIVE LAST NO_AT",
    "formula": "PREDICATIVE.LAST.NO_AT",
    "structuralSignature": [
      "predicative",
      "last",
      "no_at"
    ],
    "incorrectPattern": "at last",
    "correctPattern": "last",
    "explanationZhHant": "last 可直接作排名補語： Northland was last。 at last 表示等待一段時間後「終於」，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_ACCESS_TO_RESOURCE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP ACCESS TO RESOURCE",
    "formula": "PREP.ACCESS.TO.RESOURCE",
    "structuralSignature": [
      "prep",
      "access",
      "to",
      "resource"
    ],
    "incorrectPattern": "for",
    "correctPattern": "to",
    "explanationZhHant": "表示能夠取得某項資源，用 access to + 事物。 access for disabled visitors 中的 for 可表示受惠對象，但不是本句所需意思。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_ACCOUNT_FOR_EXPLANATION",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP ACCOUNT_FOR EXPLANATION",
    "formula": "PREP.ACCOUNT_FOR.EXPLANATION",
    "structuralSignature": [
      "prep",
      "account_for",
      "explanation"
    ],
    "incorrectPattern": "account about",
    "correctPattern": "account for",
    "explanationZhHant": "account for 表示解釋某件事、構成某個比例或造成某個結果。這裡要寫 account for the failures。 account to someone 則可表示向某人負責。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_BENEATH_NO_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP BENEATH NO_OF",
    "formula": "PREP.BENEATH.NO_OF",
    "structuralSignature": [
      "prep",
      "beneath",
      "no_of"
    ],
    "incorrectPattern": "under of the road bridge",
    "correctPattern": "beneath the road bridge",
    "explanationZhHant": "under 和 beneath 都直接接名詞，不加 of。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_BETWEEN_AND_TIME_RANGE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP BETWEEN AND TIME_RANGE",
    "formula": "PREP.BETWEEN.AND.TIME_RANGE",
    "structuralSignature": [
      "prep",
      "between",
      "and",
      "time_range"
    ],
    "incorrectPattern": "between 2005 to 2035",
    "correctPattern": "between 2005 and 2035",
    "explanationZhHant": "between 必須與 and 配對。另一個正確框架是 from 2005 to 2035。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_BETWEEN_TWO_LANDMARKS",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP BETWEEN TWO_LANDMARKS",
    "formula": "PREP.BETWEEN.TWO_LANDMARKS",
    "structuralSignature": [
      "prep",
      "between",
      "two_landmarks"
    ],
    "incorrectPattern": "among the park and a grocery shop",
    "correctPattern": "between the park and a grocery shop",
    "explanationZhHant": "只有兩個明確地標時使用 between A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_BY_DEADLINE_NOT_UNTIL",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP BY DEADLINE_NOT_UNTIL",
    "formula": "PREP.BY.DEADLINE_NOT_UNTIL",
    "structuralSignature": [
      "prep",
      "by",
      "deadline_not_until"
    ],
    "incorrectPattern": "Until 2035",
    "correctPattern": "By 2035",
    "explanationZhHant": "by 2035 表示最遲到 2035 年時達到該水平。 until 2035 表示某狀態持續至 2035 年。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_BY_FUTURE_DEADLINE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP BY FUTURE_DEADLINE",
    "formula": "PREP.BY.FUTURE_DEADLINE",
    "structuralSignature": [
      "prep",
      "by",
      "future_deadline"
    ],
    "incorrectPattern": "to 2050",
    "correctPattern": "by 2050",
    "explanationZhHant": "表示某種狀況在 2050 年之前或到該年時形成，用 by 2050。to 2050 通常需要由 from 配對，如 from 2000 to 2050。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_BY_ROAD_MEANS_OF_CONNECTION",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP BY_ROAD MEANS_OF_CONNECTION",
    "formula": "PREP.BY_ROAD.MEANS_OF_CONNECTION",
    "structuralSignature": [
      "prep",
      "by_road",
      "means_of_connection"
    ],
    "incorrectPattern": "through",
    "correctPattern": "by",
    "explanationZhHant": "表示兩地由某條道路連接，用 by a road。 through 可描述道路穿過森林或城鎮。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_COMMUNICATION_BETWEEN_A_AND_B",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP COMMUNICATION BETWEEN_A_AND_B",
    "formula": "PREP.COMMUNICATION.BETWEEN_A_AND_B",
    "structuralSignature": [
      "prep",
      "communication",
      "between_a_and_b"
    ],
    "incorrectPattern": "with passengers and staff",
    "correctPattern": "between passengers and staff",
    "explanationZhHant": "表示兩個群體彼此溝通，用 communication between A and B。 communication with passengers 可表示某一方與乘客溝通，但當兩方並列時， between 較準確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_COMPLY_WITH_REQUIREMENT",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP COMPLY_WITH REQUIREMENT",
    "formula": "PREP.COMPLY_WITH.REQUIREMENT",
    "structuralSignature": [
      "prep",
      "comply_with",
      "requirement"
    ],
    "incorrectPattern": "comply to",
    "correctPattern": "comply with",
    "explanationZhHant": "comply 的固定搭配是 comply with + 規則／法律／要求，所以寫 comply with the safety code。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_CONNECTION_BETWEEN_AND",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP CONNECTION BETWEEN_AND",
    "formula": "PREP.CONNECTION.BETWEEN_AND",
    "structuralSignature": [
      "prep",
      "connection",
      "between_and"
    ],
    "incorrectPattern": "between the station to the town centre",
    "correctPattern": "between the station and the town centre",
    "explanationZhHant": "between 與 and 配對。另一個正確框架是 a connection from the station to the town centre。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_DEAL_WITH_PROBLEM",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP DEAL_WITH PROBLEM",
    "formula": "PREP.DEAL_WITH.PROBLEM",
    "structuralSignature": [
      "prep",
      "deal_with",
      "problem"
    ],
    "incorrectPattern": "deal about",
    "correctPattern": "deal with",
    "explanationZhHant": "deal with 表示處理問題。deal in 則表示買賣某類貨品，例如 deal in antiques；deal about 不是本句所需搭配。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_DESPITE_NO_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP DESPITE NO_OF",
    "formula": "PREP.DESPITE.NO_OF",
    "structuralSignature": [
      "prep",
      "despite",
      "no_of"
    ],
    "incorrectPattern": "Despite of receiving",
    "correctPattern": "Despite receiving",
    "explanationZhHant": "despite 本身已經是介詞，後面直接接名詞或動名詞，不加 of。 公式： despite + 名詞／動名詞。正確對照：in spite of receiving，因為 in spite 後面需要 of。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_DEVOTE_TIME_TO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP DEVOTE TIME TO",
    "formula": "PREP.DEVOTE.TIME.TO",
    "structuralSignature": [
      "prep",
      "devote",
      "time",
      "to"
    ],
    "incorrectPattern": "devote less time on relaxation",
    "correctPattern": "devote less time to relaxation",
    "explanationZhHant": "devote 的固定結構是 devote + 時間／精力 + to + 名詞／動名詞。所以寫 devote less time to relaxation。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_DIVERT_TRAFFIC_ONTO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP DIVERT_TRAFFIC ONTO",
    "formula": "PREP.DIVERT_TRAFFIC.ONTO",
    "structuralSignature": [
      "prep",
      "divert_traffic",
      "onto"
    ],
    "incorrectPattern": "redirected in a new bypass which ran",
    "correctPattern": "diverted onto a new bypass running",
    "explanationZhHant": "把交通流改道至另一條道路，用 divert traffic onto + 道路。into 多表示進入封閉空間。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_DURATION_FOR_PERIOD",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP DURATION FOR_PERIOD",
    "formula": "PREP.DURATION.FOR_PERIOD",
    "structuralSignature": [
      "prep",
      "duration",
      "for_period"
    ],
    "incorrectPattern": "since six months",
    "correctPattern": "for six months",
    "explanationZhHant": "six months 是一段時間，要用 for。since 後面通常接起點。公式：for + 時段； since + 起點。正確：for six months／ since March。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_FROM_TO_TIME_RANGE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP FROM_TO TIME_RANGE",
    "formula": "PREP.FROM_TO.TIME_RANGE",
    "structuralSignature": [
      "prep",
      "from_to",
      "time_range"
    ],
    "incorrectPattern": "between 2010 to 2025",
    "correctPattern": "from 2010 to 2025",
    "explanationZhHant": "from 與 to 配對； between 則與 and 配對。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_HOME_DIRECTION_NO_TO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP HOME DIRECTION NO_TO",
    "formula": "PREP.HOME.DIRECTION.NO_TO",
    "structuralSignature": [
      "prep",
      "home",
      "direction",
      "no_to"
    ],
    "incorrectPattern": "return to home",
    "correctPattern": "return home",
    "explanationZhHant": "home 作方向副詞時，前面不用 to： go home、come home、 return home。若有名詞限定，可寫 return to their home。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_INTERESTED_IN",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP INTERESTED IN",
    "formula": "PREP.INTERESTED.IN",
    "structuralSignature": [
      "prep",
      "interested",
      "in"
    ],
    "incorrectPattern": "on",
    "correctPattern": "in",
    "explanationZhHant": "interested 的固定搭配是 interested in + 名詞／動名詞，所以寫 interested in space。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_INVEST_IN_FIELD",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP INVEST IN FIELD",
    "formula": "PREP.INVEST.IN.FIELD",
    "structuralSignature": [
      "prep",
      "invest",
      "in",
      "field"
    ],
    "incorrectPattern": "invest on health education",
    "correctPattern": "invest in health education",
    "explanationZhHant": "表示把資源投放於某個範疇，用 invest in + 項目／領域。也可寫 invest money in education。本句不用 on。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_LAST_NAMED_DAY_ZERO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP LAST_NAMED_DAY ZERO",
    "formula": "PREP.LAST_NAMED_DAY.ZERO",
    "structuralSignature": [
      "prep",
      "last_named_day",
      "zero"
    ],
    "incorrectPattern": "At last",
    "correctPattern": "Last",
    "explanationZhHant": "last Monday 本身已是完整時間副詞，不在前面加 at。 比較： at six o'clock、on Monday、last Monday。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_LAST_TIME_EXPRESSION_ZERO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP LAST_TIME_EXPRESSION ZERO",
    "formula": "PREP.LAST_TIME_EXPRESSION.ZERO",
    "structuralSignature": [
      "prep",
      "last_time_expression",
      "zero"
    ],
    "incorrectPattern": "on last autumn",
    "correctPattern": "last autumn",
    "explanationZhHant": "last／ next／ this + 時間名詞通常直接作時間副詞，不加 on、in 或 at：last autumn、 next week。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_LISTEN_TO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP LISTEN TO",
    "formula": "PREP.LISTEN.TO",
    "structuralSignature": [
      "prep",
      "listen",
      "to"
    ],
    "incorrectPattern": "listen the radio",
    "correctPattern": "listen to the radio",
    "explanationZhHant": "listen 接聆聽對象時需要 to： listen to music／ the radio。 hear 則可直接接賓語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_MAP_ALONG_BANK_NOT_BESIDES",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP MAP ALONG_BANK NOT_BESIDES",
    "formula": "PREP.MAP.ALONG_BANK.NOT_BESIDES",
    "structuralSignature": [
      "prep",
      "map",
      "along_bank",
      "not_besides"
    ],
    "incorrectPattern": "besides the northern bank",
    "correctPattern": "along the northern bank",
    "explanationZhHant": "along 表示道路與河岸平行延伸。 besides 表示「此外」；beside 才表示「在旁邊」，但仍不一定表達沿線延伸。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_MAP_FUTURE_BY_YEAR",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP MAP FUTURE BY_YEAR",
    "formula": "PREP.MAP.FUTURE.BY_YEAR",
    "structuralSignature": [
      "prep",
      "map",
      "future",
      "by_year"
    ],
    "incorrectPattern": "until 2035",
    "correctPattern": "by 2035",
    "explanationZhHant": "by 2035 表示最遲到該年時完成或形成。 until 2035 表示某狀態一直持續至該年。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_MAP_PERIOD_BETWEEN_AND",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP MAP PERIOD BETWEEN_AND",
    "formula": "PREP.MAP.PERIOD.BETWEEN_AND",
    "structuralSignature": [
      "prep",
      "map",
      "period",
      "between_and"
    ],
    "incorrectPattern": "from 1995 until 2025",
    "correctPattern": "between 1995 and 2025",
    "explanationZhHant": "封閉的兩個時間點可用 between A and B。 from 必須與 to 配對； until 通常表示某狀態持續至某時。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_MARGIN_BY_DIFFERENCE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP MARGIN BY_DIFFERENCE",
    "formula": "PREP.MARGIN.BY_DIFFERENCE",
    "structuralSignature": [
      "prep",
      "margin",
      "by_difference"
    ],
    "incorrectPattern": "with 0.6 MWh",
    "correctPattern": "by 0.6 MWh",
    "explanationZhHant": "表示一項數據比另一項高出多少，用 by + 差額： surpassed Northland by 0.6 MWh。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_MEASURED_IN_UNIT",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP MEASURED IN UNIT",
    "formula": "PREP.MEASURED.IN.UNIT",
    "structuralSignature": [
      "prep",
      "measured",
      "in",
      "unit"
    ],
    "incorrectPattern": "measured by MWh",
    "correctPattern": "measured in MWh",
    "explanationZhHant": "表示數據使用甚麼單位，用 measured in + 單位。 measured by 可引出測量工具或方法，例如 measured by a digital meter。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_NEXT_TO_REQUIRES_TO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP NEXT_TO REQUIRES_TO",
    "formula": "PREP.NEXT_TO.REQUIRES_TO",
    "structuralSignature": [
      "prep",
      "next_to",
      "requires_to"
    ],
    "incorrectPattern": "The road section next",
    "correctPattern": "The section of road beside",
    "explanationZhHant": "可寫 next to the park 或 beside the park。 next 單獨不能在這裡作介詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_ON_BOTH_SIDES_NO_THE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP ON_BOTH_SIDES NO_THE",
    "formula": "PREP.ON_BOTH_SIDES.NO_THE",
    "structuralSignature": [
      "prep",
      "on_both_sides",
      "no_the"
    ],
    "incorrectPattern": "in the",
    "correctPattern": "on",
    "explanationZhHant": "固定結構是 on both sides of...。 both 已限定兩邊，不在前面加入 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_ON_SIDE_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP ON_SIDE_OF",
    "formula": "PREP.ON_SIDE_OF",
    "structuralSignature": [
      "prep",
      "on_side_of"
    ],
    "incorrectPattern": "in the north side of",
    "correctPattern": "on the north side of",
    "explanationZhHant": "表示某物位於道路或區域的某一邊，用 on the north side of。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_OUTSIDE_WORKING_HOURS",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP OUTSIDE WORKING_HOURS",
    "formula": "PREP.OUTSIDE.WORKING_HOURS",
    "structuralSignature": [
      "prep",
      "outside",
      "working_hours"
    ],
    "incorrectPattern": "apart from working hours",
    "correctPattern": "outside working hours",
    "explanationZhHant": "表示「在工作時間以外」，用 outside working hours。 apart from 通常表示「除…… 之外」或「除了」，例如 Apart from Sunday, the office is open every day.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_OVER_PERIOD",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP OVER PERIOD",
    "formula": "PREP.OVER.PERIOD",
    "structuralSignature": [
      "prep",
      "over",
      "period"
    ],
    "incorrectPattern": "through the prediction",
    "correctPattern": "over the period",
    "explanationZhHant": "prediction 是預測內容，不是一段時間。表示數據在整個時間範圍內維持穩定，可用 over the period 或 throughout the period。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_OVER_THE_FOLLOWING_PERIOD",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP OVER_THE_FOLLOWING_PERIOD",
    "formula": "PREP.OVER_THE_FOLLOWING_PERIOD",
    "structuralSignature": [
      "prep",
      "over_the_following_period"
    ],
    "incorrectPattern": "During following thirty years",
    "correctPattern": "Over the following thirty years",
    "explanationZhHant": "the following thirty years 是特定時段，需要 the。描述整段期間的發展可用 over。 during 也可，但同樣需要 the。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_PAY_ATTENTION_TO",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP PAY_ATTENTION TO",
    "formula": "PREP.PAY_ATTENTION.TO",
    "structuralSignature": [
      "prep",
      "pay_attention",
      "to"
    ],
    "incorrectPattern": "pay attention on security",
    "correctPattern": "pay attention to security",
    "explanationZhHant": "固定搭配是 pay attention to + 名詞／動名詞。這裡的 to 是介詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_PAY_FOR_SERVICE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP PAY_FOR SERVICE",
    "formula": "PREP.PAY_FOR.SERVICE",
    "structuralSignature": [
      "prep",
      "pay_for",
      "service"
    ],
    "incorrectPattern": "pay long-term treatment",
    "correctPattern": "pay for long-term treatment",
    "explanationZhHant": "表示支付某項服務或物品的費用，用 pay for + 事物。 pay the bill 可直接接賓語，但 treatment 在這個意思下要寫 pay for treatment。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_PRESSURE_ON_SYSTEM",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP PRESSURE ON SYSTEM",
    "formula": "PREP.PRESSURE.ON.SYSTEM",
    "structuralSignature": [
      "prep",
      "pressure",
      "on",
      "system"
    ],
    "incorrectPattern": "to",
    "correctPattern": "on",
    "explanationZhHant": "表示某個系統承受負擔，用 pressure on + 系統／人。 pressure to do something 則表示做某事的壓力，例如 pressure to reduce costs。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_PROTECT_NP_FROM_NP",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP PROTECT NP FROM_NP",
    "formula": "PREP.PROTECT.NP.FROM_NP",
    "structuralSignature": [
      "prep",
      "protect",
      "np",
      "from_np"
    ],
    "incorrectPattern": "of",
    "correctPattern": "from",
    "explanationZhHant": "表示保護某人免受某事影響，用 protect + 人 + from + 事物。某些語境亦可用 protect against disease，但 protect someone of something 不成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_REGARDLESS_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP REGARDLESS_OF",
    "formula": "PREP.REGARDLESS_OF",
    "structuralSignature": [
      "prep",
      "regardless_of"
    ],
    "incorrectPattern": "Regardless these changes",
    "correctPattern": "Despite these changes",
    "explanationZhHant": "regardless 後面必須使用 of： regardless of these changes。 目標句採用同義而較精簡的 despite these changes。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_RELATIVE_TO_BASELINE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP RELATIVE_TO BASELINE",
    "formula": "PREP.RELATIVE_TO.BASELINE",
    "structuralSignature": [
      "prep",
      "relative_to",
      "baseline"
    ],
    "incorrectPattern": "comparing with its original share",
    "correctPattern": "relative to its share",
    "explanationZhHant": "表示計算以某個原有數值為基準，可用 relative to。也可寫 compared with its original share，但不能用沒有明確主動執行者的 comparing with。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_REPLY_TO_MESSAGE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP REPLY_TO MESSAGE",
    "formula": "PREP.REPLY_TO.MESSAGE",
    "structuralSignature": [
      "prep",
      "reply_to",
      "message"
    ],
    "incorrectPattern": "reply",
    "correctPattern": "reply to",
    "explanationZhHant": "reply 表示回覆某封訊息時，需要介詞 to。在 messages to reply to 中， messages 是 to 的邏輯賓語，因此介詞保留在不定詞末端。 reply to messages 也是正確的完整形式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_STAFF_IN_SHOP",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP STAFF IN_SHOP",
    "formula": "PREP.STAFF.IN_SHOP",
    "structuralSignature": [
      "prep",
      "staff",
      "in_shop"
    ],
    "incorrectPattern": "of",
    "correctPattern": "in",
    "explanationZhHant": "處某間店舖，用 staff in a shop。staff of a company 可表示屬於某公司的員工，但這裡重點是顧客在店內尋找員工。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_STAY_BEHIND_AT_WORK",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP STAY_BEHIND AT_WORK",
    "formula": "PREP.STAY_BEHIND.AT_WORK",
    "structuralSignature": [
      "prep",
      "stay_behind",
      "at_work"
    ],
    "incorrectPattern": "stay behind for work",
    "correctPattern": "stay behind at work",
    "explanationZhHant": "表示下班時間後仍留在工作場所，可寫 stay behind at work。stay behind for a meeting 則表示為了參加會議而留下，當中 for 引出目的。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_THROUGHOUT_NO_OF",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP THROUGHOUT NO_OF",
    "formula": "PREP.THROUGHOUT.NO_OF",
    "structuralSignature": [
      "prep",
      "throughout",
      "no_of"
    ],
    "incorrectPattern": "Throughout of the period",
    "correctPattern": "Over the period",
    "explanationZhHant": "throughout 直接接名詞，不加 of： throughout the period。本句也可寫 over the period。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_USED_AS_ROLE",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP USED_AS ROLE",
    "formula": "PREP.USED_AS.ROLE",
    "structuralSignature": [
      "prep",
      "used_as",
      "role"
    ],
    "incorrectPattern": "for",
    "correctPattern": "as",
    "explanationZhHant": "某地方直接充當某種設施時，用 used as + 身分／用途。used for 通常接動名詞或活動，例如 used for playing。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PREP_YEAR_IN",
    "category": "preposition",
    "titleZhHant": "文法規則：PREP YEAR IN",
    "formula": "PREP.YEAR.IN",
    "structuralSignature": [
      "prep",
      "year",
      "in"
    ],
    "incorrectPattern": "On 1995",
    "correctPattern": "In 1995",
    "explanationZhHant": "年份前使用 in。on 用於日期，例如 on 5 May 1995。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_AFTER_PREPOSITION_OBJECT_CASE",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN AFTER_PREPOSITION OBJECT_CASE",
    "formula": "PRONOUN.AFTER_PREPOSITION.OBJECT_CASE",
    "structuralSignature": [
      "pronoun",
      "after_preposition",
      "object_case"
    ],
    "incorrectPattern": "Between my neighbour and I",
    "correctPattern": "Between my neighbour and me",
    "explanationZhHant": "between 是介詞，後面的代名詞使用賓格 me，不用主格 I。公式：介詞 + 賓格代名詞。對照： My neighbour and I carried the tools，其中整個詞組是主語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN AMBIGUOUS_POSSESSIVE EXPLICIT_WORKERS",
    "formula": "PRONOUN.AMBIGUOUS_POSSESSIVE.EXPLICIT_WORKERS",
    "structuralSignature": [
      "pronoun",
      "ambiguous_possessive",
      "explicit_workers"
    ],
    "incorrectPattern": "their working efficiency",
    "correctPattern": "workers' working efficiency",
    "explanationZhHant": "their 可能指 employers、 workers 或前面的 some，指涉不清。根據論點，原意似乎是工人的工作效率，因此明確寫成 workers'working efficiency。若原意是僱主的效率，則應保留另一個版本。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_AMBIGUOUS_THEY_EXPLICIT_STAFF",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN AMBIGUOUS_THEY EXPLICIT_STAFF",
    "formula": "PRONOUN.AMBIGUOUS_THEY.EXPLICIT_STAFF",
    "structuralSignature": [
      "pronoun",
      "ambiguous_they",
      "explicit_staff"
    ],
    "incorrectPattern": "they",
    "correctPattern": "the staff",
    "explanationZhHant": "前面同時出現 passengers 和 staff，they 可能指任何一方或兩方。由於穿制服的是員工，應明確寫 the staff。 若上下文另有所指，系統應保留原句並要求確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_AMBIGUOUS_THEY_EXPLICIT_WORKERS",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN AMBIGUOUS_THEY EXPLICIT_WORKERS",
    "formula": "PRONOUN.AMBIGUOUS_THEY.EXPLICIT_WORKERS",
    "structuralSignature": [
      "pronoun",
      "ambiguous_they",
      "explicit_workers"
    ],
    "incorrectPattern": "as they have no obligation",
    "correctPattern": "as workers have no obligation",
    "explanationZhHant": "they 前面同時出現 employers 和 workers， 讀者不能安全確定所指對象。根據文章立場，應是 workers 沒有義務隨時工作，因此用明確名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_DOUBLE_GENITIVE_OF_MINE",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN DOUBLE_GENITIVE OF_MINE",
    "formula": "PRONOUN.DOUBLE_GENITIVE.OF_MINE",
    "structuralSignature": [
      "pronoun",
      "double_genitive",
      "of_mine"
    ],
    "incorrectPattern": "colleague of me",
    "correctPattern": "colleague of mine",
    "explanationZhHant": "a colleague of... 後面使用獨立所有格代名詞 mine，形成雙重所有格。也可寫 my colleague， 但兩者在語境上可能略有差別。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_POSSESSIVE_CUSTOMER_STAFF_NONPOSSESSION",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN POSSESSIVE CUSTOMER_STAFF NONPOSSESSION",
    "formula": "PRONOUN.POSSESSIVE.CUSTOMER_STAFF.NONPOSSESSION",
    "structuralSignature": [
      "pronoun",
      "possessive",
      "customer_staff",
      "nonpossession"
    ],
    "incorrectPattern": "their staff",
    "correctPattern": "staff",
    "explanationZhHant": "their 最自然會指向主語 customers，形成「顧客所擁有的員工」，不符合上下文。若意思是顧客辨認店內員工，直接寫 locate staff。 若指某公司的員工，可寫 locate the company 's staff。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_POSSESSIVE_DETERMINER_THEIR",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN POSSESSIVE_DETERMINER THEIR",
    "formula": "PRONOUN.POSSESSIVE_DETERMINER.THEIR",
    "structuralSignature": [
      "pronoun",
      "possessive_determiner",
      "their"
    ],
    "incorrectPattern": "theirs bosses",
    "correctPattern": "their bosses",
    "explanationZhHant": "名詞 bosses 前需要所有格限定詞 their。 theirs 是獨立所有格代名詞，後面不能再接名詞，例如 The decision is their s.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_REFLEXIVE_NOT_COORDINATED_SUBJECT",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN REFLEXIVE NOT_COORDINATED_SUBJECT",
    "formula": "PRONOUN.REFLEXIVE.NOT_COORDINATED_SUBJECT",
    "structuralSignature": [
      "pronoun",
      "reflexive",
      "not_coordinated_subject"
    ],
    "incorrectPattern": "Myself and the curator disagreed",
    "correctPattern": "The curator and I disagreed",
    "explanationZhHant": "反身代名詞 myself 不能只為了顯得正式而代替主格 I。整個並列詞組是主語，所以用 the curator and I。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_REFLEXIVE_REQUIRES_COREFERENCE",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN REFLEXIVE REQUIRES_COREFERENCE",
    "formula": "PRONOUN.REFLEXIVE.REQUIRES_COREFERENCE",
    "structuralSignature": [
      "pronoun",
      "reflexive",
      "requires_coreference"
    ],
    "incorrectPattern": "the chair asked myself",
    "correctPattern": "the chair asked me",
    "explanationZhHant": "反身代名詞要與同一分句的主語指向同一人，例如 I asked myself。這裡主語是 the chair，受詞是作者，所以用 me。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_RELATIVE_HUMAN_NONRESTRICTIVE_WHO",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN RELATIVE HUMAN_NONRESTRICTIVE WHO",
    "formula": "PRONOUN.RELATIVE.HUMAN_NONRESTRICTIVE.WHO",
    "structuralSignature": [
      "pronoun",
      "relative",
      "human_nonrestrictive",
      "who"
    ],
    "incorrectPattern": "which",
    "correctPattern": "who",
    "explanationZhHant": "先行詞 families 指人，所以非限制性關係分句使用 who。which 通常指事物；逗號後也不使用限制性關係代名詞 that。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_RELATIVE_HUMAN_WHO",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN RELATIVE HUMAN_WHO",
    "formula": "PRONOUN.RELATIVE.HUMAN_WHO",
    "structuralSignature": [
      "pronoun",
      "relative",
      "human_who"
    ],
    "incorrectPattern": "students which",
    "correctPattern": "students who",
    "explanationZhHant": "關係分句中作主語，通常使用 who。限制性關係分句中 that 也可成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_RELATIVE_SUBJECT_WHO_NOT_WHOM",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN RELATIVE SUBJECT WHO_NOT_WHOM",
    "formula": "PRONOUN.RELATIVE.SUBJECT.WHO_NOT_WHOM",
    "structuralSignature": [
      "pronoun",
      "relative",
      "subject",
      "who_not_whom"
    ],
    "incorrectPattern": "whom",
    "correctPattern": "who",
    "explanationZhHant": "關係代名詞在分句中是 can afford 的主語，所以用 who。 whom 用作賓語，例如 the families whom the programme supports。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_RELATIVE_WHOSE_POSSESSIVE",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN RELATIVE WHOSE POSSESSIVE",
    "formula": "PRONOUN.RELATIVE.WHOSE.POSSESSIVE",
    "structuralSignature": [
      "pronoun",
      "relative",
      "whose",
      "possessive"
    ],
    "incorrectPattern": "who's bicycle",
    "correctPattern": "whose bicycle",
    "explanationZhHant": "whose 表示「誰的」，在這裡修飾 bicycle。 who's 是 who is 或 who has 的縮寫。正確對照：Who's ready? = Who is ready?",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_THIS_CLAUSAL_REFERENCE",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN THIS CLAUSAL_REFERENCE",
    "formula": "PRONOUN.THIS.CLAUSAL_REFERENCE",
    "structuralSignature": [
      "pronoun",
      "this",
      "clausal_reference"
    ],
    "incorrectPattern": "it",
    "correctPattern": "this",
    "explanationZhHant": "it 容易被理解為指最近的 shop 或 staff。本句實際指「能迅速找到員工」這個整體情況，因此用 this 指回上一個分句。更明確的寫法是 this ease of identification will increase...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PRONOUN_WHOEVER_SUBJECT_CASE",
    "category": "pronoun",
    "titleZhHant": "文法規則：PRONOUN WHOEVER SUBJECT_CASE",
    "formula": "PRONOUN.WHOEVER.SUBJECT_CASE",
    "structuralSignature": [
      "pronoun",
      "whoever",
      "subject_case"
    ],
    "incorrectPattern": "Whomever wants",
    "correctPattern": "Whoever wants",
    "explanationZhHant": "融合關係詞在內部分句中是 wants 的主語，因此使用主格 whoever。 whomever 只適合在內部分句中擔任賓語的正式用法。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PSEUDOCLEFT_WHAT_CLAUSE_SINGULAR_IS",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：PSEUDOCLEFT WHAT_CLAUSE SINGULAR_IS",
    "formula": "PSEUDOCLEFT.WHAT_CLAUSE.SINGULAR_IS",
    "structuralSignature": [
      "pseudocleft",
      "what_clause",
      "singular_is"
    ],
    "incorrectPattern": "What the project now needs are a permanent funding arrangement",
    "correctPattern": "What the project now needs is a permanent funding arrangement",
    "explanationZhHant": "What the project now needs 是融合關係分句，在這裡指一項需要；後面的表語也是單數 a... arrangement，因此用 is。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_COLON_EXPLANATORY_MAIN_CLAUSE",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT COLON EXPLANATORY_MAIN_CLAUSE",
    "formula": "PUNCT.COLON.EXPLANATORY_MAIN_CLAUSE",
    "structuralSignature": [
      "punct",
      "colon",
      "explanatory_main_clause"
    ],
    "incorrectPattern": ",",
    "correctPattern": ":",
    "explanationZhHant": "前面的 imagine... 引出一個情境，後面的完整分句說明該情境造成的結果，因此可用冒號。若保留逗號，會把兩個獨立結構錯誤連接。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_COMMA_SPLICE_CAUSAL_SO",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT COMMA_SPLICE CAUSAL_SO",
    "formula": "PUNCT.COMMA_SPLICE.CAUSAL_SO",
    "structuralSignature": [
      "punct",
      "comma_splice",
      "causal_so"
    ],
    "incorrectPattern": ", personal outfits",
    "correctPattern": ", so personal outfits",
    "explanationZhHant": "前後是兩個完整主句，而且後句是前句的結果，因此加入 so。也可用分號，但分號不會明確標示因果關係。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_COMMA_SPLICE_COORDINATOR_AND",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT COMMA_SPLICE COORDINATOR_AND",
    "formula": "PUNCT.COMMA_SPLICE.COORDINATOR_AND",
    "structuralSignature": [
      "punct",
      "comma_splice",
      "coordinator_and"
    ],
    "incorrectPattern": "this",
    "correctPattern": "and this",
    "explanationZhHant": "前後都是完整主句，不能只用逗號連接。加入 and 後，兩個主句形成正確的並列結構。分號或句號也是可接受替代。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_COMMA_SPLICE_SEMICOLON",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT COMMA_SPLICE SEMICOLON",
    "formula": "PUNCT.COMMA_SPLICE.SEMICOLON",
    "structuralSignature": [
      "punct",
      "comma_splice",
      "semicolon"
    ],
    "incorrectPattern": ",",
    "correctPattern": ";",
    "explanationZhHant": "the final guest had already left 和 the coordinator still had three forms to check 都是完整主句，不能只用逗號連接。可用分號、句號，或加入 and／but 等連接詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_COORDINATED_INDEPENDENT_CLAUSES_COMMA",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT COORDINATED_INDEPENDENT_CLAUSES COMMA",
    "formula": "PUNCT.COORDINATED_INDEPENDENT_CLAUSES.COMMA",
    "structuralSignature": [
      "punct",
      "coordinated_independent_clauses",
      "comma"
    ],
    "incorrectPattern": "comparison",
    "correctPattern": "comparison,",
    "explanationZhHant": "school uniforms can... 和 they can cause... 都是完整主句，由 but 連接時，正式寫作通常在 but 前加逗號。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_HOWEVER_COMMA_LOWERCASE_IF",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT HOWEVER COMMA LOWERCASE_IF",
    "formula": "PUNCT.HOWEVER.COMMA.LOWERCASE_IF",
    "structuralSignature": [
      "punct",
      "however",
      "comma",
      "lowercase_if"
    ],
    "incorrectPattern": "However If",
    "correctPattern": "However, if",
    "explanationZhHant": "However 是句首連接副詞，後面加逗號。if 仍在同一句內，因此使用小寫。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT INTRODUCTORY_ADVERBIAL COMMA",
    "formula": "PUNCT.INTRODUCTORY_ADVERBIAL.COMMA",
    "structuralSignature": [
      "punct",
      "introductory_adverbial",
      "comma"
    ],
    "incorrectPattern": "Therefore",
    "correctPattern": "Therefore,",
    "explanationZhHant": "Therefore 在句首作連接副詞，正式寫作中通常以逗號與主句分隔。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_INTRODUCTORY_ADVERB_COMMA",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT INTRODUCTORY_ADVERB COMMA",
    "formula": "PUNCT.INTRODUCTORY_ADVERB.COMMA",
    "structuralSignature": [
      "punct",
      "introductory_adverb",
      "comma"
    ],
    "incorrectPattern": "Nowadays",
    "correctPattern": "Nowadays,",
    "explanationZhHant": "Nowadays 位於句首作時間副詞，正式寫作中通常在後面加逗號。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_INTRODUCTORY_LINKER_COMMA",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT INTRODUCTORY_LINKER COMMA",
    "formula": "PUNCT.INTRODUCTORY_LINKER.COMMA",
    "structuralSignature": [
      "punct",
      "introductory_linker",
      "comma"
    ],
    "incorrectPattern": "As a result",
    "correctPattern": "As a result,",
    "explanationZhHant": "As a result 是句首連接語，後面通常加逗號。後面的 but mentally still... 是省略了重複主語和助動詞的平行結構，本身可以成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_INTRODUCTORY_PREPOSITIONAL_PHRASE_COMMA",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT INTRODUCTORY_PREPOSITIONAL_PHRASE COMMA",
    "formula": "PUNCT.INTRODUCTORY_PREPOSITIONAL_PHRASE.COMMA",
    "structuralSignature": [
      "punct",
      "introductory_prepositional_phrase",
      "comma"
    ],
    "incorrectPattern": "after work",
    "correctPattern": "after work,",
    "explanationZhHant": "after work 位於主句前作時間狀語，加入逗號可清楚標示主句從 people 開始。短狀語的逗號有時可省略，但本句結構複雜，應保留。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_RESTRICTIVE_PREPOSITIONAL_PHRASE_NO_PARENTHESES",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT RESTRICTIVE_PREPOSITIONAL_PHRASE NO_PARENTHESES",
    "formula": "PUNCT.RESTRICTIVE_PREPOSITIONAL_PHRASE.NO_PARENTHESES",
    "structuralSignature": [
      "punct",
      "restrictive_prepositional_phrase",
      "no_parentheses"
    ],
    "incorrectPattern": "Italy,",
    "correctPattern": "Italy",
    "explanationZhHant": "in Italy 用來說明是哪一個國家的較年長組別，是必要的限定資料，不應用兩個逗號把它當作可刪除的插入語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "PUNCT_SENTENCE_FINAL_FULL_STOP",
    "category": "punctuation",
    "titleZhHant": "文法規則：PUNCT SENTENCE_FINAL FULL_STOP",
    "formula": "PUNCT.SENTENCE_FINAL.FULL_STOP",
    "structuralSignature": [
      "punct",
      "sentence_final",
      "full_stop"
    ],
    "incorrectPattern": "personal clothes",
    "correctPattern": "personal clothes.",
    "explanationZhHant": "完整陳述句結束時需要句號。段落換行本身不能取代句末標點。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_A_FEW_POSITIVE_SMALL_NUMBER",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER A_FEW POSITIVE_SMALL_NUMBER",
    "formula": "QUANTIFIER.A_FEW.POSITIVE_SMALL_NUMBER",
    "structuralSignature": [
      "quantifier",
      "a_few",
      "positive_small_number"
    ],
    "incorrectPattern": "Few",
    "correctPattern": "A few",
    "explanationZhHant": "a few 表示「有一些」，帶正面存在意思；few 表示「幾乎沒有」。根據本句要指出已有一些優秀作品，使用 a few。兩者都合文法，但意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_A_LITTLE_UNCOUNTABLE",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER A_LITTLE UNCOUNTABLE",
    "formula": "QUANTIFIER.A_LITTLE.UNCOUNTABLE",
    "structuralSignature": [
      "quantifier",
      "a_little",
      "uncountable"
    ],
    "incorrectPattern": "a few extra time",
    "correctPattern": "a little extra time",
    "explanationZhHant": "time 在此是不可數名詞，所以使用 a little， 不用修飾複數可數名詞的 a few。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_A_LITTLE_UNCOUNTABLE_POSITIVE",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER A_LITTLE UNCOUNTABLE_POSITIVE",
    "formula": "QUANTIFIER.A_LITTLE.UNCOUNTABLE_POSITIVE",
    "structuralSignature": [
      "quantifier",
      "a_little",
      "uncountable_positive"
    ],
    "incorrectPattern": "few",
    "correctPattern": "a little",
    "explanationZhHant": "a little 修飾不可數名詞，表示仍有少量可用。a little extra time 與前面的 little time 形成有意義的對照。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_FEW_LITTLE_UNCOUNTABLE_FUNDING",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER FEW_LITTLE UNCOUNTABLE_FUNDING",
    "formula": "QUANTIFIER.FEW_LITTLE.UNCOUNTABLE_FUNDING",
    "structuralSignature": [
      "quantifier",
      "few_little",
      "uncountable_funding"
    ],
    "incorrectPattern": "few funding",
    "correctPattern": "a little funding",
    "explanationZhHant": "funding 是不可數名詞，要用 little／ a little， 不用 few。原意是雖然資金不多，但仍有一些，因此選擇較正面的 a little。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_FEW_NEGATIVE_SMALL_NUMBER",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER FEW NEGATIVE_SMALL_NUMBER",
    "formula": "QUANTIFIER.FEW.NEGATIVE_SMALL_NUMBER",
    "structuralSignature": [
      "quantifier",
      "few",
      "negative_small_number"
    ],
    "incorrectPattern": "; a",
    "correctPattern": ";",
    "explanationZhHant": "後半句要表達能清楚解釋證據的人很少，因此用 few。若作者只是中性地說有幾人做到，a few 也正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_GREAT_DEAL_UNCOUNTABLE_NOT_APPLICATIONS",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER GREAT_DEAL UNCOUNTABLE_NOT_APPLICATIONS",
    "formula": "QUANTIFIER.GREAT_DEAL.UNCOUNTABLE_NOT_APPLICATIONS",
    "structuralSignature": [
      "quantifier",
      "great_deal",
      "uncountable_not_applications"
    ],
    "incorrectPattern": "a great deal of applications",
    "correctPattern": "a large number of applications",
    "explanationZhHant": "a great deal of 修飾不可數名詞； applications 是複數可數名詞，所以用 a large number of。對照： a great deal of interest。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_LESS_UNCOUNTABLE_NOT_LESSER",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER LESS UNCOUNTABLE_NOT_LESSER",
    "formula": "QUANTIFIER.LESS.UNCOUNTABLE_NOT_LESSER",
    "structuralSignature": [
      "quantifier",
      "less",
      "uncountable_not_lesser"
    ],
    "incorrectPattern": "lesser time",
    "correctPattern": "less time",
    "explanationZhHant": "表示不可數名詞數量較少，用 less time。 lesser 通常表示地位、程度或重要性較低，如 a lesser offence。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_LITTLE_NO_OF_BEFORE_NOUN",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER LITTLE NO_OF_BEFORE_NOUN",
    "formula": "QUANTIFIER.LITTLE.NO_OF_BEFORE_NOUN",
    "structuralSignature": [
      "quantifier",
      "little",
      "no_of_before_noun"
    ],
    "incorrectPattern": "little of time",
    "correctPattern": "little time",
    "explanationZhHant": "little 直接修飾不可數名詞： little time。只有在 little of the time 這種帶限定詞的結構中才使用 of。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_LITTLE_UNCOUNTABLE_SCARCITY",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER LITTLE UNCOUNTABLE_SCARCITY",
    "formula": "QUANTIFIER.LITTLE.UNCOUNTABLE_SCARCITY",
    "structuralSignature": [
      "quantifier",
      "little",
      "uncountable_scarcity"
    ],
    "incorrectPattern": "a few",
    "correctPattern": "little",
    "explanationZhHant": "time 在這裡是不可數名詞，所以不用 few。 little time 表示剩餘時間很少。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUANTIFIER_MORE_THAN_ONE",
    "category": "countability",
    "titleZhHant": "文法規則：QUANTIFIER MORE_THAN_ONE",
    "formula": "QUANTIFIER.MORE_THAN_ONE",
    "structuralSignature": [
      "quantifier",
      "more_than_one"
    ],
    "incorrectPattern": "more one form",
    "correctPattern": "more than one form",
    "explanationZhHant": "表示數量超過一個，固定結構是 more than one + 單數可數名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUESTION_DIRECT_WH_AUX_SUBJECT_ORDER",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：QUESTION DIRECT WH_AUX_SUBJECT_ORDER",
    "formula": "QUESTION.DIRECT.WH_AUX_SUBJECT_ORDER",
    "structuralSignature": [
      "question",
      "direct",
      "wh_aux_subject_order"
    ],
    "incorrectPattern": "Why the evening bus does stop",
    "correctPattern": "Why does the evening bus stop",
    "explanationZhHant": "直接疑問句使用疑問詞 + 助動詞 + 主語 + 動詞原形。 does 已承擔第三身單數標記，所以主要動詞用 stop。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUESTION_DIRECT_WH_OBJECT_DO_SUPPORT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：QUESTION DIRECT WH_OBJECT DO_SUPPORT",
    "formula": "QUESTION.DIRECT.WH_OBJECT.DO_SUPPORT",
    "structuralSignature": [
      "question",
      "direct",
      "wh_object",
      "do_support"
    ],
    "incorrectPattern": "Why the portal rejected",
    "correctPattern": "Why did the portal reject",
    "explanationZhHant": "這是直接問句， why 問原因而不是主語，所以一般過去式需要 did 倒裝；加入 did 後，主要動詞回到原形 reject。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUESTION_DOES_BASE_VERB",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：QUESTION DOES BASE_VERB",
    "formula": "QUESTION.DOES.BASE_VERB",
    "structuralSignature": [
      "question",
      "does",
      "base_verb"
    ],
    "incorrectPattern": "Does every reference has",
    "correctPattern": "Does every reference have",
    "explanationZhHant": "does 已承擔第三身單數和現在時標記，後面的主要動詞使用原形 have。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUESTION_TAG_POSITIVE_MAIN_NEGATIVE_TAG",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：QUESTION_TAG POSITIVE_MAIN NEGATIVE_TAG",
    "formula": "QUESTION_TAG.POSITIVE_MAIN.NEGATIVE_TAG",
    "structuralSignature": [
      "question_tag",
      "positive_main",
      "negative_tag"
    ],
    "incorrectPattern": "The app is working now, is it?",
    "correctPattern": "The app is working now, isn't it?",
    "explanationZhHant": "中性的確認問句通常由肯定主句配合否定附加問句： isn't it?。同極性的 is it? 可在驚訝、質疑或挑戰語氣中成立，因此不應忽略語調和語境。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "QUESTION_WH_SUBJECT_NO_DO_SUPPORT",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：QUESTION WH_SUBJECT NO_DO_SUPPORT",
    "formula": "QUESTION.WH_SUBJECT.NO_DO_SUPPORT",
    "structuralSignature": [
      "question",
      "wh_subject",
      "no_do_support"
    ],
    "incorrectPattern": "How many candidates did complete",
    "correctPattern": "How many candidates completed",
    "explanationZhHant": "how many candidates 本身是 completed 的主語。主語疑問句通常不使用 do／ does／ did。對照：How many forms did the candidates complete? 中，疑問詞問賓語，所以需要 did。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REFERENCE_AMBIGUOUS_IT_MULTIPLE_ANTECEDENTS",
    "category": "pronoun",
    "titleZhHant": "文法規則：REFERENCE AMBIGUOUS_IT MULTIPLE_ANTECEDENTS",
    "formula": "REFERENCE.AMBIGUOUS_IT.MULTIPLE_ANTECEDENTS",
    "structuralSignature": [
      "reference",
      "ambiguous_it",
      "multiple_antecedents"
    ],
    "incorrectPattern": "but it was faster",
    "correctPattern": "but the laptop was faster",
    "explanationZhHant": "前面有 scanner 和 laptop 兩個可能的單數先行詞，it 指涉不安全。系統只有在原意已記錄為 laptop 時才可明確改寫；否則應要求補充資料。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REFERENCE_CHAIN_MULTIPLE_IT_ABSTAIN",
    "category": "pronoun",
    "titleZhHant": "文法規則：REFERENCE CHAIN MULTIPLE_IT ABSTAIN",
    "formula": "REFERENCE.CHAIN.MULTIPLE_IT.ABSTAIN",
    "structuralSignature": [
      "reference",
      "chain",
      "multiple_it",
      "abstain"
    ],
    "incorrectPattern": "because it was unrealistic, although it had drafted it",
    "correctPattern": "because the timetable was unrealistic, although the committee itself had drafted it",
    "explanationZhHant": "三個 it 可能分別指 committee 或 timetable，單靠句子不能安全確定。目標句依據已記錄原意解開指涉；沒有原意資料時，預期行動應是 abstention。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REFERENCE_LATTER_SECOND_OF_TWO",
    "category": "pronoun",
    "titleZhHant": "文法規則：REFERENCE LATTER SECOND_OF_TWO",
    "formula": "REFERENCE.LATTER.SECOND_OF_TWO",
    "structuralSignature": [
      "reference",
      "latter",
      "second_of_two"
    ],
    "incorrectPattern": "the last",
    "correctPattern": "the latter",
    "explanationZhHant": "在剛提到的兩個群體中指第二個，可用 the latter。the last 通常指一個序列中最後的一項，不一定只是兩者中的第二者。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REFERENCE_ONE_ONES_ADJECTIVE_ELLIPSIS",
    "category": "pronoun",
    "titleZhHant": "文法規則：REFERENCE ONE_ONES ADJECTIVE_ELLIPSIS",
    "formula": "REFERENCE.ONE_ONES.ADJECTIVE_ELLIPSIS",
    "structuralSignature": [
      "reference",
      "one_ones",
      "adjective_ellipsis"
    ],
    "incorrectPattern": "the blue",
    "correctPattern": "the blue ones",
    "explanationZhHant": "blue 是形容詞；若省略複數名詞 folders，要用代名詞 ones 承接：the blue ones。 the rich 等指人群的名詞化形容詞是另一類結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REFERENCE_ONE_REPLACES_SINGULAR_COUNT_NOUN",
    "category": "pronoun",
    "titleZhHant": "文法規則：REFERENCE ONE REPLACES_SINGULAR_COUNT_NOUN",
    "formula": "REFERENCE.ONE.REPLACES_SINGULAR_COUNT_NOUN",
    "structuralSignature": [
      "reference",
      "one",
      "replaces_singular_count_noun"
    ],
    "incorrectPattern": "the blue",
    "correctPattern": "the blue one",
    "explanationZhHant": "省略已出現的單數可數名詞 route 時，用 one 承接：the blue one。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTED_SPEECH_BACKSHIFT_PAST_SIMPLE_TO_PAST_PERFECT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTED_SPEECH BACKSHIFT PAST_SIMPLE_TO_PAST_PERFECT",
    "formula": "REPORTED_SPEECH.BACKSHIFT.PAST_SIMPLE_TO_PAST_PERFECT",
    "structuralSignature": [
      "reported_speech",
      "backshift",
      "past_simple_to_past_perfect"
    ],
    "incorrectPattern": "failed",
    "correctPattern": "had failed",
    "explanationZhHant": "系統故障發生在她說話之前，因此使用過去完成式，清楚顯示兩個過去事件的先後次序。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTED_SPEECH BACKSHIFT PRESENT_PERFECT_TO_PAST_PERFECT",
    "formula": "REPORTED_SPEECH.BACKSHIFT.PRESENT_PERFECT_TO_PAST_PERFECT",
    "structuralSignature": [
      "reported_speech",
      "backshift",
      "present_perfect_to_past_perfect"
    ],
    "incorrectPattern": "has received",
    "correctPattern": "had received",
    "explanationZhHant": "主句使用過去式 said，而收取申請發生在說話之前，因此可回移為過去完成式 had received。如果內容仍屬當前有效事實，有時可以不回移。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTED_SPEECH DEICTIC LAST_TO_PREVIOUS",
    "formula": "REPORTED_SPEECH.DEICTIC.LAST_TO_PREVIOUS",
    "structuralSignature": [
      "reported_speech",
      "deictic",
      "last_to_previous"
    ],
    "incorrectPattern": "last",
    "correctPattern": "the previous",
    "explanationZhHant": "間接引述從較後的時間回顧說話內容時， last evening 常改為 the previous evening。若敘述時間仍與原說話時間相同，則不一定需要改。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTED_SPEECH_FUTURE_IN_PAST",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTED_SPEECH FUTURE_IN_PAST",
    "formula": "REPORTED_SPEECH.FUTURE_IN_PAST",
    "structuralSignature": [
      "reported_speech",
      "future_in_past"
    ],
    "incorrectPattern": "will begin",
    "correctPattern": "would begin",
    "explanationZhHant": "從過去敘述點描述其後發生的事情，可把 will 回移為 would。 如果九時的工作坊在報告當刻仍屬未來，保留 will 也可能合理。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTING_ASK_WHETHER_NO_THAT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTING ASK WHETHER NO_THAT",
    "formula": "REPORTING.ASK.WHETHER.NO_THAT",
    "structuralSignature": [
      "reporting",
      "ask",
      "whether",
      "no_that"
    ],
    "incorrectPattern": "asked that",
    "correctPattern": "asked",
    "explanationZhHant": "ask 後面的間接是非問句直接由 whether 或 if 引出，不同時使用 that。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTING_DENY_GERUND",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTING DENY GERUND",
    "formula": "REPORTING.DENY.GERUND",
    "structuralSignature": [
      "reporting",
      "deny",
      "gerund"
    ],
    "incorrectPattern": "to share",
    "correctPattern": "sharing",
    "explanationZhHant": "deny 表示否認做過某事時，後面接動名詞： deny doing。 也可接 that 分句，例如 denied that she had shared the files。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTING_PROMISE_SPEAKER_TO_INFINITIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTING PROMISE SPEAKER_TO_INFINITIVE",
    "formula": "REPORTING.PROMISE.SPEAKER_TO_INFINITIVE",
    "structuralSignature": [
      "reporting",
      "promise",
      "speaker_to_infinitive"
    ],
    "incorrectPattern": "promised each applicant to contact them",
    "correctPattern": "promised to contact each applicant",
    "explanationZhHant": "做出承諾的人也是執行聯絡的人，因此用 promise to + 動詞。 promise someone to do 不能表示說話者承諾自己做事。也可寫 promised each applicant that she would contact them。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTING_SAY_TELL_TELL_PERSON_THAT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTING SAY_TELL TELL_PERSON_THAT",
    "formula": "REPORTING.SAY_TELL.TELL_PERSON_THAT",
    "structuralSignature": [
      "reporting",
      "say_tell",
      "tell_person_that"
    ],
    "incorrectPattern": "said",
    "correctPattern": "told",
    "explanationZhHant": "tell 可直接接聽者： tell someone that...。say 若要加入聽者，通常寫 say to someone that...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "REPORTING_WARN_NP_NOT_TO_INFINITIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：REPORTING WARN NP NOT_TO_INFINITIVE",
    "formula": "REPORTING.WARN.NP.NOT_TO_INFINITIVE",
    "structuralSignature": [
      "reporting",
      "warn",
      "np",
      "not_to_infinitive"
    ],
    "incorrectPattern": "do not",
    "correctPattern": "not to",
    "explanationZhHant": "表示警告某人不要做某事，用 warn + 人 + not to + 動詞原形。 另一個正確結構是 warn someone against doing something。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "RESPONSE_NEITHER_AUXILIARY_INVERSION",
    "category": "sentence_structure",
    "titleZhHant": "文法規則：RESPONSE NEITHER AUXILIARY_INVERSION",
    "formula": "RESPONSE.NEITHER.AUXILIARY_INVERSION",
    "structuralSignature": [
      "response",
      "neither",
      "auxiliary_inversion"
    ],
    "incorrectPattern": "Neither I do",
    "correctPattern": "Neither do I",
    "explanationZhHant": "表示自己也不具備前述情況，用 Neither + 助動詞 + 主語。對照肯定回應：So do I.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SPELLING_EMPLOYEES",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：SPELLING EMPLOYEES",
    "formula": "SPELLING.EMPLOYEES",
    "structuralSignature": [
      "spelling",
      "employees"
    ],
    "incorrectPattern": "employess",
    "correctPattern": "employees",
    "explanationZhHant": "正確拼法是 employees。這是拼字問題，不是句法規則。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SPELLING_LARGER",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：SPELLING LARGER",
    "formula": "SPELLING.LARGER",
    "structuralSignature": [
      "spelling",
      "larger"
    ],
    "incorrectPattern": "lager",
    "correctPattern": "larger",
    "explanationZhHant": "表示比例較大，要寫 larger。lager 是一種啤酒，屬於另一個真實英文詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SPELLING_RESOLVE",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：SPELLING RESOLVE",
    "formula": "SPELLING.RESOLVE",
    "structuralSignature": [
      "spelling",
      "resolve"
    ],
    "incorrectPattern": "reslove",
    "correctPattern": "resolve",
    "explanationZhHant": "正確拼法是 resolve。這是拼字問題，不是句法規則。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SPELLING_RETAIL",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：SPELLING RETAIL",
    "formula": "SPELLING.RETAIL",
    "structuralSignature": [
      "spelling",
      "retail"
    ],
    "incorrectPattern": "retai",
    "correctPattern": "retail",
    "explanationZhHant": "正確拼法是 retail。這是拼字問題，不是句法規則。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SPELLING_WINTER",
    "category": "spelling_or_spacing",
    "titleZhHant": "文法規則：SPELLING WINTER",
    "formula": "SPELLING.WINTER",
    "structuralSignature": [
      "spelling",
      "winter"
    ],
    "incorrectPattern": "the winnter",
    "correctPattern": "winter",
    "explanationZhHant": "正確拼法是 winter。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_A_NUMBER_OF_PLURAL_VERB",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA A_NUMBER_OF PLURAL_VERB",
    "formula": "SVA.A_NUMBER_OF.PLURAL_VERB",
    "structuralSignature": [
      "sva",
      "a_number_of",
      "plural_verb"
    ],
    "incorrectPattern": "A number of applications was",
    "correctPattern": "A number of applications were",
    "explanationZhHant": "a number of + 複數名詞表示若干個，意思接近 several， 因此使用複數動詞。不要與 the number of 混淆。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_DATA_ACADEMIC_PLURAL",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA DATA ACADEMIC_PLURAL",
    "formula": "SVA.DATA.ACADEMIC_PLURAL",
    "structuralSignature": [
      "sva",
      "data",
      "academic_plural"
    ],
    "incorrectPattern": "the data was limited",
    "correctPattern": "the data were limited",
    "explanationZhHant": "正式學術語境可把 data 視為 datum 的複數，因此用 were。 現代一般英文亦常把 data 當集合或不可數名詞並配合 was，不可一律拒絕。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_EITHER_OR_NEAREST_SUBJECT",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA EITHER_OR NEAREST_SUBJECT",
    "formula": "SVA.EITHER_OR.NEAREST_SUBJECT",
    "structuralSignature": [
      "sva",
      "either_or",
      "nearest_subject"
    ],
    "incorrectPattern": "Either the interns or the archivist are",
    "correctPattern": "Either the interns or the archivist is",
    "explanationZhHant": "在 either A or B 結構中，動詞通常配合較接近它的主語。最近的是單數 archivist，所以用 is。為避免不自然，也可改寫為 Either the archivist or the interns are...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_EXISTENTIAL_THERE_SINGULAR_HEAD_IS",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA EXISTENTIAL THERE SINGULAR_HEAD IS",
    "formula": "SVA.EXISTENTIAL.THERE.SINGULAR_HEAD.IS",
    "structuralSignature": [
      "sva",
      "existential",
      "there",
      "singular_head",
      "is"
    ],
    "incorrectPattern": "there are a loss",
    "correctPattern": "there is a loss",
    "explanationZhHant": "存現句的動詞要配合後面的真正主語。a loss 是單數，因此使用 there is，不用 there are。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_FRACTION_PLURAL_HEAD_PLURAL",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA FRACTION PLURAL_HEAD PLURAL",
    "formula": "SVA.FRACTION.PLURAL_HEAD.PLURAL",
    "structuralSignature": [
      "sva",
      "fraction",
      "plural_head",
      "plural"
    ],
    "incorrectPattern": "half of the volunteers was",
    "correctPattern": "half of the volunteers were",
    "explanationZhHant": "volunteers 是複數，因此 half of the volunteers 配合複數動詞 were。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_FRACTION_UNCOUNTABLE_HEAD_SINGULAR",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA FRACTION UNCOUNTABLE_HEAD SINGULAR",
    "formula": "SVA.FRACTION.UNCOUNTABLE_HEAD.SINGULAR",
    "structuralSignature": [
      "sva",
      "fraction",
      "uncountable_head",
      "singular"
    ],
    "incorrectPattern": "two-thirds of the equipment were",
    "correctPattern": "two-thirds of the equipment was",
    "explanationZhHant": "分數結構的動詞配合 of 後面的名詞。 equipment 是不可數單數，所以用 was。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_MEASURE_DISTANCE_SINGULAR",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA MEASURE DISTANCE SINGULAR",
    "formula": "SVA.MEASURE.DISTANCE.SINGULAR",
    "structuralSignature": [
      "sva",
      "measure",
      "distance",
      "singular"
    ],
    "incorrectPattern": "Ten kilometres are too far",
    "correctPattern": "Ten kilometres is too far",
    "explanationZhHant": "一段距離被視為一個整體量度時，使用單數動詞。比較： Ten kilometres of roads were repaired 中，主語是複數道路。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_MEASURE_MONEY_AMOUNT_SINGULAR",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA MEASURE MONEY_AMOUNT SINGULAR",
    "formula": "SVA.MEASURE.MONEY_AMOUNT.SINGULAR",
    "structuralSignature": [
      "sva",
      "measure",
      "money_amount",
      "singular"
    ],
    "incorrectPattern": "three hundred pounds were enough",
    "correctPattern": "three hundred pounds was enough",
    "explanationZhHant": "一筆金額被視為一個整體數量時，用單數動詞 was。若指多枚實體硬幣，複數動詞才可能合適。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_MORE_THAN_ONE_SINGULAR_NOUN_VERB",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA MORE_THAN_ONE SINGULAR_NOUN_VERB",
    "formula": "SVA.MORE_THAN_ONE.SINGULAR_NOUN_VERB",
    "structuralSignature": [
      "sva",
      "more_than_one",
      "singular_noun_verb"
    ],
    "incorrectPattern": "More than one volunteers were",
    "correctPattern": "More than one volunteer was",
    "explanationZhHant": "固定結構 more than one 後面使用單數可數名詞，並通常配合單數動詞：more than one volunteer was...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_NEWS_SINGULAR",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA NEWS SINGULAR",
    "formula": "SVA.NEWS.SINGULAR",
    "structuralSignature": [
      "sva",
      "news",
      "singular"
    ],
    "incorrectPattern": "The news were welcomed",
    "correctPattern": "The news was welcomed",
    "explanationZhHant": "news 雖然以 s 結尾，但在標準英文中是不可數單數名詞，因此配合 was。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_ONE_OF_THOSE_WHO_PLURAL_RELATIVE_VERB",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA ONE_OF_THOSE_WHO PLURAL_RELATIVE_VERB",
    "formula": "SVA.ONE_OF_THOSE_WHO.PLURAL_RELATIVE_VERB",
    "structuralSignature": [
      "sva",
      "one_of_those_who",
      "plural_relative_verb"
    ],
    "incorrectPattern": "one of those assistants who works",
    "correctPattern": "one of those assistants who work",
    "explanationZhHant": "關係代名詞 who 的先行詞是複數 those assistants，所以關係分句用 work。Lena 是這群會留至很晚工作的助理之一。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PAST_PLURAL_SUBJECT_WERE",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PAST PLURAL_SUBJECT WERE",
    "formula": "SVA.PAST.PLURAL_SUBJECT.WERE",
    "structuralSignature": [
      "sva",
      "past",
      "plural_subject",
      "were"
    ],
    "incorrectPattern": "that was",
    "correctPattern": "that were",
    "explanationZhHant": "關係分句的主語是複數 books， 所以 be 的過去式用 were。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PAST_SINGULAR_SUBJECT_WAS",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PAST SINGULAR_SUBJECT WAS",
    "formula": "SVA.PAST.SINGULAR_SUBJECT.WAS",
    "structuralSignature": [
      "sva",
      "past",
      "singular_subject",
      "was"
    ],
    "incorrectPattern": "were",
    "correctPattern": "was",
    "explanationZhHant": "fridge 單數主語，be 的過去式用 was，所以寫 our fridge was。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_POSSESSIVE_THEIR_SINGULAR_HEAD_WAS",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA POSSESSIVE_THEIR SINGULAR_HEAD_WAS",
    "formula": "SVA.POSSESSIVE_THEIR.SINGULAR_HEAD_WAS",
    "structuralSignature": [
      "sva",
      "possessive_their",
      "singular_head_was"
    ],
    "incorrectPattern": "their address were",
    "correctPattern": "their address was",
    "explanationZhHant": "動詞與中心名詞 address 配合，而不是與所有格限定詞 their 配合。每名參與者有一個地址，因此用單數 was。單數 they／ their 不要求後面的名詞和動詞變成複數。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PRESENT_COMPOUND_SUBJECT_ARE",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PRESENT COMPOUND_SUBJECT ARE",
    "formula": "SVA.PRESENT.COMPOUND_SUBJECT.ARE",
    "structuralSignature": [
      "sva",
      "present",
      "compound_subject",
      "are"
    ],
    "incorrectPattern": "work stress and financial pressure is",
    "correctPattern": "work stress and financial pressure are",
    "explanationZhHant": "work stress 和 financial pressure 由 and 連接，形成複合複數主語，所以使用 are。若兩個名詞被視為同一個不可分概念，單數才偶爾可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PRESENT_NEITHER_SINGULAR_S_FORM",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PRESENT NEITHER_SINGULAR S_FORM",
    "formula": "SVA.PRESENT.NEITHER_SINGULAR.S_FORM",
    "structuralSignature": [
      "sva",
      "present",
      "neither_singular",
      "s_form"
    ],
    "incorrectPattern": "include",
    "correctPattern": "includes",
    "explanationZhHant": "neither route 按單數主語處理，所以一般現在式動詞用 includes。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PRESENT_SINGULAR_GOVERNMENT_S_FORM",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PRESENT SINGULAR_GOVERNMENT S_FORM",
    "formula": "SVA.PRESENT.SINGULAR_GOVERNMENT.S_FORM",
    "structuralSignature": [
      "sva",
      "present",
      "singular_government",
      "s_form"
    ],
    "incorrectPattern": "set",
    "correctPattern": "sets",
    "explanationZhHant": "the government 在本句視為單數機構，一般現在式動詞用 sets。英式英文有時可把集體名詞視為複數，但本句聚焦政府作為一個政策制定者。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PRESENT_SINGULAR_HEAD_OF_PHRASE",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PRESENT SINGULAR_HEAD OF_PHRASE",
    "formula": "SVA.PRESENT.SINGULAR_HEAD.OF_PHRASE",
    "structuralSignature": [
      "sva",
      "present",
      "singular_head",
      "of_phrase"
    ],
    "incorrectPattern": "are",
    "correctPattern": "is",
    "explanationZhHant": "真正的主語中心詞是單數 list；of places 只是修飾語，所以寫 The list… is。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_PRESENT_UNCOUNTABLE_SUBJECT_SINGULAR_BE",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA PRESENT UNCOUNTABLE_SUBJECT SINGULAR_BE",
    "formula": "SVA.PRESENT.UNCOUNTABLE_SUBJECT.SINGULAR_BE",
    "structuralSignature": [
      "sva",
      "present",
      "uncountable_subject",
      "singular_be"
    ],
    "incorrectPattern": "are",
    "correctPattern": "is",
    "explanationZhHant": "equipment 是不可數名詞，按單數處理，所以寫 The equipment is。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_RELATIVE_SINGULAR_ANTECEDENT_S_FORM",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA RELATIVE SINGULAR_ANTECEDENT S_FORM",
    "formula": "SVA.RELATIVE.SINGULAR_ANTECEDENT.S_FORM",
    "structuralSignature": [
      "sva",
      "relative",
      "singular_antecedent",
      "s_form"
    ],
    "incorrectPattern": "coordinator who know",
    "correctPattern": "coordinator who knows",
    "explanationZhHant": "who 指回單數 coordinator，因此一般現在式用第三身單數 knows。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_THE_NUMBER_OF_SINGULAR_VERB",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA THE_NUMBER_OF SINGULAR_VERB",
    "formula": "SVA.THE_NUMBER_OF.SINGULAR_VERB",
    "structuralSignature": [
      "sva",
      "the_number_of",
      "singular_verb"
    ],
    "incorrectPattern": "the number of rejections were",
    "correctPattern": "the number of rejections was",
    "explanationZhHant": "the number of... 的中心詞是單數 number，所以用單數動詞 was。後面的複數 rejections 不控制動詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "SVA_TOGETHER_WITH_HEAD_SUBJECT",
    "category": "subject_verb_agreement",
    "titleZhHant": "文法規則：SVA TOGETHER_WITH HEAD_SUBJECT",
    "formula": "SVA.TOGETHER_WITH.HEAD_SUBJECT",
    "structuralSignature": [
      "sva",
      "together_with",
      "head_subject"
    ],
    "incorrectPattern": ", together with two interns, have prepared",
    "correctPattern": ", together with two interns, has prepared",
    "explanationZhHant": "together with two interns 是附加資料，不會把主語變成複數。真正的中心主語是單數 coordinator，所以用 has。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_BEFORE_FUTURE_EVENT_PRESENT_SIMPLE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE BEFORE FUTURE_EVENT PRESENT_SIMPLE",
    "formula": "TENSE.BEFORE.FUTURE_EVENT.PRESENT_SIMPLE",
    "structuralSignature": [
      "tense",
      "before",
      "future_event",
      "present_simple"
    ],
    "incorrectPattern": "rainy season began",
    "correctPattern": "rainy season begins",
    "explanationZhHant": "本句談論尚未來臨的雨季。before 引出的未來時間分句通常用一般現在式，不用過去式。若整段談論過去事件， began 才可能正確。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_CHART_EXPECTED_TO_REMAIN",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE CHART EXPECTED_TO_REMAIN",
    "formula": "TENSE.CHART.EXPECTED_TO_REMAIN",
    "structuralSignature": [
      "tense",
      "chart",
      "expected_to_remain"
    ],
    "incorrectPattern": "keep being",
    "correctPattern": "is expected to remain",
    "explanationZhHant": "主語 age group 是單數，因此原本至少要寫 keeps； 但本句同時描述 2050 年的預測，正式圖表寫作更適合使用 is expected to remain。keeps being 在某些一般語境中可以成立，但不適合這個預測框架。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_FUTURE_PERFECT_BY_DEADLINE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE FUTURE_PERFECT BY_DEADLINE",
    "formula": "TENSE.FUTURE_PERFECT.BY_DEADLINE",
    "structuralSignature": [
      "tense",
      "future_perfect",
      "by_deadline"
    ],
    "incorrectPattern": "take",
    "correctPattern": "have taken",
    "explanationZhHant": "By next June 表示在未來期限之前完成接管，所以使用未來完成式：will have + 過去分詞。若意思是「正正在六月接管」，簡單將來式才可能合適。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_GENERAL_PRESENT_CONSISTENCY",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE GENERAL_PRESENT CONSISTENCY",
    "formula": "TENSE.GENERAL_PRESENT.CONSISTENCY",
    "structuralSignature": [
      "tense",
      "general_present",
      "consistency"
    ],
    "incorrectPattern": "dressed",
    "correctPattern": "dress",
    "explanationZhHant": "這段描述一般校園情況，而不是一次已完成的過去事件，因此使用一般現在式 dress。 若整段是在敘述過去某一天， dressed 才可能適合。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_IF_PRESENT_FINITE_VERB",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE IF_PRESENT FINITE_VERB",
    "formula": "TENSE.IF_PRESENT.FINITE_VERB",
    "structuralSignature": [
      "tense",
      "if_present",
      "finite_verb"
    ],
    "incorrectPattern": "wearing",
    "correctPattern": "wear",
    "explanationZhHant": "if 後面需要一個完整有限分句。主語是 the staff， 所以使用一般現在式 wear。 單獨的 wearing 不能作這個條件分句的謂語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_MAP_COMPLETED_PERIOD_PAST_SIMPLE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE MAP COMPLETED_PERIOD PAST_SIMPLE",
    "formula": "TENSE.MAP.COMPLETED_PERIOD.PAST_SIMPLE",
    "structuralSignature": [
      "tense",
      "map",
      "completed_period",
      "past_simple"
    ],
    "incorrectPattern": "has changed",
    "correctPattern": "changed",
    "explanationZhHant": "1995 至 2025 是已完成的歷史時段，因此用一般過去式描述已發生的改變。若其中一幅圖表示現在，而改變延續至今，現在完成式才可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PAST_DATA_YEAR_WAS",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PAST DATA_YEAR WAS",
    "formula": "TENSE.PAST.DATA_YEAR.WAS",
    "structuralSignature": [
      "tense",
      "past",
      "data_year",
      "was"
    ],
    "incorrectPattern": "is",
    "correctPattern": "was",
    "explanationZhHant": "句子明確描述 2000 年的情況，因此使用過去式 was。後面的 2050 年預測則使用將來或預測結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PAST_PERFECT_BY_THE_TIME_EARLIER_EVENT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PAST_PERFECT BY_THE_TIME EARLIER_EVENT",
    "formula": "TENSE.PAST_PERFECT.BY_THE_TIME.EARLIER_EVENT",
    "structuralSignature": [
      "tense",
      "past_perfect",
      "by_the_time",
      "earlier_event"
    ],
    "incorrectPattern": "already left",
    "correctPattern": "had already left",
    "explanationZhHant": "關門和最後一位訪客離開都是過去事件，而訪客離開發生得更早，所以用過去完成式 had left。公式：較早的過去事件用 had + 過去分詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PAST_PERFECT_REQUIRES_PAST_REFERENCE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PAST_PERFECT REQUIRES_PAST_REFERENCE",
    "formula": "TENSE.PAST_PERFECT.REQUIRES_PAST_REFERENCE",
    "structuralSignature": [
      "tense",
      "past_perfect",
      "requires_past_reference"
    ],
    "incorrectPattern": "had risen steadily",
    "correctPattern": "rose steadily",
    "explanationZhHant": "過去完成式通常需要另一個較後的過去參考點。本句只是按時間順序描述圖表數據，因此使用一般過去式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PAST_SIMPLE_FINISHED_TIME",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PAST_SIMPLE FINISHED_TIME",
    "formula": "TENSE.PAST_SIMPLE.FINISHED_TIME",
    "structuralSignature": [
      "tense",
      "past_simple",
      "finished_time"
    ],
    "incorrectPattern": "has begun",
    "correctPattern": "began",
    "explanationZhHant": "in September 2023 是已完成的明確過去時間，一般使用過去式 began， 不用現在完成式。公式：明確過去時間 + 過去式。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PRESENT_PERFECT_CHANGE_TO_PRESENT_STATE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PRESENT_PERFECT CHANGE_TO_PRESENT_STATE",
    "formula": "TENSE.PRESENT_PERFECT.CHANGE_TO_PRESENT_STATE",
    "structuralSignature": [
      "tense",
      "present_perfect",
      "change_to_present_state"
    ],
    "incorrectPattern": "work become",
    "correctPattern": "work has become",
    "explanationZhHant": "工作發展至今已成為生活的一部分，因此目標句使用現在完成式 has become。 work 是單數不可數主語，所以不能直接接 become。 若原意是一般規律，work becomes 也可成立，故應保留為可接受替代。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PRESENT_PERFECT_PASSIVE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PRESENT_PERFECT PASSIVE",
    "formula": "TENSE.PRESENT_PERFECT.PASSIVE",
    "structuralSignature": [
      "tense",
      "present_perfect",
      "passive"
    ],
    "incorrectPattern": "damage has done",
    "correctPattern": "damage has been done",
    "explanationZhHant": "damage 是被造成的，所以現在完成式要使用被動結構： has been + 過去分詞。主動句需要有施事者，例如 The delay has done serious damage.",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PRESENT_PERFECT_PROGRESSIVE_FOR_DURATION",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PRESENT_PERFECT_PROGRESSIVE FOR_DURATION",
    "formula": "TENSE.PRESENT_PERFECT_PROGRESSIVE.FOR_DURATION",
    "structuralSignature": [
      "tense",
      "present_perfect_progressive",
      "for_duration"
    ],
    "incorrectPattern": "reviewed",
    "correctPattern": "has been reviewing",
    "explanationZhHant": "For the past three months 表示活動由過去持續至現在，並強調過程，因此使用現在完成進行式。若工作已經全部完成，其他時態才可能成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PRESENT_PERFECT_SINCE_PAST_POINT",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PRESENT_PERFECT SINCE_PAST_POINT",
    "formula": "TENSE.PRESENT_PERFECT.SINCE_PAST_POINT",
    "structuralSignature": [
      "tense",
      "present_perfect",
      "since_past_point"
    ],
    "incorrectPattern": "Since the trial began, the college collected",
    "correctPattern": "Since the trial began, the college has collected",
    "explanationZhHant": "since + 過去起點通常與現在完成式配合，表示由試行開始至現在所累積的結果。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PRESENT_PERFECT_SINCE_THEN",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PRESENT_PERFECT SINCE_THEN",
    "formula": "TENSE.PRESENT_PERFECT.SINCE_THEN",
    "structuralSignature": [
      "tense",
      "present_perfect",
      "since_then"
    ],
    "incorrectPattern": "Since then, the scheme attracted",
    "correctPattern": "Since then, the scheme has attracted",
    "explanationZhHant": "Since then 表示由過去某點延續至現在，通常使用現在完成式：has attracted。若敘述的參考時間也在過去，過去完成式可能更合適。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PROJECTION_EXPECTED_TO_BECOME",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PROJECTION EXPECTED_TO_BECOME",
    "formula": "TENSE.PROJECTION.EXPECTED_TO_BECOME",
    "structuralSignature": [
      "tense",
      "projection",
      "expected_to_become"
    ],
    "incorrectPattern": "keep diversifying",
    "correctPattern": "is expected to become more pronounced",
    "explanationZhHant": "diversify 通常表示種類變得更多，不適合直接描述兩國差異擴大。 2050 年亦是預測數據，因此使用 is expected to + 動詞原形。若原意只是差異持續存在，也可寫 is expected to continue。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PROJECTION_IS_PROJECTED_TO_DOUBLE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PROJECTION IS_PROJECTED_TO_DOUBLE",
    "formula": "TENSE.PROJECTION.IS_PROJECTED_TO_DOUBLE",
    "structuralSignature": [
      "tense",
      "projection",
      "is_projected_to_double"
    ],
    "incorrectPattern": "almost doubled",
    "correctPattern": "is projected to almost double",
    "explanationZhHant": "42.3% 是 2050 年的預測值，因此不能使用表示已完成過去事件的 doubled。使用 is projected to + 動詞原形表達預測。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_PROJECTION_REMAIN_STABLE",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE PROJECTION REMAIN_STABLE",
    "formula": "TENSE.PROJECTION.REMAIN_STABLE",
    "structuralSignature": [
      "tense",
      "projection",
      "remain_stable"
    ],
    "incorrectPattern": "has nearly remain unchanged",
    "correctPattern": "is projected to remain relatively stable",
    "explanationZhHant": "has 後面本應使用過去分詞 remained，但本句包含 2050 年預測，因此現在完成式亦不合適。目標句使用 is projected to remain。 relatively stable 也容許比例有輕微變化。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TENSE_UNTIL_PRESENT_PERFECT_NOT_WILL",
    "category": "verb_form_or_tense",
    "titleZhHant": "文法規則：TENSE UNTIL PRESENT_PERFECT NOT_WILL",
    "formula": "TENSE.UNTIL.PRESENT_PERFECT.NOT_WILL",
    "structuralSignature": [
      "tense",
      "until",
      "present_perfect",
      "not_will"
    ],
    "incorrectPattern": "will be implemented",
    "correctPattern": "have been implemented",
    "explanationZhHant": "until 引出的未來時間分句一般不用 will。現在完成式強調所有建議先完成： until… have been implemented。另一個正確寫法是 until all recommendations are implemented。間接問句則可以用 will，例如 We do not know when they will be implemented。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "TIME_CHART_TWO_SNAPSHOTS_IN_BOTH_YEARS",
    "category": "word_choice",
    "titleZhHant": "文法規則：TIME CHART TWO_SNAPSHOTS IN_BOTH_YEARS",
    "formula": "TIME.CHART.TWO_SNAPSHOTS.IN_BOTH_YEARS",
    "structuralSignature": [
      "time",
      "chart",
      "two_snapshots",
      "in_both_years"
    ],
    "incorrectPattern": "from 2000 to 2050",
    "correctPattern": "in both 2000 and 2050",
    "explanationZhHant": "圖表只提供 2000 和 2050 兩個時間點時， in both 2000 and 2050 不會暗示中間每一年都有數據。若圖表真的展示連續趨勢， from 2000 to 2050 可以保留。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS",
    "category": "word_choice",
    "titleZhHant": "文法規則：UNIT PERCENTAGE_POINTS NOT_PER_CENT_POINTS",
    "formula": "UNIT.PERCENTAGE_POINTS.NOT_PER_CENT_POINTS",
    "structuralSignature": [
      "unit",
      "percentage_points",
      "not_per_cent_points"
    ],
    "incorrectPattern": "per cent",
    "correctPattern": "percentage",
    "explanationZhHant": "兩個百分比之間的絕對差使用 percentage points。 由 45% 降至 20% 是下降 25 percentage points。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "UNIT_PER_CENT_INVARIABLE",
    "category": "word_choice",
    "titleZhHant": "文法規則：UNIT PER_CENT INVARIABLE",
    "formula": "UNIT.PER_CENT.INVARIABLE",
    "structuralSignature": [
      "unit",
      "per_cent",
      "invariable"
    ],
    "incorrectPattern": "50 per cents",
    "correctPattern": "50 per cent",
    "explanationZhHant": "per cent 在數字後不加複數 s：one per cent、50 percent。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_AFFORD_DIRECT_OBJECT_NO_FOR",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB AFFORD DIRECT_OBJECT NO_FOR",
    "formula": "VERB.AFFORD.DIRECT_OBJECT.NO_FOR",
    "structuralSignature": [
      "verb",
      "afford",
      "direct_object",
      "no_for"
    ],
    "incorrectPattern": "for private",
    "correctPattern": "private",
    "explanationZhHant": "afford 作動詞時直接接所能負擔的事物，不加 for。對照：pay for private care 使用 for，因為動詞是 pay。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_AGREE_THAT_FINITE_CLAUSE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB AGREE THAT_FINITE_CLAUSE",
    "formula": "VERB.AGREE.THAT_FINITE_CLAUSE",
    "structuralSignature": [
      "verb",
      "agree",
      "that_finite_clause"
    ],
    "incorrectPattern": "agree with preventing illness is",
    "correctPattern": "agree that preventing illness is",
    "explanationZhHant": "agree 接完整內容分句時，用 agree that + 主語 + 動詞。agree with 通常接人、意見或名詞詞組，例如 agree with the proposal；不能在 with 後直接接 preventing illness is... 這類完整分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_ALLOW_NP_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB ALLOW NP TO_INFINITIVE",
    "formula": "VERB.ALLOW.NP.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "allow",
      "np",
      "to_infinitive"
    ],
    "incorrectPattern": "allowed customers compare",
    "correctPattern": "allowed customers to compare",
    "explanationZhHant": "allow + 人 + to + 動詞原形，所以寫 allowed customers to compare。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_APOLOGISE_FOR_REASON",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB APOLOGISE FOR_REASON",
    "formula": "VERB.APOLOGISE.FOR_REASON",
    "structuralSignature": [
      "verb",
      "apologise",
      "for_reason"
    ],
    "incorrectPattern": "about arriving late",
    "correctPattern": "for arriving late",
    "explanationZhHant": "表示為某個行為道歉，用 apologise for + 名詞／動名詞。 about 可用於談論道歉的主題，但不是這個標準框架。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_APOLOGISE_TO_PERSON",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB APOLOGISE TO_PERSON",
    "formula": "VERB.APOLOGISE.TO_PERSON",
    "structuralSignature": [
      "verb",
      "apologise",
      "to_person"
    ],
    "incorrectPattern": "apologised the tutor",
    "correctPattern": "apologised to the tutor",
    "explanationZhHant": "人道歉，用 apologise to + 人。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_ASK_NP_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB ASK NP TO_INFINITIVE",
    "formula": "VERB.ASK.NP.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "ask",
      "np",
      "to_infinitive"
    ],
    "incorrectPattern": "arriving",
    "correctPattern": "to arrive",
    "explanationZhHant": "ask + 人後面用 to + 動詞原形，所以寫 asked us to arrive。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_AVOID_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB AVOID GERUND",
    "formula": "VERB.AVOID.GERUND",
    "structuralSignature": [
      "verb",
      "avoid",
      "gerund"
    ],
    "incorrectPattern": "to touch",
    "correctPattern": "touching",
    "explanationZhHant": "avoid 後面接名詞或動名詞，不接 to 不定詞。公式： avoid + 動名詞。正確對照：avoid loose wires，因為 loose wires 是名詞詞組。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_BLAME_RESULT_ON_CAUSE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB BLAME RESULT_ON_CAUSE",
    "formula": "VERB.BLAME.RESULT_ON_CAUSE",
    "structuralSignature": [
      "verb",
      "blame",
      "result_on_cause"
    ],
    "incorrectPattern": "blamed the delay for a cancelled train",
    "correctPattern": "blamed the delay on a cancelled train",
    "explanationZhHant": "blame + 結果 + on + 原因：把延誤歸咎於火車取消。另一個正確結構是 blame the cancelled train for the delay。 兩個賓語角色不可倒轉。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_BRIDGE_CROSS_ACTIVE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB BRIDGE CROSS ACTIVE",
    "formula": "VERB.BRIDGE.CROSS.ACTIVE",
    "structuralSignature": [
      "verb",
      "bridge",
      "cross",
      "active"
    ],
    "incorrectPattern": "No road bridge was crossed the river",
    "correctPattern": "No road bridge crossed the river",
    "explanationZhHant": "bridge 橫跨 river， 所以 cross 用主動式。被動式應由被跨越的事物作主語： The river was crossed by a bridge。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CAUSE_NP_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB CAUSE NP TO_INFINITIVE",
    "formula": "VERB.CAUSE.NP.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "cause",
      "np",
      "to_infinitive"
    ],
    "incorrectPattern": "staff have",
    "correctPattern": "staff to have",
    "explanationZhHant": "cause 表示導致某人處於某情況或做某事時，用 cause + 人 + to + 動詞原形。所以寫 causing staff to have...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_COMPARE_DIRECT_OBJECT_NO_BETWEEN",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB COMPARE DIRECT_OBJECT NO_BETWEEN",
    "formula": "VERB.COMPARE.DIRECT_OBJECT.NO_BETWEEN",
    "structuralSignature": [
      "verb",
      "compare",
      "direct_object",
      "no_between"
    ],
    "incorrectPattern": "compares between its sources",
    "correctPattern": "compares its sources",
    "explanationZhHant": "compare 作動詞時直接接比較對象。名詞結構才使用 a comparison between A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_COMPLAIN_ABOUT_PROBLEM",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB COMPLAIN ABOUT PROBLEM",
    "formula": "VERB.COMPLAIN.ABOUT.PROBLEM",
    "structuralSignature": [
      "verb",
      "complain",
      "about",
      "problem"
    ],
    "incorrectPattern": "blame on the phenomenon",
    "correctPattern": "complain about the phenomenon",
    "explanationZhHant": "如果原意是「抱怨某個問題」，用 complain about + 問題。 blame 的結構不同： blame someone for something 或 blame something on someone。由於更換動詞可能改變意思，建議老師確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CONGRATULATE_NP_ON",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB CONGRATULATE NP ON",
    "formula": "VERB.CONGRATULATE.NP.ON",
    "structuralSignature": [
      "verb",
      "congratulate",
      "np",
      "on"
    ],
    "incorrectPattern": "congratulated her for finding",
    "correctPattern": "congratulated her on finding",
    "explanationZhHant": "固定結構是 congratulate + 人 + on + 名詞／動名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CONNECT_A_TO_B",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB CONNECT A_TO_B",
    "formula": "VERB.CONNECT.A_TO_B",
    "structuralSignature": [
      "verb",
      "connect",
      "a_to_b"
    ],
    "incorrectPattern": "with",
    "correctPattern": "to the",
    "explanationZhHant": "實體路線連接兩個地點時，可用 connect A to B。 the public square 是已規劃的特定設施，需要 the。 connect A with B 也可成立。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CONSIDER_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB CONSIDER GERUND",
    "formula": "VERB.CONSIDER.GERUND",
    "structuralSignature": [
      "verb",
      "consider",
      "gerund"
    ],
    "incorrectPattern": "considering to replace",
    "correctPattern": "considering replacing",
    "explanationZhHant": "consider 表示「考慮做某事」時，後面接動名詞。公式： consider + 動名詞。邊界： consider the proposal 中， consider 可直接接名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CONTACT_DIRECT_OBJECT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB CONTACT DIRECT_OBJECT",
    "formula": "VERB.CONTACT.DIRECT_OBJECT",
    "structuralSignature": [
      "verb",
      "contact",
      "direct_object"
    ],
    "incorrectPattern": "contacted with",
    "correctPattern": "contacted",
    "explanationZhHant": "contact 作動詞時直接接對象，所以寫 contacted support， 不加 with。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CONTACT_WH_INFINITIVE_NO_PREPOSITION",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB CONTACT WH_INFINITIVE NO_PREPOSITION",
    "formula": "VERB.CONTACT.WH_INFINITIVE.NO_PREPOSITION",
    "structuralSignature": [
      "verb",
      "contact",
      "wh_infinitive",
      "no_preposition"
    ],
    "incorrectPattern": "to whom",
    "correctPattern": "whom",
    "explanationZhHant": "contact 是及物動詞，直接接賓語，因此在 whom to contact 前不加 to。對照： whom to speak to，因為 speak 需要介詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CONVERT_INTO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB CONVERT INTO",
    "formula": "VERB.CONVERT.INTO",
    "structuralSignature": [
      "verb",
      "convert",
      "into"
    ],
    "incorrectPattern": "converted as a medical centre",
    "correctPattern": "converted into a medical centre",
    "explanationZhHant": "表示建築物改作另一種用途，用 convert A into B；被動式為 A was converted into B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_CREATE_NP_FOR_BENEFICIARY",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB CREATE NP FOR_BENEFICIARY",
    "formula": "VERB.CREATE.NP.FOR_BENEFICIARY",
    "structuralSignature": [
      "verb",
      "create",
      "np",
      "for_beneficiary"
    ],
    "incorrectPattern": "create parents and students economic difficulties",
    "correctPattern": "create economic difficulties for parents and students",
    "explanationZhHant": "create 先直接接被創造或造成的事物，再用 for 引出受影響的人： create + difficulties + for + people。不能把 parents and students 直接放在 economic difficulties 前作雙賓語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_DECIDE_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB DECIDE TO_INFINITIVE",
    "formula": "VERB.DECIDE.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "decide",
      "to_infinitive"
    ],
    "incorrectPattern": "ordering",
    "correctPattern": "to order",
    "explanationZhHant": "decide 後面通常接 to 不定詞，所以寫 decided to order。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_DEPEND_ON",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB DEPEND ON",
    "formula": "VERB.DEPEND.ON",
    "structuralSignature": [
      "verb",
      "depend",
      "on"
    ],
    "incorrectPattern": "depended of",
    "correctPattern": "depended on",
    "explanationZhHant": "depend 的固定搭配是 depend on + 人／事物／分句。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_DISCUSS_DIRECT_OBJECT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB DISCUSS DIRECT_OBJECT",
    "formula": "VERB.DISCUSS.DIRECT_OBJECT",
    "structuralSignature": [
      "verb",
      "discuss",
      "direct_object"
    ],
    "incorrectPattern": "discussed about",
    "correctPattern": "discussed",
    "explanationZhHant": "discuss 作動詞時直接接討論內容，所以寫 discussed the problem，不加 about。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_DIVIDE_INTO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB DIVIDE INTO",
    "formula": "VERB.DIVIDE.INTO",
    "structuralSignature": [
      "verb",
      "divide",
      "into"
    ],
    "incorrectPattern": "to",
    "correctPattern": "into",
    "explanationZhHant": "把一個整體分成多個部分，用 divide A into B。 divide between/among 可表示分配給不同人。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_ENJOY_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB ENJOY GERUND",
    "formula": "VERB.ENJOY.GERUND",
    "structuralSignature": [
      "verb",
      "enjoy",
      "gerund"
    ],
    "incorrectPattern": "to work",
    "correctPattern": "working",
    "explanationZhHant": "enjoy 後面接動名詞，所以寫 enjoyed working， 不寫 enjoyed to work。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_EXCEED_OBJECT_AND_RISE_TO_PERCENT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB EXCEED_OBJECT AND_RISE_TO_PERCENT",
    "formula": "VERB.EXCEED_OBJECT.AND_RISE_TO_PERCENT",
    "structuralSignature": [
      "verb",
      "exceed_object",
      "and_rise_to_percent"
    ],
    "incorrectPattern": "to 57.3%",
    "correctPattern": "and rise to 57.3%",
    "explanationZhHant": "exceed 是及物動詞，直接接被超越的對象： exceed the 0–14 age group。 表示比例上升至某個終點，則用另一個動詞 rise to 57.3%。 不能把兩個結構混合成 exceed X to 57.3%。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_EXPLAIN_THING_TO_PERSON",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB EXPLAIN THING TO_PERSON",
    "formula": "VERB.EXPLAIN.THING.TO_PERSON",
    "structuralSignature": [
      "verb",
      "explain",
      "thing",
      "to_person"
    ],
    "incorrectPattern": "explained new visitors the safety rules",
    "correctPattern": "explained the safety rules to new visitors",
    "explanationZhHant": "explain 先接所解釋的內容，再用 to 接聽者。公式： explain + 事情 + to + 人。正確替代： The coordinator told the visitors the safety rules，因為 tell 可使用雙賓語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_FACE_DIRECT_OBJECT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB FACE DIRECT_OBJECT",
    "formula": "VERB.FACE.DIRECT_OBJECT",
    "structuralSignature": [
      "verb",
      "face",
      "direct_object"
    ],
    "incorrectPattern": "faced to medical centre",
    "correctPattern": "faced the medical centre",
    "explanationZhHant": "face 表示朝向某地時直接接賓語，不加 to。 此處也需要 the 指已知的 medical centre。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_FLUCTUATE_BETWEEN_AND",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB FLUCTUATE BETWEEN_AND",
    "formula": "VERB.FLUCTUATE.BETWEEN_AND",
    "structuralSignature": [
      "verb",
      "fluctuate",
      "between_and"
    ],
    "incorrectPattern": "fluctuated from 2.7 and 3.1",
    "correctPattern": "fluctuated between 2.7 and 3.1",
    "explanationZhHant": "表示數值在兩個水平之間反覆變動，用 fluctuate between A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_GIVE_PASSIVE_DIRECT_OBJECT_NO_PREPOSITION",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB GIVE PASSIVE DIRECT_OBJECT NO_PREPOSITION",
    "formula": "VERB.GIVE.PASSIVE.DIRECT_OBJECT.NO_PREPOSITION",
    "structuralSignature": [
      "verb",
      "give",
      "passive",
      "direct_object",
      "no_preposition"
    ],
    "incorrectPattern": "are given at places",
    "correctPattern": "are given places",
    "explanationZhHant": "被動句中的 be given 可以直接接所給予的事物：be given places， 不加 at。 The lecture was given at the school 中的 at 表示活動地點，屬另一個結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_ILLUSTRATE_DIRECT_OBJECT_NO_ABOUT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB ILLUSTRATE DIRECT_OBJECT NO_ABOUT",
    "formula": "VERB.ILLUSTRATE.DIRECT_OBJECT.NO_ABOUT",
    "structuralSignature": [
      "verb",
      "illustrate",
      "direct_object",
      "no_about"
    ],
    "incorrectPattern": "illustrates about",
    "correctPattern": "illustrates",
    "explanationZhHant": "illustrate 是及物動詞，直接接所展示的內容，不加 about。對照： provide information about electricity use。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_IMAGINE_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB IMAGINE GERUND",
    "formula": "VERB.IMAGINE.GERUND",
    "structuralSignature": [
      "verb",
      "imagine",
      "gerund"
    ],
    "incorrectPattern": "if you enter",
    "correctPattern": "entering",
    "explanationZhHant": "imagine 後面可接動名詞，表示想像某個動作或情境： imagine entering a shop。也可寫 imagine that you enter a shop。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_INCREASE_BY_AMOUNT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB INCREASE BY_AMOUNT",
    "formula": "VERB.INCREASE.BY_AMOUNT",
    "structuralSignature": [
      "verb",
      "increase",
      "by_amount"
    ],
    "incorrectPattern": "increased 1.1 MWh",
    "correctPattern": "increased by 1.1 MWh",
    "explanationZhHant": "increase by + 數值表示增加幅度。不能在這個意思下直接把數值放在不及物動詞後。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_INCREASE_TO_ENDPOINT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB INCREASE TO_ENDPOINT",
    "formula": "VERB.INCREASE.TO_ENDPOINT",
    "structuralSignature": [
      "verb",
      "increase",
      "to_endpoint"
    ],
    "incorrectPattern": "until 3.2 MWh",
    "correctPattern": "to 3.2 MWh",
    "explanationZhHant": "increase to + 數值表示增加後的水平。 until 用於時間或某種持續界線。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_INSIST_ON_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB INSIST ON_GERUND",
    "formula": "VERB.INSIST.ON_GERUND",
    "structuralSignature": [
      "verb",
      "insist",
      "on_gerund"
    ],
    "incorrectPattern": "insisted checking",
    "correctPattern": "insisted on checking",
    "explanationZhHant": "insist 後面接動作時，可用 on + 動名詞。公式： insist on + 名詞／動名詞。另一個正確結構是 insist that + 分句，例如 He insisted that we check every cable。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_LACK_DIRECT_OBJECT_NO_OF",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB LACK DIRECT_OBJECT NO_OF",
    "formula": "VERB.LACK.DIRECT_OBJECT.NO_OF",
    "structuralSignature": [
      "verb",
      "lack",
      "direct_object",
      "no_of"
    ],
    "incorrectPattern": "of access",
    "correctPattern": "access",
    "explanationZhHant": "lack 作動詞時直接接賓語： lack access， 不加 of。 如果使用名詞 lack，則寫 a lack of access。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_LET_NP_BASE_VERB",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB LET NP BASE_VERB",
    "formula": "VERB.LET.NP.BASE_VERB",
    "structuralSignature": [
      "verb",
      "let",
      "np",
      "base_verb"
    ],
    "incorrectPattern": "let children to test",
    "correctPattern": "let children test",
    "explanationZhHant": "let 後面接人，再直接用動詞原形，不加 to。 公式：let + 人 + 動詞原形。正確對照：allow children to test， 因為 allow 需要 to 不定詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_LIE_PAST_LAY_NOT_LAID",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB LIE PAST_LAY_NOT_LAID",
    "formula": "VERB.LIE.PAST_LAY_NOT_LAID",
    "structuralSignature": [
      "verb",
      "lie",
      "past_lay_not_laid"
    ],
    "incorrectPattern": "laid",
    "correctPattern": "lay",
    "explanationZhHant": "表示建築物位於某處，動詞是 lie，過去式為 lay。laid 是及物動詞 lay 的過去式，例如 laid the map on the table。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_LINK_A_WITH_B_NO_BETWEEN",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB LINK A_WITH_B NO_BETWEEN",
    "formula": "VERB.LINK.A_WITH_B.NO_BETWEEN",
    "structuralSignature": [
      "verb",
      "link",
      "a_with_b",
      "no_between"
    ],
    "incorrectPattern": "linking between the main road and the station",
    "correctPattern": "linking the main road with the station",
    "explanationZhHant": "動詞 link 使用 link A with/to B。名詞結構才可寫 a link between A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_LOOK_FORWARD_TO_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB LOOK_FORWARD_TO GERUND",
    "formula": "VERB.LOOK_FORWARD_TO.GERUND",
    "structuralSignature": [
      "verb",
      "look_forward_to",
      "gerund"
    ],
    "incorrectPattern": "look forward to learn",
    "correctPattern": "look forward to learning",
    "explanationZhHant": "look forward to 裡面的 to 是介詞，所以後面的動作用動名詞。公式： look forward to + 名詞／動名詞。正確對照： hope to learn，因為 hope 後面的 to 是不定詞標記。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_MAKE_NP_BASE_VERB_ACTIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB MAKE NP BASE_VERB ACTIVE",
    "formula": "VERB.MAKE.NP.BASE_VERB.ACTIVE",
    "structuralSignature": [
      "verb",
      "make",
      "np",
      "base_verb",
      "active"
    ],
    "incorrectPattern": "made everyone to wear",
    "correctPattern": "made everyone wear",
    "explanationZhHant": "主動句中的使役動詞 make 使用 make + 人 + 動詞原形，不加 to。邊界：被動句要恢復 to，例如 Everyone was made to wear eye protection。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_MANAGE_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB MANAGE TO_INFINITIVE",
    "formula": "VERB.MANAGE.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "manage",
      "to_infinitive"
    ],
    "incorrectPattern": "managed fixing",
    "correctPattern": "managed to fix",
    "explanationZhHant": "這裡 manage 表示「成功做到」，後面接 to 不定詞。公式： manage to + 動詞原形。邊界： manage a repair team 中， manage 可直接接名詞，意思是「管理」。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_MEAN_GERUND_ENTAIL",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB MEAN GERUND ENTAIL",
    "formula": "VERB.MEAN.GERUND.ENTAIL",
    "structuralSignature": [
      "verb",
      "mean",
      "gerund",
      "entail"
    ],
    "incorrectPattern": "meant to complete",
    "correctPattern": "meant completing",
    "explanationZhHant": "mean doing 表示某件事必然涉及另一件事。更換卡片會涉及填寫另一張表格。 mean to do 則表示有意打算做某事。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_MEAN_TO_INFINITIVE_INTENTION",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB MEAN TO_INFINITIVE INTENTION",
    "formula": "VERB.MEAN.TO_INFINITIVE.INTENTION",
    "structuralSignature": [
      "verb",
      "mean",
      "to_infinitive",
      "intention"
    ],
    "incorrectPattern": "did not mean delaying",
    "correctPattern": "did not mean to delay",
    "explanationZhHant": "表示沒有打算延誤小組，用 mean to + 動詞原形。mean delaying 會表示某情況意味著延誤。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_OVERTAKE_DIRECT_OBJECT_NO_THAN",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB OVERTAKE DIRECT_OBJECT NO_THAN",
    "formula": "VERB.OVERTAKE.DIRECT_OBJECT.NO_THAN",
    "structuralSignature": [
      "verb",
      "overtake",
      "direct_object",
      "no_than"
    ],
    "incorrectPattern": "overtook than it",
    "correctPattern": "overtook it",
    "explanationZhHant": "overtake 是及物動詞，直接接被超越的對象，不使用 than。 become higher than 才需要 than。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_PREVENT_NP_FROM_GERUND",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB PREVENT NP FROM_GERUND",
    "formula": "VERB.PREVENT.NP.FROM_GERUND",
    "structuralSignature": [
      "verb",
      "prevent",
      "np",
      "from_gerund"
    ],
    "incorrectPattern": "prevented several batteries ending",
    "correctPattern": "prevented several batteries from ending",
    "explanationZhHant": "prevent 後面先寫受影響的人或物，再用 from + 動名詞表示被阻止的動作。公式： prevent + 人／物 + from + 動名詞。邊界： prevent an accident 可直接接名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_PRIORITISE_DIRECT_OBJECT_NO_ON",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB PRIORITISE DIRECT_OBJECT NO_ON",
    "formula": "VERB.PRIORITISE.DIRECT_OBJECT.NO_ON",
    "structuralSignature": [
      "verb",
      "prioritise",
      "direct_object",
      "no_on"
    ],
    "incorrectPattern": "on the",
    "correctPattern": "the",
    "explanationZhHant": "prioritise 是及物動詞，直接接賓語： prioritise prevention。使用名詞 priority 時，才可寫 give priority to prevention。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_PROTECT_NP_FROM_NP",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB PROTECT NP FROM_NP",
    "formula": "VERB.PROTECT.NP.FROM_NP",
    "structuralSignature": [
      "verb",
      "protect",
      "np",
      "from_np"
    ],
    "incorrectPattern": "prevent them from excessive work,",
    "correctPattern": "protect them from excessive work and",
    "explanationZhHant": "prevent + 人 + from 後面通常接動名詞，例如 prevent workers from overworking。若後面直接接名詞 excessive work，可改用 protect workers from excessive work。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_PROVIDE_ACCESS_TO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB PROVIDE ACCESS_TO",
    "formula": "VERB.PROVIDE.ACCESS_TO",
    "structuralSignature": [
      "verb",
      "provide",
      "access_to"
    ],
    "incorrectPattern": "provide the path an access",
    "correctPattern": "provide access to the path",
    "explanationZhHant": "access 在這裡不可數。固定結構是 provide access to + 地點／設施，不能把 path 和 access 當作雙賓語。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_PROVIDE_NP_WITH_NP",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB PROVIDE NP WITH_NP",
    "formula": "VERB.PROVIDE.NP.WITH_NP",
    "structuralSignature": [
      "verb",
      "provide",
      "np",
      "with_np"
    ],
    "incorrectPattern": "provided every team by the necessary gloves",
    "correctPattern": "provided every team with the necessary gloves",
    "explanationZhHant": "表示「為某人提供某物」可用 provide + 人 + with + 物。這裡不能用 by。另一個正確寫法是 provide the necessary gloves for every team。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_RANGE_FROM_TO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB RANGE FROM_TO",
    "formula": "VERB.RANGE.FROM_TO",
    "structuralSignature": [
      "verb",
      "range",
      "from_to"
    ],
    "incorrectPattern": "ranged between 2.7 to 3.3",
    "correctPattern": "ranged from 2.7 to 3.3",
    "explanationZhHant": "正確配對是 range from A to B 或 range between A and B。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REACH_DIRECT_OBJECT_NO_TO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB REACH DIRECT_OBJECT NO_TO",
    "formula": "VERB.REACH.DIRECT_OBJECT.NO_TO",
    "structuralSignature": [
      "verb",
      "reach",
      "direct_object",
      "no_to"
    ],
    "incorrectPattern": "reaching to 4.8 MWh",
    "correctPattern": "reaching 4.8 MWh",
    "explanationZhHant": "reach 是及物動詞，直接接數值，不加 to。對照： rise to 4.8 MWh。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_RECOVER_TO_LEVEL",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB RECOVER TO_LEVEL",
    "formula": "VERB.RECOVER.TO_LEVEL",
    "structuralSignature": [
      "verb",
      "recover",
      "to_level"
    ],
    "incorrectPattern": "recovered by 3.1 MWh",
    "correctPattern": "recovered to 3.1 MWh",
    "explanationZhHant": "recover to + 數值表示回升後的水平。 recover by 0.4 MWh 可表示回升幅度。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REMEMBER_GERUND_PAST_MEMORY",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB REMEMBER GERUND PAST_MEMORY",
    "formula": "VERB.REMEMBER.GERUND.PAST_MEMORY",
    "structuralSignature": [
      "verb",
      "remember",
      "gerund",
      "past_memory"
    ],
    "incorrectPattern": "remembered to leave",
    "correctPattern": "remembered leaving",
    "explanationZhHant": "remember doing 表示記得曾經做過某事。 remember to do 表示記得要做某事並執行。原意是她回想自己把卡留在巴士上，因此用動名詞。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REMIND_DIRECT_PERSON_NO_TO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB REMIND DIRECT_PERSON_NO_TO",
    "formula": "VERB.REMIND.DIRECT_PERSON_NO_TO",
    "structuralSignature": [
      "verb",
      "remind",
      "direct_person_no_to"
    ],
    "incorrectPattern": "reminded to everyone that",
    "correctPattern": "reminded everyone that",
    "explanationZhHant": "remind 直接接被提醒的人，不在前面加 to： remind everyone that...。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REMIND_NP_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB REMIND NP TO_INFINITIVE",
    "formula": "VERB.REMIND.NP.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "remind",
      "np",
      "to_infinitive"
    ],
    "incorrectPattern": "reminded to write",
    "correctPattern": "reminded them to write",
    "explanationZhHant": "remind 通常要指出提醒的對象。這裡 them 指上一句的 new visitors。 公式： remind + 人 + to + 動詞原形。邊界： remember to write 表示主語自己記得做某事。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REQUEST_DIRECT_OBJECT_NO_FOR",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB REQUEST DIRECT_OBJECT NO_FOR",
    "formula": "VERB.REQUEST.DIRECT_OBJECT.NO_FOR",
    "structuralSignature": [
      "verb",
      "request",
      "direct_object",
      "no_for"
    ],
    "incorrectPattern": "requested for more",
    "correctPattern": "requested more",
    "explanationZhHant": "request 作及物動詞時直接接所要求的事物： request more information。名詞結構則可寫 a request for information。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REQUEST_WORK_DIRECT_OBJECT",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB REQUEST WORK DIRECT_OBJECT",
    "formula": "VERB.REQUEST.WORK.DIRECT_OBJECT",
    "structuralSignature": [
      "verb",
      "request",
      "work",
      "direct_object"
    ],
    "incorrectPattern": "request on urgent projects",
    "correctPattern": "request work on urgent projects",
    "explanationZhHant": "request 作動詞時需要直接賓語。本句可寫 request work on urgent projects。更清楚的替代寫法是 ask employees to work on urgent projects。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_REQUIRE_NP_TO_INFINITIVE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB REQUIRE NP TO_INFINITIVE",
    "formula": "VERB.REQUIRE.NP.TO_INFINITIVE",
    "structuralSignature": [
      "verb",
      "require",
      "np",
      "to_infinitive"
    ],
    "incorrectPattern": "staff needed to wore",
    "correctPattern": "staff to wear",
    "explanationZhHant": "require 表示要求某人做某事時，使用 require + 人 + to + 動詞原形。 require 已經控制後面的不定詞，不能加入 needed； to 後面亦要用原形 wear，不用過去式 wore。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_RISE_INTRANSITIVE_NOT_RAISE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB RISE_INTRANSITIVE NOT_RAISE",
    "formula": "VERB.RISE_INTRANSITIVE.NOT_RAISE",
    "structuralSignature": [
      "verb",
      "rise_intransitive",
      "not_raise"
    ],
    "incorrectPattern": "to raise from 12.1",
    "correctPattern": "to rise from 12.1",
    "explanationZhHant": "rise 是不及物動詞，表示數值自行上升。raise 是及物動詞，需要賓語，例如 The policy raised the total。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_START_AT_VALUE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB START_AT VALUE",
    "formula": "VERB.START_AT.VALUE",
    "structuralSignature": [
      "verb",
      "start_at",
      "value"
    ],
    "incorrectPattern": "started from 2.1 MWh",
    "correctPattern": "started at 2.1 MWh",
    "explanationZhHant": "描述圖表數列的初始數值，通常用 start at + 數值。時間範圍可寫 from 2005。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_STOP_TO_INFINITIVE_PURPOSE",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB STOP TO_INFINITIVE_PURPOSE",
    "formula": "VERB.STOP.TO_INFINITIVE_PURPOSE",
    "structuralSignature": [
      "verb",
      "stop",
      "to_infinitive_purpose"
    ],
    "incorrectPattern": "stopped explaining",
    "correctPattern": "stopped to explain",
    "explanationZhHant": "stop to explain 表示停下原本的活動，目的是進行解釋；stop explaining 表示停止解釋。兩者都合文法，但意思不同，系統必須根據已記錄原意選擇。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_SURPASS_DIRECT_OBJECT_NO_THAN",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB SURPASS DIRECT_OBJECT NO_THAN",
    "formula": "VERB.SURPASS.DIRECT_OBJECT.NO_THAN",
    "structuralSignature": [
      "verb",
      "surpass",
      "direct_object",
      "no_than"
    ],
    "incorrectPattern": "surpassed than Northland",
    "correctPattern": "surpassed Northland",
    "explanationZhHant": "surpass 是及物動詞，直接接被超越的對象。 was higher than Northland 才使用 than。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_TRY_GERUND_EXPERIMENT",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB TRY GERUND EXPERIMENT",
    "formula": "VERB.TRY.GERUND.EXPERIMENT",
    "structuralSignature": [
      "verb",
      "try",
      "gerund",
      "experiment"
    ],
    "incorrectPattern": "tried to call",
    "correctPattern": "tried calling",
    "explanationZhHant": "try doing 表示嘗試某個方法，看看是否有效；try to do 表示努力完成某事。兩者均可能正確，必須按語境處理。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_TURN_INTO_NOT_TURN_TO",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB TURN_INTO NOT_TURN_TO",
    "formula": "VERB.TURN_INTO.NOT_TURN_TO",
    "structuralSignature": [
      "verb",
      "turn_into",
      "not_turn_to"
    ],
    "incorrectPattern": "and its site will turn to",
    "correctPattern": "with the site becoming",
    "explanationZhHant": "表示地點轉變成另一種用途，用 turn into 或 become。 turn to 常表示轉向某人、某方法或某頁。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_USED_TO_BASE_VERB",
    "category": "infinitive_or_gerund",
    "titleZhHant": "文法規則：VERB USED_TO BASE_VERB",
    "formula": "VERB.USED_TO.BASE_VERB",
    "structuralSignature": [
      "verb",
      "used_to",
      "base_verb"
    ],
    "incorrectPattern": "used to offering",
    "correctPattern": "used to offer",
    "explanationZhHant": "used to 表示過去的習慣或狀態，後面用動詞原形。公式：used to + 動詞原形。邊界：be used to + 名詞／動名詞，例如 She is used to working late。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_WIDEN_INTRANSITIVE_TREND",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB WIDEN INTRANSITIVE_TREND",
    "formula": "VERB.WIDEN.INTRANSITIVE_TREND",
    "structuralSignature": [
      "verb",
      "widen",
      "intransitive_trend"
    ],
    "incorrectPattern": "is projected to be widened",
    "correctPattern": "is projected to widen",
    "explanationZhHant": "當 difference 本身逐漸擴大時， widen 作不及物動詞。被動式暗示有外在執行者把差距擴大，因此這項規則應保留原意檢查。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "VERB_WOULD_RATHER_BASE_THAN_BASE",
    "category": "other_grammar",
    "titleZhHant": "文法規則：VERB WOULD_RATHER BASE_THAN_BASE",
    "formula": "VERB.WOULD_RATHER.BASE_THAN_BASE",
    "structuralSignature": [
      "verb",
      "would_rather",
      "base_than_base"
    ],
    "incorrectPattern": "would rather to donate unused tools than throwing them away",
    "correctPattern": "would rather donate unused tools than throw them away",
    "explanationZhHant": "would rather 後面用動詞原形； than 後面的平行動作也用動詞原形。這是一組相依修改。公式： would rather + 動詞原形 + than + 動詞原形。邊界： would prefer to donate 中則保留 to。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDCHOICE_BESIDE_NOT_BESIDES",
    "category": "word_choice",
    "titleZhHant": "文法規則：WORDCHOICE BESIDE_NOT_BESIDES",
    "formula": "WORDCHOICE.BESIDE_NOT_BESIDES",
    "structuralSignature": [
      "wordchoice",
      "beside_not_besides"
    ],
    "incorrectPattern": "besides the supermarket",
    "correctPattern": "next to the supermarket",
    "explanationZhHant": "beside／ next to 表示在旁邊； besides 表示「此外」或「除……之外」。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDCHOICE_COMMUNICATION_NOT_COMMUTATION",
    "category": "word_choice",
    "titleZhHant": "文法規則：WORDCHOICE COMMUNICATION NOT_COMMUTATION",
    "formula": "WORDCHOICE.COMMUNICATION.NOT_COMMUTATION",
    "structuralSignature": [
      "wordchoice",
      "communication",
      "not_commutation"
    ],
    "incorrectPattern": "commutations",
    "correctPattern": "communication",
    "explanationZhHant": "communication 表示人與人之間的溝通，通常作不可數名詞。 commutation 是另一個真實英文詞，可表示減刑、換向或付款轉換，不是本句意思。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDCHOICE_CONTRAST_NOT_PATTERN",
    "category": "word_choice",
    "titleZhHant": "文法規則：WORDCHOICE CONTRAST NOT_PATTERN",
    "formula": "WORDCHOICE.CONTRAST.NOT_PATTERN",
    "structuralSignature": [
      "wordchoice",
      "contrast",
      "not_pattern"
    ],
    "incorrectPattern": "pattern",
    "correctPattern": "contrast",
    "explanationZhHant": "本句描述的是兩國人口年齡結構之間的差異，因此 contrast 較能準確指回前面的比較。 pattern 本身不是文法錯誤，但未清楚表示哪一種模式正在改變。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER",
    "category": "word_choice",
    "titleZhHant": "文法規則：WORDCHOICE EMPLOYEE AFFECTED_WORKER NOT_EMPLOYER",
    "formula": "WORDCHOICE.EMPLOYEE.AFFECTED_WORKER.NOT_EMPLOYER",
    "structuralSignature": [
      "wordchoice",
      "employee",
      "affected_worker",
      "not_employer"
    ],
    "incorrectPattern": "many employers",
    "correctPattern": "many employees",
    "explanationZhHant": "employer 是僱主， employee 是僱員。下文說這些人的僱主在非工作時間給他們工作，因此原意很可能是 employees。不過這項修改涉及人物角色，系統應先根據上下文判斷，不宜只靠單句自動更改。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDCHOICE_IMAGINE_NOT_IMAGE",
    "category": "word_choice",
    "titleZhHant": "文法規則：WORDCHOICE IMAGINE NOT_IMAGE",
    "formula": "WORDCHOICE.IMAGINE.NOT_IMAGE",
    "structuralSignature": [
      "wordchoice",
      "imagine",
      "not_image"
    ],
    "incorrectPattern": "imaged",
    "correctPattern": "imagine",
    "explanationZhHant": "表示「試想一下」要用動詞 imagine。 image 作動詞可表示為某物成像或想像其圖像，但 imaged 是過去式，不能在這個祈使句位置使用。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDCHOICE_RELIEVE_STRESS_NOT_RELIVE",
    "category": "word_choice",
    "titleZhHant": "文法規則：WORDCHOICE RELIEVE_STRESS NOT_RELIVE",
    "formula": "WORDCHOICE.RELIEVE_STRESS.NOT_RELIVE",
    "structuralSignature": [
      "wordchoice",
      "relieve_stress",
      "not_relive"
    ],
    "incorrectPattern": "relive their stress",
    "correctPattern": "relieve their stress",
    "explanationZhHant": "relieve stress 表示減輕壓力。 relive 表示重新經歷某件事，例如 relive a childhood memory。 兩詞拼法接近，但意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_ADVERB_FAIRLY_MODIFIES_VERB",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM ADVERB FAIRLY MODIFIES_VERB",
    "formula": "WORDFORM.ADVERB.FAIRLY.MODIFIES_VERB",
    "structuralSignature": [
      "wordform",
      "adverb",
      "fairly",
      "modifies_verb"
    ],
    "incorrectPattern": "fair",
    "correctPattern": "fairly",
    "explanationZhHant": "fairly 是副詞，在此修飾動詞 represented。 fair 是形容詞，通常描述名詞或放在連繫動詞後。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_DENSITY_TO_DENSER",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM DENSITY_TO_DENSER",
    "formula": "WORDFORM.DENSITY_TO_DENSER",
    "structuralSignature": [
      "wordform",
      "density_to_denser"
    ],
    "incorrectPattern": "to a density",
    "correctPattern": "into a denser",
    "explanationZhHant": "density 是名詞；在這裡要用形容詞比較級 denser 描述 neighbourhood。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_DIAGONALLY_ADVERB",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM DIAGONALLY ADVERB",
    "formula": "WORDFORM.DIAGONALLY.ADVERB",
    "structuralSignature": [
      "wordform",
      "diagonally",
      "adverb"
    ],
    "incorrectPattern": "located diagonal",
    "correctPattern": "situated diagonally",
    "explanationZhHant": "修飾位置關係 opposite 要用副詞 diagonally，不用形容詞 diagonal。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_DRESS_FREELY_ADVERB",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM DRESS FREELY ADVERB",
    "formula": "WORDFORM.DRESS.FREELY.ADVERB",
    "structuralSignature": [
      "wordform",
      "dress",
      "freely",
      "adverb"
    ],
    "incorrectPattern": "dress with for more freedom",
    "correctPattern": "dress more freely",
    "explanationZhHant": "dress 在這裡是不及物動詞，可用副詞 freely 修飾。 with 後面需要賓語，例如 dress with greater variety； 原句的 with for 不能構成一個完整結構。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_LOW_INCOME_ATTRIBUTIVE_HYPHEN",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM LOW_INCOME ATTRIBUTIVE_HYPHEN",
    "formula": "WORDFORM.LOW_INCOME.ATTRIBUTIVE_HYPHEN",
    "structuralSignature": [
      "wordform",
      "low_income",
      "attributive_hyphen"
    ],
    "incorrectPattern": "income family this",
    "correctPattern": "low-income families, this",
    "explanationZhHant": "表示收入較低的家庭，常用複合形容詞 low-income， 放在名詞前時加連字號。文章泛指多個家庭，因此用 families，並在句首短語後加逗號。 low 是根據「沉重負擔」推斷，需老師確認。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_MAKE_OBJECT_ADJECTIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM MAKE OBJECT ADJECTIVE",
    "formula": "WORDFORM.MAKE.OBJECT.ADJECTIVE",
    "structuralSignature": [
      "wordform",
      "make",
      "object",
      "adjective"
    ],
    "incorrectPattern": "confidence",
    "correctPattern": "confident",
    "explanationZhHant": "make + 人／物 + 形容詞。 me 後面要用形容詞 confident，不用名詞 confidence。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_MANNER_ADVERB_AFTER_VERB",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM MANNER_ADVERB AFTER_VERB",
    "formula": "WORDFORM.MANNER_ADVERB.AFTER_VERB",
    "structuralSignature": [
      "wordform",
      "manner_adverb",
      "after_verb"
    ],
    "incorrectPattern": "wide",
    "correctPattern": "widely",
    "explanationZhHant": "widely 是副詞，在這裡修飾 shared，表示利益廣泛地被分享。 wide 可在 open wide 或 far and wide 等結構中作副詞，但本句需要 widely。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_NEARBY_ATTRIBUTIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM NEARBY ATTRIBUTIVE",
    "formula": "WORDFORM.NEARBY.ATTRIBUTIVE",
    "structuralSignature": [
      "wordform",
      "nearby",
      "attributive"
    ],
    "incorrectPattern": "neighbour",
    "correctPattern": "nearby",
    "explanationZhHant": "neighbour 是名詞，通常指人或相鄰事物；修飾位置接近的 riverbank 可用形容詞 nearby 或 neighbouring。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_NORTH_TO_NORTHERN_ATTRIBUTIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM NORTH_TO_NORTHERN_ATTRIBUTIVE",
    "formula": "WORDFORM.NORTH_TO_NORTHERN_ATTRIBUTIVE",
    "structuralSignature": [
      "wordform",
      "north_to_northern_attributive"
    ],
    "incorrectPattern": "north",
    "correctPattern": "the northern",
    "explanationZhHant": "放在名詞 edge 前作修飾語時，使用形容詞 northern。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_NOUN_PREMODIFIER_MEDICAL_ADJECTIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM NOUN_PREMODIFIER MEDICAL_ADJECTIVE",
    "formula": "WORDFORM.NOUN_PREMODIFIER.MEDICAL_ADJECTIVE",
    "structuralSignature": [
      "wordform",
      "noun_premodifier",
      "medical_adjective"
    ],
    "incorrectPattern": "medicine crises",
    "correctPattern": "medical crises",
    "explanationZhHant": "crises 前面需要形容詞 medical， 表示「醫療方面的」。 medicine 是名詞，雖然可在 medicine cabinet 等固定組合中修飾另一名詞，但不適用於 medical crisis。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_OPEN_SPACE_NOT_OPENED",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM OPEN_SPACE NOT_OPENED",
    "formula": "WORDFORM.OPEN_SPACE.NOT_OPENED",
    "structuralSignature": [
      "wordform",
      "open_space",
      "not_opened"
    ],
    "incorrectPattern": "opened spaces",
    "correctPattern": "open space",
    "explanationZhHant": "open space 指未被建築物佔用的公共空間。opened 是動詞過去分詞，表示某物已被打開。open spaces 也可用於多個獨立空間。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_PEDESTRIANISE_ROAD",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM PEDESTRIANISE ROAD",
    "formula": "WORDFORM.PEDESTRIANISE.ROAD",
    "structuralSignature": [
      "wordform",
      "pedestrianise",
      "road"
    ],
    "incorrectPattern": "made pedestrian",
    "correctPattern": "pedestrianised",
    "explanationZhHant": "把道路改為行人專用區，標準地圖描述動詞是 pedestrianise。made pedestria n-only 也是正確替代。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_RESPECTIVELY_NOT_RESPECTABLY",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM RESPECTIVELY NOT_RESPECTABLY",
    "formula": "WORDFORM.RESPECTIVELY.NOT_RESPECTABLY",
    "structuralSignature": [
      "wordform",
      "respectively",
      "not_respectably"
    ],
    "incorrectPattern": "respectably",
    "correctPattern": "respectively",
    "explanationZhHant": "respectively 表示兩組依次列出的項目一一對應。 respectably 表示以可敬或尚算不錯的方式，意思不同。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_SUPERLATIVE_YOUNGEST_AGE_GROUP",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM SUPERLATIVE YOUNGEST_AGE_GROUP",
    "formula": "WORDFORM.SUPERLATIVE.YOUNGEST_AGE_GROUP",
    "structuralSignature": [
      "wordform",
      "superlative",
      "youngest_age_group"
    ],
    "incorrectPattern": "youngster",
    "correctPattern": "youngest age",
    "explanationZhHant": "youngster 指一名年輕人，不能自然地表示三個年齡分類中最年輕的一組。使用最高級形容詞 youngest 修飾 age group。",
    "englishVariant": "British English",
    "exceptions": []
  },
  {
    "ruleId": "WORDFORM_VERB_MODIFIED_BY_ADVERB_COMPARATIVE",
    "category": "word_form",
    "titleZhHant": "文法規則：WORDFORM VERB MODIFIED_BY_ADVERB_COMPARATIVE",
    "formula": "WORDFORM.VERB.MODIFIED_BY_ADVERB_COMPARATIVE",
    "structuralSignature": [
      "wordform",
      "verb",
      "modified_by_adverb_comparative"
    ],
    "incorrectPattern": "they work become slower and slower",
    "correctPattern": "they work more and more slowly",
    "explanationZhHant": "work 是動作，應由副詞 slowly 修飾。表示動作逐漸變慢，用 more and more slowly。 become slower 可描述人或事物的狀態，但不能直接放在 they work 後形成雙重謂語。",
    "englishVariant": "British English",
    "exceptions": []
  }
].map((rule) => Object.freeze({
  ...rule,
  structuralSignature: Object.freeze(rule.structuralSignature),
  exceptions: Object.freeze(rule.exceptions.map((exception) => Object.freeze(exception)))
})));

export const CORPUS_DETECTOR_PATTERNS = Object.freeze([
  {
    "patternId": "PARA-0001-I001",
    "source": "issue",
    "sentenceId": "PARA-0001-S01",
    "ruleId": "MANY_PLURAL_NOUN",
    "matchText": "company",
    "replacementText": "companies",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "years",
      "many"
    ],
    "rightContext": [
      "requires",
      "their"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I002",
    "source": "issue",
    "sentenceId": "PARA-0001-S01",
    "ruleId": "PLURAL_SUBJECT_VERB",
    "matchText": "requires",
    "replacementText": "require",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "many",
      "company"
    ],
    "rightContext": [
      "their",
      "staffs"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I003",
    "source": "issue",
    "sentenceId": "PARA-0001-S01",
    "ruleId": "STAFF_COLLECTIVE_NOUN",
    "matchText": "staffs",
    "replacementText": "staff",
    "acceptableAlternatives": [
      "staff members"
    ],
    "confidence": 1,
    "leftContext": [
      "requires",
      "their"
    ],
    "rightContext": [
      "to",
      "wears"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I004",
    "source": "issue",
    "sentenceId": "PARA-0001-S01",
    "ruleId": "TO_BASE_VERB",
    "matchText": "wears",
    "replacementText": "wear",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "staffs",
      "to"
    ],
    "rightContext": [
      "uniforms",
      "at"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I005",
    "source": "issue",
    "sentenceId": "PARA-0001-S02",
    "ruleId": "SINGULAR_SUBJECT_VERB",
    "matchText": "have",
    "replacementText": "has",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "this",
      "policy"
    ],
    "rightContext": [
      "several",
      "advantage",
      "for"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I006",
    "source": "issue",
    "sentenceId": "PARA-0001-S02",
    "ruleId": "SEVERAL_PLURAL_NOUN",
    "matchText": "advantage",
    "replacementText": "advantages",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "have",
      "several"
    ],
    "rightContext": [
      "for",
      "both"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I007",
    "source": "issue",
    "sentenceId": "PARA-0001-S02",
    "ruleId": "GENERAL_GROUP_PLURAL",
    "matchText": "customer",
    "replacementText": "customers",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "workers",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I008",
    "source": "issue",
    "sentenceId": "PARA-0001-S03",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "identifies",
    "replacementText": "identify",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "customers",
      "can"
    ],
    "rightContext": [
      "employees",
      "quickly"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I009",
    "source": "issue",
    "sentenceId": "PARA-0001-S03",
    "ruleId": "PLURAL_SUBJECT_VERB",
    "matchText": "needs",
    "replacementText": "need",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "when",
      "they"
    ],
    "rightContext": [
      "help"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I010",
    "source": "issue",
    "sentenceId": "PARA-0001-S04",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "reduces",
    "replacementText": "reduce",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "uniform",
      "can"
    ],
    "rightContext": [
      "how",
      "much"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I011",
    "source": "issue",
    "sentenceId": "PARA-0001-S04",
    "ruleId": "SPEND_MONEY_ON",
    "matchText": "spend for",
    "replacementText": "spend on",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "money",
      "staff"
    ],
    "rightContext": [
      "work",
      "clothes"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I012",
    "source": "issue",
    "sentenceId": "PARA-0001-S05",
    "ruleId": "GENERAL_SOME_PLURAL",
    "matchText": "employee",
    "replacementText": "employees",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "however",
      "some"
    ],
    "rightContext": [
      "feels",
      "uncomfortable"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I013",
    "source": "issue",
    "sentenceId": "PARA-0001-S05",
    "ruleId": "PLURAL_SUBJECT_VERB",
    "matchText": "feels",
    "replacementText": "feel",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "some",
      "employee"
    ],
    "rightContext": [
      "uncomfortable",
      "because"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I014",
    "source": "issue",
    "sentenceId": "PARA-0001-S05",
    "ruleId": "SINGULAR_SUBJECT_VERB",
    "matchText": "do",
    "replacementText": "does",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "the",
      "same",
      "design"
    ],
    "rightContext": [
      "not",
      "suit",
      "everyone"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I015",
    "source": "issue",
    "sentenceId": "PARA-0001-S06",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "makes",
    "replacementText": "make",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "may",
      "also"
    ],
    "rightContext": [
      "workers",
      "feel"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I016",
    "source": "issue",
    "sentenceId": "PARA-0001-S06",
    "ruleId": "PLURAL_SUBJECT_VERB",
    "matchText": "has",
    "replacementText": "have",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "feel",
      "that",
      "they"
    ],
    "rightContext": [
      "less",
      "personal",
      "freedom"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I017",
    "source": "issue",
    "sentenceId": "PARA-0001-S07",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "provides",
    "replacementText": "provide",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "opinion",
      "companies",
      "should"
    ],
    "rightContext": [
      "suitable",
      "uniforms",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I018",
    "source": "issue",
    "sentenceId": "PARA-0001-S07",
    "ruleId": "SHARED_MODAL_PARALLEL",
    "matchText": "allows",
    "replacementText": "allow",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "uniforms",
      "and"
    ],
    "rightContext": [
      "employees",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0001-I019",
    "source": "issue",
    "sentenceId": "PARA-0001-S07",
    "ruleId": "PREPOSITION_GERUND",
    "matchText": "caused",
    "replacementText": "causing",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "professional",
      "without"
    ],
    "rightContext": [
      "unnecessary",
      "discomfort"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I001",
    "source": "issue",
    "sentenceId": "PARA-0002-S01",
    "ruleId": "PURPOSE_TO_INFINITIVE",
    "matchText": "for visit",
    "replacementText": "to visit",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "to",
      "japan"
    ],
    "rightContext": [
      "several",
      "cities"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I002",
    "source": "issue",
    "sentenceId": "PARA-0002-S02",
    "ruleId": "NEAR_PREPOSITION",
    "matchText": "near from",
    "replacementText": "near",
    "acceptableAlternatives": [
      "close to"
    ],
    "confidence": 1,
    "leftContext": [
      "was",
      "located"
    ],
    "rightContext": [
      "the",
      "railway"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I003",
    "source": "issue",
    "sentenceId": "PARA-0002-S02",
    "ruleId": "ADJECTIVE_AFTER_BE",
    "matchText": "convenience",
    "replacementText": "convenient",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "was",
      "very"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I004",
    "source": "issue",
    "sentenceId": "PARA-0002-S03",
    "ruleId": "INFORMATION_UNCOUNTABLE",
    "matchText": "many informations",
    "replacementText": "much information",
    "acceptableAlternatives": [
      "a lot of information",
      "several pieces of information"
    ],
    "confidence": 1,
    "leftContext": [
      "we",
      "collected"
    ],
    "rightContext": [
      "from",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I005",
    "source": "issue",
    "sentenceId": "PARA-0002-S03",
    "ruleId": "INDIRECT_QUESTION_ORDER",
    "matchText": "where should we go",
    "replacementText": "where we should go",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "the",
      "staff"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I006",
    "source": "issue",
    "sentenceId": "PARA-0002-S04",
    "ruleId": "SUGGEST_CONSTRUCTION",
    "matchText": "suggested us to visit",
    "replacementText": "suggested that we visit",
    "acceptableAlternatives": [
      "suggested visiting"
    ],
    "confidence": 1,
    "leftContext": [
      "they"
    ],
    "rightContext": [
      "an",
      "ancient"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I007",
    "source": "issue",
    "sentenceId": "PARA-0002-S04",
    "ruleId": "PASSIVE_RELATIVE_CLAUSE",
    "matchText": "that built",
    "replacementText": "that was built",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "ancient",
      "temple"
    ],
    "rightContext": [
      "over",
      "five"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I008",
    "source": "issue",
    "sentenceId": "PARA-0002-S05",
    "ruleId": "RAIN_IT_CONSTRUCTION",
    "matchText": "the weather",
    "replacementText": "it",
    "acceptableAlternatives": [
      "the weather was rainy"
    ],
    "confidence": 1,
    "leftContext": [
      "although"
    ],
    "rightContext": [
      "was",
      "heavily"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I009",
    "source": "issue",
    "sentenceId": "PARA-0002-S05",
    "ruleId": "ADVERB_POSITION",
    "matchText": "heavily raining",
    "replacementText": "raining heavily",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "weather",
      "was"
    ],
    "rightContext": [
      "the",
      "temple"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I010",
    "source": "issue",
    "sentenceId": "PARA-0002-S06",
    "ruleId": "THIRD_CONDITIONAL_RESULT",
    "matchText": "would not got",
    "replacementText": "would not have got",
    "acceptableAlternatives": [
      "would not have gotten"
    ],
    "confidence": 1,
    "leftContext": [
      "umbrella",
      "we"
    ],
    "rightContext": [
      "wet"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I011",
    "source": "issue",
    "sentenceId": "PARA-0002-S07",
    "ruleId": "MANY_PLURAL_NOUN",
    "matchText": "many memory",
    "replacementText": "many memories",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "gave",
      "us"
    ],
    "rightContext": [
      "and",
      "broaden"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0002-I012",
    "source": "issue",
    "sentenceId": "PARA-0002-S07",
    "ruleId": "PAST_TENSE_PARALLEL",
    "matchText": "broaden",
    "replacementText": "broadened",
    "acceptableAlternatives": [],
    "confidence": 1,
    "leftContext": [
      "memory",
      "and"
    ],
    "rightContext": [
      "our",
      "knowledge"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I001",
    "source": "issue",
    "sentenceId": "PARA-0003-S01",
    "ruleId": "ARTICLE_INDEFINITE_CONSONANT_SOUND_A",
    "matchText": "an",
    "replacementText": "a",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "month",
      "i",
      "joined"
    ],
    "rightContext": [
      "community",
      "reading",
      "programme"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I002",
    "source": "issue",
    "sentenceId": "PARA-0003-S02",
    "ruleId": "NOUN_EACH_SINGULAR_COUNT_NOUN",
    "matchText": "volunteers",
    "replacementText": "volunteer",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "gave",
      "each"
    ],
    "rightContext": [
      "a",
      "guide"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I003",
    "source": "issue",
    "sentenceId": "PARA-0003-S02",
    "ruleId": "VERB_ASK_NP_TO_INFINITIVE",
    "matchText": "arriving",
    "replacementText": "to arrive",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "asked",
      "us"
    ],
    "rightContext": [
      "on",
      "saturday"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I004",
    "source": "issue",
    "sentenceId": "PARA-0003-S03",
    "ruleId": "TO_BASE_VERB",
    "matchText": "helping",
    "replacementText": "help",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "was",
      "to"
    ],
    "rightContext": [
      "children",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I005",
    "source": "issue",
    "sentenceId": "PARA-0003-S03",
    "ruleId": "SVA_PAST_PLURAL_SUBJECT_WERE",
    "matchText": "that was",
    "replacementText": "that were",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "choose",
      "books"
    ],
    "rightContext": [
      "suitable",
      "for"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I006",
    "source": "issue",
    "sentenceId": "PARA-0003-S04",
    "ruleId": "PREP_INTERESTED_IN",
    "matchText": "on",
    "replacementText": "in",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "he",
      "was",
      "interested"
    ],
    "rightContext": [
      "space",
      "so",
      "i"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I007",
    "source": "issue",
    "sentenceId": "PARA-0003-S07",
    "ruleId": "VERB_ENJOY_GERUND",
    "matchText": "to work",
    "replacementText": "working",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "i",
      "enjoyed"
    ],
    "rightContext": [
      "there",
      "because"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0003-I008",
    "source": "issue",
    "sentenceId": "PARA-0003-S07",
    "ruleId": "WORDFORM_MAKE_OBJECT_ADJECTIVE",
    "matchText": "confidence",
    "replacementText": "confident",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "me",
      "more"
    ],
    "rightContext": [
      "when",
      "speaking"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I001",
    "source": "issue",
    "sentenceId": "PARA-0004-S01",
    "ruleId": "SVA_PAST_SINGULAR_SUBJECT_WAS",
    "matchText": "were",
    "replacementText": "was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "because",
      "our",
      "fridge"
    ],
    "rightContext": [
      "almost",
      "empty"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I002",
    "source": "issue",
    "sentenceId": "PARA-0004-S02",
    "ruleId": "INFORMATION_UNCOUNTABLE",
    "matchText": "many information",
    "replacementText": "much information",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "app",
      "showed"
    ],
    "rightContext": [
      "and",
      "allowed"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I003",
    "source": "issue",
    "sentenceId": "PARA-0004-S02",
    "ruleId": "VERB_ALLOW_NP_TO_INFINITIVE",
    "matchText": "allowed customers compare",
    "replacementText": "allowed customers to compare",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "information",
      "and"
    ],
    "rightContext": [
      "prices",
      "between"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I004",
    "source": "issue",
    "sentenceId": "PARA-0004-S03",
    "ruleId": "INDIRECT_QUESTION_ORDER",
    "matchText": "where could we buy",
    "replacementText": "where we could buy",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "asked",
      "me"
    ],
    "rightContext": [
      "cheaper",
      "fruit"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I005",
    "source": "issue",
    "sentenceId": "PARA-0004-S04",
    "ruleId": "VERB_DECIDE_TO_INFINITIVE",
    "matchText": "ordering",
    "replacementText": "to order",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "we",
      "decided"
    ],
    "rightContext": [
      "from",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I006",
    "source": "issue",
    "sentenceId": "PARA-0004-S04",
    "ruleId": "CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
    "matchText": "that located",
    "replacementText": "that was located",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "from",
      "a",
      "supermarket"
    ],
    "rightContext": [
      "near",
      "our",
      "home"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I007",
    "source": "issue",
    "sentenceId": "PARA-0004-S05",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "could to deliver",
    "replacementText": "could deliver",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "driver"
    ],
    "rightContext": [
      "the",
      "bags"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I008",
    "source": "issue",
    "sentenceId": "PARA-0004-S07",
    "ruleId": "NOUN_NUMERAL_PLURAL_COUNT_NOUN",
    "matchText": "bottle",
    "replacementText": "bottles",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "arrived",
      "two"
    ],
    "rightContext": [
      "of",
      "milk"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I009",
    "source": "issue",
    "sentenceId": "PARA-0004-S07",
    "ruleId": "SVA_PAST_PLURAL_SUBJECT_WERE",
    "matchText": "was",
    "replacementText": "were",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "bottle",
      "of",
      "milk"
    ],
    "rightContext": [
      "missing"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I010",
    "source": "issue",
    "sentenceId": "PARA-0004-S08",
    "ruleId": "VERB_CONTACT_DIRECT_OBJECT",
    "matchText": "contacted with",
    "replacementText": "contacted",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "i"
    ],
    "rightContext": [
      "support",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I011",
    "source": "issue",
    "sentenceId": "PARA-0004-S08",
    "ruleId": "VERB_DISCUSS_DIRECT_OBJECT",
    "matchText": "discussed about",
    "replacementText": "discussed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "support",
      "and"
    ],
    "rightContext": [
      "the",
      "problem"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0004-I012",
    "source": "issue",
    "sentenceId": "PARA-0004-S08",
    "ruleId": "PARALLEL_PAST_TENSE_COORDINATED",
    "matchText": "refund",
    "replacementText": "refunded",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "items",
      "and"
    ],
    "rightContext": [
      "the",
      "fee"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I001",
    "source": "issue",
    "sentenceId": "PARA-0005-S02",
    "ruleId": "SVA_PRESENT_SINGULAR_HEAD_OF_PHRASE",
    "matchText": "are",
    "replacementText": "is",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "list",
      "of",
      "places"
    ],
    "rightContext": [
      "on",
      "the",
      "noticeboard"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I002",
    "source": "issue",
    "sentenceId": "PARA-0005-S02",
    "ruleId": "SVA_PRESENT_NEITHER_SINGULAR_S_FORM",
    "matchText": "include",
    "replacementText": "includes",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "neither",
      "route"
    ],
    "rightContext": [
      "a",
      "climb"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I003",
    "source": "issue",
    "sentenceId": "PARA-0005-S03",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "must to bring",
    "replacementText": "must bring",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "said",
      "we"
    ],
    "rightContext": [
      "water",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I004",
    "source": "issue",
    "sentenceId": "PARA-0005-S03",
    "ruleId": "NOUN_EACH_SINGULAR_COUNT_NOUN",
    "matchText": "members",
    "replacementText": "member",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "asked",
      "each"
    ],
    "rightContext": [
      "arrive",
      "at"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I005",
    "source": "issue",
    "sentenceId": "PARA-0005-S03",
    "ruleId": "VERB_ASK_NP_TO_INFINITIVE",
    "matchText": "arrive",
    "replacementText": "to arrive",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "each",
      "members"
    ],
    "rightContext": [
      "at",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I006",
    "source": "issue",
    "sentenceId": "PARA-0005-S05",
    "ruleId": "COUNT_FEWER_PLURAL_COUNT_NOUN",
    "matchText": "less",
    "replacementText": "fewer",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "there",
      "are"
    ],
    "rightContext": [
      "buses",
      "in"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I007",
    "source": "issue",
    "sentenceId": "PARA-0005-S06",
    "ruleId": "CONDITIONAL_FIRST_IF_PRESENT",
    "matchText": "it will rain",
    "replacementText": "it rains",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "if"
    ],
    "rightContext": [
      "the",
      "group"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I008",
    "source": "issue",
    "sentenceId": "PARA-0005-S06",
    "ruleId": "CLAUSE_RELATIVE_PASSIVE_BE_PARTICIPLE",
    "matchText": "that located",
    "replacementText": "that is located",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "visit",
      "a",
      "museum"
    ],
    "rightContext": [
      "nearby"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0005-I009",
    "source": "issue",
    "sentenceId": "PARA-0005-S07",
    "ruleId": "SVA_PRESENT_UNCOUNTABLE_SUBJECT_SINGULAR_BE",
    "matchText": "are",
    "replacementText": "is",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "equipment"
    ],
    "rightContext": [
      "stored",
      "there"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I001",
    "source": "issue",
    "sentenceId": "PARA-0006-S01",
    "ruleId": "PREP_DESPITE_NO_OF",
    "matchText": "Despite of receiving",
    "replacementText": "Despite receiving",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "only",
      "a"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I002",
    "source": "issue",
    "sentenceId": "PARA-0006-S01",
    "ruleId": "NOUN_ONE_OF_SUPERLATIVE_PLURAL_NOUN",
    "matchText": "one of the most useful project",
    "replacementText": "one of the most useful projects",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "has",
      "become"
    ],
    "rightContext": [
      "in",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I003",
    "source": "issue",
    "sentenceId": "PARA-0006-S02",
    "ruleId": "PREP_DURATION_FOR_PERIOD",
    "matchText": "since six months",
    "replacementText": "for six months",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "has",
      "operated"
    ],
    "rightContext": [
      "and",
      "used"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I004",
    "source": "issue",
    "sentenceId": "PARA-0006-S02",
    "ruleId": "VERB_USED_TO_BASE_VERB",
    "matchText": "used to offering",
    "replacementText": "used to offer",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "months",
      "and"
    ],
    "rightContext": [
      "help",
      "only"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I005",
    "source": "issue",
    "sentenceId": "PARA-0006-S03",
    "ruleId": "VERB_LOOK_FORWARD_TO_GERUND",
    "matchText": "look forward to learn",
    "replacementText": "look forward to learning",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "many",
      "residents"
    ],
    "rightContext": [
      "simple",
      "skills"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I006",
    "source": "issue",
    "sentenceId": "PARA-0006-S04",
    "ruleId": "VERB_MANAGE_TO_INFINITIVE",
    "matchText": "managed fixing",
    "replacementText": "managed to fix",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "volunteers"
    ],
    "rightContext": [
      "twenty",
      "items"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I007",
    "source": "issue",
    "sentenceId": "PARA-0006-S04",
    "ruleId": "VERB_PREVENT_NP_FROM_GERUND",
    "matchText": "prevented several batteries ending",
    "replacementText": "prevented several batteries from ending",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "items",
      "and"
    ],
    "rightContext": [
      "up",
      "in"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I008",
    "source": "issue",
    "sentenceId": "PARA-0006-S05",
    "ruleId": "VERB_EXPLAIN_THING_TO_PERSON",
    "matchText": "explained new visitors the safety rules",
    "replacementText": "explained the safety rules to new visitors",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "coordinator",
      "carefully"
    ],
    "rightContext": [
      "and",
      "provided"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I009",
    "source": "issue",
    "sentenceId": "PARA-0006-S05",
    "ruleId": "VERB_PROVIDE_NP_WITH_NP",
    "matchText": "provided every team by the necessary gloves",
    "replacementText": "provided every team with the necessary gloves",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "rules",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I010",
    "source": "issue",
    "sentenceId": "PARA-0006-S06",
    "ruleId": "VERB_REMIND_NP_TO_INFINITIVE",
    "matchText": "reminded to write",
    "replacementText": "reminded them to write",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "she",
      "also"
    ],
    "rightContext": [
      "their",
      "names"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I011",
    "source": "issue",
    "sentenceId": "PARA-0006-S07",
    "ruleId": "VERB_LET_NP_BASE_VERB",
    "matchText": "let children to test",
    "replacementText": "let children test",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "organisers"
    ],
    "rightContext": [
      "safe",
      "tools"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I012",
    "source": "issue",
    "sentenceId": "PARA-0006-S07",
    "ruleId": "VERB_MAKE_NP_BASE_VERB_ACTIVE",
    "matchText": "made everyone to wear",
    "replacementText": "made everyone wear",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "although",
      "they"
    ],
    "rightContext": [
      "eye",
      "protection"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I013",
    "source": "issue",
    "sentenceId": "PARA-0006-S08",
    "ruleId": "VERB_AVOID_GERUND",
    "matchText": "to touch",
    "replacementText": "touching",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "advised",
      "avoiding"
    ],
    "rightContext": [
      "loose",
      "wires"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I014",
    "source": "issue",
    "sentenceId": "PARA-0006-S08",
    "ruleId": "VERB_CONSIDER_GERUND",
    "matchText": "considering to replace",
    "replacementText": "considering replacing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "suggested"
    ],
    "rightContext": [
      "any",
      "cracked"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I015",
    "source": "issue",
    "sentenceId": "PARA-0006-S09",
    "ruleId": "VERB_INSIST_ON_GERUND",
    "matchText": "insisted checking",
    "replacementText": "insisted on checking",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "another",
      "volunteer"
    ],
    "rightContext": [
      "each",
      "cable"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I016",
    "source": "issue",
    "sentenceId": "PARA-0006-S09",
    "ruleId": "ADJ_RESPONSIBLE_FOR_GERUND",
    "matchText": "responsible recording",
    "replacementText": "responsible for recording",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "he",
      "was"
    ],
    "rightContext": [
      "every",
      "repair"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I017",
    "source": "issue",
    "sentenceId": "PARA-0006-S10",
    "ruleId": "COMP_PREFER_A_TO_B",
    "matchText": "prefer repairing old things than buying new ones",
    "replacementText": "prefer repairing old things to buying new ones",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "most",
      "visitors"
    ],
    "rightContext": [
      "and",
      "several"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I018",
    "source": "issue",
    "sentenceId": "PARA-0006-S10",
    "ruleId": "VERB_WOULD_RATHER_BASE_THAN_BASE",
    "matchText": "would rather to donate unused tools than throwing them away",
    "replacementText": "would rather donate unused tools than throw them away",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "said",
      "they"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I019",
    "source": "issue",
    "sentenceId": "PARA-0006-S11",
    "ruleId": "ADJ_ENOUGH_AFTER_ADJECTIVE",
    "matchText": "enough clear",
    "replacementText": "clear enough",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "instructions",
      "were"
    ],
    "rightContext": [
      "for",
      "beginners"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I020",
    "source": "issue",
    "sentenceId": "PARA-0006-S11",
    "ruleId": "DEGREE_SO_ADJECTIVE_THAT",
    "matchText": "such practical that",
    "replacementText": "so practical that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "demonstration",
      "was"
    ],
    "rightContext": [
      "nobody",
      "became"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I021",
    "source": "issue",
    "sentenceId": "PARA-0006-S12",
    "ruleId": "PARALLEL_BOTH_AND_MATCHING_GERUNDS",
    "matchText": "both sorting spare parts and to clean the tables",
    "replacementText": "both sorting spare parts and cleaning the tables",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "responsible",
      "for"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I022",
    "source": "issue",
    "sentenceId": "PARA-0006-S13",
    "ruleId": "CONJ_BETWEEN_AND_NOT_OR",
    "matchText": "between taking the item home or leaving it for collection",
    "replacementText": "between taking the item home and leaving it for collection",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "later",
      "chose"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I023",
    "source": "issue",
    "sentenceId": "PARA-0006-S14",
    "ruleId": "PRONOUN_AFTER_PREPOSITION_OBJECT_CASE",
    "matchText": "Between my neighbour and I",
    "replacementText": "Between my neighbour and me",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "we",
      "carried"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I024",
    "source": "issue",
    "sentenceId": "PARA-0006-S14",
    "ruleId": "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
    "matchText": "volunteers tools",
    "replacementText": "volunteers' tools",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "carried",
      "the"
    ],
    "rightContext": [
      "to",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I025",
    "source": "issue",
    "sentenceId": "PARA-0006-S14",
    "ruleId": "PRONOUN_RELATIVE_WHOSE_POSSESSIVE",
    "matchText": "who's bicycle",
    "replacementText": "whose bicycle",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "resident"
    ],
    "rightContext": [
      "had",
      "been"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I026",
    "source": "issue",
    "sentenceId": "PARA-0006-S15",
    "ruleId": "COUNT_NUMBER_OF_PLURAL_COUNT_NOUN",
    "matchText": "amount of volunteers",
    "replacementText": "number of volunteers",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the"
    ],
    "rightContext": [
      "was",
      "encouraging"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I027",
    "source": "issue",
    "sentenceId": "PARA-0006-S15",
    "ruleId": "DETERMINER_OTHER_BEFORE_PLURAL_NOUN",
    "matchText": "others participants",
    "replacementText": "other participants",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "while",
      "the"
    ],
    "rightContext": [
      "promised",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I028",
    "source": "issue",
    "sentenceId": "PARA-0006-S16",
    "ruleId": "TENSE_PAST_PERFECT_BY_THE_TIME_EARLIER_EVENT",
    "matchText": "already left",
    "replacementText": "had already left",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "final",
      "guest"
    ],
    "rightContext": [
      "the",
      "coordinator"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0006-I029",
    "source": "issue",
    "sentenceId": "PARA-0006-S16",
    "ruleId": "PUNCT_COMMA_SPLICE_SEMICOLON",
    "matchText": ",",
    "replacementText": ";",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "guest",
      "already",
      "left"
    ],
    "rightContext": [
      "the",
      "coordinator",
      "still"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I001",
    "source": "issue",
    "sentenceId": "PARA-0007-S01",
    "ruleId": "PHRASAL_SET_UP_ESTABLISH_PARTICLE_UP",
    "matchText": "set out",
    "replacementText": "set up",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "council"
    ],
    "rightContext": [
      "a",
      "panel"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I002",
    "source": "issue",
    "sentenceId": "PARA-0007-S01",
    "ruleId": "PHRASAL_LOOK_INTO_NO_EXTRA_PREPOSITION",
    "matchText": "look into on",
    "replacementText": "look into",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "panel",
      "to"
    ],
    "rightContext": [
      "why",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I003",
    "source": "issue",
    "sentenceId": "PARA-0007-S01",
    "ruleId": "COLLOC_FALL_BEHIND_SCHEDULE",
    "matchText": "fallen beneath schedule",
    "replacementText": "fallen behind schedule",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "programme",
      "had"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I004",
    "source": "issue",
    "sentenceId": "PARA-0007-S02",
    "ruleId": "PHRASAL_FOLLOW_UP_ON_COMPLAINT",
    "matchText": "follow on every complaint",
    "replacementText": "follow up on every complaint",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "engineers",
      "to"
    ],
    "rightContext": [
      "and",
      "come"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I005",
    "source": "issue",
    "sentenceId": "PARA-0007-S02",
    "ruleId": "PHRASAL_COME_UP_WITH_PLAN",
    "matchText": "come up to a plan",
    "replacementText": "come up with a plan",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "complaint",
      "and"
    ],
    "rightContext": [
      "that",
      "would"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I006",
    "source": "issue",
    "sentenceId": "PARA-0007-S02",
    "ruleId": "PREP_ACCOUNT_FOR_EXPLANATION",
    "matchText": "account about",
    "replacementText": "account for",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "would"
    ],
    "rightContext": [
      "the",
      "failures"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I007",
    "source": "issue",
    "sentenceId": "PARA-0007-S03",
    "ruleId": "CLAUSE_NOT_ONLY_INITIAL_INVERSION",
    "matchText": "Not only several contractors failed",
    "replacementText": "Not only did several contractors fail",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "to",
      "comply"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I008",
    "source": "issue",
    "sentenceId": "PARA-0007-S03",
    "ruleId": "PREP_COMPLY_WITH_REQUIREMENT",
    "matchText": "comply to",
    "replacementText": "comply with",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "failed",
      "to"
    ],
    "rightContext": [
      "the",
      "safety"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I009",
    "source": "issue",
    "sentenceId": "PARA-0007-S03",
    "ruleId": "CONJ_NOT_ONLY_BUT_ALSO_CLAUSES",
    "matchText": "and they also",
    "replacementText": "but they also",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "safety",
      "code"
    ],
    "rightContext": [
      "tried",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I010",
    "source": "issue",
    "sentenceId": "PARA-0007-S03",
    "ruleId": "PHRASAL_COVER_UP_DIRECT_OBJECT",
    "matchText": "cover up about delays",
    "replacementText": "cover up delays",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "tried",
      "to"
    ],
    "rightContext": [
      "that",
      "should"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I011",
    "source": "issue",
    "sentenceId": "PARA-0007-S04",
    "ruleId": "CLAUSE_NO_SOONER_PAST_PERFECT_INVERSION",
    "matchText": "No sooner the investigators had",
    "replacementText": "No sooner had the investigators",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "drawn",
      "up"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I012",
    "source": "issue",
    "sentenceId": "PARA-0007-S04",
    "ruleId": "PHRASAL_DRAW_UP_DIRECT_OBJECT",
    "matchText": "drawn up on a timetable",
    "replacementText": "drawn up a timetable",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "investigators",
      "had"
    ],
    "rightContext": [
      "when",
      "one"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I013",
    "source": "issue",
    "sentenceId": "PARA-0007-S04",
    "ruleId": "CONJ_NO_SOONER_THAN",
    "matchText": "when",
    "replacementText": "than",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "on",
      "a",
      "timetable"
    ],
    "rightContext": [
      "one",
      "supplier",
      "pulled"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I014",
    "source": "issue",
    "sentenceId": "PARA-0007-S04",
    "ruleId": "PHRASAL_PULL_OUT_OF_PROJECT",
    "matchText": "pulled off of the project",
    "replacementText": "pulled out of the project",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "one",
      "supplier"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I015",
    "source": "issue",
    "sentenceId": "PARA-0007-S05",
    "ruleId": "CLAUSE_ONLY_AFTER_INITIAL_INVERSION",
    "matchText": "the panel ruled",
    "replacementText": "did the panel rule",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "been",
      "examined"
    ],
    "rightContext": [
      "out",
      "against"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I016",
    "source": "issue",
    "sentenceId": "PARA-0007-S05",
    "ruleId": "PHRASAL_RULE_OUT_DIRECT_OBJECT",
    "matchText": "against fraud",
    "replacementText": "fraud",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "ruled",
      "out"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I017",
    "source": "issue",
    "sentenceId": "PARA-0007-S06",
    "ruleId": "CLAUSE_FUSED_RELATIVE_NO_RESUMPTIVE_PRONOUN",
    "matchText": "What it concerned",
    "replacementText": "What concerned",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "residents",
      "most"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I018",
    "source": "issue",
    "sentenceId": "PARA-0007-S06",
    "ruleId": "PHRASAL_PUT_OFF_GERUND",
    "matchText": "put off replace",
    "replacementText": "put off replacing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "officials",
      "had"
    ],
    "rightContext": [
      "pumps",
      "on"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I019",
    "source": "issue",
    "sentenceId": "PARA-0007-S06",
    "ruleId": "CLAUSE_RELATIVE_FRONTED_PREPOSITION_WHICH",
    "matchText": "on that",
    "replacementText": "on which",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "replace",
      "pumps"
    ],
    "rightContext": [
      "several",
      "low-lying"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I020",
    "source": "issue",
    "sentenceId": "PARA-0007-S07",
    "ruleId": "CLAUSE_RECOMMEND_THAT_BASE_SUBJUNCTIVE",
    "matchText": "contractor provides",
    "replacementText": "contractor provide",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "each"
    ],
    "rightContext": [
      "monthly",
      "evidence"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I021",
    "source": "issue",
    "sentenceId": "PARA-0007-S07",
    "ruleId": "CLAUSE_RECOMMEND_THAT_PASSIVE_BE_SUBJUNCTIVE",
    "matchText": "drills carried out",
    "replacementText": "drills be carried out",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "emergency"
    ],
    "rightContext": [
      "twice",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I022",
    "source": "issue",
    "sentenceId": "PARA-0007-S08",
    "ruleId": "CLAUSE_ESSENTIAL_THAT_SUBJUNCTIVE_BE",
    "matchText": "system is tested",
    "replacementText": "system be tested",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "revised"
    ],
    "rightContext": [
      "before",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I023",
    "source": "issue",
    "sentenceId": "PARA-0007-S08",
    "ruleId": "TENSE_BEFORE_FUTURE_EVENT_PRESENT_SIMPLE",
    "matchText": "rainy season began",
    "replacementText": "rainy season begins",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "before",
      "the"
    ],
    "rightContext": [
      "lest",
      "another"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I024",
    "source": "issue",
    "sentenceId": "PARA-0007-S08",
    "ruleId": "CLAUSE_LEST_BASE_SUBJUNCTIVE",
    "matchText": "lest another breakdown leaves",
    "replacementText": "lest another breakdown leave",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "season",
      "began"
    ],
    "rightContext": [
      "families",
      "without"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I025",
    "source": "issue",
    "sentenceId": "PARA-0007-S09",
    "ruleId": "CONDITIONAL_INVERTED_HAD_NO_IF",
    "matchText": "If had the council acted",
    "replacementText": "Had the council acted",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "sooner",
      "it"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I026",
    "source": "issue",
    "sentenceId": "PARA-0007-S09",
    "ruleId": "CLAUSE_REPORTING_PASSIVE_PERFECT_INFINITIVE",
    "matchText": "is believed having cost",
    "replacementText": "is believed to have cost",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "damage",
      "that"
    ],
    "rightContext": [
      "local",
      "businesses"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I027",
    "source": "issue",
    "sentenceId": "PARA-0007-S10",
    "ruleId": "CLAUSE_MUCH_AS_CONCESSIVE",
    "matchText": "Much although",
    "replacementText": "Much as",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "mayor"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I028",
    "source": "issue",
    "sentenceId": "PARA-0007-S10",
    "ruleId": "PHRASAL_LIVE_UP_TO_PROMISE",
    "matchText": "live up with",
    "replacementText": "live up to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "failed",
      "to"
    ],
    "rightContext": [
      "its",
      "promises"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I029",
    "source": "issue",
    "sentenceId": "PARA-0007-S11",
    "ruleId": "MOOD_WOULD_RATHER_DIFFERENT_SUBJECT_PAST",
    "matchText": "would rather the council publishes",
    "replacementText": "would rather the council published",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "residents"
    ],
    "rightContext": [
      "all",
      "future"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I030",
    "source": "issue",
    "sentenceId": "PARA-0007-S11",
    "ruleId": "PARALLEL_WOULD_RATHER_SHARED_SUBJECT_PAST",
    "matchText": "than withholding",
    "replacementText": "than withheld",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "future",
      "reports"
    ],
    "rightContext": [
      "inconvenient",
      "findings"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I031",
    "source": "issue",
    "sentenceId": "PARA-0007-S12",
    "ruleId": "TENSE_FUTURE_PERFECT_BY_DEADLINE",
    "matchText": "take",
    "replacementText": "have taken",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "monitoring",
      "team",
      "will"
    ],
    "rightContext": [
      "over",
      "of",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I032",
    "source": "issue",
    "sentenceId": "PARA-0007-S12",
    "ruleId": "PHRASAL_TAKE_OVER_FROM_PREDECESSOR",
    "matchText": "of",
    "replacementText": "from",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "take",
      "over"
    ],
    "rightContext": [
      "the",
      "temporary",
      "inspectors"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I033",
    "source": "issue",
    "sentenceId": "PARA-0007-S13",
    "ruleId": "CLAUSE_HOWEVER_ADJECTIVE_CONCESSIVE_ORDER",
    "matchText": "However the repairs complicated may become",
    "replacementText": "However complicated the repairs may become",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "officials",
      "must"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I034",
    "source": "issue",
    "sentenceId": "PARA-0007-S13",
    "ruleId": "PREP_DEAL_WITH_PROBLEM",
    "matchText": "deal about",
    "replacementText": "deal with",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "officials",
      "must"
    ],
    "rightContext": [
      "them",
      "transparently"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I035",
    "source": "issue",
    "sentenceId": "PARA-0007-S14",
    "ruleId": "PARTICIPLE_PERFECT_MATCHED_SUBJECT",
    "matchText": "Having reviewed the evidence, the conclusion was",
    "replacementText": "Having reviewed the evidence, the panel concluded",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "that",
      "what"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I036",
    "source": "issue",
    "sentenceId": "PARA-0007-S15",
    "ruleId": "COMP_CORRELATIVE_THE_MORE_THE_LESS",
    "matchText": "similar failures are the less likely",
    "replacementText": "the less likely similar failures are",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "work",
      "together"
    ],
    "rightContext": [
      "to",
      "recur"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I037",
    "source": "issue",
    "sentenceId": "PARA-0007-S16",
    "ruleId": "TENSE_UNTIL_PRESENT_PERFECT_NOT_WILL",
    "matchText": "will be implemented",
    "replacementText": "have been implemented",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "all",
      "recommendations"
    ],
    "rightContext": [
      "no",
      "department"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0007-I038",
    "source": "issue",
    "sentenceId": "PARA-0007-S16",
    "ruleId": "COLLOC_TAKE_IT_FOR_GRANTED",
    "matchText": "take it as granted",
    "replacementText": "take it for granted",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "department",
      "can"
    ],
    "rightContext": [
      "that",
      "public"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I001",
    "source": "issue",
    "sentenceId": "PARA-0008-S02",
    "ruleId": "VERB_AGREE_THAT_FINITE_CLAUSE",
    "matchText": "agree with preventing illness is",
    "replacementText": "agree that preventing illness is",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "i",
      "completely"
    ],
    "rightContext": [
      "more",
      "important"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I002",
    "source": "issue",
    "sentenceId": "PARA-0008-S02",
    "ruleId": "COMP_MORE_ADJECTIVE_THAN_COMPLEMENT",
    "matchText": "more important to treating",
    "replacementText": "more important than treating",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "illness",
      "is"
    ],
    "rightContext": [
      "it",
      "after"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I003",
    "source": "issue",
    "sentenceId": "PARA-0008-S02",
    "ruleId": "COLLOC_GIVE_NP_PRIORITY",
    "matchText": "give the strongest priority for prevention",
    "replacementText": "give prevention the strongest priority",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "should",
      "therefore"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I004",
    "source": "issue",
    "sentenceId": "PARA-0008-S03",
    "ruleId": "CONJ_BOTH_AND_REQUIRED",
    "matchText": "both money as human suffering",
    "replacementText": "both money and human suffering",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "prevention",
      "saves"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I005",
    "source": "issue",
    "sentenceId": "PARA-0008-S04",
    "ruleId": "PREP_INVEST_IN_FIELD",
    "matchText": "invest on health education",
    "replacementText": "invest in health education",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "when",
      "governments"
    ],
    "rightContext": [
      "vaccination",
      "programmes"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I006",
    "source": "issue",
    "sentenceId": "PARA-0008-S04",
    "ruleId": "MODAL_PASSIVE_BE_PARTICIPLE",
    "matchText": "conditions can stop",
    "replacementText": "conditions can be stopped",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "many",
      "serious"
    ],
    "rightContext": [
      "before",
      "they"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I007",
    "source": "issue",
    "sentenceId": "PARA-0008-S04",
    "ruleId": "WORDFORM_NOUN_PREMODIFIER_MEDICAL_ADJECTIVE",
    "matchText": "medicine crises",
    "replacementText": "medical crises",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "become",
      "expensive"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I008",
    "source": "issue",
    "sentenceId": "PARA-0008-S05",
    "ruleId": "CLAUSE_RELATIVE_RESTRICTIVE_THAT_NO_COMMAS",
    "matchText": "A health system, that only responds after people are already sick, is",
    "replacementText": "A health system that only responds after people are already sick is",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "always",
      "fighting"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I009",
    "source": "issue",
    "sentenceId": "PARA-0008-S05",
    "ruleId": "PREP_PAY_FOR_SERVICE",
    "matchText": "pay long-term treatment",
    "replacementText": "pay for long-term treatment",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "taxpayers",
      "must"
    ],
    "rightContext": [
      "that",
      "might"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I010",
    "source": "issue",
    "sentenceId": "PARA-0008-S05",
    "ruleId": "MODAL_PERFECT_PASSIVE_HAVE_BEEN_PARTICIPLE",
    "matchText": "might have avoided",
    "replacementText": "might have been avoided",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "treatment",
      "that"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I011",
    "source": "issue",
    "sentenceId": "PARA-0008-S06",
    "ruleId": "VERB_GIVE_PASSIVE_DIRECT_OBJECT_NO_PREPOSITION",
    "matchText": "are given at places",
    "replacementText": "are given places",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "habits",
      "and"
    ],
    "rightContext": [
      "to",
      "exercise"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I012",
    "source": "issue",
    "sentenceId": "PARA-0008-S06",
    "ruleId": "ADJ_LIKELY_TO_INFINITIVE",
    "matchText": "less likely of developing",
    "replacementText": "less likely to develop",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "they",
      "are"
    ],
    "rightContext": [
      "obesity-related",
      "illnesses"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I013",
    "source": "issue",
    "sentenceId": "PARA-0008-S06",
    "ruleId": "COLLOC_LATER_IN_LIFE",
    "matchText": "later at life",
    "replacementText": "later in life",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "obesity-related",
      "illnesses"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I014",
    "source": "issue",
    "sentenceId": "PARA-0008-S07",
    "ruleId": "CLAUSE_MEAN_THAT_REQUIRES_FINITE_PREDICATE",
    "matchText": "This means that fewer patients needing",
    "replacementText": "This means fewer patients needing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "complex",
      "surgery"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I015",
    "source": "issue",
    "sentenceId": "PARA-0008-S08",
    "ruleId": "PREP_PROTECT_NP_FROM_NP",
    "matchText": "of",
    "replacementText": "from",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "it",
      "protects",
      "people"
    ],
    "rightContext": [
      "pain",
      "that",
      "no"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I016",
    "source": "issue",
    "sentenceId": "PARA-0008-S08",
    "ruleId": "CLAUSE_RELATIVE_OBJECT_NO_RESUMPTIVE_PRONOUN",
    "matchText": "erase it",
    "replacementText": "erase",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "can",
      "fully"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I017",
    "source": "issue",
    "sentenceId": "PARA-0008-S09",
    "ruleId": "CLAUSE_REASON_COPULAR_THAT_CLAUSE",
    "matchText": "reason is due to",
    "replacementText": "reason is that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "another"
    ],
    "rightContext": [
      "preventive",
      "spending"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I018",
    "source": "issue",
    "sentenceId": "PARA-0008-S10",
    "ruleId": "TENSE_PRESENT_PERFECT_PASSIVE",
    "matchText": "damage has done",
    "replacementText": "damage has been done",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "only",
      "after"
    ],
    "rightContext": [
      "whereas",
      "that"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I019",
    "source": "issue",
    "sentenceId": "PARA-0008-S10",
    "ruleId": "CONJ_WHEREAS_DIRECT_FINITE_CLAUSE",
    "matchText": "whereas that prevention",
    "replacementText": "whereas prevention",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "has",
      "done"
    ],
    "rightContext": [
      "can",
      "protect"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I020",
    "source": "issue",
    "sentenceId": "PARA-0008-S10",
    "ruleId": "COLLOC_TAKE_ROOT_NO_POSSESSIVE",
    "matchText": "illness takes its root",
    "replacementText": "illness takes root",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "communities",
      "before"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I021",
    "source": "issue",
    "sentenceId": "PARA-0008-S11",
    "ruleId": "PRONOUN_RELATIVE_HUMAN_NONRESTRICTIVE_WHO",
    "matchText": "which",
    "replacementText": "who",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "poorer",
      "families"
    ],
    "rightContext": [
      "may",
      "lack"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I022",
    "source": "issue",
    "sentenceId": "PARA-0008-S11",
    "ruleId": "VERB_LACK_DIRECT_OBJECT_NO_OF",
    "matchText": "of access",
    "replacementText": "access",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "may",
      "lack"
    ],
    "rightContext": [
      "for",
      "nutritious"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I023",
    "source": "issue",
    "sentenceId": "PARA-0008-S11",
    "ruleId": "PREP_ACCESS_TO_RESOURCE",
    "matchText": "for",
    "replacementText": "to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "lack",
      "of",
      "access"
    ],
    "rightContext": [
      "nutritious",
      "food",
      "safe"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I024",
    "source": "issue",
    "sentenceId": "PARA-0008-S12",
    "ruleId": "PARALLEL_SHARED_TO_INFINITIVE_BASE_VERBS",
    "matchText": "providing",
    "replacementText": "provide",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "air",
      "quality"
    ],
    "rightContext": [
      "free",
      "health"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I025",
    "source": "issue",
    "sentenceId": "PARA-0008-S12",
    "ruleId": "WORDFORM_MANNER_ADVERB_AFTER_VERB",
    "matchText": "wide",
    "replacementText": "widely",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "are",
      "shared"
    ],
    "rightContext": [
      "rather",
      "than"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I026",
    "source": "issue",
    "sentenceId": "PARA-0008-S12",
    "ruleId": "PARALLEL_RATHER_THAN_PASSIVE_PARTICIPLES",
    "matchText": "reserve",
    "replacementText": "reserved",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "rather",
      "than"
    ],
    "rightContext": [
      "for",
      "those"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I027",
    "source": "issue",
    "sentenceId": "PARA-0008-S12",
    "ruleId": "PRONOUN_RELATIVE_SUBJECT_WHO_NOT_WHOM",
    "matchText": "whom",
    "replacementText": "who",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "those"
    ],
    "rightContext": [
      "can",
      "afford"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I028",
    "source": "issue",
    "sentenceId": "PARA-0008-S12",
    "ruleId": "VERB_AFFORD_DIRECT_OBJECT_NO_FOR",
    "matchText": "for private",
    "replacementText": "private",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "can",
      "afford"
    ],
    "rightContext": [
      "care"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I029",
    "source": "issue",
    "sentenceId": "PARA-0008-S13",
    "ruleId": "LINKING_REMAIN_ADJECTIVE_COMPLEMENTS",
    "matchText": "remain healthily, productivity, and independently",
    "replacementText": "remain healthy, productive, and independent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "helps",
      "citizens"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I030",
    "source": "issue",
    "sentenceId": "PARA-0008-S14",
    "ruleId": "VERB_PRIORITISE_DIRECT_OBJECT_NO_ON",
    "matchText": "on the",
    "replacementText": "the",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "clearly",
      "prioritise"
    ],
    "rightContext": [
      "prevention",
      "of"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I031",
    "source": "issue",
    "sentenceId": "PARA-0008-S14",
    "ruleId": "CONJ_BECAUSE_FINITE_CLAUSE_NOT_BECAUSE_OF",
    "matchText": "of it",
    "replacementText": "it",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "disease",
      "because"
    ],
    "rightContext": [
      "reduces",
      "avoidable"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I032",
    "source": "issue",
    "sentenceId": "PARA-0008-S14",
    "ruleId": "PARALLEL_FINITE_VERBS_SHARED_SUBJECT",
    "matchText": "lowering",
    "replacementText": "lowers",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "avoidable",
      "suffering"
    ],
    "rightContext": [
      "pressure",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I033",
    "source": "issue",
    "sentenceId": "PARA-0008-S14",
    "ruleId": "PREP_PRESSURE_ON_SYSTEM",
    "matchText": "to",
    "replacementText": "on",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "suffering",
      "lowering",
      "pressure"
    ],
    "rightContext": [
      "healthcare",
      "systems",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I034",
    "source": "issue",
    "sentenceId": "PARA-0008-S15",
    "ruleId": "CONJ_ALTHOUGH_NO_COORDINATING_BUT",
    "matchText": "Although treating",
    "replacementText": "Treating",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "illness",
      "matters"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I035",
    "source": "issue",
    "sentenceId": "PARA-0008-S15",
    "ruleId": "COMP_DOUBLE_COMPARATIVE_NO_MORE",
    "matchText": "more wiser",
    "replacementText": "wiser",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "is",
      "the"
    ],
    "rightContext": [
      "use",
      "for"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0008-I036",
    "source": "issue",
    "sentenceId": "PARA-0008-S15",
    "ruleId": "COLLOC_USE_OF_PUBLIC_MONEY",
    "matchText": "for",
    "replacementText": "of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "more",
      "wiser",
      "use"
    ],
    "rightContext": [
      "public",
      "money"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I001",
    "source": "issue",
    "sentenceId": "PARA-0009-S01",
    "ruleId": "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER",
    "matchText": "many employers",
    "replacementText": "many employees",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "nowadays"
    ],
    "rightContext": [
      "blame",
      "on"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I002",
    "source": "issue",
    "sentenceId": "PARA-0009-S01",
    "ruleId": "VERB_COMPLAIN_ABOUT_PROBLEM",
    "matchText": "blame on the phenomenon",
    "replacementText": "complain about the phenomenon",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "many",
      "employers"
    ],
    "rightContext": [
      "of",
      "overwork"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I003",
    "source": "issue",
    "sentenceId": "PARA-0009-S01",
    "ruleId": "NOUN_RECURRING_HOLIDAY_PLURAL",
    "matchText": "during holiday",
    "replacementText": "during holidays",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "of",
      "overwork"
    ],
    "rightContext": [
      "as",
      "their"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I004",
    "source": "issue",
    "sentenceId": "PARA-0009-S01",
    "ruleId": "COLLOC_GIVE_PERSON_WORK",
    "matchText": "offer jobs for them",
    "replacementText": "give them work",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "their",
      "employers"
    ],
    "rightContext": [
      "apart",
      "from"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I005",
    "source": "issue",
    "sentenceId": "PARA-0009-S01",
    "ruleId": "PREP_OUTSIDE_WORKING_HOURS",
    "matchText": "apart from working hours",
    "replacementText": "outside working hours",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "them"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I006",
    "source": "issue",
    "sentenceId": "PARA-0009-S02",
    "ruleId": "COLLOC_STRONGLY_BELIEVE",
    "matchText": "highly believe",
    "replacementText": "strongly believe",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "i"
    ],
    "rightContext": [
      "that",
      "this"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I007",
    "source": "issue",
    "sentenceId": "PARA-0009-S02",
    "ruleId": "COLLOC_HAVE_EFFECTS_ON",
    "matchText": "has placed detrimental effects on",
    "replacementText": "has had detrimental effects on",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "this",
      "problem"
    ],
    "rightContext": [
      "workers",
      "in"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I008",
    "source": "issue",
    "sentenceId": "PARA-0009-S04",
    "ruleId": "COLLOC_ASSIGN_DUTIES",
    "matchText": "offer job duties",
    "replacementText": "assign duties",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "they",
      "can"
    ],
    "rightContext": [
      "and",
      "request"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I009",
    "source": "issue",
    "sentenceId": "PARA-0009-S04",
    "ruleId": "VERB_REQUEST_WORK_DIRECT_OBJECT",
    "matchText": "request on urgent projects",
    "replacementText": "request work on urgent projects",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "duties",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I010",
    "source": "issue",
    "sentenceId": "PARA-0009-S05",
    "ruleId": "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER",
    "matchText": "employers may sacrifice",
    "replacementText": "employees may sacrifice",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "as",
      "such"
    ],
    "rightContext": [
      "their",
      "holiday"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I011",
    "source": "issue",
    "sentenceId": "PARA-0009-S05",
    "ruleId": "NOUN_RECURRING_HOLIDAY_PLURAL",
    "matchText": "their holiday",
    "replacementText": "their holidays",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "may",
      "sacrifice"
    ],
    "rightContext": [
      "and",
      "take"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I012",
    "source": "issue",
    "sentenceId": "PARA-0009-S05",
    "ruleId": "PHRASAL_TAKE_ON_WORK",
    "matchText": "take",
    "replacementText": "take on",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "their",
      "holiday",
      "and"
    ],
    "rightContext": [
      "extra",
      "amount",
      "of"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I013",
    "source": "issue",
    "sentenceId": "PARA-0009-S05",
    "ruleId": "ARTICLE_AMOUNT_OF_WORK_AN",
    "matchText": "extra amount",
    "replacementText": "an extra amount",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "take"
    ],
    "rightContext": [
      "of",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I014",
    "source": "issue",
    "sentenceId": "PARA-0009-S07",
    "ruleId": "PREP_DEVOTE_TIME_TO",
    "matchText": "devote less time on relaxation",
    "replacementText": "devote less time to relaxation",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "they",
      "may"
    ],
    "rightContext": [
      "and",
      "be"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I015",
    "source": "issue",
    "sentenceId": "PARA-0009-S07",
    "ruleId": "NOUN_GENERIC_REQUEST_PLURAL",
    "matchText": "the request",
    "replacementText": "requests",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "prepared",
      "for"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I016",
    "source": "issue",
    "sentenceId": "PARA-0009-S08",
    "ruleId": "WORDCHOICE_RELIEVE_STRESS_NOT_RELIVE",
    "matchText": "relive their stress",
    "replacementText": "relieve their stress",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "chance",
      "to"
    ],
    "rightContext": [
      "during",
      "holiday"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I017",
    "source": "issue",
    "sentenceId": "PARA-0009-S08",
    "ruleId": "NOUN_RECURRING_HOLIDAY_PLURAL",
    "matchText": "during holiday",
    "replacementText": "during holidays",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "their",
      "stress"
    ],
    "rightContext": [
      "and",
      "which"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I018",
    "source": "issue",
    "sentenceId": "PARA-0009-S08",
    "ruleId": "CLAUSE_NONRESTRICTIVE_WHICH_NO_COORDINATING_AND",
    "matchText": ", and which",
    "replacementText": ", which",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "during",
      "holiday"
    ],
    "rightContext": [
      "may",
      "boost"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I019",
    "source": "issue",
    "sentenceId": "PARA-0009-S09",
    "ruleId": "ORTHOGRAPHY_TWENTY_FOUR_SEVEN_SLASH",
    "matchText": "247",
    "replacementText": "24/7",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "need",
      "to",
      "work"
    ],
    "rightContext": [
      "may",
      "spend",
      "less"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I020",
    "source": "issue",
    "sentenceId": "PARA-0009-S10",
    "ruleId": "NOUN_RECURRING_FAMILY_GATHERING_PLURAL",
    "matchText": "family gathering",
    "replacementText": "family gatherings",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "addition",
      "to"
    ],
    "rightContext": [
      "employers",
      "who"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I021",
    "source": "issue",
    "sentenceId": "PARA-0009-S10",
    "ruleId": "WORDCHOICE_EMPLOYEE_AFFECTED_WORKER_NOT_EMPLOYER",
    "matchText": "employers who have",
    "replacementText": "employees who have",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "family",
      "gathering"
    ],
    "rightContext": [
      "to",
      "stay"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I022",
    "source": "issue",
    "sentenceId": "PARA-0009-S10",
    "ruleId": "PREP_STAY_BEHIND_AT_WORK",
    "matchText": "stay behind for work",
    "replacementText": "stay behind at work",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "have",
      "to"
    ],
    "rightContext": [
      "may",
      "devote"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I023",
    "source": "issue",
    "sentenceId": "PARA-0009-S10",
    "ruleId": "PREP_DEVOTE_TIME_TO",
    "matchText": "devote less time in social activities",
    "replacementText": "devote less time to social activities",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "work",
      "may"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I024",
    "source": "issue",
    "sentenceId": "PARA-0009-S11",
    "ruleId": "COLLOC_HAVE_EFFECTS_ON",
    "matchText": "draws on negative effects to",
    "replacementText": "has negative effects on",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "peers",
      "and"
    ],
    "rightContext": [
      "their",
      "social"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I025",
    "source": "issue",
    "sentenceId": "PARA-0009-S12",
    "ruleId": "PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS",
    "matchText": "their working efficiency",
    "replacementText": "workers' working efficiency",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "employers",
      "enhances"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I026",
    "source": "issue",
    "sentenceId": "PARA-0009-S13",
    "ruleId": "SHARED_MODAL_PARALLEL",
    "matchText": "and to receive",
    "replacementText": "and receive",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "their",
      "employers"
    ],
    "rightContext": [
      "immediate",
      "responses"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I027",
    "source": "issue",
    "sentenceId": "PARA-0009-S14",
    "ruleId": "PRONOUN_AMBIGUOUS_THEY_EXPLICIT_WORKERS",
    "matchText": "as they have no obligation",
    "replacementText": "as workers have no obligation",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "than",
      "workers"
    ],
    "rightContext": [
      "to",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I028",
    "source": "issue",
    "sentenceId": "PARA-0009-S15",
    "ruleId": "PRONOUN_AMBIGUOUS_POSSESSIVE_EXPLICIT_WORKERS",
    "matchText": "respect their freedom",
    "replacementText": "respect workers' freedom",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "employers",
      "should"
    ],
    "rightContext": [
      "and",
      "support"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I029",
    "source": "issue",
    "sentenceId": "PARA-0009-S17",
    "ruleId": "NOUN_RECURRING_HOLIDAY_PLURAL",
    "matchText": "holiday",
    "replacementText": "holidays",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "workers",
      "during"
    ],
    "rightContext": [
      "which",
      "can"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I030",
    "source": "issue",
    "sentenceId": "PARA-0009-S17",
    "ruleId": "VERB_PROTECT_NP_FROM_NP",
    "matchText": "prevent them from excessive work,",
    "replacementText": "protect them from excessive work and",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "which",
      "can"
    ],
    "rightContext": [
      "loads",
      "of"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I031",
    "source": "issue",
    "sentenceId": "PARA-0009-S17",
    "ruleId": "PARALLEL_RESULT_PROTECT_AND_HELP",
    "matchText": "to keep",
    "replacementText": "can help them maintain",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "stress",
      "and"
    ],
    "rightContext": [
      "close",
      "relationship"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0009-I032",
    "source": "issue",
    "sentenceId": "PARA-0009-S17",
    "ruleId": "NOUN_GENERIC_RELATIONSHIP_PLURAL",
    "matchText": "relationship",
    "replacementText": "relationships",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "keep",
      "close"
    ],
    "rightContext": [
      "with",
      "their"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I001",
    "source": "issue",
    "sentenceId": "PARA-0010-S01",
    "ruleId": "CLAUSE_FRAGMENT_PURPOSE_ADJUNCT_MAIN_CLAUSE",
    "matchText": "In many schools, In order to train students discipline.",
    "replacementText": "In many schools, uniforms are required in order to instil discipline in students.",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [],
    "startsSentence": true,
    "endsSentence": true
  },
  {
    "patternId": "PARA-0010-I002",
    "source": "issue",
    "sentenceId": "PARA-0010-S02",
    "ruleId": "COLLOC_UNIFORM_REQUIREMENTS_COMPOUND_NOUN",
    "matchText": "requestment in uniform",
    "replacementText": "uniform requirements",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "have",
      "stringent"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I003",
    "source": "issue",
    "sentenceId": "PARA-0010-S03",
    "ruleId": "WORDFORM_DRESS_FREELY_ADVERB",
    "matchText": "dress with for more freedom",
    "replacementText": "dress more freely",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "children",
      "to"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I004",
    "source": "issue",
    "sentenceId": "PARA-0010-S04",
    "ruleId": "CLAUSE_ESPECIALLY_BECAUSE_FINITE_REASON",
    "matchText": "especially",
    "replacementText": "especially because",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "clear",
      "benefits"
    ],
    "rightContext": [
      "wearing",
      "uniform"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I005",
    "source": "issue",
    "sentenceId": "PARA-0010-S04",
    "ruleId": "ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
    "matchText": "wearing uniform",
    "replacementText": "wearing a uniform",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "clear",
      "benefits",
      "especially"
    ],
    "rightContext": [
      "can",
      "help",
      "students"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I006",
    "source": "issue",
    "sentenceId": "PARA-0010-S04",
    "ruleId": "ADVERB_FOCUS_MORE_AFTER_VERB",
    "matchText": "help students more focus",
    "replacementText": "help students focus more",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "uniform",
      "can"
    ],
    "rightContext": [
      "on",
      "studies"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I007",
    "source": "issue",
    "sentenceId": "PARA-0010-S05",
    "ruleId": "CLAUSE_COPULAR_ADVANTAGE_IS_THAT",
    "matchText": "One major advantage",
    "replacementText": "One major advantage is that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "wearing",
      "uniform"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I008",
    "source": "issue",
    "sentenceId": "PARA-0010-S05",
    "ruleId": "ARTICLE_SINGULAR_COUNT_UNIFORM_IN_GERUND",
    "matchText": "Wearing uniform",
    "replacementText": "wearing a uniform",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "one",
      "major",
      "advantage"
    ],
    "rightContext": [
      "can",
      "reduce",
      "this"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I009",
    "source": "issue",
    "sentenceId": "PARA-0010-S05",
    "ruleId": "COLLOC_ANXIETY_ABOUT_CLOTHING",
    "matchText": "this wearing anxiety",
    "replacementText": "anxiety about clothing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "can",
      "reduce"
    ],
    "rightContext": [
      "and",
      "help"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I010",
    "source": "issue",
    "sentenceId": "PARA-0010-S06",
    "ruleId": "NOUN_REDUNDANT_OUTFITS_CLOTHES",
    "matchText": "outfits clothes",
    "replacementText": "outfits",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "time",
      "choosing"
    ],
    "rightContext": [
      "they",
      "can"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I011",
    "source": "issue",
    "sentenceId": "PARA-0010-S06",
    "ruleId": "COLLOC_HAVE_TIME_TO_SLEEP",
    "matchText": "homework and get quality",
    "replacementText": "homework, have more",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "time",
      "for"
    ],
    "rightContext": [
      "time",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I012",
    "source": "issue",
    "sentenceId": "PARA-0010-S06",
    "ruleId": "SHARED_MODAL_PARALLEL",
    "matchText": "as well as students",
    "replacementText": "and",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "morning"
    ],
    "rightContext": [
      "maintain",
      "energy"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I013",
    "source": "issue",
    "sentenceId": "PARA-0010-S07",
    "ruleId": "ARTICLE_INDEFINITE_FIRST_MENTION_A",
    "matchText": "the fair",
    "replacementText": "a fair",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "can",
      "create"
    ],
    "rightContext": [
      "schools",
      "environment"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I014",
    "source": "issue",
    "sentenceId": "PARA-0010-S07",
    "ruleId": "NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_ENVIRONMENT",
    "matchText": "schools environment",
    "replacementText": "school environment",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "fair"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I015",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "VERB_ALLOW_NP_TO_INFINITIVE",
    "matchText": "causal wear",
    "replacementText": "to wear casual clothes",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "students"
    ],
    "rightContext": [
      "everyday",
      "schools"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I016",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "CLAUSE_EVERY_DAY_ADVERBIAL_POSITION_AND_NUMBER",
    "matchText": "everyday schools will become a faishon show",
    "replacementText": "schools will become fashion shows every day",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "causal",
      "wear"
    ],
    "rightContext": [
      "some",
      "affluent"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I017",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "PUNCT_COMMA_SPLICE_SEMICOLON",
    "matchText": ", Some",
    "replacementText": "; some",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "faishon",
      "show"
    ],
    "rightContext": [
      "affluent",
      "student"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I018",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "GENERAL_SOME_PLURAL",
    "matchText": "student",
    "replacementText": "students",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "some",
      "affluent"
    ],
    "rightContext": [
      "dressed",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I019",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "TENSE_GENERAL_PRESENT_CONSISTENCY",
    "matchText": "dressed",
    "replacementText": "dress",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "affluent",
      "student"
    ],
    "rightContext": [
      "to",
      "flex"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I020",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "ARTICLE_PLURAL_NOUN_NO_A",
    "matchText": "a normal students only have",
    "replacementText": "normal students have only",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "flex",
      "while"
    ],
    "rightContext": [
      "2-3",
      "outfits"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I021",
    "source": "issue",
    "sentenceId": "PARA-0010-S08",
    "ruleId": "PHRASAL_CHANGE_INTO_CLOTHING",
    "matchText": "change",
    "replacementText": "change into",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "outfits",
      "to"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I022",
    "source": "issue",
    "sentenceId": "PARA-0010-S09",
    "ruleId": "DETERMINER_POSSESSIVE_REQUIRES_NOUN",
    "matchText": "what their think",
    "replacementText": "what their friends think",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "care",
      "about"
    ],
    "rightContext": [
      "personal",
      "outfits"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I023",
    "source": "issue",
    "sentenceId": "PARA-0010-S09",
    "ruleId": "PUNCT_COMMA_SPLICE_CAUSAL_SO",
    "matchText": ", personal outfits",
    "replacementText": ", so personal outfits",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "their",
      "think"
    ],
    "rightContext": [
      "become",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I024",
    "source": "issue",
    "sentenceId": "PARA-0010-S10",
    "ruleId": "AMBIGUOUS_EXPAND_AFFORD_CONDITIONAL_RECONSTRUCTION",
    "matchText": "can't expand that even cause",
    "replacementText": "can't afford such clothes, this may even cause",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "some",
      "students"
    ],
    "rightContext": [
      "bullying",
      "in"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I025",
    "source": "issue",
    "sentenceId": "PARA-0010-S11",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "matchText": "Therefore",
    "replacementText": "Therefore,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "children",
      "will"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I026",
    "source": "issue",
    "sentenceId": "PARA-0010-S12",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "matchText": "For these reasons",
    "replacementText": "For these reasons,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "uniforms",
      "can"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I027",
    "source": "issue",
    "sentenceId": "PARA-0010-S12",
    "ruleId": "SPELLING_RESOLVE",
    "matchText": "reslove",
    "replacementText": "resolve",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "uniforms",
      "can"
    ],
    "rightContext": [
      "the",
      "students"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I028",
    "source": "issue",
    "sentenceId": "PARA-0010-S12",
    "ruleId": "POSSESSIVE_PLURAL_PROBLEMS_WITH_GERUND",
    "matchText": "the students choosing outfits problems",
    "replacementText": "students' problems with choosing outfits",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "can",
      "reslove"
    ],
    "rightContext": [
      "and",
      "make"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I029",
    "source": "issue",
    "sentenceId": "PARA-0010-S13",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "matchText": "However",
    "replacementText": "However,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "schools",
      "uniforms"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I030",
    "source": "issue",
    "sentenceId": "PARA-0010-S13",
    "ruleId": "NOUN_ATTRIBUTIVE_SINGULAR_SCHOOL_UNIFORM",
    "matchText": "schools uniforms",
    "replacementText": "school uniforms",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "however"
    ],
    "rightContext": [
      "also",
      "have"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I031",
    "source": "issue",
    "sentenceId": "PARA-0010-S14",
    "ruleId": "ORTHOGRAPHY_SENTENCE_INITIAL_CAPITAL",
    "matchText": "the",
    "replacementText": "The",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "most",
      "obvious",
      "one"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I032",
    "source": "issue",
    "sentenceId": "PARA-0010-S14",
    "ruleId": "CONJ_NEITHER_NOR_NEGATIVE_COORDINATION",
    "matchText": "not comfortable and practical",
    "replacementText": "neither comfortable nor practical",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "uniforms",
      "are"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I033",
    "source": "issue",
    "sentenceId": "PARA-0010-S15",
    "ruleId": "COLLOC_WICK_AWAY_SWEAT",
    "matchText": "take",
    "replacementText": "wick",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "decent",
      "they",
      "can't"
    ],
    "rightContext": [
      "away",
      "sweat",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I034",
    "source": "issue",
    "sentenceId": "PARA-0010-S15",
    "ruleId": "CLAUSE_MISSING_COPULA_ADJECTIVE_COMPLEMENT",
    "matchText": "uniform quality",
    "replacementText": "they are",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "sweat",
      "and"
    ],
    "rightContext": [
      "not",
      "warm"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I035",
    "source": "issue",
    "sentenceId": "PARA-0010-S15",
    "ruleId": "SPELLING_WINTER",
    "matchText": "the winnter",
    "replacementText": "winter",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "warm",
      "in"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I036",
    "source": "issue",
    "sentenceId": "PARA-0010-S16",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "matchText": "For example",
    "replacementText": "For example,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "student",
      "finishing"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I037",
    "source": "issue",
    "sentenceId": "PARA-0010-S16",
    "ruleId": "PARTICIPLE_MALFORMED_MODIFIER_POSSESSIVE_RECONSTRUCTION",
    "matchText": "the student finishing the PE leasson T-shirt",
    "replacementText": "after a student finishes a PE lesson, their T-shirt",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "example"
    ],
    "rightContext": [
      "always",
      "get"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I038",
    "source": "issue",
    "sentenceId": "PARA-0010-S16",
    "ruleId": "SINGULAR_SUBJECT_VERB",
    "matchText": "get",
    "replacementText": "gets",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "leasson",
      "t-shirt",
      "always"
    ],
    "rightContext": [
      "wet",
      "and",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I039",
    "source": "issue",
    "sentenceId": "PARA-0010-S16",
    "ruleId": "ADJ_TOO_TO_CAUSATIVE_KEEP_OBJECT",
    "matchText": "wet and the jacket too thin can't keep warm",
    "replacementText": "wet, and their jacket is too thin to keep them warm",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "always",
      "get"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I040",
    "source": "issue",
    "sentenceId": "PARA-0010-S18",
    "ruleId": "CONJ_ALTHOUGH_NO_COORDINATING_BUT",
    "matchText": "clothing but",
    "replacementText": "clothing,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "simplify"
    ],
    "rightContext": [
      "the",
      "suppliers"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I041",
    "source": "issue",
    "sentenceId": "PARA-0010-S18",
    "ruleId": "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
    "matchText": "suppliers price",
    "replacementText": "suppliers' prices",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "the"
    ],
    "rightContext": [
      "increase",
      "every"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I042",
    "source": "issue",
    "sentenceId": "PARA-0010-S18",
    "ruleId": "NOUN_EVERY_SINGULAR_COUNT_NOUN",
    "matchText": "every years",
    "replacementText": "every year",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "price",
      "increase"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I043",
    "source": "issue",
    "sentenceId": "PARA-0010-S19",
    "ruleId": "CLAUSE_COPULAR_PREPOSITIONAL_STAGE",
    "matchText": "in developmental stage",
    "replacementText": "are at a developmental stage",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "students"
    ],
    "rightContext": [
      "keep",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I044",
    "source": "issue",
    "sentenceId": "PARA-0010-S19",
    "ruleId": "CLAUSE_CONDITIONAL_MAIN_CLAUSE_SUBJECT_AND_PREDICATE",
    "matchText": "keep to change every year",
    "replacementText": "they need to change their uniforms every year",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "developmental",
      "stage"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I045",
    "source": "issue",
    "sentenceId": "PARA-0010-S20",
    "ruleId": "WORDFORM_LOW_INCOME_ATTRIBUTIVE_HYPHEN",
    "matchText": "income family this",
    "replacementText": "low-income families, this",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for"
    ],
    "rightContext": [
      "become",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I046",
    "source": "issue",
    "sentenceId": "PARA-0010-S20",
    "ruleId": "SINGULAR_SUBJECT_VERB",
    "matchText": "become",
    "replacementText": "becomes",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "family",
      "this"
    ],
    "rightContext": [
      "a",
      "heavy"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I047",
    "source": "issue",
    "sentenceId": "PARA-0010-S21",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "matchText": "Therefore",
    "replacementText": "Therefore,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "uniforms",
      "may"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I048",
    "source": "issue",
    "sentenceId": "PARA-0010-S21",
    "ruleId": "VERB_CREATE_NP_FOR_BENEFICIARY",
    "matchText": "create parents and students economic difficulties",
    "replacementText": "create economic difficulties for parents and students",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "can",
      "also"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I049",
    "source": "issue",
    "sentenceId": "PARA-0010-S22",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERBIAL_COMMA",
    "matchText": "conclusion",
    "replacementText": "conclusion,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "in"
    ],
    "rightContext": [
      "school",
      "uniforms"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I050",
    "source": "issue",
    "sentenceId": "PARA-0010-S22",
    "ruleId": "COLLOC_MAKE_DRESSING_EASIER",
    "matchText": "wearing",
    "replacementText": "dressing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "uniforms",
      "can",
      "make"
    ],
    "rightContext": [
      "easier",
      "for",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0010-I051",
    "source": "issue",
    "sentenceId": "PARA-0010-S22",
    "ruleId": "PUNCT_COORDINATED_INDEPENDENT_CLAUSES_COMMA",
    "matchText": "comparison",
    "replacementText": "comparison,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "reduce"
    ],
    "rightContext": [
      "but",
      "they"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I001",
    "source": "issue",
    "sentenceId": "PARA-0011-S01",
    "ruleId": "TENSE_PRESENT_PERFECT_CHANGE_TO_PRESENT_STATE",
    "matchText": "work become",
    "replacementText": "work has become",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "today's",
      "society"
    ],
    "rightContext": [
      "a",
      "part"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I002",
    "source": "issue",
    "sentenceId": "PARA-0011-S01",
    "ruleId": "NOUN_DISTRIBUTIVE_POSSESSIVE_PLURAL_LIVES",
    "matchText": "our life",
    "replacementText": "our lives",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "part",
      "of"
    ],
    "rightContext": [
      "so",
      "our"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I003",
    "source": "issue",
    "sentenceId": "PARA-0011-S01",
    "ruleId": "CLAUSE_MAIN_SUBJECT_NO_RESUMPTIVE_PRONOUN",
    "matchText": "our private time it has",
    "replacementText": "our private time has",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "life",
      "so"
    ],
    "rightContext": [
      "been",
      "connected"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I004",
    "source": "issue",
    "sentenceId": "PARA-0011-S02",
    "ruleId": "COLLOC_EXCESSIVE_WORKLOAD_PLURAL",
    "matchText": "over workload",
    "replacementText": "excessive workloads,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "caused",
      "by"
    ],
    "rightContext": [
      "leads",
      "to"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I005",
    "source": "issue",
    "sentenceId": "PARA-0011-S02",
    "ruleId": "CLAUSE_CAUSED_BY_NP_RELATIVE_RESULT",
    "matchText": "leads",
    "replacementText": "which lead",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "over",
      "workload"
    ],
    "rightContext": [
      "to",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I006",
    "source": "issue",
    "sentenceId": "PARA-0011-S03",
    "ruleId": "SVA_PRESENT_SINGULAR_GOVERNMENT_S_FORM",
    "matchText": "set",
    "replacementText": "sets",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "if",
      "the",
      "government"
    ],
    "rightContext": [
      "a",
      "limits",
      "maximum"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I007",
    "source": "issue",
    "sentenceId": "PARA-0011-S03",
    "ruleId": "NOUN_MAXIMUM_LIMIT_ON_WORKING_HOURS",
    "matchText": "limits maximum working hour",
    "replacementText": "maximum limit on working hours",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "set",
      "a"
    ],
    "rightContext": [
      "and",
      "set"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I008",
    "source": "issue",
    "sentenceId": "PARA-0011-S03",
    "ruleId": "CLAUSE_COORDINATED_IF_CLAUSES_EXPLICIT_SUBJECT",
    "matchText": "and",
    "replacementText": "and employees",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "maximum",
      "working",
      "hour"
    ],
    "rightContext": [
      "set",
      "personal",
      "boundaries"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I009",
    "source": "issue",
    "sentenceId": "PARA-0011-S03",
    "ruleId": "CLAUSE_FRONTED_IF_MAIN_CLAUSE_SUBJECT",
    "matchText": "boundaries",
    "replacementText": "boundaries, these measures",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "set",
      "personal"
    ],
    "rightContext": [
      "can",
      "protect"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I010",
    "source": "issue",
    "sentenceId": "PARA-0011-S03",
    "ruleId": "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
    "matchText": "employees",
    "replacementText": "employees'",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "boundaries",
      "can",
      "protect"
    ],
    "rightContext": [
      "work",
      "life",
      "balance"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I011",
    "source": "issue",
    "sentenceId": "PARA-0011-S03",
    "ruleId": "ORTHOGRAPHY_COMPOUND_WORK_LIFE_HYPHEN",
    "matchText": "work life",
    "replacementText": "work-life",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "protect",
      "employees"
    ],
    "rightContext": [
      "balance"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I012",
    "source": "issue",
    "sentenceId": "PARA-0011-S04",
    "ruleId": "SPELLING_EMPLOYEES",
    "matchText": "employess",
    "replacementText": "employees",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "many"
    ],
    "rightContext": [
      "facing",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I013",
    "source": "issue",
    "sentenceId": "PARA-0011-S04",
    "ruleId": "CLAUSE_THAT_PLURAL_SUBJECT_FINITE_PRESENT",
    "matchText": "facing",
    "replacementText": "face",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "many",
      "employess"
    ],
    "rightContext": [
      "a",
      "heavy"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I014",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "PUNCT_INTRODUCTORY_ADVERB_COMMA",
    "matchText": "Nowadays",
    "replacementText": "Nowadays,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "messaging",
      "app"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I015",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "NOUN_GENERIC_PLURAL_MESSAGING_APPS",
    "matchText": "app",
    "replacementText": "apps",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "nowadays",
      "messaging"
    ],
    "rightContext": [
      "are",
      "common",
      "caused"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I016",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "PARTICIPLE_RESULT_CAUSING_CLAUSE",
    "matchText": "common caused",
    "replacementText": "common, causing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "app",
      "are"
    ],
    "rightContext": [
      "staff",
      "have"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I017",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "VERB_CAUSE_NP_TO_INFINITIVE",
    "matchText": "staff have",
    "replacementText": "staff to have",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "common",
      "caused"
    ],
    "rightContext": [
      "a",
      "lot"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I018",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "PREP_REPLY_TO_MESSAGE",
    "matchText": "reply",
    "replacementText": "reply to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "messages",
      "to"
    ],
    "rightContext": [
      "since",
      "it"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I019",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "PUNCT_COMMA_SPLICE_SEMICOLON",
    "matchText": ",",
    "replacementText": ";",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "messages",
      "to",
      "reply"
    ],
    "rightContext": [
      "since",
      "it",
      "is"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I020",
    "source": "issue",
    "sentenceId": "PARA-0011-S05",
    "ruleId": "CONJ_SINCE_NO_RESULT_SO",
    "matchText": ", so",
    "replacementText": ",",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "documents",
      "and",
      "meetings"
    ],
    "rightContext": [
      "the",
      "end",
      "of"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I021",
    "source": "issue",
    "sentenceId": "PARA-0011-S06",
    "ruleId": "PUNCT_INTRODUCTORY_LINKER_COMMA",
    "matchText": "As a result",
    "replacementText": "As a result,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "a",
      "person"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I022",
    "source": "issue",
    "sentenceId": "PARA-0011-S08",
    "ruleId": "PARTICIPLE_FACED_WITH_CIRCUMSTANCE",
    "matchText": "Face of",
    "replacementText": "Faced with",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "high",
      "house"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I023",
    "source": "issue",
    "sentenceId": "PARA-0011-S08",
    "ruleId": "PARALLEL_PRICE_NOUNS_RISING_MODIFIER",
    "matchText": "bus fares and food keep going up",
    "replacementText": "rising bus fares and food prices",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "house",
      "prices"
    ],
    "rightContext": [
      "people",
      "give"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I024",
    "source": "issue",
    "sentenceId": "PARA-0011-S09",
    "ruleId": "CLAUSE_FRAGMENT_SUBJECT_ADJECTIVE_INFINITIVE_RECONSTRUCTION",
    "matchText": "their tired bodies to make money",
    "replacementText": "their bodies become tired as they work to make money",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "over",
      "time"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I025",
    "source": "issue",
    "sentenceId": "PARA-0011-S10",
    "ruleId": "WORDFORM_VERB_MODIFIED_BY_ADVERB_COMPARATIVE",
    "matchText": "they work become slower and slower",
    "replacementText": "they work more and more slowly",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "long",
      "time"
    ],
    "rightContext": [
      "and",
      "need"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I026",
    "source": "issue",
    "sentenceId": "PARA-0011-S10",
    "ruleId": "PUNCT_COMMA_SPLICE_SEMICOLON",
    "matchText": ", After",
    "replacementText": "; after",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "work"
    ],
    "rightContext": [
      "that",
      "they"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I027",
    "source": "issue",
    "sentenceId": "PARA-0011-S11",
    "ruleId": "CLAUSE_COPULAR_FOR_NP_TO_INFINITIVE",
    "matchText": "solution is the government to limit",
    "replacementText": "solution is for the government to limit",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "most",
      "effective"
    ],
    "rightContext": [
      "the",
      "maximum"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I028",
    "source": "issue",
    "sentenceId": "PARA-0011-S12",
    "ruleId": "FIXED_FOR_EXAMPLE_SINGULAR",
    "matchText": "For examples",
    "replacementText": "For example",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "clerks",
      "and"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I029",
    "source": "issue",
    "sentenceId": "PARA-0011-S13",
    "ruleId": "PUNCT_INTRODUCTORY_LINKER_COMMA",
    "matchText": "Also",
    "replacementText": "Also,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "employees"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I030",
    "source": "issue",
    "sentenceId": "PARA-0011-S13",
    "ruleId": "PREP_REPLY_TO_MESSAGE",
    "matchText": "reply the work messages",
    "replacementText": "reply to the work messages",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "read",
      "or"
    ],
    "rightContext": [
      "after",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I031",
    "source": "issue",
    "sentenceId": "PARA-0011-S13",
    "ruleId": "PRONOUN_POSSESSIVE_DETERMINER_THEIR",
    "matchText": "theirs bosses",
    "replacementText": "their bosses",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "work",
      "and"
    ],
    "rightContext": [
      "cannot",
      "punish"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I032",
    "source": "issue",
    "sentenceId": "PARA-0011-S13",
    "ruleId": "PARALLEL_TRANSITIVE_VERBS_EXPLICIT_OBJECT",
    "matchText": "punish or give them bad reviews",
    "replacementText": "punish them or give them bad reviews",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "bosses",
      "cannot"
    ],
    "rightContext": [
      "for",
      "this"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I033",
    "source": "issue",
    "sentenceId": "PARA-0011-S14",
    "ruleId": "CLAUSE_FRAGMENT_MISSING_SUBJECT_I_HOPE",
    "matchText": "Hope this",
    "replacementText": "I hope this",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "can",
      "help"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I034",
    "source": "issue",
    "sentenceId": "PARA-0011-S14",
    "ruleId": "COLLOC_HAVE_PERSONAL_TIME",
    "matchText": "keep",
    "replacementText": "have",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "help",
      "workers"
    ],
    "rightContext": [
      "more",
      "personal"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I035",
    "source": "issue",
    "sentenceId": "PARA-0011-S14",
    "ruleId": "PARALLEL_COORDINATED_NOUN_PHRASES_REPEATED_HEAD",
    "matchText": "more personal and more rest time",
    "replacementText": "more personal time and more rest time",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "workers",
      "keep"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I036",
    "source": "issue",
    "sentenceId": "PARA-0011-S15",
    "ruleId": "PUNCT_INTRODUCTORY_LINKER_COMMA",
    "matchText": "At the same time",
    "replacementText": "At the same time,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "people",
      "should"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I037",
    "source": "issue",
    "sentenceId": "PARA-0011-S15",
    "ruleId": "ARTICLE_A_PLURAL_NOUN_DELETE",
    "matchText": "a clear boundaries",
    "replacementText": "clear boundaries",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "should",
      "set"
    ],
    "rightContext": [
      "for",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I038",
    "source": "issue",
    "sentenceId": "PARA-0011-S16",
    "ruleId": "FIXED_FOR_EXAMPLE_SINGULAR",
    "matchText": "examples",
    "replacementText": "example",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for"
    ],
    "rightContext": [
      "after",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I039",
    "source": "issue",
    "sentenceId": "PARA-0011-S16",
    "ruleId": "PUNCT_INTRODUCTORY_PREPOSITIONAL_PHRASE_COMMA",
    "matchText": "after work",
    "replacementText": "after work,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "examples"
    ],
    "rightContext": [
      "turn",
      "off"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I040",
    "source": "issue",
    "sentenceId": "PARA-0011-S16",
    "ruleId": "CLAUSE_EXAMPLE_EXPLICIT_GENERIC_SUBJECT_MODAL",
    "matchText": "turn off",
    "replacementText": "people can turn off",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "after",
      "work"
    ],
    "rightContext": [
      "work",
      "notifications"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I041",
    "source": "issue",
    "sentenceId": "PARA-0011-S16",
    "ruleId": "SHARED_MODAL_PARALLEL",
    "matchText": "notifications, and leaves",
    "replacementText": "notifications and leave",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "off",
      "work"
    ],
    "rightContext": [
      "more",
      "time"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I042",
    "source": "issue",
    "sentenceId": "PARA-0011-S18",
    "ruleId": "SVA_PRESENT_COMPOUND_SUBJECT_ARE",
    "matchText": "work stress and financial pressure is",
    "replacementText": "work stress and financial pressure are",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "in",
      "conclusion"
    ],
    "rightContext": [
      "closely",
      "connected"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I043",
    "source": "issue",
    "sentenceId": "PARA-0011-S19",
    "ruleId": "PUNCT_HOWEVER_COMMA_LOWERCASE_IF",
    "matchText": "However If",
    "replacementText": "However, if",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "government"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I044",
    "source": "issue",
    "sentenceId": "PARA-0011-S19",
    "ruleId": "COLLOC_PROVIDE_CONDITIONS",
    "matchText": "give a",
    "replacementText": "provide",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "employers"
    ],
    "rightContext": [
      "better",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I045",
    "source": "issue",
    "sentenceId": "PARA-0011-S19",
    "ruleId": "NOUN_WORKING_CONDITIONS_PLURAL",
    "matchText": "work condition",
    "replacementText": "working conditions",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "better"
    ],
    "rightContext": [
      "and",
      "individuals"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I046",
    "source": "issue",
    "sentenceId": "PARA-0011-S19",
    "ruleId": "NOUN_THE_REST_OF_SINGULAR_REST",
    "matchText": "rests",
    "replacementText": "rest",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "the"
    ],
    "rightContext": [
      "of",
      "their"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0011-I047",
    "source": "issue",
    "sentenceId": "PARA-0011-S19",
    "ruleId": "CLAUSE_FRONTED_IF_COMMA_BEFORE_MAIN",
    "matchText": ".this",
    "replacementText": ", this",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "of",
      "their",
      "lives"
    ],
    "rightContext": [
      "problem",
      "can",
      "be"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I001",
    "source": "issue",
    "sentenceId": "PARA-0012-S01",
    "ruleId": "PLURAL_SUBJECT_VERB",
    "matchText": "companies requires",
    "replacementText": "companies require",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "more"
    ],
    "rightContext": [
      "staff",
      "needed"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I002",
    "source": "issue",
    "sentenceId": "PARA-0012-S01",
    "ruleId": "VERB_REQUIRE_NP_TO_INFINITIVE",
    "matchText": "staff needed to wore",
    "replacementText": "staff to wear",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "companies",
      "requires"
    ],
    "rightContext": [
      "uniforms",
      "at"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I003",
    "source": "issue",
    "sentenceId": "PARA-0012-S02",
    "ruleId": "LEXICAL_UNIFORM_POLICY_COMPANY_CONTEXT",
    "matchText": "for example",
    "replacementText": "policy; for example,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "having",
      "a",
      "uniform"
    ],
    "rightContext": [
      "customer",
      "can",
      "quickly"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I004",
    "source": "issue",
    "sentenceId": "PARA-0012-S02",
    "ruleId": "NOUN_GENERIC_CUSTOMER_PLURAL",
    "matchText": "customer",
    "replacementText": "customers",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "example"
    ],
    "rightContext": [
      "can",
      "quickly"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I005",
    "source": "issue",
    "sentenceId": "PARA-0012-S02",
    "ruleId": "CLAUSE_COORDINATED_MISSING_SUBJECT_FINITE_VERB",
    "matchText": "stores and enhanced",
    "replacementText": "stores, and uniforms enhance",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "in",
      "retail"
    ],
    "rightContext": [
      "trust",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I006",
    "source": "issue",
    "sentenceId": "PARA-0012-S03",
    "ruleId": "POSSESSIVE_COLLECTIVE_STAFF_OPINION",
    "matchText": "In staff opinion",
    "replacementText": "In the staff's opinion",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "a",
      "uniform"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I007",
    "source": "issue",
    "sentenceId": "PARA-0012-S03",
    "ruleId": "MODAL_NEGATION_SINGLE_AUXILIARY_BASE_VERB",
    "matchText": "can doesn’t required",
    "replacementText": "can reduce",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "uniform"
    ],
    "rightContext": [
      "a",
      "work"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I008",
    "source": "issue",
    "sentenceId": "PARA-0012-S03",
    "ruleId": "NOUN_EXPENSES_FOR_WORK_WARDROBE",
    "matchText": "a work wardrobe expenses",
    "replacementText": "expenses for a work wardrobe",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "doesn’t",
      "required"
    ],
    "rightContext": [
      "and",
      "it"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I009",
    "source": "issue",
    "sentenceId": "PARA-0012-S03",
    "ruleId": "PARALLEL_SHARED_REDUCE_COORDINATED_OBJECTS",
    "matchText": "and it can less wear and tear",
    "replacementText": "and wear and tear",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "wardrobe",
      "expenses"
    ],
    "rightContext": [
      "on",
      "personal"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I010",
    "source": "issue",
    "sentenceId": "PARA-0012-S03",
    "ruleId": "PUNCT_SENTENCE_FINAL_FULL_STOP",
    "matchText": "personal clothes",
    "replacementText": "personal clothes.",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "tear",
      "on"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true
  },
  {
    "patternId": "PARA-0012-I011",
    "source": "issue",
    "sentenceId": "PARA-0012-S04",
    "ruleId": "MODAL_BASE_VERB",
    "matchText": "can easily located",
    "replacementText": "can easily locate",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "customers"
    ],
    "rightContext": [
      "their",
      "staff"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I012",
    "source": "issue",
    "sentenceId": "PARA-0012-S04",
    "ruleId": "PRONOUN_POSSESSIVE_CUSTOMER_STAFF_NONPOSSESSION",
    "matchText": "their staff",
    "replacementText": "staff",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "easily",
      "located"
    ],
    "rightContext": [
      "who",
      "are"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I013",
    "source": "issue",
    "sentenceId": "PARA-0012-S06",
    "ruleId": "CLAUSE_ILLUSTRATION_AS_ADJUNCT",
    "matchText": "A clear illustration",
    "replacementText": "As a clear illustration",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "if",
      "you"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I014",
    "source": "issue",
    "sentenceId": "PARA-0012-S06",
    "ruleId": "CLAUSE_RELATIVE_LOCATION_WHERE",
    "matchText": "with",
    "replacementText": "where",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "an",
      "international",
      "airport"
    ],
    "rightContext": [
      "the",
      "staff",
      "do"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I015",
    "source": "issue",
    "sentenceId": "PARA-0012-S06",
    "ruleId": "AUXILIARY_PROGRESSIVE_BE_NOT_ING",
    "matchText": "do not wearing",
    "replacementText": "are not wearing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "staff"
    ],
    "rightContext": [
      "a",
      "proper"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I016",
    "source": "issue",
    "sentenceId": "PARA-0012-S06",
    "ruleId": "SVA_EXISTENTIAL_THERE_SINGULAR_HEAD_IS",
    "matchText": "there are a loss",
    "replacementText": "there is a loss",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "think",
      "that"
    ],
    "rightContext": [
      "of",
      "trusts"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I017",
    "source": "issue",
    "sentenceId": "PARA-0012-S06",
    "ruleId": "COUNT_TRUST_ABSTRACT_UNCOUNTABLE",
    "matchText": "trusts",
    "replacementText": "trust",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "loss",
      "of"
    ],
    "rightContext": [
      "and",
      "professionalism"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I018",
    "source": "issue",
    "sentenceId": "PARA-0012-S07",
    "ruleId": "CLAUSE_EXISTENTIAL_THERE_WILL_BE",
    "matchText": "it will have",
    "replacementText": "there will be",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "however"
    ],
    "rightContext": [
      "more",
      "commutations"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I019",
    "source": "issue",
    "sentenceId": "PARA-0012-S07",
    "ruleId": "WORDCHOICE_COMMUNICATION_NOT_COMMUTATION",
    "matchText": "commutations",
    "replacementText": "communication",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "have",
      "more"
    ],
    "rightContext": [
      "with",
      "passengers"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I020",
    "source": "issue",
    "sentenceId": "PARA-0012-S07",
    "ruleId": "PREP_COMMUNICATION_BETWEEN_A_AND_B",
    "matchText": "with passengers and staff",
    "replacementText": "between passengers and staff",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "more",
      "commutations"
    ],
    "rightContext": [
      "if",
      "they"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I021",
    "source": "issue",
    "sentenceId": "PARA-0012-S07",
    "ruleId": "PRONOUN_AMBIGUOUS_THEY_EXPLICIT_STAFF",
    "matchText": "they",
    "replacementText": "the staff",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "staff",
      "if"
    ],
    "rightContext": [
      "wearing",
      "uniforms"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I022",
    "source": "issue",
    "sentenceId": "PARA-0012-S07",
    "ruleId": "TENSE_IF_PRESENT_FINITE_VERB",
    "matchText": "wearing",
    "replacementText": "wear",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "staff",
      "if",
      "they"
    ],
    "rightContext": [
      "uniforms"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I023",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "NOUN_A_SINGULAR_COUNT_NOUN",
    "matchText": "dimensions",
    "replacementText": "dimension",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "further"
    ],
    "rightContext": [
      "is",
      "you"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I024",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "CLAUSE_COPULAR_NOUN_THAT_CLAUSE",
    "matchText": "is",
    "replacementText": "is that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "further",
      "dimensions"
    ],
    "rightContext": [
      "you",
      "will",
      "easy"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I025",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "ADVERB_EASILY_MODIFIES_LOCATE",
    "matchText": "easy to",
    "replacementText": "easily",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "you",
      "will"
    ],
    "rightContext": [
      "locate",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I026",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "PREP_STAFF_IN_SHOP",
    "matchText": "of",
    "replacementText": "in",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "locate",
      "the",
      "staff"
    ],
    "rightContext": [
      "a",
      "shops",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I027",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "ARTICLE_A_SINGULAR_COUNT_NOUN",
    "matchText": "shops",
    "replacementText": "shop,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "of",
      "a"
    ],
    "rightContext": [
      "and",
      "it"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I028",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "PRONOUN_THIS_CLAUSAL_REFERENCE",
    "matchText": "it",
    "replacementText": "this",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "shops",
      "and"
    ],
    "rightContext": [
      "will",
      "increase",
      "companies"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I029",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "POSSESSIVE_REGULAR_PLURAL_APOSTROPHE",
    "matchText": "companies",
    "replacementText": "companies'",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "increase"
    ],
    "rightContext": [
      "profits",
      "imaged"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I030",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "PUNCT_COMMA_SPLICE_SEMICOLON",
    "matchText": ",",
    "replacementText": ";",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "increase",
      "companies",
      "profits"
    ],
    "rightContext": [
      "imaged",
      "if",
      "you"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I031",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "WORDCHOICE_IMAGINE_NOT_IMAGE",
    "matchText": "imaged",
    "replacementText": "imagine",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "companies",
      "profits"
    ],
    "rightContext": [
      "if",
      "you"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I032",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "VERB_IMAGINE_GERUND",
    "matchText": "if you enter",
    "replacementText": "entering",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "profits",
      "imaged"
    ],
    "rightContext": [
      "a",
      "retai"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I033",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "SPELLING_RETAIL",
    "matchText": "retai",
    "replacementText": "retail",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "enter",
      "a"
    ],
    "rightContext": [
      "shop",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I034",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "CLAUSE_RELATIVE_LOCATION_WHERE",
    "matchText": "and",
    "replacementText": "where",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "retai",
      "shop"
    ],
    "rightContext": [
      "no",
      "staff",
      "wearing"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I035",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "CLAUSE_NO_STAFF_BE_PROGRESSIVE_ARTICLE",
    "matchText": "wearing uniform",
    "replacementText": "are wearing a uniform",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "no",
      "staff"
    ],
    "rightContext": [
      "you",
      "will",
      "need"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I036",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "PUNCT_COLON_EXPLANATORY_MAIN_CLAUSE",
    "matchText": ",",
    "replacementText": ":",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "staff",
      "wearing",
      "uniform"
    ],
    "rightContext": [
      "you",
      "will",
      "need"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I037",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "CLAUSE_EMBEDDED_YES_NO_WHETHER",
    "matchText": "someone",
    "replacementText": "whether someone",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "figure",
      "out"
    ],
    "rightContext": [
      "looking",
      "at"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0012-I038",
    "source": "issue",
    "sentenceId": "PARA-0012-S08",
    "ruleId": "ARTICLE_AN_SINGULAR_COUNT_NOUN",
    "matchText": "employees",
    "replacementText": "employee,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "shelf",
      "is",
      "an"
    ],
    "rightContext": [
      "and",
      "it",
      "is"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I001",
    "source": "issue",
    "sentenceId": "PARA-0013-S01",
    "ruleId": "COLLOC_CHART_AGE_DISTRIBUTION_POPULATION",
    "matchText": "the age of residents",
    "replacementText": "the age distributions of the populations",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "chart",
      "illustrates"
    ],
    "rightContext": [
      "of",
      "yemen"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I002",
    "source": "issue",
    "sentenceId": "PARA-0013-S01",
    "ruleId": "PARALLEL_CHART_ACTUAL_AND_PROJECTED_DISTRIBUTIONS",
    "matchText": "and projections for 2050",
    "replacementText": "and the projected distributions for 2050",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "in",
      "2000"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I003",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "NOUN_COUNTRY_POPULATION_POSSESSIVE",
    "matchText": "Yemen residents",
    "replacementText": "Yemen's population",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "overall"
    ],
    "rightContext": [
      "is",
      "younger"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I004",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "TENSE_PAST_DATA_YEAR_WAS",
    "matchText": "is",
    "replacementText": "was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "overall",
      "yemen",
      "residents"
    ],
    "rightContext": [
      "younger",
      "than",
      "italy"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I005",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "COMP_POPULATION_POSSESSIVE_ELLIPSIS",
    "matchText": "Italy",
    "replacementText": "Italy's",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "younger",
      "than"
    ],
    "rightContext": [
      "in",
      "2000"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I006",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "PUNCT_COMMA_SPLICE_COORDINATOR_AND",
    "matchText": "this",
    "replacementText": "and this",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "italy",
      "in",
      "2000"
    ],
    "rightContext": [
      "pattern",
      "keep",
      "diversifying"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I007",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "WORDCHOICE_CONTRAST_NOT_PATTERN",
    "matchText": "pattern",
    "replacementText": "contrast",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "2000",
      "this"
    ],
    "rightContext": [
      "keep",
      "diversifying"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I008",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "TENSE_PROJECTION_EXPECTED_TO_BECOME",
    "matchText": "keep diversifying",
    "replacementText": "is expected to become more pronounced",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "this",
      "pattern"
    ],
    "rightContext": [
      "to",
      "2050"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I009",
    "source": "issue",
    "sentenceId": "PARA-0013-S02",
    "ruleId": "PREP_BY_FUTURE_DEADLINE",
    "matchText": "to 2050",
    "replacementText": "by 2050",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "keep",
      "diversifying"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I010",
    "source": "issue",
    "sentenceId": "PARA-0013-S03",
    "ruleId": "NOUN_BOTH_PLURAL_COUNT_NOUN",
    "matchText": "country",
    "replacementText": "countries",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "however",
      "both"
    ],
    "rightContext": [
      "are",
      "projected"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I011",
    "source": "issue",
    "sentenceId": "PARA-0013-S03",
    "ruleId": "TO_BASE_VERB",
    "matchText": "aged",
    "replacementText": "age",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "projected",
      "to"
    ],
    "rightContext": [
      "the",
      "proportion"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I012",
    "source": "issue",
    "sentenceId": "PARA-0013-S03",
    "ruleId": "NOUN_SINGLE_OLDER_AGE_GROUP",
    "matchText": "groups,",
    "replacementText": "age group",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "older"
    ],
    "rightContext": [
      "in",
      "italy"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I013",
    "source": "issue",
    "sentenceId": "PARA-0013-S03",
    "ruleId": "PUNCT_RESTRICTIVE_PREPOSITIONAL_PHRASE_NO_PARENTHESES",
    "matchText": "Italy,",
    "replacementText": "Italy",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "groups",
      "in"
    ],
    "rightContext": [
      "will",
      "become"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I014",
    "source": "issue",
    "sentenceId": "PARA-0013-S03",
    "ruleId": "SPELLING_LARGER",
    "matchText": "lager",
    "replacementText": "larger",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "become"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I015",
    "source": "issue",
    "sentenceId": "PARA-0013-S04",
    "ruleId": "AGE_PEOPLE_AGED_RANGE",
    "matchText": "the population of 0-14 years old",
    "replacementText": "people aged 0–14",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "in",
      "yemen"
    ],
    "rightContext": [
      "is",
      "almost"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I016",
    "source": "issue",
    "sentenceId": "PARA-0013-S04",
    "ruleId": "COLLOC_ACCOUNT_FOR_PERCENTAGE",
    "matchText": "is almost one-half, got 50.1%",
    "replacementText": "accounted for 50.1% of the population",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "years",
      "old"
    ],
    "rightContext": [
      "slightly",
      "more"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I017",
    "source": "issue",
    "sentenceId": "PARA-0013-S04",
    "ruleId": "COMP_PERCENTAGE_HIGHER_THAN",
    "matchText": "more than",
    "replacementText": "higher than",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "1",
      "slightly"
    ],
    "rightContext": [
      "15-59",
      "years"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I018",
    "source": "issue",
    "sentenceId": "PARA-0013-S04",
    "ruleId": "COMP_FIGURE_FOR_GROUP",
    "matchText": "15-59 years old 46.3%",
    "replacementText": "the 46.3% recorded for those aged 15–59",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "more",
      "than"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I019",
    "source": "issue",
    "sentenceId": "PARA-0013-S06",
    "ruleId": "AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
    "matchText": "15-59 age group will exceed 0-14 years old",
    "replacementText": "15–59 age group will exceed the 0–14 age group",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the"
    ],
    "rightContext": [
      "to",
      "57"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I020",
    "source": "issue",
    "sentenceId": "PARA-0013-S06",
    "ruleId": "VERB_EXCEED_OBJECT_AND_RISE_TO_PERCENT",
    "matchText": "to 57.3%",
    "replacementText": "and rise to 57.3%",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "years",
      "old"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I021",
    "source": "issue",
    "sentenceId": "PARA-0013-S08",
    "ruleId": "AGE_RANGE_ATTRIBUTIVE_AGE_GROUP",
    "matchText": "15-59 years old age group",
    "replacementText": "15–59 age group",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "italy",
      "the"
    ],
    "rightContext": [
      "keep",
      "being"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I022",
    "source": "issue",
    "sentenceId": "PARA-0013-S08",
    "ruleId": "TENSE_CHART_EXPECTED_TO_REMAIN",
    "matchText": "keep being",
    "replacementText": "is expected to remain",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "age",
      "group"
    ],
    "rightContext": [
      "the",
      "largest"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I023",
    "source": "issue",
    "sentenceId": "PARA-0013-S08",
    "ruleId": "COLLOC_CHART_SEGMENT_NOT_SLICE",
    "matchText": "slice",
    "replacementText": "segment",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "largest"
    ],
    "rightContext": [
      "from",
      "2000"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I024",
    "source": "issue",
    "sentenceId": "PARA-0013-S08",
    "ruleId": "TIME_CHART_TWO_SNAPSHOTS_IN_BOTH_YEARS",
    "matchText": "from 2000 to 2050",
    "replacementText": "in both 2000 and 2050",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "largest",
      "slice"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I025",
    "source": "issue",
    "sentenceId": "PARA-0013-S09",
    "ruleId": "CLAUSE_SUBORDINATOR_FRAGMENT_REMOVE_ALTHOUGH",
    "matchText": "Although it",
    "replacementText": "It",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "predicted",
      "to"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I026",
    "source": "issue",
    "sentenceId": "PARA-0013-S09",
    "ruleId": "PASSIVE_PREDICT_BE_PARTICIPLE",
    "matchText": "predicted",
    "replacementText": "is predicted",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "although",
      "it"
    ],
    "rightContext": [
      "to",
      "fall"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I027",
    "source": "issue",
    "sentenceId": "PARA-0013-S10",
    "ruleId": "NOUN_CHART_PROPORTION_OF_ELDERLY_RESIDENTS",
    "matchText": "The elderly group",
    "replacementText": "The proportion of elderly residents",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "almost",
      "doubled"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I028",
    "source": "issue",
    "sentenceId": "PARA-0013-S10",
    "ruleId": "TENSE_PROJECTION_IS_PROJECTED_TO_DOUBLE",
    "matchText": "almost doubled",
    "replacementText": "is projected to almost double",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "elderly",
      "group"
    ],
    "rightContext": [
      "from",
      "24"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I029",
    "source": "issue",
    "sentenceId": "PARA-0013-S11",
    "ruleId": "WORDFORM_SUPERLATIVE_YOUNGEST_AGE_GROUP",
    "matchText": "youngster",
    "replacementText": "youngest age",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the"
    ],
    "rightContext": [
      "group",
      "has"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I030",
    "source": "issue",
    "sentenceId": "PARA-0013-S11",
    "ruleId": "TENSE_PROJECTION_REMAIN_STABLE",
    "matchText": "has nearly remain unchanged",
    "replacementText": "is projected to remain relatively stable",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "youngster",
      "group"
    ],
    "rightContext": [
      "through",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I031",
    "source": "issue",
    "sentenceId": "PARA-0013-S11",
    "ruleId": "PREP_OVER_PERIOD",
    "matchText": "through the prediction",
    "replacementText": "over the period",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "remain",
      "unchanged"
    ],
    "rightContext": [
      "just",
      "shrink"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0013-I032",
    "source": "issue",
    "sentenceId": "PARA-0013-S11",
    "ruleId": "PARTICIPLE_SUPPLEMENTARY_SHRINKING",
    "matchText": "just shrink",
    "replacementText": "shrinking only",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "prediction"
    ],
    "rightContext": [
      "slightly",
      "from"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I001",
    "source": "issue",
    "sentenceId": "PARA-0014-S02",
    "ruleId": "CLAUSE_NOT_UNTIL_INITIAL_MAIN_INVERSION",
    "matchText": "Not until the exhibition opened residents realised",
    "replacementText": "Not until the exhibition opened did residents realise",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "how",
      "much"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I002",
    "source": "issue",
    "sentenceId": "PARA-0014-S03",
    "ruleId": "CLAUSE_RARELY_INITIAL_PAST_PERFECT_INVERSION",
    "matchText": "Rarely the museum had received",
    "replacementText": "Rarely had the museum received",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "donations",
      "and"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I003",
    "source": "issue",
    "sentenceId": "PARA-0014-S03",
    "ruleId": "ADVERB_HARD_NOT_HARDLY_EFFORT",
    "matchText": "worked hardly",
    "replacementText": "worked hard",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "volunteers"
    ],
    "rightContext": [
      "to",
      "catalogue"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I004",
    "source": "issue",
    "sentenceId": "PARA-0014-S04",
    "ruleId": "MODAL_HAD_BETTER_BASE_VERB",
    "matchText": "had better to confirm",
    "replacementText": "had better confirm",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "staff"
    ],
    "rightContext": [
      "whether",
      "it's"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I005",
    "source": "issue",
    "sentenceId": "PARA-0014-S04",
    "ruleId": "POSSESSIVE_ITS_NO_APOSTROPHE",
    "matchText": "it's label",
    "replacementText": "its label",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "confirm",
      "whether"
    ],
    "rightContext": [
      "matched",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I006",
    "source": "issue",
    "sentenceId": "PARA-0014-S05",
    "ruleId": "INFINITIVE_NEED_PASSIVE_TO_BE_PARTICIPLE",
    "matchText": "records need to digitise",
    "replacementText": "records need to be digitised",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "several"
    ],
    "rightContext": [
      "while",
      "two"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I007",
    "source": "issue",
    "sentenceId": "PARA-0014-S05",
    "ruleId": "ADJ_WORTH_GERUND",
    "matchText": "worth to restore",
    "replacementText": "worth restoring",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "films",
      "are"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I008",
    "source": "issue",
    "sentenceId": "PARA-0014-S06",
    "ruleId": "CAUSATIVE_HAVE_NP_BASE_VERB",
    "matchText": "had a technician to repair",
    "replacementText": "had a technician repair",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "museum"
    ],
    "rightContext": [
      "the",
      "scanner"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I009",
    "source": "issue",
    "sentenceId": "PARA-0014-S06",
    "ruleId": "CAUSATIVE_GET_NP_TO_INFINITIVE",
    "matchText": "got a volunteer install",
    "replacementText": "got a volunteer to install",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "scanner",
      "and"
    ],
    "rightContext": [
      "software"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I010",
    "source": "issue",
    "sentenceId": "PARA-0014-S07",
    "ruleId": "MODAL_NEEDNT_HAVE_PAST_PARTICIPLE",
    "matchText": "needn't stayed",
    "replacementText": "needn't have stayed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "staff"
    ],
    "rightContext": [
      "late",
      "although"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I011",
    "source": "issue",
    "sentenceId": "PARA-0014-S08",
    "ruleId": "CLAUSE_UNDER_NO_CIRCUMSTANCES_INVERSION",
    "matchText": "Under no circumstances visitors should remove",
    "replacementText": "Under no circumstances should visitors remove",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "originals",
      "nor"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I012",
    "source": "issue",
    "sentenceId": "PARA-0014-S08",
    "ruleId": "CLAUSE_NOR_AUXILIARY_INVERSION",
    "matchText": "nor they may photograph",
    "replacementText": "nor may they photograph",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "remove",
      "originals"
    ],
    "rightContext": [
      "private",
      "documents"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I013",
    "source": "issue",
    "sentenceId": "PARA-0014-S09",
    "ruleId": "PHRASAL_SEPARABLE_PRONOUN_BETWEEN_VERB_PARTICLE",
    "matchText": "turn off them",
    "replacementText": "turn them off",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "them",
      "to"
    ],
    "rightContext": [
      "and",
      "parents"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I014",
    "source": "issue",
    "sentenceId": "PARA-0014-S09",
    "ruleId": "PHRASAL_LOOK_AFTER_INSEPARABLE",
    "matchText": "look their children after",
    "replacementText": "look after their children",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "parents",
      "to"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I015",
    "source": "issue",
    "sentenceId": "PARA-0014-S11",
    "ruleId": "SVA_A_NUMBER_OF_PLURAL_VERB",
    "matchText": "A number of applications was",
    "replacementText": "A number of applications were",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "incomplete",
      "whereas"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I016",
    "source": "issue",
    "sentenceId": "PARA-0014-S11",
    "ruleId": "SVA_THE_NUMBER_OF_SINGULAR_VERB",
    "matchText": "the number of rejections were",
    "replacementText": "the number of rejections was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "incomplete",
      "whereas"
    ],
    "rightContext": [
      "small"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I017",
    "source": "issue",
    "sentenceId": "PARA-0014-S12",
    "ruleId": "SVA_MORE_THAN_ONE_SINGULAR_NOUN_VERB",
    "matchText": "More than one volunteers were",
    "replacementText": "More than one volunteer was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "uncertain",
      "and"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I018",
    "source": "issue",
    "sentenceId": "PARA-0014-S12",
    "ruleId": "SVA_ONE_OF_THOSE_WHO_PLURAL_RELATIVE_VERB",
    "matchText": "one of those assistants who works",
    "replacementText": "one of those assistants who work",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "lena",
      "is"
    ],
    "rightContext": [
      "late",
      "answering"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I019",
    "source": "issue",
    "sentenceId": "PARA-0014-S13",
    "ruleId": "SVA_RELATIVE_SINGULAR_ANTECEDENT_S_FORM",
    "matchText": "coordinator who know",
    "replacementText": "coordinator who knows",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "only"
    ],
    "rightContext": [
      "encryption",
      "together"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I020",
    "source": "issue",
    "sentenceId": "PARA-0014-S13",
    "ruleId": "SVA_TOGETHER_WITH_HEAD_SUBJECT",
    "matchText": ", together with two interns, have prepared",
    "replacementText": ", together with two interns, has prepared",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "know",
      "encryption"
    ],
    "rightContext": [
      "a",
      "manual"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I021",
    "source": "issue",
    "sentenceId": "PARA-0014-S14",
    "ruleId": "SVA_EITHER_OR_NEAREST_SUBJECT",
    "matchText": "Either the interns or the archivist are",
    "replacementText": "Either the interns or the archivist is",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "expected",
      "to"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I022",
    "source": "issue",
    "sentenceId": "PARA-0014-S15",
    "ruleId": "SVA_MEASURE_DISTANCE_SINGULAR",
    "matchText": "Ten kilometres are too far",
    "replacementText": "Ten kilometres is too far",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "three",
      "hundred"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I023",
    "source": "issue",
    "sentenceId": "PARA-0014-S15",
    "ruleId": "SVA_MEASURE_MONEY_AMOUNT_SINGULAR",
    "matchText": "three hundred pounds were enough",
    "replacementText": "three hundred pounds was enough",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "too",
      "far"
    ],
    "rightContext": [
      "for",
      "transport"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I024",
    "source": "issue",
    "sentenceId": "PARA-0014-S16",
    "ruleId": "SVA_NEWS_SINGULAR",
    "matchText": "The news were welcomed",
    "replacementText": "The news was welcomed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "two-thirds",
      "of"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I025",
    "source": "issue",
    "sentenceId": "PARA-0014-S16",
    "ruleId": "SVA_FRACTION_UNCOUNTABLE_HEAD_SINGULAR",
    "matchText": "two-thirds of the equipment were",
    "replacementText": "two-thirds of the equipment was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "were",
      "welcomed"
    ],
    "rightContext": [
      "bought",
      "while"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I026",
    "source": "issue",
    "sentenceId": "PARA-0014-S16",
    "ruleId": "SVA_FRACTION_PLURAL_HEAD_PLURAL",
    "matchText": "half of the volunteers was",
    "replacementText": "half of the volunteers were",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "bought",
      "while"
    ],
    "rightContext": [
      "recruited"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I027",
    "source": "issue",
    "sentenceId": "PARA-0014-S17",
    "ruleId": "COMP_MULTIPLIER_TWICE_AS_ADJECTIVE_AS",
    "matchText": "twice more efficient than",
    "replacementText": "twice as efficient as",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "scanner",
      "is"
    ],
    "rightContext": [
      "its",
      "predecessor"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I028",
    "source": "issue",
    "sentenceId": "PARA-0014-S17",
    "ruleId": "COMP_SUPERIOR_TO",
    "matchText": "superior than",
    "replacementText": "superior to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "output",
      "is"
    ],
    "rightContext": [
      "the",
      "earlier"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I029",
    "source": "issue",
    "sentenceId": "PARA-0014-S17",
    "ruleId": "COMP_ELLIPSIS_THAT_OF_SINGULAR_NOUN",
    "matchText": "the earlier model",
    "replacementText": "that of the earlier model",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "superior",
      "than"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I030",
    "source": "issue",
    "sentenceId": "PARA-0014-S18",
    "ruleId": "COMP_SAME_AS",
    "matchText": "the same with",
    "replacementText": "the same as",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "system",
      "is"
    ],
    "rightContext": [
      "the",
      "national"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I031",
    "source": "issue",
    "sentenceId": "PARA-0014-S18",
    "ruleId": "DEGREE_MUCH_TOO_ADJECTIVE",
    "matchText": "too much expensive",
    "replacementText": "much too expensive",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "fee",
      "is"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I032",
    "source": "issue",
    "sentenceId": "PARA-0014-S19",
    "ruleId": "MOOD_HIGH_TIME_PAST",
    "matchText": "provides",
    "replacementText": "provided",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "time",
      "the",
      "council"
    ],
    "rightContext": [
      "funding",
      "and",
      "residents"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I033",
    "source": "issue",
    "sentenceId": "PARA-0014-S19",
    "ruleId": "MOOD_WISH_PAST_REGRET_PAST_PERFECT",
    "matchText": "it",
    "replacementText": "it had",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "residents",
      "wish"
    ],
    "rightContext": [
      "approved",
      "the",
      "second"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I034",
    "source": "issue",
    "sentenceId": "PARA-0014-S20",
    "ruleId": "MOOD_IF_ONLY_PAST_REGRET_PAST_PERFECT",
    "matchText": "If only the finance team released",
    "replacementText": "If only the finance team had released",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "money"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I035",
    "source": "issue",
    "sentenceId": "PARA-0014-S21",
    "ruleId": "CONDITIONAL_INVERTED_WERE_WOULD",
    "matchText": "Were it not for donations, the archive will close",
    "replacementText": "Were it not for donations, the archive would close",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "next",
      "winter"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I036",
    "source": "issue",
    "sentenceId": "PARA-0014-S22",
    "ruleId": "CONDITIONAL_INVERTED_SHOULD_BASE_VERB",
    "matchText": "Should any donor will object",
    "replacementText": "Should any donor object",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "museum"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I037",
    "source": "issue",
    "sentenceId": "PARA-0014-S23",
    "ruleId": "CONJ_UNLESS_NO_REDUNDANT_NEGATION",
    "matchText": "Unless the server does not fail",
    "replacementText": "Unless the server fails",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "staff",
      "will"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I038",
    "source": "issue",
    "sentenceId": "PARA-0014-S23",
    "ruleId": "CLAUSE_IN_CASE_FUTURE_PRESENT",
    "matchText": "in case the database will become unavailable",
    "replacementText": "in case the database becomes unavailable",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "offline",
      "copy"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I039",
    "source": "issue",
    "sentenceId": "PARA-0014-S24",
    "ruleId": "CLAUSE_PREPOSITION_WHETHER_NOT_IF",
    "matchText": "depends on if",
    "replacementText": "depends on whether",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "extension"
    ],
    "rightContext": [
      "the",
      "museum"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I040",
    "source": "issue",
    "sentenceId": "PARA-0014-S25",
    "ruleId": "CLAUSE_REASON_WHY_IS_THAT",
    "matchText": "is because",
    "replacementText": "is that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "remain",
      "cautious"
    ],
    "rightContext": [
      "no",
      "long-term"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I041",
    "source": "issue",
    "sentenceId": "PARA-0014-S26",
    "ruleId": "CLEFT_IT_WAS_NOT_UNTIL_THAT",
    "matchText": "when",
    "replacementText": "that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "until",
      "auditors",
      "finished"
    ],
    "rightContext": [
      "the",
      "council",
      "released"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I042",
    "source": "issue",
    "sentenceId": "PARA-0014-S27",
    "ruleId": "PSEUDOCLEFT_WHAT_CLAUSE_SINGULAR_IS",
    "matchText": "What the project now needs are a permanent funding arrangement",
    "replacementText": "What the project now needs is a permanent funding arrangement",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I043",
    "source": "issue",
    "sentenceId": "PARA-0014-S28",
    "ruleId": "CLAUSE_SO_ADJECTIVE_INVERSION",
    "matchText": "So complicated the forms were",
    "replacementText": "So complicated were the forms",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "that",
      "donors"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I044",
    "source": "issue",
    "sentenceId": "PARA-0014-S28",
    "ruleId": "CLAUSE_SUCH_WAS_NOUN_INVERSION",
    "matchText": "such the confusion was",
    "replacementText": "such was the confusion",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "wrongly",
      "and"
    ],
    "rightContext": [
      "that",
      "staff"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I045",
    "source": "issue",
    "sentenceId": "PARA-0014-S29",
    "ruleId": "PRONOUN_WHOEVER_SUBJECT_CASE",
    "matchText": "Whomever wants",
    "replacementText": "Whoever wants",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "to",
      "withdraw"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I046",
    "source": "issue",
    "sentenceId": "PARA-0014-S29",
    "ruleId": "CLAUSE_ALL_THAT_NOT_ALL_WHAT",
    "matchText": "all what families reject",
    "replacementText": "all that families reject",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "return"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I047",
    "source": "issue",
    "sentenceId": "PARA-0014-S30",
    "ruleId": "CLAUSE_THE_WAY_IN_WHICH_NOT_HOW",
    "matchText": "The way how volunteers describe",
    "replacementText": "The way in which volunteers describe",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "images",
      "must"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I048",
    "source": "issue",
    "sentenceId": "PARA-0014-S30",
    "ruleId": "NOUN_FACT_THAT_CLAUSE_NO_OF",
    "matchText": "the fact of that",
    "replacementText": "the fact that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "consistent",
      "because"
    ],
    "rightContext": [
      "some",
      "diaries"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I049",
    "source": "issue",
    "sentenceId": "PARA-0014-S31",
    "ruleId": "COLLOC_CONDUCT_RESEARCH",
    "matchText": "has made research",
    "replacementText": "has conducted research",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "museum"
    ],
    "rightContext": [
      "and",
      "done"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I050",
    "source": "issue",
    "sentenceId": "PARA-0014-S31",
    "ruleId": "COLLOC_MAKE_PROGRESS",
    "matchText": "done progress",
    "replacementText": "made progress",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "research",
      "and"
    ],
    "rightContext": [
      "but",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I051",
    "source": "issue",
    "sentenceId": "PARA-0014-S31",
    "ruleId": "COLLOC_TAKE_INTO_CONSIDERATION_NO_OF",
    "matchText": "take into consideration of costs",
    "replacementText": "take into consideration costs",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "committee",
      "must"
    ],
    "rightContext": [
      "and",
      "pay"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I052",
    "source": "issue",
    "sentenceId": "PARA-0014-S31",
    "ruleId": "PREP_PAY_ATTENTION_TO",
    "matchText": "pay attention on security",
    "replacementText": "pay attention to security",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "costs",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I053",
    "source": "issue",
    "sentenceId": "PARA-0014-S32",
    "ruleId": "PRONOUN_DOUBLE_GENITIVE_OF_MINE",
    "matchText": "colleague of me",
    "replacementText": "colleague of mine",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a"
    ],
    "rightContext": [
      "objected",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I054",
    "source": "issue",
    "sentenceId": "PARA-0014-S32",
    "ruleId": "POSSESSIVE_INDEFINITE_PRONOUN_ELSES",
    "matchText": "somebody's else responsibility",
    "replacementText": "somebody else's responsibility",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "called",
      "preservation"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I055",
    "source": "issue",
    "sentenceId": "PARA-0014-S33",
    "ruleId": "PRONOUN_REFLEXIVE_NOT_COORDINATED_SUBJECT",
    "matchText": "Myself and the curator disagreed",
    "replacementText": "The curator and I disagreed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "although",
      "the"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I056",
    "source": "issue",
    "sentenceId": "PARA-0014-S33",
    "ruleId": "PRONOUN_REFLEXIVE_REQUIRES_COREFERENCE",
    "matchText": "the chair asked myself",
    "replacementText": "the chair asked me",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "disagreed",
      "although"
    ],
    "rightContext": [
      "to",
      "prepare"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0014-I057",
    "source": "issue",
    "sentenceId": "PARA-0014-S34",
    "ruleId": "COUNT_ADVICE_UNCOUNTABLE_SOME",
    "matchText": "an",
    "replacementText": "some",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "lawyers",
      "have",
      "given"
    ],
    "rightContext": [
      "advice"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I001",
    "source": "issue",
    "sentenceId": "PARA-0015-S01",
    "ruleId": "ARTICLE_PROPER_INSTITUTION_NORTHBRIDGE_ZERO",
    "matchText": "The Northbridge University",
    "replacementText": "Northbridge University",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "has",
      "begun"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I002",
    "source": "issue",
    "sentenceId": "PARA-0015-S01",
    "ruleId": "TENSE_PAST_SIMPLE_FINISHED_TIME",
    "matchText": "has begun",
    "replacementText": "began",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "northbridge",
      "university"
    ],
    "rightContext": [
      "a",
      "community"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I003",
    "source": "issue",
    "sentenceId": "PARA-0015-S01",
    "ruleId": "ARTICLE_MONTH_NAME_ZERO",
    "matchText": "the September 2023",
    "replacementText": "September 2023",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "fellowship",
      "in"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I004",
    "source": "issue",
    "sentenceId": "PARA-0015-S02",
    "ruleId": "TENSE_PRESENT_PERFECT_SINCE_THEN",
    "matchText": "Since then, the scheme attracted",
    "replacementText": "Since then, the scheme has attracted",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "students",
      "from"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I005",
    "source": "issue",
    "sentenceId": "PARA-0015-S02",
    "ruleId": "ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
    "matchText": "from United Kingdom",
    "replacementText": "from the United Kingdom",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "attracted",
      "students"
    ],
    "rightContext": [
      "netherlands",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I006",
    "source": "issue",
    "sentenceId": "PARA-0015-S02",
    "ruleId": "ARTICLE_COUNTRY_NETHERLANDS_THE",
    "matchText": "Netherlands",
    "replacementText": "the Netherlands",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "united",
      "kingdom"
    ],
    "rightContext": [
      "and",
      "several"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I007",
    "source": "issue",
    "sentenceId": "PARA-0015-S03",
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
    "matchText": "attend the university",
    "replacementText": "attend university",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "students",
      "who"
    ],
    "rightContext": [
      "for",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I008",
    "source": "issue",
    "sentenceId": "PARA-0015-S03",
    "ruleId": "ARTICLE_SPECIFIC_UNIVERSITY_THE_VISIT",
    "matchText": "come to university for public lectures",
    "replacementText": "come to the university for public lectures",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "visitors",
      "who"
    ],
    "rightContext": [
      "need",
      "different"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I009",
    "source": "issue",
    "sentenceId": "PARA-0015-S04",
    "ruleId": "ARTICLE_TITLE_NAME_ZERO",
    "matchText": "The Professor Malik",
    "replacementText": "Professor Malik",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "programme",
      "director"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I010",
    "source": "issue",
    "sentenceId": "PARA-0015-S04",
    "ruleId": "APPOSITION_UNIQUE_ROLE_THE_AND_COMMAS",
    "matchText": "programme director",
    "replacementText": "the programme director",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "professor",
      "malik"
    ],
    "rightContext": [
      "said",
      "that"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I011",
    "source": "issue",
    "sentenceId": "PARA-0015-S04",
    "ruleId": "REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT",
    "matchText": "has received",
    "replacementText": "had received",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "fellowship"
    ],
    "rightContext": [
      "a",
      "great"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I012",
    "source": "issue",
    "sentenceId": "PARA-0015-S04",
    "ruleId": "QUANTIFIER_GREAT_DEAL_UNCOUNTABLE_NOT_APPLICATIONS",
    "matchText": "a great deal of applications",
    "replacementText": "a large number of applications",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "has",
      "received"
    ],
    "rightContext": [
      "but",
      "only"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I013",
    "source": "issue",
    "sentenceId": "PARA-0015-S04",
    "ruleId": "QUANTIFIER_FEW_LITTLE_UNCOUNTABLE_FUNDING",
    "matchText": "few funding",
    "replacementText": "a little funding",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "only"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I014",
    "source": "issue",
    "sentenceId": "PARA-0015-S05",
    "ruleId": "TENSE_PRESENT_PERFECT_PROGRESSIVE_FOR_DURATION",
    "matchText": "reviewed",
    "replacementText": "has been reviewing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "selection",
      "team"
    ],
    "rightContext": [
      "portfolios",
      "contained"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I015",
    "source": "issue",
    "sentenceId": "PARA-0015-S05",
    "ruleId": "CLAUSE_REDUCED_RELATIVE_ACTIVE_PRESENT_PARTICIPLE",
    "matchText": "portfolios contained",
    "replacementText": "portfolios containing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "team",
      "reviewed"
    ],
    "rightContext": [
      "field",
      "notes"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I016",
    "source": "issue",
    "sentenceId": "PARA-0015-S05",
    "ruleId": "NOUN_IRREGULAR_ANALYSIS_ANALYSES",
    "matchText": "analysises",
    "replacementText": "analyses",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "statistical"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I017",
    "source": "issue",
    "sentenceId": "PARA-0015-S06",
    "ruleId": "ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
    "matchText": "is containing",
    "replacementText": "contains",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "database"
    ],
    "rightContext": [
      "twenty",
      "criterias"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I018",
    "source": "issue",
    "sentenceId": "PARA-0015-S06",
    "ruleId": "NOUN_IRREGULAR_CRITERION_CRITERIA_PLURAL",
    "matchText": "criterias",
    "replacementText": "criteria",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "containing",
      "twenty"
    ],
    "rightContext": [
      "although",
      "each"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I019",
    "source": "issue",
    "sentenceId": "PARA-0015-S06",
    "ruleId": "NOUN_IRREGULAR_CRITERION_CRITERIA_SINGULAR",
    "matchText": "criteria",
    "replacementText": "criterion",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "only",
      "one"
    ],
    "rightContext": [
      "at",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I020",
    "source": "issue",
    "sentenceId": "PARA-0015-S07",
    "ruleId": "QUANTIFIER_A_FEW_POSITIVE_SMALL_NUMBER",
    "matchText": "Few",
    "replacementText": "A few",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "candidates",
      "have",
      "submitted"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I021",
    "source": "issue",
    "sentenceId": "PARA-0015-S07",
    "ruleId": "QUANTIFIER_FEW_NEGATIVE_SMALL_NUMBER",
    "matchText": "; a",
    "replacementText": ";",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "submitted",
      "excellent",
      "work"
    ],
    "rightContext": [
      "few",
      "however",
      "have"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I022",
    "source": "issue",
    "sentenceId": "PARA-0015-S08",
    "ruleId": "QUANTIFIER_LITTLE_UNCOUNTABLE_SCARCITY",
    "matchText": "a few",
    "replacementText": "little",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "there",
      "is"
    ],
    "rightContext": [
      "time",
      "before"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I023",
    "source": "issue",
    "sentenceId": "PARA-0015-S08",
    "ruleId": "QUANTIFIER_A_LITTLE_UNCOUNTABLE_POSITIVE",
    "matchText": "few",
    "replacementText": "a little",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "interviews",
      "begin",
      "but"
    ],
    "rightContext": [
      "extra",
      "time",
      "has"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I024",
    "source": "issue",
    "sentenceId": "PARA-0015-S09",
    "ruleId": "DETERMINER_TWO_ITEMS_THE_OTHER",
    "matchText": "another",
    "replacementText": "the other",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "library",
      "and"
    ],
    "rightContext": [
      "is",
      "inside"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I025",
    "source": "issue",
    "sentenceId": "PARA-0015-S10",
    "ruleId": "PREP_LAST_NAMED_DAY_ZERO",
    "matchText": "At last",
    "replacementText": "Last",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "monday",
      "the"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I026",
    "source": "issue",
    "sentenceId": "PARA-0015-S10",
    "ruleId": "REPORTING_SAY_TELL_TELL_PERSON_THAT",
    "matchText": "said",
    "replacementText": "told",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "coordinator"
    ],
    "rightContext": [
      "applicants",
      "that"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I027",
    "source": "issue",
    "sentenceId": "PARA-0015-S10",
    "ruleId": "REPORTED_SPEECH_BACKSHIFT_PRESENT_PERFECT_TO_PAST_PERFECT",
    "matchText": "has",
    "replacementText": "had",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "the",
      "timetable"
    ],
    "rightContext": [
      "changed"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I028",
    "source": "issue",
    "sentenceId": "PARA-0015-S11",
    "ruleId": "REPORTED_SPEECH_BACKSHIFT_PAST_SIMPLE_TO_PAST_PERFECT",
    "matchText": "failed",
    "replacementText": "had failed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "online",
      "portal"
    ],
    "rightContext": [
      "last",
      "evening"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I029",
    "source": "issue",
    "sentenceId": "PARA-0015-S11",
    "ruleId": "REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS",
    "matchText": "last",
    "replacementText": "the previous",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "portal",
      "failed"
    ],
    "rightContext": [
      "evening",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I030",
    "source": "issue",
    "sentenceId": "PARA-0015-S11",
    "ruleId": "REPORTING_ASK_WHETHER_NO_THAT",
    "matchText": "asked that",
    "replacementText": "asked",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "evening",
      "and"
    ],
    "rightContext": [
      "whether",
      "everyone"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I031",
    "source": "issue",
    "sentenceId": "PARA-0015-S12",
    "ruleId": "REPORTING_WARN_NP_NOT_TO_INFINITIVE",
    "matchText": "do not",
    "replacementText": "not to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "warned",
      "candidates"
    ],
    "rightContext": [
      "upload",
      "confidential"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I032",
    "source": "issue",
    "sentenceId": "PARA-0015-S12",
    "ruleId": "REPORTING_DENY_GERUND",
    "matchText": "to share",
    "replacementText": "sharing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "denied"
    ],
    "rightContext": [
      "any",
      "files"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I033",
    "source": "issue",
    "sentenceId": "PARA-0015-S13",
    "ruleId": "QUESTION_DIRECT_WH_OBJECT_DO_SUPPORT",
    "matchText": "Why the portal rejected",
    "replacementText": "Why did the portal reject",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "applicant",
      "asked"
    ],
    "rightContext": [
      "my",
      "form"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I034",
    "source": "issue",
    "sentenceId": "PARA-0015-S14",
    "ruleId": "QUESTION_DOES_BASE_VERB",
    "matchText": "Does every reference has",
    "replacementText": "Does every reference have",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "another",
      "asked"
    ],
    "rightContext": [
      "to",
      "be"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I035",
    "source": "issue",
    "sentenceId": "PARA-0015-S15",
    "ruleId": "CLAUSE_REDUCED_RELATIVE_PASSIVE_PARTICIPLE_FORM",
    "matchText": "references submitting without signatures",
    "replacementText": "references submitted without signatures",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "replied",
      "that"
    ],
    "rightContext": [
      "would",
      "be"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I036",
    "source": "issue",
    "sentenceId": "PARA-0015-S16",
    "ruleId": "REPORTING_PROMISE_SPEAKER_TO_INFINITIVE",
    "matchText": "promised each applicant to contact them",
    "replacementText": "promised to contact each applicant",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "she",
      "also"
    ],
    "rightContext": [
      "once",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I037",
    "source": "issue",
    "sentenceId": "PARA-0015-S18",
    "ruleId": "REFERENCE_AMBIGUOUS_IT_MULTIPLE_ANTECEDENTS",
    "matchText": "but it was faster",
    "replacementText": "but the laptop was faster",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "tested",
      "together"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I038",
    "source": "issue",
    "sentenceId": "PARA-0015-S19",
    "ruleId": "REFERENCE_ONE_ONES_ADJECTIVE_ELLIPSIS",
    "matchText": "the blue",
    "replacementText": "the blue ones",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "were",
      "stronger",
      "than"
    ],
    "rightContext": [
      "although",
      "the",
      "last"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I039",
    "source": "issue",
    "sentenceId": "PARA-0015-S19",
    "ruleId": "REFERENCE_LATTER_SECOND_OF_TWO",
    "matchText": "the last",
    "replacementText": "the latter",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "blue",
      "although"
    ],
    "rightContext": [
      "were",
      "cheaper"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I040",
    "source": "issue",
    "sentenceId": "PARA-0015-S20",
    "ruleId": "REFERENCE_CHAIN_MULTIPLE_IT_ABSTAIN",
    "matchText": "because it was unrealistic, although it had drafted it",
    "replacementText": "because the timetable was unrealistic, although the committee itself had drafted it",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "original",
      "timetable"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I041",
    "source": "issue",
    "sentenceId": "PARA-0015-S21",
    "ruleId": "CLAUSE_REDUCED_RELATIVE_PASSIVE_REMOVE_FINITE_BE",
    "matchText": "Applications were submitted after the deadline will",
    "replacementText": "Applications submitted after the deadline will",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "be",
      "considered"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I042",
    "source": "issue",
    "sentenceId": "PARA-0015-S21",
    "ruleId": "NOUN_EVIDENCE_OF_EVENT",
    "matchText": "evidence for an emergency",
    "replacementText": "evidence of an emergency",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "only",
      "if"
    ],
    "rightContext": [
      "is",
      "provided"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I043",
    "source": "issue",
    "sentenceId": "PARA-0015-S22",
    "ruleId": "APPOSITION_NONRESTRICTIVE_COMMAS",
    "matchText": "Maya the programme officer",
    "replacementText": "Maya, the programme officer,",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "will",
      "review"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I044",
    "source": "issue",
    "sentenceId": "PARA-0015-S22",
    "ruleId": "CLAUSE_REDUCED_RELATIVE_PASSIVE_WRITTEN_NOT_WROTE",
    "matchText": "reports wrote",
    "replacementText": "reports written",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "review"
    ],
    "rightContext": [
      "in",
      "languages"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I045",
    "source": "issue",
    "sentenceId": "PARA-0015-S24",
    "ruleId": "ARTICLE_UNCOUNTABLE_GENERIC_RESEARCH_ZERO",
    "matchText": "conduct the research",
    "replacementText": "conduct research",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "participants"
    ],
    "rightContext": [
      "in",
      "library"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I046",
    "source": "issue",
    "sentenceId": "PARA-0015-S24",
    "ruleId": "ARTICLE_SPECIFIC_KNOWN_PLACE_THE",
    "matchText": "in library",
    "replacementText": "in the library",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "research"
    ],
    "rightContext": [
      "but",
      "they"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I047",
    "source": "issue",
    "sentenceId": "PARA-0015-S24",
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_STUDENT_ROLE",
    "matchText": "go to the university to study",
    "replacementText": "go to university to study",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "they"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I048",
    "source": "issue",
    "sentenceId": "PARA-0015-S25",
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_OF_NAME_THE",
    "matchText": "at University of Westhaven",
    "replacementText": "at the University of Westhaven",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "brother",
      "works"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I049",
    "source": "issue",
    "sentenceId": "PARA-0015-S26",
    "ruleId": "ARTICLE_COUNTRY_NETHERLANDS_THE",
    "matchText": "from Netherlands",
    "replacementText": "from the Netherlands",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "scholar",
      "came"
    ],
    "rightContext": [
      "and",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I050",
    "source": "issue",
    "sentenceId": "PARA-0015-S26",
    "ruleId": "DETERMINER_OPEN_SET_ANOTHER",
    "matchText": "the other came",
    "replacementText": "another came",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "netherlands",
      "and"
    ],
    "rightContext": [
      "from",
      "united"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I051",
    "source": "issue",
    "sentenceId": "PARA-0015-S26",
    "ruleId": "ARTICLE_COUNTRY_UNITED_KINGDOM_THE",
    "matchText": "from United Kingdom",
    "replacementText": "from the United Kingdom",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "other",
      "came"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I052",
    "source": "issue",
    "sentenceId": "PARA-0015-S28",
    "ruleId": "QUESTION_WH_SUBJECT_NO_DO_SUPPORT",
    "matchText": "How many candidates did complete",
    "replacementText": "How many candidates completed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "chair",
      "asked"
    ],
    "rightContext": [
      "the",
      "ethics"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I053",
    "source": "issue",
    "sentenceId": "PARA-0015-S29",
    "ruleId": "NEGATION_NOBODY_NO_DOUBLE_NEGATIVE",
    "matchText": "Nobody did not answer",
    "replacementText": "Nobody answered",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "immediately",
      "but"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I054",
    "source": "issue",
    "sentenceId": "PARA-0015-S30",
    "ruleId": "NOUN_SOLUTION_TO_PROBLEM",
    "matchText": "a solution for the delay",
    "replacementText": "a solution to the delay",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "explained",
      "that"
    ],
    "rightContext": [
      "depended",
      "of"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I055",
    "source": "issue",
    "sentenceId": "PARA-0015-S30",
    "ruleId": "VERB_DEPEND_ON",
    "matchText": "depended of",
    "replacementText": "depended on",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "delay"
    ],
    "rightContext": [
      "cooperation",
      "among"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I056",
    "source": "issue",
    "sentenceId": "PARA-0015-S31",
    "ruleId": "ADJ_AWARE_OF",
    "matchText": "aware about",
    "replacementText": "aware of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "she",
      "was"
    ],
    "rightContext": [
      "the",
      "pressure"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I057",
    "source": "issue",
    "sentenceId": "PARA-0015-S31",
    "ruleId": "ADJ_CONCERNED_ABOUT",
    "matchText": "concerned of",
    "replacementText": "concerned about",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "staff",
      "and"
    ],
    "rightContext": [
      "its",
      "effect"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I058",
    "source": "issue",
    "sentenceId": "PARA-0015-S32",
    "ruleId": "ASPECT_STATIVE_OWN_SIMPLE_NOT_PROGRESSIVE",
    "matchText": "is owning",
    "replacementText": "owns",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "department"
    ],
    "rightContext": [
      "two",
      "recorders"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I059",
    "source": "issue",
    "sentenceId": "PARA-0015-S32",
    "ruleId": "ASPECT_STATIVE_BELONG_SIMPLE_NOT_PROGRESSIVE",
    "matchText": "is belonging",
    "replacementText": "belongs",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "equipment"
    ],
    "rightContext": [
      "to",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I060",
    "source": "issue",
    "sentenceId": "PARA-0015-S33",
    "ruleId": "ASPECT_STATIVE_KNOW_SIMPLE_NOT_PROGRESSIVE",
    "matchText": "are knowing",
    "replacementText": "know",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "staff"
    ],
    "rightContext": [
      "that",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I061",
    "source": "issue",
    "sentenceId": "PARA-0015-S33",
    "ruleId": "ASPECT_STATIVE_CONTAIN_SIMPLE_NOT_PROGRESSIVE",
    "matchText": "is containing",
    "replacementText": "contains",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "software"
    ],
    "rightContext": [
      "sensitive",
      "data"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I062",
    "source": "issue",
    "sentenceId": "PARA-0015-S33",
    "ruleId": "ASPECT_TEMPORARY_ACTIVITY_PRESENT_PROGRESSIVE",
    "matchText": "check",
    "replacementText": "are checking",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "so",
      "they"
    ],
    "rightContext": [
      "each",
      "permission"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0015-I063",
    "source": "issue",
    "sentenceId": "PARA-0015-S34",
    "ruleId": "CLAUSE_WHATEVER_FUTURE_PRESENT_NOT_WILL",
    "matchText": "will be",
    "replacementText": "is",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "final",
      "decision"
    ],
    "rightContext": [
      "the",
      "fellowship"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I001",
    "source": "issue",
    "sentenceId": "PARA-0016-S01",
    "ruleId": "ARTICLE_PROPER_INSTITUTION_EASTFORD_ZERO",
    "matchText": "The Eastford College",
    "replacementText": "Eastford College",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "launched",
      "an"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I002",
    "source": "issue",
    "sentenceId": "PARA-0016-S01",
    "ruleId": "PREP_LAST_TIME_EXPRESSION_ZERO",
    "matchText": "on last autumn",
    "replacementText": "last autumn",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "international",
      "students"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I003",
    "source": "issue",
    "sentenceId": "PARA-0016-S02",
    "ruleId": "ARTICLE_ORDINAL_SPECIFIC_THE",
    "matchText": "During first week",
    "replacementText": "During the first week",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "students",
      "attend"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I004",
    "source": "issue",
    "sentenceId": "PARA-0016-S02",
    "ruleId": "ARTICLE_INSTITUTION_UNIVERSITY_ZERO_ROLE",
    "matchText": "attend the university",
    "replacementText": "attend university",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "week",
      "students"
    ],
    "rightContext": [
      "by",
      "day"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I005",
    "source": "issue",
    "sentenceId": "PARA-0016-S02",
    "ruleId": "PREP_HOME_DIRECTION_NO_TO",
    "matchText": "return to home",
    "replacementText": "return home",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "day",
      "and"
    ],
    "rightContext": [
      "by",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I006",
    "source": "issue",
    "sentenceId": "PARA-0016-S02",
    "ruleId": "ARTICLE_TRANSPORT_BY_ZERO",
    "matchText": "by the bus",
    "replacementText": "by bus",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "home"
    ],
    "rightContext": [
      "in",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I007",
    "source": "issue",
    "sentenceId": "PARA-0016-S03",
    "ruleId": "ARTICLE_MEAL_ROUTINE_ZERO",
    "matchText": "have the breakfast",
    "replacementText": "have breakfast",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "they"
    ],
    "rightContext": [
      "in",
      "their"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I008",
    "source": "issue",
    "sentenceId": "PARA-0016-S03",
    "ruleId": "ARTICLE_ROUTE_NUMBER_DEFINITE_THE",
    "matchText": "taking number 12 bus",
    "replacementText": "taking the number 12 bus",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "residences",
      "before"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I009",
    "source": "issue",
    "sentenceId": "PARA-0016-S04",
    "ruleId": "ARTICLE_UNIQUE_CONTEXT_MAIN_THE",
    "matchText": "in a main library",
    "replacementText": "in the main library",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "they",
      "meet"
    ],
    "rightContext": [
      "rather",
      "than"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I010",
    "source": "issue",
    "sentenceId": "PARA-0016-S04",
    "ruleId": "ARTICLE_INSTITUTION_CLASS_ZERO_ACTIVITY",
    "matchText": "in the class",
    "replacementText": "in class",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "rather",
      "than"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I011",
    "source": "issue",
    "sentenceId": "PARA-0016-S05",
    "ruleId": "ARTICLE_HOSPITAL_INSTITUTIONAL_ZERO_BRITISH",
    "matchText": "go to the hospital",
    "replacementText": "go to hospital",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "medical",
      "advice"
    ],
    "rightContext": [
      "through",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I012",
    "source": "issue",
    "sentenceId": "PARA-0016-S05",
    "ruleId": "ARTICLE_HOSPITAL_SPECIFIC_BUILDING_THE",
    "matchText": "go to hospital as visitors",
    "replacementText": "go to the hospital as visitors",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "friend"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I013",
    "source": "issue",
    "sentenceId": "PARA-0016-S06",
    "ruleId": "PREP_LISTEN_TO",
    "matchText": "listen the radio",
    "replacementText": "listen to the radio",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "afternoon",
      "some"
    ],
    "rightContext": [
      "while",
      "others"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I014",
    "source": "issue",
    "sentenceId": "PARA-0016-S06",
    "ruleId": "ARTICLE_MEDIA_TELEVISION_ZERO",
    "matchText": "watch the television",
    "replacementText": "watch television",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "while",
      "others"
    ],
    "rightContext": [
      "in",
      "common"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I015",
    "source": "issue",
    "sentenceId": "PARA-0016-S06",
    "ruleId": "ARTICLE_SPECIFIC_COMMON_ROOM_THE",
    "matchText": "in common room",
    "replacementText": "in the common room",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "television"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I016",
    "source": "issue",
    "sentenceId": "PARA-0016-S07",
    "ruleId": "VERB_STOP_TO_INFINITIVE_PURPOSE",
    "matchText": "stopped explaining",
    "replacementText": "stopped to explain",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "guide"
    ],
    "rightContext": [
      "the",
      "ticket"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I017",
    "source": "issue",
    "sentenceId": "PARA-0016-S07",
    "ruleId": "VERB_REMIND_NP_TO_INFINITIVE",
    "matchText": "reminded students locking",
    "replacementText": "reminded students to lock",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "machine",
      "and"
    ],
    "rightContext": [
      "their",
      "rooms"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I018",
    "source": "issue",
    "sentenceId": "PARA-0016-S08",
    "ruleId": "VERB_REMEMBER_GERUND_PAST_MEMORY",
    "matchText": "remembered to leave",
    "replacementText": "remembered leaving",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "one",
      "student"
    ],
    "rightContext": [
      "her",
      "card"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I019",
    "source": "issue",
    "sentenceId": "PARA-0016-S08",
    "ruleId": "VERB_TRY_GERUND_EXPERIMENT",
    "matchText": "tried to call",
    "replacementText": "tried calling",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "bus",
      "and"
    ],
    "rightContext": [
      "the",
      "lost-property"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I020",
    "source": "issue",
    "sentenceId": "PARA-0016-S09",
    "ruleId": "VERB_MEAN_GERUND_ENTAIL",
    "matchText": "meant to complete",
    "replacementText": "meant completing",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "card"
    ],
    "rightContext": [
      "another",
      "form"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I021",
    "source": "issue",
    "sentenceId": "PARA-0016-S09",
    "ruleId": "VERB_MEAN_TO_INFINITIVE_INTENTION",
    "matchText": "did not mean delaying",
    "replacementText": "did not mean to delay",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "she"
    ],
    "rightContext": [
      "the",
      "group"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I022",
    "source": "issue",
    "sentenceId": "PARA-0016-S10",
    "ruleId": "TENSE_PRESENT_PERFECT_SINCE_PAST_POINT",
    "matchText": "Since the trial began, the college collected",
    "replacementText": "Since the trial began, the college has collected",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "feedbacks",
      "from"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I023",
    "source": "issue",
    "sentenceId": "PARA-0016-S10",
    "ruleId": "COUNT_FEEDBACK_UNCOUNTABLE",
    "matchText": "feedbacks",
    "replacementText": "feedback",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "college",
      "collected"
    ],
    "rightContext": [
      "from",
      "more"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I024",
    "source": "issue",
    "sentenceId": "PARA-0016-S11",
    "ruleId": "DETERMINER_MOST_GENERIC_PLURAL_NO_OF",
    "matchText": "Most of students",
    "replacementText": "Most students",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "have",
      "found"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I025",
    "source": "issue",
    "sentenceId": "PARA-0016-S11",
    "ruleId": "DETERMINER_MOST_OF_SPECIFIC_GROUP",
    "matchText": "most of students interviewed",
    "replacementText": "most of the students interviewed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "useful",
      "but"
    ],
    "rightContext": [
      "asked",
      "for"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I026",
    "source": "issue",
    "sentenceId": "PARA-0016-S13",
    "ruleId": "QUANTIFIER_LITTLE_NO_OF_BEFORE_NOUN",
    "matchText": "little of time",
    "replacementText": "little time",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "there",
      "was"
    ],
    "rightContext": [
      "during",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I027",
    "source": "issue",
    "sentenceId": "PARA-0016-S13",
    "ruleId": "QUANTIFIER_A_LITTLE_UNCOUNTABLE",
    "matchText": "a few extra time",
    "replacementText": "a little extra time",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "tutors",
      "allowed"
    ],
    "rightContext": [
      "for",
      "questions"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I028",
    "source": "issue",
    "sentenceId": "PARA-0016-S14",
    "ruleId": "DETERMINER_EACH_OF_THE_PLURAL",
    "matchText": "Each of students",
    "replacementText": "Each of the students",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "received",
      "a"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I029",
    "source": "issue",
    "sentenceId": "PARA-0016-S14",
    "ruleId": "DETERMINER_ALL_OF_OBJECT_PRONOUN",
    "matchText": "all them",
    "replacementText": "all of them",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "card",
      "and"
    ],
    "rightContext": [
      "were",
      "asked"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I030",
    "source": "issue",
    "sentenceId": "PARA-0016-S15",
    "ruleId": "ASPECT_BEEN_TO_RETURNED_VISIT",
    "matchText": "had gone to London",
    "replacementText": "had been to London",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "she"
    ],
    "rightContext": [
      "last",
      "year"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I031",
    "source": "issue",
    "sentenceId": "PARA-0016-S15",
    "ruleId": "REPORTED_SPEECH_DEICTIC_LAST_TO_PREVIOUS",
    "matchText": "last year",
    "replacementText": "the previous year",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "london"
    ],
    "rightContext": [
      "but",
      "had"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I032",
    "source": "issue",
    "sentenceId": "PARA-0016-S15",
    "ruleId": "ASPECT_NEVER_BEEN_TO_EXPERIENCE",
    "matchText": "had never gone to Eastford before",
    "replacementText": "had never been to Eastford before",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "year",
      "but"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I033",
    "source": "issue",
    "sentenceId": "PARA-0016-S16",
    "ruleId": "ASPECT_GONE_TO_STILL_AWAY",
    "matchText": "had been to Manchester and would not return",
    "replacementText": "had gone to Manchester and would not return",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "her",
      "brother"
    ],
    "rightContext": [
      "until",
      "friday"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I034",
    "source": "issue",
    "sentenceId": "PARA-0016-S17",
    "ruleId": "VERB_APOLOGISE_TO_PERSON",
    "matchText": "apologised the tutor",
    "replacementText": "apologised to the tutor",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "another",
      "student"
    ],
    "rightContext": [
      "about",
      "arriving"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I035",
    "source": "issue",
    "sentenceId": "PARA-0016-S17",
    "ruleId": "VERB_APOLOGISE_FOR_REASON",
    "matchText": "about arriving late",
    "replacementText": "for arriving late",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "tutor"
    ],
    "rightContext": [
      "and",
      "blamed"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I036",
    "source": "issue",
    "sentenceId": "PARA-0016-S17",
    "ruleId": "VERB_BLAME_RESULT_ON_CAUSE",
    "matchText": "blamed the delay for a cancelled train",
    "replacementText": "blamed the delay on a cancelled train",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "late",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I037",
    "source": "issue",
    "sentenceId": "PARA-0016-S18",
    "ruleId": "VERB_CONGRATULATE_NP_ON",
    "matchText": "congratulated her for finding",
    "replacementText": "congratulated her on finding",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "tutor"
    ],
    "rightContext": [
      "an",
      "alternative"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I038",
    "source": "issue",
    "sentenceId": "PARA-0016-S18",
    "ruleId": "VERB_REMIND_DIRECT_PERSON_NO_TO",
    "matchText": "reminded to everyone that",
    "replacementText": "reminded everyone that",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "route",
      "and"
    ],
    "rightContext": [
      "the",
      "next"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I039",
    "source": "issue",
    "sentenceId": "PARA-0016-S18",
    "ruleId": "REPORTED_SPEECH_FUTURE_IN_PAST",
    "matchText": "will begin",
    "replacementText": "would begin",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "next",
      "workshop"
    ],
    "rightContext": [
      "at",
      "nine"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I040",
    "source": "issue",
    "sentenceId": "PARA-0016-S19",
    "ruleId": "QUESTION_DIRECT_WH_AUX_SUBJECT_ORDER",
    "matchText": "Why the evening bus does stop",
    "replacementText": "Why does the evening bus stop",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "so",
      "early"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I041",
    "source": "issue",
    "sentenceId": "PARA-0016-S21",
    "ruleId": "CLAUSE_NEITHER_AUXILIARY_INVERSION",
    "matchText": "neither the transport office had published",
    "replacementText": "neither had the transport office published",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "previously",
      "but"
    ],
    "rightContext": [
      "a",
      "full"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I042",
    "source": "issue",
    "sentenceId": "PARA-0016-S22",
    "ruleId": "DETERMINER_ANY_IN_NEGATIVE_CLAUSE",
    "matchText": "did not have some cash",
    "replacementText": "did not have any cash",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "that",
      "he"
    ],
    "rightContext": [
      "another",
      "replied"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I043",
    "source": "issue",
    "sentenceId": "PARA-0016-S22",
    "ruleId": "RESPONSE_NEITHER_AUXILIARY_INVERSION",
    "matchText": "Neither I do",
    "replacementText": "Neither do I",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "another",
      "replied"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I044",
    "source": "issue",
    "sentenceId": "PARA-0016-S23",
    "ruleId": "QUESTION_TAG_POSITIVE_MAIN_NEGATIVE_TAG",
    "matchText": "The app is working now, is it?",
    "replacementText": "The app is working now, isn't it?",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "tutor",
      "added"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I045",
    "source": "issue",
    "sentenceId": "PARA-0016-S24",
    "ruleId": "CLAUSE_REDUCED_RELATIVE_NO_WHO_BEFORE_PARTICIPLE",
    "matchText": "students who living",
    "replacementText": "students living",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "submitted",
      "by"
    ],
    "rightContext": [
      "outside",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I046",
    "source": "issue",
    "sentenceId": "PARA-0016-S25",
    "ruleId": "NOUN_IRREGULAR_ANALYSIS_ANALYSES",
    "matchText": "several analysis",
    "replacementText": "several analyses",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "reports",
      "contain"
    ],
    "rightContext": [
      "of",
      "travel"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I047",
    "source": "issue",
    "sentenceId": "PARA-0016-S25",
    "ruleId": "NOUN_INVARIABLE_SERIES_PLURAL",
    "matchText": "two serieses",
    "replacementText": "two series",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "travel",
      "patterns"
    ],
    "rightContext": [
      "of",
      "photographs"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I048",
    "source": "issue",
    "sentenceId": "PARA-0016-S25",
    "ruleId": "NOUN_IRREGULAR_APPENDIX_APPENDICES",
    "matchText": "three appendix",
    "replacementText": "three appendices",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "photographs",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I049",
    "source": "issue",
    "sentenceId": "PARA-0016-S26",
    "ruleId": "NOUN_IRREGULAR_PHENOMENON_SINGULAR",
    "matchText": "One phenomena",
    "replacementText": "One phenomenon",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "appearing",
      "repeatedly"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I050",
    "source": "issue",
    "sentenceId": "PARA-0016-S26",
    "ruleId": "PRONOUN_RELATIVE_HUMAN_WHO",
    "matchText": "students which",
    "replacementText": "students who",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "is",
      "that"
    ],
    "rightContext": [
      "live",
      "more"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I051",
    "source": "issue",
    "sentenceId": "PARA-0016-S26",
    "ruleId": "COMP_FAR_FARTHER_OR_FURTHER",
    "matchText": "more far away",
    "replacementText": "farther away",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "which",
      "live"
    ],
    "rightContext": [
      "spend",
      "lesser"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I052",
    "source": "issue",
    "sentenceId": "PARA-0016-S26",
    "ruleId": "QUANTIFIER_LESS_UNCOUNTABLE_NOT_LESSER",
    "matchText": "lesser time",
    "replacementText": "less time",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "away",
      "spend"
    ],
    "rightContext": [
      "on",
      "campus"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I053",
    "source": "issue",
    "sentenceId": "PARA-0016-S27",
    "ruleId": "COMP_DOUBLE_COMPARATIVE_NO_MORE",
    "matchText": "more faster",
    "replacementText": "faster",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "route",
      "is"
    ],
    "rightContext": [
      "than",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I054",
    "source": "issue",
    "sentenceId": "PARA-0016-S27",
    "ruleId": "REFERENCE_ONE_REPLACES_SINGULAR_COUNT_NOUN",
    "matchText": "the blue",
    "replacementText": "the blue one",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "more",
      "faster",
      "than"
    ],
    "rightContext": [
      "while",
      "the",
      "last"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I055",
    "source": "issue",
    "sentenceId": "PARA-0016-S27",
    "ruleId": "REFERENCE_LATTER_SECOND_OF_TWO",
    "matchText": "the last",
    "replacementText": "the latter",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "blue",
      "while"
    ],
    "rightContext": [
      "is",
      "more"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I056",
    "source": "issue",
    "sentenceId": "PARA-0016-S27",
    "ruleId": "COMP_SHORT_ADJECTIVE_ER_FORM",
    "matchText": "more cheap",
    "replacementText": "cheaper",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "last",
      "is"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I057",
    "source": "issue",
    "sentenceId": "PARA-0016-S28",
    "ruleId": "CLAUSE_INDIRECT_YES_NO_WHETHER_STATEMENT_ORDER",
    "matchText": "asked did the survey represented",
    "replacementText": "asked whether the survey had represented",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "coordinator"
    ],
    "rightContext": [
      "every",
      "group"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I058",
    "source": "issue",
    "sentenceId": "PARA-0016-S28",
    "ruleId": "WORDFORM_ADVERB_FAIRLY_MODIFIES_VERB",
    "matchText": "fair",
    "replacementText": "fairly",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "every",
      "group"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I059",
    "source": "issue",
    "sentenceId": "PARA-0016-S29",
    "ruleId": "SVA_DATA_ACADEMIC_PLURAL",
    "matchText": "the data was limited",
    "replacementText": "the data were limited",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "noted",
      "that"
    ],
    "rightContext": [
      "and",
      "that"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I060",
    "source": "issue",
    "sentenceId": "PARA-0016-S29",
    "ruleId": "COUNT_EVIDENCE_UNCOUNTABLE",
    "matchText": "some of the evidences were",
    "replacementText": "some of the evidence was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "that"
    ],
    "rightContext": [
      "inconclusive"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I061",
    "source": "issue",
    "sentenceId": "PARA-0016-S30",
    "ruleId": "VERB_REQUEST_DIRECT_OBJECT_NO_FOR",
    "matchText": "requested for more",
    "replacementText": "requested more",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "committee",
      "therefore"
    ],
    "rightContext": [
      "informations",
      "from"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I062",
    "source": "issue",
    "sentenceId": "PARA-0016-S30",
    "ruleId": "INFORMATION_UNCOUNTABLE",
    "matchText": "informations",
    "replacementText": "information",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "more"
    ],
    "rightContext": [
      "from",
      "students"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I063",
    "source": "issue",
    "sentenceId": "PARA-0016-S30",
    "ruleId": "PRONOUN_RELATIVE_WHOSE_POSSESSIVE",
    "matchText": "students which journeys",
    "replacementText": "students whose journeys",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "informations",
      "from"
    ],
    "rightContext": [
      "involved",
      "more"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I064",
    "source": "issue",
    "sentenceId": "PARA-0016-S30",
    "ruleId": "QUANTIFIER_MORE_THAN_ONE",
    "matchText": "more one form",
    "replacementText": "more than one form",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "journeys",
      "involved"
    ],
    "rightContext": [
      "of",
      "transport"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I065",
    "source": "issue",
    "sentenceId": "PARA-0016-S31",
    "ruleId": "SVA_POSSESSIVE_THEIR_SINGULAR_HEAD_WAS",
    "matchText": "their address were",
    "replacementText": "their address was",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "check",
      "that"
    ],
    "rightContext": [
      "correct"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I066",
    "source": "issue",
    "sentenceId": "PARA-0016-S32",
    "ruleId": "VERB_CONTACT_WH_INFINITIVE_NO_PREPOSITION",
    "matchText": "to whom",
    "replacementText": "whom",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "know"
    ],
    "rightContext": [
      "to",
      "contact"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0016-I067",
    "source": "issue",
    "sentenceId": "PARA-0016-S32",
    "ruleId": "CLAUSE_WHEN_FUTURE_PRESENT",
    "matchText": "will arise",
    "replacementText": "arises",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "problem"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I001",
    "source": "issue",
    "sentenceId": "PARA-0017-S01",
    "ruleId": "ARTICLE_NAMED_DISTRICT_THE",
    "matchText": "Riverside district",
    "replacementText": "the Riverside district",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "show",
      "how"
    ],
    "rightContext": [
      "has",
      "changed"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I002",
    "source": "issue",
    "sentenceId": "PARA-0017-S01",
    "ruleId": "TENSE_MAP_COMPLETED_PERIOD_PAST_SIMPLE",
    "matchText": "has changed",
    "replacementText": "changed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "riverside",
      "district"
    ],
    "rightContext": [
      "from",
      "1995"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I003",
    "source": "issue",
    "sentenceId": "PARA-0017-S01",
    "ruleId": "PREP_MAP_PERIOD_BETWEEN_AND",
    "matchText": "from 1995 until 2025",
    "replacementText": "between 1995 and 2025",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "has",
      "changed"
    ],
    "rightContext": [
      "and",
      "how"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I004",
    "source": "issue",
    "sentenceId": "PARA-0017-S01",
    "ruleId": "PASSIVE_PROPOSAL_SUBJECT_IS_PROPOSED_TO_BE",
    "matchText": "it proposes to develop",
    "replacementText": "it is proposed to be developed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "how"
    ],
    "rightContext": [
      "until",
      "2035"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I005",
    "source": "issue",
    "sentenceId": "PARA-0017-S01",
    "ruleId": "PREP_MAP_FUTURE_BY_YEAR",
    "matchText": "until 2035",
    "replacementText": "by 2035",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "develop"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I006",
    "source": "issue",
    "sentenceId": "PARA-0017-S02",
    "ruleId": "COLLOC_EVOLVE_FROM_INTO",
    "matchText": "transformed",
    "replacementText": "evolved",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "area",
      "has"
    ],
    "rightContext": [
      "from",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I007",
    "source": "issue",
    "sentenceId": "PARA-0017-S02",
    "ruleId": "ORTHOGRAPHY_LY_ADVERB_NO_HYPHEN",
    "matchText": "lightly-developed",
    "replacementText": "lightly developed",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "from",
      "a"
    ],
    "rightContext": [
      "riverside",
      "settlement"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I008",
    "source": "issue",
    "sentenceId": "PARA-0017-S02",
    "ruleId": "WORDFORM_DENSITY_TO_DENSER",
    "matchText": "to a density",
    "replacementText": "into a denser",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "riverside",
      "settlement"
    ],
    "rightContext": [
      "mixed-use",
      "neighbourhood"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I009",
    "source": "issue",
    "sentenceId": "PARA-0017-S02",
    "ruleId": "PASSIVE_INTEND_BE_INTENDED_TO",
    "matchText": "intends improving",
    "replacementText": "is intended to improve",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "next",
      "phase"
    ],
    "rightContext": [
      "pedestrian",
      "access"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I010",
    "source": "issue",
    "sentenceId": "PARA-0017-S02",
    "ruleId": "CLAUSE_WHILE_SHARED_SUBJECT_PARTICIPLE",
    "matchText": "remain",
    "replacementText": "retaining",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "access",
      "while"
    ],
    "rightContext": [
      "the",
      "central"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I011",
    "source": "issue",
    "sentenceId": "PARA-0017-S03",
    "ruleId": "PREP_YEAR_IN",
    "matchText": "On 1995",
    "replacementText": "In 1995",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "a",
      "two-lanes"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I012",
    "source": "issue",
    "sentenceId": "PARA-0017-S03",
    "ruleId": "NOUN_COMPOUND_NUMERAL_SINGULAR_HYPHEN",
    "matchText": "a two-lanes road",
    "replacementText": "a two-lane road",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "on",
      "1995"
    ],
    "rightContext": [
      "went",
      "from"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I013",
    "source": "issue",
    "sentenceId": "PARA-0017-S03",
    "ruleId": "MAP_ROUTE_RUN_FROM_TO",
    "matchText": "went from west towards east",
    "replacementText": "ran from west to east",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "two-lanes",
      "road"
    ],
    "rightContext": [
      "besides",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I014",
    "source": "issue",
    "sentenceId": "PARA-0017-S03",
    "ruleId": "PREP_MAP_ALONG_BANK_NOT_BESIDES",
    "matchText": "besides the northern bank",
    "replacementText": "along the northern bank",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "towards",
      "east"
    ],
    "rightContext": [
      "of",
      "river"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I015",
    "source": "issue",
    "sentenceId": "PARA-0017-S03",
    "ruleId": "ARTICLE_RIVER_NAME_THE_RIVER_NAME",
    "matchText": "River Elin",
    "replacementText": "the River Elin",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "bank",
      "of"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I016",
    "source": "issue",
    "sentenceId": "PARA-0017-S04",
    "ruleId": "PREP_ON_SIDE_OF",
    "matchText": "in the north side of",
    "replacementText": "on the north side of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "cottages",
      "stood"
    ],
    "rightContext": [
      "the",
      "road"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I017",
    "source": "issue",
    "sentenceId": "PARA-0017-S04",
    "ruleId": "MAP_OPPOSITE_DIRECT_OBJECT",
    "matchText": "opposite of a small park",
    "replacementText": "opposite a small park",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "road"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I018",
    "source": "issue",
    "sentenceId": "PARA-0017-S05",
    "ruleId": "VERB_LIE_PAST_LAY_NOT_LAID",
    "matchText": "laid",
    "replacementText": "lay",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "post",
      "office"
    ],
    "rightContext": [
      "among",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I019",
    "source": "issue",
    "sentenceId": "PARA-0017-S05",
    "ruleId": "PREP_BETWEEN_TWO_LANDMARKS",
    "matchText": "among the park and a grocery shop",
    "replacementText": "between the park and a grocery shop",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "office",
      "laid"
    ],
    "rightContext": [
      "while",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I020",
    "source": "issue",
    "sentenceId": "PARA-0017-S05",
    "ruleId": "MAP_LOCATION_AT_EASTERN_END_OF",
    "matchText": "on the east end in the district",
    "replacementText": "at the eastern end of the district",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "site"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I021",
    "source": "issue",
    "sentenceId": "PARA-0017-S06",
    "ruleId": "MAP_LOCATION_SOUTH_OF_NO_AT",
    "matchText": "At south of the river",
    "replacementText": "South of the river",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "farmlands",
      "extended"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I022",
    "source": "issue",
    "sentenceId": "PARA-0017-S06",
    "ruleId": "COUNT_FARMLAND_UNCOUNTABLE",
    "matchText": "farmlands",
    "replacementText": "farmland",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "river"
    ],
    "rightContext": [
      "extended",
      "until"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I023",
    "source": "issue",
    "sentenceId": "PARA-0017-S06",
    "ruleId": "MAP_EXTEND_TOWARDS",
    "matchText": "extended until the railway",
    "replacementText": "extended towards the railway",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "river",
      "farmlands"
    ],
    "rightContext": [
      "and",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I024",
    "source": "issue",
    "sentenceId": "PARA-0017-S06",
    "ruleId": "ADJ_ACCESSIBLE_BE_COMPLEMENT",
    "matchText": "the area could only access",
    "replacementText": "the area was accessible only",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "railway",
      "and"
    ],
    "rightContext": [
      "through",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I025",
    "source": "issue",
    "sentenceId": "PARA-0017-S06",
    "ruleId": "MAP_ACCESS_VIA_FOOTBRIDGE",
    "matchText": "through a narrow walking bridge",
    "replacementText": "via a narrow footbridge",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "only",
      "access"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I026",
    "source": "issue",
    "sentenceId": "PARA-0017-S07",
    "ruleId": "VERB_BRIDGE_CROSS_ACTIVE",
    "matchText": "No road bridge was crossed the river",
    "replacementText": "No road bridge crossed the river",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "and",
      "there"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I027",
    "source": "issue",
    "sentenceId": "PARA-0017-S07",
    "ruleId": "CLAUSE_EXISTENTIAL_THERE_WAS_NO",
    "matchText": "there had no direct connection",
    "replacementText": "there was no direct connection",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "river",
      "and"
    ],
    "rightContext": [
      "between",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I028",
    "source": "issue",
    "sentenceId": "PARA-0017-S07",
    "ruleId": "PREP_CONNECTION_BETWEEN_AND",
    "matchText": "between the station to the town centre",
    "replacementText": "between the station and the town centre",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "direct",
      "connection"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I029",
    "source": "issue",
    "sentenceId": "PARA-0017-S08",
    "ruleId": "PREP_OVER_THE_FOLLOWING_PERIOD",
    "matchText": "During following thirty years",
    "replacementText": "Over the following thirty years",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "cottages"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I030",
    "source": "issue",
    "sentenceId": "PARA-0017-S08",
    "ruleId": "PASSIVE_PAST_WERE_REPLACED_BY",
    "matchText": "the cottages replaced by",
    "replacementText": "the cottages were replaced by",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "thirty",
      "years"
    ],
    "rightContext": [
      "three",
      "apartment"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I031",
    "source": "issue",
    "sentenceId": "PARA-0017-S08",
    "ruleId": "VERB_CONVERT_INTO",
    "matchText": "converted as a medical centre",
    "replacementText": "converted into a medical centre",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "shop",
      "was"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I032",
    "source": "issue",
    "sentenceId": "PARA-0017-S09",
    "ruleId": "MAP_ENLARGE_EASTWARDS",
    "matchText": "expanded to east",
    "replacementText": "enlarged eastwards",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "park",
      "was"
    ],
    "rightContext": [
      "despite",
      "its"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I033",
    "source": "issue",
    "sentenceId": "PARA-0017-S09",
    "ruleId": "CONJ_ALTHOUGH_FINITE_CLAUSE",
    "matchText": "despite its original entrance remained at the same location",
    "replacementText": "although its original entrance remained in the same position",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "east"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I034",
    "source": "issue",
    "sentenceId": "PARA-0017-S10",
    "ruleId": "PASSIVE_PAST_WAS_DEMOLISHED",
    "matchText": "The warehouse demolished",
    "replacementText": "The warehouse was demolished",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "and",
      "a"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I035",
    "source": "issue",
    "sentenceId": "PARA-0017-S10",
    "ruleId": "PASSIVE_PAST_WAS_BUILT",
    "matchText": "a supermarket constructed",
    "replacementText": "a supermarket was built",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "demolished",
      "and"
    ],
    "rightContext": [
      "over",
      "its"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I036",
    "source": "issue",
    "sentenceId": "PARA-0017-S10",
    "ruleId": "MAP_BUILD_ON_FORMER_SITE",
    "matchText": "over its previous site",
    "replacementText": "on its former site",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "supermarket",
      "constructed"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I037",
    "source": "issue",
    "sentenceId": "PARA-0017-S11",
    "ruleId": "VERB_LINK_A_WITH_B_NO_BETWEEN",
    "matchText": "linking between the main road and the station",
    "replacementText": "linking the main road with the station",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "river"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I038",
    "source": "issue",
    "sentenceId": "PARA-0017-S12",
    "ruleId": "MEASURE_MOVE_DISTANCE_NO_FOR",
    "matchText": "moved for about 200 metres",
    "replacementText": "relocated about 200 metres",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "footbridge",
      "was"
    ],
    "rightContext": [
      "at",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I039",
    "source": "issue",
    "sentenceId": "PARA-0017-S12",
    "ruleId": "MAP_DISTANCE_WEST_OF",
    "matchText": "at the west from its original position",
    "replacementText": "west of its original position",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "200",
      "metres"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I040",
    "source": "issue",
    "sentenceId": "PARA-0017-S13",
    "ruleId": "PREP_NEXT_TO_REQUIRES_TO",
    "matchText": "The road section next",
    "replacementText": "The section of road beside",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "park"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I041",
    "source": "issue",
    "sentenceId": "PARA-0017-S13",
    "ruleId": "WORDFORM_PEDESTRIANISE_ROAD",
    "matchText": "made pedestrian",
    "replacementText": "pedestrianised",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "park",
      "was"
    ],
    "rightContext": [
      "with",
      "traffic"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I042",
    "source": "issue",
    "sentenceId": "PARA-0017-S13",
    "ruleId": "PREP_DIVERT_TRAFFIC_ONTO",
    "matchText": "redirected in a new bypass which ran",
    "replacementText": "diverted onto a new bypass running",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "with",
      "traffic"
    ],
    "rightContext": [
      "around",
      "north"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I043",
    "source": "issue",
    "sentenceId": "PARA-0017-S13",
    "ruleId": "WORDFORM_NORTH_TO_NORTHERN_ATTRIBUTIVE",
    "matchText": "north",
    "replacementText": "the northern",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "ran",
      "around"
    ],
    "rightContext": [
      "edge",
      "of"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I044",
    "source": "issue",
    "sentenceId": "PARA-0017-S13",
    "ruleId": "ARTICLE_DEFINED_DISTRICT_THE",
    "matchText": "district",
    "replacementText": "the district",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "edge",
      "of"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I045",
    "source": "issue",
    "sentenceId": "PARA-0017-S14",
    "ruleId": "COUNT_PARKING_CAR_PARK",
    "matchText": "A parking",
    "replacementText": "A car park",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "was",
      "added"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I046",
    "source": "issue",
    "sentenceId": "PARA-0017-S14",
    "ruleId": "WORDCHOICE_BESIDE_NOT_BESIDES",
    "matchText": "besides the supermarket",
    "replacementText": "next to the supermarket",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "was",
      "added"
    ],
    "rightContext": [
      "and",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I047",
    "source": "issue",
    "sentenceId": "PARA-0017-S14",
    "ruleId": "MAP_BUS_STOP_NOT_STATION",
    "matchText": "a bus station",
    "replacementText": "a bus stop",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "supermarket",
      "and"
    ],
    "rightContext": [
      "was",
      "installed"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I048",
    "source": "issue",
    "sentenceId": "PARA-0017-S14",
    "ruleId": "MAP_JUNCTION_AT_OF_AND",
    "matchText": "on the cross of the bypass with Station Road",
    "replacementText": "at the junction of the bypass and Station Road",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "was",
      "installed"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I049",
    "source": "issue",
    "sentenceId": "PARA-0017-S15",
    "ruleId": "PREP_REGARDLESS_OF",
    "matchText": "Regardless these changes",
    "replacementText": "Despite these changes",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "railway"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I050",
    "source": "issue",
    "sentenceId": "PARA-0017-S15",
    "ruleId": "MAP_OUTSIDE_BOUNDARY",
    "matchText": "out of the district border",
    "replacementText": "outside the district boundary",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "station",
      "remained"
    ],
    "rightContext": [
      "at",
      "south"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I051",
    "source": "issue",
    "sentenceId": "PARA-0017-S15",
    "ruleId": "MAP_LOCATION_SOUTH_OF_NO_AT",
    "matchText": "at south of the new bridge",
    "replacementText": "south of the new bridge",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "district",
      "border"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I052",
    "source": "issue",
    "sentenceId": "PARA-0017-S16",
    "ruleId": "VERB_FACE_DIRECT_OBJECT",
    "matchText": "faced to medical centre",
    "replacementText": "faced the medical centre",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "supermarket"
    ],
    "rightContext": [
      "whereas",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I053",
    "source": "issue",
    "sentenceId": "PARA-0017-S16",
    "ruleId": "WORDFORM_DIAGONALLY_ADVERB",
    "matchText": "located diagonal",
    "replacementText": "situated diagonally",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "stop",
      "was"
    ],
    "rightContext": [
      "opposite",
      "with"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I054",
    "source": "issue",
    "sentenceId": "PARA-0017-S16",
    "ruleId": "MAP_OPPOSITE_NO_WITH",
    "matchText": "opposite with the park entrance",
    "replacementText": "opposite the park entrance",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "located",
      "diagonal"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I055",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "PREP_MAP_FUTURE_BY_YEAR",
    "matchText": "Until",
    "replacementText": "By",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "2035",
      "it"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I056",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "PASSIVE_PLANNED_FEATURE_SUBJECT_FRONTING",
    "matchText": "it is planned a walkway",
    "replacementText": "a walkway is planned",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "until",
      "2035"
    ],
    "rightContext": [
      "for",
      "connecting"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I057",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "PURPOSE_TO_INFINITIVE",
    "matchText": "for connecting",
    "replacementText": "to connect",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "walkway"
    ],
    "rightContext": [
      "the",
      "station"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I058",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "VERB_CONNECT_A_TO_B",
    "matchText": "with",
    "replacementText": "to the",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "connecting",
      "the",
      "station"
    ],
    "rightContext": [
      "public",
      "square",
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I059",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "COUNT_BICYCLE_PARKING_UNCOUNTABLE",
    "matchText": "parkings",
    "replacementText": "parking",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "bicycle"
    ],
    "rightContext": [
      "will",
      "be"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I060",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "COLLOC_PROVIDE_PARKING",
    "matchText": "supplied",
    "replacementText": "provided",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "be"
    ],
    "rightContext": [
      "in",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I061",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "PREP_ON_BOTH_SIDES_NO_THE",
    "matchText": "in the",
    "replacementText": "on",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "be",
      "supplied"
    ],
    "rightContext": [
      "both",
      "sides"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I062",
    "source": "issue",
    "sentenceId": "PARA-0017-S17",
    "ruleId": "ARTICLE_SPECIFIC_RAMP_THE",
    "matchText": "southern",
    "replacementText": "the southern",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "sides",
      "of"
    ],
    "rightContext": [
      "ramp"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I063",
    "source": "issue",
    "sentenceId": "PARA-0017-S18",
    "ruleId": "MAP_IN_THE_PROPOSAL",
    "matchText": "According to 2035 proposal",
    "replacementText": "In the 2035 proposal",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "medical"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I064",
    "source": "issue",
    "sentenceId": "PARA-0017-S18",
    "ruleId": "PASSIVE_DUE_TO_BE_PARTICIPLE",
    "matchText": "is due for extending",
    "replacementText": "is due to be extended",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "medical",
      "centre"
    ],
    "rightContext": [
      "to",
      "north"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I065",
    "source": "issue",
    "sentenceId": "PARA-0017-S18",
    "ruleId": "MAP_DIRECTION_TO_THE_NORTH",
    "matchText": "to north",
    "replacementText": "to the north",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "for",
      "extending"
    ],
    "rightContext": [
      "and",
      "a"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I066",
    "source": "issue",
    "sentenceId": "PARA-0017-S18",
    "ruleId": "PASSIVE_FUTURE_WILL_BE_ADDED",
    "matchText": "a pharmacy will add",
    "replacementText": "a pharmacy will be added",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "north",
      "and"
    ],
    "rightContext": [
      "adjacent",
      "with"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I067",
    "source": "issue",
    "sentenceId": "PARA-0017-S18",
    "ruleId": "ADJ_ADJACENT_TO",
    "matchText": "adjacent with it",
    "replacementText": "beside it",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "add"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I068",
    "source": "issue",
    "sentenceId": "PARA-0017-S19",
    "ruleId": "MAP_CENTRAL_FEATURE_ARTICLE_AND_WORD_FORM",
    "matchText": "Apartment block at centre will",
    "replacementText": "The central apartment block will",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "knock",
      "down"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I069",
    "source": "issue",
    "sentenceId": "PARA-0017-S19",
    "ruleId": "PASSIVE_PHRASAL_KNOCK_DOWN",
    "matchText": "knock down",
    "replacementText": "be demolished",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "centre",
      "will"
    ],
    "rightContext": [
      "and",
      "its"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I070",
    "source": "issue",
    "sentenceId": "PARA-0017-S19",
    "ruleId": "VERB_TURN_INTO_NOT_TURN_TO",
    "matchText": "and its site will turn to",
    "replacementText": "with the site becoming",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "knock",
      "down"
    ],
    "rightContext": [
      "a",
      "public"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I071",
    "source": "issue",
    "sentenceId": "PARA-0017-S19",
    "ruleId": "PASSIVE_SURROUNDED_BY",
    "matchText": "surrounding with",
    "replacementText": "surrounded by",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "public",
      "square"
    ],
    "rightContext": [
      "cafés"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I072",
    "source": "issue",
    "sentenceId": "PARA-0017-S20",
    "ruleId": "COLLOC_CYCLE_PATH",
    "matchText": "cycling path",
    "replacementText": "cycle path",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a"
    ],
    "rightContext": [
      "will",
      "run"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I073",
    "source": "issue",
    "sentenceId": "PARA-0017-S20",
    "ruleId": "ORTHOGRAPHY_ALONGSIDE_ONE_WORD",
    "matchText": "along side",
    "replacementText": "alongside",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "run"
    ],
    "rightContext": [
      "both",
      "river"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I074",
    "source": "issue",
    "sentenceId": "PARA-0017-S20",
    "ruleId": "DETERMINER_BOTH_BANKS_OF_RIVER",
    "matchText": "both river banks",
    "replacementText": "both banks of the river",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "along",
      "side"
    ],
    "rightContext": [
      "and",
      "pass"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I075",
    "source": "issue",
    "sentenceId": "PARA-0017-S20",
    "ruleId": "PREP_BENEATH_NO_OF",
    "matchText": "under of the road bridge",
    "replacementText": "beneath the road bridge",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "pass"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I076",
    "source": "issue",
    "sentenceId": "PARA-0017-S21",
    "ruleId": "VERB_PROVIDE_ACCESS_TO",
    "matchText": "provide the path an access",
    "replacementText": "provide access to the path",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "ramps",
      "will"
    ],
    "rightContext": [
      "from",
      "every"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I077",
    "source": "issue",
    "sentenceId": "PARA-0017-S21",
    "ruleId": "DETERMINER_EITHER_SIDE_OF_TWO",
    "matchText": "from every side of the bridge",
    "replacementText": "from either side of the bridge",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "an",
      "access"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I078",
    "source": "issue",
    "sentenceId": "PARA-0017-S22",
    "ruleId": "PASSIVE_FUTURE_WILL_BE_MOVED",
    "matchText": "relocate",
    "replacementText": "be moved",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "park",
      "will"
    ],
    "rightContext": [
      "underground",
      "which"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I079",
    "source": "issue",
    "sentenceId": "PARA-0017-S22",
    "ruleId": "CLAUSE_RESULT_ALLOWING_LAND_ABOVE_IT",
    "matchText": "which allows the above land",
    "replacementText": "allowing the land above it",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "relocate",
      "underground"
    ],
    "rightContext": [
      "to",
      "use"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I080",
    "source": "issue",
    "sentenceId": "PARA-0017-S22",
    "ruleId": "PASSIVE_INFINITIVE_TO_BE_USED",
    "matchText": "use",
    "replacementText": "be used",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "above",
      "land",
      "to"
    ],
    "rightContext": [
      "for",
      "a",
      "playground"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I081",
    "source": "issue",
    "sentenceId": "PARA-0017-S22",
    "ruleId": "PREP_USED_AS_ROLE",
    "matchText": "for",
    "replacementText": "as",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "land",
      "to",
      "use"
    ],
    "rightContext": [
      "a",
      "playground"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I082",
    "source": "issue",
    "sentenceId": "PARA-0017-S23",
    "ruleId": "MAP_CORNER_AT_OF",
    "matchText": "In the south-east corner from",
    "replacementText": "At the south-eastern corner of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "district"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I083",
    "source": "issue",
    "sentenceId": "PARA-0017-S23",
    "ruleId": "ARTICLE_PART_OF_THE_LAND",
    "matchText": "farmland",
    "replacementText": "the farmland",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "part",
      "of"
    ],
    "rightContext": [
      "will",
      "divide"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I084",
    "source": "issue",
    "sentenceId": "PARA-0017-S23",
    "ruleId": "PASSIVE_FUTURE_WILL_BE_DIVIDED",
    "matchText": "divide",
    "replacementText": "be divided",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "farmland",
      "will"
    ],
    "rightContext": [
      "to",
      "plots"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I085",
    "source": "issue",
    "sentenceId": "PARA-0017-S23",
    "ruleId": "VERB_DIVIDE_INTO",
    "matchText": "to",
    "replacementText": "into",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "farmland",
      "will",
      "divide"
    ],
    "rightContext": [
      "plots",
      "of",
      "detached"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I086",
    "source": "issue",
    "sentenceId": "PARA-0017-S23",
    "ruleId": "MAP_PLOTS_FOR_HOUSES_HOUSING_COUNTABILITY",
    "matchText": "of detached housings",
    "replacementText": "for detached houses",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "plots"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I087",
    "source": "issue",
    "sentenceId": "PARA-0017-S24",
    "ruleId": "VERB_FACE_DIRECT_OBJECT",
    "matchText": "be facing to",
    "replacementText": "face",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "homes",
      "will"
    ],
    "rightContext": [
      "the",
      "river"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I088",
    "source": "issue",
    "sentenceId": "PARA-0017-S24",
    "ruleId": "PASSIVE_CONNECTED_TO",
    "matchText": "connect with",
    "replacementText": "be connected to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "will"
    ],
    "rightContext": [
      "the",
      "station"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I089",
    "source": "issue",
    "sentenceId": "PARA-0017-S24",
    "ruleId": "PREP_BY_ROAD_MEANS_OF_CONNECTION",
    "matchText": "through",
    "replacementText": "by",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "station"
    ],
    "rightContext": [
      "a",
      "road"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I090",
    "source": "issue",
    "sentenceId": "PARA-0017-S24",
    "ruleId": "PHRASAL_BRANCH_OFF",
    "matchText": "branched from",
    "replacementText": "branching off",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "a",
      "road"
    ],
    "rightContext": [
      "station",
      "road"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I091",
    "source": "issue",
    "sentenceId": "PARA-0017-S25",
    "ruleId": "LINKER_FINALLY_NOT_AT_THE_END",
    "matchText": "At the end",
    "replacementText": "Finally",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "footbridge"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I092",
    "source": "issue",
    "sentenceId": "PARA-0017-S25",
    "ruleId": "LINKING_REMAIN_ADJECTIVE_NO_AS",
    "matchText": "as unchanged",
    "replacementText": "unchanged",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "remain"
    ],
    "rightContext": [
      "but",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I093",
    "source": "issue",
    "sentenceId": "PARA-0017-S25",
    "ruleId": "WORDFORM_NEARBY_ATTRIBUTIVE",
    "matchText": "neighbour",
    "replacementText": "nearby",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "the"
    ],
    "rightContext": [
      "riverbank",
      "will"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I094",
    "source": "issue",
    "sentenceId": "PARA-0017-S25",
    "ruleId": "PASSIVE_FUTURE_WILL_BE_WIDENED",
    "matchText": "widen",
    "replacementText": "be widened",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "riverbank",
      "will"
    ],
    "rightContext": [
      "for",
      "creating"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I095",
    "source": "issue",
    "sentenceId": "PARA-0017-S25",
    "ruleId": "MAP_PURPOSE_CREATE_VIEWING_AREA",
    "matchText": "for creating a viewing place",
    "replacementText": "to create a viewing area",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "widen"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I096",
    "source": "issue",
    "sentenceId": "PARA-0017-S26",
    "ruleId": "DETERMINER_MOST_GENERIC_NO_OF",
    "matchText": "of residents",
    "replacementText": "residents",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "2035",
      "most"
    ],
    "rightContext": [
      "will",
      "reside"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I097",
    "source": "issue",
    "sentenceId": "PARA-0017-S26",
    "ruleId": "COLLOC_WITHIN_WALKING_DISTANCE_OF",
    "matchText": "reside at a walking distance from",
    "replacementText": "live within walking distance of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "residents",
      "will"
    ],
    "rightContext": [
      "shops",
      "public"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I098",
    "source": "issue",
    "sentenceId": "PARA-0017-S26",
    "ruleId": "COUNT_PUBLIC_TRANSPORT_UNCOUNTABLE",
    "matchText": "transports",
    "replacementText": "transport",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "shops",
      "public"
    ],
    "rightContext": [
      "and",
      "opened"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0017-I099",
    "source": "issue",
    "sentenceId": "PARA-0017-S26",
    "ruleId": "WORDFORM_OPEN_SPACE_NOT_OPENED",
    "matchText": "opened spaces",
    "replacementText": "open space",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "transports",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I001",
    "source": "issue",
    "sentenceId": "PARA-0018-S01",
    "ruleId": "VERB_ILLUSTRATE_DIRECT_OBJECT_NO_ABOUT",
    "matchText": "illustrates about",
    "replacementText": "illustrates",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "line",
      "graph"
    ],
    "rightContext": [
      "annual",
      "household"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I002",
    "source": "issue",
    "sentenceId": "PARA-0018-S01",
    "ruleId": "PREP_MEASURED_IN_UNIT",
    "matchText": "measured by MWh",
    "replacementText": "measured in MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "four",
      "regions"
    ],
    "rightContext": [
      "between",
      "2005"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I003",
    "source": "issue",
    "sentenceId": "PARA-0018-S01",
    "ruleId": "PREP_BETWEEN_AND_TIME_RANGE",
    "matchText": "between 2005 to 2035",
    "replacementText": "between 2005 and 2035",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "by",
      "mwh"
    ],
    "rightContext": [
      "while",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I004",
    "source": "issue",
    "sentenceId": "PARA-0018-S01",
    "ruleId": "VERB_COMPARE_DIRECT_OBJECT_NO_BETWEEN",
    "matchText": "compares between its sources",
    "replacementText": "compares its sources",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "bar",
      "chart"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I005",
    "source": "issue",
    "sentenceId": "PARA-0018-S02",
    "ruleId": "VERB_OVERTAKE_DIRECT_OBJECT_NO_THAN",
    "matchText": "overtook than it",
    "replacementText": "overtook it",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "but",
      "eastport"
    ],
    "rightContext": [
      "whereas",
      "westmere"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I006",
    "source": "issue",
    "sentenceId": "PARA-0018-S02",
    "ruleId": "ARTICLE_SUPERLATIVE_THE_REQUIRED",
    "matchText": "remained lowest",
    "replacementText": "remained the lowest",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "whereas",
      "westmere"
    ],
    "rightContext": [
      "from",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I007",
    "source": "issue",
    "sentenceId": "PARA-0018-S02",
    "ruleId": "COMP_SUPERLATIVE_OF_DEFINED_SET",
    "matchText": "from the four",
    "replacementText": "of the four",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "remained",
      "lowest"
    ],
    "rightContext": [
      "for",
      "most"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I008",
    "source": "issue",
    "sentenceId": "PARA-0018-S02",
    "ruleId": "ARTICLE_MOST_OF_DEFINITE_PERIOD",
    "matchText": "most of period",
    "replacementText": "most of the period",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "four",
      "for"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I009",
    "source": "issue",
    "sentenceId": "PARA-0018-S03",
    "ruleId": "PREP_YEAR_IN",
    "matchText": "At 2005",
    "replacementText": "In 2005",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "figure"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I010",
    "source": "issue",
    "sentenceId": "PARA-0018-S03",
    "ruleId": "NOUN_FIGURE_FOR_CATEGORY",
    "matchText": "the figure of Northland",
    "replacementText": "the figure for Northland",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "at",
      "2005"
    ],
    "rightContext": [
      "stood",
      "4"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I011",
    "source": "issue",
    "sentenceId": "PARA-0018-S03",
    "ruleId": "COLLOC_STAND_AT_VALUE",
    "matchText": "stood 4.0 MWh",
    "replacementText": "stood at 4.0 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "of",
      "northland"
    ],
    "rightContext": [
      "comparing",
      "with"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I012",
    "source": "issue",
    "sentenceId": "PARA-0018-S03",
    "ruleId": "PARTICIPLE_COMPARED_WITH_BASELINE",
    "matchText": "comparing with",
    "replacementText": "compared with",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "0",
      "mwh"
    ],
    "rightContext": [
      "3",
      "2"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I013",
    "source": "issue",
    "sentenceId": "PARA-0018-S03",
    "ruleId": "NOUN_FIGURE_FOR_CATEGORY",
    "matchText": "3.2 MWh of Eastport",
    "replacementText": "3.2 MWh for Eastport",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "comparing",
      "with"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I014",
    "source": "issue",
    "sentenceId": "PARA-0018-S04",
    "ruleId": "CHANGE_RISE_FROM_TO",
    "matchText": "by",
    "replacementText": "to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "from",
      "4",
      "0"
    ],
    "rightContext": [
      "a",
      "peak",
      "at"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I015",
    "source": "issue",
    "sentenceId": "PARA-0018-S04",
    "ruleId": "NOUN_PEAK_OF_VALUE",
    "matchText": "at",
    "replacementText": "of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "by",
      "a",
      "peak"
    ],
    "rightContext": [
      "4",
      "5",
      "mwh"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I016",
    "source": "issue",
    "sentenceId": "PARA-0018-S04",
    "ruleId": "NOUN_INCREASE_OF_AMOUNT",
    "matchText": "by",
    "replacementText": "of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "2010",
      "an",
      "increase"
    ],
    "rightContext": [
      "0",
      "5",
      "mwh"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I017",
    "source": "issue",
    "sentenceId": "PARA-0018-S05",
    "ruleId": "CLAUSE_AFTER_GERUND_SAME_SUBJECT",
    "matchText": "After peaked",
    "replacementText": "After peaking",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "consumption",
      "fell"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I018",
    "source": "issue",
    "sentenceId": "PARA-0018-S05",
    "ruleId": "CHANGE_FALL_BY_AMOUNT",
    "matchText": "fell of 1.1 MWh",
    "replacementText": "fell by 1.1 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "peaked",
      "consumption"
    ],
    "rightContext": [
      "at",
      "3"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I019",
    "source": "issue",
    "sentenceId": "PARA-0018-S05",
    "ruleId": "CHANGE_FALL_TO_ENDPOINT",
    "matchText": "at 3.4 MWh",
    "replacementText": "to 3.4 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "1",
      "mwh"
    ],
    "rightContext": [
      "on",
      "2025"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I020",
    "source": "issue",
    "sentenceId": "PARA-0018-S05",
    "ruleId": "PREP_YEAR_IN",
    "matchText": "on 2025",
    "replacementText": "in 2025",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "4",
      "mwh"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I021",
    "source": "issue",
    "sentenceId": "PARA-0018-S06",
    "ruleId": "PREP_BY_DEADLINE_NOT_UNTIL",
    "matchText": "Until 2035",
    "replacementText": "By 2035",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "figure"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I022",
    "source": "issue",
    "sentenceId": "PARA-0018-S06",
    "ruleId": "CHANGE_FALL_TO_ENDPOINT",
    "matchText": "fallen further at 3.0 MWh",
    "replacementText": "fallen further to 3.0 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "to",
      "have"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I023",
    "source": "issue",
    "sentenceId": "PARA-0018-S07",
    "ruleId": "TENSE_PAST_PERFECT_REQUIRES_PAST_REFERENCE",
    "matchText": "had risen steadily",
    "replacementText": "rose steadily",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "eastport"
    ],
    "rightContext": [
      "from",
      "3"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I024",
    "source": "issue",
    "sentenceId": "PARA-0018-S07",
    "ruleId": "PREP_BETWEEN_AND_TIME_RANGE",
    "matchText": "between 2005 to 2025",
    "replacementText": "between 2005 and 2025",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "4",
      "mwh"
    ],
    "rightContext": [
      "before",
      "reaching"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I025",
    "source": "issue",
    "sentenceId": "PARA-0018-S07",
    "ruleId": "VERB_REACH_DIRECT_OBJECT_NO_TO",
    "matchText": "reaching to 4.8 MWh",
    "replacementText": "reaching 4.8 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "2025",
      "before"
    ],
    "rightContext": [
      "in",
      "2035"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I026",
    "source": "issue",
    "sentenceId": "PARA-0018-S08",
    "ruleId": "NOUN_RISE_OF_AMOUNT",
    "matchText": "a rise by 1.6 MWh",
    "replacementText": "a rise of 1.6 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "this",
      "represented"
    ],
    "rightContext": [
      "or",
      "50"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I027",
    "source": "issue",
    "sentenceId": "PARA-0018-S08",
    "ruleId": "UNIT_PER_CENT_INVARIABLE",
    "matchText": "50 per cents",
    "replacementText": "50 per cent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "mwh",
      "or"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I028",
    "source": "issue",
    "sentenceId": "PARA-0018-S09",
    "ruleId": "VERB_SURPASS_DIRECT_OBJECT_NO_THAN",
    "matchText": "surpassed than Northland",
    "replacementText": "surpassed Northland",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "eastport",
      "had"
    ],
    "rightContext": [
      "with",
      "0"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I029",
    "source": "issue",
    "sentenceId": "PARA-0018-S09",
    "ruleId": "PREP_MARGIN_BY_DIFFERENCE",
    "matchText": "with 0.6 MWh",
    "replacementText": "by 0.6 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "than",
      "northland"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I030",
    "source": "issue",
    "sentenceId": "PARA-0018-S10",
    "ruleId": "COMP_MULTIPLIER_AS_MUCH_AS",
    "matchText": "times as much electricity than",
    "replacementText": "times as much electricity as",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "three-fifths"
    ],
    "rightContext": [
      "northland"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I031",
    "source": "issue",
    "sentenceId": "PARA-0018-S11",
    "ruleId": "VERB_FLUCTUATE_BETWEEN_AND",
    "matchText": "fluctuated from 2.7 and 3.1",
    "replacementText": "fluctuated between 2.7 and 3.1",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "southvale"
    ],
    "rightContext": [
      "mwh",
      "between"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I032",
    "source": "issue",
    "sentenceId": "PARA-0018-S11",
    "ruleId": "PREP_FROM_TO_TIME_RANGE",
    "matchText": "between 2010 to 2025",
    "replacementText": "from 2010 to 2025",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "1",
      "mwh"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I033",
    "source": "issue",
    "sentenceId": "PARA-0018-S12",
    "ruleId": "PHRASAL_BOTTOM_OUT_AT",
    "matchText": "bottomed at",
    "replacementText": "bottomed out at",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "it"
    ],
    "rightContext": [
      "2",
      "7"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I034",
    "source": "issue",
    "sentenceId": "PARA-0018-S12",
    "ruleId": "VERB_RECOVER_TO_LEVEL",
    "matchText": "recovered by 3.1 MWh",
    "replacementText": "recovered to 3.1 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "in",
      "2015"
    ],
    "rightContext": [
      "in",
      "2020"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I035",
    "source": "issue",
    "sentenceId": "PARA-0018-S12",
    "ruleId": "PHRASAL_LEVEL_OFF_AT",
    "matchText": "levelled at 3.0 MWh",
    "replacementText": "levelled off at 3.0 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "2020",
      "and"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I036",
    "source": "issue",
    "sentenceId": "PARA-0018-S13",
    "ruleId": "PREP_THROUGHOUT_NO_OF",
    "matchText": "Throughout of the period",
    "replacementText": "Over the period",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "its",
      "values"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I037",
    "source": "issue",
    "sentenceId": "PARA-0018-S13",
    "ruleId": "VERB_RANGE_FROM_TO",
    "matchText": "ranged between 2.7 to 3.3",
    "replacementText": "ranged from 2.7 to 3.3",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "its",
      "values"
    ],
    "rightContext": [
      "mwh"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I038",
    "source": "issue",
    "sentenceId": "PARA-0018-S14",
    "ruleId": "VERB_START_AT_VALUE",
    "matchText": "started from 2.1 MWh",
    "replacementText": "started at 2.1 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "westmere"
    ],
    "rightContext": [
      "and",
      "increased"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I039",
    "source": "issue",
    "sentenceId": "PARA-0018-S14",
    "ruleId": "VERB_INCREASE_BY_AMOUNT",
    "matchText": "increased 1.1 MWh",
    "replacementText": "increased by 1.1 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "mwh",
      "and"
    ],
    "rightContext": [
      "until",
      "3"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I040",
    "source": "issue",
    "sentenceId": "PARA-0018-S14",
    "ruleId": "VERB_INCREASE_TO_ENDPOINT",
    "matchText": "until 3.2 MWh",
    "replacementText": "to 3.2 MWh",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "1",
      "mwh"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I041",
    "source": "issue",
    "sentenceId": "PARA-0018-S15",
    "ruleId": "NUMERAL_ONE_AND_A_HALF",
    "matchText": "one-and-half",
    "replacementText": "one and a half",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "be",
      "about"
    ],
    "rightContext": [
      "times",
      "than"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I042",
    "source": "issue",
    "sentenceId": "PARA-0018-S15",
    "ruleId": "COMP_MULTIPLIER_TIMES_NO_THAN",
    "matchText": "times than the 2005 level",
    "replacementText": "times the 2005 level",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "about",
      "one-and-half"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I043",
    "source": "issue",
    "sentenceId": "PARA-0018-S16",
    "ruleId": "COMP_BELOW_DIRECT_NO_THAN",
    "matchText": "under than Southvale",
    "replacementText": "below Southvale",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "westmere",
      "remained"
    ],
    "rightContext": [
      "until",
      "2025"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I044",
    "source": "issue",
    "sentenceId": "PARA-0018-S16",
    "ruleId": "PHRASAL_CATCH_UP_WITH",
    "matchText": "catch it up",
    "replacementText": "catch up with it",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "projected",
      "to"
    ],
    "rightContext": [
      "by",
      "2035"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I045",
    "source": "issue",
    "sentenceId": "PARA-0018-S18",
    "ruleId": "PHRASAL_MAKE_UP_PERCENT_OF_TOTAL",
    "matchText": "made 45 per cent from generation",
    "replacementText": "made up 45 per cent of generation",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "2005",
      "coal"
    ],
    "rightContext": [
      "gas",
      "37"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I046",
    "source": "issue",
    "sentenceId": "PARA-0018-S19",
    "ruleId": "CHANGE_FALL_TO_ENDPOINT",
    "matchText": "by",
    "replacementText": "to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "forecast",
      "to",
      "fall"
    ],
    "rightContext": [
      "20",
      "per",
      "cent"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I047",
    "source": "issue",
    "sentenceId": "PARA-0018-S19",
    "ruleId": "NOUN_DECREASE_OF_AMOUNT",
    "matchText": "by",
    "replacementText": "of",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "cent",
      "a",
      "decrease"
    ],
    "rightContext": [
      "25",
      "per",
      "cent"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I048",
    "source": "issue",
    "sentenceId": "PARA-0018-S19",
    "ruleId": "UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS",
    "matchText": "per cent",
    "replacementText": "percentage",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "by",
      "25"
    ],
    "rightContext": [
      "points"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I049",
    "source": "issue",
    "sentenceId": "PARA-0018-S20",
    "ruleId": "ADJ_EQUIVALENT_TO",
    "matchText": "equals with",
    "replacementText": "is equivalent to",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "this"
    ],
    "rightContext": [
      "a",
      "reduction"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I050",
    "source": "issue",
    "sentenceId": "PARA-0018-S20",
    "ruleId": "NOUN_REDUCTION_OF_AMOUNT",
    "matchText": "a reduction by 56 per cent",
    "replacementText": "a reduction of 56 per cent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "equals",
      "with"
    ],
    "rightContext": [
      "comparing",
      "with"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I051",
    "source": "issue",
    "sentenceId": "PARA-0018-S20",
    "ruleId": "PREP_RELATIVE_TO_BASELINE",
    "matchText": "comparing with its original share",
    "replacementText": "relative to its share",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "per",
      "cent"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I052",
    "source": "issue",
    "sentenceId": "PARA-0018-S21",
    "ruleId": "CHANGE_RISE_FROM_TO",
    "matchText": "rise 18 to 47 per cent",
    "replacementText": "rise from 18 to 47 per cent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "expected",
      "to"
    ],
    "rightContext": [
      "gaining",
      "29"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I053",
    "source": "issue",
    "sentenceId": "PARA-0018-S21",
    "ruleId": "UNIT_PERCENTAGE_POINTS_NOT_PER_CENT_POINTS",
    "matchText": "29 per cent points",
    "replacementText": "29 percentage points",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "cent",
      "gaining"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I054",
    "source": "issue",
    "sentenceId": "PARA-0018-S22",
    "ruleId": "COMP_MULTIPLIER_TIMES_NOT_FOLDS",
    "matchText": "two and a half folds",
    "replacementText": "two and a half times",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "more",
      "than"
    ],
    "rightContext": [
      "its",
      "2005"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I055",
    "source": "issue",
    "sentenceId": "PARA-0018-S23",
    "ruleId": "PHRASAL_MAKE_UP_PERCENT_OF_TOTAL",
    "matchText": "will be made up 47 per cent",
    "replacementText": "will make up 47 per cent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "solar",
      "together"
    ],
    "rightContext": [
      "of",
      "total"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I056",
    "source": "issue",
    "sentenceId": "PARA-0018-S24",
    "ruleId": "LINKER_BY_CONTRAST",
    "matchText": "in contrary",
    "replacementText": "by contrast",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "gas"
    ],
    "rightContext": [
      "is",
      "projected"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I057",
    "source": "issue",
    "sentenceId": "PARA-0018-S24",
    "ruleId": "CHANGE_DECLINE_FROM_TO",
    "matchText": "between 37 and 33 per cent",
    "replacementText": "from 37 to 33 per cent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "decline",
      "slightly"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I058",
    "source": "issue",
    "sentenceId": "PARA-0018-S25",
    "ruleId": "NOUN_GAP_BETWEEN_TWO",
    "matchText": "The gap among gas and renewables",
    "replacementText": "The gap between gas and renewables",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "will",
      "shift"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I059",
    "source": "issue",
    "sentenceId": "PARA-0018-S25",
    "ruleId": "CHANGE_SHIFT_FROM_TO",
    "matchText": "into 14 percentage points",
    "replacementText": "to 14 percentage points",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "favouring",
      "gas"
    ],
    "rightContext": [
      "favouring",
      "renewables"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I060",
    "source": "issue",
    "sentenceId": "PARA-0018-S26",
    "ruleId": "COMP_SUPERLATIVE_OF_DEFINED_SET",
    "matchText": "Between the three sources",
    "replacementText": "Of the three sources",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "renewables",
      "will"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I061",
    "source": "issue",
    "sentenceId": "PARA-0018-S26",
    "ruleId": "COMP_LARGE_SUPERLATIVE_LARGEST",
    "matchText": "the most large",
    "replacementText": "the largest",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "record"
    ],
    "rightContext": [
      "absolute",
      "increase"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I062",
    "source": "issue",
    "sentenceId": "PARA-0018-S27",
    "ruleId": "COMP_SHARP_SUPERLATIVE_SHARPEST",
    "matchText": "the most sharp fall",
    "replacementText": "the sharpest fall",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "experience"
    ],
    "rightContext": [
      "between",
      "the"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I063",
    "source": "issue",
    "sentenceId": "PARA-0018-S27",
    "ruleId": "COMP_SUPERLATIVE_OF_DEFINED_SET",
    "matchText": "between the three",
    "replacementText": "of the three",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "sharp",
      "fall"
    ],
    "rightContext": [
      "while",
      "gas"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I064",
    "source": "issue",
    "sentenceId": "PARA-0018-S27",
    "ruleId": "ARTICLE_ORDINAL_RANK_THE_SECOND_LARGEST",
    "matchText": "a second largest source",
    "replacementText": "the second-largest source",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "remain"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I065",
    "source": "issue",
    "sentenceId": "PARA-0018-S28",
    "ruleId": "UNIT_PER_CENT_INVARIABLE",
    "matchText": "per cents",
    "replacementText": "per cent",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "and",
      "47"
    ],
    "rightContext": [
      "respectably"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I066",
    "source": "issue",
    "sentenceId": "PARA-0018-S28",
    "ruleId": "WORDFORM_RESPECTIVELY_NOT_RESPECTABLY",
    "matchText": "respectably",
    "replacementText": "respectively",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "per",
      "cents"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I067",
    "source": "issue",
    "sentenceId": "PARA-0018-S29",
    "ruleId": "PARTICIPLE_TAKEN_TOGETHER_PASSIVE",
    "matchText": "Taking together",
    "replacementText": "Taken together",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "charts"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I068",
    "source": "issue",
    "sentenceId": "PARA-0018-S30",
    "ruleId": "PARTICIPLE_COMPARED_WITH_BASELINE",
    "matchText": "Comparing with 2005",
    "replacementText": "Compared with 2005",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "projected"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I069",
    "source": "issue",
    "sentenceId": "PARA-0018-S31",
    "ruleId": "VERB_RISE_INTRANSITIVE_NOT_RAISE",
    "matchText": "to raise from 12.1",
    "replacementText": "to rise from 12.1",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "is",
      "projected"
    ],
    "rightContext": [
      "to",
      "14"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I070",
    "source": "issue",
    "sentenceId": "PARA-0018-S32",
    "ruleId": "NOUN_DIFFERENCE_BETWEEN",
    "matchText": "The difference of",
    "replacementText": "The difference between",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "the",
      "fastest-growing"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I071",
    "source": "issue",
    "sentenceId": "PARA-0018-S32",
    "ruleId": "VERB_WIDEN_INTRANSITIVE_TREND",
    "matchText": "is projected to be widened",
    "replacementText": "is projected to widen",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "slowest-growing",
      "regions"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I072",
    "source": "issue",
    "sentenceId": "PARA-0018-S33",
    "ruleId": "ARTICLE_END_OF_PERIOD_THE",
    "matchText": "At",
    "replacementText": "At the",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [],
    "rightContext": [
      "end",
      "of",
      "the"
    ],
    "startsSentence": true,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I073",
    "source": "issue",
    "sentenceId": "PARA-0018-S33",
    "ruleId": "ADVERB_RANK_FIRST_NO_THE",
    "matchText": "the first",
    "replacementText": "first",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "will",
      "rank"
    ],
    "rightContext": [
      "followed",
      "with"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I074",
    "source": "issue",
    "sentenceId": "PARA-0018-S33",
    "ruleId": "PASSIVE_FOLLOWED_BY",
    "matchText": "with",
    "replacementText": "by",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "the",
      "first",
      "followed"
    ],
    "rightContext": [
      "southvale",
      "and",
      "westmere"
    ],
    "startsSentence": false,
    "endsSentence": false
  },
  {
    "patternId": "PARA-0018-I075",
    "source": "issue",
    "sentenceId": "PARA-0018-S33",
    "ruleId": "PREDICATIVE_LAST_NO_AT",
    "matchText": "at last",
    "replacementText": "last",
    "acceptableAlternatives": [],
    "confidence": 0.9,
    "leftContext": [
      "with",
      "northland"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false
  }
].map((pattern) => Object.freeze({
  ...pattern,
  acceptableAlternatives: Object.freeze(pattern.acceptableAlternatives),
  leftContext: Object.freeze(pattern.leftContext),
  rightContext: Object.freeze(pattern.rightContext)
})));

export const CORPUS_APPROVED_CLEAN_SENTENCES = Object.freeze([
  "“How many routes serve the campus?” asked another.",
  "“Why does the evening bus stop so early?” one student asked.",
  "A car park was added next to the supermarket, and a bus stop was installed at the junction of the bypass and Station Road.",
  "A colleague of mine objected and called preservation somebody else's responsibility.",
  "A cycle path will run alongside both banks of the river and pass beneath the road bridge.",
  "A few candidates have submitted excellent work; few, however, have explained how their evidence relates to their conclusions.",
  "A few had previously travelled alone, whereas few knew how to use the regional ticketing app.",
  "A further dimension is that you will easily locate the staff in a shop, and this will increase companies' profits; imagine entering a retail shop where no staff are wearing a uniform: you will need more time to figure out whether someone looking at a shelf is an employee, and it is no good at all.",
  "A health system that only responds after people are already sick is always fighting fires: hospitals become crowded, doctors are overstretched, and taxpayers must pay for long-term treatment that might have been avoided.",
  "A jacket is useful for keeping warm, but if it rains, the group will visit a museum that is located nearby.",
  "A number of applications were incomplete, whereas the number of rejections was small.",
  "A road bridge was constructed across the river, linking the main road with the station.",
  "A row of cottages stood on the north side of the road, opposite a small park.",
  "After peaking, consumption fell by 1.1 MWh to 3.4 MWh in 2025.",
  "Also, the employees can choose not to read or reply to the work messages after work, and their bosses cannot punish them or give them bad reviews for this.",
  "Also, workers should set boundaries for their working hours and avoid excessive workloads to keep themselves healthy.",
  "Although it was raining heavily, the temple was more beautiful than I expected.",
  "Although uniforms are meant to simplify clothing, the suppliers' prices increase every year.",
  "Although uniforms look decent, they can't wick away sweat and they are not warm in winter.",
  "Another asked, “Does every reference have to be signed?”",
  "Another cause is financial pressure.",
  "Another drawback is cost.",
  "Another reason is that preventive spending creates a fairer society.",
  "Another student apologised to the tutor for arriving late and blamed the delay on a cancelled train.",
  "Another volunteer insisted on checking each cable twice and said that he was responsible for recording every repair.",
  "Applications submitted after the deadline will be considered only if evidence of an emergency is provided.",
  "As a clear illustration, if you enter an international airport where the staff are not wearing a proper uniform, you will think that there is a loss of trust and professionalism.",
  "As a result, a person may be physically at home, but mentally still at the office desk.",
  "As a result, they have less chance to relieve their stress during holidays, which may boost their anxiety under stress.",
  "As employers are able to connect with them at all times, they can assign duties and request work on urgent projects.",
  "As such, employees may sacrifice their holidays and take on an extra amount of work.",
  "At closing time, two students were responsible for both sorting spare parts and cleaning the tables.",
  "At the college, they meet in the main library rather than in class.",
  "At the end of the period, Eastport will rank first, followed by Southvale and Westmere, with Northland last.",
  "At the entrance, a coordinator carefully explained the safety rules to new visitors and provided every team with the necessary gloves.",
  "At the final briefing, the chair asked, “How many candidates completed the ethics training?”",
  "At the final meeting, the coordinator asked whether the survey had represented every group fairly.",
  "At the same time, people should set clear boundaries for work.",
  "At the south-eastern corner of the district, part of the farmland will be divided into plots for detached houses.",
  "Because they do not have enough rest for a long time, they work more and more slowly and need more time to finish the work; after that, they lose their personal life.",
  "Before leaving, every child returned a name card to the front desk.",
  "Besides, working on holidays imposes high pressure on employees.",
  "Between my neighbour and me, we carried the volunteers' tools to a cupboard beside a resident whose bicycle had been repaired.",
  "But, as far as I am concerned, this is more beneficial to employers than workers, as workers have no obligation to work on every occasion.",
  "By 2020, Eastport had surpassed Northland by 0.6 MWh.",
  "By 2035, a walkway is planned to connect the station to the public square, and bicycle parking will be provided on both sides of the southern ramp.",
  "By 2035, most residents will live within walking distance of shops, public transport and open space.",
  "By 2035, the figure is forecast to have fallen further to 3.0 MWh.",
  "By 2050, this trend will be reversed.",
  "By next June, the new monitoring team will have taken over from the temporary inspectors.",
  "By the time the doors closed, the final guest had already left; the coordinator still had three forms to check before the next community event in early autumn.",
  "Coal will experience the sharpest fall of the three, while gas will remain the second-largest source.",
  "Coal's share is forecast to fall to 20 per cent, a decrease of 25 percentage points.",
  "Compared with 2005, the projected 2035 energy mix contains a much smaller coal share.",
  "Conversely, employers should respect workers' freedom and support workers during workdays.",
  "Customers can have a first impression of the business.",
  "Despite receiving only a small grant, our neighbourhood repair café has become one of the most useful projects in the district.",
  "Despite these changes, the railway station remained outside the district boundary, south of the new bridge.",
  "Dr Chen works at Northbridge University, while her brother works at the University of Westhaven.",
  "Due to the fact that workers have to stay alert for phone calls from employers, they may devote less time to relaxation and be prepared for requests.",
  "During May, the museum received 312 submissions from schools, shops and residents.",
  "During the first week, students attend university by day and return home by bus in the evening.",
  "During the tour, the guide stopped to explain the ticket machine and reminded students to lock their rooms.",
  "Each name must retain its official article pattern.",
  "Each of the students received a card, and all of them were asked to keep it.",
  "Each visitor later chose between taking the item home and leaving it for collection.",
  "Eastford College launched an orientation and transport trial for international students last autumn.",
  "Eastport rose steadily from 3.2 to 4.4 MWh between 2005 and 2025 before reaching 4.8 MWh in 2035.",
  "Either the interns or the archivist is expected to answer questions.",
  "Every file needed checking, but staff had better confirm whether its label matched the box.",
  "Faced with high house prices, rising bus fares and food prices, people give up their free time and face heavy work stress just to keep their jobs.",
  "Finally, the footbridge will remain unchanged, but the nearby riverbank will be widened to create a viewing area.",
  "First, customers can identify employees quickly, especially when they need help.",
  "Following last winter’s floods, the council set up a panel to look into why the drainage programme had fallen behind schedule.",
  "For example, after a student finishes a PE lesson, their T-shirt always gets wet, and their jacket is too thin to keep them warm.",
  "For example, after work, people can turn off work notifications and leave more time for doing exercise and having family dinners.",
  "For example, clerks and sales assistants can only work 6 days per week and 8 hours per day.",
  "For example, if children are taught healthy eating habits and are given places to exercise, they are less likely to develop obesity-related illnesses later in life.",
  "For low-income families, this becomes a heavy hidden financial burden.",
  "For the past three months, the selection team has been reviewing portfolios containing field notes, interviews and statistical analyses.",
  "For these reasons, uniforms can resolve students' problems with choosing outfits and make campus life equal.",
  "Gas, by contrast, is projected to decline slightly, from 37 to 33 per cent.",
  "Good health policy should not begin at the hospital door.",
  "Guests borrowed devices; the curator told them to turn them off and parents to look after their children.",
  "Had the council acted sooner, it might have prevented damage that is believed to have cost local businesses millions.",
  "Having reviewed the evidence, the panel concluded that what the city needs is not another short-term campaign but a permanent maintenance strategy.",
  "However complicated the repairs may become, officials must deal with them transparently.",
  "However, both countries are projected to age; the proportion of children will decline, while the older age group in Italy will become larger.",
  "However, if the government and employers provide better working conditions and individuals draw a clearer line between their jobs and the rest of their lives, this problem can be solved.",
  "However, school uniforms also have disadvantages.",
  "However, some employees feel uncomfortable because the same design does not suit everyone.",
  "However, some may judge that being connected with employers enhances workers' working efficiency.",
  "However, there will be more communication between passengers and staff if the staff wear uniforms.",
  "I completely agree that preventing illness is more important than treating it after it has already developed, and public funding should therefore give prevention the strongest priority.",
  "I contacted support and discussed the problem; they quickly apologised, sent the missing items, and refunded the fee within an hour.",
  "I enjoyed working there because the staff were patient and the programme made me more confident when speaking to strangers.",
  "I hope this can help workers have more personal time and more rest time.",
  "I strongly believe that this problem has had detrimental effects on workers, in terms of workloads, stress and social relationships.",
  "If I had studied medicine, I would be a doctor now.",
  "If only the finance team had released the money earlier, workshops would not have been delayed.",
  "If public money is used to improve air quality, provide free health screenings, support school meals, and promote active lifestyles, the benefits are shared widely rather than reserved for those who can afford private care.",
  "If schools allow the students to wear casual clothes, schools will become fashion shows every day; some affluent students dress to flex, while normal students have only 2-3 outfits to change into.",
  "If some students can't afford such clothes, this may even cause bullying in school.",
  "If students spend less time choosing outfits, they can reserve more time for homework, have more time to sleep in the morning, and maintain energy in the lesson.",
  "If the government sets a maximum limit on working hours and employees set personal boundaries, these measures can protect employees' work-life balance.",
  "If the students are at a developmental stage, they need to change their uniforms every year.",
  "If we had brought an umbrella, we would not have got wet.",
  "If we had brought an umbrella, we would not have gotten wet.",
  "In 1995, a two-lane road ran from west to east along the northern bank of the River Elin.",
  "In 2005, coal made up 45 per cent of generation, gas 37 per cent and renewables 18 per cent.",
  "In 2005, the figure for Northland stood at 4.0 MWh, compared with 3.2 MWh for Eastport.",
  "In 2035, Eastport is expected to use one and three-fifths times as much electricity as Northland.",
  "In addition to family gatherings, employees who have to stay behind at work may devote less time to social activities.",
  "In addition, the footbridge was relocated about 200 metres west of its original position.",
  "In conclusion, governments should clearly prioritise the prevention of disease because it reduces avoidable suffering, lowers pressure on healthcare systems, and protects society more equally.",
  "In conclusion, school uniforms can make dressing easier for the students and reduce comparison, but they can cause financial pressure.",
  "In conclusion, work stress and financial pressure are closely connected to our standard of living and quality of life.",
  "In Italy, the 15–59 age group is expected to remain the largest segment in both 2000 and 2050.",
  "In many schools, uniforms are required in order to instil discipline in students.",
  "In my opinion, companies should provide suitable uniforms and allow employees to choose between several styles, so the policy can remain professional without causing unnecessary discomfort at work.",
  "In recent years, many companies require their staff to wear uniforms at work.",
  "In recent years, more and more companies require staff to wear uniforms at work.",
  "In the 2035 proposal, the medical centre is due to be extended to the north, and a pharmacy will be added beside it.",
  "In the afternoon, some listen to the radio, while others watch television in the common room.",
  "In the staff's opinion, a uniform can reduce expenses for a work wardrobe and wear and tear on personal clothes.",
  "In this sense, prevention is not just a medical strategy; it is a social investment that helps citizens remain healthy, productive, and independent.",
  "In today's society, work has become a part of our lives, so our private time has been connected with our work.",
  "In Yemen, people aged 0–14 accounted for 50.1% of the population, slightly higher than the 46.3% recorded for those aged 15–59.",
  "It also asked each participant to check that their address was correct.",
  "It bottomed out at 2.7 MWh in 2015, recovered to 3.1 MWh in 2020 and levelled off at 3.0 MWh.",
  "It has operated for six months and used to offer help only with lamps, but it now accepts bicycles, radios and small kitchen machines.",
  "It is essential that the revised system be tested before the rainy season begins, lest another breakdown leave families without assistance.",
  "It is high time the council provided funding, and residents wish it had approved the second phase last year.",
  "It is predicted to fall from 61.6% to 46.2%.",
  "It was not until auditors finished that the council released payment.",
  "Last Monday, the coordinator told applicants that the timetable had changed.",
  "Last month, I joined a community reading programme at the library.",
  "Last Saturday, the volunteers managed to fix twenty items and prevented several batteries from ending up in the rubbish.",
  "Last summer, my family travelled to Japan to visit several cities.",
  "Many a traveller has made this mistake.",
  "Many residents look forward to learning simple skills instead of throwing damaged objects away.",
  "Maya, the programme officer, will review reports written in languages other than English.",
  "More than one volunteer was uncertain, and Lena is one of those assistants who work late answering questions.",
  "Moreover, employees who need to work 24/7 may spend less time with their friends or partners.",
  "Most students have found the maps useful, but most of the students interviewed asked for clearer fare information.",
  "Most visitors prefer repairing old things to buying new ones, and several said they would rather donate unused tools than throw them away.",
  "Much as the mayor wanted to defend the original scheme, she admitted that the authority had failed to live up to its promises.",
  "My main duty was to help children to choose books that were suitable for their age.",
  "My mother asked me where we could buy cheaper fruit, but I was not sure.",
  "No road bridge crossed the river, and there was no direct connection between the station and the town centre.",
  "No sooner had the investigators drawn up a timetable than one supplier pulled out of the project.",
  "Nobody answered immediately, but no candidate had forgotten the requirement.",
  "Northbridge University began a community research fellowship in September 2023.",
  "Northland then rose from 4.0 to a peak of 4.5 MWh in 2010, an increase of 0.5 MWh.",
  "Not only did several contractors fail to comply with the safety code, but they also tried to cover up delays that should have been reported earlier.",
  "Not until the exhibition opened did residents realise how much history remained unrecorded.",
  "Nowadays, many employees complain about the phenomenon of overwork during holidays as their employers give them work outside working hours.",
  "Nowadays, messaging apps are common, causing staff to have a lot of email messages to reply to; since it is so convenient to manage documents and meetings, the end of the working day no longer feels like a real end.",
  "Of the three sources, renewables will record the largest absolute increase.",
  "Of the two interview rooms, one is beside the library and the other is inside the student centre.",
  "On the first day, we collected much information from a tourist centre and asked the staff where we should go.",
  "One applicant asked, “Why did the portal reject my form?”",
  "One boy said he was interested in space, so I showed him a book about planets.",
  "One instructor advised avoiding touching loose wires and suggested considering replacing any cracked plug.",
  "One major advantage is that wearing a uniform can reduce anxiety about clothing and help students concentrate on studies.",
  "One major reason is that many employees face a heavy workload.",
  "One phenomenon appearing repeatedly is that students who live farther away spend less time on campus.",
  "One student remembered leaving her card on a bus and tried calling the lost-property office.",
  "One student said that he did not have any cash; another replied, “Neither do I.”",
  "One student said that she had been to London the previous year but had never been to Eastford before.",
  "One visiting scholar came from the Netherlands, and another came from the United Kingdom.",
  "Only after the financial records had been examined did the panel rule out fraud.",
  "Our hiking club is planning a short trip.",
  "Over the following thirty years, the cottages were replaced by three apartment blocks, and the grocery shop was converted into a medical centre.",
  "Over the period, its values ranged from 2.7 to 3.3 MWh.",
  "Over time, their bodies become tired as they work to make money.",
  "Overall, Northland led initially but Eastport overtook it, whereas Westmere remained the lowest of the four for most of the period.",
  "Overall, the area has evolved from a lightly developed riverside settlement into a denser mixed-use neighbourhood, and the next phase is intended to improve pedestrian access while retaining the central park.",
  "Overall, the journey gave us many memories and broadened our knowledge.",
  "Overall, they bring clear learning environment benefits, while also creating practical and personal drawbacks.",
  "Overall, Yemen's population was younger than Italy's in 2000, and this contrast is expected to become more pronounced by 2050.",
  "Parents were happy because the organisers let children test safe tools, although they made everyone wear eye protection.",
  "Participants conduct research in the library, but they go to university to study.",
  "Prevention, therefore, does not merely reduce costs; it protects people from pain that no medicine can fully erase.",
  "Professor Malik, the programme director, said that the fellowship had received a large number of applications but only a little funding.",
  "Rarely had the museum received donations, and volunteers worked hard to catalogue them.",
  "Renewables are expected to rise from 18 to 47 per cent, gaining 29 percentage points.",
  "Replacing the card meant completing another form, but she did not mean to delay the group.",
  "Requiring pupils to wear a uniform has several clear benefits, especially because wearing a uniform can help students focus more on studies, but schools allowing casual wear will increase the time and cost and even cause psychological problems.",
  "Residents would rather the council published all future reports than withheld inconvenient findings.",
  "Schools have stringent uniform requirements.",
  "Second, a uniform can reduce how much money staff spend on work clothes.",
  "Several questions nevertheless remain.",
  "Several records need to be digitised, while two films are worth restoring.",
  "She also promised to contact each applicant once the technicians had restored the system.",
  "She also reminded them to write their names on a form before entering the workshop.",
  "She asked, “Where should we go?”",
  "She asked, “Where should we meet?” because the station has two exits.",
  "She explained that her brother had gone to Manchester and would not return until Friday.",
  "She noted that the data were limited and that some of the evidence was inconclusive.",
  "She said that the online portal had failed the previous evening and asked whether everyone had saved a copy.",
  "She warned candidates not to upload confidential material and denied sharing any files with outside organisations.",
  "She was aware of the pressure on staff and concerned about its effect on applicants.",
  "Should any donor object, the museum will remove the files.",
  "Since the trial began, the college has collected feedback from more than two hundred students.",
  "Since then, the scheme has attracted students from the United Kingdom, the Netherlands and several partner colleges.",
  "So complicated were the forms that donors signed wrongly, and such was the confusion that staff arranged another briefing.",
  "Some schools allow children to dress more freely.",
  "South of the river, farmland extended towards the railway, and the area was accessible only via a narrow footbridge.",
  "Southvale fluctuated between 2.7 and 3.1 MWh from 2010 to 2025.",
  "Staff know that the software contains sensitive data, so they are checking each permission setting this week before approving public access.",
  "Staff needn't have stayed late, although they stayed until midnight.",
  "Students who attend university for the first time often need guidance, whereas visitors who come to the university for public lectures need different information.",
  "Students who need medical advice go to hospital through the campus clinic, whereas those visiting a friend go to the hospital as visitors.",
  "Taken together, the charts indicate convergence in consumption and a shift towards renewable generation.",
  "Teenagers value their friendships and care about what their friends think, so personal outfits become a main topic in schools.",
  "Ten kilometres is too far; three hundred pounds was enough for transport.",
  "The 15–59 age group will exceed the 0–14 age group and rise to 57.3%.",
  "The 2035 figure is projected to be about one and a half times the 2005 level.",
  "The app showed much information and allowed customers to compare prices between shops.",
  "The bar chart presents the proportions of electricity generated from coal, gas and renewables.",
  "The central apartment block will be demolished, with the site becoming a public square surrounded by cafés.",
  "The chair asked engineers to follow up on every complaint and come up with a plan that would account for the failures.",
  "The chair explained that a solution to the delay depended on cooperation among departments.",
  "The college is also reviewing reports submitted by students living outside the city.",
  "The combined regional total is projected to rise from 12.1 to 14.3 MWh.",
  "The committee recommended that each contractor provide monthly evidence and that emergency drills be carried out twice a year.",
  "The committee rejected the original timetable because the timetable was unrealistic, although the committee itself had drafted it.",
  "The committee therefore requested more information from students whose journeys involved more than one form of transport.",
  "The coordinator replied that references submitted without signatures would be returned.",
  "The curator and I disagreed, although the chair asked me to prepare a proposal.",
  "The database contains twenty criteria, although each application is judged against only one criterion at a time.",
  "The decision will follow after lawyers have given some advice.",
  "The department owns two recorders, and the equipment belongs to the university.",
  "The difference between the fastest-growing and slowest-growing regions is projected to widen.",
  "The driver could deliver the bags before dinner.",
  "The elderly population will remain comparatively small, though it is expected to increase from 3.6% to 5.7%.",
  "The equipment is stored there.",
  "The existing car park will be moved underground, allowing the land above it to be used as a playground.",
  "The extension depends on whether the museum can prove its value.",
  "The figures for coal, gas and renewables will be 20, 33 and 47 per cent, respectively.",
  "The first reason is that prevention saves both money and human suffering.",
  "The gap between gas and renewables will shift from 19 percentage points favouring gas to 14 percentage points favouring renewables.",
  "The journey may broaden our knowledge.",
  "The leader said we must bring water, and she asked each member to arrive at the station by eight.",
  "The line graph illustrates annual household electricity use in four regions, measured in MWh, between 2005 and 2035, while the bar chart compares its sources.",
  "The list of places is on the noticeboard, but neither route includes a climb.",
  "The more consistently agencies work together, the less likely similar failures are to recur.",
  "The most effective solution is for the government to limit the maximum working hours for certain jobs.",
  "The most obvious one is that uniforms are neither comfortable nor practical.",
  "The most significant problem is that workers may suffer from higher workloads.",
  "The museum had a technician repair the scanner and got a volunteer to install software.",
  "The museum has conducted research and made progress, but the committee must take into consideration costs and pay attention to security.",
  "The museum launched a digital archive for photographs, diaries and oral histories.",
  "The negotiations were near to completion.",
  "The news was welcomed; two-thirds of the equipment was bought, while half of the volunteers were recruited.",
  "The number of volunteers was encouraging, while the other participants promised to return.",
  "The old scanner and the new laptop were tested together, but the laptop was faster.",
  "The only coordinator who knows encryption, together with two interns, has prepared a manual.",
  "The organiser gave each volunteer a guide and asked us to arrive on Saturday mornings.",
  "The park was enlarged eastwards, although its original entrance remained in the same position.",
  "The payment was made through the app.",
  "The pictures were clear, and he read for twenty minutes.",
  "The pie chart illustrates the age distributions of the populations of Yemen and Italy in 2000 and the projected distributions for 2050.",
  "The post office lay between the park and a grocery shop, while a warehouse occupied the site at the eastern end of the district.",
  "The printed instructions were clear enough for beginners to follow, and the final demonstration was so practical that nobody became confused.",
  "The proportion of elderly residents is projected to almost double from 24.1% to 42.3%.",
  "The reason why officials remain cautious is that no long-term budget exists.",
  "The red folders were stronger than the blue ones, although the latter were cheaper.",
  "The red route is faster than the blue one, while the latter is cheaper.",
  "The reports contain several analyses of travel patterns, two series of photographs and three appendices.",
  "The scanner is twice as efficient as its predecessor, and its output is superior to that of the earlier model.",
  "The scheme also requires more careful use of articles and institutional names.",
  "The section of road beside the park was pedestrianised, with traffic diverted onto a new bypass running around the northern edge of the district.",
  "The staff have agreed to show us around.",
  "The storage system is the same as the national archive's, but its fee is much too expensive.",
  "The supermarket faced the medical centre, whereas the bus stop was situated diagonally opposite the park entrance.",
  "The three maps show how the Riverside district changed between 1995 and 2025 and how it is proposed to be developed by 2035.",
  "The tutor added, “The app is working now, isn't it?”",
  "The tutor congratulated her on finding an alternative route and reminded everyone that the next workshop would begin at nine.",
  "The tutor replied that nobody had complained previously, but neither had the transport office published a full timetable.",
  "The warehouse was demolished, and a supermarket was built on its former site.",
  "The way in which volunteers describe images must be consistent, because the fact that some diaries contain private details requires care.",
  "The weather was rainy.",
  "The youngest age group is projected to remain relatively stable over the period, shrinking only slightly from 14.3% to 11.5%.",
  "Their share will therefore be more than two and a half times its 2005 level.",
  "There are fewer buses in the morning, so everyone must arrive on time.",
  "There are some advantages of a company having a uniform policy; for example, customers can quickly locate staff in retail stores, and uniforms enhance trust and professionalism.",
  "There is little time before interviews begin, but a little extra time has been reserved for applicants requiring adjustments.",
  "There was little time during the first session, although tutors allowed a little extra time for questions.",
  "Therefore, children will face mental health problems.",
  "Therefore, uniforms may solve social problems at schools, but they can also create economic difficulties for parents and students.",
  "These homes will face the river and will be connected to the station by a road branching off Station Road.",
  "They have breakfast in their residences before taking the number 12 bus.",
  "They suggested that we visit an ancient temple that was built over five hundred years ago.",
  "They suggested to us that we visit the temple.",
  "They suggested visiting the temple.",
  "This bag is for carrying books.",
  "This generally destroys their social bonding with peers and has negative effects on their social relationships.",
  "This is equivalent to a reduction of 56 per cent relative to its share.",
  "This is especially important for poorer families, who may lack access to nutritious food, safe housing, mental-health support, or regular medical checks.",
  "This means fewer patients needing complex surgery, lifelong medication, or repeated hospital visits.",
  "This policy has several advantages for both workers and customers.",
  "This problem is usually caused by excessive workloads, which lead to work stress and weakened boundaries between professional and private life.",
  "This represented a rise of 1.6 MWh, or 50 per cent.",
  "To begin with, the advantage is that customers can easily locate staff who are wearing uniforms.",
  "To sum up, employers should avoid contacting their workers during holidays, which can protect them from excessive work and loads of stress and can help them maintain close relationships with their friends.",
  "Treating illness matters, but preventing it is the wiser use of public money.",
  "Treatment often reaches people only after damage has been done, whereas prevention can protect whole communities before illness takes root.",
  "Two ramps will provide access to the path from either side of the bridge.",
  "Under no circumstances should visitors remove originals, nor may they photograph private documents.",
  "Uniforms can create a fair school environment.",
  "Uniforms may also make workers feel that they have less personal freedom.",
  "Unless the server fails, staff will keep an offline copy in case the database becomes unavailable.",
  "Until all recommendations have been implemented, no department can take it for granted that public confidence will simply return without sustained effort or scrutiny.",
  "We decided to order from a supermarket that was located near our home.",
  "We met the workers who built the temple.",
  "We received three pieces of information.",
  "We stayed in a hotel which was located near the railway station, so travelling was very convenient.",
  "We travelled for convenience.",
  "Were it not for donations, the archive would close next winter.",
  "Westmere remained below Southvale until 2025 but is projected to catch up with it by 2035.",
  "Westmere started at 2.1 MWh and increased by 1.1 MWh to 3.2 MWh.",
  "What concerned residents most was that officials had put off replacing pumps on which several low-lying districts depended.",
  "What the project now needs is a permanent funding arrangement.",
  "Whatever the final decision is, the fellowship will continue providing opportunities for students whose work might otherwise remain unseen.",
  "Whatever the outcome, the archive has encouraged residents to value records that might otherwise disappear.",
  "Whatever the results show, the college will continue throughout the year to provide guidance, and students will know whom to contact when a problem arises.",
  "When governments invest in health education, vaccination programmes, early screening, safe parks, and better nutrition in schools, many serious conditions can be stopped before they become expensive medical crises.",
  "When the order arrived, two bottles of milk were missing.",
  "Whoever wants to withdraw a photograph may do so, and the archive will return all that families reject.",
  "Wind and solar together will make up 47 per cent of total generation.",
  "Without such boundaries, personal life becomes the first thing to be sacrificed.",
  "Workers who have difficulties can ask for advice from their employers and receive immediate responses.",
  "Yesterday, my parents used a shopping app because our fridge was almost empty."
]);

export const CORPUS_APPROVED_INCORRECT_SENTENCES = Object.freeze([
  {
    "sentenceId": "PARA-0001-S01",
    "sourceSentence": "In recent years, many company requires their staffs to wears uniforms at work."
  },
  {
    "sentenceId": "PARA-0001-S02",
    "sourceSentence": "This policy have several advantage for both workers and customer."
  },
  {
    "sentenceId": "PARA-0001-S03",
    "sourceSentence": "First, customers can identifies employees quickly, especially when they needs help."
  },
  {
    "sentenceId": "PARA-0001-S04",
    "sourceSentence": "Second, a uniform can reduces how much money staff spend for work clothes."
  },
  {
    "sentenceId": "PARA-0001-S05",
    "sourceSentence": "However, some employee feels uncomfortable because the same design do not suit everyone."
  },
  {
    "sentenceId": "PARA-0001-S06",
    "sourceSentence": "Uniforms may also makes workers feel that they has less personal freedom."
  },
  {
    "sentenceId": "PARA-0001-S07",
    "sourceSentence": "In my opinion, companies should provides suitable uniforms and allows employees to choose between several styles, so the policy can remain professional without caused unnecessary discomfort at work."
  },
  {
    "sentenceId": "PARA-0002-S01",
    "sourceSentence": "Last summer, my family travelled to Japan for visit several cities."
  },
  {
    "sentenceId": "PARA-0002-S02",
    "sourceSentence": "We stayed in a hotel which was located near from the railway station, so travelling was very convenience."
  },
  {
    "sentenceId": "PARA-0002-S03",
    "sourceSentence": "On the first day, we collected many informations from a tourist centre and asked the staff where should we go."
  },
  {
    "sentenceId": "PARA-0002-S04",
    "sourceSentence": "They suggested us to visit an ancient temple that built over five hundred years ago."
  },
  {
    "sentenceId": "PARA-0002-S05",
    "sourceSentence": "Although the weather was heavily raining, the temple was more beautiful than I expected."
  },
  {
    "sentenceId": "PARA-0002-S06",
    "sourceSentence": "If we had brought an umbrella, we would not got wet."
  },
  {
    "sentenceId": "PARA-0002-S07",
    "sourceSentence": "Overall, the journey gave us many memory and broaden our knowledge."
  },
  {
    "sentenceId": "PARA-0003-S01",
    "sourceSentence": "Last month, I joined an community reading programme at the library."
  },
  {
    "sentenceId": "PARA-0003-S02",
    "sourceSentence": "The organiser gave each volunteers a guide and asked us arriving on Saturday mornings."
  },
  {
    "sentenceId": "PARA-0003-S03",
    "sourceSentence": "My main duty was to helping children to choose books that was suitable for their age."
  },
  {
    "sentenceId": "PARA-0003-S04",
    "sourceSentence": "One boy said he was interested on space, so I showed him a book about planets."
  },
  {
    "sentenceId": "PARA-0003-S05",
    "sourceSentence": "The pictures were clear, and he read for twenty minutes."
  },
  {
    "sentenceId": "PARA-0003-S06",
    "sourceSentence": "Before leaving, every child returned a name card to the front desk."
  },
  {
    "sentenceId": "PARA-0003-S07",
    "sourceSentence": "I enjoyed to work there because the staff were patient and the programme made me more confidence when speaking to strangers."
  },
  {
    "sentenceId": "PARA-0004-S01",
    "sourceSentence": "Yesterday, my parents used a shopping app because our fridge were almost empty."
  },
  {
    "sentenceId": "PARA-0004-S02",
    "sourceSentence": "The app showed many information and allowed customers compare prices between shops."
  },
  {
    "sentenceId": "PARA-0004-S03",
    "sourceSentence": "My mother asked me where could we buy cheaper fruit, but I was not sure."
  },
  {
    "sentenceId": "PARA-0004-S04",
    "sourceSentence": "We decided ordering from a supermarket that located near our home."
  },
  {
    "sentenceId": "PARA-0004-S05",
    "sourceSentence": "The driver could to deliver the bags before dinner."
  },
  {
    "sentenceId": "PARA-0004-S06",
    "sourceSentence": "The payment was made through the app."
  },
  {
    "sentenceId": "PARA-0004-S07",
    "sourceSentence": "When the order arrived, two bottle of milk was missing."
  },
  {
    "sentenceId": "PARA-0004-S08",
    "sourceSentence": "I contacted with support and discussed about the problem; they quickly apologised, sent the missing items, and refund the fee within an hour."
  },
  {
    "sentenceId": "PARA-0005-S01",
    "sourceSentence": "Our hiking club is planning a short trip."
  },
  {
    "sentenceId": "PARA-0005-S02",
    "sourceSentence": "The list of places are on the noticeboard, but neither route include a climb."
  },
  {
    "sentenceId": "PARA-0005-S03",
    "sourceSentence": "The leader said we must to bring water, and she asked each members arrive at the station by eight."
  },
  {
    "sentenceId": "PARA-0005-S04",
    "sourceSentence": "She asked, “Where should we meet?” because the station has two exits."
  },
  {
    "sentenceId": "PARA-0005-S05",
    "sourceSentence": "There are less buses in the morning, so everyone must arrive on time."
  },
  {
    "sentenceId": "PARA-0005-S06",
    "sourceSentence": "A jacket is useful for keeping warm, but if it will rain, the group will visit a museum that located nearby."
  },
  {
    "sentenceId": "PARA-0005-S07",
    "sourceSentence": "The equipment are stored there."
  },
  {
    "sentenceId": "PARA-0005-S08",
    "sourceSentence": "The staff have agreed to show us around."
  },
  {
    "sentenceId": "PARA-0006-S01",
    "sourceSentence": "Despite of receiving only a small grant, our neighbourhood repair café has become one of the most useful project in the district."
  },
  {
    "sentenceId": "PARA-0006-S02",
    "sourceSentence": "It has operated since six months and used to offering help only with lamps, but it now accepts bicycles, radios and small kitchen machines."
  },
  {
    "sentenceId": "PARA-0006-S03",
    "sourceSentence": "Many residents look forward to learn simple skills instead of throwing damaged objects away."
  },
  {
    "sentenceId": "PARA-0006-S04",
    "sourceSentence": "Last Saturday, the volunteers managed fixing twenty items and prevented several batteries ending up in the rubbish."
  },
  {
    "sentenceId": "PARA-0006-S05",
    "sourceSentence": "At the entrance, a coordinator carefully explained new visitors the safety rules and provided every team by the necessary gloves."
  },
  {
    "sentenceId": "PARA-0006-S06",
    "sourceSentence": "She also reminded to write their names on a form before entering the workshop."
  },
  {
    "sentenceId": "PARA-0006-S07",
    "sourceSentence": "Parents were happy because the organisers let children to test safe tools, although they made everyone to wear eye protection."
  },
  {
    "sentenceId": "PARA-0006-S08",
    "sourceSentence": "One instructor advised avoiding to touch loose wires and suggested considering to replace any cracked plug."
  },
  {
    "sentenceId": "PARA-0006-S09",
    "sourceSentence": "Another volunteer insisted checking each cable twice and said that he was responsible recording every repair."
  },
  {
    "sentenceId": "PARA-0006-S10",
    "sourceSentence": "Most visitors prefer repairing old things than buying new ones, and several said they would rather to donate unused tools than throwing them away."
  },
  {
    "sentenceId": "PARA-0006-S11",
    "sourceSentence": "The printed instructions were enough clear for beginners to follow, and the final demonstration was such practical that nobody became confused."
  },
  {
    "sentenceId": "PARA-0006-S12",
    "sourceSentence": "At closing time, two students were responsible for both sorting spare parts and to clean the tables."
  },
  {
    "sentenceId": "PARA-0006-S13",
    "sourceSentence": "Each visitor later chose between taking the item home or leaving it for collection."
  },
  {
    "sentenceId": "PARA-0006-S14",
    "sourceSentence": "Between my neighbour and I, we carried the volunteers tools to a cupboard beside a resident who's bicycle had been repaired."
  },
  {
    "sentenceId": "PARA-0006-S15",
    "sourceSentence": "The amount of volunteers was encouraging, while the others participants promised to return."
  },
  {
    "sentenceId": "PARA-0006-S16",
    "sourceSentence": "By the time the doors closed, the final guest already left, the coordinator still had three forms to check before the next community event in early autumn."
  },
  {
    "sentenceId": "PARA-0007-S01",
    "sourceSentence": "Following last winter’s floods, the council set out a panel to look into on why the drainage programme had fallen beneath schedule."
  },
  {
    "sentenceId": "PARA-0007-S02",
    "sourceSentence": "The chair asked engineers to follow on every complaint and come up to a plan that would account about the failures."
  },
  {
    "sentenceId": "PARA-0007-S03",
    "sourceSentence": "Not only several contractors failed to comply to the safety code, and they also tried to cover up about delays that should have been reported earlier."
  },
  {
    "sentenceId": "PARA-0007-S04",
    "sourceSentence": "No sooner the investigators had drawn up on a timetable when one supplier pulled off of the project."
  },
  {
    "sentenceId": "PARA-0007-S05",
    "sourceSentence": "Only after the financial records had been examined the panel ruled out against fraud."
  },
  {
    "sentenceId": "PARA-0007-S06",
    "sourceSentence": "What it concerned residents most was that officials had put off replace pumps on that several low-lying districts depended."
  },
  {
    "sentenceId": "PARA-0007-S07",
    "sourceSentence": "The committee recommended that each contractor provides monthly evidence and that emergency drills carried out twice a year."
  },
  {
    "sentenceId": "PARA-0007-S08",
    "sourceSentence": "It is essential that the revised system is tested before the rainy season began, lest another breakdown leaves families without assistance."
  },
  {
    "sentenceId": "PARA-0007-S09",
    "sourceSentence": "If had the council acted sooner, it might have prevented damage that is believed having cost local businesses millions."
  },
  {
    "sentenceId": "PARA-0007-S10",
    "sourceSentence": "Much although the mayor wanted to defend the original scheme, she admitted that the authority had failed to live up with its promises."
  },
  {
    "sentenceId": "PARA-0007-S11",
    "sourceSentence": "Residents would rather the council publishes all future reports than withholding inconvenient findings."
  },
  {
    "sentenceId": "PARA-0007-S12",
    "sourceSentence": "By next June, the new monitoring team will take over of the temporary inspectors."
  },
  {
    "sentenceId": "PARA-0007-S13",
    "sourceSentence": "However the repairs complicated may become, officials must deal about them transparently."
  },
  {
    "sentenceId": "PARA-0007-S14",
    "sourceSentence": "Having reviewed the evidence, the conclusion was that what the city needs is not another short-term campaign but a permanent maintenance strategy."
  },
  {
    "sentenceId": "PARA-0007-S15",
    "sourceSentence": "The more consistently agencies work together, similar failures are the less likely to recur."
  },
  {
    "sentenceId": "PARA-0007-S16",
    "sourceSentence": "Until all recommendations will be implemented, no department can take it as granted that public confidence will simply return without sustained effort or scrutiny."
  },
  {
    "sentenceId": "PARA-0008-S01",
    "sourceSentence": "Good health policy should not begin at the hospital door."
  },
  {
    "sentenceId": "PARA-0008-S02",
    "sourceSentence": "I completely agree with preventing illness is more important to treating it after it has already developed, and public funding should therefore give the strongest priority for prevention."
  },
  {
    "sentenceId": "PARA-0008-S03",
    "sourceSentence": "The first reason is that prevention saves both money as human suffering."
  },
  {
    "sentenceId": "PARA-0008-S04",
    "sourceSentence": "When governments invest on health education, vaccination programmes, early screening, safe parks, and better nutrition in schools, many serious conditions can stop before they become expensive medicine crises."
  },
  {
    "sentenceId": "PARA-0008-S05",
    "sourceSentence": "A health system, that only responds after people are already sick, is always fighting fires: hospitals become crowded, doctors are overstretched, and taxpayers must pay long-term treatment that might have avoided."
  },
  {
    "sentenceId": "PARA-0008-S06",
    "sourceSentence": "For example, if children are taught healthy eating habits and are given at places to exercise, they are less likely of developing obesity-related illnesses later at life."
  },
  {
    "sentenceId": "PARA-0008-S07",
    "sourceSentence": "This means that fewer patients needing complex surgery, lifelong medication, or repeated hospital visits."
  },
  {
    "sentenceId": "PARA-0008-S08",
    "sourceSentence": "Prevention, therefore, does not merely reduce costs; it protects people of pain that no medicine can fully erase it."
  },
  {
    "sentenceId": "PARA-0008-S09",
    "sourceSentence": "Another reason is due to preventive spending creates a fairer society."
  },
  {
    "sentenceId": "PARA-0008-S10",
    "sourceSentence": "Treatment often reaches people only after damage has done, whereas that prevention can protect whole communities before illness takes its root."
  },
  {
    "sentenceId": "PARA-0008-S11",
    "sourceSentence": "This is especially important for poorer families, which may lack of access for nutritious food, safe housing, mental-health support, or regular medical checks."
  },
  {
    "sentenceId": "PARA-0008-S12",
    "sourceSentence": "If public money is used to improve air quality, providing free health screenings, support school meals, and promote active lifestyles, the benefits are shared wide rather than reserve for those whom can afford for private care."
  },
  {
    "sentenceId": "PARA-0008-S13",
    "sourceSentence": "In this sense, prevention is not just a medical strategy; it is a social investment that helps citizens remain healthily, productivity, and independently."
  },
  {
    "sentenceId": "PARA-0008-S14",
    "sourceSentence": "In conclusion, governments should clearly prioritise on the prevention of disease because of it reduces avoidable suffering, lowering pressure to healthcare systems, and protects society more equally."
  },
  {
    "sentenceId": "PARA-0008-S15",
    "sourceSentence": "Although treating illness matters, but preventing it is the more wiser use for public money."
  },
  {
    "sentenceId": "PARA-0009-S01",
    "sourceSentence": "Nowadays, many employers blame on the phenomenon of overwork during holiday as their employers offer jobs for them apart from working hours."
  },
  {
    "sentenceId": "PARA-0009-S02",
    "sourceSentence": "I highly believe that this problem has placed detrimental effects on workers, in terms of workloads, stress and social relationships."
  },
  {
    "sentenceId": "PARA-0009-S03",
    "sourceSentence": "The most significant problem is that workers may suffer from higher workloads."
  },
  {
    "sentenceId": "PARA-0009-S04",
    "sourceSentence": "As employers are able to connect with them at all times, they can offer job duties and request on urgent projects."
  },
  {
    "sentenceId": "PARA-0009-S05",
    "sourceSentence": "As such, employers may sacrifice their holiday and take extra amount of work."
  },
  {
    "sentenceId": "PARA-0009-S06",
    "sourceSentence": "Besides, working on holidays imposes high pressure on employees."
  },
  {
    "sentenceId": "PARA-0009-S07",
    "sourceSentence": "Due to the fact that workers have to stay alert for phone calls from employers, they may devote less time on relaxation and be prepared for the request."
  },
  {
    "sentenceId": "PARA-0009-S08",
    "sourceSentence": "As a result, they have less chance to relive their stress during holiday, and which may boost their anxiety under stress."
  },
  {
    "sentenceId": "PARA-0009-S09",
    "sourceSentence": "Moreover, employees who need to work 247 may spend less time with their friends or partners."
  },
  {
    "sentenceId": "PARA-0009-S10",
    "sourceSentence": "In addition to family gathering, employers who have to stay behind for work may devote less time in social activities."
  },
  {
    "sentenceId": "PARA-0009-S11",
    "sourceSentence": "This generally destroys their social bonding with peers and draws on negative effects to their social relationships."
  },
  {
    "sentenceId": "PARA-0009-S12",
    "sourceSentence": "However, some may judge that being connected with employers enhances their working efficiency."
  },
  {
    "sentenceId": "PARA-0009-S13",
    "sourceSentence": "Workers who have difficulties can ask for advice from their employers and to receive immediate responses."
  },
  {
    "sentenceId": "PARA-0009-S14",
    "sourceSentence": "But, as far as I am concerned, this is more beneficial to employers than workers, as they have no obligation to work on every occasion."
  },
  {
    "sentenceId": "PARA-0009-S15",
    "sourceSentence": "Conversely, employers should respect their freedom and support workers during workdays."
  },
  {
    "sentenceId": "PARA-0009-S16",
    "sourceSentence": "Also, workers should set boundaries for their working hours and avoid excessive workloads to keep themselves healthy."
  },
  {
    "sentenceId": "PARA-0009-S17",
    "sourceSentence": "To sum up, employers should avoid contacting their workers during holiday, which can prevent them from excessive work, loads of stress and to keep close relationship with their friends."
  },
  {
    "sentenceId": "PARA-0010-S01",
    "sourceSentence": "In many schools, In order to train students discipline."
  },
  {
    "sentenceId": "PARA-0010-S02",
    "sourceSentence": "Schools have stringent requestment in uniform."
  },
  {
    "sentenceId": "PARA-0010-S03",
    "sourceSentence": "Some schools allow children to dress with for more freedom."
  },
  {
    "sentenceId": "PARA-0010-S04",
    "sourceSentence": "Requiring pupils to wear a uniform has several clear benefits, especially wearing uniform can help students more focus on studies, but schools allowing casual wear will increase the time and cost and even cause psychological problems."
  },
  {
    "sentenceId": "PARA-0010-S05",
    "sourceSentence": "One major advantage Wearing uniform can reduce this wearing anxiety and help students concentrate on studies."
  },
  {
    "sentenceId": "PARA-0010-S06",
    "sourceSentence": "If students spend less time choosing outfits clothes, they can reserve more time for homework and get quality time to sleep in the morning, as well as students maintain energy in the lesson."
  },
  {
    "sentenceId": "PARA-0010-S07",
    "sourceSentence": "Uniforms can create the fair schools environment."
  },
  {
    "sentenceId": "PARA-0010-S08",
    "sourceSentence": "If schools allow the students causal wear, everyday schools will become a faishon show, Some affluent student dressed to flex, while a normal students only have 2-3 outfits to change."
  },
  {
    "sentenceId": "PARA-0010-S09",
    "sourceSentence": "Teenagers value their friendships and care about what their think, personal outfits become a main topic in schools."
  },
  {
    "sentenceId": "PARA-0010-S10",
    "sourceSentence": "If some students can't expand that even cause bullying in school."
  },
  {
    "sentenceId": "PARA-0010-S11",
    "sourceSentence": "Therefore children will face mental health problems."
  },
  {
    "sentenceId": "PARA-0010-S12",
    "sourceSentence": "For these reasons uniforms can reslove the students choosing outfits problems and make campus life equal."
  },
  {
    "sentenceId": "PARA-0010-S13",
    "sourceSentence": "However schools uniforms also have disadvantages."
  },
  {
    "sentenceId": "PARA-0010-S14",
    "sourceSentence": "the most obvious one is that uniforms are not comfortable and practical."
  },
  {
    "sentenceId": "PARA-0010-S15",
    "sourceSentence": "Although uniforms look decent, they can't take away sweat and uniform quality not warm in the winnter."
  },
  {
    "sentenceId": "PARA-0010-S16",
    "sourceSentence": "For example the student finishing the PE leasson T-shirt always get wet and the jacket too thin can't keep warm."
  },
  {
    "sentenceId": "PARA-0010-S17",
    "sourceSentence": "Another drawback is cost."
  },
  {
    "sentenceId": "PARA-0010-S18",
    "sourceSentence": "Although uniforms are meant to simplify clothing but the suppliers price increase every years."
  },
  {
    "sentenceId": "PARA-0010-S19",
    "sourceSentence": "If the students in developmental stage, keep to change every year."
  },
  {
    "sentenceId": "PARA-0010-S20",
    "sourceSentence": "For income family this become a heavy hidden financial burden."
  },
  {
    "sentenceId": "PARA-0010-S21",
    "sourceSentence": "Therefore uniforms may solve social problems at schools, but they can also create parents and students economic difficulties."
  },
  {
    "sentenceId": "PARA-0010-S22",
    "sourceSentence": "In conclusion school uniforms can make wearing easier for the students and reduce comparison but they can cause financial pressure."
  },
  {
    "sentenceId": "PARA-0010-S23",
    "sourceSentence": "Overall, they bring clear learning environment benefits, while also creating practical and personal drawbacks."
  },
  {
    "sentenceId": "PARA-0011-S01",
    "sourceSentence": "In today's society, work become a part of our life, so our private time it has been connected with our work."
  },
  {
    "sentenceId": "PARA-0011-S02",
    "sourceSentence": "This problem is usually caused by over workload leads to work stress and weakened boundaries between professional and private life."
  },
  {
    "sentenceId": "PARA-0011-S03",
    "sourceSentence": "If the government set a limits maximum working hour and set personal boundaries can protect employees work life balance."
  },
  {
    "sentenceId": "PARA-0011-S04",
    "sourceSentence": "One major reason is that many employess facing a heavy workload."
  },
  {
    "sentenceId": "PARA-0011-S05",
    "sourceSentence": "Nowadays messaging app are common caused staff have a lot of email messages to reply, since it is so convenient to manage documents and meetings, so the end of the working day no longer feels like a real end."
  },
  {
    "sentenceId": "PARA-0011-S06",
    "sourceSentence": "As a result a person may be physically at home, but mentally still at the office desk."
  },
  {
    "sentenceId": "PARA-0011-S07",
    "sourceSentence": "Another cause is financial pressure."
  },
  {
    "sentenceId": "PARA-0011-S08",
    "sourceSentence": "Face of high house prices, bus fares and food keep going up, people give up their free time and face heavy work stress just to keep their jobs."
  },
  {
    "sentenceId": "PARA-0011-S09",
    "sourceSentence": "Over time, their tired bodies to make money."
  },
  {
    "sentenceId": "PARA-0011-S10",
    "sourceSentence": "Because they do not have enough rest for a long time, they work become slower and slower and need more time to finish the work, After that, they lose their personal life."
  },
  {
    "sentenceId": "PARA-0011-S11",
    "sourceSentence": "The most effective solution is the government to limit the maximum working hours for certain jobs."
  },
  {
    "sentenceId": "PARA-0011-S12",
    "sourceSentence": "For examples, clerks and sales assistants can only work 6 days per week and 8 hours per day."
  },
  {
    "sentenceId": "PARA-0011-S13",
    "sourceSentence": "Also the employees can choose not to read or reply the work messages after work, and theirs bosses cannot punish or give them bad reviews for this."
  },
  {
    "sentenceId": "PARA-0011-S14",
    "sourceSentence": "Hope this can help workers keep more personal and more rest time."
  },
  {
    "sentenceId": "PARA-0011-S15",
    "sourceSentence": "At the same time people should set a clear boundaries for work."
  },
  {
    "sentenceId": "PARA-0011-S16",
    "sourceSentence": "For examples, after work turn off work notifications, and leaves more time for doing exercise and having family dinners."
  },
  {
    "sentenceId": "PARA-0011-S17",
    "sourceSentence": "Without such boundaries, personal life becomes the first thing to be sacrificed."
  },
  {
    "sentenceId": "PARA-0011-S18",
    "sourceSentence": "In conclusion, work stress and financial pressure is closely connected to our standard of living and quality of life."
  },
  {
    "sentenceId": "PARA-0011-S19",
    "sourceSentence": "However If the government and employers give a better work condition and individuals draw a clearer line between their jobs and the rests of their lives.this problem can be solved."
  },
  {
    "sentenceId": "PARA-0012-S01",
    "sourceSentence": "In recent years, more and more companies requires staff needed to wore uniforms at work."
  },
  {
    "sentenceId": "PARA-0012-S02",
    "sourceSentence": "There are some advantages of a company having a uniform for example customer can quickly locate staff in retail stores and enhanced trust and professionalism."
  },
  {
    "sentenceId": "PARA-0012-S03",
    "sourceSentence": "In staff opinion, a uniform can doesn’t required a work wardrobe expenses and it can less wear and tear on personal clothes"
  },
  {
    "sentenceId": "PARA-0012-S04",
    "sourceSentence": "To begin with, the advantage is that customers can easily located their staff who are wearing uniforms."
  },
  {
    "sentenceId": "PARA-0012-S05",
    "sourceSentence": "Customers can have a first impression of the business."
  },
  {
    "sentenceId": "PARA-0012-S06",
    "sourceSentence": "A clear illustration, if you enter an international airport with the staff do not wearing a proper uniform, you will think that there are a loss of trusts and professionalism."
  },
  {
    "sentenceId": "PARA-0012-S07",
    "sourceSentence": "However, it will have more commutations with passengers and staff if they wearing uniforms."
  },
  {
    "sentenceId": "PARA-0012-S08",
    "sourceSentence": "A further dimensions is you will easy to locate the staff of a shops and it will increase companies profits, imaged if you enter a retai shop and no staff wearing uniform, you will need more time to figure out someone looking at a shelf is an employees and it is no good at all."
  },
  {
    "sentenceId": "PARA-0013-S01",
    "sourceSentence": "The pie chart illustrates the age of residents of Yemen and Italy in 2000 and projections for 2050."
  },
  {
    "sentenceId": "PARA-0013-S02",
    "sourceSentence": "Overall, Yemen residents is younger than Italy in 2000, this pattern keep diversifying to 2050."
  },
  {
    "sentenceId": "PARA-0013-S03",
    "sourceSentence": "However, both country are projected to aged; the proportion of children will decline, while the older groups, in Italy, will become lager."
  },
  {
    "sentenceId": "PARA-0013-S04",
    "sourceSentence": "In Yemen, the population of 0-14 years old is almost one-half, got 50.1%, slightly more than 15-59 years old 46.3%."
  },
  {
    "sentenceId": "PARA-0013-S05",
    "sourceSentence": "By 2050, this trend will be reversed."
  },
  {
    "sentenceId": "PARA-0013-S06",
    "sourceSentence": "The 15-59 age group will exceed 0-14 years old to 57.3%."
  },
  {
    "sentenceId": "PARA-0013-S07",
    "sourceSentence": "The elderly population will remain comparatively small, though it is expected to increase from 3.6% to 5.7%."
  },
  {
    "sentenceId": "PARA-0013-S08",
    "sourceSentence": "In Italy, the 15-59 years old age group keep being the largest slice from 2000 to 2050."
  },
  {
    "sentenceId": "PARA-0013-S09",
    "sourceSentence": "Although it predicted to fall from 61.6% to 46.2%."
  },
  {
    "sentenceId": "PARA-0013-S10",
    "sourceSentence": "The elderly group almost doubled from 24.1% to 42.3%."
  },
  {
    "sentenceId": "PARA-0013-S11",
    "sourceSentence": "The youngster group has nearly remain unchanged through the prediction, just shrink slightly from 14.3% to 11.5%."
  },
  {
    "sentenceId": "PARA-0014-S01",
    "sourceSentence": "The museum launched a digital archive for photographs, diaries and oral histories."
  },
  {
    "sentenceId": "PARA-0014-S02",
    "sourceSentence": "Not until the exhibition opened residents realised how much history remained unrecorded."
  },
  {
    "sentenceId": "PARA-0014-S03",
    "sourceSentence": "Rarely the museum had received donations, and volunteers worked hardly to catalogue them."
  },
  {
    "sentenceId": "PARA-0014-S04",
    "sourceSentence": "Every file needed checking, but staff had better to confirm whether it's label matched the box."
  },
  {
    "sentenceId": "PARA-0014-S05",
    "sourceSentence": "Several records need to digitise, while two films are worth to restore."
  },
  {
    "sentenceId": "PARA-0014-S06",
    "sourceSentence": "The museum had a technician to repair the scanner and got a volunteer install software."
  },
  {
    "sentenceId": "PARA-0014-S07",
    "sourceSentence": "Staff needn't stayed late, although they stayed until midnight."
  },
  {
    "sentenceId": "PARA-0014-S08",
    "sourceSentence": "Under no circumstances visitors should remove originals, nor they may photograph private documents."
  },
  {
    "sentenceId": "PARA-0014-S09",
    "sourceSentence": "Guests borrowed devices; the curator told them to turn off them and parents to look their children after."
  },
  {
    "sentenceId": "PARA-0014-S10",
    "sourceSentence": "During May, the museum received 312 submissions from schools, shops and residents."
  },
  {
    "sentenceId": "PARA-0014-S11",
    "sourceSentence": "A number of applications was incomplete, whereas the number of rejections were small."
  },
  {
    "sentenceId": "PARA-0014-S12",
    "sourceSentence": "More than one volunteers were uncertain, and Lena is one of those assistants who works late answering questions."
  },
  {
    "sentenceId": "PARA-0014-S13",
    "sourceSentence": "The only coordinator who know encryption, together with two interns, have prepared a manual."
  },
  {
    "sentenceId": "PARA-0014-S14",
    "sourceSentence": "Either the interns or the archivist are expected to answer questions."
  },
  {
    "sentenceId": "PARA-0014-S15",
    "sourceSentence": "Ten kilometres are too far; three hundred pounds were enough for transport."
  },
  {
    "sentenceId": "PARA-0014-S16",
    "sourceSentence": "The news were welcomed; two-thirds of the equipment were bought, while half of the volunteers was recruited."
  },
  {
    "sentenceId": "PARA-0014-S17",
    "sourceSentence": "The scanner is twice more efficient than its predecessor, and its output is superior than the earlier model."
  },
  {
    "sentenceId": "PARA-0014-S18",
    "sourceSentence": "The storage system is the same with the national archive's, but its fee is too much expensive."
  },
  {
    "sentenceId": "PARA-0014-S19",
    "sourceSentence": "It is high time the council provides funding, and residents wish it approved the second phase last year."
  },
  {
    "sentenceId": "PARA-0014-S20",
    "sourceSentence": "If only the finance team released the money earlier, workshops would not have been delayed."
  },
  {
    "sentenceId": "PARA-0014-S21",
    "sourceSentence": "Were it not for donations, the archive will close next winter."
  },
  {
    "sentenceId": "PARA-0014-S22",
    "sourceSentence": "Should any donor will object, the museum will remove the files."
  },
  {
    "sentenceId": "PARA-0014-S23",
    "sourceSentence": "Unless the server does not fail, staff will keep an offline copy in case the database will become unavailable."
  },
  {
    "sentenceId": "PARA-0014-S24",
    "sourceSentence": "The extension depends on if the museum can prove its value."
  },
  {
    "sentenceId": "PARA-0014-S25",
    "sourceSentence": "The reason why officials remain cautious is because no long-term budget exists."
  },
  {
    "sentenceId": "PARA-0014-S26",
    "sourceSentence": "It was not until auditors finished when the council released payment."
  },
  {
    "sentenceId": "PARA-0014-S27",
    "sourceSentence": "What the project now needs are a permanent funding arrangement."
  },
  {
    "sentenceId": "PARA-0014-S28",
    "sourceSentence": "So complicated the forms were that donors signed wrongly, and such the confusion was that staff arranged another briefing."
  },
  {
    "sentenceId": "PARA-0014-S29",
    "sourceSentence": "Whomever wants to withdraw a photograph may do so, and the archive will return all what families reject."
  },
  {
    "sentenceId": "PARA-0014-S30",
    "sourceSentence": "The way how volunteers describe images must be consistent, because the fact of that some diaries contain private details requires care."
  },
  {
    "sentenceId": "PARA-0014-S31",
    "sourceSentence": "The museum has made research and done progress, but the committee must take into consideration of costs and pay attention on security."
  },
  {
    "sentenceId": "PARA-0014-S32",
    "sourceSentence": "A colleague of me objected and called preservation somebody's else responsibility."
  },
  {
    "sentenceId": "PARA-0014-S33",
    "sourceSentence": "Myself and the curator disagreed, although the chair asked myself to prepare a proposal."
  },
  {
    "sentenceId": "PARA-0014-S34",
    "sourceSentence": "The decision will follow after lawyers have given an advice."
  },
  {
    "sentenceId": "PARA-0014-S35",
    "sourceSentence": "Whatever the outcome, the archive has encouraged residents to value records that might otherwise disappear."
  },
  {
    "sentenceId": "PARA-0015-S01",
    "sourceSentence": "The Northbridge University has begun a community research fellowship in the September 2023."
  },
  {
    "sentenceId": "PARA-0015-S02",
    "sourceSentence": "Since then, the scheme attracted students from United Kingdom, Netherlands and several partner colleges."
  },
  {
    "sentenceId": "PARA-0015-S03",
    "sourceSentence": "Students who attend the university for the first time often need guidance, whereas visitors who come to university for public lectures need different information."
  },
  {
    "sentenceId": "PARA-0015-S04",
    "sourceSentence": "The Professor Malik, programme director, said that the fellowship has received a great deal of applications but only few funding."
  },
  {
    "sentenceId": "PARA-0015-S05",
    "sourceSentence": "For the past three months, the selection team reviewed portfolios contained field notes, interviews and statistical analysises."
  },
  {
    "sentenceId": "PARA-0015-S06",
    "sourceSentence": "The database is containing twenty criterias, although each application is judged against only one criteria at a time."
  },
  {
    "sentenceId": "PARA-0015-S07",
    "sourceSentence": "Few candidates have submitted excellent work; a few, however, have explained how their evidence relates to their conclusions."
  },
  {
    "sentenceId": "PARA-0015-S08",
    "sourceSentence": "There is a few time before interviews begin, but few extra time has been reserved for applicants requiring adjustments."
  },
  {
    "sentenceId": "PARA-0015-S09",
    "sourceSentence": "Of the two interview rooms, one is beside the library and another is inside the student centre."
  },
  {
    "sentenceId": "PARA-0015-S10",
    "sourceSentence": "At last Monday, the coordinator said applicants that the timetable has changed."
  },
  {
    "sentenceId": "PARA-0015-S11",
    "sourceSentence": "She said that the online portal failed last evening and asked that whether everyone had saved a copy."
  },
  {
    "sentenceId": "PARA-0015-S12",
    "sourceSentence": "She warned candidates do not upload confidential material and denied to share any files with outside organisations."
  },
  {
    "sentenceId": "PARA-0015-S13",
    "sourceSentence": "One applicant asked, “Why the portal rejected my form?”"
  },
  {
    "sentenceId": "PARA-0015-S14",
    "sourceSentence": "Another asked, “Does every reference has to be signed?”"
  },
  {
    "sentenceId": "PARA-0015-S15",
    "sourceSentence": "The coordinator replied that references submitting without signatures would be returned."
  },
  {
    "sentenceId": "PARA-0015-S16",
    "sourceSentence": "She also promised each applicant to contact them once the technicians had restored the system."
  },
  {
    "sentenceId": "PARA-0015-S17",
    "sourceSentence": "Several questions nevertheless remain."
  },
  {
    "sentenceId": "PARA-0015-S18",
    "sourceSentence": "The old scanner and the new laptop were tested together, but it was faster."
  },
  {
    "sentenceId": "PARA-0015-S19",
    "sourceSentence": "The red folders were stronger than the blue, although the last were cheaper."
  },
  {
    "sentenceId": "PARA-0015-S20",
    "sourceSentence": "The committee rejected the original timetable because it was unrealistic, although it had drafted it."
  },
  {
    "sentenceId": "PARA-0015-S21",
    "sourceSentence": "Applications were submitted after the deadline will be considered only if evidence for an emergency is provided."
  },
  {
    "sentenceId": "PARA-0015-S22",
    "sourceSentence": "Maya the programme officer will review reports wrote in languages other than English."
  },
  {
    "sentenceId": "PARA-0015-S23",
    "sourceSentence": "The scheme also requires more careful use of articles and institutional names."
  },
  {
    "sentenceId": "PARA-0015-S24",
    "sourceSentence": "Participants conduct the research in library, but they go to the university to study."
  },
  {
    "sentenceId": "PARA-0015-S25",
    "sourceSentence": "Dr Chen works at Northbridge University, while her brother works at University of Westhaven."
  },
  {
    "sentenceId": "PARA-0015-S26",
    "sourceSentence": "One visiting scholar came from Netherlands, and the other came from United Kingdom."
  },
  {
    "sentenceId": "PARA-0015-S27",
    "sourceSentence": "Each name must retain its official article pattern."
  },
  {
    "sentenceId": "PARA-0015-S28",
    "sourceSentence": "At the final briefing, the chair asked, “How many candidates did complete the ethics training?”"
  },
  {
    "sentenceId": "PARA-0015-S29",
    "sourceSentence": "Nobody did not answer immediately, but no candidate had forgotten the requirement."
  },
  {
    "sentenceId": "PARA-0015-S30",
    "sourceSentence": "The chair explained that a solution for the delay depended of cooperation among departments."
  },
  {
    "sentenceId": "PARA-0015-S31",
    "sourceSentence": "She was aware about the pressure on staff and concerned of its effect on applicants."
  },
  {
    "sentenceId": "PARA-0015-S32",
    "sourceSentence": "The department is owning two recorders, and the equipment is belonging to the university."
  },
  {
    "sentenceId": "PARA-0015-S33",
    "sourceSentence": "Staff are knowing that the software is containing sensitive data, so they check each permission setting this week before approving public access."
  },
  {
    "sentenceId": "PARA-0015-S34",
    "sourceSentence": "Whatever the final decision will be, the fellowship will continue providing opportunities for students whose work might otherwise remain unseen."
  },
  {
    "sentenceId": "PARA-0016-S01",
    "sourceSentence": "The Eastford College launched an orientation and transport trial for international students on last autumn."
  },
  {
    "sentenceId": "PARA-0016-S02",
    "sourceSentence": "During first week, students attend the university by day and return to home by the bus in the evening."
  },
  {
    "sentenceId": "PARA-0016-S03",
    "sourceSentence": "They have the breakfast in their residences before taking number 12 bus."
  },
  {
    "sentenceId": "PARA-0016-S04",
    "sourceSentence": "At the college, they meet in a main library rather than in the class."
  },
  {
    "sentenceId": "PARA-0016-S05",
    "sourceSentence": "Students who need medical advice go to the hospital through the campus clinic, whereas those visiting a friend go to hospital as visitors."
  },
  {
    "sentenceId": "PARA-0016-S06",
    "sourceSentence": "In the afternoon, some listen the radio, while others watch the television in common room."
  },
  {
    "sentenceId": "PARA-0016-S07",
    "sourceSentence": "During the tour, the guide stopped explaining the ticket machine and reminded students locking their rooms."
  },
  {
    "sentenceId": "PARA-0016-S08",
    "sourceSentence": "One student remembered to leave her card on a bus and tried to call the lost-property office."
  },
  {
    "sentenceId": "PARA-0016-S09",
    "sourceSentence": "Replacing the card meant to complete another form, but she did not mean delaying the group."
  },
  {
    "sentenceId": "PARA-0016-S10",
    "sourceSentence": "Since the trial began, the college collected feedbacks from more than two hundred students."
  },
  {
    "sentenceId": "PARA-0016-S11",
    "sourceSentence": "Most of students have found the maps useful, but most of students interviewed asked for clearer fare information."
  },
  {
    "sentenceId": "PARA-0016-S12",
    "sourceSentence": "A few had previously travelled alone, whereas few knew how to use the regional ticketing app."
  },
  {
    "sentenceId": "PARA-0016-S13",
    "sourceSentence": "There was little of time during the first session, although tutors allowed a few extra time for questions."
  },
  {
    "sentenceId": "PARA-0016-S14",
    "sourceSentence": "Each of students received a card, and all them were asked to keep it."
  },
  {
    "sentenceId": "PARA-0016-S15",
    "sourceSentence": "One student said that she had gone to London last year but had never gone to Eastford before."
  },
  {
    "sentenceId": "PARA-0016-S16",
    "sourceSentence": "She explained that her brother had been to Manchester and would not return until Friday."
  },
  {
    "sentenceId": "PARA-0016-S17",
    "sourceSentence": "Another student apologised the tutor about arriving late and blamed the delay for a cancelled train."
  },
  {
    "sentenceId": "PARA-0016-S18",
    "sourceSentence": "The tutor congratulated her for finding an alternative route and reminded to everyone that the next workshop will begin at nine."
  },
  {
    "sentenceId": "PARA-0016-S19",
    "sourceSentence": "“Why the evening bus does stop so early?” one student asked."
  },
  {
    "sentenceId": "PARA-0016-S20",
    "sourceSentence": "“How many routes serve the campus?” asked another."
  },
  {
    "sentenceId": "PARA-0016-S21",
    "sourceSentence": "The tutor replied that nobody had complained previously, but neither the transport office had published a full timetable."
  },
  {
    "sentenceId": "PARA-0016-S22",
    "sourceSentence": "One student said that he did not have some cash; another replied, “Neither I do.”"
  },
  {
    "sentenceId": "PARA-0016-S23",
    "sourceSentence": "The tutor added, “The app is working now, is it?”"
  },
  {
    "sentenceId": "PARA-0016-S24",
    "sourceSentence": "The college is also reviewing reports submitted by students who living outside the city."
  },
  {
    "sentenceId": "PARA-0016-S25",
    "sourceSentence": "The reports contain several analysis of travel patterns, two serieses of photographs and three appendix."
  },
  {
    "sentenceId": "PARA-0016-S26",
    "sourceSentence": "One phenomena appearing repeatedly is that students which live more far away spend lesser time on campus."
  },
  {
    "sentenceId": "PARA-0016-S27",
    "sourceSentence": "The red route is more faster than the blue, while the last is more cheap."
  },
  {
    "sentenceId": "PARA-0016-S28",
    "sourceSentence": "At the final meeting, the coordinator asked did the survey represented every group fair."
  },
  {
    "sentenceId": "PARA-0016-S29",
    "sourceSentence": "She noted that the data was limited and that some of the evidences were inconclusive."
  },
  {
    "sentenceId": "PARA-0016-S30",
    "sourceSentence": "The committee therefore requested for more informations from students which journeys involved more one form of transport."
  },
  {
    "sentenceId": "PARA-0016-S31",
    "sourceSentence": "It also asked each participant to check that their address were correct."
  },
  {
    "sentenceId": "PARA-0016-S32",
    "sourceSentence": "Whatever the results show, the college will continue throughout the year to provide guidance, and students will know to whom to contact when a problem will arise."
  },
  {
    "sentenceId": "PARA-0017-S01",
    "sourceSentence": "The three maps show how Riverside district has changed from 1995 until 2025 and how it proposes to develop until 2035."
  },
  {
    "sentenceId": "PARA-0017-S02",
    "sourceSentence": "Overall, the area has transformed from a lightly-developed riverside settlement to a density mixed-use neighbourhood, and the next phase intends improving pedestrian access while remain the central park."
  },
  {
    "sentenceId": "PARA-0017-S03",
    "sourceSentence": "On 1995, a two-lanes road went from west towards east besides the northern bank of River Elin."
  },
  {
    "sentenceId": "PARA-0017-S04",
    "sourceSentence": "A row of cottages stood in the north side of the road, opposite of a small park."
  },
  {
    "sentenceId": "PARA-0017-S05",
    "sourceSentence": "The post office laid among the park and a grocery shop, while a warehouse occupied the site on the east end in the district."
  },
  {
    "sentenceId": "PARA-0017-S06",
    "sourceSentence": "At south of the river, farmlands extended until the railway, and the area could only access through a narrow walking bridge."
  },
  {
    "sentenceId": "PARA-0017-S07",
    "sourceSentence": "No road bridge was crossed the river, and there had no direct connection between the station to the town centre."
  },
  {
    "sentenceId": "PARA-0017-S08",
    "sourceSentence": "During following thirty years, the cottages replaced by three apartment blocks, and the grocery shop was converted as a medical centre."
  },
  {
    "sentenceId": "PARA-0017-S09",
    "sourceSentence": "The park was expanded to east, despite its original entrance remained at the same location."
  },
  {
    "sentenceId": "PARA-0017-S10",
    "sourceSentence": "The warehouse demolished, and a supermarket constructed over its previous site."
  },
  {
    "sentenceId": "PARA-0017-S11",
    "sourceSentence": "A road bridge was constructed across the river, linking between the main road and the station."
  },
  {
    "sentenceId": "PARA-0017-S12",
    "sourceSentence": "In addition, the footbridge was moved for about 200 metres at the west from its original position."
  },
  {
    "sentenceId": "PARA-0017-S13",
    "sourceSentence": "The road section next the park was made pedestrian, with traffic redirected in a new bypass which ran around north edge of district."
  },
  {
    "sentenceId": "PARA-0017-S14",
    "sourceSentence": "A parking was added besides the supermarket, and a bus station was installed on the cross of the bypass with Station Road."
  },
  {
    "sentenceId": "PARA-0017-S15",
    "sourceSentence": "Regardless these changes, the railway station remained out of the district border, at south of the new bridge."
  },
  {
    "sentenceId": "PARA-0017-S16",
    "sourceSentence": "The supermarket faced to medical centre, whereas the bus stop was located diagonal opposite with the park entrance."
  },
  {
    "sentenceId": "PARA-0017-S17",
    "sourceSentence": "Until 2035, it is planned a walkway for connecting the station with public square, and bicycle parkings will be supplied in the both sides of southern ramp."
  },
  {
    "sentenceId": "PARA-0017-S18",
    "sourceSentence": "According to 2035 proposal, the medical centre is due for extending to north, and a pharmacy will add adjacent with it."
  },
  {
    "sentenceId": "PARA-0017-S19",
    "sourceSentence": "Apartment block at centre will knock down, and its site will turn to a public square surrounding with cafés."
  },
  {
    "sentenceId": "PARA-0017-S20",
    "sourceSentence": "A cycling path will run along side both river banks and pass under of the road bridge."
  },
  {
    "sentenceId": "PARA-0017-S21",
    "sourceSentence": "Two ramps will provide the path an access from every side of the bridge."
  },
  {
    "sentenceId": "PARA-0017-S22",
    "sourceSentence": "The existing car park will relocate underground, which allows the above land to use for a playground."
  },
  {
    "sentenceId": "PARA-0017-S23",
    "sourceSentence": "In the south-east corner from the district, part of farmland will divide to plots of detached housings."
  },
  {
    "sentenceId": "PARA-0017-S24",
    "sourceSentence": "These homes will be facing to the river and will connect with the station through a road branched from Station Road."
  },
  {
    "sentenceId": "PARA-0017-S25",
    "sourceSentence": "At the end, the footbridge will remain as unchanged, but the neighbour riverbank will widen for creating a viewing place."
  },
  {
    "sentenceId": "PARA-0017-S26",
    "sourceSentence": "By 2035, most of residents will reside at a walking distance from shops, public transports and opened spaces."
  },
  {
    "sentenceId": "PARA-0018-S01",
    "sourceSentence": "The line graph illustrates about annual household electricity use in four regions, measured by MWh, between 2005 to 2035, while the bar chart compares between its sources."
  },
  {
    "sentenceId": "PARA-0018-S02",
    "sourceSentence": "Overall, Northland led initially but Eastport overtook than it, whereas Westmere remained lowest from the four for most of period."
  },
  {
    "sentenceId": "PARA-0018-S03",
    "sourceSentence": "At 2005, the figure of Northland stood 4.0 MWh, comparing with 3.2 MWh of Eastport."
  },
  {
    "sentenceId": "PARA-0018-S04",
    "sourceSentence": "Northland then rose from 4.0 by a peak at 4.5 MWh in 2010, an increase by 0.5 MWh."
  },
  {
    "sentenceId": "PARA-0018-S05",
    "sourceSentence": "After peaked, consumption fell of 1.1 MWh at 3.4 MWh on 2025."
  },
  {
    "sentenceId": "PARA-0018-S06",
    "sourceSentence": "Until 2035, the figure is forecast to have fallen further at 3.0 MWh."
  },
  {
    "sentenceId": "PARA-0018-S07",
    "sourceSentence": "Eastport had risen steadily from 3.2 to 4.4 MWh between 2005 to 2025 before reaching to 4.8 MWh in 2035."
  },
  {
    "sentenceId": "PARA-0018-S08",
    "sourceSentence": "This represented a rise by 1.6 MWh, or 50 per cents."
  },
  {
    "sentenceId": "PARA-0018-S09",
    "sourceSentence": "By 2020, Eastport had surpassed than Northland with 0.6 MWh."
  },
  {
    "sentenceId": "PARA-0018-S10",
    "sourceSentence": "In 2035, Eastport is expected to use one and three-fifths times as much electricity than Northland."
  },
  {
    "sentenceId": "PARA-0018-S11",
    "sourceSentence": "Southvale fluctuated from 2.7 and 3.1 MWh between 2010 to 2025."
  },
  {
    "sentenceId": "PARA-0018-S12",
    "sourceSentence": "It bottomed at 2.7 MWh in 2015, recovered by 3.1 MWh in 2020 and levelled at 3.0 MWh."
  },
  {
    "sentenceId": "PARA-0018-S13",
    "sourceSentence": "Throughout of the period, its values ranged between 2.7 to 3.3 MWh."
  },
  {
    "sentenceId": "PARA-0018-S14",
    "sourceSentence": "Westmere started from 2.1 MWh and increased 1.1 MWh until 3.2 MWh."
  },
  {
    "sentenceId": "PARA-0018-S15",
    "sourceSentence": "The 2035 figure is projected to be about one-and-half times than the 2005 level."
  },
  {
    "sentenceId": "PARA-0018-S16",
    "sourceSentence": "Westmere remained under than Southvale until 2025 but is projected to catch it up by 2035."
  },
  {
    "sentenceId": "PARA-0018-S17",
    "sourceSentence": "The bar chart presents the proportions of electricity generated from coal, gas and renewables."
  },
  {
    "sentenceId": "PARA-0018-S18",
    "sourceSentence": "In 2005, coal made 45 per cent from generation, gas 37 per cent and renewables 18 per cent."
  },
  {
    "sentenceId": "PARA-0018-S19",
    "sourceSentence": "Coal's share is forecast to fall by 20 per cent, a decrease by 25 per cent points."
  },
  {
    "sentenceId": "PARA-0018-S20",
    "sourceSentence": "This equals with a reduction by 56 per cent comparing with its original share."
  },
  {
    "sentenceId": "PARA-0018-S21",
    "sourceSentence": "Renewables are expected to rise 18 to 47 per cent, gaining 29 per cent points."
  },
  {
    "sentenceId": "PARA-0018-S22",
    "sourceSentence": "Their share will therefore be more than two and a half folds its 2005 level."
  },
  {
    "sentenceId": "PARA-0018-S23",
    "sourceSentence": "Wind and solar together will be made up 47 per cent of total generation."
  },
  {
    "sentenceId": "PARA-0018-S24",
    "sourceSentence": "Gas, in contrary, is projected to decline slightly, between 37 and 33 per cent."
  },
  {
    "sentenceId": "PARA-0018-S25",
    "sourceSentence": "The gap among gas and renewables will shift from 19 percentage points favouring gas into 14 percentage points favouring renewables."
  },
  {
    "sentenceId": "PARA-0018-S26",
    "sourceSentence": "Between the three sources, renewables will record the most large absolute increase."
  },
  {
    "sentenceId": "PARA-0018-S27",
    "sourceSentence": "Coal will experience the most sharp fall between the three, while gas will remain a second largest source."
  },
  {
    "sentenceId": "PARA-0018-S28",
    "sourceSentence": "The figures for coal, gas and renewables will be 20, 33 and 47 per cents, respectably."
  },
  {
    "sentenceId": "PARA-0018-S29",
    "sourceSentence": "Taking together, the charts indicate convergence in consumption and a shift towards renewable generation."
  },
  {
    "sentenceId": "PARA-0018-S30",
    "sourceSentence": "Comparing with 2005, the projected 2035 energy mix contains a much smaller coal share."
  },
  {
    "sentenceId": "PARA-0018-S31",
    "sourceSentence": "The combined regional total is projected to raise from 12.1 to 14.3 MWh."
  },
  {
    "sentenceId": "PARA-0018-S32",
    "sourceSentence": "The difference of the fastest-growing and slowest-growing regions is projected to be widened."
  },
  {
    "sentenceId": "PARA-0018-S33",
    "sourceSentence": "At end of the period, Eastport will rank the first, followed with Southvale and Westmere, with Northland at last."
  }
].map((entry) => Object.freeze(entry)));
