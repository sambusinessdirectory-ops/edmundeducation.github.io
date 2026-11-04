import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-204-v2-audio","audio","聽到這句，飲料最可能怎樣？",["味道比原本淡。", "味道比剛倒出時更濃。", "飲料只是失去氣泡。", "飲料變得更甜。"],"味道比原本淡。","watered down 指水分令味道變淡。"),
  mc("native-204-v2-continue","continue","朋友問 Why does the iced tea taste so weak now? 冰都融了。哪句回應最準確？",["It’s watered down because the ice melted.", "It’s flat because all the bubbles are gone.", "It tastes stronger because the ice melted.", "It’s too sweet because the ice melted."],"It’s watered down because the ice melted.","冰融成水，沖淡味道；watered down 描述結果。"),
  mc("native-204-v2-explain","explain","果汁加了太多水，味道變得淡。watered down 說的是甚麼？",["水分稀釋了原本味道。", "氣泡完全消失。", "飲料變得更濃。", "飲料只是變暖，濃度沒有改變。"],"水分稀釋了原本味道。","watered down 是被水沖淡；flat 多指有氣飲料沒氣。"),
  mc("native-204-v2-detail","detail","有人說汽水 It’s flat. 這和 watered down 的主要差別是甚麼？",["flat 是失去氣泡；watered down 是味道被水沖淡。", "flat 指味道被水沖淡；watered down 指沒氣泡。", "watered down 只表示飲料變暖。", "兩者都指甜度增加。"],"flat 是失去氣泡；watered down 是味道被水沖淡。","兩種變化可同時發生，但詞義重點不同；汽水可以同時失去氣泡又被融冰沖淡，但 flat 和 watered down 分別指出不同變化。"),
  {id:"native-204-v2-scene",type:'open',style:"scene",prompt:"新的情境：野餐時你的檸檬水放了很久，冰塊融掉，味道變淡。寫一兩句英文向朋友說明變化和原因。",answers:["The lemonade is watered down now. All the ice melted.", "It tastes watered down because the ice melted and diluted it."],explanation:"watered down 指加水後味道變淡；融冰是新場景中的水分來源。"}
];

const steps=[
  {"id": "native-204-v2-audio", "style": "audio", "label": "聽出結果", "title": "味道變怎樣？", "intro": "先聽英文再作判斷。", "model": "It’s watered down.", "zh": "它被水沖淡了。", "audioOnly": true, "questions": ["native-204-v2-audio"]},
  {"id": "native-204-v2-continue", "style": "continue", "label": "接着說原因", "title": "冰塊融了", "intro": "承接對飲料味道的評論。", "questions": ["native-204-v2-continue"]},
  {"id": "native-204-v2-explain", "style": "explain", "label": "說明變化", "title": "味道為何淡了？", "intro": "分辨水分與氣泡。", "questions": ["native-204-v2-explain"]},
  {"id": "native-204-v2-detail", "style": "detail", "label": "抓關鍵細節", "title": "與 flat 的分別", "intro": "留意濃淡和氣泡。", "questions": ["native-204-v2-detail"]},
  {"id": "native-204-v2-speak", "style": "speak", "label": "口頭描述", "title": "冰咖啡放久了", "intro": "先試着說出「它被沖淡了。」，再聽示範。", "model": "It’s watered down.", "zh": "它被沖淡了。", "speakingPrompt": "冰咖啡冰塊融光，咖啡味變淡；口頭告訴朋友。", "recording": "phrase", "questions": []},
  {"id": "native-204-v2-scene", "style": "scene", "label": "新情境自評", "title": "檸檬水被融冰沖淡", "intro": "轉到「檸檬水被融冰沖淡」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-204-v2-scene"]}
];

export default {revision:2,summary:"用 watered down 描述飲料因加水或冰融化而味道被沖淡；分清 watery 和 flat。",steps,questions,takeaways:["It’s watered down.", "It’s flat."],completionTitle:"你能說明冰融後飲料味道變淡，並分清氣泡消失。"};
