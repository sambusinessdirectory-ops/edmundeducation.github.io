import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-403-v2-audio","audio","聽到這句，下一秒最可能發生甚麼？",["打噴嚏。", "流鼻血。", "牙齒痛。", "耳朵塞住。"],"打噴嚏。","鼻內 tickling 是輕微刺激的癢感，常伴隨想打噴嚏。"),
  mc("native-403-v2-transfer","transfer","你清理多塵書架後鼻子癢癢的。哪句自然？",["The dust is making my nose tickle.", "The dust is making my nose bleed.", "The dust is making my ears ring.", "The dust is making my throat burn."],"The dust is making my nose tickle.","灰塵刺激鼻內產生 tickle，這句清楚交代原因。"),
  mc("native-403-v2-rewrite","rewrite","你覺得鼻內一陣癢，還沒真正打噴嚏。哪句最準？",["My nose is tickling.", "I just sneezed three times.", "My nose is bleeding.", "My nose is completely blocked."],"My nose is tickling.","tickling 描述打噴嚏前的癢感，不等於噴嚏已發生。"),
  {id:"native-403-v2-final",type:'open',style:"final",prompt:"新的情境：你剛清理很久沒整理的書櫃，灰塵飛起，鼻子癢得快打噴嚏。寫一兩句英文告訴室友感覺和可能原因。",answers:["My nose is tickling. I think it’s the dust from the bookshelf.", "The dust is making my nose tickle, and I feel like I’m about to sneeze.", "My nose keeps tickling after I cleaned the shelf. The dust must be bothering me."],explanation:"tickling 描述鼻癢，補上灰塵和可能打噴嚏的情況。"}
];

const steps=[
  {"id": "native-403-v2-audio", "style": "audio", "label": "先聽鼻感", "title": "快要怎樣？", "intro": "先聽句子，再判斷身體反應。", "model": "My nose is tickling.", "zh": "我的鼻子裏癢癢的。", "audioOnly": true, "questions": ["native-403-v2-audio"]},
  {"id": "native-403-v2-transfer", "style": "transfer", "label": "換刺激來源", "title": "灰塵令人鼻癢", "intro": "由環境說原因。", "questions": ["native-403-v2-transfer"]},
  {"id": "native-403-v2-rewrite", "style": "rewrite", "label": "從症狀改寫", "title": "不只說想打噴嚏", "intro": "說出打噴嚏前的感覺。", "questions": ["native-403-v2-rewrite"]},
  {"id": "native-403-v2-speak", "style": "speak", "label": "口頭說明", "title": "打噴嚏前一刻", "intro": "先說出鼻內癢感，再聽示範。", "model": "My nose is tickling.", "zh": "鼻子裏癢癢的。", "speakingPrompt": "朋友見你揉鼻子；口頭說「我的鼻子裏癢癢的」。", "recording": "phrase", "questions": []},
  {"id": "native-403-v2-final", "style": "final", "label": "新房間自寫", "title": "清理書櫃後", "intro": "自己寫感覺和原因，再看示例。", "questions": ["native-403-v2-final"]}
];

export default {revision:2,summary:"用 My nose is tickling. 描述鼻內癢癢、快打噴嚏的感覺，並指出可能刺激物。",steps,questions,takeaways:["My nose is tickling.", "The dust is making my nose tickle."],completionTitle:"你能把鼻內癢感和快打噴嚏連起來，並說明可能原因。"};
