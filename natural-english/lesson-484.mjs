import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-484-v2-audio","audio","哪個畫面最符合？",["光滑地板上有幾條鞋底摩擦的黑痕。", "地板中央有一灘食用油。", "木地板有一道很深的刀刻痕。", "地板剛拋光，完全沒有印。"],"光滑地板上有幾條鞋底摩擦的黑痕。","scuff marks 是摩擦留下的表面印痕，常見於鞋底磨過地板後。"),
  mc("native-484-v2-reverse","reverse","你拖着黑底鞋走過白地板，地上留下幾條黑色擦痕。哪句準確描述鞋子的動作？",["My shoes scuffed the floor.", "My shoes spilled oil on the floor.", "My shoes cracked the floor tiles.", "My shoes left water puddles."],"My shoes scuffed the floor.","scuffed the floor 直接說鞋子磨出擦痕，與倒油、裂磚或水灘不同。"),
  mc("native-484-v2-repair","repair","同事說 The floor is scratched；你用布輕擦，黑痕便淡了，地板沒有凹槽。哪句更準？",["There are scuff marks on the floor.", "The floor has deep scratches in the finish.", "The floor has a permanent crack.", "The floor is covered in sticky grease."],"There are scuff marks on the floor.","可擦淡而沒有凹槽的黑痕較像 scuff marks，不是深入材質的刮痕。"),
  {id:"native-484-v2-final",type:'open',style:"final",prompt:"新情境：活動後禮堂淺色地板上有幾條黑色鞋印，布擦過能淡一些。寫一兩句英文告訴清潔同事這些痕跡是甚麼，並提出先怎樣處理。",answers:["There are scuff marks on the floor from shoes. Let’s try wiping them with a suitable cleaner.", "The shoes scuffed the hall floor. I’ll see whether the marks wipe off.", "These look like scuff marks on the floor. Could we clean them before the next event?"],explanation:"指出是鞋底摩擦痕，並提出用適合地板的方式先試擦。"}
];

const steps=[
  {"id": "native-484-v2-audio", "style": "audio", "label": "先聽痕跡", "title": "地上留了甚麼？", "intro": "先聽句子，再辨別 marks 所指的外觀。", "model": "There are scuff marks on the floor.", "zh": "地板上有鞋底磨出的擦痕。", "audioOnly": true, "questions": ["native-484-v2-audio"]},
  {"id": "native-484-v2-reverse", "style": "reverse", "label": "從原因說起", "title": "鞋子造成的擦痕", "intro": "把地板上的結果改成鞋子作主語。", "questions": ["native-484-v2-reverse"]},
  {"id": "native-484-v2-repair", "style": "repair", "label": "痕跡深淺", "title": "不是深刮傷", "intro": "利用擦拭結果修正說法。", "questions": ["native-484-v2-repair"]},
  {"id": "native-484-v2-speak", "style": "speak", "label": "口頭提醒", "title": "走廊黑痕", "intro": "指着鞋底擦出的線條，先說再聽示範。", "model": "There are scuff marks on the floor.", "zh": "地板上有擦痕。", "speakingPrompt": "商場走廊地板上有幾條鞋底黑痕；向同事口說「地板上有擦痕」。", "recording": "phrase", "questions": []},
  {"id": "native-484-v2-final", "style": "final", "label": "新場地自評", "title": "禮堂地板", "intro": "自己寫痕跡來源和清潔打算。", "questions": ["native-484-v2-final"]}
];

export default {revision:2,summary:"用 There are scuff marks on the floor. 描述鞋底摩擦地板留下的黑色擦痕。",steps,questions,takeaways:["There are scuff marks on the floor.", "My shoes scuffed the floor."],completionTitle:"你能指出地板擦痕及可能來源，並與油污或刮傷區分。"};
