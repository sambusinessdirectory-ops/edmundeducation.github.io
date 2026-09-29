import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-229-v2-audio","audio","開車時聽到這句，最可能發生甚麼？",["引擎突然停止運作。", "輪胎慢慢漏氣。", "車窗玻璃裂開。", "車輪在路口打滑，但引擎仍正常運作。"],"引擎突然停止運作。","stalled 在駕駛情境指引擎意外停止，車子可能因此失去動力。"),
  mc("native-229-v2-detail","detail","哪項細節最支持 The engine stalled？",["車子行進中突然失去引擎動力。", "踩油門時車沒有反應，但儀表板仍亮。", "輪胎漏氣，車身慢慢偏向一邊。", "冷氣停止吹風，但車仍能加速。"],"車子行進中突然失去引擎動力。","引擎在行駛中突然停轉，符合 stalled 的突發性。"),
  mc("native-229-v2-explain","explain","The engine stalled. 比 My car broke down. 多指出哪項資訊？",["停止運作的是引擎。", "壞的是車窗。", "車子的電池已沒電。", "車的輪胎爆了。"],"停止運作的是引擎。","broke down 較籠統；engine stalled 精確指出引擎熄火。"),
  mc("native-229-v2-scene","scene","哪個場景最適合說 The engine stalled？",["紅燈前車子忽然失去動力，需靠邊重啟。", "車門鎖失靈，但引擎運作正常。", "低速時引擎發出異響，但仍持續運作。", "輪胎被釘刺中，胎壓逐漸下降。"],"紅燈前車子忽然失去動力，需靠邊重啟。","引擎突然停止運轉、需重啟，正是 stalled。"),
  {id:"native-229-v2-final",type:'open',style:"final",prompt:"新的情境：你去機場途中，引擎突然熄火；你安全靠邊停車並會叫救援。寫一兩句英文向等你的朋友說明。",answers:["The engine stalled on the way to the airport. I pulled over safely and will call for help.", "Sorry, the engine stalled. I’ve pulled over and am arranging roadside assistance.", "My engine stalled, so I pulled over safely. I’ll update you after I call for help."],explanation:"engine stalled 說明突發引擎故障；補上已安全停車及下一步。"}
];

const steps=[
  {"id": "native-229-v2-audio", "style": "audio", "label": "先聽事故", "title": "哪個系統停了？", "intro": "先聽句子，再辨認故障。", "model": "The engine stalled.", "zh": "引擎突然熄火。", "audioOnly": true, "questions": ["native-229-v2-audio"]},
  {"id": "native-229-v2-detail", "style": "detail", "label": "事故時間", "title": "是在開車中", "intro": "找最關鍵的觀察。", "questions": ["native-229-v2-detail"]},
  {"id": "native-229-v2-explain", "style": "explain", "label": "說法精度", "title": "stall 與 broke down", "intro": "分辨具體故障和整體狀況。", "questions": ["native-229-v2-explain"]},
  {"id": "native-229-v2-scene", "style": "scene", "label": "選事故畫面", "title": "為何靠邊停？", "intro": "由駕駛狀況選句。", "questions": ["native-229-v2-scene"]},
  {"id": "native-229-v2-final", "style": "final", "label": "新道路自寫", "title": "向朋友交代遲到", "intro": "先寫原因和安全處理，再看示例。", "questions": ["native-229-v2-final"]}
];

export default {revision:2,summary:"用 The engine stalled. 描述駕駛途中引擎突然熄火，並分清整車故障。",steps,questions,takeaways:["The engine stalled.", "My car broke down."],completionTitle:"你能說明開車中引擎熄火，並向別人報告安全停車。"};
