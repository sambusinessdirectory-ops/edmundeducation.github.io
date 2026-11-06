import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-203-v2-audio","audio","廚師指着醬汁說這句，最可能是哪個問題？",["醬汁太稀。", "醬汁太鹹。", "醬汁太燙。", "醬汁太辣。"],"醬汁太稀。","watery 形容水分多、質地稀，不直接表示鹹度或辣度。"),
  mc("native-203-v2-transfer","transfer","奶油湯本應濃稠，現在像加太多水。哪句可用？",["The soup is watery.", "The soup is too salty.", "The soup is too cold.", "The soup is too thick."],"The soup is watery.","watery 可描述湯或醬汁偏稀；奶油湯本應有些濃度；像加多水般稀薄時，也可說 watery。"),
  mc("native-203-v2-repair","repair","朋友說這咖喱醬「too dry」，但它其實像水一樣流。應改成甚麼？",["It’s too watery.", "It’s too salty.", "It’s too oily.", "It’s too thick."],"It’s too watery.","流動、稀薄的醬汁是 watery；dry 指乾。"),
  {id:"native-203-v2-final",type:'open',style:"final",prompt:"新的情境：你煮的意粉醬加了太多水，現在不能好好裹住麵。寫一兩句英文向同伴說明問題和你要怎樣改善。",answers:["The sauce is watery. I'll cook it a little longer to thicken it.", "It’s too watery to coat the pasta, so I’ll let it reduce.", "I added too much water. The sauce is watery, so I need to thicken it."],explanation:"watery 說明醬汁太稀；可再說要煮濃或收汁。"}
];

const steps=[
  {"id": "native-203-v2-audio", "style": "audio", "label": "聽出質地", "title": "醬汁濃不濃？", "intro": "先聽英文再判斷。", "model": "It’s watery.", "zh": "它太稀、太水。", "audioOnly": true, "questions": ["native-203-v2-audio"]},
  {"id": "native-203-v2-transfer", "style": "transfer", "label": "換到湯品", "title": "另一種稀的液體", "intro": "把形容詞用於另一菜式。", "questions": ["native-203-v2-transfer"]},
  {"id": "native-203-v2-repair", "style": "repair", "label": "修正評價", "title": "太稀不是太乾", "intro": "找符合質地的詞。", "questions": ["native-203-v2-repair"]},
  {"id": "native-203-v2-speak", "style": "speak", "label": "口頭評價", "title": "告訴廚師感覺", "intro": "先試着說出「它太稀。」，再聽示範。", "model": "It’s watery.", "zh": "它太稀。", "speakingPrompt": "試了一口醬汁，覺得太稀；口頭向一起煮飯的朋友說。", "recording": "phrase", "questions": []},
  {"id": "native-203-v2-final", "style": "final", "label": "新菜式自寫", "title": "意粉醬需收濃", "intro": "自己寫一兩句，再對照示例。", "questions": ["native-203-v2-final"]}
];

export default {revision:2,summary:"用 watery 描述醬汁太稀、像水多而不夠濃。",steps,questions,takeaways:["It’s watery.", "The sauce is watery."],completionTitle:"你能準確評價醬汁太稀，並在新菜式中提出改善。"};
