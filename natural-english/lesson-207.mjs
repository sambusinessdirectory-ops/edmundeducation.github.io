import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-207-v2-audio","audio","說話者拿着放久的餅乾說這句，最可能發現甚麼？",["餅乾不再脆，味道也不新鮮。", "餅乾剛出爐而很熱。", "餅乾仍很脆，但表面有一點焦味。", "餅乾只是剛冷卻，仍然新鮮。"],"餅乾不再脆，味道也不新鮮。","gone stale 指食物放久後失去應有的新鮮口感。"),
  mc("native-207-v2-transfer","transfer","薯片袋沒封好，第二天吃起來軟軟的。哪句適合？",["The chips are stale.", "The chips are still crunchy.", "The chips are freshly fried.", "The chips are sealed in a new bag."],"The chips are stale.","薯片失去原本酥脆口感時也可說 stale；薯片袋沒封好會吸濕失脆，放久後的狀態也可說 stale。"),
  mc("native-207-v2-rewrite","rewrite","你想說「這些餅乾放久後不脆了」，哪句最貼切？",["These cookies have gone stale.", "These cookies are freshly baked.", "These cookies are burnt on the edges.", "These cookies are still warm from the oven."],"These cookies have gone stale.","stale 說明餅乾放久後不新鮮；watered down 用於飲料被稀釋。"),
  {id:"native-207-v2-contrast",type:'open',style:"contrast",prompt:"新的情境：野餐時一包餅乾昨天開封，吃起來軟而不脆；另一包剛拆仍很脆。寫一兩句英文對比兩包餅乾。",answers:["The opened cookies have gone stale. The fresh pack is still crisp.", "These cookies are stale, but the ones from the sealed pack are still crunchy."],explanation:"stale 指開封放久後失去新鮮脆度；與新開的爽脆餅乾對比。"}
];

const steps=[
  {"id": "native-207-v2-audio", "style": "audio", "label": "先聽變化", "title": "還新鮮嗎？", "intro": "先聽完整句，再回答「還新鮮嗎？」。", "model": "They’ve gone stale.", "zh": "它們變得不新鮮了。", "audioOnly": true, "questions": ["native-207-v2-audio"]},
  {"id": "native-207-v2-speak", "style": "speak", "label": "口頭回應", "title": "為何不吃？", "intro": "先試着說出「它們變得不新鮮了。」，再聽示範。", "model": "They’ve gone stale.", "zh": "它們變得不新鮮了。", "speakingPrompt": "朋友遞來放久、已不脆的餅乾；口頭說「它們已變得不新鮮」。", "recording": "phrase", "questions": []},
  {"id": "native-207-v2-transfer", "style": "transfer", "label": "換種零食", "title": "薯片也會這樣", "intro": "把 stale 用到另一食物。", "questions": ["native-207-v2-transfer"]},
  {"id": "native-207-v2-rewrite", "style": "rewrite", "label": "說得更準", "title": "不是變軟就叫 watery", "intro": "由原因和口感選詞。", "questions": ["native-207-v2-rewrite"]},
  {"id": "native-207-v2-contrast", "style": "contrast", "label": "新情境自評", "title": "比較兩包餅乾", "intro": "轉到「比較兩包餅乾」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-207-v2-contrast"]}
];

export default {revision:2,summary:"用 stale 描述餅乾或薯片放久後失去原本的新鮮和酥脆。",steps,questions,takeaways:["They’ve gone stale.", "The chips are stale."],completionTitle:"你能指出零食受潮或放久後已不再酥脆。"};
