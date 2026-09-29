import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-226-v2-audio","audio","店員指着餐盤問是否吃完，客人說這句。店員應怎樣做？",["暫時留下餐盤。", "立即把餐盤收走。", "問客人是否需要打包剩餘食物。", "把餐盤移到桌邊等客人離開。"],"暫時留下餐盤。","still working on it 在餐桌情境表示還在吃；餐盤不應現在收走。"),
  mc("native-226-v2-rewrite","rewrite","店員問 Are you finished with this? 你還有半份意粉。哪句自然？",["Not yet, I’m still working on it.", "Yes, I’m done.", "Please bring the bill now.", "Could you box this up for me?"],"Not yet, I’m still working on it.","這裏的 it 指盤中的食物，working on it 是仍在吃。"),
  mc("native-226-v2-tone","tone","店員以為你吃完，哪句最禮貌地阻止他收盤？",["I’m still working on it, thanks.", "Please wait until I tell you I’m done.", "Yes, I’m finished; you can take it now.", "Yes, you can clear it, thank you."],"I’m still working on it, thanks.","清楚表明仍在吃，再加 thanks，語氣得體。"),
  mc("native-226-v2-scene","scene","哪個客人最適合說 I’m still working on it？",["主菜仍在盤中，還想繼續吃。", "餐盤已空，準備離開。", "餐盤已空，想請店員收走。", "剩餘食物已打包，不打算再吃。"],"主菜仍在盤中，還想繼續吃。","餐盤裏仍有主菜且客人打算繼續吃，這句便能阻止店員過早收走餐盤。"),
  {id:"native-226-v2-final",type:'open',style:"final",prompt:"新的情境：吃晚餐時你暫時停下說話，店員以為你吃完沙律，問能否收走。寫一句禮貌英文告訴他你還在吃。",answers:["Not yet, I’m still working on it, thanks.", "I’m still working on the salad. Could you leave it for now?", "Thanks, but I’m still eating it."],explanation:"still working on it 在餐廳指仍在吃；可加 Not yet 和 thanks 使回應清楚有禮。"}
];

const steps=[
  {"id": "native-226-v2-audio", "style": "audio", "label": "先聽回答", "title": "可以收盤嗎？", "intro": "先聽句子，再判斷客人的意思。", "model": "I’m still working on it.", "zh": "我還在吃。", "audioOnly": true, "questions": ["native-226-v2-audio"]},
  {"id": "native-226-v2-rewrite", "style": "rewrite", "label": "換句說法", "title": "不是工作未完成", "intro": "由餐桌語境理解。", "questions": ["native-226-v2-rewrite"]},
  {"id": "native-226-v2-tone", "style": "tone", "label": "禮貌回答", "title": "店員伸手收碟", "intro": "比較語氣。", "questions": ["native-226-v2-tone"]},
  {"id": "native-226-v2-scene", "style": "scene", "label": "選用語情境", "title": "哪時是 working on it？", "intro": "由餐盤狀態選句。", "questions": ["native-226-v2-scene"]},
  {"id": "native-226-v2-speak", "style": "speak", "label": "口頭回答", "title": "先別收我的碟", "intro": "先說出還在吃的回答，再聽示範。", "model": "I’m still working on it.", "zh": "我還在吃。", "speakingPrompt": "店員問你是否吃完；口頭說「我還在吃」。", "recording": "phrase", "questions": []},
  {"id": "native-226-v2-final", "style": "final", "label": "新餐館自寫", "title": "晚餐還未結束", "intro": "自己寫回應，再按示例自評。", "questions": ["native-226-v2-final"]}
];

export default {revision:2,summary:"在餐廳用 I’m still working on it. 表示仍在吃，請店員先別收盤。",steps,questions,takeaways:["I’m still working on it.", "I’m done."],completionTitle:"你能禮貌告知店員自己仍在吃，避免餐盤被提早收走。"};
