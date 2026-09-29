import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-433-v2-audio","audio","這句最直接表示甚麼？",["錶帶正在出現裂紋。", "錶帶已經完全斷成兩截。", "錶面玻璃正在碎裂。", "錶帶只是扣得太鬆。"],"錶帶正在出現裂紋。","is cracking 指裂紋正在形成或擴大，並不必然表示整條已斷。"),
  mc("native-433-v2-detail","detail","錶帶扣孔旁有數道細裂，但錶面完好。哪個描述較準確？",["The watch band is cracking near the buckle.", "The watch face is cracked near the buckle.", "The watch battery has expired.", "The entire watch is missing."],"The watch band is cracking near the buckle.","裂紋在錶帶扣孔旁，句子應點名 band，避免讓人以為錶面玻璃受損。"),
  mc("native-433-v2-reverse","reverse","你和維修員都正在看同一隻錶。哪句可簡短轉述 The watch band is cracking？",["The band is cracking.", "The face is cracking.", "The band has already snapped.", "The watch is running fast."],"The band is cracking.","上下文已明確是手錶時，the band 即錶帶；仍保留開始開裂的意思。"),
  mc("native-433-v2-continue","continue","你發現錶帶扣孔旁裂得更深，擔心手錶掉落。哪句接續最合理？",["I should replace the band before it snaps.", "I’ll tighten the cracked hole as much as possible.", "I’ll replace the watch face even though it’s fine.", "I’ll wait until the watch is lost before checking it."],"I should replace the band before it snaps.","裂紋加深可能導致錶帶斷裂；及早更換正對應這個風險。"),
  {id:"native-433-v2-final",type:'open',style:"final",prompt:"新情境：運動錶的矽膠錶帶在扣孔附近開始裂，你下週要旅行。寫一兩句英文向店員說明問題，並問能否在出發前更換。",answers:["The watch band is cracking near the holes. Can I get it replaced before next week?", "My watch band has started to crack by the buckle. Could you replace it before my trip?", "The band is cracking around the fastening holes. Do you have a replacement available?"],explanation:"說清錶帶裂紋的位置，再提出旅行前更換的請求。"}
];

const steps=[
  {"id": "native-433-v2-audio", "style": "audio", "label": "先聽程度", "title": "錶帶已斷嗎？", "intro": "先聽句子，再留意進行中的變化。", "model": "The watch band is cracking.", "zh": "手錶帶開始裂開。", "audioOnly": true, "questions": ["native-433-v2-audio"]},
  {"id": "native-433-v2-detail", "style": "detail", "label": "指出位置", "title": "錶帶還是錶面", "intro": "用觀察定位問題。", "questions": ["native-433-v2-detail"]},
  {"id": "native-433-v2-reverse", "style": "reverse", "label": "短句轉述", "title": "已知手錶在談話中", "intro": "省去已知的 watch。", "questions": ["native-433-v2-reverse"]},
  {"id": "native-433-v2-continue", "style": "continue", "label": "下一步", "title": "避免突然斷裂", "intro": "根據細裂提出做法。", "questions": ["native-433-v2-continue"]},
  {"id": "native-433-v2-speak", "style": "speak", "label": "口頭報修", "title": "告訴維修員", "intro": "在「告訴維修員」情境先開口，然後聽錄音核對。", "model": "The watch band is cracking.", "zh": "手錶帶開始裂了。", "speakingPrompt": "你看見錶帶有幾道新裂紋；向維修員口說「手錶帶開始裂了」。", "recording": "phrase", "questions": []},
  {"id": "native-433-v2-final", "style": "final", "label": "新手錶自評", "title": "運動錶的錶帶", "intro": "自己寫位置和需要。", "questions": ["native-433-v2-final"]}
];

export default {revision:2,summary:"用 The watch band is cracking. 說明手錶帶表面開始出現裂紋，尚未完全斷開。",steps,questions,takeaways:["The watch band is cracking.", "The band is cracking."],completionTitle:"你能指出錶帶開始開裂，並決定是否更換以免斷裂。"};
