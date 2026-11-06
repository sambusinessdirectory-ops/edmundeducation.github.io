import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-191-v2-audio","audio","聽到的詞最貼近哪種感覺？",["飯後胸口附近灼熱。", "胸部肌肉運動後痠痛。", "胃部有一陣抽痛。", "辛辣食物令舌頭有灼熱感。"],"飯後胸口附近灼熱。","heartburn 是胸口附近的灼熱感，字面有 heart，但不是說心臟在燃燒。"),
  mc("native-191-v2-transfer","transfer","晚餐吃辣後胸口有燒灼感；哪句最貼切？",["I have heartburn.", "My tongue burns from the chili.", "I feel too full after dinner.", "I have a stomach cramp."],"I have heartburn.","heartburn 指胸口或食道附近的灼熱感，常在進食後出現。"),
  mc("native-191-v2-reverse","reverse","你只想命名飯後胸口的灼熱感，未描述胃酸倒流的原因；哪個名詞最準確？",["heartburn", "indigestion", "acid reflux", "chest pain"],"heartburn","heartburn 專指這種灼熱不適；sunburn 是曬傷。"),
  mc("native-191-v2-contrast","contrast","朋友說胸口有燒灼感，而不是腹部抽痛。哪個詞更具體？",["heartburn", "stomach cramp", "acid taste", "stomachache"],"heartburn","灼熱、位置在胸口附近是 heartburn 的典型描述。"),
  {id:"native-191-v2-final",type:'open',style:"final",prompt:"新的情境：午餐後你有輕微胸口灼熱，朋友問你為甚麼不想再吃辣。寫一兩句英文，說明症狀及原因。",answers:["I have a little heartburn after lunch, so I’d rather avoid spicy food.", "The spicy lunch gave me heartburn. I don't want any more hot sauce.", "I think I have heartburn, so I’ll skip the spicy dish."],explanation:"heartburn 表達胸口灼熱；再說你因此想避開辣食。"}
];

const steps=[
  {"id": "native-191-v2-audio", "style": "audio", "label": "先聽症狀", "title": "聽出身體感覺", "intro": "先聽詞，再判斷意思。", "model": "heartburn", "zh": "胃灼熱／火燒心。", "audioOnly": true, "questions": ["native-191-v2-audio"]},
  {"id": "native-191-v2-transfer", "style": "transfer", "label": "換到晚餐後", "title": "辛辣食物後的感覺", "intro": "辨認相同症狀在另一餐的用法。", "questions": ["native-191-v2-transfer"]},
  {"id": "native-191-v2-reverse", "style": "reverse", "label": "症狀反推", "title": "選對名詞", "intro": "由描述選英文。", "questions": ["native-191-v2-reverse"]},
  {"id": "native-191-v2-contrast", "style": "contrast", "label": "分清位置", "title": "不是每種痛都一樣", "intro": "比較兩種身體描述。", "questions": ["native-191-v2-contrast"]},
  {"id": "native-191-v2-speak", "style": "speak", "label": "口頭告知", "title": "說出自己的不適", "intro": "先口說；錄音或跳過後才聽示範。", "model": "heartburn", "zh": "胃灼熱／火燒心。", "speakingPrompt": "朋友問飯後灼熱感叫甚麼。先口頭說出「火燒心」的英文名稱。", "recording": "phrase", "questions": []},
  {"id": "native-191-v2-final", "style": "final", "label": "自寫說明", "title": "新餐館情境", "intro": "先寫，再對照示例自評。", "questions": ["native-191-v2-final"]}
];

export default {revision:2,summary:"用 heartburn 描述飯後胸口灼熱，並分清一般胃痛。",steps,questions,takeaways:["heartburn", "I have heartburn."],completionTitle:"你能辨認 heartburn 的灼熱感，並在新情境說明自己的不適。"};
