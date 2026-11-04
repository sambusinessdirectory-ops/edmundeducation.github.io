import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-545-v2-audio","audio","保鮮膜的問題是甚麼？",["拉開時它反覆黏回自身。", "它完全不黏在碗邊。", "它已經被刀切成小片。", "它黏在桌上的膠帶卷上。"],"拉開時它反覆黏回自身。","itself 回指 plastic wrap；keeps clinging 表示反覆自黏，不是單純黏不到碗。"),
  mc("native-545-v2-scene","scene","哪個場景最適合說這句？",["保鮮膜剛拉出就皺成一團，兩層互相黏住。", "保鮮膜平整覆在碗上，邊緣密合。", "保鮮膜包好食物後，盒蓋合不上。", "保鮮膜仍在盒內，尚未拉出。"],"保鮮膜剛拉出就皺成一團，兩層互相黏住。","反覆黏回自身的兩層保鮮膜，正是 clinging to itself 的具體畫面。"),
  mc("native-545-v2-tone","tone","你要蓋住一盤剩菜，保鮮膜一直自黏。哪句向室友說較自然？",["This wrap keeps clinging to itself. Could you hold one corner?", "You ruined the wrap even though you haven't touched it.", "The wrap is working perfectly, so please take it away.", "I don't need help, but hold every corner at once."],"This wrap keeps clinging to itself. Could you hold one corner?","先說明自黏的問題，再請對方固定一角，請求具體而不責怪。"),
  {id:"native-545-v2-final",type:'open',style:"final",prompt:"新情境：你要用保鮮膜包三明治，膜一拉出就反覆黏成團；朋友在旁邊。寫一兩句英文描述問題，並請他幫忙拉住另一端。",answers:["The plastic wrap keeps clinging to itself. Could you hold the other end?", "This wrap keeps sticking to itself. Can you pull the far edge while I hold this one?", "I can't spread the wrap because it keeps clinging to itself. Could you help me hold it flat?"],explanation:"說出反覆自黏的問題，再請對方固定另一端或協助攤平。"}
];

const steps=[
  {"id": "native-545-v2-audio", "style": "audio", "label": "先聽材料", "title": "黏到哪裏？", "intro": "先聽，再判斷 itself 指向甚麼。", "model": "The plastic wrap keeps clinging to itself.", "zh": "保鮮膜一直黏在自己身上。", "audioOnly": true, "questions": ["native-545-v2-audio"]},
  {"id": "native-545-v2-scene", "style": "scene", "label": "觀察動作", "title": "兩層捲在一起", "intro": "比較相近的廚房困難。", "questions": ["native-545-v2-scene"]},
  {"id": "native-545-v2-tone", "style": "tone", "label": "請人協助", "title": "另一端要有人拉", "intro": "把煩惱化成簡單請求。", "questions": ["native-545-v2-tone"]},
  {"id": "native-545-v2-speak", "style": "speak", "label": "口頭描述", "title": "向室友說明", "intro": "想像膜剛拉開又黏回去，先說再核對錄音。", "model": "The plastic wrap keeps clinging to itself.", "zh": "保鮮膜一直黏在自己身上。", "speakingPrompt": "保鮮膜一拉開就黏成一團；向室友口說「保鮮膜一直黏在自己身上」。", "recording": "phrase", "questions": []},
  {"id": "native-545-v2-final", "style": "final", "label": "新廚房自評", "title": "包三明治", "intro": "獨立寫困難和請求，檢查是否都清楚。", "questions": ["native-545-v2-final"]}
];

export default {revision:2,summary:"用 The plastic wrap keeps clinging to itself. 描述保鮮膜拉出時反覆黏回自身，難以平鋪。",steps,questions,takeaways:["The plastic wrap keeps clinging to itself.", "It keeps clinging to itself."],completionTitle:"你能描述保鮮膜反覆自黏的狀況，並提出處理方法。"};
