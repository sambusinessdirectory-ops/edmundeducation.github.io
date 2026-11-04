import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-213-v2-audio","audio","聽到這句，最可能發生甚麼？",["鎖匙已插入，卻轉不動。", "鎖匙根本沒帶出門。", "鑰匙插不進匙孔。", "鑰匙可以轉，但門把手拉不動。"],"鎖匙已插入，卻轉不動。","jammed 指機關卡死；問題在鎖的動作，不在是否帶鎖匙。"),
  mc("native-213-v2-branch","branch","你的鑰匙和備用鑰匙都插得進去卻轉不動；你不想扭斷鑰匙。哪個下一步最合理？",["停止硬扭，聯絡管理員或鎖匠。", "繼續強扭直到鑰匙斷。", "先試試同一把鑰匙能否開另一把鎖。", "用另一把備用鑰匙再試。"],"停止硬扭，聯絡管理員或鎖匠。","機關卡住時硬扭可能令鑰匙折斷；應找人檢查鎖。"),
  mc("native-213-v2-detail","detail","哪項觀察最支持 The lock is jammed？",["鑰匙插得進去，卻怎樣也轉不動。", "鑰匙留在辦公室。", "鑰匙插不進去，像被東西堵住。", "鑰匙能轉動，但門舌沒有縮回。"],"鑰匙插得進去，卻怎樣也轉不動。","卡住的是鎖內部機關，插入後轉不動是關鍵線索。"),
  mc("native-213-v2-explain","explain","門鎖和印表機都可 jammed；共同點是甚麼？",["機件或通道被卡住，正常動作受阻。", "它們都有零件需要潤滑，但未必卡死。", "它們的開關都可能鬆動。", "它們都只是外觀褪色。"],"機件或通道被卡住，正常動作受阻。","jammed 表示卡住，可描述鎖的機關或印表機的紙張通道。"),
  {id:"native-213-v2-repair",type:'open',style:"repair",prompt:"新的情境：健身室儲物櫃的鑰匙能插入，但怎樣都轉不動；朋友叫你再用力扭。寫一兩句英文修正他的建議，說明可能故障和較安全的下一步。",answers:["The lock may be jammed. Let’s not force the key; I’ll ask staff for help.", "The key goes in, but the lock is jammed. I’d rather get an employee than twist it harder."],explanation:"jammed 指鎖機關卡住；不要硬扭鑰匙，應請職員協助。"}
];

const steps=[
  {"id": "native-213-v2-audio", "style": "audio", "label": "先聽故障", "title": "轉不動的部分", "intro": "先聽完整句，再回答「轉不動的部分」。", "model": "The lock is jammed.", "zh": "門鎖卡住了。", "audioOnly": true, "questions": ["native-213-v2-audio"]},
  {"id": "native-213-v2-branch", "style": "branch", "label": "選下一步", "title": "開不了門", "intro": "根據問題選處理。", "questions": ["native-213-v2-branch"]},
  {"id": "native-213-v2-detail", "style": "detail", "label": "抓故障細節", "title": "鑰匙有沒有插入？", "intro": "找關鍵證據。", "questions": ["native-213-v2-detail"]},
  {"id": "native-213-v2-explain", "style": "explain", "label": "理解 jammed", "title": "不只門鎖", "intro": "辨認詞的共同概念。", "questions": ["native-213-v2-explain"]},
  {"id": "native-213-v2-speak", "style": "speak", "label": "口頭求助", "title": "向管理員說", "intro": "先練習指出門鎖卡住，再聽示範。", "model": "The lock is jammed.", "zh": "門鎖卡住了。", "speakingPrompt": "鑰匙插入後完全轉不動；口頭說「門鎖卡住了」。", "recording": "phrase", "questions": []},
  {"id": "native-213-v2-repair", "style": "repair", "label": "新情境自評", "title": "儲物櫃鎖匙轉不動", "intro": "轉到「儲物櫃鎖匙轉不動」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-213-v2-repair"]}
];

export default {revision:2,summary:"用 The lock is jammed. 描述鎖匙已插入但鎖的機關卡住、轉不動。",steps,questions,takeaways:["The lock is jammed.", "The printer is jammed."],completionTitle:"你能指出門鎖卡住的症狀，並與忘帶鎖匙分開。"};
