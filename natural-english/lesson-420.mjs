import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-420-v2-audio","audio","聽到這句，你手上的會員折扣和優惠券會怎樣？",["只能選其中一項在這筆交易使用。", "兩項折扣會自動加在一起。", "優惠券一定已過期。", "兩項優惠都可留待下次但不能用。"],"只能選其中一項在這筆交易使用。","can’t be combined 指不能同時疊加；不表示兩個優惠本身無效。"),
  mc("native-420-v2-repair","repair","優惠券有效，但店員說不能與會員折扣同用。哪句比 The coupon has expired 更準？",["The offers can’t be combined.", "The coupon doesn’t apply to this item.", "The coupon was used yesterday.", "The member discount has expired."],"The offers can’t be combined.","券仍有效，只是兩個優惠不能疊加；expired 會表示日期已過。"),
  mc("native-420-v2-transfer","transfer","書店說學生價與滿額減價不能同時使用。哪句自然？",["The student discount and the coupon can’t be combined.", "Both discounts will stack automatically.", "The coupon applies only to food.", "The student card is out of date."],"The student discount and the coupon can’t be combined.","兩種折扣各自有效，但不能在同一筆購物上合併。"),
  mc("native-420-v2-explain","explain","兩個優惠都有效但不能 combined。店員最有幫助的下一句是甚麼？",["I can tell you which one saves you more.", "Both will apply if I scan them quickly.", "You must throw away both offers.", "The coupon will expire because you asked."],"I can tell you which one saves you more.","既然只能用一項，協助比較節省金額比重複掃描更有幫助。"),
  {id:"native-420-v2-final",type:'open',style:"final",prompt:"新的情境：戲院學生價和買一送一優惠都有效，但規定不能同時使用。顧客問能否兩個一起用。寫一兩句禮貌英文說明規則，並提出可幫他比較哪個較划算。",answers:["I’m sorry, but the two offers can’t be combined. I can help you see which saves more.", "The student price and buy-one-get-one offer can’t be used together. Shall we compare them?", "You can use either offer, but they can’t be combined. I’d be happy to work out the better deal."],explanation:"說明兩個優惠各自有效但不能疊加，再提供比較方案，讓顧客能作決定。"}
];

const steps=[
  {"id": "native-420-v2-audio", "style": "audio", "label": "先聽規則", "title": "兩個優惠能一起用？", "intro": "先聽句子，再判斷結帳方式。", "model": "The offers can’t be combined.", "zh": "優惠不能合併使用。", "audioOnly": true, "questions": ["native-420-v2-audio"]},
  {"id": "native-420-v2-repair", "style": "repair", "label": "修正原因", "title": "不是已過期", "intro": "由規則選解釋。", "questions": ["native-420-v2-repair"]},
  {"id": "native-420-v2-transfer", "style": "transfer", "label": "換優惠組合", "title": "滿額減與學生價", "intro": "把同一限制轉到新組合。", "questions": ["native-420-v2-transfer"]},
  {"id": "native-420-v2-explain", "style": "explain", "label": "決定下一步", "title": "選較划算的一項", "intro": "理解限制後再選擇。", "questions": ["native-420-v2-explain"]},
  {"id": "native-420-v2-speak", "style": "speak", "label": "口頭告知", "title": "兩種折扣不能疊", "intro": "先說出不能合併使用的規則，再聽示範。", "model": "The offers can’t be combined.", "zh": "兩個優惠不能一起用。", "speakingPrompt": "客人想同時用會員折扣和券；口頭說「兩個優惠不能合併使用」。", "recording": "phrase", "questions": []},
  {"id": "native-420-v2-final", "style": "final", "label": "新戲院自評", "title": "學生價與買一送一", "intro": "自己寫限制和選擇，再看示例。", "questions": ["native-420-v2-final"]}
];

export default {revision:2,summary:"用 The offers can’t be combined. 說明兩個優惠不能同時套用於同一筆交易。",steps,questions,takeaways:["The offers can’t be combined.", "This coupon cannot be combined with other offers."],completionTitle:"你能分清優惠不能疊加與券已過期，並協助選較適合的一個。"};
