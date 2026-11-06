import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-547-v2-audio","audio","哪個部件最可能需要檢查？",["噴霧瓶最前端的小噴口。", "瓶身外側的標籤。", "瓶底的有效日期。", "瓶蓋的顏色。"],"噴霧瓶最前端的小噴口。","nozzle 是液體噴出的口；clogged 表示該處被堵住。"),
  mc("native-547-v2-detail","detail","透明噴霧瓶裏仍有清潔液，扳機可按，但噴口沒有液體出來。哪句較有根據？",["The nozzle may be clogged.", "The bottle must be empty.", "The label has expired.", "The liquid has turned solid everywhere."],"The nozzle may be clogged.","瓶內仍有液體而噴口無輸出，噴嘴堵塞是合理可能；但仍用 may 避免武斷。"),
  mc("native-547-v2-branch","branch","噴霧瓶按了幾次都噴不出，瓶裏仍有水。哪個做法先試最合理？",["檢查噴嘴是否堵住，按產品指引清理。", "繼續朝臉按壓，近距離查看出水。", "把整瓶液體倒進電器插座。", "只更換瓶身標籤，不看噴頭。"],"檢查噴嘴是否堵住，按產品指引清理。","先檢查液體出口是否阻塞，能針對症狀；清理方式應依產品指引。"),
  {id:"native-547-v2-final",type:'open',style:"final",prompt:"新情境：澆花噴瓶裏有水，扳機也能按，但花園裏怎樣按都沒有水霧。寫一兩句英文告訴家人可能的問題，並請他幫忙檢查噴嘴。",answers:["Nothing's coming out, though the bottle has water. The nozzle may be clogged; could you check it?", "The spray bottle still has water, but it won’t spray. Can you see whether the nozzle is clogged?", "I think the nozzle is clogged because no water comes out. Could you help me clean it?"],explanation:"交代瓶內有水但無噴霧，再以可能堵塞的噴嘴作具體檢查請求。"}
];

const steps=[
  {"id": "native-547-v2-audio", "style": "audio", "label": "先聽部件", "title": "堵在哪裏？", "intro": "先聽句子，定位出液端。", "model": "The nozzle is clogged.", "zh": "噴嘴堵住了。", "audioOnly": true, "questions": ["native-547-v2-audio"]},
  {"id": "native-547-v2-detail", "style": "detail", "label": "噴口與空瓶", "title": "瓶裏還有液體", "intro": "用可見線索推斷。", "questions": ["native-547-v2-detail"]},
  {"id": "native-547-v2-branch", "style": "branch", "label": "排查順序", "title": "先檢查噴頭", "intro": "選安全而直接的下一步。", "questions": ["native-547-v2-branch"]},
  {"id": "native-547-v2-speak", "style": "speak", "label": "口頭說明", "title": "請同伴看噴嘴", "intro": "看到按壓卻不出液，先說再聽示範。", "model": "The nozzle is clogged.", "zh": "噴嘴堵住了。", "speakingPrompt": "你確定噴嘴被堵住；向同伴口說「噴嘴堵住了」。", "recording": "phrase", "questions": []},
  {"id": "native-547-v2-final", "style": "final", "label": "新花園自評", "title": "澆花噴瓶", "intro": "自己寫現象和檢查請求。", "questions": ["native-547-v2-final"]}
];

export default {revision:2,summary:"用 The nozzle is clogged. 指出噴霧瓶噴嘴阻塞，即使按壓也沒有噴出液體。",steps,questions,takeaways:["The nozzle is clogged.", "Nothing's coming out."],completionTitle:"你能辨認噴嘴堵塞，並提出清潔或檢查步驟。"};
