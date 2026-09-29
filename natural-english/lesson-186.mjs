import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-186-v2-audio","audio","聽到的詞最可能指哪組東西？",["番茄醬、芥末和辣醬。", "鍋鏟、刀和碟。", "鹽、胡椒和麵粉。", "雞肉、魚和豆腐。"],"番茄醬、芥末和辣醬。","condiment 常指上桌後按口味加的醬料，例如番茄醬和芥末。"),
  mc("native-186-v2-explain","explain","餐廳把番茄醬放在櫃台讓客人自行加。為甚麼它是 condiment？",["它是在食物做好後按個人口味加的醬料。", "它是烹調前撒進食物的乾香料。", "它是主菜本身的一部分，不能另外加。", "它只用來盛載已做好的食物。"],"它是在食物做好後按個人口味加的醬料。","condiment 的關鍵是佐餐添加；seasoning 常指烹調時調味用的材料。"),
  mc("native-186-v2-reverse","reverse","餐桌有 ketchup、mustard、hot sauce；要用一個英文總稱，哪個最合適？",["condiments", "utensils", "leftovers", "main courses"],"condiments","這些都是佐餐用的 condiments；複數表示多種醬料。"),
  {id:"native-186-v2-contrast",type:'open',style:"contrast",prompt:"新的情境：同事問桌上的芥末醬與煮雞前撒的香料有何不同。寫一兩句英文，分別用 condiment 和 seasoning 說清兩者用途。",answers:["Mustard is a condiment you add at the table. The spices used before cooking are seasonings.", "The mustard is a condiment for the finished chicken; the dry herbs are seasoning used while cooking."],explanation:"condiment 指上桌後按口味添加的醬料；seasoning 指烹調時調味的香料。"}
];

const steps=[
  {"id": "native-186-v2-audio", "style": "audio", "label": "先聽詞", "title": "聽出是哪類東西", "intro": "先聽再作判斷。", "model": "condiment", "zh": "佐餐醬料。", "audioOnly": true, "questions": ["native-186-v2-audio"]},
  {"id": "native-186-v2-speak", "style": "speak", "label": "餐桌開口", "title": "問醬料在哪裏", "intro": "先口說，之後再聽示範。", "model": "condiment", "zh": "佐餐醬料。", "speakingPrompt": "你在自助餐桌找番茄醬和芥末。先口頭說出這類佐餐醬料的英文總稱。", "recording": "phrase", "questions": []},
  {"id": "native-186-v2-explain", "style": "explain", "label": "說明分類", "title": "為何這是醬料？", "intro": "從使用方式判斷。", "questions": ["native-186-v2-explain"]},
  {"id": "native-186-v2-reverse", "style": "reverse", "label": "情境反推", "title": "找一個總稱", "intro": "由幾種桌上醬料選詞。", "questions": ["native-186-v2-reverse"]},
  {"id": "native-186-v2-contrast", "style": "contrast", "label": "新情境自評", "title": "辦公室午餐的新用法", "intro": "轉到「辦公室午餐的新用法」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-186-v2-contrast"]}
];

export default {revision:2,summary:"分清吃東西時另外加的 condiment 和烹調時用的 seasoning。",steps,questions,takeaways:["condiment", "Add some seasoning to the chicken."],completionTitle:"你能在餐桌情境中準確說出 condiment，並和 seasoning 分開。"};
