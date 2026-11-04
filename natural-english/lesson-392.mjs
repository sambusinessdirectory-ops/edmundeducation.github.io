import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-392-v2-audio","audio","聽到這句，毛衣最可能有甚麼外觀？",["兩邊肩膀各凸出一角。", "肩縫向下拉長，但沒有尖角。", "兩邊袖口被洗得縮短。", "衣服肩位只有平整摺痕。"],"兩邊肩膀各凸出一角。","hanger bumps 是衣架頂住肩位留下的凸角，不是破洞或污漬。"),
  mc("native-392-v2-explain","explain","為何針織衫肩部會出現 hanger bumps？",["長時間掛在衣架上，重量把肩位拉出角。", "洗衣時用熱水令整件毛衣縮水。", "熨斗壓出一道平直摺線。", "肩墊本來就縫在衣服裏。"],"長時間掛在衣架上，重量把肩位拉出角。","衣架承托肩部，針織布料久掛後容易在兩端留下凸起。"),
  mc("native-392-v2-continue","continue","朋友看到毛衣肩上兩個凸角，問 Should I put it back on the hanger? 你怎樣回，才能避免再變形？",["I’d fold it instead; the hanger caused those bumps.", "Yes, hang it on the same narrow hanger again.", "Yes, pull the shoulders farther outward first.", "No, leave it on the floor permanently."],"I’d fold it instead; the hanger caused those bumps.","肩位凸角是久掛後衣架支點撐出的形狀；改用摺放能避免同樣位置繼續受力。"),
  {id:"native-392-v2-final",type:'open',style:"final",prompt:"新的情境：一件針織外套掛了幾星期後兩肩凸起，你要向室友說明並建議以後摺放。寫一兩句英文。",answers:["The cardigan has hanger bumps. Let’s fold it instead of hanging it next time.", "Its shoulders are stretched out from the hanger. We should store it folded.", "It has hanger bumps, so I’ll fold the cardigan from now on."],explanation:"說明凸角由衣架造成，再提出摺放以避免肩位繼續變形。"}
];

const steps=[
  {"id": "native-392-v2-audio", "style": "audio", "label": "先聽外觀", "title": "肩膀為何凸？", "intro": "先聽句子，再看衣服肩線。", "model": "It has hanger bumps.", "zh": "衣服有衣架撐出的肩部凸角。", "audioOnly": true, "questions": ["native-392-v2-audio"]},
  {"id": "native-392-v2-explain", "style": "explain", "label": "找出原因", "title": "衣架留下痕跡", "intro": "把形狀和存放方式連起來。", "questions": ["native-392-v2-explain"]},
  {"id": "native-392-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友問肩線", "intro": "解釋為何不平整。", "questions": ["native-392-v2-continue"]},
  {"id": "native-392-v2-speak", "style": "speak", "label": "口頭指出", "title": "毛衣肩位凸出", "intro": "先說出肩部衣架痕跡，再聽示範。", "model": "It has hanger bumps.", "zh": "它有衣架凸角。", "speakingPrompt": "朋友試穿毛衣，兩肩有尖尖凸角；口頭說「它有衣架凸角」。", "recording": "phrase", "questions": []},
  {"id": "native-392-v2-final", "style": "final", "label": "新衣物自寫", "title": "改放針織外套", "intro": "自己寫問題和存放建議，再看示例。", "questions": ["native-392-v2-final"]}
];

export default {revision:2,summary:"用 hanger bumps 描述衣架在毛衣兩肩留下凸起，並提醒改用摺放。",steps,questions,takeaways:["It has hanger bumps.", "The shoulders are stretched out."],completionTitle:"你能認出衣架造成的肩部凸角，並提出避免再出現的方法。"};
