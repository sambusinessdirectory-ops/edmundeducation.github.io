import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-439-v2-audio","audio","在公寓入口情境，訪客到達後應怎樣做？",["按住戶對講門鈴通知對方。", "直接敲住戶家門，不經大堂。", "給對方寄一封電子郵件。", "在街上不停鳴車笛。"],"按住戶對講門鈴通知對方。","buzz me 在公寓語境指用門鈴或對講機呼叫住戶，不是一般交通噪音。"),
  mc("native-439-v2-detail","detail","朋友說 Buzz me when you get here. I’ll buzz you in. 哪個分工正確？",["訪客先按對講機，住戶再遠端開大門。", "住戶先到街上按車喇叭，訪客再開門。", "訪客直接拿鑰匙開門，住戶不用理會。", "兩人都在住戶家門外按鈴。"],"訪客先按對講機，住戶再遠端開大門。","buzz me 是訪客呼叫住戶；buzz you in 是住戶用對講系統讓訪客進樓。"),
  mc("native-439-v2-scene","scene","公寓有主入口和側門，只有主入口有對講機。哪句給訪客最清楚？",["Use the main entrance and buzz me when you get here.", "Use either door; I’ll guess which one you chose.", "Wait by the side door; there’s no way to contact me.", "Buzz me now, even though you’re still on the train."],"Use the main entrance and buzz me when you get here.","把入口位置和到達後按對講機的時機說清，避免訪客在側門等。"),
  mc("native-439-v2-continue","continue","訪客在對講機說 I’m downstairs. 哪句適合住戶回應？",["Great, I’ll buzz you in now.", "Great, buzz me when you get home tomorrow.", "I’m downstairs too, so please mail me the keys.", "The door is locked, and I can’t help."],"Great, I’ll buzz you in now.","住戶知道訪客已到，下一步就是用對講系統開門讓他進來。"),
  {id:"native-439-v2-final",type:'open',style:"final",prompt:"新情境：外送員五分鐘後到，你住的大樓主入口有對講機。寫一兩句英文告訴他到達後怎樣聯絡你，並說你會替他開門。",answers:["Please buzz me when you get to the main entrance, and I’ll buzz you in.", "Buzz me at the main door when you arrive. I’ll let you into the building.", "When you get here, buzz my apartment. I’ll buzz you in."],explanation:"要指定抵達主入口後按對講機，並說明你會從住戶端開門。"}
];

const steps=[
  {"id": "native-439-v2-audio", "style": "audio", "label": "先聽指示", "title": "到達後做甚麼？", "intro": "先聽句子，再辨認動作。", "model": "Buzz me when you get here.", "zh": "你到了就按對講機通知我。", "audioOnly": true, "questions": ["native-439-v2-audio"]},
  {"id": "native-439-v2-detail", "style": "detail", "label": "兩句的角色", "title": "誰按鈴誰開門", "intro": "分清訪客與住戶。", "questions": ["native-439-v2-detail"]},
  {"id": "native-439-v2-scene", "style": "scene", "label": "地址補充", "title": "大樓有兩個入口", "intro": "說明對講位置。", "questions": ["native-439-v2-scene"]},
  {"id": "native-439-v2-continue", "style": "continue", "label": "回應訪客", "title": "對方已到大堂", "intro": "選住戶的自然下一句。", "questions": ["native-439-v2-continue"]},
  {"id": "native-439-v2-speak", "style": "speak", "label": "口頭安排", "title": "給訪客指示", "intro": "在「給訪客指示」情境先開口，然後聽錄音核對。", "model": "Buzz me when you get here.", "zh": "你到了就按對講機通知我。", "speakingPrompt": "朋友快到你的公寓；口說「你到了就按對講機通知我」。", "recording": "phrase", "questions": []},
  {"id": "native-439-v2-final", "style": "final", "label": "新公寓自評", "title": "外送到主入口", "intro": "自己寫時機和回應。", "questions": ["native-439-v2-final"]}
];

export default {revision:2,summary:"用 Buzz me when you get here. 請訪客到公寓入口時按對講門鈴，住戶再替他開門。",steps,questions,takeaways:["Buzz me when you get here.", "I’ll buzz you in."],completionTitle:"你能安排公寓入口聯絡方式，並告訴訪客你會開門。"};
