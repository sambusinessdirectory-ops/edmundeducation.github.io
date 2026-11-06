import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-206-v2-audio","audio","廚師指着布丁說這句，現在最可能怎樣？",["布丁仍軟，還不能定形。", "布丁已完全凝固。", "布丁已完全定形，能切成片。", "布丁已凝固但太甜。"],"布丁仍軟，還不能定形。","hasn’t set yet 表示還沒凝固，yet 暗示再等一會兒可能會好。"),
  mc("native-206-v2-repair","repair","果凍仍是液態，但你說 It’s set. 應改成哪句？",["It hasn’t set yet.", "It has already set.", "It’s too soft because it’s warm.", "It needs more sugar."],"It hasn’t set yet.","還未凝固用 hasn’t set yet；It’s set 表示已凝固。"),
  mc("native-206-v2-rewrite","rewrite","朋友問 Why can’t we serve the jelly now? 哪句回答最準確？",["It hasn’t set yet; give it more time in the fridge.", "It’s set; we can serve it now.", "It’s chilled enough; take it out now.", "It’s already set; serve it now."],"It hasn’t set yet; give it more time in the fridge.","果凍未定形，所以需要再冷藏；果凍仍是液態、未能定形，所以要讓它在雪櫃多待一段時間。"),
  mc("native-206-v2-tone","tone","孩子問 Can I have the pudding now? 中心仍是液態，你想溫和地解釋為何還要等。哪句較好？",["Not yet. It hasn’t set yet.", "No, it’s still in the fridge; we can eat it later.", "Yes, the outside is firm, though the center still flows.", "Maybe; let’s try cutting a slice first."],"Not yet. It hasn’t set yet.","Not yet 清楚而溫和，後句解釋布丁還未凝固。"),
  {id:"native-206-v2-final",type:'open',style:"final",prompt:"新的情境：你做的奶酪仍很軟，客人問現在能否上桌。寫一兩句英文，說明它還沒凝固，並請客人再等。",answers:["It hasn’t set yet. Could we give it a little more time?", "The panna cotta hasn’t set yet, so we need to wait a bit longer.", "Sorry, it hasn’t set yet. I’ll leave it in the fridge longer."],explanation:"hasn’t set yet 表示預期會凝固但現在還未好；再提出等待。"}
];

const steps=[
  {"id": "native-206-v2-audio", "style": "audio", "label": "先聽狀態", "title": "現在能切嗎？", "intro": "先聽句子，再判斷甜品狀態。", "model": "It hasn’t set yet.", "zh": "它還沒有凝固。", "audioOnly": true, "questions": ["native-206-v2-audio"]},
  {"id": "native-206-v2-speak", "style": "speak", "label": "口頭告知", "title": "先不要吃", "intro": "先試着說出「它還沒有凝固。」，再聽示範。", "model": "It hasn’t set yet.", "zh": "它還沒有凝固。", "speakingPrompt": "朋友想切布丁，你看到它還沒凝固；口頭說「它還未凝固」。", "recording": "phrase", "questions": []},
  {"id": "native-206-v2-repair", "style": "repair", "label": "修正時間", "title": "還沒和已經", "intro": "注意否定和 yet。", "questions": ["native-206-v2-repair"]},
  {"id": "native-206-v2-rewrite", "style": "rewrite", "label": "重新說明", "title": "不是只說太軟", "intro": "說出正在等待的變化。", "questions": ["native-206-v2-rewrite"]},
  {"id": "native-206-v2-tone", "style": "tone", "label": "委婉回應", "title": "孩子想先試吃", "intro": "比較自然的說法。", "questions": ["native-206-v2-tone"]},
  {"id": "native-206-v2-final", "style": "final", "label": "新甜品自寫", "title": "奶酪還未定形", "intro": "自己寫說明，再看示例。", "questions": ["native-206-v2-final"]}
];

export default {revision:2,summary:"用 hasn’t set yet 描述布丁或果凍還沒凝固，並分清已凝固的狀態。",steps,questions,takeaways:["It hasn’t set yet.", "It’s set."],completionTitle:"你能判斷甜品是否凝固，並清楚告訴別人還要等。"};
