import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-227-v2-audio","audio","聽到這句，最可能是哪種情況？",["兩人約好見面，對方卻沒有到。", "對方準時到並提早離開。", "說話者臨時取消見面。", "兩人碰巧在街上偶遇。"],"兩人約好見面，對方卻沒有到。","stand someone up 指已約好見面，對方不來，留下自己空等。"),
  mc("native-227-v2-continue","continue","朋友問 How was dinner with Alex? 你在餐廳等了半小時，Alex 沒來也沒通知。哪句最貼切？",["We didn’t have dinner. He stood me up.", "It was great. He arrived early.", "I stood him up because I forgot.", "We bumped into each other by chance."],"We didn’t have dinner. He stood me up.","已約好卻獨自等候，stood me up 表達被對方放鴿子。"),
  mc("native-227-v2-detail","detail","哪項細節最支持 He stood me up，而不只是 He didn’t show up？",["兩人約好單獨見面，我到場等候，他沒來也沒通知。", "他缺席一場有二十人的公開講座。", "他事前傳訊息說要改天。", "他有到場，但提早離開了。"],"兩人約好單獨見面，我到場等候，他沒來也沒通知。","stood me up 強調對方失約，令約定見面的人空等。"),
  mc("native-227-v2-repair","repair","你到場等 Sam，但 Sam 沒來。哪句不會把責任說反？",["Sam stood me up.", "I stood Sam up.", "We both arrived on time.", "Sam and I called it off beforehand."],"Sam stood me up.","主語是失約者 Sam，受影響的人是 me；I stood Sam up 會變成你沒去。"),
  {id:"native-227-v2-final",type:'open',style:"final",prompt:"新的情境：你約 Chris 在展覽入口見面，等了四十分鐘，他沒出現也沒傳訊息。寫一兩句英文向朋友交代。",answers:["Chris stood me up. I waited at the entrance for forty minutes.", "I waited outside the exhibition for forty minutes, but Chris stood me up.", "Chris didn’t show up or text me, so I think he stood me up."],explanation:"stood me up 說明約定見面後被放鴿子；補上等待與無通知的細節。"}
];

const steps=[
  {"id": "native-227-v2-audio", "style": "audio", "label": "先聽結果", "title": "約會怎樣了？", "intro": "先聽句子，再判斷說話者經歷。", "model": "He stood me up.", "zh": "他放我鴿子。", "audioOnly": true, "questions": ["native-227-v2-audio"]},
  {"id": "native-227-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友問晚餐", "intro": "回應沒成行的約會。", "questions": ["native-227-v2-continue"]},
  {"id": "native-227-v2-detail", "style": "detail", "label": "判斷關鍵", "title": "為何是放鴿子？", "intro": "辨認約定與等待。", "questions": ["native-227-v2-detail"]},
  {"id": "native-227-v2-speak", "style": "speak", "label": "口頭交代", "title": "朋友問人到了嗎", "intro": "先說出被放鴿子的結果，再聽示範。", "model": "He stood me up.", "zh": "他放我鴿子。", "speakingPrompt": "你赴約等人，但他一直沒來；口頭向朋友說「他放我鴿子」。", "recording": "phrase", "questions": []},
  {"id": "native-227-v2-repair", "style": "repair", "label": "修正主語", "title": "誰失約？", "intro": "釐清動作方向。", "questions": ["native-227-v2-repair"]},
  {"id": "native-227-v2-final", "style": "final", "label": "新約會自寫", "title": "展覽入口等候", "intro": "自己寫經過和結果，再對照示例。", "questions": ["native-227-v2-final"]}
];

export default {revision:2,summary:"用 stood me up 描述約好見面卻被對方無通知地放鴿子。",steps,questions,takeaways:["He stood me up.", "He didn’t show up."],completionTitle:"你能區分一般沒到場與約會被放鴿子，並說明自己等待的經過。"};
