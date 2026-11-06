import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-402-v2-audio","audio","聽到這句，收據最可能怎樣？",["仍按原價收費，沒有減價。", "折扣已經正確扣除。", "優惠券已掃描，但仍顯示原價。", "只有其中一件商品按原價計算。"],"仍按原價收費，沒有減價。","discount didn’t come off 指折扣未從總額或單價扣除。"),
  mc("native-402-v2-branch","branch","你已確認這件商品符合九折條件，但收據仍列原價；想向店員指出折扣沒有扣除。怎樣開口最直接？",["Excuse me, I don’t think the discount came off.", "This promotion should cover the whole basket, so refund me now.", "Maybe the sale ended; I’ll pay the full price.", "Could you check whether this item is eligible for the offer?"],"Excuse me, I don’t think the discount came off.","收據仍按原價計算，先禮貌指出折扣似乎沒扣，再讓店員查核優惠是否適用。"),
  mc("native-402-v2-continue","continue","你說 The discount didn’t come off. 店員答 Let me check your receipt. 哪句能立即指出收據上的具體異常？",["Thanks. The item still shows the full price.", "Actually, I may have read the total incorrectly.", "Thanks, but the price tag may have been wrong.", "Thanks. Could you check the price tag too?"],"Thanks. The item still shows the full price.","店員願意查收據時，先致謝再指出原價那一行，能讓他快速核對。"),
  mc("native-402-v2-tone","tone","你不確定店員是否漏算會員折扣。哪句最得體？",["I don’t think the discount came off. Could we check?", "You forgot my discount; fix it immediately.", "The receipt seems wrong. Is your system broken?", "I’ll pay now and call customer service later."],"I don’t think the discount came off. Could we check?","I don’t think 保留核對空間，Could we check? 提出合作的下一步。"),
  {id:"native-402-v2-final",type:'open',style:"final",prompt:"新的情境：你在書店買書，會員應有九折，但收據仍顯示原價。寫一兩句禮貌英文向店員指出問題並請他核對。",answers:["I don’t think my member discount came off. The receipt still shows the full price.", "Excuse me, the discount didn’t come off on this book. Could you check it?", "My membership should give me 10% off, but I was charged full price. Could we take a look?"],explanation:"指出會員折扣未扣與收據原價，然後請店員核對。"}
];

const steps=[
  {"id": "native-402-v2-audio", "style": "audio", "label": "先聽帳單", "title": "優惠算了嗎？", "intro": "先聽句子，再判斷價格。", "model": "The discount didn’t come off.", "zh": "折扣沒有扣掉。", "audioOnly": true, "questions": ["native-402-v2-audio"]},
  {"id": "native-402-v2-branch", "style": "branch", "label": "收據下一步", "title": "先請店員查看", "intro": "根據發現選行動。", "questions": ["native-402-v2-branch"]},
  {"id": "native-402-v2-continue", "style": "continue", "label": "接續店員", "title": "店員願意檢查", "intro": "回應對方的協助。", "questions": ["native-402-v2-continue"]},
  {"id": "native-402-v2-speak", "style": "speak", "label": "口頭提醒", "title": "結帳時提出", "intro": "先說出折扣未扣，再聽示範。", "model": "The discount didn’t come off.", "zh": "折扣沒有扣掉。", "speakingPrompt": "收據仍是原價；口頭向店員說「折扣沒有扣掉」。", "recording": "phrase", "questions": []},
  {"id": "native-402-v2-tone", "style": "tone", "label": "禮貌核對", "title": "不先指責", "intro": "比較向店員提出問題的語氣。", "questions": ["native-402-v2-tone"]},
  {"id": "native-402-v2-final", "style": "final", "label": "新收據自寫", "title": "會員價未顯示", "intro": "自己寫證據和請求，再看示例。", "questions": ["native-402-v2-final"]}
];

export default {revision:2,summary:"用 The discount didn’t come off. 描述結帳時應有折扣未從原價扣除。",steps,questions,takeaways:["The discount didn’t come off.", "The discount didn’t get applied."],completionTitle:"你能禮貌指出收據沒有扣折扣，並請店員重新核對。"};
