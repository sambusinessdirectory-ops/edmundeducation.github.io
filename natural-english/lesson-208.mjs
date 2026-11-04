import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-208-v2-audio","audio","聽到這句，你最可能在衣服上看見甚麼？",["一根鬆脫露出的線。", "整顆扣子掉了。", "拉鍊完全卡住。", "一大片油漬。"],"一根鬆脫露出的線。","loose thread 是鬆了、露出來的線頭。"),
  mc("native-208-v2-transfer","transfer","外套袖口有一根線頭垂下來。哪句可用？",["There’s a loose thread on the sleeve.", "There’s a stain on the sleeve.", "The sleeve seam has torn.", "The sleeve button has come off."],"There’s a loose thread on the sleeve.","loose thread 可用於任何有線頭露出的衣物。"),
  mc("native-208-v2-explain","explain","朋友說 Don’t pull it.，指的是毛衣上的 loose thread。最可能怕甚麼？",["拉扯會令線更鬆、破壞織法。", "拉扯可直接把線固定回原位。", "拉扯可讓鬆線頭自行消失。", "拉扯只會改變線頭顏色，不影響織法。"],"拉扯會令線更鬆、破壞織法。","鬆線頭應小心處理；直接拉可能令更多線脫出；鬆線頭連着原本的織線，直接拉扯可能令衣服更多位置鬆開。"),
  mc("native-208-v2-scene","scene","哪個情況適合說 There’s a loose thread on your sweater？",["毛衣袖口有一根線伸出來。", "毛衣扣子整顆掉了。", "毛衣布料刺膚。", "毛衣尺寸太大。"],"毛衣袖口有一根線伸出來。","loose thread 精確指線頭，不是扣子或尺寸。"),
  {id:"native-208-v2-final",type:'open',style:"final",prompt:"新的情境：同學的針織帽有一根鬆線頭，他正想用力扯掉。寫一兩句英文提醒他線頭在哪裏，並建議別拉。",answers:["There’s a loose thread on your hat. Don’t pull it.", "Your knit hat has a loose thread. I wouldn’t pull it.", "I can see a loose thread on the hat; please don’t tug on it."],explanation:"說明 loose thread 的位置，再用 Don’t pull it 避免拉壞編織。"}
];

const steps=[
  {"id": "native-208-v2-audio", "style": "audio", "label": "先聽細節", "title": "衣服哪裏有問題？", "intro": "先聽句子，再找衣服上的狀況。", "model": "There’s a loose thread.", "zh": "有一根鬆線頭。", "audioOnly": true, "questions": ["native-208-v2-audio"]},
  {"id": "native-208-v2-transfer", "style": "transfer", "label": "換到外套", "title": "不只毛衣", "intro": "把詞組用在另一件衣服。", "questions": ["native-208-v2-transfer"]},
  {"id": "native-208-v2-explain", "style": "explain", "label": "理解建議", "title": "為何別拉？", "intro": "根據線頭的特性判斷。", "questions": ["native-208-v2-explain"]},
  {"id": "native-208-v2-scene", "style": "scene", "label": "選提醒場合", "title": "看見小線頭", "intro": "比較衣服的不同問題。", "questions": ["native-208-v2-scene"]},
  {"id": "native-208-v2-speak", "style": "speak", "label": "口頭提醒", "title": "朋友的袖口", "intro": "先試着說出「有一根鬆線頭。」，再聽示範。", "model": "There’s a loose thread.", "zh": "有一根鬆線頭。", "speakingPrompt": "你看見朋友袖口有線頭；口頭說「有一根鬆線頭」。", "recording": "phrase", "questions": []},
  {"id": "native-208-v2-final", "style": "final", "label": "新衣服自寫", "title": "針織帽上的線", "intro": "自己寫提醒，再看示例。", "questions": ["native-208-v2-final"]}
];

export default {revision:2,summary:"用 loose thread 描述衣服上一根鬆脫、露出的線頭，並避免直接拉扯。",steps,questions,takeaways:["There’s a loose thread.", "Don’t pull it."],completionTitle:"你能提醒別人衣服有線頭，並清楚建議別拉。"};
