import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-205-v2-audio","audio","聽到這句，切開雞蛋會怎樣？",["蛋黃流出來。", "蛋黃完全凝固。", "蛋白剛好凝固，蛋黃卻已變硬。", "蛋黃仍軟，但切開並不流動。"],"蛋黃流出來。","runny 指液態會流動；yolk 是蛋黃。"),
  mc("native-205-v2-detail","detail","哪個觀察能支持 The yolk is runny？",["蛋黃切開後緩緩流出。", "蛋黃硬到能整塊切起。", "蛋黃切開後保持完整形狀。", "蛋白表面有焦邊。"],"蛋黃切開後緩緩流出。","runny 描述蛋黃仍是流動狀態；切開後蛋黃仍會流動，是 runny 的可見證據；firm 的蛋黃則不會流。"),
  mc("native-205-v2-branch","branch","朋友說 I don’t like a runny yolk. 你幫他點餐，該如何要求？",["Please make the yolk firm.", "Please keep the yolk runny.", "Please cook the whites a little longer.", "Please leave the yolk as it is."],"Please make the yolk firm.","不喜歡流心就要求蛋黃凝固，firm 與 runny 對照。"),
  mc("native-205-v2-continue","continue","朋友問 Is the egg cooked the way you like it? 你想要流心，而切開後正好會流。哪句合適？",["Yes, the yolk is nice and runny.", "No, the yolk is too firm for me.", "No, the yolk is completely firm.", "No, the white is still uncooked."],"Yes, the yolk is nice and runny.","nice and runny 表示蛋黃流心程度正合你意。"),
  {id:"native-205-v2-final",type:'open',style:"final",prompt:"新的情境：在早餐店點一份煎蛋，你喜歡蛋黃切開後會流。寫一句英文告訴店員你要的熟度。",answers:["I'd like my egg with a runny yolk, please.", "Could you make the yolk runny, please?", "I'd like a fried egg, with the yolk still runny."],explanation:"runny yolk 清楚表明蛋黃仍會流；可在點餐時加 please。"}
];

const steps=[
  {"id": "native-205-v2-audio", "style": "audio", "label": "先聽口感", "title": "切開會流嗎？", "intro": "先聽英文再判斷。", "model": "The yolk is runny.", "zh": "蛋黃是流心的。", "audioOnly": true, "questions": ["native-205-v2-audio"]},
  {"id": "native-205-v2-detail", "style": "detail", "label": "看切開後", "title": "哪個畫面吻合？", "intro": "由可見細節判斷。", "questions": ["native-205-v2-detail"]},
  {"id": "native-205-v2-speak", "style": "speak", "label": "口頭說偏好", "title": "你愛流心嗎？", "intro": "先試着說出「蛋黃會流。」，再聽示範。", "model": "The yolk is runny.", "zh": "蛋黃會流。", "speakingPrompt": "朋友問你喜歡怎樣的蛋；口頭說你喜歡流心蛋黃。", "recording": "phrase", "questions": []},
  {"id": "native-205-v2-branch", "style": "branch", "label": "對話分支", "title": "熟度不合口味", "intro": "選適合對方偏好的回應。", "questions": ["native-205-v2-branch"]},
  {"id": "native-205-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友問熟了嗎", "intro": "回應切開後的狀態。", "questions": ["native-205-v2-continue"]},
  {"id": "native-205-v2-final", "style": "final", "label": "新早餐自寫", "title": "點一份流心蛋", "intro": "自己寫點餐要求，再看示例。", "questions": ["native-205-v2-final"]}
];

export default {revision:2,summary:"用 runny 描述蛋黃未凝固、切開會流動，並和 firm 對照。",steps,questions,takeaways:["The yolk is runny.", "The yolk is firm."],completionTitle:"你能描述蛋黃是否會流，並在新點餐情境說出偏好。"};
