import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-400-v2-audio","audio","酒店房間裏聽到這句，最可能是哪個問題？",["隔壁客人正在大聲說話或播音樂。", "走廊裏有人大聲聊天。", "房內冷氣發出持續嗡嗡聲。", "大堂正在舉行音樂活動。"],"隔壁客人正在大聲說話或播音樂。","next door 指隔壁房間；being loud 指住客當下製造噪音。"),
  mc("native-400-v2-detail","detail","前台願意調查噪音。除了「隔壁很吵」，哪組細節最能協助他們處理？",["你的房號、噪音是音樂還是說話、開始時間。", "你想在明早甚麼時間退房。", "你在酒店住了幾晚。", "你房間的冷氣溫度。"],"你的房號、噪音是音樂還是說話、開始時間。","房號、噪音種類和時間有助前台定位房間並核對當下情況。"),
  mc("native-400-v2-repair","repair","前台問 Is the noise from the hallway? 你確定是隔壁住客播音樂。哪句能修正位置並保持禮貌？",["No, it’s coming from the guests next door; they’re playing loud music.", "No, I think it’s the air conditioner in my room.", "I can hear the guests next door, but they’re speaking softly.", "I’m not sure which room, but I hear music nearby."],"No, it’s coming from the guests next door; they’re playing loud music.","先否定走廊，再提供隔壁住客和音樂的具體資訊，便於前台處理。"),
  mc("native-400-v2-reverse","reverse","酒店隔壁安靜說話也清晰傳入你的房間；沒有誰特別大聲。哪句更能指出建築隔音問題？",["The walls are thin.", "The guests next door are being loud.", "The hallway is noisy.", "The air conditioner is humming."],"The walls are thin.","若隔壁只是正常音量卻仍聽得清，問題更像隔音差；being loud 會指責住客音量。"),
  {id:"native-400-v2-final",type:'open',style:"final",prompt:"新的情境：午夜你在酒店房間準備睡覺，隔壁住客仍大聲播音樂。寫一兩句禮貌英文向前台報告並請求協助。",answers:["The guests next door are being loud and playing music. Could someone speak to them?", "I’m in room 508, and the guests next door are playing loud music. Could you help?", "The room next door is very loud tonight. Would you mind looking into it?"],explanation:"指出噪音來自隔壁住客、正在播音樂，再提出具體而禮貌的處理請求。"}
];

const steps=[
  {"id": "native-400-v2-audio", "style": "audio", "label": "先聽來源", "title": "噪音從哪來？", "intro": "先聽句子，再定位問題。", "model": "The guests next door are being loud.", "zh": "隔壁住客很吵。", "audioOnly": true, "questions": ["native-400-v2-audio"]},
  {"id": "native-400-v2-detail", "style": "detail", "label": "抓位置", "title": "哪間房吵？", "intro": "讓前台知道來源。", "questions": ["native-400-v2-detail"]},
  {"id": "native-400-v2-repair", "style": "repair", "label": "修正原因", "title": "不只牆薄", "intro": "分清噪音來源和隔音問題。", "questions": ["native-400-v2-repair"]},
  {"id": "native-400-v2-reverse", "style": "reverse", "label": "中文反推", "title": "向前台報告", "intro": "選直接說明人的句子。", "questions": ["native-400-v2-reverse"]},
  {"id": "native-400-v2-final", "style": "final", "label": "新酒店自寫", "title": "午夜仍在播音樂", "intro": "自己寫噪音細節和請求，再看示例。", "questions": ["native-400-v2-final"]}
];

export default {revision:2,summary:"用 The guests next door are being loud. 描述酒店隔壁住客正在製造噪音，並與薄牆區分。",steps,questions,takeaways:["The guests next door are being loud.", "The walls are thin."],completionTitle:"你能向前台清楚報告噪音來源，並請求處理。"};
