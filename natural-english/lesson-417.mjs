import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-417-v2-audio","audio","聽到這句，說話者接下來最可能怎樣？",["伸手越過對方面前拿東西。", "起身從對方背後離開餐桌。", "請對方把椅子挪開。", "把桌上的東西推到對方手邊。"],"伸手越過對方面前拿東西。","reach past you 指手從你身前伸過，Sorry 先提醒並道歉可能打擾。"),
  mc("native-417-v2-scene","scene","哪個情況最適合說 Sorry, let me reach past you？",["紙巾在對方前面，你伸手要越過他才能拿到。", "紙巾就在你手邊，不需碰到任何人。", "你要從他背後走去門口。", "你請他把紙巾直接遞給你。"],"紙巾在對方前面，你伸手要越過他才能拿到。","reach past 是自己的手要從對方面前經過；請對方遞來則可說 pass me。"),
  mc("native-417-v2-tone","tone","同桌陌生人面前有你需要的番茄醬。哪句能先禮貌提醒對方？",["Sorry, let me reach past you for the ketchup.", "Move your arm; I need the ketchup.", "I’ll grab that without telling you.", "This ketchup belongs to me, so look away."],"Sorry, let me reach past you for the ketchup.","先說 Sorry 再伸手，讓對方知道你的動作，避免突然越過他的身前。"),
  {id:"native-417-v2-final",type:'open',style:"final",prompt:"新的情境：咖啡店菜單放在朋友前面，你需要伸手從他面前拿，但他正喝咖啡。寫一句禮貌英文，在伸手前提醒他並說明要拿菜單。",answers:["Sorry, let me reach past you for the menu.", "Excuse me, I need to reach past you to get the menu.", "Sorry, can I reach past you and grab the menu?"],explanation:"先用 Sorry 或 Excuse me 提醒，再說 reach past you 和要拿的菜單。"}
];

const steps=[
  {"id": "native-417-v2-audio", "style": "audio", "label": "先聽餐桌", "title": "手會從哪裏過？", "intro": "先聽句子，再辨認動作方向。", "model": "Sorry, let me reach past you.", "zh": "不好意思，讓我從你面前伸手過去。", "audioOnly": true, "questions": ["native-417-v2-audio"]},
  {"id": "native-417-v2-scene", "style": "scene", "label": "何時先提醒", "title": "拿桌對面的東西", "intro": "比較不同取物方式。", "questions": ["native-417-v2-scene"]},
  {"id": "native-417-v2-tone", "style": "tone", "label": "減少打擾", "title": "先出聲再伸手", "intro": "比較同一行動的禮貌程度。", "questions": ["native-417-v2-tone"]},
  {"id": "native-417-v2-speak", "style": "speak", "label": "口頭提醒", "title": "伸手前先說", "intro": "先口說即時提醒，再聽示範。", "model": "Sorry, let me reach past you.", "zh": "不好意思，讓我從你面前伸手過去。", "speakingPrompt": "你要從同桌朋友面前伸手拿鹽；先口頭說「不好意思，讓我伸手過去」。", "recording": "phrase", "questions": []},
  {"id": "native-417-v2-final", "style": "final", "label": "新餐桌自評", "title": "拿遠處的菜單", "intro": "自己寫提醒與目的，再看示例。", "questions": ["native-417-v2-final"]}
];

export default {revision:2,summary:"用 Sorry, let me reach past you. 禮貌提醒同桌的人自己要伸手從他面前拿東西。",steps,questions,takeaways:["Sorry, let me reach past you.", "Let me reach past you."],completionTitle:"你能在伸手越過別人前先提醒，避免突然碰到對方。"};
