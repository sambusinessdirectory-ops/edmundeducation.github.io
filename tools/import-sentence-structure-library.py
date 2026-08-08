#!/usr/bin/env python3
"""Import the 70 Sentence Structure PDFs numbered 275-343.

The published Sentence Structure corpus already ends at ``ss275`` but that
lesson comes from source PDF 274.  This batch therefore maps its 70 physical
files, in stable source-number/filename order, to ``ss276`` through ``ss345``.
The two distinct source PDFs numbered 310 are deliberately retained.

The exercise/answer parser is shared with
``extract-sentence-structure-question-data.py``.  This importer adds the
lesson-level teaching material, source hashes and permanent system mapping,
then writes canonical JSON fragments plus a reproducible manifest.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import pdfplumber


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_SOURCE_DIR = Path.home() / "Desktop" / "Sentence Structures more"
DEFAULT_LESSON_DIR = SCRIPT_DIR / "sentence-structure-lessons"
DEFAULT_MANIFEST = SCRIPT_DIR / "sentence-structure-import-manifest-275-343.json"
FIRST_SOURCE_NUMBER = 275
LAST_SOURCE_NUMBER = 343
FIRST_SYSTEM_ORDER = 276
EXPECTED_FILES = 70
EXPECTED_QUESTIONS_PER_LESSON = 50
QUALITY_ISSUES: list[str] = []

CHINESE = re.compile(r"[\u3400-\u9fff]")
SOURCE_NUMBER = re.compile(r"(\d+)")
SECTION_NUMBER = re.compile(r"^(\d{1,2})[.．]\s*(\S.*)$")
EXERCISE_HEADING = re.compile(r"^Exercise\s+練習$", re.IGNORECASE)
ANSWER_HEADING = re.compile(r"^Answer\s*Key\s+參考答案$", re.IGNORECASE)
TARGET_HEADING = re.compile(r"^(?:Target Structure\s*)?目標句型$|^Target Structure\s+目標句型$", re.IGNORECASE)
RULES_HEADING = re.compile(r"^Important Rules(?:\s+重要規則)?$|^重要規則$", re.IGNORECASE)
BENEFITS_HEADING = re.compile(r"^Benefits(?:\s+(?:句型好處|學習好處|表達好處))?$", re.IGNORECASE)
DISPLAY_HEADING = re.compile(
    r"^(?:Target Structure|Core (?:Expression|Structure|Formula|Grammar Bank)|"
    r"Main (?:Grammar Bank|Example)|Best Core Grammar Bank|Important Rules|Benefits|"
    r"Meaning|Communicative Function|Example|Examples|Exercise|Answer Key)\b",
    re.IGNORECASE,
)

# Very long final numbered rules sometimes contain an appended grammar bank or
# comparison section.  Those sections are source material, but presenting the
# whole block as one teaching card makes the English secondary text dwarf its
# Chinese counterpart.  Semantic headings let the importer retain every line
# while publishing a sequence of readable cards.  The 950-character packing
# target leaves room below the hard 1,000-character quality ceiling.
SEMANTIC_SUBHEADING = re.compile(
    r"^(?:(?:Best\s+)?Core\b|Related Structures\b|Differences? from\b|Comparison\b|"
    r"(?:Pattern|Position|Shell|Structure)\s+\d+\b|[A-Z]\.\s+|\d{1,2}[.．]\s+)",
    re.IGNORECASE,
)
TEACHING_CARD_ENGLISH_TARGET = 950
TEACHING_CARD_ENGLISH_LIMIT = 1000

# Ratio exceptions, if ever needed, must be explicit card IDs with a reviewed
# reason.  The current corpus deliberately ships with no exceptions: every
# prose-heavy card meets the Chinese/English completeness ratio.
BILINGUAL_RATIO_EXCEPTIONS: dict[str, str] = {}

# Only known accidental duplicate source sentences are removed.  This narrow
# allowlist deliberately preserves repeated wording used as a correct/incorrect
# contrast or to compare two different grammatical structures.
DEDUPLICATE_SOURCE_LINES = {
    "ss280-rule-08": {
        "Three departments were affected—namely, sales, finance and operations.",
        "The policy has two aims: namely, to reduce waste and to lower costs.",
    },
    "ss306-benefit-01": {"The service is closing."},
    "ss318-rule-06": {"For what it is worth, I think the plan is sensible."},
    "ss322-rule-07": {
        "（火車很可能會誤點。）",
        "（價格很可能會上升。）",
    },
}
DEDUPLICATE_OUTPUT_SENTENCES = {
    ("ss306-benefit-01", "en"): {"The service is closing."},
    ("ss306-benefit-01", "zh"): {"這項服務即將停止。"},
}

# These source examples are intentionally printed again inside a later grammar
# bank, but the same lesson already presents them in a dedicated teaching card.
# Omit only the later UI copies so the learner sees each model sentence once.
OMIT_LATER_OUTPUT_SENTENCES = {
    ("ss280-rule-08", "en"): {
        "Three departments were affected—namely, sales, finance and operations.",
        "The policy has two aims: namely, to reduce waste and to lower costs.",
    },
    ("ss280-rule-08", "zh"): {
        "三個部門受到影響，即銷售部、財務部和營運部。",
        "政策有兩個目標，即減少浪費和降低成本。",
    },
}

# A source line can contain a complete English explanation followed immediately
# by a Chinese gloss.  The generic bilingual splitter correctly separates those
# fields, but the final word of the English clause is then occasionally hidden
# inside the Chinese quote.  These reviewed replacements restore the complete
# source meaning while keeping the provenance distinct from a translation.
SOURCE_EN_REFINEMENTS = {
    "ss286-rule-08": (
        "Because the expression is deliberately gentle, it may be unsuitable when immediate action "
        "is necessary. In an emergency, use a direct command such as ‘Leave the building immediately’ "
        "instead of ‘You might want to leave the burning building’. The core expression can be used "
        "as a direct suggestion, after a time expression, after an if-condition, or after a reason or "
        "contrast clause. For example: You might want to keep the receipt. Before you send the email, "
        "you might want to check the attachment. If the room feels cold, you might want to close the "
        "window. Since the restaurant is busy, you might want to book a table."
    ),
    "ss327-rule-01": (
        "In X is more of A than B, A is the stronger or more accurate description. For example, in "
        "‘The meeting was more of an introduction than a negotiation’, an introduction is the more "
        "accurate description and a negotiation is the less accurate one. Reversing A and B changes "
        "the meaning."
    ),
    "ss323-rule-04": (
        "In this structure, everything does not literally refer to every object. It usually means "
        "all the evidence, signs, available information, results or known facts. Therefore, "
        "‘Everything points to a misunderstanding’ means that all available information supports "
        "the conclusion that a misunderstanding has occurred."
    ),
    "ss333-rule-13": (
        "Goes to show that does not necessarily mean proves that. Proves that normally indicates that "
        "the evidence establishes something conclusively, whereas goes to show that may simply mean "
        "that an event supports or illustrates a conclusion. The structure works with singular and "
        "plural subjects, with It, This or That, with What-clauses, and with The fact that-clauses. It may include "
        "adverbs such as just, only, further or once again, follow a modal verb, or appear after seems "
        "or appears. It can also be negated, questioned, introduced by an optional opening phrase, or "
        "joined to a main clause with but. In scientific or rigorous research, do not treat it as "
        "proof of causation when the evidence is incomplete."
    ),
    "ss345-rule-04": (
        "Preserve the exact time relationship. Source: He called me only after dinner. "
        "Answer: It was not until after dinner that he called me. Do not remove after, "
        "because that would change the meaning to ‘not until dinner’."
    ),
}

REFERENCE_LABEL = re.compile(
    r"(?:核心(?:句型|結構|詞語|表達)|正確|錯誤|不要使用|應使用|"
    r"不要寫(?:成)?|寫成|使用|例如|比較|以下|包括|直接說|"
    r"可以寫|你也可以寫|形式|內容|版本|答案|原句)[^。！？；]{0,24}[：:]\s*$"
)
STRUCTURAL_ENGLISH_ONLY = re.compile(
    r"^(?:Formula|Correct|Incorrect|Source|Answer|Compare|Example|Examples|"
    r"(?:Best\s+)?Core Grammar Bank|Core Expression|Main Formula)\s*:?.*$",
    re.IGNORECASE,
)

# The PDFs deliberately reuse a small number of exact model sentences in two
# different pedagogical locations (for example, once to teach word order and
# again to explain the benefit of the structure).  These are not extraction
# duplicates.  Every entry records the exact generated sentence, every source
# card where the PDF prints it, and the source-backed teaching reason.  Any
# repeat not listed here is a hard failure.
PEDAGOGICAL_REPEAT_ALLOWLIST: dict[tuple[str, str, str], dict[str, object]] = {
    ("ss278", "en", "Take public transport, for example."): {
        "cards": ("ss278-rule-04", "ss278-rule-08"),
        "reason": "The PDF reuses the model to contrast sentence-opening punctuation with the fixed expression's optional additions.",
    },
    ("ss278", "en", "Take X, for example"): {
        "cards": ("ss278-benefit-03", "ss278-benefit-04"),
        "reason": "The PDF repeats the formula while explaining both paragraph organisation and sentence variety.",
    },
    ("ss280", "en", "The company has one overseas office—namely, the one in Singapore."): {
        "cards": ("ss280-rule-01", "ss280-benefit-01"),
        "reason": "The PDF uses the same model first for exact identification and later for the corresponding communication benefit.",
    },
    ("ss280", "zh", "報告提出一項主要主張，即新系統能節省時間。"): {
        "cards": ("ss280-rule-04", "ss280-rule-08b"),
        "reason": "The PDF repeats this Chinese model in the that-clause form list and the final that-clause pattern bank.",
    },
    ("ss280", "zh", "文章探討一個問題，即學校是否應限制家課。"): {
        "cards": ("ss280-rule-04", "ss280-rule-08b"),
        "reason": "The PDF repeats this Chinese whether-clause model in the form list and the corresponding pattern bank.",
    },
    ("ss282", "en", "General statement."): {
        "cards": ("ss282-rule-05", "ss282-rule-07"),
        "reason": "The PDF repeats this schematic source label in two distinct more-specifically/more-precisely comparisons.",
    },
    ("ss283", "en", "How about meeting after lunch?"): {
        "cards": ("ss283-rule-04", "ss283-rule-08", "ss283-benefit-01"),
        "reason": "The PDF intentionally carries one model through optional information, punctuation, and the suggestion-making benefit.",
    },
    ("ss285", "en", "Do you happen to know when the office closes?"): {
        "cards": ("ss285-rule-07", "ss285-benefit-01"),
        "reason": "The PDF reuses the model for question-mark placement and the polite-information-request benefit.",
    },
    ("ss288", "en", "Who are you to...?"): {
        "cards": ("ss288-rule-02", "ss288-rule-04"),
        "reason": "The PDF repeats the fixed shell while contrasting subject-be agreement and optional opening words.",
    },
    ("ss289", "en", "It was only after the meeting that I understood the problem."): {
        "cards": ("ss289-rule-03", "ss289-benefit-02"),
        "reason": "The PDF uses the same sentence to teach the time relationship and then its emphasis benefit.",
    },
    ("ss292", "en", "Far be it from me to complain."): {
        "cards": ("ss292-rule-01", "ss292-rule-04"),
        "reason": "The PDF repeats the canonical example in the inversion rule and the no-extra-negative contrast.",
    },
    ("ss296", "en", "Leave it to the technician to repair the machine."): {
        "cards": ("ss296-rule-01", "ss296-rule-02"),
        "reason": "The PDF reuses the model to identify the responsible person and the following infinitive action.",
    },
    ("ss298", "en", "Can you explain what is stopping the team from continuing?"): {
        "cards": ("ss298-rule-01", "ss298-rule-09"),
        "reason": "The PDF repeats the embedded-question model in the core rule and the final grammar-bank application.",
    },
    ("ss300", "en", "How are we supposed to finish the report without the data?"): {
        "cards": ("ss300-rule-07", "ss300-benefit-02"),
        "reason": "The PDF uses the same constrained-action question for the context rule and its practical communication benefit.",
    },
    ("ss301", "en", "What difference will it make if the delivery arrives tomorrow?"): {
        "cards": ("ss301-rule-02", "ss301-rule-05"),
        "reason": "The PDF repeats the future-form model while teaching tense choice and clause order.",
    },
    ("ss301", "en", "What difference does it make whether we start now or later?"): {
        "cards": ("ss301-rule-03", "ss301-rule-04"),
        "reason": "The PDF repeats the whether model to teach alternative clauses and indirect-question word order.",
    },
    ("ss302", "en", "How come nobody told me?"): {
        "cards": ("ss302-rule-01", "ss302-benefit-01"),
        "reason": "The PDF reuses its main model for statement word order and the natural-question benefit.",
    },
    ("ss302", "en", "→ How come Grace left early?"): {
        "cards": ("ss302-rule-02", "ss302-rule-03"),
        "reason": "The PDF repeats the transformed answer to demonstrate both auxiliary removal and tense preservation.",
    },
    ("ss306", "en", "Where does that leave us?"): {
        "cards": ("ss306-rule-01", "ss306-rule-06a", "ss306-benefit-02", "ss306-benefit-06"),
        "reason": "The PDF deliberately reuses the canonical question across the core bank, grammar shells, consequence benefit, and speaking frame.",
    },
    ("ss306", "en", "I wonder where that leaves us."): {
        "cards": ("ss306-rule-06", "ss306-benefit-06"),
        "reason": "The PDF repeats the indirect form in the grammar-shell rule and speaking/writing variety benefit.",
    },
    ("ss319", "en", "There is no guarantee that prices will fall."): {
        "cards": ("ss319-rule-03", "ss319-rule-08"),
        "reason": "The PDF reuses this sentence in the retained-that rule and the final correct/incorrect grammar bank.",
    },
    ("ss319", "en", "there + be + no guarantee that + clause"): {
        "cards": ("ss319-rule-04", "ss319-rule-07"),
        "reason": "The PDF repeats the abstract formula to connect tense variation with related-structure boundaries.",
    },
    ("ss320", "en", "There is no telling when the train will arrive."): {
        "cards": ("ss320-rule-02", "ss320-rule-04", "ss320-rule-08"),
        "reason": "The PDF carries one model through wh-clause choice, tense use, and the final grammar bank.",
    },
    ("ss323", "en", "Everything points to a delay."): {
        "cards": ("ss323-rule-05", "ss323-benefit-05"),
        "reason": "The PDF repeats the concise evidence model for negation placement and sentence-position variety.",
    },
    ("ss323", "en", "Everything points to the fire having started in the kitchen."): {
        "cards": ("ss323-rule-07", "ss323-rule-11"),
        "reason": "The PDF reuses the formal V-ing construction while teaching passive/perfect forms and avoiding to-that clauses.",
    },
    ("ss323", "en", "Everything points to human error."): {
        "cards": ("ss323-rule-12", "ss323-benefit-04"),
        "reason": "The PDF uses the same conclusion model for past-tense comparison and cautious evidence-based writing.",
    },
    ("ss324", "en", "The procedure is anything but simple."): {
        "cards": ("ss324-rule-02", "ss324-rule-07", "ss324-rule-11"),
        "reason": "The PDF repeats the canonical contrast in strength, negation placement, and the final pattern bank.",
    },
    ("ss325", "en", "The machine is all but impossible to repair."): {
        "cards": ("ss325-rule-01", "ss325-rule-07a"),
        "reason": "The PDF reuses the model in the core meaning rule and the infinitive-complement grammar pattern.",
    },
    ("ss325", "en", "The project had been all but abandoned."): {
        "cards": ("ss325-rule-02", "ss325-rule-07"),
        "reason": "The PDF repeats its past-perfect example in tense variation and the final grammar bank.",
    },
    ("ss325", "en", "The proposal has been all but rejected."): {
        "cards": ("ss325-rule-04", "ss325-benefit-02"),
        "reason": "The PDF reuses the passive example for adjective/participle choice and concise formal evaluation.",
    },
    ("ss328", "en", "Subject + has / have not been without + possessive + noun The service has not been without its problems."): {
        "cards": ("ss328-rule-06", "ss328-rule-11"),
        "reason": "The PDF repeats the complete present-perfect pattern in the tense rule and final grammar bank.",
    },
    ("ss329", "en", "Changing a company’s culture is easier said than done."): {
        "cards": ("ss329-rule-05", "ss329-benefit-02"),
        "reason": "The PDF repeats the gerund-subject model while teaching subject flexibility and concise evaluation.",
    },
    ("ss330", "en", "The report leaves much to be desired."): {
        "cards": ("ss330-rule-04", "ss330-benefit-01"),
        "reason": "The PDF reuses its model for tense control and formal criticism without harsh wording.",
    },
    ("ss331", "en", "Confidence is not to be confused with arrogance."): {
        "cards": ("ss331-rule-03", "ss331-rule-04", "ss331-benefit-01", "ss331-benefit-02"),
        "reason": "The PDF intentionally anchors preposition choice, passive form, concept distinction, and concise comparison to one model.",
    },
    ("ss338", "en", "The investment translated into higher sales."): {
        "cards": ("ss338-rule-01", "ss338-benefit-05"),
        "reason": "The PDF repeats the outcome model in the core rule and the evidence-to-result writing benefit.",
    },
    ("ss338", "en", "Better training usually translates into fewer mistakes."): {
        "cards": ("ss338-rule-05", "ss338-benefit-01"),
        "reason": "The PDF reuses the adverb-position example for modifier placement and the practical-result benefit.",
    },
    ("ss342", "en", "The time has come to act."): {
        "cards": ("ss342-rule-01", "ss342-rule-11"),
        "reason": "The PDF repeats the shortest core model in the fixed-expression rule and the final pattern bank.",
    },
    ("ss343", "en", "Gone are the days when..."): {
        "cards": ("ss343-rule-02", "ss343-benefit-05"),
        "reason": "The PDF repeats the fixed opening while teaching inversion and reusable sentence openings.",
    },
    ("ss344", "en", "It has been three years since the programme was introduced."): {
        "cards": ("ss344-rule-02", "ss344-rule-04", "ss344-rule-06", "ss344-benefit-01", "ss344-benefit-02"),
        "reason": "The PDF deliberately carries its canonical duration transformation through tense, since-clause, ago, clarity, and rewriting sections.",
    },
    ("ss344", "en", "It is three years since the programme was introduced."): {
        "cards": ("ss344-rule-02", "ss344-rule-08"),
        "reason": "The PDF repeats the accepted present-be variant in the tense rule and related-form comparison.",
    },
    ("ss344", "en", "It has been six months since the machine was repaired."): {
        "cards": ("ss344-rule-03", "ss344-rule-04"),
        "reason": "The PDF reuses the duration example to distinguish for-duration logic from the required past since-clause.",
    },
    ("ss344", "en", "The programme was introduced three years ago."): {
        "cards": ("ss344-rule-06", "ss344-rule-08", "ss344-benefit-02"),
        "reason": "The PDF repeats the source sentence while teaching ago removal, related forms, and transformation practice.",
    },
}

# These source cards contain English teaching text only.  Their Chinese text is
# an explicit, card-specific editorial translation of that source—not a generic
# fallback.  Keeping this reviewed mapping in source control makes the import
# reproducible and prevents an untranslated card from silently shipping.
EDITORIAL_ZH_TRANSLATIONS = {
    "ss279-rule-04": (
        "形容詞必須放在 case 前面；clear、good、classic、striking 及 another 都可放在"
        " case in point 之前修飾例證。不可把形容詞放在 case 後面，也不可插入 in point 之間。"
    ),
    "ss281-rule-03": (
        "連接語 that is to say 用來解釋或準確重述前一句，不可只用來添加一個新意思。"
        "例如，軟件以雲端為基礎，後句應解釋用戶可透過互聯網使用它；只說軟件很受歡迎，"
        "並沒有說明 cloud-based 的意思。"
    ),
    "ss281-rule-08": (
        "連接兩個意思時，that is to say 是固定形式，不可改成 that was to say、"
        "that says to say、that is saying 或 to say that is。縮寫 that's to say 雖可使用，"
        "但並不常見，因此本練習不採用。"
    ),
    "ss281-rule-09": (
        "連接語 that is to say 後面必須加逗號。它可以放在句首，也可以接在分號後面；"
        "例如 That is to say, the rule applies to everyone."
    ),
    "ss282-rule-06": (
        "如要把較概略的說法改得更準確，可使用「概略陳述—或更準確地說（or, more precisely,）"
        "+ 精確資料」這個結構。"
    ),
    "ss292-rule-01": (
        "固定表達 Far be it from... 採用倒裝語序，當中的 be 永遠不變；即使 from 後的人物改變，"
        "也不可把 be 改成 is、was 或 are。"
    ),
    "ss292-rule-02": (
        "在 from 後面要用受格代名詞。單數可用 me、you、him 或 her，複數可用 us 或 them；"
        "不可改用主格代名詞 I、we、he、she 或 they。"
    ),
    "ss292-rule-03": (
        "在 to 後面要用動詞原形；可以表達質疑、批評、干預、指責或決定等動作，"
        "不可改用過去式、現在分詞、第三人稱單數或過去分詞。"
    ),
    "ss292-rule-05": (
        "在這個句式中，from 後的人或團體通常就是 to 後動作的執行者。"
        "例如句中出現 me，表示由說話者提出質疑；出現 the committee，則表示由委員會採取動作。"
    ),
    "ss292-rule-06": (
        "這個固定句式中的 far 並不表示實際的空間距離；它是 Far be it from..."
        " 慣用結構不可分割的一部分。"
    ),
    "ss292-rule-07": (
        "句式內部的語序必須保持「Far be it from + 人物 + to + 動詞原形」；"
        "far、be、it 及 from 的先後次序都不可調換。"
    ),
    "ss292-rule-08": (
        "補充資料可以放在整個句式之前或之後，也可以把句式放進引語；"
        "但無論位置如何改變，Far be it from + 人物 + to + 動詞原形 的內部結構都不能改動。"
    ),
    "ss292-rule-09": (
        "這個表達通常帶有正式語氣，適合審慎提出異議、會議、公開聲明、正式討論、"
        "文章、演說、專業溝通及外交對話；在親密朋友的隨意交談中可能顯得過於正式。"
    ),
    "ss292-benefit-03": (
        "這個句式讓說話者可以較有禮貌地討論敏感事情，例如動機、專業判斷、私人決定、"
        "責任、錯誤、領導方式及個人選擇，避免一開始便顯得敵對。"
    ),
    "ss292-benefit-05": (
        "在正式或需要措辭謹慎的情境中，這個句式可取代反覆使用 I do not want to criticise、"
        "I do not want to interfere 或 I do not want to question，使表達更精確而不累贅。"
    ),
    "ss300-rule-03": (
        "在 supposed to 後面必須使用動詞原形；描述完成報告時要用 finish，"
        "不可改用現在分詞 finishing 或過去式 finished。"
    ),
    "ss300-rule-04": (
        "直接問句需要倒裝，把 be 動詞放在主語之前；現在式按主語使用 am、is 或 are，"
        "過去式則使用 was 或 were。"
    ),
    "ss300-rule-05": (
        "間接問句不可倒裝。在表示不知道、要求解釋、轉述提問、指出無人告知、需要查明或"
        "指南說明等主句後，要恢復正常的主語—動詞語序。"
    ),
    "ss302-rule-01": (
        "使用 how come 時，後面不可採用一般疑問句的倒裝語序；無論句中有一般動詞、"
        "be 動詞或情態動詞，都要按照陳述句次序排列主語和動詞。"
    ),
    "ss302-rule-03": (
        "由 why 問句改寫成 how come 問句時必須保留原來時態。"
        "一般過去式仍表示已發生的事情，現在完成式也不可擅自改成一般過去式。"
    ),
    "ss308-rule-01": (
        "本課的固定表達只有 If I may；其後的 I would like to、let me 或 could I"
        " 屬於主句內容，不是固定表達的一部分。"
    ),
    "ss308-rule-03": (
        "插入語 If I may 只增加禮貌語氣，不能取代主句；整句仍須有完整訊息。"
        "不可只說 If I may, one point，而應說 If I may, I would like to clarify one point。"
    ),
    "ss308-rule-04": (
        "插入語 If I may 放在句首時，後面要加逗號；放在句中時，前後都要加逗號；"
        "放在句尾時，前面要加逗號。"
    ),
    "ss308-rule-05": (
        "兩種禮貌表達 If I may 與 May I...? 意思相關但結構不同。May I ask a question? 是直接請求許可；"
        "If I may, I would like to ask a question. 則是禮貌地引出接下來要說的內容。"
    ),
    "ss308-rule-06": (
        "插入語 If I may 的位置相當靈活：放在句首最清楚和常見，也可自然地放在句中或句尾；"
        "三種位置都不會改變它的禮貌功能。"
    ),
    "ss308-rule-07": (
        "本課不教授 If I may + 動詞 的從句用法；雖然 If I may add one point..."
        " 等句子合乎文法，本練習只集中於獨立插入語 If I may, + 子句、"
        "句中插入及句尾用法。"
    ),
    "ss308-rule-08": (
        "禮貌表達 If I may 主要用於正式情境，例如會議、面試、簡報、課堂討論、"
        "正式交談、專業異議及公開問答；在親密朋友的隨意對話中可能顯得過於正式。"
    ),
    "ss310-rule-04": (
        "表達 Correct me if I am wrong 可放在句首、句中或句尾，並要按位置使用合適標點："
        "句中作插入語時前後加逗號，句尾前可加逗號，也可用破折號或冒號連接相關陳述。"
    ),
    "ss312-rule-04": (
        "表達 With all due respect 放在句首時，後面要加逗號；放在主語或情態動詞之後作插入語時，"
        "前後都要加逗號；放在句尾時，前面要加逗號。"
    ),
    "ss316-rule-01": (
        "在 let 後面使用「受詞 + 動詞原形」，因此 me 之後直接接 be；"
        "不可在 be 前加 to，也不可把 be 改成現在分詞。"
    ),
    "ss327-rule-10": (
        "副詞 really、actually、perhaps、probably、clearly 等可以加入句中，"
        "用來表達態度或確定程度，但它們不是固定結構的一部分；核心仍是 more of A than B。"
    ),
    "ss335-rule-02": (
        "固定表達 set the stage for 中，stage 前面的定冠詞 the 必須保留；"
        "不可改用不定冠詞，也不可完全省略冠詞。"
    ),
    "ss335-rule-03": (
        "固定表達 set the stage 必須接介詞 for，不可改用 to；"
        "其後的名詞表示前一事件為甚麼結果創造條件。"
    ),
    "ss335-rule-04": (
        "介詞 for 後面可接名詞、名詞片語或動詞 -ing 形式，用來表示改革、經濟增長、"
        "更緊密合作或引入新制度等結果；不可直接接動詞原形。"
    ),
    "ss341-rule-02": (
        "時間副詞 Before long 的大小寫取決於位置：放在句首時 B 要大寫；"
        "放在 and、but 或分號之後時通常用小寫。"
    ),
    "ss345-rule-01": (
        "在 It was not until X that Y 結構中，that 後面使用正常陳述句語序，不可倒裝。"
        "倒裝只屬於另一結構 Not until X + 助動詞 + 主語 + 主要動詞。"
    ),
    "ss345-rule-02": (
        "由「not...until」改寫成這個強調句時，that 子句通常改為肯定形式。"
        "原句的否定意思已由 not until 承擔，不可在 that 子句內再次加入否定。"
    ),
    "ss345-rule-03": (
        "在 It was not until X that Y 結構中，X 與 that 子句之間不可加逗號；"
        "但整句前面的引導短語仍可按一般規則使用逗號。"
    ),
    "ss345-rule-06": (
        "在 Y 部分可按意思使用不同動詞形式，包括一般過去式、被動語態及情態動詞；"
        "X 部分也可使用過去完成式。X 或 Y 內部的時態和語態改變時，"
        "It was not until X that Y 的核心結構保持不變。"
    ),
}

# These cards do contain Chinese in the PDF, but extraction leaves only a terse
# fragment, an orphaned label, or an example translation.  The reviewed text
# below faithfully combines the source rule/benefit and its usable Chinese
# wording into a complete Chinese-primary explanation.
SOURCE_ZH_REFINEMENTS = {
    "ss283-rule-01": (
        "當 How about 後面提出一項行動時，動詞要使用 -ing 形式，例如 How about meeting...?；"
        "不可直接接動詞原形或 to + 動詞。"
    ),
    "ss285-rule-03": (
        "在間接問句中，can、will、should、has 等本身帶有意思的助動詞要保留，但必須放在主語後面，"
        "使用陳述句語序。"
    ),
    "ss279-rule-05": (
        "提及兩個或以上的例證時，要把 case 改為複數 cases，寫成 cases in point；"
        "in point 保持不變，不可誤寫成 case in points。"
    ),
    "ss284-rule-03": (
        "把直接問句改成 I was wondering if 或 whether 的間接問句後，"
        "通常不再保留助動詞 do、does 或 did；時態和人稱變化要在主要動詞上顯示。"
    ),
    "ss287-rule-02": (
        "固定連接部分是 The catch is that，is 與 that 之間不可加入逗號，"
        "否則會錯誤地切斷補充問題的子句。"
    ),
    "ss287-rule-05": (
        "句中的 be 動詞及 that 子句時態必須配合語境：現在情況用 is，過去情況用 was，"
        "談論未來問題時則可用 will be。"
    ),
    "ss288-rule-01": (
        "在 Who am I to...? 或 Who are you to...? 句式中，to 後面必須接動詞原形；"
        "不可使用現在分詞或過去式。"
    ),
    "ss288-rule-02": (
        "主語 I 必須配合 am，寫成 Who am I to...?；主語 you 必須配合 are，"
        "寫成 Who are you to...?，兩者不可互換。"
    ),
    "ss289-rule-01": (
        "在 It was only after X that Y 結構中，that 子句使用正常陳述句語序，"
        "即主語在前、動詞在後；"
        "不可在 that 後使用疑問句倒裝。"
    ),
    "ss290-rule-03": (
        "固定表達是 What gives + 人物 + the right to...?，right 前必須保留定冠詞 the，"
        "不可省略或改用其他冠詞。"
    ),
    "ss290-rule-04": (
        "在 the right to 後面要使用動詞原形，例如 decide；"
        "不可改用現在分詞 deciding 或過去式 decided。"
    ),
    "ss291-rule-02": (
        "介詞 for 後面要用受格代名詞，例如 me、you、him、her、us 或 them；"
        "不可使用主格代名詞。"
    ),
    "ss292-rule-04": (
        "此句式本身已帶否定和自我抽離的意思，當中不可再加入 not；"
        "否則會造成雙重否定並改變原意。"
    ),
    "ss292-benefit-06": (
        "在合適語境中，這個句式可帶出克制的反諷，間接指出某人的行為一向可以預料；"
        "使用時要謹慎，因為語氣可能顯得諷刺。"
    ),
    "ss294-rule-01": (
        "在 be in no position to 後面必須接動詞原形，例如 criticise；"
        "不可接現在分詞 criticising。"
    ),
    "ss294-rule-02": (
        "在 be in no position to 中，be 動詞要配合主語和時態：單數主語用 is 或 was，"
        "複數主語用 are 或 were，談論未來則可用 will be。"
    ),
    "ss294-rule-06": (
        "表示某人沒有資格或條件做某事時，要用 be in no position to；"
        "不可直譯成 have no position to。"
    ),
    "ss297-rule-01": (
        "在 be under no obligation to 中，be 動詞必須配合主語和時態：I 配 am，"
        "單數人物配 is 或 was，複數人物配 are 或 were，未來情況可用 will be。"
    ),
    "ss297-rule-02": (
        "在 be under no obligation to 後面，to 必須接動詞原形，例如 answer、pay 或 explain；"
        "不可接 -ing 形式、過去式或過去分詞。"
    ),
    "ss298-rule-03": (
        "在 What is stopping...from...? 結構中，from 是介詞，因此後面的動詞必須使用 -ing 形式，"
        "例如 from asking；不可寫成 from ask。"
    ),
    "ss299-rule-01": (
        "在 What makes + 人物 + think...? 中，make 後面要接人物，再直接接動詞原形；"
        "不可在動詞前加入 to。"
    ),
    "ss300-rule-01": (
        "句式 be supposed to 中的 be 動詞必須與主語和時態一致：I 配 am，he 或 she 配 is，"
        "we 或 they 配 are；過去式則按主語使用 was 或 were，不能改用 do、does 或 did。"
    ),
    "ss300-rule-02": (
        "固定表達是 be supposed to，supposed 在書面英語中必須保留字尾 -d；"
        "不可誤寫成 be suppose to。"
    ),
    "ss301-rule-03": (
        "直接問句 What difference does it make...? 必須使用疑問句語序：does 放在主語 it 前面，"
        "主要動詞 make 保持原形。"
    ),
    "ss305-rule-01": (
        "這個句式 Is it any wonder that...? 是直接問句，因此要把 be 動詞 is 放在主語 it 前面；"
        "不可使用 It is any wonder that...? 的陳述句語序。"
    ),
    "ss306-rule-03": (
        "詢問某人或某群體將來會處於甚麼境況時，使用 Where will that leave + 人物／群體?，"
        "例如 Where will that leave students next year?"
    ),
    "ss307-rule-01": (
        "核心表達固定為 if + you + ask + me，四個部分的次序不可改變；"
        "ask 後面直接接受格 me，不加 to，也不加入 will。"
    ),
    "ss307-rule-05": (
        "當 If you ask me 放在句首時，後面要加逗號，再接完整意見；"
        "不可省略這個分隔逗號。"
    ),
    "ss310-rule-01": (
        "完整固定表達是 Correct me if I am wrong，其中 me 和 am 都不可省略；"
        "應保留 correct + me + if + I + am + wrong 的完整次序。"
    ),
    "ss311-rule-01": (
        "在 Do not get me wrong, but 後面，內容必須是完整子句，即同時有主語和限定動詞。"
        "只有 too expensive 之類的形容詞片語並不足以構成完整子句。"
    ),
    "ss312-rule-01": (
        "表達禮貌異議時，With all due respect 是固定用語，字詞必須保持相連並依照原有次序；"
        "不可把 due 移到 respect 後面或任意省略當中的字詞。"
    ),
    "ss315-rule-04": (
        "轉折詞 but 和 however 不可在同一位置重複使用。"
        "可寫 That may be so, but...，或另起一句用 However,...。"
    ),
    "ss316-rule-02": (
        "在 Let me be clear 中，me 是 let 的受詞，因此必須使用受格 me，"
        "不可改用主格 I。"
    ),
    "ss326-rule-01": (
        "固定表達 nothing short of 可接形容詞或名詞來作強烈評價；"
        "short 不能改成副詞 shortly，介詞 of 也不能改成 than 或 from。"
    ),
    "ss328-rule-10": (
        "表示保留式評價時，not without its 可配搭表示優點或價值的名詞，例如 merits 和 benefits；"
        "也可配搭表示缺點、風險或代價的名詞，例如 problems、risks 和 costs。"
    ),
    "ss329-rule-02": (
        "固定比較結構 easier said than done 中的 than 不可省略；"
        "省去 than 會令兩個過去分詞失去正確的比較關係。"
    ),
    "ss329-rule-03": (
        "按主語、時態或語氣改寫時，只改變前面的 be 動詞；"
        "easier said than done 這個比較部分保持不變。"
    ),
    "ss330-rule-03": (
        "固定部分是 to be desired，不可改成 to desire、to be desiring 或 to have desired；"
        "整個結構表示實際表現仍未達理想水平。"
    ),
    "ss331-rule-02": (
        "句中的 be 動詞必須與主語的單複數和時態配合：現在式用 is 或 are，"
        "過去式用 was 或 were。"
    ),
    "ss335-rule-01": (
        "動詞 set 是不規則動詞：原形、過去式和過去分詞都是 set，第三人稱單數是 sets，"
        "-ing 形式則是 setting；不可寫成 setted。"
    ),
    "ss336-rule-01": (
        "在 come at the cost of 中，of 是介詞，後面要接名詞、名詞片語或 V-ing 片語；"
        "不可接 to + 動詞或直接接動詞原形。"
    ),
    "ss342-rule-02": (
        "在 The time has come to 後面，to 是不定詞標記，因此必須接動詞原形，例如 change；"
        "不可接 changed 或 changing。"
    ),
    "ss343-rule-01": (
        "倒裝句 Gone are the days when... 要把 Gone 放在 be 動詞之前，"
        "再接主語 the days；不可把主語移到 are 前面。"
    ),
    "ss343-rule-05": (
        "在這個句式中，when 子句通常描述過去的情況，可使用一般過去式、used to、had to、could／could not，"
        "或 was／were expected to 等形式。"
    ),
    "ss344-rule-02": (
        "本課的目標結構固定使用 It has been + 時段 + since + 子句；"
        "不可把 has been 改成 is 或 was。"
    ),
    "ss344-rule-05": (
        "表示某人上一次做某事時，last 通常放在 since 子句的主要動詞前面，"
        "例如 since we last met 或 since the team last won。"
    ),
    "ss344-rule-07": (
        "單數時間單位前通常使用 a，例如 a year；複數時間則使用數字或數量詞，"
        "例如 three months 或 several decades。"
    ),
    "ss345-rule-04": (
        "改寫時必須保留原句準確的時間關係。若原句表示晚飯後才致電，"
        "X 部分便要保留 after dinner；省去 after 會誤變成直到晚飯時間才致電。"
    ),
    "ss345-rule-05": (
        "在這個句式中，X 部分標示事情延遲至哪一刻才發生，並不表示因果或目的。"
        "例如 alarm sounded 只指出家人發現火警的時間，不代表警報造成火警。"
    ),
    "ss345-rule-07": (
        "本練習集中操練過去式 It was not until X that Y。"
        "現在式 It is not until X that Y 雖然合乎文法，但不是本組題目的目標形式。"
    ),
    "ss345-benefit-03": (
        "這個強調句能把普通的 did not...until... 改寫得更有力度，"
        "把讀者注意力集中在延誤終結或事情終於發生的時間點。"
    ),
    "ss345-benefit-04": (
        "這個句式能把背景事件與其後的發現、領悟、回應或結果連成一個有條理的句子，"
        "清楚交代兩者的時間關係。"
    ),
    "ss345-benefit-05": (
        "這個句式可增加句式變化，避免反覆使用 did not...until...、only after、"
        "only when、then 或 finally，同時保留相同的時間關係。"
    ),
    "ss345-benefit-06": (
        "這個句式適合用於故事、報告、簡報和正式解釋，尤其可交代某人終於明白事情、"
        "問題被發現、決定作出或證據出現的時間。"
    ),
}

# A second, stricter audit compares prose-heavy English cards with their
# Chinese-primary counterpart.  These reviewed expansions preserve the source
# logic and examples that were previously present only in the longer English
# block.  Keeping them separate from the terse-fragment repairs above makes the
# reason for each editorial intervention auditable.
BILINGUAL_ZH_COMPLETENESS_REFINEMENTS = {
    "ss276-rule-04": (
        "在 in terms of 後面，topic 通常使用名詞或名詞片語，例如 cost、location、"
        "practical experience 或 public response。若要表達「有多昂貴」，應使用完整的"
        "疑問詞子句 how expensive it is，不可只接形容詞 expensive。"
    ),
    "ss279-rule-06": (
        "本練習的目標是 a case in point，意思是「一個切合的例證」。"
        "the case in point 通常指正在討論的那個特定案例，所指和溝通功能不同，"
        "因此不作為本課的主要答案。"
    ),
    "ss281-rule-02": (
        "在使用 that is to say 時，後面的內容必須澄清前一句：可重述相同意思、解釋陌生詞語、"
        "把概括說法具體化，或說明規則的實際含義。例句先說軟件以雲端方式運作，"
        "後句再解釋它儲存在網上並可經互聯網使用，兩部分意思互相對應。"
    ),
    "ss285-rule-01": (
        "直接問句改成 Do you happen to know... 的間接問句後，內層子句要恢復陳述句語序，"
        "即主語在動詞之前。例如 where the station is 正確，where is the station 則不可"
        "直接放進間接問句。"
    ),
    "ss285-rule-04": (
        "把是非問句放進 Do you happen to know... 後面時，要用 if 或 whether 引入，"
        "並把內層問句改成陳述句語序。例如 whether the parcel has arrived 正確，"
        "不可把 has the parcel arrived 原樣放在 know 後面。"
    ),
    "ss292-benefit-04": (
        "這個句式提供一個適合正式討論的審慎異議框架：先用 Far be it from me to..."
        "表明無意冒犯或批評，再用 but 提出真正的保留。這能幫助學生在口語和寫作中"
        "有條理地表達不同意見，同時保持克制和禮貌。"
    ),
    "ss295-rule-03": (
        "在 It falls to 後面若使用人稱代名詞，必須用受格形式 me、him、her、us 或 them，"
        "再接第二個 to 和動詞原形。例如 It falls to me to explain... 正確，"
        "不可寫成 It falls to I to explain...。"
    ),
    "ss295-rule-06": (
        "改寫時要保留原句的時間和可能程度：現在責任用 falls，過去責任用 fell，"
        "可能在未來承擔可用 may fall，確定的未來責任則用 will fall。"
        "不可把所有情況一律改成現在式。"
    ),
    "ss295-rule-08": (
        "若只看意思，另有多種說法可以表示責任落在某人身上，但它們的結構不同。"
        "本練習要求使用 it falls to + 人物 + to + 動詞的"
        "適當時態，不可用這些近義說法代替目標答案。"
    ),
    "ss300-rule-09": (
        "核心問句用 be supposed to 詢問應如何完成報告。缺乏資料、星期五前的期限，"
        "或兩名成員缺席等內容只補充困難、時間和背景，均可按需要加入或刪去，"
        "不屬於固定句型本身。"
    ),
    "ss301-benefit-05": (
        "把 What difference does it make...? 放在 wonder、know、explain 或 see 等動詞後，"
        "可以把直接質問改成較柔和的間接問句。外層句式改變後，內層要使用陳述句語序，"
        "例如 I wonder what difference it makes...。"
    ),
    "ss302-rule-02": (
        "由 why 問句改成 how come 時，不能只刪去 did、does 或 do；普通動詞本身必須顯示"
        "正確時態和主謂配合。例如 did Grace leave 要改成 Grace left，does Oliver work"
        "則要改成 Oliver works。"
    ),
    "ss302-rule-04": (
        "在日常用法中，how come 通常詢問一個說話者相信已經存在或已獲確認的情況，並要求解釋原因。"
        "例如得知 Daniel 已提早離開，或知道辦公室今天關門後，才追問事情為何會這樣；"
        "它一般不是用來詢問純粹假設的情況。"
    ),
    "ss305-rule-05": (
        "在使用 Is it any wonder that...? 時，前面的背景必須能合理解釋後面的結果。員工整星期每天工作"
        "十二小時，能自然帶出他們筋疲力盡；單說他們九時到達，則不足以解釋極度疲倦。"
        "使用時要確保原因與結果清楚相關。"
    ),
    "ss307-rule-09": (
        "在表達個人看法時，If you ask me 可引出評價、建議、比較、預測和批評。"
        "它既可放在句首，也可作句中或句末插入語；無論位置如何，後面的內容都應是完整、"
        "清楚而真正屬於說話者的看法。"
    ),
    "ss310-rule-01": (
        "完整固定表達是 Correct me if I am wrong。其中 me 是 correct 的受詞，am 是條件子句"
        "不可缺少的動詞，字詞次序亦要保持不變。省去 me 或 am 都會令句子結構不完整，"
        "因此改寫時必須保留整個慣用表達。"
    ),
    "ss310-rule-06": (
        "改寫必須保留原句的確定程度。若原句用 may be mistaken 和 appears to be missing"
        "表達不確定，加入 Correct me if I am wrong 後仍要保留 appears；"
        "不可擅自改成 is definitely missing，否則意思會變得過度肯定。"
    ),
    "ss312-benefit-05": (
        "在句子中，With all due respect 可以放在句首，亦可放在主語附近作插入語，偶爾也可放在句末。"
        "位置改變時要配合逗號把插入語分隔，但禮貌提出異議的功能不變；"
        "這種位置彈性能增加說話和寫作的句式變化。"
    ),
    "ss314-rule-08": (
        "在表示理解對方時，可以選用多種近義說法，但它們不是本課指定句型。"
        "本練習的答案必須保留完整表達"
        "I see where + 人物 + is／are coming from, but...。"
    ),
    "ss316-rule-06": (
        "在核心句式前，Before we continue 等引導資料只交代說話的時間或情境，可以省略。"
        "Before we continue, let me be clear: nobody is being blamed. 與刪去引導語後的句子"
        "都文法完整，核心仍是 Let me be clear: + 完整子句。"
    ),
    "ss316-rule-07": (
        "在澄清資料時，To be clear, + 子句通常較簡短中性；Let me be clear: + 子句則更具個人"
        "立場和力度，提醒聽者特別留意說話者的訊息。兩者都可說明會議九時開始，"
        "但語氣和溝通功能不同。"
    ),
    "ss316-rule-08": (
        "在辨析兩個句式時，It is clear that + 子句表示某事看來明顯或確定，例如計劃顯然已失敗；"
        "Let me be clear: + 子句則引出說話者不希望別人誤解的聲明。"
        "前者判斷事實，後者澄清立場，兩者不可混用。"
    ),
    "ss317-rule-07": (
        "在 Let me put it this way 後面，可按意思使用現在、過去、未來、情態動詞或條件句；"
        "本課考核的是固定引導語，而不是某一特定時態。它可以說明系統現在的表現、"
        "活動過去的結果、延誤將造成的問題、可做與不可做的事，或忽視警號的條件後果。"
        "後續比較部分另作補充，不改變這個核心原則。"
    ),
    "ss319-rule-08": (
        "固定形式必須使用 There is no guarantee that + 完整子句；不可寫成 there has、"
        "there is not guarantee，亦不可省略 that 後的正確動詞形式。核心句式可單獨使用，"
        "也可接在 but、even if、although 或報告動詞後，並可按語境改成 there was、"
        "there can be 或加入 still；這些引導子句、連接詞和副詞都是可選延伸。"
    ),
    "ss322-rule-07": (
        "在預測事情時，Chances are that 可配合過去式或現在完成式，表示某事很可能已發生。它與 probably"
        "意思相近，但 probably 是放在子句內的副詞，而 Chances are that 引出完整預測。"
        "It is likely that 較中性正式；There is a chance that 只表示有可能，語氣通常較弱。"
        "選用哪個結構時，要同時考慮文法位置、正式程度和可能性的強弱。"
    ),
    "ss322-rule-07a": (
        "在其他變體中，The chances are that 是可以使用的較完整形式，但本練習採用較短的 Chances are that。"
        "口語中可省略 that 寫成 Chances are, ...，不過不列作本課答案。"
        "What are the chances that...? 是詢問機率的問句，與作出很可能會發生某事的陳述句"
        "Chances are that... 功能不同。"
    ),
    "ss327-rule-03": (
        "在 more of A than B 中，A 和 B 若是單數可數名詞，通常都要各自使用 a 或 an。"
        "輔音讀音前用 a，例如 a warning；元音讀音前用 an，例如 an opportunity。"
        "冠詞取決於讀音，不只看拼寫。"
    ),
    "ss327-rule-06": (
        "在 more of A than B 後若是不可以數或抽象名詞，通常不需要冠詞。例句中的 training"
        "和 proof 都按不可數用法處理，因此可寫 full training 和 firm proof；"
        "不可機械地在所有 A、B 前加入 a 或 an。"
    ),
    "ss327-rule-07": (
        "句中的 be 或 become 必須保留原句的時態和語氣：現在用 is，過去用 was，"
        "現在完成可用 has become，過去完成可用 had become，表達可能性則可用 could be。"
        "more of A than B 的比較部分保持不變。"
    ),
    "ss328-rule-04": (
        "在 not without 後面的所有格必須回指主語：單數事物用 its，複數事物用 their，"
        "人物按語境用 his 或 her，we 則配 our。例如 The plans... 必須接 their risks，"
        "不可因前一個例句使用 its 而照抄錯誤。"
    ),
    "ss328-benefit-05": (
        "這個句式可避免反覆使用 has some。與其連續寫計劃有一些優點、問題和風險，"
        "可以改用 is not without its advantages、problems 或 risks。"
        "意思仍是承認相關特點，但句式更有變化，語氣也較審慎。"
    ),
    "ss334-rule-09": (
        "在兩個句式中，remind 是及物動詞，通常要明確指出被提醒的人；"
        "serve as a reminder 則直接引出提醒的內容，不需要人物受詞。"
        "因此前者不可省略受詞，後者也不可誤加同一套動詞結構。"
    ),
    "ss334-rule-10": (
        "在相關表達中，可以用名詞 reminder、一般動詞 remind 或其他文法形式帶出提醒，"
        "但它們不作本課答案。本課集中使用 serve as a reminder that，並須按主語、時態和"
        "情態改變動詞。句中還可加入形容詞、被提醒的人、動名詞主語、名詞子句或句首背景；"
        "無論採用哪一種外層句框，that 後仍要接完整子句，核心功能都是由一件事帶出提醒或教訓。"
    ),
    "ss336-rule-01": (
        "在 come at the cost of 中，of 是介詞，後面可接表示品質、私隱、公眾信任或工人安全的"
        "名詞和名詞片語；也可接動詞的 -ing 形式，表示失去顧客、削減培訓或忽略細節。"
        "不可直接接動詞原形，也不可改成不定詞或刪去介詞。"
    ),
    "ss337-rule-06": (
        "在使用 boil down to 時，可把它放進多種自然句框：主語可直接接 boils down to，也可加入 all、"
        "In the end、情態動詞或 seems to；還可使用 What...boils down to is... 的聚焦句、"
        "直接問句或否定句。核心意思和介詞 to 後的內容保持不變。"
    ),
    "ss342-rule-11": (
        "在本練習中，其他表示「是時候」的近義句式雖然意思相關，但文法不同，"
        "因此不作目標答案。本課使用 The time has come to + 動詞原形。"
        "它可獨立成句，也可接在 think、believe 或 agree 後，或放在時間和背景短語之後；"
        "無論外層句框如何改變，核心結構都保持不變。"
    ),
    "ss343-rule-05": (
        "在 Gone are the days when... 中，when 子句通常描述過去情況。可用一般過去式說明昔日習慣，"
        "用 used to 表示過往常態，用 had to 表示當時的必要，用 could／could not 表示能力或限制，"
        "也可用 was／were expected to 說明過去的社會期望。"
    ),
    "ss345-benefit-02": (
        "這個句式把「較早仍未發生的事情」和「事情終於發生的時間點」放在同一句中，"
        "令先後次序一目了然。例如直到雨停孩子才外出，讀者可立即知道雨停前他們一直留在室內，"
        "不會誤解兩件事的時間關係。"
    ),
}
SOURCE_ZH_REFINEMENTS.update(BILINGUAL_ZH_COMPLETENESS_REFINEMENTS)

# These three cards are English-only in the source and therefore remain
# editorial translations rather than source-Chinese clarifications.
EDITORIAL_ZH_COMPLETENESS_TRANSLATIONS = {
    "ss292-rule-01": (
        "固定表達 Far be it from... 採用倒裝語序，當中的 be 永遠不變。無論 from 後面是 me、"
        "them、manager 或其他人物，都仍然使用 be；不可因人物和時態改成 is、was 或 are。"
        "這是慣用語內部的固定形式，不按一般主謂配合變化。"
    ),
    "ss308-rule-01": (
        "本課的固定表達只有 If I may，用來禮貌地引出接下來的說話。其後的 I would like to、"
        "let me、could I 和其他字詞都屬於主句內容，可以按溝通需要改變；"
        "它們可與 If I may 組成完整句子，但不是固定表達本身的一部分。"
    ),
    "ss345-rule-01": (
        "在 It was not until X that Y 結構中，that 後面使用正常陳述句語序，即主語在前、"
        "動詞在後，不可加入 did 倒裝。Not until X + 助動詞 + 主語 + 主要動詞是另一個結構；"
        "兩者都能強調延誤的時間點，但語序不可混合。"
    ),
}
EDITORIAL_ZH_TRANSLATIONS.update(EDITORIAL_ZH_COMPLETENESS_TRANSLATIONS)

# These source cards contain a complete Chinese explanation but no substantive
# standalone English paragraph.  The UI still presents English underneath, so
# each one has a reviewed, source-faithful English translation.
EDITORIAL_EN_TRANSLATIONS = {
    "ss276-benefit-06": (
        "This structure is useful in real study and workplace tasks: comparing products, evaluating "
        "plans, analysing courses, discussing performance, writing reports, comparing policies and "
        "explaining advantages and disadvantages. It turns a vague opinion into a specific, "
        "evidence-based judgement."
    ),
    "ss278-rule-07": (
        "Do not place every answer at the beginning of a sentence. Take X, for example can begin a "
        "sentence, follow a general statement or semicolon, appear mid-sentence, follow an "
        "introductory phrase, or occur inside an if- or when-clause."
    ),
    "ss278-benefit-05": (
        "The expression can appear at the beginning, after a general statement, in the middle, in a "
        "second sentence, or after an if-, when- or other introductory clause. This flexibility adds "
        "sentence variety."
    ),
    "ss283-rule-05": (
        "How about can appear directly at the beginning, after a background sentence, after a time, "
        "condition or purpose phrase, or inside quoted speech. An answer therefore does not always "
        "begin with How."
    ),
    "ss284-benefit-03": (
        "The same frame can make requests, ask permission, request information, ask about two choices "
        "or check whether something has happened. One structure is therefore useful in many everyday "
        "and workplace situations."
    ),
    "ss305-benefit-04": (
        "The structure can express criticism or sympathy, not merely report a fact. It can criticise "
        "the predictable result of poor arrangements, show sympathy for a reaction to difficulty, or "
        "stress that an outcome was unsurprising."
    ),
    "ss306-benefit-03": (
        "The question is useful for discussing how policies and decisions affect people, including "
        "higher charges, cancelled services, restructuring, rule changes, funding cuts, transport, "
        "education and healthcare."
    ),
    "ss309-rule-02": (
        "In this expression, you is the listener, me is the person giving the opinion, and saying is "
        "the act of expressing it. The literal sense is close to ‘if you do not object to my saying "
        "this’, while the practical meaning is ‘if I may say so’."
    ),
    "ss309-benefit-02": (
        "The expression helps introduce sensitive comments about performance, appearance, wellbeing, "
        "speaking style, decisions, plans or unwelcome advice. It signals awareness that the comment "
        "may sound direct and that no offence is intended."
    ),
    "ss309-benefit-03": (
        "It suits workplace, school and everyday conversations: suggesting improvements, commenting "
        "on a report, disagreeing politely, alerting a friend to a problem or giving feedback while "
        "protecting the relationship."
    ),
    "ss319-benefit-05": (
        "This structure suits formal analysis in argumentative writing, business reports, market and "
        "scientific analysis, policy commentary, meetings and risk assessments. It keeps the writer's "
        "claim objective and cautious."
    ),
    "ss320-rule-09": (
        "The structure is especially useful for unknown future developments, causes and outcomes: "
        "what or when something will happen, how long it will take, who will decide, why it happened, "
        "whether a plan will succeed, or what a quantity, cost or degree will be."
    ),
    "ss320-benefit-06": (
        "It works in both everyday conversation and formal writing, including essays, news reports, "
        "business analysis, presentations and commentary on future developments. It expresses "
        "uncertainty naturally while remaining appropriately cautious."
    ),
    "ss328-benefit-04": (
        "This structure creates a more mature, nuanced argument. It recognises that a method may have "
        "merits without being perfect, that a risky decision may still deserve consideration, or that "
        "a flawed plan need not be rejected completely."
    ),
    "ss331-benefit-05": (
        "The target structure can serve as the main predicate, appear in a that-clause, begin a "
        "sentence, form a parenthetical explanation after a noun, or follow a colon. These positions "
        "provide greater sentence variety."
    ),
    "ss333-benefit-02": (
        "The structure explicitly connects evidence with a conclusion: X supplies the evidence or "
        "example, and the that-clause states the conclusion drawn from it. The reader does not have to "
        "guess how the two ideas relate."
    ),
    "ss336-rule-03": (
        "Cost is not limited to money. It may refer to time, health, quality, safety, privacy, freedom, "
        "trust, relationships or opportunities."
    ),
    "ss336-rule-06": (
        "The target expression need not immediately follow the first subject. It may occur in a main "
        "clause, question, conditional or relative clause, a that- or whether-clause, or after seem to "
        "and be likely to."
    ),
    "ss336-benefit-03": (
        "The structure supports analysis of decisions and policies by identifying what a company, "
        "technology, policy or individual sacrifices in order to reduce costs, increase convenience, "
        "improve safety or achieve success."
    ),
    "ss339-benefit-02": (
        "This structure clearly narrates how one event quickly led to another—for example, a problem "
        "appeared, customers reacted, conditions improved, tickets sold out or someone discovered an "
        "error. It suits stories, news, reports and event summaries."
    ),
}


@dataclass(frozen=True)
class SourceFile:
    source_number: int
    path: Path
    system_order: int


def clean_line(value: str) -> str:
    return " ".join(value.split()).strip()


def joined(lines: Iterable[str]) -> str:
    value = " ".join(clean_line(line) for line in lines if clean_line(line))
    value = re.sub(r"\s+([,.;:!?，。；：！？）】」』])", r"\1", value)
    value = re.sub(r"([（【「『])\s+", r"\1", value)
    value = re.sub(
        r"(?<=[\u3400-\u9fff，。；：！？、／「」『』…])\s+(?=[\u3400-\u9fff，。；：！？、／「」『』…])",
        "",
        value,
    )
    return value.strip()


def normalized_key(value: object) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = text.translate(str.maketrans({"‘": "'", "’": "'", "“": '"', "”": '"'}))
    return re.sub(r"\s+", " ", text).strip().casefold()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_number(path: Path) -> int:
    match = SOURCE_NUMBER.search(path.name)
    if match is None:
        raise ValueError(f"No source number in {path.name}")
    return int(match.group(1))


def stable_inventory(source_dir: Path) -> list[SourceFile]:
    paths = sorted(
        source_dir.glob("*.pdf"),
        key=lambda path: (source_number(path), path.name.casefold(), path.name),
    )
    if len(paths) != EXPECTED_FILES:
        raise ValueError(f"Expected {EXPECTED_FILES} PDFs, found {len(paths)}")

    numbers = [source_number(path) for path in paths]
    expected_numbers = list(range(FIRST_SOURCE_NUMBER, LAST_SOURCE_NUMBER + 1))
    distinct_numbers = sorted(set(numbers))
    if distinct_numbers != expected_numbers:
        raise ValueError(
            "Source-number range is incomplete: "
            f"expected {expected_numbers}, found {distinct_numbers}"
        )
    duplicates = {
        number: numbers.count(number)
        for number in sorted(set(numbers))
        if numbers.count(number) > 1
    }
    if duplicates != {310: 2}:
        raise ValueError(f"Unexpected duplicate source numbers: {duplicates}")

    return [
        SourceFile(source_number(path), path, FIRST_SYSTEM_ORDER + index)
        for index, path in enumerate(paths)
    ]


def load_question_extractor():
    source = SCRIPT_DIR / "extract-sentence-structure-question-data.py"
    spec = importlib.util.spec_from_file_location("sentence_question_extractor", source)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {source}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.extract


def page_lines(path: Path) -> tuple[int, list[tuple[int, str]]]:
    rows: list[tuple[int, str]] = []
    with pdfplumber.open(path) as pdf:
        for page_number, page in enumerate(pdf.pages, 1):
            text = page.extract_text(x_tolerance=2, y_tolerance=3) or ""
            rows.extend(
                (page_number, line)
                for raw in text.splitlines()
                if (line := clean_line(raw))
            )
        return len(pdf.pages), rows


def index_of(rows: list[tuple[int, str]], pattern: re.Pattern[str], start: int = 0) -> int | None:
    return next((index for index in range(start, len(rows)) if pattern.match(rows[index][1])), None)


def source_title(rows: list[tuple[int, str]], target_index: int) -> str:
    title = joined(line for _, line in rows[:target_index])
    if not title:
        raise ValueError("PDF title could not be extracted")
    return title


def quoted_core(title: str) -> str:
    match = re.search(r"「(.+?)」", title)
    value = match.group(1) if match else title
    replacements = {
        "動詞原形": "base verb",
        "動詞": "verb",
        "名詞子句": "noun clause",
        "名詞片語": "noun phrase",
        "名詞": "noun",
        "完整子句": "complete clause",
        "子句": "clause",
        "主語": "subject",
        "人物": "person",
        "某人": "person",
        "群體": "group",
        "組織": "organisation",
        "形容詞": "adjective",
        "過去分詞": "past participle",
        "句": "clause",
        "／": " / ",
    }
    for original, replacement in replacements.items():
        value = value.replace(original, replacement)
    value = CHINESE.sub("", value)
    value = re.sub(r"\s+", " ", value).strip(" -：:／/")
    return value or "Sentence structure"


def slugify(value: str, order: int) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.casefold()).strip("-")
    return slug[:90] or f"sentence-structure-{order}"


def target_formula(
    rows: list[tuple[int, str]], target_index: int, section_end: int, core: str
) -> str:
    candidates = [
        line for _, line in rows[target_index + 1 : min(section_end, target_index + 90)]
    ]
    blocks: list[tuple[str, str]] = []
    preceding_heading = "Target Structure"
    index = 0
    while index < len(candidates):
        line = candidates[index]
        line_is_heading = bool(
            DISPLAY_HEADING.match(line) and not re.search(r"[.!?]\s*$", line)
        )
        if line_is_heading:
            preceding_heading = line
            index += 1
            continue
        if CHINESE.search(line) or not re.search(r"[A-Za-z]", line):
            index += 1
            continue

        block = [line]
        # PDF text extraction wraps a few formulas and function descriptions at
        # the right margin.  Join only a continuation that is grammatically
        # unfinished; a following complete example remains its own candidate.
        while index + 1 < len(candidates):
            next_line = candidates[index + 1]
            next_is_heading = bool(
                DISPLAY_HEADING.match(next_line)
                and not re.search(r"[.!?]\s*$", next_line)
            )
            if (
                next_is_heading
                or CHINESE.search(next_line)
                or not re.search(r"[A-Za-z]", next_line)
            ):
                break
            current = joined(block)
            if (
                len(re.findall(r"[A-Za-z]+", current)) <= 4
                and not re.search(r"[+/]", current)
                and not re.search(
                    r"\b(?:and|or|to|of|that|with|for|from|into|than|as)\s*$",
                    current,
                    re.IGNORECASE,
                )
            ):
                break
            if re.search(r"[.!?]”?\s*$", current) and not re.search(
                r"\b(?:and|or|to|of|that|with|for|from|into|than|as)\s*[.!?]*$",
                current,
                re.IGNORECASE,
            ):
                break
            if len(joined([*block, next_line])) > 360:
                break
            block.append(next_line)
            index += 1
        blocks.append((preceding_heading, joined(block)))
        index += 1

    scored: list[tuple[int, int, str]] = []
    core_words = {word.casefold() for word in re.findall(r"[A-Za-z]{3,}", core)}
    for position, (heading, line) in enumerate(blocks):
        lower = line.casefold()
        overlap = sum(word in lower for word in core_words)
        syntax = sum(token in line for token in ("+", "/", "?", ";", "..."))
        heading_bonus = 20 if re.search(
            r"(?:Target Structure|Core (?:Expression|Structure|Formula)|Main Formula)",
            heading,
            re.IGNORECASE,
        ) else 0
        word_count = len(re.findall(r"[A-Za-z]+", line))
        prose_penalty = 12 if word_count > 18 else 0
        prose_penalty += 10 if re.match(r"^(?:We use|This (?:structure|expression))\b", line) else 0
        scored.append(
            (
                heading_bonus + overlap * 8 + syntax * 4 - prose_penalty,
                -position,
                line,
            )
        )
    if scored:
        best = max(scored)
        if best[0] > 0:
            return best[2].rstrip(".")
    return core.rstrip(".")


def primary_example(
    rows: list[tuple[int, str]], target_index: int, section_end: int
) -> tuple[str, str] | None:
    marker = re.compile(r"^(?:Main\s+|Core\s+)?Examples?(?:\s+例(?:子|句))?\s*:?.*$", re.IGNORECASE)
    block = rows[target_index + 1 : section_end]
    for index, (_, line) in enumerate(block):
        if not marker.match(line):
            continue
        english: list[str] = []
        chinese: list[str] = []
        for _, candidate in block[index + 1 : index + 9]:
            if DISPLAY_HEADING.match(candidate) or SECTION_NUMBER.match(candidate):
                break
            if CHINESE.search(candidate):
                chinese.append(candidate)
                if english:
                    break
            elif re.search(r"[A-Za-z]", candidate):
                if candidate.casefold().startswith(("example", "correct", "incorrect")):
                    continue
                english.append(candidate)
        if english and chinese:
            return joined(english), joined(chinese).strip("（）()")
    return None


def split_numbered(lines: list[str]) -> list[list[str]]:
    starts: list[int] = []
    expected = 1
    for index, line in enumerate(lines):
        match = SECTION_NUMBER.match(line)
        if match is None or int(match.group(1)) != expected:
            continue
        starts.append(index)
        expected += 1
    if not starts:
        return [lines] if lines else []
    prefix = lines[: starts[0]]
    chunks: list[list[str]] = []
    for position, start in enumerate(starts):
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        chunk = lines[start:end]
        if position == 0 and prefix:
            chunk = [*prefix, *chunk]
        chunks.append(chunk)
    return chunks


def source_english(lines: Iterable[str]) -> str:
    """Join the English portion of source lines without editorial fallback."""

    return joined(
        english
        for line in lines
        if (english := split_mixed_source_line(line)[0])
    )


def split_oversized_teaching_chunk(lines: list[str]) -> list[list[str]]:
    """Split an oversized source card at semantic boundaries.

    The PDFs sometimes append a Core Grammar Bank, Related Structures section,
    or several lettered comparisons to the final numbered rule.  We preserve
    source order and every line, grouping adjacent semantic sections below the
    display ceiling.  A conservative line-boundary fallback handles the few
    long, inherently bilingual comparison cards that do not expose a heading.
    """

    if len(source_english(lines)) <= TEACHING_CARD_ENGLISH_LIMIT:
        return [lines]

    starts = [0]
    starts.extend(
        index
        for index, line in enumerate(lines[1:], 1)
        if SEMANTIC_SUBHEADING.match(line)
    )
    starts = sorted(set(starts))
    segments = [
        lines[start : starts[position + 1] if position + 1 < len(starts) else len(lines)]
        for position, start in enumerate(starts)
    ]

    packed: list[list[str]] = []
    current: list[str] = []
    for segment in segments:
        candidate = [*current, *segment]
        if current and len(source_english(candidate)) > TEACHING_CARD_ENGLISH_TARGET:
            packed.append(current)
            current = list(segment)
        else:
            current = candidate
    if current:
        packed.append(current)

    result: list[list[str]] = []
    for part in packed:
        if len(source_english(part)) <= TEACHING_CARD_ENGLISH_LIMIT:
            result.append(part)
            continue
        current = []
        for line in part:
            current.append(line)
            english_length = len(source_english(current))
            chinese_length = len(CHINESE.findall(joined(current)))
            if english_length >= 700 and chinese_length >= 12:
                result.append(current)
                current = []
        if current:
            if result and len(source_english([*result[-1], *current])) <= TEACHING_CARD_ENGLISH_LIMIT:
                result[-1].extend(current)
            else:
                result.append(current)

    if any(len(source_english(part)) > TEACHING_CARD_ENGLISH_LIMIT for part in result):
        raise ValueError("Could not split an oversized teaching block below the display limit")
    if [line for part in result for line in part] != lines:
        raise ValueError("Teaching-block split did not preserve exact source-line order")
    return result


def teaching_chunks(lines: list[str], lesson_id: str, kind: str) -> list[tuple[str, list[str]]]:
    """Return stable card IDs plus source chunks, preserving numbered IDs."""

    result: list[tuple[str, list[str]]] = []
    for index, chunk in enumerate(split_numbered(lines), 1):
        base_id = f"{lesson_id}-{kind}-{index:02d}"
        deduplicated_chunk = deduplicate_source_lines(base_id, chunk)
        for part_index, part in enumerate(split_oversized_teaching_chunk(deduplicated_chunk)):
            suffix = "" if part_index == 0 else chr(ord("a") + part_index - 1)
            result.append((f"{base_id}{suffix}", part))
    return result


def deduplicate_source_lines(card_id: str, lines: list[str]) -> list[str]:
    """Remove only reviewed accidental duplicate lines, retaining first use."""

    targets = DEDUPLICATE_SOURCE_LINES.get(card_id, set())
    seen: set[str] = set()
    result: list[str] = []
    for line in lines:
        if line in targets:
            if line in seen:
                continue
            seen.add(line)
        result.append(line)
    return result


def deduplicate_output_sentences(card_id: str, field: str, value: str) -> str:
    """Remove later copies of the exact reviewed sentence in one output field."""

    result = value
    for sentence in OMIT_LATER_OUTPUT_SENTENCES.get((card_id, field), set()):
        result = result.replace(sentence, "")
    for sentence in DEDUPLICATE_OUTPUT_SENTENCES.get((card_id, field), set()):
        first = result.find(sentence)
        if first < 0:
            continue
        prefix_end = first + len(sentence)
        result = result[:prefix_end] + result[prefix_end:].replace(sentence, "")
    # Irrespective of how a PDF duplicated a line during extraction, a teaching
    # card must never print the exact same sentence/list item twice.  Preserve
    # the first occurrence and its source order.
    units = [
        unit.strip()
        for unit in re.split(r"(?<=[.!?。！？])\s+|\s*;\s*", result)
        if unit.strip()
    ]
    seen: set[str] = set()
    unique: list[str] = []
    for unit in units:
        key = normalized_key(unit)
        if key in seen:
            continue
        seen.add(key)
        unique.append(unit)
    return re.sub(r"\s{2,}", " ", " ".join(unique)).strip()


def remove_unmatched_delimiters(value: str, opening: str, closing: str) -> str:
    """Remove only unmatched quote marks while preserving every balanced pair."""

    result = value
    while result.count(opening) > result.count(closing):
        index = result.rfind(opening)
        result = result[:index] + result[index + len(opening) :]
    while result.count(closing) > result.count(opening):
        index = result.find(closing)
        result = result[:index] + result[index + len(closing) :]
    return result


def normalize_teaching_output(value: str, *, chinese: bool = False) -> str:
    """Convert extraction-only ordinals and bullet glyphs into readable prose."""

    result = re.sub(r"^\s*\d{1,2}[.):．]\s*", "", value)
    result = re.sub(r"\s*[●•▪◦]\s*", "; ", result)
    result = re.sub(
        r"\s*\b(?:Best\s+)?Core Grammar Bank\b\s*:? ?",
        "; ",
        result,
        flags=re.IGNORECASE,
    )
    result = re.sub(
        r"(?:^|(?<=[.;!?])\s+)Pattern\s+\d+\s*:\s*",
        "; ",
        result,
        flags=re.IGNORECASE,
    )
    result = re.sub(r"(?:^|\s+)Pattern\s+\d+\s*:\s*", "; ", result, flags=re.IGNORECASE)
    result = re.sub(r"(?:^|\s+)[A-Z]\.\s+(?=[A-Z])", "; ", result)
    result = re.sub(r"(?:;\s*){2,}", "; ", result)
    result = result.strip(" ;")
    result = re.sub(r"\s{2,}", " ", result).strip()
    if not chinese:
        result = re.sub(r"([.!?])\s*[。！？]", r"\1", result)
        result = re.sub(r"[。！？]\s*([.!?])", r"\1", result)
        result = result.translate(
            str.maketrans(
                {
                    "，": ",",
                    "。": ".",
                    "；": ",",
                    "：": ":",
                    "！": "!",
                    "？": "?",
                    "、": ", ",
                    "【": "“",
                    "】": "”",
                    "「": "“",
                    "」": "”",
                    "『": "‘",
                    "』": "’",
                    "／": "/",
                }
            )
        )
        result = re.sub(r",\s+", ", ", result)
        result = re.sub(r"\s+([,.;:!?])", r"\1", result)
    if chinese:
        result = re.sub(
            r"(?:最佳)?核心(?:文法句型|文法|語法|句型|句式|句法)(?:庫|組合)\s*",
            "；",
            result,
        )
        result = re.sub(r"相似句型比較\s*", "；", result)
        result = re.sub(r"[「【]?可選延伸部分[」】]?\s*", "；", result)
        result = re.sub(
            r"其中，(?:Shells?|Pattern\s+\d+)\s*", "", result, flags=re.IGNORECASE
        )
        result = result.replace("分別其中，", "分別：")
        result = result.replace("位置其中，", "位置：")
        result = re.sub(r"跟在其中，\s*(consider|avoid)", r"跟在 \1", result, flags=re.IGNORECASE)
        result = re.sub(r"shows、其中，indicates", "shows、indicates", result, flags=re.IGNORECASE)
        result = re.sub(r"主語其中，\s*(arrived\s*=\s*動詞)", r"主語；\1", result)
        result = result.replace("【Optional Extensions】", "；")
        result = result.replace("一部分核心句型", "一部分；核心句型")
        result = result.replace("條件如果", "條件；如果")
        result = result.replace("固定部分核心", "固定部分；核心")
        result = result.replace(
            "如果你不介意我這樣說實際使用時",
            "如果你不介意我這樣說。實際使用時",
        )
        result = result.replace(
            "恕我直言希望你不介意我這樣說",
            "恕我直言；也可表示希望你不介意我這樣說。",
        )
        # PDF extraction occasionally attaches a bilingual grammar-bank label
        # to the first example and leaves the closing parenthesis several
        # examples later.  These exact, source-faithful rewrites retain every
        # category and example while presenting them as ordinary Chinese
        # labels instead of malformed parenthetical spans.
        result = result.replace(
            "時間（Time；出發前，你不妨查看天氣。 條件（Condition；如果問題持續，你不妨尋求協助。 原因（Reason）；由於商店較早關門，你不妨現在前往。） 目的（Purpose）；為免遺失工作內容，你不妨定期儲存檔案。）",
            "時間：出發前，你不妨查看天氣。條件：如果問題持續，你不妨尋求協助。原因：由於商店較早關門，你不妨現在前往。目的：為免遺失工作內容，你不妨定期儲存檔案。",
        )
        result = result.replace(
            "現在（Present；他很可能在家。 將來（Future；價格很可能會上升。 過去（Past；他們很可能錯過了巴士。） 現在完成包裹很可能已經送到。） 情態動詞這部機器很可能可以修理。）",
            "現在式：他很可能在家。將來式：價格很可能會上升。過去式：他們很可能錯過了巴士。現在完成式：包裹很可能已經送到。情態動詞：這部機器很可能可以修理。",
        )
        result = result.replace(
            "現在式（Present；這個方法一點也不可靠。 這些指示一點也不清楚。 過去式（Past；這段旅程一點也不舒適。 這些討論一點也不簡短。 完成式（Perfect；談判進展一直一點也不順利。） 這個過程一直一點也不透明。） 未來式（Future）；最後階段絕不會簡單直接。）",
            "現在式：這個方法一點也不可靠。這些指示一點也不清楚。過去式：這段旅程一點也不舒適。這些討論一點也不簡短。完成式：談判進展一直一點也不順利。這個過程一直一點也不透明。未來式：最後階段絕不會簡單直接。",
        )
        result = result.replace(
            "現在（Present；協議差不多已經定案。 街道幾乎空無一人。 過去（Past；觀眾當時幾乎鴉雀無聲。 道路當時幾乎空無一人。 將來式及情態動詞項目到下星期便差不多完成。 要取得進一步進展幾乎不可能。 這個物種可能已經幾乎絕種。 完成式及被動式該份文件幾乎已被遺忘。 該項目當時幾乎已被放棄。） 房屋當時幾乎已被完全摧毀。）",
            "現在式：協議差不多已經定案。街道幾乎空無一人。過去式：觀眾當時幾乎鴉雀無聲。道路當時幾乎空無一人。將來式及情態動詞：項目到下星期便差不多完成。要取得進一步進展幾乎不可能。這個物種可能已經幾乎絕種。完成式及被動式：該份文件幾乎已被遺忘。該項目當時幾乎已被放棄。房屋當時幾乎已被完全摧毀。",
        )
        result = result.replace(
            "則可以表示：（far from；距離很遠；遠非某種狀態；完全不。村莊距離城市很遠。 村莊與城市的環境截然不同。）",
            "而【far from】可以表示距離很遠、遠非某種狀態或完全不。例句：村莊距離城市很遠；村莊與城市的環境截然不同。",
        )
        result = result.replace(
            "代表：（That）；",
            "詞語【That】代表前文所說的整項內容。",
        )
        result = result.replace(
            "以【Noah】為例：從甚麼時候起一直在學韓語？",
            "以 Noah 為例：Noah 從甚麼時候起一直在學韓語？",
        )
        result = result.replace(
            "整個表達的字面意思接近：如果你不介意我這樣說。實際使用時，通常相當於：恕我直言；也可表示希望你不介意我這樣說。",
            "整個表達的字面意思接近「如果你不介意我這樣說」；實際使用時，通常相當於「恕我直言」，也可表示希望你不介意我這樣說。",
        )
        result = result.replace(
            "【all the evidence；all the signs；all the available information；all the results；all the known facts。；Everything points to a misunderstanding.】",
            "【all the evidence】、【all the signs】、【all the available information】、【all the results】和【all the known facts】。例句【Everything points to a misunderstanding.】",
        )
        result = result.replace(
            "；現在式那麼，我們怎麼辦？",
            "。現在式：那麼，我們怎麼辦？",
        )
        result = result.replace(
            "；現在式協議差不多已經定案。",
            "。現在式：協議差不多已經定案。",
        )
        result = result.replace("過去式城鎮當時幾乎空無一人。", "過去式：城鎮當時幾乎空無一人。")
        result = result.replace("完成式或被動式這種疾病幾乎已被消除。", "完成式或被動式：這種疾病幾乎已被消除。")
        result = result.replace("將來式或情態動詞建築工程很快便會差不多完成。", "將來式或情態動詞：建築工程很快便會差不多完成。")
        result = result.replace(
            "；一般現在時或過去時這套系統並不是完全沒有問題。",
            "。一般現在時或過去時：這套系統並不是完全沒有問題。",
        )
        result = result.replace("情態動詞這項建議可能並非毫無風險。", "情態動詞：這項建議可能並非毫無風險。")
        result = result.replace("完成時這項服務一直並不是完全沒有問題。", "完成時：這項服務一直並不是完全沒有問題。")
        result = result.replace("報告句專家同意這項建議並非毫無可取之處。", "報告句：專家同意這項建議並非毫無可取之處。")
        result = result.replace("關係子句委員會選擇了一個並非毫無風險的方案。", "關係子句：委員會選擇了一個並非毫無風險的方案。")
        result = result.replace("讓步從句雖然這個方法並非毫無弱點", "讓步從句：雖然這個方法並非毫無弱點")
        result = result.replace(
            "；一般現在式定期練習會帶來更大的自信。",
            "。一般現在式：定期練習會帶來更大的自信。",
        )
        result = result.replace("一般過去式較低成本帶來了更高利潤。", "一般過去式：較低成本帶來了更高利潤。")
        result = result.replace("完成式這些改革已帶來更安全的工作環境。", "完成式：這些改革已帶來更安全的工作環境。")
        result = result.replace("情態動詞新制度可能會帶來較短的輪候時間。", "情態動詞：新制度可能會帶來較短的輪候時間。")
        result = result.replace("否定句額外努力並沒有帶來更好的成果。", "否定句：額外努力並沒有帶來更好的成果。")
        result = result.replace("疑問句較高薪金是否一定會帶來更強的工作動力？", "疑問句：較高薪金是否一定會帶來更強的工作動力？")
        # Structural-heading removal must not leave an orphan join separator.
        result = re.sub(r"([。！？])\s*；", r"\1", result)
        if result.endswith("；"):
            result = result[:-1] + "。"
        result = re.sub(r"(?:；\s*){2,}", "；", result)
        result = remove_unmatched_delimiters(result, "「", "」")
        result = remove_unmatched_delimiters(result, "（", "）")
        result = remove_unmatched_delimiters(result, "【", "】")
        # Some malformed source parentheses cannot be recognized until the
        # unmatched-mark cleanup above has exposed their actual span.  Apply
        # the reviewed category formatting once more to that normalized form.
        result = result.replace(
            "時間（Time；出發前，你不妨查看天氣。 條件（Condition；如果問題持續，你不妨尋求協助。 原因（Reason）；由於商店較早關門，你不妨現在前往。） 目的（Purpose）；為免遺失工作內容，你不妨定期儲存檔案。）",
            "時間：出發前，你不妨查看天氣。條件：如果問題持續，你不妨尋求協助。原因：由於商店較早關門，你不妨現在前往。目的：為免遺失工作內容，你不妨定期儲存檔案。",
        )
        result = result.replace(
            "現在（Present；他很可能在家。 將來（Future；價格很可能會上升。 過去（Past；他們很可能錯過了巴士。） 現在完成包裹很可能已經送到。） 情態動詞這部機器很可能可以修理。）",
            "現在式：他很可能在家。將來式：價格很可能會上升。過去式：他們很可能錯過了巴士。現在完成式：包裹很可能已經送到。情態動詞：這部機器很可能可以修理。",
        )
        result = result.replace(
            "現在式（Present；這個方法一點也不可靠。 這些指示一點也不清楚。 過去式（Past；這段旅程一點也不舒適。 這些討論一點也不簡短。 完成式（Perfect；談判進展一直一點也不順利。） 這個過程一直一點也不透明。） 未來式（Future）；最後階段絕不會簡單直接。）",
            "現在式：這個方法一點也不可靠。這些指示一點也不清楚。過去式：這段旅程一點也不舒適。這些討論一點也不簡短。完成式：談判進展一直一點也不順利。這個過程一直一點也不透明。未來式：最後階段絕不會簡單直接。",
        )
        result = result.replace(
            "現在（Present；協議差不多已經定案。 街道幾乎空無一人。 過去（Past；觀眾當時幾乎鴉雀無聲。 道路當時幾乎空無一人。 將來式及情態動詞項目到下星期便差不多完成。 要取得進一步進展幾乎不可能。 這個物種可能已經幾乎絕種。 完成式及被動式該份文件幾乎已被遺忘。 該項目當時幾乎已被放棄。） 房屋當時幾乎已被完全摧毀。）",
            "現在式：協議差不多已經定案。街道幾乎空無一人。過去式：觀眾當時幾乎鴉雀無聲。道路當時幾乎空無一人。將來式及情態動詞：項目到下星期便差不多完成。要取得進一步進展幾乎不可能。這個物種可能已經幾乎絕種。完成式及被動式：該份文件幾乎已被遺忘。該項目當時幾乎已被放棄。房屋當時幾乎已被完全摧毀。",
        )
        result = result.replace(
            "則可以表示：（far from；距離很遠；遠非某種狀態；完全不。村莊距離城市很遠。 村莊與城市的環境截然不同。）",
            "而【far from】可以表示距離很遠、遠非某種狀態或完全不。例句：村莊距離城市很遠；村莊與城市的環境截然不同。",
        )
        result = result.replace(
            "代表：（That）；",
            "詞語【That】代表前文所說的整項內容。",
        )
        result = result.replace(
            "整個表達的字面意思接近：如果你不介意我這樣說實際使用時，通常相當於：恕我直言希望你不介意我這樣說",
            "整個表達的字面意思接近「如果你不介意我這樣說」；實際使用時，通常相當於「恕我直言」，也可表示希望你不介意我這樣說。",
        )
        result = result.replace(
            "【all the evidence；all the signs；all the available information；all the results；all the known facts。Everything points to a misunderstanding.】",
            "【all the evidence】、【all the signs】、【all the available information】、【all the results】和【all the known facts】。例句【Everything points to a misunderstanding.】",
        )
        result = result.replace(
            "【all the evidence,；all the signs,；all the available information,；all the results,；all the known facts.；Everything points to a misunderstanding.】",
            "【all the evidence】、【all the signs】、【all the available information】、【all the results】和【all the known facts】。例句【Everything points to a misunderstanding.】",
        )
        result = result.replace(
            "口語中常使用縮寫，但本練習使用完整形式兩者意思相同，但為了讓學生穩定掌握完整結構，本練習的所有答案均使用 for what it is worth",
            "口語中常使用縮寫，但本練習使用完整形式。兩者意思相同；為了讓學生穩定掌握完整結構，本練習的所有答案均使用【for what it is worth】。",
        )
        result = result.replace(
            "並非真的指「每一件物件」在這個句型中",
            "並非真的指「每一件物件」。在這個句型中",
        )
        result = result.replace(
            "代表前面的整項說法這裏的 that 並非指某一件物件，而是代表前面提出的整個意見、聲稱或論點。公司表示這套系統很安全。話雖如此，但仍有需要進一步測試。 詞語【That】代表前文所說的整項內容。",
            "這裏的【that】並非指某一件物件，而是代表前面提出的整個意見、聲稱或論點。例如，公司表示這套系統很安全；話雖如此，仍有需要進一步測試。詞語【That】代表前文所說的整項內容。",
        )
        result = result.replace(
            "目標表達【“me”】是進行 “saying” 的人在這個表達中：",
            "在目標表達中，詞語【me】指進行 saying 的人：",
        )
        result = result.replace(
            "動詞可以配合不同時態和主語改變現在式：",
            "動詞可以配合不同時態和主語改變。現在式：",
        )
        result = result.replace(
            "動詞須按照主語和時間改變現在式：",
            "動詞須按照主語和時間改變。現在式：",
        )
        result = result.replace(
            "不要與 all but 混淆絕非不可能幾乎不可能這個計劃絕非不可能。 這個計劃幾乎不可能實行。",
            "不要混淆【anything but impossible】和【all but impossible】：前者表示「絕非不可能」，後者表示「幾乎不可能」。這個計劃絕非不可能。這個計劃幾乎不可能實行。",
        )
        result = result.replace(
            "不要把這個用法與 all but + noun 混淆當 all but 放在名詞或數量詞前面時",
            "不要把這個用法與【all but + noun】混淆。當 all but 放在名詞或數量詞前面時",
        )
        result = result.replace(
            "與 not without reason 等結構的分別他感到擔心，而且不是毫無理由的。",
            "與【not without reason】等結構的分別：他感到擔心，而且不是毫無理由的。",
        )
        result = result.replace(
            "這個句型不只表示金錢上的代價詞語【「cost」】可以是：",
            "這個句型不只表示金錢上的代價。詞語【cost】可以指：",
        )
        result = result.replace(
            "不一定等於 proves that 通常表示證據已足以確定某件事。",
            "本句型不一定等於【proves that】；後者通常表示證據已足以確定某件事。",
        )
        result = result.replace("核心表達直接問句最常見的現在式：", "核心表達：直接問句最常見的現在式是：")
        result = result.replace(
            "優質練習應把核心句型放入多種自然的文法結構中。",
            "這個核心句型可以自然地用作直接建議，也可放在時間、條件、原因或讓步子句之後。",
        )
        result = result.replace("過去式那麼，租戶當時陷入了甚麼處境？", "過去式：那麼，租戶當時陷入了甚麼處境？")
        result = result.replace(
            "核心固定表達核心固定表達是：【Let me put it this way:；The words before or around it may change, but the expression itself should remain complete.】 前面或外圍的句子可以改變，但這個固定表達本身應保持完整。",
            "核心固定表達是【Let me put it this way:】。前面或外圍的字詞可以改變，但這個固定表達本身應保持完整。",
        )
        result = result.replace(
            "前面的字詞並非固定部分以下字詞可以放在固定表達前：【Well,；Frankly,；To be honest,；If I may,；In practical terms,；For the sake of clarity,；To be honest, let me put it this way: the meal was acceptable, but I would not order it again.】",
            "前面的字詞並非固定部分。以下字詞可以放在固定表達前：【Well,】、【Frankly,】、【To be honest,】、【If I may,】、【In practical terms,】和【For the sake of clarity,】。例句【To be honest, let me put it this way: the meal was acceptable, but I would not order it again.】",
        )
        result = result.replace(
            "在：【X is more of A than B.】 例句 A：是說話者認為較準確的描述。。較準確的描述：an introduction 較不準確的描述：a negotiation 把 A 和 B 的位置對調，句子的意思也會改變。",
            "在【X is more of A than B】中，A 是說話者認為較準確的描述。例句【The meeting was more of an introduction than a negotiation.】中，較準確的描述是【an introduction】，較不準確的描述是【a negotiation】。把 A 和 B 的位置對調，句子意思也會改變。",
        )
        result = re.sub(r"([。！？])\s*；", r"\1", result)
        result = re.sub(r"([。！？])(?:\s*[。！？])+", r"\1", result)
        result = re.sub(r"\s+([，。！？；：])", r"\1", result)
        if result.endswith("；"):
            result = result[:-1] + "。"
    return result


def chinese_first_mixed_fragment(prefix: str, suffix: str) -> str:
    """Render a short English token/label as natural Chinese-first prose."""

    raw_prefix = prefix.strip()
    wrapped_parenthesis = (
        raw_prefix.startswith(("（", "(")) and suffix.strip().endswith(("）", ")"))
    )
    if wrapped_parenthesis:
        raw_prefix = raw_prefix[1:].strip()
        suffix = suffix.strip()[:-1].strip()
    lettered = re.match(r"^([A-Z])[.] ?\s*(.*)$", raw_prefix)
    token = normalize_teaching_output(raw_prefix).strip(" :：、,;")
    suffix = suffix.strip()
    if lettered:
        letter, label = lettered.groups()
        label_text = f"【{label}】" if label else ""
        return f"第 {letter} 項{label_text}：{suffix}；"
    dialogue = re.match(r"^([A-Z])\s*[：:]?$", token)
    if dialogue:
        return f"例句 {dialogue.group(1)}：{suffix}。"
    if token.endswith("="):
        return f"{token} {suffix}"
    if raw_prefix.rstrip().endswith((":", "：")):
        return f"詞語【{token}】代表{suffix}；"
    if suffix.startswith(("後面", "前面")):
        return f"在【{token}】{suffix}"
    if suffix.startswith(("是", "不是", "表示", "用於", "通常", "常", "可以", "並不", "和", "或", "引導")):
        return f"詞語【{token}】{suffix}"
    if len(CHINESE.findall(suffix)) <= 8 and not re.search(r"[。！？；]", suffix):
        return f"{suffix}（{token}）；"
    return f"以【{token}】為例：{suffix}"


def split_mixed_source_line(line: str) -> tuple[str, str]:
    """Return the standalone English and Chinese portions of one PDF line.

    PDF extraction occasionally places an English example and its parenthesised
    Chinese translation on the same line.  Formula tokens embedded inside a
    Chinese explanation are deliberately retained in the Chinese portion.
    """

    if not CHINESE.search(line):
        return line, ""
    first_cjk = CHINESE.search(line)
    assert first_cjk is not None
    prefix = line[: first_cjk.start()]
    opening = max(prefix.rfind("（"), prefix.rfind("("))
    if opening >= 0 and len(re.findall(r"[A-Za-z]", prefix[:opening])) >= 5:
        english = prefix[:opening].strip().rstrip("（(「『【").rstrip()
        chinese = line[opening:].strip()
    elif first_cjk.start() > 0:
        plain_prefix = re.sub(r"^\s*\d{1,2}[.．]\s*", "", prefix).strip()
        latin_count = len(re.findall(r"[A-Za-z]", plain_prefix))
        word_count = len(re.findall(r"[A-Za-z]+(?:['’][A-Za-z]+)?", plain_prefix))
        is_numbered_heading = bool(re.match(r"^\s*\d{1,2}[.．]", prefix))
        if (is_numbered_heading and latin_count) or (latin_count >= 8 and word_count >= 2):
            english = prefix.strip().rstrip("（(「『【").rstrip()
            chinese = line[first_cjk.start() :].strip()
        elif latin_count:
            english = ""
            chinese = chinese_first_mixed_fragment(
                plain_prefix, line[first_cjk.start() :].strip()
            )
        else:
            english = ""
            chinese = line[first_cjk.start() :].strip()
    else:
        english = ""
        chinese = line.strip()
    stripped_chinese = chinese.strip()
    if (
        (stripped_chinese.startswith("（") and stripped_chinese.endswith("）"))
        or (stripped_chinese.startswith("(") and stripped_chinese.endswith(")"))
    ):
        chinese = stripped_chinese[1:-1].strip()
    return english, chinese


def reference_insert_candidates(lines: list[str], start: int) -> list[str]:
    """Return source formula/example tokens required by a preceding Chinese label.

    Chinese source explanations often introduce an English formula or model
    answer with a colon on one line.  Those tokens are teaching content, not an
    English prose block, so they must remain visible inside the Chinese-primary
    field.  Collection stops at the next Chinese line and deliberately ignores
    extraction-only labels such as ``Correct:`` and ``Formula``.
    """

    candidates: list[str] = []
    for line in lines[start:]:
        english, chinese = split_mixed_source_line(line)
        if chinese:
            break
        if not english:
            continue
        cleaned = normalize_teaching_output(english)
        if not cleaned or STRUCTURAL_ENGLISH_ONLY.fullmatch(cleaned):
            continue
        cleaned = re.sub(r"^(?:Pattern\s+\d+|[A-Z])\s*[:.]\s*", "", cleaned).strip()
        if not cleaned:
            continue
        if len(cleaned) > 260 or len(re.findall(r"[A-Za-z]+", cleaned)) > 35:
            break
        if (
            candidates
            and len(re.findall(r"[A-Za-z]+", candidates[-1])) >= 8
            and re.search(
                r"\b(?:and|or|of|that|with|for|from|into|than|as|to)\s*$",
                candidates[-1],
                re.IGNORECASE,
            )
        ):
            candidates[-1] = joined((candidates[-1], cleaned))
        else:
            candidates.append(cleaned)
        if len(candidates) >= 8:
            break
        # A complete sentence after 正確：/錯誤： is the referenced item;
        # subsequent prose belongs to the English explanation, not the label.
        if (
            re.search(r"[.!?]”?\s*$", cleaned)
            and not cleaned.endswith("...")
            and len(candidates) == 1
        ):
            break
    return candidates


def chinese_from_chunk(lines: list[str]) -> str:
    """Build Chinese-primary prose while retaining referenced source tokens."""

    result: list[str] = []
    for index, line in enumerate(lines):
        english, chinese = split_mixed_source_line(line)
        if not chinese:
            continue

        # A short target expression can precede a Chinese predicate on the same
        # extracted line (for example ``The time has come to 則能表達…``).
        # Keep that expression as a quoted token so the Chinese sentence retains
        # its grammatical subject.  Structural page labels such as ``Shells``
        # are intentionally discarded.
        english_words = len(re.findall(r"[A-Za-z]+", english))
        if (
            english
            and english_words <= 10
            and chinese.startswith(
                ("則", "是", "表示", "能", "可", "會", "並不", "不是", "本", "等")
            )
            and not re.fullmatch(r"(?:Shells?|Pattern|Formula)", english, re.IGNORECASE)
        ):
            chinese = f"目標表達【{normalize_teaching_output(english)}】{chinese}"

        if chinese.rstrip().endswith(("：", ":")) or REFERENCE_LABEL.search(chinese):
            inserts = reference_insert_candidates(lines, index + 1)
            if inserts:
                chinese = f"{chinese}【{'；'.join(inserts)}】"
        result.append(chinese)
    return joined(result)


def english_from_chunk(
    lines: list[str],
    card_id: str,
    editorial_en_ids_used: set[str],
) -> tuple[str, str]:
    english_lines: list[str] = []
    for line in lines:
        english, _ = split_mixed_source_line(line)
        if (
            english
            and not re.fullmatch(r"[●•▪◦]+", english)
            and english not in {"Correct:", "Incorrect:", "Example:", "Examples:"}
        ):
            english_lines.append(english)
    value = joined(english_lines)
    if len(re.findall(r"[A-Za-z]", value)) >= 12:
        return value, "pdf"
    try:
        translation = EDITORIAL_EN_TRANSLATIONS[card_id]
    except KeyError as error:
        raise ValueError(
            f"{card_id}: source has no substantive English teaching text and needs a reviewed translation"
        ) from error
    editorial_en_ids_used.add(card_id)
    return translation, "editorial-translation"


def incomplete_english_ending(value: str, *, formula: bool = False) -> bool:
    """Detect a wrapped English clause that was cut off at the PDF margin."""

    stripped = value.strip()
    if re.search(r"(?:\.\.\.|[?])[”’\"']?$", stripped):
        return False
    if re.search(r"\b(?:meaning|likely)\s+to\s*$", stripped, re.IGNORECASE):
        return True
    if formula:
        return bool(
            re.search(
                r"\b(?:and|or|of|that|with|for|from|into|than|as|because)\s*$",
                stripped,
                re.IGNORECASE,
            )
        )
    return False


def unresolved_chinese_reference(value: str) -> bool:
    """Return true when a Chinese label still points to omitted source text."""

    if value.rstrip().endswith(("：", ":")):
        return True
    labels = (
        r"(?:正確|錯誤|不要使用|應使用|不要寫(?:成)?|寫成|"
        r"核心(?:句型|結構|詞語|表達)|你也可以寫|直接說)"
    )
    return bool(
        re.search(
            rf"{labels}[^。！？；]{{0,20}}[：:]\s*(?={labels}|$)",
            value,
        )
    )


def malformed_chinese_parenthetical_span(value: str) -> bool:
    """Reject extraction-created parentheses that swallow several examples."""

    for span in re.findall(r"（([^）]*)）", value):
        if len(span) > 120 or len(re.findall(r"[。！？]", span)) > 1:
            return True
    return False


def bilingual_cards(
    lesson_id: str,
    kind: str,
    lines: list[str],
    editorial_ids_used: set[str],
    refinement_ids_used: set[str],
    editorial_en_ids_used: set[str],
) -> list[dict[str, str]]:
    chunks = [item for item in teaching_chunks(lines, lesson_id, kind) if joined(item[1])]
    if not chunks:
        raise ValueError(f"{lesson_id}: {kind} section has no source teaching cards")
    cards: list[dict[str, str]] = []
    for card_id, source_chunk in chunks:
        chunk = deduplicate_source_lines(card_id, source_chunk)
        en, en_source = english_from_chunk(
            chunk, card_id, editorial_en_ids_used
        )
        if card_id in SOURCE_EN_REFINEMENTS:
            en = SOURCE_EN_REFINEMENTS[card_id]
            en_source = "pdf-with-editorial-clarification"
        zh = chinese_from_chunk(chunk)
        zh_source = "pdf"
        if not zh:
            try:
                zh = EDITORIAL_ZH_TRANSLATIONS[card_id]
            except KeyError as error:
                raise ValueError(
                    f"{card_id}: source has no Chinese teaching text and needs a reviewed translation"
                ) from error
            editorial_ids_used.add(card_id)
            zh_source = "editorial-translation"
        if card_id in SOURCE_ZH_REFINEMENTS:
            zh = SOURCE_ZH_REFINEMENTS[card_id]
            refinement_ids_used.add(card_id)
            zh_source = "pdf-with-editorial-clarification"
        en = normalize_teaching_output(en)
        zh = normalize_teaching_output(zh, chinese=True)
        en = deduplicate_output_sentences(card_id, "en", en)
        zh = deduplicate_output_sentences(card_id, "zh", zh)
        card = {
            "id": card_id,
            "zh": zh,
            "en": en,
            "enSource": en_source,
            "zhSource": zh_source,
        }
        cjk_count = len(CHINESE.findall(zh))
        # Quoted target-language formulas/examples are references embedded in
        # Chinese prose, not competing English explanatory prose.  Exclude only
        # those balanced quotations from the Chinese-primary dominance check.
        zh_prose = re.sub(r"(?:「[^」]*」|【[^】]*】)", "", zh)
        latin_count = len(re.findall(r"[A-Za-z]", zh_prose))
        if not CHINESE.match(zh.strip()):
            QUALITY_ISSUES.append(f"{card_id}: Chinese-primary text must begin in Chinese")
        if cjk_count < 12:
            QUALITY_ISSUES.append(f"{card_id}: Chinese explanation is not substantive")
        if latin_count > cjk_count * 2:
            QUALITY_ISSUES.append(f"{card_id}: Chinese-primary text is Latin-dominated")
        if re.match(
            r"^(?:重要規則|學習好處)：\s*(?:\d+[.．]\s*)?[A-Za-z]", zh
        ):
            QUALITY_ISSUES.append(f"{card_id}: generic Chinese label precedes English prose")
        if re.match(r"^其中，\s*\d+[.．]\s*[A-Za-z]", zh):
            QUALITY_ISSUES.append(f"{card_id}: raw numbered English heading leaked into Chinese")
        if en.startswith(("This rule explains", "This benefit explains")):
            QUALITY_ISSUES.append(f"{card_id}: generic English fallback is forbidden")
        if CHINESE.search(en):
            QUALITY_ISSUES.append(f"{card_id}: Chinese text leaked into the English explanation")
        if re.search(r"[，。；：！？、／「」『』【】]", en):
            QUALITY_ISSUES.append(f"{card_id}: Chinese punctuation leaked into the English explanation")
        if re.search(r"[（(「『【]\s*$", en):
            QUALITY_ISSUES.append(f"{card_id}: English explanation ends with a dangling opening mark")
        if re.match(r"^\d{1,2}[.):．]\s*", en):
            QUALITY_ISSUES.append(f"{card_id}: source card ordinal leaked into English output")
        if re.search(r"[●•▪◦]", en):
            QUALITY_ISSUES.append(f"{card_id}: raw source bullet leaked into English output")
        if re.search(r"A strong exercise should (?:teach|practise)", en, re.IGNORECASE):
            QUALITY_ISSUES.append(f"{card_id}: source authoring meta-text leaked into English output")
        if "X is more of A than A is" in en:
            QUALITY_ISSUES.append(f"{card_id}: English formula was truncated before B")
        if zh.count("「") != zh.count("」"):
            QUALITY_ISSUES.append(f"{card_id}: unmatched Chinese quote delimiter")
        if zh.count("（") != zh.count("）"):
            QUALITY_ISSUES.append(f"{card_id}: unmatched Chinese parenthesis delimiter")
        if zh.count("【") != zh.count("】"):
            QUALITY_ISSUES.append(f"{card_id}: unmatched formula-reference delimiter")
        if re.search(
            r"\b(?:Best\s+)?Core Grammar Bank\b|\bPattern\s+\d+\s*:",
            en,
            re.IGNORECASE,
        ):
            QUALITY_ISSUES.append(f"{card_id}: raw structural teaching heading leaked into English")
        if re.search(
            r"核心(?:文法句型|文法|句型|句式|句法)(?:庫|組合)|"
            r"相似句型比較|可選延伸部分",
            zh,
        ):
            QUALITY_ISSUES.append(f"{card_id}: raw structural teaching heading leaked into Chinese")
        if re.search(r"【（|（【", zh):
            QUALITY_ISSUES.append(f"{card_id}: mixed formula/parenthesis delimiters are malformed")
        if re.search(r"[。！？]\s*；", zh):
            QUALITY_ISSUES.append(f"{card_id}: orphan Chinese section-join separator")
        if re.search(r"[。！？]\s*[。！？]", zh):
            QUALITY_ISSUES.append(f"{card_id}: duplicated Chinese sentence punctuation")
        if zh.rstrip().endswith("；"):
            QUALITY_ISSUES.append(f"{card_id}: Chinese explanation ends with an orphan separator")
        if malformed_chinese_parenthetical_span(zh):
            QUALITY_ISSUES.append(f"{card_id}: oversized or multi-sentence Chinese parenthetical span")
        if re.search(
            r"一部分核心句型|條件如果|固定部分核心|的人詞語【|"
            r"如果你不介意我這樣說實際使用時|恕我直言希望|"
            r"一般現在式定期|一般過去式較低|完成式這些|情態動詞新制度|"
            r"否定句額外|疑問句較高|現在式那麼|過去式城鎮|"
            r"完成式或被動式這種|將來式或情態動詞建築|"
            r"一般現在時或過去時這套|情態動詞這項建議|完成時這項服務|"
            r"報告句專家|關係子句委員會|讓步從句雖然|"
            r"（Present；|（Past；|（Perfect；|（Future）?；|"
            r"過去式那麼|核心固定表達核心|前面的字詞並非固定部分以下|"
            r"Let me put it this way:；The words|Well,；Frankly|"
            r"all the known facts。Everything points|all the evidence,；|"
            r"使用完整形式兩者意思相同|並非真的指「每一件物件」在這個句型中|"
            r"在：【X is more of A than",
            zh,
        ):
            QUALITY_ISSUES.append(f"{card_id}: Chinese labels were concatenated without a separator")
        if "優質練習應把核心句型" in zh:
            QUALITY_ISSUES.append(f"{card_id}: source authoring meta-text leaked into Chinese output")
        if unresolved_chinese_reference(zh):
            QUALITY_ISSUES.append(f"{card_id}: Chinese explanation has an unresolved source reference")
        if incomplete_english_ending(en):
            QUALITY_ISSUES.append(f"{card_id}: English explanation ends mid-clause")
        english_word_count = len(
            re.findall(r"[A-Za-z]+(?:['’][A-Za-z]+)?", en)
        )
        if (
            english_word_count >= 40
            and cjk_count * 2 < english_word_count
            and card_id not in BILINGUAL_RATIO_EXCEPTIONS
        ):
            QUALITY_ISSUES.append(
                f"{card_id}: Chinese explanation covers less than half of the English teaching prose"
            )
        if len(en) > TEACHING_CARD_ENGLISH_LIMIT:
            QUALITY_ISSUES.append(
                f"{card_id}: English teaching card exceeds {TEACHING_CARD_ENGLISH_LIMIT} characters"
            )
        cards.append(card)
    return cards


def exercise_instructions(rows: list[tuple[int, str]], exercise_index: int) -> dict[str, list[str]]:
    first_number = next(
        index
        for index in range(exercise_index + 1, len(rows))
        if rows[index][1] == "1"
    )
    lines = [line for _, line in rows[exercise_index + 1 : first_number]]
    lines = [line for line in lines if not re.match(r"^Questions?\s+\d", line, re.IGNORECASE)]
    english = [line for line in lines if re.search(r"[A-Za-z]", line) and not CHINESE.search(line)]
    chinese = [line for line in lines if CHINESE.search(line)]
    if not english:
        english = ["Rewrite each item using the target structure while preserving its meaning."]
    if not chinese:
        chinese = ["使用目標句型改寫每題，並保留原意。"]
    english = [
        normalize_teaching_output(
            re.sub(r"^[●•▪◦]\s*", "", line).removesuffix(";")
            + ("." if line.endswith(";") else "")
        )
        for line in english
    ]
    chinese = [
        (re.sub(r"^[●•▪◦]\s*", "", line)[:-1] + "。")
        if re.sub(r"^[●•▪◦]\s*", "", line).endswith("；")
        else re.sub(r"^[●•▪◦]\s*", "", line)
        for line in chinese
    ]
    return {"en": english, "zh": chinese}


def strip_dialogue_quotes(answer: str) -> str:
    value = answer.strip()
    value = re.sub(r"[“”‘’\"']", "", value)
    return value.strip()


def unique_highlight(answer: str, used: set[str]) -> str:
    candidates = [answer]
    stripped = answer.rstrip(".!?")
    if stripped != answer:
        candidates.append(stripped)
    words = list(re.finditer(r"\S+", answer))
    for width in range(max(1, len(words) - 1), 0, -1):
        for start in range(0, len(words) - width + 1):
            candidate = answer[words[start].start() : words[start + width - 1].end()]
            candidates.append(candidate)
    for candidate in candidates:
        if candidate and candidate not in used and answer.casefold().count(candidate.casefold()) == 1:
            used.add(candidate)
            return candidate
    raise ValueError(f"Could not choose a unique highlight for {answer!r}")


PAGE_FIELDS = (
    "numberPage",
    "questionPage",
    "promptZhPage",
    "starterPage",
    "answerNumberPage",
    "answerPage",
    "answerZhPage",
    "promptContinuationPage",
    "answerContinuationPage",
)


def questions_for(lesson_id: str, extracted: dict[str, Any]) -> list[dict[str, Any]]:
    answer_owners: dict[str, str] = {}
    prompt_keys: set[str] = set()
    highlights: set[str] = set()
    result: list[dict[str, Any]] = []
    for raw in extracted["questions"]:
        number = int(raw["number"])
        question_id = f"{lesson_id}-q{number:02d}"
        answer = str(raw["answer"])
        prompt_key = normalized_key(f"{raw['prompt']}\0{raw['promptZh']}")
        if prompt_key in prompt_keys:
            raise ValueError(f"{question_id}: duplicate bilingual prompt")
        prompt_keys.add(prompt_key)

        source = {field: raw[field] for field in PAGE_FIELDS if field in raw}
        question: dict[str, Any] = {
            "id": question_id,
            "number": number,
            "source": source,
            "prompt": raw["prompt"],
            "promptZh": raw["promptZh"],
            "promptZhSource": "pdf",
            "starter": raw["starter"],
            "answer": answer,
            "answerZh": raw["answerZh"],
            "answerZhSource": "pdf",
            "highlight": unique_highlight(answer, highlights),
        }

        answer_key = normalized_key(f"{answer}\0{raw['answerZh']}")
        if answer_key in answer_owners:
            question["duplicateAnswerOf"] = answer_owners[answer_key]
        else:
            answer_owners[answer_key] = question_id

        if re.match(r"^[“”‘’\"']", answer.strip()):
            quote_free = strip_dialogue_quotes(answer)
            if quote_free and normalized_key(quote_free) != normalized_key(answer):
                question["acceptedAnswers"] = [quote_free]
        result.append(question)
    if len(result) != EXPECTED_QUESTIONS_PER_LESSON:
        raise ValueError(
            f"{lesson_id}: expected {EXPECTED_QUESTIONS_PER_LESSON} questions, found {len(result)}"
        )
    return result


def lesson_from_source(
    item: SourceFile,
    extract_questions,
    editorial_ids_used: set[str],
    refinement_ids_used: set[str],
    editorial_en_ids_used: set[str],
) -> tuple[dict[str, Any], dict[str, Any]]:
    page_count, rows = page_lines(item.path)
    target_index = index_of(rows, TARGET_HEADING)
    exercise_index = index_of(rows, EXERCISE_HEADING)
    answer_index = index_of(rows, ANSWER_HEADING, (exercise_index or 0) + 1)
    benefits_index = index_of(rows, BENEFITS_HEADING, (target_index or 0) + 1)
    rules_index = index_of(rows, RULES_HEADING, (target_index or 0) + 1)
    if target_index is None or exercise_index is None or answer_index is None or benefits_index is None:
        raise ValueError(f"{item.path.name}: required section heading is missing")
    if not target_index < benefits_index < exercise_index < answer_index:
        raise ValueError(f"{item.path.name}: section order is invalid")

    lesson_id = f"ss{item.system_order}"
    title = source_title(rows, target_index)
    core = quoted_core(title)
    formula = normalize_teaching_output(
        target_formula(rows, target_index, rules_index or benefits_index, core)
    )
    if incomplete_english_ending(formula, formula=True):
        QUALITY_ISSUES.append(f"{lesson_id}: target formula ends mid-clause")
    example_pair = primary_example(rows, target_index, rules_index or benefits_index)

    extracted = extract_questions(item.path, item.system_order)
    questions = questions_for(lesson_id, extracted)
    if example_pair is None:
        example_pair = (questions[0]["answer"], questions[0]["answerZh"])
    example, example_zh = example_pair
    example = normalize_teaching_output(example)

    if rules_index is None:
        rule_lines = [line for _, line in rows[target_index + 1 : benefits_index]]
        missing_rule_note = (
            "The PDF has no separate Important Rules heading; its complete target-structure and "
            "grammar-bank material before Benefits is retained as the rule section."
        )
    else:
        rule_lines = [line for _, line in rows[rules_index + 1 : benefits_index]]
        missing_rule_note = None
    benefit_lines = [line for _, line in rows[benefits_index + 1 : exercise_index]]

    mapping_note = (
        f"Source number {item.source_number} maps to {lesson_id}: an earlier source archive contains "
        "two distinct PDFs numbered 201, and this batch contains two distinct PDFs numbered 310; "
        "stable source-number/filename ordering preserves every published and supplied item."
    )
    omissions = [
        "Chinese and English teaching lines are separated into Chinese-primary and English-secondary "
        "fields; formula tokens embedded in source Chinese explanations are preserved.",
        "A source card containing English teaching text only receives a reviewed, card-specific "
        "Traditional Chinese editorial translation; generic fallback text is rejected.",
        "A source Chinese line that extracts as an orphaned label or example fragment is replaced "
        "with a reviewed, source-faithful Chinese clarification.",
        mapping_note,
    ]
    if missing_rule_note:
        omissions.append(missing_rule_note)

    lesson = {
        "id": lesson_id,
        "order": item.system_order,
        "slug": slugify(core, item.system_order),
        "title": title,
        "titleZh": title,
        "titleEn": normalize_teaching_output(f"Using “{core}”"),
        "titleEnSource": "editorial-translation",
        "source": {
            "file": item.path.name,
            "pageCount": page_count,
            "lessonPages": list(range(1, extracted["exerciseHeadingPage"] + 1)),
            "exercisePages": list(
                range(extracted["exerciseHeadingPage"], extracted["answerHeadingPage"] + 1)
            ),
            "answerPages": list(range(extracted["answerHeadingPage"], page_count + 1)),
            "sha256": sha256(item.path),
            "sourceNumber": item.source_number,
            "systemOrder": item.system_order,
            "omissions": omissions,
        },
        "formula": formula,
        "formulas": [
            {
                "id": f"{lesson_id}-formula-01",
                "labelEn": "Target Structure",
                "labelZh": "目標句型",
                "formula": formula,
            }
        ],
        "example": example,
        "exampleZh": example_zh,
        "examples": [
            {
                "id": f"{lesson_id}-example-01",
                "en": example,
                "zh": example_zh,
                "highlight": example,
            }
        ],
        "rules": bilingual_cards(
            lesson_id,
            "rule",
            rule_lines,
            editorial_ids_used,
            refinement_ids_used,
            editorial_en_ids_used,
        ),
        "benefits": bilingual_cards(
            lesson_id,
            "benefit",
            benefit_lines,
            editorial_ids_used,
            refinement_ids_used,
            editorial_en_ids_used,
        ),
        "sourceOmissions": omissions,
        "instructions": exercise_instructions(rows, exercise_index),
        "questions": questions,
    }
    manifest = {
        "sourceNumber": item.source_number,
        "sourceFile": item.path.name,
        "sourceSha256": lesson["source"]["sha256"],
        "pageCount": page_count,
        "systemOrder": item.system_order,
        "lessonId": lesson_id,
        "title": title,
        "questionCount": len(questions),
        "ruleCardCount": len(lesson["rules"]),
        "benefitCardCount": len(lesson["benefits"]),
        "hasSeparateImportantRulesHeading": rules_index is not None,
    }
    return lesson, manifest


def teaching_sentence_units(value: str) -> list[str]:
    return [
        re.sub(r"\s+", " ", unit).strip()
        for unit in re.split(r"(?<=[.!?。！？])\s+|\s*;\s*", value)
        if len(re.sub(r"\s+", " ", unit).strip()) >= 18
    ]


def validate_cross_card_repeats(lessons: list[dict[str, Any]]) -> None:
    """Hard-fail every cross-card repeat not reviewed as source pedagogy."""

    observed: dict[tuple[str, str, str], dict[str, Any]] = {}
    card_sources: dict[tuple[str, str], str] = {}
    for lesson in lessons:
        for kind in ("rules", "benefits"):
            for card in lesson[kind]:
                card_sources[(card["id"], "en")] = card["enSource"]
                card_sources[(card["id"], "zh")] = card["zhSource"]
                for field in ("en", "zh"):
                    for sentence in teaching_sentence_units(card[field]):
                        key = (lesson["id"], field, normalized_key(sentence))
                        entry = observed.setdefault(
                            key, {"sentence": sentence, "cards": []}
                        )
                        if card["id"] not in entry["cards"]:
                            entry["cards"].append(card["id"])

    duplicates = {
        key: entry for key, entry in observed.items() if len(entry["cards"]) > 1
    }
    allowed = {
        (lesson_id, field, normalized_key(sentence)): {
            "sentence": sentence,
            **details,
        }
        for (lesson_id, field, sentence), details in PEDAGOGICAL_REPEAT_ALLOWLIST.items()
    }
    for key, entry in duplicates.items():
        approved = allowed.get(key)
        if approved is None:
            QUALITY_ISSUES.append(
                f"{key[0]}: unreviewed cross-card {key[1]} repeat {entry['sentence']!r} "
                f"in {entry['cards']}"
            )
            continue
        if tuple(entry["cards"]) != tuple(approved["cards"]):
            QUALITY_ISSUES.append(
                f"{key[0]}: reviewed repeat card inventory changed for {entry['sentence']!r}: "
                f"observed={entry['cards']}, approved={approved['cards']}"
            )
        for card_id in entry["cards"]:
            source = card_sources[(card_id, key[1])]
            if not source.startswith("pdf"):
                QUALITY_ISSUES.append(
                    f"{key[0]}: repeat {entry['sentence']!r} is not source-backed in {card_id}"
                )
        if not str(approved.get("reason", "")).startswith("The PDF"):
            QUALITY_ISSUES.append(
                f"{key[0]}: reviewed repeat {entry['sentence']!r} lacks a source-backed reason"
            )
    for key, approved in allowed.items():
        if key not in duplicates:
            QUALITY_ISSUES.append(
                f"{key[0]}: obsolete pedagogical-repeat allowlist entry {approved['sentence']!r}"
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--lesson-dir", type=Path, default=DEFAULT_LESSON_DIR)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--audit-only", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    QUALITY_ISSUES.clear()
    inventory = stable_inventory(args.source_dir)
    extract_questions = load_question_extractor()
    lessons: list[dict[str, Any]] = []
    manifest_rows: list[dict[str, Any]] = []
    editorial_ids_used: set[str] = set()
    refinement_ids_used: set[str] = set()
    editorial_en_ids_used: set[str] = set()
    for item in inventory:
        lesson, manifest = lesson_from_source(
            item,
            extract_questions,
            editorial_ids_used,
            refinement_ids_used,
            editorial_en_ids_used,
        )
        lessons.append(lesson)
        manifest_rows.append(manifest)

    for lesson in lessons:
        for field in ("titleEn", "formula", "example"):
            if re.search(r"[，。；：！？、／「」『』【】]", lesson[field]):
                QUALITY_ISSUES.append(
                    f"{lesson['id']}: Chinese punctuation leaked into English {field}"
                )
        for language, lines in lesson["instructions"].items():
            for index, line in enumerate(lines, 1):
                if re.search(r"[●•▪◦]", line):
                    QUALITY_ISSUES.append(
                        f"{lesson['id']}: raw source bullet leaked into {language} instruction {index}"
                    )
                if language == "zh" and line.rstrip().endswith("；"):
                    QUALITY_ISSUES.append(
                        f"{lesson['id']}: Chinese instruction {index} ends with an orphan separator"
                    )
                if language == "en" and re.search(r"[，。；：！？、／「」『』【】]", line):
                    QUALITY_ISSUES.append(
                        f"{lesson['id']}: Chinese punctuation leaked into English instruction {index}"
                    )

    validate_cross_card_repeats(lessons)

    if [lesson["order"] for lesson in lessons] != list(range(276, 346)):
        raise ValueError("Generated system orders are not contiguous ss276-ss345")
    if sum(len(lesson["questions"]) for lesson in lessons) != 3500:
        raise ValueError("Generated question total is not 3,500")
    expected_editorial_ids = set(EDITORIAL_ZH_TRANSLATIONS)
    if editorial_ids_used != expected_editorial_ids:
        missing = sorted(expected_editorial_ids - editorial_ids_used)
        unexpected = sorted(editorial_ids_used - expected_editorial_ids)
        raise ValueError(
            "Reviewed Chinese translation inventory does not match English-only source cards: "
            f"unused={missing}, unexpected={unexpected}"
        )
    expected_refinement_ids = set(SOURCE_ZH_REFINEMENTS)
    if refinement_ids_used != expected_refinement_ids:
        missing = sorted(expected_refinement_ids - refinement_ids_used)
        unexpected = sorted(refinement_ids_used - expected_refinement_ids)
        raise ValueError(
            "Reviewed Chinese refinement inventory does not match terse source cards: "
            f"unused={missing}, unexpected={unexpected}"
        )
    expected_editorial_en_ids = set(EDITORIAL_EN_TRANSLATIONS)
    if editorial_en_ids_used != expected_editorial_en_ids:
        missing = sorted(expected_editorial_en_ids - editorial_en_ids_used)
        unexpected = sorted(editorial_en_ids_used - expected_editorial_en_ids)
        raise ValueError(
            "Reviewed English translation inventory does not match Chinese-only source cards: "
            f"unused={missing}, unexpected={unexpected}"
        )
    if QUALITY_ISSUES:
        raise ValueError(
            "Teaching-card quality gates failed:\n" + "\n".join(QUALITY_ISSUES)
        )

    manifest = {
        "schemaVersion": 1,
        "sourceDirectory": args.source_dir.name,
        "sourceNumberRange": [FIRST_SOURCE_NUMBER, LAST_SOURCE_NUMBER],
        "systemOrderRange": [FIRST_SYSTEM_ORDER, FIRST_SYSTEM_ORDER + EXPECTED_FILES - 1],
        "fileCount": len(lessons),
        "questionCount": sum(len(lesson["questions"]) for lesson in lessons),
        "ordering": "source number ascending, then exact filename case-insensitive ascending",
        "anomalies": [
            "The existing ss275 is source 274, so supplied source 275 begins at ss276.",
            "Two distinct supplied PDFs are numbered 310; both are retained as adjacent lessons.",
            "Source 305 has no separate Important Rules heading; its pre-Benefits grammar bank is retained as rules.",
        ],
        "lessons": manifest_rows,
    }

    if not args.audit_only:
        args.lesson_dir.mkdir(parents=True, exist_ok=True)
        for lesson in lessons:
            output = args.lesson_dir / f"ss{lesson['order']}.json"
            output.write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        args.manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "files": len(lessons),
                "questions": sum(len(lesson["questions"]) for lesson in lessons),
                "first": manifest_rows[0],
                "last": manifest_rows[-1],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
