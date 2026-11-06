import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-479-v2-audio","audio","熱杯離開木桌後，最可能看見甚麼？",["桌面留下一圈白白的熱痕。", "桌面完全沒有變化。", "杯子底部碎成幾片。", "桌面出現刀劃的長線。"],"桌面留下一圈白白的熱痕。","heat mark 是熱物接觸表面留下的痕，不是杯子本身破裂。"),
  mc("native-479-v2-contrast","contrast","熱咖啡杯放在木桌上，杯底乾燥；移開後留下白圈。哪句最有根據？",["The cup left a heat mark.", "The cup left a fresh water spill.", "The cup scratched the table with a sharp edge.", "The table has a sticky label residue."],"The cup left a heat mark.","乾燥杯底和白圈較支持熱痕；並無液體、尖邊或標籤殘膠的線索。"),
  mc("native-479-v2-rewrite","rewrite","你原說 The table is ruined；其實是剛把熱杯放下後留了白圈，桌子仍可使用。哪句改寫較準？",["The hot cup left a heat mark on the table.", "The table has collapsed under the cup.", "The cup was cold and left no mark.", "The table is covered in greasy fingerprints."],"The hot cup left a heat mark on the table.","句子指出熱杯、白圈和桌面痕跡，比籠統說 ruined 更準確。"),
  {id:"native-479-v2-final",type:'open',style:"final",prompt:"新情境：熱茶杯放在木書桌上，拿開後留下淺白圓圈；你下次想避免再發生。寫一兩句英文說明痕跡和預防做法。",answers:["The hot cup left a heat mark on my desk. I’ll use a coaster next time.", "It left a pale heat mark on the wood. I should put hot drinks on a coaster.", "The tea cup left a white heat mark. Next time I’ll use a mat under it."],explanation:"要說明熱杯留下的白圈，再提出使用杯墊等預防方法。"}
];

const steps=[
  {"id": "native-479-v2-audio", "style": "audio", "label": "先聽結果", "title": "桌面多了甚麼？", "intro": "先聽句子，留意 left 指留下痕跡。", "model": "It left a heat mark.", "zh": "它留下了一道熱痕。", "audioOnly": true, "questions": ["native-479-v2-audio"]},
  {"id": "native-479-v2-contrast", "style": "contrast", "label": "分清痕跡", "title": "白圈還是水滴", "intro": "比較熱與液體造成的證據。", "questions": ["native-479-v2-contrast"]},
  {"id": "native-479-v2-rewrite", "style": "rewrite", "label": "向房東說明", "title": "不只說桌子壞了", "intro": "把原因與結果說清楚。", "questions": ["native-479-v2-rewrite"]},
  {"id": "native-479-v2-speak", "style": "speak", "label": "口頭轉述", "title": "告訴家人原因", "intro": "看到熱杯後的白圈，先說再聽示範。", "model": "The cup left a heat mark.", "zh": "那隻杯子留下了一道熱痕。", "speakingPrompt": "你看到熱杯在桌上留下白圈；向家人口說「那隻杯子留下了一道熱痕」。", "recording": "phrase", "questions": []},
  {"id": "native-479-v2-final", "style": "final", "label": "新家具自評", "title": "茶杯與書桌", "intro": "自己寫痕跡來源與預防方法。", "questions": ["native-479-v2-final"]}
];

export default {revision:2,summary:"用 It left a heat mark. 描述熱杯在木桌上留下白色圓圈，並與水漬或刮痕區分。",steps,questions,takeaways:["It left a heat mark.", "The cup left a heat mark."],completionTitle:"你能描述熱杯造成的桌面痕跡，並提出預防方法。"};
