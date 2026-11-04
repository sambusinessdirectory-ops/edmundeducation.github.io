import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-202-v2-audio","audio","聽到這句，蘋果的口感最可能怎樣？",["粉沙偏乾。", "清脆多汁。", "果肉柔軟而多汁。", "果肉很軟卻仍多汁。"],"粉沙偏乾。","mealy 指粉粉、沙沙、欠爽脆的質地；這種蘋果果肉粉沙偏乾、失去清脆咬感，所以用 mealy。"),
  mc("native-202-v2-rewrite","rewrite","蘋果咬下去粉粉沙沙、沒有脆度。哪句最貼切？",["The apple is mealy.", "The apple is crisp.", "The apple is juicy.", "The apple is frozen."],"The apple is mealy.","mealy 描述粉沙、偏乾的質地，與 crisp 相反。"),
  mc("native-202-v2-explain","explain","有人說 This apple is mealy. 他最可能不喜歡哪一點？",["果肉粉沙、不爽脆。", "蘋果太甜，但質地正常。", "果皮有碰撞留下的瘀痕。", "味道偏酸但口感仍脆。"],"果肉粉沙、不爽脆。","mealy 是口感描述，並不直接說顏色或形狀。"),
  mc("native-202-v2-branch","branch","朋友說 This apple is really mealy. 你想確認質地，哪句合適？",["Is it not crisp anymore?", "Is it too tart?", "Is the skin bruised?", "Is it too sweet for you?"],"Is it not crisp anymore?","mealy 和 crisp 相對；問脆度能接上對方的口感描述。"),
  {id:"native-202-v2-transfer",type:'open',style:"transfer",prompt:"新的情境：你咬一口放了幾天的梨，果肉粉沙、偏乾，不再爽脆。寫一兩句英文向朋友描述口感，並說你想換一個。",answers:["This pear is mealy and not very crisp. I’d like to try another one.", "The pear tastes mealy and dry. Can I have a fresher one?"],explanation:"mealy 可轉用於梨的粉沙口感；補上不爽脆及想換的要求。"}
];

const steps=[
  {"id": "native-202-v2-audio", "style": "audio", "label": "先聽質地", "title": "它脆嗎？", "intro": "先聽句子再選口感。", "model": "The apple is mealy.", "zh": "蘋果粉粉沙沙。", "audioOnly": true, "questions": ["native-202-v2-audio"]},
  {"id": "native-202-v2-rewrite", "style": "rewrite", "label": "精確描述", "title": "不是單純不甜", "intro": "把口感說具體。", "questions": ["native-202-v2-rewrite"]},
  {"id": "native-202-v2-explain", "style": "explain", "label": "說明原因", "title": "為何不喜歡它？", "intro": "由質地判斷形容詞。", "questions": ["native-202-v2-explain"]},
  {"id": "native-202-v2-branch", "style": "branch", "label": "對話回應", "title": "要不要再拿一個？", "intro": "根據對方的評價選回應。", "questions": ["native-202-v2-branch"]},
  {"id": "native-202-v2-speak", "style": "speak", "label": "口頭評價", "title": "咬了一口蘋果", "intro": "先試着說出「蘋果吃起來粉粉沙沙。」，再聽示範。", "model": "The apple is mealy.", "zh": "蘋果吃起來粉粉沙沙。", "speakingPrompt": "你咬一口蘋果，覺得粉沙、不脆；口頭告訴朋友。", "recording": "phrase", "questions": []},
  {"id": "native-202-v2-transfer", "style": "transfer", "label": "新情境自評", "title": "梨子也有粉沙口感", "intro": "轉到「梨子也有粉沙口感」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-202-v2-transfer"]}
];

export default {revision:2,summary:"用 mealy 描述蘋果粉沙、偏乾而不脆的口感。",steps,questions,takeaways:["The apple is mealy.", "This apple is mealy."],completionTitle:"你能區分蘋果的粉沙口感與爽脆口感。"};
