import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-230-v2-audio","audio","聽到這句，窗外最可能怎樣？",["有輕微細雨。", "下着傾盆大雨。", "完全沒有雨。", "正下冰雹。"],"有輕微細雨。","drizzling 指細而輕的雨，和 pouring 大雨不同。"),
  mc("native-230-v2-transfer","transfer","放學時空氣有細細雨點，地面只微濕。哪句自然？",["It’s drizzling.", "It’s pouring.", "It’s snowing heavily.", "It’s perfectly dry."],"It’s drizzling.","細雨和微濕地面支持 drizzling，而不是 pouring。"),
  mc("native-230-v2-reverse","reverse","要表達「外面只是下毛毛雨」，哪句最貼切？",["It’s drizzling.", "It’s pouring.", "It’s hailing.", "It’s overcast but dry."],"It’s drizzling.","drizzling 精確表達正在下輕微細雨。"),
  mc("native-230-v2-continue","continue","朋友問 Is it still raining? 你看到只是毛毛雨。哪句最準確？",["Yes, but it’s just drizzling.", "Yes, it’s pouring so hard I can’t see.", "No, there isn’t a drop of rain.", "No, it’s hailing now."],"Yes, but it’s just drizzling.","Yes 回答仍有雨，just drizzling 再說明雨勢很輕。"),
  mc("native-230-v2-branch","branch","朋友說 It’s drizzling, but the forecast says heavy rain later. 哪項理解最準？",["現在是細雨，稍後可能轉大。", "現在完全沒有雨。", "現在已下暴雨。", "雨已經停了一整天。"],"現在是細雨，稍後可能轉大。","drizzling 描述目前的輕雨；heavy rain later 是之後可能發生。"),
  {id:"native-230-v2-final",type:'open',style:"final",prompt:"新的情境：你在公園等朋友，現在只有毛毛雨，地面微濕。朋友問是否需要改到室內。寫一兩句英文說明目前雨勢並給一個簡短建議。",answers:["It’s just drizzling now. We can wait a little and see if it gets heavier.", "It’s drizzling, but it isn’t heavy. Let’s stay under the shelter for now.", "There’s only a light drizzle. We can head inside if it gets worse."],explanation:"先用 drizzling 說明目前雨勢輕，再按情況提出等候或避雨建議。"}
];

const steps=[
  {"id": "native-230-v2-audio", "style": "audio", "label": "先聽雨勢", "title": "外面雨大嗎？", "intro": "先聽句子，再想像雨勢。", "model": "It’s drizzling.", "zh": "外面下毛毛雨。", "audioOnly": true, "questions": ["native-230-v2-audio"]},
  {"id": "native-230-v2-transfer", "style": "transfer", "label": "換到放學路", "title": "細雨也要留意", "intro": "把用詞放到另一場合。", "questions": ["native-230-v2-transfer"]},
  {"id": "native-230-v2-reverse", "style": "reverse", "label": "中文反推", "title": "毛毛雨的英文", "intro": "從雨勢選詞。", "questions": ["native-230-v2-reverse"]},
  {"id": "native-230-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友問要帶傘嗎", "intro": "根據雨勢回答。", "questions": ["native-230-v2-continue"]},
  {"id": "native-230-v2-branch", "style": "branch", "label": "外出安排", "title": "雨勢是否改變？", "intro": "從天氣變化選回應。", "questions": ["native-230-v2-branch"]},
  {"id": "native-230-v2-final", "style": "final", "label": "新出門自寫", "title": "提醒帶薄外套", "intro": "自己寫天氣和建議，再對照示例。", "questions": ["native-230-v2-final"]}
];

export default {revision:2,summary:"用 drizzling 描述雨勢很輕，並與 pouring 的大雨對照。",steps,questions,takeaways:["It’s drizzling.", "It’s pouring."],completionTitle:"你能按雨勢強弱選詞，並在新外出情境提醒朋友。"};
