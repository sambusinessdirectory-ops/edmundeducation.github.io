import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-241-v2-audio","audio","聽到這句，最可能看見甚麼？",["每走幾步，腳後跟從鞋口滑出。", "腳趾被鞋頭夾住。", "鞋底磨得很薄。", "腳跟被割傷。"],"每走幾步，腳後跟從鞋口滑出。","slipping out 指腳跟反覆離開鞋內，不等於腳跟疼痛。"),
  mc("native-241-v2-reverse","reverse","鞋前面合適，但每走一步腳後跟都從鞋裏滑出。哪句最準確？",["My heels keep slipping out.", "The shoes pinch my toes.", "The soles are worn out.", "My heel hurts."],"My heels keep slipping out.","問題在後跟鬆、會滑出；其他句子說前端夾腳或疼痛。"),
  mc("native-241-v2-scene","scene","店員聽你說 My heels keep slipping out. 最合理建議甚麼？",["Let’s try a half size smaller.", "Let’s try a wider toe box only.", "Let’s try a pair with a thicker sole.", "Let’s try a larger size."],"Let’s try a half size smaller.","後跟反覆滑出表示鞋後部可能太鬆，試小半碼是合理下一步。"),
  mc("native-241-v2-explain","explain","My heels keep slipping out 和 My heel hurts 的主要分別是甚麼？",["前者說腳跟滑出鞋，後者說腳跟痛。", "前者說腳趾痛，後者說鞋帶鬆。", "兩者都只說鞋底磨損。", "兩者都只說鞋子吱吱叫。"],"前者說腳跟滑出鞋，後者說腳跟痛。","heel 可指腳後跟，但 slipping out 是位置移動，hurts 是疼痛感。"),
  {id:"native-241-v2-final",type:'open',style:"final",prompt:"新的情境：你試穿一雙婚禮皮鞋，鞋前端合適，但走路時兩隻腳後跟一直滑出。寫一兩句英文告訴店員，請他拿小半碼試試。",answers:["The front feels fine, but my heels keep slipping out. Could I try a half size smaller?", "My heels slip out when I walk in these. Can I try a smaller pair?", "These shoes are loose at the back; my heels keep slipping out. Do you have a half size down?"],explanation:"指出 front 合適但 heels slipping out，再請求小半碼，避免店員只改鞋頭寬度。"}
];

const steps=[
  {"id": "native-241-v2-audio", "style": "audio", "label": "先聽合腳度", "title": "走路時怎樣？", "intro": "先聽句子，再判斷鞋與腳的位置。", "model": "My heels keep slipping out.", "zh": "我的腳後跟一直從鞋裏滑出。", "audioOnly": true, "questions": ["native-241-v2-audio"]},
  {"id": "native-241-v2-reverse", "style": "reverse", "label": "由試鞋感受選句", "title": "鞋後面太鬆", "intro": "把觀察轉成英文。", "questions": ["native-241-v2-reverse"]},
  {"id": "native-241-v2-scene", "style": "scene", "label": "試另一尺碼", "title": "怎樣處理？", "intro": "根據滑出的問題選下一步。", "questions": ["native-241-v2-scene"]},
  {"id": "native-241-v2-explain", "style": "explain", "label": "與 heel hurts 比較", "title": "動作還是疼痛", "intro": "分清同一部位的兩種問題。", "questions": ["native-241-v2-explain"]},
  {"id": "native-241-v2-final", "style": "final", "label": "新鞋款自寫", "title": "婚禮鞋不穩", "intro": "先寫問題和請求，再看示例。", "questions": ["native-241-v2-final"]}
];

export default {revision:2,summary:"用 My heels keep slipping out. 描述試鞋時腳後跟反覆滑出，與腳跟痛區分。",steps,questions,takeaways:["My heels keep slipping out.", "My heel hurts."],completionTitle:"你能指出鞋後跟太鬆，並要求試較小尺碼。"};
