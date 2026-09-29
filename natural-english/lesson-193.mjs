import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-193-v2-audio","audio","在坐得太擠的長櫈旁聽到這句，別人希望你怎樣做？",["挪開一點，留出座位。", "坐着的人需要靠近一點。", "有個人需要站起來讓路。", "需要把長櫈搬到別處。"],"挪開一點，留出座位。","make some room 在這裏指騰出身旁空間。"),
  mc("native-193-v2-continue","continue","朋友問 Is there room for me on the bench? 你想請其他人稍微挪開。哪句最貼切？",["Sure. Let’s make some room.", "Sure, but you might have to sit on the armrest.", "Yes, there’s another bench over there.", "Sorry, this bench is already full."],"Sure. Let’s make some room.","make some room 是騰出位置，讓朋友坐下。"),
  mc("native-193-v2-scene","scene","哪個情況最適合說 Make some room？",["三人坐在雙人沙發上，第四人想加入。", "所有人已坐得很靠攏，沒有空位。", "有人要坐到另一張空桌。", "長櫈太窄，大家不能再挪動。"],"三人坐在雙人沙發上，第四人想加入。","這句用來請人挪動、騰出位置；在這個場景裏，大家須把身邊的空位讓出來給新到的人坐。"),
  {id:"native-193-v2-final",type:'open',style:"final",prompt:"新的情境：電影夜朋友帶着一位新同學進房間，沙發上大家坐得太開，還有空間可挪。寫一句英文，請大家挪一挪讓新同學坐。",answers:["Could everyone move over a little and make some room for her?", "Let's make some room so she can sit with us.", "Please make some room for our new classmate on the couch."],explanation:"make some room for someone 清楚說明要為誰騰位；語氣可加 please 或 could。"}
];

const steps=[
  {"id": "native-193-v2-audio", "style": "audio", "label": "先聽請求", "title": "需要甚麼空間？", "intro": "先聽短句再判斷。", "model": "Make some room.", "zh": "騰出一點位置。", "audioOnly": true, "questions": ["native-193-v2-audio"]},
  {"id": "native-193-v2-speak", "style": "speak", "label": "口頭請求", "title": "沙發上留個位", "intro": "先口說；錄音或跳過後才聽示範。", "model": "Make some room.", "zh": "騰出一點位置。", "speakingPrompt": "朋友想坐上已擠滿的沙發，口頭請大家挪一挪。", "recording": "phrase", "questions": []},
  {"id": "native-193-v2-continue", "style": "continue", "label": "接續對話", "title": "有人想一起坐", "intro": "根據對方的要求回應。", "questions": ["native-193-v2-continue"]},
  {"id": "native-193-v2-scene", "style": "scene", "label": "選場景", "title": "哪時適合說？", "intro": "比較身體空間與其他需求。", "questions": ["native-193-v2-scene"]},
  {"id": "native-193-v2-final", "style": "final", "label": "自寫新場景", "title": "電影夜的沙發", "intro": "寫自己的回應，再用示例自評。", "questions": ["native-193-v2-final"]}
];

export default {revision:2,summary:"用 Make some room. 請坐得太擠的人挪開一點，留出位置。",steps,questions,takeaways:["Make some room.", "Move over."],completionTitle:"你能在擁擠座位上自然請人騰出位置。"};
