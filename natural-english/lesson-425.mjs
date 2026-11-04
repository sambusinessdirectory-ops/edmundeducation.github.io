import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-425-v2-audio","audio","這句通常暗示甚麼？",["污漬已滲入並較難清除。", "污漬剛沾上，尚未乾。", "衣服已經完全洗乾淨。", "污漬只是暫時被水浸濕。"],"污漬已滲入並較難清除。","stain has set 表示污漬停留後定色或滲入纖維，清洗可能更困難。"),
  mc("native-425-v2-contrast","contrast","果汁剛滴在桌布上，尚未乾。哪句較準確？",["The stain is still fresh.", "The stain has set.", "The stain is permanently gone.", "The cloth has already faded."],"The stain is still fresh.","剛滴上的污漬仍 fresh；放久乾固後才較適合說 has set。"),
  mc("native-425-v2-explain","explain","The stain has set. 裏面的 set 指哪種變化？",["污漬固定在布料裏，變難洗。", "有人刻意把污漬放在桌上。", "污漬被陽光照得完全消失。", "衣服已被整齊擺放。"],"污漬固定在布料裏，變難洗。","這裏的 set 說的是污漬已經固定、滲入，不是日常的放置動作。"),
  mc("native-425-v2-rewrite","rewrite","朋友說 This shirt is dirty，卻補充咖啡漬留了兩天，普通清洗仍洗不掉。哪句更精確？",["The coffee stain has set.", "The coffee stain is still fresh.", "The shirt has no stain now.", "The shirt has been ironed."],"The coffee stain has set.","留了兩天又難洗，重點是咖啡漬已定色；dirty 未說明這個變化。"),
  {id:"native-425-v2-transfer",type:'open',style:"transfer",prompt:"新情境：紅酒灑在白桌布上後放了三天，普通洗衣液洗不掉。寫一兩句英文說明污漬狀態，並提出下一步處理。",answers:["The wine stain has set. We may need a stain remover.", "The stain has set after three days, so I’ll try a treatment for old stains.", "The wine stain has set into the tablecloth. Let’s pre-treat it before washing again."],explanation:"用 has set 描述久留的污漬，再提出去漬劑或預處理，不把它說成 fresh。"}
];

const steps=[
  {"id": "native-425-v2-audio", "style": "audio", "label": "先聽狀態", "title": "還容易洗嗎？", "intro": "先聽句子，再推斷污漬狀態。", "model": "The stain has set.", "zh": "污漬已經乾固滲入了。", "audioOnly": true, "questions": ["native-425-v2-audio"]},
  {"id": "native-425-v2-contrast", "style": "contrast", "label": "比較時機", "title": "現在處理還是過夜？", "intro": "比較兩種污漬的說法。", "questions": ["native-425-v2-contrast"]},
  {"id": "native-425-v2-explain", "style": "explain", "label": "理解 set", "title": "不是把污漬放好", "intro": "判斷 set 在此的意思。", "questions": ["native-425-v2-explain"]},
  {"id": "native-425-v2-rewrite", "style": "rewrite", "label": "精確改寫", "title": "避免只說 dirty", "intro": "將模糊描述變具體。", "questions": ["native-425-v2-rewrite"]},
  {"id": "native-425-v2-speak", "style": "speak", "label": "口頭說明", "title": "洗衣前提醒", "intro": "先說完整句，再聽示範。", "model": "The stain has set.", "zh": "污漬已經乾固滲入了。", "speakingPrompt": "你發現舊污漬已經很難洗；向家人口說「污漬已經乾固了」。", "recording": "phrase", "questions": []},
  {"id": "native-425-v2-transfer", "style": "transfer", "label": "新布料自評", "title": "桌布上的紅酒漬", "intro": "自己寫狀態和可行下一步。", "questions": ["native-425-v2-transfer"]}
];

export default {revision:2,summary:"用 The stain has set. 表示污漬乾固滲入布料，並與仍新鮮的污漬對比。",steps,questions,takeaways:["The stain has set.", "The stain is still fresh."],completionTitle:"你能根據污漬停留時間判斷是否已定色，並提出處理方法。"};
