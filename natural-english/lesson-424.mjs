import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-424-v2-audio","audio","這句最明確指出哪個部分受損？",["窗戶的紗網。", "窗戶的玻璃。", "窗框的鎖扣。", "窗簾的布料。"],"窗戶的紗網。","screen 在這個窗戶情境是紗網；tear 是裂口，不是玻璃碎裂。"),
  mc("native-424-v2-detail","detail","玻璃完好，但紗網角落裂了一道口，蚊子可能鑽進來。哪句最準確？",["There’s a tear in the screen.", "The window is broken.", "The screen has been removed.", "The window won’t close."],"There’s a tear in the screen.","角落裂口屬於紗網的 tear；說 window is broken 會讓人以為玻璃或整扇窗壞了。"),
  mc("native-424-v2-scene","scene","維修員聽到 There’s a tear in the screen. 後，哪個準備最切題？",["帶紗網修補材料並量裂口。", "預備更換整塊玻璃。", "檢查窗戶電動馬達。", "只調整窗簾軌道。"],"帶紗網修補材料並量裂口。","受損的是 screen 的裂口，修補或更換紗網比更換玻璃更合適。"),
  {id:"native-424-v2-final",type:'open',style:"final",prompt:"新情境：浴室窗戶玻璃完好，但紗網底部裂開，夜間有昆蟲飛進來。寫一兩句英文向維修員報告受損位置和影響。",answers:["There’s a tear at the bottom of the window screen, and insects are getting in.", "The glass is fine, but there’s a tear in the bathroom screen. Bugs can come through it.", "The bathroom window screen has a tear near the bottom, so insects can get inside."],explanation:"明確說是紗網裂口、指出底部，並說明昆蟲因此可進入。"}
];

const steps=[
  {"id": "native-424-v2-audio", "style": "audio", "label": "先聽部位", "title": "玻璃還是紗網？", "intro": "先聽句子，再定位受損物。", "model": "There’s a tear in the screen.", "zh": "紗窗網上有一道破口。", "audioOnly": true, "questions": ["native-424-v2-audio"]},
  {"id": "native-424-v2-detail", "style": "detail", "label": "損壞程度", "title": "tear 與整面破碎", "intro": "選最精確的描述。", "questions": ["native-424-v2-detail"]},
  {"id": "native-424-v2-scene", "style": "scene", "label": "選修理方法", "title": "先處理哪個部件", "intro": "從問題推導行動。", "questions": ["native-424-v2-scene"]},
  {"id": "native-424-v2-speak", "style": "speak", "label": "口頭報修", "title": "向房東說明", "intro": "在「向房東說明」情境先開口，然後聽錄音核對。", "model": "There’s a tear in the screen.", "zh": "紗窗網上有一道破口。", "speakingPrompt": "你看到窗戶紗網有裂口但玻璃沒壞；向房東口說「紗網上有一道破口」。", "recording": "phrase", "questions": []},
  {"id": "native-424-v2-final", "style": "final", "label": "新房間自評", "title": "浴室防蚊紗網", "intro": "自己寫問題和後果。", "questions": ["native-424-v2-final"]}
];

export default {revision:2,summary:"用 There’s a tear in the screen. 描述窗戶紗網破損，並區分紗網與玻璃。",steps,questions,takeaways:["There’s a tear in the screen.", "The window is broken."],completionTitle:"你能清楚報告紗網裂口，讓維修者知道要修哪個部分。"};
