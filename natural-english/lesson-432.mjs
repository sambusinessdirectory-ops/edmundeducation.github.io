import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-432-v2-audio","audio","說話者最可能看到甚麼？",["餅乾一拿就掉細碎屑。", "餅乾中心拉出黏稠巧克力。", "餅乾像海綿一樣回彈。", "餅乾外形完整，完全不掉屑。"],"餅乾一拿就掉細碎屑。","crumbly 指易碎、會掉碎屑，常用來描述乾鬆的餅乾質地。"),
  mc("native-432-v2-scene","scene","你要帶一盒很 crumbly 的餅乾搭車送朋友。哪個安排最合適？",["用硬盒分隔，避免擠壓。", "把餅乾直接放在背包最底層。", "為了保持濕潤，全部泡在水裏。", "把餅乾搖散後再包裝。"],"用硬盒分隔，避免擠壓。","易碎的餅乾經擠壓會變更多碎屑，硬盒和分隔能保護形狀。"),
  mc("native-432-v2-contrast","contrast","同一盤甜點：甲餅乾乾鬆易碎，乙布朗尼中心黏軟。哪組配對準確？",["甲 crumbly；乙 gooey。", "甲 gooey；乙 crumbly。", "甲 fluffy；乙 bent。", "甲 dense；乙 expired。"],"甲 crumbly；乙 gooey。","crumbly 是碎屑多、易散；gooey 是濕潤黏軟，兩者對應不同質地。"),
  {id:"native-432-v2-rewrite",type:'open',style:"rewrite",prompt:"新情境：野餐用的酥餅剛裝袋就碎成好幾塊，你仍要把它帶給朋友。寫一兩句英文說明質地，並說會怎樣包裝。",answers:["These biscuits are crumbly, so I’ll put them in a rigid container.", "The shortbread is very crumbly. I’ll wrap the pieces separately.", "This shortbread crumbles easily, so I’ll carry it in a hard box."],explanation:"用 crumbly 或 crumbles easily 說明易碎，再提出能減少擠壓的包裝。"}
];

const steps=[
  {"id": "native-432-v2-audio", "style": "audio", "label": "先聽碎屑", "title": "拿起來會怎樣？", "intro": "先聽句子，再推想結果。", "model": "It’s crumbly.", "zh": "它很容易碎成屑。", "audioOnly": true, "questions": ["native-432-v2-audio"]},
  {"id": "native-432-v2-scene", "style": "scene", "label": "包裝選擇", "title": "送人前要注意", "intro": "從質地推導做法。", "questions": ["native-432-v2-scene"]},
  {"id": "native-432-v2-contrast", "style": "contrast", "label": "不同口感", "title": "crumbly 與 gooey", "intro": "選對形容詞。", "questions": ["native-432-v2-contrast"]},
  {"id": "native-432-v2-speak", "style": "speak", "label": "口頭描述", "title": "試吃餅乾", "intro": "在「試吃餅乾」情境先開口，然後聽錄音核對。", "model": "This cookie is crumbly.", "zh": "這塊餅乾很容易碎。", "speakingPrompt": "你拿起餅乾時它掉了很多碎屑；向朋友口說「這塊餅乾很容易碎」。", "recording": "phrase", "questions": []},
  {"id": "native-432-v2-rewrite", "style": "rewrite", "label": "新點心自評", "title": "野餐酥餅", "intro": "自己寫口感和處理方式。", "questions": ["native-432-v2-rewrite"]}
];

export default {revision:2,summary:"用 It’s crumbly. 描述餅乾一掰就碎、掉碎屑的質地，並與蓬鬆和黏軟區分。",steps,questions,takeaways:["It’s crumbly.", "This cookie is crumbly."],completionTitle:"你能指出餅乾鬆散易碎，並考慮拿取與包裝方法。"};
