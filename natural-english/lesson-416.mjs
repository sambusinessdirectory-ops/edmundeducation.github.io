import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-416-v2-audio","audio","聽到這句，說話者最可能經歷甚麼？",["走過出口時警報因他而響起。", "他關掉了已響的警報。", "他測試店內的火警鐘。", "警報安靜地保持關閉。"],"走過出口時警報因他而響起。","set off an alarm 指觸發警報，主語 I 說明是自己經過時引起。"),
  mc("native-416-v2-explain","explain","I set off the alarm. 中的 set off 指甚麼？",["使警報開始響。", "把警報聲調小。", "把警報裝在出口。", "請職員關閉警報。"],"使警報開始響。","set off 是使裝置啟動或響起；不等於 turn off 關閉。"),
  mc("native-416-v2-branch","branch","你買完東西，出口警報響；職員問可否查看商品。哪句較合適？",["Of course. I have the receipt; perhaps a tag was left on.", "No, the alarm must be broken, so I’m leaving immediately.", "Yes, but please throw away the receipt first.", "I’ll go through the alarm again without checking anything."],"Of course. I have the receipt; perhaps a tag was left on.","提供收據並提出防盜扣可能未拆，是配合職員查核的具體做法。"),
  mc("native-416-v2-tone","tone","警報突然響起，你懷疑商品防盜扣未拆。哪句向職員說較得體？",["I think I set off the alarm. Could we check whether a tag is still on this?", "You forgot the tag, so this is entirely your fault.", "The alarm rang; I’m taking an extra item as compensation.", "I didn’t hear anything, so you must be mistaken."],"I think I set off the alarm. Could we check whether a tag is still on this?","I think 和 could we check 避免在未確認前指責，並提出可查的防盜扣。"),
  mc("native-416-v2-scene","scene","哪個情況最適合說 I set off the security alarm？",["已付款的外套仍有防盜扣，經過出口感應門時響鐘。", "店裏有消防演習，警報在你到達前已響。", "收銀台的電話鈴響了。", "你按了停車場的尋車喇叭。"],"已付款的外套仍有防盜扣，經過出口感應門時響鐘。","防盜扣和出口感應門正是 security alarm 被觸發的情境。"),
  {id:"native-416-v2-final",type:'open',style:"final",prompt:"新的情境：你在書店付了款，走出門時防盜警報響；書上的安全貼紙可能還在。寫一兩句英文向職員說明，並願意出示收據。",answers:["I think I set off the security alarm. I paid for the book and can show you the receipt.", "The alarm went off when I walked out. Could we check whether the security sticker is still on the book?", "I may have set off the alarm because the tag is still attached. Here’s my receipt."],explanation:"說明警報在自己經過時響、已付款，並配合檢查未拆的防盜貼。"}
];

const steps=[
  {"id": "native-416-v2-audio", "style": "audio", "label": "先聽出口", "title": "警報怎樣響了？", "intro": "先聽句子，再判斷主語和動作。", "model": "I set off the security alarm.", "zh": "我觸發了防盜警報。", "audioOnly": true, "questions": ["native-416-v2-audio"]},
  {"id": "native-416-v2-explain", "style": "explain", "label": "理解動詞", "title": "set off 是觸發", "intro": "分辨觸發與關閉。", "questions": ["native-416-v2-explain"]},
  {"id": "native-416-v2-branch", "style": "branch", "label": "出口下一步", "title": "職員來查核", "intro": "選合作處理方法。", "questions": ["native-416-v2-branch"]},
  {"id": "native-416-v2-tone", "style": "tone", "label": "解釋語氣", "title": "不先指責店員", "intro": "在原因未明時保持審慎。", "questions": ["native-416-v2-tone"]},
  {"id": "native-416-v2-scene", "style": "scene", "label": "選觸發場景", "title": "正常付款仍可響", "intro": "由商品和出口判斷。", "questions": ["native-416-v2-scene"]},
  {"id": "native-416-v2-final", "style": "final", "label": "新商店自評", "title": "書店出口的警報", "intro": "自己寫經過和處理，再按示例自評。", "questions": ["native-416-v2-final"]}
];

export default {revision:2,summary:"用 I set off the security alarm. 描述自己經過商店出口時觸發防盜警報。",steps,questions,takeaways:["I set off the security alarm.", "I set off the alarm."],completionTitle:"你能說清警報響起的經過，並合作查找未拆防盜扣。"};
