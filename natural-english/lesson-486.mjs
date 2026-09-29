import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-486-v2-audio","audio","最可能發生甚麼？",["紙袋一邊提把從袋身撕下來。", "提把仍牢固，只是袋底有小洞。", "整個袋子被剪刀剪開。", "袋裏的物品原本就不見了。"],"紙袋一邊提把從袋身撕下來。","tore off 是因撕裂而脫離；the handle 指提把，不是袋底。"),
  mc("native-486-v2-explain","explain","紙袋裝滿罐頭，一提起來提把沿接縫撕掉。哪句同時交代原因與結果？",["The bag was too heavy, and the handle tore off.", "The bag was empty, so the handle stayed attached.", "The handle was comfortable, but the zipper jammed.", "The bag closed tightly, so nothing changed."],"The bag was too heavy, and the handle tore off.","too heavy 解釋負重，tore off 說明提把從袋身撕裂脫落。"),
  mc("native-486-v2-tone","tone","你剛離開商店，紙袋提把突然脫落，部分物品掉在門口。哪句向店員說較得體？",["The handle tore off and a few things fell out. Could I have another bag?", "Your bags are all defective, so I’m taking extra products.", "Nothing happened, but give me a refund now.", "I cut the handle myself, so please blame the cashier."],"The handle tore off and a few things fell out. Could I have another bag?","交代提把斷裂與掉落物，並請求另一個袋子，方便即時處理。"),
  mc("native-486-v2-continue","continue","紙袋一邊提把已撕掉，裏面仍有重瓶子。哪句最安全地繼續搬運？",["Let’s put the bottles in a sturdier bag before moving them.", "I’ll carry it by the remaining thin handle and run.", "I’ll shake the bag to test the other handle.", "I’ll tape only the torn paper flap and lift by it."],"Let’s put the bottles in a sturdier bag before moving them.","重物和斷把會增加再破裂風險；先換結實的袋子才便於搬運。"),
  {id:"native-486-v2-branch",type:'open',style:"branch",prompt:"新情境：你在水果店買了幾公斤水果，走到門口時紙袋提把撕掉，橙掉到地上。寫一兩句英文向店員說明發生甚麼事，並請求另一個較結實的袋。",answers:["The bag was too heavy, and the handle tore off. Could I have a sturdier bag for the fruit?", "The handle tore off and some oranges fell out. May I have another bag, please?", "The paper handle ripped off when I lifted the fruit. Could you help me repack it in a stronger bag?"],explanation:"要說明提把從袋身撕脫和水果散落，再提出換結實袋或重新裝袋。"}
];

const steps=[
  {"id": "native-486-v2-audio", "style": "audio", "label": "先聽斷裂", "title": "哪部分掉了？", "intro": "先聽句子，分清提把與袋身。", "model": "The handle tore off.", "zh": "提把撕裂脫落了。", "audioOnly": true, "questions": ["native-486-v2-audio"]},
  {"id": "native-486-v2-explain", "style": "explain", "label": "重量線索", "title": "為甚麼會斷？", "intro": "連起負重和撕裂。", "questions": ["native-486-v2-explain"]},
  {"id": "native-486-v2-tone", "style": "tone", "label": "向店員說明", "title": "先顧散落物", "intro": "清楚描述而不先指責。", "questions": ["native-486-v2-tone"]},
  {"id": "native-486-v2-continue", "style": "continue", "label": "立刻搬運", "title": "不要再靠斷把", "intro": "根據損壞選下一步。", "questions": ["native-486-v2-continue"]},
  {"id": "native-486-v2-branch", "style": "branch", "label": "新商店自評", "title": "紙袋散落的水果", "intro": "自己寫事故和可行請求。", "questions": ["native-486-v2-branch"]}
];

export default {revision:2,summary:"用 The handle tore off. 描述紙袋提把從袋身撕裂脫落，並在物品散落時處理。",steps,questions,takeaways:["The handle tore off.", "The bag was too heavy, and the handle tore off."],completionTitle:"你能說清提把斷裂脫落的原因與後果，並選擇安全搬運方法。"};
