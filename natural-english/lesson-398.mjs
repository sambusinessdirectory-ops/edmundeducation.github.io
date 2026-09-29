import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-398-v2-audio","audio","健身者說這句，手掌最可能有甚麼？",["長期摩擦形成的硬厚皮。", "剛磨出的含液水泡。", "新流血的小傷口。", "剛碰撞後留下的瘀青。"],"長期摩擦形成的硬厚皮。","callus 是反覆摩擦後變厚的皮膚，與新起的 blister 水泡不同。"),
  mc("native-398-v2-tone","tone","朋友看到你手掌一塊硬皮，問 Does it hurt? 你平日舉重、目前不痛。哪句自然又有用？",["It’s a callus from lifting. It doesn’t hurt.", "It’s a blister from today’s lifting session.", "It’s a fresh cut from a barbell.", "It’s a bruise from hitting my hand yesterday."],"It’s a callus from lifting. It doesn’t hurt.","這句說明硬皮的成因和目前感受，回答了朋友問是否疼痛。"),
  mc("native-398-v2-transfer","transfer","結他手長時間按弦，指尖形成硬厚皮。哪句可用？",["I have a callus on my fingertip.", "I have a blister full of liquid on my fingertip.", "My fingertip is bleeding now.", "My fingertip has no skin change."],"I have a callus on my fingertip.","指尖受琴弦長期摩擦也可長 callus，位置不只手掌。"),
  {id:"native-398-v2-final",type:'open',style:"final",prompt:"新的情境：你每週搬紙箱，手掌同一位置反覆摩擦，長了一塊硬皮。寫一兩句英文向朋友說明。",answers:["I have a callus on my palm from carrying boxes every week.", "This hard patch on my palm is a callus. I get it from moving boxes.", "I’ve developed a callus on my palm because the boxes rub against it."],explanation:"callus 指逐漸形成的厚皮；說出 palm 和反覆搬箱的原因。"}
];

const steps=[
  {"id": "native-398-v2-audio", "style": "audio", "label": "先聽皮膚", "title": "手上是甚麼？", "intro": "先聽名詞，再判斷觸感。", "model": "I have a callus.", "zh": "我長了厚皮。", "audioOnly": true, "questions": ["native-398-v2-audio"]},
  {"id": "native-398-v2-tone", "style": "tone", "label": "回答關心", "title": "朋友問會痛嗎", "intro": "自然說明來源。", "questions": ["native-398-v2-tone"]},
  {"id": "native-398-v2-transfer", "style": "transfer", "label": "換活動", "title": "不只健身會有", "intro": "把詞用在另一種反覆摩擦。", "questions": ["native-398-v2-transfer"]},
  {"id": "native-398-v2-speak", "style": "speak", "label": "口頭說明", "title": "手掌的厚皮", "intro": "先說出反覆摩擦形成的厚皮，再聽示範。", "model": "I have a callus.", "zh": "我長了厚皮。", "speakingPrompt": "朋友問手掌硬硬的部分是甚麼；口頭說「我有一塊厚皮」。", "recording": "phrase", "questions": []},
  {"id": "native-398-v2-final", "style": "final", "label": "新工作自寫", "title": "搬箱子後的手", "intro": "自己寫位置和原因，再看示例。", "questions": ["native-398-v2-final"]}
];

export default {revision:2,summary:"用 callus 描述手掌反覆摩擦後形成的厚硬皮，與水泡區分。",steps,questions,takeaways:["I have a callus.", "I have a callus on my palm."],completionTitle:"你能辨認摩擦形成的厚皮，並在新活動中描述位置。"};
