import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-187-v2-audio","audio","聽到這句後，你對帳單知道了甚麼？",["小費已計入帳單。", "服務費尚未計入帳單。", "帳單只包含餐費，不包含小費。", "店方只接受現金小費。"],"小費已計入帳單。","included 表示已包含；gratuity 在這個餐廳情境是小費。"),
  mc("native-187-v2-transfer","transfer","帳單寫 Service charge is included. 這代表甚麼？",["服務費已計在帳單中。", "服務費會在付款後另行加上。", "帳單只列餐費，未列服務費。", "服務費只適用於下一次用餐。"],"服務費已計在帳單中。","included 仍表示包含；這次包含的是 service charge。"),
  mc("native-187-v2-repair","repair","朋友看到 Gratuity is included. 卻說「帳單未加小費，必須再付同額」。應怎樣修正？",["小費已包含；是否另給由你決定。", "小費已列出，但還要按同額另付一次。", "小費尚未包含，應問清計算方式。", "included 表示小費只是建議金額，未加進總數。"],"小費已包含；是否另給由你決定。","這句只說明小費已計入，不表示一定要額外再付一次。"),
  {id:"native-187-v2-final",type:'open',style:"final",prompt:"新的情境：六人聚餐結帳，帳單列出 18% 的項目，你想知道那是不是已包含的小費。寫一句禮貌英文問店員。",answers:["Is gratuity already included in the bill?", "Excuse me, is the 18% gratuity included?", "Does this bill already include the gratuity?"],explanation:"用 is gratuity included 詢問小費是否已計入；點明帳單或 18% 可免誤會。"}
];

const steps=[
  {"id": "native-187-v2-audio", "style": "audio", "label": "先聽帳單資訊", "title": "是否已經加上？", "intro": "先聽一句說明，再判斷付款情況。", "model": "Gratuity is included.", "zh": "小費已包括在內。", "audioOnly": true, "questions": ["native-187-v2-audio"]},
  {"id": "native-187-v2-transfer", "style": "transfer", "label": "轉到服務費", "title": "另一種帳單用語", "intro": "把 included 用於另一個帳單項目。", "questions": ["native-187-v2-transfer"]},
  {"id": "native-187-v2-speak", "style": "speak", "label": "口頭確認", "title": "向店員問清楚", "intro": "先自己口說；錄音或跳過後再聽示範。", "model": "Gratuity is included.", "zh": "小費已包括在內。", "speakingPrompt": "結帳時不確定帳單是否已加小費，口頭向店員確認。", "recording": "phrase", "questions": []},
  {"id": "native-187-v2-repair", "style": "repair", "label": "修正誤讀", "title": "別把 included 看漏", "intro": "判斷收費是否重複。", "questions": ["native-187-v2-repair"]},
  {"id": "native-187-v2-final", "style": "final", "label": "結帳自寫", "title": "新帳單上的疑問", "intro": "自己寫問句，再按例子自評。", "questions": ["native-187-v2-final"]}
];

export default {revision:2,summary:"聽懂 gratuity is included 代表帳單已加小費，並能在新帳單情境禮貌確認。",steps,questions,takeaways:["Gratuity is included.", "Service charge is included."],completionTitle:"你能辨認帳單是否已包含小費，並清楚向店員確認。"};
