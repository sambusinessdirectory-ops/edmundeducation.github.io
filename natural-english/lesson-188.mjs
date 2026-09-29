import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-188-v2-audio","audio","聽到的物品主要用來做甚麼？",["暖一個小範圍。", "替整個房間快速降溫。", "把空氣中的水分抽乾。", "測量房間溫度。"],"暖一個小範圍。","space heater 是在房間一角、桌邊等小範圍使用的暖爐。"),
  mc("native-188-v2-reverse","reverse","同事桌底有一部可搬走、只暖附近的小型電暖爐。哪個詞最準確？",["space heater", "air conditioner", "ceiling fan", "humidifier"],"space heater","space heater 是局部空間使用的可移動暖爐。"),
  mc("native-188-v2-contrast","contrast","酒店房間的固定中央暖氣壞了，職員送來一部可插電搬動的小暖爐。送來的是甚麼？",["a space heater", "central heating", "an AC unit", "a ceiling fan"],"a space heater","可搬動、加熱局部的設備是 space heater，不是整套中央暖氣。"),
  {id:"native-188-v2-detail",type:'open',style:"detail",prompt:"新的情境：酒店房間大暖氣太弱，職員可送來一部小型、可搬到書桌旁的暖爐。寫一兩句英文向朋友說明送來的是甚麼，以及它暖哪個範圍。",answers:["They brought us a space heater. It will warm the area by the desk.", "The hotel sent a small space heater that we can move next to the desk."],explanation:"space heater 指可移動、加熱局部的設備；說出書桌旁能顯示你理解其用途。"}
];

const steps=[
  {"id": "native-188-v2-audio", "style": "audio", "label": "聽出物品", "title": "先聽名稱", "intro": "先聽英文，再選出物品。", "model": "space heater", "zh": "小型移動式暖爐。", "audioOnly": true, "questions": ["native-188-v2-audio"]},
  {"id": "native-188-v2-reverse", "style": "reverse", "label": "看物件選詞", "title": "桌底的小暖爐", "intro": "由物件特徵反推名稱。", "questions": ["native-188-v2-reverse"]},
  {"id": "native-188-v2-speak", "style": "speak", "label": "口頭描述", "title": "房間有點冷", "intro": "先說；錄音或跳過後才聽示範。", "model": "space heater", "zh": "小型移動式暖爐。", "speakingPrompt": "你在辦公室桌下放一部小型移動暖爐。先口頭說出這件設備的英文名稱。", "recording": "phrase", "questions": []},
  {"id": "native-188-v2-contrast", "style": "contrast", "label": "比較設備", "title": "中央與局部", "intro": "找出更精確的名稱。", "questions": ["native-188-v2-contrast"]},
  {"id": "native-188-v2-detail", "style": "detail", "label": "新情境自評", "title": "酒店客房的小暖爐", "intro": "轉到「酒店客房的小暖爐」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-188-v2-detail"]}
];

export default {revision:2,summary:"辨認可移動、加熱小範圍的 space heater，並與一般暖氣設備區分。",steps,questions,takeaways:["space heater", "The heater isn’t working."],completionTitle:"你能認出小型移動暖爐，並在房間或辦公桌情境用對詞。"};
