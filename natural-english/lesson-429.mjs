import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-429-v2-audio","audio","哪種口感最符合 dense？",["切面緊實，拿起來感覺厚重。", "內部有很多空氣，輕得像海綿。", "外層酥脆而中心流心。", "表面濕潤，但裏面是液體。"],"切面緊實，拿起來感覺厚重。","dense 指組織緊密、口感厚重；不等於 fluffy 的輕盈蓬鬆。"),
  mc("native-429-v2-contrast","contrast","你的蛋糕比食譜照片厚重很多，你認為不理想。哪句最貼切？",["Mine is too dense.", "Mine is very fluffy.", "Mine has no flavour.", "Mine is still in the oven."],"Mine is too dense.","too dense 表示緊實到不理想；mine 指自己的蛋糕，和別人的作品比較。"),
  mc("native-429-v2-explain","explain","朋友說 This chocolate cake is dense and rich，卻又吃了第二塊。這裏 dense 最可能怎樣理解？",["口感緊實濃厚，可能是特色。", "蛋糕完全沒烤熟，必須丟掉。", "蛋糕很輕、空氣感強。", "蛋糕放在密封盒裏。"],"口感緊實濃厚，可能是特色。","dense 描述質地；配合 rich 和朋友喜歡吃，未必是負評。"),
  {id:"native-429-v2-rewrite",type:'open',style:"rewrite",prompt:"新情境：你烤的香蕉蛋糕切面很緊、比預期重；下次想改善蓬鬆度。寫一兩句英文說明結果和下一次會試的調整。",answers:["My banana cake is too dense. I’ll try mixing the batter less next time.", "The cake turned out dense, so I’ll check the baking powder before I bake it again.", "Mine is too dense. Next time I’ll follow the mixing time more carefully."],explanation:"用 dense 或 too dense 說明厚重質地，再提出合理的烘焙調整。"}
];

const steps=[
  {"id": "native-429-v2-audio", "style": "audio", "label": "先聽口感", "title": "咬下去怎樣？", "intro": "先聽句子，再推測質地。", "model": "The cake is dense.", "zh": "這蛋糕口感很厚重緊實。", "audioOnly": true, "questions": ["native-429-v2-audio"]},
  {"id": "native-429-v2-contrast", "style": "contrast", "label": "兩個作品", "title": "比較輕重", "intro": "用 too 表示超出理想程度。", "questions": ["native-429-v2-contrast"]},
  {"id": "native-429-v2-explain", "style": "explain", "label": "解讀評價", "title": "dense 未必全是壞事", "intro": "留意語境和程度。", "questions": ["native-429-v2-explain"]},
  {"id": "native-429-v2-speak", "style": "speak", "label": "口頭描述", "title": "試吃後說明", "intro": "在「試吃後說明」情境先開口，然後聽錄音核對。", "model": "The cake is dense.", "zh": "這蛋糕口感很緊實。", "speakingPrompt": "你切開蛋糕發現內部厚重緊實；向朋友口說「這蛋糕很緊實」。", "recording": "phrase", "questions": []},
  {"id": "native-429-v2-rewrite", "style": "rewrite", "label": "新食譜自評", "title": "香蕉蛋糕太厚重", "intro": "自己寫口感和調整方向。", "questions": ["native-429-v2-rewrite"]}
];

export default {revision:2,summary:"用 The cake is dense. 描述蛋糕內部緊實厚重，與鬆軟的口感區分。",steps,questions,takeaways:["The cake is dense.", "Mine is too dense."],completionTitle:"你能描述蛋糕口感並提出可能的烘焙調整。"};
