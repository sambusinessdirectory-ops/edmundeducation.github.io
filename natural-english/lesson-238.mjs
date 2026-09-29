import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-238-v2-audio","audio","聽到這句，扣子最可能怎樣？",["還連着衣服，但晃晃的。", "已完全脫落在地上。", "剛縫牢，一點不動。", "扣子仍在，但扣眼太大。"],"還連着衣服，但晃晃的。","loose 指扣子未縫牢；popped off 才表示已整顆掉下。"),
  mc("native-238-v2-rewrite","rewrite","外套扣子還在，但縫線鬆得快掉。哪句最準確？",["The button is loose.", "The button popped off.", "The button is missing.", "The zipper is stuck."],"The button is loose.","扣子仍在衣服上，故用 loose；popped off 或 missing 會表示已掉。"),
  mc("native-238-v2-contrast","contrast","早上扣子還掛着、很晃；下午整顆掉到地上。哪組說法正確？",["早上 loose；下午 popped off。", "早上 popped off；下午 loose。", "早上已掉下；下午只是縫線鬆。", "早上和下午扣子都縫得很牢。"],"早上 loose；下午 popped off。","loose 是即將掉的狀態，popped off 是已脫落的事件。"),
  {id:"native-238-v2-final",type:'open',style:"final",prompt:"新的情境：朋友明天面試，西裝外套一顆扣子仍在但幾乎沒有縫牢。寫一兩句英文提醒他問題並建議今晚縫好。",answers:["The button on your jacket is loose. You should sew it on tonight.", "One of your blazer buttons is loose; maybe fix it before the interview.", "That button looks loose. I’d sew it back on before tomorrow."],explanation:"先說扣子 loose，因仍未掉；再建議及早縫牢。"}
];

const steps=[
  {"id": "native-238-v2-audio", "style": "audio", "label": "先聽狀態", "title": "扣子還在嗎？", "intro": "先聽完整句，再回答「扣子還在嗎？」。", "model": "The button is loose.", "zh": "扣子鬆了。", "audioOnly": true, "questions": ["native-238-v2-audio"]},
  {"id": "native-238-v2-rewrite", "style": "rewrite", "label": "具體改寫", "title": "趁未掉先縫", "intro": "根據扣子現狀選句。", "questions": ["native-238-v2-rewrite"]},
  {"id": "native-238-v2-speak", "style": "speak", "label": "口頭提醒", "title": "朋友的外套", "intro": "先說出扣子鬆動的情況，再聽示範。", "model": "The button is loose.", "zh": "扣子鬆了。", "speakingPrompt": "朋友的外套扣子晃晃的；口頭說「扣子鬆了」。", "recording": "phrase", "questions": []},
  {"id": "native-238-v2-contrast", "style": "contrast", "label": "前後變化", "title": "快掉與掉了", "intro": "分清兩個狀態。", "questions": ["native-238-v2-contrast"]},
  {"id": "native-238-v2-final", "style": "final", "label": "新衣服自寫", "title": "面試前提醒", "intro": "先寫提醒及建議，再看示例。", "questions": ["native-238-v2-final"]}
];

export default {revision:2,summary:"用 The button is loose. 描述扣子仍在衣服上，但縫線鬆、快掉下來。",steps,questions,takeaways:["The button is loose.", "The button popped off."],completionTitle:"你能分辨扣子快掉與已掉下，並及時提醒別人。"};
