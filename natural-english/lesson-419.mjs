import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-419-v2-audio","audio","聽到這句，同一位顧客最多可用優惠幾次？",["一次。", "每件商品一次。", "同一天無限次。", "每次結帳一次，可重複結帳。"],"一次。","one per customer 的單位是顧客，不是商品或交易次數。"),
  mc("native-419-v2-repair","repair","同一人想分兩次付款各用一次優惠，店員說 one per customer。哪個解釋正確？",["即使分兩張單，這位客人也只能用一次。", "每張收據都可重新用一次。", "每件商品都可獨立用一次。", "每隔一小時又能再用一次。"],"即使分兩張單，這位客人也只能用一次。","限制跟着 customer，而不是 receipt 或付款時間。"),
  mc("native-419-v2-detail","detail","海報寫 This offer is limited to one per customer. 哪個字決定計算對象？",["customer", "offer", "limited", "one"],"customer","per customer 決定按每位顧客計算；one 才是可用的數量。"),
  mc("native-419-v2-explain","explain","你和朋友各自購物，優惠 one per customer。若每人都符合條件，可怎樣使用？",["你一次，朋友一次。", "只有你一次，朋友不能用。", "你可分兩張單用兩次。", "同一人可替全店每人用一次。"],"你一次，朋友一次。","限制逐位顧客計算；兩位不同顧客可各自用一次，符合條件即可。"),
  {id:"native-419-v2-final",type:'open',style:"final",prompt:"新的情境：咖啡店推出免費加大一次的優惠。客人已在第一杯使用，現在想第二杯再用。寫一兩句禮貌英文向他解釋每位客人只可用一次。",answers:["I’m sorry, but the offer is limited to one per customer, and you’ve already used it.", "This free size upgrade is limited to one per customer. You used it on your first drink.", "I’m afraid it’s one per customer, so we can’t apply it to a second cup."],explanation:"清楚說 one per customer 的限制，再指出客人第一杯已用過；語氣保持禮貌。"}
];

const steps=[
  {"id": "native-419-v2-audio", "style": "audio", "label": "先聽限制", "title": "可以用幾次？", "intro": "先聽句子，再判斷每位客人的額度。", "model": "It’s limited to one per customer.", "zh": "每位顧客限用一次。", "audioOnly": true, "questions": ["native-419-v2-audio"]},
  {"id": "native-419-v2-repair", "style": "repair", "label": "修正誤解", "title": "兩張單也算同一人", "intro": "根據限制範圍判斷。", "questions": ["native-419-v2-repair"]},
  {"id": "native-419-v2-detail", "style": "detail", "label": "讀懂店告", "title": "不是每件商品限一", "intro": "看限制條件中的關鍵單位。", "questions": ["native-419-v2-detail"]},
  {"id": "native-419-v2-explain", "style": "explain", "label": "具體計算", "title": "朋友不能替你重用", "intro": "把規則放進兩人購物。", "questions": ["native-419-v2-explain"]},
  {"id": "native-419-v2-speak", "style": "speak", "label": "口頭說明", "title": "向客人解釋", "intro": "先說出每人一次的規則，再聽示範。", "model": "It’s limited to one per customer.", "zh": "每位顧客限用一次。", "speakingPrompt": "客人問可否今天重複享用同一優惠；口頭說「每人限一次」。", "recording": "phrase", "questions": []},
  {"id": "native-419-v2-final", "style": "final", "label": "新咖啡店自評", "title": "第二杯優惠", "intro": "自己寫限制和友善回應，再看示例。", "questions": ["native-419-v2-final"]}
];

export default {revision:2,summary:"用 limited to one per customer 表示優惠每位客人只可用一次。",steps,questions,takeaways:["It’s limited to one per customer.", "This offer is limited to one per customer."],completionTitle:"你能理解每人一次的限制，並向客人清楚解釋適用範圍。"};
