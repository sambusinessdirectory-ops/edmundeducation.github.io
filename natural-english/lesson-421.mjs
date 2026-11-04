import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-421-v2-audio","audio","店員這樣說，最直接表示甚麼？",["目前這件商品不符合用券條件。", "優惠券的有效日期已經過去。", "商品已經賣完。", "顧客還沒出示優惠券。"],"目前這件商品不符合用券條件。","doesn’t apply to this item 指適用範圍不包括這件商品，未必與日期有關。"),
  mc("native-421-v2-scene","scene","哪個情況支持店員說這句，而非說優惠券已過期？",["優惠券仍在有效期，但細則寫明特價商品除外。", "優惠券適用全店商品，但昨天到期。", "商品原價出售，優惠券列明可用。", "優惠券號碼看不清，店員尚未知道條款。"],"優惠券仍在有效期，但細則寫明特價商品除外。","仍有效卻排除特價商品，問題正是 this item 不在優惠範圍。"),
  mc("native-421-v2-branch","branch","店員說優惠券不適用於這件特價外套。你仍想使用優惠券，怎樣問較有效？",["Which jackets does it apply to?", "Could you change the expiry date on the coupon?", "Then I’ll use it on this same jacket anyway.", "Can you remove the sale label without changing the price?"],"Which jackets does it apply to?","問適用哪些外套，可以直接找符合條款的商品；改日期或強行使用都沒有解決限制。"),
  {id:"native-421-v2-final",type:'open',style:"final",prompt:"新情境：你的券仍有效，但優惠只涵蓋原價鞋；你挑的是清貨鞋。用英文向朋友說明為何不能用券，再提出一個合理的購物選擇。",answers:["The coupon doesn’t apply to these clearance shoes. I’ll look at the regular-priced pairs instead.", "This coupon is valid, but it doesn’t apply to this sale item. Let’s check the full-price shoes.", "The coupon doesn’t apply to these shoes, so I’ll save it for another pair."],explanation:"要分清商品限制與過期，並提出查看合資格鞋款或留待下次使用。"}
];

const steps=[
  {"id": "native-421-v2-audio", "style": "audio", "label": "先聽限制", "title": "問題在商品還是日期？", "intro": "先聽一句，再判斷限制。", "model": "The coupon doesn’t apply to this item.", "zh": "這張優惠券不適用於這件商品。", "audioOnly": true, "questions": ["native-421-v2-audio"]},
  {"id": "native-421-v2-scene", "style": "scene", "label": "看清細則", "title": "特價商品例外", "intro": "利用收據與標籤判斷。", "questions": ["native-421-v2-scene"]},
  {"id": "native-421-v2-branch", "style": "branch", "label": "下一步問法", "title": "找可用選項", "intro": "用禮貌問句延續結帳。", "questions": ["native-421-v2-branch"]},
  {"id": "native-421-v2-speak", "style": "speak", "label": "口頭轉述", "title": "向同伴說明", "intro": "先口說完整句，再聽示範。", "model": "The coupon doesn’t apply to this item.", "zh": "這張優惠券不適用於這件商品。", "speakingPrompt": "你在收銀台得知這件外套不能用券；向同伴口說「這張優惠券不適用於這件商品」。", "recording": "phrase", "questions": []},
  {"id": "native-421-v2-final", "style": "final", "label": "新商品自評", "title": "替換購物選擇", "intro": "自行寫說明和下一步。", "questions": ["native-421-v2-final"]}
];

export default {revision:2,summary:"用 The coupon doesn’t apply to this item. 說明優惠券有指定商品限制，並分清不適用與已過期。",steps,questions,takeaways:["The coupon doesn’t apply to this item.", "The coupon has expired."],completionTitle:"你能查明優惠券限制並詢問有沒有適用商品。"};
