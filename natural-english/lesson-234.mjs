import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-234-v2-audio","audio","聽到這句，戶外最可能怎樣？",["空氣濕熱，皮膚黏黏的。", "陽光猛烈但空氣極乾。", "氣溫低且清爽。", "微風涼快又乾燥。"],"空氣濕熱，皮膚黏黏的。","muggy 結合熱和濕，帶悶黏感，不只是溫度高。"),
  mc("native-234-v2-contrast","contrast","兩天都是 30°C；今天濕度很高，出門即出汗黏身。哪句最精確？",["It’s muggy today.", "It’s dry and cool today.", "It’s chilly today.", "It’s overcast but cold."],"It’s muggy today.","高濕度使熱變得悶黏，所以用 muggy 比只說 hot 更具體。"),
  mc("native-234-v2-rewrite","rewrite","把 It’s hot 改成能表達「熱而且濕，皮膚黏」的句子。哪句好？",["It’s really muggy.", "It’s a dry heat.", "It’s cool and breezy.", "It’s lightly drizzling."],"It’s really muggy.","muggy 已含濕熱悶黏，dry heat 恰好相反。"),
  {id:"native-234-v2-final",type:'open',style:"final",prompt:"新的情境：你在沒有遮陰的巴士站等車，空氣又熱又濕，汗一直黏在皮膚上。寫一兩句英文告訴朋友天氣和你想怎樣等車。",answers:["It’s so muggy at the bus stop. I’m going to wait in the shade.", "The air is muggy, and I’m already sweating. Let’s stand under the shelter.", "It’s really muggy out here; I’d rather wait inside until the bus comes."],explanation:"muggy 概括濕熱黏膩的體感；再說具體避熱做法。"}
];

const steps=[
  {"id": "native-234-v2-audio", "style": "audio", "label": "先聽體感", "title": "熱得黏黏的", "intro": "先聽完整句，再回答「熱得黏黏的」。", "model": "It’s muggy.", "zh": "天氣又熱又濕，很悶。", "audioOnly": true, "questions": ["native-234-v2-audio"]},
  {"id": "native-234-v2-contrast", "style": "contrast", "label": "濕熱和乾熱", "title": "兩種熱不一樣", "intro": "從濕度和體感選詞。", "questions": ["native-234-v2-contrast"]},
  {"id": "native-234-v2-speak", "style": "speak", "label": "口頭抱怨", "title": "剛踏出門", "intro": "先說出濕熱悶黏的感覺，再聽示範。", "model": "It’s muggy.", "zh": "天氣很濕熱。", "speakingPrompt": "你踏出冷氣房就覺得又熱又濕；口頭說「天氣很悶熱」。", "recording": "phrase", "questions": []},
  {"id": "native-234-v2-rewrite", "style": "rewrite", "label": "改寫觀察", "title": "不只是 hot", "intro": "把具體體感說出來。", "questions": ["native-234-v2-rewrite"]},
  {"id": "native-234-v2-final", "style": "final", "label": "新通勤自寫", "title": "等巴士的天氣", "intro": "先寫感受與行動，再對照示例。", "questions": ["native-234-v2-final"]}
];

export default {revision:2,summary:"用 muggy 描述又熱又濕、令人黏悶的天氣，而不只是高溫。",steps,questions,takeaways:["It’s muggy.", "It’s really muggy today."],completionTitle:"你能描述濕熱悶黏的空氣，並和單純乾熱分開。"};
