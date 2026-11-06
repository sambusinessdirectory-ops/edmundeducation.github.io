import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-422-v2-audio","audio","店員說這句，哪個資訊最關鍵？",["優惠券的有效日期已過。", "商品不在優惠範圍內。", "優惠券尚未開始生效。", "收銀系統暫時離線。"],"優惠券的有效日期已過。","has expired 說的是有效期已結束，與指定商品是否合資格是兩回事。"),
  mc("native-422-v2-reverse","reverse","你信用卡下個月才到期。哪句表達時間最準確？",["My credit card expires next month.", "My credit card has expired next month.", "My credit card expired yesterday.", "My credit card doesn’t apply next month."],"My credit card expires next month.","未來的到期時間用 expires next month；has expired 表示現在已經失效。"),
  mc("native-422-v2-continue","continue","店員指出你的優惠券上星期已過期。哪句最自然地繼續交易？",["I see. Are there any current discounts on this item?", "Then please apply the expired coupon anyway.", "That means this item is out of stock, right?", "I’ll change the printed date myself at the counter."],"I see. Are there any current discounts on this item?","先接受日期限制，再詢問現行折扣，是禮貌而可行的下一步。"),
  mc("native-422-v2-tone","tone","你以為優惠券今天才到期；店員說已過期。哪句較得體？",["Could we check the expiry date together? I thought it was valid through today.", "You’re wrong; ring it up before I complain.", "The date doesn’t matter if I really want the discount.", "I’ll keep quiet and hand you the same coupon again."],"Could we check the expiry date together? I thought it was valid through today.","提出一起核對日期，既表達疑問，也避免在未確認前指責店員。"),
  {id:"native-422-v2-final",type:'open',style:"final",prompt:"新情境：咖啡券昨天到期，今天店員不能接受；你仍想買咖啡。寫一兩句英文說明原因，並問有沒有其他當日優惠。",answers:["The coupon has expired. Are there any other offers today?", "My coffee coupon expired yesterday. Do you have a current promotion?", "I see that this coupon has expired. Is there another discount I could use?"],explanation:"說明已過有效日期，再詢問目前可用的優惠；不要說成商品不適用。"}
];

const steps=[
  {"id": "native-422-v2-audio", "style": "audio", "label": "先聽日期", "title": "券還有效嗎？", "intro": "先聽句子，再判斷時間。", "model": "The coupon has expired.", "zh": "這張優惠券已經過期。", "audioOnly": true, "questions": ["native-422-v2-audio"]},
  {"id": "native-422-v2-reverse", "style": "reverse", "label": "用詞對照", "title": "還沒到期的信用卡", "intro": "比較 has expired 與 expires。", "questions": ["native-422-v2-reverse"]},
  {"id": "native-422-v2-continue", "style": "continue", "label": "接續結帳", "title": "查問現行優惠", "intro": "優惠券不能用後作出可行回應。", "questions": ["native-422-v2-continue"]},
  {"id": "native-422-v2-tone", "style": "tone", "label": "得體回應", "title": "對日期有疑問", "intro": "在未核對前保持客氣。", "questions": ["native-422-v2-tone"]},
  {"id": "native-422-v2-speak", "style": "speak", "label": "口頭通知", "title": "告訴同行朋友", "intro": "在「告訴同行朋友」情境先開口，然後聽錄音核對。", "model": "The coupon has expired.", "zh": "這張優惠券已經過期。", "speakingPrompt": "你看見優惠券上週就到期；向同行朋友口說「這張優惠券已經過期」。", "recording": "phrase", "questions": []},
  {"id": "native-422-v2-final", "style": "final", "label": "新優惠自評", "title": "咖啡券日期", "intro": "自己寫事實和下一步。", "questions": ["native-422-v2-final"]}
];

export default {revision:2,summary:"用 The coupon has expired. 說明優惠券已超過有效日期，並分清商品限制。",steps,questions,takeaways:["The coupon has expired.", "My credit card expires next month."],completionTitle:"你能辨認已到期的優惠券，並禮貌查詢現有折扣。"};
