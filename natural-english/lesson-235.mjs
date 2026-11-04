import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-235-v2-audio","audio","聽到這句，穿着者最可能反覆做甚麼？",["把上衣下擺拉回原位。", "把上衣袖子捲高。", "把上衣領口整理平。", "把上衣下擺再向上拉。"],"把上衣下擺拉回原位。","riding up 指衣服隨動作往上跑，所以要反覆拉下來。"),
  mc("native-235-v2-tone","tone","店員問 T-shirt 合身嗎；你一抬手下擺就上縮。哪句得體？",["It fits, but it keeps riding up when I move.", "I like it, but the sleeves are a bit long.", "I like the color, but the fit seems too short.", "I’d rather check how it fits when I stand still."],"It fits, but it keeps riding up when I move.","先肯定尺寸，再具體說活動時下擺上移，讓店員可建議別款。"),
  mc("native-235-v2-continue","continue","朋友問 Why do you keep pulling your shirt down? 你怎樣答？",["It keeps riding up when I walk.", "The button popped off.", "The zipper is stuck.", "The fabric is shedding."],"It keeps riding up when I walk.","問題是衣服下擺走動時上移，符合朋友看到你反覆拉下來。"),
  mc("native-235-v2-branch","branch","你說 My shirt keeps riding up，並想保持下擺自然垂在褲外。店員最合理建議甚麼？",["Try a longer cut.", "Try the same shirt in a smaller size.", "Try tucking the shirt into your trousers.", "Try a different fabric with the same short cut."],"Try a longer cut.","較長的版型可能改善下擺往上縮，其他選項不處理長度問題。"),
  {id:"native-235-v2-scene",type:'open',style:"scene",prompt:"新的情境：你試穿一條短裙，走幾步下擺就向上跑，要不停往下拉。寫一兩句英文告訴店員這個問題，並要求試較長款。",answers:["My skirt keeps riding up when I walk. Could I try a longer one?", "The skirt rides up every few steps, so I’d like to try a longer style."],explanation:"ride up 可用於裙子下擺往上移；說出走路時發生和想試較長款。"}
];

const steps=[
  {"id": "native-235-v2-audio", "style": "audio", "label": "先聽衣服", "title": "為何一直拉下擺？", "intro": "先聽句子，再想像動作。", "model": "My shirt keeps riding up.", "zh": "我的上衣一直往上縮。", "audioOnly": true, "questions": ["native-235-v2-audio"]},
  {"id": "native-235-v2-tone", "style": "tone", "label": "試衣回饋", "title": "說問題不責怪店員", "intro": "比較合適的試衣語氣。", "questions": ["native-235-v2-tone"]},
  {"id": "native-235-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友見你拉衣服", "intro": "解釋重複動作。", "questions": ["native-235-v2-continue"]},
  {"id": "native-235-v2-branch", "style": "branch", "label": "下一件試甚麼", "title": "選較長的版型", "intro": "根據上縮原因選擇。", "questions": ["native-235-v2-branch"]},
  {"id": "native-235-v2-speak", "style": "speak", "label": "口頭試衣", "title": "告訴店員困擾", "intro": "先說出上衣反覆上縮，再聽示範。", "model": "My shirt keeps riding up.", "zh": "我的上衣一直往上縮。", "speakingPrompt": "試穿時一抬手 T-shirt 就往上縮；口頭說「我的上衣一直往上縮」。", "recording": "phrase", "questions": []},
  {"id": "native-235-v2-scene", "style": "scene", "label": "新情境自評", "title": "換成裙子仍會上縮", "intro": "轉到「換成裙子仍會上縮」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-235-v2-scene"]}
];

export default {revision:2,summary:"用 riding up 描述 T-shirt 下擺活動時不停往上縮，並轉用於裙子。",steps,questions,takeaways:["My shirt keeps riding up.", "My skirt keeps riding up."],completionTitle:"你能說明衣服下擺一直往上跑，並挑選較合身衣服。"};
