import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-548-v2-audio","audio","洗手液瓶的哪個部分有問題？",["按壓出液的壓頭。", "瓶身印刷標籤。", "瓶底的容量刻度。", "瓶蓋外面的顏色。"],"按壓出液的壓頭。","pump 在這裏是可按壓的出液裝置，clogged 表示通道被堵。"),
  mc("native-548-v2-explain","explain","透明洗手液瓶還有半瓶，壓頭可上下活動卻沒有液體出來。哪個解釋較合理？",["壓頭通道可能堵住了。", "瓶子一定已空。", "洗手液因日期過期而看不見。", "壓頭根本無法按下。"],"壓頭通道可能堵住了。","瓶內仍有洗手液且壓頭可動，無輸出可能是通道堵塞，不能說瓶已空。"),
  mc("native-548-v2-scene","scene","你拆開乳液瓶壓頭，看見壓頭內部通道有乾固乳液堵住，出液口本身卻乾淨。哪句最精確？",["The pump is clogged.", "The spray nozzle is clogged.", "The zipper is stuck.", "The seal won’t close."],"The pump is clogged.","堵塞位置已確認在按壓機構內部，因此用 pump；不能只憑沒有乳液流出便斷定是外部噴嘴堵住。"),
  {id:"native-548-v2-continue",type:'open',style:"continue",prompt:"新情境：洗髮精瓶仍有很多洗髮精，壓頭能按但完全擠不出；室友問 What’s wrong with the bottle? 寫一兩句英文回答，並提出先做甚麼。",answers:["The pump is clogged, although there’s still shampoo inside. I’ll check the opening.", "Nothing comes out when I press it. The pump may be clogged, so I’ll clean it.", "There’s shampoo left, but the pump seems clogged. Let’s check the dispenser."],explanation:"回應壓頭可能堵塞的現象，並提出檢查或清理出液通道。"}
];

const steps=[
  {"id": "native-548-v2-audio", "style": "audio", "label": "先聽故障", "title": "哪部分堵住？", "intro": "先聽句子，再辨認可按的部件。", "model": "The pump is clogged.", "zh": "壓頭堵住了。", "audioOnly": true, "questions": ["native-548-v2-audio"]},
  {"id": "native-548-v2-explain", "style": "explain", "label": "區分原因", "title": "尚有洗手液", "intro": "根據瓶內剩餘量推理。", "questions": ["native-548-v2-explain"]},
  {"id": "native-548-v2-scene", "style": "scene", "label": "噴嘴或壓頭", "title": "按下去沒有出液", "intro": "分辨兩種容器的部件。", "questions": ["native-548-v2-scene"]},
  {"id": "native-548-v2-speak", "style": "speak", "label": "口頭報告", "title": "回覆瓶子故障", "intro": "面對按不出洗手液的瓶子，先說再聽示範。", "model": "The pump is clogged.", "zh": "壓頭堵住了。", "speakingPrompt": "瓶裏還有洗手液但壓頭堵住；向家人口說「壓頭堵住了」。", "recording": "phrase", "questions": []},
  {"id": "native-548-v2-continue", "style": "continue", "label": "新浴室自評", "title": "洗髮精壓頭", "intro": "自己寫故障線索和下一步。", "questions": ["native-548-v2-continue"]}
];

export default {revision:2,summary:"用 The pump is clogged. 描述洗手液壓頭能按下卻無產品流出，並與瓶子用完區分。",steps,questions,takeaways:["The pump is clogged.", "What’s wrong with the bottle?"],completionTitle:"你能描述壓頭堵塞的線索，並回答別人的詢問。"};
