// GENERATED FILE. Edit tools/grammar-detector-v2/data and run
// node tools/grammar-detector-v2/validate-and-compile.mjs instead.

export const EXECUTABLE_GRAMMAR_VERSION = "2026-08-02.19-21.1";

export const EXECUTABLE_GRAMMAR_COUNTS = Object.freeze({
  "sets": 3,
  "sourceIssues": 303,
  "families": 219,
  "runtimeFamilies": 44,
  "patterns": 53,
  "controls": 90,
  "cases": 914,
  "unsupportedFamilies": 175
});

export const EXECUTABLE_GRAMMAR_FAMILIES = Object.freeze([
  {
    "familyId": "GF_ABSTRACT_CATEGORY_IN_WHICH",
    "name": "Abstract category in which",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Abstract category in which」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S09-I02"
    ],
    "requiredCapabilities": [
      "register_policy",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "register_policy"
    ]
  },
  {
    "familyId": "GF_ACCOMPANY_DIRECT_OBJECT",
    "name": "Accompany takes a direct object in the active voice",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Accompany takes a direct object in the active voice」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S21-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_ACCOUNT_FOR_PROPORTION",
    "name": "Account for a stated proportion",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Account for a stated proportion」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S27-I02",
      "PARA-0020-S24-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_ACROSS_MULTIPLE_SERIES",
    "name": "Across multiple series",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Across multiple series」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S28-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_AFTER_MODAL_BASE_VERB",
    "name": "After modal base verb",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「After modal base verb」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S02-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_AFTER_WHICH_SENTENTIAL_SEQUENCE",
    "name": "After which as an integrated sentential sequencer",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「After which as an integrated sentential sequencer」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S30-I03",
      "PARA-0021-S07-I01"
    ],
    "requiredCapabilities": [
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": []
  },
  {
    "familyId": "GF_AFTER_YEAR_PAST_TREND",
    "name": "After year past trend",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「After year past trend」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S12-I01"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_AHEAD_OF",
    "name": "Ahead of",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Ahead of」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S27-I05"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL",
    "name": "Although before a finite clause; despite before a nominal or gerund",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "conjunction",
    "explanationZhHant": "這個規則族處理「Although before a finite clause; despite before a nominal or gerund」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S24-I01",
      "PARA-0019-S31-I02",
      "PARA-0020-S17-I03",
      "PARA-0021-S30-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": []
  },
  {
    "familyId": "GF_AMONG_GROUP",
    "name": "Among group",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Among group」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S03-I04",
      "PARA-0020-S17-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_ANOTHER_SINGULAR_COUNT_NOUN",
    "name": "Another selects one singular member of an open set",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Another selects one singular member of an open set」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S32-I02",
      "PARA-0020-S18-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_AS_MANY_AS_PLURAL_COUNT",
    "name": "As many as plural count",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「As many as plural count」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S15-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_AS_OPPOSED_TO",
    "name": "As opposed to",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「As opposed to」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S19-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_ASPECTUAL_VERB_GERUND_COMPLEMENT",
    "name": "Continue and resume select a gerund in this intransitive trend frame",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Continue and resume select a gerund in this intransitive trend frame」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S20-I02",
      "PARA-0019-S21-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_AT_AROUND_VALUE_ORDER",
    "name": "At around value order",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「At around value order」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S06-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_AT_BOTTOM_LOCATION",
    "name": "At the bottom of for a location at a container boundary",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「At the bottom of for a location at a container boundary」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S13-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_AT_NO_STAGE_DETERMINER",
    "name": "No, not none, directly determines singular stage",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「No, not none, directly determines singular stage」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S32-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_ATTRIBUTIVE_COMPOUND_HYPHENATION",
    "name": "Hyphenate a multiword attributive compound under the selected style guide",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Hyphenate a multiword attributive compound under the selected style guide」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S22-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "register_policy",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology",
      "register_policy"
    ]
  },
  {
    "familyId": "GF_ATTRIBUTIVE_DIRECTIONAL_ADJECTIVE",
    "name": "Use upward/downward as an attributive adjective, not upwards/downwards",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Use upward/downward as an attributive adjective, not upwards/downwards」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_ATTRIBUTIVE_NOUN_SINGULAR",
    "name": "Use the singular form of a count noun as a noun modifier",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Use the singular form of a count noun as a noun modifier」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S27-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_AVERAGING_APPROXIMATELY",
    "name": "Averaging approximately",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Averaging approximately」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S08-I03"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_BARE_ORDINAL_RANK",
    "name": "Rank or occupy takes a bare ordinal position without on",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "other_grammar",
    "explanationZhHant": "這個規則族處理「Rank or occupy takes a bare ordinal position without on」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S27-I04"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_BEGIN_AT_VALUE",
    "name": "Begin at value",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Begin at value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S05-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_BEHIND_DIRECT_OBJECT_NO_THAN",
    "name": "Behind direct object no than",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Behind direct object no than」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S31-I01"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_BELOW_ALL_OTHER_SERIES",
    "name": "Below all other series",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Below all other series」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S23-I04"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_BETWEEN_AND_YEARS",
    "name": "Between and years",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Between and years」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S15-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_BETWEEN_TWO_SETS",
    "name": "Between relates two explicitly delimited sets",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Between relates two explicitly delimited sets」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I01"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_BOTH_AND_COORDINATED_NOUNS",
    "name": "Both and coordinated nouns",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "conjunction",
    "explanationZhHant": "這個規則族處理「Both and coordinated nouns」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S29-I03"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_BOTH_AND_COORDINATION",
    "name": "Both coordinates with and, with shared heads expressed once",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Both coordinates with and, with shared heads expressed once」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_BOTTOM_OUT_AT",
    "name": "Bottom out at",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Bottom out at」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S22-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_BY_FUTURE_ENDPOINT",
    "name": "By future endpoint",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「By future endpoint」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S31-I04"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_BY_THE_END_OF_THE_PERIOD",
    "name": "By the end of the period",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「By the end of the period」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S03-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_CAPABLE_OF_GERUND",
    "name": "Capable of a noun or gerund",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Capable of a noun or gerund」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S11-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_CARDINAL_COUNT_NOUN_PLURAL",
    "name": "Plural count noun after a cardinal greater than one or several",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Plural count noun after a cardinal greater than one or several」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S10-I04",
      "PARA-0020-S12-I03",
      "PARA-0020-S16-I06",
      "PARA-0020-S22-I01",
      "PARA-0020-S26-I03",
      "PARA-0020-S28-I02",
      "PARA-0020-S28-I04"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_CATEGORY_RECORD_ACTIVE_FIGURE",
    "name": "Category record active figure",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Category record active figure」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S12-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_CATEGORY_SELECTION_PASSIVE_BY_AGENT",
    "name": "A category is selected by respondents; by introduces the agent",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「A category is selected by respondents; by introduces the agent」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S05-I02",
      "PARA-0020-S10-I01"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_CHANGE_ENDPOINT_TO",
    "name": "To marks the attained endpoint of a change",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「To marks the attained endpoint of a change」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S06-I02",
      "PARA-0019-S07-I01",
      "PARA-0019-S14-I03",
      "PARA-0019-S15-I02",
      "PARA-0019-S28-I04",
      "PARA-0019-S31-I03"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_CLOSE_THE_GAP_NO_UP",
    "name": "Close the gap no up",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Close the gap no up」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S29-I05"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_CLOSE_TO_EACH_OTHER",
    "name": "Close to each other",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Close to each other」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S13-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_COLLECT_FROM_SOURCE",
    "name": "Collect from a source",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Collect from a source」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S04-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_COMBINE_WITH_COTHEME",
    "name": "Combine one entity with another",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Combine one entity with another」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S12-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_COMBINED_CATEGORIES_AND_TOGETHER",
    "name": "Combined categories and together",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "parallelism",
    "explanationZhHant": "這個規則族處理「Combined categories and together」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S24-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_COMPARE_DIRECT_OBJECT_NO_BETWEEN",
    "name": "Compare direct object no between",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Compare direct object no between」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S01-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_COMPARED_WITH_SUPPLEMENT",
    "name": "Compared with introduces the intended comparison baseline",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Compared with introduces the intended comparison baseline」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S17-I03",
      "PARA-0019-S25-I02",
      "PARA-0020-S08-I02",
      "PARA-0020-S15-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_COMPLEMENTIZER_WH_EXCLUSION",
    "name": "No declarative that immediately before an embedded wh-clause",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「No declarative that immediately before an embedded wh-clause」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S01-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_CONTEXTUAL_MASS_NOUN_NUMBER",
    "name": "Contextual mass-noun number for undifferentiated substances or material",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "countability",
    "explanationZhHant": "這個規則族處理「Contextual mass-noun number for undifferentiated substances or material」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S29-I01",
      "PARA-0021-S30-I02"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_CONVERGE_NO_REFLEXIVE",
    "name": "Converge no reflexive",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Converge no reflexive」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S11-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_COORDINATE_LIST_FINAL_CONJUNCTION",
    "name": "Explicit conjunction before the final item in a prose list",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "conjunction",
    "explanationZhHant": "這個規則族處理「Explicit conjunction before the final item in a prose list」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S20-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_COORDINATED_FIGURES_AND",
    "name": "Coordinated figures and",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "conjunction",
    "explanationZhHant": "這個規則族處理「Coordinated figures and」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S12-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_COORDINATED_REFERENTS_PLURAL_NOUN",
    "name": "Use a plural head when distinct coordinated referents each supply one item",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "subject_verb_agreement",
    "explanationZhHant": "這個規則族處理「Use a plural head when distinct coordinated referents each supply one item」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I01",
      "PARA-0020-S04-I02",
      "PARA-0020-S28-I03"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_COORDINATED_SERIES_PLURAL_FIGURES",
    "name": "Coordinated series plural figures",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Coordinated series plural figures」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S26-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_COPULAR_COMPLEMENT_ADJECTIVE",
    "name": "Adjective, not manner adverb, as terminal copular complement",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Adjective, not manner adverb, as terminal copular complement」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S11-I03",
      "PARA-0019-S22-I03",
      "PARA-0021-S03-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_COUNT_NOUN_NUMBER",
    "name": "Count noun number follows the construed number of referents",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Count noun number follows the construed number of referents」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I01",
      "PARA-0020-S29-I09"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_DEFINITE_COMPARISON_REFERENT",
    "name": "Definite article for an already established comparison group or figure",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Definite article for an already established comparison group or figure」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S11-I02",
      "PARA-0020-S11-I04",
      "PARA-0020-S11-I06",
      "PARA-0020-S16-I03",
      "PARA-0020-S25-I03"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_DEFINITE_ORDER_REFERENCE",
    "name": "Definite article for the established ranking order",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "subject_verb_agreement",
    "explanationZhHant": "這個規則族處理「Definite article for the established ranking order」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S26-I06"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_DEFINITE_PROCESSED_REFERENT",
    "name": "Definite article for a previously introduced processed batch",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Definite article for a previously introduced processed batch」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S18-I01"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_DEFINITE_TOTAL_REFERENCE",
    "name": "Definite article marks the already established total used as a fraction base",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "pronoun",
    "explanationZhHant": "這個規則族處理「Definite article marks the already established total used as a fraction base」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S16-I06"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_DEFINITE_TWO_GROUPS",
    "name": "The two groups identifies a closed, previously established pair",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「The two groups identifies a closed, previously established pair」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I09"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_DEGREE_ADVERB_FORM",
    "name": "Use an adverb as a degree modifier of an adjective, comparison, or value",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Use an adverb as a degree modifier of an adjective, comparison, or value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I04",
      "PARA-0019-S06-I03",
      "PARA-0019-S18-I03",
      "PARA-0019-S19-I01",
      "PARA-0020-S11-I05",
      "PARA-0020-S16-I01",
      "PARA-0020-S23-I04"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_DEMONSTRATIVE_NOUN_NUMBER_AGREEMENT",
    "name": "Noun number agrees with this/these or that/those",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "subject_verb_agreement",
    "explanationZhHant": "這個規則族處理「Noun number agrees with this/these or that/those」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S13-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_DIFFERENT_TO_DIFFERENCE",
    "name": "Different to difference",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Different to difference」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S11-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_DOUBLE_NO_UP",
    "name": "Double no up",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Double no up」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S18-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_DOUBLE_THE_FIGURE_FOR",
    "name": "Double the figure for",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Double the figure for」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S04-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_DRAW_LEVEL_WITH",
    "name": "Draw level with",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Draw level with」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S30-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_EACH_OF_NUMERAL_SET",
    "name": "Each of numeral set",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Each of numeral set」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S01-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_EACH_SINGULAR_COUNT_NOUN",
    "name": "Singular count noun after determiner each",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Singular count noun after determiner each」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0020-S28-I01",
      "PARA-0020-S29-I06",
      "PARA-0021-S20-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_EACH_VS_EVERY_STYLE",
    "name": "Each is the selected wording for separately counted options; every may remain grammatical",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Each is the selected wording for separately counted options; every may remain grammatical」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I06"
    ],
    "requiredCapabilities": [
      "register_policy",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "register_policy"
    ]
  },
  {
    "familyId": "GF_EITHER_OF_TWO_GROUPS",
    "name": "Either of two groups",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Either of two groups」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S28-I05"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_ELLIPSIS_MENS_TOTAL",
    "name": "Ellipsis mens total",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "possessive",
    "explanationZhHant": "這個規則族處理「Ellipsis mens total」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S23-I03"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_ENDPOINT_ONE_WORD",
    "name": "Endpoint one word",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "spelling_or_spacing",
    "explanationZhHant": "這個規則族處理「Endpoint one word」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S33-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_EVENT_NOUN_AFTER_ARTICLE",
    "name": "Use a count event noun after an indefinite article",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Use a count event noun after an indefinite article」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S14-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_EXCEED_ACTIVE_DIRECT_OBJECT",
    "name": "Exceed active direct object",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Exceed active direct object」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S08-I04"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_EXPERIENCE_NOUN_SURGE",
    "name": "Experience noun surge",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Experience noun surge」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S14-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_FAIL_TEST_DIRECT_OBJECT",
    "name": "Fail takes a test as its direct object",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Fail takes a test as its direct object」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S24-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_FEWER_FOR_PLURAL_COUNT",
    "name": "Fewer quantifies plural count nouns",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Fewer quantifies plural count nouns」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S09-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_FEWER_PLURAL_COUNT_NOUN",
    "name": "Fewer plural count noun",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Fewer plural count noun」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S20-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_FEWEST_PLURAL_COUNT_NOUN",
    "name": "Fewest plural count noun",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Fewest plural count noun」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S03-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_FIGURE_FOR_SERIES",
    "name": "Figure for series",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Figure for series」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S25-I03"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_FINITE_PASSIVE_INSERT_AUXILIARY",
    "name": "Insert an agreeing be auxiliary for a finite passive predicate",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Insert an agreeing be auxiliary for a finite passive predicate」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0020-S26-I01",
      "PARA-0021-S27-I02",
      "PARA-0021-S29-I04"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_FIRST_TIME_SEQUENCE",
    "name": "First time sequence",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「First time sequence」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S30-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_FLUCTUATE_AROUND_AVERAGE",
    "name": "Fluctuate around a central average",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Fluctuate around a central average」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I04"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_FOLLOWED_BY_EVENT_NOUN",
    "name": "An event is followed by another event noun",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「An event is followed by another event noun」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S14-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_FOR_ACTION_COMPLEMENT_GERUND",
    "name": "Gerund for an action complement governed by for",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Gerund for an action complement governed by for」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S08-I02",
      "PARA-0021-S24-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_FOR_BASE_PURPOSE_TO_INFINITIVE",
    "name": "Replace for plus bare verb with a purpose infinitive",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Replace for plus bare verb with a purpose infinitive」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I03",
      "PARA-0021-S05-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_FOR_MEASURED_DURATION",
    "name": "For introduces an elapsed duration; during introduces an event",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「For introduces an elapsed duration; during introduces an event」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S10-I01",
      "PARA-0021-S15-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_FORMAL_WHETHER_PREFERENCE",
    "name": "Whether preferred for an explicit binary embedded alternative in formal prose",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "pronoun",
    "explanationZhHant": "這個規則族處理「Whether preferred for an explicit binary embedded alternative in formal prose」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S23-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "register_policy",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "register_policy"
    ]
  },
  {
    "familyId": "GF_FOURTH_PLACE_NO_THE_AFTER_OCCUPY",
    "name": "Fourth place no the after occupy",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "other_grammar",
    "explanationZhHant": "這個規則族處理「Fourth place no the after occupy」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S27-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_FRACTION_DENOMINATOR_PLURAL",
    "name": "Plural denominator in non-unit common fractions",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Plural denominator in non-unit common fractions」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S16-I05",
      "PARA-0020-S25-I01",
      "PARA-0020-S25-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_FRACTION_OF_BASE",
    "name": "A fraction selects an of-complement naming its base",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「A fraction selects an of-complement naming its base」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S16-I06"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_FRACTION_OF_TOTAL_ATTRIBUTIVE_FEMALE",
    "name": "Fraction of total attributive female",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Fraction of total attributive female」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S24-I04"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_FRONTED_NEGATIVE_INVERSION",
    "name": "Fronted negative adjunct triggers subject-auxiliary inversion",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Fronted negative adjunct triggers subject-auxiliary inversion」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S32-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_FURTHER_NOT_FURTHERMORE",
    "name": "Further not furthermore",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Further not furthermore」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S16-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_GAP_BETWEEN_AND",
    "name": "Gap between and",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Gap between and」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S17-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_GENERATED_DURING_EVENT",
    "name": "During introduces the event in which a by-product is generated",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「During introduces the event in which a by-product is generated」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S29-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_GROW_AT_AVERAGE_RATE",
    "name": "Grow at average rate",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Grow at average rate」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S12-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_HALF_NO_ARTICLE_DEFAULT",
    "name": "Half no article default",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Half no article default」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S27-I03"
    ],
    "requiredCapabilities": [
      "register_policy",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "register_policy"
    ]
  },
  {
    "familyId": "GF_HAVING_PEAKED_ACTIVE",
    "name": "Having peaked active",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Having peaked active」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S09-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_HOVER_AROUND_SINGLE_VALUE",
    "name": "Hover around single value",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Hover around single value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S16-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_IN_CATEGORY",
    "name": "In introduces a chart category as the domain of a contrast or value",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「In introduces a chart category as the domain of a contrast or value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S14-I02",
      "PARA-0020-S16-I07"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_IN_OTHER_WORDS",
    "name": "In other words",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「In other words」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S20-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_IN_RELATIVE_TERMS",
    "name": "In relative terms",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「In relative terms」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S18-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_INDEFINITE_SINGULAR_COUNT_ARTICLE",
    "name": "Use a for a newly introduced nonspecific singular count referent",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Use a for a newly introduced nonspecific singular count referent」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I04"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_INSTEAD_OF_GERUND",
    "name": "Instead of plus noun or gerund, including passive being plus participle",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Instead of plus noun or gerund, including passive being plus participle」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S30-I04"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "name": "Use men and women as irregular plurals without an added s",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Use men and women as irregular plurals without an added s」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S03-I02",
      "PARA-0020-S08-I01",
      "PARA-0020-S08-I03",
      "PARA-0020-S15-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_KNOWN_BENEFIT_THE",
    "name": "Known benefit the",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Known benefit the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S20-I03"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_KNOWN_GRAPH_THE",
    "name": "Known graph the",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Known graph the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S29-I02"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_LATTER_SECOND_OF_TWO",
    "name": "Latter second of two",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "pronoun",
    "explanationZhHant": "這個規則族處理「Latter second of two」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S27-I06"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_LEAVE_PATIENT_TO_INFINITIVE",
    "name": "Leave a patient to undergo an autonomous state change",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Leave a patient to undergo an autonomous state change」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S03-I03",
      "PARA-0021-S16-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_LESS_ADJECTIVE_NOT_FEWER",
    "name": "Less adjective not fewer",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Less adjective not fewer」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S21-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_LEVEL_AT_VALUE",
    "name": "Be level at a stated numerical value",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Be level at a stated numerical value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S11-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_MAINTAIN_DIRECT_OBJECT_COURSE",
    "name": "Maintain direct object course",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Maintain direct object course」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S10-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_MAKE_A_SELECTION",
    "name": "Make a selection",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Make a selection」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S22-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_MAKE_UP_PROPORTION",
    "name": "Make up proportion",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Make up proportion」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S16-I04"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_MALE_ADVANTAGE_CATEGORY",
    "name": "Male advantage category",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Male advantage category」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S18-I02"
    ],
    "requiredCapabilities": [
      "register_policy",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "register_policy"
    ]
  },
  {
    "familyId": "GF_MANNER_ADVERB_FORM",
    "name": "Adverb form for a manner modifier of a verb",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Adverb form for a manner modifier of a verb」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S06-I02",
      "PARA-0019-S09-I02",
      "PARA-0019-S23-I02",
      "PARA-0019-S24-I03",
      "PARA-0020-S26-I02",
      "PARA-0021-S29-I04"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_MARGIN_BY_AMOUNT",
    "name": "By introduces the size of a difference or change",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「By introduces the size of a difference or change」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S17-I02",
      "PARA-0020-S06-I03",
      "PARA-0020-S08-I05",
      "PARA-0020-S09-I04"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_MARK_WITH_INFORMATION",
    "name": "Mark an item with information",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Mark an item with information」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S25-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_MEASUREMENT_UNIT_NUMBER",
    "name": "Plural measurement unit after a non-unit number",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Plural measurement unit after a non-unit number」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S10-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_MORE_THAN_FRACTION",
    "name": "More than fraction",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「More than fraction」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S24-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_MORE_THAN_ONE_SINGULAR",
    "name": "More than one selects a singular count noun",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「More than one selects a singular count noun」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S02-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_MOTION_REALIZED_DESTINATION_TO",
    "name": "To for a realized motion destination",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「To for a realized motion destination」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S04-I02",
      "PARA-0021-S21-I02",
      "PARA-0021-S27-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_MULTIPLIER_PLURAL_TIMES",
    "name": "Multiplier plural times",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Multiplier plural times」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S20-I06"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_MULTIPLIER_THREE_TIMES_BASE",
    "name": "Multiplier three times base",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Multiplier three times base」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S16-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_NAMED_LINE_THE",
    "name": "Named line the",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Named line the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I02",
      "PARA-0019-S02-I03"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_NAMED_SERIES_POSSESSIVE_TOTAL",
    "name": "Build a possessive NP for the total belonging to a named series",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "possessive",
    "explanationZhHant": "這個規則族處理「Build a possessive NP for the total belonging to a named series」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S27-I04"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_NONE_OF_THE_SET",
    "name": "None of the set",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "pronoun",
    "explanationZhHant": "這個規則族處理「None of the set」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S34-I01"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_NONRESTRICTIVE_WHICH_NOT_THAT",
    "name": "Nonrestrictive which not that",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「Nonrestrictive which not that」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S05-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_NUMBER_OF_COUNT_PEOPLE",
    "name": "Number of, not amount of, quantifies plural countable people",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Number of, not amount of, quantifies plural countable people」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S01-I01",
      "PARA-0020-S01-I02",
      "PARA-0020-S28-I04"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_NUMERAL_ATTRIBUTIVE_NOUN_SINGULAR",
    "name": "Singular unit noun in numeral compound modifier",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Singular unit noun in numeral compound modifier」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S01-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_NUMERAL_BEFORE_COMPARATIVE",
    "name": "Numeral before comparative",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Numeral before comparative」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S23-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_NUMERAL_MORE_COUNT_NOUN_THAN",
    "name": "Numeral plus more plus count noun plus than comparison",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Numeral plus more plus count noun plus than comparison」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S06-I01",
      "PARA-0020-S13-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_OCCUPY_RANK_POSITION",
    "name": "Occupy rank position",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Occupy rank position」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S27-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_ON_AVERAGE_NO_THE",
    "name": "On average no the",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「On average no the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S28-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_ONCE_CLAUSE_REDUCTION",
    "name": "Well-formed finite or adjectival clause after once",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「Well-formed finite or adjectival clause after once」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S08-I01",
      "PARA-0021-S17-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_ONE_AND_A_HALF",
    "name": "One and a half",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "other_grammar",
    "explanationZhHant": "這個規則族處理「One and a half」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S20-I05"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_ONE_SIXTH_OF_BASE",
    "name": "One sixth of base",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「One sixth of base」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S06-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_ONLY_SINGULAR_CATEGORY_THE",
    "name": "Only singular category the",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Only singular category the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S09-I01"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_OPPOSITE_PATTERN_THE",
    "name": "Opposite pattern the",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Opposite pattern the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S07-I01"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_ORDINAL_PHRASE_DEFINITE_ARTICLE",
    "name": "A definite ranked set takes the before an ordinal phrase",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「A definite ranked set takes the before an ordinal phrase」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S26-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_OSCILLATE_BETWEEN_AND",
    "name": "Oscillate between and",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Oscillate between and」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S08-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_OUTNUMBER_PEOPLE",
    "name": "Outnumber people",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Outnumber people」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S06-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_OVER_THE_NEXT_PERIOD",
    "name": "Over the next period",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Over the next period」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S06-I01"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_OVER_THE_SAME_PERIOD",
    "name": "Over the same period",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Over the same period」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S10-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_OVERALL_NO_IN",
    "name": "Overall no in",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Overall no in」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S21-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_PACK_IN_GROUPS",
    "name": "Pack in groups of a stated size",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Pack in groups of a stated size」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S25-I04"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_PARTICIPIAL_PREMODIFIER_ATTACHMENT",
    "name": "Rewrite a heavy eventive participial premodifier as a relative clause",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "remote_review",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「Rewrite a heavy eventive participial premodifier as a relative clause」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S25-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_PASSENGERS_ON_TRANSIT_LINES",
    "name": "Passengers on transit lines",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Passengers on transit lines」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S01-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PASSIVE_BE_PAST_PARTICIPLE",
    "name": "Past participle after passive be",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Past participle after passive be」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S03-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PASSIVE_CANNOT_BE_USED",
    "name": "Passive cannot be used",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Passive cannot be used」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_PATH_ALONG_LINEAR_SUPPORT",
    "name": "Along for motion following a linear support",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Along for motion following a linear support」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S06-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PEAK_AT_VALUE",
    "name": "Peak at value",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Peak at value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S21-I04"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_PER_LINE",
    "name": "Per line",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Per line」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S28-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_PER_YEAR",
    "name": "Per year",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Per year」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S12-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_PERCENT_UNIT_FORM",
    "name": "Use per cent after a numerical value in the selected dialect",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_form",
    "explanationZhHant": "這個規則族處理「Use per cent after a numerical value in the selected dialect」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S11-I05"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_PERFECT_PASSIVE_INSERT_BEEN",
    "name": "Have been plus past participle for perfect passive",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Have been plus past participle for perfect passive」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S14-I04",
      "PARA-0021-S15-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PERIOD_FROM_TO_NOT_OVER_AND",
    "name": "Period from to not over and",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Period from to not over and」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S01-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_PLACE_ON_CONTACT_SURFACE",
    "name": "On for placement in contact with a supporting surface",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「On for placement in contact with a supporting surface」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S26-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PLATEAU_AT_VALUE",
    "name": "Plateau at value",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Plateau at value」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S15-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_POSSESSIVE_PRONOUN_NUMBER_AGREEMENT",
    "name": "Possessive pronoun agrees with its coreferent",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "remote_review",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Possessive pronoun agrees with its coreferent」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S24-I02",
      "PARA-0021-S18-I02",
      "PARA-0021-S25-I02"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_POUR_INTO_CONTAINER",
    "name": "Into for caused motion entering a container",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Into for caused motion entering a container」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S14-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PREDICTION_PASSIVE_TO_INFINITIVE",
    "name": "Series is expected, forecast, or projected to change",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Series is expected, forecast, or projected to change」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S03-I02",
      "PARA-0019-S21-I01",
      "PARA-0019-S22-I01",
      "PARA-0019-S23-I01",
      "PARA-0019-S25-I01",
      "PARA-0019-S34-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_PRESSURE_PREPOSITION_FRAME",
    "name": "Under or at a pressure, not with a pressure",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Under or at a pressure, not with a pressure」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S15-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PREVENT_FROM_GERUND",
    "name": "Prevent an entity from doing something",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Prevent an entity from doing something」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S13-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_PRIOR_TO_OR_BEFORE_GERUND",
    "name": "Prior to plus gerund, or before plus gerund",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Prior to plus gerund, or before plus gerund」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S21-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_PROCESS_BOUNDARY_WITH",
    "name": "Begin/end with a named process stage",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "other_grammar",
    "explanationZhHant": "這個規則族處理「Begin/end with a named process stage」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S02-I01",
      "PARA-0021-S02-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PROCESS_NOUN_COUNT_CONSTRUAL",
    "name": "Mass-process versus count-event article construal",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Mass-process versus count-event article construal」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S07-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_PURPOSE_TO_INFINITIVE_PREFERENCE",
    "name": "Purpose infinitive preferred over for plus gerund after an action",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Purpose infinitive preferred over for plus gerund after an action」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S14-I06"
    ],
    "requiredCapabilities": [
      "morphology",
      "register_policy",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology",
      "register_policy"
    ]
  },
  {
    "familyId": "GF_RANK_FOR_GROUP",
    "name": "For introduces the group whose ranking is stated",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "subject_verb_agreement",
    "explanationZhHant": "這個規則族處理「For introduces the group whose ranking is stated」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S26-I04",
      "PARA-0020-S26-I06",
      "PARA-0020-S27-I03",
      "PARA-0020-S27-I04"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_RANK_FOURTH_NO_THE",
    "name": "Rank fourth no the",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Rank fourth no the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S17-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_RATHER_THAN_COMPARISON",
    "name": "Rather than comparison",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "conjunction",
    "explanationZhHant": "這個規則族處理「Rather than comparison」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S02-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_RATIO_OF_A_TO_B",
    "name": "Ratio of A to B",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Ratio of A to B」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S12-I02",
      "PARA-0021-S12-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_REDUCED_RELATIVE_VOICE_FORM",
    "name": "Active present participle in a reduced relative clause",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "remote_review",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「Active present participle in a reduced relative clause」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S19-I01"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_REDUNDANT_PATH_PREPOSITION_STACK",
    "name": "Remove an incompatible path preposition before beneath",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Remove an incompatible path preposition before beneath」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S09-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_RELATIVE_HUMAN_WHO",
    "name": "Relative human who",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "pronoun",
    "explanationZhHant": "這個規則族處理「Relative human who」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S01-I03",
      "PARA-0020-S29-I05"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_RELATIVE_WHOSE_POSSESSOR",
    "name": "Whose for a possessive relative relation",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "pronoun",
    "explanationZhHant": "這個規則族處理「Whose for a possessive relative relation」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S14-I03"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_REMAIN_UNTIL_TERMINUS",
    "name": "Until marks the event terminating a continuing state",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "conjunction",
    "explanationZhHant": "這個規則族處理「Until marks the event terminating a continuing state」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S27-I01"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_REMOVE_FROM_ORIGIN",
    "name": "Remove an object from its origin or container",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Remove an object from its origin or container」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S06-I01",
      "PARA-0021-S17-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_REQUIRED_TIME_REDUCED_PASSIVE",
    "name": "Time required to perform an action",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "modal_or_auxiliary",
    "explanationZhHant": "這個規則族處理「Time required to perform an action」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S28-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_RESISTANCE_TO_FRAME",
    "name": "Resistance to a substance, force, or influence",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Resistance to a substance, force, or influence」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S23-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_RESULTATIVE_INTO_FRAME",
    "name": "Into introduces the result of material transformation",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Into introduces the result of material transformation」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S09-I01",
      "PARA-0021-S11-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_RESULTING_PARTICIPLE_MODIFIER",
    "name": "Resulting, not resulted, as an active attributive participle",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Resulting, not resulted, as an active attributive participle」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S14-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_RETURN_BACK_REDUNDANCY",
    "name": "Avoid redundant back after return in formal process prose",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Avoid redundant back after return in formal process prose」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S19-I03",
      "PARA-0021-S24-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "register_policy",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "register_policy"
    ]
  },
  {
    "familyId": "GF_RETURN_TO_PROCESS_STAGE",
    "name": "Return to a process stage",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Return to a process stage」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S24-I02",
      "PARA-0021-S30-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SCRAPE_OFF_SURFACE",
    "name": "Scrape material off a surface",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Scrape material off a surface」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S19-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SHIFT_FROM_TO",
    "name": "Shift from to",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Shift from to」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S29-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_SIZES_OF_GROUPS_COMPLEMENT",
    "name": "Sizes of the groups uses an of-complement",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Sizes of the groups uses an of-complement」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I09"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_SO_THAT_FINITE_CLAUSE",
    "name": "So that before a finite result or purpose clause",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「So that before a finite result or purpose clause」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S09-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_SPECIFIC_PERCENTAGE_THE",
    "name": "Specific percentage the",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Specific percentage the」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_STARTING_VALUE_ATTRIBUTIVE",
    "name": "Starting value attributive",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "word_form",
    "explanationZhHant": "這個規則族處理「Starting value attributive」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S33-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_STATIC_CHART_VERB_SIMPLE_PRESENT",
    "name": "Use simple present for a static chart or projection statement in Task 1",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "word_choice",
    "explanationZhHant": "這個規則族處理「Use simple present for a static chart or projection statement in Task 1」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S20-I01",
      "PARA-0020-S02-I01"
    ],
    "requiredCapabilities": [
      "register_policy",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "register_policy"
    ]
  },
  {
    "familyId": "GF_STORE_IN_INTERIOR",
    "name": "In for storage inside a building",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「In for storage inside a building」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S26-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SUBJECT_VERB_NUMBER_AGREEMENT",
    "name": "Finite verb agrees with its syntactic subject",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "subject_verb_agreement",
    "explanationZhHant": "這個規則族處理「Finite verb agrees with its syntactic subject」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S02-I01",
      "PARA-0020-S05-I01",
      "PARA-0020-S11-I03",
      "PARA-0020-S13-I01",
      "PARA-0020-S20-I04",
      "PARA-0020-S26-I05",
      "PARA-0020-S26-I06",
      "PARA-0020-S28-I03",
      "PARA-0021-S18-I03",
      "PARA-0021-S29-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse",
      "morphology"
    ]
  },
  {
    "familyId": "GF_SUBJECTED_TO_TEST_FRAME",
    "name": "Be subjected to a test or process",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Be subjected to a test or process」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S22-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "morphology",
      "semantic_roles",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SUBSTANCE_WITH_NOT_AGENT_BY",
    "name": "With for applied substance; by for agent",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「With for applied substance; by for agent」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S07-I03",
      "PARA-0021-S14-I05"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SUBSTITUTE_PRONOUN_NUMBER_AGREEMENT",
    "name": "That or those agrees with the number of the omitted head",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「That or those agrees with the number of the omitted head」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S04-I03",
      "PARA-0019-S13-I02",
      "PARA-0019-S26-I03",
      "PARA-0020-S20-I07"
    ],
    "requiredCapabilities": [
      "coreference_and_discourse",
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "coreference_and_discourse",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SUPERLATIVE_DEFINITE_ARTICLE",
    "name": "Attributive superlative normally takes the definite article",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「Attributive superlative normally takes the definite article」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S03-I03",
      "PARA-0020-S04-I02",
      "PARA-0020-S17-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_SUPPLEMENTARY_RESULT_PRESENT_PARTICIPLE",
    "name": "Present participle supplies a result supplement after a comma",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Present participle supplies a result supplement after a comma」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S10-I03",
      "PARA-0019-S23-I03",
      "PARA-0020-S10-I02"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_SURVEY_CONDUCTED_AT_OR_IN_COMPANY",
    "name": "Survey conducted at or in company",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Survey conducted at or in company」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S01-I05"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_SYNTHETIC_COMPARATIVE_NO_MORE",
    "name": "Do not combine more with a lexical -er comparative",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Do not combine more with a lexical -er comparative」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S26-I02",
      "PARA-0019-S33-I02",
      "PARA-0020-S09-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST",
    "name": "Do not combine most with an -est superlative",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Do not combine most with an -est superlative」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S03-I01",
      "PARA-0020-S04-I01",
      "PARA-0020-S14-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_TAKE_DURATION_FRAME",
    "name": "Take plus duration, optionally followed by a to-infinitive",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Take plus duration, optionally followed by a to-infinitive」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S28-I01",
      "PARA-0021-S28-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_TAKEN_AS_A_WHOLE",
    "name": "Taken as a whole",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Taken as a whole」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S29-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "dependency_parse",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_TEMPORAL_PREPOSITION_GERUND_COMPLEMENT",
    "name": "Gerund or finite clause after temporal before",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Gerund or finite clause after temporal before」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0019-S07-I01",
      "PARA-0021-S10-I03"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_THAN_NOT_THEN",
    "name": "Use comparative subordinator than, not temporal then",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Use comparative subordinator than, not temporal then」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S02-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_THE_NUMBER_OF_CONSTRUCTION",
    "name": "The number of is a singular quantified-head construction",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "subject_verb_agreement",
    "explanationZhHant": "這個規則族處理「The number of is a singular quantified-head construction」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S20-I04"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_THE_TWO_SERIES",
    "name": "The two series",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "article_or_determiner",
    "explanationZhHant": "這個規則族處理「The two series」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S11-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_THROUGHOUT_THE_FIRST_DECADE",
    "name": "Throughout the first decade",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Throughout the first decade」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S08-I02"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_TIMES_THAT_OF_NO_EXTRA_OF",
    "name": "Times that of no extra of",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Times that of no extra of」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S19-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_TOTAL_OF_QUANTITY",
    "name": "The noun total selects an of-complement containing the quantity",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「The noun total selects an of-complement containing the quantity」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S13-I01",
      "PARA-0020-S10-I03",
      "PARA-0020-S19-I01"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexeme_frames",
      "lexical_context",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "lexeme_frames"
    ]
  },
  {
    "familyId": "GF_TRIM_TO_PRODUCE_RESULT",
    "name": "Purpose/result infinitive after trimming",
    "nameZhHant": "",
    "classification": "lexical_frame",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Purpose/result infinitive after trimming」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S17-I03"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology"
    ]
  },
  {
    "familyId": "GF_TWO_GROUPS_PLURAL_SIZES",
    "name": "Two groups plural sizes",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Two groups plural sizes」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I08"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_TWO_ITEM_AND_COORDINATION",
    "name": "Use and to coordinate two parallel category names",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "singular_plural",
    "explanationZhHant": "這個規則族處理「Use and to coordinate two parallel category names」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S04-I02"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_UNTIL_COMPLETION_CLAUSE",
    "name": "Finite completion clause after until",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_review",
    "grammarCategory": "sentence_structure",
    "explanationZhHant": "這個規則族處理「Finite completion clause after until」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S16-I02"
    ],
    "requiredCapabilities": [
      "case_preservation",
      "lexical_context",
      "morphology",
      "sentence_boundaries",
      "surface_literal",
      "tokenize",
      "unicode_word_boundaries"
    ],
    "browserRuntimeSupported": true,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_VALUE_BELOW_SERIES",
    "name": "Value below series",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "comparison",
    "explanationZhHant": "這個規則族處理「Value below series」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S05-I03"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  },
  {
    "familyId": "GF_WITH_NP_PRESENT_PARTICIPLE",
    "name": "With plus NP plus present participle for an active supplement",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「With plus NP plus present participle for an active supplement」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019",
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0019-S01-I04",
      "PARA-0020-S13-I03"
    ],
    "requiredCapabilities": [
      "dependency_parse",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "dependency_parse"
    ]
  },
  {
    "familyId": "GF_WITHOUT_GERUND",
    "name": "Without gerund",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "remote_review",
    "grammarCategory": "infinitive_or_gerund",
    "explanationZhHant": "這個規則族處理「Without gerund」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S29-I07"
    ],
    "requiredCapabilities": [
      "semantic_roles",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_WOMENS_TOTAL",
    "name": "Womens total",
    "nameZhHant": "",
    "classification": "style",
    "executionPolicy": "guidance_only",
    "grammarCategory": "possessive",
    "explanationZhHant": "這個規則族處理「Womens total」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0020"
    ],
    "sourceIssueIds": [
      "PARA-0020-S23-I01"
    ],
    "requiredCapabilities": [
      "register_policy",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "register_policy"
    ]
  },
  {
    "familyId": "GF_WRAP_IN_MATERIAL",
    "name": "Wrap an item in a covering material",
    "nameZhHant": "",
    "classification": "semantic",
    "executionPolicy": "local_review",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Wrap an item in a covering material」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0021"
    ],
    "sourceIssueIds": [
      "PARA-0021-S26-I02"
    ],
    "requiredCapabilities": [
      "lexeme_frames",
      "morphology",
      "semantic_roles",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "lexeme_frames",
      "morphology",
      "semantic_roles"
    ]
  },
  {
    "familyId": "GF_YEAR_IN",
    "name": "Year in",
    "nameZhHant": "",
    "classification": "structural",
    "executionPolicy": "local_auto",
    "grammarCategory": "preposition",
    "explanationZhHant": "這個規則族處理「Year in」所描述的文法結構；執行時必須同時符合已核准的比對條件與保護條件。",
    "version": 1,
    "runtimeApprovalStatus": "not_approved",
    "sourceSetIds": [
      "SET-0019"
    ],
    "sourceIssueIds": [
      "PARA-0019-S04-I01",
      "PARA-0019-S13-I03",
      "PARA-0019-S21-I03",
      "PARA-0019-S27-I01"
    ],
    "requiredCapabilities": [
      "morphology",
      "surface_literal",
      "tokenize"
    ],
    "browserRuntimeSupported": false,
    "parserCapabilitiesMissing": [
      "morphology"
    ]
  }
].map((family) => Object.freeze({
  ...family,
  sourceSetIds: Object.freeze(family.sourceSetIds),
  sourceIssueIds: Object.freeze(family.sourceIssueIds),
  requiredCapabilities: Object.freeze(family.requiredCapabilities),
  parserCapabilitiesMissing: Object.freeze(family.parserCapabilitiesMissing)
})));

export const EXECUTABLE_GRAMMAR_PATTERNS = Object.freeze([
  {
    "patternId": "SET-0019-S01-I01-P001",
    "familyId": "GF_NUMBER_OF_COUNT_PEOPLE",
    "matcherId": "GF_NUMBER_OF_COUNT_PEOPLE_SM01",
    "sourceIssueId": "PARA-0019-S01-I01",
    "evidenceCaseId": "SET-0019-S01-I01-P001-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S01",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "plots average weekday passengers number",
    "replacementText": "plots the average number of weekday passengers",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1539,
    "conflictGroup": "GF_NUMBER_OF_COUNT_PEOPLE",
    "explanationZhHant": "number 是中心名詞，使用 the average number of + 複數可數名詞。不能直接把複數 passengers 放在 number 前。"
  },
  {
    "patternId": "SET-0019-S03-I01-P009",
    "familyId": "GF_BY_THE_END_OF_THE_PERIOD",
    "matcherId": "GF_BY_THE_END_OF_THE_PERIOD_SM01",
    "sourceIssueId": "PARA-0019-S03-I01",
    "evidenceCaseId": "SET-0019-S03-I01-P009-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S03",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "By end of period",
    "replacementText": "By the end of the period",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1416,
    "conflictGroup": "GF_BY_THE_END_OF_THE_PERIOD",
    "explanationZhHant": "固定時間結構是 by the end of the period，兩個單數名詞都由 the 限定。"
  },
  {
    "patternId": "SET-0019-S06-I03-P020",
    "familyId": "GF_DEGREE_ADVERB_FORM",
    "matcherId": "GF_DEGREE_ADVERB_FORM_SM01",
    "sourceIssueId": "PARA-0019-S06-I03",
    "evidenceCaseId": "SET-0019-S06-I03-P020-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S06",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "remained virtual unchanged",
    "replacementText": "remained virtually unchanged",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1326,
    "conflictGroup": "GF_DEGREE_ADVERB_FORM",
    "explanationZhHant": "virtually 是副詞，修飾形容詞 unchanged。virtual 不能直接作程度副詞。"
  },
  {
    "patternId": "SET-0019-S12-I02-P035",
    "familyId": "GF_GROW_AT_AVERAGE_RATE",
    "matcherId": "GF_GROW_AT_AVERAGE_RATE_SM01",
    "sourceIssueId": "PARA-0019-S12-I02",
    "evidenceCaseId": "SET-0019-S12-I02-P035-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S12",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "growing with an average speed",
    "replacementText": "growing at an average rate",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1529,
    "conflictGroup": "GF_GROW_AT_AVERAGE_RATE",
    "explanationZhHant": "數據增長速度使用 grow at an average rate。speed 較常描述實際移動速度。"
  },
  {
    "patternId": "SET-0019-S14-I01-P040",
    "familyId": "GF_EXPERIENCE_NOUN_SURGE",
    "matcherId": "GF_EXPERIENCE_NOUN_SURGE_SM01",
    "sourceIssueId": "PARA-0019-S14-I01",
    "evidenceCaseId": "SET-0019-S14-I01-P040-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S14",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "experienced to surge shortly",
    "replacementText": "experienced a short-lived surge",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1428,
    "conflictGroup": "GF_EXPERIENCE_NOUN_SURGE",
    "explanationZhHant": "experience 後面直接接名詞詞組。形容暫時的急升，用複合形容詞 short-lived 修飾 surge。"
  },
  {
    "patternId": "SET-0019-S17-I01-P048",
    "familyId": "GF_GAP_BETWEEN_AND",
    "matcherId": "GF_GAP_BETWEEN_AND_SM01",
    "sourceIssueId": "PARA-0019-S17-I01",
    "evidenceCaseId": "SET-0019-S17-I01-P048-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S17",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "gap of the highest to lowest lines",
    "replacementText": "gap between the highest and lowest lines",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1734,
    "conflictGroup": "GF_GAP_BETWEEN_AND",
    "explanationZhHant": "兩個比較項目的差距使用 gap between A and B。"
  },
  {
    "patternId": "SET-0019-S25-I01-P072",
    "familyId": "GF_PREDICTION_PASSIVE_TO_INFINITIVE",
    "matcherId": "GF_PREDICTION_PASSIVE_TO_INFINITIVE_SM01",
    "sourceIssueId": "PARA-0019-S25-I01",
    "evidenceCaseId": "SET-0019-S25-I01-P072-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S25",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "is expected adding",
    "replacementText": "is expected to add",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1318,
    "conflictGroup": "GF_PREDICTION_PASSIVE_TO_INFINITIVE",
    "explanationZhHant": "be expected 後面接 to + 動詞原形。"
  },
  {
    "patternId": "SET-0019-S26-I02-P076",
    "familyId": "GF_SYNTHETIC_COMPARATIVE_NO_MORE",
    "matcherId": "GF_SYNTHETIC_COMPARATIVE_NO_MORE_SM01",
    "sourceIssueId": "PARA-0019-S26-I02",
    "evidenceCaseId": "SET-0019-S26-I02-P076-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S26",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "more close together",
    "replacementText": "closer together",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1319,
    "conflictGroup": "GF_SYNTHETIC_COMPARATIVE_NO_MORE",
    "explanationZhHant": "短形容詞 close 通常用 -er 形成比較級：closer。"
  },
  {
    "patternId": "SET-0019-S29-I01-P086",
    "familyId": "GF_TAKEN_AS_A_WHOLE",
    "matcherId": "GF_TAKEN_AS_A_WHOLE_SM01",
    "sourceIssueId": "PARA-0019-S29-I01",
    "evidenceCaseId": "SET-0019-S29-I01-P086-EVIDENCE",
    "evidenceKind": "issue_table_phrase",
    "sentenceId": "PARA-0019-S29",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "Taking as whole",
    "replacementText": "Taken as a whole",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0019",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1315,
    "conflictGroup": "GF_TAKEN_AS_A_WHOLE",
    "explanationZhHant": "圖表是被整體考慮的對象，因此使用過去分詞 Taken；固定短語包含冠詞 a。"
  },
  {
    "patternId": "SET-0020-S02-I03-P008",
    "familyId": "GF_AFTER_MODAL_BASE_VERB",
    "matcherId": "GF_AFTER_MODAL_BASE_VERB_SM01",
    "sourceIssueId": "PARA-0020-S02-I03",
    "evidenceCaseId": "SET-0020-S02-I03-P008-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S02",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "could chose",
    "replacementText": "could choose",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1211,
    "conflictGroup": "GF_AFTER_MODAL_BASE_VERB",
    "explanationZhHant": "could 後面使用動詞原形 choose，不用過去式 chose。"
  },
  {
    "patternId": "SET-0020-S03-I01-P011",
    "familyId": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST",
    "matcherId": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST_SM01",
    "sourceIssueId": "PARA-0020-S03-I01",
    "evidenceCaseId": "SET-0020-S03-I01-P011-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S03",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "the most highest",
    "replacementText": "the highest",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1316,
    "conflictGroup": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST",
    "explanationZhHant": "highest 已是最高級，不再加入 most。"
  },
  {
    "patternId": "SET-0020-S03-I03-P013",
    "familyId": "GF_SUPERLATIVE_DEFINITE_ARTICLE",
    "matcherId": "GF_SUPERLATIVE_DEFINITE_ARTICLE_SM01",
    "sourceIssueId": "PARA-0020-S03-I03",
    "evidenceCaseId": "SET-0020-S03-I03-P013-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S03",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "was most popular choice",
    "replacementText": "was the most popular choice",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1423,
    "conflictGroup": "GF_SUPERLATIVE_DEFINITE_ARTICLE",
    "explanationZhHant": "最高級通常由 the 限定。"
  },
  {
    "patternId": "SET-0020-S04-I01-P015",
    "familyId": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST",
    "matcherId": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST_SM01",
    "sourceIssueId": "PARA-0020-S04-I01",
    "evidenceCaseId": "SET-0020-S04-I01-P015-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S04",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "the most widest",
    "replacementText": "the widest",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1315,
    "conflictGroup": "GF_SYNTHETIC_SUPERLATIVE_NO_MOST",
    "explanationZhHant": "widest 已含最高級意思，不使用 most widest。"
  },
  {
    "patternId": "SET-0020-S08-I01-P028",
    "familyId": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "matcherId": "GF_IRREGULAR_MAN_WOMAN_PLURAL_SM01",
    "sourceIssueId": "PARA-0020-S08-I01",
    "evidenceCaseId": "SET-0020-S08-I01-P028-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S08",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "mens, comparing",
    "replacementText": "men, compared",
    "acceptableAlternatives": [],
    "leftContext": [
      "410"
    ],
    "rightContext": [
      "with"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1215,
    "conflictGroup": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "explanationZhHant": "man 的複數是 men，不再加 s。"
  },
  {
    "patternId": "SET-0020-S08-I03-P030",
    "familyId": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "matcherId": "GF_IRREGULAR_MAN_WOMAN_PLURAL_SM01",
    "sourceIssueId": "PARA-0020-S08-I03",
    "evidenceCaseId": "SET-0020-S08-I03-P030-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S08",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "womens",
    "replacementText": "women",
    "acceptableAlternatives": [],
    "leftContext": [
      "390"
    ],
    "rightContext": [
      "so"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1106,
    "conflictGroup": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "explanationZhHant": "women 已是複數形式，不加 s。"
  },
  {
    "patternId": "SET-0020-S08-I04-P031",
    "familyId": "GF_EXCEED_ACTIVE_DIRECT_OBJECT",
    "matcherId": "GF_EXCEED_ACTIVE_DIRECT_OBJECT_SM01",
    "sourceIssueId": "PARA-0020-S08-I04",
    "evidenceCaseId": "SET-0020-S08-I04-P031-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S08",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "was exceeded the female figure",
    "replacementText": "exceeded the female figure",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1530,
    "conflictGroup": "GF_EXCEED_ACTIVE_DIRECT_OBJECT",
    "explanationZhHant": "主語是 the male figure，它主動超過 female figure，因此不用被動助動詞 was。"
  },
  {
    "patternId": "SET-0020-S10-I04-P041",
    "familyId": "GF_CARDINAL_COUNT_NOUN_PLURAL",
    "matcherId": "GF_CARDINAL_COUNT_NOUN_PLURAL_SM01",
    "sourceIssueId": "PARA-0020-S10-I04",
    "evidenceCaseId": "SET-0020-S10-I04-P041-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S10",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "560 selection",
    "replacementText": "560 selections",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1213,
    "conflictGroup": "GF_CARDINAL_COUNT_NOUN_PLURAL",
    "explanationZhHant": "大於一的數字後使用複數可數名詞。"
  },
  {
    "patternId": "SET-0020-S11-I05-P049",
    "familyId": "GF_PERCENT_UNIT_FORM",
    "matcherId": "GF_PERCENT_UNIT_FORM_SM01",
    "sourceIssueId": "PARA-0020-S11-I05",
    "evidenceCaseId": "SET-0020-S11-I05-P049-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S11",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "percentage",
    "replacementText": "per cent",
    "acceptableAlternatives": [],
    "leftContext": [
      "15"
    ],
    "rightContext": [
      "higher"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1110,
    "conflictGroup": "GF_PERCENT_UNIT_FORM",
    "explanationZhHant": "修飾數字用副詞 approximately；數字後的比例單位使用不變形式 per cent。"
  },
  {
    "patternId": "SET-0020-S12-I01-P051",
    "familyId": "GF_CATEGORY_RECORD_ACTIVE_FIGURE",
    "matcherId": "GF_CATEGORY_RECORD_ACTIVE_FIGURE_SM01",
    "sourceIssueId": "PARA-0020-S12-I01",
    "evidenceCaseId": "SET-0020-S12-I01-P051-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S12",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "was recorded 340 male selections",
    "replacementText": "recorded 340 male selections",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1532,
    "conflictGroup": "GF_CATEGORY_RECORD_ACTIVE_FIGURE",
    "explanationZhHant": "在圖表描述中，某類別可主動「錄得」一個數值：Private insurance recorded...。被動式需要改換主語。"
  },
  {
    "patternId": "SET-0020-S12-I03-P054",
    "familyId": "GF_CARDINAL_COUNT_NOUN_PLURAL",
    "matcherId": "GF_CARDINAL_COUNT_NOUN_PLURAL_SM01",
    "sourceIssueId": "PARA-0020-S12-I03",
    "evidenceCaseId": "SET-0020-S12-I03-P054-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S12",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "310 female selection",
    "replacementText": "310 female selections",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1320,
    "conflictGroup": "GF_CARDINAL_COUNT_NOUN_PLURAL",
    "explanationZhHant": "數字 310 後面用複數。"
  },
  {
    "patternId": "SET-0020-S13-I01-P055",
    "familyId": "GF_DEMONSTRATIVE_NOUN_NUMBER_AGREEMENT",
    "matcherId": "GF_DEMONSTRATIVE_NOUN_NUMBER_AGREEMENT_SM01",
    "sourceIssueId": "PARA-0020-S13-I01",
    "evidenceCaseId": "SET-0020-S13-I01-P055-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S13",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "figure was",
    "replacementText": "figures were",
    "acceptableAlternatives": [],
    "leftContext": [
      "these"
    ],
    "rightContext": [
      "close"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1210,
    "conflictGroup": "GF_DEMONSTRATIVE_NOUN_NUMBER_AGREEMENT",
    "explanationZhHant": "these 後面接複數名詞，並配合複數動詞 were。"
  },
  {
    "patternId": "SET-0020-S15-I03-P066",
    "familyId": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "matcherId": "GF_IRREGULAR_MAN_WOMAN_PLURAL_SM01",
    "sourceIssueId": "PARA-0020-S15-I03",
    "evidenceCaseId": "SET-0020-S15-I03-P066-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S15",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "90 man",
    "replacementText": "90 men",
    "acceptableAlternatives": [],
    "leftContext": [
      "only"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1206,
    "conflictGroup": "GF_IRREGULAR_MAN_WOMAN_PLURAL",
    "explanationZhHant": "數字 90 後使用複數 men。"
  },
  {
    "patternId": "SET-0020-S16-I01-P067",
    "familyId": "GF_DEGREE_ADVERB_FORM",
    "matcherId": "GF_DEGREE_ADVERB_FORM_SM01",
    "sourceIssueId": "PARA-0020-S16-I01",
    "evidenceCaseId": "SET-0020-S16-I01-P067-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S16",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "slight more than",
    "replacementText": "slightly more than",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1316,
    "conflictGroup": "GF_DEGREE_ADVERB_FORM",
    "explanationZhHant": "修飾比較短語 more than 要使用副詞 slightly。"
  },
  {
    "patternId": "SET-0020-S17-I01-P074",
    "familyId": "GF_SUPERLATIVE_DEFINITE_ARTICLE",
    "matcherId": "GF_SUPERLATIVE_DEFINITE_ARTICLE_SM01",
    "sourceIssueId": "PARA-0020-S17-I01",
    "evidenceCaseId": "SET-0020-S17-I01-P074-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S17",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "was also least popular option",
    "replacementText": "was also the least popular option",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1529,
    "conflictGroup": "GF_SUPERLATIVE_DEFINITE_ARTICLE",
    "explanationZhHant": "最高級前使用 the。"
  },
  {
    "patternId": "SET-0020-S17-I03-P076",
    "familyId": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL",
    "matcherId": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL_SM01",
    "sourceIssueId": "PARA-0020-S17-I03",
    "evidenceCaseId": "SET-0020-S17-I03-P076-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S17",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "despite it ranked",
    "replacementText": "although it ranked",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1317,
    "conflictGroup": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL",
    "explanationZhHant": "although 後面接完整分句；despite 後面接名詞或動名詞。"
  },
  {
    "patternId": "SET-0020-S19-I01-P081",
    "familyId": "GF_TOTAL_OF_QUANTITY",
    "matcherId": "GF_TOTAL_OF_QUANTITY_SM01",
    "sourceIssueId": "PARA-0020-S19-I01",
    "evidenceCaseId": "SET-0020-S19-I01-P081-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S19",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "A total 250 men",
    "replacementText": "A total of 250 men",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": true,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1415,
    "conflictGroup": "GF_TOTAL_OF_QUANTITY",
    "explanationZhHant": "固定數量結構是 a total of + 數字 + 名詞。"
  },
  {
    "patternId": "SET-0020-S20-I01-P083",
    "familyId": "GF_IN_OTHER_WORDS",
    "matcherId": "GF_IN_OTHER_WORDS_SM01",
    "sourceIssueId": "PARA-0020-S20-I01",
    "evidenceCaseId": "SET-0020-S20-I01-P083-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S20",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "In another words",
    "replacementText": "In other words",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": true,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1316,
    "conflictGroup": "GF_IN_OTHER_WORDS",
    "explanationZhHant": "固定連接語是複數 in other words。"
  },
  {
    "patternId": "SET-0020-S20-I02-P084",
    "familyId": "GF_FEWER_PLURAL_COUNT_NOUN",
    "matcherId": "GF_FEWER_PLURAL_COUNT_NOUN_SM01",
    "sourceIssueId": "PARA-0020-S20-I02",
    "evidenceCaseId": "SET-0020-S20-I02-P084-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S20",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "80 less women",
    "replacementText": "80 fewer women",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1313,
    "conflictGroup": "GF_FEWER_PLURAL_COUNT_NOUN",
    "explanationZhHant": "women 是可數名詞複數，所以用 fewer。"
  },
  {
    "patternId": "SET-0020-S22-I02-P095",
    "familyId": "GF_MAKE_A_SELECTION",
    "matcherId": "GF_MAKE_A_SELECTION_SM01",
    "sourceIssueId": "PARA-0020-S22-I02",
    "evidenceCaseId": "SET-0020-S22-I02-P095-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S22",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "women did 1,830 selections",
    "replacementText": "women made 1,830 selections",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1526,
    "conflictGroup": "GF_MAKE_A_SELECTION",
    "explanationZhHant": "固定搭配是 make a selection／make selections，不用 do selections。"
  },
  {
    "patternId": "SET-0020-S23-I04-P101",
    "familyId": "GF_DEGREE_ADVERB_FORM",
    "matcherId": "GF_DEGREE_ADVERB_FORM_SM01",
    "sourceIssueId": "PARA-0020-S23-I04",
    "evidenceCaseId": "SET-0020-S23-I04-P101-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S23",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "broad comparable",
    "replacementText": "broadly comparable",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1216,
    "conflictGroup": "GF_DEGREE_ADVERB_FORM",
    "explanationZhHant": "修飾形容詞 comparable 使用副詞 broadly。"
  },
  {
    "patternId": "SET-0020-S24-I02-P105",
    "familyId": "GF_ACCOUNT_FOR_PROPORTION",
    "matcherId": "GF_ACCOUNT_FOR_PROPORTION_SM01",
    "sourceIssueId": "PARA-0020-S24-I02",
    "evidenceCaseId": "SET-0020-S24-I02-P105-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S24",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "more",
    "replacementText": "for more",
    "acceptableAlternatives": [],
    "leftContext": [
      "accounted"
    ],
    "rightContext": [
      "one"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1104,
    "conflictGroup": "GF_ACCOUNT_FOR_PROPORTION",
    "explanationZhHant": "account for 表示構成某個比例。"
  },
  {
    "patternId": "SET-0020-S28-I01-P133",
    "familyId": "GF_EACH_SINGULAR_COUNT_NOUN",
    "matcherId": "GF_EACH_SINGULAR_COUNT_NOUN_SM01",
    "sourceIssueId": "PARA-0020-S28-I01",
    "evidenceCaseId": "SET-0020-S28-I01-P133-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S28",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "every employees",
    "replacementText": "each employee",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1215,
    "conflictGroup": "GF_EACH_SINGULAR_COUNT_NOUN",
    "explanationZhHant": "each 和 every 後面都接單數名詞。目標使用 each employee，強調每人可作多項選擇。"
  },
  {
    "patternId": "SET-0020-S29-I09-P149",
    "familyId": "GF_SIZES_OF_GROUPS_COMPLEMENT",
    "matcherId": "GF_SIZES_OF_GROUPS_COMPLEMENT_SM01",
    "sourceIssueId": "PARA-0020-S29-I09",
    "evidenceCaseId": "SET-0020-S29-I09-P149-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0020-S29",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "size for both group.",
    "replacementText": "sizes of the two groups.",
    "acceptableAlternatives": [],
    "leftContext": [
      "the"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0020",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1420,
    "conflictGroup": "GF_SIZES_OF_GROUPS_COMPLEMENT",
    "explanationZhHant": "名詞 sizes 用 of 引出所屬群組；已明確是兩組，因此使用 the two groups。"
  },
  {
    "patternId": "SET-0021-S01-I02-P002",
    "familyId": "GF_NUMERAL_ATTRIBUTIVE_NOUN_SINGULAR",
    "matcherId": "GF_NUMERAL_ATTRIBUTIVE_NOUN_SINGULAR_SM01",
    "sourceIssueId": "PARA-0021-S01-I02",
    "evidenceCaseId": "SET-0021-S01-I02-P002-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S01",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "twelve-stages",
    "replacementText": "twelve-stage",
    "acceptableAlternatives": [],
    "leftContext": [
      "a"
    ],
    "rightContext": [
      "linear"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1113,
    "conflictGroup": "GF_NUMERAL_ATTRIBUTIVE_NOUN_SINGULAR",
    "explanationZhHant": "數字和名詞共同放在另一名詞前作修飾語時，名詞保持單數：a twelve-stage process。"
  },
  {
    "patternId": "SET-0021-S02-I01-P003",
    "familyId": "GF_PROCESS_BOUNDARY_WITH",
    "matcherId": "GF_PROCESS_BOUNDARY_WITH_SM01",
    "sourceIssueId": "PARA-0021-S02-I01",
    "evidenceCaseId": "SET-0021-S02-I01-P003-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S02",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "from collecting",
    "replacementText": "with the collection",
    "acceptableAlternatives": [],
    "leftContext": [
      "begins"
    ],
    "rightContext": [
      "and"
    ],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1215,
    "conflictGroup": "GF_PROCESS_BOUNDARY_WITH",
    "explanationZhHant": "描述程序的第一個階段，常用 begin with + 名詞／動名詞。begin from 通常引出時間或空間起點。"
  },
  {
    "patternId": "SET-0021-S04-I01-P010",
    "familyId": "GF_COLLECT_FROM_SOURCE",
    "matcherId": "GF_COLLECT_FROM_SOURCE_SM01",
    "sourceIssueId": "PARA-0021-S04-I01",
    "evidenceCaseId": "SET-0021-S04-I01-P010-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S04",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "collected out of households",
    "replacementText": "collected from households",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1427,
    "conflictGroup": "GF_COLLECT_FROM_SOURCE",
    "explanationZhHant": "表示物品的來源，用 collect from + 地點／人。out of 強調從內部移出。"
  },
  {
    "patternId": "SET-0021-S05-I01-P012",
    "familyId": "GF_FOR_BASE_PURPOSE_TO_INFINITIVE",
    "matcherId": "GF_FOR_BASE_PURPOSE_TO_INFINITIVE_SM01",
    "sourceIssueId": "PARA-0021-S05-I01",
    "evidenceCaseId": "SET-0021-S05-I01-P012-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S05",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "inspected for determine",
    "replacementText": "inspected to determine",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1323,
    "conflictGroup": "GF_FOR_BASE_PURPOSE_TO_INFINITIVE",
    "explanationZhHant": "表示檢查的目的，用 to + 動詞原形：inspected to determine...。"
  },
  {
    "patternId": "SET-0021-S08-I02-P019",
    "familyId": "GF_FOR_ACTION_COMPLEMENT_GERUND",
    "matcherId": "GF_FOR_ACTION_COMPLEMENT_GERUND_SM01",
    "sourceIssueId": "PARA-0021-S08-I02",
    "evidenceCaseId": "SET-0021-S08-I02-P019-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S08",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "sent for shred",
    "replacementText": "sent for shredding",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1314,
    "conflictGroup": "GF_FOR_ACTION_COMPLEMENT_GERUND",
    "explanationZhHant": "for 是介詞，後面的動作用動名詞：sent for shredding。另一個正確寫法是 sent to be shredded。"
  },
  {
    "patternId": "SET-0021-S09-I03-P022",
    "familyId": "GF_SO_THAT_FINITE_CLAUSE",
    "matcherId": "GF_SO_THAT_FINITE_CLAUSE_SM01",
    "sourceIssueId": "PARA-0021-S09-I03",
    "evidenceCaseId": "SET-0021-S09-I03-P022-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S09",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "so as any metal fragments can be extracted",
    "replacementText": "so that any metal fragments can be extracted",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1842,
    "conflictGroup": "GF_SO_THAT_FINITE_CLAUSE",
    "explanationZhHant": "後面是完整分句，使用 so that + 主語 + 動詞。so as to 後面則接動詞原形。"
  },
  {
    "patternId": "SET-0021-S10-I03-P025",
    "familyId": "GF_TEMPORAL_PREPOSITION_GERUND_COMPLEMENT",
    "matcherId": "GF_TEMPORAL_PREPOSITION_GERUND_COMPLEMENT_SM01",
    "sourceIssueId": "PARA-0021-S10-I03",
    "evidenceCaseId": "SET-0021-S10-I03-P025-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S10",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "before to enter",
    "replacementText": "before entering",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1315,
    "conflictGroup": "GF_TEMPORAL_PREPOSITION_GERUND_COMPLEMENT",
    "explanationZhHant": "before 作介詞時，後面的動作用動名詞。也可寫完整分句 before they enter。"
  },
  {
    "patternId": "SET-0021-S11-I01-P026",
    "familyId": "GF_CAPABLE_OF_GERUND",
    "matcherId": "GF_CAPABLE_OF_GERUND_SM01",
    "sourceIssueId": "PARA-0021-S11-I01",
    "evidenceCaseId": "SET-0021-S11-I01-P026-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S11",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "capable to reach",
    "replacementText": "capable of reaching",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1316,
    "conflictGroup": "GF_CAPABLE_OF_GERUND",
    "explanationZhHant": "固定結構是 capable of + 名詞／動名詞。"
  },
  {
    "patternId": "SET-0021-S12-I01-P028",
    "familyId": "GF_COMBINE_WITH_COTHEME",
    "matcherId": "GF_COMBINE_WITH_COTHEME_SM01",
    "sourceIssueId": "PARA-0021-S12-I01",
    "evidenceCaseId": "SET-0021-S12-I01-P028-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S12",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "combined to recycled sand",
    "replacementText": "combined with recycled sand",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1425,
    "conflictGroup": "GF_COMBINE_WITH_COTHEME",
    "explanationZhHant": "表示兩種材料混合，用 combine A with B。被動式為 A is combined with B。"
  },
  {
    "patternId": "SET-0021-S14-I01-P033",
    "familyId": "GF_RESULTING_PARTICIPLE_MODIFIER",
    "matcherId": "GF_RESULTING_PARTICIPLE_MODIFIER_SM01",
    "sourceIssueId": "PARA-0021-S14-I01",
    "evidenceCaseId": "SET-0021-S14-I01-P033-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S14",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "The resulted mixture",
    "replacementText": "The resulting mixture",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": true,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1320,
    "conflictGroup": "GF_RESULTING_PARTICIPLE_MODIFIER",
    "explanationZhHant": "resulting 表示「由前一步產生的」。resulted 通常不直接作這種前置形容詞。"
  },
  {
    "patternId": "SET-0021-S16-I02-P045",
    "familyId": "GF_UNTIL_COMPLETION_CLAUSE",
    "matcherId": "GF_UNTIL_COMPLETION_CLAUSE_SM01",
    "sourceIssueId": "PARA-0021-S16-I02",
    "evidenceCaseId": "SET-0021-S16-I02-P045-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S16",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "solidifying.",
    "replacementText": "solidified.",
    "acceptableAlternatives": [],
    "leftContext": [
      "completely"
    ],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1112,
    "conflictGroup": "GF_UNTIL_COMPLETION_CLAUSE",
    "explanationZhHant": "until 後需要完整分句，或合適的非限定結構。現在完成式強調完全凝固後才進入下一階段。"
  },
  {
    "patternId": "SET-0021-S17-I02-P047",
    "familyId": "GF_REMOVE_FROM_ORIGIN",
    "matcherId": "GF_REMOVE_FROM_ORIGIN_SM01",
    "sourceIssueId": "PARA-0021-S17-I02",
    "evidenceCaseId": "SET-0021-S17-I02-P047-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S17",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "removed out from the moulds",
    "replacementText": "removed from the moulds",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1527,
    "conflictGroup": "GF_REMOVE_FROM_ORIGIN",
    "explanationZhHant": "remove A from B 已完整表示把物件從容器取出，不加入 out。"
  },
  {
    "patternId": "SET-0021-S18-I03-P051",
    "familyId": "GF_SUBJECT_VERB_NUMBER_AGREEMENT",
    "matcherId": "GF_SUBJECT_VERB_NUMBER_AGREEMENT_SM01",
    "sourceIssueId": "PARA-0021-S18-I03",
    "evidenceCaseId": "SET-0021-S18-I03-P051-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S18",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "any batch that remain",
    "replacementText": "any batch that remains",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1421,
    "conflictGroup": "GF_SUBJECT_VERB_NUMBER_AGREEMENT",
    "explanationZhHant": "that 指回單數 batch，一般現在式用 remains。"
  },
  {
    "patternId": "SET-0021-S20-I01-P055",
    "familyId": "GF_COORDINATE_LIST_FINAL_CONJUNCTION",
    "matcherId": "GF_COORDINATE_LIST_FINAL_CONJUNCTION_SM01",
    "sourceIssueId": "PARA-0021-S20-I01",
    "evidenceCaseId": "SET-0021-S20-I01-P055-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S20",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "temperature, pressure, as well processing time",
    "replacementText": "temperature, pressure and processing time",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1646,
    "conflictGroup": "GF_COORDINATE_LIST_FINAL_CONJUNCTION",
    "explanationZhHant": "三項並列時，最後一項前用 and。若使用 as well as，必須完整寫出。"
  },
  {
    "patternId": "SET-0021-S20-I02-P056",
    "familyId": "GF_EACH_SINGULAR_COUNT_NOUN",
    "matcherId": "GF_EACH_SINGULAR_COUNT_NOUN_SM01",
    "sourceIssueId": "PARA-0021-S20-I02",
    "evidenceCaseId": "SET-0021-S20-I02-P056-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S20",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "each batches",
    "replacementText": "each batch",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1212,
    "conflictGroup": "GF_EACH_SINGULAR_COUNT_NOUN",
    "explanationZhHant": "each 後面接單數可數名詞。"
  },
  {
    "patternId": "SET-0021-S22-I01-P060",
    "familyId": "GF_SUBJECTED_TO_TEST_FRAME",
    "matcherId": "GF_SUBJECTED_TO_TEST_FRAME_SM01",
    "sourceIssueId": "PARA-0021-S22-I01",
    "evidenceCaseId": "SET-0021-S22-I01-P060-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S22",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "is subsequently subject for",
    "replacementText": "is subsequently subjected to",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1427,
    "conflictGroup": "GF_SUBJECTED_TO_TEST_FRAME",
    "explanationZhHant": "表示物件接受測試，用動詞被動結構 be subjected to。be subject to 也可表示受某條件支配，但不用 for。"
  },
  {
    "patternId": "SET-0021-S24-I02-P065",
    "familyId": "GF_RETURN_TO_PROCESS_STAGE",
    "matcherId": "GF_RETURN_TO_PROCESS_STAGE_SM01",
    "sourceIssueId": "PARA-0021-S24-I02",
    "evidenceCaseId": "SET-0021-S24-I02-P065-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S24",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "is returned back into the melting stage",
    "replacementText": "is returned to the melting stage",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1739,
    "conflictGroup": "GF_RETURN_TO_PROCESS_STAGE",
    "explanationZhHant": "return to + 階段／地點；return 已包含返回意思，且不使用 into 表示程序階段。"
  },
  {
    "patternId": "SET-0021-S28-I03-P082",
    "familyId": "GF_REQUIRED_TIME_REDUCED_PASSIVE",
    "matcherId": "GF_REQUIRED_TIME_REDUCED_PASSIVE_SM01",
    "sourceIssueId": "PARA-0021-S28-I03",
    "evidenceCaseId": "SET-0021-S28-I03-P082-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S28",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "the time requiring for collecting",
    "replacementText": "the time required to collect",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1533,
    "conflictGroup": "GF_REQUIRED_TIME_REDUCED_PASSIVE",
    "explanationZhHant": "time 是收集瓶子所需要的時間，所以用過去分詞 required；其後接目的不定詞 to collect。"
  },
  {
    "patternId": "SET-0021-S29-I04-P088",
    "familyId": "GF_FINITE_PASSIVE_INSERT_AUXILIARY",
    "matcherId": "GF_FINITE_PASSIVE_INSERT_AUXILIARY_SM01",
    "sourceIssueId": "PARA-0021-S29-I04",
    "evidenceCaseId": "SET-0021-S29-I04-P088-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S29",
    "matcherType": "surface_literal",
    "executionPolicy": "local_review",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "damaged moulds repair separate",
    "replacementText": "damaged moulds are repaired separately",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": true,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.975,
    "priority": 1430,
    "conflictGroup": "GF_FINITE_PASSIVE_INSERT_AUXILIARY",
    "explanationZhHant": "moulds 是被維修的物件，需要被動語態；修飾動作 repaired 使用副詞 separately。"
  },
  {
    "patternId": "SET-0021-S30-I01-P089",
    "familyId": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL",
    "matcherId": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL_SM01",
    "sourceIssueId": "PARA-0021-S30-I01",
    "evidenceCaseId": "SET-0021-S30-I01-P089-EVIDENCE",
    "evidenceKind": "full_sentence",
    "sentenceId": "PARA-0021-S30",
    "matcherType": "surface_literal",
    "executionPolicy": "local_auto",
    "runtimeEligible": true,
    "runtimeApprovalStatus": "approved_for_bounded_surface_runtime",
    "matchText": "despite the procedure is linear",
    "replacementText": "although the procedure is linear",
    "acceptableAlternatives": [],
    "leftContext": [],
    "rightContext": [],
    "startsSentence": false,
    "endsSentence": false,
    "evidenceSetId": "SET-0021",
    "partition": "development",
    "requiredCapabilities": [
      "tokenize",
      "surface_literal",
      "unicode_word_boundaries",
      "sentence_boundaries",
      "lexical_context",
      "case_preservation"
    ],
    "confidence": 0.995,
    "priority": 1531,
    "conflictGroup": "GF_ALTHOUGH_FINITE_VS_DESPITE_NOMINAL",
    "explanationZhHant": "although 後面接完整分句。despite 後面接名詞或動名詞，例如 despite the procedure being linear。"
  }
].map((pattern) => Object.freeze({
  ...pattern,
  acceptableAlternatives: Object.freeze(pattern.acceptableAlternatives),
  leftContext: Object.freeze(pattern.leftContext),
  rightContext: Object.freeze(pattern.rightContext),
  requiredCapabilities: Object.freeze(pattern.requiredCapabilities)
})));
