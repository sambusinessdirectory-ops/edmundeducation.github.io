import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-437-v2-audio","audio","這句最直接表示甚麼？",["手機無法讀取這個二維碼。", "手機已成功讀取並開啟頁面。", "手機相機完全不能啟動。", "二維碼貼紙已經撕掉。"],"手機無法讀取這個二維碼。","won’t scan 表示嘗試掃描仍未成功；不必推斷相機壞了或碼已消失。"),
  mc("native-437-v2-scene","scene","你和朋友的手機都能掃其他碼，卻都讀不到同一張被折皺的紙碼。哪個判斷較有根據？",["這張 QR code 可能已損壞或印得不清。", "兩部手機的鏡頭一定同時故障。", "網絡一定已斷線，無須看碼。", "二維碼正常，只是兩人都看錯顏色。"],"這張 QR code 可能已損壞或印得不清。","兩部手機可掃其他碼，問題集中在同一張折皺紙碼，比同時鏡頭故障更合理。"),
  mc("native-437-v2-tone","tone","你已調整距離和焦點仍掃不到餐桌碼。哪句向店員說較有幫助？",["The QR code won’t scan, even after I refocus. Could I see a menu?", "Your entire system is broken, so I won’t explain anything.", "I scanned it successfully, but could you replace my phone?", "The code works; I just want a different table."],"The QR code won’t scan, even after I refocus. Could I see a menu?","交代已重新對焦但仍失敗，並提出紙本菜單作替代，讓店員容易協助。"),
  {id:"native-437-v2-final",type:'open',style:"final",prompt:"新情境：展覽入口的電子票 QR code 在你手機上掃不到，隊伍正在等。寫一兩句英文向職員說明問題，並問能否用票號核對。",answers:["My ticket’s QR code won’t scan. Could you look it up using the ticket number?", "The QR code on my e-ticket isn’t scanning. Can I give you the booking number instead?", "I’ve tried the QR code twice, but it won’t scan. Could you check my ticket number?"],explanation:"說明 QR code 讀不到，再提出用票號核對作可行替代。"}
];

const steps=[
  {"id": "native-437-v2-audio", "style": "audio", "label": "先聽結果", "title": "手機有反應嗎？", "intro": "先聽句子，再判斷故障。", "model": "The QR code won’t scan.", "zh": "這個二維碼掃不到。", "audioOnly": true, "questions": ["native-437-v2-audio"]},
  {"id": "native-437-v2-scene", "style": "scene", "label": "排查線索", "title": "是碼還是鏡頭？", "intro": "用兩個手機比較。", "questions": ["native-437-v2-scene"]},
  {"id": "native-437-v2-tone", "style": "tone", "label": "向職員求助", "title": "說清已嘗試甚麼", "intro": "簡明描述並提出請求。", "questions": ["native-437-v2-tone"]},
  {"id": "native-437-v2-speak", "style": "speak", "label": "口頭反映", "title": "在櫃台說明", "intro": "在「在櫃台說明」情境先開口，然後聽錄音核對。", "model": "The QR code won’t scan.", "zh": "這個二維碼掃不到。", "speakingPrompt": "你移近移遠仍讀不到櫃台二維碼；向職員口說「這個二維碼掃不到」。", "recording": "phrase", "questions": []},
  {"id": "native-437-v2-final", "style": "final", "label": "新入口自評", "title": "展覽電子票", "intro": "自己寫問題和替代方案。", "questions": ["native-437-v2-final"]}
];

export default {revision:2,summary:"用 The QR code won’t scan. 描述手機對焦、調整距離後仍讀不到二維碼。",steps,questions,takeaways:["The QR code won’t scan."],completionTitle:"你能說清二維碼讀取失敗，並要求另一種登入或付款方法。"};
