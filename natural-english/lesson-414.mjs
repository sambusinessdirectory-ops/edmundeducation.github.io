import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-414-v2-audio","audio","聽到這句，最可能看到甚麼？",["一端縮進帽內，外面只剩另一端較長。", "兩端長度一樣，位置正常。", "繩子整條從衣服上剪掉。", "帽T拉鍊完全卡住。"],"一端縮進帽內，外面只剩另一端較長。","drawstring got pulled through 指繩子被拉過繩道，令一端藏進去。"),
  mc("native-414-v2-detail","detail","哪項觀察最支持帽T抽繩 got pulled through？",["一端外露很長，另一端消失在帽沿裏。", "兩端都仍對稱露出。", "抽繩顏色在陽光下褪了。", "抽繩打了一個容易解開的結。"],"一端外露很長，另一端消失在帽沿裏。","兩端突然不對稱，且一端進了繩道，是被拉穿的可見線索。"),
  mc("native-414-v2-continue","continue","朋友問 Can you fix the hoodie? 你發現抽繩一端藏進去。哪句最合適？",["I’ll try to feed the drawstring back through the hood.", "I’ll replace the zipper on the front.", "I’ll tighten the cuffs on both sleeves.", "I’ll wash the hoodie again to change its color."],"I’ll try to feed the drawstring back through the hood.","重新把繩子穿過帽沿繩道，才針對一端被拉入的問題。"),
  mc("native-414-v2-reverse","reverse","你看見帽T抽繩右端縮入帽沿，左端變得特別長。哪句對應？",["One end of the drawstring got pulled in.", "Both ends are tied evenly outside.", "The drawstring snapped into two pieces.", "The hood has no drawstring channel."],"One end of the drawstring got pulled in.","右端被拉入繩道，外面只剩較長的左端，符合 pulled in。"),
  {id:"native-414-v2-final",type:'open',style:"final",prompt:"新的情境：洗完運動褲，一邊腰間抽繩不見、另一邊很長。寫一兩句英文告訴室友發生甚麼及你要如何處理。",answers:["One end of the drawstring got pulled in. I’ll try to thread it back through the waistband.", "The drawstring got pulled through the waistband in the wash. I need to feed it back in.", "One side of the drawstring has disappeared inside the waistband, so I’ll rethread it."],explanation:"把 drawstring pulled through 轉到運動褲腰間，說明不對稱結果和重新穿回的行動。"}
];

const steps=[
  {"id": "native-414-v2-audio", "style": "audio", "label": "先聽抽繩", "title": "哪一端不見？", "intro": "先聽句子，再想像帽T的繩道。", "model": "The drawstring got pulled through.", "zh": "抽繩被拉進繩道了。", "audioOnly": true, "questions": ["native-414-v2-audio"]},
  {"id": "native-414-v2-detail", "style": "detail", "label": "看外露長度", "title": "問題線索在哪？", "intro": "從兩端形狀推斷。", "questions": ["native-414-v2-detail"]},
  {"id": "native-414-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友問怎麼修", "intro": "根據繩端位置提出下一步。", "questions": ["native-414-v2-continue"]},
  {"id": "native-414-v2-speak", "style": "speak", "label": "口頭說明", "title": "繩子拉穿了", "intro": "先說出抽繩被拉進去，再聽示範。", "model": "The drawstring got pulled through.", "zh": "抽繩被拉進去了。", "speakingPrompt": "帽T洗後一端抽繩消失在帽裏；口頭說「抽繩被拉進去了」。", "recording": "phrase", "questions": []},
  {"id": "native-414-v2-reverse", "style": "reverse", "label": "由結果選句", "title": "只剩一端露出", "intro": "從繩子的狀態反推。", "questions": ["native-414-v2-reverse"]},
  {"id": "native-414-v2-final", "style": "final", "label": "新衣服自評", "title": "運動褲抽繩失衡", "intro": "自己寫觀察和處理，再看示例。", "questions": ["native-414-v2-final"]}
];

export default {revision:2,summary:"用 The drawstring got pulled through. 描述抽繩一端被拉入繩道，外面只剩另一端。",steps,questions,takeaways:["The drawstring got pulled through.", "One end of the drawstring got pulled in."],completionTitle:"你能指出抽繩兩端不對稱的原因，並說明如何重新穿回。"};
