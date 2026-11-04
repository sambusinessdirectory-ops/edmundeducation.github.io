import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-183-v2-audio","audio","聽到這個詞組，最合理的下一步是甚麼？",["通知參加者活動不會舉行。", "通知大家活動提早開始。", "等到一小時後照常開始。", "叫大家現在到場。"],"通知參加者活動不會舉行。","call it off 表示取消，所以參加者需要知道不必到場。"),
  mc("native-183-v2-contrast","contrast","野餐因暴雨不辦了，也沒有新日期。哪句最符合？",["We had to call it off.", "We pushed it back an hour.", "We moved it up to noon.", "We went ahead with it."],"We had to call it off.","call it off 是取消計劃；延後或提前都仍打算舉行。"),
  mc("native-183-v2-reverse","reverse","活動原本已排好，現在主辦方決定完全不舉行。哪個詞組最貼切？",["call it off", "push it back", "move it up", "show up"],"call it off","call off 已安排的活動，就是取消；這個詞組表示原定安排不再舉行，和改到另一時間不同。"),
  {id:"native-183-v2-final",type:'open',style:"final",prompt:"新的情境：你辦的戶外電影夜因雷雨無法舉行。寫一句英文訊息，告知朋友活動取消並說出原因。",answers:["We have to call off the outdoor movie night because of the storm.", "I'm sorry, but we're calling off movie night because of the thunderstorms.", "The outdoor movie night is called off because of the weather."],explanation:"用 call off 表示活動不舉行，再補上雷雨原因；不要讓人以為只是延後一小時。"}
];

const steps=[
  {"id": "native-183-v2-audio", "style": "audio", "label": "只聽關鍵字", "title": "聽出最後決定", "intro": "先聽，不看英文文字。", "model": "call it off", "zh": "取消它。", "audioOnly": true, "questions": ["native-183-v2-audio"]},
  {"id": "native-183-v2-contrast", "style": "contrast", "label": "取消或改期", "title": "計劃還會進行嗎？", "intro": "比較取消與延後。", "questions": ["native-183-v2-contrast"]},
  {"id": "native-183-v2-reverse", "style": "reverse", "label": "意思反推", "title": "選出取消的說法", "intro": "從結果找對動詞。", "questions": ["native-183-v2-reverse"]},
  {"id": "native-183-v2-speak", "style": "speak", "label": "口頭告知", "title": "先說給朋友聽", "intro": "先自己口說；錄音或跳過後再聽示範。", "model": "call it off", "zh": "取消活動。", "speakingPrompt": "原定今天的戶外聚會因下雨取消。先口頭說出「取消活動」這個關鍵詞組。", "recording": "phrase", "questions": []},
  {"id": "native-183-v2-final", "style": "final", "label": "通知參加者", "title": "因天氣取消", "intro": "在新的活動情境自己寫通知。", "questions": ["native-183-v2-final"]}
];

export default {revision:2,summary:"用 call it off 表示決定取消已安排的活動，並分清取消與改期。",steps,questions,takeaways:["call it off", "They called off the meeting."],completionTitle:"你能聽出活動是取消了，並在新情境交代取消原因。"};
