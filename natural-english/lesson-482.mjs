import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-482-v2-audio","audio","說話者最可能指甚麼？",["某個縫或內部有不易辨認的黏髒積物。", "表面只有一粒乾淨的螺絲。", "整件物品剛擦好，完全沒有污垢。", "地上只有清水，沒有黏物。"],"某個縫或內部有不易辨認的黏髒積物。","gunk 泛指黏稠髒污，in there 表示藏在已指明的內部或縫隙。"),
  mc("native-482-v2-contrast","contrast","鍵盤按鍵下有灰塵、油脂和碎屑黏成團。哪句較貼切？",["There’s a lot of gunk under the keys.", "There’s a single dry scratch on the keyboard.", "The keys are clean, but the letters faded.", "The keyboard has one water droplet on top."],"There’s a lot of gunk under the keys.","多種髒物黏成團可用 gunk；under the keys 也清楚指出藏在鍵下。"),
  mc("native-482-v2-rewrite","rewrite","你原說 The blender is dirty；其實黏稠殘渣藏在刀片底下。哪句較有用？",["There’s gunk under the blender blade.", "The blender jar is missing.", "The blender is already spotless.", "The blender has a small crack in the lid."],"There’s gunk under the blender blade.","用 gunk 加具體位置可讓對方知道要清理刀片下的積物。"),
  {id:"native-482-v2-final",type:'open',style:"final",prompt:"新情境：烤箱門封條旁的細縫積了黏黏的油與食物屑，普通抹布擦不到。寫一兩句英文向室友說明位置，並提出先怎樣清理。",answers:["There’s some gunk in the gap by the oven door. I’ll use a small brush to clean it.", "The seal has gunk around it, so I’ll use a brush to reach the narrow gap.", "There’s greasy gunk in there. Let’s clean the oven-door crevice with a brush."],explanation:"要點出狹窄縫隙裏的黏污，再提出能伸進去清理的方法。"}
];

const steps=[
  {"id": "native-482-v2-audio", "style": "audio", "label": "先聽髒污", "title": "縫裏有甚麼？", "intro": "先聽句子，留意 there 所指的已知位置。", "model": "There’s some gunk in there.", "zh": "那裏面有些黏髒東西。", "audioOnly": true, "questions": ["native-482-v2-audio"]},
  {"id": "native-482-v2-contrast", "style": "contrast", "label": "不是單一污漬", "title": "混合的黏污", "intro": "比較表面水印與縫內積物。", "questions": ["native-482-v2-contrast"]},
  {"id": "native-482-v2-rewrite", "style": "rewrite", "label": "更具體描述", "title": "不要只說 dirty", "intro": "指出積物與位置。", "questions": ["native-482-v2-rewrite"]},
  {"id": "native-482-v2-speak", "style": "speak", "label": "口頭提醒", "title": "縫裏的黏污", "intro": "指着櫃門縫的積物，先說再聽示範。", "model": "There’s some gunk in there.", "zh": "那裏面有些黏髒東西。", "speakingPrompt": "你和室友正看着櫃門縫裏的黏污；口說「那裏面有些黏髒東西」。", "recording": "phrase", "questions": []},
  {"id": "native-482-v2-final", "style": "final", "label": "新器具自評", "title": "烤箱門邊", "intro": "自己寫積物位置和清潔打算。", "questions": ["native-482-v2-final"]}
];

export default {revision:2,summary:"用 There’s some gunk in there. 泛指縫隙裏黏稠髒污，並在已知位置的對話中自然使用 there。",steps,questions,takeaways:["There’s some gunk in there.", "There’s a lot of gunk under the keys."],completionTitle:"你能指出藏在縫裏的黏髒積物，並提出清理方法。"};
