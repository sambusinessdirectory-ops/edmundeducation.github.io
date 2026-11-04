import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-430-v2-audio","audio","哪個描述最貼近 fluffy？",["切面有空氣感，入口輕而柔軟。", "切面非常緊密，入口厚重。", "中心仍是液態麵糊。", "外皮硬得難以切開。"],"切面有空氣感，入口輕而柔軟。","fluffy 強調輕盈鬆軟，與 dense 的厚重緊實形成對比。"),
  mc("native-430-v2-contrast","contrast","甲蛋糕拿起來輕、按下會回彈；乙蛋糕結實厚重。要讚甲，哪句最準確？",["This cake is so fluffy.", "This cake is too dense.", "This cake has set.", "This cake is tangled."],"This cake is so fluffy.","輕而會回彈是蓬鬆特徵；so fluffy 可以自然表達欣賞。"),
  mc("native-430-v2-repair","repair","朋友問你喜歡新海綿蛋糕甚麼；你說 It’s good，但真正欣賞的是輕柔口感。怎樣改寫較具體？",["It’s so fluffy and light.", "It’s much too dense and heavy.", "It’s still raw in the middle.", "It’s good because the box is nice."],"It’s so fluffy and light.","fluffy and light 明確指出稱讚的質地，比泛泛的 good 有用。"),
  mc("native-430-v2-rewrite","rewrite","哪句與 The cake is fluffy. 意思最接近，還加入讚賞語氣？",["This cake is so fluffy.", "This cake used to be fluffy.", "This cake should be fluffy, but isn’t.", "This cake feels dense."],"This cake is so fluffy.","so 加強對當前蓬鬆口感的肯定，沒有把事實改成過去或期望。"),
  {id:"native-430-v2-final",type:'open',style:"final",prompt:"新情境：朋友第一次烤生日海綿蛋糕，切面輕盈，咬下去很柔軟。寫一兩句英文稱讚質地，並指出你喜歡的具體感受。",answers:["This cake is so fluffy. It feels light when I take a bite.", "The cake is fluffy and soft. I love how light the sponge is.", "Your sponge cake turned out wonderfully fluffy; it isn’t heavy at all."],explanation:"用 fluffy 描述輕柔蓬鬆，再說清口感或切面如何讓你喜歡。"}
];

const steps=[
  {"id": "native-430-v2-audio", "style": "audio", "label": "先聽質地", "title": "蛋糕有空氣感嗎？", "intro": "先聽句子，再想像口感。", "model": "The cake is fluffy.", "zh": "這蛋糕很鬆軟蓬鬆。", "audioOnly": true, "questions": ["native-430-v2-audio"]},
  {"id": "native-430-v2-contrast", "style": "contrast", "label": "選用形容詞", "title": "兩塊蛋糕比較", "intro": "從口感判斷詞語。", "questions": ["native-430-v2-contrast"]},
  {"id": "native-430-v2-repair", "style": "repair", "label": "修正評語", "title": "說清楚稱讚甚麼", "intro": "從模糊的 good 改為質地。", "questions": ["native-430-v2-repair"]},
  {"id": "native-430-v2-rewrite", "style": "rewrite", "label": "不同句型", "title": "保留同一讚賞", "intro": "把主語換成 this cake。", "questions": ["native-430-v2-rewrite"]},
  {"id": "native-430-v2-speak", "style": "speak", "label": "口頭稱讚", "title": "試吃後回應", "intro": "在「試吃後回應」情境先開口，然後聽錄音核對。", "model": "This cake is so fluffy.", "zh": "這蛋糕真鬆軟。", "speakingPrompt": "朋友請你試吃剛烤好的蓬鬆蛋糕；口說「這蛋糕真鬆軟」。", "recording": "phrase", "questions": []},
  {"id": "native-430-v2-final", "style": "final", "label": "新蛋糕自評", "title": "生日海綿蛋糕", "intro": "自己寫口感和具體讚賞。", "questions": ["native-430-v2-final"]}
];

export default {revision:2,summary:"用 The cake is fluffy. 讚賞蛋糕內部輕盈蓬鬆，並區分仍未熟或過度鬆散。",steps,questions,takeaways:["The cake is fluffy.", "This cake is so fluffy."],completionTitle:"你能描述蓬鬆口感，並向烘焙者給出具體讚賞。"};
