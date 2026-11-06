import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-216-v2-audio","audio","聽到這句，你最可能看見甚麼？",["毛衣不斷掉細小纖維。", "毛衣外層褪色，但其他衣服乾淨。", "毛衣表面有絨毛球，但沒有掉纖維。", "毛衣洗後縮水，但沒有留下絨毛。"],"毛衣不斷掉細小纖維。","shedding 描述布料持續掉毛或纖維，不是扣子脫落。"),
  mc("native-216-v2-rewrite","rewrite","你的黑褲滿是白色纖維，源頭是白毛衣一直掉毛。哪句最準確指出原因？",["My white sweater is shedding.", "My black pants are shedding dark fibers.", "My white sweater has a loose thread.", "My black pants picked up lint in the wash."],"My white sweater is shedding.","shedding 指白毛衣不斷掉纖維；褲子上的 lint 是結果。"),
  mc("native-216-v2-scene","scene","哪個情況適合說 The fabric is shedding？",["毛巾每次洗完都留下許多細絨。", "浴巾洗後收縮得很短。", "毛巾洗後留下顏色，但沒有細絨。", "毛衣穿了很久後表面起毛球。"],"毛巾每次洗完都留下許多細絨。","持續掉下細絨纖維正是 fabric shedding 的現象。"),
  mc("native-216-v2-contrast","contrast","毛衣正在掉纖維，其他衣服沾滿小毛。哪句分別正確？",["The sweater is shedding; there’s lint on the other clothes.", "The sweater has lint on it; the other clothes are shedding.", "The sweater is worn out; the other clothes are wet.", "The sweater has a stain; the other clothes are clean."],"The sweater is shedding; there’s lint on the other clothes.","shedding 是來源布料的動作；lint 是掉下後黏在衣服上的纖維。"),
  {id:"native-216-v2-final",type:'open',style:"final",prompt:"新的情境：一條新毛巾洗後不停掉細絨，令深色床單沾滿毛。寫一兩句英文告訴室友發生甚麼。",answers:["This new towel is shedding. There's lint all over the dark sheets.", "The towel keeps shedding, so the dark sheets are covered in lint.", "The fabric of this towel is shedding; it left lint on our sheets."],explanation:"指出毛巾 shedding 是來源，床單上的 lint 是結果。"}
];

const steps=[
  {"id": "native-216-v2-audio", "style": "audio", "label": "先聽現象", "title": "布料怎麼了？", "intro": "先聽句子，再辨認變化。", "model": "The fabric is shedding.", "zh": "布料一直掉纖維。", "audioOnly": true, "questions": ["native-216-v2-audio"]},
  {"id": "native-216-v2-speak", "style": "speak", "label": "口頭說明", "title": "毛衣洗後掉毛", "intro": "先說出布料掉纖維的現象，再聽示範。", "model": "The fabric is shedding.", "zh": "布料一直掉纖維。", "speakingPrompt": "新毛衣洗後不停掉毛；口頭說「布料在掉纖維」。", "recording": "phrase", "questions": []},
  {"id": "native-216-v2-rewrite", "style": "rewrite", "label": "精確改寫", "title": "不是所有衣服都壞", "intro": "指出來源和結果。", "questions": ["native-216-v2-rewrite"]},
  {"id": "native-216-v2-scene", "style": "scene", "label": "選場景", "title": "何時是 shedding？", "intro": "比較衣物不同問題。", "questions": ["native-216-v2-scene"]},
  {"id": "native-216-v2-contrast", "style": "contrast", "label": "源頭和殘留", "title": "shedding 與 lint", "intro": "比較正在掉毛和掉下的毛。", "questions": ["native-216-v2-contrast"]},
  {"id": "native-216-v2-final", "style": "final", "label": "新洗衣自寫", "title": "告訴室友原因", "intro": "自己寫來源和結果，再對照示例。", "questions": ["native-216-v2-final"]}
];

export default {revision:2,summary:"用 shedding 描述毛衣洗後持續掉纖維，並分清衣服上看見的 lint。",steps,questions,takeaways:["The fabric is shedding.", "There’s lint all over my clothes."],completionTitle:"你能說明掉毛來源及衣服上留下的纖維。"};
